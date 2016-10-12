from django.db import IntegrityError
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework import mixins
from rest_framework import status
from rest_framework.parsers import JSONParser
from rest_framework.renderers import JSONRenderer
from rest_framework.viewsets import GenericViewSet
from account.interface import *
from account.models import Profile, Face
from account.serializers import ProfileSerializer, FaceSerializer
from django.contrib.auth.models import User
from account.serializers import UserSerializer
from rest_framework import permissions
from account.permissions import AllowPost, IsOwnerOrCanNotGet
from rest_framework.decorators import api_view
from rest_framework.reverse import reverse
from rest_framework.response import Response
from rest_framework import viewsets


@api_view(['GET'])
def api_root(request, format=None):
    return Response({
        'user': reverse('user-list', request=request, format=format),
        'profile': reverse('profile-list', request=request, format=format),
        'face': reverse('face-list', request=request, format=format),
        'activity_group': reverse('information.views.activitygroup-list', request=request, format=format),
        'activity': reverse('information.views.activity-list', request=request, format=format),
        'register_log': reverse('information.views.registerlog-list', request=request, format=format),
    })


@csrf_exempt
def do_register(request):
    responseMess = {}
    if request.method == 'POST':
        data = JSONParser().parse(request)
        new_account = {}
        try:
            username = data['username']
            if not check_style(username_regex, username):
                responseMess['status'] = 'USERNAME_STYLE_ERROR'
                responseMess['suggestion'] = '用户名由字母和数字组成，长度在2-20之间'
                return JSONResponse(responseMess, status=400)
            new_account['user_name'] = username

            password = data['password']
            if not check_style(password_regex, password):
                responseMess['status'] = 'PASSWORD_STYLE_ERROR'
                responseMess['suggestion'] = '密码长度在6-20之间'
                return JSONResponse(responseMess, status=400)
            new_account['password'] = password

            email = data['email']
            if not check_email_style(email):
                responseMess['status'] = 'EMAIL_STYLE_ERROR'
                responseMess['suggestion'] = '需要符合邮箱格式'
                return JSONResponse(responseMess, status=400)
            new_account['email'] = email

            new_account['real_name'] = data['real_name']
            if data['real_name'] == '':
                responseMess['status'] = 'REAL_NAME_STYLE_ERROR'
                responseMess['suggestion'] = '真实姓名不可以为空'
                return JSONResponse(responseMess, status=400)

        except Exception as e:
            print(e)
            responseMess['status'] = 'INPUT_STYLE_ERROR'
            responseMess['suggestion'] = '请输入至少由username, password, email, real_name四项组成的JSON代码'
            return JSONResponse(responseMess, status=400)

        if 'tel' in data:
            tel = data['tel']
            if not check_style(tel_regex, tel):
                responseMess['status'] = 'TEL_STYLE_ERROR'
                responseMess['suggestion'] = '电话应由数字组成，长度在0-30之间'
                return JSONResponse(responseMess, status=400)
            new_account['tel'] = tel

        try:
            user = User.objects.create_user(
                username=new_account['user_name'], password=new_account['password'], email=new_account['email'])
            profile = Profile(user=user, real_name=new_account['real_name'])
            person_id_temp = get_person_id_from_link_face_and_add_person_to_group(new_account['real_name'])
            profile.person_id = person_id_temp
            profile.save()
        except IntegrityError:
            responseMess['status'] = 'USERNAME_ALREADY_EXIST'
            responseMess['suggestion'] = '用户名已经存在，请更换用户名'
            return JSONResponse(responseMess, status=400)
        except TypeError:
            responseMess['status'] = 'STYLE_ERROR'
            responseMess['suggestion'] = '请检查输入格式'
            return JSONResponse(responseMess, status=400)
        responseMess['status'] = 'CREATED'
        return JSONResponse(responseMess, status=201)
    else:
        responseMess['status'] = 'METHOD_NOT_ALLOW'
        responseMess['suggestion'] = 'Only POST is supported'
        return JSONResponse(responseMess, status=405)


class JSONResponse(HttpResponse):
    """
    An HttpResponse that renders its content into JSON.
    """

    def __init__(self, data, **kwargs):
        content = JSONRenderer().render(data)
        kwargs['content_type'] = 'application/json'
        super(JSONResponse, self).__init__(content, **kwargs)


class AthenaModelViewSet(mixins.RetrieveModelMixin,
                         mixins.UpdateModelMixin,
                         mixins.DestroyModelMixin,
                         mixins.ListModelMixin,
                         GenericViewSet):
    """
    A viewset that provides default `retrieve()`, `update()`,
    `partial_update()`, `destroy()` and `list()` actions.
    """
    pass


class ProfileViewSet(AthenaModelViewSet):
    """
        This viewset automatically provides `list`, `retrieve`,
        `update` and `destroy` actions.
    """
    serializer_class = ProfileSerializer
    permission_classes = (permissions.IsAuthenticated, IsOwnerOrCanNotGet,)

    def get_queryset(self):
        if self.request.user.is_superuser == 1:
            return Profile.objects.all()
        else:
            queryset = Profile.objects.filter(user=self.request.user)
            return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        if self.request.user.is_superuser == 1:
            return User.objects.all()
        else:
            queryset = User.objects.filter(id=self.request.user.id)
            return queryset


class FaceViewSet(viewsets.ModelViewSet):
    """
        This viewset automatically provides `list` and `detail` actions.
    """
    serializer_class = FaceSerializer
    permission_classes = (permissions.IsAuthenticated, AllowPost)

    def get_queryset(self):
        if self.request.user.is_superuser == 1:
            return Face.objects.all()
        else:
            profile = Profile.objects.get(user=self.request.user)
            queryset = Face.objects.filter(profile_id=profile.id)
            return queryset

    def perform_create(self, serializer):
        profile_temp = Profile.objects.get(user=self.request.user)
        serializer.save(profile=profile_temp)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        face_id = serializer.data['pk']
        face_temp = Face.objects.get(id=face_id)
        send_face_to_link_face_and_add_face_to_person(face_temp.face_image.path, face_id,
                                                      face_temp.profile_id)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
