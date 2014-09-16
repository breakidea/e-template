// 开始代码，中间的有用其他的删除
var CONFIG_HELPER = {
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
    escape: function(source, type) {
        if (type == 'html') {
            return this.encode(source);
        } else if (type == 'url') {
            return this.encodeURIComponent(source);
        } else if (type == 'js') {
            return this.escapeJs(source);
        } else {
            return source;
        }
    },

    /**
     * 在普通JS环境需要将影响JS语法环境的字符串转义
     *
     * see: https://github.com/mycoin/moni-j/blob/master/system/src/com/moni/j/common/util/StringUtil.java
     * @public
     * @param {String} target 原始字符串
     * @return string
     */
    escapeJs: function(source) {
        source = this.init(source)
            .replace(/\\/g, '\\\\')
            .replace(/\r?\n/g, '\\n')
            .replace(/'/g, '\\\'')
            .replace(/"/g, '\\\"');
        return source;
    },

    /**
     * strip whitespace from the beginning and end of a string
     *
     * @function
     * @public
     *
     * @param source {String} the target string that will be trimmed.
     * @return {string} the trimed string
     */
    trim: function(source) {
        return this.init(source).replace(/^\s*|\s*$/g, '');
    },

    //transmite `undefined`, `null` to "" an enpty string
    init: function(source) {
        if ('undefined' == typeof source || source === null) {
            source = '';
        }
        // We don't use String(obj) because it could be overriden.
        return '' + source;
    },

    /**
     * concat string together
     *
     * @function
     * @public
     *
     * @param {String..} the snippets.
     * @return {string} string
     */
    cat: function() {
        var array = [].slice.call(arguments);
        return array.join('');
    },

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
    encodeURIComponent: function(source) {
        source = this.init(source);
        if (encodeURIComponent) {
            return encodeURIComponent(source);
        } else {
            return escape(source);
        }
    },

    /**
     * encoding the target string from HTML
     *
     * @function
     * @public
     *
     * @param source {String} the target string
     * @return {string} safe source
     */
    encode: function(source) {
        source = this.init(source).replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/\x3E/g, '&gt;')
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
        return source;
    },

    /**
     * return sring, without any operation
     *
     * @function
     * @public
     *
     * @param source {String} the target string
     * @return {string} safe source
     */
    raw: function(source) {
        return source;
    },

    /**
     * truncate
     *
     * @function
     * @public
     *
     * @param source {String} the target string
     * @return {string} source
     */
    truncate: function(string, maxLength, etc) {
        var length = 0;
        var result = '';
        var chinese = /[^\x00-\xff]/g;
        var chars = '';
        var strLength = this.init(string).replace(chinese, '**').length;
        for (var i = 0; i < strLength; i++) {
            chars = string.charAt(i).toString();
            if (chars.match(chinese) !== null) {
                length += 2;
            } else {
                length++;
            }
            if (length > maxLength) {
                break;
            }
            result += chars;
        }
        if (etc && strLength > maxLength) {
            result += etc;
        }
        return result;
    }
};
// 只是给 Node 方便调用可以忽略哦！
try {
    module.exports = CONFIG_HELPER;
} catch (ex) {}