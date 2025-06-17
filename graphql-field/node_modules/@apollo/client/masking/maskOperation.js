import { invariant } from "../utilities/globals/index.js";
import { createFragmentMap, getFragmentDefinitions, getOperationDefinition, } from "../utilities/index.js";
import { maskDefinition } from "./maskDefinition.js";
import { MapImpl, SetImpl, warnOnImproperCacheImplementation, } from "./utils.js";
/** @internal */
export function maskOperation(data, document, cache) {
    var _a;
    if (!cache.fragmentMatches) {
        if (globalThis.__DEV__ !== false) {
            warnOnImproperCacheImplementation();
        }
        return data;
    }
    var definition = getOperationDefinition(document);
    invariant(definition, 51);
    if (data == null) {
        // Maintain the original `null` or `undefined` value
        return data;
    }
    return maskDefinition(data, definition.selectionSet, {
        operationType: definition.operation,
        operationName: (_a = definition.name) === null || _a === void 0 ? void 0 : _a.value,
        fragmentMap: createFragmentMap(getFragmentDefinitions(document)),
        cache: cache,
        mutableTargets: new MapImpl(),
        knownChanged: new SetImpl(),
    });
}
//# sourceMappingURL=maskOperation.js.map