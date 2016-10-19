from rest_framework import serializers
from account.models import Profile, Face
from django.contrib.auth.models import User

from information.serializers import ActivityGroupForProfileSerializer


class UserForProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('url', 'pk', 'username', 'email')


class UserSerializer(serializers.HyperlinkedModelSerializer):
    profile = serializers.HyperlinkedRelatedField(view_name='profile-detail', read_only=True)

    class Meta:
        model = User
        fields = ('url', 'pk', 'username', 'profile')


class ProfileSerializer(serializers.HyperlinkedModelSerializer):
    user = UserForProfileSerializer(many=False, read_only=True)
    face = serializers.HyperlinkedRelatedField(many=True, view_name='face-detail', read_only=True)
    person_ID = serializers.ReadOnlyField(source='person_id')
    admin_activity_group = ActivityGroupForProfileSerializer(many=True, read_only=True,)
    normal_activity_group = ActivityGroupForProfileSerializer(many=True, read_only=True,)
    email_authorization = serializers.ReadOnlyField(source='email_auth')

    class Meta:
        model = Profile
        fields = (
            'url', 'pk', 'genders', 'real_name', 'school', 'department', 'person_ID', 'user', 'role', 'tel',
            'email_authorization', 'icon_image', 'face', 'admin_activity_group', 'normal_activity_group', )


class ProfileQueryByTermSerializer(serializers.HyperlinkedModelSerializer):

    class Meta:
        model = Profile
        fields = ('url', 'pk', 'term_position', )


class ProfileQueryByUsernameSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Profile
        fields = ('url', 'icon_image', 'real_name', 'school', 'department', 'genders', )


class FaceSerializer(serializers.HyperlinkedModelSerializer):
    owner = serializers.ReadOnlyField(source='profile.real_name')
    face_ID = serializers.ReadOnlyField(source='face_id')

    class Meta:
        model = Face
        fields = ('url', 'pk', 'owner', 'face_image', 'face_ID')
