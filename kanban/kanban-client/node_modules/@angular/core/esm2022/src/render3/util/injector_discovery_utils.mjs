/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ENVIRONMENT_INITIALIZER } from '../../di/initializer_token';
import { getInjectorDef } from '../../di/interface/defs';
import { INJECTOR_DEF_TYPES } from '../../di/internal_tokens';
import { NullInjector } from '../../di/null_injector';
import { walkProviderTree } from '../../di/provider_collection';
import { EnvironmentInjector, R3Injector } from '../../di/r3_injector';
import { NgModuleRef as viewEngine_NgModuleRef } from '../../linker/ng_module_factory';
import { deepForEach } from '../../util/array_utils';
import { throwError } from '../../util/assert';
import { assertTNode, assertTNodeForLView } from '../assert';
import { ChainedInjector } from '../component_ref';
import { getFrameworkDIDebugData } from '../debug/framework_injector_profiler';
import { getComponentDef } from '../definition';
import { getNodeInjectorLView, getNodeInjectorTNode, getParentInjectorLocation, NodeInjector, } from '../di';
import { INJECTOR, TVIEW } from '../interfaces/view';
import { getParentInjectorIndex, getParentInjectorView, hasParentInjector } from './injector_utils';
import { getNativeByTNode } from './view_utils';
/**
 * Discovers the dependencies of an injectable instance. Provides DI information about each
 * dependency that the injectable was instantiated with, including where they were provided from.
 *
 * @param injector An injector instance
 * @param token a DI token that was constructed by the given injector instance
 * @returns an object that contains the created instance of token as well as all of the dependencies
 * that it was instantiated with OR undefined if the token was not created within the given
 * injector.
 */
export function getDependenciesFromInjectable(injector, token) {
    // First we check to see if the token given maps to an actual instance in the injector given.
    // We use `self: true` because we only want to look at the injector we were given.
    // We use `optional: true` because it's possible that the token we were given was never
    // constructed by the injector we were given.
    const instance = injector.get(token, null, { self: true, optional: true });
    if (instance === null) {
        throw new Error(`Unable to determine instance of ${token} in given injector`);
    }
    const unformattedDependencies = getDependenciesForTokenInInjector(token, injector);
    const resolutionPath = getInjectorResolutionPath(injector);
    const dependencies = unformattedDependencies.map((dep) => {
        // injectedIn contains private fields, so we omit it from the response
        const formattedDependency = {
            value: dep.value,
        };
        // convert injection flags to booleans
        const flags = dep.flags;
        formattedDependency.flags = {
            optional: (8 /* InternalInjectFlags.Optional */ & flags) === 8 /* InternalInjectFlags.Optional */,
            host: (1 /* InternalInjectFlags.Host */ & flags) === 1 /* InternalInjectFlags.Host */,
            self: (2 /* InternalInjectFlags.Self */ & flags) === 2 /* InternalInjectFlags.Self */,
            skipSelf: (4 /* InternalInjectFlags.SkipSelf */ & flags) === 4 /* InternalInjectFlags.SkipSelf */,
        };
        // find the injector that provided the dependency
        for (let i = 0; i < resolutionPath.length; i++) {
            const injectorToCheck = resolutionPath[i];
            // if skipSelf is true we skip the first injector
            if (i === 0 && formattedDependency.flags.skipSelf) {
                continue;
            }
            // host only applies to NodeInjectors
            if (formattedDependency.flags.host && injectorToCheck instanceof EnvironmentInjector) {
                break;
            }
            const instance = injectorToCheck.get(dep.token, null, {
                self: true,
                optional: true,
            });
            if (instance !== null) {
                // if host flag is true we double check that we can get the service from the first element
                // in the resolution path by using the host flag. This is done to make sure that we've found
                // the correct providing injector, and not a node injector that is connected to our path via
                // a router outlet.
                if (formattedDependency.flags.host) {
                    const firstInjector = resolutionPath[0];
                    const lookupFromFirstInjector = firstInjector.get(dep.token, null, {
                        ...formattedDependency.flags,
                        optional: true,
                    });
                    if (lookupFromFirstInjector !== null) {
                        formattedDependency.providedIn = injectorToCheck;
                    }
                    break;
                }
                formattedDependency.providedIn = injectorToCheck;
                break;
            }
            // if self is true we stop after the first injector
            if (i === 0 && formattedDependency.flags.self) {
                break;
            }
        }
        if (dep.token)
            formattedDependency.token = dep.token;
        return formattedDependency;
    });
    return { instance, dependencies };
}
function getDependenciesForTokenInInjector(token, injector) {
    const { resolverToTokenToDependencies } = getFrameworkDIDebugData();
    if (!(injector instanceof NodeInjector)) {
        return resolverToTokenToDependencies.get(injector)?.get?.(token) ?? [];
    }
    const lView = getNodeInjectorLView(injector);
    const tokenDependencyMap = resolverToTokenToDependencies.get(lView);
    const dependencies = tokenDependencyMap?.get(token) ?? [];
    // In the NodeInjector case, all injections for every node are stored in the same lView.
    // We use the injectedIn field of the dependency to filter out the dependencies that
    // do not come from the same node as the instance we're looking at.
    return dependencies.filter((dependency) => {
        const dependencyNode = dependency.injectedIn?.tNode;
        if (dependencyNode === undefined) {
            return false;
        }
        const instanceNode = getNodeInjectorTNode(injector);
        assertTNode(dependencyNode);
        assertTNode(instanceNode);
        return dependencyNode === instanceNode;
    });
}
/**
 * Gets the class associated with an injector that contains a provider `imports` array in it's
 * definition
 *
 * For Module Injectors this returns the NgModule constructor.
 *
 * For Standalone injectors this returns the standalone component constructor.
 *
 * @param injector Injector an injector instance
 * @returns the constructor where the `imports` array that configures this injector is located
 */
function getProviderImportsContainer(injector) {
    const { standaloneInjectorToComponent } = getFrameworkDIDebugData();
    // standalone components configure providers through a component def, so we have to
    // use the standalone component associated with this injector if Injector represents
    // a standalone components EnvironmentInjector
    if (standaloneInjectorToComponent.has(injector)) {
        return standaloneInjectorToComponent.get(injector);
    }
    // Module injectors configure providers through their NgModule def, so we use the
    // injector to lookup its NgModuleRef and through that grab its instance
    const defTypeRef = injector.get(viewEngine_NgModuleRef, null, { self: true, optional: true });
    // If we can't find an associated imports container, return null.
    // This could be the case if this function is called with an R3Injector that does not represent
    // a standalone component or NgModule.
    if (defTypeRef === null) {
        return null;
    }
    // In standalone applications, the root environment injector created by bootstrapApplication
    // may have no associated "instance".
    if (defTypeRef.instance === null) {
        return null;
    }
    return defTypeRef.instance.constructor;
}
/**
 * Gets the providers configured on a NodeInjector
 *
 * @param injector A NodeInjector instance
 * @returns ProviderRecord[] an array of objects representing the providers configured on this
 *     injector
 */
function getNodeInjectorProviders(injector) {
    const diResolver = getNodeInjectorTNode(injector);
    const { resolverToProviders } = getFrameworkDIDebugData();
    return resolverToProviders.get(diResolver) ?? [];
}
/**
 * Gets a mapping of providers configured on an injector to their import paths
 *
 * ModuleA -> imports ModuleB
 * ModuleB -> imports ModuleC
 * ModuleB -> provides MyServiceA
 * ModuleC -> provides MyServiceB
 *
 * getProviderImportPaths(ModuleA)
 * > Map(2) {
 *   MyServiceA => [ModuleA, ModuleB]
 *   MyServiceB => [ModuleA, ModuleB, ModuleC]
 *  }
 *
 * @param providerImportsContainer constructor of class that contains an `imports` array in it's
 *     definition
 * @returns A Map object that maps providers to an array of constructors representing it's import
 *     path
 *
 */
function getProviderImportPaths(providerImportsContainer) {
    const providerToPath = new Map();
    const visitedContainers = new Set();
    const visitor = walkProviderTreeToDiscoverImportPaths(providerToPath, visitedContainers);
    walkProviderTree(providerImportsContainer, visitor, [], new Set());
    return providerToPath;
}
/**
 *
 * Higher order function that returns a visitor for WalkProviderTree
 *
 * Takes in a Map and Set to keep track of the providers and containers
 * visited, so that we can discover the import paths of these providers
 * during the traversal.
 *
 * This visitor takes advantage of the fact that walkProviderTree performs a
 * postorder traversal of the provider tree for the passed in container. Because postorder
 * traversal recursively processes subtrees from leaf nodes until the traversal reaches the root,
 * we write a visitor that constructs provider import paths in reverse.
 *
 *
 * We use the visitedContainers set defined outside this visitor
 * because we want to run some logic only once for
 * each container in the tree. That logic can be described as:
 *
 *
 * 1. for each discovered_provider and discovered_path in the incomplete provider paths we've
 * already discovered
 * 2. get the first container in discovered_path
 * 3. if that first container is in the imports array of the container we're visiting
 *    Then the container we're visiting is also in the import path of discovered_provider, so we
 *    unshift discovered_path with the container we're currently visiting
 *
 *
 * Example Run:
 * ```
 *                 ┌──────────┐
 *                 │containerA│
 *      ┌─imports-─┤          ├──imports─┐
 *      │          │  provA   │          │
 *      │          │  provB   │          │
 *      │          └──────────┘          │
 *      │                                │
 *     ┌▼─────────┐             ┌────────▼─┐
 *     │containerB│             │containerC│
 *     │          │             │          │
 *     │  provD   │             │  provF   │
 *     │  provE   │             │  provG   │
 *     └──────────┘             └──────────┘
 * ```
 *
 * Each step of the traversal,
 *
 * ```
 * visitor(provD, containerB)
 * providerToPath === Map { provD => [containerB] }
 * visitedContainers === Set { containerB }
 *
 * visitor(provE, containerB)
 * providerToPath === Map { provD => [containerB], provE => [containerB] }
 * visitedContainers === Set { containerB }
 *
 * visitor(provF, containerC)
 * providerToPath === Map { provD => [containerB], provE => [containerB], provF => [containerC] }
 * visitedContainers === Set { containerB, containerC }
 *
 * visitor(provG, containerC)
 * providerToPath === Map {
 *   provD => [containerB], provE => [containerB], provF => [containerC], provG => [containerC]
 * }
 * visitedContainers === Set { containerB, containerC }
 *
 * visitor(provA, containerA)
 * providerToPath === Map {
 *   provD => [containerA, containerB],
 *   provE => [containerA, containerB],
 *   provF => [containerA, containerC],
 *   provG => [containerA, containerC],
 *   provA => [containerA]
 * }
 * visitedContainers === Set { containerB, containerC, containerA }
 *
 * visitor(provB, containerA)
 * providerToPath === Map {
 *   provD => [containerA, containerB],
 *   provE => [containerA, containerB],
 *   provF => [containerA, containerC],
 *   provG => [containerA, containerC],
 *   provA => [containerA]
 *   provB => [containerA]
 * }
 * visitedContainers === Set { containerB, containerC, containerA }
 * ```
 *
 * @param providerToPath Map map of providers to paths that this function fills
 * @param visitedContainers Set a set to keep track of the containers we've already visited
 * @return function(provider SingleProvider, container: Type<unknown> | InjectorType<unknown>) =>
 *     void
 */
function walkProviderTreeToDiscoverImportPaths(providerToPath, visitedContainers) {
    return (provider, container) => {
        // If the provider is not already in the providerToPath map,
        // add an entry with the provider as the key and an array containing the current container as
        // the value
        if (!providerToPath.has(provider)) {
            providerToPath.set(provider, [container]);
        }
        // This block will run exactly once for each container in the import tree.
        // This is where we run the logic to check the imports array of the current
        // container to see if it's the next container in the path for our currently
        // discovered providers.
        if (!visitedContainers.has(container)) {
            // Iterate through the providers we've already seen
            for (const prov of providerToPath.keys()) {
                const existingImportPath = providerToPath.get(prov);
                let containerDef = getInjectorDef(container);
                if (!containerDef) {
                    const ngModule = container.ngModule;
                    containerDef = getInjectorDef(ngModule);
                }
                if (!containerDef) {
                    return;
                }
                const lastContainerAddedToPath = existingImportPath[0];
                let isNextStepInPath = false;
                deepForEach(containerDef.imports, (moduleImport) => {
                    if (isNextStepInPath) {
                        return;
                    }
                    isNextStepInPath =
                        moduleImport.ngModule === lastContainerAddedToPath ||
                            moduleImport === lastContainerAddedToPath;
                    if (isNextStepInPath) {
                        providerToPath.get(prov)?.unshift(container);
                    }
                });
            }
        }
        visitedContainers.add(container);
    };
}
/**
 * Gets the providers configured on an EnvironmentInjector
 *
 * @param injector EnvironmentInjector
 * @returns an array of objects representing the providers of the given injector
 */
function getEnvironmentInjectorProviders(injector) {
    const providerRecordsWithoutImportPaths = getFrameworkDIDebugData().resolverToProviders.get(injector) ?? [];
    // platform injector has no provider imports container so can we skip trying to
    // find import paths
    if (isPlatformInjector(injector)) {
        return providerRecordsWithoutImportPaths;
    }
    const providerImportsContainer = getProviderImportsContainer(injector);
    if (providerImportsContainer === null) {
        // We assume that if an environment injector exists without an associated provider imports
        // container, it was created without such a container. Some examples cases where this could
        // happen:
        // - The root injector of a standalone application
        // - A router injector created by using the providers array in a lazy loaded route
        // - A manually created injector that is attached to the injector tree
        // Since each of these cases has no provider container, there is no concept of import paths,
        // so we can simply return the provider records.
        return providerRecordsWithoutImportPaths;
    }
    const providerToPath = getProviderImportPaths(providerImportsContainer);
    const providerRecords = [];
    for (const providerRecord of providerRecordsWithoutImportPaths) {
        const provider = providerRecord.provider;
        // Ignore these special providers for now until we have a cleaner way of
        // determing when they are provided by the framework vs provided by the user.
        const token = provider.provide;
        if (token === ENVIRONMENT_INITIALIZER || token === INJECTOR_DEF_TYPES) {
            continue;
        }
        let importPath = providerToPath.get(provider) ?? [];
        const def = getComponentDef(providerImportsContainer);
        const isStandaloneComponent = !!def?.standalone;
        // We prepend the component constructor in the standalone case
        // because walkProviderTree does not visit this constructor during it's traversal
        if (isStandaloneComponent) {
            importPath = [providerImportsContainer, ...importPath];
        }
        providerRecords.push({ ...providerRecord, importPath });
    }
    return providerRecords;
}
function isPlatformInjector(injector) {
    return injector instanceof R3Injector && injector.scopes.has('platform');
}
/**
 * Gets the providers configured on an injector.
 *
 * @param injector the injector to lookup the providers of
 * @returns ProviderRecord[] an array of objects representing the providers of the given injector
 */
export function getInjectorProviders(injector) {
    if (injector instanceof NodeInjector) {
        return getNodeInjectorProviders(injector);
    }
    else if (injector instanceof EnvironmentInjector) {
        return getEnvironmentInjectorProviders(injector);
    }
    throwError('getInjectorProviders only supports NodeInjector and EnvironmentInjector');
}
/**
 *
 * Given an injector, this function will return
 * an object containing the type and source of the injector.
 *
 * |              | type        | source                                                      |
 * |--------------|-------------|-------------------------------------------------------------|
 * | NodeInjector | element     | DOM element that created this injector                      |
 * | R3Injector   | environment | `injector.source`                                           |
 * | NullInjector | null        | null                                                        |
 *
 * @param injector the Injector to get metadata for
 * @returns an object containing the type and source of the given injector. If the injector metadata
 *     cannot be determined, returns null.
 */
export function getInjectorMetadata(injector) {
    if (injector instanceof NodeInjector) {
        const lView = getNodeInjectorLView(injector);
        const tNode = getNodeInjectorTNode(injector);
        assertTNodeForLView(tNode, lView);
        return { type: 'element', source: getNativeByTNode(tNode, lView) };
    }
    if (injector instanceof R3Injector) {
        return { type: 'environment', source: injector.source ?? null };
    }
    if (injector instanceof NullInjector) {
        return { type: 'null', source: null };
    }
    return null;
}
export function getInjectorResolutionPath(injector) {
    const resolutionPath = [injector];
    getInjectorResolutionPathHelper(injector, resolutionPath);
    return resolutionPath;
}
function getInjectorResolutionPathHelper(injector, resolutionPath) {
    const parent = getInjectorParent(injector);
    // if getInjectorParent can't find a parent, then we've either reached the end
    // of the path, or we need to move from the Element Injector tree to the
    // module injector tree using the first injector in our path as the connection point.
    if (parent === null) {
        if (injector instanceof NodeInjector) {
            const firstInjector = resolutionPath[0];
            if (firstInjector instanceof NodeInjector) {
                const moduleInjector = getModuleInjectorOfNodeInjector(firstInjector);
                if (moduleInjector === null) {
                    throwError('NodeInjector must have some connection to the module injector tree');
                }
                resolutionPath.push(moduleInjector);
                getInjectorResolutionPathHelper(moduleInjector, resolutionPath);
            }
            return resolutionPath;
        }
    }
    else {
        resolutionPath.push(parent);
        getInjectorResolutionPathHelper(parent, resolutionPath);
    }
    return resolutionPath;
}
/**
 * Gets the parent of an injector.
 *
 * This function is not able to make the jump from the Element Injector Tree to the Module
 * injector tree. This is because the "parent" (the next step in the reoslution path)
 * of a root NodeInjector is dependent on which NodeInjector ancestor initiated
 * the DI lookup. See getInjectorResolutionPath for a function that can make this jump.
 *
 * In the below diagram:
 * ```ts
 * getInjectorParent(NodeInjectorB)
 *  > NodeInjectorA
 * getInjectorParent(NodeInjectorA) // or getInjectorParent(getInjectorParent(NodeInjectorB))
 *  > null // cannot jump to ModuleInjector tree
 * ```
 *
 * ```
 *                ┌───────┐                ┌───────────────────┐
 *    ┌───────────┤ModuleA├───Injector────►│EnvironmentInjector│
 *    │           └───┬───┘                └───────────────────┘
 *    │               │
 *    │           bootstraps
 *    │               │
 *    │               │
 *    │          ┌────▼─────┐                 ┌─────────────┐
 * declares      │ComponentA├────Injector────►│NodeInjectorA│
 *    │          └────┬─────┘                 └─────▲───────┘
 *    │               │                             │
 *    │            renders                        parent
 *    │               │                             │
 *    │          ┌────▼─────┐                 ┌─────┴───────┐
 *    └─────────►│ComponentB├────Injector────►│NodeInjectorB│
 *               └──────────┘                 └─────────────┘
 *```
 *
 * @param injector an Injector to get the parent of
 * @returns Injector the parent of the given injector
 */
function getInjectorParent(injector) {
    if (injector instanceof R3Injector) {
        return injector.parent;
    }
    let tNode;
    let lView;
    if (injector instanceof NodeInjector) {
        tNode = getNodeInjectorTNode(injector);
        lView = getNodeInjectorLView(injector);
    }
    else if (injector instanceof NullInjector) {
        return null;
    }
    else if (injector instanceof ChainedInjector) {
        return injector.parentInjector;
    }
    else {
        throwError('getInjectorParent only support injectors of type R3Injector, NodeInjector, NullInjector, ChainedInjector');
    }
    const parentLocation = getParentInjectorLocation(tNode, lView);
    if (hasParentInjector(parentLocation)) {
        const parentInjectorIndex = getParentInjectorIndex(parentLocation);
        const parentLView = getParentInjectorView(parentLocation, lView);
        const parentTView = parentLView[TVIEW];
        const parentTNode = parentTView.data[parentInjectorIndex + 8 /* NodeInjectorOffset.TNODE */];
        return new NodeInjector(parentTNode, parentLView);
    }
    else {
        const chainedInjector = lView[INJECTOR];
        // Case where chainedInjector.injector is an OutletInjector and chainedInjector.injector.parent
        // is a NodeInjector.
        // todo(aleksanderbodurri): ideally nothing in packages/core should deal
        // directly with router concerns. Refactor this so that we can make the jump from
        // NodeInjector -> OutletInjector -> NodeInjector
        // without explicitly relying on types contracts from packages/router
        const injectorParent = chainedInjector.injector?.parent;
        if (injectorParent instanceof NodeInjector) {
            return injectorParent;
        }
    }
    return null;
}
/**
 * Gets the module injector of a NodeInjector.
 *
 * @param injector NodeInjector to get module injector of
 * @returns Injector representing module injector of the given NodeInjector
 */
function getModuleInjectorOfNodeInjector(injector) {
    let lView;
    if (injector instanceof NodeInjector) {
        lView = getNodeInjectorLView(injector);
    }
    else {
        throwError('getModuleInjectorOfNodeInjector must be called with a NodeInjector');
    }
    const inj = lView[INJECTOR];
    const moduleInjector = inj instanceof ChainedInjector ? inj.parentInjector : inj.parent;
    if (!moduleInjector) {
        throwError('NodeInjector must have some connection to the module injector tree');
    }
    return moduleInjector;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5qZWN0b3JfZGlzY292ZXJ5X3V0aWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvcmVuZGVyMy91dGlsL2luamVjdG9yX2Rpc2NvdmVyeV91dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsdUJBQXVCLEVBQUMsTUFBTSw0QkFBNEIsQ0FBQztBQUduRSxPQUFPLEVBQUMsY0FBYyxFQUFlLE1BQU0seUJBQXlCLENBQUM7QUFHckUsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0sMEJBQTBCLENBQUM7QUFDNUQsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQ3BELE9BQU8sRUFBaUIsZ0JBQWdCLEVBQUMsTUFBTSw4QkFBOEIsQ0FBQztBQUM5RSxPQUFPLEVBQUMsbUJBQW1CLEVBQUUsVUFBVSxFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFFckUsT0FBTyxFQUFDLFdBQVcsSUFBSSxzQkFBc0IsRUFBQyxNQUFNLGdDQUFnQyxDQUFDO0FBQ3JGLE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUNuRCxPQUFPLEVBQWdCLFVBQVUsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQzVELE9BQU8sRUFBQyxXQUFXLEVBQUUsbUJBQW1CLEVBQUMsTUFBTSxXQUFXLENBQUM7QUFDM0QsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBQ2pELE9BQU8sRUFBQyx1QkFBdUIsRUFBQyxNQUFNLHNDQUFzQyxDQUFDO0FBRTdFLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDOUMsT0FBTyxFQUNMLG9CQUFvQixFQUNwQixvQkFBb0IsRUFDcEIseUJBQXlCLEVBQ3pCLFlBQVksR0FDYixNQUFNLE9BQU8sQ0FBQztBQUlmLE9BQU8sRUFBQyxRQUFR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QztJQUNuRixDQUFDO0lBRUQsTUFBTSxHQUFHLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBaUMsQ0FBQztJQUM1RCxNQUFNLGNBQWMsR0FBRyxHQUFHLFlBQVksZUFBZSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDO0lBQ3hGLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUNwQixVQUFVLENBQUMsb0VBQW9FLENBQUMsQ0FBQztJQUNuRixDQUFDO0lBRUQsT0FBTyxjQUFjLENBQUM7QUFDeEIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0VOVklST05NRU5UX0lOSVRJQUxJWkVSfSBmcm9tICcuLi8uLi9kaS9pbml0aWFsaXplcl90b2tlbic7XG5pbXBvcnQge0luamVjdGlvblRva2VufSBmcm9tICcuLi8uLi9kaS9pbmplY3Rpb25fdG9rZW4nO1xuaW1wb3J0IHtJbmplY3Rvcn0gZnJvbSAnLi4vLi4vZGkvaW5qZWN0b3InO1xuaW1wb3J0IHtnZXRJbmplY3RvckRlZiwgSW5qZWN0b3JUeXBlfSBmcm9tICcuLi8uLi9kaS9pbnRlcmZhY2UvZGVmcyc7XG5pbXBvcnQge0luamVjdEZsYWdzLCBJbnRlcm5hbEluamVjdEZsYWdzfSBmcm9tICcuLi8uLi9kaS9pbnRlcmZhY2UvaW5qZWN0b3InO1xuaW1wb3J0IHtWYWx1ZVByb3ZpZGVyfSBmcm9tICcuLi8uLi9kaS9pbnRlcmZhY2UvcHJvdmlkZXInO1xuaW1wb3J0IHtJTkpFQ1RPUl9ERUZfVFlQRVN9IGZyb20gJy4uLy4uL2RpL2ludGVybmFsX3Rva2Vucyc7XG5pbXBvcnQge051bGxJbmplY3Rvcn0gZnJvbSAnLi4vLi4vZGkvbnVsbF9pbmplY3Rvcic7XG5pbXBvcnQge1NpbmdsZVByb3ZpZGVyLCB3YWxrUHJvdmlkZXJUcmVlfSBmcm9tICcuLi8uLi9kaS9wcm92aWRlcl9jb2xsZWN0aW9uJztcbmltcG9ydCB7RW52aXJvbm1lbnRJbmplY3RvciwgUjNJbmplY3Rvcn0gZnJvbSAnLi4vLi4vZGkvcjNfaW5qZWN0b3InO1xuaW1wb3J0IHtUeXBlfSBmcm9tICcuLi8uLi9pbnRlcmZhY2UvdHlwZSc7XG5pbXBvcnQge05nTW9kdWxlUmVmIGFzIHZpZXdFbmdpbmVfTmdNb2R1bGVSZWZ9IGZyb20gJy4uLy4uL2xpbmtlci9uZ19tb2R1bGVfZmFjdG9yeSc7XG5pbXBvcnQge2RlZXBGb3JFYWNofSBmcm9tICcuLi8uLi91dGlsL2FycmF5X3V0aWxzJztcbmltcG9ydCB7YXNzZXJ0RGVmaW5lZCwgdGhyb3dFcnJvcn0gZnJvbSAnLi4vLi4vdXRpbC9hc3NlcnQnO1xuaW1wb3J0IHthc3NlcnRUTm9kZSwgYXNzZXJ0VE5vZGVGb3JMVmlld30gZnJvbSAnLi4vYXNzZXJ0JztcbmltcG9ydCB7Q2hhaW5lZEluamVjdG9yfSBmcm9tICcuLi9jb21wb25lbnRfcmVmJztcbmltcG9ydCB7Z2V0RnJhbWV3b3JrRElEZWJ1Z0RhdGF9IGZyb20gJy4uL2RlYnVnL2ZyYW1ld29ya19pbmplY3Rvcl9wcm9maWxlcic7XG5pbXBvcnQge0luamVjdGVkU2VydmljZSwgUHJvdmlkZXJSZWNvcmR9IGZyb20gJy4uL2RlYnVnL2luamVjdG9yX3Byb2ZpbGVyJztcbmltcG9ydCB7Z2V0Q29tcG9uZW50RGVmfSBmcm9tICcuLi9kZWZpbml0aW9uJztcbmltcG9ydCB7XG4gIGdldE5vZGVJbmplY3RvckxWaWV3LFxuICBnZXROb2RlSW5qZWN0b3JUTm9kZSxcbiAgZ2V0UGFyZW50SW5qZWN0b3JMb2NhdGlvbixcbiAgTm9kZUluamVjdG9yLFxufSBmcm9tICcuLi9kaSc7XG5pbXBvcnQge05vZGVJbmplY3Rvck9mZnNldH0gZnJvbSAnLi4vaW50ZXJmYWNlcy9pbmplY3Rvcic7XG5pbXBvcnQge1RDb250YWluZXJOb2RlLCBURWxlbWVudENvbnRhaW5lck5vZGUsIFRFbGVtZW50Tm9kZSwgVE5vZGV9IGZyb20gJy4uL2ludGVyZmFjZXMvbm9kZSc7XG5pbXBvcnQge1JFbGVtZW50fSBmcm9tICcuLi9pbnRlcmZhY2VzL3JlbmRlcmVyX2RvbSc7XG5pbXBvcnQge0lOSkVDVE9SLCBMVmlldywgVFZJRVd9IGZyb20gJy4uL2ludGVyZmFjZXMvdmlldyc7XG5cbmltcG9ydCB7Z2V0UGFyZW50SW5qZWN0b3JJbmRleCwgZ2V0UGFyZW50SW5qZWN0b3JWaWV3LCBoYXNQYXJlbnRJbmplY3Rvcn0gZnJvbSAnLi9pbmplY3Rvcl91dGlscyc7XG5pbXBvcnQge2dldE5hdGl2ZUJ5VE5vZGV9IGZyb20gJy4vdmlld191dGlscyc7XG5cbi8qKlxuICogRGlzY292ZXJzIHRoZSBkZXBlbmRlbmNpZXMgb2YgYW4gaW5qZWN0YWJsZSBpbnN0YW5jZS4gUHJvdmlkZXMgREkgaW5mb3JtYXRpb24gYWJvdXQgZWFjaFxuICogZGVwZW5kZW5jeSB0aGF0IHRoZSBpbmplY3RhYmxlIHdhcyBpbnN0YW50aWF0ZWQgd2l0aCwgaW5jbHVkaW5nIHdoZXJlIHRoZXkgd2VyZSBwcm92aWRlZCBmcm9tLlxuICpcbiAqIEBwYXJhbSBpbmplY3RvciBBbiBpbmplY3RvciBpbnN0YW5jZVxuICogQHBhcmFtIHRva2VuIGEgREkgdG9rZW4gdGhhdCB3YXMgY29uc3RydWN0ZWQgYnkgdGhlIGdpdmVuIGluamVjdG9yIGluc3RhbmNlXG4gKiBAcmV0dXJucyBhbiBvYmplY3QgdGhhdCBjb250YWlucyB0aGUgY3JlYXRlZCBpbnN0YW5jZSBvZiB0b2tlbiBhcyB3ZWxsIGFzIGFsbCBvZiB0aGUgZGVwZW5kZW5jaWVzXG4gKiB0aGF0IGl0IHdhcyBpbnN0YW50aWF0ZWQgd2l0aCBPUiB1bmRlZmluZWQgaWYgdGhlIHRva2VuIHdhcyBub3QgY3JlYXRlZCB3aXRoaW4gdGhlIGdpdmVuXG4gKiBpbmplY3Rvci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldERlcGVuZGVuY2llc0Zyb21JbmplY3RhYmxlPFQ+KFxuICBpbmplY3RvcjogSW5qZWN0b3IsXG4gIHRva2VuOiBUeXBlPFQ+IHwgSW5qZWN0aW9uVG9rZW48VD4sXG4pOiB7aW5zdGFuY2U6IFQ7IGRlcGVuZGVuY2llczogT21pdDxJbmplY3RlZFNlcnZpY2UsICdpbmplY3RlZEluJz5bXX0gfCB1bmRlZmluZWQge1xuICAvLyBGaXJzdCB3ZSBjaGVjayB0byBzZWUgaWYgdGhlIHRva2VuIGdpdmVuIG1hcHMgdG8gYW4gYWN0dWFsIGluc3RhbmNlIGluIHRoZSBpbmplY3RvciBnaXZlbi5cbiAgLy8gV2UgdXNlIGBzZWxmOiB0cnVlYCBiZWNhdXNlIHdlIG9ubHkgd2FudCB0byBsb29rIGF0IHRoZSBpbmplY3RvciB3ZSB3ZXJlIGdpdmVuLlxuICAvLyBXZSB1c2UgYG9wdGlvbmFsOiB0cnVlYCBiZWNhdXNlIGl0J3MgcG9zc2libGUgdGhhdCB0aGUgdG9rZW4gd2Ugd2VyZSBnaXZlbiB3YXMgbmV2ZXJcbiAgLy8gY29uc3RydWN0ZWQgYnkgdGhlIGluamVjdG9yIHdlIHdlcmUgZ2l2ZW4uXG4gIGNvbnN0IGluc3RhbmNlID0gaW5qZWN0b3IuZ2V0KHRva2VuLCBudWxsLCB7c2VsZjogdHJ1ZSwgb3B0aW9uYWw6IHRydWV9KTtcbiAgaWYgKGluc3RhbmNlID09PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBVbmFibGUgdG8gZGV0ZXJtaW5lIGluc3RhbmNlIG9mICR7dG9rZW59IGluIGdpdmVuIGluamVjdG9yYCk7XG4gIH1cblxuICBjb25zdCB1bmZvcm1hdHRlZERlcGVuZGVuY2llcyA9IGdldERlcGVuZGVuY2llc0ZvclRva2VuSW5JbmplY3Rvcih0b2tlbiwgaW5qZWN0b3IpO1xuICBjb25zdCByZXNvbHV0aW9uUGF0aCA9IGdldEluamVjdG9yUmVzb2x1dGlvblBhdGgoaW5qZWN0b3IpO1xuXG4gIGNvbnN0IGRlcGVuZGVuY2llcyA9IHVuZm9ybWF0dGVkRGVwZW5kZW5jaWVzLm1hcCgoZGVwKSA9PiB7XG4gICAgLy8gaW5qZWN0ZWRJbiBjb250YWlucyBwcml2YXRlIGZpZWxkcywgc28gd2Ugb21pdCBpdCBmcm9tIHRoZSByZXNwb25zZVxuICAgIGNvbnN0IGZvcm1hdHRlZERlcGVuZGVuY3k6IE9taXQ8SW5qZWN0ZWRTZXJ2aWNlLCAnaW5qZWN0ZWRJbic+ID0ge1xuICAgICAgdmFsdWU6IGRlcC52YWx1ZSxcbiAgICB9O1xuXG4gICAgLy8gY29udmVydCBpbmplY3Rpb24gZmxhZ3MgdG8gYm9vbGVhbnNcbiAgICBjb25zdCBmbGFncyA9IGRlcC5mbGFncyBhcyBJbnRlcm5hbEluamVjdEZsYWdzO1xuICAgIGZvcm1hdHRlZERlcGVuZGVuY3kuZmxhZ3MgPSB7XG4gICAgICBvcHRpb25hbDogKEludGVybmFsSW5qZWN0RmxhZ3MuT3B0aW9uYWwgJiBmbGFncykgPT09IEludGVybmFsSW5qZWN0RmxhZ3MuT3B0aW9uYWwsXG4gICAgICBob3N0OiAoSW50ZXJuYWxJbmplY3RGbGFncy5Ib3N0ICYgZmxhZ3MpID09PSBJbnRlcm5hbEluamVjdEZsYWdzLkhvc3QsXG4gICAgICBzZWxmOiAoSW50ZXJuYWxJbmplY3RGbGFncy5TZWxmICYgZmxhZ3MpID09PSBJbnRlcm5hbEluamVjdEZsYWdzLlNlbGYsXG4gICAgICBza2lwU2VsZjogKEludGVybmFsSW5qZWN0RmxhZ3MuU2tpcFNlbGYgJiBmbGFncykgPT09IEludGVybmFsSW5qZWN0RmxhZ3MuU2tpcFNlbGYsXG4gICAgfTtcblxuICAgIC8vIGZpbmQgdGhlIGluamVjdG9yIHRoYXQgcHJvdmlkZWQgdGhlIGRlcGVuZGVuY3lcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJlc29sdXRpb25QYXRoLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBpbmplY3RvclRvQ2hlY2sgPSByZXNvbHV0aW9uUGF0aFtpXTtcblxuICAgICAgLy8gaWYgc2tpcFNlbGYgaXMgdHJ1ZSB3ZSBza2lwIHRoZSBmaXJzdCBpbmplY3RvclxuICAgICAgaWYgKGkgPT09IDAgJiYgZm9ybWF0dGVkRGVwZW5kZW5jeS5mbGFncy5za2lwU2VsZikge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gaG9zdCBvbmx5IGFwcGxpZXMgdG8gTm9kZUluamVjdG9yc1xuICAgICAgaWYgKGZvcm1hdHRlZERlcGVuZGVuY3kuZmxhZ3MuaG9zdCAmJiBpbmplY3RvclRvQ2hlY2sgaW5zdGFuY2VvZiBFbnZpcm9ubWVudEluamVjdG9yKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBpbnN0YW5jZSA9IGluamVjdG9yVG9DaGVjay5nZXQoZGVwLnRva2VuIGFzIFR5cGU8dW5rbm93bj4sIG51bGwsIHtcbiAgICAgICAgc2VsZjogdHJ1ZSxcbiAgICAgICAgb3B0aW9uYWw6IHRydWUsXG4gICAgICB9KTtcblxuICAgICAgaWYgKGluc3RhbmNlICE9PSBudWxsKSB7XG4gICAgICAgIC8vIGlmIGhvc3QgZmxhZyBpcyB0cnVlIHdlIGRvdWJsZSBjaGVjayB0aGF0IHdlIGNhbiBnZXQgdGhlIHNlcnZpY2UgZnJvbSB0aGUgZmlyc3QgZWxlbWVudFxuICAgICAgICAvLyBpbiB0aGUgcmVzb2x1dGlvbiBwYXRoIGJ5IHVzaW5nIHRoZSBob3N0IGZsYWcuIFRoaXMgaXMgZG9uZSB0byBtYWtlIHN1cmUgdGhhdCB3ZSd2ZSBmb3VuZFxuICAgICAgICAvLyB0aGUgY29ycmVjdCBwcm92aWRpbmcgaW5qZWN0b3IsIGFuZCBub3QgYSBub2RlIGluamVjdG9yIHRoYXQgaXMgY29ubmVjdGVkIHRvIG91ciBwYXRoIHZpYVxuICAgICAgICAvLyBhIHJvdXRlciBvdXRsZXQuXG4gICAgICAgIGlmIChmb3JtYXR0ZWREZXBlbmRlbmN5LmZsYWdzLmhvc3QpIHtcbiAgICAgICAgICBjb25zdCBmaXJzdEluamVjdG9yID0gcmVzb2x1dGlvblBhdGhbMF07XG4gICAgICAgICAgY29uc3QgbG9va3VwRnJvbUZpcnN0SW5qZWN0b3IgPSBmaXJzdEluamVjdG9yLmdldChkZXAudG9rZW4gYXMgVHlwZTx1bmtub3duPiwgbnVsbCwge1xuICAgICAgICAgICAgLi4uZm9ybWF0dGVkRGVwZW5kZW5jeS5mbGFncyxcbiAgICAgICAgICAgIG9wdGlvbmFsOiB0cnVlLFxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgaWYgKGxvb2t1cEZyb21GaXJzdEluamVjdG9yICE9PSBudWxsKSB7XG4gICAgICAgICAgICBmb3JtYXR0ZWREZXBlbmRlbmN5LnByb3ZpZGVkSW4gPSBpbmplY3RvclRvQ2hlY2s7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBmb3JtYXR0ZWREZXBlbmRlbmN5LnByb3ZpZGVkSW4gPSBpbmplY3RvclRvQ2hlY2s7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICAvLyBpZiBzZWxmIGlzIHRydWUgd2Ugc3RvcCBhZnRlciB0aGUgZmlyc3QgaW5qZWN0b3JcbiAgICAgIGlmIChpID09PSAwICYmIGZvcm1hdHRlZERlcGVuZGVuY3kuZmxhZ3Muc2VsZikge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZGVwLnRva2VuKSBmb3JtYXR0ZWREZXBlbmRlbmN5LnRva2VuID0gZGVwLnRva2VuO1xuXG4gICAgcmV0dXJuIGZvcm1hdHRlZERlcGVuZGVuY3k7XG4gIH0pO1xuXG4gIHJldHVybiB7aW5zdGFuY2UsIGRlcGVuZGVuY2llc307XG59XG5cbmZ1bmN0aW9uIGdldERlcGVuZGVuY2llc0ZvclRva2VuSW5JbmplY3RvcjxUPihcbiAgdG9rZW46IFR5cGU8VD4gfCBJbmplY3Rpb25Ub2tlbjxUPixcbiAgaW5qZWN0b3I6IEluamVjdG9yLFxuKTogSW5qZWN0ZWRTZXJ2aWNlW10ge1xuICBjb25zdCB7cmVzb2x2ZXJUb1Rva2VuVG9EZXBlbmRlbmNpZXN9ID0gZ2V0RnJhbWV3b3JrRElEZWJ1Z0RhdGEoKTtcblxuICBpZiAoIShpbmplY3RvciBpbnN0YW5jZW9mIE5vZGVJbmplY3RvcikpIHtcbiAgICByZXR1cm4gcmVzb2x2ZXJUb1Rva2VuVG9EZXBlbmRlbmNpZXMuZ2V0KGluamVjdG9yKT8uZ2V0Py4odG9rZW4gYXMgVHlwZTxUPikgPz8gW107XG4gIH1cblxuICBjb25zdCBsVmlldyA9IGdldE5vZGVJbmplY3RvckxWaWV3KGluamVjdG9yKTtcbiAgY29uc3QgdG9rZW5EZXBlbmRlbmN5TWFwID0gcmVzb2x2ZXJUb1Rva2VuVG9EZXBlbmRlbmNpZXMuZ2V0KGxWaWV3KTtcbiAgY29uc3QgZGVwZW5kZW5jaWVzID0gdG9rZW5EZXBlbmRlbmN5TWFwPy5nZXQodG9rZW4gYXMgVHlwZTxUPikgPz8gW107XG5cbiAgLy8gSW4gdGhlIE5vZGVJbmplY3RvciBjYXNlLCBhbGwgaW5qZWN0aW9ucyBmb3IgZXZlcnkgbm9kZSBhcmUgc3RvcmVkIGluIHRoZSBzYW1lIGxWaWV3LlxuICAvLyBXZSB1c2UgdGhlIGluamVjdGVkSW4gZmllbGQgb2YgdGhlIGRlcGVuZGVuY3kgdG8gZmlsdGVyIG91dCB0aGUgZGVwZW5kZW5jaWVzIHRoYXRcbiAgLy8gZG8gbm90IGNvbWUgZnJvbSB0aGUgc2FtZSBub2RlIGFzIHRoZSBpbnN0YW5jZSB3ZSdyZSBsb29raW5nIGF0LlxuICByZXR1cm4gZGVwZW5kZW5jaWVzLmZpbHRlcigoZGVwZW5kZW5jeSkgPT4ge1xuICAgIGNvbnN0IGRlcGVuZGVuY3lOb2RlID0gZGVwZW5kZW5jeS5pbmplY3RlZEluPy50Tm9kZTtcbiAgICBpZiAoZGVwZW5kZW5jeU5vZGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IGluc3RhbmNlTm9kZSA9IGdldE5vZGVJbmplY3RvclROb2RlKGluamVjdG9yKTtcbiAgICBhc3NlcnRUTm9kZShkZXBlbmRlbmN5Tm9kZSk7XG4gICAgYXNzZXJ0VE5vZGUoaW5zdGFuY2VOb2RlISk7XG5cbiAgICByZXR1cm4gZGVwZW5kZW5jeU5vZGUgPT09IGluc3RhbmNlTm9kZTtcbiAgfSk7XG59XG5cbi8qKlxuICogR2V0cyB0aGUgY2xhc3MgYXNzb2NpYXRlZCB3aXRoIGFuIGluamVjdG9yIHRoYXQgY29udGFpbnMgYSBwcm92aWRlciBgaW1wb3J0c2AgYXJyYXkgaW4gaXQnc1xuICogZGVmaW5pdGlvblxuICpcbiAqIEZvciBNb2R1bGUgSW5qZWN0b3JzIHRoaXMgcmV0dXJucyB0aGUgTmdNb2R1bGUgY29uc3RydWN0b3IuXG4gKlxuICogRm9yIFN0YW5kYWxvbmUgaW5qZWN0b3JzIHRoaXMgcmV0dXJucyB0aGUgc3RhbmRhbG9uZSBjb21wb25lbnQgY29uc3RydWN0b3IuXG4gKlxuICogQHBhcmFtIGluamVjdG9yIEluamVjdG9yIGFuIGluamVjdG9yIGluc3RhbmNlXG4gKiBAcmV0dXJucyB0aGUgY29uc3RydWN0b3Igd2hlcmUgdGhlIGBpbXBvcnRzYCBhcnJheSB0aGF0IGNvbmZpZ3VyZXMgdGhpcyBpbmplY3RvciBpcyBsb2NhdGVkXG4gKi9cbmZ1bmN0aW9uIGdldFByb3ZpZGVySW1wb3J0c0NvbnRhaW5lcihpbmplY3RvcjogSW5qZWN0b3IpOiBUeXBlPHVua25vd24+IHwgbnVsbCB7XG4gIGNvbnN0IHtzdGFuZGFsb25lSW5qZWN0b3JUb0NvbXBvbmVudH0gPSBnZXRGcmFtZXdvcmtESURlYnVnRGF0YSgpO1xuXG4gIC8vIHN0YW5kYWxvbmUgY29tcG9uZW50cyBjb25maWd1cmUgcHJvdmlkZXJzIHRocm91Z2ggYSBjb21wb25lbnQgZGVmLCBzbyB3ZSBoYXZlIHRvXG4gIC8vIHVzZSB0aGUgc3RhbmRhbG9uZSBjb21wb25lbnQgYXNzb2NpYXRlZCB3aXRoIHRoaXMgaW5qZWN0b3IgaWYgSW5qZWN0b3IgcmVwcmVzZW50c1xuICAvLyBhIHN0YW5kYWxvbmUgY29tcG9uZW50cyBFbnZpcm9ubWVudEluamVjdG9yXG4gIGlmIChzdGFuZGFsb25lSW5qZWN0b3JUb0NvbXBvbmVudC5oYXMoaW5qZWN0b3IpKSB7XG4gICAgcmV0dXJuIHN0YW5kYWxvbmVJbmplY3RvclRvQ29tcG9uZW50LmdldChpbmplY3RvcikhO1xuICB9XG5cbiAgLy8gTW9kdWxlIGluamVjdG9ycyBjb25maWd1cmUgcHJvdmlkZXJzIHRocm91Z2ggdGhlaXIgTmdNb2R1bGUgZGVmLCBzbyB3ZSB1c2UgdGhlXG4gIC8vIGluamVjdG9yIHRvIGxvb2t1cCBpdHMgTmdNb2R1bGVSZWYgYW5kIHRocm91Z2ggdGhhdCBncmFiIGl0cyBpbnN0YW5jZVxuICBjb25zdCBkZWZUeXBlUmVmID0gaW5qZWN0b3IuZ2V0KHZpZXdFbmdpbmVfTmdNb2R1bGVSZWYsIG51bGwsIHtzZWxmOiB0cnVlLCBvcHRpb25hbDogdHJ1ZX0pITtcblxuICAvLyBJZiB3ZSBjYW4ndCBmaW5kIGFuIGFzc29jaWF0ZWQgaW1wb3J0cyBjb250YWluZXIsIHJldHVybiBudWxsLlxuICAvLyBUaGlzIGNvdWxkIGJlIHRoZSBjYXNlIGlmIHRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkIHdpdGggYW4gUjNJbmplY3RvciB0aGF0IGRvZXMgbm90IHJlcHJlc2VudFxuICAvLyBhIHN0YW5kYWxvbmUgY29tcG9uZW50IG9yIE5nTW9kdWxlLlxuICBpZiAoZGVmVHlwZVJlZiA9PT0gbnVsbCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLy8gSW4gc3RhbmRhbG9uZSBhcHBsaWNhdGlvbnMsIHRoZSByb290IGVudmlyb25tZW50IGluamVjdG9yIGNyZWF0ZWQgYnkgYm9vdHN0cmFwQXBwbGljYXRpb25cbiAgLy8gbWF5IGhhdmUgbm8gYXNzb2NpYXRlZCBcImluc3RhbmNlXCIuXG4gIGlmIChkZWZUeXBlUmVmLmluc3RhbmNlID09PSBudWxsKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICByZXR1cm4gZGVmVHlwZVJlZi5pbnN0YW5jZS5jb25zdHJ1Y3Rvcjtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBwcm92aWRlcnMgY29uZmlndXJlZCBvbiBhIE5vZGVJbmplY3RvclxuICpcbiAqIEBwYXJhbSBpbmplY3RvciBBIE5vZGVJbmplY3RvciBpbnN0YW5jZVxuICogQHJldHVybnMgUHJvdmlkZXJSZWNvcmRbXSBhbiBhcnJheSBvZiBvYmplY3RzIHJlcHJlc2VudGluZyB0aGUgcHJvdmlkZXJzIGNvbmZpZ3VyZWQgb24gdGhpc1xuICogICAgIGluamVjdG9yXG4gKi9cbmZ1bmN0aW9uIGdldE5vZGVJbmplY3RvclByb3ZpZGVycyhpbmplY3RvcjogTm9kZUluamVjdG9yKTogUHJvdmlkZXJSZWNvcmRbXSB7XG4gIGNvbnN0IGRpUmVzb2x2ZXIgPSBnZXROb2RlSW5qZWN0b3JUTm9kZShpbmplY3Rvcik7XG4gIGNvbnN0IHtyZXNvbHZlclRvUHJvdmlkZXJzfSA9IGdldEZyYW1ld29ya0RJRGVidWdEYXRhKCk7XG4gIHJldHVybiByZXNvbHZlclRvUHJvdmlkZXJzLmdldChkaVJlc29sdmVyIGFzIFROb2RlKSA/PyBbXTtcbn1cblxuLyoqXG4gKiBHZXRzIGEgbWFwcGluZyBvZiBwcm92aWRlcnMgY29uZmlndXJlZCBvbiBhbiBpbmplY3RvciB0byB0aGVpciBpbXBvcnQgcGF0aHNcbiAqXG4gKiBNb2R1bGVBIC0+IGltcG9ydHMgTW9kdWxlQlxuICogTW9kdWxlQiAtPiBpbXBvcnRzIE1vZHVsZUNcbiAqIE1vZHVsZUIgLT4gcHJvdmlkZXMgTXlTZXJ2aWNlQVxuICogTW9kdWxlQyAtPiBwcm92aWRlcyBNeVNlcnZpY2VCXG4gKlxuICogZ2V0UHJvdmlkZXJJbXBvcnRQYXRocyhNb2R1bGVBKVxuICogPiBNYXAoMikge1xuICogICBNeVNlcnZpY2VBID0+IFtNb2R1bGVBLCBNb2R1bGVCXVxuICogICBNeVNlcnZpY2VCID0+IFtNb2R1bGVBLCBNb2R1bGVCLCBNb2R1bGVDXVxuICogIH1cbiAqXG4gKiBAcGFyYW0gcHJvdmlkZXJJbXBvcnRzQ29udGFpbmVyIGNvbnN0cnVjdG9yIG9mIGNsYXNzIHRoYXQgY29udGFpbnMgYW4gYGltcG9ydHNgIGFycmF5IGluIGl0J3NcbiAqICAgICBkZWZpbml0aW9uXG4gKiBAcmV0dXJucyBBIE1hcCBvYmplY3QgdGhhdCBtYXBzIHByb3ZpZGVycyB0byBhbiBhcnJheSBvZiBjb25zdHJ1Y3RvcnMgcmVwcmVzZW50aW5nIGl0J3MgaW1wb3J0XG4gKiAgICAgcGF0aFxuICpcbiAqL1xuZnVuY3Rpb24gZ2V0UHJvdmlkZXJJbXBvcnRQYXRocyhcbiAgcHJvdmlkZXJJbXBvcnRzQ29udGFpbmVyOiBUeXBlPHVua25vd24+LFxuKTogTWFwPFNpbmdsZVByb3ZpZGVyLCAoVHlwZTx1bmtub3duPiB8IEluamVjdG9yVHlwZTx1bmtub3duPilbXT4ge1xuICBjb25zdCBwcm92aWRlclRvUGF0aCA9IG5ldyBNYXA8U2luZ2xlUHJvdmlkZXIsIChUeXBlPHVua25vd24+IHwgSW5qZWN0b3JUeXBlPHVua25vd24+KVtdPigpO1xuICBjb25zdCB2aXNpdGVkQ29udGFpbmVycyA9IG5ldyBTZXQ8VHlwZTx1bmtub3duPj4oKTtcbiAgY29uc3QgdmlzaXRvciA9IHdhbGtQcm92aWRlclRyZWVUb0Rpc2NvdmVySW1wb3J0UGF0aHMocHJvdmlkZXJUb1BhdGgsIHZpc2l0ZWRDb250YWluZXJzKTtcblxuICB3YWxrUHJvdmlkZXJUcmVlKHByb3ZpZGVySW1wb3J0c0NvbnRhaW5lciwgdmlzaXRvciwgW10sIG5ldyBTZXQoKSk7XG5cbiAgcmV0dXJuIHByb3ZpZGVyVG9QYXRoO1xufVxuXG4vKipcbiAqXG4gKiBIaWdoZXIgb3JkZXIgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGEgdmlzaXRvciBmb3IgV2Fsa1Byb3ZpZGVyVHJlZVxuICpcbiAqIFRha2VzIGluIGEgTWFwIGFuZCBTZXQgdG8ga2VlcCB0cmFjayBvZiB0aGUgcHJvdmlkZXJzIGFuZCBjb250YWluZXJzXG4gKiB2aXNpdGVkLCBzbyB0aGF0IHdlIGNhbiBkaXNjb3ZlciB0aGUgaW1wb3J0IHBhdGhzIG9mIHRoZXNlIHByb3ZpZGVyc1xuICogZHVyaW5nIHRoZSB0cmF2ZXJzYWwuXG4gKlxuICogVGhpcyB2aXNpdG9yIHRha2VzIGFkdmFudGFnZSBvZiB0aGUgZmFjdCB0aGF0IHdhbGtQcm92aWRlclRyZWUgcGVyZm9ybXMgYVxuICogcG9zdG9yZGVyIHRyYXZlcnNhbCBvZiB0aGUgcHJvdmlkZXIgdHJlZSBmb3IgdGhlIHBhc3NlZCBpbiBjb250YWluZXIuIEJlY2F1c2UgcG9zdG9yZGVyXG4gKiB0cmF2ZXJzYWwgcmVjdXJzaXZlbHkgcHJvY2Vzc2VzIHN1YnRyZWVzIGZyb20gbGVhZiBub2RlcyB1bnRpbCB0aGUgdHJhdmVyc2FsIHJlYWNoZXMgdGhlIHJvb3QsXG4gKiB3ZSB3cml0ZSBhIHZpc2l0b3IgdGhhdCBjb25zdHJ1Y3RzIHByb3ZpZGVyIGltcG9ydCBwYXRocyBpbiByZXZlcnNlLlxuICpcbiAqXG4gKiBXZSB1c2UgdGhlIHZpc2l0ZWRDb250YWluZXJzIHNldCBkZWZpbmVkIG91dHNpZGUgdGhpcyB2aXNpdG9yXG4gKiBiZWNhdXNlIHdlIHdhbnQgdG8gcnVuIHNvbWUgbG9naWMgb25seSBvbmNlIGZvclxuICogZWFjaCBjb250YWluZXIgaW4gdGhlIHRyZWUuIFRoYXQgbG9naWMgY2FuIGJlIGRlc2NyaWJlZCBhczpcbiAqXG4gKlxuICogMS4gZm9yIGVhY2ggZGlzY292ZXJlZF9wcm92aWRlciBhbmQgZGlzY292ZXJlZF9wYXRoIGluIHRoZSBpbmNvbXBsZXRlIHByb3ZpZGVyIHBhdGhzIHdlJ3ZlXG4gKiBhbHJlYWR5IGRpc2NvdmVyZWRcbiAqIDIuIGdldCB0aGUgZmlyc3QgY29udGFpbmVyIGluIGRpc2NvdmVyZWRfcGF0aFxuICogMy4gaWYgdGhhdCBmaXJzdCBjb250YWluZXIgaXMgaW4gdGhlIGltcG9ydHMgYXJyYXkgb2YgdGhlIGNvbnRhaW5lciB3ZSdyZSB2aXNpdGluZ1xuICogICAgVGhlbiB0aGUgY29udGFpbmVyIHdlJ3JlIHZpc2l0aW5nIGlzIGFsc28gaW4gdGhlIGltcG9ydCBwYXRoIG9mIGRpc2NvdmVyZWRfcHJvdmlkZXIsIHNvIHdlXG4gKiAgICB1bnNoaWZ0IGRpc2NvdmVyZWRfcGF0aCB3aXRoIHRoZSBjb250YWluZXIgd2UncmUgY3VycmVudGx5IHZpc2l0aW5nXG4gKlxuICpcbiAqIEV4YW1wbGUgUnVuOlxuICogYGBgXG4gKiAgICAgICAgICAgICAgICAg4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQXG4gKiAgICAgICAgICAgICAgICAg4pSCY29udGFpbmVyQeKUglxuICogICAgICDilIzilIBpbXBvcnRzLeKUgOKUpCAgICAgICAgICDilJzilIDilIBpbXBvcnRz4pSA4pSQXG4gKiAgICAgIOKUgiAgICAgICAgICDilIIgIHByb3ZBICAg4pSCICAgICAgICAgIOKUglxuICogICAgICDilIIgICAgICAgICAg4pSCICBwcm92QiAgIOKUgiAgICAgICAgICDilIJcbiAqICAgICAg4pSCICAgICAgICAgIOKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUmCAgICAgICAgICDilIJcbiAqICAgICAg4pSCICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIJcbiAqICAgICDilIzilrzilIDilIDilIDilIDilIDilIDilIDilIDilIDilJAgICAgICAgICAgICAg4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pa84pSA4pSQXG4gKiAgICAg4pSCY29udGFpbmVyQuKUgiAgICAgICAgICAgICDilIJjb250YWluZXJD4pSCXG4gKiAgICAg4pSCICAgICAgICAgIOKUgiAgICAgICAgICAgICDilIIgICAgICAgICAg4pSCXG4gKiAgICAg4pSCICBwcm92RCAgIOKUgiAgICAgICAgICAgICDilIIgIHByb3ZGICAg4pSCXG4gKiAgICAg4pSCICBwcm92RSAgIOKUgiAgICAgICAgICAgICDilIIgIHByb3ZHICAg4pSCXG4gKiAgICAg4pSU4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSYICAgICAgICAgICAgIOKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUmFxuICogYGBgXG4gKlxuICogRWFjaCBzdGVwIG9mIHRoZSB0cmF2ZXJzYWwsXG4gKlxuICogYGBgXG4gKiB2aXNpdG9yKHByb3ZELCBjb250YWluZXJCKVxuICogcHJvdmlkZXJUb1BhdGggPT09IE1hcCB7IHByb3ZEID0+IFtjb250YWluZXJCXSB9XG4gKiB2aXNpdGVkQ29udGFpbmVycyA9PT0gU2V0IHsgY29udGFpbmVyQiB9XG4gKlxuICogdmlzaXRvcihwcm92RSwgY29udGFpbmVyQilcbiAqIHByb3ZpZGVyVG9QYXRoID09PSBNYXAgeyBwcm92RCA9PiBbY29udGFpbmVyQl0sIHByb3ZFID0+IFtjb250YWluZXJCXSB9XG4gKiB2aXNpdGVkQ29udGFpbmVycyA9PT0gU2V0IHsgY29udGFpbmVyQiB9XG4gKlxuICogdmlzaXRvcihwcm92RiwgY29udGFpbmVyQylcbiAqIHByb3ZpZGVyVG9QYXRoID09PSBNYXAgeyBwcm92RCA9PiBbY29udGFpbmVyQl0sIHByb3ZFID0+IFtjb250YWluZXJCXSwgcHJvdkYgPT4gW2NvbnRhaW5lckNdIH1cbiAqIHZpc2l0ZWRDb250YWluZXJzID09PSBTZXQgeyBjb250YWluZXJCLCBjb250YWluZXJDIH1cbiAqXG4gKiB2aXNpdG9yKHByb3ZHLCBjb250YWluZXJDKVxuICogcHJvdmlkZXJUb1BhdGggPT09IE1hcCB7XG4gKiAgIHByb3ZEID0+IFtjb250YWluZXJCXSwgcHJvdkUgPT4gW2NvbnRhaW5lckJdLCBwcm92RiA9PiBbY29udGFpbmVyQ10sIHByb3ZHID0+IFtjb250YWluZXJDXVxuICogfVxuICogdmlzaXRlZENvbnRhaW5lcnMgPT09IFNldCB7IGNvbnRhaW5lckIsIGNvbnRhaW5lckMgfVxuICpcbiAqIHZpc2l0b3IocHJvdkEsIGNvbnRhaW5lckEpXG4gKiBwcm92aWRlclRvUGF0aCA9PT0gTWFwIHtcbiAqICAgcHJvdkQgPT4gW2NvbnRhaW5lckEsIGNvbnRhaW5lckJdLFxuICogICBwcm92RSA9PiBbY29udGFpbmVyQSwgY29udGFpbmVyQl0sXG4gKiAgIHByb3ZGID0+IFtjb250YWluZXJBLCBjb250YWluZXJDXSxcbiAqICAgcHJvdkcgPT4gW2NvbnRhaW5lckEsIGNvbnRhaW5lckNdLFxuICogICBwcm92QSA9PiBbY29udGFpbmVyQV1cbiAqIH1cbiAqIHZpc2l0ZWRDb250YWluZXJzID09PSBTZXQgeyBjb250YWluZXJCLCBjb250YWluZXJDLCBjb250YWluZXJBIH1cbiAqXG4gKiB2aXNpdG9yKHByb3ZCLCBjb250YWluZXJBKVxuICogcHJvdmlkZXJUb1BhdGggPT09IE1hcCB7XG4gKiAgIHByb3ZEID0+IFtjb250YWluZXJBLCBjb250YWluZXJCXSxcbiAqICAgcHJvdkUgPT4gW2NvbnRhaW5lckEsIGNvbnRhaW5lckJdLFxuICogICBwcm92RiA9PiBbY29udGFpbmVyQSwgY29udGFpbmVyQ10sXG4gKiAgIHByb3ZHID0+IFtjb250YWluZXJBLCBjb250YWluZXJDXSxcbiAqICAgcHJvdkEgPT4gW2NvbnRhaW5lckFdXG4gKiAgIHByb3ZCID0+IFtjb250YWluZXJBXVxuICogfVxuICogdmlzaXRlZENvbnRhaW5lcnMgPT09IFNldCB7IGNvbnRhaW5lckIsIGNvbnRhaW5lckMsIGNvbnRhaW5lckEgfVxuICogYGBgXG4gKlxuICogQHBhcmFtIHByb3ZpZGVyVG9QYXRoIE1hcCBtYXAgb2YgcHJvdmlkZXJzIHRvIHBhdGhzIHRoYXQgdGhpcyBmdW5jdGlvbiBmaWxsc1xuICogQHBhcmFtIHZpc2l0ZWRDb250YWluZXJzIFNldCBhIHNldCB0byBrZWVwIHRyYWNrIG9mIHRoZSBjb250YWluZXJzIHdlJ3ZlIGFscmVhZHkgdmlzaXRlZFxuICogQHJldHVybiBmdW5jdGlvbihwcm92aWRlciBTaW5nbGVQcm92aWRlciwgY29udGFpbmVyOiBUeXBlPHVua25vd24+IHwgSW5qZWN0b3JUeXBlPHVua25vd24+KSA9PlxuICogICAgIHZvaWRcbiAqL1xuZnVuY3Rpb24gd2Fsa1Byb3ZpZGVyVHJlZVRvRGlzY292ZXJJbXBvcnRQYXRocyhcbiAgcHJvdmlkZXJUb1BhdGg6IE1hcDxTaW5nbGVQcm92aWRlciwgKFR5cGU8dW5rbm93bj4gfCBJbmplY3RvclR5cGU8dW5rbm93bj4pW10+LFxuICB2aXNpdGVkQ29udGFpbmVyczogU2V0PFR5cGU8dW5rbm93bj4+LFxuKTogKHByb3ZpZGVyOiBTaW5nbGVQcm92aWRlciwgY29udGFpbmVyOiBUeXBlPHVua25vd24+IHwgSW5qZWN0b3JUeXBlPHVua25vd24+KSA9PiB2b2lkIHtcbiAgcmV0dXJuIChwcm92aWRlcjogU2luZ2xlUHJvdmlkZXIsIGNvbnRhaW5lcjogVHlwZTx1bmtub3duPiB8IEluamVjdG9yVHlwZTx1bmtub3duPikgPT4ge1xuICAgIC8vIElmIHRoZSBwcm92aWRlciBpcyBub3QgYWxyZWFkeSBpbiB0aGUgcHJvdmlkZXJUb1BhdGggbWFwLFxuICAgIC8vIGFkZCBhbiBlbnRyeSB3aXRoIHRoZSBwcm92aWRlciBhcyB0aGUga2V5IGFuZCBhbiBhcnJheSBjb250YWluaW5nIHRoZSBjdXJyZW50IGNvbnRhaW5lciBhc1xuICAgIC8vIHRoZSB2YWx1ZVxuICAgIGlmICghcHJvdmlkZXJUb1BhdGguaGFzKHByb3ZpZGVyKSkge1xuICAgICAgcHJvdmlkZXJUb1BhdGguc2V0KHByb3ZpZGVyLCBbY29udGFpbmVyXSk7XG4gICAgfVxuXG4gICAgLy8gVGhpcyBibG9jayB3aWxsIHJ1biBleGFjdGx5IG9uY2UgZm9yIGVhY2ggY29udGFpbmVyIGluIHRoZSBpbXBvcnQgdHJlZS5cbiAgICAvLyBUaGlzIGlzIHdoZXJlIHdlIHJ1biB0aGUgbG9naWMgdG8gY2hlY2sgdGhlIGltcG9ydHMgYXJyYXkgb2YgdGhlIGN1cnJlbnRcbiAgICAvLyBjb250YWluZXIgdG8gc2VlIGlmIGl0J3MgdGhlIG5leHQgY29udGFpbmVyIGluIHRoZSBwYXRoIGZvciBvdXIgY3VycmVudGx5XG4gICAgLy8gZGlzY292ZXJlZCBwcm92aWRlcnMuXG4gICAgaWYgKCF2aXNpdGVkQ29udGFpbmVycy5oYXMoY29udGFpbmVyKSkge1xuICAgICAgLy8gSXRlcmF0ZSB0aHJvdWdoIHRoZSBwcm92aWRlcnMgd2UndmUgYWxyZWFkeSBzZWVuXG4gICAgICBmb3IgKGNvbnN0IHByb3Ygb2YgcHJvdmlkZXJUb1BhdGgua2V5cygpKSB7XG4gICAgICAgIGNvbnN0IGV4aXN0aW5nSW1wb3J0UGF0aCA9IHByb3ZpZGVyVG9QYXRoLmdldChwcm92KSE7XG5cbiAgICAgICAgbGV0IGNvbnRhaW5lckRlZiA9IGdldEluamVjdG9yRGVmKGNvbnRhaW5lcik7XG4gICAgICAgIGlmICghY29udGFpbmVyRGVmKSB7XG4gICAgICAgICAgY29uc3QgbmdNb2R1bGU6IFR5cGU8dW5rbm93bj4gfCB1bmRlZmluZWQgPSAoY29udGFpbmVyIGFzIGFueSkubmdNb2R1bGUgYXNcbiAgICAgICAgICAgIHwgVHlwZTx1bmtub3duPlxuICAgICAgICAgICAgfCB1bmRlZmluZWQ7XG4gICAgICAgICAgY29udGFpbmVyRGVmID0gZ2V0SW5qZWN0b3JEZWYobmdNb2R1bGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFjb250YWluZXJEZWYpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBsYXN0Q29udGFpbmVyQWRkZWRUb1BhdGggPSBleGlzdGluZ0ltcG9ydFBhdGhbMF07XG5cbiAgICAgICAgbGV0IGlzTmV4dFN0ZXBJblBhdGggPSBmYWxzZTtcbiAgICAgICAgZGVlcEZvckVhY2goY29udGFpbmVyRGVmLmltcG9ydHMsIChtb2R1bGVJbXBvcnQpID0+IHtcbiAgICAgICAgICBpZiAoaXNOZXh0U3RlcEluUGF0aCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlzTmV4dFN0ZXBJblBhdGggPVxuICAgICAgICAgICAgKG1vZHVsZUltcG9ydCBhcyBhbnkpLm5nTW9kdWxlID09PSBsYXN0Q29udGFpbmVyQWRkZWRUb1BhdGggfHxcbiAgICAgICAgICAgIG1vZHVsZUltcG9ydCA9PT0gbGFzdENvbnRhaW5lckFkZGVkVG9QYXRoO1xuXG4gICAgICAgICAgaWYgKGlzTmV4dFN0ZXBJblBhdGgpIHtcbiAgICAgICAgICAgIHByb3ZpZGVyVG9QYXRoLmdldChwcm92KT8udW5zaGlmdChjb250YWluZXIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmlzaXRlZENvbnRhaW5lcnMuYWRkKGNvbnRhaW5lcik7XG4gIH07XG59XG5cbi8qKlxuICogR2V0cyB0aGUgcHJvdmlkZXJzIGNvbmZpZ3VyZWQgb24gYW4gRW52aXJvbm1lbnRJbmplY3RvclxuICpcbiAqIEBwYXJhbSBpbmplY3RvciBFbnZpcm9ubWVudEluamVjdG9yXG4gKiBAcmV0dXJucyBhbiBhcnJheSBvZiBvYmplY3RzIHJlcHJlc2VudGluZyB0aGUgcHJvdmlkZXJzIG9mIHRoZSBnaXZlbiBpbmplY3RvclxuICovXG5mdW5jdGlvbiBnZXRFbnZpcm9ubWVudEluamVjdG9yUHJvdmlkZXJzKGluamVjdG9yOiBFbnZpcm9ubWVudEluamVjdG9yKTogUHJvdmlkZXJSZWNvcmRbXSB7XG4gIGNvbnN0IHByb3ZpZGVyUmVjb3Jkc1dpdGhvdXRJbXBvcnRQYXRocyA9XG4gICAgZ2V0RnJhbWV3b3JrRElEZWJ1Z0RhdGEoKS5yZXNvbHZlclRvUHJvdmlkZXJzLmdldChpbmplY3RvcikgPz8gW107XG5cbiAgLy8gcGxhdGZvcm0gaW5qZWN0b3IgaGFzIG5vIHByb3ZpZGVyIGltcG9ydHMgY29udGFpbmVyIHNvIGNhbiB3ZSBza2lwIHRyeWluZyB0b1xuICAvLyBmaW5kIGltcG9ydCBwYXRoc1xuICBpZiAoaXNQbGF0Zm9ybUluamVjdG9yKGluamVjdG9yKSkge1xuICAgIHJldHVybiBwcm92aWRlclJlY29yZHNXaXRob3V0SW1wb3J0UGF0aHM7XG4gIH1cblxuICBjb25zdCBwcm92aWRlckltcG9ydHNDb250YWluZXIgPSBnZXRQcm92aWRlckltcG9ydHNDb250YWluZXIoaW5qZWN0b3IpO1xuICBpZiAocHJvdmlkZXJJbXBvcnRzQ29udGFpbmVyID09PSBudWxsKSB7XG4gICAgLy8gV2UgYXNzdW1lIHRoYXQgaWYgYW4gZW52aXJvbm1lbnQgaW5qZWN0b3IgZXhpc3RzIHdpdGhvdXQgYW4gYXNzb2NpYXRlZCBwcm92aWRlciBpbXBvcnRzXG4gICAgLy8gY29udGFpbmVyLCBpdCB3YXMgY3JlYXRlZCB3aXRob3V0IHN1Y2ggYSBjb250YWluZXIuIFNvbWUgZXhhbXBsZXMgY2FzZXMgd2hlcmUgdGhpcyBjb3VsZFxuICAgIC8vIGhhcHBlbjpcbiAgICAvLyAtIFRoZSByb290IGluamVjdG9yIG9mIGEgc3RhbmRhbG9uZSBhcHBsaWNhdGlvblxuICAgIC8vIC0gQSByb3V0ZXIgaW5qZWN0b3IgY3JlYXRlZCBieSB1c2luZyB0aGUgcHJvdmlkZXJzIGFycmF5IGluIGEgbGF6eSBsb2FkZWQgcm91dGVcbiAgICAvLyAtIEEgbWFudWFsbHkgY3JlYXRlZCBpbmplY3RvciB0aGF0IGlzIGF0dGFjaGVkIHRvIHRoZSBpbmplY3RvciB0cmVlXG4gICAgLy8gU2luY2UgZWFjaCBvZiB0aGVzZSBjYXNlcyBoYXMgbm8gcHJvdmlkZXIgY29udGFpbmVyLCB0aGVyZSBpcyBubyBjb25jZXB0IG9mIGltcG9ydCBwYXRocyxcbiAgICAvLyBzbyB3ZSBjYW4gc2ltcGx5IHJldHVybiB0aGUgcHJvdmlkZXIgcmVjb3Jkcy5cbiAgICByZXR1cm4gcHJvdmlkZXJSZWNvcmRzV2l0aG91dEltcG9ydFBhdGhzO1xuICB9XG5cbiAgY29uc3QgcHJvdmlkZXJUb1BhdGggPSBnZXRQcm92aWRlckltcG9ydFBhdGhzKHByb3ZpZGVySW1wb3J0c0NvbnRhaW5lcik7XG4gIGNvbnN0IHByb3ZpZGVyUmVjb3JkcyA9IFtdO1xuXG4gIGZvciAoY29uc3QgcHJvdmlkZXJSZWNvcmQgb2YgcHJvdmlkZXJSZWNvcmRzV2l0aG91dEltcG9ydFBhdGhzKSB7XG4gICAgY29uc3QgcHJvdmlkZXIgPSBwcm92aWRlclJlY29yZC5wcm92aWRlcjtcbiAgICAvLyBJZ25vcmUgdGhlc2Ugc3BlY2lhbCBwcm92aWRlcnMgZm9yIG5vdyB1bnRpbCB3ZSBoYXZlIGEgY2xlYW5lciB3YXkgb2ZcbiAgICAvLyBkZXRlcm1pbmcgd2hlbiB0aGV5IGFyZSBwcm92aWRlZCBieSB0aGUgZnJhbWV3b3JrIHZzIHByb3ZpZGVkIGJ5IHRoZSB1c2VyLlxuICAgIGNvbnN0IHRva2VuID0gKHByb3ZpZGVyIGFzIFZhbHVlUHJvdmlkZXIpLnByb3ZpZGU7XG4gICAgaWYgKHRva2VuID09PSBFTlZJUk9OTUVOVF9JTklUSUFMSVpFUiB8fCB0b2tlbiA9PT0gSU5KRUNUT1JfREVGX1RZUEVTKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBsZXQgaW1wb3J0UGF0aCA9IHByb3ZpZGVyVG9QYXRoLmdldChwcm92aWRlcikgPz8gW107XG5cbiAgICBjb25zdCBkZWYgPSBnZXRDb21wb25lbnREZWYocHJvdmlkZXJJbXBvcnRzQ29udGFpbmVyKTtcbiAgICBjb25zdCBpc1N0YW5kYWxvbmVDb21wb25lbnQgPSAhIWRlZj8uc3RhbmRhbG9uZTtcbiAgICAvLyBXZSBwcmVwZW5kIHRoZSBjb21wb25lbnQgY29uc3RydWN0b3IgaW4gdGhlIHN0YW5kYWxvbmUgY2FzZVxuICAgIC8vIGJlY2F1c2Ugd2Fsa1Byb3ZpZGVyVHJlZSBkb2VzIG5vdCB2aXNpdCB0aGlzIGNvbnN0cnVjdG9yIGR1cmluZyBpdCdzIHRyYXZlcnNhbFxuICAgIGlmIChpc1N0YW5kYWxvbmVDb21wb25lbnQpIHtcbiAgICAgIGltcG9ydFBhdGggPSBbcHJvdmlkZXJJbXBvcnRzQ29udGFpbmVyLCAuLi5pbXBvcnRQYXRoXTtcbiAgICB9XG5cbiAgICBwcm92aWRlclJlY29yZHMucHVzaCh7Li4ucHJvdmlkZXJSZWNvcmQsIGltcG9ydFBhdGh9KTtcbiAgfVxuICByZXR1cm4gcHJvdmlkZXJSZWNvcmRzO1xufVxuXG5mdW5jdGlvbiBpc1BsYXRmb3JtSW5qZWN0b3IoaW5qZWN0b3I6IEluamVjdG9yKSB7XG4gIHJldHVybiBpbmplY3RvciBpbnN0YW5jZW9mIFIzSW5qZWN0b3IgJiYgaW5qZWN0b3Iuc2NvcGVzLmhhcygncGxhdGZvcm0nKTtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBwcm92aWRlcnMgY29uZmlndXJlZCBvbiBhbiBpbmplY3Rvci5cbiAqXG4gKiBAcGFyYW0gaW5qZWN0b3IgdGhlIGluamVjdG9yIHRvIGxvb2t1cCB0aGUgcHJvdmlkZXJzIG9mXG4gKiBAcmV0dXJucyBQcm92aWRlclJlY29yZFtdIGFuIGFycmF5IG9mIG9iamVjdHMgcmVwcmVzZW50aW5nIHRoZSBwcm92aWRlcnMgb2YgdGhlIGdpdmVuIGluamVjdG9yXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRJbmplY3RvclByb3ZpZGVycyhpbmplY3RvcjogSW5qZWN0b3IpOiBQcm92aWRlclJlY29yZFtdIHtcbiAgaWYgKGluamVjdG9yIGluc3RhbmNlb2YgTm9kZUluamVjdG9yKSB7XG4gICAgcmV0dXJuIGdldE5vZGVJbmplY3RvclByb3ZpZGVycyhpbmplY3Rvcik7XG4gIH0gZWxzZSBpZiAoaW5qZWN0b3IgaW5zdGFuY2VvZiBFbnZpcm9ubWVudEluamVjdG9yKSB7XG4gICAgcmV0dXJuIGdldEVudmlyb25tZW50SW5qZWN0b3JQcm92aWRlcnMoaW5qZWN0b3IgYXMgRW52aXJvbm1lbnRJbmplY3Rvcik7XG4gIH1cblxuICB0aHJvd0Vycm9yKCdnZXRJbmplY3RvclByb3ZpZGVycyBvbmx5IHN1cHBvcnRzIE5vZGVJbmplY3RvciBhbmQgRW52aXJvbm1lbnRJbmplY3RvcicpO1xufVxuXG4vKipcbiAqXG4gKiBHaXZlbiBhbiBpbmplY3RvciwgdGhpcyBmdW5jdGlvbiB3aWxsIHJldHVyblxuICogYW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIHR5cGUgYW5kIHNvdXJjZSBvZiB0aGUgaW5qZWN0b3IuXG4gKlxuICogfCAgICAgICAgICAgICAgfCB0eXBlICAgICAgICB8IHNvdXJjZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqIHwtLS0tLS0tLS0tLS0tLXwtLS0tLS0tLS0tLS0tfC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS18XG4gKiB8IE5vZGVJbmplY3RvciB8IGVsZW1lbnQgICAgIHwgRE9NIGVsZW1lbnQgdGhhdCBjcmVhdGVkIHRoaXMgaW5qZWN0b3IgICAgICAgICAgICAgICAgICAgICAgfFxuICogfCBSM0luamVjdG9yICAgfCBlbnZpcm9ubWVudCB8IGBpbmplY3Rvci5zb3VyY2VgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqIHwgTnVsbEluamVjdG9yIHwgbnVsbCAgICAgICAgfCBudWxsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKlxuICogQHBhcmFtIGluamVjdG9yIHRoZSBJbmplY3RvciB0byBnZXQgbWV0YWRhdGEgZm9yXG4gKiBAcmV0dXJucyBhbiBvYmplY3QgY29udGFpbmluZyB0aGUgdHlwZSBhbmQgc291cmNlIG9mIHRoZSBnaXZlbiBpbmplY3Rvci4gSWYgdGhlIGluamVjdG9yIG1ldGFkYXRhXG4gKiAgICAgY2Fubm90IGJlIGRldGVybWluZWQsIHJldHVybnMgbnVsbC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEluamVjdG9yTWV0YWRhdGEoXG4gIGluamVjdG9yOiBJbmplY3Rvcixcbik6XG4gIHwge3R5cGU6ICdlbGVtZW50Jzsgc291cmNlOiBSRWxlbWVudH1cbiAgfCB7dHlwZTogJ2Vudmlyb25tZW50Jzsgc291cmNlOiBzdHJpbmcgfCBudWxsfVxuICB8IHt0eXBlOiAnbnVsbCc7IHNvdXJjZTogbnVsbH1cbiAgfCBudWxsIHtcbiAgaWYgKGluamVjdG9yIGluc3RhbmNlb2YgTm9kZUluamVjdG9yKSB7XG4gICAgY29uc3QgbFZpZXcgPSBnZXROb2RlSW5qZWN0b3JMVmlldyhpbmplY3Rvcik7XG4gICAgY29uc3QgdE5vZGUgPSBnZXROb2RlSW5qZWN0b3JUTm9kZShpbmplY3RvcikhO1xuICAgIGFzc2VydFROb2RlRm9yTFZpZXcodE5vZGUsIGxWaWV3KTtcblxuICAgIHJldHVybiB7dHlwZTogJ2VsZW1lbnQnLCBzb3VyY2U6IGdldE5hdGl2ZUJ5VE5vZGUodE5vZGUsIGxWaWV3KSBhcyBSRWxlbWVudH07XG4gIH1cblxuICBpZiAoaW5qZWN0b3IgaW5zdGFuY2VvZiBSM0luamVjdG9yKSB7XG4gICAgcmV0dXJuIHt0eXBlOiAnZW52aXJvbm1lbnQnLCBzb3VyY2U6IGluamVjdG9yLnNvdXJjZSA/PyBudWxsfTtcbiAgfVxuXG4gIGlmIChpbmplY3RvciBpbnN0YW5jZW9mIE51bGxJbmplY3Rvcikge1xuICAgIHJldHVybiB7dHlwZTogJ251bGwnLCBzb3VyY2U6IG51bGx9O1xuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRJbmplY3RvclJlc29sdXRpb25QYXRoKGluamVjdG9yOiBJbmplY3Rvcik6IEluamVjdG9yW10ge1xuICBjb25zdCByZXNvbHV0aW9uUGF0aDogSW5qZWN0b3JbXSA9IFtpbmplY3Rvcl07XG4gIGdldEluamVjdG9yUmVzb2x1dGlvblBhdGhIZWxwZXIoaW5qZWN0b3IsIHJlc29sdXRpb25QYXRoKTtcbiAgcmV0dXJuIHJlc29sdXRpb25QYXRoO1xufVxuXG5mdW5jdGlvbiBnZXRJbmplY3RvclJlc29sdXRpb25QYXRoSGVscGVyKFxuICBpbmplY3RvcjogSW5qZWN0b3IsXG4gIHJlc29sdXRpb25QYXRoOiBJbmplY3RvcltdLFxuKTogSW5qZWN0b3JbXSB7XG4gIGNvbnN0IHBhcmVudCA9IGdldEluamVjdG9yUGFyZW50KGluamVjdG9yKTtcblxuICAvLyBpZiBnZXRJbmplY3RvclBhcmVudCBjYW4ndCBmaW5kIGEgcGFyZW50LCB0aGVuIHdlJ3ZlIGVpdGhlciByZWFjaGVkIHRoZSBlbmRcbiAgLy8gb2YgdGhlIHBhdGgsIG9yIHdlIG5lZWQgdG8gbW92ZSBmcm9tIHRoZSBFbGVtZW50IEluamVjdG9yIHRyZWUgdG8gdGhlXG4gIC8vIG1vZHVsZSBpbmplY3RvciB0cmVlIHVzaW5nIHRoZSBmaXJzdCBpbmplY3RvciBpbiBvdXIgcGF0aCBhcyB0aGUgY29ubmVjdGlvbiBwb2ludC5cbiAgaWYgKHBhcmVudCA9PT0gbnVsbCkge1xuICAgIGlmIChpbmplY3RvciBpbnN0YW5jZW9mIE5vZGVJbmplY3Rvcikge1xuICAgICAgY29uc3QgZmlyc3RJbmplY3RvciA9IHJlc29sdXRpb25QYXRoWzBdO1xuICAgICAgaWYgKGZpcnN0SW5qZWN0b3IgaW5zdGFuY2VvZiBOb2RlSW5qZWN0b3IpIHtcbiAgICAgICAgY29uc3QgbW9kdWxlSW5qZWN0b3IgPSBnZXRNb2R1bGVJbmplY3Rvck9mTm9kZUluamVjdG9yKGZpcnN0SW5qZWN0b3IpO1xuICAgICAgICBpZiAobW9kdWxlSW5qZWN0b3IgPT09IG51bGwpIHtcbiAgICAgICAgICB0aHJvd0Vycm9yKCdOb2RlSW5qZWN0b3IgbXVzdCBoYXZlIHNvbWUgY29ubmVjdGlvbiB0byB0aGUgbW9kdWxlIGluamVjdG9yIHRyZWUnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlc29sdXRpb25QYXRoLnB1c2gobW9kdWxlSW5qZWN0b3IpO1xuICAgICAgICBnZXRJbmplY3RvclJlc29sdXRpb25QYXRoSGVscGVyKG1vZHVsZUluamVjdG9yLCByZXNvbHV0aW9uUGF0aCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXNvbHV0aW9uUGF0aDtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcmVzb2x1dGlvblBhdGgucHVzaChwYXJlbnQpO1xuICAgIGdldEluamVjdG9yUmVzb2x1dGlvblBhdGhIZWxwZXIocGFyZW50LCByZXNvbHV0aW9uUGF0aCk7XG4gIH1cblxuICByZXR1cm4gcmVzb2x1dGlvblBhdGg7XG59XG5cbi8qKlxuICogR2V0cyB0aGUgcGFyZW50IG9mIGFuIGluamVjdG9yLlxuICpcbiAqIFRoaXMgZnVuY3Rpb24gaXMgbm90IGFibGUgdG8gbWFrZSB0aGUganVtcCBmcm9tIHRoZSBFbGVtZW50IEluamVjdG9yIFRyZWUgdG8gdGhlIE1vZHVsZVxuICogaW5qZWN0b3IgdHJlZS4gVGhpcyBpcyBiZWNhdXNlIHRoZSBcInBhcmVudFwiICh0aGUgbmV4dCBzdGVwIGluIHRoZSByZW9zbHV0aW9uIHBhdGgpXG4gKiBvZiBhIHJvb3QgTm9kZUluamVjdG9yIGlzIGRlcGVuZGVudCBvbiB3aGljaCBOb2RlSW5qZWN0b3IgYW5jZXN0b3IgaW5pdGlhdGVkXG4gKiB0aGUgREkgbG9va3VwLiBTZWUgZ2V0SW5qZWN0b3JSZXNvbHV0aW9uUGF0aCBmb3IgYSBmdW5jdGlvbiB0aGF0IGNhbiBtYWtlIHRoaXMganVtcC5cbiAqXG4gKiBJbiB0aGUgYmVsb3cgZGlhZ3JhbTpcbiAqIGBgYHRzXG4gKiBnZXRJbmplY3RvclBhcmVudChOb2RlSW5qZWN0b3JCKVxuICogID4gTm9kZUluamVjdG9yQVxuICogZ2V0SW5qZWN0b3JQYXJlbnQoTm9kZUluamVjdG9yQSkgLy8gb3IgZ2V0SW5qZWN0b3JQYXJlbnQoZ2V0SW5qZWN0b3JQYXJlbnQoTm9kZUluamVjdG9yQikpXG4gKiAgPiBudWxsIC8vIGNhbm5vdCBqdW1wIHRvIE1vZHVsZUluamVjdG9yIHRyZWVcbiAqIGBgYFxuICpcbiAqIGBgYFxuICogICAgICAgICAgICAgICAg4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQICAgICAgICAgICAgICAgIOKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUkFxuICogICAg4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSkTW9kdWxlQeKUnOKUgOKUgOKUgEluamVjdG9y4pSA4pSA4pSA4pSA4pa64pSCRW52aXJvbm1lbnRJbmplY3RvcuKUglxuICogICAg4pSCICAgICAgICAgICDilJTilIDilIDilIDilKzilIDilIDilIDilJggICAgICAgICAgICAgICAg4pSU4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSYXG4gKiAgICDilIIgICAgICAgICAgICAgICDilIJcbiAqICAgIOKUgiAgICAgICAgICAgYm9vdHN0cmFwc1xuICogICAg4pSCICAgICAgICAgICAgICAg4pSCXG4gKiAgICDilIIgICAgICAgICAgICAgICDilIJcbiAqICAgIOKUgiAgICAgICAgICDilIzilIDilIDilIDilIDilrzilIDilIDilIDilIDilIDilJAgICAgICAgICAgICAgICAgIOKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUkFxuICogZGVjbGFyZXMgICAgICDilIJDb21wb25lbnRB4pSc4pSA4pSA4pSA4pSASW5qZWN0b3LilIDilIDilIDilIDilrrilIJOb2RlSW5qZWN0b3JB4pSCXG4gKiAgICDilIIgICAgICAgICAg4pSU4pSA4pSA4pSA4pSA4pSs4pSA4pSA4pSA4pSA4pSA4pSYICAgICAgICAgICAgICAgICDilJTilIDilIDilIDilIDilIDilrLilIDilIDilIDilIDilIDilIDilIDilJhcbiAqICAgIOKUgiAgICAgICAgICAgICAgIOKUgiAgICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCXG4gKiAgICDilIIgICAgICAgICAgICByZW5kZXJzICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50XG4gKiAgICDilIIgICAgICAgICAgICAgICDilIIgICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKUglxuICogICAg4pSCICAgICAgICAgIOKUjOKUgOKUgOKUgOKUgOKWvOKUgOKUgOKUgOKUgOKUgOKUkCAgICAgICAgICAgICAgICAg4pSM4pSA4pSA4pSA4pSA4pSA4pS04pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQXG4gKiAgICDilJTilIDilIDilIDilIDilIDilIDilIDilIDilIDilrrilIJDb21wb25lbnRC4pSc4pSA4pSA4pSA4pSASW5qZWN0b3LilIDilIDilIDilIDilrrilIJOb2RlSW5qZWN0b3JC4pSCXG4gKiAgICAgICAgICAgICAgIOKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUmCAgICAgICAgICAgICAgICAg4pSU4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSYXG4gKmBgYFxuICpcbiAqIEBwYXJhbSBpbmplY3RvciBhbiBJbmplY3RvciB0byBnZXQgdGhlIHBhcmVudCBvZlxuICogQHJldHVybnMgSW5qZWN0b3IgdGhlIHBhcmVudCBvZiB0aGUgZ2l2ZW4gaW5qZWN0b3JcbiAqL1xuZnVuY3Rpb24gZ2V0SW5qZWN0b3JQYXJlbnQoaW5qZWN0b3I6IEluamVjdG9yKTogSW5qZWN0b3IgfCBudWxsIHtcbiAgaWYgKGluamVjdG9yIGluc3RhbmNlb2YgUjNJbmplY3Rvcikge1xuICAgIHJldHVybiBpbmplY3Rvci5wYXJlbnQ7XG4gIH1cblxuICBsZXQgdE5vZGU6IFRFbGVtZW50Tm9kZSB8IFRDb250YWluZXJOb2RlIHwgVEVsZW1lbnRDb250YWluZXJOb2RlIHwgbnVsbDtcbiAgbGV0IGxWaWV3OiBMVmlldzx1bmtub3duPjtcbiAgaWYgKGluamVjdG9yIGluc3RhbmNlb2YgTm9kZUluamVjdG9yKSB7XG4gICAgdE5vZGUgPSBnZXROb2RlSW5qZWN0b3JUTm9kZShpbmplY3Rvcik7XG4gICAgbFZpZXcgPSBnZXROb2RlSW5qZWN0b3JMVmlldyhpbmplY3Rvcik7XG4gIH0gZWxzZSBpZiAoaW5qZWN0b3IgaW5zdGFuY2VvZiBOdWxsSW5qZWN0b3IpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfSBlbHNlIGlmIChpbmplY3RvciBpbnN0YW5jZW9mIENoYWluZWRJbmplY3Rvcikge1xuICAgIHJldHVybiBpbmplY3Rvci5wYXJlbnRJbmplY3RvcjtcbiAgfSBlbHNlIHtcbiAgICB0aHJvd0Vycm9yKFxuICAgICAgJ2dldEluamVjdG9yUGFyZW50IG9ubHkgc3VwcG9ydCBpbmplY3RvcnMgb2YgdHlwZSBSM0luamVjdG9yLCBOb2RlSW5qZWN0b3IsIE51bGxJbmplY3RvciwgQ2hhaW5lZEluamVjdG9yJyxcbiAgICApO1xuICB9XG5cbiAgY29uc3QgcGFyZW50TG9jYXRpb24gPSBnZXRQYXJlbnRJbmplY3RvckxvY2F0aW9uKFxuICAgIHROb2RlIGFzIFRFbGVtZW50Tm9kZSB8IFRDb250YWluZXJOb2RlIHwgVEVsZW1lbnRDb250YWluZXJOb2RlLFxuICAgIGxWaWV3LFxuICApO1xuXG4gIGlmIChoYXNQYXJlbnRJbmplY3RvcihwYXJlbnRMb2NhdGlvbikpIHtcbiAgICBjb25zdCBwYXJlbnRJbmplY3RvckluZGV4ID0gZ2V0UGFyZW50SW5qZWN0b3JJbmRleChwYXJlbnRMb2NhdGlvbik7XG4gICAgY29uc3QgcGFyZW50TFZpZXcgPSBnZXRQYXJlbnRJbmplY3RvclZpZXcocGFyZW50TG9jYXRpb24sIGxWaWV3KTtcbiAgICBjb25zdCBwYXJlbnRUVmlldyA9IHBhcmVudExWaWV3W1RWSUVXXTtcbiAgICBjb25zdCBwYXJlbnRUTm9kZSA9IHBhcmVudFRWaWV3LmRhdGFbcGFyZW50SW5qZWN0b3JJbmRleCArIE5vZGVJbmplY3Rvck9mZnNldC5UTk9ERV0gYXMgVE5vZGU7XG4gICAgcmV0dXJuIG5ldyBOb2RlSW5qZWN0b3IoXG4gICAgICBwYXJlbnRUTm9kZSBhcyBURWxlbWVudE5vZGUgfCBUQ29udGFpbmVyTm9kZSB8IFRFbGVtZW50Q29udGFpbmVyTm9kZSxcbiAgICAgIHBhcmVudExWaWV3LFxuICAgICk7XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgY2hhaW5lZEluamVjdG9yID0gbFZpZXdbSU5KRUNUT1JdIGFzIENoYWluZWRJbmplY3RvcjtcblxuICAgIC8vIENhc2Ugd2hlcmUgY2hhaW5lZEluamVjdG9yLmluamVjdG9yIGlzIGFuIE91dGxldEluamVjdG9yIGFuZCBjaGFpbmVkSW5qZWN0b3IuaW5qZWN0b3IucGFyZW50XG4gICAgLy8gaXMgYSBOb2RlSW5qZWN0b3IuXG4gICAgLy8gdG9kbyhhbGVrc2FuZGVyYm9kdXJyaSk6IGlkZWFsbHkgbm90aGluZyBpbiBwYWNrYWdlcy9jb3JlIHNob3VsZCBkZWFsXG4gICAgLy8gZGlyZWN0bHkgd2l0aCByb3V0ZXIgY29uY2VybnMuIFJlZmFjdG9yIHRoaXMgc28gdGhhdCB3ZSBjYW4gbWFrZSB0aGUganVtcCBmcm9tXG4gICAgLy8gTm9kZUluamVjdG9yIC0+IE91dGxldEluamVjdG9yIC0+IE5vZGVJbmplY3RvclxuICAgIC8vIHdpdGhvdXQgZXhwbGljaXRseSByZWx5aW5nIG9uIHR5cGVzIGNvbnRyYWN0cyBmcm9tIHBhY2thZ2VzL3JvdXRlclxuICAgIGNvbnN0IGluamVjdG9yUGFyZW50ID0gKGNoYWluZWRJbmplY3Rvci5pbmplY3RvciBhcyBhbnkpPy5wYXJlbnQgYXMgSW5qZWN0b3I7XG5cbiAgICBpZiAoaW5qZWN0b3JQYXJlbnQgaW5zdGFuY2VvZiBOb2RlSW5qZWN0b3IpIHtcbiAgICAgIHJldHVybiBpbmplY3RvclBhcmVudDtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbnVsbDtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBtb2R1bGUgaW5qZWN0b3Igb2YgYSBOb2RlSW5qZWN0b3IuXG4gKlxuICogQHBhcmFtIGluamVjdG9yIE5vZGVJbmplY3RvciB0byBnZXQgbW9kdWxlIGluamVjdG9yIG9mXG4gKiBAcmV0dXJucyBJbmplY3RvciByZXByZXNlbnRpbmcgbW9kdWxlIGluamVjdG9yIG9mIHRoZSBnaXZlbiBOb2RlSW5qZWN0b3JcbiAqL1xuZnVuY3Rpb24gZ2V0TW9kdWxlSW5qZWN0b3JPZk5vZGVJbmplY3RvcihpbmplY3RvcjogTm9kZUluamVjdG9yKTogSW5qZWN0b3Ige1xuICBsZXQgbFZpZXc6IExWaWV3PHVua25vd24+O1xuICBpZiAoaW5qZWN0b3IgaW5zdGFuY2VvZiBOb2RlSW5qZWN0b3IpIHtcbiAgICBsVmlldyA9IGdldE5vZGVJbmplY3RvckxWaWV3KGluamVjdG9yKTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvd0Vycm9yKCdnZXRNb2R1bGVJbmplY3Rvck9mTm9kZUluamVjdG9yIG11c3QgYmUgY2FsbGVkIHdpdGggYSBOb2RlSW5qZWN0b3InKTtcbiAgfVxuXG4gIGNvbnN0IGluaiA9IGxWaWV3W0lOSkVDVE9SXSBhcyBSM0luamVjdG9yIHwgQ2hhaW5lZEluamVjdG9yO1xuICBjb25zdCBtb2R1bGVJbmplY3RvciA9IGluaiBpbnN0YW5jZW9mIENoYWluZWRJbmplY3RvciA/IGluai5wYXJlbnRJbmplY3RvciA6IGluai5wYXJlbnQ7XG4gIGlmICghbW9kdWxlSW5qZWN0b3IpIHtcbiAgICB0aHJvd0Vycm9yKCdOb2RlSW5qZWN0b3IgbXVzdCBoYXZlIHNvbWUgY29ubmVjdGlvbiB0byB0aGUgbW9kdWxlIGluamVjdG9yIHRyZWUnKTtcbiAgfVxuXG4gIHJldHVybiBtb2R1bGVJbmplY3Rvcjtcbn1cbiJdfQ==