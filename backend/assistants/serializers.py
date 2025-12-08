# backend/assistants/serializers.py
from rest_framework import serializers

from .models import AssistantProfile, AssistantSession, AssistantMessage


class AssistantProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssistantProfile
        fields = [
            "id",
            "shop",
            "name",
            "slug",
            "description",
            "role_prompt",
            "default_model_name",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class AssistantSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssistantSession
        fields = [
            "id",
            "shop",
            "assistant",
            "created_by",
            "title",
            "status",
            "last_activity_at",
            "metadata",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class AssistantMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssistantMessage
        fields = [
            "id",
            "session",
            "role",
            "content",
            "metadata",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
