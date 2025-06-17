import { expect } from "@jest/globals";
import { toMatchDocument } from "./toMatchDocument.js";
import { toHaveSuspenseCacheEntryUsing } from "./toHaveSuspenseCacheEntryUsing.js";
import { toBeGarbageCollected } from "./toBeGarbageCollected.js";
import { toBeDisposed } from "./toBeDisposed.js";
import { toComplete } from "./toComplete.js";
import { toEmitApolloQueryResult } from "./toEmitApolloQueryResult.js";
import { toEmitAnything } from "./toEmitAnything.js";
import { toEmitError } from "./toEmitError.js";
import { toEmitFetchResult } from "./toEmitFetchResult.js";
import { toEmitMatchedValue } from "./toEmitMatchedValue.js";
import { toEmitNext } from "./toEmitNext.js";
import { toEmitValue } from "./toEmitValue.js";
import { toEmitValueStrict } from "./toEmitValueStrict.js";
import { toEqualApolloQueryResult } from "./toEqualApolloQueryResult.js";
import { toEqualFetchResult } from "./toEqualFetchResult.js";
import { toEqualQueryResult } from "./toEqualQueryResult.js";
expect.extend({
    toComplete: toComplete,
    toEmitApolloQueryResult: toEmitApolloQueryResult,
    toEmitAnything: toEmitAnything,
    toEmitError: toEmitError,
    toEmitFetchResult: toEmitFetchResult,
    toEmitMatchedValue: toEmitMatchedValue,
    toEmitNext: toEmitNext,
    toEmitValue: toEmitValue,
    toEmitValueStrict: toEmitValueStrict,
    toEqualApolloQueryResult: toEqualApolloQueryResult,
    toEqualFetchResult: toEqualFetchResult,
    toEqualQueryResult: toEqualQueryResult,
    toBeDisposed: toBeDisposed,
    toHaveSuspenseCacheEntryUsing: toHaveSuspenseCacheEntryUsing,
    toMatchDocument: toMatchDocument,
    toBeGarbageCollected: toBeGarbageCollected,
});
//# sourceMappingURL=index.js.map