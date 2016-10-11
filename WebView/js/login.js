/**
 * Created by zy-li14 on 16-10-10.
 */
//这个类存储一个Token
var TokenPackage = Backbone.Model.extend ({
    idAttribute: 'token',
    default: function () {
        return {
            username: '',
            password: '',
            token: ''
        };
    }
});
//TokenLibarary负责从API得到token
var TokenLibarary = Backbone.Collection.extend ({
    model: TokenPackage,
    url: API_ROOT + '/api-token-auth/'
});
var tokenLib = new TokenLibarary;
//ErrorBox是显示错误信息的页面
var ErrorBox = Backbone.View.extend ({
    tagName: 'div',
    template: _.template($('#tmplt-box-error').html()),
    render: function () {
        this.$el.html(this.template ());
        return this;
    }
});
var errorListBox = $('#error-list-box');
var LoginForm = Backbone.View.extend ({
    el: $('#form-signin'),
    events: {
        "submit": 'signin'
    },
    signin: function (event) {
        //取消掉默认的处理方式
        event.preventDefault();
        errorListBox.empty();
        tokenLib.create(
            {
                username: $('#input-username').val(), 
                password: $('#input-password').val()
            },  {
                success: function (model, response) {
                    Cookies.set('token', response.token);
                    window.location = 'user.html';
                },
                error: function () {
                    errorListBox.append((new ErrorBox).render().$el.html());
                }
            }
        );
    }
});
var loginForm = new LoginForm;
if (Cookies.get('username')) {
    $('#input-username').val(Cookies.get('username'));
}
if (Cookies.get('password')) {
    $('#input-password').val(Cookies.get('password'));
}
if (Cookies.get('typed-signin-msg'))
    $('#btn-login').trigger('click');
else
    $('body').css('display', 'block');
$(function () {
    Cookies.remove('username');
    Cookies.remove('realname');
    Cookies.remove('password');
    Cookies.remove('email');
    Cookies.remove('typed-signin-msg');
    Cookies.remove('typed-signup-msg');
});
