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
        define("@angular/compiler-cli/src/ngtsc/scope/src/dependency", ["require", "exports", "tslib"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MetadataDtsModuleScopeResolver = void 0;
    var tslib_1 = require("tslib");
    /**
     * Reads Angular metadata from classes declared in .d.ts files and computes an `ExportScope`.
     *
     * Given an NgModule declared in a .d.ts file, this resolver can produce a transitive `ExportScope`
     * of all of the directives/pipes it exports. It does this by reading metadata off of Ivy static
     * fields on directives, components, pipes, and NgModules.
     */
    var MetadataDtsModuleScopeResolver = /** @class */ (function () {
        /**
         * @param dtsMetaReader a `MetadataReader` which can read metadata from `.d.ts` files.
         */
        function MetadataDtsModuleScopeResolver(dtsMetaReader, aliasingHost) {
            this.dtsMetaReader = dtsMetaReader;
            this.aliasingHost = aliasingHost;
            /**
             * Cache which holds fully resolved scopes for NgModule classes from .d.ts files.
             */
            this.cache = new Map();
        }
        /**
         * Resolve a `Reference`'d NgModule from a .d.ts file and produce a transitive `ExportScope`
         * listing the directives and pipes which that NgModule exports to others.
         *
         * This operation relies on a `Reference` instead of a direct TypeScrpt node as the `Reference`s
         * produced depend on how the original NgModule was imported.
         */
        MetadataDtsModuleScopeResolver.prototype.resolve = function (ref) {
            var e_1, _a, e_2, _b, e_3, _c, e_4, _d, e_5, _e;
            var clazz = ref.node;
            var sourceFile = clazz.getSourceFile();
            if (!sourceFile.isDeclarationFile) {
                throw new Error("Debug error: DtsModuleScopeResolver.read(" + ref.debugName + " from " + sourceFile.fileName + "), but not a .d.ts file");
            }
            if (this.cache.has(clazz)) {
                return this.cache.get(clazz);
            }
            // Build up the export scope - those directives and pipes made visible by this module.
            var directives = [];
            var pipes = [];
            var ngModules = new Set([clazz]);
            var meta = this.dtsMetaReader.getNgModuleMetadata(ref);
            if (meta === null) {
                this.cache.set(clazz, null);
                return null;
            }
            var declarations = new Set();
            try {
                for (var _f = tslib_1.__values(meta.declarations), _g = _f.next(); !_g.done; _g = _f.next()) {
                    var declRef = _g.value;
                    declarations.add(declRef.node);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_g && !_g.done && (_a = _f.return)) _a.call(_f);
                }
                finally { if (e_1) throw e_1.error; }
            }
            try {
                // Only the 'exports' field of the NgModule's metadata is important. Imports and declarations
                // don't affect the export scope.
                for (var _h = tslib_1.__values(meta.exports), _j = _h.next(); !_j.done; _j = _h.next()) {
                    var exportRef = _j.value;
                    // Attempt to process the export as a directive.
                    var directive = this.dtsMetaReader.getDirectiveMetadata(exportRef);
                    if (directive !== null) {
                        var isReExport = !declarations.has(exportRef.node);
                        directives.push(this.maybeAlias(directive, sourceFile, isReExport));
                        continue;
                    }
                    // Attempt to process the export as a pipe.
                    var pipe = this.dtsMetaReader.getPipeMetadata(exportRef);
                    if (pipe !== null) {
                        var isReExport = !declarations.has(exportRef.node);
                        pipes.push(this.maybeAlias(pipe, sourceFile, isReExport));
                        continue;
                    }
                    // Attempt to process the export as a module.
                    var exportScope_1 = this.resolve(exportRef);
                    if (exportScope_1 !== null) {
                        // It is a module. Add exported directives and pipes to the current scope. This might
                        // involve rewriting the `Reference`s to those types to have an alias expression if one is
                        // required.
                        if (this.aliasingHost === null) {
                            // Fast path when aliases aren't required.
                            directives.push.apply(directives, tslib_1.__spreadArray([], tslib_1.__read(exportScope_1.exported.directives)));
                            pipes.push.apply(pipes, tslib_1.__spreadArray([], tslib_1.__read(exportScope_1.exported.pipes)));
                        }
                        else {
                            try {
                                // It's necessary to rewrite the `Reference`s to add alias expressions. This way, imports
                                // generated to these directives and pipes will use a shallow import to `sourceFile`
                                // instead of a deep import directly to the directive or pipe class.
                                //
                                // One important check here is whether the directive/pipe is declared in the same
                                // source file as the re-exporting NgModule. This can happen if both a directive, its
                                // NgModule, and the re-exporting NgModule are all in the same file. In this case,
                                // no import alias is needed as it would go to the same file anyway.
                                for (var _k = (e_3 = void 0, tslib_1.__values(exportScope_1.exported.directives)), _l = _k.next(); !_l.done; _l = _k.next()) {
                                    var directive_1 = _l.value;
                                    directives.push(this.maybeAlias(directive_1, sourceFile, /* isReExport */ true));
                                }
                            }
                            catch (e_3_1) { e_3 = { error: e_3_1 }; }
                            finally {
                                try {
                                    if (_l && !_l.done && (_c = _k.return)) _c.call(_k);
                                }
                                finally { if (e_3) throw e_3.error; }
                            }
                            try {
                                for (var _m = (e_4 = void 0, tslib_1.__values(exportScope_1.exported.pipes)), _o = _m.next(); !_o.done; _o = _m.next()) {
                                    var pipe_1 = _o.value;
                                    pipes.push(this.maybeAlias(pipe_1, sourceFile, /* isReExport */ true));
                                }
                            }
                            catch (e_4_1) { e_4 = { error: e_4_1 }; }
                            finally {
                                try {
                                    if (_o && !_o.done && (_d = _m.return)) _d.call(_m);
                                }
                                finally { if (e_4) throw e_4.error; }
                            }
                            try {
                                for (var _p = (e_5 = void 0, tslib_1.__values(exportScope_1.exported.ngModules)), _q = _p.next(); !_q.done; _q = _p.next()) {
                                    var ngModule = _q.value;
                                    ngModules.add(ngModule);
                                }
                            }
                            catch (e_5_1) { e_5 = { error: e_5_1 }; }
                            finally {
                                try {
                                    if (_q && !_q.done && (_e = _p.return)) _e.call(_p);
                                }
                                finally { if (e_5) throw e_5.error; }
                            }
                        }
                    }
                    continue;
                    // The export was not a directive, a pipe, or a module. This is an error.
                    // TODO(alxhub): produce a ts.Diagnostic
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_j && !_j.done && (_b = _h.return)) _b.call(_h);
                }
                finally { if (e_2) throw e_2.error; }
            }
            var exportScope = {
                exported: {
                    directives: directives,
                    pipes: pipes,
                    ngModules: Array.from(ngModules),
                    isPoisoned: false,
                },
            };
            this.cache.set(clazz, exportScope);
            return exportScope;
        };
        MetadataDtsModuleScopeResolver.prototype.maybeAlias = function (dirOrPipe, maybeAliasFrom, isReExport) {
            var ref = dirOrPipe.ref;
            if (this.aliasingHost === null || ref.node.getSourceFile() === maybeAliasFrom) {
                return dirOrPipe;
            }
            var alias = this.aliasingHost.getAliasIn(ref.node, maybeAliasFrom, isReExport);
            if (alias === null) {
                return dirOrPipe;
            }
            return tslib_1.__assign(tslib_1.__assign({}, dirOrPipe), { ref: ref.cloneWithAlias(alias) });
        };
        return MetadataDtsModuleScopeResolver;
    }());
    exports.MetadataDtsModuleScopeResolver = MetadataDtsModuleScopeResolver;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVwZW5kZW5jeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2Mvc2NvcGUvc3JjL2RlcGVuZGVuY3kudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQWNIOzs7Ozs7T0FNRztJQUNIO1FBTUU7O1dBRUc7UUFDSCx3Q0FBb0IsYUFBNkIsRUFBVSxZQUErQjtZQUF0RSxrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7WUFBVSxpQkFBWSxHQUFaLFlBQVksQ0FBbUI7WUFSMUY7O2VBRUc7WUFDSyxVQUFLLEdBQUcsSUFBSSxHQUFHLEVBQXNDLENBQUM7UUFLK0IsQ0FBQztRQUU5Rjs7Ozs7O1dBTUc7UUFDSCxnREFBTyxHQUFQLFVBQVEsR0FBZ0M7O1lBQ3RDLElBQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUM7WUFDdkIsSUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ3pDLElBQUksQ0FBQyxVQUFVLENBQUMsaUJBQWlCLEVBQUU7Z0JBQ2pDLE1BQU0sSUFBSSxLQUFLLENBQUMsOENBQTRDLEdBQUcsQ0FBQyxTQUFTLGNBQ3JFLFVBQVUsQ0FBQyxRQUFRLDRCQUF5QixDQUFDLENBQUM7YUFDbkQ7WUFFRCxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUN6QixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBRSxDQUFDO2FBQy9CO1lBRUQsc0ZBQXNGO1lBQ3RGLElBQU0sVUFBVSxHQUFvQixFQUFFLENBQUM7WUFDdkMsSUFBTSxLQUFLLEdBQWUsRUFBRSxDQUFDO1lBQzdCLElBQU0sU0FBUyxHQUFHLElBQUksR0FBRyxDQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFFckQsSUFB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Q0FBQyxDQUFDO1lBQ2pGLElBQUksS0FBSyxLQUFLLElBQUksRUFBRTtnQkFDbEIsT0FBTyxTQUFTLENBQUM7YUFDbEI7WUFFRCw2Q0FDSyxTQUFTLEtBQ1osR0FBRyxFQUFFLEdBQUcsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLElBQzlCO1FBQ0osQ0FBQztRQUNILHFDQUFDO0lBQUQsQ0FBQyxBQWxJRCxJQWtJQztJQWxJWSx3RUFBOEIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7QWxpYXNpbmdIb3N0LCBSZWZlcmVuY2V9IGZyb20gJy4uLy4uL2ltcG9ydHMnO1xuaW1wb3J0IHtEaXJlY3RpdmVNZXRhLCBNZXRhZGF0YVJlYWRlciwgUGlwZU1ldGF9IGZyb20gJy4uLy4uL21ldGFkYXRhJztcbmltcG9ydCB7Q2xhc3NEZWNsYXJhdGlvbn0gZnJvbSAnLi4vLi4vcmVmbGVjdGlvbic7XG5cbmltcG9ydCB7RXhwb3J0U2NvcGV9IGZyb20gJy4vYXBpJztcblxuZXhwb3J0IGludGVyZmFjZSBEdHNNb2R1bGVTY29wZVJlc29sdmVyIHtcbiAgcmVzb2x2ZShyZWY6IFJlZmVyZW5jZTxDbGFzc0RlY2xhcmF0aW9uPik6IEV4cG9ydFNjb3BlfG51bGw7XG59XG5cbi8qKlxuICogUmVhZHMgQW5ndWxhciBtZXRhZGF0YSBmcm9tIGNsYXNzZXMgZGVjbGFyZWQgaW4gLmQudHMgZmlsZXMgYW5kIGNvbXB1dGVzIGFuIGBFeHBvcnRTY29wZWAuXG4gKlxuICogR2l2ZW4gYW4gTmdNb2R1bGUgZGVjbGFyZWQgaW4gYSAuZC50cyBmaWxlLCB0aGlzIHJlc29sdmVyIGNhbiBwcm9kdWNlIGEgdHJhbnNpdGl2ZSBgRXhwb3J0U2NvcGVgXG4gKiBvZiBhbGwgb2YgdGhlIGRpcmVjdGl2ZXMvcGlwZXMgaXQgZXhwb3J0cy4gSXQgZG9lcyB0aGlzIGJ5IHJlYWRpbmcgbWV0YWRhdGEgb2ZmIG9mIEl2eSBzdGF0aWNcbiAqIGZpZWxkcyBvbiBkaXJlY3RpdmVzLCBjb21wb25lbnRzLCBwaXBlcywgYW5kIE5nTW9kdWxlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIE1ldGFkYXRhRHRzTW9kdWxlU2NvcGVSZXNvbHZlciBpbXBsZW1lbnRzIER0c01vZHVsZVNjb3BlUmVzb2x2ZXIge1xuICAvKipcbiAgICogQ2FjaGUgd2hpY2ggaG9sZHMgZnVsbHkgcmVzb2x2ZWQgc2NvcGVzIGZvciBOZ01vZHVsZSBjbGFzc2VzIGZyb20gLmQudHMgZmlsZXMuXG4gICAqL1xuICBwcml2YXRlIGNhY2hlID0gbmV3IE1hcDxDbGFzc0RlY2xhcmF0aW9uLCBFeHBvcnRTY29wZXxudWxsPigpO1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gZHRzTWV0YVJlYWRlciBhIGBNZXRhZGF0YVJlYWRlcmAgd2hpY2ggY2FuIHJlYWQgbWV0YWRhdGEgZnJvbSBgLmQudHNgIGZpbGVzLlxuICAgKi9cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBkdHNNZXRhUmVhZGVyOiBNZXRhZGF0YVJlYWRlciwgcHJpdmF0ZSBhbGlhc2luZ0hvc3Q6IEFsaWFzaW5nSG9zdHxudWxsKSB7fVxuXG4gIC8qKlxuICAgKiBSZXNvbHZlIGEgYFJlZmVyZW5jZWAnZCBOZ01vZHVsZSBmcm9tIGEgLmQudHMgZmlsZSBhbmQgcHJvZHVjZSBhIHRyYW5zaXRpdmUgYEV4cG9ydFNjb3BlYFxuICAgKiBsaXN0aW5nIHRoZSBkaXJlY3RpdmVzIGFuZCBwaXBlcyB3aGljaCB0aGF0IE5nTW9kdWxlIGV4cG9ydHMgdG8gb3RoZXJzLlxuICAgKlxuICAgKiBUaGlzIG9wZXJhdGlvbiByZWxpZXMgb24gYSBgUmVmZXJlbmNlYCBpbnN0ZWFkIG9mIGEgZGlyZWN0IFR5cGVTY3JwdCBub2RlIGFzIHRoZSBgUmVmZXJlbmNlYHNcbiAgICogcHJvZHVjZWQgZGVwZW5kIG9uIGhvdyB0aGUgb3JpZ2luYWwgTmdNb2R1bGUgd2FzIGltcG9ydGVkLlxuICAgKi9cbiAgcmVzb2x2ZShyZWY6IFJlZmVyZW5jZTxDbGFzc0RlY2xhcmF0aW9uPik6IEV4cG9ydFNjb3BlfG51bGwge1xuICAgIGNvbnN0IGNsYXp6ID0gcmVmLm5vZGU7XG4gICAgY29uc3Qgc291cmNlRmlsZSA9IGNsYXp6LmdldFNvdXJjZUZpbGUoKTtcbiAgICBpZiAoIXNvdXJjZUZpbGUuaXNEZWNsYXJhdGlvbkZpbGUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgRGVidWcgZXJyb3I6IER0c01vZHVsZVNjb3BlUmVzb2x2ZXIucmVhZCgke3JlZi5kZWJ1Z05hbWV9IGZyb20gJHtcbiAgICAgICAgICBzb3VyY2VGaWxlLmZpbGVOYW1lfSksIGJ1dCBub3QgYSAuZC50cyBmaWxlYCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuY2FjaGUuaGFzKGNsYXp6KSkge1xuICAgICAgcmV0dXJuIHRoaXMuY2FjaGUuZ2V0KGNsYXp6KSE7XG4gICAgfVxuXG4gICAgLy8gQnVpbGQgdXAgdGhlIGV4cG9ydCBzY29wZSAtIHRob3NlIGRpcmVjdGl2ZXMgYW5kIHBpcGVzIG1hZGUgdmlzaWJsZSBieSB0aGlzIG1vZHVsZS5cbiAgICBjb25zdCBkaXJlY3RpdmVzOiBEaXJlY3RpdmVNZXRhW10gPSBbXTtcbiAgICBjb25zdCBwaXBlczogUGlwZU1ldGFbXSA9IFtdO1xuICAgIGNvbnN0IG5nTW9kdWxlcyA9IG5ldyBTZXQ8Q2xhc3NEZWNsYXJhdGlvbj4oW2NsYXp6XSk7XG5cbiAgICBjb25zdCBtZXRhID0gdGhpcy5kdHNNZXRhUmVhZGVyLmdldE5nTW9kdWxlTWV0YWRhdGEocmVmKTtcbiAgICBpZiAobWV0YSA9PT0gbnVsbCkge1xuICAgICAgdGhpcy5jYWNoZS5zZXQoY2xhenosIG51bGwpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgZGVjbGFyYXRpb25zID0gbmV3IFNldDxDbGFzc0RlY2xhcmF0aW9uPigpO1xuICAgIGZvciAoY29uc3QgZGVjbFJlZiBvZiBtZXRhLmRlY2xhcmF0aW9ucykge1xuICAgICAgZGVjbGFyYXRpb25zLmFkZChkZWNsUmVmLm5vZGUpO1xuICAgIH1cblxuICAgIC8vIE9ubHkgdGhlICdleHBvcnRzJyBmaWVsZCBvZiB0aGUgTmdNb2R1bGUncyBtZXRhZGF0YSBpcyBpbXBvcnRhbnQuIEltcG9ydHMgYW5kIGRlY2xhcmF0aW9uc1xuICAgIC8vIGRvbid0IGFmZmVjdCB0aGUgZXhwb3J0IHNjb3BlLlxuICAgIGZvciAoY29uc3QgZXhwb3J0UmVmIG9mIG1ldGEuZXhwb3J0cykge1xuICAgICAgLy8gQXR0ZW1wdCB0byBwcm9jZXNzIHRoZSBleHBvcnQgYXMgYSBkaXJlY3RpdmUuXG4gICAgICBjb25zdCBkaXJlY3RpdmUgPSB0aGlzLmR0c01ldGFSZWFkZXIuZ2V0RGlyZWN0aXZlTWV0YWRhdGEoZXhwb3J0UmVmKTtcbiAgICAgIGlmIChkaXJlY3RpdmUgIT09IG51bGwpIHtcbiAgICAgICAgY29uc3QgaXNSZUV4cG9ydCA9ICFkZWNsYXJhdGlvbnMuaGFzKGV4cG9ydFJlZi5ub2RlKTtcbiAgICAgICAgZGlyZWN0aXZlcy5wdXNoKHRoaXMubWF5YmVBbGlhcyhkaXJlY3RpdmUsIHNvdXJjZUZpbGUsIGlzUmVFeHBvcnQpKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIEF0dGVtcHQgdG8gcHJvY2VzcyB0aGUgZXhwb3J0IGFzIGEgcGlwZS5cbiAgICAgIGNvbnN0IHBpcGUgPSB0aGlzLmR0c01ldGFSZWFkZXIuZ2V0UGlwZU1ldGFkYXRhKGV4cG9ydFJlZik7XG4gICAgICBpZiAocGlwZSAhPT0gbnVsbCkge1xuICAgICAgICBjb25zdCBpc1JlRXhwb3J0ID0gIWRlY2xhcmF0aW9ucy5oYXMoZXhwb3J0UmVmLm5vZGUpO1xuICAgICAgICBwaXBlcy5wdXNoKHRoaXMubWF5YmVBbGlhcyhwaXBlLCBzb3VyY2VGaWxlLCBpc1JlRXhwb3J0KSk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBBdHRlbXB0IHRvIHByb2Nlc3MgdGhlIGV4cG9ydCBhcyBhIG1vZHVsZS5cbiAgICAgIGNvbnN0IGV4cG9ydFNjb3BlID0gdGhpcy5yZXNvbHZlKGV4cG9ydFJlZik7XG4gICAgICBpZiAoZXhwb3J0U2NvcGUgIT09IG51bGwpIHtcbiAgICAgICAgLy8gSXQgaXMgYSBtb2R1bGUuIEFkZCBleHBvcnRlZCBkaXJlY3RpdmVzIGFuZCBwaXBlcyB0byB0aGUgY3VycmVudCBzY29wZS4gVGhpcyBtaWdodFxuICAgICAgICAvLyBpbnZvbHZlIHJld3JpdGluZyB0aGUgYFJlZmVyZW5jZWBzIHRvIHRob3NlIHR5cGVzIHRvIGhhdmUgYW4gYWxpYXMgZXhwcmVzc2lvbiBpZiBvbmUgaXNcbiAgICAgICAgLy8gcmVxdWlyZWQuXG4gICAgICAgIGlmICh0aGlzLmFsaWFzaW5nSG9zdCA9PT0gbnVsbCkge1xuICAgICAgICAgIC8vIEZhc3QgcGF0aCB3aGVuIGFsaWFzZXMgYXJlbid0IHJlcXVpcmVkLlxuICAgICAgICAgIGRpcmVjdGl2ZXMucHVzaCguLi5leHBvcnRTY29wZS5leHBvcnRlZC5kaXJlY3RpdmVzKTtcbiAgICAgICAgICBwaXBlcy5wdXNoKC4uLmV4cG9ydFNjb3BlLmV4cG9ydGVkLnBpcGVzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBJdCdzIG5lY2Vzc2FyeSB0byByZXdyaXRlIHRoZSBgUmVmZXJlbmNlYHMgdG8gYWRkIGFsaWFzIGV4cHJlc3Npb25zLiBUaGlzIHdheSwgaW1wb3J0c1xuICAgICAgICAgIC8vIGdlbmVyYXRlZCB0byB0aGVzZSBkaXJlY3RpdmVzIGFuZCBwaXBlcyB3aWxsIHVzZSBhIHNoYWxsb3cgaW1wb3J0IHRvIGBzb3VyY2VGaWxlYFxuICAgICAgICAgIC8vIGluc3RlYWQgb2YgYSBkZWVwIGltcG9ydCBkaXJlY3RseSB0byB0aGUgZGlyZWN0aXZlIG9yIHBpcGUgY2xhc3MuXG4gICAgICAgICAgLy9cbiAgICAgICAgICAvLyBPbmUgaW1wb3J0YW50IGNoZWNrIGhlcmUgaXMgd2hldGhlciB0aGUgZGlyZWN0aXZlL3BpcGUgaXMgZGVjbGFyZWQgaW4gdGhlIHNhbWVcbiAgICAgICAgICAvLyBzb3VyY2UgZmlsZSBhcyB0aGUgcmUtZXhwb3J0aW5nIE5nTW9kdWxlLiBUaGlzIGNhbiBoYXBwZW4gaWYgYm90aCBhIGRpcmVjdGl2ZSwgaXRzXG4gICAgICAgICAgLy8gTmdNb2R1bGUsIGFuZCB0aGUgcmUtZXhwb3J0aW5nIE5nTW9kdWxlIGFyZSBhbGwgaW4gdGhlIHNhbWUgZmlsZS4gSW4gdGhpcyBjYXNlLFxuICAgICAgICAgIC8vIG5vIGltcG9ydCBhbGlhcyBpcyBuZWVkZWQgYXMgaXQgd291bGQgZ28gdG8gdGhlIHNhbWUgZmlsZSBhbnl3YXkuXG4gICAgICAgICAgZm9yIChjb25zdCBkaXJlY3RpdmUgb2YgZXhwb3J0U2NvcGUuZXhwb3J0ZWQuZGlyZWN0aXZlcykge1xuICAgICAgICAgICAgZGlyZWN0aXZlcy5wdXNoKHRoaXMubWF5YmVBbGlhcyhkaXJlY3RpdmUsIHNvdXJjZUZpbGUsIC8qIGlzUmVFeHBvcnQgKi8gdHJ1ZSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBmb3IgKGNvbnN0IHBpcGUgb2YgZXhwb3J0U2NvcGUuZXhwb3J0ZWQucGlwZXMpIHtcbiAgICAgICAgICAgIHBpcGVzLnB1c2godGhpcy5tYXliZUFsaWFzKHBpcGUsIHNvdXJjZUZpbGUsIC8qIGlzUmVFeHBvcnQgKi8gdHJ1ZSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBmb3IgKGNvbnN0IG5nTW9kdWxlIG9mIGV4cG9ydFNjb3BlLmV4cG9ydGVkLm5nTW9kdWxlcykge1xuICAgICAgICAgICAgbmdNb2R1bGVzLmFkZChuZ01vZHVsZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBjb250aW51ZTtcblxuICAgICAgLy8gVGhlIGV4cG9ydCB3YXMgbm90IGEgZGlyZWN0aXZlLCBhIHBpcGUsIG9yIGEgbW9kdWxlLiBUaGlzIGlzIGFuIGVycm9yLlxuICAgICAgLy8gVE9ETyhhbHhodWIpOiBwcm9kdWNlIGEgdHMuRGlhZ25vc3RpY1xuICAgIH1cblxuICAgIGNvbnN0IGV4cG9ydFNjb3BlOiBFeHBvcnRTY29wZSA9IHtcbiAgICAgIGV4cG9ydGVkOiB7XG4gICAgICAgIGRpcmVjdGl2ZXMsXG4gICAgICAgIHBpcGVzLFxuICAgICAgICBuZ01vZHVsZXM6IEFycmF5LmZyb20obmdNb2R1bGVzKSxcbiAgICAgICAgaXNQb2lzb25lZDogZmFsc2UsXG4gICAgICB9LFxuICAgIH07XG4gICAgdGhpcy5jYWNoZS5zZXQoY2xhenosIGV4cG9ydFNjb3BlKTtcbiAgICByZXR1cm4gZXhwb3J0U2NvcGU7XG4gIH1cblxuICBwcml2YXRlIG1heWJlQWxpYXM8VCBleHRlbmRzIERpcmVjdGl2ZU1ldGF8UGlwZU1ldGE+KFxuICAgICAgZGlyT3JQaXBlOiBULCBtYXliZUFsaWFzRnJvbTogdHMuU291cmNlRmlsZSwgaXNSZUV4cG9ydDogYm9vbGVhbik6IFQge1xuICAgIGNvbnN0IHJlZiA9IGRpck9yUGlwZS5yZWY7XG4gICAgaWYgKHRoaXMuYWxpYXNpbmdIb3N0ID09PSBudWxsIHx8IHJlZi5ub2RlLmdldFNvdXJjZUZpbGUoKSA9PT0gbWF5YmVBbGlhc0Zyb20pIHtcbiAgICAgIHJldHVybiBkaXJPclBpcGU7XG4gICAgfVxuXG4gICAgY29uc3QgYWxpYXMgPSB0aGlzLmFsaWFzaW5nSG9zdC5nZXRBbGlhc0luKHJlZi5ub2RlLCBtYXliZUFsaWFzRnJvbSwgaXNSZUV4cG9ydCk7XG4gICAgaWYgKGFsaWFzID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gZGlyT3JQaXBlO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAuLi5kaXJPclBpcGUsXG4gICAgICByZWY6IHJlZi5jbG9uZVdpdGhBbGlhcyhhbGlhcyksXG4gICAgfTtcbiAgfVxufVxuIl19