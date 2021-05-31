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
        define("@angular/compiler-cli/ngcc/src/host/commonjs_host", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/ngcc/src/utils", "@angular/compiler-cli/ngcc/src/host/commonjs_umd_utils", "@angular/compiler-cli/ngcc/src/host/esm2015_host", "@angular/compiler-cli/ngcc/src/host/esm5_host"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CommonJsReflectionHost = void 0;
    var tslib_1 = require("tslib");
    var ts = require("typescript");
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    var utils_1 = require("@angular/compiler-cli/ngcc/src/utils");
    var commonjs_umd_utils_1 = require("@angular/compiler-cli/ngcc/src/host/commonjs_umd_utils");
    var esm2015_host_1 = require("@angular/compiler-cli/ngcc/src/host/esm2015_host");
    var esm5_host_1 = require("@angular/compiler-cli/ngcc/src/host/esm5_host");
    var CommonJsReflectionHost = /** @class */ (function (_super) {
        tslib_1.__extends(CommonJsReflectionHost, _super);
        function CommonJsReflectionHost(logger, isCore, src, dts) {
            if (dts === void 0) { dts = null; }
            var _this = _super.call(this, logger, isCore, src, dts) || this;
            _this.commonJsExports = new utils_1.FactoryMap(function (sf) { return _this.computeExportsOfCommonJsModule(sf); });
            _this.topLevelHelperCalls = new utils_1.FactoryMap(function (helperName) { return new utils_1.FactoryMap(function (sf) { return sf.statements.map(function (stmt) { return _this.getHelperCall(stmt, [helperName]); })
                .filter(utils_1.isDefined); }); });
            _this.program = src.program;
            _this.compilerHost = src.host;
            return _this;
        }
        CommonJsReflectionHost.prototype.getImportOfIdentifier = function (id) {
            var requireCall = this.findCommonJsImport(id);
            if (requireCall === null) {
                return null;
            }
            return { from: requireCall.arguments[0].text, name: id.text };
        };
        CommonJsReflectionHost.prototype.getDeclarationOfIdentifier = function (id) {
            return this.getCommonJsModuleDeclaration(id) || _super.prototype.getDeclarationOfIdentifier.call(this, id);
        };
        CommonJsReflectionHost.prototype.getExportsOfModule = function (module) {
            return _super.prototype.getExportsOfModule.call(this, module) || this.commonJsExports.get(module.getSourceFile());
        };
        /**
         * Search statements related to the given class for calls to the specified helper.
         *
         * In CommonJS these helper calls can be outside the class's IIFE at the top level of the
         * source file. Searching the top level statements for helpers can be expensive, so we
         * try to get helpers from the IIFE first and only fall back on searching the top level if
         * no helpers are found.
         *
         * @param classSymbol the class whose helper calls we are interested in.
         * @param helperNames the names of the helpers (e.g. `__decorate`) whose calls we are interested
         * in.
         * @returns an array of nodes of calls to the helper with the given name.
         */
        CommonJsReflectionHost.prototype.getHelperCallsForClass = function (classSymbol, helperNames) {
            var esm5HelperCalls = _super.prototype.getHelperCallsForClass.call(this, classSymbol, helperNames);
            if (esm5HelperCalls.length > 0) {
                return esm5HelperCalls;
            }
            else {
                var sourceFile = classSymbol.declaration.valueDeclaration.getSourceFile();
                return this.getTopLevelHelperCalls(sourceFile, helperNames);
            }
        };
        /**
         * Find all the helper calls at the top level of a source file.
         *
         * We cache the helper calls per source file so that we don't have to keep parsing the code for
         * each class in a file.
         *
         * @param sourceFile the source who may contain helper calls.
         * @param helperNames the names of the helpers (e.g. `__decorate`) whose calls we are interested
         * in.
         * @returns an array of nodes of calls to the helper with the given name.
         */
        CommonJsReflectionHost.prototype.getTopLevelHelperCalls = function (sourceFile, helperNames) {
            var _this = this;
            var calls = [];
            helperNames.forEach(function (helperName) {
                var helperCallsMap = _this.topLevelHelperCalls.get(helperName);
                calls.push.apply(calls, tslib_1.__spreadArray([], tslib_1.__read(helperCallsMap.get(sourceFile))));
            });
            return calls;
        };
        CommonJsReflectionHost.prototype.computeExportsOfCommonJsModule = function (sourceFile) {
            var e_1, _a, e_2, _b;
            var moduleMap = new Map();
            try {
                for (var _c = tslib_1.__values(this.getModuleStatements(sourceFile)), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var statement = _d.value;
                    if (commonjs_umd_utils_1.isExportsStatement(statement)) {
                        var exportDeclaration = this.extractBasicCommonJsExportDeclaration(statement);
                        moduleMap.set(exportDeclaration.name, exportDeclaration.declaration);
                    }
                    else if (commonjs_umd_utils_1.isWildcardReexportStatement(statement)) {
                        var reexports = this.extractCommonJsWildcardReexports(statement, sourceFile);
                        try {
                            for (var reexports_1 = (e_2 = void 0, tslib_1.__values(reexports)), reexports_1_1 = reexports_1.next(); !reexports_1_1.done; reexports_1_1 = reexports_1.next()) {
                                var reexport = reexports_1_1.value;
                                moduleMap.set(reexport.name, reexport.declaration);
                            }
                        }
                        catch (e_2_1) { e_2 = { error: e_2_1 }; }
                        finally {
                            try {
                                if (reexports_1_1 && !reexports_1_1.done && (_b = reexports_1.return)) _b.call(reexports_1);
                            }
                            finally { if (e_2) throw e_2.error; }
                        }
                    }
                    else if (commonjs_umd_utils_1.isDefinePropertyReexportStatement(statement)) {
                        var exportDeclaration = this.extractCommonJsDefinePropertyExportDeclaration(statement);
                        if (exportDeclaration !== null) {
                            moduleMap.set(exportDeclaration.name, exportDeclaration.declaration);
                        }
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
            return moduleMap;
        };
        CommonJsReflectionHost.prototype.extractBasicCommonJsExportDeclaration = function (statement) {
            var _a;
            var exportExpression = commonjs_umd_utils_1.skipAliases(statement.expression.right);
            var node = statement.expression.left;
            var declaration = (_a = this.getDeclarationOfExpression(exportExpression)) !== null && _a !== void 0 ? _a : {
                kind: 1 /* Inline */,
                node: node,
                implementation: exportExpression,
                known: null,
                viaModule: null,
            };
            return { name: node.name.text, declaration: declaration };
        };
        CommonJsReflectionHost.prototype.extractCommonJsWildcardReexports = function (statement, containingFile) {
            var reexportArg = statement.expression.arguments[0];
            var requireCall = commonjs_umd_utils_1.isRequireCall(reexportArg) ?
                reexportArg :
                ts.isIdentifier(reexportArg) ? commonjs_umd_utils_1.findRequireCallReference(reexportArg, this.checker) : null;
            if (requireCall === null) {
                return [];
            }
            var importPath = requireCall.arguments[0].text;
            var importedFile = this.resolveModuleName(importPath, containingFile);
            if (importedFile === undefined) {
                return [];
            }
            var importedExports = this.getExportsOfModule(importedFile);
            if (importedExports === null) {
                return [];
            }
            var viaModule = commonjs_umd_utils_1.isExternalImport(importPath) ? importPath : null;
            var reexports = [];
            importedExports.forEach(function (declaration, name) {
                if (viaModule !== null && declaration.viaModule === null) {
                    declaration = tslib_1.__assign(tslib_1.__assign({}, declaration), { viaModule: viaModule });
                }
                reexports.push({ name: name, declaration: declaration });
            });
            return reexports;
        };
        CommonJsReflectionHost.prototype.extractCommonJsDefinePropertyExportDeclaration = function (statement) {
            var args = statement.expression.arguments;
            var name = args[1].text;
            var getterFnExpression = commonjs_umd_utils_1.extractGetterFnExpression(statement);
            if (getterFnExpression === null) {
                return null;
            }
            var declaration = this.getDeclarationOfExpression(getterFnExpression);
            if (declaration !== null) {
                return { name: name, declaration: declaration };
            }
            return {
                name: name,
                declaration: {
                    kind: 1 /* Inline */,
                    node: args[1],
                    implementation: getterFnExpression,
                    known: null,
                    viaModule: null,
                },
            };
        };
        CommonJsReflectionHost.prototype.findCommonJsImport = function (id) {
            // Is `id` a namespaced property access, e.g. `Directive` in `core.Directive`?
            // If so capture the symbol of the namespace, e.g. `core`.
            var nsIdentifier = commonjs_umd_utils_1.findNamespaceOfIdentifier(id);
            return nsIdentifier && commonjs_umd_utils_1.findRequireCallReference(nsIdentifier, this.checker);
        };
        /**
         * Handle the case where the identifier represents a reference to a whole CommonJS
         * module, i.e. the result of a call to `require(...)`.
         *
         * @param id the identifier whose declaration we are looking for.
         * @returns a declaration if `id` refers to a CommonJS module, or `null` otherwise.
         */
        CommonJsReflectionHost.prototype.getCommonJsModuleDeclaration = function (id) {
            var requireCall = commonjs_umd_utils_1.findRequireCallReference(id, this.checker);
            if (requireCall === null) {
                return null;
            }
            var importPath = requireCall.arguments[0].text;
            var module = this.resolveModuleName(importPath, id.getSourceFile());
            if (module === undefined) {
                return null;
            }
            var viaModule = commonjs_umd_utils_1.isExternalImport(importPath) ? importPath : null;
            return { node: module, known: null, viaModule: viaModule, identity: null, kind: 0 /* Concrete */ };
        };
        /**
         * If this is an IFE then try to grab the outer and inner classes otherwise fallback on the super
         * class.
         */
        CommonJsReflectionHost.prototype.getDeclarationOfExpression = function (expression) {
            var inner = esm2015_host_1.getInnerClassDeclaration(expression);
            if (inner !== null) {
                var outer = esm2015_host_1.getOuterNodeFromInnerDeclaration(inner);
                if (outer !== null && commonjs_umd_utils_1.isExportsAssignment(outer)) {
                    return {
                        kind: 1 /* Inline */,
                        node: outer.left,
                        implementation: inner,
                        known: null,
                        viaModule: null,
                    };
                }
            }
            return _super.prototype.getDeclarationOfExpression.call(this, expression);
        };
        CommonJsReflectionHost.prototype.resolveModuleName = function (moduleName, containingFile) {
            if (this.compilerHost.resolveModuleNames) {
                var moduleInfo = this.compilerHost.resolveModuleNames([moduleName], containingFile.fileName, undefined, undefined, this.program.getCompilerOptions())[0];
                return moduleInfo && this.program.getSourceFile(file_system_1.absoluteFrom(moduleInfo.resolvedFileName));
            }
            else {
                var moduleInfo = ts.resolveModuleName(moduleName, containingFile.fileName, this.program.getCompilerOptions(), this.compilerHost);
                return moduleInfo.resolvedModule &&
                    this.program.getSourceFile(file_system_1.absoluteFrom(moduleInfo.resolvedModule.resolvedFileName));
            }
        };
        return CommonJsReflectionHost;
    }(esm5_host_1.Esm5ReflectionHost));
    exports.CommonJsReflectionHost = CommonJsReflectionHost;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbW9uanNfaG9zdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9uZ2NjL3NyYy9ob3N0L2NvbW1vbmpzX2hvc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILCtCQUFpQztJQUVqQywyRUFBNEQ7SUFJNUQsOERBQStDO0lBRS9DLDZGQUF5WDtJQUN6WCxpRkFBMEY7SUFDMUYsMkVBQStDO0lBRy9DO1FBQTRDLGtEQUFrQjtRQVU1RCxnQ0FBWSxNQUFjLEVBQUUsTUFBZSxFQUFFLEdBQWtCLEVBQUUsR0FBOEI7WUFBOUIsb0JBQUEsRUFBQSxVQUE4QjtZQUEvRixZQUNFLGtCQUFNLE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxTQUdoQztZQWJTLHFCQUFlLEdBQUcsSUFBSSxrQkFBVSxDQUN0QyxVQUFBLEVBQUUsSUFBSSxPQUFBLEtBQUksQ0FBQyw4QkFBOEIsQ0FBQyxFQUFFLENBQUMsRUFBdkMsQ0FBdUMsQ0FBQyxDQUFDO1lBQ3pDLHlCQUFtQixHQUN6QixJQUFJLGtCQUFVLENBQ1YsVUFBQSxVQUFVLElBQUksT0FBQSxJQUFJLGtCQUFVLENBQ3hCLFVBQUEsRUFBRSxJQUFJLE9BQUEsRUFBRSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSxLQUFJLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQXRDLENBQXNDLENBQUM7aUJBQzVELE1BQU0sQ0FBQyxpQkFBUyxDQUFDLEVBRHRCLENBQ3NCLENBQUMsRUFGbkIsQ0FFbUIsQ0FBQyxDQUFDO1lBS3pDLEtBQUksQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQztZQUMzQixLQUFJLENBQUMsWUFBWSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENB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a0RBQWlCLEdBQXpCLFVBQTBCLFVBQWtCLEVBQUUsY0FBNkI7WUFFekUsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLGtCQUFrQixFQUFFO2dCQUN4QyxJQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLGtCQUFrQixDQUNuRCxDQUFDLFVBQVUsQ0FBQyxFQUFFLGNBQWMsQ0FBQyxRQUFRLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFDM0QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzFDLE9BQU8sVUFBVSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLDBCQUFZLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQzthQUM1RjtpQkFBTTtnQkFDTCxJQUFNLFVBQVUsR0FBRyxFQUFFLENBQUMsaUJBQWlCLENBQ25DLFVBQVUsRUFBRSxjQUFjLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsa0JBQWtCLEVBQUUsRUFDdEUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUN2QixPQUFPLFVBQVUsQ0FBQyxjQUFjO29CQUM1QixJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQywwQkFBWSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO2FBQzFGO1FBQ0gsQ0FBQztRQUNILDZCQUFDO0lBQUQsQ0FBQyxBQTFPRCxDQUE0Qyw4QkFBa0IsR0EwTzdEO0lBMU9ZLHdEQUFzQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHthYnNvbHV0ZUZyb219IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy9maWxlX3N5c3RlbSc7XG5pbXBvcnQge0xvZ2dlcn0gZnJvbSAnLi4vLi4vLi4vc3JjL25ndHNjL2xvZ2dpbmcnO1xuaW1wb3J0IHtEZWNsYXJhdGlvbiwgRGVjbGFyYXRpb25LaW5kLCBJbXBvcnR9IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy9yZWZsZWN0aW9uJztcbmltcG9ydCB7QnVuZGxlUHJvZ3JhbX0gZnJvbSAnLi4vcGFja2FnZXMvYnVuZGxlX3Byb2dyYW0nO1xuaW1wb3J0IHtGYWN0b3J5TWFwLCBpc0RlZmluZWR9IGZyb20gJy4uL3V0aWxzJztcblxuaW1wb3J0IHtEZWZpbmVQcm9wZXJ0eVJlZXhwb3J0U3RhdGVtZW50LCBFeHBvcnREZWNsYXJhdGlvbiwgRXhwb3J0c1N0YXRlbWVudCwgZXh0cmFjdEdldHRlckZuRXhwcmVzc2lvbiwgZmluZE5hbWVzcGFjZU9mSWRlbnRpZmllciwgZmluZFJlcXVpcmVDYWxsUmVmZXJlbmNlLCBpc0RlZmluZVByb3BlcnR5UmVleHBvcnRTdGF0ZW1lbnQsIGlzRXhwb3J0c0Fzc2lnbm1lbnQsIGlzRXhwb3J0c1N0YXRlbWVudCwgaXNFeHRlcm5hbEltcG9ydCwgaXNSZXF1aXJlQ2FsbCwgaXNXaWxkY2FyZFJlZXhwb3J0U3RhdGVtZW50LCBSZXF1aXJlQ2FsbCwgc2tpcEFsaWFzZXMsIFdpbGRjYXJkUmVleHBvcnRTdGF0ZW1lbnR9IGZyb20gJy4vY29tbW9uanNfdW1kX3V0aWxzJztcbmltcG9ydCB7Z2V0SW5uZXJDbGFzc0RlY2xhcmF0aW9uLCBnZXRPdXRlck5vZGVGcm9tSW5uZXJEZWNsYXJhdGlvbn0gZnJvbSAnLi9lc20yMDE1X2hvc3QnO1xuaW1wb3J0IHtFc201UmVmbGVjdGlvbkhvc3R9IGZyb20gJy4vZXNtNV9ob3N0JztcbmltcG9ydCB7TmdjY0NsYXNzU3ltYm9sfSBmcm9tICcuL25nY2NfaG9zdCc7XG5cbmV4cG9ydCBjbGFzcyBDb21tb25Kc1JlZmxlY3Rpb25Ib3N0IGV4dGVuZHMgRXNtNVJlZmxlY3Rpb25Ib3N0IHtcbiAgcHJvdGVjdGVkIGNvbW1vbkpzRXhwb3J0cyA9IG5ldyBGYWN0b3J5TWFwPHRzLlNvdXJjZUZpbGUsIE1hcDxzdHJpbmcsIERlY2xhcmF0aW9uPnxudWxsPihcbiAgICAgIHNmID0+IHRoaXMuY29tcHV0ZUV4cG9ydHNPZkNvbW1vbkpzTW9kdWxlKHNmKSk7XG4gIHByb3RlY3RlZCB0b3BMZXZlbEhlbHBlckNhbGxzID1cbiAgICAgIG5ldyBGYWN0b3J5TWFwPHN0cmluZywgRmFjdG9yeU1hcDx0cy5Tb3VyY2VGaWxlLCB0cy5DYWxsRXhwcmVzc2lvbltdPj4oXG4gICAgICAgICAgaGVscGVyTmFtZSA9PiBuZXcgRmFjdG9yeU1hcDx0cy5Tb3VyY2VGaWxlLCB0cy5DYWxsRXhwcmVzc2lvbltdPihcbiAgICAgICAgICAgICAgc2YgPT4gc2Yuc3RhdGVtZW50cy5tYXAoc3RtdCA9PiB0aGlzLmdldEhlbHBlckNhbGwoc3RtdCwgW2hlbHBlck5hbWVdKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5maWx0ZXIoaXNEZWZpbmVkKSkpO1xuICBwcm90ZWN0ZWQgcHJvZ3JhbTogdHMuUHJvZ3JhbTtcbiAgcHJvdGVjdGVkIGNvbXBpbGVySG9zdDogdHMuQ29tcGlsZXJIb3N0O1xuICBjb25zdHJ1Y3Rvcihsb2dnZXI6IExvZ2dlciwgaXNDb3JlOiBib29sZWFuLCBzcmM6IEJ1bmRsZVByb2dyYW0sIGR0czogQnVuZGxlUHJvZ3JhbXxudWxsID0gbnVsbCkge1xuICAgIHN1cGVyKGxvZ2dlciwgaXNDb3JlLCBzcmMsIGR0cyk7XG4gICAgdGhpcy5wcm9ncmFtID0gc3JjLnByb2dyYW07XG4gICAgdGhpcy5jb21waWxlckhvc3QgPSBzcmMuaG9zdDtcbiAgfVxuXG4gIGdldEltcG9ydE9mSWRlbnRpZmllcihpZDogdHMuSWRlbnRpZmllcik6IEltcG9ydHxudWxsIHtcbiAgICBjb25zdCByZXF1aXJlQ2FsbCA9IHRoaXMuZmluZENvbW1vbkpzSW1wb3J0KGlkKTtcbiAgICBpZiAocmVxdWlyZUNhbGwgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4ge2Zyb206IHJlcXVpcmVDYWxsLmFyZ3VtZW50c1swXS50ZXh0LCBuYW1lOiBpZC50ZXh0fTtcbiAgfVxuXG4gIGdldERlY2xhcmF0aW9uT2ZJZGVudGlmaWVyKGlkOiB0cy5JZGVudGlmaWVyKTogRGVjbGFyYXRpb258bnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0Q29tbW9uSnNNb2R1bGVEZWNsYXJhdGlvbihpZCkgfHwgc3VwZXIuZ2V0RGVjbGFyYXRpb25PZklkZW50aWZpZXIoaWQpO1xuICB9XG5cbiAgZ2V0RXhwb3J0c09mTW9kdWxlKG1vZHVsZTogdHMuTm9kZSk6IE1hcDxzdHJpbmcsIERlY2xhcmF0aW9uPnxudWxsIHtcbiAgICByZXR1cm4gc3VwZXIuZ2V0RXhwb3J0c09mTW9kdWxlKG1vZHVsZSkgfHwgdGhpcy5jb21tb25Kc0V4cG9ydHMuZ2V0KG1vZHVsZS5nZXRTb3VyY2VGaWxlKCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlYXJjaCBzdGF0ZW1lbnRzIHJlbGF0ZWQgdG8gdGhlIGdpdmVuIGNsYXNzIGZvciBjYWxscyB0byB0aGUgc3BlY2lmaWVkIGhlbHBlci5cbiAgICpcbiAgICogSW4gQ29tbW9uSlMgdGhlc2UgaGVscGVyIGNhbGxzIGNhbiBiZSBvdXRzaWRlIHRoZSBjbGFzcydzIElJRkUgYXQgdGhlIHRvcCBsZXZlbCBvZiB0aGVcbiAgICogc291cmNlIGZpbGUuIFNlYXJjaGluZyB0aGUgdG9wIGxldmVsIHN0YXRlbWVudHMgZm9yIGhlbHBlcnMgY2FuIGJlIGV4cGVuc2l2ZSwgc28gd2VcbiAgICogdHJ5IHRvIGdldCBoZWxwZXJzIGZyb20gdGhlIElJRkUgZmlyc3QgYW5kIG9ubHkgZmFsbCBiYWNrIG9uIHNlYXJjaGluZyB0aGUgdG9wIGxldmVsIGlmXG4gICAqIG5vIGhlbHBlcnMgYXJlIGZvdW5kLlxuICAgKlxuICAgKiBAcGFyYW0gY2xhc3NTeW1ib2wgdGhlIGNsYXNzIHdob3NlIGhlbHBlciBjYWxscyB3ZSBhcmUgaW50ZXJlc3RlZCBpbi5cbiAgICogQHBhcmFtIGhlbHBlck5hbWVzIHRoZSBuYW1lcyBvZiB0aGUgaGVscGVycyAoZS5nLiBgX19kZWNvcmF0ZWApIHdob3NlIGNhbGxzIHdlIGFyZSBpbnRlcmVzdGVkXG4gICAqIGluLlxuICAgKiBAcmV0dXJucyBhbiBhcnJheSBvZiBub2RlcyBvZiBjYWxscyB0byB0aGUgaGVscGVyIHdpdGggdGhlIGdpdmVuIG5hbWUuXG4gICAqL1xuICBwcm90ZWN0ZWQgZ2V0SGVscGVyQ2FsbHNGb3JDbGFzcyhjbGFzc1N5bWJvbDogTmdjY0NsYXNzU3ltYm9sLCBoZWxwZXJOYW1lczogc3RyaW5nW10pOlxuICAgICAgdHMuQ2FsbEV4cHJlc3Npb25bXSB7XG4gICAgY29uc3QgZXNtNUhlbHBlckNhbGxzID0gc3VwZXIuZ2V0SGVscGVyQ2FsbHNGb3JDbGFzcyhjbGFzc1N5bWJvbCwgaGVscGVyTmFtZXMpO1xuICAgIGlmIChlc201SGVscGVyQ2FsbHMubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIGVzbTVIZWxwZXJDYWxscztcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3Qgc291cmNlRmlsZSA9IGNsYXNzU3ltYm9sLmRlY2xhcmF0aW9uLnZhbHVlRGVjbGFyYXRpb24uZ2V0U291cmNlRmlsZSgpO1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0VG9wTGV2ZWxIZWxwZXJDYWxscyhzb3VyY2VGaWxlLCBoZWxwZXJOYW1lcyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEZpbmQgYWxsIHRoZSBoZWxwZXIgY2FsbHMgYXQgdGhlIHRvcCBsZXZlbCBvZiBhIHNvdXJjZSBmaWxlLlxuICAgKlxuICAgKiBXZSBjYWNoZSB0aGUgaGVscGVyIGNhbGxzIHBlciBzb3VyY2UgZmlsZSBzbyB0aGF0IHdlIGRvbid0IGhhdmUgdG8ga2VlcCBwYXJzaW5nIHRoZSBjb2RlIGZvclxuICAgKiBlYWNoIGNsYXNzIGluIGEgZmlsZS5cbiAgICpcbiAgICogQHBhcmFtIHNvdXJjZUZpbGUgdGhlIHNvdXJjZSB3aG8gbWF5IGNvbnRhaW4gaGVscGVyIGNhbGxzLlxuICAgKiBAcGFyYW0gaGVscGVyTmFtZXMgdGhlIG5hbWVzIG9mIHRoZSBoZWxwZXJzIChlLmcuIGBfX2RlY29yYXRlYCkgd2hvc2UgY2FsbHMgd2UgYXJlIGludGVyZXN0ZWRcbiAgICogaW4uXG4gICAqIEByZXR1cm5zIGFuIGFycmF5IG9mIG5vZGVzIG9mIGNhbGxzIHRvIHRoZSBoZWxwZXIgd2l0aCB0aGUgZ2l2ZW4gbmFtZS5cbiAgICovXG4gIHByaXZhdGUgZ2V0VG9wTGV2ZWxIZWxwZXJDYWxscyhzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlLCBoZWxwZXJOYW1lczogc3RyaW5nW10pOlxuICAgICAgdHMuQ2FsbEV4cHJlc3Npb25bXSB7XG4gICAgY29uc3QgY2FsbHM6IHRzLkNhbGxFeHByZXNzaW9uW10gPSBbXTtcbiAgICBoZWxwZXJOYW1lcy5mb3JFYWNoKGhlbHBlck5hbWUgPT4ge1xuICAgICAgY29uc3QgaGVscGVyQ2FsbHNNYXAgPSB0aGlzLnRvcExldmVsSGVscGVyQ2FsbHMuZ2V0KGhlbHBlck5hbWUpO1xuICAgICAgY2FsbHMucHVzaCguLi5oZWxwZXJDYWxsc01hcC5nZXQoc291cmNlRmlsZSkpO1xuICAgIH0pO1xuICAgIHJldHVybiBjYWxscztcbiAgfVxuXG4gIHByaXZhdGUgY29tcHV0ZUV4cG9ydHNPZkNvbW1vbkpzTW9kdWxlKHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUpOiBNYXA8c3RyaW5nLCBEZWNsYXJhdGlvbj4ge1xuICAgIGNvbnN0IG1vZHVsZU1hcCA9IG5ldyBNYXA8c3RyaW5nLCBEZWNsYXJhdGlvbj4oKTtcbiAgICBmb3IgKGNvbnN0IHN0YXRlbWVudCBvZiB0aGlzLmdldE1vZHVsZVN0YXRlbWVudHMoc291cmNlRmlsZSkpIHtcbiAgICAgIGlmIChpc0V4cG9ydHNTdGF0ZW1lbnQoc3RhdGVtZW50KSkge1xuICAgICAgICBjb25zdCBleHBvcnREZWNsYXJhdGlvbiA9IHRoaXMuZXh0cmFjdEJhc2ljQ29tbW9uSnNFeHBvcnREZWNsYXJhdGlvbihzdGF0ZW1lbnQpO1xuICAgICAgICBtb2R1bGVNYXAuc2V0KGV4cG9ydERlY2xhcmF0aW9uLm5hbWUsIGV4cG9ydERlY2xhcmF0aW9uLmRlY2xhcmF0aW9uKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNXaWxkY2FyZFJlZXhwb3J0U3RhdGVtZW50KHN0YXRlbWVudCkpIHtcbiAgICAgICAgY29uc3QgcmVleHBvcnRzID0gdGhpcy5leHRyYWN0Q29tbW9uSnNXaWxkY2FyZFJlZXhwb3J0cyhzdGF0ZW1lbnQsIHNvdXJjZUZpbGUpO1xuICAgICAgICBmb3IgKGNvbnN0IHJlZXhwb3J0IG9mIHJlZXhwb3J0cykge1xuICAgICAgICAgIG1vZHVsZU1hcC5zZXQocmVleHBvcnQubmFtZSwgcmVleHBvcnQuZGVjbGFyYXRpb24pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGlzRGVmaW5lUHJvcGVydHlSZWV4cG9ydFN0YXRlbWVudChzdGF0ZW1lbnQpKSB7XG4gICAgICAgIGNvbnN0IGV4cG9ydERlY2xhcmF0aW9uID0gdGhpcy5leHRyYWN0Q29tbW9uSnNEZWZpbmVQcm9wZXJ0eUV4cG9ydERlY2xhcmF0aW9uKHN0YXRlbWVudCk7XG4gICAgICAgIGlmIChleHBvcnREZWNsYXJhdGlvbiAhPT0gbnVsbCkge1xuICAgICAgICAgIG1vZHVsZU1hcC5zZXQoZXhwb3J0RGVjbGFyYXRpb24ubmFtZSwgZXhwb3J0RGVjbGFyYXRpb24uZGVjbGFyYXRpb24pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBtb2R1bGVNYXA7XG4gIH1cblxuICBwcml2YXRlIGV4dHJhY3RCYXNpY0NvbW1vbkpzRXhwb3J0RGVjbGFyYXRpb24oc3RhdGVtZW50OiBFeHBvcnRzU3RhdGVtZW50KTogRXhwb3J0RGVjbGFyYXRpb24ge1xuICAgIGNvbnN0IGV4cG9ydEV4cHJlc3Npb24gPSBza2lwQWxpYXNlcyhzdGF0ZW1lbnQuZXhwcmVzc2lvbi5yaWdodCk7XG4gICAgY29uc3Qgbm9kZSA9IHN0YXRlbWVudC5leHByZXNzaW9uLmxlZnQ7XG4gICAgY29uc3QgZGVjbGFyYXRpb24gPSB0aGlzLmdldERlY2xhcmF0aW9uT2ZFeHByZXNzaW9uKGV4cG9ydEV4cHJlc3Npb24pID8/IHtcbiAgICAgIGtpbmQ6IERlY2xhcmF0aW9uS2luZC5JbmxpbmUsXG4gICAgICBub2RlLFxuICAgICAgaW1wbGVtZW50YXRpb246IGV4cG9ydEV4cHJlc3Npb24sXG4gICAgICBrbm93bjogbnVsbCxcbiAgICAgIHZpYU1vZHVsZTogbnVsbCxcbiAgICB9O1xuICAgIHJldHVybiB7bmFtZTogbm9kZS5uYW1lLnRleHQsIGRlY2xhcmF0aW9ufTtcbiAgfVxuXG4gIHByaXZhdGUgZXh0cmFjdENvbW1vbkpzV2lsZGNhcmRSZWV4cG9ydHMoXG4gICAgICBzdGF0ZW1lbnQ6IFdpbGRjYXJkUmVleHBvcnRTdGF0ZW1lbnQsIGNvbnRhaW5pbmdGaWxlOiB0cy5Tb3VyY2VGaWxlKTogRXhwb3J0RGVjbGFyYXRpb25bXSB7XG4gICAgY29uc3QgcmVleHBvcnRBcmcgPSBzdGF0ZW1lbnQuZXhwcmVzc2lvbi5hcmd1bWVudHNbMF07XG5cbiAgICBjb25zdCByZXF1aXJlQ2FsbCA9IGlzUmVxdWlyZUNhbGwocmVleHBvcnRBcmcpID9cbiAgICAgICAgcmVleHBvcnRBcmcgOlxuICAgICAgICB0cy5pc0lkZW50aWZpZXIocmVleHBvcnRBcmcpID8gZmluZFJlcXVpcmVDYWxsUmVmZXJlbmNlKHJlZXhwb3J0QXJnLCB0aGlzLmNoZWNrZXIpIDogbnVsbDtcbiAgICBpZiAocmVxdWlyZUNhbGwgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICBjb25zdCBpbXBvcnRQYXRoID0gcmVxdWlyZUNhbGwuYXJndW1lbnRzWzBdLnRleHQ7XG4gICAgY29uc3QgaW1wb3J0ZWRGaWxlID0gdGhpcy5yZXNvbHZlTW9kdWxlTmFtZShpbXBvcnRQYXRoLCBjb250YWluaW5nRmlsZSk7XG4gICAgaWYgKGltcG9ydGVkRmlsZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgY29uc3QgaW1wb3J0ZWRFeHBvcnRzID0gdGhpcy5nZXRFeHBvcnRzT2ZNb2R1bGUoaW1wb3J0ZWRGaWxlKTtcbiAgICBpZiAoaW1wb3J0ZWRFeHBvcnRzID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgY29uc3QgdmlhTW9kdWxlID0gaXNFeHRlcm5hbEltcG9ydChpbXBvcnRQYXRoKSA/IGltcG9ydFBhdGggOiBudWxsO1xuICAgIGNvbnN0IHJlZXhwb3J0czogRXhwb3J0RGVjbGFyYXRpb25bXSA9IFtdO1xuICAgIGltcG9ydGVkRXhwb3J0cy5mb3JFYWNoKChkZWNsYXJhdGlvbiwgbmFtZSkgPT4ge1xuICAgICAgaWYgKHZpYU1vZHVsZSAhPT0gbnVsbCAmJiBkZWNsYXJhdGlvbi52aWFNb2R1bGUgPT09IG51bGwpIHtcbiAgICAgICAgZGVjbGFyYXRpb24gPSB7Li4uZGVjbGFyYXRpb24sIHZpYU1vZHVsZX07XG4gICAgICB9XG4gICAgICByZWV4cG9ydHMucHVzaCh7bmFtZSwgZGVjbGFyYXRpb259KTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmVleHBvcnRzO1xuICB9XG5cbiAgcHJpdmF0ZSBleHRyYWN0Q29tbW9uSnNEZWZpbmVQcm9wZXJ0eUV4cG9ydERlY2xhcmF0aW9uKFxuICAgICAgc3RhdGVtZW50OiBEZWZpbmVQcm9wZXJ0eVJlZXhwb3J0U3RhdGVtZW50KTogRXhwb3J0RGVjbGFyYXRpb258bnVsbCB7XG4gICAgY29uc3QgYXJncyA9IHN0YXRlbWVudC5leHByZXNzaW9uLmFyZ3VtZW50cztcbiAgICBjb25zdCBuYW1lID0gYXJnc1sxXS50ZXh0O1xuICAgIGNvbnN0IGdldHRlckZuRXhwcmVzc2lvbiA9IGV4dHJhY3RHZXR0ZXJGbkV4cHJlc3Npb24oc3RhdGVtZW50KTtcbiAgICBpZiAoZ2V0dGVyRm5FeHByZXNzaW9uID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBkZWNsYXJhdGlvbiA9IHRoaXMuZ2V0RGVjbGFyYXRpb25PZkV4cHJlc3Npb24oZ2V0dGVyRm5FeHByZXNzaW9uKTtcbiAgICBpZiAoZGVjbGFyYXRpb24gIT09IG51bGwpIHtcbiAgICAgIHJldHVybiB7bmFtZSwgZGVjbGFyYXRpb259O1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBuYW1lLFxuICAgICAgZGVjbGFyYXRpb246IHtcbiAgICAgICAga2luZDogRGVjbGFyYXRpb25LaW5kLklubGluZSxcbiAgICAgICAgbm9kZTogYXJnc1sxXSxcbiAgICAgICAgaW1wbGVtZW50YXRpb246IGdldHRlckZuRXhwcmVzc2lvbixcbiAgICAgICAga25vd246IG51bGwsXG4gICAgICAgIHZpYU1vZHVsZTogbnVsbCxcbiAgICAgIH0sXG4gICAgfTtcbiAgfVxuXG4gIHByaXZhdGUgZmluZENvbW1vbkpzSW1wb3J0KGlkOiB0cy5JZGVudGlmaWVyKTogUmVxdWlyZUNhbGx8bnVsbCB7XG4gICAgLy8gSXMgYGlkYCBhIG5hbWVzcGFjZWQgcHJvcGVydHkgYWNjZXNzLCBlLmcuIGBEaXJlY3RpdmVgIGluIGBjb3JlLkRpcmVjdGl2ZWA/XG4gICAgLy8gSWYgc28gY2FwdHVyZSB0aGUgc3ltYm9sIG9mIHRoZSBuYW1lc3BhY2UsIGUuZy4gYGNvcmVgLlxuICAgIGNvbnN0IG5zSWRlbnRpZmllciA9IGZpbmROYW1lc3BhY2VPZklkZW50aWZpZXIoaWQpO1xuICAgIHJldHVybiBuc0lkZW50aWZpZXIgJiYgZmluZFJlcXVpcmVDYWxsUmVmZXJlbmNlKG5zSWRlbnRpZmllciwgdGhpcy5jaGVja2VyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGUgdGhlIGNhc2Ugd2hlcmUgdGhlIGlkZW50aWZpZXIgcmVwcmVzZW50cyBhIHJlZmVyZW5jZSB0byBhIHdob2xlIENvbW1vbkpTXG4gICAqIG1vZHVsZSwgaS5lLiB0aGUgcmVzdWx0IG9mIGEgY2FsbCB0byBgcmVxdWlyZSguLi4pYC5cbiAgICpcbiAgICogQHBhcmFtIGlkIHRoZSBpZGVudGlmaWVyIHdob3NlIGRlY2xhcmF0aW9uIHdlIGFyZSBsb29raW5nIGZvci5cbiAgICogQHJldHVybnMgYSBkZWNsYXJhdGlvbiBpZiBgaWRgIHJlZmVycyB0byBhIENvbW1vbkpTIG1vZHVsZSwgb3IgYG51bGxgIG90aGVyd2lzZS5cbiAgICovXG4gIHByaXZhdGUgZ2V0Q29tbW9uSnNNb2R1bGVEZWNsYXJhdGlvbihpZDogdHMuSWRlbnRpZmllcik6IERlY2xhcmF0aW9ufG51bGwge1xuICAgIGNvbnN0IHJlcXVpcmVDYWxsID0gZmluZFJlcXVpcmVDYWxsUmVmZXJlbmNlKGlkLCB0aGlzLmNoZWNrZXIpO1xuICAgIGlmIChyZXF1aXJlQ2FsbCA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IGltcG9ydFBhdGggPSByZXF1aXJlQ2FsbC5hcmd1bWVudHNbMF0udGV4dDtcbiAgICBjb25zdCBtb2R1bGUgPSB0aGlzLnJlc29sdmVNb2R1bGVOYW1lKGltcG9ydFBhdGgsIGlkLmdldFNvdXJjZUZpbGUoKSk7XG4gICAgaWYgKG1vZHVsZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgdmlhTW9kdWxlID0gaXNFeHRlcm5hbEltcG9ydChpbXBvcnRQYXRoKSA/IGltcG9ydFBhdGggOiBudWxsO1xuICAgIHJldHVybiB7bm9kZTogbW9kdWxlLCBrbm93bjogbnVsbCwgdmlhTW9kdWxlLCBpZGVudGl0eTogbnVsbCwga2luZDogRGVjbGFyYXRpb25LaW5kLkNvbmNyZXRlfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJZiB0aGlzIGlzIGFuIElGRSB0aGVuIHRyeSB0byBncmFiIHRoZSBvdXRlciBhbmQgaW5uZXIgY2xhc3NlcyBvdGhlcndpc2UgZmFsbGJhY2sgb24gdGhlIHN1cGVyXG4gICAqIGNsYXNzLlxuICAgKi9cbiAgcHJvdGVjdGVkIGdldERlY2xhcmF0aW9uT2ZFeHByZXNzaW9uKGV4cHJlc3Npb246IHRzLkV4cHJlc3Npb24pOiBEZWNsYXJhdGlvbnxudWxsIHtcbiAgICBjb25zdCBpbm5lciA9IGdldElubmVyQ2xhc3NEZWNsYXJhdGlvbihleHByZXNzaW9uKTtcbiAgICBpZiAoaW5uZXIgIT09IG51bGwpIHtcbiAgICAgIGNvbnN0IG91dGVyID0gZ2V0T3V0ZXJOb2RlRnJvbUlubmVyRGVjbGFyYXRpb24oaW5uZXIpO1xuICAgICAgaWYgKG91dGVyICE9PSBudWxsICYmIGlzRXhwb3J0c0Fzc2lnbm1lbnQob3V0ZXIpKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAga2luZDogRGVjbGFyYXRpb25LaW5kLklubGluZSxcbiAgICAgICAgICBub2RlOiBvdXRlci5sZWZ0LFxuICAgICAgICAgIGltcGxlbWVudGF0aW9uOiBpbm5lcixcbiAgICAgICAgICBrbm93bjogbnVsbCxcbiAgICAgICAgICB2aWFNb2R1bGU6IG51bGwsXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzdXBlci5nZXREZWNsYXJhdGlvbk9mRXhwcmVzc2lvbihleHByZXNzaW9uKTtcbiAgfVxuXG4gIHByaXZhdGUgcmVzb2x2ZU1vZHVsZU5hbWUobW9kdWxlTmFtZTogc3RyaW5nLCBjb250YWluaW5nRmlsZTogdHMuU291cmNlRmlsZSk6IHRzLlNvdXJjZUZpbGVcbiAgICAgIHx1bmRlZmluZWQge1xuICAgIGlmICh0aGlzLmNvbXBpbGVySG9zdC5yZXNvbHZlTW9kdWxlTmFtZXMpIHtcbiAgICAgIGNvbnN0IG1vZHVsZUluZm8gPSB0aGlzLmNvbXBpbGVySG9zdC5yZXNvbHZlTW9kdWxlTmFtZXMoXG4gICAgICAgICAgW21vZHVsZU5hbWVdLCBjb250YWluaW5nRmlsZS5maWxlTmFtZSwgdW5kZWZpbmVkLCB1bmRlZmluZWQsXG4gICAgICAgICAgdGhpcy5wcm9ncmFtLmdldENvbXBpbGVyT3B0aW9ucygpKVswXTtcbiAgICAgIHJldHVybiBtb2R1bGVJbmZvICYmIHRoaXMucHJvZ3JhbS5nZXRTb3VyY2VGaWxlKGFic29sdXRlRnJvbShtb2R1bGVJbmZvLnJlc29sdmVkRmlsZU5hbWUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgbW9kdWxlSW5mbyA9IHRzLnJlc29sdmVNb2R1bGVOYW1lKFxuICAgICAgICAgIG1vZHVsZU5hbWUsIGNvbnRhaW5pbmdGaWxlLmZpbGVOYW1lLCB0aGlzLnByb2dyYW0uZ2V0Q29tcGlsZXJPcHRpb25zKCksXG4gICAgICAgICAgdGhpcy5jb21waWxlckhvc3QpO1xuICAgICAgcmV0dXJuIG1vZHVsZUluZm8ucmVzb2x2ZWRNb2R1bGUgJiZcbiAgICAgICAgICB0aGlzLnByb2dyYW0uZ2V0U291cmNlRmlsZShhYnNvbHV0ZUZyb20obW9kdWxlSW5mby5yZXNvbHZlZE1vZHVsZS5yZXNvbHZlZEZpbGVOYW1lKSk7XG4gICAgfVxuICB9XG59XG4iXX0=