from rest_framework import serializers
from account.models import Profile, Face
from django.contrib.auth.models import User


class UserSerializer(serializers.HyperlinkedModelSerializer):
    profile = serializers.HyperlinkedRelatedField(view_name='profile-detail', read_only=True)

    class Meta:
        model = User
        fields = ('url', 'pk', 'username', 'profile')


class ProfileSerializer(serializers.HyperlinkedModelSerializer):
    user = serializers.ReadOnlyField(read_only=True, source='user.username')
    face = serializers.HyperlinkedRelatedField(many=True, view_name='face-detail', read_only=True)
    person_ID = serializers.ReadOnlyField(source='person_id')

    class Meta:
        model = Profile
        fields = ('url', 'pk', 'icon', 'genders', 'real_name', 'school', 'department', 'person_ID', 'user', 'role', 'tel', 'icon_image', 'face', )


class FaceSerializer(serializers.HyperlinkedModelSerializer):
    owner = serializers.ReadOnlyField(source='profile.real_name')
    face_ID = serializers.ReadOnlyField(source='face_id')

    class Meta:
        model = Face
        fields = ('url', 'pk', 'owner', 'face_image', 'face_ID')
