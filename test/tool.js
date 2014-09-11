var fs = require('fs');
var path = require('path');
var dir = path.resolve(__dirname, 'case');


var caseMap = {};
fs.readdirSync(dir).forEach(function(filename) {
    var exec;
    if (exec = /^((config)\-(.*?))\.(html|js|tpl)$/.exec(filename)) {
        if (!caseMap[exec[2]]) {
            caseMap[exec[2]] = {};
        }
        caseMap[exec[2]][exec[3]] = fs.readFileSync(dir + '/' + filename, 'utf-8').trim();
    }
});

// 获取测试案例
exports.getCases = function(type) {
    if (type) {
        return caseMap[type];
    } else {
        return caseMap;
    }
};

// 分割字符串
exports.split = function(text) {
    
}