# backend/analytics/admin.py
from django.contrib import admin

from .models import AnalyticsSnapshot, AnalyticsEvent


@admin.register(AnalyticsSnapshot)
class AnalyticsSnapshotAdmin(admin.ModelAdmin):
    list_display = ("shop", "metric_key", "snapshot_date", "value")
    list_filter = ("shop", "metric_key", "snapshot_date")
    search_fields = ("metric_key", "label")
    autocomplete_fields = ("shop",)


@admin.register(AnalyticsEvent)
class AnalyticsEventAdmin(admin.ModelAdmin):
    list_display = ("shop", "event_type", "source", "occurred_at")
    list_filter = ("shop", "event_type", "source")
    search_fields = ("event_type", "source")
    autocomplete_fields = ("shop",)
