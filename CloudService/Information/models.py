from django.db import models
from django.utils import timezone
from account.models import Profile


# Create your models here.


class ActivityGroup(models.Model):
    group_id = models.CharField(max_length=64, blank=True, default='')
    activity_group_name = models.CharField(max_length=100, blank=True, default='')
    admin_user = models.ManyToManyField(Profile, related_name='admin_activity_group')
    normal_user = models.ManyToManyField(Profile, related_name='normal_activity_group')


class Activity(models.Model):
    location = models.CharField(max_length=100, blank=True, default='')
    begin_time = models.DateTimeField(blank=True, default=timezone.now)
    end_time = models.DateTimeField(blank=True, default=timezone.now)
    activity_group = models.ForeignKey(ActivityGroup, related_name='activity')


class RegisterLog(models.Model):
    register_user = models.ForeignKey(Profile, related_name='register_log')
    activity = models.ForeignKey(Activity, related_name='register_log')

