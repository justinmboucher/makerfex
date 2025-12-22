# backend/customers/views.py

from rest_framework import viewsets
from rest_framework.filters import OrderingFilter
from rest_framework.permissions import IsAuthenticated

from accounts.utils import get_shop_for_user
from makerfex_backend.filters import QueryParamSearchFilter, is_truthy
from makerfex_backend.mixins import ServerTableViewSetMixin, ShopScopedQuerysetMixin

from .models import Customer
from .serializers import CustomerSerializer


class CustomerViewSet(ServerTableViewSetMixin, ShopScopedQuerysetMixin, viewsets.ModelViewSet):
    """
    Customer API scoped to the current user's shop.

    Query contract (global):
      ?q=         free-text search
      ?ordering=  asc/desc sorting
      ?page= / ?page_size= pagination
    """

    permission_classes = [IsAuthenticated]
    serializer_class = CustomerSerializer
    queryset = Customer.objects.none()  # overridden by get_queryset
    filter_backends = [QueryParamSearchFilter, OrderingFilter]

    # Enables global ?q= behavior (via your QueryParamSearchFilter)
    search_fields = [
        "first_name",
        "last_name",
        "company_name",
        "email",
        "phone",
    ]

    # Enables global ?ordering= behavior
    ordering_fields = [
        "first_name",
        "last_name",
        "email",
        "phone",
        "is_vip",
        "created_at",
        "updated_at",
    ]

    # Default ordering when no ?ordering= is provided
    ordering = ["-created_at"]

    
    def get_shop_queryset(self, shop):
        qs = Customer.objects.filter(shop=shop)

        if is_truthy(self.request.query_params.get("vip")):
            qs = qs.filter(is_vip=True)

        return qs

    def perform_create(self, serializer):
        shop = get_shop_for_user(self.request.user)
        if not shop:
            raise ValueError("Current user has no shop configured.")
        serializer.save(shop=shop)
