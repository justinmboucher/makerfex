# backend/analytics/urls.py
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import AnalyticsSnapshotViewSet, AnalyticsEventViewSet

router = DefaultRouter()
router.register(r"snapshots", AnalyticsSnapshotViewSet, basename="analyticssnapshot")
router.register(r"events", AnalyticsEventViewSet, basename="analyticsevent")

urlpatterns = [
    path("", include(router.urls)),
]
