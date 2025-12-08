# backend/products/serializers.py
from rest_framework import serializers

from .models import ProductTemplate, ProjectPromotion


class ProductTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductTemplate
        fields = [
            "id",
            "shop",
            "name",
            "slug",
            "description",
            "base_price",
            "estimated_hours",
            "default_workflow",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class ProjectPromotionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectPromotion
        fields = [
            "id",
            "project",
            "channel",
            "status",
            "title",
            "link_url",
            "notes",
            "started_at",
            "ended_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
