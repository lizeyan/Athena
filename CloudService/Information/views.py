from datetime import timedelta, datetime
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework import viewsets
from rest_framework.authentication import BasicAuthentication
from rest_framework.authentication import SessionAuthentication
from rest_framework.decorators import api_view
from rest_framework.decorators import authentication_classes
from rest_framework.decorators import permission_classes
from rest_framework.parsers import JSONParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_jwt.authentication import JSONWebTokenAuthentication
from CloudService.settings import ROOT_ADDRESS
from account.interface import JSONResponse, get_new_group_id_from_link_face
from account.models import Profile
from information.models import ActivityGroup, Activity, RegisterLog
from information.permissions import ActivityGroupPermission, ActivityPermission, RegisterLogPermission
from information.serializers import ActivityGroupSerializer, ActivitySerializer, RegisterLogSerializer, \
    ActivityQueryByTermSerializer
from rest_framework import permissions
from django.utils import timezone


class ActivityGroupViewSet(viewsets.ModelViewSet):
    """
    You should provide `activity_group_name` when creating an activity,
    lists of `admin_user` and `normal_user` is optional(all is username)
    """
    serializer_class = ActivityGroupSerializer
    permission_classes = (permissions.IsAuthenticated, ActivityGroupPermission)

    def get_queryset(self):
        if self.request.user.is_superuser == 1:
            return ActivityGroup.objects.all()
        else:
            profile = self.request.user.profile
            queryset = profile.admin_activity_group.all() | profile.normal_activity_group.all()
            return queryset.distinct()

    def create(self, request, *args, **kwargs):
        try:
            data = JSONParser().parse(request)
            activity_group_name = data['activity_group_name']
        except Exception as e:
            print(e)
            responseMess = {'status': 'INPUT_STYLE_ERROR', 'suggestion': '请输入由activity_group_name项组成的JSON代码'}
            return JSONResponse(responseMess, status=400)

        admin_user_list = []
        normal_user_list = []
        try:
            admin_user_list = data['admin_user']
        except Exception as e:
            pass
        try:
            normal_user_list = data['normal_user']
        except Exception as e:
            pass
        activity_group = ActivityGroup(activity_group_name=activity_group_name)
        activity_group.group_id = get_new_group_id_from_link_face()
        activity_group.save()
        activity_group.admin_user.add(request.user.profile)

        admin_success = True
        normal_success = True
        for admin_user in admin_user_list:
            try:
                user = User.objects.get(username=admin_user)
                if user.id == request.user.id:
                    continue
                activity_group.admin_user.add(user.profile)
            except Exception as e:
                admin_success = False
        for normal_user in normal_user_list:
            try:
                if normal_user in admin_user_list:
                    continue
                user = User.objects.get(username=normal_user)
                if user.id == request.user.id:
                    continue
                activity_group.normal_user.add(user.profile)
            except Exception as e:
                normal_success = False

        url = ROOT_ADDRESS + 'activity_group/' + str(activity_group.id)
        if admin_success and normal_success:
            responseMess = {'status': 'CREATE_SUCCESS', 'url': url, 'pk': activity_group.id}
            return JSONResponse(responseMess, status=201)
        else:
            responseMess = {'status': 'CREATE_SUCCESS_SOME_ADD_FAILED', 'suggestion': '创建成功，但是某些成员添加失败',
                            'url': url, 'pk': activity_group.id}
            return JSONResponse(responseMess, status=201)


class ActivityViewSet(viewsets.ModelViewSet):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    permission_classes = (permissions.IsAuthenticated, ActivityPermission)
    activity_group_self = None

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
            return queryset.distinct()

    def get_serializer_class(self):
        if self.request.user.profile.is_term_camera:
            return ActivityQueryByTermSerializer
        else:
            return ActivitySerializer

    def perform_create(self, serializer):
        serializer.save(activity_group=self.activity_group_self)

    def create(self, request, *args, **kwargs):
        data = request.data
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        try:
            activity_group_id = data['activity_group_id']
        except Exception as e:
            responseMess = {'status': 'INPUT_STYLE_ERROR', 'suggestion': '请检查输入的JSON格式，需要有activity_group_id'}
            return JSONResponse(responseMess, status=400)
        activity_group_set = ActivityGroup.objects.filter(id=activity_group_id)
        if activity_group_set.count() == 0:
            responseMess = {'status': 'GROUP_NOT_EXIST', 'suggestion': '输入的activity_group_id不存在'}
            return JSONResponse(responseMess, status=400)
        activity_group = activity_group_set.get(id=activity_group_id)
        admin_set = activity_group.admin_user.filter(user=request.user)
        if admin_set.count() == 0:
            responseMess = {'status': 'NOT_GROUP_ADMIN', 'suggestion': '您不是activity_group的管理员，无法创建'}
            return JSONResponse(responseMess, status=403)
        self.activity_group_self = activity_group

        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


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
            activity_group_id = self.request.GET.get('activity_group_id')
            if activity_group_id is not None:
                if user_id is not None:
                    activity_group_set = ActivityGroup.objects.filter(id=activity_group_id)
                    if activity_group_set.count() == 0:
                        return RegisterLog.objects.filter(id=0)
                    else:
                        user_set = User.objects.filter(id=user_id)
                        activity_group = activity_group_set.get(id=activity_group_id)
                        admin_set = activity_group.admin_user.filter(id=self.request.user.profile.id)
                        if user_set.count() != 0:
                            user = user_set.get(id=user_id)
                            if user == self.request.user:
                                return RegisterLog.objects.filter(activity__activity_group=activity_group,
                                                                  register_user=user.profile)
                        if admin_set.count() == 0:
                            return RegisterLog.objects.filter(id=0)
                        else:
                            if user_set.count() == 0:
                                return RegisterLog.objects.filter(id=0)
                            else:
                                user = user_set.get(id=user_id)
                                return RegisterLog.objects.filter(activity__activity_group=activity_group,
                                                                  register_user=user.profile)
                else:
                    return RegisterLog.objects.filter(id=0)
            else:
                pass
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

        try:
            data = JSONParser().parse(request)
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


@csrf_exempt
@api_view(['POST'])
@authentication_classes((SessionAuthentication, BasicAuthentication, JSONWebTokenAuthentication))
@permission_classes((IsAuthenticated,))
def remove_activity_group_user(request):
    """
       执行对activity_group移除人员的操作，使用`POST`方法传递'activity_group_id'，user_list为所需要移除的user的列表
    """
    data = JSONParser().parse(request)
    try:
        activity_group_id = data['activity_group_id']
    except Exception as e:
        print(e)
        responseMess = {'status': 'INPUT_STYLE_ERROR', 'suggestion': '请输入至少由activity_group_id项组成的JSON代码'}
        return JSONResponse(responseMess, status=400)

    activity_group_set = ActivityGroup.objects.filter(id=activity_group_id)
    if activity_group_set.count() == 0:
        responseMess = {'status': 'ACTIVITY_GROUP_NOT_EXIST', 'suggestion': '该activity_group不存在'}
        return JSONResponse(responseMess, status=400)
    activity_group = activity_group_set.get(id=activity_group_id)

    admin_set = activity_group.admin_user.filter(id=request.user.profile.id)
    if admin_set.count() == 0:
        responseMess = {'status': 'NOT_ADMIN_USER', 'suggestion': '不是该activity_group的管理员'}
        return JSONResponse(responseMess, status=403)

    user_list = []
    success = True
    remove_num = 0
    try:
        user_list = data['user_list']
    except Exception as e:
        print(e)

    for remove_user in user_list:
        if remove_user == request.user.username:
            success = False
            continue
        normal_user_set = activity_group.normal_user.filter(user__username=remove_user)
        if normal_user_set.count() != 0:
            user = normal_user_set.get(user__username=remove_user)
            activity_group.normal_user.remove(user)
            remove_num += 1
        else:
            admin_user_set = activity_group.admin_user.filter(user__username=remove_user)
            if admin_user_set.count() != 0:
                user = admin_user_set.get(user__username=remove_user)
                activity_group.admin_user.remove(user)
                remove_num += 1
            else:
                success = False

    if success and remove_num != 0:
        responseMess = {'status': 'REMOVE_SUCCESS', 'suggestion': '全部移除成功', }
        return JSONResponse(responseMess, status=200)
    elif remove_num != 0 and not success:
        responseMess = {'status': 'REMOVE_SUCCESS_SOME_FAILED', 'suggestion': '移除成功，但是某些成员移除失败', }
        return JSONResponse(responseMess, status=200)
    else:
        responseMess = {'status': 'REMOVE_ALL_FAILED', 'suggestion': '全部移除失败', }
        return JSONResponse(responseMess, status=400)


@csrf_exempt
@api_view(['POST'])
@authentication_classes((SessionAuthentication, BasicAuthentication, JSONWebTokenAuthentication))
@permission_classes((IsAuthenticated,))
def add_activity_group_user(request):
    """
    执行对activity_group增加人员的操作，使用`POST`方法传递'activity_group_id'，admin_user_list和normal_user_list为可选项，
    为所需要添加的admin_user和normal_user的列表
    """

    data = JSONParser().parse(request)
    try:
        activity_group_id = data['activity_group_id']
    except Exception as e:
        print(e)
        responseMess = {'status': 'INPUT_STYLE_ERROR', 'suggestion': '请输入至少由activity_group_id项组成的JSON代码'}
        return JSONResponse(responseMess, status=400)

    activity_group_set = ActivityGroup.objects.filter(id=activity_group_id)
    if activity_group_set.count() == 0:
        responseMess = {'status': 'ACTIVITY_GROUP_NOT_EXIST', 'suggestion': '该activity_group不存在'}
        return JSONResponse(responseMess, status=400)
    activity_group = activity_group_set.get(id=activity_group_id)

    admin_set = activity_group.admin_user.filter(id=request.user.profile.id)
    if admin_set.count() == 0:
        responseMess = {'status': 'NOT_ADMIN_USER', 'suggestion': '不是该activity_group的管理员'}
        return JSONResponse(responseMess, status=403)

    admin_user_list = []
    normal_user_list = []
    admin_success = True
    normal_success = True
    add_num = 0
    try:
        admin_user_list = data['admin_user']
    except Exception as e:
        print(e)
    try:
        normal_user_list = data['normal_user']
    except Exception as e:
        print(e)

    for admin_user in admin_user_list:
        admin_set_temp = activity_group.admin_user.filter(user__username=admin_user)
        if admin_set_temp.count() != 0:
            continue
        normal_set_temp = activity_group.normal_user.filter(user__username=admin_user)
        if normal_set_temp.count() != 0:
            normal = normal_set_temp.get(user__username=admin_user)
            activity_group.normal_user.remove(normal)
            activity_group.admin_user.add(normal)
            add_num += 1
            continue

        # not exist in admin_user and normal user
        try:
            user = User.objects.get(username=admin_user)
            activity_group.admin_user.add(user.profile)
            add_num += 1
        except Exception as e:
            admin_success = False

    for normal_user in normal_user_list:
        if normal_user in admin_user_list:
            continue
        admin_set_temp = activity_group.admin_user.filter(user__username=normal_user)
        if admin_set_temp.count() != 0:
            continue
        normal_set_temp = activity_group.normal_user.filter(user__username=normal_user)
        if normal_set_temp.count() != 0:
            continue

        # not exist in admin_user and normal user and admin_user_list
        try:
            user = User.objects.get(username=normal_user)
            activity_group.normal_user.add(user.profile)
            add_num += 1
        except Exception as e:
            normal_success = False

    if add_num != 0:
        if admin_success and normal_success:
            responseMess = {'status': 'ADD_SUCCESS', 'suggestion': '全部添加成功', }
            return JSONResponse(responseMess, status=200)
        else:
            responseMess = {'status': 'ADD_SUCCESS_SOME_FAILED', 'suggestion': '添加成功，但是某些成员添加失败', }
            return JSONResponse(responseMess, status=200)
    else:
        responseMess = {'status': 'ADD_ALL_FAILED', 'suggestion': '全部添加失败', }
        return JSONResponse(responseMess, status=400)
