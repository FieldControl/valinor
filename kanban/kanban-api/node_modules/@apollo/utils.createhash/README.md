# createHash

Equivalent to Node.js's `crypto.createHash`. Uses the Node.js builtin if
present, otherwise it falls back the the `sha.js` package's implementation.

## Usage

```ts
import { createHash } from "@apollo/utils.createhash";

createHash("sha256").update("foo").digest("hex");
```
