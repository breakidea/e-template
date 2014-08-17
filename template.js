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
     * portal entry for template engine
     *
     * @function
     * @public
     *
     * @param {String} source the target string that will be trimmed.
     * @param {object=} data data JSON value
     * @return {string} the trimed string
     */
    function template(source, data) {
        // read function from cache
        var exec = compile(source);
        return exec.apply(data);
    }

    /**
     * strip whitespace from the beginning and end of a string
     *
     * @function
     * @public
     *
     * @param {String} source the target string that will be trimmed.
     * @return {string} the trimed string
     */
    function trim(source) {
        return source.replace(/(^\s*)|(\s*$)/g, '');
    }

    /**
     * escape literal string.
     * @e.g: change `<span id="OK">` to `"<span id=\"OK\">"`
     *
     * @param {string} string template'string
     * @param {boolean=} strip strip empty line, enter.
     * @return {string} slashed string
     */
    function encodeLiteral(string, strip) {
        string = string.replace(/((\/\*[\s\S]*?\*\/)|(\/\/.*$))/gm, '')
            .replace(/\s*\n\s*/g, strip ? '' : '\\\n')
            .replace(/"/g, '\\"');

        return string ? '"' + string + '"' : false;
    }

    /**
     * change modifier
     * @e.g:
     * <%userName%> //`encode(userName)`
     * <%=info.userName%> //raw(info.userName)
     * <%info.userName|escape:"html"%> //escape(info.userName, "html")
     * @inner
     * @param {string} string filter'string
     * @see: https://gist.github.com/mycoin/f20d51986ba5878beb38
     * @return
     */
    function filterVars(string, defaultFilter) {
        var modifier = /(=|:|-)?([^|]*)\|?([^:]*)([\w\W]*)/;
        var match = modifier.exec(string);
        if (match && match[2]) {
            var caller;
            var param = '(' + match[2] + ')';
            if (caller = match[3]) {
                console.log(match)
                param = '(' + match[2] + match[4].replace(/:/g, ', ') + ')';
            }
            caller = caller || {
                '=': 'raw',
                '-': 'escapeJs',
                ':': 'encodeURIComponent'
            }[match[1]] || defaultFilter;
            return caller + param;
        } else {
            return false;
        }
    }

    /**
     * remove placeholder, and return javascript source
     * @e.g: change `<%id%>` to `result += global.encode(id);`
     *
     * @param {string} text template' string
     * @param {object} config
     * @param {boolean} config.strip, default `false`
     * @param {string}  config.literalName, default `result`
     * @param {string}  config.defaultFilter
     * @return {string}
     */
    function removeShell(text, opt) {
        var limitation = /\<%(.*?)%\>/g;
        var keyword = /(^\s*(var|if|for|else|switch|case|break|{|}|;))(.*)?/g;
        var i = 0; // 游标
        var match = null;
        var source;

        // push source snippets
        var add = function(line, raw) {
            if (raw) {
                line = encodeLiteral(line, opt.strip);
                if (line) {
                    source += 'result += ' + line + ';\n';
                }
            } else {
                if (line.match(keyword)) {
                    source += line + '\n';
                } else {
                    line = filterVars(line, opt.defaultFilter);
                    if (line) {
                        source += 'result += ' + 'util.' + line + ';\n';
                    }
                }
            }
        };

        text = text.replace(/\s*\r?\n/g, '\n');
        source = 'var result = "";\nwith(data){\n';

        while (match = limitation.exec(text)) {
            add(text.slice(i, match.index), true); // raw
            add(match[1], false); // js
            i = match.index + match[0].length;
        }

        // add last snippets
        add(text.substr(i, text.length - i), true);
        source += '};\nreturn result;';
        return source;
    }

    /**
     * compile tempalte to single function.
     *
     * @param {string} string template string
     * @param {array} formal arguments' name
     * @param {object} opt
     * @return {function}
     */
    function compile(string, extract, opt) {
        var source;
        var config = {
            defaultFilter: 'encode',
            strip: true
        };

        opt = extend(opt || {}, config, false);
        source = removeShell(string, opt);

        // create function
        if (extract.length < 1) {
            extract = 'undefined';
        }
        console.log(source);
        return new Function('util, data, _', source);
    };

    /**
     * render template my JSON
     *
     * @param {string} string template string
     * @param {object} data
     * @return {function}
     */
    function render(string, data, opt) {
        var executor;

        opt = opt || {};
        if (!(opt.extract instanceof Array && opt.extract.length > 0)) {
            throw "[Template] extract must be an array.";
        }
        var util = require('./lib/util');
        executor = compile(string, opt.extract);
        return executor.call(null, util, data);
    }



    exports.version = '1.0.0';
    exports.compile = compile;
    exports.render = render;

    return exports;
}));