# backend/workflows/views.py
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from accounts.utils import get_shop_for_user
from accounts.models import Employee
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


class WorkflowViewSet(ShopScopedMixin, viewsets.ModelViewSet):
    serializer_class = WorkflowSerializer
    queryset = Workflow.objects.none()

    def get_queryset(self):
        shop = self.get_shop()
        if not shop:
            return Workflow.objects.none()
        return Workflow.objects.filter(shop=shop).order_by("name", "id")

    def perform_create(self, serializer):
        shop = self.get_shop()
        if not shop:
            raise ValueError("Current user has no shop configured.")
        emp = self.get_employee(shop)
        serializer.save(shop=shop, created_by=emp)


class WorkflowStageViewSet(ShopScopedMixin, viewsets.ModelViewSet):
    serializer_class = WorkflowStageSerializer
    queryset = WorkflowStage.objects.none()

    def get_queryset(self):
        shop = self.get_shop()
        if not shop:
            return WorkflowStage.objects.none()
        return WorkflowStage.objects.filter(workflow__shop=shop).order_by("workflow_id", "order", "id")

    def perform_create(self, serializer):
        """
        Stage is attached to a workflow; we rely on serializer validation + queryset scoping.
        Optionally add explicit validation here later (soft actions only).
        """
        serializer.save()
