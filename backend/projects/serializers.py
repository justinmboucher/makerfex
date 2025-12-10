# backend/projects/serializers.py
from rest_framework import serializers

from .models import Project


class ProjectSerializer(serializers.ModelSerializer):
  photo_url = serializers.SerializerMethodField()

  class Meta:
    model = Project
    fields = [
      "id",
      "shop",
      "customer",
      "photo",
      "photo_url",
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
  read_only_fields = ["id", "created_at", "updated_at", "photo_url"]

  def get_photo_url(self, obj):
    request = self.context.get("request")
    if obj.photo and hasattr(obj.photo, "url"):
      url = obj.photo.url
      return request.build_absolute_uri(url) if request else url
    return None
