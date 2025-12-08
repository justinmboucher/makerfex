# backend/config/views.py
from rest_framework import viewsets

from .models import ShopConfig, IntegrationConfig
from .serializers import ShopConfigSerializer, IntegrationConfigSerializer


class ShopConfigViewSet(viewsets.ModelViewSet):
    queryset = ShopConfig.objects.all()
    serializer_class = ShopConfigSerializer


class IntegrationConfigViewSet(viewsets.ModelViewSet):
    queryset = IntegrationConfig.objects.all()
    serializer_class = IntegrationConfigSerializer
