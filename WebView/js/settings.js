/**
 * Created by zy-li14 on 16-10-13.
 */
var PublicProfileView = Backbone.View.extend({
    el: $('#athena-profile-setting'),
    events: {
        'submit #athena-public-profile-form': 'uploadProfile'
    },
    template: _.template($('#tmplt-profile-setting').html()),
    render: function () {
        alert(this.model.get('genders'));
        this.$el.html(this.template({
            "image": this.model.get('icon_image'),
            "username": this.model.get('user').username,
            "realname": this.model.get('real_name'),
            "school": this.model.get('school'),
            "department": this.model.get('department'),
            "gender": this.model.get('genders')
        }));
        return this;
    },
    initialize: function () {
        this.listenTo(this.model, 'change', this.render);
    },
    uploadProfile: function () {

    }

});

var profile = new Profile;
var ProfileView = new PublicProfileView({model: profile});
profile.fetch({
    headers: {'Authorization': 'JWT ' + token},
    success: function (model, response) {
        $('body').css('display', 'block');
        document.title = model.get('user') + '(' + model.get('real_name') + ')';
    }, error: function (model, response) {
        alert('加载错误！' + JSON.stringify(response));
        gobackLogin();
    }
});
