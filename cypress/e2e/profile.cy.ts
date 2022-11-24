describe("Profile", () => {
  it("should the profile page must have been loaded", () => {
    cy.visit("/characters/1011334");
    cy.visit("/comics/82970");
    cy.visit("/creators/2879");
    cy.visit("/events/329");
    cy.visit("/series/18454");
    cy.visit("/stories/171");
  });
});
