/*
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * file:    index.js
 * author:  mycoin (nqliujiangtao@gmail.com)
 * date:    2014/09/09
 * repos:   https://github.com/mycoin/x-templator
 */
(function(global, undefined) {

    // exports
    var exports = {
        version: '0.0.1',
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
        return source;
    };

    // 拆解模板 <!--config: {"sync":true}-->
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
        return result;
    };

    var CONFIG_DEFAULT = {
        clean: 0,
        helper: '_.raw=function(a){return a;};_.encode=function(a){return(a+"").replace(/&/g,"&amp;").replace(/\x3C/g,"&lt;").replace(/\x3E/g,"&gt;").replace(/"/g,"&quot;").replace(/\'/g,"&#39;")};',
        variable: 'html',
        strip: true,
        filter: 'encode'
    };

    // 占位符边界
    var REGEXP_LIMITATION = /<%(.*?)%>\s*/g;

    // 关键词语句
    var REGEXP_KEYWORD = /(^\s*(var|void|if|for|else|switch|case|break|{|}|;))(.*)?/g;

    // 空白换行
    var REGEXP_BLANK = /\s*\r?\n\s*/g;

    // 只包括换行
    var REGEXP_NEWLINE = /\r?\n/g;

    // comment
    var REGEXP_COMMENT = /<!--(?:[\s\S]*?)-->/g;

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

        opt = extend(opt, CONFIG_DEFAULT, false);

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
    var compileMulti = function(tpl, config) {
        var result = {};
        var item;
        var content;

        tpl = _parseTpl(tpl);

        // 遍历并编译
        for (var k in tpl) {
            item = tpl[k];
            content = item.content;

            extend(item, config, false); // 模板配置的优先级最低
            if (typeof content == 'string') {
                delete item.content;
                result[k] = compile(content, item);
            }
        }
        return {
            // 编译结果
            get: function(section) {
                if (!section) {
                    return result;
                }
                return result[section] || function() {
                    throw '[typeError] section `' + section + '` not found.';
                };
            },

            /**
             * render data
             *
             * @param {string} section name
             * @param {object} data data JSON formatter
             * @param {object=}  helper.
             * @return {string}
             */
            render: function(section, data, language) {
                var invoke = this.get(section);

                // 返回渲染结果
                if (typeof invoke == 'function') {
                    language = language || {};
                    if (config.helper && typeof config.helper == 'object') {
                        extend(language, config.helper, false);
                    }
                    return invoke.call(null, data, language) || '';
                }
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
    var compile = function(tpl, opt) {
        opt = extend(opt, CONFIG_DEFAULT, false);

        var body = _convert(tpl, opt); // body源码
        var head = 'data = (data && typeof data == "object") ? data : {}; _ = _ || {};';
        var tail = 'return ' + opt.variable + ';';

        var invoke; //执行函数

        head += (typeof opt.helper == 'string' ? opt.helper : '/*外部提供*/');
        if (opt.apply) {
            // 已知参数，直接申明在上下文环境
            for (var i = 0; i < opt.apply.length; i++) {
                head += 'var ' + opt.apply[i] + ' = data["' + opt.apply[i] + '"];';
            }
        } else {
            body = 'with(data){' + body + '}';
        }
        body = 'var ' + opt.variable + ' = "";' + body;
        body = head + body + tail;

        //创建函数
        invoke = new Function(['data', '_'], body); // jshint ignore:line

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
            render: function(data, language) {
                language = language || {};
                if (opt.helper && typeof opt.helper == 'object') {
                    extend(language, opt.helper, false);
                }
                // 返回渲染结果
                return invoke.call(null, data, language) || '';
            }
        });
        return invoke;
    };

    exports.config = CONFIG_DEFAULT;
    exports.compile = compile;
    exports.compileMulti = compileMulti;

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