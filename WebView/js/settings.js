/**
 * Created by zy-li14 on 16-10-13.
 */

//ErrorBox是显示错误信息的页面
var InfoBox = Backbone.View.extend({
    tagName: 'div',
    template: _.template($('#tmplt-box-info').html()),
    render: function (args) {
        this.$el.html(this.template(args));
        return this;
    }
});
var infoList = $('#athena-info-list');

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
        infoList.empty();
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
            error: function (model, response) {
                infoList.append((new InfoBox).render({
                    type: "danger",
                    text: "上传失败，请尝试重新登录或者刷新页面\n提示:\n" + response.responseText
                }).$el.html());
            },
            success: function () {
                infoList.append((new InfoBox).render({type: "success", text: "上传成功"}).$el.html());
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
var PasswordLib = Backbone.Model.extend({
    url: API_ROOT + "/account/modify_password/"
});
var SecurityView = Backbone.View.extend({
    el: $('#athena-security-setting'),
    events: {
        'submit #athena-password-form': 'uploadPassword'
    },
    validatePassword: function () {
        if ($("#athena-new-password-input").val() != $("#athena-confirm-password-input").val())
            return false;
        else
            return true;
    },
    uploadPassword: function (event) {
        event.preventDefault();
        infoList.empty();
        if (!this.validatePassword()) {
            infoList.append((new InfoBox).render({type: "danger", text: "修改失败\n提示:\n" + "新密码不一致，请确认输入"}).$el.html());
            return;
        }
        (new PasswordLib).save({
            old_password: $("#athena-old-password-input").val(),
            new_password: $("#athena-new-password-input").val()
        }, {
            headers: {'Authorization': 'JWT ' + token},
            error: function (model, response) {
                infoList.append((new InfoBox).render({
                    type: "danger",
                    text: "修改失败\n提示:\n" + response.responseText
                }).$el.html());
            },
            success: function (model, response) {
                token = response.token;
                Cookies.set("token", token);
                window.location.reload();
                infoList.append((new InfoBox).render({type: "success", text: "修改成功"}).$el.html());
            }
        });
    }
});
var EmailLib = Backbone.Model.extend({
    url: API_ROOT + "/account/modify_email/"
});
var EmailValidator = Backbone.Collection.extend({
    url: API_ROOT + "/account/verify_email/"
});
var emailValidator = new EmailValidator;
var EmailView = Backbone.View.extend({
    el: $("#athena-email-setting"),
    template: _.template($("#tmplt-email-setting").html()),
    events: {
        "submit #athena-email-form": "uploadEmail",
        "click #athena-resent-verify-emial-button": "resentVerifyEmail"
    },
    initialize: function () {
        this.listenTo(this.model, "change", this.render);
    },
    render: function () {
        this.$el.html(this.template({email: this.model.get('user').email, email_authorization: this.model.get('email_authorization')}));
        return this;
    },
    resentVerifyEmail: function (event) {
        event.preventDefault();
        emailValidator.create(null, {
            headers: {'Authorization': 'JWT ' + token}
        });
    },
    uploadEmail: function (event) {
        event.preventDefault();
        infoList.empty();
        (new EmailLib).save({
            "email": $("#athena-email-input").val(),
            "password": $("#athena-email-validate-password-input").val()
        }, {
            headers: {'Authorization': 'JWT ' + token},
            error: function (model, response) {
                infoList.append((new InfoBox).render({
                    type: "danger",
                    text: "修改失败\n提示:\n" + response.responseText
                }).$el.html());
            },
            success: function () {
                infoList.append((new InfoBox).render({type: "success", text: "修改成功"}).$el.html());
            }
        });
        $("#athena-confirm-password-modal").modal('toggle');
    }
});

var profileView = new PublicProfileView({model: profile});
var securityView = new SecurityView({model: profile});
var emailView = new EmailView({model: profile});
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
/********************************************
 * face setting
 */
var FaceModel = Backbone.Model.extend({});
var FaceLib = Backbone.Collection.extend({
    url: API_ROOT + "/face/"
});
var faceLib = new FaceLib;
var FaceItemView = Backbone.View.extend({
    tagName: "li",
    template: _.template($("#tmplt-face-item").html()),
    events: {
        'click .athena-face-delete-button': 'deleteFace'
    },
    initialize: function () {
        this.listenTo(this.model, 'change', this.render);
    },
    render: function () {
        this.$el.html(this.template({face_ID: this.model.get('face_ID'), face_image: this.model.get('face_image')}));
        return this;
    },
    deleteFace: function () {
        $.ajax({
            type: "DELETE",
            url: this.model.url,
            headers: {'Authorization': 'JWT ' + token},
            success: function () {
                window.location.reload();
            },
            error: function (msg) {
                infoList.append((new InfoBox).render({
                    type: "danger",
                    text: "删除人脸失败\n提示\n" + msg
                }).$el.html());
            }
        });
    }
});

var FaceSettingView = Backbone.View.extend({
    el: $("#athena-face-setting"),
    initialize: function () {
        this.listenTo(profile, 'change', this.render);
    },
    events: {
        "change #athena-face-input": "uploadFace"
    },
    render: function () {
        var $faceList = $("#athena-face-list");
        $faceList.empty();
        _.each(profile.get('face'), function (faceUrl) {
            var faceModel = new FaceModel;
            faceModel.url = faceUrl;
            faceModel.fetch({
                headers: {'Authorization': 'JWT ' + token},
            });
            $faceList.append((new FaceItemView({model: faceModel})).render().$el);
        }, this);
        return this;
    },
    uploadFace: function (event) {
        var faceFile = event.currentTarget.files[0];
        if (faceFile.size > 1024 * 1024 * 2) {
            infoList.append((new InfoBox).render({
                type: "danger",
                text: "上传人脸失败\n提示\n" + "图片过大"
            }).$el.html());
            return;
        }
        var formData = new FormData;
        formData.append('face_image', faceFile);
        faceLib.create(null, {
            headers: {'Authorization': 'JWT ' + token},
            error: function (model, response) {
                infoList.append((new InfoBox).render({
                    type: "danger",
                    text: "上传人脸失败\n提示\n" + response.responseText
                }).$el.html());
            },
            success: function () {
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
var faceSettingView = new FaceSettingView;

//==========================================================
$(function () {
    var Router = Backbone.Router.extend({
        routes: {
            "profile": "profile",
            "security": "security",
            "email": "email",
            "face": "face",
            "*path": "profile"
        },
        face: function () {
            this.deactivateAll();
            faceSettingView.$el.show();
            $("#athena-face-nav-item").addClass("active");
        },
        profile: function () {
            this.deactivateAll();
            profileView.$el.show();
            $("#athena-profile-nav-item").addClass("active");
        },
        security: function () {
            this.deactivateAll();
            securityView.$el.show();
            $("#athena-security-nav-item").addClass("active");
        },
        email: function () {
            this.deactivateAll();
            emailView.$el.show();
            $("#athena-email-nav-item").addClass("active");
        },
        deactivateAll: function () {
            profileView.$el.hide();
            securityView.$el.hide();
            emailView.$el.hide();
            faceSettingView.$el.hide();
            _.each($("#athena-side-nav-list").children("li"), function (li) {
                $(li).removeClass("active");
            });
        }
    });
    var router = new Router;
    Backbone.history.start();
});
