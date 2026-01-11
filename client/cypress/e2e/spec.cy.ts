describe('Fluxo Completo do Kanban', () => {
  // Antes de cada teste, visita a home
  beforeEach(() => {
    cy.visit('/');
  });

  it('Deve carregar a home e listar projetos', () => {
    cy.contains('Meus Quadros'); // Verifica título
    cy.contains('+ Novo Quadro'); // Verifica botão
  });

  it('Deve criar um novo quadro', () => {
    const boardName = 'Cypress Board ' + Date.now();
    
    // Abre modal
    cy.get('button').contains('+ Novo Quadro').click();
    
    // Digita no input 
    cy.get('input[formControlName="title"]').type(boardName);
    
    // Salva
    cy.get('button').contains('Salvar').click();

    // Verifica se apareceu na lista
    cy.contains(boardName).should('be.visible');
  });

  it('Deve entrar num quadro e criar uma coluna', () => {
    // Clica no primeiro board da lista
    cy.get('app-board-item').first().click();

    // Verifica se mudou de tela
    cy.url().should('include', '/board/');

    // Abre modal de coluna
    cy.contains('+ Adicionar Coluna').click();
    
    // Cria coluna
    cy.get('input[formControlName="title"]').type('Coluna Cypress');
    cy.get('button').contains('Salvar').click();

    // Verifica se a coluna apareceu
    cy.contains('Coluna Cypress').should('be.visible');
  });
});