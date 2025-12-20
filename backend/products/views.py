# backend/products/views.py
# ============================================================================
# Products ViewSets (Server-Driven Tables)
# ----------------------------------------------------------------------------
# Enforces canonical list contract:
# - ?q= free-text search (QueryParamSearchFilter)
# - ?ordering= server-side ordering (asc/desc)
# - ?page= / ?page_size= pagination (DRF settings)
#
# Adds backend-authoritative filters for presets:
# - Product templates: ?is_active=0|1, ?default_workflow=<id>
# - Promotions: ?channel=..., ?status=..., ?project=<id>
#
# Tenant safety:
# - Always scoped to request.user's shop via get_shop_for_user()
#
# Note:
# - Read-only viewsets for now (no destructive actions).
# ============================================================================

from typing import Optional

from rest_framework import viewsets
from rest_framework.filters import OrderingFilter

from accounts.utils import get_shop_for_user
from makerfex_backend.filters import QueryParamSearchFilter

from .models import ProductTemplate, ProjectPromotion
from .serializers import ProductTemplateSerializer, ProjectPromotionSerializer


def _parse_bool(v: Optional[str]) -> Optional[bool]:
    if v is None:
        return None
    s = v.strip().lower()
    if s in {"1", "true", "t", "yes", "y", "on"}:
        return True
    if s in {"0", "false", "f", "no", "n", "off"}:
        return False
    return None


class ProductTemplateViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ProductTemplateSerializer
    queryset = ProductTemplate.objects.all()  # DRF requires; tenant scoping in get_queryset

    filter_backends = [QueryParamSearchFilter, OrderingFilter]
    search_fields = ["name", "slug", "description"]
    ordering_fields = [
        "name",
        "slug",
        "base_price",
        "estimated_hours",
        "is_active",
        "created_at",
        "updated_at",
    ]
    ordering = ["name"]

    def get_queryset(self):
        shop = get_shop_for_user(self.request.user)
        if not shop:
            return ProductTemplate.objects.none()

        qs = ProductTemplate.objects.filter(shop=shop)

        qp = self.request.query_params

        is_active = _parse_bool(qp.get("is_active"))
        if is_active is not None:
            qs = qs.filter(is_active=is_active)

        default_workflow = qp.get("default_workflow")
        if default_workflow:
            try:
                qs = qs.filter(default_workflow_id=int(default_workflow))
            except (TypeError, ValueError):
                pass

        return qs


class ProjectPromotionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ProjectPromotionSerializer
    queryset = ProjectPromotion.objects.all()  # DRF requires; tenant scoping in get_queryset

    filter_backends = [QueryParamSearchFilter, OrderingFilter]
    search_fields = ["title", "channel", "status", "link_url", "notes"]
    ordering_fields = [
        "channel",
        "status",
        "started_at",
        "ended_at",
        "created_at",
        "updated_at",
    ]
    ordering = ["-created_at"]

    def get_queryset(self):
        shop = get_shop_for_user(self.request.user)
        if not shop:
            return ProjectPromotion.objects.none()

        qs = ProjectPromotion.objects.filter(project__shop=shop)

        qp = self.request.query_params

        channel = qp.get("channel")
        if channel:
            qs = qs.filter(channel=channel)

        status = qp.get("status")
        if status:
            qs = qs.filter(status=status)

        project = qp.get("project")
        if project:
            try:
                qs = qs.filter(project_id=int(project))
            except (TypeError, ValueError):
                pass

        return qs
