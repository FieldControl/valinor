/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { getInjectorDef } from '../../di/interface/defs';
import { NullInjector } from '../../di/null_injector';
import { walkProviderTree } from '../../di/provider_collection';
import { EnvironmentInjector, R3Injector } from '../../di/r3_injector';
import { NgModuleRef as viewEngine_NgModuleRef } from '../../linker/ng_module_factory';
import { deepForEach } from '../../util/array_utils';
import { throwError } from '../../util/assert';
import { getComponentDef } from '../definition';
import { getNodeInjectorLView, getNodeInjectorTNode, getParentInjectorLocation, NodeInjector } from '../di';
import { getFrameworkDIDebugData } from '../debug/framework_injector_profiler';
import { INJECTOR, TVIEW } from '../interfaces/view';
import { getParentInjectorIndex, getParentInjectorView, hasParentInjector } from './injector_utils';
import { assertTNodeForLView, assertTNode } from '../assert';
import { getNativeByTNode } from './view_utils';
import { INJECTOR_DEF_TYPES } from '../../di/internal_tokens';
import { ENVIRONMENT_INITIALIZER } from '../../di/initializer_token';
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
    const dependencies = unformattedDependencies.map(dep => {
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
            const instance = injectorToCheck.get(dep.token, null, { self: true, optional: true });
            if (instance !== null) {
                // if host flag is true we double check that we can get the service from the first element
                // in the resolution path by using the host flag. This is done to make sure that we've found
                // the correct providing injector, and not a node injector that is connected to our path via
                // a router outlet.
                if (formattedDependency.flags.host) {
                    const firstInjector = resolutionPath[0];
                    const lookupFromFirstInjector = firstInjector.get(dep.token, null, { ...formattedDependency.flags, optional: true });
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
    return dependencies.filter(dependency => {
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
                    isNextStepInPath = moduleImport.ngModule === lastContainerAddedToPath ||
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
        // without explictly relying on types contracts from packages/router
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
    const chainedInjector = lView[INJECTOR];
    const moduleInjector = chainedInjector.parentInjector;
    if (!moduleInjector) {
        throwError('NodeInjector must have some connection to the module injector tree');
    }
    return moduleInjector;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5qZWN0b3JfZGlzY292ZXJ5X3V0aWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvcmVuZGVyMy91dGlsL2luamVjdG9yX2Rpc2NvdmVyeV91dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFJSCxPQUFPLEVBQUMsY0FBYyxFQUFlLE1BQU0seUJBQXlCLENBQUM7QUFFckUsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQ3BELE9BQU8sRUFBaUIsZ0JBQWdCLEVBQUMsTUFBTSw4QkFBOEIsQ0FBQztBQUM5RSxPQUFPLEVBQUMsbUJBQW1CLEVBQUUsVUFBVSxFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFFckUsT0FBTyxFQUFDLFdBQVcsSUFBSSxzQkFBc0IsRUFBQyxNQUFNLGdDQUFnQyxDQUFDO0FBQ3JGLE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUNuRCxPQUFPLEVBQWdCLFVBQVUsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBRTVELE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDOUMsT0FBTyxFQUFDLG9CQUFvQixFQUFFLG9CQUFvQixFQUFFLHlCQUF5QixFQUFFLFlBQVksRUFBQyxNQUFNLE9BQU8sQ0FBQztBQUMxRyxPQUFPLEVBQUMsdUJBQXVCLEVBQUMsTUFBTSxzQ0FBc0MsQ0FBQztBQUk3RSxPQUFPLEVBQUMsUUFBUSxFQUFTLEtBQUssRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBRTFELE9BQU8sRUFBQyxzQkFBc0IsRUFBRSxxQkFBcUIsRUFBRSxpQkFBaUIsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBQ2xHLE9BQU8sRUFBQyxtQkFBbUIsRUFBRSxXQUFXLEVBQUMsTUFBTSxXQUFXLENBQUM7QUFFM0QsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0s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QUFDLG9FQUFvRSxDQUFDLENBQUM7SUFDbkYsQ0FBQztJQUVELE9BQU8sY0FBYyxDQUFDO0FBQ3hCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3Rpb25Ub2tlbn0gZnJvbSAnLi4vLi4vZGkvaW5qZWN0aW9uX3Rva2VuJztcbmltcG9ydCB7SW5qZWN0b3J9IGZyb20gJy4uLy4uL2RpL2luamVjdG9yJztcbmltcG9ydCB7Z2V0SW5qZWN0b3JEZWYsIEluamVjdG9yVHlwZX0gZnJvbSAnLi4vLi4vZGkvaW50ZXJmYWNlL2RlZnMnO1xuaW1wb3J0IHtJbmplY3RGbGFncywgSW50ZXJuYWxJbmplY3RGbGFnc30gZnJvbSAnLi4vLi4vZGkvaW50ZXJmYWNlL2luamVjdG9yJztcbmltcG9ydCB7TnVsbEluamVjdG9yfSBmcm9tICcuLi8uLi9kaS9udWxsX2luamVjdG9yJztcbmltcG9ydCB7U2luZ2xlUHJvdmlkZXIsIHdhbGtQcm92aWRlclRyZWV9IGZyb20gJy4uLy4uL2RpL3Byb3ZpZGVyX2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtFbnZpcm9ubWVudEluamVjdG9yLCBSM0luamVjdG9yfSBmcm9tICcuLi8uLi9kaS9yM19pbmplY3Rvcic7XG5pbXBvcnQge1R5cGV9IGZyb20gJy4uLy4uL2ludGVyZmFjZS90eXBlJztcbmltcG9ydCB7TmdNb2R1bGVSZWYgYXMgdmlld0VuZ2luZV9OZ01vZHVsZVJlZn0gZnJvbSAnLi4vLi4vbGlua2VyL25nX21vZHVsZV9mYWN0b3J5JztcbmltcG9ydCB7ZGVlcEZvckVhY2h9IGZyb20gJy4uLy4uL3V0aWwvYXJyYXlfdXRpbHMnO1xuaW1wb3J0IHthc3NlcnREZWZpbmVkLCB0aHJvd0Vycm9yfSBmcm9tICcuLi8uLi91dGlsL2Fzc2VydCc7XG5pbXBvcnQgdHlwZSB7Q2hhaW5lZEluamVjdG9yfSBmcm9tICcuLi9jb21wb25lbnRfcmVmJztcbmltcG9ydCB7Z2V0Q29tcG9uZW50RGVmfSBmcm9tICcuLi9kZWZpbml0aW9uJztcbmltcG9ydCB7Z2V0Tm9kZUluamVjdG9yTFZpZXcsIGdldE5vZGVJbmplY3RvclROb2RlLCBnZXRQYXJlbnRJbmplY3RvckxvY2F0aW9uLCBOb2RlSW5qZWN0b3J9IGZyb20gJy4uL2RpJztcbmltcG9ydCB7Z2V0RnJhbWV3b3JrRElEZWJ1Z0RhdGF9IGZyb20gJy4uL2RlYnVnL2ZyYW1ld29ya19pbmplY3Rvcl9wcm9maWxlcic7XG5pbXBvcnQge0luamVjdGVkU2VydmljZSwgUHJvdmlkZXJSZWNvcmR9IGZyb20gJy4uL2RlYnVnL2luamVjdG9yX3Byb2ZpbGVyJztcbmltcG9ydCB7Tm9kZUluamVjdG9yT2Zmc2V0fSBmcm9tICcuLi9pbnRlcmZhY2VzL2luamVjdG9yJztcbmltcG9ydCB7VENvbnRhaW5lck5vZGUsIFRFbGVtZW50Q29udGFpbmVyTm9kZSwgVEVsZW1lbnROb2RlLCBUTm9kZX0gZnJvbSAnLi4vaW50ZXJmYWNlcy9ub2RlJztcbmltcG9ydCB7SU5KRUNUT1IsIExWaWV3LCBUVklFV30gZnJvbSAnLi4vaW50ZXJmYWNlcy92aWV3JztcblxuaW1wb3J0IHtnZXRQYXJlbnRJbmplY3RvckluZGV4LCBnZXRQYXJlbnRJbmplY3RvclZpZXcsIGhhc1BhcmVudEluamVjdG9yfSBmcm9tICcuL2luamVjdG9yX3V0aWxzJztcbmltcG9ydCB7YXNzZXJ0VE5vZGVGb3JMVmlldywgYXNzZXJ0VE5vZGV9IGZyb20gJy4uL2Fzc2VydCc7XG5pbXBvcnQge1JFbGVtZW50fSBmcm9tICcuLi9pbnRlcmZhY2VzL3JlbmRlcmVyX2RvbSc7XG5pbXBvcnQge2dldE5hdGl2ZUJ5VE5vZGV9IGZyb20gJy4vdmlld191dGlscyc7XG5pbXBvcnQge0lOSkVDVE9SX0RFRl9UWVBFU30gZnJvbSAnLi4vLi4vZGkvaW50ZXJuYWxfdG9rZW5zJztcbmltcG9ydCB7RU5WSVJPTk1FTlRfSU5JVElBTElaRVJ9IGZyb20gJy4uLy4uL2RpL2luaXRpYWxpemVyX3Rva2VuJztcbmltcG9ydCB7VmFsdWVQcm92aWRlcn0gZnJvbSAnLi4vLi4vZGkvaW50ZXJmYWNlL3Byb3ZpZGVyJztcblxuLyoqXG4gKiBEaXNjb3ZlcnMgdGhlIGRlcGVuZGVuY2llcyBvZiBhbiBpbmplY3RhYmxlIGluc3RhbmNlLiBQcm92aWRlcyBESSBpbmZvcm1hdGlvbiBhYm91dCBlYWNoXG4gKiBkZXBlbmRlbmN5IHRoYXQgdGhlIGluamVjdGFibGUgd2FzIGluc3RhbnRpYXRlZCB3aXRoLCBpbmNsdWRpbmcgd2hlcmUgdGhleSB3ZXJlIHByb3ZpZGVkIGZyb20uXG4gKlxuICogQHBhcmFtIGluamVjdG9yIEFuIGluamVjdG9yIGluc3RhbmNlXG4gKiBAcGFyYW0gdG9rZW4gYSBESSB0b2tlbiB0aGF0IHdhcyBjb25zdHJ1Y3RlZCBieSB0aGUgZ2l2ZW4gaW5qZWN0b3IgaW5zdGFuY2VcbiAqIEByZXR1cm5zIGFuIG9iamVjdCB0aGF0IGNvbnRhaW5zIHRoZSBjcmVhdGVkIGluc3RhbmNlIG9mIHRva2VuIGFzIHdlbGwgYXMgYWxsIG9mIHRoZSBkZXBlbmRlbmNpZXNcbiAqIHRoYXQgaXQgd2FzIGluc3RhbnRpYXRlZCB3aXRoIE9SIHVuZGVmaW5lZCBpZiB0aGUgdG9rZW4gd2FzIG5vdCBjcmVhdGVkIHdpdGhpbiB0aGUgZ2l2ZW5cbiAqIGluamVjdG9yLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RGVwZW5kZW5jaWVzRnJvbUluamVjdGFibGU8VD4oXG4gICAgaW5qZWN0b3I6IEluamVjdG9yLCB0b2tlbjogVHlwZTxUPnxJbmplY3Rpb25Ub2tlbjxUPik6XG4gICAge2luc3RhbmNlOiBUOyBkZXBlbmRlbmNpZXM6IE9taXQ8SW5qZWN0ZWRTZXJ2aWNlLCAnaW5qZWN0ZWRJbic+W119fHVuZGVmaW5lZCB7XG4gIC8vIEZpcnN0IHdlIGNoZWNrIHRvIHNlZSBpZiB0aGUgdG9rZW4gZ2l2ZW4gbWFwcyB0byBhbiBhY3R1YWwgaW5zdGFuY2UgaW4gdGhlIGluamVjdG9yIGdpdmVuLlxuICAvLyBXZSB1c2UgYHNlbGY6IHRydWVgIGJlY2F1c2Ugd2Ugb25seSB3YW50IHRvIGxvb2sgYXQgdGhlIGluamVjdG9yIHdlIHdlcmUgZ2l2ZW4uXG4gIC8vIFdlIHVzZSBgb3B0aW9uYWw6IHRydWVgIGJlY2F1c2UgaXQncyBwb3NzaWJsZSB0aGF0IHRoZSB0b2tlbiB3ZSB3ZXJlIGdpdmVuIHdhcyBuZXZlclxuICAvLyBjb25zdHJ1Y3RlZCBieSB0aGUgaW5qZWN0b3Igd2Ugd2VyZSBnaXZlbi5cbiAgY29uc3QgaW5zdGFuY2UgPSBpbmplY3Rvci5nZXQodG9rZW4sIG51bGwsIHtzZWxmOiB0cnVlLCBvcHRpb25hbDogdHJ1ZX0pO1xuICBpZiAoaW5zdGFuY2UgPT09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFVuYWJsZSB0byBkZXRlcm1pbmUgaW5zdGFuY2Ugb2YgJHt0b2tlbn0gaW4gZ2l2ZW4gaW5qZWN0b3JgKTtcbiAgfVxuXG4gIGNvbnN0IHVuZm9ybWF0dGVkRGVwZW5kZW5jaWVzID0gZ2V0RGVwZW5kZW5jaWVzRm9yVG9rZW5JbkluamVjdG9yKHRva2VuLCBpbmplY3Rvcik7XG4gIGNvbnN0IHJlc29sdXRpb25QYXRoID0gZ2V0SW5qZWN0b3JSZXNvbHV0aW9uUGF0aChpbmplY3Rvcik7XG5cbiAgY29uc3QgZGVwZW5kZW5jaWVzID0gdW5mb3JtYXR0ZWREZXBlbmRlbmNpZXMubWFwKGRlcCA9PiB7XG4gICAgLy8gaW5qZWN0ZWRJbiBjb250YWlucyBwcml2YXRlIGZpZWxkcywgc28gd2Ugb21pdCBpdCBmcm9tIHRoZSByZXNwb25zZVxuICAgIGNvbnN0IGZvcm1hdHRlZERlcGVuZGVuY3k6IE9taXQ8SW5qZWN0ZWRTZXJ2aWNlLCAnaW5qZWN0ZWRJbic+ID0ge1xuICAgICAgdmFsdWU6IGRlcC52YWx1ZSxcbiAgICB9O1xuXG4gICAgLy8gY29udmVydCBpbmplY3Rpb24gZmxhZ3MgdG8gYm9vbGVhbnNcbiAgICBjb25zdCBmbGFncyA9IGRlcC5mbGFncyBhcyBJbnRlcm5hbEluamVjdEZsYWdzO1xuICAgIGZvcm1hdHRlZERlcGVuZGVuY3kuZmxhZ3MgPSB7XG4gICAgICBvcHRpb25hbDogKEludGVybmFsSW5qZWN0RmxhZ3MuT3B0aW9uYWwgJiBmbGFncykgPT09IEludGVybmFsSW5qZWN0RmxhZ3MuT3B0aW9uYWwsXG4gICAgICBob3N0OiAoSW50ZXJuYWxJbmplY3RGbGFncy5Ib3N0ICYgZmxhZ3MpID09PSBJbnRlcm5hbEluamVjdEZsYWdzLkhvc3QsXG4gICAgICBzZWxmOiAoSW50ZXJuYWxJbmplY3RGbGFncy5TZWxmICYgZmxhZ3MpID09PSBJbnRlcm5hbEluamVjdEZsYWdzLlNlbGYsXG4gICAgICBza2lwU2VsZjogKEludGVybmFsSW5qZWN0RmxhZ3MuU2tpcFNlbGYgJiBmbGFncykgPT09IEludGVybmFsSW5qZWN0RmxhZ3MuU2tpcFNlbGYsXG4gICAgfTtcblxuXG4gICAgLy8gZmluZCB0aGUgaW5qZWN0b3IgdGhhdCBwcm92aWRlZCB0aGUgZGVwZW5kZW5jeVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVzb2x1dGlvblBhdGgubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGluamVjdG9yVG9DaGVjayA9IHJlc29sdXRpb25QYXRoW2ldO1xuXG4gICAgICAvLyBpZiBza2lwU2VsZiBpcyB0cnVlIHdlIHNraXAgdGhlIGZpcnN0IGluamVjdG9yXG4gICAgICBpZiAoaSA9PT0gMCAmJiBmb3JtYXR0ZWREZXBlbmRlbmN5LmZsYWdzLnNraXBTZWxmKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBob3N0IG9ubHkgYXBwbGllcyB0byBOb2RlSW5qZWN0b3JzXG4gICAgICBpZiAoZm9ybWF0dGVkRGVwZW5kZW5jeS5mbGFncy5ob3N0ICYmIGluamVjdG9yVG9DaGVjayBpbnN0YW5jZW9mIEVudmlyb25tZW50SW5qZWN0b3IpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGluc3RhbmNlID1cbiAgICAgICAgICBpbmplY3RvclRvQ2hlY2suZ2V0KGRlcC50b2tlbiBhcyBUeXBlPHVua25vd24+LCBudWxsLCB7c2VsZjogdHJ1ZSwgb3B0aW9uYWw6IHRydWV9KTtcblxuICAgICAgaWYgKGluc3RhbmNlICE9PSBudWxsKSB7XG4gICAgICAgIC8vIGlmIGhvc3QgZmxhZyBpcyB0cnVlIHdlIGRvdWJsZSBjaGVjayB0aGF0IHdlIGNhbiBnZXQgdGhlIHNlcnZpY2UgZnJvbSB0aGUgZmlyc3QgZWxlbWVudFxuICAgICAgICAvLyBpbiB0aGUgcmVzb2x1dGlvbiBwYXRoIGJ5IHVzaW5nIHRoZSBob3N0IGZsYWcuIFRoaXMgaXMgZG9uZSB0byBtYWtlIHN1cmUgdGhhdCB3ZSd2ZSBmb3VuZFxuICAgICAgICAvLyB0aGUgY29ycmVjdCBwcm92aWRpbmcgaW5qZWN0b3IsIGFuZCBub3QgYSBub2RlIGluamVjdG9yIHRoYXQgaXMgY29ubmVjdGVkIHRvIG91ciBwYXRoIHZpYVxuICAgICAgICAvLyBhIHJvdXRlciBvdXRsZXQuXG4gICAgICAgIGlmIChmb3JtYXR0ZWREZXBlbmRlbmN5LmZsYWdzLmhvc3QpIHtcbiAgICAgICAgICBjb25zdCBmaXJzdEluamVjdG9yID0gcmVzb2x1dGlvblBhdGhbMF07XG4gICAgICAgICAgY29uc3QgbG9va3VwRnJvbUZpcnN0SW5qZWN0b3IgPSBmaXJzdEluamVjdG9yLmdldChcbiAgICAgICAgICAgICAgZGVwLnRva2VuIGFzIFR5cGU8dW5rbm93bj4sIG51bGwsIHsuLi5mb3JtYXR0ZWREZXBlbmRlbmN5LmZsYWdzLCBvcHRpb25hbDogdHJ1ZX0pO1xuXG4gICAgICAgICAgaWYgKGxvb2t1cEZyb21GaXJzdEluamVjdG9yICE9PSBudWxsKSB7XG4gICAgICAgICAgICBmb3JtYXR0ZWREZXBlbmRlbmN5LnByb3ZpZGVkSW4gPSBpbmplY3RvclRvQ2hlY2s7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBmb3JtYXR0ZWREZXBlbmRlbmN5LnByb3ZpZGVkSW4gPSBpbmplY3RvclRvQ2hlY2s7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICAvLyBpZiBzZWxmIGlzIHRydWUgd2Ugc3RvcCBhZnRlciB0aGUgZmlyc3QgaW5qZWN0b3JcbiAgICAgIGlmIChpID09PSAwICYmIGZvcm1hdHRlZERlcGVuZGVuY3kuZmxhZ3Muc2VsZikge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZGVwLnRva2VuKSBmb3JtYXR0ZWREZXBlbmRlbmN5LnRva2VuID0gZGVwLnRva2VuO1xuXG4gICAgcmV0dXJuIGZvcm1hdHRlZERlcGVuZGVuY3k7XG4gIH0pO1xuXG4gIHJldHVybiB7aW5zdGFuY2UsIGRlcGVuZGVuY2llc307XG59XG5cbmZ1bmN0aW9uIGdldERlcGVuZGVuY2llc0ZvclRva2VuSW5JbmplY3RvcjxUPihcbiAgICB0b2tlbjogVHlwZTxUPnxJbmplY3Rpb25Ub2tlbjxUPiwgaW5qZWN0b3I6IEluamVjdG9yKTogSW5qZWN0ZWRTZXJ2aWNlW10ge1xuICBjb25zdCB7cmVzb2x2ZXJUb1Rva2VuVG9EZXBlbmRlbmNpZXN9ID0gZ2V0RnJhbWV3b3JrRElEZWJ1Z0RhdGEoKTtcblxuICBpZiAoIShpbmplY3RvciBpbnN0YW5jZW9mIE5vZGVJbmplY3RvcikpIHtcbiAgICByZXR1cm4gcmVzb2x2ZXJUb1Rva2VuVG9EZXBlbmRlbmNpZXMuZ2V0KGluamVjdG9yKT8uZ2V0Py4odG9rZW4gYXMgVHlwZTxUPikgPz8gW107XG4gIH1cblxuICBjb25zdCBsVmlldyA9IGdldE5vZGVJbmplY3RvckxWaWV3KGluamVjdG9yKTtcbiAgY29uc3QgdG9rZW5EZXBlbmRlbmN5TWFwID0gcmVzb2x2ZXJUb1Rva2VuVG9EZXBlbmRlbmNpZXMuZ2V0KGxWaWV3KTtcbiAgY29uc3QgZGVwZW5kZW5jaWVzID0gdG9rZW5EZXBlbmRlbmN5TWFwPy5nZXQodG9rZW4gYXMgVHlwZTxUPikgPz8gW107XG5cbiAgLy8gSW4gdGhlIE5vZGVJbmplY3RvciBjYXNlLCBhbGwgaW5qZWN0aW9ucyBmb3IgZXZlcnkgbm9kZSBhcmUgc3RvcmVkIGluIHRoZSBzYW1lIGxWaWV3LlxuICAvLyBXZSB1c2UgdGhlIGluamVjdGVkSW4gZmllbGQgb2YgdGhlIGRlcGVuZGVuY3kgdG8gZmlsdGVyIG91dCB0aGUgZGVwZW5kZW5jaWVzIHRoYXRcbiAgLy8gZG8gbm90IGNvbWUgZnJvbSB0aGUgc2FtZSBub2RlIGFzIHRoZSBpbnN0YW5jZSB3ZSdyZSBsb29raW5nIGF0LlxuICByZXR1cm4gZGVwZW5kZW5jaWVzLmZpbHRlcihkZXBlbmRlbmN5ID0+IHtcbiAgICBjb25zdCBkZXBlbmRlbmN5Tm9kZSA9IGRlcGVuZGVuY3kuaW5qZWN0ZWRJbj8udE5vZGU7XG4gICAgaWYgKGRlcGVuZGVuY3lOb2RlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCBpbnN0YW5jZU5vZGUgPSBnZXROb2RlSW5qZWN0b3JUTm9kZShpbmplY3Rvcik7XG4gICAgYXNzZXJ0VE5vZGUoZGVwZW5kZW5jeU5vZGUpO1xuICAgIGFzc2VydFROb2RlKGluc3RhbmNlTm9kZSEpO1xuXG4gICAgcmV0dXJuIGRlcGVuZGVuY3lOb2RlID09PSBpbnN0YW5jZU5vZGU7XG4gIH0pO1xufVxuXG4vKipcbiAqIEdldHMgdGhlIGNsYXNzIGFzc29jaWF0ZWQgd2l0aCBhbiBpbmplY3RvciB0aGF0IGNvbnRhaW5zIGEgcHJvdmlkZXIgYGltcG9ydHNgIGFycmF5IGluIGl0J3NcbiAqIGRlZmluaXRpb25cbiAqXG4gKiBGb3IgTW9kdWxlIEluamVjdG9ycyB0aGlzIHJldHVybnMgdGhlIE5nTW9kdWxlIGNvbnN0cnVjdG9yLlxuICpcbiAqIEZvciBTdGFuZGFsb25lIGluamVjdG9ycyB0aGlzIHJldHVybnMgdGhlIHN0YW5kYWxvbmUgY29tcG9uZW50IGNvbnN0cnVjdG9yLlxuICpcbiAqIEBwYXJhbSBpbmplY3RvciBJbmplY3RvciBhbiBpbmplY3RvciBpbnN0YW5jZVxuICogQHJldHVybnMgdGhlIGNvbnN0cnVjdG9yIHdoZXJlIHRoZSBgaW1wb3J0c2AgYXJyYXkgdGhhdCBjb25maWd1cmVzIHRoaXMgaW5qZWN0b3IgaXMgbG9jYXRlZFxuICovXG5mdW5jdGlvbiBnZXRQcm92aWRlckltcG9ydHNDb250YWluZXIoaW5qZWN0b3I6IEluamVjdG9yKTogVHlwZTx1bmtub3duPnxudWxsIHtcbiAgY29uc3Qge3N0YW5kYWxvbmVJbmplY3RvclRvQ29tcG9uZW50fSA9IGdldEZyYW1ld29ya0RJRGVidWdEYXRhKCk7XG5cbiAgLy8gc3RhbmRhbG9uZSBjb21wb25lbnRzIGNvbmZpZ3VyZSBwcm92aWRlcnMgdGhyb3VnaCBhIGNvbXBvbmVudCBkZWYsIHNvIHdlIGhhdmUgdG9cbiAgLy8gdXNlIHRoZSBzdGFuZGFsb25lIGNvbXBvbmVudCBhc3NvY2lhdGVkIHdpdGggdGhpcyBpbmplY3RvciBpZiBJbmplY3RvciByZXByZXNlbnRzXG4gIC8vIGEgc3RhbmRhbG9uZSBjb21wb25lbnRzIEVudmlyb25tZW50SW5qZWN0b3JcbiAgaWYgKHN0YW5kYWxvbmVJbmplY3RvclRvQ29tcG9uZW50LmhhcyhpbmplY3RvcikpIHtcbiAgICByZXR1cm4gc3RhbmRhbG9uZUluamVjdG9yVG9Db21wb25lbnQuZ2V0KGluamVjdG9yKSE7XG4gIH1cblxuICAvLyBNb2R1bGUgaW5qZWN0b3JzIGNvbmZpZ3VyZSBwcm92aWRlcnMgdGhyb3VnaCB0aGVpciBOZ01vZHVsZSBkZWYsIHNvIHdlIHVzZSB0aGVcbiAgLy8gaW5qZWN0b3IgdG8gbG9va3VwIGl0cyBOZ01vZHVsZVJlZiBhbmQgdGhyb3VnaCB0aGF0IGdyYWIgaXRzIGluc3RhbmNlXG4gIGNvbnN0IGRlZlR5cGVSZWYgPSBpbmplY3Rvci5nZXQodmlld0VuZ2luZV9OZ01vZHVsZVJlZiwgbnVsbCwge3NlbGY6IHRydWUsIG9wdGlvbmFsOiB0cnVlfSkhO1xuXG4gIC8vIElmIHdlIGNhbid0IGZpbmQgYW4gYXNzb2NpYXRlZCBpbXBvcnRzIGNvbnRhaW5lciwgcmV0dXJuIG51bGwuXG4gIC8vIFRoaXMgY291bGQgYmUgdGhlIGNhc2UgaWYgdGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQgd2l0aCBhbiBSM0luamVjdG9yIHRoYXQgZG9lcyBub3QgcmVwcmVzZW50XG4gIC8vIGEgc3RhbmRhbG9uZSBjb21wb25lbnQgb3IgTmdNb2R1bGUuXG4gIGlmIChkZWZUeXBlUmVmID09PSBudWxsKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvLyBJbiBzdGFuZGFsb25lIGFwcGxpY2F0aW9ucywgdGhlIHJvb3QgZW52aXJvbm1lbnQgaW5qZWN0b3IgY3JlYXRlZCBieSBib290c3RyYXBBcHBsaWNhdGlvblxuICAvLyBtYXkgaGF2ZSBubyBhc3NvY2lhdGVkIFwiaW5zdGFuY2VcIi5cbiAgaWYgKGRlZlR5cGVSZWYuaW5zdGFuY2UgPT09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHJldHVybiBkZWZUeXBlUmVmLmluc3RhbmNlLmNvbnN0cnVjdG9yO1xufVxuXG4vKipcbiAqIEdldHMgdGhlIHByb3ZpZGVycyBjb25maWd1cmVkIG9uIGEgTm9kZUluamVjdG9yXG4gKlxuICogQHBhcmFtIGluamVjdG9yIEEgTm9kZUluamVjdG9yIGluc3RhbmNlXG4gKiBAcmV0dXJucyBQcm92aWRlclJlY29yZFtdIGFuIGFycmF5IG9mIG9iamVjdHMgcmVwcmVzZW50aW5nIHRoZSBwcm92aWRlcnMgY29uZmlndXJlZCBvbiB0aGlzXG4gKiAgICAgaW5qZWN0b3JcbiAqL1xuZnVuY3Rpb24gZ2V0Tm9kZUluamVjdG9yUHJvdmlkZXJzKGluamVjdG9yOiBOb2RlSW5qZWN0b3IpOiBQcm92aWRlclJlY29yZFtdIHtcbiAgY29uc3QgZGlSZXNvbHZlciA9IGdldE5vZGVJbmplY3RvclROb2RlKGluamVjdG9yKTtcbiAgY29uc3Qge3Jlc29sdmVyVG9Qcm92aWRlcnN9ID0gZ2V0RnJhbWV3b3JrRElEZWJ1Z0RhdGEoKTtcbiAgcmV0dXJuIHJlc29sdmVyVG9Qcm92aWRlcnMuZ2V0KGRpUmVzb2x2ZXIgYXMgVE5vZGUpID8/IFtdO1xufVxuXG4vKipcbiAqIEdldHMgYSBtYXBwaW5nIG9mIHByb3ZpZGVycyBjb25maWd1cmVkIG9uIGFuIGluamVjdG9yIHRvIHRoZWlyIGltcG9ydCBwYXRoc1xuICpcbiAqIE1vZHVsZUEgLT4gaW1wb3J0cyBNb2R1bGVCXG4gKiBNb2R1bGVCIC0+IGltcG9ydHMgTW9kdWxlQ1xuICogTW9kdWxlQiAtPiBwcm92aWRlcyBNeVNlcnZpY2VBXG4gKiBNb2R1bGVDIC0+IHByb3ZpZGVzIE15U2VydmljZUJcbiAqXG4gKiBnZXRQcm92aWRlckltcG9ydFBhdGhzKE1vZHVsZUEpXG4gKiA+IE1hcCgyKSB7XG4gKiAgIE15U2VydmljZUEgPT4gW01vZHVsZUEsIE1vZHVsZUJdXG4gKiAgIE15U2VydmljZUIgPT4gW01vZHVsZUEsIE1vZHVsZUIsIE1vZHVsZUNdXG4gKiAgfVxuICpcbiAqIEBwYXJhbSBwcm92aWRlckltcG9ydHNDb250YWluZXIgY29uc3RydWN0b3Igb2YgY2xhc3MgdGhhdCBjb250YWlucyBhbiBgaW1wb3J0c2AgYXJyYXkgaW4gaXQnc1xuICogICAgIGRlZmluaXRpb25cbiAqIEByZXR1cm5zIEEgTWFwIG9iamVjdCB0aGF0IG1hcHMgcHJvdmlkZXJzIHRvIGFuIGFycmF5IG9mIGNvbnN0cnVjdG9ycyByZXByZXNlbnRpbmcgaXQncyBpbXBvcnRcbiAqICAgICBwYXRoXG4gKlxuICovXG5mdW5jdGlvbiBnZXRQcm92aWRlckltcG9ydFBhdGhzKHByb3ZpZGVySW1wb3J0c0NvbnRhaW5lcjogVHlwZTx1bmtub3duPik6XG4gICAgTWFwPFNpbmdsZVByb3ZpZGVyLCAoVHlwZTx1bmtub3duPnwgSW5qZWN0b3JUeXBlPHVua25vd24+KVtdPiB7XG4gIGNvbnN0IHByb3ZpZGVyVG9QYXRoID0gbmV3IE1hcDxTaW5nbGVQcm92aWRlciwgKFR5cGU8dW5rbm93bj58IEluamVjdG9yVHlwZTx1bmtub3duPilbXT4oKTtcbiAgY29uc3QgdmlzaXRlZENvbnRhaW5lcnMgPSBuZXcgU2V0PFR5cGU8dW5rbm93bj4+KCk7XG4gIGNvbnN0IHZpc2l0b3IgPSB3YWxrUHJvdmlkZXJUcmVlVG9EaXNjb3ZlckltcG9ydFBhdGhzKHByb3ZpZGVyVG9QYXRoLCB2aXNpdGVkQ29udGFpbmVycyk7XG5cbiAgd2Fsa1Byb3ZpZGVyVHJlZShwcm92aWRlckltcG9ydHNDb250YWluZXIsIHZpc2l0b3IsIFtdLCBuZXcgU2V0KCkpO1xuXG4gIHJldHVybiBwcm92aWRlclRvUGF0aDtcbn1cblxuLyoqXG4gKlxuICogSGlnaGVyIG9yZGVyIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhIHZpc2l0b3IgZm9yIFdhbGtQcm92aWRlclRyZWVcbiAqXG4gKiBUYWtlcyBpbiBhIE1hcCBhbmQgU2V0IHRvIGtlZXAgdHJhY2sgb2YgdGhlIHByb3ZpZGVycyBhbmQgY29udGFpbmVyc1xuICogdmlzaXRlZCwgc28gdGhhdCB3ZSBjYW4gZGlzY292ZXIgdGhlIGltcG9ydCBwYXRocyBvZiB0aGVzZSBwcm92aWRlcnNcbiAqIGR1cmluZyB0aGUgdHJhdmVyc2FsLlxuICpcbiAqIFRoaXMgdmlzaXRvciB0YWtlcyBhZHZhbnRhZ2Ugb2YgdGhlIGZhY3QgdGhhdCB3YWxrUHJvdmlkZXJUcmVlIHBlcmZvcm1zIGFcbiAqIHBvc3RvcmRlciB0cmF2ZXJzYWwgb2YgdGhlIHByb3ZpZGVyIHRyZWUgZm9yIHRoZSBwYXNzZWQgaW4gY29udGFpbmVyLiBCZWNhdXNlIHBvc3RvcmRlclxuICogdHJhdmVyc2FsIHJlY3Vyc2l2ZWx5IHByb2Nlc3NlcyBzdWJ0cmVlcyBmcm9tIGxlYWYgbm9kZXMgdW50aWwgdGhlIHRyYXZlcnNhbCByZWFjaGVzIHRoZSByb290LFxuICogd2Ugd3JpdGUgYSB2aXNpdG9yIHRoYXQgY29uc3RydWN0cyBwcm92aWRlciBpbXBvcnQgcGF0aHMgaW4gcmV2ZXJzZS5cbiAqXG4gKlxuICogV2UgdXNlIHRoZSB2aXNpdGVkQ29udGFpbmVycyBzZXQgZGVmaW5lZCBvdXRzaWRlIHRoaXMgdmlzaXRvclxuICogYmVjYXVzZSB3ZSB3YW50IHRvIHJ1biBzb21lIGxvZ2ljIG9ubHkgb25jZSBmb3JcbiAqIGVhY2ggY29udGFpbmVyIGluIHRoZSB0cmVlLiBUaGF0IGxvZ2ljIGNhbiBiZSBkZXNjcmliZWQgYXM6XG4gKlxuICpcbiAqIDEuIGZvciBlYWNoIGRpc2NvdmVyZWRfcHJvdmlkZXIgYW5kIGRpc2NvdmVyZWRfcGF0aCBpbiB0aGUgaW5jb21wbGV0ZSBwcm92aWRlciBwYXRocyB3ZSd2ZVxuICogYWxyZWFkeSBkaXNjb3ZlcmVkXG4gKiAyLiBnZXQgdGhlIGZpcnN0IGNvbnRhaW5lciBpbiBkaXNjb3ZlcmVkX3BhdGhcbiAqIDMuIGlmIHRoYXQgZmlyc3QgY29udGFpbmVyIGlzIGluIHRoZSBpbXBvcnRzIGFycmF5IG9mIHRoZSBjb250YWluZXIgd2UncmUgdmlzaXRpbmdcbiAqICAgIFRoZW4gdGhlIGNvbnRhaW5lciB3ZSdyZSB2aXNpdGluZyBpcyBhbHNvIGluIHRoZSBpbXBvcnQgcGF0aCBvZiBkaXNjb3ZlcmVkX3Byb3ZpZGVyLCBzbyB3ZVxuICogICAgdW5zaGlmdCBkaXNjb3ZlcmVkX3BhdGggd2l0aCB0aGUgY29udGFpbmVyIHdlJ3JlIGN1cnJlbnRseSB2aXNpdGluZ1xuICpcbiAqXG4gKiBFeGFtcGxlIFJ1bjpcbiAqIGBgYFxuICogICAgICAgICAgICAgICAgIOKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUkFxuICogICAgICAgICAgICAgICAgIOKUgmNvbnRhaW5lckHilIJcbiAqICAgICAg4pSM4pSAaW1wb3J0cy3ilIDilKQgICAgICAgICAg4pSc4pSA4pSAaW1wb3J0c+KUgOKUkFxuICogICAgICDilIIgICAgICAgICAg4pSCICBwcm92QSAgIOKUgiAgICAgICAgICDilIJcbiAqICAgICAg4pSCICAgICAgICAgIOKUgiAgcHJvdkIgICDilIIgICAgICAgICAg4pSCXG4gKiAgICAgIOKUgiAgICAgICAgICDilJTilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJggICAgICAgICAg4pSCXG4gKiAgICAgIOKUgiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCXG4gKiAgICAg4pSM4pa84pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQICAgICAgICAgICAgIOKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKWvOKUgOKUkFxuICogICAgIOKUgmNvbnRhaW5lckLilIIgICAgICAgICAgICAg4pSCY29udGFpbmVyQ+KUglxuICogICAgIOKUgiAgICAgICAgICDilIIgICAgICAgICAgICAg4pSCICAgICAgICAgIOKUglxuICogICAgIOKUgiAgcHJvdkQgICDilIIgICAgICAgICAgICAg4pSCICBwcm92RiAgIOKUglxuICogICAgIOKUgiAgcHJvdkUgICDilIIgICAgICAgICAgICAg4pSCICBwcm92RyAgIOKUglxuICogICAgIOKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUmCAgICAgICAgICAgICDilJTilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJhcbiAqIGBgYFxuICpcbiAqIEVhY2ggc3RlcCBvZiB0aGUgdHJhdmVyc2FsLFxuICpcbiAqIGBgYFxuICogdmlzaXRvcihwcm92RCwgY29udGFpbmVyQilcbiAqIHByb3ZpZGVyVG9QYXRoID09PSBNYXAgeyBwcm92RCA9PiBbY29udGFpbmVyQl0gfVxuICogdmlzaXRlZENvbnRhaW5lcnMgPT09IFNldCB7IGNvbnRhaW5lckIgfVxuICpcbiAqIHZpc2l0b3IocHJvdkUsIGNvbnRhaW5lckIpXG4gKiBwcm92aWRlclRvUGF0aCA9PT0gTWFwIHsgcHJvdkQgPT4gW2NvbnRhaW5lckJdLCBwcm92RSA9PiBbY29udGFpbmVyQl0gfVxuICogdmlzaXRlZENvbnRhaW5lcnMgPT09IFNldCB7IGNvbnRhaW5lckIgfVxuICpcbiAqIHZpc2l0b3IocHJvdkYsIGNvbnRhaW5lckMpXG4gKiBwcm92aWRlclRvUGF0aCA9PT0gTWFwIHsgcHJvdkQgPT4gW2NvbnRhaW5lckJdLCBwcm92RSA9PiBbY29udGFpbmVyQl0sIHByb3ZGID0+IFtjb250YWluZXJDXSB9XG4gKiB2aXNpdGVkQ29udGFpbmVycyA9PT0gU2V0IHsgY29udGFpbmVyQiwgY29udGFpbmVyQyB9XG4gKlxuICogdmlzaXRvcihwcm92RywgY29udGFpbmVyQylcbiAqIHByb3ZpZGVyVG9QYXRoID09PSBNYXAge1xuICogICBwcm92RCA9PiBbY29udGFpbmVyQl0sIHByb3ZFID0+IFtjb250YWluZXJCXSwgcHJvdkYgPT4gW2NvbnRhaW5lckNdLCBwcm92RyA9PiBbY29udGFpbmVyQ11cbiAqIH1cbiAqIHZpc2l0ZWRDb250YWluZXJzID09PSBTZXQgeyBjb250YWluZXJCLCBjb250YWluZXJDIH1cbiAqXG4gKiB2aXNpdG9yKHByb3ZBLCBjb250YWluZXJBKVxuICogcHJvdmlkZXJUb1BhdGggPT09IE1hcCB7XG4gKiAgIHByb3ZEID0+IFtjb250YWluZXJBLCBjb250YWluZXJCXSxcbiAqICAgcHJvdkUgPT4gW2NvbnRhaW5lckEsIGNvbnRhaW5lckJdLFxuICogICBwcm92RiA9PiBbY29udGFpbmVyQSwgY29udGFpbmVyQ10sXG4gKiAgIHByb3ZHID0+IFtjb250YWluZXJBLCBjb250YWluZXJDXSxcbiAqICAgcHJvdkEgPT4gW2NvbnRhaW5lckFdXG4gKiB9XG4gKiB2aXNpdGVkQ29udGFpbmVycyA9PT0gU2V0IHsgY29udGFpbmVyQiwgY29udGFpbmVyQywgY29udGFpbmVyQSB9XG4gKlxuICogdmlzaXRvcihwcm92QiwgY29udGFpbmVyQSlcbiAqIHByb3ZpZGVyVG9QYXRoID09PSBNYXAge1xuICogICBwcm92RCA9PiBbY29udGFpbmVyQSwgY29udGFpbmVyQl0sXG4gKiAgIHByb3ZFID0+IFtjb250YWluZXJBLCBjb250YWluZXJCXSxcbiAqICAgcHJvdkYgPT4gW2NvbnRhaW5lckEsIGNvbnRhaW5lckNdLFxuICogICBwcm92RyA9PiBbY29udGFpbmVyQSwgY29udGFpbmVyQ10sXG4gKiAgIHByb3ZBID0+IFtjb250YWluZXJBXVxuICogICBwcm92QiA9PiBbY29udGFpbmVyQV1cbiAqIH1cbiAqIHZpc2l0ZWRDb250YWluZXJzID09PSBTZXQgeyBjb250YWluZXJCLCBjb250YWluZXJDLCBjb250YWluZXJBIH1cbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBwcm92aWRlclRvUGF0aCBNYXAgbWFwIG9mIHByb3ZpZGVycyB0byBwYXRocyB0aGF0IHRoaXMgZnVuY3Rpb24gZmlsbHNcbiAqIEBwYXJhbSB2aXNpdGVkQ29udGFpbmVycyBTZXQgYSBzZXQgdG8ga2VlcCB0cmFjayBvZiB0aGUgY29udGFpbmVycyB3ZSd2ZSBhbHJlYWR5IHZpc2l0ZWRcbiAqIEByZXR1cm4gZnVuY3Rpb24ocHJvdmlkZXIgU2luZ2xlUHJvdmlkZXIsIGNvbnRhaW5lcjogVHlwZTx1bmtub3duPiB8IEluamVjdG9yVHlwZTx1bmtub3duPikgPT5cbiAqICAgICB2b2lkXG4gKi9cbmZ1bmN0aW9uIHdhbGtQcm92aWRlclRyZWVUb0Rpc2NvdmVySW1wb3J0UGF0aHMoXG4gICAgcHJvdmlkZXJUb1BhdGg6IE1hcDxTaW5nbGVQcm92aWRlciwgKFR5cGU8dW5rbm93bj58IEluamVjdG9yVHlwZTx1bmtub3duPilbXT4sXG4gICAgdmlzaXRlZENvbnRhaW5lcnM6IFNldDxUeXBlPHVua25vd24+Pik6XG4gICAgKHByb3ZpZGVyOiBTaW5nbGVQcm92aWRlciwgY29udGFpbmVyOiBUeXBlPHVua25vd24+fEluamVjdG9yVHlwZTx1bmtub3duPikgPT4gdm9pZCB7XG4gIHJldHVybiAocHJvdmlkZXI6IFNpbmdsZVByb3ZpZGVyLCBjb250YWluZXI6IFR5cGU8dW5rbm93bj58SW5qZWN0b3JUeXBlPHVua25vd24+KSA9PiB7XG4gICAgLy8gSWYgdGhlIHByb3ZpZGVyIGlzIG5vdCBhbHJlYWR5IGluIHRoZSBwcm92aWRlclRvUGF0aCBtYXAsXG4gICAgLy8gYWRkIGFuIGVudHJ5IHdpdGggdGhlIHByb3ZpZGVyIGFzIHRoZSBrZXkgYW5kIGFuIGFycmF5IGNvbnRhaW5pbmcgdGhlIGN1cnJlbnQgY29udGFpbmVyIGFzXG4gICAgLy8gdGhlIHZhbHVlXG4gICAgaWYgKCFwcm92aWRlclRvUGF0aC5oYXMocHJvdmlkZXIpKSB7XG4gICAgICBwcm92aWRlclRvUGF0aC5zZXQocHJvdmlkZXIsIFtjb250YWluZXJdKTtcbiAgICB9XG5cbiAgICAvLyBUaGlzIGJsb2NrIHdpbGwgcnVuIGV4YWN0bHkgb25jZSBmb3IgZWFjaCBjb250YWluZXIgaW4gdGhlIGltcG9ydCB0cmVlLlxuICAgIC8vIFRoaXMgaXMgd2hlcmUgd2UgcnVuIHRoZSBsb2dpYyB0byBjaGVjayB0aGUgaW1wb3J0cyBhcnJheSBvZiB0aGUgY3VycmVudFxuICAgIC8vIGNvbnRhaW5lciB0byBzZWUgaWYgaXQncyB0aGUgbmV4dCBjb250YWluZXIgaW4gdGhlIHBhdGggZm9yIG91ciBjdXJyZW50bHlcbiAgICAvLyBkaXNjb3ZlcmVkIHByb3ZpZGVycy5cbiAgICBpZiAoIXZpc2l0ZWRDb250YWluZXJzLmhhcyhjb250YWluZXIpKSB7XG4gICAgICAvLyBJdGVyYXRlIHRocm91Z2ggdGhlIHByb3ZpZGVycyB3ZSd2ZSBhbHJlYWR5IHNlZW5cbiAgICAgIGZvciAoY29uc3QgcHJvdiBvZiBwcm92aWRlclRvUGF0aC5rZXlzKCkpIHtcbiAgICAgICAgY29uc3QgZXhpc3RpbmdJbXBvcnRQYXRoID0gcHJvdmlkZXJUb1BhdGguZ2V0KHByb3YpITtcblxuICAgICAgICBsZXQgY29udGFpbmVyRGVmID0gZ2V0SW5qZWN0b3JEZWYoY29udGFpbmVyKTtcbiAgICAgICAgaWYgKCFjb250YWluZXJEZWYpIHtcbiAgICAgICAgICBjb25zdCBuZ01vZHVsZTogVHlwZTx1bmtub3duPnx1bmRlZmluZWQgPVxuICAgICAgICAgICAgICAoY29udGFpbmVyIGFzIGFueSkubmdNb2R1bGUgYXMgVHlwZTx1bmtub3duPnwgdW5kZWZpbmVkO1xuICAgICAgICAgIGNvbnRhaW5lckRlZiA9IGdldEluamVjdG9yRGVmKG5nTW9kdWxlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghY29udGFpbmVyRGVmKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbGFzdENvbnRhaW5lckFkZGVkVG9QYXRoID0gZXhpc3RpbmdJbXBvcnRQYXRoWzBdO1xuXG4gICAgICAgIGxldCBpc05leHRTdGVwSW5QYXRoID0gZmFsc2U7XG4gICAgICAgIGRlZXBGb3JFYWNoKGNvbnRhaW5lckRlZi5pbXBvcnRzLCAobW9kdWxlSW1wb3J0KSA9PiB7XG4gICAgICAgICAgaWYgKGlzTmV4dFN0ZXBJblBhdGgpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpc05leHRTdGVwSW5QYXRoID0gKG1vZHVsZUltcG9ydCBhcyBhbnkpLm5nTW9kdWxlID09PSBsYXN0Q29udGFpbmVyQWRkZWRUb1BhdGggfHxcbiAgICAgICAgICAgICAgbW9kdWxlSW1wb3J0ID09PSBsYXN0Q29udGFpbmVyQWRkZWRUb1BhdGg7XG5cbiAgICAgICAgICBpZiAoaXNOZXh0U3RlcEluUGF0aCkge1xuICAgICAgICAgICAgcHJvdmlkZXJUb1BhdGguZ2V0KHByb3YpPy51bnNoaWZ0KGNvbnRhaW5lcik7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2aXNpdGVkQ29udGFpbmVycy5hZGQoY29udGFpbmVyKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBwcm92aWRlcnMgY29uZmlndXJlZCBvbiBhbiBFbnZpcm9ubWVudEluamVjdG9yXG4gKlxuICogQHBhcmFtIGluamVjdG9yIEVudmlyb25tZW50SW5qZWN0b3JcbiAqIEByZXR1cm5zIGFuIGFycmF5IG9mIG9iamVjdHMgcmVwcmVzZW50aW5nIHRoZSBwcm92aWRlcnMgb2YgdGhlIGdpdmVuIGluamVjdG9yXG4gKi9cbmZ1bmN0aW9uIGdldEVudmlyb25tZW50SW5qZWN0b3JQcm92aWRlcnMoaW5qZWN0b3I6IEVudmlyb25tZW50SW5qZWN0b3IpOiBQcm92aWRlclJlY29yZFtdIHtcbiAgY29uc3QgcHJvdmlkZXJSZWNvcmRzV2l0aG91dEltcG9ydFBhdGhzID1cbiAgICAgIGdldEZyYW1ld29ya0RJRGVidWdEYXRhKCkucmVzb2x2ZXJUb1Byb3ZpZGVycy5nZXQoaW5qZWN0b3IpID8/IFtdO1xuXG4gIC8vIHBsYXRmb3JtIGluamVjdG9yIGhhcyBubyBwcm92aWRlciBpbXBvcnRzIGNvbnRhaW5lciBzbyBjYW4gd2Ugc2tpcCB0cnlpbmcgdG9cbiAgLy8gZmluZCBpbXBvcnQgcGF0aHNcbiAgaWYgKGlzUGxhdGZvcm1JbmplY3RvcihpbmplY3RvcikpIHtcbiAgICByZXR1cm4gcHJvdmlkZXJSZWNvcmRzV2l0aG91dEltcG9ydFBhdGhzO1xuICB9XG5cbiAgY29uc3QgcHJvdmlkZXJJbXBvcnRzQ29udGFpbmVyID0gZ2V0UHJvdmlkZXJJbXBvcnRzQ29udGFpbmVyKGluamVjdG9yKTtcbiAgaWYgKHByb3ZpZGVySW1wb3J0c0NvbnRhaW5lciA9PT0gbnVsbCkge1xuICAgIC8vIFdlIGFzc3VtZSB0aGF0IGlmIGFuIGVudmlyb25tZW50IGluamVjdG9yIGV4aXN0cyB3aXRob3V0IGFuIGFzc29jaWF0ZWQgcHJvdmlkZXIgaW1wb3J0c1xuICAgIC8vIGNvbnRhaW5lciwgaXQgd2FzIGNyZWF0ZWQgd2l0aG91dCBzdWNoIGEgY29udGFpbmVyLiBTb21lIGV4YW1wbGVzIGNhc2VzIHdoZXJlIHRoaXMgY291bGRcbiAgICAvLyBoYXBwZW46XG4gICAgLy8gLSBUaGUgcm9vdCBpbmplY3RvciBvZiBhIHN0YW5kYWxvbmUgYXBwbGljYXRpb25cbiAgICAvLyAtIEEgcm91dGVyIGluamVjdG9yIGNyZWF0ZWQgYnkgdXNpbmcgdGhlIHByb3ZpZGVycyBhcnJheSBpbiBhIGxhenkgbG9hZGVkIHJvdXRlXG4gICAgLy8gLSBBIG1hbnVhbGx5IGNyZWF0ZWQgaW5qZWN0b3IgdGhhdCBpcyBhdHRhY2hlZCB0byB0aGUgaW5qZWN0b3IgdHJlZVxuICAgIC8vIFNpbmNlIGVhY2ggb2YgdGhlc2UgY2FzZXMgaGFzIG5vIHByb3ZpZGVyIGNvbnRhaW5lciwgdGhlcmUgaXMgbm8gY29uY2VwdCBvZiBpbXBvcnQgcGF0aHMsXG4gICAgLy8gc28gd2UgY2FuIHNpbXBseSByZXR1cm4gdGhlIHByb3ZpZGVyIHJlY29yZHMuXG4gICAgcmV0dXJuIHByb3ZpZGVyUmVjb3Jkc1dpdGhvdXRJbXBvcnRQYXRocztcbiAgfVxuXG4gIGNvbnN0IHByb3ZpZGVyVG9QYXRoID0gZ2V0UHJvdmlkZXJJbXBvcnRQYXRocyhwcm92aWRlckltcG9ydHNDb250YWluZXIpO1xuICBjb25zdCBwcm92aWRlclJlY29yZHMgPSBbXTtcblxuICBmb3IgKGNvbnN0IHByb3ZpZGVyUmVjb3JkIG9mIHByb3ZpZGVyUmVjb3Jkc1dpdGhvdXRJbXBvcnRQYXRocykge1xuICAgIGNvbnN0IHByb3ZpZGVyID0gcHJvdmlkZXJSZWNvcmQucHJvdmlkZXI7XG4gICAgLy8gSWdub3JlIHRoZXNlIHNwZWNpYWwgcHJvdmlkZXJzIGZvciBub3cgdW50aWwgd2UgaGF2ZSBhIGNsZWFuZXIgd2F5IG9mXG4gICAgLy8gZGV0ZXJtaW5nIHdoZW4gdGhleSBhcmUgcHJvdmlkZWQgYnkgdGhlIGZyYW1ld29yayB2cyBwcm92aWRlZCBieSB0aGUgdXNlci5cbiAgICBjb25zdCB0b2tlbiA9IChwcm92aWRlciBhcyBWYWx1ZVByb3ZpZGVyKS5wcm92aWRlO1xuICAgIGlmICh0b2tlbiA9PT0gRU5WSVJPTk1FTlRfSU5JVElBTElaRVIgfHwgdG9rZW4gPT09IElOSkVDVE9SX0RFRl9UWVBFUykge1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgbGV0IGltcG9ydFBhdGggPSBwcm92aWRlclRvUGF0aC5nZXQocHJvdmlkZXIpID8/IFtdO1xuXG4gICAgY29uc3QgZGVmID0gZ2V0Q29tcG9uZW50RGVmKHByb3ZpZGVySW1wb3J0c0NvbnRhaW5lcik7XG4gICAgY29uc3QgaXNTdGFuZGFsb25lQ29tcG9uZW50ID0gISFkZWY/LnN0YW5kYWxvbmU7XG4gICAgLy8gV2UgcHJlcGVuZCB0aGUgY29tcG9uZW50IGNvbnN0cnVjdG9yIGluIHRoZSBzdGFuZGFsb25lIGNhc2VcbiAgICAvLyBiZWNhdXNlIHdhbGtQcm92aWRlclRyZWUgZG9lcyBub3QgdmlzaXQgdGhpcyBjb25zdHJ1Y3RvciBkdXJpbmcgaXQncyB0cmF2ZXJzYWxcbiAgICBpZiAoaXNTdGFuZGFsb25lQ29tcG9uZW50KSB7XG4gICAgICBpbXBvcnRQYXRoID0gW3Byb3ZpZGVySW1wb3J0c0NvbnRhaW5lciwgLi4uaW1wb3J0UGF0aF07XG4gICAgfVxuXG4gICAgcHJvdmlkZXJSZWNvcmRzLnB1c2goey4uLnByb3ZpZGVyUmVjb3JkLCBpbXBvcnRQYXRofSk7XG4gIH1cbiAgcmV0dXJuIHByb3ZpZGVyUmVjb3Jkcztcbn1cblxuZnVuY3Rpb24gaXNQbGF0Zm9ybUluamVjdG9yKGluamVjdG9yOiBJbmplY3Rvcikge1xuICByZXR1cm4gaW5qZWN0b3IgaW5zdGFuY2VvZiBSM0luamVjdG9yICYmIGluamVjdG9yLnNjb3Blcy5oYXMoJ3BsYXRmb3JtJyk7XG59XG5cbi8qKlxuICogR2V0cyB0aGUgcHJvdmlkZXJzIGNvbmZpZ3VyZWQgb24gYW4gaW5qZWN0b3IuXG4gKlxuICogQHBhcmFtIGluamVjdG9yIHRoZSBpbmplY3RvciB0byBsb29rdXAgdGhlIHByb3ZpZGVycyBvZlxuICogQHJldHVybnMgUHJvdmlkZXJSZWNvcmRbXSBhbiBhcnJheSBvZiBvYmplY3RzIHJlcHJlc2VudGluZyB0aGUgcHJvdmlkZXJzIG9mIHRoZSBnaXZlbiBpbmplY3RvclxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0SW5qZWN0b3JQcm92aWRlcnMoaW5qZWN0b3I6IEluamVjdG9yKTogUHJvdmlkZXJSZWNvcmRbXSB7XG4gIGlmIChpbmplY3RvciBpbnN0YW5jZW9mIE5vZGVJbmplY3Rvcikge1xuICAgIHJldHVybiBnZXROb2RlSW5qZWN0b3JQcm92aWRlcnMoaW5qZWN0b3IpO1xuICB9IGVsc2UgaWYgKGluamVjdG9yIGluc3RhbmNlb2YgRW52aXJvbm1lbnRJbmplY3Rvcikge1xuICAgIHJldHVybiBnZXRFbnZpcm9ubWVudEluamVjdG9yUHJvdmlkZXJzKGluamVjdG9yIGFzIEVudmlyb25tZW50SW5qZWN0b3IpO1xuICB9XG5cbiAgdGhyb3dFcnJvcignZ2V0SW5qZWN0b3JQcm92aWRlcnMgb25seSBzdXBwb3J0cyBOb2RlSW5qZWN0b3IgYW5kIEVudmlyb25tZW50SW5qZWN0b3InKTtcbn1cblxuLyoqXG4gKlxuICogR2l2ZW4gYW4gaW5qZWN0b3IsIHRoaXMgZnVuY3Rpb24gd2lsbCByZXR1cm5cbiAqIGFuIG9iamVjdCBjb250YWluaW5nIHRoZSB0eXBlIGFuZCBzb3VyY2Ugb2YgdGhlIGluamVjdG9yLlxuICpcbiAqIHwgICAgICAgICAgICAgIHwgdHlwZSAgICAgICAgfCBzb3VyY2UgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiB8LS0tLS0tLS0tLS0tLS18LS0tLS0tLS0tLS0tLXwtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tfFxuICogfCBOb2RlSW5qZWN0b3IgfCBlbGVtZW50ICAgICB8IERPTSBlbGVtZW50IHRoYXQgY3JlYXRlZCB0aGlzIGluamVjdG9yICAgICAgICAgICAgICAgICAgICAgIHxcbiAqIHwgUjNJbmplY3RvciAgIHwgZW52aXJvbm1lbnQgfCBgaW5qZWN0b3Iuc291cmNlYCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiB8IE51bGxJbmplY3RvciB8IG51bGwgICAgICAgIHwgbnVsbCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICpcbiAqIEBwYXJhbSBpbmplY3RvciB0aGUgSW5qZWN0b3IgdG8gZ2V0IG1ldGFkYXRhIGZvclxuICogQHJldHVybnMgYW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIHR5cGUgYW5kIHNvdXJjZSBvZiB0aGUgZ2l2ZW4gaW5qZWN0b3IuIElmIHRoZSBpbmplY3RvciBtZXRhZGF0YVxuICogICAgIGNhbm5vdCBiZSBkZXRlcm1pbmVkLCByZXR1cm5zIG51bGwuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRJbmplY3Rvck1ldGFkYXRhKGluamVjdG9yOiBJbmplY3Rvcik6IHt0eXBlOiAnZWxlbWVudCcsIHNvdXJjZTogUkVsZW1lbnR9fFxuICAgIHt0eXBlOiAnZW52aXJvbm1lbnQnLCBzb3VyY2U6IHN0cmluZyB8IG51bGx9fHt0eXBlOiAnbnVsbCcsIHNvdXJjZTogbnVsbH18bnVsbCB7XG4gIGlmIChpbmplY3RvciBpbnN0YW5jZW9mIE5vZGVJbmplY3Rvcikge1xuICAgIGNvbnN0IGxWaWV3ID0gZ2V0Tm9kZUluamVjdG9yTFZpZXcoaW5qZWN0b3IpO1xuICAgIGNvbnN0IHROb2RlID0gZ2V0Tm9kZUluamVjdG9yVE5vZGUoaW5qZWN0b3IpITtcbiAgICBhc3NlcnRUTm9kZUZvckxWaWV3KHROb2RlLCBsVmlldyk7XG5cbiAgICByZXR1cm4ge3R5cGU6ICdlbGVtZW50Jywgc291cmNlOiBnZXROYXRpdmVCeVROb2RlKHROb2RlLCBsVmlldykgYXMgUkVsZW1lbnR9O1xuICB9XG5cbiAgaWYgKGluamVjdG9yIGluc3RhbmNlb2YgUjNJbmplY3Rvcikge1xuICAgIHJldHVybiB7dHlwZTogJ2Vudmlyb25tZW50Jywgc291cmNlOiBpbmplY3Rvci5zb3VyY2UgPz8gbnVsbH07XG4gIH1cblxuICBpZiAoaW5qZWN0b3IgaW5zdGFuY2VvZiBOdWxsSW5qZWN0b3IpIHtcbiAgICByZXR1cm4ge3R5cGU6ICdudWxsJywgc291cmNlOiBudWxsfTtcbiAgfVxuXG4gIHJldHVybiBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0SW5qZWN0b3JSZXNvbHV0aW9uUGF0aChpbmplY3RvcjogSW5qZWN0b3IpOiBJbmplY3RvcltdIHtcbiAgY29uc3QgcmVzb2x1dGlvblBhdGg6IEluamVjdG9yW10gPSBbaW5qZWN0b3JdO1xuICBnZXRJbmplY3RvclJlc29sdXRpb25QYXRoSGVscGVyKGluamVjdG9yLCByZXNvbHV0aW9uUGF0aCk7XG4gIHJldHVybiByZXNvbHV0aW9uUGF0aDtcbn1cblxuZnVuY3Rpb24gZ2V0SW5qZWN0b3JSZXNvbHV0aW9uUGF0aEhlbHBlcihcbiAgICBpbmplY3RvcjogSW5qZWN0b3IsIHJlc29sdXRpb25QYXRoOiBJbmplY3RvcltdKTogSW5qZWN0b3JbXSB7XG4gIGNvbnN0IHBhcmVudCA9IGdldEluamVjdG9yUGFyZW50KGluamVjdG9yKTtcblxuICAvLyBpZiBnZXRJbmplY3RvclBhcmVudCBjYW4ndCBmaW5kIGEgcGFyZW50LCB0aGVuIHdlJ3ZlIGVpdGhlciByZWFjaGVkIHRoZSBlbmRcbiAgLy8gb2YgdGhlIHBhdGgsIG9yIHdlIG5lZWQgdG8gbW92ZSBmcm9tIHRoZSBFbGVtZW50IEluamVjdG9yIHRyZWUgdG8gdGhlXG4gIC8vIG1vZHVsZSBpbmplY3RvciB0cmVlIHVzaW5nIHRoZSBmaXJzdCBpbmplY3RvciBpbiBvdXIgcGF0aCBhcyB0aGUgY29ubmVjdGlvbiBwb2ludC5cbiAgaWYgKHBhcmVudCA9PT0gbnVsbCkge1xuICAgIGlmIChpbmplY3RvciBpbnN0YW5jZW9mIE5vZGVJbmplY3Rvcikge1xuICAgICAgY29uc3QgZmlyc3RJbmplY3RvciA9IHJlc29sdXRpb25QYXRoWzBdO1xuICAgICAgaWYgKGZpcnN0SW5qZWN0b3IgaW5zdGFuY2VvZiBOb2RlSW5qZWN0b3IpIHtcbiAgICAgICAgY29uc3QgbW9kdWxlSW5qZWN0b3IgPSBnZXRNb2R1bGVJbmplY3Rvck9mTm9kZUluamVjdG9yKGZpcnN0SW5qZWN0b3IpO1xuICAgICAgICBpZiAobW9kdWxlSW5qZWN0b3IgPT09IG51bGwpIHtcbiAgICAgICAgICB0aHJvd0Vycm9yKCdOb2RlSW5qZWN0b3IgbXVzdCBoYXZlIHNvbWUgY29ubmVjdGlvbiB0byB0aGUgbW9kdWxlIGluamVjdG9yIHRyZWUnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlc29sdXRpb25QYXRoLnB1c2gobW9kdWxlSW5qZWN0b3IpO1xuICAgICAgICBnZXRJbmplY3RvclJlc29sdXRpb25QYXRoSGVscGVyKG1vZHVsZUluamVjdG9yLCByZXNvbHV0aW9uUGF0aCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXNvbHV0aW9uUGF0aDtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcmVzb2x1dGlvblBhdGgucHVzaChwYXJlbnQpO1xuICAgIGdldEluamVjdG9yUmVzb2x1dGlvblBhdGhIZWxwZXIocGFyZW50LCByZXNvbHV0aW9uUGF0aCk7XG4gIH1cblxuICByZXR1cm4gcmVzb2x1dGlvblBhdGg7XG59XG5cbi8qKlxuICogR2V0cyB0aGUgcGFyZW50IG9mIGFuIGluamVjdG9yLlxuICpcbiAqIFRoaXMgZnVuY3Rpb24gaXMgbm90IGFibGUgdG8gbWFrZSB0aGUganVtcCBmcm9tIHRoZSBFbGVtZW50IEluamVjdG9yIFRyZWUgdG8gdGhlIE1vZHVsZVxuICogaW5qZWN0b3IgdHJlZS4gVGhpcyBpcyBiZWNhdXNlIHRoZSBcInBhcmVudFwiICh0aGUgbmV4dCBzdGVwIGluIHRoZSByZW9zbHV0aW9uIHBhdGgpXG4gKiBvZiBhIHJvb3QgTm9kZUluamVjdG9yIGlzIGRlcGVuZGVudCBvbiB3aGljaCBOb2RlSW5qZWN0b3IgYW5jZXN0b3IgaW5pdGlhdGVkXG4gKiB0aGUgREkgbG9va3VwLiBTZWUgZ2V0SW5qZWN0b3JSZXNvbHV0aW9uUGF0aCBmb3IgYSBmdW5jdGlvbiB0aGF0IGNhbiBtYWtlIHRoaXMganVtcC5cbiAqXG4gKiBJbiB0aGUgYmVsb3cgZGlhZ3JhbTpcbiAqIGBgYHRzXG4gKiBnZXRJbmplY3RvclBhcmVudChOb2RlSW5qZWN0b3JCKVxuICogID4gTm9kZUluamVjdG9yQVxuICogZ2V0SW5qZWN0b3JQYXJlbnQoTm9kZUluamVjdG9yQSkgLy8gb3IgZ2V0SW5qZWN0b3JQYXJlbnQoZ2V0SW5qZWN0b3JQYXJlbnQoTm9kZUluamVjdG9yQikpXG4gKiAgPiBudWxsIC8vIGNhbm5vdCBqdW1wIHRvIE1vZHVsZUluamVjdG9yIHRyZWVcbiAqIGBgYFxuICpcbiAqIGBgYFxuICogICAgICAgICAgICAgICAg4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQICAgICAgICAgICAgICAgIOKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUkFxuICogICAg4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSkTW9kdWxlQeKUnOKUgOKUgOKUgEluamVjdG9y4pSA4pSA4pSA4pSA4pa64pSCRW52aXJvbm1lbnRJbmplY3RvcuKUglxuICogICAg4pSCICAgICAgICAgICDilJTilIDilIDilIDilKzilIDilIDilIDilJggICAgICAgICAgICAgICAg4pSU4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSYXG4gKiAgICDilIIgICAgICAgICAgICAgICDilIJcbiAqICAgIOKUgiAgICAgICAgICAgYm9vdHN0cmFwc1xuICogICAg4pSCICAgICAgICAgICAgICAg4pSCXG4gKiAgICDilIIgICAgICAgICAgICAgICDilIJcbiAqICAgIOKUgiAgICAgICAgICDilIzilIDilIDilIDilIDilrzilIDilIDilIDilIDilIDilJAgICAgICAgICAgICAgICAgIOKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUkFxuICogZGVjbGFyZXMgICAgICDilIJDb21wb25lbnRB4pSc4pSA4pSA4pSA4pSASW5qZWN0b3LilIDilIDilIDilIDilrrilIJOb2RlSW5qZWN0b3JB4pSCXG4gKiAgICDilIIgICAgICAgICAg4pSU4pSA4pSA4pSA4pSA4pSs4pSA4pSA4pSA4pSA4pSA4pSYICAgICAgICAgICAgICAgICDilJTilIDilIDilIDilIDilIDilrLilIDilIDilIDilIDilIDilIDilIDilJhcbiAqICAgIOKUgiAgICAgICAgICAgICAgIOKUgiAgICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCXG4gKiAgICDilIIgICAgICAgICAgICByZW5kZXJzICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50XG4gKiAgICDilIIgICAgICAgICAgICAgICDilIIgICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKUglxuICogICAg4pSCICAgICAgICAgIOKUjOKUgOKUgOKUgOKUgOKWvOKUgOKUgOKUgOKUgOKUgOKUkCAgICAgICAgICAgICAgICAg4pSM4pSA4pSA4pSA4pSA4pSA4pS04pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQXG4gKiAgICDilJTilIDilIDilIDilIDilIDilIDilIDilIDilIDilrrilIJDb21wb25lbnRC4pSc4pSA4pSA4pSA4pSASW5qZWN0b3LilIDilIDilIDilIDilrrilIJOb2RlSW5qZWN0b3JC4pSCXG4gKiAgICAgICAgICAgICAgIOKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUmCAgICAgICAgICAgICAgICAg4pSU4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSYXG4gKmBgYFxuICpcbiAqIEBwYXJhbSBpbmplY3RvciBhbiBJbmplY3RvciB0byBnZXQgdGhlIHBhcmVudCBvZlxuICogQHJldHVybnMgSW5qZWN0b3IgdGhlIHBhcmVudCBvZiB0aGUgZ2l2ZW4gaW5qZWN0b3JcbiAqL1xuZnVuY3Rpb24gZ2V0SW5qZWN0b3JQYXJlbnQoaW5qZWN0b3I6IEluamVjdG9yKTogSW5qZWN0b3J8bnVsbCB7XG4gIGlmIChpbmplY3RvciBpbnN0YW5jZW9mIFIzSW5qZWN0b3IpIHtcbiAgICByZXR1cm4gaW5qZWN0b3IucGFyZW50O1xuICB9XG5cbiAgbGV0IHROb2RlOiBURWxlbWVudE5vZGV8VENvbnRhaW5lck5vZGV8VEVsZW1lbnRDb250YWluZXJOb2RlfG51bGw7XG4gIGxldCBsVmlldzogTFZpZXc8dW5rbm93bj47XG4gIGlmIChpbmplY3RvciBpbnN0YW5jZW9mIE5vZGVJbmplY3Rvcikge1xuICAgIHROb2RlID0gZ2V0Tm9kZUluamVjdG9yVE5vZGUoaW5qZWN0b3IpO1xuICAgIGxWaWV3ID0gZ2V0Tm9kZUluamVjdG9yTFZpZXcoaW5qZWN0b3IpO1xuICB9IGVsc2UgaWYgKGluamVjdG9yIGluc3RhbmNlb2YgTnVsbEluamVjdG9yKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3dFcnJvcihcbiAgICAgICAgJ2dldEluamVjdG9yUGFyZW50IG9ubHkgc3VwcG9ydCBpbmplY3RvcnMgb2YgdHlwZSBSM0luamVjdG9yLCBOb2RlSW5qZWN0b3IsIE51bGxJbmplY3RvcicpO1xuICB9XG5cbiAgY29uc3QgcGFyZW50TG9jYXRpb24gPSBnZXRQYXJlbnRJbmplY3RvckxvY2F0aW9uKFxuICAgICAgdE5vZGUgYXMgVEVsZW1lbnROb2RlIHwgVENvbnRhaW5lck5vZGUgfCBURWxlbWVudENvbnRhaW5lck5vZGUsIGxWaWV3KTtcblxuICBpZiAoaGFzUGFyZW50SW5qZWN0b3IocGFyZW50TG9jYXRpb24pKSB7XG4gICAgY29uc3QgcGFyZW50SW5qZWN0b3JJbmRleCA9IGdldFBhcmVudEluamVjdG9ySW5kZXgocGFyZW50TG9jYXRpb24pO1xuICAgIGNvbnN0IHBhcmVudExWaWV3ID0gZ2V0UGFyZW50SW5qZWN0b3JWaWV3KHBhcmVudExvY2F0aW9uLCBsVmlldyk7XG4gICAgY29uc3QgcGFyZW50VFZpZXcgPSBwYXJlbnRMVmlld1tUVklFV107XG4gICAgY29uc3QgcGFyZW50VE5vZGUgPSBwYXJlbnRUVmlldy5kYXRhW3BhcmVudEluamVjdG9ySW5kZXggKyBOb2RlSW5qZWN0b3JPZmZzZXQuVE5PREVdIGFzIFROb2RlO1xuICAgIHJldHVybiBuZXcgTm9kZUluamVjdG9yKFxuICAgICAgICBwYXJlbnRUTm9kZSBhcyBURWxlbWVudE5vZGUgfCBUQ29udGFpbmVyTm9kZSB8IFRFbGVtZW50Q29udGFpbmVyTm9kZSwgcGFyZW50TFZpZXcpO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IGNoYWluZWRJbmplY3RvciA9IGxWaWV3W0lOSkVDVE9SXSBhcyBDaGFpbmVkSW5qZWN0b3I7XG5cbiAgICAvLyBDYXNlIHdoZXJlIGNoYWluZWRJbmplY3Rvci5pbmplY3RvciBpcyBhbiBPdXRsZXRJbmplY3RvciBhbmQgY2hhaW5lZEluamVjdG9yLmluamVjdG9yLnBhcmVudFxuICAgIC8vIGlzIGEgTm9kZUluamVjdG9yLlxuICAgIC8vIHRvZG8oYWxla3NhbmRlcmJvZHVycmkpOiBpZGVhbGx5IG5vdGhpbmcgaW4gcGFja2FnZXMvY29yZSBzaG91bGQgZGVhbFxuICAgIC8vIGRpcmVjdGx5IHdpdGggcm91dGVyIGNvbmNlcm5zLiBSZWZhY3RvciB0aGlzIHNvIHRoYXQgd2UgY2FuIG1ha2UgdGhlIGp1bXAgZnJvbVxuICAgIC8vIE5vZGVJbmplY3RvciAtPiBPdXRsZXRJbmplY3RvciAtPiBOb2RlSW5qZWN0b3JcbiAgICAvLyB3aXRob3V0IGV4cGxpY3RseSByZWx5aW5nIG9uIHR5cGVzIGNvbnRyYWN0cyBmcm9tIHBhY2thZ2VzL3JvdXRlclxuICAgIGNvbnN0IGluamVjdG9yUGFyZW50ID0gKGNoYWluZWRJbmplY3Rvci5pbmplY3RvciBhcyBhbnkpPy5wYXJlbnQgYXMgSW5qZWN0b3I7XG5cbiAgICBpZiAoaW5qZWN0b3JQYXJlbnQgaW5zdGFuY2VvZiBOb2RlSW5qZWN0b3IpIHtcbiAgICAgIHJldHVybiBpbmplY3RvclBhcmVudDtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbnVsbDtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBtb2R1bGUgaW5qZWN0b3Igb2YgYSBOb2RlSW5qZWN0b3IuXG4gKlxuICogQHBhcmFtIGluamVjdG9yIE5vZGVJbmplY3RvciB0byBnZXQgbW9kdWxlIGluamVjdG9yIG9mXG4gKiBAcmV0dXJucyBJbmplY3RvciByZXByZXNlbnRpbmcgbW9kdWxlIGluamVjdG9yIG9mIHRoZSBnaXZlbiBOb2RlSW5qZWN0b3JcbiAqL1xuZnVuY3Rpb24gZ2V0TW9kdWxlSW5qZWN0b3JPZk5vZGVJbmplY3RvcihpbmplY3RvcjogTm9kZUluamVjdG9yKTogSW5qZWN0b3Ige1xuICBsZXQgbFZpZXc6IExWaWV3PHVua25vd24+O1xuICBpZiAoaW5qZWN0b3IgaW5zdGFuY2VvZiBOb2RlSW5qZWN0b3IpIHtcbiAgICBsVmlldyA9IGdldE5vZGVJbmplY3RvckxWaWV3KGluamVjdG9yKTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvd0Vycm9yKCdnZXRNb2R1bGVJbmplY3Rvck9mTm9kZUluamVjdG9yIG11c3QgYmUgY2FsbGVkIHdpdGggYSBOb2RlSW5qZWN0b3InKTtcbiAgfVxuXG4gIGNvbnN0IGNoYWluZWRJbmplY3RvciA9IGxWaWV3W0lOSkVDVE9SXSBhcyBDaGFpbmVkSW5qZWN0b3I7XG4gIGNvbnN0IG1vZHVsZUluamVjdG9yID0gY2hhaW5lZEluamVjdG9yLnBhcmVudEluamVjdG9yO1xuICBpZiAoIW1vZHVsZUluamVjdG9yKSB7XG4gICAgdGhyb3dFcnJvcignTm9kZUluamVjdG9yIG11c3QgaGF2ZSBzb21lIGNvbm5lY3Rpb24gdG8gdGhlIG1vZHVsZSBpbmplY3RvciB0cmVlJyk7XG4gIH1cblxuICByZXR1cm4gbW9kdWxlSW5qZWN0b3I7XG59XG4iXX0=