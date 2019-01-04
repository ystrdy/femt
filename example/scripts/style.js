const read = require('read-cache');
const postcss = require('postcss');
const path = require('path');
const globby = require('globby');
const to = require('await-to-js').default;
const chalk = require('chalk');
const fs = require('fs-extra');
const chokidar = require('chokidar');
const PQueue = require('p-queue');
const EventEmitter = require('events');
const { template, getProjectPath, log } = require('./utils');

class Style extends EventEmitter {
    constructor(config){
        super();

        this.config = config;
    }
    static async build(config){
        const instance = new this(config);
        await instance.init();
        return instance;
    }
    async init(){
        // 输出文件
        await this.outputFiles();
        // 启动监听修改
        this.config.watch && this.watch();
    }
    getStyleSearchPath() {
        const { searchPath } = this.config;
        return path.resolve(getProjectPath(), searchPath);
    }
    async outputFiles(){
        const tag = 'style';
        log.time(tag);

        // 获取需要编译的文件
        const files = await globby(
            this.config.patterns,
            {
                cwd: this.getStyleSearchPath(),
                absolute: true,
            }
        );
        // 编译文件
        this.emit('beforeCompile', this);
        const promises = files.map(async filename => {
            // 渲染
            const [ error, result ] = await to(this.render(filename));
            if (error) {
                log.error(error);
                return;
            }
            if (!result) return;

            // 存储文件
            const tasks = [];
            const { filepath } = result;
            result.css && tasks.push(fs.outputFile(filepath, result.css));
            result.map && tasks.push(fs.outputFile(filepath + '.map', result.map));
            await Promise.all(tasks);
        });
        await Promise.all(promises);
        this.emit('afterCompile', this);

        log.timeEnd(tag);
    }
    async render(filename){
        const css = (await read(filename)).toString();
        // 获取输出路径
        const { config } = this;
        const { outputPath } = config;
        const filepath = path.resolve(getProjectPath(), template(outputPath, path.parse(filename)));

        // 编译
        const { plugins, ...options } = config.postcss;
        const returnValue = { filepath };
        const result = await postcss(plugins).process(css, {
            ...options,
            from: filename,
            to: filepath,
        });
        returnValue.css = result.css;
        returnValue.map = result.map;

        return returnValue;
    }
    watch(){
        const watcher = chokidar.watch(this.config.watchGlob, {
            ignoreInitial: true,
        });
        const queue = new PQueue({concurrency: 1});
        watcher.on('ready', () => {
            const change = (path) => {
                queue.add(() => this.outputFiles());
            };
            watcher.on('add', change)
                .on('change', change)
                .on('unlink', change);
        });
        watcher.on('error', function (error) {
            console.log(chalk.red('Watcher error: ' + error));
        });
    }
}

module.exports = Style;