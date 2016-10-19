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
        try {
            var ret;
            if (response.results && Array.isArray(response.results)) {
                ret = response.results[0];
            }
            else if (response.results) {
                ret = response.results;
            }
            else {
                ret = response;
            }
            this.url = ret['url'];
            return ret;
        }
        catch (e) {
            return null;
        }
    }
});

function SetTopNavBar (option)
{
    if (option && option.img)
    {
        $('#athena-top-nav-avatar').attr('src', option.img);
    }
}

function Logout ()
{
    Cookies.remove('token');
    gobackLogin();
}
