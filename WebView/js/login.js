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
var LoginForm = Backbone.View.extend ({
    el: $('#login-main'),
    events: {
        "click #btn-login": 'signin'
    },
    signin: function () {
        tokenLib.create(
            {
                username: $('#input-username').val(), 
                password: $('#input-password').val()
            },  {
                wait: true,
                success: function (model, response) {
                    Cookies.set('token', response.token);
                    alert ('token is:' + response.token);
                    alert ('cookie set:' + Cookies.get('token'));
                },
                error: function () {
                    loginForm.$el.before((new ErrorBox).render().$el.html());
                }
            }
        );
    }
});
var loginForm = new LoginForm;
var Document = Backbone.View.extend ({
    el: $(document),
    events: {
        "keydown": 'onKeyPressed'
    },
})
