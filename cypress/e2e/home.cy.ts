describe("Home", () => {
  beforeEach(() => {
    cy.visit("/");
  });
  it("should load the page", () => {
    cy.visit("/");
  });
  it("should load the page the menu", () => {
    cy.get("header");
  });
  it("should in the page the content and message Welcome!!!", () => {
    cy.get("#homeContent").should("contain", "Welcome!!!");
  });
  it("should in the page links", () => {
    cy.get("#links");
  });
  it("should go to character page", () => {
    cy.contains("Character").click();
    cy.url().should("include", "/character");
  });
});
