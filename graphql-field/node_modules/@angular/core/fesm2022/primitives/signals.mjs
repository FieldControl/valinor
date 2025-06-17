/**
 * @license Angular v20.0.3
 * (c) 2010-2025 Google LLC. https://angular.io/
 * License: MIT
 */

import { consumerMarkDirty, SIGNAL, REACTIVE_NODE, consumerDestroy, isInNotificationPhase, consumerPollProducersForChange, consumerBeforeComputation, consumerAfterComputation } from '../signal-nCiHhWf6.mjs';
export { SIGNAL_NODE, createComputed, createSignal, defaultEquals, getActiveConsumer, isReactive, producerAccessed, producerIncrementEpoch, producerMarkClean, producerNotifyConsumers, producerUpdateValueVersion, producerUpdatesAllowed, runPostProducerCreatedFn, runPostSignalSetFn, setActiveConsumer, setPostProducerCreatedFn, setPostSignalSetFn, setThrowInvalidWriteToSignalError, signalGetFn, signalSetFn, signalUpdateFn } from '../signal-nCiHhWf6.mjs';
export { createLinkedSignal, linkedSignalSetFn, linkedSignalUpdateFn, untracked } from '../untracked-DmD_2MlC.mjs';
export { setAlternateWeakRefImpl } from '../weak_ref-BaIq-pgY.mjs';

function createWatch(fn, schedule, allowSignalWrites) {
    const node = Object.create(WATCH_NODE);
    if (allowSignalWrites) {
        node.consumerAllowSignalWrites = true;
    }
    node.fn = fn;
    node.schedule = schedule;
    const registerOnCleanup = (cleanupFn) => {
        node.cleanupFn = cleanupFn;
    };
    function isWatchNodeDestroyed(node) {
        return node.fn === null && node.schedule === null;
    }
    function destroyWatchNode(node) {
        if (!isWatchNodeDestroyed(node)) {
            consumerDestroy(node); // disconnect watcher from the reactive graph
            node.cleanupFn();
            // nullify references to the integration functions to mark node as destroyed
            node.fn = null;
            node.schedule = null;
            node.cleanupFn = NOOP_CLEANUP_FN;
        }
    }
    const run = () => {
        if (node.fn === null) {
            // trying to run a destroyed watch is noop
            return;
        }
        if (isInNotificationPhase()) {
            throw new Error(typeof ngDevMode !== 'undefined' && ngDevMode
                ? 'Schedulers cannot synchronously execute watches while scheduling.'
                : '');
        }
        node.dirty = false;
        if (node.hasRun && !consumerPollProducersForChange(node)) {
            return;
        }
        node.hasRun = true;
        const prevConsumer = consumerBeforeComputation(node);
        try {
            node.cleanupFn();
            node.cleanupFn = NOOP_CLEANUP_FN;
            node.fn(registerOnCleanup);
        }
        finally {
            consumerAfterComputation(node, prevConsumer);
        }
    };
    node.ref = {
        notify: () => consumerMarkDirty(node),
        run,
        cleanup: () => node.cleanupFn(),
        destroy: () => destroyWatchNode(node),
        [SIGNAL]: node,
    };
    return node.ref;
}
const NOOP_CLEANUP_FN = () => { };
// Note: Using an IIFE here to ensure that the spread assignment is not considered
// a side-effect, ending up preserving `COMPUTED_NODE` and `REACTIVE_NODE`.
// TODO: remove when https://github.com/evanw/esbuild/issues/3392 is resolved.
const WATCH_NODE = /* @__PURE__ */ (() => {
    return {
        ...REACTIVE_NODE,
        consumerIsAlwaysLive: true,
        consumerAllowSignalWrites: false,
        consumerMarkedDirty: (node) => {
            if (node.schedule !== null) {
                node.schedule(node.ref);
            }
        },
        hasRun: false,
        cleanupFn: NOOP_CLEANUP_FN,
    };
})();

export { REACTIVE_NODE, SIGNAL, consumerAfterComputation, consumerBeforeComputation, consumerDestroy, consumerMarkDirty, consumerPollProducersForChange, createWatch, isInNotificationPhase };
//# sourceMappingURL=signals.mjs.map
