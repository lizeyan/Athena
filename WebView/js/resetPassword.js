/**
 * Created by zy-li14 on 16-11-16.
 */
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
var SecurityView = Backbone.View.extend({
    el: $('#reset-div'),
    events: {
        'submit #form-reset': 'uploadPassword'
    },
    validatePassword: function () {
        if ($("#input-password").val() != $("#input-password-confirm").val())
            return false;
        else
            return true;
    },
    uploadPassword: function (event) {
        event.preventDefault();
        errorListBox.empty();
        if (!this.validatePassword()) {
            errorListBox.append((new ErrorBox).render({
                type: "danger",
                text: "修改失败\n提示:\n" + "新密码不一致，请确认输入"
            }).$el.html());
            return;
        }
        $.ajax({
            url: API_ROOT + "/account/find_password_verify/" + this.username + "/" + this.key + "/",
            type: "POST",
            data: JSON.stringify({password: $("#input-password").val()}),
            success: function () {
                window.location = "login.html";
            },
            error: function (response) {
                errorListBox.append((new ErrorBox).render({type: "danger", text: response.responseText}).$el.html());
            }
        })
    }
});
var securityView = new SecurityView;
var Router = Backbone.Router.extend({
    routes: {
        ":username/:key": "main"
    },
    main: function (username, key) {
        securityView.username = username;
        securityView.key = key;
        $.ajax({
            type: 'GET',
            url: API_ROOT + "/account/find_password_verify/" + username + "/" + key + "/",
            success: function () {
                $("#input-username").val(username);
            },
            error: _.bind(function () {
                this.exit();
            }, this)
        })
    },
    exit: function () {
        window.location = "index.html"
    }
});
$(function () {
    var router = new Router;
    Backbone.history.start()
});
