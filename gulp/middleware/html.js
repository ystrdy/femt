module.exports = function(flow){
	const {util} = flow;

	return {
		pattern: ['pages/**/*.swig'],
		sort: -30,
		afterBegin: async () => {
			await util.delay(1000);
			console.log('html');
		},
	};
};