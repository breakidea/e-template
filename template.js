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
;(function (global, factory) {
    //AMD and CMD.
    typeof define === 'function' && define(factory);
    
    //Node.js and Browser `global`
    (typeof exports !== 'undefined' ? exports : global).template = factory();
    
}(this, function () {

    // using strict mode
    'use strict';

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
    var template = function (source, data) {
        var hash = getHash(source);
        // read function from cache
        var func = _cache[hash] = _cache[hash] || compile(source);
        if (arguments.length == 2) {
            return func.apply(data);
        } else {
            return func;
        }
    },

    /**
     * the collection the cache compiled template.
     * @type Object
     */
    _cache = {},

    /**
     * Calculate the hash for a string.
     * @public
     *
     * @param {string} string The string to Calculated
     * @return {Number} result
     */
    getHash = function(string) {
        var hash = 1,
            code = 0;
        for (var i = string.length - 1; i >= 0; i--) {
            code = string.charCodeAt(i);
            hash = (hash << 6 & 268435455) + code + (code << 14);
            code = hash & 266338304;
            hash = code != 0 ? hash ^ code >> 21 : hash;
        };
        return hash;
    },

    /**
     * strip whitespace from the beginning and end of a string
     *
     * @function
     * @public
     *
     * @param {String} source the target string that will be trimmed.
     * @return {string} the trimed string
     */
    trim = function(source) {
        return source.replace(/(^\s*)|(\s*$)/g, '');
    },

    /**
     * compile the source
     * @example compile("<%this.userName%>");
     *
     * @param {string} string template'string
     * @return {function} function cache
     */
    compile = function (string) {
        var limitation = /\<%(.+?)%\>/g,
            keyword = /(^( )?(if|for|else|switch|case|break|{|}|;))(.*)?/g,
            index = 0,
            match,
            source = '\tvar _ = "";';

        // push source snippets
        var add = function(line, isJs) {
            line = trim(line).replace("\n", "\\\n");
            if(isJs) {
                source += '\n\t' + (line.match(keyword) ? line : '_ += (' + line + ');');
            } else {
                if (line.length > 0) {
                    source += '\n\t_ += ("' + line.replace(/"/g, '\\"') + '");'
                }
            }
        }
        while (match = limitation.exec(string)) {
            add(string.slice(index, match.index), false);
            add(match[1], true);
            index = match.index + match[0].length;
        }
        
        // add last snippets
        add(string.substr(index, string.length - index), false);
        return new Function(source + '\n\treturn _;'); 
    };

    return template;
}));
