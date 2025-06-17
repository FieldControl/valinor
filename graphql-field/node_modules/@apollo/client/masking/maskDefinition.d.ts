import type { SelectionSetNode } from "graphql";
import type { FragmentMap } from "../utilities/index.js";
import type { ApolloCache } from "../cache/index.js";
interface MaskingContext {
    operationType: "query" | "mutation" | "subscription" | "fragment";
    operationName: string | undefined;
    fragmentMap: FragmentMap;
    cache: ApolloCache<unknown>;
    mutableTargets: WeakMap<any, any>;
    knownChanged: WeakSet<any>;
}
export declare function maskDefinition(data: Record<string, any>, selectionSet: SelectionSetNode, context: MaskingContext): any;
export {};
//# sourceMappingURL=maskDefinition.d.ts.map