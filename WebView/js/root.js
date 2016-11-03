/**
 * Created by zy-li14 on 16-10-27.
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
            if (model.get('is_superuser') == false) {
                alert("你不是管理员");
                gobackLogin();
            }
            else
                $("#athena-terminal-config-entry").css('display', "inline");
        },
        error: function () {
            gobackLogin();
        }
    });
}
CheckSuperUser();


var TerminalModel = Backbone.Model.extend({
    idAttribute: 'pk',
    parse: function (response) {
        this.url = response.url + '?term=true';
        return response;
    }
});
var TerminalCollection = Backbone.Collection.extend({
    model: TerminalModel,
    url: API_ROOT + '/profile/?term=true',
    parse: function (response) {
        return response.results;
    }
});
var terminalLib = new TerminalCollection;

var TerminalItemView = Backbone.View.extend({
    tagName: "li",
    template: _.template($("#tmplt-terminal-item").html()),
    events: {
        "submit .athena-terminal-item-form": "updateTerminal",
        "click .athena-terminal-delete-button": "deleteTerminal"
    },
    initialize: function () {
        this.listenTo(this.model, 'change', this.render);
    },
    render: function () {
        this.$el.html(this.template({pk: this.model.get('pk'), location: this.model.get('term_position')}));
        return this;
    },
    updateTerminal: function (event) {
        event.preventDefault();
        this.model.save({
                term_position: this.$el.find(".athena-terminal-location-input").val()
            },
            {
                headers: {'Authorization': 'JWT ' + token},
                patch: true
            });
    },
    deleteTerminal: function () {
        this.model.destroy({
            success: function () {
                window.location.reload();
            },
            headers: {'Authorization': 'JWT ' + token}
        })
    }
});
var TerminalListView = Backbone.View.extend({
    el: $("#athena-terminal-list-div"),
    initialize: function () {
        this.listenTo(this.collection, 'reset', this.render);
    },
    render: function () {
        this.$el.empty();
        _.each(this.collection.models, function (model) {
            this.$el.append((new TerminalItemView({model: model})).render().$el);
        }, this);
        return this;
    }
});
var terminalListView = new TerminalListView({collection: terminalLib});
terminalLib.fetch({
    headers: {'Authorization': 'JWT ' + token},
    reset: true
});

var NewTerminalInputItemView = Backbone.View.extend({
    tagName: "li",
    template: _.template($("#tmplt-new-terminal-input-item").html()),
    initialize: function () {
        this.showAdd = true;
        this.showSub = false;
    },
    render: function () {
        var name = "", password = "", location = "";
        if (this.$el && this.$el.find('.athena-new-terminal-name-input'))
            name = this.$el.find('.athena-new-terminal-name-input').val();
        if (this.$el && this.$el.find('.athena-new-terminal-password-input'))
            password = this.$el.find('.athena-new-terminal-password-input').val();
        if (this.$el && this.$el.find('.athena-new-terminal-location-input'))
            location = this.$el.find('.athena-new-terminal-location-input').val();
        this.$el.html(this.template({
            showAdd: this.showAdd,
            showSub: this.showSub,
            name: name,
            password: password,
            location: location
        }));
        return this;
    }
});
var CreateTerminalView = Backbone.View.extend({
    el: $("#athena-new-terminal-div"),
    events: {
        "click .athena-terminal-push-input-entry": "addNewEntry",
        "click .athena-terminal-pop-input-entry": "deleteEntry",
        "submit #athena-new-terminal-form": "submit"
    },
    initialize: function () {
        this.entryList = new Array;
        this.$listEl = $("#athena-new-terminal-input-list");
        this.addNewEntry();
    },
    addNewEntry: function () {
        var item = new NewTerminalInputItemView();
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
        this.$listEl.append(item.render().$el);
    },
    deleteEntry: function () {
        var lastEntry = this.entryList[this.entryList.length - 1];
        lastEntry.$el.remove();
        this.entryList.pop();
        lastEntry = this.entryList[this.entryList.length - 1];
        lastEntry.showAdd = true;
        lastEntry.showSub = (this.entryList.length > 1);
        lastEntry.render();
    },
    submit: function (event) {
        event.preventDefault();
        var locations = new Array;
        var names = new Array;
        var passwords = new Array;
        _.each($(".athena-new-terminal-location-input"), function (el) {
            locations.push($(el).val());
        });
        _.each($(".athena-new-terminal-name-input"), function (el) {
            names.push($(el).val());
        });
        _.each($(".athena-new-terminal-password-input"), function (el) {
            passwords.push($(el).val());
        });
        var length = passwords.length;
        for (var i = 0; i < length; ++i) {
            $.ajax({
                headers: {'Authorization': 'JWT ' + token},
                type: "POST",
                url: API_ROOT + "/account/register_term/",
                data: JSON.stringify({
                    username: names[i],
                    password: passwords[i],
                    position: locations[i]
                }),
                contentType: "application/json",
                success: function (msg) {
                    if (i == length)
                        window.location.reload();
                },
                error: function (response) {
                    alert("终端" + i + "添加失败:" + response.responseText);
                }
            });
        }
    }
});
var createNewTerminalView = new CreateTerminalView();

var ActivityGroupCard = Backbone.View.extend({
    tagName: 'div',
    template: _.template($('#tmplt-activity-group').html()),
    events: {
        "click .athena-activity-group-delete-button": "deleteActivityGroup"
    },
    render: function (option) {
        this.option = option;
        this.$el.html(this.template(this.option));
        return this;
    },
    deleteActivityGroup: function () {
        $.ajax({
            headers: {'Authorization': 'JWT ' + token},
            url: this.option.url + "&root=true",
            type: "DELETE",
            success: function () {
                window.location.reload();
            }
        })
    }
});
var ActivityGroupView = Backbone.View.extend({
    el: $('#athena-activity-group-list'),
    initialize: function () {
        this.render();
    },
    render: function () {
        this.$el.empty();
        $.ajax({
            type: "GET",
            headers: {'Authorization': 'JWT ' + token},
            url: API_ROOT + "/activity_group/?root=true&format=json&simple=true",
            success: _.bind(function (response) {
                var list = response.results;
                _.each(list, function (activity_group) {
                    this.$el.append((new ActivityGroupCard).render({
                        'activity_group_name': activity_group.activity_group_name,
                        'url': activity_group.url,
                        'is_classes': activity_group.is_classes
                    }).$el);
                }, this);
            }, this),
            error: function () {
                alert("加载失败");
            }
        });
        return this;
    }
});
var activityGroupView = new ActivityGroupView;
//my router
$(function () {
    var Router = Backbone.Router.extend({
        routes: {
            "terminal": "showTerminal",
            "activity-group": "showActivityGroup"
        },
        showTerminal: function () {
            this.deactivateAll();
            $("#athena-terminal-config").show();
        },
        showActivityGroup: function () {
            this.deactivateAll();
            $("#athena-activity-group-config").show();
        },
        deactivateAll: function () {
            $("#athena-terminal-config").hide();
            $("#athena-activity-group-config").hide();
        }
    });
    var router = new Router;
    Backbone.history.start();
});
