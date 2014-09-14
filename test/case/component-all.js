var templ = {
    header: function(data, _) {
        data = data || {};
        _ = _ || {};
        _.extend = function(o) {
            for (var k in o) {
                this[k] = o[k];
            }
        };
        _.extend(this._);
        var html = "";
        with(data) {
            html += "<nav class=\"nav\"></nav>";
        }
        return html;
    },
    title: function(data, _) {
        data = data || {};
        _ = _ || {};
        _.extend = function(o) {
            for (var k in o) {
                this[k] = o[k];
            }
        };
        _.extend(this._);
        var html = "";
        with(data) {
            html += "这里是标题";
        }
        return html;
    },
    footer: function(data, _) {
        data = data || {};
        _ = _ || {};
        _.extend = function(o) {
            for (var k in o) {
                this[k] = o[k];
            }
        };
        _.extend(this._);
        var html = "";
        with(data) {
            html += "<footer>copyright</footer>";
        }
        return html;
    },
    list: function(data, _) {
        data = data || {};
        _ = _ || {};
        _.extend = function(o) {
            for (var k in o) {
                this[k] = o[k];
            }
        };
        _.extend(this._);
        var html = "";
        with(data) {
            html += "<meta name=\"http\" />";
            for (var i = 0; i < list.length; i++) {
                var item = list[i];
                html += "<a href=\"\">";
                html += _.raw(item.title);
                html += "</a>";
            }
        }
        return html;
    }
};
templ._ = templ._ || (function() {
    var _ = {};
    _.escape = function(b, a) {
        if (a == "html") {
            return this.encode(b)
        } else {
            if (a == "url") {
                return encodeURIComponent(b)
            } else {
                if (a == "js") {
                    return this.escapeJs(b)
                } else {
                    return b
                }
            }
        }
    };
    _.escapeJs = function() {
        alert("TODO")
    };
    _.trim = function(b) {
        b = _.init(b).replace(/^\s+/, "");
        for (var a = b.length - 1; a >= 0; a--) {
            if (/\S/.test(b.charAt(a))) {
                b = b.substring(0, a + 1);
                break
            }
        }
        return b
    };
    _.init = function(a) {
        if ("undefined" == typeof a || a === null) {
            a = ""
        }
        return "" + a
    };
    _.cat = function() {
        var a = [].slice.call(arguments);
        return a.join("")
    };
    _.encodeURIComponent = function(a) {
        a = _.init(a);
        if (encodeURIComponent) {
            return encodeURIComponent(a)
        } else {
            return escape(a)
        }
    };
    _.encode = function(a) {
        a = _.init(a).replace(/&/g, "&amp;").replace(/\x3C/g, "&lt;").replace(/\x3E/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
        return a
    };
    _.raw = function(a) {
        return a
    };
    _.limitlen = function(h, d, f) {
        var b = 0;
        var g = "";
        var j = /[^\x00-\xff]/g;
        var e = "";
        var a = h.replace(j, "**").length;
        for (var c = 0; c < a; c++) {
            e = h.charAt(c).toString();
            if (e.match(j) != null) {
                b += 2
            } else {
                b++
            }
            if (b > d) {
                break
            }
            g += e
        }
        if (f && a > d) {
            g += f
        }
        return g
    };;
    return _;
})();