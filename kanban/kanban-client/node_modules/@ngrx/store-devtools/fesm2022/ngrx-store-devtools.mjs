import * as i0 from '@angular/core';
import { InjectionToken, inject, NgZone, Injectable, Inject, makeEnvironmentProviders, NgModule } from '@angular/core';
import * as i2 from '@ngrx/store';
import { ActionsSubject, UPDATE, INIT, INITIAL_STATE, StateObservable, ReducerManagerDispatcher } from '@ngrx/store';
import { EMPTY, Observable, of, merge, queueScheduler, ReplaySubject } from 'rxjs';
import { share, filter, map, concatMap, timeout, debounceTime, catchError, take, takeUntil, switchMap, skip, observeOn, withLatestFrom, scan } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

const PERFORM_ACTION = 'PERFORM_ACTION';
const REFRESH = 'REFRESH';
const RESET = 'RESET';
const ROLLBACK = 'ROLLBACK';
const COMMIT = 'COMMIT';
const SWEEP = 'SWEEP';
const TOGGLE_ACTION = 'TOGGLE_ACTION';
const SET_ACTIONS_ACTIVE = 'SET_ACTIONS_ACTIVE';
const JUMP_TO_STATE = 'JUMP_TO_STATE';
const JUMP_TO_ACTION = 'JUMP_TO_ACTION';
const IMPORT_STATE = 'IMPORT_STATE';
const LOCK_CHANGES = 'LOCK_CHANGES';
const PAUSE_RECORDING = 'PAUSE_RECORDING';
class PerformAction {
    constructor(action, timestamp) {
        this.action = action;
        this.timestamp = timestamp;
        this.type = PERFORM_ACTION;
        if (typeof action.type === 'undefined') {
            throw new Error('Actions may not have an undefined "type" property. ' +
                'Have you misspelled a constant?');
        }
    }
}
class Refresh {
    constructor() {
        this.type = REFRESH;
    }
}
class Reset {
    constructor(timestamp) {
        this.timestamp = timestamp;
        this.type = RESET;
    }
}
class Rollback {
    constructor(timestamp) {
        this.timestamp = timestamp;
        this.type = ROLLBACK;
    }
}
class Commit {
    constructor(timestamp) {
        this.timestamp = timestamp;
        this.type = COMMIT;
    }
}
class Sweep {
    constructor() {
        this.type = SWEEP;
    }
}
class ToggleAction {
    constructor(id) {
        this.id = id;
        this.type = TOGGLE_ACTION;
    }
}
class SetActionsActive {
    constructor(start, end, active = true) {
        this.start = start;
        this.end = end;
        this.active = active;
        this.type = SET_ACTIONS_ACTIVE;
    }
}
class JumpToState {
    constructor(index) {
        this.index = index;
        this.type = JUMP_TO_STATE;
    }
}
class JumpToAction {
    constructor(actionId) {
        this.actionId = actionId;
        this.type = JUMP_TO_ACTION;
    }
}
class ImportState {
    constructor(nextLiftedState) {
        this.nextLiftedState = nextLiftedState;
        this.type = IMPORT_STATE;
    }
}
class LockChanges {
    constructor(status) {
        this.status = status;
        this.type = LOCK_CHANGES;
    }
}
class PauseRecording {
    constructor(status) {
        this.status = status;
        this.type = PAUSE_RECORDING;
    }
}

/**
 * Chrome extension documentation
 * @see https://github.com/reduxjs/redux-devtools/blob/main/extension/docs/API/Arguments.md
 * Firefox extension documentation
 * @see https://github.com/zalmoxisus/redux-devtools-extension/blob/master/docs/API/Arguments.md
 */
class StoreDevtoolsConfig {
    constructor() {
        /**
         * Maximum allowed actions to be stored in the history tree (default: `false`)
         */
        this.maxAge = false;
    }
}
const STORE_DEVTOOLS_CONFIG = new InjectionToken('@ngrx/store-devtools Options');
/**
 * Used to provide a `StoreDevtoolsConfig` for the store-devtools.
 */
const INITIAL_OPTIONS = new InjectionToken('@ngrx/store-devtools Initial Config');
function noMonitor() {
    return null;
}
const DEFAULT_NAME = 'NgRx Store DevTools';
function createConfig(optionsInput) {
    const DEFAULT_OPTIONS = {
        maxAge: false,
        monitor: noMonitor,
        actionSanitizer: undefined,
        stateSanitizer: undefined,
        name: DEFAULT_NAME,
        serialize: false,
        logOnly: false,
        autoPause: false,
        trace: false,
        traceLimit: 75,
        // Add all features explicitly. This prevent buggy behavior for
        // options like "lock" which might otherwise not show up.
        features: {
            pause: true, // Start/pause recording of dispatched actions
            lock: true, // Lock/unlock dispatching actions and side effects
            persist: true, // Persist states on page reloading
            export: true, // Export history of actions in a file
            import: 'custom', // Import history of actions from a file
            jump: true, // Jump back and forth (time travelling)
            skip: true, // Skip (cancel) actions
            reorder: true, // Drag and drop actions in the history list
            dispatch: true, // Dispatch custom actions or action creators
            test: true, // Generate tests for the selected actions
        },
        connectInZone: false,
    };
    const options = typeof optionsInput === 'function' ? optionsInput() : optionsInput;
    const logOnly = options.logOnly
        ? { pause: true, export: true, test: true }
        : false;
    const features = options.features ||
        logOnly ||
        DEFAULT_OPTIONS.features;
    if (features.import === true) {
        features.import = 'custom';
    }
    const config = Object.assign({}, DEFAULT_OPTIONS, { features }, options);
    if (config.maxAge && config.maxAge < 2) {
        throw new Error(`Devtools 'maxAge' cannot be less than 2, got ${config.maxAge}`);
    }
    return config;
}

function difference(first, second) {
    return first.filter((item) => second.indexOf(item) < 0);
}
/**
 * Provides an app's view into the state of the lifted store.
 */
function unliftState(liftedState) {
    const { computedStates, currentStateIndex } = liftedState;
    // At start up NgRx dispatches init actions,
    // When these init actions are being filtered out by the predicate or safe/block list options
    // we don't have a complete computed states yet.
    // At this point it could happen that we're out of bounds, when this happens we fall back to the last known state
    if (currentStateIndex >= computedStates.length) {
        const { state } = computedStates[computedStates.length - 1];
        return state;
    }
    const { state } = computedStates[currentStateIndex];
    return state;
}
function unliftAction(liftedState) {
    return liftedState.actionsById[liftedState.nextActionId - 1];
}
/**
 * Lifts an app's action into an action on the lifted store.
 */
function liftAction(action) {
    return new PerformAction(action, +Date.now());
}
/**
 * Sanitizes given actions with given function.
 */
function sanitizeActions(actionSanitizer, actions) {
    return Object.keys(actions).reduce((sanitizedActions, actionIdx) => {
        const idx = Number(actionIdx);
        sanitizedActions[idx] = sanitizeAction(actionSanitizer, actions[idx], idx);
        return sanitizedActions;
    }, {});
}
/**
 * Sanitizes given action with given function.
 */
function sanitizeAction(actionSanitizer, action, actionIdx) {
    return {
        ...action,
        action: actionSanitizer(action.action, actionIdx),
    };
}
/**
 * Sanitizes given states with given function.
 */
function sanitizeStates(stateSanitizer, states) {
    return states.map((computedState, idx) => ({
        state: sanitizeState(stateSanitizer, computedState.state, idx),
        error: computedState.error,
    }));
}
/**
 * Sanitizes given state with given function.
 */
function sanitizeState(stateSanitizer, state, stateIdx) {
    return stateSanitizer(state, stateIdx);
}
/**
 * Read the config and tell if actions should be filtered
 */
function shouldFilterActions(config) {
    return config.predicate || config.actionsSafelist || config.actionsBlocklist;
}
/**
 * Return a full filtered lifted state
 */
function filterLiftedState(liftedState, predicate, safelist, blocklist) {
    const filteredStagedActionIds = [];
    const filteredActionsById = {};
    const filteredComputedStates = [];
    liftedState.stagedActionIds.forEach((id, idx) => {
        const liftedAction = liftedState.actionsById[id];
        if (!liftedAction)
            return;
        if (idx &&
            isActionFiltered(liftedState.computedStates[idx], liftedAction, predicate, safelist, blocklist)) {
            return;
        }
        filteredActionsById[id] = liftedAction;
        filteredStagedActionIds.push(id);
        filteredComputedStates.push(liftedState.computedStates[idx]);
    });
    return {
        ...liftedState,
        stagedActionIds: filteredStagedActionIds,
        actionsById: filteredActionsById,
        computedStates: filteredComputedStates,
    };
}
/**
 * Return true is the action should be ignored
 */
function isActionFiltered(state, action, predicate, safelist, blockedlist) {
    const predicateMatch = predicate && !predicate(state, action.action);
    const safelistMatch = safelist &&
        !action.action.type.match(safelist.map((s) => escapeRegExp(s)).join('|'));
    const blocklistMatch = blockedlist &&
        action.action.type.match(blockedlist.map((s) => escapeRegExp(s)).join('|'));
    return predicateMatch || safelistMatch || blocklistMatch;
}
/**
 * Return string with escaped RegExp special characters
 * https://stackoverflow.com/a/6969486/1337347
 */
function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function injectZoneConfig(connectInZone) {
    const ngZone = connectInZone ? inject(NgZone) : null;
    return { ngZone, connectInZone };
}

class DevtoolsDispatcher extends ActionsSubject {
    /** @nocollapse */ static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: DevtoolsDispatcher, deps: null, target: i0.ɵɵFactoryTarget.Injectable }); }
    /** @nocollapse */ static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: DevtoolsDispatcher }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: DevtoolsDispatcher, decorators: [{
            type: Injectable
        }] });

const ExtensionActionTypes = {
    START: 'START',
    DISPATCH: 'DISPATCH',
    STOP: 'STOP',
    ACTION: 'ACTION',
};
const REDUX_DEVTOOLS_EXTENSION = new InjectionToken('@ngrx/store-devtools Redux Devtools Extension');
class DevtoolsExtension {
    constructor(devtoolsExtension, config, dispatcher) {
        this.config = config;
        this.dispatcher = dispatcher;
        this.zoneConfig = injectZoneConfig(this.config.connectInZone);
        this.devtoolsExtension = devtoolsExtension;
        this.createActionStreams();
    }
    notify(action, state) {
        if (!this.devtoolsExtension) {
            return;
        }
        // Check to see if the action requires a full update of the liftedState.
        // If it is a simple action generated by the user's app and the recording
        // is not locked/paused, only send the action and the current state (fast).
        //
        // A full liftedState update (slow: serializes the entire liftedState) is
        // only required when:
        //   a) redux-devtools-extension fires the @@Init action (ignored by
        //      @ngrx/store-devtools)
        //   b) an action is generated by an @ngrx module (e.g. @ngrx/effects/init
        //      or @ngrx/store/update-reducers)
        //   c) the state has been recomputed due to time-traveling
        //   d) any action that is not a PerformAction to err on the side of
        //      caution.
        if (action.type === PERFORM_ACTION) {
            if (state.isLocked || state.isPaused) {
                return;
            }
            const currentState = unliftState(state);
            if (shouldFilterActions(this.config) &&
                isActionFiltered(currentState, action, this.config.predicate, this.config.actionsSafelist, this.config.actionsBlocklist)) {
                return;
            }
            const sanitizedState = this.config.stateSanitizer
                ? sanitizeState(this.config.stateSanitizer, currentState, state.currentStateIndex)
                : currentState;
            const sanitizedAction = this.config.actionSanitizer
                ? sanitizeAction(this.config.actionSanitizer, action, state.nextActionId)
                : action;
            this.sendToReduxDevtools(() => this.extensionConnection.send(sanitizedAction, sanitizedState));
        }
        else {
            // Requires full state update
            const sanitizedLiftedState = {
                ...state,
                stagedActionIds: state.stagedActionIds,
                actionsById: this.config.actionSanitizer
                    ? sanitizeActions(this.config.actionSanitizer, state.actionsById)
                    : state.actionsById,
                computedStates: this.config.stateSanitizer
                    ? sanitizeStates(this.config.stateSanitizer, state.computedStates)
                    : state.computedStates,
            };
            this.sendToReduxDevtools(() => this.devtoolsExtension.send(null, sanitizedLiftedState, this.getExtensionConfig(this.config)));
        }
    }
    createChangesObservable() {
        if (!this.devtoolsExtension) {
            return EMPTY;
        }
        return new Observable((subscriber) => {
            const connection = this.zoneConfig.connectInZone
                ? // To reduce change detection cycles, we need to run the `connect` method
                    // outside of the Angular zone. The `connect` method adds a `message`
                    // event listener to communicate with an extension using `window.postMessage`
                    // and handle message events.
                    this.zoneConfig.ngZone.runOutsideAngular(() => this.devtoolsExtension.connect(this.getExtensionConfig(this.config)))
                : this.devtoolsExtension.connect(this.getExtensionConfig(this.config));
            this.extensionConnection = connection;
            connection.init();
            connection.subscribe((change) => subscriber.next(change));
            return connection.unsubscribe;
        });
    }
    createActionStreams() {
        // Listens to all changes
        const changes$ = this.createChangesObservable().pipe(share());
        // Listen for the start action
        const start$ = changes$.pipe(filter((change) => change.type === ExtensionActionTypes.START));
        // Listen for the stop action
        const stop$ = changes$.pipe(filter((change) => change.type === ExtensionActionTypes.STOP));
        // Listen for lifted actions
        const liftedActions$ = changes$.pipe(filter((change) => change.type === ExtensionActionTypes.DISPATCH), map((change) => this.unwrapAction(change.payload)), concatMap((action) => {
            if (action.type === IMPORT_STATE) {
                // State imports may happen in two situations:
                // 1. Explicitly by user
                // 2. User activated the "persist state accross reloads" option
                //    and now the state is imported during reload.
                // Because of option 2, we need to give possible
                // lazy loaded reducers time to instantiate.
                // As soon as there is no UPDATE action within 1 second,
                // it is assumed that all reducers are loaded.
                return this.dispatcher.pipe(filter((action) => action.type === UPDATE), timeout(1000), debounceTime(1000), map(() => action), catchError(() => of(action)), take(1));
            }
            else {
                return of(action);
            }
        }));
        // Listen for unlifted actions
        const actions$ = changes$.pipe(filter((change) => change.type === ExtensionActionTypes.ACTION), map((change) => this.unwrapAction(change.payload)));
        const actionsUntilStop$ = actions$.pipe(takeUntil(stop$));
        const liftedUntilStop$ = liftedActions$.pipe(takeUntil(stop$));
        this.start$ = start$.pipe(takeUntil(stop$));
        // Only take the action sources between the start/stop events
        this.actions$ = this.start$.pipe(switchMap(() => actionsUntilStop$));
        this.liftedActions$ = this.start$.pipe(switchMap(() => liftedUntilStop$));
    }
    unwrapAction(action) {
        // indirect eval according to https://esbuild.github.io/content-types/#direct-eval
        return typeof action === 'string' ? (0, eval)(`(${action})`) : action;
    }
    getExtensionConfig(config) {
        const extensionOptions = {
            name: config.name,
            features: config.features,
            serialize: config.serialize,
            autoPause: config.autoPause ?? false,
            trace: config.trace ?? false,
            traceLimit: config.traceLimit ?? 75,
            // The action/state sanitizers are not added to the config
            // because sanitation is done in this class already.
            // It is done before sending it to the devtools extension for consistency:
            // - If we call extensionConnection.send(...),
            //   the extension would call the sanitizers.
            // - If we call devtoolsExtension.send(...) (aka full state update),
            //   the extension would NOT call the sanitizers, so we have to do it ourselves.
        };
        if (config.maxAge !== false /* support === 0 */) {
            extensionOptions.maxAge = config.maxAge;
        }
        return extensionOptions;
    }
    sendToReduxDevtools(send) {
        try {
            send();
        }
        catch (err) {
            console.warn('@ngrx/store-devtools: something went wrong inside the redux devtools', err);
        }
    }
    /** @nocollapse */ static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: DevtoolsExtension, deps: [{ token: REDUX_DEVTOOLS_EXTENSION }, { token: STORE_DEVTOOLS_CONFIG }, { token: DevtoolsDispatcher }], target: i0.ɵɵFactoryTarget.Injectable }); }
    /** @nocollapse */ static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: DevtoolsExtension }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: DevtoolsExtension, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [REDUX_DEVTOOLS_EXTENSION]
                }] }, { type: StoreDevtoolsConfig, decorators: [{
                    type: Inject,
                    args: [STORE_DEVTOOLS_CONFIG]
                }] }, { type: DevtoolsDispatcher }] });

const INIT_ACTION = { type: INIT };
const RECOMPUTE = '@ngrx/store-devtools/recompute';
const RECOMPUTE_ACTION = { type: RECOMPUTE };
/**
 * Computes the next entry in the log by applying an action.
 */
function computeNextEntry(reducer, action, state, error, errorHandler) {
    if (error) {
        return {
            state,
            error: 'Interrupted by an error up the chain',
        };
    }
    let nextState = state;
    let nextError;
    try {
        nextState = reducer(state, action);
    }
    catch (err) {
        nextError = err.toString();
        errorHandler.handleError(err);
    }
    return {
        state: nextState,
        error: nextError,
    };
}
/**
 * Runs the reducer on invalidated actions to get a fresh computation log.
 */
function recomputeStates(computedStates, minInvalidatedStateIndex, reducer, committedState, actionsById, stagedActionIds, skippedActionIds, errorHandler, isPaused) {
    // Optimization: exit early and return the same reference
    // if we know nothing could have changed.
    if (minInvalidatedStateIndex >= computedStates.length &&
        computedStates.length === stagedActionIds.length) {
        return computedStates;
    }
    const nextComputedStates = computedStates.slice(0, minInvalidatedStateIndex);
    // If the recording is paused, recompute all states up until the pause state,
    // else recompute all states.
    const lastIncludedActionId = stagedActionIds.length - (isPaused ? 1 : 0);
    for (let i = minInvalidatedStateIndex; i < lastIncludedActionId; i++) {
        const actionId = stagedActionIds[i];
        const action = actionsById[actionId].action;
        const previousEntry = nextComputedStates[i - 1];
        const previousState = previousEntry ? previousEntry.state : committedState;
        const previousError = previousEntry ? previousEntry.error : undefined;
        const shouldSkip = skippedActionIds.indexOf(actionId) > -1;
        const entry = shouldSkip
            ? previousEntry
            : computeNextEntry(reducer, action, previousState, previousError, errorHandler);
        nextComputedStates.push(entry);
    }
    // If the recording is paused, the last state will not be recomputed,
    // because it's essentially not part of the state history.
    if (isPaused) {
        nextComputedStates.push(computedStates[computedStates.length - 1]);
    }
    return nextComputedStates;
}
function liftInitialState(initialCommittedState, monitorReducer) {
    return {
        monitorState: monitorReducer(undefined, {}),
        nextActionId: 1,
        actionsById: { 0: liftAction(INIT_ACTION) },
        stagedActionIds: [0],
        skippedActionIds: [],
        committedState: initialCommittedState,
        currentStateIndex: 0,
        computedStates: [],
        isLocked: false,
        isPaused: false,
    };
}
/**
 * Creates a history state reducer from an app's reducer.
 */
function liftReducerWith(initialCommittedState, initialLiftedState, errorHandler, monitorReducer, options = {}) {
    /**
     * Manages how the history actions modify the history state.
     */
    return (reducer) => (liftedState, liftedAction) => {
        let { monitorState, actionsById, nextActionId, stagedActionIds, skippedActionIds, committedState, currentStateIndex, computedStates, isLocked, isPaused, } = liftedState || initialLiftedState;
        if (!liftedState) {
            // Prevent mutating initialLiftedState
            actionsById = Object.create(actionsById);
        }
        function commitExcessActions(n) {
            // Auto-commits n-number of excess actions.
            let excess = n;
            let idsToDelete = stagedActionIds.slice(1, excess + 1);
            for (let i = 0; i < idsToDelete.length; i++) {
                if (computedStates[i + 1].error) {
                    // Stop if error is found. Commit actions up to error.
                    excess = i;
                    idsToDelete = stagedActionIds.slice(1, excess + 1);
                    break;
                }
                else {
                    delete actionsById[idsToDelete[i]];
                }
            }
            skippedActionIds = skippedActionIds.filter((id) => idsToDelete.indexOf(id) === -1);
            stagedActionIds = [0, ...stagedActionIds.slice(excess + 1)];
            committedState = computedStates[excess].state;
            computedStates = computedStates.slice(excess);
            currentStateIndex =
                currentStateIndex > excess ? currentStateIndex - excess : 0;
        }
        function commitChanges() {
            // Consider the last committed state the new starting point.
            // Squash any staged actions into a single committed state.
            actionsById = { 0: liftAction(INIT_ACTION) };
            nextActionId = 1;
            stagedActionIds = [0];
            skippedActionIds = [];
            committedState = computedStates[currentStateIndex].state;
            currentStateIndex = 0;
            computedStates = [];
        }
        // By default, aggressively recompute every state whatever happens.
        // This has O(n) performance, so we'll override this to a sensible
        // value whenever we feel like we don't have to recompute the states.
        let minInvalidatedStateIndex = 0;
        switch (liftedAction.type) {
            case LOCK_CHANGES: {
                isLocked = liftedAction.status;
                minInvalidatedStateIndex = Infinity;
                break;
            }
            case PAUSE_RECORDING: {
                isPaused = liftedAction.status;
                if (isPaused) {
                    // Add a pause action to signal the devtools-user the recording is paused.
                    // The corresponding state will be overwritten on each update to always contain
                    // the latest state (see Actions.PERFORM_ACTION).
                    stagedActionIds = [...stagedActionIds, nextActionId];
                    actionsById[nextActionId] = new PerformAction({
                        type: '@ngrx/devtools/pause',
                    }, +Date.now());
                    nextActionId++;
                    minInvalidatedStateIndex = stagedActionIds.length - 1;
                    computedStates = computedStates.concat(computedStates[computedStates.length - 1]);
                    if (currentStateIndex === stagedActionIds.length - 2) {
                        currentStateIndex++;
                    }
                    minInvalidatedStateIndex = Infinity;
                }
                else {
                    commitChanges();
                }
                break;
            }
            case RESET: {
                // Get back to the state the store was created with.
                actionsById = { 0: liftAction(INIT_ACTION) };
                nextActionId = 1;
                stagedActionIds = [0];
                skippedActionIds = [];
                committedState = initialCommittedState;
                currentStateIndex = 0;
                computedStates = [];
                break;
            }
            case COMMIT: {
                commitChanges();
                break;
            }
            case ROLLBACK: {
                // Forget about any staged actions.
                // Start again from the last committed state.
                actionsById = { 0: liftAction(INIT_ACTION) };
                nextActionId = 1;
                stagedActionIds = [0];
                skippedActionIds = [];
                currentStateIndex = 0;
                computedStates = [];
                break;
            }
            case TOGGLE_ACTION: {
                // Toggle whether an action with given ID is skipped.
                // Being skipped means it is a no-op during the computation.
                const { id: actionId } = liftedAction;
                const index = skippedActionIds.indexOf(actionId);
                if (index === -1) {
                    skippedActionIds = [actionId, ...skippedActionIds];
                }
                else {
                    skippedActionIds = skippedActionIds.filter((id) => id !== actionId);
                }
                // Optimization: we know history before this action hasn't changed
                minInvalidatedStateIndex = stagedActionIds.indexOf(actionId);
                break;
            }
            case SET_ACTIONS_ACTIVE: {
                // Toggle whether an action with given ID is skipped.
                // Being skipped means it is a no-op during the computation.
                const { start, end, active } = liftedAction;
                const actionIds = [];
                for (let i = start; i < end; i++)
                    actionIds.push(i);
                if (active) {
                    skippedActionIds = difference(skippedActionIds, actionIds);
                }
                else {
                    skippedActionIds = [...skippedActionIds, ...actionIds];
                }
                // Optimization: we know history before this action hasn't changed
                minInvalidatedStateIndex = stagedActionIds.indexOf(start);
                break;
            }
            case JUMP_TO_STATE: {
                // Without recomputing anything, move the pointer that tell us
                // which state is considered the current one. Useful for sliders.
                currentStateIndex = liftedAction.index;
                // Optimization: we know the history has not changed.
                minInvalidatedStateIndex = Infinity;
                break;
            }
            case JUMP_TO_ACTION: {
                // Jumps to a corresponding state to a specific action.
                // Useful when filtering actions.
                const index = stagedActionIds.indexOf(liftedAction.actionId);
                if (index !== -1)
                    currentStateIndex = index;
                minInvalidatedStateIndex = Infinity;
                break;
            }
            case SWEEP: {
                // Forget any actions that are currently being skipped.
                stagedActionIds = difference(stagedActionIds, skippedActionIds);
                skippedActionIds = [];
                currentStateIndex = Math.min(currentStateIndex, stagedActionIds.length - 1);
                break;
            }
            case PERFORM_ACTION: {
                // Ignore action and return state as is if recording is locked
                if (isLocked) {
                    return liftedState || initialLiftedState;
                }
                if (isPaused ||
                    (liftedState &&
                        isActionFiltered(liftedState.computedStates[currentStateIndex], liftedAction, options.predicate, options.actionsSafelist, options.actionsBlocklist))) {
                    // If recording is paused or if the action should be ignored, overwrite the last state
                    // (corresponds to the pause action) and keep everything else as is.
                    // This way, the app gets the new current state while the devtools
                    // do not record another action.
                    const lastState = computedStates[computedStates.length - 1];
                    computedStates = [
                        ...computedStates.slice(0, -1),
                        computeNextEntry(reducer, liftedAction.action, lastState.state, lastState.error, errorHandler),
                    ];
                    minInvalidatedStateIndex = Infinity;
                    break;
                }
                // Auto-commit as new actions come in.
                if (options.maxAge && stagedActionIds.length === options.maxAge) {
                    commitExcessActions(1);
                }
                if (currentStateIndex === stagedActionIds.length - 1) {
                    currentStateIndex++;
                }
                const actionId = nextActionId++;
                // Mutation! This is the hottest path, and we optimize on purpose.
                // It is safe because we set a new key in a cache dictionary.
                actionsById[actionId] = liftedAction;
                stagedActionIds = [...stagedActionIds, actionId];
                // Optimization: we know that only the new action needs computing.
                minInvalidatedStateIndex = stagedActionIds.length - 1;
                break;
            }
            case IMPORT_STATE: {
                // Completely replace everything.
                ({
                    monitorState,
                    actionsById,
                    nextActionId,
                    stagedActionIds,
                    skippedActionIds,
                    committedState,
                    currentStateIndex,
                    computedStates,
                    isLocked,
                    isPaused,
                } = liftedAction.nextLiftedState);
                break;
            }
            case INIT: {
                // Always recompute states on hot reload and init.
                minInvalidatedStateIndex = 0;
                if (options.maxAge && stagedActionIds.length > options.maxAge) {
                    // States must be recomputed before committing excess.
                    computedStates = recomputeStates(computedStates, minInvalidatedStateIndex, reducer, committedState, actionsById, stagedActionIds, skippedActionIds, errorHandler, isPaused);
                    commitExcessActions(stagedActionIds.length - options.maxAge);
                    // Avoid double computation.
                    minInvalidatedStateIndex = Infinity;
                }
                break;
            }
            case UPDATE: {
                const stateHasErrors = computedStates.filter((state) => state.error).length > 0;
                if (stateHasErrors) {
                    // Recompute all states
                    minInvalidatedStateIndex = 0;
                    if (options.maxAge && stagedActionIds.length > options.maxAge) {
                        // States must be recomputed before committing excess.
                        computedStates = recomputeStates(computedStates, minInvalidatedStateIndex, reducer, committedState, actionsById, stagedActionIds, skippedActionIds, errorHandler, isPaused);
                        commitExcessActions(stagedActionIds.length - options.maxAge);
                        // Avoid double computation.
                        minInvalidatedStateIndex = Infinity;
                    }
                }
                else {
                    // If not paused/locked, add a new action to signal devtools-user
                    // that there was a reducer update.
                    if (!isPaused && !isLocked) {
                        if (currentStateIndex === stagedActionIds.length - 1) {
                            currentStateIndex++;
                        }
                        // Add a new action to only recompute state
                        const actionId = nextActionId++;
                        actionsById[actionId] = new PerformAction(liftedAction, +Date.now());
                        stagedActionIds = [...stagedActionIds, actionId];
                        minInvalidatedStateIndex = stagedActionIds.length - 1;
                        computedStates = recomputeStates(computedStates, minInvalidatedStateIndex, reducer, committedState, actionsById, stagedActionIds, skippedActionIds, errorHandler, isPaused);
                    }
                    // Recompute state history with latest reducer and update action
                    computedStates = computedStates.map((cmp) => ({
                        ...cmp,
                        state: reducer(cmp.state, RECOMPUTE_ACTION),
                    }));
                    currentStateIndex = stagedActionIds.length - 1;
                    if (options.maxAge && stagedActionIds.length > options.maxAge) {
                        commitExcessActions(stagedActionIds.length - options.maxAge);
                    }
                    // Avoid double computation.
                    minInvalidatedStateIndex = Infinity;
                }
                break;
            }
            default: {
                // If the action is not recognized, it's a monitor action.
                // Optimization: a monitor action can't change history.
                minInvalidatedStateIndex = Infinity;
                break;
            }
        }
        computedStates = recomputeStates(computedStates, minInvalidatedStateIndex, reducer, committedState, actionsById, stagedActionIds, skippedActionIds, errorHandler, isPaused);
        monitorState = monitorReducer(monitorState, liftedAction);
        return {
            monitorState,
            actionsById,
            nextActionId,
            stagedActionIds,
            skippedActionIds,
            committedState,
            currentStateIndex,
            computedStates,
            isLocked,
            isPaused,
        };
    };
}

class StoreDevtools {
    constructor(dispatcher, actions$, reducers$, extension, scannedActions, errorHandler, initialState, config) {
        const liftedInitialState = liftInitialState(initialState, config.monitor);
        const liftReducer = liftReducerWith(initialState, liftedInitialState, errorHandler, config.monitor, config);
        const liftedAction$ = merge(merge(actions$.asObservable().pipe(skip(1)), extension.actions$).pipe(map(liftAction)), dispatcher, extension.liftedActions$).pipe(observeOn(queueScheduler));
        const liftedReducer$ = reducers$.pipe(map(liftReducer));
        const zoneConfig = injectZoneConfig(config.connectInZone);
        const liftedStateSubject = new ReplaySubject(1);
        this.liftedStateSubscription = liftedAction$
            .pipe(withLatestFrom(liftedReducer$), 
        // The extension would post messages back outside of the Angular zone
        // because we call `connect()` wrapped with `runOutsideAngular`. We run change
        // detection only once at the end after all the required asynchronous tasks have
        // been processed (for instance, `setInterval` scheduled by the `timeout` operator).
        // We have to re-enter the Angular zone before the `scan` since it runs the reducer
        // which must be run within the Angular zone.
        emitInZone(zoneConfig), scan(({ state: liftedState }, [action, reducer]) => {
            let reducedLiftedState = reducer(liftedState, action);
            // On full state update
            // If we have actions filters, we must filter completely our lifted state to be sync with the extension
            if (action.type !== PERFORM_ACTION && shouldFilterActions(config)) {
                reducedLiftedState = filterLiftedState(reducedLiftedState, config.predicate, config.actionsSafelist, config.actionsBlocklist);
            }
            // Extension should be sent the sanitized lifted state
            extension.notify(action, reducedLiftedState);
            return { state: reducedLiftedState, action };
        }, { state: liftedInitialState, action: null }))
            .subscribe(({ state, action }) => {
            liftedStateSubject.next(state);
            if (action.type === PERFORM_ACTION) {
                const unliftedAction = action.action;
                scannedActions.next(unliftedAction);
            }
        });
        this.extensionStartSubscription = extension.start$
            .pipe(emitInZone(zoneConfig))
            .subscribe(() => {
            this.refresh();
        });
        const liftedState$ = liftedStateSubject.asObservable();
        const state$ = liftedState$.pipe(map(unliftState));
        Object.defineProperty(state$, 'state', {
            value: toSignal(state$, { manualCleanup: true, requireSync: true }),
        });
        this.dispatcher = dispatcher;
        this.liftedState = liftedState$;
        this.state = state$;
    }
    ngOnDestroy() {
        // Even though the store devtools plugin is recommended to be
        // used only in development mode, it can still cause a memory leak
        // in microfrontend applications that are being created and destroyed
        // multiple times during development. This results in excessive memory
        // consumption, as it prevents entire apps from being garbage collected.
        this.liftedStateSubscription.unsubscribe();
        this.extensionStartSubscription.unsubscribe();
    }
    dispatch(action) {
        this.dispatcher.next(action);
    }
    next(action) {
        this.dispatcher.next(action);
    }
    error(error) { }
    complete() { }
    performAction(action) {
        this.dispatch(new PerformAction(action, +Date.now()));
    }
    refresh() {
        this.dispatch(new Refresh());
    }
    reset() {
        this.dispatch(new Reset(+Date.now()));
    }
    rollback() {
        this.dispatch(new Rollback(+Date.now()));
    }
    commit() {
        this.dispatch(new Commit(+Date.now()));
    }
    sweep() {
        this.dispatch(new Sweep());
    }
    toggleAction(id) {
        this.dispatch(new ToggleAction(id));
    }
    jumpToAction(actionId) {
        this.dispatch(new JumpToAction(actionId));
    }
    jumpToState(index) {
        this.dispatch(new JumpToState(index));
    }
    importState(nextLiftedState) {
        this.dispatch(new ImportState(nextLiftedState));
    }
    lockChanges(status) {
        this.dispatch(new LockChanges(status));
    }
    pauseRecording(status) {
        this.dispatch(new PauseRecording(status));
    }
    /** @nocollapse */ static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: StoreDevtools, deps: [{ token: DevtoolsDispatcher }, { token: i2.ActionsSubject }, { token: i2.ReducerObservable }, { token: DevtoolsExtension }, { token: i2.ScannedActionsSubject }, { token: i0.ErrorHandler }, { token: INITIAL_STATE }, { token: STORE_DEVTOOLS_CONFIG }], target: i0.ɵɵFactoryTarget.Injectable }); }
    /** @nocollapse */ static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: StoreDevtools }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: StoreDevtools, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: DevtoolsDispatcher }, { type: i2.ActionsSubject }, { type: i2.ReducerObservable }, { type: DevtoolsExtension }, { type: i2.ScannedActionsSubject }, { type: i0.ErrorHandler }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [INITIAL_STATE]
                }] }, { type: StoreDevtoolsConfig, decorators: [{
                    type: Inject,
                    args: [STORE_DEVTOOLS_CONFIG]
                }] }] });
/**
 * If the devtools extension is connected out of the Angular zone,
 * this operator will emit all events within the zone.
 */
function emitInZone({ ngZone, connectInZone, }) {
    return (source) => connectInZone
        ? new Observable((subscriber) => source.subscribe({
            next: (value) => ngZone.run(() => subscriber.next(value)),
            error: (error) => ngZone.run(() => subscriber.error(error)),
            complete: () => ngZone.run(() => subscriber.complete()),
        }))
        : source;
}

const IS_EXTENSION_OR_MONITOR_PRESENT = new InjectionToken('@ngrx/store-devtools Is Devtools Extension or Monitor Present');
function createIsExtensionOrMonitorPresent(extension, config) {
    return Boolean(extension) || config.monitor !== noMonitor;
}
function createReduxDevtoolsExtension() {
    const extensionKey = '__REDUX_DEVTOOLS_EXTENSION__';
    if (typeof window === 'object' &&
        typeof window[extensionKey] !== 'undefined') {
        return window[extensionKey];
    }
    else {
        return null;
    }
}
/**
 * Provides developer tools and instrumentation for `Store`.
 *
 * @usageNotes
 *
 * ```ts
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideStoreDevtools({
 *       maxAge: 25,
 *       logOnly: !isDevMode(),
 *     }),
 *   ],
 * });
 * ```
 */
function provideStoreDevtools(options = {}) {
    return makeEnvironmentProviders([
        DevtoolsExtension,
        DevtoolsDispatcher,
        StoreDevtools,
        {
            provide: INITIAL_OPTIONS,
            useValue: options,
        },
        {
            provide: IS_EXTENSION_OR_MONITOR_PRESENT,
            deps: [REDUX_DEVTOOLS_EXTENSION, STORE_DEVTOOLS_CONFIG],
            useFactory: createIsExtensionOrMonitorPresent,
        },
        {
            provide: REDUX_DEVTOOLS_EXTENSION,
            useFactory: createReduxDevtoolsExtension,
        },
        {
            provide: STORE_DEVTOOLS_CONFIG,
            deps: [INITIAL_OPTIONS],
            useFactory: createConfig,
        },
        {
            provide: StateObservable,
            deps: [StoreDevtools],
            useFactory: createStateObservable,
        },
        {
            provide: ReducerManagerDispatcher,
            useExisting: DevtoolsDispatcher,
        },
    ]);
}

function createStateObservable(devtools) {
    return devtools.state;
}
class StoreDevtoolsModule {
    static instrument(options = {}) {
        return {
            ngModule: StoreDevtoolsModule,
            providers: [provideStoreDevtools(options)],
        };
    }
    /** @nocollapse */ static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: StoreDevtoolsModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    /** @nocollapse */ static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.0.0", ngImport: i0, type: StoreDevtoolsModule }); }
    /** @nocollapse */ static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: StoreDevtoolsModule }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: StoreDevtoolsModule, decorators: [{
            type: NgModule,
            args: [{}]
        }] });

/**
 * DO NOT EDIT
 *
 * This file is automatically generated at build
 */

/**
 * Generated bundle index. Do not edit.
 */

export { INITIAL_OPTIONS, RECOMPUTE, REDUX_DEVTOOLS_EXTENSION, StoreDevtools, StoreDevtoolsConfig, StoreDevtoolsModule, provideStoreDevtools };
//# sourceMappingURL=ngrx-store-devtools.mjs.map
