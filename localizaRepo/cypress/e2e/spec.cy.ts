describe("Visit app localizaRepo", () => {
  it("Visits the initial project page", () => {
    cy.visit("/");
  });
});

describe("Verify components", () => {
  it("Should be exist attr with class logo", () => {
    cy.get(".logo");
  });

  it("Should be exist class in component header", () => {
    cy.get(".header");
  });

  it("Should be exist input field must exist and must be enabled for typing", () => {
    cy.get(".input").type("cypress");
  });

  it("Should be exist button search and must be enabled for click", () => {
    cy.get(".icon-search");
  });
});

describe("Search a terms", () => {
  it("Should be exist button search and must be enabled for click", () => {
    cy.get(".icon-search").click();
  });

  it("Should be make a search for a term and check status of the response", () => {
    cy.intercept({
      url: "https://api.github.com/search/repositories?**&&page=1",
      query: { q: "cypress" },
    }).as("search");

    cy.wait("@search").then((xhr) => {
      expect(xhr.response?.statusCode).be.eq(200);
    });
  });

  it("Should be must exist after term search a repo-card class", () => {
    cy.get(".repo-card");
  });
});
