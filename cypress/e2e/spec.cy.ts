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

  /* Verifica se o Ligth Theme está funcionando conforme esperado */
  it('should have the correct background color for light theme', () => {
    cy.get('mat-toolbar')
      .should('have.css', 'background-color', 'rgb(233, 30, 99)');
    cy.viewport('iphone-6');
    cy.get('mat-toolbar')
      .should('have.css', 'background-color', 'rgb(233, 30, 99)');
  });

  /* Verifica se o Dark Theme está funcionando conforme esperado */
  it('should have the correct background color for dark theme', () => {
    cy.get('#buttonDarkMode').click();
    cy.get('mat-toolbar')
      .should('have.css', 'background-color', 'rgb(158, 158, 158)');
    cy.get('#buttonDarkMode').click();
    cy.viewport('iphone-6');
    cy.get('#buttonDarkMode').click();
    cy.get('mat-toolbar')
      .should('have.css', 'background-color', 'rgb(158, 158, 158)');
  });

  /* Verifica se o Ligth Theme está funcionando conforme esperado, mesmo após clicar duas vezes no botão */
  it('should have the correct background color for light theme', () => {
    cy.get('#buttonDarkMode').click();
    cy.get('#buttonDarkMode').click();
    cy.get('mat-toolbar')
      .should('have.css', 'background-color', 'rgb(233, 30, 99)');
    cy.viewport('iphone-6');
    cy.get('#buttonDarkMode').click();
    cy.get('#buttonDarkMode').click();
    cy.get('mat-toolbar')
      .should('have.css', 'background-color', 'rgb(233, 30, 99)');
  });
});