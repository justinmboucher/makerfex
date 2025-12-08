# backend/workflows/urls.py
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import WorkflowViewSet, WorkflowStageViewSet

router = DefaultRouter()
router.register(r"workflows", WorkflowViewSet, basename="workflow")
router.register(r"stages", WorkflowStageViewSet, basename="workflowstage")

urlpatterns = [
    path("", include(router.urls)),
]
