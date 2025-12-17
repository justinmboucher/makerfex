# backend/accounts/serializers.py
from rest_framework import serializers

from .models import Shop, Employee, Station


class ShopSerializer(serializers.ModelSerializer):
  logo_url = serializers.SerializerMethodField()

  class Meta:
    model = Shop
    fields = [
      "id",
      "name",
      "slug",
      "legal_name",
      "email",
      "phone",
      "website",
      "timezone",
      "currency_code",
      "logo",
      "logo_url",
      "is_active",
      "created_at",
      "updated_at",
    ]
    read_only_fields = ["id", "created_at", "updated_at", "logo_url"]

  def get_logo_url(self, obj):
    request = self.context.get("request")
    if obj.logo and hasattr(obj.logo, "url"):
      url = obj.logo.url
      return request.build_absolute_uri(url) if request else url
    return None


class EmployeeSerializer(serializers.ModelSerializer):
  photo_url = serializers.SerializerMethodField()

  class Meta:
    model = Employee
    fields = [
      "id",
      "shop",
      "user",
      "first_name",
      "last_name",
      "email",
      "role",
      "photo",
      "photo_url",
      "is_manager",
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


class EmployeeMiniSerializer(serializers.ModelSerializer):
    display_name = serializers.SerializerMethodField()

    class Meta:
        model = Employee
        fields = ["id", "first_name", "last_name", "role", "is_active", "display_name"]

    def get_display_name(self, obj):
        return f"{obj.first_name} {obj.last_name or ''}".strip()

class StationSerializer(serializers.ModelSerializer):
    employee_count = serializers.IntegerField(read_only=True)
    employees_detail = EmployeeMiniSerializer(source="employees", many=True, read_only=True)

    class Meta:
        model = Station
        fields = [
            "id",
            "shop",
            "name",
            "code",
            "description",
            "is_active",
            "employee_count",     # ✅ list-friendly
            "employees",          # keep ids too (low-risk/backwards compatible)
            "employees_detail",   # ✅ detail-friendly expansion
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "employee_count", "employees_detail"]