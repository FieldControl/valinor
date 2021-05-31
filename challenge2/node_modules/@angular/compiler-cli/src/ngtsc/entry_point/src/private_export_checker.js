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
        define("@angular/compiler-cli/src/ngtsc/entry_point/src/private_export_checker", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/src/ngtsc/diagnostics"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.checkForPrivateExports = void 0;
    var tslib_1 = require("tslib");
    var ts = require("typescript");
    var diagnostics_1 = require("@angular/compiler-cli/src/ngtsc/diagnostics");
    /**
     * Produce `ts.Diagnostic`s for classes that are visible from exported types (e.g. directives
     * exposed by exported `NgModule`s) that are not themselves exported.
     *
     * This function reconciles two concepts:
     *
     * A class is Exported if it's exported from the main library `entryPoint` file.
     * A class is Visible if, via Angular semantics, a downstream consumer can import an Exported class
     * and be affected by the class in question. For example, an Exported NgModule may expose a
     * directive class to its consumers. Consumers that import the NgModule may have the directive
     * applied to elements in their templates. In this case, the directive is considered Visible.
     *
     * `checkForPrivateExports` attempts to verify that all Visible classes are Exported, and report
     * `ts.Diagnostic`s for those that aren't.
     *
     * @param entryPoint `ts.SourceFile` of the library's entrypoint, which should export the library's
     * public API.
     * @param checker `ts.TypeChecker` for the current program.
     * @param refGraph `ReferenceGraph` tracking the visibility of Angular types.
     * @returns an array of `ts.Diagnostic`s representing errors when visible classes are not exported
     * properly.
     */
    function checkForPrivateExports(entryPoint, checker, refGraph) {
        var diagnostics = [];
        // Firstly, compute the exports of the entry point. These are all the Exported classes.
        var topLevelExports = new Set();
        // Do this via `ts.TypeChecker.getExportsOfModule`.
        var moduleSymbol = checker.getSymbolAtLocation(entryPoint);
        if (moduleSymbol === undefined) {
            throw new Error("Internal error: failed to get symbol for entrypoint");
        }
        var exportedSymbols = checker.getExportsOfModule(moduleSymbol);
        // Loop through the exported symbols, de-alias if needed, and add them to `topLevelExports`.
        // TODO(alxhub): use proper iteration when build.sh is removed. (#27762)
        exportedSymbols.forEach(function (symbol) {
            if (symbol.flags & ts.SymbolFlags.Alias) {
                symbol = checker.getAliasedSymbol(symbol);
            }
            var decl = symbol.valueDeclaration;
            if (decl !== undefined) {
                topLevelExports.add(decl);
            }
        });
        // Next, go through each exported class and expand it to the set of classes it makes Visible,
        // using the `ReferenceGraph`. For each Visible class, verify that it's also Exported, and queue
        // an error if it isn't. `checkedSet` ensures only one error is queued per class.
        var checkedSet = new Set();
        // Loop through each Exported class.
        // TODO(alxhub): use proper iteration when the legacy build is removed. (#27762)
        topLevelExports.forEach(function (mainExport) {
            // Loop through each class made Visible by the Exported class.
            refGraph.transitiveReferencesOf(mainExport).forEach(function (transitiveReference) {
                // Skip classes which have already been checked.
                if (checkedSet.has(transitiveReference)) {
                    return;
                }
                checkedSet.add(transitiveReference);
                // Verify that the Visible class is also Exported.
                if (!topLevelExports.has(transitiveReference)) {
                    // This is an error, `mainExport` makes `transitiveReference` Visible, but
                    // `transitiveReference` is not Exported from the entrypoint. Construct a diagnostic to
                    // give to the user explaining the situation.
                    var descriptor = getDescriptorOfDeclaration(transitiveReference);
                    var name_1 = getNameOfDeclaration(transitiveReference);
                    // Construct the path of visibility, from `mainExport` to `transitiveReference`.
                    var visibleVia = 'NgModule exports';
                    var transitivePath = refGraph.pathFrom(mainExport, transitiveReference);
                    if (transitivePath !== null) {
                        visibleVia = transitivePath.map(function (seg) { return getNameOfDeclaration(seg); }).join(' -> ');
                    }
                    var diagnostic = tslib_1.__assign(tslib_1.__assign({ category: ts.DiagnosticCategory.Error, code: diagnostics_1.ngErrorCode(diagnostics_1.ErrorCode.SYMBOL_NOT_EXPORTED), file: transitiveReference.getSourceFile() }, getPosOfDeclaration(transitiveReference)), { messageText: "Unsupported private " + descriptor + " " + name_1 + ". This " + descriptor + " is visible to consumers via " + visibleVia + ", but is not exported from the top-level library entrypoint." });
                    diagnostics.push(diagnostic);
                }
            });
        });
        return diagnostics;
    }
    exports.checkForPrivateExports = checkForPrivateExports;
    function getPosOfDeclaration(decl) {
        var node = getIdentifierOfDeclaration(decl) || decl;
        return {
            start: node.getStart(),
            length: node.getEnd() + 1 - node.getStart(),
        };
    }
    function getIdentifierOfDeclaration(decl) {
        if ((ts.isClassDeclaration(decl) || ts.isVariableDeclaration(decl) ||
            ts.isFunctionDeclaration(decl)) &&
            decl.name !== undefined && ts.isIdentifier(decl.name)) {
            return decl.name;
        }
        else {
            return null;
        }
    }
    function getNameOfDeclaration(decl) {
        var id = getIdentifierOfDeclaration(decl);
        return id !== null ? id.text : '(unnamed)';
    }
    function getDescriptorOfDeclaration(decl) {
        switch (decl.kind) {
            case ts.SyntaxKind.ClassDeclaration:
                return 'class';
            case ts.SyntaxKind.FunctionDeclaration:
                return 'function';
            case ts.SyntaxKind.VariableDeclaration:
                return 'variable';
            case ts.SyntaxKind.EnumDeclaration:
                return 'enum';
            default:
                return 'declaration';
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJpdmF0ZV9leHBvcnRfY2hlY2tlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvZW50cnlfcG9pbnQvc3JjL3ByaXZhdGVfZXhwb3J0X2NoZWNrZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILCtCQUFpQztJQUVqQywyRUFBeUQ7SUFLekQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQXFCRztJQUNILFNBQWdCLHNCQUFzQixDQUNsQyxVQUF5QixFQUFFLE9BQXVCLEVBQUUsUUFBd0I7UUFDOUUsSUFBTSxXQUFXLEdBQW9CLEVBQUUsQ0FBQztRQUV4Qyx1RkFBdUY7UUFDdkYsSUFBTSxlQUFlLEdBQUcsSUFBSSxHQUFHLEVBQW1CLENBQUM7UUFFbkQsbURBQW1EO1FBQ25ELElBQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUM3RCxJQUFJLFlBQVksS0FBSyxTQUFTLEVBQUU7WUFDOUIsTUFBTSxJQUFJLEtBQUssQ0FBQyxxREFBcUQsQ0FBQyxDQUFDO1NBQ3hFO1FBQ0QsSUFBTSxlQUFlLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxDQUFDO1FBRWpFLDRGQUE0RjtRQUM1Rix3RUFBd0U7UUFDeEUsZUFBZSxDQUFDLE9BQU8sQ0FBQyxVQUFBLE1BQU07WUFDNUIsSUFBSSxNQUFNLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFO2dCQUN2QyxNQUFNLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQzNDO1lBQ0QsSUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLGdCQUFnQixDQUFDO1lBQ3JDLElBQUksSUFBSSxLQUFLLFNBQVMsRUFBRTtnQkFDdEIsZUFB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LENBQUM7U0FDYjtJQUNILENBQUM7SUFFRCxTQUFTLG9CQUFvQixDQUFDLElBQXFCO1FBQ2pELElBQU0sRUFBRSxHQUFHLDBCQUEwQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzVDLE9BQU8sRUFBRSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDO0lBQzdDLENBQUM7SUFFRCxTQUFTLDBCQUEwQixDQUFDLElBQXFCO1FBQ3ZELFFBQVEsSUFBSSxDQUFDLElBQUksRUFBRTtZQUNqQixLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsZ0JBQWdCO2dCQUNqQyxPQUFPLE9BQU8sQ0FBQztZQUNqQixLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsbUJBQW1CO2dCQUNwQyxPQUFPLFVBQVUsQ0FBQztZQUNwQixLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsbUJBQW1CO2dCQUNwQyxPQUFPLFVBQVUsQ0FBQztZQUNwQixLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsZUFBZTtnQkFDaEMsT0FBTyxNQUFNLENBQUM7WUFDaEI7Z0JBQ0UsT0FBTyxhQUFhLENBQUM7U0FDeEI7SUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQge0Vycm9yQ29kZSwgbmdFcnJvckNvZGV9IGZyb20gJy4uLy4uL2RpYWdub3N0aWNzJztcbmltcG9ydCB7RGVjbGFyYXRpb25Ob2RlfSBmcm9tICcuLi8uLi9yZWZsZWN0aW9uJztcblxuaW1wb3J0IHtSZWZlcmVuY2VHcmFwaH0gZnJvbSAnLi9yZWZlcmVuY2VfZ3JhcGgnO1xuXG4vKipcbiAqIFByb2R1Y2UgYHRzLkRpYWdub3N0aWNgcyBmb3IgY2xhc3NlcyB0aGF0IGFyZSB2aXNpYmxlIGZyb20gZXhwb3J0ZWQgdHlwZXMgKGUuZy4gZGlyZWN0aXZlc1xuICogZXhwb3NlZCBieSBleHBvcnRlZCBgTmdNb2R1bGVgcykgdGhhdCBhcmUgbm90IHRoZW1zZWx2ZXMgZXhwb3J0ZWQuXG4gKlxuICogVGhpcyBmdW5jdGlvbiByZWNvbmNpbGVzIHR3byBjb25jZXB0czpcbiAqXG4gKiBBIGNsYXNzIGlzIEV4cG9ydGVkIGlmIGl0J3MgZXhwb3J0ZWQgZnJvbSB0aGUgbWFpbiBsaWJyYXJ5IGBlbnRyeVBvaW50YCBmaWxlLlxuICogQSBjbGFzcyBpcyBWaXNpYmxlIGlmLCB2aWEgQW5ndWxhciBzZW1hbnRpY3MsIGEgZG93bnN0cmVhbSBjb25zdW1lciBjYW4gaW1wb3J0IGFuIEV4cG9ydGVkIGNsYXNzXG4gKiBhbmQgYmUgYWZmZWN0ZWQgYnkgdGhlIGNsYXNzIGluIHF1ZXN0aW9uLiBGb3IgZXhhbXBsZSwgYW4gRXhwb3J0ZWQgTmdNb2R1bGUgbWF5IGV4cG9zZSBhXG4gKiBkaXJlY3RpdmUgY2xhc3MgdG8gaXRzIGNvbnN1bWVycy4gQ29uc3VtZXJzIHRoYXQgaW1wb3J0IHRoZSBOZ01vZHVsZSBtYXkgaGF2ZSB0aGUgZGlyZWN0aXZlXG4gKiBhcHBsaWVkIHRvIGVsZW1lbnRzIGluIHRoZWlyIHRlbXBsYXRlcy4gSW4gdGhpcyBjYXNlLCB0aGUgZGlyZWN0aXZlIGlzIGNvbnNpZGVyZWQgVmlzaWJsZS5cbiAqXG4gKiBgY2hlY2tGb3JQcml2YXRlRXhwb3J0c2AgYXR0ZW1wdHMgdG8gdmVyaWZ5IHRoYXQgYWxsIFZpc2libGUgY2xhc3NlcyBhcmUgRXhwb3J0ZWQsIGFuZCByZXBvcnRcbiAqIGB0cy5EaWFnbm9zdGljYHMgZm9yIHRob3NlIHRoYXQgYXJlbid0LlxuICpcbiAqIEBwYXJhbSBlbnRyeVBvaW50IGB0cy5Tb3VyY2VGaWxlYCBvZiB0aGUgbGlicmFyeSdzIGVudHJ5cG9pbnQsIHdoaWNoIHNob3VsZCBleHBvcnQgdGhlIGxpYnJhcnknc1xuICogcHVibGljIEFQSS5cbiAqIEBwYXJhbSBjaGVja2VyIGB0cy5UeXBlQ2hlY2tlcmAgZm9yIHRoZSBjdXJyZW50IHByb2dyYW0uXG4gKiBAcGFyYW0gcmVmR3JhcGggYFJlZmVyZW5jZUdyYXBoYCB0cmFja2luZyB0aGUgdmlzaWJpbGl0eSBvZiBBbmd1bGFyIHR5cGVzLlxuICogQHJldHVybnMgYW4gYXJyYXkgb2YgYHRzLkRpYWdub3N0aWNgcyByZXByZXNlbnRpbmcgZXJyb3JzIHdoZW4gdmlzaWJsZSBjbGFzc2VzIGFyZSBub3QgZXhwb3J0ZWRcbiAqIHByb3Blcmx5LlxuICovXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tGb3JQcml2YXRlRXhwb3J0cyhcbiAgICBlbnRyeVBvaW50OiB0cy5Tb3VyY2VGaWxlLCBjaGVja2VyOiB0cy5UeXBlQ2hlY2tlciwgcmVmR3JhcGg6IFJlZmVyZW5jZUdyYXBoKTogdHMuRGlhZ25vc3RpY1tdIHtcbiAgY29uc3QgZGlhZ25vc3RpY3M6IHRzLkRpYWdub3N0aWNbXSA9IFtdO1xuXG4gIC8vIEZpcnN0bHksIGNvbXB1dGUgdGhlIGV4cG9ydHMgb2YgdGhlIGVudHJ5IHBvaW50LiBUaGVzZSBhcmUgYWxsIHRoZSBFeHBvcnRlZCBjbGFzc2VzLlxuICBjb25zdCB0b3BMZXZlbEV4cG9ydHMgPSBuZXcgU2V0PERlY2xhcmF0aW9uTm9kZT4oKTtcblxuICAvLyBEbyB0aGlzIHZpYSBgdHMuVHlwZUNoZWNrZXIuZ2V0RXhwb3J0c09mTW9kdWxlYC5cbiAgY29uc3QgbW9kdWxlU3ltYm9sID0gY2hlY2tlci5nZXRTeW1ib2xBdExvY2F0aW9uKGVudHJ5UG9pbnQpO1xuICBpZiAobW9kdWxlU3ltYm9sID09PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEludGVybmFsIGVycm9yOiBmYWlsZWQgdG8gZ2V0IHN5bWJvbCBmb3IgZW50cnlwb2ludGApO1xuICB9XG4gIGNvbnN0IGV4cG9ydGVkU3ltYm9scyA9IGNoZWNrZXIuZ2V0RXhwb3J0c09mTW9kdWxlKG1vZHVsZVN5bWJvbCk7XG5cbiAgLy8gTG9vcCB0aHJvdWdoIHRoZSBleHBvcnRlZCBzeW1ib2xzLCBkZS1hbGlhcyBpZiBuZWVkZWQsIGFuZCBhZGQgdGhlbSB0byBgdG9wTGV2ZWxFeHBvcnRzYC5cbiAgLy8gVE9ETyhhbHhodWIpOiB1c2UgcHJvcGVyIGl0ZXJhdGlvbiB3aGVuIGJ1aWxkLnNoIGlzIHJlbW92ZWQuICgjMjc3NjIpXG4gIGV4cG9ydGVkU3ltYm9scy5mb3JFYWNoKHN5bWJvbCA9PiB7XG4gICAgaWYgKHN5bWJvbC5mbGFncyAmIHRzLlN5bWJvbEZsYWdzLkFsaWFzKSB7XG4gICAgICBzeW1ib2wgPSBjaGVja2VyLmdldEFsaWFzZWRTeW1ib2woc3ltYm9sKTtcbiAgICB9XG4gICAgY29uc3QgZGVjbCA9IHN5bWJvbC52YWx1ZURlY2xhcmF0aW9uO1xuICAgIGlmIChkZWNsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRvcExldmVsRXhwb3J0cy5hZGQoZGVjbCk7XG4gICAgfVxuICB9KTtcblxuICAvLyBOZXh0LCBnbyB0aHJvdWdoIGVhY2ggZXhwb3J0ZWQgY2xhc3MgYW5kIGV4cGFuZCBpdCB0byB0aGUgc2V0IG9mIGNsYXNzZXMgaXQgbWFrZXMgVmlzaWJsZSxcbiAgLy8gdXNpbmcgdGhlIGBSZWZlcmVuY2VHcmFwaGAuIEZvciBlYWNoIFZpc2libGUgY2xhc3MsIHZlcmlmeSB0aGF0IGl0J3MgYWxzbyBFeHBvcnRlZCwgYW5kIHF1ZXVlXG4gIC8vIGFuIGVycm9yIGlmIGl0IGlzbid0LiBgY2hlY2tlZFNldGAgZW5zdXJlcyBvbmx5IG9uZSBlcnJvciBpcyBxdWV1ZWQgcGVyIGNsYXNzLlxuICBjb25zdCBjaGVja2VkU2V0ID0gbmV3IFNldDxEZWNsYXJhdGlvbk5vZGU+KCk7XG5cbiAgLy8gTG9vcCB0aHJvdWdoIGVhY2ggRXhwb3J0ZWQgY2xhc3MuXG4gIC8vIFRPRE8oYWx4aHViKTogdXNlIHByb3BlciBpdGVyYXRpb24gd2hlbiB0aGUgbGVnYWN5IGJ1aWxkIGlzIHJlbW92ZWQuICgjMjc3NjIpXG4gIHRvcExldmVsRXhwb3J0cy5mb3JFYWNoKG1haW5FeHBvcnQgPT4ge1xuICAgIC8vIExvb3AgdGhyb3VnaCBlYWNoIGNsYXNzIG1hZGUgVmlzaWJsZSBieSB0aGUgRXhwb3J0ZWQgY2xhc3MuXG4gICAgcmVmR3JhcGgudHJhbnNpdGl2ZVJlZmVyZW5jZXNPZihtYWluRXhwb3J0KS5mb3JFYWNoKHRyYW5zaXRpdmVSZWZlcmVuY2UgPT4ge1xuICAgICAgLy8gU2tpcCBjbGFzc2VzIHdoaWNoIGhhdmUgYWxyZWFkeSBiZWVuIGNoZWNrZWQuXG4gICAgICBpZiAoY2hlY2tlZFNldC5oYXModHJhbnNpdGl2ZVJlZmVyZW5jZSkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY2hlY2tlZFNldC5hZGQodHJhbnNpdGl2ZVJlZmVyZW5jZSk7XG5cbiAgICAgIC8vIFZlcmlmeSB0aGF0IHRoZSBWaXNpYmxlIGNsYXNzIGlzIGFsc28gRXhwb3J0ZWQuXG4gICAgICBpZiAoIXRvcExldmVsRXhwb3J0cy5oYXModHJhbnNpdGl2ZVJlZmVyZW5jZSkpIHtcbiAgICAgICAgLy8gVGhpcyBpcyBhbiBlcnJvciwgYG1haW5FeHBvcnRgIG1ha2VzIGB0cmFuc2l0aXZlUmVmZXJlbmNlYCBWaXNpYmxlLCBidXRcbiAgICAgICAgLy8gYHRyYW5zaXRpdmVSZWZlcmVuY2VgIGlzIG5vdCBFeHBvcnRlZCBmcm9tIHRoZSBlbnRyeXBvaW50LiBDb25zdHJ1Y3QgYSBkaWFnbm9zdGljIHRvXG4gICAgICAgIC8vIGdpdmUgdG8gdGhlIHVzZXIgZXhwbGFpbmluZyB0aGUgc2l0dWF0aW9uLlxuXG4gICAgICAgIGNvbnN0IGRlc2NyaXB0b3IgPSBnZXREZXNjcmlwdG9yT2ZEZWNsYXJhdGlvbih0cmFuc2l0aXZlUmVmZXJlbmNlKTtcbiAgICAgICAgY29uc3QgbmFtZSA9IGdldE5hbWVPZkRlY2xhcmF0aW9uKHRyYW5zaXRpdmVSZWZlcmVuY2UpO1xuXG4gICAgICAgIC8vIENvbnN0cnVjdCB0aGUgcGF0aCBvZiB2aXNpYmlsaXR5LCBmcm9tIGBtYWluRXhwb3J0YCB0byBgdHJhbnNpdGl2ZVJlZmVyZW5jZWAuXG4gICAgICAgIGxldCB2aXNpYmxlVmlhID0gJ05nTW9kdWxlIGV4cG9ydHMnO1xuICAgICAgICBjb25zdCB0cmFuc2l0aXZlUGF0aCA9IHJlZkdyYXBoLnBhdGhGcm9tKG1haW5FeHBvcnQsIHRyYW5zaXRpdmVSZWZlcmVuY2UpO1xuICAgICAgICBpZiAodHJhbnNpdGl2ZVBhdGggIT09IG51bGwpIHtcbiAgICAgICAgICB2aXNpYmxlVmlhID0gdHJhbnNpdGl2ZVBhdGgubWFwKHNlZyA9PiBnZXROYW1lT2ZEZWNsYXJhdGlvbihzZWcpKS5qb2luKCcgLT4gJyk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBkaWFnbm9zdGljOiB0cy5EaWFnbm9zdGljID0ge1xuICAgICAgICAgIGNhdGVnb3J5OiB0cy5EaWFnbm9zdGljQ2F0ZWdvcnkuRXJyb3IsXG4gICAgICAgICAgY29kZTogbmdFcnJvckNvZGUoRXJyb3JDb2RlLlNZTUJPTF9OT1RfRVhQT1JURUQpLFxuICAgICAgICAgIGZpbGU6IHRyYW5zaXRpdmVSZWZlcmVuY2UuZ2V0U291cmNlRmlsZSgpLFxuICAgICAgICAgIC4uLmdldFBvc09mRGVjbGFyYXRpb24odHJhbnNpdGl2ZVJlZmVyZW5jZSksXG4gICAgICAgICAgbWVzc2FnZVRleHQ6IGBVbnN1cHBvcnRlZCBwcml2YXRlICR7ZGVzY3JpcHRvcn0gJHtuYW1lfS4gVGhpcyAke1xuICAgICAgICAgICAgICBkZXNjcmlwdG9yfSBpcyB2aXNpYmxlIHRvIGNvbnN1bWVycyB2aWEgJHtcbiAgICAgICAgICAgICAgdmlzaWJsZVZpYX0sIGJ1dCBpcyBub3QgZXhwb3J0ZWQgZnJvbSB0aGUgdG9wLWxldmVsIGxpYnJhcnkgZW50cnlwb2ludC5gLFxuICAgICAgICB9O1xuXG4gICAgICAgIGRpYWdub3N0aWNzLnB1c2goZGlhZ25vc3RpYyk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xuXG4gIHJldHVybiBkaWFnbm9zdGljcztcbn1cblxuZnVuY3Rpb24gZ2V0UG9zT2ZEZWNsYXJhdGlvbihkZWNsOiBEZWNsYXJhdGlvbk5vZGUpOiB7c3RhcnQ6IG51bWJlciwgbGVuZ3RoOiBudW1iZXJ9IHtcbiAgY29uc3Qgbm9kZTogdHMuTm9kZSA9IGdldElkZW50aWZpZXJPZkRlY2xhcmF0aW9uKGRlY2wpIHx8IGRlY2w7XG4gIHJldHVybiB7XG4gICAgc3RhcnQ6IG5vZGUuZ2V0U3RhcnQoKSxcbiAgICBsZW5ndGg6IG5vZGUuZ2V0RW5kKCkgKyAxIC0gbm9kZS5nZXRTdGFydCgpLFxuICB9O1xufVxuXG5mdW5jdGlvbiBnZXRJZGVudGlmaWVyT2ZEZWNsYXJhdGlvbihkZWNsOiBEZWNsYXJhdGlvbk5vZGUpOiB0cy5JZGVudGlmaWVyfG51bGwge1xuICBpZiAoKHRzLmlzQ2xhc3NEZWNsYXJhdGlvbihkZWNsKSB8fCB0cy5pc1ZhcmlhYmxlRGVjbGFyYXRpb24oZGVjbCkgfHxcbiAgICAgICB0cy5pc0Z1bmN0aW9uRGVjbGFyYXRpb24oZGVjbCkpICYmXG4gICAgICBkZWNsLm5hbWUgIT09IHVuZGVmaW5lZCAmJiB0cy5pc0lkZW50aWZpZXIoZGVjbC5uYW1lKSkge1xuICAgIHJldHVybiBkZWNsLm5hbWU7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0TmFtZU9mRGVjbGFyYXRpb24oZGVjbDogRGVjbGFyYXRpb25Ob2RlKTogc3RyaW5nIHtcbiAgY29uc3QgaWQgPSBnZXRJZGVudGlmaWVyT2ZEZWNsYXJhdGlvbihkZWNsKTtcbiAgcmV0dXJuIGlkICE9PSBudWxsID8gaWQudGV4dCA6ICcodW5uYW1lZCknO1xufVxuXG5mdW5jdGlvbiBnZXREZXNjcmlwdG9yT2ZEZWNsYXJhdGlvbihkZWNsOiBEZWNsYXJhdGlvbk5vZGUpOiBzdHJpbmcge1xuICBzd2l0Y2ggKGRlY2wua2luZCkge1xuICAgIGNhc2UgdHMuU3ludGF4S2luZC5DbGFzc0RlY2xhcmF0aW9uOlxuICAgICAgcmV0dXJuICdjbGFzcyc7XG4gICAgY2FzZSB0cy5TeW50YXhLaW5kLkZ1bmN0aW9uRGVjbGFyYXRpb246XG4gICAgICByZXR1cm4gJ2Z1bmN0aW9uJztcbiAgICBjYXNlIHRzLlN5bnRheEtpbmQuVmFyaWFibGVEZWNsYXJhdGlvbjpcbiAgICAgIHJldHVybiAndmFyaWFibGUnO1xuICAgIGNhc2UgdHMuU3ludGF4S2luZC5FbnVtRGVjbGFyYXRpb246XG4gICAgICByZXR1cm4gJ2VudW0nO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gJ2RlY2xhcmF0aW9uJztcbiAgfVxufVxuIl19