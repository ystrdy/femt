const path = require('path');
const glob = require('glob');

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

exports.getRelativeRoot = getRelativeRoot;
exports.getRelativeSource = getRelativeSource;
exports.getCompileFiles = getCompileFiles;
exports.delay = delay;