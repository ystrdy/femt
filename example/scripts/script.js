const webpack = require('webpack');
const globby = require('globby');
const path = require('path');
const merge = require('webpack-merge');
const EventEmitter = require('events');
const EventHooksPlugin = require('event-hooks-webpack-plugin');
const chokidar = require('chokidar');
const chalk = require('chalk');
const { getProjectPath, log } = require('./utils');

class Script extends EventEmitter {
    constructor(config){
        super();

        this.config = config;
    }
    static async build(config){
        const instance = new this(config);
        await instance.run();
        return instance;
    }
    async run(){
        const files = await this.getEntryFiles();
        if (files.length) {
            this.create(files);
        }
        if (this.config.watch) {
            this.watch();
        } else {
            await this.compile();
        }
    }
    async compile(){
        return new Promise((resolve, reject) => {
            this.instance.run((err, stats) => {
                if (err || stats.hasErrors()) {
                    this.logError(err, stats);
                    reject();
                } else {
                    resolve();
                }
            });
        });
    }
    async create(files){
        // 构建entry
        const entry = {};
        files.forEach(filepath => {
            const pathObj = path.parse(filepath);
            entry[pathObj.name] = path.resolve(filepath);
        });
        // 创建webpack实例
        const tag = 'script';
        const webpackConfig = merge({
            entry,
            plugins: [
                new EventHooksPlugin({
                    compile: () => {
                        log.time(tag);
                        this.emit('beforeCompile', this);
                    },
                    done: () => {
                        this.emit('afterCompile', this);
                        log.timeEnd(tag);
                    },
                }),
            ],
        }, this.config.webpack);
        this.instance = webpack(webpackConfig);
    }
    watch(){
        const { instance } = this;
        let webpackWatcher;
        if (instance) {
            webpackWatcher = instance.watch({}, this.logError);
        }
        const watcher = chokidar.watch(this.config.patterns, {
            cwd: this.getScriptSearchPath(),
            ignoreInitial: true,
        });
        const change = () => {
            // 关闭chokidar
            watcher.close();
            // 关闭webpack
            webpackWatcher && webpackWatcher.close();
            // 重启
            this.run();
        };
        watcher.on('ready', () => {
            watcher.on('add', change)
                .on('unlink', change);
        });
        watcher.on('error', function (error) {
            console.log(chalk.red('Watcher error: ' + error));
        });
    }
    logError(error, stats){
        if (error) {
            log.error(error);
        } else if (stats.hasErrors()) {
            console.log(stats.toString({
                colors: true,
                reasons: true,
            }));
        }
    }
    getScriptSearchPath() {
        const { searchPath } = this.config;
        return path.resolve(getProjectPath(), searchPath);
    }
    async getEntryFiles() {
        return globby(
            this.config.patterns,
            {
                cwd: this.getScriptSearchPath(),
                absolute: true,
            }
        );
    }
}

module.exports = Script;