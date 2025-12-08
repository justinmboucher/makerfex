# backend/analytics/models.py
from django.db import models

from accounts.models import TimeStampedModel, Shop


class AnalyticsSnapshot(TimeStampedModel):
    """
    Generic numeric metric snapshot for a shop at a given date.
    e.g. 'daily_revenue', 'open_projects', 'avg_lead_time'.
    """
    shop = models.ForeignKey(
        Shop,
        on_delete=models.CASCADE,
        related_name="analytics_snapshots",
    )

    metric_key = models.CharField(
        max_length=100,
        help_text="Machine-readable metric key (e.g. 'daily_revenue').",
    )
    label = models.CharField(
        max_length=200,
        blank=True,
        help_text="Optional human-readable label.",
    )

    snapshot_date = models.DateField()
    value = models.DecimalField(
        max_digits=20,
        decimal_places=4,
    )

    # Django 5: built-in JSONField
    extra = models.JSONField(
        blank=True,
        null=True,
        help_text="Optional structured metadata (dimensions, breakdowns, etc.).",
    )

    class Meta:
        ordering = ["shop", "snapshot_date", "metric_key"]
        unique_together = ("shop", "metric_key", "snapshot_date")

    def __str__(self):
        return f"{self.metric_key} @ {self.snapshot_date} ({self.shop.slug})"


class AnalyticsEvent(TimeStampedModel):
    """
    Generic event record for analytics pipelines.
    Later you can attach ETL jobs, ML models, etc.
    """
    shop = models.ForeignKey(
        Shop,
        on_delete=models.CASCADE,
        related_name="analytics_events",
    )

    event_type = models.CharField(
        max_length=100,
        help_text="e.g. 'project_created', 'order_paid'.",
    )
    source = models.CharField(
        max_length=100,
        blank=True,
        help_text="Optional event source label.",
    )

    occurred_at = models.DateTimeField()
    payload = models.JSONField(
        blank=True,
        null=True,
        help_text="Raw event payload or normalized properties.",
    )

    class Meta:
        ordering = ["-occurred_at", "-created_at"]

    def __str__(self):
        return f"{self.event_type} ({self.shop.slug})"
