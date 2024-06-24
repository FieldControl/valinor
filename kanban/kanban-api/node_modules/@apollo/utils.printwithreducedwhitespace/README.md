# printWithReducedWhitespace

Prints a GraphQL AST with a minimal amount of whitespace. Consider using the
[`stripIgnoredCharacters`](https://github.com/graphql/graphql-js/blob/e9a81f2ba9020ec5fd0f67f5553ccabe392e95e8/src/utilities/stripIgnoredCharacters.ts) function from `graphql` instead of this function.

## Usage

```ts
import { printWithReducedWhitespace } from "@apollo/utils.operationregistrysignature";

const signature = operationRegistrySignature(
  parse(`#graphql
    query Foo {
      bar
    }
  `),
  "Foo",
  { preserveStringAndNumericLiterals: true },
);
```
