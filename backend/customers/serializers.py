# backend/customers/serializers.py
from rest_framework import serializers
from .models import Customer


class CustomerSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    photo_url = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = [
            "id",
            "shop",
            "photo",
            "photo_url",
            "first_name",
            "last_name",
            "name",
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
        read_only_fields = ["id", "created_at", "updated_at", "photo_url", "name"]

    def get_name(self, obj):
        # Full display name (safe, presentation-focused)
        first = obj.first_name or ""
        last = obj.last_name or ""
        full = f"{first} {last}".strip()
        return full or obj.company_name or ""

    def get_photo_url(self, obj):
        request = self.context.get("request")
        if obj.photo and hasattr(obj.photo, "url"):
            url = obj.photo.url
            return request.build_absolute_uri(url) if request else url
        return None
