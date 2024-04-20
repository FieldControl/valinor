describe('Teste inicial:', () => {
  it('Visita a página inicial', () => {
    //verifica se contém os elementos quando a pagina é renderizada;
    cy.visit('/')
    cy.contains('Desafio Kanban')
    cy.contains('Adicionar Tarefa');
    cy.contains('A Fazer');
    cy.contains('Em Progresso');
    cy.contains('Concluído');
    cy.contains('Tarefa 1 - Exemplo');
    cy.contains('Tarefa 2 - Exemplo');
    cy.contains('Tarefa 3 - Exemplo');
    cy.get('.content-wrapper').should('exist');
    cy.get('mat-icon').should('exist');
    cy.get('mat-card').should('exist');
  })
})
