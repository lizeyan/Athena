from rest_framework import viewsets
from information.models import ActivityGroup, Activity, RegisterLog
from information.permissions import ActivityGroupPermission
from information.serializers import ActivityGroupSerializer, ActivitySerializer, RegisterLogSerializer
from rest_framework import permissions


class ActivityGroupViewSet(viewsets.ModelViewSet):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    serializer_class = ActivityGroupSerializer
    permission_classes = (permissions.IsAuthenticated, ActivityGroupPermission)

    def get_queryset(self):
        if self.request.user.is_superuser == 1:
            return ActivityGroup.objects.all()
        else:
            profile = self.request.user.profile
            queryset = profile.admin_activity_group.all() | profile.normal_activity_group.all()
            return queryset


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
