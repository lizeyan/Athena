from django.db import IntegrityError
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.parsers import JSONParser
from rest_framework.renderers import JSONRenderer
from account.interface import *
from account.models import Profile, Face
from account.serializers import ProfileSerializer, FaceSerializer
from django.contrib.auth.models import User
from account.serializers import UserSerializer
from rest_framework import permissions
from account.permissions import IsOwnerOrReadOnly, AllowPost
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
    })


@csrf_exempt
def do_register(request):
    if request.method == 'POST':
        data = JSONParser().parse(request)
        responseMess = {}

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
                responseMess['suggestion'] = '用户名由字母和数字组成，长度在2-20之间'
                return JSONResponse(responseMess, status=400)
            new_account['password'] = password

            email = data['email']
            if not check_email_style(email):
                responseMess['status'] = 'EMAIL_STYLE_ERROR'
                return JSONResponse(responseMess, status=400)
            new_account['email'] = email

            new_account['real_name'] = data['real_name']

        except Exception as e:
            print(e)
            responseMess['error'] = 'style error'
            return JSONResponse(responseMess, status=400)

        if 'tel' in data:
            tel = data['tel']
            if not check_style(tel_regex, tel):
                return HttpResponse('failed')
            new_account['tel'] = tel

        try:
            user = User.objects.create_user(
                username=new_account['user_name'], password=new_account['password'], email=new_account['email'])
            profile = Profile(user=user, real_name=new_account['real_name'])
            person_id_temp = get_person_id_from_link_face_and_add_person_to_group(new_account['real_name'])
            profile.person_id = person_id_temp
            profile.save()
        except IntegrityError:
            responseMess['error'] = 'username has existed'
            return JSONResponse(responseMess, status=400)
        except TypeError:
            responseMess['error'] = 'type wrong'
            return JSONResponse(responseMess, status=400)
        return JSONResponse({}, status=201)


class JSONResponse(HttpResponse):
    """
    An HttpResponse that renders its content into JSON.
    """

    def __init__(self, data, **kwargs):
        content = JSONRenderer().render(data)
        kwargs['content_type'] = 'application/json'
        super(JSONResponse, self).__init__(content, **kwargs)


class ProfileViewSet(viewsets.ModelViewSet):
    """
        This viewset automatically provides `list`, `create`, `retrieve`,
        `update` and `destroy` actions.
    """
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly,)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer


class FaceViewSet(viewsets.ModelViewSet):
    """
        This viewset automatically provides `list` and `detail` actions.
    """
    queryset = Face.objects.all()
    serializer_class = FaceSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly, AllowPost)

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
