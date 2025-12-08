# backend/accounts/views.py
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Shop, Employee, Station
from .serializers import ShopSerializer, EmployeeSerializer, StationSerializer


class ShopViewSet(viewsets.ModelViewSet):
    queryset = Shop.objects.all()
    serializer_class = ShopSerializer


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer


class StationViewSet(viewsets.ModelViewSet):
    queryset = Station.objects.all()
    serializer_class = StationSerializer


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
            data["employee"] = {
                "id": employee.id,
                "first_name": employee.first_name,
                "last_name": employee.last_name,
                "email": employee.email,
                "role": getattr(employee, "role", None),
                "is_manager": getattr(employee, "is_manager", False),
                "is_active": getattr(employee, "is_active", True),
            }

        if shop:
            data["shop"] = {
                "id": shop.id,
                "slug": shop.slug,
                "name": shop.name,
                "timezone": getattr(shop, "timezone", None),
                "currency_code": getattr(shop, "currency_code", None),
            }

        return Response(data)