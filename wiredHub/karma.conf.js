module.exports = function(config) 
{
	config.set({
		frameworks: ['jasmine'],
		files: [
			'node_modules/angular/angular.js',
			'node_modules/angular-mocks/angular-mocks.js',
			'app/app.js',
			'app/services/githubService.js',
			'app/components/myController/myController.js',
			'tests/*.spec.js'
		],
		browsers: ['Chrome', 'Firefox'],
	});
};
