const glob = require('glob');
const _ = require('lodash');
const path = require('path');

const util = require('./util');
const cache = require('./cache');
const defaultConfig = require('./config');

class WorkFlow{
	constructor(){
		this.interfaces = {};
		this.compiler = [];
		this.patterns = [];
		this.cache = cache;
		this.defaultConfig = defaultConfig;
		this.util = util;
	}
	async init(){
		// 加载编译文件
		await this.loadCompileFile();
		// run beforeBegin
		await this.runInterface('beforeBegin');
		// run afterBegin
		await this.runInterface('afterBegin');
		// run beforeEnd
		await this.runInterface('beforeEnd');
		// run afterEnd
		await this.runInterface('afterEnd');
	}
	async runInterface(name){
		const {compiler, interfaces} = this;
		return Promise.all(interfaces[name].map(idx => compiler[idx][name].call(this)));
	}
	async loadCompileFile(){
		const files = await this.getCompileFiles();
		const compiler = _.flattenDeep(files).map(filepath => {
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
		const patterns = [];
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
			if (Array.isArray(c.pattern)) {
				patterns.push(c.pattern);
			}
		});
		this.patterns = _.flattenDeep(patterns);
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