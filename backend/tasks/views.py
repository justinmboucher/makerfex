# backend/tasks/views.py
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from accounts.utils import get_shop_for_user
from .models import Task
from .serializers import TaskSerializer


class TaskViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = TaskSerializer
    queryset = Task.objects.none()

    def get_queryset(self):
        shop = get_shop_for_user(self.request.user)
        if not shop:
            return Task.objects.none()

        qs = Task.objects.filter(shop=shop)

        # Optional filters (safe + additive)
        project_id = self.request.query_params.get("project")
        if project_id:
            qs = qs.filter(project_id=project_id)

        station_id = self.request.query_params.get("station")
        if station_id:
            qs = qs.filter(station_id=station_id)

        stage_id = self.request.query_params.get("stage")
        if stage_id:
            qs = qs.filter(stage_id=stage_id)

        return qs.order_by("-created_at")
