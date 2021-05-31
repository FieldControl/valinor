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
        define("@angular/compiler-cli/ngcc/src/host/umd_host", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/src/ngtsc/reflection", "@angular/compiler-cli/ngcc/src/utils", "@angular/compiler-cli/ngcc/src/host/commonjs_umd_utils", "@angular/compiler-cli/ngcc/src/host/esm2015_host", "@angular/compiler-cli/ngcc/src/host/esm5_host", "@angular/compiler-cli/ngcc/src/host/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getImportsOfUmdModule = exports.parseStatementForUmdModule = exports.UmdReflectionHost = void 0;
    var tslib_1 = require("tslib");
    var ts = require("typescript");
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    var reflection_1 = require("@angular/compiler-cli/src/ngtsc/reflection");
    var utils_1 = require("@angular/compiler-cli/ngcc/src/utils");
    var commonjs_umd_utils_1 = require("@angular/compiler-cli/ngcc/src/host/commonjs_umd_utils");
    var esm2015_host_1 = require("@angular/compiler-cli/ngcc/src/host/esm2015_host");
    var esm5_host_1 = require("@angular/compiler-cli/ngcc/src/host/esm5_host");
    var utils_2 = require("@angular/compiler-cli/ngcc/src/host/utils");
    var UmdReflectionHost = /** @class */ (function (_super) {
        tslib_1.__extends(UmdReflectionHost, _super);
        function UmdReflectionHost(logger, isCore, src, dts) {
            if (dts === void 0) { dts = null; }
            var _this = _super.call(this, logger, isCore, src, dts) || this;
            _this.umdModules = new utils_1.FactoryMap(function (sf) { return _this.computeUmdModule(sf); });
            _this.umdExports = new utils_1.FactoryMap(function (sf) { return _this.computeExportsOfUmdModule(sf); });
            _this.umdImportPaths = new utils_1.FactoryMap(function (param) { return _this.computeImportPath(param); });
            _this.program = src.program;
            _this.compilerHost = src.host;
            return _this;
        }
        UmdReflectionHost.prototype.getImportOfIdentifier = function (id) {
            // Is `id` a namespaced property access, e.g. `Directive` in `core.Directive`?
            // If so capture the symbol of the namespace, e.g. `core`.
            var nsIdentifier = commonjs_umd_utils_1.findNamespaceOfIdentifier(id);
            var importParameter = nsIdentifier && this.findUmdImportParameter(nsIdentifier);
            var from = importParameter && this.getUmdImportPath(importParameter);
            return from !== null ? { from: from, name: id.text } : null;
        };
        UmdReflectionHost.prototype.getDeclarationOfIdentifier = function (id) {
            // First we try one of the following:
            // 1. The `exports` identifier - referring to the current file/module.
            // 2. An identifier (e.g. `foo`) that refers to an imported UMD module.
            // 3. A UMD style export identifier (e.g. the `foo` of `exports.foo`).
            var declaration = this.getExportsDeclaration(id) || this.getUmdModuleDeclaration(id) ||
                this.getUmdDeclaration(id);
            if (declaration !== null) {
                return declaration;
            }
            // Try to get the declaration using the super class.
            var superDeclaration = _super.prototype.getDeclarationOfIdentifier.call(this, id);
            if (superDeclaration === null) {
                return null;
            }
            // Check to see if the declaration is the inner node of a declaration IIFE.
            var outerNode = esm2015_host_1.getOuterNodeFromInnerDeclaration(superDeclaration.node);
            if (outerNode === null) {
                return superDeclaration;
            }
            // We are only interested if the outer declaration is of the form
            // `exports.<name> = <initializer>`.
            if (!commonjs_umd_utils_1.isExportsAssignment(outerNode)) {
                return superDeclaration;
            }
            return {
                kind: 1 /* Inline */,
                node: outerNode.left,
                implementation: outerNode.right,
                known: null,
                viaModule: null,
            };
        };
        UmdReflectionHost.prototype.getExportsOfModule = function (module) {
            return _super.prototype.getExportsOfModule.call(this, module) || this.umdExports.get(module.getSourceFile());
        };
        UmdReflectionHost.prototype.getUmdModule = function (sourceFile) {
            if (sourceFile.isDeclarationFile) {
                return null;
            }
            return this.umdModules.get(sourceFile);
        };
        UmdReflectionHost.prototype.getUmdImportPath = function (importParameter) {
            return this.umdImportPaths.get(importParameter);
        };
        /**
         * Get the top level statements for a module.
         *
         * In UMD modules these are the body of the UMD factory function.
         *
         * @param sourceFile The module whose statements we want.
         * @returns An array of top level statements for the given module.
         */
        UmdReflectionHost.prototype.getModuleStatements = function (sourceFile) {
            var umdModule = this.getUmdModule(sourceFile);
            return umdModule !== null ? Array.from(umdModule.factoryFn.body.statements) : [];
        };
        UmdReflectionHost.prototype.getClassSymbolFromOuterDeclaration = function (declaration) {
            var superSymbol = _super.prototype.getClassSymbolFromOuterDeclaration.call(this, declaration);
            if (superSymbol) {
                return superSymbol;
            }
            if (!commonjs_umd_utils_1.isExportsDeclaration(declaration)) {
                return undefined;
            }
            var initializer = commonjs_umd_utils_1.skipAliases(declaration.parent.right);
            if (ts.isIdentifier(initializer)) {
                var implementation = this.getDeclarationOfIdentifier(initializer);
                if (implementation !== null) {
                    var implementationSymbol = this.getClassSymbol(implementation.node);
                    if (implementationSymbol !== null) {
                        return implementationSymbol;
                    }
                }
            }
            var innerDeclaration = esm2015_host_1.getInnerClassDeclaration(initializer);
            if (innerDeclaration !== null) {
                return this.createClassSymbol(declaration.name, innerDeclaration);
            }
            return undefined;
        };
        UmdReflectionHost.prototype.getClassSymbolFromInnerDeclaration = function (declaration) {
            var superClassSymbol = _super.prototype.getClassSymbolFromInnerDeclaration.call(this, declaration);
            if (superClassSymbol !== undefined) {
                return superClassSymbol;
            }
            if (!reflection_1.isNamedFunctionDeclaration(declaration)) {
                return undefined;
            }
            var outerNode = esm2015_host_1.getOuterNodeFromInnerDeclaration(declaration);
            if (outerNode === null || !commonjs_umd_utils_1.isExportsAssignment(outerNode)) {
                return undefined;
            }
            return this.createClassSymbol(outerNode.left.name, declaration);
        };
        /**
         * Extract all "classes" from the `statement` and add them to the `classes` map.
         */
        UmdReflectionHost.prototype.addClassSymbolsFromStatement = function (classes, statement) {
            _super.prototype.addClassSymbolsFromStatement.call(this, classes, statement);
            // Also check for exports of the form: `exports.<name> = <class def>;`
            if (commonjs_umd_utils_1.isExportsStatement(statement)) {
                var classSymbol = this.getClassSymbol(statement.expression.left);
                if (classSymbol) {
                    classes.set(classSymbol.implementation, classSymbol);
                }
            }
        };
        /**
         * Analyze the given statement to see if it corresponds with an exports declaration like
         * `exports.MyClass = MyClass_1 = <class def>;`. If so, the declaration of `MyClass_1`
         * is associated with the `MyClass` identifier.
         *
         * @param statement The statement that needs to be preprocessed.
         */
        UmdReflectionHost.prototype.preprocessStatement = function (statement) {
            _super.prototype.preprocessStatement.call(this, statement);
            if (!commonjs_umd_utils_1.isExportsStatement(statement)) {
                return;
            }
            var declaration = statement.expression.left;
            var initializer = statement.expression.right;
            if (!esm2015_host_1.isAssignment(initializer) || !ts.isIdentifier(initializer.left) ||
                !this.isClass(declaration)) {
                return;
            }
            var aliasedIdentifier = initializer.left;
            var aliasedDeclaration = this.getDeclarationOfIdentifier(aliasedIdentifier);
            if (aliasedDeclaration === null || aliasedDeclaration.node === null) {
                throw new Error("Unable to locate declaration of " + aliasedIdentifier.text + " in \"" + statement.getText() + "\"");
            }
            this.aliasedClassDeclarations.set(aliasedDeclaration.node, declaration.name);
        };
        UmdReflectionHost.prototype.computeUmdModule = function (sourceFile) {
            if (sourceFile.statements.length !== 1) {
                throw new Error("Expected UMD module file (" + sourceFile.fileName + ") to contain exactly one statement, " +
                    ("but found " + sourceFile.statements.length + "."));
            }
            return parseStatementForUmdModule(sourceFile.statements[0]);
        };
        UmdReflectionHost.prototype.computeExportsOfUmdModule = function (sourceFile) {
            var e_1, _a, e_2, _b;
            var moduleMap = new Map();
            try {
                for (var _c = tslib_1.__values(this.getModuleStatements(sourceFile)), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var statement = _d.value;
                    if (commonjs_umd_utils_1.isExportsStatement(statement)) {
                        var exportDeclaration = this.extractBasicUmdExportDeclaration(statement);
                        if (!moduleMap.has(exportDeclaration.name)) {
                            // We assume that the first `exports.<name>` is the actual declaration, and that any
                            // subsequent statements that match are decorating the original declaration.
                            // For example:
                            // ```
                            // exports.foo = <declaration>;
                            // exports.foo = __decorate(<decorator>, exports.foo);
                            // ```
                            // The declaration is the first line not the second.
                            moduleMap.set(exportDeclaration.name, exportDeclaration.declaration);
                        }
                    }
                    else if (commonjs_umd_utils_1.isWildcardReexportStatement(statement)) {
                        var reexports = this.extractUmdWildcardReexports(statement, sourceFile);
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
                        var exportDeclaration = this.extractUmdDefinePropertyExportDeclaration(statement);
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
        UmdReflectionHost.prototype.computeImportPath = function (param) {
            var e_3, _a;
            var umdModule = this.getUmdModule(param.getSourceFile());
            if (umdModule === null) {
                return null;
            }
            var imports = getImportsOfUmdModule(umdModule);
            if (imports === null) {
                return null;
            }
            var importPath = null;
            try {
                for (var imports_1 = tslib_1.__values(imports), imports_1_1 = imports_1.next(); !imports_1_1.done; imports_1_1 = imports_1.next()) {
                    var i = imports_1_1.value;
                    // Add all imports to the map to speed up future look ups.
                    this.umdImportPaths.set(i.parameter, i.path);
                    if (i.parameter === param) {
                        importPath = i.path;
                    }
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (imports_1_1 && !imports_1_1.done && (_a = imports_1.return)) _a.call(imports_1);
                }
                finally { if (e_3) throw e_3.error; }
            }
            return importPath;
        };
        UmdReflectionHost.prototype.extractBasicUmdExportDeclaration = function (statement) {
            var _a;
            var name = statement.expression.left.name.text;
            var exportExpression = commonjs_umd_utils_1.skipAliases(statement.expression.right);
            var declaration = (_a = this.getDeclarationOfExpression(exportExpression)) !== null && _a !== void 0 ? _a : {
                kind: 1 /* Inline */,
                node: statement.expression.left,
                implementation: statement.expression.right,
                known: null,
                viaModule: null,
            };
            return { name: name, declaration: declaration };
        };
        UmdReflectionHost.prototype.extractUmdWildcardReexports = function (statement, containingFile) {
            var reexportArg = statement.expression.arguments[0];
            var requireCall = commonjs_umd_utils_1.isRequireCall(reexportArg) ?
                reexportArg :
                ts.isIdentifier(reexportArg) ? commonjs_umd_utils_1.findRequireCallReference(reexportArg, this.checker) : null;
            var importPath = null;
            if (requireCall !== null) {
                importPath = requireCall.arguments[0].text;
            }
            else if (ts.isIdentifier(reexportArg)) {
                var importParameter = this.findUmdImportParameter(reexportArg);
                importPath = importParameter && this.getUmdImportPath(importParameter);
            }
            if (importPath === null) {
                return [];
            }
            var importedFile = this.resolveModuleName(importPath, containingFile);
            if (importedFile === undefined) {
                return [];
            }
            var importedExports = this.getExportsOfModule(importedFile);
            if (importedExports === null) {
                return [];
            }
            var viaModule = utils_1.stripExtension(importedFile.fileName);
            var reexports = [];
            importedExports.forEach(function (decl, name) { return reexports.push({ name: name, declaration: tslib_1.__assign(tslib_1.__assign({}, decl), { viaModule: viaModule }) }); });
            return reexports;
        };
        UmdReflectionHost.prototype.extractUmdDefinePropertyExportDeclaration = function (statement) {
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
        /**
         * Is the identifier a parameter on a UMD factory function, e.g. `function factory(this, core)`?
         * If so then return its declaration.
         */
        UmdReflectionHost.prototype.findUmdImportParameter = function (id) {
            var symbol = id && this.checker.getSymbolAtLocation(id) || null;
            var declaration = symbol && symbol.valueDeclaration;
            return declaration && ts.isParameter(declaration) ? declaration : null;
        };
        UmdReflectionHost.prototype.getUmdDeclaration = function (id) {
            var nsIdentifier = commonjs_umd_utils_1.findNamespaceOfIdentifier(id);
            if (nsIdentifier === null) {
                return null;
            }
            if (nsIdentifier.parent.parent && commonjs_umd_utils_1.isExportsAssignment(nsIdentifier.parent.parent)) {
                var initializer = nsIdentifier.parent.parent.right;
                if (ts.isIdentifier(initializer)) {
                    return this.getDeclarationOfIdentifier(initializer);
                }
                return this.detectKnownDeclaration({
                    kind: 1 /* Inline */,
                    node: nsIdentifier.parent.parent.left,
                    implementation: commonjs_umd_utils_1.skipAliases(nsIdentifier.parent.parent.right),
                    viaModule: null,
                    known: null,
                });
            }
            var moduleDeclaration = this.getUmdModuleDeclaration(nsIdentifier);
            if (moduleDeclaration === null || moduleDeclaration.node === null ||
                !ts.isSourceFile(moduleDeclaration.node)) {
                return null;
            }
            var moduleExports = this.getExportsOfModule(moduleDeclaration.node);
            if (moduleExports === null) {
                return null;
            }
            // We need to compute the `viaModule` because  the `getExportsOfModule()` call
            // did not know that we were importing the declaration.
            var declaration = moduleExports.get(id.text);
            if (!moduleExports.has(id.text)) {
                return null;
            }
            // We need to compute the `viaModule` because  the `getExportsOfModule()` call
            // did not know that we were importing the declaration.
            var viaModule = declaration.viaModule === null ? moduleDeclaration.viaModule : declaration.viaModule;
            return tslib_1.__assign(tslib_1.__assign({}, declaration), { viaModule: viaModule, known: utils_1.getTsHelperFnFromIdentifier(id) });
        };
        UmdReflectionHost.prototype.getExportsDeclaration = function (id) {
            if (!isExportsIdentifier(id)) {
                return null;
            }
            // Sadly, in the case of `exports.foo = bar`, we can't use `this.findUmdImportParameter(id)`
            // to check whether this `exports` is from the IIFE body arguments, because
            // `this.checker.getSymbolAtLocation(id)` will return the symbol for the `foo` identifier
            // rather than the `exports` identifier.
            //
            // Instead we search the symbols in the current local scope.
            var exportsSymbol = this.checker.getSymbolsInScope(id, ts.SymbolFlags.Variable)
                .find(function (symbol) { return symbol.name === 'exports'; });
            var node = exportsSymbol !== undefined &&
                !ts.isFunctionExpression(exportsSymbol.valueDeclaration.parent) ?
                // There is a locally defined `exports` variable that is not a function parameter.
                // So this `exports` identifier must be a local variable and does not represent the module.
                exportsSymbol.valueDeclaration :
                // There is no local symbol or it is a parameter of an IIFE.
                // So this `exports` represents the current "module".
                id.getSourceFile();
            return {
                kind: 0 /* Concrete */,
                node: node,
                viaModule: null,
                known: null,
                identity: null,
            };
        };
        UmdReflectionHost.prototype.getUmdModuleDeclaration = function (id) {
            var importPath = this.getImportPathFromParameter(id) || this.getImportPathFromRequireCall(id);
            if (importPath === null) {
                return null;
            }
            var module = this.resolveModuleName(importPath, id.getSourceFile());
            if (module === undefined) {
                return null;
            }
            var viaModule = commonjs_umd_utils_1.isExternalImport(importPath) ? importPath : null;
            return { kind: 0 /* Concrete */, node: module, viaModule: viaModule, known: null, identity: null };
        };
        UmdReflectionHost.prototype.getImportPathFromParameter = function (id) {
            var importParameter = this.findUmdImportParameter(id);
            if (importParameter === null) {
                return null;
            }
            return this.getUmdImportPath(importParameter);
        };
        UmdReflectionHost.prototype.getImportPathFromRequireCall = function (id) {
            var requireCall = commonjs_umd_utils_1.findRequireCallReference(id, this.checker);
            if (requireCall === null) {
                return null;
            }
            return requireCall.arguments[0].text;
        };
        /**
         * If this is an IIFE then try to grab the outer and inner classes otherwise fallback on the super
         * class.
         */
        UmdReflectionHost.prototype.getDeclarationOfExpression = function (expression) {
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
        UmdReflectionHost.prototype.resolveModuleName = function (moduleName, containingFile) {
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
        return UmdReflectionHost;
    }(esm5_host_1.Esm5ReflectionHost));
    exports.UmdReflectionHost = UmdReflectionHost;
    function parseStatementForUmdModule(statement) {
        var wrapperCall = getUmdWrapperCall(statement);
        if (!wrapperCall)
            return null;
        var wrapperFn = wrapperCall.expression;
        if (!ts.isFunctionExpression(wrapperFn))
            return null;
        var factoryFnParamIndex = wrapperFn.parameters.findIndex(function (parameter) { return ts.isIdentifier(parameter.name) && parameter.name.text === 'factory'; });
        if (factoryFnParamIndex === -1)
            return null;
        var factoryFn = utils_2.stripParentheses(wrapperCall.arguments[factoryFnParamIndex]);
        if (!factoryFn || !ts.isFunctionExpression(factoryFn))
            return null;
        return { wrapperFn: wrapperFn, factoryFn: factoryFn };
    }
    exports.parseStatementForUmdModule = parseStatementForUmdModule;
    function getUmdWrapperCall(statement) {
        if (!ts.isExpressionStatement(statement) || !ts.isParenthesizedExpression(statement.expression) ||
            !ts.isCallExpression(statement.expression.expression) ||
            !ts.isFunctionExpression(statement.expression.expression.expression)) {
            return null;
        }
        return statement.expression.expression;
    }
    function getImportsOfUmdModule(umdModule) {
        var imports = [];
        for (var i = 1; i < umdModule.factoryFn.parameters.length; i++) {
            imports.push({
                parameter: umdModule.factoryFn.parameters[i],
                path: getRequiredModulePath(umdModule.wrapperFn, i)
            });
        }
        return imports;
    }
    exports.getImportsOfUmdModule = getImportsOfUmdModule;
    function getRequiredModulePath(wrapperFn, paramIndex) {
        var statement = wrapperFn.body.statements[0];
        if (!ts.isExpressionStatement(statement)) {
            throw new Error('UMD wrapper body is not an expression statement:\n' + wrapperFn.body.getText());
        }
        var modulePaths = [];
        findModulePaths(statement.expression);
        // Since we were only interested in the `require()` calls, we miss the `exports` argument, so we
        // need to subtract 1.
        // E.g. `function(exports, dep1, dep2)` maps to `function(exports, require('path/to/dep1'),
        // require('path/to/dep2'))`
        return modulePaths[paramIndex - 1];
        // Search the statement for calls to `require('...')` and extract the string value of the first
        // argument
        function findModulePaths(node) {
            if (commonjs_umd_utils_1.isRequireCall(node)) {
                var argument = node.arguments[0];
                if (ts.isStringLiteral(argument)) {
                    modulePaths.push(argument.text);
                }
            }
            else {
                node.forEachChild(findModulePaths);
            }
        }
    }
    /**
     * Is the `node` an identifier with the name "exports"?
     */
    function isExportsIdentifier(node) {
        return ts.isIdentifier(node) && node.text === 'exports';
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW1kX2hvc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbmdjYy9zcmMvaG9zdC91bWRfaG9zdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgsK0JBQWlDO0lBRWpDLDJFQUE0RDtJQUU1RCx5RUFBK0c7SUFFL0csOERBQWlGO0lBRWpGLDZGQUFrWTtJQUNsWSxpRkFBd0c7SUFDeEcsMkVBQStDO0lBRS9DLG1FQUF5QztJQUV6QztRQUF1Qyw2Q0FBa0I7UUFVdkQsMkJBQVksTUFBYyxFQUFFLE1BQWUsRUFBRSxHQUFrQixFQUFFLEdBQThCO1lBQTlCLG9CQUFBLEVBQUEsVUFBOEI7WUFBL0YsWUFDRSxrQkFBTSxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsU0FHaEM7WUFiUyxnQkFBVSxHQUNoQixJQUFJLGtCQUFVLENBQWdDLFVBQUEsRUFBRSxJQUFJLE9BQUEsS0FBSSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsQ0FBQyxFQUF6QixDQUF5QixDQUFDLENBQUM7WUFDekUsZ0JBQVUsR0FBRyxJQUFJLGtCQUFVLENBQ2pDLFVBQUEsRUFBRSxJQUFJLE9BQUEsS0FBSSxDQUFDLHlCQUF5QixDQUFDLEVBQUUsQ0FBQyxFQUFsQyxDQUFrQyxDQUFDLENBQUM7WUFDcEMsb0JBQWMsR0FDcEIsSUFBSSxrQkFBVSxDQUF1QyxVQUFBLEtBQUssSUFBSSxPQUFBLEtBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsRUFBN0IsQ0FBNkIsQ0FBQyxDQUFDO1lBTS9GLEtBQUksQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQztZQUMzQixLQUFJLENBQUMsWUFBWSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUM7O1FBQy9CLENBQUM7UUFFRCxpREFBcUIsR0FBckIsVUFBc0IsRUFB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QjtRQUN0QiwyRkFBMkY7UUFDM0YsNEJBQTRCO1FBQzVCLE9BQU8sV0FBVyxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUVuQywrRkFBK0Y7UUFDL0YsV0FBVztRQUNYLFNBQVMsZUFBZSxDQUFDLElBQWE7WUFDcEMsSUFBSSxrQ0FBYSxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUN2QixJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNuQyxJQUFJLEVBQUUsQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLEVBQUU7b0JBQ2hDLFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUNqQzthQUNGO2lCQUFNO2dCQUNMLElBQUksQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLENBQUM7YUFDcEM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztJQUVEOztPQUVHO0lBQ0gsU0FBUyxtQkFBbUIsQ0FBQyxJQUFhO1FBQ3hDLE9BQU8sRUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLFNBQVMsQ0FBQztJQUMxRCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQge2Fic29sdXRlRnJvbX0gZnJvbSAnLi4vLi4vLi4vc3JjL25ndHNjL2ZpbGVfc3lzdGVtJztcbmltcG9ydCB7TG9nZ2VyfSBmcm9tICcuLi8uLi8uLi9zcmMvbmd0c2MvbG9nZ2luZyc7XG5pbXBvcnQge0RlY2xhcmF0aW9uLCBEZWNsYXJhdGlvbktpbmQsIEltcG9ydCwgaXNOYW1lZEZ1bmN0aW9uRGVjbGFyYXRpb259IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy9yZWZsZWN0aW9uJztcbmltcG9ydCB7QnVuZGxlUHJvZ3JhbX0gZnJvbSAnLi4vcGFja2FnZXMvYnVuZGxlX3Byb2dyYW0nO1xuaW1wb3J0IHtGYWN0b3J5TWFwLCBnZXRUc0hlbHBlckZuRnJvbUlkZW50aWZpZXIsIHN0cmlwRXh0ZW5zaW9ufSBmcm9tICcuLi91dGlscyc7XG5cbmltcG9ydCB7RGVmaW5lUHJvcGVydHlSZWV4cG9ydFN0YXRlbWVudCwgRXhwb3J0RGVjbGFyYXRpb24sIEV4cG9ydHNTdGF0ZW1lbnQsIGV4dHJhY3RHZXR0ZXJGbkV4cHJlc3Npb24sIGZpbmROYW1lc3BhY2VPZklkZW50aWZpZXIsIGZpbmRSZXF1aXJlQ2FsbFJlZmVyZW5jZSwgaXNEZWZpbmVQcm9wZXJ0eVJlZXhwb3J0U3RhdGVtZW50LCBpc0V4cG9ydHNBc3NpZ25tZW50LCBpc0V4cG9ydHNEZWNsYXJhdGlvbiwgaXNFeHBvcnRzU3RhdGVtZW50LCBpc0V4dGVybmFsSW1wb3J0LCBpc1JlcXVpcmVDYWxsLCBpc1dpbGRjYXJkUmVleHBvcnRTdGF0ZW1lbnQsIHNraXBBbGlhc2VzLCBXaWxkY2FyZFJlZXhwb3J0U3RhdGVtZW50fSBmcm9tICcuL2NvbW1vbmpzX3VtZF91dGlscyc7XG5pbXBvcnQge2dldElubmVyQ2xhc3NEZWNsYXJhdGlvbiwgZ2V0T3V0ZXJOb2RlRnJvbUlubmVyRGVjbGFyYXRpb24sIGlzQXNzaWdubWVudH0gZnJvbSAnLi9lc20yMDE1X2hvc3QnO1xuaW1wb3J0IHtFc201UmVmbGVjdGlvbkhvc3R9IGZyb20gJy4vZXNtNV9ob3N0JztcbmltcG9ydCB7TmdjY0NsYXNzU3ltYm9sfSBmcm9tICcuL25nY2NfaG9zdCc7XG5pbXBvcnQge3N0cmlwUGFyZW50aGVzZXN9IGZyb20gJy4vdXRpbHMnO1xuXG5leHBvcnQgY2xhc3MgVW1kUmVmbGVjdGlvbkhvc3QgZXh0ZW5kcyBFc201UmVmbGVjdGlvbkhvc3Qge1xuICBwcm90ZWN0ZWQgdW1kTW9kdWxlcyA9XG4gICAgICBuZXcgRmFjdG9yeU1hcDx0cy5Tb3VyY2VGaWxlLCBVbWRNb2R1bGV8bnVsbD4oc2YgPT4gdGhpcy5jb21wdXRlVW1kTW9kdWxlKHNmKSk7XG4gIHByb3RlY3RlZCB1bWRFeHBvcnRzID0gbmV3IEZhY3RvcnlNYXA8dHMuU291cmNlRmlsZSwgTWFwPHN0cmluZywgRGVjbGFyYXRpb24+fG51bGw+KFxuICAgICAgc2YgPT4gdGhpcy5jb21wdXRlRXhwb3J0c09mVW1kTW9kdWxlKHNmKSk7XG4gIHByb3RlY3RlZCB1bWRJbXBvcnRQYXRocyA9XG4gICAgICBuZXcgRmFjdG9yeU1hcDx0cy5QYXJhbWV0ZXJEZWNsYXJhdGlvbiwgc3RyaW5nfG51bGw+KHBhcmFtID0+IHRoaXMuY29tcHV0ZUltcG9ydFBhdGgocGFyYW0pKTtcbiAgcHJvdGVjdGVkIHByb2dyYW06IHRzLlByb2dyYW07XG4gIHByb3RlY3RlZCBjb21waWxlckhvc3Q6IHRzLkNvbXBpbGVySG9zdDtcblxuICBjb25zdHJ1Y3Rvcihsb2dnZXI6IExvZ2dlciwgaXNDb3JlOiBib29sZWFuLCBzcmM6IEJ1bmRsZVByb2dyYW0sIGR0czogQnVuZGxlUHJvZ3JhbXxudWxsID0gbnVsbCkge1xuICAgIHN1cGVyKGxvZ2dlciwgaXNDb3JlLCBzcmMsIGR0cyk7XG4gICAgdGhpcy5wcm9ncmFtID0gc3JjLnByb2dyYW07XG4gICAgdGhpcy5jb21waWxlckhvc3QgPSBzcmMuaG9zdDtcbiAgfVxuXG4gIGdldEltcG9ydE9mSWRlbnRpZmllcihpZDogdHMuSWRlbnRpZmllcik6IEltcG9ydHxudWxsIHtcbiAgICAvLyBJcyBgaWRgIGEgbmFtZXNwYWNlZCBwcm9wZXJ0eSBhY2Nlc3MsIGUuZy4gYERpcmVjdGl2ZWAgaW4gYGNvcmUuRGlyZWN0aXZlYD9cbiAgICAvLyBJZiBzbyBjYXB0dXJlIHRoZSBzeW1ib2wgb2YgdGhlIG5hbWVzcGFjZSwgZS5nLiBgY29yZWAuXG4gICAgY29uc3QgbnNJZGVudGlmaWVyID0gZmluZE5hbWVzcGFjZU9mSWRlbnRpZmllcihpZCk7XG4gICAgY29uc3QgaW1wb3J0UGFyYW1ldGVyID0gbnNJZGVudGlmaWVyICYmIHRoaXMuZmluZFVtZEltcG9ydFBhcmFtZXRlcihuc0lkZW50aWZpZXIpO1xuICAgIGNvbnN0IGZyb20gPSBpbXBvcnRQYXJhbWV0ZXIgJiYgdGhpcy5nZXRVbWRJbXBvcnRQYXRoKGltcG9ydFBhcmFtZXRlcik7XG4gICAgcmV0dXJuIGZyb20gIT09IG51bGwgPyB7ZnJvbSwgbmFtZTogaWQudGV4dH0gOiBudWxsO1xuICB9XG5cbiAgZ2V0RGVjbGFyYXRpb25PZklkZW50aWZpZXIoaWQ6IHRzLklkZW50aWZpZXIpOiBEZWNsYXJhdGlvbnxudWxsIHtcbiAgICAvLyBGaXJzdCB3ZSB0cnkgb25lIG9mIHRoZSBmb2xsb3dpbmc6XG4gICAgLy8gMS4gVGhlIGBleHBvcnRzYCBpZGVudGlmaWVyIC0gcmVmZXJyaW5nIHRvIHRoZSBjdXJyZW50IGZpbGUvbW9kdWxlLlxuICAgIC8vIDIuIEFuIGlkZW50aWZpZXIgKGUuZy4gYGZvb2ApIHRoYXQgcmVmZXJzIHRvIGFuIGltcG9ydGVkIFVNRCBtb2R1bGUuXG4gICAgLy8gMy4gQSBVTUQgc3R5bGUgZXhwb3J0IGlkZW50aWZpZXIgKGUuZy4gdGhlIGBmb29gIG9mIGBleHBvcnRzLmZvb2ApLlxuICAgIGNvbnN0IGRlY2xhcmF0aW9uID0gdGhpcy5nZXRFeHBvcnRzRGVjbGFyYXRpb24oaWQpIHx8IHRoaXMuZ2V0VW1kTW9kdWxlRGVjbGFyYXRpb24oaWQpIHx8XG4gICAgICAgIHRoaXMuZ2V0VW1kRGVjbGFyYXRpb24oaWQpO1xuICAgIGlmIChkZWNsYXJhdGlvbiAhPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGRlY2xhcmF0aW9uO1xuICAgIH1cblxuICAgIC8vIFRyeSB0byBnZXQgdGhlIGRlY2xhcmF0aW9uIHVzaW5nIHRoZSBzdXBlciBjbGFzcy5cbiAgICBjb25zdCBzdXBlckRlY2xhcmF0aW9uID0gc3VwZXIuZ2V0RGVjbGFyYXRpb25PZklkZW50aWZpZXIoaWQpO1xuICAgIGlmIChzdXBlckRlY2xhcmF0aW9uID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBDaGVjayB0byBzZWUgaWYgdGhlIGRlY2xhcmF0aW9uIGlzIHRoZSBpbm5lciBub2RlIG9mIGEgZGVjbGFyYXRpb24gSUlGRS5cbiAgICBjb25zdCBvdXRlck5vZGUgPSBnZXRPdXRlck5vZGVGcm9tSW5uZXJEZWNsYXJhdGlvbihzdXBlckRlY2xhcmF0aW9uLm5vZGUpO1xuICAgIGlmIChvdXRlck5vZGUgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBzdXBlckRlY2xhcmF0aW9uO1xuICAgIH1cblxuICAgIC8vIFdlIGFyZSBvbmx5IGludGVyZXN0ZWQgaWYgdGhlIG91dGVyIGRlY2xhcmF0aW9uIGlzIG9mIHRoZSBmb3JtXG4gICAgLy8gYGV4cG9ydHMuPG5hbWU+ID0gPGluaXRpYWxpemVyPmAuXG4gICAgaWYgKCFpc0V4cG9ydHNBc3NpZ25tZW50KG91dGVyTm9kZSkpIHtcbiAgICAgIHJldHVybiBzdXBlckRlY2xhcmF0aW9uO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBraW5kOiBEZWNsYXJhdGlvbktpbmQuSW5saW5lLFxuICAgICAgbm9kZTogb3V0ZXJOb2RlLmxlZnQsXG4gICAgICBpbXBsZW1lbnRhdGlvbjogb3V0ZXJOb2RlLnJpZ2h0LFxuICAgICAga25vd246IG51bGwsXG4gICAgICB2aWFNb2R1bGU6IG51bGwsXG4gICAgfTtcbiAgfVxuXG4gIGdldEV4cG9ydHNPZk1vZHVsZShtb2R1bGU6IHRzLk5vZGUpOiBNYXA8c3RyaW5nLCBEZWNsYXJhdGlvbj58bnVsbCB7XG4gICAgcmV0dXJuIHN1cGVyLmdldEV4cG9ydHNPZk1vZHVsZShtb2R1bGUpIHx8IHRoaXMudW1kRXhwb3J0cy5nZXQobW9kdWxlLmdldFNvdXJjZUZpbGUoKSk7XG4gIH1cblxuICBnZXRVbWRNb2R1bGUoc291cmNlRmlsZTogdHMuU291cmNlRmlsZSk6IFVtZE1vZHVsZXxudWxsIHtcbiAgICBpZiAoc291cmNlRmlsZS5pc0RlY2xhcmF0aW9uRmlsZSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMudW1kTW9kdWxlcy5nZXQoc291cmNlRmlsZSk7XG4gIH1cblxuICBnZXRVbWRJbXBvcnRQYXRoKGltcG9ydFBhcmFtZXRlcjogdHMuUGFyYW1ldGVyRGVjbGFyYXRpb24pOiBzdHJpbmd8bnVsbCB7XG4gICAgcmV0dXJuIHRoaXMudW1kSW1wb3J0UGF0aHMuZ2V0KGltcG9ydFBhcmFtZXRlcik7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSB0b3AgbGV2ZWwgc3RhdGVtZW50cyBmb3IgYSBtb2R1bGUuXG4gICAqXG4gICAqIEluIFVNRCBtb2R1bGVzIHRoZXNlIGFyZSB0aGUgYm9keSBvZiB0aGUgVU1EIGZhY3RvcnkgZnVuY3Rpb24uXG4gICAqXG4gICAqIEBwYXJhbSBzb3VyY2VGaWxlIFRoZSBtb2R1bGUgd2hvc2Ugc3RhdGVtZW50cyB3ZSB3YW50LlxuICAgKiBAcmV0dXJucyBBbiBhcnJheSBvZiB0b3AgbGV2ZWwgc3RhdGVtZW50cyBmb3IgdGhlIGdpdmVuIG1vZHVsZS5cbiAgICovXG4gIHByb3RlY3RlZCBnZXRNb2R1bGVTdGF0ZW1lbnRzKHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUpOiB0cy5TdGF0ZW1lbnRbXSB7XG4gICAgY29uc3QgdW1kTW9kdWxlID0gdGhpcy5nZXRVbWRNb2R1bGUoc291cmNlRmlsZSk7XG4gICAgcmV0dXJuIHVtZE1vZHVsZSAhPT0gbnVsbCA/IEFycmF5LmZyb20odW1kTW9kdWxlLmZhY3RvcnlGbi5ib2R5LnN0YXRlbWVudHMpIDogW107XG4gIH1cblxuICBwcm90ZWN0ZWQgZ2V0Q2xhc3NTeW1ib2xGcm9tT3V0ZXJEZWNsYXJhdGlvbihkZWNsYXJhdGlvbjogdHMuTm9kZSk6IE5nY2NDbGFzc1N5bWJvbHx1bmRlZmluZWQge1xuICAgIGNvbnN0IHN1cGVyU3ltYm9sID0gc3VwZXIuZ2V0Q2xhc3NTeW1ib2xGcm9tT3V0ZXJEZWNsYXJhdGlvbihkZWNsYXJhdGlvbik7XG4gICAgaWYgKHN1cGVyU3ltYm9sKSB7XG4gICAgICByZXR1cm4gc3VwZXJTeW1ib2w7XG4gICAgfVxuXG4gICAgaWYgKCFpc0V4cG9ydHNEZWNsYXJhdGlvbihkZWNsYXJhdGlvbikpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgbGV0IGluaXRpYWxpemVyID0gc2tpcEFsaWFzZXMoZGVjbGFyYXRpb24ucGFyZW50LnJpZ2h0KTtcblxuICAgIGlmICh0cy5pc0lkZW50aWZpZXIoaW5pdGlhbGl6ZXIpKSB7XG4gICAgICBjb25zdCBpbXBsZW1lbnRhdGlvbiA9IHRoaXMuZ2V0RGVjbGFyYXRpb25PZklkZW50aWZpZXIoaW5pdGlhbGl6ZXIpO1xuICAgICAgaWYgKGltcGxlbWVudGF0aW9uICE9PSBudWxsKSB7XG4gICAgICAgIGNvbnN0IGltcGxlbWVudGF0aW9uU3ltYm9sID0gdGhpcy5nZXRDbGFzc1N5bWJvbChpbXBsZW1lbnRhdGlvbi5ub2RlKTtcbiAgICAgICAgaWYgKGltcGxlbWVudGF0aW9uU3ltYm9sICE9PSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIGltcGxlbWVudGF0aW9uU3ltYm9sO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgaW5uZXJEZWNsYXJhdGlvbiA9IGdldElubmVyQ2xhc3NEZWNsYXJhdGlvbihpbml0aWFsaXplcik7XG4gICAgaWYgKGlubmVyRGVjbGFyYXRpb24gIT09IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzLmNyZWF0ZUNsYXNzU3ltYm9sKGRlY2xhcmF0aW9uLm5hbWUsIGlubmVyRGVjbGFyYXRpb24pO1xuICAgIH1cblxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuXG4gIHByb3RlY3RlZCBnZXRDbGFzc1N5bWJvbEZyb21Jbm5lckRlY2xhcmF0aW9uKGRlY2xhcmF0aW9uOiB0cy5Ob2RlKTogTmdjY0NsYXNzU3ltYm9sfHVuZGVmaW5lZCB7XG4gICAgY29uc3Qgc3VwZXJDbGFzc1N5bWJvbCA9IHN1cGVyLmdldENsYXNzU3ltYm9sRnJvbUlubmVyRGVjbGFyYXRpb24oZGVjbGFyYXRpb24pO1xuICAgIGlmIChzdXBlckNsYXNzU3ltYm9sICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBzdXBlckNsYXNzU3ltYm9sO1xuICAgIH1cblxuICAgIGlmICghaXNOYW1lZEZ1bmN0aW9uRGVjbGFyYXRpb24oZGVjbGFyYXRpb24pKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGNvbnN0IG91dGVyTm9kZSA9IGdldE91dGVyTm9kZUZyb21Jbm5lckRlY2xhcmF0aW9uKGRlY2xhcmF0aW9uKTtcbiAgICBpZiAob3V0ZXJOb2RlID09PSBudWxsIHx8ICFpc0V4cG9ydHNBc3NpZ25tZW50KG91dGVyTm9kZSkpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuY3JlYXRlQ2xhc3NTeW1ib2wob3V0ZXJOb2RlLmxlZnQubmFtZSwgZGVjbGFyYXRpb24pO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4dHJhY3QgYWxsIFwiY2xhc3Nlc1wiIGZyb20gdGhlIGBzdGF0ZW1lbnRgIGFuZCBhZGQgdGhlbSB0byB0aGUgYGNsYXNzZXNgIG1hcC5cbiAgICovXG4gIHByb3RlY3RlZCBhZGRDbGFzc1N5bWJvbHNGcm9tU3RhdGVtZW50KFxuICAgICAgY2xhc3NlczogTWFwPHRzLlN5bWJvbCwgTmdjY0NsYXNzU3ltYm9sPiwgc3RhdGVtZW50OiB0cy5TdGF0ZW1lbnQpOiB2b2lkIHtcbiAgICBzdXBlci5hZGRDbGFzc1N5bWJvbHNGcm9tU3RhdGVtZW50KGNsYXNzZXMsIHN0YXRlbWVudCk7XG5cbiAgICAvLyBBbHNvIGNoZWNrIGZvciBleHBvcnRzIG9mIHRoZSBmb3JtOiBgZXhwb3J0cy48bmFtZT4gPSA8Y2xhc3MgZGVmPjtgXG4gICAgaWYgKGlzRXhwb3J0c1N0YXRlbWVudChzdGF0ZW1lbnQpKSB7XG4gICAgICBjb25zdCBjbGFzc1N5bWJvbCA9IHRoaXMuZ2V0Q2xhc3NTeW1ib2woc3RhdGVtZW50LmV4cHJlc3Npb24ubGVmdCk7XG4gICAgICBpZiAoY2xhc3NTeW1ib2wpIHtcbiAgICAgICAgY2xhc3Nlcy5zZXQoY2xhc3NTeW1ib2wuaW1wbGVtZW50YXRpb24sIGNsYXNzU3ltYm9sKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQW5hbHl6ZSB0aGUgZ2l2ZW4gc3RhdGVtZW50IHRvIHNlZSBpZiBpdCBjb3JyZXNwb25kcyB3aXRoIGFuIGV4cG9ydHMgZGVjbGFyYXRpb24gbGlrZVxuICAgKiBgZXhwb3J0cy5NeUNsYXNzID0gTXlDbGFzc18xID0gPGNsYXNzIGRlZj47YC4gSWYgc28sIHRoZSBkZWNsYXJhdGlvbiBvZiBgTXlDbGFzc18xYFxuICAgKiBpcyBhc3NvY2lhdGVkIHdpdGggdGhlIGBNeUNsYXNzYCBpZGVudGlmaWVyLlxuICAgKlxuICAgKiBAcGFyYW0gc3RhdGVtZW50IFRoZSBzdGF0ZW1lbnQgdGhhdCBuZWVkcyB0byBiZSBwcmVwcm9jZXNzZWQuXG4gICAqL1xuICBwcm90ZWN0ZWQgcHJlcHJvY2Vzc1N0YXRlbWVudChzdGF0ZW1lbnQ6IHRzLlN0YXRlbWVudCk6IHZvaWQge1xuICAgIHN1cGVyLnByZXByb2Nlc3NTdGF0ZW1lbnQoc3RhdGVtZW50KTtcblxuICAgIGlmICghaXNFeHBvcnRzU3RhdGVtZW50KHN0YXRlbWVudCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBkZWNsYXJhdGlvbiA9IHN0YXRlbWVudC5leHByZXNzaW9uLmxlZnQ7XG4gICAgY29uc3QgaW5pdGlhbGl6ZXIgPSBzdGF0ZW1lbnQuZXhwcmVzc2lvbi5yaWdodDtcbiAgICBpZiAoIWlzQXNzaWdubWVudChpbml0aWFsaXplcikgfHwgIXRzLmlzSWRlbnRpZmllcihpbml0aWFsaXplci5sZWZ0KSB8fFxuICAgICAgICAhdGhpcy5pc0NsYXNzKGRlY2xhcmF0aW9uKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGFsaWFzZWRJZGVudGlmaWVyID0gaW5pdGlhbGl6ZXIubGVmdDtcblxuICAgIGNvbnN0IGFsaWFzZWREZWNsYXJhdGlvbiA9IHRoaXMuZ2V0RGVjbGFyYXRpb25PZklkZW50aWZpZXIoYWxpYXNlZElkZW50aWZpZXIpO1xuICAgIGlmIChhbGlhc2VkRGVjbGFyYXRpb24gPT09IG51bGwgfHwgYWxpYXNlZERlY2xhcmF0aW9uLm5vZGUgPT09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgVW5hYmxlIHRvIGxvY2F0ZSBkZWNsYXJhdGlvbiBvZiAke2FsaWFzZWRJZGVudGlmaWVyLnRleHR9IGluIFwiJHtzdGF0ZW1lbnQuZ2V0VGV4dCgpfVwiYCk7XG4gICAgfVxuICAgIHRoaXMuYWxpYXNlZENsYXNzRGVjbGFyYXRpb25zLnNldChhbGlhc2VkRGVjbGFyYXRpb24ubm9kZSwgZGVjbGFyYXRpb24ubmFtZSk7XG4gIH1cblxuICBwcml2YXRlIGNvbXB1dGVVbWRNb2R1bGUoc291cmNlRmlsZTogdHMuU291cmNlRmlsZSk6IFVtZE1vZHVsZXxudWxsIHtcbiAgICBpZiAoc291cmNlRmlsZS5zdGF0ZW1lbnRzLmxlbmd0aCAhPT0gMSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBFeHBlY3RlZCBVTUQgbW9kdWxlIGZpbGUgKCR7c291cmNlRmlsZS5maWxlTmFtZX0pIHRvIGNvbnRhaW4gZXhhY3RseSBvbmUgc3RhdGVtZW50LCBgICtcbiAgICAgICAgICBgYnV0IGZvdW5kICR7c291cmNlRmlsZS5zdGF0ZW1lbnRzLmxlbmd0aH0uYCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHBhcnNlU3RhdGVtZW50Rm9yVW1kTW9kdWxlKHNvdXJjZUZpbGUuc3RhdGVtZW50c1swXSk7XG4gIH1cblxuICBwcml2YXRlIGNvbXB1dGVFeHBvcnRzT2ZVbWRNb2R1bGUoc291cmNlRmlsZTogdHMuU291cmNlRmlsZSk6IE1hcDxzdHJpbmcsIERlY2xhcmF0aW9uPnxudWxsIHtcbiAgICBjb25zdCBtb2R1bGVNYXAgPSBuZXcgTWFwPHN0cmluZywgRGVjbGFyYXRpb24+KCk7XG4gICAgZm9yIChjb25zdCBzdGF0ZW1lbnQgb2YgdGhpcy5nZXRNb2R1bGVTdGF0ZW1lbnRzKHNvdXJjZUZpbGUpKSB7XG4gICAgICBpZiAoaXNFeHBvcnRzU3RhdGVtZW50KHN0YXRlbWVudCkpIHtcbiAgICAgICAgY29uc3QgZXhwb3J0RGVjbGFyYXRpb24gPSB0aGlzLmV4dHJhY3RCYXNpY1VtZEV4cG9ydERlY2xhcmF0aW9uKHN0YXRlbWVudCk7XG4gICAgICAgIGlmICghbW9kdWxlTWFwLmhhcyhleHBvcnREZWNsYXJhdGlvbi5uYW1lKSkge1xuICAgICAgICAgIC8vIFdlIGFzc3VtZSB0aGF0IHRoZSBmaXJzdCBgZXhwb3J0cy48bmFtZT5gIGlzIHRoZSBhY3R1YWwgZGVjbGFyYXRpb24sIGFuZCB0aGF0IGFueVxuICAgICAgICAgIC8vIHN1YnNlcXVlbnQgc3RhdGVtZW50cyB0aGF0IG1hdGNoIGFyZSBkZWNvcmF0aW5nIHRoZSBvcmlnaW5hbCBkZWNsYXJhdGlvbi5cbiAgICAgICAgICAvLyBGb3IgZXhhbXBsZTpcbiAgICAgICAgICAvLyBgYGBcbiAgICAgICAgICAvLyBleHBvcnRzLmZvbyA9IDxkZWNsYXJhdGlvbj47XG4gICAgICAgICAgLy8gZXhwb3J0cy5mb28gPSBfX2RlY29yYXRlKDxkZWNvcmF0b3I+LCBleHBvcnRzLmZvbyk7XG4gICAgICAgICAgLy8gYGBgXG4gICAgICAgICAgLy8gVGhlIGRlY2xhcmF0aW9uIGlzIHRoZSBmaXJzdCBsaW5lIG5vdCB0aGUgc2Vjb25kLlxuICAgICAgICAgIG1vZHVsZU1hcC5zZXQoZXhwb3J0RGVjbGFyYXRpb24ubmFtZSwgZXhwb3J0RGVjbGFyYXRpb24uZGVjbGFyYXRpb24pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGlzV2lsZGNhcmRSZWV4cG9ydFN0YXRlbWVudChzdGF0ZW1lbnQpKSB7XG4gICAgICAgIGNvbnN0IHJlZXhwb3J0cyA9IHRoaXMuZXh0cmFjdFVtZFdpbGRjYXJkUmVleHBvcnRzKHN0YXRlbWVudCwgc291cmNlRmlsZSk7XG4gICAgICAgIGZvciAoY29uc3QgcmVleHBvcnQgb2YgcmVleHBvcnRzKSB7XG4gICAgICAgICAgbW9kdWxlTWFwLnNldChyZWV4cG9ydC5uYW1lLCByZWV4cG9ydC5kZWNsYXJhdGlvbik7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoaXNEZWZpbmVQcm9wZXJ0eVJlZXhwb3J0U3RhdGVtZW50KHN0YXRlbWVudCkpIHtcbiAgICAgICAgY29uc3QgZXhwb3J0RGVjbGFyYXRpb24gPSB0aGlzLmV4dHJhY3RVbWREZWZpbmVQcm9wZXJ0eUV4cG9ydERlY2xhcmF0aW9uKHN0YXRlbWVudCk7XG4gICAgICAgIGlmIChleHBvcnREZWNsYXJhdGlvbiAhPT0gbnVsbCkge1xuICAgICAgICAgIG1vZHVsZU1hcC5zZXQoZXhwb3J0RGVjbGFyYXRpb24ubmFtZSwgZXhwb3J0RGVjbGFyYXRpb24uZGVjbGFyYXRpb24pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBtb2R1bGVNYXA7XG4gIH1cblxuICBwcml2YXRlIGNvbXB1dGVJbXBvcnRQYXRoKHBhcmFtOiB0cy5QYXJhbWV0ZXJEZWNsYXJhdGlvbik6IHN0cmluZ3xudWxsIHtcbiAgICBjb25zdCB1bWRNb2R1bGUgPSB0aGlzLmdldFVtZE1vZHVsZShwYXJhbS5nZXRTb3VyY2VGaWxlKCkpO1xuICAgIGlmICh1bWRNb2R1bGUgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IGltcG9ydHMgPSBnZXRJbXBvcnRzT2ZVbWRNb2R1bGUodW1kTW9kdWxlKTtcbiAgICBpZiAoaW1wb3J0cyA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgbGV0IGltcG9ydFBhdGg6IHN0cmluZ3xudWxsID0gbnVsbDtcblxuICAgIGZvciAoY29uc3QgaSBvZiBpbXBvcnRzKSB7XG4gICAgICAvLyBBZGQgYWxsIGltcG9ydHMgdG8gdGhlIG1hcCB0byBzcGVlZCB1cCBmdXR1cmUgbG9vayB1cHMuXG4gICAgICB0aGlzLnVtZEltcG9ydFBhdGhzLnNldChpLnBhcmFtZXRlciwgaS5wYXRoKTtcbiAgICAgIGlmIChpLnBhcmFtZXRlciA9PT0gcGFyYW0pIHtcbiAgICAgICAgaW1wb3J0UGF0aCA9IGkucGF0aDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gaW1wb3J0UGF0aDtcbiAgfVxuXG4gIHByaXZhdGUgZXh0cmFjdEJhc2ljVW1kRXhwb3J0RGVjbGFyYXRpb24oc3RhdGVtZW50OiBFeHBvcnRzU3RhdGVtZW50KTogRXhwb3J0RGVjbGFyYXRpb24ge1xuICAgIGNvbnN0IG5hbWUgPSBzdGF0ZW1lbnQuZXhwcmVzc2lvbi5sZWZ0Lm5hbWUudGV4dDtcbiAgICBjb25zdCBleHBvcnRFeHByZXNzaW9uID0gc2tpcEFsaWFzZXMoc3RhdGVtZW50LmV4cHJlc3Npb24ucmlnaHQpO1xuICAgIGNvbnN0IGRlY2xhcmF0aW9uID0gdGhpcy5nZXREZWNsYXJhdGlvbk9mRXhwcmVzc2lvbihleHBvcnRFeHByZXNzaW9uKSA/PyB7XG4gICAgICBraW5kOiBEZWNsYXJhdGlvbktpbmQuSW5saW5lLFxuICAgICAgbm9kZTogc3RhdGVtZW50LmV4cHJlc3Npb24ubGVmdCxcbiAgICAgIGltcGxlbWVudGF0aW9uOiBzdGF0ZW1lbnQuZXhwcmVzc2lvbi5yaWdodCxcbiAgICAgIGtub3duOiBudWxsLFxuICAgICAgdmlhTW9kdWxlOiBudWxsLFxuICAgIH07XG4gICAgcmV0dXJuIHtuYW1lLCBkZWNsYXJhdGlvbn07XG4gIH1cblxuICBwcml2YXRlIGV4dHJhY3RVbWRXaWxkY2FyZFJlZXhwb3J0cyhcbiAgICAgIHN0YXRlbWVudDogV2lsZGNhcmRSZWV4cG9ydFN0YXRlbWVudCwgY29udGFpbmluZ0ZpbGU6IHRzLlNvdXJjZUZpbGUpOiBFeHBvcnREZWNsYXJhdGlvbltdIHtcbiAgICBjb25zdCByZWV4cG9ydEFyZyA9IHN0YXRlbWVudC5leHByZXNzaW9uLmFyZ3VtZW50c1swXTtcblxuICAgIGNvbnN0IHJlcXVpcmVDYWxsID0gaXNSZXF1aXJlQ2FsbChyZWV4cG9ydEFyZykgP1xuICAgICAgICByZWV4cG9ydEFyZyA6XG4gICAgICAgIHRzLmlzSWRlbnRpZmllcihyZWV4cG9ydEFyZykgPyBmaW5kUmVxdWlyZUNhbGxSZWZlcmVuY2UocmVleHBvcnRBcmcsIHRoaXMuY2hlY2tlcikgOiBudWxsO1xuXG4gICAgbGV0IGltcG9ydFBhdGg6IHN0cmluZ3xudWxsID0gbnVsbDtcblxuICAgIGlmIChyZXF1aXJlQ2FsbCAhPT0gbnVsbCkge1xuICAgICAgaW1wb3J0UGF0aCA9IHJlcXVpcmVDYWxsLmFyZ3VtZW50c1swXS50ZXh0O1xuICAgIH0gZWxzZSBpZiAodHMuaXNJZGVudGlmaWVyKHJlZXhwb3J0QXJnKSkge1xuICAgICAgY29uc3QgaW1wb3J0UGFyYW1ldGVyID0gdGhpcy5maW5kVW1kSW1wb3J0UGFyYW1ldGVyKHJlZXhwb3J0QXJnKTtcbiAgICAgIGltcG9ydFBhdGggPSBpbXBvcnRQYXJhbWV0ZXIgJiYgdGhpcy5nZXRVbWRJbXBvcnRQYXRoKGltcG9ydFBhcmFtZXRlcik7XG4gICAgfVxuXG4gICAgaWYgKGltcG9ydFBhdGggPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICBjb25zdCBpbXBvcnRlZEZpbGUgPSB0aGlzLnJlc29sdmVNb2R1bGVOYW1lKGltcG9ydFBhdGgsIGNvbnRhaW5pbmdGaWxlKTtcbiAgICBpZiAoaW1wb3J0ZWRGaWxlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICBjb25zdCBpbXBvcnRlZEV4cG9ydHMgPSB0aGlzLmdldEV4cG9ydHNPZk1vZHVsZShpbXBvcnRlZEZpbGUpO1xuICAgIGlmIChpbXBvcnRlZEV4cG9ydHMgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICBjb25zdCB2aWFNb2R1bGUgPSBzdHJpcEV4dGVuc2lvbihpbXBvcnRlZEZpbGUuZmlsZU5hbWUpO1xuICAgIGNvbnN0IHJlZXhwb3J0czogRXhwb3J0RGVjbGFyYXRpb25bXSA9IFtdO1xuICAgIGltcG9ydGVkRXhwb3J0cy5mb3JFYWNoKFxuICAgICAgICAoZGVjbCwgbmFtZSkgPT4gcmVleHBvcnRzLnB1c2goe25hbWUsIGRlY2xhcmF0aW9uOiB7Li4uZGVjbCwgdmlhTW9kdWxlfX0pKTtcbiAgICByZXR1cm4gcmVleHBvcnRzO1xuICB9XG5cbiAgcHJpdmF0ZSBleHRyYWN0VW1kRGVmaW5lUHJvcGVydHlFeHBvcnREZWNsYXJhdGlvbihzdGF0ZW1lbnQ6IERlZmluZVByb3BlcnR5UmVleHBvcnRTdGF0ZW1lbnQpOlxuICAgICAgRXhwb3J0RGVjbGFyYXRpb258bnVsbCB7XG4gICAgY29uc3QgYXJncyA9IHN0YXRlbWVudC5leHByZXNzaW9uLmFyZ3VtZW50cztcbiAgICBjb25zdCBuYW1lID0gYXJnc1sxXS50ZXh0O1xuICAgIGNvbnN0IGdldHRlckZuRXhwcmVzc2lvbiA9IGV4dHJhY3RHZXR0ZXJGbkV4cHJlc3Npb24oc3RhdGVtZW50KTtcbiAgICBpZiAoZ2V0dGVyRm5FeHByZXNzaW9uID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBkZWNsYXJhdGlvbiA9IHRoaXMuZ2V0RGVjbGFyYXRpb25PZkV4cHJlc3Npb24oZ2V0dGVyRm5FeHByZXNzaW9uKTtcbiAgICBpZiAoZGVjbGFyYXRpb24gIT09IG51bGwpIHtcbiAgICAgIHJldHVybiB7bmFtZSwgZGVjbGFyYXRpb259O1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBuYW1lLFxuICAgICAgZGVjbGFyYXRpb246IHtcbiAgICAgICAga2luZDogRGVjbGFyYXRpb25LaW5kLklubGluZSxcbiAgICAgICAgbm9kZTogYXJnc1sxXSxcbiAgICAgICAgaW1wbGVtZW50YXRpb246IGdldHRlckZuRXhwcmVzc2lvbixcbiAgICAgICAga25vd246IG51bGwsXG4gICAgICAgIHZpYU1vZHVsZTogbnVsbCxcbiAgICAgIH0sXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJcyB0aGUgaWRlbnRpZmllciBhIHBhcmFtZXRlciBvbiBhIFVNRCBmYWN0b3J5IGZ1bmN0aW9uLCBlLmcuIGBmdW5jdGlvbiBmYWN0b3J5KHRoaXMsIGNvcmUpYD9cbiAgICogSWYgc28gdGhlbiByZXR1cm4gaXRzIGRlY2xhcmF0aW9uLlxuICAgKi9cbiAgcHJpdmF0ZSBmaW5kVW1kSW1wb3J0UGFyYW1ldGVyKGlkOiB0cy5JZGVudGlmaWVyKTogdHMuUGFyYW1ldGVyRGVjbGFyYXRpb258bnVsbCB7XG4gICAgY29uc3Qgc3ltYm9sID0gaWQgJiYgdGhpcy5jaGVja2VyLmdldFN5bWJvbEF0TG9jYXRpb24oaWQpIHx8IG51bGw7XG4gICAgY29uc3QgZGVjbGFyYXRpb24gPSBzeW1ib2wgJiYgc3ltYm9sLnZhbHVlRGVjbGFyYXRpb247XG4gICAgcmV0dXJuIGRlY2xhcmF0aW9uICYmIHRzLmlzUGFyYW1ldGVyKGRlY2xhcmF0aW9uKSA/IGRlY2xhcmF0aW9uIDogbnVsbDtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0VW1kRGVjbGFyYXRpb24oaWQ6IHRzLklkZW50aWZpZXIpOiBEZWNsYXJhdGlvbnxudWxsIHtcbiAgICBjb25zdCBuc0lkZW50aWZpZXIgPSBmaW5kTmFtZXNwYWNlT2ZJZGVudGlmaWVyKGlkKTtcbiAgICBpZiAobnNJZGVudGlmaWVyID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAobnNJZGVudGlmaWVyLnBhcmVudC5wYXJlbnQgJiYgaXNFeHBvcnRzQXNzaWdubWVudChuc0lkZW50aWZpZXIucGFyZW50LnBhcmVudCkpIHtcbiAgICAgIGNvbnN0IGluaXRpYWxpemVyID0gbnNJZGVudGlmaWVyLnBhcmVudC5wYXJlbnQucmlnaHQ7XG4gICAgICBpZiAodHMuaXNJZGVudGlmaWVyKGluaXRpYWxpemVyKSkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXREZWNsYXJhdGlvbk9mSWRlbnRpZmllcihpbml0aWFsaXplcik7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5kZXRlY3RLbm93bkRlY2xhcmF0aW9uKHtcbiAgICAgICAga2luZDogRGVjbGFyYXRpb25LaW5kLklubGluZSxcbiAgICAgICAgbm9kZTogbnNJZGVudGlmaWVyLnBhcmVudC5wYXJlbnQubGVmdCxcbiAgICAgICAgaW1wbGVtZW50YXRpb246IHNraXBBbGlhc2VzKG5zSWRlbnRpZmllci5wYXJlbnQucGFyZW50LnJpZ2h0KSxcbiAgICAgICAgdmlhTW9kdWxlOiBudWxsLFxuICAgICAgICBrbm93bjogbnVsbCxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbnN0IG1vZHVsZURlY2xhcmF0aW9uID0gdGhpcy5nZXRVbWRNb2R1bGVEZWNsYXJhdGlvbihuc0lkZW50aWZpZXIpO1xuICAgIGlmIChtb2R1bGVEZWNsYXJhdGlvbiA9PT0gbnVsbCB8fCBtb2R1bGVEZWNsYXJhdGlvbi5ub2RlID09PSBudWxsIHx8XG4gICAgICAgICF0cy5pc1NvdXJjZUZpbGUobW9kdWxlRGVjbGFyYXRpb24ubm9kZSkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IG1vZHVsZUV4cG9ydHMgPSB0aGlzLmdldEV4cG9ydHNPZk1vZHVsZShtb2R1bGVEZWNsYXJhdGlvbi5ub2RlKTtcbiAgICBpZiAobW9kdWxlRXhwb3J0cyA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8gV2UgbmVlZCB0byBjb21wdXRlIHRoZSBgdmlhTW9kdWxlYCBiZWNhdXNlICB0aGUgYGdldEV4cG9ydHNPZk1vZHVsZSgpYCBjYWxsXG4gICAgLy8gZGlkIG5vdCBrbm93IHRoYXQgd2Ugd2VyZSBpbXBvcnRpbmcgdGhlIGRlY2xhcmF0aW9uLlxuICAgIGNvbnN0IGRlY2xhcmF0aW9uID0gbW9kdWxlRXhwb3J0cy5nZXQoaWQudGV4dCkhO1xuXG4gICAgaWYgKCFtb2R1bGVFeHBvcnRzLmhhcyhpZC50ZXh0KSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8gV2UgbmVlZCB0byBjb21wdXRlIHRoZSBgdmlhTW9kdWxlYCBiZWNhdXNlICB0aGUgYGdldEV4cG9ydHNPZk1vZHVsZSgpYCBjYWxsXG4gICAgLy8gZGlkIG5vdCBrbm93IHRoYXQgd2Ugd2VyZSBpbXBvcnRpbmcgdGhlIGRlY2xhcmF0aW9uLlxuICAgIGNvbnN0IHZpYU1vZHVsZSA9XG4gICAgICAgIGRlY2xhcmF0aW9uLnZpYU1vZHVsZSA9PT0gbnVsbCA/IG1vZHVsZURlY2xhcmF0aW9uLnZpYU1vZHVsZSA6IGRlY2xhcmF0aW9uLnZpYU1vZHVsZTtcblxuICAgIHJldHVybiB7Li4uZGVjbGFyYXRpb24sIHZpYU1vZHVsZSwga25vd246IGdldFRzSGVscGVyRm5Gcm9tSWRlbnRpZmllcihpZCl9O1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRFeHBvcnRzRGVjbGFyYXRpb24oaWQ6IHRzLklkZW50aWZpZXIpOiBEZWNsYXJhdGlvbnxudWxsIHtcbiAgICBpZiAoIWlzRXhwb3J0c0lkZW50aWZpZXIoaWQpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBTYWRseSwgaW4gdGhlIGNhc2Ugb2YgYGV4cG9ydHMuZm9vID0gYmFyYCwgd2UgY2FuJ3QgdXNlIGB0aGlzLmZpbmRVbWRJbXBvcnRQYXJhbWV0ZXIoaWQpYFxuICAgIC8vIHRvIGNoZWNrIHdoZXRoZXIgdGhpcyBgZXhwb3J0c2AgaXMgZnJvbSB0aGUgSUlGRSBib2R5IGFyZ3VtZW50cywgYmVjYXVzZVxuICAgIC8vIGB0aGlzLmNoZWNrZXIuZ2V0U3ltYm9sQXRMb2NhdGlvbihpZClgIHdpbGwgcmV0dXJuIHRoZSBzeW1ib2wgZm9yIHRoZSBgZm9vYCBpZGVudGlmaWVyXG4gICAgLy8gcmF0aGVyIHRoYW4gdGhlIGBleHBvcnRzYCBpZGVudGlmaWVyLlxuICAgIC8vXG4gICAgLy8gSW5zdGVhZCB3ZSBzZWFyY2ggdGhlIHN5bWJvbHMgaW4gdGhlIGN1cnJlbnQgbG9jYWwgc2NvcGUuXG4gICAgY29uc3QgZXhwb3J0c1N5bWJvbCA9IHRoaXMuY2hlY2tlci5nZXRTeW1ib2xzSW5TY29wZShpZCwgdHMuU3ltYm9sRmxhZ3MuVmFyaWFibGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZmluZChzeW1ib2wgPT4gc3ltYm9sLm5hbWUgPT09ICdleHBvcnRzJyk7XG5cbiAgICBjb25zdCBub2RlID0gZXhwb3J0c1N5bWJvbCAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgICAhdHMuaXNGdW5jdGlvbkV4cHJlc3Npb24oZXhwb3J0c1N5bWJvbC52YWx1ZURlY2xhcmF0aW9uLnBhcmVudCkgP1xuICAgICAgICAvLyBUaGVyZSBpcyBhIGxvY2FsbHkgZGVmaW5lZCBgZXhwb3J0c2AgdmFyaWFibGUgdGhhdCBpcyBub3QgYSBmdW5jdGlvbiBwYXJhbWV0ZXIuXG4gICAgICAgIC8vIFNvIHRoaXMgYGV4cG9ydHNgIGlkZW50aWZpZXIgbXVzdCBiZSBhIGxvY2FsIHZhcmlhYmxlIGFuZCBkb2VzIG5vdCByZXByZXNlbnQgdGhlIG1vZHVsZS5cbiAgICAgICAgZXhwb3J0c1N5bWJvbC52YWx1ZURlY2xhcmF0aW9uIDpcbiAgICAgICAgLy8gVGhlcmUgaXMgbm8gbG9jYWwgc3ltYm9sIG9yIGl0IGlzIGEgcGFyYW1ldGVyIG9mIGFuIElJRkUuXG4gICAgICAgIC8vIFNvIHRoaXMgYGV4cG9ydHNgIHJlcHJlc2VudHMgdGhlIGN1cnJlbnQgXCJtb2R1bGVcIi5cbiAgICAgICAgaWQuZ2V0U291cmNlRmlsZSgpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGtpbmQ6IERlY2xhcmF0aW9uS2luZC5Db25jcmV0ZSxcbiAgICAgIG5vZGUsXG4gICAgICB2aWFNb2R1bGU6IG51bGwsXG4gICAgICBrbm93bjogbnVsbCxcbiAgICAgIGlkZW50aXR5OiBudWxsLFxuICAgIH07XG4gIH1cblxuICBwcml2YXRlIGdldFVtZE1vZHVsZURlY2xhcmF0aW9uKGlkOiB0cy5JZGVudGlmaWVyKTogRGVjbGFyYXRpb258bnVsbCB7XG4gICAgY29uc3QgaW1wb3J0UGF0aCA9IHRoaXMuZ2V0SW1wb3J0UGF0aEZyb21QYXJhbWV0ZXIoaWQpIHx8IHRoaXMuZ2V0SW1wb3J0UGF0aEZyb21SZXF1aXJlQ2FsbChpZCk7XG4gICAgaWYgKGltcG9ydFBhdGggPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IG1vZHVsZSA9IHRoaXMucmVzb2x2ZU1vZHVsZU5hbWUoaW1wb3J0UGF0aCwgaWQuZ2V0U291cmNlRmlsZSgpKTtcbiAgICBpZiAobW9kdWxlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IHZpYU1vZHVsZSA9IGlzRXh0ZXJuYWxJbXBvcnQoaW1wb3J0UGF0aCkgPyBpbXBvcnRQYXRoIDogbnVsbDtcbiAgICByZXR1cm4ge2tpbmQ6IERlY2xhcmF0aW9uS2luZC5Db25jcmV0ZSwgbm9kZTogbW9kdWxlLCB2aWFNb2R1bGUsIGtub3duOiBudWxsLCBpZGVudGl0eTogbnVsbH07XG4gIH1cblxuICBwcml2YXRlIGdldEltcG9ydFBhdGhGcm9tUGFyYW1ldGVyKGlkOiB0cy5JZGVudGlmaWVyKTogc3RyaW5nfG51bGwge1xuICAgIGNvbnN0IGltcG9ydFBhcmFtZXRlciA9IHRoaXMuZmluZFVtZEltcG9ydFBhcmFtZXRlcihpZCk7XG4gICAgaWYgKGltcG9ydFBhcmFtZXRlciA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmdldFVtZEltcG9ydFBhdGgoaW1wb3J0UGFyYW1ldGVyKTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0SW1wb3J0UGF0aEZyb21SZXF1aXJlQ2FsbChpZDogdHMuSWRlbnRpZmllcik6IHN0cmluZ3xudWxsIHtcbiAgICBjb25zdCByZXF1aXJlQ2FsbCA9IGZpbmRSZXF1aXJlQ2FsbFJlZmVyZW5jZShpZCwgdGhpcy5jaGVja2VyKTtcbiAgICBpZiAocmVxdWlyZUNhbGwgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gcmVxdWlyZUNhbGwuYXJndW1lbnRzWzBdLnRleHQ7XG4gIH1cblxuICAvKipcbiAgICogSWYgdGhpcyBpcyBhbiBJSUZFIHRoZW4gdHJ5IHRvIGdyYWIgdGhlIG91dGVyIGFuZCBpbm5lciBjbGFzc2VzIG90aGVyd2lzZSBmYWxsYmFjayBvbiB0aGUgc3VwZXJcbiAgICogY2xhc3MuXG4gICAqL1xuICBwcm90ZWN0ZWQgZ2V0RGVjbGFyYXRpb25PZkV4cHJlc3Npb24oZXhwcmVzc2lvbjogdHMuRXhwcmVzc2lvbik6IERlY2xhcmF0aW9ufG51bGwge1xuICAgIGNvbnN0IGlubmVyID0gZ2V0SW5uZXJDbGFzc0RlY2xhcmF0aW9uKGV4cHJlc3Npb24pO1xuICAgIGlmIChpbm5lciAhPT0gbnVsbCkge1xuICAgICAgY29uc3Qgb3V0ZXIgPSBnZXRPdXRlck5vZGVGcm9tSW5uZXJEZWNsYXJhdGlvbihpbm5lcik7XG4gICAgICBpZiAob3V0ZXIgIT09IG51bGwgJiYgaXNFeHBvcnRzQXNzaWdubWVudChvdXRlcikpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBraW5kOiBEZWNsYXJhdGlvbktpbmQuSW5saW5lLFxuICAgICAgICAgIG5vZGU6IG91dGVyLmxlZnQsXG4gICAgICAgICAgaW1wbGVtZW50YXRpb246IGlubmVyLFxuICAgICAgICAgIGtub3duOiBudWxsLFxuICAgICAgICAgIHZpYU1vZHVsZTogbnVsbCxcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHN1cGVyLmdldERlY2xhcmF0aW9uT2ZFeHByZXNzaW9uKGV4cHJlc3Npb24pO1xuICB9XG5cbiAgcHJpdmF0ZSByZXNvbHZlTW9kdWxlTmFtZShtb2R1bGVOYW1lOiBzdHJpbmcsIGNvbnRhaW5pbmdGaWxlOiB0cy5Tb3VyY2VGaWxlKTogdHMuU291cmNlRmlsZVxuICAgICAgfHVuZGVmaW5lZCB7XG4gICAgaWYgKHRoaXMuY29tcGlsZXJIb3N0LnJlc29sdmVNb2R1bGVOYW1lcykge1xuICAgICAgY29uc3QgbW9kdWxlSW5mbyA9IHRoaXMuY29tcGlsZXJIb3N0LnJlc29sdmVNb2R1bGVOYW1lcyhcbiAgICAgICAgICBbbW9kdWxlTmFtZV0sIGNvbnRhaW5pbmdGaWxlLmZpbGVOYW1lLCB1bmRlZmluZWQsIHVuZGVmaW5lZCxcbiAgICAgICAgICB0aGlzLnByb2dyYW0uZ2V0Q29tcGlsZXJPcHRpb25zKCkpWzBdO1xuICAgICAgcmV0dXJuIG1vZHVsZUluZm8gJiYgdGhpcy5wcm9ncmFtLmdldFNvdXJjZUZpbGUoYWJzb2x1dGVGcm9tKG1vZHVsZUluZm8ucmVzb2x2ZWRGaWxlTmFtZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBtb2R1bGVJbmZvID0gdHMucmVzb2x2ZU1vZHVsZU5hbWUoXG4gICAgICAgICAgbW9kdWxlTmFtZSwgY29udGFpbmluZ0ZpbGUuZmlsZU5hbWUsIHRoaXMucHJvZ3JhbS5nZXRDb21waWxlck9wdGlvbnMoKSxcbiAgICAgICAgICB0aGlzLmNvbXBpbGVySG9zdCk7XG4gICAgICByZXR1cm4gbW9kdWxlSW5mby5yZXNvbHZlZE1vZHVsZSAmJlxuICAgICAgICAgIHRoaXMucHJvZ3JhbS5nZXRTb3VyY2VGaWxlKGFic29sdXRlRnJvbShtb2R1bGVJbmZvLnJlc29sdmVkTW9kdWxlLnJlc29sdmVkRmlsZU5hbWUpKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlU3RhdGVtZW50Rm9yVW1kTW9kdWxlKHN0YXRlbWVudDogdHMuU3RhdGVtZW50KTogVW1kTW9kdWxlfG51bGwge1xuICBjb25zdCB3cmFwcGVyQ2FsbCA9IGdldFVtZFdyYXBwZXJDYWxsKHN0YXRlbWVudCk7XG4gIGlmICghd3JhcHBlckNhbGwpIHJldHVybiBudWxsO1xuXG4gIGNvbnN0IHdyYXBwZXJGbiA9IHdyYXBwZXJDYWxsLmV4cHJlc3Npb247XG4gIGlmICghdHMuaXNGdW5jdGlvbkV4cHJlc3Npb24od3JhcHBlckZuKSkgcmV0dXJuIG51bGw7XG5cbiAgY29uc3QgZmFjdG9yeUZuUGFyYW1JbmRleCA9IHdyYXBwZXJGbi5wYXJhbWV0ZXJzLmZpbmRJbmRleChcbiAgICAgIHBhcmFtZXRlciA9PiB0cy5pc0lkZW50aWZpZXIocGFyYW1ldGVyLm5hbWUpICYmIHBhcmFtZXRlci5uYW1lLnRleHQgPT09ICdmYWN0b3J5Jyk7XG4gIGlmIChmYWN0b3J5Rm5QYXJhbUluZGV4ID09PSAtMSkgcmV0dXJuIG51bGw7XG5cbiAgY29uc3QgZmFjdG9yeUZuID0gc3RyaXBQYXJlbnRoZXNlcyh3cmFwcGVyQ2FsbC5hcmd1bWVudHNbZmFjdG9yeUZuUGFyYW1JbmRleF0pO1xuICBpZiAoIWZhY3RvcnlGbiB8fCAhdHMuaXNGdW5jdGlvbkV4cHJlc3Npb24oZmFjdG9yeUZuKSkgcmV0dXJuIG51bGw7XG5cbiAgcmV0dXJuIHt3cmFwcGVyRm4sIGZhY3RvcnlGbn07XG59XG5cbmZ1bmN0aW9uIGdldFVtZFdyYXBwZXJDYWxsKHN0YXRlbWVudDogdHMuU3RhdGVtZW50KTogdHMuQ2FsbEV4cHJlc3Npb24mXG4gICAge2V4cHJlc3Npb246IHRzLkZ1bmN0aW9uRXhwcmVzc2lvbn18bnVsbCB7XG4gIGlmICghdHMuaXNFeHByZXNzaW9uU3RhdGVtZW50KHN0YXRlbWVudCkgfHwgIXRzLmlzUGFyZW50aGVzaXplZEV4cHJlc3Npb24oc3RhdGVtZW50LmV4cHJlc3Npb24pIHx8XG4gICAgICAhdHMuaXNDYWxsRXhwcmVzc2lvbihzdGF0ZW1lbnQuZXhwcmVzc2lvbi5leHByZXNzaW9uKSB8fFxuICAgICAgIXRzLmlzRnVuY3Rpb25FeHByZXNzaW9uKHN0YXRlbWVudC5leHByZXNzaW9uLmV4cHJlc3Npb24uZXhwcmVzc2lvbikpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICByZXR1cm4gc3RhdGVtZW50LmV4cHJlc3Npb24uZXhwcmVzc2lvbiBhcyB0cy5DYWxsRXhwcmVzc2lvbiAmIHtleHByZXNzaW9uOiB0cy5GdW5jdGlvbkV4cHJlc3Npb259O1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRJbXBvcnRzT2ZVbWRNb2R1bGUodW1kTW9kdWxlOiBVbWRNb2R1bGUpOlxuICAgIHtwYXJhbWV0ZXI6IHRzLlBhcmFtZXRlckRlY2xhcmF0aW9uLCBwYXRoOiBzdHJpbmd9W10ge1xuICBjb25zdCBpbXBvcnRzOiB7cGFyYW1ldGVyOiB0cy5QYXJhbWV0ZXJEZWNsYXJhdGlvbiwgcGF0aDogc3RyaW5nfVtdID0gW107XG4gIGZvciAobGV0IGkgPSAxOyBpIDwgdW1kTW9kdWxlLmZhY3RvcnlGbi5wYXJhbWV0ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgaW1wb3J0cy5wdXNoKHtcbiAgICAgIHBhcmFtZXRlcjogdW1kTW9kdWxlLmZhY3RvcnlGbi5wYXJhbWV0ZXJzW2ldLFxuICAgICAgcGF0aDogZ2V0UmVxdWlyZWRNb2R1bGVQYXRoKHVtZE1vZHVsZS53cmFwcGVyRm4sIGkpXG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIGltcG9ydHM7XG59XG5cbmludGVyZmFjZSBVbWRNb2R1bGUge1xuICB3cmFwcGVyRm46IHRzLkZ1bmN0aW9uRXhwcmVzc2lvbjtcbiAgZmFjdG9yeUZuOiB0cy5GdW5jdGlvbkV4cHJlc3Npb247XG59XG5cbmZ1bmN0aW9uIGdldFJlcXVpcmVkTW9kdWxlUGF0aCh3cmFwcGVyRm46IHRzLkZ1bmN0aW9uRXhwcmVzc2lvbiwgcGFyYW1JbmRleDogbnVtYmVyKTogc3RyaW5nIHtcbiAgY29uc3Qgc3RhdGVtZW50ID0gd3JhcHBlckZuLmJvZHkuc3RhdGVtZW50c1swXTtcbiAgaWYgKCF0cy5pc0V4cHJlc3Npb25TdGF0ZW1lbnQoc3RhdGVtZW50KSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgJ1VNRCB3cmFwcGVyIGJvZHkgaXMgbm90IGFuIGV4cHJlc3Npb24gc3RhdGVtZW50OlxcbicgKyB3cmFwcGVyRm4uYm9keS5nZXRUZXh0KCkpO1xuICB9XG4gIGNvbnN0IG1vZHVsZVBhdGhzOiBzdHJpbmdbXSA9IFtdO1xuICBmaW5kTW9kdWxlUGF0aHMoc3RhdGVtZW50LmV4cHJlc3Npb24pO1xuXG4gIC8vIFNpbmNlIHdlIHdlcmUgb25seSBpbnRlcmVzdGVkIGluIHRoZSBgcmVxdWlyZSgpYCBjYWxscywgd2UgbWlzcyB0aGUgYGV4cG9ydHNgIGFyZ3VtZW50LCBzbyB3ZVxuICAvLyBuZWVkIHRvIHN1YnRyYWN0IDEuXG4gIC8vIEUuZy4gYGZ1bmN0aW9uKGV4cG9ydHMsIGRlcDEsIGRlcDIpYCBtYXBzIHRvIGBmdW5jdGlvbihleHBvcnRzLCByZXF1aXJlKCdwYXRoL3RvL2RlcDEnKSxcbiAgLy8gcmVxdWlyZSgncGF0aC90by9kZXAyJykpYFxuICByZXR1cm4gbW9kdWxlUGF0aHNbcGFyYW1JbmRleCAtIDFdO1xuXG4gIC8vIFNlYXJjaCB0aGUgc3RhdGVtZW50IGZvciBjYWxscyB0byBgcmVxdWlyZSgnLi4uJylgIGFuZCBleHRyYWN0IHRoZSBzdHJpbmcgdmFsdWUgb2YgdGhlIGZpcnN0XG4gIC8vIGFyZ3VtZW50XG4gIGZ1bmN0aW9uIGZpbmRNb2R1bGVQYXRocyhub2RlOiB0cy5Ob2RlKSB7XG4gICAgaWYgKGlzUmVxdWlyZUNhbGwobm9kZSkpIHtcbiAgICAgIGNvbnN0IGFyZ3VtZW50ID0gbm9kZS5hcmd1bWVudHNbMF07XG4gICAgICBpZiAodHMuaXNTdHJpbmdMaXRlcmFsKGFyZ3VtZW50KSkge1xuICAgICAgICBtb2R1bGVQYXRocy5wdXNoKGFyZ3VtZW50LnRleHQpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBub2RlLmZvckVhY2hDaGlsZChmaW5kTW9kdWxlUGF0aHMpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIElzIHRoZSBgbm9kZWAgYW4gaWRlbnRpZmllciB3aXRoIHRoZSBuYW1lIFwiZXhwb3J0c1wiP1xuICovXG5mdW5jdGlvbiBpc0V4cG9ydHNJZGVudGlmaWVyKG5vZGU6IHRzLk5vZGUpOiBub2RlIGlzIHRzLklkZW50aWZpZXIge1xuICByZXR1cm4gdHMuaXNJZGVudGlmaWVyKG5vZGUpICYmIG5vZGUudGV4dCA9PT0gJ2V4cG9ydHMnO1xufVxuIl19