# backend/projects/serializers.py
from rest_framework import serializers

from .models import Project
from customers.models import Customer


class ProjectSerializer(serializers.ModelSerializer):
  customer_name = serializers.SerializerMethodField()
  photo_url = serializers.SerializerMethodField()

  class Meta:
    model = Project
    fields = [
      "id",
      "shop",
      "customer",
      "customer_name",
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

  def get_customer_name(self, obj):
    customer = obj.customer
    if not customer:
        return None

    # Build display name from real model fields
    first = getattr(customer, "first_name", "") or ""
    last = getattr(customer, "last_name", "") or ""
    full = f"{first} {last}".strip()

    if full:
        return full

    # Fallback to company name if present
    return getattr(customer, "company_name", None)

  def get_photo_url(self, obj):
    request = self.context.get("request")
    if obj.photo and hasattr(obj.photo, "url"):
      url = obj.photo.url
      return request.build_absolute_uri(url) if request else url
    return None
