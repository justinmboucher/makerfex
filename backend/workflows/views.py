# backend/workflows/views.py

from django.apps import apps
from django.db import transaction
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.models import Employee
from accounts.utils import get_shop_for_user
from makerfex_backend.filters import QueryParamSearchFilter, parse_bool
from makerfex_backend.mixins import ServerTableViewSetMixin, ShopScopedQuerysetMixin

from .models import Workflow, WorkflowStage
from .serializers import WorkflowSerializer, WorkflowStageSerializer


def _workflow_is_referenced(workflow: Workflow) -> bool:
    """
    Returns True if this workflow is referenced by other domain objects (e.g. projects).
    Uses runtime model loading to avoid circular imports.
    """
    try:
        Project = apps.get_model("projects", "Project")
    except Exception:
        Project = None

    if Project is not None:
        # Common patterns: project.workflow FK
        if hasattr(Project, "workflow"):
            if Project.objects.filter(workflow=workflow).exists():
                return True

    return False


def _stage_is_referenced(stage: WorkflowStage) -> bool:
    """
    Returns True if this stage is referenced by other domain objects.
    Uses runtime model loading to avoid circular imports.
    """
    try:
        Project = apps.get_model("projects", "Project")
    except Exception:
        Project = None

    if Project is not None:
        # Common pattern: project.current_stage FK
        if hasattr(Project, "current_stage"):
            if Project.objects.filter(current_stage=stage).exists():
                return True

    # Sales references can be added later without importing sales models at module import time.
    return False


class ShopScopedMixin:
    """
    Existing helper retained for employee resolution.
    We use mixins for canonical list behavior + tenant scoping, but keep this
    small helper for created_by assignment.
    """

    permission_classes = [IsAuthenticated]

    def get_shop(self):
        return get_shop_for_user(self.request.user)

    def get_employee(self, shop):
        if not shop:
            return None
        return Employee.objects.filter(shop=shop, user=self.request.user).first()


class WorkflowViewSet(
    ServerTableViewSetMixin, ShopScopedQuerysetMixin, ShopScopedMixin, viewsets.ModelViewSet
):
    serializer_class = WorkflowSerializer
    queryset = Workflow.objects.none()

    # Enable full CRUD (including DELETE with safe semantics)
    http_method_names = ["get", "post", "put", "patch", "delete", "head", "options"]

    # Canonical list contract (kept explicit; mixin also enforces it)
    filter_backends = [QueryParamSearchFilter, OrderingFilter]
    search_fields = ["name", "description"]
    ordering_fields = ["id", "name", "is_default", "is_active", "created_at", "updated_at"]
    ordering = ("name", "id")

    def get_shop_queryset(self, shop):
        qs = Workflow.objects.filter(shop=shop)

        # Filters (backend-authoritative)
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

    def destroy(self, request, *args, **kwargs):
        """
        Safe delete:
        - If referenced: archive (is_active=False)
        - If unreferenced: hard delete
        """
        workflow = self.get_object()

        if _workflow_is_referenced(workflow):
            if hasattr(workflow, "is_active"):
                workflow.is_active = False
                workflow.save(update_fields=["is_active"])

            data = self.get_serializer(workflow).data
            return Response(
                {
                    "detail": "Workflow is referenced and cannot be deleted; it was archived instead.",
                    "archived": True,
                    "workflow": data,
                },
                status=status.HTTP_200_OK,
            )

        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=["post"], url_path="stages/reorder")
    def reorder_stages(self, request, pk=None):
        """
        Backend-authoritative stage ordering.

        POST /workflows/{id}/stages/reorder/
        Body: { "stage_ids": [3,1,2] }
        """
        workflow = self.get_object()
        stage_ids = request.data.get("stage_ids")

        if not isinstance(stage_ids, list) or not all(isinstance(x, int) for x in stage_ids):
            return Response(
                {"detail": "stage_ids must be a list of integers."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(stage_ids) != len(set(stage_ids)):
            return Response(
                {"detail": "stage_ids contains duplicates."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Ensure all stages belong to this workflow (and tenant)
        stages = list(WorkflowStage.objects.filter(workflow=workflow, id__in=stage_ids))
        if len(stages) != len(stage_ids):
            return Response(
                {"detail": "One or more stage_ids are invalid for this workflow."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            # Normalize order to 0..n-1
            for idx, sid in enumerate(stage_ids):
                WorkflowStage.objects.filter(workflow=workflow, id=sid).update(order=idx)

        return Response({"detail": "Stage order updated."}, status=status.HTTP_200_OK)


class WorkflowStageViewSet(
    ServerTableViewSetMixin, ShopScopedQuerysetMixin, ShopScopedMixin, viewsets.ModelViewSet
):
    serializer_class = WorkflowStageSerializer
    queryset = WorkflowStage.objects.none()

    # Enable full CRUD (including DELETE with safe semantics)
    http_method_names = ["get", "post", "put", "patch", "delete", "head", "options"]

    filter_backends = [QueryParamSearchFilter, OrderingFilter]
    search_fields = ["name", "workflow__name"]
    ordering_fields = [
        "id",
        "name",
        "order",
        "is_initial",
        "is_final",
        "allows_sale_log",
        "wip_limit",
        "is_active",
        "created_at",
        "updated_at",
    ]
    ordering = ("workflow_id", "order", "id")

    def get_shop_queryset(self, shop):
        qs = WorkflowStage.objects.filter(workflow__shop=shop)

        # Optional filter: ?workflow=<id>
        workflow_id = self.request.query_params.get("workflow")
        if workflow_id:
            qs = qs.filter(workflow_id=workflow_id)

        is_active = parse_bool(self.request.query_params.get("is_active"))
        if is_active is not None:
            qs = qs.filter(is_active=is_active)

        # Stable ordering
        return qs.order_by("workflow_id", "order", "id")

    def destroy(self, request, *args, **kwargs):
        """
        Safe delete:
        - If referenced: disable (is_active=False)
        - If unreferenced: hard delete
        """
        stage = self.get_object()

        if _stage_is_referenced(stage):
            if hasattr(stage, "is_active"):
                stage.is_active = False
                stage.save(update_fields=["is_active"])

            data = self.get_serializer(stage).data
            return Response(
                {
                    "detail": "Stage is referenced and cannot be deleted; it was disabled instead.",
                    "disabled": True,
                    "stage": data,
                },
                status=status.HTTP_200_OK,
            )

        return super().destroy(request, *args, **kwargs)
