/// <reference types="cypress" />

context('TESTE DA PÁGINA DE CORES', () => {
    beforeEach(() => cy.visit('https://mmanhaes-styleguide.netlify.app/colors'));

    it('Validando o título da página', () => {
        cy
            .get('[id="colors-title"]')
            .as('colorsTitle')
            .contains('Colors');
    });

    it('Validando se a cor primária foi carregada', () => {
        cy
            .get('[id="color-primary"]')
            .as('colorPrimary')
            .contains('color-primary')
            .get('[id="hex-color-primary"]')
            .as('hexColorPrimary')
            .contains('#004D40');
    });

    it('Validando se a cor secundária foi carregada', () => {
        cy
            .get('[id="color-secondary"]')
            .as('colorSecondary')
            .contains('color-secondary')
            .get('[id="hex-color-secondary"]')
            .as('hexColorSecondary')
            .contains('#FFF9C4');
    });

    it('Validando se a cor terciária foi carregada', () => {
        cy
            .get('[id="color-terciery"]')
            .as('colorTerciery')
            .contains('color-terciery')
            .get('[id="hex-color-terciery"]')
            .as('hexColorTerciery')
            .contains('#c89666');
    });

    it('Validando se a cor do hover foi carregada', () => {
        cy
            .get('[id="color-primary-hover"]')
            .as('colorPrimaryHover')
            .contains('color-primary-hover')
            .get('[id="hex-color-primary-hover"]')
            .as('hexColorPrimaryHover')
            .contains('#00796B');
    });

    it('Validando se a cor branca foi carregada', () => {
        cy
            .get('[id="color-white"]')
            .as('colorWhite')
            .contains('color-white')
            .get('[id="hex-color-white"]')
            .as('hexColorWhite')
            .contains('#ffffff');
    });

    it('Validando se a cor preta foi carregada', () => {
        cy
            .get('[id="color-black"]')
            .as('colorBlack')
            .contains('color-black')
            .get('[id="hex-color-black"]')
            .as('hexColorBlack')
            .contains('#000000');
    });

    it('Validando se a cor do background foi carregada', () => {
        cy
            .get('[id="color-grey-bg"]')
            .as('colorGreyBg')
            .contains('color-grey-bg')
            .get('[id="hex-color-grey-bg"]')
            .as('hexColorGreyBg')
            .contains('#f1f1f1');
    });

    it('Validando se a cor verde foi carregada', () => {
        cy
            .get('[id="color-green"]')
            .as('colorGreen')
            .contains('color-green')
            .get('[id="hex-color-green"]')
            .as('hexColorGreen')
            .contains('#28c18d');
    });

    it('Validando se a cor vermelha foi carregada', () => {
        cy
            .get('[id="color-red"]')
            .as('colorRed')
            .contains('color-red')
            .get('[id="hex-color-red"]')
            .as('hexColorRed')
            .contains('#d23b3b');
    });

    it('Validando se a cor danger foi carregada', () => {
        cy
            .get('[id="color-danger"]')
            .as('colorDanger')
            .contains('color-danger')
            .get('[id="hex-color-danger"]')
            .as('hexColorDanger')
            .contains('#e73f5d');
    });

    it('Validando se a cor amarela foi carregada', () => {
        cy
            .get('[id="color-yellow"]')
            .as('colorYellow')
            .contains('color-yellow')
            .get('[id="hex-color-yellow"]')
            .as('hexColorYellow')
            .contains('#f9cc54');
    });

    it('Validando se a cor azul foi carregada', () => {
        cy
            .get('[id="color-blue"]')
            .as('colorBlue')
            .contains('color-blue')
            .get('[id="hex-color-blue"]')
            .as('hexColorBlue')
            .contains('#457ff0');
    });

    it('Validando se a cor cinza foi carregada', () => {
        cy
            .get('[id="color-grey"]')
            .as('colorGrey')
            .contains('color-grey')
            .get('[id="hex-color-grey"]')
            .as('hexColorGrey')
            .contains('#717171');
    });
});