/**
 * Created by zy-li14 on 16-10-9.
 */
var testProfile = new Profile();
testUser.on('change', function () {
    alert(testUser.get('profile'));
    testProfile.set({url: testUser.get('profile')});
});

var NameCardView = Backbone.View.extend ({
    el: $('#namecard'),
});
var nameCardView = new NameCardView;
