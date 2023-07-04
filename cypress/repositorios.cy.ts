describe('RepositoriosComponent', () => {
  beforeEach(() => {
    cy.window().then((win) => {
      win.location.href = 'http://localhost:4200/repositorios';
    });
  });

  it('deve exibir o campo de busca e o botão', () => {
    cy.get('#search-input').should('exist');
    cy.get('#btn-buscar').should('exist');
  });

  it('deve exibir uma lista de repositórios após a busca', () => {
    cy.get('#search-input').type('exemplo-repo');
    cy.get('#btn-buscar').click();

    cy.get('.ag-theme-balham').should('exist');
    cy.get('.ag-row').should('have.length.greaterThan', 0);
  });

  it('deve abrir um repositório ao ser clicado', () => {
    cy.get('#search-input').type('exemplo-repo');
    cy.get('#btn-buscar').click();

    cy.get('.ag-row').first().within(() => {
      cy.get('.ag-cell').eq(0).click();
    });

    cy.url().should('include', 'github.com');
  });
});



