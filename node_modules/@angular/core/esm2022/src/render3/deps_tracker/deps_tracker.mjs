/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { resolveForwardRef } from '../../di';
import { RuntimeError } from '../../errors';
import { flatten } from '../../util/array_utils';
import { getComponentDef, getNgModuleDef, isStandalone } from '../definition';
import { isComponent, isDirective, isNgModule, isPipe, verifyStandaloneImport } from '../jit/util';
import { maybeUnwrapFn } from '../util/misc_utils';
/**
 * Indicates whether to use the runtime dependency tracker for scope calculation in JIT compilation.
 * The value "false" means the old code path based on patching scope info into the types will be
 * used.
 *
 * @deprecated For migration purposes only, to be removed soon.
 */
export const USE_RUNTIME_DEPS_TRACKER_FOR_JIT = true;
/**
 * An implementation of DepsTrackerApi which will be used for JIT and local compilation.
 */
class DepsTracker {
    constructor() {
        this.ownerNgModule = new Map();
        this.ngModulesWithSomeUnresolvedDecls = new Set();
        this.ngModulesScopeCache = new Map();
        this.standaloneComponentsScopeCache = new Map();
    }
    /**
     * Attempts to resolve ng module's forward ref declarations as much as possible and add them to
     * the `ownerNgModule` map. This method normally should be called after the initial parsing when
     * all the forward refs are resolved (e.g., when trying to render a component)
     */
    resolveNgModulesDecls() {
        if (this.ngModulesWithSomeUnresolvedDecls.size === 0) {
            return;
        }
        for (const moduleType of this.ngModulesWithSomeUnresolvedDecls) {
            const def = getNgModuleDef(moduleType);
            if (def?.declarations) {
                for (const decl of maybeUnwrapFn(def.declarations)) {
                    if (isComponent(decl)) {
                        this.ownerNgModule.set(decl, moduleType);
                    }
                }
            }
        }
        this.ngModulesWithSomeUnresolvedDecls.clear();
    }
    /** @override */
    getComponentDependencies(type, rawImports) {
        this.resolveNgModulesDecls();
        const def = getComponentDef(type);
        if (def === null) {
            throw new Error(`Attempting to get component dependencies for a type that is not a component: ${type}`);
        }
        if (def.standalone) {
            const scope = this.getStandaloneComponentScope(type, rawImports);
            if (scope.compilation.isPoisoned) {
                return { dependencies: [] };
            }
            return {
                dependencies: [
                    ...scope.compilation.directives,
                    ...scope.compilation.pipes,
                    ...scope.compilation.ngModules,
                ],
            };
        }
        else {
            if (!this.ownerNgModule.has(type)) {
                // This component is orphan! No need to handle the error since the component rendering
                // pipeline (e.g., view_container_ref) will check for this error based on configs.
                return { dependencies: [] };
            }
            const scope = this.getNgModuleScope(this.ownerNgModule.get(type));
            if (scope.compilation.isPoisoned) {
                return { dependencies: [] };
            }
            return {
                dependencies: [...scope.compilation.directives, ...scope.compilation.pipes],
            };
        }
    }
    /**
     * @override
     * This implementation does not make use of param scopeInfo since it assumes the scope info is
     * already added to the type itself through methods like {@link ɵɵsetNgModuleScope}
     */
    registerNgModule(type, scopeInfo) {
        if (!isNgModule(type)) {
            throw new Error(`Attempting to register a Type which is not NgModule as NgModule: ${type}`);
        }
        // Lazily process the NgModules later when needed.
        this.ngModulesWithSomeUnresolvedDecls.add(type);
    }
    /** @override */
    clearScopeCacheFor(type) {
        this.ngModulesScopeCache.delete(type);
        this.standaloneComponentsScopeCache.delete(type);
    }
    /** @override */
    getNgModuleScope(type) {
        if (this.ngModulesScopeCache.has(type)) {
            return this.ngModulesScopeCache.get(type);
        }
        const scope = this.computeNgModuleScope(type);
        this.ngModulesScopeCache.set(type, scope);
        return scope;
    }
    /** Compute NgModule scope afresh. */
    computeNgModuleScope(type) {
        const def = getNgModuleDef(type, true);
        const scope = {
            exported: { directives: new Set(), pipes: new Set() },
            compilation: { directives: new Set(), pipes: new Set() },
        };
        // Analyzing imports
        for (const imported of maybeUnwrapFn(def.imports)) {
            if (isNgModule(imported)) {
                const importedScope = this.getNgModuleScope(imported);
                // When this module imports another, the imported module's exported directives and pipes
                // are added to the compilation scope of this module.
                addSet(importedScope.exported.directives, scope.compilation.directives);
                addSet(importedScope.exported.pipes, scope.compilation.pipes);
            }
            else if (isStandalone(imported)) {
                if (isDirective(imported) || isComponent(imported)) {
                    scope.compilation.directives.add(imported);
                }
                else if (isPipe(imported)) {
                    scope.compilation.pipes.add(imported);
                }
                else {
                    // The standalone thing is neither a component nor a directive nor a pipe ... (what?)
                    throw new RuntimeError(1000 /* RuntimeErrorCode.RUNTIME_DEPS_INVALID_IMPORTED_TYPE */, 'The standalone imported type is neither a component nor a directive nor a pipe');
                }
            }
            else {
                // The import is neither a module nor a module-with-providers nor a standalone thing. This
                // is going to be an error. So we short circuit.
                scope.compilation.isPoisoned = true;
                break;
            }
        }
        // Analyzing declarations
        if (!scope.compilation.isPoisoned) {
            for (const decl of maybeUnwrapFn(def.declarations)) {
                // Cannot declare another NgModule or a standalone thing
                if (isNgModule(decl) || isStandalone(decl)) {
                    scope.compilation.isPoisoned = true;
                    break;
                }
                if (isPipe(decl)) {
                    scope.compilation.pipes.add(decl);
                }
                else {
                    // decl is either a directive or a component. The component may not yet have the ɵcmp due
                    // to async compilation.
                    scope.compilation.directives.add(decl);
                }
            }
        }
        // Analyzing exports
        for (const exported of maybeUnwrapFn(def.exports)) {
            if (isNgModule(exported)) {
                // When this module exports another, the exported module's exported directives and pipes
                // are added to both the compilation and exported scopes of this module.
                const exportedScope = this.getNgModuleScope(exported);
                // Based on the current logic there is no way to have poisoned exported scope. So no need to
                // check for it.
                addSet(exportedScope.exported.directives, scope.exported.directives);
                addSet(exportedScope.exported.pipes, scope.exported.pipes);
                // Some test toolings which run in JIT mode depend on this behavior that the exported scope
                // should also be present in the compilation scope, even though AoT does not support this
                // and it is also in odds with NgModule metadata definitions. Without this some tests in
                // Google will fail.
                addSet(exportedScope.exported.directives, scope.compilation.directives);
                addSet(exportedScope.exported.pipes, scope.compilation.pipes);
            }
            else if (isPipe(exported)) {
                scope.exported.pipes.add(exported);
            }
            else {
                scope.exported.directives.add(exported);
            }
        }
        return scope;
    }
    /** @override */
    getStandaloneComponentScope(type, rawImports) {
        if (this.standaloneComponentsScopeCache.has(type)) {
            return this.standaloneComponentsScopeCache.get(type);
        }
        const ans = this.computeStandaloneComponentScope(type, rawImports);
        this.standaloneComponentsScopeCache.set(type, ans);
        return ans;
    }
    computeStandaloneComponentScope(type, rawImports) {
        const ans = {
            compilation: {
                // Standalone components are always able to self-reference.
                directives: new Set([type]),
                pipes: new Set(),
                ngModules: new Set(),
            },
        };
        for (const rawImport of flatten(rawImports ?? [])) {
            const imported = resolveForwardRef(rawImport);
            try {
                verifyStandaloneImport(imported, type);
            }
            catch (e) {
                // Short-circuit if an import is not valid
                ans.compilation.isPoisoned = true;
                return ans;
            }
            if (isNgModule(imported)) {
                ans.compilation.ngModules.add(imported);
                const importedScope = this.getNgModuleScope(imported);
                // Short-circuit if an imported NgModule has corrupted exported scope.
                if (importedScope.exported.isPoisoned) {
                    ans.compilation.isPoisoned = true;
                    return ans;
                }
                addSet(importedScope.exported.directives, ans.compilation.directives);
                addSet(importedScope.exported.pipes, ans.compilation.pipes);
            }
            else if (isPipe(imported)) {
                ans.compilation.pipes.add(imported);
            }
            else if (isDirective(imported) || isComponent(imported)) {
                ans.compilation.directives.add(imported);
            }
            else {
                // The imported thing is not module/pipe/directive/component, so we error and short-circuit
                // here
                ans.compilation.isPoisoned = true;
                return ans;
            }
        }
        return ans;
    }
    /** @override */
    isOrphanComponent(cmp) {
        const def = getComponentDef(cmp);
        if (!def || def.standalone) {
            return false;
        }
        this.resolveNgModulesDecls();
        return !this.ownerNgModule.has(cmp);
    }
}
function addSet(sourceSet, targetSet) {
    for (const m of sourceSet) {
        targetSet.add(m);
    }
}
/** The deps tracker to be used in the current Angular app in dev mode. */
export const depsTracker = new DepsTracker();
export const TEST_ONLY = { DepsTracker };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVwc190cmFja2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvcmVuZGVyMy9kZXBzX3RyYWNrZXIvZGVwc190cmFja2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUMzQyxPQUFPLEVBQUMsWUFBWSxFQUFtQixNQUFNLGNBQWMsQ0FBQztBQUc1RCxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFDL0MsT0FBTyxFQUFDLGVBQWUsRUFBRSxjQUFjLEVBQUUsWUFBWSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBTTVFLE9BQU8sRUFBQyxXQUFXLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsc0JBQXNCLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDakcsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBU2pEOzs7Ozs7R0FNRztBQUNILE1BQU0sQ0FBQyxNQUFNLGdDQUFnQyxHQUFHLElBQUksQ0FBQztBQUVyRDs7R0FFRztBQUNILE1BQU0sV0FBVztJQUFqQjtRQUNVLGtCQUFhLEdBQUcsSUFBSSxHQUFHLEVBQXlDLENBQUM7UUFDakUscUNBQWdDLEdBQUcsSUFBSSxHQUFHLEVBQXFCLENBQUM7UUFDaEUsd0JBQW1CLEdBQUcsSUFBSSxHQUFHLEVBQW9DLENBQUM7UUFDbEUsbUNBQThCLEdBQUcsSUFBSSxHQUFHLEVBQWdELENBQUM7SUEyUW5HLENBQUM7SUF6UUM7Ozs7T0FJRztJQUNLLHFCQUFxQjtRQUMzQixJQUFJLElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxJQUFJLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDckQsT0FBTztRQUNULENBQUM7UUFFRCxLQUFLLE1BQU0sVUFBVSxJQUFJLElBQUksQ0FBQyxnQ0FB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TSxDQUFDO2dCQUNOLDJGQUEyRjtnQkFDM0YsT0FBTztnQkFDUCxHQUFHLENBQUMsV0FBVyxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7Z0JBQ2xDLE9BQU8sR0FBRyxDQUFDO1lBQ2IsQ0FBQztRQUNILENBQUM7UUFFRCxPQUFPLEdBQUcsQ0FBQztJQUNiLENBQUM7SUFFRCxnQkFBZ0I7SUFDaEIsaUJBQWlCLENBQUMsR0FBYztRQUM5QixNQUFNLEdBQUcsR0FBRyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFakMsSUFBSSxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDM0IsT0FBTyxLQUFLLENBQUM7UUFDZixDQUFDO1FBRUQsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7UUFFN0IsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLEdBQXlCLENBQUMsQ0FBQztJQUM1RCxDQUFDO0NBQ0Y7QUFFRCxTQUFTLE1BQU0sQ0FBSSxTQUFpQixFQUFFLFNBQWlCO0lBQ3JELEtBQUssTUFBTSxDQUFDLElBQUksU0FBUyxFQUFFLENBQUM7UUFDMUIsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNuQixDQUFDO0FBQ0gsQ0FBQztBQUVELDBFQUEwRTtBQUMxRSxNQUFNLENBQUMsTUFBTSxXQUFXLEdBQUcsSUFBSSxXQUFXLEVBQUUsQ0FBQztBQUU3QyxNQUFNLENBQUMsTUFBTSxTQUFTLEdBQUcsRUFBQyxXQUFXLEVBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtyZXNvbHZlRm9yd2FyZFJlZn0gZnJvbSAnLi4vLi4vZGknO1xuaW1wb3J0IHtSdW50aW1lRXJyb3IsIFJ1bnRpbWVFcnJvckNvZGV9IGZyb20gJy4uLy4uL2Vycm9ycyc7XG5pbXBvcnQge1R5cGV9IGZyb20gJy4uLy4uL2ludGVyZmFjZS90eXBlJztcbmltcG9ydCB7TmdNb2R1bGVUeXBlfSBmcm9tICcuLi8uLi9tZXRhZGF0YS9uZ19tb2R1bGVfZGVmJztcbmltcG9ydCB7ZmxhdHRlbn0gZnJvbSAnLi4vLi4vdXRpbC9hcnJheV91dGlscyc7XG5pbXBvcnQge2dldENvbXBvbmVudERlZiwgZ2V0TmdNb2R1bGVEZWYsIGlzU3RhbmRhbG9uZX0gZnJvbSAnLi4vZGVmaW5pdGlvbic7XG5pbXBvcnQge1xuICBDb21wb25lbnRUeXBlLFxuICBOZ01vZHVsZVNjb3BlSW5mb0Zyb21EZWNvcmF0b3IsXG4gIFJhd1Njb3BlSW5mb0Zyb21EZWNvcmF0b3IsXG59IGZyb20gJy4uL2ludGVyZmFjZXMvZGVmaW5pdGlvbic7XG5pbXBvcnQge2lzQ29tcG9uZW50LCBpc0RpcmVjdGl2ZSwgaXNOZ01vZHVsZSwgaXNQaXBlLCB2ZXJpZnlTdGFuZGFsb25lSW1wb3J0fSBmcm9tICcuLi9qaXQvdXRpbCc7XG5pbXBvcnQge21heWJlVW53cmFwRm59IGZyb20gJy4uL3V0aWwvbWlzY191dGlscyc7XG5cbmltcG9ydCB7XG4gIENvbXBvbmVudERlcGVuZGVuY2llcyxcbiAgRGVwc1RyYWNrZXJBcGksXG4gIE5nTW9kdWxlU2NvcGUsXG4gIFN0YW5kYWxvbmVDb21wb25lbnRTY29wZSxcbn0gZnJvbSAnLi9hcGknO1xuXG4vKipcbiAqIEluZGljYXRlcyB3aGV0aGVyIHRvIHVzZSB0aGUgcnVudGltZSBkZXBlbmRlbmN5IHRyYWNrZXIgZm9yIHNjb3BlIGNhbGN1bGF0aW9uIGluIEpJVCBjb21waWxhdGlvbi5cbiAqIFRoZSB2YWx1ZSBcImZhbHNlXCIgbWVhbnMgdGhlIG9sZCBjb2RlIHBhdGggYmFzZWQgb24gcGF0Y2hpbmcgc2NvcGUgaW5mbyBpbnRvIHRoZSB0eXBlcyB3aWxsIGJlXG4gKiB1c2VkLlxuICpcbiAqIEBkZXByZWNhdGVkIEZvciBtaWdyYXRpb24gcHVycG9zZXMgb25seSwgdG8gYmUgcmVtb3ZlZCBzb29uLlxuICovXG5leHBvcnQgY29uc3QgVVNFX1JVTlRJTUVfREVQU19UUkFDS0VSX0ZPUl9KSVQgPSB0cnVlO1xuXG4vKipcbiAqIEFuIGltcGxlbWVudGF0aW9uIG9mIERlcHNUcmFja2VyQXBpIHdoaWNoIHdpbGwgYmUgdXNlZCBmb3IgSklUIGFuZCBsb2NhbCBjb21waWxhdGlvbi5cbiAqL1xuY2xhc3MgRGVwc1RyYWNrZXIgaW1wbGVtZW50cyBEZXBzVHJhY2tlckFwaSB7XG4gIHByaXZhdGUgb3duZXJOZ01vZHVsZSA9IG5ldyBNYXA8Q29tcG9uZW50VHlwZTxhbnk+LCBOZ01vZHVsZVR5cGU8YW55Pj4oKTtcbiAgcHJpdmF0ZSBuZ01vZHVsZXNXaXRoU29tZVVucmVzb2x2ZWREZWNscyA9IG5ldyBTZXQ8TmdNb2R1bGVUeXBlPGFueT4+KCk7XG4gIHByaXZhdGUgbmdNb2R1bGVzU2NvcGVDYWNoZSA9IG5ldyBNYXA8TmdNb2R1bGVUeXBlPGFueT4sIE5nTW9kdWxlU2NvcGU+KCk7XG4gIHByaXZhdGUgc3RhbmRhbG9uZUNvbXBvbmVudHNTY29wZUNhY2hlID0gbmV3IE1hcDxDb21wb25lbnRUeXBlPGFueT4sIFN0YW5kYWxvbmVDb21wb25lbnRTY29wZT4oKTtcblxuICAvKipcbiAgICogQXR0ZW1wdHMgdG8gcmVzb2x2ZSBuZyBtb2R1bGUncyBmb3J3YXJkIHJlZiBkZWNsYXJhdGlvbnMgYXMgbXVjaCBhcyBwb3NzaWJsZSBhbmQgYWRkIHRoZW0gdG9cbiAgICogdGhlIGBvd25lck5nTW9kdWxlYCBtYXAuIFRoaXMgbWV0aG9kIG5vcm1hbGx5IHNob3VsZCBiZSBjYWxsZWQgYWZ0ZXIgdGhlIGluaXRpYWwgcGFyc2luZyB3aGVuXG4gICAqIGFsbCB0aGUgZm9yd2FyZCByZWZzIGFyZSByZXNvbHZlZCAoZS5nLiwgd2hlbiB0cnlpbmcgdG8gcmVuZGVyIGEgY29tcG9uZW50KVxuICAgKi9cbiAgcHJpdmF0ZSByZXNvbHZlTmdNb2R1bGVzRGVjbHMoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMubmdNb2R1bGVzV2l0aFNvbWVVbnJlc29sdmVkRGVjbHMuc2l6ZSA9PT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGZvciAoY29uc3QgbW9kdWxlVHlwZSBvZiB0aGlzLm5nTW9kdWxlc1dpdGhTb21lVW5yZXNvbHZlZERlY2xzKSB7XG4gICAgICBjb25zdCBkZWYgPSBnZXROZ01vZHVsZURlZihtb2R1bGVUeXBlKTtcbiAgICAgIGlmIChkZWY/LmRlY2xhcmF0aW9ucykge1xuICAgICAgICBmb3IgKGNvbnN0IGRlY2wgb2YgbWF5YmVVbndyYXBGbihkZWYuZGVjbGFyYXRpb25zKSkge1xuICAgICAgICAgIGlmIChpc0NvbXBvbmVudChkZWNsKSkge1xuICAgICAgICAgICAgdGhpcy5vd25lck5nTW9kdWxlLnNldChkZWNsLCBtb2R1bGVUeXBlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLm5nTW9kdWxlc1dpdGhTb21lVW5yZXNvbHZlZERlY2xzLmNsZWFyKCk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGdldENvbXBvbmVudERlcGVuZGVuY2llcyhcbiAgICB0eXBlOiBDb21wb25lbnRUeXBlPGFueT4sXG4gICAgcmF3SW1wb3J0cz86IFJhd1Njb3BlSW5mb0Zyb21EZWNvcmF0b3JbXSxcbiAgKTogQ29tcG9uZW50RGVwZW5kZW5jaWVzIHtcbiAgICB0aGlzLnJlc29sdmVOZ01vZHVsZXNEZWNscygpO1xuXG4gICAgY29uc3QgZGVmID0gZ2V0Q29tcG9uZW50RGVmKHR5cGUpO1xuICAgIGlmIChkZWYgPT09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYEF0dGVtcHRpbmcgdG8gZ2V0IGNvbXBvbmVudCBkZXBlbmRlbmNpZXMgZm9yIGEgdHlwZSB0aGF0IGlzIG5vdCBhIGNvbXBvbmVudDogJHt0eXBlfWAsXG4gICAgICApO1xuICAgIH1cblxuICAgIGlmIChkZWYuc3RhbmRhbG9uZSkge1xuICAgICAgY29uc3Qgc2NvcGUgPSB0aGlzLmdldFN0YW5kYWxvbmVDb21wb25lbnRTY29wZSh0eXBlLCByYXdJbXBvcnRzKTtcblxuICAgICAgaWYgKHNjb3BlLmNvbXBpbGF0aW9uLmlzUG9pc29uZWQpIHtcbiAgICAgICAgcmV0dXJuIHtkZXBlbmRlbmNpZXM6IFtdfTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZGVwZW5kZW5jaWVzOiBbXG4gICAgICAgICAgLi4uc2NvcGUuY29tcGlsYXRpb24uZGlyZWN0aXZlcyxcbiAgICAgICAgICAuLi5zY29wZS5jb21waWxhdGlvbi5waXBlcyxcbiAgICAgICAgICAuLi5zY29wZS5jb21waWxhdGlvbi5uZ01vZHVsZXMsXG4gICAgICAgIF0sXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIXRoaXMub3duZXJOZ01vZHVsZS5oYXModHlwZSkpIHtcbiAgICAgICAgLy8gVGhpcyBjb21wb25lbnQgaXMgb3JwaGFuISBObyBuZWVkIHRvIGhhbmRsZSB0aGUgZXJyb3Igc2luY2UgdGhlIGNvbXBvbmVudCByZW5kZXJpbmdcbiAgICAgICAgLy8gcGlwZWxpbmUgKGUuZy4sIHZpZXdfY29udGFpbmVyX3JlZikgd2lsbCBjaGVjayBmb3IgdGhpcyBlcnJvciBiYXNlZCBvbiBjb25maWdzLlxuICAgICAgICByZXR1cm4ge2RlcGVuZGVuY2llczogW119O1xuICAgICAgfVxuXG4gICAgICBjb25zdCBzY29wZSA9IHRoaXMuZ2V0TmdNb2R1bGVTY29wZSh0aGlzLm93bmVyTmdNb2R1bGUuZ2V0KHR5cGUpISk7XG5cbiAgICAgIGlmIChzY29wZS5jb21waWxhdGlvbi5pc1BvaXNvbmVkKSB7XG4gICAgICAgIHJldHVybiB7ZGVwZW5kZW5jaWVzOiBbXX07XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGRlcGVuZGVuY2llczogWy4uLnNjb3BlLmNvbXBpbGF0aW9uLmRpcmVjdGl2ZXMsIC4uLnNjb3BlLmNvbXBpbGF0aW9uLnBpcGVzXSxcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBvdmVycmlkZVxuICAgKiBUaGlzIGltcGxlbWVudGF0aW9uIGRvZXMgbm90IG1ha2UgdXNlIG9mIHBhcmFtIHNjb3BlSW5mbyBzaW5jZSBpdCBhc3N1bWVzIHRoZSBzY29wZSBpbmZvIGlzXG4gICAqIGFscmVhZHkgYWRkZWQgdG8gdGhlIHR5cGUgaXRzZWxmIHRocm91Z2ggbWV0aG9kcyBsaWtlIHtAbGluayDJtcm1c2V0TmdNb2R1bGVTY29wZX1cbiAgICovXG4gIHJlZ2lzdGVyTmdNb2R1bGUodHlwZTogVHlwZTxhbnk+LCBzY29wZUluZm86IE5nTW9kdWxlU2NvcGVJbmZvRnJvbURlY29yYXRvcik6IHZvaWQge1xuICAgIGlmICghaXNOZ01vZHVsZSh0eXBlKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBBdHRlbXB0aW5nIHRvIHJlZ2lzdGVyIGEgVHlwZSB3aGljaCBpcyBub3QgTmdNb2R1bGUgYXMgTmdNb2R1bGU6ICR7dHlwZX1gKTtcbiAgICB9XG5cbiAgICAvLyBMYXppbHkgcHJvY2VzcyB0aGUgTmdNb2R1bGVzIGxhdGVyIHdoZW4gbmVlZGVkLlxuICAgIHRoaXMubmdNb2R1bGVzV2l0aFNvbWVVbnJlc29sdmVkRGVjbHMuYWRkKHR5cGUpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBjbGVhclNjb3BlQ2FjaGVGb3IodHlwZTogVHlwZTxhbnk+KTogdm9pZCB7XG4gICAgdGhpcy5uZ01vZHVsZXNTY29wZUNhY2hlLmRlbGV0ZSh0eXBlIGFzIE5nTW9kdWxlVHlwZSk7XG4gICAgdGhpcy5zdGFuZGFsb25lQ29tcG9uZW50c1Njb3BlQ2FjaGUuZGVsZXRlKHR5cGUgYXMgQ29tcG9uZW50VHlwZTxhbnk+KTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgZ2V0TmdNb2R1bGVTY29wZSh0eXBlOiBOZ01vZHVsZVR5cGU8YW55Pik6IE5nTW9kdWxlU2NvcGUge1xuICAgIGlmICh0aGlzLm5nTW9kdWxlc1Njb3BlQ2FjaGUuaGFzKHR5cGUpKSB7XG4gICAgICByZXR1cm4gdGhpcy5uZ01vZHVsZXNTY29wZUNhY2hlLmdldCh0eXBlKSE7XG4gICAgfVxuXG4gICAgY29uc3Qgc2NvcGUgPSB0aGlzLmNvbXB1dGVOZ01vZHVsZVNjb3BlKHR5cGUpO1xuICAgIHRoaXMubmdNb2R1bGVzU2NvcGVDYWNoZS5zZXQodHlwZSwgc2NvcGUpO1xuXG4gICAgcmV0dXJuIHNjb3BlO1xuICB9XG5cbiAgLyoqIENvbXB1dGUgTmdNb2R1bGUgc2NvcGUgYWZyZXNoLiAqL1xuICBwcml2YXRlIGNvbXB1dGVOZ01vZHVsZVNjb3BlKHR5cGU6IE5nTW9kdWxlVHlwZTxhbnk+KTogTmdNb2R1bGVTY29wZSB7XG4gICAgY29uc3QgZGVmID0gZ2V0TmdNb2R1bGVEZWYodHlwZSwgdHJ1ZSk7XG4gICAgY29uc3Qgc2NvcGU6IE5nTW9kdWxlU2NvcGUgPSB7XG4gICAgICBleHBvcnRlZDoge2RpcmVjdGl2ZXM6IG5ldyBTZXQoKSwgcGlwZXM6IG5ldyBTZXQoKX0sXG4gICAgICBjb21waWxhdGlvbjoge2RpcmVjdGl2ZXM6IG5ldyBTZXQoKSwgcGlwZXM6IG5ldyBTZXQoKX0sXG4gICAgfTtcblxuICAgIC8vIEFuYWx5emluZyBpbXBvcnRzXG4gICAgZm9yIChjb25zdCBpbXBvcnRlZCBvZiBtYXliZVVud3JhcEZuKGRlZi5pbXBvcnRzKSkge1xuICAgICAgaWYgKGlzTmdNb2R1bGUoaW1wb3J0ZWQpKSB7XG4gICAgICAgIGNvbnN0IGltcG9ydGVkU2NvcGUgPSB0aGlzLmdldE5nTW9kdWxlU2NvcGUoaW1wb3J0ZWQpO1xuXG4gICAgICAgIC8vIFdoZW4gdGhpcyBtb2R1bGUgaW1wb3J0cyBhbm90aGVyLCB0aGUgaW1wb3J0ZWQgbW9kdWxlJ3MgZXhwb3J0ZWQgZGlyZWN0aXZlcyBhbmQgcGlwZXNcbiAgICAgICAgLy8gYXJlIGFkZGVkIHRvIHRoZSBjb21waWxhdGlvbiBzY29wZSBvZiB0aGlzIG1vZHVsZS5cbiAgICAgICAgYWRkU2V0KGltcG9ydGVkU2NvcGUuZXhwb3J0ZWQuZGlyZWN0aXZlcywgc2NvcGUuY29tcGlsYXRpb24uZGlyZWN0aXZlcyk7XG4gICAgICAgIGFkZFNldChpbXBvcnRlZFNjb3BlLmV4cG9ydGVkLnBpcGVzLCBzY29wZS5jb21waWxhdGlvbi5waXBlcyk7XG4gICAgICB9IGVsc2UgaWYgKGlzU3RhbmRhbG9uZShpbXBvcnRlZCkpIHtcbiAgICAgICAgaWYgKGlzRGlyZWN0aXZlKGltcG9ydGVkKSB8fCBpc0NvbXBvbmVudChpbXBvcnRlZCkpIHtcbiAgICAgICAgICBzY29wZS5jb21waWxhdGlvbi5kaXJlY3RpdmVzLmFkZChpbXBvcnRlZCk7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNQaXBlKGltcG9ydGVkKSkge1xuICAgICAgICAgIHNjb3BlLmNvbXBpbGF0aW9uLnBpcGVzLmFkZChpbXBvcnRlZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gVGhlIHN0YW5kYWxvbmUgdGhpbmcgaXMgbmVpdGhlciBhIGNvbXBvbmVudCBub3IgYSBkaXJlY3RpdmUgbm9yIGEgcGlwZSAuLi4gKHdoYXQ/KVxuICAgICAgICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgICAgICBSdW50aW1lRXJyb3JDb2RlLlJVTlRJTUVfREVQU19JTlZBTElEX0lNUE9SVEVEX1RZUEUsXG4gICAgICAgICAgICAnVGhlIHN0YW5kYWxvbmUgaW1wb3J0ZWQgdHlwZSBpcyBuZWl0aGVyIGEgY29tcG9uZW50IG5vciBhIGRpcmVjdGl2ZSBub3IgYSBwaXBlJyxcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBUaGUgaW1wb3J0IGlzIG5laXRoZXIgYSBtb2R1bGUgbm9yIGEgbW9kdWxlLXdpdGgtcHJvdmlkZXJzIG5vciBhIHN0YW5kYWxvbmUgdGhpbmcuIFRoaXNcbiAgICAgICAgLy8gaXMgZ29pbmcgdG8gYmUgYW4gZXJyb3IuIFNvIHdlIHNob3J0IGNpcmN1aXQuXG4gICAgICAgIHNjb3BlLmNvbXBpbGF0aW9uLmlzUG9pc29uZWQgPSB0cnVlO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBBbmFseXppbmcgZGVjbGFyYXRpb25zXG4gICAgaWYgKCFzY29wZS5jb21waWxhdGlvbi5pc1BvaXNvbmVkKSB7XG4gICAgICBmb3IgKGNvbnN0IGRlY2wgb2YgbWF5YmVVbndyYXBGbihkZWYuZGVjbGFyYXRpb25zKSkge1xuICAgICAgICAvLyBDYW5ub3QgZGVjbGFyZSBhbm90aGVyIE5nTW9kdWxlIG9yIGEgc3RhbmRhbG9uZSB0aGluZ1xuICAgICAgICBpZiAoaXNOZ01vZHVsZShkZWNsKSB8fCBpc1N0YW5kYWxvbmUoZGVjbCkpIHtcbiAgICAgICAgICBzY29wZS5jb21waWxhdGlvbi5pc1BvaXNvbmVkID0gdHJ1ZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpc1BpcGUoZGVjbCkpIHtcbiAgICAgICAgICBzY29wZS5jb21waWxhdGlvbi5waXBlcy5hZGQoZGVjbCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gZGVjbCBpcyBlaXRoZXIgYSBkaXJlY3RpdmUgb3IgYSBjb21wb25lbnQuIFRoZSBjb21wb25lbnQgbWF5IG5vdCB5ZXQgaGF2ZSB0aGUgybVjbXAgZHVlXG4gICAgICAgICAgLy8gdG8gYXN5bmMgY29tcGlsYXRpb24uXG4gICAgICAgICAgc2NvcGUuY29tcGlsYXRpb24uZGlyZWN0aXZlcy5hZGQoZGVjbCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBBbmFseXppbmcgZXhwb3J0c1xuICAgIGZvciAoY29uc3QgZXhwb3J0ZWQgb2YgbWF5YmVVbndyYXBGbihkZWYuZXhwb3J0cykpIHtcbiAgICAgIGlmIChpc05nTW9kdWxlKGV4cG9ydGVkKSkge1xuICAgICAgICAvLyBXaGVuIHRoaXMgbW9kdWxlIGV4cG9ydHMgYW5vdGhlciwgdGhlIGV4cG9ydGVkIG1vZHVsZSdzIGV4cG9ydGVkIGRpcmVjdGl2ZXMgYW5kIHBpcGVzXG4gICAgICAgIC8vIGFyZSBhZGRlZCB0byBib3RoIHRoZSBjb21waWxhdGlvbiBhbmQgZXhwb3J0ZWQgc2NvcGVzIG9mIHRoaXMgbW9kdWxlLlxuICAgICAgICBjb25zdCBleHBvcnRlZFNjb3BlID0gdGhpcy5nZXROZ01vZHVsZVNjb3BlKGV4cG9ydGVkKTtcblxuICAgICAgICAvLyBCYXNlZCBvbiB0aGUgY3VycmVudCBsb2dpYyB0aGVyZSBpcyBubyB3YXkgdG8gaGF2ZSBwb2lzb25lZCBleHBvcnRlZCBzY29wZS4gU28gbm8gbmVlZCB0b1xuICAgICAgICAvLyBjaGVjayBmb3IgaXQuXG4gICAgICAgIGFkZFNldChleHBvcnRlZFNjb3BlLmV4cG9ydGVkLmRpcmVjdGl2ZXMsIHNjb3BlLmV4cG9ydGVkLmRpcmVjdGl2ZXMpO1xuICAgICAgICBhZGRTZXQoZXhwb3J0ZWRTY29wZS5leHBvcnRlZC5waXBlcywgc2NvcGUuZXhwb3J0ZWQucGlwZXMpO1xuXG4gICAgICAgIC8vIFNvbWUgdGVzdCB0b29saW5ncyB3aGljaCBydW4gaW4gSklUIG1vZGUgZGVwZW5kIG9uIHRoaXMgYmVoYXZpb3IgdGhhdCB0aGUgZXhwb3J0ZWQgc2NvcGVcbiAgICAgICAgLy8gc2hvdWxkIGFsc28gYmUgcHJlc2VudCBpbiB0aGUgY29tcGlsYXRpb24gc2NvcGUsIGV2ZW4gdGhvdWdoIEFvVCBkb2VzIG5vdCBzdXBwb3J0IHRoaXNcbiAgICAgICAgLy8gYW5kIGl0IGlzIGFsc28gaW4gb2RkcyB3aXRoIE5nTW9kdWxlIG1ldGFkYXRhIGRlZmluaXRpb25zLiBXaXRob3V0IHRoaXMgc29tZSB0ZXN0cyBpblxuICAgICAgICAvLyBHb29nbGUgd2lsbCBmYWlsLlxuICAgICAgICBhZGRTZXQoZXhwb3J0ZWRTY29wZS5leHBvcnRlZC5kaXJlY3RpdmVzLCBzY29wZS5jb21waWxhdGlvbi5kaXJlY3RpdmVzKTtcbiAgICAgICAgYWRkU2V0KGV4cG9ydGVkU2NvcGUuZXhwb3J0ZWQucGlwZXMsIHNjb3BlLmNvbXBpbGF0aW9uLnBpcGVzKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNQaXBlKGV4cG9ydGVkKSkge1xuICAgICAgICBzY29wZS5leHBvcnRlZC5waXBlcy5hZGQoZXhwb3J0ZWQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2NvcGUuZXhwb3J0ZWQuZGlyZWN0aXZlcy5hZGQoZXhwb3J0ZWQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBzY29wZTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgZ2V0U3RhbmRhbG9uZUNvbXBvbmVudFNjb3BlKFxuICAgIHR5cGU6IENvbXBvbmVudFR5cGU8YW55PixcbiAgICByYXdJbXBvcnRzPzogUmF3U2NvcGVJbmZvRnJvbURlY29yYXRvcltdLFxuICApOiBTdGFuZGFsb25lQ29tcG9uZW50U2NvcGUge1xuICAgIGlmICh0aGlzLnN0YW5kYWxvbmVDb21wb25lbnRzU2NvcGVDYWNoZS5oYXModHlwZSkpIHtcbiAgICAgIHJldHVybiB0aGlzLnN0YW5kYWxvbmVDb21wb25lbnRzU2NvcGVDYWNoZS5nZXQodHlwZSkhO1xuICAgIH1cblxuICAgIGNvbnN0IGFucyA9IHRoaXMuY29tcHV0ZVN0YW5kYWxvbmVDb21wb25lbnRTY29wZSh0eXBlLCByYXdJbXBvcnRzKTtcbiAgICB0aGlzLnN0YW5kYWxvbmVDb21wb25lbnRzU2NvcGVDYWNoZS5zZXQodHlwZSwgYW5zKTtcblxuICAgIHJldHVybiBhbnM7XG4gIH1cblxuICBwcml2YXRlIGNvbXB1dGVTdGFuZGFsb25lQ29tcG9uZW50U2NvcGUoXG4gICAgdHlwZTogQ29tcG9uZW50VHlwZTxhbnk+LFxuICAgIHJhd0ltcG9ydHM/OiBSYXdTY29wZUluZm9Gcm9tRGVjb3JhdG9yW10sXG4gICk6IFN0YW5kYWxvbmVDb21wb25lbnRTY29wZSB7XG4gICAgY29uc3QgYW5zOiBTdGFuZGFsb25lQ29tcG9uZW50U2NvcGUgPSB7XG4gICAgICBjb21waWxhdGlvbjoge1xuICAgICAgICAvLyBTdGFuZGFsb25lIGNvbXBvbmVudHMgYXJlIGFsd2F5cyBhYmxlIHRvIHNlbGYtcmVmZXJlbmNlLlxuICAgICAgICBkaXJlY3RpdmVzOiBuZXcgU2V0KFt0eXBlXSksXG4gICAgICAgIHBpcGVzOiBuZXcgU2V0KCksXG4gICAgICAgIG5nTW9kdWxlczogbmV3IFNldCgpLFxuICAgICAgfSxcbiAgICB9O1xuXG4gICAgZm9yIChjb25zdCByYXdJbXBvcnQgb2YgZmxhdHRlbihyYXdJbXBvcnRzID8/IFtdKSkge1xuICAgICAgY29uc3QgaW1wb3J0ZWQgPSByZXNvbHZlRm9yd2FyZFJlZihyYXdJbXBvcnQpIGFzIFR5cGU8YW55PjtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgdmVyaWZ5U3RhbmRhbG9uZUltcG9ydChpbXBvcnRlZCwgdHlwZSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIFNob3J0LWNpcmN1aXQgaWYgYW4gaW1wb3J0IGlzIG5vdCB2YWxpZFxuICAgICAgICBhbnMuY29tcGlsYXRpb24uaXNQb2lzb25lZCA9IHRydWU7XG4gICAgICAgIHJldHVybiBhbnM7XG4gICAgICB9XG5cbiAgICAgIGlmIChpc05nTW9kdWxlKGltcG9ydGVkKSkge1xuICAgICAgICBhbnMuY29tcGlsYXRpb24ubmdNb2R1bGVzLmFkZChpbXBvcnRlZCk7XG4gICAgICAgIGNvbnN0IGltcG9ydGVkU2NvcGUgPSB0aGlzLmdldE5nTW9kdWxlU2NvcGUoaW1wb3J0ZWQpO1xuXG4gICAgICAgIC8vIFNob3J0LWNpcmN1aXQgaWYgYW4gaW1wb3J0ZWQgTmdNb2R1bGUgaGFzIGNvcnJ1cHRlZCBleHBvcnRlZCBzY29wZS5cbiAgICAgICAgaWYgKGltcG9ydGVkU2NvcGUuZXhwb3J0ZWQuaXNQb2lzb25lZCkge1xuICAgICAgICAgIGFucy5jb21waWxhdGlvbi5pc1BvaXNvbmVkID0gdHJ1ZTtcbiAgICAgICAgICByZXR1cm4gYW5zO1xuICAgICAgICB9XG5cbiAgICAgICAgYWRkU2V0KGltcG9ydGVkU2NvcGUuZXhwb3J0ZWQuZGlyZWN0aXZlcywgYW5zLmNvbXBpbGF0aW9uLmRpcmVjdGl2ZXMpO1xuICAgICAgICBhZGRTZXQoaW1wb3J0ZWRTY29wZS5leHBvcnRlZC5waXBlcywgYW5zLmNvbXBpbGF0aW9uLnBpcGVzKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNQaXBlKGltcG9ydGVkKSkge1xuICAgICAgICBhbnMuY29tcGlsYXRpb24ucGlwZXMuYWRkKGltcG9ydGVkKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNEaXJlY3RpdmUoaW1wb3J0ZWQpIHx8IGlzQ29tcG9uZW50KGltcG9ydGVkKSkge1xuICAgICAgICBhbnMuY29tcGlsYXRpb24uZGlyZWN0aXZlcy5hZGQoaW1wb3J0ZWQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gVGhlIGltcG9ydGVkIHRoaW5nIGlzIG5vdCBtb2R1bGUvcGlwZS9kaXJlY3RpdmUvY29tcG9uZW50LCBzbyB3ZSBlcnJvciBhbmQgc2hvcnQtY2lyY3VpdFxuICAgICAgICAvLyBoZXJlXG4gICAgICAgIGFucy5jb21waWxhdGlvbi5pc1BvaXNvbmVkID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIGFucztcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gYW5zO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBpc09ycGhhbkNvbXBvbmVudChjbXA6IFR5cGU8YW55Pik6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGRlZiA9IGdldENvbXBvbmVudERlZihjbXApO1xuXG4gICAgaWYgKCFkZWYgfHwgZGVmLnN0YW5kYWxvbmUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB0aGlzLnJlc29sdmVOZ01vZHVsZXNEZWNscygpO1xuXG4gICAgcmV0dXJuICF0aGlzLm93bmVyTmdNb2R1bGUuaGFzKGNtcCBhcyBDb21wb25lbnRUeXBlPGFueT4pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFkZFNldDxUPihzb3VyY2VTZXQ6IFNldDxUPiwgdGFyZ2V0U2V0OiBTZXQ8VD4pOiB2b2lkIHtcbiAgZm9yIChjb25zdCBtIG9mIHNvdXJjZVNldCkge1xuICAgIHRhcmdldFNldC5hZGQobSk7XG4gIH1cbn1cblxuLyoqIFRoZSBkZXBzIHRyYWNrZXIgdG8gYmUgdXNlZCBpbiB0aGUgY3VycmVudCBBbmd1bGFyIGFwcCBpbiBkZXYgbW9kZS4gKi9cbmV4cG9ydCBjb25zdCBkZXBzVHJhY2tlciA9IG5ldyBEZXBzVHJhY2tlcigpO1xuXG5leHBvcnQgY29uc3QgVEVTVF9PTkxZID0ge0RlcHNUcmFja2VyfTtcbiJdfQ==