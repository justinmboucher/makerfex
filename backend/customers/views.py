# backend/customers/views.py

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from accounts.utils import get_shop_for_user
from .models import Customer
from .serializers import CustomerSerializer


class CustomerViewSet(viewsets.ModelViewSet):
    """
    Customer API scoped to the current user's shop.

    Rules:
    - Users may only see customers belonging to their shop
    - New customers are automatically assigned to the user's shop
    """
    permission_classes = [IsAuthenticated]
    serializer_class = CustomerSerializer
    queryset = Customer.objects.none()  # overridden by get_queryset

    def get_queryset(self):
        shop = get_shop_for_user(self.request.user)
        if not shop:
            return Customer.objects.none()
        return Customer.objects.filter(shop=shop).order_by("-created_at")

    def perform_create(self, serializer):
        shop = get_shop_for_user(self.request.user)
        if not shop:
            raise ValueError("Current user has no shop configured.")
        serializer.save(shop=shop)
