const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const path = require('path');

module.exports = function(flow){
	const {cache, defaultConfig} = flow;

	const download = async options => {
		return new Promise(resolve => {
			Object.keys(options).forEach(name => {
				options[name] = options[name].join(',');
			});
			$.remoteSrc(['polyfill.js'], {
				base: 'https://cdn.polyfill.io/v2/',
				requestOptions: {
					headers: {
						'user-agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.79 Safari/537.36'
					},
					qs: options
				}
			})
			.pipe($.rename(path.join(__dirname, 'Polyfill.js')))
			.pipe(gulp.dest('/'))
			.on('finish', () => {
				resolve();
			});
		});
	};

	return {
		beforeBegin: async function(){
			const configPath = path.resolve(__dirname, './.config.json');
			const config = require(configPath);
			if (await cache.check(configPath)) {
				await download(config);
				$.util.log(`'${$.util.colors.yellow('Polyfill')}'模块已更新.`);
				cache.update(configPath);
			}
		},
	};
};