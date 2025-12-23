# backend/products/serializers.py
from rest_framework import serializers
from accounts.utils import get_shop_for_user

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
    read_only_fields = ["id", "shop", "created_at", "updated_at", "photo_url"]

  def get_photo_url(self, obj):
    request = self.context.get("request")
    if obj.photo and hasattr(obj.photo, "url"):
      url = obj.photo.url
      return request.build_absolute_uri(url) if request else url
    return None

  def validate(self, attrs):
    request = self.context.get("request")
    shop = get_shop_for_user(request.user) if request else None

    default_workflow = attrs.get("default_workflow") or getattr(self.instance, "default_workflow", None)

    if shop and default_workflow:
      if getattr(default_workflow, "shop_id", None) != shop.id:
        raise serializers.ValidationError({"default_workflow": "Invalid workflow."})
      if getattr(default_workflow, "is_active", True) is False:
        raise serializers.ValidationError({"default_workflow": "Workflow is inactive."})

    return attrs


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
