var fs = require('fs');
var path = require('path');

var lib = require('../');
var tool = require('./tool');
var pretty = require('js-pretty');

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
assert('encode("<strong>")' == lib._filterVars('"<strong>"'));
assert('raw(info.userName)' == lib._filterVars('=info.userName'));
assert('cat(userName, "OK", 1)' == lib._filterVars('userName|cat:"OK":1'));;
assert('escapeJs(info.userName)' == lib._filterVars('-info.userName'));
assert('raw(new Date().getDay())' == lib._filterVars('=new Date().getDay()'));
assert('escape(info.userName, "html")' == lib._filterVars('info.userName|escape:"html"'));
assert('encodeURIComponent(info.userName)' == lib._filterVars(':info.userName'));
assert('escape("Hello, " + message, "html")' == lib._filterVars('"Hello, " + message|escape:"html"'));
assert('truncate(({id:"mycoin"}).id, 3, "...")' == lib._filterVars('({id:"mycoin"}).id|truncate:3:"..."'));
assert('foo("UA:" + _.get("userAgent"), "arg")' == lib._filterVars('"UA:" + _.get("userAgent")|foo:"arg"'));


// 测试拆解函数
var configFile = tool.getCases('config');
var item, result, expect;
for (var k in configFile) {
    item = configFile[k];
    result = lib.parseMaster(item.tpl, 1);
    try {
        assert(JSON.stringify(result) == item.json)
    } catch (e) {
        // fs.writeFileSync(item.jsonFile, JSON.stringify(result));
        console.error(e);
    };
}

// 测试去除占位符
var tpl = tool.getCases('shell');
for(var k in tpl) {
    item = tpl[k];
    result = pretty(lib.convert(item.tpl));
    try {
        assert(result == item.js)
    } catch (e) {
        fs.writeFileSync(item.jsFile, result);
        // console.log(e);
    };
}

var co = tool.read('shell-component.tpl');
var data = lib.parseMaster(co, 1);
// var fun = pretty(lib.convert(data['x-template'].content));
// var fun = pretty();

var opt = {
    min: 1,
    variable: 'html',
    strip: false,
    filter: 'encode'
};

console.log(lib.build(data, opt));

