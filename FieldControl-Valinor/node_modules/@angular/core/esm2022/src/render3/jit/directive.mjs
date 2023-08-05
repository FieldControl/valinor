/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { getCompilerFacade } from '../../compiler/compiler_facade';
import { isForwardRef, resolveForwardRef } from '../../di/forward_ref';
import { getReflect, reflectDependencies } from '../../di/jit/util';
import { componentNeedsResolution, maybeQueueResolutionOfComponentResources } from '../../metadata/resource_loading';
import { ViewEncapsulation } from '../../metadata/view';
import { flatten } from '../../util/array_utils';
import { EMPTY_ARRAY, EMPTY_OBJ } from '../../util/empty';
import { initNgDevMode } from '../../util/ng_dev_mode';
import { getComponentDef, getDirectiveDef, getNgModuleDef, getPipeDef } from '../definition';
import { NG_COMP_DEF, NG_DIR_DEF, NG_FACTORY_DEF } from '../fields';
import { stringifyForError } from '../util/stringify_utils';
import { angularCoreEnv } from './environment';
import { getJitOptions } from './jit_options';
import { flushModuleScopingQueueAsMuchAsPossible, patchComponentDefWithScope, transitiveScopesFor } from './module';
import { isModuleWithProviders } from './util';
/**
 * Keep track of the compilation depth to avoid reentrancy issues during JIT compilation. This
 * matters in the following scenario:
 *
 * Consider a component 'A' that extends component 'B', both declared in module 'M'. During
 * the compilation of 'A' the definition of 'B' is requested to capture the inheritance chain,
 * potentially triggering compilation of 'B'. If this nested compilation were to trigger
 * `flushModuleScopingQueueAsMuchAsPossible` it may happen that module 'M' is still pending in the
 * queue, resulting in 'A' and 'B' to be patched with the NgModule scope. As the compilation of
 * 'A' is still in progress, this would introduce a circular dependency on its compilation. To avoid
 * this issue, the module scope queue is only flushed for compilations at the depth 0, to ensure
 * all compilations have finished.
 */
let compilationDepth = 0;
/**
 * Compile an Angular component according to its decorator metadata, and patch the resulting
 * component def (ɵcmp) onto the component type.
 *
 * Compilation may be asynchronous (due to the need to resolve URLs for the component template or
 * other resources, for example). In the event that compilation is not immediate, `compileComponent`
 * will enqueue resource resolution into a global queue and will fail to return the `ɵcmp`
 * until the global queue has been resolved with a call to `resolveComponentResources`.
 */
export function compileComponent(type, metadata) {
    // Initialize ngDevMode. This must be the first statement in compileComponent.
    // See the `initNgDevMode` docstring for more information.
    (typeof ngDevMode === 'undefined' || ngDevMode) && initNgDevMode();
    let ngComponentDef = null;
    // Metadata may have resources which need to be resolved.
    maybeQueueResolutionOfComponentResources(type, metadata);
    // Note that we're using the same function as `Directive`, because that's only subset of metadata
    // that we need to create the ngFactoryDef. We're avoiding using the component metadata
    // because we'd have to resolve the asynchronous templates.
    addDirectiveFactoryDef(type, metadata);
    Object.defineProperty(type, NG_COMP_DEF, {
        get: () => {
            if (ngComponentDef === null) {
                const compiler = getCompilerFacade({ usage: 0 /* JitCompilerUsage.Decorator */, kind: 'component', type: type });
                if (componentNeedsResolution(metadata)) {
                    const error = [`Component '${type.name}' is not resolved:`];
                    if (metadata.templateUrl) {
                        error.push(` - templateUrl: ${metadata.templateUrl}`);
                    }
                    if (metadata.styleUrls && metadata.styleUrls.length) {
                        error.push(` - styleUrls: ${JSON.stringify(metadata.styleUrls)}`);
                    }
                    error.push(`Did you run and wait for 'resolveComponentResources()'?`);
                    throw new Error(error.join('\n'));
                }
                // This const was called `jitOptions` previously but had to be renamed to `options` because
                // of a bug with Terser that caused optimized JIT builds to throw a `ReferenceError`.
                // This bug was investigated in https://github.com/angular/angular-cli/issues/17264.
                // We should not rename it back until https://github.com/terser/terser/issues/615 is fixed.
                const options = getJitOptions();
                let preserveWhitespaces = metadata.preserveWhitespaces;
                if (preserveWhitespaces === undefined) {
                    if (options !== null && options.preserveWhitespaces !== undefined) {
                        preserveWhitespaces = options.preserveWhitespaces;
                    }
                    else {
                        preserveWhitespaces = false;
                    }
                }
                let encapsulation = metadata.encapsulation;
                if (encapsulation === undefined) {
                    if (options !== null && options.defaultEncapsulation !== undefined) {
                        encapsulation = options.defaultEncapsulation;
                    }
                    else {
                        encapsulation = ViewEncapsulation.Emulated;
                    }
                }
                const templateUrl = metadata.templateUrl || `ng:///${type.name}/template.html`;
                const meta = {
                    ...directiveMetadata(type, metadata),
                    typeSourceSpan: compiler.createParseSourceSpan('Component', type.name, templateUrl),
                    template: metadata.template || '',
                    preserveWhitespaces,
                    styles: metadata.styles || EMPTY_ARRAY,
                    animations: metadata.animations,
                    // JIT components are always compiled against an empty set of `declarations`. Instead, the
                    // `directiveDefs` and `pipeDefs` are updated at a later point:
                    //  * for NgModule-based components, they're set when the NgModule which declares the
                    //    component resolves in the module scoping queue
                    //  * for standalone components, they're set just below, after `compileComponent`.
                    declarations: [],
                    changeDetection: metadata.changeDetection,
                    encapsulation,
                    interpolation: metadata.interpolation,
                    viewProviders: metadata.viewProviders || null,
                };
                compilationDepth++;
                try {
                    if (meta.usesInheritance) {
                        addDirectiveDefToUndecoratedParents(type);
                    }
                    ngComponentDef =
                        compiler.compileComponent(angularCoreEnv, templateUrl, meta);
                    if (metadata.standalone) {
                        // Patch the component definition for standalone components with `directiveDefs` and
                        // `pipeDefs` functions which lazily compute the directives/pipes available in the
                        // standalone component. Also set `dependencies` to the lazily resolved list of imports.
                        const imports = flatten(metadata.imports || EMPTY_ARRAY);
                        const { directiveDefs, pipeDefs } = getStandaloneDefFunctions(type, imports);
                        ngComponentDef.directiveDefs = directiveDefs;
                        ngComponentDef.pipeDefs = pipeDefs;
                        ngComponentDef.dependencies = () => imports.map(resolveForwardRef);
                    }
                }
                finally {
                    // Ensure that the compilation depth is decremented even when the compilation failed.
                    compilationDepth--;
                }
                if (compilationDepth === 0) {
                    // When NgModule decorator executed, we enqueued the module definition such that
                    // it would only dequeue and add itself as module scope to all of its declarations,
                    // but only if  if all of its declarations had resolved. This call runs the check
                    // to see if any modules that are in the queue can be dequeued and add scope to
                    // their declarations.
                    flushModuleScopingQueueAsMuchAsPossible();
                }
                // If component compilation is async, then the @NgModule annotation which declares the
                // component may execute and set an ngSelectorScope property on the component type. This
                // allows the component to patch itself with directiveDefs from the module after it
                // finishes compiling.
                if (hasSelectorScope(type)) {
                    const scopes = transitiveScopesFor(type.ngSelectorScope);
                    patchComponentDefWithScope(ngComponentDef, scopes);
                }
                if (metadata.schemas) {
                    if (metadata.standalone) {
                        ngComponentDef.schemas = metadata.schemas;
                    }
                    else {
                        throw new Error(`The 'schemas' was specified for the ${stringifyForError(type)} but is only valid on a component that is standalone.`);
                    }
                }
                else if (metadata.standalone) {
                    ngComponentDef.schemas = [];
                }
            }
            return ngComponentDef;
        },
        // Make the property configurable in dev mode to allow overriding in tests
        configurable: !!ngDevMode,
    });
}
function getDependencyTypeForError(type) {
    if (getComponentDef(type))
        return 'component';
    if (getDirectiveDef(type))
        return 'directive';
    if (getPipeDef(type))
        return 'pipe';
    return 'type';
}
function verifyStandaloneImport(depType, importingType) {
    if (isForwardRef(depType)) {
        depType = resolveForwardRef(depType);
        if (!depType) {
            throw new Error(`Expected forwardRef function, imported from "${stringifyForError(importingType)}", to return a standalone entity or NgModule but got "${stringifyForError(depType) || depType}".`);
        }
    }
    if (getNgModuleDef(depType) == null) {
        const def = getComponentDef(depType) || getDirectiveDef(depType) || getPipeDef(depType);
        if (def != null) {
            // if a component, directive or pipe is imported make sure that it is standalone
            if (!def.standalone) {
                throw new Error(`The "${stringifyForError(depType)}" ${getDependencyTypeForError(depType)}, imported from "${stringifyForError(importingType)}", is not standalone. Did you forget to add the standalone: true flag?`);
            }
        }
        else {
            // it can be either a module with provider or an unknown (not annotated) type
            if (isModuleWithProviders(depType)) {
                throw new Error(`A module with providers was imported from "${stringifyForError(importingType)}". Modules with providers are not supported in standalone components imports.`);
            }
            else {
                throw new Error(`The "${stringifyForError(depType)}" type, imported from "${stringifyForError(importingType)}", must be a standalone component / directive / pipe or an NgModule. Did you forget to add the required @Component / @Directive / @Pipe or @NgModule annotation?`);
            }
        }
    }
}
/**
 * Build memoized `directiveDefs` and `pipeDefs` functions for the component definition of a
 * standalone component, which process `imports` and filter out directives and pipes. The use of
 * memoized functions here allows for the delayed resolution of any `forwardRef`s present in the
 * component's `imports`.
 */
function getStandaloneDefFunctions(type, imports) {
    let cachedDirectiveDefs = null;
    let cachedPipeDefs = null;
    const directiveDefs = () => {
        if (cachedDirectiveDefs === null) {
            // Standalone components are always able to self-reference, so include the component's own
            // definition in its `directiveDefs`.
            cachedDirectiveDefs = [getComponentDef(type)];
            const seen = new Set([type]);
            for (const rawDep of imports) {
                ngDevMode && verifyStandaloneImport(rawDep, type);
                const dep = resolveForwardRef(rawDep);
                if (seen.has(dep)) {
                    continue;
                }
                seen.add(dep);
                if (!!getNgModuleDef(dep)) {
                    const scope = transitiveScopesFor(dep);
                    for (const dir of scope.exported.directives) {
                        const def = getComponentDef(dir) || getDirectiveDef(dir);
                        if (def && !seen.has(dir)) {
                            seen.add(dir);
                            cachedDirectiveDefs.push(def);
                        }
                    }
                }
                else {
                    const def = getComponentDef(dep) || getDirectiveDef(dep);
                    if (def) {
                        cachedDirectiveDefs.push(def);
                    }
                }
            }
        }
        return cachedDirectiveDefs;
    };
    const pipeDefs = () => {
        if (cachedPipeDefs === null) {
            cachedPipeDefs = [];
            const seen = new Set();
            for (const rawDep of imports) {
                const dep = resolveForwardRef(rawDep);
                if (seen.has(dep)) {
                    continue;
                }
                seen.add(dep);
                if (!!getNgModuleDef(dep)) {
                    const scope = transitiveScopesFor(dep);
                    for (const pipe of scope.exported.pipes) {
                        const def = getPipeDef(pipe);
                        if (def && !seen.has(pipe)) {
                            seen.add(pipe);
                            cachedPipeDefs.push(def);
                        }
                    }
                }
                else {
                    const def = getPipeDef(dep);
                    if (def) {
                        cachedPipeDefs.push(def);
                    }
                }
            }
        }
        return cachedPipeDefs;
    };
    return {
        directiveDefs,
        pipeDefs,
    };
}
function hasSelectorScope(component) {
    return component.ngSelectorScope !== undefined;
}
/**
 * Compile an Angular directive according to its decorator metadata, and patch the resulting
 * directive def onto the component type.
 *
 * In the event that compilation is not immediate, `compileDirective` will return a `Promise` which
 * will resolve when compilation completes and the directive becomes usable.
 */
export function compileDirective(type, directive) {
    let ngDirectiveDef = null;
    addDirectiveFactoryDef(type, directive || {});
    Object.defineProperty(type, NG_DIR_DEF, {
        get: () => {
            if (ngDirectiveDef === null) {
                // `directive` can be null in the case of abstract directives as a base class
                // that use `@Directive()` with no selector. In that case, pass empty object to the
                // `directiveMetadata` function instead of null.
                const meta = getDirectiveMetadata(type, directive || {});
                const compiler = getCompilerFacade({ usage: 0 /* JitCompilerUsage.Decorator */, kind: 'directive', type });
                ngDirectiveDef =
                    compiler.compileDirective(angularCoreEnv, meta.sourceMapUrl, meta.metadata);
            }
            return ngDirectiveDef;
        },
        // Make the property configurable in dev mode to allow overriding in tests
        configurable: !!ngDevMode,
    });
}
function getDirectiveMetadata(type, metadata) {
    const name = type && type.name;
    const sourceMapUrl = `ng:///${name}/ɵdir.js`;
    const compiler = getCompilerFacade({ usage: 0 /* JitCompilerUsage.Decorator */, kind: 'directive', type });
    const facade = directiveMetadata(type, metadata);
    facade.typeSourceSpan = compiler.createParseSourceSpan('Directive', name, sourceMapUrl);
    if (facade.usesInheritance) {
        addDirectiveDefToUndecoratedParents(type);
    }
    return { metadata: facade, sourceMapUrl };
}
function addDirectiveFactoryDef(type, metadata) {
    let ngFactoryDef = null;
    Object.defineProperty(type, NG_FACTORY_DEF, {
        get: () => {
            if (ngFactoryDef === null) {
                const meta = getDirectiveMetadata(type, metadata);
                const compiler = getCompilerFacade({ usage: 0 /* JitCompilerUsage.Decorator */, kind: 'directive', type });
                ngFactoryDef = compiler.compileFactory(angularCoreEnv, `ng:///${type.name}/ɵfac.js`, {
                    name: meta.metadata.name,
                    type: meta.metadata.type,
                    typeArgumentCount: 0,
                    deps: reflectDependencies(type),
                    target: compiler.FactoryTarget.Directive
                });
            }
            return ngFactoryDef;
        },
        // Make the property configurable in dev mode to allow overriding in tests
        configurable: !!ngDevMode,
    });
}
export function extendsDirectlyFromObject(type) {
    return Object.getPrototypeOf(type.prototype) === Object.prototype;
}
/**
 * Extract the `R3DirectiveMetadata` for a particular directive (either a `Directive` or a
 * `Component`).
 */
export function directiveMetadata(type, metadata) {
    // Reflect inputs and outputs.
    const reflect = getReflect();
    const propMetadata = reflect.ownPropMetadata(type);
    return {
        name: type.name,
        type: type,
        selector: metadata.selector !== undefined ? metadata.selector : null,
        host: metadata.host || EMPTY_OBJ,
        propMetadata: propMetadata,
        inputs: metadata.inputs || EMPTY_ARRAY,
        outputs: metadata.outputs || EMPTY_ARRAY,
        queries: extractQueriesMetadata(type, propMetadata, isContentQuery),
        lifecycle: { usesOnChanges: reflect.hasLifecycleHook(type, 'ngOnChanges') },
        typeSourceSpan: null,
        usesInheritance: !extendsDirectlyFromObject(type),
        exportAs: extractExportAs(metadata.exportAs),
        providers: metadata.providers || null,
        viewQueries: extractQueriesMetadata(type, propMetadata, isViewQuery),
        isStandalone: !!metadata.standalone,
        isSignal: !!metadata.signals,
        hostDirectives: metadata.hostDirectives?.map(directive => typeof directive === 'function' ? { directive } : directive) ||
            null
    };
}
/**
 * Adds a directive definition to all parent classes of a type that don't have an Angular decorator.
 */
function addDirectiveDefToUndecoratedParents(type) {
    const objPrototype = Object.prototype;
    let parent = Object.getPrototypeOf(type.prototype).constructor;
    // Go up the prototype until we hit `Object`.
    while (parent && parent !== objPrototype) {
        // Since inheritance works if the class was annotated already, we only need to add
        // the def if there are no annotations and the def hasn't been created already.
        if (!getDirectiveDef(parent) && !getComponentDef(parent) &&
            shouldAddAbstractDirective(parent)) {
            compileDirective(parent, null);
        }
        parent = Object.getPrototypeOf(parent);
    }
}
function convertToR3QueryPredicate(selector) {
    return typeof selector === 'string' ? splitByComma(selector) : resolveForwardRef(selector);
}
export function convertToR3QueryMetadata(propertyName, ann) {
    return {
        propertyName: propertyName,
        predicate: convertToR3QueryPredicate(ann.selector),
        descendants: ann.descendants,
        first: ann.first,
        read: ann.read ? ann.read : null,
        static: !!ann.static,
        emitDistinctChangesOnly: !!ann.emitDistinctChangesOnly,
    };
}
function extractQueriesMetadata(type, propMetadata, isQueryAnn) {
    const queriesMeta = [];
    for (const field in propMetadata) {
        if (propMetadata.hasOwnProperty(field)) {
            const annotations = propMetadata[field];
            annotations.forEach(ann => {
                if (isQueryAnn(ann)) {
                    if (!ann.selector) {
                        throw new Error(`Can't construct a query for the property "${field}" of ` +
                            `"${stringifyForError(type)}" since the query selector wasn't defined.`);
                    }
                    if (annotations.some(isInputAnnotation)) {
                        throw new Error(`Cannot combine @Input decorators with query decorators`);
                    }
                    queriesMeta.push(convertToR3QueryMetadata(field, ann));
                }
            });
        }
    }
    return queriesMeta;
}
function extractExportAs(exportAs) {
    return exportAs === undefined ? null : splitByComma(exportAs);
}
function isContentQuery(value) {
    const name = value.ngMetadataName;
    return name === 'ContentChild' || name === 'ContentChildren';
}
function isViewQuery(value) {
    const name = value.ngMetadataName;
    return name === 'ViewChild' || name === 'ViewChildren';
}
function isInputAnnotation(value) {
    return value.ngMetadataName === 'Input';
}
function splitByComma(value) {
    return value.split(',').map(piece => piece.trim());
}
const LIFECYCLE_HOOKS = [
    'ngOnChanges', 'ngOnInit', 'ngOnDestroy', 'ngDoCheck', 'ngAfterViewInit', 'ngAfterViewChecked',
    'ngAfterContentInit', 'ngAfterContentChecked'
];
function shouldAddAbstractDirective(type) {
    const reflect = getReflect();
    if (LIFECYCLE_HOOKS.some(hookName => reflect.hasLifecycleHook(type, hookName))) {
        return true;
    }
    const propMetadata = reflect.propMetadata(type);
    for (const field in propMetadata) {
        const annotations = propMetadata[field];
        for (let i = 0; i < annotations.length; i++) {
            const current = annotations[i];
            const metadataName = current.ngMetadataName;
            if (isInputAnnotation(current) || isContentQuery(current) || isViewQuery(current) ||
                metadataName === 'Output' || metadataName === 'HostBinding' ||
                metadataName === 'HostListener') {
                return true;
            }
        }
    }
    return false;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlyZWN0aXZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvcmVuZGVyMy9qaXQvZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxpQkFBaUIsRUFBOEMsTUFBTSxnQ0FBZ0MsQ0FBQztBQUU5RyxPQUFPLEVBQUMsWUFBWSxFQUFFLGlCQUFpQixFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFDckUsT0FBTyxFQUFDLFVBQVUsRUFBRSxtQkFBbUIsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBSWxFLE9BQU8sRUFBQyx3QkFBd0IsRUFBRSx3Q0FBd0MsRUFBQyxNQUFNLGlDQUFpQyxDQUFDO0FBQ25ILE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ3RELE9BQU8sRUFBQyxPQUFPLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUMvQyxPQUFPLEVBQUMsV0FBVyxFQUFFLFNBQVMsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBQ3hELE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUNyRCxPQUFPLEVBQUMsZUFBZSxFQUFFLGVBQWUsRUFBRSxjQUFjLEVBQUUsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQzNGLE9BQU8sRUFBQyxXQUFXLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUVsRSxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSx5QkFBeUIsQ0FBQztBQUUxRCxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQzdDLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDNUMsT0FBTyxFQUFDLHVDQUF1QyxFQUFFLDBCQUEwQixFQUFFLG1CQUFtQixFQUFDLE1BQU0sVUFBVSxDQUFDO0FBQ2xILE9B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VyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUMzQyxNQUFNLE9BQU8sR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDL0IsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQztZQUU1QyxJQUFJLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxJQUFJLGNBQWMsQ0FBQyxPQUFPLENBQUMsSUFBSSxXQUFXLENBQUMsT0FBTyxDQUFDO2dCQUM3RSxZQUFZLEtBQUssUUFBUSxJQUFJLFlBQVksS0FBSyxhQUFhO2dCQUMzRCxZQUFZLEtBQUssY0FBYyxFQUFFO2dCQUNuQyxPQUFPLElBQUksQ0FBQzthQUNiO1NBQ0Y7S0FDRjtJQUVELE9BQU8sS0FBSyxDQUFDO0FBQ2YsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2dldENvbXBpbGVyRmFjYWRlLCBKaXRDb21waWxlclVzYWdlLCBSM0RpcmVjdGl2ZU1ldGFkYXRhRmFjYWRlfSBmcm9tICcuLi8uLi9jb21waWxlci9jb21waWxlcl9mYWNhZGUnO1xuaW1wb3J0IHtSM0NvbXBvbmVudE1ldGFkYXRhRmFjYWRlLCBSM1F1ZXJ5TWV0YWRhdGFGYWNhZGV9IGZyb20gJy4uLy4uL2NvbXBpbGVyL2NvbXBpbGVyX2ZhY2FkZV9pbnRlcmZhY2UnO1xuaW1wb3J0IHtpc0ZvcndhcmRSZWYsIHJlc29sdmVGb3J3YXJkUmVmfSBmcm9tICcuLi8uLi9kaS9mb3J3YXJkX3JlZic7XG5pbXBvcnQge2dldFJlZmxlY3QsIHJlZmxlY3REZXBlbmRlbmNpZXN9IGZyb20gJy4uLy4uL2RpL2ppdC91dGlsJztcbmltcG9ydCB7VHlwZX0gZnJvbSAnLi4vLi4vaW50ZXJmYWNlL3R5cGUnO1xuaW1wb3J0IHtRdWVyeX0gZnJvbSAnLi4vLi4vbWV0YWRhdGEvZGknO1xuaW1wb3J0IHtDb21wb25lbnQsIERpcmVjdGl2ZSwgSW5wdXR9IGZyb20gJy4uLy4uL21ldGFkYXRhL2RpcmVjdGl2ZXMnO1xuaW1wb3J0IHtjb21wb25lbnROZWVkc1Jlc29sdXRpb24sIG1heWJlUXVldWVSZXNvbHV0aW9uT2ZDb21wb25lbnRSZXNvdXJjZXN9IGZyb20gJy4uLy4uL21ldGFkYXRhL3Jlc291cmNlX2xvYWRpbmcnO1xuaW1wb3J0IHtWaWV3RW5jYXBzdWxhdGlvbn0gZnJvbSAnLi4vLi4vbWV0YWRhdGEvdmlldyc7XG5pbXBvcnQge2ZsYXR0ZW59IGZyb20gJy4uLy4uL3V0aWwvYXJyYXlfdXRpbHMnO1xuaW1wb3J0IHtFTVBUWV9BUlJBWSwgRU1QVFlfT0JKfSBmcm9tICcuLi8uLi91dGlsL2VtcHR5JztcbmltcG9ydCB7aW5pdE5nRGV2TW9kZX0gZnJvbSAnLi4vLi4vdXRpbC9uZ19kZXZfbW9kZSc7XG5pbXBvcnQge2dldENvbXBvbmVudERlZiwgZ2V0RGlyZWN0aXZlRGVmLCBnZXROZ01vZHVsZURlZiwgZ2V0UGlwZURlZn0gZnJvbSAnLi4vZGVmaW5pdGlvbic7XG5pbXBvcnQge05HX0NPTVBfREVGLCBOR19ESVJfREVGLCBOR19GQUNUT1JZX0RFRn0gZnJvbSAnLi4vZmllbGRzJztcbmltcG9ydCB7Q29tcG9uZW50RGVmLCBDb21wb25lbnRUeXBlLCBEaXJlY3RpdmVEZWZMaXN0LCBQaXBlRGVmTGlzdH0gZnJvbSAnLi4vaW50ZXJmYWNlcy9kZWZpbml0aW9uJztcbmltcG9ydCB7c3RyaW5naWZ5Rm9yRXJyb3J9IGZyb20gJy4uL3V0aWwvc3RyaW5naWZ5X3V0aWxzJztcblxuaW1wb3J0IHthbmd1bGFyQ29yZUVudn0gZnJvbSAnLi9lbnZpcm9ubWVudCc7XG5pbXBvcnQge2dldEppdE9wdGlvbnN9IGZyb20gJy4vaml0X29wdGlvbnMnO1xuaW1wb3J0IHtmbHVzaE1vZHVsZVNjb3BpbmdRdWV1ZUFzTXVjaEFzUG9zc2libGUsIHBhdGNoQ29tcG9uZW50RGVmV2l0aFNjb3BlLCB0cmFuc2l0aXZlU2NvcGVzRm9yfSBmcm9tICcuL21vZHVsZSc7XG5pbXBvcnQge2lzTW9kdWxlV2l0aFByb3ZpZGVyc30gZnJvbSAnLi91dGlsJztcblxuLyoqXG4gKiBLZWVwIHRyYWNrIG9mIHRoZSBjb21waWxhdGlvbiBkZXB0aCB0byBhdm9pZCByZWVudHJhbmN5IGlzc3VlcyBkdXJpbmcgSklUIGNvbXBpbGF0aW9uLiBUaGlzXG4gKiBtYXR0ZXJzIGluIHRoZSBmb2xsb3dpbmcgc2NlbmFyaW86XG4gKlxuICogQ29uc2lkZXIgYSBjb21wb25lbnQgJ0EnIHRoYXQgZXh0ZW5kcyBjb21wb25lbnQgJ0InLCBib3RoIGRlY2xhcmVkIGluIG1vZHVsZSAnTScuIER1cmluZ1xuICogdGhlIGNvbXBpbGF0aW9uIG9mICdBJyB0aGUgZGVmaW5pdGlvbiBvZiAnQicgaXMgcmVxdWVzdGVkIHRvIGNhcHR1cmUgdGhlIGluaGVyaXRhbmNlIGNoYWluLFxuICogcG90ZW50aWFsbHkgdHJpZ2dlcmluZyBjb21waWxhdGlvbiBvZiAnQicuIElmIHRoaXMgbmVzdGVkIGNvbXBpbGF0aW9uIHdlcmUgdG8gdHJpZ2dlclxuICogYGZsdXNoTW9kdWxlU2NvcGluZ1F1ZXVlQXNNdWNoQXNQb3NzaWJsZWAgaXQgbWF5IGhhcHBlbiB0aGF0IG1vZHVsZSAnTScgaXMgc3RpbGwgcGVuZGluZyBpbiB0aGVcbiAqIHF1ZXVlLCByZXN1bHRpbmcgaW4gJ0EnIGFuZCAnQicgdG8gYmUgcGF0Y2hlZCB3aXRoIHRoZSBOZ01vZHVsZSBzY29wZS4gQXMgdGhlIGNvbXBpbGF0aW9uIG9mXG4gKiAnQScgaXMgc3RpbGwgaW4gcHJvZ3Jlc3MsIHRoaXMgd291bGQgaW50cm9kdWNlIGEgY2lyY3VsYXIgZGVwZW5kZW5jeSBvbiBpdHMgY29tcGlsYXRpb24uIFRvIGF2b2lkXG4gKiB0aGlzIGlzc3VlLCB0aGUgbW9kdWxlIHNjb3BlIHF1ZXVlIGlzIG9ubHkgZmx1c2hlZCBmb3IgY29tcGlsYXRpb25zIGF0IHRoZSBkZXB0aCAwLCB0byBlbnN1cmVcbiAqIGFsbCBjb21waWxhdGlvbnMgaGF2ZSBmaW5pc2hlZC5cbiAqL1xubGV0IGNvbXBpbGF0aW9uRGVwdGggPSAwO1xuXG4vKipcbiAqIENvbXBpbGUgYW4gQW5ndWxhciBjb21wb25lbnQgYWNjb3JkaW5nIHRvIGl0cyBkZWNvcmF0b3IgbWV0YWRhdGEsIGFuZCBwYXRjaCB0aGUgcmVzdWx0aW5nXG4gKiBjb21wb25lbnQgZGVmICjJtWNtcCkgb250byB0aGUgY29tcG9uZW50IHR5cGUuXG4gKlxuICogQ29tcGlsYXRpb24gbWF5IGJlIGFzeW5jaHJvbm91cyAoZHVlIHRvIHRoZSBuZWVkIHRvIHJlc29sdmUgVVJMcyBmb3IgdGhlIGNvbXBvbmVudCB0ZW1wbGF0ZSBvclxuICogb3RoZXIgcmVzb3VyY2VzLCBmb3IgZXhhbXBsZSkuIEluIHRoZSBldmVudCB0aGF0IGNvbXBpbGF0aW9uIGlzIG5vdCBpbW1lZGlhdGUsIGBjb21waWxlQ29tcG9uZW50YFxuICogd2lsbCBlbnF1ZXVlIHJlc291cmNlIHJlc29sdXRpb24gaW50byBhIGdsb2JhbCBxdWV1ZSBhbmQgd2lsbCBmYWlsIHRvIHJldHVybiB0aGUgYMm1Y21wYFxuICogdW50aWwgdGhlIGdsb2JhbCBxdWV1ZSBoYXMgYmVlbiByZXNvbHZlZCB3aXRoIGEgY2FsbCB0byBgcmVzb2x2ZUNvbXBvbmVudFJlc291cmNlc2AuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb21waWxlQ29tcG9uZW50KHR5cGU6IFR5cGU8YW55PiwgbWV0YWRhdGE6IENvbXBvbmVudCk6IHZvaWQge1xuICAvLyBJbml0aWFsaXplIG5nRGV2TW9kZS4gVGhpcyBtdXN0IGJlIHRoZSBmaXJzdCBzdGF0ZW1lbnQgaW4gY29tcGlsZUNvbXBvbmVudC5cbiAgLy8gU2VlIHRoZSBgaW5pdE5nRGV2TW9kZWAgZG9jc3RyaW5nIGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSAmJiBpbml0TmdEZXZNb2RlKCk7XG5cbiAgbGV0IG5nQ29tcG9uZW50RGVmOiBDb21wb25lbnREZWY8dW5rbm93bj58bnVsbCA9IG51bGw7XG5cbiAgLy8gTWV0YWRhdGEgbWF5IGhhdmUgcmVzb3VyY2VzIHdoaWNoIG5lZWQgdG8gYmUgcmVzb2x2ZWQuXG4gIG1heWJlUXVldWVSZXNvbHV0aW9uT2ZDb21wb25lbnRSZXNvdXJjZXModHlwZSwgbWV0YWRhdGEpO1xuXG4gIC8vIE5vdGUgdGhhdCB3ZSdyZSB1c2luZyB0aGUgc2FtZSBmdW5jdGlvbiBhcyBgRGlyZWN0aXZlYCwgYmVjYXVzZSB0aGF0J3Mgb25seSBzdWJzZXQgb2YgbWV0YWRhdGFcbiAgLy8gdGhhdCB3ZSBuZWVkIHRvIGNyZWF0ZSB0aGUgbmdGYWN0b3J5RGVmLiBXZSdyZSBhdm9pZGluZyB1c2luZyB0aGUgY29tcG9uZW50IG1ldGFkYXRhXG4gIC8vIGJlY2F1c2Ugd2UnZCBoYXZlIHRvIHJlc29sdmUgdGhlIGFzeW5jaHJvbm91cyB0ZW1wbGF0ZXMuXG4gIGFkZERpcmVjdGl2ZUZhY3RvcnlEZWYodHlwZSwgbWV0YWRhdGEpO1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0eXBlLCBOR19DT01QX0RFRiwge1xuICAgIGdldDogKCkgPT4ge1xuICAgICAgaWYgKG5nQ29tcG9uZW50RGVmID09PSBudWxsKSB7XG4gICAgICAgIGNvbnN0IGNvbXBpbGVyID1cbiAgICAgICAgICAgIGdldENvbXBpbGVyRmFjYWRlKHt1c2FnZTogSml0Q29tcGlsZXJVc2FnZS5EZWNvcmF0b3IsIGtpbmQ6ICdjb21wb25lbnQnLCB0eXBlOiB0eXBlfSk7XG5cbiAgICAgICAgaWYgKGNvbXBvbmVudE5lZWRzUmVzb2x1dGlvbihtZXRhZGF0YSkpIHtcbiAgICAgICAgICBjb25zdCBlcnJvciA9IFtgQ29tcG9uZW50ICcke3R5cGUubmFtZX0nIGlzIG5vdCByZXNvbHZlZDpgXTtcbiAgICAgICAgICBpZiAobWV0YWRhdGEudGVtcGxhdGVVcmwpIHtcbiAgICAgICAgICAgIGVycm9yLnB1c2goYCAtIHRlbXBsYXRlVXJsOiAke21ldGFkYXRhLnRlbXBsYXRlVXJsfWApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAobWV0YWRhdGEuc3R5bGVVcmxzICYmIG1ldGFkYXRhLnN0eWxlVXJscy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGVycm9yLnB1c2goYCAtIHN0eWxlVXJsczogJHtKU09OLnN0cmluZ2lmeShtZXRhZGF0YS5zdHlsZVVybHMpfWApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlcnJvci5wdXNoKGBEaWQgeW91IHJ1biBhbmQgd2FpdCBmb3IgJ3Jlc29sdmVDb21wb25lbnRSZXNvdXJjZXMoKSc/YCk7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yLmpvaW4oJ1xcbicpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRoaXMgY29uc3Qgd2FzIGNhbGxlZCBgaml0T3B0aW9uc2AgcHJldmlvdXNseSBidXQgaGFkIHRvIGJlIHJlbmFtZWQgdG8gYG9wdGlvbnNgIGJlY2F1c2VcbiAgICAgICAgLy8gb2YgYSBidWcgd2l0aCBUZXJzZXIgdGhhdCBjYXVzZWQgb3B0aW1pemVkIEpJVCBidWlsZHMgdG8gdGhyb3cgYSBgUmVmZXJlbmNlRXJyb3JgLlxuICAgICAgICAvLyBUaGlzIGJ1ZyB3YXMgaW52ZXN0aWdhdGVkIGluIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXItY2xpL2lzc3Vlcy8xNzI2NC5cbiAgICAgICAgLy8gV2Ugc2hvdWxkIG5vdCByZW5hbWUgaXQgYmFjayB1bnRpbCBodHRwczovL2dpdGh1Yi5jb20vdGVyc2VyL3RlcnNlci9pc3N1ZXMvNjE1IGlzIGZpeGVkLlxuICAgICAgICBjb25zdCBvcHRpb25zID0gZ2V0Sml0T3B0aW9ucygpO1xuICAgICAgICBsZXQgcHJlc2VydmVXaGl0ZXNwYWNlcyA9IG1ldGFkYXRhLnByZXNlcnZlV2hpdGVzcGFjZXM7XG4gICAgICAgIGlmIChwcmVzZXJ2ZVdoaXRlc3BhY2VzID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBpZiAob3B0aW9ucyAhPT0gbnVsbCAmJiBvcHRpb25zLnByZXNlcnZlV2hpdGVzcGFjZXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcHJlc2VydmVXaGl0ZXNwYWNlcyA9IG9wdGlvbnMucHJlc2VydmVXaGl0ZXNwYWNlcztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcHJlc2VydmVXaGl0ZXNwYWNlcyA9IGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBsZXQgZW5jYXBzdWxhdGlvbiA9IG1ldGFkYXRhLmVuY2Fwc3VsYXRpb247XG4gICAgICAgIGlmIChlbmNhcHN1bGF0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBpZiAob3B0aW9ucyAhPT0gbnVsbCAmJiBvcHRpb25zLmRlZmF1bHRFbmNhcHN1bGF0aW9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGVuY2Fwc3VsYXRpb24gPSBvcHRpb25zLmRlZmF1bHRFbmNhcHN1bGF0aW9uO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlbmNhcHN1bGF0aW9uID0gVmlld0VuY2Fwc3VsYXRpb24uRW11bGF0ZWQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdGVtcGxhdGVVcmwgPSBtZXRhZGF0YS50ZW1wbGF0ZVVybCB8fCBgbmc6Ly8vJHt0eXBlLm5hbWV9L3RlbXBsYXRlLmh0bWxgO1xuICAgICAgICBjb25zdCBtZXRhOiBSM0NvbXBvbmVudE1ldGFkYXRhRmFjYWRlID0ge1xuICAgICAgICAgIC4uLmRpcmVjdGl2ZU1ldGFkYXRhKHR5cGUsIG1ldGFkYXRhKSxcbiAgICAgICAgICB0eXBlU291cmNlU3BhbjogY29tcGlsZXIuY3JlYXRlUGFyc2VTb3VyY2VTcGFuKCdDb21wb25lbnQnLCB0eXBlLm5hbWUsIHRlbXBsYXRlVXJsKSxcbiAgICAgICAgICB0ZW1wbGF0ZTogbWV0YWRhdGEudGVtcGxhdGUgfHwgJycsXG4gICAgICAgICAgcHJlc2VydmVXaGl0ZXNwYWNlcyxcbiAgICAgICAgICBzdHlsZXM6IG1ldGFkYXRhLnN0eWxlcyB8fCBFTVBUWV9BUlJBWSxcbiAgICAgICAgICBhbmltYXRpb25zOiBtZXRhZGF0YS5hbmltYXRpb25zLFxuICAgICAgICAgIC8vIEpJVCBjb21wb25lbnRzIGFyZSBhbHdheXMgY29tcGlsZWQgYWdhaW5zdCBhbiBlbXB0eSBzZXQgb2YgYGRlY2xhcmF0aW9uc2AuIEluc3RlYWQsIHRoZVxuICAgICAgICAgIC8vIGBkaXJlY3RpdmVEZWZzYCBhbmQgYHBpcGVEZWZzYCBhcmUgdXBkYXRlZCBhdCBhIGxhdGVyIHBvaW50OlxuICAgICAgICAgIC8vICAqIGZvciBOZ01vZHVsZS1iYXNlZCBjb21wb25lbnRzLCB0aGV5J3JlIHNldCB3aGVuIHRoZSBOZ01vZHVsZSB3aGljaCBkZWNsYXJlcyB0aGVcbiAgICAgICAgICAvLyAgICBjb21wb25lbnQgcmVzb2x2ZXMgaW4gdGhlIG1vZHVsZSBzY29waW5nIHF1ZXVlXG4gICAgICAgICAgLy8gICogZm9yIHN0YW5kYWxvbmUgY29tcG9uZW50cywgdGhleSdyZSBzZXQganVzdCBiZWxvdywgYWZ0ZXIgYGNvbXBpbGVDb21wb25lbnRgLlxuICAgICAgICAgIGRlY2xhcmF0aW9uczogW10sXG4gICAgICAgICAgY2hhbmdlRGV0ZWN0aW9uOiBtZXRhZGF0YS5jaGFuZ2VEZXRlY3Rpb24sXG4gICAgICAgICAgZW5jYXBzdWxhdGlvbixcbiAgICAgICAgICBpbnRlcnBvbGF0aW9uOiBtZXRhZGF0YS5pbnRlcnBvbGF0aW9uLFxuICAgICAgICAgIHZpZXdQcm92aWRlcnM6IG1ldGFkYXRhLnZpZXdQcm92aWRlcnMgfHwgbnVsbCxcbiAgICAgICAgfTtcblxuICAgICAgICBjb21waWxhdGlvbkRlcHRoKys7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKG1ldGEudXNlc0luaGVyaXRhbmNlKSB7XG4gICAgICAgICAgICBhZGREaXJlY3RpdmVEZWZUb1VuZGVjb3JhdGVkUGFyZW50cyh0eXBlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgbmdDb21wb25lbnREZWYgPVxuICAgICAgICAgICAgICBjb21waWxlci5jb21waWxlQ29tcG9uZW50KGFuZ3VsYXJDb3JlRW52LCB0ZW1wbGF0ZVVybCwgbWV0YSkgYXMgQ29tcG9uZW50RGVmPHVua25vd24+O1xuXG4gICAgICAgICAgaWYgKG1ldGFkYXRhLnN0YW5kYWxvbmUpIHtcbiAgICAgICAgICAgIC8vIFBhdGNoIHRoZSBjb21wb25lbnQgZGVmaW5pdGlvbiBmb3Igc3RhbmRhbG9uZSBjb21wb25lbnRzIHdpdGggYGRpcmVjdGl2ZURlZnNgIGFuZFxuICAgICAgICAgICAgLy8gYHBpcGVEZWZzYCBmdW5jdGlvbnMgd2hpY2ggbGF6aWx5IGNvbXB1dGUgdGhlIGRpcmVjdGl2ZXMvcGlwZXMgYXZhaWxhYmxlIGluIHRoZVxuICAgICAgICAgICAgLy8gc3RhbmRhbG9uZSBjb21wb25lbnQuIEFsc28gc2V0IGBkZXBlbmRlbmNpZXNgIHRvIHRoZSBsYXppbHkgcmVzb2x2ZWQgbGlzdCBvZiBpbXBvcnRzLlxuICAgICAgICAgICAgY29uc3QgaW1wb3J0czogVHlwZTxhbnk+W10gPSBmbGF0dGVuKG1ldGFkYXRhLmltcG9ydHMgfHwgRU1QVFlfQVJSQVkpO1xuICAgICAgICAgICAgY29uc3Qge2RpcmVjdGl2ZURlZnMsIHBpcGVEZWZzfSA9IGdldFN0YW5kYWxvbmVEZWZGdW5jdGlvbnModHlwZSwgaW1wb3J0cyk7XG4gICAgICAgICAgICBuZ0NvbXBvbmVudERlZi5kaXJlY3RpdmVEZWZzID0gZGlyZWN0aXZlRGVmcztcbiAgICAgICAgICAgIG5nQ29tcG9uZW50RGVmLnBpcGVEZWZzID0gcGlwZURlZnM7XG4gICAgICAgICAgICBuZ0NvbXBvbmVudERlZi5kZXBlbmRlbmNpZXMgPSAoKSA9PiBpbXBvcnRzLm1hcChyZXNvbHZlRm9yd2FyZFJlZik7XG4gICAgICAgICAgfVxuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgIC8vIEVuc3VyZSB0aGF0IHRoZSBjb21waWxhdGlvbiBkZXB0aCBpcyBkZWNyZW1lbnRlZCBldmVuIHdoZW4gdGhlIGNvbXBpbGF0aW9uIGZhaWxlZC5cbiAgICAgICAgICBjb21waWxhdGlvbkRlcHRoLS07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY29tcGlsYXRpb25EZXB0aCA9PT0gMCkge1xuICAgICAgICAgIC8vIFdoZW4gTmdNb2R1bGUgZGVjb3JhdG9yIGV4ZWN1dGVkLCB3ZSBlbnF1ZXVlZCB0aGUgbW9kdWxlIGRlZmluaXRpb24gc3VjaCB0aGF0XG4gICAgICAgICAgLy8gaXQgd291bGQgb25seSBkZXF1ZXVlIGFuZCBhZGQgaXRzZWxmIGFzIG1vZHVsZSBzY29wZSB0byBhbGwgb2YgaXRzIGRlY2xhcmF0aW9ucyxcbiAgICAgICAgICAvLyBidXQgb25seSBpZiAgaWYgYWxsIG9mIGl0cyBkZWNsYXJhdGlvbnMgaGFkIHJlc29sdmVkLiBUaGlzIGNhbGwgcnVucyB0aGUgY2hlY2tcbiAgICAgICAgICAvLyB0byBzZWUgaWYgYW55IG1vZHVsZXMgdGhhdCBhcmUgaW4gdGhlIHF1ZXVlIGNhbiBiZSBkZXF1ZXVlZCBhbmQgYWRkIHNjb3BlIHRvXG4gICAgICAgICAgLy8gdGhlaXIgZGVjbGFyYXRpb25zLlxuICAgICAgICAgIGZsdXNoTW9kdWxlU2NvcGluZ1F1ZXVlQXNNdWNoQXNQb3NzaWJsZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgY29tcG9uZW50IGNvbXBpbGF0aW9uIGlzIGFzeW5jLCB0aGVuIHRoZSBATmdNb2R1bGUgYW5ub3RhdGlvbiB3aGljaCBkZWNsYXJlcyB0aGVcbiAgICAgICAgLy8gY29tcG9uZW50IG1heSBleGVjdXRlIGFuZCBzZXQgYW4gbmdTZWxlY3RvclNjb3BlIHByb3BlcnR5IG9uIHRoZSBjb21wb25lbnQgdHlwZS4gVGhpc1xuICAgICAgICAvLyBhbGxvd3MgdGhlIGNvbXBvbmVudCB0byBwYXRjaCBpdHNlbGYgd2l0aCBkaXJlY3RpdmVEZWZzIGZyb20gdGhlIG1vZHVsZSBhZnRlciBpdFxuICAgICAgICAvLyBmaW5pc2hlcyBjb21waWxpbmcuXG4gICAgICAgIGlmIChoYXNTZWxlY3RvclNjb3BlKHR5cGUpKSB7XG4gICAgICAgICAgY29uc3Qgc2NvcGVzID0gdHJhbnNpdGl2ZVNjb3Blc0Zvcih0eXBlLm5nU2VsZWN0b3JTY29wZSk7XG4gICAgICAgICAgcGF0Y2hDb21wb25lbnREZWZXaXRoU2NvcGUobmdDb21wb25lbnREZWYsIHNjb3Blcyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobWV0YWRhdGEuc2NoZW1hcykge1xuICAgICAgICAgIGlmIChtZXRhZGF0YS5zdGFuZGFsb25lKSB7XG4gICAgICAgICAgICBuZ0NvbXBvbmVudERlZi5zY2hlbWFzID0gbWV0YWRhdGEuc2NoZW1hcztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBUaGUgJ3NjaGVtYXMnIHdhcyBzcGVjaWZpZWQgZm9yIHRoZSAke1xuICAgICAgICAgICAgICAgIHN0cmluZ2lmeUZvckVycm9yKHR5cGUpfSBidXQgaXMgb25seSB2YWxpZCBvbiBhIGNvbXBvbmVudCB0aGF0IGlzIHN0YW5kYWxvbmUuYCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKG1ldGFkYXRhLnN0YW5kYWxvbmUpIHtcbiAgICAgICAgICBuZ0NvbXBvbmVudERlZi5zY2hlbWFzID0gW107XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBuZ0NvbXBvbmVudERlZjtcbiAgICB9LFxuICAgIC8vIE1ha2UgdGhlIHByb3BlcnR5IGNvbmZpZ3VyYWJsZSBpbiBkZXYgbW9kZSB0byBhbGxvdyBvdmVycmlkaW5nIGluIHRlc3RzXG4gICAgY29uZmlndXJhYmxlOiAhIW5nRGV2TW9kZSxcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldERlcGVuZGVuY3lUeXBlRm9yRXJyb3IodHlwZTogVHlwZTxhbnk+KSB7XG4gIGlmIChnZXRDb21wb25lbnREZWYodHlwZSkpIHJldHVybiAnY29tcG9uZW50JztcbiAgaWYgKGdldERpcmVjdGl2ZURlZih0eXBlKSkgcmV0dXJuICdkaXJlY3RpdmUnO1xuICBpZiAoZ2V0UGlwZURlZih0eXBlKSkgcmV0dXJuICdwaXBlJztcbiAgcmV0dXJuICd0eXBlJztcbn1cblxuZnVuY3Rpb24gdmVyaWZ5U3RhbmRhbG9uZUltcG9ydChkZXBUeXBlOiBUeXBlPHVua25vd24+LCBpbXBvcnRpbmdUeXBlOiBUeXBlPHVua25vd24+KSB7XG4gIGlmIChpc0ZvcndhcmRSZWYoZGVwVHlwZSkpIHtcbiAgICBkZXBUeXBlID0gcmVzb2x2ZUZvcndhcmRSZWYoZGVwVHlwZSk7XG4gICAgaWYgKCFkZXBUeXBlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkIGZvcndhcmRSZWYgZnVuY3Rpb24sIGltcG9ydGVkIGZyb20gXCIke1xuICAgICAgICAgIHN0cmluZ2lmeUZvckVycm9yKGltcG9ydGluZ1R5cGUpfVwiLCB0byByZXR1cm4gYSBzdGFuZGFsb25lIGVudGl0eSBvciBOZ01vZHVsZSBidXQgZ290IFwiJHtcbiAgICAgICAgICBzdHJpbmdpZnlGb3JFcnJvcihkZXBUeXBlKSB8fCBkZXBUeXBlfVwiLmApO1xuICAgIH1cbiAgfVxuXG4gIGlmIChnZXROZ01vZHVsZURlZihkZXBUeXBlKSA9PSBudWxsKSB7XG4gICAgY29uc3QgZGVmID0gZ2V0Q29tcG9uZW50RGVmKGRlcFR5cGUpIHx8IGdldERpcmVjdGl2ZURlZihkZXBUeXBlKSB8fCBnZXRQaXBlRGVmKGRlcFR5cGUpO1xuICAgIGlmIChkZWYgIT0gbnVsbCkge1xuICAgICAgLy8gaWYgYSBjb21wb25lbnQsIGRpcmVjdGl2ZSBvciBwaXBlIGlzIGltcG9ydGVkIG1ha2Ugc3VyZSB0aGF0IGl0IGlzIHN0YW5kYWxvbmVcbiAgICAgIGlmICghZGVmLnN0YW5kYWxvbmUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBUaGUgXCIke3N0cmluZ2lmeUZvckVycm9yKGRlcFR5cGUpfVwiICR7XG4gICAgICAgICAgICBnZXREZXBlbmRlbmN5VHlwZUZvckVycm9yKGRlcFR5cGUpfSwgaW1wb3J0ZWQgZnJvbSBcIiR7XG4gICAgICAgICAgICBzdHJpbmdpZnlGb3JFcnJvcihcbiAgICAgICAgICAgICAgICBpbXBvcnRpbmdUeXBlKX1cIiwgaXMgbm90IHN0YW5kYWxvbmUuIERpZCB5b3UgZm9yZ2V0IHRvIGFkZCB0aGUgc3RhbmRhbG9uZTogdHJ1ZSBmbGFnP2ApO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBpdCBjYW4gYmUgZWl0aGVyIGEgbW9kdWxlIHdpdGggcHJvdmlkZXIgb3IgYW4gdW5rbm93biAobm90IGFubm90YXRlZCkgdHlwZVxuICAgICAgaWYgKGlzTW9kdWxlV2l0aFByb3ZpZGVycyhkZXBUeXBlKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEEgbW9kdWxlIHdpdGggcHJvdmlkZXJzIHdhcyBpbXBvcnRlZCBmcm9tIFwiJHtcbiAgICAgICAgICAgIHN0cmluZ2lmeUZvckVycm9yKFxuICAgICAgICAgICAgICAgIGltcG9ydGluZ1R5cGUpfVwiLiBNb2R1bGVzIHdpdGggcHJvdmlkZXJzIGFyZSBub3Qgc3VwcG9ydGVkIGluIHN0YW5kYWxvbmUgY29tcG9uZW50cyBpbXBvcnRzLmApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBUaGUgXCIke3N0cmluZ2lmeUZvckVycm9yKGRlcFR5cGUpfVwiIHR5cGUsIGltcG9ydGVkIGZyb20gXCIke1xuICAgICAgICAgICAgc3RyaW5naWZ5Rm9yRXJyb3IoXG4gICAgICAgICAgICAgICAgaW1wb3J0aW5nVHlwZSl9XCIsIG11c3QgYmUgYSBzdGFuZGFsb25lIGNvbXBvbmVudCAvIGRpcmVjdGl2ZSAvIHBpcGUgb3IgYW4gTmdNb2R1bGUuIERpZCB5b3UgZm9yZ2V0IHRvIGFkZCB0aGUgcmVxdWlyZWQgQENvbXBvbmVudCAvIEBEaXJlY3RpdmUgLyBAUGlwZSBvciBATmdNb2R1bGUgYW5ub3RhdGlvbj9gKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBCdWlsZCBtZW1vaXplZCBgZGlyZWN0aXZlRGVmc2AgYW5kIGBwaXBlRGVmc2AgZnVuY3Rpb25zIGZvciB0aGUgY29tcG9uZW50IGRlZmluaXRpb24gb2YgYVxuICogc3RhbmRhbG9uZSBjb21wb25lbnQsIHdoaWNoIHByb2Nlc3MgYGltcG9ydHNgIGFuZCBmaWx0ZXIgb3V0IGRpcmVjdGl2ZXMgYW5kIHBpcGVzLiBUaGUgdXNlIG9mXG4gKiBtZW1vaXplZCBmdW5jdGlvbnMgaGVyZSBhbGxvd3MgZm9yIHRoZSBkZWxheWVkIHJlc29sdXRpb24gb2YgYW55IGBmb3J3YXJkUmVmYHMgcHJlc2VudCBpbiB0aGVcbiAqIGNvbXBvbmVudCdzIGBpbXBvcnRzYC5cbiAqL1xuZnVuY3Rpb24gZ2V0U3RhbmRhbG9uZURlZkZ1bmN0aW9ucyh0eXBlOiBUeXBlPGFueT4sIGltcG9ydHM6IFR5cGU8YW55PltdKToge1xuICBkaXJlY3RpdmVEZWZzOiAoKSA9PiBEaXJlY3RpdmVEZWZMaXN0LFxuICBwaXBlRGVmczogKCkgPT4gUGlwZURlZkxpc3QsXG59IHtcbiAgbGV0IGNhY2hlZERpcmVjdGl2ZURlZnM6IERpcmVjdGl2ZURlZkxpc3R8bnVsbCA9IG51bGw7XG4gIGxldCBjYWNoZWRQaXBlRGVmczogUGlwZURlZkxpc3R8bnVsbCA9IG51bGw7XG4gIGNvbnN0IGRpcmVjdGl2ZURlZnMgPSAoKSA9PiB7XG4gICAgaWYgKGNhY2hlZERpcmVjdGl2ZURlZnMgPT09IG51bGwpIHtcbiAgICAgIC8vIFN0YW5kYWxvbmUgY29tcG9uZW50cyBhcmUgYWx3YXlzIGFibGUgdG8gc2VsZi1yZWZlcmVuY2UsIHNvIGluY2x1ZGUgdGhlIGNvbXBvbmVudCdzIG93blxuICAgICAgLy8gZGVmaW5pdGlvbiBpbiBpdHMgYGRpcmVjdGl2ZURlZnNgLlxuICAgICAgY2FjaGVkRGlyZWN0aXZlRGVmcyA9IFtnZXRDb21wb25lbnREZWYodHlwZSkhXTtcbiAgICAgIGNvbnN0IHNlZW4gPSBuZXcgU2V0PFR5cGU8dW5rbm93bj4+KFt0eXBlXSk7XG5cbiAgICAgIGZvciAoY29uc3QgcmF3RGVwIG9mIGltcG9ydHMpIHtcbiAgICAgICAgbmdEZXZNb2RlICYmIHZlcmlmeVN0YW5kYWxvbmVJbXBvcnQocmF3RGVwLCB0eXBlKTtcblxuICAgICAgICBjb25zdCBkZXAgPSByZXNvbHZlRm9yd2FyZFJlZihyYXdEZXApO1xuICAgICAgICBpZiAoc2Vlbi5oYXMoZGVwKSkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIHNlZW4uYWRkKGRlcCk7XG5cbiAgICAgICAgaWYgKCEhZ2V0TmdNb2R1bGVEZWYoZGVwKSkge1xuICAgICAgICAgIGNvbnN0IHNjb3BlID0gdHJhbnNpdGl2ZVNjb3Blc0ZvcihkZXApO1xuICAgICAgICAgIGZvciAoY29uc3QgZGlyIG9mIHNjb3BlLmV4cG9ydGVkLmRpcmVjdGl2ZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGRlZiA9IGdldENvbXBvbmVudERlZihkaXIpIHx8IGdldERpcmVjdGl2ZURlZihkaXIpO1xuICAgICAgICAgICAgaWYgKGRlZiAmJiAhc2Vlbi5oYXMoZGlyKSkge1xuICAgICAgICAgICAgICBzZWVuLmFkZChkaXIpO1xuICAgICAgICAgICAgICBjYWNoZWREaXJlY3RpdmVEZWZzLnB1c2goZGVmKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgZGVmID0gZ2V0Q29tcG9uZW50RGVmKGRlcCkgfHwgZ2V0RGlyZWN0aXZlRGVmKGRlcCk7XG4gICAgICAgICAgaWYgKGRlZikge1xuICAgICAgICAgICAgY2FjaGVkRGlyZWN0aXZlRGVmcy5wdXNoKGRlZik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjYWNoZWREaXJlY3RpdmVEZWZzO1xuICB9O1xuXG4gIGNvbnN0IHBpcGVEZWZzID0gKCkgPT4ge1xuICAgIGlmIChjYWNoZWRQaXBlRGVmcyA9PT0gbnVsbCkge1xuICAgICAgY2FjaGVkUGlwZURlZnMgPSBbXTtcbiAgICAgIGNvbnN0IHNlZW4gPSBuZXcgU2V0PFR5cGU8dW5rbm93bj4+KCk7XG5cbiAgICAgIGZvciAoY29uc3QgcmF3RGVwIG9mIGltcG9ydHMpIHtcbiAgICAgICAgY29uc3QgZGVwID0gcmVzb2x2ZUZvcndhcmRSZWYocmF3RGVwKTtcbiAgICAgICAgaWYgKHNlZW4uaGFzKGRlcCkpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBzZWVuLmFkZChkZXApO1xuXG4gICAgICAgIGlmICghIWdldE5nTW9kdWxlRGVmKGRlcCkpIHtcbiAgICAgICAgICBjb25zdCBzY29wZSA9IHRyYW5zaXRpdmVTY29wZXNGb3IoZGVwKTtcbiAgICAgICAgICBmb3IgKGNvbnN0IHBpcGUgb2Ygc2NvcGUuZXhwb3J0ZWQucGlwZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGRlZiA9IGdldFBpcGVEZWYocGlwZSk7XG4gICAgICAgICAgICBpZiAoZGVmICYmICFzZWVuLmhhcyhwaXBlKSkge1xuICAgICAgICAgICAgICBzZWVuLmFkZChwaXBlKTtcbiAgICAgICAgICAgICAgY2FjaGVkUGlwZURlZnMucHVzaChkZWYpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBkZWYgPSBnZXRQaXBlRGVmKGRlcCk7XG4gICAgICAgICAgaWYgKGRlZikge1xuICAgICAgICAgICAgY2FjaGVkUGlwZURlZnMucHVzaChkZWYpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY2FjaGVkUGlwZURlZnM7XG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICBkaXJlY3RpdmVEZWZzLFxuICAgIHBpcGVEZWZzLFxuICB9O1xufVxuXG5mdW5jdGlvbiBoYXNTZWxlY3RvclNjb3BlPFQ+KGNvbXBvbmVudDogVHlwZTxUPik6IGNvbXBvbmVudCBpcyBUeXBlPFQ+JlxuICAgIHtuZ1NlbGVjdG9yU2NvcGU6IFR5cGU8YW55Pn0ge1xuICByZXR1cm4gKGNvbXBvbmVudCBhcyB7bmdTZWxlY3RvclNjb3BlPzogYW55fSkubmdTZWxlY3RvclNjb3BlICE9PSB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogQ29tcGlsZSBhbiBBbmd1bGFyIGRpcmVjdGl2ZSBhY2NvcmRpbmcgdG8gaXRzIGRlY29yYXRvciBtZXRhZGF0YSwgYW5kIHBhdGNoIHRoZSByZXN1bHRpbmdcbiAqIGRpcmVjdGl2ZSBkZWYgb250byB0aGUgY29tcG9uZW50IHR5cGUuXG4gKlxuICogSW4gdGhlIGV2ZW50IHRoYXQgY29tcGlsYXRpb24gaXMgbm90IGltbWVkaWF0ZSwgYGNvbXBpbGVEaXJlY3RpdmVgIHdpbGwgcmV0dXJuIGEgYFByb21pc2VgIHdoaWNoXG4gKiB3aWxsIHJlc29sdmUgd2hlbiBjb21waWxhdGlvbiBjb21wbGV0ZXMgYW5kIHRoZSBkaXJlY3RpdmUgYmVjb21lcyB1c2FibGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb21waWxlRGlyZWN0aXZlKHR5cGU6IFR5cGU8YW55PiwgZGlyZWN0aXZlOiBEaXJlY3RpdmV8bnVsbCk6IHZvaWQge1xuICBsZXQgbmdEaXJlY3RpdmVEZWY6IGFueSA9IG51bGw7XG5cbiAgYWRkRGlyZWN0aXZlRmFjdG9yeURlZih0eXBlLCBkaXJlY3RpdmUgfHwge30pO1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0eXBlLCBOR19ESVJfREVGLCB7XG4gICAgZ2V0OiAoKSA9PiB7XG4gICAgICBpZiAobmdEaXJlY3RpdmVEZWYgPT09IG51bGwpIHtcbiAgICAgICAgLy8gYGRpcmVjdGl2ZWAgY2FuIGJlIG51bGwgaW4gdGhlIGNhc2Ugb2YgYWJzdHJhY3QgZGlyZWN0aXZlcyBhcyBhIGJhc2UgY2xhc3NcbiAgICAgICAgLy8gdGhhdCB1c2UgYEBEaXJlY3RpdmUoKWAgd2l0aCBubyBzZWxlY3Rvci4gSW4gdGhhdCBjYXNlLCBwYXNzIGVtcHR5IG9iamVjdCB0byB0aGVcbiAgICAgICAgLy8gYGRpcmVjdGl2ZU1ldGFkYXRhYCBmdW5jdGlvbiBpbnN0ZWFkIG9mIG51bGwuXG4gICAgICAgIGNvbnN0IG1ldGEgPSBnZXREaXJlY3RpdmVNZXRhZGF0YSh0eXBlLCBkaXJlY3RpdmUgfHwge30pO1xuICAgICAgICBjb25zdCBjb21waWxlciA9XG4gICAgICAgICAgICBnZXRDb21waWxlckZhY2FkZSh7dXNhZ2U6IEppdENvbXBpbGVyVXNhZ2UuRGVjb3JhdG9yLCBraW5kOiAnZGlyZWN0aXZlJywgdHlwZX0pO1xuICAgICAgICBuZ0RpcmVjdGl2ZURlZiA9XG4gICAgICAgICAgICBjb21waWxlci5jb21waWxlRGlyZWN0aXZlKGFuZ3VsYXJDb3JlRW52LCBtZXRhLnNvdXJjZU1hcFVybCwgbWV0YS5tZXRhZGF0YSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmdEaXJlY3RpdmVEZWY7XG4gICAgfSxcbiAgICAvLyBNYWtlIHRoZSBwcm9wZXJ0eSBjb25maWd1cmFibGUgaW4gZGV2IG1vZGUgdG8gYWxsb3cgb3ZlcnJpZGluZyBpbiB0ZXN0c1xuICAgIGNvbmZpZ3VyYWJsZTogISFuZ0Rldk1vZGUsXG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXREaXJlY3RpdmVNZXRhZGF0YSh0eXBlOiBUeXBlPGFueT4sIG1ldGFkYXRhOiBEaXJlY3RpdmUpIHtcbiAgY29uc3QgbmFtZSA9IHR5cGUgJiYgdHlwZS5uYW1lO1xuICBjb25zdCBzb3VyY2VNYXBVcmwgPSBgbmc6Ly8vJHtuYW1lfS/JtWRpci5qc2A7XG4gIGNvbnN0IGNvbXBpbGVyID0gZ2V0Q29tcGlsZXJGYWNhZGUoe3VzYWdlOiBKaXRDb21waWxlclVzYWdlLkRlY29yYXRvciwga2luZDogJ2RpcmVjdGl2ZScsIHR5cGV9KTtcbiAgY29uc3QgZmFjYWRlID0gZGlyZWN0aXZlTWV0YWRhdGEodHlwZSBhcyBDb21wb25lbnRUeXBlPGFueT4sIG1ldGFkYXRhKTtcbiAgZmFjYWRlLnR5cGVTb3VyY2VTcGFuID0gY29tcGlsZXIuY3JlYXRlUGFyc2VTb3VyY2VTcGFuKCdEaXJlY3RpdmUnLCBuYW1lLCBzb3VyY2VNYXBVcmwpO1xuICBpZiAoZmFjYWRlLnVzZXNJbmhlcml0YW5jZSkge1xuICAgIGFkZERpcmVjdGl2ZURlZlRvVW5kZWNvcmF0ZWRQYXJlbnRzKHR5cGUpO1xuICB9XG4gIHJldHVybiB7bWV0YWRhdGE6IGZhY2FkZSwgc291cmNlTWFwVXJsfTtcbn1cblxuZnVuY3Rpb24gYWRkRGlyZWN0aXZlRmFjdG9yeURlZih0eXBlOiBUeXBlPGFueT4sIG1ldGFkYXRhOiBEaXJlY3RpdmV8Q29tcG9uZW50KSB7XG4gIGxldCBuZ0ZhY3RvcnlEZWY6IGFueSA9IG51bGw7XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHR5cGUsIE5HX0ZBQ1RPUllfREVGLCB7XG4gICAgZ2V0OiAoKSA9PiB7XG4gICAgICBpZiAobmdGYWN0b3J5RGVmID09PSBudWxsKSB7XG4gICAgICAgIGNvbnN0IG1ldGEgPSBnZXREaXJlY3RpdmVNZXRhZGF0YSh0eXBlLCBtZXRhZGF0YSk7XG4gICAgICAgIGNvbnN0IGNvbXBpbGVyID1cbiAgICAgICAgICAgIGdldENvbXBpbGVyRmFjYWRlKHt1c2FnZTogSml0Q29tcGlsZXJVc2FnZS5EZWNvcmF0b3IsIGtpbmQ6ICdkaXJlY3RpdmUnLCB0eXBlfSk7XG4gICAgICAgIG5nRmFjdG9yeURlZiA9IGNvbXBpbGVyLmNvbXBpbGVGYWN0b3J5KGFuZ3VsYXJDb3JlRW52LCBgbmc6Ly8vJHt0eXBlLm5hbWV9L8m1ZmFjLmpzYCwge1xuICAgICAgICAgIG5hbWU6IG1ldGEubWV0YWRhdGEubmFtZSxcbiAgICAgICAgICB0eXBlOiBtZXRhLm1ldGFkYXRhLnR5cGUsXG4gICAgICAgICAgdHlwZUFyZ3VtZW50Q291bnQ6IDAsXG4gICAgICAgICAgZGVwczogcmVmbGVjdERlcGVuZGVuY2llcyh0eXBlKSxcbiAgICAgICAgICB0YXJnZXQ6IGNvbXBpbGVyLkZhY3RvcnlUYXJnZXQuRGlyZWN0aXZlXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5nRmFjdG9yeURlZjtcbiAgICB9LFxuICAgIC8vIE1ha2UgdGhlIHByb3BlcnR5IGNvbmZpZ3VyYWJsZSBpbiBkZXYgbW9kZSB0byBhbGxvdyBvdmVycmlkaW5nIGluIHRlc3RzXG4gICAgY29uZmlndXJhYmxlOiAhIW5nRGV2TW9kZSxcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBleHRlbmRzRGlyZWN0bHlGcm9tT2JqZWN0KHR5cGU6IFR5cGU8YW55Pik6IGJvb2xlYW4ge1xuICByZXR1cm4gT2JqZWN0LmdldFByb3RvdHlwZU9mKHR5cGUucHJvdG90eXBlKSA9PT0gT2JqZWN0LnByb3RvdHlwZTtcbn1cblxuLyoqXG4gKiBFeHRyYWN0IHRoZSBgUjNEaXJlY3RpdmVNZXRhZGF0YWAgZm9yIGEgcGFydGljdWxhciBkaXJlY3RpdmUgKGVpdGhlciBhIGBEaXJlY3RpdmVgIG9yIGFcbiAqIGBDb21wb25lbnRgKS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRpcmVjdGl2ZU1ldGFkYXRhKHR5cGU6IFR5cGU8YW55PiwgbWV0YWRhdGE6IERpcmVjdGl2ZSk6IFIzRGlyZWN0aXZlTWV0YWRhdGFGYWNhZGUge1xuICAvLyBSZWZsZWN0IGlucHV0cyBhbmQgb3V0cHV0cy5cbiAgY29uc3QgcmVmbGVjdCA9IGdldFJlZmxlY3QoKTtcbiAgY29uc3QgcHJvcE1ldGFkYXRhID0gcmVmbGVjdC5vd25Qcm9wTWV0YWRhdGEodHlwZSk7XG5cbiAgcmV0dXJuIHtcbiAgICBuYW1lOiB0eXBlLm5hbWUsXG4gICAgdHlwZTogdHlwZSxcbiAgICBzZWxlY3RvcjogbWV0YWRhdGEuc2VsZWN0b3IgIT09IHVuZGVmaW5lZCA/IG1ldGFkYXRhLnNlbGVjdG9yIDogbnVsbCxcbiAgICBob3N0OiBtZXRhZGF0YS5ob3N0IHx8IEVNUFRZX09CSixcbiAgICBwcm9wTWV0YWRhdGE6IHByb3BNZXRhZGF0YSxcbiAgICBpbnB1dHM6IG1ldGFkYXRhLmlucHV0cyB8fCBFTVBUWV9BUlJBWSxcbiAgICBvdXRwdXRzOiBtZXRhZGF0YS5vdXRwdXRzIHx8IEVNUFRZX0FSUkFZLFxuICAgIHF1ZXJpZXM6IGV4dHJhY3RRdWVyaWVzTWV0YWRhdGEodHlwZSwgcHJvcE1ldGFkYXRhLCBpc0NvbnRlbnRRdWVyeSksXG4gICAgbGlmZWN5Y2xlOiB7dXNlc09uQ2hhbmdlczogcmVmbGVjdC5oYXNMaWZlY3ljbGVIb29rKHR5cGUsICduZ09uQ2hhbmdlcycpfSxcbiAgICB0eXBlU291cmNlU3BhbjogbnVsbCEsXG4gICAgdXNlc0luaGVyaXRhbmNlOiAhZXh0ZW5kc0RpcmVjdGx5RnJvbU9iamVjdCh0eXBlKSxcbiAgICBleHBvcnRBczogZXh0cmFjdEV4cG9ydEFzKG1ldGFkYXRhLmV4cG9ydEFzKSxcbiAgICBwcm92aWRlcnM6IG1ldGFkYXRhLnByb3ZpZGVycyB8fCBudWxsLFxuICAgIHZpZXdRdWVyaWVzOiBleHRyYWN0UXVlcmllc01ldGFkYXRhKHR5cGUsIHByb3BNZXRhZGF0YSwgaXNWaWV3UXVlcnkpLFxuICAgIGlzU3RhbmRhbG9uZTogISFtZXRhZGF0YS5zdGFuZGFsb25lLFxuICAgIGlzU2lnbmFsOiAhIW1ldGFkYXRhLnNpZ25hbHMsXG4gICAgaG9zdERpcmVjdGl2ZXM6IG1ldGFkYXRhLmhvc3REaXJlY3RpdmVzPy5tYXAoXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3RpdmUgPT4gdHlwZW9mIGRpcmVjdGl2ZSA9PT0gJ2Z1bmN0aW9uJyA/IHtkaXJlY3RpdmV9IDogZGlyZWN0aXZlKSB8fFxuICAgICAgICBudWxsXG4gIH07XG59XG5cbi8qKlxuICogQWRkcyBhIGRpcmVjdGl2ZSBkZWZpbml0aW9uIHRvIGFsbCBwYXJlbnQgY2xhc3NlcyBvZiBhIHR5cGUgdGhhdCBkb24ndCBoYXZlIGFuIEFuZ3VsYXIgZGVjb3JhdG9yLlxuICovXG5mdW5jdGlvbiBhZGREaXJlY3RpdmVEZWZUb1VuZGVjb3JhdGVkUGFyZW50cyh0eXBlOiBUeXBlPGFueT4pIHtcbiAgY29uc3Qgb2JqUHJvdG90eXBlID0gT2JqZWN0LnByb3RvdHlwZTtcbiAgbGV0IHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZih0eXBlLnByb3RvdHlwZSkuY29uc3RydWN0b3I7XG5cbiAgLy8gR28gdXAgdGhlIHByb3RvdHlwZSB1bnRpbCB3ZSBoaXQgYE9iamVjdGAuXG4gIHdoaWxlIChwYXJlbnQgJiYgcGFyZW50ICE9PSBvYmpQcm90b3R5cGUpIHtcbiAgICAvLyBTaW5jZSBpbmhlcml0YW5jZSB3b3JrcyBpZiB0aGUgY2xhc3Mgd2FzIGFubm90YXRlZCBhbHJlYWR5LCB3ZSBvbmx5IG5lZWQgdG8gYWRkXG4gICAgLy8gdGhlIGRlZiBpZiB0aGVyZSBhcmUgbm8gYW5ub3RhdGlvbnMgYW5kIHRoZSBkZWYgaGFzbid0IGJlZW4gY3JlYXRlZCBhbHJlYWR5LlxuICAgIGlmICghZ2V0RGlyZWN0aXZlRGVmKHBhcmVudCkgJiYgIWdldENvbXBvbmVudERlZihwYXJlbnQpICYmXG4gICAgICAgIHNob3VsZEFkZEFic3RyYWN0RGlyZWN0aXZlKHBhcmVudCkpIHtcbiAgICAgIGNvbXBpbGVEaXJlY3RpdmUocGFyZW50LCBudWxsKTtcbiAgICB9XG4gICAgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHBhcmVudCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY29udmVydFRvUjNRdWVyeVByZWRpY2F0ZShzZWxlY3RvcjogYW55KTogYW55fHN0cmluZ1tdIHtcbiAgcmV0dXJuIHR5cGVvZiBzZWxlY3RvciA9PT0gJ3N0cmluZycgPyBzcGxpdEJ5Q29tbWEoc2VsZWN0b3IpIDogcmVzb2x2ZUZvcndhcmRSZWYoc2VsZWN0b3IpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29udmVydFRvUjNRdWVyeU1ldGFkYXRhKHByb3BlcnR5TmFtZTogc3RyaW5nLCBhbm46IFF1ZXJ5KTogUjNRdWVyeU1ldGFkYXRhRmFjYWRlIHtcbiAgcmV0dXJuIHtcbiAgICBwcm9wZXJ0eU5hbWU6IHByb3BlcnR5TmFtZSxcbiAgICBwcmVkaWNhdGU6IGNvbnZlcnRUb1IzUXVlcnlQcmVkaWNhdGUoYW5uLnNlbGVjdG9yKSxcbiAgICBkZXNjZW5kYW50czogYW5uLmRlc2NlbmRhbnRzLFxuICAgIGZpcnN0OiBhbm4uZmlyc3QsXG4gICAgcmVhZDogYW5uLnJlYWQgPyBhbm4ucmVhZCA6IG51bGwsXG4gICAgc3RhdGljOiAhIWFubi5zdGF0aWMsXG4gICAgZW1pdERpc3RpbmN0Q2hhbmdlc09ubHk6ICEhYW5uLmVtaXREaXN0aW5jdENoYW5nZXNPbmx5LFxuICB9O1xufVxuZnVuY3Rpb24gZXh0cmFjdFF1ZXJpZXNNZXRhZGF0YShcbiAgICB0eXBlOiBUeXBlPGFueT4sIHByb3BNZXRhZGF0YToge1trZXk6IHN0cmluZ106IGFueVtdfSxcbiAgICBpc1F1ZXJ5QW5uOiAoYW5uOiBhbnkpID0+IGFubiBpcyBRdWVyeSk6IFIzUXVlcnlNZXRhZGF0YUZhY2FkZVtdIHtcbiAgY29uc3QgcXVlcmllc01ldGE6IFIzUXVlcnlNZXRhZGF0YUZhY2FkZVtdID0gW107XG4gIGZvciAoY29uc3QgZmllbGQgaW4gcHJvcE1ldGFkYXRhKSB7XG4gICAgaWYgKHByb3BNZXRhZGF0YS5oYXNPd25Qcm9wZXJ0eShmaWVsZCkpIHtcbiAgICAgIGNvbnN0IGFubm90YXRpb25zID0gcHJvcE1ldGFkYXRhW2ZpZWxkXTtcbiAgICAgIGFubm90YXRpb25zLmZvckVhY2goYW5uID0+IHtcbiAgICAgICAgaWYgKGlzUXVlcnlBbm4oYW5uKSkge1xuICAgICAgICAgIGlmICghYW5uLnNlbGVjdG9yKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgYENhbid0IGNvbnN0cnVjdCBhIHF1ZXJ5IGZvciB0aGUgcHJvcGVydHkgXCIke2ZpZWxkfVwiIG9mIGAgK1xuICAgICAgICAgICAgICAgIGBcIiR7c3RyaW5naWZ5Rm9yRXJyb3IodHlwZSl9XCIgc2luY2UgdGhlIHF1ZXJ5IHNlbGVjdG9yIHdhc24ndCBkZWZpbmVkLmApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoYW5ub3RhdGlvbnMuc29tZShpc0lucHV0QW5ub3RhdGlvbikpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQ2Fubm90IGNvbWJpbmUgQElucHV0IGRlY29yYXRvcnMgd2l0aCBxdWVyeSBkZWNvcmF0b3JzYCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHF1ZXJpZXNNZXRhLnB1c2goY29udmVydFRvUjNRdWVyeU1ldGFkYXRhKGZpZWxkLCBhbm4pKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBxdWVyaWVzTWV0YTtcbn1cblxuZnVuY3Rpb24gZXh0cmFjdEV4cG9ydEFzKGV4cG9ydEFzOiBzdHJpbmd8dW5kZWZpbmVkKTogc3RyaW5nW118bnVsbCB7XG4gIHJldHVybiBleHBvcnRBcyA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IHNwbGl0QnlDb21tYShleHBvcnRBcyk7XG59XG5cbmZ1bmN0aW9uIGlzQ29udGVudFF1ZXJ5KHZhbHVlOiBhbnkpOiB2YWx1ZSBpcyBRdWVyeSB7XG4gIGNvbnN0IG5hbWUgPSB2YWx1ZS5uZ01ldGFkYXRhTmFtZTtcbiAgcmV0dXJuIG5hbWUgPT09ICdDb250ZW50Q2hpbGQnIHx8IG5hbWUgPT09ICdDb250ZW50Q2hpbGRyZW4nO1xufVxuXG5mdW5jdGlvbiBpc1ZpZXdRdWVyeSh2YWx1ZTogYW55KTogdmFsdWUgaXMgUXVlcnkge1xuICBjb25zdCBuYW1lID0gdmFsdWUubmdNZXRhZGF0YU5hbWU7XG4gIHJldHVybiBuYW1lID09PSAnVmlld0NoaWxkJyB8fCBuYW1lID09PSAnVmlld0NoaWxkcmVuJztcbn1cblxuZnVuY3Rpb24gaXNJbnB1dEFubm90YXRpb24odmFsdWU6IGFueSk6IHZhbHVlIGlzIElucHV0IHtcbiAgcmV0dXJuIHZhbHVlLm5nTWV0YWRhdGFOYW1lID09PSAnSW5wdXQnO1xufVxuXG5mdW5jdGlvbiBzcGxpdEJ5Q29tbWEodmFsdWU6IHN0cmluZyk6IHN0cmluZ1tdIHtcbiAgcmV0dXJuIHZhbHVlLnNwbGl0KCcsJykubWFwKHBpZWNlID0+IHBpZWNlLnRyaW0oKSk7XG59XG5cbmNvbnN0IExJRkVDWUNMRV9IT09LUyA9IFtcbiAgJ25nT25DaGFuZ2VzJywgJ25nT25Jbml0JywgJ25nT25EZXN0cm95JywgJ25nRG9DaGVjaycsICduZ0FmdGVyVmlld0luaXQnLCAnbmdBZnRlclZpZXdDaGVja2VkJyxcbiAgJ25nQWZ0ZXJDb250ZW50SW5pdCcsICduZ0FmdGVyQ29udGVudENoZWNrZWQnXG5dO1xuXG5mdW5jdGlvbiBzaG91bGRBZGRBYnN0cmFjdERpcmVjdGl2ZSh0eXBlOiBUeXBlPGFueT4pOiBib29sZWFuIHtcbiAgY29uc3QgcmVmbGVjdCA9IGdldFJlZmxlY3QoKTtcblxuICBpZiAoTElGRUNZQ0xFX0hPT0tTLnNvbWUoaG9va05hbWUgPT4gcmVmbGVjdC5oYXNMaWZlY3ljbGVIb29rKHR5cGUsIGhvb2tOYW1lKSkpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGNvbnN0IHByb3BNZXRhZGF0YSA9IHJlZmxlY3QucHJvcE1ldGFkYXRhKHR5cGUpO1xuXG4gIGZvciAoY29uc3QgZmllbGQgaW4gcHJvcE1ldGFkYXRhKSB7XG4gICAgY29uc3QgYW5ub3RhdGlvbnMgPSBwcm9wTWV0YWRhdGFbZmllbGRdO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhbm5vdGF0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgY3VycmVudCA9IGFubm90YXRpb25zW2ldO1xuICAgICAgY29uc3QgbWV0YWRhdGFOYW1lID0gY3VycmVudC5uZ01ldGFkYXRhTmFtZTtcblxuICAgICAgaWYgKGlzSW5wdXRBbm5vdGF0aW9uKGN1cnJlbnQpIHx8IGlzQ29udGVudFF1ZXJ5KGN1cnJlbnQpIHx8IGlzVmlld1F1ZXJ5KGN1cnJlbnQpIHx8XG4gICAgICAgICAgbWV0YWRhdGFOYW1lID09PSAnT3V0cHV0JyB8fCBtZXRhZGF0YU5hbWUgPT09ICdIb3N0QmluZGluZycgfHxcbiAgICAgICAgICBtZXRhZGF0YU5hbWUgPT09ICdIb3N0TGlzdGVuZXInKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn1cbiJdfQ==