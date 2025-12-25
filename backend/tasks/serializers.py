# backend/tasks/serializers.py
from rest_framework import serializers

from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    # Lightweight project context for Kanban cards (read-only)
    project_name = serializers.CharField(source="project.name", read_only=True)
    project_due_date = serializers.DateField(source="project.due_date", read_only=True, allow_null=True)
    is_vip = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            "id",
            "shop",
            "project",
            "project_name",
            "project_due_date",
            "is_vip",
            "title",
            "description",
            "status",
            "stage",
            "station",
            "assignee",
            "order",
            "estimated_hours",
            "actual_hours",
            "due_date",
            "started_at",
            "completed_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "shop", "created_at", "updated_at", "project_name", "project_due_date", "is_vip"]

    def get_is_vip(self, obj) -> bool:
        """
        Derived VIP flag for employee lens:
        - task -> project -> customer -> VIP flag
        We intentionally avoid assuming the exact VIP field name. If the customer
        model changes, this stays resilient.
        """
        project = getattr(obj, "project", None)
        if not project:
            return False

        customer = getattr(project, "customer", None)
        if not customer:
            return False

        for attr in ("is_vip", "vip", "isVIP", "vip_flag", "is_priority", "priority_customer"):
            if hasattr(customer, attr):
                return bool(getattr(customer, attr))
        return False
