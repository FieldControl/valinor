describe('App', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  /* Verifica se a imagem tá a esquerda */
  it('should position the logo image on the left', () => {
    cy.get('#imgLogo').then(($img) => {
      expect($img.position().left).to.be.closeTo(0, 49);
    });
    cy.viewport('iphone-6');
    cy.get('#imgLogo').then(($img) => {
      expect($img.position().left).to.be.closeTo(0, 49);
    });
  });

  /* Verifica se o título está no meio */
  it('should position the title in the center', () => {
    cy.get('#h1Title').then(($title) => {
      const titleWidth = $title.width();
      const titleLeft = $title.position().left;
      cy.window().then(($window) => {
        const windowWidth = $window.innerWidth;
        const titleCenter = titleLeft + titleWidth / 2;
        expect(titleCenter).to.be.greaterThan(windowWidth * 0.4);
        expect(titleCenter).to.be.lessThan(windowWidth * 0.6);
      });
    });
    cy.viewport('iphone-6');
    cy.get('#h1Title').then(($title) => {
      const titleWidth = $title.width();
      const titleLeft = $title.position().left;
      cy.window().then(($window) => {
        const windowWidth = $window.innerWidth;
        const titleCenter = titleLeft + titleWidth / 2;
        expect(titleCenter).to.be.greaterThan(windowWidth * 0.4);
        expect(titleCenter).to.be.lessThan(windowWidth * 0.6);
      });
    });
  });

  /* Verifica se o botão de DarkMode está a direita */
  it('should position the toggle theme button on the right', () => {
    cy.get('#buttonDarkMode').then(($button) => {
      const buttonWidth = $button.width();
      const buttonLeft = $button.position().left;
      cy.window().then(($window) => {
        const windowWidth = $window.innerWidth;
        const buttonRight = buttonLeft + buttonWidth;
        expect(buttonRight).to.be.greaterThan(windowWidth * 0.7);
        expect(buttonRight).to.be.lessThan(windowWidth);
      });
    });
    cy.viewport('iphone-6');
    cy.get('#buttonDarkMode').then(($button) => {
      const buttonWidth = $button.width();
      const buttonLeft = $button.position().left;
      cy.window().then(($window) => {
        const windowWidth = $window.innerWidth;
        const buttonRight = buttonLeft + buttonWidth;
        expect(buttonRight).to.be.greaterThan(windowWidth * 0.7);
        expect(buttonRight).to.be.lessThan(windowWidth);
      });
    });
  });
});