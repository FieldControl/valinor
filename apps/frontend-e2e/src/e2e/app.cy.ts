describe('Kanban Board E2E', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/columns', { fixture: 'columns.json' }).as(
      'getColumns'
    );
    cy.visit('/');
    cy.wait('@getColumns');
  });

  describe('Initial Load', () => {
    it('should display kanban board', () => {
      cy.get('app-kanban-board', { timeout: 10000 }).should('exist');
      cy.get('app-kanban-board').should('be.visible');
    });

    it('should display add column button', () => {
      cy.get('app-kanban-board').should('be.visible');
      cy.get('[data-testid="add-column-btn"]').should('be.visible');
    });

    it('should display columns', () => {
      cy.get('[data-testid="kanban-column"]').should('have.length', 3);
      cy.get('[data-testid="kanban-column"]')
        .first()
        .should('contain', 'To Do');
      cy.get('[data-testid="kanban-column"]')
        .eq(1)
        .should('contain', 'In Progress');
      cy.get('[data-testid="kanban-column"]').eq(2).should('contain', 'Done');
    });
  });

  describe('Column Management', () => {
    it('should open add column dialog', () => {
      cy.get('[data-testid="add-column-btn"]').click();
      cy.get('[data-testid="column-title-input"]').should('be.visible');
      cy.get('[data-testid="add-column-submit"]').should('be.visible');
    });
  });

  describe('Card Management', () => {
    it('should open add card form', () => {
      cy.get('[data-testid="add-card-btn"]').first().click();
      cy.get('[data-testid="card-title-input"]').should('be.visible');
      cy.get('[data-testid="add-card-submit"]').should('be.visible');
    });
  });

  describe('Drag and Drop', () => {
    it('should have draggable columns', () => {
      cy.get('[data-testid="kanban-column"]')
        .first()
        .should('have.attr', 'cdkDrag');
    });
  });
});
