# backend/analytics/metrics/registry.py
"""
Central registry for analytics metrics.

Maps metric keys (strings) to Python callables and capability requirements.
This lets any app register metrics (projects, tasks, sales, etc.)
while keeping the API + lookup logic centralized.
"""

from projects.metrics import (
    metric_projects_active_count,
    metric_projects_overdue_count,
    metric_projects_wip_by_stage,
    metric_projects_throughput_time_series,
    metric_projects_throughput_sparkline,
    metric_projects_top_overdue,
)

# Maps metric key -> callable(shop=..., time_range=..., **kwargs) -> payload dict
METRIC_REGISTRY = {
    # Project-level shop aggregates
    "projects.active_count": metric_projects_active_count,
    "projects.overdue_count": metric_projects_overdue_count,
    "projects.wip_by_stage": metric_projects_wip_by_stage,
    "projects.throughput_30d": metric_projects_throughput_time_series,
    "projects.throughput_sparkline_30d": metric_projects_throughput_sparkline,
    "projects.top_overdue": metric_projects_top_overdue,
}


# Capability requirements per metric key.
# We're not strictly enforcing this yet, but it's ready for when
# you wire real per-user capabilities into the system.
METRIC_CAPABILITIES = {
    "projects.active_count": ["view_shop_aggregates"],
    "projects.overdue_count": ["view_shop_aggregates"],
    "projects.wip_by_stage": ["view_shop_aggregates"],
    "projects.throughput_30d": ["view_shop_aggregates"],
    "projects.throughput_sparkline_30d": ["view_shop_aggregates"],
    "projects.top_overdue": ["view_shop_aggregates"],
}
