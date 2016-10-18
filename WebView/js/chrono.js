/**
 * Created by zy-li14 on 16-10-18.
 */
var Duration = Backbone.Model.extend({
    millseconds: 0,
    constructor: function (ms) {
        this.millseconds = ms;
    },
    toString: function () {
        var ret = "";
        var s = this.millseconds / 1000;
        var hours = Math.floor(s / 3600);
        if (hours > 0)
            ret += (hours + "小时");
        s %= 3600;
        var minutes = Math.floor(s / 60);
        if (minutes > 0)
            ret += (minutes + "分钟");
        s %= 60;
        if (s > 0)
            ret += (s + "秒");
        return ret;
    }
});