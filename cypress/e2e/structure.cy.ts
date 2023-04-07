describe('App', () => {
  beforeEach(() => {
    cy.visit('/');
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
});