/// <reference types="cypress" />

context('TESTE DO GITHUB SEARCH', () => {
    beforeEach(() => cy.visit('https://mmanhaes-styleguide.netlify.app/home'));

    it('Acessando a home do projeto e validando o título', () => {
        cy
            .get('[id="home-title"]')
            .as('homeTitle')
            .contains('Bem-vindo ao Styleguide!');
    });

    it('Clicando no botão para acessar o buscador', () => {
        cy
            .get('[id="gh-search-button"]')
            .as('ghSearchButton')
            .click();
    });

    it('Acessando o input e digitando um usuário válido', () => {
        cy
            .visit('https://mmanhaes-styleguide.netlify.app/gh-search')
            .get('[id="input-usuario"]')
            .as('inputUsuario')
            .type('momanhaes');
    });

    it('Clicando no botão para acessar os repositórios', () => {
        cy
            .visit('https://mmanhaes-styleguide.netlify.app/gh-search')
            .get('[id="input-usuario"]')
            .as('inputUsuario')
            .type('momanhaes')
            .get('[id="button-repos"]')
            .as('buttonRepos')
            .click();
    });
});