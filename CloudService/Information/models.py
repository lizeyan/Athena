from django.db import models


# Create your models here.

class Profile(models.Model):
    icon = models.CharField(max_length=200, blank=True, default='')
    genders = models.IntegerField(default=0)
    school = models.CharField(max_length=200, blank=True, default='')
    department = models.CharField(max_length=200, blank=True, default='')
    real_name = models.CharField(max_length=100, blank=True, default='')
    owner = models.ForeignKey('auth.User', related_name='profile')
