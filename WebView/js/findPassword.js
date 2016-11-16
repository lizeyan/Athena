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
var LoginForm = Backbone.View.extend({
    el: $('#form-find'),
    events: {
        "submit": 'find'
    },
    find: function (event) {
        //取消掉默认的处理方式
        event.preventDefault();
        errorListBox.empty();
        $.ajax({
            url: API_ROOT + "/account/find_password/",
            type: 'POST',
            data: JSON.stringify({username: $("#input-username").val(), email: $("#input-email").val()}),
            success: function () {
                errorListBox.append((new ErrorBox).render({type: 'success', message: '发送请求成功,请查看你的邮箱'}).$el.html());
            },
            error: function (response) {
                errorListBox.append((new ErrorBox).render({type: 'danger', message: response.responseText}).$el.html());
            }
        });
    }
});
var loginForm = new LoginForm;
