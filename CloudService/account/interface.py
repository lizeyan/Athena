import re
import requests
from django import forms
from django.core.exceptions import *
import json

from django.http import HttpResponse
from rest_framework.renderers import JSONRenderer

from account.models import Face, Profile

username_regex = '''[0-9A-Za-z]{2,20}'''
password_regex = '''.{6,20}'''
tel_regex = '''[0-9]{0,30}'''
api_id = '332cc3d4d63e404693589ca02da83600'
api_secret = '72e68c866c34405c8491839da7ffd4d0'
group_id = '6c59b4c08e4d41d884118f3afc8fdb1b'
params = '?api_id=' + api_id + '&api_secret=' + api_secret


class JSONResponse(HttpResponse):
    """
    An HttpResponse that renders its content into JSON.
    """

    def __init__(self, data, **kwargs):
        content = JSONRenderer().render(data)
        kwargs['content_type'] = 'application/json'
        super(JSONResponse, self).__init__(content, **kwargs)


def check_style(pattern, text):
    regex = re.compile(pattern)
    rst = regex.search(text)

    if rst is None:
        return False
    if rst.start() != 0 or rst.end() != len(text):
        return False
    return True


def check_email_style(text):
    try:
        forms.EmailField().clean(text)
        return True
    except ValidationError:
        return False


def set_email_hash(profile):
    import random
    import string
    profile.email_hash = ''.join(
        random.sample(
            string.ascii_letters +
            string.digits,
            30))
    profile.save()
    return


def send_face_to_link_face_and_add_face_to_person(filepath, face_pk, profile_pk):
    api_url = 'https://v1-api.visioncloudapi.com/face/detection'
    files = {'file': open(filepath, 'rb')}
    response = requests.post(api_url + params, files=files)
    json_ans = json.loads(response.text)
    face = Face.objects.get(id=face_pk)
    face.face_id = json_ans['faces'][0]['face_id']
    face.save()
    profile = Profile.objects.get(id=profile_pk)

    dic = {
        "person_id": profile.person_id,
        "face_id": json_ans['faces'][0]['face_id']
    }
    api_url = 'https://v1-api.visioncloudapi.com/person/add_face'
    requests.post(api_url + params, data=dic)


def get_person_id_from_link_face_and_add_person_to_group(real_name):
    api_url = 'https://v1-api.visioncloudapi.com/person/create'
    dic = {
        "name": real_name
    }
    response = requests.post(api_url + params, data=dic)

    api_url = 'https://v1-api.visioncloudapi.com/group/add_person'
    response_json = json.loads(response.text)
    dic = {
        "group_id": group_id,
        "person_id": response_json['person_id']
    }
    requests.post(api_url + params, data=dic)
    return response_json['person_id']
