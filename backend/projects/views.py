# backend/projects/views.py
from __future__ import annotations
from rest_framework import viewsets

from .models import Project
from .serializers import ProjectSerializer

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer


# Simple capability mapping for v1.
# In the future, connect this to your role/capability system.
METRIC_CAPABILITIES = {
    "projects.active_count": ["view_shop_aggregates"],
    "projects.overdue_count": ["view_shop_aggregates"],
    "projects.wip_by_stage": ["view_shop_aggregates"],
    "projects.throughput_30d": ["view_shop_aggregates"],
    "projects.top_overdue": ["view_shop_aggregates"],
    "projects.throughput_sparkline_30d": ["view_shop_aggregates"],
}


def user_has_capabilities(user, required: list[str]) -> bool:
    """
    Placeholder capability checker.

    ASSUMPTION:
    - You eventually implement a real capability system
      (e.g., via roles or Employee model).
    - For now, we treat staff / superuser as having all capabilities.
    """
    if not required:
        return True
    if not user.is_authenticated:
        return False
    if user.is_superuser or getattr(user, "is_staff", False):
        return True

    # TODO: replace this with your real capability/role check.
    # e.g., return user.employee.has_capabilities(required)
    return False