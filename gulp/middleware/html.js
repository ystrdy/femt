const $ = require('gulp-load-plugins')();
const path = require('path');
const fs = require('fs');
const swig = require('swig');
const through = require('through2');

module.exports = function(flow){
	const {defaultConfig, util} = flow;

	const short = util.createShortHelper(defaultConfig, '.swig');

	const loader = function(){
		const resolve = function(to, from){
			if (to) {
				return short(to);
			}
		};
		const load = function(identifier, callback){
			if (callback) {
				return fs.readFile(identifier, function(error, data){
					callback(error, data.toString());
				});
			}
			return fs.readFileSync(identifier).toString();
		};
		return {resolve, load};
	};
	/*
	const IncludeTag = function(){
		const include = {};
		const ignore = 'ignore';
		const missing = 'missing';
		const only = 'only';
		const withVar = 'with';
		const cache = {};

		include.parse = function(str, line, parser, types, stack, opts){
			let file, w;
			parser.on(types.STRING, function(token){
				if (!file) {
					file = token.match;
					this.out.push(file);
					return;
				}
				return true;
			});
			parser.on(types.VAR, function (token) {
				if (!file) {
					file = token.match;
					return true;
				}

				if (!w && token.match === withVar) {
					w = true;
					return;
				}

				if (w && token.match === only && this.prevToken.match !== withVar) {
					this.out.push(token.match);
					return;
				}

				if (token.match === ignore) {
					return false;
				}

				if (token.match === missing) {
					if (this.prevToken.match !== ignore) {
						throw new Error(`Unexpected token "${missing}" on line ${line}.`);
					}
					this.out.push(token.match);
					return false;
				}

				if (this.prevToken.match === ignore) {
					throw new Error(`Expected "${missing}" on line ${line} but found "${token.match}".`);
				}

				return true;
			});

			parser.on('end', function () {
				this.out.push(opts.filename || null);
				this.out.push(line);
			});

			return true;
		};
		include.compile = function (compiler, args) {
			const file = args.shift(),
				onlyIdx = args.indexOf(only),
				onlyCtx = onlyIdx !== -1 ? args.splice(onlyIdx, 1) : false,
				line = args.pop(),
				parentFile = (args.pop() || '').replace(/\\/g, '\\\\'),
				ignore = args[args.length - 1] === missing ? (args.pop()) : false,
				w = args.join('');
			let indent = '';
			if (parentFile) {
				let splits = cache[parentFile];
				if (!splits) {
					splits = cache[parentFile] = fs.readFileSync(parentFile).toString().split('\n');
				}
				let text = splits[line];
				console.log(text);
			}
			return (ignore ? '  try {\n' : '') +
			'_output += _swig.compileFile(' + file + ', {' +
			'resolveFrom: "' + parentFile + '"' +
			'})(' +
			((onlyCtx && w) ? w : (!w ? '_ctx' : '_utils.extend({}, _ctx, ' + w + ')')) +
			');\n' +
			(ignore ? '} catch (e) {}\n' : '');
		};
		return include;
	}();
	*/
	const swigPlugin = function(){
		return through.obj(function(file, enc, next){
			swig.setDefaults({
				cache: false,
				loader: loader(),
			});
			// swig.setTag('include', IncludeTag.parse, IncludeTag.compile, IncludeTag.ends, IncludeTag.block);
			const tpl = swig.compile(String(file.contents), {filename: file.path});
			const compiled = tpl({
				file: path.parse(file.path),
			});
			file.contents = new Buffer(compiled);
			next(null, file);
		});
	};
	const renamePlugin = function(){
		return $.rename(path => {
			path.dirname = '/';
			path.extname = '.html';
		});
	};
	const GLOB_PATHS = ['pages/**/*.swig'];
	const filter = $.filter(GLOB_PATHS.map(v => path.join(defaultConfig.sourcePath, v)), {restore: true});
	return {
		sort: -30,
		beforeBegin: async () => GLOB_PATHS,
		afterBegin: async () => {
			return [
				filter,
				swigPlugin(),
				renamePlugin(),
				filter.restore,
			];
		},
	};
};