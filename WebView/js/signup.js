var RegisterUser = Backbone.Model.extend({
    default: function () {
        return {
            username: '',
            real_name: '',
            email: '',
            password: ''
        };
    }
});
var UserLibrary = Backbone.Collection.extend({
    model: RegisterUser,
    url: API_ROOT + '/account/register/'
});
var userLibrary = new UserLibrary;

//ErrorBox是显示错误信息的页面
var ErrorBox = Backbone.View.extend({
    tagName: 'div',
    template: _.template($('#tmplt-box-error').html()),
    render: function (args) {
        this.$el.html(this.template(args));
        return this;
    }
});
var errorListBox = $('#error-list-box');
var usernameRegExp = new RegExp('[0-9A-Za-z]{2,20}');
var passwordRegExp = new RegExp('.{6,20}');
var emailRegExp = new RegExp('');
var SignupForm = Backbone.View.extend({
    el: $('#form-signup'),
    events: {
        "submit": 'signup'
    },
    signup: function (event) {
        //取消掉默认的处理方式
        event.preventDefault();
        errorListBox.empty();
        userLibrary.create(
            {
                username: $('#input-username').val(),
                real_name: $('#input-realname').val(),
                password: $('#input-password').val(),
                email: $('#input-email').val()
            }, {
                //注意成功和错误返回的response的解析方式是不一样的
                success: function (model, response) {
                    Cookies.set('username', $('#input-username').val());
                    Cookies.set('password', $('#input-password').val());
                    Cookies.set('typed-signin-msg', true);
                    window.location = 'login.html';
                },
                error: function (model, response) {
                    signupForm.parseError(response);
                }
            }
        );
    },
    parseError: function (response) {
        var suggestion = '';
        if (response && response.responseJSON && response.responseJSON.suggestion)
            suggestion = response.responseJSON.suggestion;
        else if (response && response.responseText)
            suggestion = '错误信息:' + response.responseText;
        else
            suggestion = '我也不知道发生了什么*_*';
        errorListBox.append((new ErrorBox).render({'suggestion': suggestion}).$el.html());

    }
});
var signupForm = new SignupForm;

if (Cookies.get('username')) {
    $('#input-username').val(Cookies.get('username'));
}
if (Cookies.get('realname')) {
    $('#input-realname').val(Cookies.get('realname'));
}
if (Cookies.get('password')) {
    $('#input-password').val(Cookies.get('password'));
}
if (Cookies.get('email')) {
    $('#input-email').val(Cookies.get('email'));
}
if (Cookies.get('typed-signup-msg'))
    $('#btn-signup').trigger('click');
else
    $('body').css('display', 'block');
$(function () {
    Cookies.remove('username');
    Cookies.remove('realname');
    Cookies.remove('password');
    Cookies.remove('email');
    Cookies.remove('typed-signup-msg');
    Cookies.remove('typed-signin-msg');
});
