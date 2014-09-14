// 这个文件仅作为文本
exports.escape = function(source, type) {
    if (type == "html") {
        return this.encode(source)
    } else if (type == "url") {
        return encodeURIComponent(source)
    } else if (type == "js") {
        return this.escapeJs(source)
    } else {
        return source
    }
};
exports.escapeJs = function() {
    alert("TODO")
};
exports.trim = function(source) {
    source = exports.init(source).replace(/^\s+/, "");
    for (var i = source.length - 1; i >= 0; i--) {
        if (/\S/.test(source.charAt(i))) {
            source = source.substring(0, i + 1);
            break
        }
    }
    return source
};
exports.init = function(source) {
    if ("undefined" == typeof source || source === null) {
        source = ""
    }
    return "" + source
};
exports.cat = function() {
    var array = [].slice.call(arguments);
    return array.join("")
};
exports.encodeURIComponent = function(source) {
    source = exports.init(source);
    if (encodeURIComponent) {
        return encodeURIComponent(source)
    } else {
        return escape(source)
    }
};
exports.encode = function(source) {
    source = exports.init(source).replace(/&/g, "&amp;").replace(/\x3C/g, "&lt;").replace(/\x3E/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    return source
};
exports.raw = function(source) {
    return source
};
exports.limitlen = function(str, len, hasDot) {
    var newLength = 0;
    var newStr = "";
    var chineseRegex = /[^\x00-\xff]/g;
    var singleChar = "";
    var strLength = str.replace(chineseRegex, "**").length;
    for (var i = 0; i < strLength; i++) {
        singleChar = str.charAt(i).toString();
        if (singleChar.match(chineseRegex) != null) {
            newLength += 2
        } else {
            newLength++
        } if (newLength > len) {
            break
        }
        newStr += singleChar
    }
    if (hasDot && strLength > len) {
        newStr += hasDot
    }
    return newStr
};