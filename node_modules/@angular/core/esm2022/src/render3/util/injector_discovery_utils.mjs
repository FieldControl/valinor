/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
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
import { ChainedInjector } from '../chained_injector';
import { getFrameworkDIDebugData } from '../debug/framework_injector_profiler';
import { getComponentDef } from '../definition';
import { getNodeInjectorLView, getNodeInjectorTNode, getParentInjectorLocation, NodeInjector, } from '../di';
import { INJECTOR, TVIEW } from '../interfaces/view';
import { getParentInjectorIndex, getParentInjectorView, hasParentInjector, isRouterOutletInjector, } from './injector_utils';
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
        const parent = injector.parent;
        if (isRouterOutletInjector(parent)) {
            // This is a special case for a `ChainedInjector` instance, which represents
            // a combination of a Router's `OutletInjector` and an EnvironmentInjector,
            // which represents a `@defer` block. Since the `OutletInjector` doesn't store
            // any tokens itself, we point to the parent injector instead. See the
            // `OutletInjector.__ngOutletInjector` field for additional information.
            return parent.parentInjector;
        }
        return parent;
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
        throwError('getInjectorParent only support injectors of type R3Injector, NodeInjector, NullInjector');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5qZWN0b3JfZGlzY292ZXJ5X3V0aWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvcmVuZGVyMy91dGlsL2luamVjdG9yX2Rpc2NvdmVyeV91dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsdUJBQXVCLEVBQUMsTUFBTSw0QkFBNEIsQ0FBQztBQUduRSxPQUFPLEVBQUMsY0FBYyxFQUFlLE1BQU0seUJBQXlCLENBQUM7QUFHckUsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0sMEJBQTBCLENBQUM7QUFDNUQsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQ3BELE9BQU8sRUFBaUIsZ0JBQWdCLEVBQUMsTUFBTSw4QkFBOEIsQ0FBQztBQUM5RSxPQUFPLEVBQUMsbUJBQW1CLEVBQUUsVUFBVSxFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFFckUsT0FBTyxFQUFDLFdBQVcsSUFBSSxzQkFBc0IsRUFBQyxNQUFNLGdDQUFnQyxDQUFDO0FBQ3JGLE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUNuRCxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDN0MsT0FBTyxFQUFDLFdBQVcsRUFBRSxtQkFBbUIsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUMzRCxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDcEQsT0FBTyxFQUFDLHVCQUF1QixFQUFDLE1BQU0sc0NBQXNDLENBQUM7QUFFN0UsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUM5QyxPQUFPLEVBQ0wsb0JBQW9CLEVBQ3BCLG9CQUFvQixFQUNwQix5QkFBeUIsRUFDekIsWUFBWSxHQUNiLE1BQU0sT0FBTyxDQUFDO0FBSWYsT0FBTyxFQUFDLFFBQVEs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QztBQUVEOzs7OztHQUtHO0FBQ0gsU0FBUywrQkFBK0IsQ0FBQyxRQUFzQjtJQUM3RCxJQUFJLEtBQXFCLENBQUM7SUFDMUIsSUFBSSxRQUFRLFlBQVksWUFBWSxFQUFFLENBQUM7UUFDckMsS0FBSyxHQUFHLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3pDLENBQUM7U0FBTSxDQUFDO1FBQ04sVUFBVSxDQUFDLG9FQUFvRSxDQUFDLENBQUM7SUFDbkYsQ0FBQztJQUVELE1BQU0sR0FBRyxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQWlDLENBQUM7SUFDNUQsTUFBTSxjQUFjLEdBQUcsR0FBRyxZQUFZLGVBQWUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQztJQUN4RixJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDcEIsVUFBVSxDQUFDLG9FQUFvRSxDQUFDLENBQUM7SUFDbkYsQ0FBQztJQUVELE9BQU8sY0FBYyxDQUFDO0FBQ3hCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCB7RU5WSVJPTk1FTlRfSU5JVElBTElaRVJ9IGZyb20gJy4uLy4uL2RpL2luaXRpYWxpemVyX3Rva2VuJztcbmltcG9ydCB7SW5qZWN0aW9uVG9rZW59IGZyb20gJy4uLy4uL2RpL2luamVjdGlvbl90b2tlbic7XG5pbXBvcnQge0luamVjdG9yfSBmcm9tICcuLi8uLi9kaS9pbmplY3Rvcic7XG5pbXBvcnQge2dldEluamVjdG9yRGVmLCBJbmplY3RvclR5cGV9IGZyb20gJy4uLy4uL2RpL2ludGVyZmFjZS9kZWZzJztcbmltcG9ydCB7SW50ZXJuYWxJbmplY3RGbGFnc30gZnJvbSAnLi4vLi4vZGkvaW50ZXJmYWNlL2luamVjdG9yJztcbmltcG9ydCB7VmFsdWVQcm92aWRlcn0gZnJvbSAnLi4vLi4vZGkvaW50ZXJmYWNlL3Byb3ZpZGVyJztcbmltcG9ydCB7SU5KRUNUT1JfREVGX1RZUEVTfSBmcm9tICcuLi8uLi9kaS9pbnRlcm5hbF90b2tlbnMnO1xuaW1wb3J0IHtOdWxsSW5qZWN0b3J9IGZyb20gJy4uLy4uL2RpL251bGxfaW5qZWN0b3InO1xuaW1wb3J0IHtTaW5nbGVQcm92aWRlciwgd2Fsa1Byb3ZpZGVyVHJlZX0gZnJvbSAnLi4vLi4vZGkvcHJvdmlkZXJfY29sbGVjdGlvbic7XG5pbXBvcnQge0Vudmlyb25tZW50SW5qZWN0b3IsIFIzSW5qZWN0b3J9IGZyb20gJy4uLy4uL2RpL3IzX2luamVjdG9yJztcbmltcG9ydCB7VHlwZX0gZnJvbSAnLi4vLi4vaW50ZXJmYWNlL3R5cGUnO1xuaW1wb3J0IHtOZ01vZHVsZVJlZiBhcyB2aWV3RW5naW5lX05nTW9kdWxlUmVmfSBmcm9tICcuLi8uLi9saW5rZXIvbmdfbW9kdWxlX2ZhY3RvcnknO1xuaW1wb3J0IHtkZWVwRm9yRWFjaH0gZnJvbSAnLi4vLi4vdXRpbC9hcnJheV91dGlscyc7XG5pbXBvcnQge3Rocm93RXJyb3J9IGZyb20gJy4uLy4uL3V0aWwvYXNzZXJ0JztcbmltcG9ydCB7YXNzZXJ0VE5vZGUsIGFzc2VydFROb2RlRm9yTFZpZXd9IGZyb20gJy4uL2Fzc2VydCc7XG5pbXBvcnQge0NoYWluZWRJbmplY3Rvcn0gZnJvbSAnLi4vY2hhaW5lZF9pbmplY3Rvcic7XG5pbXBvcnQge2dldEZyYW1ld29ya0RJRGVidWdEYXRhfSBmcm9tICcuLi9kZWJ1Zy9mcmFtZXdvcmtfaW5qZWN0b3JfcHJvZmlsZXInO1xuaW1wb3J0IHtJbmplY3RlZFNlcnZpY2UsIFByb3ZpZGVyUmVjb3JkfSBmcm9tICcuLi9kZWJ1Zy9pbmplY3Rvcl9wcm9maWxlcic7XG5pbXBvcnQge2dldENvbXBvbmVudERlZn0gZnJvbSAnLi4vZGVmaW5pdGlvbic7XG5pbXBvcnQge1xuICBnZXROb2RlSW5qZWN0b3JMVmlldyxcbiAgZ2V0Tm9kZUluamVjdG9yVE5vZGUsXG4gIGdldFBhcmVudEluamVjdG9yTG9jYXRpb24sXG4gIE5vZGVJbmplY3Rvcixcbn0gZnJvbSAnLi4vZGknO1xuaW1wb3J0IHtOb2RlSW5qZWN0b3JPZmZzZXR9IGZyb20gJy4uL2ludGVyZmFjZXMvaW5qZWN0b3InO1xuaW1wb3J0IHtUQ29udGFpbmVyTm9kZSwgVEVsZW1lbnRDb250YWluZXJOb2RlLCBURWxlbWVudE5vZGUsIFROb2RlfSBmcm9tICcuLi9pbnRlcmZhY2VzL25vZGUnO1xuaW1wb3J0IHtSRWxlbWVudH0gZnJvbSAnLi4vaW50ZXJmYWNlcy9yZW5kZXJlcl9kb20nO1xuaW1wb3J0IHtJTkpFQ1RPUiwgTFZpZXcsIFRWSUVXfSBmcm9tICcuLi9pbnRlcmZhY2VzL3ZpZXcnO1xuXG5pbXBvcnQge1xuICBnZXRQYXJlbnRJbmplY3RvckluZGV4LFxuICBnZXRQYXJlbnRJbmplY3RvclZpZXcsXG4gIGhhc1BhcmVudEluamVjdG9yLFxuICBpc1JvdXRlck91dGxldEluamVjdG9yLFxufSBmcm9tICcuL2luamVjdG9yX3V0aWxzJztcbmltcG9ydCB7Z2V0TmF0aXZlQnlUTm9kZX0gZnJvbSAnLi92aWV3X3V0aWxzJztcblxuLyoqXG4gKiBEaXNjb3ZlcnMgdGhlIGRlcGVuZGVuY2llcyBvZiBhbiBpbmplY3RhYmxlIGluc3RhbmNlLiBQcm92aWRlcyBESSBpbmZvcm1hdGlvbiBhYm91dCBlYWNoXG4gKiBkZXBlbmRlbmN5IHRoYXQgdGhlIGluamVjdGFibGUgd2FzIGluc3RhbnRpYXRlZCB3aXRoLCBpbmNsdWRpbmcgd2hlcmUgdGhleSB3ZXJlIHByb3ZpZGVkIGZyb20uXG4gKlxuICogQHBhcmFtIGluamVjdG9yIEFuIGluamVjdG9yIGluc3RhbmNlXG4gKiBAcGFyYW0gdG9rZW4gYSBESSB0b2tlbiB0aGF0IHdhcyBjb25zdHJ1Y3RlZCBieSB0aGUgZ2l2ZW4gaW5qZWN0b3IgaW5zdGFuY2VcbiAqIEByZXR1cm5zIGFuIG9iamVjdCB0aGF0IGNvbnRhaW5zIHRoZSBjcmVhdGVkIGluc3RhbmNlIG9mIHRva2VuIGFzIHdlbGwgYXMgYWxsIG9mIHRoZSBkZXBlbmRlbmNpZXNcbiAqIHRoYXQgaXQgd2FzIGluc3RhbnRpYXRlZCB3aXRoIE9SIHVuZGVmaW5lZCBpZiB0aGUgdG9rZW4gd2FzIG5vdCBjcmVhdGVkIHdpdGhpbiB0aGUgZ2l2ZW5cbiAqIGluamVjdG9yLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RGVwZW5kZW5jaWVzRnJvbUluamVjdGFibGU8VD4oXG4gIGluamVjdG9yOiBJbmplY3RvcixcbiAgdG9rZW46IFR5cGU8VD4gfCBJbmplY3Rpb25Ub2tlbjxUPixcbik6IHtpbnN0YW5jZTogVDsgZGVwZW5kZW5jaWVzOiBPbWl0PEluamVjdGVkU2VydmljZSwgJ2luamVjdGVkSW4nPltdfSB8IHVuZGVmaW5lZCB7XG4gIC8vIEZpcnN0IHdlIGNoZWNrIHRvIHNlZSBpZiB0aGUgdG9rZW4gZ2l2ZW4gbWFwcyB0byBhbiBhY3R1YWwgaW5zdGFuY2UgaW4gdGhlIGluamVjdG9yIGdpdmVuLlxuICAvLyBXZSB1c2UgYHNlbGY6IHRydWVgIGJlY2F1c2Ugd2Ugb25seSB3YW50IHRvIGxvb2sgYXQgdGhlIGluamVjdG9yIHdlIHdlcmUgZ2l2ZW4uXG4gIC8vIFdlIHVzZSBgb3B0aW9uYWw6IHRydWVgIGJlY2F1c2UgaXQncyBwb3NzaWJsZSB0aGF0IHRoZSB0b2tlbiB3ZSB3ZXJlIGdpdmVuIHdhcyBuZXZlclxuICAvLyBjb25zdHJ1Y3RlZCBieSB0aGUgaW5qZWN0b3Igd2Ugd2VyZSBnaXZlbi5cbiAgY29uc3QgaW5zdGFuY2UgPSBpbmplY3Rvci5nZXQodG9rZW4sIG51bGwsIHtzZWxmOiB0cnVlLCBvcHRpb25hbDogdHJ1ZX0pO1xuICBpZiAoaW5zdGFuY2UgPT09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFVuYWJsZSB0byBkZXRlcm1pbmUgaW5zdGFuY2Ugb2YgJHt0b2tlbn0gaW4gZ2l2ZW4gaW5qZWN0b3JgKTtcbiAgfVxuXG4gIGNvbnN0IHVuZm9ybWF0dGVkRGVwZW5kZW5jaWVzID0gZ2V0RGVwZW5kZW5jaWVzRm9yVG9rZW5JbkluamVjdG9yKHRva2VuLCBpbmplY3Rvcik7XG4gIGNvbnN0IHJlc29sdXRpb25QYXRoID0gZ2V0SW5qZWN0b3JSZXNvbHV0aW9uUGF0aChpbmplY3Rvcik7XG5cbiAgY29uc3QgZGVwZW5kZW5jaWVzID0gdW5mb3JtYXR0ZWREZXBlbmRlbmNpZXMubWFwKChkZXApID0+IHtcbiAgICAvLyBpbmplY3RlZEluIGNvbnRhaW5zIHByaXZhdGUgZmllbGRzLCBzbyB3ZSBvbWl0IGl0IGZyb20gdGhlIHJlc3BvbnNlXG4gICAgY29uc3QgZm9ybWF0dGVkRGVwZW5kZW5jeTogT21pdDxJbmplY3RlZFNlcnZpY2UsICdpbmplY3RlZEluJz4gPSB7XG4gICAgICB2YWx1ZTogZGVwLnZhbHVlLFxuICAgIH07XG5cbiAgICAvLyBjb252ZXJ0IGluamVjdGlvbiBmbGFncyB0byBib29sZWFuc1xuICAgIGNvbnN0IGZsYWdzID0gZGVwLmZsYWdzIGFzIEludGVybmFsSW5qZWN0RmxhZ3M7XG4gICAgZm9ybWF0dGVkRGVwZW5kZW5jeS5mbGFncyA9IHtcbiAgICAgIG9wdGlvbmFsOiAoSW50ZXJuYWxJbmplY3RGbGFncy5PcHRpb25hbCAmIGZsYWdzKSA9PT0gSW50ZXJuYWxJbmplY3RGbGFncy5PcHRpb25hbCxcbiAgICAgIGhvc3Q6IChJbnRlcm5hbEluamVjdEZsYWdzLkhvc3QgJiBmbGFncykgPT09IEludGVybmFsSW5qZWN0RmxhZ3MuSG9zdCxcbiAgICAgIHNlbGY6IChJbnRlcm5hbEluamVjdEZsYWdzLlNlbGYgJiBmbGFncykgPT09IEludGVybmFsSW5qZWN0RmxhZ3MuU2VsZixcbiAgICAgIHNraXBTZWxmOiAoSW50ZXJuYWxJbmplY3RGbGFncy5Ta2lwU2VsZiAmIGZsYWdzKSA9PT0gSW50ZXJuYWxJbmplY3RGbGFncy5Ta2lwU2VsZixcbiAgICB9O1xuXG4gICAgLy8gZmluZCB0aGUgaW5qZWN0b3IgdGhhdCBwcm92aWRlZCB0aGUgZGVwZW5kZW5jeVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVzb2x1dGlvblBhdGgubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGluamVjdG9yVG9DaGVjayA9IHJlc29sdXRpb25QYXRoW2ldO1xuXG4gICAgICAvLyBpZiBza2lwU2VsZiBpcyB0cnVlIHdlIHNraXAgdGhlIGZpcnN0IGluamVjdG9yXG4gICAgICBpZiAoaSA9PT0gMCAmJiBmb3JtYXR0ZWREZXBlbmRlbmN5LmZsYWdzLnNraXBTZWxmKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBob3N0IG9ubHkgYXBwbGllcyB0byBOb2RlSW5qZWN0b3JzXG4gICAgICBpZiAoZm9ybWF0dGVkRGVwZW5kZW5jeS5mbGFncy5ob3N0ICYmIGluamVjdG9yVG9DaGVjayBpbnN0YW5jZW9mIEVudmlyb25tZW50SW5qZWN0b3IpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGluc3RhbmNlID0gaW5qZWN0b3JUb0NoZWNrLmdldChkZXAudG9rZW4gYXMgVHlwZTx1bmtub3duPiwgbnVsbCwge1xuICAgICAgICBzZWxmOiB0cnVlLFxuICAgICAgICBvcHRpb25hbDogdHJ1ZSxcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoaW5zdGFuY2UgIT09IG51bGwpIHtcbiAgICAgICAgLy8gaWYgaG9zdCBmbGFnIGlzIHRydWUgd2UgZG91YmxlIGNoZWNrIHRoYXQgd2UgY2FuIGdldCB0aGUgc2VydmljZSBmcm9tIHRoZSBmaXJzdCBlbGVtZW50XG4gICAgICAgIC8vIGluIHRoZSByZXNvbHV0aW9uIHBhdGggYnkgdXNpbmcgdGhlIGhvc3QgZmxhZy4gVGhpcyBpcyBkb25lIHRvIG1ha2Ugc3VyZSB0aGF0IHdlJ3ZlIGZvdW5kXG4gICAgICAgIC8vIHRoZSBjb3JyZWN0IHByb3ZpZGluZyBpbmplY3RvciwgYW5kIG5vdCBhIG5vZGUgaW5qZWN0b3IgdGhhdCBpcyBjb25uZWN0ZWQgdG8gb3VyIHBhdGggdmlhXG4gICAgICAgIC8vIGEgcm91dGVyIG91dGxldC5cbiAgICAgICAgaWYgKGZvcm1hdHRlZERlcGVuZGVuY3kuZmxhZ3MuaG9zdCkge1xuICAgICAgICAgIGNvbnN0IGZpcnN0SW5qZWN0b3IgPSByZXNvbHV0aW9uUGF0aFswXTtcbiAgICAgICAgICBjb25zdCBsb29rdXBGcm9tRmlyc3RJbmplY3RvciA9IGZpcnN0SW5qZWN0b3IuZ2V0KGRlcC50b2tlbiBhcyBUeXBlPHVua25vd24+LCBudWxsLCB7XG4gICAgICAgICAgICAuLi5mb3JtYXR0ZWREZXBlbmRlbmN5LmZsYWdzLFxuICAgICAgICAgICAgb3B0aW9uYWw6IHRydWUsXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBpZiAobG9va3VwRnJvbUZpcnN0SW5qZWN0b3IgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGZvcm1hdHRlZERlcGVuZGVuY3kucHJvdmlkZWRJbiA9IGluamVjdG9yVG9DaGVjaztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGZvcm1hdHRlZERlcGVuZGVuY3kucHJvdmlkZWRJbiA9IGluamVjdG9yVG9DaGVjaztcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIC8vIGlmIHNlbGYgaXMgdHJ1ZSB3ZSBzdG9wIGFmdGVyIHRoZSBmaXJzdCBpbmplY3RvclxuICAgICAgaWYgKGkgPT09IDAgJiYgZm9ybWF0dGVkRGVwZW5kZW5jeS5mbGFncy5zZWxmKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChkZXAudG9rZW4pIGZvcm1hdHRlZERlcGVuZGVuY3kudG9rZW4gPSBkZXAudG9rZW47XG5cbiAgICByZXR1cm4gZm9ybWF0dGVkRGVwZW5kZW5jeTtcbiAgfSk7XG5cbiAgcmV0dXJuIHtpbnN0YW5jZSwgZGVwZW5kZW5jaWVzfTtcbn1cblxuZnVuY3Rpb24gZ2V0RGVwZW5kZW5jaWVzRm9yVG9rZW5JbkluamVjdG9yPFQ+KFxuICB0b2tlbjogVHlwZTxUPiB8IEluamVjdGlvblRva2VuPFQ+LFxuICBpbmplY3RvcjogSW5qZWN0b3IsXG4pOiBJbmplY3RlZFNlcnZpY2VbXSB7XG4gIGNvbnN0IHtyZXNvbHZlclRvVG9rZW5Ub0RlcGVuZGVuY2llc30gPSBnZXRGcmFtZXdvcmtESURlYnVnRGF0YSgpO1xuXG4gIGlmICghKGluamVjdG9yIGluc3RhbmNlb2YgTm9kZUluamVjdG9yKSkge1xuICAgIHJldHVybiByZXNvbHZlclRvVG9rZW5Ub0RlcGVuZGVuY2llcy5nZXQoaW5qZWN0b3IpPy5nZXQ/Lih0b2tlbiBhcyBUeXBlPFQ+KSA/PyBbXTtcbiAgfVxuXG4gIGNvbnN0IGxWaWV3ID0gZ2V0Tm9kZUluamVjdG9yTFZpZXcoaW5qZWN0b3IpO1xuICBjb25zdCB0b2tlbkRlcGVuZGVuY3lNYXAgPSByZXNvbHZlclRvVG9rZW5Ub0RlcGVuZGVuY2llcy5nZXQobFZpZXcpO1xuICBjb25zdCBkZXBlbmRlbmNpZXMgPSB0b2tlbkRlcGVuZGVuY3lNYXA/LmdldCh0b2tlbiBhcyBUeXBlPFQ+KSA/PyBbXTtcblxuICAvLyBJbiB0aGUgTm9kZUluamVjdG9yIGNhc2UsIGFsbCBpbmplY3Rpb25zIGZvciBldmVyeSBub2RlIGFyZSBzdG9yZWQgaW4gdGhlIHNhbWUgbFZpZXcuXG4gIC8vIFdlIHVzZSB0aGUgaW5qZWN0ZWRJbiBmaWVsZCBvZiB0aGUgZGVwZW5kZW5jeSB0byBmaWx0ZXIgb3V0IHRoZSBkZXBlbmRlbmNpZXMgdGhhdFxuICAvLyBkbyBub3QgY29tZSBmcm9tIHRoZSBzYW1lIG5vZGUgYXMgdGhlIGluc3RhbmNlIHdlJ3JlIGxvb2tpbmcgYXQuXG4gIHJldHVybiBkZXBlbmRlbmNpZXMuZmlsdGVyKChkZXBlbmRlbmN5KSA9PiB7XG4gICAgY29uc3QgZGVwZW5kZW5jeU5vZGUgPSBkZXBlbmRlbmN5LmluamVjdGVkSW4/LnROb2RlO1xuICAgIGlmIChkZXBlbmRlbmN5Tm9kZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3QgaW5zdGFuY2VOb2RlID0gZ2V0Tm9kZUluamVjdG9yVE5vZGUoaW5qZWN0b3IpO1xuICAgIGFzc2VydFROb2RlKGRlcGVuZGVuY3lOb2RlKTtcbiAgICBhc3NlcnRUTm9kZShpbnN0YW5jZU5vZGUhKTtcblxuICAgIHJldHVybiBkZXBlbmRlbmN5Tm9kZSA9PT0gaW5zdGFuY2VOb2RlO1xuICB9KTtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBjbGFzcyBhc3NvY2lhdGVkIHdpdGggYW4gaW5qZWN0b3IgdGhhdCBjb250YWlucyBhIHByb3ZpZGVyIGBpbXBvcnRzYCBhcnJheSBpbiBpdCdzXG4gKiBkZWZpbml0aW9uXG4gKlxuICogRm9yIE1vZHVsZSBJbmplY3RvcnMgdGhpcyByZXR1cm5zIHRoZSBOZ01vZHVsZSBjb25zdHJ1Y3Rvci5cbiAqXG4gKiBGb3IgU3RhbmRhbG9uZSBpbmplY3RvcnMgdGhpcyByZXR1cm5zIHRoZSBzdGFuZGFsb25lIGNvbXBvbmVudCBjb25zdHJ1Y3Rvci5cbiAqXG4gKiBAcGFyYW0gaW5qZWN0b3IgSW5qZWN0b3IgYW4gaW5qZWN0b3IgaW5zdGFuY2VcbiAqIEByZXR1cm5zIHRoZSBjb25zdHJ1Y3RvciB3aGVyZSB0aGUgYGltcG9ydHNgIGFycmF5IHRoYXQgY29uZmlndXJlcyB0aGlzIGluamVjdG9yIGlzIGxvY2F0ZWRcbiAqL1xuZnVuY3Rpb24gZ2V0UHJvdmlkZXJJbXBvcnRzQ29udGFpbmVyKGluamVjdG9yOiBJbmplY3Rvcik6IFR5cGU8dW5rbm93bj4gfCBudWxsIHtcbiAgY29uc3Qge3N0YW5kYWxvbmVJbmplY3RvclRvQ29tcG9uZW50fSA9IGdldEZyYW1ld29ya0RJRGVidWdEYXRhKCk7XG5cbiAgLy8gc3RhbmRhbG9uZSBjb21wb25lbnRzIGNvbmZpZ3VyZSBwcm92aWRlcnMgdGhyb3VnaCBhIGNvbXBvbmVudCBkZWYsIHNvIHdlIGhhdmUgdG9cbiAgLy8gdXNlIHRoZSBzdGFuZGFsb25lIGNvbXBvbmVudCBhc3NvY2lhdGVkIHdpdGggdGhpcyBpbmplY3RvciBpZiBJbmplY3RvciByZXByZXNlbnRzXG4gIC8vIGEgc3RhbmRhbG9uZSBjb21wb25lbnRzIEVudmlyb25tZW50SW5qZWN0b3JcbiAgaWYgKHN0YW5kYWxvbmVJbmplY3RvclRvQ29tcG9uZW50LmhhcyhpbmplY3RvcikpIHtcbiAgICByZXR1cm4gc3RhbmRhbG9uZUluamVjdG9yVG9Db21wb25lbnQuZ2V0KGluamVjdG9yKSE7XG4gIH1cblxuICAvLyBNb2R1bGUgaW5qZWN0b3JzIGNvbmZpZ3VyZSBwcm92aWRlcnMgdGhyb3VnaCB0aGVpciBOZ01vZHVsZSBkZWYsIHNvIHdlIHVzZSB0aGVcbiAgLy8gaW5qZWN0b3IgdG8gbG9va3VwIGl0cyBOZ01vZHVsZVJlZiBhbmQgdGhyb3VnaCB0aGF0IGdyYWIgaXRzIGluc3RhbmNlXG4gIGNvbnN0IGRlZlR5cGVSZWYgPSBpbmplY3Rvci5nZXQodmlld0VuZ2luZV9OZ01vZHVsZVJlZiwgbnVsbCwge3NlbGY6IHRydWUsIG9wdGlvbmFsOiB0cnVlfSkhO1xuXG4gIC8vIElmIHdlIGNhbid0IGZpbmQgYW4gYXNzb2NpYXRlZCBpbXBvcnRzIGNvbnRhaW5lciwgcmV0dXJuIG51bGwuXG4gIC8vIFRoaXMgY291bGQgYmUgdGhlIGNhc2UgaWYgdGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQgd2l0aCBhbiBSM0luamVjdG9yIHRoYXQgZG9lcyBub3QgcmVwcmVzZW50XG4gIC8vIGEgc3RhbmRhbG9uZSBjb21wb25lbnQgb3IgTmdNb2R1bGUuXG4gIGlmIChkZWZUeXBlUmVmID09PSBudWxsKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvLyBJbiBzdGFuZGFsb25lIGFwcGxpY2F0aW9ucywgdGhlIHJvb3QgZW52aXJvbm1lbnQgaW5qZWN0b3IgY3JlYXRlZCBieSBib290c3RyYXBBcHBsaWNhdGlvblxuICAvLyBtYXkgaGF2ZSBubyBhc3NvY2lhdGVkIFwiaW5zdGFuY2VcIi5cbiAgaWYgKGRlZlR5cGVSZWYuaW5zdGFuY2UgPT09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHJldHVybiBkZWZUeXBlUmVmLmluc3RhbmNlLmNvbnN0cnVjdG9yO1xufVxuXG4vKipcbiAqIEdldHMgdGhlIHByb3ZpZGVycyBjb25maWd1cmVkIG9uIGEgTm9kZUluamVjdG9yXG4gKlxuICogQHBhcmFtIGluamVjdG9yIEEgTm9kZUluamVjdG9yIGluc3RhbmNlXG4gKiBAcmV0dXJucyBQcm92aWRlclJlY29yZFtdIGFuIGFycmF5IG9mIG9iamVjdHMgcmVwcmVzZW50aW5nIHRoZSBwcm92aWRlcnMgY29uZmlndXJlZCBvbiB0aGlzXG4gKiAgICAgaW5qZWN0b3JcbiAqL1xuZnVuY3Rpb24gZ2V0Tm9kZUluamVjdG9yUHJvdmlkZXJzKGluamVjdG9yOiBOb2RlSW5qZWN0b3IpOiBQcm92aWRlclJlY29yZFtdIHtcbiAgY29uc3QgZGlSZXNvbHZlciA9IGdldE5vZGVJbmplY3RvclROb2RlKGluamVjdG9yKTtcbiAgY29uc3Qge3Jlc29sdmVyVG9Qcm92aWRlcnN9ID0gZ2V0RnJhbWV3b3JrRElEZWJ1Z0RhdGEoKTtcbiAgcmV0dXJuIHJlc29sdmVyVG9Qcm92aWRlcnMuZ2V0KGRpUmVzb2x2ZXIgYXMgVE5vZGUpID8/IFtdO1xufVxuXG4vKipcbiAqIEdldHMgYSBtYXBwaW5nIG9mIHByb3ZpZGVycyBjb25maWd1cmVkIG9uIGFuIGluamVjdG9yIHRvIHRoZWlyIGltcG9ydCBwYXRoc1xuICpcbiAqIE1vZHVsZUEgLT4gaW1wb3J0cyBNb2R1bGVCXG4gKiBNb2R1bGVCIC0+IGltcG9ydHMgTW9kdWxlQ1xuICogTW9kdWxlQiAtPiBwcm92aWRlcyBNeVNlcnZpY2VBXG4gKiBNb2R1bGVDIC0+IHByb3ZpZGVzIE15U2VydmljZUJcbiAqXG4gKiBnZXRQcm92aWRlckltcG9ydFBhdGhzKE1vZHVsZUEpXG4gKiA+IE1hcCgyKSB7XG4gKiAgIE15U2VydmljZUEgPT4gW01vZHVsZUEsIE1vZHVsZUJdXG4gKiAgIE15U2VydmljZUIgPT4gW01vZHVsZUEsIE1vZHVsZUIsIE1vZHVsZUNdXG4gKiAgfVxuICpcbiAqIEBwYXJhbSBwcm92aWRlckltcG9ydHNDb250YWluZXIgY29uc3RydWN0b3Igb2YgY2xhc3MgdGhhdCBjb250YWlucyBhbiBgaW1wb3J0c2AgYXJyYXkgaW4gaXQnc1xuICogICAgIGRlZmluaXRpb25cbiAqIEByZXR1cm5zIEEgTWFwIG9iamVjdCB0aGF0IG1hcHMgcHJvdmlkZXJzIHRvIGFuIGFycmF5IG9mIGNvbnN0cnVjdG9ycyByZXByZXNlbnRpbmcgaXQncyBpbXBvcnRcbiAqICAgICBwYXRoXG4gKlxuICovXG5mdW5jdGlvbiBnZXRQcm92aWRlckltcG9ydFBhdGhzKFxuICBwcm92aWRlckltcG9ydHNDb250YWluZXI6IFR5cGU8dW5rbm93bj4sXG4pOiBNYXA8U2luZ2xlUHJvdmlkZXIsIChUeXBlPHVua25vd24+IHwgSW5qZWN0b3JUeXBlPHVua25vd24+KVtdPiB7XG4gIGNvbnN0IHByb3ZpZGVyVG9QYXRoID0gbmV3IE1hcDxTaW5nbGVQcm92aWRlciwgKFR5cGU8dW5rbm93bj4gfCBJbmplY3RvclR5cGU8dW5rbm93bj4pW10+KCk7XG4gIGNvbnN0IHZpc2l0ZWRDb250YWluZXJzID0gbmV3IFNldDxUeXBlPHVua25vd24+PigpO1xuICBjb25zdCB2aXNpdG9yID0gd2Fsa1Byb3ZpZGVyVHJlZVRvRGlzY292ZXJJbXBvcnRQYXRocyhwcm92aWRlclRvUGF0aCwgdmlzaXRlZENvbnRhaW5lcnMpO1xuXG4gIHdhbGtQcm92aWRlclRyZWUocHJvdmlkZXJJbXBvcnRzQ29udGFpbmVyLCB2aXNpdG9yLCBbXSwgbmV3IFNldCgpKTtcblxuICByZXR1cm4gcHJvdmlkZXJUb1BhdGg7XG59XG5cbi8qKlxuICpcbiAqIEhpZ2hlciBvcmRlciBmdW5jdGlvbiB0aGF0IHJldHVybnMgYSB2aXNpdG9yIGZvciBXYWxrUHJvdmlkZXJUcmVlXG4gKlxuICogVGFrZXMgaW4gYSBNYXAgYW5kIFNldCB0byBrZWVwIHRyYWNrIG9mIHRoZSBwcm92aWRlcnMgYW5kIGNvbnRhaW5lcnNcbiAqIHZpc2l0ZWQsIHNvIHRoYXQgd2UgY2FuIGRpc2NvdmVyIHRoZSBpbXBvcnQgcGF0aHMgb2YgdGhlc2UgcHJvdmlkZXJzXG4gKiBkdXJpbmcgdGhlIHRyYXZlcnNhbC5cbiAqXG4gKiBUaGlzIHZpc2l0b3IgdGFrZXMgYWR2YW50YWdlIG9mIHRoZSBmYWN0IHRoYXQgd2Fsa1Byb3ZpZGVyVHJlZSBwZXJmb3JtcyBhXG4gKiBwb3N0b3JkZXIgdHJhdmVyc2FsIG9mIHRoZSBwcm92aWRlciB0cmVlIGZvciB0aGUgcGFzc2VkIGluIGNvbnRhaW5lci4gQmVjYXVzZSBwb3N0b3JkZXJcbiAqIHRyYXZlcnNhbCByZWN1cnNpdmVseSBwcm9jZXNzZXMgc3VidHJlZXMgZnJvbSBsZWFmIG5vZGVzIHVudGlsIHRoZSB0cmF2ZXJzYWwgcmVhY2hlcyB0aGUgcm9vdCxcbiAqIHdlIHdyaXRlIGEgdmlzaXRvciB0aGF0IGNvbnN0cnVjdHMgcHJvdmlkZXIgaW1wb3J0IHBhdGhzIGluIHJldmVyc2UuXG4gKlxuICpcbiAqIFdlIHVzZSB0aGUgdmlzaXRlZENvbnRhaW5lcnMgc2V0IGRlZmluZWQgb3V0c2lkZSB0aGlzIHZpc2l0b3JcbiAqIGJlY2F1c2Ugd2Ugd2FudCB0byBydW4gc29tZSBsb2dpYyBvbmx5IG9uY2UgZm9yXG4gKiBlYWNoIGNvbnRhaW5lciBpbiB0aGUgdHJlZS4gVGhhdCBsb2dpYyBjYW4gYmUgZGVzY3JpYmVkIGFzOlxuICpcbiAqXG4gKiAxLiBmb3IgZWFjaCBkaXNjb3ZlcmVkX3Byb3ZpZGVyIGFuZCBkaXNjb3ZlcmVkX3BhdGggaW4gdGhlIGluY29tcGxldGUgcHJvdmlkZXIgcGF0aHMgd2UndmVcbiAqIGFscmVhZHkgZGlzY292ZXJlZFxuICogMi4gZ2V0IHRoZSBmaXJzdCBjb250YWluZXIgaW4gZGlzY292ZXJlZF9wYXRoXG4gKiAzLiBpZiB0aGF0IGZpcnN0IGNvbnRhaW5lciBpcyBpbiB0aGUgaW1wb3J0cyBhcnJheSBvZiB0aGUgY29udGFpbmVyIHdlJ3JlIHZpc2l0aW5nXG4gKiAgICBUaGVuIHRoZSBjb250YWluZXIgd2UncmUgdmlzaXRpbmcgaXMgYWxzbyBpbiB0aGUgaW1wb3J0IHBhdGggb2YgZGlzY292ZXJlZF9wcm92aWRlciwgc28gd2VcbiAqICAgIHVuc2hpZnQgZGlzY292ZXJlZF9wYXRoIHdpdGggdGhlIGNvbnRhaW5lciB3ZSdyZSBjdXJyZW50bHkgdmlzaXRpbmdcbiAqXG4gKlxuICogRXhhbXBsZSBSdW46XG4gKiBgYGBcbiAqICAgICAgICAgICAgICAgICDilIzilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJBcbiAqICAgICAgICAgICAgICAgICDilIJjb250YWluZXJB4pSCXG4gKiAgICAgIOKUjOKUgGltcG9ydHMt4pSA4pSkICAgICAgICAgIOKUnOKUgOKUgGltcG9ydHPilIDilJBcbiAqICAgICAg4pSCICAgICAgICAgIOKUgiAgcHJvdkEgICDilIIgICAgICAgICAg4pSCXG4gKiAgICAgIOKUgiAgICAgICAgICDilIIgIHByb3ZCICAg4pSCICAgICAgICAgIOKUglxuICogICAgICDilIIgICAgICAgICAg4pSU4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSYICAgICAgICAgIOKUglxuICogICAgICDilIIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKUglxuICogICAgIOKUjOKWvOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUkCAgICAgICAgICAgICDilIzilIDilIDilIDilIDilIDilIDilIDilIDilrzilIDilJBcbiAqICAgICDilIJjb250YWluZXJC4pSCICAgICAgICAgICAgIOKUgmNvbnRhaW5lckPilIJcbiAqICAgICDilIIgICAgICAgICAg4pSCICAgICAgICAgICAgIOKUgiAgICAgICAgICDilIJcbiAqICAgICDilIIgIHByb3ZEICAg4pSCICAgICAgICAgICAgIOKUgiAgcHJvdkYgICDilIJcbiAqICAgICDilIIgIHByb3ZFICAg4pSCICAgICAgICAgICAgIOKUgiAgcHJvdkcgICDilIJcbiAqICAgICDilJTilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJggICAgICAgICAgICAg4pSU4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSYXG4gKiBgYGBcbiAqXG4gKiBFYWNoIHN0ZXAgb2YgdGhlIHRyYXZlcnNhbCxcbiAqXG4gKiBgYGBcbiAqIHZpc2l0b3IocHJvdkQsIGNvbnRhaW5lckIpXG4gKiBwcm92aWRlclRvUGF0aCA9PT0gTWFwIHsgcHJvdkQgPT4gW2NvbnRhaW5lckJdIH1cbiAqIHZpc2l0ZWRDb250YWluZXJzID09PSBTZXQgeyBjb250YWluZXJCIH1cbiAqXG4gKiB2aXNpdG9yKHByb3ZFLCBjb250YWluZXJCKVxuICogcHJvdmlkZXJUb1BhdGggPT09IE1hcCB7IHByb3ZEID0+IFtjb250YWluZXJCXSwgcHJvdkUgPT4gW2NvbnRhaW5lckJdIH1cbiAqIHZpc2l0ZWRDb250YWluZXJzID09PSBTZXQgeyBjb250YWluZXJCIH1cbiAqXG4gKiB2aXNpdG9yKHByb3ZGLCBjb250YWluZXJDKVxuICogcHJvdmlkZXJUb1BhdGggPT09IE1hcCB7IHByb3ZEID0+IFtjb250YWluZXJCXSwgcHJvdkUgPT4gW2NvbnRhaW5lckJdLCBwcm92RiA9PiBbY29udGFpbmVyQ10gfVxuICogdmlzaXRlZENvbnRhaW5lcnMgPT09IFNldCB7IGNvbnRhaW5lckIsIGNvbnRhaW5lckMgfVxuICpcbiAqIHZpc2l0b3IocHJvdkcsIGNvbnRhaW5lckMpXG4gKiBwcm92aWRlclRvUGF0aCA9PT0gTWFwIHtcbiAqICAgcHJvdkQgPT4gW2NvbnRhaW5lckJdLCBwcm92RSA9PiBbY29udGFpbmVyQl0sIHByb3ZGID0+IFtjb250YWluZXJDXSwgcHJvdkcgPT4gW2NvbnRhaW5lckNdXG4gKiB9XG4gKiB2aXNpdGVkQ29udGFpbmVycyA9PT0gU2V0IHsgY29udGFpbmVyQiwgY29udGFpbmVyQyB9XG4gKlxuICogdmlzaXRvcihwcm92QSwgY29udGFpbmVyQSlcbiAqIHByb3ZpZGVyVG9QYXRoID09PSBNYXAge1xuICogICBwcm92RCA9PiBbY29udGFpbmVyQSwgY29udGFpbmVyQl0sXG4gKiAgIHByb3ZFID0+IFtjb250YWluZXJBLCBjb250YWluZXJCXSxcbiAqICAgcHJvdkYgPT4gW2NvbnRhaW5lckEsIGNvbnRhaW5lckNdLFxuICogICBwcm92RyA9PiBbY29udGFpbmVyQSwgY29udGFpbmVyQ10sXG4gKiAgIHByb3ZBID0+IFtjb250YWluZXJBXVxuICogfVxuICogdmlzaXRlZENvbnRhaW5lcnMgPT09IFNldCB7IGNvbnRhaW5lckIsIGNvbnRhaW5lckMsIGNvbnRhaW5lckEgfVxuICpcbiAqIHZpc2l0b3IocHJvdkIsIGNvbnRhaW5lckEpXG4gKiBwcm92aWRlclRvUGF0aCA9PT0gTWFwIHtcbiAqICAgcHJvdkQgPT4gW2NvbnRhaW5lckEsIGNvbnRhaW5lckJdLFxuICogICBwcm92RSA9PiBbY29udGFpbmVyQSwgY29udGFpbmVyQl0sXG4gKiAgIHByb3ZGID0+IFtjb250YWluZXJBLCBjb250YWluZXJDXSxcbiAqICAgcHJvdkcgPT4gW2NvbnRhaW5lckEsIGNvbnRhaW5lckNdLFxuICogICBwcm92QSA9PiBbY29udGFpbmVyQV1cbiAqICAgcHJvdkIgPT4gW2NvbnRhaW5lckFdXG4gKiB9XG4gKiB2aXNpdGVkQ29udGFpbmVycyA9PT0gU2V0IHsgY29udGFpbmVyQiwgY29udGFpbmVyQywgY29udGFpbmVyQSB9XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gcHJvdmlkZXJUb1BhdGggTWFwIG1hcCBvZiBwcm92aWRlcnMgdG8gcGF0aHMgdGhhdCB0aGlzIGZ1bmN0aW9uIGZpbGxzXG4gKiBAcGFyYW0gdmlzaXRlZENvbnRhaW5lcnMgU2V0IGEgc2V0IHRvIGtlZXAgdHJhY2sgb2YgdGhlIGNvbnRhaW5lcnMgd2UndmUgYWxyZWFkeSB2aXNpdGVkXG4gKiBAcmV0dXJuIGZ1bmN0aW9uKHByb3ZpZGVyIFNpbmdsZVByb3ZpZGVyLCBjb250YWluZXI6IFR5cGU8dW5rbm93bj4gfCBJbmplY3RvclR5cGU8dW5rbm93bj4pID0+XG4gKiAgICAgdm9pZFxuICovXG5mdW5jdGlvbiB3YWxrUHJvdmlkZXJUcmVlVG9EaXNjb3ZlckltcG9ydFBhdGhzKFxuICBwcm92aWRlclRvUGF0aDogTWFwPFNpbmdsZVByb3ZpZGVyLCAoVHlwZTx1bmtub3duPiB8IEluamVjdG9yVHlwZTx1bmtub3duPilbXT4sXG4gIHZpc2l0ZWRDb250YWluZXJzOiBTZXQ8VHlwZTx1bmtub3duPj4sXG4pOiAocHJvdmlkZXI6IFNpbmdsZVByb3ZpZGVyLCBjb250YWluZXI6IFR5cGU8dW5rbm93bj4gfCBJbmplY3RvclR5cGU8dW5rbm93bj4pID0+IHZvaWQge1xuICByZXR1cm4gKHByb3ZpZGVyOiBTaW5nbGVQcm92aWRlciwgY29udGFpbmVyOiBUeXBlPHVua25vd24+IHwgSW5qZWN0b3JUeXBlPHVua25vd24+KSA9PiB7XG4gICAgLy8gSWYgdGhlIHByb3ZpZGVyIGlzIG5vdCBhbHJlYWR5IGluIHRoZSBwcm92aWRlclRvUGF0aCBtYXAsXG4gICAgLy8gYWRkIGFuIGVudHJ5IHdpdGggdGhlIHByb3ZpZGVyIGFzIHRoZSBrZXkgYW5kIGFuIGFycmF5IGNvbnRhaW5pbmcgdGhlIGN1cnJlbnQgY29udGFpbmVyIGFzXG4gICAgLy8gdGhlIHZhbHVlXG4gICAgaWYgKCFwcm92aWRlclRvUGF0aC5oYXMocHJvdmlkZXIpKSB7XG4gICAgICBwcm92aWRlclRvUGF0aC5zZXQocHJvdmlkZXIsIFtjb250YWluZXJdKTtcbiAgICB9XG5cbiAgICAvLyBUaGlzIGJsb2NrIHdpbGwgcnVuIGV4YWN0bHkgb25jZSBmb3IgZWFjaCBjb250YWluZXIgaW4gdGhlIGltcG9ydCB0cmVlLlxuICAgIC8vIFRoaXMgaXMgd2hlcmUgd2UgcnVuIHRoZSBsb2dpYyB0byBjaGVjayB0aGUgaW1wb3J0cyBhcnJheSBvZiB0aGUgY3VycmVudFxuICAgIC8vIGNvbnRhaW5lciB0byBzZWUgaWYgaXQncyB0aGUgbmV4dCBjb250YWluZXIgaW4gdGhlIHBhdGggZm9yIG91ciBjdXJyZW50bHlcbiAgICAvLyBkaXNjb3ZlcmVkIHByb3ZpZGVycy5cbiAgICBpZiAoIXZpc2l0ZWRDb250YWluZXJzLmhhcyhjb250YWluZXIpKSB7XG4gICAgICAvLyBJdGVyYXRlIHRocm91Z2ggdGhlIHByb3ZpZGVycyB3ZSd2ZSBhbHJlYWR5IHNlZW5cbiAgICAgIGZvciAoY29uc3QgcHJvdiBvZiBwcm92aWRlclRvUGF0aC5rZXlzKCkpIHtcbiAgICAgICAgY29uc3QgZXhpc3RpbmdJbXBvcnRQYXRoID0gcHJvdmlkZXJUb1BhdGguZ2V0KHByb3YpITtcblxuICAgICAgICBsZXQgY29udGFpbmVyRGVmID0gZ2V0SW5qZWN0b3JEZWYoY29udGFpbmVyKTtcbiAgICAgICAgaWYgKCFjb250YWluZXJEZWYpIHtcbiAgICAgICAgICBjb25zdCBuZ01vZHVsZTogVHlwZTx1bmtub3duPiB8IHVuZGVmaW5lZCA9IChjb250YWluZXIgYXMgYW55KS5uZ01vZHVsZSBhc1xuICAgICAgICAgICAgfCBUeXBlPHVua25vd24+XG4gICAgICAgICAgICB8IHVuZGVmaW5lZDtcbiAgICAgICAgICBjb250YWluZXJEZWYgPSBnZXRJbmplY3RvckRlZihuZ01vZHVsZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWNvbnRhaW5lckRlZikge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGxhc3RDb250YWluZXJBZGRlZFRvUGF0aCA9IGV4aXN0aW5nSW1wb3J0UGF0aFswXTtcblxuICAgICAgICBsZXQgaXNOZXh0U3RlcEluUGF0aCA9IGZhbHNlO1xuICAgICAgICBkZWVwRm9yRWFjaChjb250YWluZXJEZWYuaW1wb3J0cywgKG1vZHVsZUltcG9ydCkgPT4ge1xuICAgICAgICAgIGlmIChpc05leHRTdGVwSW5QYXRoKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaXNOZXh0U3RlcEluUGF0aCA9XG4gICAgICAgICAgICAobW9kdWxlSW1wb3J0IGFzIGFueSkubmdNb2R1bGUgPT09IGxhc3RDb250YWluZXJBZGRlZFRvUGF0aCB8fFxuICAgICAgICAgICAgbW9kdWxlSW1wb3J0ID09PSBsYXN0Q29udGFpbmVyQWRkZWRUb1BhdGg7XG5cbiAgICAgICAgICBpZiAoaXNOZXh0U3RlcEluUGF0aCkge1xuICAgICAgICAgICAgcHJvdmlkZXJUb1BhdGguZ2V0KHByb3YpPy51bnNoaWZ0KGNvbnRhaW5lcik7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2aXNpdGVkQ29udGFpbmVycy5hZGQoY29udGFpbmVyKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBwcm92aWRlcnMgY29uZmlndXJlZCBvbiBhbiBFbnZpcm9ubWVudEluamVjdG9yXG4gKlxuICogQHBhcmFtIGluamVjdG9yIEVudmlyb25tZW50SW5qZWN0b3JcbiAqIEByZXR1cm5zIGFuIGFycmF5IG9mIG9iamVjdHMgcmVwcmVzZW50aW5nIHRoZSBwcm92aWRlcnMgb2YgdGhlIGdpdmVuIGluamVjdG9yXG4gKi9cbmZ1bmN0aW9uIGdldEVudmlyb25tZW50SW5qZWN0b3JQcm92aWRlcnMoaW5qZWN0b3I6IEVudmlyb25tZW50SW5qZWN0b3IpOiBQcm92aWRlclJlY29yZFtdIHtcbiAgY29uc3QgcHJvdmlkZXJSZWNvcmRzV2l0aG91dEltcG9ydFBhdGhzID1cbiAgICBnZXRGcmFtZXdvcmtESURlYnVnRGF0YSgpLnJlc29sdmVyVG9Qcm92aWRlcnMuZ2V0KGluamVjdG9yKSA/PyBbXTtcblxuICAvLyBwbGF0Zm9ybSBpbmplY3RvciBoYXMgbm8gcHJvdmlkZXIgaW1wb3J0cyBjb250YWluZXIgc28gY2FuIHdlIHNraXAgdHJ5aW5nIHRvXG4gIC8vIGZpbmQgaW1wb3J0IHBhdGhzXG4gIGlmIChpc1BsYXRmb3JtSW5qZWN0b3IoaW5qZWN0b3IpKSB7XG4gICAgcmV0dXJuIHByb3ZpZGVyUmVjb3Jkc1dpdGhvdXRJbXBvcnRQYXRocztcbiAgfVxuXG4gIGNvbnN0IHByb3ZpZGVySW1wb3J0c0NvbnRhaW5lciA9IGdldFByb3ZpZGVySW1wb3J0c0NvbnRhaW5lcihpbmplY3Rvcik7XG4gIGlmIChwcm92aWRlckltcG9ydHNDb250YWluZXIgPT09IG51bGwpIHtcbiAgICAvLyBXZSBhc3N1bWUgdGhhdCBpZiBhbiBlbnZpcm9ubWVudCBpbmplY3RvciBleGlzdHMgd2l0aG91dCBhbiBhc3NvY2lhdGVkIHByb3ZpZGVyIGltcG9ydHNcbiAgICAvLyBjb250YWluZXIsIGl0IHdhcyBjcmVhdGVkIHdpdGhvdXQgc3VjaCBhIGNvbnRhaW5lci4gU29tZSBleGFtcGxlcyBjYXNlcyB3aGVyZSB0aGlzIGNvdWxkXG4gICAgLy8gaGFwcGVuOlxuICAgIC8vIC0gVGhlIHJvb3QgaW5qZWN0b3Igb2YgYSBzdGFuZGFsb25lIGFwcGxpY2F0aW9uXG4gICAgLy8gLSBBIHJvdXRlciBpbmplY3RvciBjcmVhdGVkIGJ5IHVzaW5nIHRoZSBwcm92aWRlcnMgYXJyYXkgaW4gYSBsYXp5IGxvYWRlZCByb3V0ZVxuICAgIC8vIC0gQSBtYW51YWxseSBjcmVhdGVkIGluamVjdG9yIHRoYXQgaXMgYXR0YWNoZWQgdG8gdGhlIGluamVjdG9yIHRyZWVcbiAgICAvLyBTaW5jZSBlYWNoIG9mIHRoZXNlIGNhc2VzIGhhcyBubyBwcm92aWRlciBjb250YWluZXIsIHRoZXJlIGlzIG5vIGNvbmNlcHQgb2YgaW1wb3J0IHBhdGhzLFxuICAgIC8vIHNvIHdlIGNhbiBzaW1wbHkgcmV0dXJuIHRoZSBwcm92aWRlciByZWNvcmRzLlxuICAgIHJldHVybiBwcm92aWRlclJlY29yZHNXaXRob3V0SW1wb3J0UGF0aHM7XG4gIH1cblxuICBjb25zdCBwcm92aWRlclRvUGF0aCA9IGdldFByb3ZpZGVySW1wb3J0UGF0aHMocHJvdmlkZXJJbXBvcnRzQ29udGFpbmVyKTtcbiAgY29uc3QgcHJvdmlkZXJSZWNvcmRzID0gW107XG5cbiAgZm9yIChjb25zdCBwcm92aWRlclJlY29yZCBvZiBwcm92aWRlclJlY29yZHNXaXRob3V0SW1wb3J0UGF0aHMpIHtcbiAgICBjb25zdCBwcm92aWRlciA9IHByb3ZpZGVyUmVjb3JkLnByb3ZpZGVyO1xuICAgIC8vIElnbm9yZSB0aGVzZSBzcGVjaWFsIHByb3ZpZGVycyBmb3Igbm93IHVudGlsIHdlIGhhdmUgYSBjbGVhbmVyIHdheSBvZlxuICAgIC8vIGRldGVybWluZyB3aGVuIHRoZXkgYXJlIHByb3ZpZGVkIGJ5IHRoZSBmcmFtZXdvcmsgdnMgcHJvdmlkZWQgYnkgdGhlIHVzZXIuXG4gICAgY29uc3QgdG9rZW4gPSAocHJvdmlkZXIgYXMgVmFsdWVQcm92aWRlcikucHJvdmlkZTtcbiAgICBpZiAodG9rZW4gPT09IEVOVklST05NRU5UX0lOSVRJQUxJWkVSIHx8IHRva2VuID09PSBJTkpFQ1RPUl9ERUZfVFlQRVMpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGxldCBpbXBvcnRQYXRoID0gcHJvdmlkZXJUb1BhdGguZ2V0KHByb3ZpZGVyKSA/PyBbXTtcblxuICAgIGNvbnN0IGRlZiA9IGdldENvbXBvbmVudERlZihwcm92aWRlckltcG9ydHNDb250YWluZXIpO1xuICAgIGNvbnN0IGlzU3RhbmRhbG9uZUNvbXBvbmVudCA9ICEhZGVmPy5zdGFuZGFsb25lO1xuICAgIC8vIFdlIHByZXBlbmQgdGhlIGNvbXBvbmVudCBjb25zdHJ1Y3RvciBpbiB0aGUgc3RhbmRhbG9uZSBjYXNlXG4gICAgLy8gYmVjYXVzZSB3YWxrUHJvdmlkZXJUcmVlIGRvZXMgbm90IHZpc2l0IHRoaXMgY29uc3RydWN0b3IgZHVyaW5nIGl0J3MgdHJhdmVyc2FsXG4gICAgaWYgKGlzU3RhbmRhbG9uZUNvbXBvbmVudCkge1xuICAgICAgaW1wb3J0UGF0aCA9IFtwcm92aWRlckltcG9ydHNDb250YWluZXIsIC4uLmltcG9ydFBhdGhdO1xuICAgIH1cblxuICAgIHByb3ZpZGVyUmVjb3Jkcy5wdXNoKHsuLi5wcm92aWRlclJlY29yZCwgaW1wb3J0UGF0aH0pO1xuICB9XG4gIHJldHVybiBwcm92aWRlclJlY29yZHM7XG59XG5cbmZ1bmN0aW9uIGlzUGxhdGZvcm1JbmplY3RvcihpbmplY3RvcjogSW5qZWN0b3IpIHtcbiAgcmV0dXJuIGluamVjdG9yIGluc3RhbmNlb2YgUjNJbmplY3RvciAmJiBpbmplY3Rvci5zY29wZXMuaGFzKCdwbGF0Zm9ybScpO1xufVxuXG4vKipcbiAqIEdldHMgdGhlIHByb3ZpZGVycyBjb25maWd1cmVkIG9uIGFuIGluamVjdG9yLlxuICpcbiAqIEBwYXJhbSBpbmplY3RvciB0aGUgaW5qZWN0b3IgdG8gbG9va3VwIHRoZSBwcm92aWRlcnMgb2ZcbiAqIEByZXR1cm5zIFByb3ZpZGVyUmVjb3JkW10gYW4gYXJyYXkgb2Ygb2JqZWN0cyByZXByZXNlbnRpbmcgdGhlIHByb3ZpZGVycyBvZiB0aGUgZ2l2ZW4gaW5qZWN0b3JcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEluamVjdG9yUHJvdmlkZXJzKGluamVjdG9yOiBJbmplY3Rvcik6IFByb3ZpZGVyUmVjb3JkW10ge1xuICBpZiAoaW5qZWN0b3IgaW5zdGFuY2VvZiBOb2RlSW5qZWN0b3IpIHtcbiAgICByZXR1cm4gZ2V0Tm9kZUluamVjdG9yUHJvdmlkZXJzKGluamVjdG9yKTtcbiAgfSBlbHNlIGlmIChpbmplY3RvciBpbnN0YW5jZW9mIEVudmlyb25tZW50SW5qZWN0b3IpIHtcbiAgICByZXR1cm4gZ2V0RW52aXJvbm1lbnRJbmplY3RvclByb3ZpZGVycyhpbmplY3RvciBhcyBFbnZpcm9ubWVudEluamVjdG9yKTtcbiAgfVxuXG4gIHRocm93RXJyb3IoJ2dldEluamVjdG9yUHJvdmlkZXJzIG9ubHkgc3VwcG9ydHMgTm9kZUluamVjdG9yIGFuZCBFbnZpcm9ubWVudEluamVjdG9yJyk7XG59XG5cbi8qKlxuICpcbiAqIEdpdmVuIGFuIGluamVjdG9yLCB0aGlzIGZ1bmN0aW9uIHdpbGwgcmV0dXJuXG4gKiBhbiBvYmplY3QgY29udGFpbmluZyB0aGUgdHlwZSBhbmQgc291cmNlIG9mIHRoZSBpbmplY3Rvci5cbiAqXG4gKiB8ICAgICAgICAgICAgICB8IHR5cGUgICAgICAgIHwgc291cmNlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogfC0tLS0tLS0tLS0tLS0tfC0tLS0tLS0tLS0tLS18LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLXxcbiAqIHwgTm9kZUluamVjdG9yIHwgZWxlbWVudCAgICAgfCBET00gZWxlbWVudCB0aGF0IGNyZWF0ZWQgdGhpcyBpbmplY3RvciAgICAgICAgICAgICAgICAgICAgICB8XG4gKiB8IFIzSW5qZWN0b3IgICB8IGVudmlyb25tZW50IHwgYGluamVjdG9yLnNvdXJjZWAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogfCBOdWxsSW5qZWN0b3IgfCBudWxsICAgICAgICB8IG51bGwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqXG4gKiBAcGFyYW0gaW5qZWN0b3IgdGhlIEluamVjdG9yIHRvIGdldCBtZXRhZGF0YSBmb3JcbiAqIEByZXR1cm5zIGFuIG9iamVjdCBjb250YWluaW5nIHRoZSB0eXBlIGFuZCBzb3VyY2Ugb2YgdGhlIGdpdmVuIGluamVjdG9yLiBJZiB0aGUgaW5qZWN0b3IgbWV0YWRhdGFcbiAqICAgICBjYW5ub3QgYmUgZGV0ZXJtaW5lZCwgcmV0dXJucyBudWxsLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0SW5qZWN0b3JNZXRhZGF0YShcbiAgaW5qZWN0b3I6IEluamVjdG9yLFxuKTpcbiAgfCB7dHlwZTogJ2VsZW1lbnQnOyBzb3VyY2U6IFJFbGVtZW50fVxuICB8IHt0eXBlOiAnZW52aXJvbm1lbnQnOyBzb3VyY2U6IHN0cmluZyB8IG51bGx9XG4gIHwge3R5cGU6ICdudWxsJzsgc291cmNlOiBudWxsfVxuICB8IG51bGwge1xuICBpZiAoaW5qZWN0b3IgaW5zdGFuY2VvZiBOb2RlSW5qZWN0b3IpIHtcbiAgICBjb25zdCBsVmlldyA9IGdldE5vZGVJbmplY3RvckxWaWV3KGluamVjdG9yKTtcbiAgICBjb25zdCB0Tm9kZSA9IGdldE5vZGVJbmplY3RvclROb2RlKGluamVjdG9yKSE7XG4gICAgYXNzZXJ0VE5vZGVGb3JMVmlldyh0Tm9kZSwgbFZpZXcpO1xuXG4gICAgcmV0dXJuIHt0eXBlOiAnZWxlbWVudCcsIHNvdXJjZTogZ2V0TmF0aXZlQnlUTm9kZSh0Tm9kZSwgbFZpZXcpIGFzIFJFbGVtZW50fTtcbiAgfVxuXG4gIGlmIChpbmplY3RvciBpbnN0YW5jZW9mIFIzSW5qZWN0b3IpIHtcbiAgICByZXR1cm4ge3R5cGU6ICdlbnZpcm9ubWVudCcsIHNvdXJjZTogaW5qZWN0b3Iuc291cmNlID8/IG51bGx9O1xuICB9XG5cbiAgaWYgKGluamVjdG9yIGluc3RhbmNlb2YgTnVsbEluamVjdG9yKSB7XG4gICAgcmV0dXJuIHt0eXBlOiAnbnVsbCcsIHNvdXJjZTogbnVsbH07XG4gIH1cblxuICByZXR1cm4gbnVsbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEluamVjdG9yUmVzb2x1dGlvblBhdGgoaW5qZWN0b3I6IEluamVjdG9yKTogSW5qZWN0b3JbXSB7XG4gIGNvbnN0IHJlc29sdXRpb25QYXRoOiBJbmplY3RvcltdID0gW2luamVjdG9yXTtcbiAgZ2V0SW5qZWN0b3JSZXNvbHV0aW9uUGF0aEhlbHBlcihpbmplY3RvciwgcmVzb2x1dGlvblBhdGgpO1xuICByZXR1cm4gcmVzb2x1dGlvblBhdGg7XG59XG5cbmZ1bmN0aW9uIGdldEluamVjdG9yUmVzb2x1dGlvblBhdGhIZWxwZXIoXG4gIGluamVjdG9yOiBJbmplY3RvcixcbiAgcmVzb2x1dGlvblBhdGg6IEluamVjdG9yW10sXG4pOiBJbmplY3RvcltdIHtcbiAgY29uc3QgcGFyZW50ID0gZ2V0SW5qZWN0b3JQYXJlbnQoaW5qZWN0b3IpO1xuXG4gIC8vIGlmIGdldEluamVjdG9yUGFyZW50IGNhbid0IGZpbmQgYSBwYXJlbnQsIHRoZW4gd2UndmUgZWl0aGVyIHJlYWNoZWQgdGhlIGVuZFxuICAvLyBvZiB0aGUgcGF0aCwgb3Igd2UgbmVlZCB0byBtb3ZlIGZyb20gdGhlIEVsZW1lbnQgSW5qZWN0b3IgdHJlZSB0byB0aGVcbiAgLy8gbW9kdWxlIGluamVjdG9yIHRyZWUgdXNpbmcgdGhlIGZpcnN0IGluamVjdG9yIGluIG91ciBwYXRoIGFzIHRoZSBjb25uZWN0aW9uIHBvaW50LlxuICBpZiAocGFyZW50ID09PSBudWxsKSB7XG4gICAgaWYgKGluamVjdG9yIGluc3RhbmNlb2YgTm9kZUluamVjdG9yKSB7XG4gICAgICBjb25zdCBmaXJzdEluamVjdG9yID0gcmVzb2x1dGlvblBhdGhbMF07XG4gICAgICBpZiAoZmlyc3RJbmplY3RvciBpbnN0YW5jZW9mIE5vZGVJbmplY3Rvcikge1xuICAgICAgICBjb25zdCBtb2R1bGVJbmplY3RvciA9IGdldE1vZHVsZUluamVjdG9yT2ZOb2RlSW5qZWN0b3IoZmlyc3RJbmplY3Rvcik7XG4gICAgICAgIGlmIChtb2R1bGVJbmplY3RvciA9PT0gbnVsbCkge1xuICAgICAgICAgIHRocm93RXJyb3IoJ05vZGVJbmplY3RvciBtdXN0IGhhdmUgc29tZSBjb25uZWN0aW9uIHRvIHRoZSBtb2R1bGUgaW5qZWN0b3IgdHJlZScpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVzb2x1dGlvblBhdGgucHVzaChtb2R1bGVJbmplY3Rvcik7XG4gICAgICAgIGdldEluamVjdG9yUmVzb2x1dGlvblBhdGhIZWxwZXIobW9kdWxlSW5qZWN0b3IsIHJlc29sdXRpb25QYXRoKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlc29sdXRpb25QYXRoO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICByZXNvbHV0aW9uUGF0aC5wdXNoKHBhcmVudCk7XG4gICAgZ2V0SW5qZWN0b3JSZXNvbHV0aW9uUGF0aEhlbHBlcihwYXJlbnQsIHJlc29sdXRpb25QYXRoKTtcbiAgfVxuXG4gIHJldHVybiByZXNvbHV0aW9uUGF0aDtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBwYXJlbnQgb2YgYW4gaW5qZWN0b3IuXG4gKlxuICogVGhpcyBmdW5jdGlvbiBpcyBub3QgYWJsZSB0byBtYWtlIHRoZSBqdW1wIGZyb20gdGhlIEVsZW1lbnQgSW5qZWN0b3IgVHJlZSB0byB0aGUgTW9kdWxlXG4gKiBpbmplY3RvciB0cmVlLiBUaGlzIGlzIGJlY2F1c2UgdGhlIFwicGFyZW50XCIgKHRoZSBuZXh0IHN0ZXAgaW4gdGhlIHJlb3NsdXRpb24gcGF0aClcbiAqIG9mIGEgcm9vdCBOb2RlSW5qZWN0b3IgaXMgZGVwZW5kZW50IG9uIHdoaWNoIE5vZGVJbmplY3RvciBhbmNlc3RvciBpbml0aWF0ZWRcbiAqIHRoZSBESSBsb29rdXAuIFNlZSBnZXRJbmplY3RvclJlc29sdXRpb25QYXRoIGZvciBhIGZ1bmN0aW9uIHRoYXQgY2FuIG1ha2UgdGhpcyBqdW1wLlxuICpcbiAqIEluIHRoZSBiZWxvdyBkaWFncmFtOlxuICogYGBgdHNcbiAqIGdldEluamVjdG9yUGFyZW50KE5vZGVJbmplY3RvckIpXG4gKiAgPiBOb2RlSW5qZWN0b3JBXG4gKiBnZXRJbmplY3RvclBhcmVudChOb2RlSW5qZWN0b3JBKSAvLyBvciBnZXRJbmplY3RvclBhcmVudChnZXRJbmplY3RvclBhcmVudChOb2RlSW5qZWN0b3JCKSlcbiAqICA+IG51bGwgLy8gY2Fubm90IGp1bXAgdG8gTW9kdWxlSW5qZWN0b3IgdHJlZVxuICogYGBgXG4gKlxuICogYGBgXG4gKiAgICAgICAgICAgICAgICDilIzilIDilIDilIDilIDilIDilIDilIDilJAgICAgICAgICAgICAgICAg4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQXG4gKiAgICDilIzilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilKRNb2R1bGVB4pSc4pSA4pSA4pSASW5qZWN0b3LilIDilIDilIDilIDilrrilIJFbnZpcm9ubWVudEluamVjdG9y4pSCXG4gKiAgICDilIIgICAgICAgICAgIOKUlOKUgOKUgOKUgOKUrOKUgOKUgOKUgOKUmCAgICAgICAgICAgICAgICDilJTilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJhcbiAqICAgIOKUgiAgICAgICAgICAgICAgIOKUglxuICogICAg4pSCICAgICAgICAgICBib290c3RyYXBzXG4gKiAgICDilIIgICAgICAgICAgICAgICDilIJcbiAqICAgIOKUgiAgICAgICAgICAgICAgIOKUglxuICogICAg4pSCICAgICAgICAgIOKUjOKUgOKUgOKUgOKUgOKWvOKUgOKUgOKUgOKUgOKUgOKUkCAgICAgICAgICAgICAgICAg4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQXG4gKiBkZWNsYXJlcyAgICAgIOKUgkNvbXBvbmVudEHilJzilIDilIDilIDilIBJbmplY3RvcuKUgOKUgOKUgOKUgOKWuuKUgk5vZGVJbmplY3RvckHilIJcbiAqICAgIOKUgiAgICAgICAgICDilJTilIDilIDilIDilIDilKzilIDilIDilIDilIDilIDilJggICAgICAgICAgICAgICAgIOKUlOKUgOKUgOKUgOKUgOKUgOKWsuKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUmFxuICogICAg4pSCICAgICAgICAgICAgICAg4pSCICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIJcbiAqICAgIOKUgiAgICAgICAgICAgIHJlbmRlcnMgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnRcbiAqICAgIOKUgiAgICAgICAgICAgICAgIOKUgiAgICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCXG4gKiAgICDilIIgICAgICAgICAg4pSM4pSA4pSA4pSA4pSA4pa84pSA4pSA4pSA4pSA4pSA4pSQICAgICAgICAgICAgICAgICDilIzilIDilIDilIDilIDilIDilLTilIDilIDilIDilIDilIDilIDilIDilJBcbiAqICAgIOKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKWuuKUgkNvbXBvbmVudELilJzilIDilIDilIDilIBJbmplY3RvcuKUgOKUgOKUgOKUgOKWuuKUgk5vZGVJbmplY3RvckLilIJcbiAqICAgICAgICAgICAgICAg4pSU4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSYICAgICAgICAgICAgICAgICDilJTilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJhcbiAqYGBgXG4gKlxuICogQHBhcmFtIGluamVjdG9yIGFuIEluamVjdG9yIHRvIGdldCB0aGUgcGFyZW50IG9mXG4gKiBAcmV0dXJucyBJbmplY3RvciB0aGUgcGFyZW50IG9mIHRoZSBnaXZlbiBpbmplY3RvclxuICovXG5mdW5jdGlvbiBnZXRJbmplY3RvclBhcmVudChpbmplY3RvcjogSW5qZWN0b3IpOiBJbmplY3RvciB8IG51bGwge1xuICBpZiAoaW5qZWN0b3IgaW5zdGFuY2VvZiBSM0luamVjdG9yKSB7XG4gICAgY29uc3QgcGFyZW50ID0gaW5qZWN0b3IucGFyZW50O1xuICAgIGlmIChpc1JvdXRlck91dGxldEluamVjdG9yKHBhcmVudCkpIHtcbiAgICAgIC8vIFRoaXMgaXMgYSBzcGVjaWFsIGNhc2UgZm9yIGEgYENoYWluZWRJbmplY3RvcmAgaW5zdGFuY2UsIHdoaWNoIHJlcHJlc2VudHNcbiAgICAgIC8vIGEgY29tYmluYXRpb24gb2YgYSBSb3V0ZXIncyBgT3V0bGV0SW5qZWN0b3JgIGFuZCBhbiBFbnZpcm9ubWVudEluamVjdG9yLFxuICAgICAgLy8gd2hpY2ggcmVwcmVzZW50cyBhIGBAZGVmZXJgIGJsb2NrLiBTaW5jZSB0aGUgYE91dGxldEluamVjdG9yYCBkb2Vzbid0IHN0b3JlXG4gICAgICAvLyBhbnkgdG9rZW5zIGl0c2VsZiwgd2UgcG9pbnQgdG8gdGhlIHBhcmVudCBpbmplY3RvciBpbnN0ZWFkLiBTZWUgdGhlXG4gICAgICAvLyBgT3V0bGV0SW5qZWN0b3IuX19uZ091dGxldEluamVjdG9yYCBmaWVsZCBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvbi5cbiAgICAgIHJldHVybiAocGFyZW50IGFzIENoYWluZWRJbmplY3RvcikucGFyZW50SW5qZWN0b3I7XG4gICAgfVxuICAgIHJldHVybiBwYXJlbnQ7XG4gIH1cblxuICBsZXQgdE5vZGU6IFRFbGVtZW50Tm9kZSB8IFRDb250YWluZXJOb2RlIHwgVEVsZW1lbnRDb250YWluZXJOb2RlIHwgbnVsbDtcbiAgbGV0IGxWaWV3OiBMVmlldzx1bmtub3duPjtcbiAgaWYgKGluamVjdG9yIGluc3RhbmNlb2YgTm9kZUluamVjdG9yKSB7XG4gICAgdE5vZGUgPSBnZXROb2RlSW5qZWN0b3JUTm9kZShpbmplY3Rvcik7XG4gICAgbFZpZXcgPSBnZXROb2RlSW5qZWN0b3JMVmlldyhpbmplY3Rvcik7XG4gIH0gZWxzZSBpZiAoaW5qZWN0b3IgaW5zdGFuY2VvZiBOdWxsSW5qZWN0b3IpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfSBlbHNlIGlmIChpbmplY3RvciBpbnN0YW5jZW9mIENoYWluZWRJbmplY3Rvcikge1xuICAgIHJldHVybiBpbmplY3Rvci5wYXJlbnRJbmplY3RvcjtcbiAgfSBlbHNlIHtcbiAgICB0aHJvd0Vycm9yKFxuICAgICAgJ2dldEluamVjdG9yUGFyZW50IG9ubHkgc3VwcG9ydCBpbmplY3RvcnMgb2YgdHlwZSBSM0luamVjdG9yLCBOb2RlSW5qZWN0b3IsIE51bGxJbmplY3RvcicsXG4gICAgKTtcbiAgfVxuXG4gIGNvbnN0IHBhcmVudExvY2F0aW9uID0gZ2V0UGFyZW50SW5qZWN0b3JMb2NhdGlvbihcbiAgICB0Tm9kZSBhcyBURWxlbWVudE5vZGUgfCBUQ29udGFpbmVyTm9kZSB8IFRFbGVtZW50Q29udGFpbmVyTm9kZSxcbiAgICBsVmlldyxcbiAgKTtcblxuICBpZiAoaGFzUGFyZW50SW5qZWN0b3IocGFyZW50TG9jYXRpb24pKSB7XG4gICAgY29uc3QgcGFyZW50SW5qZWN0b3JJbmRleCA9IGdldFBhcmVudEluamVjdG9ySW5kZXgocGFyZW50TG9jYXRpb24pO1xuICAgIGNvbnN0IHBhcmVudExWaWV3ID0gZ2V0UGFyZW50SW5qZWN0b3JWaWV3KHBhcmVudExvY2F0aW9uLCBsVmlldyk7XG4gICAgY29uc3QgcGFyZW50VFZpZXcgPSBwYXJlbnRMVmlld1tUVklFV107XG4gICAgY29uc3QgcGFyZW50VE5vZGUgPSBwYXJlbnRUVmlldy5kYXRhW3BhcmVudEluamVjdG9ySW5kZXggKyBOb2RlSW5qZWN0b3JPZmZzZXQuVE5PREVdIGFzIFROb2RlO1xuICAgIHJldHVybiBuZXcgTm9kZUluamVjdG9yKFxuICAgICAgcGFyZW50VE5vZGUgYXMgVEVsZW1lbnROb2RlIHwgVENvbnRhaW5lck5vZGUgfCBURWxlbWVudENvbnRhaW5lck5vZGUsXG4gICAgICBwYXJlbnRMVmlldyxcbiAgICApO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IGNoYWluZWRJbmplY3RvciA9IGxWaWV3W0lOSkVDVE9SXSBhcyBDaGFpbmVkSW5qZWN0b3I7XG5cbiAgICAvLyBDYXNlIHdoZXJlIGNoYWluZWRJbmplY3Rvci5pbmplY3RvciBpcyBhbiBPdXRsZXRJbmplY3RvciBhbmQgY2hhaW5lZEluamVjdG9yLmluamVjdG9yLnBhcmVudFxuICAgIC8vIGlzIGEgTm9kZUluamVjdG9yLlxuICAgIC8vIHRvZG8oYWxla3NhbmRlcmJvZHVycmkpOiBpZGVhbGx5IG5vdGhpbmcgaW4gcGFja2FnZXMvY29yZSBzaG91bGQgZGVhbFxuICAgIC8vIGRpcmVjdGx5IHdpdGggcm91dGVyIGNvbmNlcm5zLiBSZWZhY3RvciB0aGlzIHNvIHRoYXQgd2UgY2FuIG1ha2UgdGhlIGp1bXAgZnJvbVxuICAgIC8vIE5vZGVJbmplY3RvciAtPiBPdXRsZXRJbmplY3RvciAtPiBOb2RlSW5qZWN0b3JcbiAgICAvLyB3aXRob3V0IGV4cGxpY2l0bHkgcmVseWluZyBvbiB0eXBlcyBjb250cmFjdHMgZnJvbSBwYWNrYWdlcy9yb3V0ZXJcbiAgICBjb25zdCBpbmplY3RvclBhcmVudCA9IChjaGFpbmVkSW5qZWN0b3IuaW5qZWN0b3IgYXMgYW55KT8ucGFyZW50IGFzIEluamVjdG9yO1xuXG4gICAgaWYgKGluamVjdG9yUGFyZW50IGluc3RhbmNlb2YgTm9kZUluamVjdG9yKSB7XG4gICAgICByZXR1cm4gaW5qZWN0b3JQYXJlbnQ7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59XG5cbi8qKlxuICogR2V0cyB0aGUgbW9kdWxlIGluamVjdG9yIG9mIGEgTm9kZUluamVjdG9yLlxuICpcbiAqIEBwYXJhbSBpbmplY3RvciBOb2RlSW5qZWN0b3IgdG8gZ2V0IG1vZHVsZSBpbmplY3RvciBvZlxuICogQHJldHVybnMgSW5qZWN0b3IgcmVwcmVzZW50aW5nIG1vZHVsZSBpbmplY3RvciBvZiB0aGUgZ2l2ZW4gTm9kZUluamVjdG9yXG4gKi9cbmZ1bmN0aW9uIGdldE1vZHVsZUluamVjdG9yT2ZOb2RlSW5qZWN0b3IoaW5qZWN0b3I6IE5vZGVJbmplY3Rvcik6IEluamVjdG9yIHtcbiAgbGV0IGxWaWV3OiBMVmlldzx1bmtub3duPjtcbiAgaWYgKGluamVjdG9yIGluc3RhbmNlb2YgTm9kZUluamVjdG9yKSB7XG4gICAgbFZpZXcgPSBnZXROb2RlSW5qZWN0b3JMVmlldyhpbmplY3Rvcik7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3dFcnJvcignZ2V0TW9kdWxlSW5qZWN0b3JPZk5vZGVJbmplY3RvciBtdXN0IGJlIGNhbGxlZCB3aXRoIGEgTm9kZUluamVjdG9yJyk7XG4gIH1cblxuICBjb25zdCBpbmogPSBsVmlld1tJTkpFQ1RPUl0gYXMgUjNJbmplY3RvciB8IENoYWluZWRJbmplY3RvcjtcbiAgY29uc3QgbW9kdWxlSW5qZWN0b3IgPSBpbmogaW5zdGFuY2VvZiBDaGFpbmVkSW5qZWN0b3IgPyBpbmoucGFyZW50SW5qZWN0b3IgOiBpbmoucGFyZW50O1xuICBpZiAoIW1vZHVsZUluamVjdG9yKSB7XG4gICAgdGhyb3dFcnJvcignTm9kZUluamVjdG9yIG11c3QgaGF2ZSBzb21lIGNvbm5lY3Rpb24gdG8gdGhlIG1vZHVsZSBpbmplY3RvciB0cmVlJyk7XG4gIH1cblxuICByZXR1cm4gbW9kdWxlSW5qZWN0b3I7XG59XG4iXX0=