# backend/workflows/serializers.py

from django.db.models import Max
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
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate(self, attrs):
        """
        Enforce workflow rules:
        - Only one final stage per workflow.
        """
        workflow = attrs.get("workflow") or getattr(self.instance, "workflow", None)
        is_final = attrs.get("is_final", getattr(self.instance, "is_final", False))

        if workflow and is_final:
            qs = WorkflowStage.objects.filter(workflow=workflow, is_final=True)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError(
                    {"is_final": "Only one stage per workflow can be marked as final."}
                )

        return attrs

    def create(self, validated_data):
        """
        If order isn't provided, append to end of the workflow.
        Backend-authoritative: order is stable and deterministic.
        """
        if "order" not in validated_data or validated_data["order"] is None:
            workflow = validated_data["workflow"]
            max_order = (
                WorkflowStage.objects.filter(workflow=workflow)
                .aggregate(m=Max("order"))
                .get("m")
            )
            validated_data["order"] = (max_order + 1) if max_order is not None else 0

        return super().create(validated_data)


class WorkflowSerializer(serializers.ModelSerializer):
    # Optional nested read-only stages listing (useful for admin screens / quick detail views)
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
