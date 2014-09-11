var fs = require('fs');
var path = require('path');

var main = require('../');
var tool = require('./tool');

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
assert('encode("<strong>")' == main._filterVars('"<strong>"'))
assert('raw(info.userName)' == main._filterVars('=info.userName'))
assert('cat(userName, "OK", 1)' == main._filterVars('userName|cat:"OK":1'));
assert('escapeJs(info.userName)' == main._filterVars('-info.userName'))
assert('raw(new Date().getDay())' == main._filterVars('=new Date().getDay()'))
assert('escape(info.userName, "html")' == main._filterVars('info.userName|escape:"html"'))
assert('encodeURIComponent(info.userName)' == main._filterVars(':info.userName'))
assert('escape("Hello, " + message, "html")' == main._filterVars('"Hello, " + message|escape:"html"'))
assert('truncate(({id:"mycoin"}).id, 3, "...")' == main._filterVars('({id:"mycoin"}).id|truncate:3:"..."'))
assert('foo("UA:" + lang.get("userAgent"), "arg")' == main._filterVars('"UA:" + lang.get("userAgent")|foo:"arg"'))


var configCase = tool.getCases('config');
for(var k in configCase) {
    var conf = main.parseMaster(configCase[k], 'target')
    console.log(conf);
}