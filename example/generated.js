(function(){
var exports = window.cache = {};
exports.index = function (data,_) {
data = (data && typeof data == "object") ? data : {};var v = "";_ = _ || {};var extend = function(util){for(var key in util){_[key] = util[key];}};with(data){v += "\n<title>";v += _.encode(title);v += "</title>\n<meta name-\"version\" content=\"";v += _.encodeURIComponent(name);v += "(";v += _.encodeURIComponent(version);v += ")\">\n<ul>\n    ";for(var i = 0; i < repositories.length; i++){var item = repositories[i];v += "<li>";v += _.truncate(item.name, 15, "...");v += "(";v += _.raw(item.star);v += ")</li>\n    ";}v += "</ul>\n";if(online){v += "<a href=\"//www.baidu.com/s?wd=";v += _.encodeURIComponent(title);v += "\">点击这里</a>\n";}}return v;
};
return exports;
})();