# backend/analytics/views.py
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions

from .models import AnalyticsSnapshot, AnalyticsEvent
from .serializers import AnalyticsSnapshotSerializer, AnalyticsEventSerializer

from .metrics.registry import METRIC_REGISTRY, METRIC_CAPABILITIES
from .utils import get_shop_for_user


class AnalyticsSnapshotViewSet(viewsets.ModelViewSet):
    queryset = AnalyticsSnapshot.objects.all()
    serializer_class = AnalyticsSnapshotSerializer


class AnalyticsEventViewSet(viewsets.ModelViewSet):
    queryset = AnalyticsEvent.objects.all()
    serializer_class = AnalyticsEventSerializer

class AnalyticsMetricView(APIView):
    """
    Generic entry point for metric-style analytics.

    GET /api/analytics/metrics/?key=projects.active_count&time_range=30d

    Response:
    {
      "key": "projects.active_count",
      "dataSourceType": "metric",
      "meta": {...},
      "payload": {...}  # shape depends on metric kind
    }
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        key = request.query_params.get("key")
        time_range = request.query_params.get("time_range") or "30d"

        if not key:
            return Response(
                {"detail": "Metric key 'key' is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        metric_func = METRIC_REGISTRY.get(key)
        if metric_func is None:
            return Response(
                {"detail": f"Unknown metric key '{key}'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        shop = get_shop_for_user(request.user)
        if shop is None:
            return Response(
                {"detail": "No shop configured for current user."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Capability hook: not strictly enforcing yet, but ready.
        required_caps = METRIC_CAPABILITIES.get(key, [])
        # TODO: wire real user capability checks here later.

        try:
            payload = metric_func(shop=shop, time_range=time_range)
        except TypeError:
            # Backwards-compat if some metrics ignore time_range
            payload = metric_func(shop=shop)

        response_data = {
            "key": key,
            "dataSourceType": "metric",
            "meta": {
                "shopId": getattr(shop, "id", None),
                "timeRange": time_range,
            },
            "payload": payload,
        }
        return Response(response_data, status=status.HTTP_200_OK)