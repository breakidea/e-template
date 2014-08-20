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
var fs = require('fs');
path = require('path'),
template = require('./template'),
parser = require('./lib/parser'),
lang = require('./lib/lang'),
pretty = require("js-pretty").pretty;


var tpl = fs.readFileSync('index.html', 'utf-8');
var body = parser.removeShell(tpl, {
    min: 1,
    lang: 'lang',
    variable: 'result'
});

var conv = parser.convertBody(body, true, {
    prefix: '//start',
    suffix: '//End',
    variable: 'result',
});

var fn = parser.compileAll(conv, ['lang', 'tplData']);

console.log(fn + '');



return;


var achieve = require('./lib/achieve');

e = achieve.generate('index.html', {
    saveFile: 1
});



var tpl = fs.readFileSync('index.html', 'utf-8');

/**
 * Simple common assertion API
 * @public
 *
 * @param {*} condition The condition to test.  Note that this may be used to
 *     test whether a value is defined or not, and we don't want to force a
 *     cast to Boolean.
 * @param {string=} optMessage A message to use in any error.
 */
function assert(condition, optMessage) {
    if (!condition) {
        var msg = 'Assertion failed';
        if (optMessage) {
            msg = msg + ': ' + optMessage;
        }
        throw new Error(msg);
    }
}

// 测试修改器
assert('encode("<strong>")' == parser._filterVars('"<strong>"'))
assert('raw(info.userName)' == parser._filterVars('=info.userName'))
assert('cat(userName, "OK", 1)' == parser._filterVars('userName|cat:"OK":1'));
assert('escapeJs(info.userName)' == parser._filterVars('-info.userName'))
assert('raw(new Date().getDay())' == parser._filterVars('=new Date().getDay()'))
assert('escape(info.userName, "html")' == parser._filterVars('info.userName|escape:"html"'))
assert('encodeURIComponent(info.userName)' == parser._filterVars(':info.userName'))
assert('escape("Hello, " + message, "html")' == parser._filterVars('"Hello, " + message|escape:"html"'))
assert('truncate(({id:"mycoin"}).id, 3, "...")' == parser._filterVars('({id:"mycoin"}).id|truncate:3:"..."'))
assert('foo("UA:" + lang.get("userAgent"), "arg")' == parser._filterVars('"UA:" + lang.get("userAgent")|foo:"arg"'))

// 字符串量测试

e = parser._removeShell(tpl, {
    min: 1,
    variable: 'string',
    filter: 'encode',
    lang: 'lang'
});



render = parser.compile(tpl, {
    parameters: [
        'tplData',
        'extData'
    ],

    min: 1,
    variable: 'string',
    filter: 'encode',
    utilEntry: lang,
    prefix: '"use strict"',
});

var fn = pretty(render.stringify('this.renderCard'));


// return
var data = {
    name: "Activity",
    title: "团队动态",
    list: [{
        date: "[06-22]",
        title: "你喜欢九月吗，风和日丽的初秋"
    }, {
        date: "[07-27]",
        title: "反物质原子结构现端倪"
    }, {
        date: "[04-24]",
        title: "相信经常玩木马的朋友们，DLL木马揭秘"
    }, {
        date: "[05-06]",
        title: "反物质原子结构现端倪"
    }, {
        date: "[05-17]",
        title: "grub不能往MBR添加，否则会破坏Win7的激..."
    }, {
        date: "[05-29]",
        title: "相信经常玩木马的朋友们，DLL木马揭秘"
    }, {
        date: "[06-10]",
        title: "反物质原子结构现端倪"
    }]
};

var html = render.render({
    tplData: data,
    extData: {
        id: 0
    }
});
console.log(html)