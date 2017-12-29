const $ = require('gulp-load-plugins')();
const config = require('./config');

exports.debug = function(text, block){
	const {debug} = config;
	if (debug) {
		if (block) {
			text = [
				'------------------------------------------------',
				text,
				'------------------------------------------------',
			].join('\n');
		}
		console.log($.util.colors.grey(text));
	}
};