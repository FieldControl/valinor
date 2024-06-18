import { createHash } from "..";

describe("createHash", () => {
  it("creates a hash", () => {
    expect(createHash("sha256").update("foo").digest("hex")).toEqual(
      "2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae",
    );
  });
});
