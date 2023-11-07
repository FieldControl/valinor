/* eslint-disable no-undef */

beforeEach(() => {
  cy.viewport(1920, 1080)
  Cypress.config('defaultCommandTimeout', 10000)
  cy.visit('http://127.0.0.1:5173/')
  cy.wait(2000)
  cy.get('div').contains('Issues').click()
  cy.wait(10000)
})

describe('issues window', () => {
  it('search to issues', () => {
    cy.get('input[placeholder="Digite aqui o nome do repositório"]').type(
      'FieldControl/valinor',
    )
    cy.get('button').contains('Buscar').click()
  })
})
