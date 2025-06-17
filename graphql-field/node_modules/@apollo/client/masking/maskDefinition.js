import { Kind } from "graphql";
import { getFragmentMaskMode, maybeDeepFreeze, resultKeyNameFromField, } from "../utilities/index.js";
import { disableWarningsSlot } from "./utils.js";
import { invariant } from "../utilities/globals/index.js";
export function maskDefinition(data, selectionSet, context) {
    return disableWarningsSlot.withValue(true, function () {
        var masked = maskSelectionSet(data, selectionSet, context, false);
        if (Object.isFrozen(data)) {
            maybeDeepFreeze(masked);
        }
        return masked;
    });
}
function getMutableTarget(data, mutableTargets) {
    if (mutableTargets.has(data)) {
        return mutableTargets.get(data);
    }
    var mutableTarget = Array.isArray(data) ? [] : Object.create(null);
    mutableTargets.set(data, mutableTarget);
    return mutableTarget;
}
function maskSelectionSet(data, selectionSet, context, migration, path) {
    var _a;
    var knownChanged = context.knownChanged;
    var memo = getMutableTarget(data, context.mutableTargets);
    if (Array.isArray(data)) {
        for (var _i = 0, _b = Array.from(data.entries()); _i < _b.length; _i++) {
            var _c = _b[_i], index = _c[0], item = _c[1];
            if (item === null) {
                memo[index] = null;
                continue;
            }
            var masked = maskSelectionSet(item, selectionSet, context, migration, globalThis.__DEV__ !== false ? "".concat(path || "", "[").concat(index, "]") : void 0);
            if (knownChanged.has(masked)) {
                knownChanged.add(memo);
            }
            memo[index] = masked;
        }
        return knownChanged.has(memo) ? memo : data;
    }
    for (var _d = 0, _e = selectionSet.selections; _d < _e.length; _d++) {
        var selection = _e[_d];
        var value = void 0;
        // we later want to add acessor warnings to the final result
        // so we need a new object to add the accessor warning to
        if (migration) {
            knownChanged.add(memo);
        }
        if (selection.kind === Kind.FIELD) {
            var keyName = resultKeyNameFromField(selection);
            var childSelectionSet = selection.selectionSet;
            value = memo[keyName] || data[keyName];
            if (value === void 0) {
                continue;
            }
            if (childSelectionSet && value !== null) {
                var masked = maskSelectionSet(data[keyName], childSelectionSet, context, migration, globalThis.__DEV__ !== false ? "".concat(path || "", ".").concat(keyName) : void 0);
                if (knownChanged.has(masked)) {
                    value = masked;
                }
            }
            if (!(globalThis.__DEV__ !== false)) {
                memo[keyName] = value;
            }
            if (globalThis.__DEV__ !== false) {
                if (migration &&
                    keyName !== "__typename" &&
                    // either the field is not present in the memo object
                    // or it has a `get` descriptor, not a `value` descriptor
                    // => it is a warning accessor and we can overwrite it
                    // with another accessor
                    !((_a = Object.getOwnPropertyDescriptor(memo, keyName)) === null || _a === void 0 ? void 0 : _a.value)) {
                    Object.defineProperty(memo, keyName, getAccessorWarningDescriptor(keyName, value, path || "", context.operationName, context.operationType));
                }
                else {
                    delete memo[keyName];
                    memo[keyName] = value;
                }
            }
        }
        if (selection.kind === Kind.INLINE_FRAGMENT &&
            (!selection.typeCondition ||
                context.cache.fragmentMatches(selection, data.__typename))) {
            value = maskSelectionSet(data, selection.selectionSet, context, migration, path);
        }
        if (selection.kind === Kind.FRAGMENT_SPREAD) {
            var fragmentName = selection.name.value;
            var fragment = context.fragmentMap[fragmentName] ||
                (context.fragmentMap[fragmentName] =
                    context.cache.lookupFragment(fragmentName));
            invariant(fragment, 47, fragmentName);
            var mode = getFragmentMaskMode(selection);
            if (mode !== "mask") {
                value = maskSelectionSet(data, fragment.selectionSet, context, mode === "migrate", path);
            }
        }
        if (knownChanged.has(value)) {
            knownChanged.add(memo);
        }
    }
    if ("__typename" in data && !("__typename" in memo)) {
        memo.__typename = data.__typename;
    }
    // This check prevents cases where masked fields may accidentally be
    // returned as part of this object when the fragment also selects
    // additional fields from the same child selection.
    if (Object.keys(memo).length !== Object.keys(data).length) {
        knownChanged.add(memo);
    }
    return knownChanged.has(memo) ? memo : data;
}
function getAccessorWarningDescriptor(fieldName, value, path, operationName, operationType) {
    var getValue = function () {
        if (disableWarningsSlot.getValue()) {
            return value;
        }
        globalThis.__DEV__ !== false && invariant.warn(48, operationName ?
            "".concat(operationType, " '").concat(operationName, "'")
            : "anonymous ".concat(operationType), "".concat(path, ".").concat(fieldName).replace(/^\./, ""));
        getValue = function () { return value; };
        return value;
    };
    return {
        get: function () {
            return getValue();
        },
        set: function (newValue) {
            getValue = function () { return newValue; };
        },
        enumerable: true,
        configurable: true,
    };
}
//# sourceMappingURL=maskDefinition.js.map