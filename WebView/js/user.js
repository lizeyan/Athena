/**
 * Created by zy-li14 on 16-10-9.
 */
//验证token是否有效，无效则返回登录界面
function gobackLogin() {
    window.location = 'login.html';
}
var token = Cookies.get('token');
if (!token)
    gobackLogin();
var TokenValidator = Backbone.Model.extend({
    url: API_ROOT + '/api-token-verify/'
});
tokenValidator = new TokenValidator;
tokenValidator.save({'token': token}, {
    wait: true, error: function () {
        gobackLogin();
    }, success: function () {
        $('body').css('display', 'block');
    }
});

//正文
