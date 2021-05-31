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
        define("@angular/compiler/src/render3/view/compiler", ["require", "exports", "tslib", "@angular/compiler/src/compile_metadata", "@angular/compiler/src/compiler_util/expression_converter", "@angular/compiler/src/core", "@angular/compiler/src/output/output_ast", "@angular/compiler/src/selector", "@angular/compiler/src/shadow_css", "@angular/compiler/src/style_compiler", "@angular/compiler/src/util", "@angular/compiler/src/render3/r3_ast", "@angular/compiler/src/render3/r3_identifiers", "@angular/compiler/src/render3/util", "@angular/compiler/src/render3/view/styling_builder", "@angular/compiler/src/render3/view/template", "@angular/compiler/src/render3/view/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.verifyHostBindings = exports.parseHostBindings = exports.createDirectiveType = exports.createDirectiveTypeParams = exports.createComponentType = exports.compileComponentFromMetadata = exports.compileDirectiveFromMetadata = void 0;
    var tslib_1 = require("tslib");
    var compile_metadata_1 = require("@angular/compiler/src/compile_metadata");
    var expression_converter_1 = require("@angular/compiler/src/compiler_util/expression_converter");
    var core = require("@angular/compiler/src/core");
    var o = require("@angular/compiler/src/output/output_ast");
    var selector_1 = require("@angular/compiler/src/selector");
    var shadow_css_1 = require("@angular/compiler/src/shadow_css");
    var style_compiler_1 = require("@angular/compiler/src/style_compiler");
    var util_1 = require("@angular/compiler/src/util");
    var r3_ast_1 = require("@angular/compiler/src/render3/r3_ast");
    var r3_identifiers_1 = require("@angular/compiler/src/render3/r3_identifiers");
    var util_2 = require("@angular/compiler/src/render3/util");
    var styling_builder_1 = require("@angular/compiler/src/render3/view/styling_builder");
    var template_1 = require("@angular/compiler/src/render3/view/template");
    var util_3 = require("@angular/compiler/src/render3/view/util");
    // This regex matches any binding names that contain the "attr." prefix, e.g. "attr.required"
    // If there is a match, the first matching group will contain the attribute name to bind.
    var ATTR_REGEX = /attr\.([^\]]+)/;
    function baseDirectiveFields(meta, constantPool, bindingParser) {
        var definitionMap = new util_3.DefinitionMap();
        var selectors = core.parseSelectorToR3Selector(meta.selector);
        // e.g. `type: MyDirective`
        definitionMap.set('type', meta.internalType);
        // e.g. `selectors: [['', 'someDir', '']]`
        if (selectors.length > 0) {
            definitionMap.set('selectors', util_3.asLiteral(selectors));
        }
        if (meta.queries.length > 0) {
            // e.g. `contentQueries: (rf, ctx, dirIndex) => { ... }
            definitionMap.set('contentQueries', createContentQueriesFunction(meta.queries, constantPool, meta.name));
        }
        if (meta.viewQueries.length) {
            definitionMap.set('viewQuery', createViewQueriesFunction(meta.viewQueries, constantPool, meta.name));
        }
        // e.g. `hostBindings: (rf, ctx) => { ... }
        definitionMap.set('hostBindings', createHostBindingsFunction(meta.host, meta.typeSourceSpan, bindingParser, constantPool, meta.selector || '', meta.name, definitionMap));
        // e.g 'inputs: {a: 'a'}`
        definitionMap.set('inputs', util_3.conditionallyCreateMapObjectLiteral(meta.inputs, true));
        // e.g 'outputs: {a: 'a'}`
        definitionMap.set('outputs', util_3.conditionallyCreateMapObjectLiteral(meta.outputs));
        if (meta.exportAs !== null) {
            definitionMap.set('exportAs', o.literalArr(meta.exportAs.map(function (e) { return o.literal(e); })));
        }
        return definitionMap;
    }
    /**
     * Add features to the definition map.
     */
    function addFeatures(definitionMap, meta) {
        // e.g. `features: [NgOnChangesFeature]`
        var features = [];
        var providers = meta.providers;
        var viewProviders = meta.viewProviders;
        if (providers || viewProviders) {
            var args = [providers || new o.LiteralArrayExpr([])];
            if (viewProviders) {
                args.push(viewProviders);
            }
            features.push(o.importExpr(r3_identifiers_1.Identifiers.ProvidersFeature).callFn(args));
        }
        if (meta.usesInheritance) {
            features.push(o.importExpr(r3_identifiers_1.Identifiers.InheritDefinitionFeature));
        }
        if (meta.fullInheritance) {
            features.push(o.importExpr(r3_identifiers_1.Identifiers.CopyDefinitionFeature));
        }
        if (meta.lifecycle.usesOnChanges) {
            features.push(o.importExpr(r3_identifiers_1.Identifiers.NgOnChangesFeature));
        }
        if (features.length) {
            definitionMap.set('features', o.literalArr(features));
        }
    }
    /**
     * Compile a directive for the render3 runtime as defined by the `R3DirectiveMetadata`.
     */
    function compileDirectiveFromMetadata(meta, constantPool, bindingParser) {
        var definitionMap = baseDirectiveFields(meta, constantPool, bindingParser);
        addFeatures(definitionMap, meta);
        var expression = o.importExpr(r3_identifiers_1.Identifiers.defineDirective).callFn([definitionMap.toLiteralMap()], undefined, true);
        var type = createDirectiveType(meta);
        return { expression: expression, type: type, statements: [] };
    }
    exports.compileDirectiveFromMetadata = compileDirectiveFromMetadata;
    /**
     * Compile a component for the render3 runtime as defined by the `R3ComponentMetadata`.
     */
    function compileComponentFromMetadata(meta, constantPool, bindingParser) {
        var e_1, _a;
        var definitionMap = baseDirectiveFields(meta, constantPool, bindingParser);
        addFeatures(definitionMap, meta);
        var selector = meta.selector && selector_1.CssSelector.parse(meta.selector);
        var firstSelector = selector && selector[0];
        // e.g. `attr: ["class", ".my.app"]`
        // This is optional an only included if the first selector of a component specifies attributes.
        if (firstSelector) {
            var selectorAttributes = firstSelector.getAttrs();
            if (selectorAttributes.length) {
                definitionMap.set('attrs', constantPool.getConstLiteral(o.literalArr(selectorAttributes.map(function (value) { return value != null ? o.literal(value) : o.literal(undefined); })), 
                /* forceShared */ true));
            }
        }
        // Generate the CSS matcher that recognize directive
        var directiveMatcher = null;
        if (meta.directives.length > 0) {
            var matcher = new selector_1.SelectorMatcher();
            try {
                for (var _b = tslib_1.__values(meta.directives), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var _d = _c.value, selector_2 = _d.selector, type_1 = _d.type;
                    matcher.addSelectables(selector_1.CssSelector.parse(selector_2), type_1);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            directiveMatcher = matcher;
        }
        // e.g. `template: function MyComponent_Template(_ctx, _cm) {...}`
        var templateTypeName = meta.name;
        var templateName = templateTypeName ? templateTypeName + "_Template" : null;
        var directivesUsed = new Set();
        var pipesUsed = new Set();
        var changeDetection = meta.changeDetection;
        var template = meta.template;
        var templateBuilder = new template_1.TemplateDefinitionBuilder(constantPool, template_1.BindingScope.createRootScope(), 0, templateTypeName, null, null, templateName, directiveMatcher, directivesUsed, meta.pipes, pipesUsed, r3_identifiers_1.Identifiers.namespaceHTML, meta.relativeContextFilePath, meta.i18nUseExternalIds);
        var templateFunctionExpression = templateBuilder.buildTemplateFunction(template.nodes, []);
        // We need to provide this so that dynamically generated components know what
        // projected content blocks to pass through to the component when it is instantiated.
        var ngContentSelectors = templateBuilder.getNgContentSelectors();
        if (ngContentSelectors) {
            definitionMap.set('ngContentSelectors', ngContentSelectors);
        }
        // e.g. `decls: 2`
        definitionMap.set('decls', o.literal(templateBuilder.getConstCount()));
        // e.g. `vars: 2`
        definitionMap.set('vars', o.literal(templateBuilder.getVarCount()));
        // Generate `consts` section of ComponentDef:
        // - either as an array:
        //   `consts: [['one', 'two'], ['three', 'four']]`
        // - or as a factory function in case additional statements are present (to support i18n):
        //   `consts: function() { var i18n_0; if (ngI18nClosureMode) {...} else {...} return [i18n_0]; }`
        var _e = templateBuilder.getConsts(), constExpressions = _e.constExpressions, prepareStatements = _e.prepareStatements;
        if (constExpressions.length > 0) {
            var constsExpr = o.literalArr(constExpressions);
            // Prepare statements are present - turn `consts` into a function.
            if (prepareStatements.length > 0) {
                constsExpr = o.fn([], tslib_1.__spreadArray(tslib_1.__spreadArray([], tslib_1.__read(prepareStatements)), [new o.ReturnStatement(constsExpr)]));
            }
            definitionMap.set('consts', constsExpr);
        }
        definitionMap.set('template', templateFunctionExpression);
        // e.g. `directives: [MyDirective]`
        if (directivesUsed.size) {
            var directivesList = o.literalArr(Array.from(directivesUsed));
            var directivesExpr = compileDeclarationList(directivesList, meta.declarationListEmitMode);
            definitionMap.set('directives', directivesExpr);
        }
        // e.g. `pipes: [MyPipe]`
        if (pipesUsed.size) {
            var pipesList = o.literalArr(Array.from(pipesUsed));
            var pipesExpr = compileDeclarationList(pipesList, meta.declarationListEmitMode);
            definitionMap.set('pipes', pipesExpr);
        }
        if (meta.encapsulation === null) {
            meta.encapsulation = core.ViewEncapsulation.Emulated;
        }
        // e.g. `styles: [str1, str2]`
        if (meta.styles && meta.styles.length) {
            var styleValues = meta.encapsulation == core.ViewEncapsulation.Emulated ?
                compileStyles(meta.styles, style_compiler_1.CONTENT_ATTR, style_compiler_1.HOST_ATTR) :
                meta.styles;
            var strings = styleValues.map(function (str) { return constantPool.getConstLiteral(o.literal(str)); });
            definitionMap.set('styles', o.literalArr(strings));
        }
        else if (meta.encapsulation === core.ViewEncapsulation.Emulated) {
            // If there is no style, don't generate css selectors on elements
            meta.encapsulation = core.ViewEncapsulation.None;
        }
        // Only set view encapsulation if it's not the default value
        if (meta.encapsulation !== core.ViewEncapsulation.Emulated) {
            definitionMap.set('encapsulation', o.literal(meta.encapsulation));
        }
        // e.g. `animation: [trigger('123', [])]`
        if (meta.animations !== null) {
            definitionMap.set('data', o.literalMap([{ key: 'animation', value: meta.animations, quoted: false }]));
        }
        // Only set the change detection flag if it's defined and it's not the default.
        if (changeDetection != null && changeDetection !== core.ChangeDetectionStrategy.Default) {
            definitionMap.set('changeDetection', o.literal(changeDetection));
        }
        var expression = o.importExpr(r3_identifiers_1.Identifiers.defineComponent).callFn([definitionMap.toLiteralMap()], undefined, true);
        var type = createComponentType(meta);
        return { expression: expression, type: type, statements: [] };
    }
    exports.compileComponentFromMetadata = compileComponentFromMetadata;
    /**
     * Creates the type specification from the component meta. This type is inserted into .d.ts files
     * to be consumed by upstream compilations.
     */
    function createComponentType(meta) {
        var typeParams = createDirectiveTypeParams(meta);
        typeParams.push(stringArrayAsType(meta.template.ngContentSelectors));
        return o.expressionType(o.importExpr(r3_identifiers_1.Identifiers.ComponentDeclaration, typeParams));
    }
    exports.createComponentType = createComponentType;
    /**
     * Compiles the array literal of declarations into an expression according to the provided emit
     * mode.
     */
    function compileDeclarationList(list, mode) {
        switch (mode) {
            case 0 /* Direct */:
                // directives: [MyDir],
                return list;
            case 1 /* Closure */:
                // directives: function () { return [MyDir]; }
                return o.fn([], [new o.ReturnStatement(list)]);
            case 2 /* ClosureResolved */:
                // directives: function () { return [MyDir].map(ng.resolveForwardRef); }
                var resolvedList = list.callMethod('map', [o.importExpr(r3_identifiers_1.Identifiers.resolveForwardRef)]);
                return o.fn([], [new o.ReturnStatement(resolvedList)]);
        }
    }
    function prepareQueryParams(query, constantPool) {
        var parameters = [util_3.getQueryPredicate(query, constantPool), o.literal(toQueryFlags(query))];
        if (query.read) {
            parameters.push(query.read);
        }
        return parameters;
    }
    /**
     * Translates query flags into `TQueryFlags` type in packages/core/src/render3/interfaces/query.ts
     * @param query
     */
    function toQueryFlags(query) {
        return (query.descendants ? 1 /* descendants */ : 0 /* none */) |
            (query.static ? 2 /* isStatic */ : 0 /* none */) |
            (query.emitDistinctChangesOnly ? 4 /* emitDistinctChangesOnly */ : 0 /* none */);
    }
    function convertAttributesToExpressions(attributes) {
        var e_2, _a;
        var values = [];
        try {
            for (var _b = tslib_1.__values(Object.getOwnPropertyNames(attributes)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var key = _c.value;
                var value = attributes[key];
                values.push(o.literal(key), value);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return values;
    }
    // Define and update any content queries
    function createContentQueriesFunction(queries, constantPool, name) {
        var e_3, _a;
        var createStatements = [];
        var updateStatements = [];
        var tempAllocator = util_3.temporaryAllocator(updateStatements, util_3.TEMPORARY_NAME);
        try {
            for (var queries_1 = tslib_1.__values(queries), queries_1_1 = queries_1.next(); !queries_1_1.done; queries_1_1 = queries_1.next()) {
                var query = queries_1_1.value;
                // creation, e.g. r3.contentQuery(dirIndex, somePredicate, true, null);
                createStatements.push(o.importExpr(r3_identifiers_1.Identifiers.contentQuery)
                    .callFn(tslib_1.__spreadArray([o.variable('dirIndex')], tslib_1.__read(prepareQueryParams(query, constantPool))))
                    .toStmt());
                // update, e.g. (r3.queryRefresh(tmp = r3.loadQuery()) && (ctx.someDir = tmp));
                var temporary = tempAllocator();
                var getQueryList = o.importExpr(r3_identifiers_1.Identifiers.loadQuery).callFn([]);
                var refresh = o.importExpr(r3_identifiers_1.Identifiers.queryRefresh).callFn([temporary.set(getQueryList)]);
                var updateDirective = o.variable(util_3.CONTEXT_NAME)
                    .prop(query.propertyName)
                    .set(query.first ? temporary.prop('first') : temporary);
                updateStatements.push(refresh.and(updateDirective).toStmt());
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (queries_1_1 && !queries_1_1.done && (_a = queries_1.return)) _a.call(queries_1);
            }
            finally { if (e_3) throw e_3.error; }
        }
        var contentQueriesFnName = name ? name + "_ContentQueries" : null;
        return o.fn([
            new o.FnParam(util_3.RENDER_FLAGS, o.NUMBER_TYPE), new o.FnParam(util_3.CONTEXT_NAME, null),
            new o.FnParam('dirIndex', null)
        ], [
            template_1.renderFlagCheckIfStmt(1 /* Create */, createStatements),
            template_1.renderFlagCheckIfStmt(2 /* Update */, updateStatements)
        ], o.INFERRED_TYPE, null, contentQueriesFnName);
    }
    function stringAsType(str) {
        return o.expressionType(o.literal(str));
    }
    function stringMapAsType(map) {
        var mapValues = Object.keys(map).map(function (key) {
            var value = Array.isArray(map[key]) ? map[key][0] : map[key];
            return {
                key: key,
                value: o.literal(value),
                quoted: true,
            };
        });
        return o.expressionType(o.literalMap(mapValues));
    }
    function stringArrayAsType(arr) {
        return arr.length > 0 ? o.expressionType(o.literalArr(arr.map(function (value) { return o.literal(value); }))) :
            o.NONE_TYPE;
    }
    function createDirectiveTypeParams(meta) {
        // On the type side, remove newlines from the selector as it will need to fit into a TypeScript
        // string literal, which must be on one line.
        var selectorForType = meta.selector !== null ? meta.selector.replace(/\n/g, '') : null;
        return [
            util_2.typeWithParameters(meta.type.type, meta.typeArgumentCount),
            selectorForType !== null ? stringAsType(selectorForType) : o.NONE_TYPE,
            meta.exportAs !== null ? stringArrayAsType(meta.exportAs) : o.NONE_TYPE,
            stringMapAsType(meta.inputs),
            stringMapAsType(meta.outputs),
            stringArrayAsType(meta.queries.map(function (q) { return q.propertyName; })),
        ];
    }
    exports.createDirectiveTypeParams = createDirectiveTypeParams;
    /**
     * Creates the type specification from the directive meta. This type is inserted into .d.ts files
     * to be consumed by upstream compilations.
     */
    function createDirectiveType(meta) {
        var typeParams = createDirectiveTypeParams(meta);
        return o.expressionType(o.importExpr(r3_identifiers_1.Identifiers.DirectiveDeclaration, typeParams));
    }
    exports.createDirectiveType = createDirectiveType;
    // Define and update any view queries
    function createViewQueriesFunction(viewQueries, constantPool, name) {
        var createStatements = [];
        var updateStatements = [];
        var tempAllocator = util_3.temporaryAllocator(updateStatements, util_3.TEMPORARY_NAME);
        viewQueries.forEach(function (query) {
            // creation, e.g. r3.viewQuery(somePredicate, true);
            var queryDefinition = o.importExpr(r3_identifiers_1.Identifiers.viewQuery).callFn(prepareQueryParams(query, constantPool));
            createStatements.push(queryDefinition.toStmt());
            // update, e.g. (r3.queryRefresh(tmp = r3.loadQuery()) && (ctx.someDir = tmp));
            var temporary = tempAllocator();
            var getQueryList = o.importExpr(r3_identifiers_1.Identifiers.loadQuery).callFn([]);
            var refresh = o.importExpr(r3_identifiers_1.Identifiers.queryRefresh).callFn([temporary.set(getQueryList)]);
            var updateDirective = o.variable(util_3.CONTEXT_NAME)
                .prop(query.propertyName)
                .set(query.first ? temporary.prop('first') : temporary);
            updateStatements.push(refresh.and(updateDirective).toStmt());
        });
        var viewQueryFnName = name ? name + "_Query" : null;
        return o.fn([new o.FnParam(util_3.RENDER_FLAGS, o.NUMBER_TYPE), new o.FnParam(util_3.CONTEXT_NAME, null)], [
            template_1.renderFlagCheckIfStmt(1 /* Create */, createStatements),
            template_1.renderFlagCheckIfStmt(2 /* Update */, updateStatements)
        ], o.INFERRED_TYPE, null, viewQueryFnName);
    }
    // Return a host binding function or null if one is not necessary.
    function createHostBindingsFunction(hostBindingsMetadata, typeSourceSpan, bindingParser, constantPool, selector, name, definitionMap) {
        var bindingContext = o.variable(util_3.CONTEXT_NAME);
        var styleBuilder = new styling_builder_1.StylingBuilder(bindingContext);
        var _a = hostBindingsMetadata.specialAttributes, styleAttr = _a.styleAttr, classAttr = _a.classAttr;
        if (styleAttr !== undefined) {
            styleBuilder.registerStyleAttr(styleAttr);
        }
        if (classAttr !== undefined) {
            styleBuilder.registerClassAttr(classAttr);
        }
        var createStatements = [];
        var updateStatements = [];
        var hostBindingSourceSpan = typeSourceSpan;
        var directiveSummary = metadataAsSummary(hostBindingsMetadata);
        // Calculate host event bindings
        var eventBindings = bindingParser.createDirectiveHostEventAsts(directiveSummary, hostBindingSourceSpan);
        if (eventBindings && eventBindings.length) {
            var listeners = createHostListeners(eventBindings, name);
            createStatements.push.apply(createStatements, tslib_1.__spreadArray([], tslib_1.__read(listeners)));
        }
        // Calculate the host property bindings
        var bindings = bindingParser.createBoundHostProperties(directiveSummary, hostBindingSourceSpan);
        var allOtherBindings = [];
        // We need to calculate the total amount of binding slots required by
        // all the instructions together before any value conversions happen.
        // Value conversions may require additional slots for interpolation and
        // bindings with pipes. These calculates happen after this block.
        var totalHostVarsCount = 0;
        bindings && bindings.forEach(function (binding) {
            var stylingInputWasSet = styleBuilder.registerInputBasedOnName(binding.name, binding.expression, hostBindingSourceSpan);
            if (stylingInputWasSet) {
                totalHostVarsCount += styling_builder_1.MIN_STYLING_BINDING_SLOTS_REQUIRED;
            }
            else {
                allOtherBindings.push(binding);
                totalHostVarsCount++;
            }
        });
        var valueConverter;
        var getValueConverter = function () {
            if (!valueConverter) {
                var hostVarsCountFn = function (numSlots) {
                    var originalVarsCount = totalHostVarsCount;
                    totalHostVarsCount += numSlots;
                    return originalVarsCount;
                };
                valueConverter = new template_1.ValueConverter(constantPool, function () { return util_1.error('Unexpected node'); }, // new nodes are illegal here
                hostVarsCountFn, function () { return util_1.error('Unexpected pipe'); }); // pipes are illegal here
            }
            return valueConverter;
        };
        var propertyBindings = [];
        var attributeBindings = [];
        var syntheticHostBindings = [];
        allOtherBindings.forEach(function (binding) {
            // resolve literal arrays and literal objects
            var value = binding.expression.visit(getValueConverter());
            var bindingExpr = bindingFn(bindingContext, value);
            var _a = getBindingNameAndInstruction(binding), bindingName = _a.bindingName, instruction = _a.instruction, isAttribute = _a.isAttribute;
            var securityContexts = bindingParser.calcPossibleSecurityContexts(selector, bindingName, isAttribute)
                .filter(function (context) { return context !== core.SecurityContext.NONE; });
            var sanitizerFn = null;
            if (securityContexts.length) {
                if (securityContexts.length === 2 &&
                    securityContexts.indexOf(core.SecurityContext.URL) > -1 &&
                    securityContexts.indexOf(core.SecurityContext.RESOURCE_URL) > -1) {
                    // Special case for some URL attributes (such as "src" and "href") that may be a part
                    // of different security contexts. In this case we use special sanitization function and
                    // select the actual sanitizer at runtime based on a tag name that is provided while
                    // invoking sanitization function.
                    sanitizerFn = o.importExpr(r3_identifiers_1.Identifiers.sanitizeUrlOrResourceUrl);
                }
                else {
                    sanitizerFn = template_1.resolveSanitizationFn(securityContexts[0], isAttribute);
                }
            }
            var instructionParams = [o.literal(bindingName), bindingExpr.currValExpr];
            if (sanitizerFn) {
                instructionParams.push(sanitizerFn);
            }
            updateStatements.push.apply(updateStatements, tslib_1.__spreadArray([], tslib_1.__read(bindingExpr.stmts)));
            if (instruction === r3_identifiers_1.Identifiers.hostProperty) {
                propertyBindings.push(instructionParams);
            }
            else if (instruction === r3_identifiers_1.Identifiers.attribute) {
                attributeBindings.push(instructionParams);
            }
            else if (instruction === r3_identifiers_1.Identifiers.syntheticHostProperty) {
                syntheticHostBindings.push(instructionParams);
            }
            else {
                updateStatements.push(o.importExpr(instruction).callFn(instructionParams).toStmt());
            }
        });
        if (propertyBindings.length > 0) {
            updateStatements.push(util_3.chainedInstruction(r3_identifiers_1.Identifiers.hostProperty, propertyBindings).toStmt());
        }
        if (attributeBindings.length > 0) {
            updateStatements.push(util_3.chainedInstruction(r3_identifiers_1.Identifiers.attribute, attributeBindings).toStmt());
        }
        if (syntheticHostBindings.length > 0) {
            updateStatements.push(util_3.chainedInstruction(r3_identifiers_1.Identifiers.syntheticHostProperty, syntheticHostBindings).toStmt());
        }
        // since we're dealing with directives/components and both have hostBinding
        // functions, we need to generate a special hostAttrs instruction that deals
        // with both the assignment of styling as well as static attributes to the host
        // element. The instruction below will instruct all initial styling (styling
        // that is inside of a host binding within a directive/component) to be attached
        // to the host element alongside any of the provided host attributes that were
        // collected earlier.
        var hostAttrs = convertAttributesToExpressions(hostBindingsMetadata.attributes);
        styleBuilder.assignHostAttrs(hostAttrs, definitionMap);
        if (styleBuilder.hasBindings) {
            // finally each binding that was registered in the statement above will need to be added to
            // the update block of a component/directive templateFn/hostBindingsFn so that the bindings
            // are evaluated and updated for the element.
            styleBuilder.buildUpdateLevelInstructions(getValueConverter()).forEach(function (instruction) {
                if (instruction.calls.length > 0) {
                    var calls_1 = [];
                    instruction.calls.forEach(function (call) {
                        // we subtract a value of `1` here because the binding slot was already allocated
                        // at the top of this method when all the input bindings were counted.
                        totalHostVarsCount +=
                            Math.max(call.allocateBindingSlots - styling_builder_1.MIN_STYLING_BINDING_SLOTS_REQUIRED, 0);
                        calls_1.push(convertStylingCall(call, bindingContext, bindingFn));
                    });
                    updateStatements.push(util_3.chainedInstruction(instruction.reference, calls_1).toStmt());
                }
            });
        }
        if (totalHostVarsCount) {
            definitionMap.set('hostVars', o.literal(totalHostVarsCount));
        }
        if (createStatements.length > 0 || updateStatements.length > 0) {
            var hostBindingsFnName = name ? name + "_HostBindings" : null;
            var statements = [];
            if (createStatements.length > 0) {
                statements.push(template_1.renderFlagCheckIfStmt(1 /* Create */, createStatements));
            }
            if (updateStatements.length > 0) {
                statements.push(template_1.renderFlagCheckIfStmt(2 /* Update */, updateStatements));
            }
            return o.fn([new o.FnParam(util_3.RENDER_FLAGS, o.NUMBER_TYPE), new o.FnParam(util_3.CONTEXT_NAME, null)], statements, o.INFERRED_TYPE, null, hostBindingsFnName);
        }
        return null;
    }
    function bindingFn(implicit, value) {
        return expression_converter_1.convertPropertyBinding(null, implicit, value, 'b', expression_converter_1.BindingForm.Expression, function () { return util_1.error('Unexpected interpolation'); });
    }
    function convertStylingCall(call, bindingContext, bindingFn) {
        return call.params(function (value) { return bindingFn(bindingContext, value).currValExpr; });
    }
    function getBindingNameAndInstruction(binding) {
        var bindingName = binding.name;
        var instruction;
        // Check to see if this is an attr binding or a property binding
        var attrMatches = bindingName.match(ATTR_REGEX);
        if (attrMatches) {
            bindingName = attrMatches[1];
            instruction = r3_identifiers_1.Identifiers.attribute;
        }
        else {
            if (binding.isAnimation) {
                bindingName = util_2.prepareSyntheticPropertyName(bindingName);
                // host bindings that have a synthetic property (e.g. @foo) should always be rendered
                // in the context of the component and not the parent. Therefore there is a special
                // compatibility instruction available for this purpose.
                instruction = r3_identifiers_1.Identifiers.syntheticHostProperty;
            }
            else {
                instruction = r3_identifiers_1.Identifiers.hostProperty;
            }
        }
        return { bindingName: bindingName, instruction: instruction, isAttribute: !!attrMatches };
    }
    function createHostListeners(eventBindings, name) {
        var listeners = [];
        var syntheticListeners = [];
        var instructions = [];
        eventBindings.forEach(function (binding) {
            var bindingName = binding.name && compile_metadata_1.sanitizeIdentifier(binding.name);
            var bindingFnName = binding.type === 1 /* Animation */ ?
                util_2.prepareSyntheticListenerFunctionName(bindingName, binding.targetOrPhase) :
                bindingName;
            var handlerName = name && bindingName ? name + "_" + bindingFnName + "_HostBindingHandler" : null;
            var params = template_1.prepareEventListenerParameters(r3_ast_1.BoundEvent.fromParsedEvent(binding), handlerName);
            if (binding.type == 1 /* Animation */) {
                syntheticListeners.push(params);
            }
            else {
                listeners.push(params);
            }
        });
        if (syntheticListeners.length > 0) {
            instructions.push(util_3.chainedInstruction(r3_identifiers_1.Identifiers.syntheticHostListener, syntheticListeners).toStmt());
        }
        if (listeners.length > 0) {
            instructions.push(util_3.chainedInstruction(r3_identifiers_1.Identifiers.listener, listeners).toStmt());
        }
        return instructions;
    }
    function metadataAsSummary(meta) {
        // clang-format off
        return {
            // This is used by the BindingParser, which only deals with listeners and properties. There's no
            // need to pass attributes to it.
            hostAttributes: {},
            hostListeners: meta.listeners,
            hostProperties: meta.properties,
        };
        // clang-format on
    }
    var HOST_REG_EXP = /^(?:\[([^\]]+)\])|(?:\(([^\)]+)\))$/;
    function parseHostBindings(host) {
        var e_4, _a;
        var attributes = {};
        var listeners = {};
        var properties = {};
        var specialAttributes = {};
        try {
            for (var _b = tslib_1.__values(Object.keys(host)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var key = _c.value;
                var value = host[key];
                var matches = key.match(HOST_REG_EXP);
                if (matches === null) {
                    switch (key) {
                        case 'class':
                            if (typeof value !== 'string') {
                                // TODO(alxhub): make this a diagnostic.
                                throw new Error("Class binding must be string");
                            }
                            specialAttributes.classAttr = value;
                            break;
                        case 'style':
                            if (typeof value !== 'string') {
                                // TODO(alxhub): make this a diagnostic.
                                throw new Error("Style binding must be string");
                            }
                            specialAttributes.styleAttr = value;
                            break;
                        default:
                            if (typeof value === 'string') {
                                attributes[key] = o.literal(value);
                            }
                            else {
                                attributes[key] = value;
                            }
                    }
                }
                else if (matches[1 /* Binding */] != null) {
                    if (typeof value !== 'string') {
                        // TODO(alxhub): make this a diagnostic.
                        throw new Error("Property binding must be string");
                    }
                    // synthetic properties (the ones that have a `@` as a prefix)
                    // are still treated the same as regular properties. Therefore
                    // there is no point in storing them in a separate map.
                    properties[matches[1 /* Binding */]] = value;
                }
                else if (matches[2 /* Event */] != null) {
                    if (typeof value !== 'string') {
                        // TODO(alxhub): make this a diagnostic.
                        throw new Error("Event binding must be string");
                    }
                    listeners[matches[2 /* Event */]] = value;
                }
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_4) throw e_4.error; }
        }
        return { attributes: attributes, listeners: listeners, properties: properties, specialAttributes: specialAttributes };
    }
    exports.parseHostBindings = parseHostBindings;
    /**
     * Verifies host bindings and returns the list of errors (if any). Empty array indicates that a
     * given set of host bindings has no errors.
     *
     * @param bindings set of host bindings to verify.
     * @param sourceSpan source span where host bindings were defined.
     * @returns array of errors associated with a given set of host bindings.
     */
    function verifyHostBindings(bindings, sourceSpan) {
        var summary = metadataAsSummary(bindings);
        // TODO: abstract out host bindings verification logic and use it instead of
        // creating events and properties ASTs to detect errors (FW-996)
        var bindingParser = template_1.makeBindingParser();
        bindingParser.createDirectiveHostEventAsts(summary, sourceSpan);
        bindingParser.createBoundHostProperties(summary, sourceSpan);
        return bindingParser.errors;
    }
    exports.verifyHostBindings = verifyHostBindings;
    function compileStyles(styles, selector, hostSelector) {
        var shadowCss = new shadow_css_1.ShadowCss();
        return styles.map(function (style) {
            return shadowCss.shimCssText(style, selector, hostSelector);
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvcmVuZGVyMy92aWV3L2NvbXBpbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCwyRUFBbUY7SUFDbkYsaUdBQTZGO0lBRTdGLGlEQUFtQztJQUVuQywyREFBNkM7SUFFN0MsMkRBQTREO0lBQzVELCtEQUEyQztJQUMzQyx1RUFBNkQ7SUFFN0QsbURBQWlDO0lBQ2pDLCtEQUFxQztJQUNyQywrRUFBb0Q7SUFDcEQsMkRBQXFJO0lBR3JJLHNGQUE2RztJQUM3Ryx3RUFBb0w7SUFDcEwsZ0VBQTRMO0lBRzVMLDZGQUE2RjtJQUM3Rix5RkFBeUY7SUFDekYsSUFBTSxVQUFVLEdBQUcsZ0JBQWdCLENBQUM7SUFFcEMsU0FBUyxtQkFBbUIsQ0FDeEIsSUFBeUIsRUFBRSxZQUEwQixFQUNyRCxhQUE0QjtRQUM5QixJQUFNLGFBQWEsR0FBRyxJQUFJLG9CQUFhLEVBQUUsQ0FBQztRQUMxQyxJQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMseUJBQXlCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRWhFLDJCQUEyQjtRQUMzQixhQUFhLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7UUFFN0MsMENBQTBDO1FBQzFDLElBQUksU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDeEIsYUFBYSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsZ0JBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1NBQ3REO1FBRUQsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDM0IsdURBQXVEO1lBQ3ZELGFBQWEsQ0FBQyxHQUFHLENBQ2IsZ0JBQWdCLEVBQUUsNEJBQTRCLENB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QUFDO0lBQzlCLENBQUM7SUFURCxnREFTQztJQUVELFNBQVMsYUFBYSxDQUFDLE1BQWdCLEVBQUUsUUFBZ0IsRUFBRSxZQUFvQjtRQUM3RSxJQUFNLFNBQVMsR0FBRyxJQUFJLHNCQUFTLEVBQUUsQ0FBQztRQUNsQyxPQUFPLE1BQU0sQ0FBQyxHQUFHLENBQUMsVUFBQSxLQUFLO1lBQ3JCLE9BQU8sU0FBVSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQy9ELENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbXBpbGVEaXJlY3RpdmVTdW1tYXJ5LCBzYW5pdGl6ZUlkZW50aWZpZXJ9IGZyb20gJy4uLy4uL2NvbXBpbGVfbWV0YWRhdGEnO1xuaW1wb3J0IHtCaW5kaW5nRm9ybSwgY29udmVydFByb3BlcnR5QmluZGluZ30gZnJvbSAnLi4vLi4vY29tcGlsZXJfdXRpbC9leHByZXNzaW9uX2NvbnZlcnRlcic7XG5pbXBvcnQge0NvbnN0YW50UG9vbH0gZnJvbSAnLi4vLi4vY29uc3RhbnRfcG9vbCc7XG5pbXBvcnQgKiBhcyBjb3JlIGZyb20gJy4uLy4uL2NvcmUnO1xuaW1wb3J0IHtBU1QsIFBhcnNlZEV2ZW50LCBQYXJzZWRFdmVudFR5cGUsIFBhcnNlZFByb3BlcnR5fSBmcm9tICcuLi8uLi9leHByZXNzaW9uX3BhcnNlci9hc3QnO1xuaW1wb3J0ICogYXMgbyBmcm9tICcuLi8uLi9vdXRwdXQvb3V0cHV0X2FzdCc7XG5pbXBvcnQge1BhcnNlRXJyb3IsIFBhcnNlU291cmNlU3Bhbn0gZnJvbSAnLi4vLi4vcGFyc2VfdXRpbCc7XG5pbXBvcnQge0Nzc1NlbGVjdG9yLCBTZWxlY3Rvck1hdGNoZXJ9IGZyb20gJy4uLy4uL3NlbGVjdG9yJztcbmltcG9ydCB7U2hhZG93Q3NzfSBmcm9tICcuLi8uLi9zaGFkb3dfY3NzJztcbmltcG9ydCB7Q09OVEVOVF9BVFRSLCBIT1NUX0FUVFJ9IGZyb20gJy4uLy4uL3N0eWxlX2NvbXBpbGVyJztcbmltcG9ydCB7QmluZGluZ1BhcnNlcn0gZnJvbSAnLi4vLi4vdGVtcGxhdGVfcGFyc2VyL2JpbmRpbmdfcGFyc2VyJztcbmltcG9ydCB7ZXJyb3J9IGZyb20gJy4uLy4uL3V0aWwnO1xuaW1wb3J0IHtCb3VuZEV2ZW50fSBmcm9tICcuLi9yM19hc3QnO1xuaW1wb3J0IHtJZGVudGlmaWVycyBhcyBSM30gZnJvbSAnLi4vcjNfaWRlbnRpZmllcnMnO1xuaW1wb3J0IHtwcmVwYXJlU3ludGhldGljTGlzdGVuZXJGdW5jdGlvbk5hbWUsIHByZXBhcmVTeW50aGV0aWNQcm9wZXJ0eU5hbWUsIFIzQ29tcGlsZWRFeHByZXNzaW9uLCB0eXBlV2l0aFBhcmFtZXRlcnN9IGZyb20gJy4uL3V0aWwnO1xuXG5pbXBvcnQge0RlY2xhcmF0aW9uTGlzdEVtaXRNb2RlLCBSM0NvbXBvbmVudE1ldGFkYXRhLCBSM0RpcmVjdGl2ZU1ldGFkYXRhLCBSM0hvc3RNZXRhZGF0YSwgUjNRdWVyeU1ldGFkYXRhfSBmcm9tICcuL2FwaSc7XG5pbXBvcnQge01JTl9TVFlMSU5HX0JJTkRJTkdfU0xPVFNfUkVRVUlSRUQsIFN0eWxpbmdCdWlsZGVyLCBTdHlsaW5nSW5zdHJ1Y3Rpb25DYWxsfSBmcm9tICcuL3N0eWxpbmdfYnVpbGRlcic7XG5pbXBvcnQge0JpbmRpbmdTY29wZSwgbWFrZUJpbmRpbmdQYXJzZXIsIHByZXBhcmVFdmVudExpc3RlbmVyUGFyYW1ldGVycywgcmVuZGVyRmxhZ0NoZWNrSWZTdG10LCByZXNvbHZlU2FuaXRpemF0aW9uRm4sIFRlbXBsYXRlRGVmaW5pdGlvbkJ1aWxkZXIsIFZhbHVlQ29udmVydGVyfSBmcm9tICcuL3RlbXBsYXRlJztcbmltcG9ydCB7YXNMaXRlcmFsLCBjaGFpbmVkSW5zdHJ1Y3Rpb24sIGNvbmRpdGlvbmFsbHlDcmVhdGVNYXBPYmplY3RMaXRlcmFsLCBDT05URVhUX05BTUUsIERlZmluaXRpb25NYXAsIGdldFF1ZXJ5UHJlZGljYXRlLCBSRU5ERVJfRkxBR1MsIFRFTVBPUkFSWV9OQU1FLCB0ZW1wb3JhcnlBbGxvY2F0b3J9IGZyb20gJy4vdXRpbCc7XG5cblxuLy8gVGhpcyByZWdleCBtYXRjaGVzIGFueSBiaW5kaW5nIG5hbWVzIHRoYXQgY29udGFpbiB0aGUgXCJhdHRyLlwiIHByZWZpeCwgZS5nLiBcImF0dHIucmVxdWlyZWRcIlxuLy8gSWYgdGhlcmUgaXMgYSBtYXRjaCwgdGhlIGZpcnN0IG1hdGNoaW5nIGdyb3VwIHdpbGwgY29udGFpbiB0aGUgYXR0cmlidXRlIG5hbWUgdG8gYmluZC5cbmNvbnN0IEFUVFJfUkVHRVggPSAvYXR0clxcLihbXlxcXV0rKS87XG5cbmZ1bmN0aW9uIGJhc2VEaXJlY3RpdmVGaWVsZHMoXG4gICAgbWV0YTogUjNEaXJlY3RpdmVNZXRhZGF0YSwgY29uc3RhbnRQb29sOiBDb25zdGFudFBvb2wsXG4gICAgYmluZGluZ1BhcnNlcjogQmluZGluZ1BhcnNlcik6IERlZmluaXRpb25NYXAge1xuICBjb25zdCBkZWZpbml0aW9uTWFwID0gbmV3IERlZmluaXRpb25NYXAoKTtcbiAgY29uc3Qgc2VsZWN0b3JzID0gY29yZS5wYXJzZVNlbGVjdG9yVG9SM1NlbGVjdG9yKG1ldGEuc2VsZWN0b3IpO1xuXG4gIC8vIGUuZy4gYHR5cGU6IE15RGlyZWN0aXZlYFxuICBkZWZpbml0aW9uTWFwLnNldCgndHlwZScsIG1ldGEuaW50ZXJuYWxUeXBlKTtcblxuICAvLyBlLmcuIGBzZWxlY3RvcnM6IFtbJycsICdzb21lRGlyJywgJyddXWBcbiAgaWYgKHNlbGVjdG9ycy5sZW5ndGggPiAwKSB7XG4gICAgZGVmaW5pdGlvbk1hcC5zZXQoJ3NlbGVjdG9ycycsIGFzTGl0ZXJhbChzZWxlY3RvcnMpKTtcbiAgfVxuXG4gIGlmIChtZXRhLnF1ZXJpZXMubGVuZ3RoID4gMCkge1xuICAgIC8vIGUuZy4gYGNvbnRlbnRRdWVyaWVzOiAocmYsIGN0eCwgZGlySW5kZXgpID0+IHsgLi4uIH1cbiAgICBkZWZpbml0aW9uTWFwLnNldChcbiAgICAgICAgJ2NvbnRlbnRRdWVyaWVzJywgY3JlYXRlQ29udGVudFF1ZXJpZXNGdW5jdGlvbihtZXRhLnF1ZXJpZXMsIGNvbnN0YW50UG9vbCwgbWV0YS5uYW1lKSk7XG4gIH1cblxuICBpZiAobWV0YS52aWV3UXVlcmllcy5sZW5ndGgpIHtcbiAgICBkZWZpbml0aW9uTWFwLnNldChcbiAgICAgICAgJ3ZpZXdRdWVyeScsIGNyZWF0ZVZpZXdRdWVyaWVzRnVuY3Rpb24obWV0YS52aWV3UXVlcmllcywgY29uc3RhbnRQb29sLCBtZXRhLm5hbWUpKTtcbiAgfVxuXG4gIC8vIGUuZy4gYGhvc3RCaW5kaW5nczogKHJmLCBjdHgpID0+IHsgLi4uIH1cbiAgZGVmaW5pdGlvbk1hcC5zZXQoXG4gICAgICAnaG9zdEJpbmRpbmdzJyxcbiAgICAgIGNyZWF0ZUhvc3RCaW5kaW5nc0Z1bmN0aW9uKFxuICAgICAgICAgIG1ldGEuaG9zdCwgbWV0YS50eXBlU291cmNlU3BhbiwgYmluZGluZ1BhcnNlciwgY29uc3RhbnRQb29sLCBtZXRhLnNlbGVjdG9yIHx8ICcnLFxuICAgICAgICAgIG1ldGEubmFtZSwgZGVmaW5pdGlvbk1hcCkpO1xuXG4gIC8vIGUuZyAnaW5wdXRzOiB7YTogJ2EnfWBcbiAgZGVmaW5pdGlvbk1hcC5zZXQoJ2lucHV0cycsIGNvbmRpdGlvbmFsbHlDcmVhdGVNYXBPYmplY3RMaXRlcmFsKG1ldGEuaW5wdXRzLCB0cnVlKSk7XG5cbiAgLy8gZS5nICdvdXRwdXRzOiB7YTogJ2EnfWBcbiAgZGVmaW5pdGlvbk1hcC5zZXQoJ291dHB1dHMnLCBjb25kaXRpb25hbGx5Q3JlYXRlTWFwT2JqZWN0TGl0ZXJhbChtZXRhLm91dHB1dHMpKTtcblxuICBpZiAobWV0YS5leHBvcnRBcyAhPT0gbnVsbCkge1xuICAgIGRlZmluaXRpb25NYXAuc2V0KCdleHBvcnRBcycsIG8ubGl0ZXJhbEFycihtZXRhLmV4cG9ydEFzLm1hcChlID0+IG8ubGl0ZXJhbChlKSkpKTtcbiAgfVxuXG4gIHJldHVybiBkZWZpbml0aW9uTWFwO1xufVxuXG4vKipcbiAqIEFkZCBmZWF0dXJlcyB0byB0aGUgZGVmaW5pdGlvbiBtYXAuXG4gKi9cbmZ1bmN0aW9uIGFkZEZlYXR1cmVzKGRlZmluaXRpb25NYXA6IERlZmluaXRpb25NYXAsIG1ldGE6IFIzRGlyZWN0aXZlTWV0YWRhdGF8UjNDb21wb25lbnRNZXRhZGF0YSkge1xuICAvLyBlLmcuIGBmZWF0dXJlczogW05nT25DaGFuZ2VzRmVhdHVyZV1gXG4gIGNvbnN0IGZlYXR1cmVzOiBvLkV4cHJlc3Npb25bXSA9IFtdO1xuXG4gIGNvbnN0IHByb3ZpZGVycyA9IG1ldGEucHJvdmlkZXJzO1xuICBjb25zdCB2aWV3UHJvdmlkZXJzID0gKG1ldGEgYXMgUjNDb21wb25lbnRNZXRhZGF0YSkudmlld1Byb3ZpZGVycztcbiAgaWYgKHByb3ZpZGVycyB8fCB2aWV3UHJvdmlkZXJzKSB7XG4gICAgY29uc3QgYXJncyA9IFtwcm92aWRlcnMgfHwgbmV3IG8uTGl0ZXJhbEFycmF5RXhwcihbXSldO1xuICAgIGlmICh2aWV3UHJvdmlkZXJzKSB7XG4gICAgICBhcmdzLnB1c2godmlld1Byb3ZpZGVycyk7XG4gICAgfVxuICAgIGZlYXR1cmVzLnB1c2goby5pbXBvcnRFeHByKFIzLlByb3ZpZGVyc0ZlYXR1cmUpLmNhbGxGbihhcmdzKSk7XG4gIH1cblxuICBpZiAobWV0YS51c2VzSW5oZXJpdGFuY2UpIHtcbiAgICBmZWF0dXJlcy5wdXNoKG8uaW1wb3J0RXhwcihSMy5Jbmhlcml0RGVmaW5pdGlvbkZlYXR1cmUpKTtcbiAgfVxuICBpZiAobWV0YS5mdWxsSW5oZXJpdGFuY2UpIHtcbiAgICBmZWF0dXJlcy5wdXNoKG8uaW1wb3J0RXhwcihSMy5Db3B5RGVmaW5pdGlvbkZlYXR1cmUpKTtcbiAgfVxuICBpZiAobWV0YS5saWZlY3ljbGUudXNlc09uQ2hhbmdlcykge1xuICAgIGZlYXR1cmVzLnB1c2goby5pbXBvcnRFeHByKFIzLk5nT25DaGFuZ2VzRmVhdHVyZSkpO1xuICB9XG4gIGlmIChmZWF0dXJlcy5sZW5ndGgpIHtcbiAgICBkZWZpbml0aW9uTWFwLnNldCgnZmVhdHVyZXMnLCBvLmxpdGVyYWxBcnIoZmVhdHVyZXMpKTtcbiAgfVxufVxuXG4vKipcbiAqIENvbXBpbGUgYSBkaXJlY3RpdmUgZm9yIHRoZSByZW5kZXIzIHJ1bnRpbWUgYXMgZGVmaW5lZCBieSB0aGUgYFIzRGlyZWN0aXZlTWV0YWRhdGFgLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY29tcGlsZURpcmVjdGl2ZUZyb21NZXRhZGF0YShcbiAgICBtZXRhOiBSM0RpcmVjdGl2ZU1ldGFkYXRhLCBjb25zdGFudFBvb2w6IENvbnN0YW50UG9vbCxcbiAgICBiaW5kaW5nUGFyc2VyOiBCaW5kaW5nUGFyc2VyKTogUjNDb21waWxlZEV4cHJlc3Npb24ge1xuICBjb25zdCBkZWZpbml0aW9uTWFwID0gYmFzZURpcmVjdGl2ZUZpZWxkcyhtZXRhLCBjb25zdGFudFBvb2wsIGJpbmRpbmdQYXJzZXIpO1xuICBhZGRGZWF0dXJlcyhkZWZpbml0aW9uTWFwLCBtZXRhKTtcbiAgY29uc3QgZXhwcmVzc2lvbiA9XG4gICAgICBvLmltcG9ydEV4cHIoUjMuZGVmaW5lRGlyZWN0aXZlKS5jYWxsRm4oW2RlZmluaXRpb25NYXAudG9MaXRlcmFsTWFwKCldLCB1bmRlZmluZWQsIHRydWUpO1xuICBjb25zdCB0eXBlID0gY3JlYXRlRGlyZWN0aXZlVHlwZShtZXRhKTtcblxuICByZXR1cm4ge2V4cHJlc3Npb24sIHR5cGUsIHN0YXRlbWVudHM6IFtdfTtcbn1cblxuLyoqXG4gKiBDb21waWxlIGEgY29tcG9uZW50IGZvciB0aGUgcmVuZGVyMyBydW50aW1lIGFzIGRlZmluZWQgYnkgdGhlIGBSM0NvbXBvbmVudE1ldGFkYXRhYC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbXBpbGVDb21wb25lbnRGcm9tTWV0YWRhdGEoXG4gICAgbWV0YTogUjNDb21wb25lbnRNZXRhZGF0YSwgY29uc3RhbnRQb29sOiBDb25zdGFudFBvb2wsXG4gICAgYmluZGluZ1BhcnNlcjogQmluZGluZ1BhcnNlcik6IFIzQ29tcGlsZWRFeHByZXNzaW9uIHtcbiAgY29uc3QgZGVmaW5pdGlvbk1hcCA9IGJhc2VEaXJlY3RpdmVGaWVsZHMobWV0YSwgY29uc3RhbnRQb29sLCBiaW5kaW5nUGFyc2VyKTtcbiAgYWRkRmVhdHVyZXMoZGVmaW5pdGlvbk1hcCwgbWV0YSk7XG5cbiAgY29uc3Qgc2VsZWN0b3IgPSBtZXRhLnNlbGVjdG9yICYmIENzc1NlbGVjdG9yLnBhcnNlKG1ldGEuc2VsZWN0b3IpO1xuICBjb25zdCBmaXJzdFNlbGVjdG9yID0gc2VsZWN0b3IgJiYgc2VsZWN0b3JbMF07XG5cbiAgLy8gZS5nLiBgYXR0cjogW1wiY2xhc3NcIiwgXCIubXkuYXBwXCJdYFxuICAvLyBUaGlzIGlzIG9wdGlvbmFsIGFuIG9ubHkgaW5jbHVkZWQgaWYgdGhlIGZpcnN0IHNlbGVjdG9yIG9mIGEgY29tcG9uZW50IHNwZWNpZmllcyBhdHRyaWJ1dGVzLlxuICBpZiAoZmlyc3RTZWxlY3Rvcikge1xuICAgIGNvbnN0IHNlbGVjdG9yQXR0cmlidXRlcyA9IGZpcnN0U2VsZWN0b3IuZ2V0QXR0cnMoKTtcbiAgICBpZiAoc2VsZWN0b3JBdHRyaWJ1dGVzLmxlbmd0aCkge1xuICAgICAgZGVmaW5pdGlvbk1hcC5zZXQoXG4gICAgICAgICAgJ2F0dHJzJyxcbiAgICAgICAgICBjb25zdGFudFBvb2wuZ2V0Q29uc3RMaXRlcmFsKFxuICAgICAgICAgICAgICBvLmxpdGVyYWxBcnIoc2VsZWN0b3JBdHRyaWJ1dGVzLm1hcChcbiAgICAgICAgICAgICAgICAgIHZhbHVlID0+IHZhbHVlICE9IG51bGwgPyBvLmxpdGVyYWwodmFsdWUpIDogby5saXRlcmFsKHVuZGVmaW5lZCkpKSxcbiAgICAgICAgICAgICAgLyogZm9yY2VTaGFyZWQgKi8gdHJ1ZSkpO1xuICAgIH1cbiAgfVxuXG4gIC8vIEdlbmVyYXRlIHRoZSBDU1MgbWF0Y2hlciB0aGF0IHJlY29nbml6ZSBkaXJlY3RpdmVcbiAgbGV0IGRpcmVjdGl2ZU1hdGNoZXI6IFNlbGVjdG9yTWF0Y2hlcnxudWxsID0gbnVsbDtcblxuICBpZiAobWV0YS5kaXJlY3RpdmVzLmxlbmd0aCA+IDApIHtcbiAgICBjb25zdCBtYXRjaGVyID0gbmV3IFNlbGVjdG9yTWF0Y2hlcigpO1xuICAgIGZvciAoY29uc3Qge3NlbGVjdG9yLCB0eXBlfSBvZiBtZXRhLmRpcmVjdGl2ZXMpIHtcbiAgICAgIG1hdGNoZXIuYWRkU2VsZWN0YWJsZXMoQ3NzU2VsZWN0b3IucGFyc2Uoc2VsZWN0b3IpLCB0eXBlKTtcbiAgICB9XG4gICAgZGlyZWN0aXZlTWF0Y2hlciA9IG1hdGNoZXI7XG4gIH1cblxuICAvLyBlLmcuIGB0ZW1wbGF0ZTogZnVuY3Rpb24gTXlDb21wb25lbnRfVGVtcGxhdGUoX2N0eCwgX2NtKSB7Li4ufWBcbiAgY29uc3QgdGVtcGxhdGVUeXBlTmFtZSA9IG1ldGEubmFtZTtcbiAgY29uc3QgdGVtcGxhdGVOYW1lID0gdGVtcGxhdGVUeXBlTmFtZSA/IGAke3RlbXBsYXRlVHlwZU5hbWV9X1RlbXBsYXRlYCA6IG51bGw7XG5cbiAgY29uc3QgZGlyZWN0aXZlc1VzZWQgPSBuZXcgU2V0PG8uRXhwcmVzc2lvbj4oKTtcbiAgY29uc3QgcGlwZXNVc2VkID0gbmV3IFNldDxvLkV4cHJlc3Npb24+KCk7XG4gIGNvbnN0IGNoYW5nZURldGVjdGlvbiA9IG1ldGEuY2hhbmdlRGV0ZWN0aW9uO1xuXG4gIGNvbnN0IHRlbXBsYXRlID0gbWV0YS50ZW1wbGF0ZTtcbiAgY29uc3QgdGVtcGxhdGVCdWlsZGVyID0gbmV3IFRlbXBsYXRlRGVmaW5pdGlvbkJ1aWxkZXIoXG4gICAgICBjb25zdGFudFBvb2wsIEJpbmRpbmdTY29wZS5jcmVhdGVSb290U2NvcGUoKSwgMCwgdGVtcGxhdGVUeXBlTmFtZSwgbnVsbCwgbnVsbCwgdGVtcGxhdGVOYW1lLFxuICAgICAgZGlyZWN0aXZlTWF0Y2hlciwgZGlyZWN0aXZlc1VzZWQsIG1ldGEucGlwZXMsIHBpcGVzVXNlZCwgUjMubmFtZXNwYWNlSFRNTCxcbiAgICAgIG1ldGEucmVsYXRpdmVDb250ZXh0RmlsZVBhdGgsIG1ldGEuaTE4blVzZUV4dGVybmFsSWRzKTtcblxuICBjb25zdCB0ZW1wbGF0ZUZ1bmN0aW9uRXhwcmVzc2lvbiA9IHRlbXBsYXRlQnVpbGRlci5idWlsZFRlbXBsYXRlRnVuY3Rpb24odGVtcGxhdGUubm9kZXMsIFtdKTtcblxuICAvLyBXZSBuZWVkIHRvIHByb3ZpZGUgdGhpcyBzbyB0aGF0IGR5bmFtaWNhbGx5IGdlbmVyYXRlZCBjb21wb25lbnRzIGtub3cgd2hhdFxuICAvLyBwcm9qZWN0ZWQgY29udGVudCBibG9ja3MgdG8gcGFzcyB0aHJvdWdoIHRvIHRoZSBjb21wb25lbnQgd2hlbiBpdCBpcyBpbnN0YW50aWF0ZWQuXG4gIGNvbnN0IG5nQ29udGVudFNlbGVjdG9ycyA9IHRlbXBsYXRlQnVpbGRlci5nZXROZ0NvbnRlbnRTZWxlY3RvcnMoKTtcbiAgaWYgKG5nQ29udGVudFNlbGVjdG9ycykge1xuICAgIGRlZmluaXRpb25NYXAuc2V0KCduZ0NvbnRlbnRTZWxlY3RvcnMnLCBuZ0NvbnRlbnRTZWxlY3RvcnMpO1xuICB9XG5cbiAgLy8gZS5nLiBgZGVjbHM6IDJgXG4gIGRlZmluaXRpb25NYXAuc2V0KCdkZWNscycsIG8ubGl0ZXJhbCh0ZW1wbGF0ZUJ1aWxkZXIuZ2V0Q29uc3RDb3VudCgpKSk7XG5cbiAgLy8gZS5nLiBgdmFyczogMmBcbiAgZGVmaW5pdGlvbk1hcC5zZXQoJ3ZhcnMnLCBvLmxpdGVyYWwodGVtcGxhdGVCdWlsZGVyLmdldFZhckNvdW50KCkpKTtcblxuICAvLyBHZW5lcmF0ZSBgY29uc3RzYCBzZWN0aW9uIG9mIENvbXBvbmVudERlZjpcbiAgLy8gLSBlaXRoZXIgYXMgYW4gYXJyYXk6XG4gIC8vICAgYGNvbnN0czogW1snb25lJywgJ3R3byddLCBbJ3RocmVlJywgJ2ZvdXInXV1gXG4gIC8vIC0gb3IgYXMgYSBmYWN0b3J5IGZ1bmN0aW9uIGluIGNhc2UgYWRkaXRpb25hbCBzdGF0ZW1lbnRzIGFyZSBwcmVzZW50ICh0byBzdXBwb3J0IGkxOG4pOlxuICAvLyAgIGBjb25zdHM6IGZ1bmN0aW9uKCkgeyB2YXIgaTE4bl8wOyBpZiAobmdJMThuQ2xvc3VyZU1vZGUpIHsuLi59IGVsc2Ugey4uLn0gcmV0dXJuIFtpMThuXzBdOyB9YFxuICBjb25zdCB7Y29uc3RFeHByZXNzaW9ucywgcHJlcGFyZVN0YXRlbWVudHN9ID0gdGVtcGxhdGVCdWlsZGVyLmdldENvbnN0cygpO1xuICBpZiAoY29uc3RFeHByZXNzaW9ucy5sZW5ndGggPiAwKSB7XG4gICAgbGV0IGNvbnN0c0V4cHI6IG8uTGl0ZXJhbEFycmF5RXhwcnxvLkZ1bmN0aW9uRXhwciA9IG8ubGl0ZXJhbEFycihjb25zdEV4cHJlc3Npb25zKTtcbiAgICAvLyBQcmVwYXJlIHN0YXRlbWVudHMgYXJlIHByZXNlbnQgLSB0dXJuIGBjb25zdHNgIGludG8gYSBmdW5jdGlvbi5cbiAgICBpZiAocHJlcGFyZVN0YXRlbWVudHMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3RzRXhwciA9IG8uZm4oW10sIFsuLi5wcmVwYXJlU3RhdGVtZW50cywgbmV3IG8uUmV0dXJuU3RhdGVtZW50KGNvbnN0c0V4cHIpXSk7XG4gICAgfVxuICAgIGRlZmluaXRpb25NYXAuc2V0KCdjb25zdHMnLCBjb25zdHNFeHByKTtcbiAgfVxuXG4gIGRlZmluaXRpb25NYXAuc2V0KCd0ZW1wbGF0ZScsIHRlbXBsYXRlRnVuY3Rpb25FeHByZXNzaW9uKTtcblxuICAvLyBlLmcuIGBkaXJlY3RpdmVzOiBbTXlEaXJlY3RpdmVdYFxuICBpZiAoZGlyZWN0aXZlc1VzZWQuc2l6ZSkge1xuICAgIGNvbnN0IGRpcmVjdGl2ZXNMaXN0ID0gby5saXRlcmFsQXJyKEFycmF5LmZyb20oZGlyZWN0aXZlc1VzZWQpKTtcbiAgICBjb25zdCBkaXJlY3RpdmVzRXhwciA9IGNvbXBpbGVEZWNsYXJhdGlvbkxpc3QoZGlyZWN0aXZlc0xpc3QsIG1ldGEuZGVjbGFyYXRpb25MaXN0RW1pdE1vZGUpO1xuICAgIGRlZmluaXRpb25NYXAuc2V0KCdkaXJlY3RpdmVzJywgZGlyZWN0aXZlc0V4cHIpO1xuICB9XG5cbiAgLy8gZS5nLiBgcGlwZXM6IFtNeVBpcGVdYFxuICBpZiAocGlwZXNVc2VkLnNpemUpIHtcbiAgICBjb25zdCBwaXBlc0xpc3QgPSBvLmxpdGVyYWxBcnIoQXJyYXkuZnJvbShwaXBlc1VzZWQpKTtcbiAgICBjb25zdCBwaXBlc0V4cHIgPSBjb21waWxlRGVjbGFyYXRpb25MaXN0KHBpcGVzTGlzdCwgbWV0YS5kZWNsYXJhdGlvbkxpc3RFbWl0TW9kZSk7XG4gICAgZGVmaW5pdGlvbk1hcC5zZXQoJ3BpcGVzJywgcGlwZXNFeHByKTtcbiAgfVxuXG4gIGlmIChtZXRhLmVuY2Fwc3VsYXRpb24gPT09IG51bGwpIHtcbiAgICBtZXRhLmVuY2Fwc3VsYXRpb24gPSBjb3JlLlZpZXdFbmNhcHN1bGF0aW9uLkVtdWxhdGVkO1xuICB9XG5cbiAgLy8gZS5nLiBgc3R5bGVzOiBbc3RyMSwgc3RyMl1gXG4gIGlmIChtZXRhLnN0eWxlcyAmJiBtZXRhLnN0eWxlcy5sZW5ndGgpIHtcbiAgICBjb25zdCBzdHlsZVZhbHVlcyA9IG1ldGEuZW5jYXBzdWxhdGlvbiA9PSBjb3JlLlZpZXdFbmNhcHN1bGF0aW9uLkVtdWxhdGVkID9cbiAgICAgICAgY29tcGlsZVN0eWxlcyhtZXRhLnN0eWxlcywgQ09OVEVOVF9BVFRSLCBIT1NUX0FUVFIpIDpcbiAgICAgICAgbWV0YS5zdHlsZXM7XG4gICAgY29uc3Qgc3RyaW5ncyA9IHN0eWxlVmFsdWVzLm1hcChzdHIgPT4gY29uc3RhbnRQb29sLmdldENvbnN0TGl0ZXJhbChvLmxpdGVyYWwoc3RyKSkpO1xuICAgIGRlZmluaXRpb25NYXAuc2V0KCdzdHlsZXMnLCBvLmxpdGVyYWxBcnIoc3RyaW5ncykpO1xuICB9IGVsc2UgaWYgKG1ldGEuZW5jYXBzdWxhdGlvbiA9PT0gY29yZS5WaWV3RW5jYXBzdWxhdGlvbi5FbXVsYXRlZCkge1xuICAgIC8vIElmIHRoZXJlIGlzIG5vIHN0eWxlLCBkb24ndCBnZW5lcmF0ZSBjc3Mgc2VsZWN0b3JzIG9uIGVsZW1lbnRzXG4gICAgbWV0YS5lbmNhcHN1bGF0aW9uID0gY29yZS5WaWV3RW5jYXBzdWxhdGlvbi5Ob25lO1xuICB9XG5cbiAgLy8gT25seSBzZXQgdmlldyBlbmNhcHN1bGF0aW9uIGlmIGl0J3Mgbm90IHRoZSBkZWZhdWx0IHZhbHVlXG4gIGlmIChtZXRhLmVuY2Fwc3VsYXRpb24gIT09IGNvcmUuVmlld0VuY2Fwc3VsYXRpb24uRW11bGF0ZWQpIHtcbiAgICBkZWZpbml0aW9uTWFwLnNldCgnZW5jYXBzdWxhdGlvbicsIG8ubGl0ZXJhbChtZXRhLmVuY2Fwc3VsYXRpb24pKTtcbiAgfVxuXG4gIC8vIGUuZy4gYGFuaW1hdGlvbjogW3RyaWdnZXIoJzEyMycsIFtdKV1gXG4gIGlmIChtZXRhLmFuaW1hdGlvbnMgIT09IG51bGwpIHtcbiAgICBkZWZpbml0aW9uTWFwLnNldChcbiAgICAgICAgJ2RhdGEnLCBvLmxpdGVyYWxNYXAoW3trZXk6ICdhbmltYXRpb24nLCB2YWx1ZTogbWV0YS5hbmltYXRpb25zLCBxdW90ZWQ6IGZhbHNlfV0pKTtcbiAgfVxuXG4gIC8vIE9ubHkgc2V0IHRoZSBjaGFuZ2UgZGV0ZWN0aW9uIGZsYWcgaWYgaXQncyBkZWZpbmVkIGFuZCBpdCdzIG5vdCB0aGUgZGVmYXVsdC5cbiAgaWYgKGNoYW5nZURldGVjdGlvbiAhPSBudWxsICYmIGNoYW5nZURldGVjdGlvbiAhPT0gY29yZS5DaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5EZWZhdWx0KSB7XG4gICAgZGVmaW5pdGlvbk1hcC5zZXQoJ2NoYW5nZURldGVjdGlvbicsIG8ubGl0ZXJhbChjaGFuZ2VEZXRlY3Rpb24pKTtcbiAgfVxuXG4gIGNvbnN0IGV4cHJlc3Npb24gPVxuICAgICAgby5pbXBvcnRFeHByKFIzLmRlZmluZUNvbXBvbmVudCkuY2FsbEZuKFtkZWZpbml0aW9uTWFwLnRvTGl0ZXJhbE1hcCgpXSwgdW5kZWZpbmVkLCB0cnVlKTtcbiAgY29uc3QgdHlwZSA9IGNyZWF0ZUNvbXBvbmVudFR5cGUobWV0YSk7XG5cbiAgcmV0dXJuIHtleHByZXNzaW9uLCB0eXBlLCBzdGF0ZW1lbnRzOiBbXX07XG59XG5cbi8qKlxuICogQ3JlYXRlcyB0aGUgdHlwZSBzcGVjaWZpY2F0aW9uIGZyb20gdGhlIGNvbXBvbmVudCBtZXRhLiBUaGlzIHR5cGUgaXMgaW5zZXJ0ZWQgaW50byAuZC50cyBmaWxlc1xuICogdG8gYmUgY29uc3VtZWQgYnkgdXBzdHJlYW0gY29tcGlsYXRpb25zLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQ29tcG9uZW50VHlwZShtZXRhOiBSM0NvbXBvbmVudE1ldGFkYXRhKTogby5UeXBlIHtcbiAgY29uc3QgdHlwZVBhcmFtcyA9IGNyZWF0ZURpcmVjdGl2ZVR5cGVQYXJhbXMobWV0YSk7XG4gIHR5cGVQYXJhbXMucHVzaChzdHJpbmdBcnJheUFzVHlwZShtZXRhLnRlbXBsYXRlLm5nQ29udGVudFNlbGVjdG9ycykpO1xuICByZXR1cm4gby5leHByZXNzaW9uVHlwZShvLmltcG9ydEV4cHIoUjMuQ29tcG9uZW50RGVjbGFyYXRpb24sIHR5cGVQYXJhbXMpKTtcbn1cblxuLyoqXG4gKiBDb21waWxlcyB0aGUgYXJyYXkgbGl0ZXJhbCBvZiBkZWNsYXJhdGlvbnMgaW50byBhbiBleHByZXNzaW9uIGFjY29yZGluZyB0byB0aGUgcHJvdmlkZWQgZW1pdFxuICogbW9kZS5cbiAqL1xuZnVuY3Rpb24gY29tcGlsZURlY2xhcmF0aW9uTGlzdChcbiAgICBsaXN0OiBvLkxpdGVyYWxBcnJheUV4cHIsIG1vZGU6IERlY2xhcmF0aW9uTGlzdEVtaXRNb2RlKTogby5FeHByZXNzaW9uIHtcbiAgc3dpdGNoIChtb2RlKSB7XG4gICAgY2FzZSBEZWNsYXJhdGlvbkxpc3RFbWl0TW9kZS5EaXJlY3Q6XG4gICAgICAvLyBkaXJlY3RpdmVzOiBbTXlEaXJdLFxuICAgICAgcmV0dXJuIGxpc3Q7XG4gICAgY2FzZSBEZWNsYXJhdGlvbkxpc3RFbWl0TW9kZS5DbG9zdXJlOlxuICAgICAgLy8gZGlyZWN0aXZlczogZnVuY3Rpb24gKCkgeyByZXR1cm4gW015RGlyXTsgfVxuICAgICAgcmV0dXJuIG8uZm4oW10sIFtuZXcgby5SZXR1cm5TdGF0ZW1lbnQobGlzdCldKTtcbiAgICBjYXNlIERlY2xhcmF0aW9uTGlzdEVtaXRNb2RlLkNsb3N1cmVSZXNvbHZlZDpcbiAgICAgIC8vIGRpcmVjdGl2ZXM6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIFtNeURpcl0ubWFwKG5nLnJlc29sdmVGb3J3YXJkUmVmKTsgfVxuICAgICAgY29uc3QgcmVzb2x2ZWRMaXN0ID0gbGlzdC5jYWxsTWV0aG9kKCdtYXAnLCBbby5pbXBvcnRFeHByKFIzLnJlc29sdmVGb3J3YXJkUmVmKV0pO1xuICAgICAgcmV0dXJuIG8uZm4oW10sIFtuZXcgby5SZXR1cm5TdGF0ZW1lbnQocmVzb2x2ZWRMaXN0KV0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIHByZXBhcmVRdWVyeVBhcmFtcyhxdWVyeTogUjNRdWVyeU1ldGFkYXRhLCBjb25zdGFudFBvb2w6IENvbnN0YW50UG9vbCk6IG8uRXhwcmVzc2lvbltdIHtcbiAgY29uc3QgcGFyYW1ldGVycyA9IFtnZXRRdWVyeVByZWRpY2F0ZShxdWVyeSwgY29uc3RhbnRQb29sKSwgby5saXRlcmFsKHRvUXVlcnlGbGFncyhxdWVyeSkpXTtcbiAgaWYgKHF1ZXJ5LnJlYWQpIHtcbiAgICBwYXJhbWV0ZXJzLnB1c2gocXVlcnkucmVhZCk7XG4gIH1cbiAgcmV0dXJuIHBhcmFtZXRlcnM7XG59XG5cbi8qKlxuICogQSBzZXQgb2YgZmxhZ3MgdG8gYmUgdXNlZCB3aXRoIFF1ZXJpZXMuXG4gKlxuICogTk9URTogRW5zdXJlIGNoYW5nZXMgaGVyZSBhcmUgaW4gc3luYyB3aXRoIGBwYWNrYWdlcy9jb3JlL3NyYy9yZW5kZXIzL2ludGVyZmFjZXMvcXVlcnkudHNgXG4gKi9cbmV4cG9ydCBjb25zdCBlbnVtIFF1ZXJ5RmxhZ3Mge1xuICAvKipcbiAgICogTm8gZmxhZ3NcbiAgICovXG4gIG5vbmUgPSAwYjAwMDAsXG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgb3Igbm90IHRoZSBxdWVyeSBzaG91bGQgZGVzY2VuZCBpbnRvIGNoaWxkcmVuLlxuICAgKi9cbiAgZGVzY2VuZGFudHMgPSAwYjAwMDEsXG5cbiAgLyoqXG4gICAqIFRoZSBxdWVyeSBjYW4gYmUgY29tcHV0ZWQgc3RhdGljYWxseSBhbmQgaGVuY2UgY2FuIGJlIGFzc2lnbmVkIGVhZ2VybHkuXG4gICAqXG4gICAqIE5PVEU6IEJhY2t3YXJkcyBjb21wYXRpYmlsaXR5IHdpdGggVmlld0VuZ2luZS5cbiAgICovXG4gIGlzU3RhdGljID0gMGIwMDEwLFxuXG4gIC8qKlxuICAgKiBJZiB0aGUgYFF1ZXJ5TGlzdGAgc2hvdWxkIGZpcmUgY2hhbmdlIGV2ZW50IG9ubHkgaWYgYWN0dWFsIGNoYW5nZSB0byBxdWVyeSB3YXMgY29tcHV0ZWQgKHZzIG9sZFxuICAgKiBiZWhhdmlvciB3aGVyZSB0aGUgY2hhbmdlIHdhcyBmaXJlZCB3aGVuZXZlciB0aGUgcXVlcnkgd2FzIHJlY29tcHV0ZWQsIGV2ZW4gaWYgdGhlIHJlY29tcHV0ZWRcbiAgICogcXVlcnkgcmVzdWx0ZWQgaW4gdGhlIHNhbWUgbGlzdC4pXG4gICAqL1xuICBlbWl0RGlzdGluY3RDaGFuZ2VzT25seSA9IDBiMDEwMCxcbn1cblxuLyoqXG4gKiBUcmFuc2xhdGVzIHF1ZXJ5IGZsYWdzIGludG8gYFRRdWVyeUZsYWdzYCB0eXBlIGluIHBhY2thZ2VzL2NvcmUvc3JjL3JlbmRlcjMvaW50ZXJmYWNlcy9xdWVyeS50c1xuICogQHBhcmFtIHF1ZXJ5XG4gKi9cbmZ1bmN0aW9uIHRvUXVlcnlGbGFncyhxdWVyeTogUjNRdWVyeU1ldGFkYXRhKTogbnVtYmVyIHtcbiAgcmV0dXJuIChxdWVyeS5kZXNjZW5kYW50cyA/IFF1ZXJ5RmxhZ3MuZGVzY2VuZGFudHMgOiBRdWVyeUZsYWdzLm5vbmUpIHxcbiAgICAgIChxdWVyeS5zdGF0aWMgPyBRdWVyeUZsYWdzLmlzU3RhdGljIDogUXVlcnlGbGFncy5ub25lKSB8XG4gICAgICAocXVlcnkuZW1pdERpc3RpbmN0Q2hhbmdlc09ubHkgPyBRdWVyeUZsYWdzLmVtaXREaXN0aW5jdENoYW5nZXNPbmx5IDogUXVlcnlGbGFncy5ub25lKTtcbn1cblxuZnVuY3Rpb24gY29udmVydEF0dHJpYnV0ZXNUb0V4cHJlc3Npb25zKGF0dHJpYnV0ZXM6IHtbbmFtZTogc3RyaW5nXTogby5FeHByZXNzaW9ufSk6XG4gICAgby5FeHByZXNzaW9uW10ge1xuICBjb25zdCB2YWx1ZXM6IG8uRXhwcmVzc2lvbltdID0gW107XG4gIGZvciAobGV0IGtleSBvZiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhhdHRyaWJ1dGVzKSkge1xuICAgIGNvbnN0IHZhbHVlID0gYXR0cmlidXRlc1trZXldO1xuICAgIHZhbHVlcy5wdXNoKG8ubGl0ZXJhbChrZXkpLCB2YWx1ZSk7XG4gIH1cbiAgcmV0dXJuIHZhbHVlcztcbn1cblxuLy8gRGVmaW5lIGFuZCB1cGRhdGUgYW55IGNvbnRlbnQgcXVlcmllc1xuZnVuY3Rpb24gY3JlYXRlQ29udGVudFF1ZXJpZXNGdW5jdGlvbihcbiAgICBxdWVyaWVzOiBSM1F1ZXJ5TWV0YWRhdGFbXSwgY29uc3RhbnRQb29sOiBDb25zdGFudFBvb2wsIG5hbWU/OiBzdHJpbmcpOiBvLkV4cHJlc3Npb24ge1xuICBjb25zdCBjcmVhdGVTdGF0ZW1lbnRzOiBvLlN0YXRlbWVudFtdID0gW107XG4gIGNvbnN0IHVwZGF0ZVN0YXRlbWVudHM6IG8uU3RhdGVtZW50W10gPSBbXTtcbiAgY29uc3QgdGVtcEFsbG9jYXRvciA9IHRlbXBvcmFyeUFsbG9jYXRvcih1cGRhdGVTdGF0ZW1lbnRzLCBURU1QT1JBUllfTkFNRSk7XG5cbiAgZm9yIChjb25zdCBxdWVyeSBvZiBxdWVyaWVzKSB7XG4gICAgLy8gY3JlYXRpb24sIGUuZy4gcjMuY29udGVudFF1ZXJ5KGRpckluZGV4LCBzb21lUHJlZGljYXRlLCB0cnVlLCBudWxsKTtcbiAgICBjcmVhdGVTdGF0ZW1lbnRzLnB1c2goXG4gICAgICAgIG8uaW1wb3J0RXhwcihSMy5jb250ZW50UXVlcnkpXG4gICAgICAgICAgICAuY2FsbEZuKFtvLnZhcmlhYmxlKCdkaXJJbmRleCcpLCAuLi5wcmVwYXJlUXVlcnlQYXJhbXMocXVlcnksIGNvbnN0YW50UG9vbCkgYXMgYW55XSlcbiAgICAgICAgICAgIC50b1N0bXQoKSk7XG5cbiAgICAvLyB1cGRhdGUsIGUuZy4gKHIzLnF1ZXJ5UmVmcmVzaCh0bXAgPSByMy5sb2FkUXVlcnkoKSkgJiYgKGN0eC5zb21lRGlyID0gdG1wKSk7XG4gICAgY29uc3QgdGVtcG9yYXJ5ID0gdGVtcEFsbG9jYXRvcigpO1xuICAgIGNvbnN0IGdldFF1ZXJ5TGlzdCA9IG8uaW1wb3J0RXhwcihSMy5sb2FkUXVlcnkpLmNhbGxGbihbXSk7XG4gICAgY29uc3QgcmVmcmVzaCA9IG8uaW1wb3J0RXhwcihSMy5xdWVyeVJlZnJlc2gpLmNhbGxGbihbdGVtcG9yYXJ5LnNldChnZXRRdWVyeUxpc3QpXSk7XG4gICAgY29uc3QgdXBkYXRlRGlyZWN0aXZlID0gby52YXJpYWJsZShDT05URVhUX05BTUUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5wcm9wKHF1ZXJ5LnByb3BlcnR5TmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnNldChxdWVyeS5maXJzdCA/IHRlbXBvcmFyeS5wcm9wKCdmaXJzdCcpIDogdGVtcG9yYXJ5KTtcbiAgICB1cGRhdGVTdGF0ZW1lbnRzLnB1c2gocmVmcmVzaC5hbmQodXBkYXRlRGlyZWN0aXZlKS50b1N0bXQoKSk7XG4gIH1cblxuICBjb25zdCBjb250ZW50UXVlcmllc0ZuTmFtZSA9IG5hbWUgPyBgJHtuYW1lfV9Db250ZW50UXVlcmllc2AgOiBudWxsO1xuICByZXR1cm4gby5mbihcbiAgICAgIFtcbiAgICAgICAgbmV3IG8uRm5QYXJhbShSRU5ERVJfRkxBR1MsIG8uTlVNQkVSX1RZUEUpLCBuZXcgby5GblBhcmFtKENPTlRFWFRfTkFNRSwgbnVsbCksXG4gICAgICAgIG5ldyBvLkZuUGFyYW0oJ2RpckluZGV4JywgbnVsbClcbiAgICAgIF0sXG4gICAgICBbXG4gICAgICAgIHJlbmRlckZsYWdDaGVja0lmU3RtdChjb3JlLlJlbmRlckZsYWdzLkNyZWF0ZSwgY3JlYXRlU3RhdGVtZW50cyksXG4gICAgICAgIHJlbmRlckZsYWdDaGVja0lmU3RtdChjb3JlLlJlbmRlckZsYWdzLlVwZGF0ZSwgdXBkYXRlU3RhdGVtZW50cylcbiAgICAgIF0sXG4gICAgICBvLklORkVSUkVEX1RZUEUsIG51bGwsIGNvbnRlbnRRdWVyaWVzRm5OYW1lKTtcbn1cblxuZnVuY3Rpb24gc3RyaW5nQXNUeXBlKHN0cjogc3RyaW5nKTogby5UeXBlIHtcbiAgcmV0dXJuIG8uZXhwcmVzc2lvblR5cGUoby5saXRlcmFsKHN0cikpO1xufVxuXG5mdW5jdGlvbiBzdHJpbmdNYXBBc1R5cGUobWFwOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfHN0cmluZ1tdfSk6IG8uVHlwZSB7XG4gIGNvbnN0IG1hcFZhbHVlcyA9IE9iamVjdC5rZXlzKG1hcCkubWFwKGtleSA9PiB7XG4gICAgY29uc3QgdmFsdWUgPSBBcnJheS5pc0FycmF5KG1hcFtrZXldKSA/IG1hcFtrZXldWzBdIDogbWFwW2tleV07XG4gICAgcmV0dXJuIHtcbiAgICAgIGtleSxcbiAgICAgIHZhbHVlOiBvLmxpdGVyYWwodmFsdWUpLFxuICAgICAgcXVvdGVkOiB0cnVlLFxuICAgIH07XG4gIH0pO1xuICByZXR1cm4gby5leHByZXNzaW9uVHlwZShvLmxpdGVyYWxNYXAobWFwVmFsdWVzKSk7XG59XG5cbmZ1bmN0aW9uIHN0cmluZ0FycmF5QXNUeXBlKGFycjogUmVhZG9ubHlBcnJheTxzdHJpbmd8bnVsbD4pOiBvLlR5cGUge1xuICByZXR1cm4gYXJyLmxlbmd0aCA+IDAgPyBvLmV4cHJlc3Npb25UeXBlKG8ubGl0ZXJhbEFycihhcnIubWFwKHZhbHVlID0+IG8ubGl0ZXJhbCh2YWx1ZSkpKSkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICBvLk5PTkVfVFlQRTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZURpcmVjdGl2ZVR5cGVQYXJhbXMobWV0YTogUjNEaXJlY3RpdmVNZXRhZGF0YSk6IG8uVHlwZVtdIHtcbiAgLy8gT24gdGhlIHR5cGUgc2lkZSwgcmVtb3ZlIG5ld2xpbmVzIGZyb20gdGhlIHNlbGVjdG9yIGFzIGl0IHdpbGwgbmVlZCB0byBmaXQgaW50byBhIFR5cGVTY3JpcHRcbiAgLy8gc3RyaW5nIGxpdGVyYWwsIHdoaWNoIG11c3QgYmUgb24gb25lIGxpbmUuXG4gIGNvbnN0IHNlbGVjdG9yRm9yVHlwZSA9IG1ldGEuc2VsZWN0b3IgIT09IG51bGwgPyBtZXRhLnNlbGVjdG9yLnJlcGxhY2UoL1xcbi9nLCAnJykgOiBudWxsO1xuXG4gIHJldHVybiBbXG4gICAgdHlwZVdpdGhQYXJhbWV0ZXJzKG1ldGEudHlwZS50eXBlLCBtZXRhLnR5cGVBcmd1bWVudENvdW50KSxcbiAgICBzZWxlY3RvckZvclR5cGUgIT09IG51bGwgPyBzdHJpbmdBc1R5cGUoc2VsZWN0b3JGb3JUeXBlKSA6IG8uTk9ORV9UWVBFLFxuICAgIG1ldGEuZXhwb3J0QXMgIT09IG51bGwgPyBzdHJpbmdBcnJheUFzVHlwZShtZXRhLmV4cG9ydEFzKSA6IG8uTk9ORV9UWVBFLFxuICAgIHN0cmluZ01hcEFzVHlwZShtZXRhLmlucHV0cyksXG4gICAgc3RyaW5nTWFwQXNUeXBlKG1ldGEub3V0cHV0cyksXG4gICAgc3RyaW5nQXJyYXlBc1R5cGUobWV0YS5xdWVyaWVzLm1hcChxID0+IHEucHJvcGVydHlOYW1lKSksXG4gIF07XG59XG5cbi8qKlxuICogQ3JlYXRlcyB0aGUgdHlwZSBzcGVjaWZpY2F0aW9uIGZyb20gdGhlIGRpcmVjdGl2ZSBtZXRhLiBUaGlzIHR5cGUgaXMgaW5zZXJ0ZWQgaW50byAuZC50cyBmaWxlc1xuICogdG8gYmUgY29uc3VtZWQgYnkgdXBzdHJlYW0gY29tcGlsYXRpb25zLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRGlyZWN0aXZlVHlwZShtZXRhOiBSM0RpcmVjdGl2ZU1ldGFkYXRhKTogby5UeXBlIHtcbiAgY29uc3QgdHlwZVBhcmFtcyA9IGNyZWF0ZURpcmVjdGl2ZVR5cGVQYXJhbXMobWV0YSk7XG4gIHJldHVybiBvLmV4cHJlc3Npb25UeXBlKG8uaW1wb3J0RXhwcihSMy5EaXJlY3RpdmVEZWNsYXJhdGlvbiwgdHlwZVBhcmFtcykpO1xufVxuXG4vLyBEZWZpbmUgYW5kIHVwZGF0ZSBhbnkgdmlldyBxdWVyaWVzXG5mdW5jdGlvbiBjcmVhdGVWaWV3UXVlcmllc0Z1bmN0aW9uKFxuICAgIHZpZXdRdWVyaWVzOiBSM1F1ZXJ5TWV0YWRhdGFbXSwgY29uc3RhbnRQb29sOiBDb25zdGFudFBvb2wsIG5hbWU/OiBzdHJpbmcpOiBvLkV4cHJlc3Npb24ge1xuICBjb25zdCBjcmVhdGVTdGF0ZW1lbnRzOiBvLlN0YXRlbWVudFtdID0gW107XG4gIGNvbnN0IHVwZGF0ZVN0YXRlbWVudHM6IG8uU3RhdGVtZW50W10gPSBbXTtcbiAgY29uc3QgdGVtcEFsbG9jYXRvciA9IHRlbXBvcmFyeUFsbG9jYXRvcih1cGRhdGVTdGF0ZW1lbnRzLCBURU1QT1JBUllfTkFNRSk7XG5cbiAgdmlld1F1ZXJpZXMuZm9yRWFjaCgocXVlcnk6IFIzUXVlcnlNZXRhZGF0YSkgPT4ge1xuICAgIC8vIGNyZWF0aW9uLCBlLmcuIHIzLnZpZXdRdWVyeShzb21lUHJlZGljYXRlLCB0cnVlKTtcbiAgICBjb25zdCBxdWVyeURlZmluaXRpb24gPVxuICAgICAgICBvLmltcG9ydEV4cHIoUjMudmlld1F1ZXJ5KS5jYWxsRm4ocHJlcGFyZVF1ZXJ5UGFyYW1zKHF1ZXJ5LCBjb25zdGFudFBvb2wpKTtcbiAgICBjcmVhdGVTdGF0ZW1lbnRzLnB1c2gocXVlcnlEZWZpbml0aW9uLnRvU3RtdCgpKTtcblxuICAgIC8vIHVwZGF0ZSwgZS5nLiAocjMucXVlcnlSZWZyZXNoKHRtcCA9IHIzLmxvYWRRdWVyeSgpKSAmJiAoY3R4LnNvbWVEaXIgPSB0bXApKTtcbiAgICBjb25zdCB0ZW1wb3JhcnkgPSB0ZW1wQWxsb2NhdG9yKCk7XG4gICAgY29uc3QgZ2V0UXVlcnlMaXN0ID0gby5pbXBvcnRFeHByKFIzLmxvYWRRdWVyeSkuY2FsbEZuKFtdKTtcbiAgICBjb25zdCByZWZyZXNoID0gby5pbXBvcnRFeHByKFIzLnF1ZXJ5UmVmcmVzaCkuY2FsbEZuKFt0ZW1wb3Jhcnkuc2V0KGdldFF1ZXJ5TGlzdCldKTtcbiAgICBjb25zdCB1cGRhdGVEaXJlY3RpdmUgPSBvLnZhcmlhYmxlKENPTlRFWFRfTkFNRSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnByb3AocXVlcnkucHJvcGVydHlOYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc2V0KHF1ZXJ5LmZpcnN0ID8gdGVtcG9yYXJ5LnByb3AoJ2ZpcnN0JykgOiB0ZW1wb3JhcnkpO1xuICAgIHVwZGF0ZVN0YXRlbWVudHMucHVzaChyZWZyZXNoLmFuZCh1cGRhdGVEaXJlY3RpdmUpLnRvU3RtdCgpKTtcbiAgfSk7XG5cbiAgY29uc3Qgdmlld1F1ZXJ5Rm5OYW1lID0gbmFtZSA/IGAke25hbWV9X1F1ZXJ5YCA6IG51bGw7XG4gIHJldHVybiBvLmZuKFxuICAgICAgW25ldyBvLkZuUGFyYW0oUkVOREVSX0ZMQUdTLCBvLk5VTUJFUl9UWVBFKSwgbmV3IG8uRm5QYXJhbShDT05URVhUX05BTUUsIG51bGwpXSxcbiAgICAgIFtcbiAgICAgICAgcmVuZGVyRmxhZ0NoZWNrSWZTdG10KGNvcmUuUmVuZGVyRmxhZ3MuQ3JlYXRlLCBjcmVhdGVTdGF0ZW1lbnRzKSxcbiAgICAgICAgcmVuZGVyRmxhZ0NoZWNrSWZTdG10KGNvcmUuUmVuZGVyRmxhZ3MuVXBkYXRlLCB1cGRhdGVTdGF0ZW1lbnRzKVxuICAgICAgXSxcbiAgICAgIG8uSU5GRVJSRURfVFlQRSwgbnVsbCwgdmlld1F1ZXJ5Rm5OYW1lKTtcbn1cblxuLy8gUmV0dXJuIGEgaG9zdCBiaW5kaW5nIGZ1bmN0aW9uIG9yIG51bGwgaWYgb25lIGlzIG5vdCBuZWNlc3NhcnkuXG5mdW5jdGlvbiBjcmVhdGVIb3N0QmluZGluZ3NGdW5jdGlvbihcbiAgICBob3N0QmluZGluZ3NNZXRhZGF0YTogUjNIb3N0TWV0YWRhdGEsIHR5cGVTb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgYmluZGluZ1BhcnNlcjogQmluZGluZ1BhcnNlciwgY29uc3RhbnRQb29sOiBDb25zdGFudFBvb2wsIHNlbGVjdG9yOiBzdHJpbmcsIG5hbWU6IHN0cmluZyxcbiAgICBkZWZpbml0aW9uTWFwOiBEZWZpbml0aW9uTWFwKTogby5FeHByZXNzaW9ufG51bGwge1xuICBjb25zdCBiaW5kaW5nQ29udGV4dCA9IG8udmFyaWFibGUoQ09OVEVYVF9OQU1FKTtcbiAgY29uc3Qgc3R5bGVCdWlsZGVyID0gbmV3IFN0eWxpbmdCdWlsZGVyKGJpbmRpbmdDb250ZXh0KTtcblxuICBjb25zdCB7c3R5bGVBdHRyLCBjbGFzc0F0dHJ9ID0gaG9zdEJpbmRpbmdzTWV0YWRhdGEuc3BlY2lhbEF0dHJpYnV0ZXM7XG4gIGlmIChzdHlsZUF0dHIgIT09IHVuZGVmaW5lZCkge1xuICAgIHN0eWxlQnVpbGRlci5yZWdpc3RlclN0eWxlQXR0cihzdHlsZUF0dHIpO1xuICB9XG4gIGlmIChjbGFzc0F0dHIgIT09IHVuZGVmaW5lZCkge1xuICAgIHN0eWxlQnVpbGRlci5yZWdpc3RlckNsYXNzQXR0cihjbGFzc0F0dHIpO1xuICB9XG5cbiAgY29uc3QgY3JlYXRlU3RhdGVtZW50czogby5TdGF0ZW1lbnRbXSA9IFtdO1xuICBjb25zdCB1cGRhdGVTdGF0ZW1lbnRzOiBvLlN0YXRlbWVudFtdID0gW107XG5cbiAgY29uc3QgaG9zdEJpbmRpbmdTb3VyY2VTcGFuID0gdHlwZVNvdXJjZVNwYW47XG4gIGNvbnN0IGRpcmVjdGl2ZVN1bW1hcnkgPSBtZXRhZGF0YUFzU3VtbWFyeShob3N0QmluZGluZ3NNZXRhZGF0YSk7XG5cbiAgLy8gQ2FsY3VsYXRlIGhvc3QgZXZlbnQgYmluZGluZ3NcbiAgY29uc3QgZXZlbnRCaW5kaW5ncyA9XG4gICAgICBiaW5kaW5nUGFyc2VyLmNyZWF0ZURpcmVjdGl2ZUhvc3RFdmVudEFzdHMoZGlyZWN0aXZlU3VtbWFyeSwgaG9zdEJpbmRpbmdTb3VyY2VTcGFuKTtcbiAgaWYgKGV2ZW50QmluZGluZ3MgJiYgZXZlbnRCaW5kaW5ncy5sZW5ndGgpIHtcbiAgICBjb25zdCBsaXN0ZW5lcnMgPSBjcmVhdGVIb3N0TGlzdGVuZXJzKGV2ZW50QmluZGluZ3MsIG5hbWUpO1xuICAgIGNyZWF0ZVN0YXRlbWVudHMucHVzaCguLi5saXN0ZW5lcnMpO1xuICB9XG5cbiAgLy8gQ2FsY3VsYXRlIHRoZSBob3N0IHByb3BlcnR5IGJpbmRpbmdzXG4gIGNvbnN0IGJpbmRpbmdzID0gYmluZGluZ1BhcnNlci5jcmVhdGVCb3VuZEhvc3RQcm9wZXJ0aWVzKGRpcmVjdGl2ZVN1bW1hcnksIGhvc3RCaW5kaW5nU291cmNlU3Bhbik7XG4gIGNvbnN0IGFsbE90aGVyQmluZGluZ3M6IFBhcnNlZFByb3BlcnR5W10gPSBbXTtcblxuICAvLyBXZSBuZWVkIHRvIGNhbGN1bGF0ZSB0aGUgdG90YWwgYW1vdW50IG9mIGJpbmRpbmcgc2xvdHMgcmVxdWlyZWQgYnlcbiAgLy8gYWxsIHRoZSBpbnN0cnVjdGlvbnMgdG9nZXRoZXIgYmVmb3JlIGFueSB2YWx1ZSBjb252ZXJzaW9ucyBoYXBwZW4uXG4gIC8vIFZhbHVlIGNvbnZlcnNpb25zIG1heSByZXF1aXJlIGFkZGl0aW9uYWwgc2xvdHMgZm9yIGludGVycG9sYXRpb24gYW5kXG4gIC8vIGJpbmRpbmdzIHdpdGggcGlwZXMuIFRoZXNlIGNhbGN1bGF0ZXMgaGFwcGVuIGFmdGVyIHRoaXMgYmxvY2suXG4gIGxldCB0b3RhbEhvc3RWYXJzQ291bnQgPSAwO1xuICBiaW5kaW5ncyAmJiBiaW5kaW5ncy5mb3JFYWNoKChiaW5kaW5nOiBQYXJzZWRQcm9wZXJ0eSkgPT4ge1xuICAgIGNvbnN0IHN0eWxpbmdJbnB1dFdhc1NldCA9IHN0eWxlQnVpbGRlci5yZWdpc3RlcklucHV0QmFzZWRPbk5hbWUoXG4gICAgICAgIGJpbmRpbmcubmFtZSwgYmluZGluZy5leHByZXNzaW9uLCBob3N0QmluZGluZ1NvdXJjZVNwYW4pO1xuICAgIGlmIChzdHlsaW5nSW5wdXRXYXNTZXQpIHtcbiAgICAgIHRvdGFsSG9zdFZhcnNDb3VudCArPSBNSU5fU1RZTElOR19CSU5ESU5HX1NMT1RTX1JFUVVJUkVEO1xuICAgIH0gZWxzZSB7XG4gICAgICBhbGxPdGhlckJpbmRpbmdzLnB1c2goYmluZGluZyk7XG4gICAgICB0b3RhbEhvc3RWYXJzQ291bnQrKztcbiAgICB9XG4gIH0pO1xuXG4gIGxldCB2YWx1ZUNvbnZlcnRlcjogVmFsdWVDb252ZXJ0ZXI7XG4gIGNvbnN0IGdldFZhbHVlQ29udmVydGVyID0gKCkgPT4ge1xuICAgIGlmICghdmFsdWVDb252ZXJ0ZXIpIHtcbiAgICAgIGNvbnN0IGhvc3RWYXJzQ291bnRGbiA9IChudW1TbG90czogbnVtYmVyKTogbnVtYmVyID0+IHtcbiAgICAgICAgY29uc3Qgb3JpZ2luYWxWYXJzQ291bnQgPSB0b3RhbEhvc3RWYXJzQ291bnQ7XG4gICAgICAgIHRvdGFsSG9zdFZhcnNDb3VudCArPSBudW1TbG90cztcbiAgICAgICAgcmV0dXJuIG9yaWdpbmFsVmFyc0NvdW50O1xuICAgICAgfTtcbiAgICAgIHZhbHVlQ29udmVydGVyID0gbmV3IFZhbHVlQ29udmVydGVyKFxuICAgICAgICAgIGNvbnN0YW50UG9vbCxcbiAgICAgICAgICAoKSA9PiBlcnJvcignVW5leHBlY3RlZCBub2RlJyksICAvLyBuZXcgbm9kZXMgYXJlIGlsbGVnYWwgaGVyZVxuICAgICAgICAgIGhvc3RWYXJzQ291bnRGbixcbiAgICAgICAgICAoKSA9PiBlcnJvcignVW5leHBlY3RlZCBwaXBlJykpOyAgLy8gcGlwZXMgYXJlIGlsbGVnYWwgaGVyZVxuICAgIH1cbiAgICByZXR1cm4gdmFsdWVDb252ZXJ0ZXI7XG4gIH07XG5cbiAgY29uc3QgcHJvcGVydHlCaW5kaW5nczogby5FeHByZXNzaW9uW11bXSA9IFtdO1xuICBjb25zdCBhdHRyaWJ1dGVCaW5kaW5nczogby5FeHByZXNzaW9uW11bXSA9IFtdO1xuICBjb25zdCBzeW50aGV0aWNIb3N0QmluZGluZ3M6IG8uRXhwcmVzc2lvbltdW10gPSBbXTtcbiAgYWxsT3RoZXJCaW5kaW5ncy5mb3JFYWNoKChiaW5kaW5nOiBQYXJzZWRQcm9wZXJ0eSkgPT4ge1xuICAgIC8vIHJlc29sdmUgbGl0ZXJhbCBhcnJheXMgYW5kIGxpdGVyYWwgb2JqZWN0c1xuICAgIGNvbnN0IHZhbHVlID0gYmluZGluZy5leHByZXNzaW9uLnZpc2l0KGdldFZhbHVlQ29udmVydGVyKCkpO1xuICAgIGNvbnN0IGJpbmRpbmdFeHByID0gYmluZGluZ0ZuKGJpbmRpbmdDb250ZXh0LCB2YWx1ZSk7XG5cbiAgICBjb25zdCB7YmluZGluZ05hbWUsIGluc3RydWN0aW9uLCBpc0F0dHJpYnV0ZX0gPSBnZXRCaW5kaW5nTmFtZUFuZEluc3RydWN0aW9uKGJpbmRpbmcpO1xuXG4gICAgY29uc3Qgc2VjdXJpdHlDb250ZXh0cyA9XG4gICAgICAgIGJpbmRpbmdQYXJzZXIuY2FsY1Bvc3NpYmxlU2VjdXJpdHlDb250ZXh0cyhzZWxlY3RvciwgYmluZGluZ05hbWUsIGlzQXR0cmlidXRlKVxuICAgICAgICAgICAgLmZpbHRlcihjb250ZXh0ID0+IGNvbnRleHQgIT09IGNvcmUuU2VjdXJpdHlDb250ZXh0Lk5PTkUpO1xuXG4gICAgbGV0IHNhbml0aXplckZuOiBvLkV4dGVybmFsRXhwcnxudWxsID0gbnVsbDtcbiAgICBpZiAoc2VjdXJpdHlDb250ZXh0cy5sZW5ndGgpIHtcbiAgICAgIGlmIChzZWN1cml0eUNvbnRleHRzLmxlbmd0aCA9PT0gMiAmJlxuICAgICAgICAgIHNlY3VyaXR5Q29udGV4dHMuaW5kZXhPZihjb3JlLlNlY3VyaXR5Q29udGV4dC5VUkwpID4gLTEgJiZcbiAgICAgICAgICBzZWN1cml0eUNvbnRleHRzLmluZGV4T2YoY29yZS5TZWN1cml0eUNvbnRleHQuUkVTT1VSQ0VfVVJMKSA+IC0xKSB7XG4gICAgICAgIC8vIFNwZWNpYWwgY2FzZSBmb3Igc29tZSBVUkwgYXR0cmlidXRlcyAoc3VjaCBhcyBcInNyY1wiIGFuZCBcImhyZWZcIikgdGhhdCBtYXkgYmUgYSBwYXJ0XG4gICAgICAgIC8vIG9mIGRpZmZlcmVudCBzZWN1cml0eSBjb250ZXh0cy4gSW4gdGhpcyBjYXNlIHdlIHVzZSBzcGVjaWFsIHNhbml0aXphdGlvbiBmdW5jdGlvbiBhbmRcbiAgICAgICAgLy8gc2VsZWN0IHRoZSBhY3R1YWwgc2FuaXRpemVyIGF0IHJ1bnRpbWUgYmFzZWQgb24gYSB0YWcgbmFtZSB0aGF0IGlzIHByb3ZpZGVkIHdoaWxlXG4gICAgICAgIC8vIGludm9raW5nIHNhbml0aXphdGlvbiBmdW5jdGlvbi5cbiAgICAgICAgc2FuaXRpemVyRm4gPSBvLmltcG9ydEV4cHIoUjMuc2FuaXRpemVVcmxPclJlc291cmNlVXJsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNhbml0aXplckZuID0gcmVzb2x2ZVNhbml0aXphdGlvbkZuKHNlY3VyaXR5Q29udGV4dHNbMF0sIGlzQXR0cmlidXRlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgaW5zdHJ1Y3Rpb25QYXJhbXMgPSBbby5saXRlcmFsKGJpbmRpbmdOYW1lKSwgYmluZGluZ0V4cHIuY3VyclZhbEV4cHJdO1xuICAgIGlmIChzYW5pdGl6ZXJGbikge1xuICAgICAgaW5zdHJ1Y3Rpb25QYXJhbXMucHVzaChzYW5pdGl6ZXJGbik7XG4gICAgfVxuXG4gICAgdXBkYXRlU3RhdGVtZW50cy5wdXNoKC4uLmJpbmRpbmdFeHByLnN0bXRzKTtcblxuICAgIGlmIChpbnN0cnVjdGlvbiA9PT0gUjMuaG9zdFByb3BlcnR5KSB7XG4gICAgICBwcm9wZXJ0eUJpbmRpbmdzLnB1c2goaW5zdHJ1Y3Rpb25QYXJhbXMpO1xuICAgIH0gZWxzZSBpZiAoaW5zdHJ1Y3Rpb24gPT09IFIzLmF0dHJpYnV0ZSkge1xuICAgICAgYXR0cmlidXRlQmluZGluZ3MucHVzaChpbnN0cnVjdGlvblBhcmFtcyk7XG4gICAgfSBlbHNlIGlmIChpbnN0cnVjdGlvbiA9PT0gUjMuc3ludGhldGljSG9zdFByb3BlcnR5KSB7XG4gICAgICBzeW50aGV0aWNIb3N0QmluZGluZ3MucHVzaChpbnN0cnVjdGlvblBhcmFtcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHVwZGF0ZVN0YXRlbWVudHMucHVzaChvLmltcG9ydEV4cHIoaW5zdHJ1Y3Rpb24pLmNhbGxGbihpbnN0cnVjdGlvblBhcmFtcykudG9TdG10KCkpO1xuICAgIH1cbiAgfSk7XG5cbiAgaWYgKHByb3BlcnR5QmluZGluZ3MubGVuZ3RoID4gMCkge1xuICAgIHVwZGF0ZVN0YXRlbWVudHMucHVzaChjaGFpbmVkSW5zdHJ1Y3Rpb24oUjMuaG9zdFByb3BlcnR5LCBwcm9wZXJ0eUJpbmRpbmdzKS50b1N0bXQoKSk7XG4gIH1cblxuICBpZiAoYXR0cmlidXRlQmluZGluZ3MubGVuZ3RoID4gMCkge1xuICAgIHVwZGF0ZVN0YXRlbWVudHMucHVzaChjaGFpbmVkSW5zdHJ1Y3Rpb24oUjMuYXR0cmlidXRlLCBhdHRyaWJ1dGVCaW5kaW5ncykudG9TdG10KCkpO1xuICB9XG5cbiAgaWYgKHN5bnRoZXRpY0hvc3RCaW5kaW5ncy5sZW5ndGggPiAwKSB7XG4gICAgdXBkYXRlU3RhdGVtZW50cy5wdXNoKFxuICAgICAgICBjaGFpbmVkSW5zdHJ1Y3Rpb24oUjMuc3ludGhldGljSG9zdFByb3BlcnR5LCBzeW50aGV0aWNIb3N0QmluZGluZ3MpLnRvU3RtdCgpKTtcbiAgfVxuXG4gIC8vIHNpbmNlIHdlJ3JlIGRlYWxpbmcgd2l0aCBkaXJlY3RpdmVzL2NvbXBvbmVudHMgYW5kIGJvdGggaGF2ZSBob3N0QmluZGluZ1xuICAvLyBmdW5jdGlvbnMsIHdlIG5lZWQgdG8gZ2VuZXJhdGUgYSBzcGVjaWFsIGhvc3RBdHRycyBpbnN0cnVjdGlvbiB0aGF0IGRlYWxzXG4gIC8vIHdpdGggYm90aCB0aGUgYXNzaWdubWVudCBvZiBzdHlsaW5nIGFzIHdlbGwgYXMgc3RhdGljIGF0dHJpYnV0ZXMgdG8gdGhlIGhvc3RcbiAgLy8gZWxlbWVudC4gVGhlIGluc3RydWN0aW9uIGJlbG93IHdpbGwgaW5zdHJ1Y3QgYWxsIGluaXRpYWwgc3R5bGluZyAoc3R5bGluZ1xuICAvLyB0aGF0IGlzIGluc2lkZSBvZiBhIGhvc3QgYmluZGluZyB3aXRoaW4gYSBkaXJlY3RpdmUvY29tcG9uZW50KSB0byBiZSBhdHRhY2hlZFxuICAvLyB0byB0aGUgaG9zdCBlbGVtZW50IGFsb25nc2lkZSBhbnkgb2YgdGhlIHByb3ZpZGVkIGhvc3QgYXR0cmlidXRlcyB0aGF0IHdlcmVcbiAgLy8gY29sbGVjdGVkIGVhcmxpZXIuXG4gIGNvbnN0IGhvc3RBdHRycyA9IGNvbnZlcnRBdHRyaWJ1dGVzVG9FeHByZXNzaW9ucyhob3N0QmluZGluZ3NNZXRhZGF0YS5hdHRyaWJ1dGVzKTtcbiAgc3R5bGVCdWlsZGVyLmFzc2lnbkhvc3RBdHRycyhob3N0QXR0cnMsIGRlZmluaXRpb25NYXApO1xuXG4gIGlmIChzdHlsZUJ1aWxkZXIuaGFzQmluZGluZ3MpIHtcbiAgICAvLyBmaW5hbGx5IGVhY2ggYmluZGluZyB0aGF0IHdhcyByZWdpc3RlcmVkIGluIHRoZSBzdGF0ZW1lbnQgYWJvdmUgd2lsbCBuZWVkIHRvIGJlIGFkZGVkIHRvXG4gICAgLy8gdGhlIHVwZGF0ZSBibG9jayBvZiBhIGNvbXBvbmVudC9kaXJlY3RpdmUgdGVtcGxhdGVGbi9ob3N0QmluZGluZ3NGbiBzbyB0aGF0IHRoZSBiaW5kaW5nc1xuICAgIC8vIGFyZSBldmFsdWF0ZWQgYW5kIHVwZGF0ZWQgZm9yIHRoZSBlbGVtZW50LlxuICAgIHN0eWxlQnVpbGRlci5idWlsZFVwZGF0ZUxldmVsSW5zdHJ1Y3Rpb25zKGdldFZhbHVlQ29udmVydGVyKCkpLmZvckVhY2goaW5zdHJ1Y3Rpb24gPT4ge1xuICAgICAgaWYgKGluc3RydWN0aW9uLmNhbGxzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QgY2FsbHM6IG8uRXhwcmVzc2lvbltdW10gPSBbXTtcblxuICAgICAgICBpbnN0cnVjdGlvbi5jYWxscy5mb3JFYWNoKGNhbGwgPT4ge1xuICAgICAgICAgIC8vIHdlIHN1YnRyYWN0IGEgdmFsdWUgb2YgYDFgIGhlcmUgYmVjYXVzZSB0aGUgYmluZGluZyBzbG90IHdhcyBhbHJlYWR5IGFsbG9jYXRlZFxuICAgICAgICAgIC8vIGF0IHRoZSB0b3Agb2YgdGhpcyBtZXRob2Qgd2hlbiBhbGwgdGhlIGlucHV0IGJpbmRpbmdzIHdlcmUgY291bnRlZC5cbiAgICAgICAgICB0b3RhbEhvc3RWYXJzQ291bnQgKz1cbiAgICAgICAgICAgICAgTWF0aC5tYXgoY2FsbC5hbGxvY2F0ZUJpbmRpbmdTbG90cyAtIE1JTl9TVFlMSU5HX0JJTkRJTkdfU0xPVFNfUkVRVUlSRUQsIDApO1xuICAgICAgICAgIGNhbGxzLnB1c2goY29udmVydFN0eWxpbmdDYWxsKGNhbGwsIGJpbmRpbmdDb250ZXh0LCBiaW5kaW5nRm4pKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdXBkYXRlU3RhdGVtZW50cy5wdXNoKGNoYWluZWRJbnN0cnVjdGlvbihpbnN0cnVjdGlvbi5yZWZlcmVuY2UsIGNhbGxzKS50b1N0bXQoKSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBpZiAodG90YWxIb3N0VmFyc0NvdW50KSB7XG4gICAgZGVmaW5pdGlvbk1hcC5zZXQoJ2hvc3RWYXJzJywgby5saXRlcmFsKHRvdGFsSG9zdFZhcnNDb3VudCkpO1xuICB9XG5cbiAgaWYgKGNyZWF0ZVN0YXRlbWVudHMubGVuZ3RoID4gMCB8fCB1cGRhdGVTdGF0ZW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICBjb25zdCBob3N0QmluZGluZ3NGbk5hbWUgPSBuYW1lID8gYCR7bmFtZX1fSG9zdEJpbmRpbmdzYCA6IG51bGw7XG4gICAgY29uc3Qgc3RhdGVtZW50czogby5TdGF0ZW1lbnRbXSA9IFtdO1xuICAgIGlmIChjcmVhdGVTdGF0ZW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgIHN0YXRlbWVudHMucHVzaChyZW5kZXJGbGFnQ2hlY2tJZlN0bXQoY29yZS5SZW5kZXJGbGFncy5DcmVhdGUsIGNyZWF0ZVN0YXRlbWVudHMpKTtcbiAgICB9XG4gICAgaWYgKHVwZGF0ZVN0YXRlbWVudHMubGVuZ3RoID4gMCkge1xuICAgICAgc3RhdGVtZW50cy5wdXNoKHJlbmRlckZsYWdDaGVja0lmU3RtdChjb3JlLlJlbmRlckZsYWdzLlVwZGF0ZSwgdXBkYXRlU3RhdGVtZW50cykpO1xuICAgIH1cbiAgICByZXR1cm4gby5mbihcbiAgICAgICAgW25ldyBvLkZuUGFyYW0oUkVOREVSX0ZMQUdTLCBvLk5VTUJFUl9UWVBFKSwgbmV3IG8uRm5QYXJhbShDT05URVhUX05BTUUsIG51bGwpXSwgc3RhdGVtZW50cyxcbiAgICAgICAgby5JTkZFUlJFRF9UWVBFLCBudWxsLCBob3N0QmluZGluZ3NGbk5hbWUpO1xuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59XG5cbmZ1bmN0aW9uIGJpbmRpbmdGbihpbXBsaWNpdDogYW55LCB2YWx1ZTogQVNUKSB7XG4gIHJldHVybiBjb252ZXJ0UHJvcGVydHlCaW5kaW5nKFxuICAgICAgbnVsbCwgaW1wbGljaXQsIHZhbHVlLCAnYicsIEJpbmRpbmdGb3JtLkV4cHJlc3Npb24sICgpID0+IGVycm9yKCdVbmV4cGVjdGVkIGludGVycG9sYXRpb24nKSk7XG59XG5cbmZ1bmN0aW9uIGNvbnZlcnRTdHlsaW5nQ2FsbChcbiAgICBjYWxsOiBTdHlsaW5nSW5zdHJ1Y3Rpb25DYWxsLCBiaW5kaW5nQ29udGV4dDogYW55LCBiaW5kaW5nRm46IEZ1bmN0aW9uKSB7XG4gIHJldHVybiBjYWxsLnBhcmFtcyh2YWx1ZSA9PiBiaW5kaW5nRm4oYmluZGluZ0NvbnRleHQsIHZhbHVlKS5jdXJyVmFsRXhwcik7XG59XG5cbmZ1bmN0aW9uIGdldEJpbmRpbmdOYW1lQW5kSW5zdHJ1Y3Rpb24oYmluZGluZzogUGFyc2VkUHJvcGVydHkpOlxuICAgIHtiaW5kaW5nTmFtZTogc3RyaW5nLCBpbnN0cnVjdGlvbjogby5FeHRlcm5hbFJlZmVyZW5jZSwgaXNBdHRyaWJ1dGU6IGJvb2xlYW59IHtcbiAgbGV0IGJpbmRpbmdOYW1lID0gYmluZGluZy5uYW1lO1xuICBsZXQgaW5zdHJ1Y3Rpb24hOiBvLkV4dGVybmFsUmVmZXJlbmNlO1xuXG4gIC8vIENoZWNrIHRvIHNlZSBpZiB0aGlzIGlzIGFuIGF0dHIgYmluZGluZyBvciBhIHByb3BlcnR5IGJpbmRpbmdcbiAgY29uc3QgYXR0ck1hdGNoZXMgPSBiaW5kaW5nTmFtZS5tYXRjaChBVFRSX1JFR0VYKTtcbiAgaWYgKGF0dHJNYXRjaGVzKSB7XG4gICAgYmluZGluZ05hbWUgPSBhdHRyTWF0Y2hlc1sxXTtcbiAgICBpbnN0cnVjdGlvbiA9IFIzLmF0dHJpYnV0ZTtcbiAgfSBlbHNlIHtcbiAgICBpZiAoYmluZGluZy5pc0FuaW1hdGlvbikge1xuICAgICAgYmluZGluZ05hbWUgPSBwcmVwYXJlU3ludGhldGljUHJvcGVydHlOYW1lKGJpbmRpbmdOYW1lKTtcbiAgICAgIC8vIGhvc3QgYmluZGluZ3MgdGhhdCBoYXZlIGEgc3ludGhldGljIHByb3BlcnR5IChlLmcuIEBmb28pIHNob3VsZCBhbHdheXMgYmUgcmVuZGVyZWRcbiAgICAgIC8vIGluIHRoZSBjb250ZXh0IG9mIHRoZSBjb21wb25lbnQgYW5kIG5vdCB0aGUgcGFyZW50LiBUaGVyZWZvcmUgdGhlcmUgaXMgYSBzcGVjaWFsXG4gICAgICAvLyBjb21wYXRpYmlsaXR5IGluc3RydWN0aW9uIGF2YWlsYWJsZSBmb3IgdGhpcyBwdXJwb3NlLlxuICAgICAgaW5zdHJ1Y3Rpb24gPSBSMy5zeW50aGV0aWNIb3N0UHJvcGVydHk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGluc3RydWN0aW9uID0gUjMuaG9zdFByb3BlcnR5O1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7YmluZGluZ05hbWUsIGluc3RydWN0aW9uLCBpc0F0dHJpYnV0ZTogISFhdHRyTWF0Y2hlc307XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUhvc3RMaXN0ZW5lcnMoZXZlbnRCaW5kaW5nczogUGFyc2VkRXZlbnRbXSwgbmFtZT86IHN0cmluZyk6IG8uU3RhdGVtZW50W10ge1xuICBjb25zdCBsaXN0ZW5lcnM6IG8uRXhwcmVzc2lvbltdW10gPSBbXTtcbiAgY29uc3Qgc3ludGhldGljTGlzdGVuZXJzOiBvLkV4cHJlc3Npb25bXVtdID0gW107XG4gIGNvbnN0IGluc3RydWN0aW9uczogby5TdGF0ZW1lbnRbXSA9IFtdO1xuXG4gIGV2ZW50QmluZGluZ3MuZm9yRWFjaChiaW5kaW5nID0+IHtcbiAgICBsZXQgYmluZGluZ05hbWUgPSBiaW5kaW5nLm5hbWUgJiYgc2FuaXRpemVJZGVudGlmaWVyKGJpbmRpbmcubmFtZSk7XG4gICAgY29uc3QgYmluZGluZ0ZuTmFtZSA9IGJpbmRpbmcudHlwZSA9PT0gUGFyc2VkRXZlbnRUeXBlLkFuaW1hdGlvbiA/XG4gICAgICAgIHByZXBhcmVTeW50aGV0aWNMaXN0ZW5lckZ1bmN0aW9uTmFtZShiaW5kaW5nTmFtZSwgYmluZGluZy50YXJnZXRPclBoYXNlKSA6XG4gICAgICAgIGJpbmRpbmdOYW1lO1xuICAgIGNvbnN0IGhhbmRsZXJOYW1lID0gbmFtZSAmJiBiaW5kaW5nTmFtZSA/IGAke25hbWV9XyR7YmluZGluZ0ZuTmFtZX1fSG9zdEJpbmRpbmdIYW5kbGVyYCA6IG51bGw7XG4gICAgY29uc3QgcGFyYW1zID0gcHJlcGFyZUV2ZW50TGlzdGVuZXJQYXJhbWV0ZXJzKEJvdW5kRXZlbnQuZnJvbVBhcnNlZEV2ZW50KGJpbmRpbmcpLCBoYW5kbGVyTmFtZSk7XG5cbiAgICBpZiAoYmluZGluZy50eXBlID09IFBhcnNlZEV2ZW50VHlwZS5BbmltYXRpb24pIHtcbiAgICAgIHN5bnRoZXRpY0xpc3RlbmVycy5wdXNoKHBhcmFtcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpc3RlbmVycy5wdXNoKHBhcmFtcyk7XG4gICAgfVxuICB9KTtcblxuICBpZiAoc3ludGhldGljTGlzdGVuZXJzLmxlbmd0aCA+IDApIHtcbiAgICBpbnN0cnVjdGlvbnMucHVzaChjaGFpbmVkSW5zdHJ1Y3Rpb24oUjMuc3ludGhldGljSG9zdExpc3RlbmVyLCBzeW50aGV0aWNMaXN0ZW5lcnMpLnRvU3RtdCgpKTtcbiAgfVxuXG4gIGlmIChsaXN0ZW5lcnMubGVuZ3RoID4gMCkge1xuICAgIGluc3RydWN0aW9ucy5wdXNoKGNoYWluZWRJbnN0cnVjdGlvbihSMy5saXN0ZW5lciwgbGlzdGVuZXJzKS50b1N0bXQoKSk7XG4gIH1cblxuICByZXR1cm4gaW5zdHJ1Y3Rpb25zO1xufVxuXG5mdW5jdGlvbiBtZXRhZGF0YUFzU3VtbWFyeShtZXRhOiBSM0hvc3RNZXRhZGF0YSk6IENvbXBpbGVEaXJlY3RpdmVTdW1tYXJ5IHtcbiAgLy8gY2xhbmctZm9ybWF0IG9mZlxuICByZXR1cm4ge1xuICAgIC8vIFRoaXMgaXMgdXNlZCBieSB0aGUgQmluZGluZ1BhcnNlciwgd2hpY2ggb25seSBkZWFscyB3aXRoIGxpc3RlbmVycyBhbmQgcHJvcGVydGllcy4gVGhlcmUncyBub1xuICAgIC8vIG5lZWQgdG8gcGFzcyBhdHRyaWJ1dGVzIHRvIGl0LlxuICAgIGhvc3RBdHRyaWJ1dGVzOiB7fSxcbiAgICBob3N0TGlzdGVuZXJzOiBtZXRhLmxpc3RlbmVycyxcbiAgICBob3N0UHJvcGVydGllczogbWV0YS5wcm9wZXJ0aWVzLFxuICB9IGFzIENvbXBpbGVEaXJlY3RpdmVTdW1tYXJ5O1xuICAvLyBjbGFuZy1mb3JtYXQgb25cbn1cblxuXG5cbmNvbnN0IEhPU1RfUkVHX0VYUCA9IC9eKD86XFxbKFteXFxdXSspXFxdKXwoPzpcXCgoW15cXCldKylcXCkpJC87XG4vLyBSZXByZXNlbnRzIHRoZSBncm91cHMgaW4gdGhlIGFib3ZlIHJlZ2V4LlxuY29uc3QgZW51bSBIb3N0QmluZGluZ0dyb3VwIHtcbiAgLy8gZ3JvdXAgMTogXCJwcm9wXCIgZnJvbSBcIltwcm9wXVwiLCBvciBcImF0dHIucm9sZVwiIGZyb20gXCJbYXR0ci5yb2xlXVwiLCBvciBAYW5pbSBmcm9tIFtAYW5pbV1cbiAgQmluZGluZyA9IDEsXG5cbiAgLy8gZ3JvdXAgMjogXCJldmVudFwiIGZyb20gXCIoZXZlbnQpXCJcbiAgRXZlbnQgPSAyLFxufVxuXG4vLyBEZWZpbmVzIEhvc3QgQmluZGluZ3Mgc3RydWN0dXJlIHRoYXQgY29udGFpbnMgYXR0cmlidXRlcywgbGlzdGVuZXJzLCBhbmQgcHJvcGVydGllcyxcbi8vIHBhcnNlZCBmcm9tIHRoZSBgaG9zdGAgb2JqZWN0IGRlZmluZWQgZm9yIGEgVHlwZS5cbmV4cG9ydCBpbnRlcmZhY2UgUGFyc2VkSG9zdEJpbmRpbmdzIHtcbiAgYXR0cmlidXRlczoge1trZXk6IHN0cmluZ106IG8uRXhwcmVzc2lvbn07XG4gIGxpc3RlbmVyczoge1trZXk6IHN0cmluZ106IHN0cmluZ307XG4gIHByb3BlcnRpZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9O1xuICBzcGVjaWFsQXR0cmlidXRlczoge3N0eWxlQXR0cj86IHN0cmluZzsgY2xhc3NBdHRyPzogc3RyaW5nO307XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUhvc3RCaW5kaW5ncyhob3N0OiB7W2tleTogc3RyaW5nXTogc3RyaW5nfG8uRXhwcmVzc2lvbn0pOiBQYXJzZWRIb3N0QmluZGluZ3Mge1xuICBjb25zdCBhdHRyaWJ1dGVzOiB7W2tleTogc3RyaW5nXTogby5FeHByZXNzaW9ufSA9IHt9O1xuICBjb25zdCBsaXN0ZW5lcnM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG4gIGNvbnN0IHByb3BlcnRpZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG4gIGNvbnN0IHNwZWNpYWxBdHRyaWJ1dGVzOiB7c3R5bGVBdHRyPzogc3RyaW5nOyBjbGFzc0F0dHI/OiBzdHJpbmc7fSA9IHt9O1xuXG4gIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKGhvc3QpKSB7XG4gICAgY29uc3QgdmFsdWUgPSBob3N0W2tleV07XG4gICAgY29uc3QgbWF0Y2hlcyA9IGtleS5tYXRjaChIT1NUX1JFR19FWFApO1xuXG4gICAgaWYgKG1hdGNoZXMgPT09IG51bGwpIHtcbiAgICAgIHN3aXRjaCAoa2V5KSB7XG4gICAgICAgIGNhc2UgJ2NsYXNzJzpcbiAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgLy8gVE9ETyhhbHhodWIpOiBtYWtlIHRoaXMgYSBkaWFnbm9zdGljLlxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDbGFzcyBiaW5kaW5nIG11c3QgYmUgc3RyaW5nYCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHNwZWNpYWxBdHRyaWJ1dGVzLmNsYXNzQXR0ciA9IHZhbHVlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdzdHlsZSc6XG4gICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIC8vIFRPRE8oYWx4aHViKTogbWFrZSB0aGlzIGEgZGlhZ25vc3RpYy5cbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgU3R5bGUgYmluZGluZyBtdXN0IGJlIHN0cmluZ2ApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBzcGVjaWFsQXR0cmlidXRlcy5zdHlsZUF0dHIgPSB2YWx1ZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgYXR0cmlidXRlc1trZXldID0gby5saXRlcmFsKHZhbHVlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXR0cmlidXRlc1trZXldID0gdmFsdWU7XG4gICAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAobWF0Y2hlc1tIb3N0QmluZGluZ0dyb3VwLkJpbmRpbmddICE9IG51bGwpIHtcbiAgICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIC8vIFRPRE8oYWx4aHViKTogbWFrZSB0aGlzIGEgZGlhZ25vc3RpYy5cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBQcm9wZXJ0eSBiaW5kaW5nIG11c3QgYmUgc3RyaW5nYCk7XG4gICAgICB9XG4gICAgICAvLyBzeW50aGV0aWMgcHJvcGVydGllcyAodGhlIG9uZXMgdGhhdCBoYXZlIGEgYEBgIGFzIGEgcHJlZml4KVxuICAgICAgLy8gYXJlIHN0aWxsIHRyZWF0ZWQgdGhlIHNhbWUgYXMgcmVndWxhciBwcm9wZXJ0aWVzLiBUaGVyZWZvcmVcbiAgICAgIC8vIHRoZXJlIGlzIG5vIHBvaW50IGluIHN0b3JpbmcgdGhlbSBpbiBhIHNlcGFyYXRlIG1hcC5cbiAgICAgIHByb3BlcnRpZXNbbWF0Y2hlc1tIb3N0QmluZGluZ0dyb3VwLkJpbmRpbmddXSA9IHZhbHVlO1xuICAgIH0gZWxzZSBpZiAobWF0Y2hlc1tIb3N0QmluZGluZ0dyb3VwLkV2ZW50XSAhPSBudWxsKSB7XG4gICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykge1xuICAgICAgICAvLyBUT0RPKGFseGh1Yik6IG1ha2UgdGhpcyBhIGRpYWdub3N0aWMuXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgRXZlbnQgYmluZGluZyBtdXN0IGJlIHN0cmluZ2ApO1xuICAgICAgfVxuICAgICAgbGlzdGVuZXJzW21hdGNoZXNbSG9zdEJpbmRpbmdHcm91cC5FdmVudF1dID0gdmFsdWU7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHthdHRyaWJ1dGVzLCBsaXN0ZW5lcnMsIHByb3BlcnRpZXMsIHNwZWNpYWxBdHRyaWJ1dGVzfTtcbn1cblxuLyoqXG4gKiBWZXJpZmllcyBob3N0IGJpbmRpbmdzIGFuZCByZXR1cm5zIHRoZSBsaXN0IG9mIGVycm9ycyAoaWYgYW55KS4gRW1wdHkgYXJyYXkgaW5kaWNhdGVzIHRoYXQgYVxuICogZ2l2ZW4gc2V0IG9mIGhvc3QgYmluZGluZ3MgaGFzIG5vIGVycm9ycy5cbiAqXG4gKiBAcGFyYW0gYmluZGluZ3Mgc2V0IG9mIGhvc3QgYmluZGluZ3MgdG8gdmVyaWZ5LlxuICogQHBhcmFtIHNvdXJjZVNwYW4gc291cmNlIHNwYW4gd2hlcmUgaG9zdCBiaW5kaW5ncyB3ZXJlIGRlZmluZWQuXG4gKiBAcmV0dXJucyBhcnJheSBvZiBlcnJvcnMgYXNzb2NpYXRlZCB3aXRoIGEgZ2l2ZW4gc2V0IG9mIGhvc3QgYmluZGluZ3MuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2ZXJpZnlIb3N0QmluZGluZ3MoXG4gICAgYmluZGluZ3M6IFBhcnNlZEhvc3RCaW5kaW5ncywgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuKTogUGFyc2VFcnJvcltdIHtcbiAgY29uc3Qgc3VtbWFyeSA9IG1ldGFkYXRhQXNTdW1tYXJ5KGJpbmRpbmdzKTtcbiAgLy8gVE9ETzogYWJzdHJhY3Qgb3V0IGhvc3QgYmluZGluZ3MgdmVyaWZpY2F0aW9uIGxvZ2ljIGFuZCB1c2UgaXQgaW5zdGVhZCBvZlxuICAvLyBjcmVhdGluZyBldmVudHMgYW5kIHByb3BlcnRpZXMgQVNUcyB0byBkZXRlY3QgZXJyb3JzIChGVy05OTYpXG4gIGNvbnN0IGJpbmRpbmdQYXJzZXIgPSBtYWtlQmluZGluZ1BhcnNlcigpO1xuICBiaW5kaW5nUGFyc2VyLmNyZWF0ZURpcmVjdGl2ZUhvc3RFdmVudEFzdHMoc3VtbWFyeSwgc291cmNlU3Bhbik7XG4gIGJpbmRpbmdQYXJzZXIuY3JlYXRlQm91bmRIb3N0UHJvcGVydGllcyhzdW1tYXJ5LCBzb3VyY2VTcGFuKTtcbiAgcmV0dXJuIGJpbmRpbmdQYXJzZXIuZXJyb3JzO1xufVxuXG5mdW5jdGlvbiBjb21waWxlU3R5bGVzKHN0eWxlczogc3RyaW5nW10sIHNlbGVjdG9yOiBzdHJpbmcsIGhvc3RTZWxlY3Rvcjogc3RyaW5nKTogc3RyaW5nW10ge1xuICBjb25zdCBzaGFkb3dDc3MgPSBuZXcgU2hhZG93Q3NzKCk7XG4gIHJldHVybiBzdHlsZXMubWFwKHN0eWxlID0+IHtcbiAgICByZXR1cm4gc2hhZG93Q3NzIS5zaGltQ3NzVGV4dChzdHlsZSwgc2VsZWN0b3IsIGhvc3RTZWxlY3Rvcik7XG4gIH0pO1xufVxuIl19