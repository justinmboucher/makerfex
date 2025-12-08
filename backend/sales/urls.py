# backend/sales/urls.py
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import SalesOrderViewSet, SalesOrderLineViewSet

router = DefaultRouter()
router.register(r"orders", SalesOrderViewSet, basename="salesorder")
router.register(r"lines", SalesOrderLineViewSet, basename="salesorderline")

urlpatterns = [
    path("", include(router.urls)),
]
