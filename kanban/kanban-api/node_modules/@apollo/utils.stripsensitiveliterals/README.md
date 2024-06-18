# stripSensitiveLiterals

The `stripSensitiveLiterals` function is used to remove string and numeric
literals from a graphql `DocumentNode` which could be sensitive. Consider using
variables instead!

## Usage

```ts
import { stripSensitiveLiterals } from "@apollo/utils.stripsensitiveliterals";

stripSensitiveLiterals(
  parse(`#graphql
  query User {
    user(name: "Ada Lovelace", age: 31, ids: ["1", "2", "3"]) 
  }
`),
);
/**
  query User {
    user(name: "", age: 0, ids: ["", "", ""]) 
  }
*/
```
