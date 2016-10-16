from datetime import timedelta
from rest_framework import viewsets
from rest_framework.parsers import JSONParser

from account.interface import JSONResponse
from account.models import Profile
from information.models import ActivityGroup, Activity, RegisterLog
from information.permissions import ActivityGroupPermission, ActivityPermission
from information.serializers import ActivityGroupSerializer, ActivitySerializer, RegisterLogSerializer, \
    ActivityQueryByTermSerializer
from rest_framework import permissions
from django.utils import timezone


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
    permission_classes = (permissions.IsAuthenticated, ActivityPermission)

    def get_queryset(self):
        if self.request.user.is_superuser == 1:
            return Activity.objects.all()
        else:
            start = timezone.now().date()
            end = start + timedelta(days=1)
            location_temp = self.request.user.profile.term_position
            return Activity.objects.filter(location=location_temp, begin_time__range=(start, end))

    def get_serializer_class(self):
        if self.request.user.profile.is_term_camera:
            return ActivityQueryByTermSerializer
        else:
            return ActivitySerializer


class RegisterLogViewSet(viewsets.ModelViewSet):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    serializer_class = RegisterLogSerializer
    queryset = RegisterLog.objects.all()

    def create(self, request, *args, **kwargs):
        responseMess = {}
        data = JSONParser().parse(request)
        try:
            activity_id = data['activity_id']
            person_id = data['person_id']
        except Exception as e:
            print(e)
            responseMess['status'] = 'INPUT_STYLE_ERROR'
            responseMess['suggestion'] = '请输入至少由course_id, person_id两项组成的JSON代码'
            return JSONResponse(responseMess, status=400)

        profile_set = Profile.objects.filter(person_id=person_id)
        if profile_set.count() == 0:
            responseMess['status'] = 'NO_THIS_PERSON_ID'
            responseMess['suggestion'] = '请输入正确的person_id'
            return JSONResponse(responseMess, status=400)
        profile = profile_set.get(person_id=person_id)

        activity_set = Activity.objects.filter(id=activity_id)
        if activity_set.count() == 0:
            responseMess['status'] = 'NO_THIS_ACTIVITY_ID'
            responseMess['suggestion'] = '请输入正确的activity_id'
            return JSONResponse(responseMess, status=400)
        activity = activity_set.get(id=activity_id)

        activity_group = activity.activity_group
        profile_normal_activity_group = profile.normal_activity_group.filter(id=activity_group.id)
        if profile_normal_activity_group.count() == 0:
            responseMess['status'] = 'NOT_ACTIVITY_NORMAL_MEMBER'
            responseMess['suggestion'] = '不是本活动需要签到的用户'
            return JSONResponse(responseMess, status=400)

        register_set = RegisterLog.objects.filter(register_user=profile, activity=activity)
        if register_set.count() != 0:
            responseMess['status'] = 'ALREADY_REGISTERED'
            responseMess['suggestion'] = '不是本活动需要签到的用户'
            return JSONResponse(responseMess, status=400)

        new_register_log = RegisterLog(register_user=profile, activity=activity)
        new_register_log.save()
        responseMess['status'] = 'CREATED'
        return JSONResponse(responseMess, status=201)
