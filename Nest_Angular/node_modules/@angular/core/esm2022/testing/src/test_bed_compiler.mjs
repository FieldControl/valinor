/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ResourceLoader } from '@angular/compiler';
import { ApplicationInitStatus, ɵINTERNAL_APPLICATION_ERROR_HANDLER as INTERNAL_APPLICATION_ERROR_HANDLER, ɵChangeDetectionScheduler as ChangeDetectionScheduler, ɵChangeDetectionSchedulerImpl as ChangeDetectionSchedulerImpl, Compiler, COMPILER_OPTIONS, Injector, inject, LOCALE_ID, ModuleWithComponentFactories, ɵZONELESS_ENABLED as ZONELESS_ENABLED, resolveForwardRef, ɵclearResolutionOfComponentResourcesQueue, ɵcompileComponent as compileComponent, ɵcompileDirective as compileDirective, ɵcompileNgModuleDefs as compileNgModuleDefs, ɵcompilePipe as compilePipe, ɵDEFAULT_LOCALE_ID as DEFAULT_LOCALE_ID, ɵDEFER_BLOCK_CONFIG as DEFER_BLOCK_CONFIG, ɵdepsTracker as depsTracker, ɵgenerateStandaloneInDeclarationsError, ɵgetAsyncClassMetadataFn as getAsyncClassMetadataFn, ɵgetInjectableDef as getInjectableDef, ɵinternalProvideZoneChangeDetection as internalProvideZoneChangeDetection, ɵisComponentDefPendingResolution, ɵisEnvironmentProviders as isEnvironmentProviders, ɵNG_COMP_DEF as NG_COMP_DEF, ɵNG_DIR_DEF as NG_DIR_DEF, ɵNG_INJ_DEF as NG_INJ_DEF, ɵNG_MOD_DEF as NG_MOD_DEF, ɵNG_PIPE_DEF as NG_PIPE_DEF, ɵNgModuleFactory as R3NgModuleFactory, ɵpatchComponentDefWithScope as patchComponentDefWithScope, ɵRender3ComponentFactory as ComponentFactory, ɵRender3NgModuleRef as NgModuleRef, ɵresolveComponentResources, ɵrestoreComponentResolutionQueue, ɵsetLocaleId as setLocaleId, ɵtransitiveScopesFor as transitiveScopesFor, ɵUSE_RUNTIME_DEPS_TRACKER_FOR_JIT as USE_RUNTIME_DEPS_TRACKER_FOR_JIT, NgZone, ErrorHandler, } from '@angular/core';
import { ComponentResolver, DirectiveResolver, NgModuleResolver, PipeResolver, } from './resolvers';
import { DEFER_BLOCK_DEFAULT_BEHAVIOR } from './test_bed_common';
import { RETHROW_APPLICATION_ERRORS, TestBedApplicationErrorHandler, } from './application_error_handler';
var TestingModuleOverride;
(function (TestingModuleOverride) {
    TestingModuleOverride[TestingModuleOverride["DECLARATION"] = 0] = "DECLARATION";
    TestingModuleOverride[TestingModuleOverride["OVERRIDE_TEMPLATE"] = 1] = "OVERRIDE_TEMPLATE";
})(TestingModuleOverride || (TestingModuleOverride = {}));
function isTestingModuleOverride(value) {
    return (value === TestingModuleOverride.DECLARATION || value === TestingModuleOverride.OVERRIDE_TEMPLATE);
}
function assertNoStandaloneComponents(types, resolver, location) {
    types.forEach((type) => {
        if (!getAsyncClassMetadataFn(type)) {
            const component = resolver.resolve(type);
            if (component && component.standalone) {
                throw new Error(ɵgenerateStandaloneInDeclarationsError(type, location));
            }
        }
    });
}
export class TestBedCompiler {
    constructor(platform, additionalModuleTypes) {
        this.platform = platform;
        this.additionalModuleTypes = additionalModuleTypes;
        this.originalComponentResolutionQueue = null;
        // Testing module configuration
        this.declarations = [];
        this.imports = [];
        this.providers = [];
        this.schemas = [];
        // Queues of components/directives/pipes that should be recompiled.
        this.pendingComponents = new Set();
        this.pendingDirectives = new Set();
        this.pendingPipes = new Set();
        // Set of components with async metadata, i.e. components with `@defer` blocks
        // in their templates.
        this.componentsWithAsyncMetadata = new Set();
        // Keep track of all components and directives, so we can patch Providers onto defs later.
        this.seenComponents = new Set();
        this.seenDirectives = new Set();
        // Keep track of overridden modules, so that we can collect all affected ones in the module tree.
        this.overriddenModules = new Set();
        // Store resolved styles for Components that have template overrides present and `styleUrls`
        // defined at the same time.
        this.existingComponentStyles = new Map();
        this.resolvers = initResolvers();
        // Map of component type to an NgModule that declares it.
        //
        // There are a couple special cases:
        // - for standalone components, the module scope value is `null`
        // - when a component is declared in `TestBed.configureTestingModule()` call or
        //   a component's template is overridden via `TestBed.overrideTemplateUsingTestingModule()`.
        //   we use a special value from the `TestingModuleOverride` enum.
        this.componentToModuleScope = new Map();
        // Map that keeps initial version of component/directive/pipe defs in case
        // we compile a Type again, thus overriding respective static fields. This is
        // required to make sure we restore defs to their initial states between test runs.
        // Note: one class may have multiple defs (for example: ɵmod and ɵinj in case of an
        // NgModule), store all of them in a map.
        this.initialNgDefs = new Map();
        // Array that keeps cleanup operations for initial versions of component/directive/pipe/module
        // defs in case TestBed makes changes to the originals.
        this.defCleanupOps = [];
        this._injector = null;
        this.compilerProviders = null;
        this.providerOverrides = [];
        this.rootProviderOverrides = [];
        // Overrides for injectables with `{providedIn: SomeModule}` need to be tracked and added to that
        // module's provider list.
        this.providerOverridesByModule = new Map();
        this.providerOverridesByToken = new Map();
        this.scopesWithOverriddenProviders = new Set();
        this.testModuleRef = null;
        this.deferBlockBehavior = DEFER_BLOCK_DEFAULT_BEHAVIOR;
        class DynamicTestModule {
        }
        this.testModuleType = DynamicTestModule;
    }
    setCompilerProviders(providers) {
        this.compilerProviders = providers;
        this._injector = null;
    }
    configureTestingModule(moduleDef) {
        // Enqueue any compilation tasks for the directly declared component.
        if (moduleDef.declarations !== undefined) {
            // Verify that there are no standalone components
            assertNoStandaloneComponents(moduleDef.declarations, this.resolvers.component, '"TestBed.configureTestingModule" call');
            this.queueTypeArray(moduleDef.declarations, TestingModuleOverride.DECLARATION);
            this.declarations.push(...moduleDef.declarations);
        }
        // Enqueue any compilation tasks for imported modules.
        if (moduleDef.imports !== undefined) {
            this.queueTypesFromModulesArray(moduleDef.imports);
            this.imports.push(...moduleDef.imports);
        }
        if (moduleDef.providers !== undefined) {
            this.providers.push(...moduleDef.providers);
        }
        this.providers.push({
            provide: RETHROW_APPLICATION_ERRORS,
            useValue: moduleDef._rethrowApplicationTickErrors ?? false,
        });
        if (moduleDef.schemas !== undefined) {
            this.schemas.push(...moduleDef.schemas);
        }
        this.deferBlockBehavior = moduleDef.deferBlockBehavior ?? DEFER_BLOCK_DEFAULT_BEHAVIOR;
    }
    overrideModule(ngModule, override) {
        if (USE_RUNTIME_DEPS_TRACKER_FOR_JIT) {
            depsTracker.clearScopeCacheFor(ngModule);
        }
        this.overriddenModules.add(ngModule);
        // Compile the module right away.
        this.resolvers.module.addOverride(ngModule, override);
        const metadata = this.resolvers.module.resolve(ngModule);
        if (metadata === null) {
            throw invalidTypeError(ngModule.name, 'NgModule');
        }
        this.recompileNgModule(ngModule, metadata);
        // At this point, the module has a valid module def (ɵmod), but the override may have introduced
        // new declarations or imported modules. Ingest any possible new types and add them to the
        // current queue.
        this.queueTypesFromModulesArray([ngModule]);
    }
    overrideComponent(component, override) {
        this.verifyNoStandaloneFlagOverrides(component, override);
        this.resolvers.component.addOverride(component, override);
        this.pendingComponents.add(component);
        // If this is a component with async metadata (i.e. a component with a `@defer` block
        // in a template) - store it for future processing.
        this.maybeRegisterComponentWithAsyncMetadata(component);
    }
    overrideDirective(directive, override) {
        this.verifyNoStandaloneFlagOverrides(directive, override);
        this.resolvers.directive.addOverride(directive, override);
        this.pendingDirectives.add(directive);
    }
    overridePipe(pipe, override) {
        this.verifyNoStandaloneFlagOverrides(pipe, override);
        this.resolvers.pipe.addOverride(pipe, override);
        this.pendingPipes.add(pipe);
    }
    verifyNoStandaloneFlagOverrides(type, override) {
        if (override.add?.hasOwnProperty('standalone') ||
            override.set?.hasOwnProperty('standalone') ||
            override.remove?.hasOwnProperty('standalone')) {
            throw new Error(`An override for the ${type.name} class has the \`standalone\` flag. ` +
                `Changing the \`standalone\` flag via TestBed overrides is not supported.`);
        }
    }
    overrideProvider(token, provider) {
        let providerDef;
        if (provider.useFactory !== undefined) {
            providerDef = {
                provide: token,
                useFactory: provider.useFactory,
                deps: provider.deps || [],
                multi: provider.multi,
            };
        }
        else if (provider.useValue !== undefined) {
            providerDef = { provide: token, useValue: provider.useValue, multi: provider.multi };
        }
        else {
            providerDef = { provide: token };
        }
        const injectableDef = typeof token !== 'string' ? getInjectableDef(token) : null;
        const providedIn = injectableDef === null ? null : resolveForwardRef(injectableDef.providedIn);
        const overridesBucket = providedIn === 'root' ? this.rootProviderOverrides : this.providerOverrides;
        overridesBucket.push(providerDef);
        // Keep overrides grouped by token as well for fast lookups using token
        this.providerOverridesByToken.set(token, providerDef);
        if (injectableDef !== null && providedIn !== null && typeof providedIn !== 'string') {
            const existingOverrides = this.providerOverridesByModule.get(providedIn);
            if (existingOverrides !== undefined) {
                existingOverrides.push(providerDef);
            }
            else {
                this.providerOverridesByModule.set(providedIn, [providerDef]);
            }
        }
    }
    overrideTemplateUsingTestingModule(type, template) {
        const def = type[NG_COMP_DEF];
        const hasStyleUrls = () => {
            const metadata = this.resolvers.component.resolve(type);
            return !!metadata.styleUrl || !!metadata.styleUrls?.length;
        };
        const overrideStyleUrls = !!def && !ɵisComponentDefPendingResolution(type) && hasStyleUrls();
        // In Ivy, compiling a component does not require knowing the module providing the
        // component's scope, so overrideTemplateUsingTestingModule can be implemented purely via
        // overrideComponent. Important: overriding template requires full Component re-compilation,
        // which may fail in case styleUrls are also present (thus Component is considered as required
        // resolution). In order to avoid this, we preemptively set styleUrls to an empty array,
        // preserve current styles available on Component def and restore styles back once compilation
        // is complete.
        const override = overrideStyleUrls
            ? { template, styles: [], styleUrls: [], styleUrl: undefined }
            : { template };
        this.overrideComponent(type, { set: override });
        if (overrideStyleUrls && def.styles && def.styles.length > 0) {
            this.existingComponentStyles.set(type, def.styles);
        }
        // Set the component's scope to be the testing module.
        this.componentToModuleScope.set(type, TestingModuleOverride.OVERRIDE_TEMPLATE);
    }
    async resolvePendingComponentsWithAsyncMetadata() {
        if (this.componentsWithAsyncMetadata.size === 0)
            return;
        const promises = [];
        for (const component of this.componentsWithAsyncMetadata) {
            const asyncMetadataFn = getAsyncClassMetadataFn(component);
            if (asyncMetadataFn) {
                promises.push(asyncMetadataFn());
            }
        }
        this.componentsWithAsyncMetadata.clear();
        const resolvedDeps = await Promise.all(promises);
        const flatResolvedDeps = resolvedDeps.flat(2);
        this.queueTypesFromModulesArray(flatResolvedDeps);
        // Loaded standalone components might contain imports of NgModules
        // with providers, make sure we override providers there too.
        for (const component of flatResolvedDeps) {
            this.applyProviderOverridesInScope(component);
        }
    }
    async compileComponents() {
        this.clearComponentResolutionQueue();
        // Wait for all async metadata for components that were
        // overridden, we need resolved metadata to perform an override
        // and re-compile a component.
        await this.resolvePendingComponentsWithAsyncMetadata();
        // Verify that there were no standalone components present in the `declarations` field
        // during the `TestBed.configureTestingModule` call. We perform this check here in addition
        // to the logic in the `configureTestingModule` function, since at this point we have
        // all async metadata resolved.
        assertNoStandaloneComponents(this.declarations, this.resolvers.component, '"TestBed.configureTestingModule" call');
        // Run compilers for all queued types.
        let needsAsyncResources = this.compileTypesSync();
        // compileComponents() should not be async unless it needs to be.
        if (needsAsyncResources) {
            let resourceLoader;
            let resolver = (url) => {
                if (!resourceLoader) {
                    resourceLoader = this.injector.get(ResourceLoader);
                }
                return Promise.resolve(resourceLoader.get(url));
            };
            await ɵresolveComponentResources(resolver);
        }
    }
    finalize() {
        // One last compile
        this.compileTypesSync();
        // Create the testing module itself.
        this.compileTestModule();
        this.applyTransitiveScopes();
        this.applyProviderOverrides();
        // Patch previously stored `styles` Component values (taken from ɵcmp), in case these
        // Components have `styleUrls` fields defined and template override was requested.
        this.patchComponentsWithExistingStyles();
        // Clear the componentToModuleScope map, so that future compilations don't reset the scope of
        // every component.
        this.componentToModuleScope.clear();
        const parentInjector = this.platform.injector;
        this.testModuleRef = new NgModuleRef(this.testModuleType, parentInjector, []);
        // ApplicationInitStatus.runInitializers() is marked @internal to core.
        // Cast it to any before accessing it.
        this.testModuleRef.injector.get(ApplicationInitStatus).runInitializers();
        // Set locale ID after running app initializers, since locale information might be updated while
        // running initializers. This is also consistent with the execution order while bootstrapping an
        // app (see `packages/core/src/application_ref.ts` file).
        const localeId = this.testModuleRef.injector.get(LOCALE_ID, DEFAULT_LOCALE_ID);
        setLocaleId(localeId);
        return this.testModuleRef;
    }
    /**
     * @internal
     */
    _compileNgModuleSync(moduleType) {
        this.queueTypesFromModulesArray([moduleType]);
        this.compileTypesSync();
        this.applyProviderOverrides();
        this.applyProviderOverridesInScope(moduleType);
        this.applyTransitiveScopes();
    }
    /**
     * @internal
     */
    async _compileNgModuleAsync(moduleType) {
        this.queueTypesFromModulesArray([moduleType]);
        await this.compileComponents();
        this.applyProviderOverrides();
        this.applyProviderOverridesInScope(moduleType);
        this.applyTransitiveScopes();
    }
    /**
     * @internal
     */
    _getModuleResolver() {
        return this.resolvers.module;
    }
    /**
     * @internal
     */
    _getComponentFactories(moduleType) {
        return maybeUnwrapFn(moduleType.ɵmod.declarations).reduce((factories, declaration) => {
            const componentDef = declaration.ɵcmp;
            componentDef && factories.push(new ComponentFactory(componentDef, this.testModuleRef));
            return factories;
        }, []);
    }
    compileTypesSync() {
        // Compile all queued components, directives, pipes.
        let needsAsyncResources = false;
        this.pendingComponents.forEach((declaration) => {
            if (getAsyncClassMetadataFn(declaration)) {
                throw new Error(`Component '${declaration.name}' has unresolved metadata. ` +
                    `Please call \`await TestBed.compileComponents()\` before running this test.`);
            }
            needsAsyncResources = needsAsyncResources || ɵisComponentDefPendingResolution(declaration);
            const metadata = this.resolvers.component.resolve(declaration);
            if (metadata === null) {
                throw invalidTypeError(declaration.name, 'Component');
            }
            this.maybeStoreNgDef(NG_COMP_DEF, declaration);
            if (USE_RUNTIME_DEPS_TRACKER_FOR_JIT) {
                depsTracker.clearScopeCacheFor(declaration);
            }
            compileComponent(declaration, metadata);
        });
        this.pendingComponents.clear();
        this.pendingDirectives.forEach((declaration) => {
            const metadata = this.resolvers.directive.resolve(declaration);
            if (metadata === null) {
                throw invalidTypeError(declaration.name, 'Directive');
            }
            this.maybeStoreNgDef(NG_DIR_DEF, declaration);
            compileDirective(declaration, metadata);
        });
        this.pendingDirectives.clear();
        this.pendingPipes.forEach((declaration) => {
            const metadata = this.resolvers.pipe.resolve(declaration);
            if (metadata === null) {
                throw invalidTypeError(declaration.name, 'Pipe');
            }
            this.maybeStoreNgDef(NG_PIPE_DEF, declaration);
            compilePipe(declaration, metadata);
        });
        this.pendingPipes.clear();
        return needsAsyncResources;
    }
    applyTransitiveScopes() {
        if (this.overriddenModules.size > 0) {
            // Module overrides (via `TestBed.overrideModule`) might affect scopes that were previously
            // calculated and stored in `transitiveCompileScopes`. If module overrides are present,
            // collect all affected modules and reset scopes to force their re-calculation.
            const testingModuleDef = this.testModuleType[NG_MOD_DEF];
            const affectedModules = this.collectModulesAffectedByOverrides(testingModuleDef.imports);
            if (affectedModules.size > 0) {
                affectedModules.forEach((moduleType) => {
                    if (!USE_RUNTIME_DEPS_TRACKER_FOR_JIT) {
                        this.storeFieldOfDefOnType(moduleType, NG_MOD_DEF, 'transitiveCompileScopes');
                        moduleType[NG_MOD_DEF].transitiveCompileScopes = null;
                    }
                    else {
                        depsTracker.clearScopeCacheFor(moduleType);
                    }
                });
            }
        }
        const moduleToScope = new Map();
        const getScopeOfModule = (moduleType) => {
            if (!moduleToScope.has(moduleType)) {
                const isTestingModule = isTestingModuleOverride(moduleType);
                const realType = isTestingModule ? this.testModuleType : moduleType;
                moduleToScope.set(moduleType, transitiveScopesFor(realType));
            }
            return moduleToScope.get(moduleType);
        };
        this.componentToModuleScope.forEach((moduleType, componentType) => {
            if (moduleType !== null) {
                const moduleScope = getScopeOfModule(moduleType);
                this.storeFieldOfDefOnType(componentType, NG_COMP_DEF, 'directiveDefs');
                this.storeFieldOfDefOnType(componentType, NG_COMP_DEF, 'pipeDefs');
                patchComponentDefWithScope(getComponentDef(componentType), moduleScope);
            }
            // `tView` that is stored on component def contains information about directives and pipes
            // that are in the scope of this component. Patching component scope will cause `tView` to be
            // changed. Store original `tView` before patching scope, so the `tView` (including scope
            // information) is restored back to its previous/original state before running next test.
            // Resetting `tView` is also needed for cases when we apply provider overrides and those
            // providers are defined on component's level, in which case they may end up included into
            // `tView.blueprint`.
            this.storeFieldOfDefOnType(componentType, NG_COMP_DEF, 'tView');
        });
        this.componentToModuleScope.clear();
    }
    applyProviderOverrides() {
        const maybeApplyOverrides = (field) => (type) => {
            const resolver = field === NG_COMP_DEF ? this.resolvers.component : this.resolvers.directive;
            const metadata = resolver.resolve(type);
            if (this.hasProviderOverrides(metadata.providers)) {
                this.patchDefWithProviderOverrides(type, field);
            }
        };
        this.seenComponents.forEach(maybeApplyOverrides(NG_COMP_DEF));
        this.seenDirectives.forEach(maybeApplyOverrides(NG_DIR_DEF));
        this.seenComponents.clear();
        this.seenDirectives.clear();
    }
    /**
     * Applies provider overrides to a given type (either an NgModule or a standalone component)
     * and all imported NgModules and standalone components recursively.
     */
    applyProviderOverridesInScope(type) {
        const hasScope = isStandaloneComponent(type) || isNgModule(type);
        // The function can be re-entered recursively while inspecting dependencies
        // of an NgModule or a standalone component. Exit early if we come across a
        // type that can not have a scope (directive or pipe) or the type is already
        // processed earlier.
        if (!hasScope || this.scopesWithOverriddenProviders.has(type)) {
            return;
        }
        this.scopesWithOverriddenProviders.add(type);
        // NOTE: the line below triggers JIT compilation of the module injector,
        // which also invokes verification of the NgModule semantics, which produces
        // detailed error messages. The fact that the code relies on this line being
        // present here is suspicious and should be refactored in a way that the line
        // below can be moved (for ex. after an early exit check below).
        const injectorDef = type[NG_INJ_DEF];
        // No provider overrides, exit early.
        if (this.providerOverridesByToken.size === 0)
            return;
        if (isStandaloneComponent(type)) {
            // Visit all component dependencies and override providers there.
            const def = getComponentDef(type);
            const dependencies = maybeUnwrapFn(def.dependencies ?? []);
            for (const dependency of dependencies) {
                this.applyProviderOverridesInScope(dependency);
            }
        }
        else {
            const providers = [
                ...injectorDef.providers,
                ...(this.providerOverridesByModule.get(type) || []),
            ];
            if (this.hasProviderOverrides(providers)) {
                this.maybeStoreNgDef(NG_INJ_DEF, type);
                this.storeFieldOfDefOnType(type, NG_INJ_DEF, 'providers');
                injectorDef.providers = this.getOverriddenProviders(providers);
            }
            // Apply provider overrides to imported modules recursively
            const moduleDef = type[NG_MOD_DEF];
            const imports = maybeUnwrapFn(moduleDef.imports);
            for (const importedModule of imports) {
                this.applyProviderOverridesInScope(importedModule);
            }
            // Also override the providers on any ModuleWithProviders imports since those don't appear in
            // the moduleDef.
            for (const importedModule of flatten(injectorDef.imports)) {
                if (isModuleWithProviders(importedModule)) {
                    this.defCleanupOps.push({
                        object: importedModule,
                        fieldName: 'providers',
                        originalValue: importedModule.providers,
                    });
                    importedModule.providers = this.getOverriddenProviders(importedModule.providers);
                }
            }
        }
    }
    patchComponentsWithExistingStyles() {
        this.existingComponentStyles.forEach((styles, type) => (type[NG_COMP_DEF].styles = styles));
        this.existingComponentStyles.clear();
    }
    queueTypeArray(arr, moduleType) {
        for (const value of arr) {
            if (Array.isArray(value)) {
                this.queueTypeArray(value, moduleType);
            }
            else {
                this.queueType(value, moduleType);
            }
        }
    }
    recompileNgModule(ngModule, metadata) {
        // Cache the initial ngModuleDef as it will be overwritten.
        this.maybeStoreNgDef(NG_MOD_DEF, ngModule);
        this.maybeStoreNgDef(NG_INJ_DEF, ngModule);
        compileNgModuleDefs(ngModule, metadata);
    }
    maybeRegisterComponentWithAsyncMetadata(type) {
        const asyncMetadataFn = getAsyncClassMetadataFn(type);
        if (asyncMetadataFn) {
            this.componentsWithAsyncMetadata.add(type);
        }
    }
    queueType(type, moduleType) {
        // If this is a component with async metadata (i.e. a component with a `@defer` block
        // in a template) - store it for future processing.
        this.maybeRegisterComponentWithAsyncMetadata(type);
        const component = this.resolvers.component.resolve(type);
        if (component) {
            // Check whether a give Type has respective NG def (ɵcmp) and compile if def is
            // missing. That might happen in case a class without any Angular decorators extends another
            // class where Component/Directive/Pipe decorator is defined.
            if (ɵisComponentDefPendingResolution(type) || !type.hasOwnProperty(NG_COMP_DEF)) {
                this.pendingComponents.add(type);
            }
            this.seenComponents.add(type);
            // Keep track of the module which declares this component, so later the component's scope
            // can be set correctly. If the component has already been recorded here, then one of several
            // cases is true:
            // * the module containing the component was imported multiple times (common).
            // * the component is declared in multiple modules (which is an error).
            // * the component was in 'declarations' of the testing module, and also in an imported module
            //   in which case the module scope will be TestingModuleOverride.DECLARATION.
            // * overrideTemplateUsingTestingModule was called for the component in which case the module
            //   scope will be TestingModuleOverride.OVERRIDE_TEMPLATE.
            //
            // If the component was previously in the testing module's 'declarations' (meaning the
            // current value is TestingModuleOverride.DECLARATION), then `moduleType` is the component's
            // real module, which was imported. This pattern is understood to mean that the component
            // should use its original scope, but that the testing module should also contain the
            // component in its scope.
            if (!this.componentToModuleScope.has(type) ||
                this.componentToModuleScope.get(type) === TestingModuleOverride.DECLARATION) {
                this.componentToModuleScope.set(type, moduleType);
            }
            return;
        }
        const directive = this.resolvers.directive.resolve(type);
        if (directive) {
            if (!type.hasOwnProperty(NG_DIR_DEF)) {
                this.pendingDirectives.add(type);
            }
            this.seenDirectives.add(type);
            return;
        }
        const pipe = this.resolvers.pipe.resolve(type);
        if (pipe && !type.hasOwnProperty(NG_PIPE_DEF)) {
            this.pendingPipes.add(type);
            return;
        }
    }
    queueTypesFromModulesArray(arr) {
        // Because we may encounter the same NgModule or a standalone Component while processing
        // the dependencies of an NgModule or a standalone Component, we cache them in this set so we
        // can skip ones that have already been seen encountered. In some test setups, this caching
        // resulted in 10X runtime improvement.
        const processedDefs = new Set();
        const queueTypesFromModulesArrayRecur = (arr) => {
            for (const value of arr) {
                if (Array.isArray(value)) {
                    queueTypesFromModulesArrayRecur(value);
                }
                else if (hasNgModuleDef(value)) {
                    const def = value.ɵmod;
                    if (processedDefs.has(def)) {
                        continue;
                    }
                    processedDefs.add(def);
                    // Look through declarations, imports, and exports, and queue
                    // everything found there.
                    this.queueTypeArray(maybeUnwrapFn(def.declarations), value);
                    queueTypesFromModulesArrayRecur(maybeUnwrapFn(def.imports));
                    queueTypesFromModulesArrayRecur(maybeUnwrapFn(def.exports));
                }
                else if (isModuleWithProviders(value)) {
                    queueTypesFromModulesArrayRecur([value.ngModule]);
                }
                else if (isStandaloneComponent(value)) {
                    this.queueType(value, null);
                    const def = getComponentDef(value);
                    if (processedDefs.has(def)) {
                        continue;
                    }
                    processedDefs.add(def);
                    const dependencies = maybeUnwrapFn(def.dependencies ?? []);
                    dependencies.forEach((dependency) => {
                        // Note: in AOT, the `dependencies` might also contain regular
                        // (NgModule-based) Component, Directive and Pipes, so we handle
                        // them separately and proceed with recursive process for standalone
                        // Components and NgModules only.
                        if (isStandaloneComponent(dependency) || hasNgModuleDef(dependency)) {
                            queueTypesFromModulesArrayRecur([dependency]);
                        }
                        else {
                            this.queueType(dependency, null);
                        }
                    });
                }
            }
        };
        queueTypesFromModulesArrayRecur(arr);
    }
    // When module overrides (via `TestBed.overrideModule`) are present, it might affect all modules
    // that import (even transitively) an overridden one. For all affected modules we need to
    // recalculate their scopes for a given test run and restore original scopes at the end. The goal
    // of this function is to collect all affected modules in a set for further processing. Example:
    // if we have the following module hierarchy: A -> B -> C (where `->` means `imports`) and module
    // `C` is overridden, we consider `A` and `B` as affected, since their scopes might become
    // invalidated with the override.
    collectModulesAffectedByOverrides(arr) {
        const seenModules = new Set();
        const affectedModules = new Set();
        const calcAffectedModulesRecur = (arr, path) => {
            for (const value of arr) {
                if (Array.isArray(value)) {
                    // If the value is an array, just flatten it (by invoking this function recursively),
                    // keeping "path" the same.
                    calcAffectedModulesRecur(value, path);
                }
                else if (hasNgModuleDef(value)) {
                    if (seenModules.has(value)) {
                        // If we've seen this module before and it's included into "affected modules" list, mark
                        // the whole path that leads to that module as affected, but do not descend into its
                        // imports, since we already examined them before.
                        if (affectedModules.has(value)) {
                            path.forEach((item) => affectedModules.add(item));
                        }
                        continue;
                    }
                    seenModules.add(value);
                    if (this.overriddenModules.has(value)) {
                        path.forEach((item) => affectedModules.add(item));
                    }
                    // Examine module imports recursively to look for overridden modules.
                    const moduleDef = value[NG_MOD_DEF];
                    calcAffectedModulesRecur(maybeUnwrapFn(moduleDef.imports), path.concat(value));
                }
            }
        };
        calcAffectedModulesRecur(arr, []);
        return affectedModules;
    }
    /**
     * Preserve an original def (such as ɵmod, ɵinj, etc) before applying an override.
     * Note: one class may have multiple defs (for example: ɵmod and ɵinj in case of
     * an NgModule). If there is a def in a set already, don't override it, since
     * an original one should be restored at the end of a test.
     */
    maybeStoreNgDef(prop, type) {
        if (!this.initialNgDefs.has(type)) {
            this.initialNgDefs.set(type, new Map());
        }
        const currentDefs = this.initialNgDefs.get(type);
        if (!currentDefs.has(prop)) {
            const currentDef = Object.getOwnPropertyDescriptor(type, prop);
            currentDefs.set(prop, currentDef);
        }
    }
    storeFieldOfDefOnType(type, defField, fieldName) {
        const def = type[defField];
        const originalValue = def[fieldName];
        this.defCleanupOps.push({ object: def, fieldName, originalValue });
    }
    /**
     * Clears current components resolution queue, but stores the state of the queue, so we can
     * restore it later. Clearing the queue is required before we try to compile components (via
     * `TestBed.compileComponents`), so that component defs are in sync with the resolution queue.
     */
    clearComponentResolutionQueue() {
        if (this.originalComponentResolutionQueue === null) {
            this.originalComponentResolutionQueue = new Map();
        }
        ɵclearResolutionOfComponentResourcesQueue().forEach((value, key) => this.originalComponentResolutionQueue.set(key, value));
    }
    /*
     * Restores component resolution queue to the previously saved state. This operation is performed
     * as a part of restoring the state after completion of the current set of tests (that might
     * potentially mutate the state).
     */
    restoreComponentResolutionQueue() {
        if (this.originalComponentResolutionQueue !== null) {
            ɵrestoreComponentResolutionQueue(this.originalComponentResolutionQueue);
            this.originalComponentResolutionQueue = null;
        }
    }
    restoreOriginalState() {
        // Process cleanup ops in reverse order so the field's original value is restored correctly (in
        // case there were multiple overrides for the same field).
        forEachRight(this.defCleanupOps, (op) => {
            op.object[op.fieldName] = op.originalValue;
        });
        // Restore initial component/directive/pipe defs
        this.initialNgDefs.forEach((defs, type) => {
            if (USE_RUNTIME_DEPS_TRACKER_FOR_JIT) {
                depsTracker.clearScopeCacheFor(type);
            }
            defs.forEach((descriptor, prop) => {
                if (!descriptor) {
                    // Delete operations are generally undesirable since they have performance
                    // implications on objects they were applied to. In this particular case, situations
                    // where this code is invoked should be quite rare to cause any noticeable impact,
                    // since it's applied only to some test cases (for example when class with no
                    // annotations extends some @Component) when we need to clear 'ɵcmp' field on a given
                    // class to restore its original state (before applying overrides and running tests).
                    delete type[prop];
                }
                else {
                    Object.defineProperty(type, prop, descriptor);
                }
            });
        });
        this.initialNgDefs.clear();
        this.scopesWithOverriddenProviders.clear();
        this.restoreComponentResolutionQueue();
        // Restore the locale ID to the default value, this shouldn't be necessary but we never know
        setLocaleId(DEFAULT_LOCALE_ID);
    }
    compileTestModule() {
        class RootScopeModule {
        }
        compileNgModuleDefs(RootScopeModule, {
            providers: [
                ...this.rootProviderOverrides,
                internalProvideZoneChangeDetection({}),
                TestBedApplicationErrorHandler,
                {
                    provide: INTERNAL_APPLICATION_ERROR_HANDLER,
                    useFactory: () => {
                        if (inject(ZONELESS_ENABLED) || inject(RETHROW_APPLICATION_ERRORS, { optional: true })) {
                            const handler = inject(TestBedApplicationErrorHandler);
                            return (e) => {
                                handler.handleError(e);
                            };
                        }
                        else {
                            const userErrorHandler = inject(ErrorHandler);
                            const ngZone = inject(NgZone);
                            return (e) => ngZone.runOutsideAngular(() => userErrorHandler.handleError(e));
                        }
                    },
                },
                { provide: ChangeDetectionScheduler, useExisting: ChangeDetectionSchedulerImpl },
            ],
        });
        const providers = [
            { provide: Compiler, useFactory: () => new R3TestCompiler(this) },
            { provide: DEFER_BLOCK_CONFIG, useValue: { behavior: this.deferBlockBehavior } },
            ...this.providers,
            ...this.providerOverrides,
        ];
        const imports = [RootScopeModule, this.additionalModuleTypes, this.imports || []];
        compileNgModuleDefs(this.testModuleType, {
            declarations: this.declarations,
            imports,
            schemas: this.schemas,
            providers,
        }, 
        /* allowDuplicateDeclarationsInRoot */ true);
        this.applyProviderOverridesInScope(this.testModuleType);
    }
    get injector() {
        if (this._injector !== null) {
            return this._injector;
        }
        const providers = [];
        const compilerOptions = this.platform.injector.get(COMPILER_OPTIONS);
        compilerOptions.forEach((opts) => {
            if (opts.providers) {
                providers.push(opts.providers);
            }
        });
        if (this.compilerProviders !== null) {
            providers.push(...this.compilerProviders);
        }
        this._injector = Injector.create({ providers, parent: this.platform.injector });
        return this._injector;
    }
    // get overrides for a specific provider (if any)
    getSingleProviderOverrides(provider) {
        const token = getProviderToken(provider);
        return this.providerOverridesByToken.get(token) || null;
    }
    getProviderOverrides(providers) {
        if (!providers || !providers.length || this.providerOverridesByToken.size === 0)
            return [];
        // There are two flattening operations here. The inner flattenProviders() operates on the
        // metadata's providers and applies a mapping function which retrieves overrides for each
        // incoming provider. The outer flatten() then flattens the produced overrides array. If this is
        // not done, the array can contain other empty arrays (e.g. `[[], []]`) which leak into the
        // providers array and contaminate any error messages that might be generated.
        return flatten(flattenProviders(providers, (provider) => this.getSingleProviderOverrides(provider) || []));
    }
    getOverriddenProviders(providers) {
        if (!providers || !providers.length || this.providerOverridesByToken.size === 0)
            return [];
        const flattenedProviders = flattenProviders(providers);
        const overrides = this.getProviderOverrides(flattenedProviders);
        const overriddenProviders = [...flattenedProviders, ...overrides];
        const final = [];
        const seenOverriddenProviders = new Set();
        // We iterate through the list of providers in reverse order to make sure provider overrides
        // take precedence over the values defined in provider list. We also filter out all providers
        // that have overrides, keeping overridden values only. This is needed, since presence of a
        // provider with `ngOnDestroy` hook will cause this hook to be registered and invoked later.
        forEachRight(overriddenProviders, (provider) => {
            const token = getProviderToken(provider);
            if (this.providerOverridesByToken.has(token)) {
                if (!seenOverriddenProviders.has(token)) {
                    seenOverriddenProviders.add(token);
                    // Treat all overridden providers as `{multi: false}` (even if it's a multi-provider) to
                    // make sure that provided override takes highest precedence and is not combined with
                    // other instances of the same multi provider.
                    final.unshift({ ...provider, multi: false });
                }
            }
            else {
                final.unshift(provider);
            }
        });
        return final;
    }
    hasProviderOverrides(providers) {
        return this.getProviderOverrides(providers).length > 0;
    }
    patchDefWithProviderOverrides(declaration, field) {
        const def = declaration[field];
        if (def && def.providersResolver) {
            this.maybeStoreNgDef(field, declaration);
            const resolver = def.providersResolver;
            const processProvidersFn = (providers) => this.getOverriddenProviders(providers);
            this.storeFieldOfDefOnType(declaration, field, 'providersResolver');
            def.providersResolver = (ngDef) => resolver(ngDef, processProvidersFn);
        }
    }
}
function initResolvers() {
    return {
        module: new NgModuleResolver(),
        component: new ComponentResolver(),
        directive: new DirectiveResolver(),
        pipe: new PipeResolver(),
    };
}
function isStandaloneComponent(value) {
    const def = getComponentDef(value);
    return !!def?.standalone;
}
function getComponentDef(value) {
    return value.ɵcmp ?? null;
}
function hasNgModuleDef(value) {
    return value.hasOwnProperty('ɵmod');
}
function isNgModule(value) {
    return hasNgModuleDef(value);
}
function maybeUnwrapFn(maybeFn) {
    return maybeFn instanceof Function ? maybeFn() : maybeFn;
}
function flatten(values) {
    const out = [];
    values.forEach((value) => {
        if (Array.isArray(value)) {
            out.push(...flatten(value));
        }
        else {
            out.push(value);
        }
    });
    return out;
}
function identityFn(value) {
    return value;
}
function flattenProviders(providers, mapFn = identityFn) {
    const out = [];
    for (let provider of providers) {
        if (isEnvironmentProviders(provider)) {
            provider = provider.ɵproviders;
        }
        if (Array.isArray(provider)) {
            out.push(...flattenProviders(provider, mapFn));
        }
        else {
            out.push(mapFn(provider));
        }
    }
    return out;
}
function getProviderField(provider, field) {
    return provider && typeof provider === 'object' && provider[field];
}
function getProviderToken(provider) {
    return getProviderField(provider, 'provide') || provider;
}
function isModuleWithProviders(value) {
    return value.hasOwnProperty('ngModule');
}
function forEachRight(values, fn) {
    for (let idx = values.length - 1; idx >= 0; idx--) {
        fn(values[idx], idx);
    }
}
function invalidTypeError(name, expectedType) {
    return new Error(`${name} class doesn't have @${expectedType} decorator or is missing metadata.`);
}
class R3TestCompiler {
    constructor(testBed) {
        this.testBed = testBed;
    }
    compileModuleSync(moduleType) {
        this.testBed._compileNgModuleSync(moduleType);
        return new R3NgModuleFactory(moduleType);
    }
    async compileModuleAsync(moduleType) {
        await this.testBed._compileNgModuleAsync(moduleType);
        return new R3NgModuleFactory(moduleType);
    }
    compileModuleAndAllComponentsSync(moduleType) {
        const ngModuleFactory = this.compileModuleSync(moduleType);
        const componentFactories = this.testBed._getComponentFactories(moduleType);
        return new ModuleWithComponentFactories(ngModuleFactory, componentFactories);
    }
    async compileModuleAndAllComponentsAsync(moduleType) {
        const ngModuleFactory = await this.compileModuleAsync(moduleType);
        const componentFactories = this.testBed._getComponentFactories(moduleType);
        return new ModuleWithComponentFactories(ngModuleFactory, componentFactories);
    }
    clearCache() { }
    clearCacheFor(type) { }
    getModuleId(moduleType) {
        const meta = this.testBed._getModuleResolver().resolve(moduleType);
        return (meta && meta.id) || undefined;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdF9iZWRfY29tcGlsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3Rlc3Rpbmcvc3JjL3Rlc3RfYmVkX2NvbXBpbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNqRCxPQUFPLEVBQ0wscUJBQXFCLEVBQ3JCLG1DQUFtQyxJQUFJLGtDQUFrQyxFQUN6RSx5QkFBeUIsSUFBSSx3QkFBd0IsRUFDckQsNkJBQTZCLElBQUksNEJBQTRCLEVBQzdELFFBQVEsRUFDUixnQkFBZ0IsRUFHaEIsUUFBUSxFQUNSLE1BQU0sRUFFTixTQUFTLEVBQ1QsNEJBQTRCLEVBRTVCLGlCQUFpQixJQUFJLGdCQUFnQixFQU1yQyxpQkFBaUIsRUFHakIseUNBQXlDLEVBQ3pDLGlCQUFpQixJQUFJLGdCQUFnQixFQUNyQyxpQkFBaUIsSUFBSSxnQkFBZ0IsRUFDckMsb0JBQW9CLElBQUksbUJBQW1CLEVBQzNDLFlBQVksSUFBSSxXQUFXLEVBQzNCLGtCQUFrQixJQUFJLGlCQUFpQixFQUN2QyxtQkFBbUIsSUFBSSxrQkFBa0IsRUFDekMsWUFBWSxJQUFJLFdBQVcsRUFFM0Isc0NBQXNDLEVBQ3RDLHdCQUF3QixJQUFJLHVCQUF1QixFQUNuRCxpQkFBaUIsSUFBSSxnQkFBZ0IsRUFFckMsbUNBQW1DLElBQUksa0NBQWtDLEVBQ3pFLGdDQUFnQyxFQUNoQyx1QkFBdUIsSUFBSSxzQkFBc0IsRUFDakQsWUFBWSxJQUFJLFdBQVcsRUFDM0IsV0FBVyxJQUFJLFVBQVUsRUFDekIsV0FBVyxJQUFJLFVBQVUsRUFDekIsV0FBVyxJQUFJLFVBQVUsRUFDekIsWUFBWSxJQUFJLFdBQVcsRUFDM0IsZ0JBQWdCLElBQUksaUJBQWlCLEVBR3JDLDJCQUEyQixJQUFJLDBCQUEwQixFQUN6RCx3QkFBd0IsSUFB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S0FBVSxDQUFDO0lBRXJCLGFBQWEsQ0FBQyxJQUFlLElBQVMsQ0FBQztJQUV2QyxXQUFXLENBQUMsVUFBcUI7UUFDL0IsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNuRSxPQUFPLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxTQUFTLENBQUM7SUFDeEMsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1Jlc291cmNlTG9hZGVyfSBmcm9tICdAYW5ndWxhci9jb21waWxlcic7XG5pbXBvcnQge1xuICBBcHBsaWNhdGlvbkluaXRTdGF0dXMsXG4gIMm1SU5URVJOQUxfQVBQTElDQVRJT05fRVJST1JfSEFORExFUiBhcyBJTlRFUk5BTF9BUFBMSUNBVElPTl9FUlJPUl9IQU5ETEVSLFxuICDJtUNoYW5nZURldGVjdGlvblNjaGVkdWxlciBhcyBDaGFuZ2VEZXRlY3Rpb25TY2hlZHVsZXIsXG4gIMm1Q2hhbmdlRGV0ZWN0aW9uU2NoZWR1bGVySW1wbCBhcyBDaGFuZ2VEZXRlY3Rpb25TY2hlZHVsZXJJbXBsLFxuICBDb21waWxlcixcbiAgQ09NUElMRVJfT1BUSU9OUyxcbiAgQ29tcG9uZW50LFxuICBEaXJlY3RpdmUsXG4gIEluamVjdG9yLFxuICBpbmplY3QsXG4gIEluamVjdG9yVHlwZSxcbiAgTE9DQUxFX0lELFxuICBNb2R1bGVXaXRoQ29tcG9uZW50RmFjdG9yaWVzLFxuICBNb2R1bGVXaXRoUHJvdmlkZXJzLFxuICDJtVpPTkVMRVNTX0VOQUJMRUQgYXMgWk9ORUxFU1NfRU5BQkxFRCxcbiAgTmdNb2R1bGUsXG4gIE5nTW9kdWxlRmFjdG9yeSxcbiAgUGlwZSxcbiAgUGxhdGZvcm1SZWYsXG4gIFByb3ZpZGVyLFxuICByZXNvbHZlRm9yd2FyZFJlZixcbiAgU3RhdGljUHJvdmlkZXIsXG4gIFR5cGUsXG4gIMm1Y2xlYXJSZXNvbHV0aW9uT2ZDb21wb25lbnRSZXNvdXJjZXNRdWV1ZSxcbiAgybVjb21waWxlQ29tcG9uZW50IGFzIGNvbXBpbGVDb21wb25lbnQsXG4gIMm1Y29tcGlsZURpcmVjdGl2ZSBhcyBjb21waWxlRGlyZWN0aXZlLFxuICDJtWNvbXBpbGVOZ01vZHVsZURlZnMgYXMgY29tcGlsZU5nTW9kdWxlRGVmcyxcbiAgybVjb21waWxlUGlwZSBhcyBjb21waWxlUGlwZSxcbiAgybVERUZBVUxUX0xPQ0FMRV9JRCBhcyBERUZBVUxUX0xPQ0FMRV9JRCxcbiAgybVERUZFUl9CTE9DS19DT05GSUcgYXMgREVGRVJfQkxPQ0tfQ09ORklHLFxuICDJtWRlcHNUcmFja2VyIGFzIGRlcHNUcmFja2VyLFxuICDJtURpcmVjdGl2ZURlZiBhcyBEaXJlY3RpdmVEZWYsXG4gIMm1Z2VuZXJhdGVTdGFuZGFsb25lSW5EZWNsYXJhdGlvbnNFcnJvcixcbiAgybVnZXRBc3luY0NsYXNzTWV0YWRhdGFGbiBhcyBnZXRBc3luY0NsYXNzTWV0YWRhdGFGbixcbiAgybVnZXRJbmplY3RhYmxlRGVmIGFzIGdldEluamVjdGFibGVEZWYsXG4gIMm1SW50ZXJuYWxFbnZpcm9ubWVudFByb3ZpZGVycyBhcyBJbnRlcm5hbEVudmlyb25tZW50UHJvdmlkZXJzLFxuICDJtWludGVybmFsUHJvdmlkZVpvbmVDaGFuZ2VEZXRlY3Rpb24gYXMgaW50ZXJuYWxQcm92aWRlWm9uZUNoYW5nZURldGVjdGlvbixcbiAgybVpc0NvbXBvbmVudERlZlBlbmRpbmdSZXNvbHV0aW9uLFxuICDJtWlzRW52aXJvbm1lbnRQcm92aWRlcnMgYXMgaXNFbnZpcm9ubWVudFByb3ZpZGVycyxcbiAgybVOR19DT01QX0RFRiBhcyBOR19DT01QX0RFRixcbiAgybVOR19ESVJfREVGIGFzIE5HX0RJUl9ERUYsXG4gIMm1TkdfSU5KX0RFRiBhcyBOR19JTkpfREVGLFxuICDJtU5HX01PRF9ERUYgYXMgTkdfTU9EX0RFRixcbiAgybVOR19QSVBFX0RFRiBhcyBOR19QSVBFX0RFRixcbiAgybVOZ01vZHVsZUZhY3RvcnkgYXMgUjNOZ01vZHVsZUZhY3RvcnksXG4gIMm1TmdNb2R1bGVUcmFuc2l0aXZlU2NvcGVzIGFzIE5nTW9kdWxlVHJhbnNpdGl2ZVNjb3BlcyxcbiAgybVOZ01vZHVsZVR5cGUgYXMgTmdNb2R1bGVUeXBlLFxuICDJtXBhdGNoQ29tcG9uZW50RGVmV2l0aFNjb3BlIGFzIHBhdGNoQ29tcG9uZW50RGVmV2l0aFNjb3BlLFxuICDJtVJlbmRlcjNDb21wb25lbnRGYWN0b3J5IGFzIENvbXBvbmVudEZhY3RvcnksXG4gIMm1UmVuZGVyM05nTW9kdWxlUmVmIGFzIE5nTW9kdWxlUmVmLFxuICDJtXJlc29sdmVDb21wb25lbnRSZXNvdXJjZXMsXG4gIMm1cmVzdG9yZUNvbXBvbmVudFJlc29sdXRpb25RdWV1ZSxcbiAgybVzZXRMb2NhbGVJZCBhcyBzZXRMb2NhbGVJZCxcbiAgybV0cmFuc2l0aXZlU2NvcGVzRm9yIGFzIHRyYW5zaXRpdmVTY29wZXNGb3IsXG4gIMm1VVNFX1JVTlRJTUVfREVQU19UUkFDS0VSX0ZPUl9KSVQgYXMgVVNFX1JVTlRJTUVfREVQU19UUkFDS0VSX0ZPUl9KSVQsXG4gIMm1ybVJbmplY3RhYmxlRGVjbGFyYXRpb24gYXMgSW5qZWN0YWJsZURlY2xhcmF0aW9uLFxuICBOZ1pvbmUsXG4gIEVycm9ySGFuZGxlcixcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7Q29tcG9uZW50RGVmLCBDb21wb25lbnRUeXBlfSBmcm9tICcuLi8uLi9zcmMvcmVuZGVyMyc7XG5cbmltcG9ydCB7TWV0YWRhdGFPdmVycmlkZX0gZnJvbSAnLi9tZXRhZGF0YV9vdmVycmlkZSc7XG5pbXBvcnQge1xuICBDb21wb25lbnRSZXNvbHZlcixcbiAgRGlyZWN0aXZlUmVzb2x2ZXIsXG4gIE5nTW9kdWxlUmVzb2x2ZXIsXG4gIFBpcGVSZXNvbHZlcixcbiAgUmVzb2x2ZXIsXG59IGZyb20gJy4vcmVzb2x2ZXJzJztcbmltcG9ydCB7REVGRVJfQkxPQ0tfREVGQVVMVF9CRUhBVklPUiwgVGVzdE1vZHVsZU1ldGFkYXRhfSBmcm9tICcuL3Rlc3RfYmVkX2NvbW1vbic7XG5pbXBvcnQge1xuICBSRVRIUk9XX0FQUExJQ0FUSU9OX0VSUk9SUyxcbiAgVGVzdEJlZEFwcGxpY2F0aW9uRXJyb3JIYW5kbGVyLFxufSBmcm9tICcuL2FwcGxpY2F0aW9uX2Vycm9yX2hhbmRsZXInO1xuXG5lbnVtIFRlc3RpbmdNb2R1bGVPdmVycmlkZSB7XG4gIERFQ0xBUkFUSU9OLFxuICBPVkVSUklERV9URU1QTEFURSxcbn1cblxuZnVuY3Rpb24gaXNUZXN0aW5nTW9kdWxlT3ZlcnJpZGUodmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyBUZXN0aW5nTW9kdWxlT3ZlcnJpZGUge1xuICByZXR1cm4gKFxuICAgIHZhbHVlID09PSBUZXN0aW5nTW9kdWxlT3ZlcnJpZGUuREVDTEFSQVRJT04gfHwgdmFsdWUgPT09IFRlc3RpbmdNb2R1bGVPdmVycmlkZS5PVkVSUklERV9URU1QTEFURVxuICApO1xufVxuXG5mdW5jdGlvbiBhc3NlcnROb1N0YW5kYWxvbmVDb21wb25lbnRzKFxuICB0eXBlczogVHlwZTxhbnk+W10sXG4gIHJlc29sdmVyOiBSZXNvbHZlcjxhbnk+LFxuICBsb2NhdGlvbjogc3RyaW5nLFxuKSB7XG4gIHR5cGVzLmZvckVhY2goKHR5cGUpID0+IHtcbiAgICBpZiAoIWdldEFzeW5jQ2xhc3NNZXRhZGF0YUZuKHR5cGUpKSB7XG4gICAgICBjb25zdCBjb21wb25lbnQgPSByZXNvbHZlci5yZXNvbHZlKHR5cGUpO1xuICAgICAgaWYgKGNvbXBvbmVudCAmJiBjb21wb25lbnQuc3RhbmRhbG9uZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoybVnZW5lcmF0ZVN0YW5kYWxvbmVJbkRlY2xhcmF0aW9uc0Vycm9yKHR5cGUsIGxvY2F0aW9uKSk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbn1cblxuLy8gUmVzb2x2ZXJzIGZvciBBbmd1bGFyIGRlY29yYXRvcnNcbnR5cGUgUmVzb2x2ZXJzID0ge1xuICBtb2R1bGU6IFJlc29sdmVyPE5nTW9kdWxlPjtcbiAgY29tcG9uZW50OiBSZXNvbHZlcjxEaXJlY3RpdmU+O1xuICBkaXJlY3RpdmU6IFJlc29sdmVyPENvbXBvbmVudD47XG4gIHBpcGU6IFJlc29sdmVyPFBpcGU+O1xufTtcblxuaW50ZXJmYWNlIENsZWFudXBPcGVyYXRpb24ge1xuICBmaWVsZE5hbWU6IHN0cmluZztcbiAgb2JqZWN0OiBhbnk7XG4gIG9yaWdpbmFsVmFsdWU6IHVua25vd247XG59XG5cbmV4cG9ydCBjbGFzcyBUZXN0QmVkQ29tcGlsZXIge1xuICBwcml2YXRlIG9yaWdpbmFsQ29tcG9uZW50UmVzb2x1dGlvblF1ZXVlOiBNYXA8VHlwZTxhbnk+LCBDb21wb25lbnQ+IHwgbnVsbCA9IG51bGw7XG5cbiAgLy8gVGVzdGluZyBtb2R1bGUgY29uZmlndXJhdGlvblxuICBwcml2YXRlIGRlY2xhcmF0aW9uczogVHlwZTxhbnk+W10gPSBbXTtcbiAgcHJpdmF0ZSBpbXBvcnRzOiBUeXBlPGFueT5bXSA9IFtdO1xuICBwcml2YXRlIHByb3ZpZGVyczogUHJvdmlkZXJbXSA9IFtdO1xuICBwcml2YXRlIHNjaGVtYXM6IGFueVtdID0gW107XG5cbiAgLy8gUXVldWVzIG9mIGNvbXBvbmVudHMvZGlyZWN0aXZlcy9waXBlcyB0aGF0IHNob3VsZCBiZSByZWNvbXBpbGVkLlxuICBwcml2YXRlIHBlbmRpbmdDb21wb25lbnRzID0gbmV3IFNldDxUeXBlPGFueT4+KCk7XG4gIHByaXZhdGUgcGVuZGluZ0RpcmVjdGl2ZXMgPSBuZXcgU2V0PFR5cGU8YW55Pj4oKTtcbiAgcHJpdmF0ZSBwZW5kaW5nUGlwZXMgPSBuZXcgU2V0PFR5cGU8YW55Pj4oKTtcblxuICAvLyBTZXQgb2YgY29tcG9uZW50cyB3aXRoIGFzeW5jIG1ldGFkYXRhLCBpLmUuIGNvbXBvbmVudHMgd2l0aCBgQGRlZmVyYCBibG9ja3NcbiAgLy8gaW4gdGhlaXIgdGVtcGxhdGVzLlxuICBwcml2YXRlIGNvbXBvbmVudHNXaXRoQXN5bmNNZXRhZGF0YSA9IG5ldyBTZXQ8VHlwZTx1bmtub3duPj4oKTtcblxuICAvLyBLZWVwIHRyYWNrIG9mIGFsbCBjb21wb25lbnRzIGFuZCBkaXJlY3RpdmVzLCBzbyB3ZSBjYW4gcGF0Y2ggUHJvdmlkZXJzIG9udG8gZGVmcyBsYXRlci5cbiAgcHJpdmF0ZSBzZWVuQ29tcG9uZW50cyA9IG5ldyBTZXQ8VHlwZTxhbnk+PigpO1xuICBwcml2YXRlIHNlZW5EaXJlY3RpdmVzID0gbmV3IFNldDxUeXBlPGFueT4+KCk7XG5cbiAgLy8gS2VlcCB0cmFjayBvZiBvdmVycmlkZGVuIG1vZHVsZXMsIHNvIHRoYXQgd2UgY2FuIGNvbGxlY3QgYWxsIGFmZmVjdGVkIG9uZXMgaW4gdGhlIG1vZHVsZSB0cmVlLlxuICBwcml2YXRlIG92ZXJyaWRkZW5Nb2R1bGVzID0gbmV3IFNldDxOZ01vZHVsZVR5cGU8YW55Pj4oKTtcblxuICAvLyBTdG9yZSByZXNvbHZlZCBzdHlsZXMgZm9yIENvbXBvbmVudHMgdGhhdCBoYXZlIHRlbXBsYXRlIG92ZXJyaWRlcyBwcmVzZW50IGFuZCBgc3R5bGVVcmxzYFxuICAvLyBkZWZpbmVkIGF0IHRoZSBzYW1lIHRpbWUuXG4gIHByaXZhdGUgZXhpc3RpbmdDb21wb25lbnRTdHlsZXMgPSBuZXcgTWFwPFR5cGU8YW55Piwgc3RyaW5nW10+KCk7XG5cbiAgcHJpdmF0ZSByZXNvbHZlcnM6IFJlc29sdmVycyA9IGluaXRSZXNvbHZlcnMoKTtcblxuICAvLyBNYXAgb2YgY29tcG9uZW50IHR5cGUgdG8gYW4gTmdNb2R1bGUgdGhhdCBkZWNsYXJlcyBpdC5cbiAgLy9cbiAgLy8gVGhlcmUgYXJlIGEgY291cGxlIHNwZWNpYWwgY2FzZXM6XG4gIC8vIC0gZm9yIHN0YW5kYWxvbmUgY29tcG9uZW50cywgdGhlIG1vZHVsZSBzY29wZSB2YWx1ZSBpcyBgbnVsbGBcbiAgLy8gLSB3aGVuIGEgY29tcG9uZW50IGlzIGRlY2xhcmVkIGluIGBUZXN0QmVkLmNvbmZpZ3VyZVRlc3RpbmdNb2R1bGUoKWAgY2FsbCBvclxuICAvLyAgIGEgY29tcG9uZW50J3MgdGVtcGxhdGUgaXMgb3ZlcnJpZGRlbiB2aWEgYFRlc3RCZWQub3ZlcnJpZGVUZW1wbGF0ZVVzaW5nVGVzdGluZ01vZHVsZSgpYC5cbiAgLy8gICB3ZSB1c2UgYSBzcGVjaWFsIHZhbHVlIGZyb20gdGhlIGBUZXN0aW5nTW9kdWxlT3ZlcnJpZGVgIGVudW0uXG4gIHByaXZhdGUgY29tcG9uZW50VG9Nb2R1bGVTY29wZSA9IG5ldyBNYXA8VHlwZTxhbnk+LCBUeXBlPGFueT4gfCBUZXN0aW5nTW9kdWxlT3ZlcnJpZGUgfCBudWxsPigpO1xuXG4gIC8vIE1hcCB0aGF0IGtlZXBzIGluaXRpYWwgdmVyc2lvbiBvZiBjb21wb25lbnQvZGlyZWN0aXZlL3BpcGUgZGVmcyBpbiBjYXNlXG4gIC8vIHdlIGNvbXBpbGUgYSBUeXBlIGFnYWluLCB0aHVzIG92ZXJyaWRpbmcgcmVzcGVjdGl2ZSBzdGF0aWMgZmllbGRzLiBUaGlzIGlzXG4gIC8vIHJlcXVpcmVkIHRvIG1ha2Ugc3VyZSB3ZSByZXN0b3JlIGRlZnMgdG8gdGhlaXIgaW5pdGlhbCBzdGF0ZXMgYmV0d2VlbiB0ZXN0IHJ1bnMuXG4gIC8vIE5vdGU6IG9uZSBjbGFzcyBtYXkgaGF2ZSBtdWx0aXBsZSBkZWZzIChmb3IgZXhhbXBsZTogybVtb2QgYW5kIMm1aW5qIGluIGNhc2Ugb2YgYW5cbiAgLy8gTmdNb2R1bGUpLCBzdG9yZSBhbGwgb2YgdGhlbSBpbiBhIG1hcC5cbiAgcHJpdmF0ZSBpbml0aWFsTmdEZWZzID0gbmV3IE1hcDxUeXBlPGFueT4sIE1hcDxzdHJpbmcsIFByb3BlcnR5RGVzY3JpcHRvciB8IHVuZGVmaW5lZD4+KCk7XG5cbiAgLy8gQXJyYXkgdGhhdCBrZWVwcyBjbGVhbnVwIG9wZXJhdGlvbnMgZm9yIGluaXRpYWwgdmVyc2lvbnMgb2YgY29tcG9uZW50L2RpcmVjdGl2ZS9waXBlL21vZHVsZVxuICAvLyBkZWZzIGluIGNhc2UgVGVzdEJlZCBtYWtlcyBjaGFuZ2VzIHRvIHRoZSBvcmlnaW5hbHMuXG4gIHByaXZhdGUgZGVmQ2xlYW51cE9wczogQ2xlYW51cE9wZXJhdGlvbltdID0gW107XG5cbiAgcHJpdmF0ZSBfaW5qZWN0b3I6IEluamVjdG9yIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgY29tcGlsZXJQcm92aWRlcnM6IFByb3ZpZGVyW10gfCBudWxsID0gbnVsbDtcblxuICBwcml2YXRlIHByb3ZpZGVyT3ZlcnJpZGVzOiBQcm92aWRlcltdID0gW107XG4gIHByaXZhdGUgcm9vdFByb3ZpZGVyT3ZlcnJpZGVzOiBQcm92aWRlcltdID0gW107XG4gIC8vIE92ZXJyaWRlcyBmb3IgaW5qZWN0YWJsZXMgd2l0aCBge3Byb3ZpZGVkSW46IFNvbWVNb2R1bGV9YCBuZWVkIHRvIGJlIHRyYWNrZWQgYW5kIGFkZGVkIHRvIHRoYXRcbiAgLy8gbW9kdWxlJ3MgcHJvdmlkZXIgbGlzdC5cbiAgcHJpdmF0ZSBwcm92aWRlck92ZXJyaWRlc0J5TW9kdWxlID0gbmV3IE1hcDxJbmplY3RvclR5cGU8YW55PiwgUHJvdmlkZXJbXT4oKTtcbiAgcHJpdmF0ZSBwcm92aWRlck92ZXJyaWRlc0J5VG9rZW4gPSBuZXcgTWFwPGFueSwgUHJvdmlkZXI+KCk7XG4gIHByaXZhdGUgc2NvcGVzV2l0aE92ZXJyaWRkZW5Qcm92aWRlcnMgPSBuZXcgU2V0PFR5cGU8YW55Pj4oKTtcblxuICBwcml2YXRlIHRlc3RNb2R1bGVUeXBlOiBOZ01vZHVsZVR5cGU8YW55PjtcbiAgcHJpdmF0ZSB0ZXN0TW9kdWxlUmVmOiBOZ01vZHVsZVJlZjxhbnk+IHwgbnVsbCA9IG51bGw7XG5cbiAgcHJpdmF0ZSBkZWZlckJsb2NrQmVoYXZpb3IgPSBERUZFUl9CTE9DS19ERUZBVUxUX0JFSEFWSU9SO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgcGxhdGZvcm06IFBsYXRmb3JtUmVmLFxuICAgIHByaXZhdGUgYWRkaXRpb25hbE1vZHVsZVR5cGVzOiBUeXBlPGFueT4gfCBUeXBlPGFueT5bXSxcbiAgKSB7XG4gICAgY2xhc3MgRHluYW1pY1Rlc3RNb2R1bGUge31cbiAgICB0aGlzLnRlc3RNb2R1bGVUeXBlID0gRHluYW1pY1Rlc3RNb2R1bGUgYXMgYW55O1xuICB9XG5cbiAgc2V0Q29tcGlsZXJQcm92aWRlcnMocHJvdmlkZXJzOiBQcm92aWRlcltdIHwgbnVsbCk6IHZvaWQge1xuICAgIHRoaXMuY29tcGlsZXJQcm92aWRlcnMgPSBwcm92aWRlcnM7XG4gICAgdGhpcy5faW5qZWN0b3IgPSBudWxsO1xuICB9XG5cbiAgY29uZmlndXJlVGVzdGluZ01vZHVsZShtb2R1bGVEZWY6IFRlc3RNb2R1bGVNZXRhZGF0YSk6IHZvaWQge1xuICAgIC8vIEVucXVldWUgYW55IGNvbXBpbGF0aW9uIHRhc2tzIGZvciB0aGUgZGlyZWN0bHkgZGVjbGFyZWQgY29tcG9uZW50LlxuICAgIGlmIChtb2R1bGVEZWYuZGVjbGFyYXRpb25zICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIFZlcmlmeSB0aGF0IHRoZXJlIGFyZSBubyBzdGFuZGFsb25lIGNvbXBvbmVudHNcbiAgICAgIGFzc2VydE5vU3RhbmRhbG9uZUNvbXBvbmVudHMoXG4gICAgICAgIG1vZHVsZURlZi5kZWNsYXJhdGlvbnMsXG4gICAgICAgIHRoaXMucmVzb2x2ZXJzLmNvbXBvbmVudCxcbiAgICAgICAgJ1wiVGVzdEJlZC5jb25maWd1cmVUZXN0aW5nTW9kdWxlXCIgY2FsbCcsXG4gICAgICApO1xuICAgICAgdGhpcy5xdWV1ZVR5cGVBcnJheShtb2R1bGVEZWYuZGVjbGFyYXRpb25zLCBUZXN0aW5nTW9kdWxlT3ZlcnJpZGUuREVDTEFSQVRJT04pO1xuICAgICAgdGhpcy5kZWNsYXJhdGlvbnMucHVzaCguLi5tb2R1bGVEZWYuZGVjbGFyYXRpb25zKTtcbiAgICB9XG5cbiAgICAvLyBFbnF1ZXVlIGFueSBjb21waWxhdGlvbiB0YXNrcyBmb3IgaW1wb3J0ZWQgbW9kdWxlcy5cbiAgICBpZiAobW9kdWxlRGVmLmltcG9ydHMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5xdWV1ZVR5cGVzRnJvbU1vZHVsZXNBcnJheShtb2R1bGVEZWYuaW1wb3J0cyk7XG4gICAgICB0aGlzLmltcG9ydHMucHVzaCguLi5tb2R1bGVEZWYuaW1wb3J0cyk7XG4gICAgfVxuXG4gICAgaWYgKG1vZHVsZURlZi5wcm92aWRlcnMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5wcm92aWRlcnMucHVzaCguLi5tb2R1bGVEZWYucHJvdmlkZXJzKTtcbiAgICB9XG4gICAgdGhpcy5wcm92aWRlcnMucHVzaCh7XG4gICAgICBwcm92aWRlOiBSRVRIUk9XX0FQUExJQ0FUSU9OX0VSUk9SUyxcbiAgICAgIHVzZVZhbHVlOiBtb2R1bGVEZWYuX3JldGhyb3dBcHBsaWNhdGlvblRpY2tFcnJvcnMgPz8gZmFsc2UsXG4gICAgfSk7XG5cbiAgICBpZiAobW9kdWxlRGVmLnNjaGVtYXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5zY2hlbWFzLnB1c2goLi4ubW9kdWxlRGVmLnNjaGVtYXMpO1xuICAgIH1cblxuICAgIHRoaXMuZGVmZXJCbG9ja0JlaGF2aW9yID0gbW9kdWxlRGVmLmRlZmVyQmxvY2tCZWhhdmlvciA/PyBERUZFUl9CTE9DS19ERUZBVUxUX0JFSEFWSU9SO1xuICB9XG5cbiAgb3ZlcnJpZGVNb2R1bGUobmdNb2R1bGU6IFR5cGU8YW55Piwgb3ZlcnJpZGU6IE1ldGFkYXRhT3ZlcnJpZGU8TmdNb2R1bGU+KTogdm9pZCB7XG4gICAgaWYgKFVTRV9SVU5USU1FX0RFUFNfVFJBQ0tFUl9GT1JfSklUKSB7XG4gICAgICBkZXBzVHJhY2tlci5jbGVhclNjb3BlQ2FjaGVGb3IobmdNb2R1bGUpO1xuICAgIH1cbiAgICB0aGlzLm92ZXJyaWRkZW5Nb2R1bGVzLmFkZChuZ01vZHVsZSBhcyBOZ01vZHVsZVR5cGU8YW55Pik7XG5cbiAgICAvLyBDb21waWxlIHRoZSBtb2R1bGUgcmlnaHQgYXdheS5cbiAgICB0aGlzLnJlc29sdmVycy5tb2R1bGUuYWRkT3ZlcnJpZGUobmdNb2R1bGUsIG92ZXJyaWRlKTtcbiAgICBjb25zdCBtZXRhZGF0YSA9IHRoaXMucmVzb2x2ZXJzLm1vZHVsZS5yZXNvbHZlKG5nTW9kdWxlKTtcbiAgICBpZiAobWV0YWRhdGEgPT09IG51bGwpIHtcbiAgICAgIHRocm93IGludmFsaWRUeXBlRXJyb3IobmdNb2R1bGUubmFtZSwgJ05nTW9kdWxlJyk7XG4gICAgfVxuXG4gICAgdGhpcy5yZWNvbXBpbGVOZ01vZHVsZShuZ01vZHVsZSwgbWV0YWRhdGEpO1xuXG4gICAgLy8gQXQgdGhpcyBwb2ludCwgdGhlIG1vZHVsZSBoYXMgYSB2YWxpZCBtb2R1bGUgZGVmICjJtW1vZCksIGJ1dCB0aGUgb3ZlcnJpZGUgbWF5IGhhdmUgaW50cm9kdWNlZFxuICAgIC8vIG5ldyBkZWNsYXJhdGlvbnMgb3IgaW1wb3J0ZWQgbW9kdWxlcy4gSW5nZXN0IGFueSBwb3NzaWJsZSBuZXcgdHlwZXMgYW5kIGFkZCB0aGVtIHRvIHRoZVxuICAgIC8vIGN1cnJlbnQgcXVldWUuXG4gICAgdGhpcy5xdWV1ZVR5cGVzRnJvbU1vZHVsZXNBcnJheShbbmdNb2R1bGVdKTtcbiAgfVxuXG4gIG92ZXJyaWRlQ29tcG9uZW50KGNvbXBvbmVudDogVHlwZTxhbnk+LCBvdmVycmlkZTogTWV0YWRhdGFPdmVycmlkZTxDb21wb25lbnQ+KTogdm9pZCB7XG4gICAgdGhpcy52ZXJpZnlOb1N0YW5kYWxvbmVGbGFnT3ZlcnJpZGVzKGNvbXBvbmVudCwgb3ZlcnJpZGUpO1xuICAgIHRoaXMucmVzb2x2ZXJzLmNvbXBvbmVudC5hZGRPdmVycmlkZShjb21wb25lbnQsIG92ZXJyaWRlKTtcbiAgICB0aGlzLnBlbmRpbmdDb21wb25lbnRzLmFkZChjb21wb25lbnQpO1xuXG4gICAgLy8gSWYgdGhpcyBpcyBhIGNvbXBvbmVudCB3aXRoIGFzeW5jIG1ldGFkYXRhIChpLmUuIGEgY29tcG9uZW50IHdpdGggYSBgQGRlZmVyYCBibG9ja1xuICAgIC8vIGluIGEgdGVtcGxhdGUpIC0gc3RvcmUgaXQgZm9yIGZ1dHVyZSBwcm9jZXNzaW5nLlxuICAgIHRoaXMubWF5YmVSZWdpc3RlckNvbXBvbmVudFdpdGhBc3luY01ldGFkYXRhKGNvbXBvbmVudCk7XG4gIH1cblxuICBvdmVycmlkZURpcmVjdGl2ZShkaXJlY3RpdmU6IFR5cGU8YW55Piwgb3ZlcnJpZGU6IE1ldGFkYXRhT3ZlcnJpZGU8RGlyZWN0aXZlPik6IHZvaWQge1xuICAgIHRoaXMudmVyaWZ5Tm9TdGFuZGFsb25lRmxhZ092ZXJyaWRlcyhkaXJlY3RpdmUsIG92ZXJyaWRlKTtcbiAgICB0aGlzLnJlc29sdmVycy5kaXJlY3RpdmUuYWRkT3ZlcnJpZGUoZGlyZWN0aXZlLCBvdmVycmlkZSk7XG4gICAgdGhpcy5wZW5kaW5nRGlyZWN0aXZlcy5hZGQoZGlyZWN0aXZlKTtcbiAgfVxuXG4gIG92ZXJyaWRlUGlwZShwaXBlOiBUeXBlPGFueT4sIG92ZXJyaWRlOiBNZXRhZGF0YU92ZXJyaWRlPFBpcGU+KTogdm9pZCB7XG4gICAgdGhpcy52ZXJpZnlOb1N0YW5kYWxvbmVGbGFnT3ZlcnJpZGVzKHBpcGUsIG92ZXJyaWRlKTtcbiAgICB0aGlzLnJlc29sdmVycy5waXBlLmFkZE92ZXJyaWRlKHBpcGUsIG92ZXJyaWRlKTtcbiAgICB0aGlzLnBlbmRpbmdQaXBlcy5hZGQocGlwZSk7XG4gIH1cblxuICBwcml2YXRlIHZlcmlmeU5vU3RhbmRhbG9uZUZsYWdPdmVycmlkZXMoXG4gICAgdHlwZTogVHlwZTxhbnk+LFxuICAgIG92ZXJyaWRlOiBNZXRhZGF0YU92ZXJyaWRlPENvbXBvbmVudCB8IERpcmVjdGl2ZSB8IFBpcGU+LFxuICApIHtcbiAgICBpZiAoXG4gICAgICBvdmVycmlkZS5hZGQ/Lmhhc093blByb3BlcnR5KCdzdGFuZGFsb25lJykgfHxcbiAgICAgIG92ZXJyaWRlLnNldD8uaGFzT3duUHJvcGVydHkoJ3N0YW5kYWxvbmUnKSB8fFxuICAgICAgb3ZlcnJpZGUucmVtb3ZlPy5oYXNPd25Qcm9wZXJ0eSgnc3RhbmRhbG9uZScpXG4gICAgKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBBbiBvdmVycmlkZSBmb3IgdGhlICR7dHlwZS5uYW1lfSBjbGFzcyBoYXMgdGhlIFxcYHN0YW5kYWxvbmVcXGAgZmxhZy4gYCArXG4gICAgICAgICAgYENoYW5naW5nIHRoZSBcXGBzdGFuZGFsb25lXFxgIGZsYWcgdmlhIFRlc3RCZWQgb3ZlcnJpZGVzIGlzIG5vdCBzdXBwb3J0ZWQuYCxcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgb3ZlcnJpZGVQcm92aWRlcihcbiAgICB0b2tlbjogYW55LFxuICAgIHByb3ZpZGVyOiB7dXNlRmFjdG9yeT86IEZ1bmN0aW9uOyB1c2VWYWx1ZT86IGFueTsgZGVwcz86IGFueVtdOyBtdWx0aT86IGJvb2xlYW59LFxuICApOiB2b2lkIHtcbiAgICBsZXQgcHJvdmlkZXJEZWY6IFByb3ZpZGVyO1xuICAgIGlmIChwcm92aWRlci51c2VGYWN0b3J5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHByb3ZpZGVyRGVmID0ge1xuICAgICAgICBwcm92aWRlOiB0b2tlbixcbiAgICAgICAgdXNlRmFjdG9yeTogcHJvdmlkZXIudXNlRmFjdG9yeSxcbiAgICAgICAgZGVwczogcHJvdmlkZXIuZGVwcyB8fCBbXSxcbiAgICAgICAgbXVsdGk6IHByb3ZpZGVyLm11bHRpLFxuICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKHByb3ZpZGVyLnVzZVZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHByb3ZpZGVyRGVmID0ge3Byb3ZpZGU6IHRva2VuLCB1c2VWYWx1ZTogcHJvdmlkZXIudXNlVmFsdWUsIG11bHRpOiBwcm92aWRlci5tdWx0aX07XG4gICAgfSBlbHNlIHtcbiAgICAgIHByb3ZpZGVyRGVmID0ge3Byb3ZpZGU6IHRva2VufTtcbiAgICB9XG5cbiAgICBjb25zdCBpbmplY3RhYmxlRGVmOiBJbmplY3RhYmxlRGVjbGFyYXRpb248YW55PiB8IG51bGwgPVxuICAgICAgdHlwZW9mIHRva2VuICE9PSAnc3RyaW5nJyA/IGdldEluamVjdGFibGVEZWYodG9rZW4pIDogbnVsbDtcbiAgICBjb25zdCBwcm92aWRlZEluID0gaW5qZWN0YWJsZURlZiA9PT0gbnVsbCA/IG51bGwgOiByZXNvbHZlRm9yd2FyZFJlZihpbmplY3RhYmxlRGVmLnByb3ZpZGVkSW4pO1xuICAgIGNvbnN0IG92ZXJyaWRlc0J1Y2tldCA9XG4gICAgICBwcm92aWRlZEluID09PSAncm9vdCcgPyB0aGlzLnJvb3RQcm92aWRlck92ZXJyaWRlcyA6IHRoaXMucHJvdmlkZXJPdmVycmlkZXM7XG4gICAgb3ZlcnJpZGVzQnVja2V0LnB1c2gocHJvdmlkZXJEZWYpO1xuXG4gICAgLy8gS2VlcCBvdmVycmlkZXMgZ3JvdXBlZCBieSB0b2tlbiBhcyB3ZWxsIGZvciBmYXN0IGxvb2t1cHMgdXNpbmcgdG9rZW5cbiAgICB0aGlzLnByb3ZpZGVyT3ZlcnJpZGVzQnlUb2tlbi5zZXQodG9rZW4sIHByb3ZpZGVyRGVmKTtcbiAgICBpZiAoaW5qZWN0YWJsZURlZiAhPT0gbnVsbCAmJiBwcm92aWRlZEluICE9PSBudWxsICYmIHR5cGVvZiBwcm92aWRlZEluICE9PSAnc3RyaW5nJykge1xuICAgICAgY29uc3QgZXhpc3RpbmdPdmVycmlkZXMgPSB0aGlzLnByb3ZpZGVyT3ZlcnJpZGVzQnlNb2R1bGUuZ2V0KHByb3ZpZGVkSW4pO1xuICAgICAgaWYgKGV4aXN0aW5nT3ZlcnJpZGVzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgZXhpc3RpbmdPdmVycmlkZXMucHVzaChwcm92aWRlckRlZik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnByb3ZpZGVyT3ZlcnJpZGVzQnlNb2R1bGUuc2V0KHByb3ZpZGVkSW4sIFtwcm92aWRlckRlZl0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIG92ZXJyaWRlVGVtcGxhdGVVc2luZ1Rlc3RpbmdNb2R1bGUodHlwZTogVHlwZTxhbnk+LCB0ZW1wbGF0ZTogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgZGVmID0gKHR5cGUgYXMgYW55KVtOR19DT01QX0RFRl07XG4gICAgY29uc3QgaGFzU3R5bGVVcmxzID0gKCk6IGJvb2xlYW4gPT4ge1xuICAgICAgY29uc3QgbWV0YWRhdGEgPSB0aGlzLnJlc29sdmVycy5jb21wb25lbnQucmVzb2x2ZSh0eXBlKSEgYXMgQ29tcG9uZW50O1xuICAgICAgcmV0dXJuICEhbWV0YWRhdGEuc3R5bGVVcmwgfHwgISFtZXRhZGF0YS5zdHlsZVVybHM/Lmxlbmd0aDtcbiAgICB9O1xuICAgIGNvbnN0IG92ZXJyaWRlU3R5bGVVcmxzID0gISFkZWYgJiYgIcm1aXNDb21wb25lbnREZWZQZW5kaW5nUmVzb2x1dGlvbih0eXBlKSAmJiBoYXNTdHlsZVVybHMoKTtcblxuICAgIC8vIEluIEl2eSwgY29tcGlsaW5nIGEgY29tcG9uZW50IGRvZXMgbm90IHJlcXVpcmUga25vd2luZyB0aGUgbW9kdWxlIHByb3ZpZGluZyB0aGVcbiAgICAvLyBjb21wb25lbnQncyBzY29wZSwgc28gb3ZlcnJpZGVUZW1wbGF0ZVVzaW5nVGVzdGluZ01vZHVsZSBjYW4gYmUgaW1wbGVtZW50ZWQgcHVyZWx5IHZpYVxuICAgIC8vIG92ZXJyaWRlQ29tcG9uZW50LiBJbXBvcnRhbnQ6IG92ZXJyaWRpbmcgdGVtcGxhdGUgcmVxdWlyZXMgZnVsbCBDb21wb25lbnQgcmUtY29tcGlsYXRpb24sXG4gICAgLy8gd2hpY2ggbWF5IGZhaWwgaW4gY2FzZSBzdHlsZVVybHMgYXJlIGFsc28gcHJlc2VudCAodGh1cyBDb21wb25lbnQgaXMgY29uc2lkZXJlZCBhcyByZXF1aXJlZFxuICAgIC8vIHJlc29sdXRpb24pLiBJbiBvcmRlciB0byBhdm9pZCB0aGlzLCB3ZSBwcmVlbXB0aXZlbHkgc2V0IHN0eWxlVXJscyB0byBhbiBlbXB0eSBhcnJheSxcbiAgICAvLyBwcmVzZXJ2ZSBjdXJyZW50IHN0eWxlcyBhdmFpbGFibGUgb24gQ29tcG9uZW50IGRlZiBhbmQgcmVzdG9yZSBzdHlsZXMgYmFjayBvbmNlIGNvbXBpbGF0aW9uXG4gICAgLy8gaXMgY29tcGxldGUuXG4gICAgY29uc3Qgb3ZlcnJpZGUgPSBvdmVycmlkZVN0eWxlVXJsc1xuICAgICAgPyB7dGVtcGxhdGUsIHN0eWxlczogW10sIHN0eWxlVXJsczogW10sIHN0eWxlVXJsOiB1bmRlZmluZWR9XG4gICAgICA6IHt0ZW1wbGF0ZX07XG4gICAgdGhpcy5vdmVycmlkZUNvbXBvbmVudCh0eXBlLCB7c2V0OiBvdmVycmlkZX0pO1xuXG4gICAgaWYgKG92ZXJyaWRlU3R5bGVVcmxzICYmIGRlZi5zdHlsZXMgJiYgZGVmLnN0eWxlcy5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLmV4aXN0aW5nQ29tcG9uZW50U3R5bGVzLnNldCh0eXBlLCBkZWYuc3R5bGVzKTtcbiAgICB9XG5cbiAgICAvLyBTZXQgdGhlIGNvbXBvbmVudCdzIHNjb3BlIHRvIGJlIHRoZSB0ZXN0aW5nIG1vZHVsZS5cbiAgICB0aGlzLmNvbXBvbmVudFRvTW9kdWxlU2NvcGUuc2V0KHR5cGUsIFRlc3RpbmdNb2R1bGVPdmVycmlkZS5PVkVSUklERV9URU1QTEFURSk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHJlc29sdmVQZW5kaW5nQ29tcG9uZW50c1dpdGhBc3luY01ldGFkYXRhKCkge1xuICAgIGlmICh0aGlzLmNvbXBvbmVudHNXaXRoQXN5bmNNZXRhZGF0YS5zaXplID09PSAwKSByZXR1cm47XG5cbiAgICBjb25zdCBwcm9taXNlcyA9IFtdO1xuICAgIGZvciAoY29uc3QgY29tcG9uZW50IG9mIHRoaXMuY29tcG9uZW50c1dpdGhBc3luY01ldGFkYXRhKSB7XG4gICAgICBjb25zdCBhc3luY01ldGFkYXRhRm4gPSBnZXRBc3luY0NsYXNzTWV0YWRhdGFGbihjb21wb25lbnQpO1xuICAgICAgaWYgKGFzeW5jTWV0YWRhdGFGbikge1xuICAgICAgICBwcm9taXNlcy5wdXNoKGFzeW5jTWV0YWRhdGFGbigpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5jb21wb25lbnRzV2l0aEFzeW5jTWV0YWRhdGEuY2xlYXIoKTtcblxuICAgIGNvbnN0IHJlc29sdmVkRGVwcyA9IGF3YWl0IFByb21pc2UuYWxsKHByb21pc2VzKTtcbiAgICBjb25zdCBmbGF0UmVzb2x2ZWREZXBzID0gcmVzb2x2ZWREZXBzLmZsYXQoMik7XG4gICAgdGhpcy5xdWV1ZVR5cGVzRnJvbU1vZHVsZXNBcnJheShmbGF0UmVzb2x2ZWREZXBzKTtcblxuICAgIC8vIExvYWRlZCBzdGFuZGFsb25lIGNvbXBvbmVudHMgbWlnaHQgY29udGFpbiBpbXBvcnRzIG9mIE5nTW9kdWxlc1xuICAgIC8vIHdpdGggcHJvdmlkZXJzLCBtYWtlIHN1cmUgd2Ugb3ZlcnJpZGUgcHJvdmlkZXJzIHRoZXJlIHRvby5cbiAgICBmb3IgKGNvbnN0IGNvbXBvbmVudCBvZiBmbGF0UmVzb2x2ZWREZXBzKSB7XG4gICAgICB0aGlzLmFwcGx5UHJvdmlkZXJPdmVycmlkZXNJblNjb3BlKGNvbXBvbmVudCk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgY29tcGlsZUNvbXBvbmVudHMoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5jbGVhckNvbXBvbmVudFJlc29sdXRpb25RdWV1ZSgpO1xuXG4gICAgLy8gV2FpdCBmb3IgYWxsIGFzeW5jIG1ldGFkYXRhIGZvciBjb21wb25lbnRzIHRoYXQgd2VyZVxuICAgIC8vIG92ZXJyaWRkZW4sIHdlIG5lZWQgcmVzb2x2ZWQgbWV0YWRhdGEgdG8gcGVyZm9ybSBhbiBvdmVycmlkZVxuICAgIC8vIGFuZCByZS1jb21waWxlIGEgY29tcG9uZW50LlxuICAgIGF3YWl0IHRoaXMucmVzb2x2ZVBlbmRpbmdDb21wb25lbnRzV2l0aEFzeW5jTWV0YWRhdGEoKTtcblxuICAgIC8vIFZlcmlmeSB0aGF0IHRoZXJlIHdlcmUgbm8gc3RhbmRhbG9uZSBjb21wb25lbnRzIHByZXNlbnQgaW4gdGhlIGBkZWNsYXJhdGlvbnNgIGZpZWxkXG4gICAgLy8gZHVyaW5nIHRoZSBgVGVzdEJlZC5jb25maWd1cmVUZXN0aW5nTW9kdWxlYCBjYWxsLiBXZSBwZXJmb3JtIHRoaXMgY2hlY2sgaGVyZSBpbiBhZGRpdGlvblxuICAgIC8vIHRvIHRoZSBsb2dpYyBpbiB0aGUgYGNvbmZpZ3VyZVRlc3RpbmdNb2R1bGVgIGZ1bmN0aW9uLCBzaW5jZSBhdCB0aGlzIHBvaW50IHdlIGhhdmVcbiAgICAvLyBhbGwgYXN5bmMgbWV0YWRhdGEgcmVzb2x2ZWQuXG4gICAgYXNzZXJ0Tm9TdGFuZGFsb25lQ29tcG9uZW50cyhcbiAgICAgIHRoaXMuZGVjbGFyYXRpb25zLFxuICAgICAgdGhpcy5yZXNvbHZlcnMuY29tcG9uZW50LFxuICAgICAgJ1wiVGVzdEJlZC5jb25maWd1cmVUZXN0aW5nTW9kdWxlXCIgY2FsbCcsXG4gICAgKTtcblxuICAgIC8vIFJ1biBjb21waWxlcnMgZm9yIGFsbCBxdWV1ZWQgdHlwZXMuXG4gICAgbGV0IG5lZWRzQXN5bmNSZXNvdXJjZXMgPSB0aGlzLmNvbXBpbGVUeXBlc1N5bmMoKTtcblxuICAgIC8vIGNvbXBpbGVDb21wb25lbnRzKCkgc2hvdWxkIG5vdCBiZSBhc3luYyB1bmxlc3MgaXQgbmVlZHMgdG8gYmUuXG4gICAgaWYgKG5lZWRzQXN5bmNSZXNvdXJjZXMpIHtcbiAgICAgIGxldCByZXNvdXJjZUxvYWRlcjogUmVzb3VyY2VMb2FkZXI7XG4gICAgICBsZXQgcmVzb2x2ZXIgPSAodXJsOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4gPT4ge1xuICAgICAgICBpZiAoIXJlc291cmNlTG9hZGVyKSB7XG4gICAgICAgICAgcmVzb3VyY2VMb2FkZXIgPSB0aGlzLmluamVjdG9yLmdldChSZXNvdXJjZUxvYWRlcik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShyZXNvdXJjZUxvYWRlci5nZXQodXJsKSk7XG4gICAgICB9O1xuICAgICAgYXdhaXQgybVyZXNvbHZlQ29tcG9uZW50UmVzb3VyY2VzKHJlc29sdmVyKTtcbiAgICB9XG4gIH1cblxuICBmaW5hbGl6ZSgpOiBOZ01vZHVsZVJlZjxhbnk+IHtcbiAgICAvLyBPbmUgbGFzdCBjb21waWxlXG4gICAgdGhpcy5jb21waWxlVHlwZXNTeW5jKCk7XG5cbiAgICAvLyBDcmVhdGUgdGhlIHRlc3RpbmcgbW9kdWxlIGl0c2VsZi5cbiAgICB0aGlzLmNvbXBpbGVUZXN0TW9kdWxlKCk7XG5cbiAgICB0aGlzLmFwcGx5VHJhbnNpdGl2ZVNjb3BlcygpO1xuXG4gICAgdGhpcy5hcHBseVByb3ZpZGVyT3ZlcnJpZGVzKCk7XG5cbiAgICAvLyBQYXRjaCBwcmV2aW91c2x5IHN0b3JlZCBgc3R5bGVzYCBDb21wb25lbnQgdmFsdWVzICh0YWtlbiBmcm9tIMm1Y21wKSwgaW4gY2FzZSB0aGVzZVxuICAgIC8vIENvbXBvbmVudHMgaGF2ZSBgc3R5bGVVcmxzYCBmaWVsZHMgZGVmaW5lZCBhbmQgdGVtcGxhdGUgb3ZlcnJpZGUgd2FzIHJlcXVlc3RlZC5cbiAgICB0aGlzLnBhdGNoQ29tcG9uZW50c1dpdGhFeGlzdGluZ1N0eWxlcygpO1xuXG4gICAgLy8gQ2xlYXIgdGhlIGNvbXBvbmVudFRvTW9kdWxlU2NvcGUgbWFwLCBzbyB0aGF0IGZ1dHVyZSBjb21waWxhdGlvbnMgZG9uJ3QgcmVzZXQgdGhlIHNjb3BlIG9mXG4gICAgLy8gZXZlcnkgY29tcG9uZW50LlxuICAgIHRoaXMuY29tcG9uZW50VG9Nb2R1bGVTY29wZS5jbGVhcigpO1xuXG4gICAgY29uc3QgcGFyZW50SW5qZWN0b3IgPSB0aGlzLnBsYXRmb3JtLmluamVjdG9yO1xuICAgIHRoaXMudGVzdE1vZHVsZVJlZiA9IG5ldyBOZ01vZHVsZVJlZih0aGlzLnRlc3RNb2R1bGVUeXBlLCBwYXJlbnRJbmplY3RvciwgW10pO1xuXG4gICAgLy8gQXBwbGljYXRpb25Jbml0U3RhdHVzLnJ1bkluaXRpYWxpemVycygpIGlzIG1hcmtlZCBAaW50ZXJuYWwgdG8gY29yZS5cbiAgICAvLyBDYXN0IGl0IHRvIGFueSBiZWZvcmUgYWNjZXNzaW5nIGl0LlxuICAgICh0aGlzLnRlc3RNb2R1bGVSZWYuaW5qZWN0b3IuZ2V0KEFwcGxpY2F0aW9uSW5pdFN0YXR1cykgYXMgYW55KS5ydW5Jbml0aWFsaXplcnMoKTtcblxuICAgIC8vIFNldCBsb2NhbGUgSUQgYWZ0ZXIgcnVubmluZyBhcHAgaW5pdGlhbGl6ZXJzLCBzaW5jZSBsb2NhbGUgaW5mb3JtYXRpb24gbWlnaHQgYmUgdXBkYXRlZCB3aGlsZVxuICAgIC8vIHJ1bm5pbmcgaW5pdGlhbGl6ZXJzLiBUaGlzIGlzIGFsc28gY29uc2lzdGVudCB3aXRoIHRoZSBleGVjdXRpb24gb3JkZXIgd2hpbGUgYm9vdHN0cmFwcGluZyBhblxuICAgIC8vIGFwcCAoc2VlIGBwYWNrYWdlcy9jb3JlL3NyYy9hcHBsaWNhdGlvbl9yZWYudHNgIGZpbGUpLlxuICAgIGNvbnN0IGxvY2FsZUlkID0gdGhpcy50ZXN0TW9kdWxlUmVmLmluamVjdG9yLmdldChMT0NBTEVfSUQsIERFRkFVTFRfTE9DQUxFX0lEKTtcbiAgICBzZXRMb2NhbGVJZChsb2NhbGVJZCk7XG5cbiAgICByZXR1cm4gdGhpcy50ZXN0TW9kdWxlUmVmO1xuICB9XG5cbiAgLyoqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgX2NvbXBpbGVOZ01vZHVsZVN5bmMobW9kdWxlVHlwZTogVHlwZTxhbnk+KTogdm9pZCB7XG4gICAgdGhpcy5xdWV1ZVR5cGVzRnJvbU1vZHVsZXNBcnJheShbbW9kdWxlVHlwZV0pO1xuICAgIHRoaXMuY29tcGlsZVR5cGVzU3luYygpO1xuICAgIHRoaXMuYXBwbHlQcm92aWRlck92ZXJyaWRlcygpO1xuICAgIHRoaXMuYXBwbHlQcm92aWRlck92ZXJyaWRlc0luU2NvcGUobW9kdWxlVHlwZSk7XG4gICAgdGhpcy5hcHBseVRyYW5zaXRpdmVTY29wZXMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIGFzeW5jIF9jb21waWxlTmdNb2R1bGVBc3luYyhtb2R1bGVUeXBlOiBUeXBlPGFueT4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0aGlzLnF1ZXVlVHlwZXNGcm9tTW9kdWxlc0FycmF5KFttb2R1bGVUeXBlXSk7XG4gICAgYXdhaXQgdGhpcy5jb21waWxlQ29tcG9uZW50cygpO1xuICAgIHRoaXMuYXBwbHlQcm92aWRlck92ZXJyaWRlcygpO1xuICAgIHRoaXMuYXBwbHlQcm92aWRlck92ZXJyaWRlc0luU2NvcGUobW9kdWxlVHlwZSk7XG4gICAgdGhpcy5hcHBseVRyYW5zaXRpdmVTY29wZXMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIF9nZXRNb2R1bGVSZXNvbHZlcigpOiBSZXNvbHZlcjxOZ01vZHVsZT4ge1xuICAgIHJldHVybiB0aGlzLnJlc29sdmVycy5tb2R1bGU7XG4gIH1cblxuICAvKipcbiAgICogQGludGVybmFsXG4gICAqL1xuICBfZ2V0Q29tcG9uZW50RmFjdG9yaWVzKG1vZHVsZVR5cGU6IE5nTW9kdWxlVHlwZSk6IENvbXBvbmVudEZhY3Rvcnk8YW55PltdIHtcbiAgICByZXR1cm4gbWF5YmVVbndyYXBGbihtb2R1bGVUeXBlLsm1bW9kLmRlY2xhcmF0aW9ucykucmVkdWNlKChmYWN0b3JpZXMsIGRlY2xhcmF0aW9uKSA9PiB7XG4gICAgICBjb25zdCBjb21wb25lbnREZWYgPSAoZGVjbGFyYXRpb24gYXMgYW55KS7JtWNtcDtcbiAgICAgIGNvbXBvbmVudERlZiAmJiBmYWN0b3JpZXMucHVzaChuZXcgQ29tcG9uZW50RmFjdG9yeShjb21wb25lbnREZWYsIHRoaXMudGVzdE1vZHVsZVJlZiEpKTtcbiAgICAgIHJldHVybiBmYWN0b3JpZXM7XG4gICAgfSwgW10gYXMgQ29tcG9uZW50RmFjdG9yeTxhbnk+W10pO1xuICB9XG5cbiAgcHJpdmF0ZSBjb21waWxlVHlwZXNTeW5jKCk6IGJvb2xlYW4ge1xuICAgIC8vIENvbXBpbGUgYWxsIHF1ZXVlZCBjb21wb25lbnRzLCBkaXJlY3RpdmVzLCBwaXBlcy5cbiAgICBsZXQgbmVlZHNBc3luY1Jlc291cmNlcyA9IGZhbHNlO1xuICAgIHRoaXMucGVuZGluZ0NvbXBvbmVudHMuZm9yRWFjaCgoZGVjbGFyYXRpb24pID0+IHtcbiAgICAgIGlmIChnZXRBc3luY0NsYXNzTWV0YWRhdGFGbihkZWNsYXJhdGlvbikpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBDb21wb25lbnQgJyR7ZGVjbGFyYXRpb24ubmFtZX0nIGhhcyB1bnJlc29sdmVkIG1ldGFkYXRhLiBgICtcbiAgICAgICAgICAgIGBQbGVhc2UgY2FsbCBcXGBhd2FpdCBUZXN0QmVkLmNvbXBpbGVDb21wb25lbnRzKClcXGAgYmVmb3JlIHJ1bm5pbmcgdGhpcyB0ZXN0LmAsXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIG5lZWRzQXN5bmNSZXNvdXJjZXMgPSBuZWVkc0FzeW5jUmVzb3VyY2VzIHx8IMm1aXNDb21wb25lbnREZWZQZW5kaW5nUmVzb2x1dGlvbihkZWNsYXJhdGlvbik7XG5cbiAgICAgIGNvbnN0IG1ldGFkYXRhID0gdGhpcy5yZXNvbHZlcnMuY29tcG9uZW50LnJlc29sdmUoZGVjbGFyYXRpb24pO1xuICAgICAgaWYgKG1ldGFkYXRhID09PSBudWxsKSB7XG4gICAgICAgIHRocm93IGludmFsaWRUeXBlRXJyb3IoZGVjbGFyYXRpb24ubmFtZSwgJ0NvbXBvbmVudCcpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLm1heWJlU3RvcmVOZ0RlZihOR19DT01QX0RFRiwgZGVjbGFyYXRpb24pO1xuICAgICAgaWYgKFVTRV9SVU5USU1FX0RFUFNfVFJBQ0tFUl9GT1JfSklUKSB7XG4gICAgICAgIGRlcHNUcmFja2VyLmNsZWFyU2NvcGVDYWNoZUZvcihkZWNsYXJhdGlvbik7XG4gICAgICB9XG4gICAgICBjb21waWxlQ29tcG9uZW50KGRlY2xhcmF0aW9uLCBtZXRhZGF0YSk7XG4gICAgfSk7XG4gICAgdGhpcy5wZW5kaW5nQ29tcG9uZW50cy5jbGVhcigpO1xuXG4gICAgdGhpcy5wZW5kaW5nRGlyZWN0aXZlcy5mb3JFYWNoKChkZWNsYXJhdGlvbikgPT4ge1xuICAgICAgY29uc3QgbWV0YWRhdGEgPSB0aGlzLnJlc29sdmVycy5kaXJlY3RpdmUucmVzb2x2ZShkZWNsYXJhdGlvbik7XG4gICAgICBpZiAobWV0YWRhdGEgPT09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgaW52YWxpZFR5cGVFcnJvcihkZWNsYXJhdGlvbi5uYW1lLCAnRGlyZWN0aXZlJyk7XG4gICAgICB9XG4gICAgICB0aGlzLm1heWJlU3RvcmVOZ0RlZihOR19ESVJfREVGLCBkZWNsYXJhdGlvbik7XG4gICAgICBjb21waWxlRGlyZWN0aXZlKGRlY2xhcmF0aW9uLCBtZXRhZGF0YSk7XG4gICAgfSk7XG4gICAgdGhpcy5wZW5kaW5nRGlyZWN0aXZlcy5jbGVhcigpO1xuXG4gICAgdGhpcy5wZW5kaW5nUGlwZXMuZm9yRWFjaCgoZGVjbGFyYXRpb24pID0+IHtcbiAgICAgIGNvbnN0IG1ldGFkYXRhID0gdGhpcy5yZXNvbHZlcnMucGlwZS5yZXNvbHZlKGRlY2xhcmF0aW9uKTtcbiAgICAgIGlmIChtZXRhZGF0YSA9PT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBpbnZhbGlkVHlwZUVycm9yKGRlY2xhcmF0aW9uLm5hbWUsICdQaXBlJyk7XG4gICAgICB9XG4gICAgICB0aGlzLm1heWJlU3RvcmVOZ0RlZihOR19QSVBFX0RFRiwgZGVjbGFyYXRpb24pO1xuICAgICAgY29tcGlsZVBpcGUoZGVjbGFyYXRpb24sIG1ldGFkYXRhKTtcbiAgICB9KTtcbiAgICB0aGlzLnBlbmRpbmdQaXBlcy5jbGVhcigpO1xuXG4gICAgcmV0dXJuIG5lZWRzQXN5bmNSZXNvdXJjZXM7XG4gIH1cblxuICBwcml2YXRlIGFwcGx5VHJhbnNpdGl2ZVNjb3BlcygpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5vdmVycmlkZGVuTW9kdWxlcy5zaXplID4gMCkge1xuICAgICAgLy8gTW9kdWxlIG92ZXJyaWRlcyAodmlhIGBUZXN0QmVkLm92ZXJyaWRlTW9kdWxlYCkgbWlnaHQgYWZmZWN0IHNjb3BlcyB0aGF0IHdlcmUgcHJldmlvdXNseVxuICAgICAgLy8gY2FsY3VsYXRlZCBhbmQgc3RvcmVkIGluIGB0cmFuc2l0aXZlQ29tcGlsZVNjb3Blc2AuIElmIG1vZHVsZSBvdmVycmlkZXMgYXJlIHByZXNlbnQsXG4gICAgICAvLyBjb2xsZWN0IGFsbCBhZmZlY3RlZCBtb2R1bGVzIGFuZCByZXNldCBzY29wZXMgdG8gZm9yY2UgdGhlaXIgcmUtY2FsY3VsYXRpb24uXG4gICAgICBjb25zdCB0ZXN0aW5nTW9kdWxlRGVmID0gKHRoaXMudGVzdE1vZHVsZVR5cGUgYXMgYW55KVtOR19NT0RfREVGXTtcbiAgICAgIGNvbnN0IGFmZmVjdGVkTW9kdWxlcyA9IHRoaXMuY29sbGVjdE1vZHVsZXNBZmZlY3RlZEJ5T3ZlcnJpZGVzKHRlc3RpbmdNb2R1bGVEZWYuaW1wb3J0cyk7XG4gICAgICBpZiAoYWZmZWN0ZWRNb2R1bGVzLnNpemUgPiAwKSB7XG4gICAgICAgIGFmZmVjdGVkTW9kdWxlcy5mb3JFYWNoKChtb2R1bGVUeXBlKSA9PiB7XG4gICAgICAgICAgaWYgKCFVU0VfUlVOVElNRV9ERVBTX1RSQUNLRVJfRk9SX0pJVCkge1xuICAgICAgICAgICAgdGhpcy5zdG9yZUZpZWxkT2ZEZWZPblR5cGUobW9kdWxlVHlwZSBhcyBhbnksIE5HX01PRF9ERUYsICd0cmFuc2l0aXZlQ29tcGlsZVNjb3BlcycpO1xuICAgICAgICAgICAgKG1vZHVsZVR5cGUgYXMgYW55KVtOR19NT0RfREVGXS50cmFuc2l0aXZlQ29tcGlsZVNjb3BlcyA9IG51bGw7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRlcHNUcmFja2VyLmNsZWFyU2NvcGVDYWNoZUZvcihtb2R1bGVUeXBlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IG1vZHVsZVRvU2NvcGUgPSBuZXcgTWFwPFR5cGU8YW55PiB8IFRlc3RpbmdNb2R1bGVPdmVycmlkZSwgTmdNb2R1bGVUcmFuc2l0aXZlU2NvcGVzPigpO1xuICAgIGNvbnN0IGdldFNjb3BlT2ZNb2R1bGUgPSAoXG4gICAgICBtb2R1bGVUeXBlOiBUeXBlPGFueT4gfCBUZXN0aW5nTW9kdWxlT3ZlcnJpZGUsXG4gICAgKTogTmdNb2R1bGVUcmFuc2l0aXZlU2NvcGVzID0+IHtcbiAgICAgIGlmICghbW9kdWxlVG9TY29wZS5oYXMobW9kdWxlVHlwZSkpIHtcbiAgICAgICAgY29uc3QgaXNUZXN0aW5nTW9kdWxlID0gaXNUZXN0aW5nTW9kdWxlT3ZlcnJpZGUobW9kdWxlVHlwZSk7XG4gICAgICAgIGNvbnN0IHJlYWxUeXBlID0gaXNUZXN0aW5nTW9kdWxlID8gdGhpcy50ZXN0TW9kdWxlVHlwZSA6IChtb2R1bGVUeXBlIGFzIFR5cGU8YW55Pik7XG4gICAgICAgIG1vZHVsZVRvU2NvcGUuc2V0KG1vZHVsZVR5cGUsIHRyYW5zaXRpdmVTY29wZXNGb3IocmVhbFR5cGUpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBtb2R1bGVUb1Njb3BlLmdldChtb2R1bGVUeXBlKSE7XG4gICAgfTtcblxuICAgIHRoaXMuY29tcG9uZW50VG9Nb2R1bGVTY29wZS5mb3JFYWNoKChtb2R1bGVUeXBlLCBjb21wb25lbnRUeXBlKSA9PiB7XG4gICAgICBpZiAobW9kdWxlVHlwZSAhPT0gbnVsbCkge1xuICAgICAgICBjb25zdCBtb2R1bGVTY29wZSA9IGdldFNjb3BlT2ZNb2R1bGUobW9kdWxlVHlwZSk7XG4gICAgICAgIHRoaXMuc3RvcmVGaWVsZE9mRGVmT25UeXBlKGNvbXBvbmVudFR5cGUsIE5HX0NPTVBfREVGLCAnZGlyZWN0aXZlRGVmcycpO1xuICAgICAgICB0aGlzLnN0b3JlRmllbGRPZkRlZk9uVHlwZShjb21wb25lbnRUeXBlLCBOR19DT01QX0RFRiwgJ3BpcGVEZWZzJyk7XG4gICAgICAgIHBhdGNoQ29tcG9uZW50RGVmV2l0aFNjb3BlKGdldENvbXBvbmVudERlZihjb21wb25lbnRUeXBlKSEsIG1vZHVsZVNjb3BlKTtcbiAgICAgIH1cbiAgICAgIC8vIGB0Vmlld2AgdGhhdCBpcyBzdG9yZWQgb24gY29tcG9uZW50IGRlZiBjb250YWlucyBpbmZvcm1hdGlvbiBhYm91dCBkaXJlY3RpdmVzIGFuZCBwaXBlc1xuICAgICAgLy8gdGhhdCBhcmUgaW4gdGhlIHNjb3BlIG9mIHRoaXMgY29tcG9uZW50LiBQYXRjaGluZyBjb21wb25lbnQgc2NvcGUgd2lsbCBjYXVzZSBgdFZpZXdgIHRvIGJlXG4gICAgICAvLyBjaGFuZ2VkLiBTdG9yZSBvcmlnaW5hbCBgdFZpZXdgIGJlZm9yZSBwYXRjaGluZyBzY29wZSwgc28gdGhlIGB0Vmlld2AgKGluY2x1ZGluZyBzY29wZVxuICAgICAgLy8gaW5mb3JtYXRpb24pIGlzIHJlc3RvcmVkIGJhY2sgdG8gaXRzIHByZXZpb3VzL29yaWdpbmFsIHN0YXRlIGJlZm9yZSBydW5uaW5nIG5leHQgdGVzdC5cbiAgICAgIC8vIFJlc2V0dGluZyBgdFZpZXdgIGlzIGFsc28gbmVlZGVkIGZvciBjYXNlcyB3aGVuIHdlIGFwcGx5IHByb3ZpZGVyIG92ZXJyaWRlcyBhbmQgdGhvc2VcbiAgICAgIC8vIHByb3ZpZGVycyBhcmUgZGVmaW5lZCBvbiBjb21wb25lbnQncyBsZXZlbCwgaW4gd2hpY2ggY2FzZSB0aGV5IG1heSBlbmQgdXAgaW5jbHVkZWQgaW50b1xuICAgICAgLy8gYHRWaWV3LmJsdWVwcmludGAuXG4gICAgICB0aGlzLnN0b3JlRmllbGRPZkRlZk9uVHlwZShjb21wb25lbnRUeXBlLCBOR19DT01QX0RFRiwgJ3RWaWV3Jyk7XG4gICAgfSk7XG5cbiAgICB0aGlzLmNvbXBvbmVudFRvTW9kdWxlU2NvcGUuY2xlYXIoKTtcbiAgfVxuXG4gIHByaXZhdGUgYXBwbHlQcm92aWRlck92ZXJyaWRlcygpOiB2b2lkIHtcbiAgICBjb25zdCBtYXliZUFwcGx5T3ZlcnJpZGVzID0gKGZpZWxkOiBzdHJpbmcpID0+ICh0eXBlOiBUeXBlPGFueT4pID0+IHtcbiAgICAgIGNvbnN0IHJlc29sdmVyID0gZmllbGQgPT09IE5HX0NPTVBfREVGID8gdGhpcy5yZXNvbHZlcnMuY29tcG9uZW50IDogdGhpcy5yZXNvbHZlcnMuZGlyZWN0aXZlO1xuICAgICAgY29uc3QgbWV0YWRhdGEgPSByZXNvbHZlci5yZXNvbHZlKHR5cGUpITtcbiAgICAgIGlmICh0aGlzLmhhc1Byb3ZpZGVyT3ZlcnJpZGVzKG1ldGFkYXRhLnByb3ZpZGVycykpIHtcbiAgICAgICAgdGhpcy5wYXRjaERlZldpdGhQcm92aWRlck92ZXJyaWRlcyh0eXBlLCBmaWVsZCk7XG4gICAgICB9XG4gICAgfTtcbiAgICB0aGlzLnNlZW5Db21wb25lbnRzLmZvckVhY2gobWF5YmVBcHBseU92ZXJyaWRlcyhOR19DT01QX0RFRikpO1xuICAgIHRoaXMuc2VlbkRpcmVjdGl2ZXMuZm9yRWFjaChtYXliZUFwcGx5T3ZlcnJpZGVzKE5HX0RJUl9ERUYpKTtcblxuICAgIHRoaXMuc2VlbkNvbXBvbmVudHMuY2xlYXIoKTtcbiAgICB0aGlzLnNlZW5EaXJlY3RpdmVzLmNsZWFyKCk7XG4gIH1cblxuICAvKipcbiAgICogQXBwbGllcyBwcm92aWRlciBvdmVycmlkZXMgdG8gYSBnaXZlbiB0eXBlIChlaXRoZXIgYW4gTmdNb2R1bGUgb3IgYSBzdGFuZGFsb25lIGNvbXBvbmVudClcbiAgICogYW5kIGFsbCBpbXBvcnRlZCBOZ01vZHVsZXMgYW5kIHN0YW5kYWxvbmUgY29tcG9uZW50cyByZWN1cnNpdmVseS5cbiAgICovXG4gIHByaXZhdGUgYXBwbHlQcm92aWRlck92ZXJyaWRlc0luU2NvcGUodHlwZTogVHlwZTxhbnk+KTogdm9pZCB7XG4gICAgY29uc3QgaGFzU2NvcGUgPSBpc1N0YW5kYWxvbmVDb21wb25lbnQodHlwZSkgfHwgaXNOZ01vZHVsZSh0eXBlKTtcblxuICAgIC8vIFRoZSBmdW5jdGlvbiBjYW4gYmUgcmUtZW50ZXJlZCByZWN1cnNpdmVseSB3aGlsZSBpbnNwZWN0aW5nIGRlcGVuZGVuY2llc1xuICAgIC8vIG9mIGFuIE5nTW9kdWxlIG9yIGEgc3RhbmRhbG9uZSBjb21wb25lbnQuIEV4aXQgZWFybHkgaWYgd2UgY29tZSBhY3Jvc3MgYVxuICAgIC8vIHR5cGUgdGhhdCBjYW4gbm90IGhhdmUgYSBzY29wZSAoZGlyZWN0aXZlIG9yIHBpcGUpIG9yIHRoZSB0eXBlIGlzIGFscmVhZHlcbiAgICAvLyBwcm9jZXNzZWQgZWFybGllci5cbiAgICBpZiAoIWhhc1Njb3BlIHx8IHRoaXMuc2NvcGVzV2l0aE92ZXJyaWRkZW5Qcm92aWRlcnMuaGFzKHR5cGUpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuc2NvcGVzV2l0aE92ZXJyaWRkZW5Qcm92aWRlcnMuYWRkKHR5cGUpO1xuXG4gICAgLy8gTk9URTogdGhlIGxpbmUgYmVsb3cgdHJpZ2dlcnMgSklUIGNvbXBpbGF0aW9uIG9mIHRoZSBtb2R1bGUgaW5qZWN0b3IsXG4gICAgLy8gd2hpY2ggYWxzbyBpbnZva2VzIHZlcmlmaWNhdGlvbiBvZiB0aGUgTmdNb2R1bGUgc2VtYW50aWNzLCB3aGljaCBwcm9kdWNlc1xuICAgIC8vIGRldGFpbGVkIGVycm9yIG1lc3NhZ2VzLiBUaGUgZmFjdCB0aGF0IHRoZSBjb2RlIHJlbGllcyBvbiB0aGlzIGxpbmUgYmVpbmdcbiAgICAvLyBwcmVzZW50IGhlcmUgaXMgc3VzcGljaW91cyBhbmQgc2hvdWxkIGJlIHJlZmFjdG9yZWQgaW4gYSB3YXkgdGhhdCB0aGUgbGluZVxuICAgIC8vIGJlbG93IGNhbiBiZSBtb3ZlZCAoZm9yIGV4LiBhZnRlciBhbiBlYXJseSBleGl0IGNoZWNrIGJlbG93KS5cbiAgICBjb25zdCBpbmplY3RvckRlZjogYW55ID0gKHR5cGUgYXMgYW55KVtOR19JTkpfREVGXTtcblxuICAgIC8vIE5vIHByb3ZpZGVyIG92ZXJyaWRlcywgZXhpdCBlYXJseS5cbiAgICBpZiAodGhpcy5wcm92aWRlck92ZXJyaWRlc0J5VG9rZW4uc2l6ZSA9PT0gMCkgcmV0dXJuO1xuXG4gICAgaWYgKGlzU3RhbmRhbG9uZUNvbXBvbmVudCh0eXBlKSkge1xuICAgICAgLy8gVmlzaXQgYWxsIGNvbXBvbmVudCBkZXBlbmRlbmNpZXMgYW5kIG92ZXJyaWRlIHByb3ZpZGVycyB0aGVyZS5cbiAgICAgIGNvbnN0IGRlZiA9IGdldENvbXBvbmVudERlZih0eXBlKTtcbiAgICAgIGNvbnN0IGRlcGVuZGVuY2llcyA9IG1heWJlVW53cmFwRm4oZGVmLmRlcGVuZGVuY2llcyA/PyBbXSk7XG4gICAgICBmb3IgKGNvbnN0IGRlcGVuZGVuY3kgb2YgZGVwZW5kZW5jaWVzKSB7XG4gICAgICAgIHRoaXMuYXBwbHlQcm92aWRlck92ZXJyaWRlc0luU2NvcGUoZGVwZW5kZW5jeSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHByb3ZpZGVyczogQXJyYXk8UHJvdmlkZXIgfCBJbnRlcm5hbEVudmlyb25tZW50UHJvdmlkZXJzPiA9IFtcbiAgICAgICAgLi4uaW5qZWN0b3JEZWYucHJvdmlkZXJzLFxuICAgICAgICAuLi4odGhpcy5wcm92aWRlck92ZXJyaWRlc0J5TW9kdWxlLmdldCh0eXBlIGFzIEluamVjdG9yVHlwZTxhbnk+KSB8fCBbXSksXG4gICAgICBdO1xuICAgICAgaWYgKHRoaXMuaGFzUHJvdmlkZXJPdmVycmlkZXMocHJvdmlkZXJzKSkge1xuICAgICAgICB0aGlzLm1heWJlU3RvcmVOZ0RlZihOR19JTkpfREVGLCB0eXBlKTtcblxuICAgICAgICB0aGlzLnN0b3JlRmllbGRPZkRlZk9uVHlwZSh0eXBlLCBOR19JTkpfREVGLCAncHJvdmlkZXJzJyk7XG4gICAgICAgIGluamVjdG9yRGVmLnByb3ZpZGVycyA9IHRoaXMuZ2V0T3ZlcnJpZGRlblByb3ZpZGVycyhwcm92aWRlcnMpO1xuICAgICAgfVxuXG4gICAgICAvLyBBcHBseSBwcm92aWRlciBvdmVycmlkZXMgdG8gaW1wb3J0ZWQgbW9kdWxlcyByZWN1cnNpdmVseVxuICAgICAgY29uc3QgbW9kdWxlRGVmID0gKHR5cGUgYXMgYW55KVtOR19NT0RfREVGXTtcbiAgICAgIGNvbnN0IGltcG9ydHMgPSBtYXliZVVud3JhcEZuKG1vZHVsZURlZi5pbXBvcnRzKTtcbiAgICAgIGZvciAoY29uc3QgaW1wb3J0ZWRNb2R1bGUgb2YgaW1wb3J0cykge1xuICAgICAgICB0aGlzLmFwcGx5UHJvdmlkZXJPdmVycmlkZXNJblNjb3BlKGltcG9ydGVkTW9kdWxlKTtcbiAgICAgIH1cbiAgICAgIC8vIEFsc28gb3ZlcnJpZGUgdGhlIHByb3ZpZGVycyBvbiBhbnkgTW9kdWxlV2l0aFByb3ZpZGVycyBpbXBvcnRzIHNpbmNlIHRob3NlIGRvbid0IGFwcGVhciBpblxuICAgICAgLy8gdGhlIG1vZHVsZURlZi5cbiAgICAgIGZvciAoY29uc3QgaW1wb3J0ZWRNb2R1bGUgb2YgZmxhdHRlbihpbmplY3RvckRlZi5pbXBvcnRzKSkge1xuICAgICAgICBpZiAoaXNNb2R1bGVXaXRoUHJvdmlkZXJzKGltcG9ydGVkTW9kdWxlKSkge1xuICAgICAgICAgIHRoaXMuZGVmQ2xlYW51cE9wcy5wdXNoKHtcbiAgICAgICAgICAgIG9iamVjdDogaW1wb3J0ZWRNb2R1bGUsXG4gICAgICAgICAgICBmaWVsZE5hbWU6ICdwcm92aWRlcnMnLFxuICAgICAgICAgICAgb3JpZ2luYWxWYWx1ZTogaW1wb3J0ZWRNb2R1bGUucHJvdmlkZXJzLFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGltcG9ydGVkTW9kdWxlLnByb3ZpZGVycyA9IHRoaXMuZ2V0T3ZlcnJpZGRlblByb3ZpZGVycyhcbiAgICAgICAgICAgIGltcG9ydGVkTW9kdWxlLnByb3ZpZGVycyBhcyBBcnJheTxQcm92aWRlciB8IEludGVybmFsRW52aXJvbm1lbnRQcm92aWRlcnM+LFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHBhdGNoQ29tcG9uZW50c1dpdGhFeGlzdGluZ1N0eWxlcygpOiB2b2lkIHtcbiAgICB0aGlzLmV4aXN0aW5nQ29tcG9uZW50U3R5bGVzLmZvckVhY2goXG4gICAgICAoc3R5bGVzLCB0eXBlKSA9PiAoKHR5cGUgYXMgYW55KVtOR19DT01QX0RFRl0uc3R5bGVzID0gc3R5bGVzKSxcbiAgICApO1xuICAgIHRoaXMuZXhpc3RpbmdDb21wb25lbnRTdHlsZXMuY2xlYXIoKTtcbiAgfVxuXG4gIHByaXZhdGUgcXVldWVUeXBlQXJyYXkoYXJyOiBhbnlbXSwgbW9kdWxlVHlwZTogVHlwZTxhbnk+IHwgVGVzdGluZ01vZHVsZU92ZXJyaWRlKTogdm9pZCB7XG4gICAgZm9yIChjb25zdCB2YWx1ZSBvZiBhcnIpIHtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICB0aGlzLnF1ZXVlVHlwZUFycmF5KHZhbHVlLCBtb2R1bGVUeXBlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucXVldWVUeXBlKHZhbHVlLCBtb2R1bGVUeXBlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHJlY29tcGlsZU5nTW9kdWxlKG5nTW9kdWxlOiBUeXBlPGFueT4sIG1ldGFkYXRhOiBOZ01vZHVsZSk6IHZvaWQge1xuICAgIC8vIENhY2hlIHRoZSBpbml0aWFsIG5nTW9kdWxlRGVmIGFzIGl0IHdpbGwgYmUgb3ZlcndyaXR0ZW4uXG4gICAgdGhpcy5tYXliZVN0b3JlTmdEZWYoTkdfTU9EX0RFRiwgbmdNb2R1bGUpO1xuICAgIHRoaXMubWF5YmVTdG9yZU5nRGVmKE5HX0lOSl9ERUYsIG5nTW9kdWxlKTtcblxuICAgIGNvbXBpbGVOZ01vZHVsZURlZnMobmdNb2R1bGUgYXMgTmdNb2R1bGVUeXBlPGFueT4sIG1ldGFkYXRhKTtcbiAgfVxuXG4gIHByaXZhdGUgbWF5YmVSZWdpc3RlckNvbXBvbmVudFdpdGhBc3luY01ldGFkYXRhKHR5cGU6IFR5cGU8dW5rbm93bj4pIHtcbiAgICBjb25zdCBhc3luY01ldGFkYXRhRm4gPSBnZXRBc3luY0NsYXNzTWV0YWRhdGFGbih0eXBlKTtcbiAgICBpZiAoYXN5bmNNZXRhZGF0YUZuKSB7XG4gICAgICB0aGlzLmNvbXBvbmVudHNXaXRoQXN5bmNNZXRhZGF0YS5hZGQodHlwZSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBxdWV1ZVR5cGUodHlwZTogVHlwZTxhbnk+LCBtb2R1bGVUeXBlOiBUeXBlPGFueT4gfCBUZXN0aW5nTW9kdWxlT3ZlcnJpZGUgfCBudWxsKTogdm9pZCB7XG4gICAgLy8gSWYgdGhpcyBpcyBhIGNvbXBvbmVudCB3aXRoIGFzeW5jIG1ldGFkYXRhIChpLmUuIGEgY29tcG9uZW50IHdpdGggYSBgQGRlZmVyYCBibG9ja1xuICAgIC8vIGluIGEgdGVtcGxhdGUpIC0gc3RvcmUgaXQgZm9yIGZ1dHVyZSBwcm9jZXNzaW5nLlxuICAgIHRoaXMubWF5YmVSZWdpc3RlckNvbXBvbmVudFdpdGhBc3luY01ldGFkYXRhKHR5cGUpO1xuXG4gICAgY29uc3QgY29tcG9uZW50ID0gdGhpcy5yZXNvbHZlcnMuY29tcG9uZW50LnJlc29sdmUodHlwZSk7XG4gICAgaWYgKGNvbXBvbmVudCkge1xuICAgICAgLy8gQ2hlY2sgd2hldGhlciBhIGdpdmUgVHlwZSBoYXMgcmVzcGVjdGl2ZSBORyBkZWYgKMm1Y21wKSBhbmQgY29tcGlsZSBpZiBkZWYgaXNcbiAgICAgIC8vIG1pc3NpbmcuIFRoYXQgbWlnaHQgaGFwcGVuIGluIGNhc2UgYSBjbGFzcyB3aXRob3V0IGFueSBBbmd1bGFyIGRlY29yYXRvcnMgZXh0ZW5kcyBhbm90aGVyXG4gICAgICAvLyBjbGFzcyB3aGVyZSBDb21wb25lbnQvRGlyZWN0aXZlL1BpcGUgZGVjb3JhdG9yIGlzIGRlZmluZWQuXG4gICAgICBpZiAoybVpc0NvbXBvbmVudERlZlBlbmRpbmdSZXNvbHV0aW9uKHR5cGUpIHx8ICF0eXBlLmhhc093blByb3BlcnR5KE5HX0NPTVBfREVGKSkge1xuICAgICAgICB0aGlzLnBlbmRpbmdDb21wb25lbnRzLmFkZCh0eXBlKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuc2VlbkNvbXBvbmVudHMuYWRkKHR5cGUpO1xuXG4gICAgICAvLyBLZWVwIHRyYWNrIG9mIHRoZSBtb2R1bGUgd2hpY2ggZGVjbGFyZXMgdGhpcyBjb21wb25lbnQsIHNvIGxhdGVyIHRoZSBjb21wb25lbnQncyBzY29wZVxuICAgICAgLy8gY2FuIGJlIHNldCBjb3JyZWN0bHkuIElmIHRoZSBjb21wb25lbnQgaGFzIGFscmVhZHkgYmVlbiByZWNvcmRlZCBoZXJlLCB0aGVuIG9uZSBvZiBzZXZlcmFsXG4gICAgICAvLyBjYXNlcyBpcyB0cnVlOlxuICAgICAgLy8gKiB0aGUgbW9kdWxlIGNvbnRhaW5pbmcgdGhlIGNvbXBvbmVudCB3YXMgaW1wb3J0ZWQgbXVsdGlwbGUgdGltZXMgKGNvbW1vbikuXG4gICAgICAvLyAqIHRoZSBjb21wb25lbnQgaXMgZGVjbGFyZWQgaW4gbXVsdGlwbGUgbW9kdWxlcyAod2hpY2ggaXMgYW4gZXJyb3IpLlxuICAgICAgLy8gKiB0aGUgY29tcG9uZW50IHdhcyBpbiAnZGVjbGFyYXRpb25zJyBvZiB0aGUgdGVzdGluZyBtb2R1bGUsIGFuZCBhbHNvIGluIGFuIGltcG9ydGVkIG1vZHVsZVxuICAgICAgLy8gICBpbiB3aGljaCBjYXNlIHRoZSBtb2R1bGUgc2NvcGUgd2lsbCBiZSBUZXN0aW5nTW9kdWxlT3ZlcnJpZGUuREVDTEFSQVRJT04uXG4gICAgICAvLyAqIG92ZXJyaWRlVGVtcGxhdGVVc2luZ1Rlc3RpbmdNb2R1bGUgd2FzIGNhbGxlZCBmb3IgdGhlIGNvbXBvbmVudCBpbiB3aGljaCBjYXNlIHRoZSBtb2R1bGVcbiAgICAgIC8vICAgc2NvcGUgd2lsbCBiZSBUZXN0aW5nTW9kdWxlT3ZlcnJpZGUuT1ZFUlJJREVfVEVNUExBVEUuXG4gICAgICAvL1xuICAgICAgLy8gSWYgdGhlIGNvbXBvbmVudCB3YXMgcHJldmlvdXNseSBpbiB0aGUgdGVzdGluZyBtb2R1bGUncyAnZGVjbGFyYXRpb25zJyAobWVhbmluZyB0aGVcbiAgICAgIC8vIGN1cnJlbnQgdmFsdWUgaXMgVGVzdGluZ01vZHVsZU92ZXJyaWRlLkRFQ0xBUkFUSU9OKSwgdGhlbiBgbW9kdWxlVHlwZWAgaXMgdGhlIGNvbXBvbmVudCdzXG4gICAgICAvLyByZWFsIG1vZHVsZSwgd2hpY2ggd2FzIGltcG9ydGVkLiBUaGlzIHBhdHRlcm4gaXMgdW5kZXJzdG9vZCB0byBtZWFuIHRoYXQgdGhlIGNvbXBvbmVudFxuICAgICAgLy8gc2hvdWxkIHVzZSBpdHMgb3JpZ2luYWwgc2NvcGUsIGJ1dCB0aGF0IHRoZSB0ZXN0aW5nIG1vZHVsZSBzaG91bGQgYWxzbyBjb250YWluIHRoZVxuICAgICAgLy8gY29tcG9uZW50IGluIGl0cyBzY29wZS5cbiAgICAgIGlmIChcbiAgICAgICAgIXRoaXMuY29tcG9uZW50VG9Nb2R1bGVTY29wZS5oYXModHlwZSkgfHxcbiAgICAgICAgdGhpcy5jb21wb25lbnRUb01vZHVsZVNjb3BlLmdldCh0eXBlKSA9PT0gVGVzdGluZ01vZHVsZU92ZXJyaWRlLkRFQ0xBUkFUSU9OXG4gICAgICApIHtcbiAgICAgICAgdGhpcy5jb21wb25lbnRUb01vZHVsZVNjb3BlLnNldCh0eXBlLCBtb2R1bGVUeXBlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBkaXJlY3RpdmUgPSB0aGlzLnJlc29sdmVycy5kaXJlY3RpdmUucmVzb2x2ZSh0eXBlKTtcbiAgICBpZiAoZGlyZWN0aXZlKSB7XG4gICAgICBpZiAoIXR5cGUuaGFzT3duUHJvcGVydHkoTkdfRElSX0RFRikpIHtcbiAgICAgICAgdGhpcy5wZW5kaW5nRGlyZWN0aXZlcy5hZGQodHlwZSk7XG4gICAgICB9XG4gICAgICB0aGlzLnNlZW5EaXJlY3RpdmVzLmFkZCh0eXBlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBwaXBlID0gdGhpcy5yZXNvbHZlcnMucGlwZS5yZXNvbHZlKHR5cGUpO1xuICAgIGlmIChwaXBlICYmICF0eXBlLmhhc093blByb3BlcnR5KE5HX1BJUEVfREVGKSkge1xuICAgICAgdGhpcy5wZW5kaW5nUGlwZXMuYWRkKHR5cGUpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcXVldWVUeXBlc0Zyb21Nb2R1bGVzQXJyYXkoYXJyOiBhbnlbXSk6IHZvaWQge1xuICAgIC8vIEJlY2F1c2Ugd2UgbWF5IGVuY291bnRlciB0aGUgc2FtZSBOZ01vZHVsZSBvciBhIHN0YW5kYWxvbmUgQ29tcG9uZW50IHdoaWxlIHByb2Nlc3NpbmdcbiAgICAvLyB0aGUgZGVwZW5kZW5jaWVzIG9mIGFuIE5nTW9kdWxlIG9yIGEgc3RhbmRhbG9uZSBDb21wb25lbnQsIHdlIGNhY2hlIHRoZW0gaW4gdGhpcyBzZXQgc28gd2VcbiAgICAvLyBjYW4gc2tpcCBvbmVzIHRoYXQgaGF2ZSBhbHJlYWR5IGJlZW4gc2VlbiBlbmNvdW50ZXJlZC4gSW4gc29tZSB0ZXN0IHNldHVwcywgdGhpcyBjYWNoaW5nXG4gICAgLy8gcmVzdWx0ZWQgaW4gMTBYIHJ1bnRpbWUgaW1wcm92ZW1lbnQuXG4gICAgY29uc3QgcHJvY2Vzc2VkRGVmcyA9IG5ldyBTZXQoKTtcbiAgICBjb25zdCBxdWV1ZVR5cGVzRnJvbU1vZHVsZXNBcnJheVJlY3VyID0gKGFycjogYW55W10pOiB2b2lkID0+IHtcbiAgICAgIGZvciAoY29uc3QgdmFsdWUgb2YgYXJyKSB7XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgIHF1ZXVlVHlwZXNGcm9tTW9kdWxlc0FycmF5UmVjdXIodmFsdWUpO1xuICAgICAgICB9IGVsc2UgaWYgKGhhc05nTW9kdWxlRGVmKHZhbHVlKSkge1xuICAgICAgICAgIGNvbnN0IGRlZiA9IHZhbHVlLsm1bW9kO1xuICAgICAgICAgIGlmIChwcm9jZXNzZWREZWZzLmhhcyhkZWYpKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcHJvY2Vzc2VkRGVmcy5hZGQoZGVmKTtcbiAgICAgICAgICAvLyBMb29rIHRocm91Z2ggZGVjbGFyYXRpb25zLCBpbXBvcnRzLCBhbmQgZXhwb3J0cywgYW5kIHF1ZXVlXG4gICAgICAgICAgLy8gZXZlcnl0aGluZyBmb3VuZCB0aGVyZS5cbiAgICAgICAgICB0aGlzLnF1ZXVlVHlwZUFycmF5KG1heWJlVW53cmFwRm4oZGVmLmRlY2xhcmF0aW9ucyksIHZhbHVlKTtcbiAgICAgICAgICBxdWV1ZVR5cGVzRnJvbU1vZHVsZXNBcnJheVJlY3VyKG1heWJlVW53cmFwRm4oZGVmLmltcG9ydHMpKTtcbiAgICAgICAgICBxdWV1ZVR5cGVzRnJvbU1vZHVsZXNBcnJheVJlY3VyKG1heWJlVW53cmFwRm4oZGVmLmV4cG9ydHMpKTtcbiAgICAgICAgfSBlbHNlIGlmIChpc01vZHVsZVdpdGhQcm92aWRlcnModmFsdWUpKSB7XG4gICAgICAgICAgcXVldWVUeXBlc0Zyb21Nb2R1bGVzQXJyYXlSZWN1cihbdmFsdWUubmdNb2R1bGVdKTtcbiAgICAgICAgfSBlbHNlIGlmIChpc1N0YW5kYWxvbmVDb21wb25lbnQodmFsdWUpKSB7XG4gICAgICAgICAgdGhpcy5xdWV1ZVR5cGUodmFsdWUsIG51bGwpO1xuICAgICAgICAgIGNvbnN0IGRlZiA9IGdldENvbXBvbmVudERlZih2YWx1ZSk7XG5cbiAgICAgICAgICBpZiAocHJvY2Vzc2VkRGVmcy5oYXMoZGVmKSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIHByb2Nlc3NlZERlZnMuYWRkKGRlZik7XG5cbiAgICAgICAgICBjb25zdCBkZXBlbmRlbmNpZXMgPSBtYXliZVVud3JhcEZuKGRlZi5kZXBlbmRlbmNpZXMgPz8gW10pO1xuICAgICAgICAgIGRlcGVuZGVuY2llcy5mb3JFYWNoKChkZXBlbmRlbmN5KSA9PiB7XG4gICAgICAgICAgICAvLyBOb3RlOiBpbiBBT1QsIHRoZSBgZGVwZW5kZW5jaWVzYCBtaWdodCBhbHNvIGNvbnRhaW4gcmVndWxhclxuICAgICAgICAgICAgLy8gKE5nTW9kdWxlLWJhc2VkKSBDb21wb25lbnQsIERpcmVjdGl2ZSBhbmQgUGlwZXMsIHNvIHdlIGhhbmRsZVxuICAgICAgICAgICAgLy8gdGhlbSBzZXBhcmF0ZWx5IGFuZCBwcm9jZWVkIHdpdGggcmVjdXJzaXZlIHByb2Nlc3MgZm9yIHN0YW5kYWxvbmVcbiAgICAgICAgICAgIC8vIENvbXBvbmVudHMgYW5kIE5nTW9kdWxlcyBvbmx5LlxuICAgICAgICAgICAgaWYgKGlzU3RhbmRhbG9uZUNvbXBvbmVudChkZXBlbmRlbmN5KSB8fCBoYXNOZ01vZHVsZURlZihkZXBlbmRlbmN5KSkge1xuICAgICAgICAgICAgICBxdWV1ZVR5cGVzRnJvbU1vZHVsZXNBcnJheVJlY3VyKFtkZXBlbmRlbmN5XSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0aGlzLnF1ZXVlVHlwZShkZXBlbmRlbmN5LCBudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gICAgcXVldWVUeXBlc0Zyb21Nb2R1bGVzQXJyYXlSZWN1cihhcnIpO1xuICB9XG5cbiAgLy8gV2hlbiBtb2R1bGUgb3ZlcnJpZGVzICh2aWEgYFRlc3RCZWQub3ZlcnJpZGVNb2R1bGVgKSBhcmUgcHJlc2VudCwgaXQgbWlnaHQgYWZmZWN0IGFsbCBtb2R1bGVzXG4gIC8vIHRoYXQgaW1wb3J0IChldmVuIHRyYW5zaXRpdmVseSkgYW4gb3ZlcnJpZGRlbiBvbmUuIEZvciBhbGwgYWZmZWN0ZWQgbW9kdWxlcyB3ZSBuZWVkIHRvXG4gIC8vIHJlY2FsY3VsYXRlIHRoZWlyIHNjb3BlcyBmb3IgYSBnaXZlbiB0ZXN0IHJ1biBhbmQgcmVzdG9yZSBvcmlnaW5hbCBzY29wZXMgYXQgdGhlIGVuZC4gVGhlIGdvYWxcbiAgLy8gb2YgdGhpcyBmdW5jdGlvbiBpcyB0byBjb2xsZWN0IGFsbCBhZmZlY3RlZCBtb2R1bGVzIGluIGEgc2V0IGZvciBmdXJ0aGVyIHByb2Nlc3NpbmcuIEV4YW1wbGU6XG4gIC8vIGlmIHdlIGhhdmUgdGhlIGZvbGxvd2luZyBtb2R1bGUgaGllcmFyY2h5OiBBIC0+IEIgLT4gQyAod2hlcmUgYC0+YCBtZWFucyBgaW1wb3J0c2ApIGFuZCBtb2R1bGVcbiAgLy8gYENgIGlzIG92ZXJyaWRkZW4sIHdlIGNvbnNpZGVyIGBBYCBhbmQgYEJgIGFzIGFmZmVjdGVkLCBzaW5jZSB0aGVpciBzY29wZXMgbWlnaHQgYmVjb21lXG4gIC8vIGludmFsaWRhdGVkIHdpdGggdGhlIG92ZXJyaWRlLlxuICBwcml2YXRlIGNvbGxlY3RNb2R1bGVzQWZmZWN0ZWRCeU92ZXJyaWRlcyhhcnI6IGFueVtdKTogU2V0PE5nTW9kdWxlVHlwZTxhbnk+PiB7XG4gICAgY29uc3Qgc2Vlbk1vZHVsZXMgPSBuZXcgU2V0PE5nTW9kdWxlVHlwZTxhbnk+PigpO1xuICAgIGNvbnN0IGFmZmVjdGVkTW9kdWxlcyA9IG5ldyBTZXQ8TmdNb2R1bGVUeXBlPGFueT4+KCk7XG4gICAgY29uc3QgY2FsY0FmZmVjdGVkTW9kdWxlc1JlY3VyID0gKGFycjogYW55W10sIHBhdGg6IE5nTW9kdWxlVHlwZTxhbnk+W10pOiB2b2lkID0+IHtcbiAgICAgIGZvciAoY29uc3QgdmFsdWUgb2YgYXJyKSB7XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgIC8vIElmIHRoZSB2YWx1ZSBpcyBhbiBhcnJheSwganVzdCBmbGF0dGVuIGl0IChieSBpbnZva2luZyB0aGlzIGZ1bmN0aW9uIHJlY3Vyc2l2ZWx5KSxcbiAgICAgICAgICAvLyBrZWVwaW5nIFwicGF0aFwiIHRoZSBzYW1lLlxuICAgICAgICAgIGNhbGNBZmZlY3RlZE1vZHVsZXNSZWN1cih2YWx1ZSwgcGF0aCk7XG4gICAgICAgIH0gZWxzZSBpZiAoaGFzTmdNb2R1bGVEZWYodmFsdWUpKSB7XG4gICAgICAgICAgaWYgKHNlZW5Nb2R1bGVzLmhhcyh2YWx1ZSkpIHtcbiAgICAgICAgICAgIC8vIElmIHdlJ3ZlIHNlZW4gdGhpcyBtb2R1bGUgYmVmb3JlIGFuZCBpdCdzIGluY2x1ZGVkIGludG8gXCJhZmZlY3RlZCBtb2R1bGVzXCIgbGlzdCwgbWFya1xuICAgICAgICAgICAgLy8gdGhlIHdob2xlIHBhdGggdGhhdCBsZWFkcyB0byB0aGF0IG1vZHVsZSBhcyBhZmZlY3RlZCwgYnV0IGRvIG5vdCBkZXNjZW5kIGludG8gaXRzXG4gICAgICAgICAgICAvLyBpbXBvcnRzLCBzaW5jZSB3ZSBhbHJlYWR5IGV4YW1pbmVkIHRoZW0gYmVmb3JlLlxuICAgICAgICAgICAgaWYgKGFmZmVjdGVkTW9kdWxlcy5oYXModmFsdWUpKSB7XG4gICAgICAgICAgICAgIHBhdGguZm9yRWFjaCgoaXRlbSkgPT4gYWZmZWN0ZWRNb2R1bGVzLmFkZChpdGVtKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgc2Vlbk1vZHVsZXMuYWRkKHZhbHVlKTtcbiAgICAgICAgICBpZiAodGhpcy5vdmVycmlkZGVuTW9kdWxlcy5oYXModmFsdWUpKSB7XG4gICAgICAgICAgICBwYXRoLmZvckVhY2goKGl0ZW0pID0+IGFmZmVjdGVkTW9kdWxlcy5hZGQoaXRlbSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBFeGFtaW5lIG1vZHVsZSBpbXBvcnRzIHJlY3Vyc2l2ZWx5IHRvIGxvb2sgZm9yIG92ZXJyaWRkZW4gbW9kdWxlcy5cbiAgICAgICAgICBjb25zdCBtb2R1bGVEZWYgPSAodmFsdWUgYXMgYW55KVtOR19NT0RfREVGXTtcbiAgICAgICAgICBjYWxjQWZmZWN0ZWRNb2R1bGVzUmVjdXIobWF5YmVVbndyYXBGbihtb2R1bGVEZWYuaW1wb3J0cyksIHBhdGguY29uY2F0KHZhbHVlKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICAgIGNhbGNBZmZlY3RlZE1vZHVsZXNSZWN1cihhcnIsIFtdKTtcbiAgICByZXR1cm4gYWZmZWN0ZWRNb2R1bGVzO1xuICB9XG5cbiAgLyoqXG4gICAqIFByZXNlcnZlIGFuIG9yaWdpbmFsIGRlZiAoc3VjaCBhcyDJtW1vZCwgybVpbmosIGV0YykgYmVmb3JlIGFwcGx5aW5nIGFuIG92ZXJyaWRlLlxuICAgKiBOb3RlOiBvbmUgY2xhc3MgbWF5IGhhdmUgbXVsdGlwbGUgZGVmcyAoZm9yIGV4YW1wbGU6IMm1bW9kIGFuZCDJtWluaiBpbiBjYXNlIG9mXG4gICAqIGFuIE5nTW9kdWxlKS4gSWYgdGhlcmUgaXMgYSBkZWYgaW4gYSBzZXQgYWxyZWFkeSwgZG9uJ3Qgb3ZlcnJpZGUgaXQsIHNpbmNlXG4gICAqIGFuIG9yaWdpbmFsIG9uZSBzaG91bGQgYmUgcmVzdG9yZWQgYXQgdGhlIGVuZCBvZiBhIHRlc3QuXG4gICAqL1xuICBwcml2YXRlIG1heWJlU3RvcmVOZ0RlZihwcm9wOiBzdHJpbmcsIHR5cGU6IFR5cGU8YW55Pikge1xuICAgIGlmICghdGhpcy5pbml0aWFsTmdEZWZzLmhhcyh0eXBlKSkge1xuICAgICAgdGhpcy5pbml0aWFsTmdEZWZzLnNldCh0eXBlLCBuZXcgTWFwKCkpO1xuICAgIH1cbiAgICBjb25zdCBjdXJyZW50RGVmcyA9IHRoaXMuaW5pdGlhbE5nRGVmcy5nZXQodHlwZSkhO1xuICAgIGlmICghY3VycmVudERlZnMuaGFzKHByb3ApKSB7XG4gICAgICBjb25zdCBjdXJyZW50RGVmID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0eXBlLCBwcm9wKTtcbiAgICAgIGN1cnJlbnREZWZzLnNldChwcm9wLCBjdXJyZW50RGVmKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHN0b3JlRmllbGRPZkRlZk9uVHlwZSh0eXBlOiBUeXBlPGFueT4sIGRlZkZpZWxkOiBzdHJpbmcsIGZpZWxkTmFtZTogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgZGVmOiBhbnkgPSAodHlwZSBhcyBhbnkpW2RlZkZpZWxkXTtcbiAgICBjb25zdCBvcmlnaW5hbFZhbHVlOiBhbnkgPSBkZWZbZmllbGROYW1lXTtcbiAgICB0aGlzLmRlZkNsZWFudXBPcHMucHVzaCh7b2JqZWN0OiBkZWYsIGZpZWxkTmFtZSwgb3JpZ2luYWxWYWx1ZX0pO1xuICB9XG5cbiAgLyoqXG4gICAqIENsZWFycyBjdXJyZW50IGNvbXBvbmVudHMgcmVzb2x1dGlvbiBxdWV1ZSwgYnV0IHN0b3JlcyB0aGUgc3RhdGUgb2YgdGhlIHF1ZXVlLCBzbyB3ZSBjYW5cbiAgICogcmVzdG9yZSBpdCBsYXRlci4gQ2xlYXJpbmcgdGhlIHF1ZXVlIGlzIHJlcXVpcmVkIGJlZm9yZSB3ZSB0cnkgdG8gY29tcGlsZSBjb21wb25lbnRzICh2aWFcbiAgICogYFRlc3RCZWQuY29tcGlsZUNvbXBvbmVudHNgKSwgc28gdGhhdCBjb21wb25lbnQgZGVmcyBhcmUgaW4gc3luYyB3aXRoIHRoZSByZXNvbHV0aW9uIHF1ZXVlLlxuICAgKi9cbiAgcHJpdmF0ZSBjbGVhckNvbXBvbmVudFJlc29sdXRpb25RdWV1ZSgpIHtcbiAgICBpZiAodGhpcy5vcmlnaW5hbENvbXBvbmVudFJlc29sdXRpb25RdWV1ZSA9PT0gbnVsbCkge1xuICAgICAgdGhpcy5vcmlnaW5hbENvbXBvbmVudFJlc29sdXRpb25RdWV1ZSA9IG5ldyBNYXAoKTtcbiAgICB9XG4gICAgybVjbGVhclJlc29sdXRpb25PZkNvbXBvbmVudFJlc291cmNlc1F1ZXVlKCkuZm9yRWFjaCgodmFsdWUsIGtleSkgPT5cbiAgICAgIHRoaXMub3JpZ2luYWxDb21wb25lbnRSZXNvbHV0aW9uUXVldWUhLnNldChrZXksIHZhbHVlKSxcbiAgICApO1xuICB9XG5cbiAgLypcbiAgICogUmVzdG9yZXMgY29tcG9uZW50IHJlc29sdXRpb24gcXVldWUgdG8gdGhlIHByZXZpb3VzbHkgc2F2ZWQgc3RhdGUuIFRoaXMgb3BlcmF0aW9uIGlzIHBlcmZvcm1lZFxuICAgKiBhcyBhIHBhcnQgb2YgcmVzdG9yaW5nIHRoZSBzdGF0ZSBhZnRlciBjb21wbGV0aW9uIG9mIHRoZSBjdXJyZW50IHNldCBvZiB0ZXN0cyAodGhhdCBtaWdodFxuICAgKiBwb3RlbnRpYWxseSBtdXRhdGUgdGhlIHN0YXRlKS5cbiAgICovXG4gIHByaXZhdGUgcmVzdG9yZUNvbXBvbmVudFJlc29sdXRpb25RdWV1ZSgpIHtcbiAgICBpZiAodGhpcy5vcmlnaW5hbENvbXBvbmVudFJlc29sdXRpb25RdWV1ZSAhPT0gbnVsbCkge1xuICAgICAgybVyZXN0b3JlQ29tcG9uZW50UmVzb2x1dGlvblF1ZXVlKHRoaXMub3JpZ2luYWxDb21wb25lbnRSZXNvbHV0aW9uUXVldWUpO1xuICAgICAgdGhpcy5vcmlnaW5hbENvbXBvbmVudFJlc29sdXRpb25RdWV1ZSA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgcmVzdG9yZU9yaWdpbmFsU3RhdGUoKTogdm9pZCB7XG4gICAgLy8gUHJvY2VzcyBjbGVhbnVwIG9wcyBpbiByZXZlcnNlIG9yZGVyIHNvIHRoZSBmaWVsZCdzIG9yaWdpbmFsIHZhbHVlIGlzIHJlc3RvcmVkIGNvcnJlY3RseSAoaW5cbiAgICAvLyBjYXNlIHRoZXJlIHdlcmUgbXVsdGlwbGUgb3ZlcnJpZGVzIGZvciB0aGUgc2FtZSBmaWVsZCkuXG4gICAgZm9yRWFjaFJpZ2h0KHRoaXMuZGVmQ2xlYW51cE9wcywgKG9wOiBDbGVhbnVwT3BlcmF0aW9uKSA9PiB7XG4gICAgICBvcC5vYmplY3Rbb3AuZmllbGROYW1lXSA9IG9wLm9yaWdpbmFsVmFsdWU7XG4gICAgfSk7XG4gICAgLy8gUmVzdG9yZSBpbml0aWFsIGNvbXBvbmVudC9kaXJlY3RpdmUvcGlwZSBkZWZzXG4gICAgdGhpcy5pbml0aWFsTmdEZWZzLmZvckVhY2goXG4gICAgICAoZGVmczogTWFwPHN0cmluZywgUHJvcGVydHlEZXNjcmlwdG9yIHwgdW5kZWZpbmVkPiwgdHlwZTogVHlwZTxhbnk+KSA9PiB7XG4gICAgICAgIGlmIChVU0VfUlVOVElNRV9ERVBTX1RSQUNLRVJfRk9SX0pJVCkge1xuICAgICAgICAgIGRlcHNUcmFja2VyLmNsZWFyU2NvcGVDYWNoZUZvcih0eXBlKTtcbiAgICAgICAgfVxuICAgICAgICBkZWZzLmZvckVhY2goKGRlc2NyaXB0b3IsIHByb3ApID0+IHtcbiAgICAgICAgICBpZiAoIWRlc2NyaXB0b3IpIHtcbiAgICAgICAgICAgIC8vIERlbGV0ZSBvcGVyYXRpb25zIGFyZSBnZW5lcmFsbHkgdW5kZXNpcmFibGUgc2luY2UgdGhleSBoYXZlIHBlcmZvcm1hbmNlXG4gICAgICAgICAgICAvLyBpbXBsaWNhdGlvbnMgb24gb2JqZWN0cyB0aGV5IHdlcmUgYXBwbGllZCB0by4gSW4gdGhpcyBwYXJ0aWN1bGFyIGNhc2UsIHNpdHVhdGlvbnNcbiAgICAgICAgICAgIC8vIHdoZXJlIHRoaXMgY29kZSBpcyBpbnZva2VkIHNob3VsZCBiZSBxdWl0ZSByYXJlIHRvIGNhdXNlIGFueSBub3RpY2VhYmxlIGltcGFjdCxcbiAgICAgICAgICAgIC8vIHNpbmNlIGl0J3MgYXBwbGllZCBvbmx5IHRvIHNvbWUgdGVzdCBjYXNlcyAoZm9yIGV4YW1wbGUgd2hlbiBjbGFzcyB3aXRoIG5vXG4gICAgICAgICAgICAvLyBhbm5vdGF0aW9ucyBleHRlbmRzIHNvbWUgQENvbXBvbmVudCkgd2hlbiB3ZSBuZWVkIHRvIGNsZWFyICfJtWNtcCcgZmllbGQgb24gYSBnaXZlblxuICAgICAgICAgICAgLy8gY2xhc3MgdG8gcmVzdG9yZSBpdHMgb3JpZ2luYWwgc3RhdGUgKGJlZm9yZSBhcHBseWluZyBvdmVycmlkZXMgYW5kIHJ1bm5pbmcgdGVzdHMpLlxuICAgICAgICAgICAgZGVsZXRlICh0eXBlIGFzIGFueSlbcHJvcF07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0eXBlLCBwcm9wLCBkZXNjcmlwdG9yKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICApO1xuICAgIHRoaXMuaW5pdGlhbE5nRGVmcy5jbGVhcigpO1xuICAgIHRoaXMuc2NvcGVzV2l0aE92ZXJyaWRkZW5Qcm92aWRlcnMuY2xlYXIoKTtcbiAgICB0aGlzLnJlc3RvcmVDb21wb25lbnRSZXNvbHV0aW9uUXVldWUoKTtcbiAgICAvLyBSZXN0b3JlIHRoZSBsb2NhbGUgSUQgdG8gdGhlIGRlZmF1bHQgdmFsdWUsIHRoaXMgc2hvdWxkbid0IGJlIG5lY2Vzc2FyeSBidXQgd2UgbmV2ZXIga25vd1xuICAgIHNldExvY2FsZUlkKERFRkFVTFRfTE9DQUxFX0lEKTtcbiAgfVxuXG4gIHByaXZhdGUgY29tcGlsZVRlc3RNb2R1bGUoKTogdm9pZCB7XG4gICAgY2xhc3MgUm9vdFNjb3BlTW9kdWxlIHt9XG4gICAgY29tcGlsZU5nTW9kdWxlRGVmcyhSb290U2NvcGVNb2R1bGUgYXMgTmdNb2R1bGVUeXBlPGFueT4sIHtcbiAgICAgIHByb3ZpZGVyczogW1xuICAgICAgICAuLi50aGlzLnJvb3RQcm92aWRlck92ZXJyaWRlcyxcbiAgICAgICAgaW50ZXJuYWxQcm92aWRlWm9uZUNoYW5nZURldGVjdGlvbih7fSksXG4gICAgICAgIFRlc3RCZWRBcHBsaWNhdGlvbkVycm9ySGFuZGxlcixcbiAgICAgICAge1xuICAgICAgICAgIHByb3ZpZGU6IElOVEVSTkFMX0FQUExJQ0FUSU9OX0VSUk9SX0hBTkRMRVIsXG4gICAgICAgICAgdXNlRmFjdG9yeTogKCkgPT4ge1xuICAgICAgICAgICAgaWYgKGluamVjdChaT05FTEVTU19FTkFCTEVEKSB8fCBpbmplY3QoUkVUSFJPV19BUFBMSUNBVElPTl9FUlJPUlMsIHtvcHRpb25hbDogdHJ1ZX0pKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGhhbmRsZXIgPSBpbmplY3QoVGVzdEJlZEFwcGxpY2F0aW9uRXJyb3JIYW5kbGVyKTtcbiAgICAgICAgICAgICAgcmV0dXJuIChlOiB1bmtub3duKSA9PiB7XG4gICAgICAgICAgICAgICAgaGFuZGxlci5oYW5kbGVFcnJvcihlKTtcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNvbnN0IHVzZXJFcnJvckhhbmRsZXIgPSBpbmplY3QoRXJyb3JIYW5kbGVyKTtcbiAgICAgICAgICAgICAgY29uc3Qgbmdab25lID0gaW5qZWN0KE5nWm9uZSk7XG4gICAgICAgICAgICAgIHJldHVybiAoZTogdW5rbm93bikgPT5cbiAgICAgICAgICAgICAgICBuZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4gdXNlckVycm9ySGFuZGxlci5oYW5kbGVFcnJvcihlKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAge3Byb3ZpZGU6IENoYW5nZURldGVjdGlvblNjaGVkdWxlciwgdXNlRXhpc3Rpbmc6IENoYW5nZURldGVjdGlvblNjaGVkdWxlckltcGx9LFxuICAgICAgXSxcbiAgICB9KTtcblxuICAgIGNvbnN0IHByb3ZpZGVycyA9IFtcbiAgICAgIHtwcm92aWRlOiBDb21waWxlciwgdXNlRmFjdG9yeTogKCkgPT4gbmV3IFIzVGVzdENvbXBpbGVyKHRoaXMpfSxcbiAgICAgIHtwcm92aWRlOiBERUZFUl9CTE9DS19DT05GSUcsIHVzZVZhbHVlOiB7YmVoYXZpb3I6IHRoaXMuZGVmZXJCbG9ja0JlaGF2aW9yfX0sXG4gICAgICAuLi50aGlzLnByb3ZpZGVycyxcbiAgICAgIC4uLnRoaXMucHJvdmlkZXJPdmVycmlkZXMsXG4gICAgXTtcbiAgICBjb25zdCBpbXBvcnRzID0gW1Jvb3RTY29wZU1vZHVsZSwgdGhpcy5hZGRpdGlvbmFsTW9kdWxlVHlwZXMsIHRoaXMuaW1wb3J0cyB8fCBbXV07XG5cbiAgICBjb21waWxlTmdNb2R1bGVEZWZzKFxuICAgICAgdGhpcy50ZXN0TW9kdWxlVHlwZSxcbiAgICAgIHtcbiAgICAgICAgZGVjbGFyYXRpb25zOiB0aGlzLmRlY2xhcmF0aW9ucyxcbiAgICAgICAgaW1wb3J0cyxcbiAgICAgICAgc2NoZW1hczogdGhpcy5zY2hlbWFzLFxuICAgICAgICBwcm92aWRlcnMsXG4gICAgICB9LFxuICAgICAgLyogYWxsb3dEdXBsaWNhdGVEZWNsYXJhdGlvbnNJblJvb3QgKi8gdHJ1ZSxcbiAgICApO1xuXG4gICAgdGhpcy5hcHBseVByb3ZpZGVyT3ZlcnJpZGVzSW5TY29wZSh0aGlzLnRlc3RNb2R1bGVUeXBlKTtcbiAgfVxuXG4gIGdldCBpbmplY3RvcigpOiBJbmplY3RvciB7XG4gICAgaWYgKHRoaXMuX2luamVjdG9yICE9PSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy5faW5qZWN0b3I7XG4gICAgfVxuXG4gICAgY29uc3QgcHJvdmlkZXJzOiBTdGF0aWNQcm92aWRlcltdID0gW107XG4gICAgY29uc3QgY29tcGlsZXJPcHRpb25zID0gdGhpcy5wbGF0Zm9ybS5pbmplY3Rvci5nZXQoQ09NUElMRVJfT1BUSU9OUyk7XG4gICAgY29tcGlsZXJPcHRpb25zLmZvckVhY2goKG9wdHMpID0+IHtcbiAgICAgIGlmIChvcHRzLnByb3ZpZGVycykge1xuICAgICAgICBwcm92aWRlcnMucHVzaChvcHRzLnByb3ZpZGVycyk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgaWYgKHRoaXMuY29tcGlsZXJQcm92aWRlcnMgIT09IG51bGwpIHtcbiAgICAgIHByb3ZpZGVycy5wdXNoKC4uLih0aGlzLmNvbXBpbGVyUHJvdmlkZXJzIGFzIFN0YXRpY1Byb3ZpZGVyW10pKTtcbiAgICB9XG5cbiAgICB0aGlzLl9pbmplY3RvciA9IEluamVjdG9yLmNyZWF0ZSh7cHJvdmlkZXJzLCBwYXJlbnQ6IHRoaXMucGxhdGZvcm0uaW5qZWN0b3J9KTtcbiAgICByZXR1cm4gdGhpcy5faW5qZWN0b3I7XG4gIH1cblxuICAvLyBnZXQgb3ZlcnJpZGVzIGZvciBhIHNwZWNpZmljIHByb3ZpZGVyIChpZiBhbnkpXG4gIHByaXZhdGUgZ2V0U2luZ2xlUHJvdmlkZXJPdmVycmlkZXMocHJvdmlkZXI6IFByb3ZpZGVyKTogUHJvdmlkZXIgfCBudWxsIHtcbiAgICBjb25zdCB0b2tlbiA9IGdldFByb3ZpZGVyVG9rZW4ocHJvdmlkZXIpO1xuICAgIHJldHVybiB0aGlzLnByb3ZpZGVyT3ZlcnJpZGVzQnlUb2tlbi5nZXQodG9rZW4pIHx8IG51bGw7XG4gIH1cblxuICBwcml2YXRlIGdldFByb3ZpZGVyT3ZlcnJpZGVzKFxuICAgIHByb3ZpZGVycz86IEFycmF5PFByb3ZpZGVyIHwgSW50ZXJuYWxFbnZpcm9ubWVudFByb3ZpZGVycz4sXG4gICk6IFByb3ZpZGVyW10ge1xuICAgIGlmICghcHJvdmlkZXJzIHx8ICFwcm92aWRlcnMubGVuZ3RoIHx8IHRoaXMucHJvdmlkZXJPdmVycmlkZXNCeVRva2VuLnNpemUgPT09IDApIHJldHVybiBbXTtcbiAgICAvLyBUaGVyZSBhcmUgdHdvIGZsYXR0ZW5pbmcgb3BlcmF0aW9ucyBoZXJlLiBUaGUgaW5uZXIgZmxhdHRlblByb3ZpZGVycygpIG9wZXJhdGVzIG9uIHRoZVxuICAgIC8vIG1ldGFkYXRhJ3MgcHJvdmlkZXJzIGFuZCBhcHBsaWVzIGEgbWFwcGluZyBmdW5jdGlvbiB3aGljaCByZXRyaWV2ZXMgb3ZlcnJpZGVzIGZvciBlYWNoXG4gICAgLy8gaW5jb21pbmcgcHJvdmlkZXIuIFRoZSBvdXRlciBmbGF0dGVuKCkgdGhlbiBmbGF0dGVucyB0aGUgcHJvZHVjZWQgb3ZlcnJpZGVzIGFycmF5LiBJZiB0aGlzIGlzXG4gICAgLy8gbm90IGRvbmUsIHRoZSBhcnJheSBjYW4gY29udGFpbiBvdGhlciBlbXB0eSBhcnJheXMgKGUuZy4gYFtbXSwgW11dYCkgd2hpY2ggbGVhayBpbnRvIHRoZVxuICAgIC8vIHByb3ZpZGVycyBhcnJheSBhbmQgY29udGFtaW5hdGUgYW55IGVycm9yIG1lc3NhZ2VzIHRoYXQgbWlnaHQgYmUgZ2VuZXJhdGVkLlxuICAgIHJldHVybiBmbGF0dGVuKFxuICAgICAgZmxhdHRlblByb3ZpZGVycyhcbiAgICAgICAgcHJvdmlkZXJzLFxuICAgICAgICAocHJvdmlkZXI6IFByb3ZpZGVyKSA9PiB0aGlzLmdldFNpbmdsZVByb3ZpZGVyT3ZlcnJpZGVzKHByb3ZpZGVyKSB8fCBbXSxcbiAgICAgICksXG4gICAgKTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0T3ZlcnJpZGRlblByb3ZpZGVycyhcbiAgICBwcm92aWRlcnM/OiBBcnJheTxQcm92aWRlciB8IEludGVybmFsRW52aXJvbm1lbnRQcm92aWRlcnM+LFxuICApOiBQcm92aWRlcltdIHtcbiAgICBpZiAoIXByb3ZpZGVycyB8fCAhcHJvdmlkZXJzLmxlbmd0aCB8fCB0aGlzLnByb3ZpZGVyT3ZlcnJpZGVzQnlUb2tlbi5zaXplID09PSAwKSByZXR1cm4gW107XG5cbiAgICBjb25zdCBmbGF0dGVuZWRQcm92aWRlcnMgPSBmbGF0dGVuUHJvdmlkZXJzKHByb3ZpZGVycyk7XG4gICAgY29uc3Qgb3ZlcnJpZGVzID0gdGhpcy5nZXRQcm92aWRlck92ZXJyaWRlcyhmbGF0dGVuZWRQcm92aWRlcnMpO1xuICAgIGNvbnN0IG92ZXJyaWRkZW5Qcm92aWRlcnMgPSBbLi4uZmxhdHRlbmVkUHJvdmlkZXJzLCAuLi5vdmVycmlkZXNdO1xuICAgIGNvbnN0IGZpbmFsOiBQcm92aWRlcltdID0gW107XG4gICAgY29uc3Qgc2Vlbk92ZXJyaWRkZW5Qcm92aWRlcnMgPSBuZXcgU2V0PFByb3ZpZGVyPigpO1xuXG4gICAgLy8gV2UgaXRlcmF0ZSB0aHJvdWdoIHRoZSBsaXN0IG9mIHByb3ZpZGVycyBpbiByZXZlcnNlIG9yZGVyIHRvIG1ha2Ugc3VyZSBwcm92aWRlciBvdmVycmlkZXNcbiAgICAvLyB0YWtlIHByZWNlZGVuY2Ugb3ZlciB0aGUgdmFsdWVzIGRlZmluZWQgaW4gcHJvdmlkZXIgbGlzdC4gV2UgYWxzbyBmaWx0ZXIgb3V0IGFsbCBwcm92aWRlcnNcbiAgICAvLyB0aGF0IGhhdmUgb3ZlcnJpZGVzLCBrZWVwaW5nIG92ZXJyaWRkZW4gdmFsdWVzIG9ubHkuIFRoaXMgaXMgbmVlZGVkLCBzaW5jZSBwcmVzZW5jZSBvZiBhXG4gICAgLy8gcHJvdmlkZXIgd2l0aCBgbmdPbkRlc3Ryb3lgIGhvb2sgd2lsbCBjYXVzZSB0aGlzIGhvb2sgdG8gYmUgcmVnaXN0ZXJlZCBhbmQgaW52b2tlZCBsYXRlci5cbiAgICBmb3JFYWNoUmlnaHQob3ZlcnJpZGRlblByb3ZpZGVycywgKHByb3ZpZGVyOiBhbnkpID0+IHtcbiAgICAgIGNvbnN0IHRva2VuOiBhbnkgPSBnZXRQcm92aWRlclRva2VuKHByb3ZpZGVyKTtcbiAgICAgIGlmICh0aGlzLnByb3ZpZGVyT3ZlcnJpZGVzQnlUb2tlbi5oYXModG9rZW4pKSB7XG4gICAgICAgIGlmICghc2Vlbk92ZXJyaWRkZW5Qcm92aWRlcnMuaGFzKHRva2VuKSkge1xuICAgICAgICAgIHNlZW5PdmVycmlkZGVuUHJvdmlkZXJzLmFkZCh0b2tlbik7XG4gICAgICAgICAgLy8gVHJlYXQgYWxsIG92ZXJyaWRkZW4gcHJvdmlkZXJzIGFzIGB7bXVsdGk6IGZhbHNlfWAgKGV2ZW4gaWYgaXQncyBhIG11bHRpLXByb3ZpZGVyKSB0b1xuICAgICAgICAgIC8vIG1ha2Ugc3VyZSB0aGF0IHByb3ZpZGVkIG92ZXJyaWRlIHRha2VzIGhpZ2hlc3QgcHJlY2VkZW5jZSBhbmQgaXMgbm90IGNvbWJpbmVkIHdpdGhcbiAgICAgICAgICAvLyBvdGhlciBpbnN0YW5jZXMgb2YgdGhlIHNhbWUgbXVsdGkgcHJvdmlkZXIuXG4gICAgICAgICAgZmluYWwudW5zaGlmdCh7Li4ucHJvdmlkZXIsIG11bHRpOiBmYWxzZX0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmaW5hbC51bnNoaWZ0KHByb3ZpZGVyKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gZmluYWw7XG4gIH1cblxuICBwcml2YXRlIGhhc1Byb3ZpZGVyT3ZlcnJpZGVzKFxuICAgIHByb3ZpZGVycz86IEFycmF5PFByb3ZpZGVyIHwgSW50ZXJuYWxFbnZpcm9ubWVudFByb3ZpZGVycz4sXG4gICk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmdldFByb3ZpZGVyT3ZlcnJpZGVzKHByb3ZpZGVycykubGVuZ3RoID4gMDtcbiAgfVxuXG4gIHByaXZhdGUgcGF0Y2hEZWZXaXRoUHJvdmlkZXJPdmVycmlkZXMoZGVjbGFyYXRpb246IFR5cGU8YW55PiwgZmllbGQ6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IGRlZiA9IChkZWNsYXJhdGlvbiBhcyBhbnkpW2ZpZWxkXTtcbiAgICBpZiAoZGVmICYmIGRlZi5wcm92aWRlcnNSZXNvbHZlcikge1xuICAgICAgdGhpcy5tYXliZVN0b3JlTmdEZWYoZmllbGQsIGRlY2xhcmF0aW9uKTtcblxuICAgICAgY29uc3QgcmVzb2x2ZXIgPSBkZWYucHJvdmlkZXJzUmVzb2x2ZXI7XG4gICAgICBjb25zdCBwcm9jZXNzUHJvdmlkZXJzRm4gPSAocHJvdmlkZXJzOiBQcm92aWRlcltdKSA9PiB0aGlzLmdldE92ZXJyaWRkZW5Qcm92aWRlcnMocHJvdmlkZXJzKTtcbiAgICAgIHRoaXMuc3RvcmVGaWVsZE9mRGVmT25UeXBlKGRlY2xhcmF0aW9uLCBmaWVsZCwgJ3Byb3ZpZGVyc1Jlc29sdmVyJyk7XG4gICAgICBkZWYucHJvdmlkZXJzUmVzb2x2ZXIgPSAobmdEZWY6IERpcmVjdGl2ZURlZjxhbnk+KSA9PiByZXNvbHZlcihuZ0RlZiwgcHJvY2Vzc1Byb3ZpZGVyc0ZuKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gaW5pdFJlc29sdmVycygpOiBSZXNvbHZlcnMge1xuICByZXR1cm4ge1xuICAgIG1vZHVsZTogbmV3IE5nTW9kdWxlUmVzb2x2ZXIoKSxcbiAgICBjb21wb25lbnQ6IG5ldyBDb21wb25lbnRSZXNvbHZlcigpLFxuICAgIGRpcmVjdGl2ZTogbmV3IERpcmVjdGl2ZVJlc29sdmVyKCksXG4gICAgcGlwZTogbmV3IFBpcGVSZXNvbHZlcigpLFxuICB9O1xufVxuXG5mdW5jdGlvbiBpc1N0YW5kYWxvbmVDb21wb25lbnQ8VD4odmFsdWU6IFR5cGU8VD4pOiB2YWx1ZSBpcyBDb21wb25lbnRUeXBlPFQ+IHtcbiAgY29uc3QgZGVmID0gZ2V0Q29tcG9uZW50RGVmKHZhbHVlKTtcbiAgcmV0dXJuICEhZGVmPy5zdGFuZGFsb25lO1xufVxuXG5mdW5jdGlvbiBnZXRDb21wb25lbnREZWYodmFsdWU6IENvbXBvbmVudFR5cGU8dW5rbm93bj4pOiBDb21wb25lbnREZWY8dW5rbm93bj47XG5mdW5jdGlvbiBnZXRDb21wb25lbnREZWYodmFsdWU6IFR5cGU8dW5rbm93bj4pOiBDb21wb25lbnREZWY8dW5rbm93bj4gfCBudWxsO1xuZnVuY3Rpb24gZ2V0Q29tcG9uZW50RGVmKHZhbHVlOiBUeXBlPHVua25vd24+KTogQ29tcG9uZW50RGVmPHVua25vd24+IHwgbnVsbCB7XG4gIHJldHVybiAodmFsdWUgYXMgYW55KS7JtWNtcCA/PyBudWxsO1xufVxuXG5mdW5jdGlvbiBoYXNOZ01vZHVsZURlZjxUPih2YWx1ZTogVHlwZTxUPik6IHZhbHVlIGlzIE5nTW9kdWxlVHlwZTxUPiB7XG4gIHJldHVybiB2YWx1ZS5oYXNPd25Qcm9wZXJ0eSgnybVtb2QnKTtcbn1cblxuZnVuY3Rpb24gaXNOZ01vZHVsZTxUPih2YWx1ZTogVHlwZTxUPik6IGJvb2xlYW4ge1xuICByZXR1cm4gaGFzTmdNb2R1bGVEZWYodmFsdWUpO1xufVxuXG5mdW5jdGlvbiBtYXliZVVud3JhcEZuPFQ+KG1heWJlRm46ICgoKSA9PiBUKSB8IFQpOiBUIHtcbiAgcmV0dXJuIG1heWJlRm4gaW5zdGFuY2VvZiBGdW5jdGlvbiA/IG1heWJlRm4oKSA6IG1heWJlRm47XG59XG5cbmZ1bmN0aW9uIGZsYXR0ZW48VD4odmFsdWVzOiBhbnlbXSk6IFRbXSB7XG4gIGNvbnN0IG91dDogVFtdID0gW107XG4gIHZhbHVlcy5mb3JFYWNoKCh2YWx1ZSkgPT4ge1xuICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgb3V0LnB1c2goLi4uZmxhdHRlbjxUPih2YWx1ZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXQucHVzaCh2YWx1ZSk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIG91dDtcbn1cblxuZnVuY3Rpb24gaWRlbnRpdHlGbjxUPih2YWx1ZTogVCk6IFQge1xuICByZXR1cm4gdmFsdWU7XG59XG5cbmZ1bmN0aW9uIGZsYXR0ZW5Qcm92aWRlcnM8VD4oXG4gIHByb3ZpZGVyczogQXJyYXk8UHJvdmlkZXIgfCBJbnRlcm5hbEVudmlyb25tZW50UHJvdmlkZXJzPixcbiAgbWFwRm46IChwcm92aWRlcjogUHJvdmlkZXIpID0+IFQsXG4pOiBUW107XG5mdW5jdGlvbiBmbGF0dGVuUHJvdmlkZXJzKHByb3ZpZGVyczogQXJyYXk8UHJvdmlkZXIgfCBJbnRlcm5hbEVudmlyb25tZW50UHJvdmlkZXJzPik6IFByb3ZpZGVyW107XG5mdW5jdGlvbiBmbGF0dGVuUHJvdmlkZXJzKFxuICBwcm92aWRlcnM6IEFycmF5PFByb3ZpZGVyIHwgSW50ZXJuYWxFbnZpcm9ubWVudFByb3ZpZGVycz4sXG4gIG1hcEZuOiAocHJvdmlkZXI6IFByb3ZpZGVyKSA9PiBhbnkgPSBpZGVudGl0eUZuLFxuKTogYW55W10ge1xuICBjb25zdCBvdXQ6IGFueVtdID0gW107XG4gIGZvciAobGV0IHByb3ZpZGVyIG9mIHByb3ZpZGVycykge1xuICAgIGlmIChpc0Vudmlyb25tZW50UHJvdmlkZXJzKHByb3ZpZGVyKSkge1xuICAgICAgcHJvdmlkZXIgPSBwcm92aWRlci7JtXByb3ZpZGVycztcbiAgICB9XG4gICAgaWYgKEFycmF5LmlzQXJyYXkocHJvdmlkZXIpKSB7XG4gICAgICBvdXQucHVzaCguLi5mbGF0dGVuUHJvdmlkZXJzKHByb3ZpZGVyLCBtYXBGbikpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXQucHVzaChtYXBGbihwcm92aWRlcikpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gb3V0O1xufVxuXG5mdW5jdGlvbiBnZXRQcm92aWRlckZpZWxkKHByb3ZpZGVyOiBQcm92aWRlciwgZmllbGQ6IHN0cmluZykge1xuICByZXR1cm4gcHJvdmlkZXIgJiYgdHlwZW9mIHByb3ZpZGVyID09PSAnb2JqZWN0JyAmJiAocHJvdmlkZXIgYXMgYW55KVtmaWVsZF07XG59XG5cbmZ1bmN0aW9uIGdldFByb3ZpZGVyVG9rZW4ocHJvdmlkZXI6IFByb3ZpZGVyKSB7XG4gIHJldHVybiBnZXRQcm92aWRlckZpZWxkKHByb3ZpZGVyLCAncHJvdmlkZScpIHx8IHByb3ZpZGVyO1xufVxuXG5mdW5jdGlvbiBpc01vZHVsZVdpdGhQcm92aWRlcnModmFsdWU6IGFueSk6IHZhbHVlIGlzIE1vZHVsZVdpdGhQcm92aWRlcnM8YW55PiB7XG4gIHJldHVybiB2YWx1ZS5oYXNPd25Qcm9wZXJ0eSgnbmdNb2R1bGUnKTtcbn1cblxuZnVuY3Rpb24gZm9yRWFjaFJpZ2h0PFQ+KHZhbHVlczogVFtdLCBmbjogKHZhbHVlOiBULCBpZHg6IG51bWJlcikgPT4gdm9pZCk6IHZvaWQge1xuICBmb3IgKGxldCBpZHggPSB2YWx1ZXMubGVuZ3RoIC0gMTsgaWR4ID49IDA7IGlkeC0tKSB7XG4gICAgZm4odmFsdWVzW2lkeF0sIGlkeCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gaW52YWxpZFR5cGVFcnJvcihuYW1lOiBzdHJpbmcsIGV4cGVjdGVkVHlwZTogc3RyaW5nKTogRXJyb3Ige1xuICByZXR1cm4gbmV3IEVycm9yKGAke25hbWV9IGNsYXNzIGRvZXNuJ3QgaGF2ZSBAJHtleHBlY3RlZFR5cGV9IGRlY29yYXRvciBvciBpcyBtaXNzaW5nIG1ldGFkYXRhLmApO1xufVxuXG5jbGFzcyBSM1Rlc3RDb21waWxlciBpbXBsZW1lbnRzIENvbXBpbGVyIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSB0ZXN0QmVkOiBUZXN0QmVkQ29tcGlsZXIpIHt9XG5cbiAgY29tcGlsZU1vZHVsZVN5bmM8VD4obW9kdWxlVHlwZTogVHlwZTxUPik6IE5nTW9kdWxlRmFjdG9yeTxUPiB7XG4gICAgdGhpcy50ZXN0QmVkLl9jb21waWxlTmdNb2R1bGVTeW5jKG1vZHVsZVR5cGUpO1xuICAgIHJldHVybiBuZXcgUjNOZ01vZHVsZUZhY3RvcnkobW9kdWxlVHlwZSk7XG4gIH1cblxuICBhc3luYyBjb21waWxlTW9kdWxlQXN5bmM8VD4obW9kdWxlVHlwZTogVHlwZTxUPik6IFByb21pc2U8TmdNb2R1bGVGYWN0b3J5PFQ+PiB7XG4gICAgYXdhaXQgdGhpcy50ZXN0QmVkLl9jb21waWxlTmdNb2R1bGVBc3luYyhtb2R1bGVUeXBlKTtcbiAgICByZXR1cm4gbmV3IFIzTmdNb2R1bGVGYWN0b3J5KG1vZHVsZVR5cGUpO1xuICB9XG5cbiAgY29tcGlsZU1vZHVsZUFuZEFsbENvbXBvbmVudHNTeW5jPFQ+KG1vZHVsZVR5cGU6IFR5cGU8VD4pOiBNb2R1bGVXaXRoQ29tcG9uZW50RmFjdG9yaWVzPFQ+IHtcbiAgICBjb25zdCBuZ01vZHVsZUZhY3RvcnkgPSB0aGlzLmNvbXBpbGVNb2R1bGVTeW5jKG1vZHVsZVR5cGUpO1xuICAgIGNvbnN0IGNvbXBvbmVudEZhY3RvcmllcyA9IHRoaXMudGVzdEJlZC5fZ2V0Q29tcG9uZW50RmFjdG9yaWVzKG1vZHVsZVR5cGUgYXMgTmdNb2R1bGVUeXBlPFQ+KTtcbiAgICByZXR1cm4gbmV3IE1vZHVsZVdpdGhDb21wb25lbnRGYWN0b3JpZXMobmdNb2R1bGVGYWN0b3J5LCBjb21wb25lbnRGYWN0b3JpZXMpO1xuICB9XG5cbiAgYXN5bmMgY29tcGlsZU1vZHVsZUFuZEFsbENvbXBvbmVudHNBc3luYzxUPihcbiAgICBtb2R1bGVUeXBlOiBUeXBlPFQ+LFxuICApOiBQcm9taXNlPE1vZHVsZVdpdGhDb21wb25lbnRGYWN0b3JpZXM8VD4+IHtcbiAgICBjb25zdCBuZ01vZHVsZUZhY3RvcnkgPSBhd2FpdCB0aGlzLmNvbXBpbGVNb2R1bGVBc3luYyhtb2R1bGVUeXBlKTtcbiAgICBjb25zdCBjb21wb25lbnRGYWN0b3JpZXMgPSB0aGlzLnRlc3RCZWQuX2dldENvbXBvbmVudEZhY3Rvcmllcyhtb2R1bGVUeXBlIGFzIE5nTW9kdWxlVHlwZTxUPik7XG4gICAgcmV0dXJuIG5ldyBNb2R1bGVXaXRoQ29tcG9uZW50RmFjdG9yaWVzKG5nTW9kdWxlRmFjdG9yeSwgY29tcG9uZW50RmFjdG9yaWVzKTtcbiAgfVxuXG4gIGNsZWFyQ2FjaGUoKTogdm9pZCB7fVxuXG4gIGNsZWFyQ2FjaGVGb3IodHlwZTogVHlwZTxhbnk+KTogdm9pZCB7fVxuXG4gIGdldE1vZHVsZUlkKG1vZHVsZVR5cGU6IFR5cGU8YW55Pik6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gICAgY29uc3QgbWV0YSA9IHRoaXMudGVzdEJlZC5fZ2V0TW9kdWxlUmVzb2x2ZXIoKS5yZXNvbHZlKG1vZHVsZVR5cGUpO1xuICAgIHJldHVybiAobWV0YSAmJiBtZXRhLmlkKSB8fCB1bmRlZmluZWQ7XG4gIH1cbn1cbiJdfQ==