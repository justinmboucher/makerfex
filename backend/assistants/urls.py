# backend/assistants/urls.py
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AssistantProfileViewSet,
    AssistantSessionViewSet,
    AssistantMessageViewSet,
)

router = DefaultRouter()
router.register(r"profiles", AssistantProfileViewSet, basename="assistantprofile")
router.register(r"sessions", AssistantSessionViewSet, basename="assistantsession")
router.register(r"messages", AssistantMessageViewSet, basename="assistantmessage")

urlpatterns = [
    path("", include(router.urls)),
]
