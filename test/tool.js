var fs = require('fs');
var path = require('path');
var dir = path.resolve(__dirname, 'case');


var caseMap = {};
fs.readdirSync(dir).forEach(function(filename) {
    var exec;
    if (exec = /^((config|shell)\-(.*?))\.(json|tpl|js)$/.exec(filename)) {
        if (!caseMap[exec[1]]) {
            caseMap[exec[1]] = {
                jsFile: dir + '/' + exec[1] + '.js',
                tplFile: dir + '/' + exec[1] + '.tpl',
                jsonFile: dir + '/' + exec[1] + '.json'
            };
        }

        var ext = exec[4];
        caseMap[exec[1]].section = exec[2];
        caseMap[exec[1]][ext] = fs.readFileSync(dir + '/' + filename, 'utf-8').trim();
    }
});
// 获取测试案例
exports.getCases = function(type) {
    if (type) {
        var item, result = {};
        for (var k in caseMap) {
            item = caseMap[k];
            if (type == item.section) {
                result[k] = item;
            }
        }
        return result;
    } else {
        return caseMap;
    }
};

exports.read = function(filename) {
    return fs.readFileSync(dir + '/' + filename, 'utf-8');
};

// 分割字符串
exports.split = function(text) {

}