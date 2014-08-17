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
 * file:    parser.js
 * author:  mycoin (nqliujiangtao@gmail.com)
 * date:    2013/09/28
 * repos:   https://github.com/mycoin/mini-template
 */

var parser = {};

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

// Is a given value an array?
// @todo Delegates to ECMA5's native Array.isArray
function isArray(obj) {
    return ({}).toString.call(obj) == '[object Array]';
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
    string = string
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\s*\n\s*/g, strip ? '' : '\\\n');

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
 * @param {string=} defaul default encoding `encode`
 * @see: https://gist.github.com/mycoin/f20d51986ba5878beb38
 * @return
 */
function filterVars(string, defaul) {
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
}

/**
 * pack as function, adpter
 * @interface render(data, opt);
 *
 * @param {function} executor compiled function.
 * @param {boolean}  not using `with(){..}` ?
 * @param {object}  opt
 * @return {function}
 */
function patch(executor, strict, opt) {
    var param = opt.PARAMS || [];
    // 取出对象，返回参数
    var slice = function(data) {
        var argv = [];
        if (true == strict) {
            // 严格模式，传递已经知道的参数
            for (var i = 0; i < param.length; i++) {
                argv.push(data[param[i]]);
            }
        } else {
            // lang, data
            argv = [data[opt.LANG], data];
        }
        return argv;
    };
    return {
        render: function(data, config) {
            var args;
            if (config && typeof config == 'object') {
                data[opt.LANG] = config.lang;
            }
            args = slice(data);
            return executor.apply(config.context, args);
        },

        stringify: function(variable) {
            var source = 'function ' + executor.toString().substr(18);
            var receiver = variable || opt.EXPORT;

            if (typeof receiver == 'string') {
                return receiver + ' = ' + source;
            } else if (typeof receiver == 'function') {
                receiver(source);
            } else {
                return source;
            }
        }
    }
}

/**
 * remove placeholder, and return javascript source
 * @e.g: change `<%id%>` to `result += global.encode(id);`
 *
 * @param {string} text template' string
 * @param {object} config
 * @param {boolean} config.MIN, remove empty chars ? default `false`
 * @param {string}  config.LANG, format param
 * @param {string}  config.VARIABLE
 * @param {string}  config.FILTER default html filter. default `encode`
 * @return {string}
 */
function removeShell(text, opt) {
    var limitation = /\<%(.*?)%\>/g; // jshint ignore:line
    var keyword = /(^\s*(var|void|if|for|else|switch|case|break|{|}|;))(.*)?/g;
    var i = 0; // 游标计数器
    var match;
    var source;

    // push source snippets
    var add = function(line, raw) {
        if (raw) {
            line = encodeLiteral(line, opt.MIN); // minimum HTML
            if (line) {
                source += opt.VARIABLE + ' += ' + line + ';\n';
            }
        } else {
            if (line.match(keyword)) {
                source += line + '\n';
            } else {
                line = filterVars(line, opt.FILTER);
                if (line) {
                    source += opt.VARIABLE + ' += ' + opt.LANG + '.' + line + ';\n';
                }
            }
        }
    };

    // start...
    text = text.replace(/\s*\r?\n/g, '\n');
    source = '';

    while (match = limitation.exec(text)) { // jshint ignore:line
        add(text.slice(i, match.index), true); // raw
        add(match[1], false); // js
        i = match.index + match[0].length;
    }

    // add last snippets
    add(text.substr(i, text.length - i), true);
    return source;
}

/**
 * compile template to javascript.
 *
 * @param {string} text template' string
 * @param {object} config
 * @param {boolean} config.MIN, remove empty chars ? default `false`
 * @param {string}  config.LANG, format param
 * @param {string}  config.VARIABLE
 * @param {string=}  config.EXPORT export source to a function like `var xxx = function(...`
 * @param {array=}  config.PARAMS format parammer' array, otherwise using `with(){...}`
 * @param {string=}  config.FILTER default html filter. default `encode`
 * @param {string=}  config.PREFEX custom source code.
 * @return {string}
 */
function compile(text, opt) {
    var body = removeShell(text, opt);
    var strict = isArray(opt.PARAMS);

    if (strict) {
        // using opt' param name.
        if (opt.PARAMS.indexOf(opt.LANG) == -1 && /^[\w\.]*$/.test(opt.LANG)) {
            opt.PARAMS.unshift(opt.LANG);
        }
    } else {
        // using with(data){...}
        opt.PARAMS = [opt.LANG, 'data'];
        body = 'with(data){' + body + '}';
    }

    var head = 'var ' + opt.VARIABLE + ' = "";\n'; // var result = "";
    var tail = 'return ' + opt.VARIABLE + ';'; // return result;
    if (typeof opt.PREFEX == 'string') {
        head += opt.PREFEX + ';\n';
    }
    body = head + body + tail;

    // add wrapper
    var executor = new Function(opt.PARAMS, body); // jshint ignore:line
    return patch(executor, strict, opt);
}

// META{START}
if (typeof require == 'function' && typeof module == 'object') {
    // [1] CommonJS/Node.js
    module.exports = parser;
} else {
    // [2] browser-side, global
    this.parser = parser;
}