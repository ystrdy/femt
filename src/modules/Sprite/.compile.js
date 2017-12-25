const path = require('path');
const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const spritesmith = require('gulp.spritesmith');
const glob = require('glob');
const _ = require('lodash');
const fs = require('fs-extra');

module.exports = function(flow){
	const {defaultConfig} = flow;
	const config = [{
		source: ['**/sprites/*.png'],
		option: {
			imgName: 'icon.png',
			cssName: 'Sprite.scss',
			cssFormat: 'scss',
			padding: 10,
		}
	}];

	const Cache = new class {
		constructor(){
			this.dbpath = path.join(__dirname, '.cache');
			this.dbdata = fs.existsSync(this.dbpath) ? fs.readJsonSync(this.dbpath) : {};
		}
		get(source){
			return this.dbdata[source.join('')];
		}
		set(source){
			this.dbdata[source.join('')] = this.data(source);
		}
		save(){
			fs.outputJsonSync(this.dbpath, this.dbdata);
		}
		check(source=[]){
			const files = this.data(source);
			if (!Object.keys(files).length) return false;
			const data = this.get(source);
			if (!data) return true;
			return JSON.stringify(files) !== JSON.stringify(data);
		}
		update(source=[]){
			this.set(source);
			this.save();
		}
		data(source){
			const data = {};
			this.glob(source).forEach(filepath => {
				data[filepath] = this.mtime(filepath);
			});
			return data;
		}
		glob(source){
			const opt = {
				root: defaultConfig.sourcePath,
				nodir: true,
			};
			return _.flatten(source.map(pattern => glob.sync(pattern, opt)));
		}
		mtime(filepath){
			return fs.statSync(filepath).mtime.getTime();
		}
	};

	const generate = async function(cfg){
		const {source, option} = cfg;
		return new Promise(resolve => {
			gulp.src(source, {
				base: defaultConfig.sourcePath,
			})
			.pipe(spritesmith(option))
			.pipe(gulp.dest(__dirname))
			.on('finish', () => {
				resolve();
			});
		});
	};

	const run = async function(cfg){
		const {source} = cfg;
		if (Cache.check(source)) {
			await generate(cfg);
			Cache.update(source);
			return true;
		}
		return false;
	};

	return {
		beforeBegin: async function(){
			const updated = await Promise.all(config.map(cfg => run.call(this, cfg)));
			if (updated.filter(v => v).length) {
				$.util.log(`'${$.util.colors.yellow('Sprite')}'模块已更新.`);
			}
		}
	};
};