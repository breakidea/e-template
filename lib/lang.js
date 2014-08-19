/*
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * file:    lib/util.js
 * author:  mycoin (nqliujiangtao@gmail.com)
 * date:    2014/08/15
 * repos:   https://github.com/mycoin/mini-template
 */

// META{BEGIN}
var util = {};

/**
 * escape string.
 *
 * @function
 * @public
 *
 * @param source {String} the target string that will be trimmed.
 * @param type {String} [`html`, `url`, `js`]
 * @return {string} the trimed string
 */
util.escape = function(source, type) {
    if (type == 'html') {
        return this.encode(source);
    } else if (type == 'url') {
        return encodeURIComponent(source);
    } else if (type == 'js') {
        return this.escapeJs(source);
    } else {
        return source;
    }
};

/**
 * strip whitespace from the beginning and end of a string
 *
 * @function
 * @public
 *
 * @param source {String} the target string that will be trimmed.
 * @return {string} the trimed string
 */
util.trim = function(source) {
    source = init(source).replace(/^\s+/, '');
    for (var i = source.length - 1; i >= 0; i--) {
        if (/\S/.test(source.charAt(i))) {
            source = source.substring(0, i + 1);
            break;
        }
    }
    return source;
};


//transmite `undefined`, `null` to "" an enpty string
function init(source) {
    if ('undefined' == typeof source || source === null) {
        source = '';
    }
    // We don't use String(obj) because it could be overriden.
    return '' + source;
}


/**
 * concat string together
 *
 * @function
 * @public
 *
 * @param {String..} the snippets.
 * @return {string} string
 */
util.cat = function() {
    var array = [].slice.call(arguments);
    return array.join('');
};

/**
 * to encode the string as a URI component for URI rules.
 *
 * @function
 * @public
 *
 * @param source {String} the target string.
 * @return {string} the escaped string
 * @see http://stackoverflow.com/questions/75980/best-practice-escape-or-encodeuri-encodeuricomponent
 */
util.encodeURIComponent = function(source) {
    source = init(source);
    if (encodeURIComponent) {
        return encodeURIComponent(source);
    } else {
        return escape(source);
    }
};

/**
 * encoding the target string from HTML
 *
 * @function
 * @public
 *
 * @param source {String} the target string
 * @return {string} safe source
 */
util.encode = function(source) {
    source = init(source).replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    return source;
};

/**
 * return sring, without any operation
 *
 * @function
 * @public
 *
 * @param source {String} the target string
 * @return {string} safe source
 */
util.raw = function(source) {
    return source;
};

/**
 * substring
 *
 * @function
 * @public
 *
 * @param source {String} the target string
 * @return {string} source
 */
util.limitlen = function(str, len, hasDot) {
    var newLength = 0;
    var newStr = '';
    var chineseRegex = /[^\x00-\xff]/g;
    var singleChar = '';
    var strLength = str.replace(chineseRegex, '**').length;
    for (var i = 0; i < strLength; i++) {
        singleChar = str.charAt(i).toString();
        if (singleChar.match(chineseRegex) != null) {
            newLength += 2;
        } else {
            newLength++;
        }
        if (newLength > len) {
            break;
        }
        newStr += singleChar;
    }

    if (hasDot && strLength > len) {
        newStr += hasDot;
    }
    return newStr;
};

// META{END}

if (typeof require == 'function' && typeof module == 'object') {
    // [1] CommonJS/Node.js
    module.exports = util;
} else {
    // [2] browser-side, global
    this.util = util;
}