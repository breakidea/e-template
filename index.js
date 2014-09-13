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
 * repos:   https://github.com/mycoin/x-templator
 */
;
(function(global, undefined) {

    // exports
    var exports = {};

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
    var REGEXP_MASTER = /\<\!\-\-\s*([\w\-]{1,}\s*:\s*\{.*?\})\s*\-\-\>/m;

    // 拆分配置 footer: {"section":"s-footer"}
    var REGEXP_CONFIG = /([\w\-]{1,})\s*:\s*(\{.*?\})/i;

    /**
     * 获取注释中的配置，并且返回指定范围内代码
     * 形如: <!--name: {"sync":true}-->
     *
     * @param {string} code 模板代码
     * @param {boolean} strip 去除没有用的换行
     * @return {Object} 配置对象
     */
    var parseMaster = function(content, strip) {
        var match = content.split(REGEXP_MASTER);
        var result = {};

        if (match && match[1]) {
            var name, config;
            for (var i = 0, l = match.length; i < l; i++) {
                var item = match[i];
                if (REGEXP_CONFIG.test(item)) {
                    name = RegExp.$1;
                    config = new Function('return ' + RegExp.$2)(); // 不使用 JSON.parse
                } else if (name) {
                    if (strip) {
                        item = item.replace(/\s*\r?\n\s*/g, ''); // 删除换行
                    }
                    config.content = trim(item);
                    config.name = name;
                    result[name] = config;
                    name = config = 0;
                }
            }
        } else if (match[0]) {
            if (strip) {
                match[0] = match[0].replace(/\s*\r?\n\s*/g, ''); // 删除换行
            }
            result.main = {
                name: 'main',
                content: trim(match[0])
            };
        }
        return result;
    };

    var DEFAULT_CONFIG = {
        min: 1,
        variable: 'html',
        strip: 1,
        filter: 'encode'
    };

    // 占位符边界
    var REGEXP_LIMITATION = /\<%(.*?)%\>/g;

    // 关键词语句
    var REGEXP_KEYWORD = /(^\s*(var|void|if|for|else|switch|case|break|{|}|;))(.*)?/g;

    /**
     * remove placeholder, and return javascript source
     * @e.g: change `<%id%>` to `result += global.encode(id);`
     *
     * @param {string} content template' string
     * @param {object} config
     * @param {boolean} config.min, remove empty chars ? default `false`
     * @param {string}  config.variable
     * @param {string}  config.strip remove <!-- xxx -->
     * @param {string}  config.filter default html filter. default `encode`
     * @return {string}
     */
    var convert = function(content, opt) {
        var i = 0; // 游标计数器
        var match;
        var source;

        opt = extend(opt, DEFAULT_CONFIG);

        // push source snippets
        var add = function(line, raw) {
            if (raw) {
                line = line
                    .replace(/\\/g, '\\\\')
                    .replace(/"/g, '\\"')
                    .replace(/\s*\n\s*/g, opt.min ? '' : '\\\n');
                if (line) {
                    source += opt.variable + ' += "' + line + '";\n';
                }
            } else {
                if (line.match(REGEXP_KEYWORD)) {
                    source += line + '\n';
                } else if (line = _filterVars(line, opt.filter)) {
                    source += opt.variable + ' += _.' + line + ';\n';
                }
            }
        };

        // start...
        content = content.replace(/\s*\r?\n\s*/g, '\n');
        source = '';
        if (opt.strip) {
            content = content.replace(/<!--(?:[\s\S]*?)-->/g, '');
        }
        if (opt.min) {
            content = content.replace(/\s*\r?\n\s*/g, '');
        }
        while (match = REGEXP_LIMITATION.exec(content)) { // jshint ignore:line
            add(content.slice(i, match.index), true); // raw
            add(match[1], false); // js
            i = match.index + match[0].length;
        }

        // add last snippets
        add(content.substr(i, content.length - i), true);

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

    /**
     * install template, params into a callable function.
     * @inner
     * @param {string} string filter'string
     * @param {string=} defaul default encoding `encode`
     * @see: https://gist.github.com/mycoin/f20d51986ba5878beb38
     * @return
     */
    var build = function(config, opt, single) {
        var result = {};
        if (!single) {
            for (var k in config) {
                result[k] = build(config[k], opt, true);
            }
            return result;
        }
        if (config && typeof config == 'object') {
            var tpl = config.content;
            extend(config, extend(null, opt), false);
            var src = convert(config.content, config);

            console.log(src);
            return '';

        }
        return result;
    };

    exports.parseMaster = parseMaster;
    exports.build = build;
    exports.convert = convert;
    exports._filterVars = _filterVars;

    if (typeof require == 'function' && typeof exports == 'object' && typeof module == 'object') {
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


    // /**
    //  * compile template to javascript.
    //  *
    //  * @param {string} text template' string
    //  * @param {object} config
    //  * @param {boolean} config.min, remove empty chars ? default `false`
    //  * @param {string}  config.variable
    //  * @param {array=}  config.parameters format parammer' array, otherwise using `with(){...}`
    //  * @param {string=}  config.filter default html filter. default `encode`
    //  * @param {string=}  config.prefix custom source code.
    //  * @param {object=}  config.utilEntry entry for lang.
    //  * @return {object}
    //  */
    // var compile = function(text, opt) {
    //     var prefix = (opt.lang || '') + 'var ' + opt.variable + ' = "";\n';
    //     var tail = 'return ' + opt.variable + ';';
    //     var argv = ['data'];

    //     // 源码
    //     var src = prefix + 'with(data){' + _removeShell(text, opt) + '}' + tail;

    //     // add wrapper
    //     var func = new Function(argv, src); // jshint ignore:line

    //     // return object
    //     return {
    //         /**
    //          * stringify function
    //          * @e.g: stringify('this.renderComdi');
    //          *
    //          * @param {string|function|=} data JSON data
    //          * @return {string}
    //          */
    //         stringify: function(variable) {
    //             var funcSrc = 'function ' + (func + '').substr(18);
    //             var receiver = variable;

    //             if (typeof receiver == 'string') {
    //                 // conversion to `var xxx = `
    //                 return receiver + ' = ' + funcSrc + ';';
    //             } else {
    //                 return funcSrc;
    //             }
    //         }
    //     };
    // };

    // /**
    //  * coonfig achieves
    //  *
    //  * @public
    //  * @param {string} source source code
    //  * @param {string} begin begin flag
    //  * @param {string} end end flag
    //  *
    //  * @return source
    //  */
    // var generate = function(tpl, opt) {
    //     var lang = '';
    //     if (opt.innerLang) {
    //         lang = __dirname + '/lang.js';
    //         lang = 'var _ = {}; \n' + fs.readFileSync(__dirname + '/x-template-lang.js', 'utf-8');
    //     }
    //     opt = extend(opt, {
    //         min: 1,
    //         variable: 'html',
    //         lang: lang,
    //         filter: 'encode'
    //     }, false);
    //     return compile(tpl, opt).stringify(opt.prefix);
    // };

    // exports.parseMaster = parseMaster;
    // exports.convert = convert;

    // // private
    // exports._filterVars = _filterVars;

    // if (typeof require == 'function' && typeof exports == 'object' && typeof module == 'object') {
    //     // [1] CommonJS/Node.js
    //     module.exports = exports;

    // } else if (typeof define == 'function' && define.amd) {
    //     // [2] AMD anonymous module
    //     define(['exports'], function() {
    //         return exports;
    //     });
    // } else {
    //     // [3] browser-side, global
    //     global.xTemplator = global.xTemplator || exports;
    // }
})(this);