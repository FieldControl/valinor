declare namespace Cypress {
  interface Chainable {
    startingEnvironment(): Chainable<void>;
  }
}

Cypress.Commands.add('startingEnvironment', () => {
  cy.exec('cd ../nest-api/ && docker-compose up -d');

  cy.exec(
    `docker exec -i nest_db psql -U docker -d apinestjs -c "TRUNCATE card, column_table, "user" RESTART IDENTITY;"`,
    {
      failOnNonZeroExit: false,
    }
  );

  cy.exec('cd ../nest-api/ && npm run start:dev', {
    failOnNonZeroExit: false,
  });

  cy.exec('ng s', {
    failOnNonZeroExit: false,
  });
});
