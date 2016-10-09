/**
 * Created by zy-li14 on 16-10-9.
 */
testUser.on('change', function () {
    testProfile.fetch({url:testUser.profile});
    alert (testUser.profile);
});

var NameCardView = Backbone.View.extend ({
    el: $('#namecard'),
});
var nameCardView = new NameCardView;
