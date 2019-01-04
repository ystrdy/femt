const chalk = require('chalk');
const prettyHrtime = require('pretty-hrtime');
const moment = require('moment');

/**
 * 模板字符串
 * @param {String} tmpl 模板字符串
 * @param {Object} data 数据
 * @example
 * template('my name is [name].', { name: 'xxx' }) => my name is xxx.
 */
exports.template = (tmpl, data) => {
    return tmpl.replace(/\[([0-9a-zA-Z_]+)\]/g, (_, key) => data[key] || '');
};

/**
 * 获取项目根目录
 */
exports.getProjectPath = () => {
    return process.cwd();
};

/**
 * 打印log
 */
class Log {
    constructor(){
        this.tagCache = {};
    }
    error(error) {
        console.error(chalk`{red ${error.stack}}`);
    }
    time(tag = 'default') {
        this.tagCache[tag] = process.hrtime();
        console.log(chalk`[{grey ${moment().format('HH:mm:ss')}}] {cyan Processing '{bold ${tag}}' ...}`);
    }
    timeEnd(tag = 'default') {
        const { tagCache } = this;
        if (!tagCache[tag]) {
            throw new TypeError('tag does not exist.');
        }
        const prettyTime = prettyHrtime(process.hrtime(tagCache[tag]));
        console.log(chalk`[{grey ${moment().format('HH:mm:ss')}}] {green Finished '{bold ${tag}}' in {bold ${prettyTime}}}`);
    }
}

exports.log = new Log();