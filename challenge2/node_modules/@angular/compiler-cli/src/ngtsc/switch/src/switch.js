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
        define("@angular/compiler-cli/src/ngtsc/switch/src/switch", ["require", "exports", "tslib", "typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ivySwitchTransform = void 0;
    var tslib_1 = require("tslib");
    var ts = require("typescript");
    var IVY_SWITCH_PRE_SUFFIX = '__PRE_R3__';
    var IVY_SWITCH_POST_SUFFIX = '__POST_R3__';
    function ivySwitchTransform(_) {
        return flipIvySwitchInFile;
    }
    exports.ivySwitchTransform = ivySwitchTransform;
    function flipIvySwitchInFile(sf) {
        // To replace the statements array, it must be copied. This only needs to happen if a statement
        // must actually be replaced within the array, so the newStatements array is lazily initialized.
        var newStatements = undefined;
        // Iterate over the statements in the file.
        for (var i = 0; i < sf.statements.length; i++) {
            var statement = sf.statements[i];
            // Skip over everything that isn't a variable statement.
            if (!ts.isVariableStatement(statement) || !hasIvySwitches(statement)) {
                continue;
            }
            // This statement needs to be replaced. Check if the newStatements array needs to be lazily
            // initialized to a copy of the original statements.
            if (newStatements === undefined) {
                newStatements = tslib_1.__spreadArray([], tslib_1.__read(sf.statements));
            }
            // Flip any switches in the VariableStatement. If there were any, a new statement will be
            // returned; otherwise the old statement will be.
            newStatements[i] = flipIvySwitchesInVariableStatement(statement, sf.statements);
        }
        // Only update the statements in the SourceFile if any have changed.
        if (newStatements !== undefined) {
            return ts.updateSourceFileNode(sf, newStatements);
        }
        return sf;
    }
    /**
     * Look for the ts.Identifier of a ts.Declaration with this name.
     *
     * The real identifier is needed (rather than fabricating one) as TypeScript decides how to
     * reference this identifier based on information stored against its node in the AST, which a
     * synthetic node would not have. In particular, since the post-switch variable is often exported,
     * TypeScript needs to know this so it can write `exports.VAR` instead of just `VAR` when emitting
     * code.
     *
     * Only variable, function, and class declarations are currently searched.
     */
    function findPostSwitchIdentifier(statements, name) {
        var e_1, _a;
        try {
            for (var statements_1 = tslib_1.__values(statements), statements_1_1 = statements_1.next(); !statements_1_1.done; statements_1_1 = statements_1.next()) {
                var stmt = statements_1_1.value;
                if (ts.isVariableStatement(stmt)) {
                    var decl = stmt.declarationList.declarations.find(function (decl) { return ts.isIdentifier(decl.name) && decl.name.text === name; });
                    if (decl !== undefined) {
                        return decl.name;
                    }
                }
                else if (ts.isFunctionDeclaration(stmt) || ts.isClassDeclaration(stmt)) {
                    if (stmt.name !== undefined && ts.isIdentifier(stmt.name) && stmt.name.text === name) {
                        return stmt.name;
                    }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (statements_1_1 && !statements_1_1.done && (_a = statements_1.return)) _a.call(statements_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return null;
    }
    /**
     * Flip any Ivy switches which are discovered in the given ts.VariableStatement.
     */
    function flipIvySwitchesInVariableStatement(stmt, statements) {
        // Build a new list of variable declarations. Specific declarations that are initialized to a
        // pre-switch identifier will be replaced with a declaration initialized to the post-switch
        // identifier.
        var newDeclarations = tslib_1.__spreadArray([], tslib_1.__read(stmt.declarationList.declarations));
        for (var i = 0; i < newDeclarations.length; i++) {
            var decl = newDeclarations[i];
            // Skip declarations that aren't initialized to an identifier.
            if (decl.initializer === undefined || !ts.isIdentifier(decl.initializer)) {
                continue;
            }
            // Skip declarations that aren't Ivy switches.
            if (!decl.initializer.text.endsWith(IVY_SWITCH_PRE_SUFFIX)) {
                continue;
            }
            // Determine the name of the post-switch variable.
            var postSwitchName = decl.initializer.text.replace(IVY_SWITCH_PRE_SUFFIX, IVY_SWITCH_POST_SUFFIX);
            // Find the post-switch variable identifier. If one can't be found, it's an error. This is
            // reported as a thrown error and not a diagnostic as transformers cannot output diagnostics.
            var newIdentifier = findPostSwitchIdentifier(statements, postSwitchName);
            if (newIdentifier === null) {
                throw new Error("Unable to find identifier " + postSwitchName + " in " + stmt.getSourceFile().fileName + " for the Ivy switch.");
            }
            newDeclarations[i] = ts.updateVariableDeclaration(
            /* node */ decl, 
            /* name */ decl.name, 
            /* type */ decl.type, 
            /* initializer */ newIdentifier);
        }
        var newDeclList = ts.updateVariableDeclarationList(
        /* declarationList */ stmt.declarationList, 
        /* declarations */ newDeclarations);
        var newStmt = ts.updateVariableStatement(
        /* statement */ stmt, 
        /* modifiers */ stmt.modifiers, 
        /* declarationList */ newDeclList);
        return newStmt;
    }
    /**
     * Check whether the given VariableStatement has any Ivy switch variables.
     */
    function hasIvySwitches(stmt) {
        return stmt.declarationList.declarations.some(function (decl) { return decl.initializer !== undefined && ts.isIdentifier(decl.initializer) &&
            decl.initializer.text.endsWith(IVY_SWITCH_PRE_SUFFIX); });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3dpdGNoLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy9uZ3RzYy9zd2l0Y2gvc3JjL3N3aXRjaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgsK0JBQWlDO0lBRWpDLElBQU0scUJBQXFCLEdBQUcsWUFBWSxDQUFDO0lBQzNDLElBQU0sc0JBQXNCLEdBQUcsYUFBYSxDQUFDO0lBRTdDLFNBQWdCLGtCQUFrQixDQUFDLENBQTJCO1FBQzVELE9BQU8sbUJBQW1CLENBQUM7SUFDN0IsQ0FBQztJQUZELGdEQUVDO0lBRUQsU0FBUyxtQkFBbUIsQ0FBQyxFQUFpQjtRQUM1QywrRkFBK0Y7UUFDL0YsZ0dBQWdHO1FBQ2hHLElBQUksYUFBYSxHQUE2QixTQUFTLENBQUM7UUFFeEQsMkNBQTJDO1FBQzNDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUM3QyxJQUFNLFNBQVMsR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRW5DLHdEQUF3RDtZQUN4RCxJQUFJLENBQUMsRUFBRSxDQUFDLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxFQUFFO2dCQUNwRSxTQUFTO2FBQ1Y7WUFFRCwyRkFBMkY7WUFDM0Ysb0RBQW9EO1lBQ3BELElBQUksYUFBYSxLQUFLLFNBQVMsRUFBRTtnQkFDL0IsYUFBYSw0Q0FBTyxFQUFFLENBQUMsVUFBVSxFQUFDLENBQUM7YUFDcEM7WUFFRCx5RkFBeUY7WUFDekYsaURBQWlEO1lBQ2pELGFBQWEsQ0FBQyxDQUFDLENBQUMsR0FBRyxrQ0FBa0MsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLFVB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QUMsSUFBSTtZQUNwQixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUk7WUFDcEIsaUJBQWlCLENBQUMsYUFBYSxDQUFDLENBQUM7U0FDdEM7UUFFRCxJQUFNLFdBQVcsR0FBRyxFQUFFLENBQUMsNkJBQTZCO1FBQ2hELHFCQUFxQixDQUFDLElBQUksQ0FBQyxlQUFlO1FBQzFDLGtCQUFrQixDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBRXhDLElBQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQyx1QkFBdUI7UUFDdEMsZUFBZSxDQUFDLElBQUk7UUFDcEIsZUFBZSxDQUFDLElBQUksQ0FBQyxTQUFTO1FBQzlCLHFCQUFxQixDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBRXZDLE9BQU8sT0FBTyxDQUFDO0lBQ2pCLENBQUM7SUFFRDs7T0FFRztJQUNILFNBQVMsY0FBYyxDQUFDLElBQTBCO1FBQ2hELE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUN6QyxVQUFBLElBQUksSUFBSSxPQUFBLElBQUksQ0FBQyxXQUFXLEtBQUssU0FBUyxJQUFJLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQztZQUN2RSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMscUJBQXFCLENBQUMsRUFEakQsQ0FDaUQsQ0FBQyxDQUFDO0lBQ2pFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmNvbnN0IElWWV9TV0lUQ0hfUFJFX1NVRkZJWCA9ICdfX1BSRV9SM19fJztcbmNvbnN0IElWWV9TV0lUQ0hfUE9TVF9TVUZGSVggPSAnX19QT1NUX1IzX18nO1xuXG5leHBvcnQgZnVuY3Rpb24gaXZ5U3dpdGNoVHJhbnNmb3JtKF86IHRzLlRyYW5zZm9ybWF0aW9uQ29udGV4dCk6IHRzLlRyYW5zZm9ybWVyPHRzLlNvdXJjZUZpbGU+IHtcbiAgcmV0dXJuIGZsaXBJdnlTd2l0Y2hJbkZpbGU7XG59XG5cbmZ1bmN0aW9uIGZsaXBJdnlTd2l0Y2hJbkZpbGUoc2Y6IHRzLlNvdXJjZUZpbGUpOiB0cy5Tb3VyY2VGaWxlIHtcbiAgLy8gVG8gcmVwbGFjZSB0aGUgc3RhdGVtZW50cyBhcnJheSwgaXQgbXVzdCBiZSBjb3BpZWQuIFRoaXMgb25seSBuZWVkcyB0byBoYXBwZW4gaWYgYSBzdGF0ZW1lbnRcbiAgLy8gbXVzdCBhY3R1YWxseSBiZSByZXBsYWNlZCB3aXRoaW4gdGhlIGFycmF5LCBzbyB0aGUgbmV3U3RhdGVtZW50cyBhcnJheSBpcyBsYXppbHkgaW5pdGlhbGl6ZWQuXG4gIGxldCBuZXdTdGF0ZW1lbnRzOiB0cy5TdGF0ZW1lbnRbXXx1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG5cbiAgLy8gSXRlcmF0ZSBvdmVyIHRoZSBzdGF0ZW1lbnRzIGluIHRoZSBmaWxlLlxuICBmb3IgKGxldCBpID0gMDsgaSA8IHNmLnN0YXRlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBzdGF0ZW1lbnQgPSBzZi5zdGF0ZW1lbnRzW2ldO1xuXG4gICAgLy8gU2tpcCBvdmVyIGV2ZXJ5dGhpbmcgdGhhdCBpc24ndCBhIHZhcmlhYmxlIHN0YXRlbWVudC5cbiAgICBpZiAoIXRzLmlzVmFyaWFibGVTdGF0ZW1lbnQoc3RhdGVtZW50KSB8fCAhaGFzSXZ5U3dpdGNoZXMoc3RhdGVtZW50KSkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gVGhpcyBzdGF0ZW1lbnQgbmVlZHMgdG8gYmUgcmVwbGFjZWQuIENoZWNrIGlmIHRoZSBuZXdTdGF0ZW1lbnRzIGFycmF5IG5lZWRzIHRvIGJlIGxhemlseVxuICAgIC8vIGluaXRpYWxpemVkIHRvIGEgY29weSBvZiB0aGUgb3JpZ2luYWwgc3RhdGVtZW50cy5cbiAgICBpZiAobmV3U3RhdGVtZW50cyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBuZXdTdGF0ZW1lbnRzID0gWy4uLnNmLnN0YXRlbWVudHNdO1xuICAgIH1cblxuICAgIC8vIEZsaXAgYW55IHN3aXRjaGVzIGluIHRoZSBWYXJpYWJsZVN0YXRlbWVudC4gSWYgdGhlcmUgd2VyZSBhbnksIGEgbmV3IHN0YXRlbWVudCB3aWxsIGJlXG4gICAgLy8gcmV0dXJuZWQ7IG90aGVyd2lzZSB0aGUgb2xkIHN0YXRlbWVudCB3aWxsIGJlLlxuICAgIG5ld1N0YXRlbWVudHNbaV0gPSBmbGlwSXZ5U3dpdGNoZXNJblZhcmlhYmxlU3RhdGVtZW50KHN0YXRlbWVudCwgc2Yuc3RhdGVtZW50cyk7XG4gIH1cblxuICAvLyBPbmx5IHVwZGF0ZSB0aGUgc3RhdGVtZW50cyBpbiB0aGUgU291cmNlRmlsZSBpZiBhbnkgaGF2ZSBjaGFuZ2VkLlxuICBpZiAobmV3U3RhdGVtZW50cyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIHRzLnVwZGF0ZVNvdXJjZUZpbGVOb2RlKHNmLCBuZXdTdGF0ZW1lbnRzKTtcbiAgfVxuICByZXR1cm4gc2Y7XG59XG5cbi8qKlxuICogTG9vayBmb3IgdGhlIHRzLklkZW50aWZpZXIgb2YgYSB0cy5EZWNsYXJhdGlvbiB3aXRoIHRoaXMgbmFtZS5cbiAqXG4gKiBUaGUgcmVhbCBpZGVudGlmaWVyIGlzIG5lZWRlZCAocmF0aGVyIHRoYW4gZmFicmljYXRpbmcgb25lKSBhcyBUeXBlU2NyaXB0IGRlY2lkZXMgaG93IHRvXG4gKiByZWZlcmVuY2UgdGhpcyBpZGVudGlmaWVyIGJhc2VkIG9uIGluZm9ybWF0aW9uIHN0b3JlZCBhZ2FpbnN0IGl0cyBub2RlIGluIHRoZSBBU1QsIHdoaWNoIGFcbiAqIHN5bnRoZXRpYyBub2RlIHdvdWxkIG5vdCBoYXZlLiBJbiBwYXJ0aWN1bGFyLCBzaW5jZSB0aGUgcG9zdC1zd2l0Y2ggdmFyaWFibGUgaXMgb2Z0ZW4gZXhwb3J0ZWQsXG4gKiBUeXBlU2NyaXB0IG5lZWRzIHRvIGtub3cgdGhpcyBzbyBpdCBjYW4gd3JpdGUgYGV4cG9ydHMuVkFSYCBpbnN0ZWFkIG9mIGp1c3QgYFZBUmAgd2hlbiBlbWl0dGluZ1xuICogY29kZS5cbiAqXG4gKiBPbmx5IHZhcmlhYmxlLCBmdW5jdGlvbiwgYW5kIGNsYXNzIGRlY2xhcmF0aW9ucyBhcmUgY3VycmVudGx5IHNlYXJjaGVkLlxuICovXG5mdW5jdGlvbiBmaW5kUG9zdFN3aXRjaElkZW50aWZpZXIoXG4gICAgc3RhdGVtZW50czogUmVhZG9ubHlBcnJheTx0cy5TdGF0ZW1lbnQ+LCBuYW1lOiBzdHJpbmcpOiB0cy5JZGVudGlmaWVyfG51bGwge1xuICBmb3IgKGNvbnN0IHN0bXQgb2Ygc3RhdGVtZW50cykge1xuICAgIGlmICh0cy5pc1ZhcmlhYmxlU3RhdGVtZW50KHN0bXQpKSB7XG4gICAgICBjb25zdCBkZWNsID0gc3RtdC5kZWNsYXJhdGlvbkxpc3QuZGVjbGFyYXRpb25zLmZpbmQoXG4gICAgICAgICAgZGVjbCA9PiB0cy5pc0lkZW50aWZpZXIoZGVjbC5uYW1lKSAmJiBkZWNsLm5hbWUudGV4dCA9PT0gbmFtZSk7XG4gICAgICBpZiAoZGVjbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiBkZWNsLm5hbWUgYXMgdHMuSWRlbnRpZmllcjtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHRzLmlzRnVuY3Rpb25EZWNsYXJhdGlvbihzdG10KSB8fCB0cy5pc0NsYXNzRGVjbGFyYXRpb24oc3RtdCkpIHtcbiAgICAgIGlmIChzdG10Lm5hbWUgIT09IHVuZGVmaW5lZCAmJiB0cy5pc0lkZW50aWZpZXIoc3RtdC5uYW1lKSAmJiBzdG10Lm5hbWUudGV4dCA9PT0gbmFtZSkge1xuICAgICAgICByZXR1cm4gc3RtdC5uYW1lO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuLyoqXG4gKiBGbGlwIGFueSBJdnkgc3dpdGNoZXMgd2hpY2ggYXJlIGRpc2NvdmVyZWQgaW4gdGhlIGdpdmVuIHRzLlZhcmlhYmxlU3RhdGVtZW50LlxuICovXG5mdW5jdGlvbiBmbGlwSXZ5U3dpdGNoZXNJblZhcmlhYmxlU3RhdGVtZW50KFxuICAgIHN0bXQ6IHRzLlZhcmlhYmxlU3RhdGVtZW50LCBzdGF0ZW1lbnRzOiBSZWFkb25seUFycmF5PHRzLlN0YXRlbWVudD4pOiB0cy5WYXJpYWJsZVN0YXRlbWVudCB7XG4gIC8vIEJ1aWxkIGEgbmV3IGxpc3Qgb2YgdmFyaWFibGUgZGVjbGFyYXRpb25zLiBTcGVjaWZpYyBkZWNsYXJhdGlvbnMgdGhhdCBhcmUgaW5pdGlhbGl6ZWQgdG8gYVxuICAvLyBwcmUtc3dpdGNoIGlkZW50aWZpZXIgd2lsbCBiZSByZXBsYWNlZCB3aXRoIGEgZGVjbGFyYXRpb24gaW5pdGlhbGl6ZWQgdG8gdGhlIHBvc3Qtc3dpdGNoXG4gIC8vIGlkZW50aWZpZXIuXG4gIGNvbnN0IG5ld0RlY2xhcmF0aW9ucyA9IFsuLi5zdG10LmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnNdO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IG5ld0RlY2xhcmF0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGRlY2wgPSBuZXdEZWNsYXJhdGlvbnNbaV07XG5cbiAgICAvLyBTa2lwIGRlY2xhcmF0aW9ucyB0aGF0IGFyZW4ndCBpbml0aWFsaXplZCB0byBhbiBpZGVudGlmaWVyLlxuICAgIGlmIChkZWNsLmluaXRpYWxpemVyID09PSB1bmRlZmluZWQgfHwgIXRzLmlzSWRlbnRpZmllcihkZWNsLmluaXRpYWxpemVyKSkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gU2tpcCBkZWNsYXJhdGlvbnMgdGhhdCBhcmVuJ3QgSXZ5IHN3aXRjaGVzLlxuICAgIGlmICghZGVjbC5pbml0aWFsaXplci50ZXh0LmVuZHNXaXRoKElWWV9TV0lUQ0hfUFJFX1NVRkZJWCkpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIERldGVybWluZSB0aGUgbmFtZSBvZiB0aGUgcG9zdC1zd2l0Y2ggdmFyaWFibGUuXG4gICAgY29uc3QgcG9zdFN3aXRjaE5hbWUgPVxuICAgICAgICBkZWNsLmluaXRpYWxpemVyLnRleHQucmVwbGFjZShJVllfU1dJVENIX1BSRV9TVUZGSVgsIElWWV9TV0lUQ0hfUE9TVF9TVUZGSVgpO1xuXG4gICAgLy8gRmluZCB0aGUgcG9zdC1zd2l0Y2ggdmFyaWFibGUgaWRlbnRpZmllci4gSWYgb25lIGNhbid0IGJlIGZvdW5kLCBpdCdzIGFuIGVycm9yLiBUaGlzIGlzXG4gICAgLy8gcmVwb3J0ZWQgYXMgYSB0aHJvd24gZXJyb3IgYW5kIG5vdCBhIGRpYWdub3N0aWMgYXMgdHJhbnNmb3JtZXJzIGNhbm5vdCBvdXRwdXQgZGlhZ25vc3RpY3MuXG4gICAgY29uc3QgbmV3SWRlbnRpZmllciA9IGZpbmRQb3N0U3dpdGNoSWRlbnRpZmllcihzdGF0ZW1lbnRzLCBwb3N0U3dpdGNoTmFtZSk7XG4gICAgaWYgKG5ld0lkZW50aWZpZXIgPT09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5hYmxlIHRvIGZpbmQgaWRlbnRpZmllciAke3Bvc3RTd2l0Y2hOYW1lfSBpbiAke1xuICAgICAgICAgIHN0bXQuZ2V0U291cmNlRmlsZSgpLmZpbGVOYW1lfSBmb3IgdGhlIEl2eSBzd2l0Y2guYCk7XG4gICAgfVxuXG4gICAgbmV3RGVjbGFyYXRpb25zW2ldID0gdHMudXBkYXRlVmFyaWFibGVEZWNsYXJhdGlvbihcbiAgICAgICAgLyogbm9kZSAqLyBkZWNsLFxuICAgICAgICAvKiBuYW1lICovIGRlY2wubmFtZSxcbiAgICAgICAgLyogdHlwZSAqLyBkZWNsLnR5cGUsXG4gICAgICAgIC8qIGluaXRpYWxpemVyICovIG5ld0lkZW50aWZpZXIpO1xuICB9XG5cbiAgY29uc3QgbmV3RGVjbExpc3QgPSB0cy51cGRhdGVWYXJpYWJsZURlY2xhcmF0aW9uTGlzdChcbiAgICAgIC8qIGRlY2xhcmF0aW9uTGlzdCAqLyBzdG10LmRlY2xhcmF0aW9uTGlzdCxcbiAgICAgIC8qIGRlY2xhcmF0aW9ucyAqLyBuZXdEZWNsYXJhdGlvbnMpO1xuXG4gIGNvbnN0IG5ld1N0bXQgPSB0cy51cGRhdGVWYXJpYWJsZVN0YXRlbWVudChcbiAgICAgIC8qIHN0YXRlbWVudCAqLyBzdG10LFxuICAgICAgLyogbW9kaWZpZXJzICovIHN0bXQubW9kaWZpZXJzLFxuICAgICAgLyogZGVjbGFyYXRpb25MaXN0ICovIG5ld0RlY2xMaXN0KTtcblxuICByZXR1cm4gbmV3U3RtdDtcbn1cblxuLyoqXG4gKiBDaGVjayB3aGV0aGVyIHRoZSBnaXZlbiBWYXJpYWJsZVN0YXRlbWVudCBoYXMgYW55IEl2eSBzd2l0Y2ggdmFyaWFibGVzLlxuICovXG5mdW5jdGlvbiBoYXNJdnlTd2l0Y2hlcyhzdG10OiB0cy5WYXJpYWJsZVN0YXRlbWVudCkge1xuICByZXR1cm4gc3RtdC5kZWNsYXJhdGlvbkxpc3QuZGVjbGFyYXRpb25zLnNvbWUoXG4gICAgICBkZWNsID0+IGRlY2wuaW5pdGlhbGl6ZXIgIT09IHVuZGVmaW5lZCAmJiB0cy5pc0lkZW50aWZpZXIoZGVjbC5pbml0aWFsaXplcikgJiZcbiAgICAgICAgICBkZWNsLmluaXRpYWxpemVyLnRleHQuZW5kc1dpdGgoSVZZX1NXSVRDSF9QUkVfU1VGRklYKSk7XG59XG4iXX0=