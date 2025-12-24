# backend/projects/views.py
# ============================================================================
# Projects ViewSet (Server-Driven Tables)
# ----------------------------------------------------------------------------
# Adds:
# - Immutable BOM snapshots are prefetched and serialized on detail.
# - Stage transitions remain explicit via /transition/.
# - Inventory usage logging is done via inventory consume endpoint
#   (project_id + bom_snapshot provenance).
# ============================================================================

from django.db import transaction
from django.db.models import BooleanField, Case, Q, Value, When
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.filters import OrderingFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.models import Employee
from accounts.utils import get_shop_for_user
from makerfex_backend.filters import QueryParamSearchFilter, parse_bool
from makerfex_backend.mixins import ServerTableViewSetMixin, ShopScopedQuerysetMixin
from products.models import ProductTemplate
from projects.models import (
    Project,
    ProjectConsumableSnapshot,
    ProjectEquipmentSnapshot,
    ProjectMaterialSnapshot,
)
from projects.serializers import ProjectSerializer
from workflows.models import WorkflowStage


class ProjectViewSet(ServerTableViewSetMixin, ShopScopedQuerysetMixin, viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ProjectSerializer
    queryset = Project.objects.none()

    filter_backends = [QueryParamSearchFilter, OrderingFilter]
    search_fields = [
        "name",
        "reference_code",
        "description",
        "customer__first_name",
        "customer__last_name",
        "customer__company_name",
    ]
    ordering_fields = [
        "name",
        "reference_code",
        "priority",
        "status",
        "start_date",
        "due_date",
        "completed_at",
        "created_at",
        "updated_at",
        "station__name",
        "customer__last_name",
        "assigned_to__last_name",
        "current_stage__order",
        "current_stage__name",
    ]
    ordering = ["-created_at"]

    def _get_first_stage(self, workflow_id):
        if not workflow_id:
            return None
        return (
            WorkflowStage.objects.filter(workflow_id=workflow_id, is_active=True)
            .order_by("order", "id")
            .first()
        )

    def get_shop(self):
        return get_shop_for_user(self.request.user)

    def get_employee(self, shop):
        if not shop:
            return None
        return Employee.objects.filter(shop=shop, user=self.request.user).first()

    def get_shop_queryset(self, shop):
        qs = (
            Project.objects.filter(shop=shop, is_archived=False)
            .select_related("customer", "assigned_to", "workflow", "current_stage", "station")
            .prefetch_related(
                "material_snapshots",
                "consumable_snapshots",
                "equipment_snapshots",
            )
            .annotate(
                is_completed=Case(
                    When(current_stage__is_final=True, then=Value(True)),
                    default=Value(False),
                    output_field=BooleanField(),
                )
            )
        )

        qp = self.request.query_params

        customer_id = qp.get("customer") or qp.get("customer_id")
        if customer_id:
            qs = qs.filter(customer_id=customer_id)

        assigned_to_id = qp.get("assigned_to") or qp.get("assigned_to_id")
        if assigned_to_id:
            qs = qs.filter(assigned_to_id=assigned_to_id)

        stage_id = qp.get("current_stage") or qp.get("stage")
        if stage_id:
            qs = qs.filter(current_stage_id=stage_id)

        station_id = qp.get("station") or qp.get("station_id")
        if station_id:
            qs = qs.filter(Q(station_id=station_id) | Q(assigned_to__stations__id=station_id)).distinct()

        status_value = qp.get("status")
        if status_value:
            qs = qs.filter(status=status_value)

        is_completed = parse_bool(qp.get("is_completed"))
        if is_completed is True:
            qs = qs.filter(current_stage__is_final=True)
        elif is_completed is False:
            qs = qs.exclude(current_stage__is_final=True)

        vip = parse_bool(qp.get("vip"))
        if vip is True:
            try:
                qs = qs.filter(customer__is_vip=True)
            except Exception:
                pass

        overdue = parse_bool(qp.get("overdue"))
        if overdue is True:
            today = timezone.localdate()
            qs = qs.filter(due_date__lt=today).exclude(
                status__in=[Project.Status.COMPLETED, Project.Status.CANCELLED]
            )

        return qs

    def perform_create(self, serializer):
        shop = self.get_shop()
        if not shop:
            raise ValidationError({"detail": "Current user has no shop configured."})
        emp = self.get_employee(shop)
        project = serializer.save(shop=shop, created_by=emp)

        if project.workflow_id and not project.current_stage_id:
            first_stage = self._get_first_stage(project.workflow_id)
            if first_stage:
                project.current_stage = first_stage
                project.save(update_fields=["current_stage"])

        return project

    @action(detail=False, methods=["post"], url_path="create_from_template")
    def create_from_template(self, request):
        shop = self.get_shop()
        if not shop:
            raise ValidationError({"detail": "Current user has no shop configured."})

        template_id = request.data.get("product_template_id")
        if not template_id:
            raise ValidationError({"product_template_id": "This field is required."})

        try:
            template = ProductTemplate.objects.select_related("default_workflow").get(id=template_id, shop=shop)
        except ProductTemplate.DoesNotExist:
            raise ValidationError({"product_template_id": "Invalid template."})

        if not getattr(template, "is_active", True):
            raise ValidationError({"product_template_id": "Template is inactive."})

        name = (request.data.get("name") or "").strip() or template.name

        data = {
            "name": name,
            "product_template": template.id,
            "workflow": template.default_workflow_id,
            "estimated_hours": template.estimated_hours,
        }

        with transaction.atomic():
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            project = self.perform_create(serializer)

            # Snapshot template requirements -> project snapshots
            for req in template.material_requirements.all():
                ProjectMaterialSnapshot.objects.create(
                    project=project,
                    source_template=template,
                    material=req.material,
                    material_name=req.material.name,
                    quantity=req.quantity,
                    unit=req.unit,
                    unit_cost_snapshot=req.material.unit_cost,
                    notes=req.notes,
                )
            for req in template.consumable_requirements.all():
                ProjectConsumableSnapshot.objects.create(
                    project=project,
                    source_template=template,
                    consumable=req.consumable,
                    consumable_name=req.consumable.name,
                    quantity=req.quantity,
                    unit=req.unit,
                    unit_cost_snapshot=req.consumable.unit_cost,
                    notes=req.notes,
                )
            for req in template.equipment_requirements.all():
                ProjectEquipmentSnapshot.objects.create(
                    project=project,
                    source_template=template,
                    equipment=req.equipment,
                    equipment_name=req.equipment.name,
                    quantity=req.quantity,
                    unit=req.unit,
                    unit_cost_snapshot=req.equipment.unit_cost,
                    notes=req.notes,
                )

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        """
        No destructive deletes: archive.
        """
        project = self.get_object()
        if not getattr(project, "is_archived", False):
            project.is_archived = True
            project.save(update_fields=["is_archived"])

        data = self.get_serializer(project).data
        return Response(
            {
                "detail": "Project cannot be deleted; it was archived instead.",
                "archived": True,
                "project": data,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"], url_path="transition")
    def transition(self, request, pk=None):
        """
        Explicit stage transition action.

        POST /api/projects/{id}/transition/
        Body: { "to_stage_id": 123, "force": true|false }
        """
        project = self.get_object()
        to_stage_id = request.data.get("to_stage_id")
        force = parse_bool(request.data.get("force")) is True

        if not to_stage_id:
            raise ValidationError({"to_stage_id": "This field is required."})

        if project.is_archived:
            raise ValidationError({"detail": "Archived projects cannot transition stages."})

        if project.status == Project.Status.CANCELLED:
            raise ValidationError({"detail": "Cancelled projects cannot transition stages."})

        if project.status == Project.Status.ON_HOLD and not force:
            raise ValidationError({"detail": "On-hold projects cannot transition stages without force=true."})

        if project.status == Project.Status.COMPLETED and not force:
            raise ValidationError({"detail": "Completed projects cannot transition stages without force=true."})

        if not project.workflow_id:
            raise ValidationError({"detail": "Project has no workflow assigned."})

        try:
            to_stage = WorkflowStage.objects.get(
                id=to_stage_id,
                workflow_id=project.workflow_id,
                is_active=True,
            )
        except WorkflowStage.DoesNotExist:
            raise ValidationError({"to_stage_id": "Invalid stage for this workflow (or inactive)."})

        now = timezone.now()

        with transaction.atomic():
            project.current_stage = to_stage

            if to_stage.is_final:
                if project.status != Project.Status.COMPLETED:
                    project.status = Project.Status.COMPLETED
                if not project.completed_at:
                    project.completed_at = now
            else:
                if project.status == Project.Status.COMPLETED:
                    project.status = Project.Status.ACTIVE
                    project.completed_at = None

            project.save(update_fields=["current_stage", "status", "completed_at", "updated_at"])

        data = self.get_serializer(project).data
        return Response({"detail": "Stage transitioned.", "project": data}, status=status.HTTP_200_OK)
