/**
 * Created by zy-li14 on 16-10-17.
 */
var profile = new Profile;
profile.fetch({
    headers: {'Authorization': 'JWT ' + token},
    success: function (model, response) {
        $('body').css('display', 'block');
        document.title = model.get('user').username + '(' + model.get('real_name') + ')';
    }, error: function (model, response) {
        // alert ('加载错误！' + JSON.stringify(response));
        gobackLogin();
    },
    url: API_ROOT + '/profile/?format=json'
});
profile.on('change:icon_image', function () {
    SetTopNavBar ({img: profile.get('icon_image')});
});
