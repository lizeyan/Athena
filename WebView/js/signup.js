var User = Backbone.Model.extend ({
    idAttribute: 'username'
});
var UserLibrary = Backbone.Collection.extend ({
    model: User,
    url: API_ROOT + '/account/register/'
});
var userLibrary = new UserLibrary;

//ErrorBox是显示错误信息的页面
var ErrorBox = Backbone.View.extend ({
    tagName: 'div',
    template: _.template($('#tmplt-box-error').html()),
    render: function () {
        this.$el.html(this.template ());
        return this;
    }
});
var SignupForm = Backbone.View.extend ({
    el: $('#form-signup'),
    events: {
        "click #btn-signup": 'signup',
        "keypress .form-signup-inner": 'onKeyPressed'
    },
    signup: function () {
        alert ('sign up');
    },
    onKeyPressed: function (e) {
        if (e.keyCode == 13)
        {
        }
    }
});
var signupForm = new SignupForm;