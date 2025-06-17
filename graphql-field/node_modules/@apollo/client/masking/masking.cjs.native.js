'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var optimism = require('optimism');
var globals = require('../utilities/globals');
var utilities = require('../utilities');
var graphql = require('graphql');
var equal = require('@wry/equality');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e["default"] : e; }

var equal__default = /*#__PURE__*/_interopDefaultLegacy(equal);

var MapImpl = utilities.canUseWeakMap ? WeakMap : Map;
var SetImpl = utilities.canUseWeakSet ? WeakSet : Set;
var disableWarningsSlot = new optimism.Slot();
var issuedWarning = false;
function warnOnImproperCacheImplementation() {
    if (!issuedWarning) {
        issuedWarning = true;
        globalThis.__DEV__ !== false && globals.invariant.warn(52);
    }
}

function maskDefinition(data, selectionSet, context) {
    return disableWarningsSlot.withValue(true, function () {
        var masked = maskSelectionSet(data, selectionSet, context, false);
        if (Object.isFrozen(data)) {
            utilities.maybeDeepFreeze(masked);
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
        if (migration) {
            knownChanged.add(memo);
        }
        if (selection.kind === graphql.Kind.FIELD) {
            var keyName = utilities.resultKeyNameFromField(selection);
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
                    !((_a = Object.getOwnPropertyDescriptor(memo, keyName)) === null || _a === void 0 ? void 0 : _a.value)) {
                    Object.defineProperty(memo, keyName, getAccessorWarningDescriptor(keyName, value, path || "", context.operationName, context.operationType));
                }
                else {
                    delete memo[keyName];
                    memo[keyName] = value;
                }
            }
        }
        if (selection.kind === graphql.Kind.INLINE_FRAGMENT &&
            (!selection.typeCondition ||
                context.cache.fragmentMatches(selection, data.__typename))) {
            value = maskSelectionSet(data, selection.selectionSet, context, migration, path);
        }
        if (selection.kind === graphql.Kind.FRAGMENT_SPREAD) {
            var fragmentName = selection.name.value;
            var fragment = context.fragmentMap[fragmentName] ||
                (context.fragmentMap[fragmentName] =
                    context.cache.lookupFragment(fragmentName));
            globals.invariant(fragment, 47, fragmentName);
            var mode = utilities.getFragmentMaskMode(selection);
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
        globalThis.__DEV__ !== false && globals.invariant.warn(48, operationName ?
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

function maskFragment(data, document, cache, fragmentName) {
    if (!cache.fragmentMatches) {
        if (globalThis.__DEV__ !== false) {
            warnOnImproperCacheImplementation();
        }
        return data;
    }
    var fragments = document.definitions.filter(function (node) {
        return node.kind === graphql.Kind.FRAGMENT_DEFINITION;
    });
    if (typeof fragmentName === "undefined") {
        globals.invariant(fragments.length === 1, 49, fragments.length);
        fragmentName = fragments[0].name.value;
    }
    var fragment = fragments.find(function (fragment) { return fragment.name.value === fragmentName; });
    globals.invariant(!!fragment, 50, fragmentName);
    if (data == null) {
        return data;
    }
    if (equal__default(data, {})) {
        return data;
    }
    return maskDefinition(data, fragment.selectionSet, {
        operationType: "fragment",
        operationName: fragment.name.value,
        fragmentMap: utilities.createFragmentMap(utilities.getFragmentDefinitions(document)),
        cache: cache,
        mutableTargets: new MapImpl(),
        knownChanged: new SetImpl(),
    });
}

function maskOperation(data, document, cache) {
    var _a;
    if (!cache.fragmentMatches) {
        if (globalThis.__DEV__ !== false) {
            warnOnImproperCacheImplementation();
        }
        return data;
    }
    var definition = utilities.getOperationDefinition(document);
    globals.invariant(definition, 51);
    if (data == null) {
        return data;
    }
    return maskDefinition(data, definition.selectionSet, {
        operationType: definition.operation,
        operationName: (_a = definition.name) === null || _a === void 0 ? void 0 : _a.value,
        fragmentMap: utilities.createFragmentMap(utilities.getFragmentDefinitions(document)),
        cache: cache,
        mutableTargets: new MapImpl(),
        knownChanged: new SetImpl(),
    });
}

exports.disableWarningsSlot = disableWarningsSlot;
exports.maskFragment = maskFragment;
exports.maskOperation = maskOperation;
//# sourceMappingURL=masking.cjs.map
