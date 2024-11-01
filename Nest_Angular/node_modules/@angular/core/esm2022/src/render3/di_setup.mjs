/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { resolveForwardRef } from '../di/forward_ref';
import { isClassProvider, isTypeProvider } from '../di/provider_collection';
import { providerToFactory } from '../di/r3_injector';
import { assertDefined } from '../util/assert';
import { emitProviderConfiguredEvent, runInInjectorProfilerContext } from './debug/injector_profiler';
import { diPublicInInjector, getNodeInjectable, getOrCreateNodeInjectorForNode, NodeInjector, } from './di';
import { ɵɵdirectiveInject } from './instructions/all';
import { NodeInjectorFactory } from './interfaces/injector';
import { isComponentDef } from './interfaces/type_checks';
import { TVIEW } from './interfaces/view';
import { getCurrentTNode, getLView, getTView } from './state';
/**
 * Resolves the providers which are defined in the DirectiveDef.
 *
 * When inserting the tokens and the factories in their respective arrays, we can assume that
 * this method is called first for the component (if any), and then for other directives on the same
 * node.
 * As a consequence,the providers are always processed in that order:
 * 1) The view providers of the component
 * 2) The providers of the component
 * 3) The providers of the other directives
 * This matches the structure of the injectables arrays of a view (for each node).
 * So the tokens and the factories can be pushed at the end of the arrays, except
 * in one case for multi providers.
 *
 * @param def the directive definition
 * @param providers: Array of `providers`.
 * @param viewProviders: Array of `viewProviders`.
 */
export function providersResolver(def, providers, viewProviders) {
    const tView = getTView();
    if (tView.firstCreatePass) {
        const isComponent = isComponentDef(def);
        // The list of view providers is processed first, and the flags are updated
        resolveProvider(viewProviders, tView.data, tView.blueprint, isComponent, true);
        // Then, the list of providers is processed, and the flags are updated
        resolveProvider(providers, tView.data, tView.blueprint, isComponent, false);
    }
}
/**
 * Resolves a provider and publishes it to the DI system.
 */
function resolveProvider(provider, tInjectables, lInjectablesBlueprint, isComponent, isViewProvider) {
    provider = resolveForwardRef(provider);
    if (Array.isArray(provider)) {
        // Recursively call `resolveProvider`
        // Recursion is OK in this case because this code will not be in hot-path once we implement
        // cloning of the initial state.
        for (let i = 0; i < provider.length; i++) {
            resolveProvider(provider[i], tInjectables, lInjectablesBlueprint, isComponent, isViewProvider);
        }
    }
    else {
        const tView = getTView();
        const lView = getLView();
        const tNode = getCurrentTNode();
        let token = isTypeProvider(provider) ? provider : resolveForwardRef(provider.provide);
        const providerFactory = providerToFactory(provider);
        if (ngDevMode) {
            const injector = new NodeInjector(tNode, lView);
            runInInjectorProfilerContext(injector, token, () => {
                emitProviderConfiguredEvent(provider, isViewProvider);
            });
        }
        const beginIndex = tNode.providerIndexes & 1048575 /* TNodeProviderIndexes.ProvidersStartIndexMask */;
        const endIndex = tNode.directiveStart;
        const cptViewProvidersCount = tNode.providerIndexes >> 20 /* TNodeProviderIndexes.CptViewProvidersCountShift */;
        if (isTypeProvider(provider) || !provider.multi) {
            // Single provider case: the factory is created and pushed immediately
            const factory = new NodeInjectorFactory(providerFactory, isViewProvider, ɵɵdirectiveInject);
            const existingFactoryIndex = indexOf(token, tInjectables, isViewProvider ? beginIndex : beginIndex + cptViewProvidersCount, endIndex);
            if (existingFactoryIndex === -1) {
                diPublicInInjector(getOrCreateNodeInjectorForNode(tNode, lView), tView, token);
                registerDestroyHooksIfSupported(tView, provider, tInjectables.length);
                tInjectables.push(token);
                tNode.directiveStart++;
                tNode.directiveEnd++;
                if (isViewProvider) {
                    tNode.providerIndexes += 1048576 /* TNodeProviderIndexes.CptViewProvidersCountShifter */;
                }
                lInjectablesBlueprint.push(factory);
                lView.push(factory);
            }
            else {
                lInjectablesBlueprint[existingFactoryIndex] = factory;
                lView[existingFactoryIndex] = factory;
            }
        }
        else {
            // Multi provider case:
            // We create a multi factory which is going to aggregate all the values.
            // Since the output of such a factory depends on content or view injection,
            // we create two of them, which are linked together.
            //
            // The first one (for view providers) is always in the first block of the injectables array,
            // and the second one (for providers) is always in the second block.
            // This is important because view providers have higher priority. When a multi token
            // is being looked up, the view providers should be found first.
            // Note that it is not possible to have a multi factory in the third block (directive block).
            //
            // The algorithm to process multi providers is as follows:
            // 1) If the multi provider comes from the `viewProviders` of the component:
            //   a) If the special view providers factory doesn't exist, it is created and pushed.
            //   b) Else, the multi provider is added to the existing multi factory.
            // 2) If the multi provider comes from the `providers` of the component or of another
            // directive:
            //   a) If the multi factory doesn't exist, it is created and provider pushed into it.
            //      It is also linked to the multi factory for view providers, if it exists.
            //   b) Else, the multi provider is added to the existing multi factory.
            const existingProvidersFactoryIndex = indexOf(token, tInjectables, beginIndex + cptViewProvidersCount, endIndex);
            const existingViewProvidersFactoryIndex = indexOf(token, tInjectables, beginIndex, beginIndex + cptViewProvidersCount);
            const doesProvidersFactoryExist = existingProvidersFactoryIndex >= 0 && lInjectablesBlueprint[existingProvidersFactoryIndex];
            const doesViewProvidersFactoryExist = existingViewProvidersFactoryIndex >= 0 &&
                lInjectablesBlueprint[existingViewProvidersFactoryIndex];
            if ((isViewProvider && !doesViewProvidersFactoryExist) ||
                (!isViewProvider && !doesProvidersFactoryExist)) {
                // Cases 1.a and 2.a
                diPublicInInjector(getOrCreateNodeInjectorForNode(tNode, lView), tView, token);
                const factory = multiFactory(isViewProvider ? multiViewProvidersFactoryResolver : multiProvidersFactoryResolver, lInjectablesBlueprint.length, isViewProvider, isComponent, providerFactory);
                if (!isViewProvider && doesViewProvidersFactoryExist) {
                    lInjectablesBlueprint[existingViewProvidersFactoryIndex].providerFactory = factory;
                }
                registerDestroyHooksIfSupported(tView, provider, tInjectables.length, 0);
                tInjectables.push(token);
                tNode.directiveStart++;
                tNode.directiveEnd++;
                if (isViewProvider) {
                    tNode.providerIndexes += 1048576 /* TNodeProviderIndexes.CptViewProvidersCountShifter */;
                }
                lInjectablesBlueprint.push(factory);
                lView.push(factory);
            }
            else {
                // Cases 1.b and 2.b
                const indexInFactory = multiFactoryAdd(lInjectablesBlueprint[isViewProvider ? existingViewProvidersFactoryIndex : existingProvidersFactoryIndex], providerFactory, !isViewProvider && isComponent);
                registerDestroyHooksIfSupported(tView, provider, existingProvidersFactoryIndex > -1
                    ? existingProvidersFactoryIndex
                    : existingViewProvidersFactoryIndex, indexInFactory);
            }
            if (!isViewProvider && isComponent && doesViewProvidersFactoryExist) {
                lInjectablesBlueprint[existingViewProvidersFactoryIndex].componentProviders++;
            }
        }
    }
}
/**
 * Registers the `ngOnDestroy` hook of a provider, if the provider supports destroy hooks.
 * @param tView `TView` in which to register the hook.
 * @param provider Provider whose hook should be registered.
 * @param contextIndex Index under which to find the context for the hook when it's being invoked.
 * @param indexInFactory Only required for `multi` providers. Index of the provider in the multi
 * provider factory.
 */
function registerDestroyHooksIfSupported(tView, provider, contextIndex, indexInFactory) {
    const providerIsTypeProvider = isTypeProvider(provider);
    const providerIsClassProvider = isClassProvider(provider);
    if (providerIsTypeProvider || providerIsClassProvider) {
        // Resolve forward references as `useClass` can hold a forward reference.
        const classToken = providerIsClassProvider ? resolveForwardRef(provider.useClass) : provider;
        const prototype = classToken.prototype;
        const ngOnDestroy = prototype.ngOnDestroy;
        if (ngOnDestroy) {
            const hooks = tView.destroyHooks || (tView.destroyHooks = []);
            if (!providerIsTypeProvider && provider.multi) {
                ngDevMode &&
                    assertDefined(indexInFactory, 'indexInFactory when registering multi factory destroy hook');
                const existingCallbacksIndex = hooks.indexOf(contextIndex);
                if (existingCallbacksIndex === -1) {
                    hooks.push(contextIndex, [indexInFactory, ngOnDestroy]);
                }
                else {
                    hooks[existingCallbacksIndex + 1].push(indexInFactory, ngOnDestroy);
                }
            }
            else {
                hooks.push(contextIndex, ngOnDestroy);
            }
        }
    }
}
/**
 * Add a factory in a multi factory.
 * @returns Index at which the factory was inserted.
 */
function multiFactoryAdd(multiFactory, factory, isComponentProvider) {
    if (isComponentProvider) {
        multiFactory.componentProviders++;
    }
    return multiFactory.multi.push(factory) - 1;
}
/**
 * Returns the index of item in the array, but only in the begin to end range.
 */
function indexOf(item, arr, begin, end) {
    for (let i = begin; i < end; i++) {
        if (arr[i] === item)
            return i;
    }
    return -1;
}
/**
 * Use this with `multi` `providers`.
 */
function multiProvidersFactoryResolver(_, tData, lData, tNode) {
    return multiResolve(this.multi, []);
}
/**
 * Use this with `multi` `viewProviders`.
 *
 * This factory knows how to concatenate itself with the existing `multi` `providers`.
 */
function multiViewProvidersFactoryResolver(_, tData, lView, tNode) {
    const factories = this.multi;
    let result;
    if (this.providerFactory) {
        const componentCount = this.providerFactory.componentProviders;
        const multiProviders = getNodeInjectable(lView, lView[TVIEW], this.providerFactory.index, tNode);
        // Copy the section of the array which contains `multi` `providers` from the component
        result = multiProviders.slice(0, componentCount);
        // Insert the `viewProvider` instances.
        multiResolve(factories, result);
        // Copy the section of the array which contains `multi` `providers` from other directives
        for (let i = componentCount; i < multiProviders.length; i++) {
            result.push(multiProviders[i]);
        }
    }
    else {
        result = [];
        // Insert the `viewProvider` instances.
        multiResolve(factories, result);
    }
    return result;
}
/**
 * Maps an array of factories into an array of values.
 */
function multiResolve(factories, result) {
    for (let i = 0; i < factories.length; i++) {
        const factory = factories[i];
        result.push(factory());
    }
    return result;
}
/**
 * Creates a multi factory.
 */
function multiFactory(factoryFn, index, isViewProvider, isComponent, f) {
    const factory = new NodeInjectorFactory(factoryFn, isViewProvider, ɵɵdirectiveInject);
    factory.multi = [];
    factory.index = index;
    factory.componentProviders = 0;
    multiFactoryAdd(factory, f, isComponent && !isViewProvider);
    return factory;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlfc2V0dXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9yZW5kZXIzL2RpX3NldHVwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBRXBELE9BQU8sRUFBQyxlQUFlLEVBQUUsY0FBYyxFQUFpQixNQUFNLDJCQUEyQixDQUFDO0FBQzFGLE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ3BELE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUU3QyxPQUFPLEVBQUMsMkJBQTJCLEVBQUUsNEJBQTRCLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQztBQUNwRyxPQUFPLEVBQ0wsa0JBQWtCLEVBQ2xCLGlCQUFpQixFQUNqQiw4QkFBOEIsRUFDOUIsWUFBWSxHQUNiLE1BQU0sTUFBTSxDQUFDO0FBQ2QsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFFckQsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFRMUQsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLDBCQUEwQixDQUFDO0FBQ3hELE9BQU8sRUFBZ0MsS0FBSyxFQUFRLE1BQU0sbUJBQW1CLENBQUM7QUFDOUUsT0FBTyxFQUFDLGVBQWUsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFDLE1BQU0sU0FBUyxDQUFDO0FBRTVEOzs7Ozs7Ozs7Ozs7Ozs7OztHQWlCRztBQUNILE1BQU0sVUFBVSxpQkFBaUIsQ0FDL0IsR0FBb0IsRUFDcEIsU0FBcUIsRUFDckIsYUFBeUI7SUFFekIsTUFBTSxLQUFLLEdBQUcsUUFBUSxFQUFFLENBQUM7SUFDekIsSUFBSSxLQUFLLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDMUIsTUFBTSxXQUFXLEdBQUcsY0FBYyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRXhDLDJFQUEyRTtRQUMzRSxlQUFlLENBQUMsYUFBYSxFQUFFLEtBQUssQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLFNBQVMsRUFBRSxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFL0Usc0VBQXNFO1FBQ3RFLGVBQWUsQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsU0FBUyxFQUFFLFdBQVcsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUM5RSxDQUFDO0FBQ0gsQ0FBQztBQUVEOztHQUVHO0FBQ0gsU0FBUyxlQUFlLENBQ3RCLFFBQWtCLEVBQ2xCLFlBQW1CLEVBQ25CLHFCQUE0QyxFQUM1QyxXQUFvQixFQUNwQixjQUF1QjtJQUV2QixRQUFRLEdBQUcsaUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDdkMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7UUFDNUIscUNBQXFDO1FBQ3JDLDJGQUEyRjtRQUMzRixnQ0FBZ0M7UUFDaEMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUN6QyxlQUFlLENBQ2IsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUNYLFlBQVksRUFDWixxQkFBcUIsRUFDckIsV0FBVyxFQUNYLGNBQWMsQ0FDZixDQUFDO1FBQ0osQ0FBQztJQUNILENBQUM7U0FBTSxDQUFDO1FBQ04sTUFBTSxLQUFLLEdBQUcsUUFBUSxFQUFFLENBQUM7UUFDekIsTUFBTSxLQUFLLEdBQUcsUUFBUSxFQUFFLENBQUM7UUFDekIsTUFBTSxLQUFLLEdBQUcsZUFBZSxFQUFHLENBQUM7UUFDakMsSUFBSSxLQUFLLEdBQVEsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUUzRixNQUFNLGVBQWUsR0FBRyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNwRCxJQUFJLFNBQVMsRUFBRSxDQUFDO1lBQ2QsTUFBTSxRQUFRLEdBQUcsSUFBSSxZQUFZLENBQy9CLEtBQThELEVBQzlELEtBQUssQ0FDTixDQUFDO1lBQ0YsNEJBQTRCLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUU7Z0JBQ2pELDJCQUEyQixDQUFDLFFBQTBCLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFDMUUsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBRUQsTUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLGVBQWUsNkRBQStDLENBQUM7UUFDeEYsTUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLGNBQWMsQ0FBQztRQUN0QyxNQUFNLHFCQUFxQixHQUN6QixLQUFLLENBQUMsZUFBZSw0REFBbUQsQ0FBQztRQUUzRSxJQUFJLGNBQWMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNoRCxzRUFBc0U7WUFDdEUsTUFBTSxPQUFPLEdBQUcsSUFBSSxtQkFBbUIsQ0FBQyxlQUFlLEVBQUUsY0FBYyxFQUFFLGlCQUFpQixDQUFDLENBQUM7WUFDNUYsTUFBTSxvQkFBb0IsR0FBRyxPQUFPLENBQ2xDLEtBQUssRUFDTCxZQUFZLEVBQ1osY0FBYyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFVBQVUsR0FBRyxxQkFBcUIsRUFDaEUsUUFBUSxDQUNULENBQUM7WUFDRixJQUFJLG9CQUFvQixLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUM7Z0JBQ2hDLGtCQUFrQixDQUNoQiw4QkFBOEIsQ0FDNUIsS0FBOEQsRUFDOUQsS0FBSyxDQUNOLEVBQ0QsS0FBSyxFQUNMLEtBQUssQ0FDTixDQUFDO2dCQUNGLCtCQUErQixDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUN0RSxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUN6QixLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQ3ZCLEtBQUssQ0FBQyxZQUFZLEVBQUUsQ0FBQztnQkFDckIsSUFBSSxjQUFjLEVBQUUsQ0FBQztvQkFDbkIsS0FBSyxDQUFDLGVBQWUsbUVBQXFELENBQUM7Z0JBQzdFLENBQUM7Z0JBQ0QscUJBQXFCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUNwQyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3RCLENBQUM7aUJBQU0sQ0FBQztnQkFDTixxQkFBcUIsQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLE9BQU8sQ0FBQztnQkFDdEQsS0FBSyxDQUFDLG9CQUFvQixDQUFDLEdBQUcsT0FBTyxDQUFDO1lBQ3hDLENBQUM7UUFDSCxDQUFDO2FBQU0sQ0FBQztZQUNOLHVCQUF1QjtZQUN2Qix3RUFBd0U7WUFDeEUsMkVBQTJFO1lBQzNFLG9EQUFvRDtZQUNwRCxFQUFFO1lBQ0YsNEZBQTRGO1lBQzVGLG9FQUFvRTtZQUNwRSxvRkFBb0Y7WUFDcEYsZ0VBQWdFO1lBQ2hFLDZGQUE2RjtZQUM3RixFQUFFO1lBQ0YsMERBQTBEO1lBQzFELDRFQUE0RTtZQUM1RSxzRkFBc0Y7WUFDdEYsd0VBQXdFO1lBQ3hFLHFGQUFxRjtZQUNyRixhQUFhO1lBQ2Isc0ZBQXNGO1lBQ3RGLGdGQUFnRjtZQUNoRix3RUFBd0U7WUFFeEUsTUFBTSw2QkFBNkIsR0FBRyxPQUFPLENBQzNDLEtBQUssRUFDTCxZQUFZLEVBQ1osVUFBVSxHQUFHLHFCQUFxQixFQUNsQyxRQUFRLENBQ1QsQ0FBQztZQUNGLE1BQU0saUNBQWlDLEdBQUcsT0FBTyxDQUMvQyxLQUFLLEVBQ0wsWUFBWSxFQUNaLFVBQVUsRUFDVixVQUFVLEdBQUcscUJBQXFCLENBQ25DLENBQUM7WUFDRixNQUFNLHlCQUF5QixHQUM3Qiw2QkFBNkIsSUFBSSxDQUFDLElBQUkscUJBQXFCLENBQUMsNkJBQTZCLENBQUMsQ0FBQztZQUM3RixNQUFNLDZCQUE2QixHQUNqQyxpQ0FBaUMsSUFBSSxDQUFDO2dCQUN0QyxxQkFBcUIsQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO1lBRTNELElBQ0UsQ0FBQyxjQUFjLElBQUksQ0FBQyw2QkFBNkIsQ0FBQztnQkFDbEQsQ0FBQyxDQUFDLGNBQWMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLEVBQy9DLENBQUM7Z0JBQ0Qsb0JBQW9CO2dCQUNwQixrQkFBa0IsQ0FDaEIsOEJBQThCLENBQzVCLEtBQThELEVBQzlELEtBQUssQ0FDTixFQUNELEtBQUssRUFDTCxLQUFLLENBQ04sQ0FBQztnQkFDRixNQUFNLE9BQU8sR0FBRyxZQUFZLENBQzFCLGNBQWMsQ0FBQyxDQUFDLENBQUMsaUNBQWlDLENBQUMsQ0FBQyxDQUFDLDZCQUE2QixFQUNsRixxQkFBcUIsQ0FBQyxNQUFNLEVBQzVCLGNBQWMsRUFDZCxXQUFXLEVBQ1gsZUFBZSxDQUNoQixDQUFDO2dCQUNGLElBQUksQ0FBQyxjQUFjLElBQUksNkJBQTZCLEVBQUUsQ0FBQztvQkFDckQscUJBQXFCLENBQUMsaUNBQWlDLENBQUMsQ0FBQyxlQUFlLEdBQUcsT0FBTyxDQUFDO2dCQUNyRixDQUFDO2dCQUNELCtCQUErQixDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsWUFBWSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDekUsWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDekIsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUN2QixLQUFLLENBQUMsWUFBWSxFQUFFLENBQUM7Z0JBQ3JCLElBQUksY0FBYyxFQUFFLENBQUM7b0JBQ25CLEtBQUssQ0FBQyxlQUFlLG1FQUFxRCxDQUFDO2dCQUM3RSxDQUFDO2dCQUNELHFCQUFxQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDcEMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN0QixDQUFDO2lCQUFNLENBQUM7Z0JBQ04sb0JBQW9CO2dCQUNwQixNQUFNLGNBQWMsR0FBRyxlQUFlLENBQ3BDLHFCQUFzQixDQUNwQixjQUFjLENBQUMsQ0FBQyxDQUFDLGlDQUFpQyxDQUFDLENBQUMsQ0FBQyw2QkFBNkIsQ0FDbkYsRUFDRCxlQUFlLEVBQ2YsQ0FBQyxjQUFjLElBQUksV0FBVyxDQUMvQixDQUFDO2dCQUNGLCtCQUErQixDQUM3QixLQUFLLEVBQ0wsUUFBUSxFQUNSLDZCQUE2QixHQUFHLENBQUMsQ0FBQztvQkFDaEMsQ0FBQyxDQUFDLDZCQUE2QjtvQkFDL0IsQ0FBQyxDQUFDLGlDQUFpQyxFQUNyQyxjQUFjLENBQ2YsQ0FBQztZQUNKLENBQUM7WUFDRCxJQUFJLENBQUMsY0FBYyxJQUFJLFdBQVcsSUFBSSw2QkFBNkIsRUFBRSxDQUFDO2dCQUNwRSxxQkFBcUIsQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDLGtCQUFtQixFQUFFLENBQUM7WUFDakYsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0FBQ0gsQ0FBQztBQUVEOzs7Ozs7O0dBT0c7QUFDSCxTQUFTLCtCQUErQixDQUN0QyxLQUFZLEVBQ1osUUFBa0MsRUFDbEMsWUFBb0IsRUFDcEIsY0FBdUI7SUFFdkIsTUFBTSxzQkFBc0IsR0FBRyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDeEQsTUFBTSx1QkFBdUIsR0FBRyxlQUFlLENBQUMsUUFBUSxDQUFDLENBQUM7SUFFMUQsSUFBSSxzQkFBc0IsSUFBSSx1QkFBdUIsRUFBRSxDQUFDO1FBQ3RELHlFQUF5RTtRQUN6RSxNQUFNLFVBQVUsR0FBRyx1QkFBdUIsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUM7UUFDN0YsTUFBTSxTQUFTLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQztRQUN2QyxNQUFNLFdBQVcsR0FBRyxTQUFTLENBQUMsV0FBVyxDQUFDO1FBRTFDLElBQUksV0FBVyxFQUFFLENBQUM7WUFDaEIsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLFlBQVksSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFFOUQsSUFBSSxDQUFDLHNCQUFzQixJQUFLLFFBQTBCLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ2pFLFNBQVM7b0JBQ1AsYUFBYSxDQUNYLGNBQWMsRUFDZCw0REFBNEQsQ0FDN0QsQ0FBQztnQkFDSixNQUFNLHNCQUFzQixHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBRTNELElBQUksc0JBQXNCLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQztvQkFDbEMsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxjQUFjLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQztnQkFDMUQsQ0FBQztxQkFBTSxDQUFDO29CQUNMLEtBQUssQ0FBQyxzQkFBc0IsR0FBRyxDQUFDLENBQXFCLENBQUMsSUFBSSxDQUFDLGNBQWUsRUFBRSxXQUFXLENBQUMsQ0FBQztnQkFDNUYsQ0FBQztZQUNILENBQUM7aUJBQU0sQ0FBQztnQkFDTixLQUFLLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxXQUFXLENBQUMsQ0FBQztZQUN4QyxDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7QUFDSCxDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBUyxlQUFlLENBQ3RCLFlBQWlDLEVBQ2pDLE9BQWtCLEVBQ2xCLG1CQUE0QjtJQUU1QixJQUFJLG1CQUFtQixFQUFFLENBQUM7UUFDeEIsWUFBWSxDQUFDLGtCQUFtQixFQUFFLENBQUM7SUFDckMsQ0FBQztJQUNELE9BQU8sWUFBWSxDQUFDLEtBQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQy9DLENBQUM7QUFFRDs7R0FFRztBQUNILFNBQVMsT0FBTyxDQUFDLElBQVMsRUFBRSxHQUFVLEVBQUUsS0FBYSxFQUFFLEdBQVc7SUFDaEUsS0FBSyxJQUFJLENBQUMsR0FBRyxLQUFLLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQ2pDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUk7WUFBRSxPQUFPLENBQUMsQ0FBQztJQUNoQyxDQUFDO0lBQ0QsT0FBTyxDQUFDLENBQUMsQ0FBQztBQUNaLENBQUM7QUFFRDs7R0FFRztBQUNILFNBQVMsNkJBQTZCLENBRXBDLENBQVksRUFDWixLQUFZLEVBQ1osS0FBWSxFQUNaLEtBQXlCO0lBRXpCLE9BQU8sWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFNLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDdkMsQ0FBQztBQUVEOzs7O0dBSUc7QUFDSCxTQUFTLGlDQUFpQyxDQUV4QyxDQUFZLEVBQ1osS0FBWSxFQUNaLEtBQVksRUFDWixLQUF5QjtJQUV6QixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBTSxDQUFDO0lBQzlCLElBQUksTUFBYSxDQUFDO0lBQ2xCLElBQUksSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3pCLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsa0JBQW1CLENBQUM7UUFDaEUsTUFBTSxjQUFjLEdBQUcsaUJBQWlCLENBQ3RDLEtBQUssRUFDTCxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQ1osSUFBSSxDQUFDLGVBQWdCLENBQUMsS0FBTSxFQUM1QixLQUFLLENBQ04sQ0FBQztRQUNGLHNGQUFzRjtRQUN0RixNQUFNLEdBQUcsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFDakQsdUNBQXVDO1FBQ3ZDLFlBQVksQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDaEMseUZBQXlGO1FBQ3pGLEtBQUssSUFBSSxDQUFDLEdBQUcsY0FBYyxFQUFFLENBQUMsR0FBRyxjQUFjLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDNUQsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqQyxDQUFDO0lBQ0gsQ0FBQztTQUFNLENBQUM7UUFDTixNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ1osdUNBQXVDO1FBQ3ZDLFlBQVksQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUNELE9BQU8sTUFBTSxDQUFDO0FBQ2hCLENBQUM7QUFFRDs7R0FFRztBQUNILFNBQVMsWUFBWSxDQUFDLFNBQTJCLEVBQUUsTUFBYTtJQUM5RCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQzFDLE1BQU0sT0FBTyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQWdCLENBQUM7UUFDNUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0lBQ3pCLENBQUM7SUFDRCxPQUFPLE1BQU0sQ0FBQztBQUNoQixDQUFDO0FBRUQ7O0dBRUc7QUFDSCxTQUFTLFlBQVksQ0FDbkIsU0FNUSxFQUNSLEtBQWEsRUFDYixjQUF1QixFQUN2QixXQUFvQixFQUNwQixDQUFZO0lBRVosTUFBTSxPQUFPLEdBQUcsSUFBSSxtQkFBbUIsQ0FBQyxTQUFTLEVBQUUsY0FBYyxFQUFFLGlCQUFpQixDQUFDLENBQUM7SUFDdEYsT0FBTyxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7SUFDbkIsT0FBTyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDdEIsT0FBTyxDQUFDLGtCQUFrQixHQUFHLENBQUMsQ0FBQztJQUMvQixlQUFlLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxXQUFXLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUM1RCxPQUFPLE9BQU8sQ0FBQztBQUNqQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge3Jlc29sdmVGb3J3YXJkUmVmfSBmcm9tICcuLi9kaS9mb3J3YXJkX3JlZic7XG5pbXBvcnQge0NsYXNzUHJvdmlkZXIsIFByb3ZpZGVyfSBmcm9tICcuLi9kaS9pbnRlcmZhY2UvcHJvdmlkZXInO1xuaW1wb3J0IHtpc0NsYXNzUHJvdmlkZXIsIGlzVHlwZVByb3ZpZGVyLCBTaW5nbGVQcm92aWRlcn0gZnJvbSAnLi4vZGkvcHJvdmlkZXJfY29sbGVjdGlvbic7XG5pbXBvcnQge3Byb3ZpZGVyVG9GYWN0b3J5fSBmcm9tICcuLi9kaS9yM19pbmplY3Rvcic7XG5pbXBvcnQge2Fzc2VydERlZmluZWR9IGZyb20gJy4uL3V0aWwvYXNzZXJ0JztcblxuaW1wb3J0IHtlbWl0UHJvdmlkZXJDb25maWd1cmVkRXZlbnQsIHJ1bkluSW5qZWN0b3JQcm9maWxlckNvbnRleHR9IGZyb20gJy4vZGVidWcvaW5qZWN0b3JfcHJvZmlsZXInO1xuaW1wb3J0IHtcbiAgZGlQdWJsaWNJbkluamVjdG9yLFxuICBnZXROb2RlSW5qZWN0YWJsZSxcbiAgZ2V0T3JDcmVhdGVOb2RlSW5qZWN0b3JGb3JOb2RlLFxuICBOb2RlSW5qZWN0b3IsXG59IGZyb20gJy4vZGknO1xuaW1wb3J0IHvJtcm1ZGlyZWN0aXZlSW5qZWN0fSBmcm9tICcuL2luc3RydWN0aW9ucy9hbGwnO1xuaW1wb3J0IHtEaXJlY3RpdmVEZWZ9IGZyb20gJy4vaW50ZXJmYWNlcy9kZWZpbml0aW9uJztcbmltcG9ydCB7Tm9kZUluamVjdG9yRmFjdG9yeX0gZnJvbSAnLi9pbnRlcmZhY2VzL2luamVjdG9yJztcbmltcG9ydCB7XG4gIFRDb250YWluZXJOb2RlLFxuICBURGlyZWN0aXZlSG9zdE5vZGUsXG4gIFRFbGVtZW50Q29udGFpbmVyTm9kZSxcbiAgVEVsZW1lbnROb2RlLFxuICBUTm9kZVByb3ZpZGVySW5kZXhlcyxcbn0gZnJvbSAnLi9pbnRlcmZhY2VzL25vZGUnO1xuaW1wb3J0IHtpc0NvbXBvbmVudERlZn0gZnJvbSAnLi9pbnRlcmZhY2VzL3R5cGVfY2hlY2tzJztcbmltcG9ydCB7RGVzdHJveUhvb2tEYXRhLCBMVmlldywgVERhdGEsIFRWSUVXLCBUVmlld30gZnJvbSAnLi9pbnRlcmZhY2VzL3ZpZXcnO1xuaW1wb3J0IHtnZXRDdXJyZW50VE5vZGUsIGdldExWaWV3LCBnZXRUVmlld30gZnJvbSAnLi9zdGF0ZSc7XG5cbi8qKlxuICogUmVzb2x2ZXMgdGhlIHByb3ZpZGVycyB3aGljaCBhcmUgZGVmaW5lZCBpbiB0aGUgRGlyZWN0aXZlRGVmLlxuICpcbiAqIFdoZW4gaW5zZXJ0aW5nIHRoZSB0b2tlbnMgYW5kIHRoZSBmYWN0b3JpZXMgaW4gdGhlaXIgcmVzcGVjdGl2ZSBhcnJheXMsIHdlIGNhbiBhc3N1bWUgdGhhdFxuICogdGhpcyBtZXRob2QgaXMgY2FsbGVkIGZpcnN0IGZvciB0aGUgY29tcG9uZW50IChpZiBhbnkpLCBhbmQgdGhlbiBmb3Igb3RoZXIgZGlyZWN0aXZlcyBvbiB0aGUgc2FtZVxuICogbm9kZS5cbiAqIEFzIGEgY29uc2VxdWVuY2UsdGhlIHByb3ZpZGVycyBhcmUgYWx3YXlzIHByb2Nlc3NlZCBpbiB0aGF0IG9yZGVyOlxuICogMSkgVGhlIHZpZXcgcHJvdmlkZXJzIG9mIHRoZSBjb21wb25lbnRcbiAqIDIpIFRoZSBwcm92aWRlcnMgb2YgdGhlIGNvbXBvbmVudFxuICogMykgVGhlIHByb3ZpZGVycyBvZiB0aGUgb3RoZXIgZGlyZWN0aXZlc1xuICogVGhpcyBtYXRjaGVzIHRoZSBzdHJ1Y3R1cmUgb2YgdGhlIGluamVjdGFibGVzIGFycmF5cyBvZiBhIHZpZXcgKGZvciBlYWNoIG5vZGUpLlxuICogU28gdGhlIHRva2VucyBhbmQgdGhlIGZhY3RvcmllcyBjYW4gYmUgcHVzaGVkIGF0IHRoZSBlbmQgb2YgdGhlIGFycmF5cywgZXhjZXB0XG4gKiBpbiBvbmUgY2FzZSBmb3IgbXVsdGkgcHJvdmlkZXJzLlxuICpcbiAqIEBwYXJhbSBkZWYgdGhlIGRpcmVjdGl2ZSBkZWZpbml0aW9uXG4gKiBAcGFyYW0gcHJvdmlkZXJzOiBBcnJheSBvZiBgcHJvdmlkZXJzYC5cbiAqIEBwYXJhbSB2aWV3UHJvdmlkZXJzOiBBcnJheSBvZiBgdmlld1Byb3ZpZGVyc2AuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcm92aWRlcnNSZXNvbHZlcjxUPihcbiAgZGVmOiBEaXJlY3RpdmVEZWY8VD4sXG4gIHByb3ZpZGVyczogUHJvdmlkZXJbXSxcbiAgdmlld1Byb3ZpZGVyczogUHJvdmlkZXJbXSxcbik6IHZvaWQge1xuICBjb25zdCB0VmlldyA9IGdldFRWaWV3KCk7XG4gIGlmICh0Vmlldy5maXJzdENyZWF0ZVBhc3MpIHtcbiAgICBjb25zdCBpc0NvbXBvbmVudCA9IGlzQ29tcG9uZW50RGVmKGRlZik7XG5cbiAgICAvLyBUaGUgbGlzdCBvZiB2aWV3IHByb3ZpZGVycyBpcyBwcm9jZXNzZWQgZmlyc3QsIGFuZCB0aGUgZmxhZ3MgYXJlIHVwZGF0ZWRcbiAgICByZXNvbHZlUHJvdmlkZXIodmlld1Byb3ZpZGVycywgdFZpZXcuZGF0YSwgdFZpZXcuYmx1ZXByaW50LCBpc0NvbXBvbmVudCwgdHJ1ZSk7XG5cbiAgICAvLyBUaGVuLCB0aGUgbGlzdCBvZiBwcm92aWRlcnMgaXMgcHJvY2Vzc2VkLCBhbmQgdGhlIGZsYWdzIGFyZSB1cGRhdGVkXG4gICAgcmVzb2x2ZVByb3ZpZGVyKHByb3ZpZGVycywgdFZpZXcuZGF0YSwgdFZpZXcuYmx1ZXByaW50LCBpc0NvbXBvbmVudCwgZmFsc2UpO1xuICB9XG59XG5cbi8qKlxuICogUmVzb2x2ZXMgYSBwcm92aWRlciBhbmQgcHVibGlzaGVzIGl0IHRvIHRoZSBESSBzeXN0ZW0uXG4gKi9cbmZ1bmN0aW9uIHJlc29sdmVQcm92aWRlcihcbiAgcHJvdmlkZXI6IFByb3ZpZGVyLFxuICB0SW5qZWN0YWJsZXM6IFREYXRhLFxuICBsSW5qZWN0YWJsZXNCbHVlcHJpbnQ6IE5vZGVJbmplY3RvckZhY3RvcnlbXSxcbiAgaXNDb21wb25lbnQ6IGJvb2xlYW4sXG4gIGlzVmlld1Byb3ZpZGVyOiBib29sZWFuLFxuKTogdm9pZCB7XG4gIHByb3ZpZGVyID0gcmVzb2x2ZUZvcndhcmRSZWYocHJvdmlkZXIpO1xuICBpZiAoQXJyYXkuaXNBcnJheShwcm92aWRlcikpIHtcbiAgICAvLyBSZWN1cnNpdmVseSBjYWxsIGByZXNvbHZlUHJvdmlkZXJgXG4gICAgLy8gUmVjdXJzaW9uIGlzIE9LIGluIHRoaXMgY2FzZSBiZWNhdXNlIHRoaXMgY29kZSB3aWxsIG5vdCBiZSBpbiBob3QtcGF0aCBvbmNlIHdlIGltcGxlbWVudFxuICAgIC8vIGNsb25pbmcgb2YgdGhlIGluaXRpYWwgc3RhdGUuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwcm92aWRlci5sZW5ndGg7IGkrKykge1xuICAgICAgcmVzb2x2ZVByb3ZpZGVyKFxuICAgICAgICBwcm92aWRlcltpXSxcbiAgICAgICAgdEluamVjdGFibGVzLFxuICAgICAgICBsSW5qZWN0YWJsZXNCbHVlcHJpbnQsXG4gICAgICAgIGlzQ29tcG9uZW50LFxuICAgICAgICBpc1ZpZXdQcm92aWRlcixcbiAgICAgICk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGNvbnN0IHRWaWV3ID0gZ2V0VFZpZXcoKTtcbiAgICBjb25zdCBsVmlldyA9IGdldExWaWV3KCk7XG4gICAgY29uc3QgdE5vZGUgPSBnZXRDdXJyZW50VE5vZGUoKSE7XG4gICAgbGV0IHRva2VuOiBhbnkgPSBpc1R5cGVQcm92aWRlcihwcm92aWRlcikgPyBwcm92aWRlciA6IHJlc29sdmVGb3J3YXJkUmVmKHByb3ZpZGVyLnByb3ZpZGUpO1xuXG4gICAgY29uc3QgcHJvdmlkZXJGYWN0b3J5ID0gcHJvdmlkZXJUb0ZhY3RvcnkocHJvdmlkZXIpO1xuICAgIGlmIChuZ0Rldk1vZGUpIHtcbiAgICAgIGNvbnN0IGluamVjdG9yID0gbmV3IE5vZGVJbmplY3RvcihcbiAgICAgICAgdE5vZGUgYXMgVEVsZW1lbnROb2RlIHwgVENvbnRhaW5lck5vZGUgfCBURWxlbWVudENvbnRhaW5lck5vZGUsXG4gICAgICAgIGxWaWV3LFxuICAgICAgKTtcbiAgICAgIHJ1bkluSW5qZWN0b3JQcm9maWxlckNvbnRleHQoaW5qZWN0b3IsIHRva2VuLCAoKSA9PiB7XG4gICAgICAgIGVtaXRQcm92aWRlckNvbmZpZ3VyZWRFdmVudChwcm92aWRlciBhcyBTaW5nbGVQcm92aWRlciwgaXNWaWV3UHJvdmlkZXIpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgY29uc3QgYmVnaW5JbmRleCA9IHROb2RlLnByb3ZpZGVySW5kZXhlcyAmIFROb2RlUHJvdmlkZXJJbmRleGVzLlByb3ZpZGVyc1N0YXJ0SW5kZXhNYXNrO1xuICAgIGNvbnN0IGVuZEluZGV4ID0gdE5vZGUuZGlyZWN0aXZlU3RhcnQ7XG4gICAgY29uc3QgY3B0Vmlld1Byb3ZpZGVyc0NvdW50ID1cbiAgICAgIHROb2RlLnByb3ZpZGVySW5kZXhlcyA+PiBUTm9kZVByb3ZpZGVySW5kZXhlcy5DcHRWaWV3UHJvdmlkZXJzQ291bnRTaGlmdDtcblxuICAgIGlmIChpc1R5cGVQcm92aWRlcihwcm92aWRlcikgfHwgIXByb3ZpZGVyLm11bHRpKSB7XG4gICAgICAvLyBTaW5nbGUgcHJvdmlkZXIgY2FzZTogdGhlIGZhY3RvcnkgaXMgY3JlYXRlZCBhbmQgcHVzaGVkIGltbWVkaWF0ZWx5XG4gICAgICBjb25zdCBmYWN0b3J5ID0gbmV3IE5vZGVJbmplY3RvckZhY3RvcnkocHJvdmlkZXJGYWN0b3J5LCBpc1ZpZXdQcm92aWRlciwgybXJtWRpcmVjdGl2ZUluamVjdCk7XG4gICAgICBjb25zdCBleGlzdGluZ0ZhY3RvcnlJbmRleCA9IGluZGV4T2YoXG4gICAgICAgIHRva2VuLFxuICAgICAgICB0SW5qZWN0YWJsZXMsXG4gICAgICAgIGlzVmlld1Byb3ZpZGVyID8gYmVnaW5JbmRleCA6IGJlZ2luSW5kZXggKyBjcHRWaWV3UHJvdmlkZXJzQ291bnQsXG4gICAgICAgIGVuZEluZGV4LFxuICAgICAgKTtcbiAgICAgIGlmIChleGlzdGluZ0ZhY3RvcnlJbmRleCA9PT0gLTEpIHtcbiAgICAgICAgZGlQdWJsaWNJbkluamVjdG9yKFxuICAgICAgICAgIGdldE9yQ3JlYXRlTm9kZUluamVjdG9yRm9yTm9kZShcbiAgICAgICAgICAgIHROb2RlIGFzIFRFbGVtZW50Tm9kZSB8IFRDb250YWluZXJOb2RlIHwgVEVsZW1lbnRDb250YWluZXJOb2RlLFxuICAgICAgICAgICAgbFZpZXcsXG4gICAgICAgICAgKSxcbiAgICAgICAgICB0VmlldyxcbiAgICAgICAgICB0b2tlbixcbiAgICAgICAgKTtcbiAgICAgICAgcmVnaXN0ZXJEZXN0cm95SG9va3NJZlN1cHBvcnRlZCh0VmlldywgcHJvdmlkZXIsIHRJbmplY3RhYmxlcy5sZW5ndGgpO1xuICAgICAgICB0SW5qZWN0YWJsZXMucHVzaCh0b2tlbik7XG4gICAgICAgIHROb2RlLmRpcmVjdGl2ZVN0YXJ0Kys7XG4gICAgICAgIHROb2RlLmRpcmVjdGl2ZUVuZCsrO1xuICAgICAgICBpZiAoaXNWaWV3UHJvdmlkZXIpIHtcbiAgICAgICAgICB0Tm9kZS5wcm92aWRlckluZGV4ZXMgKz0gVE5vZGVQcm92aWRlckluZGV4ZXMuQ3B0Vmlld1Byb3ZpZGVyc0NvdW50U2hpZnRlcjtcbiAgICAgICAgfVxuICAgICAgICBsSW5qZWN0YWJsZXNCbHVlcHJpbnQucHVzaChmYWN0b3J5KTtcbiAgICAgICAgbFZpZXcucHVzaChmYWN0b3J5KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxJbmplY3RhYmxlc0JsdWVwcmludFtleGlzdGluZ0ZhY3RvcnlJbmRleF0gPSBmYWN0b3J5O1xuICAgICAgICBsVmlld1tleGlzdGluZ0ZhY3RvcnlJbmRleF0gPSBmYWN0b3J5O1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBNdWx0aSBwcm92aWRlciBjYXNlOlxuICAgICAgLy8gV2UgY3JlYXRlIGEgbXVsdGkgZmFjdG9yeSB3aGljaCBpcyBnb2luZyB0byBhZ2dyZWdhdGUgYWxsIHRoZSB2YWx1ZXMuXG4gICAgICAvLyBTaW5jZSB0aGUgb3V0cHV0IG9mIHN1Y2ggYSBmYWN0b3J5IGRlcGVuZHMgb24gY29udGVudCBvciB2aWV3IGluamVjdGlvbixcbiAgICAgIC8vIHdlIGNyZWF0ZSB0d28gb2YgdGhlbSwgd2hpY2ggYXJlIGxpbmtlZCB0b2dldGhlci5cbiAgICAgIC8vXG4gICAgICAvLyBUaGUgZmlyc3Qgb25lIChmb3IgdmlldyBwcm92aWRlcnMpIGlzIGFsd2F5cyBpbiB0aGUgZmlyc3QgYmxvY2sgb2YgdGhlIGluamVjdGFibGVzIGFycmF5LFxuICAgICAgLy8gYW5kIHRoZSBzZWNvbmQgb25lIChmb3IgcHJvdmlkZXJzKSBpcyBhbHdheXMgaW4gdGhlIHNlY29uZCBibG9jay5cbiAgICAgIC8vIFRoaXMgaXMgaW1wb3J0YW50IGJlY2F1c2UgdmlldyBwcm92aWRlcnMgaGF2ZSBoaWdoZXIgcHJpb3JpdHkuIFdoZW4gYSBtdWx0aSB0b2tlblxuICAgICAgLy8gaXMgYmVpbmcgbG9va2VkIHVwLCB0aGUgdmlldyBwcm92aWRlcnMgc2hvdWxkIGJlIGZvdW5kIGZpcnN0LlxuICAgICAgLy8gTm90ZSB0aGF0IGl0IGlzIG5vdCBwb3NzaWJsZSB0byBoYXZlIGEgbXVsdGkgZmFjdG9yeSBpbiB0aGUgdGhpcmQgYmxvY2sgKGRpcmVjdGl2ZSBibG9jaykuXG4gICAgICAvL1xuICAgICAgLy8gVGhlIGFsZ29yaXRobSB0byBwcm9jZXNzIG11bHRpIHByb3ZpZGVycyBpcyBhcyBmb2xsb3dzOlxuICAgICAgLy8gMSkgSWYgdGhlIG11bHRpIHByb3ZpZGVyIGNvbWVzIGZyb20gdGhlIGB2aWV3UHJvdmlkZXJzYCBvZiB0aGUgY29tcG9uZW50OlxuICAgICAgLy8gICBhKSBJZiB0aGUgc3BlY2lhbCB2aWV3IHByb3ZpZGVycyBmYWN0b3J5IGRvZXNuJ3QgZXhpc3QsIGl0IGlzIGNyZWF0ZWQgYW5kIHB1c2hlZC5cbiAgICAgIC8vICAgYikgRWxzZSwgdGhlIG11bHRpIHByb3ZpZGVyIGlzIGFkZGVkIHRvIHRoZSBleGlzdGluZyBtdWx0aSBmYWN0b3J5LlxuICAgICAgLy8gMikgSWYgdGhlIG11bHRpIHByb3ZpZGVyIGNvbWVzIGZyb20gdGhlIGBwcm92aWRlcnNgIG9mIHRoZSBjb21wb25lbnQgb3Igb2YgYW5vdGhlclxuICAgICAgLy8gZGlyZWN0aXZlOlxuICAgICAgLy8gICBhKSBJZiB0aGUgbXVsdGkgZmFjdG9yeSBkb2Vzbid0IGV4aXN0LCBpdCBpcyBjcmVhdGVkIGFuZCBwcm92aWRlciBwdXNoZWQgaW50byBpdC5cbiAgICAgIC8vICAgICAgSXQgaXMgYWxzbyBsaW5rZWQgdG8gdGhlIG11bHRpIGZhY3RvcnkgZm9yIHZpZXcgcHJvdmlkZXJzLCBpZiBpdCBleGlzdHMuXG4gICAgICAvLyAgIGIpIEVsc2UsIHRoZSBtdWx0aSBwcm92aWRlciBpcyBhZGRlZCB0byB0aGUgZXhpc3RpbmcgbXVsdGkgZmFjdG9yeS5cblxuICAgICAgY29uc3QgZXhpc3RpbmdQcm92aWRlcnNGYWN0b3J5SW5kZXggPSBpbmRleE9mKFxuICAgICAgICB0b2tlbixcbiAgICAgICAgdEluamVjdGFibGVzLFxuICAgICAgICBiZWdpbkluZGV4ICsgY3B0Vmlld1Byb3ZpZGVyc0NvdW50LFxuICAgICAgICBlbmRJbmRleCxcbiAgICAgICk7XG4gICAgICBjb25zdCBleGlzdGluZ1ZpZXdQcm92aWRlcnNGYWN0b3J5SW5kZXggPSBpbmRleE9mKFxuICAgICAgICB0b2tlbixcbiAgICAgICAgdEluamVjdGFibGVzLFxuICAgICAgICBiZWdpbkluZGV4LFxuICAgICAgICBiZWdpbkluZGV4ICsgY3B0Vmlld1Byb3ZpZGVyc0NvdW50LFxuICAgICAgKTtcbiAgICAgIGNvbnN0IGRvZXNQcm92aWRlcnNGYWN0b3J5RXhpc3QgPVxuICAgICAgICBleGlzdGluZ1Byb3ZpZGVyc0ZhY3RvcnlJbmRleCA+PSAwICYmIGxJbmplY3RhYmxlc0JsdWVwcmludFtleGlzdGluZ1Byb3ZpZGVyc0ZhY3RvcnlJbmRleF07XG4gICAgICBjb25zdCBkb2VzVmlld1Byb3ZpZGVyc0ZhY3RvcnlFeGlzdCA9XG4gICAgICAgIGV4aXN0aW5nVmlld1Byb3ZpZGVyc0ZhY3RvcnlJbmRleCA+PSAwICYmXG4gICAgICAgIGxJbmplY3RhYmxlc0JsdWVwcmludFtleGlzdGluZ1ZpZXdQcm92aWRlcnNGYWN0b3J5SW5kZXhdO1xuXG4gICAgICBpZiAoXG4gICAgICAgIChpc1ZpZXdQcm92aWRlciAmJiAhZG9lc1ZpZXdQcm92aWRlcnNGYWN0b3J5RXhpc3QpIHx8XG4gICAgICAgICghaXNWaWV3UHJvdmlkZXIgJiYgIWRvZXNQcm92aWRlcnNGYWN0b3J5RXhpc3QpXG4gICAgICApIHtcbiAgICAgICAgLy8gQ2FzZXMgMS5hIGFuZCAyLmFcbiAgICAgICAgZGlQdWJsaWNJbkluamVjdG9yKFxuICAgICAgICAgIGdldE9yQ3JlYXRlTm9kZUluamVjdG9yRm9yTm9kZShcbiAgICAgICAgICAgIHROb2RlIGFzIFRFbGVtZW50Tm9kZSB8IFRDb250YWluZXJOb2RlIHwgVEVsZW1lbnRDb250YWluZXJOb2RlLFxuICAgICAgICAgICAgbFZpZXcsXG4gICAgICAgICAgKSxcbiAgICAgICAgICB0VmlldyxcbiAgICAgICAgICB0b2tlbixcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgZmFjdG9yeSA9IG11bHRpRmFjdG9yeShcbiAgICAgICAgICBpc1ZpZXdQcm92aWRlciA/IG11bHRpVmlld1Byb3ZpZGVyc0ZhY3RvcnlSZXNvbHZlciA6IG11bHRpUHJvdmlkZXJzRmFjdG9yeVJlc29sdmVyLFxuICAgICAgICAgIGxJbmplY3RhYmxlc0JsdWVwcmludC5sZW5ndGgsXG4gICAgICAgICAgaXNWaWV3UHJvdmlkZXIsXG4gICAgICAgICAgaXNDb21wb25lbnQsXG4gICAgICAgICAgcHJvdmlkZXJGYWN0b3J5LFxuICAgICAgICApO1xuICAgICAgICBpZiAoIWlzVmlld1Byb3ZpZGVyICYmIGRvZXNWaWV3UHJvdmlkZXJzRmFjdG9yeUV4aXN0KSB7XG4gICAgICAgICAgbEluamVjdGFibGVzQmx1ZXByaW50W2V4aXN0aW5nVmlld1Byb3ZpZGVyc0ZhY3RvcnlJbmRleF0ucHJvdmlkZXJGYWN0b3J5ID0gZmFjdG9yeTtcbiAgICAgICAgfVxuICAgICAgICByZWdpc3RlckRlc3Ryb3lIb29rc0lmU3VwcG9ydGVkKHRWaWV3LCBwcm92aWRlciwgdEluamVjdGFibGVzLmxlbmd0aCwgMCk7XG4gICAgICAgIHRJbmplY3RhYmxlcy5wdXNoKHRva2VuKTtcbiAgICAgICAgdE5vZGUuZGlyZWN0aXZlU3RhcnQrKztcbiAgICAgICAgdE5vZGUuZGlyZWN0aXZlRW5kKys7XG4gICAgICAgIGlmIChpc1ZpZXdQcm92aWRlcikge1xuICAgICAgICAgIHROb2RlLnByb3ZpZGVySW5kZXhlcyArPSBUTm9kZVByb3ZpZGVySW5kZXhlcy5DcHRWaWV3UHJvdmlkZXJzQ291bnRTaGlmdGVyO1xuICAgICAgICB9XG4gICAgICAgIGxJbmplY3RhYmxlc0JsdWVwcmludC5wdXNoKGZhY3RvcnkpO1xuICAgICAgICBsVmlldy5wdXNoKGZhY3RvcnkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQ2FzZXMgMS5iIGFuZCAyLmJcbiAgICAgICAgY29uc3QgaW5kZXhJbkZhY3RvcnkgPSBtdWx0aUZhY3RvcnlBZGQoXG4gICAgICAgICAgbEluamVjdGFibGVzQmx1ZXByaW50IVtcbiAgICAgICAgICAgIGlzVmlld1Byb3ZpZGVyID8gZXhpc3RpbmdWaWV3UHJvdmlkZXJzRmFjdG9yeUluZGV4IDogZXhpc3RpbmdQcm92aWRlcnNGYWN0b3J5SW5kZXhcbiAgICAgICAgICBdLFxuICAgICAgICAgIHByb3ZpZGVyRmFjdG9yeSxcbiAgICAgICAgICAhaXNWaWV3UHJvdmlkZXIgJiYgaXNDb21wb25lbnQsXG4gICAgICAgICk7XG4gICAgICAgIHJlZ2lzdGVyRGVzdHJveUhvb2tzSWZTdXBwb3J0ZWQoXG4gICAgICAgICAgdFZpZXcsXG4gICAgICAgICAgcHJvdmlkZXIsXG4gICAgICAgICAgZXhpc3RpbmdQcm92aWRlcnNGYWN0b3J5SW5kZXggPiAtMVxuICAgICAgICAgICAgPyBleGlzdGluZ1Byb3ZpZGVyc0ZhY3RvcnlJbmRleFxuICAgICAgICAgICAgOiBleGlzdGluZ1ZpZXdQcm92aWRlcnNGYWN0b3J5SW5kZXgsXG4gICAgICAgICAgaW5kZXhJbkZhY3RvcnksXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBpZiAoIWlzVmlld1Byb3ZpZGVyICYmIGlzQ29tcG9uZW50ICYmIGRvZXNWaWV3UHJvdmlkZXJzRmFjdG9yeUV4aXN0KSB7XG4gICAgICAgIGxJbmplY3RhYmxlc0JsdWVwcmludFtleGlzdGluZ1ZpZXdQcm92aWRlcnNGYWN0b3J5SW5kZXhdLmNvbXBvbmVudFByb3ZpZGVycyErKztcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBSZWdpc3RlcnMgdGhlIGBuZ09uRGVzdHJveWAgaG9vayBvZiBhIHByb3ZpZGVyLCBpZiB0aGUgcHJvdmlkZXIgc3VwcG9ydHMgZGVzdHJveSBob29rcy5cbiAqIEBwYXJhbSB0VmlldyBgVFZpZXdgIGluIHdoaWNoIHRvIHJlZ2lzdGVyIHRoZSBob29rLlxuICogQHBhcmFtIHByb3ZpZGVyIFByb3ZpZGVyIHdob3NlIGhvb2sgc2hvdWxkIGJlIHJlZ2lzdGVyZWQuXG4gKiBAcGFyYW0gY29udGV4dEluZGV4IEluZGV4IHVuZGVyIHdoaWNoIHRvIGZpbmQgdGhlIGNvbnRleHQgZm9yIHRoZSBob29rIHdoZW4gaXQncyBiZWluZyBpbnZva2VkLlxuICogQHBhcmFtIGluZGV4SW5GYWN0b3J5IE9ubHkgcmVxdWlyZWQgZm9yIGBtdWx0aWAgcHJvdmlkZXJzLiBJbmRleCBvZiB0aGUgcHJvdmlkZXIgaW4gdGhlIG11bHRpXG4gKiBwcm92aWRlciBmYWN0b3J5LlxuICovXG5mdW5jdGlvbiByZWdpc3RlckRlc3Ryb3lIb29rc0lmU3VwcG9ydGVkKFxuICB0VmlldzogVFZpZXcsXG4gIHByb3ZpZGVyOiBFeGNsdWRlPFByb3ZpZGVyLCBhbnlbXT4sXG4gIGNvbnRleHRJbmRleDogbnVtYmVyLFxuICBpbmRleEluRmFjdG9yeT86IG51bWJlcixcbikge1xuICBjb25zdCBwcm92aWRlcklzVHlwZVByb3ZpZGVyID0gaXNUeXBlUHJvdmlkZXIocHJvdmlkZXIpO1xuICBjb25zdCBwcm92aWRlcklzQ2xhc3NQcm92aWRlciA9IGlzQ2xhc3NQcm92aWRlcihwcm92aWRlcik7XG5cbiAgaWYgKHByb3ZpZGVySXNUeXBlUHJvdmlkZXIgfHwgcHJvdmlkZXJJc0NsYXNzUHJvdmlkZXIpIHtcbiAgICAvLyBSZXNvbHZlIGZvcndhcmQgcmVmZXJlbmNlcyBhcyBgdXNlQ2xhc3NgIGNhbiBob2xkIGEgZm9yd2FyZCByZWZlcmVuY2UuXG4gICAgY29uc3QgY2xhc3NUb2tlbiA9IHByb3ZpZGVySXNDbGFzc1Byb3ZpZGVyID8gcmVzb2x2ZUZvcndhcmRSZWYocHJvdmlkZXIudXNlQ2xhc3MpIDogcHJvdmlkZXI7XG4gICAgY29uc3QgcHJvdG90eXBlID0gY2xhc3NUb2tlbi5wcm90b3R5cGU7XG4gICAgY29uc3QgbmdPbkRlc3Ryb3kgPSBwcm90b3R5cGUubmdPbkRlc3Ryb3k7XG5cbiAgICBpZiAobmdPbkRlc3Ryb3kpIHtcbiAgICAgIGNvbnN0IGhvb2tzID0gdFZpZXcuZGVzdHJveUhvb2tzIHx8ICh0Vmlldy5kZXN0cm95SG9va3MgPSBbXSk7XG5cbiAgICAgIGlmICghcHJvdmlkZXJJc1R5cGVQcm92aWRlciAmJiAocHJvdmlkZXIgYXMgQ2xhc3NQcm92aWRlcikubXVsdGkpIHtcbiAgICAgICAgbmdEZXZNb2RlICYmXG4gICAgICAgICAgYXNzZXJ0RGVmaW5lZChcbiAgICAgICAgICAgIGluZGV4SW5GYWN0b3J5LFxuICAgICAgICAgICAgJ2luZGV4SW5GYWN0b3J5IHdoZW4gcmVnaXN0ZXJpbmcgbXVsdGkgZmFjdG9yeSBkZXN0cm95IGhvb2snLFxuICAgICAgICAgICk7XG4gICAgICAgIGNvbnN0IGV4aXN0aW5nQ2FsbGJhY2tzSW5kZXggPSBob29rcy5pbmRleE9mKGNvbnRleHRJbmRleCk7XG5cbiAgICAgICAgaWYgKGV4aXN0aW5nQ2FsbGJhY2tzSW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgaG9va3MucHVzaChjb250ZXh0SW5kZXgsIFtpbmRleEluRmFjdG9yeSwgbmdPbkRlc3Ryb3ldKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAoaG9va3NbZXhpc3RpbmdDYWxsYmFja3NJbmRleCArIDFdIGFzIERlc3Ryb3lIb29rRGF0YSkucHVzaChpbmRleEluRmFjdG9yeSEsIG5nT25EZXN0cm95KTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaG9va3MucHVzaChjb250ZXh0SW5kZXgsIG5nT25EZXN0cm95KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBBZGQgYSBmYWN0b3J5IGluIGEgbXVsdGkgZmFjdG9yeS5cbiAqIEByZXR1cm5zIEluZGV4IGF0IHdoaWNoIHRoZSBmYWN0b3J5IHdhcyBpbnNlcnRlZC5cbiAqL1xuZnVuY3Rpb24gbXVsdGlGYWN0b3J5QWRkKFxuICBtdWx0aUZhY3Rvcnk6IE5vZGVJbmplY3RvckZhY3RvcnksXG4gIGZhY3Rvcnk6ICgpID0+IGFueSxcbiAgaXNDb21wb25lbnRQcm92aWRlcjogYm9vbGVhbixcbik6IG51bWJlciB7XG4gIGlmIChpc0NvbXBvbmVudFByb3ZpZGVyKSB7XG4gICAgbXVsdGlGYWN0b3J5LmNvbXBvbmVudFByb3ZpZGVycyErKztcbiAgfVxuICByZXR1cm4gbXVsdGlGYWN0b3J5Lm11bHRpIS5wdXNoKGZhY3RvcnkpIC0gMTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBpbmRleCBvZiBpdGVtIGluIHRoZSBhcnJheSwgYnV0IG9ubHkgaW4gdGhlIGJlZ2luIHRvIGVuZCByYW5nZS5cbiAqL1xuZnVuY3Rpb24gaW5kZXhPZihpdGVtOiBhbnksIGFycjogYW55W10sIGJlZ2luOiBudW1iZXIsIGVuZDogbnVtYmVyKSB7XG4gIGZvciAobGV0IGkgPSBiZWdpbjsgaSA8IGVuZDsgaSsrKSB7XG4gICAgaWYgKGFycltpXSA9PT0gaXRlbSkgcmV0dXJuIGk7XG4gIH1cbiAgcmV0dXJuIC0xO1xufVxuXG4vKipcbiAqIFVzZSB0aGlzIHdpdGggYG11bHRpYCBgcHJvdmlkZXJzYC5cbiAqL1xuZnVuY3Rpb24gbXVsdGlQcm92aWRlcnNGYWN0b3J5UmVzb2x2ZXIoXG4gIHRoaXM6IE5vZGVJbmplY3RvckZhY3RvcnksXG4gIF86IHVuZGVmaW5lZCxcbiAgdERhdGE6IFREYXRhLFxuICBsRGF0YTogTFZpZXcsXG4gIHROb2RlOiBURGlyZWN0aXZlSG9zdE5vZGUsXG4pOiBhbnlbXSB7XG4gIHJldHVybiBtdWx0aVJlc29sdmUodGhpcy5tdWx0aSEsIFtdKTtcbn1cblxuLyoqXG4gKiBVc2UgdGhpcyB3aXRoIGBtdWx0aWAgYHZpZXdQcm92aWRlcnNgLlxuICpcbiAqIFRoaXMgZmFjdG9yeSBrbm93cyBob3cgdG8gY29uY2F0ZW5hdGUgaXRzZWxmIHdpdGggdGhlIGV4aXN0aW5nIGBtdWx0aWAgYHByb3ZpZGVyc2AuXG4gKi9cbmZ1bmN0aW9uIG11bHRpVmlld1Byb3ZpZGVyc0ZhY3RvcnlSZXNvbHZlcihcbiAgdGhpczogTm9kZUluamVjdG9yRmFjdG9yeSxcbiAgXzogdW5kZWZpbmVkLFxuICB0RGF0YTogVERhdGEsXG4gIGxWaWV3OiBMVmlldyxcbiAgdE5vZGU6IFREaXJlY3RpdmVIb3N0Tm9kZSxcbik6IGFueVtdIHtcbiAgY29uc3QgZmFjdG9yaWVzID0gdGhpcy5tdWx0aSE7XG4gIGxldCByZXN1bHQ6IGFueVtdO1xuICBpZiAodGhpcy5wcm92aWRlckZhY3RvcnkpIHtcbiAgICBjb25zdCBjb21wb25lbnRDb3VudCA9IHRoaXMucHJvdmlkZXJGYWN0b3J5LmNvbXBvbmVudFByb3ZpZGVycyE7XG4gICAgY29uc3QgbXVsdGlQcm92aWRlcnMgPSBnZXROb2RlSW5qZWN0YWJsZShcbiAgICAgIGxWaWV3LFxuICAgICAgbFZpZXdbVFZJRVddLFxuICAgICAgdGhpcy5wcm92aWRlckZhY3RvcnkhLmluZGV4ISxcbiAgICAgIHROb2RlLFxuICAgICk7XG4gICAgLy8gQ29weSB0aGUgc2VjdGlvbiBvZiB0aGUgYXJyYXkgd2hpY2ggY29udGFpbnMgYG11bHRpYCBgcHJvdmlkZXJzYCBmcm9tIHRoZSBjb21wb25lbnRcbiAgICByZXN1bHQgPSBtdWx0aVByb3ZpZGVycy5zbGljZSgwLCBjb21wb25lbnRDb3VudCk7XG4gICAgLy8gSW5zZXJ0IHRoZSBgdmlld1Byb3ZpZGVyYCBpbnN0YW5jZXMuXG4gICAgbXVsdGlSZXNvbHZlKGZhY3RvcmllcywgcmVzdWx0KTtcbiAgICAvLyBDb3B5IHRoZSBzZWN0aW9uIG9mIHRoZSBhcnJheSB3aGljaCBjb250YWlucyBgbXVsdGlgIGBwcm92aWRlcnNgIGZyb20gb3RoZXIgZGlyZWN0aXZlc1xuICAgIGZvciAobGV0IGkgPSBjb21wb25lbnRDb3VudDsgaSA8IG11bHRpUHJvdmlkZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICByZXN1bHQucHVzaChtdWx0aVByb3ZpZGVyc1tpXSk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHJlc3VsdCA9IFtdO1xuICAgIC8vIEluc2VydCB0aGUgYHZpZXdQcm92aWRlcmAgaW5zdGFuY2VzLlxuICAgIG11bHRpUmVzb2x2ZShmYWN0b3JpZXMsIHJlc3VsdCk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBNYXBzIGFuIGFycmF5IG9mIGZhY3RvcmllcyBpbnRvIGFuIGFycmF5IG9mIHZhbHVlcy5cbiAqL1xuZnVuY3Rpb24gbXVsdGlSZXNvbHZlKGZhY3RvcmllczogQXJyYXk8KCkgPT4gYW55PiwgcmVzdWx0OiBhbnlbXSk6IGFueVtdIHtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBmYWN0b3JpZXMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBmYWN0b3J5ID0gZmFjdG9yaWVzW2ldISBhcyAoKSA9PiBudWxsO1xuICAgIHJlc3VsdC5wdXNoKGZhY3RvcnkoKSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbXVsdGkgZmFjdG9yeS5cbiAqL1xuZnVuY3Rpb24gbXVsdGlGYWN0b3J5KFxuICBmYWN0b3J5Rm46IChcbiAgICB0aGlzOiBOb2RlSW5qZWN0b3JGYWN0b3J5LFxuICAgIF86IHVuZGVmaW5lZCxcbiAgICB0RGF0YTogVERhdGEsXG4gICAgbERhdGE6IExWaWV3LFxuICAgIHROb2RlOiBURGlyZWN0aXZlSG9zdE5vZGUsXG4gICkgPT4gYW55LFxuICBpbmRleDogbnVtYmVyLFxuICBpc1ZpZXdQcm92aWRlcjogYm9vbGVhbixcbiAgaXNDb21wb25lbnQ6IGJvb2xlYW4sXG4gIGY6ICgpID0+IGFueSxcbik6IE5vZGVJbmplY3RvckZhY3Rvcnkge1xuICBjb25zdCBmYWN0b3J5ID0gbmV3IE5vZGVJbmplY3RvckZhY3RvcnkoZmFjdG9yeUZuLCBpc1ZpZXdQcm92aWRlciwgybXJtWRpcmVjdGl2ZUluamVjdCk7XG4gIGZhY3RvcnkubXVsdGkgPSBbXTtcbiAgZmFjdG9yeS5pbmRleCA9IGluZGV4O1xuICBmYWN0b3J5LmNvbXBvbmVudFByb3ZpZGVycyA9IDA7XG4gIG11bHRpRmFjdG9yeUFkZChmYWN0b3J5LCBmLCBpc0NvbXBvbmVudCAmJiAhaXNWaWV3UHJvdmlkZXIpO1xuICByZXR1cm4gZmFjdG9yeTtcbn1cbiJdfQ==