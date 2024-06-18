# dropUnusedDefinitions

Given an operation document and an operation name, this function will return a
new document with only the definitions required for the operation name provided.

If the provided operation name doesn't match any operation in the document,
`dropUnusedDefinitions` will return the original document.

## Usage

```ts
import { dropUnusedDefinitions } from "@apollo/utils.dropunuseddefinitions";

const operation = parse(`#graphql
  query Drop { ...DroppedFragment }
  fragment DroppedFragment on Query { abc }
  query Keep { ...KeptFragment }
  fragment KeptFragment on Query { def }
`);
const keepOperation = dropUnusedDefinitions(operation, "Keep");
/**
query Keep {
  ...KeptFragment
}

fragment KeptFragment on Query {
  def
}
*/
```
