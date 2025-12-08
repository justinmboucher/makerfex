# backend/sales/serializers.py
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
