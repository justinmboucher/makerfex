# backend/products/views.py
from rest_framework import viewsets

from .models import ProductTemplate, ProjectPromotion
from .serializers import ProductTemplateSerializer, ProjectPromotionSerializer


class ProductTemplateViewSet(viewsets.ModelViewSet):
    queryset = ProductTemplate.objects.all()
    serializer_class = ProductTemplateSerializer


class ProjectPromotionViewSet(viewsets.ModelViewSet):
    queryset = ProjectPromotion.objects.all()
    serializer_class = ProjectPromotionSerializer
