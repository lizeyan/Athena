from rest_framework import serializers
from Information.models import Profile
from django.contrib.auth.models import User


class UserSerializer(serializers.HyperlinkedModelSerializer):
    profile = serializers.HyperlinkedRelatedField(many=True, view_name='profile-detail', read_only=True)

    class Meta:
        model = User
        fields = ('url', 'pk', 'username', 'profile')


class ProfileSerializer(serializers.HyperlinkedModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Profile
        fields = ('url', 'pk', 'icon', 'genders', 'real_name', 'school', 'department', 'owner')
