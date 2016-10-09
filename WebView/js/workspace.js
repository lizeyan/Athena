/**
 * Created by zy-li14 on 16-10-8.
 */
//定义根地址
var API_ROOT = "//api.lvxin14.com";
var FormatJsonOption = {data: $.param({format: 'json'})};
//定义用户类，用户信息类

var Profile = Backbone.Model.extend({
    idAttribute: 'pk'
});
var ProfileList = Backbone.Collection.extend({
    model: Profile,
    parse: function (response) {
        return response.results;
    }
});

var User = Backbone.Model.extend({
    idAttribute: 'pk',
});
var UserList = Backbone.Collection.extend({
    model: User,
    parse: function (response) {
        return response.results;
    }
});


//从accout更新用户和用户信息的url地址。
var Account = Backbone.Model.extend({
    url: API_ROOT + '/account',
    initialize: function () {
        this.fetch(FormatJsonOption);
    }
});
var account = new Account();
var userList = new UserList();
//获得一个用户用来调试用户界面
var testUser = new User();
userList.listenTo(account, 'change:users', function () {
    this.url = account.get('users');
    this.fetch({
        success: function () {
            testUser.set(userList.get('1'));
        }
    });
});
//
