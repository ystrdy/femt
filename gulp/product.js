const WorkFlow = require('./flow');

module.exports = async function(){
	process.env.PRODUCT = true;
	await new WorkFlow().init();
};