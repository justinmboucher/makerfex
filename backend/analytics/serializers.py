# backend/analytics/serializers.py
from rest_framework import serializers

from .models import AnalyticsSnapshot, AnalyticsEvent


class AnalyticsSnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalyticsSnapshot
        fields = [
            "id",
            "shop",
            "metric_key",
            "label",
            "snapshot_date",
            "value",
            "extra",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class AnalyticsEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalyticsEvent
        fields = [
            "id",
            "shop",
            "event_type",
            "source",
            "occurred_at",
            "payload",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
