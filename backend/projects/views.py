# backend/projects/views.py
from django.db.models import Q, BooleanField, Case, Value, When
from rest_framework import viewsets
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated

from accounts.models import Employee
from accounts.utils import get_shop_for_user
from projects.models import Project
from projects.serializers import ProjectSerializer


# -----------------------------------------------------------------------------
# Pagination
# -----------------------------------------------------------------------------
class ProjectsPagination(PageNumberPagination):
    """
    PageNumberPagination with per-request page size.
    Defaults match REST_FRAMEWORK["PAGE_SIZE"] but allow overrides.
    """
    page_size = 25
    page_size_query_param = "page_size"
    max_page_size = 100


# -----------------------------------------------------------------------------
# ViewSet
# -----------------------------------------------------------------------------
class ProjectViewSet(viewsets.ModelViewSet):
    """
    Shop-scoped Projects API.

    Supports:
    - Global DRF filters (configured in settings):
        - ?q= (SearchFilter)
        - ?ordering= (OrderingFilter)
    - Pagination:
        - ?page=
        - ?page_size= (10/25/50/100 encouraged; max 100)
    - Custom filters:
        - ?customer=
        - ?assigned_to=
        - ?current_stage=
        - ?station=
        - ?is_completed=true/false
        - ?vip=1
    """
    permission_classes = [IsAuthenticated]
    serializer_class = ProjectSerializer
    pagination_class = ProjectsPagination

    # DRF SearchFilter uses these fields (q param is global via settings)
    search_fields = [
        "name",
        "reference_code",
        "customer__first_name",
        "customer__last_name",
        "customer__company_name",
    ]

    # DRF OrderingFilter uses these fields
    ordering_fields = [
        "name",
        "due_date",
        "priority",
        "created_at",
        "updated_at",
        "station__name",
        "current_stage__order",
        "current_stage__name",
        "customer__last_name",
        "customer__first_name",
        "assigned_to__last_name",
        "assigned_to__first_name",
    ]
    ordering = ["-created_at"]

    def get_shop(self):
        return get_shop_for_user(self.request.user)

    def get_employee(self, shop):
        if not shop:
            return None
        return Employee.objects.filter(shop=shop, user=self.request.user).first()

    def _truthy_param(self, key: str) -> bool | None:
        """
        Parse a truthy/falsey query param.
        Returns:
          - True / False if parseable
          - None if missing/empty/unrecognized
        """
        raw = self.request.query_params.get(key)
        if raw is None:
            return None
        v = str(raw).strip().lower()
        if v == "":
            return None
        if v in ("1", "true", "yes", "y", "on"):
            return True
        if v in ("0", "false", "no", "n", "off"):
            return False
        return None

    def get_queryset(self):
        shop = self.get_shop()
        if not shop:
            return Project.objects.none()

        qs = (
            Project.objects.filter(shop=shop, is_archived=False)
            .select_related("customer", "assigned_to", "workflow", "current_stage", "station")
            .annotate(
                # Stage-truth completion: completed means current_stage.is_final
                is_completed=Case(
                    When(current_stage__is_final=True, then=Value(True)),
                    default=Value(False),
                    output_field=BooleanField(),
                )
            )
        )

        qp = self.request.query_params

        # Simple FK filters (keep canonical params; allow legacy aliases where helpful)
        customer_id = qp.get("customer") or qp.get("customer_id")
        if customer_id:
            qs = qs.filter(customer_id=customer_id)

        assigned_to_id = qp.get("assigned_to") or qp.get("assigned_to_id")
        if assigned_to_id:
            qs = qs.filter(assigned_to_id=assigned_to_id)

        stage_id = qp.get("current_stage") or qp.get("stage")
        if stage_id:
            qs = qs.filter(current_stage_id=stage_id)

        station_id = qp.get("station") or qp.get("station_id")
        if station_id:
            # Transitional compatibility:
            # - New truth: Project.station_id
            # - Old behavior: assigned_to is in station (employee.stations)
            #
            # NOTE: This introduces a join which can create dupes; only use distinct if needed.
            station_filter = Q(station_id=station_id) | Q(assigned_to__stations__id=station_id)
            qs = qs.filter(station_filter).distinct()

        # Completion filter: ?is_completed=true/false
        completed_bool = self._truthy_param("is_completed")
        if completed_bool is True:
            qs = qs.filter(current_stage__is_final=True)
        elif completed_bool is False:
            qs = qs.exclude(current_stage__is_final=True)

        # VIP filter: ?vip=1
        vip_bool = self._truthy_param("vip")
        if vip_bool is True:
            qs = qs.filter(customer__is_vip=True)

        return qs

    def perform_create(self, serializer):
        shop = self.get_shop()
        if not shop:
            raise ValueError("Current user has no shop configured.")
        emp = self.get_employee(shop)
        serializer.save(shop=shop, created_by=emp)
