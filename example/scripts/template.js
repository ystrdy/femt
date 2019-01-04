const { Environment, FileSystemLoader } = require('nunjucks');
const globby = require('globby');
const path = require('path');
const Mock = require('mockjs');
const fs = require('fs-extra');
const { to } = require('await-to-js');
const serializeError = require('serialize-error');
const PQueue = require('p-queue');
const chokidar = require('chokidar');
const chalk = require('chalk');
const EventEmitter = require('events');
const { template, getProjectPath, log } = require('./utils');

class Template extends EventEmitter {
    constructor(config){
        super();

        this.config = config;
        this.cache = {};
        // 实例化模板加载器
        const searchPath = this.getTemplateSearchPath();
        const { watch, nunjucks } = config;
        const TemplateLoader = this.TemplateLoader = new FileSystemLoader(searchPath, { watch });
        // 创建渲染引擎
        this.engine = new Environment(TemplateLoader, nunjucks);
    }
    static async build(config){
        const instance = new this(config);
        await instance.init();
        return instance;
    }
    async init(){
        await this.outputFiles();
        // 启动监听修改
        this.config.watch && this.watch();
    }
    getTemplateSearchPath() {
        const { searchPath } = this.config;
        return path.resolve(getProjectPath(), searchPath);
    }
    async outputFiles(){
        const tag = 'template';
        log.time(tag);

        // 获取需要编译的文件
        const { config } = this;
        const files = await globby(
            config.patterns,
            {
                cwd: this.getTemplateSearchPath(),
                absolute: true,
            }
        );
        // 开始编译
        this.emit('beforeCompile', this);
        const promises = files.map(async filename => {
            // 渲染
            const result = await this.render(filename);
            // 输出文件
            if (result) {
                const { filepath, content } = result;
                // 文件没有改变，不重新输出
                if (this.cache[filepath] && this.cache[filepath].content === content) return;
                // 获取文件夹路径
                const { dir } = path.parse(filepath);
                // 建文件夹
                fs.ensureDirSync(dir);
                // 输出
                fs.writeFileSync(filepath, content);
                // 缓存
                this.cache[filepath] = result;
            }
        });
        await Promise.all(promises);
        this.emit('afterCompile', this);

        log.timeEnd(tag);
    }
    async render(filename){
        const relative = path.relative(this.getTemplateSearchPath(), filename);
        const file = path.parse(filename);
        // 开始渲染
        const [ error, text ] = await to(new Promise((resolve, reject) => {
            this.engine.render(relative, { file, Random: Mock.Random }, (error, text) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(text);
                }
            });
        }));
        // 获取输出路径
        const { outputPath } = this.config;
        const filepath = path.resolve(getProjectPath(), template(outputPath, file));
        // 输出文件
        let content = text;
        if (error) {
            const err = serializeError(error);
            content = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <meta http-equiv="X-UA-Compatible" content="ie=edge">
                    <title>${err.name}</title>
                </head>
                <body>
                    <h1>${err.name}</h1>
                    <h2>${err.message.replace(/\n/g, '<br>')}</h2>
                    <p>stack: <ul><li>${err.stack.split('\n').join('</li><li>')}}</li></ul></p>
                </body>
                </html>
            `;
            log.error(error);
        }
        return { filepath, content };
    }
    watch(){
        const { TemplateLoader } = this;
        const queue = new PQueue({concurrency: 1});
        // 监听文件修改
        TemplateLoader.on('update', () => {
            /**
             * nextTick开始更新文件，等待缓存被清空
             */
            process.nextTick(() => {
                queue.add(() => this.outputFiles());
            });
        });
        // 监听文件添加
        const watcher = chokidar.watch(this.config.watchGlob, {
            ignoreInitial: true,
        });
        watcher.on('ready', () => {
            watcher.on('all', (event, fullname) => {
                if (event === 'add') {      // 新建文件
                    // 重新编译
                    queue.add(() => this.outputFiles());
                } else if (event === 'unlink') {        // 删除文件
                    TemplateLoader.emit('update', TemplateLoader.pathsToNames[path.resolve(fullname)]);
                }
            });
        });
        watcher.on('error', function (error) {
            console.log(chalk.red('Watcher error: ' + error));
        });
    }
}

module.exports = Template;