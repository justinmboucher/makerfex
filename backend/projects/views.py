# backend/projects/views.py
# ============================================================================
# Projects ViewSet (Server-Driven Tables)
# ----------------------------------------------------------------------------
# Canonical list contract:
# - ?q=        free-text search (QueryParamSearchFilter)
# - ?ordering= server-side ordering (asc/desc)
# - ?page= / ?page_size= pagination (DRF settings)
#
# Backend-authoritative filters (used by UI presets + selects):
# - ?customer= / ?customer_id=
# - ?assigned_to= / ?assigned_to_id=
# - ?current_stage= / ?stage=
# - ?station= / ?station_id=
# - ?status= (active|on_hold|completed|cancelled)
# - ?is_completed=true/false   (stage-final truth)
# - ?vip=1                     (customer VIP flag if present)
# - ?overdue=1                 (due_date < today AND not completed/cancelled)
#
# Tenant safety:
# - Querysets are always scoped to request.user's shop via get_shop_for_user()
# ============================================================================

from django.db.models import BooleanField, Case, Q, Value, When
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.filters import OrderingFilter
from rest_framework.permissions import IsAuthenticated

from accounts.models import Employee
from accounts.utils import get_shop_for_user
from makerfex_backend.filters import QueryParamSearchFilter

from projects.models import Project
from projects.serializers import ProjectSerializer


def _parse_bool(v):
    if v is None:
        return None
    s = str(v).strip().lower()
    if s in {"1", "true", "t", "yes", "y", "on"}:
        return True
    if s in {"0", "false", "f", "no", "n", "off"}:
        return False
    return None


class ProjectViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ProjectSerializer
    queryset = Project.objects.none()

    # Canonical server-driven table backends
    filter_backends = [QueryParamSearchFilter, OrderingFilter]

    # Free-text search fields (QueryParamSearchFilter uses ?q=)
    search_fields = [
        "name",
        "reference_code",
        "description",
        # customer name bits (safe even if customer null)
        "customer__first_name",
        "customer__last_name",
        "customer__company_name",
    ]

    # Explicit ordering support (?ordering=field or ?ordering=-field)
    ordering_fields = [
        "name",
        "reference_code",
        "priority",
        "status",
        "start_date",
        "due_date",
        "completed_at",
        "created_at",
        "updated_at",
        "station__name",
        "customer__last_name",
        "assigned_to__last_name",
        # workflow/stage ordering (useful for UI sorts)
        "current_stage__order",
        "current_stage__name",
    ]
    ordering = ["-created_at"]

    def get_shop(self):
        return get_shop_for_user(self.request.user)

    def get_employee(self, shop):
        if not shop:
            return None
        return Employee.objects.filter(shop=shop, user=self.request.user).first()

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

        # Compatibility aliases
        customer_id = qp.get("customer") or qp.get("customer_id")
        if customer_id:
            qs = qs.filter(customer_id=customer_id)

        assigned_to_id = qp.get("assigned_to") or qp.get("assigned_to_id")
        if assigned_to_id:
            qs = qs.filter(assigned_to_id=assigned_to_id)

        # Stage filter
        stage_id = qp.get("current_stage") or qp.get("stage")
        if stage_id:
            qs = qs.filter(current_stage_id=stage_id)

        # Station filter (canonical: Project.station_id)
        station_id = qp.get("station") or qp.get("station_id")
        if station_id:
            # Transitional compatibility:
            # Include (project.station == station) OR (assigned_to employee is in station)
            qs = qs.filter(Q(station_id=station_id) | Q(assigned_to__stations__id=station_id)).distinct()

        # Status filter
        status = qp.get("status")
        if status:
            qs = qs.filter(status=status)

        # Completion filter: ?is_completed=true/false
        is_completed = _parse_bool(qp.get("is_completed"))
        if is_completed is True:
            qs = qs.filter(current_stage__is_final=True)
        elif is_completed is False:
            qs = qs.exclude(current_stage__is_final=True)

        # VIP filter: ?vip=1
        # (Customer model typically uses is_vip; we guard with a try to avoid hard failures.)
        vip = _parse_bool(qp.get("vip"))
        if vip is True:
            # If the field doesn't exist, Django will raise FieldError; keep it safe.
            try:
                qs = qs.filter(customer__is_vip=True)
            except Exception:
                pass

        # Overdue filter: ?overdue=1
        overdue = _parse_bool(qp.get("overdue"))
        if overdue is True:
            today = timezone.localdate()
            qs = qs.filter(due_date__lt=today).exclude(status__in=[Project.Status.COMPLETED, Project.Status.CANCELLED])

        return qs

    def perform_create(self, serializer):
        shop = self.get_shop()
        if not shop:
            raise ValueError("Current user has no shop configured.")
        emp = self.get_employee(shop)
        serializer.save(shop=shop, created_by=emp)
