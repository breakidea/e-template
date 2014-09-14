function renderIndex(data, _) {
    data = (data && typeof data == "object") ? data: {};
    _ = _ || {};
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
    };
    var html = "";
    with(data) {
        html += "<title>";
        html += _.encode(title);
        html += "</title><meta name-\"version\" content=\"";
        html += _.encodeURIComponent(name);
        html += "(";
        html += _.encodeURIComponent(version);
        html += ")\"><ul>";
        for (var i = 0; i < repositories.length; i++) {
            var item = repositories[i];
            html += "<li>";
            html += _.limitlen(item.name, 15, "...");
            html += "(";
            html += _.raw(item.star);
            html += ")</li>";
        }
        html += "</ul>";
        if (online) {
            html += "<a href=\"//www.baidu.com/s?wd=";
            html += _.encodeURIComponent(title);
            html += "\" data=url=\"";
            html += _.encode(errorUrl);
            html += "\">点击这里</a>";
        }
    }
    return html;
};
module.exports = renderIndex;