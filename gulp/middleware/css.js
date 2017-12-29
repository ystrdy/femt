const $ = require('gulp-load-plugins')();
const path = require('path');
const fs = require('fs');
const Datauri = require('datauri').sync;
const through = require('through2');

module.exports = function(flow){
	const {util, defaultConfig} = flow;

	const short = util.createShortHelper(defaultConfig, '.scss');

	const inlines = [];

	const importer = function(url, prev, done){
		const filepath = short(url, short(prev));
		fs.readFile(filepath, (error, buffer) => {
			let contents = String(buffer).replace(/\binline\b\(['"]?(.+?)['"]?\)/ig, (_, src) => {
				const dirpath = path.dirname(filepath);
				const realpath = path.resolve(dirpath, src);
				inlines.push(realpath);
				return `url('${Datauri(realpath)}')`;
			});
			done({contents});
		});
	};

	const GLOB_PATHS = ['pages/**/*.scss'];
	const filter = $.filter(GLOB_PATHS.map(v => path.join(defaultConfig.sourcePath, v)), {restore: true});
	return {
		sort: -29,
		beforeBegin: async () => GLOB_PATHS,
		afterBegin: async () => {
			let plugins =  [
					filter,
					$.sass({importer}),
					$.autoprefixer(),
				];
			if (process.env.PRODUCTION) {
				// plugins.push($.cleanCss({compatibility: 'ie8'}));
			}
			plugins.push($.rename(path => {
				path.dirname = '/css/';
				path.extname = '.css';
			}));
			plugins.push(filter.restore);
			return plugins;
		},
		beforeEnd: async () => {
			return [
				/* 过滤掉inline的图片 */
				through.obj((file, enc, next) => {
					if (~inlines.indexOf(file.path)) {
						return next(null);
					}
					next(null, file);
				}),
			];
		},
	};
};