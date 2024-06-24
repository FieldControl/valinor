import * as i1 from 'rxjs';
import { merge, Observable, Subject, defer } from 'rxjs';
import { ignoreElements, materialize, map, catchError, filter, groupBy, mergeMap, exhaustMap, dematerialize, take, concatMap, finalize } from 'rxjs/operators';
import * as i0 from '@angular/core';
import { InjectionToken, Injectable, Inject, NgModule, Optional, inject, makeEnvironmentProviders, ENVIRONMENT_INITIALIZER } from '@angular/core';
import * as i3 from '@ngrx/store';
import { ScannedActionsSubject, createAction, ROOT_STORE_PROVIDER, FEATURE_STATE_PROVIDER, Store } from '@ngrx/store';

const DEFAULT_EFFECT_CONFIG = {
    dispatch: true,
    functional: false,
    useEffectsErrorHandler: true,
};
const CREATE_EFFECT_METADATA_KEY = '__@ngrx/effects_create__';

/**
 * @description
 *
 * Creates an effect from a source and an `EffectConfig`.
 *
 * @param source A function which returns an observable or observable factory.
 * @param config A `EffectConfig` to configure the effect. By default,
 * `dispatch` is true, `functional` is false, and `useEffectsErrorHandler` is
 * true.
 * @returns If `EffectConfig`#`functional` is true, returns the source function.
 * Else, returns the source function result. When `EffectConfig`#`dispatch` is
 * true, the source function result needs to be `Observable<Action>`.
 *
 * @usageNotes
 *
 * ### Class Effects
 *
 * ```ts
 * @Injectable()
 * export class FeatureEffects {
 *   // mapping to a different action
 *   readonly effect1$ = createEffect(
 *     () => this.actions$.pipe(
 *       ofType(FeatureActions.actionOne),
 *       map(() => FeatureActions.actionTwo())
 *     )
 *   );
 *
 *   // non-dispatching effect
 *   readonly effect2$ = createEffect(
 *     () => this.actions$.pipe(
 *       ofType(FeatureActions.actionTwo),
 *       tap(() => console.log('Action Two Dispatched'))
 *     ),
 *     { dispatch: false } // FeatureActions.actionTwo is not dispatched
 *   );
 *
 *   constructor(private readonly actions$: Actions) {}
 * }
 * ```
 *
 * ### Functional Effects
 *
 * ```ts
 * // mapping to a different action
 * export const loadUsers = createEffect(
 *   (actions$ = inject(Actions), usersService = inject(UsersService)) => {
 *     return actions$.pipe(
 *       ofType(UsersPageActions.opened),
 *       exhaustMap(() => {
 *         return usersService.getAll().pipe(
 *           map((users) => UsersApiActions.usersLoadedSuccess({ users })),
 *           catchError((error) =>
 *             of(UsersApiActions.usersLoadedFailure({ error }))
 *           )
 *         );
 *       })
 *     );
 *   },
 *   { functional: true }
 * );
 *
 * // non-dispatching functional effect
 * export const logDispatchedActions = createEffect(
 *   () => inject(Actions).pipe(tap(console.log)),
 *   { functional: true, dispatch: false }
 * );
 * ```
 */
function createEffect(source, config = {}) {
    const effect = config.functional ? source : source();
    const value = {
        ...DEFAULT_EFFECT_CONFIG,
        ...config, // Overrides any defaults if values are provided
    };
    Object.defineProperty(effect, CREATE_EFFECT_METADATA_KEY, {
        value,
    });
    return effect;
}
function getCreateEffectMetadata(instance) {
    const propertyNames = Object.getOwnPropertyNames(instance);
    const metadata = propertyNames
        .filter((propertyName) => {
        if (instance[propertyName] &&
            instance[propertyName].hasOwnProperty(CREATE_EFFECT_METADATA_KEY)) {
            // If the property type has overridden `hasOwnProperty` we need to ensure
            // that the metadata is valid (containing a `dispatch` property)
            // https://github.com/ngrx/platform/issues/2975
            const property = instance[propertyName];
            return property[CREATE_EFFECT_METADATA_KEY].hasOwnProperty('dispatch');
        }
        return false;
    })
        .map((propertyName) => {
        const metaData = instance[propertyName][CREATE_EFFECT_METADATA_KEY];
        return {
            propertyName,
            ...metaData,
        };
    });
    return metadata;
}

function getEffectsMetadata(instance) {
    return getSourceMetadata(instance).reduce((acc, { propertyName, dispatch, useEffectsErrorHandler }) => {
        acc[propertyName] = { dispatch, useEffectsErrorHandler };
        return acc;
    }, {});
}
function getSourceMetadata(instance) {
    return getCreateEffectMetadata(instance);
}

function getSourceForInstance(instance) {
    return Object.getPrototypeOf(instance);
}
function isClassInstance(obj) {
    return (!!obj.constructor &&
        obj.constructor.name !== 'Object' &&
        obj.constructor.name !== 'Function');
}
function isClass(classOrRecord) {
    return typeof classOrRecord === 'function';
}
function getClasses(classesAndRecords) {
    return classesAndRecords.filter(isClass);
}
function isToken(tokenOrRecord) {
    return tokenOrRecord instanceof InjectionToken || isClass(tokenOrRecord);
}

function mergeEffects(sourceInstance, globalErrorHandler, effectsErrorHandler) {
    const source = getSourceForInstance(sourceInstance);
    const isClassBasedEffect = !!source && source.constructor.name !== 'Object';
    const sourceName = isClassBasedEffect ? source.constructor.name : null;
    const observables$ = getSourceMetadata(sourceInstance).map(({ propertyName, dispatch, useEffectsErrorHandler, }) => {
        const observable$ = typeof sourceInstance[propertyName] === 'function'
            ? sourceInstance[propertyName]()
            : sourceInstance[propertyName];
        const effectAction$ = useEffectsErrorHandler
            ? effectsErrorHandler(observable$, globalErrorHandler)
            : observable$;
        if (dispatch === false) {
            return effectAction$.pipe(ignoreElements());
        }
        const materialized$ = effectAction$.pipe(materialize());
        return materialized$.pipe(map((notification) => ({
            effect: sourceInstance[propertyName],
            notification,
            propertyName,
            sourceName,
            sourceInstance,
        })));
    });
    return merge(...observables$);
}

const MAX_NUMBER_OF_RETRY_ATTEMPTS = 10;
function defaultEffectsErrorHandler(observable$, errorHandler, retryAttemptLeft = MAX_NUMBER_OF_RETRY_ATTEMPTS) {
    return observable$.pipe(catchError((error) => {
        if (errorHandler)
            errorHandler.handleError(error);
        if (retryAttemptLeft <= 1) {
            return observable$; // last attempt
        }
        // Return observable that produces this particular effect
        return defaultEffectsErrorHandler(observable$, errorHandler, retryAttemptLeft - 1);
    }));
}

class Actions extends Observable {
    constructor(source) {
        super();
        if (source) {
            this.source = source;
        }
    }
    lift(operator) {
        const observable = new Actions();
        observable.source = this;
        observable.operator = operator;
        return observable;
    }
    /** @nocollapse */ static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: Actions, deps: [{ token: ScannedActionsSubject }], target: i0.ɵɵFactoryTarget.Injectable }); }
    /** @nocollapse */ static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: Actions, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: Actions, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: i1.Observable, decorators: [{
                    type: Inject,
                    args: [ScannedActionsSubject]
                }] }] });
/**
 * `ofType` filters an Observable of `Actions` into an Observable of the actions
 * whose type strings are passed to it.
 *
 * For example, if `actions` has type `Actions<AdditionAction|SubstractionAction>`, and
 * the type of the `Addition` action is `add`, then
 * `actions.pipe(ofType('add'))` returns an `Observable<AdditionAction>`.
 *
 * Properly typing this function is hard and requires some advanced TS tricks
 * below.
 *
 * Type narrowing automatically works, as long as your `actions` object
 * starts with a `Actions<SomeUnionOfActions>` instead of generic `Actions`.
 *
 * For backwards compatibility, when one passes a single type argument
 * `ofType<T>('something')` the result is an `Observable<T>`. Note, that `T`
 * completely overrides any possible inference from 'something'.
 *
 * Unfortunately, for unknown 'actions: Actions' these types will produce
 * 'Observable<never>'. In such cases one has to manually set the generic type
 * like `actions.ofType<AdditionAction>('add')`.
 *
 * @usageNotes
 *
 * Filter the Actions stream on the "customers page loaded" action
 *
 * ```ts
 * import { ofType } from '@ngrx/effects';
 * import * fromCustomers from '../customers';
 *
 * this.actions$.pipe(
 *  ofType(fromCustomers.pageLoaded)
 * )
 * ```
 */
function ofType(...allowedTypes) {
    return filter((action) => allowedTypes.some((typeOrActionCreator) => {
        if (typeof typeOrActionCreator === 'string') {
            // Comparing the string to type
            return typeOrActionCreator === action.type;
        }
        // We are filtering by ActionCreator
        return typeOrActionCreator.type === action.type;
    }));
}

const _ROOT_EFFECTS_GUARD = new InjectionToken('@ngrx/effects Internal Root Guard');
const USER_PROVIDED_EFFECTS = new InjectionToken('@ngrx/effects User Provided Effects');
const _ROOT_EFFECTS = new InjectionToken('@ngrx/effects Internal Root Effects');
const _ROOT_EFFECTS_INSTANCES = new InjectionToken('@ngrx/effects Internal Root Effects Instances');
const _FEATURE_EFFECTS = new InjectionToken('@ngrx/effects Internal Feature Effects');
const _FEATURE_EFFECTS_INSTANCE_GROUPS = new InjectionToken('@ngrx/effects Internal Feature Effects Instance Groups');
const EFFECTS_ERROR_HANDLER = new InjectionToken('@ngrx/effects Effects Error Handler', { providedIn: 'root', factory: () => defaultEffectsErrorHandler });

const ROOT_EFFECTS_INIT = '@ngrx/effects/init';
const rootEffectsInit = createAction(ROOT_EFFECTS_INIT);

function reportInvalidActions(output, reporter) {
    if (output.notification.kind === 'N') {
        const action = output.notification.value;
        const isInvalidAction = !isAction(action);
        if (isInvalidAction) {
            reporter.handleError(new Error(`Effect ${getEffectName(output)} dispatched an invalid action: ${stringify(action)}`));
        }
    }
}
function isAction(action) {
    return (typeof action !== 'function' &&
        action &&
        action.type &&
        typeof action.type === 'string');
}
function getEffectName({ propertyName, sourceInstance, sourceName, }) {
    const isMethod = typeof sourceInstance[propertyName] === 'function';
    const isClassBasedEffect = !!sourceName;
    return isClassBasedEffect
        ? `"${sourceName}.${String(propertyName)}${isMethod ? '()' : ''}"`
        : `"${String(propertyName)}()"`;
}
function stringify(action) {
    try {
        return JSON.stringify(action);
    }
    catch {
        return action;
    }
}

const onIdentifyEffectsKey = 'ngrxOnIdentifyEffects';
function isOnIdentifyEffects(instance) {
    return isFunction(instance, onIdentifyEffectsKey);
}
const onRunEffectsKey = 'ngrxOnRunEffects';
function isOnRunEffects(instance) {
    return isFunction(instance, onRunEffectsKey);
}
const onInitEffects = 'ngrxOnInitEffects';
function isOnInitEffects(instance) {
    return isFunction(instance, onInitEffects);
}
function isFunction(instance, functionName) {
    return (instance &&
        functionName in instance &&
        typeof instance[functionName] === 'function');
}

class EffectSources extends Subject {
    constructor(errorHandler, effectsErrorHandler) {
        super();
        this.errorHandler = errorHandler;
        this.effectsErrorHandler = effectsErrorHandler;
    }
    addEffects(effectSourceInstance) {
        this.next(effectSourceInstance);
    }
    /**
     * @internal
     */
    toActions() {
        return this.pipe(groupBy((effectsInstance) => isClassInstance(effectsInstance)
            ? getSourceForInstance(effectsInstance)
            : effectsInstance), mergeMap((source$) => {
            return source$.pipe(groupBy(effectsInstance));
        }), mergeMap((source$) => {
            const effect$ = source$.pipe(exhaustMap((sourceInstance) => {
                return resolveEffectSource(this.errorHandler, this.effectsErrorHandler)(sourceInstance);
            }), map((output) => {
                reportInvalidActions(output, this.errorHandler);
                return output.notification;
            }), filter((notification) => notification.kind === 'N' && notification.value != null), dematerialize());
            // start the stream with an INIT action
            // do this only for the first Effect instance
            const init$ = source$.pipe(take(1), filter(isOnInitEffects), map((instance) => instance.ngrxOnInitEffects()));
            return merge(effect$, init$);
        }));
    }
    /** @nocollapse */ static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: EffectSources, deps: [{ token: i0.ErrorHandler }, { token: EFFECTS_ERROR_HANDLER }], target: i0.ɵɵFactoryTarget.Injectable }); }
    /** @nocollapse */ static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: EffectSources, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: EffectSources, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: i0.ErrorHandler }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [EFFECTS_ERROR_HANDLER]
                }] }] });
function effectsInstance(sourceInstance) {
    if (isOnIdentifyEffects(sourceInstance)) {
        return sourceInstance.ngrxOnIdentifyEffects();
    }
    return '';
}
function resolveEffectSource(errorHandler, effectsErrorHandler) {
    return (sourceInstance) => {
        const mergedEffects$ = mergeEffects(sourceInstance, errorHandler, effectsErrorHandler);
        if (isOnRunEffects(sourceInstance)) {
            return sourceInstance.ngrxOnRunEffects(mergedEffects$);
        }
        return mergedEffects$;
    };
}

class EffectsRunner {
    get isStarted() {
        return !!this.effectsSubscription;
    }
    constructor(effectSources, store) {
        this.effectSources = effectSources;
        this.store = store;
        this.effectsSubscription = null;
    }
    start() {
        if (!this.effectsSubscription) {
            this.effectsSubscription = this.effectSources
                .toActions()
                .subscribe(this.store);
        }
    }
    ngOnDestroy() {
        if (this.effectsSubscription) {
            this.effectsSubscription.unsubscribe();
            this.effectsSubscription = null;
        }
    }
    /** @nocollapse */ static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: EffectsRunner, deps: [{ token: EffectSources }, { token: i3.Store }], target: i0.ɵɵFactoryTarget.Injectable }); }
    /** @nocollapse */ static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: EffectsRunner, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: EffectsRunner, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: EffectSources }, { type: i3.Store }] });

class EffectsRootModule {
    constructor(sources, runner, store, rootEffectsInstances, storeRootModule, storeFeatureModule, guard) {
        this.sources = sources;
        runner.start();
        for (const effectsInstance of rootEffectsInstances) {
            sources.addEffects(effectsInstance);
        }
        store.dispatch({ type: ROOT_EFFECTS_INIT });
    }
    addEffects(effectsInstance) {
        this.sources.addEffects(effectsInstance);
    }
    /** @nocollapse */ static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: EffectsRootModule, deps: [{ token: EffectSources }, { token: EffectsRunner }, { token: i3.Store }, { token: _ROOT_EFFECTS_INSTANCES }, { token: i3.StoreRootModule, optional: true }, { token: i3.StoreFeatureModule, optional: true }, { token: _ROOT_EFFECTS_GUARD, optional: true }], target: i0.ɵɵFactoryTarget.NgModule }); }
    /** @nocollapse */ static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.0.0", ngImport: i0, type: EffectsRootModule }); }
    /** @nocollapse */ static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: EffectsRootModule }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: EffectsRootModule, decorators: [{
            type: NgModule,
            args: [{}]
        }], ctorParameters: () => [{ type: EffectSources }, { type: EffectsRunner }, { type: i3.Store }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [_ROOT_EFFECTS_INSTANCES]
                }] }, { type: i3.StoreRootModule, decorators: [{
                    type: Optional
                }] }, { type: i3.StoreFeatureModule, decorators: [{
                    type: Optional
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [_ROOT_EFFECTS_GUARD]
                }] }] });

class EffectsFeatureModule {
    constructor(effectsRootModule, effectsInstanceGroups, storeRootModule, storeFeatureModule) {
        const effectsInstances = effectsInstanceGroups.flat();
        for (const effectsInstance of effectsInstances) {
            effectsRootModule.addEffects(effectsInstance);
        }
    }
    /** @nocollapse */ static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: EffectsFeatureModule, deps: [{ token: EffectsRootModule }, { token: _FEATURE_EFFECTS_INSTANCE_GROUPS }, { token: i3.StoreRootModule, optional: true }, { token: i3.StoreFeatureModule, optional: true }], target: i0.ɵɵFactoryTarget.NgModule }); }
    /** @nocollapse */ static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.0.0", ngImport: i0, type: EffectsFeatureModule }); }
    /** @nocollapse */ static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: EffectsFeatureModule }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: EffectsFeatureModule, decorators: [{
            type: NgModule,
            args: [{}]
        }], ctorParameters: () => [{ type: EffectsRootModule }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [_FEATURE_EFFECTS_INSTANCE_GROUPS]
                }] }, { type: i3.StoreRootModule, decorators: [{
                    type: Optional
                }] }, { type: i3.StoreFeatureModule, decorators: [{
                    type: Optional
                }] }] });

class EffectsModule {
    static forFeature(...featureEffects) {
        const effects = featureEffects.flat();
        const effectsClasses = getClasses(effects);
        return {
            ngModule: EffectsFeatureModule,
            providers: [
                effectsClasses,
                {
                    provide: _FEATURE_EFFECTS,
                    multi: true,
                    useValue: effects,
                },
                {
                    provide: USER_PROVIDED_EFFECTS,
                    multi: true,
                    useValue: [],
                },
                {
                    provide: _FEATURE_EFFECTS_INSTANCE_GROUPS,
                    multi: true,
                    useFactory: createEffectsInstances,
                    deps: [_FEATURE_EFFECTS, USER_PROVIDED_EFFECTS],
                },
            ],
        };
    }
    static forRoot(...rootEffects) {
        const effects = rootEffects.flat();
        const effectsClasses = getClasses(effects);
        return {
            ngModule: EffectsRootModule,
            providers: [
                effectsClasses,
                {
                    provide: _ROOT_EFFECTS,
                    useValue: [effects],
                },
                {
                    provide: _ROOT_EFFECTS_GUARD,
                    useFactory: _provideForRootGuard,
                },
                {
                    provide: USER_PROVIDED_EFFECTS,
                    multi: true,
                    useValue: [],
                },
                {
                    provide: _ROOT_EFFECTS_INSTANCES,
                    useFactory: createEffectsInstances,
                    deps: [_ROOT_EFFECTS, USER_PROVIDED_EFFECTS],
                },
            ],
        };
    }
    /** @nocollapse */ static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: EffectsModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    /** @nocollapse */ static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.0.0", ngImport: i0, type: EffectsModule }); }
    /** @nocollapse */ static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: EffectsModule }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: EffectsModule, decorators: [{
            type: NgModule,
            args: [{}]
        }] });
function createEffectsInstances(effectsGroups, userProvidedEffectsGroups) {
    const effects = [];
    for (const effectsGroup of effectsGroups) {
        effects.push(...effectsGroup);
    }
    for (const userProvidedEffectsGroup of userProvidedEffectsGroups) {
        effects.push(...userProvidedEffectsGroup);
    }
    return effects.map((effectsTokenOrRecord) => isToken(effectsTokenOrRecord)
        ? inject(effectsTokenOrRecord)
        : effectsTokenOrRecord);
}
function _provideForRootGuard() {
    const runner = inject(EffectsRunner, { optional: true, skipSelf: true });
    const rootEffects = inject(_ROOT_EFFECTS, { self: true });
    // check whether any effects are actually passed
    const hasEffects = !(rootEffects.length === 1 && rootEffects[0].length === 0);
    if (hasEffects && runner) {
        throw new TypeError(`EffectsModule.forRoot() called twice. Feature modules should use EffectsModule.forFeature() instead.`);
    }
    return 'guarded';
}

/**
 * Wraps project fn with error handling making it safe to use in Effects.
 * Takes either a config with named properties that represent different possible
 * callbacks or project/error callbacks that are required.
 */
function act(
/** Allow to take either config object or project/error functions */
configOrProject, errorFn) {
    const { project, error, complete, operator, unsubscribe } = typeof configOrProject === 'function'
        ? {
            project: configOrProject,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            error: errorFn,
            operator: concatMap,
            complete: undefined,
            unsubscribe: undefined,
        }
        : { ...configOrProject, operator: configOrProject.operator || concatMap };
    return (source) => defer(() => {
        const subject = new Subject();
        return merge(source.pipe(operator((input, index) => defer(() => {
            let completed = false;
            let errored = false;
            let projectedCount = 0;
            return project(input, index).pipe(materialize(), map((notification) => {
                switch (notification.kind) {
                    case 'E':
                        errored = true;
                        return {
                            kind: 'N',
                            value: error(notification.error, input),
                        };
                    case 'C':
                        completed = true;
                        return complete
                            ? {
                                kind: 'N',
                                value: complete(projectedCount, input),
                            }
                            : undefined;
                    default:
                        ++projectedCount;
                        return notification;
                }
            }), filter((n) => n != null), dematerialize(), finalize(() => {
                if (!completed && !errored && unsubscribe) {
                    subject.next(unsubscribe(projectedCount, input));
                }
            }));
        }))), subject);
    });
}

/**
 * @usageNotes
 *
 * ### Providing effects at the root level
 *
 * ```ts
 * bootstrapApplication(AppComponent, {
 *   providers: [provideEffects(RouterEffects)],
 * });
 * ```
 *
 * ### Providing effects at the feature level
 *
 * ```ts
 * const booksRoutes: Route[] = [
 *   {
 *     path: '',
 *     providers: [provideEffects(BooksApiEffects)],
 *     children: [
 *       { path: '', component: BookListComponent },
 *       { path: ':id', component: BookDetailsComponent },
 *     ],
 *   },
 * ];
 * ```
 */
function provideEffects(...effects) {
    const effectsClassesAndRecords = effects.flat();
    const effectsClasses = getClasses(effectsClassesAndRecords);
    return makeEnvironmentProviders([
        effectsClasses,
        {
            provide: ENVIRONMENT_INITIALIZER,
            multi: true,
            useValue: () => {
                inject(ROOT_STORE_PROVIDER);
                inject(FEATURE_STATE_PROVIDER, { optional: true });
                const effectsRunner = inject(EffectsRunner);
                const effectSources = inject(EffectSources);
                const shouldInitEffects = !effectsRunner.isStarted;
                if (shouldInitEffects) {
                    effectsRunner.start();
                }
                for (const effectsClassOrRecord of effectsClassesAndRecords) {
                    const effectsInstance = isClass(effectsClassOrRecord)
                        ? inject(effectsClassOrRecord)
                        : effectsClassOrRecord;
                    effectSources.addEffects(effectsInstance);
                }
                if (shouldInitEffects) {
                    const store = inject(Store);
                    store.dispatch(rootEffectsInit());
                }
            },
        },
    ]);
}

/**
 * DO NOT EDIT
 *
 * This file is automatically generated at build
 */

/**
 * Generated bundle index. Do not edit.
 */

export { Actions, EFFECTS_ERROR_HANDLER, EffectSources, EffectsFeatureModule, EffectsModule, EffectsRootModule, EffectsRunner, ROOT_EFFECTS_INIT, USER_PROVIDED_EFFECTS, act, createEffect, defaultEffectsErrorHandler, getEffectsMetadata, mergeEffects, ofType, provideEffects, rootEffectsInit };
//# sourceMappingURL=ngrx-effects.mjs.map
