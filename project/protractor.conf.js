exports.config = {
    framework: 'jasmine',
    specs: ['tests/e2e/*.js'],
    capabilities: {
        browserName: 'firefox' // Ajuste para o navegador desejado
    },
    baseUrl: 'http://localhost:8080'  // Ajuste o URL conforme o necessário
};
