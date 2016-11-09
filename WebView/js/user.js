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
                window.location = "root.html";
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
            var agc = new ActivityGroupCard;
            this.$el.append(agc.render({
                'activity_group_name': activity_group.activity_group_name,
                'url': activity_group.url,
                'is_classes': activity_group.is_classes,
                'request': ""
            }).$el);
            $.ajax({
                headers: {'Authorization': 'JWT ' + token},
                url: API_ROOT + "/register_request/?format=json",
                data: $.param({activity_group_id: activity_group.pk}),
                type: 'GET',
                success: _.bind(function (response) {
                    agc.render({
                        'activity_group_name': activity_group.activity_group_name,
                        'url': activity_group.url,
                        'is_classes': activity_group.is_classes,
                        'request': response.count
                    })
                }, this)
            });
        }, this);
        return this;
    }
});
var AdminActivityGroupView = Backbone.View.extend({
    el: $("#athena-admin-activity-group-div"),
    initialize: function () {
        this.listenTo(this.model, 'change', this.render);
    },
    render: function () {
        //get statistics and render graph
        var list = this.model.get('admin_activity_group');
        var cnt = 0;
        _.each(list, function (ag) {
            $.ajax({
                headers: {'Authorization': 'JWT ' + token},
                type: 'GET',
                url: API_ROOT + "/activity_group/register_log_statistics/?activity_group_id=" + ag.pk,
                contentType: "application/json",
                success: _.bind(function (response) {
                    cnt = cnt + 1;
                    if (response.activity_size == 0 || response.normal_user_size == 0)
                        ag.rate = 0.0;
                    else
                        ag.rate = response.register_size / (response.activity_size * response.normal_user_size);
                    if (cnt == list.length)
                        this.renderActivityGroupGraph();
                }, this)
            });
        }, this);
        return this;
    },
    renderActivityGroupGraph: function () {
        var myBarChart = new Chart(document.getElementById("athena-activity-group-statistics-graph"), {
            type: 'bar',
            data: {
                labels: _.pluck(this.model.get("admin_activity_group"), "activity_group_name"),
                datasets: [
                    {
                        label: "活动组出勤率",
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(255, 159, 64, 0.2)'
                        ],
                        borderColor: [
                            'rgba(255,99,132,1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)'
                        ],
                        borderWidth: 1,
                        data: _.pluck(this.model.get("admin_activity_group"), "rate")
                    }
                ]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            min: 0,
                            max: 1,
                            stepSize: 0.1
                        }
                    }]
                }
            }
        });
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
            // alert (activity_group.is_classes);
            this.$el.append((new ActivityGroupCard).render({
                'activity_group_name': activity_group.activity_group_name,
                'url': activity_group.url,
                'is_classes': activity_group.is_classes,
                'request': ""
            }).$el);
        }, this);
        return this;
    }
});
//定义完了View和Model，正常顺序处理
var namecard = new NameCard({model: profile});
var email = new Email({model: profile});
var adminActivityGroupList = new AdminActivityGroupList({model: profile});
var adminActivityGroupView = new AdminActivityGroupView({model: profile});
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
var AdminActivityPin = Backbone.View.extend({
    tagName: "div",
    template: _.template($("#tmplt-admin-activity-pin").html()),
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
        var showMsg = false;
        var showStatistics = false;
        var duration = (new Date().getTime()) - beginDate.getTime();
        var endDuration = (new Date().getTime()) - endDate.getTime();
        if (duration >= 0) {
            showStatistics = true;
            if (endDuration >= 0) {
                type = "success";
                msg = "已结束";
                showMsg = true;
            }
            $.ajax({
                headers: {'Authorization': 'JWT ' + token},
                type: 'GET',
                url: API_ROOT + '/activity/register_log_statistics/',
                data: $.param({activity_id: this.model.get('pk')}),
                success: _.bind(function (response) {
                    this.$el.html(this.template({
                        activity_group_url: this.model.get('activity_group').url,
                        activity_group_name: this.model.get('activity_group').activity_group_name,
                        location: this.model.get('location'),
                        start_time: beginDate.toLocaleDateString() + beginDate.toLocaleTimeString(),
                        spense_time: (new Duration(endDate.getTime() - beginDate.getTime())).toString(),
                        done: response['actually_register_size'],
                        all: response['need_register_size'],
                        type: type,
                        msg: msg,
                        showMsg: showMsg,
                        showStatistics: showStatistics
                    }));
                }, this)
            });
        }
        else {
            showMsg = true;
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
                msg: msg,
                done: null,
                all: null,
                showMsg: showMsg,
                showStatistics: showStatistics
            }));
        }
        return this;
    }
});
var RecentActivityView = Backbone.View.extend({
    el: $('#athena-overview-recent-activity-list'),
    initialize: function () {
        this.$header = $("#athena-overview-recent-activity-list-header");
        this.$header.find(".athena-collapse-span").hide();
        this.$el.on('shown.bs.collapse', _.bind(function () {
            this.$header.find(".athena-collapse-span").hide();
        }, this));
        this.$el.on('hidden.bs.collapse', _.bind(function () {
            this.$header.find(".athena-collapse-span").show();
        }, this));
        this.listenTo(this.model, 'change', this.render);
    },
    render: function () {
        var activityLib = new ActivityLib;
        activityLib.fetch({
            headers: {'Authorization': 'JWT ' + token},
            success: _.bind(function () {
                this.$el.empty();
                activityLib.models.sort(function (a, b) {
                    var x = (new Date(a.get('begin_time'))).getTime() - (new Date()).getTime();
                    var y = (new Date(b.get('begin_time'))).getTime() - (new Date()).getTime();
                    if (Math.abs(x) > Math.abs(y))
                        return 1;
                    else
                        return -1;
                });
                var list = activityLib.models.slice(0, 6);
                list.sort(function (a, b) {
                    if ((new Date(a.get('begin_time'))).getTime() < (new Date(b.get('begin_time'))).getTime())
                        return -1;
                    else
                        return 1;
                });
                _.each(list, function (model) {
                    this.$el.append((new ActivityPin({model: model})).render().$el);
                }, this);
            }, this),
            data: $.param({normal: true})
        });
        return this;
    }
});
var RecentAdminActivityView = Backbone.View.extend({
    el: $('#athena-overview-recent-admin-activity-list'),
    initialize: function () {
        this.$header = $("#athena-overview-recent-admin-activity-list-header");
        this.$header.find(".athena-collapse-span").hide();
        this.$el.on('shown.bs.collapse', _.bind(function () {
            this.$header.find(".athena-collapse-span").hide();
        }, this));
        this.$el.on('hidden.bs.collapse', _.bind(function () {
            this.$header.find(".athena-collapse-span").show();
        }, this));
        this.listenTo(this.model, 'change', this.render);
        this.listenTo(this.model, 'change', this.render);
    },
    render: function () {
        var activityLib = new ActivityLib;
        activityLib.fetch({
            headers: {'Authorization': 'JWT ' + token},
            success: _.bind(function () {
                this.$el.empty();
                activityLib.models.sort(function (a, b) {
                    var x = (new Date(a.get('begin_time'))).getTime() - (new Date()).getTime();
                    var y = (new Date(b.get('begin_time'))).getTime() - (new Date()).getTime();
                    if (Math.abs(x) > Math.abs(y))
                        return 1;
                    else
                        return -1;
                });
                var list = activityLib.models.slice(0, 6);
                list.sort(function (a, b) {
                    if ((new Date(a.get('begin_time'))).getTime() < (new Date(b.get('begin_time'))).getTime())
                        return -1;
                    else
                        return 1;
                });
                _.each(list, function (model) {
                    this.$el.append((new AdminActivityPin({model: model})).render().$el);
                }, this);
            }, this)
        });
    }
});
var OverView = Backbone.View.extend({
    el: $("#athena-overview-div"),
    initialize: function () {
        var $totalGraphHeader = $("#athena-activity-total-graph-header");
        var $totalGraph = $("#athena-activity-total-graph");
        $totalGraphHeader.find(".athena-collapse-span").hide();
        $totalGraph.on('shown.bs.collapse', _.bind(function () {
            $totalGraphHeader.find(".athena-collapse-span").hide();
        }, this));
        $totalGraph.on('hidden.bs.collapse', _.bind(function () {
            $totalGraphHeader.find(".athena-collapse-span").show();
        }, this));
        var $agGraphHeader = $("#athena-activity-group-statistics-graph-header");
        var $agGraph = $("#athena-activity-group-statistics-graph");
        $agGraphHeader.find(".athena-collapse-span").hide();
        $agGraph.on('shown.bs.collapse', _.bind(function () {
            $agGraphHeader.find(".athena-collapse-span").hide();
        }, this));
        $agGraph.on('hidden.bs.collapse', _.bind(function () {
            $agGraphHeader.find(".athena-collapse-span").show();
        }, this));
        this.listenTo(this.model, 'change', this.render);
        this.listenTo(this.model, 'change', this.render);
        this.recentActivityView = new RecentActivityView({model: this.model});
        this.recentAdminActivityView = new RecentAdminActivityView({model: this.model});
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
            adminActivityGroupView.$el.show();
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
            adminActivityGroupView.$el.hide();
            normalActivityGroupList.$el.hide();
        }
    });
    var router = new Router;
    Backbone.history.start();
});
