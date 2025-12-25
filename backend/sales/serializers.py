# backend/sales/serializers.py

from decimal import Decimal
from rest_framework import serializers
from .models import SalesOrder, SalesOrderLine


class SalesOrderLineSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalesOrderLine
        fields = [
            "id",
            "order",
            "product_template",
            "project",
            "description",
            "quantity",
            "unit_price",
            "line_total",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class SalesOrderSerializer(serializers.ModelSerializer):
    # optional nested read-only lines
    lines = SalesOrderLineSerializer(many=True, read_only=True)

    class Meta:
        model = SalesOrder
        fields = [
            "id",
            "shop",
            "customer",
            "project",
            "order_number",
            "status",
            "source",
            "order_date",
            "due_date",
            "currency_code",
            "subtotal_amount",
            "tax_amount",
            "total_amount",
            "notes",
            "lines",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


# ✅ NEW: request payload serializer for log_from_project
class LogSaleFromProjectSerializer(serializers.Serializer):
    project_id = serializers.IntegerField(min_value=1)
    total_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    order_date = serializers.DateField(required=False, allow_null=True)
    notes = serializers.CharField(required=False, allow_blank=True, default="")
    source = serializers.ChoiceField(
        choices=SalesOrder.Source.choices,
        required=False,
        default=SalesOrder.Source.OTHER,
    )

    archive_project = serializers.BooleanField(required=False, default=True)

    create_product_template = serializers.BooleanField(required=False, default=False)
    new_template_name = serializers.CharField(required=False, allow_blank=True, default="")

    def validate_total_amount(self, v: Decimal):
        if v is None:
            raise serializers.ValidationError("Total amount is required.")
        if v <= 0:
            raise serializers.ValidationError("Total amount must be > 0.")
        return v

    def validate(self, attrs):
        if attrs.get("create_product_template"):
            name = (attrs.get("new_template_name") or "").strip()
            if not name:
                raise serializers.ValidationError(
                    {"new_template_name": "Template name is required when creating a product template."}
                )
        return attrs
