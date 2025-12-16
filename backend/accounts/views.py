# backend/accounts/views.py

from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from accounts.utils import get_shop_for_user
from .models import Shop, Employee, Station
from .serializers import ShopSerializer, EmployeeSerializer, StationSerializer


class ShopViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ShopSerializer
    queryset = Shop.objects.all()


class EmployeeViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = EmployeeSerializer
    queryset = Employee.objects.none()  # overridden by get_queryset

    def get_queryset(self):
        shop = get_shop_for_user(self.request.user)
        if not shop:
            return Employee.objects.none()
        return Employee.objects.filter(shop=shop).order_by("first_name", "last_name", "id")

    def perform_create(self, serializer):
        shop = get_shop_for_user(self.request.user)
        if not shop:
            raise ValueError("Current user has no shop configured.")
        serializer.save(shop=shop)


class StationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = StationSerializer
    queryset = Station.objects.none()  # overridden by get_queryset

    def get_queryset(self):
        shop = get_shop_for_user(self.request.user)
        if not shop:
            return Station.objects.none()
        return Station.objects.filter(shop=shop).order_by("name", "id")


class CurrentUserView(APIView):
    """
    Returns info about the currently authenticated user, their employee record,
    and their shop (if any).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        employee = (
            Employee.objects.select_related("shop")
            .filter(user=user)
            .first()
        )
        shop = employee.shop if employee else None

        data = {
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
            },
            "employee": None,
            "shop": None,
        }

        if employee:
            photo_url = None
            if employee.photo and hasattr(employee.photo, "url"):
                url = employee.photo.url
                photo_url = request.build_absolute_uri(url)

            data["employee"] = {
                "id": employee.id,
                "first_name": employee.first_name,
                "last_name": employee.last_name,
                "email": employee.email,
                "role": getattr(employee, "role", None),
                "is_manager": getattr(employee, "is_manager", False),
                "is_active": getattr(employee, "is_active", True),
                "photo_url": photo_url,
            }

        if shop:
            logo_url = None
            if shop.logo and hasattr(shop.logo, "url"):
                url = shop.logo.url
                logo_url = request.build_absolute_uri(url)

            data["shop"] = {
                "id": shop.id,
                "slug": shop.slug,
                "name": shop.name,
                "timezone": getattr(shop, "timezone", None),
                "currency_code": getattr(shop, "currency_code", None),
                "logo_url": logo_url,
            }

        return Response(data)
