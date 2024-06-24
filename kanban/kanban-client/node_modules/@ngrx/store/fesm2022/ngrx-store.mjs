import * as i0 from '@angular/core';
import { Injectable, InjectionToken, Inject, computed, isDevMode, inject, makeEnvironmentProviders, ENVIRONMENT_INITIALIZER, NgModule, Optional } from '@angular/core';
import { BehaviorSubject, Observable, Subject, queueScheduler } from 'rxjs';
import { observeOn, withLatestFrom, scan, pluck, map, distinctUntilChanged } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

const REGISTERED_ACTION_TYPES = {};
function resetRegisteredActionTypes() {
    for (const key of Object.keys(REGISTERED_ACTION_TYPES)) {
        delete REGISTERED_ACTION_TYPES[key];
    }
}

/**
 * @description
 * Creates a configured `Creator` function that, when called, returns an object in the shape of the `Action` interface.
 *
 * Action creators reduce the explicitness of class-based action creators.
 *
 * @param type Describes the action that will be dispatched
 * @param config Additional metadata needed for the handling of the action.  See {@link createAction#usage-notes Usage Notes}.
 *
 * @usageNotes
 *
 * **Declaring an action creator**
 *
 * Without additional metadata:
 * ```ts
 * export const increment = createAction('[Counter] Increment');
 * ```
 * With additional metadata:
 * ```ts
 * export const loginSuccess = createAction(
 *   '[Auth/API] Login Success',
 *   props<{ user: User }>()
 * );
 * ```
 * With a function:
 * ```ts
 * export const loginSuccess = createAction(
 *   '[Auth/API] Login Success',
 *   (response: Response) => response.user
 * );
 * ```
 *
 * **Dispatching an action**
 *
 * Without additional metadata:
 * ```ts
 * store.dispatch(increment());
 * ```
 * With additional metadata:
 * ```ts
 * store.dispatch(loginSuccess({ user: newUser }));
 * ```
 *
 * **Referencing an action in a reducer**
 *
 * Using a switch statement:
 * ```ts
 * switch (action.type) {
 *   // ...
 *   case AuthApiActions.loginSuccess.type: {
 *     return {
 *       ...state,
 *       user: action.user
 *     };
 *   }
 * }
 * ```
 * Using a reducer creator:
 * ```ts
 * on(AuthApiActions.loginSuccess, (state, { user }) => ({ ...state, user }))
 * ```
 *
 *  **Referencing an action in an effect**
 * ```ts
 * effectName$ = createEffect(
 *   () => this.actions$.pipe(
 *     ofType(AuthApiActions.loginSuccess),
 *     // ...
 *   )
 * );
 * ```
 */
function createAction(type, config) {
    REGISTERED_ACTION_TYPES[type] = (REGISTERED_ACTION_TYPES[type] || 0) + 1;
    if (typeof config === 'function') {
        return defineType(type, (...args) => ({
            ...config(...args),
            type,
        }));
    }
    const as = config ? config._as : 'empty';
    switch (as) {
        case 'empty':
            return defineType(type, () => ({ type }));
        case 'props':
            return defineType(type, (props) => ({
                ...props,
                type,
            }));
        default:
            throw new Error('Unexpected config.');
    }
}
function props() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return { _as: 'props', _p: undefined };
}
function union(creators) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return undefined;
}
function defineType(type, creator) {
    return Object.defineProperty(creator, 'type', {
        value: type,
        writable: false,
    });
}

function capitalize(text) {
    return (text.charAt(0).toUpperCase() + text.substring(1));
}
function uncapitalize(text) {
    return (text.charAt(0).toLowerCase() + text.substring(1));
}

/**
 * @description
 * A function that creates a group of action creators with the same source.
 *
 * @param config An object that contains a source and dictionary of events.
 * An event is a key-value pair of an event name and event props.
 * @returns A dictionary of action creators.
 * The name of each action creator is created by camel casing the event name.
 * The type of each action is created using the "[Source] Event Name" pattern.
 *
 * @usageNotes
 *
 * ```ts
 * const authApiActions = createActionGroup({
 *   source: 'Auth API',
 *   events: {
 *     // defining events with payload using the `props` function
 *     'Login Success': props<{ userId: number; token: string }>(),
 *     'Login Failure': props<{ error: string }>(),
 *
 *     // defining an event without payload using the `emptyProps` function
 *     'Logout Success': emptyProps(),
 *
 *     // defining an event with payload using the props factory
 *     'Logout Failure': (error: Error) => ({ error }),
 *   },
 * });
 *
 * // action type: "[Auth API] Login Success"
 * authApiActions.loginSuccess({ userId: 10, token: 'ngrx' });
 *
 * // action type: "[Auth API] Login Failure"
 * authApiActions.loginFailure({ error: 'Login Failure!' });
 *
 * // action type: "[Auth API] Logout Success"
 * authApiActions.logoutSuccess();
 *
 * // action type: "[Auth API] Logout Failure";
 * authApiActions.logoutFailure(new Error('Logout Failure!'));
 * ```
 */
function createActionGroup(config) {
    const { source, events } = config;
    return Object.keys(events).reduce((actionGroup, eventName) => ({
        ...actionGroup,
        [toActionName(eventName)]: createAction(toActionType(source, eventName), events[eventName]),
    }), {});
}
function emptyProps() {
    return props();
}
function toActionName(eventName) {
    return eventName
        .trim()
        .split(' ')
        .map((word, i) => (i === 0 ? uncapitalize(word) : capitalize(word)))
        .join('');
}
function toActionType(source, eventName) {
    return `[${source}] ${eventName}`;
}

const INIT = '@ngrx/store/init';
class ActionsSubject extends BehaviorSubject {
    constructor() {
        super({ type: INIT });
    }
    next(action) {
        if (typeof action === 'function') {
            throw new TypeError(`
        Dispatch expected an object, instead it received a function.
        If you're using the createAction function, make sure to invoke the function
        before dispatching the action. For example, someAction should be someAction().`);
        }
        else if (typeof action === 'undefined') {
            throw new TypeError(`Actions must be objects`);
        }
        else if (typeof action.type === 'undefined') {
            throw new TypeError(`Actions must have a type property`);
        }
        super.next(action);
    }
    complete() {
        /* noop */
    }
    ngOnDestroy() {
        super.complete();
    }
    /** @nocollapse */ static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: ActionsSubject, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    /** @nocollapse */ static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: ActionsSubject }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: ActionsSubject, decorators: [{
            type: Injectable
        }], ctorParameters: () => [] });
const ACTIONS_SUBJECT_PROVIDERS = [ActionsSubject];

const _ROOT_STORE_GUARD = new InjectionToken('@ngrx/store Internal Root Guard');
const _INITIAL_STATE = new InjectionToken('@ngrx/store Internal Initial State');
const INITIAL_STATE = new InjectionToken('@ngrx/store Initial State');
const REDUCER_FACTORY = new InjectionToken('@ngrx/store Reducer Factory');
const _REDUCER_FACTORY = new InjectionToken('@ngrx/store Internal Reducer Factory Provider');
const INITIAL_REDUCERS = new InjectionToken('@ngrx/store Initial Reducers');
const _INITIAL_REDUCERS = new InjectionToken('@ngrx/store Internal Initial Reducers');
const STORE_FEATURES = new InjectionToken('@ngrx/store Store Features');
const _STORE_REDUCERS = new InjectionToken('@ngrx/store Internal Store Reducers');
const _FEATURE_REDUCERS = new InjectionToken('@ngrx/store Internal Feature Reducers');
const _FEATURE_CONFIGS = new InjectionToken('@ngrx/store Internal Feature Configs');
const _STORE_FEATURES = new InjectionToken('@ngrx/store Internal Store Features');
const _FEATURE_REDUCERS_TOKEN = new InjectionToken('@ngrx/store Internal Feature Reducers Token');
const FEATURE_REDUCERS = new InjectionToken('@ngrx/store Feature Reducers');
/**
 * User-defined meta reducers from StoreModule.forRoot()
 */
const USER_PROVIDED_META_REDUCERS = new InjectionToken('@ngrx/store User Provided Meta Reducers');
/**
 * Meta reducers defined either internally by @ngrx/store or by library authors
 */
const META_REDUCERS = new InjectionToken('@ngrx/store Meta Reducers');
/**
 * Concats the user provided meta reducers and the meta reducers provided on the multi
 * injection token
 */
const _RESOLVED_META_REDUCERS = new InjectionToken('@ngrx/store Internal Resolved Meta Reducers');
/**
 * Runtime checks defined by the user via an InjectionToken
 * Defaults to `_USER_RUNTIME_CHECKS`
 */
const USER_RUNTIME_CHECKS = new InjectionToken('@ngrx/store User Runtime Checks Config');
/**
 * Runtime checks defined by the user via forRoot()
 */
const _USER_RUNTIME_CHECKS = new InjectionToken('@ngrx/store Internal User Runtime Checks Config');
/**
 * Runtime checks currently in use
 */
const ACTIVE_RUNTIME_CHECKS = new InjectionToken('@ngrx/store Internal Runtime Checks');
const _ACTION_TYPE_UNIQUENESS_CHECK = new InjectionToken('@ngrx/store Check if Action types are unique');
/**
 * InjectionToken that registers the global Store.
 * Mainly used to provide a hook that can be injected
 * to ensure the root state is loaded before something
 * that depends on it.
 */
const ROOT_STORE_PROVIDER = new InjectionToken('@ngrx/store Root Store Provider');
/**
 * InjectionToken that registers feature states.
 * Mainly used to provide a hook that can be injected
 * to ensure feature state is loaded before something
 * that depends on it.
 */
const FEATURE_STATE_PROVIDER = new InjectionToken('@ngrx/store Feature State Provider');

/**
 * @description
 * Combines reducers for individual features into a single reducer.
 *
 * You can use this function to delegate handling of state transitions to multiple reducers, each acting on their
 * own sub-state within the root state.
 *
 * @param reducers An object mapping keys of the root state to their corresponding feature reducer.
 * @param initialState Provides a state value if the current state is `undefined`, as it is initially.
 * @returns A reducer function.
 *
 * @usageNotes
 *
 * **Example combining two feature reducers into one "root" reducer**
 *
 * ```ts
 * export const reducer = combineReducers({
 *   featureA: featureAReducer,
 *   featureB: featureBReducer
 * });
 * ```
 *
 * You can also override the initial states of the sub-features:
 * ```ts
 * export const reducer = combineReducers({
 *   featureA: featureAReducer,
 *   featureB: featureBReducer
 * }, {
 *   featureA: { counterA: 13 },
 *   featureB: { counterB: 37 }
 * });
 * ```
 */
function combineReducers(reducers, initialState = {}) {
    const reducerKeys = Object.keys(reducers);
    const finalReducers = {};
    for (let i = 0; i < reducerKeys.length; i++) {
        const key = reducerKeys[i];
        if (typeof reducers[key] === 'function') {
            finalReducers[key] = reducers[key];
        }
    }
    const finalReducerKeys = Object.keys(finalReducers);
    return function combination(state, action) {
        state = state === undefined ? initialState : state;
        let hasChanged = false;
        const nextState = {};
        for (let i = 0; i < finalReducerKeys.length; i++) {
            const key = finalReducerKeys[i];
            const reducer = finalReducers[key];
            const previousStateForKey = state[key];
            const nextStateForKey = reducer(previousStateForKey, action);
            nextState[key] = nextStateForKey;
            hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
        }
        return hasChanged ? nextState : state;
    };
}
function omit(object, keyToRemove) {
    return Object.keys(object)
        .filter((key) => key !== keyToRemove)
        .reduce((result, key) => Object.assign(result, { [key]: object[key] }), {});
}
function compose(...functions) {
    return function (arg) {
        if (functions.length === 0) {
            return arg;
        }
        const last = functions[functions.length - 1];
        const rest = functions.slice(0, -1);
        return rest.reduceRight((composed, fn) => fn(composed), last(arg));
    };
}
function createReducerFactory(reducerFactory, metaReducers) {
    if (Array.isArray(metaReducers) && metaReducers.length > 0) {
        reducerFactory = compose.apply(null, [
            ...metaReducers,
            reducerFactory,
        ]);
    }
    return (reducers, initialState) => {
        const reducer = reducerFactory(reducers);
        return (state, action) => {
            state = state === undefined ? initialState : state;
            return reducer(state, action);
        };
    };
}
function createFeatureReducerFactory(metaReducers) {
    const reducerFactory = Array.isArray(metaReducers) && metaReducers.length > 0
        ? compose(...metaReducers)
        : (r) => r;
    return (reducer, initialState) => {
        reducer = reducerFactory(reducer);
        return (state, action) => {
            state = state === undefined ? initialState : state;
            return reducer(state, action);
        };
    };
}

class ReducerObservable extends Observable {
}
class ReducerManagerDispatcher extends ActionsSubject {
}
const UPDATE = '@ngrx/store/update-reducers';
class ReducerManager extends BehaviorSubject {
    get currentReducers() {
        return this.reducers;
    }
    constructor(dispatcher, initialState, reducers, reducerFactory) {
        super(reducerFactory(reducers, initialState));
        this.dispatcher = dispatcher;
        this.initialState = initialState;
        this.reducers = reducers;
        this.reducerFactory = reducerFactory;
    }
    addFeature(feature) {
        this.addFeatures([feature]);
    }
    addFeatures(features) {
        const reducers = features.reduce((reducerDict, { reducers, reducerFactory, metaReducers, initialState, key }) => {
            const reducer = typeof reducers === 'function'
                ? createFeatureReducerFactory(metaReducers)(reducers, initialState)
                : createReducerFactory(reducerFactory, metaReducers)(reducers, initialState);
            reducerDict[key] = reducer;
            return reducerDict;
        }, {});
        this.addReducers(reducers);
    }
    removeFeature(feature) {
        this.removeFeatures([feature]);
    }
    removeFeatures(features) {
        this.removeReducers(features.map((p) => p.key));
    }
    addReducer(key, reducer) {
        this.addReducers({ [key]: reducer });
    }
    addReducers(reducers) {
        this.reducers = { ...this.reducers, ...reducers };
        this.updateReducers(Object.keys(reducers));
    }
    removeReducer(featureKey) {
        this.removeReducers([featureKey]);
    }
    removeReducers(featureKeys) {
        featureKeys.forEach((key) => {
            this.reducers = omit(this.reducers, key) /*TODO(#823)*/;
        });
        this.updateReducers(featureKeys);
    }
    updateReducers(featureKeys) {
        this.next(this.reducerFactory(this.reducers, this.initialState));
        this.dispatcher.next({
            type: UPDATE,
            features: featureKeys,
        });
    }
    ngOnDestroy() {
        this.complete();
    }
    /** @nocollapse */ static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: ReducerManager, deps: [{ token: ReducerManagerDispatcher }, { token: INITIAL_STATE }, { token: INITIAL_REDUCERS }, { token: REDUCER_FACTORY }], target: i0.ɵɵFactoryTarget.Injectable }); }
    /** @nocollapse */ static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: ReducerManager }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: ReducerManager, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: ReducerManagerDispatcher }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [INITIAL_STATE]
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [INITIAL_REDUCERS]
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [REDUCER_FACTORY]
                }] }] });
const REDUCER_MANAGER_PROVIDERS = [
    ReducerManager,
    { provide: ReducerObservable, useExisting: ReducerManager },
    { provide: ReducerManagerDispatcher, useExisting: ActionsSubject },
];

class ScannedActionsSubject extends Subject {
    ngOnDestroy() {
        this.complete();
    }
    /** @nocollapse */ static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: ScannedActionsSubject, deps: null, target: i0.ɵɵFactoryTarget.Injectable }); }
    /** @nocollapse */ static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: ScannedActionsSubject }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: ScannedActionsSubject, decorators: [{
            type: Injectable
        }] });
const SCANNED_ACTIONS_SUBJECT_PROVIDERS = [
    ScannedActionsSubject,
];

class StateObservable extends Observable {
}
class State extends BehaviorSubject {
    static { this.INIT = INIT; }
    constructor(actions$, reducer$, scannedActions, initialState) {
        super(initialState);
        const actionsOnQueue$ = actions$.pipe(observeOn(queueScheduler));
        const withLatestReducer$ = actionsOnQueue$.pipe(withLatestFrom(reducer$));
        const seed = { state: initialState };
        const stateAndAction$ = withLatestReducer$.pipe(scan(reduceState, seed));
        this.stateSubscription = stateAndAction$.subscribe(({ state, action }) => {
            this.next(state);
            scannedActions.next(action);
        });
        this.state = toSignal(this, { manualCleanup: true, requireSync: true });
    }
    ngOnDestroy() {
        this.stateSubscription.unsubscribe();
        this.complete();
    }
    /** @nocollapse */ static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: State, deps: [{ token: ActionsSubject }, { token: ReducerObservable }, { token: ScannedActionsSubject }, { token: INITIAL_STATE }], target: i0.ɵɵFactoryTarget.Injectable }); }
    /** @nocollapse */ static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: State }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: State, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: ActionsSubject }, { type: ReducerObservable }, { type: ScannedActionsSubject }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [INITIAL_STATE]
                }] }] });
function reduceState(stateActionPair = { state: undefined }, [action, reducer]) {
    const { state } = stateActionPair;
    return { state: reducer(state, action), action };
}
const STATE_PROVIDERS = [
    State,
    { provide: StateObservable, useExisting: State },
];

// disabled because we have lowercase generics for `select`
class Store extends Observable {
    constructor(state$, actionsObserver, reducerManager) {
        super();
        this.actionsObserver = actionsObserver;
        this.reducerManager = reducerManager;
        this.source = state$;
        this.state = state$.state;
    }
    select(pathOrMapFn, ...paths) {
        return select.call(null, pathOrMapFn, ...paths)(this);
    }
    /**
     * Returns a signal of the provided selector.
     *
     * @param selector selector function
     * @param options select signal options
     */
    selectSignal(selector, options) {
        return computed(() => selector(this.state()), options);
    }
    lift(operator) {
        const store = new Store(this, this.actionsObserver, this.reducerManager);
        store.operator = operator;
        return store;
    }
    dispatch(action) {
        this.actionsObserver.next(action);
    }
    next(action) {
        this.actionsObserver.next(action);
    }
    error(err) {
        this.actionsObserver.error(err);
    }
    complete() {
        this.actionsObserver.complete();
    }
    addReducer(key, reducer) {
        this.reducerManager.addReducer(key, reducer);
    }
    removeReducer(key) {
        this.reducerManager.removeReducer(key);
    }
    /** @nocollapse */ static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: Store, deps: [{ token: StateObservable }, { token: ActionsSubject }, { token: ReducerManager }], target: i0.ɵɵFactoryTarget.Injectable }); }
    /** @nocollapse */ static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: Store }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: Store, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: StateObservable }, { type: ActionsSubject }, { type: ReducerManager }] });
const STORE_PROVIDERS = [Store];
function select(pathOrMapFn, propsOrPath, ...paths) {
    return function selectOperator(source$) {
        let mapped$;
        if (typeof pathOrMapFn === 'string') {
            const pathSlices = [propsOrPath, ...paths].filter(Boolean);
            mapped$ = source$.pipe(pluck(pathOrMapFn, ...pathSlices));
        }
        else if (typeof pathOrMapFn === 'function') {
            mapped$ = source$.pipe(map((source) => pathOrMapFn(source, propsOrPath)));
        }
        else {
            throw new TypeError(`Unexpected type '${typeof pathOrMapFn}' in select operator,` +
                ` expected 'string' or 'function'`);
        }
        return mapped$.pipe(distinctUntilChanged());
    };
}

const RUNTIME_CHECK_URL = 'https://ngrx.io/guide/store/configuration/runtime-checks';
function isUndefined(target) {
    return target === undefined;
}
function isNull(target) {
    return target === null;
}
function isArray(target) {
    return Array.isArray(target);
}
function isString(target) {
    return typeof target === 'string';
}
function isBoolean(target) {
    return typeof target === 'boolean';
}
function isNumber(target) {
    return typeof target === 'number';
}
function isObjectLike(target) {
    return typeof target === 'object' && target !== null;
}
function isObject(target) {
    return isObjectLike(target) && !isArray(target);
}
function isPlainObject(target) {
    if (!isObject(target)) {
        return false;
    }
    const targetPrototype = Object.getPrototypeOf(target);
    return targetPrototype === Object.prototype || targetPrototype === null;
}
function isFunction(target) {
    return typeof target === 'function';
}
function isComponent(target) {
    return isFunction(target) && target.hasOwnProperty('ɵcmp');
}
function hasOwnProperty(target, propertyName) {
    return Object.prototype.hasOwnProperty.call(target, propertyName);
}

let _ngrxMockEnvironment = false;
function setNgrxMockEnvironment(value) {
    _ngrxMockEnvironment = value;
}
function isNgrxMockEnvironment() {
    return _ngrxMockEnvironment;
}

function isEqualCheck(a, b) {
    return a === b;
}
function isArgumentsChanged(args, lastArguments, comparator) {
    for (let i = 0; i < args.length; i++) {
        if (!comparator(args[i], lastArguments[i])) {
            return true;
        }
    }
    return false;
}
function resultMemoize(projectionFn, isResultEqual) {
    return defaultMemoize(projectionFn, isEqualCheck, isResultEqual);
}
function defaultMemoize(projectionFn, isArgumentsEqual = isEqualCheck, isResultEqual = isEqualCheck) {
    let lastArguments = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, , , , ,
    let lastResult = null;
    let overrideResult;
    function reset() {
        lastArguments = null;
        lastResult = null;
    }
    function setResult(result = undefined) {
        overrideResult = { result };
    }
    function clearResult() {
        overrideResult = undefined;
    }
    /* eslint-disable prefer-rest-params, prefer-spread */
    // disabled because of the use of `arguments`
    function memoized() {
        if (overrideResult !== undefined) {
            return overrideResult.result;
        }
        if (!lastArguments) {
            lastResult = projectionFn.apply(null, arguments);
            lastArguments = arguments;
            return lastResult;
        }
        if (!isArgumentsChanged(arguments, lastArguments, isArgumentsEqual)) {
            return lastResult;
        }
        const newResult = projectionFn.apply(null, arguments);
        lastArguments = arguments;
        if (isResultEqual(lastResult, newResult)) {
            return lastResult;
        }
        lastResult = newResult;
        return newResult;
    }
    return { memoized, reset, setResult, clearResult };
}
function createSelector(...input) {
    return createSelectorFactory(defaultMemoize)(...input);
}
function defaultStateFn(state, selectors, props, memoizedProjector) {
    if (props === undefined) {
        const args = selectors.map((fn) => fn(state));
        return memoizedProjector.memoized.apply(null, args);
    }
    const args = selectors.map((fn) => fn(state, props));
    return memoizedProjector.memoized.apply(null, [...args, props]);
}
/**
 *
 * @param memoize The function used to memoize selectors
 * @param options Config Object that may include a `stateFn` function defining how to return the selector's value, given the entire `Store`'s state, parent `Selector`s, `Props`, and a `MemoizedProjection`
 *
 * @usageNotes
 *
 * **Creating a Selector Factory Where Array Order Does Not Matter**
 *
 * ```ts
 * function removeMatch(arr: string[], target: string): string[] {
 *   const matchIndex = arr.indexOf(target);
 *   return [...arr.slice(0, matchIndex), ...arr.slice(matchIndex + 1)];
 * }
 *
 * function orderDoesNotMatterComparer(a: any, b: any): boolean {
 *   if (!Array.isArray(a) || !Array.isArray(b)) {
 *     return a === b;
 *   }
 *   if (a.length !== b.length) {
 *     return false;
 *   }
 *   let tempB = [...b];
 *   function reduceToDetermineIfArraysContainSameContents(
 *     previousCallResult: boolean,
 *     arrayMember: any
 *   ): boolean {
 *     if (previousCallResult === false) {
 *       return false;
 *     }
 *     if (tempB.includes(arrayMember)) {
 *       tempB = removeMatch(tempB, arrayMember);
 *       return true;
 *     }
 *     return false;
 *   }
 *   return a.reduce(reduceToDetermineIfArraysContainSameContents, true);
 * }
 *
 * export const createOrderDoesNotMatterSelector = createSelectorFactory(
 *   (projectionFun) => defaultMemoize(
 *     projectionFun,
 *     orderDoesNotMatterComparer,
 *     orderDoesNotMatterComparer
 *   )
 * );
 * ```
 *
 * **Creating an Alternative Memoization Strategy**
 *
 * ```ts
 * function serialize(x: any): string {
 *   return JSON.stringify(x);
 * }
 *
 * export const createFullHistorySelector = createSelectorFactory(
 *  (projectionFunction) => {
 *    const cache = {};
 *
 *    function memoized() {
 *      const serializedArguments = serialize(...arguments);
 *       if (cache[serializedArguments] != null) {
 *         cache[serializedArguments] = projectionFunction.apply(null, arguments);
 *       }
 *       return cache[serializedArguments];
 *     }
 *     return {
 *       memoized,
 *       reset: () => {},
 *       setResult: () => {},
 *       clearResult: () => {},
 *     };
 *   }
 * );
 * ```
 */
function createSelectorFactory(memoize, options = {
    stateFn: defaultStateFn,
}) {
    return function (...input) {
        let args = input;
        if (Array.isArray(args[0])) {
            const [head, ...tail] = args;
            args = [...head, ...tail];
        }
        else if (args.length === 1 && isSelectorsDictionary(args[0])) {
            args = extractArgsFromSelectorsDictionary(args[0]);
        }
        const selectors = args.slice(0, args.length - 1);
        const projector = args[args.length - 1];
        const memoizedSelectors = selectors.filter((selector) => selector.release && typeof selector.release === 'function');
        const memoizedProjector = memoize(function (...selectors) {
            return projector.apply(null, selectors);
        });
        const memoizedState = defaultMemoize(function (state, props) {
            return options.stateFn.apply(null, [
                state,
                selectors,
                props,
                memoizedProjector,
            ]);
        });
        function release() {
            memoizedState.reset();
            memoizedProjector.reset();
            memoizedSelectors.forEach((selector) => selector.release());
        }
        return Object.assign(memoizedState.memoized, {
            release,
            projector: memoizedProjector.memoized,
            setResult: memoizedState.setResult,
            clearResult: memoizedState.clearResult,
        });
    };
}
function createFeatureSelector(featureName) {
    return createSelector((state) => {
        const featureState = state[featureName];
        if (!isNgrxMockEnvironment() && isDevMode() && !(featureName in state)) {
            console.warn(`@ngrx/store: The feature name "${featureName}" does ` +
                'not exist in the state, therefore createFeatureSelector ' +
                'cannot access it.  Be sure it is imported in a loaded module ' +
                `using StoreModule.forRoot('${featureName}', ...) or ` +
                `StoreModule.forFeature('${featureName}', ...).  If the default ` +
                'state is intended to be undefined, as is the case with router ' +
                'state, this development-only warning message can be ignored.');
        }
        return featureState;
    }, (featureState) => featureState);
}
function isSelectorsDictionary(selectors) {
    return (!!selectors &&
        typeof selectors === 'object' &&
        Object.values(selectors).every((selector) => typeof selector === 'function'));
}
function extractArgsFromSelectorsDictionary(selectorsDictionary) {
    const selectors = Object.values(selectorsDictionary);
    const resultKeys = Object.keys(selectorsDictionary);
    const projector = (...selectorResults) => resultKeys.reduce((result, key, index) => ({
        ...result,
        [key]: selectorResults[index],
    }), {});
    return [...selectors, projector];
}

/**
 * @description
 * A function that accepts a feature name and a feature reducer, and creates
 * a feature selector and a selector for each feature state property.
 * This function also provides the ability to add extra selectors to
 * the feature object.
 *
 * @param featureConfig An object that contains a feature name and a feature
 * reducer as required, and extra selectors factory as an optional argument.
 * @returns An object that contains a feature name, a feature reducer,
 * a feature selector, a selector for each feature state property, and extra
 * selectors.
 *
 * @usageNotes
 *
 * ```ts
 * interface ProductsState {
 *   products: Product[];
 *   selectedId: string | null;
 * }
 *
 * const initialState: ProductsState = {
 *   products: [],
 *   selectedId: null,
 * };
 *
 * const productsFeature = createFeature({
 *   name: 'products',
 *   reducer: createReducer(
 *     initialState,
 *     on(ProductsApiActions.loadSuccess(state, { products }) => ({
 *       ...state,
 *       products,
 *     }),
 *   ),
 * });
 *
 * const {
 *   name,
 *   reducer,
 *   // feature selector
 *   selectProductsState, // type: MemoizedSelector<Record<string, any>, ProductsState>
 *   // feature state properties selectors
 *   selectProducts, // type: MemoizedSelector<Record<string, any>, Product[]>
 *   selectSelectedId, // type: MemoizedSelector<Record<string, any>, string | null>
 * } = productsFeature;
 * ```
 *
 * **Creating Feature with Extra Selectors**
 *
 * ```ts
 * type CallState = 'init' | 'loading' | 'loaded' | { error: string };
 *
 * interface State extends EntityState<Product> {
 *   callState: CallState;
 * }
 *
 * const adapter = createEntityAdapter<Product>();
 * const initialState: State = adapter.getInitialState({
 *   callState: 'init',
 * });
 *
 * export const productsFeature = createFeature({
 *   name: 'products',
 *   reducer: createReducer(initialState),
 *   extraSelectors: ({ selectProductsState, selectCallState }) => ({
 *     ...adapter.getSelectors(selectProductsState),
 *     ...getCallStateSelectors(selectCallState)
 *   }),
 * });
 *
 * const {
 *   name,
 *   reducer,
 *   // feature selector
 *   selectProductsState,
 *   // feature state properties selectors
 *   selectIds,
 *   selectEntities,
 *   selectCallState,
 *   // selectors returned by `adapter.getSelectors`
 *   selectAll,
 *   selectTotal,
 *   // selectors returned by `getCallStateSelectors`
 *   selectIsLoading,
 *   selectIsLoaded,
 *   selectError,
 * } = productsFeature;
 * ```
 */
function createFeature(featureConfig) {
    const { name, reducer, extraSelectors: extraSelectorsFactory, } = featureConfig;
    const featureSelector = createFeatureSelector(name);
    const nestedSelectors = createNestedSelectors(featureSelector, reducer);
    const baseSelectors = {
        [`select${capitalize(name)}State`]: featureSelector,
        ...nestedSelectors,
    };
    const extraSelectors = extraSelectorsFactory
        ? extraSelectorsFactory(baseSelectors)
        : {};
    return {
        name,
        reducer,
        ...baseSelectors,
        ...extraSelectors,
    };
}
function createNestedSelectors(featureSelector, reducer) {
    const initialState = getInitialState(reducer);
    const nestedKeys = (isPlainObject(initialState) ? Object.keys(initialState) : []);
    return nestedKeys.reduce((nestedSelectors, nestedKey) => ({
        ...nestedSelectors,
        [`select${capitalize(nestedKey)}`]: createSelector(featureSelector, (parentState) => parentState?.[nestedKey]),
    }), {});
}
function getInitialState(reducer) {
    return reducer(undefined, { type: '@ngrx/feature/init' });
}

function _createStoreReducers(reducers) {
    return reducers instanceof InjectionToken ? inject(reducers) : reducers;
}
function _createFeatureStore(configs, featureStores) {
    return featureStores.map((feat, index) => {
        if (configs[index] instanceof InjectionToken) {
            const conf = inject(configs[index]);
            return {
                key: feat.key,
                reducerFactory: conf.reducerFactory
                    ? conf.reducerFactory
                    : combineReducers,
                metaReducers: conf.metaReducers ? conf.metaReducers : [],
                initialState: conf.initialState,
            };
        }
        return feat;
    });
}
function _createFeatureReducers(reducerCollection) {
    return reducerCollection.map((reducer) => {
        return reducer instanceof InjectionToken ? inject(reducer) : reducer;
    });
}
function _initialStateFactory(initialState) {
    if (typeof initialState === 'function') {
        return initialState();
    }
    return initialState;
}
function _concatMetaReducers(metaReducers, userProvidedMetaReducers) {
    return metaReducers.concat(userProvidedMetaReducers);
}
function _provideForRootGuard() {
    const store = inject(Store, { optional: true, skipSelf: true });
    if (store) {
        throw new TypeError(`The root Store has been provided more than once. Feature modules should provide feature states instead.`);
    }
    return 'guarded';
}

function immutabilityCheckMetaReducer(reducer, checks) {
    return function (state, action) {
        const act = checks.action(action) ? freeze(action) : action;
        const nextState = reducer(state, act);
        return checks.state() ? freeze(nextState) : nextState;
    };
}
function freeze(target) {
    Object.freeze(target);
    const targetIsFunction = isFunction(target);
    Object.getOwnPropertyNames(target).forEach((prop) => {
        // Ignore Ivy properties, ref: https://github.com/ngrx/platform/issues/2109#issuecomment-582689060
        if (prop.startsWith('ɵ')) {
            return;
        }
        if (hasOwnProperty(target, prop) &&
            (targetIsFunction
                ? prop !== 'caller' && prop !== 'callee' && prop !== 'arguments'
                : true)) {
            const propValue = target[prop];
            if ((isObjectLike(propValue) || isFunction(propValue)) &&
                !Object.isFrozen(propValue)) {
                freeze(propValue);
            }
        }
    });
    return target;
}

function serializationCheckMetaReducer(reducer, checks) {
    return function (state, action) {
        if (checks.action(action)) {
            const unserializableAction = getUnserializable(action);
            throwIfUnserializable(unserializableAction, 'action');
        }
        const nextState = reducer(state, action);
        if (checks.state()) {
            const unserializableState = getUnserializable(nextState);
            throwIfUnserializable(unserializableState, 'state');
        }
        return nextState;
    };
}
function getUnserializable(target, path = []) {
    // Guard against undefined and null, e.g. a reducer that returns undefined
    if ((isUndefined(target) || isNull(target)) && path.length === 0) {
        return {
            path: ['root'],
            value: target,
        };
    }
    const keys = Object.keys(target);
    return keys.reduce((result, key) => {
        if (result) {
            return result;
        }
        const value = target[key];
        // Ignore Ivy components
        if (isComponent(value)) {
            return result;
        }
        if (isUndefined(value) ||
            isNull(value) ||
            isNumber(value) ||
            isBoolean(value) ||
            isString(value) ||
            isArray(value)) {
            return false;
        }
        if (isPlainObject(value)) {
            return getUnserializable(value, [...path, key]);
        }
        return {
            path: [...path, key],
            value,
        };
    }, false);
}
function throwIfUnserializable(unserializable, context) {
    if (unserializable === false) {
        return;
    }
    const unserializablePath = unserializable.path.join('.');
    const error = new Error(`Detected unserializable ${context} at "${unserializablePath}". ${RUNTIME_CHECK_URL}#strict${context}serializability`);
    error.value = unserializable.value;
    error.unserializablePath = unserializablePath;
    throw error;
}

function inNgZoneAssertMetaReducer(reducer, checks) {
    return function (state, action) {
        if (checks.action(action) && !i0.NgZone.isInAngularZone()) {
            throw new Error(`Action '${action.type}' running outside NgZone. ${RUNTIME_CHECK_URL}#strictactionwithinngzone`);
        }
        return reducer(state, action);
    };
}

function createActiveRuntimeChecks(runtimeChecks) {
    if (isDevMode()) {
        return {
            strictStateSerializability: false,
            strictActionSerializability: false,
            strictStateImmutability: true,
            strictActionImmutability: true,
            strictActionWithinNgZone: false,
            strictActionTypeUniqueness: false,
            ...runtimeChecks,
        };
    }
    return {
        strictStateSerializability: false,
        strictActionSerializability: false,
        strictStateImmutability: false,
        strictActionImmutability: false,
        strictActionWithinNgZone: false,
        strictActionTypeUniqueness: false,
    };
}
function createSerializationCheckMetaReducer({ strictActionSerializability, strictStateSerializability, }) {
    return (reducer) => strictActionSerializability || strictStateSerializability
        ? serializationCheckMetaReducer(reducer, {
            action: (action) => strictActionSerializability && !ignoreNgrxAction(action),
            state: () => strictStateSerializability,
        })
        : reducer;
}
function createImmutabilityCheckMetaReducer({ strictActionImmutability, strictStateImmutability, }) {
    return (reducer) => strictActionImmutability || strictStateImmutability
        ? immutabilityCheckMetaReducer(reducer, {
            action: (action) => strictActionImmutability && !ignoreNgrxAction(action),
            state: () => strictStateImmutability,
        })
        : reducer;
}
function ignoreNgrxAction(action) {
    return action.type.startsWith('@ngrx');
}
function createInNgZoneCheckMetaReducer({ strictActionWithinNgZone, }) {
    return (reducer) => strictActionWithinNgZone
        ? inNgZoneAssertMetaReducer(reducer, {
            action: (action) => strictActionWithinNgZone && !ignoreNgrxAction(action),
        })
        : reducer;
}
function provideRuntimeChecks(runtimeChecks) {
    return [
        {
            provide: _USER_RUNTIME_CHECKS,
            useValue: runtimeChecks,
        },
        {
            provide: USER_RUNTIME_CHECKS,
            useFactory: _runtimeChecksFactory,
            deps: [_USER_RUNTIME_CHECKS],
        },
        {
            provide: ACTIVE_RUNTIME_CHECKS,
            deps: [USER_RUNTIME_CHECKS],
            useFactory: createActiveRuntimeChecks,
        },
        {
            provide: META_REDUCERS,
            multi: true,
            deps: [ACTIVE_RUNTIME_CHECKS],
            useFactory: createImmutabilityCheckMetaReducer,
        },
        {
            provide: META_REDUCERS,
            multi: true,
            deps: [ACTIVE_RUNTIME_CHECKS],
            useFactory: createSerializationCheckMetaReducer,
        },
        {
            provide: META_REDUCERS,
            multi: true,
            deps: [ACTIVE_RUNTIME_CHECKS],
            useFactory: createInNgZoneCheckMetaReducer,
        },
    ];
}
function checkForActionTypeUniqueness() {
    return [
        {
            provide: _ACTION_TYPE_UNIQUENESS_CHECK,
            multi: true,
            deps: [ACTIVE_RUNTIME_CHECKS],
            useFactory: _actionTypeUniquenessCheck,
        },
    ];
}
function _runtimeChecksFactory(runtimeChecks) {
    return runtimeChecks;
}
function _actionTypeUniquenessCheck(config) {
    if (!config.strictActionTypeUniqueness) {
        return;
    }
    const duplicates = Object.entries(REGISTERED_ACTION_TYPES)
        .filter(([, registrations]) => registrations > 1)
        .map(([type]) => type);
    if (duplicates.length) {
        throw new Error(`Action types are registered more than once, ${duplicates
            .map((type) => `"${type}"`)
            .join(', ')}. ${RUNTIME_CHECK_URL}#strictactiontypeuniqueness`);
    }
}

/**
 * Provides additional slices of state in the Store.
 * These providers cannot be used at the component level.
 *
 * @usageNotes
 *
 * ### Providing Store Features
 *
 * ```ts
 * const booksRoutes: Route[] = [
 *   {
 *     path: '',
 *     providers: [provideState('books', booksReducer)],
 *     children: [
 *       { path: '', component: BookListComponent },
 *       { path: ':id', component: BookDetailsComponent },
 *     ],
 *   },
 * ];
 * ```
 */
function provideState(featureNameOrSlice, reducers, config = {}) {
    return makeEnvironmentProviders([
        ..._provideState(featureNameOrSlice, reducers, config),
        ENVIRONMENT_STATE_PROVIDER,
    ]);
}
function _provideStore(reducers = {}, config = {}) {
    return [
        {
            provide: _ROOT_STORE_GUARD,
            useFactory: _provideForRootGuard,
        },
        { provide: _INITIAL_STATE, useValue: config.initialState },
        {
            provide: INITIAL_STATE,
            useFactory: _initialStateFactory,
            deps: [_INITIAL_STATE],
        },
        { provide: _INITIAL_REDUCERS, useValue: reducers },
        {
            provide: _STORE_REDUCERS,
            useExisting: reducers instanceof InjectionToken ? reducers : _INITIAL_REDUCERS,
        },
        {
            provide: INITIAL_REDUCERS,
            deps: [_INITIAL_REDUCERS, [new Inject(_STORE_REDUCERS)]],
            useFactory: _createStoreReducers,
        },
        {
            provide: USER_PROVIDED_META_REDUCERS,
            useValue: config.metaReducers ? config.metaReducers : [],
        },
        {
            provide: _RESOLVED_META_REDUCERS,
            deps: [META_REDUCERS, USER_PROVIDED_META_REDUCERS],
            useFactory: _concatMetaReducers,
        },
        {
            provide: _REDUCER_FACTORY,
            useValue: config.reducerFactory ? config.reducerFactory : combineReducers,
        },
        {
            provide: REDUCER_FACTORY,
            deps: [_REDUCER_FACTORY, _RESOLVED_META_REDUCERS],
            useFactory: createReducerFactory,
        },
        ACTIONS_SUBJECT_PROVIDERS,
        REDUCER_MANAGER_PROVIDERS,
        SCANNED_ACTIONS_SUBJECT_PROVIDERS,
        STATE_PROVIDERS,
        STORE_PROVIDERS,
        provideRuntimeChecks(config.runtimeChecks),
        checkForActionTypeUniqueness(),
    ];
}
function rootStoreProviderFactory() {
    inject(ActionsSubject);
    inject(ReducerObservable);
    inject(ScannedActionsSubject);
    inject(Store);
    inject(_ROOT_STORE_GUARD, { optional: true });
    inject(_ACTION_TYPE_UNIQUENESS_CHECK, { optional: true });
}
/**
 * Environment Initializer used in the root
 * providers to initialize the Store
 */
const ENVIRONMENT_STORE_PROVIDER = [
    { provide: ROOT_STORE_PROVIDER, useFactory: rootStoreProviderFactory },
    {
        provide: ENVIRONMENT_INITIALIZER,
        multi: true,
        useFactory() {
            return () => inject(ROOT_STORE_PROVIDER);
        },
    },
];
/**
 * Provides the global Store providers and initializes
 * the Store.
 * These providers cannot be used at the component level.
 *
 * @usageNotes
 *
 * ### Providing the Global Store
 *
 * ```ts
 * bootstrapApplication(AppComponent, {
 *   providers: [provideStore()],
 * });
 * ```
 */
function provideStore(reducers, config) {
    return makeEnvironmentProviders([
        ..._provideStore(reducers, config),
        ENVIRONMENT_STORE_PROVIDER,
    ]);
}
function featureStateProviderFactory() {
    inject(ROOT_STORE_PROVIDER);
    const features = inject(_STORE_FEATURES);
    const featureReducers = inject(FEATURE_REDUCERS);
    const reducerManager = inject(ReducerManager);
    inject(_ACTION_TYPE_UNIQUENESS_CHECK, { optional: true });
    const feats = features.map((feature, index) => {
        const featureReducerCollection = featureReducers.shift();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const reducers = featureReducerCollection /*TODO(#823)*/[index];
        return {
            ...feature,
            reducers,
            initialState: _initialStateFactory(feature.initialState),
        };
    });
    reducerManager.addFeatures(feats);
}
/**
 * Environment Initializer used in the feature
 * providers to register state features
 */
const ENVIRONMENT_STATE_PROVIDER = [
    {
        provide: FEATURE_STATE_PROVIDER,
        useFactory: featureStateProviderFactory,
    },
    {
        provide: ENVIRONMENT_INITIALIZER,
        multi: true,
        useFactory() {
            return () => inject(FEATURE_STATE_PROVIDER);
        },
    },
];
function _provideState(featureNameOrSlice, reducers, config = {}) {
    return [
        {
            provide: _FEATURE_CONFIGS,
            multi: true,
            useValue: featureNameOrSlice instanceof Object ? {} : config,
        },
        {
            provide: STORE_FEATURES,
            multi: true,
            useValue: {
                key: featureNameOrSlice instanceof Object
                    ? featureNameOrSlice.name
                    : featureNameOrSlice,
                reducerFactory: !(config instanceof InjectionToken) && config.reducerFactory
                    ? config.reducerFactory
                    : combineReducers,
                metaReducers: !(config instanceof InjectionToken) && config.metaReducers
                    ? config.metaReducers
                    : [],
                initialState: !(config instanceof InjectionToken) && config.initialState
                    ? config.initialState
                    : undefined,
            },
        },
        {
            provide: _STORE_FEATURES,
            deps: [_FEATURE_CONFIGS, STORE_FEATURES],
            useFactory: _createFeatureStore,
        },
        {
            provide: _FEATURE_REDUCERS,
            multi: true,
            useValue: featureNameOrSlice instanceof Object
                ? featureNameOrSlice.reducer
                : reducers,
        },
        {
            provide: _FEATURE_REDUCERS_TOKEN,
            multi: true,
            useExisting: reducers instanceof InjectionToken ? reducers : _FEATURE_REDUCERS,
        },
        {
            provide: FEATURE_REDUCERS,
            multi: true,
            deps: [_FEATURE_REDUCERS, [new Inject(_FEATURE_REDUCERS_TOKEN)]],
            useFactory: _createFeatureReducers,
        },
        checkForActionTypeUniqueness(),
    ];
}

class StoreRootModule {
    constructor(actions$, reducer$, scannedActions$, store, guard, actionCheck) { }
    /** @nocollapse */ static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: StoreRootModule, deps: [{ token: ActionsSubject }, { token: ReducerObservable }, { token: ScannedActionsSubject }, { token: Store }, { token: _ROOT_STORE_GUARD, optional: true }, { token: _ACTION_TYPE_UNIQUENESS_CHECK, optional: true }], target: i0.ɵɵFactoryTarget.NgModule }); }
    /** @nocollapse */ static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.0.0", ngImport: i0, type: StoreRootModule }); }
    /** @nocollapse */ static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: StoreRootModule }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: StoreRootModule, decorators: [{
            type: NgModule,
            args: [{}]
        }], ctorParameters: () => [{ type: ActionsSubject }, { type: ReducerObservable }, { type: ScannedActionsSubject }, { type: Store }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [_ROOT_STORE_GUARD]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [_ACTION_TYPE_UNIQUENESS_CHECK]
                }] }] });
class StoreFeatureModule {
    constructor(features, featureReducers, reducerManager, root, actionCheck) {
        this.features = features;
        this.featureReducers = featureReducers;
        this.reducerManager = reducerManager;
        const feats = features.map((feature, index) => {
            const featureReducerCollection = featureReducers.shift();
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const reducers = featureReducerCollection /*TODO(#823)*/[index];
            return {
                ...feature,
                reducers,
                initialState: _initialStateFactory(feature.initialState),
            };
        });
        reducerManager.addFeatures(feats);
    }
    // eslint-disable-next-line @angular-eslint/contextual-lifecycle
    ngOnDestroy() {
        this.reducerManager.removeFeatures(this.features);
    }
    /** @nocollapse */ static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: StoreFeatureModule, deps: [{ token: _STORE_FEATURES }, { token: FEATURE_REDUCERS }, { token: ReducerManager }, { token: StoreRootModule }, { token: _ACTION_TYPE_UNIQUENESS_CHECK, optional: true }], target: i0.ɵɵFactoryTarget.NgModule }); }
    /** @nocollapse */ static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.0.0", ngImport: i0, type: StoreFeatureModule }); }
    /** @nocollapse */ static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: StoreFeatureModule }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: StoreFeatureModule, decorators: [{
            type: NgModule,
            args: [{}]
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [_STORE_FEATURES]
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [FEATURE_REDUCERS]
                }] }, { type: ReducerManager }, { type: StoreRootModule }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [_ACTION_TYPE_UNIQUENESS_CHECK]
                }] }] });
class StoreModule {
    static forRoot(reducers, config) {
        return {
            ngModule: StoreRootModule,
            providers: [..._provideStore(reducers, config)],
        };
    }
    static forFeature(featureNameOrSlice, reducers, config = {}) {
        return {
            ngModule: StoreFeatureModule,
            providers: [..._provideState(featureNameOrSlice, reducers, config)],
        };
    }
    /** @nocollapse */ static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: StoreModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    /** @nocollapse */ static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.0.0", ngImport: i0, type: StoreModule }); }
    /** @nocollapse */ static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: StoreModule }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: StoreModule, decorators: [{
            type: NgModule,
            args: [{}]
        }] });

/**
 * @description
 * Associates actions with a given state change function.
 * A state change function must be provided as the last parameter.
 *
 * @param args `ActionCreator`'s followed by a state change function.
 *
 * @returns an association of action types with a state change function.
 *
 * @usageNotes
 * ```ts
 * on(AuthApiActions.loginSuccess, (state, { user }) => ({ ...state, user }))
 * ```
 */
function on(...args) {
    const reducer = args.pop();
    const types = args.map((creator) => creator.type);
    return { reducer, types };
}
/**
 * @description
 * Creates a reducer function to handle state transitions.
 *
 * Reducer creators reduce the explicitness of reducer functions with switch statements.
 *
 * @param initialState Provides a state value if the current state is `undefined`, as it is initially.
 * @param ons Associations between actions and state changes.
 * @returns A reducer function.
 *
 * @usageNotes
 *
 * - Must be used with `ActionCreator`'s (returned by `createAction`). Cannot be used with class-based action creators.
 * - The returned `ActionReducer` does not require being wrapped with another function.
 *
 * **Declaring a reducer creator**
 *
 * ```ts
 * export const reducer = createReducer(
 *   initialState,
 *   on(
 *     featureActions.actionOne,
 *     featureActions.actionTwo,
 *     (state, { updatedValue }) => ({ ...state, prop: updatedValue })
 *   ),
 *   on(featureActions.actionThree, () => initialState);
 * );
 * ```
 */
function createReducer(initialState, ...ons) {
    const map = new Map();
    for (const on of ons) {
        for (const type of on.types) {
            const existingReducer = map.get(type);
            if (existingReducer) {
                const newReducer = (state, action) => on.reducer(existingReducer(state, action), action);
                map.set(type, newReducer);
            }
            else {
                map.set(type, on.reducer);
            }
        }
    }
    return function (state = initialState, action) {
        const reducer = map.get(action.type);
        return reducer ? reducer(state, action) : state;
    };
}

/**
 * DO NOT EDIT
 *
 * This file is automatically generated at build
 */

/**
 * Generated bundle index. Do not edit.
 */

export { ACTIVE_RUNTIME_CHECKS, ActionsSubject, FEATURE_REDUCERS, FEATURE_STATE_PROVIDER, INIT, INITIAL_REDUCERS, INITIAL_STATE, META_REDUCERS, REDUCER_FACTORY, ROOT_STORE_PROVIDER, ReducerManager, ReducerManagerDispatcher, ReducerObservable, STORE_FEATURES, ScannedActionsSubject, State, StateObservable, Store, StoreFeatureModule, StoreModule, StoreRootModule, UPDATE, USER_PROVIDED_META_REDUCERS, USER_RUNTIME_CHECKS, combineReducers, compose, createAction, createActionGroup, createFeature, createFeatureSelector, createReducer, createReducerFactory, createSelector, createSelectorFactory, defaultMemoize, defaultStateFn, emptyProps, isNgrxMockEnvironment, on, props, provideState, provideStore, reduceState, resultMemoize, select, setNgrxMockEnvironment, union };
//# sourceMappingURL=ngrx-store.mjs.map
