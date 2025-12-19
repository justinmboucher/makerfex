# backend/tasks/serializers.py
from rest_framework import serializers

from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = [
            "id",
            "shop",
            "project",
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
        read_only_fields = ["id", "shop", "created_at", "updated_at"]
