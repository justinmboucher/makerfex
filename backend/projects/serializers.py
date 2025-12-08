# backend/projects/serializers.py
from rest_framework import serializers

from .models import Project


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = [
            "id",
            "shop",
            "customer",
            "name",
            "reference_code",
            "description",
            "workflow",
            "current_stage",
            "priority",
            "status",
            "start_date",
            "due_date",
            "completed_at",
            "created_by",
            "assigned_to",
            "estimated_hours",
            "actual_hours",
            "is_archived",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
