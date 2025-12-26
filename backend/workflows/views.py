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
    Project = apps.get_model("projects", "Project")
    return Project.objects.filter(workflow=workflow).exists()


def _stage_is_referenced(stage: WorkflowStage) -> bool:
    Project = apps.get_model("projects", "Project")
    return Project.objects.filter(current_stage=stage).exists()


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
    lookup_value_regex = r"\d+"
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
            Backend-authoritative stage ordering (active stages only).

            POST /workflows/{id}/stages/reorder/
            Body: { "stage_ids": [3,1,2,...] }

            Semantics (locked):
            - stage_ids must include exactly ALL active stage IDs for the workflow
            - order is normalized to 0..N-1 every time
            - inactive stages are not reorderable via this endpoint
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

            # Active stages for this workflow
            active_ids = list(
                WorkflowStage.objects.filter(workflow=workflow, is_active=True).values_list("id", flat=True)
            )

            if set(stage_ids) != set(active_ids):
                return Response(
                    {
                        "detail": "stage_ids must include exactly all active stages for this workflow.",
                        "expected_stage_ids": sorted(active_ids),
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            with transaction.atomic():
                # Normalize order to 0..n-1 for ALL active stages
                for idx, sid in enumerate(stage_ids):
                    WorkflowStage.objects.filter(workflow=workflow, id=sid, is_active=True).update(order=idx)

            return Response({"detail": "Stage order updated."}, status=status.HTTP_200_OK)


class WorkflowStageViewSet(
    ServerTableViewSetMixin, ShopScopedQuerysetMixin, ShopScopedMixin, viewsets.ModelViewSet
):
    lookup_value_regex = r"\d+"
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
