/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { RuntimeError } from '../errors';
import { getComponentDef } from '../render3/definition';
import { getFactoryDef } from '../render3/definition_factory';
import { throwCyclicDependencyError, throwInvalidProviderError } from '../render3/errors_di';
import { stringifyForError } from '../render3/util/stringify_utils';
import { deepForEach } from '../util/array_utils';
import { EMPTY_ARRAY } from '../util/empty';
import { getClosureSafeProperty } from '../util/property';
import { stringify } from '../util/stringify';
import { resolveForwardRef } from './forward_ref';
import { ENVIRONMENT_INITIALIZER } from './initializer_token';
import { ɵɵinject as inject } from './injector_compatibility';
import { getInjectorDef } from './interface/defs';
import { isEnvironmentProviders, } from './interface/provider';
import { INJECTOR_DEF_TYPES } from './internal_tokens';
/**
 * Wrap an array of `Provider`s into `EnvironmentProviders`, preventing them from being accidentally
 * referenced in `@Component` in a component injector.
 */
export function makeEnvironmentProviders(providers) {
    return {
        ɵproviders: providers,
    };
}
/**
 * Collects providers from all NgModules and standalone components, including transitively imported
 * ones.
 *
 * Providers extracted via `importProvidersFrom` are only usable in an application injector or
 * another environment injector (such as a route injector). They should not be used in component
 * providers.
 *
 * More information about standalone components can be found in [this
 * guide](guide/components/importing).
 *
 * @usageNotes
 * The results of the `importProvidersFrom` call can be used in the `bootstrapApplication` call:
 *
 * ```typescript
 * await bootstrapApplication(RootComponent, {
 *   providers: [
 *     importProvidersFrom(NgModuleOne, NgModuleTwo)
 *   ]
 * });
 * ```
 *
 * You can also use the `importProvidersFrom` results in the `providers` field of a route, when a
 * standalone component is used:
 *
 * ```typescript
 * export const ROUTES: Route[] = [
 *   {
 *     path: 'foo',
 *     providers: [
 *       importProvidersFrom(NgModuleOne, NgModuleTwo)
 *     ],
 *     component: YourStandaloneComponent
 *   }
 * ];
 * ```
 *
 * @returns Collected providers from the specified list of types.
 * @publicApi
 */
export function importProvidersFrom(...sources) {
    return {
        ɵproviders: internalImportProvidersFrom(true, sources),
        ɵfromNgModule: true,
    };
}
export function internalImportProvidersFrom(checkForStandaloneCmp, ...sources) {
    const providersOut = [];
    const dedup = new Set(); // already seen types
    let injectorTypesWithProviders;
    const collectProviders = (provider) => {
        providersOut.push(provider);
    };
    deepForEach(sources, (source) => {
        if ((typeof ngDevMode === 'undefined' || ngDevMode) && checkForStandaloneCmp) {
            const cmpDef = getComponentDef(source);
            if (cmpDef?.standalone) {
                throw new RuntimeError(800 /* RuntimeErrorCode.IMPORT_PROVIDERS_FROM_STANDALONE */, `Importing providers supports NgModule or ModuleWithProviders but got a standalone component "${stringifyForError(source)}"`);
            }
        }
        // Narrow `source` to access the internal type analogue for `ModuleWithProviders`.
        const internalSource = source;
        if (walkProviderTree(internalSource, collectProviders, [], dedup)) {
            injectorTypesWithProviders ||= [];
            injectorTypesWithProviders.push(internalSource);
        }
    });
    // Collect all providers from `ModuleWithProviders` types.
    if (injectorTypesWithProviders !== undefined) {
        processInjectorTypesWithProviders(injectorTypesWithProviders, collectProviders);
    }
    return providersOut;
}
/**
 * Collects all providers from the list of `ModuleWithProviders` and appends them to the provided
 * array.
 */
function processInjectorTypesWithProviders(typesWithProviders, visitor) {
    for (let i = 0; i < typesWithProviders.length; i++) {
        const { ngModule, providers } = typesWithProviders[i];
        deepForEachProvider(providers, (provider) => {
            ngDevMode && validateProvider(provider, providers || EMPTY_ARRAY, ngModule);
            visitor(provider, ngModule);
        });
    }
}
/**
 * The logic visits an `InjectorType`, an `InjectorTypeWithProviders`, or a standalone
 * `ComponentType`, and all of its transitive providers and collects providers.
 *
 * If an `InjectorTypeWithProviders` that declares providers besides the type is specified,
 * the function will return "true" to indicate that the providers of the type definition need
 * to be processed. This allows us to process providers of injector types after all imports of
 * an injector definition are processed. (following View Engine semantics: see FW-1349)
 */
export function walkProviderTree(container, visitor, parents, dedup) {
    container = resolveForwardRef(container);
    if (!container)
        return false;
    // The actual type which had the definition. Usually `container`, but may be an unwrapped type
    // from `InjectorTypeWithProviders`.
    let defType = null;
    let injDef = getInjectorDef(container);
    const cmpDef = !injDef && getComponentDef(container);
    if (!injDef && !cmpDef) {
        // `container` is not an injector type or a component type. It might be:
        //  * An `InjectorTypeWithProviders` that wraps an injector type.
        //  * A standalone directive or pipe that got pulled in from a standalone component's
        //    dependencies.
        // Try to unwrap it as an `InjectorTypeWithProviders` first.
        const ngModule = container
            .ngModule;
        injDef = getInjectorDef(ngModule);
        if (injDef) {
            defType = ngModule;
        }
        else {
            // Not a component or injector type, so ignore it.
            return false;
        }
    }
    else if (cmpDef && !cmpDef.standalone) {
        return false;
    }
    else {
        defType = container;
    }
    // Check for circular dependencies.
    if (ngDevMode && parents.indexOf(defType) !== -1) {
        const defName = stringify(defType);
        const path = parents.map(stringify);
        throwCyclicDependencyError(defName, path);
    }
    // Check for multiple imports of the same module
    const isDuplicate = dedup.has(defType);
    if (cmpDef) {
        if (isDuplicate) {
            // This component definition has already been processed.
            return false;
        }
        dedup.add(defType);
        if (cmpDef.dependencies) {
            const deps = typeof cmpDef.dependencies === 'function' ? cmpDef.dependencies() : cmpDef.dependencies;
            for (const dep of deps) {
                walkProviderTree(dep, visitor, parents, dedup);
            }
        }
    }
    else if (injDef) {
        // First, include providers from any imports.
        if (injDef.imports != null && !isDuplicate) {
            // Before processing defType's imports, add it to the set of parents. This way, if it ends
            // up deeply importing itself, this can be detected.
            ngDevMode && parents.push(defType);
            // Add it to the set of dedups. This way we can detect multiple imports of the same module
            dedup.add(defType);
            let importTypesWithProviders;
            try {
                deepForEach(injDef.imports, (imported) => {
                    if (walkProviderTree(imported, visitor, parents, dedup)) {
                        importTypesWithProviders ||= [];
                        // If the processed import is an injector type with providers, we store it in the
                        // list of import types with providers, so that we can process those afterwards.
                        importTypesWithProviders.push(imported);
                    }
                });
            }
            finally {
                // Remove it from the parents set when finished.
                ngDevMode && parents.pop();
            }
            // Imports which are declared with providers (TypeWithProviders) need to be processed
            // after all imported modules are processed. This is similar to how View Engine
            // processes/merges module imports in the metadata resolver. See: FW-1349.
            if (importTypesWithProviders !== undefined) {
                processInjectorTypesWithProviders(importTypesWithProviders, visitor);
            }
        }
        if (!isDuplicate) {
            // Track the InjectorType and add a provider for it.
            // It's important that this is done after the def's imports.
            const factory = getFactoryDef(defType) || (() => new defType());
            // Append extra providers to make more info available for consumers (to retrieve an injector
            // type), as well as internally (to calculate an injection scope correctly and eagerly
            // instantiate a `defType` when an injector is created).
            // Provider to create `defType` using its factory.
            visitor({ provide: defType, useFactory: factory, deps: EMPTY_ARRAY }, defType);
            // Make this `defType` available to an internal logic that calculates injector scope.
            visitor({ provide: INJECTOR_DEF_TYPES, useValue: defType, multi: true }, defType);
            // Provider to eagerly instantiate `defType` via `INJECTOR_INITIALIZER`.
            visitor({ provide: ENVIRONMENT_INITIALIZER, useValue: () => inject(defType), multi: true }, defType);
        }
        // Next, include providers listed on the definition itself.
        const defProviders = injDef.providers;
        if (defProviders != null && !isDuplicate) {
            const injectorType = container;
            deepForEachProvider(defProviders, (provider) => {
                ngDevMode && validateProvider(provider, defProviders, injectorType);
                visitor(provider, injectorType);
            });
        }
    }
    else {
        // Should not happen, but just in case.
        return false;
    }
    return (defType !== container && container.providers !== undefined);
}
function validateProvider(provider, providers, containerType) {
    if (isTypeProvider(provider) ||
        isValueProvider(provider) ||
        isFactoryProvider(provider) ||
        isExistingProvider(provider)) {
        return;
    }
    // Here we expect the provider to be a `useClass` provider (by elimination).
    const classRef = resolveForwardRef(provider && (provider.useClass || provider.provide));
    if (!classRef) {
        throwInvalidProviderError(containerType, providers, provider);
    }
}
function deepForEachProvider(providers, fn) {
    for (let provider of providers) {
        if (isEnvironmentProviders(provider)) {
            provider = provider.ɵproviders;
        }
        if (Array.isArray(provider)) {
            deepForEachProvider(provider, fn);
        }
        else {
            fn(provider);
        }
    }
}
export const USE_VALUE = getClosureSafeProperty({
    provide: String,
    useValue: getClosureSafeProperty,
});
export function isValueProvider(value) {
    return value !== null && typeof value == 'object' && USE_VALUE in value;
}
export function isExistingProvider(value) {
    return !!(value && value.useExisting);
}
export function isFactoryProvider(value) {
    return !!(value && value.useFactory);
}
export function isTypeProvider(value) {
    return typeof value === 'function';
}
export function isClassProvider(value) {
    return !!value.useClass;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvdmlkZXJfY29sbGVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL2RpL3Byb3ZpZGVyX2NvbGxlY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFlBQVksRUFBbUIsTUFBTSxXQUFXLENBQUM7QUFFekQsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQ3RELE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSwrQkFBK0IsQ0FBQztBQUM1RCxPQUFPLEVBQUMsMEJBQTBCLEVBQUUseUJBQXlCLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUMzRixPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxpQ0FBaUMsQ0FBQztBQUNsRSxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDaEQsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUMxQyxPQUFPLEVBQUMsc0JBQXNCLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUN4RCxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFFNUMsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ2hELE9BQU8sRUFBQyx1QkFBdUIsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQzVELE9BQU8sRUFBQyxRQUFRLElBQUksTUFBTSxFQUFDLE1BQU0sMEJBQTBCLENBQUM7QUFDNUQsT0FBTyxFQUFDLGNBQWMsRUFBMEMsTUFBTSxrQkFBa0IsQ0FBQztBQUN6RixPQUFPLEVBUUwsc0JBQXNCLEdBTXZCLE1BQU0sc0JBQXNCLENBQUM7QUFDOUIsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFFckQ7OztHQUdHO0FBQ0gsTUFBTSxVQUFVLHdCQUF3QixDQUN0QyxTQUE4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eXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1J1bnRpbWVFcnJvciwgUnVudGltZUVycm9yQ29kZX0gZnJvbSAnLi4vZXJyb3JzJztcbmltcG9ydCB7VHlwZX0gZnJvbSAnLi4vaW50ZXJmYWNlL3R5cGUnO1xuaW1wb3J0IHtnZXRDb21wb25lbnREZWZ9IGZyb20gJy4uL3JlbmRlcjMvZGVmaW5pdGlvbic7XG5pbXBvcnQge2dldEZhY3RvcnlEZWZ9IGZyb20gJy4uL3JlbmRlcjMvZGVmaW5pdGlvbl9mYWN0b3J5JztcbmltcG9ydCB7dGhyb3dDeWNsaWNEZXBlbmRlbmN5RXJyb3IsIHRocm93SW52YWxpZFByb3ZpZGVyRXJyb3J9IGZyb20gJy4uL3JlbmRlcjMvZXJyb3JzX2RpJztcbmltcG9ydCB7c3RyaW5naWZ5Rm9yRXJyb3J9IGZyb20gJy4uL3JlbmRlcjMvdXRpbC9zdHJpbmdpZnlfdXRpbHMnO1xuaW1wb3J0IHtkZWVwRm9yRWFjaH0gZnJvbSAnLi4vdXRpbC9hcnJheV91dGlscyc7XG5pbXBvcnQge0VNUFRZX0FSUkFZfSBmcm9tICcuLi91dGlsL2VtcHR5JztcbmltcG9ydCB7Z2V0Q2xvc3VyZVNhZmVQcm9wZXJ0eX0gZnJvbSAnLi4vdXRpbC9wcm9wZXJ0eSc7XG5pbXBvcnQge3N0cmluZ2lmeX0gZnJvbSAnLi4vdXRpbC9zdHJpbmdpZnknO1xuXG5pbXBvcnQge3Jlc29sdmVGb3J3YXJkUmVmfSBmcm9tICcuL2ZvcndhcmRfcmVmJztcbmltcG9ydCB7RU5WSVJPTk1FTlRfSU5JVElBTElaRVJ9IGZyb20gJy4vaW5pdGlhbGl6ZXJfdG9rZW4nO1xuaW1wb3J0IHvJtcm1aW5qZWN0IGFzIGluamVjdH0gZnJvbSAnLi9pbmplY3Rvcl9jb21wYXRpYmlsaXR5JztcbmltcG9ydCB7Z2V0SW5qZWN0b3JEZWYsIEluamVjdG9yVHlwZSwgSW5qZWN0b3JUeXBlV2l0aFByb3ZpZGVyc30gZnJvbSAnLi9pbnRlcmZhY2UvZGVmcyc7XG5pbXBvcnQge1xuICBDbGFzc1Byb3ZpZGVyLFxuICBDb25zdHJ1Y3RvclByb3ZpZGVyLFxuICBFbnZpcm9ubWVudFByb3ZpZGVycyxcbiAgRXhpc3RpbmdQcm92aWRlcixcbiAgRmFjdG9yeVByb3ZpZGVyLFxuICBJbXBvcnRlZE5nTW9kdWxlUHJvdmlkZXJzLFxuICBJbnRlcm5hbEVudmlyb25tZW50UHJvdmlkZXJzLFxuICBpc0Vudmlyb25tZW50UHJvdmlkZXJzLFxuICBNb2R1bGVXaXRoUHJvdmlkZXJzLFxuICBQcm92aWRlcixcbiAgU3RhdGljQ2xhc3NQcm92aWRlcixcbiAgVHlwZVByb3ZpZGVyLFxuICBWYWx1ZVByb3ZpZGVyLFxufSBmcm9tICcuL2ludGVyZmFjZS9wcm92aWRlcic7XG5pbXBvcnQge0lOSkVDVE9SX0RFRl9UWVBFU30gZnJvbSAnLi9pbnRlcm5hbF90b2tlbnMnO1xuXG4vKipcbiAqIFdyYXAgYW4gYXJyYXkgb2YgYFByb3ZpZGVyYHMgaW50byBgRW52aXJvbm1lbnRQcm92aWRlcnNgLCBwcmV2ZW50aW5nIHRoZW0gZnJvbSBiZWluZyBhY2NpZGVudGFsbHlcbiAqIHJlZmVyZW5jZWQgaW4gYEBDb21wb25lbnRgIGluIGEgY29tcG9uZW50IGluamVjdG9yLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbWFrZUVudmlyb25tZW50UHJvdmlkZXJzKFxuICBwcm92aWRlcnM6IChQcm92aWRlciB8IEVudmlyb25tZW50UHJvdmlkZXJzKVtdLFxuKTogRW52aXJvbm1lbnRQcm92aWRlcnMge1xuICByZXR1cm4ge1xuICAgIMm1cHJvdmlkZXJzOiBwcm92aWRlcnMsXG4gIH0gYXMgdW5rbm93biBhcyBFbnZpcm9ubWVudFByb3ZpZGVycztcbn1cblxuLyoqXG4gKiBBIHNvdXJjZSBvZiBwcm92aWRlcnMgZm9yIHRoZSBgaW1wb3J0UHJvdmlkZXJzRnJvbWAgZnVuY3Rpb24uXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgdHlwZSBJbXBvcnRQcm92aWRlcnNTb3VyY2UgPVxuICB8IFR5cGU8dW5rbm93bj5cbiAgfCBNb2R1bGVXaXRoUHJvdmlkZXJzPHVua25vd24+XG4gIHwgQXJyYXk8SW1wb3J0UHJvdmlkZXJzU291cmNlPjtcblxudHlwZSBXYWxrUHJvdmlkZXJUcmVlVmlzaXRvciA9IChcbiAgcHJvdmlkZXI6IFNpbmdsZVByb3ZpZGVyLFxuICBjb250YWluZXI6IFR5cGU8dW5rbm93bj4gfCBJbmplY3RvclR5cGU8dW5rbm93bj4sXG4pID0+IHZvaWQ7XG5cbi8qKlxuICogQ29sbGVjdHMgcHJvdmlkZXJzIGZyb20gYWxsIE5nTW9kdWxlcyBhbmQgc3RhbmRhbG9uZSBjb21wb25lbnRzLCBpbmNsdWRpbmcgdHJhbnNpdGl2ZWx5IGltcG9ydGVkXG4gKiBvbmVzLlxuICpcbiAqIFByb3ZpZGVycyBleHRyYWN0ZWQgdmlhIGBpbXBvcnRQcm92aWRlcnNGcm9tYCBhcmUgb25seSB1c2FibGUgaW4gYW4gYXBwbGljYXRpb24gaW5qZWN0b3Igb3JcbiAqIGFub3RoZXIgZW52aXJvbm1lbnQgaW5qZWN0b3IgKHN1Y2ggYXMgYSByb3V0ZSBpbmplY3RvcikuIFRoZXkgc2hvdWxkIG5vdCBiZSB1c2VkIGluIGNvbXBvbmVudFxuICogcHJvdmlkZXJzLlxuICpcbiAqIE1vcmUgaW5mb3JtYXRpb24gYWJvdXQgc3RhbmRhbG9uZSBjb21wb25lbnRzIGNhbiBiZSBmb3VuZCBpbiBbdGhpc1xuICogZ3VpZGVdKGd1aWRlL2NvbXBvbmVudHMvaW1wb3J0aW5nKS5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogVGhlIHJlc3VsdHMgb2YgdGhlIGBpbXBvcnRQcm92aWRlcnNGcm9tYCBjYWxsIGNhbiBiZSB1c2VkIGluIHRoZSBgYm9vdHN0cmFwQXBwbGljYXRpb25gIGNhbGw6XG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogYXdhaXQgYm9vdHN0cmFwQXBwbGljYXRpb24oUm9vdENvbXBvbmVudCwge1xuICogICBwcm92aWRlcnM6IFtcbiAqICAgICBpbXBvcnRQcm92aWRlcnNGcm9tKE5nTW9kdWxlT25lLCBOZ01vZHVsZVR3bylcbiAqICAgXVxuICogfSk7XG4gKiBgYGBcbiAqXG4gKiBZb3UgY2FuIGFsc28gdXNlIHRoZSBgaW1wb3J0UHJvdmlkZXJzRnJvbWAgcmVzdWx0cyBpbiB0aGUgYHByb3ZpZGVyc2AgZmllbGQgb2YgYSByb3V0ZSwgd2hlbiBhXG4gKiBzdGFuZGFsb25lIGNvbXBvbmVudCBpcyB1c2VkOlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGV4cG9ydCBjb25zdCBST1VURVM6IFJvdXRlW10gPSBbXG4gKiAgIHtcbiAqICAgICBwYXRoOiAnZm9vJyxcbiAqICAgICBwcm92aWRlcnM6IFtcbiAqICAgICAgIGltcG9ydFByb3ZpZGVyc0Zyb20oTmdNb2R1bGVPbmUsIE5nTW9kdWxlVHdvKVxuICogICAgIF0sXG4gKiAgICAgY29tcG9uZW50OiBZb3VyU3RhbmRhbG9uZUNvbXBvbmVudFxuICogICB9XG4gKiBdO1xuICogYGBgXG4gKlxuICogQHJldHVybnMgQ29sbGVjdGVkIHByb3ZpZGVycyBmcm9tIHRoZSBzcGVjaWZpZWQgbGlzdCBvZiB0eXBlcy5cbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGltcG9ydFByb3ZpZGVyc0Zyb20oLi4uc291cmNlczogSW1wb3J0UHJvdmlkZXJzU291cmNlW10pOiBFbnZpcm9ubWVudFByb3ZpZGVycyB7XG4gIHJldHVybiB7XG4gICAgybVwcm92aWRlcnM6IGludGVybmFsSW1wb3J0UHJvdmlkZXJzRnJvbSh0cnVlLCBzb3VyY2VzKSxcbiAgICDJtWZyb21OZ01vZHVsZTogdHJ1ZSxcbiAgfSBhcyBJbnRlcm5hbEVudmlyb25tZW50UHJvdmlkZXJzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW50ZXJuYWxJbXBvcnRQcm92aWRlcnNGcm9tKFxuICBjaGVja0ZvclN0YW5kYWxvbmVDbXA6IGJvb2xlYW4sXG4gIC4uLnNvdXJjZXM6IEltcG9ydFByb3ZpZGVyc1NvdXJjZVtdXG4pOiBQcm92aWRlcltdIHtcbiAgY29uc3QgcHJvdmlkZXJzT3V0OiBTaW5nbGVQcm92aWRlcltdID0gW107XG4gIGNvbnN0IGRlZHVwID0gbmV3IFNldDxUeXBlPHVua25vd24+PigpOyAvLyBhbHJlYWR5IHNlZW4gdHlwZXNcbiAgbGV0IGluamVjdG9yVHlwZXNXaXRoUHJvdmlkZXJzOiBJbmplY3RvclR5cGVXaXRoUHJvdmlkZXJzPHVua25vd24+W10gfCB1bmRlZmluZWQ7XG5cbiAgY29uc3QgY29sbGVjdFByb3ZpZGVyczogV2Fsa1Byb3ZpZGVyVHJlZVZpc2l0b3IgPSAocHJvdmlkZXIpID0+IHtcbiAgICBwcm92aWRlcnNPdXQucHVzaChwcm92aWRlcik7XG4gIH07XG5cbiAgZGVlcEZvckVhY2goc291cmNlcywgKHNvdXJjZSkgPT4ge1xuICAgIGlmICgodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSAmJiBjaGVja0ZvclN0YW5kYWxvbmVDbXApIHtcbiAgICAgIGNvbnN0IGNtcERlZiA9IGdldENvbXBvbmVudERlZihzb3VyY2UpO1xuICAgICAgaWYgKGNtcERlZj8uc3RhbmRhbG9uZSkge1xuICAgICAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU1QT1JUX1BST1ZJREVSU19GUk9NX1NUQU5EQUxPTkUsXG4gICAgICAgICAgYEltcG9ydGluZyBwcm92aWRlcnMgc3VwcG9ydHMgTmdNb2R1bGUgb3IgTW9kdWxlV2l0aFByb3ZpZGVycyBidXQgZ290IGEgc3RhbmRhbG9uZSBjb21wb25lbnQgXCIke3N0cmluZ2lmeUZvckVycm9yKFxuICAgICAgICAgICAgc291cmNlLFxuICAgICAgICAgICl9XCJgLFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIE5hcnJvdyBgc291cmNlYCB0byBhY2Nlc3MgdGhlIGludGVybmFsIHR5cGUgYW5hbG9ndWUgZm9yIGBNb2R1bGVXaXRoUHJvdmlkZXJzYC5cbiAgICBjb25zdCBpbnRlcm5hbFNvdXJjZSA9IHNvdXJjZSBhcyBUeXBlPHVua25vd24+IHwgSW5qZWN0b3JUeXBlV2l0aFByb3ZpZGVyczx1bmtub3duPjtcbiAgICBpZiAod2Fsa1Byb3ZpZGVyVHJlZShpbnRlcm5hbFNvdXJjZSwgY29sbGVjdFByb3ZpZGVycywgW10sIGRlZHVwKSkge1xuICAgICAgaW5qZWN0b3JUeXBlc1dpdGhQcm92aWRlcnMgfHw9IFtdO1xuICAgICAgaW5qZWN0b3JUeXBlc1dpdGhQcm92aWRlcnMucHVzaChpbnRlcm5hbFNvdXJjZSk7XG4gICAgfVxuICB9KTtcbiAgLy8gQ29sbGVjdCBhbGwgcHJvdmlkZXJzIGZyb20gYE1vZHVsZVdpdGhQcm92aWRlcnNgIHR5cGVzLlxuICBpZiAoaW5qZWN0b3JUeXBlc1dpdGhQcm92aWRlcnMgIT09IHVuZGVmaW5lZCkge1xuICAgIHByb2Nlc3NJbmplY3RvclR5cGVzV2l0aFByb3ZpZGVycyhpbmplY3RvclR5cGVzV2l0aFByb3ZpZGVycywgY29sbGVjdFByb3ZpZGVycyk7XG4gIH1cblxuICByZXR1cm4gcHJvdmlkZXJzT3V0O1xufVxuXG4vKipcbiAqIENvbGxlY3RzIGFsbCBwcm92aWRlcnMgZnJvbSB0aGUgbGlzdCBvZiBgTW9kdWxlV2l0aFByb3ZpZGVyc2AgYW5kIGFwcGVuZHMgdGhlbSB0byB0aGUgcHJvdmlkZWRcbiAqIGFycmF5LlxuICovXG5mdW5jdGlvbiBwcm9jZXNzSW5qZWN0b3JUeXBlc1dpdGhQcm92aWRlcnMoXG4gIHR5cGVzV2l0aFByb3ZpZGVyczogSW5qZWN0b3JUeXBlV2l0aFByb3ZpZGVyczx1bmtub3duPltdLFxuICB2aXNpdG9yOiBXYWxrUHJvdmlkZXJUcmVlVmlzaXRvcixcbik6IHZvaWQge1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHR5cGVzV2l0aFByb3ZpZGVycy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHtuZ01vZHVsZSwgcHJvdmlkZXJzfSA9IHR5cGVzV2l0aFByb3ZpZGVyc1tpXTtcbiAgICBkZWVwRm9yRWFjaFByb3ZpZGVyKFxuICAgICAgcHJvdmlkZXJzISBhcyBBcnJheTxQcm92aWRlciB8IEludGVybmFsRW52aXJvbm1lbnRQcm92aWRlcnM+LFxuICAgICAgKHByb3ZpZGVyKSA9PiB7XG4gICAgICAgIG5nRGV2TW9kZSAmJiB2YWxpZGF0ZVByb3ZpZGVyKHByb3ZpZGVyLCBwcm92aWRlcnMgfHwgRU1QVFlfQVJSQVksIG5nTW9kdWxlKTtcbiAgICAgICAgdmlzaXRvcihwcm92aWRlciwgbmdNb2R1bGUpO1xuICAgICAgfSxcbiAgICApO1xuICB9XG59XG5cbi8qKlxuICogSW50ZXJuYWwgdHlwZSBmb3IgYSBzaW5nbGUgcHJvdmlkZXIgaW4gYSBkZWVwIHByb3ZpZGVyIGFycmF5LlxuICovXG5leHBvcnQgdHlwZSBTaW5nbGVQcm92aWRlciA9XG4gIHwgVHlwZVByb3ZpZGVyXG4gIHwgVmFsdWVQcm92aWRlclxuICB8IENsYXNzUHJvdmlkZXJcbiAgfCBDb25zdHJ1Y3RvclByb3ZpZGVyXG4gIHwgRXhpc3RpbmdQcm92aWRlclxuICB8IEZhY3RvcnlQcm92aWRlclxuICB8IFN0YXRpY0NsYXNzUHJvdmlkZXI7XG5cbi8qKlxuICogVGhlIGxvZ2ljIHZpc2l0cyBhbiBgSW5qZWN0b3JUeXBlYCwgYW4gYEluamVjdG9yVHlwZVdpdGhQcm92aWRlcnNgLCBvciBhIHN0YW5kYWxvbmVcbiAqIGBDb21wb25lbnRUeXBlYCwgYW5kIGFsbCBvZiBpdHMgdHJhbnNpdGl2ZSBwcm92aWRlcnMgYW5kIGNvbGxlY3RzIHByb3ZpZGVycy5cbiAqXG4gKiBJZiBhbiBgSW5qZWN0b3JUeXBlV2l0aFByb3ZpZGVyc2AgdGhhdCBkZWNsYXJlcyBwcm92aWRlcnMgYmVzaWRlcyB0aGUgdHlwZSBpcyBzcGVjaWZpZWQsXG4gKiB0aGUgZnVuY3Rpb24gd2lsbCByZXR1cm4gXCJ0cnVlXCIgdG8gaW5kaWNhdGUgdGhhdCB0aGUgcHJvdmlkZXJzIG9mIHRoZSB0eXBlIGRlZmluaXRpb24gbmVlZFxuICogdG8gYmUgcHJvY2Vzc2VkLiBUaGlzIGFsbG93cyB1cyB0byBwcm9jZXNzIHByb3ZpZGVycyBvZiBpbmplY3RvciB0eXBlcyBhZnRlciBhbGwgaW1wb3J0cyBvZlxuICogYW4gaW5qZWN0b3IgZGVmaW5pdGlvbiBhcmUgcHJvY2Vzc2VkLiAoZm9sbG93aW5nIFZpZXcgRW5naW5lIHNlbWFudGljczogc2VlIEZXLTEzNDkpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3YWxrUHJvdmlkZXJUcmVlKFxuICBjb250YWluZXI6IFR5cGU8dW5rbm93bj4gfCBJbmplY3RvclR5cGVXaXRoUHJvdmlkZXJzPHVua25vd24+LFxuICB2aXNpdG9yOiBXYWxrUHJvdmlkZXJUcmVlVmlzaXRvcixcbiAgcGFyZW50czogVHlwZTx1bmtub3duPltdLFxuICBkZWR1cDogU2V0PFR5cGU8dW5rbm93bj4+LFxuKTogY29udGFpbmVyIGlzIEluamVjdG9yVHlwZVdpdGhQcm92aWRlcnM8dW5rbm93bj4ge1xuICBjb250YWluZXIgPSByZXNvbHZlRm9yd2FyZFJlZihjb250YWluZXIpO1xuICBpZiAoIWNvbnRhaW5lcikgcmV0dXJuIGZhbHNlO1xuXG4gIC8vIFRoZSBhY3R1YWwgdHlwZSB3aGljaCBoYWQgdGhlIGRlZmluaXRpb24uIFVzdWFsbHkgYGNvbnRhaW5lcmAsIGJ1dCBtYXkgYmUgYW4gdW53cmFwcGVkIHR5cGVcbiAgLy8gZnJvbSBgSW5qZWN0b3JUeXBlV2l0aFByb3ZpZGVyc2AuXG4gIGxldCBkZWZUeXBlOiBUeXBlPHVua25vd24+IHwgbnVsbCA9IG51bGw7XG5cbiAgbGV0IGluakRlZiA9IGdldEluamVjdG9yRGVmKGNvbnRhaW5lcik7XG4gIGNvbnN0IGNtcERlZiA9ICFpbmpEZWYgJiYgZ2V0Q29tcG9uZW50RGVmKGNvbnRhaW5lcik7XG4gIGlmICghaW5qRGVmICYmICFjbXBEZWYpIHtcbiAgICAvLyBgY29udGFpbmVyYCBpcyBub3QgYW4gaW5qZWN0b3IgdHlwZSBvciBhIGNvbXBvbmVudCB0eXBlLiBJdCBtaWdodCBiZTpcbiAgICAvLyAgKiBBbiBgSW5qZWN0b3JUeXBlV2l0aFByb3ZpZGVyc2AgdGhhdCB3cmFwcyBhbiBpbmplY3RvciB0eXBlLlxuICAgIC8vICAqIEEgc3RhbmRhbG9uZSBkaXJlY3RpdmUgb3IgcGlwZSB0aGF0IGdvdCBwdWxsZWQgaW4gZnJvbSBhIHN0YW5kYWxvbmUgY29tcG9uZW50J3NcbiAgICAvLyAgICBkZXBlbmRlbmNpZXMuXG4gICAgLy8gVHJ5IHRvIHVud3JhcCBpdCBhcyBhbiBgSW5qZWN0b3JUeXBlV2l0aFByb3ZpZGVyc2AgZmlyc3QuXG4gICAgY29uc3QgbmdNb2R1bGU6IFR5cGU8dW5rbm93bj4gfCB1bmRlZmluZWQgPSAoY29udGFpbmVyIGFzIEluamVjdG9yVHlwZVdpdGhQcm92aWRlcnM8YW55PilcbiAgICAgIC5uZ01vZHVsZSBhcyBUeXBlPHVua25vd24+IHwgdW5kZWZpbmVkO1xuICAgIGluakRlZiA9IGdldEluamVjdG9yRGVmKG5nTW9kdWxlKTtcbiAgICBpZiAoaW5qRGVmKSB7XG4gICAgICBkZWZUeXBlID0gbmdNb2R1bGUhO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBOb3QgYSBjb21wb25lbnQgb3IgaW5qZWN0b3IgdHlwZSwgc28gaWdub3JlIGl0LlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfSBlbHNlIGlmIChjbXBEZWYgJiYgIWNtcERlZi5zdGFuZGFsb25lKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9IGVsc2Uge1xuICAgIGRlZlR5cGUgPSBjb250YWluZXIgYXMgVHlwZTx1bmtub3duPjtcbiAgfVxuXG4gIC8vIENoZWNrIGZvciBjaXJjdWxhciBkZXBlbmRlbmNpZXMuXG4gIGlmIChuZ0Rldk1vZGUgJiYgcGFyZW50cy5pbmRleE9mKGRlZlR5cGUpICE9PSAtMSkge1xuICAgIGNvbnN0IGRlZk5hbWUgPSBzdHJpbmdpZnkoZGVmVHlwZSk7XG4gICAgY29uc3QgcGF0aCA9IHBhcmVudHMubWFwKHN0cmluZ2lmeSk7XG4gICAgdGhyb3dDeWNsaWNEZXBlbmRlbmN5RXJyb3IoZGVmTmFtZSwgcGF0aCk7XG4gIH1cblxuICAvLyBDaGVjayBmb3IgbXVsdGlwbGUgaW1wb3J0cyBvZiB0aGUgc2FtZSBtb2R1bGVcbiAgY29uc3QgaXNEdXBsaWNhdGUgPSBkZWR1cC5oYXMoZGVmVHlwZSk7XG5cbiAgaWYgKGNtcERlZikge1xuICAgIGlmIChpc0R1cGxpY2F0ZSkge1xuICAgICAgLy8gVGhpcyBjb21wb25lbnQgZGVmaW5pdGlvbiBoYXMgYWxyZWFkeSBiZWVuIHByb2Nlc3NlZC5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgZGVkdXAuYWRkKGRlZlR5cGUpO1xuXG4gICAgaWYgKGNtcERlZi5kZXBlbmRlbmNpZXMpIHtcbiAgICAgIGNvbnN0IGRlcHMgPVxuICAgICAgICB0eXBlb2YgY21wRGVmLmRlcGVuZGVuY2llcyA9PT0gJ2Z1bmN0aW9uJyA/IGNtcERlZi5kZXBlbmRlbmNpZXMoKSA6IGNtcERlZi5kZXBlbmRlbmNpZXM7XG4gICAgICBmb3IgKGNvbnN0IGRlcCBvZiBkZXBzKSB7XG4gICAgICAgIHdhbGtQcm92aWRlclRyZWUoZGVwLCB2aXNpdG9yLCBwYXJlbnRzLCBkZWR1cCk7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2UgaWYgKGluakRlZikge1xuICAgIC8vIEZpcnN0LCBpbmNsdWRlIHByb3ZpZGVycyBmcm9tIGFueSBpbXBvcnRzLlxuICAgIGlmIChpbmpEZWYuaW1wb3J0cyAhPSBudWxsICYmICFpc0R1cGxpY2F0ZSkge1xuICAgICAgLy8gQmVmb3JlIHByb2Nlc3NpbmcgZGVmVHlwZSdzIGltcG9ydHMsIGFkZCBpdCB0byB0aGUgc2V0IG9mIHBhcmVudHMuIFRoaXMgd2F5LCBpZiBpdCBlbmRzXG4gICAgICAvLyB1cCBkZWVwbHkgaW1wb3J0aW5nIGl0c2VsZiwgdGhpcyBjYW4gYmUgZGV0ZWN0ZWQuXG4gICAgICBuZ0Rldk1vZGUgJiYgcGFyZW50cy5wdXNoKGRlZlR5cGUpO1xuICAgICAgLy8gQWRkIGl0IHRvIHRoZSBzZXQgb2YgZGVkdXBzLiBUaGlzIHdheSB3ZSBjYW4gZGV0ZWN0IG11bHRpcGxlIGltcG9ydHMgb2YgdGhlIHNhbWUgbW9kdWxlXG4gICAgICBkZWR1cC5hZGQoZGVmVHlwZSk7XG5cbiAgICAgIGxldCBpbXBvcnRUeXBlc1dpdGhQcm92aWRlcnM6IEluamVjdG9yVHlwZVdpdGhQcm92aWRlcnM8YW55PltdIHwgdW5kZWZpbmVkO1xuICAgICAgdHJ5IHtcbiAgICAgICAgZGVlcEZvckVhY2goaW5qRGVmLmltcG9ydHMsIChpbXBvcnRlZCkgPT4ge1xuICAgICAgICAgIGlmICh3YWxrUHJvdmlkZXJUcmVlKGltcG9ydGVkLCB2aXNpdG9yLCBwYXJlbnRzLCBkZWR1cCkpIHtcbiAgICAgICAgICAgIGltcG9ydFR5cGVzV2l0aFByb3ZpZGVycyB8fD0gW107XG4gICAgICAgICAgICAvLyBJZiB0aGUgcHJvY2Vzc2VkIGltcG9ydCBpcyBhbiBpbmplY3RvciB0eXBlIHdpdGggcHJvdmlkZXJzLCB3ZSBzdG9yZSBpdCBpbiB0aGVcbiAgICAgICAgICAgIC8vIGxpc3Qgb2YgaW1wb3J0IHR5cGVzIHdpdGggcHJvdmlkZXJzLCBzbyB0aGF0IHdlIGNhbiBwcm9jZXNzIHRob3NlIGFmdGVyd2FyZHMuXG4gICAgICAgICAgICBpbXBvcnRUeXBlc1dpdGhQcm92aWRlcnMucHVzaChpbXBvcnRlZCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIC8vIFJlbW92ZSBpdCBmcm9tIHRoZSBwYXJlbnRzIHNldCB3aGVuIGZpbmlzaGVkLlxuICAgICAgICBuZ0Rldk1vZGUgJiYgcGFyZW50cy5wb3AoKTtcbiAgICAgIH1cblxuICAgICAgLy8gSW1wb3J0cyB3aGljaCBhcmUgZGVjbGFyZWQgd2l0aCBwcm92aWRlcnMgKFR5cGVXaXRoUHJvdmlkZXJzKSBuZWVkIHRvIGJlIHByb2Nlc3NlZFxuICAgICAgLy8gYWZ0ZXIgYWxsIGltcG9ydGVkIG1vZHVsZXMgYXJlIHByb2Nlc3NlZC4gVGhpcyBpcyBzaW1pbGFyIHRvIGhvdyBWaWV3IEVuZ2luZVxuICAgICAgLy8gcHJvY2Vzc2VzL21lcmdlcyBtb2R1bGUgaW1wb3J0cyBpbiB0aGUgbWV0YWRhdGEgcmVzb2x2ZXIuIFNlZTogRlctMTM0OS5cbiAgICAgIGlmIChpbXBvcnRUeXBlc1dpdGhQcm92aWRlcnMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBwcm9jZXNzSW5qZWN0b3JUeXBlc1dpdGhQcm92aWRlcnMoaW1wb3J0VHlwZXNXaXRoUHJvdmlkZXJzLCB2aXNpdG9yKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIWlzRHVwbGljYXRlKSB7XG4gICAgICAvLyBUcmFjayB0aGUgSW5qZWN0b3JUeXBlIGFuZCBhZGQgYSBwcm92aWRlciBmb3IgaXQuXG4gICAgICAvLyBJdCdzIGltcG9ydGFudCB0aGF0IHRoaXMgaXMgZG9uZSBhZnRlciB0aGUgZGVmJ3MgaW1wb3J0cy5cbiAgICAgIGNvbnN0IGZhY3RvcnkgPSBnZXRGYWN0b3J5RGVmKGRlZlR5cGUpIHx8ICgoKSA9PiBuZXcgZGVmVHlwZSEoKSk7XG5cbiAgICAgIC8vIEFwcGVuZCBleHRyYSBwcm92aWRlcnMgdG8gbWFrZSBtb3JlIGluZm8gYXZhaWxhYmxlIGZvciBjb25zdW1lcnMgKHRvIHJldHJpZXZlIGFuIGluamVjdG9yXG4gICAgICAvLyB0eXBlKSwgYXMgd2VsbCBhcyBpbnRlcm5hbGx5ICh0byBjYWxjdWxhdGUgYW4gaW5qZWN0aW9uIHNjb3BlIGNvcnJlY3RseSBhbmQgZWFnZXJseVxuICAgICAgLy8gaW5zdGFudGlhdGUgYSBgZGVmVHlwZWAgd2hlbiBhbiBpbmplY3RvciBpcyBjcmVhdGVkKS5cblxuICAgICAgLy8gUHJvdmlkZXIgdG8gY3JlYXRlIGBkZWZUeXBlYCB1c2luZyBpdHMgZmFjdG9yeS5cbiAgICAgIHZpc2l0b3Ioe3Byb3ZpZGU6IGRlZlR5cGUsIHVzZUZhY3Rvcnk6IGZhY3RvcnksIGRlcHM6IEVNUFRZX0FSUkFZfSwgZGVmVHlwZSk7XG5cbiAgICAgIC8vIE1ha2UgdGhpcyBgZGVmVHlwZWAgYXZhaWxhYmxlIHRvIGFuIGludGVybmFsIGxvZ2ljIHRoYXQgY2FsY3VsYXRlcyBpbmplY3RvciBzY29wZS5cbiAgICAgIHZpc2l0b3Ioe3Byb3ZpZGU6IElOSkVDVE9SX0RFRl9UWVBFUywgdXNlVmFsdWU6IGRlZlR5cGUsIG11bHRpOiB0cnVlfSwgZGVmVHlwZSk7XG5cbiAgICAgIC8vIFByb3ZpZGVyIHRvIGVhZ2VybHkgaW5zdGFudGlhdGUgYGRlZlR5cGVgIHZpYSBgSU5KRUNUT1JfSU5JVElBTElaRVJgLlxuICAgICAgdmlzaXRvcihcbiAgICAgICAge3Byb3ZpZGU6IEVOVklST05NRU5UX0lOSVRJQUxJWkVSLCB1c2VWYWx1ZTogKCkgPT4gaW5qZWN0KGRlZlR5cGUhKSwgbXVsdGk6IHRydWV9LFxuICAgICAgICBkZWZUeXBlLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBOZXh0LCBpbmNsdWRlIHByb3ZpZGVycyBsaXN0ZWQgb24gdGhlIGRlZmluaXRpb24gaXRzZWxmLlxuICAgIGNvbnN0IGRlZlByb3ZpZGVycyA9IGluakRlZi5wcm92aWRlcnMgYXMgQXJyYXk8U2luZ2xlUHJvdmlkZXIgfCBJbnRlcm5hbEVudmlyb25tZW50UHJvdmlkZXJzPjtcbiAgICBpZiAoZGVmUHJvdmlkZXJzICE9IG51bGwgJiYgIWlzRHVwbGljYXRlKSB7XG4gICAgICBjb25zdCBpbmplY3RvclR5cGUgPSBjb250YWluZXIgYXMgSW5qZWN0b3JUeXBlPGFueT47XG4gICAgICBkZWVwRm9yRWFjaFByb3ZpZGVyKGRlZlByb3ZpZGVycywgKHByb3ZpZGVyKSA9PiB7XG4gICAgICAgIG5nRGV2TW9kZSAmJiB2YWxpZGF0ZVByb3ZpZGVyKHByb3ZpZGVyIGFzIFNpbmdsZVByb3ZpZGVyLCBkZWZQcm92aWRlcnMsIGluamVjdG9yVHlwZSk7XG4gICAgICAgIHZpc2l0b3IocHJvdmlkZXIsIGluamVjdG9yVHlwZSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gU2hvdWxkIG5vdCBoYXBwZW4sIGJ1dCBqdXN0IGluIGNhc2UuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIChcbiAgICBkZWZUeXBlICE9PSBjb250YWluZXIgJiYgKGNvbnRhaW5lciBhcyBJbmplY3RvclR5cGVXaXRoUHJvdmlkZXJzPGFueT4pLnByb3ZpZGVycyAhPT0gdW5kZWZpbmVkXG4gICk7XG59XG5cbmZ1bmN0aW9uIHZhbGlkYXRlUHJvdmlkZXIoXG4gIHByb3ZpZGVyOiBTaW5nbGVQcm92aWRlcixcbiAgcHJvdmlkZXJzOiBBcnJheTxTaW5nbGVQcm92aWRlciB8IEludGVybmFsRW52aXJvbm1lbnRQcm92aWRlcnM+LFxuICBjb250YWluZXJUeXBlOiBUeXBlPHVua25vd24+LFxuKTogdm9pZCB7XG4gIGlmIChcbiAgICBpc1R5cGVQcm92aWRlcihwcm92aWRlcikgfHxcbiAgICBpc1ZhbHVlUHJvdmlkZXIocHJvdmlkZXIpIHx8XG4gICAgaXNGYWN0b3J5UHJvdmlkZXIocHJvdmlkZXIpIHx8XG4gICAgaXNFeGlzdGluZ1Byb3ZpZGVyKHByb3ZpZGVyKVxuICApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBIZXJlIHdlIGV4cGVjdCB0aGUgcHJvdmlkZXIgdG8gYmUgYSBgdXNlQ2xhc3NgIHByb3ZpZGVyIChieSBlbGltaW5hdGlvbikuXG4gIGNvbnN0IGNsYXNzUmVmID0gcmVzb2x2ZUZvcndhcmRSZWYoXG4gICAgcHJvdmlkZXIgJiYgKChwcm92aWRlciBhcyBTdGF0aWNDbGFzc1Byb3ZpZGVyIHwgQ2xhc3NQcm92aWRlcikudXNlQ2xhc3MgfHwgcHJvdmlkZXIucHJvdmlkZSksXG4gICk7XG4gIGlmICghY2xhc3NSZWYpIHtcbiAgICB0aHJvd0ludmFsaWRQcm92aWRlckVycm9yKGNvbnRhaW5lclR5cGUsIHByb3ZpZGVycywgcHJvdmlkZXIpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGRlZXBGb3JFYWNoUHJvdmlkZXIoXG4gIHByb3ZpZGVyczogQXJyYXk8UHJvdmlkZXIgfCBJbnRlcm5hbEVudmlyb25tZW50UHJvdmlkZXJzPixcbiAgZm46IChwcm92aWRlcjogU2luZ2xlUHJvdmlkZXIpID0+IHZvaWQsXG4pOiB2b2lkIHtcbiAgZm9yIChsZXQgcHJvdmlkZXIgb2YgcHJvdmlkZXJzKSB7XG4gICAgaWYgKGlzRW52aXJvbm1lbnRQcm92aWRlcnMocHJvdmlkZXIpKSB7XG4gICAgICBwcm92aWRlciA9IHByb3ZpZGVyLsm1cHJvdmlkZXJzO1xuICAgIH1cbiAgICBpZiAoQXJyYXkuaXNBcnJheShwcm92aWRlcikpIHtcbiAgICAgIGRlZXBGb3JFYWNoUHJvdmlkZXIocHJvdmlkZXIsIGZuKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZm4ocHJvdmlkZXIpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgY29uc3QgVVNFX1ZBTFVFID0gZ2V0Q2xvc3VyZVNhZmVQcm9wZXJ0eTxWYWx1ZVByb3ZpZGVyPih7XG4gIHByb3ZpZGU6IFN0cmluZyxcbiAgdXNlVmFsdWU6IGdldENsb3N1cmVTYWZlUHJvcGVydHksXG59KTtcblxuZXhwb3J0IGZ1bmN0aW9uIGlzVmFsdWVQcm92aWRlcih2YWx1ZTogU2luZ2xlUHJvdmlkZXIpOiB2YWx1ZSBpcyBWYWx1ZVByb3ZpZGVyIHtcbiAgcmV0dXJuIHZhbHVlICE9PSBudWxsICYmIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0JyAmJiBVU0VfVkFMVUUgaW4gdmFsdWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0V4aXN0aW5nUHJvdmlkZXIodmFsdWU6IFNpbmdsZVByb3ZpZGVyKTogdmFsdWUgaXMgRXhpc3RpbmdQcm92aWRlciB7XG4gIHJldHVybiAhISh2YWx1ZSAmJiAodmFsdWUgYXMgRXhpc3RpbmdQcm92aWRlcikudXNlRXhpc3RpbmcpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNGYWN0b3J5UHJvdmlkZXIodmFsdWU6IFNpbmdsZVByb3ZpZGVyKTogdmFsdWUgaXMgRmFjdG9yeVByb3ZpZGVyIHtcbiAgcmV0dXJuICEhKHZhbHVlICYmICh2YWx1ZSBhcyBGYWN0b3J5UHJvdmlkZXIpLnVzZUZhY3RvcnkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNUeXBlUHJvdmlkZXIodmFsdWU6IFNpbmdsZVByb3ZpZGVyKTogdmFsdWUgaXMgVHlwZVByb3ZpZGVyIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzQ2xhc3NQcm92aWRlcih2YWx1ZTogU2luZ2xlUHJvdmlkZXIpOiB2YWx1ZSBpcyBDbGFzc1Byb3ZpZGVyIHtcbiAgcmV0dXJuICEhKHZhbHVlIGFzIFN0YXRpY0NsYXNzUHJvdmlkZXIgfCBDbGFzc1Byb3ZpZGVyKS51c2VDbGFzcztcbn1cbiJdfQ==