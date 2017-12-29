const through = require('through2');
const _ = require('lodash');

const compress = function(files){
	return new Promise((resolve, reject) => {
		// 网络压缩

	});
};

module.exports = function(){
	const files = [];
	const transform = function(file, enc, next){
		const filepath = file.path;
		if (/\.(png|jpg)$/i.test(filepath)) {
			files.push(file);
		}
		next(null, file);
	};
	const flush = function(next){
		const chunks = _.chunk(files, 20);
		Promise.all(chunks.map(chunk => compress(chunk)))
			.then(() => next())
			.catch(() => next());
	};
	return through.obj(transform, flush);
};