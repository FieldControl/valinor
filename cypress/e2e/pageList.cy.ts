describe("PageList", () => {
  it("the list must have been loaded", () => {
    cy.visit("/characters");
    cy.visit("/comics");
    cy.visit("/creators");
    cy.visit("/events");
    cy.visit("/series");
    cy.visit("/stories");
    cy.get(".listFilled");
  });
  it("should filter list by the search by name", () => {
    cy.visit("/characters");
    const text = "tho";
    cy.get("#name").type(text, { force: true });
    cy.get(".listFilled");
    cy.contains("Thor");
  });
  it("should next items of pagination list", () => {
    cy.visit("/characters");
    cy.contains("Next").click();
    cy.get(".listFilled");
  });
});
