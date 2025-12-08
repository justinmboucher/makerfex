# backend/analytics/views.py
from rest_framework import viewsets

from .models import AnalyticsSnapshot, AnalyticsEvent
from .serializers import AnalyticsSnapshotSerializer, AnalyticsEventSerializer


class AnalyticsSnapshotViewSet(viewsets.ModelViewSet):
    queryset = AnalyticsSnapshot.objects.all()
    serializer_class = AnalyticsSnapshotSerializer


class AnalyticsEventViewSet(viewsets.ModelViewSet):
    queryset = AnalyticsEvent.objects.all()
    serializer_class = AnalyticsEventSerializer
