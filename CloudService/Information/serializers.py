from rest_framework import serializers
from account.models import Profile
from information.models import ActivityGroup, Activity, RegisterLog


class ProfileForActivityGroupSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(read_only=True, source='user.username')

    class Meta:
        model = Profile
        fields = ('user', 'real_name', 'icon_image', 'url',)


class ProfileForRegisterLogSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(read_only=True, source='user.username')

    class Meta:
        model = Profile
        fields = ('user', 'real_name', 'department', 'url',)


class ActivityGroupForProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityGroup
        fields = ('activity_group_name', 'url', )


class ActivityGroupForActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityGroup
        fields = ('activity_group_name', 'url', )


class ActivityGroupForActivityQuerySerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityGroup
        fields = ('activity_group_name', 'group_id', )


class ActivityForActivityGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = ('location', 'begin_time', 'end_time', 'url',)


class ActivityForRegisterLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = ('location', 'begin_time', 'end_time', 'url')


class RegisterLogForProfileSerializer(serializers.ModelSerializer):
    activity = ActivityForRegisterLogSerializer(read_only=True)

    class Meta:
        model = RegisterLog
        fields = ('register_time', 'activity', 'url',)


class RegisterLogForActivitySerializer(serializers.ModelSerializer):
    register_user = ProfileForRegisterLogSerializer(read_only=True)

    class Meta:
        model = RegisterLog
        fields = ('register_time', 'register_user', 'url',)


class ActivityGroupSerializer(serializers.HyperlinkedModelSerializer):
    admin_user = ProfileForActivityGroupSerializer(many=True, read_only=True)
    normal_user = ProfileForActivityGroupSerializer(many=True, read_only=True)
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


class ActivityQueryByTermSerializer(serializers.HyperlinkedModelSerializer):
    activity_group = ActivityGroupForActivityQuerySerializer(read_only=True)

    class Meta:
        model = Activity
        fields = ('url', 'pk', 'begin_time', 'end_time', 'activity_group')


class RegisterLogSerializer(serializers.HyperlinkedModelSerializer):
    register_user = ProfileForRegisterLogSerializer(read_only=True)
    activity = ActivityForRegisterLogSerializer(read_only=True)

    class Meta:
        model = RegisterLog
        fields = ('url', 'pk', 'register_time', 'register_user', 'activity')
