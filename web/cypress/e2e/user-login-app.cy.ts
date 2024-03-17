describe('User Login', () => {
  beforeEach(() => {
    cy.clearAllCookies();
    cy.visit('/');
  });

  it('should not be possible to log in with an not existing account', () => {
    cy.get('form').should('exist');
    cy.get('input[placeholder="Email"]').type('johndoe@email.com');
    cy.get('input[placeholder="Senha"]').type('123345');
    cy.contains('Fazer login').click();
    cy.location('pathname').should('equal', '/kanban');
  });

  it('should must be possible to log in with an existing account', () => {
    cy.get('form').should('exist');
    cy.get('input[placeholder="Email"]').type('johndoe@email.com');
    cy.get('input[placeholder="Senha"]').type('123');
    cy.contains('Fazer login').click();
    cy.contains('Credenciais inválidas!').should('exist');
  });
});
