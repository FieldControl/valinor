describe('App test', () => {
  it('Should be able to access URL', () => {
    cy.visit('http://localhost:4200');
  });

  it('Should be exists a div with class name no-data', () => {
    cy.get('.no-data');
  });

  it('Should be exists and should be able to type some text on input with class search', () => {
    cy.get('.search').type('angular');
  });

  it('Should be exists a form and should be able to submit', () => {
    cy.get('form').submit();
    cy.intercept('https://api.github.com', {
      fixture: '../fixtures/angular.json'
    });    
  });
  
  it('Should be exists a div with class name data', () => {
    cy.get('.data');
  });
  
  it('Should be exists a pagination-control', () => {
    cy.get('pagination-controls');
  });

  it('Should be exists next button on pagination and able to click them', () => {
    cy.get('.pagination-next > a').click();
    cy.intercept('https://api.github.com', {
      fixture: '../fixtures/angular2.json'
    });    
  });

  it('Should be exists a div with class name data', () => {
    cy.get('.data');
  });

  it('Should be exists and able to clear the input with class name search', () => {
    cy.get('.search').clear();
  });

  it('Should be exists and able to submit the form', () => {
    cy.get('form').submit();
    cy.intercept('https://api.github.com', {
      fixture: '../fixtures/error.json'
    });    
  });

  it('Should be exists a snack bar with class name mat-snack-bar-container', () => {
    cy.get('.mat-snack-bar-container');
  });

  it('Should be exists and able to type some text in input with class name search', () => {
    cy.get('.search').type('7k7k7k7k7k7k7k7k7k7k7k7k7k7k');
  });

  it('Should be exists and able to submit the form', () => {
    cy.get('form').submit();
    cy.intercept('https://api.github.com', {
      fixture: '../fixtures/notExists.json'
    });    
  });

  it('Should be exists a div with class name no-data', () => {
    cy.get('.no-data')
  });
});
