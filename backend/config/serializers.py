# backend/config/serializers.py
from rest_framework import serializers

from .models import ShopConfig, IntegrationConfig


class ShopConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShopConfig
        fields = [
            "id",
            "shop",
            "enable_inventory",
            "enable_analytics",
            "enable_time_tracking",
            "enable_assistants",
            "default_hourly_rate",
            "default_project_priority",
            "working_hours",
            "locale",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class IntegrationConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = IntegrationConfig
        fields = [
            "id",
            "shop",
            "provider",
            "name",
            "is_active",
            "credentials",
            "settings",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
