describe('Kanban', () => {
  beforeEach(() => {
    cy.clearAllCookies();
    cy.visit('/');
    cy.get('form').should('exist');
    cy.get('input[placeholder="Email"]').type('johndoe@email.com');
    cy.get('input[placeholder="Senha"]').type('123');
    cy.contains('Fazer login').click();
    cy.location('pathname').should('equal', '/kanban');
  });

  it('should be possible to create a column', () => {
    cy.contains('Criar coluna').click();
    cy.get('input[placeholder="Titulo"]').type('Coluna de teste');
    cy.contains('Enviar').click();
  });

  it('should be possible to create a card', () => {
    cy.get('#btn-add-card').click();
    cy.get('input[placeholder="Titulo"]').type('Card de teste');
    cy.get('input[placeholder="Descrição"]').type('Apenas para teste');
    cy.get('#select-responsable').select('John Doe');
    cy.contains('Enviar').click();
    cy.contains('Card de teste').should('exist');
  });

  it('should be possible to change the column card', () => {
    cy.contains('Criar coluna').click();
    cy.get('input[placeholder="Titulo"]').type('Coluna de teste 2');
    cy.contains('Enviar').click();
    cy.get('#btn-alter-column-card').click();
    cy.get('#select-column').select('Coluna de teste');
    cy.contains('Enviar').click();
    cy.contains('Card de teste').should('exist');
  });

  it('should be possible to change the title and description of a card', () => {
    cy.get('#btn-alter-card').click();
    cy.get('#input-alter-title').clear().type('Alterado a coluna');
    cy.get('#input-alter-description').clear().type('Alterado a descrição');
    cy.contains('Enviar').click();
    cy.contains('Alterado a coluna').should('exist');
    cy.contains('Alterado a descrição').should('exist');
  });

  it('should be possible to change the title of a column', () => {
    cy.get('#btn-alter-column').click();
    cy.get('#input-alter-title-column').clear().type('Alterado o titulo');
    cy.contains('Enviar').click();
    cy.contains('Alterado o titulo').should('exist');
  });

  it('should be possible to delete a card', () => {
    cy.get('#btn-trash-card').click();
    cy.contains('Confirmar').click();
  });

  it('should be possible to delete a card', () => {
    cy.get('#btn-trash-column').click();
    cy.contains('Confirmar').click();
  });
});
