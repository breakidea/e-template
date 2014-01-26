/*
 * Other form validatior based on the struts2 framework.
 *
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
 * author:  mycoin (nqliujiangtao@gmail.com)
 * date:    2014/01/25
 * repos:   https://github.com/mycoin/e-template
 */
;(function (global, factory) {
    //AMD and CMD.
    typeof define === 'function' && define(factory);
    //Node.js and Browser global
    (typeof exports !== 'undefined' ? exports : global).template = factory();
}(this, function () {
    'use strict';

    // exports function
    var template = function (source, data) {
        var func = null,
            hash = getHash(source);
        if(! cache[hash]) {
            cache[hash] = compile(source);
        }
        func = cache[hash];
        return data ? func.apply(data) : func;
    };

    /**
     * the cache
     * @private
     */
    var cache = {};

    /**
     * Calculate the hash for a string.
     * @public
     *
     * @param {String} string The string to Calculated
     * @return {Number} result
     */
    var getHash = function(string) {
        var hash = 1,
            code = 0,
            string = String(string);
        for (var i = string.length - 1; i >= 0; i--) {
            code = string.charCodeAt(i);
            hash = (hash << 6 & 268435455) + code + (code << 14);
            code = hash & 266338304;
            hash = code != 0 ? hash ^ code >> 21 : hash;
        };
        return hash;
    };

    /**
     * compile the source
     * @example compile("{%this.userName%}");
     *
     * @param {string} source template'source
     * @return {function} function cache
     */
    var compile = function (source) {
        var re = /\{%(.+?)%\}/g,
            reExp = /(^( )?(if|for|else|switch|case|break|{|}|;))(.*)?/g,
            code = 'var s=[];',
            cursor = 0,
            match,
            result;
        var add = function(line, js) {
            js ? (code += line.match(reExp) ? line : 's.push(' + line + ');') :
                (code += line != '' ? 's.push("' + line.replace(/"/g, '\\"') + '");' : '');
            return add;
        }
        while (match = re.exec(source)) {
            add(source.slice(cursor, match.index))(match[1], true);
            cursor = match.index + match[0].length;
        }
        add(source.substr(cursor, source.length - cursor));
        return new Function(code + 'return s.join("");'); 
    };

    return template;
}));