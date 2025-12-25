# backend/sales/views.py

from decimal import Decimal
from django.core.exceptions import FieldError
from django.db import transaction
from django.utils import timezone
from django.utils.text import slugify

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.utils import get_shop_for_user
from makerfex_backend.filters import QueryParamSearchFilter
from makerfex_backend.mixins import ShopScopedQuerysetMixin, ServerTableViewSetMixin

from projects.models import Project
from products.models import (
    ProductTemplate,
    ProductTemplateMaterialRequirement,
    ProductTemplateConsumableRequirement,
    ProductTemplateEquipmentRequirement,
)

from .models import SalesOrder, SalesOrderLine
from .serializers import SalesOrderSerializer, SalesOrderLineSerializer, LogSaleFromProjectSerializer


def _try_scope_to_shop(qs, shop, candidate_filters):
    """Try a sequence of queryset filters until one works."""
    for kwargs in candidate_filters:
        try:
            return qs.filter(**kwargs)
        except FieldError:
            continue
    return qs.none()


def _unique_template_slug(shop_id: int, base: str) -> str:
    """
    Generate a unique slug per (shop, slug) uniqueness rule.
    """
    base = slugify(base)[:120] or "template"
    slug = base
    i = 2
    while ProductTemplate.objects.filter(shop_id=shop_id, slug=slug).exists():
        suffix = f"-{i}"
        slug = (base[: (120 - len(suffix))] + suffix) if len(base) + len(suffix) > 120 else base + suffix
        i += 1
    return slug


def _create_template_from_project(shop, project: Project, name: str, base_price: Decimal | None):
    """
    Create a new ProductTemplate derived from Project BOM snapshots.
    Requirement rows require a live inventory FK, so we only copy snapshots
    where the FK still exists.
    """
    tmpl = ProductTemplate.objects.create(
        shop=shop,
        name=name.strip(),
        slug=_unique_template_slug(shop.id, name),
        description=(project.description or "").strip(),
        base_price=base_price,
        estimated_hours=project.estimated_hours,
        default_workflow=project.workflow,
        is_active=True,
    )

    # Copy requirements from snapshots (FKs are required on requirement models)
    sort_order = 0
    for s in project.material_snapshots.all().order_by("id"):
        if not s.material_id:
            continue
        ProductTemplateMaterialRequirement.objects.create(
            template=tmpl,
            material_id=s.material_id,
            quantity=s.quantity,
            unit=s.unit,
            notes=s.notes or "",
            sort_order=sort_order,
        )
        sort_order += 1

    sort_order = 0
    for s in project.consumable_snapshots.all().order_by("id"):
        if not s.consumable_id:
            continue
        ProductTemplateConsumableRequirement.objects.create(
            template=tmpl,
            consumable_id=s.consumable_id,
            quantity=s.quantity,
            unit=s.unit,
            notes=s.notes or "",
            sort_order=sort_order,
        )
        sort_order += 1

    sort_order = 0
    for s in project.equipment_snapshots.all().order_by("id"):
        if not s.equipment_id:
            continue
        ProductTemplateEquipmentRequirement.objects.create(
            template=tmpl,
            equipment_id=s.equipment_id,
            quantity=s.quantity,
            unit=s.unit,
            notes=s.notes or "",
            sort_order=sort_order,
        )
        sort_order += 1

    return tmpl


class SalesOrderViewSet(ServerTableViewSetMixin, ShopScopedQuerysetMixin, viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = SalesOrderSerializer
    queryset = SalesOrder.objects.none()

    filter_backends = [QueryParamSearchFilter, OrderingFilter]
    search_fields = ["id"]
    ordering_fields = ["id"]
    ordering = ("-id",)

    def get_shop_queryset(self, shop):
        base = SalesOrder.objects.all()
        return _try_scope_to_shop(
            base,
            shop,
            candidate_filters=[
                {"shop": shop},
                {"shop_id": shop.id},
                {"customer__shop": shop},
                {"customer__shop_id": shop.id},
                {"project__shop": shop},
                {"project__shop_id": shop.id},
            ],
        )

    @action(detail=False, methods=["post"], url_path="log_from_project")
    def log_from_project(self, request):
        """
        Create a SalesOrder + single SalesOrderLine from a completed project,
        then archive the project (default) to freeze it.
        Optionally: create a new ProductTemplate derived from BOM snapshots.
        """
        shop = get_shop_for_user(request.user)
        if not shop:
            return Response({"detail": "Current user has no shop configured."}, status=status.HTTP_400_BAD_REQUEST)

        payload = LogSaleFromProjectSerializer(data=request.data)
        payload.is_valid(raise_exception=True)
        v = payload.validated_data

        project_id = v["project_id"]
        total_amount: Decimal = v["total_amount"]
        order_date = v.get("order_date") or timezone.localdate()
        notes = v.get("notes", "")
        source = v.get("source", SalesOrder.Source.OTHER)
        archive_project = v.get("archive_project", True)

        create_template = v.get("create_product_template", False)
        new_template_name = (v.get("new_template_name") or "").strip()

        # Tenant-safe project fetch
        try:
            project = Project.objects.select_related("customer", "workflow", "current_stage").get(
                id=project_id,
                shop=shop,
            )
        except Project.DoesNotExist:
            return Response({"detail": "Project not found."}, status=status.HTTP_404_NOT_FOUND)

        # Eligibility: stage must allow sale logging (same rule exposed to frontend)
        st = getattr(project, "current_stage", None)
        if not (st and getattr(st, "allows_sale_log", False)):
            return Response(
                {"detail": "This project is not eligible for sale logging at its current stage."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            # Create SalesOrder
            order = SalesOrder.objects.create(
                shop=shop,
                customer=project.customer,
                project=project,
                status=SalesOrder.Status.OPEN,
                source=source,
                order_date=order_date,
                subtotal_amount=total_amount,
                tax_amount=Decimal("0.00"),
                total_amount=total_amount,
                notes=notes or "",
            )

            # Optional template creation (always new)
            new_template = None
            if create_template:
                new_template = _create_template_from_project(
                    shop=shop,
                    project=project,
                    name=new_template_name,
                    base_price=total_amount,
                )
                # Optionally attach back to project as its final template
                project.product_template = new_template

            # Create one line item (invoice-ish)
            line_total = total_amount
            line = SalesOrderLine.objects.create(
                order=order,
                project=project,
                product_template=new_template if new_template else None,
                description=project.name,
                quantity=Decimal("1.00"),
                unit_price=total_amount,
                line_total=line_total,
            )

            # Mark project completed (if not already)
            if project.status != Project.Status.COMPLETED:
                project.status = Project.Status.COMPLETED
            if not project.completed_at:
                project.completed_at = timezone.now()

            # Archive by default to freeze
            if archive_project:
                project.is_archived = True

            project.save()

        return Response(SalesOrderSerializer(order, context={"request": request}).data, status=status.HTTP_201_CREATED)


class SalesOrderLineViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = SalesOrderLineSerializer
    queryset = SalesOrderLine.objects.none()

    filter_backends = [QueryParamSearchFilter, OrderingFilter]
    search_fields = ["id"]
    ordering_fields = ["id"]
    ordering = ("-id",)

    def get_queryset(self):
        shop = get_shop_for_user(self.request.user)
        if not shop:
            return SalesOrderLine.objects.none()

        base = SalesOrderLine.objects.all()
        return _try_scope_to_shop(
            base,
            shop,
            candidate_filters=[
                {"shop": shop},
                {"shop_id": shop.id},
                {"order__shop": shop},
                {"order__shop_id": shop.id},
                {"order__customer__shop": shop},
                {"order__customer__shop_id": shop.id},
                {"order__project__shop": shop},
                {"order__project__shop_id": shop.id},
            ],
        )
