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
    result = lib._parseTpl(item.tpl, 1);
    try {
        assert(JSON.stringify(result) == item.json);
    } catch (e) {
        // fs.writeFileSync(item.jsonFile, JSON.stringify(result));
        console.error('模板拆分函数不正确');
    };
}
// 测试去除占位符
var opt = {
    clean: 0,
    variable: 'html',
    strip: 0,
    filter: 'encode',
    raw: 0
};
var tpl = tool.getCases('shell');
var data = tool.read('data.json', 'JSON');
var lang = require('./x-util');
for (var k in tpl) {
    var item = tpl[k];
    
    opt.helper = fs.readFileSync(__dirname + '/x-util.source', 'utf-8'); // 将内建到编译结果中，每个section都冗余一份
    // opt.helper = lang;

    var call = lib.compileMulti(item.tpl, opt);
    var source = call.get('index').stringify('renderIndex') + '; module.exports=renderIndex;';
    var source = pretty(source);
    var html = call.render('index', data);
    try {
        assert(item.js == source);
    } catch (ex) {
        // fs.writeFileSync(item.jsFile, source);
        console.log('编译后的函数源码不正确');
    }
    try {
        assert(item.html == html.trim());
    } catch (ex) {
        // fs.writeFileSync(item.htmlFile, html);
        console.log('模板渲染结果不正确');
    }

    try {
        var required = require(item.path);
        var requiredHtml = required(data, lang);
        assert(html == requiredHtml);
    } catch (e) {
        console.log('编译结果和导出的模板函数不一致');
    }
}

console.log('OK');