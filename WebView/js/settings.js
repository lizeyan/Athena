/**
 * Created by zy-li14 on 16-10-13.
 */
var PublicProfileView = Backbone.View.extend({
    el: $('#athena-profile-setting'),
    imgFile: null,
    events: {
        'submit #athena-public-profile-form': 'uploadProfile',
        "change #athena-avatar-input": 'openAvatar'
    },
    template: _.template($('#tmplt-profile-setting').html()),
    render: function () {
        this.$el.html(this.template({
            "image": this.model.get('icon_image'),
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
    openAvatar: function (event) {
        this.imgFile = event.currentTarget.files[0];
        // alert (file);
        var reader = new FileReader();
        reader.onload = function (fileEvent) {
            $('#athena-avatar-img').attr('src', fileEvent.target.result);
        }.bind(this);
        reader.readAsDataURL(this.imgFile);
    },
    uploadProfile: function (event) {
        event.preventDefault();
        var formData = new FormData;
        formData.append('real_name', $('#athena-realname-input').val());
        if (this.imgFile)
            formData.append('icon_image', this.imgFile);
        formData.append('school', $('#athena-school-input').val());
        formData.append('department', $('#athena-department-input').val());
        formData.append('genders', $('#athena-gender-input').val());
        this.model.save(null, {
            headers: {'Authorization': 'JWT ' + token},
            error: function () {
                alert('上传错误');
                window.location.reload();
            },
            data: formData,
            patch: true,
            wait: true,
            emulateJSON: true,
            contentType: false,
            processData: false
        });
    }

});

var ProfileView = new PublicProfileView({model: profile});
profile.fetch({
    headers: {'Authorization': 'JWT ' + token},
    success: function (model, response) {
        $('body').css('display', 'block');
        document.title = model.get('user').username + '(' + model.get('real_name') + ')';

    }, error: function (model, response) {
        alert('加载错误！' + JSON.stringify(response));
        gobackLogin();
    },
    url: API_ROOT + '/profile/?format=json'
});
