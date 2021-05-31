/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/ngtsc/scope/src/typecheck", ["require", "exports", "tslib", "@angular/compiler", "typescript", "@angular/compiler-cli/src/ngtsc/metadata"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TypeCheckScopeRegistry = void 0;
    var tslib_1 = require("tslib");
    var compiler_1 = require("@angular/compiler");
    var ts = require("typescript");
    var metadata_1 = require("@angular/compiler-cli/src/ngtsc/metadata");
    /**
     * Computes scope information to be used in template type checking.
     */
    var TypeCheckScopeRegistry = /** @class */ (function () {
        function TypeCheckScopeRegistry(scopeReader, metaReader) {
            this.scopeReader = scopeReader;
            this.metaReader = metaReader;
            /**
             * Cache of flattened directive metadata. Because flattened metadata is scope-invariant it's
             * cached individually, such that all scopes refer to the same flattened metadata.
             */
            this.flattenedDirectiveMetaCache = new Map();
            /**
             * Cache of the computed type check scope per NgModule declaration.
             */
            this.scopeCache = new Map();
        }
        /**
         * Computes the type-check scope information for the component declaration. If the NgModule
         * contains an error, then 'error' is returned. If the component is not declared in any NgModule,
         * an empty type-check scope is returned.
         */
        TypeCheckScopeRegistry.prototype.getTypeCheckScope = function (node) {
            var e_1, _a, e_2, _b;
            var matcher = new compiler_1.SelectorMatcher();
            var directives = [];
            var pipes = new Map();
            var scope = this.scopeReader.getScopeForComponent(node);
            if (scope === null) {
                return {
                    matcher: matcher,
                    directives: directives,
                    pipes: pipes,
                    schemas: [],
                    isPoisoned: false,
                };
            }
            if (this.scopeCache.has(scope.ngModule)) {
                return this.scopeCache.get(scope.ngModule);
            }
            try {
                for (var _c = tslib_1.__values(scope.compilation.directives), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var meta = _d.value;
                    if (meta.selector !== null) {
                        var extMeta = this.getTypeCheckDirectiveMetadata(meta.ref);
                        matcher.addSelectables(compiler_1.CssSelector.parse(meta.selector), extMeta);
                        directives.push(extMeta);
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_1) throw e_1.error; }
            }
            try {
                for (var _e = tslib_1.__values(scope.compilation.pipes), _f = _e.next(); !_f.done; _f = _e.next()) {
                    var _g = _f.value, name_1 = _g.name, ref = _g.ref;
                    if (!ts.isClassDeclaration(ref.node)) {
                        throw new Error("Unexpected non-class declaration " + ts.SyntaxKind[ref.node.kind] + " for pipe " + ref.debugName);
                    }
                    pipes.set(name_1, ref);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                }
                finally { if (e_2) throw e_2.error; }
            }
            var typeCheckScope = {
                matcher: matcher,
                directives: directives,
                pipes: pipes,
                schemas: scope.schemas,
                isPoisoned: scope.compilation.isPoisoned || scope.exported.isPoisoned,
            };
            this.scopeCache.set(scope.ngModule, typeCheckScope);
            return typeCheckScope;
        };
        TypeCheckScopeRegistry.prototype.getTypeCheckDirectiveMetadata = function (ref) {
            var clazz = ref.node;
            if (this.flattenedDirectiveMetaCache.has(clazz)) {
                return this.flattenedDirectiveMetaCache.get(clazz);
            }
            var meta = metadata_1.flattenInheritedDirectiveMetadata(this.metaReader, ref);
            this.flattenedDirectiveMetaCache.set(clazz, meta);
            return meta;
        };
        return TypeCheckScopeRegistry;
    }());
    exports.TypeCheckScopeRegistry = TypeCheckScopeRegistry;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZWNoZWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy9uZ3RzYy9zY29wZS9zcmMvdHlwZWNoZWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCw4Q0FBK0U7SUFDL0UsK0JBQWlDO0lBR2pDLHFFQUFnRztJQXFDaEc7O09BRUc7SUFDSDtRQVlFLGdDQUFvQixXQUFpQyxFQUFVLFVBQTBCO1lBQXJFLGdCQUFXLEdBQVgsV0FBVyxDQUFzQjtZQUFVLGVBQVUsR0FBVixVQUFVLENBQWdCO1lBWHpGOzs7ZUFHRztZQUNLLGdDQUEyQixHQUFHLElBQUksR0FBRyxFQUFtQyxDQUFDO1lBRWpGOztlQUVHO1lBQ0ssZUFBVSxHQUFHLElBQUksR0FBRyxFQUFvQyxDQUFDO1FBRTJCLENBQUM7UUFFN0Y7Ozs7V0FJRztRQUNILGtEQUFpQixHQUFqQixVQUFrQixJQUFzQjs7WUFDdEMsSUFBTSxPQUFPLEdBQUcsSUFBSSwwQkFBZSxFQUFpQixDQUFDO1lBQ3JELElBQU0sVUFBVSxHQUFvQixFQUFFLENBQUM7WUFDdkMsSUFBTSxLQUFLLEdBQUcsSUFBSSxHQUFHLEVBQTRELENBQUM7WUFFbEYsSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMxRCxJQUFJLEtBQUssS0FBSyxJQUFJLEVBQUU7Z0JBQ2xCLE9BQU87b0JBQ0wsT0FBTyxTQUFBO29CQUNQLFVBQVUsWUFBQTtvQkFDVixLQUFLLE9BQUE7b0JBQ0wsT0FBTyxFQUFFLEVBQUU7b0JBQ1gsVUFBVSxFQUFFLEtBQUs7aUJBQ2xCLENBQUM7YUFDSDtZQUVELElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUN2QyxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUUsQ0FBQzthQUM3Qzs7Z0JBRUQsS0FBbUIsSUFBQSxLQUFBLGlCQUFBLEtBQUssQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFBLGdCQUFBLDRCQUFFO29CQUE1QyxJQUFNLElBQUksV0FBQTtvQkFDYixJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssSUFBSSxFQUFFO3dCQUMxQixJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsNkJBQTZCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO3dCQUM3RCxPQUFPLENBQUMsY0FBYyxDQUFDLHNCQUFXLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQzt3QkFDbEUsVUFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztxQkFDMUI7aUJBQ0Y7Ozs7Ozs7Ozs7Z0JBRUQsS0FBMEIsSUFBQSxLQUFBLGlCQUFBLEtBQUssQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFBLGdCQUFBLDRCQUFFO29CQUF4QyxJQUFBLGFBQVcsRUFBVixNQUFJLFVBQUEsRUFBRSxHQUFHLFNBQUE7b0JBQ25CLElBQUksQ0FBQyxFQUFFLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFO3dCQUNwQyxNQUFNLElBQUksS0FBSyxDQUFDLHNDQUNaLEVBQUUsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWEsR0FBRyxDQUFDLFNBQVcsQ0FBQyxDQUFDO3FCQUMvRDtvQkFDRCxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQUksRUFBRSxHQUF1RCxDQUFDLENBQUM7aUJBQzFFOzs7Ozs7Ozs7WUFFRCxJQUFNLGNBQWMsR0FBbUI7Z0JBQ3JDLE9BQU8sU0FBQTtnQkFDUCxVQUFVLFlBQUE7Z0JBQ1YsS0FBSyxPQUFBO2dCQUNMLE9BQU8sRUFBRSxLQUFLLENBQUMsT0FBTztnQkFDdEIsVUFBVSxFQUFFLEtBQUssQ0FBQyxXQUFXLENBQUMsVUFBVSxJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsVUFBVTthQUN0RSxDQUFDO1lBQ0YsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxjQUFjLENBQUMsQ0FBQztZQUNwRCxPQUFPLGNBQWMsQ0FBQztRQUN4QixDQUFDO1FBRUQsOERBQTZCLEdBQTdCLFVBQThCLEdBQWdDO1lBQzVELElBQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUM7WUFDdkIsSUFBSSxJQUFJLENBQUMsMkJBQTJCLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUMvQyxPQUFPLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFFLENBQUM7YUFDckQ7WUFFRCxJQUFNLElBQUksR0FBRyw0Q0FBaUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ3JFLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ2xELE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUNILDZCQUFDO0lBQUQsQ0FBQyxBQTVFRCxJQTRFQztJQTVFWSx3REFBc0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtDc3NTZWxlY3RvciwgU2NoZW1hTWV0YWRhdGEsIFNlbGVjdG9yTWF0Y2hlcn0gZnJvbSAnQGFuZ3VsYXIvY29tcGlsZXInO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7UmVmZXJlbmNlfSBmcm9tICcuLi8uLi9pbXBvcnRzJztcbmltcG9ydCB7RGlyZWN0aXZlTWV0YSwgZmxhdHRlbkluaGVyaXRlZERpcmVjdGl2ZU1ldGFkYXRhLCBNZXRhZGF0YVJlYWRlcn0gZnJvbSAnLi4vLi4vbWV0YWRhdGEnO1xuaW1wb3J0IHtDbGFzc0RlY2xhcmF0aW9ufSBmcm9tICcuLi8uLi9yZWZsZWN0aW9uJztcblxuaW1wb3J0IHtDb21wb25lbnRTY29wZVJlYWRlcn0gZnJvbSAnLi9jb21wb25lbnRfc2NvcGUnO1xuXG4vKipcbiAqIFRoZSBzY29wZSB0aGF0IGlzIHVzZWQgZm9yIHR5cGUtY2hlY2sgY29kZSBnZW5lcmF0aW9uIG9mIGEgY29tcG9uZW50IHRlbXBsYXRlLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFR5cGVDaGVja1Njb3BlIHtcbiAgLyoqXG4gICAqIEEgYFNlbGVjdG9yTWF0Y2hlcmAgaW5zdGFuY2UgdGhhdCBjb250YWlucyB0aGUgZmxhdHRlbmVkIGRpcmVjdGl2ZSBtZXRhZGF0YSBvZiBhbGwgZGlyZWN0aXZlc1xuICAgKiB0aGF0IGFyZSBpbiB0aGUgY29tcGlsYXRpb24gc2NvcGUgb2YgdGhlIGRlY2xhcmluZyBOZ01vZHVsZS5cbiAgICovXG4gIG1hdGNoZXI6IFNlbGVjdG9yTWF0Y2hlcjxEaXJlY3RpdmVNZXRhPjtcblxuICAvKipcbiAgICogQWxsIG9mIHRoZSBkaXJlY3RpdmVzIGF2YWlsYWJsZSBpbiB0aGUgY29tcGlsYXRpb24gc2NvcGUgb2YgdGhlIGRlY2xhcmluZyBOZ01vZHVsZS5cbiAgICovXG4gIGRpcmVjdGl2ZXM6IERpcmVjdGl2ZU1ldGFbXTtcblxuICAvKipcbiAgICogVGhlIHBpcGVzIHRoYXQgYXJlIGF2YWlsYWJsZSBpbiB0aGUgY29tcGlsYXRpb24gc2NvcGUuXG4gICAqL1xuICBwaXBlczogTWFwPHN0cmluZywgUmVmZXJlbmNlPENsYXNzRGVjbGFyYXRpb248dHMuQ2xhc3NEZWNsYXJhdGlvbj4+PjtcblxuICAvKipcbiAgICogVGhlIHNjaGVtYXMgdGhhdCBhcmUgdXNlZCBpbiB0aGlzIHNjb3BlLlxuICAgKi9cbiAgc2NoZW1hczogU2NoZW1hTWV0YWRhdGFbXTtcblxuICAvKipcbiAgICogV2hldGhlciB0aGUgb3JpZ2luYWwgY29tcGlsYXRpb24gc2NvcGUgd2hpY2ggcHJvZHVjZWQgdGhpcyBgVHlwZUNoZWNrU2NvcGVgIHdhcyBpdHNlbGYgcG9pc29uZWRcbiAgICogKGNvbnRhaW5lZCBzZW1hbnRpYyBlcnJvcnMgZHVyaW5nIGl0cyBwcm9kdWN0aW9uKS5cbiAgICovXG4gIGlzUG9pc29uZWQ6IGJvb2xlYW47XG59XG5cbi8qKlxuICogQ29tcHV0ZXMgc2NvcGUgaW5mb3JtYXRpb24gdG8gYmUgdXNlZCBpbiB0ZW1wbGF0ZSB0eXBlIGNoZWNraW5nLlxuICovXG5leHBvcnQgY2xhc3MgVHlwZUNoZWNrU2NvcGVSZWdpc3RyeSB7XG4gIC8qKlxuICAgKiBDYWNoZSBvZiBmbGF0dGVuZWQgZGlyZWN0aXZlIG1ldGFkYXRhLiBCZWNhdXNlIGZsYXR0ZW5lZCBtZXRhZGF0YSBpcyBzY29wZS1pbnZhcmlhbnQgaXQnc1xuICAgKiBjYWNoZWQgaW5kaXZpZHVhbGx5LCBzdWNoIHRoYXQgYWxsIHNjb3BlcyByZWZlciB0byB0aGUgc2FtZSBmbGF0dGVuZWQgbWV0YWRhdGEuXG4gICAqL1xuICBwcml2YXRlIGZsYXR0ZW5lZERpcmVjdGl2ZU1ldGFDYWNoZSA9IG5ldyBNYXA8Q2xhc3NEZWNsYXJhdGlvbiwgRGlyZWN0aXZlTWV0YT4oKTtcblxuICAvKipcbiAgICogQ2FjaGUgb2YgdGhlIGNvbXB1dGVkIHR5cGUgY2hlY2sgc2NvcGUgcGVyIE5nTW9kdWxlIGRlY2xhcmF0aW9uLlxuICAgKi9cbiAgcHJpdmF0ZSBzY29wZUNhY2hlID0gbmV3IE1hcDxDbGFzc0RlY2xhcmF0aW9uLCBUeXBlQ2hlY2tTY29wZT4oKTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHNjb3BlUmVhZGVyOiBDb21wb25lbnRTY29wZVJlYWRlciwgcHJpdmF0ZSBtZXRhUmVhZGVyOiBNZXRhZGF0YVJlYWRlcikge31cblxuICAvKipcbiAgICogQ29tcHV0ZXMgdGhlIHR5cGUtY2hlY2sgc2NvcGUgaW5mb3JtYXRpb24gZm9yIHRoZSBjb21wb25lbnQgZGVjbGFyYXRpb24uIElmIHRoZSBOZ01vZHVsZVxuICAgKiBjb250YWlucyBhbiBlcnJvciwgdGhlbiAnZXJyb3InIGlzIHJldHVybmVkLiBJZiB0aGUgY29tcG9uZW50IGlzIG5vdCBkZWNsYXJlZCBpbiBhbnkgTmdNb2R1bGUsXG4gICAqIGFuIGVtcHR5IHR5cGUtY2hlY2sgc2NvcGUgaXMgcmV0dXJuZWQuXG4gICAqL1xuICBnZXRUeXBlQ2hlY2tTY29wZShub2RlOiBDbGFzc0RlY2xhcmF0aW9uKTogVHlwZUNoZWNrU2NvcGUge1xuICAgIGNvbnN0IG1hdGNoZXIgPSBuZXcgU2VsZWN0b3JNYXRjaGVyPERpcmVjdGl2ZU1ldGE+KCk7XG4gICAgY29uc3QgZGlyZWN0aXZlczogRGlyZWN0aXZlTWV0YVtdID0gW107XG4gICAgY29uc3QgcGlwZXMgPSBuZXcgTWFwPHN0cmluZywgUmVmZXJlbmNlPENsYXNzRGVjbGFyYXRpb248dHMuQ2xhc3NEZWNsYXJhdGlvbj4+PigpO1xuXG4gICAgY29uc3Qgc2NvcGUgPSB0aGlzLnNjb3BlUmVhZGVyLmdldFNjb3BlRm9yQ29tcG9uZW50KG5vZGUpO1xuICAgIGlmIChzY29wZSA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbWF0Y2hlcixcbiAgICAgICAgZGlyZWN0aXZlcyxcbiAgICAgICAgcGlwZXMsXG4gICAgICAgIHNjaGVtYXM6IFtdLFxuICAgICAgICBpc1BvaXNvbmVkOiBmYWxzZSxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc2NvcGVDYWNoZS5oYXMoc2NvcGUubmdNb2R1bGUpKSB7XG4gICAgICByZXR1cm4gdGhpcy5zY29wZUNhY2hlLmdldChzY29wZS5uZ01vZHVsZSkhO1xuICAgIH1cblxuICAgIGZvciAoY29uc3QgbWV0YSBvZiBzY29wZS5jb21waWxhdGlvbi5kaXJlY3RpdmVzKSB7XG4gICAgICBpZiAobWV0YS5zZWxlY3RvciAhPT0gbnVsbCkge1xuICAgICAgICBjb25zdCBleHRNZXRhID0gdGhpcy5nZXRUeXBlQ2hlY2tEaXJlY3RpdmVNZXRhZGF0YShtZXRhLnJlZik7XG4gICAgICAgIG1hdGNoZXIuYWRkU2VsZWN0YWJsZXMoQ3NzU2VsZWN0b3IucGFyc2UobWV0YS5zZWxlY3RvciksIGV4dE1ldGEpO1xuICAgICAgICBkaXJlY3RpdmVzLnB1c2goZXh0TWV0YSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCB7bmFtZSwgcmVmfSBvZiBzY29wZS5jb21waWxhdGlvbi5waXBlcykge1xuICAgICAgaWYgKCF0cy5pc0NsYXNzRGVjbGFyYXRpb24ocmVmLm5vZGUpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5leHBlY3RlZCBub24tY2xhc3MgZGVjbGFyYXRpb24gJHtcbiAgICAgICAgICAgIHRzLlN5bnRheEtpbmRbcmVmLm5vZGUua2luZF19IGZvciBwaXBlICR7cmVmLmRlYnVnTmFtZX1gKTtcbiAgICAgIH1cbiAgICAgIHBpcGVzLnNldChuYW1lLCByZWYgYXMgUmVmZXJlbmNlPENsYXNzRGVjbGFyYXRpb248dHMuQ2xhc3NEZWNsYXJhdGlvbj4+KTtcbiAgICB9XG5cbiAgICBjb25zdCB0eXBlQ2hlY2tTY29wZTogVHlwZUNoZWNrU2NvcGUgPSB7XG4gICAgICBtYXRjaGVyLFxuICAgICAgZGlyZWN0aXZlcyxcbiAgICAgIHBpcGVzLFxuICAgICAgc2NoZW1hczogc2NvcGUuc2NoZW1hcyxcbiAgICAgIGlzUG9pc29uZWQ6IHNjb3BlLmNvbXBpbGF0aW9uLmlzUG9pc29uZWQgfHwgc2NvcGUuZXhwb3J0ZWQuaXNQb2lzb25lZCxcbiAgICB9O1xuICAgIHRoaXMuc2NvcGVDYWNoZS5zZXQoc2NvcGUubmdNb2R1bGUsIHR5cGVDaGVja1Njb3BlKTtcbiAgICByZXR1cm4gdHlwZUNoZWNrU2NvcGU7XG4gIH1cblxuICBnZXRUeXBlQ2hlY2tEaXJlY3RpdmVNZXRhZGF0YShyZWY6IFJlZmVyZW5jZTxDbGFzc0RlY2xhcmF0aW9uPik6IERpcmVjdGl2ZU1ldGEge1xuICAgIGNvbnN0IGNsYXp6ID0gcmVmLm5vZGU7XG4gICAgaWYgKHRoaXMuZmxhdHRlbmVkRGlyZWN0aXZlTWV0YUNhY2hlLmhhcyhjbGF6eikpIHtcbiAgICAgIHJldHVybiB0aGlzLmZsYXR0ZW5lZERpcmVjdGl2ZU1ldGFDYWNoZS5nZXQoY2xhenopITtcbiAgICB9XG5cbiAgICBjb25zdCBtZXRhID0gZmxhdHRlbkluaGVyaXRlZERpcmVjdGl2ZU1ldGFkYXRhKHRoaXMubWV0YVJlYWRlciwgcmVmKTtcbiAgICB0aGlzLmZsYXR0ZW5lZERpcmVjdGl2ZU1ldGFDYWNoZS5zZXQoY2xhenosIG1ldGEpO1xuICAgIHJldHVybiBtZXRhO1xuICB9XG59XG4iXX0=