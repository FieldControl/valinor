describe('User Login', () => {
  beforeEach(() => {
    cy.clearAllCookies();
    cy.visit('/');
  });

  it('should not be possible to log in with an not existing account', () => {
    cy.get('form').should('exist');
    cy.contains('Registre-se').click();
    cy.location('pathname').should('equal', '/register');
    cy.get('input[placeholder="Nome"]').type('John Doe');
    cy.get('input[placeholder="Email"]').type('johndoe@email.com');
    cy.get('input[placeholder="Senha"]').type('123');
    cy.contains('Cadastrar').click();
    cy.location('pathname').should('equal', '/');
  });

  it('should not be possible to create an account with an email that already doesnt exist', () => {
    cy.get('form').should('exist');
    cy.contains('Registre-se').click();
    cy.location('pathname').should('equal', '/register');
    cy.get('input[placeholder="Nome"]').type('John Doe');
    cy.get('input[placeholder="Email"]').type('johndoe@email.com');
    cy.get('input[placeholder="Senha"]').type('123345');
    cy.contains('Cadastrar').click();
    cy.contains('Email já cadastrado !').should('exist');
  });
});
