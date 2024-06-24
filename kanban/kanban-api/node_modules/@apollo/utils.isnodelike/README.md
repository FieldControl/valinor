# isNodeLike

A simple constant to determine if the current environment is Node-like by
inspecting the `process` global for Node-specific properties.

## Usage

```ts
import { isNodeLike } from "@apollo/utils.isnodelike";

if (isNodeLike) {
  require("fs").readFileSync("foo");
}
```
