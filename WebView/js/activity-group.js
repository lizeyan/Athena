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
var RegisterEntry = Backbone.Model.extend({});
var RegisterLog = Backbone.Collection.extend({
    model: RegisterEntry,
    url: API_ROOT + '/register_log/',
    parse: function (response) {
        return response.results;
    }
});
var registerLog = new RegisterLog;

var RateByActivityModel = Backbone.Model.extend ({
    defaults: {
        data: new Array
    }
});
var rateByActivityModel = new RateByActivityModel;
var RateByPersonModel = Backbone.Model.extend({
    defaults: {
        data: new Array
    }
});
var rateByPersonModel = new RateByPersonModel;
var RateActivityGraph = Backbone.View.extend ({
    el: $("#athena-rate-activity-graph"),
    initialize: function () {
        this.listenTo(this.model, 'change', this.render);
    },
    render: function () {
        this.model.get('data').sort(function (a, b) {
            if ((new Date(a.label)) < (new Date(b.label)))
                return -1;
            else
                return 1;
        });
        var chart = new Chart (document.getElementById("athena-rate-activity-graph"), {
            type: 'line',
            data: {
                labels: _.pluck(this.model.get('data'), 'label'),
                datasets: [
                    {
                        label: "出勤率",
                        fill: false,
                        lineTension: 0.1,
                        backgroundColor: "rgba(75,192,192,0.4)",
                        borderColor: "rgba(75,192,192,1)",
                        borderCapStyle: 'butt',
                        borderDash: [],
                        borderDashOffset: 0.0,
                        borderJoinStyle: 'miter',
                        pointBorderColor: "rgba(75,192,192,1)",
                        pointBackgroundColor: "#fff",
                        pointBorderWidth: 1,
                        pointHoverRadius: 5,
                        pointHoverBackgroundColor: "rgba(75,192,192,1)",
                        pointHoverBorderColor: "rgba(220,220,220,1)",
                        pointHoverBorderWidth: 2,
                        pointRadius: 1,
                        pointHitRadius: 10,
                        data: _.pluck(this.model.get('data'), 'rate'),
                        spanGaps: false
                    }
                ]
            }
        });
        return this;
    }
});
var rateActivityGraph = new RateActivityGraph ({model: rateByActivityModel});
var RateByPersonGraph = Backbone.View.extend({
    el: $("#athena-rate-person-graph"),
    initialize: function () {
        this.listenTo(this.model, 'change', this.render);
    },
    render: function () {
        var chart = new Chart(this.$el, {
            type: 'bar',
            data: {
                labels: _.pluck(this.model.get('data'), 'user_name'),
                datasets: [
                    {
                        label: "出勤率",
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
                        data: _.pluck(this.model.get('data'), 'rate')
                    }
                ]
            }
        });
        return this;
    }
});
var rateByPersonGraph = new RateByPersonGraph({model: rateByPersonModel});
var ActivityUserCheckinItem = Backbone.View.extend({
    tagName: "div",
    template: _.template($("#tmplt-activity-user-checkin-item").html()),
    render: function (name, check, icon) {
        this.$el.html(this.template({'real_name': name, 'check': check, 'icon_image': icon}));
        return this;
    }
});
var ActivityListItem = Backbone.View.extend({
    tagName: "li",
    template: _.template($("#tmplt-activity-list-item").html()),
    initialize: function () {
        this.listenTo(this.model, 'change', this.render);
    },
    events: {
        'click .athena-activity-close-button': "closeActivity"
    },
    render: function (user_list) {
        this.user_list = user_list;
        _.sortBy(this.user_list, 'real_name');
        // alert (this.model.begin_time);
        var beginDate = new Date(this.model.begin_time);
        var endDate = new Date(this.model.end_time);
        beginDate = new Date(beginDate.getTime() + beginDate.getTimezoneOffset() * 60000);
        endDate = new Date(endDate.getTime() + endDate.getTimezoneOffset() * 60000);
        this.$el.html(this.template({
            location: this.model.location,
            begin_time: beginDate.toLocaleDateString() + beginDate.toLocaleTimeString(),
            spense_time: (new Duration(endDate.getTime() - beginDate.getTime())).toString()
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
    closeActivity: function () {
        $.ajax({
            headers: {'Authorization': 'JWT ' + token},
            type: "DELETE",
            url: this.model.url,
            success: function (msg) {
                window.location.reload();
            },
            error: function () {
                $('#athena-info-list').append((new InfoBox).render({
                    type: "danger",
                    text: "关闭活动失败"
                }).$el);
                window.location.reload();
            }
        });
    },
    createUserCheckinList: function (activity_register_log) {
        var $checkList = $(this.$el.find(".athena-activity-checkin-list")[0]);
        this.check_list = new Object();
        _.each(this.user_list, function (user) {
            this.check_list[user.user] = new Object();
            this.check_list[user.user].checked = false;
            this.check_list[user.user].real_name = user.real_name;
            this.check_list[user.user].icon_image = user.icon_image;
        }, this);
        var attendanceCnt = 0;
        _.each(activity_register_log.models, function (entry) {
            if (entry.get('register_user').user in this.check_list) {
                this.check_list[entry.get('register_user').user].checked = true;
                attendanceCnt += 1;
            }
        }, this);
        // alert (JSON.stringify(rateByActivityModel));
        rateByActivityModel.get('data').push(new Object({label:(new Date(this.model.begin_time)).toLocaleDateString(), rate: attendanceCnt}));
        if (rateByActivityModel.get('data').length == activityGroup.get('activity').length)
            rateByActivityModel.trigger('change');
        _.each(this.check_list, function (entry) {
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
        //render and
        _.each(this.model.get('activity'), function (activity) {
            this.$el.append((new ActivityListItem({model: activity})).render(userList).$el);
        }, this);
        //render graph
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
    events: {
        "click .athena-administer-delete-button": "deleteAdminister"
    },
    deleteAdminister: function () {
        $.ajax({
            headers: {'Authorization': 'JWT ' + token},
            type: "POST",
            url: API_ROOT + '/activity_group/remove_user/',
            data: JSON.stringify({activity_group_id: activityGroup.get('pk'), user_list: [this.model.user]}),
            success: function (msg) {
                window.location.reload();
            },
            error: function () {
                $('#athena-info-list').append((new InfoBox).render({
                    type: "danger",
                    text: "删除失败"
                }).$el);
            }
        });
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
var AdministerList = Backbone.View.extend({
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
    events: {
        "click .athena-participator-delete-button": "deleteParticipator"
    },
    deleteParticipator: function () {
        $.ajax({
            headers: {'Authorization': 'JWT ' + token},
            type: "POST",
            url: API_ROOT + '/activity_group/remove_user/',
            dateType: 'json',
            data: JSON.stringify({activity_group_id: activityGroup.get('pk'), user_list: [this.model.user]}),
            success: function (msg) {
                window.location.reload();
            },
            error: function () {
                $('#athena-info-list').append((new InfoBox).render({
                    type: "danger",
                    text: "删除失败"
                }).$el);
            }
        });
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
                var rate = (i / Object.keys(activity_check_list).length);
                rateByPersonModel.get('data').push(new Object({user_name: this.model.user, rate: rate}));
                // alert (JSON.stringify(rateByPersonModel.get('data')));
                if (rateByPersonModel.get('data').length == activityGroup.get('normal_user').length)
                    rateByPersonModel.trigger('change');
                this.$el.find('.athena-rate-span').html((rate * 100).toFixed(2));
            }, this),
            data: $.param({user_id: this.model.pk, activity_group_id: activityGroup.get('pk')})
        });
        this.setEL({
            user: this.model.user,
            real_name: this.model.real_name,
            image: this.model.icon_image,
        });
        return this;
    },
    setEL: function (args) {
        this.$el.html(this.template(args));
    }
});
var ParcitipatorList = Backbone.View.extend({
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
var ActivityGroupUserAdderLib = Backbone.Collection.extend({
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
var ControllerView = Backbone.View.extend({
    el: $("#athena-add-new-div"),
    events: {
        "click #athena-new-participator-button": "newParticipator",
        "click #athena-new-administer-button": "newAdminister"
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
        (new ActivityGroupUserAdderLib).create({
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
        (new ActivityGroupUserAdderLib).create({
            activity_group_id: activityGroup.get('pk'),
            admin_user_list: this.getUserList()
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
/*******************************************************
 * new activity modal
 */
var NewActvityModel = Backbone.View.extend({
    el: $('#athena-new-activity-modal'),
    initialize: function () {
        this.method = parseInt($('#athena-new-activity-repeat-method-select').val());
    },
    events: {
        "submit #athena-new-activity-form": "newActivity",
        "change #athena-new-activity-repeat-method-select": "repeatMethodChanged"
    },
    newActivity: function (event) {
        event.preventDefault();
        var times = 1;
        if (this.method != 0)
            times = $('#athena-new-activity-repeat-times-input').val();
        var begin_time = new Date($('#athena-new-activity-begin-time-input').val());
        var end_time = new Date($('#athena-new-activity-end-time-input').val());
        var finishCnt = times;
        while (times > 0) {
            // alert (begin_time.toUTCString());
            (new ActivityAdderLib).create({
                activity_group_id: activityGroup.get('pk'),
                location: $("#athena-new-activity-location-input").val(),
                begin_time: begin_time,
                end_time: end_time
            }, {
                headers: {'Authorization': 'JWT ' + token},
                success: function () {
                    finishCnt -= 1;
                    // alert (finishCnt);
                    if (finishCnt == 0)
                        window.location.reload();
                },
                error: function (model, response) {
                    $('#athena-info-list').append((new InfoBox).render({
                        type: "danger",
                        text: "添加失败：" + response.responseText
                    }).$el);
                }
            });
            times -= 1;
            begin_time = new Date(begin_time.getTime() + this.method);
            end_time = new Date(end_time.getTime() + this.method);
        }
    },
    repeatMethodChanged: function () {
        this.method = parseInt($('#athena-new-activity-repeat-method-select').val());
        if (this.method == 0)
            $('#athena-new-activity-repeat-times-input').attr('disabled', true);
        else
            $('#athena-new-activity-repeat-times-input').attr('disabled', false);
    }
});
var newActivityModal = new NewActvityModel;
/***************************************************8
 * close activity group modal
 */
var CloseActvityGroupModal = Backbone.View.extend ({
    el: $('#athena-activity-group-close-modal'),
    events: {
        "click #athena-activity-group-close-confirm-button":    "closeActivityGroup"
    },
    confirm: function () {
        return $('#athena-activity-group-close-confirm-input').val() == activityGroup.get('activity_group_name');
    },
    closeActivityGroup: function () {
        if (!this.confirm())
        {
            $('#athena-info-list').append((new InfoBox).render({
                type: "danger",
                text: "确认活动组名称失败"
            }).$el);
        }
        else
        {
            $.ajax({
                headers: {'Authorization': 'JWT ' + token},
                type: "DELETE",
                url: activityGroup.url,
                success: function () {
                    window.location = "user.html";
                },
                error: function () {
                    $('#athena-info-list').append((new InfoBox).render({
                        type: "danger",
                        text: "关闭活动组失败"
                    }).$el);
                    window.location.reload();
                }
            });
        }
    }
});
var closeActvityGroupModel = new CloseActvityGroupModal;
/********************************************
 * set A Router
 */
var Router = Backbone.Router.extend({
    routes: {
        "activities/*path": "showActivityList",
        "administers/*path": "showAdministerList",
        "participators/*path": "showParticipatorList",
        "settings/*path": "showSettings",
        "activities": "showActivityList",
        "administers": "showAdministerList",
        "settings": "showSettings",
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
                    $('.athena-admin-control').css('display', 'inherit');
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
        $('#athena-activity-group-settings-div').hide();
    },
    showSettings: function (agUrl) {
        if (agUrl == null) {
            window.location = "#settings/" + activityGroup.url;
            return;
        }
        this.deactivateAll();
        this.viewUrl(agUrl);
        $('#athena-activity-group-settings-div').show();
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

$(function () {
    var router = new Router;
    Backbone.history.start();

});

