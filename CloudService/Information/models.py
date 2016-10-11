from django.db import models
from account.models import Profile
from django.contrib.auth.models import User

# Create your models here.


class ActivityGroup(models.Model):
    group_id = models.CharField(max_length=64, blank=True)
    activity_group_name = models.CharField(max_length=100, blank=True)
    admin_user = models.ManyToManyField(Profile, related_name='activity_group_admin_set')
    normal_user = models.ManyToManyField(Profile, related_name='activity_group_normal_set')


class Activity(models.Model):
    location = models.CharField(max_length=100, blank=True)
    begin_time = models.DateField(blank=True)
    end_time = models.DateField(blank=True)
    activity_group = models.ForeignKey(ActivityGroup, related_name='activity')


class RegisterLog(models.Model):
    register_user = models.ForeignKey(Profile, related_name='register_log')
    activity = models.ForeignKey(Activity, related_name='register_log')

