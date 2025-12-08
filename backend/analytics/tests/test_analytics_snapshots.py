import pytest
from sales.models import SalesOrder
from analytics.models import AnalyticsSnapshot

@pytest.mark.django_db
def test_monthly_revenue_snapshot_matches_paid_orders(demo_data):
    snapshots = AnalyticsSnapshot.objects.filter(metric_key="monthly_revenue")
    assert snapshots.exists()

    for snap in snapshots:
        year = snap.snapshot_date.year
        month = snap.snapshot_date.month

        paid_orders = SalesOrder.objects.filter(
            status=SalesOrder.Status.PAID,
            order_date__year=year,
            order_date__month=month,
        )

        total = sum(o.total_amount or 0 for o in paid_orders)
        assert round(float(snap.value), 2) == round(float(total), 2)
