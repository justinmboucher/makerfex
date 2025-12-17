# backend/projects/views.py
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from projects.models import Project
from projects.serializers import ProjectSerializer
from accounts.utils import get_shop_for_user  # ✅ use the shared helper

class ProjectViewSet(viewsets.ModelViewSet):
    """
    Project API scoped to the current user's shop.

    Rules:
    - Users may only see projects belonging to their shop
    - New projects are automatically assigned to the user's shop
    - Archived projects are hidden by default
    """

    permission_classes = [IsAuthenticated]
    serializer_class = ProjectSerializer
    queryset = Project.objects.none()  # overridden by get_queryset


    def get_shop(self):
        return get_shop_for_user(self.request.user)

    def get_queryset(self):
        shop = self.get_shop()
        if not shop:
            return Project.objects.none()

        qs = (
            Project.objects
            .filter(shop=shop, is_archived=False)
            .select_related("customer", "assigned_to")  # ✅ perf for list tables :contentReference[oaicite:2]{index=2}
            .order_by("-created_at")
        )

        customer_id = (
            self.request.query_params.get("customer")
            or self.request.query_params.get("customer_id")
        )
        if customer_id:
            qs = qs.filter(customer_id=customer_id)

        assigned_to_id = (
            self.request.query_params.get("assigned_to")
            or self.request.query_params.get("assigned_to_id")
        )
        if assigned_to_id:
            qs = qs.filter(assigned_to_id=assigned_to_id)

        station_id = (
            self.request.query_params.get("station")
            or self.request.query_params.get("station_id")
        )
        if station_id:
            # Projects assigned to employees who are members of this station
            qs = qs.filter(assigned_to__stations__id=station_id).distinct()

        return qs

    def perform_create(self, serializer):
        shop = self.get_shop()
        if not shop:
            raise ValueError("Current user has no shop configured.")

        # created_by exists on your model and serializer
        serializer.save(
            shop=shop,
            created_by=self.request.user,
        )
