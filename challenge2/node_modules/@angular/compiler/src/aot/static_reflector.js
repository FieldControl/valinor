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
        define("@angular/compiler/src/aot/static_reflector", ["require", "exports", "tslib", "@angular/compiler/src/compile_metadata", "@angular/compiler/src/core", "@angular/compiler/src/util", "@angular/compiler/src/aot/formatted_error", "@angular/compiler/src/aot/static_symbol"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StaticReflector = void 0;
    var tslib_1 = require("tslib");
    var compile_metadata_1 = require("@angular/compiler/src/compile_metadata");
    var core_1 = require("@angular/compiler/src/core");
    var util_1 = require("@angular/compiler/src/util");
    var formatted_error_1 = require("@angular/compiler/src/aot/formatted_error");
    var static_symbol_1 = require("@angular/compiler/src/aot/static_symbol");
    var ANGULAR_CORE = '@angular/core';
    var ANGULAR_ROUTER = '@angular/router';
    var HIDDEN_KEY = /^\$.*\$$/;
    var IGNORE = {
        __symbolic: 'ignore'
    };
    var USE_VALUE = 'useValue';
    var PROVIDE = 'provide';
    var REFERENCE_SET = new Set([USE_VALUE, 'useFactory', 'data', 'id', 'loadChildren']);
    var TYPEGUARD_POSTFIX = 'TypeGuard';
    var USE_IF = 'UseIf';
    function shouldIgnore(value) {
        return value && value.__symbolic == 'ignore';
    }
    /**
     * A static reflector implements enough of the Reflector API that is necessary to compile
     * templates statically.
     */
    var StaticReflector = /** @class */ (function () {
        function StaticReflector(summaryResolver, symbolResolver, knownMetadataClasses, knownMetadataFunctions, errorRecorder) {
            var _this = this;
            if (knownMetadataClasses === void 0) { knownMetadataClasses = []; }
            if (knownMetadataFunctions === void 0) { knownMetadataFunctions = []; }
            this.summaryResolver = summaryResolver;
            this.symbolResolver = symbolResolver;
            this.errorRecorder = errorRecorder;
            this.annotationCache = new Map();
            this.shallowAnnotationCache = new Map();
            this.propertyCache = new Map();
            this.parameterCache = new Map();
            this.methodCache = new Map();
            this.staticCache = new Map();
            this.conversionMap = new Map();
            this.resolvedExternalReferences = new Map();
            this.annotationForParentClassWithSummaryKind = new Map();
            this.initializeConversionMap();
            knownMetadataClasses.forEach(function (kc) { return _this._registerDecoratorOrConstructor(_this.getStaticSymbol(kc.filePath, kc.name), kc.ctor); });
            knownMetadataFunctions.forEach(function (kf) { return _this._registerFunction(_this.getStaticSymbol(kf.filePath, kf.name), kf.fn); });
            this.annotationForParentClassWithSummaryKind.set(compile_metadata_1.CompileSummaryKind.Directive, [core_1.createDirective, core_1.createComponent]);
            this.annotationForParentClassWithSummaryKind.set(compile_metadata_1.CompileSummaryKind.Pipe, [core_1.createPipe]);
            this.annotationForParentClassWithSummaryKind.set(compile_metadata_1.CompileSummaryKind.NgModule, [core_1.createNgModule]);
            this.annotationForParentClassWithSummaryKind.set(compile_metadata_1.CompileSummaryKind.Injectable, [core_1.createInjectable, core_1.createPipe, core_1.createDirective, core_1.createComponent, core_1.createNgModule]);
        }
        StaticReflector.prototype.componentModuleUrl = function (typeOrFunc) {
            var staticSymbol = this.findSymbolDeclaration(typeOrFunc);
            return this.symbolResolver.getResourcePath(staticSymbol);
        };
        /**
         * Invalidate the specified `symbols` on program change.
         * @param symbols
         */
        StaticReflector.prototype.invalidateSymbols = function (symbols) {
            var e_1, _a;
            try {
                for (var symbols_1 = tslib_1.__values(symbols), symbols_1_1 = symbols_1.next(); !symbols_1_1.done; symbols_1_1 = symbols_1.next()) {
                    var symbol = symbols_1_1.value;
                    this.annotationCache.delete(symbol);
                    this.shallowAnnotationCache.delete(symbol);
                    this.propertyCache.delete(symbol);
                    this.parameterCache.delete(symbol);
                    this.methodCache.delete(symbol);
                    this.staticCache.delete(symbol);
                    this.conversionMap.delete(symbol);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (symbols_1_1 && !symbols_1_1.done && (_a = symbols_1.return)) _a.call(symbols_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        };
        StaticReflector.prototype.resolveExternalReference = function (ref, containingFile) {
            var key = undefined;
            if (!containingFile) {
                key = ref.moduleName + ":" + ref.name;
                var declarationSymbol_1 = this.resolvedExternalReferences.get(key);
                if (declarationSymbol_1)
                    return declarationSymbol_1;
            }
            var refSymbol = this.symbolResolver.getSymbolByModule(ref.moduleName, ref.name, containingFile);
            var declarationSymbol = this.findSymbolDeclaration(refSymbol);
            if (!containingFile) {
                this.symbolResolver.recordModuleNameForFileName(refSymbol.filePath, ref.moduleName);
                this.symbolResolver.recordImportAs(declarationSymbol, refSymbol);
            }
            if (key) {
                this.resolvedExternalReferences.set(key, declarationSymbol);
            }
            return declarationSymbol;
        };
        StaticReflector.prototype.findDeclaration = function (moduleUrl, name, containingFile) {
            return this.findSymbolDeclaration(this.symbolResolver.getSymbolByModule(moduleUrl, name, containingFile));
        };
        StaticReflector.prototype.tryFindDeclaration = function (moduleUrl, name, containingFile) {
            var _this = this;
            return this.symbolResolver.ignoreErrorsFor(function () { return _this.findDeclaration(moduleUrl, name, containingFile); });
        };
        StaticReflector.prototype.findSymbolDeclaration = function (symbol) {
            var resolvedSymbol = this.symbolResolver.resolveSymbol(symbol);
            if (resolvedSymbol) {
                var resolvedMetadata = resolvedSymbol.metadata;
                if (resolvedMetadata && resolvedMetadata.__symbolic === 'resolved') {
                    resolvedMetadata = resolvedMetadata.symbol;
                }
                if (resolvedMetadata instanceof static_symbol_1.StaticSymbol) {
                    return this.findSymbolDeclaration(resolvedSymbol.metadata);
                }
            }
            return symbol;
        };
        StaticReflector.prototype.tryAnnotations = function (type) {
            var originalRecorder = this.errorRecorder;
            this.errorRecorder = function (error, fileName) { };
            try {
                return this.annotations(type);
            }
            finally {
                this.errorRecorder = originalRecorder;
            }
        };
        StaticReflector.prototype.annotations = function (type) {
            var _this = this;
            return this._annotations(type, function (type, decorators) { return _this.simplify(type, decorators); }, this.annotationCache);
        };
        StaticReflector.prototype.shallowAnnotations = function (type) {
            var _this = this;
            return this._annotations(type, function (type, decorators) { return _this.simplify(type, decorators, true); }, this.shallowAnnotationCache);
        };
        StaticReflector.prototype._annotations = function (type, simplify, annotationCache) {
            var annotations = annotationCache.get(type);
            if (!annotations) {
                annotations = [];
                var classMetadata = this.getTypeMetadata(type);
                var parentType = this.findParentType(type, classMetadata);
                if (parentType) {
                    var parentAnnotations = this.annotations(parentType);
                    annotations.push.apply(annotations, tslib_1.__spreadArray([], tslib_1.__read(parentAnnotations)));
                }
                var ownAnnotations_1 = [];
                if (classMetadata['decorators']) {
                    ownAnnotations_1 = simplify(type, classMetadata['decorators']);
                    if (ownAnnotations_1) {
                        annotations.push.apply(annotations, tslib_1.__spreadArray([], tslib_1.__read(ownAnnotations_1)));
                    }
                }
                if (parentType && !this.summaryResolver.isLibraryFile(type.filePath) &&
                    this.summaryResolver.isLibraryFile(parentType.filePath)) {
                    var summary = this.summaryResolver.resolveSummary(parentType);
                    if (summary && summary.type) {
                        var requiredAnnotationTypes = this.annotationForParentClassWithSummaryKind.get(summary.type.summaryKind);
                        var typeHasRequiredAnnotation = requiredAnnotationTypes.some(function (requiredType) { return ownAnnotations_1.some(function (ann) { return requiredType.isTypeOf(ann); }); });
                        if (!typeHasRequiredAnnotation) {
                            this.reportError(formatMetadataError(metadataError("Class " + type.name + " in " + type.filePath + " extends from a " + compile_metadata_1.CompileSummaryKind[summary.type.summaryKind] + " in another compilation unit without duplicating the decorator", 
                            /* summary */ undefined, "Please add a " + requiredAnnotationTypes.map(function (type) { return type.ngMetadataName; })
                                .join(' or ') + " decorator to the class"), type), type);
                        }
                    }
                }
                annotationCache.set(type, annotations.filter(function (ann) { return !!ann; }));
            }
            return annotations;
        };
        StaticReflector.prototype.propMetadata = function (type) {
            var _this = this;
            var propMetadata = this.propertyCache.get(type);
            if (!propMetadata) {
                var classMetadata = this.getTypeMetadata(type);
                propMetadata = {};
                var parentType = this.findParentType(type, classMetadata);
                if (parentType) {
                    var parentPropMetadata_1 = this.propMetadata(parentType);
                    Object.keys(parentPropMetadata_1).forEach(function (parentProp) {
                        propMetadata[parentProp] = parentPropMetadata_1[parentProp];
                    });
                }
                var members_1 = classMetadata['members'] || {};
                Object.keys(members_1).forEach(function (propName) {
                    var propData = members_1[propName];
                    var prop = propData
                        .find(function (a) { return a['__symbolic'] == 'property' || a['__symbolic'] == 'method'; });
                    var decorators = [];
                    // hasOwnProperty() is used here to make sure we do not look up methods
                    // on `Object.prototype`.
                    if (propMetadata === null || propMetadata === void 0 ? void 0 : propMetadata.hasOwnProperty(propName)) {
                        decorators.push.apply(decorators, tslib_1.__spreadArray([], tslib_1.__read(propMetadata[propName])));
                    }
                    propMetadata[propName] = decorators;
                    if (prop && prop['decorators']) {
                        decorators.push.apply(decorators, tslib_1.__spreadArray([], tslib_1.__read(_this.simplify(type, prop['decorators']))));
                    }
                });
                this.propertyCache.set(type, propMetadata);
            }
            return propMetadata;
        };
        StaticReflector.prototype.parameters = function (type) {
            var _this = this;
            if (!(type instanceof static_symbol_1.StaticSymbol)) {
                this.reportError(new Error("parameters received " + JSON.stringify(type) + " which is not a StaticSymbol"), type);
                return [];
            }
            try {
                var parameters_1 = this.parameterCache.get(type);
                if (!parameters_1) {
                    var classMetadata = this.getTypeMetadata(type);
                    var parentType = this.findParentType(type, classMetadata);
                    var members = classMetadata ? classMetadata['members'] : null;
                    var ctorData = members ? members['__ctor__'] : null;
                    if (ctorData) {
                        var ctor = ctorData.find(function (a) { return a['__symbolic'] == 'constructor'; });
                        var rawParameterTypes = ctor['parameters'] || [];
                        var parameterDecorators_1 = this.simplify(type, ctor['parameterDecorators'] || []);
                        parameters_1 = [];
                        rawParameterTypes.forEach(function (rawParamType, index) {
                            var nestedResult = [];
                            var paramType = _this.trySimplify(type, rawParamType);
                            if (paramType)
                                nestedResult.push(paramType);
                            var decorators = parameterDecorators_1 ? parameterDecorators_1[index] : null;
                            if (decorators) {
                                nestedResult.push.apply(nestedResult, tslib_1.__spreadArray([], tslib_1.__read(decorators)));
                            }
                            parameters_1.push(nestedResult);
                        });
                    }
                    else if (parentType) {
                        parameters_1 = this.parameters(parentType);
                    }
                    if (!parameters_1) {
                        parameters_1 = [];
                    }
                    this.parameterCache.set(type, parameters_1);
                }
                return parameters_1;
            }
            catch (e) {
                console.error("Failed on type " + JSON.stringify(type) + " with error " + e);
                throw e;
            }
        };
        StaticReflector.prototype._methodNames = function (type) {
            var methodNames = this.methodCache.get(type);
            if (!methodNames) {
                var classMetadata = this.getTypeMetadata(type);
                methodNames = {};
                var parentType = this.findParentType(type, classMetadata);
                if (parentType) {
                    var parentMethodNames_1 = this._methodNames(parentType);
                    Object.keys(parentMethodNames_1).forEach(function (parentProp) {
                        methodNames[parentProp] = parentMethodNames_1[parentProp];
                    });
                }
                var members_2 = classMetadata['members'] || {};
                Object.keys(members_2).forEach(function (propName) {
                    var propData = members_2[propName];
                    var isMethod = propData.some(function (a) { return a['__symbolic'] == 'method'; });
                    methodNames[propName] = methodNames[propName] || isMethod;
                });
                this.methodCache.set(type, methodNames);
            }
            return methodNames;
        };
        StaticReflector.prototype._staticMembers = function (type) {
            var staticMembers = this.staticCache.get(type);
            if (!staticMembers) {
                var classMetadata = this.getTypeMetadata(type);
                var staticMemberData = classMetadata['statics'] || {};
                staticMembers = Object.keys(staticMemberData);
                this.staticCache.set(type, staticMembers);
            }
            return staticMembers;
        };
        StaticReflector.prototype.findParentType = function (type, classMetadata) {
            var parentType = this.trySimplify(type, classMetadata['extends']);
            if (parentType instanceof static_symbol_1.StaticSymbol) {
                return parentType;
            }
        };
        StaticReflector.prototype.hasLifecycleHook = function (type, lcProperty) {
            if (!(type instanceof static_symbol_1.StaticSymbol)) {
                this.reportError(new Error("hasLifecycleHook received " + JSON.stringify(type) + " which is not a StaticSymbol"), type);
            }
            try {
                return !!this._methodNames(type)[lcProperty];
            }
            catch (e) {
                console.error("Failed on type " + JSON.stringify(type) + " with error " + e);
                throw e;
            }
        };
        StaticReflector.prototype.guards = function (type) {
            var e_2, _a;
            if (!(type instanceof static_symbol_1.StaticSymbol)) {
                this.reportError(new Error("guards received " + JSON.stringify(type) + " which is not a StaticSymbol"), type);
                return {};
            }
            var staticMembers = this._staticMembers(type);
            var result = {};
            try {
                for (var staticMembers_1 = tslib_1.__values(staticMembers), staticMembers_1_1 = staticMembers_1.next(); !staticMembers_1_1.done; staticMembers_1_1 = staticMembers_1.next()) {
                    var name_1 = staticMembers_1_1.value;
                    if (name_1.endsWith(TYPEGUARD_POSTFIX)) {
                        var property = name_1.substr(0, name_1.length - TYPEGUARD_POSTFIX.length);
                        var value = void 0;
                        if (property.endsWith(USE_IF)) {
                            property = name_1.substr(0, property.length - USE_IF.length);
                            value = USE_IF;
                        }
                        else {
                            value = this.getStaticSymbol(type.filePath, type.name, [name_1]);
                        }
                        result[property] = value;
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (staticMembers_1_1 && !staticMembers_1_1.done && (_a = staticMembers_1.return)) _a.call(staticMembers_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return result;
        };
        StaticReflector.prototype._registerDecoratorOrConstructor = function (type, ctor) {
            this.conversionMap.set(type, function (context, args) { return new (ctor.bind.apply(ctor, tslib_1.__spreadArray([void 0], tslib_1.__read(args))))(); });
        };
        StaticReflector.prototype._registerFunction = function (type, fn) {
            this.conversionMap.set(type, function (context, args) { return fn.apply(undefined, args); });
        };
        StaticReflector.prototype.initializeConversionMap = function () {
            this._registerDecoratorOrConstructor(this.findDeclaration(ANGULAR_CORE, 'Injectable'), core_1.createInjectable);
            this.injectionToken = this.findDeclaration(ANGULAR_CORE, 'InjectionToken');
            this.opaqueToken = this.findDeclaration(ANGULAR_CORE, 'OpaqueToken');
            this.ROUTES = this.tryFindDeclaration(ANGULAR_ROUTER, 'ROUTES');
            this.ANALYZE_FOR_ENTRY_COMPONENTS =
                this.findDeclaration(ANGULAR_CORE, 'ANALYZE_FOR_ENTRY_COMPONENTS');
            this._registerDecoratorOrConstructor(this.findDeclaration(ANGULAR_CORE, 'Host'), core_1.createHost);
            this._registerDecoratorOrConstructor(this.findDeclaration(ANGULAR_CORE, 'Self'), core_1.createSelf);
            this._registerDecoratorOrConstructor(this.findDeclaration(ANGULAR_CORE, 'SkipSelf'), core_1.createSkipSelf);
            this._registerDecoratorOrConstructor(this.findDeclaration(ANGULAR_CORE, 'Inject'), core_1.createInject);
            this._registerDecoratorOrConstructor(this.findDeclaration(ANGULAR_CORE, 'Optional'), core_1.createOptional);
            this._registerDecoratorOrConstructor(this.findDeclaration(ANGULAR_CORE, 'Attribute'), core_1.createAttribute);
            this._registerDecoratorOrConstructor(this.findDeclaration(ANGULAR_CORE, 'ContentChild'), core_1.createContentChild);
            this._registerDecoratorOrConstructor(this.findDeclaration(ANGULAR_CORE, 'ContentChildren'), core_1.createContentChildren);
            this._registerDecoratorOrConstructor(this.findDeclaration(ANGULAR_CORE, 'ViewChild'), core_1.createViewChild);
            this._registerDecoratorOrConstructor(this.findDeclaration(ANGULAR_CORE, 'ViewChildren'), core_1.createViewChildren);
            this._registerDecoratorOrConstructor(this.findDeclaration(ANGULAR_CORE, 'Input'), core_1.createInput);
            this._registerDecoratorOrConstructor(this.findDeclaration(ANGULAR_CORE, 'Output'), core_1.createOutput);
            this._registerDecoratorOrConstructor(this.findDeclaration(ANGULAR_CORE, 'Pipe'), core_1.createPipe);
            this._registerDecoratorOrConstructor(this.findDeclaration(ANGULAR_CORE, 'HostBinding'), core_1.createHostBinding);
            this._registerDecoratorOrConstructor(this.findDeclaration(ANGULAR_CORE, 'HostListener'), core_1.createHostListener);
            this._registerDecoratorOrConstructor(this.findDeclaration(ANGULAR_CORE, 'Directive'), core_1.createDirective);
            this._registerDecoratorOrConstructor(this.findDeclaration(ANGULAR_CORE, 'Component'), core_1.createComponent);
            this._registerDecoratorOrConstructor(this.findDeclaration(ANGULAR_CORE, 'NgModule'), core_1.createNgModule);
            // Note: Some metadata classes can be used directly with Provider.deps.
            this._registerDecoratorOrConstructor(this.findDeclaration(ANGULAR_CORE, 'Host'), core_1.createHost);
            this._registerDecoratorOrConstructor(this.findDeclaration(ANGULAR_CORE, 'Self'), core_1.createSelf);
            this._registerDecoratorOrConstructor(this.findDeclaration(ANGULAR_CORE, 'SkipSelf'), core_1.createSkipSelf);
            this._registerDecoratorOrConstructor(this.findDeclaration(ANGULAR_CORE, 'Optional'), core_1.createOptional);
        };
        /**
         * getStaticSymbol produces a Type whose metadata is known but whose implementation is not loaded.
         * All types passed to the StaticResolver should be pseudo-types returned by this method.
         *
         * @param declarationFile the absolute path of the file where the symbol is declared
         * @param name the name of the type.
         */
        StaticReflector.prototype.getStaticSymbol = function (declarationFile, name, members) {
            return this.symbolResolver.getStaticSymbol(declarationFile, name, members);
        };
        /**
         * Simplify but discard any errors
         */
        StaticReflector.prototype.trySimplify = function (context, value) {
            var originalRecorder = this.errorRecorder;
            this.errorRecorder = function (error, fileName) { };
            var result = this.simplify(context, value);
            this.errorRecorder = originalRecorder;
            return result;
        };
        /** @internal */
        StaticReflector.prototype.simplify = function (context, value, lazy) {
            if (lazy === void 0) { lazy = false; }
            var self = this;
            var scope = BindingScope.empty;
            var calling = new Map();
            var rootContext = context;
            function simplifyInContext(context, value, depth, references) {
                function resolveReferenceValue(staticSymbol) {
                    var resolvedSymbol = self.symbolResolver.resolveSymbol(staticSymbol);
                    return resolvedSymbol ? resolvedSymbol.metadata : null;
                }
                function simplifyEagerly(value) {
                    return simplifyInContext(context, value, depth, 0);
                }
                function simplifyLazily(value) {
                    return simplifyInContext(context, value, depth, references + 1);
                }
                function simplifyNested(nestedContext, value) {
                    if (nestedContext === context) {
                        // If the context hasn't changed let the exception propagate unmodified.
                        return simplifyInContext(nestedContext, value, depth + 1, references);
                    }
                    try {
                        return simplifyInContext(nestedContext, value, depth + 1, references);
                    }
                    catch (e) {
                        if (isMetadataError(e)) {
                            // Propagate the message text up but add a message to the chain that explains how we got
                            // here.
                            // e.chain implies e.symbol
                            var summaryMsg = e.chain ? 'references \'' + e.symbol.name + '\'' : errorSummary(e);
                            var summary = "'" + nestedContext.name + "' " + summaryMsg;
                            var chain = { message: summary, position: e.position, next: e.chain };
                            // TODO(chuckj): retrieve the position information indirectly from the collectors node
                            // map if the metadata is from a .ts file.
                            self.error({
                                message: e.message,
                                advise: e.advise,
                                context: e.context,
                                chain: chain,
                                symbol: nestedContext
                            }, context);
                        }
                        else {
                            // It is probably an internal error.
                            throw e;
                        }
                    }
                }
                function simplifyCall(functionSymbol, targetFunction, args, targetExpression) {
                    if (targetFunction && targetFunction['__symbolic'] == 'function') {
                        if (calling.get(functionSymbol)) {
                            self.error({
                                message: 'Recursion is not supported',
                                summary: "called '" + functionSymbol.name + "' recursively",
                                value: targetFunction
                            }, functionSymbol);
                        }
                        try {
                            var value_1 = targetFunction['value'];
                            if (value_1 && (depth != 0 || value_1.__symbolic != 'error')) {
                                var parameters = targetFunction['parameters'];
                                var defaults = targetFunction.defaults;
                                args = args.map(function (arg) { return simplifyNested(context, arg); })
                                    .map(function (arg) { return shouldIgnore(arg) ? undefined : arg; });
                                if (defaults && defaults.length > args.length) {
                                    args.push.apply(args, tslib_1.__spreadArray([], tslib_1.__read(defaults.slice(args.length).map(function (value) { return simplify(value); }))));
                                }
                                calling.set(functionSymbol, true);
                                var functionScope = BindingScope.build();
                                for (var i = 0; i < parameters.length; i++) {
                                    functionScope.define(parameters[i], args[i]);
                                }
                                var oldScope = scope;
                                var result_1;
                                try {
                                    scope = functionScope.done();
                                    result_1 = simplifyNested(functionSymbol, value_1);
                                }
                                finally {
                                    scope = oldScope;
                                }
                                return result_1;
                            }
                        }
                        finally {
                            calling.delete(functionSymbol);
                        }
                    }
                    if (depth === 0) {
                        // If depth is 0 we are evaluating the top level expression that is describing element
                        // decorator. In this case, it is a decorator we don't understand, such as a custom
                        // non-angular decorator, and we should just ignore it.
                        return IGNORE;
                    }
                    var position = undefined;
                    if (targetExpression && targetExpression.__symbolic == 'resolved') {
                        var line = targetExpression.line;
                        var character = targetExpression.character;
                        var fileName = targetExpression.fileName;
                        if (fileName != null && line != null && character != null) {
                            position = { fileName: fileName, line: line, column: character };
                        }
                    }
                    self.error({
                        message: FUNCTION_CALL_NOT_SUPPORTED,
                        context: functionSymbol,
                        value: targetFunction,
                        position: position
                    }, context);
                }
                function simplify(expression) {
                    var e_3, _a, e_4, _b;
                    if (isPrimitive(expression)) {
                        return expression;
                    }
                    if (Array.isArray(expression)) {
                        var result_2 = [];
                        try {
                            for (var _c = tslib_1.__values(expression), _d = _c.next(); !_d.done; _d = _c.next()) {
                                var item = _d.value;
                                // Check for a spread expression
                                if (item && item.__symbolic === 'spread') {
                                    // We call with references as 0 because we require the actual value and cannot
                                    // tolerate a reference here.
                                    var spreadArray = simplifyEagerly(item.expression);
                                    if (Array.isArray(spreadArray)) {
                                        try {
                                            for (var spreadArray_1 = (e_4 = void 0, tslib_1.__values(spreadArray)), spreadArray_1_1 = spreadArray_1.next(); !spreadArray_1_1.done; spreadArray_1_1 = spreadArray_1.next()) {
                                                var spreadItem = spreadArray_1_1.value;
                                                result_2.push(spreadItem);
                                            }
                                        }
                                        catch (e_4_1) { e_4 = { error: e_4_1 }; }
                                        finally {
                                            try {
                                                if (spreadArray_1_1 && !spreadArray_1_1.done && (_b = spreadArray_1.return)) _b.call(spreadArray_1);
                                            }
                                            finally { if (e_4) throw e_4.error; }
                                        }
                                        continue;
                                    }
                                }
                                var value_2 = simplify(item);
                                if (shouldIgnore(value_2)) {
                                    continue;
                                }
                                result_2.push(value_2);
                            }
                        }
                        catch (e_3_1) { e_3 = { error: e_3_1 }; }
                        finally {
                            try {
                                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                            }
                            finally { if (e_3) throw e_3.error; }
                        }
                        return result_2;
                    }
                    if (expression instanceof static_symbol_1.StaticSymbol) {
                        // Stop simplification at builtin symbols or if we are in a reference context and
                        // the symbol doesn't have members.
                        if (expression === self.injectionToken || self.conversionMap.has(expression) ||
                            (references > 0 && !expression.members.length)) {
                            return expression;
                        }
                        else {
                            var staticSymbol = expression;
                            var declarationValue = resolveReferenceValue(staticSymbol);
                            if (declarationValue != null) {
                                return simplifyNested(staticSymbol, declarationValue);
                            }
                            else {
                                return staticSymbol;
                            }
                        }
                    }
                    if (expression) {
                        if (expression['__symbolic']) {
                            var staticSymbol = void 0;
                            switch (expression['__symbolic']) {
                                case 'binop':
                                    var left = simplify(expression['left']);
                                    if (shouldIgnore(left))
                                        return left;
                                    var right = simplify(expression['right']);
                                    if (shouldIgnore(right))
                                        return right;
                                    switch (expression['operator']) {
                                        case '&&':
                                            return left && right;
                                        case '||':
                                            return left || right;
                                        case '|':
                                            return left | right;
                                        case '^':
                                            return left ^ right;
                                        case '&':
                                            return left & right;
                                        case '==':
                                            return left == right;
                                        case '!=':
                                            return left != right;
                                        case '===':
                                            return left === right;
                                        case '!==':
                                            return left !== right;
                                        case '<':
                                            return left < right;
                                        case '>':
                                            return left > right;
                                        case '<=':
                                            return left <= right;
                                        case '>=':
                                            return left >= right;
                                        case '<<':
                                            return left << right;
                                        case '>>':
                                            return left >> right;
                                        case '+':
                                            return left + right;
                                        case '-':
                                            return left - right;
                                        case '*':
                                            return left * right;
                                        case '/':
                                            return left / right;
                                        case '%':
                                            return left % right;
                                        case '??':
                                            return left !== null && left !== void 0 ? left : right;
                                    }
                                    return null;
                                case 'if':
                                    var condition = simplify(expression['condition']);
                                    return condition ? simplify(expression['thenExpression']) :
                                        simplify(expression['elseExpression']);
                                case 'pre':
                                    var operand = simplify(expression['operand']);
                                    if (shouldIgnore(operand))
                                        return operand;
                                    switch (expression['operator']) {
                                        case '+':
                                            return operand;
                                        case '-':
                                            return -operand;
                                        case '!':
                                            return !operand;
                                        case '~':
                                            return ~operand;
                                    }
                                    return null;
                                case 'index':
                                    var indexTarget = simplifyEagerly(expression['expression']);
                                    var index = simplifyEagerly(expression['index']);
                                    if (indexTarget && isPrimitive(index))
                                        return indexTarget[index];
                                    return null;
                                case 'select':
                                    var member = expression['member'];
                                    var selectContext = context;
                                    var selectTarget = simplify(expression['expression']);
                                    if (selectTarget instanceof static_symbol_1.StaticSymbol) {
                                        var members = selectTarget.members.concat(member);
                                        selectContext =
                                            self.getStaticSymbol(selectTarget.filePath, selectTarget.name, members);
                                        var declarationValue = resolveReferenceValue(selectContext);
                                        if (declarationValue != null) {
                                            return simplifyNested(selectContext, declarationValue);
                                        }
                                        else {
                                            return selectContext;
                                        }
                                    }
                                    if (selectTarget && isPrimitive(member))
                                        return simplifyNested(selectContext, selectTarget[member]);
                                    return null;
                                case 'reference':
                                    // Note: This only has to deal with variable references, as symbol references have
                                    // been converted into 'resolved'
                                    // in the StaticSymbolResolver.
                                    var name_2 = expression['name'];
                                    var localValue = scope.resolve(name_2);
                                    if (localValue != BindingScope.missing) {
                                        return localValue;
                                    }
                                    break;
                                case 'resolved':
                                    try {
                                        return simplify(expression.symbol);
                                    }
                                    catch (e) {
                                        // If an error is reported evaluating the symbol record the position of the
                                        // reference in the error so it can
                                        // be reported in the error message generated from the exception.
                                        if (isMetadataError(e) && expression.fileName != null &&
                                            expression.line != null && expression.character != null) {
                                            e.position = {
                                                fileName: expression.fileName,
                                                line: expression.line,
                                                column: expression.character
                                            };
                                        }
                                        throw e;
                                    }
                                case 'class':
                                    return context;
                                case 'function':
                                    return context;
                                case 'new':
                                case 'call':
                                    // Determine if the function is a built-in conversion
                                    staticSymbol = simplifyInContext(context, expression['expression'], depth + 1, /* references */ 0);
                                    if (staticSymbol instanceof static_symbol_1.StaticSymbol) {
                                        if (staticSymbol === self.injectionToken || staticSymbol === self.opaqueToken) {
                                            // if somebody calls new InjectionToken, don't create an InjectionToken,
                                            // but rather return the symbol to which the InjectionToken is assigned to.
                                            // OpaqueToken is supported too as it is required by the language service to
                                            // support v4 and prior versions of Angular.
                                            return context;
                                        }
                                        var argExpressions = expression['arguments'] || [];
                                        var converter = self.conversionMap.get(staticSymbol);
                                        if (converter) {
                                            var args = argExpressions.map(function (arg) { return simplifyNested(context, arg); })
                                                .map(function (arg) { return shouldIgnore(arg) ? undefined : arg; });
                                            return converter(context, args);
                                        }
                                        else {
                                            // Determine if the function is one we can simplify.
                                            var targetFunction = resolveReferenceValue(staticSymbol);
                                            return simplifyCall(staticSymbol, targetFunction, argExpressions, expression['expression']);
                                        }
                                    }
                                    return IGNORE;
                                case 'error':
                                    var message = expression.message;
                                    if (expression['line'] != null) {
                                        self.error({
                                            message: message,
                                            context: expression.context,
                                            value: expression,
                                            position: {
                                                fileName: expression['fileName'],
                                                line: expression['line'],
                                                column: expression['character']
                                            }
                                        }, context);
                                    }
                                    else {
                                        self.error({ message: message, context: expression.context }, context);
                                    }
                                    return IGNORE;
                                case 'ignore':
                                    return expression;
                            }
                            return null;
                        }
                        return mapStringMap(expression, function (value, name) {
                            if (REFERENCE_SET.has(name)) {
                                if (name === USE_VALUE && PROVIDE in expression) {
                                    // If this is a provider expression, check for special tokens that need the value
                                    // during analysis.
                                    var provide = simplify(expression.provide);
                                    if (provide === self.ROUTES || provide == self.ANALYZE_FOR_ENTRY_COMPONENTS) {
                                        return simplify(value);
                                    }
                                }
                                return simplifyLazily(value);
                            }
                            return simplify(value);
                        });
                    }
                    return IGNORE;
                }
                return simplify(value);
            }
            var result;
            try {
                result = simplifyInContext(context, value, 0, lazy ? 1 : 0);
            }
            catch (e) {
                if (this.errorRecorder) {
                    this.reportError(e, context);
                }
                else {
                    throw formatMetadataError(e, context);
                }
            }
            if (shouldIgnore(result)) {
                return undefined;
            }
            return result;
        };
        StaticReflector.prototype.getTypeMetadata = function (type) {
            var resolvedSymbol = this.symbolResolver.resolveSymbol(type);
            return resolvedSymbol && resolvedSymbol.metadata ? resolvedSymbol.metadata :
                { __symbolic: 'class' };
        };
        StaticReflector.prototype.reportError = function (error, context, path) {
            if (this.errorRecorder) {
                this.errorRecorder(formatMetadataError(error, context), (context && context.filePath) || path);
            }
            else {
                throw error;
            }
        };
        StaticReflector.prototype.error = function (_a, reportingContext) {
            var message = _a.message, summary = _a.summary, advise = _a.advise, position = _a.position, context = _a.context, value = _a.value, symbol = _a.symbol, chain = _a.chain;
            this.reportError(metadataError(message, summary, advise, position, symbol, context, chain), reportingContext);
        };
        return StaticReflector;
    }());
    exports.StaticReflector = StaticReflector;
    var METADATA_ERROR = 'ngMetadataError';
    function metadataError(message, summary, advise, position, symbol, context, chain) {
        var error = util_1.syntaxError(message);
        error[METADATA_ERROR] = true;
        if (advise)
            error.advise = advise;
        if (position)
            error.position = position;
        if (summary)
            error.summary = summary;
        if (context)
            error.context = context;
        if (chain)
            error.chain = chain;
        if (symbol)
            error.symbol = symbol;
        return error;
    }
    function isMetadataError(error) {
        return !!error[METADATA_ERROR];
    }
    var REFERENCE_TO_NONEXPORTED_CLASS = 'Reference to non-exported class';
    var VARIABLE_NOT_INITIALIZED = 'Variable not initialized';
    var DESTRUCTURE_NOT_SUPPORTED = 'Destructuring not supported';
    var COULD_NOT_RESOLVE_TYPE = 'Could not resolve type';
    var FUNCTION_CALL_NOT_SUPPORTED = 'Function call not supported';
    var REFERENCE_TO_LOCAL_SYMBOL = 'Reference to a local symbol';
    var LAMBDA_NOT_SUPPORTED = 'Lambda not supported';
    function expandedMessage(message, context) {
        switch (message) {
            case REFERENCE_TO_NONEXPORTED_CLASS:
                if (context && context.className) {
                    return "References to a non-exported class are not supported in decorators but " + context.className + " was referenced.";
                }
                break;
            case VARIABLE_NOT_INITIALIZED:
                return 'Only initialized variables and constants can be referenced in decorators because the value of this variable is needed by the template compiler';
            case DESTRUCTURE_NOT_SUPPORTED:
                return 'Referencing an exported destructured variable or constant is not supported in decorators and this value is needed by the template compiler';
            case COULD_NOT_RESOLVE_TYPE:
                if (context && context.typeName) {
                    return "Could not resolve type " + context.typeName;
                }
                break;
            case FUNCTION_CALL_NOT_SUPPORTED:
                if (context && context.name) {
                    return "Function calls are not supported in decorators but '" + context.name + "' was called";
                }
                return 'Function calls are not supported in decorators';
            case REFERENCE_TO_LOCAL_SYMBOL:
                if (context && context.name) {
                    return "Reference to a local (non-exported) symbols are not supported in decorators but '" + context.name + "' was referenced";
                }
                break;
            case LAMBDA_NOT_SUPPORTED:
                return "Function expressions are not supported in decorators";
        }
        return message;
    }
    function messageAdvise(message, context) {
        switch (message) {
            case REFERENCE_TO_NONEXPORTED_CLASS:
                if (context && context.className) {
                    return "Consider exporting '" + context.className + "'";
                }
                break;
            case DESTRUCTURE_NOT_SUPPORTED:
                return 'Consider simplifying to avoid destructuring';
            case REFERENCE_TO_LOCAL_SYMBOL:
                if (context && context.name) {
                    return "Consider exporting '" + context.name + "'";
                }
                break;
            case LAMBDA_NOT_SUPPORTED:
                return "Consider changing the function expression into an exported function";
        }
        return undefined;
    }
    function errorSummary(error) {
        if (error.summary) {
            return error.summary;
        }
        switch (error.message) {
            case REFERENCE_TO_NONEXPORTED_CLASS:
                if (error.context && error.context.className) {
                    return "references non-exported class " + error.context.className;
                }
                break;
            case VARIABLE_NOT_INITIALIZED:
                return 'is not initialized';
            case DESTRUCTURE_NOT_SUPPORTED:
                return 'is a destructured variable';
            case COULD_NOT_RESOLVE_TYPE:
                return 'could not be resolved';
            case FUNCTION_CALL_NOT_SUPPORTED:
                if (error.context && error.context.name) {
                    return "calls '" + error.context.name + "'";
                }
                return "calls a function";
            case REFERENCE_TO_LOCAL_SYMBOL:
                if (error.context && error.context.name) {
                    return "references local variable " + error.context.name;
                }
                return "references a local variable";
        }
        return 'contains the error';
    }
    function mapStringMap(input, transform) {
        if (!input)
            return {};
        var result = {};
        Object.keys(input).forEach(function (key) {
            var value = transform(input[key], key);
            if (!shouldIgnore(value)) {
                if (HIDDEN_KEY.test(key)) {
                    Object.defineProperty(result, key, { enumerable: false, configurable: true, value: value });
                }
                else {
                    result[key] = value;
                }
            }
        });
        return result;
    }
    function isPrimitive(o) {
        return o === null || (typeof o !== 'function' && typeof o !== 'object');
    }
    var BindingScope = /** @class */ (function () {
        function BindingScope() {
        }
        BindingScope.build = function () {
            var current = new Map();
            return {
                define: function (name, value) {
                    current.set(name, value);
                    return this;
                },
                done: function () {
                    return current.size > 0 ? new PopulatedScope(current) : BindingScope.empty;
                }
            };
        };
        BindingScope.missing = {};
        BindingScope.empty = { resolve: function (name) { return BindingScope.missing; } };
        return BindingScope;
    }());
    var PopulatedScope = /** @class */ (function (_super) {
        tslib_1.__extends(PopulatedScope, _super);
        function PopulatedScope(bindings) {
            var _this = _super.call(this) || this;
            _this.bindings = bindings;
            return _this;
        }
        PopulatedScope.prototype.resolve = function (name) {
            return this.bindings.has(name) ? this.bindings.get(name) : BindingScope.missing;
        };
        return PopulatedScope;
    }(BindingScope));
    function formatMetadataMessageChain(chain, advise) {
        var expanded = expandedMessage(chain.message, chain.context);
        var nesting = chain.symbol ? " in '" + chain.symbol.name + "'" : '';
        var message = "" + expanded + nesting;
        var position = chain.position;
        var next = chain.next ?
            formatMetadataMessageChain(chain.next, advise) :
            advise ? { message: advise } : undefined;
        return { message: message, position: position, next: next ? [next] : undefined };
    }
    function formatMetadataError(e, context) {
        if (isMetadataError(e)) {
            // Produce a formatted version of the and leaving enough information in the original error
            // to recover the formatting information to eventually produce a diagnostic error message.
            var position = e.position;
            var chain = {
                message: "Error during template compile of '" + context.name + "'",
                position: position,
                next: { message: e.message, next: e.chain, context: e.context, symbol: e.symbol }
            };
            var advise = e.advise || messageAdvise(e.message, e.context);
            return formatted_error_1.formattedError(formatMetadataMessageChain(chain, advise));
        }
        return e;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGljX3JlZmxlY3Rvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9hb3Qvc3RhdGljX3JlZmxlY3Rvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgsMkVBQXVEO0lBRXZELG1EQUFpVztJQUdqVyxtREFBb0M7SUFFcEMsNkVBQXdFO0lBQ3hFLHlFQUE2QztJQUc3QyxJQUFNLFlBQVksR0FBRyxlQUFlLENBQUM7SUFDckMsSUFBTSxjQUFjLEdBQUcsaUJBQWlCLENBQUM7SUFFekMsSUFBTSxVQUFVLEdBQUcsVUFBVSxDQUFDO0lBRTlCLElBQU0sTUFBTSxHQUFHO1FBQ2IsVUFBVSxFQUFFLFFBQVE7S0FDckIsQ0FBQztJQUVGLElBQU0sU0FBUyxHQUFHLFVBQVUsQ0FBQztJQUM3QixJQUFNLE9BQU8sR0FBRyxTQUFTLENBQUM7SUFDMUIsSUFBTSxhQUFhLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQyxTQUFTLEVBQUUsWUFBWSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQztJQUN2RixJQUFNLGlCQUFpQixHQUFHLFdBQVcsQ0FBQztJQUN0QyxJQUFNLE1BQU0sR0FBRyxPQUFPLENBQUM7SUFFdkIsU0FBUyxZQUFZLENBQUMsS0FBVTtRQUM5QixPQUFPLEtBQUssSUFBSSxLQUFLLENBQUMsVUFBVSxJQUFJLFFBQVEsQ0FBQztJQUMvQyxDQUFDO0lBRUQ7OztPQUdHO0lBQ0g7UUFvQkUseUJBQ1ksZUFBOEMsRUFDOUMsY0FBb0MsRUFDNUMsb0JBQXdFLEVBQ3hFLHNCQUF3RSxFQUNoRSxhQUF1RDtZQUxuRSxpQkFtQkM7WUFoQkcscUNBQUEsRUFBQSx5QkFBd0U7WUFDeEUsdUNBQUEsRUFBQSwyQkFBd0U7WUFIaEUsb0JBQWUsR0FBZixlQUFlLENBQStCO1lBQzlDLG1CQUFj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Q0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQy9ELE9BQU8sZ0NBQWMsQ0FBQywwQkFBMEIsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztTQUNsRTtRQUNELE9BQU8sQ0FBQyxDQUFDO0lBQ1gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbXBpbGVTdW1tYXJ5S2luZH0gZnJvbSAnLi4vY29tcGlsZV9tZXRhZGF0YSc7XG5pbXBvcnQge0NvbXBpbGVSZWZsZWN0b3J9IGZyb20gJy4uL2NvbXBpbGVfcmVmbGVjdG9yJztcbmltcG9ydCB7Y3JlYXRlQXR0cmlidXRlLCBjcmVhdGVDb21wb25lbnQsIGNyZWF0ZUNvbnRlbnRDaGlsZCwgY3JlYXRlQ29udGVudENoaWxkcmVuLCBjcmVhdGVEaXJlY3RpdmUsIGNyZWF0ZUhvc3QsIGNyZWF0ZUhvc3RCaW5kaW5nLCBjcmVhdGVIb3N0TGlzdGVuZXIsIGNyZWF0ZUluamVjdCwgY3JlYXRlSW5qZWN0YWJsZSwgY3JlYXRlSW5wdXQsIGNyZWF0ZU5nTW9kdWxlLCBjcmVhdGVPcHRpb25hbCwgY3JlYXRlT3V0cHV0LCBjcmVhdGVQaXBlLCBjcmVhdGVTZWxmLCBjcmVhdGVTa2lwU2VsZiwgY3JlYXRlVmlld0NoaWxkLCBjcmVhdGVWaWV3Q2hpbGRyZW4sIE1ldGFkYXRhRmFjdG9yeX0gZnJvbSAnLi4vY29yZSc7XG5pbXBvcnQgKiBhcyBvIGZyb20gJy4uL291dHB1dC9vdXRwdXRfYXN0JztcbmltcG9ydCB7U3VtbWFyeVJlc29sdmVyfSBmcm9tICcuLi9zdW1tYXJ5X3Jlc29sdmVyJztcbmltcG9ydCB7c3ludGF4RXJyb3J9IGZyb20gJy4uL3V0aWwnO1xuXG5pbXBvcnQge2Zvcm1hdHRlZEVycm9yLCBGb3JtYXR0ZWRNZXNzYWdlQ2hhaW59IGZyb20gJy4vZm9ybWF0dGVkX2Vycm9yJztcbmltcG9ydCB7U3RhdGljU3ltYm9sfSBmcm9tICcuL3N0YXRpY19zeW1ib2wnO1xuaW1wb3J0IHtTdGF0aWNTeW1ib2xSZXNvbHZlcn0gZnJvbSAnLi9zdGF0aWNfc3ltYm9sX3Jlc29sdmVyJztcblxuY29uc3QgQU5HVUxBUl9DT1JFID0gJ0Bhbmd1bGFyL2NvcmUnO1xuY29uc3QgQU5HVUxBUl9ST1VURVIgPSAnQGFuZ3VsYXIvcm91dGVyJztcblxuY29uc3QgSElEREVOX0tFWSA9IC9eXFwkLipcXCQkLztcblxuY29uc3QgSUdOT1JFID0ge1xuICBfX3N5bWJvbGljOiAnaWdub3JlJ1xufTtcblxuY29uc3QgVVNFX1ZBTFVFID0gJ3VzZVZhbHVlJztcbmNvbnN0IFBST1ZJREUgPSAncHJvdmlkZSc7XG5jb25zdCBSRUZFUkVOQ0VfU0VUID0gbmV3IFNldChbVVNFX1ZBTFVFLCAndXNlRmFjdG9yeScsICdkYXRhJywgJ2lkJywgJ2xvYWRDaGlsZHJlbiddKTtcbmNvbnN0IFRZUEVHVUFSRF9QT1NURklYID0gJ1R5cGVHdWFyZCc7XG5jb25zdCBVU0VfSUYgPSAnVXNlSWYnO1xuXG5mdW5jdGlvbiBzaG91bGRJZ25vcmUodmFsdWU6IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gdmFsdWUgJiYgdmFsdWUuX19zeW1ib2xpYyA9PSAnaWdub3JlJztcbn1cblxuLyoqXG4gKiBBIHN0YXRpYyByZWZsZWN0b3IgaW1wbGVtZW50cyBlbm91Z2ggb2YgdGhlIFJlZmxlY3RvciBBUEkgdGhhdCBpcyBuZWNlc3NhcnkgdG8gY29tcGlsZVxuICogdGVtcGxhdGVzIHN0YXRpY2FsbHkuXG4gKi9cbmV4cG9ydCBjbGFzcyBTdGF0aWNSZWZsZWN0b3IgaW1wbGVtZW50cyBDb21waWxlUmVmbGVjdG9yIHtcbiAgcHJpdmF0ZSBhbm5vdGF0aW9uQ2FjaGUgPSBuZXcgTWFwPFN0YXRpY1N5bWJvbCwgYW55W10+KCk7XG4gIHByaXZhdGUgc2hhbGxvd0Fubm90YXRpb25DYWNoZSA9IG5ldyBNYXA8U3RhdGljU3ltYm9sLCBhbnlbXT4oKTtcbiAgcHJpdmF0ZSBwcm9wZXJ0eUNhY2hlID0gbmV3IE1hcDxTdGF0aWNTeW1ib2wsIHtba2V5OiBzdHJpbmddOiBhbnlbXX0+KCk7XG4gIHByaXZhdGUgcGFyYW1ldGVyQ2FjaGUgPSBuZXcgTWFwPFN0YXRpY1N5bWJvbCwgYW55W10+KCk7XG4gIHByaXZhdGUgbWV0aG9kQ2FjaGUgPSBuZXcgTWFwPFN0YXRpY1N5bWJvbCwge1trZXk6IHN0cmluZ106IGJvb2xlYW59PigpO1xuICBwcml2YXRlIHN0YXRpY0NhY2hlID0gbmV3IE1hcDxTdGF0aWNTeW1ib2wsIHN0cmluZ1tdPigpO1xuICBwcml2YXRlIGNvbnZlcnNpb25NYXAgPSBuZXcgTWFwPFN0YXRpY1N5bWJvbCwgKGNvbnRleHQ6IFN0YXRpY1N5bWJvbCwgYXJnczogYW55W10pID0+IGFueT4oKTtcbiAgcHJpdmF0ZSByZXNvbHZlZEV4dGVybmFsUmVmZXJlbmNlcyA9IG5ldyBNYXA8c3RyaW5nLCBTdGF0aWNTeW1ib2w+KCk7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIGluamVjdGlvblRva2VuITogU3RhdGljU3ltYm9sO1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBvcGFxdWVUb2tlbiE6IFN0YXRpY1N5bWJvbDtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIFJPVVRFUyE6IFN0YXRpY1N5bWJvbDtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHByaXZhdGUgQU5BTFlaRV9GT1JfRU5UUllfQ09NUE9ORU5UUyE6IFN0YXRpY1N5bWJvbDtcbiAgcHJpdmF0ZSBhbm5vdGF0aW9uRm9yUGFyZW50Q2xhc3NXaXRoU3VtbWFyeUtpbmQgPVxuICAgICAgbmV3IE1hcDxDb21waWxlU3VtbWFyeUtpbmQsIE1ldGFkYXRhRmFjdG9yeTxhbnk+W10+KCk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIHN1bW1hcnlSZXNvbHZlcjogU3VtbWFyeVJlc29sdmVyPFN0YXRpY1N5bWJvbD4sXG4gICAgICBwcml2YXRlIHN5bWJvbFJlc29sdmVyOiBTdGF0aWNTeW1ib2xSZXNvbHZlcixcbiAgICAgIGtub3duTWV0YWRhdGFDbGFzc2VzOiB7bmFtZTogc3RyaW5nLCBmaWxlUGF0aDogc3RyaW5nLCBjdG9yOiBhbnl9W10gPSBbXSxcbiAgICAgIGtub3duTWV0YWRhdGFGdW5jdGlvbnM6IHtuYW1lOiBzdHJpbmcsIGZpbGVQYXRoOiBzdHJpbmcsIGZuOiBhbnl9W10gPSBbXSxcbiAgICAgIHByaXZhdGUgZXJyb3JSZWNvcmRlcj86IChlcnJvcjogYW55LCBmaWxlTmFtZT86IHN0cmluZykgPT4gdm9pZCkge1xuICAgIHRoaXMuaW5pdGlhbGl6ZUNvbnZlcnNpb25NYXAoKTtcbiAgICBrbm93bk1ldGFkYXRhQ2xhc3Nlcy5mb3JFYWNoKFxuICAgICAgICAoa2MpID0+IHRoaXMuX3JlZ2lzdGVyRGVjb3JhdG9yT3JDb25zdHJ1Y3RvcihcbiAgICAgICAgICAgIHRoaXMuZ2V0U3RhdGljU3ltYm9sKGtjLmZpbGVQYXRoLCBrYy5uYW1lKSwga2MuY3RvcikpO1xuICAgIGtub3duTWV0YWRhdGFGdW5jdGlvbnMuZm9yRWFjaChcbiAgICAgICAgKGtmKSA9PiB0aGlzLl9yZWdpc3RlckZ1bmN0aW9uKHRoaXMuZ2V0U3RhdGljU3ltYm9sKGtmLmZpbGVQYXRoLCBrZi5uYW1lKSwga2YuZm4pKTtcbiAgICB0aGlzLmFubm90YXRpb25Gb3JQYXJlbnRDbGFzc1dpdGhTdW1tYXJ5S2luZC5zZXQoXG4gICAgICAgIENvbXBpbGVTdW1tYXJ5S2luZC5EaXJlY3RpdmUsIFtjcmVhdGVEaXJlY3RpdmUsIGNyZWF0ZUNvbXBvbmVudF0pO1xuICAgIHRoaXMuYW5ub3RhdGlvbkZvclBhcmVudENsYXNzV2l0aFN1bW1hcnlLaW5kLnNldChDb21waWxlU3VtbWFyeUtpbmQuUGlwZSwgW2NyZWF0ZVBpcGVdKTtcbiAgICB0aGlzLmFubm90YXRpb25Gb3JQYXJlbnRDbGFzc1dpdGhTdW1tYXJ5S2luZC5zZXQoQ29tcGlsZVN1bW1hcnlLaW5kLk5nTW9kdWxlLCBbY3JlYXRlTmdNb2R1bGVdKTtcbiAgICB0aGlzLmFubm90YXRpb25Gb3JQYXJlbnRDbGFzc1dpdGhTdW1tYXJ5S2luZC5zZXQoXG4gICAgICAgIENvbXBpbGVTdW1tYXJ5S2luZC5JbmplY3RhYmxlLFxuICAgICAgICBbY3JlYXRlSW5qZWN0YWJsZSwgY3JlYXRlUGlwZSwgY3JlYXRlRGlyZWN0aXZlLCBjcmVhdGVDb21wb25lbnQsIGNyZWF0ZU5nTW9kdWxlXSk7XG4gIH1cblxuICBjb21wb25lbnRNb2R1bGVVcmwodHlwZU9yRnVuYzogU3RhdGljU3ltYm9sKTogc3RyaW5nIHtcbiAgICBjb25zdCBzdGF0aWNTeW1ib2wgPSB0aGlzLmZpbmRTeW1ib2xEZWNsYXJhdGlvbih0eXBlT3JGdW5jKTtcbiAgICByZXR1cm4gdGhpcy5zeW1ib2xSZXNvbHZlci5nZXRSZXNvdXJjZVBhdGgoc3RhdGljU3ltYm9sKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbnZhbGlkYXRlIHRoZSBzcGVjaWZpZWQgYHN5bWJvbHNgIG9uIHByb2dyYW0gY2hhbmdlLlxuICAgKiBAcGFyYW0gc3ltYm9sc1xuICAgKi9cbiAgaW52YWxpZGF0ZVN5bWJvbHMoc3ltYm9sczogU3RhdGljU3ltYm9sW10pIHtcbiAgICBmb3IgKGNvbnN0IHN5bWJvbCBvZiBzeW1ib2xzKSB7XG4gICAgICB0aGlzLmFubm90YXRpb25DYWNoZS5kZWxldGUoc3ltYm9sKTtcbiAgICAgIHRoaXMuc2hhbGxvd0Fubm90YXRpb25DYWNoZS5kZWxldGUoc3ltYm9sKTtcbiAgICAgIHRoaXMucHJvcGVydHlDYWNoZS5kZWxldGUoc3ltYm9sKTtcbiAgICAgIHRoaXMucGFyYW1ldGVyQ2FjaGUuZGVsZXRlKHN5bWJvbCk7XG4gICAgICB0aGlzLm1ldGhvZENhY2hlLmRlbGV0ZShzeW1ib2wpO1xuICAgICAgdGhpcy5zdGF0aWNDYWNoZS5kZWxldGUoc3ltYm9sKTtcbiAgICAgIHRoaXMuY29udmVyc2lvbk1hcC5kZWxldGUoc3ltYm9sKTtcbiAgICB9XG4gIH1cblxuICByZXNvbHZlRXh0ZXJuYWxSZWZlcmVuY2UocmVmOiBvLkV4dGVybmFsUmVmZXJlbmNlLCBjb250YWluaW5nRmlsZT86IHN0cmluZyk6IFN0YXRpY1N5bWJvbCB7XG4gICAgbGV0IGtleTogc3RyaW5nfHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBpZiAoIWNvbnRhaW5pbmdGaWxlKSB7XG4gICAgICBrZXkgPSBgJHtyZWYubW9kdWxlTmFtZX06JHtyZWYubmFtZX1gO1xuICAgICAgY29uc3QgZGVjbGFyYXRpb25TeW1ib2wgPSB0aGlzLnJlc29sdmVkRXh0ZXJuYWxSZWZlcmVuY2VzLmdldChrZXkpO1xuICAgICAgaWYgKGRlY2xhcmF0aW9uU3ltYm9sKSByZXR1cm4gZGVjbGFyYXRpb25TeW1ib2w7XG4gICAgfVxuICAgIGNvbnN0IHJlZlN5bWJvbCA9XG4gICAgICAgIHRoaXMuc3ltYm9sUmVzb2x2ZXIuZ2V0U3ltYm9sQnlNb2R1bGUocmVmLm1vZHVsZU5hbWUhLCByZWYubmFtZSEsIGNvbnRhaW5pbmdGaWxlKTtcbiAgICBjb25zdCBkZWNsYXJhdGlvblN5bWJvbCA9IHRoaXMuZmluZFN5bWJvbERlY2xhcmF0aW9uKHJlZlN5bWJvbCk7XG4gICAgaWYgKCFjb250YWluaW5nRmlsZSkge1xuICAgICAgdGhpcy5zeW1ib2xSZXNvbHZlci5yZWNvcmRNb2R1bGVOYW1lRm9yRmlsZU5hbWUocmVmU3ltYm9sLmZpbGVQYXRoLCByZWYubW9kdWxlTmFtZSEpO1xuICAgICAgdGhpcy5zeW1ib2xSZXNvbHZlci5yZWNvcmRJbXBvcnRBcyhkZWNsYXJhdGlvblN5bWJvbCwgcmVmU3ltYm9sKTtcbiAgICB9XG4gICAgaWYgKGtleSkge1xuICAgICAgdGhpcy5yZXNvbHZlZEV4dGVybmFsUmVmZXJlbmNlcy5zZXQoa2V5LCBkZWNsYXJhdGlvblN5bWJvbCk7XG4gICAgfVxuICAgIHJldHVybiBkZWNsYXJhdGlvblN5bWJvbDtcbiAgfVxuXG4gIGZpbmREZWNsYXJhdGlvbihtb2R1bGVVcmw6IHN0cmluZywgbmFtZTogc3RyaW5nLCBjb250YWluaW5nRmlsZT86IHN0cmluZyk6IFN0YXRpY1N5bWJvbCB7XG4gICAgcmV0dXJuIHRoaXMuZmluZFN5bWJvbERlY2xhcmF0aW9uKFxuICAgICAgICB0aGlzLnN5bWJvbFJlc29sdmVyLmdldFN5bWJvbEJ5TW9kdWxlKG1vZHVsZVVybCwgbmFtZSwgY29udGFpbmluZ0ZpbGUpKTtcbiAgfVxuXG4gIHRyeUZpbmREZWNsYXJhdGlvbihtb2R1bGVVcmw6IHN0cmluZywgbmFtZTogc3RyaW5nLCBjb250YWluaW5nRmlsZT86IHN0cmluZyk6IFN0YXRpY1N5bWJvbCB7XG4gICAgcmV0dXJuIHRoaXMuc3ltYm9sUmVzb2x2ZXIuaWdub3JlRXJyb3JzRm9yKFxuICAgICAgICAoKSA9PiB0aGlzLmZpbmREZWNsYXJhdGlvbihtb2R1bGVVcmwsIG5hbWUsIGNvbnRhaW5pbmdGaWxlKSk7XG4gIH1cblxuICBmaW5kU3ltYm9sRGVjbGFyYXRpb24oc3ltYm9sOiBTdGF0aWNTeW1ib2wpOiBTdGF0aWNTeW1ib2wge1xuICAgIGNvbnN0IHJlc29sdmVkU3ltYm9sID0gdGhpcy5zeW1ib2xSZXNvbHZlci5yZXNvbHZlU3ltYm9sKHN5bWJvbCk7XG4gICAgaWYgKHJlc29sdmVkU3ltYm9sKSB7XG4gICAgICBsZXQgcmVzb2x2ZWRNZXRhZGF0YSA9IHJlc29sdmVkU3ltYm9sLm1ldGFkYXRhO1xuICAgICAgaWYgKHJlc29sdmVkTWV0YWRhdGEgJiYgcmVzb2x2ZWRNZXRhZGF0YS5fX3N5bWJvbGljID09PSAncmVzb2x2ZWQnKSB7XG4gICAgICAgIHJlc29sdmVkTWV0YWRhdGEgPSByZXNvbHZlZE1ldGFkYXRhLnN5bWJvbDtcbiAgICAgIH1cbiAgICAgIGlmIChyZXNvbHZlZE1ldGFkYXRhIGluc3RhbmNlb2YgU3RhdGljU3ltYm9sKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZpbmRTeW1ib2xEZWNsYXJhdGlvbihyZXNvbHZlZFN5bWJvbC5tZXRhZGF0YSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzeW1ib2w7XG4gIH1cblxuICBwdWJsaWMgdHJ5QW5ub3RhdGlvbnModHlwZTogU3RhdGljU3ltYm9sKTogYW55W10ge1xuICAgIGNvbnN0IG9yaWdpbmFsUmVjb3JkZXIgPSB0aGlzLmVycm9yUmVjb3JkZXI7XG4gICAgdGhpcy5lcnJvclJlY29yZGVyID0gKGVycm9yOiBhbnksIGZpbGVOYW1lPzogc3RyaW5nKSA9PiB7fTtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIHRoaXMuYW5ub3RhdGlvbnModHlwZSk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMuZXJyb3JSZWNvcmRlciA9IG9yaWdpbmFsUmVjb3JkZXI7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGFubm90YXRpb25zKHR5cGU6IFN0YXRpY1N5bWJvbCk6IGFueVtdIHtcbiAgICByZXR1cm4gdGhpcy5fYW5ub3RhdGlvbnMoXG4gICAgICAgIHR5cGUsICh0eXBlOiBTdGF0aWNTeW1ib2wsIGRlY29yYXRvcnM6IGFueSkgPT4gdGhpcy5zaW1wbGlmeSh0eXBlLCBkZWNvcmF0b3JzKSxcbiAgICAgICAgdGhpcy5hbm5vdGF0aW9uQ2FjaGUpO1xuICB9XG5cbiAgcHVibGljIHNoYWxsb3dBbm5vdGF0aW9ucyh0eXBlOiBTdGF0aWNTeW1ib2wpOiBhbnlbXSB7XG4gICAgcmV0dXJuIHRoaXMuX2Fubm90YXRpb25zKFxuICAgICAgICB0eXBlLCAodHlwZTogU3RhdGljU3ltYm9sLCBkZWNvcmF0b3JzOiBhbnkpID0+IHRoaXMuc2ltcGxpZnkodHlwZSwgZGVjb3JhdG9ycywgdHJ1ZSksXG4gICAgICAgIHRoaXMuc2hhbGxvd0Fubm90YXRpb25DYWNoZSk7XG4gIH1cblxuICBwcml2YXRlIF9hbm5vdGF0aW9ucyhcbiAgICAgIHR5cGU6IFN0YXRpY1N5bWJvbCwgc2ltcGxpZnk6ICh0eXBlOiBTdGF0aWNTeW1ib2wsIGRlY29yYXRvcnM6IGFueSkgPT4gYW55LFxuICAgICAgYW5ub3RhdGlvbkNhY2hlOiBNYXA8U3RhdGljU3ltYm9sLCBhbnlbXT4pOiBhbnlbXSB7XG4gICAgbGV0IGFubm90YXRpb25zID0gYW5ub3RhdGlvbkNhY2hlLmdldCh0eXBlKTtcbiAgICBpZiAoIWFubm90YXRpb25zKSB7XG4gICAgICBhbm5vdGF0aW9ucyA9IFtdO1xuICAgICAgY29uc3QgY2xhc3NNZXRhZGF0YSA9IHRoaXMuZ2V0VHlwZU1ldGFkYXRhKHR5cGUpO1xuICAgICAgY29uc3QgcGFyZW50VHlwZSA9IHRoaXMuZmluZFBhcmVudFR5cGUodHlwZSwgY2xhc3NNZXRhZGF0YSk7XG4gICAgICBpZiAocGFyZW50VHlwZSkge1xuICAgICAgICBjb25zdCBwYXJlbnRBbm5vdGF0aW9ucyA9IHRoaXMuYW5ub3RhdGlvbnMocGFyZW50VHlwZSk7XG4gICAgICAgIGFubm90YXRpb25zLnB1c2goLi4ucGFyZW50QW5ub3RhdGlvbnMpO1xuICAgICAgfVxuICAgICAgbGV0IG93bkFubm90YXRpb25zOiBhbnlbXSA9IFtdO1xuICAgICAgaWYgKGNsYXNzTWV0YWRhdGFbJ2RlY29yYXRvcnMnXSkge1xuICAgICAgICBvd25Bbm5vdGF0aW9ucyA9IHNpbXBsaWZ5KHR5cGUsIGNsYXNzTWV0YWRhdGFbJ2RlY29yYXRvcnMnXSk7XG4gICAgICAgIGlmIChvd25Bbm5vdGF0aW9ucykge1xuICAgICAgICAgIGFubm90YXRpb25zLnB1c2goLi4ub3duQW5ub3RhdGlvbnMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAocGFyZW50VHlwZSAmJiAhdGhpcy5zdW1tYXJ5UmVzb2x2ZXIuaXNMaWJyYXJ5RmlsZSh0eXBlLmZpbGVQYXRoKSAmJlxuICAgICAgICAgIHRoaXMuc3VtbWFyeVJlc29sdmVyLmlzTGlicmFyeUZpbGUocGFyZW50VHlwZS5maWxlUGF0aCkpIHtcbiAgICAgICAgY29uc3Qgc3VtbWFyeSA9IHRoaXMuc3VtbWFyeVJlc29sdmVyLnJlc29sdmVTdW1tYXJ5KHBhcmVudFR5cGUpO1xuICAgICAgICBpZiAoc3VtbWFyeSAmJiBzdW1tYXJ5LnR5cGUpIHtcbiAgICAgICAgICBjb25zdCByZXF1aXJlZEFubm90YXRpb25UeXBlcyA9XG4gICAgICAgICAgICAgIHRoaXMuYW5ub3RhdGlvbkZvclBhcmVudENsYXNzV2l0aFN1bW1hcnlLaW5kLmdldChzdW1tYXJ5LnR5cGUuc3VtbWFyeUtpbmQhKSE7XG4gICAgICAgICAgY29uc3QgdHlwZUhhc1JlcXVpcmVkQW5ub3RhdGlvbiA9IHJlcXVpcmVkQW5ub3RhdGlvblR5cGVzLnNvbWUoXG4gICAgICAgICAgICAgIChyZXF1aXJlZFR5cGUpID0+IG93bkFubm90YXRpb25zLnNvbWUoYW5uID0+IHJlcXVpcmVkVHlwZS5pc1R5cGVPZihhbm4pKSk7XG4gICAgICAgICAgaWYgKCF0eXBlSGFzUmVxdWlyZWRBbm5vdGF0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLnJlcG9ydEVycm9yKFxuICAgICAgICAgICAgICAgIGZvcm1hdE1ldGFkYXRhRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgIG1ldGFkYXRhRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgICBgQ2xhc3MgJHt0eXBlLm5hbWV9IGluICR7dHlwZS5maWxlUGF0aH0gZXh0ZW5kcyBmcm9tIGEgJHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBDb21waWxlU3VtbWFyeUtpbmRbc3VtbWFyeS50eXBlLnN1bW1hcnlLaW5kIVxuICAgICAgICAgICAgXX0gaW4gYW5vdGhlciBjb21waWxhdGlvbiB1bml0IHdpdGhvdXQgZHVwbGljYXRpbmcgdGhlIGRlY29yYXRvcmAsXG4gICAgICAgICAgICAgICAgICAgICAgICAvKiBzdW1tYXJ5ICovIHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGBQbGVhc2UgYWRkIGEgJHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXF1aXJlZEFubm90YXRpb25UeXBlcy5tYXAoKHR5cGUpID0+IHR5cGUubmdNZXRhZGF0YU5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5qb2luKCcgb3IgJyl9IGRlY29yYXRvciB0byB0aGUgY2xhc3NgKSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZSksXG4gICAgICAgICAgICAgICAgdHlwZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBhbm5vdGF0aW9uQ2FjaGUuc2V0KHR5cGUsIGFubm90YXRpb25zLmZpbHRlcihhbm4gPT4gISFhbm4pKTtcbiAgICB9XG4gICAgcmV0dXJuIGFubm90YXRpb25zO1xuICB9XG5cbiAgcHVibGljIHByb3BNZXRhZGF0YSh0eXBlOiBTdGF0aWNTeW1ib2wpOiB7W2tleTogc3RyaW5nXTogYW55W119IHtcbiAgICBsZXQgcHJvcE1ldGFkYXRhID0gdGhpcy5wcm9wZXJ0eUNhY2hlLmdldCh0eXBlKTtcbiAgICBpZiAoIXByb3BNZXRhZGF0YSkge1xuICAgICAgY29uc3QgY2xhc3NNZXRhZGF0YSA9IHRoaXMuZ2V0VHlwZU1ldGFkYXRhKHR5cGUpO1xuICAgICAgcHJvcE1ldGFkYXRhID0ge307XG4gICAgICBjb25zdCBwYXJlbnRUeXBlID0gdGhpcy5maW5kUGFyZW50VHlwZSh0eXBlLCBjbGFzc01ldGFkYXRhKTtcbiAgICAgIGlmIChwYXJlbnRUeXBlKSB7XG4gICAgICAgIGNvbnN0IHBhcmVudFByb3BNZXRhZGF0YSA9IHRoaXMucHJvcE1ldGFkYXRhKHBhcmVudFR5cGUpO1xuICAgICAgICBPYmplY3Qua2V5cyhwYXJlbnRQcm9wTWV0YWRhdGEpLmZvckVhY2goKHBhcmVudFByb3ApID0+IHtcbiAgICAgICAgICBwcm9wTWV0YWRhdGEhW3BhcmVudFByb3BdID0gcGFyZW50UHJvcE1ldGFkYXRhW3BhcmVudFByb3BdO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgbWVtYmVycyA9IGNsYXNzTWV0YWRhdGFbJ21lbWJlcnMnXSB8fCB7fTtcbiAgICAgIE9iamVjdC5rZXlzKG1lbWJlcnMpLmZvckVhY2goKHByb3BOYW1lKSA9PiB7XG4gICAgICAgIGNvbnN0IHByb3BEYXRhID0gbWVtYmVyc1twcm9wTmFtZV07XG4gICAgICAgIGNvbnN0IHByb3AgPSAoPGFueVtdPnByb3BEYXRhKVxuICAgICAgICAgICAgICAgICAgICAgICAgIC5maW5kKGEgPT4gYVsnX19zeW1ib2xpYyddID09ICdwcm9wZXJ0eScgfHwgYVsnX19zeW1ib2xpYyddID09ICdtZXRob2QnKTtcbiAgICAgICAgY29uc3QgZGVjb3JhdG9yczogYW55W10gPSBbXTtcbiAgICAgICAgLy8gaGFzT3duUHJvcGVydHkoKSBpcyB1c2VkIGhlcmUgdG8gbWFrZSBzdXJlIHdlIGRvIG5vdCBsb29rIHVwIG1ldGhvZHNcbiAgICAgICAgLy8gb24gYE9iamVjdC5wcm90b3R5cGVgLlxuICAgICAgICBpZiAocHJvcE1ldGFkYXRhPy5oYXNPd25Qcm9wZXJ0eShwcm9wTmFtZSkpIHtcbiAgICAgICAgICBkZWNvcmF0b3JzLnB1c2goLi4ucHJvcE1ldGFkYXRhIVtwcm9wTmFtZV0pO1xuICAgICAgICB9XG4gICAgICAgIHByb3BNZXRhZGF0YSFbcHJvcE5hbWVdID0gZGVjb3JhdG9ycztcbiAgICAgICAgaWYgKHByb3AgJiYgcHJvcFsnZGVjb3JhdG9ycyddKSB7XG4gICAgICAgICAgZGVjb3JhdG9ycy5wdXNoKC4uLnRoaXMuc2ltcGxpZnkodHlwZSwgcHJvcFsnZGVjb3JhdG9ycyddKSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgdGhpcy5wcm9wZXJ0eUNhY2hlLnNldCh0eXBlLCBwcm9wTWV0YWRhdGEpO1xuICAgIH1cbiAgICByZXR1cm4gcHJvcE1ldGFkYXRhO1xuICB9XG5cbiAgcHVibGljIHBhcmFtZXRlcnModHlwZTogU3RhdGljU3ltYm9sKTogYW55W10ge1xuICAgIGlmICghKHR5cGUgaW5zdGFuY2VvZiBTdGF0aWNTeW1ib2wpKSB7XG4gICAgICB0aGlzLnJlcG9ydEVycm9yKFxuICAgICAgICAgIG5ldyBFcnJvcihgcGFyYW1ldGVycyByZWNlaXZlZCAke0pTT04uc3RyaW5naWZ5KHR5cGUpfSB3aGljaCBpcyBub3QgYSBTdGF0aWNTeW1ib2xgKSxcbiAgICAgICAgICB0eXBlKTtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgIGxldCBwYXJhbWV0ZXJzID0gdGhpcy5wYXJhbWV0ZXJDYWNoZS5nZXQodHlwZSk7XG4gICAgICBpZiAoIXBhcmFtZXRlcnMpIHtcbiAgICAgICAgY29uc3QgY2xhc3NNZXRhZGF0YSA9IHRoaXMuZ2V0VHlwZU1ldGFkYXRhKHR5cGUpO1xuICAgICAgICBjb25zdCBwYXJlbnRUeXBlID0gdGhpcy5maW5kUGFyZW50VHlwZSh0eXBlLCBjbGFzc01ldGFkYXRhKTtcbiAgICAgICAgY29uc3QgbWVtYmVycyA9IGNsYXNzTWV0YWRhdGEgPyBjbGFzc01ldGFkYXRhWydtZW1iZXJzJ10gOiBudWxsO1xuICAgICAgICBjb25zdCBjdG9yRGF0YSA9IG1lbWJlcnMgPyBtZW1iZXJzWydfX2N0b3JfXyddIDogbnVsbDtcbiAgICAgICAgaWYgKGN0b3JEYXRhKSB7XG4gICAgICAgICAgY29uc3QgY3RvciA9ICg8YW55W10+Y3RvckRhdGEpLmZpbmQoYSA9PiBhWydfX3N5bWJvbGljJ10gPT0gJ2NvbnN0cnVjdG9yJyk7XG4gICAgICAgICAgY29uc3QgcmF3UGFyYW1ldGVyVHlwZXMgPSA8YW55W10+Y3RvclsncGFyYW1ldGVycyddIHx8IFtdO1xuICAgICAgICAgIGNvbnN0IHBhcmFtZXRlckRlY29yYXRvcnMgPSA8YW55W10+dGhpcy5zaW1wbGlmeSh0eXBlLCBjdG9yWydwYXJhbWV0ZXJEZWNvcmF0b3JzJ10gfHwgW10pO1xuICAgICAgICAgIHBhcmFtZXRlcnMgPSBbXTtcbiAgICAgICAgICByYXdQYXJhbWV0ZXJUeXBlcy5mb3JFYWNoKChyYXdQYXJhbVR5cGUsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuZXN0ZWRSZXN1bHQ6IGFueVtdID0gW107XG4gICAgICAgICAgICBjb25zdCBwYXJhbVR5cGUgPSB0aGlzLnRyeVNpbXBsaWZ5KHR5cGUsIHJhd1BhcmFtVHlwZSk7XG4gICAgICAgICAgICBpZiAocGFyYW1UeXBlKSBuZXN0ZWRSZXN1bHQucHVzaChwYXJhbVR5cGUpO1xuICAgICAgICAgICAgY29uc3QgZGVjb3JhdG9ycyA9IHBhcmFtZXRlckRlY29yYXRvcnMgPyBwYXJhbWV0ZXJEZWNvcmF0b3JzW2luZGV4XSA6IG51bGw7XG4gICAgICAgICAgICBpZiAoZGVjb3JhdG9ycykge1xuICAgICAgICAgICAgICBuZXN0ZWRSZXN1bHQucHVzaCguLi5kZWNvcmF0b3JzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBhcmFtZXRlcnMhLnB1c2gobmVzdGVkUmVzdWx0KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChwYXJlbnRUeXBlKSB7XG4gICAgICAgICAgcGFyYW1ldGVycyA9IHRoaXMucGFyYW1ldGVycyhwYXJlbnRUeXBlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXBhcmFtZXRlcnMpIHtcbiAgICAgICAgICBwYXJhbWV0ZXJzID0gW107XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wYXJhbWV0ZXJDYWNoZS5zZXQodHlwZSwgcGFyYW1ldGVycyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcGFyYW1ldGVycztcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGBGYWlsZWQgb24gdHlwZSAke0pTT04uc3RyaW5naWZ5KHR5cGUpfSB3aXRoIGVycm9yICR7ZX1gKTtcbiAgICAgIHRocm93IGU7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfbWV0aG9kTmFtZXModHlwZTogYW55KToge1trZXk6IHN0cmluZ106IGJvb2xlYW59IHtcbiAgICBsZXQgbWV0aG9kTmFtZXMgPSB0aGlzLm1ldGhvZENhY2hlLmdldCh0eXBlKTtcbiAgICBpZiAoIW1ldGhvZE5hbWVzKSB7XG4gICAgICBjb25zdCBjbGFzc01ldGFkYXRhID0gdGhpcy5nZXRUeXBlTWV0YWRhdGEodHlwZSk7XG4gICAgICBtZXRob2ROYW1lcyA9IHt9O1xuICAgICAgY29uc3QgcGFyZW50VHlwZSA9IHRoaXMuZmluZFBhcmVudFR5cGUodHlwZSwgY2xhc3NNZXRhZGF0YSk7XG4gICAgICBpZiAocGFyZW50VHlwZSkge1xuICAgICAgICBjb25zdCBwYXJlbnRNZXRob2ROYW1lcyA9IHRoaXMuX21ldGhvZE5hbWVzKHBhcmVudFR5cGUpO1xuICAgICAgICBPYmplY3Qua2V5cyhwYXJlbnRNZXRob2ROYW1lcykuZm9yRWFjaCgocGFyZW50UHJvcCkgPT4ge1xuICAgICAgICAgIG1ldGhvZE5hbWVzIVtwYXJlbnRQcm9wXSA9IHBhcmVudE1ldGhvZE5hbWVzW3BhcmVudFByb3BdO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgbWVtYmVycyA9IGNsYXNzTWV0YWRhdGFbJ21lbWJlcnMnXSB8fCB7fTtcbiAgICAgIE9iamVjdC5rZXlzKG1lbWJlcnMpLmZvckVhY2goKHByb3BOYW1lKSA9PiB7XG4gICAgICAgIGNvbnN0IHByb3BEYXRhID0gbWVtYmVyc1twcm9wTmFtZV07XG4gICAgICAgIGNvbnN0IGlzTWV0aG9kID0gKDxhbnlbXT5wcm9wRGF0YSkuc29tZShhID0+IGFbJ19fc3ltYm9saWMnXSA9PSAnbWV0aG9kJyk7XG4gICAgICAgIG1ldGhvZE5hbWVzIVtwcm9wTmFtZV0gPSBtZXRob2ROYW1lcyFbcHJvcE5hbWVdIHx8IGlzTWV0aG9kO1xuICAgICAgfSk7XG4gICAgICB0aGlzLm1ldGhvZENhY2hlLnNldCh0eXBlLCBtZXRob2ROYW1lcyk7XG4gICAgfVxuICAgIHJldHVybiBtZXRob2ROYW1lcztcbiAgfVxuXG4gIHByaXZhdGUgX3N0YXRpY01lbWJlcnModHlwZTogU3RhdGljU3ltYm9sKTogc3RyaW5nW10ge1xuICAgIGxldCBzdGF0aWNNZW1iZXJzID0gdGhpcy5zdGF0aWNDYWNoZS5nZXQodHlwZSk7XG4gICAgaWYgKCFzdGF0aWNNZW1iZXJzKSB7XG4gICAgICBjb25zdCBjbGFzc01ldGFkYXRhID0gdGhpcy5nZXRUeXBlTWV0YWRhdGEodHlwZSk7XG4gICAgICBjb25zdCBzdGF0aWNNZW1iZXJEYXRhID0gY2xhc3NNZXRhZGF0YVsnc3RhdGljcyddIHx8IHt9O1xuICAgICAgc3RhdGljTWVtYmVycyA9IE9iamVjdC5rZXlzKHN0YXRpY01lbWJlckRhdGEpO1xuICAgICAgdGhpcy5zdGF0aWNDYWNoZS5zZXQodHlwZSwgc3RhdGljTWVtYmVycyk7XG4gICAgfVxuICAgIHJldHVybiBzdGF0aWNNZW1iZXJzO1xuICB9XG5cblxuICBwcml2YXRlIGZpbmRQYXJlbnRUeXBlKHR5cGU6IFN0YXRpY1N5bWJvbCwgY2xhc3NNZXRhZGF0YTogYW55KTogU3RhdGljU3ltYm9sfHVuZGVmaW5lZCB7XG4gICAgY29uc3QgcGFyZW50VHlwZSA9IHRoaXMudHJ5U2ltcGxpZnkodHlwZSwgY2xhc3NNZXRhZGF0YVsnZXh0ZW5kcyddKTtcbiAgICBpZiAocGFyZW50VHlwZSBpbnN0YW5jZW9mIFN0YXRpY1N5bWJvbCkge1xuICAgICAgcmV0dXJuIHBhcmVudFR5cGU7XG4gICAgfVxuICB9XG5cbiAgaGFzTGlmZWN5Y2xlSG9vayh0eXBlOiBhbnksIGxjUHJvcGVydHk6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGlmICghKHR5cGUgaW5zdGFuY2VvZiBTdGF0aWNTeW1ib2wpKSB7XG4gICAgICB0aGlzLnJlcG9ydEVycm9yKFxuICAgICAgICAgIG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgYGhhc0xpZmVjeWNsZUhvb2sgcmVjZWl2ZWQgJHtKU09OLnN0cmluZ2lmeSh0eXBlKX0gd2hpY2ggaXMgbm90IGEgU3RhdGljU3ltYm9sYCksXG4gICAgICAgICAgdHlwZSk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICByZXR1cm4gISF0aGlzLl9tZXRob2ROYW1lcyh0eXBlKVtsY1Byb3BlcnR5XTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGBGYWlsZWQgb24gdHlwZSAke0pTT04uc3RyaW5naWZ5KHR5cGUpfSB3aXRoIGVycm9yICR7ZX1gKTtcbiAgICAgIHRocm93IGU7XG4gICAgfVxuICB9XG5cbiAgZ3VhcmRzKHR5cGU6IGFueSk6IHtba2V5OiBzdHJpbmddOiBTdGF0aWNTeW1ib2x9IHtcbiAgICBpZiAoISh0eXBlIGluc3RhbmNlb2YgU3RhdGljU3ltYm9sKSkge1xuICAgICAgdGhpcy5yZXBvcnRFcnJvcihcbiAgICAgICAgICBuZXcgRXJyb3IoYGd1YXJkcyByZWNlaXZlZCAke0pTT04uc3RyaW5naWZ5KHR5cGUpfSB3aGljaCBpcyBub3QgYSBTdGF0aWNTeW1ib2xgKSwgdHlwZSk7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuICAgIGNvbnN0IHN0YXRpY01lbWJlcnMgPSB0aGlzLl9zdGF0aWNNZW1iZXJzKHR5cGUpO1xuICAgIGNvbnN0IHJlc3VsdDoge1trZXk6IHN0cmluZ106IFN0YXRpY1N5bWJvbH0gPSB7fTtcbiAgICBmb3IgKGxldCBuYW1lIG9mIHN0YXRpY01lbWJlcnMpIHtcbiAgICAgIGlmIChuYW1lLmVuZHNXaXRoKFRZUEVHVUFSRF9QT1NURklYKSkge1xuICAgICAgICBsZXQgcHJvcGVydHkgPSBuYW1lLnN1YnN0cigwLCBuYW1lLmxlbmd0aCAtIFRZUEVHVUFSRF9QT1NURklYLmxlbmd0aCk7XG4gICAgICAgIGxldCB2YWx1ZTogYW55O1xuICAgICAgICBpZiAocHJvcGVydHkuZW5kc1dpdGgoVVNFX0lGKSkge1xuICAgICAgICAgIHByb3BlcnR5ID0gbmFtZS5zdWJzdHIoMCwgcHJvcGVydHkubGVuZ3RoIC0gVVNFX0lGLmxlbmd0aCk7XG4gICAgICAgICAgdmFsdWUgPSBVU0VfSUY7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFsdWUgPSB0aGlzLmdldFN0YXRpY1N5bWJvbCh0eXBlLmZpbGVQYXRoLCB0eXBlLm5hbWUsIFtuYW1lXSk7XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0W3Byb3BlcnR5XSA9IHZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgcHJpdmF0ZSBfcmVnaXN0ZXJEZWNvcmF0b3JPckNvbnN0cnVjdG9yKHR5cGU6IFN0YXRpY1N5bWJvbCwgY3RvcjogYW55KTogdm9pZCB7XG4gICAgdGhpcy5jb252ZXJzaW9uTWFwLnNldCh0eXBlLCAoY29udGV4dDogU3RhdGljU3ltYm9sLCBhcmdzOiBhbnlbXSkgPT4gbmV3IGN0b3IoLi4uYXJncykpO1xuICB9XG5cbiAgcHJpdmF0ZSBfcmVnaXN0ZXJGdW5jdGlvbih0eXBlOiBTdGF0aWNTeW1ib2wsIGZuOiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLmNvbnZlcnNpb25NYXAuc2V0KHR5cGUsIChjb250ZXh0OiBTdGF0aWNTeW1ib2wsIGFyZ3M6IGFueVtdKSA9PiBmbi5hcHBseSh1bmRlZmluZWQsIGFyZ3MpKTtcbiAgfVxuXG4gIHByaXZhdGUgaW5pdGlhbGl6ZUNvbnZlcnNpb25NYXAoKTogdm9pZCB7XG4gICAgdGhpcy5fcmVnaXN0ZXJEZWNvcmF0b3JPckNvbnN0cnVjdG9yKFxuICAgICAgICB0aGlzLmZpbmREZWNsYXJhdGlvbihBTkdVTEFSX0NPUkUsICdJbmplY3RhYmxlJyksIGNyZWF0ZUluamVjdGFibGUpO1xuICAgIHRoaXMuaW5qZWN0aW9uVG9rZW4gPSB0aGlzLmZpbmREZWNsYXJhdGlvbihBTkdVTEFSX0NPUkUsICdJbmplY3Rpb25Ub2tlbicpO1xuICAgIHRoaXMub3BhcXVlVG9rZW4gPSB0aGlzLmZpbmREZWNsYXJhdGlvbihBTkdVTEFSX0NPUkUsICdPcGFxdWVUb2tlbicpO1xuICAgIHRoaXMuUk9VVEVTID0gdGhpcy50cnlGaW5kRGVjbGFyYXRpb24oQU5HVUxBUl9ST1VURVIsICdST1VURVMnKTtcbiAgICB0aGlzLkFOQUxZWkVfRk9SX0VOVFJZX0NPTVBPTkVOVFMgPVxuICAgICAgICB0aGlzLmZpbmREZWNsYXJhdGlvbihBTkdVTEFSX0NPUkUsICdBTkFMWVpFX0ZPUl9FTlRSWV9DT01QT05FTlRTJyk7XG5cbiAgICB0aGlzLl9yZWdpc3RlckRlY29yYXRvck9yQ29uc3RydWN0b3IodGhpcy5maW5kRGVjbGFyYXRpb24oQU5HVUxBUl9DT1JFLCAnSG9zdCcpLCBjcmVhdGVIb3N0KTtcbiAgICB0aGlzLl9yZWdpc3RlckRlY29yYXRvck9yQ29uc3RydWN0b3IodGhpcy5maW5kRGVjbGFyYXRpb24oQU5HVUxBUl9DT1JFLCAnU2VsZicpLCBjcmVhdGVTZWxmKTtcbiAgICB0aGlzLl9yZWdpc3RlckRlY29yYXRvck9yQ29uc3RydWN0b3IoXG4gICAgICAgIHRoaXMuZmluZERlY2xhcmF0aW9uKEFOR1VMQVJfQ09SRSwgJ1NraXBTZWxmJyksIGNyZWF0ZVNraXBTZWxmKTtcbiAgICB0aGlzLl9yZWdpc3RlckRlY29yYXRvck9yQ29uc3RydWN0b3IoXG4gICAgICAgIHRoaXMuZmluZERlY2xhcmF0aW9uKEFOR1VMQVJfQ09SRSwgJ0luamVjdCcpLCBjcmVhdGVJbmplY3QpO1xuICAgIHRoaXMuX3JlZ2lzdGVyRGVjb3JhdG9yT3JDb25zdHJ1Y3RvcihcbiAgICAgICAgdGhpcy5maW5kRGVjbGFyYXRpb24oQU5HVUxBUl9DT1JFLCAnT3B0aW9uYWwnKSwgY3JlYXRlT3B0aW9uYWwpO1xuICAgIHRoaXMuX3JlZ2lzdGVyRGVjb3JhdG9yT3JDb25zdHJ1Y3RvcihcbiAgICAgICAgdGhpcy5maW5kRGVjbGFyYXRpb24oQU5HVUxBUl9DT1JFLCAnQXR0cmlidXRlJyksIGNyZWF0ZUF0dHJpYnV0ZSk7XG4gICAgdGhpcy5fcmVnaXN0ZXJEZWNvcmF0b3JPckNvbnN0cnVjdG9yKFxuICAgICAgICB0aGlzLmZpbmREZWNsYXJhdGlvbihBTkdVTEFSX0NPUkUsICdDb250ZW50Q2hpbGQnKSwgY3JlYXRlQ29udGVudENoaWxkKTtcbiAgICB0aGlzLl9yZWdpc3RlckRlY29yYXRvck9yQ29uc3RydWN0b3IoXG4gICAgICAgIHRoaXMuZmluZERlY2xhcmF0aW9uKEFOR1VMQVJfQ09SRSwgJ0NvbnRlbnRDaGlsZHJlbicpLCBjcmVhdGVDb250ZW50Q2hpbGRyZW4pO1xuICAgIHRoaXMuX3JlZ2lzdGVyRGVjb3JhdG9yT3JDb25zdHJ1Y3RvcihcbiAgICAgICAgdGhpcy5maW5kRGVjbGFyYXRpb24oQU5HVUxBUl9DT1JFLCAnVmlld0NoaWxkJyksIGNyZWF0ZVZpZXdDaGlsZCk7XG4gICAgdGhpcy5fcmVnaXN0ZXJEZWNvcmF0b3JPckNvbnN0cnVjdG9yKFxuICAgICAgICB0aGlzLmZpbmREZWNsYXJhdGlvbihBTkdVTEFSX0NPUkUsICdWaWV3Q2hpbGRyZW4nKSwgY3JlYXRlVmlld0NoaWxkcmVuKTtcbiAgICB0aGlzLl9yZWdpc3RlckRlY29yYXRvck9yQ29uc3RydWN0b3IodGhpcy5maW5kRGVjbGFyYXRpb24oQU5HVUxBUl9DT1JFLCAnSW5wdXQnKSwgY3JlYXRlSW5wdXQpO1xuICAgIHRoaXMuX3JlZ2lzdGVyRGVjb3JhdG9yT3JDb25zdHJ1Y3RvcihcbiAgICAgICAgdGhpcy5maW5kRGVjbGFyYXRpb24oQU5HVUxBUl9DT1JFLCAnT3V0cHV0JyksIGNyZWF0ZU91dHB1dCk7XG4gICAgdGhpcy5fcmVnaXN0ZXJEZWNvcmF0b3JPckNvbnN0cnVjdG9yKHRoaXMuZmluZERlY2xhcmF0aW9uKEFOR1VMQVJfQ09SRSwgJ1BpcGUnKSwgY3JlYXRlUGlwZSk7XG4gICAgdGhpcy5fcmVnaXN0ZXJEZWNvcmF0b3JPckNvbnN0cnVjdG9yKFxuICAgICAgICB0aGlzLmZpbmREZWNsYXJhdGlvbihBTkdVTEFSX0NPUkUsICdIb3N0QmluZGluZycpLCBjcmVhdGVIb3N0QmluZGluZyk7XG4gICAgdGhpcy5fcmVnaXN0ZXJEZWNvcmF0b3JPckNvbnN0cnVjdG9yKFxuICAgICAgICB0aGlzLmZpbmREZWNsYXJhdGlvbihBTkdVTEFSX0NPUkUsICdIb3N0TGlzdGVuZXInKSwgY3JlYXRlSG9zdExpc3RlbmVyKTtcbiAgICB0aGlzLl9yZWdpc3RlckRlY29yYXRvck9yQ29uc3RydWN0b3IoXG4gICAgICAgIHRoaXMuZmluZERlY2xhcmF0aW9uKEFOR1VMQVJfQ09SRSwgJ0RpcmVjdGl2ZScpLCBjcmVhdGVEaXJlY3RpdmUpO1xuICAgIHRoaXMuX3JlZ2lzdGVyRGVjb3JhdG9yT3JDb25zdHJ1Y3RvcihcbiAgICAgICAgdGhpcy5maW5kRGVjbGFyYXRpb24oQU5HVUxBUl9DT1JFLCAnQ29tcG9uZW50JyksIGNyZWF0ZUNvbXBvbmVudCk7XG4gICAgdGhpcy5fcmVnaXN0ZXJEZWNvcmF0b3JPckNvbnN0cnVjdG9yKFxuICAgICAgICB0aGlzLmZpbmREZWNsYXJhdGlvbihBTkdVTEFSX0NPUkUsICdOZ01vZHVsZScpLCBjcmVhdGVOZ01vZHVsZSk7XG5cbiAgICAvLyBOb3RlOiBTb21lIG1ldGFkYXRhIGNsYXNzZXMgY2FuIGJlIHVzZWQgZGlyZWN0bHkgd2l0aCBQcm92aWRlci5kZXBzLlxuICAgIHRoaXMuX3JlZ2lzdGVyRGVjb3JhdG9yT3JDb25zdHJ1Y3Rvcih0aGlzLmZpbmREZWNsYXJhdGlvbihBTkdVTEFSX0NPUkUsICdIb3N0JyksIGNyZWF0ZUhvc3QpO1xuICAgIHRoaXMuX3JlZ2lzdGVyRGVjb3JhdG9yT3JDb25zdHJ1Y3Rvcih0aGlzLmZpbmREZWNsYXJhdGlvbihBTkdVTEFSX0NPUkUsICdTZWxmJyksIGNyZWF0ZVNlbGYpO1xuICAgIHRoaXMuX3JlZ2lzdGVyRGVjb3JhdG9yT3JDb25zdHJ1Y3RvcihcbiAgICAgICAgdGhpcy5maW5kRGVjbGFyYXRpb24oQU5HVUxBUl9DT1JFLCAnU2tpcFNlbGYnKSwgY3JlYXRlU2tpcFNlbGYpO1xuICAgIHRoaXMuX3JlZ2lzdGVyRGVjb3JhdG9yT3JDb25zdHJ1Y3RvcihcbiAgICAgICAgdGhpcy5maW5kRGVjbGFyYXRpb24oQU5HVUxBUl9DT1JFLCAnT3B0aW9uYWwnKSwgY3JlYXRlT3B0aW9uYWwpO1xuICB9XG5cbiAgLyoqXG4gICAqIGdldFN0YXRpY1N5bWJvbCBwcm9kdWNlcyBhIFR5cGUgd2hvc2UgbWV0YWRhdGEgaXMga25vd24gYnV0IHdob3NlIGltcGxlbWVudGF0aW9uIGlzIG5vdCBsb2FkZWQuXG4gICAqIEFsbCB0eXBlcyBwYXNzZWQgdG8gdGhlIFN0YXRpY1Jlc29sdmVyIHNob3VsZCBiZSBwc2V1ZG8tdHlwZXMgcmV0dXJuZWQgYnkgdGhpcyBtZXRob2QuXG4gICAqXG4gICAqIEBwYXJhbSBkZWNsYXJhdGlvbkZpbGUgdGhlIGFic29sdXRlIHBhdGggb2YgdGhlIGZpbGUgd2hlcmUgdGhlIHN5bWJvbCBpcyBkZWNsYXJlZFxuICAgKiBAcGFyYW0gbmFtZSB0aGUgbmFtZSBvZiB0aGUgdHlwZS5cbiAgICovXG4gIGdldFN0YXRpY1N5bWJvbChkZWNsYXJhdGlvbkZpbGU6IHN0cmluZywgbmFtZTogc3RyaW5nLCBtZW1iZXJzPzogc3RyaW5nW10pOiBTdGF0aWNTeW1ib2wge1xuICAgIHJldHVybiB0aGlzLnN5bWJvbFJlc29sdmVyLmdldFN0YXRpY1N5bWJvbChkZWNsYXJhdGlvbkZpbGUsIG5hbWUsIG1lbWJlcnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNpbXBsaWZ5IGJ1dCBkaXNjYXJkIGFueSBlcnJvcnNcbiAgICovXG4gIHByaXZhdGUgdHJ5U2ltcGxpZnkoY29udGV4dDogU3RhdGljU3ltYm9sLCB2YWx1ZTogYW55KTogYW55IHtcbiAgICBjb25zdCBvcmlnaW5hbFJlY29yZGVyID0gdGhpcy5lcnJvclJlY29yZGVyO1xuICAgIHRoaXMuZXJyb3JSZWNvcmRlciA9IChlcnJvcjogYW55LCBmaWxlTmFtZT86IHN0cmluZykgPT4ge307XG4gICAgY29uc3QgcmVzdWx0ID0gdGhpcy5zaW1wbGlmeShjb250ZXh0LCB2YWx1ZSk7XG4gICAgdGhpcy5lcnJvclJlY29yZGVyID0gb3JpZ2luYWxSZWNvcmRlcjtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBwdWJsaWMgc2ltcGxpZnkoY29udGV4dDogU3RhdGljU3ltYm9sLCB2YWx1ZTogYW55LCBsYXp5OiBib29sZWFuID0gZmFsc2UpOiBhbnkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIGxldCBzY29wZSA9IEJpbmRpbmdTY29wZS5lbXB0eTtcbiAgICBjb25zdCBjYWxsaW5nID0gbmV3IE1hcDxTdGF0aWNTeW1ib2wsIGJvb2xlYW4+KCk7XG4gICAgY29uc3Qgcm9vdENvbnRleHQgPSBjb250ZXh0O1xuXG4gICAgZnVuY3Rpb24gc2ltcGxpZnlJbkNvbnRleHQoXG4gICAgICAgIGNvbnRleHQ6IFN0YXRpY1N5bWJvbCwgdmFsdWU6IGFueSwgZGVwdGg6IG51bWJlciwgcmVmZXJlbmNlczogbnVtYmVyKTogYW55IHtcbiAgICAgIGZ1bmN0aW9uIHJlc29sdmVSZWZlcmVuY2VWYWx1ZShzdGF0aWNTeW1ib2w6IFN0YXRpY1N5bWJvbCk6IGFueSB7XG4gICAgICAgIGNvbnN0IHJlc29sdmVkU3ltYm9sID0gc2VsZi5zeW1ib2xSZXNvbHZlci5yZXNvbHZlU3ltYm9sKHN0YXRpY1N5bWJvbCk7XG4gICAgICAgIHJldHVybiByZXNvbHZlZFN5bWJvbCA/IHJlc29sdmVkU3ltYm9sLm1ldGFkYXRhIDogbnVsbDtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gc2ltcGxpZnlFYWdlcmx5KHZhbHVlOiBhbnkpOiBhbnkge1xuICAgICAgICByZXR1cm4gc2ltcGxpZnlJbkNvbnRleHQoY29udGV4dCwgdmFsdWUsIGRlcHRoLCAwKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gc2ltcGxpZnlMYXppbHkodmFsdWU6IGFueSk6IGFueSB7XG4gICAgICAgIHJldHVybiBzaW1wbGlmeUluQ29udGV4dChjb250ZXh0LCB2YWx1ZSwgZGVwdGgsIHJlZmVyZW5jZXMgKyAxKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gc2ltcGxpZnlOZXN0ZWQobmVzdGVkQ29udGV4dDogU3RhdGljU3ltYm9sLCB2YWx1ZTogYW55KTogYW55IHtcbiAgICAgICAgaWYgKG5lc3RlZENvbnRleHQgPT09IGNvbnRleHQpIHtcbiAgICAgICAgICAvLyBJZiB0aGUgY29udGV4dCBoYXNuJ3QgY2hhbmdlZCBsZXQgdGhlIGV4Y2VwdGlvbiBwcm9wYWdhdGUgdW5tb2RpZmllZC5cbiAgICAgICAgICByZXR1cm4gc2ltcGxpZnlJbkNvbnRleHQobmVzdGVkQ29udGV4dCwgdmFsdWUsIGRlcHRoICsgMSwgcmVmZXJlbmNlcyk7XG4gICAgICAgIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXR1cm4gc2ltcGxpZnlJbkNvbnRleHQobmVzdGVkQ29udGV4dCwgdmFsdWUsIGRlcHRoICsgMSwgcmVmZXJlbmNlcyk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBpZiAoaXNNZXRhZGF0YUVycm9yKGUpKSB7XG4gICAgICAgICAgICAvLyBQcm9wYWdhdGUgdGhlIG1lc3NhZ2UgdGV4dCB1cCBidXQgYWRkIGEgbWVzc2FnZSB0byB0aGUgY2hhaW4gdGhhdCBleHBsYWlucyBob3cgd2UgZ290XG4gICAgICAgICAgICAvLyBoZXJlLlxuICAgICAgICAgICAgLy8gZS5jaGFpbiBpbXBsaWVzIGUuc3ltYm9sXG4gICAgICAgICAgICBjb25zdCBzdW1tYXJ5TXNnID0gZS5jaGFpbiA/ICdyZWZlcmVuY2VzIFxcJycgKyBlLnN5bWJvbCEubmFtZSArICdcXCcnIDogZXJyb3JTdW1tYXJ5KGUpO1xuICAgICAgICAgICAgY29uc3Qgc3VtbWFyeSA9IGAnJHtuZXN0ZWRDb250ZXh0Lm5hbWV9JyAke3N1bW1hcnlNc2d9YDtcbiAgICAgICAgICAgIGNvbnN0IGNoYWluID0ge21lc3NhZ2U6IHN1bW1hcnksIHBvc2l0aW9uOiBlLnBvc2l0aW9uLCBuZXh0OiBlLmNoYWlufTtcbiAgICAgICAgICAgIC8vIFRPRE8oY2h1Y2tqKTogcmV0cmlldmUgdGhlIHBvc2l0aW9uIGluZm9ybWF0aW9uIGluZGlyZWN0bHkgZnJvbSB0aGUgY29sbGVjdG9ycyBub2RlXG4gICAgICAgICAgICAvLyBtYXAgaWYgdGhlIG1ldGFkYXRhIGlzIGZyb20gYSAudHMgZmlsZS5cbiAgICAgICAgICAgIHNlbGYuZXJyb3IoXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgbWVzc2FnZTogZS5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgYWR2aXNlOiBlLmFkdmlzZSxcbiAgICAgICAgICAgICAgICAgIGNvbnRleHQ6IGUuY29udGV4dCxcbiAgICAgICAgICAgICAgICAgIGNoYWluLFxuICAgICAgICAgICAgICAgICAgc3ltYm9sOiBuZXN0ZWRDb250ZXh0XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjb250ZXh0KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gSXQgaXMgcHJvYmFibHkgYW4gaW50ZXJuYWwgZXJyb3IuXG4gICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBzaW1wbGlmeUNhbGwoXG4gICAgICAgICAgZnVuY3Rpb25TeW1ib2w6IFN0YXRpY1N5bWJvbCwgdGFyZ2V0RnVuY3Rpb246IGFueSwgYXJnczogYW55W10sIHRhcmdldEV4cHJlc3Npb246IGFueSkge1xuICAgICAgICBpZiAodGFyZ2V0RnVuY3Rpb24gJiYgdGFyZ2V0RnVuY3Rpb25bJ19fc3ltYm9saWMnXSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgaWYgKGNhbGxpbmcuZ2V0KGZ1bmN0aW9uU3ltYm9sKSkge1xuICAgICAgICAgICAgc2VsZi5lcnJvcihcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICBtZXNzYWdlOiAnUmVjdXJzaW9uIGlzIG5vdCBzdXBwb3J0ZWQnLFxuICAgICAgICAgICAgICAgICAgc3VtbWFyeTogYGNhbGxlZCAnJHtmdW5jdGlvblN5bWJvbC5uYW1lfScgcmVjdXJzaXZlbHlgLFxuICAgICAgICAgICAgICAgICAgdmFsdWU6IHRhcmdldEZ1bmN0aW9uXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBmdW5jdGlvblN5bWJvbCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHRhcmdldEZ1bmN0aW9uWyd2YWx1ZSddO1xuICAgICAgICAgICAgaWYgKHZhbHVlICYmIChkZXB0aCAhPSAwIHx8IHZhbHVlLl9fc3ltYm9saWMgIT0gJ2Vycm9yJykpIHtcbiAgICAgICAgICAgICAgY29uc3QgcGFyYW1ldGVyczogc3RyaW5nW10gPSB0YXJnZXRGdW5jdGlvblsncGFyYW1ldGVycyddO1xuICAgICAgICAgICAgICBjb25zdCBkZWZhdWx0czogYW55W10gPSB0YXJnZXRGdW5jdGlvbi5kZWZhdWx0cztcbiAgICAgICAgICAgICAgYXJncyA9IGFyZ3MubWFwKGFyZyA9PiBzaW1wbGlmeU5lc3RlZChjb250ZXh0LCBhcmcpKVxuICAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAoYXJnID0+IHNob3VsZElnbm9yZShhcmcpID8gdW5kZWZpbmVkIDogYXJnKTtcbiAgICAgICAgICAgICAgaWYgKGRlZmF1bHRzICYmIGRlZmF1bHRzLmxlbmd0aCA+IGFyZ3MubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgYXJncy5wdXNoKC4uLmRlZmF1bHRzLnNsaWNlKGFyZ3MubGVuZ3RoKS5tYXAoKHZhbHVlOiBhbnkpID0+IHNpbXBsaWZ5KHZhbHVlKSkpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGNhbGxpbmcuc2V0KGZ1bmN0aW9uU3ltYm9sLCB0cnVlKTtcbiAgICAgICAgICAgICAgY29uc3QgZnVuY3Rpb25TY29wZSA9IEJpbmRpbmdTY29wZS5idWlsZCgpO1xuICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBhcmFtZXRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBmdW5jdGlvblNjb3BlLmRlZmluZShwYXJhbWV0ZXJzW2ldLCBhcmdzW2ldKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBjb25zdCBvbGRTY29wZSA9IHNjb3BlO1xuICAgICAgICAgICAgICBsZXQgcmVzdWx0OiBhbnk7XG4gICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgc2NvcGUgPSBmdW5jdGlvblNjb3BlLmRvbmUoKTtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBzaW1wbGlmeU5lc3RlZChmdW5jdGlvblN5bWJvbCwgdmFsdWUpO1xuICAgICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHNjb3BlID0gb2xkU2NvcGU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgY2FsbGluZy5kZWxldGUoZnVuY3Rpb25TeW1ib2wpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChkZXB0aCA9PT0gMCkge1xuICAgICAgICAgIC8vIElmIGRlcHRoIGlzIDAgd2UgYXJlIGV2YWx1YXRpbmcgdGhlIHRvcCBsZXZlbCBleHByZXNzaW9uIHRoYXQgaXMgZGVzY3JpYmluZyBlbGVtZW50XG4gICAgICAgICAgLy8gZGVjb3JhdG9yLiBJbiB0aGlzIGNhc2UsIGl0IGlzIGEgZGVjb3JhdG9yIHdlIGRvbid0IHVuZGVyc3RhbmQsIHN1Y2ggYXMgYSBjdXN0b21cbiAgICAgICAgICAvLyBub24tYW5ndWxhciBkZWNvcmF0b3IsIGFuZCB3ZSBzaG91bGQganVzdCBpZ25vcmUgaXQuXG4gICAgICAgICAgcmV0dXJuIElHTk9SRTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgcG9zaXRpb246IFBvc2l0aW9ufHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHRhcmdldEV4cHJlc3Npb24gJiYgdGFyZ2V0RXhwcmVzc2lvbi5fX3N5bWJvbGljID09ICdyZXNvbHZlZCcpIHtcbiAgICAgICAgICBjb25zdCBsaW5lID0gdGFyZ2V0RXhwcmVzc2lvbi5saW5lO1xuICAgICAgICAgIGNvbnN0IGNoYXJhY3RlciA9IHRhcmdldEV4cHJlc3Npb24uY2hhcmFjdGVyO1xuICAgICAgICAgIGNvbnN0IGZpbGVOYW1lID0gdGFyZ2V0RXhwcmVzc2lvbi5maWxlTmFtZTtcbiAgICAgICAgICBpZiAoZmlsZU5hbWUgIT0gbnVsbCAmJiBsaW5lICE9IG51bGwgJiYgY2hhcmFjdGVyICE9IG51bGwpIHtcbiAgICAgICAgICAgIHBvc2l0aW9uID0ge2ZpbGVOYW1lLCBsaW5lLCBjb2x1bW46IGNoYXJhY3Rlcn07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHNlbGYuZXJyb3IoXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIG1lc3NhZ2U6IEZVTkNUSU9OX0NBTExfTk9UX1NVUFBPUlRFRCxcbiAgICAgICAgICAgICAgY29udGV4dDogZnVuY3Rpb25TeW1ib2wsXG4gICAgICAgICAgICAgIHZhbHVlOiB0YXJnZXRGdW5jdGlvbixcbiAgICAgICAgICAgICAgcG9zaXRpb25cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjb250ZXh0KTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gc2ltcGxpZnkoZXhwcmVzc2lvbjogYW55KTogYW55IHtcbiAgICAgICAgaWYgKGlzUHJpbWl0aXZlKGV4cHJlc3Npb24pKSB7XG4gICAgICAgICAgcmV0dXJuIGV4cHJlc3Npb247XG4gICAgICAgIH1cbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZXhwcmVzc2lvbikpIHtcbiAgICAgICAgICBjb25zdCByZXN1bHQ6IGFueVtdID0gW107XG4gICAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mICg8YW55PmV4cHJlc3Npb24pKSB7XG4gICAgICAgICAgICAvLyBDaGVjayBmb3IgYSBzcHJlYWQgZXhwcmVzc2lvblxuICAgICAgICAgICAgaWYgKGl0ZW0gJiYgaXRlbS5fX3N5bWJvbGljID09PSAnc3ByZWFkJykge1xuICAgICAgICAgICAgICAvLyBXZSBjYWxsIHdpdGggcmVmZXJlbmNlcyBhcyAwIGJlY2F1c2Ugd2UgcmVxdWlyZSB0aGUgYWN0dWFsIHZhbHVlIGFuZCBjYW5ub3RcbiAgICAgICAgICAgICAgLy8gdG9sZXJhdGUgYSByZWZlcmVuY2UgaGVyZS5cbiAgICAgICAgICAgICAgY29uc3Qgc3ByZWFkQXJyYXkgPSBzaW1wbGlmeUVhZ2VybHkoaXRlbS5leHByZXNzaW9uKTtcbiAgICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoc3ByZWFkQXJyYXkpKSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBzcHJlYWRJdGVtIG9mIHNwcmVhZEFycmF5KSB7XG4gICAgICAgICAgICAgICAgICByZXN1bHQucHVzaChzcHJlYWRJdGVtKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gc2ltcGxpZnkoaXRlbSk7XG4gICAgICAgICAgICBpZiAoc2hvdWxkSWdub3JlKHZhbHVlKSkge1xuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKHZhbHVlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZXhwcmVzc2lvbiBpbnN0YW5jZW9mIFN0YXRpY1N5bWJvbCkge1xuICAgICAgICAgIC8vIFN0b3Agc2ltcGxpZmljYXRpb24gYXQgYnVpbHRpbiBzeW1ib2xzIG9yIGlmIHdlIGFyZSBpbiBhIHJlZmVyZW5jZSBjb250ZXh0IGFuZFxuICAgICAgICAgIC8vIHRoZSBzeW1ib2wgZG9lc24ndCBoYXZlIG1lbWJlcnMuXG4gICAgICAgICAgaWYgKGV4cHJlc3Npb24gPT09IHNlbGYuaW5qZWN0aW9uVG9rZW4gfHwgc2VsZi5jb252ZXJzaW9uTWFwLmhhcyhleHByZXNzaW9uKSB8fFxuICAgICAgICAgICAgICAocmVmZXJlbmNlcyA+IDAgJiYgIWV4cHJlc3Npb24ubWVtYmVycy5sZW5ndGgpKSB7XG4gICAgICAgICAgICByZXR1cm4gZXhwcmVzc2lvbjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3Qgc3RhdGljU3ltYm9sID0gZXhwcmVzc2lvbjtcbiAgICAgICAgICAgIGNvbnN0IGRlY2xhcmF0aW9uVmFsdWUgPSByZXNvbHZlUmVmZXJlbmNlVmFsdWUoc3RhdGljU3ltYm9sKTtcbiAgICAgICAgICAgIGlmIChkZWNsYXJhdGlvblZhbHVlICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHNpbXBsaWZ5TmVzdGVkKHN0YXRpY1N5bWJvbCwgZGVjbGFyYXRpb25WYWx1ZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXR1cm4gc3RhdGljU3ltYm9sO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoZXhwcmVzc2lvbikge1xuICAgICAgICAgIGlmIChleHByZXNzaW9uWydfX3N5bWJvbGljJ10pIHtcbiAgICAgICAgICAgIGxldCBzdGF0aWNTeW1ib2w6IFN0YXRpY1N5bWJvbDtcbiAgICAgICAgICAgIHN3aXRjaCAoZXhwcmVzc2lvblsnX19zeW1ib2xpYyddKSB7XG4gICAgICAgICAgICAgIGNhc2UgJ2Jpbm9wJzpcbiAgICAgICAgICAgICAgICBsZXQgbGVmdCA9IHNpbXBsaWZ5KGV4cHJlc3Npb25bJ2xlZnQnXSk7XG4gICAgICAgICAgICAgICAgaWYgKHNob3VsZElnbm9yZShsZWZ0KSkgcmV0dXJuIGxlZnQ7XG4gICAgICAgICAgICAgICAgbGV0IHJpZ2h0ID0gc2ltcGxpZnkoZXhwcmVzc2lvblsncmlnaHQnXSk7XG4gICAgICAgICAgICAgICAgaWYgKHNob3VsZElnbm9yZShyaWdodCkpIHJldHVybiByaWdodDtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKGV4cHJlc3Npb25bJ29wZXJhdG9yJ10pIHtcbiAgICAgICAgICAgICAgICAgIGNhc2UgJyYmJzpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgJiYgcmlnaHQ7XG4gICAgICAgICAgICAgICAgICBjYXNlICd8fCc6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0IHx8IHJpZ2h0O1xuICAgICAgICAgICAgICAgICAgY2FzZSAnfCc6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0IHwgcmlnaHQ7XG4gICAgICAgICAgICAgICAgICBjYXNlICdeJzpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgXiByaWdodDtcbiAgICAgICAgICAgICAgICAgIGNhc2UgJyYnOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdCAmIHJpZ2h0O1xuICAgICAgICAgICAgICAgICAgY2FzZSAnPT0nOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdCA9PSByaWdodDtcbiAgICAgICAgICAgICAgICAgIGNhc2UgJyE9JzpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgIT0gcmlnaHQ7XG4gICAgICAgICAgICAgICAgICBjYXNlICc9PT0nOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdCA9PT0gcmlnaHQ7XG4gICAgICAgICAgICAgICAgICBjYXNlICchPT0nOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdCAhPT0gcmlnaHQ7XG4gICAgICAgICAgICAgICAgICBjYXNlICc8JzpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgPCByaWdodDtcbiAgICAgICAgICAgICAgICAgIGNhc2UgJz4nOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdCA+IHJpZ2h0O1xuICAgICAgICAgICAgICAgICAgY2FzZSAnPD0nOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdCA8PSByaWdodDtcbiAgICAgICAgICAgICAgICAgIGNhc2UgJz49JzpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgPj0gcmlnaHQ7XG4gICAgICAgICAgICAgICAgICBjYXNlICc8PCc6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0IDw8IHJpZ2h0O1xuICAgICAgICAgICAgICAgICAgY2FzZSAnPj4nOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdCA+PiByaWdodDtcbiAgICAgICAgICAgICAgICAgIGNhc2UgJysnOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdCArIHJpZ2h0O1xuICAgICAgICAgICAgICAgICAgY2FzZSAnLSc6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0IC0gcmlnaHQ7XG4gICAgICAgICAgICAgICAgICBjYXNlICcqJzpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgKiByaWdodDtcbiAgICAgICAgICAgICAgICAgIGNhc2UgJy8nOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdCAvIHJpZ2h0O1xuICAgICAgICAgICAgICAgICAgY2FzZSAnJSc6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0ICUgcmlnaHQ7XG4gICAgICAgICAgICAgICAgICBjYXNlICc/Pyc6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0ID8/IHJpZ2h0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgY2FzZSAnaWYnOlxuICAgICAgICAgICAgICAgIGxldCBjb25kaXRpb24gPSBzaW1wbGlmeShleHByZXNzaW9uWydjb25kaXRpb24nXSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbmRpdGlvbiA/IHNpbXBsaWZ5KGV4cHJlc3Npb25bJ3RoZW5FeHByZXNzaW9uJ10pIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2ltcGxpZnkoZXhwcmVzc2lvblsnZWxzZUV4cHJlc3Npb24nXSk7XG4gICAgICAgICAgICAgIGNhc2UgJ3ByZSc6XG4gICAgICAgICAgICAgICAgbGV0IG9wZXJhbmQgPSBzaW1wbGlmeShleHByZXNzaW9uWydvcGVyYW5kJ10pO1xuICAgICAgICAgICAgICAgIGlmIChzaG91bGRJZ25vcmUob3BlcmFuZCkpIHJldHVybiBvcGVyYW5kO1xuICAgICAgICAgICAgICAgIHN3aXRjaCAoZXhwcmVzc2lvblsnb3BlcmF0b3InXSkge1xuICAgICAgICAgICAgICAgICAgY2FzZSAnKyc6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBvcGVyYW5kO1xuICAgICAgICAgICAgICAgICAgY2FzZSAnLSc6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAtb3BlcmFuZDtcbiAgICAgICAgICAgICAgICAgIGNhc2UgJyEnOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gIW9wZXJhbmQ7XG4gICAgICAgICAgICAgICAgICBjYXNlICd+JzpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIH5vcGVyYW5kO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgY2FzZSAnaW5kZXgnOlxuICAgICAgICAgICAgICAgIGxldCBpbmRleFRhcmdldCA9IHNpbXBsaWZ5RWFnZXJseShleHByZXNzaW9uWydleHByZXNzaW9uJ10pO1xuICAgICAgICAgICAgICAgIGxldCBpbmRleCA9IHNpbXBsaWZ5RWFnZXJseShleHByZXNzaW9uWydpbmRleCddKTtcbiAgICAgICAgICAgICAgICBpZiAoaW5kZXhUYXJnZXQgJiYgaXNQcmltaXRpdmUoaW5kZXgpKSByZXR1cm4gaW5kZXhUYXJnZXRbaW5kZXhdO1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICBjYXNlICdzZWxlY3QnOlxuICAgICAgICAgICAgICAgIGNvbnN0IG1lbWJlciA9IGV4cHJlc3Npb25bJ21lbWJlciddO1xuICAgICAgICAgICAgICAgIGxldCBzZWxlY3RDb250ZXh0ID0gY29udGV4dDtcbiAgICAgICAgICAgICAgICBsZXQgc2VsZWN0VGFyZ2V0ID0gc2ltcGxpZnkoZXhwcmVzc2lvblsnZXhwcmVzc2lvbiddKTtcbiAgICAgICAgICAgICAgICBpZiAoc2VsZWN0VGFyZ2V0IGluc3RhbmNlb2YgU3RhdGljU3ltYm9sKSB7XG4gICAgICAgICAgICAgICAgICBjb25zdCBtZW1iZXJzID0gc2VsZWN0VGFyZ2V0Lm1lbWJlcnMuY29uY2F0KG1lbWJlcik7XG4gICAgICAgICAgICAgICAgICBzZWxlY3RDb250ZXh0ID1cbiAgICAgICAgICAgICAgICAgICAgICBzZWxmLmdldFN0YXRpY1N5bWJvbChzZWxlY3RUYXJnZXQuZmlsZVBhdGgsIHNlbGVjdFRhcmdldC5uYW1lLCBtZW1iZXJzKTtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGRlY2xhcmF0aW9uVmFsdWUgPSByZXNvbHZlUmVmZXJlbmNlVmFsdWUoc2VsZWN0Q29udGV4dCk7XG4gICAgICAgICAgICAgICAgICBpZiAoZGVjbGFyYXRpb25WYWx1ZSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzaW1wbGlmeU5lc3RlZChzZWxlY3RDb250ZXh0LCBkZWNsYXJhdGlvblZhbHVlKTtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzZWxlY3RDb250ZXh0O1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoc2VsZWN0VGFyZ2V0ICYmIGlzUHJpbWl0aXZlKG1lbWJlcikpXG4gICAgICAgICAgICAgICAgICByZXR1cm4gc2ltcGxpZnlOZXN0ZWQoc2VsZWN0Q29udGV4dCwgc2VsZWN0VGFyZ2V0W21lbWJlcl0pO1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICBjYXNlICdyZWZlcmVuY2UnOlxuICAgICAgICAgICAgICAgIC8vIE5vdGU6IFRoaXMgb25seSBoYXMgdG8gZGVhbCB3aXRoIHZhcmlhYmxlIHJlZmVyZW5jZXMsIGFzIHN5bWJvbCByZWZlcmVuY2VzIGhhdmVcbiAgICAgICAgICAgICAgICAvLyBiZWVuIGNvbnZlcnRlZCBpbnRvICdyZXNvbHZlZCdcbiAgICAgICAgICAgICAgICAvLyBpbiB0aGUgU3RhdGljU3ltYm9sUmVzb2x2ZXIuXG4gICAgICAgICAgICAgICAgY29uc3QgbmFtZTogc3RyaW5nID0gZXhwcmVzc2lvblsnbmFtZSddO1xuICAgICAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFsdWUgPSBzY29wZS5yZXNvbHZlKG5hbWUpO1xuICAgICAgICAgICAgICAgIGlmIChsb2NhbFZhbHVlICE9IEJpbmRpbmdTY29wZS5taXNzaW5nKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbG9jYWxWYWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIGNhc2UgJ3Jlc29sdmVkJzpcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHNpbXBsaWZ5KGV4cHJlc3Npb24uc3ltYm9sKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAvLyBJZiBhbiBlcnJvciBpcyByZXBvcnRlZCBldmFsdWF0aW5nIHRoZSBzeW1ib2wgcmVjb3JkIHRoZSBwb3NpdGlvbiBvZiB0aGVcbiAgICAgICAgICAgICAgICAgIC8vIHJlZmVyZW5jZSBpbiB0aGUgZXJyb3Igc28gaXQgY2FuXG4gICAgICAgICAgICAgICAgICAvLyBiZSByZXBvcnRlZCBpbiB0aGUgZXJyb3IgbWVzc2FnZSBnZW5lcmF0ZWQgZnJvbSB0aGUgZXhjZXB0aW9uLlxuICAgICAgICAgICAgICAgICAgaWYgKGlzTWV0YWRhdGFFcnJvcihlKSAmJiBleHByZXNzaW9uLmZpbGVOYW1lICE9IG51bGwgJiZcbiAgICAgICAgICAgICAgICAgICAgICBleHByZXNzaW9uLmxpbmUgIT0gbnVsbCAmJiBleHByZXNzaW9uLmNoYXJhY3RlciAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGUucG9zaXRpb24gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgZmlsZU5hbWU6IGV4cHJlc3Npb24uZmlsZU5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgbGluZTogZXhwcmVzc2lvbi5saW5lLFxuICAgICAgICAgICAgICAgICAgICAgIGNvbHVtbjogZXhwcmVzc2lvbi5jaGFyYWN0ZXJcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBjYXNlICdjbGFzcyc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbnRleHQ7XG4gICAgICAgICAgICAgIGNhc2UgJ2Z1bmN0aW9uJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gY29udGV4dDtcbiAgICAgICAgICAgICAgY2FzZSAnbmV3JzpcbiAgICAgICAgICAgICAgY2FzZSAnY2FsbCc6XG4gICAgICAgICAgICAgICAgLy8gRGV0ZXJtaW5lIGlmIHRoZSBmdW5jdGlvbiBpcyBhIGJ1aWx0LWluIGNvbnZlcnNpb25cbiAgICAgICAgICAgICAgICBzdGF0aWNTeW1ib2wgPSBzaW1wbGlmeUluQ29udGV4dChcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dCwgZXhwcmVzc2lvblsnZXhwcmVzc2lvbiddLCBkZXB0aCArIDEsIC8qIHJlZmVyZW5jZXMgKi8gMCk7XG4gICAgICAgICAgICAgICAgaWYgKHN0YXRpY1N5bWJvbCBpbnN0YW5jZW9mIFN0YXRpY1N5bWJvbCkge1xuICAgICAgICAgICAgICAgICAgaWYgKHN0YXRpY1N5bWJvbCA9PT0gc2VsZi5pbmplY3Rpb25Ub2tlbiB8fCBzdGF0aWNTeW1ib2wgPT09IHNlbGYub3BhcXVlVG9rZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgc29tZWJvZHkgY2FsbHMgbmV3IEluamVjdGlvblRva2VuLCBkb24ndCBjcmVhdGUgYW4gSW5qZWN0aW9uVG9rZW4sXG4gICAgICAgICAgICAgICAgICAgIC8vIGJ1dCByYXRoZXIgcmV0dXJuIHRoZSBzeW1ib2wgdG8gd2hpY2ggdGhlIEluamVjdGlvblRva2VuIGlzIGFzc2lnbmVkIHRvLlxuXG4gICAgICAgICAgICAgICAgICAgIC8vIE9wYXF1ZVRva2VuIGlzIHN1cHBvcnRlZCB0b28gYXMgaXQgaXMgcmVxdWlyZWQgYnkgdGhlIGxhbmd1YWdlIHNlcnZpY2UgdG9cbiAgICAgICAgICAgICAgICAgICAgLy8gc3VwcG9ydCB2NCBhbmQgcHJpb3IgdmVyc2lvbnMgb2YgQW5ndWxhci5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbnRleHQ7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBjb25zdCBhcmdFeHByZXNzaW9uczogYW55W10gPSBleHByZXNzaW9uWydhcmd1bWVudHMnXSB8fCBbXTtcbiAgICAgICAgICAgICAgICAgIGxldCBjb252ZXJ0ZXIgPSBzZWxmLmNvbnZlcnNpb25NYXAuZ2V0KHN0YXRpY1N5bWJvbCk7XG4gICAgICAgICAgICAgICAgICBpZiAoY29udmVydGVyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGFyZ3MgPSBhcmdFeHByZXNzaW9ucy5tYXAoYXJnID0+IHNpbXBsaWZ5TmVzdGVkKGNvbnRleHQsIGFyZykpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm1hcChhcmcgPT4gc2hvdWxkSWdub3JlKGFyZykgPyB1bmRlZmluZWQgOiBhcmcpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29udmVydGVyKGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gRGV0ZXJtaW5lIGlmIHRoZSBmdW5jdGlvbiBpcyBvbmUgd2UgY2FuIHNpbXBsaWZ5LlxuICAgICAgICAgICAgICAgICAgICBjb25zdCB0YXJnZXRGdW5jdGlvbiA9IHJlc29sdmVSZWZlcmVuY2VWYWx1ZShzdGF0aWNTeW1ib2wpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2ltcGxpZnlDYWxsKFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGljU3ltYm9sLCB0YXJnZXRGdW5jdGlvbiwgYXJnRXhwcmVzc2lvbnMsIGV4cHJlc3Npb25bJ2V4cHJlc3Npb24nXSk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBJR05PUkU7XG4gICAgICAgICAgICAgIGNhc2UgJ2Vycm9yJzpcbiAgICAgICAgICAgICAgICBsZXQgbWVzc2FnZSA9IGV4cHJlc3Npb24ubWVzc2FnZTtcbiAgICAgICAgICAgICAgICBpZiAoZXhwcmVzc2lvblsnbGluZSddICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgIHNlbGYuZXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6IGV4cHJlc3Npb24uY29udGV4dCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBleHByZXNzaW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZU5hbWU6IGV4cHJlc3Npb25bJ2ZpbGVOYW1lJ10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmU6IGV4cHJlc3Npb25bJ2xpbmUnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY29sdW1uOiBleHByZXNzaW9uWydjaGFyYWN0ZXInXVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgY29udGV4dCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIHNlbGYuZXJyb3Ioe21lc3NhZ2UsIGNvbnRleHQ6IGV4cHJlc3Npb24uY29udGV4dH0sIGNvbnRleHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gSUdOT1JFO1xuICAgICAgICAgICAgICBjYXNlICdpZ25vcmUnOlxuICAgICAgICAgICAgICAgIHJldHVybiBleHByZXNzaW9uO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBtYXBTdHJpbmdNYXAoZXhwcmVzc2lvbiwgKHZhbHVlLCBuYW1lKSA9PiB7XG4gICAgICAgICAgICBpZiAoUkVGRVJFTkNFX1NFVC5oYXMobmFtZSkpIHtcbiAgICAgICAgICAgICAgaWYgKG5hbWUgPT09IFVTRV9WQUxVRSAmJiBQUk9WSURFIGluIGV4cHJlc3Npb24pIHtcbiAgICAgICAgICAgICAgICAvLyBJZiB0aGlzIGlzIGEgcHJvdmlkZXIgZXhwcmVzc2lvbiwgY2hlY2sgZm9yIHNwZWNpYWwgdG9rZW5zIHRoYXQgbmVlZCB0aGUgdmFsdWVcbiAgICAgICAgICAgICAgICAvLyBkdXJpbmcgYW5hbHlzaXMuXG4gICAgICAgICAgICAgICAgY29uc3QgcHJvdmlkZSA9IHNpbXBsaWZ5KGV4cHJlc3Npb24ucHJvdmlkZSk7XG4gICAgICAgICAgICAgICAgaWYgKHByb3ZpZGUgPT09IHNlbGYuUk9VVEVTIHx8IHByb3ZpZGUgPT0gc2VsZi5BTkFMWVpFX0ZPUl9FTlRSWV9DT01QT05FTlRTKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gc2ltcGxpZnkodmFsdWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gc2ltcGxpZnlMYXppbHkodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHNpbXBsaWZ5KHZhbHVlKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gSUdOT1JFO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2ltcGxpZnkodmFsdWUpO1xuICAgIH1cblxuICAgIGxldCByZXN1bHQ6IGFueTtcbiAgICB0cnkge1xuICAgICAgcmVzdWx0ID0gc2ltcGxpZnlJbkNvbnRleHQoY29udGV4dCwgdmFsdWUsIDAsIGxhenkgPyAxIDogMCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKHRoaXMuZXJyb3JSZWNvcmRlcikge1xuICAgICAgICB0aGlzLnJlcG9ydEVycm9yKGUsIGNvbnRleHQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgZm9ybWF0TWV0YWRhdGFFcnJvcihlLCBjb250ZXh0KTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHNob3VsZElnbm9yZShyZXN1bHQpKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRUeXBlTWV0YWRhdGEodHlwZTogU3RhdGljU3ltYm9sKToge1trZXk6IHN0cmluZ106IGFueX0ge1xuICAgIGNvbnN0IHJlc29sdmVkU3ltYm9sID0gdGhpcy5zeW1ib2xSZXNvbHZlci5yZXNvbHZlU3ltYm9sKHR5cGUpO1xuICAgIHJldHVybiByZXNvbHZlZFN5bWJvbCAmJiByZXNvbHZlZFN5bWJvbC5tZXRhZGF0YSA/IHJlc29sdmVkU3ltYm9sLm1ldGFkYXRhIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7X19zeW1ib2xpYzogJ2NsYXNzJ307XG4gIH1cblxuICBwcml2YXRlIHJlcG9ydEVycm9yKGVycm9yOiBFcnJvciwgY29udGV4dDogU3RhdGljU3ltYm9sLCBwYXRoPzogc3RyaW5nKSB7XG4gICAgaWYgKHRoaXMuZXJyb3JSZWNvcmRlcikge1xuICAgICAgdGhpcy5lcnJvclJlY29yZGVyKFxuICAgICAgICAgIGZvcm1hdE1ldGFkYXRhRXJyb3IoZXJyb3IsIGNvbnRleHQpLCAoY29udGV4dCAmJiBjb250ZXh0LmZpbGVQYXRoKSB8fCBwYXRoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBlcnJvcihcbiAgICAgIHttZXNzYWdlLCBzdW1tYXJ5LCBhZHZpc2UsIHBvc2l0aW9uLCBjb250ZXh0LCB2YWx1ZSwgc3ltYm9sLCBjaGFpbn06IHtcbiAgICAgICAgbWVzc2FnZTogc3RyaW5nLFxuICAgICAgICBzdW1tYXJ5Pzogc3RyaW5nLFxuICAgICAgICBhZHZpc2U/OiBzdHJpbmcsXG4gICAgICAgIHBvc2l0aW9uPzogUG9zaXRpb24sXG4gICAgICAgIGNvbnRleHQ/OiBhbnksXG4gICAgICAgIHZhbHVlPzogYW55LFxuICAgICAgICBzeW1ib2w/OiBTdGF0aWNTeW1ib2wsXG4gICAgICAgIGNoYWluPzogTWV0YWRhdGFNZXNzYWdlQ2hhaW5cbiAgICAgIH0sXG4gICAgICByZXBvcnRpbmdDb250ZXh0OiBTdGF0aWNTeW1ib2wpIHtcbiAgICB0aGlzLnJlcG9ydEVycm9yKFxuICAgICAgICBtZXRhZGF0YUVycm9yKG1lc3NhZ2UsIHN1bW1hcnksIGFkdmlzZSwgcG9zaXRpb24sIHN5bWJvbCwgY29udGV4dCwgY2hhaW4pLFxuICAgICAgICByZXBvcnRpbmdDb250ZXh0KTtcbiAgfVxufVxuXG5pbnRlcmZhY2UgUG9zaXRpb24ge1xuICBmaWxlTmFtZTogc3RyaW5nO1xuICBsaW5lOiBudW1iZXI7XG4gIGNvbHVtbjogbnVtYmVyO1xufVxuXG5pbnRlcmZhY2UgTWV0YWRhdGFNZXNzYWdlQ2hhaW4ge1xuICBtZXNzYWdlOiBzdHJpbmc7XG4gIHN1bW1hcnk/OiBzdHJpbmc7XG4gIHBvc2l0aW9uPzogUG9zaXRpb247XG4gIGNvbnRleHQ/OiBhbnk7XG4gIHN5bWJvbD86IFN0YXRpY1N5bWJvbDtcbiAgbmV4dD86IE1ldGFkYXRhTWVzc2FnZUNoYWluO1xufVxuXG50eXBlIE1ldGFkYXRhRXJyb3IgPSBFcnJvciZ7XG4gIHBvc2l0aW9uPzogUG9zaXRpb247XG4gIGFkdmlzZT86IHN0cmluZztcbiAgc3VtbWFyeT86IHN0cmluZztcbiAgY29udGV4dD86IGFueTtcbiAgc3ltYm9sPzogU3RhdGljU3ltYm9sO1xuICBjaGFpbj86IE1ldGFkYXRhTWVzc2FnZUNoYWluO1xufTtcblxuY29uc3QgTUVUQURBVEFfRVJST1IgPSAnbmdNZXRhZGF0YUVycm9yJztcblxuZnVuY3Rpb24gbWV0YWRhdGFFcnJvcihcbiAgICBtZXNzYWdlOiBzdHJpbmcsIHN1bW1hcnk/OiBzdHJpbmcsIGFkdmlzZT86IHN0cmluZywgcG9zaXRpb24/OiBQb3NpdGlvbiwgc3ltYm9sPzogU3RhdGljU3ltYm9sLFxuICAgIGNvbnRleHQ/OiBhbnksIGNoYWluPzogTWV0YWRhdGFNZXNzYWdlQ2hhaW4pOiBNZXRhZGF0YUVycm9yIHtcbiAgY29uc3QgZXJyb3IgPSBzeW50YXhFcnJvcihtZXNzYWdlKSBhcyBNZXRhZGF0YUVycm9yO1xuICAoZXJyb3IgYXMgYW55KVtNRVRBREFUQV9FUlJPUl0gPSB0cnVlO1xuICBpZiAoYWR2aXNlKSBlcnJvci5hZHZpc2UgPSBhZHZpc2U7XG4gIGlmIChwb3NpdGlvbikgZXJyb3IucG9zaXRpb24gPSBwb3NpdGlvbjtcbiAgaWYgKHN1bW1hcnkpIGVycm9yLnN1bW1hcnkgPSBzdW1tYXJ5O1xuICBpZiAoY29udGV4dCkgZXJyb3IuY29udGV4dCA9IGNvbnRleHQ7XG4gIGlmIChjaGFpbikgZXJyb3IuY2hhaW4gPSBjaGFpbjtcbiAgaWYgKHN5bWJvbCkgZXJyb3Iuc3ltYm9sID0gc3ltYm9sO1xuICByZXR1cm4gZXJyb3I7XG59XG5cbmZ1bmN0aW9uIGlzTWV0YWRhdGFFcnJvcihlcnJvcjogRXJyb3IpOiBlcnJvciBpcyBNZXRhZGF0YUVycm9yIHtcbiAgcmV0dXJuICEhKGVycm9yIGFzIGFueSlbTUVUQURBVEFfRVJST1JdO1xufVxuXG5jb25zdCBSRUZFUkVOQ0VfVE9fTk9ORVhQT1JURURfQ0xBU1MgPSAnUmVmZXJlbmNlIHRvIG5vbi1leHBvcnRlZCBjbGFzcyc7XG5jb25zdCBWQVJJQUJMRV9OT1RfSU5JVElBTElaRUQgPSAnVmFyaWFibGUgbm90IGluaXRpYWxpemVkJztcbmNvbnN0IERFU1RSVUNUVVJFX05PVF9TVVBQT1JURUQgPSAnRGVzdHJ1Y3R1cmluZyBub3Qgc3VwcG9ydGVkJztcbmNvbnN0IENPVUxEX05PVF9SRVNPTFZFX1RZUEUgPSAnQ291bGQgbm90IHJlc29sdmUgdHlwZSc7XG5jb25zdCBGVU5DVElPTl9DQUxMX05PVF9TVVBQT1JURUQgPSAnRnVuY3Rpb24gY2FsbCBub3Qgc3VwcG9ydGVkJztcbmNvbnN0IFJFRkVSRU5DRV9UT19MT0NBTF9TWU1CT0wgPSAnUmVmZXJlbmNlIHRvIGEgbG9jYWwgc3ltYm9sJztcbmNvbnN0IExBTUJEQV9OT1RfU1VQUE9SVEVEID0gJ0xhbWJkYSBub3Qgc3VwcG9ydGVkJztcblxuZnVuY3Rpb24gZXhwYW5kZWRNZXNzYWdlKG1lc3NhZ2U6IHN0cmluZywgY29udGV4dDogYW55KTogc3RyaW5nIHtcbiAgc3dpdGNoIChtZXNzYWdlKSB7XG4gICAgY2FzZSBSRUZFUkVOQ0VfVE9fTk9ORVhQT1JURURfQ0xBU1M6XG4gICAgICBpZiAoY29udGV4dCAmJiBjb250ZXh0LmNsYXNzTmFtZSkge1xuICAgICAgICByZXR1cm4gYFJlZmVyZW5jZXMgdG8gYSBub24tZXhwb3J0ZWQgY2xhc3MgYXJlIG5vdCBzdXBwb3J0ZWQgaW4gZGVjb3JhdG9ycyBidXQgJHtcbiAgICAgICAgICAgIGNvbnRleHQuY2xhc3NOYW1lfSB3YXMgcmVmZXJlbmNlZC5gO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSBWQVJJQUJMRV9OT1RfSU5JVElBTElaRUQ6XG4gICAgICByZXR1cm4gJ09ubHkgaW5pdGlhbGl6ZWQgdmFyaWFibGVzIGFuZCBjb25zdGFudHMgY2FuIGJlIHJlZmVyZW5jZWQgaW4gZGVjb3JhdG9ycyBiZWNhdXNlIHRoZSB2YWx1ZSBvZiB0aGlzIHZhcmlhYmxlIGlzIG5lZWRlZCBieSB0aGUgdGVtcGxhdGUgY29tcGlsZXInO1xuICAgIGNhc2UgREVTVFJVQ1RVUkVfTk9UX1NVUFBPUlRFRDpcbiAgICAgIHJldHVybiAnUmVmZXJlbmNpbmcgYW4gZXhwb3J0ZWQgZGVzdHJ1Y3R1cmVkIHZhcmlhYmxlIG9yIGNvbnN0YW50IGlzIG5vdCBzdXBwb3J0ZWQgaW4gZGVjb3JhdG9ycyBhbmQgdGhpcyB2YWx1ZSBpcyBuZWVkZWQgYnkgdGhlIHRlbXBsYXRlIGNvbXBpbGVyJztcbiAgICBjYXNlIENPVUxEX05PVF9SRVNPTFZFX1RZUEU6XG4gICAgICBpZiAoY29udGV4dCAmJiBjb250ZXh0LnR5cGVOYW1lKSB7XG4gICAgICAgIHJldHVybiBgQ291bGQgbm90IHJlc29sdmUgdHlwZSAke2NvbnRleHQudHlwZU5hbWV9YDtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgRlVOQ1RJT05fQ0FMTF9OT1RfU1VQUE9SVEVEOlxuICAgICAgaWYgKGNvbnRleHQgJiYgY29udGV4dC5uYW1lKSB7XG4gICAgICAgIHJldHVybiBgRnVuY3Rpb24gY2FsbHMgYXJlIG5vdCBzdXBwb3J0ZWQgaW4gZGVjb3JhdG9ycyBidXQgJyR7Y29udGV4dC5uYW1lfScgd2FzIGNhbGxlZGA7XG4gICAgICB9XG4gICAgICByZXR1cm4gJ0Z1bmN0aW9uIGNhbGxzIGFyZSBub3Qgc3VwcG9ydGVkIGluIGRlY29yYXRvcnMnO1xuICAgIGNhc2UgUkVGRVJFTkNFX1RPX0xPQ0FMX1NZTUJPTDpcbiAgICAgIGlmIChjb250ZXh0ICYmIGNvbnRleHQubmFtZSkge1xuICAgICAgICByZXR1cm4gYFJlZmVyZW5jZSB0byBhIGxvY2FsIChub24tZXhwb3J0ZWQpIHN5bWJvbHMgYXJlIG5vdCBzdXBwb3J0ZWQgaW4gZGVjb3JhdG9ycyBidXQgJyR7XG4gICAgICAgICAgICBjb250ZXh0Lm5hbWV9JyB3YXMgcmVmZXJlbmNlZGA7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlIExBTUJEQV9OT1RfU1VQUE9SVEVEOlxuICAgICAgcmV0dXJuIGBGdW5jdGlvbiBleHByZXNzaW9ucyBhcmUgbm90IHN1cHBvcnRlZCBpbiBkZWNvcmF0b3JzYDtcbiAgfVxuICByZXR1cm4gbWVzc2FnZTtcbn1cblxuZnVuY3Rpb24gbWVzc2FnZUFkdmlzZShtZXNzYWdlOiBzdHJpbmcsIGNvbnRleHQ6IGFueSk6IHN0cmluZ3x1bmRlZmluZWQge1xuICBzd2l0Y2ggKG1lc3NhZ2UpIHtcbiAgICBjYXNlIFJFRkVSRU5DRV9UT19OT05FWFBPUlRFRF9DTEFTUzpcbiAgICAgIGlmIChjb250ZXh0ICYmIGNvbnRleHQuY2xhc3NOYW1lKSB7XG4gICAgICAgIHJldHVybiBgQ29uc2lkZXIgZXhwb3J0aW5nICcke2NvbnRleHQuY2xhc3NOYW1lfSdgO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSBERVNUUlVDVFVSRV9OT1RfU1VQUE9SVEVEOlxuICAgICAgcmV0dXJuICdDb25zaWRlciBzaW1wbGlmeWluZyB0byBhdm9pZCBkZXN0cnVjdHVyaW5nJztcbiAgICBjYXNlIFJFRkVSRU5DRV9UT19MT0NBTF9TWU1CT0w6XG4gICAgICBpZiAoY29udGV4dCAmJiBjb250ZXh0Lm5hbWUpIHtcbiAgICAgICAgcmV0dXJuIGBDb25zaWRlciBleHBvcnRpbmcgJyR7Y29udGV4dC5uYW1lfSdgO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSBMQU1CREFfTk9UX1NVUFBPUlRFRDpcbiAgICAgIHJldHVybiBgQ29uc2lkZXIgY2hhbmdpbmcgdGhlIGZ1bmN0aW9uIGV4cHJlc3Npb24gaW50byBhbiBleHBvcnRlZCBmdW5jdGlvbmA7XG4gIH1cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gZXJyb3JTdW1tYXJ5KGVycm9yOiBNZXRhZGF0YUVycm9yKTogc3RyaW5nIHtcbiAgaWYgKGVycm9yLnN1bW1hcnkpIHtcbiAgICByZXR1cm4gZXJyb3Iuc3VtbWFyeTtcbiAgfVxuICBzd2l0Y2ggKGVycm9yLm1lc3NhZ2UpIHtcbiAgICBjYXNlIFJFRkVSRU5DRV9UT19OT05FWFBPUlRFRF9DTEFTUzpcbiAgICAgIGlmIChlcnJvci5jb250ZXh0ICYmIGVycm9yLmNvbnRleHQuY2xhc3NOYW1lKSB7XG4gICAgICAgIHJldHVybiBgcmVmZXJlbmNlcyBub24tZXhwb3J0ZWQgY2xhc3MgJHtlcnJvci5jb250ZXh0LmNsYXNzTmFtZX1gO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSBWQVJJQUJMRV9OT1RfSU5JVElBTElaRUQ6XG4gICAgICByZXR1cm4gJ2lzIG5vdCBpbml0aWFsaXplZCc7XG4gICAgY2FzZSBERVNUUlVDVFVSRV9OT1RfU1VQUE9SVEVEOlxuICAgICAgcmV0dXJuICdpcyBhIGRlc3RydWN0dXJlZCB2YXJpYWJsZSc7XG4gICAgY2FzZSBDT1VMRF9OT1RfUkVTT0xWRV9UWVBFOlxuICAgICAgcmV0dXJuICdjb3VsZCBub3QgYmUgcmVzb2x2ZWQnO1xuICAgIGNhc2UgRlVOQ1RJT05fQ0FMTF9OT1RfU1VQUE9SVEVEOlxuICAgICAgaWYgKGVycm9yLmNvbnRleHQgJiYgZXJyb3IuY29udGV4dC5uYW1lKSB7XG4gICAgICAgIHJldHVybiBgY2FsbHMgJyR7ZXJyb3IuY29udGV4dC5uYW1lfSdgO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGBjYWxscyBhIGZ1bmN0aW9uYDtcbiAgICBjYXNlIFJFRkVSRU5DRV9UT19MT0NBTF9TWU1CT0w6XG4gICAgICBpZiAoZXJyb3IuY29udGV4dCAmJiBlcnJvci5jb250ZXh0Lm5hbWUpIHtcbiAgICAgICAgcmV0dXJuIGByZWZlcmVuY2VzIGxvY2FsIHZhcmlhYmxlICR7ZXJyb3IuY29udGV4dC5uYW1lfWA7XG4gICAgICB9XG4gICAgICByZXR1cm4gYHJlZmVyZW5jZXMgYSBsb2NhbCB2YXJpYWJsZWA7XG4gIH1cbiAgcmV0dXJuICdjb250YWlucyB0aGUgZXJyb3InO1xufVxuXG5mdW5jdGlvbiBtYXBTdHJpbmdNYXAoaW5wdXQ6IHtba2V5OiBzdHJpbmddOiBhbnl9LCB0cmFuc2Zvcm06ICh2YWx1ZTogYW55LCBrZXk6IHN0cmluZykgPT4gYW55KTpcbiAgICB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gIGlmICghaW5wdXQpIHJldHVybiB7fTtcbiAgY29uc3QgcmVzdWx0OiB7W2tleTogc3RyaW5nXTogYW55fSA9IHt9O1xuICBPYmplY3Qua2V5cyhpbnB1dCkuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgY29uc3QgdmFsdWUgPSB0cmFuc2Zvcm0oaW5wdXRba2V5XSwga2V5KTtcbiAgICBpZiAoIXNob3VsZElnbm9yZSh2YWx1ZSkpIHtcbiAgICAgIGlmIChISURERU5fS0VZLnRlc3Qoa2V5KSkge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkocmVzdWx0LCBrZXksIHtlbnVtZXJhYmxlOiBmYWxzZSwgY29uZmlndXJhYmxlOiB0cnVlLCB2YWx1ZTogdmFsdWV9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdFtrZXldID0gdmFsdWU7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gaXNQcmltaXRpdmUobzogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiBvID09PSBudWxsIHx8ICh0eXBlb2YgbyAhPT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgbyAhPT0gJ29iamVjdCcpO1xufVxuXG5pbnRlcmZhY2UgQmluZGluZ1Njb3BlQnVpbGRlciB7XG4gIGRlZmluZShuYW1lOiBzdHJpbmcsIHZhbHVlOiBhbnkpOiBCaW5kaW5nU2NvcGVCdWlsZGVyO1xuICBkb25lKCk6IEJpbmRpbmdTY29wZTtcbn1cblxuYWJzdHJhY3QgY2xhc3MgQmluZGluZ1Njb3BlIHtcbiAgYWJzdHJhY3QgcmVzb2x2ZShuYW1lOiBzdHJpbmcpOiBhbnk7XG4gIHB1YmxpYyBzdGF0aWMgbWlzc2luZyA9IHt9O1xuICBwdWJsaWMgc3RhdGljIGVtcHR5OiBCaW5kaW5nU2NvcGUgPSB7cmVzb2x2ZTogbmFtZSA9PiBCaW5kaW5nU2NvcGUubWlzc2luZ307XG5cbiAgcHVibGljIHN0YXRpYyBidWlsZCgpOiBCaW5kaW5nU2NvcGVCdWlsZGVyIHtcbiAgICBjb25zdCBjdXJyZW50ID0gbmV3IE1hcDxzdHJpbmcsIGFueT4oKTtcbiAgICByZXR1cm4ge1xuICAgICAgZGVmaW5lOiBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICAgICAgICBjdXJyZW50LnNldChuYW1lLCB2YWx1ZSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfSxcbiAgICAgIGRvbmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gY3VycmVudC5zaXplID4gMCA/IG5ldyBQb3B1bGF0ZWRTY29wZShjdXJyZW50KSA6IEJpbmRpbmdTY29wZS5lbXB0eTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG59XG5cbmNsYXNzIFBvcHVsYXRlZFNjb3BlIGV4dGVuZHMgQmluZGluZ1Njb3BlIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBiaW5kaW5nczogTWFwPHN0cmluZywgYW55Pikge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICByZXNvbHZlKG5hbWU6IHN0cmluZyk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMuYmluZGluZ3MuaGFzKG5hbWUpID8gdGhpcy5iaW5kaW5ncy5nZXQobmFtZSkgOiBCaW5kaW5nU2NvcGUubWlzc2luZztcbiAgfVxufVxuXG5mdW5jdGlvbiBmb3JtYXRNZXRhZGF0YU1lc3NhZ2VDaGFpbihcbiAgICBjaGFpbjogTWV0YWRhdGFNZXNzYWdlQ2hhaW4sIGFkdmlzZTogc3RyaW5nfHVuZGVmaW5lZCk6IEZvcm1hdHRlZE1lc3NhZ2VDaGFpbiB7XG4gIGNvbnN0IGV4cGFuZGVkID0gZXhwYW5kZWRNZXNzYWdlKGNoYWluLm1lc3NhZ2UsIGNoYWluLmNvbnRleHQpO1xuICBjb25zdCBuZXN0aW5nID0gY2hhaW4uc3ltYm9sID8gYCBpbiAnJHtjaGFpbi5zeW1ib2wubmFtZX0nYCA6ICcnO1xuICBjb25zdCBtZXNzYWdlID0gYCR7ZXhwYW5kZWR9JHtuZXN0aW5nfWA7XG4gIGNvbnN0IHBvc2l0aW9uID0gY2hhaW4ucG9zaXRpb247XG4gIGNvbnN0IG5leHQ6IEZvcm1hdHRlZE1lc3NhZ2VDaGFpbnx1bmRlZmluZWQgPSBjaGFpbi5uZXh0ID9cbiAgICAgIGZvcm1hdE1ldGFkYXRhTWVzc2FnZUNoYWluKGNoYWluLm5leHQsIGFkdmlzZSkgOlxuICAgICAgYWR2aXNlID8ge21lc3NhZ2U6IGFkdmlzZX0gOiB1bmRlZmluZWQ7XG4gIHJldHVybiB7bWVzc2FnZSwgcG9zaXRpb24sIG5leHQ6IG5leHQgPyBbbmV4dF0gOiB1bmRlZmluZWR9O1xufVxuXG5mdW5jdGlvbiBmb3JtYXRNZXRhZGF0YUVycm9yKGU6IEVycm9yLCBjb250ZXh0OiBTdGF0aWNTeW1ib2wpOiBFcnJvciB7XG4gIGlmIChpc01ldGFkYXRhRXJyb3IoZSkpIHtcbiAgICAvLyBQcm9kdWNlIGEgZm9ybWF0dGVkIHZlcnNpb24gb2YgdGhlIGFuZCBsZWF2aW5nIGVub3VnaCBpbmZvcm1hdGlvbiBpbiB0aGUgb3JpZ2luYWwgZXJyb3JcbiAgICAvLyB0byByZWNvdmVyIHRoZSBmb3JtYXR0aW5nIGluZm9ybWF0aW9uIHRvIGV2ZW50dWFsbHkgcHJvZHVjZSBhIGRpYWdub3N0aWMgZXJyb3IgbWVzc2FnZS5cbiAgICBjb25zdCBwb3NpdGlvbiA9IGUucG9zaXRpb247XG4gICAgY29uc3QgY2hhaW46IE1ldGFkYXRhTWVzc2FnZUNoYWluID0ge1xuICAgICAgbWVzc2FnZTogYEVycm9yIGR1cmluZyB0ZW1wbGF0ZSBjb21waWxlIG9mICcke2NvbnRleHQubmFtZX0nYCxcbiAgICAgIHBvc2l0aW9uOiBwb3NpdGlvbixcbiAgICAgIG5leHQ6IHttZXNzYWdlOiBlLm1lc3NhZ2UsIG5leHQ6IGUuY2hhaW4sIGNvbnRleHQ6IGUuY29udGV4dCwgc3ltYm9sOiBlLnN5bWJvbH1cbiAgICB9O1xuICAgIGNvbnN0IGFkdmlzZSA9IGUuYWR2aXNlIHx8IG1lc3NhZ2VBZHZpc2UoZS5tZXNzYWdlLCBlLmNvbnRleHQpO1xuICAgIHJldHVybiBmb3JtYXR0ZWRFcnJvcihmb3JtYXRNZXRhZGF0YU1lc3NhZ2VDaGFpbihjaGFpbiwgYWR2aXNlKSk7XG4gIH1cbiAgcmV0dXJuIGU7XG59XG4iXX0=