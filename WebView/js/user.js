/**
 * Created by zy-li14 on 16-10-9.
 */
//验证token是否有效，无效则返回登录界面
function gobackLogin() {
    window.location = 'login.html';
}
var token = Cookies.get('token');
if (!token) {
    // alert ('no token');
    gobackLogin();
}
var TokenValidator = Backbone.Model.extend({
    url: API_ROOT + '/api-token-verify/'
});
tokenValidator = new TokenValidator;
tokenValidator.save({'token': token}, {
    wait: true, error: function () {
        gobackLogin();
    }
});

//正文
var Profile = Backbone.Model.extend ({
    idAttribute: 'pk',
    parse: function (response) {
        // alert (JSON.stringify(response));
        if (response.results && Array.isArray(response.results)) {
            if (response.results.length < 1) {
                alert('加载信息错误，返回results长度不为1,即将返回登录界面');
                gobackLogin();
            }
            return response.results[0];
        }
        else if (response.results) {
            return response.results;
        }
        else {
            return response;
        }
    },
    url: API_ROOT + '/profile/?format=json'
});
//现在得到了一个profile，需要渲染界面
var NameCard = Backbone.View.extend ({
    el: $('#namecard'),
    initialize: function () {
        this.listenTo(this.model, 'change', this.render);
    },
    template: _.template($('#tmplt-namecard').html()),
    render: function () {
        // alert (this.model.get('url'));
        this.$el.html (this.template ({
            'image': this.model.get('icon_image'),
            'realname': this.model.get ('real_name'),
            'username': this.model.get('user').username
        }));
        return this;
    }
});
var Email = Backbone.View.extend ({
    el: $('#contact-email'),
    initialize: function () {
        this.listenTo(this.model, 'change', this.render);
    },
    template: _.template($('#tmlpt-email').html()),
    render: function () {
        this.$el.html(this.template({
            email: this.model.get('email')
        }));
        return this;
    }
});
//定义完了View和Model，正常顺序处理
var profile = new Profile;
var namecard = new NameCard ({model: profile});
var email = new Email ({model: profile});
profile.fetch({
    headers: {'Authorization': 'JWT ' + token},
    success: function (model, response) {
        $('body').css('display', 'block');
        document.title = model.get('user') + '(' + model.get('real_name') + ')';
    }, error: function (model, response) {
        alert ('加载错误！' + JSON.stringify(response));
        gobackLogin();
    }
});

