from django.conf.urls import url, include

import information.views
from account import views
from rest_framework.routers import DefaultRouter

# Create a router and register our viewsets with it.
router = DefaultRouter(schema_title='Pastebin API')
router.register(r'users', views.UserViewSet, base_name='user')
router.register(r'profile', views.ProfileViewSet, base_name='profile')
router.register(r'face', views.FaceViewSet, base_name='face')
router.register(r'activity_group', information.views.ActivityGroupViewSet, base_name='activitygroup')
router.register(r'activity', information.views.ActivityViewSet, base_name='activity')
router.register(r'register_log', information.views.RegisterLogViewSet)

# The API URLs are now determined automatically by the router.
# Additionally, we include the login URLs for the browsable API.
urlpatterns = [
    url(r'^register/$', views.do_register),
    url(r'^modify_email/$', views.do_modify_email),
    url(r'^auth_email/(?P<username>.+)/(?P<ekey>.+)/$', views.do_auth_email)
]
