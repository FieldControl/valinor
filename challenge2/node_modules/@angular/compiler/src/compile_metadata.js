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
        define("@angular/compiler/src/compile_metadata", ["require", "exports", "@angular/compiler/src/aot/static_symbol", "@angular/compiler/src/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.templateJitUrl = exports.ngModuleJitUrl = exports.sharedStylesheetJitUrl = exports.templateSourceUrl = exports.flatten = exports.ProviderMeta = exports.TransitiveCompileNgModuleMetadata = exports.CompileNgModuleMetadata = exports.CompileShallowModuleMetadata = exports.CompilePipeMetadata = exports.CompileDirectiveMetadata = exports.CompileTemplateMetadata = exports.CompileStylesheetMetadata = exports.tokenReference = exports.tokenName = exports.CompileSummaryKind = exports.componentFactoryName = exports.hostViewClassName = exports.rendererTypeName = exports.viewClassName = exports.identifierModuleUrl = exports.identifierName = exports.sanitizeIdentifier = void 0;
    var static_symbol_1 = require("@angular/compiler/src/aot/static_symbol");
    var util_1 = require("@angular/compiler/src/util");
    // group 0: "[prop] or (event) or @trigger"
    // group 1: "prop" from "[prop]"
    // group 2: "event" from "(event)"
    // group 3: "@trigger" from "@trigger"
    var HOST_REG_EXP = /^(?:(?:\[([^\]]+)\])|(?:\(([^\)]+)\)))|(\@[-\w]+)$/;
    function sanitizeIdentifier(name) {
        return name.replace(/\W/g, '_');
    }
    exports.sanitizeIdentifier = sanitizeIdentifier;
    var _anonymousTypeIndex = 0;
    function identifierName(compileIdentifier) {
        if (!compileIdentifier || !compileIdentifier.reference) {
            return null;
        }
        var ref = compileIdentifier.reference;
        if (ref instanceof static_symbol_1.StaticSymbol) {
            return ref.name;
        }
        if (ref['__anonymousType']) {
            return ref['__anonymousType'];
        }
        if (ref['__forward_ref__']) {
            // We do not want to try to stringify a `forwardRef()` function because that would cause the
            // inner function to be evaluated too early, defeating the whole point of the `forwardRef`.
            return '__forward_ref__';
        }
        var identifier = util_1.stringify(ref);
        if (identifier.indexOf('(') >= 0) {
            // case: anonymous functions!
            identifier = "anonymous_" + _anonymousTypeIndex++;
            ref['__anonymousType'] = identifier;
        }
        else {
            identifier = sanitizeIdentifier(identifier);
        }
        return identifier;
    }
    exports.identifierName = identifierName;
    function identifierModuleUrl(compileIdentifier) {
        var ref = compileIdentifier.reference;
        if (ref instanceof static_symbol_1.StaticSymbol) {
            return ref.filePath;
        }
        // Runtime type
        return "./" + util_1.stringify(ref);
    }
    exports.identifierModuleUrl = identifierModuleUrl;
    function viewClassName(compType, embeddedTemplateIndex) {
        return "View_" + identifierName({ reference: compType }) + "_" + embeddedTemplateIndex;
    }
    exports.viewClassName = viewClassName;
    function rendererTypeName(compType) {
        return "RenderType_" + identifierName({ reference: compType });
    }
    exports.rendererTypeName = rendererTypeName;
    function hostViewClassName(compType) {
        return "HostView_" + identifierName({ reference: compType });
    }
    exports.hostViewClassName = hostViewClassName;
    function componentFactoryName(compType) {
        return identifierName({ reference: compType }) + "NgFactory";
    }
    exports.componentFactoryName = componentFactoryName;
    var CompileSummaryKind;
    (function (CompileSummaryKind) {
        CompileSummaryKind[CompileSummaryKind["Pipe"] = 0] = "Pipe";
        CompileSummaryKind[CompileSummaryKind["Directive"] = 1] = "Directive";
        CompileSummaryKind[CompileSummaryKind["NgModule"] = 2] = "NgModule";
        CompileSummaryKind[CompileSummaryKind["Injectable"] = 3] = "Injectable";
    })(CompileSummaryKind = exports.CompileSummaryKind || (exports.CompileSummaryKind = {}));
    function tokenName(token) {
        return token.value != null ? sanitizeIdentifier(token.value) : identifierName(token.identifier);
    }
    exports.tokenName = tokenName;
    function tokenReference(token) {
        if (token.identifier != null) {
            return token.identifier.reference;
        }
        else {
            return token.value;
        }
    }
    exports.tokenReference = tokenReference;
    /**
     * Metadata about a stylesheet
     */
    var CompileStylesheetMetadata = /** @class */ (function () {
        function CompileStylesheetMetadata(_a) {
            var _b = _a === void 0 ? {} : _a, moduleUrl = _b.moduleUrl, styles = _b.styles, styleUrls = _b.styleUrls;
            this.moduleUrl = moduleUrl || null;
            this.styles = _normalizeArray(styles);
            this.styleUrls = _normalizeArray(styleUrls);
        }
        return CompileStylesheetMetadata;
    }());
    exports.CompileStylesheetMetadata = CompileStylesheetMetadata;
    /**
     * Metadata regarding compilation of a template.
     */
    var CompileTemplateMetadata = /** @class */ (function () {
        function CompileTemplateMetadata(_a) {
            var encapsulation = _a.encapsulation, template = _a.template, templateUrl = _a.templateUrl, htmlAst = _a.htmlAst, styles = _a.styles, styleUrls = _a.styleUrls, externalStylesheets = _a.externalStylesheets, animations = _a.animations, ngContentSelectors = _a.ngContentSelectors, interpolation = _a.interpolation, isInline = _a.isInline, preserveWhitespaces = _a.preserveWhitespaces;
            this.encapsulation = encapsulation;
            this.template = template;
            this.templateUrl = templateUrl;
            this.htmlAst = htmlAst;
            this.styles = _normalizeArray(styles);
            this.styleUrls = _normalizeArray(styleUrls);
            this.externalStylesheets = _normalizeArray(externalStylesheets);
            this.animations = animations ? flatten(animations) : [];
            this.ngContentSelectors = ngContentSelectors || [];
            if (interpolation && interpolation.length != 2) {
                throw new Error("'interpolation' should have a start and an end symbol.");
            }
            this.interpolation = interpolation;
            this.isInline = isInline;
            this.preserveWhitespaces = preserveWhitespaces;
        }
        CompileTemplateMetadata.prototype.toSummary = function () {
            return {
                ngContentSelectors: this.ngContentSelectors,
                encapsulation: this.encapsulation,
                styles: this.styles,
                animations: this.animations
            };
        };
        return CompileTemplateMetadata;
    }());
    exports.CompileTemplateMetadata = CompileTemplateMetadata;
    /**
     * Metadata regarding compilation of a directive.
     */
    var CompileDirectiveMetadata = /** @class */ (function () {
        function CompileDirectiveMetadata(_a) {
            var isHost = _a.isHost, type = _a.type, isComponent = _a.isComponent, selector = _a.selector, exportAs = _a.exportAs, changeDetection = _a.changeDetection, inputs = _a.inputs, outputs = _a.outputs, hostListeners = _a.hostListeners, hostProperties = _a.hostProperties, hostAttributes = _a.hostAttributes, providers = _a.providers, viewProviders = _a.viewProviders, queries = _a.queries, guards = _a.guards, viewQueries = _a.viewQueries, entryComponents = _a.entryComponents, template = _a.template, componentViewType = _a.componentViewType, rendererType = _a.rendererType, componentFactory = _a.componentFactory;
            this.isHost = !!isHost;
            this.type = type;
            this.isComponent = isComponent;
            this.selector = selector;
            this.exportAs = exportAs;
            this.changeDetection = changeDetection;
            this.inputs = inputs;
            this.outputs = outputs;
            this.hostListeners = hostListeners;
            this.hostProperties = hostProperties;
            this.hostAttributes = hostAttributes;
            this.providers = _normalizeArray(providers);
            this.viewProviders = _normalizeArray(viewProviders);
            this.queries = _normalizeArray(queries);
            this.guards = guards;
            this.viewQueries = _normalizeArray(viewQueries);
            this.entryComponents = _normalizeArray(entryComponents);
            this.template = template;
            this.componentViewType = componentViewType;
            this.rendererType = rendererType;
            this.componentFactory = componentFactory;
        }
        CompileDirectiveMetadata.create = function (_a) {
            var isHost = _a.isHost, type = _a.type, isComponent = _a.isComponent, selector = _a.selector, exportAs = _a.exportAs, changeDetection = _a.changeDetection, inputs = _a.inputs, outputs = _a.outputs, host = _a.host, providers = _a.providers, viewProviders = _a.viewProviders, queries = _a.queries, guards = _a.guards, viewQueries = _a.viewQueries, entryComponents = _a.entryComponents, template = _a.template, componentViewType = _a.componentViewType, rendererType = _a.rendererType, componentFactory = _a.componentFactory;
            var hostListeners = {};
            var hostProperties = {};
            var hostAttributes = {};
            if (host != null) {
                Object.keys(host).forEach(function (key) {
                    var value = host[key];
                    var matches = key.match(HOST_REG_EXP);
                    if (matches === null) {
                        hostAttributes[key] = value;
                    }
                    else if (matches[1] != null) {
                        hostProperties[matches[1]] = value;
                    }
                    else if (matches[2] != null) {
                        hostListeners[matches[2]] = value;
                    }
                });
            }
            var inputsMap = {};
            if (inputs != null) {
                inputs.forEach(function (bindConfig) {
                    // canonical syntax: `dirProp: elProp`
                    // if there is no `:`, use dirProp = elProp
                    var parts = util_1.splitAtColon(bindConfig, [bindConfig, bindConfig]);
                    inputsMap[parts[0]] = parts[1];
                });
            }
            var outputsMap = {};
            if (outputs != null) {
                outputs.forEach(function (bindConfig) {
                    // canonical syntax: `dirProp: elProp`
                    // if there is no `:`, use dirProp = elProp
                    var parts = util_1.splitAtColon(bindConfig, [bindConfig, bindConfig]);
                    outputsMap[parts[0]] = parts[1];
                });
            }
            return new CompileDirectiveMetadata({
                isHost: isHost,
                type: type,
                isComponent: !!isComponent,
                selector: selector,
                exportAs: exportAs,
                changeDetection: changeDetection,
                inputs: inputsMap,
                outputs: outputsMap,
                hostListeners: hostListeners,
                hostProperties: hostProperties,
                hostAttributes: hostAttributes,
                providers: providers,
                viewProviders: viewProviders,
                queries: queries,
                guards: guards,
                viewQueries: viewQueries,
                entryComponents: entryComponents,
                template: template,
                componentViewType: componentViewType,
                rendererType: rendererType,
                componentFactory: componentFactory,
            });
        };
        CompileDirectiveMetadata.prototype.toSummary = function () {
            return {
                summaryKind: CompileSummaryKind.Directive,
                type: this.type,
                isComponent: this.isComponent,
                selector: this.selector,
                exportAs: this.exportAs,
                inputs: this.inputs,
                outputs: this.outputs,
                hostListeners: this.hostListeners,
                hostProperties: this.hostProperties,
                hostAttributes: this.hostAttributes,
                providers: this.providers,
                viewProviders: this.viewProviders,
                queries: this.queries,
                guards: this.guards,
                viewQueries: this.viewQueries,
                entryComponents: this.entryComponents,
                changeDetection: this.changeDetection,
                template: this.template && this.template.toSummary(),
                componentViewType: this.componentViewType,
                rendererType: this.rendererType,
                componentFactory: this.componentFactory
            };
        };
        return CompileDirectiveMetadata;
    }());
    exports.CompileDirectiveMetadata = CompileDirectiveMetadata;
    var CompilePipeMetadata = /** @class */ (function () {
        function CompilePipeMetadata(_a) {
            var type = _a.type, name = _a.name, pure = _a.pure;
            this.type = type;
            this.name = name;
            this.pure = !!pure;
        }
        CompilePipeMetadata.prototype.toSummary = function () {
            return {
                summaryKind: CompileSummaryKind.Pipe,
                type: this.type,
                name: this.name,
                pure: this.pure
            };
        };
        return CompilePipeMetadata;
    }());
    exports.CompilePipeMetadata = CompilePipeMetadata;
    var CompileShallowModuleMetadata = /** @class */ (function () {
        function CompileShallowModuleMetadata() {
        }
        return CompileShallowModuleMetadata;
    }());
    exports.CompileShallowModuleMetadata = CompileShallowModuleMetadata;
    /**
     * Metadata regarding compilation of a module.
     */
    var CompileNgModuleMetadata = /** @class */ (function () {
        function CompileNgModuleMetadata(_a) {
            var type = _a.type, providers = _a.providers, declaredDirectives = _a.declaredDirectives, exportedDirectives = _a.exportedDirectives, declaredPipes = _a.declaredPipes, exportedPipes = _a.exportedPipes, entryComponents = _a.entryComponents, bootstrapComponents = _a.bootstrapComponents, importedModules = _a.importedModules, exportedModules = _a.exportedModules, schemas = _a.schemas, transitiveModule = _a.transitiveModule, id = _a.id;
            this.type = type || null;
            this.declaredDirectives = _normalizeArray(declaredDirectives);
            this.exportedDirectives = _normalizeArray(exportedDirectives);
            this.declaredPipes = _normalizeArray(declaredPipes);
            this.exportedPipes = _normalizeArray(exportedPipes);
            this.providers = _normalizeArray(providers);
            this.entryComponents = _normalizeArray(entryComponents);
            this.bootstrapComponents = _normalizeArray(bootstrapComponents);
            this.importedModules = _normalizeArray(importedModules);
            this.exportedModules = _normalizeArray(exportedModules);
            this.schemas = _normalizeArray(schemas);
            this.id = id || null;
            this.transitiveModule = transitiveModule || null;
        }
        CompileNgModuleMetadata.prototype.toSummary = function () {
            var module = this.transitiveModule;
            return {
                summaryKind: CompileSummaryKind.NgModule,
                type: this.type,
                entryComponents: module.entryComponents,
                providers: module.providers,
                modules: module.modules,
                exportedDirectives: module.exportedDirectives,
                exportedPipes: module.exportedPipes
            };
        };
        return CompileNgModuleMetadata;
    }());
    exports.CompileNgModuleMetadata = CompileNgModuleMetadata;
    var TransitiveCompileNgModuleMetadata = /** @class */ (function () {
        function TransitiveCompileNgModuleMetadata() {
            this.directivesSet = new Set();
            this.directives = [];
            this.exportedDirectivesSet = new Set();
            this.exportedDirectives = [];
            this.pipesSet = new Set();
            this.pipes = [];
            this.exportedPipesSet = new Set();
            this.exportedPipes = [];
            this.modulesSet = new Set();
            this.modules = [];
            this.entryComponentsSet = new Set();
            this.entryComponents = [];
            this.providers = [];
        }
        TransitiveCompileNgModuleMetadata.prototype.addProvider = function (provider, module) {
            this.providers.push({ provider: provider, module: module });
        };
        TransitiveCompileNgModuleMetadata.prototype.addDirective = function (id) {
            if (!this.directivesSet.has(id.reference)) {
                this.directivesSet.add(id.reference);
                this.directives.push(id);
            }
        };
        TransitiveCompileNgModuleMetadata.prototype.addExportedDirective = function (id) {
            if (!this.exportedDirectivesSet.has(id.reference)) {
                this.exportedDirectivesSet.add(id.reference);
                this.exportedDirectives.push(id);
            }
        };
        TransitiveCompileNgModuleMetadata.prototype.addPipe = function (id) {
            if (!this.pipesSet.has(id.reference)) {
                this.pipesSet.add(id.reference);
                this.pipes.push(id);
            }
        };
        TransitiveCompileNgModuleMetadata.prototype.addExportedPipe = function (id) {
            if (!this.exportedPipesSet.has(id.reference)) {
                this.exportedPipesSet.add(id.reference);
                this.exportedPipes.push(id);
            }
        };
        TransitiveCompileNgModuleMetadata.prototype.addModule = function (id) {
            if (!this.modulesSet.has(id.reference)) {
                this.modulesSet.add(id.reference);
                this.modules.push(id);
            }
        };
        TransitiveCompileNgModuleMetadata.prototype.addEntryComponent = function (ec) {
            if (!this.entryComponentsSet.has(ec.componentType)) {
                this.entryComponentsSet.add(ec.componentType);
                this.entryComponents.push(ec);
            }
        };
        return TransitiveCompileNgModuleMetadata;
    }());
    exports.TransitiveCompileNgModuleMetadata = TransitiveCompileNgModuleMetadata;
    function _normalizeArray(obj) {
        return obj || [];
    }
    var ProviderMeta = /** @class */ (function () {
        function ProviderMeta(token, _a) {
            var useClass = _a.useClass, useValue = _a.useValue, useExisting = _a.useExisting, useFactory = _a.useFactory, deps = _a.deps, multi = _a.multi;
            this.token = token;
            this.useClass = useClass || null;
            this.useValue = useValue;
            this.useExisting = useExisting;
            this.useFactory = useFactory || null;
            this.dependencies = deps || null;
            this.multi = !!multi;
        }
        return ProviderMeta;
    }());
    exports.ProviderMeta = ProviderMeta;
    function flatten(list) {
        return list.reduce(function (flat, item) {
            var flatItem = Array.isArray(item) ? flatten(item) : item;
            return flat.concat(flatItem);
        }, []);
    }
    exports.flatten = flatten;
    function jitSourceUrl(url) {
        // Note: We need 3 "/" so that ng shows up as a separate domain
        // in the chrome dev tools.
        return url.replace(/(\w+:\/\/[\w:-]+)?(\/+)?/, 'ng:///');
    }
    function templateSourceUrl(ngModuleType, compMeta, templateMeta) {
        var url;
        if (templateMeta.isInline) {
            if (compMeta.type.reference instanceof static_symbol_1.StaticSymbol) {
                // Note: a .ts file might contain multiple components with inline templates,
                // so we need to give them unique urls, as these will be used for sourcemaps.
                url = compMeta.type.reference.filePath + "." + compMeta.type.reference.name + ".html";
            }
            else {
                url = identifierName(ngModuleType) + "/" + identifierName(compMeta.type) + ".html";
            }
        }
        else {
            url = templateMeta.templateUrl;
        }
        return compMeta.type.reference instanceof static_symbol_1.StaticSymbol ? url : jitSourceUrl(url);
    }
    exports.templateSourceUrl = templateSourceUrl;
    function sharedStylesheetJitUrl(meta, id) {
        var pathParts = meta.moduleUrl.split(/\/\\/g);
        var baseName = pathParts[pathParts.length - 1];
        return jitSourceUrl("css/" + id + baseName + ".ngstyle.js");
    }
    exports.sharedStylesheetJitUrl = sharedStylesheetJitUrl;
    function ngModuleJitUrl(moduleMeta) {
        return jitSourceUrl(identifierName(moduleMeta.type) + "/module.ngfactory.js");
    }
    exports.ngModuleJitUrl = ngModuleJitUrl;
    function templateJitUrl(ngModuleType, compMeta) {
        return jitSourceUrl(identifierName(ngModuleType) + "/" + identifierName(compMeta.type) + ".ngfactory.js");
    }
    exports.templateJitUrl = templateJitUrl;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsZV9tZXRhZGF0YS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9jb21waWxlX21ldGFkYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUVILHlFQUFpRDtJQUlqRCxtREFBK0M7SUFFL0MsMkNBQTJDO0lBQzNDLGdDQUFnQztJQUNoQyxrQ0FBa0M7SUFDbEMsc0NBQXNDO0lBQ3RDLElBQU0sWUFBWSxHQUFHLG9EQUFvRCxDQUFDO0lBRTFFLFNBQWdCLGtCQUFrQixDQUFDLElBQVk7UUFDN0MsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBRkQsZ0RBRUM7SUFFRCxJQUFJLG1CQUFtQixHQUFHLENBQUMsQ0FBQztJQUU1QixTQUFnQixjQUFjLENBQUMsaUJBQTJEO1FBRXhGLElBQUksQ0FBQyxpQkFBaUIsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsRUFBRTtZQUN0RCxPQUFPLElBQUksQ0FBQztTQUNiO1FBQ0QsSUFBTSxHQUFHLEdBQUcsaUJBQWlCLENBQUMsU0FBUyxDQUFDO1FBQ3hDLElBQUksR0FBRyxZQUFZLDRCQUFZLEVBQUU7WUFDL0IsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDO1NBQ2pCO1FBQ0QsSUFBSSxHQUFHLENBQUMsaUJBQWlCLENBQUMsRUFBRTtZQUMxQixPQUFPLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1NBQy9CO1FBQ0QsSUFBSSxHQUFHLENBQUMsaUJBQWlCLENBQUMsRUFBRTtZQUMxQiw0RkFBNEY7WUFDNUYsMkZBQTJGO1lBQzNGLE9BQU8saUJBQWlCLENBQUM7U0FDMUI7UUFDRCxJQUFJLFVBQVUsR0FBRyxnQkFBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2hDLElBQUksVUFBVSxDQUFDLE9BQU8sQ0FB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QUFZLENBQ1osY0FBYyxDQUFDLFlBQVksQ0FBQyxTQUFJLGNBQWMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGtCQUFlLENBQUMsQ0FBQztJQUN2RixDQUFDO0lBSkQsd0NBSUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtTdGF0aWNTeW1ib2x9IGZyb20gJy4vYW90L3N0YXRpY19zeW1ib2wnO1xuaW1wb3J0IHtDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSwgU2NoZW1hTWV0YWRhdGEsIFR5cGUsIFZpZXdFbmNhcHN1bGF0aW9ufSBmcm9tICcuL2NvcmUnO1xuaW1wb3J0IHtMaWZlY3ljbGVIb29rc30gZnJvbSAnLi9saWZlY3ljbGVfcmVmbGVjdG9yJztcbmltcG9ydCB7UGFyc2VUcmVlUmVzdWx0IGFzIEh0bWxQYXJzZVRyZWVSZXN1bHR9IGZyb20gJy4vbWxfcGFyc2VyL3BhcnNlcic7XG5pbXBvcnQge3NwbGl0QXRDb2xvbiwgc3RyaW5naWZ5fSBmcm9tICcuL3V0aWwnO1xuXG4vLyBncm91cCAwOiBcIltwcm9wXSBvciAoZXZlbnQpIG9yIEB0cmlnZ2VyXCJcbi8vIGdyb3VwIDE6IFwicHJvcFwiIGZyb20gXCJbcHJvcF1cIlxuLy8gZ3JvdXAgMjogXCJldmVudFwiIGZyb20gXCIoZXZlbnQpXCJcbi8vIGdyb3VwIDM6IFwiQHRyaWdnZXJcIiBmcm9tIFwiQHRyaWdnZXJcIlxuY29uc3QgSE9TVF9SRUdfRVhQID0gL14oPzooPzpcXFsoW15cXF1dKylcXF0pfCg/OlxcKChbXlxcKV0rKVxcKSkpfChcXEBbLVxcd10rKSQvO1xuXG5leHBvcnQgZnVuY3Rpb24gc2FuaXRpemVJZGVudGlmaWVyKG5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBuYW1lLnJlcGxhY2UoL1xcVy9nLCAnXycpO1xufVxuXG5sZXQgX2Fub255bW91c1R5cGVJbmRleCA9IDA7XG5cbmV4cG9ydCBmdW5jdGlvbiBpZGVudGlmaWVyTmFtZShjb21waWxlSWRlbnRpZmllcjogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YXxudWxsfHVuZGVmaW5lZCk6IHN0cmluZ3xcbiAgICBudWxsIHtcbiAgaWYgKCFjb21waWxlSWRlbnRpZmllciB8fCAhY29tcGlsZUlkZW50aWZpZXIucmVmZXJlbmNlKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgY29uc3QgcmVmID0gY29tcGlsZUlkZW50aWZpZXIucmVmZXJlbmNlO1xuICBpZiAocmVmIGluc3RhbmNlb2YgU3RhdGljU3ltYm9sKSB7XG4gICAgcmV0dXJuIHJlZi5uYW1lO1xuICB9XG4gIGlmIChyZWZbJ19fYW5vbnltb3VzVHlwZSddKSB7XG4gICAgcmV0dXJuIHJlZlsnX19hbm9ueW1vdXNUeXBlJ107XG4gIH1cbiAgaWYgKHJlZlsnX19mb3J3YXJkX3JlZl9fJ10pIHtcbiAgICAvLyBXZSBkbyBub3Qgd2FudCB0byB0cnkgdG8gc3RyaW5naWZ5IGEgYGZvcndhcmRSZWYoKWAgZnVuY3Rpb24gYmVjYXVzZSB0aGF0IHdvdWxkIGNhdXNlIHRoZVxuICAgIC8vIGlubmVyIGZ1bmN0aW9uIHRvIGJlIGV2YWx1YXRlZCB0b28gZWFybHksIGRlZmVhdGluZyB0aGUgd2hvbGUgcG9pbnQgb2YgdGhlIGBmb3J3YXJkUmVmYC5cbiAgICByZXR1cm4gJ19fZm9yd2FyZF9yZWZfXyc7XG4gIH1cbiAgbGV0IGlkZW50aWZpZXIgPSBzdHJpbmdpZnkocmVmKTtcbiAgaWYgKGlkZW50aWZpZXIuaW5kZXhPZignKCcpID49IDApIHtcbiAgICAvLyBjYXNlOiBhbm9ueW1vdXMgZnVuY3Rpb25zIVxuICAgIGlkZW50aWZpZXIgPSBgYW5vbnltb3VzXyR7X2Fub255bW91c1R5cGVJbmRleCsrfWA7XG4gICAgcmVmWydfX2Fub255bW91c1R5cGUnXSA9IGlkZW50aWZpZXI7XG4gIH0gZWxzZSB7XG4gICAgaWRlbnRpZmllciA9IHNhbml0aXplSWRlbnRpZmllcihpZGVudGlmaWVyKTtcbiAgfVxuICByZXR1cm4gaWRlbnRpZmllcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlkZW50aWZpZXJNb2R1bGVVcmwoY29tcGlsZUlkZW50aWZpZXI6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEpOiBzdHJpbmcge1xuICBjb25zdCByZWYgPSBjb21waWxlSWRlbnRpZmllci5yZWZlcmVuY2U7XG4gIGlmIChyZWYgaW5zdGFuY2VvZiBTdGF0aWNTeW1ib2wpIHtcbiAgICByZXR1cm4gcmVmLmZpbGVQYXRoO1xuICB9XG4gIC8vIFJ1bnRpbWUgdHlwZVxuICByZXR1cm4gYC4vJHtzdHJpbmdpZnkocmVmKX1gO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdmlld0NsYXNzTmFtZShjb21wVHlwZTogYW55LCBlbWJlZGRlZFRlbXBsYXRlSW5kZXg6IG51bWJlcik6IHN0cmluZyB7XG4gIHJldHVybiBgVmlld18ke2lkZW50aWZpZXJOYW1lKHtyZWZlcmVuY2U6IGNvbXBUeXBlfSl9XyR7ZW1iZWRkZWRUZW1wbGF0ZUluZGV4fWA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJlclR5cGVOYW1lKGNvbXBUeXBlOiBhbnkpOiBzdHJpbmcge1xuICByZXR1cm4gYFJlbmRlclR5cGVfJHtpZGVudGlmaWVyTmFtZSh7cmVmZXJlbmNlOiBjb21wVHlwZX0pfWA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBob3N0Vmlld0NsYXNzTmFtZShjb21wVHlwZTogYW55KTogc3RyaW5nIHtcbiAgcmV0dXJuIGBIb3N0Vmlld18ke2lkZW50aWZpZXJOYW1lKHtyZWZlcmVuY2U6IGNvbXBUeXBlfSl9YDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBvbmVudEZhY3RvcnlOYW1lKGNvbXBUeXBlOiBhbnkpOiBzdHJpbmcge1xuICByZXR1cm4gYCR7aWRlbnRpZmllck5hbWUoe3JlZmVyZW5jZTogY29tcFR5cGV9KX1OZ0ZhY3RvcnlgO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFByb3h5Q2xhc3Mge1xuICBzZXREZWxlZ2F0ZShkZWxlZ2F0ZTogYW55KTogdm9pZDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhIHtcbiAgcmVmZXJlbmNlOiBhbnk7XG59XG5cbmV4cG9ydCBlbnVtIENvbXBpbGVTdW1tYXJ5S2luZCB7XG4gIFBpcGUsXG4gIERpcmVjdGl2ZSxcbiAgTmdNb2R1bGUsXG4gIEluamVjdGFibGVcbn1cblxuLyoqXG4gKiBBIENvbXBpbGVTdW1tYXJ5IGlzIHRoZSBkYXRhIG5lZWRlZCB0byB1c2UgYSBkaXJlY3RpdmUgLyBwaXBlIC8gbW9kdWxlXG4gKiBpbiBvdGhlciBtb2R1bGVzIC8gY29tcG9uZW50cy4gSG93ZXZlciwgdGhpcyBkYXRhIGlzIG5vdCBlbm91Z2ggdG8gY29tcGlsZVxuICogdGhlIGRpcmVjdGl2ZSAvIG1vZHVsZSBpdHNlbGYuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29tcGlsZVR5cGVTdW1tYXJ5IHtcbiAgc3VtbWFyeUtpbmQ6IENvbXBpbGVTdW1tYXJ5S2luZHxudWxsO1xuICB0eXBlOiBDb21waWxlVHlwZU1ldGFkYXRhO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIENvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YSB7XG4gIGlzQXR0cmlidXRlPzogYm9vbGVhbjtcbiAgaXNTZWxmPzogYm9vbGVhbjtcbiAgaXNIb3N0PzogYm9vbGVhbjtcbiAgaXNTa2lwU2VsZj86IGJvb2xlYW47XG4gIGlzT3B0aW9uYWw/OiBib29sZWFuO1xuICBpc1ZhbHVlPzogYm9vbGVhbjtcbiAgdG9rZW4/OiBDb21waWxlVG9rZW5NZXRhZGF0YTtcbiAgdmFsdWU/OiBhbnk7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29tcGlsZVByb3ZpZGVyTWV0YWRhdGEge1xuICB0b2tlbjogQ29tcGlsZVRva2VuTWV0YWRhdGE7XG4gIHVzZUNsYXNzPzogQ29tcGlsZVR5cGVNZXRhZGF0YTtcbiAgdXNlVmFsdWU/OiBhbnk7XG4gIHVzZUV4aXN0aW5nPzogQ29tcGlsZVRva2VuTWV0YWRhdGE7XG4gIHVzZUZhY3Rvcnk/OiBDb21waWxlRmFjdG9yeU1ldGFkYXRhO1xuICBkZXBzPzogQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhW107XG4gIG11bHRpPzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDb21waWxlRmFjdG9yeU1ldGFkYXRhIGV4dGVuZHMgQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSB7XG4gIGRpRGVwczogQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhW107XG4gIHJlZmVyZW5jZTogYW55O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdG9rZW5OYW1lKHRva2VuOiBDb21waWxlVG9rZW5NZXRhZGF0YSkge1xuICByZXR1cm4gdG9rZW4udmFsdWUgIT0gbnVsbCA/IHNhbml0aXplSWRlbnRpZmllcih0b2tlbi52YWx1ZSkgOiBpZGVudGlmaWVyTmFtZSh0b2tlbi5pZGVudGlmaWVyKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRva2VuUmVmZXJlbmNlKHRva2VuOiBDb21waWxlVG9rZW5NZXRhZGF0YSkge1xuICBpZiAodG9rZW4uaWRlbnRpZmllciAhPSBudWxsKSB7XG4gICAgcmV0dXJuIHRva2VuLmlkZW50aWZpZXIucmVmZXJlbmNlO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB0b2tlbi52YWx1ZTtcbiAgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIENvbXBpbGVUb2tlbk1ldGFkYXRhIHtcbiAgdmFsdWU/OiBhbnk7XG4gIGlkZW50aWZpZXI/OiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhfENvbXBpbGVUeXBlTWV0YWRhdGE7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29tcGlsZUluamVjdGFibGVNZXRhZGF0YSB7XG4gIHN5bWJvbDogU3RhdGljU3ltYm9sO1xuICB0eXBlOiBDb21waWxlVHlwZU1ldGFkYXRhO1xuXG4gIHByb3ZpZGVkSW4/OiBTdGF0aWNTeW1ib2w7XG5cbiAgdXNlVmFsdWU/OiBhbnk7XG4gIHVzZUNsYXNzPzogU3RhdGljU3ltYm9sO1xuICB1c2VFeGlzdGluZz86IFN0YXRpY1N5bWJvbDtcbiAgdXNlRmFjdG9yeT86IFN0YXRpY1N5bWJvbDtcbiAgZGVwcz86IGFueVtdO1xufVxuXG4vKipcbiAqIE1ldGFkYXRhIHJlZ2FyZGluZyBjb21waWxhdGlvbiBvZiBhIHR5cGUuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29tcGlsZVR5cGVNZXRhZGF0YSBleHRlbmRzIENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEge1xuICBkaURlcHM6IENvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YVtdO1xuICBsaWZlY3ljbGVIb29rczogTGlmZWN5Y2xlSG9va3NbXTtcbiAgcmVmZXJlbmNlOiBhbnk7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29tcGlsZVF1ZXJ5TWV0YWRhdGEge1xuICBzZWxlY3RvcnM6IEFycmF5PENvbXBpbGVUb2tlbk1ldGFkYXRhPjtcbiAgZGVzY2VuZGFudHM6IGJvb2xlYW47XG4gIGZpcnN0OiBib29sZWFuO1xuICBwcm9wZXJ0eU5hbWU6IHN0cmluZztcbiAgcmVhZDogQ29tcGlsZVRva2VuTWV0YWRhdGE7XG4gIHN0YXRpYz86IGJvb2xlYW47XG4gIGVtaXREaXN0aW5jdENoYW5nZXNPbmx5PzogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBNZXRhZGF0YSBhYm91dCBhIHN0eWxlc2hlZXRcbiAqL1xuZXhwb3J0IGNsYXNzIENvbXBpbGVTdHlsZXNoZWV0TWV0YWRhdGEge1xuICBtb2R1bGVVcmw6IHN0cmluZ3xudWxsO1xuICBzdHlsZXM6IHN0cmluZ1tdO1xuICBzdHlsZVVybHM6IHN0cmluZ1tdO1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHttb2R1bGVVcmwsIHN0eWxlcywgc3R5bGVVcmxzfTpcbiAgICAgICAgICB7bW9kdWxlVXJsPzogc3RyaW5nLCBzdHlsZXM/OiBzdHJpbmdbXSwgc3R5bGVVcmxzPzogc3RyaW5nW119ID0ge30pIHtcbiAgICB0aGlzLm1vZHVsZVVybCA9IG1vZHVsZVVybCB8fCBudWxsO1xuICAgIHRoaXMuc3R5bGVzID0gX25vcm1hbGl6ZUFycmF5KHN0eWxlcyk7XG4gICAgdGhpcy5zdHlsZVVybHMgPSBfbm9ybWFsaXplQXJyYXkoc3R5bGVVcmxzKTtcbiAgfVxufVxuXG4vKipcbiAqIFN1bW1hcnkgTWV0YWRhdGEgcmVnYXJkaW5nIGNvbXBpbGF0aW9uIG9mIGEgdGVtcGxhdGUuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29tcGlsZVRlbXBsYXRlU3VtbWFyeSB7XG4gIG5nQ29udGVudFNlbGVjdG9yczogc3RyaW5nW107XG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9ufG51bGw7XG4gIHN0eWxlczogc3RyaW5nW107XG4gIGFuaW1hdGlvbnM6IGFueVtdfG51bGw7XG59XG5cbi8qKlxuICogTWV0YWRhdGEgcmVnYXJkaW5nIGNvbXBpbGF0aW9uIG9mIGEgdGVtcGxhdGUuXG4gKi9cbmV4cG9ydCBjbGFzcyBDb21waWxlVGVtcGxhdGVNZXRhZGF0YSB7XG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9ufG51bGw7XG4gIHRlbXBsYXRlOiBzdHJpbmd8bnVsbDtcbiAgdGVtcGxhdGVVcmw6IHN0cmluZ3xudWxsO1xuICBodG1sQXN0OiBIdG1sUGFyc2VUcmVlUmVzdWx0fG51bGw7XG4gIGlzSW5saW5lOiBib29sZWFuO1xuICBzdHlsZXM6IHN0cmluZ1tdO1xuICBzdHlsZVVybHM6IHN0cmluZ1tdO1xuICBleHRlcm5hbFN0eWxlc2hlZXRzOiBDb21waWxlU3R5bGVzaGVldE1ldGFkYXRhW107XG4gIGFuaW1hdGlvbnM6IGFueVtdO1xuICBuZ0NvbnRlbnRTZWxlY3RvcnM6IHN0cmluZ1tdO1xuICBpbnRlcnBvbGF0aW9uOiBbc3RyaW5nLCBzdHJpbmddfG51bGw7XG4gIHByZXNlcnZlV2hpdGVzcGFjZXM6IGJvb2xlYW47XG4gIGNvbnN0cnVjdG9yKHtcbiAgICBlbmNhcHN1bGF0aW9uLFxuICAgIHRlbXBsYXRlLFxuICAgIHRlbXBsYXRlVXJsLFxuICAgIGh0bWxBc3QsXG4gICAgc3R5bGVzLFxuICAgIHN0eWxlVXJscyxcbiAgICBleHRlcm5hbFN0eWxlc2hlZXRzLFxuICAgIGFuaW1hdGlvbnMsXG4gICAgbmdDb250ZW50U2VsZWN0b3JzLFxuICAgIGludGVycG9sYXRpb24sXG4gICAgaXNJbmxpbmUsXG4gICAgcHJlc2VydmVXaGl0ZXNwYWNlc1xuICB9OiB7XG4gICAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb258bnVsbCxcbiAgICB0ZW1wbGF0ZTogc3RyaW5nfG51bGwsXG4gICAgdGVtcGxhdGVVcmw6IHN0cmluZ3xudWxsLFxuICAgIGh0bWxBc3Q6IEh0bWxQYXJzZVRyZWVSZXN1bHR8bnVsbCxcbiAgICBzdHlsZXM6IHN0cmluZ1tdLFxuICAgIHN0eWxlVXJsczogc3RyaW5nW10sXG4gICAgZXh0ZXJuYWxTdHlsZXNoZWV0czogQ29tcGlsZVN0eWxlc2hlZXRNZXRhZGF0YVtdLFxuICAgIG5nQ29udGVudFNlbGVjdG9yczogc3RyaW5nW10sXG4gICAgYW5pbWF0aW9uczogYW55W10sXG4gICAgaW50ZXJwb2xhdGlvbjogW3N0cmluZywgc3RyaW5nXXxudWxsLFxuICAgIGlzSW5saW5lOiBib29sZWFuLFxuICAgIHByZXNlcnZlV2hpdGVzcGFjZXM6IGJvb2xlYW5cbiAgfSkge1xuICAgIHRoaXMuZW5jYXBzdWxhdGlvbiA9IGVuY2Fwc3VsYXRpb247XG4gICAgdGhpcy50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xuICAgIHRoaXMudGVtcGxhdGVVcmwgPSB0ZW1wbGF0ZVVybDtcbiAgICB0aGlzLmh0bWxBc3QgPSBodG1sQXN0O1xuICAgIHRoaXMuc3R5bGVzID0gX25vcm1hbGl6ZUFycmF5KHN0eWxlcyk7XG4gICAgdGhpcy5zdHlsZVVybHMgPSBfbm9ybWFsaXplQXJyYXkoc3R5bGVVcmxzKTtcbiAgICB0aGlzLmV4dGVybmFsU3R5bGVzaGVldHMgPSBfbm9ybWFsaXplQXJyYXkoZXh0ZXJuYWxTdHlsZXNoZWV0cyk7XG4gICAgdGhpcy5hbmltYXRpb25zID0gYW5pbWF0aW9ucyA/IGZsYXR0ZW4oYW5pbWF0aW9ucykgOiBbXTtcbiAgICB0aGlzLm5nQ29udGVudFNlbGVjdG9ycyA9IG5nQ29udGVudFNlbGVjdG9ycyB8fCBbXTtcbiAgICBpZiAoaW50ZXJwb2xhdGlvbiAmJiBpbnRlcnBvbGF0aW9uLmxlbmd0aCAhPSAyKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYCdpbnRlcnBvbGF0aW9uJyBzaG91bGQgaGF2ZSBhIHN0YXJ0IGFuZCBhbiBlbmQgc3ltYm9sLmApO1xuICAgIH1cbiAgICB0aGlzLmludGVycG9sYXRpb24gPSBpbnRlcnBvbGF0aW9uO1xuICAgIHRoaXMuaXNJbmxpbmUgPSBpc0lubGluZTtcbiAgICB0aGlzLnByZXNlcnZlV2hpdGVzcGFjZXMgPSBwcmVzZXJ2ZVdoaXRlc3BhY2VzO1xuICB9XG5cbiAgdG9TdW1tYXJ5KCk6IENvbXBpbGVUZW1wbGF0ZVN1bW1hcnkge1xuICAgIHJldHVybiB7XG4gICAgICBuZ0NvbnRlbnRTZWxlY3RvcnM6IHRoaXMubmdDb250ZW50U2VsZWN0b3JzLFxuICAgICAgZW5jYXBzdWxhdGlvbjogdGhpcy5lbmNhcHN1bGF0aW9uLFxuICAgICAgc3R5bGVzOiB0aGlzLnN0eWxlcyxcbiAgICAgIGFuaW1hdGlvbnM6IHRoaXMuYW5pbWF0aW9uc1xuICAgIH07XG4gIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBDb21waWxlRW50cnlDb21wb25lbnRNZXRhZGF0YSB7XG4gIGNvbXBvbmVudFR5cGU6IGFueTtcbiAgY29tcG9uZW50RmFjdG9yeTogU3RhdGljU3ltYm9sfG9iamVjdDtcbn1cblxuLy8gTm90ZTogVGhpcyBzaG91bGQgb25seSB1c2UgaW50ZXJmYWNlcyBhcyBuZXN0ZWQgZGF0YSB0eXBlc1xuLy8gYXMgd2UgbmVlZCB0byBiZSBhYmxlIHRvIHNlcmlhbGl6ZSB0aGlzIGZyb20vdG8gSlNPTiFcbmV4cG9ydCBpbnRlcmZhY2UgQ29tcGlsZURpcmVjdGl2ZVN1bW1hcnkgZXh0ZW5kcyBDb21waWxlVHlwZVN1bW1hcnkge1xuICB0eXBlOiBDb21waWxlVHlwZU1ldGFkYXRhO1xuICBpc0NvbXBvbmVudDogYm9vbGVhbjtcbiAgc2VsZWN0b3I6IHN0cmluZ3xudWxsO1xuICBleHBvcnRBczogc3RyaW5nfG51bGw7XG4gIGlucHV0czoge1trZXk6IHN0cmluZ106IHN0cmluZ307XG4gIG91dHB1dHM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9O1xuICBob3N0TGlzdGVuZXJzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfTtcbiAgaG9zdFByb3BlcnRpZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9O1xuICBob3N0QXR0cmlidXRlczoge1trZXk6IHN0cmluZ106IHN0cmluZ307XG4gIHByb3ZpZGVyczogQ29tcGlsZVByb3ZpZGVyTWV0YWRhdGFbXTtcbiAgdmlld1Byb3ZpZGVyczogQ29tcGlsZVByb3ZpZGVyTWV0YWRhdGFbXTtcbiAgcXVlcmllczogQ29tcGlsZVF1ZXJ5TWV0YWRhdGFbXTtcbiAgZ3VhcmRzOiB7W2tleTogc3RyaW5nXTogYW55fTtcbiAgdmlld1F1ZXJpZXM6IENvbXBpbGVRdWVyeU1ldGFkYXRhW107XG4gIGVudHJ5Q29tcG9uZW50czogQ29tcGlsZUVudHJ5Q29tcG9uZW50TWV0YWRhdGFbXTtcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneXxudWxsO1xuICB0ZW1wbGF0ZTogQ29tcGlsZVRlbXBsYXRlU3VtbWFyeXxudWxsO1xuICBjb21wb25lbnRWaWV3VHlwZTogU3RhdGljU3ltYm9sfFByb3h5Q2xhc3N8bnVsbDtcbiAgcmVuZGVyZXJUeXBlOiBTdGF0aWNTeW1ib2x8b2JqZWN0fG51bGw7XG4gIGNvbXBvbmVudEZhY3Rvcnk6IFN0YXRpY1N5bWJvbHxvYmplY3R8bnVsbDtcbn1cblxuLyoqXG4gKiBNZXRhZGF0YSByZWdhcmRpbmcgY29tcGlsYXRpb24gb2YgYSBkaXJlY3RpdmUuXG4gKi9cbmV4cG9ydCBjbGFzcyBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEge1xuICBzdGF0aWMgY3JlYXRlKHtcbiAgICBpc0hvc3QsXG4gICAgdHlwZSxcbiAgICBpc0NvbXBvbmVudCxcbiAgICBzZWxlY3RvcixcbiAgICBleHBvcnRBcyxcbiAgICBjaGFuZ2VEZXRlY3Rpb24sXG4gICAgaW5wdXRzLFxuICAgIG91dHB1dHMsXG4gICAgaG9zdCxcbiAgICBwcm92aWRlcnMsXG4gICAgdmlld1Byb3ZpZGVycyxcbiAgICBxdWVyaWVzLFxuICAgIGd1YXJkcyxcbiAgICB2aWV3UXVlcmllcyxcbiAgICBlbnRyeUNvbXBvbmVudHMsXG4gICAgdGVtcGxhdGUsXG4gICAgY29tcG9uZW50Vmlld1R5cGUsXG4gICAgcmVuZGVyZXJUeXBlLFxuICAgIGNvbXBvbmVudEZhY3RvcnlcbiAgfToge1xuICAgIGlzSG9zdDogYm9vbGVhbixcbiAgICB0eXBlOiBDb21waWxlVHlwZU1ldGFkYXRhLFxuICAgIGlzQ29tcG9uZW50OiBib29sZWFuLFxuICAgIHNlbGVjdG9yOiBzdHJpbmd8bnVsbCxcbiAgICBleHBvcnRBczogc3RyaW5nfG51bGwsXG4gICAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneXxudWxsLFxuICAgIGlucHV0czogc3RyaW5nW10sXG4gICAgb3V0cHV0czogc3RyaW5nW10sXG4gICAgaG9zdDoge1trZXk6IHN0cmluZ106IHN0cmluZ30sXG4gICAgcHJvdmlkZXJzOiBDb21waWxlUHJvdmlkZXJNZXRhZGF0YVtdLFxuICAgIHZpZXdQcm92aWRlcnM6IENvbXBpbGVQcm92aWRlck1ldGFkYXRhW10sXG4gICAgcXVlcmllczogQ29tcGlsZVF1ZXJ5TWV0YWRhdGFbXSxcbiAgICBndWFyZHM6IHtba2V5OiBzdHJpbmddOiBhbnl9O1xuICAgIHZpZXdRdWVyaWVzOiBDb21waWxlUXVlcnlNZXRhZGF0YVtdLFxuICAgIGVudHJ5Q29tcG9uZW50czogQ29tcGlsZUVudHJ5Q29tcG9uZW50TWV0YWRhdGFbXSxcbiAgICB0ZW1wbGF0ZTogQ29tcGlsZVRlbXBsYXRlTWV0YWRhdGEsXG4gICAgY29tcG9uZW50Vmlld1R5cGU6IFN0YXRpY1N5bWJvbHxQcm94eUNsYXNzfG51bGwsXG4gICAgcmVuZGVyZXJUeXBlOiBTdGF0aWNTeW1ib2x8b2JqZWN0fG51bGwsXG4gICAgY29tcG9uZW50RmFjdG9yeTogU3RhdGljU3ltYm9sfG9iamVjdHxudWxsLFxuICB9KTogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhIHtcbiAgICBjb25zdCBob3N0TGlzdGVuZXJzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuICAgIGNvbnN0IGhvc3RQcm9wZXJ0aWVzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuICAgIGNvbnN0IGhvc3RBdHRyaWJ1dGVzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuICAgIGlmIChob3N0ICE9IG51bGwpIHtcbiAgICAgIE9iamVjdC5rZXlzKGhvc3QpLmZvckVhY2goa2V5ID0+IHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBob3N0W2tleV07XG4gICAgICAgIGNvbnN0IG1hdGNoZXMgPSBrZXkubWF0Y2goSE9TVF9SRUdfRVhQKTtcbiAgICAgICAgaWYgKG1hdGNoZXMgPT09IG51bGwpIHtcbiAgICAgICAgICBob3N0QXR0cmlidXRlc1trZXldID0gdmFsdWU7XG4gICAgICAgIH0gZWxzZSBpZiAobWF0Y2hlc1sxXSAhPSBudWxsKSB7XG4gICAgICAgICAgaG9zdFByb3BlcnRpZXNbbWF0Y2hlc1sxXV0gPSB2YWx1ZTtcbiAgICAgICAgfSBlbHNlIGlmIChtYXRjaGVzWzJdICE9IG51bGwpIHtcbiAgICAgICAgICBob3N0TGlzdGVuZXJzW21hdGNoZXNbMl1dID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICBjb25zdCBpbnB1dHNNYXA6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG4gICAgaWYgKGlucHV0cyAhPSBudWxsKSB7XG4gICAgICBpbnB1dHMuZm9yRWFjaCgoYmluZENvbmZpZzogc3RyaW5nKSA9PiB7XG4gICAgICAgIC8vIGNhbm9uaWNhbCBzeW50YXg6IGBkaXJQcm9wOiBlbFByb3BgXG4gICAgICAgIC8vIGlmIHRoZXJlIGlzIG5vIGA6YCwgdXNlIGRpclByb3AgPSBlbFByb3BcbiAgICAgICAgY29uc3QgcGFydHMgPSBzcGxpdEF0Q29sb24oYmluZENvbmZpZywgW2JpbmRDb25maWcsIGJpbmRDb25maWddKTtcbiAgICAgICAgaW5wdXRzTWFwW3BhcnRzWzBdXSA9IHBhcnRzWzFdO1xuICAgICAgfSk7XG4gICAgfVxuICAgIGNvbnN0IG91dHB1dHNNYXA6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG4gICAgaWYgKG91dHB1dHMgIT0gbnVsbCkge1xuICAgICAgb3V0cHV0cy5mb3JFYWNoKChiaW5kQ29uZmlnOiBzdHJpbmcpID0+IHtcbiAgICAgICAgLy8gY2Fub25pY2FsIHN5bnRheDogYGRpclByb3A6IGVsUHJvcGBcbiAgICAgICAgLy8gaWYgdGhlcmUgaXMgbm8gYDpgLCB1c2UgZGlyUHJvcCA9IGVsUHJvcFxuICAgICAgICBjb25zdCBwYXJ0cyA9IHNwbGl0QXRDb2xvbihiaW5kQ29uZmlnLCBbYmluZENvbmZpZywgYmluZENvbmZpZ10pO1xuICAgICAgICBvdXRwdXRzTWFwW3BhcnRzWzBdXSA9IHBhcnRzWzFdO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEoe1xuICAgICAgaXNIb3N0LFxuICAgICAgdHlwZSxcbiAgICAgIGlzQ29tcG9uZW50OiAhIWlzQ29tcG9uZW50LFxuICAgICAgc2VsZWN0b3IsXG4gICAgICBleHBvcnRBcyxcbiAgICAgIGNoYW5nZURldGVjdGlvbixcbiAgICAgIGlucHV0czogaW5wdXRzTWFwLFxuICAgICAgb3V0cHV0czogb3V0cHV0c01hcCxcbiAgICAgIGhvc3RMaXN0ZW5lcnMsXG4gICAgICBob3N0UHJvcGVydGllcyxcbiAgICAgIGhvc3RBdHRyaWJ1dGVzLFxuICAgICAgcHJvdmlkZXJzLFxuICAgICAgdmlld1Byb3ZpZGVycyxcbiAgICAgIHF1ZXJpZXMsXG4gICAgICBndWFyZHMsXG4gICAgICB2aWV3UXVlcmllcyxcbiAgICAgIGVudHJ5Q29tcG9uZW50cyxcbiAgICAgIHRlbXBsYXRlLFxuICAgICAgY29tcG9uZW50Vmlld1R5cGUsXG4gICAgICByZW5kZXJlclR5cGUsXG4gICAgICBjb21wb25lbnRGYWN0b3J5LFxuICAgIH0pO1xuICB9XG4gIGlzSG9zdDogYm9vbGVhbjtcbiAgdHlwZTogQ29tcGlsZVR5cGVNZXRhZGF0YTtcbiAgaXNDb21wb25lbnQ6IGJvb2xlYW47XG4gIHNlbGVjdG9yOiBzdHJpbmd8bnVsbDtcbiAgZXhwb3J0QXM6IHN0cmluZ3xudWxsO1xuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5fG51bGw7XG4gIGlucHV0czoge1trZXk6IHN0cmluZ106IHN0cmluZ307XG4gIG91dHB1dHM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9O1xuICBob3N0TGlzdGVuZXJzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfTtcbiAgaG9zdFByb3BlcnRpZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9O1xuICBob3N0QXR0cmlidXRlczoge1trZXk6IHN0cmluZ106IHN0cmluZ307XG4gIHByb3ZpZGVyczogQ29tcGlsZVByb3ZpZGVyTWV0YWRhdGFbXTtcbiAgdmlld1Byb3ZpZGVyczogQ29tcGlsZVByb3ZpZGVyTWV0YWRhdGFbXTtcbiAgcXVlcmllczogQ29tcGlsZVF1ZXJ5TWV0YWRhdGFbXTtcbiAgZ3VhcmRzOiB7W2tleTogc3RyaW5nXTogYW55fTtcbiAgdmlld1F1ZXJpZXM6IENvbXBpbGVRdWVyeU1ldGFkYXRhW107XG4gIGVudHJ5Q29tcG9uZW50czogQ29tcGlsZUVudHJ5Q29tcG9uZW50TWV0YWRhdGFbXTtcblxuICB0ZW1wbGF0ZTogQ29tcGlsZVRlbXBsYXRlTWV0YWRhdGF8bnVsbDtcblxuICBjb21wb25lbnRWaWV3VHlwZTogU3RhdGljU3ltYm9sfFByb3h5Q2xhc3N8bnVsbDtcbiAgcmVuZGVyZXJUeXBlOiBTdGF0aWNTeW1ib2x8b2JqZWN0fG51bGw7XG4gIGNvbXBvbmVudEZhY3Rvcnk6IFN0YXRpY1N5bWJvbHxvYmplY3R8bnVsbDtcblxuICBjb25zdHJ1Y3Rvcih7XG4gICAgaXNIb3N0LFxuICAgIHR5cGUsXG4gICAgaXNDb21wb25lbnQsXG4gICAgc2VsZWN0b3IsXG4gICAgZXhwb3J0QXMsXG4gICAgY2hhbmdlRGV0ZWN0aW9uLFxuICAgIGlucHV0cyxcbiAgICBvdXRwdXRzLFxuICAgIGhvc3RMaXN0ZW5lcnMsXG4gICAgaG9zdFByb3BlcnRpZXMsXG4gICAgaG9zdEF0dHJpYnV0ZXMsXG4gICAgcHJvdmlkZXJzLFxuICAgIHZpZXdQcm92aWRlcnMsXG4gICAgcXVlcmllcyxcbiAgICBndWFyZHMsXG4gICAgdmlld1F1ZXJpZXMsXG4gICAgZW50cnlDb21wb25lbnRzLFxuICAgIHRlbXBsYXRlLFxuICAgIGNvbXBvbmVudFZpZXdUeXBlLFxuICAgIHJlbmRlcmVyVHlwZSxcbiAgICBjb21wb25lbnRGYWN0b3J5XG4gIH06IHtcbiAgICBpc0hvc3Q6IGJvb2xlYW4sXG4gICAgdHlwZTogQ29tcGlsZVR5cGVNZXRhZGF0YSxcbiAgICBpc0NvbXBvbmVudDogYm9vbGVhbixcbiAgICBzZWxlY3Rvcjogc3RyaW5nfG51bGwsXG4gICAgZXhwb3J0QXM6IHN0cmluZ3xudWxsLFxuICAgIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3l8bnVsbCxcbiAgICBpbnB1dHM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LFxuICAgIG91dHB1dHM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LFxuICAgIGhvc3RMaXN0ZW5lcnM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LFxuICAgIGhvc3RQcm9wZXJ0aWVzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSxcbiAgICBob3N0QXR0cmlidXRlczoge1trZXk6IHN0cmluZ106IHN0cmluZ30sXG4gICAgcHJvdmlkZXJzOiBDb21waWxlUHJvdmlkZXJNZXRhZGF0YVtdLFxuICAgIHZpZXdQcm92aWRlcnM6IENvbXBpbGVQcm92aWRlck1ldGFkYXRhW10sXG4gICAgcXVlcmllczogQ29tcGlsZVF1ZXJ5TWV0YWRhdGFbXSxcbiAgICBndWFyZHM6IHtba2V5OiBzdHJpbmddOiBhbnl9LFxuICAgIHZpZXdRdWVyaWVzOiBDb21waWxlUXVlcnlNZXRhZGF0YVtdLFxuICAgIGVudHJ5Q29tcG9uZW50czogQ29tcGlsZUVudHJ5Q29tcG9uZW50TWV0YWRhdGFbXSxcbiAgICB0ZW1wbGF0ZTogQ29tcGlsZVRlbXBsYXRlTWV0YWRhdGF8bnVsbCxcbiAgICBjb21wb25lbnRWaWV3VHlwZTogU3RhdGljU3ltYm9sfFByb3h5Q2xhc3N8bnVsbCxcbiAgICByZW5kZXJlclR5cGU6IFN0YXRpY1N5bWJvbHxvYmplY3R8bnVsbCxcbiAgICBjb21wb25lbnRGYWN0b3J5OiBTdGF0aWNTeW1ib2x8b2JqZWN0fG51bGwsXG4gIH0pIHtcbiAgICB0aGlzLmlzSG9zdCA9ICEhaXNIb3N0O1xuICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgdGhpcy5pc0NvbXBvbmVudCA9IGlzQ29tcG9uZW50O1xuICAgIHRoaXMuc2VsZWN0b3IgPSBzZWxlY3RvcjtcbiAgICB0aGlzLmV4cG9ydEFzID0gZXhwb3J0QXM7XG4gICAgdGhpcy5jaGFuZ2VEZXRlY3Rpb24gPSBjaGFuZ2VEZXRlY3Rpb247XG4gICAgdGhpcy5pbnB1dHMgPSBpbnB1dHM7XG4gICAgdGhpcy5vdXRwdXRzID0gb3V0cHV0cztcbiAgICB0aGlzLmhvc3RMaXN0ZW5lcnMgPSBob3N0TGlzdGVuZXJzO1xuICAgIHRoaXMuaG9zdFByb3BlcnRpZXMgPSBob3N0UHJvcGVydGllcztcbiAgICB0aGlzLmhvc3RBdHRyaWJ1dGVzID0gaG9zdEF0dHJpYnV0ZXM7XG4gICAgdGhpcy5wcm92aWRlcnMgPSBfbm9ybWFsaXplQXJyYXkocHJvdmlkZXJzKTtcbiAgICB0aGlzLnZpZXdQcm92aWRlcnMgPSBfbm9ybWFsaXplQXJyYXkodmlld1Byb3ZpZGVycyk7XG4gICAgdGhpcy5xdWVyaWVzID0gX25vcm1hbGl6ZUFycmF5KHF1ZXJpZXMpO1xuICAgIHRoaXMuZ3VhcmRzID0gZ3VhcmRzO1xuICAgIHRoaXMudmlld1F1ZXJpZXMgPSBfbm9ybWFsaXplQXJyYXkodmlld1F1ZXJpZXMpO1xuICAgIHRoaXMuZW50cnlDb21wb25lbnRzID0gX25vcm1hbGl6ZUFycmF5KGVudHJ5Q29tcG9uZW50cyk7XG4gICAgdGhpcy50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xuXG4gICAgdGhpcy5jb21wb25lbnRWaWV3VHlwZSA9IGNvbXBvbmVudFZpZXdUeXBlO1xuICAgIHRoaXMucmVuZGVyZXJUeXBlID0gcmVuZGVyZXJUeXBlO1xuICAgIHRoaXMuY29tcG9uZW50RmFjdG9yeSA9IGNvbXBvbmVudEZhY3Rvcnk7XG4gIH1cblxuICB0b1N1bW1hcnkoKTogQ29tcGlsZURpcmVjdGl2ZVN1bW1hcnkge1xuICAgIHJldHVybiB7XG4gICAgICBzdW1tYXJ5S2luZDogQ29tcGlsZVN1bW1hcnlLaW5kLkRpcmVjdGl2ZSxcbiAgICAgIHR5cGU6IHRoaXMudHlwZSxcbiAgICAgIGlzQ29tcG9uZW50OiB0aGlzLmlzQ29tcG9uZW50LFxuICAgICAgc2VsZWN0b3I6IHRoaXMuc2VsZWN0b3IsXG4gICAgICBleHBvcnRBczogdGhpcy5leHBvcnRBcyxcbiAgICAgIGlucHV0czogdGhpcy5pbnB1dHMsXG4gICAgICBvdXRwdXRzOiB0aGlzLm91dHB1dHMsXG4gICAgICBob3N0TGlzdGVuZXJzOiB0aGlzLmhvc3RMaXN0ZW5lcnMsXG4gICAgICBob3N0UHJvcGVydGllczogdGhpcy5ob3N0UHJvcGVydGllcyxcbiAgICAgIGhvc3RBdHRyaWJ1dGVzOiB0aGlzLmhvc3RBdHRyaWJ1dGVzLFxuICAgICAgcHJvdmlkZXJzOiB0aGlzLnByb3ZpZGVycyxcbiAgICAgIHZpZXdQcm92aWRlcnM6IHRoaXMudmlld1Byb3ZpZGVycyxcbiAgICAgIHF1ZXJpZXM6IHRoaXMucXVlcmllcyxcbiAgICAgIGd1YXJkczogdGhpcy5ndWFyZHMsXG4gICAgICB2aWV3UXVlcmllczogdGhpcy52aWV3UXVlcmllcyxcbiAgICAgIGVudHJ5Q29tcG9uZW50czogdGhpcy5lbnRyeUNvbXBvbmVudHMsXG4gICAgICBjaGFuZ2VEZXRlY3Rpb246IHRoaXMuY2hhbmdlRGV0ZWN0aW9uLFxuICAgICAgdGVtcGxhdGU6IHRoaXMudGVtcGxhdGUgJiYgdGhpcy50ZW1wbGF0ZS50b1N1bW1hcnkoKSxcbiAgICAgIGNvbXBvbmVudFZpZXdUeXBlOiB0aGlzLmNvbXBvbmVudFZpZXdUeXBlLFxuICAgICAgcmVuZGVyZXJUeXBlOiB0aGlzLnJlbmRlcmVyVHlwZSxcbiAgICAgIGNvbXBvbmVudEZhY3Rvcnk6IHRoaXMuY29tcG9uZW50RmFjdG9yeVxuICAgIH07XG4gIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBDb21waWxlUGlwZVN1bW1hcnkgZXh0ZW5kcyBDb21waWxlVHlwZVN1bW1hcnkge1xuICB0eXBlOiBDb21waWxlVHlwZU1ldGFkYXRhO1xuICBuYW1lOiBzdHJpbmc7XG4gIHB1cmU6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBjbGFzcyBDb21waWxlUGlwZU1ldGFkYXRhIHtcbiAgdHlwZTogQ29tcGlsZVR5cGVNZXRhZGF0YTtcbiAgbmFtZTogc3RyaW5nO1xuICBwdXJlOiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKHt0eXBlLCBuYW1lLCBwdXJlfToge1xuICAgIHR5cGU6IENvbXBpbGVUeXBlTWV0YWRhdGEsXG4gICAgbmFtZTogc3RyaW5nLFxuICAgIHB1cmU6IGJvb2xlYW4sXG4gIH0pIHtcbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy5wdXJlID0gISFwdXJlO1xuICB9XG5cbiAgdG9TdW1tYXJ5KCk6IENvbXBpbGVQaXBlU3VtbWFyeSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN1bW1hcnlLaW5kOiBDb21waWxlU3VtbWFyeUtpbmQuUGlwZSxcbiAgICAgIHR5cGU6IHRoaXMudHlwZSxcbiAgICAgIG5hbWU6IHRoaXMubmFtZSxcbiAgICAgIHB1cmU6IHRoaXMucHVyZVxuICAgIH07XG4gIH1cbn1cblxuLy8gTm90ZTogVGhpcyBzaG91bGQgb25seSB1c2UgaW50ZXJmYWNlcyBhcyBuZXN0ZWQgZGF0YSB0eXBlc1xuLy8gYXMgd2UgbmVlZCB0byBiZSBhYmxlIHRvIHNlcmlhbGl6ZSB0aGlzIGZyb20vdG8gSlNPTiFcbmV4cG9ydCBpbnRlcmZhY2UgQ29tcGlsZU5nTW9kdWxlU3VtbWFyeSBleHRlbmRzIENvbXBpbGVUeXBlU3VtbWFyeSB7XG4gIHR5cGU6IENvbXBpbGVUeXBlTWV0YWRhdGE7XG5cbiAgLy8gTm90ZTogVGhpcyBpcyB0cmFuc2l0aXZlIG92ZXIgdGhlIGV4cG9ydGVkIG1vZHVsZXMuXG4gIGV4cG9ydGVkRGlyZWN0aXZlczogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YVtdO1xuICAvLyBOb3RlOiBUaGlzIGlzIHRyYW5zaXRpdmUgb3ZlciB0aGUgZXhwb3J0ZWQgbW9kdWxlcy5cbiAgZXhwb3J0ZWRQaXBlczogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YVtdO1xuXG4gIC8vIE5vdGU6IFRoaXMgaXMgdHJhbnNpdGl2ZS5cbiAgZW50cnlDb21wb25lbnRzOiBDb21waWxlRW50cnlDb21wb25lbnRNZXRhZGF0YVtdO1xuICAvLyBOb3RlOiBUaGlzIGlzIHRyYW5zaXRpdmUuXG4gIHByb3ZpZGVyczoge3Byb3ZpZGVyOiBDb21waWxlUHJvdmlkZXJNZXRhZGF0YSwgbW9kdWxlOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhfVtdO1xuICAvLyBOb3RlOiBUaGlzIGlzIHRyYW5zaXRpdmUuXG4gIG1vZHVsZXM6IENvbXBpbGVUeXBlTWV0YWRhdGFbXTtcbn1cblxuZXhwb3J0IGNsYXNzIENvbXBpbGVTaGFsbG93TW9kdWxlTWV0YWRhdGEge1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgdHlwZSE6IENvbXBpbGVUeXBlTWV0YWRhdGE7XG5cbiAgcmF3RXhwb3J0czogYW55O1xuICByYXdJbXBvcnRzOiBhbnk7XG4gIHJhd1Byb3ZpZGVyczogYW55O1xufVxuXG4vKipcbiAqIE1ldGFkYXRhIHJlZ2FyZGluZyBjb21waWxhdGlvbiBvZiBhIG1vZHVsZS5cbiAqL1xuZXhwb3J0IGNsYXNzIENvbXBpbGVOZ01vZHVsZU1ldGFkYXRhIHtcbiAgdHlwZTogQ29tcGlsZVR5cGVNZXRhZGF0YTtcbiAgZGVjbGFyZWREaXJlY3RpdmVzOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhW107XG4gIGV4cG9ydGVkRGlyZWN0aXZlczogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YVtdO1xuICBkZWNsYXJlZFBpcGVzOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhW107XG5cbiAgZXhwb3J0ZWRQaXBlczogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YVtdO1xuICBlbnRyeUNvbXBvbmVudHM6IENvbXBpbGVFbnRyeUNvbXBvbmVudE1ldGFkYXRhW107XG4gIGJvb3RzdHJhcENvbXBvbmVudHM6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGFbXTtcbiAgcHJvdmlkZXJzOiBDb21waWxlUHJvdmlkZXJNZXRhZGF0YVtdO1xuXG4gIGltcG9ydGVkTW9kdWxlczogQ29tcGlsZU5nTW9kdWxlU3VtbWFyeVtdO1xuICBleHBvcnRlZE1vZHVsZXM6IENvbXBpbGVOZ01vZHVsZVN1bW1hcnlbXTtcbiAgc2NoZW1hczogU2NoZW1hTWV0YWRhdGFbXTtcbiAgaWQ6IHN0cmluZ3xudWxsO1xuXG4gIHRyYW5zaXRpdmVNb2R1bGU6IFRyYW5zaXRpdmVDb21waWxlTmdNb2R1bGVNZXRhZGF0YTtcblxuICBjb25zdHJ1Y3Rvcih7XG4gICAgdHlwZSxcbiAgICBwcm92aWRlcnMsXG4gICAgZGVjbGFyZWREaXJlY3RpdmVzLFxuICAgIGV4cG9ydGVkRGlyZWN0aXZlcyxcbiAgICBkZWNsYXJlZFBpcGVzLFxuICAgIGV4cG9ydGVkUGlwZXMsXG4gICAgZW50cnlDb21wb25lbnRzLFxuICAgIGJvb3RzdHJhcENvbXBvbmVudHMsXG4gICAgaW1wb3J0ZWRNb2R1bGVzLFxuICAgIGV4cG9ydGVkTW9kdWxlcyxcbiAgICBzY2hlbWFzLFxuICAgIHRyYW5zaXRpdmVNb2R1bGUsXG4gICAgaWRcbiAgfToge1xuICAgIHR5cGU6IENvbXBpbGVUeXBlTWV0YWRhdGEsXG4gICAgcHJvdmlkZXJzOiBDb21waWxlUHJvdmlkZXJNZXRhZGF0YVtdLFxuICAgIGRlY2xhcmVkRGlyZWN0aXZlczogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YVtdLFxuICAgIGV4cG9ydGVkRGlyZWN0aXZlczogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YVtdLFxuICAgIGRlY2xhcmVkUGlwZXM6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGFbXSxcbiAgICBleHBvcnRlZFBpcGVzOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhW10sXG4gICAgZW50cnlDb21wb25lbnRzOiBDb21waWxlRW50cnlDb21wb25lbnRNZXRhZGF0YVtdLFxuICAgIGJvb3RzdHJhcENvbXBvbmVudHM6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGFbXSxcbiAgICBpbXBvcnRlZE1vZHVsZXM6IENvbXBpbGVOZ01vZHVsZVN1bW1hcnlbXSxcbiAgICBleHBvcnRlZE1vZHVsZXM6IENvbXBpbGVOZ01vZHVsZVN1bW1hcnlbXSxcbiAgICB0cmFuc2l0aXZlTW9kdWxlOiBUcmFuc2l0aXZlQ29tcGlsZU5nTW9kdWxlTWV0YWRhdGEsXG4gICAgc2NoZW1hczogU2NoZW1hTWV0YWRhdGFbXSxcbiAgICBpZDogc3RyaW5nfG51bGxcbiAgfSkge1xuICAgIHRoaXMudHlwZSA9IHR5cGUgfHwgbnVsbDtcbiAgICB0aGlzLmRlY2xhcmVkRGlyZWN0aXZlcyA9IF9ub3JtYWxpemVBcnJheShkZWNsYXJlZERpcmVjdGl2ZXMpO1xuICAgIHRoaXMuZXhwb3J0ZWREaXJlY3RpdmVzID0gX25vcm1hbGl6ZUFycmF5KGV4cG9ydGVkRGlyZWN0aXZlcyk7XG4gICAgdGhpcy5kZWNsYXJlZFBpcGVzID0gX25vcm1hbGl6ZUFycmF5KGRlY2xhcmVkUGlwZXMpO1xuICAgIHRoaXMuZXhwb3J0ZWRQaXBlcyA9IF9ub3JtYWxpemVBcnJheShleHBvcnRlZFBpcGVzKTtcbiAgICB0aGlzLnByb3ZpZGVycyA9IF9ub3JtYWxpemVBcnJheShwcm92aWRlcnMpO1xuICAgIHRoaXMuZW50cnlDb21wb25lbnRzID0gX25vcm1hbGl6ZUFycmF5KGVudHJ5Q29tcG9uZW50cyk7XG4gICAgdGhpcy5ib290c3RyYXBDb21wb25lbnRzID0gX25vcm1hbGl6ZUFycmF5KGJvb3RzdHJhcENvbXBvbmVudHMpO1xuICAgIHRoaXMuaW1wb3J0ZWRNb2R1bGVzID0gX25vcm1hbGl6ZUFycmF5KGltcG9ydGVkTW9kdWxlcyk7XG4gICAgdGhpcy5leHBvcnRlZE1vZHVsZXMgPSBfbm9ybWFsaXplQXJyYXkoZXhwb3J0ZWRNb2R1bGVzKTtcbiAgICB0aGlzLnNjaGVtYXMgPSBfbm9ybWFsaXplQXJyYXkoc2NoZW1hcyk7XG4gICAgdGhpcy5pZCA9IGlkIHx8IG51bGw7XG4gICAgdGhpcy50cmFuc2l0aXZlTW9kdWxlID0gdHJhbnNpdGl2ZU1vZHVsZSB8fCBudWxsO1xuICB9XG5cbiAgdG9TdW1tYXJ5KCk6IENvbXBpbGVOZ01vZHVsZVN1bW1hcnkge1xuICAgIGNvbnN0IG1vZHVsZSA9IHRoaXMudHJhbnNpdGl2ZU1vZHVsZSE7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN1bW1hcnlLaW5kOiBDb21waWxlU3VtbWFyeUtpbmQuTmdNb2R1bGUsXG4gICAgICB0eXBlOiB0aGlzLnR5cGUsXG4gICAgICBlbnRyeUNvbXBvbmVudHM6IG1vZHVsZS5lbnRyeUNvbXBvbmVudHMsXG4gICAgICBwcm92aWRlcnM6IG1vZHVsZS5wcm92aWRlcnMsXG4gICAgICBtb2R1bGVzOiBtb2R1bGUubW9kdWxlcyxcbiAgICAgIGV4cG9ydGVkRGlyZWN0aXZlczogbW9kdWxlLmV4cG9ydGVkRGlyZWN0aXZlcyxcbiAgICAgIGV4cG9ydGVkUGlwZXM6IG1vZHVsZS5leHBvcnRlZFBpcGVzXG4gICAgfTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgVHJhbnNpdGl2ZUNvbXBpbGVOZ01vZHVsZU1ldGFkYXRhIHtcbiAgZGlyZWN0aXZlc1NldCA9IG5ldyBTZXQ8YW55PigpO1xuICBkaXJlY3RpdmVzOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhW10gPSBbXTtcbiAgZXhwb3J0ZWREaXJlY3RpdmVzU2V0ID0gbmV3IFNldDxhbnk+KCk7XG4gIGV4cG9ydGVkRGlyZWN0aXZlczogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YVtdID0gW107XG4gIHBpcGVzU2V0ID0gbmV3IFNldDxhbnk+KCk7XG4gIHBpcGVzOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhW10gPSBbXTtcbiAgZXhwb3J0ZWRQaXBlc1NldCA9IG5ldyBTZXQ8YW55PigpO1xuICBleHBvcnRlZFBpcGVzOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhW10gPSBbXTtcbiAgbW9kdWxlc1NldCA9IG5ldyBTZXQ8YW55PigpO1xuICBtb2R1bGVzOiBDb21waWxlVHlwZU1ldGFkYXRhW10gPSBbXTtcbiAgZW50cnlDb21wb25lbnRzU2V0ID0gbmV3IFNldDxhbnk+KCk7XG4gIGVudHJ5Q29tcG9uZW50czogQ29tcGlsZUVudHJ5Q29tcG9uZW50TWV0YWRhdGFbXSA9IFtdO1xuXG4gIHByb3ZpZGVyczoge3Byb3ZpZGVyOiBDb21waWxlUHJvdmlkZXJNZXRhZGF0YSwgbW9kdWxlOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhfVtdID0gW107XG5cbiAgYWRkUHJvdmlkZXIocHJvdmlkZXI6IENvbXBpbGVQcm92aWRlck1ldGFkYXRhLCBtb2R1bGU6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEpIHtcbiAgICB0aGlzLnByb3ZpZGVycy5wdXNoKHtwcm92aWRlcjogcHJvdmlkZXIsIG1vZHVsZTogbW9kdWxlfSk7XG4gIH1cblxuICBhZGREaXJlY3RpdmUoaWQ6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEpIHtcbiAgICBpZiAoIXRoaXMuZGlyZWN0aXZlc1NldC5oYXMoaWQucmVmZXJlbmNlKSkge1xuICAgICAgdGhpcy5kaXJlY3RpdmVzU2V0LmFkZChpZC5yZWZlcmVuY2UpO1xuICAgICAgdGhpcy5kaXJlY3RpdmVzLnB1c2goaWQpO1xuICAgIH1cbiAgfVxuICBhZGRFeHBvcnRlZERpcmVjdGl2ZShpZDogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSkge1xuICAgIGlmICghdGhpcy5leHBvcnRlZERpcmVjdGl2ZXNTZXQuaGFzKGlkLnJlZmVyZW5jZSkpIHtcbiAgICAgIHRoaXMuZXhwb3J0ZWREaXJlY3RpdmVzU2V0LmFkZChpZC5yZWZlcmVuY2UpO1xuICAgICAgdGhpcy5leHBvcnRlZERpcmVjdGl2ZXMucHVzaChpZCk7XG4gICAgfVxuICB9XG4gIGFkZFBpcGUoaWQ6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEpIHtcbiAgICBpZiAoIXRoaXMucGlwZXNTZXQuaGFzKGlkLnJlZmVyZW5jZSkpIHtcbiAgICAgIHRoaXMucGlwZXNTZXQuYWRkKGlkLnJlZmVyZW5jZSk7XG4gICAgICB0aGlzLnBpcGVzLnB1c2goaWQpO1xuICAgIH1cbiAgfVxuICBhZGRFeHBvcnRlZFBpcGUoaWQ6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEpIHtcbiAgICBpZiAoIXRoaXMuZXhwb3J0ZWRQaXBlc1NldC5oYXMoaWQucmVmZXJlbmNlKSkge1xuICAgICAgdGhpcy5leHBvcnRlZFBpcGVzU2V0LmFkZChpZC5yZWZlcmVuY2UpO1xuICAgICAgdGhpcy5leHBvcnRlZFBpcGVzLnB1c2goaWQpO1xuICAgIH1cbiAgfVxuICBhZGRNb2R1bGUoaWQ6IENvbXBpbGVUeXBlTWV0YWRhdGEpIHtcbiAgICBpZiAoIXRoaXMubW9kdWxlc1NldC5oYXMoaWQucmVmZXJlbmNlKSkge1xuICAgICAgdGhpcy5tb2R1bGVzU2V0LmFkZChpZC5yZWZlcmVuY2UpO1xuICAgICAgdGhpcy5tb2R1bGVzLnB1c2goaWQpO1xuICAgIH1cbiAgfVxuICBhZGRFbnRyeUNvbXBvbmVudChlYzogQ29tcGlsZUVudHJ5Q29tcG9uZW50TWV0YWRhdGEpIHtcbiAgICBpZiAoIXRoaXMuZW50cnlDb21wb25lbnRzU2V0LmhhcyhlYy5jb21wb25lbnRUeXBlKSkge1xuICAgICAgdGhpcy5lbnRyeUNvbXBvbmVudHNTZXQuYWRkKGVjLmNvbXBvbmVudFR5cGUpO1xuICAgICAgdGhpcy5lbnRyeUNvbXBvbmVudHMucHVzaChlYyk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIF9ub3JtYWxpemVBcnJheShvYmo6IGFueVtdfHVuZGVmaW5lZHxudWxsKTogYW55W10ge1xuICByZXR1cm4gb2JqIHx8IFtdO1xufVxuXG5leHBvcnQgY2xhc3MgUHJvdmlkZXJNZXRhIHtcbiAgdG9rZW46IGFueTtcbiAgdXNlQ2xhc3M6IFR5cGV8bnVsbDtcbiAgdXNlVmFsdWU6IGFueTtcbiAgdXNlRXhpc3Rpbmc6IGFueTtcbiAgdXNlRmFjdG9yeTogRnVuY3Rpb258bnVsbDtcbiAgZGVwZW5kZW5jaWVzOiBPYmplY3RbXXxudWxsO1xuICBtdWx0aTogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3Rvcih0b2tlbjogYW55LCB7dXNlQ2xhc3MsIHVzZVZhbHVlLCB1c2VFeGlzdGluZywgdXNlRmFjdG9yeSwgZGVwcywgbXVsdGl9OiB7XG4gICAgdXNlQ2xhc3M/OiBUeXBlLFxuICAgIHVzZVZhbHVlPzogYW55LFxuICAgIHVzZUV4aXN0aW5nPzogYW55LFxuICAgIHVzZUZhY3Rvcnk/OiBGdW5jdGlvbnxudWxsLFxuICAgIGRlcHM/OiBPYmplY3RbXXxudWxsLFxuICAgIG11bHRpPzogYm9vbGVhblxuICB9KSB7XG4gICAgdGhpcy50b2tlbiA9IHRva2VuO1xuICAgIHRoaXMudXNlQ2xhc3MgPSB1c2VDbGFzcyB8fCBudWxsO1xuICAgIHRoaXMudXNlVmFsdWUgPSB1c2VWYWx1ZTtcbiAgICB0aGlzLnVzZUV4aXN0aW5nID0gdXNlRXhpc3Rpbmc7XG4gICAgdGhpcy51c2VGYWN0b3J5ID0gdXNlRmFjdG9yeSB8fCBudWxsO1xuICAgIHRoaXMuZGVwZW5kZW5jaWVzID0gZGVwcyB8fCBudWxsO1xuICAgIHRoaXMubXVsdGkgPSAhIW11bHRpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmbGF0dGVuPFQ+KGxpc3Q6IEFycmF5PFR8VFtdPik6IFRbXSB7XG4gIHJldHVybiBsaXN0LnJlZHVjZSgoZmxhdDogYW55W10sIGl0ZW06IFR8VFtdKTogVFtdID0+IHtcbiAgICBjb25zdCBmbGF0SXRlbSA9IEFycmF5LmlzQXJyYXkoaXRlbSkgPyBmbGF0dGVuKGl0ZW0pIDogaXRlbTtcbiAgICByZXR1cm4gKDxUW10+ZmxhdCkuY29uY2F0KGZsYXRJdGVtKTtcbiAgfSwgW10pO1xufVxuXG5mdW5jdGlvbiBqaXRTb3VyY2VVcmwodXJsOiBzdHJpbmcpIHtcbiAgLy8gTm90ZTogV2UgbmVlZCAzIFwiL1wiIHNvIHRoYXQgbmcgc2hvd3MgdXAgYXMgYSBzZXBhcmF0ZSBkb21haW5cbiAgLy8gaW4gdGhlIGNocm9tZSBkZXYgdG9vbHMuXG4gIHJldHVybiB1cmwucmVwbGFjZSgvKFxcdys6XFwvXFwvW1xcdzotXSspPyhcXC8rKT8vLCAnbmc6Ly8vJyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0ZW1wbGF0ZVNvdXJjZVVybChcbiAgICBuZ01vZHVsZVR5cGU6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEsIGNvbXBNZXRhOiB7dHlwZTogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YX0sXG4gICAgdGVtcGxhdGVNZXRhOiB7aXNJbmxpbmU6IGJvb2xlYW4sIHRlbXBsYXRlVXJsOiBzdHJpbmd8bnVsbH0pIHtcbiAgbGV0IHVybDogc3RyaW5nO1xuICBpZiAodGVtcGxhdGVNZXRhLmlzSW5saW5lKSB7XG4gICAgaWYgKGNvbXBNZXRhLnR5cGUucmVmZXJlbmNlIGluc3RhbmNlb2YgU3RhdGljU3ltYm9sKSB7XG4gICAgICAvLyBOb3RlOiBhIC50cyBmaWxlIG1pZ2h0IGNvbnRhaW4gbXVsdGlwbGUgY29tcG9uZW50cyB3aXRoIGlubGluZSB0ZW1wbGF0ZXMsXG4gICAgICAvLyBzbyB3ZSBuZWVkIHRvIGdpdmUgdGhlbSB1bmlxdWUgdXJscywgYXMgdGhlc2Ugd2lsbCBiZSB1c2VkIGZvciBzb3VyY2VtYXBzLlxuICAgICAgdXJsID0gYCR7Y29tcE1ldGEudHlwZS5yZWZlcmVuY2UuZmlsZVBhdGh9LiR7Y29tcE1ldGEudHlwZS5yZWZlcmVuY2UubmFtZX0uaHRtbGA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHVybCA9IGAke2lkZW50aWZpZXJOYW1lKG5nTW9kdWxlVHlwZSl9LyR7aWRlbnRpZmllck5hbWUoY29tcE1ldGEudHlwZSl9Lmh0bWxgO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB1cmwgPSB0ZW1wbGF0ZU1ldGEudGVtcGxhdGVVcmwhO1xuICB9XG4gIHJldHVybiBjb21wTWV0YS50eXBlLnJlZmVyZW5jZSBpbnN0YW5jZW9mIFN0YXRpY1N5bWJvbCA/IHVybCA6IGppdFNvdXJjZVVybCh1cmwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2hhcmVkU3R5bGVzaGVldEppdFVybChtZXRhOiBDb21waWxlU3R5bGVzaGVldE1ldGFkYXRhLCBpZDogbnVtYmVyKSB7XG4gIGNvbnN0IHBhdGhQYXJ0cyA9IG1ldGEubW9kdWxlVXJsIS5zcGxpdCgvXFwvXFxcXC9nKTtcbiAgY29uc3QgYmFzZU5hbWUgPSBwYXRoUGFydHNbcGF0aFBhcnRzLmxlbmd0aCAtIDFdO1xuICByZXR1cm4gaml0U291cmNlVXJsKGBjc3MvJHtpZH0ke2Jhc2VOYW1lfS5uZ3N0eWxlLmpzYCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBuZ01vZHVsZUppdFVybChtb2R1bGVNZXRhOiBDb21waWxlTmdNb2R1bGVNZXRhZGF0YSk6IHN0cmluZyB7XG4gIHJldHVybiBqaXRTb3VyY2VVcmwoYCR7aWRlbnRpZmllck5hbWUobW9kdWxlTWV0YS50eXBlKX0vbW9kdWxlLm5nZmFjdG9yeS5qc2ApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdGVtcGxhdGVKaXRVcmwoXG4gICAgbmdNb2R1bGVUeXBlOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhLCBjb21wTWV0YTogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhKTogc3RyaW5nIHtcbiAgcmV0dXJuIGppdFNvdXJjZVVybChcbiAgICAgIGAke2lkZW50aWZpZXJOYW1lKG5nTW9kdWxlVHlwZSl9LyR7aWRlbnRpZmllck5hbWUoY29tcE1ldGEudHlwZSl9Lm5nZmFjdG9yeS5qc2ApO1xufVxuIl19