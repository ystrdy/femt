const glob = require('glob');
const _ = require('lodash');
const path = require('path');
const gulp = require('gulp');
const $ = require('gulp-load-plugins')();

const util = require('./util');
const cache = require('./cache');
const defaultConfig = require('./config');
const log = require('./log');

class WorkFlow{
	constructor(){
		this.interfaces = {};
		this.compiler = [];
		this.cache = cache;
		this.defaultConfig = defaultConfig;
		this.util = util;
		this.log = log;
	}
	async init(){
		// 加载编译文件
		await this.loadCompileFile();
		log.debug('加载接口文件完成.', true);
		// run beforeBegin
		log.debug('开始执行beforeBegin接口.', true);
		let paths = await this.runInterface('beforeBegin');
		paths = _.flatten(paths.filter(v => v != null), true)
			.map(v => path.join(defaultConfig.sourcePath, v));
		log.debug(`执行beforeBegin接口结束，gulp.src开始扫描以下文件路径\n${paths.join('\n')}`, true);
		let stream = gulp.src(paths, {base: defaultConfig.sourcePath, nodir: true});
		// run afterBegin
		log.debug('扫描文件结束，开始执行afterBegin接口.', true);
		let plugins = await this.runInterface('afterBegin');
		_.flatten(plugins, true).filter(v => !!v).forEach(plugin => {
			stream = stream.pipe(plugin);
		});
		// 等待所有文件都完成后，在进入beginEnd
		await new Promise(resolve => stream.on('finish', resolve));
		// run beforeEnd
		log.debug('执行afterBegin接口结束，开始执行beforeEnd接口.', true);
		plugins = await this.runInterface('beforeEnd');
		_.flatten(plugins, true).filter(v => !!v).forEach(plugin => {
			stream = stream.pipe(plugin);
		});
		if (defaultConfig.debug) {
			let files = [];
			stream = stream.pipe(util.createPlugin((file, enc, next) => {
				files.push(file.path);
				next(null, file);
			}, next => {
				log.debug(`执行beforeEnd接口结束，gulp.dest开始存储以下文件\n${files.join('\n')}`, true);
				next(null);
			}))
		}
		await new Promise(resolve => {
			stream.pipe(gulp.dest(defaultConfig.outputPath))
				.on('finish', async () => {
					// run afterEnd
					log.debug('存储文件结束，开始执行afterEnd接口.', true);
					resolve();
				});
		});
		await this.runInterface('afterEnd');
	}
	async runInterface(name, ...args){
		const {compiler, interfaces} = this;
		return Promise.all(interfaces[name].map(idx => compiler[idx][name].apply(this, args)));
	}
	async loadCompileFile(){
		const files = await this.getCompileFiles();
		const compiler = _.flatten(files, true).map(filepath => {
			let module = require(util.getRelativeRoot(filepath));
			if (typeof module === 'function') {
				module = module(this);
			}
			return module;
		}).sort((a, b) => {
			const asort = a.sort || 0;
			const bsort = b.sort || 0;
			return asort - bsort;
		});
		this.compiler = compiler;

		const interfaces = this.interfaces;
		compiler.forEach((c, i) => {
			['beforeBegin',
			'afterBegin',
			'beforeEnd',
			'afterEnd'].forEach(name => {
				if (!Array.isArray(interfaces[name])) {
					interfaces[name] = [];
				}
				if (c[name]) {
					interfaces[name].push(i);
				}
			});
		});
	}
	async getCompileFiles(){
		const getDefaultCompileFiles = () => new Promise((resolve, reject) => {		
			glob('gulp/middleware/*.js', {
				nodir: true,
			}, (error, files) => {
				if (error) {
					reject(error);
				} else {
					resolve(files);
				}
			});
		});
		return Promise.all([
			util.getCompileFiles(),
			getDefaultCompileFiles(),
		]);
	}
}

module.exports = WorkFlow;