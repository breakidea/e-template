var template = {
    x - template: function(data, _) {
        data = data || {};
        _ = _ || {};
        _.extend = function(o) {
            for (var k in o || {}) this[k] = o[k];
        };
        _.extend(this.$);
        var s = "";
        with(data) {
            if (list.length) {
                s += _.limitlen(title, 20, "...");
                for (var i = 0; i < list.length; i++) {
                    var item = list[i];
                    s += "<li class=\"cl-item moz-clear\" data-click=\"{rsv_click_mid:'";
                    s += _.encode(item.mid);
                    s += "',rsv_click_index: ";
                    s += _.encode(i);
                    s += "}\"><span class=\"ul-misc-slo-promotion moz-dummy\">";
                    s += _.escape(item.promotion, 'none');
                    s += "</span></li>";
                }
            } else {
                s += "<li class=\"cl-more\"><a>查看全部特卖>></a></li>";
            }
        }
        return s;
    }
};
template.$ = (function() {
    var _ = {};
    _.raw = function(a) {
        return a;
    };
    _.encode = function(a) {
        return (a + "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;")
    };;
    return _;
})();