# backend/workflows/views.py
from rest_framework import viewsets

from .models import Workflow, WorkflowStage
from .serializers import WorkflowSerializer, WorkflowStageSerializer


class WorkflowViewSet(viewsets.ModelViewSet):
    queryset = Workflow.objects.all()
    serializer_class = WorkflowSerializer


class WorkflowStageViewSet(viewsets.ModelViewSet):
    queryset = WorkflowStage.objects.all()
    serializer_class = WorkflowStageSerializer
