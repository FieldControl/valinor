# sortAST

The `sortAST` function is used to alphabetically sort all of the nodes in a graphql `DocumentNode`.

## Usage

```ts
import { sortAST } from "@apollo/utils.sortast";

const sortedAST = sortAST(
  parse(`#graphql
  query Foo { c b a }
`),
);

print(sortedAST);
// query Foo { a b c }
```
