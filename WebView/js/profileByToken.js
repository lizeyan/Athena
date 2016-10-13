/**
 * Created by zy-li14 on 16-10-13.
 */
//验证token是否有效，无效则返回登录界面
function gobackLogin() {
    window.location = 'login.html';
}
var token = Cookies.get('token');
if (!token) {
    // alert ('no token');
    gobackLogin();
}
var TokenValidator = Backbone.Model.extend({
    url: API_ROOT + '/api-token-verify/'
});
tokenValidator = new TokenValidator;
tokenValidator.save({'token': token}, {
    wait: true, error: function () {
        gobackLogin();
    }
});

//正文
var Profile = Backbone.Model.extend({
    idAttribute: 'pk',
    parse: function (response) {
        // alert (JSON.stringify(response));
        if (response.results && Array.isArray(response.results)) {
            if (response.results.length < 1) {
                alert('加载信息错误，返回results长度不为1,即将返回登录界面');
                gobackLogin();
            }
            return response.results[0];
        }
        else if (response.results) {
            return response.results;
        }
        else {
            return response;
        }
    },
    url: API_ROOT + '/profile/?format=json'
});
