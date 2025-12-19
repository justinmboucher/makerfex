# backend/workflows/views.py

from rest_framework import viewsets
from rest_framework.filters import OrderingFilter
from rest_framework.permissions import IsAuthenticated

from accounts.utils import get_shop_for_user
from makerfex_backend.filters import QueryParamSearchFilter

from .models import Workflow, WorkflowStage
from .serializers import WorkflowSerializer, WorkflowStageSerializer


def parse_bool(val):
    if val is None:
        return None
    v = str(val).strip().lower()
    if v in ("1", "true", "t", "yes", "y", "on"):
        return True
    if v in ("0", "false", "f", "no", "n", "off"):
        return False
    return None


class WorkflowViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = WorkflowSerializer
    http_method_names = ["get", "post", "put", "patch", "head", "options"]

    filter_backends = [QueryParamSearchFilter, OrderingFilter]
    search_fields = ["name", "description"]
    ordering_fields = ["id", "name", "is_default", "is_active", "created_at", "updated_at"]
    ordering = ("name", "id")

    def get_queryset(self):
        shop = get_shop_for_user(self.request.user)
        if not shop:
            return Workflow.objects.none()

        qs = Workflow.objects.filter(shop=shop).select_related("shop", "created_by")

        is_active = parse_bool(self.request.query_params.get("is_active"))
        if is_active is not None:
            qs = qs.filter(is_active=is_active)

        is_default = parse_bool(self.request.query_params.get("is_default"))
        if is_default is not None:
            qs = qs.filter(is_default=is_default)

        return qs

    def perform_create(self, serializer):
        shop = get_shop_for_user(self.request.user)
        created_by = getattr(self.request.user, "employee", None)
        serializer.save(shop=shop, created_by=created_by)


class WorkflowStageViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = WorkflowStageSerializer
    http_method_names = ["get", "post", "put", "patch", "head", "options"]

    filter_backends = [QueryParamSearchFilter, OrderingFilter]
    search_fields = ["name", "workflow__name"]
    ordering_fields = ["id", "name", "order", "is_initial", "is_final", "wip_limit", "is_active", "created_at", "updated_at"]
    ordering = ("workflow_id", "order", "id")

    def get_queryset(self):
        shop = get_shop_for_user(self.request.user)
        if not shop:
            return WorkflowStage.objects.none()

        qs = (
            WorkflowStage.objects
            .filter(workflow__shop=shop)
            .select_related("workflow")
        )

        workflow = self.request.query_params.get("workflow")
        if workflow:
            qs = qs.filter(workflow_id=workflow)

        is_active = parse_bool(self.request.query_params.get("is_active"))
        if is_active is not None:
            qs = qs.filter(is_active=is_active)

        return qs

    def perform_create(self, serializer):
        # The workflow determines the tenant boundary. DRF will validate workflow FK exists,
        # but we must ensure it belongs to the user's shop.
        shop = get_shop_for_user(self.request.user)
        workflow = serializer.validated_data.get("workflow")
        if not workflow or workflow.shop_id != shop.id:
            raise PermissionError("Cannot create stage for a workflow outside your shop.")
        serializer.save()
