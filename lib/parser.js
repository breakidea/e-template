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

// META{BEGIN}
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
 * remove placeholder, and return javascript source
 * @e.g: change `<%id%>` to `result += global.encode(id);`
 *
 * @param {string} text template' string
 * @param {object} config
 * @param {boolean} config.min, remove empty chars ? default `false`
 * @param {string}  config.lang, format param
 * @param {string}  config.variable
 * @param {string}  config.filter default html filter. default `encode`
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
            line = encodeLiteral(line, opt.min); // minimum HTML
            if (line) {
                source += opt.variable + ' += ' + line + ';\n';
            }
        } else {
            if (line.match(keyword)) {
                source += line + '\n';
            } else {
                line = filterVars(line, opt.filter);
                if (line) {
                    source += opt.variable + ' += ' + '_.' + line + ';\n';
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
 * @param {boolean} config.min, remove empty chars ? default `false`
 * @param {string}  config.variable
 * @param {array=}  config.parameters format parammer' array, otherwise using `with(){...}`
 * @param {string=}  config.filter default html filter. default `encode`
 * @param {string=}  config.prefix custom source code.
 * @param {object=}  config.utilEntry entry for lang.
 * @return {object}
 */
function compile(text, opt) {

    var parameterAvailable; // 已经参数
    var executorFun;
    var executorArgv = opt.parameters;

    var sourcePrefix; // 源码前缀
    var sourceBody;
    var sourceSuffix; // 源码后缀

    sourcePrefix = (opt.prefix ? opt.prefix + ';\n' : '') + 'var ' + opt.variable + ' = "";\n';
    sourceSuffix = (opt.suffix ? opt.suffix + ';\n' : '') + 'return ' + opt.variable + ';';
    sourceBody = removeShell(text, opt);

    parameterAvailable = (executorArgv instanceof Array) && executorArgv.length;
    if (!parameterAvailable) {
        // 没有提供参数，使用with(data)
        executorArgv = ['_', 'data'];
        sourceBody = 'with(data){' + sourceBody + '}';
    } else {
        // 使用配置的形参
        executorArgv.unshift('_');
    }
    sourceBody = sourcePrefix + sourceBody + sourceSuffix;

    // add wrapper
    executorFun = new Function(executorArgv, sourceBody); // jshint ignore:line

    // return object
    return {
        original: executorFun,

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
        render: function(data, config) {
            var paramList = [];
            config = config || {};
            if (typeof config.lang == 'object') {
                data._ = extend(config.lang, opt.utilEntry); // 使用扩展
            } else {
                data._ = opt.utilEntry;
            }
            if (parameterAvailable) {
                // 严格模式，传递已经知道的参数
                for (var i = 0; i < executorArgv.length; i++) {
                    paramList.push(data[executorArgv[i]]);
                }
            } else {
                // 使用with语句
                paramList = [data[opt.lang], data];
            }
            return executorFun.apply(config.context, paramList);
        },

        /**
         * stringify executorFun
         * @e.g: stringify('this.renderComdi');
         *
         * @param {string|function|=} data JSON data
         * @return {string}
         */
        stringify: function(variable) {
            var executorSource = 'function ' + (executorFun + '').substr(18);
            var receiver = variable;

            if (typeof receiver == 'string') {
                // conversion to `var xxx = `
                return receiver + ' = ' + executorSource + ';';
            } else if (typeof receiver == 'function') {
                // eval()
                receiver(executorSource);
            } else {
                return executorSource;
            }
        }
    };
}

parser._encodeLiteral = encodeLiteral;
parser._filterVars = filterVars;
parser._removeShell = removeShell;
parser.compile = compile;


// META{END}
if (typeof require == 'function' && typeof module == 'object') {
    // [1] CommonJS/Node.js
    module.exports = parser;
} else {
    // [2] browser-side, global
    this.parser = parser;
}