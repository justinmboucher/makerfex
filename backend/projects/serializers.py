# backend/projects/serializers.py

from rest_framework import serializers
from .models import Project


class ProjectSerializer(serializers.ModelSerializer):
    customer_name = serializers.SerializerMethodField()
    photo_url = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()
    assigned_to_name = serializers.SerializerMethodField()

    station_name = serializers.SerializerMethodField()
    workflow_name = serializers.SerializerMethodField()
    current_stage_name = serializers.SerializerMethodField()
    can_log_sale = serializers.SerializerMethodField()

    # comes from queryset annotation in ProjectViewSet
    is_completed = serializers.BooleanField(read_only=True)

    class Meta:
        model = Project
        fields = [
            "id",
            "shop",
            "customer",
            "customer_name",
            "photo",
            "photo_url",
            "name",
            "reference_code",
            "description",
            "workflow",
            "current_stage",
            "priority",
            "status",
            "start_date",
            "due_date",
            "completed_at",
            "created_by",
            "created_by_name",
            "assigned_to",
            "assigned_to_name",
            "station",
            "station_name",
            "workflow_name",
            "current_stage_name",
            "can_log_sale",
            "is_completed",
            "estimated_hours",
            "actual_hours",
            "is_archived",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
            "photo_url",
            "customer_name",
            "created_by_name",
            "assigned_to_name",
            "station_name",
            "workflow_name",
            "current_stage_name",
            "can_log_sale",
            "is_completed",
        ]

    def _employee_display_name(self, emp):
        if not emp:
            return None

        first = getattr(emp, "first_name", None) or ""
        last = getattr(emp, "last_name", None) or ""
        full = f"{first} {last}".strip()
        if full:
            return full

        user = getattr(emp, "user", None)
        if user:
            if hasattr(user, "get_full_name"):
                n = user.get_full_name().strip()
                if n:
                    return n
            return getattr(user, "username", None) or getattr(user, "email", None)

        return str(emp)

    def get_assigned_to_name(self, obj):
        return self._employee_display_name(obj.assigned_to)

    def get_created_by_name(self, obj):
        return self._employee_display_name(obj.created_by)

    def get_customer_name(self, obj):
        customer = obj.customer
        if not customer:
            return None
        first = getattr(customer, "first_name", "") or ""
        last = getattr(customer, "last_name", "") or ""
        full = f"{first} {last}".strip()
        return full or getattr(customer, "company_name", None)

    def get_photo_url(self, obj):
        request = self.context.get("request")
        if obj.photo and hasattr(obj.photo, "url"):
            url = obj.photo.url
            return request.build_absolute_uri(url) if request else url
        return None

    def get_station_name(self, obj):
        return getattr(obj.station, "name", None) if getattr(obj, "station", None) else None

    def get_workflow_name(self, obj):
        return getattr(obj.workflow, "name", None) if getattr(obj, "workflow", None) else None

    def get_current_stage_name(self, obj):
        return getattr(obj.current_stage, "name", None) if getattr(obj, "current_stage", None) else None

    def get_can_log_sale(self, obj):
        st = getattr(obj, "current_stage", None)
        return bool(getattr(st, "allows_sale_log", False)) if st else False
