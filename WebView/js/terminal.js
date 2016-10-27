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
            }
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
