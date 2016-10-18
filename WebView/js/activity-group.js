/**
 * Created by zy-li14 on 16-10-17.
 */
var ActivityGroup = Backbone.Model.extend({
    parse: function (response) {
        //重置url
        this.url = response.url;
        response.url = null;
        return response;
    }
});
var activityGroup = new ActivityGroup;
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
    render: function (name, check) {
        this.$el.html(this.template ({'real_name': name, 'check': check}));
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
        });
        _.each(activity_register_log.models, function (entry) {
            if (entry.get('register_user').user in check_list)
                check_list[entry.get('register_user').user].checked = true;
        });
        _.each(check_list, function (entry) {
            $checkList.append((new ActivityUserCheckinItem).render(entry.real_name, entry.checked).$el);
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
 */

var ParticipatorListItem = Backbone.View.extend({
    tagName: "li",
    template: _.template($("#tmplt-participator-list-item").html()),
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
/*************************************************************************8
 * set A RegisterLog
 */

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
                success: function () {
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
        },
        showActivityList: function (agUrl) {
            if (agUrl == null) {
                window.location = "#activities/" + activityGroup.url;
                return;
            }
            this.deactivateAll();
            this.viewUrl(agUrl);
            activityList.$el.show();
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
            $('#athena-activity-group-main-nav-participator').addClass('active');
        }
    });
    var router = new Router;
    Backbone.history.start();
});
