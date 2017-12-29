const path = require('path');
const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const spritesmith = require('gulp.spritesmith');
const glob = require('glob');
const _ = require('lodash');
const fs = require('fs-extra');

module.exports = function(flow){
	const {defaultConfig, util} = flow;

	const SCSS_TEMPLATE_PATH = path.join(__dirname, './.scss.template.handlebars');

	const config = function(config){
		return config.map(({source, output, inline}) => {
			if (inline) {
				inline = `${output}.png`;
			}
			return {
				source,
				option: {
					imgName: `${output}.png`,
					imgPath: `../images/${output}.png`,
					cssName: `${output}.scss`,
					cssTemplate: SCSS_TEMPLATE_PATH,
					padding: 10,
					cssHandlebarsHelpers: {
						filename: function(filename){
							const pathObj = path.parse(filename);
							return pathObj.name;
						},
					},
					cssOpts: {inline},
				},
			};
		});
	}([{
		source: ['**/sprites/[a-n]*.png'],
		output: 'icon',
		inline: true,
	}, {
		source: ['**/sprites/[o-z]*.png'],
		output: 'icon1',
	}]);

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
			.pipe(util.tinypng())
			.pipe(gulp.dest(__dirname))
			.on('finish', () => {
				resolve();
			});
		});
	};

	const run = async function(cfg){
		const {source} = cfg;
		const files = [
			...source,
			__filename,
			SCSS_TEMPLATE_PATH,
		];
		if (Cache.check(files)) {
			await generate(cfg);
			Cache.update(files);
			return true;
		}
		return false;
	};

	const update = async function(config){
		const results = await Promise.all(config.map(cfg => run.call(this, cfg)));
		const updated = !!results.filter(v => v).length;
		if (updated) {
			// update export
			const content = config.map(({option}) => {
				return `@import "${option.cssName}";`;
			}).join('\n');
			const filepath = path.join(__dirname, path.basename(__dirname)) + '.scss';
			fs.writeFileSync(filepath, content);
		}
		return updated;
	};

	return {
		beforeBegin: async function(){
			if (await update(config)) {
				$.util.log(`'${$.util.colors.yellow('Sprite')}'模块已更新.`);
			}
			return path.relative(defaultConfig.sourcePath, path.join(__dirname, '/*.png'));
		}
	};
};