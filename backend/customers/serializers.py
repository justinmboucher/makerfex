# backend/customers/serializers.py
from rest_framework import serializers

from .models import Customer


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = [
            "id",
            "shop",
            "first_name",
            "last_name",
            "email",
            "phone",
            "company_name",
            "address_line1",
            "address_line2",
            "city",
            "region",
            "postal_code",
            "country_code",
            "is_vip",
            "notes",
            "source",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
