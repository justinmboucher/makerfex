# backend/accounts/serializers.py
from rest_framework import serializers

from .models import Shop, Employee, Station


class ShopSerializer(serializers.ModelSerializer):
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
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class EmployeeSerializer(serializers.ModelSerializer):
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
            "is_manager",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class StationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Station
        fields = [
            "id",
            "shop",
            "name",
            "code",
            "description",
            "is_active",
            "employees",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
