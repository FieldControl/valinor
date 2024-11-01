/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import '../util/ng_dev_mode';
import { RuntimeError } from '../errors';
import { emitInstanceCreatedByInjectorEvent, emitProviderConfiguredEvent, runInInjectorProfilerContext, setInjectorProfilerContext, } from '../render3/debug/injector_profiler';
import { getFactoryDef } from '../render3/definition_factory';
import { throwCyclicDependencyError, throwInvalidProviderError, throwMixedMultiProviderError, } from '../render3/errors_di';
import { NG_ENV_ID } from '../render3/fields';
import { newArray } from '../util/array_utils';
import { EMPTY_ARRAY } from '../util/empty';
import { stringify } from '../util/stringify';
import { resolveForwardRef } from './forward_ref';
import { ENVIRONMENT_INITIALIZER } from './initializer_token';
import { setInjectImplementation } from './inject_switch';
import { InjectionToken } from './injection_token';
import { catchInjectorError, convertToBitFlags, injectArgs, NG_TEMP_TOKEN_PATH, setCurrentInjector, THROW_IF_NOT_FOUND, ɵɵinject, } from './injector_compatibility';
import { INJECTOR } from './injector_token';
import { getInheritedInjectableDef, getInjectableDef, } from './interface/defs';
import { InjectFlags } from './interface/injector';
import { isEnvironmentProviders, } from './interface/provider';
import { INJECTOR_DEF_TYPES } from './internal_tokens';
import { NullInjector } from './null_injector';
import { isExistingProvider, isFactoryProvider, isTypeProvider, isValueProvider, } from './provider_collection';
import { INJECTOR_SCOPE } from './scope';
import { setActiveConsumer } from '@angular/core/primitives/signals';
/**
 * Marker which indicates that a value has not yet been created from the factory function.
 */
const NOT_YET = {};
/**
 * Marker which indicates that the factory function for a token is in the process of being called.
 *
 * If the injector is asked to inject a token with its value set to CIRCULAR, that indicates
 * injection of a dependency has recursively attempted to inject the original token, and there is
 * a circular dependency among the providers.
 */
const CIRCULAR = {};
/**
 * A lazily initialized NullInjector.
 */
let NULL_INJECTOR = undefined;
export function getNullInjector() {
    if (NULL_INJECTOR === undefined) {
        NULL_INJECTOR = new NullInjector();
    }
    return NULL_INJECTOR;
}
/**
 * An `Injector` that's part of the environment injector hierarchy, which exists outside of the
 * component tree.
 */
export class EnvironmentInjector {
}
export class R3Injector extends EnvironmentInjector {
    /**
     * Flag indicating that this injector was previously destroyed.
     */
    get destroyed() {
        return this._destroyed;
    }
    constructor(providers, parent, source, scopes) {
        super();
        this.parent = parent;
        this.source = source;
        this.scopes = scopes;
        /**
         * Map of tokens to records which contain the instances of those tokens.
         * - `null` value implies that we don't have the record. Used by tree-shakable injectors
         * to prevent further searches.
         */
        this.records = new Map();
        /**
         * Set of values instantiated by this injector which contain `ngOnDestroy` lifecycle hooks.
         */
        this._ngOnDestroyHooks = new Set();
        this._onDestroyHooks = [];
        this._destroyed = false;
        // Start off by creating Records for every provider.
        forEachSingleProvider(providers, (provider) => this.processProvider(provider));
        // Make sure the INJECTOR token provides this injector.
        this.records.set(INJECTOR, makeRecord(undefined, this));
        // And `EnvironmentInjector` if the current injector is supposed to be env-scoped.
        if (scopes.has('environment')) {
            this.records.set(EnvironmentInjector, makeRecord(undefined, this));
        }
        // Detect whether this injector has the APP_ROOT_SCOPE token and thus should provide
        // any injectable scoped to APP_ROOT_SCOPE.
        const record = this.records.get(INJECTOR_SCOPE);
        if (record != null && typeof record.value === 'string') {
            this.scopes.add(record.value);
        }
        this.injectorDefTypes = new Set(this.get(INJECTOR_DEF_TYPES, EMPTY_ARRAY, InjectFlags.Self));
    }
    /**
     * Destroy the injector and release references to every instance or provider associated with it.
     *
     * Also calls the `OnDestroy` lifecycle hooks of every instance that was created for which a
     * hook was found.
     */
    destroy() {
        this.assertNotDestroyed();
        // Set destroyed = true first, in case lifecycle hooks re-enter destroy().
        this._destroyed = true;
        const prevConsumer = setActiveConsumer(null);
        try {
            // Call all the lifecycle hooks.
            for (const service of this._ngOnDestroyHooks) {
                service.ngOnDestroy();
            }
            const onDestroyHooks = this._onDestroyHooks;
            // Reset the _onDestroyHooks array before iterating over it to prevent hooks that unregister
            // themselves from mutating the array during iteration.
            this._onDestroyHooks = [];
            for (const hook of onDestroyHooks) {
                hook();
            }
        }
        finally {
            // Release all references.
            this.records.clear();
            this._ngOnDestroyHooks.clear();
            this.injectorDefTypes.clear();
            setActiveConsumer(prevConsumer);
        }
    }
    onDestroy(callback) {
        this.assertNotDestroyed();
        this._onDestroyHooks.push(callback);
        return () => this.removeOnDestroy(callback);
    }
    runInContext(fn) {
        this.assertNotDestroyed();
        const previousInjector = setCurrentInjector(this);
        const previousInjectImplementation = setInjectImplementation(undefined);
        let prevInjectContext;
        if (ngDevMode) {
            prevInjectContext = setInjectorProfilerContext({ injector: this, token: null });
        }
        try {
            return fn();
        }
        finally {
            setCurrentInjector(previousInjector);
            setInjectImplementation(previousInjectImplementation);
            ngDevMode && setInjectorProfilerContext(prevInjectContext);
        }
    }
    get(token, notFoundValue = THROW_IF_NOT_FOUND, flags = InjectFlags.Default) {
        this.assertNotDestroyed();
        if (token.hasOwnProperty(NG_ENV_ID)) {
            return token[NG_ENV_ID](this);
        }
        flags = convertToBitFlags(flags);
        // Set the injection context.
        let prevInjectContext;
        if (ngDevMode) {
            prevInjectContext = setInjectorProfilerContext({ injector: this, token: token });
        }
        const previousInjector = setCurrentInjector(this);
        const previousInjectImplementation = setInjectImplementation(undefined);
        try {
            // Check for the SkipSelf flag.
            if (!(flags & InjectFlags.SkipSelf)) {
                // SkipSelf isn't set, check if the record belongs to this injector.
                let record = this.records.get(token);
                if (record === undefined) {
                    // No record, but maybe the token is scoped to this injector. Look for an injectable
                    // def with a scope matching this injector.
                    const def = couldBeInjectableType(token) && getInjectableDef(token);
                    if (def && this.injectableDefInScope(def)) {
                        // Found an injectable def and it's scoped to this injector. Pretend as if it was here
                        // all along.
                        if (ngDevMode) {
                            runInInjectorProfilerContext(this, token, () => {
                                emitProviderConfiguredEvent(token);
                            });
                        }
                        record = makeRecord(injectableDefOrInjectorDefFactory(token), NOT_YET);
                    }
                    else {
                        record = null;
                    }
                    this.records.set(token, record);
                }
                // If a record was found, get the instance for it and return it.
                if (record != null /* NOT null || undefined */) {
                    return this.hydrate(token, record);
                }
            }
            // Select the next injector based on the Self flag - if self is set, the next injector is
            // the NullInjector, otherwise it's the parent.
            const nextInjector = !(flags & InjectFlags.Self) ? this.parent : getNullInjector();
            // Set the notFoundValue based on the Optional flag - if optional is set and notFoundValue
            // is undefined, the value is null, otherwise it's the notFoundValue.
            notFoundValue =
                flags & InjectFlags.Optional && notFoundValue === THROW_IF_NOT_FOUND ? null : notFoundValue;
            return nextInjector.get(token, notFoundValue);
        }
        catch (e) {
            if (e.name === 'NullInjectorError') {
                const path = (e[NG_TEMP_TOKEN_PATH] = e[NG_TEMP_TOKEN_PATH] || []);
                path.unshift(stringify(token));
                if (previousInjector) {
                    // We still have a parent injector, keep throwing
                    throw e;
                }
                else {
                    // Format & throw the final error message when we don't have any previous injector
                    return catchInjectorError(e, token, 'R3InjectorError', this.source);
                }
            }
            else {
                throw e;
            }
        }
        finally {
            // Lastly, restore the previous injection context.
            setInjectImplementation(previousInjectImplementation);
            setCurrentInjector(previousInjector);
            ngDevMode && setInjectorProfilerContext(prevInjectContext);
        }
    }
    /** @internal */
    resolveInjectorInitializers() {
        const prevConsumer = setActiveConsumer(null);
        const previousInjector = setCurrentInjector(this);
        const previousInjectImplementation = setInjectImplementation(undefined);
        let prevInjectContext;
        if (ngDevMode) {
            prevInjectContext = setInjectorProfilerContext({ injector: this, token: null });
        }
        try {
            const initializers = this.get(ENVIRONMENT_INITIALIZER, EMPTY_ARRAY, InjectFlags.Self);
            if (ngDevMode && !Array.isArray(initializers)) {
                throw new RuntimeError(-209 /* RuntimeErrorCode.INVALID_MULTI_PROVIDER */, 'Unexpected type of the `ENVIRONMENT_INITIALIZER` token value ' +
                    `(expected an array, but got ${typeof initializers}). ` +
                    'Please check that the `ENVIRONMENT_INITIALIZER` token is configured as a ' +
                    '`multi: true` provider.');
            }
            for (const initializer of initializers) {
                initializer();
            }
        }
        finally {
            setCurrentInjector(previousInjector);
            setInjectImplementation(previousInjectImplementation);
            ngDevMode && setInjectorProfilerContext(prevInjectContext);
            setActiveConsumer(prevConsumer);
        }
    }
    toString() {
        const tokens = [];
        const records = this.records;
        for (const token of records.keys()) {
            tokens.push(stringify(token));
        }
        return `R3Injector[${tokens.join(', ')}]`;
    }
    assertNotDestroyed() {
        if (this._destroyed) {
            throw new RuntimeError(205 /* RuntimeErrorCode.INJECTOR_ALREADY_DESTROYED */, ngDevMode && 'Injector has already been destroyed.');
        }
    }
    /**
     * Process a `SingleProvider` and add it.
     */
    processProvider(provider) {
        // Determine the token from the provider. Either it's its own token, or has a {provide: ...}
        // property.
        provider = resolveForwardRef(provider);
        let token = isTypeProvider(provider)
            ? provider
            : resolveForwardRef(provider && provider.provide);
        // Construct a `Record` for the provider.
        const record = providerToRecord(provider);
        if (ngDevMode) {
            runInInjectorProfilerContext(this, token, () => {
                // Emit InjectorProfilerEventType.Create if provider is a value provider because
                // these are the only providers that do not go through the value hydration logic
                // where this event would normally be emitted from.
                if (isValueProvider(provider)) {
                    emitInstanceCreatedByInjectorEvent(provider.useValue);
                }
                emitProviderConfiguredEvent(provider);
            });
        }
        if (!isTypeProvider(provider) && provider.multi === true) {
            // If the provider indicates that it's a multi-provider, process it specially.
            // First check whether it's been defined already.
            let multiRecord = this.records.get(token);
            if (multiRecord) {
                // It has. Throw a nice error if
                if (ngDevMode && multiRecord.multi === undefined) {
                    throwMixedMultiProviderError();
                }
            }
            else {
                multiRecord = makeRecord(undefined, NOT_YET, true);
                multiRecord.factory = () => injectArgs(multiRecord.multi);
                this.records.set(token, multiRecord);
            }
            token = provider;
            multiRecord.multi.push(provider);
        }
        else {
            if (ngDevMode) {
                const existing = this.records.get(token);
                if (existing && existing.multi !== undefined) {
                    throwMixedMultiProviderError();
                }
            }
        }
        this.records.set(token, record);
    }
    hydrate(token, record) {
        const prevConsumer = setActiveConsumer(null);
        try {
            if (ngDevMode && record.value === CIRCULAR) {
                throwCyclicDependencyError(stringify(token));
            }
            else if (record.value === NOT_YET) {
                record.value = CIRCULAR;
                if (ngDevMode) {
                    runInInjectorProfilerContext(this, token, () => {
                        record.value = record.factory();
                        emitInstanceCreatedByInjectorEvent(record.value);
                    });
                }
                else {
                    record.value = record.factory();
                }
            }
            if (typeof record.value === 'object' && record.value && hasOnDestroy(record.value)) {
                this._ngOnDestroyHooks.add(record.value);
            }
            return record.value;
        }
        finally {
            setActiveConsumer(prevConsumer);
        }
    }
    injectableDefInScope(def) {
        if (!def.providedIn) {
            return false;
        }
        const providedIn = resolveForwardRef(def.providedIn);
        if (typeof providedIn === 'string') {
            return providedIn === 'any' || this.scopes.has(providedIn);
        }
        else {
            return this.injectorDefTypes.has(providedIn);
        }
    }
    removeOnDestroy(callback) {
        const destroyCBIdx = this._onDestroyHooks.indexOf(callback);
        if (destroyCBIdx !== -1) {
            this._onDestroyHooks.splice(destroyCBIdx, 1);
        }
    }
}
function injectableDefOrInjectorDefFactory(token) {
    // Most tokens will have an injectable def directly on them, which specifies a factory directly.
    const injectableDef = getInjectableDef(token);
    const factory = injectableDef !== null ? injectableDef.factory : getFactoryDef(token);
    if (factory !== null) {
        return factory;
    }
    // InjectionTokens should have an injectable def (ɵprov) and thus should be handled above.
    // If it's missing that, it's an error.
    if (token instanceof InjectionToken) {
        throw new RuntimeError(204 /* RuntimeErrorCode.INVALID_INJECTION_TOKEN */, ngDevMode && `Token ${stringify(token)} is missing a ɵprov definition.`);
    }
    // Undecorated types can sometimes be created if they have no constructor arguments.
    if (token instanceof Function) {
        return getUndecoratedInjectableFactory(token);
    }
    // There was no way to resolve a factory for this token.
    throw new RuntimeError(204 /* RuntimeErrorCode.INVALID_INJECTION_TOKEN */, ngDevMode && 'unreachable');
}
function getUndecoratedInjectableFactory(token) {
    // If the token has parameters then it has dependencies that we cannot resolve implicitly.
    const paramLength = token.length;
    if (paramLength > 0) {
        throw new RuntimeError(204 /* RuntimeErrorCode.INVALID_INJECTION_TOKEN */, ngDevMode &&
            `Can't resolve all parameters for ${stringify(token)}: (${newArray(paramLength, '?').join(', ')}).`);
    }
    // The constructor function appears to have no parameters.
    // This might be because it inherits from a super-class. In which case, use an injectable
    // def from an ancestor if there is one.
    // Otherwise this really is a simple class with no dependencies, so return a factory that
    // just instantiates the zero-arg constructor.
    const inheritedInjectableDef = getInheritedInjectableDef(token);
    if (inheritedInjectableDef !== null) {
        return () => inheritedInjectableDef.factory(token);
    }
    else {
        return () => new token();
    }
}
function providerToRecord(provider) {
    if (isValueProvider(provider)) {
        return makeRecord(undefined, provider.useValue);
    }
    else {
        const factory = providerToFactory(provider);
        return makeRecord(factory, NOT_YET);
    }
}
/**
 * Converts a `SingleProvider` into a factory function.
 *
 * @param provider provider to convert to factory
 */
export function providerToFactory(provider, ngModuleType, providers) {
    let factory = undefined;
    if (ngDevMode && isEnvironmentProviders(provider)) {
        throwInvalidProviderError(undefined, providers, provider);
    }
    if (isTypeProvider(provider)) {
        const unwrappedProvider = resolveForwardRef(provider);
        return getFactoryDef(unwrappedProvider) || injectableDefOrInjectorDefFactory(unwrappedProvider);
    }
    else {
        if (isValueProvider(provider)) {
            factory = () => resolveForwardRef(provider.useValue);
        }
        else if (isFactoryProvider(provider)) {
            factory = () => provider.useFactory(...injectArgs(provider.deps || []));
        }
        else if (isExistingProvider(provider)) {
            factory = () => ɵɵinject(resolveForwardRef(provider.useExisting));
        }
        else {
            const classRef = resolveForwardRef(provider &&
                (provider.useClass || provider.provide));
            if (ngDevMode && !classRef) {
                throwInvalidProviderError(ngModuleType, providers, provider);
            }
            if (hasDeps(provider)) {
                factory = () => new classRef(...injectArgs(provider.deps));
            }
            else {
                return getFactoryDef(classRef) || injectableDefOrInjectorDefFactory(classRef);
            }
        }
    }
    return factory;
}
function makeRecord(factory, value, multi = false) {
    return {
        factory: factory,
        value: value,
        multi: multi ? [] : undefined,
    };
}
function hasDeps(value) {
    return !!value.deps;
}
function hasOnDestroy(value) {
    return (value !== null &&
        typeof value === 'object' &&
        typeof value.ngOnDestroy === 'function');
}
function couldBeInjectableType(value) {
    return (typeof value === 'function' || (typeof value === 'object' && value instanceof InjectionToken));
}
function forEachSingleProvider(providers, fn) {
    for (const provider of providers) {
        if (Array.isArray(provider)) {
            forEachSingleProvider(provider, fn);
        }
        else if (provider && isEnvironmentProviders(provider)) {
            forEachSingleProvider(provider.ɵproviders, fn);
        }
        else {
            fn(provider);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicjNfaW5qZWN0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9kaS9yM19pbmplY3Rvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLHFCQUFxQixDQUFDO0FBRTdCLE9BQU8sRUFBQyxZQUFZLEVBQW1CLE1BQU0sV0FBVyxDQUFDO0FBR3pELE9BQU8sRUFDTCxrQ0FBa0MsRUFDbEMsMkJBQTJCLEVBRTNCLDRCQUE0QixFQUM1QiwwQkFBMEIsR0FDM0IsTUFBTSxvQ0FBb0MsQ0FBQztBQUM1QyxPQUFPLEVBQVksYUFBYSxFQUFDLE1BQU0sK0JBQStCLENBQUM7QUFDdkUsT0FBTyxFQUNMLDBCQUEwQixFQUMxQix5QkFBeUIsRUFDekIsNEJBQTRCLEdBQzdCLE1BQU0sc0JBQXNCLENBQUM7QUFDOUIsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQzVDLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUM3QyxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQzFDLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUU1QyxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDaEQsT0FBTyxFQUFDLHVCQUF1QixFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDNUQsT0FBTyxFQUFDLHVCQUF1QixFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDeEQsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBRWpELE9BQU8sRUFDTCxrQkFBa0IsRUFDbEIsaUJBQWlCLEVBQ2pCLFVBQVUsRUFDVixrQkFBa0IsRUFDbEIsa0JBQWtCLEVBQ2xCLGtCQUFrQixFQUNsQixRQUFRLEdBQ1QsTUFBTSwwQkFBMEIsQ0FBQztBQUNsQyxPQUFP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SyxFQUFFLEtBQUs7UUFDWixLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVM7S0FDOUIsQ0FBQztBQUNKLENBQUM7QUFFRCxTQUFTLE9BQU8sQ0FDZCxLQUFnRTtJQUVoRSxPQUFPLENBQUMsQ0FBRSxLQUFhLENBQUMsSUFBSSxDQUFDO0FBQy9CLENBQUM7QUFFRCxTQUFTLFlBQVksQ0FBQyxLQUFVO0lBQzlCLE9BQU8sQ0FDTCxLQUFLLEtBQUssSUFBSTtRQUNkLE9BQU8sS0FBSyxLQUFLLFFBQVE7UUFDekIsT0FBUSxLQUFtQixDQUFDLFdBQVcsS0FBSyxVQUFVLENBQ3ZELENBQUM7QUFDSixDQUFDO0FBRUQsU0FBUyxxQkFBcUIsQ0FBQyxLQUFVO0lBQ3ZDLE9BQU8sQ0FDTCxPQUFPLEtBQUssS0FBSyxVQUFVLElBQUksQ0FBQyxPQUFPLEtBQUssS0FBSyxRQUFRLElBQUksS0FBSyxZQUFZLGNBQWMsQ0FBQyxDQUM5RixDQUFDO0FBQ0osQ0FBQztBQUVELFNBQVMscUJBQXFCLENBQzVCLFNBQWlELEVBQ2pELEVBQXNDO0lBRXRDLEtBQUssTUFBTSxRQUFRLElBQUksU0FBUyxFQUFFLENBQUM7UUFDakMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7WUFDNUIscUJBQXFCLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3RDLENBQUM7YUFBTSxJQUFJLFFBQVEsSUFBSSxzQkFBc0IsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO1lBQ3hELHFCQUFxQixDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDakQsQ0FBQzthQUFNLENBQUM7WUFDTixFQUFFLENBQUMsUUFBMEIsQ0FBQyxDQUFDO1FBQ2pDLENBQUM7SUFDSCxDQUFDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICcuLi91dGlsL25nX2Rldl9tb2RlJztcblxuaW1wb3J0IHtSdW50aW1lRXJyb3IsIFJ1bnRpbWVFcnJvckNvZGV9IGZyb20gJy4uL2Vycm9ycyc7XG5pbXBvcnQge09uRGVzdHJveX0gZnJvbSAnLi4vaW50ZXJmYWNlL2xpZmVjeWNsZV9ob29rcyc7XG5pbXBvcnQge1R5cGV9IGZyb20gJy4uL2ludGVyZmFjZS90eXBlJztcbmltcG9ydCB7XG4gIGVtaXRJbnN0YW5jZUNyZWF0ZWRCeUluamVjdG9yRXZlbnQsXG4gIGVtaXRQcm92aWRlckNvbmZpZ3VyZWRFdmVudCxcbiAgSW5qZWN0b3JQcm9maWxlckNvbnRleHQsXG4gIHJ1bkluSW5qZWN0b3JQcm9maWxlckNvbnRleHQsXG4gIHNldEluamVjdG9yUHJvZmlsZXJDb250ZXh0LFxufSBmcm9tICcuLi9yZW5kZXIzL2RlYnVnL2luamVjdG9yX3Byb2ZpbGVyJztcbmltcG9ydCB7RmFjdG9yeUZuLCBnZXRGYWN0b3J5RGVmfSBmcm9tICcuLi9yZW5kZXIzL2RlZmluaXRpb25fZmFjdG9yeSc7XG5pbXBvcnQge1xuICB0aHJvd0N5Y2xpY0RlcGVuZGVuY3lFcnJvcixcbiAgdGhyb3dJbnZhbGlkUHJvdmlkZXJFcnJvcixcbiAgdGhyb3dNaXhlZE11bHRpUHJvdmlkZXJFcnJvcixcbn0gZnJvbSAnLi4vcmVuZGVyMy9lcnJvcnNfZGknO1xuaW1wb3J0IHtOR19FTlZfSUR9IGZyb20gJy4uL3JlbmRlcjMvZmllbGRzJztcbmltcG9ydCB7bmV3QXJyYXl9IGZyb20gJy4uL3V0aWwvYXJyYXlfdXRpbHMnO1xuaW1wb3J0IHtFTVBUWV9BUlJBWX0gZnJvbSAnLi4vdXRpbC9lbXB0eSc7XG5pbXBvcnQge3N0cmluZ2lmeX0gZnJvbSAnLi4vdXRpbC9zdHJpbmdpZnknO1xuXG5pbXBvcnQge3Jlc29sdmVGb3J3YXJkUmVmfSBmcm9tICcuL2ZvcndhcmRfcmVmJztcbmltcG9ydCB7RU5WSVJPTk1FTlRfSU5JVElBTElaRVJ9IGZyb20gJy4vaW5pdGlhbGl6ZXJfdG9rZW4nO1xuaW1wb3J0IHtzZXRJbmplY3RJbXBsZW1lbnRhdGlvbn0gZnJvbSAnLi9pbmplY3Rfc3dpdGNoJztcbmltcG9ydCB7SW5qZWN0aW9uVG9rZW59IGZyb20gJy4vaW5qZWN0aW9uX3Rva2VuJztcbmltcG9ydCB0eXBlIHtJbmplY3Rvcn0gZnJvbSAnLi9pbmplY3Rvcic7XG5pbXBvcnQge1xuICBjYXRjaEluamVjdG9yRXJyb3IsXG4gIGNvbnZlcnRUb0JpdEZsYWdzLFxuICBpbmplY3RBcmdzLFxuICBOR19URU1QX1RPS0VOX1BBVEgsXG4gIHNldEN1cnJlbnRJbmplY3RvcixcbiAgVEhST1dfSUZfTk9UX0ZPVU5ELFxuICDJtcm1aW5qZWN0LFxufSBmcm9tICcuL2luamVjdG9yX2NvbXBhdGliaWxpdHknO1xuaW1wb3J0IHtJTkpFQ1RPUn0gZnJvbSAnLi9pbmplY3Rvcl90b2tlbic7XG5pbXBvcnQge1xuICBnZXRJbmhlcml0ZWRJbmplY3RhYmxlRGVmLFxuICBnZXRJbmplY3RhYmxlRGVmLFxuICBJbmplY3RvclR5cGUsXG4gIMm1ybVJbmplY3RhYmxlRGVjbGFyYXRpb24sXG59IGZyb20gJy4vaW50ZXJmYWNlL2RlZnMnO1xuaW1wb3J0IHtJbmplY3RGbGFncywgSW5qZWN0T3B0aW9uc30gZnJvbSAnLi9pbnRlcmZhY2UvaW5qZWN0b3InO1xuaW1wb3J0IHtcbiAgQ2xhc3NQcm92aWRlcixcbiAgQ29uc3RydWN0b3JQcm92aWRlcixcbiAgRW52aXJvbm1lbnRQcm92aWRlcnMsXG4gIEludGVybmFsRW52aXJvbm1lbnRQcm92aWRlcnMsXG4gIGlzRW52aXJvbm1lbnRQcm92aWRlcnMsXG4gIFByb3ZpZGVyLFxuICBTdGF0aWNDbGFzc1Byb3ZpZGVyLFxuICBUeXBlUHJvdmlkZXIsXG59IGZyb20gJy4vaW50ZXJmYWNlL3Byb3ZpZGVyJztcbmltcG9ydCB7SU5KRUNUT1JfREVGX1RZUEVTfSBmcm9tICcuL2ludGVybmFsX3Rva2Vucyc7XG5pbXBvcnQge051bGxJbmplY3Rvcn0gZnJvbSAnLi9udWxsX2luamVjdG9yJztcbmltcG9ydCB7XG4gIGlzRXhpc3RpbmdQcm92aWRlcixcbiAgaXNGYWN0b3J5UHJvdmlkZXIsXG4gIGlzVHlwZVByb3ZpZGVyLFxuICBpc1ZhbHVlUHJvdmlkZXIsXG4gIFNpbmdsZVByb3ZpZGVyLFxufSBmcm9tICcuL3Byb3ZpZGVyX2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtQcm92aWRlclRva2VufSBmcm9tICcuL3Byb3ZpZGVyX3Rva2VuJztcbmltcG9ydCB7SU5KRUNUT1JfU0NPUEUsIEluamVjdG9yU2NvcGV9IGZyb20gJy4vc2NvcGUnO1xuaW1wb3J0IHtzZXRBY3RpdmVDb25zdW1lcn0gZnJvbSAnQGFuZ3VsYXIvY29yZS9wcmltaXRpdmVzL3NpZ25hbHMnO1xuXG4vKipcbiAqIE1hcmtlciB3aGljaCBpbmRpY2F0ZXMgdGhhdCBhIHZhbHVlIGhhcyBub3QgeWV0IGJlZW4gY3JlYXRlZCBmcm9tIHRoZSBmYWN0b3J5IGZ1bmN0aW9uLlxuICovXG5jb25zdCBOT1RfWUVUID0ge307XG5cbi8qKlxuICogTWFya2VyIHdoaWNoIGluZGljYXRlcyB0aGF0IHRoZSBmYWN0b3J5IGZ1bmN0aW9uIGZvciBhIHRva2VuIGlzIGluIHRoZSBwcm9jZXNzIG9mIGJlaW5nIGNhbGxlZC5cbiAqXG4gKiBJZiB0aGUgaW5qZWN0b3IgaXMgYXNrZWQgdG8gaW5qZWN0IGEgdG9rZW4gd2l0aCBpdHMgdmFsdWUgc2V0IHRvIENJUkNVTEFSLCB0aGF0IGluZGljYXRlc1xuICogaW5qZWN0aW9uIG9mIGEgZGVwZW5kZW5jeSBoYXMgcmVjdXJzaXZlbHkgYXR0ZW1wdGVkIHRvIGluamVjdCB0aGUgb3JpZ2luYWwgdG9rZW4sIGFuZCB0aGVyZSBpc1xuICogYSBjaXJjdWxhciBkZXBlbmRlbmN5IGFtb25nIHRoZSBwcm92aWRlcnMuXG4gKi9cbmNvbnN0IENJUkNVTEFSID0ge307XG5cbi8qKlxuICogQSBsYXppbHkgaW5pdGlhbGl6ZWQgTnVsbEluamVjdG9yLlxuICovXG5sZXQgTlVMTF9JTkpFQ1RPUjogSW5qZWN0b3IgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXROdWxsSW5qZWN0b3IoKTogSW5qZWN0b3Ige1xuICBpZiAoTlVMTF9JTkpFQ1RPUiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgTlVMTF9JTkpFQ1RPUiA9IG5ldyBOdWxsSW5qZWN0b3IoKTtcbiAgfVxuICByZXR1cm4gTlVMTF9JTkpFQ1RPUjtcbn1cblxuLyoqXG4gKiBBbiBlbnRyeSBpbiB0aGUgaW5qZWN0b3Igd2hpY2ggdHJhY2tzIGluZm9ybWF0aW9uIGFib3V0IHRoZSBnaXZlbiB0b2tlbiwgaW5jbHVkaW5nIGEgcG9zc2libGVcbiAqIGN1cnJlbnQgdmFsdWUuXG4gKi9cbmludGVyZmFjZSBSZWNvcmQ8VD4ge1xuICBmYWN0b3J5OiAoKCkgPT4gVCkgfCB1bmRlZmluZWQ7XG4gIHZhbHVlOiBUIHwge307XG4gIG11bHRpOiBhbnlbXSB8IHVuZGVmaW5lZDtcbn1cblxuLyoqXG4gKiBBbiBgSW5qZWN0b3JgIHRoYXQncyBwYXJ0IG9mIHRoZSBlbnZpcm9ubWVudCBpbmplY3RvciBoaWVyYXJjaHksIHdoaWNoIGV4aXN0cyBvdXRzaWRlIG9mIHRoZVxuICogY29tcG9uZW50IHRyZWUuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBFbnZpcm9ubWVudEluamVjdG9yIGltcGxlbWVudHMgSW5qZWN0b3Ige1xuICAvKipcbiAgICogUmV0cmlldmVzIGFuIGluc3RhbmNlIGZyb20gdGhlIGluamVjdG9yIGJhc2VkIG9uIHRoZSBwcm92aWRlZCB0b2tlbi5cbiAgICogQHJldHVybnMgVGhlIGluc3RhbmNlIGZyb20gdGhlIGluamVjdG9yIGlmIGRlZmluZWQsIG90aGVyd2lzZSB0aGUgYG5vdEZvdW5kVmFsdWVgLlxuICAgKiBAdGhyb3dzIFdoZW4gdGhlIGBub3RGb3VuZFZhbHVlYCBpcyBgdW5kZWZpbmVkYCBvciBgSW5qZWN0b3IuVEhST1dfSUZfTk9UX0ZPVU5EYC5cbiAgICovXG4gIGFic3RyYWN0IGdldDxUPihcbiAgICB0b2tlbjogUHJvdmlkZXJUb2tlbjxUPixcbiAgICBub3RGb3VuZFZhbHVlOiB1bmRlZmluZWQsXG4gICAgb3B0aW9uczogSW5qZWN0T3B0aW9ucyAmIHtcbiAgICAgIG9wdGlvbmFsPzogZmFsc2U7XG4gICAgfSxcbiAgKTogVDtcbiAgLyoqXG4gICAqIFJldHJpZXZlcyBhbiBpbnN0YW5jZSBmcm9tIHRoZSBpbmplY3RvciBiYXNlZCBvbiB0aGUgcHJvdmlkZWQgdG9rZW4uXG4gICAqIEByZXR1cm5zIFRoZSBpbnN0YW5jZSBmcm9tIHRoZSBpbmplY3RvciBpZiBkZWZpbmVkLCBvdGhlcndpc2UgdGhlIGBub3RGb3VuZFZhbHVlYC5cbiAgICogQHRocm93cyBXaGVuIHRoZSBgbm90Rm91bmRWYWx1ZWAgaXMgYHVuZGVmaW5lZGAgb3IgYEluamVjdG9yLlRIUk9XX0lGX05PVF9GT1VORGAuXG4gICAqL1xuICBhYnN0cmFjdCBnZXQ8VD4oXG4gICAgdG9rZW46IFByb3ZpZGVyVG9rZW48VD4sXG4gICAgbm90Rm91bmRWYWx1ZTogbnVsbCB8IHVuZGVmaW5lZCxcbiAgICBvcHRpb25zOiBJbmplY3RPcHRpb25zLFxuICApOiBUIHwgbnVsbDtcbiAgLyoqXG4gICAqIFJldHJpZXZlcyBhbiBpbnN0YW5jZSBmcm9tIHRoZSBpbmplY3RvciBiYXNlZCBvbiB0aGUgcHJvdmlkZWQgdG9rZW4uXG4gICAqIEByZXR1cm5zIFRoZSBpbnN0YW5jZSBmcm9tIHRoZSBpbmplY3RvciBpZiBkZWZpbmVkLCBvdGhlcndpc2UgdGhlIGBub3RGb3VuZFZhbHVlYC5cbiAgICogQHRocm93cyBXaGVuIHRoZSBgbm90Rm91bmRWYWx1ZWAgaXMgYHVuZGVmaW5lZGAgb3IgYEluamVjdG9yLlRIUk9XX0lGX05PVF9GT1VORGAuXG4gICAqL1xuICBhYnN0cmFjdCBnZXQ8VD4odG9rZW46IFByb3ZpZGVyVG9rZW48VD4sIG5vdEZvdW5kVmFsdWU/OiBULCBvcHRpb25zPzogSW5qZWN0T3B0aW9ucyk6IFQ7XG4gIC8qKlxuICAgKiBSZXRyaWV2ZXMgYW4gaW5zdGFuY2UgZnJvbSB0aGUgaW5qZWN0b3IgYmFzZWQgb24gdGhlIHByb3ZpZGVkIHRva2VuLlxuICAgKiBAcmV0dXJucyBUaGUgaW5zdGFuY2UgZnJvbSB0aGUgaW5qZWN0b3IgaWYgZGVmaW5lZCwgb3RoZXJ3aXNlIHRoZSBgbm90Rm91bmRWYWx1ZWAuXG4gICAqIEB0aHJvd3MgV2hlbiB0aGUgYG5vdEZvdW5kVmFsdWVgIGlzIGB1bmRlZmluZWRgIG9yIGBJbmplY3Rvci5USFJPV19JRl9OT1RfRk9VTkRgLlxuICAgKiBAZGVwcmVjYXRlZCB1c2Ugb2JqZWN0LWJhc2VkIGZsYWdzIChgSW5qZWN0T3B0aW9uc2ApIGluc3RlYWQuXG4gICAqL1xuICBhYnN0cmFjdCBnZXQ8VD4odG9rZW46IFByb3ZpZGVyVG9rZW48VD4sIG5vdEZvdW5kVmFsdWU/OiBULCBmbGFncz86IEluamVjdEZsYWdzKTogVDtcbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkIGZyb20gdjQuMC4wIHVzZSBQcm92aWRlclRva2VuPFQ+XG4gICAqIEBzdXBwcmVzcyB7ZHVwbGljYXRlfVxuICAgKi9cbiAgYWJzdHJhY3QgZ2V0KHRva2VuOiBhbnksIG5vdEZvdW5kVmFsdWU/OiBhbnkpOiBhbnk7XG5cbiAgLyoqXG4gICAqIFJ1bnMgdGhlIGdpdmVuIGZ1bmN0aW9uIGluIHRoZSBjb250ZXh0IG9mIHRoaXMgYEVudmlyb25tZW50SW5qZWN0b3JgLlxuICAgKlxuICAgKiBXaXRoaW4gdGhlIGZ1bmN0aW9uJ3Mgc3RhY2sgZnJhbWUsIFtgaW5qZWN0YF0oYXBpL2NvcmUvaW5qZWN0KSBjYW4gYmUgdXNlZCB0byBpbmplY3RcbiAgICogZGVwZW5kZW5jaWVzIGZyb20gdGhpcyBpbmplY3Rvci4gTm90ZSB0aGF0IGBpbmplY3RgIGlzIG9ubHkgdXNhYmxlIHN5bmNocm9ub3VzbHksIGFuZCBjYW5ub3QgYmVcbiAgICogdXNlZCBpbiBhbnkgYXN5bmNocm9ub3VzIGNhbGxiYWNrcyBvciBhZnRlciBhbnkgYGF3YWl0YCBwb2ludHMuXG4gICAqXG4gICAqIEBwYXJhbSBmbiB0aGUgY2xvc3VyZSB0byBiZSBydW4gaW4gdGhlIGNvbnRleHQgb2YgdGhpcyBpbmplY3RvclxuICAgKiBAcmV0dXJucyB0aGUgcmV0dXJuIHZhbHVlIG9mIHRoZSBmdW5jdGlvbiwgaWYgYW55XG4gICAqIEBkZXByZWNhdGVkIHVzZSB0aGUgc3RhbmRhbG9uZSBmdW5jdGlvbiBgcnVuSW5JbmplY3Rpb25Db250ZXh0YCBpbnN0ZWFkXG4gICAqL1xuICBhYnN0cmFjdCBydW5JbkNvbnRleHQ8UmV0dXJuVD4oZm46ICgpID0+IFJldHVyblQpOiBSZXR1cm5UO1xuXG4gIGFic3RyYWN0IGRlc3Ryb3koKTogdm9pZDtcblxuICAvKipcbiAgICogQGludGVybmFsXG4gICAqL1xuICBhYnN0cmFjdCBvbkRlc3Ryb3koY2FsbGJhY2s6ICgpID0+IHZvaWQpOiAoKSA9PiB2b2lkO1xufVxuXG5leHBvcnQgY2xhc3MgUjNJbmplY3RvciBleHRlbmRzIEVudmlyb25tZW50SW5qZWN0b3Ige1xuICAvKipcbiAgICogTWFwIG9mIHRva2VucyB0byByZWNvcmRzIHdoaWNoIGNvbnRhaW4gdGhlIGluc3RhbmNlcyBvZiB0aG9zZSB0b2tlbnMuXG4gICAqIC0gYG51bGxgIHZhbHVlIGltcGxpZXMgdGhhdCB3ZSBkb24ndCBoYXZlIHRoZSByZWNvcmQuIFVzZWQgYnkgdHJlZS1zaGFrYWJsZSBpbmplY3RvcnNcbiAgICogdG8gcHJldmVudCBmdXJ0aGVyIHNlYXJjaGVzLlxuICAgKi9cbiAgcHJpdmF0ZSByZWNvcmRzID0gbmV3IE1hcDxQcm92aWRlclRva2VuPGFueT4sIFJlY29yZDxhbnk+IHwgbnVsbD4oKTtcblxuICAvKipcbiAgICogU2V0IG9mIHZhbHVlcyBpbnN0YW50aWF0ZWQgYnkgdGhpcyBpbmplY3RvciB3aGljaCBjb250YWluIGBuZ09uRGVzdHJveWAgbGlmZWN5Y2xlIGhvb2tzLlxuICAgKi9cbiAgcHJpdmF0ZSBfbmdPbkRlc3Ryb3lIb29rcyA9IG5ldyBTZXQ8T25EZXN0cm95PigpO1xuXG4gIHByaXZhdGUgX29uRGVzdHJveUhvb2tzOiBBcnJheTwoKSA9PiB2b2lkPiA9IFtdO1xuXG4gIC8qKlxuICAgKiBGbGFnIGluZGljYXRpbmcgdGhhdCB0aGlzIGluamVjdG9yIHdhcyBwcmV2aW91c2x5IGRlc3Ryb3llZC5cbiAgICovXG4gIGdldCBkZXN0cm95ZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2Rlc3Ryb3llZDtcbiAgfVxuICBwcml2YXRlIF9kZXN0cm95ZWQgPSBmYWxzZTtcblxuICBwcml2YXRlIGluamVjdG9yRGVmVHlwZXM6IFNldDxUeXBlPHVua25vd24+PjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcm92aWRlcnM6IEFycmF5PFByb3ZpZGVyIHwgRW52aXJvbm1lbnRQcm92aWRlcnM+LFxuICAgIHJlYWRvbmx5IHBhcmVudDogSW5qZWN0b3IsXG4gICAgcmVhZG9ubHkgc291cmNlOiBzdHJpbmcgfCBudWxsLFxuICAgIHJlYWRvbmx5IHNjb3BlczogU2V0PEluamVjdG9yU2NvcGU+LFxuICApIHtcbiAgICBzdXBlcigpO1xuICAgIC8vIFN0YXJ0IG9mZiBieSBjcmVhdGluZyBSZWNvcmRzIGZvciBldmVyeSBwcm92aWRlci5cbiAgICBmb3JFYWNoU2luZ2xlUHJvdmlkZXIocHJvdmlkZXJzIGFzIEFycmF5PFByb3ZpZGVyIHwgSW50ZXJuYWxFbnZpcm9ubWVudFByb3ZpZGVycz4sIChwcm92aWRlcikgPT5cbiAgICAgIHRoaXMucHJvY2Vzc1Byb3ZpZGVyKHByb3ZpZGVyKSxcbiAgICApO1xuXG4gICAgLy8gTWFrZSBzdXJlIHRoZSBJTkpFQ1RPUiB0b2tlbiBwcm92aWRlcyB0aGlzIGluamVjdG9yLlxuICAgIHRoaXMucmVjb3Jkcy5zZXQoSU5KRUNUT1IsIG1ha2VSZWNvcmQodW5kZWZpbmVkLCB0aGlzKSk7XG5cbiAgICAvLyBBbmQgYEVudmlyb25tZW50SW5qZWN0b3JgIGlmIHRoZSBjdXJyZW50IGluamVjdG9yIGlzIHN1cHBvc2VkIHRvIGJlIGVudi1zY29wZWQuXG4gICAgaWYgKHNjb3Blcy5oYXMoJ2Vudmlyb25tZW50JykpIHtcbiAgICAgIHRoaXMucmVjb3Jkcy5zZXQoRW52aXJvbm1lbnRJbmplY3RvciwgbWFrZVJlY29yZCh1bmRlZmluZWQsIHRoaXMpKTtcbiAgICB9XG5cbiAgICAvLyBEZXRlY3Qgd2hldGhlciB0aGlzIGluamVjdG9yIGhhcyB0aGUgQVBQX1JPT1RfU0NPUEUgdG9rZW4gYW5kIHRodXMgc2hvdWxkIHByb3ZpZGVcbiAgICAvLyBhbnkgaW5qZWN0YWJsZSBzY29wZWQgdG8gQVBQX1JPT1RfU0NPUEUuXG4gICAgY29uc3QgcmVjb3JkID0gdGhpcy5yZWNvcmRzLmdldChJTkpFQ1RPUl9TQ09QRSkgYXMgUmVjb3JkPEluamVjdG9yU2NvcGUgfCBudWxsPjtcbiAgICBpZiAocmVjb3JkICE9IG51bGwgJiYgdHlwZW9mIHJlY29yZC52YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHRoaXMuc2NvcGVzLmFkZChyZWNvcmQudmFsdWUgYXMgSW5qZWN0b3JTY29wZSk7XG4gICAgfVxuXG4gICAgdGhpcy5pbmplY3RvckRlZlR5cGVzID0gbmV3IFNldCh0aGlzLmdldChJTkpFQ1RPUl9ERUZfVFlQRVMsIEVNUFRZX0FSUkFZLCBJbmplY3RGbGFncy5TZWxmKSk7XG4gIH1cblxuICAvKipcbiAgICogRGVzdHJveSB0aGUgaW5qZWN0b3IgYW5kIHJlbGVhc2UgcmVmZXJlbmNlcyB0byBldmVyeSBpbnN0YW5jZSBvciBwcm92aWRlciBhc3NvY2lhdGVkIHdpdGggaXQuXG4gICAqXG4gICAqIEFsc28gY2FsbHMgdGhlIGBPbkRlc3Ryb3lgIGxpZmVjeWNsZSBob29rcyBvZiBldmVyeSBpbnN0YW5jZSB0aGF0IHdhcyBjcmVhdGVkIGZvciB3aGljaCBhXG4gICAqIGhvb2sgd2FzIGZvdW5kLlxuICAgKi9cbiAgb3ZlcnJpZGUgZGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLmFzc2VydE5vdERlc3Ryb3llZCgpO1xuXG4gICAgLy8gU2V0IGRlc3Ryb3llZCA9IHRydWUgZmlyc3QsIGluIGNhc2UgbGlmZWN5Y2xlIGhvb2tzIHJlLWVudGVyIGRlc3Ryb3koKS5cbiAgICB0aGlzLl9kZXN0cm95ZWQgPSB0cnVlO1xuICAgIGNvbnN0IHByZXZDb25zdW1lciA9IHNldEFjdGl2ZUNvbnN1bWVyKG51bGwpO1xuICAgIHRyeSB7XG4gICAgICAvLyBDYWxsIGFsbCB0aGUgbGlmZWN5Y2xlIGhvb2tzLlxuICAgICAgZm9yIChjb25zdCBzZXJ2aWNlIG9mIHRoaXMuX25nT25EZXN0cm95SG9va3MpIHtcbiAgICAgICAgc2VydmljZS5uZ09uRGVzdHJveSgpO1xuICAgICAgfVxuICAgICAgY29uc3Qgb25EZXN0cm95SG9va3MgPSB0aGlzLl9vbkRlc3Ryb3lIb29rcztcbiAgICAgIC8vIFJlc2V0IHRoZSBfb25EZXN0cm95SG9va3MgYXJyYXkgYmVmb3JlIGl0ZXJhdGluZyBvdmVyIGl0IHRvIHByZXZlbnQgaG9va3MgdGhhdCB1bnJlZ2lzdGVyXG4gICAgICAvLyB0aGVtc2VsdmVzIGZyb20gbXV0YXRpbmcgdGhlIGFycmF5IGR1cmluZyBpdGVyYXRpb24uXG4gICAgICB0aGlzLl9vbkRlc3Ryb3lIb29rcyA9IFtdO1xuICAgICAgZm9yIChjb25zdCBob29rIG9mIG9uRGVzdHJveUhvb2tzKSB7XG4gICAgICAgIGhvb2soKTtcbiAgICAgIH1cbiAgICB9IGZpbmFsbHkge1xuICAgICAgLy8gUmVsZWFzZSBhbGwgcmVmZXJlbmNlcy5cbiAgICAgIHRoaXMucmVjb3Jkcy5jbGVhcigpO1xuICAgICAgdGhpcy5fbmdPbkRlc3Ryb3lIb29rcy5jbGVhcigpO1xuICAgICAgdGhpcy5pbmplY3RvckRlZlR5cGVzLmNsZWFyKCk7XG4gICAgICBzZXRBY3RpdmVDb25zdW1lcihwcmV2Q29uc3VtZXIpO1xuICAgIH1cbiAgfVxuXG4gIG92ZXJyaWRlIG9uRGVzdHJveShjYWxsYmFjazogKCkgPT4gdm9pZCk6ICgpID0+IHZvaWQge1xuICAgIHRoaXMuYXNzZXJ0Tm90RGVzdHJveWVkKCk7XG4gICAgdGhpcy5fb25EZXN0cm95SG9va3MucHVzaChjYWxsYmFjayk7XG4gICAgcmV0dXJuICgpID0+IHRoaXMucmVtb3ZlT25EZXN0cm95KGNhbGxiYWNrKTtcbiAgfVxuXG4gIG92ZXJyaWRlIHJ1bkluQ29udGV4dDxSZXR1cm5UPihmbjogKCkgPT4gUmV0dXJuVCk6IFJldHVyblQge1xuICAgIHRoaXMuYXNzZXJ0Tm90RGVzdHJveWVkKCk7XG5cbiAgICBjb25zdCBwcmV2aW91c0luamVjdG9yID0gc2V0Q3VycmVudEluamVjdG9yKHRoaXMpO1xuICAgIGNvbnN0IHByZXZpb3VzSW5qZWN0SW1wbGVtZW50YXRpb24gPSBzZXRJbmplY3RJbXBsZW1lbnRhdGlvbih1bmRlZmluZWQpO1xuXG4gICAgbGV0IHByZXZJbmplY3RDb250ZXh0OiBJbmplY3RvclByb2ZpbGVyQ29udGV4dCB8IHVuZGVmaW5lZDtcbiAgICBpZiAobmdEZXZNb2RlKSB7XG4gICAgICBwcmV2SW5qZWN0Q29udGV4dCA9IHNldEluamVjdG9yUHJvZmlsZXJDb250ZXh0KHtpbmplY3RvcjogdGhpcywgdG9rZW46IG51bGx9KTtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGZuKCk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldEN1cnJlbnRJbmplY3RvcihwcmV2aW91c0luamVjdG9yKTtcbiAgICAgIHNldEluamVjdEltcGxlbWVudGF0aW9uKHByZXZpb3VzSW5qZWN0SW1wbGVtZW50YXRpb24pO1xuICAgICAgbmdEZXZNb2RlICYmIHNldEluamVjdG9yUHJvZmlsZXJDb250ZXh0KHByZXZJbmplY3RDb250ZXh0ISk7XG4gICAgfVxuICB9XG5cbiAgb3ZlcnJpZGUgZ2V0PFQ+KFxuICAgIHRva2VuOiBQcm92aWRlclRva2VuPFQ+LFxuICAgIG5vdEZvdW5kVmFsdWU6IGFueSA9IFRIUk9XX0lGX05PVF9GT1VORCxcbiAgICBmbGFnczogSW5qZWN0RmxhZ3MgfCBJbmplY3RPcHRpb25zID0gSW5qZWN0RmxhZ3MuRGVmYXVsdCxcbiAgKTogVCB7XG4gICAgdGhpcy5hc3NlcnROb3REZXN0cm95ZWQoKTtcblxuICAgIGlmICh0b2tlbi5oYXNPd25Qcm9wZXJ0eShOR19FTlZfSUQpKSB7XG4gICAgICByZXR1cm4gKHRva2VuIGFzIGFueSlbTkdfRU5WX0lEXSh0aGlzKTtcbiAgICB9XG5cbiAgICBmbGFncyA9IGNvbnZlcnRUb0JpdEZsYWdzKGZsYWdzKSBhcyBJbmplY3RGbGFncztcblxuICAgIC8vIFNldCB0aGUgaW5qZWN0aW9uIGNvbnRleHQuXG4gICAgbGV0IHByZXZJbmplY3RDb250ZXh0OiBJbmplY3RvclByb2ZpbGVyQ29udGV4dDtcbiAgICBpZiAobmdEZXZNb2RlKSB7XG4gICAgICBwcmV2SW5qZWN0Q29udGV4dCA9IHNldEluamVjdG9yUHJvZmlsZXJDb250ZXh0KHtpbmplY3RvcjogdGhpcywgdG9rZW46IHRva2VuIGFzIFR5cGU8VD59KTtcbiAgICB9XG4gICAgY29uc3QgcHJldmlvdXNJbmplY3RvciA9IHNldEN1cnJlbnRJbmplY3Rvcih0aGlzKTtcbiAgICBjb25zdCBwcmV2aW91c0luamVjdEltcGxlbWVudGF0aW9uID0gc2V0SW5qZWN0SW1wbGVtZW50YXRpb24odW5kZWZpbmVkKTtcbiAgICB0cnkge1xuICAgICAgLy8gQ2hlY2sgZm9yIHRoZSBTa2lwU2VsZiBmbGFnLlxuICAgICAgaWYgKCEoZmxhZ3MgJiBJbmplY3RGbGFncy5Ta2lwU2VsZikpIHtcbiAgICAgICAgLy8gU2tpcFNlbGYgaXNuJ3Qgc2V0LCBjaGVjayBpZiB0aGUgcmVjb3JkIGJlbG9uZ3MgdG8gdGhpcyBpbmplY3Rvci5cbiAgICAgICAgbGV0IHJlY29yZDogUmVjb3JkPFQ+IHwgdW5kZWZpbmVkIHwgbnVsbCA9IHRoaXMucmVjb3Jkcy5nZXQodG9rZW4pO1xuICAgICAgICBpZiAocmVjb3JkID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAvLyBObyByZWNvcmQsIGJ1dCBtYXliZSB0aGUgdG9rZW4gaXMgc2NvcGVkIHRvIHRoaXMgaW5qZWN0b3IuIExvb2sgZm9yIGFuIGluamVjdGFibGVcbiAgICAgICAgICAvLyBkZWYgd2l0aCBhIHNjb3BlIG1hdGNoaW5nIHRoaXMgaW5qZWN0b3IuXG4gICAgICAgICAgY29uc3QgZGVmID0gY291bGRCZUluamVjdGFibGVUeXBlKHRva2VuKSAmJiBnZXRJbmplY3RhYmxlRGVmKHRva2VuKTtcbiAgICAgICAgICBpZiAoZGVmICYmIHRoaXMuaW5qZWN0YWJsZURlZkluU2NvcGUoZGVmKSkge1xuICAgICAgICAgICAgLy8gRm91bmQgYW4gaW5qZWN0YWJsZSBkZWYgYW5kIGl0J3Mgc2NvcGVkIHRvIHRoaXMgaW5qZWN0b3IuIFByZXRlbmQgYXMgaWYgaXQgd2FzIGhlcmVcbiAgICAgICAgICAgIC8vIGFsbCBhbG9uZy5cblxuICAgICAgICAgICAgaWYgKG5nRGV2TW9kZSkge1xuICAgICAgICAgICAgICBydW5JbkluamVjdG9yUHJvZmlsZXJDb250ZXh0KHRoaXMsIHRva2VuIGFzIFR5cGU8VD4sICgpID0+IHtcbiAgICAgICAgICAgICAgICBlbWl0UHJvdmlkZXJDb25maWd1cmVkRXZlbnQodG9rZW4gYXMgVHlwZVByb3ZpZGVyKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJlY29yZCA9IG1ha2VSZWNvcmQoaW5qZWN0YWJsZURlZk9ySW5qZWN0b3JEZWZGYWN0b3J5KHRva2VuKSwgTk9UX1lFVCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlY29yZCA9IG51bGw7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMucmVjb3Jkcy5zZXQodG9rZW4sIHJlY29yZCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gSWYgYSByZWNvcmQgd2FzIGZvdW5kLCBnZXQgdGhlIGluc3RhbmNlIGZvciBpdCBhbmQgcmV0dXJuIGl0LlxuICAgICAgICBpZiAocmVjb3JkICE9IG51bGwgLyogTk9UIG51bGwgfHwgdW5kZWZpbmVkICovKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuaHlkcmF0ZSh0b2tlbiwgcmVjb3JkKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBTZWxlY3QgdGhlIG5leHQgaW5qZWN0b3IgYmFzZWQgb24gdGhlIFNlbGYgZmxhZyAtIGlmIHNlbGYgaXMgc2V0LCB0aGUgbmV4dCBpbmplY3RvciBpc1xuICAgICAgLy8gdGhlIE51bGxJbmplY3Rvciwgb3RoZXJ3aXNlIGl0J3MgdGhlIHBhcmVudC5cbiAgICAgIGNvbnN0IG5leHRJbmplY3RvciA9ICEoZmxhZ3MgJiBJbmplY3RGbGFncy5TZWxmKSA/IHRoaXMucGFyZW50IDogZ2V0TnVsbEluamVjdG9yKCk7XG4gICAgICAvLyBTZXQgdGhlIG5vdEZvdW5kVmFsdWUgYmFzZWQgb24gdGhlIE9wdGlvbmFsIGZsYWcgLSBpZiBvcHRpb25hbCBpcyBzZXQgYW5kIG5vdEZvdW5kVmFsdWVcbiAgICAgIC8vIGlzIHVuZGVmaW5lZCwgdGhlIHZhbHVlIGlzIG51bGwsIG90aGVyd2lzZSBpdCdzIHRoZSBub3RGb3VuZFZhbHVlLlxuICAgICAgbm90Rm91bmRWYWx1ZSA9XG4gICAgICAgIGZsYWdzICYgSW5qZWN0RmxhZ3MuT3B0aW9uYWwgJiYgbm90Rm91bmRWYWx1ZSA9PT0gVEhST1dfSUZfTk9UX0ZPVU5EID8gbnVsbCA6IG5vdEZvdW5kVmFsdWU7XG4gICAgICByZXR1cm4gbmV4dEluamVjdG9yLmdldCh0b2tlbiwgbm90Rm91bmRWYWx1ZSk7XG4gICAgfSBjYXRjaCAoZTogYW55KSB7XG4gICAgICBpZiAoZS5uYW1lID09PSAnTnVsbEluamVjdG9yRXJyb3InKSB7XG4gICAgICAgIGNvbnN0IHBhdGg6IGFueVtdID0gKGVbTkdfVEVNUF9UT0tFTl9QQVRIXSA9IGVbTkdfVEVNUF9UT0tFTl9QQVRIXSB8fCBbXSk7XG4gICAgICAgIHBhdGgudW5zaGlmdChzdHJpbmdpZnkodG9rZW4pKTtcbiAgICAgICAgaWYgKHByZXZpb3VzSW5qZWN0b3IpIHtcbiAgICAgICAgICAvLyBXZSBzdGlsbCBoYXZlIGEgcGFyZW50IGluamVjdG9yLCBrZWVwIHRocm93aW5nXG4gICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBGb3JtYXQgJiB0aHJvdyB0aGUgZmluYWwgZXJyb3IgbWVzc2FnZSB3aGVuIHdlIGRvbid0IGhhdmUgYW55IHByZXZpb3VzIGluamVjdG9yXG4gICAgICAgICAgcmV0dXJuIGNhdGNoSW5qZWN0b3JFcnJvcihlLCB0b2tlbiwgJ1IzSW5qZWN0b3JFcnJvcicsIHRoaXMuc291cmNlKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH1cbiAgICB9IGZpbmFsbHkge1xuICAgICAgLy8gTGFzdGx5LCByZXN0b3JlIHRoZSBwcmV2aW91cyBpbmplY3Rpb24gY29udGV4dC5cbiAgICAgIHNldEluamVjdEltcGxlbWVudGF0aW9uKHByZXZpb3VzSW5qZWN0SW1wbGVtZW50YXRpb24pO1xuICAgICAgc2V0Q3VycmVudEluamVjdG9yKHByZXZpb3VzSW5qZWN0b3IpO1xuICAgICAgbmdEZXZNb2RlICYmIHNldEluamVjdG9yUHJvZmlsZXJDb250ZXh0KHByZXZJbmplY3RDb250ZXh0ISk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICByZXNvbHZlSW5qZWN0b3JJbml0aWFsaXplcnMoKSB7XG4gICAgY29uc3QgcHJldkNvbnN1bWVyID0gc2V0QWN0aXZlQ29uc3VtZXIobnVsbCk7XG4gICAgY29uc3QgcHJldmlvdXNJbmplY3RvciA9IHNldEN1cnJlbnRJbmplY3Rvcih0aGlzKTtcbiAgICBjb25zdCBwcmV2aW91c0luamVjdEltcGxlbWVudGF0aW9uID0gc2V0SW5qZWN0SW1wbGVtZW50YXRpb24odW5kZWZpbmVkKTtcbiAgICBsZXQgcHJldkluamVjdENvbnRleHQ6IEluamVjdG9yUHJvZmlsZXJDb250ZXh0IHwgdW5kZWZpbmVkO1xuICAgIGlmIChuZ0Rldk1vZGUpIHtcbiAgICAgIHByZXZJbmplY3RDb250ZXh0ID0gc2V0SW5qZWN0b3JQcm9maWxlckNvbnRleHQoe2luamVjdG9yOiB0aGlzLCB0b2tlbjogbnVsbH0pO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBpbml0aWFsaXplcnMgPSB0aGlzLmdldChFTlZJUk9OTUVOVF9JTklUSUFMSVpFUiwgRU1QVFlfQVJSQVksIEluamVjdEZsYWdzLlNlbGYpO1xuICAgICAgaWYgKG5nRGV2TW9kZSAmJiAhQXJyYXkuaXNBcnJheShpbml0aWFsaXplcnMpKSB7XG4gICAgICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX01VTFRJX1BST1ZJREVSLFxuICAgICAgICAgICdVbmV4cGVjdGVkIHR5cGUgb2YgdGhlIGBFTlZJUk9OTUVOVF9JTklUSUFMSVpFUmAgdG9rZW4gdmFsdWUgJyArXG4gICAgICAgICAgICBgKGV4cGVjdGVkIGFuIGFycmF5LCBidXQgZ290ICR7dHlwZW9mIGluaXRpYWxpemVyc30pLiBgICtcbiAgICAgICAgICAgICdQbGVhc2UgY2hlY2sgdGhhdCB0aGUgYEVOVklST05NRU5UX0lOSVRJQUxJWkVSYCB0b2tlbiBpcyBjb25maWd1cmVkIGFzIGEgJyArXG4gICAgICAgICAgICAnYG11bHRpOiB0cnVlYCBwcm92aWRlci4nLFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgZm9yIChjb25zdCBpbml0aWFsaXplciBvZiBpbml0aWFsaXplcnMpIHtcbiAgICAgICAgaW5pdGlhbGl6ZXIoKTtcbiAgICAgIH1cbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0Q3VycmVudEluamVjdG9yKHByZXZpb3VzSW5qZWN0b3IpO1xuICAgICAgc2V0SW5qZWN0SW1wbGVtZW50YXRpb24ocHJldmlvdXNJbmplY3RJbXBsZW1lbnRhdGlvbik7XG4gICAgICBuZ0Rldk1vZGUgJiYgc2V0SW5qZWN0b3JQcm9maWxlckNvbnRleHQocHJldkluamVjdENvbnRleHQhKTtcbiAgICAgIHNldEFjdGl2ZUNvbnN1bWVyKHByZXZDb25zdW1lcik7XG4gICAgfVxuICB9XG5cbiAgb3ZlcnJpZGUgdG9TdHJpbmcoKSB7XG4gICAgY29uc3QgdG9rZW5zOiBzdHJpbmdbXSA9IFtdO1xuICAgIGNvbnN0IHJlY29yZHMgPSB0aGlzLnJlY29yZHM7XG4gICAgZm9yIChjb25zdCB0b2tlbiBvZiByZWNvcmRzLmtleXMoKSkge1xuICAgICAgdG9rZW5zLnB1c2goc3RyaW5naWZ5KHRva2VuKSk7XG4gICAgfVxuICAgIHJldHVybiBgUjNJbmplY3Rvclske3Rva2Vucy5qb2luKCcsICcpfV1gO1xuICB9XG5cbiAgYXNzZXJ0Tm90RGVzdHJveWVkKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9kZXN0cm95ZWQpIHtcbiAgICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5KRUNUT1JfQUxSRUFEWV9ERVNUUk9ZRUQsXG4gICAgICAgIG5nRGV2TW9kZSAmJiAnSW5qZWN0b3IgaGFzIGFscmVhZHkgYmVlbiBkZXN0cm95ZWQuJyxcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFByb2Nlc3MgYSBgU2luZ2xlUHJvdmlkZXJgIGFuZCBhZGQgaXQuXG4gICAqL1xuICBwcml2YXRlIHByb2Nlc3NQcm92aWRlcihwcm92aWRlcjogU2luZ2xlUHJvdmlkZXIpOiB2b2lkIHtcbiAgICAvLyBEZXRlcm1pbmUgdGhlIHRva2VuIGZyb20gdGhlIHByb3ZpZGVyLiBFaXRoZXIgaXQncyBpdHMgb3duIHRva2VuLCBvciBoYXMgYSB7cHJvdmlkZTogLi4ufVxuICAgIC8vIHByb3BlcnR5LlxuICAgIHByb3ZpZGVyID0gcmVzb2x2ZUZvcndhcmRSZWYocHJvdmlkZXIpO1xuICAgIGxldCB0b2tlbjogYW55ID0gaXNUeXBlUHJvdmlkZXIocHJvdmlkZXIpXG4gICAgICA/IHByb3ZpZGVyXG4gICAgICA6IHJlc29sdmVGb3J3YXJkUmVmKHByb3ZpZGVyICYmIHByb3ZpZGVyLnByb3ZpZGUpO1xuXG4gICAgLy8gQ29uc3RydWN0IGEgYFJlY29yZGAgZm9yIHRoZSBwcm92aWRlci5cbiAgICBjb25zdCByZWNvcmQgPSBwcm92aWRlclRvUmVjb3JkKHByb3ZpZGVyKTtcbiAgICBpZiAobmdEZXZNb2RlKSB7XG4gICAgICBydW5JbkluamVjdG9yUHJvZmlsZXJDb250ZXh0KHRoaXMsIHRva2VuLCAoKSA9PiB7XG4gICAgICAgIC8vIEVtaXQgSW5qZWN0b3JQcm9maWxlckV2ZW50VHlwZS5DcmVhdGUgaWYgcHJvdmlkZXIgaXMgYSB2YWx1ZSBwcm92aWRlciBiZWNhdXNlXG4gICAgICAgIC8vIHRoZXNlIGFyZSB0aGUgb25seSBwcm92aWRlcnMgdGhhdCBkbyBub3QgZ28gdGhyb3VnaCB0aGUgdmFsdWUgaHlkcmF0aW9uIGxvZ2ljXG4gICAgICAgIC8vIHdoZXJlIHRoaXMgZXZlbnQgd291bGQgbm9ybWFsbHkgYmUgZW1pdHRlZCBmcm9tLlxuICAgICAgICBpZiAoaXNWYWx1ZVByb3ZpZGVyKHByb3ZpZGVyKSkge1xuICAgICAgICAgIGVtaXRJbnN0YW5jZUNyZWF0ZWRCeUluamVjdG9yRXZlbnQocHJvdmlkZXIudXNlVmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgZW1pdFByb3ZpZGVyQ29uZmlndXJlZEV2ZW50KHByb3ZpZGVyKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICghaXNUeXBlUHJvdmlkZXIocHJvdmlkZXIpICYmIHByb3ZpZGVyLm11bHRpID09PSB0cnVlKSB7XG4gICAgICAvLyBJZiB0aGUgcHJvdmlkZXIgaW5kaWNhdGVzIHRoYXQgaXQncyBhIG11bHRpLXByb3ZpZGVyLCBwcm9jZXNzIGl0IHNwZWNpYWxseS5cbiAgICAgIC8vIEZpcnN0IGNoZWNrIHdoZXRoZXIgaXQncyBiZWVuIGRlZmluZWQgYWxyZWFkeS5cbiAgICAgIGxldCBtdWx0aVJlY29yZCA9IHRoaXMucmVjb3Jkcy5nZXQodG9rZW4pO1xuICAgICAgaWYgKG11bHRpUmVjb3JkKSB7XG4gICAgICAgIC8vIEl0IGhhcy4gVGhyb3cgYSBuaWNlIGVycm9yIGlmXG4gICAgICAgIGlmIChuZ0Rldk1vZGUgJiYgbXVsdGlSZWNvcmQubXVsdGkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHRocm93TWl4ZWRNdWx0aVByb3ZpZGVyRXJyb3IoKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbXVsdGlSZWNvcmQgPSBtYWtlUmVjb3JkKHVuZGVmaW5lZCwgTk9UX1lFVCwgdHJ1ZSk7XG4gICAgICAgIG11bHRpUmVjb3JkLmZhY3RvcnkgPSAoKSA9PiBpbmplY3RBcmdzKG11bHRpUmVjb3JkIS5tdWx0aSEpO1xuICAgICAgICB0aGlzLnJlY29yZHMuc2V0KHRva2VuLCBtdWx0aVJlY29yZCk7XG4gICAgICB9XG4gICAgICB0b2tlbiA9IHByb3ZpZGVyO1xuICAgICAgbXVsdGlSZWNvcmQubXVsdGkhLnB1c2gocHJvdmlkZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAobmdEZXZNb2RlKSB7XG4gICAgICAgIGNvbnN0IGV4aXN0aW5nID0gdGhpcy5yZWNvcmRzLmdldCh0b2tlbik7XG4gICAgICAgIGlmIChleGlzdGluZyAmJiBleGlzdGluZy5tdWx0aSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdGhyb3dNaXhlZE11bHRpUHJvdmlkZXJFcnJvcigpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMucmVjb3Jkcy5zZXQodG9rZW4sIHJlY29yZCk7XG4gIH1cblxuICBwcml2YXRlIGh5ZHJhdGU8VD4odG9rZW46IFByb3ZpZGVyVG9rZW48VD4sIHJlY29yZDogUmVjb3JkPFQ+KTogVCB7XG4gICAgY29uc3QgcHJldkNvbnN1bWVyID0gc2V0QWN0aXZlQ29uc3VtZXIobnVsbCk7XG4gICAgdHJ5IHtcbiAgICAgIGlmIChuZ0Rldk1vZGUgJiYgcmVjb3JkLnZhbHVlID09PSBDSVJDVUxBUikge1xuICAgICAgICB0aHJvd0N5Y2xpY0RlcGVuZGVuY3lFcnJvcihzdHJpbmdpZnkodG9rZW4pKTtcbiAgICAgIH0gZWxzZSBpZiAocmVjb3JkLnZhbHVlID09PSBOT1RfWUVUKSB7XG4gICAgICAgIHJlY29yZC52YWx1ZSA9IENJUkNVTEFSO1xuXG4gICAgICAgIGlmIChuZ0Rldk1vZGUpIHtcbiAgICAgICAgICBydW5JbkluamVjdG9yUHJvZmlsZXJDb250ZXh0KHRoaXMsIHRva2VuIGFzIFR5cGU8VD4sICgpID0+IHtcbiAgICAgICAgICAgIHJlY29yZC52YWx1ZSA9IHJlY29yZC5mYWN0b3J5ISgpO1xuICAgICAgICAgICAgZW1pdEluc3RhbmNlQ3JlYXRlZEJ5SW5qZWN0b3JFdmVudChyZWNvcmQudmFsdWUpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlY29yZC52YWx1ZSA9IHJlY29yZC5mYWN0b3J5ISgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIHJlY29yZC52YWx1ZSA9PT0gJ29iamVjdCcgJiYgcmVjb3JkLnZhbHVlICYmIGhhc09uRGVzdHJveShyZWNvcmQudmFsdWUpKSB7XG4gICAgICAgIHRoaXMuX25nT25EZXN0cm95SG9va3MuYWRkKHJlY29yZC52YWx1ZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVjb3JkLnZhbHVlIGFzIFQ7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldEFjdGl2ZUNvbnN1bWVyKHByZXZDb25zdW1lcik7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBpbmplY3RhYmxlRGVmSW5TY29wZShkZWY6IMm1ybVJbmplY3RhYmxlRGVjbGFyYXRpb248YW55Pik6IGJvb2xlYW4ge1xuICAgIGlmICghZGVmLnByb3ZpZGVkSW4pIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgY29uc3QgcHJvdmlkZWRJbiA9IHJlc29sdmVGb3J3YXJkUmVmKGRlZi5wcm92aWRlZEluKTtcbiAgICBpZiAodHlwZW9mIHByb3ZpZGVkSW4gPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gcHJvdmlkZWRJbiA9PT0gJ2FueScgfHwgdGhpcy5zY29wZXMuaGFzKHByb3ZpZGVkSW4pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5pbmplY3RvckRlZlR5cGVzLmhhcyhwcm92aWRlZEluKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHJlbW92ZU9uRGVzdHJveShjYWxsYmFjazogKCkgPT4gdm9pZCk6IHZvaWQge1xuICAgIGNvbnN0IGRlc3Ryb3lDQklkeCA9IHRoaXMuX29uRGVzdHJveUhvb2tzLmluZGV4T2YoY2FsbGJhY2spO1xuICAgIGlmIChkZXN0cm95Q0JJZHggIT09IC0xKSB7XG4gICAgICB0aGlzLl9vbkRlc3Ryb3lIb29rcy5zcGxpY2UoZGVzdHJveUNCSWR4LCAxKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gaW5qZWN0YWJsZURlZk9ySW5qZWN0b3JEZWZGYWN0b3J5KHRva2VuOiBQcm92aWRlclRva2VuPGFueT4pOiBGYWN0b3J5Rm48YW55PiB7XG4gIC8vIE1vc3QgdG9rZW5zIHdpbGwgaGF2ZSBhbiBpbmplY3RhYmxlIGRlZiBkaXJlY3RseSBvbiB0aGVtLCB3aGljaCBzcGVjaWZpZXMgYSBmYWN0b3J5IGRpcmVjdGx5LlxuICBjb25zdCBpbmplY3RhYmxlRGVmID0gZ2V0SW5qZWN0YWJsZURlZih0b2tlbik7XG4gIGNvbnN0IGZhY3RvcnkgPSBpbmplY3RhYmxlRGVmICE9PSBudWxsID8gaW5qZWN0YWJsZURlZi5mYWN0b3J5IDogZ2V0RmFjdG9yeURlZih0b2tlbik7XG5cbiAgaWYgKGZhY3RvcnkgIT09IG51bGwpIHtcbiAgICByZXR1cm4gZmFjdG9yeTtcbiAgfVxuXG4gIC8vIEluamVjdGlvblRva2VucyBzaG91bGQgaGF2ZSBhbiBpbmplY3RhYmxlIGRlZiAoybVwcm92KSBhbmQgdGh1cyBzaG91bGQgYmUgaGFuZGxlZCBhYm92ZS5cbiAgLy8gSWYgaXQncyBtaXNzaW5nIHRoYXQsIGl0J3MgYW4gZXJyb3IuXG4gIGlmICh0b2tlbiBpbnN0YW5jZW9mIEluamVjdGlvblRva2VuKSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTkpFQ1RJT05fVE9LRU4sXG4gICAgICBuZ0Rldk1vZGUgJiYgYFRva2VuICR7c3RyaW5naWZ5KHRva2VuKX0gaXMgbWlzc2luZyBhIMm1cHJvdiBkZWZpbml0aW9uLmAsXG4gICAgKTtcbiAgfVxuXG4gIC8vIFVuZGVjb3JhdGVkIHR5cGVzIGNhbiBzb21ldGltZXMgYmUgY3JlYXRlZCBpZiB0aGV5IGhhdmUgbm8gY29uc3RydWN0b3IgYXJndW1lbnRzLlxuICBpZiAodG9rZW4gaW5zdGFuY2VvZiBGdW5jdGlvbikge1xuICAgIHJldHVybiBnZXRVbmRlY29yYXRlZEluamVjdGFibGVGYWN0b3J5KHRva2VuKTtcbiAgfVxuXG4gIC8vIFRoZXJlIHdhcyBubyB3YXkgdG8gcmVzb2x2ZSBhIGZhY3RvcnkgZm9yIHRoaXMgdG9rZW4uXG4gIHRocm93IG5ldyBSdW50aW1lRXJyb3IoUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOSkVDVElPTl9UT0tFTiwgbmdEZXZNb2RlICYmICd1bnJlYWNoYWJsZScpO1xufVxuXG5mdW5jdGlvbiBnZXRVbmRlY29yYXRlZEluamVjdGFibGVGYWN0b3J5KHRva2VuOiBGdW5jdGlvbikge1xuICAvLyBJZiB0aGUgdG9rZW4gaGFzIHBhcmFtZXRlcnMgdGhlbiBpdCBoYXMgZGVwZW5kZW5jaWVzIHRoYXQgd2UgY2Fubm90IHJlc29sdmUgaW1wbGljaXRseS5cbiAgY29uc3QgcGFyYW1MZW5ndGggPSB0b2tlbi5sZW5ndGg7XG4gIGlmIChwYXJhbUxlbmd0aCA+IDApIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOSkVDVElPTl9UT0tFTixcbiAgICAgIG5nRGV2TW9kZSAmJlxuICAgICAgICBgQ2FuJ3QgcmVzb2x2ZSBhbGwgcGFyYW1ldGVycyBmb3IgJHtzdHJpbmdpZnkodG9rZW4pfTogKCR7bmV3QXJyYXkocGFyYW1MZW5ndGgsICc/Jykuam9pbihcbiAgICAgICAgICAnLCAnLFxuICAgICAgICApfSkuYCxcbiAgICApO1xuICB9XG5cbiAgLy8gVGhlIGNvbnN0cnVjdG9yIGZ1bmN0aW9uIGFwcGVhcnMgdG8gaGF2ZSBubyBwYXJhbWV0ZXJzLlxuICAvLyBUaGlzIG1pZ2h0IGJlIGJlY2F1c2UgaXQgaW5oZXJpdHMgZnJvbSBhIHN1cGVyLWNsYXNzLiBJbiB3aGljaCBjYXNlLCB1c2UgYW4gaW5qZWN0YWJsZVxuICAvLyBkZWYgZnJvbSBhbiBhbmNlc3RvciBpZiB0aGVyZSBpcyBvbmUuXG4gIC8vIE90aGVyd2lzZSB0aGlzIHJlYWxseSBpcyBhIHNpbXBsZSBjbGFzcyB3aXRoIG5vIGRlcGVuZGVuY2llcywgc28gcmV0dXJuIGEgZmFjdG9yeSB0aGF0XG4gIC8vIGp1c3QgaW5zdGFudGlhdGVzIHRoZSB6ZXJvLWFyZyBjb25zdHJ1Y3Rvci5cbiAgY29uc3QgaW5oZXJpdGVkSW5qZWN0YWJsZURlZiA9IGdldEluaGVyaXRlZEluamVjdGFibGVEZWYodG9rZW4pO1xuICBpZiAoaW5oZXJpdGVkSW5qZWN0YWJsZURlZiAhPT0gbnVsbCkge1xuICAgIHJldHVybiAoKSA9PiBpbmhlcml0ZWRJbmplY3RhYmxlRGVmLmZhY3RvcnkodG9rZW4gYXMgVHlwZTxhbnk+KTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gKCkgPT4gbmV3ICh0b2tlbiBhcyBUeXBlPGFueT4pKCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gcHJvdmlkZXJUb1JlY29yZChwcm92aWRlcjogU2luZ2xlUHJvdmlkZXIpOiBSZWNvcmQ8YW55PiB7XG4gIGlmIChpc1ZhbHVlUHJvdmlkZXIocHJvdmlkZXIpKSB7XG4gICAgcmV0dXJuIG1ha2VSZWNvcmQodW5kZWZpbmVkLCBwcm92aWRlci51c2VWYWx1ZSk7XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgZmFjdG9yeTogKCgpID0+IGFueSkgfCB1bmRlZmluZWQgPSBwcm92aWRlclRvRmFjdG9yeShwcm92aWRlcik7XG4gICAgcmV0dXJuIG1ha2VSZWNvcmQoZmFjdG9yeSwgTk9UX1lFVCk7XG4gIH1cbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBhIGBTaW5nbGVQcm92aWRlcmAgaW50byBhIGZhY3RvcnkgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHByb3ZpZGVyIHByb3ZpZGVyIHRvIGNvbnZlcnQgdG8gZmFjdG9yeVxuICovXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZXJUb0ZhY3RvcnkoXG4gIHByb3ZpZGVyOiBTaW5nbGVQcm92aWRlcixcbiAgbmdNb2R1bGVUeXBlPzogSW5qZWN0b3JUeXBlPGFueT4sXG4gIHByb3ZpZGVycz86IGFueVtdLFxuKTogKCkgPT4gYW55IHtcbiAgbGV0IGZhY3Rvcnk6ICgoKSA9PiBhbnkpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICBpZiAobmdEZXZNb2RlICYmIGlzRW52aXJvbm1lbnRQcm92aWRlcnMocHJvdmlkZXIpKSB7XG4gICAgdGhyb3dJbnZhbGlkUHJvdmlkZXJFcnJvcih1bmRlZmluZWQsIHByb3ZpZGVycywgcHJvdmlkZXIpO1xuICB9XG5cbiAgaWYgKGlzVHlwZVByb3ZpZGVyKHByb3ZpZGVyKSkge1xuICAgIGNvbnN0IHVud3JhcHBlZFByb3ZpZGVyID0gcmVzb2x2ZUZvcndhcmRSZWYocHJvdmlkZXIpO1xuICAgIHJldHVybiBnZXRGYWN0b3J5RGVmKHVud3JhcHBlZFByb3ZpZGVyKSB8fCBpbmplY3RhYmxlRGVmT3JJbmplY3RvckRlZkZhY3RvcnkodW53cmFwcGVkUHJvdmlkZXIpO1xuICB9IGVsc2Uge1xuICAgIGlmIChpc1ZhbHVlUHJvdmlkZXIocHJvdmlkZXIpKSB7XG4gICAgICBmYWN0b3J5ID0gKCkgPT4gcmVzb2x2ZUZvcndhcmRSZWYocHJvdmlkZXIudXNlVmFsdWUpO1xuICAgIH0gZWxzZSBpZiAoaXNGYWN0b3J5UHJvdmlkZXIocHJvdmlkZXIpKSB7XG4gICAgICBmYWN0b3J5ID0gKCkgPT4gcHJvdmlkZXIudXNlRmFjdG9yeSguLi5pbmplY3RBcmdzKHByb3ZpZGVyLmRlcHMgfHwgW10pKTtcbiAgICB9IGVsc2UgaWYgKGlzRXhpc3RpbmdQcm92aWRlcihwcm92aWRlcikpIHtcbiAgICAgIGZhY3RvcnkgPSAoKSA9PiDJtcm1aW5qZWN0KHJlc29sdmVGb3J3YXJkUmVmKHByb3ZpZGVyLnVzZUV4aXN0aW5nKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGNsYXNzUmVmID0gcmVzb2x2ZUZvcndhcmRSZWYoXG4gICAgICAgIHByb3ZpZGVyICYmXG4gICAgICAgICAgKChwcm92aWRlciBhcyBTdGF0aWNDbGFzc1Byb3ZpZGVyIHwgQ2xhc3NQcm92aWRlcikudXNlQ2xhc3MgfHwgcHJvdmlkZXIucHJvdmlkZSksXG4gICAgICApO1xuICAgICAgaWYgKG5nRGV2TW9kZSAmJiAhY2xhc3NSZWYpIHtcbiAgICAgICAgdGhyb3dJbnZhbGlkUHJvdmlkZXJFcnJvcihuZ01vZHVsZVR5cGUsIHByb3ZpZGVycywgcHJvdmlkZXIpO1xuICAgICAgfVxuICAgICAgaWYgKGhhc0RlcHMocHJvdmlkZXIpKSB7XG4gICAgICAgIGZhY3RvcnkgPSAoKSA9PiBuZXcgY2xhc3NSZWYoLi4uaW5qZWN0QXJncyhwcm92aWRlci5kZXBzKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZ2V0RmFjdG9yeURlZihjbGFzc1JlZikgfHwgaW5qZWN0YWJsZURlZk9ySW5qZWN0b3JEZWZGYWN0b3J5KGNsYXNzUmVmKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhY3Rvcnk7XG59XG5cbmZ1bmN0aW9uIG1ha2VSZWNvcmQ8VD4oXG4gIGZhY3Rvcnk6ICgoKSA9PiBUKSB8IHVuZGVmaW5lZCxcbiAgdmFsdWU6IFQgfCB7fSxcbiAgbXVsdGk6IGJvb2xlYW4gPSBmYWxzZSxcbik6IFJlY29yZDxUPiB7XG4gIHJldHVybiB7XG4gICAgZmFjdG9yeTogZmFjdG9yeSxcbiAgICB2YWx1ZTogdmFsdWUsXG4gICAgbXVsdGk6IG11bHRpID8gW10gOiB1bmRlZmluZWQsXG4gIH07XG59XG5cbmZ1bmN0aW9uIGhhc0RlcHMoXG4gIHZhbHVlOiBDbGFzc1Byb3ZpZGVyIHwgQ29uc3RydWN0b3JQcm92aWRlciB8IFN0YXRpY0NsYXNzUHJvdmlkZXIsXG4pOiB2YWx1ZSBpcyBDbGFzc1Byb3ZpZGVyICYge2RlcHM6IGFueVtdfSB7XG4gIHJldHVybiAhISh2YWx1ZSBhcyBhbnkpLmRlcHM7XG59XG5cbmZ1bmN0aW9uIGhhc09uRGVzdHJveSh2YWx1ZTogYW55KTogdmFsdWUgaXMgT25EZXN0cm95IHtcbiAgcmV0dXJuIChcbiAgICB2YWx1ZSAhPT0gbnVsbCAmJlxuICAgIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiZcbiAgICB0eXBlb2YgKHZhbHVlIGFzIE9uRGVzdHJveSkubmdPbkRlc3Ryb3kgPT09ICdmdW5jdGlvbidcbiAgKTtcbn1cblxuZnVuY3Rpb24gY291bGRCZUluamVjdGFibGVUeXBlKHZhbHVlOiBhbnkpOiB2YWx1ZSBpcyBQcm92aWRlclRva2VuPGFueT4ge1xuICByZXR1cm4gKFxuICAgIHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJyB8fCAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSBpbnN0YW5jZW9mIEluamVjdGlvblRva2VuKVxuICApO1xufVxuXG5mdW5jdGlvbiBmb3JFYWNoU2luZ2xlUHJvdmlkZXIoXG4gIHByb3ZpZGVyczogQXJyYXk8UHJvdmlkZXIgfCBFbnZpcm9ubWVudFByb3ZpZGVycz4sXG4gIGZuOiAocHJvdmlkZXI6IFNpbmdsZVByb3ZpZGVyKSA9PiB2b2lkLFxuKTogdm9pZCB7XG4gIGZvciAoY29uc3QgcHJvdmlkZXIgb2YgcHJvdmlkZXJzKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkocHJvdmlkZXIpKSB7XG4gICAgICBmb3JFYWNoU2luZ2xlUHJvdmlkZXIocHJvdmlkZXIsIGZuKTtcbiAgICB9IGVsc2UgaWYgKHByb3ZpZGVyICYmIGlzRW52aXJvbm1lbnRQcm92aWRlcnMocHJvdmlkZXIpKSB7XG4gICAgICBmb3JFYWNoU2luZ2xlUHJvdmlkZXIocHJvdmlkZXIuybVwcm92aWRlcnMsIGZuKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZm4ocHJvdmlkZXIgYXMgU2luZ2xlUHJvdmlkZXIpO1xuICAgIH1cbiAgfVxufVxuIl19