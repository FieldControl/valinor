import { Slot } from "optimism";
import { invariant } from "../utilities/globals/index.js";
import { canUseWeakMap, canUseWeakSet } from "../utilities/index.js";
export var MapImpl = canUseWeakMap ? WeakMap : Map;
export var SetImpl = canUseWeakSet ? WeakSet : Set;
// Contextual slot that allows us to disable accessor warnings on fields when in
// migrate mode.
/** @internal */
export var disableWarningsSlot = new Slot();
var issuedWarning = false;
export function warnOnImproperCacheImplementation() {
    if (!issuedWarning) {
        issuedWarning = true;
        globalThis.__DEV__ !== false && invariant.warn(52);
    }
}
//# sourceMappingURL=utils.js.map