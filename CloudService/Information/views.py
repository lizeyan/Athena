from datetime import timedelta, datetime
from rest_framework import viewsets
from rest_framework.parsers import JSONParser
from account.interface import JSONResponse
from account.models import Profile
from information.models import ActivityGroup, Activity, RegisterLog
from information.permissions import ActivityGroupPermission, ActivityPermission, RegisterLogPermission
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
        elif self.request.user.profile.is_term_camera:
            start = timezone.now().date()
            end = start + timedelta(days=1)
            location_temp = self.request.user.profile.term_position
            return Activity.objects.filter(location=location_temp, begin_time__range=(start, end))
        else:
            profile = self.request.user.profile
            queryset_admin_group = profile.admin_activity_group.all()
            queryset = Activity.objects.filter(id=0)
            if queryset_admin_group.count() != 0:
                for admin_group in queryset_admin_group:
                    queryset = queryset | admin_group.activity.all()
            return queryset

    def get_serializer_class(self):
        if self.request.user.profile.is_term_camera:
            return ActivityQueryByTermSerializer
        else:
            return ActivitySerializer


class RegisterLogViewSet(viewsets.ModelViewSet):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    permission_classes = (permissions.IsAuthenticated, RegisterLogPermission)
    serializer_class = RegisterLogSerializer

    def get_queryset(self):
        if self.request.user.is_superuser == 1:
            return RegisterLog.objects.all()
        else:
            activity_id = self.request.GET.get('activity_id')
            user_id = self.request.GET.get('user_id')
            if user_id is None and activity_id is None:
                return RegisterLog.objects.filter(register_user_id=self.request.user.profile.id)
            elif user_id is None and activity_id is not None:
                activity_set = Activity.objects.filter(id=activity_id)
                if activity_set.count() == 0:
                    return RegisterLog.objects.filter(id=0)
                activity = activity_set.get(id=activity_id)

                activity_group_set = self.request.user.profile.admin_activity_group.filter(
                    id=activity.activity_group.id)
                if activity_group_set.count() == 0:
                    return RegisterLog.objects.filter(id=0)
                return RegisterLog.objects.filter(activity_id=activity_id)
            elif user_id is not None and activity_id is None:
                user_id = int(user_id)
                if user_id == self.request.user.id:
                    return RegisterLog.objects.filter(register_user_id=self.request.user.profile.id)
                else:
                    return RegisterLog.objects.filter(id=0)
            else:
                user_id = int(user_id)
                if user_id == self.request.user.id:
                    return RegisterLog.objects.filter(register_user_id=self.request.user.profile.id,
                                                      activity_id=activity_id)
                else:
                    return RegisterLog.objects.filter(id=0)

    def create(self, request, *args, **kwargs):
        if not request.user.profile.is_term_camera:
            responseMess = {'status': 'FORBIDDEN', }
            return JSONResponse(responseMess, status=403)

        data = JSONParser().parse(request)
        try:
            activity_id = data['activity_id']
            person_id = data['person_id']
        except Exception as e:
            print(e)
            responseMess = {'status': 'INPUT_STYLE_ERROR', 'suggestion': '请输入至少由course_id, person_id两项组成的JSON代码'}
            return JSONResponse(responseMess, status=400)

        profile_set = Profile.objects.filter(person_id=person_id)
        if profile_set.count() == 0:
            responseMess = {'status': 'NO_THIS_PERSON_ID', 'suggestion': '请输入正确的person_id'}
            return JSONResponse(responseMess, status=400)
        profile = profile_set.get(person_id=person_id)

        activity_set = Activity.objects.filter(id=activity_id)
        if activity_set.count() == 0:
            responseMess = {'status': 'NO_THIS_ACTIVITY_ID', 'suggestion': '请输入正确的activity_id'}
            return JSONResponse(responseMess, status=400)
        activity = activity_set.get(id=activity_id)

        location = activity.location
        if request.user.profile.term_position != location:
            responseMess = {'status': 'LOCATION_ERROR', 'suggestion': '该活动不在term的签到地点'}
            return JSONResponse(responseMess, status=400)

        time = datetime.now()
        if time < activity.begin_time or time > activity.end_time:
            responseMess = {'status': 'NOT_REGISTER_TIME', 'suggestion': '当前不是该活动的签到时间'}
            return JSONResponse(responseMess, status=400)

        activity_group = activity.activity_group
        profile_normal_activity_group = profile.normal_activity_group.filter(id=activity_group.id)
        if profile_normal_activity_group.count() == 0:
            responseMess = {'status': 'NOT_ACTIVITY_NORMAL_MEMBER', 'suggestion': '不是本活动需要签到的用户'}
            return JSONResponse(responseMess, status=400)

        register_set = RegisterLog.objects.filter(register_user=profile, activity=activity)
        if register_set.count() != 0:
            responseMess = {'status': 'ALREADY_REGISTERED', 'suggestion': '此用户已经签到'}
            return JSONResponse(responseMess, status=400)

        new_register_log = RegisterLog(register_user=profile, activity=activity)
        new_register_log.save()
        responseMess = {'status': 'CREATED'}
        return JSONResponse(responseMess, status=201)
