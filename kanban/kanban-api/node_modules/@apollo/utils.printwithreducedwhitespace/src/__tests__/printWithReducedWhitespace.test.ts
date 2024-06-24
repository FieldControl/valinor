import gql from "graphql-tag";
import { printWithReducedWhitespace } from "..";

describe("printWithReducedWhitespace", () => {
  it("removes whitespace", () => {
    // Note: there's a tab after "tab->", which prettier wants to keep as a
    // literal tab rather than \t.  In the output, there should be a literal
    // backslash-t.
    const document = gql`
      query Foo($a: Int) {
        user(
          name: "   tab->	yay"
          other: """
          apple
             bag
          cat
          """
        ) {
          name
        }
      }
    `;

    expect(printWithReducedWhitespace(document)).toBe(
      `query Foo($a:Int){user(name:"   tab->\\tyay"other:"apple\\n   bag\\ncat"){name}}`,
    );
  });
});
