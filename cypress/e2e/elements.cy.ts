describe('App', () => {
    beforeEach(() => {
      cy.visit('/');
    });
  
  /* Verifica se tem o título marvel no head da página */
  it(`should have as title 'marvel'`, () => {
    cy.title().should('eq', 'Marvel');
  });

  /* verifica se a logo foi carregada */
  it('should load the logo image correctly', () => {
    cy.get('#imgLogo')
      .should('be.visible')
      .and(($img) => {
        expect($img[0].naturalWidth).to.be.greaterThan(0);
      });
    cy.viewport('iphone-6');
    cy.get('#imgLogo')
      .should('be.visible')
      .and(($img) => {
        expect($img[0].naturalWidth).to.be.greaterThan(0);
      });
  });

  /* verifica se o img do botão darkmode foi carregado corretamente */
  it('should load the button dark mode image correctly', () => {
    cy.get('#imgDarkMode')
      .should('be.visible')
      .and(($img) => {
        expect($img[0].naturalWidth).to.be.greaterThan(0);
      });
    cy.viewport('iphone-6');
    cy.get('#imgDarkMode')
      .should('be.visible')
      .and(($img) => {
        expect($img[0].naturalWidth).to.be.greaterThan(0);
      });
  });

  /* Verifica se o h1 da página foi carregado com o título "Marvel" */
  it('should render title', () => {
    cy.get('#h1Title').contains('Marvel');
    cy.viewport('iphone-6');
    cy.get('#h1Title').contains('Marvel');
  });

  /* Verifica se o botão DarkMode está com o fundo transparente */
  it('should have transparent background on buttonDarkMode', () => {
    cy.get('#buttonDarkMode').should(
      'have.css',
      'background-color',
      'rgba(0, 0, 0, 0)'
    );
    cy.viewport('iphone-6');
    cy.get('#buttonDarkMode').should(
      'have.css',
      'background-color',
      'rgba(0, 0, 0, 0)'
    );
  });
});