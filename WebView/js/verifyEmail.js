/**
 * Created by zy-li14 on 16-11-16.
 */
var Router = Backbone.Router.extend({
    routes: {
        ":username/:key": "main"
    },
    main: function (username, key) {
        $.ajax({
            type: "GET",
            url: API_ROOT + "/account/auth_email/" + username + "/" + key + "/",
            error: function (response) {
                $("body").html(response.responseText)
            }
        })
    }
});
$(function () {
    var router = new Router;
    Backbone.history.start();
});
