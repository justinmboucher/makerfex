# backend/products/urls.py
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ProductTemplateViewSet, ProjectPromotionViewSet

router = DefaultRouter()
router.register(r"templates", ProductTemplateViewSet, basename="producttemplate")
router.register(r"promotions", ProjectPromotionViewSet, basename="projectpromotion")

urlpatterns = [
    path("", include(router.urls)),
]
