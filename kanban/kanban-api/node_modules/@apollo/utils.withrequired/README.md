# WithRequired type

This package defines the TypeScript utility type `WithRequired`. It transforms a type that has one or more optional fields into a type where those fields are required.

For example:

```
import { WithRequired } from '@apollo/utils.withrequired';

interface HasSomeOptionals {
    foo: number;
    bar?: string;
    baz?: boolean;
    quux?: string;
}

type MoreRequired = WithRequired<HasSomeOptions, 'bar' | 'baz'>;
```

The `MoreRequired` type is like `HasSomeOptionals`, but `bar` and `baz` are now required rather than optional. `quux` remains optional.
