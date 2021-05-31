(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/ngtsc/translator/src/import_manager", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/src/ngtsc/imports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ImportManager = void 0;
    var tslib_1 = require("tslib");
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var ts = require("typescript");
    var imports_1 = require("@angular/compiler-cli/src/ngtsc/imports");
    var ImportManager = /** @class */ (function () {
        function ImportManager(rewriter, prefix) {
            if (rewriter === void 0) { rewriter = new imports_1.NoopImportRewriter(); }
            if (prefix === void 0) { prefix = 'i'; }
            this.rewriter = rewriter;
            this.prefix = prefix;
            this.specifierToIdentifier = new Map();
            this.nextIndex = 0;
        }
        ImportManager.prototype.generateNamespaceImport = function (moduleName) {
            if (!this.specifierToIdentifier.has(moduleName)) {
                this.specifierToIdentifier.set(moduleName, ts.createIdentifier("" + this.prefix + this.nextIndex++));
            }
            return this.specifierToIdentifier.get(moduleName);
        };
        ImportManager.prototype.generateNamedImport = function (moduleName, originalSymbol) {
            // First, rewrite the symbol name.
            var symbol = this.rewriter.rewriteSymbol(originalSymbol, moduleName);
            // Ask the rewriter if this symbol should be imported at all. If not, it can be referenced
            // directly (moduleImport: null).
            if (!this.rewriter.shouldImportSymbol(symbol, moduleName)) {
                // The symbol should be referenced directly.
                return { moduleImport: null, symbol: symbol };
            }
            // If not, this symbol will be imported using a generated namespace import.
            var moduleImport = this.generateNamespaceImport(moduleName);
            return { moduleImport: moduleImport, symbol: symbol };
        };
        ImportManager.prototype.getAllImports = function (contextPath) {
            var e_1, _a;
            var imports = [];
            try {
                for (var _b = tslib_1.__values(this.specifierToIdentifier), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var _d = tslib_1.__read(_c.value, 2), originalSpecifier = _d[0], qualifier = _d[1];
                    var specifier = this.rewriter.rewriteSpecifier(originalSpecifier, contextPath);
                    imports.push({
                        specifier: specifier,
                        qualifier: qualifier,
                    });
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return imports;
        };
        return ImportManager;
    }());
    exports.ImportManager = ImportManager;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1wb3J0X21hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL3RyYW5zbGF0b3Ivc3JjL2ltcG9ydF9tYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCwrQkFBaUM7SUFDakMsbUVBQWlFO0lBYWpFO1FBSUUsdUJBQXNCLFFBQW1ELEVBQVUsTUFBWTtZQUF6RSx5QkFBQSxFQUFBLGVBQStCLDRCQUFrQixFQUFFO1lBQVUsdUJBQUEsRUFBQSxZQUFZO1lBQXpFLGFBQVEsR0FBUixRQUFRLENBQTJDO1lBQVUsV0FBTSxHQUFOLE1BQU0sQ0FBTTtZQUh2RiwwQkFBcUIsR0FBRyxJQUFJLEdBQUcsRUFBeUIsQ0FBQztZQUN6RCxjQUFTLEdBQUcsQ0FBQyxDQUFDO1FBR3RCLENBQUM7UUFFRCwrQ0FBdUIsR0FBdkIsVUFBd0IsVUFBa0I7WUFDeEMsSUFBSSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEVBQUU7Z0JBQy9DLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLENBQzFCLFVBQVUsRUFBRSxFQUFFLENBQUMsZ0JBQWdCLENBQUMsS0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUksQ0FBQyxDQUFDLENBQUM7YUFDM0U7WUFDRCxPQUFPLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFFLENBQUM7UUFDckQsQ0FBQztRQUVELDJDQUFtQixHQUFuQixVQUFvQixVQUFrQixFQUFFLGNBQXNCO1lBQzVELGtDQUFrQztZQUNsQyxJQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxjQUFjLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFFdkUsMEZBQTBGO1lBQzFGLGlDQUFpQztZQUNqQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLEVBQUU7Z0JBQ3pELDRDQUE0QztnQkFDNUMsT0FBTyxFQUFDLFlBQVksRUFBRSxJQUFJLEVBQUUsTUFBTSxRQUFBLEVBQUMsQ0FBQzthQUNyQztZQUVELDJFQUEyRTtZQUMzRSxJQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUMsVUFBVSxDQUFDLENBQUM7WUFFOUQsT0FBTyxFQUFDLFlBQVksY0FBQSxFQUFFLE1BQU0sUUFBQSxFQUFDLENBQUM7UUFDaEMsQ0FBQztRQUVELHFDQUFhLEdBQWIsVUFBYyxXQUFtQjs7WUFDL0IsSUFBTSxPQUFPLEdBQWEsRUFBRSxDQUFDOztnQkFDN0IsS0FBNkMsSUFBQSxLQUFBLGlCQUFBLElBQUksQ0FBQyxxQkFBcUIsQ0FBQSxnQkFBQSw0QkFBRTtvQkFBOUQsSUFBQSxLQUFBLDJCQUE4QixFQUE3QixpQkFBaUIsUUFBQSxFQUFFLFNBQVMsUUFBQTtvQkFDdEMsSUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxpQkFBaUIsRUFBRSxXQUFXLENBQUMsQ0FBQztvQkFDakYsT0FBTyxDQUFDLElBQUksQ0FBQzt3QkFDWCxTQUFTLFdBQUE7d0JBQ1QsU0FBUyxXQUFBO3FCQUNWLENBQUMsQ0FBQztpQkFDSjs7Ozs7Ozs7O1lBQ0QsT0FBTyxPQUFPLENBQUM7UUFDakIsQ0FBQztRQUNILG9CQUFDO0lBQUQsQ0FBQyxBQTNDRCxJQTJDQztJQTNDWSxzQ0FBYSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5pbXBvcnQge0ltcG9ydFJld3JpdGVyLCBOb29wSW1wb3J0UmV3cml0ZXJ9IGZyb20gJy4uLy4uL2ltcG9ydHMnO1xuaW1wb3J0IHtJbXBvcnRHZW5lcmF0b3IsIE5hbWVkSW1wb3J0fSBmcm9tICcuL2FwaS9pbXBvcnRfZ2VuZXJhdG9yJztcblxuLyoqXG4gKiBJbmZvcm1hdGlvbiBhYm91dCBhbiBpbXBvcnQgdGhhdCBoYXMgYmVlbiBhZGRlZCB0byBhIG1vZHVsZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBJbXBvcnQge1xuICAvKiogVGhlIG5hbWUgb2YgdGhlIG1vZHVsZSB0aGF0IGhhcyBiZWVuIGltcG9ydGVkLiAqL1xuICBzcGVjaWZpZXI6IHN0cmluZztcbiAgLyoqIFRoZSBgdHMuSWRlbnRpZmVyYCBieSB3aGljaCB0aGUgaW1wb3J0ZWQgbW9kdWxlIGlzIGtub3duLiAqL1xuICBxdWFsaWZpZXI6IHRzLklkZW50aWZpZXI7XG59XG5cbmV4cG9ydCBjbGFzcyBJbXBvcnRNYW5hZ2VyIGltcGxlbWVudHMgSW1wb3J0R2VuZXJhdG9yPHRzLklkZW50aWZpZXI+IHtcbiAgcHJpdmF0ZSBzcGVjaWZpZXJUb0lkZW50aWZpZXIgPSBuZXcgTWFwPHN0cmluZywgdHMuSWRlbnRpZmllcj4oKTtcbiAgcHJpdmF0ZSBuZXh0SW5kZXggPSAwO1xuXG4gIGNvbnN0cnVjdG9yKHByb3RlY3RlZCByZXdyaXRlcjogSW1wb3J0UmV3cml0ZXIgPSBuZXcgTm9vcEltcG9ydFJld3JpdGVyKCksIHByaXZhdGUgcHJlZml4ID0gJ2knKSB7XG4gIH1cblxuICBnZW5lcmF0ZU5hbWVzcGFjZUltcG9ydChtb2R1bGVOYW1lOiBzdHJpbmcpOiB0cy5JZGVudGlmaWVyIHtcbiAgICBpZiAoIXRoaXMuc3BlY2lmaWVyVG9JZGVudGlmaWVyLmhhcyhtb2R1bGVOYW1lKSkge1xuICAgICAgdGhpcy5zcGVjaWZpZXJUb0lkZW50aWZpZXIuc2V0KFxuICAgICAgICAgIG1vZHVsZU5hbWUsIHRzLmNyZWF0ZUlkZW50aWZpZXIoYCR7dGhpcy5wcmVmaXh9JHt0aGlzLm5leHRJbmRleCsrfWApKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuc3BlY2lmaWVyVG9JZGVudGlmaWVyLmdldChtb2R1bGVOYW1lKSE7XG4gIH1cblxuICBnZW5lcmF0ZU5hbWVkSW1wb3J0KG1vZHVsZU5hbWU6IHN0cmluZywgb3JpZ2luYWxTeW1ib2w6IHN0cmluZyk6IE5hbWVkSW1wb3J0PHRzLklkZW50aWZpZXI+IHtcbiAgICAvLyBGaXJzdCwgcmV3cml0ZSB0aGUgc3ltYm9sIG5hbWUuXG4gICAgY29uc3Qgc3ltYm9sID0gdGhpcy5yZXdyaXRlci5yZXdyaXRlU3ltYm9sKG9yaWdpbmFsU3ltYm9sLCBtb2R1bGVOYW1lKTtcblxuICAgIC8vIEFzayB0aGUgcmV3cml0ZXIgaWYgdGhpcyBzeW1ib2wgc2hvdWxkIGJlIGltcG9ydGVkIGF0IGFsbC4gSWYgbm90LCBpdCBjYW4gYmUgcmVmZXJlbmNlZFxuICAgIC8vIGRpcmVjdGx5IChtb2R1bGVJbXBvcnQ6IG51bGwpLlxuICAgIGlmICghdGhpcy5yZXdyaXRlci5zaG91bGRJbXBvcnRTeW1ib2woc3ltYm9sLCBtb2R1bGVOYW1lKSkge1xuICAgICAgLy8gVGhlIHN5bWJvbCBzaG91bGQgYmUgcmVmZXJlbmNlZCBkaXJlY3RseS5cbiAgICAgIHJldHVybiB7bW9kdWxlSW1wb3J0OiBudWxsLCBzeW1ib2x9O1xuICAgIH1cblxuICAgIC8vIElmIG5vdCwgdGhpcyBzeW1ib2wgd2lsbCBiZSBpbXBvcnRlZCB1c2luZyBhIGdlbmVyYXRlZCBuYW1lc3BhY2UgaW1wb3J0LlxuICAgIGNvbnN0IG1vZHVsZUltcG9ydCA9IHRoaXMuZ2VuZXJhdGVOYW1lc3BhY2VJbXBvcnQobW9kdWxlTmFtZSk7XG5cbiAgICByZXR1cm4ge21vZHVsZUltcG9ydCwgc3ltYm9sfTtcbiAgfVxuXG4gIGdldEFsbEltcG9ydHMoY29udGV4dFBhdGg6IHN0cmluZyk6IEltcG9ydFtdIHtcbiAgICBjb25zdCBpbXBvcnRzOiBJbXBvcnRbXSA9IFtdO1xuICAgIGZvciAoY29uc3QgW29yaWdpbmFsU3BlY2lmaWVyLCBxdWFsaWZpZXJdIG9mIHRoaXMuc3BlY2lmaWVyVG9JZGVudGlmaWVyKSB7XG4gICAgICBjb25zdCBzcGVjaWZpZXIgPSB0aGlzLnJld3JpdGVyLnJld3JpdGVTcGVjaWZpZXIob3JpZ2luYWxTcGVjaWZpZXIsIGNvbnRleHRQYXRoKTtcbiAgICAgIGltcG9ydHMucHVzaCh7XG4gICAgICAgIHNwZWNpZmllcixcbiAgICAgICAgcXVhbGlmaWVyLFxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBpbXBvcnRzO1xuICB9XG59XG4iXX0=