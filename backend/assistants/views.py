# backend/assistants/views.py
from rest_framework import viewsets

from .models import AssistantProfile, AssistantSession, AssistantMessage
from .serializers import (
    AssistantProfileSerializer,
    AssistantSessionSerializer,
    AssistantMessageSerializer,
)


class AssistantProfileViewSet(viewsets.ModelViewSet):
    queryset = AssistantProfile.objects.all()
    serializer_class = AssistantProfileSerializer


class AssistantSessionViewSet(viewsets.ModelViewSet):
    queryset = AssistantSession.objects.all()
    serializer_class = AssistantSessionSerializer


class AssistantMessageViewSet(viewsets.ModelViewSet):
    queryset = AssistantMessage.objects.all()
    serializer_class = AssistantMessageSerializer
