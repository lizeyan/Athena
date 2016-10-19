/**
 * Created by zy-li14 on 16-10-19.
 */
var UserInputItemView = Backbone.View.extend({
    tagName: 'li',
    template: _.template($("#tmplt-user-input").html()),
    initialize: function () {
    },
    events: {
        "change .athena-user-input": "updateUserInfo"
    },
    render: function () {
        //为了重新渲染的时候保存之前的输入
        var username = null;
        if (this.$el && this.$el.find('.athena-user-input'))
            username = this.$el.find('.athena-user-input').val();
        this.$el.html(this.template({
            icon_image: null,
            real_name: null,
            username: username,
            school: null,
            department: null,
            foundUser: false,
            showAdd: this.showAdd,
            showSub: this.showSub,
            error: false,
            errorMsg: null
        }));
        //如果输入不为空，那么还需要查找用户
        if (username != null)
            this.updateUserInfo();
        return this;
    },
    updateUserInfo: function () {
        //试图去查找用户名。注意可能输入框不存在
        var username = null;
        try {
            username = $(this.$el.find(".athena-user-input")[0]).val();
        }
        catch (e) {
            return;
        }
        // alert (this.$el.html());
        // alert (username);
        (new Profile).fetch({
            url: API_ROOT + '/profile/',
            headers: {'Authorization': 'JWT ' + token},
            data: $.param({username: username}),
            success: _.bind(function (model, response) {
                this.$el.html(this.template({
                    foundUser: true,
                    icon_image: model.get('icon_image'),
                    username: username,
                    real_name: model.get('real_name'),
                    school: model.get('school'),
                    department: model.get('department'),
                    showAdd: this.showAdd,
                    showSub: this.showSub,
                    error: false,
                    errorMsg: null
                }));
            }, this),
            error: _.bind(function (model, response) {
                this.$el.html(this.template({
                    icon_image: null,
                    real_name: null,
                    username: username,
                    school: null,
                    department: null,
                    foundUser: false,
                    showAdd: this.showAdd,
                    showSub: this.showSub,
                    error: true,
                    errorMsg: "没有对应的用户"
                }));
            }, this)
        });
    }
});
var AdministerUserView = Backbone.View.extend({
    el: $("#athena-administer-input-list"),
    initialize: function () {
        //创建一个用户输入框，不可读。因为当前登录的用户一定是管理员之一
        var item = new UserInputItemView;
        item.showAdd = false;
        item.showSub = false;
        var $thisuser = item.render().$el.find(".athena-user-input");
        $thisuser.attr('readonly', true);
        profile.on('change:user', function () {
            $thisuser.val(profile.get('user').username);
        });
        this.$el.append($thisuser);

        this.entryList = new Array;
        this.addNewEntry();
    },
    events: {
        "click .athena-participator-push-input-entry": "addNewEntry",
        "click .athena-participator-pop-input-entry": "deleteEntry"
    },
    addNewEntry: function () {
        var item = new UserInputItemView();
        item.showAdd = true;
        if (this.entryList.length > 0) {
            item.showSub = true;
            var lastEntry = this.entryList[this.entryList.length - 1];
            lastEntry.showAdd = false;
            lastEntry.showSub = false;
            lastEntry.render();
        }
        else
            item.showSub = false;
        this.entryList.push(item);
        this.$el.append(item.render().$el);
    },
    deleteEntry: function () {
        if (this.entryList && this.entryList.length > 1) {
            var lastEntry = this.entryList[this.entryList.length - 1];
            lastEntry.$el.remove();
            this.entryList.pop();
            lastEntry = this.entryList[this.entryList.length - 1];
            lastEntry.showAdd = true;
            if (this.entryList.length > 1) {
                lastEntry.showSub = true;
            }
            else {
                lastEntry.showSub = false;
            }
            lastEntry.render();
        }
    }
});
var administerUserView = new AdministerUserView;

var ParticipatorUserView = Backbone.View.extend({
    el: $("#athena-participator-input-list"),
    initialize: function () {
        this.entryList = new Array;
        this.addNewEntry();
    },
    events: {
        "click .athena-participator-push-input-entry": "addNewEntry",
        "click .athena-participator-pop-input-entry": "deleteEntry"
    },
    addNewEntry: function () {
        var item = new UserInputItemView();
        item.showAdd = true;
        if (this.entryList.length > 0) {
            item.showSub = true;
            var lastEntry = this.entryList[this.entryList.length - 1];
            lastEntry.showAdd = false;
            lastEntry.showSub = false;
            lastEntry.render();
        }
        else
            item.showSub = false;
        this.entryList.push(item);
        this.$el.append(item.render().$el);
    },
    deleteEntry: function () {
        if (this.entryList && this.entryList.length > 1) {
            var lastEntry = this.entryList[this.entryList.length - 1];
            lastEntry.$el.remove();
            this.entryList.pop();
            lastEntry = this.entryList[this.entryList.length - 1];
            lastEntry.showAdd = true;
            if (this.entryList.length > 1) {
                lastEntry.showSub = true;
            }
            else {
                lastEntry.showSub = false;
            }
            lastEntry.render();
        }
    }
});

var ActivityGroupLib = Backbone.Collection.extend({
    url: API_ROOT + "/activity_group/"
});
var activityGroupLib = new ActivityGroupLib;
var ActivityGroupForm = Backbone.View.extend({
    el: $("#athena-new-activity-group-main"),
    events: {
        "submit #athena-new-activity-group-form": "submitForm"
    },
    submitForm: function (event) {
        event.preventDefault();
        var normal_user = new Array;
        _.each(participatorUserView.$el.find(".athena-user-input"), function (input) {
            normal_user.push($(input).val());
        });
        var admin_user = new Array;
        _.each(administerUserView.$el.find(".athena-user-input"), function (input) {
            admin_user.push($(input).val());
        });
        activityGroupLib.create({
            activity_group_name: $('#athena-name-input').val(),
            admin_user: admin_user,
            normal_user: normal_user
        }, {
            headers: {'Authorization': 'JWT ' + token},
            success: function (model, response) {
                alert(model.get('url'));
                window.location = "activity-group.html#activities/" + model.get('url') + '/?format=json';
            },
            error: function (model, response) {
                alert("create error" + JSON.stringify(response));
            }
        });
    }
});
var activityGroupForm = new ActivityGroupForm;
var participatorUserView = new ParticipatorUserView;