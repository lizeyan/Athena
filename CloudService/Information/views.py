from rest_framework import viewsets
from information.models import ActivityGroup, Activity, RegisterLog
from information.serializers import ActivityGroupSerializer, ActivitySerializer, RegisterLogSerializer


class ActivityGroupViewSet(viewsets.ModelViewSet):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    serializer_class = ActivityGroupSerializer
    queryset = ActivityGroup.objects.all()


class ActivityViewSet(viewsets.ModelViewSet):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    serializer_class = ActivitySerializer
    queryset = Activity.objects.all()


class RegisterLogViewSet(viewsets.ModelViewSet):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    serializer_class = RegisterLogSerializer
    queryset = RegisterLog.objects.all()
