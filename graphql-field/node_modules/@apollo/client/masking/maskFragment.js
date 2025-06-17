import { Kind } from "graphql";
import { MapImpl, SetImpl, warnOnImproperCacheImplementation, } from "./utils.js";
import { invariant } from "../utilities/globals/index.js";
import equal from "@wry/equality";
import { maskDefinition } from "./maskDefinition.js";
import { createFragmentMap, getFragmentDefinitions, } from "../utilities/index.js";
/** @internal */
export function maskFragment(data, document, cache, fragmentName) {
    if (!cache.fragmentMatches) {
        if (globalThis.__DEV__ !== false) {
            warnOnImproperCacheImplementation();
        }
        return data;
    }
    var fragments = document.definitions.filter(function (node) {
        return node.kind === Kind.FRAGMENT_DEFINITION;
    });
    if (typeof fragmentName === "undefined") {
        invariant(fragments.length === 1, 49, fragments.length);
        fragmentName = fragments[0].name.value;
    }
    var fragment = fragments.find(function (fragment) { return fragment.name.value === fragmentName; });
    invariant(!!fragment, 50, fragmentName);
    if (data == null) {
        // Maintain the original `null` or `undefined` value
        return data;
    }
    if (equal(data, {})) {
        // Return early and skip the masking algorithm if we don't have any data
        // yet. This can happen when cache.diff returns an empty object which is
        // used from watchFragment.
        return data;
    }
    return maskDefinition(data, fragment.selectionSet, {
        operationType: "fragment",
        operationName: fragment.name.value,
        fragmentMap: createFragmentMap(getFragmentDefinitions(document)),
        cache: cache,
        mutableTargets: new MapImpl(),
        knownChanged: new SetImpl(),
    });
}
//# sourceMappingURL=maskFragment.js.map