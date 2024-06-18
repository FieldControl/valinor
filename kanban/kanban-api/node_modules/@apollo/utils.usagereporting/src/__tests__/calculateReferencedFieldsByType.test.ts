import { buildASTSchema, type DocumentNode, validate } from "graphql";
import gql from "graphql-tag";
import { calculateReferencedFieldsByType } from "..";

const schema = buildASTSchema(gql`
  type Query {
    f1: Int
    f2: Int
    a: A
    aa: A
    myInterface: MyInterface
  }

  type A implements MyInterface {
    x: ID
    y: String!
  }

  interface MyInterface {
    x: ID
  }
`);

function validateAndCalculate({
  document,
  resolvedOperationName = null,
}: {
  document: DocumentNode;
  resolvedOperationName?: string | null;
}) {
  // First validate the document, since calculateReferencedFieldsByType expects
  // that.
  expect(validate(schema, document)).toStrictEqual([]);
  return calculateReferencedFieldsByType({
    schema,
    document,
    resolvedOperationName,
  });
}

describe("calculateReferencedFieldsByType", () => {
  it("basic", () => {
    expect(
      validateAndCalculate({
        document: gql`
          {
            f1
          }
        `,
      }),
    ).toMatchInlineSnapshot(`
      {
        "Query": {
          "fieldNames": [
            "f1",
          ],
          "isInterface": false,
        },
      }
    `);
  });

  it("aliases use actual field name", () => {
    expect(
      validateAndCalculate({
        document: gql`
          {
            aliased: f1
          }
        `,
      }),
    ).toMatchInlineSnapshot(`
      {
        "Query": {
          "fieldNames": [
            "f1",
          ],
          "isInterface": false,
        },
      }
    `);
  });

  it("multiple operations and fragments", () => {
    expect(
      validateAndCalculate({
        document: gql`
          query Q1 {
            f1
            a {
              ...AStuff
            }
          }
          query Q2 {
            f2
            aa {
              ...OtherAStuff
            }
          }
          fragment AStuff on A {
            x
          }
          fragment OtherAStuff on A {
            y
          }
        `,
        resolvedOperationName: "Q1",
      }),
    ).toMatchInlineSnapshot(`
      {
        "A": {
          "fieldNames": [
            "x",
          ],
          "isInterface": false,
        },
        "Query": {
          "fieldNames": [
            "f1",
            "a",
          ],
          "isInterface": false,
        },
      }
    `);
  });

  it("interfaces", () => {
    expect(
      validateAndCalculate({
        document: gql`
          query {
            myInterface {
              x
            }
          }
        `,
      }),
    ).toMatchInlineSnapshot(`
      {
        "MyInterface": {
          "fieldNames": [
            "x",
          ],
          "isInterface": true,
        },
        "Query": {
          "fieldNames": [
            "myInterface",
          ],
          "isInterface": false,
        },
      }
    `);
  });

  it("interface with fragment", () => {
    expect(
      validateAndCalculate({
        document: gql`
          query {
            myInterface {
              x
              ... on A {
                y
              }
            }
          }
        `,
      }),
    ).toMatchInlineSnapshot(`
      {
        "A": {
          "fieldNames": [
            "y",
          ],
          "isInterface": false,
        },
        "MyInterface": {
          "fieldNames": [
            "x",
          ],
          "isInterface": true,
        },
        "Query": {
          "fieldNames": [
            "myInterface",
          ],
          "isInterface": false,
        },
      }
    `);
  });
});

it("interface with fragment that uses interface field", () => {
  expect(
    validateAndCalculate({
      document: gql`
        query {
          myInterface {
            ... on A {
              # Even though x exists on the interface, we only want this to
              # count towards A.x below, because this operation would work just
              # as well if x were removed from the interface as long as it was
              # left on A.
              x
            }
          }
        }
      `,
    }),
  ).toMatchInlineSnapshot(`
    {
      "A": {
        "fieldNames": [
          "x",
        ],
        "isInterface": false,
      },
      "Query": {
        "fieldNames": [
          "myInterface",
        ],
        "isInterface": false,
      },
    }
  `);
});

it("using field both with interface and object should work", () => {
  expect(
    validateAndCalculate({
      document: gql`
        query {
          myInterface {
            x
            ... on A {
              x
            }
          }
        }
      `,
    }),
  ).toMatchInlineSnapshot(`
    {
      "A": {
        "fieldNames": [
          "x",
        ],
        "isInterface": false,
      },
      "MyInterface": {
        "fieldNames": [
          "x",
        ],
        "isInterface": true,
      },
      "Query": {
        "fieldNames": [
          "myInterface",
        ],
        "isInterface": false,
      },
    }
  `);
});

it("using field multiple times (same level or otherwise) de-dupes", () => {
  expect(
    validateAndCalculate({
      document: gql`
        query {
          a1: a {
            y
          }
          a2: a {
            y
          }
        }
      `,
    }),
  ).toMatchInlineSnapshot(`
    {
      "A": {
        "fieldNames": [
          "y",
        ],
        "isInterface": false,
      },
      "Query": {
        "fieldNames": [
          "a",
        ],
        "isInterface": false,
      },
    }
  `);
});
