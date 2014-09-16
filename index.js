/*
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * file:    index.js
 * author:  mycoin (nqliujiangtao@gmail.com)
 * date:    2014/09/09
 * repos:   https://github.com/mycoin/x-templator
 */
;
(function(global, undefined) {

    // exports
    var exports = {
        version: '1.0.0'
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
     * strip whitespace from the beginning and end of a string
     *
     * @function
     * @public
     *
     * @param {String} source the target string that will be trimmed.
     * @return {string} the trimed string
     */
    var trim = function(source, replaceAll) {
        if (typeof source == 'string') {
            source = source.replace(/(^\s*|\s*$)/g, '');
        }
        return source +  '';
    };

    // 拆解模板 <!--config: {"sync":true}-->
    // @todo 这个正则在 IE 下有问题
    var REGEXP_MASTER = /<!--\s*([\w\-]{1,}\s*:\s*\{.*?\})\s*-->/m;

    // 拆分配置 footer: {"section":"s-footer"}
    var REGEXP_CONFIG = /([\w\-]{1,})\s*:\s*(\{.*?\})/i;

    /**
     * 获取注释中的配置，并且返回指定范围内代码
     * 形如: <!--name: {"sync":true}-->
     *
     * @param {string} code 模板代码
     * @return {Object} 配置对象
     */
    var _parseTpl = function(content) {
        var match = content.split(REGEXP_MASTER);
        var result = {};

        if (match && match[1]) {
            var name, config;
            for (var i = 0, l = match.length; i < l; i++) {
                var item = match[i];
                if (REGEXP_CONFIG.test(item)) {
                    name = RegExp.$1;

                    // 不使用 JSON.parse 
                    config = new Function('return ' + RegExp.$2)(); // jshint ignore:line
                } else if (name) {
                    config.content = trim(item);
                    config.name = name;
                    result[name] = config;
                    name = config = 0;
                }
            }
        } else if (match[0]) {
            result.main = {
                name: 'main',
                content: trim(match[0])
            };
        }
        alert(match.length)
        return result;
    };

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

    // 各种工具函数 
    // {META.START}
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
    // {META.RND}

    // 默认配置参数
    var CONFIG_DEFAULT = {
        // clean: 0,
        variable: '_out',
        strip: 1,
        filter: 'encode'
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
                } else if (line = _filterVars(line, opt.filter)) { // jshint ignore:line
                    source += opt.variable + ' += _.' + line + ';';
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
     * @param {string=} defaul default encoding `encode`
     * @see: https://gist.github.com/mycoin/f20d51986ba5878beb38
     * @return
     */
    var _filterVars = function(string, defaul) {
        var modifier = /(=|:|-)?([^|]*)\|?([^:]*)([\w\W]*)/;
        var match = modifier.exec(string);
        if (match && match[2]) {
            var caller;
            var param = '(' + match[2] + ')';
            if (caller = match[3]) { // jshint ignore:line
                param = '(' + match[2] + match[4].replace(/:/g, ', ') + ')';
            }
            caller = caller || {
                '=': 'raw',
                '-': 'escapeJs',
                ':': 'encodeURIComponent'
            }[match[1]] || defaul;
            return (caller || 'encode') + param; // 默认转码
        } else {
            return false;
        }
    };

    var _cacheMap = {};


    /**
     * install template, params into a callable function.
     * @inner
     * @param {string} string filter'string
     * @param {string=} defaul default encoding `encode`
     * @see: https://gist.github.com/mycoin/f20d51986ba5878beb38
     * @return
     */
    exports.compileMulti = function(tpl, config) {
        var result = {};
        var item;
        var content;

        tpl = _parseTpl(tpl);

        // 遍历并编译
        for (var k in tpl) {
            item = tpl[k];
            content = item.content;
            item = mixin(config, item); // 模板配置的优先级最低
            if (typeof content == 'string') {
                delete item.content;
                result[k] = this.compile(content, item);
            }
        }
        return {
            // 编译结果
            get: function(section) {
                if (typeof section == 'string') {
                    return result[section] || function() {
                        throw '[typeError] section `' + section + '` not found.';
                    };
                } else {
                    return result;
                }
            },

            /**
             * render data
             *
             * @param {string} section name
             * @param {object} data data JSON formatter
             * @param {object=} util.
             * @return {string}
             */
            render: function(section, data, util) {
                var invoke = this.get(section);

                util = util || {};
                if (!config || config.allowOverride !== false) {
                    extend(util, CONFIG_HELPER, false);
                }

                // 返回渲染结果
                return invoke.call(null, data, util) || '';
            }
        };
    };
    /**
     * install template, config into a callable function.
     * @inner
     * @param {string} tpl the template string
     * @param {object=} defaul default encoding `encode`
     * @see: https://gist.github.com/mycoin/f20d51986ba5878beb38
     * @return
     */
    exports.compile = function(tpl, opt) {
        opt = mixin(CONFIG_DEFAULT, opt);

        var head = 'data = (data && typeof data == "object") ? data : {};' + 'var ' + opt.variable + ' = "";';
        var body = _convert(tpl, opt); // body源码
        var tail = 'return ' + opt.variable + ';';

        if (false !== opt.allowOverride) {
            head += '_ = _ || {};';
            head += 'var extend = function(util){for(var key in util){_[key] = util[key];}};';
            if (typeof opt.helper == 'string') {
                head += opt.helper;
            } else if (opt.helper) {
                throw '[typeError] helper must be a string, like `extend({key: function});`';
            }
        }
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
             * stringify executorFun
             * @e.g: stringify('this.renderComdi');
             *
             * @param {string|function|=} data JSON data
             * @return {string}
             */
            stringify: function(receiver) {
                var code = invoke.toString().substr(18);

                if (receiver && typeof receiver == 'string') {
                    if (~receiver.lastIndexOf('.')) {
                        // this.xxx = function...
                        return receiver + ' = function ' + code + ';';
                    } else {
                        // function xxx() ...
                        return 'function ' + receiver + ' ' + code;
                    }
                } else {
                    return 'function ' + code;
                }
            },
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

    exports._parseTpl = _parseTpl;
    exports._filterVars = _filterVars;
    exports._convert = _convert;

    if (typeof require == 'function' && typeof module == 'object' && typeof module.exports == 'object') {
        // [1] CommonJS/Node.js
        module.exports = exports;

    } else if (typeof define == 'function' && define.amd) {
        // [2] AMD anonymous module
        define(['exports'], function() {
            return exports;
        });
    } else {
        // [3] browser-side, global
        global.xTemplator = global.xTemplator || exports;
    }
})(this);