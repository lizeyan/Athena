/**
 * Created by zy-li14 on 16-10-17.
 */
var ActivityGroup = Backbone.Model.extend({
    parse: function (response) {
        //重置url
        this.url = response.url;
        delete response["url"];
        return response;
    }
});
var activityGroup = new ActivityGroup;
var iAmAdminister = false;
/*************************************************************************
 * set Page Head
 * @type {any}
 */
var ActivityGroupPageHead = Backbone.View.extend({
    el: $('#athena-activity-group-title'),
    //this.model应当是一个ActivityGroup。
    initialize: function () {
        this.listenTo(this.model, 'change', this.render);
    },
    template: _.template($('#tmplt-activity-group-page-head').html()),
    render: function () {
        this.$el.html(this.template({
            url: this.model.url,
            activity_group_name: this.model.get('activity_group_name')
        }));
        return this;
    }
});
var activityGroupPageHead = new ActivityGroupPageHead({model: activityGroup});
/***************************************************************88
 * set Activity List
 * @type {any}
 */
var RegisterEntry = Backbone.Model.extend ({});
var RegisterLog = Backbone.Collection.extend ({
    model: RegisterEntry,
    url: API_ROOT + '/register_log/',
    parse: function (response) {
        return response.results;
    }
});
var registerLog = new RegisterLog;

var ActivityUserCheckinItem = Backbone.View.extend ({
    tagName: "div",
    template: _.template($("#tmplt-activity-user-checkin-item").html()),
    render: function (name, check, icon) {
        this.$el.html(this.template ({'real_name': name, 'check': check, 'icon_image': icon}));
        return this;
    }
});
var ActivityListItem = Backbone.View.extend({
    tagName: "li",
    template: _.template($("#tmplt-activity-list-item").html()),
    initialize: function () {
        this.listenTo(this.model, 'change', this.render);
    },
    render: function (user_list) {
        this.user_list = user_list;
        _.sortBy(this.user_list, 'real_name');
        var beginDate = new Date (this.model.begin_time);
        var endDate = new Date (this.model.end_time);
        this.$el.html(this.template({
            location: this.model.location,
            begin_time: beginDate.toLocaleDateString(),
            spense_time: (new Duration (endDate.getTime() - beginDate.getTime())).toString()
        }));
        this.activity_register_log = registerLog.clone();
        this.activity_register_log.fetch({
            headers: {'Authorization': 'JWT ' + token},
            reset: true,
            wait: true,
            success: _.bind(function (collection) {
                this.createUserCheckinList(collection);
            }, this),
            data: $.param({activity_id: this.model.pk})
        });
        return this;
    },
    createUserCheckinList: function (activity_register_log) {
        var $checkList = $(this.$el.find(".athena-activity-checkin-list")[0]);
        var check_list = new Object();
        _.each(this.user_list, function (user) {
            check_list[user.user] = new Object();
            check_list[user.user].checked = false;
            check_list[user.user].real_name = user.real_name;
            check_list[user.user].icon_image = user.icon_image;
        });
        _.each(activity_register_log.models, function (entry) {
            if (entry.get('register_user').user in check_list)
                check_list[entry.get('register_user').user].checked = true;
        });
        _.each(check_list, function (entry) {
            $checkList.append((new ActivityUserCheckinItem).render(entry.real_name, entry.checked, entry.icon_image).$el);
        });
    }
});
var ActivityList = Backbone.View.extend({
    el: $('#athena-activity-list'),
    initialize: function () {
        this.listenTo(this.model, 'change', this.render);
    },
    template: _.template($('#tmplt-activity-list-item').html()),
    render: function () {
        this.$el.empty();
        var userList = this.model.get('normal_user');
        _.each(this.model.get('activity'), function (activity) {
            this.$el.append((new ActivityListItem({model: activity})).render(userList).$el);
        }, this);
        return this;
    }
});
var activityList = new ActivityList({model: activityGroup});
/***************************************************************88
 * set Administer List
 * @type {any}
 */

var AdministerListItem = Backbone.View.extend({
    tagName: "li",
    template: _.template($("#tmplt-administer-list-item").html()),
    initialize: function () {
        this.listenTo(this.model, "change", this.render);
    },
    render: function () {
        this.$el.html(this.template({
            user: this.model.user,
            real_name: this.model.real_name,
            image: this.model.icon_image
        }));
        return this;
    }
});
var AdministerList = Backbone.View.extend ({
    el: $('#athena-administer-list'),
    initialize: function () {
        this.listenTo(this.model, 'change', this.render);
    },
    template: _.template($('#tmplt-administer-list-item').html()),
    render: function () {
        this.$el.empty();
        _.each(this.model.get('admin_user'), function (administer) {
            this.$el.append((new AdministerListItem({model: administer})).render().$el);
        }, this);
        return this;
    }
});
var administerList = new AdministerList({model: activityGroup});
/***************************************************************88
 * set Participator List
 * @type {any}
 * 显示参与者列表
 */

var ParticipatorListItem = Backbone.View.extend({
    tagName: "li",
    template: _.template($("#tmplt-participator-list-item").html()),
    initialize: function () {
        this.listenTo(this.model, "change", this.render);
    },
    render: function () {
        // alert(this.model.pk + this.model.real_name);
        this.activity_register_log = registerLog.clone();
        var activity_check_list = new Object();
        _.each(activityGroup.get('activity'), function (activity) {
            activity_check_list[activity.url] = false;
        });
        this.activity_register_log.fetch({
            headers: {'Authorization': 'JWT ' + token},
            success: _.bind(function (collection) {
                var i = 0;
                _.each(collection.models, function (entry) {
                    if (entry.get('activity').url in activity_check_list) {
                        activity_check_list[entry.get('activity').url] = true;
                        i += 1;
                    }
                });
                this.setEL( {
                    user: this.model.user,
                    real_name: this.model.real_name,
                    image: this.model.icon_image,
                    rate: i / Object.keys(activity_check_list).length
                })
            }, this),
            data: $.param({user_id: this.model.pk, activity_group_id: activityGroup.get('pk')})
        });
        this.setEL({
            user: this.model.user,
            real_name: this.model.real_name,
            image: this.model.icon_image,
            rate: null
        });
        return this;
    },
    setEL: function (args) {
        this.$el.html (this.template(args));
    }
});
var ParcitipatorList = Backbone.View.extend ({
    el: $('#athena-participator-list'),
    initialize: function () {
        this.listenTo(this.model, 'change', this.render);
    },
    template: _.template($('#tmplt-participator-list-item').html()),
    render: function () {
        this.$el.empty();
        _.each(this.model.get('normal_user'), function (participator) {
            this.$el.append((new ParticipatorListItem({model: participator})).render().$el);
        }, this);
        return this;
    }
});
var participatorList = new ParcitipatorList({model: activityGroup});
/*********************************************8
 * Info Box
 * 用于在顶部信息列表显示一条信息
 * @type {any}
 */
var InfoBox = Backbone.View.extend({
    tagName: 'div',
    template: _.template($('#tmplt-box-info').html()),
    render: function (args) {
        this.$el.html(this.template(args));
        return this;
    }
});
/********************************************************
 * Set Activity Adder
 * 添加活动的URL
 */
var ActivityAdderLib = Backbone.Collection.extend({
    url: API_ROOT + "/activity/"
});
/*********************************************************
 * User Input List Item
 * @type {any}
 * 添加参与者和管理者
 */
var ActivityGroupUserAdderLib = Backbone.Collection.extend ({
    url: API_ROOT + "/activity_group/add_user/"
});
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
            url: API_ROOT + '/profile/?format=json',
            headers: {'Authorization': 'JWT ' + token},
            data: $.param({username: username}),
            success: _.bind(function (model, response) {
                // alert (JSON.stringify(model));
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
var UserInputListView = Backbone.View.extend({
    el: $("#athena-user-input-list"),
    initialize: function () {
        this.entryList = new Array;
        this.addNewEntry();
    },
    events: {
        "click .athena-user-push-input-entry": "addNewEntry",
        "click .athena-user-pop-input-entry": "deleteEntry"
    },
    addNewEntry: function () {
        var item = new UserInputItemView;
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
var userInputListView = new UserInputListView;
var ControllerView = Backbone.View.extend ({
    el: $("#athena-admin-control"),
    events: {
        "click #athena-new-participator-button"     :       "newParticipator",
        "click #athena-new-administer-button"       :       "newAdminister"
    },
    getUserList: function () {
        var ret = new Array;
        // alert (this.el.find(".athena-user-input"));
        _.each(this.$el.find(".athena-user-input"), function (input) {
            ret.push($(input).val());
        });
        return ret;
    },
    newParticipator: function () {
        (new ActivityGroupUserAdderLib).create ({
            activity_group_id: activityGroup.get('pk'),
            normal_user_list: this.getUserList()
        }, {
            headers: {'Authorization': 'JWT ' + token},
            success: function () {
                window.location.reload();
            },
            error: function (collection, response) {
                $('#athena-info-list').append((new InfoBox).render({
                    type: "danger",
                    text: "添加失败：" + response.responseText
                }).$el);
            }
        });
    },
    newAdminister: function () {
        (new ActivityGroupUserAdderLib).create ({
            activity_group_id: activityGroup.get('pk'),
            admin: this.getUserList()
        }, {
            headers: {'Authorization': 'JWT ' + token},
            success: function () {
                window.location.reload();
            },
            error: function (collection, response) {
                $('#athena-info-list').append((new InfoBox).render({
                    type: "danger",
                    text: "添加失败：" + response.responseText
                }).$el);
            }
        });
    }

});
var controllerView = new ControllerView;
/********************************************
 * set A Router
 */
$(function () {
    var Router = Backbone.Router.extend({
        routes: {
            "activities/*path": "showActivityList",
            "administers/*path": "showAdministerList",
            "participators/*path": "showParticipatorList",
            "activities": "showActivityList",
            "administers": "showAdministerList",
            "participators": "showParticipatorList"
        },
        viewUrl: function (agUrl) {
            activityGroup.url = agUrl;
            activityGroup.fetch({
                headers: {'Authorization': 'JWT ' + token},
                success: function (model) {
                    var admin_user_list = model.get('admin_user');
                    var myid = profile.get('pk');
                    _.each(admin_user_list, function (user) {
                        if (user.pk == myid)
                            iAmAdminister = true;
                    });
                    if (iAmAdminister) {
                        $('#athena-admin-control').css('display', 'block');
                    }
                },
                error: function (model, response) {
                    window.location = "user.html";
                },
                reset: true
            });
        },
        deactivateAll: function () {
            _.each($('#athena-activity-group-main-nav').children('li'), function (li) {
                $(li).removeClass('active');
            });
            activityList.$el.hide();
            administerList.$el.hide();
            participatorList.$el.hide();
            $('#athena-new-activity-modal-button').hide();
            $('#athena-new-participator-button').hide();
            $('#athena-new-administer-button').hide();
            $('#athena-user-input-div').hide();
        },
        showActivityList: function (agUrl) {
            if (agUrl == null) {
                window.location = "#activities/" + activityGroup.url;
                return;
            }
            this.deactivateAll();
            this.viewUrl(agUrl);
            activityList.$el.show();
            $('#athena-new-activity-modal-button').show();
            $('#athena-activity-group-main-nav-activity').addClass('active');
        },
        showAdministerList: function (agUrl) {
            if (agUrl == null) {
                window.location = "#administers/" + activityGroup.url;
                return;
            }
            this.deactivateAll();
            this.viewUrl(agUrl);
            administerList.$el.show();
            $('#athena-new-administer-button').show();
            $('#athena-user-input-div').show();
            $('#athena-activity-group-main-nav-administer').addClass('active');
        },
        showParticipatorList: function (agUrl) {
            if (agUrl == null) {
                window.location = "#participators/" + activityGroup.url;
                return;
            }
            this.deactivateAll();
            this.viewUrl(agUrl);
            participatorList.$el.show();
            $('#athena-user-input-div').show();
            $('#athena-new-participator-button').show();
            $('#athena-activity-group-main-nav-participator').addClass('active');
        }
    });
    var router = new Router;
    Backbone.history.start();

    $("#athena-new-activity-form").on('submit', function CreateActivity(event) {
        event.preventDefault();
        (new ActivityAdderLib).create({
            activity_group_id: activityGroup.get('pk'),
            location: $("#athena-new-activity-location-input").val(),
            begin_time: $("#athena-new-activity-begin-time-input").val(),
            end_time: $("#athena-new-activity-end-time-input").val()
        }, {
            headers: {'Authorization': 'JWT ' + token},
            success: function () {
                window.location.reload();
            },
            error: function (model, response) {
                $('#athena-info-list').append((new InfoBox).render({
                    type: "danger",
                    text: "添加失败：" + response.responseText
                }).$el);
            }
        });
    });
});

