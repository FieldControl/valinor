
module.exports = function(config) {
    config.set({
      frameworks: ['jasmine'],
      files: [
        'app/**/*.js', // Inclua os arquivos JS do seu projeto (seus scripts)
        'tests/**/*.spec.js' // Inclua os arquivos de teste
      ],
      browsers: ['Chrome'], // Escolha os navegadores em que deseja executar os testes
      reporters: ['progress'],
      singleRun: true,
      autoWatch: false
    });
  };