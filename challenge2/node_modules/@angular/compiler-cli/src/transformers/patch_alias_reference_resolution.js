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
        define("@angular/compiler-cli/src/transformers/patch_alias_reference_resolution", ["require", "exports", "tslib", "typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isAliasImportDeclaration = exports.loadIsReferencedAliasDeclarationPatch = void 0;
    var tslib_1 = require("tslib");
    var ts = require("typescript");
    var patchedReferencedAliasesSymbol = Symbol('patchedReferencedAliases');
    /**
     * Patches the alias declaration reference resolution for a given transformation context
     * so that TypeScript knows about the specified alias declarations being referenced.
     *
     * This exists because TypeScript performs analysis of import usage before transformers
     * run and doesn't refresh its state after transformations. This means that imports
     * for symbols used as constructor types are elided due to their original type-only usage.
     *
     * In reality though, since we downlevel decorators and constructor parameters, we want
     * these symbols to be retained in the JavaScript output as they will be used as values
     * at runtime. We can instruct TypeScript to preserve imports for such identifiers by
     * creating a mutable clone of a given import specifier/clause or namespace, but that
     * has the downside of preserving the full import in the JS output. See:
     * https://github.com/microsoft/TypeScript/blob/3eaa7c65f6f076a08a5f7f1946fd0df7c7430259/src/compiler/transformers/ts.ts#L242-L250.
     *
     * This is a trick the CLI used in the past  for constructor parameter downleveling in JIT:
     * https://github.com/angular/angular-cli/blob/b3f84cc5184337666ce61c07b7b9df418030106f/packages/ngtools/webpack/src/transformers/ctor-parameters.ts#L323-L325
     * The trick is not ideal though as it preserves the full import (as outlined before), and it
     * results in a slow-down due to the type checker being involved multiple times. The CLI worked
     * around this import preserving issue by having another complex post-process step that detects and
     * elides unused imports. Note that these unused imports could cause unused chunks being generated
     * by Webpack if the application or library is not marked as side-effect free.
     *
     * This is not ideal though, as we basically re-implement the complex import usage resolution
     * from TypeScript. We can do better by letting TypeScript do the import eliding, but providing
     * information about the alias declarations (e.g. import specifiers) that should not be elided
     * because they are actually referenced (as they will now appear in static properties).
     *
     * More information about these limitations with transformers can be found in:
     *   1. https://github.com/Microsoft/TypeScript/issues/17552.
     *   2. https://github.com/microsoft/TypeScript/issues/17516.
     *   3. https://github.com/angular/tsickle/issues/635.
     *
     * The patch we apply to tell TypeScript about actual referenced aliases (i.e. imported symbols),
     * matches conceptually with the logic that runs internally in TypeScript when the
     * `emitDecoratorMetadata` flag is enabled. TypeScript basically surfaces the same problem and
     * solves it conceptually the same way, but obviously doesn't need to access an `@internal` API.
     *
     * The set that is returned by this function is meant to be filled with import declaration nodes
     * that have been referenced in a value-position by the transform, such the installed patch can
     * ensure that those import declarations are not elided.
     *
     * See below. Note that this uses sourcegraph as the TypeScript checker file doesn't display on
     * Github.
     * https://sourcegraph.com/github.com/microsoft/TypeScript@3eaa7c65f6f076a08a5f7f1946fd0df7c7430259/-/blob/src/compiler/checker.ts#L31219-31257
     */
    function loadIsReferencedAliasDeclarationPatch(context) {
        // If the `getEmitResolver` method is not available, TS most likely changed the
        // internal structure of the transformation context. We will abort gracefully.
        if (!isTransformationContextWithEmitResolver(context)) {
            throwIncompatibleTransformationContextError();
        }
        var emitResolver = context.getEmitResolver();
        // The emit resolver may have been patched already, in which case we return the set of referenced
        // aliases that was created when the patch was first applied.
        // See https://github.com/angular/angular/issues/40276.
        var existingReferencedAliases = emitResolver[patchedReferencedAliasesSymbol];
        if (existingReferencedAliases !== undefined) {
            return existingReferencedAliases;
        }
        var originalIsReferencedAliasDeclaration = emitResolver.isReferencedAliasDeclaration;
        // If the emit resolver does not have a function called `isReferencedAliasDeclaration`, then
        // we abort gracefully as most likely TS changed the internal structure of the emit resolver.
        if (originalIsReferencedAliasDeclaration === undefined) {
            throwIncompatibleTransformationContextError();
        }
        var referencedAliases = new Set();
        emitResolver.isReferencedAliasDeclaration = function (node) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            if (isAliasImportDeclaration(node) && referencedAliases.has(node)) {
                return true;
            }
            return originalIsReferencedAliasDeclaration.call.apply(originalIsReferencedAliasDeclaration, tslib_1.__spreadArray([emitResolver, node], tslib_1.__read(args)));
        };
        return emitResolver[patchedReferencedAliasesSymbol] = referencedAliases;
    }
    exports.loadIsReferencedAliasDeclarationPatch = loadIsReferencedAliasDeclarationPatch;
    /**
     * Gets whether a given node corresponds to an import alias declaration. Alias
     * declarations can be import specifiers, namespace imports or import clauses
     * as these do not declare an actual symbol but just point to a target declaration.
     */
    function isAliasImportDeclaration(node) {
        return ts.isImportSpecifier(node) || ts.isNamespaceImport(node) || ts.isImportClause(node);
    }
    exports.isAliasImportDeclaration = isAliasImportDeclaration;
    /** Whether the transformation context exposes its emit resolver. */
    function isTransformationContextWithEmitResolver(context) {
        return context.getEmitResolver !== undefined;
    }
    /**
     * Throws an error about an incompatible TypeScript version for which the alias
     * declaration reference resolution could not be monkey-patched. The error will
     * also propose potential solutions that can be applied by developers.
     */
    function throwIncompatibleTransformationContextError() {
        throw Error('Unable to downlevel Angular decorators due to an incompatible TypeScript ' +
            'version.\nIf you recently updated TypeScript and this issue surfaces now, consider ' +
            'downgrading.\n\n' +
            'Please report an issue on the Angular repositories when this issue ' +
            'surfaces and you are using a supposedly compatible TypeScript version.');
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF0Y2hfYWxpYXNfcmVmZXJlbmNlX3Jlc29sdXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL3RyYW5zZm9ybWVycy9wYXRjaF9hbGlhc19yZWZlcmVuY2VfcmVzb2x1dGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgsK0JBQWlDO0lBV2pDLElBQU0sOEJBQThCLEdBQUcsTUFBTSxDQUFDLDBCQUEwQixDQUFDLENBQUM7SUFRMUU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQTZDRztJQUNILFNBQWdCLHFDQUFxQyxDQUFDLE9BQWlDO1FBRXJGLCtFQUErRTtRQUMvRSw4RUFBOEU7UUFDOUUsSUFBSSxDQUFDLHVDQUF1QyxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ3JELDJDQUEyQyxFQUFFLENBQUM7U0FDL0M7UUFDRCxJQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsZUFBZSxFQUFFLENBQUM7UUFFL0MsaUdBQWlHO1FBQ2pHLDZEQUE2RDtRQUM3RCx1REFBdUQ7UUFDdkQsSUFBTSx5QkFBeUIsR0FBRyxZQUFZLENBQUMsOEJBQThCLENBQUMsQ0FBQztRQUMvRSxJQUFJLHlCQUF5QixLQUFLLFNBQVMsRUFBRTtZQUMzQyxPQUFPLHlCQUF5QixDQUFDO1NBQ2xDO1FBRUQsSUFBTSxvQ0FBb0MsR0FBRyxZQUFZLENBQUMsNEJBQTRCLENBQUM7UUFDdkYsNEZBQTRGO1FBQzVGLDZGQUE2RjtRQUM3RixJQUFJLG9DQUFvQyxLQUFLLFNBQVMsRUFBRTtZQUN0RCwyQ0FBMkMsRUFBRSxDQUFDO1NBQy9DO1FBRUQsSUFBTSxpQkFBaUIsR0FBRyxJQUFJLEdBQUcsRUFBa0IsQ0FBQztRQUNwRCxZQUFZLENBQUMsNEJBQTRCLEdBQUcsVUFBUyxJQUFJO1lBQUUsY0FBTztpQkFBUCxVQUFPLEVBQVAscUJBQU8sRUFBUCxJQUFPO2dCQUFQLDZCQUFPOztZQUNoRSxJQUFJLHdCQUF3QixDQUFDLElBQUksQ0FBQyxJQUFJLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDakUsT0FBTyxJQUFJLENBQUM7YUFDYjtZQUNELE9BQU8sb0NBQW9DLENBQUMsSUFBSSxPQUF6QyxvQ0FBb0MseUJBQU0sWUFBWSxFQUFFLElBQUksa0JBQUssSUFBSSxJQUFFO1FBQ2hGLENBQUMsQ0FBQztRQUNGLE9BQU8sWUFBWSxDQUFDLDhCQUE4QixDQUFDLEdBQUcsaUJBQWlCLENBQUM7SUFDMUUsQ0FBQztJQWhDRCxzRkFnQ0M7SUFFRDs7OztPQUlHO0lBQ0gsU0FBZ0Isd0JBQXdCLENBQUMsSUFBYTtRQUVwRCxPQUFPLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM3RixDQUFDO0lBSEQsNERBR0M7SUFFRCxvRUFBb0U7SUFDcEUsU0FBUyx1Q0FBdUMsQ0FBQyxPQUFpQztRQUVoRixPQUFRLE9BQXNELENBQUMsZUFBZSxLQUFLLFNBQVMsQ0FBQztJQUMvRixDQUFDO0lBR0Q7Ozs7T0FJRztJQUNILFNBQVMsMkNBQTJDO1FBQ2xELE1BQU0sS0FBSyxDQUNQLDJFQUEyRTtZQUMzRSxxRkFBcUY7WUFDckYsa0JBQWtCO1lBQ2xCLHFFQUFxRTtZQUNyRSx3RUFBd0UsQ0FBQyxDQUFDO0lBQ2hGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbi8qKlxuICogRGVzY3JpYmVzIGEgVHlwZVNjcmlwdCB0cmFuc2Zvcm1hdGlvbiBjb250ZXh0IHdpdGggdGhlIGludGVybmFsIGVtaXRcbiAqIHJlc29sdmVyIGV4cG9zZWQuIFRoZXJlIGFyZSByZXF1ZXN0cyB1cHN0cmVhbSBpbiBUeXBlU2NyaXB0IHRvIGV4cG9zZVxuICogdGhhdCBhcyBwdWJsaWMgQVBJOiBodHRwczovL2dpdGh1Yi5jb20vbWljcm9zb2Z0L1R5cGVTY3JpcHQvaXNzdWVzLzE3NTE2Li5cbiAqL1xuaW50ZXJmYWNlIFRyYW5zZm9ybWF0aW9uQ29udGV4dFdpdGhSZXNvbHZlciBleHRlbmRzIHRzLlRyYW5zZm9ybWF0aW9uQ29udGV4dCB7XG4gIGdldEVtaXRSZXNvbHZlcjogKCkgPT4gRW1pdFJlc29sdmVyO1xufVxuXG5jb25zdCBwYXRjaGVkUmVmZXJlbmNlZEFsaWFzZXNTeW1ib2wgPSBTeW1ib2woJ3BhdGNoZWRSZWZlcmVuY2VkQWxpYXNlcycpO1xuXG4vKiogRGVzY3JpYmVzIGEgc3Vic2V0IG9mIHRoZSBUeXBlU2NyaXB0IGludGVybmFsIGVtaXQgcmVzb2x2ZXIuICovXG5pbnRlcmZhY2UgRW1pdFJlc29sdmVyIHtcbiAgaXNSZWZlcmVuY2VkQWxpYXNEZWNsYXJhdGlvbj8obm9kZTogdHMuTm9kZSwgLi4uYXJnczogdW5rbm93bltdKTogdm9pZDtcbiAgW3BhdGNoZWRSZWZlcmVuY2VkQWxpYXNlc1N5bWJvbF0/OiBTZXQ8dHMuRGVjbGFyYXRpb24+O1xufVxuXG4vKipcbiAqIFBhdGNoZXMgdGhlIGFsaWFzIGRlY2xhcmF0aW9uIHJlZmVyZW5jZSByZXNvbHV0aW9uIGZvciBhIGdpdmVuIHRyYW5zZm9ybWF0aW9uIGNvbnRleHRcbiAqIHNvIHRoYXQgVHlwZVNjcmlwdCBrbm93cyBhYm91dCB0aGUgc3BlY2lmaWVkIGFsaWFzIGRlY2xhcmF0aW9ucyBiZWluZyByZWZlcmVuY2VkLlxuICpcbiAqIFRoaXMgZXhpc3RzIGJlY2F1c2UgVHlwZVNjcmlwdCBwZXJmb3JtcyBhbmFseXNpcyBvZiBpbXBvcnQgdXNhZ2UgYmVmb3JlIHRyYW5zZm9ybWVyc1xuICogcnVuIGFuZCBkb2Vzbid0IHJlZnJlc2ggaXRzIHN0YXRlIGFmdGVyIHRyYW5zZm9ybWF0aW9ucy4gVGhpcyBtZWFucyB0aGF0IGltcG9ydHNcbiAqIGZvciBzeW1ib2xzIHVzZWQgYXMgY29uc3RydWN0b3IgdHlwZXMgYXJlIGVsaWRlZCBkdWUgdG8gdGhlaXIgb3JpZ2luYWwgdHlwZS1vbmx5IHVzYWdlLlxuICpcbiAqIEluIHJlYWxpdHkgdGhvdWdoLCBzaW5jZSB3ZSBkb3dubGV2ZWwgZGVjb3JhdG9ycyBhbmQgY29uc3RydWN0b3IgcGFyYW1ldGVycywgd2Ugd2FudFxuICogdGhlc2Ugc3ltYm9scyB0byBiZSByZXRhaW5lZCBpbiB0aGUgSmF2YVNjcmlwdCBvdXRwdXQgYXMgdGhleSB3aWxsIGJlIHVzZWQgYXMgdmFsdWVzXG4gKiBhdCBydW50aW1lLiBXZSBjYW4gaW5zdHJ1Y3QgVHlwZVNjcmlwdCB0byBwcmVzZXJ2ZSBpbXBvcnRzIGZvciBzdWNoIGlkZW50aWZpZXJzIGJ5XG4gKiBjcmVhdGluZyBhIG11dGFibGUgY2xvbmUgb2YgYSBnaXZlbiBpbXBvcnQgc3BlY2lmaWVyL2NsYXVzZSBvciBuYW1lc3BhY2UsIGJ1dCB0aGF0XG4gKiBoYXMgdGhlIGRvd25zaWRlIG9mIHByZXNlcnZpbmcgdGhlIGZ1bGwgaW1wb3J0IGluIHRoZSBKUyBvdXRwdXQuIFNlZTpcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9taWNyb3NvZnQvVHlwZVNjcmlwdC9ibG9iLzNlYWE3YzY1ZjZmMDc2YTA4YTVmN2YxOTQ2ZmQwZGY3Yzc0MzAyNTkvc3JjL2NvbXBpbGVyL3RyYW5zZm9ybWVycy90cy50cyNMMjQyLUwyNTAuXG4gKlxuICogVGhpcyBpcyBhIHRyaWNrIHRoZSBDTEkgdXNlZCBpbiB0aGUgcGFzdCAgZm9yIGNvbnN0cnVjdG9yIHBhcmFtZXRlciBkb3dubGV2ZWxpbmcgaW4gSklUOlxuICogaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci1jbGkvYmxvYi9iM2Y4NGNjNTE4NDMzNzY2NmNlNjFjMDdiN2I5ZGY0MTgwMzAxMDZmL3BhY2thZ2VzL25ndG9vbHMvd2VicGFjay9zcmMvdHJhbnNmb3JtZXJzL2N0b3ItcGFyYW1ldGVycy50cyNMMzIzLUwzMjVcbiAqIFRoZSB0cmljayBpcyBub3QgaWRlYWwgdGhvdWdoIGFzIGl0IHByZXNlcnZlcyB0aGUgZnVsbCBpbXBvcnQgKGFzIG91dGxpbmVkIGJlZm9yZSksIGFuZCBpdFxuICogcmVzdWx0cyBpbiBhIHNsb3ctZG93biBkdWUgdG8gdGhlIHR5cGUgY2hlY2tlciBiZWluZyBpbnZvbHZlZCBtdWx0aXBsZSB0aW1lcy4gVGhlIENMSSB3b3JrZWRcbiAqIGFyb3VuZCB0aGlzIGltcG9ydCBwcmVzZXJ2aW5nIGlzc3VlIGJ5IGhhdmluZyBhbm90aGVyIGNvbXBsZXggcG9zdC1wcm9jZXNzIHN0ZXAgdGhhdCBkZXRlY3RzIGFuZFxuICogZWxpZGVzIHVudXNlZCBpbXBvcnRzLiBOb3RlIHRoYXQgdGhlc2UgdW51c2VkIGltcG9ydHMgY291bGQgY2F1c2UgdW51c2VkIGNodW5rcyBiZWluZyBnZW5lcmF0ZWRcbiAqIGJ5IFdlYnBhY2sgaWYgdGhlIGFwcGxpY2F0aW9uIG9yIGxpYnJhcnkgaXMgbm90IG1hcmtlZCBhcyBzaWRlLWVmZmVjdCBmcmVlLlxuICpcbiAqIFRoaXMgaXMgbm90IGlkZWFsIHRob3VnaCwgYXMgd2UgYmFzaWNhbGx5IHJlLWltcGxlbWVudCB0aGUgY29tcGxleCBpbXBvcnQgdXNhZ2UgcmVzb2x1dGlvblxuICogZnJvbSBUeXBlU2NyaXB0LiBXZSBjYW4gZG8gYmV0dGVyIGJ5IGxldHRpbmcgVHlwZVNjcmlwdCBkbyB0aGUgaW1wb3J0IGVsaWRpbmcsIGJ1dCBwcm92aWRpbmdcbiAqIGluZm9ybWF0aW9uIGFib3V0IHRoZSBhbGlhcyBkZWNsYXJhdGlvbnMgKGUuZy4gaW1wb3J0IHNwZWNpZmllcnMpIHRoYXQgc2hvdWxkIG5vdCBiZSBlbGlkZWRcbiAqIGJlY2F1c2UgdGhleSBhcmUgYWN0dWFsbHkgcmVmZXJlbmNlZCAoYXMgdGhleSB3aWxsIG5vdyBhcHBlYXIgaW4gc3RhdGljIHByb3BlcnRpZXMpLlxuICpcbiAqIE1vcmUgaW5mb3JtYXRpb24gYWJvdXQgdGhlc2UgbGltaXRhdGlvbnMgd2l0aCB0cmFuc2Zvcm1lcnMgY2FuIGJlIGZvdW5kIGluOlxuICogICAxLiBodHRwczovL2dpdGh1Yi5jb20vTWljcm9zb2Z0L1R5cGVTY3JpcHQvaXNzdWVzLzE3NTUyLlxuICogICAyLiBodHRwczovL2dpdGh1Yi5jb20vbWljcm9zb2Z0L1R5cGVTY3JpcHQvaXNzdWVzLzE3NTE2LlxuICogICAzLiBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci90c2lja2xlL2lzc3Vlcy82MzUuXG4gKlxuICogVGhlIHBhdGNoIHdlIGFwcGx5IHRvIHRlbGwgVHlwZVNjcmlwdCBhYm91dCBhY3R1YWwgcmVmZXJlbmNlZCBhbGlhc2VzIChpLmUuIGltcG9ydGVkIHN5bWJvbHMpLFxuICogbWF0Y2hlcyBjb25jZXB0dWFsbHkgd2l0aCB0aGUgbG9naWMgdGhhdCBydW5zIGludGVybmFsbHkgaW4gVHlwZVNjcmlwdCB3aGVuIHRoZVxuICogYGVtaXREZWNvcmF0b3JNZXRhZGF0YWAgZmxhZyBpcyBlbmFibGVkLiBUeXBlU2NyaXB0IGJhc2ljYWxseSBzdXJmYWNlcyB0aGUgc2FtZSBwcm9ibGVtIGFuZFxuICogc29sdmVzIGl0IGNvbmNlcHR1YWxseSB0aGUgc2FtZSB3YXksIGJ1dCBvYnZpb3VzbHkgZG9lc24ndCBuZWVkIHRvIGFjY2VzcyBhbiBgQGludGVybmFsYCBBUEkuXG4gKlxuICogVGhlIHNldCB0aGF0IGlzIHJldHVybmVkIGJ5IHRoaXMgZnVuY3Rpb24gaXMgbWVhbnQgdG8gYmUgZmlsbGVkIHdpdGggaW1wb3J0IGRlY2xhcmF0aW9uIG5vZGVzXG4gKiB0aGF0IGhhdmUgYmVlbiByZWZlcmVuY2VkIGluIGEgdmFsdWUtcG9zaXRpb24gYnkgdGhlIHRyYW5zZm9ybSwgc3VjaCB0aGUgaW5zdGFsbGVkIHBhdGNoIGNhblxuICogZW5zdXJlIHRoYXQgdGhvc2UgaW1wb3J0IGRlY2xhcmF0aW9ucyBhcmUgbm90IGVsaWRlZC5cbiAqXG4gKiBTZWUgYmVsb3cuIE5vdGUgdGhhdCB0aGlzIHVzZXMgc291cmNlZ3JhcGggYXMgdGhlIFR5cGVTY3JpcHQgY2hlY2tlciBmaWxlIGRvZXNuJ3QgZGlzcGxheSBvblxuICogR2l0aHViLlxuICogaHR0cHM6Ly9zb3VyY2VncmFwaC5jb20vZ2l0aHViLmNvbS9taWNyb3NvZnQvVHlwZVNjcmlwdEAzZWFhN2M2NWY2ZjA3NmEwOGE1ZjdmMTk0NmZkMGRmN2M3NDMwMjU5Ly0vYmxvYi9zcmMvY29tcGlsZXIvY2hlY2tlci50cyNMMzEyMTktMzEyNTdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxvYWRJc1JlZmVyZW5jZWRBbGlhc0RlY2xhcmF0aW9uUGF0Y2goY29udGV4dDogdHMuVHJhbnNmb3JtYXRpb25Db250ZXh0KTpcbiAgICBTZXQ8dHMuRGVjbGFyYXRpb24+IHtcbiAgLy8gSWYgdGhlIGBnZXRFbWl0UmVzb2x2ZXJgIG1ldGhvZCBpcyBub3QgYXZhaWxhYmxlLCBUUyBtb3N0IGxpa2VseSBjaGFuZ2VkIHRoZVxuICAvLyBpbnRlcm5hbCBzdHJ1Y3R1cmUgb2YgdGhlIHRyYW5zZm9ybWF0aW9uIGNvbnRleHQuIFdlIHdpbGwgYWJvcnQgZ3JhY2VmdWxseS5cbiAgaWYgKCFpc1RyYW5zZm9ybWF0aW9uQ29udGV4dFdpdGhFbWl0UmVzb2x2ZXIoY29udGV4dCkpIHtcbiAgICB0aHJvd0luY29tcGF0aWJsZVRyYW5zZm9ybWF0aW9uQ29udGV4dEVycm9yKCk7XG4gIH1cbiAgY29uc3QgZW1pdFJlc29sdmVyID0gY29udGV4dC5nZXRFbWl0UmVzb2x2ZXIoKTtcblxuICAvLyBUaGUgZW1pdCByZXNvbHZlciBtYXkgaGF2ZSBiZWVuIHBhdGNoZWQgYWxyZWFkeSwgaW4gd2hpY2ggY2FzZSB3ZSByZXR1cm4gdGhlIHNldCBvZiByZWZlcmVuY2VkXG4gIC8vIGFsaWFzZXMgdGhhdCB3YXMgY3JlYXRlZCB3aGVuIHRoZSBwYXRjaCB3YXMgZmlyc3QgYXBwbGllZC5cbiAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvaXNzdWVzLzQwMjc2LlxuICBjb25zdCBleGlzdGluZ1JlZmVyZW5jZWRBbGlhc2VzID0gZW1pdFJlc29sdmVyW3BhdGNoZWRSZWZlcmVuY2VkQWxpYXNlc1N5bWJvbF07XG4gIGlmIChleGlzdGluZ1JlZmVyZW5jZWRBbGlhc2VzICE9PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gZXhpc3RpbmdSZWZlcmVuY2VkQWxpYXNlcztcbiAgfVxuXG4gIGNvbnN0IG9yaWdpbmFsSXNSZWZlcmVuY2VkQWxpYXNEZWNsYXJhdGlvbiA9IGVtaXRSZXNvbHZlci5pc1JlZmVyZW5jZWRBbGlhc0RlY2xhcmF0aW9uO1xuICAvLyBJZiB0aGUgZW1pdCByZXNvbHZlciBkb2VzIG5vdCBoYXZlIGEgZnVuY3Rpb24gY2FsbGVkIGBpc1JlZmVyZW5jZWRBbGlhc0RlY2xhcmF0aW9uYCwgdGhlblxuICAvLyB3ZSBhYm9ydCBncmFjZWZ1bGx5IGFzIG1vc3QgbGlrZWx5IFRTIGNoYW5nZWQgdGhlIGludGVybmFsIHN0cnVjdHVyZSBvZiB0aGUgZW1pdCByZXNvbHZlci5cbiAgaWYgKG9yaWdpbmFsSXNSZWZlcmVuY2VkQWxpYXNEZWNsYXJhdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3dJbmNvbXBhdGlibGVUcmFuc2Zvcm1hdGlvbkNvbnRleHRFcnJvcigpO1xuICB9XG5cbiAgY29uc3QgcmVmZXJlbmNlZEFsaWFzZXMgPSBuZXcgU2V0PHRzLkRlY2xhcmF0aW9uPigpO1xuICBlbWl0UmVzb2x2ZXIuaXNSZWZlcmVuY2VkQWxpYXNEZWNsYXJhdGlvbiA9IGZ1bmN0aW9uKG5vZGUsIC4uLmFyZ3MpIHtcbiAgICBpZiAoaXNBbGlhc0ltcG9ydERlY2xhcmF0aW9uKG5vZGUpICYmIHJlZmVyZW5jZWRBbGlhc2VzLmhhcyhub2RlKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBvcmlnaW5hbElzUmVmZXJlbmNlZEFsaWFzRGVjbGFyYXRpb24uY2FsbChlbWl0UmVzb2x2ZXIsIG5vZGUsIC4uLmFyZ3MpO1xuICB9O1xuICByZXR1cm4gZW1pdFJlc29sdmVyW3BhdGNoZWRSZWZlcmVuY2VkQWxpYXNlc1N5bWJvbF0gPSByZWZlcmVuY2VkQWxpYXNlcztcbn1cblxuLyoqXG4gKiBHZXRzIHdoZXRoZXIgYSBnaXZlbiBub2RlIGNvcnJlc3BvbmRzIHRvIGFuIGltcG9ydCBhbGlhcyBkZWNsYXJhdGlvbi4gQWxpYXNcbiAqIGRlY2xhcmF0aW9ucyBjYW4gYmUgaW1wb3J0IHNwZWNpZmllcnMsIG5hbWVzcGFjZSBpbXBvcnRzIG9yIGltcG9ydCBjbGF1c2VzXG4gKiBhcyB0aGVzZSBkbyBub3QgZGVjbGFyZSBhbiBhY3R1YWwgc3ltYm9sIGJ1dCBqdXN0IHBvaW50IHRvIGEgdGFyZ2V0IGRlY2xhcmF0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNBbGlhc0ltcG9ydERlY2xhcmF0aW9uKG5vZGU6IHRzLk5vZGUpOiBub2RlIGlzIHRzLkltcG9ydFNwZWNpZmllcnxcbiAgICB0cy5OYW1lc3BhY2VJbXBvcnR8dHMuSW1wb3J0Q2xhdXNlIHtcbiAgcmV0dXJuIHRzLmlzSW1wb3J0U3BlY2lmaWVyKG5vZGUpIHx8IHRzLmlzTmFtZXNwYWNlSW1wb3J0KG5vZGUpIHx8IHRzLmlzSW1wb3J0Q2xhdXNlKG5vZGUpO1xufVxuXG4vKiogV2hldGhlciB0aGUgdHJhbnNmb3JtYXRpb24gY29udGV4dCBleHBvc2VzIGl0cyBlbWl0IHJlc29sdmVyLiAqL1xuZnVuY3Rpb24gaXNUcmFuc2Zvcm1hdGlvbkNvbnRleHRXaXRoRW1pdFJlc29sdmVyKGNvbnRleHQ6IHRzLlRyYW5zZm9ybWF0aW9uQ29udGV4dCk6XG4gICAgY29udGV4dCBpcyBUcmFuc2Zvcm1hdGlvbkNvbnRleHRXaXRoUmVzb2x2ZXIge1xuICByZXR1cm4gKGNvbnRleHQgYXMgUGFydGlhbDxUcmFuc2Zvcm1hdGlvbkNvbnRleHRXaXRoUmVzb2x2ZXI+KS5nZXRFbWl0UmVzb2x2ZXIgIT09IHVuZGVmaW5lZDtcbn1cblxuXG4vKipcbiAqIFRocm93cyBhbiBlcnJvciBhYm91dCBhbiBpbmNvbXBhdGlibGUgVHlwZVNjcmlwdCB2ZXJzaW9uIGZvciB3aGljaCB0aGUgYWxpYXNcbiAqIGRlY2xhcmF0aW9uIHJlZmVyZW5jZSByZXNvbHV0aW9uIGNvdWxkIG5vdCBiZSBtb25rZXktcGF0Y2hlZC4gVGhlIGVycm9yIHdpbGxcbiAqIGFsc28gcHJvcG9zZSBwb3RlbnRpYWwgc29sdXRpb25zIHRoYXQgY2FuIGJlIGFwcGxpZWQgYnkgZGV2ZWxvcGVycy5cbiAqL1xuZnVuY3Rpb24gdGhyb3dJbmNvbXBhdGlibGVUcmFuc2Zvcm1hdGlvbkNvbnRleHRFcnJvcigpOiBuZXZlciB7XG4gIHRocm93IEVycm9yKFxuICAgICAgJ1VuYWJsZSB0byBkb3dubGV2ZWwgQW5ndWxhciBkZWNvcmF0b3JzIGR1ZSB0byBhbiBpbmNvbXBhdGlibGUgVHlwZVNjcmlwdCAnICtcbiAgICAgICd2ZXJzaW9uLlxcbklmIHlvdSByZWNlbnRseSB1cGRhdGVkIFR5cGVTY3JpcHQgYW5kIHRoaXMgaXNzdWUgc3VyZmFjZXMgbm93LCBjb25zaWRlciAnICtcbiAgICAgICdkb3duZ3JhZGluZy5cXG5cXG4nICtcbiAgICAgICdQbGVhc2UgcmVwb3J0IGFuIGlzc3VlIG9uIHRoZSBBbmd1bGFyIHJlcG9zaXRvcmllcyB3aGVuIHRoaXMgaXNzdWUgJyArXG4gICAgICAnc3VyZmFjZXMgYW5kIHlvdSBhcmUgdXNpbmcgYSBzdXBwb3NlZGx5IGNvbXBhdGlibGUgVHlwZVNjcmlwdCB2ZXJzaW9uLicpO1xufVxuIl19