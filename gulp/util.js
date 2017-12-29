const path = require('path');
const glob = require('glob');
const through = require('through2');
const placeholders = require('placeholders');
const fs = require('fs');

const config = require('./config');

const getRelativeRoot = filepath => path.resolve(process.cwd(), filepath);

const getRelativeSource = filepath => getRelativeRoot(config.sourcePath, filepath);

const getCompileFiles = () => new Promise((resolve, reject) => {
	glob(config.compileName, {
		root: getRelativeSource('./'),
		nodir: true,
	}, (error, files) => {
		if (error) {
			reject(error);
		} else {
			resolve(files);
		}
	});
});

const delay = delay => new Promise(resolve => setTimeout(resolve, delay));

const createPlugin = (cbTransform, cbEnd) => through.obj(cbTransform, cbEnd);

const createShortHelper = function(config, ext){
	return function(short, parent){
		const regex = /^(\w+):/;
		let filepath = '';
		if (regex.test(short)) {
			const interpolate = placeholders({regex});
			const result = interpolate(short, config.shortMaps);
			filepath = path.resolve(config.sourcePath, result);
		} else {
			filepath = path.resolve(path.dirname(parent), short);
		}
		if (fs.statSync(filepath).isDirectory()) {
			let pathObj = path.parse(filepath);
			filepath += '/' + pathObj.base;
		}
		let extname = path.extname(filepath);
		if (!extname) {
			filepath += ext;
		}
		filepath = path.normalize(filepath);
		if (fs.statSync(filepath).isFile()) {
			return filepath
		}
	};
};

exports.getRelativeRoot = getRelativeRoot;
exports.getRelativeSource = getRelativeSource;
exports.getCompileFiles = getCompileFiles;
exports.delay = delay;
exports.createPlugin = createPlugin;
exports.createShortHelper = createShortHelper;
exports.tinypng = require('./middleware/tinypng');