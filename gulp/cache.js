const MD5 = require('md5-file');
const fs = require('fs');
const config = require('./config');
const util = require('./util');

class Cache{
	constructor(){
		this.dbpath = util.getRelativeRoot(config.cachePath);
		this.dbdata = fs.existsSync(this.dbpath) ? JSON.parse(fs.readFileSync(this.dbpath)) : {};
	}
	getTS(filepath){
		return new Promise((resolve, reject) => {
			fs.stat(filepath, (error, stat) => {
				if (error) {
					reject(error);
				} else {
					resolve(stat.mtime.getTime());
				}
			});
		});
	}
	getMD5(filepath){
		return new Promise((resolve, reject) => {
			MD5(filepath, (error, hash) => {
				if (error) {
					reject(error);
				} else {
					resolve(hash);
				}
			});
		});
	}
	async get(filepath){
		if (filepath == null || this.dbdata[filepath] == null) {
			return false;
		}
		return this.dbdata[filepath];
	}
	async update(filepath){
		const {dbdata} = this;
		// 添加
		if (!dbdata[filepath]) {
			dbdata[filepath] = {};
		}
		// 更新
		const file = dbdata[filepath];
		const [ts, md5] = await Promise.all([
			this.getTS(filepath),
			this.getMD5(filepath),
		]);
		file.ts = ts;
		file.md5 = md5;
		// 保存
		return new Promise((resolve, reject) => {
			fs.writeFile(this.dbpath, JSON.stringify(this.dbdata), (error) => {
				if (error) {
					reject(error);
				} else {
					resolve();
				}
			});
		});
	}
	async check(filepath){
		const file = await this.get(filepath);
		if (!file) return true;
		const [ts, md5] = await Promise.all([
			this.getTS(filepath),
			this.getMD5(filepath),
		]);
		return file.ts !== ts || file.md5 !== md5;
	}
}

module.exports = new Cache();