/**
 * Created by zy-li14 on 16-10-9.
 */
//check superuser
var UserModel = Backbone.Model.extend({
    url: API_ROOT + "/users/?format=json",
    parse: function (response) {
        return response.results[0];
    }
});
var userModel = new UserModel;
function CheckSuperUser() {
    userModel.fetch({
        headers: {'Authorization': 'JWT ' + token},
        success: function (model) {
            if (model.get('is_superuser') == true) {
                $("#athena-terminal-config-entry").css("display", "inline");
            }
        },
        error: function () {
        }
    });
}
CheckSuperUser();
//现在得到了一个profile，需要渲染界面
//左侧的名片和邮件的显示
var NameCard = Backbone.View.extend({
    el: $('#namecard'),
    initialize: function () {
        this.listenTo(this.model, 'change', this.render);
    },
    template: _.template($('#tmplt-namecard').html()),
    render: function () {
        // alert (this.model.get('url'));
        this.$el.html(this.template({
            'image': this.model.get('icon_image'),
            'realname': this.model.get('real_name'),
            'username': this.model.get('user').username
        }));
        return this;
    }
});
var Email = Backbone.View.extend({
    el: $('#contact-email'),
    initialize: function () {
        this.listenTo(this.model, 'change', this.render);
    },
    template: _.template($('#tmlpt-email').html()),
    render: function () {
        this.$el.html(this.template({
            email: this.model.get('user').email
        }));
        return this;
    }
});
//管理的所有活动的显示
var ActivityGroupCard = Backbone.View.extend({
    tagName: 'div',
    template: _.template($('#tmplt-activity-group').html()),
    render: function (option) {
        this.$el.html(this.template(option));
        return this;
    }
});
var AdminActivityGroupList = Backbone.View.extend({
    el: $('#athene-admin-activity-group-list'),
    initialize: function () {
        this.listenTo(this.model, 'change:admin_activity_group', this.render);
    },
    render: function () {
        this.$el.empty();
        _.each(this.model.get('admin_activity_group'), function (activity_group) {
            this.$el.append((new ActivityGroupCard).render({
                'activity_group_name': activity_group.activity_group_name,
                'url': activity_group.url
            }).$el);
        }, this);
        return this;
    }
});
var NormalActivityGroupList = Backbone.View.extend({
    el: $('#athene-normal-activity-group-list'),
    initialize: function () {
        this.listenTo(this.model, 'change:normal_activity_group', this.render);
    },
    render: function () {
        this.$el.empty();
        _.each(this.model.get('normal_activity_group'), function (activity_group) {
            this.$el.append((new ActivityGroupCard).render({
                'activity_group_name': activity_group.activity_group_name,
                'url': activity_group.url
            }).$el);
        }, this);
        return this;
    }
});
//定义完了View和Model，正常顺序处理
var namecard = new NameCard({model: profile});
var email = new Email({model: profile});
var adminActivityGroupList = new AdminActivityGroupList({model: profile});
var normalActivityGroupList = new NormalActivityGroupList({model: profile});

/************************88
 * overview
 */
var RegisterLogLib = Backbone.Collection.extend({
    url: API_ROOT + "/register_log/?format=json"
});
var registerLib = new RegisterLogLib;
var ActivityModel = Backbone.Model.extend({});
var ActivityLib = Backbone.Collection.extend({
    url: API_ROOT + "/activity/?format=json",
    parse: function (response) {
        return response.results;
    }
});
var ActivityPin = Backbone.View.extend({
    tagName: "div",
    template: _.template($("#tmplt-activity-pin").html()),
    initialize: function () {
        this.listenTo(this.model, 'change', this.render);
    },
    render: function () {
        var beginDate = new Date(this.model.get('begin_time'));
        var endDate = new Date(this.model.get('end_time'));
        beginDate = new Date(beginDate.getTime() + beginDate.getTimezoneOffset() * 60000);
        endDate = new Date(endDate.getTime() + endDate.getTimezoneOffset() * 60000);
        var type = "";
        var msg = "";
        var duration = (new Date().getTime()) - beginDate.getTime();
        if (duration >= 0) {
            registerLib.fetch({
                headers: {'Authorization': 'JWT ' + token},
                data: $.param({user_id: profile.get('user').pk, activity_id: this.model.get('pk')}),
                success: _.bind(function (collection, response) {
                    if (response.results.length == 0) {
                        type = "danger";
                        msg = "未签到";
                    }
                    else {
                        type = "success";
                        msg = "已签到";
                    }
                    this.$el.html(this.template({
                        activity_group_url: this.model.get('activity_group').url,
                        activity_group_name: this.model.get('activity_group').activity_group_name,
                        location: this.model.get('location'),
                        start_time: beginDate.toLocaleDateString() + beginDate.toLocaleTimeString(),
                        spense_time: (new Duration(endDate.getTime() - beginDate.getTime())).toString(),
                        type: type,
                        msg: msg
                    }));
                }, this)
            });
        }
        else {
            if (duration > -86400000) {
                type = "warning";
                msg = "即将开始";
            }
            else {
                type = "info";
                msg = "尚未开始";
            }
            this.$el.html(this.template({
                activity_group_url: this.model.get('activity_group').url,
                activity_group_name: this.model.get('activity_group').activity_group_name,
                location: this.model.get('location'),
                start_time: beginDate.toLocaleDateString() + beginDate.toLocaleTimeString(),
                spense_time: (new Duration(endDate.getTime() - beginDate.getTime())).toString(),
                type: type,
                msg: msg
            }));
        }
        return this;
    }
});
var RecentActivityView = Backbone.View.extend({
    el: $('#athena-overview-recent-activity-list'),
    initialize: function () {
        this.listenTo(this.model, 'change', this.render);
    },
    render: function () {
        var activityLib = new ActivityLib;
        activityLib.fetch({
            headers: {'Authorization': 'JWT ' + token},
            success: _.bind(function () {
                this.$el.empty();
                _.each(activityLib.models.slice(0, 6), function (model) {
                    this.$el.append((new ActivityPin({model: model})).render().$el);
                }, this);
            }, this),
            data: $.param({normal: 1})
        });
        return this;
    }
});
var OverView = Backbone.View.extend({
    el: $("#athena-overview-div"),
    initialize: function () {
        this.recentActivityView = new RecentActivityView({model: this.model});
        this.listenTo(this.model, "change", this.render);
    },
    render: function () {
        this.generateTotalGraph();
        this.generateActivityGroupNumberGraph();
        return this;
    },
    generateTotalGraph: function () {
        var activityLib = new ActivityLib;
        var pass = 0, miss = 0, undo = 0;
        activityLib.fetch({
            headers: {'Authorization': 'JWT ' + token},
            success: _.bind(function () {
                _.each(activityLib.models, function (activity) {
                    var beginDate = new Date(activity.get('begin_time'));
                    beginDate = new Date(beginDate.getTime() + beginDate.getTimezoneOffset() * 60000);
                    if ((new Date().getTime()) < beginDate.getTime())
                        undo += 1;
                });
                registerLib.fetch({
                    headers: {'Authorization': 'JWT ' + token},
                    data: $.param({user_id: profile.get('user').pk}),
                    success: _.bind(function (collection, response) {
                        pass = response.results.length;
                        miss = activityLib.models.length - pass - undo;
                        var chart = new Chart($("#athena-activity-total-graph"), {
                            type: 'pie',
                            data: {
                                labels: [
                                    "未开始",
                                    "未签到",
                                    "已签到"
                                ],
                                datasets: [
                                    {
                                        data: [undo, miss, pass],
                                        backgroundColor: [
                                            "#FF6384",
                                            "#36A2EB",
                                            "#FFCE56"
                                        ],
                                        hoverBackgroundColor: [
                                            "#FF6384",
                                            "#36A2EB",
                                            "#FFCE56"
                                        ]
                                    }]
                            }
                        });
                    }, this)
                });
            }, this),
            data: $.param({normal: 1})
        });
    },
    generateActivityGroupNumberGraph: function () {
        
    }
});
var overView = new OverView({model: profile});


//my router
$(function () {
    var Router = Backbone.Router.extend({
        routes: {
            "overview": "showOverview",
            "admin-activity-group": "showAdminActivityGroup",
            "normal-activity-group": "showNormalActivityGroup",
            "*path": "showOverview"
        },
        showOverview: function () {
            this.deactivateAll();
            overView.$el.show();
            $('#athena-main-nav-overview').addClass('active');
        },
        showAdminActivityGroup: function () {
            this.deactivateAll();
            adminActivityGroupList.$el.show();
            $('#athena-main-nav-admin').addClass('active');
        },
        showNormalActivityGroup: function () {
            this.deactivateAll();
            normalActivityGroupList.$el.show();
            $('#athena-main-nav-normal').addClass('active');
        },
        deactivateAll: function () {
            _.each($('#athena-main-nav').children('li'), function (li) {
                $(li).removeClass('active');
            });
            overView.$el.hide();
            adminActivityGroupList.$el.hide();
            normalActivityGroupList.$el.hide();
        }
    });
    var router = new Router;
    Backbone.history.start();
});
