from __future__ import annotations

from datetime import date, timedelta

from django.db.models import Count
from django.utils import timezone
from django.db.models.functions import TruncDate
from django.db.models import F

from accounts.models import Shop
from projects.models import Project


# ---- Helpers ---------------------------------------------------------------


def _active_projects_qs(shop: Shop):
    """
    Base queryset for "active" projects.

    ASSUMPTIONS:
    - Project has a `shop` FK.
    - Project has a `status` field with values like "completed" and "cancelled"
      that indicate non-active states.
    - Adjust the filter/exclude logic to match your real model.
    """
    if shop is None:
        return Project.objects.none()

    return (
        Project.objects
        .filter(shop=shop)
        .exclude(status__in=["completed", "cancelled"])
    )


# ---- Metric builders -------------------------------------------------------

def metric_projects_active_count(shop: Shop) -> dict:
    qs = _active_projects_qs(shop)
    value = qs.count()

    payload = {
        "kind": "single",
        "value": value,
        "unit": "projects",
        "label": "Active projects",
        # v1: no comparison yet – you can add previous period logic later
        "comparison": None,
    }
    return payload


def metric_projects_overdue_count(shop: Shop) -> dict:
    qs = _active_projects_qs(shop)

    # ASSUMPTION:
    # - Project has a `due_date` field (DateField or DateTimeField).
    # Adjust if your field name differs (e.g. `due_on`).
    today = timezone.localdate() if hasattr(timezone, "localdate") else date.today()
    overdue_qs = qs.filter(due_date__lt=today)
    value = overdue_qs.count()

    payload = {
        "kind": "single",
        "value": value,
        "unit": "projects",
        "label": "Overdue projects",
        "comparison": None,
    }
    return payload


def metric_projects_wip_by_stage(shop: Shop) -> dict:
    qs = _active_projects_qs(shop)

    # Use current_stage FK instead of a non-existent "stage"
    stage_counts = (
        qs.values("current_stage__name")
        .annotate(count=Count("id"))
        .order_by("current_stage__name")
    )

    categories: list[str] = []
    values: list[int] = []

    for row in stage_counts:
        label = row["current_stage__name"] or "Unassigned"
        categories.append(label)
        values.append(row["count"])

    payload = {
        "kind": "category_series",
        "categories": categories,
        "series": [
            {
                "id": "count",
                "label": "Projects",
                "unit": "count",
                "values": values,
            }
        ],
    }
    return payload

def _parse_time_range_days(time_range: str, default_days: int = 30) -> int:
  """
  Parse a simple time_range string like '30d', '90d' into days.
  Fallback to default_days if parsing fails.
  """
  if not time_range:
      return default_days
  if time_range.endswith("d"):
      try:
          return max(1, int(time_range[:-1]))
      except ValueError:
          return default_days
  return default_days


def metric_projects_throughput_time_series(shop: Shop, time_range: str = "30d") -> dict:
    """
    Completed projects per day over the given time range.
    Returns a time_series payload for a line chart.
    """
    qs = Project.objects.filter(shop=shop)

    # ASSUMPTION: status 'completed' marks done projects; adjust if needed.
    qs = qs.filter(status="completed")

    days = _parse_time_range_days(time_range, default_days=30)

    today = timezone.localdate() if hasattr(timezone, "localdate") else date.today()
    start_date = today - timedelta(days=days - 1)

    # Group by completion date; adjust field name if your model differs
    completed_qs = (
        qs.filter(completed_at__date__gte=start_date, completed_at__date__lte=today)
        .annotate(day=TruncDate("completed_at"))
        .values("day")
        .annotate(count=Count("id"))
        .order_by("day")
    )

    counts_by_day = {row["day"]: row["count"] for row in completed_qs}

    points = []
    current = start_date
    while current <= today:
        value = counts_by_day.get(current, 0)
        points.append(
            {
                "t": current.isoformat(),
                "v": value,
            }
        )
        current += timedelta(days=1)

    payload = {
        "kind": "time_series",
        "granularity": "day",
        "series": [
            {
                "id": "throughput",
                "label": "Completed projects",
                "unit": "projects",
                "points": points,
            }
        ],
    }
    return payload

def metric_projects_top_overdue(shop: Shop, limit: int = 10) -> dict:
    """
    Returns the top overdue active projects (due_date < today)
    with a table payload.
    """

    today = timezone.localdate() if hasattr(timezone, "localdate") else date.today()

    qs = (
        Project.objects.filter(shop=shop)
        .filter(is_archived=False)
        .filter(due_date__lt=today)
        .annotate(days_overdue=(today - F("due_date")))
        .order_by("-days_overdue")[:limit]
    )

    def resolve_customer_name(customer):
        if not customer:
            return "—"

        # Company name takes priority if present
        if customer.company_name and customer.company_name.strip():
            return customer.company_name.strip()

        # Use first + last name fallback
        first = (customer.first_name or "").strip()
        last = (customer.last_name or "").strip()
        full = f"{first} {last}".strip()

        return full or "—"

    rows = []
    for proj in qs:
        days = proj.days_overdue.days if hasattr(proj.days_overdue, "days") else proj.days_overdue

        rows.append(
            {
                "id": proj.id,
                "name": proj.name,
                "customer": resolve_customer_name(proj.customer),
                "due_date": proj.due_date.isoformat() if proj.due_date else None,
                "days_overdue": days,
            }
        )
    payload = {
        "kind": "table",
        "columns": [
            {"key": "name", "label": "Project", "type": "string"},
            {"key": "customer", "label": "Customer", "type": "string"},
            {"key": "due_date", "label": "Due date", "type": "date"},
            {"key": "days_overdue", "label": "Days overdue", "type": "number"},
        ],
        "rows": rows,
    }

    return payload

def metric_projects_throughput_sparkline(
    shop: Shop,
    time_range: str = "30d",
) -> dict:
    """
    Sparkline wrapper around the throughput time series.

    - value: total completed projects in the period
    - unit: projects
    - points: same time series as throughput_30d
    - trendPct: % change from first point to last
    """

    base = metric_projects_throughput_time_series(shop, time_range)
    series_list = base.get("series") or []
    if not series_list:
        return {
            "kind": "sparkline",
            "value": 0,
            "unit": "projects",
            "label": "Completed (last 30 days)",
            "points": [],
            "trendPct": None,
        }

    series = series_list[0]
    points = series.get("points") or []

    if not points:
        return {
            "kind": "sparkline",
            "value": 0,
            "unit": "projects",
            "label": "Completed (last 30 days)",
            "points": [],
            "trendPct": None,
        }

    total = sum(pt.get("v", 0) for pt in points)

    first = points[0].get("v", 0)
    last = points[-1].get("v", 0)

    if first <= 0:
        trend_pct = None
    else:
        trend_pct = (last - first) / float(first)

    payload = {
        "kind": "sparkline",
        "value": total,
        "unit": "projects",
        "label": "Completed (last 30 days)",
        "points": points,
        "trendPct": trend_pct,
    }
    return payload
