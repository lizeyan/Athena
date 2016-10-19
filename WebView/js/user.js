/**
 * Created by zy-li14 on 16-10-9.
 */
//现在得到了一个profile，需要渲染界面
//左侧的名片和邮件的显示
var NameCard = Backbone.View.extend ({
    el: $('#namecard'),
    initialize: function () {
        this.listenTo(this.model, 'change', this.render);
    },
    template: _.template($('#tmplt-namecard').html()),
    render: function () {
        // alert (this.model.get('url'));
        this.$el.html (this.template ({
            'image': this.model.get('icon_image'),
            'realname': this.model.get ('real_name'),
            'username': this.model.get('user').username
        }));
        return this;
    }
});
var Email = Backbone.View.extend ({
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
var ActivityGroupCard = Backbone.View.extend ({
    tagName: 'div',
    template: _.template($('#tmplt-activity-group').html()),
    render: function (option) {
        this.$el.html(this.template(option));
        return this;
    }
});
var AdminActivityGroupList = Backbone.View.extend ({
    el: $('#athene-admin-activity-group-list'),
    initialize: function () {
        this.listenTo(this.model, 'change:admin_activity_group', this.render);
    },
    render: function () {
        this.$el.empty();
        _.each(this.model.get('admin_activity_group'), function (activity_group) {
            this.$el.append((new ActivityGroupCard).render({'activity_group_name': activity_group.activity_group_name, 'url': activity_group.url}).$el);
        }, this);
        return this;
    }
});
var NormalActivityGroupList = Backbone.View.extend ({
    el: $('#athene-normal-activity-group-list'),
    initialize: function () {
        this.listenTo(this.model, 'change:normal_activity_group', this.render);
    },
    render: function () {
        this.$el.empty();
        _.each(this.model.get('normal_activity_group'), function (activity_group) {
            this.$el.append((new ActivityGroupCard).render({'activity_group_name': activity_group.activity_group_name, 'url': activity_group.url}).$el);
        }, this);
        return this;
    }
});
//定义完了View和Model，正常顺序处理
var namecard = new NameCard ({model: profile});
var email = new Email ({model: profile});
var adminActivityGroupList = new AdminActivityGroupList ({model: profile});
var normalActivityGroupList = new NormalActivityGroupList ({model: profile});

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
            adminActivityGroupList.$el.hide();
            normalActivityGroupList.$el.hide();
        }
    });
    var router = new Router;
    Backbone.history.start();
});
