const path = require('path');
const chalk = require('chalk');
const fs = require('fs-extra');
const chokidar = require('chokidar');
const PQueue = require('p-queue');
const EventEmitter = require('events');
const { getProjectPath, log } = require('./utils');

class Static extends EventEmitter {
    constructor(config){
        super();

        this.config = config;
    }
    static async build(config) {
        const instance = new this(config);
        await instance.init();
        return instance;
    }
    async init() {
        // 输出文件
        await this.outputFiles();
        // 启动监听修改
        this.config.watch && this.watch();
    }
    async outputFiles(){
        const tag = 'static';
        log.time(tag);

        this.emit('beforeCompile', this);
        const { rootDirectory, outputPath } = this.config;
        if (fs.existsSync(rootDirectory)) {
            fs.copySync(
                path.resolve(getProjectPath(), rootDirectory),
                path.resolve(getProjectPath(), outputPath)
            );
        }
        this.emit('afterCompile', this);

        log.timeEnd(tag);
    }
    watch(){
        const watcher = chokidar.watch(this.config.watchGlob);
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

module.exports = Static;