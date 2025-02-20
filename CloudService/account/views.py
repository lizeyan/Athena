from calendar import timegm
from django.db import IntegrityError
from django.http import Http404
from django.utils.datetime_safe import datetime
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.parsers import JSONParser
from rest_framework.permissions import IsAuthenticated
from rest_framework_jwt.authentication import JSONWebTokenAuthentication
from CloudService.mails import send_auth_email, send_change_password_email
from account.interface import *
from account.models import Profile, Face
from account.serializers import ProfileSerializer, FaceSerializer, ProfileQueryByTermSerializer, \
    ProfileQueryByUsernameSerializer
from django.contrib.auth.models import User
from account.serializers import UserSerializer
from rest_framework import permissions
from account.permissions import AllowPost, IsOwnerOrCanNotGet
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.reverse import reverse
from rest_framework.response import Response
from rest_framework import viewsets
from CloudService.athena_view_set import NoPostViewSet
from rest_framework_jwt.settings import api_settings


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


# use ViewSet to show API


class ProfileViewSet(NoPostViewSet):
    """
        This viewset automatically provides `list`, `retrieve`,
        `update` and `destroy` actions.
    """
    permission_classes = (permissions.IsAuthenticated, IsOwnerOrCanNotGet,)

    def get_serializer_class(self):
        username = self.request.GET.get('username')
        if self.request.user.profile.is_term_camera:
            return ProfileQueryByTermSerializer
        elif username is not None:
            return ProfileQueryByUsernameSerializer
        else:
            return ProfileSerializer

    def get_queryset(self):
        username = self.request.GET.get('username')
        if self.request.user.is_superuser == 1:
            return Profile.objects.all()
        elif username is not None:
            return Profile.objects.filter(user__username=username)
        else:
            queryset = Profile.objects.filter(user=self.request.user)
            return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            if queryset.count() == 0:
                return Response(serializer.data, status=status.HTTP_400_BAD_REQUEST)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


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

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        remove_face_from_one_person_in_link_face(instance.face_id, instance.profile.person_id)
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    def create(self, request, *args, **kwargs):
        face_set = Face.objects.filter(profile=self.request.user.profile)
        if face_set.count() >= 10:
            responseMess = {'status': 'FACE_NUM_MAX', 'suggestion': '人脸数已经达到上限'}
            return JSONResponse(responseMess, status=400)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        face_id = serializer.data['pk']
        face_temp = Face.objects.get(id=face_id)
        send_face_to_link_face_and_add_face_to_person(face_temp.face_image.path, face_id,
                                                      face_temp.profile_id)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


# normal method to show API
@csrf_exempt
@api_view(['POST'])
def do_register(request):
    if request.method == 'POST':
        data = JSONParser().parse(request)
        new_account = {}
        try:
            username = data['username']
            if not check_style(username_regex, username):
                responseMess = {'status': 'USERNAME_STYLE_ERROR', 'suggestion': '用户名由字母和数字组成，长度在2-20之间'}
                return JSONResponse(responseMess, status=400)
            new_account['user_name'] = username

            password = data['password']
            if not check_style(password_regex, password):
                responseMess = {'status': 'PASSWORD_STYLE_ERROR', 'suggestion': '密码长度在6-20之间'}
                return JSONResponse(responseMess, status=400)
            new_account['password'] = password

            email = data['email']
            if not check_email_style(email):
                responseMess = {'status': 'EMAIL_STYLE_ERROR', 'suggestion': '需要符合邮箱格式'}
                return JSONResponse(responseMess, status=400)
            new_account['email'] = email

            new_account['real_name'] = data['real_name']
            if data['real_name'] == '':
                responseMess = {'status': 'REAL_NAME_STYLE_ERROR', 'suggestion': '真实姓名不可以为空'}
                return JSONResponse(responseMess, status=400)

        except Exception as e:
            responseMess = {'status': 'INPUT_STYLE_ERROR',
                            'suggestion': '请输入至少由username, password, email, real_name四项组成的JSON代码'}
            return JSONResponse(responseMess, status=400)

        if 'tel' in data:
            tel = data['tel']
            if not check_style(tel_regex, tel):
                responseMess = {'status': 'TEL_STYLE_ERROR', 'suggestion': '电话应由数字组成，长度在0-30之间'}
                return JSONResponse(responseMess, status=400)
            new_account['tel'] = tel

        try:
            user = User.objects.create_user(
                username=new_account['user_name'], password=new_account['password'], email=new_account['email'])
            profile = Profile(user=user, real_name=new_account['real_name'])
            set_email_hash(profile)
            send_auth_email(profile)
            person_id_temp = get_person_id_from_link_face_and_add_person_to_group(new_account['real_name'])
            profile.person_id = person_id_temp
            profile.save()
        except IntegrityError:
            responseMess = {'status': 'USERNAME_ALREADY_EXIST', 'suggestion': '用户名已经存在，请更换用户名'}
            return JSONResponse(responseMess, status=400)
        except TypeError:
            responseMess = {'status': 'STYLE_ERROR', 'suggestion': '请检查输入格式'}
            return JSONResponse(responseMess, status=400)
        responseMess = {'status': 'CREATED'}
        return JSONResponse(responseMess, status=201)


@csrf_exempt
@api_view(['POST'])
def find_password(request):
    """执行找回密码操作，使用`POST`方法传递'username'和'email'。"""

    data = JSONParser().parse(request)
    try:
        username = data['username']
        email = data['email']
    except Exception as e:
        responseMess = {'status': 'INPUT_STYLE_ERROR', 'suggestion': '请检查输入的JSON格式'}
        return JSONResponse(responseMess, status=400)

    user_set = User.objects.filter(username=username)
    if user_set.count() == 0:
        responseMess = {'status': 'USERNAME_NOT_EXIST', 'suggestion': '请输入正确的用户名'}
        return JSONResponse(responseMess, status=400)

    user = user_set.get(username=username)
    if email != user.email:
        responseMess = {'status': 'EMAIL_IS_WRONG', 'suggestion': '请输入正确的邮箱'}
        return JSONResponse(responseMess, status=400)

    if not user.profile.email_auth:
        responseMess = {'status': 'EMAIL_NOT_VERIFIED', 'suggestion': '邮箱未被确认，无法找回密码'}
        return JSONResponse(responseMess, status=400)

    set_password_hash(user.profile)
    send_change_password_email(user.profile)
    responseMess = {'status': 'EMAIL_ALREADY_SEND', }
    return JSONResponse(responseMess, status=200)


@csrf_exempt
@api_view(['POST'])
@authentication_classes((SessionAuthentication, BasicAuthentication, JSONWebTokenAuthentication))
@permission_classes((IsAuthenticated,))
def do_verify_email(request):
    if request.user.profile.email_auth:
        responseMess = {'status': 'ALREADY_VERIFIED', 'suggestion': '邮箱已经被验证'}
        return JSONResponse(responseMess, status=400)
    set_email_hash(request.user.profile)
    send_auth_email(request.user.profile)
    responseMess = {'status': 'EMAIL_ALREADY_SEND', }
    return JSONResponse(responseMess, status=200)


@csrf_exempt
@api_view(['POST'])
@authentication_classes((SessionAuthentication, BasicAuthentication, JSONWebTokenAuthentication))
@permission_classes((IsAuthenticated,))
def do_modify_email(request):
    """执行修改电子邮件操作，使用`POST`方法传递'email'和'password'。"""

    data = JSONParser().parse(request)
    try:
        email = data['email']
        password = data['password']
    except Exception as e:
        responseMess = {'status': 'INPUT_STYLE_ERROR', 'suggestion': '请检查输入的JSON格式'}
        return JSONResponse(responseMess, status=400)

    if not check_email_style(email):
        responseMess = {'status': 'EMAIL_STYLE_ERROR', 'suggestion': '请检查邮箱输入格式'}
        return JSONResponse(responseMess, status=400)

    if not request.user.check_password(password):
        responseMess = {'status': 'PASSWORD_WRONG', 'suggestion': '请输入正确的密码'}
        return JSONResponse(responseMess, status=400)

    request.user.profile.email_auth = False
    request.user.profile.email_hash = ''
    request.user.email = email
    request.user.profile.save()
    request.user.save()
    set_email_hash(request.user.profile)
    send_auth_email(request.user.profile)
    responseMess = {'status': 'ALREADY_CHANGED', }
    return JSONResponse(responseMess, status=200)


@csrf_exempt
@api_view(['POST'])
@authentication_classes((SessionAuthentication, BasicAuthentication, JSONWebTokenAuthentication))
@permission_classes((IsAuthenticated,))
def do_modify_password(request):
    """执行修改密码操作，使用`POST`方法传递'old_password'和'new_password'。"""

    user = request.user
    try:
        data = JSONParser().parse(request)
        old_pass = data['old_password']
        new_pass = data['new_password']
        if user.check_password(old_pass):
            if not check_style(password_regex, new_pass):
                responseMess = {'status': 'PASSWORD_STYLE_ERROR', 'suggestion': '密码长度在6-20之间'}
                return JSONResponse(responseMess, status=400)
            user.set_password(new_pass)
            user.save()

            # create new token when password changed
            jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
            jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER
            payload = jwt_payload_handler(user)
            payload['orig_iat'] = timegm(
                datetime.utcnow().utctimetuple()
            )
            token = jwt_encode_handler(payload)

            responseMess = {'status': 'ALREADY_CHANGED', 'token': token, }
            return JSONResponse(responseMess, status=200)
        else:
            responseMess = {'status': 'PASSWORD_WRONG', 'suggestion': '请输入正确的旧密码'}
            return JSONResponse(responseMess, status=400)
    except Exception as e:
        responseMess = {'status': 'INPUT_STYLE_ERROR', 'suggestion': '请检查输入的JSON格式'}
        return JSONResponse(responseMess, status=400)


@csrf_exempt
def do_auth_email(request, username, ekey):
    # TODO
    try:
        profile = Profile.objects.get(user__username=username)
        if profile.email_hash == ekey:
            profile.email_auth = True
            profile.save()
            return HttpResponse("Success")
        else:
            raise Http404
    except:
        raise Http404


@csrf_exempt
def do_find_password(request, username, ekey):
    if request.method == 'GET':
        try:
            profile = Profile.objects.get(user__username=username)
            if profile.password_hash == ekey:
                responseMess = {'status': 'RIGHT_URL', }
                return JSONResponse(responseMess, status=200)
        except:
            raise Http404
    elif request.method == 'POST':
        try:
            profile = Profile.objects.get(user__username=username)
            if profile.password_hash == ekey:
                try:
                    data = JSONParser().parse(request)
                    password = data['password']
                except Exception as e:
                    responseMess = {'status': 'INPUT_STYLE_ERROR', 'suggestion': '请检查输入的JSON格式'}
                    return JSONResponse(responseMess, status=400)

                if not check_style(password_regex, password):
                    responseMess = {'status': 'PASSWORD_STYLE_ERROR', 'suggestion': '密码长度在6-20之间'}
                    return JSONResponse(responseMess, status=400)

                profile.user.set_password(password)
                profile.user.save()
                set_password_hash(profile)
                responseMess = {'status': 'ALREADY_CHANGED', }
                return JSONResponse(responseMess, status=200)
            else:
                raise Http404
        except:
            raise Http404
    else:
        responseMess = {'status': 'METHOD_NOT_ALLOW', }
        return JSONResponse(responseMess, status=405)
