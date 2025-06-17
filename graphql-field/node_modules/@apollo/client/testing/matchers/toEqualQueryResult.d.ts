import type { MatcherFunction } from "expect";
import type { QueryResult } from "../../react/index.js";
declare const CHECKED_KEYS: readonly ["loading", "error", "errors", "data", "variables", "networkStatus", "errors", "called", "previousData"];
export type CheckedKeys = (typeof CHECKED_KEYS)[number];
export declare const toEqualQueryResult: MatcherFunction<[
    queryResult: Pick<QueryResult<any, any>, CheckedKeys>
]>;
export {};
//# sourceMappingURL=toEqualQueryResult.d.ts.map