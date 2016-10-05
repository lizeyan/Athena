from rest_framework import serializers
from account.models import Profile
from django.contrib.auth.models import User


class UserSerializer(serializers.HyperlinkedModelSerializer):
    profile = serializers.HyperlinkedRelatedField(view_name='profile-detail', read_only=True)

    class Meta:
        model = User
        fields = ('url', 'pk', 'username', 'profile')


class ProfileSerializer(serializers.HyperlinkedModelSerializer):
    user = serializers.ReadOnlyField(read_only=True, source='user.username')

    class Meta:
        model = Profile
        fields = ('url', 'pk', 'icon', 'genders', 'real_name', 'school', 'department', 'user', 'role', 'tel')
