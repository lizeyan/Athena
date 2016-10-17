/**
 * Created by zy-li14 on 16-10-17.
 */
var Activity = Backbone.Model.extend ({

});
var ActivityGroup = Backbone.Collection.extend ({
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

var ActivityGroupPageHead = Backbone.View.extend ({
    el: $('#athena-activity-group-title'),
    template: _.template($('#tmplt-activity-group-page-head').html()),
    render: function () {
        this.$el.html(this.template ({
            url: this.collection.url,
            activity_group_name: this.collection.activity_group_name
        }));
        return this;
    }
});
var activityGroupPageHead = new ActivityGroupPageHead ({collection: activityGroup});

var ActivityListItem = Backbone.View.extend ({
    tagName: "li",
    template: _.template($("#tmplt-activity-list-item").html()),
    initialize: function () {
        this.listenTo(this.model, 'change', this.render);
    },
    render: function () {
        this.$el.html(this.template ({location: this.model.get('location')}));
        return this;
    }
});
var ActivityList = Backbone.View.extend ({
    el: $('#athena-activity-list'),
    template: _.template($('#tmplt-activity-list-item').html()),
    render: function () {
        this.$el.empty();
        _.each(this.collection.models, function (activity) {
            this.$el.append((new ActivityListItem({model: activity})).render().$el);
        }, this);
        return this;
    }
});
var activityList = new ActivityList ({collection: activityGroup});

$(function () {
    var Router = Backbone.Router.extend ({
        routes: {
            "activity-group/*path"     :   "viewUrl"
        },
        viewUrl: function (agUrl) {
            activityGroup.url = agUrl;
            activityGroup.fetch({
                headers: {'Authorization': 'JWT ' + token},
                success: function () {
                    activityGroupPageHead.render();
                    activityList.render();
                },
                error: function () {
                    alert ('请求无效，返回用户界面')
                    window.location = "user.html";
                }
            });
        }
    });
    var router = new Router;
    Backbone.history.start ();
});
