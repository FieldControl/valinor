/// <reference types="cypress" />

context('TESTE DA PÁGINA DE TIPOGRAFIA', () => {
    beforeEach(() => cy.visit('https://mmanhaes-styleguide.netlify.app/typography'));

    it('Validando o título da página', () => {
        cy
            .get('[id="typography-title"]')
            .as('typographyTitle')
            .contains('Typography');
    });

    it('Validando se o título da tipografia foi carregado', () => {
        cy
            .get('[id="typo-title"]')
            .as('typoTitle')
            .contains('Título');
    });

    it('Validando se o H1 da tipografia foi carregado', () => {
        cy
            .get('[id="typo-h1"]')
            .as('typoH1')
            .contains('H1');
    });

    it('Validando se o H2 da tipografia foi carregado', () => {
        cy
            .get('[id="typo-h2"]')
            .as('typoH2')
            .contains('H2');
    });

    it('Validando se o H3 da tipografia foi carregado', () => {
        cy
            .get('[id="typo-h3"]')
            .as('typoH3')
            .contains('H3');
    });

    it('Validando se o H4 da tipografia foi carregado', () => {
        cy
            .get('[id="typo-h4"]')
            .as('typoH4')
            .contains('H4');
    });

    it('Validando se o H5 da tipografia foi carregado', () => {
        cy
            .get('[id="typo-h5"]')
            .as('typoH5')
            .contains('H5');
    });

    it('Validando se o H6 da tipografia foi carregado', () => {
        cy
            .get('[id="typo-h6"]')
            .as('typoH6')
            .contains('H6');
    });

    it('Validando se o SPAN da tipografia foi carregado', () => {
        cy
            .get('[id="typo-span"]')
            .as('typoSpan')
            .contains('Span');
    });

    it('Validando se o PARÁGRAFO da tipografia foi carregado', () => {
        cy
            .get('[id="typo-p"]')
            .as('typoP')
            .contains('Parágrafo');
    });

    it('Validando se o LINK da tipografia foi carregado', () => {
        cy
            .get('[id="typo-link"]')
            .as('typoLink')
            .contains('Link');
    });
});