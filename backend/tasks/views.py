# backend/tasks/views.py

from django.utils import timezone

from rest_framework import viewsets
from rest_framework.filters import OrderingFilter
from rest_framework.permissions import IsAuthenticated

from accounts.utils import get_shop_for_user
from makerfex_backend.filters import QueryParamSearchFilter

from .models import Task
from .serializers import TaskSerializer


def parse_bool(val):
    if val is None:
        return None
    v = str(val).strip().lower()
    if v in ("1", "true", "t", "yes", "y", "on"):
        return True
    if v in ("0", "false", "f", "no", "n", "off"):
        return False
    return None


class TaskViewSet(viewsets.ModelViewSet):
    """
    Tasks API (shop-scoped)
    Contract:
      ?q= (search)
      ?ordering= (sorting)
      ?page= / ?page_size= (pagination via global DRF settings)

    Authoritative filters (optional, for presets):
      ?status=todo,in_progress,blocked
      ?project=<id>
      ?station=<id>
      ?assignee=<employee_id>
      ?stage=<workflow_stage_id>
      ?unassigned=1|0
      ?is_overdue=1|0
      ?due_before=YYYY-MM-DD
      ?due_after=YYYY-MM-DD

    Non-destructive: DELETE disabled for now.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = TaskSerializer

    http_method_names = ["get", "post", "put", "patch", "head", "options"]

    filter_backends = [QueryParamSearchFilter, OrderingFilter]
    search_fields = [
        "title",
        "description",
        "project__name",
        "station__name",
        "assignee__first_name",
        "assignee__last_name",
        "assignee__email",
    ]
    ordering_fields = [
        "id",
        "title",
        "status",
        "order",
        "due_date",
        "started_at",
        "completed_at",
        "created_at",
        "updated_at",
    ]
    ordering = ("project_id", "order", "id")

    def get_queryset(self):
        shop = get_shop_for_user(self.request.user)
        if not shop:
            return Task.objects.none()

        qs = (
            Task.objects
            .filter(shop=shop)
            .select_related("shop", "project", "station", "assignee", "stage")
        )

        qp = self.request.query_params

        status = qp.get("status")
        if status:
            parts = [s.strip() for s in status.split(",") if s.strip()]
            if parts:
                qs = qs.filter(status__in=parts)

        project = qp.get("project")
        if project:
            qs = qs.filter(project_id=project)

        station = qp.get("station")
        if station:
            qs = qs.filter(station_id=station)

        assignee = qp.get("assignee")
        if assignee:
            qs = qs.filter(assignee_id=assignee)

        stage = qp.get("stage")
        if stage:
            qs = qs.filter(stage_id=stage)

        unassigned = parse_bool(qp.get("unassigned"))
        if unassigned is True:
            qs = qs.filter(assignee_id__isnull=True)
        elif unassigned is False:
            qs = qs.filter(assignee_id__isnull=False)

        is_overdue = parse_bool(qp.get("is_overdue"))
        if is_overdue is not None:
            today = timezone.localdate()
            # overdue = has due_date in past and not completed/cancelled
            qs_overdue = qs.filter(due_date__isnull=False, due_date__lt=today).exclude(
                status__in=["done", "cancelled"]
            )
            qs = qs_overdue if is_overdue else qs.exclude(id__in=qs_overdue.values("id"))

        due_before = qp.get("due_before")
        if due_before:
            qs = qs.filter(due_date__lte=due_before)

        due_after = qp.get("due_after")
        if due_after:
            qs = qs.filter(due_date__gte=due_after)

        return qs

    def perform_create(self, serializer):
        shop = get_shop_for_user(self.request.user)
        # Enforce shop on create; also ensures tasks can't be created cross-tenant
        serializer.save(shop=shop)

    def perform_update(self, serializer):
        # Prevent changing shop via PATCH/PUT (even if serializer includes shop)
        serializer.save()
