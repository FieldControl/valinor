/* Teste de integração */

describe('GitHub Repos Search', function () {

    /* Teste para verificar se a API está enviando corretamente os resultados à aplicação */

    it('deve mostrar os resultados da busca', function () {
        browser.get('/');
        element(by.model('searchQuery')).sendKeys('angular');
        element(by.buttonText('Search')).click();
        expect(element.all(by.repeater('repo in repos')).count()).toBeGreaterThan(0);
    });
});
