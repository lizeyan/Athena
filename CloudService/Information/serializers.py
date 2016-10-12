from rest_framework import serializers
from information.models import *


class ActivityGroupSerializer(serializers.HyperlinkedModelSerializer):
    admin_user = serializers.HyperlinkedRelatedField(many=True, view_name='profile-detail')
