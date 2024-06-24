import * as allExports from "..";

it("exports hashing functions", () => {
  expect(Object.keys(allExports).length).toBe(1);
  expect(typeof allExports.createHash).toBe("function");
});
