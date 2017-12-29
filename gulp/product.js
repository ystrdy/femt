const WorkFlow = require('./flow');

module.exports = async function(){
	process.env.PRODUCTION = true;
	await new WorkFlow().init();
};