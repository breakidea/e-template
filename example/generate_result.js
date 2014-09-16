var fs = require('fs');
var lib = require('../');
var pretty = require('js-pretty');


var tpl = fs.readFileSync('./page.tpl', 'utf-8');
var data = require('./data');
var opt = {
    clean: false,
    variable: 'v',
    strip: 1,
    filter: 'encode',
    // helper: fs.readFileSync('../test/x-util.source', 'utf-8') // 将内建到编译结果中
};

var middle = lib.compile(tpl, opt);

var html = middle.render(data); // 渲染结果
var resource = middle.stringify('exports.index'); // 导出为格式化好的字符串
var prefix = fs.readFileSync('../test/x-util.js', 'utf-8');

eval(resource); // 这段代码应该放在缓存 JS 文件里
eval(prefix); // 把CONFIG_HELPER导出给环境

var helper = require('../test/x-util.js'); // 由于将代码保存在文件中，所以格式化工具代码需要外部提供`CONFIG_HELPER`，并且传递给 render 的第二个参数
var html0 = exports.index(data, CONFIG_HELPER);

// 写入文件试试
fs.writeFileSync('./generated.js', [
    '(function(){',
        'var exports = window.cache = {};',
        resource, // 需要包装一层的嘛~ 在浏览器里面直接获取
        'return exports;',
    '})();',
].join('\n'));

// 编译序列化在文件中的代码
console.log(pretty(resource));
console.log(html0 == html ? "OK" : "ERROR"); // 等价