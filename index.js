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
    var trim = function(source) {
        if (typeof source == 'string') {
            source = source.replace(/(^\s*|\s*$)/g, '');
        }
        return source;
    };

    // 拆解模板 <!--config: {"sync":true}-->
    var REGEXP_MASTER = /\<\!\-\-\s*([\w]{1,}\s*:\s*\{.*?\})\s*\-\-\>/m;

    // 拆分配置 footer: {"section":"s-footer"}
    var REGEXP_CONFIG = /([\w]{1,})\s*:\s*(\{.*?\})/i;

    /**
     * 获取注释中的配置，并且返回指定范围内代码
     * 形如: <!--config: {"sync":true}-->
     *
     * @param {string} code 模板代码
     * @return {Object} 配置对象
     */
    var parseMaster = function(content) {
        var match = content.split(REGEXP_MASTER);
        var result = {};

        var name, data;
        if (match[1]) {
            match.forEach(function(text) {
                if (REGEXP_CONFIG.test(text)) {
                    name = RegExp.$1;
                    data = new Function('return ' + RegExp.$2)(); // 不使用 JSON.parse
                } else if (name) {
                    data.name || (data.name = name);
                    data.content = trim(text);

                    result[name] = data;
                    name = data = 0;
                }
            });
        } else {
            result.main = {
                name: 'main',
                content: match[0]
            };
        }
        return result;
    };

    /**
     * escape literal string.
     * @e.g: change `<span id="OK">` to `"<span id=\"OK\">"`
     *
     * @param {string} string template'string
     * @param {boolean=} strip strip empty line, enter.
     * @return {string} slashed string
     */
    var _encodeLiteral = function(string, strip) {
        string = string
            .replace(/\\/g, '\\\\')
            .replace(/"/g, '\\"')
            .replace(/\s*\n\s*/g, strip ? '' : '\\\n');

        return string ? '"' + string + '"' : false;
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
     * remove placeholder, and return javascript source
     * @e.g: change `<%id%>` to `result += global.encode(id);`
     *
     * @param {string} text template' string
     * @param {object} config
     * @param {boolean} config.min, remove empty chars ? default `false`
     * @param {string}  config.lang, format param
     * @param {string}  config.variable
     * @param {string}  config.strip remove <!-- xxx -->
     * @param {string}  config.filter default html filter. default `encode`
     * @return {string}
     */
    var _removeShell = function(text, opt) {
        var limitation = /\<%(.*?)%\>/g; // jshint ignore:line
        var keyword = /(^\s*(var|void|if|for|else|switch|case|break|{|}|;))(.*)?/g;
        var i = 0; // 游标计数器
        var match;
        var source;

        // push source snippets
        var add = function(line, raw) {
            if (raw) {
                line = _encodeLiteral(line, opt.min); // minimum HTML
                if (line) {
                    source += opt.variable + ' += ' + line + ';\n';
                }
            } else {
                if (line.match(keyword)) {
                    source += line + '\n';
                } else {
                    line = _filterVars(line, opt.filter);
                    if (line) {
                        source += opt.variable + ' += _.' + line + ';\n';
                    }
                }
            }
        };

        // start...
        text = text.replace(/\s*\r?\n/g, '\n');
        source = '';
        if (opt.strip) {
            text = text.replace(/<!--(?:[\s\S]*?)-->/g, '');
        }
        while (match = limitation.exec(text)) { // jshint ignore:line
            add(text.slice(i, match.index), true); // raw
            add(match[1], false); // js
            i = match.index + match[0].length;
        }

        // add last snippets
        add(text.substr(i, text.length - i), true);
        return source;
    };

    /**
     * compile template to javascript.
     *
     * @param {string} text template' string
     * @param {object} config
     * @param {boolean} config.min, remove empty chars ? default `false`
     * @param {string}  config.variable
     * @param {array=}  config.parameters format parammer' array, otherwise using `with(){...}`
     * @param {string=}  config.filter default html filter. default `encode`
     * @param {string=}  config.prefix custom source code.
     * @param {object=}  config.utilEntry entry for lang.
     * @return {object}
     */
    var compile = function(text, opt) {
        var prefix = (opt.lang || '') + 'var ' + opt.variable + ' = "";\n';
        var tail = 'return ' + opt.variable + ';';
        var argv = ['data'];

        // 源码
        var src = prefix + 'with(data){' + _removeShell(text, opt) + '}' + tail;

        // add wrapper
        var func = new Function(argv, src); // jshint ignore:line

        // return object
        return {
            /**
             * stringify function
             * @e.g: stringify('this.renderComdi');
             *
             * @param {string|function|=} data JSON data
             * @return {string}
             */
            stringify: function(variable) {
                var funcSrc = 'function ' + (func + '').substr(18);
                var receiver = variable;

                if (typeof receiver == 'string') {
                    // conversion to `var xxx = `
                    return receiver + ' = ' + funcSrc + ';';
                } else {
                    return funcSrc;
                }
            }
        };
    };

    /**
     * coonfig achieves
     *
     * @public
     * @param {string} source source code
     * @param {string} begin begin flag
     * @param {string} end end flag
     *
     * @return source
     */
    var generate = function(tpl, opt) {
        var lang = '';
        if (opt.innerLang) {
            lang = __dirname + '/lang.js';
            lang = 'var _ = {}; \n' + fs.readFileSync(__dirname + '/x-template-lang.js', 'utf-8');
        }
        opt = extend(opt || {}, {
            min: 1,
            variable: 'html',
            lang: lang,
            filter: 'encode'
        }, false);
        return compile(tpl, opt).stringify(opt.prefix);
    };

    exports.parseMaster = parseMaster;

    // private
    exports._encodeLiteral = _encodeLiteral;
    exports._filterVars = _filterVars;
    exports._removeShell = _removeShell;

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
})(this);