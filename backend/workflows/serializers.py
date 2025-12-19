# backend/workflows/serializers.py
from rest_framework import serializers

from .models import Workflow, WorkflowStage


class WorkflowStageSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkflowStage
        fields = [
            "id",
            "workflow",
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
        read_only_fields = ["id", "shop", "created_at", "updated_at"]


class WorkflowSerializer(serializers.ModelSerializer):
    # optional nested read-only stages listing
    stages = WorkflowStageSerializer(many=True, read_only=True)

    class Meta:
        model = Workflow
        fields = [
            "id",
            "shop",
            "name",
            "description",
            "is_default",
            "is_active",
            "created_by",
            "stages",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "shop", "created_at", "updated_at"]
