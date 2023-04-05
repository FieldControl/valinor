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
  });

  /* Verifica se o h1 da página foi carregado com o título "Marvel" */
  it('should render title', () => {
    cy.get('#h1Title').contains('Marvel');
  });

  /* Verifica se o botão DarkMode está com o fundo transparente */
  it('should have transparent background on buttonDarkMode', () => {
    cy.get('#buttonDarkMode').should(
      'have.css',
      'background-color',
      'rgba(0, 0, 0, 0)'
    );
  });

  /* Verifica se o botão de DarkMode está alterando a variável do DarkTheme */
  it('should toggle DarkTheme variable when toggleTheme is called', () => {
    cy.window()
      .its('appComponent')
      .then((appComponent) => {
        expect(appComponent.DarkTheme).to.be.false;
        appComponent.toggleTheme();
        expect(appComponent.DarkTheme).to.be.true;
        appComponent.toggleTheme();
        expect(appComponent.DarkTheme).to.be.false;
      });
  });

  /* Verifica se o Dark Theme está funcionando conforme esperado */
  it('should have the correct background color for dark theme', () => {
    cy.get('#buttonDarkMode').click();
    cy.get('mat-toolbar')
      .should('have.css', 'background-color', 'rgb(158, 158, 158)');
  });

  /* Verifica se o Ligth Theme está funcionando conforme esperado */
  it('should have the correct background color for light theme', () => {
    cy.get('mat-toolbar')
      .should('have.css', 'background-color', 'rgb(233, 30, 99)');
  });
});