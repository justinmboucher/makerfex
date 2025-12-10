# backend/products/serializers.py
from rest_framework import serializers

from .models import ProductTemplate, ProjectPromotion


class ProductTemplateSerializer(serializers.ModelSerializer):
  photo_url = serializers.SerializerMethodField()

  class Meta:
    model = ProductTemplate
    fields = [
      "id",
      "shop",
      "name",
      "slug",
      "description",
      "photo",
      "photo_url",
      "base_price",
      "estimated_hours",
      "default_workflow",
      "is_active",
      "created_at",
      "updated_at",
    ]
    read_only_fields = ["id", "created_at", "updated_at", "photo_url"]

  def get_photo_url(self, obj):
    request = self.context.get("request")
    if obj.photo and hasattr(obj.photo, "url"):
      url = obj.photo.url
      return request.build_absolute_uri(url) if request else url
    return None


class ProjectPromotionSerializer(serializers.ModelSerializer):
  image_url = serializers.SerializerMethodField()

  class Meta:
    model = ProjectPromotion
    fields = [
      "id",
      "project",
      "image",
      "image_url",
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
    read_only_fields = ["id", "created_at", "updated_at", "image_url"]

  def get_image_url(self, obj):
    request = self.context.get("request")
    if obj.image and hasattr(obj.image, "url"):
      url = obj.image.url
      return request.build_absolute_uri(url) if request else url
    return None
