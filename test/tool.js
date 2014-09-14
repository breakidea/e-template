var fs = require('fs');
var path = require('path');
var dir = path.resolve(__dirname, 'case');


var caseMap = {};
fs.readdirSync(dir).forEach(function(filename) {
    var exec;
    if (exec = /^((config|shell)\-(.*?))\.(json|tpl|js|html)$/.exec(filename)) {
        if (!caseMap[exec[1]]) {
            caseMap[exec[1]] = {
                jsFile: dir + '/' + exec[1] + '.js',
                htmlFile: dir + '/' + exec[1] + '.html',
                tplFile: dir + '/' + exec[1] + '.tpl',
                path: dir + '/' + exec[1],
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

exports.read = function(filename, type) {
    var content = fs.readFileSync(dir + '/' + filename, 'utf-8');
    if (type == 'JSON') {
        return JSON.parse(content);
    } else {
        return content;
    }
};