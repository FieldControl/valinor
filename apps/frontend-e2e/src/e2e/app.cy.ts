describe('Kanban Board E2E', () => {
  beforeEach(() => cy.visit('/'));

  it('should display kanban board', () => {
    cy.get('app-root').should('exist');
    cy.get('router-outlet').should('exist');
  });
});
