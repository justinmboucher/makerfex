# backend/workflows/views.py

from rest_framework import viewsets
from rest_framework.filters import OrderingFilter
from rest_framework.permissions import IsAuthenticated

from accounts.utils import get_shop_for_user
from accounts.models import Employee
from makerfex_backend.filters import QueryParamSearchFilter, parse_bool
from makerfex_backend.mixins import ShopScopedQuerysetMixin, ServerTableViewSetMixin

from .models import Workflow, WorkflowStage
from .serializers import WorkflowSerializer, WorkflowStageSerializer

class ShopScopedMixin:
    permission_classes = [IsAuthenticated]

    def get_shop(self):
        return get_shop_for_user(self.request.user)

    def get_employee(self, shop):
        if not shop:
            return None
        return Employee.objects.filter(shop=shop, user=self.request.user).first()


class WorkflowViewSet(ServerTableViewSetMixin, ShopScopedQuerysetMixin, viewsets.ModelViewSet):
    serializer_class = WorkflowSerializer
    queryset = Workflow.objects.none()
    http_method_names = ["get", "post", "put", "patch", "head", "options"]

    filter_backends = [QueryParamSearchFilter, OrderingFilter]
    search_fields = ["name", "description"]
    ordering_fields = ["id", "name", "is_default", "is_active", "created_at", "updated_at"]
    ordering = ("name", "id")

    def get_queryset(self, shop):
        qs = Workflow.objects.filter(shop=shop)

        is_active = parse_bool(self.request.query_params.get("is_active"))
        if is_active is not None:
            qs = qs.filter(is_active=is_active)

        is_default = parse_bool(self.request.query_params.get("is_default"))
        if is_default is not None:
            qs = qs.filter(is_default=is_default)

        return qs

    def perform_create(self, serializer):
        shop = self.get_shop()
        if not shop:
            raise ValueError("Current user has no shop configured.")
        emp = self.get_employee(shop)
        serializer.save(shop=shop, created_by=emp)


class WorkflowStageViewSet(ServerTableViewSetMixin, ShopScopedQuerysetMixin, viewsets.ModelViewSet):
    serializer_class = WorkflowStageSerializer
    queryset = WorkflowStage.objects.none()
    http_method_names = ["get", "post", "put", "patch", "head", "options"]

    filter_backends = [QueryParamSearchFilter, OrderingFilter]
    search_fields = ["name", "workflow__name"]
    ordering_fields = [
        "id",
        "name",
        "order",
        "is_initial",
        "is_final",
        "wip_limit",
        "is_active",
        "created_at",
        "updated_at",
    ]
    ordering = ("workflow_id", "order", "id")

    def get_queryset(self, shop):
        qs = WorkflowStage.objects.filter(workflow__shop=shop)

        workflow_id = self.request.query_params.get("workflow")
        if workflow_id:
            qs = qs.filter(workflow_id=workflow_id)

        is_active = parse_bool(self.request.query_params.get("is_active"))
        if is_active is not None:
            qs = qs.filter(is_active=is_active)

        return qs
