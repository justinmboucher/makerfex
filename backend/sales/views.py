# backend/sales/views.py
from django.core.exceptions import FieldError
from rest_framework import viewsets
from rest_framework.filters import OrderingFilter
from rest_framework.permissions import IsAuthenticated

from accounts.utils import get_shop_for_user
from makerfex_backend.filters import QueryParamSearchFilter

from .models import SalesOrder, SalesOrderLine
from .serializers import SalesOrderSerializer, SalesOrderLineSerializer

def _try_scope_to_shop(qs, shop, candidate_filters):
  """
  Try a sequence of queryset filters until one works.
  This keeps tenant scoping robust even if field names vary slightly.
  """
  for kwargs in candidate_filters:
    try:
      return qs.filter(**kwargs)
    except FieldError:
      continue
  # If we can't safely scope, return empty rather than leaking data.
  return qs.none()

class SalesOrderViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = SalesOrderSerializer
    queryset = SalesOrder.objects.none()

    # Canonical server-driven table contract
    filter_backends = [QueryParamSearchFilter, OrderingFilter]
    search_fields = ["id"]
    ordering_fields = ["id"]
    ordering = ("-id",)

    def get_queryset(self):
        shop = get_shop_for_user(self.request.user)
        if not shop:
            return SalesOrder.objects.none()

        base = SalesOrder.objects.all()
        return _try_scope_to_shop(
        base,
        shop,
        candidate_filters=[
            {"shop": shop},
            {"shop_id": shop.id},
            {"customer__shop": shop},
            {"customer__shop_id": shop.id},
            {"project__shop": shop},
            {"project__shop_id": shop.id},
        ],
        )


class SalesOrderLineViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = SalesOrderLineSerializer
    queryset = SalesOrderLine.objects.none()

 # Canonical server-driven table contract
    filter_backends = [QueryParamSearchFilter, OrderingFilter]
    search_fields = ["id"]
    ordering_fields = ["id"]
    ordering = ("-id",)

    def get_queryset(self):
        shop = get_shop_for_user(self.request.user)
        if not shop:
            return SalesOrderLine.objects.none()

        base = SalesOrderLine.objects.all()
        return _try_scope_to_shop(
            base,
            shop,
            candidate_filters=[
            {"shop": shop},
            {"shop_id": shop.id},
            {"order__shop": shop},
            {"order__shop_id": shop.id},
            {"order__customer__shop": shop},
            {"order__customer__shop_id": shop.id},
            {"order__project__shop": shop},
            {"order__project__shop_id": shop.id},
        ],
    )
