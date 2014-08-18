/*
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * file:    lib/util.js
 * author:  mycoin (nqliujiangtao@gmail.com)
 * date:    2014/08/15
 * repos:   https://github.com/mycoin/mini-template
 */

// 生成模板引擎
var fs = require('fs');
var parser = require('./parser');
var pretty = require("js-pretty").pretty;

/**
 * Copy properties from the source object to the target object
 *
 * @public
 * @param {Object} target the target object
 * @param {Object} obj the source object
 * @param {Boolean} overwrite if overwrite the same property, default 'true'
 * @return target
 */
function extend(target, obj, overwrite) {
    if (undefined === overwrite) {
        overwrite = true;
    }
    for (var key in obj || {}) {
        if (obj.hasOwnProperty(key) && (overwrite || !target.hasOwnProperty(key))) {
            target[key] = obj[key];
        }
    }
    return target;
}

/**
 * coonfig achieves
 *
 * @public
 * @param {string} source source code
 * @param {string} begin begin flag
 * @param {string} end end flag
 *
 * @return source
 */
function generate(tplFile, opt) {
    var tplContent = fs.readFileSync(tplFile, 'utf-8');
    var sourceCode;

    opt = opt || {};
    try {
        if (tplContent.indexOf('{%$') > -1) {
            throw 'please cleanup.';
        }
        sourceCode = parser.compile(tplContent, extend(opt, {
            parameters: [
                'tplData',
                'extData'
            ],
            min: 1,
            variable: 'result',
            filter: 'encode',
            prefix: '//use strict',

        })).stringify('var render');
        sourceCode = pretty(sourceCode);

    } catch (e) {
        throw e;
    }
    if (opt.saveFile) {
        fs.writeFileSync(tplFile + '.js', sourceCode);
        console.log('OK')
    }
    return sourceCode;
}

exports.generate = generate;