from django.contrib.auth.models import User
from django.db import models


# Create your models here.

class Profile(models.Model):
    icon = models.CharField(max_length=200, blank=True, default='')
    genders = models.IntegerField(default=0)
    school = models.CharField(max_length=200, blank=True, default='')
    department = models.CharField(max_length=200, blank=True, default='')
    real_name = models.CharField(max_length=100, blank=True, default='')
    tel = models.CharField(max_length=20, blank=True, default='')
    role = models.CharField(max_length=30, blank=False, default='')
    user = models.OneToOneField(User, related_name='profile', unique=True)
    icon_image = models.ImageField(upload_to="icon_image/%Y/%m/%d", blank=True)
    person_id = models.CharField(max_length=50, default='', blank=True)
    email_auth = models.BooleanField(blank=True, default=False)
    email_hash = models.CharField(max_length=30, blank=True)

    class Meta:
        permissions = (('account.look', '查看全部User'), )


class Face(models.Model):
    face_image = models.ImageField(upload_to="face_image/%Y/%m/%d", blank=True)
    face_id = models.CharField(max_length=50, default='', blank=True)
    profile = models.ForeignKey('Profile', related_name='face')
