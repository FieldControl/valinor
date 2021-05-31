(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/metadata/bundler", ["require", "exports", "tslib", "path", "typescript", "@angular/compiler-cli/src/metadata/collector", "@angular/compiler-cli/src/metadata/schema"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CompilerHostAdapter = exports.MetadataBundler = void 0;
    var tslib_1 = require("tslib");
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var path = require("path");
    var ts = require("typescript");
    var collector_1 = require("@angular/compiler-cli/src/metadata/collector");
    var schema_1 = require("@angular/compiler-cli/src/metadata/schema");
    // The character set used to produce private names.
    var PRIVATE_NAME_CHARS = 'abcdefghijklmnopqrstuvwxyz';
    var MetadataBundler = /** @class */ (function () {
        function MetadataBundler(root, importAs, host, privateSymbolPrefix) {
            this.root = root;
            this.importAs = importAs;
            this.host = host;
            this.symbolMap = new Map();
            this.metadataCache = new Map();
            this.exports = new Map();
            this.rootModule = "./" + path.basename(root);
            this.privateSymbolPrefix = (privateSymbolPrefix || '').replace(/\W/g, '_');
        }
        MetadataBundler.prototype.getMetadataBundle = function () {
            // Export the root module. This also collects the transitive closure of all values referenced by
            // the exports.
            var exportedSymbols = this.exportAll(this.rootModule);
            this.canonicalizeSymbols(exportedSymbols);
            // TODO: exports? e.g. a module re-exports a symbol from another bundle
            var metadata = this.getEntries(exportedSymbols);
            var privates = Array.from(this.symbolMap.values())
                .filter(function (s) { return s.referenced && s.isPrivate; })
                .map(function (s) { return ({
                privateName: s.privateName,
                name: s.declaration.name,
                module: s.declaration.module
            }); });
            var origins = Array.from(this.symbolMap.values())
                .filter(function (s) { return s.referenced && !s.reexport; })
                .reduce(function (p, s) {
                p[s.isPrivate ? s.privateName : s.name] = s.declaration.module;
                return p;
            }, {});
            var exports = this.getReExports(exportedSymbols);
            return {
                metadata: {
                    __symbolic: 'module',
                    version: schema_1.METADATA_VERSION,
                    exports: exports.length ? exports : undefined,
                    metadata: metadata,
                    origins: origins,
                    importAs: this.importAs
                },
                privates: privates
            };
        };
        MetadataBundler.resolveModule = function (importName, from) {
            return resolveModule(importName, from);
        };
        MetadataBundler.prototype.getMetadata = function (moduleName) {
            var result = this.metadataCache.get(moduleName);
            if (!result) {
                if (moduleName.startsWith('.')) {
                    var fullModuleName = resolveModule(moduleName, this.root);
                    result = this.host.getMetadataFor(fullModuleName, this.root);
                }
                this.metadataCache.set(moduleName, result);
            }
            return result;
        };
        MetadataBundler.prototype.exportAll = function (moduleName) {
            var e_1, _a, e_2, _b, e_3, _c;
            var _this = this;
            var module = this.getMetadata(moduleName);
            var result = this.exports.get(moduleName);
            if (result) {
                return result;
            }
            result = [];
            var exportSymbol = function (exportedSymbol, exportAs) {
                var symbol = _this.symbolOf(moduleName, exportAs);
                result.push(symbol);
                exportedSymbol.reexportedAs = symbol;
                symbol.exports = exportedSymbol;
            };
            // Export all the symbols defined in this module.
            if (module && module.metadata) {
                for (var key in module.metadata) {
                    var data = module.metadata[key];
                    if (schema_1.isMetadataImportedSymbolReferenceExpression(data)) {
                        // This is a re-export of an imported symbol. Record this as a re-export.
                        var exportFrom = resolveModule(data.module, moduleName);
                        this.exportAll(exportFrom);
                        var symbol = this.symbolOf(exportFrom, data.name);
                        exportSymbol(symbol, key);
                    }
                    else {
                        // Record that this symbol is exported by this module.
                        result.push(this.symbolOf(moduleName, key));
                    }
                }
            }
            // Export all the re-exports from this module
            if (module && module.exports) {
                var unnamedModuleExportsIdx = 0;
                try {
                    for (var _d = tslib_1.__values(module.exports), _e = _d.next(); !_e.done; _e = _d.next()) {
                        var exportDeclaration = _e.value;
                        var exportFrom = resolveModule(exportDeclaration.from, moduleName);
                        // Record all the exports from the module even if we don't use it directly.
                        var exportedSymbols = this.exportAll(exportFrom);
                        if (exportDeclaration.export) {
                            try {
                                // Re-export all the named exports from a module.
                                for (var _f = (e_2 = void 0, tslib_1.__values(exportDeclaration.export)), _g = _f.next(); !_g.done; _g = _f.next()) {
                                    var exportItem = _g.value;
                                    var name = typeof exportItem == 'string' ? exportItem : exportItem.name;
                                    var exportAs = typeof exportItem == 'string' ? exportItem : exportItem.as;
                                    var symbol = this.symbolOf(exportFrom, name);
                                    if (exportedSymbols && exportedSymbols.length == 1 && exportedSymbols[0].reexport &&
                                        exportedSymbols[0].name == '*') {
                                        // This is a named export from a module we have no metadata about. Record the named
                                        // export as a re-export.
                                        symbol.reexport = true;
                                    }
                                    exportSymbol(this.symbolOf(exportFrom, name), exportAs);
                                }
                            }
                            catch (e_2_1) { e_2 = { error: e_2_1 }; }
                            finally {
                                try {
                                    if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
                                }
                                finally { if (e_2) throw e_2.error; }
                            }
                        }
                        else {
                            // Re-export all the symbols from the module
                            var exportedSymbols_2 = this.exportAll(exportFrom);
                            try {
                                for (var exportedSymbols_1 = (e_3 = void 0, tslib_1.__values(exportedSymbols_2)), exportedSymbols_1_1 = exportedSymbols_1.next(); !exportedSymbols_1_1.done; exportedSymbols_1_1 = exportedSymbols_1.next()) {
                                    var exportedSymbol = exportedSymbols_1_1.value;
                                    // In case the exported symbol does not have a name, we need to give it an unique
                                    // name for the current module. This is necessary because there can be multiple
                                    // unnamed re-exports in a given module.
                                    var name = exportedSymbol.name === '*' ?
                                        "unnamed_reexport_" + unnamedModuleExportsIdx++ :
                                        exportedSymbol.name;
                                    exportSymbol(exportedSymbol, name);
                                }
                            }
                            catch (e_3_1) { e_3 = { error: e_3_1 }; }
                            finally {
                                try {
                                    if (exportedSymbols_1_1 && !exportedSymbols_1_1.done && (_c = exportedSymbols_1.return)) _c.call(exportedSymbols_1);
                                }
                                finally { if (e_3) throw e_3.error; }
                            }
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
            if (!module) {
                // If no metadata is found for this import then it is considered external to the
                // library and should be recorded as a re-export in the final metadata if it is
                // eventually re-exported.
                var symbol = this.symbolOf(moduleName, '*');
                symbol.reexport = true;
                result.push(symbol);
            }
            this.exports.set(moduleName, result);
            return result;
        };
        /**
         * Fill in the canonicalSymbol which is the symbol that should be imported by factories.
         * The canonical symbol is the one exported by the index file for the bundle or definition
         * symbol for private symbols that are not exported by bundle index.
         */
        MetadataBundler.prototype.canonicalizeSymbols = function (exportedSymbols) {
            var symbols = Array.from(this.symbolMap.values());
            this.exported = new Set(exportedSymbols);
            symbols.forEach(this.canonicalizeSymbol, this);
        };
        MetadataBundler.prototype.canonicalizeSymbol = function (symbol) {
            var rootExport = getRootExport(symbol);
            var declaration = getSymbolDeclaration(symbol);
            var isPrivate = !this.exported.has(rootExport);
            var canonicalSymbol = isPrivate ? declaration : rootExport;
            symbol.isPrivate = isPrivate;
            symbol.declaration = declaration;
            symbol.canonicalSymbol = canonicalSymbol;
            symbol.reexport = declaration.reexport;
        };
        MetadataBundler.prototype.getEntries = function (exportedSymbols) {
            var _this = this;
            var result = {};
            var exportedNames = new Set(exportedSymbols.map(function (s) { return s.name; }));
            var privateName = 0;
            function newPrivateName(prefix) {
                while (true) {
                    var digits = [];
                    var index = privateName++;
                    var base = PRIVATE_NAME_CHARS;
                    while (!digits.length || index > 0) {
                        digits.unshift(base[index % base.length]);
                        index = Math.floor(index / base.length);
                    }
                    var result_1 = "\u0275" + prefix + digits.join('');
                    if (!exportedNames.has(result_1))
                        return result_1;
                }
            }
            exportedSymbols.forEach(function (symbol) { return _this.convertSymbol(symbol); });
            var symbolsMap = new Map();
            Array.from(this.symbolMap.values()).forEach(function (symbol) {
                if (symbol.referenced && !symbol.reexport) {
                    var name = symbol.name;
                    var identifier = symbol.declaration.module + ":" + symbol.declaration.name;
                    if (symbol.isPrivate && !symbol.privateName) {
                        name = newPrivateName(_this.privateSymbolPrefix);
                        symbol.privateName = name;
                    }
                    if (symbolsMap.has(identifier)) {
                        var names = symbolsMap.get(identifier);
                        names.push(name);
                    }
                    else {
                        symbolsMap.set(identifier, [name]);
                    }
                    result[name] = symbol.value;
                }
            });
            // check for duplicated entries
            symbolsMap.forEach(function (names, identifier) {
                if (names.length > 1) {
                    var _a = tslib_1.__read(identifier.split(':'), 2), module_1 = _a[0], declaredName = _a[1];
                    // prefer the export that uses the declared name (if any)
                    var reference_1 = names.indexOf(declaredName);
                    if (reference_1 === -1) {
                        reference_1 = 0;
                    }
                    // keep one entry and replace the others by references
                    names.forEach(function (name, i) {
                        if (i !== reference_1) {
                            result[name] = { __symbolic: 'reference', name: names[reference_1] };
                        }
                    });
                }
            });
            return result;
        };
        MetadataBundler.prototype.getReExports = function (exportedSymbols) {
            var e_4, _a;
            var modules = new Map();
            var exportAlls = new Set();
            try {
                for (var exportedSymbols_3 = tslib_1.__values(exportedSymbols), exportedSymbols_3_1 = exportedSymbols_3.next(); !exportedSymbols_3_1.done; exportedSymbols_3_1 = exportedSymbols_3.next()) {
                    var symbol = exportedSymbols_3_1.value;
                    if (symbol.reexport) {
                        // symbol.declaration is guaranteed to be defined during the phase this method is called.
                        var declaration = symbol.declaration;
                        var module_2 = declaration.module;
                        if (declaration.name == '*') {
                            // Reexport all the symbols.
                            exportAlls.add(declaration.module);
                        }
                        else {
                            // Re-export the symbol as the exported name.
                            var entry = modules.get(module_2);
                            if (!entry) {
                                entry = [];
                                modules.set(module_2, entry);
                            }
                            var as = symbol.name;
                            var name = declaration.name;
                            entry.push({ name: name, as: as });
                        }
                    }
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (exportedSymbols_3_1 && !exportedSymbols_3_1.done && (_a = exportedSymbols_3.return)) _a.call(exportedSymbols_3);
                }
                finally { if (e_4) throw e_4.error; }
            }
            return tslib_1.__spreadArray(tslib_1.__spreadArray([], tslib_1.__read(Array.from(exportAlls.values()).map(function (from) { return ({ from: from }); }))), tslib_1.__read(Array.from(modules.entries()).map(function (_a) {
                var _b = tslib_1.__read(_a, 2), from = _b[0], exports = _b[1];
                return ({ export: exports, from: from });
            })));
        };
        MetadataBundler.prototype.convertSymbol = function (symbol) {
            // canonicalSymbol is ensured to be defined before this is called.
            var canonicalSymbol = symbol.canonicalSymbol;
            if (!canonicalSymbol.referenced) {
                canonicalSymbol.referenced = true;
                // declaration is ensured to be definded before this method is called.
                var declaration = canonicalSymbol.declaration;
                var module_3 = this.getMetadata(declaration.module);
                if (module_3) {
                    var value = module_3.metadata[declaration.name];
                    if (value && !declaration.name.startsWith('___')) {
                        canonicalSymbol.value = this.convertEntry(declaration.module, value);
                    }
                }
            }
        };
        MetadataBundler.prototype.convertEntry = function (moduleName, value) {
            if (schema_1.isClassMetadata(value)) {
                return this.convertClass(moduleName, value);
            }
            if (schema_1.isFunctionMetadata(value)) {
                return this.convertFunction(moduleName, value);
            }
            if (schema_1.isInterfaceMetadata(value)) {
                return value;
            }
            return this.convertValue(moduleName, value);
        };
        MetadataBundler.prototype.convertClass = function (moduleName, value) {
            var _this = this;
            return {
                __symbolic: 'class',
                arity: value.arity,
                extends: this.convertExpression(moduleName, value.extends),
                decorators: value.decorators && value.decorators.map(function (d) { return _this.convertExpression(moduleName, d); }),
                members: this.convertMembers(moduleName, value.members),
                statics: value.statics && this.convertStatics(moduleName, value.statics)
            };
        };
        MetadataBundler.prototype.convertMembers = function (moduleName, members) {
            var _this = this;
            var result = {};
            for (var name in members) {
                var value = members[name];
                result[name] = value.map(function (v) { return _this.convertMember(moduleName, v); });
            }
            return result;
        };
        MetadataBundler.prototype.convertMember = function (moduleName, member) {
            var _this = this;
            var result = { __symbolic: member.__symbolic };
            result.decorators =
                member.decorators && member.decorators.map(function (d) { return _this.convertExpression(moduleName, d); });
            if (schema_1.isMethodMetadata(member)) {
                result.parameterDecorators = member.parameterDecorators &&
                    member.parameterDecorators.map(function (d) { return d && d.map(function (p) { return _this.convertExpression(moduleName, p); }); });
                if (schema_1.isConstructorMetadata(member)) {
                    if (member.parameters) {
                        result.parameters =
                            member.parameters.map(function (p) { return _this.convertExpression(moduleName, p); });
                    }
                }
            }
            return result;
        };
        MetadataBundler.prototype.convertStatics = function (moduleName, statics) {
            var result = {};
            for (var key in statics) {
                var value = statics[key];
                if (schema_1.isFunctionMetadata(value)) {
                    result[key] = this.convertFunction(moduleName, value);
                }
                else if (schema_1.isMetadataSymbolicCallExpression(value)) {
                    // Class members can also contain static members that call a function with module
                    // references. e.g. "static ɵprov = ɵɵdefineInjectable(..)". We also need to
                    // convert these module references because otherwise these resolve to non-existent files.
                    result[key] = this.convertValue(moduleName, value);
                }
                else {
                    result[key] = value;
                }
            }
            return result;
        };
        MetadataBundler.prototype.convertFunction = function (moduleName, value) {
            var _this = this;
            return {
                __symbolic: 'function',
                parameters: value.parameters,
                defaults: value.defaults && value.defaults.map(function (v) { return _this.convertValue(moduleName, v); }),
                value: this.convertValue(moduleName, value.value)
            };
        };
        MetadataBundler.prototype.convertValue = function (moduleName, value) {
            var _this = this;
            if (isPrimitive(value)) {
                return value;
            }
            if (schema_1.isMetadataError(value)) {
                return this.convertError(moduleName, value);
            }
            if (schema_1.isMetadataSymbolicExpression(value)) {
                return this.convertExpression(moduleName, value);
            }
            if (Array.isArray(value)) {
                return value.map(function (v) { return _this.convertValue(moduleName, v); });
            }
            // Otherwise it is a metadata object.
            var object = value;
            var result = {};
            for (var key in object) {
                result[key] = this.convertValue(moduleName, object[key]);
            }
            return result;
        };
        MetadataBundler.prototype.convertExpression = function (moduleName, value) {
            if (value) {
                switch (value.__symbolic) {
                    case 'error':
                        return this.convertError(moduleName, value);
                    case 'reference':
                        return this.convertReference(moduleName, value);
                    default:
                        return this.convertExpressionNode(moduleName, value);
                }
            }
            return value;
        };
        MetadataBundler.prototype.convertError = function (module, value) {
            return {
                __symbolic: 'error',
                message: value.message,
                line: value.line,
                character: value.character,
                context: value.context,
                module: module
            };
        };
        MetadataBundler.prototype.convertReference = function (moduleName, value) {
            var _this = this;
            var createReference = function (symbol) {
                var declaration = symbol.declaration;
                if (declaration.module.startsWith('.')) {
                    // Reference to a symbol defined in the module. Ensure it is converted then return a
                    // references to the final symbol.
                    _this.convertSymbol(symbol);
                    return {
                        __symbolic: 'reference',
                        get name() {
                            // Resolved lazily because private names are assigned late.
                            var canonicalSymbol = symbol.canonicalSymbol;
                            if (canonicalSymbol.isPrivate == null) {
                                throw Error('Invalid state: isPrivate was not initialized');
                            }
                            return canonicalSymbol.isPrivate ? canonicalSymbol.privateName : canonicalSymbol.name;
                        }
                    };
                }
                else {
                    // The symbol was a re-exported symbol from another module. Return a reference to the
                    // original imported symbol.
                    return { __symbolic: 'reference', name: declaration.name, module: declaration.module };
                }
            };
            if (schema_1.isMetadataGlobalReferenceExpression(value)) {
                var metadata = this.getMetadata(moduleName);
                if (metadata && metadata.metadata && metadata.metadata[value.name]) {
                    // Reference to a symbol defined in the module
                    return createReference(this.canonicalSymbolOf(moduleName, value.name));
                }
                // If a reference has arguments, the arguments need to be converted.
                if (value.arguments) {
                    return {
                        __symbolic: 'reference',
                        name: value.name,
                        arguments: value.arguments.map(function (a) { return _this.convertValue(moduleName, a); })
                    };
                }
                // Global references without arguments (such as to Math or JSON) are unmodified.
                return value;
            }
            if (schema_1.isMetadataImportedSymbolReferenceExpression(value)) {
                // References to imported symbols are separated into two, references to bundled modules and
                // references to modules external to the bundle. If the module reference is relative it is
                // assumed to be in the bundle. If it is Global it is assumed to be outside the bundle.
                // References to symbols outside the bundle are left unmodified. References to symbol inside
                // the bundle need to be converted to a bundle import reference reachable from the bundle
                // index.
                if (value.module.startsWith('.')) {
                    // Reference is to a symbol defined inside the module. Convert the reference to a reference
                    // to the canonical symbol.
                    var referencedModule = resolveModule(value.module, moduleName);
                    var referencedName = value.name;
                    return createReference(this.canonicalSymbolOf(referencedModule, referencedName));
                }
                // Value is a reference to a symbol defined outside the module.
                if (value.arguments) {
                    // If a reference has arguments the arguments need to be converted.
                    return {
                        __symbolic: 'reference',
                        name: value.name,
                        module: value.module,
                        arguments: value.arguments.map(function (a) { return _this.convertValue(moduleName, a); })
                    };
                }
                return value;
            }
            if (schema_1.isMetadataModuleReferenceExpression(value)) {
                // Cannot support references to bundled modules as the internal modules of a bundle are erased
                // by the bundler.
                if (value.module.startsWith('.')) {
                    return {
                        __symbolic: 'error',
                        message: 'Unsupported bundled module reference',
                        context: { module: value.module }
                    };
                }
                // References to unbundled modules are unmodified.
                return value;
            }
        };
        MetadataBundler.prototype.convertExpressionNode = function (moduleName, value) {
            var result = { __symbolic: value.__symbolic };
            for (var key in value) {
                result[key] = this.convertValue(moduleName, value[key]);
            }
            return result;
        };
        MetadataBundler.prototype.symbolOf = function (module, name) {
            var symbolKey = module + ":" + name;
            var symbol = this.symbolMap.get(symbolKey);
            if (!symbol) {
                symbol = { module: module, name: name };
                this.symbolMap.set(symbolKey, symbol);
            }
            return symbol;
        };
        MetadataBundler.prototype.canonicalSymbolOf = function (module, name) {
            // Ensure the module has been seen.
            this.exportAll(module);
            var symbol = this.symbolOf(module, name);
            if (!symbol.canonicalSymbol) {
                this.canonicalizeSymbol(symbol);
            }
            return symbol;
        };
        return MetadataBundler;
    }());
    exports.MetadataBundler = MetadataBundler;
    var CompilerHostAdapter = /** @class */ (function () {
        function CompilerHostAdapter(host, cache, options) {
            this.host = host;
            this.cache = cache;
            this.options = options;
            this.collector = new collector_1.MetadataCollector();
        }
        CompilerHostAdapter.prototype.getMetadataFor = function (fileName, containingFile) {
            var resolvedModule = ts.resolveModuleName(fileName, containingFile, this.options, this.host).resolvedModule;
            var sourceFile;
            if (resolvedModule) {
                var resolvedFileName = resolvedModule.resolvedFileName;
                if (resolvedModule.extension !== '.ts') {
                    resolvedFileName = resolvedFileName.replace(/(\.d\.ts|\.js)$/, '.ts');
                }
                sourceFile = this.host.getSourceFile(resolvedFileName, ts.ScriptTarget.Latest);
            }
            else {
                // If typescript is unable to resolve the file, fallback on old behavior
                if (!this.host.fileExists(fileName + '.ts'))
                    return undefined;
                sourceFile = this.host.getSourceFile(fileName + '.ts', ts.ScriptTarget.Latest);
            }
            // If there is a metadata cache, use it to get the metadata for this source file. Otherwise,
            // fall back on the locally created MetadataCollector.
            if (!sourceFile) {
                return undefined;
            }
            else if (this.cache) {
                return this.cache.getMetadata(sourceFile);
            }
            else {
                return this.collector.getMetadata(sourceFile);
            }
        };
        return CompilerHostAdapter;
    }());
    exports.CompilerHostAdapter = CompilerHostAdapter;
    function resolveModule(importName, from) {
        if (importName.startsWith('.') && from) {
            var normalPath = path.normalize(path.join(path.dirname(from), importName));
            if (!normalPath.startsWith('.') && from.startsWith('.')) {
                // path.normalize() preserves leading '../' but not './'. This adds it back.
                normalPath = "." + path.sep + normalPath;
            }
            // Replace windows path delimiters with forward-slashes. Otherwise the paths are not
            // TypeScript compatible when building the bundle.
            return normalPath.replace(/\\/g, '/');
        }
        return importName;
    }
    function isPrimitive(o) {
        return o === null || (typeof o !== 'function' && typeof o !== 'object');
    }
    function getRootExport(symbol) {
        return symbol.reexportedAs ? getRootExport(symbol.reexportedAs) : symbol;
    }
    function getSymbolDeclaration(symbol) {
        return symbol.exports ? getSymbolDeclaration(symbol.exports) : symbol;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbWV0YWRhdGEvYnVuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gsMkJBQTZCO0lBQzdCLCtCQUFpQztJQUlqQywwRUFBOEM7SUFDOUMsb0VBQTRsQjtJQUk1bEIsbURBQW1EO0lBQ25ELElBQU0sa0JBQWtCLEdBQUcsNEJBQTRCLENBQUM7SUFrRXhEO1FBU0UseUJBQ1ksSUFBWSxFQUFVLFFBQTBCLEVBQVUsSUFBeUIsRUFDM0YsbUJBQTRCO1lBRHBCLFNBQUksR0FBSixJQUFJLENBQVE7WUFBVSxhQUFRLEdBQVIsUUFBUSxDQUFrQjtZQUFVLFNBQUksR0FBSixJQUFJLENBQXFCO1lBVHZGLGNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBa0IsQ0FBQztZQUN0QyxrQkFBYSxHQUFHLElBQUksR0FBRyxFQUFvQyxDQUFDO1lBQzVELFlBQU8sR0FBRyxJQUFJLEdBQUcsRUFBb0IsQ0FBQztZQVM1QyxJQUFJLENBQUMsVUFBVSxHQUFHLE9BQUssSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUcsQ0FBQztZQUM3QyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsQ0FBQyxtQkFBbUIsSUFBSSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQzdFLENBQUM7UUFFRCwyQ0FBaUIsR0FBakI7WUFDRSxnR0FBZ0c7WUFDaEcsZUFBZTtZQUNmLElBQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3hELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUMxQyx1RUFBdUU7WUFDdkUsSUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUNsRCxJQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUM7aUJBQzlCLE1BQU0sQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsQ0FBQyxVQUFVLElBQUksQ0FBQyxDQUFDLFNBQVMsRUFBM0IsQ0FBMkIsQ0FBQztpQkFDeEMsR0FBRyxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQztnQkFDSixXQUFXLEVBQUUsQ0FBQyxDQUFDLFdBQVk7Z0JBQzNCLElBQUksRUFBRSxDQUFDLENBQUMsV0FBWSxDQUFDLElBQUk7Z0JBQ3pCLE1BQU0sRUFBRSxDQUFDLENBQUMsV0FBWSxDQUFDLE1BQU07YUFDOUIsQ0FBQyxFQUpHLENBSUgsQ0FBQyxDQUFDO1lBQzlCLElBQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztpQkFDOUIsTUFBTSxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxDQUFDLFVBQVUsSUFBSSxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQTNCLENBQTJCLENBQUM7aUJBQ3hDLE1BQU0sQ0FBMkIsVUFBQyxDQUFDLEVBQUUsQ0FBQztnQkFDckMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsV0FBWSxDQUFDLE1BQU0sQ0FBQztnQkFDakUsT0FBTyxDQUFDLENBQUM7WUFDWCxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDM0IsSUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUNuRCxPQUFPO2dCQUNMLFFBQVEsRUFBRTtvQkFDUixVQUFVLEVBQUUsUUFBUTtvQkFDcEIsT0FBTyxFQUFFLHlCQUFnQjtvQkFDekIsT0FBTyxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsU0FBUztvQkFDN0MsUUFBUSxVQUFBO29CQUNSLE9BQU8sU0FBQTtvQkFDUCxRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVM7aUJBQ3pCO2dCQUNELFFBQVEsVUFBQTthQUNULENBQUM7UUFDSixDQUFDO1FBRU0sNkJBQWEsR0FBcEIsVUFBcUIsVUFBa0IsRUFBRSxJQUFZO1lBQ25ELE9BQU8sYUFBYSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN6QyxDQUFDO1FBRU8scUNBQVcsR0FBbkIsVUFBb0IsVUFBa0I7WUFDcEMsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDaEQsSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDWCxJQUFJLFVBQVUsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUU7b0JBQzlCLElBQU0sY0FBYyxHQUFHLGFBQWEsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUM1RCxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDOUQ7Z0JBQ0QsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2FBQzVDO1lBQ0QsT0FBTyxNQUFNLENBQUM7UUFDaEIsQ0FBQztRQUVPLG1DQUFTLEdBQWpCLFVBQWtCLFVBQWtCOztZQUFwQyxpQkFrRkM7WUFqRkMsSUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUM1QyxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUUxQyxJQUFJLE1BQU0sRUFBRTtnQkFDVixPQUFPLE1BQU0sQ0FBQzthQUNmO1lBRUQsTUFBTSxHQUFHLEVBQUUsQ0FBQztZQUVaLElBQU0sWUFBWSxHQUFHLFVBQUMsY0FBc0IsRUFBRSxRQUFnQjtnQkFDNUQsSUFBTSxNQUFNLEdBQUcsS0FBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUM7Z0JBQ25ELE1BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ3JCLGNBQWMsQ0FBQyxZQUFZLEdBQUcsTUFBTSxDQUFDO2dCQUNyQyxNQUFNLENBQUMsT0FBTyxHQUFHLGNBQWMsQ0FBQztZQUNsQyxDQUFDLENBQUM7WUFFRixpREFBaUQ7WUFDakQsSUFBSSxNQUFNLElBQUksTUFBTSxDQUFDLFFBQVEsRUFBRTtnQkFDN0IsS0FBSyxJQUFJLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxFQUFFO29CQUMvQixJQUFNLElBQUksR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUNsQyxJQUFJLG9EQUEyQyxDQUFDLElBQUksQ0FBQyxFQUFFO3dCQUNyRCx5RUFBeUU7d0JBQ3pFLElBQU0sVUFBVSxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO3dCQUMxRCxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDO3dCQUMzQixJQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBQ3BELFlBQVksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7cUJBQzNCO3lCQUFNO3dCQUNMLHNEQUFzRDt3QkFDdEQsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO3FCQUM3QztpQkFDRjthQUNGO1lBRUQsNkNBQTZDO1lBQzdDLElBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxPQUFPLEVBQUU7Z0JBQzVCLElBQUksdUJBQXVCLEdBQUcsQ0FBQyxDQUFDOztvQkFDaEMsS0FBZ0MsSUFBQSxLQUFBLGlCQUFBLE1BQU0sQ0FBQyxPQUFPLENBQUEsZ0JBQUEsNEJBQUU7d0JBQTNDLElBQU0saUJBQWlCLFdBQUE7d0JBQzFCLElBQU0sVUFBVSxHQUFHLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7d0JBQ3JFLDJFQUEyRTt3QkFDM0UsSUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQzt3QkFDbkQsSUFBSSxpQkFBaUIsQ0FBQyxNQUFNLEVBQUU7O2dDQUM1QixpREFBaUQ7Z0NBQ2pELEtBQXlCLElBQUEsb0JBQUEsaUJBQUEsaUJBQWlCLENBQUMsTUFBTSxDQUFBLENBQUEsZ0JBQUEsNEJBQUU7b0NBQTlDLElBQU0sVUFBVSxXQUFBO29DQUNuQixJQUFNLElBQUksR0FBRyxPQUFPLFVBQVUsSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQztvQ0FDMUUsSUFBTSxRQUFRLEdBQUcsT0FBTyxVQUFVLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7b0NBQzVFLElBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO29DQUMvQyxJQUFJLGVBQWUsSUFBSSxlQUFlLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUTt3Q0FDN0UsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxHQUFHLEVBQUU7d0NBQ2xDLG1GQUFtRjt3Q0FDbkYseUJBQXlCO3dDQUN6QixNQUFNLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztxQ0FDeEI7b0NBQ0QsWUFBWSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2lDQUN6RDs7Ozs7Ozs7O3lCQUNGOzZCQUFNOzRCQUNMLDRDQUE0Qzs0QkFDNUMsSUFBTSxpQkFBZSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUM7O2dDQUNuRCxLQUE2QixJQUFBLG1DQUFBLGlCQUFBLGlCQUFlLENBQUEsQ0FBQSxnREFBQSw2RUFBRTtvQ0FBekMsSUFBTSxjQUFjLDRCQUFBO29DQUN2QixpRkFBaUY7b0NBQ2pGLCtFQUErRTtvQ0FDL0Usd0NBQXdDO29DQUN4QyxJQUFNLElBQUksR0FBRyxjQUFjLENBQUMsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO3dDQUN0QyxzQkFBb0IsdUJBQXVCLEVBQUksQ0FBQyxDQUFDO3dDQUNqRCxjQUFjLENBQUMsSUFBSSxDQUFDO29DQUN4QixZQUFZLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxDQUFDO2lDQUNwQzs7Ozs7Ozs7O3lCQUNGO3FCQUNGOzs7Ozs7Ozs7YUFDRjtZQUVELElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ1gsZ0ZBQWdGO2dCQUNoRiwrRUFBK0U7Z0JBQy9FLDBCQUEwQjtnQkFDMUIsSUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQzlDLE1BQU0sQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO2dCQUN2QixNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQ3JCO1lBQ0QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBRXJDLE9BQU8sTUFBTSxDQUFDO1FBQ2hCLENBQUM7UUFFRDs7OztXQUlHO1FBQ0ssNkNBQW1CLEdBQTNCLFVBQTRCLGVBQXlCO1lBQ25ELElBQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1lBQ3BELElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDekMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDakQsQ0FBQztRQUVPLDRDQUFrQixHQUExQixVQUEyQixNQUFjO1lBQ3ZDLElBQU0sVUFBVSxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN6QyxJQUFNLFdBQVcsR0FBRyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNqRCxJQUFNLFNBQVMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ2pELElBQU0sZUFBZSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUM7WUFDN0QsTUFBTSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7WUFDN0IsTUFBTSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7WUFDakMsTUFBTSxDQUFDLGVBQWUsR0FBRyxlQUFlLENBQUM7WUFDekMsTUFBTSxDQUFDLFFBQVEsR0FBRyxXQUFXLENBQUMsUUFBUSxDQUFDO1FBQ3pDLENBQUM7UUFFTyxvQ0FBVSxHQUFsQixVQUFtQixlQUF5QjtZQUE1QyxpQkE2REM7WUE1REMsSUFBTSxNQUFNLEdBQWtCLEVBQUUsQ0FBQztZQUVqQyxJQUFNLGFBQWEsR0FBRyxJQUFJLEdBQUcsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxDQUFDLElBQUksRUFBTixDQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ2hFLElBQUksV0FBVyxHQUFHLENBQUMsQ0FBQztZQUVwQixTQUFTLGNBQWMsQ0FBQyxNQUFjO2dCQUNwQyxPQUFPLElBQUksRUFBRTtvQkFDWCxJQUFJLE1BQU0sR0FBYSxFQUFFLENBQUM7b0JBQzFCLElBQUksS0FBSyxHQUFHLFdBQVcsRUFBRSxDQUFDO29CQUMxQixJQUFJLElBQUksR0FBRyxrQkFBa0IsQ0FBQztvQkFDOUIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRTt3QkFDbEMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO3dCQUMxQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO3FCQUN6QztvQkFDRCxJQUFNLFFBQU0sR0FBRyxXQUFTLE1BQU0sR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBRyxDQUFDO29CQUNuRCxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxRQUFNLENBQUM7d0JBQUUsT0FBTyxRQUFNLENBQUM7aUJBQy9DO1lBQ0gsQ0FBQztZQUVELGVBQWUsQ0FBQyxPQUFPLENBQUMsVUFBQSxNQUFNLElBQUksT0FBQSxLQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxFQUExQixDQUEwQixDQUFDLENBQUM7WUFFOUQsSUFBTSxVQUFVLEdBQUcsSUFBSSxHQUFHLEVBQW9CLENBQUM7WUFDL0MsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUEsTUFBTTtnQkFDaEQsSUFBSSxNQUFNLENBQUMsVUFBVSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRTtvQkFDekMsSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztvQkFDdkIsSUFBTSxVQUFVLEdBQU0sTUFBTSxDQUFDLFdBQVksQ0FBQyxNQUFNLFNBQUksTUFBTSxDQUFDLFdBQVksQ0FBQyxJQUFNLENBQUM7b0JBQy9FLElBQUksTUFBTSxDQUFDLFNBQVMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUU7d0JBQzNDLElBQUksR0FBRyxjQUFjLENBQUMsS0FBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7d0JBQ2hELE1BQU0sQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO3FCQUMzQjtvQkFDRCxJQUFJLFVBQVUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEVBQUU7d0JBQzlCLElBQU0sS0FBSyxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7d0JBQ3pDLEtBQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ25CO3lCQUFNO3dCQUNMLFVBQVUsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztxQkFDcEM7b0JBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxLQUFNLENBQUM7aUJBQzlCO1lBQ0gsQ0FBQyxDQUFDLENBQUM7WUFFSCwrQkFBK0I7WUFDL0IsVUFBVSxDQUFDLE9BQU8sQ0FBQyxVQUFDLEtBQWUsRUFBRSxVQUFrQjtnQkFDckQsSUFBSSxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtvQkFDZCxJQUFBLEtBQUEsZUFBeUIsVUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBQSxFQUE3QyxRQUFNLFFBQUEsRUFBRSxZQUFZLFFBQXlCLENBQUM7b0JBQ3JELHlEQUF5RDtvQkFDekQsSUFBSSxXQUFTLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztvQkFDNUMsSUFBSSxXQUFTLEtBQUssQ0FBQyxDQUFDLEVBQUU7d0JBQ3BCLFdBQVMsR0FBRyxDQUFDLENBQUM7cUJBQ2Y7b0JBRUQsc0RBQXNEO29CQUN0RCxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQUMsSUFBWSxFQUFFLENBQVM7d0JBQ3BDLElBQUksQ0FBQyxLQUFLLFdBQVMsRUFBRTs0QkFDbkIsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUMsVUFBVSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLFdBQVMsQ0FBQyxFQUFDLENBQUM7eUJBQ2xFO29CQUNILENBQUMsQ0FBQyxDQUFDO2lCQUNKO1lBQ0gsQ0FBQyxDQUFDLENBQUM7WUFFSCxPQUFPLE1BQU0sQ0FBQztRQUNoQixDQUFDO1FBRU8sc0NBQVksR0FBcEIsVUFBcUIsZUFBeUI7O1lBRTVDLElBQU0sT0FBTyxHQUFHLElBQUksR0FBRyxFQUF3QixDQUFDO1lBQ2hELElBQU0sVUFBVSxHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7O2dCQUNyQyxLQUFxQixJQUFBLG9CQUFBLGlCQUFBLGVBQWUsQ0FBQSxnREFBQSw2RUFBRTtvQkFBakMsSUFBTSxNQUFNLDRCQUFBO29CQUNmLElBQUksTUFBTSxDQUFDLFFBQVEsRUFBRTt3QkFDbkIseUZBQXlGO3dCQUN6RixJQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsV0FBWSxDQUFDO3dCQUN4QyxJQUFNLFFBQU0sR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDO3dCQUNsQyxJQUFJLFdBQVksQ0FBQyxJQUFJLElBQUksR0FBRyxFQUFFOzRCQUM1Qiw0QkFBNEI7NEJBQzVCLFVBQVUsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO3lCQUNwQzs2QkFBTTs0QkFDTCw2Q0FBNkM7NEJBQzdDLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBTSxDQUFDLENBQUM7NEJBQ2hDLElBQUksQ0FBQyxLQUFLLEVBQUU7Z0NBQ1YsS0FBSyxHQUFHLEVBQUUsQ0FBQztnQ0FDWCxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQU0sRUFBRSxLQUFLLENBQUMsQ0FBQzs2QkFDNUI7NEJBQ0QsSUFBTSxFQUFFLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQzs0QkFDdkIsSUFBTSxJQUFJLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQzs0QkFDOUIsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFDLElBQUksTUFBQSxFQUFFLEVBQUUsSUFBQSxFQUFDLENBQUMsQ0FBQzt5QkFDeEI7cUJBQ0Y7aUJBQ0Y7Ozs7Ozs7OztZQUNELHNFQUNLLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUEsSUFBSSxJQUFJLE9BQUEsQ0FBQyxFQUFDLElBQUksTUFBQSxFQUFDLENBQUMsRUFBUixDQUFRLENBQUMsbUJBQ3JELEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUMsRUFBZTtvQkFBZixLQUFBLHFCQUFlLEVBQWQsSUFBSSxRQUFBLEVBQUUsT0FBTyxRQUFBO2dCQUFNLE9BQUEsQ0FBQyxFQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsSUFBSSxNQUFBLEVBQUMsQ0FBQztZQUF6QixDQUF5QixDQUFDLEdBQ3BGO1FBQ0osQ0FBQztRQUVPLHVDQUFhLEdBQXJCLFVBQXNCLE1BQWM7WUFDbEMsa0VBQWtFO1lBQ2xFLElBQU0sZUFBZSxHQUFHLE1BQU0sQ0FBQyxlQUFnQixDQUFDO1lBRWhELElBQUksQ0FBQyxlQUFlLENBQUMsVUFBVSxFQUFFO2dCQUMvQixlQUFlLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztnQkFDbEMsc0VBQXNFO2dCQUN0RSxJQUFNLFdBQVcsR0FBRyxlQUFlLENBQUMsV0FBWSxDQUFDO2dCQUNqRCxJQUFNLFFBQU0sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDcEQsSUFBSSxRQUFNLEVBQUU7b0JBQ1YsSUFBTSxLQUFLLEdBQUcsUUFBTSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ2hELElBQUksS0FBSyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEVBQUU7d0JBQ2hELGVBQWUsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO3FCQUN0RTtpQkFDRjthQUNGO1FBQ0gsQ0FBQztRQUVPLHNDQUFZLEdBQXBCLFVBQXFCLFVBQWtCLEVBQUUsS0FBb0I7WUFDM0QsSUFBSSx3QkFBZSxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUMxQixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQzdDO1lBQ0QsSUFBSSwyQkFBa0IsQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDN0IsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQzthQUNoRDtZQUNELElBQUksNEJBQW1CLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQzlCLE9BQU8sS0FBSyxDQUFDO2FBQ2Q7WUFDRCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzlDLENBQUM7UUFFTyxzQ0FBWSxHQUFwQixVQUFxQixVQUFrQixFQUFFLEtBQW9CO1lBQTdELGlCQVVDO1lBVEMsT0FBTztnQkFDTCxVQUFVLEVBQUUsT0FBTztnQkFDbkIsS0FBSyxFQUFFLEtBQUssQ0FBQyxLQUFLO2dCQUNsQixPQUFPLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFHO2dCQUM1RCxVQUFVLEVBQ04sS0FBSyxDQUFDLFVBQVUsSUFBSSxLQUFLLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLEtBQUksQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFHLEVBQXZDLENBQXVDLENBQUM7Z0JBQzFGLE9BQU8sRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsT0FBUyxDQUFDO2dCQUN6RCxPQUFPLEVBQUUsS0FBSyxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDO2FBQ3pFLENBQUM7UUFDSixDQUFDO1FBRU8sd0NBQWMsR0FBdEIsVUFBdUIsVUFBa0IsRUFBRSxPQUFvQjtZQUEvRCxpQkFPQztZQU5DLElBQU0sTUFBTSxHQUFnQixFQUFFLENBQUM7WUFDL0IsS0FBSyxJQUFNLElBQUksSUFBSSxPQUFPLEVBQUU7Z0JBQzFCLElBQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDNUIsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxLQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsRUFBakMsQ0FBaUMsQ0FBQyxDQUFDO2FBQ2xFO1lBQ0QsT0FBTyxNQUFNLENBQUM7UUFDaEIsQ0FBQztRQUVPLHVDQUFhLEdBQXJCLFVBQXNCLFVBQWtCLEVBQUUsTUFBc0I7WUFBaEUsaUJBZ0JDO1lBZkMsSUFBTSxNQUFNLEdBQW1CLEVBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxVQUFVLEVBQUMsQ0FBQztZQUMvRCxNQUFNLENBQUMsVUFBVTtnQkFDYixNQUFNLENBQUMsVUFBVSxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsS0FBSSxDQUFDLGlCQUFpQixDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUUsRUFBdEMsQ0FBc0MsQ0FBQyxDQUFDO1lBQzVGLElBQUkseUJBQWdCLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQzNCLE1BQXlCLENBQUMsbUJBQW1CLEdBQUcsTUFBTSxDQUFDLG1CQUFtQjtvQkFDdkUsTUFBTSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FDMUIsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLEtBQUksQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFFLEVBQXRDLENBQXNDLENBQUMsRUFBdkQsQ0FBdUQsQ0FBQyxDQUFDO2dCQUN0RSxJQUFJLDhCQUFxQixDQUFDLE1BQU0sQ0FBQyxFQUFFO29CQUNqQyxJQUFJLE1BQU0sQ0FBQyxVQUFVLEVBQUU7d0JBQ3BCLE1BQThCLENBQUMsVUFBVTs0QkFDdEMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxLQUFJLENBQUMsaUJBQWlCLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxFQUFyQyxDQUFxQyxDQUFDLENBQUM7cUJBQ3ZFO2lCQUNGO2FBQ0Y7WUFDRCxPQUFPLE1BQU0sQ0FBQztRQUNoQixDQUFDO1FBRU8sd0NBQWMsR0FBdEIsVUFBdUIsVUFBa0IsRUFBRSxPQUF3QjtZQUNqRSxJQUFJLE1BQU0sR0FBb0IsRUFBRSxDQUFDO1lBQ2pDLEtBQUssSUFBTSxHQUFHLElBQUksT0FBTyxFQUFFO2dCQUN6QixJQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBRTNCLElBQUksMkJBQWtCLENBQUMsS0FBSyxDQUFDLEVBQUU7b0JBQzdCLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQztpQkFDdkQ7cUJBQU0sSUFBSSx5Q0FBZ0MsQ0FBQyxLQUFLLENBQUMsRUFBRTtvQkFDbEQsaUZBQWlGO29CQUNqRiw0RUFBNEU7b0JBQzVFLHlGQUF5RjtvQkFDekYsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDO2lCQUNwRDtxQkFBTTtvQkFDTCxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO2lCQUNyQjthQUNGO1lBQ0QsT0FBTyxNQUFNLENBQUM7UUFDaEIsQ0FBQztRQUVPLHlDQUFlLEdBQXZCLFVBQXdCLFVBQWtCLEVBQUUsS0FBdUI7WUFBbkUsaUJBT0M7WUFOQyxPQUFPO2dCQUNMLFVBQVUsRUFBRSxVQUFVO2dCQUN0QixVQUFVLEVBQUUsS0FBSyxDQUFDLFVBQVU7Z0JBQzVCLFFBQVEsRUFBRSxLQUFLLENBQUMsUUFBUSxJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsS0FBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLEVBQWhDLENBQWdDLENBQUM7Z0JBQ3JGLEtBQUssRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDO2FBQ2xELENBQUM7UUFDSixDQUFDO1FBRU8sc0NBQVksR0FBcEIsVUFBcUIsVUFBa0IsRUFBRSxLQUFvQjtZQUE3RCxpQkFxQkM7WUFwQkMsSUFBSSxXQUFXLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ3RCLE9BQU8sS0FBSyxDQUFDO2FBQ2Q7WUFDRCxJQUFJLHdCQUFlLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQzFCLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFDN0M7WUFDRCxJQUFJLHFDQUE0QixDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUN2QyxPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFFLENBQUM7YUFDbkQ7WUFDRCxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ3hCLE9BQU8sS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLEtBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxFQUFoQyxDQUFnQyxDQUFDLENBQUM7YUFDekQ7WUFFRCxxQ0FBcUM7WUFDckMsSUFBTSxNQUFNLEdBQUcsS0FBdUIsQ0FBQztZQUN2QyxJQUFNLE1BQU0sR0FBbUIsRUFBRSxDQUFDO1lBQ2xDLEtBQUssSUFBTSxHQUFHLElBQUksTUFBTSxFQUFFO2dCQUN4QixNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7YUFDMUQ7WUFDRCxPQUFPLE1BQU0sQ0FBQztRQUNoQixDQUFDO1FBRU8sMkNBQWlCLEdBQXpCLFVBQ0ksVUFBa0IsRUFBRSxLQUE4RDtZQUVwRixJQUFJLEtBQUssRUFBRTtnQkFDVCxRQUFRLEtBQUssQ0FBQyxVQUFVLEVBQUU7b0JBQ3hCLEtBQUssT0FBTzt3QkFDVixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLEtBQXNCLENBQUMsQ0FBQztvQkFDL0QsS0FBSyxXQUFXO3dCQUNkLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsRUFBRSxLQUE0QyxDQUFDLENBQUM7b0JBQ3pGO3dCQUNFLE9BQU8sSUFBSSxDQUFDLHFCQUFxQixDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQztpQkFDeEQ7YUFDRjtZQUNELE9BQU8sS0FBSyxDQUFDO1FBQ2YsQ0FBQztRQUVPLHNDQUFZLEdBQXBCLFVBQXFCLE1BQWMsRUFBRSxLQUFvQjtZQUN2RCxPQUFPO2dCQUNMLFVBQVUsRUFBRSxPQUFPO2dCQUNuQixPQUFPLEVBQUUsS0FBSyxDQUFDLE9BQU87Z0JBQ3RCLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSTtnQkFDaEIsU0FBUyxFQUFFLEtBQUssQ0FBQyxTQUFTO2dCQUMxQixPQUFPLEVBQUUsS0FBSyxDQUFDLE9BQU87Z0JBQ3RCLE1BQU0sUUFBQTthQUNQLENBQUM7UUFDSixDQUFDO1FBRU8sMENBQWdCLEdBQXhCLFVBQXlCLFVBQWtCLEVBQUUsS0FBMEM7WUFBdkYsaUJBeUZDO1lBdkZDLElBQU0sZUFBZSxHQUFHLFVBQUMsTUFBYztnQkFDckMsSUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLFdBQVksQ0FBQztnQkFDeEMsSUFBSSxXQUFXLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRTtvQkFDdEMsb0ZBQW9GO29CQUNwRixrQ0FBa0M7b0JBQ2xDLEtBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQzNCLE9BQU87d0JBQ0wsVUFBVSxFQUFFLFdBQVc7d0JBQ3ZCLElBQUksSUFBSTs0QkFDTiwyREFBMkQ7NEJBQzNELElBQU0sZUFBZSxHQUFHLE1BQU0sQ0FBQyxlQUFnQixDQUFDOzRCQUNoRCxJQUFJLGVBQWUsQ0FBQyxTQUFTLElBQUksSUFBSSxFQUFFO2dDQUNyQyxNQUFNLEtBQUssQ0FBQyw4Q0FBOEMsQ0FBQyxDQUFDOzZCQUM3RDs0QkFDRCxPQUFPLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxXQUFZLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUM7d0JBQ3pGLENBQUM7cUJBQ0YsQ0FBQztpQkFDSDtxQkFBTTtvQkFDTCxxRkFBcUY7b0JBQ3JGLDRCQUE0QjtvQkFDNUIsT0FBTyxFQUFDLFVBQVUsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLFdBQVcsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFdBQVcsQ0FBQyxNQUFNLEVBQUMsQ0FBQztpQkFDdEY7WUFDSCxDQUFDLENBQUM7WUFFRixJQUFJLDRDQUFtQyxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUM5QyxJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUM5QyxJQUFJLFFBQVEsSUFBSSxRQUFRLENBQUMsUUFBUSxJQUFJLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFO29CQUNsRSw4Q0FBOEM7b0JBQzlDLE9BQU8sZUFBZSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7aUJBQ3hFO2dCQUVELG9FQUFvRTtnQkFDcEUsSUFBSSxLQUFLLENBQUMsU0FBUyxFQUFFO29CQUNuQixPQUFPO3dCQUNMLFVBQVUsRUFBRSxXQUFXO3dCQUN2QixJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUk7d0JBQ2hCLFNBQVMsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLEtBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxFQUFoQyxDQUFnQyxDQUFDO3FCQUN0RSxDQUFDO2lCQUNIO2dCQUVELGdGQUFnRjtnQkFDaEYsT0FBTyxLQUFLLENBQUM7YUFDZDtZQUVELElBQUksb0RBQTJDLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ3RELDJGQUEyRjtnQkFDM0YsMEZBQTBGO2dCQUMxRix1RkFBdUY7Z0JBQ3ZGLDRGQUE0RjtnQkFDNUYseUZBQXlGO2dCQUN6RixTQUFTO2dCQUVULElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUU7b0JBQ2hDLDJGQUEyRjtvQkFDM0YsMkJBQTJCO29CQUMzQixJQUFNLGdCQUFnQixHQUFHLGFBQWEsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO29CQUNqRSxJQUFNLGNBQWMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO29CQUNsQyxPQUFPLGVBQWUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsZ0JBQWdCLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQztpQkFDbEY7Z0JBRUQsK0RBQStEO2dCQUMvRCxJQUFJLEtBQUssQ0FBQyxTQUFTLEVBQUU7b0JBQ25CLG1FQUFtRTtvQkFDbkUsT0FBTzt3QkFDTCxVQUFVLEVBQUUsV0FBVzt3QkFDdkIsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJO3dCQUNoQixNQUFNLEVBQUUsS0FBSyxDQUFDLE1BQU07d0JBQ3BCLFNBQVMsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLEtBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxFQUFoQyxDQUFnQyxDQUFDO3FCQUN0RSxDQUFDO2lCQUNIO2dCQUNELE9BQU8sS0FBSyxDQUFDO2FBQ2Q7WUFFRCxJQUFJLDRDQUFtQyxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUM5Qyw4RkFBOEY7Z0JBQzlGLGtCQUFrQjtnQkFDbEIsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRTtvQkFDaEMsT0FBTzt3QkFDTCxVQUFVLEVBQUUsT0FBTzt3QkFDbkIsT0FBTyxFQUFFLHNDQUFzQzt3QkFDL0MsT0FBTyxFQUFFLEVBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxNQUFNLEVBQUM7cUJBQ2hDLENBQUM7aUJBQ0g7Z0JBRUQsa0RBQWtEO2dCQUNsRCxPQUFPLEtBQUssQ0FBQzthQUNkO1FBQ0gsQ0FBQztRQUVPLCtDQUFxQixHQUE3QixVQUE4QixVQUFrQixFQUFFLEtBQWlDO1lBRWpGLElBQU0sTUFBTSxHQUErQixFQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsVUFBVSxFQUFRLENBQUM7WUFDakYsS0FBSyxJQUFNLEdBQUcsSUFBSSxLQUFLLEVBQUU7Z0JBQ3RCLE1BQWMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRyxLQUFhLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQzthQUMzRTtZQUNELE9BQU8sTUFBTSxDQUFDO1FBQ2hCLENBQUM7UUFFTyxrQ0FBUSxHQUFoQixVQUFpQixNQUFjLEVBQUUsSUFBWTtZQUMzQyxJQUFNLFNBQVMsR0FBTSxNQUFNLFNBQUksSUFBTSxDQUFDO1lBQ3RDLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzNDLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ1gsTUFBTSxHQUFHLEVBQUMsTUFBTSxRQUFBLEVBQUUsSUFBSSxNQUFBLEVBQUMsQ0FBQztnQkFDeEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO2FBQ3ZDO1lBQ0QsT0FBTyxNQUFNLENBQUM7UUFDaEIsQ0FBQztRQUVPLDJDQUFpQixHQUF6QixVQUEwQixNQUFjLEVBQUUsSUFBWTtZQUNwRCxtQ0FBbUM7WUFDbkMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN2QixJQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztZQUMzQyxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRTtnQkFDM0IsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQ2pDO1lBQ0QsT0FBTyxNQUFNLENBQUM7UUFDaEIsQ0FBQztRQUNILHNCQUFDO0lBQUQsQ0FBQyxBQXJoQkQsSUFxaEJDO0lBcmhCWSwwQ0FBZTtJQXVoQjVCO1FBR0UsNkJBQ1ksSUFBcUIsRUFBVSxLQUF5QixFQUN4RCxPQUEyQjtZQUQzQixTQUFJLEdBQUosSUFBSSxDQUFpQjtZQUFVLFVBQUssR0FBTCxLQUFLLENBQW9CO1lBQ3hELFlBQU8sR0FBUCxPQUFPLENBQW9CO1lBSi9CLGNBQVMsR0FBRyxJQUFJLDZCQUFpQixFQUFFLENBQUM7UUFJRixDQUFDO1FBRTNDLDRDQUFjLEdBQWQsVUFBZSxRQUFnQixFQUFFLGNBQXNCO1lBQzlDLElBQUEsY0FBYyxHQUNqQixFQUFFLENBQUMsaUJBQWlCLENBQUMsUUFBUSxFQUFFLGNBQWMsRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsZUFEdEQsQ0FDdUQ7WUFFNUUsSUFBSSxVQUFtQyxDQUFDO1lBQ3hDLElBQUksY0FBYyxFQUFFO2dCQUNiLElBQUEsZ0JBQWdCLEdBQUksY0FBYyxpQkFBbEIsQ0FBbUI7Z0JBQ3hDLElBQUksY0FBYyxDQUFDLFNBQVMsS0FBSyxLQUFLLEVBQUU7b0JBQ3RDLGdCQUFnQixHQUFHLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRSxLQUFLLENBQUMsQ0FBQztpQkFDdkU7Z0JBQ0QsVUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLGdCQUFnQixFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDaEY7aUJBQU07Z0JBQ0wsd0VBQXdFO2dCQUN4RSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztvQkFBRSxPQUFPLFNBQVMsQ0FBQztnQkFDOUQsVUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsR0FBRyxLQUFLLEVBQUUsRUFBRSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUNoRjtZQUVELDRGQUE0RjtZQUM1RixzREFBc0Q7WUFDdEQsSUFBSSxDQUFDLFVBQVUsRUFBRTtnQkFDZixPQUFPLFNBQVMsQ0FBQzthQUNsQjtpQkFBTSxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7Z0JBQ3JCLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7YUFDM0M7aUJBQU07Z0JBQ0wsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQzthQUMvQztRQUNILENBQUM7UUFDSCwwQkFBQztJQUFELENBQUMsQUFsQ0QsSUFrQ0M7SUFsQ1ksa0RBQW1CO0lBb0NoQyxTQUFTLGFBQWEsQ0FBQyxVQUFrQixFQUFFLElBQVk7UUFDckQsSUFBSSxVQUFVLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksRUFBRTtZQUN0QyxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQzNFLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ3ZELDRFQUE0RTtnQkFDNUUsVUFBVSxHQUFHLE1BQUksSUFBSSxDQUFDLEdBQUcsR0FBRyxVQUFZLENBQUM7YUFDMUM7WUFDRCxvRkFBb0Y7WUFDcEYsa0RBQWtEO1lBQ2xELE9BQU8sVUFBVSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7U0FDdkM7UUFDRCxPQUFPLFVBQVUsQ0FBQztJQUNwQixDQUFDO0lBRUQsU0FBUyxXQUFXLENBQUMsQ0FBTTtRQUN6QixPQUFPLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxVQUFVLElBQUksT0FBTyxDQUFDLEtBQUssUUFBUSxDQUFDLENBQUM7SUFDMUUsQ0FBQztJQUVELFNBQVMsYUFBYSxDQUFDLE1BQWM7UUFDbkMsT0FBTyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFDM0UsQ0FBQztJQUVELFNBQVMsb0JBQW9CLENBQUMsTUFBYztRQUMxQyxPQUFPLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO0lBQ3hFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHtNZXRhZGF0YUNhY2hlfSBmcm9tICcuLi90cmFuc2Zvcm1lcnMvbWV0YWRhdGFfY2FjaGUnO1xuXG5pbXBvcnQge01ldGFkYXRhQ29sbGVjdG9yfSBmcm9tICcuL2NvbGxlY3Rvcic7XG5pbXBvcnQge0NsYXNzTWV0YWRhdGEsIENvbnN0cnVjdG9yTWV0YWRhdGEsIEZ1bmN0aW9uTWV0YWRhdGEsIGlzQ2xhc3NNZXRhZGF0YSwgaXNDb25zdHJ1Y3Rvck1ldGFkYXRhLCBpc0Z1bmN0aW9uTWV0YWRhdGEsIGlzSW50ZXJmYWNlTWV0YWRhdGEsIGlzTWV0YWRhdGFFcnJvciwgaXNNZXRhZGF0YUdsb2JhbFJlZmVyZW5jZUV4cHJlc3Npb24sIGlzTWV0YWRhdGFJbXBvcnRlZFN5bWJvbFJlZmVyZW5jZUV4cHJlc3Npb24sIGlzTWV0YWRhdGFNb2R1bGVSZWZlcmVuY2VFeHByZXNzaW9uLCBpc01ldGFkYXRhU3ltYm9saWNDYWxsRXhwcmVzc2lvbiwgaXNNZXRhZGF0YVN5bWJvbGljRXhwcmVzc2lvbiwgaXNNZXRob2RNZXRhZGF0YSwgTWVtYmVyTWV0YWRhdGEsIE1FVEFEQVRBX1ZFUlNJT04sIE1ldGFkYXRhRW50cnksIE1ldGFkYXRhRXJyb3IsIE1ldGFkYXRhTWFwLCBNZXRhZGF0YU9iamVjdCwgTWV0YWRhdGFTeW1ib2xpY0V4cHJlc3Npb24sIE1ldGFkYXRhU3ltYm9saWNSZWZlcmVuY2VFeHByZXNzaW9uLCBNZXRhZGF0YVZhbHVlLCBNZXRob2RNZXRhZGF0YSwgTW9kdWxlRXhwb3J0TWV0YWRhdGEsIE1vZHVsZU1ldGFkYXRhfSBmcm9tICcuL3NjaGVtYSc7XG5cblxuXG4vLyBUaGUgY2hhcmFjdGVyIHNldCB1c2VkIHRvIHByb2R1Y2UgcHJpdmF0ZSBuYW1lcy5cbmNvbnN0IFBSSVZBVEVfTkFNRV9DSEFSUyA9ICdhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5eic7XG5cbmludGVyZmFjZSBTeW1ib2wge1xuICBtb2R1bGU6IHN0cmluZztcbiAgbmFtZTogc3RyaW5nO1xuXG4gIC8vIFByb2R1Y2VkIGJ5IGluZGlyZWN0bHkgYnkgZXhwb3J0QWxsKCkgZm9yIHN5bWJvbHMgcmUtZXhwb3J0IGFub3RoZXIgc3ltYm9sLlxuICBleHBvcnRzPzogU3ltYm9sO1xuXG4gIC8vIFByb2R1Y2VkIGJ5IGluZGlyZWN0bHkgYnkgZXhwb3J0QWxsKCkgZm9yIHN5bWJvbHMgYXJlIHJlLWV4cG9ydGVkIGJ5IGFub3RoZXIgc3ltYm9sLlxuICByZWV4cG9ydGVkQXM/OiBTeW1ib2w7XG5cbiAgLy8gUHJvZHVjZWQgYnkgY2Fub25pY2FsaXplU3ltYm9scygpIGZvciBhbGwgc3ltYm9scy4gQSBzeW1ib2wgaXMgcHJpdmF0ZSBpZiBpdCBpcyBub3RcbiAgLy8gZXhwb3J0ZWQgYnkgdGhlIGluZGV4LlxuICBpc1ByaXZhdGU/OiBib29sZWFuO1xuXG4gIC8vIFByb2R1Y2VkIGJ5IGNhbm9uaWNhbGl6ZVN5bWJvbHMoKSBmb3IgYWxsIHN5bWJvbHMuIFRoaXMgaXMgdGhlIG9uZSBzeW1ib2wgdGhhdFxuICAvLyByZXNwcmVzZW50cyBhbGwgb3RoZXIgc3ltYm9scyBhbmQgaXMgdGhlIG9ubHkgc3ltYm9sIHRoYXQsIGFtb25nIGFsbCB0aGUgcmUtZXhwb3J0ZWRcbiAgLy8gYWxpYXNlcywgd2hvc2UgZmllbGRzIGNhbiBiZSB0cnVzdGVkIHRvIGNvbnRhaW4gdGhlIGNvcnJlY3QgaW5mb3JtYXRpb24uXG4gIC8vIEZvciBwcml2YXRlIHN5bWJvbHMgdGhpcyBpcyB0aGUgZGVjbGFyYXRpb24gc3ltYm9sLiBGb3IgcHVibGljIHN5bWJvbHMgdGhpcyBpcyB0aGVcbiAgLy8gc3ltYm9sIHRoYXQgaXMgZXhwb3J0ZWQuXG4gIGNhbm9uaWNhbFN5bWJvbD86IFN5bWJvbDtcblxuICAvLyBQcm9kdWNlZCBieSBjYW5vbmljYWxpemVTeW1ib2xzKCkgZm9yIGFsbCBzeW1ib2xzLiBUaGlzIHRoZSBzeW1ib2wgdGhhdCBvcmlnaW5hbGx5XG4gIC8vIGRlY2xhcmVkIHRoZSB2YWx1ZSBhbmQgc2hvdWxkIGJlIHVzZWQgdG8gZmV0Y2ggdGhlIHZhbHVlLlxuICBkZWNsYXJhdGlvbj86IFN5bWJvbDtcblxuICAvLyBBIHN5bWJvbCBpcyByZWZlcmVuY2VkIGlmIGl0IGlzIGV4cG9ydGVkIGZyb20gaW5kZXggb3IgcmVmZXJlbmNlZCBieSB0aGUgdmFsdWUgb2ZcbiAgLy8gYSByZWZlcmVuY2VkIHN5bWJvbCdzIHZhbHVlLlxuICByZWZlcmVuY2VkPzogYm9vbGVhbjtcblxuICAvLyBBIHN5bWJvbCBpcyBtYXJrZWQgYXMgYSByZS1leHBvcnQgdGhlIHN5bWJvbCB3YXMgcmV4cG9ydGVkIGZyb20gYSBtb2R1bGUgdGhhdCBpc1xuICAvLyBub3QgcGFydCBvZiB0aGUgZmxhdCBtb2R1bGUgYnVuZGxlLlxuICByZWV4cG9ydD86IGJvb2xlYW47XG5cbiAgLy8gT25seSB2YWxpZCBmb3IgcmVmZXJlbmNlZCBjYW5vbmljYWwgc3ltYm9scy4gUHJvZHVjZXMgYnkgY29udmVydFN5bWJvbHMoKS5cbiAgdmFsdWU/OiBNZXRhZGF0YUVudHJ5O1xuXG4gIC8vIE9ubHkgdmFsaWQgZm9yIHJlZmVyZW5jZWQgcHJpdmF0ZSBzeW1ib2xzLiBJdCBpcyB0aGUgbmFtZSB0byB1c2UgdG8gaW1wb3J0IHRoZSBzeW1ib2wgZnJvbVxuICAvLyB0aGUgYnVuZGxlIGluZGV4LiBQcm9kdWNlIGJ5IGFzc2lnblByaXZhdGVOYW1lcygpO1xuICBwcml2YXRlTmFtZT86IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBCdW5kbGVFbnRyaWVzIHtcbiAgW25hbWU6IHN0cmluZ106IE1ldGFkYXRhRW50cnk7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQnVuZGxlUHJpdmF0ZUVudHJ5IHtcbiAgcHJpdmF0ZU5hbWU6IHN0cmluZztcbiAgbmFtZTogc3RyaW5nO1xuICBtb2R1bGU6IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBCdW5kbGVkTW9kdWxlIHtcbiAgbWV0YWRhdGE6IE1vZHVsZU1ldGFkYXRhO1xuICBwcml2YXRlczogQnVuZGxlUHJpdmF0ZUVudHJ5W107XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTWV0YWRhdGFCdW5kbGVySG9zdCB7XG4gIGdldE1ldGFkYXRhRm9yKG1vZHVsZU5hbWU6IHN0cmluZywgY29udGFpbmluZ0ZpbGU6IHN0cmluZyk6IE1vZHVsZU1ldGFkYXRhfHVuZGVmaW5lZDtcbn1cblxudHlwZSBTdGF0aWNzTWV0YWRhdGEgPSB7XG4gIFtuYW1lOiBzdHJpbmddOiBNZXRhZGF0YVZhbHVlfEZ1bmN0aW9uTWV0YWRhdGE7XG59O1xuXG5leHBvcnQgY2xhc3MgTWV0YWRhdGFCdW5kbGVyIHtcbiAgcHJpdmF0ZSBzeW1ib2xNYXAgPSBuZXcgTWFwPHN0cmluZywgU3ltYm9sPigpO1xuICBwcml2YXRlIG1ldGFkYXRhQ2FjaGUgPSBuZXcgTWFwPHN0cmluZywgTW9kdWxlTWV0YWRhdGF8dW5kZWZpbmVkPigpO1xuICBwcml2YXRlIGV4cG9ydHMgPSBuZXcgTWFwPHN0cmluZywgU3ltYm9sW10+KCk7XG4gIHByaXZhdGUgcm9vdE1vZHVsZTogc3RyaW5nO1xuICBwcml2YXRlIHByaXZhdGVTeW1ib2xQcmVmaXg6IHN0cmluZztcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHByaXZhdGUgZXhwb3J0ZWQhOiBTZXQ8U3ltYm9sPjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgcm9vdDogc3RyaW5nLCBwcml2YXRlIGltcG9ydEFzOiBzdHJpbmd8dW5kZWZpbmVkLCBwcml2YXRlIGhvc3Q6IE1ldGFkYXRhQnVuZGxlckhvc3QsXG4gICAgICBwcml2YXRlU3ltYm9sUHJlZml4Pzogc3RyaW5nKSB7XG4gICAgdGhpcy5yb290TW9kdWxlID0gYC4vJHtwYXRoLmJhc2VuYW1lKHJvb3QpfWA7XG4gICAgdGhpcy5wcml2YXRlU3ltYm9sUHJlZml4ID0gKHByaXZhdGVTeW1ib2xQcmVmaXggfHwgJycpLnJlcGxhY2UoL1xcVy9nLCAnXycpO1xuICB9XG5cbiAgZ2V0TWV0YWRhdGFCdW5kbGUoKTogQnVuZGxlZE1vZHVsZSB7XG4gICAgLy8gRXhwb3J0IHRoZSByb290IG1vZHVsZS4gVGhpcyBhbHNvIGNvbGxlY3RzIHRoZSB0cmFuc2l0aXZlIGNsb3N1cmUgb2YgYWxsIHZhbHVlcyByZWZlcmVuY2VkIGJ5XG4gICAgLy8gdGhlIGV4cG9ydHMuXG4gICAgY29uc3QgZXhwb3J0ZWRTeW1ib2xzID0gdGhpcy5leHBvcnRBbGwodGhpcy5yb290TW9kdWxlKTtcbiAgICB0aGlzLmNhbm9uaWNhbGl6ZVN5bWJvbHMoZXhwb3J0ZWRTeW1ib2xzKTtcbiAgICAvLyBUT0RPOiBleHBvcnRzPyBlLmcuIGEgbW9kdWxlIHJlLWV4cG9ydHMgYSBzeW1ib2wgZnJvbSBhbm90aGVyIGJ1bmRsZVxuICAgIGNvbnN0IG1ldGFkYXRhID0gdGhpcy5nZXRFbnRyaWVzKGV4cG9ydGVkU3ltYm9scyk7XG4gICAgY29uc3QgcHJpdmF0ZXMgPSBBcnJheS5mcm9tKHRoaXMuc3ltYm9sTWFwLnZhbHVlcygpKVxuICAgICAgICAgICAgICAgICAgICAgICAgIC5maWx0ZXIocyA9PiBzLnJlZmVyZW5jZWQgJiYgcy5pc1ByaXZhdGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgLm1hcChzID0+ICh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByaXZhdGVOYW1lOiBzLnByaXZhdGVOYW1lISxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogcy5kZWNsYXJhdGlvbiEubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlOiBzLmRlY2xhcmF0aW9uIS5tb2R1bGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICBjb25zdCBvcmlnaW5zID0gQXJyYXkuZnJvbSh0aGlzLnN5bWJvbE1hcC52YWx1ZXMoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5maWx0ZXIocyA9PiBzLnJlZmVyZW5jZWQgJiYgIXMucmVleHBvcnQpXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVkdWNlPHtbbmFtZTogc3RyaW5nXTogc3RyaW5nfT4oKHAsIHMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcFtzLmlzUHJpdmF0ZSA/IHMucHJpdmF0ZU5hbWUhIDogcy5uYW1lXSA9IHMuZGVjbGFyYXRpb24hLm1vZHVsZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHA7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB7fSk7XG4gICAgY29uc3QgZXhwb3J0cyA9IHRoaXMuZ2V0UmVFeHBvcnRzKGV4cG9ydGVkU3ltYm9scyk7XG4gICAgcmV0dXJuIHtcbiAgICAgIG1ldGFkYXRhOiB7XG4gICAgICAgIF9fc3ltYm9saWM6ICdtb2R1bGUnLFxuICAgICAgICB2ZXJzaW9uOiBNRVRBREFUQV9WRVJTSU9OLFxuICAgICAgICBleHBvcnRzOiBleHBvcnRzLmxlbmd0aCA/IGV4cG9ydHMgOiB1bmRlZmluZWQsXG4gICAgICAgIG1ldGFkYXRhLFxuICAgICAgICBvcmlnaW5zLFxuICAgICAgICBpbXBvcnRBczogdGhpcy5pbXBvcnRBcyFcbiAgICAgIH0sXG4gICAgICBwcml2YXRlc1xuICAgIH07XG4gIH1cblxuICBzdGF0aWMgcmVzb2x2ZU1vZHVsZShpbXBvcnROYW1lOiBzdHJpbmcsIGZyb206IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHJlc29sdmVNb2R1bGUoaW1wb3J0TmFtZSwgZnJvbSk7XG4gIH1cblxuICBwcml2YXRlIGdldE1ldGFkYXRhKG1vZHVsZU5hbWU6IHN0cmluZyk6IE1vZHVsZU1ldGFkYXRhfHVuZGVmaW5lZCB7XG4gICAgbGV0IHJlc3VsdCA9IHRoaXMubWV0YWRhdGFDYWNoZS5nZXQobW9kdWxlTmFtZSk7XG4gICAgaWYgKCFyZXN1bHQpIHtcbiAgICAgIGlmIChtb2R1bGVOYW1lLnN0YXJ0c1dpdGgoJy4nKSkge1xuICAgICAgICBjb25zdCBmdWxsTW9kdWxlTmFtZSA9IHJlc29sdmVNb2R1bGUobW9kdWxlTmFtZSwgdGhpcy5yb290KTtcbiAgICAgICAgcmVzdWx0ID0gdGhpcy5ob3N0LmdldE1ldGFkYXRhRm9yKGZ1bGxNb2R1bGVOYW1lLCB0aGlzLnJvb3QpO1xuICAgICAgfVxuICAgICAgdGhpcy5tZXRhZGF0YUNhY2hlLnNldChtb2R1bGVOYW1lLCByZXN1bHQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgcHJpdmF0ZSBleHBvcnRBbGwobW9kdWxlTmFtZTogc3RyaW5nKTogU3ltYm9sW10ge1xuICAgIGNvbnN0IG1vZHVsZSA9IHRoaXMuZ2V0TWV0YWRhdGEobW9kdWxlTmFtZSk7XG4gICAgbGV0IHJlc3VsdCA9IHRoaXMuZXhwb3J0cy5nZXQobW9kdWxlTmFtZSk7XG5cbiAgICBpZiAocmVzdWx0KSB7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIHJlc3VsdCA9IFtdO1xuXG4gICAgY29uc3QgZXhwb3J0U3ltYm9sID0gKGV4cG9ydGVkU3ltYm9sOiBTeW1ib2wsIGV4cG9ydEFzOiBzdHJpbmcpID0+IHtcbiAgICAgIGNvbnN0IHN5bWJvbCA9IHRoaXMuc3ltYm9sT2YobW9kdWxlTmFtZSwgZXhwb3J0QXMpO1xuICAgICAgcmVzdWx0IS5wdXNoKHN5bWJvbCk7XG4gICAgICBleHBvcnRlZFN5bWJvbC5yZWV4cG9ydGVkQXMgPSBzeW1ib2w7XG4gICAgICBzeW1ib2wuZXhwb3J0cyA9IGV4cG9ydGVkU3ltYm9sO1xuICAgIH07XG5cbiAgICAvLyBFeHBvcnQgYWxsIHRoZSBzeW1ib2xzIGRlZmluZWQgaW4gdGhpcyBtb2R1bGUuXG4gICAgaWYgKG1vZHVsZSAmJiBtb2R1bGUubWV0YWRhdGEpIHtcbiAgICAgIGZvciAobGV0IGtleSBpbiBtb2R1bGUubWV0YWRhdGEpIHtcbiAgICAgICAgY29uc3QgZGF0YSA9IG1vZHVsZS5tZXRhZGF0YVtrZXldO1xuICAgICAgICBpZiAoaXNNZXRhZGF0YUltcG9ydGVkU3ltYm9sUmVmZXJlbmNlRXhwcmVzc2lvbihkYXRhKSkge1xuICAgICAgICAgIC8vIFRoaXMgaXMgYSByZS1leHBvcnQgb2YgYW4gaW1wb3J0ZWQgc3ltYm9sLiBSZWNvcmQgdGhpcyBhcyBhIHJlLWV4cG9ydC5cbiAgICAgICAgICBjb25zdCBleHBvcnRGcm9tID0gcmVzb2x2ZU1vZHVsZShkYXRhLm1vZHVsZSwgbW9kdWxlTmFtZSk7XG4gICAgICAgICAgdGhpcy5leHBvcnRBbGwoZXhwb3J0RnJvbSk7XG4gICAgICAgICAgY29uc3Qgc3ltYm9sID0gdGhpcy5zeW1ib2xPZihleHBvcnRGcm9tLCBkYXRhLm5hbWUpO1xuICAgICAgICAgIGV4cG9ydFN5bWJvbChzeW1ib2wsIGtleSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gUmVjb3JkIHRoYXQgdGhpcyBzeW1ib2wgaXMgZXhwb3J0ZWQgYnkgdGhpcyBtb2R1bGUuXG4gICAgICAgICAgcmVzdWx0LnB1c2godGhpcy5zeW1ib2xPZihtb2R1bGVOYW1lLCBrZXkpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEV4cG9ydCBhbGwgdGhlIHJlLWV4cG9ydHMgZnJvbSB0aGlzIG1vZHVsZVxuICAgIGlmIChtb2R1bGUgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICAgIGxldCB1bm5hbWVkTW9kdWxlRXhwb3J0c0lkeCA9IDA7XG4gICAgICBmb3IgKGNvbnN0IGV4cG9ydERlY2xhcmF0aW9uIG9mIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgICAgIGNvbnN0IGV4cG9ydEZyb20gPSByZXNvbHZlTW9kdWxlKGV4cG9ydERlY2xhcmF0aW9uLmZyb20sIG1vZHVsZU5hbWUpO1xuICAgICAgICAvLyBSZWNvcmQgYWxsIHRoZSBleHBvcnRzIGZyb20gdGhlIG1vZHVsZSBldmVuIGlmIHdlIGRvbid0IHVzZSBpdCBkaXJlY3RseS5cbiAgICAgICAgY29uc3QgZXhwb3J0ZWRTeW1ib2xzID0gdGhpcy5leHBvcnRBbGwoZXhwb3J0RnJvbSk7XG4gICAgICAgIGlmIChleHBvcnREZWNsYXJhdGlvbi5leHBvcnQpIHtcbiAgICAgICAgICAvLyBSZS1leHBvcnQgYWxsIHRoZSBuYW1lZCBleHBvcnRzIGZyb20gYSBtb2R1bGUuXG4gICAgICAgICAgZm9yIChjb25zdCBleHBvcnRJdGVtIG9mIGV4cG9ydERlY2xhcmF0aW9uLmV4cG9ydCkge1xuICAgICAgICAgICAgY29uc3QgbmFtZSA9IHR5cGVvZiBleHBvcnRJdGVtID09ICdzdHJpbmcnID8gZXhwb3J0SXRlbSA6IGV4cG9ydEl0ZW0ubmFtZTtcbiAgICAgICAgICAgIGNvbnN0IGV4cG9ydEFzID0gdHlwZW9mIGV4cG9ydEl0ZW0gPT0gJ3N0cmluZycgPyBleHBvcnRJdGVtIDogZXhwb3J0SXRlbS5hcztcbiAgICAgICAgICAgIGNvbnN0IHN5bWJvbCA9IHRoaXMuc3ltYm9sT2YoZXhwb3J0RnJvbSwgbmFtZSk7XG4gICAgICAgICAgICBpZiAoZXhwb3J0ZWRTeW1ib2xzICYmIGV4cG9ydGVkU3ltYm9scy5sZW5ndGggPT0gMSAmJiBleHBvcnRlZFN5bWJvbHNbMF0ucmVleHBvcnQgJiZcbiAgICAgICAgICAgICAgICBleHBvcnRlZFN5bWJvbHNbMF0ubmFtZSA9PSAnKicpIHtcbiAgICAgICAgICAgICAgLy8gVGhpcyBpcyBhIG5hbWVkIGV4cG9ydCBmcm9tIGEgbW9kdWxlIHdlIGhhdmUgbm8gbWV0YWRhdGEgYWJvdXQuIFJlY29yZCB0aGUgbmFtZWRcbiAgICAgICAgICAgICAgLy8gZXhwb3J0IGFzIGEgcmUtZXhwb3J0LlxuICAgICAgICAgICAgICBzeW1ib2wucmVleHBvcnQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZXhwb3J0U3ltYm9sKHRoaXMuc3ltYm9sT2YoZXhwb3J0RnJvbSwgbmFtZSksIGV4cG9ydEFzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gUmUtZXhwb3J0IGFsbCB0aGUgc3ltYm9scyBmcm9tIHRoZSBtb2R1bGVcbiAgICAgICAgICBjb25zdCBleHBvcnRlZFN5bWJvbHMgPSB0aGlzLmV4cG9ydEFsbChleHBvcnRGcm9tKTtcbiAgICAgICAgICBmb3IgKGNvbnN0IGV4cG9ydGVkU3ltYm9sIG9mIGV4cG9ydGVkU3ltYm9scykge1xuICAgICAgICAgICAgLy8gSW4gY2FzZSB0aGUgZXhwb3J0ZWQgc3ltYm9sIGRvZXMgbm90IGhhdmUgYSBuYW1lLCB3ZSBuZWVkIHRvIGdpdmUgaXQgYW4gdW5pcXVlXG4gICAgICAgICAgICAvLyBuYW1lIGZvciB0aGUgY3VycmVudCBtb2R1bGUuIFRoaXMgaXMgbmVjZXNzYXJ5IGJlY2F1c2UgdGhlcmUgY2FuIGJlIG11bHRpcGxlXG4gICAgICAgICAgICAvLyB1bm5hbWVkIHJlLWV4cG9ydHMgaW4gYSBnaXZlbiBtb2R1bGUuXG4gICAgICAgICAgICBjb25zdCBuYW1lID0gZXhwb3J0ZWRTeW1ib2wubmFtZSA9PT0gJyonID9cbiAgICAgICAgICAgICAgICBgdW5uYW1lZF9yZWV4cG9ydF8ke3VubmFtZWRNb2R1bGVFeHBvcnRzSWR4Kyt9YCA6XG4gICAgICAgICAgICAgICAgZXhwb3J0ZWRTeW1ib2wubmFtZTtcbiAgICAgICAgICAgIGV4cG9ydFN5bWJvbChleHBvcnRlZFN5bWJvbCwgbmFtZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFtb2R1bGUpIHtcbiAgICAgIC8vIElmIG5vIG1ldGFkYXRhIGlzIGZvdW5kIGZvciB0aGlzIGltcG9ydCB0aGVuIGl0IGlzIGNvbnNpZGVyZWQgZXh0ZXJuYWwgdG8gdGhlXG4gICAgICAvLyBsaWJyYXJ5IGFuZCBzaG91bGQgYmUgcmVjb3JkZWQgYXMgYSByZS1leHBvcnQgaW4gdGhlIGZpbmFsIG1ldGFkYXRhIGlmIGl0IGlzXG4gICAgICAvLyBldmVudHVhbGx5IHJlLWV4cG9ydGVkLlxuICAgICAgY29uc3Qgc3ltYm9sID0gdGhpcy5zeW1ib2xPZihtb2R1bGVOYW1lLCAnKicpO1xuICAgICAgc3ltYm9sLnJlZXhwb3J0ID0gdHJ1ZTtcbiAgICAgIHJlc3VsdC5wdXNoKHN5bWJvbCk7XG4gICAgfVxuICAgIHRoaXMuZXhwb3J0cy5zZXQobW9kdWxlTmFtZSwgcmVzdWx0KTtcblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKipcbiAgICogRmlsbCBpbiB0aGUgY2Fub25pY2FsU3ltYm9sIHdoaWNoIGlzIHRoZSBzeW1ib2wgdGhhdCBzaG91bGQgYmUgaW1wb3J0ZWQgYnkgZmFjdG9yaWVzLlxuICAgKiBUaGUgY2Fub25pY2FsIHN5bWJvbCBpcyB0aGUgb25lIGV4cG9ydGVkIGJ5IHRoZSBpbmRleCBmaWxlIGZvciB0aGUgYnVuZGxlIG9yIGRlZmluaXRpb25cbiAgICogc3ltYm9sIGZvciBwcml2YXRlIHN5bWJvbHMgdGhhdCBhcmUgbm90IGV4cG9ydGVkIGJ5IGJ1bmRsZSBpbmRleC5cbiAgICovXG4gIHByaXZhdGUgY2Fub25pY2FsaXplU3ltYm9scyhleHBvcnRlZFN5bWJvbHM6IFN5bWJvbFtdKSB7XG4gICAgY29uc3Qgc3ltYm9scyA9IEFycmF5LmZyb20odGhpcy5zeW1ib2xNYXAudmFsdWVzKCkpO1xuICAgIHRoaXMuZXhwb3J0ZWQgPSBuZXcgU2V0KGV4cG9ydGVkU3ltYm9scyk7XG4gICAgc3ltYm9scy5mb3JFYWNoKHRoaXMuY2Fub25pY2FsaXplU3ltYm9sLCB0aGlzKTtcbiAgfVxuXG4gIHByaXZhdGUgY2Fub25pY2FsaXplU3ltYm9sKHN5bWJvbDogU3ltYm9sKSB7XG4gICAgY29uc3Qgcm9vdEV4cG9ydCA9IGdldFJvb3RFeHBvcnQoc3ltYm9sKTtcbiAgICBjb25zdCBkZWNsYXJhdGlvbiA9IGdldFN5bWJvbERlY2xhcmF0aW9uKHN5bWJvbCk7XG4gICAgY29uc3QgaXNQcml2YXRlID0gIXRoaXMuZXhwb3J0ZWQuaGFzKHJvb3RFeHBvcnQpO1xuICAgIGNvbnN0IGNhbm9uaWNhbFN5bWJvbCA9IGlzUHJpdmF0ZSA/IGRlY2xhcmF0aW9uIDogcm9vdEV4cG9ydDtcbiAgICBzeW1ib2wuaXNQcml2YXRlID0gaXNQcml2YXRlO1xuICAgIHN5bWJvbC5kZWNsYXJhdGlvbiA9IGRlY2xhcmF0aW9uO1xuICAgIHN5bWJvbC5jYW5vbmljYWxTeW1ib2wgPSBjYW5vbmljYWxTeW1ib2w7XG4gICAgc3ltYm9sLnJlZXhwb3J0ID0gZGVjbGFyYXRpb24ucmVleHBvcnQ7XG4gIH1cblxuICBwcml2YXRlIGdldEVudHJpZXMoZXhwb3J0ZWRTeW1ib2xzOiBTeW1ib2xbXSk6IEJ1bmRsZUVudHJpZXMge1xuICAgIGNvbnN0IHJlc3VsdDogQnVuZGxlRW50cmllcyA9IHt9O1xuXG4gICAgY29uc3QgZXhwb3J0ZWROYW1lcyA9IG5ldyBTZXQoZXhwb3J0ZWRTeW1ib2xzLm1hcChzID0+IHMubmFtZSkpO1xuICAgIGxldCBwcml2YXRlTmFtZSA9IDA7XG5cbiAgICBmdW5jdGlvbiBuZXdQcml2YXRlTmFtZShwcmVmaXg6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICBsZXQgZGlnaXRzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICBsZXQgaW5kZXggPSBwcml2YXRlTmFtZSsrO1xuICAgICAgICBsZXQgYmFzZSA9IFBSSVZBVEVfTkFNRV9DSEFSUztcbiAgICAgICAgd2hpbGUgKCFkaWdpdHMubGVuZ3RoIHx8IGluZGV4ID4gMCkge1xuICAgICAgICAgIGRpZ2l0cy51bnNoaWZ0KGJhc2VbaW5kZXggJSBiYXNlLmxlbmd0aF0pO1xuICAgICAgICAgIGluZGV4ID0gTWF0aC5mbG9vcihpbmRleCAvIGJhc2UubGVuZ3RoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByZXN1bHQgPSBgXFx1MDI3NSR7cHJlZml4fSR7ZGlnaXRzLmpvaW4oJycpfWA7XG4gICAgICAgIGlmICghZXhwb3J0ZWROYW1lcy5oYXMocmVzdWx0KSkgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBleHBvcnRlZFN5bWJvbHMuZm9yRWFjaChzeW1ib2wgPT4gdGhpcy5jb252ZXJ0U3ltYm9sKHN5bWJvbCkpO1xuXG4gICAgY29uc3Qgc3ltYm9sc01hcCA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmdbXT4oKTtcbiAgICBBcnJheS5mcm9tKHRoaXMuc3ltYm9sTWFwLnZhbHVlcygpKS5mb3JFYWNoKHN5bWJvbCA9PiB7XG4gICAgICBpZiAoc3ltYm9sLnJlZmVyZW5jZWQgJiYgIXN5bWJvbC5yZWV4cG9ydCkge1xuICAgICAgICBsZXQgbmFtZSA9IHN5bWJvbC5uYW1lO1xuICAgICAgICBjb25zdCBpZGVudGlmaWVyID0gYCR7c3ltYm9sLmRlY2xhcmF0aW9uIS5tb2R1bGV9OiR7c3ltYm9sLmRlY2xhcmF0aW9uIS5uYW1lfWA7XG4gICAgICAgIGlmIChzeW1ib2wuaXNQcml2YXRlICYmICFzeW1ib2wucHJpdmF0ZU5hbWUpIHtcbiAgICAgICAgICBuYW1lID0gbmV3UHJpdmF0ZU5hbWUodGhpcy5wcml2YXRlU3ltYm9sUHJlZml4KTtcbiAgICAgICAgICBzeW1ib2wucHJpdmF0ZU5hbWUgPSBuYW1lO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzeW1ib2xzTWFwLmhhcyhpZGVudGlmaWVyKSkge1xuICAgICAgICAgIGNvbnN0IG5hbWVzID0gc3ltYm9sc01hcC5nZXQoaWRlbnRpZmllcik7XG4gICAgICAgICAgbmFtZXMhLnB1c2gobmFtZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3ltYm9sc01hcC5zZXQoaWRlbnRpZmllciwgW25hbWVdKTtcbiAgICAgICAgfVxuICAgICAgICByZXN1bHRbbmFtZV0gPSBzeW1ib2wudmFsdWUhO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gY2hlY2sgZm9yIGR1cGxpY2F0ZWQgZW50cmllc1xuICAgIHN5bWJvbHNNYXAuZm9yRWFjaCgobmFtZXM6IHN0cmluZ1tdLCBpZGVudGlmaWVyOiBzdHJpbmcpID0+IHtcbiAgICAgIGlmIChuYW1lcy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGNvbnN0IFttb2R1bGUsIGRlY2xhcmVkTmFtZV0gPSBpZGVudGlmaWVyLnNwbGl0KCc6Jyk7XG4gICAgICAgIC8vIHByZWZlciB0aGUgZXhwb3J0IHRoYXQgdXNlcyB0aGUgZGVjbGFyZWQgbmFtZSAoaWYgYW55KVxuICAgICAgICBsZXQgcmVmZXJlbmNlID0gbmFtZXMuaW5kZXhPZihkZWNsYXJlZE5hbWUpO1xuICAgICAgICBpZiAocmVmZXJlbmNlID09PSAtMSkge1xuICAgICAgICAgIHJlZmVyZW5jZSA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBrZWVwIG9uZSBlbnRyeSBhbmQgcmVwbGFjZSB0aGUgb3RoZXJzIGJ5IHJlZmVyZW5jZXNcbiAgICAgICAgbmFtZXMuZm9yRWFjaCgobmFtZTogc3RyaW5nLCBpOiBudW1iZXIpID0+IHtcbiAgICAgICAgICBpZiAoaSAhPT0gcmVmZXJlbmNlKSB7XG4gICAgICAgICAgICByZXN1bHRbbmFtZV0gPSB7X19zeW1ib2xpYzogJ3JlZmVyZW5jZScsIG5hbWU6IG5hbWVzW3JlZmVyZW5jZV19O1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRSZUV4cG9ydHMoZXhwb3J0ZWRTeW1ib2xzOiBTeW1ib2xbXSk6IE1vZHVsZUV4cG9ydE1ldGFkYXRhW10ge1xuICAgIHR5cGUgRXhwb3J0Q2xhdXNlID0ge25hbWU6IHN0cmluZywgYXM6IHN0cmluZ31bXTtcbiAgICBjb25zdCBtb2R1bGVzID0gbmV3IE1hcDxzdHJpbmcsIEV4cG9ydENsYXVzZT4oKTtcbiAgICBjb25zdCBleHBvcnRBbGxzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgZm9yIChjb25zdCBzeW1ib2wgb2YgZXhwb3J0ZWRTeW1ib2xzKSB7XG4gICAgICBpZiAoc3ltYm9sLnJlZXhwb3J0KSB7XG4gICAgICAgIC8vIHN5bWJvbC5kZWNsYXJhdGlvbiBpcyBndWFyYW50ZWVkIHRvIGJlIGRlZmluZWQgZHVyaW5nIHRoZSBwaGFzZSB0aGlzIG1ldGhvZCBpcyBjYWxsZWQuXG4gICAgICAgIGNvbnN0IGRlY2xhcmF0aW9uID0gc3ltYm9sLmRlY2xhcmF0aW9uITtcbiAgICAgICAgY29uc3QgbW9kdWxlID0gZGVjbGFyYXRpb24ubW9kdWxlO1xuICAgICAgICBpZiAoZGVjbGFyYXRpb24hLm5hbWUgPT0gJyonKSB7XG4gICAgICAgICAgLy8gUmVleHBvcnQgYWxsIHRoZSBzeW1ib2xzLlxuICAgICAgICAgIGV4cG9ydEFsbHMuYWRkKGRlY2xhcmF0aW9uLm1vZHVsZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gUmUtZXhwb3J0IHRoZSBzeW1ib2wgYXMgdGhlIGV4cG9ydGVkIG5hbWUuXG4gICAgICAgICAgbGV0IGVudHJ5ID0gbW9kdWxlcy5nZXQobW9kdWxlKTtcbiAgICAgICAgICBpZiAoIWVudHJ5KSB7XG4gICAgICAgICAgICBlbnRyeSA9IFtdO1xuICAgICAgICAgICAgbW9kdWxlcy5zZXQobW9kdWxlLCBlbnRyeSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IGFzID0gc3ltYm9sLm5hbWU7XG4gICAgICAgICAgY29uc3QgbmFtZSA9IGRlY2xhcmF0aW9uLm5hbWU7XG4gICAgICAgICAgZW50cnkucHVzaCh7bmFtZSwgYXN9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gW1xuICAgICAgLi4uQXJyYXkuZnJvbShleHBvcnRBbGxzLnZhbHVlcygpKS5tYXAoZnJvbSA9PiAoe2Zyb219KSksXG4gICAgICAuLi5BcnJheS5mcm9tKG1vZHVsZXMuZW50cmllcygpKS5tYXAoKFtmcm9tLCBleHBvcnRzXSkgPT4gKHtleHBvcnQ6IGV4cG9ydHMsIGZyb219KSlcbiAgICBdO1xuICB9XG5cbiAgcHJpdmF0ZSBjb252ZXJ0U3ltYm9sKHN5bWJvbDogU3ltYm9sKSB7XG4gICAgLy8gY2Fub25pY2FsU3ltYm9sIGlzIGVuc3VyZWQgdG8gYmUgZGVmaW5lZCBiZWZvcmUgdGhpcyBpcyBjYWxsZWQuXG4gICAgY29uc3QgY2Fub25pY2FsU3ltYm9sID0gc3ltYm9sLmNhbm9uaWNhbFN5bWJvbCE7XG5cbiAgICBpZiAoIWNhbm9uaWNhbFN5bWJvbC5yZWZlcmVuY2VkKSB7XG4gICAgICBjYW5vbmljYWxTeW1ib2wucmVmZXJlbmNlZCA9IHRydWU7XG4gICAgICAvLyBkZWNsYXJhdGlvbiBpcyBlbnN1cmVkIHRvIGJlIGRlZmluZGVkIGJlZm9yZSB0aGlzIG1ldGhvZCBpcyBjYWxsZWQuXG4gICAgICBjb25zdCBkZWNsYXJhdGlvbiA9IGNhbm9uaWNhbFN5bWJvbC5kZWNsYXJhdGlvbiE7XG4gICAgICBjb25zdCBtb2R1bGUgPSB0aGlzLmdldE1ldGFkYXRhKGRlY2xhcmF0aW9uLm1vZHVsZSk7XG4gICAgICBpZiAobW9kdWxlKSB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gbW9kdWxlLm1ldGFkYXRhW2RlY2xhcmF0aW9uLm5hbWVdO1xuICAgICAgICBpZiAodmFsdWUgJiYgIWRlY2xhcmF0aW9uLm5hbWUuc3RhcnRzV2l0aCgnX19fJykpIHtcbiAgICAgICAgICBjYW5vbmljYWxTeW1ib2wudmFsdWUgPSB0aGlzLmNvbnZlcnRFbnRyeShkZWNsYXJhdGlvbi5tb2R1bGUsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgY29udmVydEVudHJ5KG1vZHVsZU5hbWU6IHN0cmluZywgdmFsdWU6IE1ldGFkYXRhRW50cnkpOiBNZXRhZGF0YUVudHJ5IHtcbiAgICBpZiAoaXNDbGFzc01ldGFkYXRhKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIHRoaXMuY29udmVydENsYXNzKG1vZHVsZU5hbWUsIHZhbHVlKTtcbiAgICB9XG4gICAgaWYgKGlzRnVuY3Rpb25NZXRhZGF0YSh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbnZlcnRGdW5jdGlvbihtb2R1bGVOYW1lLCB2YWx1ZSk7XG4gICAgfVxuICAgIGlmIChpc0ludGVyZmFjZU1ldGFkYXRhKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5jb252ZXJ0VmFsdWUobW9kdWxlTmFtZSwgdmFsdWUpO1xuICB9XG5cbiAgcHJpdmF0ZSBjb252ZXJ0Q2xhc3MobW9kdWxlTmFtZTogc3RyaW5nLCB2YWx1ZTogQ2xhc3NNZXRhZGF0YSk6IENsYXNzTWV0YWRhdGEge1xuICAgIHJldHVybiB7XG4gICAgICBfX3N5bWJvbGljOiAnY2xhc3MnLFxuICAgICAgYXJpdHk6IHZhbHVlLmFyaXR5LFxuICAgICAgZXh0ZW5kczogdGhpcy5jb252ZXJ0RXhwcmVzc2lvbihtb2R1bGVOYW1lLCB2YWx1ZS5leHRlbmRzKSAhLFxuICAgICAgZGVjb3JhdG9yczpcbiAgICAgICAgICB2YWx1ZS5kZWNvcmF0b3JzICYmIHZhbHVlLmRlY29yYXRvcnMubWFwKGQgPT4gdGhpcy5jb252ZXJ0RXhwcmVzc2lvbihtb2R1bGVOYW1lLCBkKSAhKSxcbiAgICAgIG1lbWJlcnM6IHRoaXMuY29udmVydE1lbWJlcnMobW9kdWxlTmFtZSwgdmFsdWUubWVtYmVycyAhKSxcbiAgICAgIHN0YXRpY3M6IHZhbHVlLnN0YXRpY3MgJiYgdGhpcy5jb252ZXJ0U3RhdGljcyhtb2R1bGVOYW1lLCB2YWx1ZS5zdGF0aWNzKVxuICAgIH07XG4gIH1cblxuICBwcml2YXRlIGNvbnZlcnRNZW1iZXJzKG1vZHVsZU5hbWU6IHN0cmluZywgbWVtYmVyczogTWV0YWRhdGFNYXApOiBNZXRhZGF0YU1hcCB7XG4gICAgY29uc3QgcmVzdWx0OiBNZXRhZGF0YU1hcCA9IHt9O1xuICAgIGZvciAoY29uc3QgbmFtZSBpbiBtZW1iZXJzKSB7XG4gICAgICBjb25zdCB2YWx1ZSA9IG1lbWJlcnNbbmFtZV07XG4gICAgICByZXN1bHRbbmFtZV0gPSB2YWx1ZS5tYXAodiA9PiB0aGlzLmNvbnZlcnRNZW1iZXIobW9kdWxlTmFtZSwgdikpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgcHJpdmF0ZSBjb252ZXJ0TWVtYmVyKG1vZHVsZU5hbWU6IHN0cmluZywgbWVtYmVyOiBNZW1iZXJNZXRhZGF0YSkge1xuICAgIGNvbnN0IHJlc3VsdDogTWVtYmVyTWV0YWRhdGEgPSB7X19zeW1ib2xpYzogbWVtYmVyLl9fc3ltYm9saWN9O1xuICAgIHJlc3VsdC5kZWNvcmF0b3JzID1cbiAgICAgICAgbWVtYmVyLmRlY29yYXRvcnMgJiYgbWVtYmVyLmRlY29yYXRvcnMubWFwKGQgPT4gdGhpcy5jb252ZXJ0RXhwcmVzc2lvbihtb2R1bGVOYW1lLCBkKSEpO1xuICAgIGlmIChpc01ldGhvZE1ldGFkYXRhKG1lbWJlcikpIHtcbiAgICAgIChyZXN1bHQgYXMgTWV0aG9kTWV0YWRhdGEpLnBhcmFtZXRlckRlY29yYXRvcnMgPSBtZW1iZXIucGFyYW1ldGVyRGVjb3JhdG9ycyAmJlxuICAgICAgICAgIG1lbWJlci5wYXJhbWV0ZXJEZWNvcmF0b3JzLm1hcChcbiAgICAgICAgICAgICAgZCA9PiBkICYmIGQubWFwKHAgPT4gdGhpcy5jb252ZXJ0RXhwcmVzc2lvbihtb2R1bGVOYW1lLCBwKSEpKTtcbiAgICAgIGlmIChpc0NvbnN0cnVjdG9yTWV0YWRhdGEobWVtYmVyKSkge1xuICAgICAgICBpZiAobWVtYmVyLnBhcmFtZXRlcnMpIHtcbiAgICAgICAgICAocmVzdWx0IGFzIENvbnN0cnVjdG9yTWV0YWRhdGEpLnBhcmFtZXRlcnMgPVxuICAgICAgICAgICAgICBtZW1iZXIucGFyYW1ldGVycy5tYXAocCA9PiB0aGlzLmNvbnZlcnRFeHByZXNzaW9uKG1vZHVsZU5hbWUsIHApKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgcHJpdmF0ZSBjb252ZXJ0U3RhdGljcyhtb2R1bGVOYW1lOiBzdHJpbmcsIHN0YXRpY3M6IFN0YXRpY3NNZXRhZGF0YSk6IFN0YXRpY3NNZXRhZGF0YSB7XG4gICAgbGV0IHJlc3VsdDogU3RhdGljc01ldGFkYXRhID0ge307XG4gICAgZm9yIChjb25zdCBrZXkgaW4gc3RhdGljcykge1xuICAgICAgY29uc3QgdmFsdWUgPSBzdGF0aWNzW2tleV07XG5cbiAgICAgIGlmIChpc0Z1bmN0aW9uTWV0YWRhdGEodmFsdWUpKSB7XG4gICAgICAgIHJlc3VsdFtrZXldID0gdGhpcy5jb252ZXJ0RnVuY3Rpb24obW9kdWxlTmFtZSwgdmFsdWUpO1xuICAgICAgfSBlbHNlIGlmIChpc01ldGFkYXRhU3ltYm9saWNDYWxsRXhwcmVzc2lvbih2YWx1ZSkpIHtcbiAgICAgICAgLy8gQ2xhc3MgbWVtYmVycyBjYW4gYWxzbyBjb250YWluIHN0YXRpYyBtZW1iZXJzIHRoYXQgY2FsbCBhIGZ1bmN0aW9uIHdpdGggbW9kdWxlXG4gICAgICAgIC8vIHJlZmVyZW5jZXMuIGUuZy4gXCJzdGF0aWMgybVwcm92ID0gybXJtWRlZmluZUluamVjdGFibGUoLi4pXCIuIFdlIGFsc28gbmVlZCB0b1xuICAgICAgICAvLyBjb252ZXJ0IHRoZXNlIG1vZHVsZSByZWZlcmVuY2VzIGJlY2F1c2Ugb3RoZXJ3aXNlIHRoZXNlIHJlc29sdmUgdG8gbm9uLWV4aXN0ZW50IGZpbGVzLlxuICAgICAgICByZXN1bHRba2V5XSA9IHRoaXMuY29udmVydFZhbHVlKG1vZHVsZU5hbWUsIHZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdFtrZXldID0gdmFsdWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBwcml2YXRlIGNvbnZlcnRGdW5jdGlvbihtb2R1bGVOYW1lOiBzdHJpbmcsIHZhbHVlOiBGdW5jdGlvbk1ldGFkYXRhKTogRnVuY3Rpb25NZXRhZGF0YSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIF9fc3ltYm9saWM6ICdmdW5jdGlvbicsXG4gICAgICBwYXJhbWV0ZXJzOiB2YWx1ZS5wYXJhbWV0ZXJzLFxuICAgICAgZGVmYXVsdHM6IHZhbHVlLmRlZmF1bHRzICYmIHZhbHVlLmRlZmF1bHRzLm1hcCh2ID0+IHRoaXMuY29udmVydFZhbHVlKG1vZHVsZU5hbWUsIHYpKSxcbiAgICAgIHZhbHVlOiB0aGlzLmNvbnZlcnRWYWx1ZShtb2R1bGVOYW1lLCB2YWx1ZS52YWx1ZSlcbiAgICB9O1xuICB9XG5cbiAgcHJpdmF0ZSBjb252ZXJ0VmFsdWUobW9kdWxlTmFtZTogc3RyaW5nLCB2YWx1ZTogTWV0YWRhdGFWYWx1ZSk6IE1ldGFkYXRhVmFsdWUge1xuICAgIGlmIChpc1ByaW1pdGl2ZSh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG4gICAgaWYgKGlzTWV0YWRhdGFFcnJvcih2YWx1ZSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbnZlcnRFcnJvcihtb2R1bGVOYW1lLCB2YWx1ZSk7XG4gICAgfVxuICAgIGlmIChpc01ldGFkYXRhU3ltYm9saWNFeHByZXNzaW9uKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIHRoaXMuY29udmVydEV4cHJlc3Npb24obW9kdWxlTmFtZSwgdmFsdWUpITtcbiAgICB9XG4gICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICByZXR1cm4gdmFsdWUubWFwKHYgPT4gdGhpcy5jb252ZXJ0VmFsdWUobW9kdWxlTmFtZSwgdikpO1xuICAgIH1cblxuICAgIC8vIE90aGVyd2lzZSBpdCBpcyBhIG1ldGFkYXRhIG9iamVjdC5cbiAgICBjb25zdCBvYmplY3QgPSB2YWx1ZSBhcyBNZXRhZGF0YU9iamVjdDtcbiAgICBjb25zdCByZXN1bHQ6IE1ldGFkYXRhT2JqZWN0ID0ge307XG4gICAgZm9yIChjb25zdCBrZXkgaW4gb2JqZWN0KSB7XG4gICAgICByZXN1bHRba2V5XSA9IHRoaXMuY29udmVydFZhbHVlKG1vZHVsZU5hbWUsIG9iamVjdFtrZXldKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHByaXZhdGUgY29udmVydEV4cHJlc3Npb24oXG4gICAgICBtb2R1bGVOYW1lOiBzdHJpbmcsIHZhbHVlOiBNZXRhZGF0YVN5bWJvbGljRXhwcmVzc2lvbnxNZXRhZGF0YUVycm9yfG51bGx8dW5kZWZpbmVkKTpcbiAgICAgIE1ldGFkYXRhU3ltYm9saWNFeHByZXNzaW9ufE1ldGFkYXRhRXJyb3J8dW5kZWZpbmVkfG51bGwge1xuICAgIGlmICh2YWx1ZSkge1xuICAgICAgc3dpdGNoICh2YWx1ZS5fX3N5bWJvbGljKSB7XG4gICAgICAgIGNhc2UgJ2Vycm9yJzpcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb252ZXJ0RXJyb3IobW9kdWxlTmFtZSwgdmFsdWUgYXMgTWV0YWRhdGFFcnJvcik7XG4gICAgICAgIGNhc2UgJ3JlZmVyZW5jZSc6XG4gICAgICAgICAgcmV0dXJuIHRoaXMuY29udmVydFJlZmVyZW5jZShtb2R1bGVOYW1lLCB2YWx1ZSBhcyBNZXRhZGF0YVN5bWJvbGljUmVmZXJlbmNlRXhwcmVzc2lvbik7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgcmV0dXJuIHRoaXMuY29udmVydEV4cHJlc3Npb25Ob2RlKG1vZHVsZU5hbWUsIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG5cbiAgcHJpdmF0ZSBjb252ZXJ0RXJyb3IobW9kdWxlOiBzdHJpbmcsIHZhbHVlOiBNZXRhZGF0YUVycm9yKTogTWV0YWRhdGFFcnJvciB7XG4gICAgcmV0dXJuIHtcbiAgICAgIF9fc3ltYm9saWM6ICdlcnJvcicsXG4gICAgICBtZXNzYWdlOiB2YWx1ZS5tZXNzYWdlLFxuICAgICAgbGluZTogdmFsdWUubGluZSxcbiAgICAgIGNoYXJhY3RlcjogdmFsdWUuY2hhcmFjdGVyLFxuICAgICAgY29udGV4dDogdmFsdWUuY29udGV4dCxcbiAgICAgIG1vZHVsZVxuICAgIH07XG4gIH1cblxuICBwcml2YXRlIGNvbnZlcnRSZWZlcmVuY2UobW9kdWxlTmFtZTogc3RyaW5nLCB2YWx1ZTogTWV0YWRhdGFTeW1ib2xpY1JlZmVyZW5jZUV4cHJlc3Npb24pOlxuICAgICAgTWV0YWRhdGFTeW1ib2xpY1JlZmVyZW5jZUV4cHJlc3Npb258TWV0YWRhdGFFcnJvcnx1bmRlZmluZWQge1xuICAgIGNvbnN0IGNyZWF0ZVJlZmVyZW5jZSA9IChzeW1ib2w6IFN5bWJvbCk6IE1ldGFkYXRhU3ltYm9saWNSZWZlcmVuY2VFeHByZXNzaW9uID0+IHtcbiAgICAgIGNvbnN0IGRlY2xhcmF0aW9uID0gc3ltYm9sLmRlY2xhcmF0aW9uITtcbiAgICAgIGlmIChkZWNsYXJhdGlvbi5tb2R1bGUuc3RhcnRzV2l0aCgnLicpKSB7XG4gICAgICAgIC8vIFJlZmVyZW5jZSB0byBhIHN5bWJvbCBkZWZpbmVkIGluIHRoZSBtb2R1bGUuIEVuc3VyZSBpdCBpcyBjb252ZXJ0ZWQgdGhlbiByZXR1cm4gYVxuICAgICAgICAvLyByZWZlcmVuY2VzIHRvIHRoZSBmaW5hbCBzeW1ib2wuXG4gICAgICAgIHRoaXMuY29udmVydFN5bWJvbChzeW1ib2wpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIF9fc3ltYm9saWM6ICdyZWZlcmVuY2UnLFxuICAgICAgICAgIGdldCBuYW1lKCkge1xuICAgICAgICAgICAgLy8gUmVzb2x2ZWQgbGF6aWx5IGJlY2F1c2UgcHJpdmF0ZSBuYW1lcyBhcmUgYXNzaWduZWQgbGF0ZS5cbiAgICAgICAgICAgIGNvbnN0IGNhbm9uaWNhbFN5bWJvbCA9IHN5bWJvbC5jYW5vbmljYWxTeW1ib2whO1xuICAgICAgICAgICAgaWYgKGNhbm9uaWNhbFN5bWJvbC5pc1ByaXZhdGUgPT0gbnVsbCkge1xuICAgICAgICAgICAgICB0aHJvdyBFcnJvcignSW52YWxpZCBzdGF0ZTogaXNQcml2YXRlIHdhcyBub3QgaW5pdGlhbGl6ZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBjYW5vbmljYWxTeW1ib2wuaXNQcml2YXRlID8gY2Fub25pY2FsU3ltYm9sLnByaXZhdGVOYW1lISA6IGNhbm9uaWNhbFN5bWJvbC5uYW1lO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFRoZSBzeW1ib2wgd2FzIGEgcmUtZXhwb3J0ZWQgc3ltYm9sIGZyb20gYW5vdGhlciBtb2R1bGUuIFJldHVybiBhIHJlZmVyZW5jZSB0byB0aGVcbiAgICAgICAgLy8gb3JpZ2luYWwgaW1wb3J0ZWQgc3ltYm9sLlxuICAgICAgICByZXR1cm4ge19fc3ltYm9saWM6ICdyZWZlcmVuY2UnLCBuYW1lOiBkZWNsYXJhdGlvbi5uYW1lLCBtb2R1bGU6IGRlY2xhcmF0aW9uLm1vZHVsZX07XG4gICAgICB9XG4gICAgfTtcblxuICAgIGlmIChpc01ldGFkYXRhR2xvYmFsUmVmZXJlbmNlRXhwcmVzc2lvbih2YWx1ZSkpIHtcbiAgICAgIGNvbnN0IG1ldGFkYXRhID0gdGhpcy5nZXRNZXRhZGF0YShtb2R1bGVOYW1lKTtcbiAgICAgIGlmIChtZXRhZGF0YSAmJiBtZXRhZGF0YS5tZXRhZGF0YSAmJiBtZXRhZGF0YS5tZXRhZGF0YVt2YWx1ZS5uYW1lXSkge1xuICAgICAgICAvLyBSZWZlcmVuY2UgdG8gYSBzeW1ib2wgZGVmaW5lZCBpbiB0aGUgbW9kdWxlXG4gICAgICAgIHJldHVybiBjcmVhdGVSZWZlcmVuY2UodGhpcy5jYW5vbmljYWxTeW1ib2xPZihtb2R1bGVOYW1lLCB2YWx1ZS5uYW1lKSk7XG4gICAgICB9XG5cbiAgICAgIC8vIElmIGEgcmVmZXJlbmNlIGhhcyBhcmd1bWVudHMsIHRoZSBhcmd1bWVudHMgbmVlZCB0byBiZSBjb252ZXJ0ZWQuXG4gICAgICBpZiAodmFsdWUuYXJndW1lbnRzKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgX19zeW1ib2xpYzogJ3JlZmVyZW5jZScsXG4gICAgICAgICAgbmFtZTogdmFsdWUubmFtZSxcbiAgICAgICAgICBhcmd1bWVudHM6IHZhbHVlLmFyZ3VtZW50cy5tYXAoYSA9PiB0aGlzLmNvbnZlcnRWYWx1ZShtb2R1bGVOYW1lLCBhKSlcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgLy8gR2xvYmFsIHJlZmVyZW5jZXMgd2l0aG91dCBhcmd1bWVudHMgKHN1Y2ggYXMgdG8gTWF0aCBvciBKU09OKSBhcmUgdW5tb2RpZmllZC5cbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICBpZiAoaXNNZXRhZGF0YUltcG9ydGVkU3ltYm9sUmVmZXJlbmNlRXhwcmVzc2lvbih2YWx1ZSkpIHtcbiAgICAgIC8vIFJlZmVyZW5jZXMgdG8gaW1wb3J0ZWQgc3ltYm9scyBhcmUgc2VwYXJhdGVkIGludG8gdHdvLCByZWZlcmVuY2VzIHRvIGJ1bmRsZWQgbW9kdWxlcyBhbmRcbiAgICAgIC8vIHJlZmVyZW5jZXMgdG8gbW9kdWxlcyBleHRlcm5hbCB0byB0aGUgYnVuZGxlLiBJZiB0aGUgbW9kdWxlIHJlZmVyZW5jZSBpcyByZWxhdGl2ZSBpdCBpc1xuICAgICAgLy8gYXNzdW1lZCB0byBiZSBpbiB0aGUgYnVuZGxlLiBJZiBpdCBpcyBHbG9iYWwgaXQgaXMgYXNzdW1lZCB0byBiZSBvdXRzaWRlIHRoZSBidW5kbGUuXG4gICAgICAvLyBSZWZlcmVuY2VzIHRvIHN5bWJvbHMgb3V0c2lkZSB0aGUgYnVuZGxlIGFyZSBsZWZ0IHVubW9kaWZpZWQuIFJlZmVyZW5jZXMgdG8gc3ltYm9sIGluc2lkZVxuICAgICAgLy8gdGhlIGJ1bmRsZSBuZWVkIHRvIGJlIGNvbnZlcnRlZCB0byBhIGJ1bmRsZSBpbXBvcnQgcmVmZXJlbmNlIHJlYWNoYWJsZSBmcm9tIHRoZSBidW5kbGVcbiAgICAgIC8vIGluZGV4LlxuXG4gICAgICBpZiAodmFsdWUubW9kdWxlLnN0YXJ0c1dpdGgoJy4nKSkge1xuICAgICAgICAvLyBSZWZlcmVuY2UgaXMgdG8gYSBzeW1ib2wgZGVmaW5lZCBpbnNpZGUgdGhlIG1vZHVsZS4gQ29udmVydCB0aGUgcmVmZXJlbmNlIHRvIGEgcmVmZXJlbmNlXG4gICAgICAgIC8vIHRvIHRoZSBjYW5vbmljYWwgc3ltYm9sLlxuICAgICAgICBjb25zdCByZWZlcmVuY2VkTW9kdWxlID0gcmVzb2x2ZU1vZHVsZSh2YWx1ZS5tb2R1bGUsIG1vZHVsZU5hbWUpO1xuICAgICAgICBjb25zdCByZWZlcmVuY2VkTmFtZSA9IHZhbHVlLm5hbWU7XG4gICAgICAgIHJldHVybiBjcmVhdGVSZWZlcmVuY2UodGhpcy5jYW5vbmljYWxTeW1ib2xPZihyZWZlcmVuY2VkTW9kdWxlLCByZWZlcmVuY2VkTmFtZSkpO1xuICAgICAgfVxuXG4gICAgICAvLyBWYWx1ZSBpcyBhIHJlZmVyZW5jZSB0byBhIHN5bWJvbCBkZWZpbmVkIG91dHNpZGUgdGhlIG1vZHVsZS5cbiAgICAgIGlmICh2YWx1ZS5hcmd1bWVudHMpIHtcbiAgICAgICAgLy8gSWYgYSByZWZlcmVuY2UgaGFzIGFyZ3VtZW50cyB0aGUgYXJndW1lbnRzIG5lZWQgdG8gYmUgY29udmVydGVkLlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIF9fc3ltYm9saWM6ICdyZWZlcmVuY2UnLFxuICAgICAgICAgIG5hbWU6IHZhbHVlLm5hbWUsXG4gICAgICAgICAgbW9kdWxlOiB2YWx1ZS5tb2R1bGUsXG4gICAgICAgICAgYXJndW1lbnRzOiB2YWx1ZS5hcmd1bWVudHMubWFwKGEgPT4gdGhpcy5jb252ZXJ0VmFsdWUobW9kdWxlTmFtZSwgYSkpXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuXG4gICAgaWYgKGlzTWV0YWRhdGFNb2R1bGVSZWZlcmVuY2VFeHByZXNzaW9uKHZhbHVlKSkge1xuICAgICAgLy8gQ2Fubm90IHN1cHBvcnQgcmVmZXJlbmNlcyB0byBidW5kbGVkIG1vZHVsZXMgYXMgdGhlIGludGVybmFsIG1vZHVsZXMgb2YgYSBidW5kbGUgYXJlIGVyYXNlZFxuICAgICAgLy8gYnkgdGhlIGJ1bmRsZXIuXG4gICAgICBpZiAodmFsdWUubW9kdWxlLnN0YXJ0c1dpdGgoJy4nKSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIF9fc3ltYm9saWM6ICdlcnJvcicsXG4gICAgICAgICAgbWVzc2FnZTogJ1Vuc3VwcG9ydGVkIGJ1bmRsZWQgbW9kdWxlIHJlZmVyZW5jZScsXG4gICAgICAgICAgY29udGV4dDoge21vZHVsZTogdmFsdWUubW9kdWxlfVxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICAvLyBSZWZlcmVuY2VzIHRvIHVuYnVuZGxlZCBtb2R1bGVzIGFyZSB1bm1vZGlmaWVkLlxuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgY29udmVydEV4cHJlc3Npb25Ob2RlKG1vZHVsZU5hbWU6IHN0cmluZywgdmFsdWU6IE1ldGFkYXRhU3ltYm9saWNFeHByZXNzaW9uKTpcbiAgICAgIE1ldGFkYXRhU3ltYm9saWNFeHByZXNzaW9uIHtcbiAgICBjb25zdCByZXN1bHQ6IE1ldGFkYXRhU3ltYm9saWNFeHByZXNzaW9uID0ge19fc3ltYm9saWM6IHZhbHVlLl9fc3ltYm9saWN9IGFzIGFueTtcbiAgICBmb3IgKGNvbnN0IGtleSBpbiB2YWx1ZSkge1xuICAgICAgKHJlc3VsdCBhcyBhbnkpW2tleV0gPSB0aGlzLmNvbnZlcnRWYWx1ZShtb2R1bGVOYW1lLCAodmFsdWUgYXMgYW55KVtrZXldKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHByaXZhdGUgc3ltYm9sT2YobW9kdWxlOiBzdHJpbmcsIG5hbWU6IHN0cmluZyk6IFN5bWJvbCB7XG4gICAgY29uc3Qgc3ltYm9sS2V5ID0gYCR7bW9kdWxlfToke25hbWV9YDtcbiAgICBsZXQgc3ltYm9sID0gdGhpcy5zeW1ib2xNYXAuZ2V0KHN5bWJvbEtleSk7XG4gICAgaWYgKCFzeW1ib2wpIHtcbiAgICAgIHN5bWJvbCA9IHttb2R1bGUsIG5hbWV9O1xuICAgICAgdGhpcy5zeW1ib2xNYXAuc2V0KHN5bWJvbEtleSwgc3ltYm9sKTtcbiAgICB9XG4gICAgcmV0dXJuIHN5bWJvbDtcbiAgfVxuXG4gIHByaXZhdGUgY2Fub25pY2FsU3ltYm9sT2YobW9kdWxlOiBzdHJpbmcsIG5hbWU6IHN0cmluZyk6IFN5bWJvbCB7XG4gICAgLy8gRW5zdXJlIHRoZSBtb2R1bGUgaGFzIGJlZW4gc2Vlbi5cbiAgICB0aGlzLmV4cG9ydEFsbChtb2R1bGUpO1xuICAgIGNvbnN0IHN5bWJvbCA9IHRoaXMuc3ltYm9sT2YobW9kdWxlLCBuYW1lKTtcbiAgICBpZiAoIXN5bWJvbC5jYW5vbmljYWxTeW1ib2wpIHtcbiAgICAgIHRoaXMuY2Fub25pY2FsaXplU3ltYm9sKHN5bWJvbCk7XG4gICAgfVxuICAgIHJldHVybiBzeW1ib2w7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIENvbXBpbGVySG9zdEFkYXB0ZXIgaW1wbGVtZW50cyBNZXRhZGF0YUJ1bmRsZXJIb3N0IHtcbiAgcHJpdmF0ZSBjb2xsZWN0b3IgPSBuZXcgTWV0YWRhdGFDb2xsZWN0b3IoKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgaG9zdDogdHMuQ29tcGlsZXJIb3N0LCBwcml2YXRlIGNhY2hlOiBNZXRhZGF0YUNhY2hlfG51bGwsXG4gICAgICBwcml2YXRlIG9wdGlvbnM6IHRzLkNvbXBpbGVyT3B0aW9ucykge31cblxuICBnZXRNZXRhZGF0YUZvcihmaWxlTmFtZTogc3RyaW5nLCBjb250YWluaW5nRmlsZTogc3RyaW5nKTogTW9kdWxlTWV0YWRhdGF8dW5kZWZpbmVkIHtcbiAgICBjb25zdCB7cmVzb2x2ZWRNb2R1bGV9ID1cbiAgICAgICAgdHMucmVzb2x2ZU1vZHVsZU5hbWUoZmlsZU5hbWUsIGNvbnRhaW5pbmdGaWxlLCB0aGlzLm9wdGlvbnMsIHRoaXMuaG9zdCk7XG5cbiAgICBsZXQgc291cmNlRmlsZTogdHMuU291cmNlRmlsZXx1bmRlZmluZWQ7XG4gICAgaWYgKHJlc29sdmVkTW9kdWxlKSB7XG4gICAgICBsZXQge3Jlc29sdmVkRmlsZU5hbWV9ID0gcmVzb2x2ZWRNb2R1bGU7XG4gICAgICBpZiAocmVzb2x2ZWRNb2R1bGUuZXh0ZW5zaW9uICE9PSAnLnRzJykge1xuICAgICAgICByZXNvbHZlZEZpbGVOYW1lID0gcmVzb2x2ZWRGaWxlTmFtZS5yZXBsYWNlKC8oXFwuZFxcLnRzfFxcLmpzKSQvLCAnLnRzJyk7XG4gICAgICB9XG4gICAgICBzb3VyY2VGaWxlID0gdGhpcy5ob3N0LmdldFNvdXJjZUZpbGUocmVzb2x2ZWRGaWxlTmFtZSwgdHMuU2NyaXB0VGFyZ2V0LkxhdGVzdCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIElmIHR5cGVzY3JpcHQgaXMgdW5hYmxlIHRvIHJlc29sdmUgdGhlIGZpbGUsIGZhbGxiYWNrIG9uIG9sZCBiZWhhdmlvclxuICAgICAgaWYgKCF0aGlzLmhvc3QuZmlsZUV4aXN0cyhmaWxlTmFtZSArICcudHMnKSkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgIHNvdXJjZUZpbGUgPSB0aGlzLmhvc3QuZ2V0U291cmNlRmlsZShmaWxlTmFtZSArICcudHMnLCB0cy5TY3JpcHRUYXJnZXQuTGF0ZXN0KTtcbiAgICB9XG5cbiAgICAvLyBJZiB0aGVyZSBpcyBhIG1ldGFkYXRhIGNhY2hlLCB1c2UgaXQgdG8gZ2V0IHRoZSBtZXRhZGF0YSBmb3IgdGhpcyBzb3VyY2UgZmlsZS4gT3RoZXJ3aXNlLFxuICAgIC8vIGZhbGwgYmFjayBvbiB0aGUgbG9jYWxseSBjcmVhdGVkIE1ldGFkYXRhQ29sbGVjdG9yLlxuICAgIGlmICghc291cmNlRmlsZSkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9IGVsc2UgaWYgKHRoaXMuY2FjaGUpIHtcbiAgICAgIHJldHVybiB0aGlzLmNhY2hlLmdldE1ldGFkYXRhKHNvdXJjZUZpbGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5jb2xsZWN0b3IuZ2V0TWV0YWRhdGEoc291cmNlRmlsZSk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHJlc29sdmVNb2R1bGUoaW1wb3J0TmFtZTogc3RyaW5nLCBmcm9tOiBzdHJpbmcpOiBzdHJpbmcge1xuICBpZiAoaW1wb3J0TmFtZS5zdGFydHNXaXRoKCcuJykgJiYgZnJvbSkge1xuICAgIGxldCBub3JtYWxQYXRoID0gcGF0aC5ub3JtYWxpemUocGF0aC5qb2luKHBhdGguZGlybmFtZShmcm9tKSwgaW1wb3J0TmFtZSkpO1xuICAgIGlmICghbm9ybWFsUGF0aC5zdGFydHNXaXRoKCcuJykgJiYgZnJvbS5zdGFydHNXaXRoKCcuJykpIHtcbiAgICAgIC8vIHBhdGgubm9ybWFsaXplKCkgcHJlc2VydmVzIGxlYWRpbmcgJy4uLycgYnV0IG5vdCAnLi8nLiBUaGlzIGFkZHMgaXQgYmFjay5cbiAgICAgIG5vcm1hbFBhdGggPSBgLiR7cGF0aC5zZXB9JHtub3JtYWxQYXRofWA7XG4gICAgfVxuICAgIC8vIFJlcGxhY2Ugd2luZG93cyBwYXRoIGRlbGltaXRlcnMgd2l0aCBmb3J3YXJkLXNsYXNoZXMuIE90aGVyd2lzZSB0aGUgcGF0aHMgYXJlIG5vdFxuICAgIC8vIFR5cGVTY3JpcHQgY29tcGF0aWJsZSB3aGVuIGJ1aWxkaW5nIHRoZSBidW5kbGUuXG4gICAgcmV0dXJuIG5vcm1hbFBhdGgucmVwbGFjZSgvXFxcXC9nLCAnLycpO1xuICB9XG4gIHJldHVybiBpbXBvcnROYW1lO1xufVxuXG5mdW5jdGlvbiBpc1ByaW1pdGl2ZShvOiBhbnkpOiBvIGlzIGJvb2xlYW58c3RyaW5nfG51bWJlciB7XG4gIHJldHVybiBvID09PSBudWxsIHx8ICh0eXBlb2YgbyAhPT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgbyAhPT0gJ29iamVjdCcpO1xufVxuXG5mdW5jdGlvbiBnZXRSb290RXhwb3J0KHN5bWJvbDogU3ltYm9sKTogU3ltYm9sIHtcbiAgcmV0dXJuIHN5bWJvbC5yZWV4cG9ydGVkQXMgPyBnZXRSb290RXhwb3J0KHN5bWJvbC5yZWV4cG9ydGVkQXMpIDogc3ltYm9sO1xufVxuXG5mdW5jdGlvbiBnZXRTeW1ib2xEZWNsYXJhdGlvbihzeW1ib2w6IFN5bWJvbCk6IFN5bWJvbCB7XG4gIHJldHVybiBzeW1ib2wuZXhwb3J0cyA/IGdldFN5bWJvbERlY2xhcmF0aW9uKHN5bWJvbC5leHBvcnRzKSA6IHN5bWJvbDtcbn1cbiJdfQ==