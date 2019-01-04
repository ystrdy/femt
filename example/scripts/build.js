const chalk = require('chalk');
const Template = require('./template');
const Style = require('./style');
const Script = require('./script');
const Static = require('./static');
const config = require('./config.prod');
const moment = require('moment');
const prettyHrtime = require('pretty-hrtime');
const { inlineSource } = require('inline-source');
const globby = require('globby');
const { getProjectPath } = require('./utils');
const path = require('path');
const fs = require('fs');
const del = require('del');
const deleteEmpty = require('delete-empty');

const time = process.hrtime();
console.log(chalk`[{grey ${moment().format('HH:mm:ss')}}] {cyan Building...}`);

async function build() {
    // 首次编译
    await Promise.all([
        /**
         * 编译html
         */
        Template.build(config.template),
        /**
         * 编译style
         */
        Style.build(config.style),
        /**
         * 编译script
         */
        Script.build(config.script),
        /**
         * 编译静态资源
         */
        Static.build(config.static),
    ]);
    // 后处理
    const files = await globby(
        'build/**/*.html',
        {
            cwd: getProjectPath(),
            absolute: true,
        }
    );
    const filepaths = [];
    const handlers = function(source, context) {
        const { format, fileContent, filepath, parentContext } = source;
        const { htmlpath } = parentContext;
        // 替换图片路径
        if (format === 'css') {
            const regexp = /(url\(['"]?)(.+?)(['"]?\))/ig;
            source.fileContent = fileContent.replace(regexp, (all, p1, src, p2) => {
                if (/^(http|https|data):/.test(src)) return p1 + src + p2;
                const realpath = path.resolve(path.dirname(filepath), src);
                const relative = path.relative(path.dirname(htmlpath), realpath);
                return p1 + relative.split(path.sep).join('/') + p2;
            });
        }
        filepaths.push(filepath);
        return Promise.resolve();
    };
    let promises = files.map(async filepath => {
        let html = '';
        try {
            html = await inlineSource(filepath, {
                compress: false,
                rootpath: path.resolve(getProjectPath(), 'build'),
                handlers: [handlers],
            });
        } catch (error) {
            console.log(error);
        }
        return {
            filepath,
            content: html,
        };
    });
    const contents = await Promise.all(promises);
    // 输出
    promises = contents.map(async ({filepath, content}) => {
        await new Promise(resolve => {
            fs.writeFile(filepath, content, () => {
                resolve();
            });
        });
    });
    await Promise.all(promises);
    // 删除无效文件
    del.sync(filepaths);
    // 删除map
    del.sync(['build/**/*.map'], {
        cwd: getProjectPath(),
    });
    // 删除空文件夹
    deleteEmpty.sync('build/', {
        cwd: getProjectPath(),
    });
    
    const prettyTime = prettyHrtime(process.hrtime(time));
    console.log(chalk`[{grey ${moment().format('HH:mm:ss')}}] {green Finished build in {bold ${prettyTime}}}`);
}

build();