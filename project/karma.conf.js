module.exports = function (config) {
    config.set({
        frameworks: ['jasmine'],
        browsers: ['Chrome'],
        files: [
            'https://ajax.googleapis.com/ajax/libs/angularjs/1.8.2/angular.min.js',
            'https://ajax.googleapis.com/ajax/libs/angularjs/1.8.2/angular-mocks.js',
            './assets',
            'app.js',
            'controllers.js',
            'services.js',
            'tests/**/*.spec.js'  // Testes unitários
        ],
        singleRun: true
    });
};
