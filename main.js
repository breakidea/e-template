/*
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the 'Software'), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, restore, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * file:    Yet another template engine in Javascript.
 * author:  mycoin (nqliujiangtao@gmail.com)
 * date:    2013/09/28
 * repos:   https://github.com/mycoin/mini-template
 */
(function(global, factory) {
    if (typeof require == 'function' && typeof exports == 'object' && typeof module == 'object') {
        // [1] CommonJS/Node.js
        factory(module.exports || exports);

    } else if (typeof define == 'function' && define.amd) {
        // [2] AMD anonymous module
        define(['exports'], factory);
    } else {
        // [3] browser-side, global
        factory(global.template = global.template || {});
    }
}(this, function(exports) {
    // using strict mode
    'use strict';

    // 占位符边界
    var REGEXP_LIMITATION = /<%(.*?)%>\s*/g;

    // 关键词语句
    var REGEXP_KEYWORD = /(^\s*(var|void|if|for|else|switch|case|break|{|}|;))(.*)?/g;

    // 空白换行
    var REGEXP_BLANK = /\s*\r?\n\s*/g;

    // 只包括换行
    var REGEXP_NEWLINE = /\r?\n/g;

    // HTML注释
    var REGEXP_COMMENT = /<!--(?:[\s\S]*?)-->/g;

    // 默认配置参数
    var CONFIG_DEFAULT = {
        clean: 0,
        variable: '_out',
        strip: 1,
        filter: 'encode'
    };

    /**
     * Copy properties from the source object to the target object
     *
     * @public
     * @param {Object} target the target object
     * @param {Object} obj the source object
     * @param {Boolean} overwrite if overwrite the same property, default 'true'
     * @return target
     */
    var extend = function(target, obj, overwrite) {
        if (undefined === overwrite) {
            overwrite = true;
        }
        target = target || {};
        for (var key in obj || {}) {
            if (obj.hasOwnProperty(key) && (overwrite || !target.hasOwnProperty(key))) {
                target[key] = obj[key];
            }
        }
        return target;
    };


    /**
     * Copy properties from the source object to the target object
     *
     * @public
     * @param {mixin..} target the target object
     * @return target
     */
    var mixin = function() {
        var result = {};
        for (var i = 0; i < arguments.length; i++) {
            var item = arguments[i] || {};
            for (var k in item) {
                result[k] = item[k];
            }
        }
        return result;
    };
    /**
     * remove placeholder, and return javascript source
     * @e.g: change `<%id%>` to `result += global.encode(id);`
     *
     * @param {string} content template' string
     * @param {object} config
     * @param {boolean} config.clean, remove empty chars ? default `false`
     * @param {string}  config.variable
     * @param {string}  config.strip remove <!-- xxx -->
     * @param {string}  config.filter default html filter. default `encode`
     * @return {string}
     */
    var _convert = function(content, opt) {
        var offset = 0; // 游标计数器
        var match;
        var source = '';
        opt = mixin(CONFIG_DEFAULT, opt);

        // start...
        content = opt.strip ? content.replace(REGEXP_COMMENT, '') : content;
        content = opt.clean ? content.replace(REGEXP_BLANK, '') : content;

        // push source snippets
        var add = function(raw, line) {
            if (raw) {
                line = line
                    .replace(/\\/g, '\\\\')
                    .replace(/"/g, '\\"')
                    .replace(REGEXP_NEWLINE, opt.clean ? '' : '\\n');
                if (line) {
                    source += opt.variable + ' += "' + line + '";';
                }
            } else {
                if (line.match(REGEXP_KEYWORD)) {
                    source += line;
                } else if (line = filterVars(line, '_.', opt.filter)) { // jshint ignore:line
                    source += opt.variable + ' += ' + line + ';';
                }
            }
        };
        while (match = REGEXP_LIMITATION.exec(content)) { // jshint ignore:line
            add(1, content.slice(offset, match.index)); // raw
            add(0, match[1]); // js
            offset = match.index + match[0].length;
        }

        // add last snippets
        add(1, content.substr(offset, content.length - offset));

        // only soure
        return source;
    };

    /**
     * change modifier
     * @e.g:
     * <%userName%> //`encode(userName)`
     * <%=info.userName%> //raw(info.userName)
     * <%info.userName|escape:"html"%> //escape(info.userName, "html")
     * @inner
     * @param {string} string filter'string
     * @param {string=} encodeType default encoding `encode`
     * @see: https://gist.github.com/mycoin/f20d51986ba5878beb38
     * @return
     */
    var filterVars = function(string, prefix, encodeType) {
        var modifier = /(=|:|-)?([^|]*)\|?([^:]*)([\w\W]*)/;
        var match = modifier.exec(string);

        if (match && match[2]) {
            var param = '(' + match[2] + ')';
            var filter;
            if (filter = match[3]) { // jshint ignore:line
                param = '(' + match[2] + match[4].replace(/:/g, ', ') + ')';
            }
            filter = filter ? '(' + prefix + filter + param + ')' : param;
            var encoding = {
                '=': 'raw',
                '-': 'escapeJs',
                ':': 'encodeURIComponent'
            }[match[1]] || encodeType;

            // 默认转码
            return prefix + encoding + filter;
        } else {
            return false;
        }
    };

    /**
     * install template, config into a callable function.
     * @inner
     * @param {string} tpl the template string
     * @param {object=} defaul default encoding `encode`
     * @see: https://gist.github.com/mycoin/f20d51986ba5878beb38
     * @return
     */
    var compile = function(tpl, opt) {
        opt = mixin(CONFIG_DEFAULT, opt);

        var head = 'data = (data && typeof data == "object") ? data : {};' + 'var ' + opt.variable + ' = "";';
        var body = _convert(tpl, opt); // body源码
        var tail = 'return ' + opt.variable + ';';

        if (opt.apply) {
            // 已知参数，直接申明在环境
            for (var i = 0; i < opt.apply.length; i++) {
                head += 'var ' + opt.apply[i] + ' = data["' + opt.apply[i] + '"];';
            }
        } else {
            body = 'with(data){' + body + '}';
        }

        //创建函数
        var invoke = new Function(['data', '_'], head + body + tail); // jshint ignore:line

        // extend render function.
        extend(invoke, {

            /**
             * render data
             * @e.g: render(data, {lang: lang, context: this});
             *
             * @param {object} data JSON data
             * @param {object=} config.min, remove empty chars ? default `false`
             * @param {string=}  config.lang lang name
             * @param {object=}  config.context context
             * @return {string}
             */
            render: function(data, util) {
                // 返回渲染结果
                util = util || {};
                if (opt.allowOverride !== false) {
                    extend(util, CONFIG_HELPER, false);
                }
                return invoke.call(null, data, util);
            }
        });
        return invoke;
    };

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
    exports.version = '1.0.0';
    exports.compile = compile;
    // exports.render = render;

    return exports;
}));