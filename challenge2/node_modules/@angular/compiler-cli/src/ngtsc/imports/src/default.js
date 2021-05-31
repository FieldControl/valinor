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
        define("@angular/compiler-cli/src/ngtsc/imports/src/default", ["require", "exports", "typescript", "@angular/compiler-cli/src/ngtsc/util/src/typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DefaultImportTracker = exports.getDefaultImportDeclaration = exports.attachDefaultImportDeclaration = void 0;
    var ts = require("typescript");
    var typescript_1 = require("@angular/compiler-cli/src/ngtsc/util/src/typescript");
    var DefaultImportDeclaration = Symbol('DefaultImportDeclaration');
    /**
     * Attaches a default import declaration to `expr` to indicate the dependency of `expr` on the
     * default import.
     */
    function attachDefaultImportDeclaration(expr, importDecl) {
        expr[DefaultImportDeclaration] = importDecl;
    }
    exports.attachDefaultImportDeclaration = attachDefaultImportDeclaration;
    /**
     * Obtains the default import declaration that `expr` depends on, or `null` if there is no such
     * dependency.
     */
    function getDefaultImportDeclaration(expr) {
        var _a;
        return (_a = expr[DefaultImportDeclaration]) !== null && _a !== void 0 ? _a : null;
    }
    exports.getDefaultImportDeclaration = getDefaultImportDeclaration;
    /**
     * TypeScript has trouble with generating default imports inside of transformers for some module
     * formats. The issue is that for the statement:
     *
     * import X from 'some/module';
     * console.log(X);
     *
     * TypeScript will not use the "X" name in generated code. For normal user code, this is fine
     * because references to X will also be renamed. However, if both the import and any references are
     * added in a transformer, TypeScript does not associate the two, and will leave the "X" references
     * dangling while renaming the import variable. The generated code looks something like:
     *
     * const module_1 = require('some/module');
     * console.log(X); // now X is a dangling reference.
     *
     * Therefore, we cannot synthetically add default imports, and must reuse the imports that users
     * include. Doing this poses a challenge for imports that are only consumed in the type position in
     * the user's code. If Angular reuses the imported symbol in a value position (for example, we
     * see a constructor parameter of type Foo and try to write "inject(Foo)") we will also end up with
     * a dangling reference, as TS will elide the import because it was only used in the type position
     * originally.
     *
     * To avoid this, the compiler must "touch" the imports with `ts.getMutableClone`, and should
     * only do this for imports which are actually consumed. The `DefaultImportTracker` keeps track of
     * these imports as they're encountered and emitted, and implements a transform which can correctly
     * flag the imports as required.
     *
     * This problem does not exist for non-default imports as the compiler can easily insert
     * "import * as X" style imports for those, and the "X" identifier survives transformation.
     */
    var DefaultImportTracker = /** @class */ (function () {
        function DefaultImportTracker() {
            /**
             * A `Map` which tracks the `Set` of `ts.ImportDeclaration`s for default imports that were used in
             * a given `ts.SourceFile` and need to be preserved.
             */
            this.sourceFileToUsedImports = new Map();
        }
        DefaultImportTracker.prototype.recordUsedImport = function (importDecl) {
            var sf = typescript_1.getSourceFile(importDecl);
            // Add the default import declaration to the set of used import declarations for the file.
            if (!this.sourceFileToUsedImports.has(sf)) {
                this.sourceFileToUsedImports.set(sf, new Set());
            }
            this.sourceFileToUsedImports.get(sf).add(importDecl);
        };
        /**
         * Get a `ts.TransformerFactory` which will preserve default imports that were previously marked
         * as used.
         *
         * This transformer must run after any other transformers which call `recordUsedImport`.
         */
        DefaultImportTracker.prototype.importPreservingTransformer = function () {
            var _this = this;
            return function (context) {
                return function (sf) {
                    return _this.transformSourceFile(sf);
                };
            };
        };
        /**
         * Process a `ts.SourceFile` and replace any `ts.ImportDeclaration`s.
         */
        DefaultImportTracker.prototype.transformSourceFile = function (sf) {
            var originalSf = ts.getOriginalNode(sf);
            // Take a fast path if no import declarations need to be preserved in the file.
            if (!this.sourceFileToUsedImports.has(originalSf)) {
                return sf;
            }
            // There are declarations that need to be preserved.
            var importsToPreserve = this.sourceFileToUsedImports.get(originalSf);
            // Generate a new statement list which preserves any imports present in `importsToPreserve`.
            var statements = sf.statements.map(function (stmt) {
                if (ts.isImportDeclaration(stmt) && importsToPreserve.has(stmt)) {
                    // Preserving an import that's marked as unreferenced (type-only) is tricky in TypeScript.
                    //
                    // Various approaches have been tried, with mixed success:
                    //
                    // 1. Using `ts.updateImportDeclaration` does not cause the import to be retained.
                    //
                    // 2. Using `ts.createImportDeclaration` with the same `ts.ImportClause` causes the import
                    //    to correctly be retained, but when emitting CommonJS module format code, references
                    //    to the imported value will not match the import variable.
                    //
                    // 3. Emitting "import * as" imports instead generates the correct import variable, but
                    //    references are missing the ".default" access. This happens to work for tsickle code
                    //    with goog.module transformations as tsickle strips the ".default" anyway.
                    //
                    // 4. It's possible to trick TypeScript by setting `ts.NodeFlag.Synthesized` on the import
                    //    declaration. This causes the import to be correctly retained and generated, but can
                    //    violate invariants elsewhere in the compiler and cause crashes.
                    //
                    // 5. Using `ts.getMutableClone` seems to correctly preserve the import and correctly
                    //    generate references to the import variable across all module types.
                    //
                    // Therefore, option 5 is the one used here. It seems to be implemented as the correct way
                    // to perform option 4, which preserves all the compiler's invariants.
                    //
                    // TODO(alxhub): discuss with the TypeScript team and determine if there's a better way to
                    // deal with this issue.
                    stmt = ts.getMutableClone(stmt);
                }
                return stmt;
            });
            // Save memory - there's no need to keep these around once the transform has run for the given
            // file.
            this.sourceFileToUsedImports.delete(originalSf);
            return ts.updateSourceFileNode(sf, statements);
        };
        return DefaultImportTracker;
    }());
    exports.DefaultImportTracker = DefaultImportTracker;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvaW1wb3J0cy9zcmMvZGVmYXVsdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFHSCwrQkFBaUM7SUFFakMsa0ZBQXdEO0lBRXhELElBQU0sd0JBQXdCLEdBQUcsTUFBTSxDQUFDLDBCQUEwQixDQUFDLENBQUM7SUFNcEU7OztPQUdHO0lBQ0gsU0FBZ0IsOEJBQThCLENBQzFDLElBQThCLEVBQUUsVUFBZ0M7UUFDakUsSUFBcUMsQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLFVBQVUsQ0FBQztJQUNoRixDQUFDO0lBSEQsd0VBR0M7SUFFRDs7O09BR0c7SUFDSCxTQUFnQiwyQkFBMkIsQ0FBQyxJQUE4Qjs7UUFFeEUsT0FBTyxNQUFDLElBQXFDLENBQUMsd0JBQXdCLENBQUMsbUNBQUksSUFBSSxDQUFDO0lBQ2xGLENBQUM7SUFIRCxrRUFHQztJQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQTZCRztJQUNIO1FBQUE7WUFDRTs7O2VBR0c7WUFDSyw0QkFBdUIsR0FBRyxJQUFJLEdBQUcsRUFBNEMsQ0FBQztRQStFeEYsQ0FBQztRQTdFQywrQ0FBZ0IsR0FBaEIsVUFBaUIsVUFBZ0M7WUFDL0MsSUFBTSxFQUFFLEdBQUcsMEJBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUVyQywwRkFBMEY7WUFDMUYsSUFBSSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUU7Z0JBQ3pDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLElBQUksR0FBRyxFQUF3QixDQUFDLENBQUM7YUFDdkU7WUFDRCxJQUFJLENBQUMsdUJBQXVCLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBRSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN4RCxDQUFDO1FBRUQ7Ozs7O1dBS0c7UUFDSCwwREFBMkIsR0FBM0I7WUFBQSxpQkFNQztZQUxDLE9BQU8sVUFBQyxPQUFpQztnQkFDdkMsT0FBTyxVQUFDLEVBQWlCO29CQUN2QixPQUFPLEtBQUksQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDdEMsQ0FBQyxDQUFDO1lBQ0osQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVEOztXQUVHO1FBQ0ssa0RBQW1CLEdBQTNCLFVBQTRCLEVBQWlCO1lBQzNDLElBQU0sVUFBVSxHQUFHLEVBQUUsQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFrQixDQUFDO1lBQzNELCtFQUErRTtZQUMvRSxJQUFJLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsRUFBRTtnQkFDakQsT0FBTyxFQUFFLENBQUM7YUFDWDtZQUVELG9EQUFvRDtZQUNwRCxJQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFFLENBQUM7WUFFeEUsNEZBQTRGO1lBQzVGLElBQU0sVUFBVSxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFVBQUEsSUFBSTtnQkFDdkMsSUFBSSxFQUFFLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLElBQUksaUJBQWlCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFO29CQUMvRCwwRkFBMEY7b0JBQzFGLEVBQUU7b0JBQ0YsMERBQTBEO29CQUMxRCxFQUFFO29CQUNGLGtGQUFrRjtvQkFDbEYsRUFBRTtvQkFDRiwwRkFBMEY7b0JBQzFGLHlGQUF5RjtvQkFDekYsK0RBQStEO29CQUMvRCxFQUFFO29CQUNGLHVGQUF1RjtvQkFDdkYseUZBQXlGO29CQUN6RiwrRUFBK0U7b0JBQy9FLEVBQUU7b0JBQ0YsMEZBQTBGO29CQUMxRix5RkFBeUY7b0JBQ3pGLHFFQUFxRTtvQkFDckUsRUFBRTtvQkFDRixxRkFBcUY7b0JBQ3JGLHlFQUF5RTtvQkFDekUsRUFBRTtvQkFDRiwwRkFBMEY7b0JBQzFGLHNFQUFzRTtvQkFDdEUsRUFBRTtvQkFDRiwwRkFBMEY7b0JBQzFGLHdCQUF3QjtvQkFDeEIsSUFBSSxHQUFHLEVBQUUsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQ2pDO2dCQUNELE9BQU8sSUFBSSxDQUFDO1lBQ2QsQ0FBQyxDQUFDLENBQUM7WUFFSCw4RkFBOEY7WUFDOUYsUUFBUTtZQUNSLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7WUFFaEQsT0FBTyxFQUFFLENBQUMsb0JBQW9CLENBQUMsRUFBRSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ2pELENBQUM7UUFDSCwyQkFBQztJQUFELENBQUMsQUFwRkQsSUFvRkM7SUFwRlksb0RBQW9CIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7V3JhcHBlZE5vZGVFeHByfSBmcm9tICdAYW5ndWxhci9jb21waWxlcic7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHtnZXRTb3VyY2VGaWxlfSBmcm9tICcuLi8uLi91dGlsL3NyYy90eXBlc2NyaXB0JztcblxuY29uc3QgRGVmYXVsdEltcG9ydERlY2xhcmF0aW9uID0gU3ltYm9sKCdEZWZhdWx0SW1wb3J0RGVjbGFyYXRpb24nKTtcblxuaW50ZXJmYWNlIFdpdGhEZWZhdWx0SW1wb3J0RGVjbGFyYXRpb24ge1xuICBbRGVmYXVsdEltcG9ydERlY2xhcmF0aW9uXT86IHRzLkltcG9ydERlY2xhcmF0aW9uO1xufVxuXG4vKipcbiAqIEF0dGFjaGVzIGEgZGVmYXVsdCBpbXBvcnQgZGVjbGFyYXRpb24gdG8gYGV4cHJgIHRvIGluZGljYXRlIHRoZSBkZXBlbmRlbmN5IG9mIGBleHByYCBvbiB0aGVcbiAqIGRlZmF1bHQgaW1wb3J0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gYXR0YWNoRGVmYXVsdEltcG9ydERlY2xhcmF0aW9uKFxuICAgIGV4cHI6IFdyYXBwZWROb2RlRXhwcjx1bmtub3duPiwgaW1wb3J0RGVjbDogdHMuSW1wb3J0RGVjbGFyYXRpb24pOiB2b2lkIHtcbiAgKGV4cHIgYXMgV2l0aERlZmF1bHRJbXBvcnREZWNsYXJhdGlvbilbRGVmYXVsdEltcG9ydERlY2xhcmF0aW9uXSA9IGltcG9ydERlY2w7XG59XG5cbi8qKlxuICogT2J0YWlucyB0aGUgZGVmYXVsdCBpbXBvcnQgZGVjbGFyYXRpb24gdGhhdCBgZXhwcmAgZGVwZW5kcyBvbiwgb3IgYG51bGxgIGlmIHRoZXJlIGlzIG5vIHN1Y2hcbiAqIGRlcGVuZGVuY3kuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXREZWZhdWx0SW1wb3J0RGVjbGFyYXRpb24oZXhwcjogV3JhcHBlZE5vZGVFeHByPHVua25vd24+KTogdHMuSW1wb3J0RGVjbGFyYXRpb258XG4gICAgbnVsbCB7XG4gIHJldHVybiAoZXhwciBhcyBXaXRoRGVmYXVsdEltcG9ydERlY2xhcmF0aW9uKVtEZWZhdWx0SW1wb3J0RGVjbGFyYXRpb25dID8/IG51bGw7XG59XG5cbi8qKlxuICogVHlwZVNjcmlwdCBoYXMgdHJvdWJsZSB3aXRoIGdlbmVyYXRpbmcgZGVmYXVsdCBpbXBvcnRzIGluc2lkZSBvZiB0cmFuc2Zvcm1lcnMgZm9yIHNvbWUgbW9kdWxlXG4gKiBmb3JtYXRzLiBUaGUgaXNzdWUgaXMgdGhhdCBmb3IgdGhlIHN0YXRlbWVudDpcbiAqXG4gKiBpbXBvcnQgWCBmcm9tICdzb21lL21vZHVsZSc7XG4gKiBjb25zb2xlLmxvZyhYKTtcbiAqXG4gKiBUeXBlU2NyaXB0IHdpbGwgbm90IHVzZSB0aGUgXCJYXCIgbmFtZSBpbiBnZW5lcmF0ZWQgY29kZS4gRm9yIG5vcm1hbCB1c2VyIGNvZGUsIHRoaXMgaXMgZmluZVxuICogYmVjYXVzZSByZWZlcmVuY2VzIHRvIFggd2lsbCBhbHNvIGJlIHJlbmFtZWQuIEhvd2V2ZXIsIGlmIGJvdGggdGhlIGltcG9ydCBhbmQgYW55IHJlZmVyZW5jZXMgYXJlXG4gKiBhZGRlZCBpbiBhIHRyYW5zZm9ybWVyLCBUeXBlU2NyaXB0IGRvZXMgbm90IGFzc29jaWF0ZSB0aGUgdHdvLCBhbmQgd2lsbCBsZWF2ZSB0aGUgXCJYXCIgcmVmZXJlbmNlc1xuICogZGFuZ2xpbmcgd2hpbGUgcmVuYW1pbmcgdGhlIGltcG9ydCB2YXJpYWJsZS4gVGhlIGdlbmVyYXRlZCBjb2RlIGxvb2tzIHNvbWV0aGluZyBsaWtlOlxuICpcbiAqIGNvbnN0IG1vZHVsZV8xID0gcmVxdWlyZSgnc29tZS9tb2R1bGUnKTtcbiAqIGNvbnNvbGUubG9nKFgpOyAvLyBub3cgWCBpcyBhIGRhbmdsaW5nIHJlZmVyZW5jZS5cbiAqXG4gKiBUaGVyZWZvcmUsIHdlIGNhbm5vdCBzeW50aGV0aWNhbGx5IGFkZCBkZWZhdWx0IGltcG9ydHMsIGFuZCBtdXN0IHJldXNlIHRoZSBpbXBvcnRzIHRoYXQgdXNlcnNcbiAqIGluY2x1ZGUuIERvaW5nIHRoaXMgcG9zZXMgYSBjaGFsbGVuZ2UgZm9yIGltcG9ydHMgdGhhdCBhcmUgb25seSBjb25zdW1lZCBpbiB0aGUgdHlwZSBwb3NpdGlvbiBpblxuICogdGhlIHVzZXIncyBjb2RlLiBJZiBBbmd1bGFyIHJldXNlcyB0aGUgaW1wb3J0ZWQgc3ltYm9sIGluIGEgdmFsdWUgcG9zaXRpb24gKGZvciBleGFtcGxlLCB3ZVxuICogc2VlIGEgY29uc3RydWN0b3IgcGFyYW1ldGVyIG9mIHR5cGUgRm9vIGFuZCB0cnkgdG8gd3JpdGUgXCJpbmplY3QoRm9vKVwiKSB3ZSB3aWxsIGFsc28gZW5kIHVwIHdpdGhcbiAqIGEgZGFuZ2xpbmcgcmVmZXJlbmNlLCBhcyBUUyB3aWxsIGVsaWRlIHRoZSBpbXBvcnQgYmVjYXVzZSBpdCB3YXMgb25seSB1c2VkIGluIHRoZSB0eXBlIHBvc2l0aW9uXG4gKiBvcmlnaW5hbGx5LlxuICpcbiAqIFRvIGF2b2lkIHRoaXMsIHRoZSBjb21waWxlciBtdXN0IFwidG91Y2hcIiB0aGUgaW1wb3J0cyB3aXRoIGB0cy5nZXRNdXRhYmxlQ2xvbmVgLCBhbmQgc2hvdWxkXG4gKiBvbmx5IGRvIHRoaXMgZm9yIGltcG9ydHMgd2hpY2ggYXJlIGFjdHVhbGx5IGNvbnN1bWVkLiBUaGUgYERlZmF1bHRJbXBvcnRUcmFja2VyYCBrZWVwcyB0cmFjayBvZlxuICogdGhlc2UgaW1wb3J0cyBhcyB0aGV5J3JlIGVuY291bnRlcmVkIGFuZCBlbWl0dGVkLCBhbmQgaW1wbGVtZW50cyBhIHRyYW5zZm9ybSB3aGljaCBjYW4gY29ycmVjdGx5XG4gKiBmbGFnIHRoZSBpbXBvcnRzIGFzIHJlcXVpcmVkLlxuICpcbiAqIFRoaXMgcHJvYmxlbSBkb2VzIG5vdCBleGlzdCBmb3Igbm9uLWRlZmF1bHQgaW1wb3J0cyBhcyB0aGUgY29tcGlsZXIgY2FuIGVhc2lseSBpbnNlcnRcbiAqIFwiaW1wb3J0ICogYXMgWFwiIHN0eWxlIGltcG9ydHMgZm9yIHRob3NlLCBhbmQgdGhlIFwiWFwiIGlkZW50aWZpZXIgc3Vydml2ZXMgdHJhbnNmb3JtYXRpb24uXG4gKi9cbmV4cG9ydCBjbGFzcyBEZWZhdWx0SW1wb3J0VHJhY2tlciB7XG4gIC8qKlxuICAgKiBBIGBNYXBgIHdoaWNoIHRyYWNrcyB0aGUgYFNldGAgb2YgYHRzLkltcG9ydERlY2xhcmF0aW9uYHMgZm9yIGRlZmF1bHQgaW1wb3J0cyB0aGF0IHdlcmUgdXNlZCBpblxuICAgKiBhIGdpdmVuIGB0cy5Tb3VyY2VGaWxlYCBhbmQgbmVlZCB0byBiZSBwcmVzZXJ2ZWQuXG4gICAqL1xuICBwcml2YXRlIHNvdXJjZUZpbGVUb1VzZWRJbXBvcnRzID0gbmV3IE1hcDx0cy5Tb3VyY2VGaWxlLCBTZXQ8dHMuSW1wb3J0RGVjbGFyYXRpb24+PigpO1xuXG4gIHJlY29yZFVzZWRJbXBvcnQoaW1wb3J0RGVjbDogdHMuSW1wb3J0RGVjbGFyYXRpb24pOiB2b2lkIHtcbiAgICBjb25zdCBzZiA9IGdldFNvdXJjZUZpbGUoaW1wb3J0RGVjbCk7XG5cbiAgICAvLyBBZGQgdGhlIGRlZmF1bHQgaW1wb3J0IGRlY2xhcmF0aW9uIHRvIHRoZSBzZXQgb2YgdXNlZCBpbXBvcnQgZGVjbGFyYXRpb25zIGZvciB0aGUgZmlsZS5cbiAgICBpZiAoIXRoaXMuc291cmNlRmlsZVRvVXNlZEltcG9ydHMuaGFzKHNmKSkge1xuICAgICAgdGhpcy5zb3VyY2VGaWxlVG9Vc2VkSW1wb3J0cy5zZXQoc2YsIG5ldyBTZXQ8dHMuSW1wb3J0RGVjbGFyYXRpb24+KCkpO1xuICAgIH1cbiAgICB0aGlzLnNvdXJjZUZpbGVUb1VzZWRJbXBvcnRzLmdldChzZikhLmFkZChpbXBvcnREZWNsKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSBgdHMuVHJhbnNmb3JtZXJGYWN0b3J5YCB3aGljaCB3aWxsIHByZXNlcnZlIGRlZmF1bHQgaW1wb3J0cyB0aGF0IHdlcmUgcHJldmlvdXNseSBtYXJrZWRcbiAgICogYXMgdXNlZC5cbiAgICpcbiAgICogVGhpcyB0cmFuc2Zvcm1lciBtdXN0IHJ1biBhZnRlciBhbnkgb3RoZXIgdHJhbnNmb3JtZXJzIHdoaWNoIGNhbGwgYHJlY29yZFVzZWRJbXBvcnRgLlxuICAgKi9cbiAgaW1wb3J0UHJlc2VydmluZ1RyYW5zZm9ybWVyKCk6IHRzLlRyYW5zZm9ybWVyRmFjdG9yeTx0cy5Tb3VyY2VGaWxlPiB7XG4gICAgcmV0dXJuIChjb250ZXh0OiB0cy5UcmFuc2Zvcm1hdGlvbkNvbnRleHQpID0+IHtcbiAgICAgIHJldHVybiAoc2Y6IHRzLlNvdXJjZUZpbGUpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMudHJhbnNmb3JtU291cmNlRmlsZShzZik7XG4gICAgICB9O1xuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogUHJvY2VzcyBhIGB0cy5Tb3VyY2VGaWxlYCBhbmQgcmVwbGFjZSBhbnkgYHRzLkltcG9ydERlY2xhcmF0aW9uYHMuXG4gICAqL1xuICBwcml2YXRlIHRyYW5zZm9ybVNvdXJjZUZpbGUoc2Y6IHRzLlNvdXJjZUZpbGUpOiB0cy5Tb3VyY2VGaWxlIHtcbiAgICBjb25zdCBvcmlnaW5hbFNmID0gdHMuZ2V0T3JpZ2luYWxOb2RlKHNmKSBhcyB0cy5Tb3VyY2VGaWxlO1xuICAgIC8vIFRha2UgYSBmYXN0IHBhdGggaWYgbm8gaW1wb3J0IGRlY2xhcmF0aW9ucyBuZWVkIHRvIGJlIHByZXNlcnZlZCBpbiB0aGUgZmlsZS5cbiAgICBpZiAoIXRoaXMuc291cmNlRmlsZVRvVXNlZEltcG9ydHMuaGFzKG9yaWdpbmFsU2YpKSB7XG4gICAgICByZXR1cm4gc2Y7XG4gICAgfVxuXG4gICAgLy8gVGhlcmUgYXJlIGRlY2xhcmF0aW9ucyB0aGF0IG5lZWQgdG8gYmUgcHJlc2VydmVkLlxuICAgIGNvbnN0IGltcG9ydHNUb1ByZXNlcnZlID0gdGhpcy5zb3VyY2VGaWxlVG9Vc2VkSW1wb3J0cy5nZXQob3JpZ2luYWxTZikhO1xuXG4gICAgLy8gR2VuZXJhdGUgYSBuZXcgc3RhdGVtZW50IGxpc3Qgd2hpY2ggcHJlc2VydmVzIGFueSBpbXBvcnRzIHByZXNlbnQgaW4gYGltcG9ydHNUb1ByZXNlcnZlYC5cbiAgICBjb25zdCBzdGF0ZW1lbnRzID0gc2Yuc3RhdGVtZW50cy5tYXAoc3RtdCA9PiB7XG4gICAgICBpZiAodHMuaXNJbXBvcnREZWNsYXJhdGlvbihzdG10KSAmJiBpbXBvcnRzVG9QcmVzZXJ2ZS5oYXMoc3RtdCkpIHtcbiAgICAgICAgLy8gUHJlc2VydmluZyBhbiBpbXBvcnQgdGhhdCdzIG1hcmtlZCBhcyB1bnJlZmVyZW5jZWQgKHR5cGUtb25seSkgaXMgdHJpY2t5IGluIFR5cGVTY3JpcHQuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIFZhcmlvdXMgYXBwcm9hY2hlcyBoYXZlIGJlZW4gdHJpZWQsIHdpdGggbWl4ZWQgc3VjY2VzczpcbiAgICAgICAgLy9cbiAgICAgICAgLy8gMS4gVXNpbmcgYHRzLnVwZGF0ZUltcG9ydERlY2xhcmF0aW9uYCBkb2VzIG5vdCBjYXVzZSB0aGUgaW1wb3J0IHRvIGJlIHJldGFpbmVkLlxuICAgICAgICAvL1xuICAgICAgICAvLyAyLiBVc2luZyBgdHMuY3JlYXRlSW1wb3J0RGVjbGFyYXRpb25gIHdpdGggdGhlIHNhbWUgYHRzLkltcG9ydENsYXVzZWAgY2F1c2VzIHRoZSBpbXBvcnRcbiAgICAgICAgLy8gICAgdG8gY29ycmVjdGx5IGJlIHJldGFpbmVkLCBidXQgd2hlbiBlbWl0dGluZyBDb21tb25KUyBtb2R1bGUgZm9ybWF0IGNvZGUsIHJlZmVyZW5jZXNcbiAgICAgICAgLy8gICAgdG8gdGhlIGltcG9ydGVkIHZhbHVlIHdpbGwgbm90IG1hdGNoIHRoZSBpbXBvcnQgdmFyaWFibGUuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIDMuIEVtaXR0aW5nIFwiaW1wb3J0ICogYXNcIiBpbXBvcnRzIGluc3RlYWQgZ2VuZXJhdGVzIHRoZSBjb3JyZWN0IGltcG9ydCB2YXJpYWJsZSwgYnV0XG4gICAgICAgIC8vICAgIHJlZmVyZW5jZXMgYXJlIG1pc3NpbmcgdGhlIFwiLmRlZmF1bHRcIiBhY2Nlc3MuIFRoaXMgaGFwcGVucyB0byB3b3JrIGZvciB0c2lja2xlIGNvZGVcbiAgICAgICAgLy8gICAgd2l0aCBnb29nLm1vZHVsZSB0cmFuc2Zvcm1hdGlvbnMgYXMgdHNpY2tsZSBzdHJpcHMgdGhlIFwiLmRlZmF1bHRcIiBhbnl3YXkuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIDQuIEl0J3MgcG9zc2libGUgdG8gdHJpY2sgVHlwZVNjcmlwdCBieSBzZXR0aW5nIGB0cy5Ob2RlRmxhZy5TeW50aGVzaXplZGAgb24gdGhlIGltcG9ydFxuICAgICAgICAvLyAgICBkZWNsYXJhdGlvbi4gVGhpcyBjYXVzZXMgdGhlIGltcG9ydCB0byBiZSBjb3JyZWN0bHkgcmV0YWluZWQgYW5kIGdlbmVyYXRlZCwgYnV0IGNhblxuICAgICAgICAvLyAgICB2aW9sYXRlIGludmFyaWFudHMgZWxzZXdoZXJlIGluIHRoZSBjb21waWxlciBhbmQgY2F1c2UgY3Jhc2hlcy5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gNS4gVXNpbmcgYHRzLmdldE11dGFibGVDbG9uZWAgc2VlbXMgdG8gY29ycmVjdGx5IHByZXNlcnZlIHRoZSBpbXBvcnQgYW5kIGNvcnJlY3RseVxuICAgICAgICAvLyAgICBnZW5lcmF0ZSByZWZlcmVuY2VzIHRvIHRoZSBpbXBvcnQgdmFyaWFibGUgYWNyb3NzIGFsbCBtb2R1bGUgdHlwZXMuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIFRoZXJlZm9yZSwgb3B0aW9uIDUgaXMgdGhlIG9uZSB1c2VkIGhlcmUuIEl0IHNlZW1zIHRvIGJlIGltcGxlbWVudGVkIGFzIHRoZSBjb3JyZWN0IHdheVxuICAgICAgICAvLyB0byBwZXJmb3JtIG9wdGlvbiA0LCB3aGljaCBwcmVzZXJ2ZXMgYWxsIHRoZSBjb21waWxlcidzIGludmFyaWFudHMuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIFRPRE8oYWx4aHViKTogZGlzY3VzcyB3aXRoIHRoZSBUeXBlU2NyaXB0IHRlYW0gYW5kIGRldGVybWluZSBpZiB0aGVyZSdzIGEgYmV0dGVyIHdheSB0b1xuICAgICAgICAvLyBkZWFsIHdpdGggdGhpcyBpc3N1ZS5cbiAgICAgICAgc3RtdCA9IHRzLmdldE11dGFibGVDbG9uZShzdG10KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzdG10O1xuICAgIH0pO1xuXG4gICAgLy8gU2F2ZSBtZW1vcnkgLSB0aGVyZSdzIG5vIG5lZWQgdG8ga2VlcCB0aGVzZSBhcm91bmQgb25jZSB0aGUgdHJhbnNmb3JtIGhhcyBydW4gZm9yIHRoZSBnaXZlblxuICAgIC8vIGZpbGUuXG4gICAgdGhpcy5zb3VyY2VGaWxlVG9Vc2VkSW1wb3J0cy5kZWxldGUob3JpZ2luYWxTZik7XG5cbiAgICByZXR1cm4gdHMudXBkYXRlU291cmNlRmlsZU5vZGUoc2YsIHN0YXRlbWVudHMpO1xuICB9XG59XG4iXX0=