function renderIndex(data, _) {
    data = (data && typeof data == "object") ? data: {};
    var html = "";
    _ = _ || {};
    var extend = function(util) {
        for (var key in util) {
            _[key] = util[key];
        }
    };
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
            html += _.truncate(item.name, 15, "...");
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