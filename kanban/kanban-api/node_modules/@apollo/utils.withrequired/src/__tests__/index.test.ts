import type { WithRequired } from "..";

// This "test suite" actually does all its work at compile time.
function isWRFoo(_: WRFoo) {}

interface Foo {
  alwaysOptional?: number;
  startsOutOptional?: number;
  alsoStartsOutOptional?: string;
  alwaysRequired: string;
}

type WRFoo = WithRequired<Foo, "startsOutOptional" | "alsoStartsOutOptional">;

it("can plug in all now-required fields", () => {
  isWRFoo({
    startsOutOptional: 5,
    alsoStartsOutOptional: "asdf",
    alwaysRequired: "bla",
  });
});

it("now-required fields are required", () => {
  // @ts-expect-error
  isWRFoo({
    startsOutOptional: 5,
    alwaysRequired: "bla",
  });
});
