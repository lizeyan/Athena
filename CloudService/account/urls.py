from django.conf.urls import url, include

import information.views
from account import views
from rest_framework.routers import DefaultRouter

# Create a router and register our viewsets with it.
router = DefaultRouter(schema_title='Pastebin API')
router.register(r'users', views.UserViewSet, base_name='user')
router.register(r'profile', views.ProfileViewSet, base_name='profile')
router.register(r'face', views.FaceViewSet, base_name='face')
router.register(r'activity_group', information.views.ActivityGroupViewSet)
router.register(r'activity', information.views.ActivityViewSet)
router.register(r'register_log', information.views.RegisterLogViewSet)

# The API URLs are now determined automatically by the router.
# Additionally, we include the login URLs for the browsable API.
urlpatterns = [
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    url(r'^register/$', views.do_register),
    url(r'^', include(router.urls)),
]
