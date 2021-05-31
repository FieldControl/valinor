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
        define("@angular/compiler-cli/src/ngtsc/imports/src/find_export", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/src/ngtsc/util/src/typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.findExportedNameOfNode = void 0;
    var tslib_1 = require("tslib");
    var ts = require("typescript");
    var typescript_1 = require("@angular/compiler-cli/src/ngtsc/util/src/typescript");
    /**
     * Find the name, if any, by which a node is exported from a given file.
     */
    function findExportedNameOfNode(target, file, reflector) {
        var e_1, _a;
        var exports = reflector.getExportsOfModule(file);
        if (exports === null) {
            return null;
        }
        var declaredName = typescript_1.isNamedDeclaration(target) ? target.name.text : null;
        // Look for the export which declares the node.
        var foundExportName = null;
        try {
            for (var exports_1 = tslib_1.__values(exports), exports_1_1 = exports_1.next(); !exports_1_1.done; exports_1_1 = exports_1.next()) {
                var _b = tslib_1.__read(exports_1_1.value, 2), exportName = _b[0], declaration = _b[1];
                if (declaration.node !== target) {
                    continue;
                }
                if (exportName === declaredName) {
                    // A non-alias export exists which is always preferred, so use that one.
                    return exportName;
                }
                foundExportName = exportName;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (exports_1_1 && !exports_1_1.done && (_a = exports_1.return)) _a.call(exports_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (foundExportName === null) {
            throw new Error("Failed to find exported name of node (" + target.getText() + ") in '" + file.fileName + "'.");
        }
        return foundExportName;
    }
    exports.findExportedNameOfNode = findExportedNameOfNode;
    /**
     * Check whether a given `ts.Symbol` represents a declaration of a given node.
     *
     * This is not quite as trivial as just checking the declarations, as some nodes are
     * `ts.ExportSpecifier`s and need to be unwrapped.
     */
    function symbolDeclaresNode(sym, node, checker) {
        return sym.declarations.some(function (decl) {
            if (ts.isExportSpecifier(decl)) {
                var exportedSymbol = checker.getExportSpecifierLocalTargetSymbol(decl);
                if (exportedSymbol !== undefined) {
                    return symbolDeclaresNode(exportedSymbol, node, checker);
                }
            }
            return decl === node;
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmluZF9leHBvcnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL2ltcG9ydHMvc3JjL2ZpbmRfZXhwb3J0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCwrQkFBaUM7SUFFakMsa0ZBQTZEO0lBRTdEOztPQUVHO0lBQ0gsU0FBZ0Isc0JBQXNCLENBQ2xDLE1BQWUsRUFBRSxJQUFtQixFQUFFLFNBQXlCOztRQUNqRSxJQUFNLE9BQU8sR0FBRyxTQUFTLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbkQsSUFBSSxPQUFPLEtBQUssSUFBSSxFQUFFO1lBQ3BCLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFFRCxJQUFNLFlBQVksR0FBRywrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUUxRSwrQ0FBK0M7UUFDL0MsSUFBSSxlQUFlLEdBQWdCLElBQUksQ0FBQzs7WUFDeEMsS0FBd0MsSUFBQSxZQUFBLGlCQUFBLE9BQU8sQ0FBQSxnQ0FBQSxxREFBRTtnQkFBdEMsSUFBQSxLQUFBLG9DQUF5QixFQUF4QixVQUFVLFFBQUEsRUFBRSxXQUFXLFFBQUE7Z0JBQ2pDLElBQUksV0FBVyxDQUFDLElBQUksS0FBSyxNQUFNLEVBQUU7b0JBQy9CLFNBQVM7aUJBQ1Y7Z0JBRUQsSUFBSSxVQUFVLEtBQUssWUFBWSxFQUFFO29CQUMvQix3RUFBd0U7b0JBQ3hFLE9BQU8sVUFBVSxDQUFDO2lCQUNuQjtnQkFFRCxlQUFlLEdBQUcsVUFBVSxDQUFDO2FBQzlCOzs7Ozs7Ozs7UUFFRCxJQUFJLGVBQWUsS0FBSyxJQUFJLEVBQUU7WUFDNUIsTUFBTSxJQUFJLEtBQUssQ0FDWCwyQ0FBeUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxjQUFTLElBQUksQ0FBQyxRQUFRLE9BQUksQ0FBQyxDQUFDO1NBQzFGO1FBQ0QsT0FBTyxlQUFlLENBQUM7SUFDekIsQ0FBQztJQTdCRCx3REE2QkM7SUFFRDs7Ozs7T0FLRztJQUNILFNBQVMsa0JBQWtCLENBQUMsR0FBYyxFQUFFLElBQWEsRUFBRSxPQUF1QjtRQUNoRixPQUFPLEdBQUcsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFVBQUEsSUFBSTtZQUMvQixJQUFJLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDOUIsSUFBTSxjQUFjLEdBQUcsT0FBTyxDQUFDLG1DQUFtQyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUN6RSxJQUFJLGNBQWMsS0FBSyxTQUFTLEVBQUU7b0JBQ2hDLE9BQU8sa0JBQWtCLENBQUMsY0FBYyxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztpQkFDMUQ7YUFDRjtZQUNELE9BQU8sSUFBSSxLQUFLLElBQUksQ0FBQztRQUN2QixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5pbXBvcnQge1JlZmxlY3Rpb25Ib3N0fSBmcm9tICcuLi8uLi9yZWZsZWN0aW9uJztcbmltcG9ydCB7aXNOYW1lZERlY2xhcmF0aW9ufSBmcm9tICcuLi8uLi91dGlsL3NyYy90eXBlc2NyaXB0JztcblxuLyoqXG4gKiBGaW5kIHRoZSBuYW1lLCBpZiBhbnksIGJ5IHdoaWNoIGEgbm9kZSBpcyBleHBvcnRlZCBmcm9tIGEgZ2l2ZW4gZmlsZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZpbmRFeHBvcnRlZE5hbWVPZk5vZGUoXG4gICAgdGFyZ2V0OiB0cy5Ob2RlLCBmaWxlOiB0cy5Tb3VyY2VGaWxlLCByZWZsZWN0b3I6IFJlZmxlY3Rpb25Ib3N0KTogc3RyaW5nfG51bGwge1xuICBjb25zdCBleHBvcnRzID0gcmVmbGVjdG9yLmdldEV4cG9ydHNPZk1vZHVsZShmaWxlKTtcbiAgaWYgKGV4cG9ydHMgPT09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNvbnN0IGRlY2xhcmVkTmFtZSA9IGlzTmFtZWREZWNsYXJhdGlvbih0YXJnZXQpID8gdGFyZ2V0Lm5hbWUudGV4dCA6IG51bGw7XG5cbiAgLy8gTG9vayBmb3IgdGhlIGV4cG9ydCB3aGljaCBkZWNsYXJlcyB0aGUgbm9kZS5cbiAgbGV0IGZvdW5kRXhwb3J0TmFtZTogc3RyaW5nfG51bGwgPSBudWxsO1xuICBmb3IgKGNvbnN0IFtleHBvcnROYW1lLCBkZWNsYXJhdGlvbl0gb2YgZXhwb3J0cykge1xuICAgIGlmIChkZWNsYXJhdGlvbi5ub2RlICE9PSB0YXJnZXQpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGlmIChleHBvcnROYW1lID09PSBkZWNsYXJlZE5hbWUpIHtcbiAgICAgIC8vIEEgbm9uLWFsaWFzIGV4cG9ydCBleGlzdHMgd2hpY2ggaXMgYWx3YXlzIHByZWZlcnJlZCwgc28gdXNlIHRoYXQgb25lLlxuICAgICAgcmV0dXJuIGV4cG9ydE5hbWU7XG4gICAgfVxuXG4gICAgZm91bmRFeHBvcnROYW1lID0gZXhwb3J0TmFtZTtcbiAgfVxuXG4gIGlmIChmb3VuZEV4cG9ydE5hbWUgPT09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBGYWlsZWQgdG8gZmluZCBleHBvcnRlZCBuYW1lIG9mIG5vZGUgKCR7dGFyZ2V0LmdldFRleHQoKX0pIGluICcke2ZpbGUuZmlsZU5hbWV9Jy5gKTtcbiAgfVxuICByZXR1cm4gZm91bmRFeHBvcnROYW1lO1xufVxuXG4vKipcbiAqIENoZWNrIHdoZXRoZXIgYSBnaXZlbiBgdHMuU3ltYm9sYCByZXByZXNlbnRzIGEgZGVjbGFyYXRpb24gb2YgYSBnaXZlbiBub2RlLlxuICpcbiAqIFRoaXMgaXMgbm90IHF1aXRlIGFzIHRyaXZpYWwgYXMganVzdCBjaGVja2luZyB0aGUgZGVjbGFyYXRpb25zLCBhcyBzb21lIG5vZGVzIGFyZVxuICogYHRzLkV4cG9ydFNwZWNpZmllcmBzIGFuZCBuZWVkIHRvIGJlIHVud3JhcHBlZC5cbiAqL1xuZnVuY3Rpb24gc3ltYm9sRGVjbGFyZXNOb2RlKHN5bTogdHMuU3ltYm9sLCBub2RlOiB0cy5Ob2RlLCBjaGVja2VyOiB0cy5UeXBlQ2hlY2tlcik6IGJvb2xlYW4ge1xuICByZXR1cm4gc3ltLmRlY2xhcmF0aW9ucy5zb21lKGRlY2wgPT4ge1xuICAgIGlmICh0cy5pc0V4cG9ydFNwZWNpZmllcihkZWNsKSkge1xuICAgICAgY29uc3QgZXhwb3J0ZWRTeW1ib2wgPSBjaGVja2VyLmdldEV4cG9ydFNwZWNpZmllckxvY2FsVGFyZ2V0U3ltYm9sKGRlY2wpO1xuICAgICAgaWYgKGV4cG9ydGVkU3ltYm9sICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIHN5bWJvbERlY2xhcmVzTm9kZShleHBvcnRlZFN5bWJvbCwgbm9kZSwgY2hlY2tlcik7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkZWNsID09PSBub2RlO1xuICB9KTtcbn1cbiJdfQ==