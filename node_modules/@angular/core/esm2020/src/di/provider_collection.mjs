/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
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
import { isEnvironmentProviders } from './interface/provider';
import { INJECTOR_DEF_TYPES } from './internal_tokens';
/**
 * Wrap an array of `Provider`s into `EnvironmentProviders`, preventing them from being accidentally
 * referenced in `@Component in a component injector.
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
 * guide](guide/standalone-components).
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
    deepForEach(sources, source => {
        if ((typeof ngDevMode === 'undefined' || ngDevMode) && checkForStandaloneCmp) {
            const cmpDef = getComponentDef(source);
            if (cmpDef?.standalone) {
                throw new RuntimeError(800 /* RuntimeErrorCode.IMPORT_PROVIDERS_FROM_STANDALONE */, `Importing providers supports NgModule or ModuleWithProviders but got a standalone component "${stringifyForError(source)}"`);
            }
        }
        // Narrow `source` to access the internal type analogue for `ModuleWithProviders`.
        const internalSource = source;
        if (walkProviderTree(internalSource, providersOut, [], dedup)) {
            injectorTypesWithProviders || (injectorTypesWithProviders = []);
            injectorTypesWithProviders.push(internalSource);
        }
    });
    // Collect all providers from `ModuleWithProviders` types.
    if (injectorTypesWithProviders !== undefined) {
        processInjectorTypesWithProviders(injectorTypesWithProviders, providersOut);
    }
    return providersOut;
}
/**
 * Collects all providers from the list of `ModuleWithProviders` and appends them to the provided
 * array.
 */
function processInjectorTypesWithProviders(typesWithProviders, providersOut) {
    for (let i = 0; i < typesWithProviders.length; i++) {
        const { ngModule, providers } = typesWithProviders[i];
        deepForEachProvider(providers, provider => {
            ngDevMode && validateProvider(provider, providers || EMPTY_ARRAY, ngModule);
            providersOut.push(provider);
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
export function walkProviderTree(container, providersOut, parents, dedup) {
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
        const ngModule = container.ngModule;
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
                walkProviderTree(dep, providersOut, parents, dedup);
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
                deepForEach(injDef.imports, imported => {
                    if (walkProviderTree(imported, providersOut, parents, dedup)) {
                        importTypesWithProviders || (importTypesWithProviders = []);
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
                processInjectorTypesWithProviders(importTypesWithProviders, providersOut);
            }
        }
        if (!isDuplicate) {
            // Track the InjectorType and add a provider for it.
            // It's important that this is done after the def's imports.
            const factory = getFactoryDef(defType) || (() => new defType());
            // Append extra providers to make more info available for consumers (to retrieve an injector
            // type), as well as internally (to calculate an injection scope correctly and eagerly
            // instantiate a `defType` when an injector is created).
            providersOut.push(
            // Provider to create `defType` using its factory.
            { provide: defType, useFactory: factory, deps: EMPTY_ARRAY }, 
            // Make this `defType` available to an internal logic that calculates injector scope.
            { provide: INJECTOR_DEF_TYPES, useValue: defType, multi: true }, 
            // Provider to eagerly instantiate `defType` via `ENVIRONMENT_INITIALIZER`.
            { provide: ENVIRONMENT_INITIALIZER, useValue: () => inject(defType), multi: true } //
            );
        }
        // Next, include providers listed on the definition itself.
        const defProviders = injDef.providers;
        if (defProviders != null && !isDuplicate) {
            const injectorType = container;
            deepForEachProvider(defProviders, provider => {
                ngDevMode && validateProvider(provider, defProviders, injectorType);
                providersOut.push(provider);
            });
        }
    }
    else {
        // Should not happen, but just in case.
        return false;
    }
    return (defType !== container &&
        container.providers !== undefined);
}
function validateProvider(provider, providers, containerType) {
    if (isTypeProvider(provider) || isValueProvider(provider) || isFactoryProvider(provider) ||
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
export const USE_VALUE = getClosureSafeProperty({ provide: String, useValue: getClosureSafeProperty });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvdmlkZXJfY29sbGVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL2RpL3Byb3ZpZGVyX2NvbGxlY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFlBQVksRUFBbUIsTUFBTSxXQUFXLENBQUM7QUFFekQsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQ3RELE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSwrQkFBK0IsQ0FBQztBQUM1RCxPQUFPLEVBQUMsMEJBQTBCLEVBQUUseUJBQXlCLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUMzRixPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxpQ0FBaUMsQ0FBQztBQUNsRSxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDaEQsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUMxQyxPQUFPLEVBQUMsc0JBQXNCLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUN4RCxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFFNUMsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ2hELE9BQU8sRUFBQyx1QkFBdUIsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQzVELE9BQU8sRUFBQyxRQUFRLElBQUksTUFBTSxFQUFDLE1BQU0sMEJBQTBCLENBQUM7QUFDNUQsT0FBTyxFQUFDLGNBQWMsRUFBMEMsTUFBTSxrQkFBa0IsQ0FBQztBQUN6RixPQUFPLEVBQXVKLHNCQUFzQixFQUFrRixNQUFNLHNCQUFzQixDQUFDO0FBQ25TLE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBRXJEOzs7R0FHRztBQUNILE1BQU0sVUFBVSx3QkFBd0IsQ0FBQyxTQUE0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QUksS0FBSyxDQUFDO0FBQzFFLENBQUM7QUFFRCxNQUFNLFVBQVUsa0JBQWtCLENBQUMsS0FBcUI7SUFDdEQsT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUssS0FBMEIsQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUM5RCxDQUFDO0FBRUQsTUFBTSxVQUFVLGlCQUFpQixDQUFDLEtBQXFCO0lBQ3JELE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFLLEtBQXlCLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDNUQsQ0FBQztBQUVELE1BQU0sVUFBVSxjQUFjLENBQUMsS0FBcUI7SUFDbEQsT0FBTyxPQUFPLEtBQUssS0FBSyxVQUFVLENBQUM7QUFDckMsQ0FBQztBQUVELE1BQU0sVUFBVSxlQUFlLENBQUMsS0FBcUI7SUFDbkQsT0FBTyxDQUFDLENBQUUsS0FBNkMsQ0FBQyxRQUFRLENBQUM7QUFDbkUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1J1bnRpbWVFcnJvciwgUnVudGltZUVycm9yQ29kZX0gZnJvbSAnLi4vZXJyb3JzJztcbmltcG9ydCB7VHlwZX0gZnJvbSAnLi4vaW50ZXJmYWNlL3R5cGUnO1xuaW1wb3J0IHtnZXRDb21wb25lbnREZWZ9IGZyb20gJy4uL3JlbmRlcjMvZGVmaW5pdGlvbic7XG5pbXBvcnQge2dldEZhY3RvcnlEZWZ9IGZyb20gJy4uL3JlbmRlcjMvZGVmaW5pdGlvbl9mYWN0b3J5JztcbmltcG9ydCB7dGhyb3dDeWNsaWNEZXBlbmRlbmN5RXJyb3IsIHRocm93SW52YWxpZFByb3ZpZGVyRXJyb3J9IGZyb20gJy4uL3JlbmRlcjMvZXJyb3JzX2RpJztcbmltcG9ydCB7c3RyaW5naWZ5Rm9yRXJyb3J9IGZyb20gJy4uL3JlbmRlcjMvdXRpbC9zdHJpbmdpZnlfdXRpbHMnO1xuaW1wb3J0IHtkZWVwRm9yRWFjaH0gZnJvbSAnLi4vdXRpbC9hcnJheV91dGlscyc7XG5pbXBvcnQge0VNUFRZX0FSUkFZfSBmcm9tICcuLi91dGlsL2VtcHR5JztcbmltcG9ydCB7Z2V0Q2xvc3VyZVNhZmVQcm9wZXJ0eX0gZnJvbSAnLi4vdXRpbC9wcm9wZXJ0eSc7XG5pbXBvcnQge3N0cmluZ2lmeX0gZnJvbSAnLi4vdXRpbC9zdHJpbmdpZnknO1xuXG5pbXBvcnQge3Jlc29sdmVGb3J3YXJkUmVmfSBmcm9tICcuL2ZvcndhcmRfcmVmJztcbmltcG9ydCB7RU5WSVJPTk1FTlRfSU5JVElBTElaRVJ9IGZyb20gJy4vaW5pdGlhbGl6ZXJfdG9rZW4nO1xuaW1wb3J0IHvJtcm1aW5qZWN0IGFzIGluamVjdH0gZnJvbSAnLi9pbmplY3Rvcl9jb21wYXRpYmlsaXR5JztcbmltcG9ydCB7Z2V0SW5qZWN0b3JEZWYsIEluamVjdG9yVHlwZSwgSW5qZWN0b3JUeXBlV2l0aFByb3ZpZGVyc30gZnJvbSAnLi9pbnRlcmZhY2UvZGVmcyc7XG5pbXBvcnQge0NsYXNzUHJvdmlkZXIsIENvbnN0cnVjdG9yUHJvdmlkZXIsIEVudmlyb25tZW50UHJvdmlkZXJzLCBFeGlzdGluZ1Byb3ZpZGVyLCBGYWN0b3J5UHJvdmlkZXIsIEltcG9ydGVkTmdNb2R1bGVQcm92aWRlcnMsIEludGVybmFsRW52aXJvbm1lbnRQcm92aWRlcnMsIGlzRW52aXJvbm1lbnRQcm92aWRlcnMsIE1vZHVsZVdpdGhQcm92aWRlcnMsIFByb3ZpZGVyLCBTdGF0aWNDbGFzc1Byb3ZpZGVyLCBUeXBlUHJvdmlkZXIsIFZhbHVlUHJvdmlkZXJ9IGZyb20gJy4vaW50ZXJmYWNlL3Byb3ZpZGVyJztcbmltcG9ydCB7SU5KRUNUT1JfREVGX1RZUEVTfSBmcm9tICcuL2ludGVybmFsX3Rva2Vucyc7XG5cbi8qKlxuICogV3JhcCBhbiBhcnJheSBvZiBgUHJvdmlkZXJgcyBpbnRvIGBFbnZpcm9ubWVudFByb3ZpZGVyc2AsIHByZXZlbnRpbmcgdGhlbSBmcm9tIGJlaW5nIGFjY2lkZW50YWxseVxuICogcmVmZXJlbmNlZCBpbiBgQENvbXBvbmVudCBpbiBhIGNvbXBvbmVudCBpbmplY3Rvci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1ha2VFbnZpcm9ubWVudFByb3ZpZGVycyhwcm92aWRlcnM6IChQcm92aWRlcnxFbnZpcm9ubWVudFByb3ZpZGVycylbXSk6XG4gICAgRW52aXJvbm1lbnRQcm92aWRlcnMge1xuICByZXR1cm4ge1xuICAgIMm1cHJvdmlkZXJzOiBwcm92aWRlcnMsXG4gIH0gYXMgdW5rbm93biBhcyBFbnZpcm9ubWVudFByb3ZpZGVycztcbn1cblxuLyoqXG4gKiBBIHNvdXJjZSBvZiBwcm92aWRlcnMgZm9yIHRoZSBgaW1wb3J0UHJvdmlkZXJzRnJvbWAgZnVuY3Rpb24uXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgdHlwZSBJbXBvcnRQcm92aWRlcnNTb3VyY2UgPVxuICAgIFR5cGU8dW5rbm93bj58TW9kdWxlV2l0aFByb3ZpZGVyczx1bmtub3duPnxBcnJheTxJbXBvcnRQcm92aWRlcnNTb3VyY2U+O1xuXG4vKipcbiAqIENvbGxlY3RzIHByb3ZpZGVycyBmcm9tIGFsbCBOZ01vZHVsZXMgYW5kIHN0YW5kYWxvbmUgY29tcG9uZW50cywgaW5jbHVkaW5nIHRyYW5zaXRpdmVseSBpbXBvcnRlZFxuICogb25lcy5cbiAqXG4gKiBQcm92aWRlcnMgZXh0cmFjdGVkIHZpYSBgaW1wb3J0UHJvdmlkZXJzRnJvbWAgYXJlIG9ubHkgdXNhYmxlIGluIGFuIGFwcGxpY2F0aW9uIGluamVjdG9yIG9yXG4gKiBhbm90aGVyIGVudmlyb25tZW50IGluamVjdG9yIChzdWNoIGFzIGEgcm91dGUgaW5qZWN0b3IpLiBUaGV5IHNob3VsZCBub3QgYmUgdXNlZCBpbiBjb21wb25lbnRcbiAqIHByb3ZpZGVycy5cbiAqXG4gKiBNb3JlIGluZm9ybWF0aW9uIGFib3V0IHN0YW5kYWxvbmUgY29tcG9uZW50cyBjYW4gYmUgZm91bmQgaW4gW3RoaXNcbiAqIGd1aWRlXShndWlkZS9zdGFuZGFsb25lLWNvbXBvbmVudHMpLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiBUaGUgcmVzdWx0cyBvZiB0aGUgYGltcG9ydFByb3ZpZGVyc0Zyb21gIGNhbGwgY2FuIGJlIHVzZWQgaW4gdGhlIGBib290c3RyYXBBcHBsaWNhdGlvbmAgY2FsbDpcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBhd2FpdCBib290c3RyYXBBcHBsaWNhdGlvbihSb290Q29tcG9uZW50LCB7XG4gKiAgIHByb3ZpZGVyczogW1xuICogICAgIGltcG9ydFByb3ZpZGVyc0Zyb20oTmdNb2R1bGVPbmUsIE5nTW9kdWxlVHdvKVxuICogICBdXG4gKiB9KTtcbiAqIGBgYFxuICpcbiAqIFlvdSBjYW4gYWxzbyB1c2UgdGhlIGBpbXBvcnRQcm92aWRlcnNGcm9tYCByZXN1bHRzIGluIHRoZSBgcHJvdmlkZXJzYCBmaWVsZCBvZiBhIHJvdXRlLCB3aGVuIGFcbiAqIHN0YW5kYWxvbmUgY29tcG9uZW50IGlzIHVzZWQ6XG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogZXhwb3J0IGNvbnN0IFJPVVRFUzogUm91dGVbXSA9IFtcbiAqICAge1xuICogICAgIHBhdGg6ICdmb28nLFxuICogICAgIHByb3ZpZGVyczogW1xuICogICAgICAgaW1wb3J0UHJvdmlkZXJzRnJvbShOZ01vZHVsZU9uZSwgTmdNb2R1bGVUd28pXG4gKiAgICAgXSxcbiAqICAgICBjb21wb25lbnQ6IFlvdXJTdGFuZGFsb25lQ29tcG9uZW50XG4gKiAgIH1cbiAqIF07XG4gKiBgYGBcbiAqXG4gKiBAcmV0dXJucyBDb2xsZWN0ZWQgcHJvdmlkZXJzIGZyb20gdGhlIHNwZWNpZmllZCBsaXN0IG9mIHR5cGVzLlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gaW1wb3J0UHJvdmlkZXJzRnJvbSguLi5zb3VyY2VzOiBJbXBvcnRQcm92aWRlcnNTb3VyY2VbXSk6IEVudmlyb25tZW50UHJvdmlkZXJzIHtcbiAgcmV0dXJuIHtcbiAgICDJtXByb3ZpZGVyczogaW50ZXJuYWxJbXBvcnRQcm92aWRlcnNGcm9tKHRydWUsIHNvdXJjZXMpLFxuICAgIMm1ZnJvbU5nTW9kdWxlOiB0cnVlLFxuICB9IGFzIEludGVybmFsRW52aXJvbm1lbnRQcm92aWRlcnM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbnRlcm5hbEltcG9ydFByb3ZpZGVyc0Zyb20oXG4gICAgY2hlY2tGb3JTdGFuZGFsb25lQ21wOiBib29sZWFuLCAuLi5zb3VyY2VzOiBJbXBvcnRQcm92aWRlcnNTb3VyY2VbXSk6IFByb3ZpZGVyW10ge1xuICBjb25zdCBwcm92aWRlcnNPdXQ6IFNpbmdsZVByb3ZpZGVyW10gPSBbXTtcbiAgY29uc3QgZGVkdXAgPSBuZXcgU2V0PFR5cGU8dW5rbm93bj4+KCk7ICAvLyBhbHJlYWR5IHNlZW4gdHlwZXNcbiAgbGV0IGluamVjdG9yVHlwZXNXaXRoUHJvdmlkZXJzOiBJbmplY3RvclR5cGVXaXRoUHJvdmlkZXJzPHVua25vd24+W118dW5kZWZpbmVkO1xuICBkZWVwRm9yRWFjaChzb3VyY2VzLCBzb3VyY2UgPT4ge1xuICAgIGlmICgodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSAmJiBjaGVja0ZvclN0YW5kYWxvbmVDbXApIHtcbiAgICAgIGNvbnN0IGNtcERlZiA9IGdldENvbXBvbmVudERlZihzb3VyY2UpO1xuICAgICAgaWYgKGNtcERlZj8uc3RhbmRhbG9uZSkge1xuICAgICAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTVBPUlRfUFJPVklERVJTX0ZST01fU1RBTkRBTE9ORSxcbiAgICAgICAgICAgIGBJbXBvcnRpbmcgcHJvdmlkZXJzIHN1cHBvcnRzIE5nTW9kdWxlIG9yIE1vZHVsZVdpdGhQcm92aWRlcnMgYnV0IGdvdCBhIHN0YW5kYWxvbmUgY29tcG9uZW50IFwiJHtcbiAgICAgICAgICAgICAgICBzdHJpbmdpZnlGb3JFcnJvcihzb3VyY2UpfVwiYCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gTmFycm93IGBzb3VyY2VgIHRvIGFjY2VzcyB0aGUgaW50ZXJuYWwgdHlwZSBhbmFsb2d1ZSBmb3IgYE1vZHVsZVdpdGhQcm92aWRlcnNgLlxuICAgIGNvbnN0IGludGVybmFsU291cmNlID0gc291cmNlIGFzIFR5cGU8dW5rbm93bj58IEluamVjdG9yVHlwZVdpdGhQcm92aWRlcnM8dW5rbm93bj47XG4gICAgaWYgKHdhbGtQcm92aWRlclRyZWUoaW50ZXJuYWxTb3VyY2UsIHByb3ZpZGVyc091dCwgW10sIGRlZHVwKSkge1xuICAgICAgaW5qZWN0b3JUeXBlc1dpdGhQcm92aWRlcnMgfHw9IFtdO1xuICAgICAgaW5qZWN0b3JUeXBlc1dpdGhQcm92aWRlcnMucHVzaChpbnRlcm5hbFNvdXJjZSk7XG4gICAgfVxuICB9KTtcbiAgLy8gQ29sbGVjdCBhbGwgcHJvdmlkZXJzIGZyb20gYE1vZHVsZVdpdGhQcm92aWRlcnNgIHR5cGVzLlxuICBpZiAoaW5qZWN0b3JUeXBlc1dpdGhQcm92aWRlcnMgIT09IHVuZGVmaW5lZCkge1xuICAgIHByb2Nlc3NJbmplY3RvclR5cGVzV2l0aFByb3ZpZGVycyhpbmplY3RvclR5cGVzV2l0aFByb3ZpZGVycywgcHJvdmlkZXJzT3V0KTtcbiAgfVxuXG4gIHJldHVybiBwcm92aWRlcnNPdXQ7XG59XG5cbi8qKlxuICogQ29sbGVjdHMgYWxsIHByb3ZpZGVycyBmcm9tIHRoZSBsaXN0IG9mIGBNb2R1bGVXaXRoUHJvdmlkZXJzYCBhbmQgYXBwZW5kcyB0aGVtIHRvIHRoZSBwcm92aWRlZFxuICogYXJyYXkuXG4gKi9cbmZ1bmN0aW9uIHByb2Nlc3NJbmplY3RvclR5cGVzV2l0aFByb3ZpZGVycyhcbiAgICB0eXBlc1dpdGhQcm92aWRlcnM6IEluamVjdG9yVHlwZVdpdGhQcm92aWRlcnM8dW5rbm93bj5bXSwgcHJvdmlkZXJzT3V0OiBQcm92aWRlcltdKTogdm9pZCB7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgdHlwZXNXaXRoUHJvdmlkZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3Qge25nTW9kdWxlLCBwcm92aWRlcnN9ID0gdHlwZXNXaXRoUHJvdmlkZXJzW2ldO1xuICAgIGRlZXBGb3JFYWNoUHJvdmlkZXIocHJvdmlkZXJzISBhcyBBcnJheTxQcm92aWRlcnxJbnRlcm5hbEVudmlyb25tZW50UHJvdmlkZXJzPiwgcHJvdmlkZXIgPT4ge1xuICAgICAgbmdEZXZNb2RlICYmIHZhbGlkYXRlUHJvdmlkZXIocHJvdmlkZXIsIHByb3ZpZGVycyB8fCBFTVBUWV9BUlJBWSwgbmdNb2R1bGUpO1xuICAgICAgcHJvdmlkZXJzT3V0LnB1c2gocHJvdmlkZXIpO1xuICAgIH0pO1xuICB9XG59XG5cbi8qKlxuICogSW50ZXJuYWwgdHlwZSBmb3IgYSBzaW5nbGUgcHJvdmlkZXIgaW4gYSBkZWVwIHByb3ZpZGVyIGFycmF5LlxuICovXG5leHBvcnQgdHlwZSBTaW5nbGVQcm92aWRlciA9IFR5cGVQcm92aWRlcnxWYWx1ZVByb3ZpZGVyfENsYXNzUHJvdmlkZXJ8Q29uc3RydWN0b3JQcm92aWRlcnxcbiAgICBFeGlzdGluZ1Byb3ZpZGVyfEZhY3RvcnlQcm92aWRlcnxTdGF0aWNDbGFzc1Byb3ZpZGVyO1xuXG4vKipcbiAqIFRoZSBsb2dpYyB2aXNpdHMgYW4gYEluamVjdG9yVHlwZWAsIGFuIGBJbmplY3RvclR5cGVXaXRoUHJvdmlkZXJzYCwgb3IgYSBzdGFuZGFsb25lXG4gKiBgQ29tcG9uZW50VHlwZWAsIGFuZCBhbGwgb2YgaXRzIHRyYW5zaXRpdmUgcHJvdmlkZXJzIGFuZCBjb2xsZWN0cyBwcm92aWRlcnMuXG4gKlxuICogSWYgYW4gYEluamVjdG9yVHlwZVdpdGhQcm92aWRlcnNgIHRoYXQgZGVjbGFyZXMgcHJvdmlkZXJzIGJlc2lkZXMgdGhlIHR5cGUgaXMgc3BlY2lmaWVkLFxuICogdGhlIGZ1bmN0aW9uIHdpbGwgcmV0dXJuIFwidHJ1ZVwiIHRvIGluZGljYXRlIHRoYXQgdGhlIHByb3ZpZGVycyBvZiB0aGUgdHlwZSBkZWZpbml0aW9uIG5lZWRcbiAqIHRvIGJlIHByb2Nlc3NlZC4gVGhpcyBhbGxvd3MgdXMgdG8gcHJvY2VzcyBwcm92aWRlcnMgb2YgaW5qZWN0b3IgdHlwZXMgYWZ0ZXIgYWxsIGltcG9ydHMgb2ZcbiAqIGFuIGluamVjdG9yIGRlZmluaXRpb24gYXJlIHByb2Nlc3NlZC4gKGZvbGxvd2luZyBWaWV3IEVuZ2luZSBzZW1hbnRpY3M6IHNlZSBGVy0xMzQ5KVxuICovXG5leHBvcnQgZnVuY3Rpb24gd2Fsa1Byb3ZpZGVyVHJlZShcbiAgICBjb250YWluZXI6IFR5cGU8dW5rbm93bj58SW5qZWN0b3JUeXBlV2l0aFByb3ZpZGVyczx1bmtub3duPiwgcHJvdmlkZXJzT3V0OiBTaW5nbGVQcm92aWRlcltdLFxuICAgIHBhcmVudHM6IFR5cGU8dW5rbm93bj5bXSxcbiAgICBkZWR1cDogU2V0PFR5cGU8dW5rbm93bj4+KTogY29udGFpbmVyIGlzIEluamVjdG9yVHlwZVdpdGhQcm92aWRlcnM8dW5rbm93bj4ge1xuICBjb250YWluZXIgPSByZXNvbHZlRm9yd2FyZFJlZihjb250YWluZXIpO1xuICBpZiAoIWNvbnRhaW5lcikgcmV0dXJuIGZhbHNlO1xuXG4gIC8vIFRoZSBhY3R1YWwgdHlwZSB3aGljaCBoYWQgdGhlIGRlZmluaXRpb24uIFVzdWFsbHkgYGNvbnRhaW5lcmAsIGJ1dCBtYXkgYmUgYW4gdW53cmFwcGVkIHR5cGVcbiAgLy8gZnJvbSBgSW5qZWN0b3JUeXBlV2l0aFByb3ZpZGVyc2AuXG4gIGxldCBkZWZUeXBlOiBUeXBlPHVua25vd24+fG51bGwgPSBudWxsO1xuXG4gIGxldCBpbmpEZWYgPSBnZXRJbmplY3RvckRlZihjb250YWluZXIpO1xuICBjb25zdCBjbXBEZWYgPSAhaW5qRGVmICYmIGdldENvbXBvbmVudERlZihjb250YWluZXIpO1xuICBpZiAoIWluakRlZiAmJiAhY21wRGVmKSB7XG4gICAgLy8gYGNvbnRhaW5lcmAgaXMgbm90IGFuIGluamVjdG9yIHR5cGUgb3IgYSBjb21wb25lbnQgdHlwZS4gSXQgbWlnaHQgYmU6XG4gICAgLy8gICogQW4gYEluamVjdG9yVHlwZVdpdGhQcm92aWRlcnNgIHRoYXQgd3JhcHMgYW4gaW5qZWN0b3IgdHlwZS5cbiAgICAvLyAgKiBBIHN0YW5kYWxvbmUgZGlyZWN0aXZlIG9yIHBpcGUgdGhhdCBnb3QgcHVsbGVkIGluIGZyb20gYSBzdGFuZGFsb25lIGNvbXBvbmVudCdzXG4gICAgLy8gICAgZGVwZW5kZW5jaWVzLlxuICAgIC8vIFRyeSB0byB1bndyYXAgaXQgYXMgYW4gYEluamVjdG9yVHlwZVdpdGhQcm92aWRlcnNgIGZpcnN0LlxuICAgIGNvbnN0IG5nTW9kdWxlOiBUeXBlPHVua25vd24+fHVuZGVmaW5lZCA9XG4gICAgICAgIChjb250YWluZXIgYXMgSW5qZWN0b3JUeXBlV2l0aFByb3ZpZGVyczxhbnk+KS5uZ01vZHVsZSBhcyBUeXBlPHVua25vd24+fCB1bmRlZmluZWQ7XG4gICAgaW5qRGVmID0gZ2V0SW5qZWN0b3JEZWYobmdNb2R1bGUpO1xuICAgIGlmIChpbmpEZWYpIHtcbiAgICAgIGRlZlR5cGUgPSBuZ01vZHVsZSE7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIE5vdCBhIGNvbXBvbmVudCBvciBpbmplY3RvciB0eXBlLCBzbyBpZ25vcmUgaXQuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9IGVsc2UgaWYgKGNtcERlZiAmJiAhY21wRGVmLnN0YW5kYWxvbmUpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0gZWxzZSB7XG4gICAgZGVmVHlwZSA9IGNvbnRhaW5lciBhcyBUeXBlPHVua25vd24+O1xuICB9XG5cbiAgLy8gQ2hlY2sgZm9yIGNpcmN1bGFyIGRlcGVuZGVuY2llcy5cbiAgaWYgKG5nRGV2TW9kZSAmJiBwYXJlbnRzLmluZGV4T2YoZGVmVHlwZSkgIT09IC0xKSB7XG4gICAgY29uc3QgZGVmTmFtZSA9IHN0cmluZ2lmeShkZWZUeXBlKTtcbiAgICBjb25zdCBwYXRoID0gcGFyZW50cy5tYXAoc3RyaW5naWZ5KTtcbiAgICB0aHJvd0N5Y2xpY0RlcGVuZGVuY3lFcnJvcihkZWZOYW1lLCBwYXRoKTtcbiAgfVxuXG4gIC8vIENoZWNrIGZvciBtdWx0aXBsZSBpbXBvcnRzIG9mIHRoZSBzYW1lIG1vZHVsZVxuICBjb25zdCBpc0R1cGxpY2F0ZSA9IGRlZHVwLmhhcyhkZWZUeXBlKTtcblxuICBpZiAoY21wRGVmKSB7XG4gICAgaWYgKGlzRHVwbGljYXRlKSB7XG4gICAgICAvLyBUaGlzIGNvbXBvbmVudCBkZWZpbml0aW9uIGhhcyBhbHJlYWR5IGJlZW4gcHJvY2Vzc2VkLlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBkZWR1cC5hZGQoZGVmVHlwZSk7XG5cbiAgICBpZiAoY21wRGVmLmRlcGVuZGVuY2llcykge1xuICAgICAgY29uc3QgZGVwcyA9XG4gICAgICAgICAgdHlwZW9mIGNtcERlZi5kZXBlbmRlbmNpZXMgPT09ICdmdW5jdGlvbicgPyBjbXBEZWYuZGVwZW5kZW5jaWVzKCkgOiBjbXBEZWYuZGVwZW5kZW5jaWVzO1xuICAgICAgZm9yIChjb25zdCBkZXAgb2YgZGVwcykge1xuICAgICAgICB3YWxrUHJvdmlkZXJUcmVlKGRlcCwgcHJvdmlkZXJzT3V0LCBwYXJlbnRzLCBkZWR1cCk7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2UgaWYgKGluakRlZikge1xuICAgIC8vIEZpcnN0LCBpbmNsdWRlIHByb3ZpZGVycyBmcm9tIGFueSBpbXBvcnRzLlxuICAgIGlmIChpbmpEZWYuaW1wb3J0cyAhPSBudWxsICYmICFpc0R1cGxpY2F0ZSkge1xuICAgICAgLy8gQmVmb3JlIHByb2Nlc3NpbmcgZGVmVHlwZSdzIGltcG9ydHMsIGFkZCBpdCB0byB0aGUgc2V0IG9mIHBhcmVudHMuIFRoaXMgd2F5LCBpZiBpdCBlbmRzXG4gICAgICAvLyB1cCBkZWVwbHkgaW1wb3J0aW5nIGl0c2VsZiwgdGhpcyBjYW4gYmUgZGV0ZWN0ZWQuXG4gICAgICBuZ0Rldk1vZGUgJiYgcGFyZW50cy5wdXNoKGRlZlR5cGUpO1xuICAgICAgLy8gQWRkIGl0IHRvIHRoZSBzZXQgb2YgZGVkdXBzLiBUaGlzIHdheSB3ZSBjYW4gZGV0ZWN0IG11bHRpcGxlIGltcG9ydHMgb2YgdGhlIHNhbWUgbW9kdWxlXG4gICAgICBkZWR1cC5hZGQoZGVmVHlwZSk7XG5cbiAgICAgIGxldCBpbXBvcnRUeXBlc1dpdGhQcm92aWRlcnM6IChJbmplY3RvclR5cGVXaXRoUHJvdmlkZXJzPGFueT5bXSl8dW5kZWZpbmVkO1xuICAgICAgdHJ5IHtcbiAgICAgICAgZGVlcEZvckVhY2goaW5qRGVmLmltcG9ydHMsIGltcG9ydGVkID0+IHtcbiAgICAgICAgICBpZiAod2Fsa1Byb3ZpZGVyVHJlZShpbXBvcnRlZCwgcHJvdmlkZXJzT3V0LCBwYXJlbnRzLCBkZWR1cCkpIHtcbiAgICAgICAgICAgIGltcG9ydFR5cGVzV2l0aFByb3ZpZGVycyB8fD0gW107XG4gICAgICAgICAgICAvLyBJZiB0aGUgcHJvY2Vzc2VkIGltcG9ydCBpcyBhbiBpbmplY3RvciB0eXBlIHdpdGggcHJvdmlkZXJzLCB3ZSBzdG9yZSBpdCBpbiB0aGVcbiAgICAgICAgICAgIC8vIGxpc3Qgb2YgaW1wb3J0IHR5cGVzIHdpdGggcHJvdmlkZXJzLCBzbyB0aGF0IHdlIGNhbiBwcm9jZXNzIHRob3NlIGFmdGVyd2FyZHMuXG4gICAgICAgICAgICBpbXBvcnRUeXBlc1dpdGhQcm92aWRlcnMucHVzaChpbXBvcnRlZCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIC8vIFJlbW92ZSBpdCBmcm9tIHRoZSBwYXJlbnRzIHNldCB3aGVuIGZpbmlzaGVkLlxuICAgICAgICBuZ0Rldk1vZGUgJiYgcGFyZW50cy5wb3AoKTtcbiAgICAgIH1cblxuICAgICAgLy8gSW1wb3J0cyB3aGljaCBhcmUgZGVjbGFyZWQgd2l0aCBwcm92aWRlcnMgKFR5cGVXaXRoUHJvdmlkZXJzKSBuZWVkIHRvIGJlIHByb2Nlc3NlZFxuICAgICAgLy8gYWZ0ZXIgYWxsIGltcG9ydGVkIG1vZHVsZXMgYXJlIHByb2Nlc3NlZC4gVGhpcyBpcyBzaW1pbGFyIHRvIGhvdyBWaWV3IEVuZ2luZVxuICAgICAgLy8gcHJvY2Vzc2VzL21lcmdlcyBtb2R1bGUgaW1wb3J0cyBpbiB0aGUgbWV0YWRhdGEgcmVzb2x2ZXIuIFNlZTogRlctMTM0OS5cbiAgICAgIGlmIChpbXBvcnRUeXBlc1dpdGhQcm92aWRlcnMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBwcm9jZXNzSW5qZWN0b3JUeXBlc1dpdGhQcm92aWRlcnMoaW1wb3J0VHlwZXNXaXRoUHJvdmlkZXJzLCBwcm92aWRlcnNPdXQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghaXNEdXBsaWNhdGUpIHtcbiAgICAgIC8vIFRyYWNrIHRoZSBJbmplY3RvclR5cGUgYW5kIGFkZCBhIHByb3ZpZGVyIGZvciBpdC5cbiAgICAgIC8vIEl0J3MgaW1wb3J0YW50IHRoYXQgdGhpcyBpcyBkb25lIGFmdGVyIHRoZSBkZWYncyBpbXBvcnRzLlxuICAgICAgY29uc3QgZmFjdG9yeSA9IGdldEZhY3RvcnlEZWYoZGVmVHlwZSkgfHwgKCgpID0+IG5ldyBkZWZUeXBlISgpKTtcblxuICAgICAgLy8gQXBwZW5kIGV4dHJhIHByb3ZpZGVycyB0byBtYWtlIG1vcmUgaW5mbyBhdmFpbGFibGUgZm9yIGNvbnN1bWVycyAodG8gcmV0cmlldmUgYW4gaW5qZWN0b3JcbiAgICAgIC8vIHR5cGUpLCBhcyB3ZWxsIGFzIGludGVybmFsbHkgKHRvIGNhbGN1bGF0ZSBhbiBpbmplY3Rpb24gc2NvcGUgY29ycmVjdGx5IGFuZCBlYWdlcmx5XG4gICAgICAvLyBpbnN0YW50aWF0ZSBhIGBkZWZUeXBlYCB3aGVuIGFuIGluamVjdG9yIGlzIGNyZWF0ZWQpLlxuICAgICAgcHJvdmlkZXJzT3V0LnB1c2goXG4gICAgICAgICAgLy8gUHJvdmlkZXIgdG8gY3JlYXRlIGBkZWZUeXBlYCB1c2luZyBpdHMgZmFjdG9yeS5cbiAgICAgICAgICB7cHJvdmlkZTogZGVmVHlwZSwgdXNlRmFjdG9yeTogZmFjdG9yeSwgZGVwczogRU1QVFlfQVJSQVl9LFxuXG4gICAgICAgICAgLy8gTWFrZSB0aGlzIGBkZWZUeXBlYCBhdmFpbGFibGUgdG8gYW4gaW50ZXJuYWwgbG9naWMgdGhhdCBjYWxjdWxhdGVzIGluamVjdG9yIHNjb3BlLlxuICAgICAgICAgIHtwcm92aWRlOiBJTkpFQ1RPUl9ERUZfVFlQRVMsIHVzZVZhbHVlOiBkZWZUeXBlLCBtdWx0aTogdHJ1ZX0sXG5cbiAgICAgICAgICAvLyBQcm92aWRlciB0byBlYWdlcmx5IGluc3RhbnRpYXRlIGBkZWZUeXBlYCB2aWEgYEVOVklST05NRU5UX0lOSVRJQUxJWkVSYC5cbiAgICAgICAgICB7cHJvdmlkZTogRU5WSVJPTk1FTlRfSU5JVElBTElaRVIsIHVzZVZhbHVlOiAoKSA9PiBpbmplY3QoZGVmVHlwZSEpLCBtdWx0aTogdHJ1ZX0gIC8vXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIE5leHQsIGluY2x1ZGUgcHJvdmlkZXJzIGxpc3RlZCBvbiB0aGUgZGVmaW5pdGlvbiBpdHNlbGYuXG4gICAgY29uc3QgZGVmUHJvdmlkZXJzID0gaW5qRGVmLnByb3ZpZGVycyBhcyBBcnJheTxTaW5nbGVQcm92aWRlcnxJbnRlcm5hbEVudmlyb25tZW50UHJvdmlkZXJzPjtcbiAgICBpZiAoZGVmUHJvdmlkZXJzICE9IG51bGwgJiYgIWlzRHVwbGljYXRlKSB7XG4gICAgICBjb25zdCBpbmplY3RvclR5cGUgPSBjb250YWluZXIgYXMgSW5qZWN0b3JUeXBlPGFueT47XG4gICAgICBkZWVwRm9yRWFjaFByb3ZpZGVyKGRlZlByb3ZpZGVycywgcHJvdmlkZXIgPT4ge1xuICAgICAgICBuZ0Rldk1vZGUgJiYgdmFsaWRhdGVQcm92aWRlcihwcm92aWRlciBhcyBTaW5nbGVQcm92aWRlciwgZGVmUHJvdmlkZXJzLCBpbmplY3RvclR5cGUpO1xuICAgICAgICBwcm92aWRlcnNPdXQucHVzaChwcm92aWRlciBhcyBTaW5nbGVQcm92aWRlcik7XG4gICAgICB9KTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gU2hvdWxkIG5vdCBoYXBwZW4sIGJ1dCBqdXN0IGluIGNhc2UuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIChcbiAgICAgIGRlZlR5cGUgIT09IGNvbnRhaW5lciAmJlxuICAgICAgKGNvbnRhaW5lciBhcyBJbmplY3RvclR5cGVXaXRoUHJvdmlkZXJzPGFueT4pLnByb3ZpZGVycyAhPT0gdW5kZWZpbmVkKTtcbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVQcm92aWRlcihcbiAgICBwcm92aWRlcjogU2luZ2xlUHJvdmlkZXIsIHByb3ZpZGVyczogQXJyYXk8U2luZ2xlUHJvdmlkZXJ8SW50ZXJuYWxFbnZpcm9ubWVudFByb3ZpZGVycz4sXG4gICAgY29udGFpbmVyVHlwZTogVHlwZTx1bmtub3duPik6IHZvaWQge1xuICBpZiAoaXNUeXBlUHJvdmlkZXIocHJvdmlkZXIpIHx8IGlzVmFsdWVQcm92aWRlcihwcm92aWRlcikgfHwgaXNGYWN0b3J5UHJvdmlkZXIocHJvdmlkZXIpIHx8XG4gICAgICBpc0V4aXN0aW5nUHJvdmlkZXIocHJvdmlkZXIpKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gSGVyZSB3ZSBleHBlY3QgdGhlIHByb3ZpZGVyIHRvIGJlIGEgYHVzZUNsYXNzYCBwcm92aWRlciAoYnkgZWxpbWluYXRpb24pLlxuICBjb25zdCBjbGFzc1JlZiA9IHJlc29sdmVGb3J3YXJkUmVmKFxuICAgICAgcHJvdmlkZXIgJiYgKChwcm92aWRlciBhcyBTdGF0aWNDbGFzc1Byb3ZpZGVyIHwgQ2xhc3NQcm92aWRlcikudXNlQ2xhc3MgfHwgcHJvdmlkZXIucHJvdmlkZSkpO1xuICBpZiAoIWNsYXNzUmVmKSB7XG4gICAgdGhyb3dJbnZhbGlkUHJvdmlkZXJFcnJvcihjb250YWluZXJUeXBlLCBwcm92aWRlcnMsIHByb3ZpZGVyKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBkZWVwRm9yRWFjaFByb3ZpZGVyKFxuICAgIHByb3ZpZGVyczogQXJyYXk8UHJvdmlkZXJ8SW50ZXJuYWxFbnZpcm9ubWVudFByb3ZpZGVycz4sXG4gICAgZm46IChwcm92aWRlcjogU2luZ2xlUHJvdmlkZXIpID0+IHZvaWQpOiB2b2lkIHtcbiAgZm9yIChsZXQgcHJvdmlkZXIgb2YgcHJvdmlkZXJzKSB7XG4gICAgaWYgKGlzRW52aXJvbm1lbnRQcm92aWRlcnMocHJvdmlkZXIpKSB7XG4gICAgICBwcm92aWRlciA9IHByb3ZpZGVyLsm1cHJvdmlkZXJzO1xuICAgIH1cbiAgICBpZiAoQXJyYXkuaXNBcnJheShwcm92aWRlcikpIHtcbiAgICAgIGRlZXBGb3JFYWNoUHJvdmlkZXIocHJvdmlkZXIsIGZuKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZm4ocHJvdmlkZXIpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgY29uc3QgVVNFX1ZBTFVFID1cbiAgICBnZXRDbG9zdXJlU2FmZVByb3BlcnR5PFZhbHVlUHJvdmlkZXI+KHtwcm92aWRlOiBTdHJpbmcsIHVzZVZhbHVlOiBnZXRDbG9zdXJlU2FmZVByb3BlcnR5fSk7XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1ZhbHVlUHJvdmlkZXIodmFsdWU6IFNpbmdsZVByb3ZpZGVyKTogdmFsdWUgaXMgVmFsdWVQcm92aWRlciB7XG4gIHJldHVybiB2YWx1ZSAhPT0gbnVsbCAmJiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcgJiYgVVNFX1ZBTFVFIGluIHZhbHVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNFeGlzdGluZ1Byb3ZpZGVyKHZhbHVlOiBTaW5nbGVQcm92aWRlcik6IHZhbHVlIGlzIEV4aXN0aW5nUHJvdmlkZXIge1xuICByZXR1cm4gISEodmFsdWUgJiYgKHZhbHVlIGFzIEV4aXN0aW5nUHJvdmlkZXIpLnVzZUV4aXN0aW5nKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRmFjdG9yeVByb3ZpZGVyKHZhbHVlOiBTaW5nbGVQcm92aWRlcik6IHZhbHVlIGlzIEZhY3RvcnlQcm92aWRlciB7XG4gIHJldHVybiAhISh2YWx1ZSAmJiAodmFsdWUgYXMgRmFjdG9yeVByb3ZpZGVyKS51c2VGYWN0b3J5KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzVHlwZVByb3ZpZGVyKHZhbHVlOiBTaW5nbGVQcm92aWRlcik6IHZhbHVlIGlzIFR5cGVQcm92aWRlciB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbic7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0NsYXNzUHJvdmlkZXIodmFsdWU6IFNpbmdsZVByb3ZpZGVyKTogdmFsdWUgaXMgQ2xhc3NQcm92aWRlciB7XG4gIHJldHVybiAhISh2YWx1ZSBhcyBTdGF0aWNDbGFzc1Byb3ZpZGVyIHwgQ2xhc3NQcm92aWRlcikudXNlQ2xhc3M7XG59XG4iXX0=