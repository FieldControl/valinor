(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/rendering/commonjs_rendering_formatter", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/ngcc/src/host/commonjs_umd_utils", "@angular/compiler-cli/ngcc/src/rendering/esm5_rendering_formatter", "@angular/compiler-cli/ngcc/src/rendering/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CommonJsRenderingFormatter = void 0;
    var tslib_1 = require("tslib");
    var ts = require("typescript");
    var commonjs_umd_utils_1 = require("@angular/compiler-cli/ngcc/src/host/commonjs_umd_utils");
    var esm5_rendering_formatter_1 = require("@angular/compiler-cli/ngcc/src/rendering/esm5_rendering_formatter");
    var utils_1 = require("@angular/compiler-cli/ngcc/src/rendering/utils");
    /**
     * A RenderingFormatter that works with CommonJS files, instead of `import` and `export` statements
     * the module is an IIFE with a factory function call with dependencies, which are defined in a
     * wrapper function for AMD, CommonJS and global module formats.
     */
    var CommonJsRenderingFormatter = /** @class */ (function (_super) {
        tslib_1.__extends(CommonJsRenderingFormatter, _super);
        function CommonJsRenderingFormatter(fs, commonJsHost, isCore) {
            var _this = _super.call(this, fs, commonJsHost, isCore) || this;
            _this.commonJsHost = commonJsHost;
            return _this;
        }
        /**
         *  Add the imports below any in situ imports as `require` calls.
         */
        CommonJsRenderingFormatter.prototype.addImports = function (output, imports, file) {
            // Avoid unnecessary work if there are no imports to add.
            if (imports.length === 0) {
                return;
            }
            var insertionPoint = this.findEndOfImports(file);
            var renderedImports = imports.map(function (i) { return "var " + i.qualifier.text + " = require('" + i.specifier + "');\n"; }).join('');
            output.appendLeft(insertionPoint, renderedImports);
        };
        /**
         * Add the exports to the bottom of the file.
         */
        CommonJsRenderingFormatter.prototype.addExports = function (output, entryPointBasePath, exports, importManager, file) {
            var _this = this;
            exports.forEach(function (e) {
                var basePath = utils_1.stripExtension(e.from);
                var relativePath = './' + _this.fs.relative(_this.fs.dirname(entryPointBasePath), basePath);
                var namedImport = entryPointBasePath !== basePath ?
                    importManager.generateNamedImport(relativePath, e.identifier) :
                    { symbol: e.identifier, moduleImport: null };
                var importNamespace = namedImport.moduleImport ? namedImport.moduleImport.text + "." : '';
                var exportStr = "\nexports." + e.identifier + " = " + importNamespace + namedImport.symbol + ";";
                output.append(exportStr);
            });
        };
        CommonJsRenderingFormatter.prototype.addDirectExports = function (output, exports, importManager, file) {
            var e_1, _a;
            try {
                for (var exports_1 = tslib_1.__values(exports), exports_1_1 = exports_1.next(); !exports_1_1.done; exports_1_1 = exports_1.next()) {
                    var e = exports_1_1.value;
                    var namedImport = importManager.generateNamedImport(e.fromModule, e.symbolName);
                    var importNamespace = namedImport.moduleImport ? namedImport.moduleImport.text + "." : '';
                    var exportStr = "\nexports." + e.asAlias + " = " + importNamespace + namedImport.symbol + ";";
                    output.append(exportStr);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (exports_1_1 && !exports_1_1.done && (_a = exports_1.return)) _a.call(exports_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        };
        CommonJsRenderingFormatter.prototype.findEndOfImports = function (sf) {
            var e_2, _a;
            try {
                for (var _b = tslib_1.__values(sf.statements), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var statement = _c.value;
                    if (ts.isExpressionStatement(statement) && commonjs_umd_utils_1.isRequireCall(statement.expression)) {
                        continue;
                    }
                    var declarations = ts.isVariableStatement(statement) ?
                        Array.from(statement.declarationList.declarations) :
                        [];
                    if (declarations.some(function (d) { return !d.initializer || !commonjs_umd_utils_1.isRequireCall(d.initializer); })) {
                        return statement.getStart();
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return 0;
        };
        return CommonJsRenderingFormatter;
    }(esm5_rendering_formatter_1.Esm5RenderingFormatter));
    exports.CommonJsRenderingFormatter = CommonJsRenderingFormatter;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbW9uanNfcmVuZGVyaW5nX2Zvcm1hdHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9uZ2NjL3NyYy9yZW5kZXJpbmcvY29tbW9uanNfcmVuZGVyaW5nX2Zvcm1hdHRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0lBU0EsK0JBQWlDO0lBS2pDLDZGQUF5RDtJQUd6RCw4R0FBa0U7SUFDbEUsd0VBQXVDO0lBRXZDOzs7O09BSUc7SUFDSDtRQUFnRCxzREFBc0I7UUFDcEUsb0NBQVksRUFBb0IsRUFBWSxZQUFnQyxFQUFFLE1BQWU7WUFBN0YsWUFDRSxrQkFBTSxFQUFFLEVBQUUsWUFBWSxFQUFFLE1BQU0sQ0FBQyxTQUNoQztZQUYyQyxrQkFBWSxHQUFaLFlBQVksQ0FBb0I7O1FBRTVFLENBQUM7UUFFRDs7V0FFRztRQUNILCtDQUFVLEdBQVYsVUFBVyxNQUFtQixFQUFFLE9BQWlCLEVBQUUsSUFBbUI7WUFDcEUseURBQXlEO1lBQ3pELElBQUksT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQ3hCLE9BQU87YUFDUjtZQUVELElBQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNuRCxJQUFNLGVBQWUsR0FDakIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLFNBQU8sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLG9CQUFlLENBQUMsQ0FBQyxTQUFTLFVBQU8sRUFBeEQsQ0FBd0QsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN4RixNQUFNLENBQUMsVUFBVSxDQUFDLGNBQWMsRUFBRSxlQUFlLENBQUMsQ0FBQztRQUNyRCxDQUFDO1FBRUQ7O1dBRUc7UUFDSCwrQ0FBVSxHQUFWLFVBQ0ksTUFBbUIsRUFBRSxrQkFBMEIsRUFB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REQsQ0FBZ0QsaURBQXNCLEdBK0RyRTtJQS9EWSxnRUFBMEIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7UGF0aE1hbmlwdWxhdGlvbn0gZnJvbSAnQGFuZ3VsYXIvY29tcGlsZXItY2xpL3NyYy9uZ3RzYy9maWxlX3N5c3RlbSc7XG5pbXBvcnQgTWFnaWNTdHJpbmcgZnJvbSAnbWFnaWMtc3RyaW5nJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQge1JlZXhwb3J0fSBmcm9tICcuLi8uLi8uLi9zcmMvbmd0c2MvaW1wb3J0cyc7XG5pbXBvcnQge0ltcG9ydCwgSW1wb3J0TWFuYWdlcn0gZnJvbSAnLi4vLi4vLi4vc3JjL25ndHNjL3RyYW5zbGF0b3InO1xuaW1wb3J0IHtFeHBvcnRJbmZvfSBmcm9tICcuLi9hbmFseXNpcy9wcml2YXRlX2RlY2xhcmF0aW9uc19hbmFseXplcic7XG5pbXBvcnQge2lzUmVxdWlyZUNhbGx9IGZyb20gJy4uL2hvc3QvY29tbW9uanNfdW1kX3V0aWxzJztcbmltcG9ydCB7TmdjY1JlZmxlY3Rpb25Ib3N0fSBmcm9tICcuLi9ob3N0L25nY2NfaG9zdCc7XG5cbmltcG9ydCB7RXNtNVJlbmRlcmluZ0Zvcm1hdHRlcn0gZnJvbSAnLi9lc201X3JlbmRlcmluZ19mb3JtYXR0ZXInO1xuaW1wb3J0IHtzdHJpcEV4dGVuc2lvbn0gZnJvbSAnLi91dGlscyc7XG5cbi8qKlxuICogQSBSZW5kZXJpbmdGb3JtYXR0ZXIgdGhhdCB3b3JrcyB3aXRoIENvbW1vbkpTIGZpbGVzLCBpbnN0ZWFkIG9mIGBpbXBvcnRgIGFuZCBgZXhwb3J0YCBzdGF0ZW1lbnRzXG4gKiB0aGUgbW9kdWxlIGlzIGFuIElJRkUgd2l0aCBhIGZhY3RvcnkgZnVuY3Rpb24gY2FsbCB3aXRoIGRlcGVuZGVuY2llcywgd2hpY2ggYXJlIGRlZmluZWQgaW4gYVxuICogd3JhcHBlciBmdW5jdGlvbiBmb3IgQU1ELCBDb21tb25KUyBhbmQgZ2xvYmFsIG1vZHVsZSBmb3JtYXRzLlxuICovXG5leHBvcnQgY2xhc3MgQ29tbW9uSnNSZW5kZXJpbmdGb3JtYXR0ZXIgZXh0ZW5kcyBFc201UmVuZGVyaW5nRm9ybWF0dGVyIHtcbiAgY29uc3RydWN0b3IoZnM6IFBhdGhNYW5pcHVsYXRpb24sIHByb3RlY3RlZCBjb21tb25Kc0hvc3Q6IE5nY2NSZWZsZWN0aW9uSG9zdCwgaXNDb3JlOiBib29sZWFuKSB7XG4gICAgc3VwZXIoZnMsIGNvbW1vbkpzSG9zdCwgaXNDb3JlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiAgQWRkIHRoZSBpbXBvcnRzIGJlbG93IGFueSBpbiBzaXR1IGltcG9ydHMgYXMgYHJlcXVpcmVgIGNhbGxzLlxuICAgKi9cbiAgYWRkSW1wb3J0cyhvdXRwdXQ6IE1hZ2ljU3RyaW5nLCBpbXBvcnRzOiBJbXBvcnRbXSwgZmlsZTogdHMuU291cmNlRmlsZSk6IHZvaWQge1xuICAgIC8vIEF2b2lkIHVubmVjZXNzYXJ5IHdvcmsgaWYgdGhlcmUgYXJlIG5vIGltcG9ydHMgdG8gYWRkLlxuICAgIGlmIChpbXBvcnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGluc2VydGlvblBvaW50ID0gdGhpcy5maW5kRW5kT2ZJbXBvcnRzKGZpbGUpO1xuICAgIGNvbnN0IHJlbmRlcmVkSW1wb3J0cyA9XG4gICAgICAgIGltcG9ydHMubWFwKGkgPT4gYHZhciAke2kucXVhbGlmaWVyLnRleHR9ID0gcmVxdWlyZSgnJHtpLnNwZWNpZmllcn0nKTtcXG5gKS5qb2luKCcnKTtcbiAgICBvdXRwdXQuYXBwZW5kTGVmdChpbnNlcnRpb25Qb2ludCwgcmVuZGVyZWRJbXBvcnRzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgdGhlIGV4cG9ydHMgdG8gdGhlIGJvdHRvbSBvZiB0aGUgZmlsZS5cbiAgICovXG4gIGFkZEV4cG9ydHMoXG4gICAgICBvdXRwdXQ6IE1hZ2ljU3RyaW5nLCBlbnRyeVBvaW50QmFzZVBhdGg6IHN0cmluZywgZXhwb3J0czogRXhwb3J0SW5mb1tdLFxuICAgICAgaW1wb3J0TWFuYWdlcjogSW1wb3J0TWFuYWdlciwgZmlsZTogdHMuU291cmNlRmlsZSk6IHZvaWQge1xuICAgIGV4cG9ydHMuZm9yRWFjaChlID0+IHtcbiAgICAgIGNvbnN0IGJhc2VQYXRoID0gc3RyaXBFeHRlbnNpb24oZS5mcm9tKTtcbiAgICAgIGNvbnN0IHJlbGF0aXZlUGF0aCA9ICcuLycgKyB0aGlzLmZzLnJlbGF0aXZlKHRoaXMuZnMuZGlybmFtZShlbnRyeVBvaW50QmFzZVBhdGgpLCBiYXNlUGF0aCk7XG4gICAgICBjb25zdCBuYW1lZEltcG9ydCA9IGVudHJ5UG9pbnRCYXNlUGF0aCAhPT0gYmFzZVBhdGggP1xuICAgICAgICAgIGltcG9ydE1hbmFnZXIuZ2VuZXJhdGVOYW1lZEltcG9ydChyZWxhdGl2ZVBhdGgsIGUuaWRlbnRpZmllcikgOlxuICAgICAgICAgIHtzeW1ib2w6IGUuaWRlbnRpZmllciwgbW9kdWxlSW1wb3J0OiBudWxsfTtcbiAgICAgIGNvbnN0IGltcG9ydE5hbWVzcGFjZSA9IG5hbWVkSW1wb3J0Lm1vZHVsZUltcG9ydCA/IGAke25hbWVkSW1wb3J0Lm1vZHVsZUltcG9ydC50ZXh0fS5gIDogJyc7XG4gICAgICBjb25zdCBleHBvcnRTdHIgPSBgXFxuZXhwb3J0cy4ke2UuaWRlbnRpZmllcn0gPSAke2ltcG9ydE5hbWVzcGFjZX0ke25hbWVkSW1wb3J0LnN5bWJvbH07YDtcbiAgICAgIG91dHB1dC5hcHBlbmQoZXhwb3J0U3RyKTtcbiAgICB9KTtcbiAgfVxuXG4gIGFkZERpcmVjdEV4cG9ydHMoXG4gICAgICBvdXRwdXQ6IE1hZ2ljU3RyaW5nLCBleHBvcnRzOiBSZWV4cG9ydFtdLCBpbXBvcnRNYW5hZ2VyOiBJbXBvcnRNYW5hZ2VyLFxuICAgICAgZmlsZTogdHMuU291cmNlRmlsZSk6IHZvaWQge1xuICAgIGZvciAoY29uc3QgZSBvZiBleHBvcnRzKSB7XG4gICAgICBjb25zdCBuYW1lZEltcG9ydCA9IGltcG9ydE1hbmFnZXIuZ2VuZXJhdGVOYW1lZEltcG9ydChlLmZyb21Nb2R1bGUsIGUuc3ltYm9sTmFtZSk7XG4gICAgICBjb25zdCBpbXBvcnROYW1lc3BhY2UgPSBuYW1lZEltcG9ydC5tb2R1bGVJbXBvcnQgPyBgJHtuYW1lZEltcG9ydC5tb2R1bGVJbXBvcnQudGV4dH0uYCA6ICcnO1xuICAgICAgY29uc3QgZXhwb3J0U3RyID0gYFxcbmV4cG9ydHMuJHtlLmFzQWxpYXN9ID0gJHtpbXBvcnROYW1lc3BhY2V9JHtuYW1lZEltcG9ydC5zeW1ib2x9O2A7XG4gICAgICBvdXRwdXQuYXBwZW5kKGV4cG9ydFN0cik7XG4gICAgfVxuICB9XG5cbiAgcHJvdGVjdGVkIGZpbmRFbmRPZkltcG9ydHMoc2Y6IHRzLlNvdXJjZUZpbGUpOiBudW1iZXIge1xuICAgIGZvciAoY29uc3Qgc3RhdGVtZW50IG9mIHNmLnN0YXRlbWVudHMpIHtcbiAgICAgIGlmICh0cy5pc0V4cHJlc3Npb25TdGF0ZW1lbnQoc3RhdGVtZW50KSAmJiBpc1JlcXVpcmVDYWxsKHN0YXRlbWVudC5leHByZXNzaW9uKSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGRlY2xhcmF0aW9ucyA9IHRzLmlzVmFyaWFibGVTdGF0ZW1lbnQoc3RhdGVtZW50KSA/XG4gICAgICAgICAgQXJyYXkuZnJvbShzdGF0ZW1lbnQuZGVjbGFyYXRpb25MaXN0LmRlY2xhcmF0aW9ucykgOlxuICAgICAgICAgIFtdO1xuICAgICAgaWYgKGRlY2xhcmF0aW9ucy5zb21lKGQgPT4gIWQuaW5pdGlhbGl6ZXIgfHwgIWlzUmVxdWlyZUNhbGwoZC5pbml0aWFsaXplcikpKSB7XG4gICAgICAgIHJldHVybiBzdGF0ZW1lbnQuZ2V0U3RhcnQoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIDA7XG4gIH1cbn1cbiJdfQ==