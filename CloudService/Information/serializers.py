from rest_framework import serializers
from account.models import Profile
from information.models import ActivityGroup, Activity, RegisterLog


class ProfileForActivitySerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(read_only=True, source='user.username')

    class Meta:
        model = Profile
        fields = ('url', 'pk', 'genders', 'user', 'real_name', 'school', 'department',)


class ProfileForRegisterLogSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(read_only=True, source='user.username')

    class Meta:
        model = Profile
        fields = ('url', 'pk', 'genders', 'user', 'real_name', 'school', 'department',)


class ActivityGroupForProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityGroup
        fields = ('url', 'pk', 'activity_group_name',)


class ActivityGroupForActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityGroup
        fields = ('url', 'pk', 'activity_group_name',)


class ActivityForActivityGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = ('url', 'pk', 'location', 'begin_time', 'end_time',)


class ActivityForRegisterLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = ('url', 'pk', 'location', 'begin_time', 'end_time',)


class RegisterLogForProfileSerializer(serializers.ModelSerializer):
    activity = ActivityForRegisterLogSerializer(read_only=True)

    class Meta:
        model = RegisterLog
        fields = ('url', 'pk', 'activity',)


class RegisterLogForActivitySerializer(serializers.ModelSerializer):
    register_user = ProfileForRegisterLogSerializer(read_only=True)

    class Meta:
        model = RegisterLog
        fields = ('url', 'pk', 'register_user',)


class ActivityGroupSerializer(serializers.HyperlinkedModelSerializer):
    admin_user = ProfileForActivitySerializer(many=True, read_only=True)
    normal_user = ProfileForActivitySerializer(many=True, read_only=True)
    activity = ActivityForActivityGroupSerializer(many=True, read_only=True)

    class Meta:
        model = ActivityGroup
        fields = ('url', 'pk', 'activity_group_name', 'admin_user', 'normal_user', 'activity')


class ActivitySerializer(serializers.HyperlinkedModelSerializer):
    activity_group = ActivityGroupForActivitySerializer(read_only=True)
    register_log = RegisterLogForActivitySerializer(many=True, read_only=True)

    class Meta:
        model = Activity
        fields = ('url', 'pk', 'location', 'begin_time', 'end_time', 'activity_group', 'register_log')


class RegisterLogSerializer(serializers.HyperlinkedModelSerializer):
    register_user = ProfileForRegisterLogSerializer(read_only=True)
    activity = ActivityForRegisterLogSerializer(read_only=True)

    class Meta:
        model = RegisterLog
        fields = ('url', 'pk', 'register_user', 'activity')
