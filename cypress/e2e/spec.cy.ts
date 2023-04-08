describe('App', () => {
  beforeEach(() => {
    cy.visit('/');
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
      .should('have.css', 'background-color', 'rgb(63, 81, 181)');
    cy.viewport('iphone-6');
    cy.get('#buttonDarkMode').click();
    cy.get('#buttonDarkMode').click();
    cy.get('mat-toolbar')
      .should('have.css', 'background-color', 'rgb(63, 81, 181)');
  });

  /* Verifica se o filtro de quantidade por página está funcionando */
  it('should have the same number of results per page as the value of the mat-slider', () => {
    cy.window()
      .its('appComponent')
      .then((appComponent) => {
        // Obtém o valor do mat-slider
        const matSliderValue = appComponent.resultsPerPage;
        // Verifica se o número de resultados por página é igual ao valor do mat-slider
        cy.get('mat-paginator')
          .find('.mat-mdc-paginator-page-size-value')
          .should('have.text', matSliderValue.toString());
      });
  });

  /* Verifica se ao filtrar para 20 se aparece os 20 */
  it('should change the number of results per page to 20 when the user selects the third tick mark on the mat-slider', () => {
    // Simula o usuário pressionando a tecla de seta para a direita três vezes
    cy.get('.mdc-slider__input')
      .focus()
      .click()
      .trigger('change');
    cy.wait(5000); // espera por 5 segundos
    // Verifica se o número de resultados por página é igual a 20
    cy.get('mat-paginator')
      .find('.mat-mdc-paginator-page-size-value')
      .should('have.text', '20');
  });
});