/**
 * Created by zy-li14 on 16-10-8.
 */
//定义用户类

var User = Backbone.Model.extend ({
    idAttribute: "pk"
});

var UserList = Backbone.Collection.extend({
   model: User
});

//
var Account = Backbone.Model.extend({
});

var accountSingleton = new Account ();
document.write(accountSingleton.url ());
alert(accountSingleton.fetch({format:'json'}));
alert (accountSingleton.get('users'));
//

