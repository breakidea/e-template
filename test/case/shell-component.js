function renderIndex(data, _) {
    data = (data && typeof data == "object") ? data: {};
    _ = _ || {};
    /*外部提供*/
    var title = data["title"];
    var name = data["name"];
    var online = data["online"];
    var errorUrl = data["errorUrl"];
    var repositories = data["repositories"];
    var version = data["version"];
    var html = "";
    html += "<title>";
    html += _.encode(title);
    html += "</title>\n<meta name-\"version\" content=\"";
    html += _.encodeURIComponent(name);
    html += "(";
    html += _.encodeURIComponent(version);
    html += ")\">\n<ul>\n    ";
    for (var i = 0; i < repositories.length; i++) {
        var item = repositories[i];
        html += "<li>";
        html += _.limitlen(item.name, 15, "...");
        html += "(";
        html += _.raw(item.star);
        html += ")</li>\n    ";
    }
    html += "</ul>\n";
    if (online) {
        html += "<a href=\"//www.baidu.com/s?wd=";
        html += _.encodeURIComponent(title);
        html += "\" data=url=\"";
        html += _.encode(errorUrl);
        html += "\">点击这里</a>\n";
    }
    return html;
};
module.exports = renderIndex;