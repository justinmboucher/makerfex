from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from projects.models import Project
from projects.serializers import ProjectSerializer
from accounts.models import Employee


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
        user = self.request.user
        if not user or not user.is_authenticated:
            return None

        # User -> Employee -> Shop (your canonical relationship)
        try:
            return Employee.objects.get(user=user, is_active=True).shop
        except Employee.DoesNotExist:
            return None

    def get_queryset(self):
        shop = self.get_shop()
        if not shop:
            return Project.objects.none()

        return (
            Project.objects
            .filter(shop=shop, is_archived=False)
            .order_by("-created_at")
        )

    def perform_create(self, serializer):
        shop = self.get_shop()
        if not shop:
            raise ValueError("Current user has no shop configured.")

        # created_by exists on your model and serializer
        serializer.save(
            shop=shop,
            created_by=self.request.user,
        )
