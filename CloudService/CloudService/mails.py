import _thread

from CloudService.settings import EMAIL_AUTH_PREFIX
from account.models import Profile


def gen_mail_auth_msg(profile):
    # Generate a email authetication key and sign to the user. Return the
    # message which will be sent to the user.
    auth_url = EMAIL_AUTH_PREFIX + profile.user.username + '/' + profile.email_hash + '/'

    message = 'Welcome to Athena! Please authenticate your email by enter the following address:\n\n\n' + \
        auth_url + '\n\n\nIf you didn\'t sign up on Athena, just ignore this email~(^_^)\n'
    return message


def send_user_mail(profile, subject, message):
    profile.user.email_user(subject=subject, message=message)


def send_auth_email(profile):
    # send the email to authenticate the email

    msg = gen_mail_auth_msg(profile)
    _thread.start_new_thread(
        send_user_mail, (profile, 'Hello! Welcome to Athena!', msg))
    return
