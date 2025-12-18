# backend/projects/views.py

from django.db.models import Q, BooleanField, Case, Value, When
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from accounts.models import Employee
from accounts.utils import get_shop_for_user
from projects.models import Project
from projects.serializers import ProjectSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ProjectSerializer
    queryset = Project.objects.none()

    def get_shop(self):
        return get_shop_for_user(self.request.user)

    def get_employee(self, shop):
        if not shop:
            return None
        return Employee.objects.filter(shop=shop, user=self.request.user).first()

    def get_queryset(self):
        shop = self.get_shop()
        if not shop:
            return Project.objects.none()

        qs = (
            Project.objects
            .filter(shop=shop, is_archived=False)
            .select_related("customer", "assigned_to", "workflow", "current_stage", "station")
            .annotate(
                # Stage-truth completion: completed means current_stage.is_final
                is_completed=Case(
                    When(current_stage__is_final=True, then=Value(True)),
                    default=Value(False),
                    output_field=BooleanField(),
                )
            )
            .order_by("-created_at")
        )

        customer_id = self.request.query_params.get("customer") or self.request.query_params.get("customer_id")
        if customer_id:
            qs = qs.filter(customer_id=customer_id)

        assigned_to_id = self.request.query_params.get("assigned_to") or self.request.query_params.get("assigned_to_id")
        if assigned_to_id:
            qs = qs.filter(assigned_to_id=assigned_to_id)

        # Stage filter
        stage_id = self.request.query_params.get("current_stage") or self.request.query_params.get("stage")
        if stage_id:
            qs = qs.filter(current_stage_id=stage_id)

        # Station filter (canonical meaning: Project.station_id)
        station_id = self.request.query_params.get("station") or self.request.query_params.get("station_id")
        if station_id:
            # Transitional compatibility:
            # Include (project.station == station) OR (assigned_to employee is in station)
            qs = qs.filter(
                Q(station_id=station_id) | Q(assigned_to__stations__id=station_id)
            ).distinct()

        # Completion filter: ?is_completed=true/false
        is_completed = self.request.query_params.get("is_completed")
        if is_completed is not None:
            v = str(is_completed).strip().lower()
            if v in ("1", "true", "yes"):
                qs = qs.filter(current_stage__is_final=True)
            elif v in ("0", "false", "no"):
                qs = qs.exclude(current_stage__is_final=True)

        return qs

    def perform_create(self, serializer):
        shop = self.get_shop()
        if not shop:
            raise ValueError("Current user has no shop configured.")
        emp = self.get_employee(shop)
        serializer.save(shop=shop, created_by=emp)
