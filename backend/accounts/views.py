# backend/accounts/views.py

from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.utils import get_shop_for_user
from makerfex_backend.filters import QueryParamSearchFilter

from .models import Shop, Employee, Station
from .serializers import ShopSerializer, EmployeeSerializer, StationSerializer

from projects.models import Project


def parse_bool(val):
    if val is None:
        return None
    v = str(val).strip().lower()
    if v in ("1", "true", "t", "yes", "y", "on"):
        return True
    if v in ("0", "false", "f", "no", "n", "off"):
        return False
    return None

class ShopViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ShopSerializer
    queryset = Shop.objects.all()


class EmployeeViewSet(viewsets.ModelViewSet):
    """
    Employees API
    - Shop-scoped queryset
    - Server table contract:
      ?q=         (search)
      ?ordering=  (sorting)
      ?page= / ?page_size= (pagination via global DRF settings)
      Optional:
      ?is_active=true|false
      ?with_counts=1 (enrich list results)
    """
    permission_classes = [IsAuthenticated]
    serializer_class = EmployeeSerializer
    queryset = Employee.objects.none()

    # ✅ Contract support
    filter_backends = [QueryParamSearchFilter, OrderingFilter]
    search_fields = [
        "first_name",
        "last_name",
        "email",
        "role",
        "user__username", 
        "user__email", 
        "user__first_name", 
        "user__last_name"
    ]
    ordering_fields = [
        "first_name",
        "last_name",
        "email",
        "role",
        "is_active", 
        "is_manager",
        "created_at", 
        "updated_at",
        "id",
    ]
    ordering = ("first_name", "last_name", "id")  # default ordering when no ?ordering=

    def get_queryset(self):
        shop = get_shop_for_user(self.request.user)
        if not shop:
            return Employee.objects.none()

        qs = (
            Employee.objects
            .filter(shop=shop)
            .select_related("user", "shop")
        )

        # Optional backend filter (so presets can be authoritative)
        is_active = parse_bool(self.request.query_params.get("is_active"))
        if is_active is not None:
            qs = qs.filter(is_active=is_active)

        return qs

    @action(detail=False, methods=["get"], url_path="me")
    def me(self, request):
        """
        Return the Employee record for the currently authenticated user.
        GET /api/accounts/employees/me/
        """
        employee = get_object_or_404(
            self.get_queryset(),
            user=request.user,
        )
        serializer = self.get_serializer(employee)
        return Response(serializer.data)

    def list(self, request, *args, **kwargs):
        """
        Optional:
        /api/accounts/employees/?with_counts=1

        Adds:
        - assigned_project_count (projects assigned to employee, not archived, shop-scoped)
        - overdue_project_count
        """
        response = super().list(request, *args, **kwargs)

        with_counts = request.query_params.get("with_counts")
        if not with_counts or with_counts in ("0", "false", "False"):
            return response

        shop = get_shop_for_user(request.user)
        if not shop:
            return response

        today = timezone.localdate()

        assigned_counts = (
            Project.objects
            .filter(shop=shop, is_archived=False, assigned_to_id__isnull=False)
            .values("assigned_to_id")
            .annotate(c=Count("id"))
        )
        assigned_map = {row["assigned_to_id"]: row["c"] for row in assigned_counts}

        not_done_q = ~(
            Q(status__iexact="done")
            | Q(status__iexact="completed")
            | Q(status__iexact="complete")
            | Q(status__iexact="cancelled")
            | Q(status__iexact="canceled")
        )

        overdue_counts = (
            Project.objects
            .filter(
                shop=shop,
                is_archived=False,
                assigned_to_id__isnull=False,
                due_date__isnull=False,
                due_date__lt=today,
            )
            .filter(not_done_q)
            .values("assigned_to_id")
            .annotate(c=Count("id"))
        )
        overdue_map = {row["assigned_to_id"]: row["c"] for row in overdue_counts}

        # response.data can be list or paginated dict
        if isinstance(response.data, dict) and "results" in response.data:
            items = response.data["results"]
        else:
            items = response.data

        for item in items:
            eid = item.get("id")
            item["assigned_project_count"] = int(assigned_map.get(eid, 0))
            item["overdue_project_count"] = int(overdue_map.get(eid, 0))

        return response


class StationViewSet(viewsets.ModelViewSet):
    """
    Stations API
    - Shop-scoped queryset
    - Server table contract:
      ?q=         (search)
      ?ordering=  (sorting)
      ?page= / ?page_size= (pagination via global DRF settings)
      Optional:
      ?is_active=true|false
    """
    permission_classes = [IsAuthenticated]
    serializer_class = StationSerializer
    queryset = Station.objects.none()

    # ✅ Contract support
    filter_backends = [QueryParamSearchFilter, OrderingFilter]
    search_fields = [
        "name",
        "code",
        "description",
    ]
    ordering_fields = [
        "name",
        "code",
        "is_active",
        "employee_count",  # annotate below
        "id",
    ]
    ordering = ("name", "id")

    def get_queryset(self):
        shop = get_shop_for_user(self.request.user)
        if not shop:
            return Station.objects.none()

        qs = (
            Station.objects
            .filter(shop=shop)
            .prefetch_related("employees")  # for employees_detail
            .annotate(employee_count=Count("employees", distinct=True))
        )

        # Optional backend filter (so presets work)
        is_active = parse_bool(self.request.query_params.get("is_active"))
        if is_active in ("true", "True", "1"):
            qs = qs.filter(is_active=True)
        elif is_active in ("false", "False", "0"):
            qs = qs.filter(is_active=False)

        return qs


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
