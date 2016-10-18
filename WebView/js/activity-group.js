/**
 * Created by zy-li14 on 16-10-17.
 */
var Activity = Backbone.Model.extend({});
var ActivityGroup = Backbone.Collection.extend({
    model: Activity,
    activity_group_name: '',
    url: '',
    admin_user: [],
    normal_user: [],
    parse: function (response, options) {
        this.activity_group_name = response.activity_group_name;
        this.url = response.url;
        this.admin_user = response.admin_user;
        this.normal_user = response.normal_user;
        return response.activity;
    }
});
var activityGroup = new ActivityGroup;
/*************************************************************************
 * set Page Head
 * @type {any}
 */
var ActivityGroupPageHead = Backbone.View.extend({
    el: $('#athena-activity-group-title'),
    initialize: function () {
        this.listenTo(this.collection, 'reset', this.render);
    },
    template: _.template($('#tmplt-activity-group-page-head').html()),
    render: function () {
        this.$el.html(this.template({
            url: this.collection.url,
            activity_group_name: this.collection.activity_group_name
        }));
        return this;
    }
});
var activityGroupPageHead = new ActivityGroupPageHead({collection: activityGroup});
/***************************************************************88
 * set Activity List
 * @type {any}
 */
var ActivityListItem = Backbone.View.extend({
    tagName: "li",
    initialize: function () {
        this.listenTo(this.model, "change", this.render);
    },
    template: _.template($("#tmplt-activity-list-item").html()),
    initialize: function () {
        this.listenTo(this.model, 'change', this.render);
    },
    render: function () {
        this.$el.html(this.template({location: this.model.get('location')}));
        return this;
    }
});
var ActivityList = Backbone.View.extend({
    el: $('#athena-activity-list'),
    initialize: function () {
        this.listenTo(this.collection, 'reset', this.render);
    },
    template: _.template($('#tmplt-activity-list-item').html()),
    render: function () {
        this.$el.empty();
        _.each(this.collection.models, function (activity) {
            this.$el.append((new ActivityListItem({model: activity})).render().$el);
        }, this);
        return this;
    }
});
var activityList = new ActivityList({collection: activityGroup});
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
        this.$el.html(this.template({user: this.model.user}));
        return this;
    }
});
var AdministerList = Backbone.View.extend ({
    el: $('#athena-administer-list'),
    initialize: function () {
        this.listenTo(this.collection, 'reset', this.render);
    },
    template: _.template($('#tmplt-administer-list-item').html()),
    render: function () {
        this.$el.empty();
        _.each(this.collection.admin_user, function (administer) {
            this.$el.append((new AdministerListItem({model: administer})).render().$el);
        }, this);
        return this;
    }
});
var administerList = new AdministerList ({collection: activityGroup});
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
        this.$el.html(this.template({user: this.model.user}));
        return this;
    }
});
var ParcitipatorList = Backbone.View.extend ({
    el: $('#athena-participator-list'),
    initialize: function () {
        this.listenTo(this.collection, 'reset', this.render);
    },
    template: _.template($('#tmplt-participator-list-item').html()),
    render: function () {
        this.$el.empty();
        _.each(this.collection.normal_user, function (participator) {
            this.$el.append((new ParticipatorListItem({model: participator})).render().$el);
        }, this);
        return this;
    }
});
/********************************************
 * set A Router
 */
var participatorList = new ParcitipatorList ({collection: activityGroup});
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
                    // activityGroupPageHead.render();
                    // activityList.render();
                },
                error: function () {
                    alert('请求无效，返回用户界面')
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
