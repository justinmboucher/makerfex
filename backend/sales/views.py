# backend/sales/views.py
from rest_framework import viewsets

from .models import SalesOrder, SalesOrderLine
from .serializers import SalesOrderSerializer, SalesOrderLineSerializer


class SalesOrderViewSet(viewsets.ModelViewSet):
    queryset = SalesOrder.objects.all()
    serializer_class = SalesOrderSerializer


class SalesOrderLineViewSet(viewsets.ModelViewSet):
    queryset = SalesOrderLine.objects.all()
    serializer_class = SalesOrderLineSerializer
