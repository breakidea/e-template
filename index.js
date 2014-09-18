/*
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * file:    index.js
 * author:  mycoin (nqliujiangtao@gmail.com)
 * date:    2014/09/09
 * repos:   https://github.com/mycoin/e-template
 */
(function(global, undefined) {
    'use strict'; // using strict mode

    // exports
    var exports = {
        version: '1.0.2'
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
    function extend(target, obj, overwrite) {
        if (undefined === overwrite) {
            overwrite = true;
        }
        for (var key in obj || {}) {
            if (obj.hasOwnProperty(key) && (overwrite || !target.hasOwnProperty(key))) {
                target[key] = obj[key];
            }
        }
        return target;
    }

    /**
     *  make config data
     *
     * @public
     * @param {mixin..} target the target object
     * @return target
     */
    function config(key, value) {
        if (key && typeof key == 'object' && undefined === value) {
            for (var k in key) {
                config(k, key[k]);
            }
        } else {
            switch (key) {
                case 'clean':
                case 'strip':
                case 'filter':
                case 'output':
                    CONFIG_DEFAULT[key] = value;
                    break;
                case 'filters':
                    extend(filters, value);
                    break;
                default:
                    throw '[Error] does not support var `' + key + '`.';
            }
        }
    }

    /**
     * Copy properties from the source object to the target object
     *
     * @public
     * @param {mixin..} target the target object
     * @return target
     */
    function mixin() {
        var result = {};
        for (var i = 0; i < arguments.length; i++) {
            var item = arguments[i] || {};
            for (var k in item) {
                result[k] = item[k];
            }
        }
        return result;
    }

    // 占位符边界
    var REGEXP_LIMITATION = /<%(.*?)%>\r?\n*/g;

    // 关键词语句
    var REGEXP_KEYWORD = /(^\s*(var|void|if|for|else|switch|case|break|{|}|;))(.*)?/g;

    // 空白换行
    var REGEXP_BLANK = /\s*\r?\n\s*/g;

    // 只包括换行
    var REGEXP_NEWLINE = /\r?\n/g;

    // HTML注释
    var REGEXP_COMMENT = /<!--(?:[\s\S]*?)-->/g;

    // 拆解模板
    var REGEXP_MASTER = /<!--\s*config\s*:\s*(\{.*?\})\s*-->/m;

    // 默认配置参数
    var CONFIG_DEFAULT = {
        clean: false,
        output: '_out',
        strip: true,
        filter: 'encode',
        errorHandle: false
    };

    /**
     * remove placeholder, and return javascript source
     * @e.g: change `<%id%>` to `result += global.encode(id);`
     *
     * @param {string} content template' string
     * @param {object} config
     * @param {boolean} config.clean, remove empty chars ? default `false`
     * @param {string}  config.output
     * @param {string}  config.strip remove <!-- xxx -->
     * @param {string}  config.filter default html filter. default `encode`
     * @return {string}
     */
    function convert(content, opt) {
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
                    source += opt.output + ' += "' + line + '";';
                }
            } else {
                if (line.match(REGEXP_KEYWORD)) {
                    source += line;
                } else if (line = filterVars(line, '_.', opt.filter)) { // jshint ignore:line
                    source += opt.output + ' += ' + line + ';';
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
    }

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
    function filterVars(string, prefix, encodeType) {
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
    }

    /**
     * install template, config into a callable function.
     * @inner
     * @param {string} tpl the template string
     * @param {object=} defaul default encoding `encode`
     * @see: https://gist.github.com/mycoin/f20d51986ba5878beb38
     * @return
     */
    function compile(tpl, opt) {
        var match;
        if (match = REGEXP_MASTER.test(tpl)) { // jshint ignore:line
            match = new Function('return ' + RegExp[1])(); // jshint ignore:line
            tpl = tpl.replace(RegExp[0], '');
        }
        opt = mixin(CONFIG_DEFAULT, match, opt);

        var head = 'var ' + opt.output + ' = ""; data = (data && typeof data == "object") ? data : {};';
        var body = convert(tpl, opt); // body源码
        var tail = 'return ' + opt.output + ';';

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

        // extend render function
        extend(invoke, {

            /**
             * render data
             * @e.g: render(data, {lang: lang, context: this});
             *
             * @param {object} data JSON data
             * @param {object=} filters object
             * @return {string}
             */
            render: function(data, help) {
                // 返回渲染结果
                help = mixin(filters, help);
                return invoke.call(null, data, help);
            }
        });

        // 编译结果可以直接调用
        return invoke;
    }

    /**
     * render data
     * @e.g: render(data, {lang: lang, context: this});
     *
     * @param {object|string} data JSON data
     * @param {object=}  config.context context
     * @return {object}
     */
    var filters = {

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
            source = this.init(source).replace(/\\/g, '\\\\')
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
                .replace(/\x3C/g, '&lt;')
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
            var chinese = /[^\x00-\xFF]/g;
            var chars = '';
            var strLength = this.init(string).replace(chinese, '**').length;

            for (var i = 0; i < strLength; i++) {
                chars = string.charAt(i).toString();
                length = length + (chars.match(chinese) ? 2 : 1);

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

    exports.config = config;
    exports.compile = compile;

    exports.__filters = filters;
    exports.__convert = convert;
    exports.__filterVars = filterVars;

    /**
     * @public
     *
     * @param source {String} tpl template code
     * @param source {object} data JSON data
     * @return {string} html
     */
    exports.render = function(tpl, data) {
        return compile(tpl).render(data);
    };

    if (typeof require == "function" && typeof module == "object" && typeof module.exports == "object") {
        // [1] CommonJS/Node.js
        module.exports = exports;
    } else if (typeof define == "function" && define.amd) {
        // [2] AMD anonymous module
        define(function() {
            return exports;
        });
    } else {
        // [3] browser-side, global
        global.eTemplate = global.eTemplate || exports;
    }
})(this);