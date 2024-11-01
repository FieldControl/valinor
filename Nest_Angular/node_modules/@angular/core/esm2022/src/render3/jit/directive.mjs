/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { getCompilerFacade, } from '../../compiler/compiler_facade';
import { resolveForwardRef } from '../../di/forward_ref';
import { getReflect, reflectDependencies } from '../../di/jit/util';
import { componentNeedsResolution, maybeQueueResolutionOfComponentResources, } from '../../metadata/resource_loading';
import { ViewEncapsulation } from '../../metadata/view';
import { flatten } from '../../util/array_utils';
import { EMPTY_ARRAY, EMPTY_OBJ } from '../../util/empty';
import { initNgDevMode } from '../../util/ng_dev_mode';
import { getComponentDef, getDirectiveDef, getNgModuleDef, getPipeDef } from '../definition';
import { depsTracker, USE_RUNTIME_DEPS_TRACKER_FOR_JIT } from '../deps_tracker/deps_tracker';
import { NG_COMP_DEF, NG_DIR_DEF, NG_FACTORY_DEF } from '../fields';
import { stringifyForError } from '../util/stringify_utils';
import { angularCoreEnv } from './environment';
import { getJitOptions } from './jit_options';
import { flushModuleScopingQueueAsMuchAsPossible, patchComponentDefWithScope, transitiveScopesFor, } from './module';
import { isComponent, verifyStandaloneImport } from './util';
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
                const compiler = getCompilerFacade({
                    usage: 0 /* JitCompilerUsage.Decorator */,
                    kind: 'component',
                    type: type,
                });
                if (componentNeedsResolution(metadata)) {
                    const error = [`Component '${type.name}' is not resolved:`];
                    if (metadata.templateUrl) {
                        error.push(` - templateUrl: ${metadata.templateUrl}`);
                    }
                    if (metadata.styleUrls && metadata.styleUrls.length) {
                        error.push(` - styleUrls: ${JSON.stringify(metadata.styleUrls)}`);
                    }
                    if (metadata.styleUrl) {
                        error.push(` - styleUrl: ${metadata.styleUrl}`);
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
                    styles: typeof metadata.styles === 'string'
                        ? [metadata.styles]
                        : metadata.styles || EMPTY_ARRAY,
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
                    ngComponentDef = compiler.compileComponent(angularCoreEnv, templateUrl, meta);
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
        if (!USE_RUNTIME_DEPS_TRACKER_FOR_JIT) {
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
        }
        else {
            if (ngDevMode) {
                for (const rawDep of imports) {
                    verifyStandaloneImport(rawDep, type);
                }
            }
            if (!isComponent(type)) {
                return [];
            }
            const scope = depsTracker.getStandaloneComponentScope(type, imports);
            return [...scope.compilation.directives]
                .map((p) => (getComponentDef(p) || getDirectiveDef(p)))
                .filter((d) => d !== null);
        }
    };
    const pipeDefs = () => {
        if (!USE_RUNTIME_DEPS_TRACKER_FOR_JIT) {
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
        }
        else {
            if (ngDevMode) {
                for (const rawDep of imports) {
                    verifyStandaloneImport(rawDep, type);
                }
            }
            if (!isComponent(type)) {
                return [];
            }
            const scope = depsTracker.getStandaloneComponentScope(type, imports);
            return [...scope.compilation.pipes].map((p) => getPipeDef(p)).filter((d) => d !== null);
        }
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
                const compiler = getCompilerFacade({
                    usage: 0 /* JitCompilerUsage.Decorator */,
                    kind: 'directive',
                    type,
                });
                ngDirectiveDef = compiler.compileDirective(angularCoreEnv, meta.sourceMapUrl, meta.metadata);
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
                const compiler = getCompilerFacade({
                    usage: 0 /* JitCompilerUsage.Decorator */,
                    kind: 'directive',
                    type,
                });
                ngFactoryDef = compiler.compileFactory(angularCoreEnv, `ng:///${type.name}/ɵfac.js`, {
                    name: meta.metadata.name,
                    type: meta.metadata.type,
                    typeArgumentCount: 0,
                    deps: reflectDependencies(type),
                    target: compiler.FactoryTarget.Directive,
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
        hostDirectives: metadata.hostDirectives?.map((directive) => typeof directive === 'function' ? { directive } : directive) || null,
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
        if (!getDirectiveDef(parent) &&
            !getComponentDef(parent) &&
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
        isSignal: !!ann.isSignal,
    };
}
function extractQueriesMetadata(type, propMetadata, isQueryAnn) {
    const queriesMeta = [];
    for (const field in propMetadata) {
        if (propMetadata.hasOwnProperty(field)) {
            const annotations = propMetadata[field];
            annotations.forEach((ann) => {
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
    return value.split(',').map((piece) => piece.trim());
}
const LIFECYCLE_HOOKS = [
    'ngOnChanges',
    'ngOnInit',
    'ngOnDestroy',
    'ngDoCheck',
    'ngAfterViewInit',
    'ngAfterViewChecked',
    'ngAfterContentInit',
    'ngAfterContentChecked',
];
function shouldAddAbstractDirective(type) {
    const reflect = getReflect();
    if (LIFECYCLE_HOOKS.some((hookName) => reflect.hasLifecycleHook(type, hookName))) {
        return true;
    }
    const propMetadata = reflect.propMetadata(type);
    for (const field in propMetadata) {
        const annotations = propMetadata[field];
        for (let i = 0; i < annotations.length; i++) {
            const current = annotations[i];
            const metadataName = current.ngMetadataName;
            if (isInputAnnotation(current) ||
                isContentQuery(current) ||
                isViewQuery(current) ||
                metadataName === 'Output' ||
                metadataName === 'HostBinding' ||
                metadataName === 'HostListener') {
                return true;
            }
        }
    }
    return false;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlyZWN0aXZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvcmVuZGVyMy9qaXQvZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFDTCxpQkFBaUIsR0FHbEIsTUFBTSxnQ0FBZ0MsQ0FBQztBQUt4QyxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUN2RCxPQUFPLEVBQUMsVUFBVSxFQUFFLG1CQUFtQixFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFJbEUsT0FBTyxFQUNMLHdCQUF3QixFQUN4Qix3Q0FBd0MsR0FDekMsTUFBTSxpQ0FBaUMsQ0FBQztBQUN6QyxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUN0RCxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFDL0MsT0FBTyxFQUFDLFdBQVcsRUFBRSxTQUFTLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUN4RCxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFDckQsT0FBTyxFQUFDLGVBQWUsRUFBRSxlQUFlLEVBQUUsY0FBYyxFQUFFLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUMzRixPQUFPLEVBQUMsV0FBVyxFQUFFLGdDQUFnQyxFQUFDLE1BQU0sOEJBQThCLENBQUM7QUFDM0YsT0FBTyxFQUFDLFdBQVcsRUFBRSxVQUFVLEVBQUUsY0FBYyxFQUFDLE1BQU0sV0FBVyxDQUFDO0FBRWxFLE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLHlCQUF5QixDQUFDO0FBRTFELE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDN0MsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUM1QyxPQUFPLEVBQ0wsdUNBQXVDLEVBQ3ZD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QUMvQixNQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDO1lBRTVDLElBQ0UsaUJBQWlCLENBQUMsT0FBTyxDQUFDO2dCQUMxQixjQUFjLENBQUMsT0FBTyxDQUFDO2dCQUN2QixXQUFXLENBQUMsT0FBTyxDQUFDO2dCQUNwQixZQUFZLEtBQUssUUFBUTtnQkFDekIsWUFBWSxLQUFLLGFBQWE7Z0JBQzlCLFlBQVksS0FBSyxjQUFjLEVBQy9CLENBQUM7Z0JBQ0QsT0FBTyxJQUFJLENBQUM7WUFDZCxDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7SUFFRCxPQUFPLEtBQUssQ0FBQztBQUNmLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIGdldENvbXBpbGVyRmFjYWRlLFxuICBKaXRDb21waWxlclVzYWdlLFxuICBSM0RpcmVjdGl2ZU1ldGFkYXRhRmFjYWRlLFxufSBmcm9tICcuLi8uLi9jb21waWxlci9jb21waWxlcl9mYWNhZGUnO1xuaW1wb3J0IHtcbiAgUjNDb21wb25lbnRNZXRhZGF0YUZhY2FkZSxcbiAgUjNRdWVyeU1ldGFkYXRhRmFjYWRlLFxufSBmcm9tICcuLi8uLi9jb21waWxlci9jb21waWxlcl9mYWNhZGVfaW50ZXJmYWNlJztcbmltcG9ydCB7cmVzb2x2ZUZvcndhcmRSZWZ9IGZyb20gJy4uLy4uL2RpL2ZvcndhcmRfcmVmJztcbmltcG9ydCB7Z2V0UmVmbGVjdCwgcmVmbGVjdERlcGVuZGVuY2llc30gZnJvbSAnLi4vLi4vZGkvaml0L3V0aWwnO1xuaW1wb3J0IHtUeXBlfSBmcm9tICcuLi8uLi9pbnRlcmZhY2UvdHlwZSc7XG5pbXBvcnQge1F1ZXJ5fSBmcm9tICcuLi8uLi9tZXRhZGF0YS9kaSc7XG5pbXBvcnQge0NvbXBvbmVudCwgRGlyZWN0aXZlLCBJbnB1dH0gZnJvbSAnLi4vLi4vbWV0YWRhdGEvZGlyZWN0aXZlcyc7XG5pbXBvcnQge1xuICBjb21wb25lbnROZWVkc1Jlc29sdXRpb24sXG4gIG1heWJlUXVldWVSZXNvbHV0aW9uT2ZDb21wb25lbnRSZXNvdXJjZXMsXG59IGZyb20gJy4uLy4uL21ldGFkYXRhL3Jlc291cmNlX2xvYWRpbmcnO1xuaW1wb3J0IHtWaWV3RW5jYXBzdWxhdGlvbn0gZnJvbSAnLi4vLi4vbWV0YWRhdGEvdmlldyc7XG5pbXBvcnQge2ZsYXR0ZW59IGZyb20gJy4uLy4uL3V0aWwvYXJyYXlfdXRpbHMnO1xuaW1wb3J0IHtFTVBUWV9BUlJBWSwgRU1QVFlfT0JKfSBmcm9tICcuLi8uLi91dGlsL2VtcHR5JztcbmltcG9ydCB7aW5pdE5nRGV2TW9kZX0gZnJvbSAnLi4vLi4vdXRpbC9uZ19kZXZfbW9kZSc7XG5pbXBvcnQge2dldENvbXBvbmVudERlZiwgZ2V0RGlyZWN0aXZlRGVmLCBnZXROZ01vZHVsZURlZiwgZ2V0UGlwZURlZn0gZnJvbSAnLi4vZGVmaW5pdGlvbic7XG5pbXBvcnQge2RlcHNUcmFja2VyLCBVU0VfUlVOVElNRV9ERVBTX1RSQUNLRVJfRk9SX0pJVH0gZnJvbSAnLi4vZGVwc190cmFja2VyL2RlcHNfdHJhY2tlcic7XG5pbXBvcnQge05HX0NPTVBfREVGLCBOR19ESVJfREVGLCBOR19GQUNUT1JZX0RFRn0gZnJvbSAnLi4vZmllbGRzJztcbmltcG9ydCB7Q29tcG9uZW50RGVmLCBDb21wb25lbnRUeXBlLCBEaXJlY3RpdmVEZWZMaXN0LCBQaXBlRGVmTGlzdH0gZnJvbSAnLi4vaW50ZXJmYWNlcy9kZWZpbml0aW9uJztcbmltcG9ydCB7c3RyaW5naWZ5Rm9yRXJyb3J9IGZyb20gJy4uL3V0aWwvc3RyaW5naWZ5X3V0aWxzJztcblxuaW1wb3J0IHthbmd1bGFyQ29yZUVudn0gZnJvbSAnLi9lbnZpcm9ubWVudCc7XG5pbXBvcnQge2dldEppdE9wdGlvbnN9IGZyb20gJy4vaml0X29wdGlvbnMnO1xuaW1wb3J0IHtcbiAgZmx1c2hNb2R1bGVTY29waW5nUXVldWVBc011Y2hBc1Bvc3NpYmxlLFxuICBwYXRjaENvbXBvbmVudERlZldpdGhTY29wZSxcbiAgdHJhbnNpdGl2ZVNjb3Blc0Zvcixcbn0gZnJvbSAnLi9tb2R1bGUnO1xuaW1wb3J0IHtpc0NvbXBvbmVudCwgdmVyaWZ5U3RhbmRhbG9uZUltcG9ydH0gZnJvbSAnLi91dGlsJztcblxuLyoqXG4gKiBLZWVwIHRyYWNrIG9mIHRoZSBjb21waWxhdGlvbiBkZXB0aCB0byBhdm9pZCByZWVudHJhbmN5IGlzc3VlcyBkdXJpbmcgSklUIGNvbXBpbGF0aW9uLiBUaGlzXG4gKiBtYXR0ZXJzIGluIHRoZSBmb2xsb3dpbmcgc2NlbmFyaW86XG4gKlxuICogQ29uc2lkZXIgYSBjb21wb25lbnQgJ0EnIHRoYXQgZXh0ZW5kcyBjb21wb25lbnQgJ0InLCBib3RoIGRlY2xhcmVkIGluIG1vZHVsZSAnTScuIER1cmluZ1xuICogdGhlIGNvbXBpbGF0aW9uIG9mICdBJyB0aGUgZGVmaW5pdGlvbiBvZiAnQicgaXMgcmVxdWVzdGVkIHRvIGNhcHR1cmUgdGhlIGluaGVyaXRhbmNlIGNoYWluLFxuICogcG90ZW50aWFsbHkgdHJpZ2dlcmluZyBjb21waWxhdGlvbiBvZiAnQicuIElmIHRoaXMgbmVzdGVkIGNvbXBpbGF0aW9uIHdlcmUgdG8gdHJpZ2dlclxuICogYGZsdXNoTW9kdWxlU2NvcGluZ1F1ZXVlQXNNdWNoQXNQb3NzaWJsZWAgaXQgbWF5IGhhcHBlbiB0aGF0IG1vZHVsZSAnTScgaXMgc3RpbGwgcGVuZGluZyBpbiB0aGVcbiAqIHF1ZXVlLCByZXN1bHRpbmcgaW4gJ0EnIGFuZCAnQicgdG8gYmUgcGF0Y2hlZCB3aXRoIHRoZSBOZ01vZHVsZSBzY29wZS4gQXMgdGhlIGNvbXBpbGF0aW9uIG9mXG4gKiAnQScgaXMgc3RpbGwgaW4gcHJvZ3Jlc3MsIHRoaXMgd291bGQgaW50cm9kdWNlIGEgY2lyY3VsYXIgZGVwZW5kZW5jeSBvbiBpdHMgY29tcGlsYXRpb24uIFRvIGF2b2lkXG4gKiB0aGlzIGlzc3VlLCB0aGUgbW9kdWxlIHNjb3BlIHF1ZXVlIGlzIG9ubHkgZmx1c2hlZCBmb3IgY29tcGlsYXRpb25zIGF0IHRoZSBkZXB0aCAwLCB0byBlbnN1cmVcbiAqIGFsbCBjb21waWxhdGlvbnMgaGF2ZSBmaW5pc2hlZC5cbiAqL1xubGV0IGNvbXBpbGF0aW9uRGVwdGggPSAwO1xuXG4vKipcbiAqIENvbXBpbGUgYW4gQW5ndWxhciBjb21wb25lbnQgYWNjb3JkaW5nIHRvIGl0cyBkZWNvcmF0b3IgbWV0YWRhdGEsIGFuZCBwYXRjaCB0aGUgcmVzdWx0aW5nXG4gKiBjb21wb25lbnQgZGVmICjJtWNtcCkgb250byB0aGUgY29tcG9uZW50IHR5cGUuXG4gKlxuICogQ29tcGlsYXRpb24gbWF5IGJlIGFzeW5jaHJvbm91cyAoZHVlIHRvIHRoZSBuZWVkIHRvIHJlc29sdmUgVVJMcyBmb3IgdGhlIGNvbXBvbmVudCB0ZW1wbGF0ZSBvclxuICogb3RoZXIgcmVzb3VyY2VzLCBmb3IgZXhhbXBsZSkuIEluIHRoZSBldmVudCB0aGF0IGNvbXBpbGF0aW9uIGlzIG5vdCBpbW1lZGlhdGUsIGBjb21waWxlQ29tcG9uZW50YFxuICogd2lsbCBlbnF1ZXVlIHJlc291cmNlIHJlc29sdXRpb24gaW50byBhIGdsb2JhbCBxdWV1ZSBhbmQgd2lsbCBmYWlsIHRvIHJldHVybiB0aGUgYMm1Y21wYFxuICogdW50aWwgdGhlIGdsb2JhbCBxdWV1ZSBoYXMgYmVlbiByZXNvbHZlZCB3aXRoIGEgY2FsbCB0byBgcmVzb2x2ZUNvbXBvbmVudFJlc291cmNlc2AuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb21waWxlQ29tcG9uZW50KHR5cGU6IFR5cGU8YW55PiwgbWV0YWRhdGE6IENvbXBvbmVudCk6IHZvaWQge1xuICAvLyBJbml0aWFsaXplIG5nRGV2TW9kZS4gVGhpcyBtdXN0IGJlIHRoZSBmaXJzdCBzdGF0ZW1lbnQgaW4gY29tcGlsZUNvbXBvbmVudC5cbiAgLy8gU2VlIHRoZSBgaW5pdE5nRGV2TW9kZWAgZG9jc3RyaW5nIGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSAmJiBpbml0TmdEZXZNb2RlKCk7XG5cbiAgbGV0IG5nQ29tcG9uZW50RGVmOiBDb21wb25lbnREZWY8dW5rbm93bj4gfCBudWxsID0gbnVsbDtcblxuICAvLyBNZXRhZGF0YSBtYXkgaGF2ZSByZXNvdXJjZXMgd2hpY2ggbmVlZCB0byBiZSByZXNvbHZlZC5cbiAgbWF5YmVRdWV1ZVJlc29sdXRpb25PZkNvbXBvbmVudFJlc291cmNlcyh0eXBlLCBtZXRhZGF0YSk7XG5cbiAgLy8gTm90ZSB0aGF0IHdlJ3JlIHVzaW5nIHRoZSBzYW1lIGZ1bmN0aW9uIGFzIGBEaXJlY3RpdmVgLCBiZWNhdXNlIHRoYXQncyBvbmx5IHN1YnNldCBvZiBtZXRhZGF0YVxuICAvLyB0aGF0IHdlIG5lZWQgdG8gY3JlYXRlIHRoZSBuZ0ZhY3RvcnlEZWYuIFdlJ3JlIGF2b2lkaW5nIHVzaW5nIHRoZSBjb21wb25lbnQgbWV0YWRhdGFcbiAgLy8gYmVjYXVzZSB3ZSdkIGhhdmUgdG8gcmVzb2x2ZSB0aGUgYXN5bmNocm9ub3VzIHRlbXBsYXRlcy5cbiAgYWRkRGlyZWN0aXZlRmFjdG9yeURlZih0eXBlLCBtZXRhZGF0YSk7XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHR5cGUsIE5HX0NPTVBfREVGLCB7XG4gICAgZ2V0OiAoKSA9PiB7XG4gICAgICBpZiAobmdDb21wb25lbnREZWYgPT09IG51bGwpIHtcbiAgICAgICAgY29uc3QgY29tcGlsZXIgPSBnZXRDb21waWxlckZhY2FkZSh7XG4gICAgICAgICAgdXNhZ2U6IEppdENvbXBpbGVyVXNhZ2UuRGVjb3JhdG9yLFxuICAgICAgICAgIGtpbmQ6ICdjb21wb25lbnQnLFxuICAgICAgICAgIHR5cGU6IHR5cGUsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChjb21wb25lbnROZWVkc1Jlc29sdXRpb24obWV0YWRhdGEpKSB7XG4gICAgICAgICAgY29uc3QgZXJyb3IgPSBbYENvbXBvbmVudCAnJHt0eXBlLm5hbWV9JyBpcyBub3QgcmVzb2x2ZWQ6YF07XG4gICAgICAgICAgaWYgKG1ldGFkYXRhLnRlbXBsYXRlVXJsKSB7XG4gICAgICAgICAgICBlcnJvci5wdXNoKGAgLSB0ZW1wbGF0ZVVybDogJHttZXRhZGF0YS50ZW1wbGF0ZVVybH1gKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKG1ldGFkYXRhLnN0eWxlVXJscyAmJiBtZXRhZGF0YS5zdHlsZVVybHMubGVuZ3RoKSB7XG4gICAgICAgICAgICBlcnJvci5wdXNoKGAgLSBzdHlsZVVybHM6ICR7SlNPTi5zdHJpbmdpZnkobWV0YWRhdGEuc3R5bGVVcmxzKX1gKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKG1ldGFkYXRhLnN0eWxlVXJsKSB7XG4gICAgICAgICAgICBlcnJvci5wdXNoKGAgLSBzdHlsZVVybDogJHttZXRhZGF0YS5zdHlsZVVybH1gKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZXJyb3IucHVzaChgRGlkIHlvdSBydW4gYW5kIHdhaXQgZm9yICdyZXNvbHZlQ29tcG9uZW50UmVzb3VyY2VzKCknP2ApO1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvci5qb2luKCdcXG4nKSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUaGlzIGNvbnN0IHdhcyBjYWxsZWQgYGppdE9wdGlvbnNgIHByZXZpb3VzbHkgYnV0IGhhZCB0byBiZSByZW5hbWVkIHRvIGBvcHRpb25zYCBiZWNhdXNlXG4gICAgICAgIC8vIG9mIGEgYnVnIHdpdGggVGVyc2VyIHRoYXQgY2F1c2VkIG9wdGltaXplZCBKSVQgYnVpbGRzIHRvIHRocm93IGEgYFJlZmVyZW5jZUVycm9yYC5cbiAgICAgICAgLy8gVGhpcyBidWcgd2FzIGludmVzdGlnYXRlZCBpbiBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyLWNsaS9pc3N1ZXMvMTcyNjQuXG4gICAgICAgIC8vIFdlIHNob3VsZCBub3QgcmVuYW1lIGl0IGJhY2sgdW50aWwgaHR0cHM6Ly9naXRodWIuY29tL3RlcnNlci90ZXJzZXIvaXNzdWVzLzYxNSBpcyBmaXhlZC5cbiAgICAgICAgY29uc3Qgb3B0aW9ucyA9IGdldEppdE9wdGlvbnMoKTtcbiAgICAgICAgbGV0IHByZXNlcnZlV2hpdGVzcGFjZXMgPSBtZXRhZGF0YS5wcmVzZXJ2ZVdoaXRlc3BhY2VzO1xuICAgICAgICBpZiAocHJlc2VydmVXaGl0ZXNwYWNlcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgaWYgKG9wdGlvbnMgIT09IG51bGwgJiYgb3B0aW9ucy5wcmVzZXJ2ZVdoaXRlc3BhY2VzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHByZXNlcnZlV2hpdGVzcGFjZXMgPSBvcHRpb25zLnByZXNlcnZlV2hpdGVzcGFjZXM7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHByZXNlcnZlV2hpdGVzcGFjZXMgPSBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGVuY2Fwc3VsYXRpb24gPSBtZXRhZGF0YS5lbmNhcHN1bGF0aW9uO1xuICAgICAgICBpZiAoZW5jYXBzdWxhdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgaWYgKG9wdGlvbnMgIT09IG51bGwgJiYgb3B0aW9ucy5kZWZhdWx0RW5jYXBzdWxhdGlvbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBlbmNhcHN1bGF0aW9uID0gb3B0aW9ucy5kZWZhdWx0RW5jYXBzdWxhdGlvbjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZW5jYXBzdWxhdGlvbiA9IFZpZXdFbmNhcHN1bGF0aW9uLkVtdWxhdGVkO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlVXJsID0gbWV0YWRhdGEudGVtcGxhdGVVcmwgfHwgYG5nOi8vLyR7dHlwZS5uYW1lfS90ZW1wbGF0ZS5odG1sYDtcbiAgICAgICAgY29uc3QgbWV0YTogUjNDb21wb25lbnRNZXRhZGF0YUZhY2FkZSA9IHtcbiAgICAgICAgICAuLi5kaXJlY3RpdmVNZXRhZGF0YSh0eXBlLCBtZXRhZGF0YSksXG4gICAgICAgICAgdHlwZVNvdXJjZVNwYW46IGNvbXBpbGVyLmNyZWF0ZVBhcnNlU291cmNlU3BhbignQ29tcG9uZW50JywgdHlwZS5uYW1lLCB0ZW1wbGF0ZVVybCksXG4gICAgICAgICAgdGVtcGxhdGU6IG1ldGFkYXRhLnRlbXBsYXRlIHx8ICcnLFxuICAgICAgICAgIHByZXNlcnZlV2hpdGVzcGFjZXMsXG4gICAgICAgICAgc3R5bGVzOlxuICAgICAgICAgICAgdHlwZW9mIG1ldGFkYXRhLnN0eWxlcyA9PT0gJ3N0cmluZydcbiAgICAgICAgICAgICAgPyBbbWV0YWRhdGEuc3R5bGVzXVxuICAgICAgICAgICAgICA6IG1ldGFkYXRhLnN0eWxlcyB8fCBFTVBUWV9BUlJBWSxcbiAgICAgICAgICBhbmltYXRpb25zOiBtZXRhZGF0YS5hbmltYXRpb25zLFxuICAgICAgICAgIC8vIEpJVCBjb21wb25lbnRzIGFyZSBhbHdheXMgY29tcGlsZWQgYWdhaW5zdCBhbiBlbXB0eSBzZXQgb2YgYGRlY2xhcmF0aW9uc2AuIEluc3RlYWQsIHRoZVxuICAgICAgICAgIC8vIGBkaXJlY3RpdmVEZWZzYCBhbmQgYHBpcGVEZWZzYCBhcmUgdXBkYXRlZCBhdCBhIGxhdGVyIHBvaW50OlxuICAgICAgICAgIC8vICAqIGZvciBOZ01vZHVsZS1iYXNlZCBjb21wb25lbnRzLCB0aGV5J3JlIHNldCB3aGVuIHRoZSBOZ01vZHVsZSB3aGljaCBkZWNsYXJlcyB0aGVcbiAgICAgICAgICAvLyAgICBjb21wb25lbnQgcmVzb2x2ZXMgaW4gdGhlIG1vZHVsZSBzY29waW5nIHF1ZXVlXG4gICAgICAgICAgLy8gICogZm9yIHN0YW5kYWxvbmUgY29tcG9uZW50cywgdGhleSdyZSBzZXQganVzdCBiZWxvdywgYWZ0ZXIgYGNvbXBpbGVDb21wb25lbnRgLlxuICAgICAgICAgIGRlY2xhcmF0aW9uczogW10sXG4gICAgICAgICAgY2hhbmdlRGV0ZWN0aW9uOiBtZXRhZGF0YS5jaGFuZ2VEZXRlY3Rpb24sXG4gICAgICAgICAgZW5jYXBzdWxhdGlvbixcbiAgICAgICAgICBpbnRlcnBvbGF0aW9uOiBtZXRhZGF0YS5pbnRlcnBvbGF0aW9uLFxuICAgICAgICAgIHZpZXdQcm92aWRlcnM6IG1ldGFkYXRhLnZpZXdQcm92aWRlcnMgfHwgbnVsbCxcbiAgICAgICAgfTtcblxuICAgICAgICBjb21waWxhdGlvbkRlcHRoKys7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKG1ldGEudXNlc0luaGVyaXRhbmNlKSB7XG4gICAgICAgICAgICBhZGREaXJlY3RpdmVEZWZUb1VuZGVjb3JhdGVkUGFyZW50cyh0eXBlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgbmdDb21wb25lbnREZWYgPSBjb21waWxlci5jb21waWxlQ29tcG9uZW50KFxuICAgICAgICAgICAgYW5ndWxhckNvcmVFbnYsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybCxcbiAgICAgICAgICAgIG1ldGEsXG4gICAgICAgICAgKSBhcyBDb21wb25lbnREZWY8dW5rbm93bj47XG5cbiAgICAgICAgICBpZiAobWV0YWRhdGEuc3RhbmRhbG9uZSkge1xuICAgICAgICAgICAgLy8gUGF0Y2ggdGhlIGNvbXBvbmVudCBkZWZpbml0aW9uIGZvciBzdGFuZGFsb25lIGNvbXBvbmVudHMgd2l0aCBgZGlyZWN0aXZlRGVmc2AgYW5kXG4gICAgICAgICAgICAvLyBgcGlwZURlZnNgIGZ1bmN0aW9ucyB3aGljaCBsYXppbHkgY29tcHV0ZSB0aGUgZGlyZWN0aXZlcy9waXBlcyBhdmFpbGFibGUgaW4gdGhlXG4gICAgICAgICAgICAvLyBzdGFuZGFsb25lIGNvbXBvbmVudC4gQWxzbyBzZXQgYGRlcGVuZGVuY2llc2AgdG8gdGhlIGxhemlseSByZXNvbHZlZCBsaXN0IG9mIGltcG9ydHMuXG4gICAgICAgICAgICBjb25zdCBpbXBvcnRzOiBUeXBlPGFueT5bXSA9IGZsYXR0ZW4obWV0YWRhdGEuaW1wb3J0cyB8fCBFTVBUWV9BUlJBWSk7XG4gICAgICAgICAgICBjb25zdCB7ZGlyZWN0aXZlRGVmcywgcGlwZURlZnN9ID0gZ2V0U3RhbmRhbG9uZURlZkZ1bmN0aW9ucyh0eXBlLCBpbXBvcnRzKTtcbiAgICAgICAgICAgIG5nQ29tcG9uZW50RGVmLmRpcmVjdGl2ZURlZnMgPSBkaXJlY3RpdmVEZWZzO1xuICAgICAgICAgICAgbmdDb21wb25lbnREZWYucGlwZURlZnMgPSBwaXBlRGVmcztcbiAgICAgICAgICAgIG5nQ29tcG9uZW50RGVmLmRlcGVuZGVuY2llcyA9ICgpID0+IGltcG9ydHMubWFwKHJlc29sdmVGb3J3YXJkUmVmKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgLy8gRW5zdXJlIHRoYXQgdGhlIGNvbXBpbGF0aW9uIGRlcHRoIGlzIGRlY3JlbWVudGVkIGV2ZW4gd2hlbiB0aGUgY29tcGlsYXRpb24gZmFpbGVkLlxuICAgICAgICAgIGNvbXBpbGF0aW9uRGVwdGgtLTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjb21waWxhdGlvbkRlcHRoID09PSAwKSB7XG4gICAgICAgICAgLy8gV2hlbiBOZ01vZHVsZSBkZWNvcmF0b3IgZXhlY3V0ZWQsIHdlIGVucXVldWVkIHRoZSBtb2R1bGUgZGVmaW5pdGlvbiBzdWNoIHRoYXRcbiAgICAgICAgICAvLyBpdCB3b3VsZCBvbmx5IGRlcXVldWUgYW5kIGFkZCBpdHNlbGYgYXMgbW9kdWxlIHNjb3BlIHRvIGFsbCBvZiBpdHMgZGVjbGFyYXRpb25zLFxuICAgICAgICAgIC8vIGJ1dCBvbmx5IGlmICBpZiBhbGwgb2YgaXRzIGRlY2xhcmF0aW9ucyBoYWQgcmVzb2x2ZWQuIFRoaXMgY2FsbCBydW5zIHRoZSBjaGVja1xuICAgICAgICAgIC8vIHRvIHNlZSBpZiBhbnkgbW9kdWxlcyB0aGF0IGFyZSBpbiB0aGUgcXVldWUgY2FuIGJlIGRlcXVldWVkIGFuZCBhZGQgc2NvcGUgdG9cbiAgICAgICAgICAvLyB0aGVpciBkZWNsYXJhdGlvbnMuXG4gICAgICAgICAgZmx1c2hNb2R1bGVTY29waW5nUXVldWVBc011Y2hBc1Bvc3NpYmxlKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiBjb21wb25lbnQgY29tcGlsYXRpb24gaXMgYXN5bmMsIHRoZW4gdGhlIEBOZ01vZHVsZSBhbm5vdGF0aW9uIHdoaWNoIGRlY2xhcmVzIHRoZVxuICAgICAgICAvLyBjb21wb25lbnQgbWF5IGV4ZWN1dGUgYW5kIHNldCBhbiBuZ1NlbGVjdG9yU2NvcGUgcHJvcGVydHkgb24gdGhlIGNvbXBvbmVudCB0eXBlLiBUaGlzXG4gICAgICAgIC8vIGFsbG93cyB0aGUgY29tcG9uZW50IHRvIHBhdGNoIGl0c2VsZiB3aXRoIGRpcmVjdGl2ZURlZnMgZnJvbSB0aGUgbW9kdWxlIGFmdGVyIGl0XG4gICAgICAgIC8vIGZpbmlzaGVzIGNvbXBpbGluZy5cbiAgICAgICAgaWYgKGhhc1NlbGVjdG9yU2NvcGUodHlwZSkpIHtcbiAgICAgICAgICBjb25zdCBzY29wZXMgPSB0cmFuc2l0aXZlU2NvcGVzRm9yKHR5cGUubmdTZWxlY3RvclNjb3BlKTtcbiAgICAgICAgICBwYXRjaENvbXBvbmVudERlZldpdGhTY29wZShuZ0NvbXBvbmVudERlZiwgc2NvcGVzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChtZXRhZGF0YS5zY2hlbWFzKSB7XG4gICAgICAgICAgaWYgKG1ldGFkYXRhLnN0YW5kYWxvbmUpIHtcbiAgICAgICAgICAgIG5nQ29tcG9uZW50RGVmLnNjaGVtYXMgPSBtZXRhZGF0YS5zY2hlbWFzO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgIGBUaGUgJ3NjaGVtYXMnIHdhcyBzcGVjaWZpZWQgZm9yIHRoZSAke3N0cmluZ2lmeUZvckVycm9yKFxuICAgICAgICAgICAgICAgIHR5cGUsXG4gICAgICAgICAgICAgICl9IGJ1dCBpcyBvbmx5IHZhbGlkIG9uIGEgY29tcG9uZW50IHRoYXQgaXMgc3RhbmRhbG9uZS5gLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAobWV0YWRhdGEuc3RhbmRhbG9uZSkge1xuICAgICAgICAgIG5nQ29tcG9uZW50RGVmLnNjaGVtYXMgPSBbXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG5nQ29tcG9uZW50RGVmO1xuICAgIH0sXG4gICAgLy8gTWFrZSB0aGUgcHJvcGVydHkgY29uZmlndXJhYmxlIGluIGRldiBtb2RlIHRvIGFsbG93IG92ZXJyaWRpbmcgaW4gdGVzdHNcbiAgICBjb25maWd1cmFibGU6ICEhbmdEZXZNb2RlLFxuICB9KTtcbn1cblxuLyoqXG4gKiBCdWlsZCBtZW1vaXplZCBgZGlyZWN0aXZlRGVmc2AgYW5kIGBwaXBlRGVmc2AgZnVuY3Rpb25zIGZvciB0aGUgY29tcG9uZW50IGRlZmluaXRpb24gb2YgYVxuICogc3RhbmRhbG9uZSBjb21wb25lbnQsIHdoaWNoIHByb2Nlc3MgYGltcG9ydHNgIGFuZCBmaWx0ZXIgb3V0IGRpcmVjdGl2ZXMgYW5kIHBpcGVzLiBUaGUgdXNlIG9mXG4gKiBtZW1vaXplZCBmdW5jdGlvbnMgaGVyZSBhbGxvd3MgZm9yIHRoZSBkZWxheWVkIHJlc29sdXRpb24gb2YgYW55IGBmb3J3YXJkUmVmYHMgcHJlc2VudCBpbiB0aGVcbiAqIGNvbXBvbmVudCdzIGBpbXBvcnRzYC5cbiAqL1xuZnVuY3Rpb24gZ2V0U3RhbmRhbG9uZURlZkZ1bmN0aW9ucyhcbiAgdHlwZTogVHlwZTxhbnk+LFxuICBpbXBvcnRzOiBUeXBlPGFueT5bXSxcbik6IHtcbiAgZGlyZWN0aXZlRGVmczogKCkgPT4gRGlyZWN0aXZlRGVmTGlzdDtcbiAgcGlwZURlZnM6ICgpID0+IFBpcGVEZWZMaXN0O1xufSB7XG4gIGxldCBjYWNoZWREaXJlY3RpdmVEZWZzOiBEaXJlY3RpdmVEZWZMaXN0IHwgbnVsbCA9IG51bGw7XG4gIGxldCBjYWNoZWRQaXBlRGVmczogUGlwZURlZkxpc3QgfCBudWxsID0gbnVsbDtcbiAgY29uc3QgZGlyZWN0aXZlRGVmcyA9ICgpID0+IHtcbiAgICBpZiAoIVVTRV9SVU5USU1FX0RFUFNfVFJBQ0tFUl9GT1JfSklUKSB7XG4gICAgICBpZiAoY2FjaGVkRGlyZWN0aXZlRGVmcyA9PT0gbnVsbCkge1xuICAgICAgICAvLyBTdGFuZGFsb25lIGNvbXBvbmVudHMgYXJlIGFsd2F5cyBhYmxlIHRvIHNlbGYtcmVmZXJlbmNlLCBzbyBpbmNsdWRlIHRoZSBjb21wb25lbnQncyBvd25cbiAgICAgICAgLy8gZGVmaW5pdGlvbiBpbiBpdHMgYGRpcmVjdGl2ZURlZnNgLlxuICAgICAgICBjYWNoZWREaXJlY3RpdmVEZWZzID0gW2dldENvbXBvbmVudERlZih0eXBlKSFdO1xuICAgICAgICBjb25zdCBzZWVuID0gbmV3IFNldDxUeXBlPHVua25vd24+PihbdHlwZV0pO1xuXG4gICAgICAgIGZvciAoY29uc3QgcmF3RGVwIG9mIGltcG9ydHMpIHtcbiAgICAgICAgICBuZ0Rldk1vZGUgJiYgdmVyaWZ5U3RhbmRhbG9uZUltcG9ydChyYXdEZXAsIHR5cGUpO1xuXG4gICAgICAgICAgY29uc3QgZGVwID0gcmVzb2x2ZUZvcndhcmRSZWYocmF3RGVwKTtcbiAgICAgICAgICBpZiAoc2Vlbi5oYXMoZGVwKSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIHNlZW4uYWRkKGRlcCk7XG5cbiAgICAgICAgICBpZiAoISFnZXROZ01vZHVsZURlZihkZXApKSB7XG4gICAgICAgICAgICBjb25zdCBzY29wZSA9IHRyYW5zaXRpdmVTY29wZXNGb3IoZGVwKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgZGlyIG9mIHNjb3BlLmV4cG9ydGVkLmRpcmVjdGl2ZXMpIHtcbiAgICAgICAgICAgICAgY29uc3QgZGVmID0gZ2V0Q29tcG9uZW50RGVmKGRpcikgfHwgZ2V0RGlyZWN0aXZlRGVmKGRpcik7XG4gICAgICAgICAgICAgIGlmIChkZWYgJiYgIXNlZW4uaGFzKGRpcikpIHtcbiAgICAgICAgICAgICAgICBzZWVuLmFkZChkaXIpO1xuICAgICAgICAgICAgICAgIGNhY2hlZERpcmVjdGl2ZURlZnMucHVzaChkZWYpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGRlZiA9IGdldENvbXBvbmVudERlZihkZXApIHx8IGdldERpcmVjdGl2ZURlZihkZXApO1xuICAgICAgICAgICAgaWYgKGRlZikge1xuICAgICAgICAgICAgICBjYWNoZWREaXJlY3RpdmVEZWZzLnB1c2goZGVmKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBjYWNoZWREaXJlY3RpdmVEZWZzO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAobmdEZXZNb2RlKSB7XG4gICAgICAgIGZvciAoY29uc3QgcmF3RGVwIG9mIGltcG9ydHMpIHtcbiAgICAgICAgICB2ZXJpZnlTdGFuZGFsb25lSW1wb3J0KHJhd0RlcCwgdHlwZSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKCFpc0NvbXBvbmVudCh0eXBlKSkge1xuICAgICAgICByZXR1cm4gW107XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHNjb3BlID0gZGVwc1RyYWNrZXIuZ2V0U3RhbmRhbG9uZUNvbXBvbmVudFNjb3BlKHR5cGUsIGltcG9ydHMpO1xuXG4gICAgICByZXR1cm4gWy4uLnNjb3BlLmNvbXBpbGF0aW9uLmRpcmVjdGl2ZXNdXG4gICAgICAgIC5tYXAoKHApID0+IChnZXRDb21wb25lbnREZWYocCkgfHwgZ2V0RGlyZWN0aXZlRGVmKHApKSEpXG4gICAgICAgIC5maWx0ZXIoKGQpID0+IGQgIT09IG51bGwpO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCBwaXBlRGVmcyA9ICgpID0+IHtcbiAgICBpZiAoIVVTRV9SVU5USU1FX0RFUFNfVFJBQ0tFUl9GT1JfSklUKSB7XG4gICAgICBpZiAoY2FjaGVkUGlwZURlZnMgPT09IG51bGwpIHtcbiAgICAgICAgY2FjaGVkUGlwZURlZnMgPSBbXTtcbiAgICAgICAgY29uc3Qgc2VlbiA9IG5ldyBTZXQ8VHlwZTx1bmtub3duPj4oKTtcblxuICAgICAgICBmb3IgKGNvbnN0IHJhd0RlcCBvZiBpbXBvcnRzKSB7XG4gICAgICAgICAgY29uc3QgZGVwID0gcmVzb2x2ZUZvcndhcmRSZWYocmF3RGVwKTtcbiAgICAgICAgICBpZiAoc2Vlbi5oYXMoZGVwKSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIHNlZW4uYWRkKGRlcCk7XG5cbiAgICAgICAgICBpZiAoISFnZXROZ01vZHVsZURlZihkZXApKSB7XG4gICAgICAgICAgICBjb25zdCBzY29wZSA9IHRyYW5zaXRpdmVTY29wZXNGb3IoZGVwKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgcGlwZSBvZiBzY29wZS5leHBvcnRlZC5waXBlcykge1xuICAgICAgICAgICAgICBjb25zdCBkZWYgPSBnZXRQaXBlRGVmKHBpcGUpO1xuICAgICAgICAgICAgICBpZiAoZGVmICYmICFzZWVuLmhhcyhwaXBlKSkge1xuICAgICAgICAgICAgICAgIHNlZW4uYWRkKHBpcGUpO1xuICAgICAgICAgICAgICAgIGNhY2hlZFBpcGVEZWZzLnB1c2goZGVmKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBkZWYgPSBnZXRQaXBlRGVmKGRlcCk7XG4gICAgICAgICAgICBpZiAoZGVmKSB7XG4gICAgICAgICAgICAgIGNhY2hlZFBpcGVEZWZzLnB1c2goZGVmKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBjYWNoZWRQaXBlRGVmcztcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKG5nRGV2TW9kZSkge1xuICAgICAgICBmb3IgKGNvbnN0IHJhd0RlcCBvZiBpbXBvcnRzKSB7XG4gICAgICAgICAgdmVyaWZ5U3RhbmRhbG9uZUltcG9ydChyYXdEZXAsIHR5cGUpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICghaXNDb21wb25lbnQodHlwZSkpIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBzY29wZSA9IGRlcHNUcmFja2VyLmdldFN0YW5kYWxvbmVDb21wb25lbnRTY29wZSh0eXBlLCBpbXBvcnRzKTtcblxuICAgICAgcmV0dXJuIFsuLi5zY29wZS5jb21waWxhdGlvbi5waXBlc10ubWFwKChwKSA9PiBnZXRQaXBlRGVmKHApISkuZmlsdGVyKChkKSA9PiBkICE9PSBudWxsKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICBkaXJlY3RpdmVEZWZzLFxuICAgIHBpcGVEZWZzLFxuICB9O1xufVxuXG5mdW5jdGlvbiBoYXNTZWxlY3RvclNjb3BlPFQ+KFxuICBjb21wb25lbnQ6IFR5cGU8VD4sXG4pOiBjb21wb25lbnQgaXMgVHlwZTxUPiAmIHtuZ1NlbGVjdG9yU2NvcGU6IFR5cGU8YW55Pn0ge1xuICByZXR1cm4gKGNvbXBvbmVudCBhcyB7bmdTZWxlY3RvclNjb3BlPzogYW55fSkubmdTZWxlY3RvclNjb3BlICE9PSB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogQ29tcGlsZSBhbiBBbmd1bGFyIGRpcmVjdGl2ZSBhY2NvcmRpbmcgdG8gaXRzIGRlY29yYXRvciBtZXRhZGF0YSwgYW5kIHBhdGNoIHRoZSByZXN1bHRpbmdcbiAqIGRpcmVjdGl2ZSBkZWYgb250byB0aGUgY29tcG9uZW50IHR5cGUuXG4gKlxuICogSW4gdGhlIGV2ZW50IHRoYXQgY29tcGlsYXRpb24gaXMgbm90IGltbWVkaWF0ZSwgYGNvbXBpbGVEaXJlY3RpdmVgIHdpbGwgcmV0dXJuIGEgYFByb21pc2VgIHdoaWNoXG4gKiB3aWxsIHJlc29sdmUgd2hlbiBjb21waWxhdGlvbiBjb21wbGV0ZXMgYW5kIHRoZSBkaXJlY3RpdmUgYmVjb21lcyB1c2FibGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb21waWxlRGlyZWN0aXZlKHR5cGU6IFR5cGU8YW55PiwgZGlyZWN0aXZlOiBEaXJlY3RpdmUgfCBudWxsKTogdm9pZCB7XG4gIGxldCBuZ0RpcmVjdGl2ZURlZjogYW55ID0gbnVsbDtcblxuICBhZGREaXJlY3RpdmVGYWN0b3J5RGVmKHR5cGUsIGRpcmVjdGl2ZSB8fCB7fSk7XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHR5cGUsIE5HX0RJUl9ERUYsIHtcbiAgICBnZXQ6ICgpID0+IHtcbiAgICAgIGlmIChuZ0RpcmVjdGl2ZURlZiA9PT0gbnVsbCkge1xuICAgICAgICAvLyBgZGlyZWN0aXZlYCBjYW4gYmUgbnVsbCBpbiB0aGUgY2FzZSBvZiBhYnN0cmFjdCBkaXJlY3RpdmVzIGFzIGEgYmFzZSBjbGFzc1xuICAgICAgICAvLyB0aGF0IHVzZSBgQERpcmVjdGl2ZSgpYCB3aXRoIG5vIHNlbGVjdG9yLiBJbiB0aGF0IGNhc2UsIHBhc3MgZW1wdHkgb2JqZWN0IHRvIHRoZVxuICAgICAgICAvLyBgZGlyZWN0aXZlTWV0YWRhdGFgIGZ1bmN0aW9uIGluc3RlYWQgb2YgbnVsbC5cbiAgICAgICAgY29uc3QgbWV0YSA9IGdldERpcmVjdGl2ZU1ldGFkYXRhKHR5cGUsIGRpcmVjdGl2ZSB8fCB7fSk7XG4gICAgICAgIGNvbnN0IGNvbXBpbGVyID0gZ2V0Q29tcGlsZXJGYWNhZGUoe1xuICAgICAgICAgIHVzYWdlOiBKaXRDb21waWxlclVzYWdlLkRlY29yYXRvcixcbiAgICAgICAgICBraW5kOiAnZGlyZWN0aXZlJyxcbiAgICAgICAgICB0eXBlLFxuICAgICAgICB9KTtcbiAgICAgICAgbmdEaXJlY3RpdmVEZWYgPSBjb21waWxlci5jb21waWxlRGlyZWN0aXZlKFxuICAgICAgICAgIGFuZ3VsYXJDb3JlRW52LFxuICAgICAgICAgIG1ldGEuc291cmNlTWFwVXJsLFxuICAgICAgICAgIG1ldGEubWV0YWRhdGEsXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmdEaXJlY3RpdmVEZWY7XG4gICAgfSxcbiAgICAvLyBNYWtlIHRoZSBwcm9wZXJ0eSBjb25maWd1cmFibGUgaW4gZGV2IG1vZGUgdG8gYWxsb3cgb3ZlcnJpZGluZyBpbiB0ZXN0c1xuICAgIGNvbmZpZ3VyYWJsZTogISFuZ0Rldk1vZGUsXG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXREaXJlY3RpdmVNZXRhZGF0YSh0eXBlOiBUeXBlPGFueT4sIG1ldGFkYXRhOiBEaXJlY3RpdmUpIHtcbiAgY29uc3QgbmFtZSA9IHR5cGUgJiYgdHlwZS5uYW1lO1xuICBjb25zdCBzb3VyY2VNYXBVcmwgPSBgbmc6Ly8vJHtuYW1lfS/JtWRpci5qc2A7XG4gIGNvbnN0IGNvbXBpbGVyID0gZ2V0Q29tcGlsZXJGYWNhZGUoe3VzYWdlOiBKaXRDb21waWxlclVzYWdlLkRlY29yYXRvciwga2luZDogJ2RpcmVjdGl2ZScsIHR5cGV9KTtcbiAgY29uc3QgZmFjYWRlID0gZGlyZWN0aXZlTWV0YWRhdGEodHlwZSBhcyBDb21wb25lbnRUeXBlPGFueT4sIG1ldGFkYXRhKTtcbiAgZmFjYWRlLnR5cGVTb3VyY2VTcGFuID0gY29tcGlsZXIuY3JlYXRlUGFyc2VTb3VyY2VTcGFuKCdEaXJlY3RpdmUnLCBuYW1lLCBzb3VyY2VNYXBVcmwpO1xuICBpZiAoZmFjYWRlLnVzZXNJbmhlcml0YW5jZSkge1xuICAgIGFkZERpcmVjdGl2ZURlZlRvVW5kZWNvcmF0ZWRQYXJlbnRzKHR5cGUpO1xuICB9XG4gIHJldHVybiB7bWV0YWRhdGE6IGZhY2FkZSwgc291cmNlTWFwVXJsfTtcbn1cblxuZnVuY3Rpb24gYWRkRGlyZWN0aXZlRmFjdG9yeURlZih0eXBlOiBUeXBlPGFueT4sIG1ldGFkYXRhOiBEaXJlY3RpdmUgfCBDb21wb25lbnQpIHtcbiAgbGV0IG5nRmFjdG9yeURlZjogYW55ID0gbnVsbDtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkodHlwZSwgTkdfRkFDVE9SWV9ERUYsIHtcbiAgICBnZXQ6ICgpID0+IHtcbiAgICAgIGlmIChuZ0ZhY3RvcnlEZWYgPT09IG51bGwpIHtcbiAgICAgICAgY29uc3QgbWV0YSA9IGdldERpcmVjdGl2ZU1ldGFkYXRhKHR5cGUsIG1ldGFkYXRhKTtcbiAgICAgICAgY29uc3QgY29tcGlsZXIgPSBnZXRDb21waWxlckZhY2FkZSh7XG4gICAgICAgICAgdXNhZ2U6IEppdENvbXBpbGVyVXNhZ2UuRGVjb3JhdG9yLFxuICAgICAgICAgIGtpbmQ6ICdkaXJlY3RpdmUnLFxuICAgICAgICAgIHR5cGUsXG4gICAgICAgIH0pO1xuICAgICAgICBuZ0ZhY3RvcnlEZWYgPSBjb21waWxlci5jb21waWxlRmFjdG9yeShhbmd1bGFyQ29yZUVudiwgYG5nOi8vLyR7dHlwZS5uYW1lfS/JtWZhYy5qc2AsIHtcbiAgICAgICAgICBuYW1lOiBtZXRhLm1ldGFkYXRhLm5hbWUsXG4gICAgICAgICAgdHlwZTogbWV0YS5tZXRhZGF0YS50eXBlLFxuICAgICAgICAgIHR5cGVBcmd1bWVudENvdW50OiAwLFxuICAgICAgICAgIGRlcHM6IHJlZmxlY3REZXBlbmRlbmNpZXModHlwZSksXG4gICAgICAgICAgdGFyZ2V0OiBjb21waWxlci5GYWN0b3J5VGFyZ2V0LkRpcmVjdGl2ZSxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmdGYWN0b3J5RGVmO1xuICAgIH0sXG4gICAgLy8gTWFrZSB0aGUgcHJvcGVydHkgY29uZmlndXJhYmxlIGluIGRldiBtb2RlIHRvIGFsbG93IG92ZXJyaWRpbmcgaW4gdGVzdHNcbiAgICBjb25maWd1cmFibGU6ICEhbmdEZXZNb2RlLFxuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4dGVuZHNEaXJlY3RseUZyb21PYmplY3QodHlwZTogVHlwZTxhbnk+KTogYm9vbGVhbiB7XG4gIHJldHVybiBPYmplY3QuZ2V0UHJvdG90eXBlT2YodHlwZS5wcm90b3R5cGUpID09PSBPYmplY3QucHJvdG90eXBlO1xufVxuXG4vKipcbiAqIEV4dHJhY3QgdGhlIGBSM0RpcmVjdGl2ZU1ldGFkYXRhYCBmb3IgYSBwYXJ0aWN1bGFyIGRpcmVjdGl2ZSAoZWl0aGVyIGEgYERpcmVjdGl2ZWAgb3IgYVxuICogYENvbXBvbmVudGApLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZGlyZWN0aXZlTWV0YWRhdGEodHlwZTogVHlwZTxhbnk+LCBtZXRhZGF0YTogRGlyZWN0aXZlKTogUjNEaXJlY3RpdmVNZXRhZGF0YUZhY2FkZSB7XG4gIC8vIFJlZmxlY3QgaW5wdXRzIGFuZCBvdXRwdXRzLlxuICBjb25zdCByZWZsZWN0ID0gZ2V0UmVmbGVjdCgpO1xuICBjb25zdCBwcm9wTWV0YWRhdGEgPSByZWZsZWN0Lm93blByb3BNZXRhZGF0YSh0eXBlKTtcblxuICByZXR1cm4ge1xuICAgIG5hbWU6IHR5cGUubmFtZSxcbiAgICB0eXBlOiB0eXBlLFxuICAgIHNlbGVjdG9yOiBtZXRhZGF0YS5zZWxlY3RvciAhPT0gdW5kZWZpbmVkID8gbWV0YWRhdGEuc2VsZWN0b3IgOiBudWxsLFxuICAgIGhvc3Q6IG1ldGFkYXRhLmhvc3QgfHwgRU1QVFlfT0JKLFxuICAgIHByb3BNZXRhZGF0YTogcHJvcE1ldGFkYXRhLFxuICAgIGlucHV0czogbWV0YWRhdGEuaW5wdXRzIHx8IEVNUFRZX0FSUkFZLFxuICAgIG91dHB1dHM6IG1ldGFkYXRhLm91dHB1dHMgfHwgRU1QVFlfQVJSQVksXG4gICAgcXVlcmllczogZXh0cmFjdFF1ZXJpZXNNZXRhZGF0YSh0eXBlLCBwcm9wTWV0YWRhdGEsIGlzQ29udGVudFF1ZXJ5KSxcbiAgICBsaWZlY3ljbGU6IHt1c2VzT25DaGFuZ2VzOiByZWZsZWN0Lmhhc0xpZmVjeWNsZUhvb2sodHlwZSwgJ25nT25DaGFuZ2VzJyl9LFxuICAgIHR5cGVTb3VyY2VTcGFuOiBudWxsISxcbiAgICB1c2VzSW5oZXJpdGFuY2U6ICFleHRlbmRzRGlyZWN0bHlGcm9tT2JqZWN0KHR5cGUpLFxuICAgIGV4cG9ydEFzOiBleHRyYWN0RXhwb3J0QXMobWV0YWRhdGEuZXhwb3J0QXMpLFxuICAgIHByb3ZpZGVyczogbWV0YWRhdGEucHJvdmlkZXJzIHx8IG51bGwsXG4gICAgdmlld1F1ZXJpZXM6IGV4dHJhY3RRdWVyaWVzTWV0YWRhdGEodHlwZSwgcHJvcE1ldGFkYXRhLCBpc1ZpZXdRdWVyeSksXG4gICAgaXNTdGFuZGFsb25lOiAhIW1ldGFkYXRhLnN0YW5kYWxvbmUsXG4gICAgaXNTaWduYWw6ICEhbWV0YWRhdGEuc2lnbmFscyxcbiAgICBob3N0RGlyZWN0aXZlczpcbiAgICAgIG1ldGFkYXRhLmhvc3REaXJlY3RpdmVzPy5tYXAoKGRpcmVjdGl2ZSkgPT5cbiAgICAgICAgdHlwZW9mIGRpcmVjdGl2ZSA9PT0gJ2Z1bmN0aW9uJyA/IHtkaXJlY3RpdmV9IDogZGlyZWN0aXZlLFxuICAgICAgKSB8fCBudWxsLFxuICB9O1xufVxuXG4vKipcbiAqIEFkZHMgYSBkaXJlY3RpdmUgZGVmaW5pdGlvbiB0byBhbGwgcGFyZW50IGNsYXNzZXMgb2YgYSB0eXBlIHRoYXQgZG9uJ3QgaGF2ZSBhbiBBbmd1bGFyIGRlY29yYXRvci5cbiAqL1xuZnVuY3Rpb24gYWRkRGlyZWN0aXZlRGVmVG9VbmRlY29yYXRlZFBhcmVudHModHlwZTogVHlwZTxhbnk+KSB7XG4gIGNvbnN0IG9ialByb3RvdHlwZSA9IE9iamVjdC5wcm90b3R5cGU7XG4gIGxldCBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YodHlwZS5wcm90b3R5cGUpLmNvbnN0cnVjdG9yO1xuXG4gIC8vIEdvIHVwIHRoZSBwcm90b3R5cGUgdW50aWwgd2UgaGl0IGBPYmplY3RgLlxuICB3aGlsZSAocGFyZW50ICYmIHBhcmVudCAhPT0gb2JqUHJvdG90eXBlKSB7XG4gICAgLy8gU2luY2UgaW5oZXJpdGFuY2Ugd29ya3MgaWYgdGhlIGNsYXNzIHdhcyBhbm5vdGF0ZWQgYWxyZWFkeSwgd2Ugb25seSBuZWVkIHRvIGFkZFxuICAgIC8vIHRoZSBkZWYgaWYgdGhlcmUgYXJlIG5vIGFubm90YXRpb25zIGFuZCB0aGUgZGVmIGhhc24ndCBiZWVuIGNyZWF0ZWQgYWxyZWFkeS5cbiAgICBpZiAoXG4gICAgICAhZ2V0RGlyZWN0aXZlRGVmKHBhcmVudCkgJiZcbiAgICAgICFnZXRDb21wb25lbnREZWYocGFyZW50KSAmJlxuICAgICAgc2hvdWxkQWRkQWJzdHJhY3REaXJlY3RpdmUocGFyZW50KVxuICAgICkge1xuICAgICAgY29tcGlsZURpcmVjdGl2ZShwYXJlbnQsIG51bGwpO1xuICAgIH1cbiAgICBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YocGFyZW50KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjb252ZXJ0VG9SM1F1ZXJ5UHJlZGljYXRlKHNlbGVjdG9yOiBhbnkpOiBhbnkgfCBzdHJpbmdbXSB7XG4gIHJldHVybiB0eXBlb2Ygc2VsZWN0b3IgPT09ICdzdHJpbmcnID8gc3BsaXRCeUNvbW1hKHNlbGVjdG9yKSA6IHJlc29sdmVGb3J3YXJkUmVmKHNlbGVjdG9yKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbnZlcnRUb1IzUXVlcnlNZXRhZGF0YShwcm9wZXJ0eU5hbWU6IHN0cmluZywgYW5uOiBRdWVyeSk6IFIzUXVlcnlNZXRhZGF0YUZhY2FkZSB7XG4gIHJldHVybiB7XG4gICAgcHJvcGVydHlOYW1lOiBwcm9wZXJ0eU5hbWUsXG4gICAgcHJlZGljYXRlOiBjb252ZXJ0VG9SM1F1ZXJ5UHJlZGljYXRlKGFubi5zZWxlY3RvciksXG4gICAgZGVzY2VuZGFudHM6IGFubi5kZXNjZW5kYW50cyxcbiAgICBmaXJzdDogYW5uLmZpcnN0LFxuICAgIHJlYWQ6IGFubi5yZWFkID8gYW5uLnJlYWQgOiBudWxsLFxuICAgIHN0YXRpYzogISFhbm4uc3RhdGljLFxuICAgIGVtaXREaXN0aW5jdENoYW5nZXNPbmx5OiAhIWFubi5lbWl0RGlzdGluY3RDaGFuZ2VzT25seSxcbiAgICBpc1NpZ25hbDogISFhbm4uaXNTaWduYWwsXG4gIH07XG59XG5mdW5jdGlvbiBleHRyYWN0UXVlcmllc01ldGFkYXRhKFxuICB0eXBlOiBUeXBlPGFueT4sXG4gIHByb3BNZXRhZGF0YToge1trZXk6IHN0cmluZ106IGFueVtdfSxcbiAgaXNRdWVyeUFubjogKGFubjogYW55KSA9PiBhbm4gaXMgUXVlcnksXG4pOiBSM1F1ZXJ5TWV0YWRhdGFGYWNhZGVbXSB7XG4gIGNvbnN0IHF1ZXJpZXNNZXRhOiBSM1F1ZXJ5TWV0YWRhdGFGYWNhZGVbXSA9IFtdO1xuICBmb3IgKGNvbnN0IGZpZWxkIGluIHByb3BNZXRhZGF0YSkge1xuICAgIGlmIChwcm9wTWV0YWRhdGEuaGFzT3duUHJvcGVydHkoZmllbGQpKSB7XG4gICAgICBjb25zdCBhbm5vdGF0aW9ucyA9IHByb3BNZXRhZGF0YVtmaWVsZF07XG4gICAgICBhbm5vdGF0aW9ucy5mb3JFYWNoKChhbm4pID0+IHtcbiAgICAgICAgaWYgKGlzUXVlcnlBbm4oYW5uKSkge1xuICAgICAgICAgIGlmICghYW5uLnNlbGVjdG9yKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgIGBDYW4ndCBjb25zdHJ1Y3QgYSBxdWVyeSBmb3IgdGhlIHByb3BlcnR5IFwiJHtmaWVsZH1cIiBvZiBgICtcbiAgICAgICAgICAgICAgICBgXCIke3N0cmluZ2lmeUZvckVycm9yKHR5cGUpfVwiIHNpbmNlIHRoZSBxdWVyeSBzZWxlY3RvciB3YXNuJ3QgZGVmaW5lZC5gLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGFubm90YXRpb25zLnNvbWUoaXNJbnB1dEFubm90YXRpb24pKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbm5vdCBjb21iaW5lIEBJbnB1dCBkZWNvcmF0b3JzIHdpdGggcXVlcnkgZGVjb3JhdG9yc2ApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBxdWVyaWVzTWV0YS5wdXNoKGNvbnZlcnRUb1IzUXVlcnlNZXRhZGF0YShmaWVsZCwgYW5uKSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcXVlcmllc01ldGE7XG59XG5cbmZ1bmN0aW9uIGV4dHJhY3RFeHBvcnRBcyhleHBvcnRBczogc3RyaW5nIHwgdW5kZWZpbmVkKTogc3RyaW5nW10gfCBudWxsIHtcbiAgcmV0dXJuIGV4cG9ydEFzID09PSB1bmRlZmluZWQgPyBudWxsIDogc3BsaXRCeUNvbW1hKGV4cG9ydEFzKTtcbn1cblxuZnVuY3Rpb24gaXNDb250ZW50UXVlcnkodmFsdWU6IGFueSk6IHZhbHVlIGlzIFF1ZXJ5IHtcbiAgY29uc3QgbmFtZSA9IHZhbHVlLm5nTWV0YWRhdGFOYW1lO1xuICByZXR1cm4gbmFtZSA9PT0gJ0NvbnRlbnRDaGlsZCcgfHwgbmFtZSA9PT0gJ0NvbnRlbnRDaGlsZHJlbic7XG59XG5cbmZ1bmN0aW9uIGlzVmlld1F1ZXJ5KHZhbHVlOiBhbnkpOiB2YWx1ZSBpcyBRdWVyeSB7XG4gIGNvbnN0IG5hbWUgPSB2YWx1ZS5uZ01ldGFkYXRhTmFtZTtcbiAgcmV0dXJuIG5hbWUgPT09ICdWaWV3Q2hpbGQnIHx8IG5hbWUgPT09ICdWaWV3Q2hpbGRyZW4nO1xufVxuXG5mdW5jdGlvbiBpc0lucHV0QW5ub3RhdGlvbih2YWx1ZTogYW55KTogdmFsdWUgaXMgSW5wdXQge1xuICByZXR1cm4gdmFsdWUubmdNZXRhZGF0YU5hbWUgPT09ICdJbnB1dCc7XG59XG5cbmZ1bmN0aW9uIHNwbGl0QnlDb21tYSh2YWx1ZTogc3RyaW5nKTogc3RyaW5nW10ge1xuICByZXR1cm4gdmFsdWUuc3BsaXQoJywnKS5tYXAoKHBpZWNlKSA9PiBwaWVjZS50cmltKCkpO1xufVxuXG5jb25zdCBMSUZFQ1lDTEVfSE9PS1MgPSBbXG4gICduZ09uQ2hhbmdlcycsXG4gICduZ09uSW5pdCcsXG4gICduZ09uRGVzdHJveScsXG4gICduZ0RvQ2hlY2snLFxuICAnbmdBZnRlclZpZXdJbml0JyxcbiAgJ25nQWZ0ZXJWaWV3Q2hlY2tlZCcsXG4gICduZ0FmdGVyQ29udGVudEluaXQnLFxuICAnbmdBZnRlckNvbnRlbnRDaGVja2VkJyxcbl07XG5cbmZ1bmN0aW9uIHNob3VsZEFkZEFic3RyYWN0RGlyZWN0aXZlKHR5cGU6IFR5cGU8YW55Pik6IGJvb2xlYW4ge1xuICBjb25zdCByZWZsZWN0ID0gZ2V0UmVmbGVjdCgpO1xuXG4gIGlmIChMSUZFQ1lDTEVfSE9PS1Muc29tZSgoaG9va05hbWUpID0+IHJlZmxlY3QuaGFzTGlmZWN5Y2xlSG9vayh0eXBlLCBob29rTmFtZSkpKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBjb25zdCBwcm9wTWV0YWRhdGEgPSByZWZsZWN0LnByb3BNZXRhZGF0YSh0eXBlKTtcblxuICBmb3IgKGNvbnN0IGZpZWxkIGluIHByb3BNZXRhZGF0YSkge1xuICAgIGNvbnN0IGFubm90YXRpb25zID0gcHJvcE1ldGFkYXRhW2ZpZWxkXTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYW5ub3RhdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGN1cnJlbnQgPSBhbm5vdGF0aW9uc1tpXTtcbiAgICAgIGNvbnN0IG1ldGFkYXRhTmFtZSA9IGN1cnJlbnQubmdNZXRhZGF0YU5hbWU7XG5cbiAgICAgIGlmIChcbiAgICAgICAgaXNJbnB1dEFubm90YXRpb24oY3VycmVudCkgfHxcbiAgICAgICAgaXNDb250ZW50UXVlcnkoY3VycmVudCkgfHxcbiAgICAgICAgaXNWaWV3UXVlcnkoY3VycmVudCkgfHxcbiAgICAgICAgbWV0YWRhdGFOYW1lID09PSAnT3V0cHV0JyB8fFxuICAgICAgICBtZXRhZGF0YU5hbWUgPT09ICdIb3N0QmluZGluZycgfHxcbiAgICAgICAgbWV0YWRhdGFOYW1lID09PSAnSG9zdExpc3RlbmVyJ1xuICAgICAgKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn1cbiJdfQ==