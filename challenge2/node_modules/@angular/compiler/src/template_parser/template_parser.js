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
        define("@angular/compiler/src/template_parser/template_parser", ["require", "exports", "tslib", "@angular/compiler/src/compile_metadata", "@angular/compiler/src/expression_parser/ast", "@angular/compiler/src/identifiers", "@angular/compiler/src/ml_parser/ast", "@angular/compiler/src/ml_parser/html_parser", "@angular/compiler/src/ml_parser/html_whitespaces", "@angular/compiler/src/ml_parser/icu_ast_expander", "@angular/compiler/src/ml_parser/interpolation_config", "@angular/compiler/src/ml_parser/tags", "@angular/compiler/src/parse_util", "@angular/compiler/src/provider_analyzer", "@angular/compiler/src/selector", "@angular/compiler/src/style_url_resolver", "@angular/compiler/src/util", "@angular/compiler/src/template_parser/binding_parser", "@angular/compiler/src/template_parser/template_ast", "@angular/compiler/src/template_parser/template_preparser"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isEmptyExpression = exports.removeSummaryDuplicates = exports.createElementCssSelector = exports.splitClasses = exports.TemplateParser = exports.TemplateParseResult = exports.TemplateParseError = void 0;
    var tslib_1 = require("tslib");
    var compile_metadata_1 = require("@angular/compiler/src/compile_metadata");
    var ast_1 = require("@angular/compiler/src/expression_parser/ast");
    var identifiers_1 = require("@angular/compiler/src/identifiers");
    var html = require("@angular/compiler/src/ml_parser/ast");
    var html_parser_1 = require("@angular/compiler/src/ml_parser/html_parser");
    var html_whitespaces_1 = require("@angular/compiler/src/ml_parser/html_whitespaces");
    var icu_ast_expander_1 = require("@angular/compiler/src/ml_parser/icu_ast_expander");
    var interpolation_config_1 = require("@angular/compiler/src/ml_parser/interpolation_config");
    var tags_1 = require("@angular/compiler/src/ml_parser/tags");
    var parse_util_1 = require("@angular/compiler/src/parse_util");
    var provider_analyzer_1 = require("@angular/compiler/src/provider_analyzer");
    var selector_1 = require("@angular/compiler/src/selector");
    var style_url_resolver_1 = require("@angular/compiler/src/style_url_resolver");
    var util_1 = require("@angular/compiler/src/util");
    var binding_parser_1 = require("@angular/compiler/src/template_parser/binding_parser");
    var t = require("@angular/compiler/src/template_parser/template_ast");
    var template_preparser_1 = require("@angular/compiler/src/template_parser/template_preparser");
    var BIND_NAME_REGEXP = /^(?:(?:(?:(bind-)|(let-)|(ref-|#)|(on-)|(bindon-)|(@))(.*))|\[\(([^\)]+)\)\]|\[([^\]]+)\]|\(([^\)]+)\))$/;
    // Group 1 = "bind-"
    var KW_BIND_IDX = 1;
    // Group 2 = "let-"
    var KW_LET_IDX = 2;
    // Group 3 = "ref-/#"
    var KW_REF_IDX = 3;
    // Group 4 = "on-"
    var KW_ON_IDX = 4;
    // Group 5 = "bindon-"
    var KW_BINDON_IDX = 5;
    // Group 6 = "@"
    var KW_AT_IDX = 6;
    // Group 7 = the identifier after "bind-", "let-", "ref-/#", "on-", "bindon-" or "@"
    var IDENT_KW_IDX = 7;
    // Group 8 = identifier inside [()]
    var IDENT_BANANA_BOX_IDX = 8;
    // Group 9 = identifier inside []
    var IDENT_PROPERTY_IDX = 9;
    // Group 10 = identifier inside ()
    var IDENT_EVENT_IDX = 10;
    var TEMPLATE_ATTR_PREFIX = '*';
    var CLASS_ATTR = 'class';
    var _TEXT_CSS_SELECTOR;
    function TEXT_CSS_SELECTOR() {
        if (!_TEXT_CSS_SELECTOR) {
            _TEXT_CSS_SELECTOR = selector_1.CssSelector.parse('*')[0];
        }
        return _TEXT_CSS_SELECTOR;
    }
    var TemplateParseError = /** @class */ (function (_super) {
        tslib_1.__extends(TemplateParseError, _super);
        function TemplateParseError(message, span, level) {
            return _super.call(this, span, message, level) || this;
        }
        return TemplateParseError;
    }(parse_util_1.ParseError));
    exports.TemplateParseError = TemplateParseError;
    var TemplateParseResult = /** @class */ (function () {
        function TemplateParseResult(templateAst, usedPipes, errors) {
            this.templateAst = templateAst;
            this.usedPipes = usedPipes;
            this.errors = errors;
        }
        return TemplateParseResult;
    }());
    exports.TemplateParseResult = TemplateParseResult;
    var TemplateParser = /** @class */ (function () {
        function TemplateParser(_config, _reflector, _exprParser, _schemaRegistry, _htmlParser, _console, transforms) {
            this._config = _config;
            this._reflector = _reflector;
            this._exprParser = _exprParser;
            this._schemaRegistry = _schemaRegistry;
            this._htmlParser = _htmlParser;
            this._console = _console;
            this.transforms = transforms;
        }
        Object.defineProperty(TemplateParser.prototype, "expressionParser", {
            get: function () {
                return this._exprParser;
            },
            enumerable: false,
            configurable: true
        });
        TemplateParser.prototype.parse = function (component, template, directives, pipes, schemas, templateUrl, preserveWhitespaces) {
            var _a;
            var result = this.tryParse(component, template, directives, pipes, schemas, templateUrl, preserveWhitespaces);
            var warnings = result.errors.filter(function (error) { return error.level === parse_util_1.ParseErrorLevel.WARNING; });
            var errors = result.errors.filter(function (error) { return error.level === parse_util_1.ParseErrorLevel.ERROR; });
            if (warnings.length > 0) {
                (_a = this._console) === null || _a === void 0 ? void 0 : _a.warn("Template parse warnings:\n" + warnings.join('\n'));
            }
            if (errors.length > 0) {
                var errorString = errors.join('\n');
                throw util_1.syntaxError("Template parse errors:\n" + errorString, errors);
            }
            return { template: result.templateAst, pipes: result.usedPipes };
        };
        TemplateParser.prototype.tryParse = function (component, template, directives, pipes, schemas, templateUrl, preserveWhitespaces) {
            var htmlParseResult = typeof template === 'string' ?
                this._htmlParser.parse(template, templateUrl, {
                    tokenizeExpansionForms: true,
                    interpolationConfig: this.getInterpolationConfig(component)
                }) :
                template;
            if (!preserveWhitespaces) {
                htmlParseResult = html_whitespaces_1.removeWhitespaces(htmlParseResult);
            }
            return this.tryParseHtml(this.expandHtml(htmlParseResult), component, directives, pipes, schemas);
        };
        TemplateParser.prototype.tryParseHtml = function (htmlAstWithErrors, component, directives, pipes, schemas) {
            var result;
            var errors = htmlAstWithErrors.errors;
            var usedPipes = [];
            if (htmlAstWithErrors.rootNodes.length > 0) {
                var uniqDirectives = removeSummaryDuplicates(directives);
                var uniqPipes = removeSummaryDuplicates(pipes);
                var providerViewContext = new provider_analyzer_1.ProviderViewContext(this._reflector, component);
                var interpolationConfig = undefined;
                if (component.template && component.template.interpolation) {
                    interpolationConfig = {
                        start: component.template.interpolation[0],
                        end: component.template.interpolation[1]
                    };
                }
                var bindingParser = new binding_parser_1.BindingParser(this._exprParser, interpolationConfig, this._schemaRegistry, uniqPipes, errors);
                var parseVisitor = new TemplateParseVisitor(this._reflector, this._config, providerViewContext, uniqDirectives, bindingParser, this._schemaRegistry, schemas, errors);
                result = html.visitAll(parseVisitor, htmlAstWithErrors.rootNodes, EMPTY_ELEMENT_CONTEXT);
                errors.push.apply(errors, tslib_1.__spreadArray([], tslib_1.__read(providerViewContext.errors)));
                usedPipes.push.apply(usedPipes, tslib_1.__spreadArray([], tslib_1.__read(bindingParser.getUsedPipes())));
            }
            else {
                result = [];
            }
            this._assertNoReferenceDuplicationOnTemplate(result, errors);
            if (errors.length > 0) {
                return new TemplateParseResult(result, usedPipes, errors);
            }
            if (this.transforms) {
                this.transforms.forEach(function (transform) {
                    result = t.templateVisitAll(transform, result);
                });
            }
            return new TemplateParseResult(result, usedPipes, errors);
        };
        TemplateParser.prototype.expandHtml = function (htmlAstWithErrors, forced) {
            if (forced === void 0) { forced = false; }
            var errors = htmlAstWithErrors.errors;
            if (errors.length == 0 || forced) {
                // Transform ICU messages to angular directives
                var expandedHtmlAst = icu_ast_expander_1.expandNodes(htmlAstWithErrors.rootNodes);
                errors.push.apply(errors, tslib_1.__spreadArray([], tslib_1.__read(expandedHtmlAst.errors)));
                htmlAstWithErrors = new html_parser_1.ParseTreeResult(expandedHtmlAst.nodes, errors);
            }
            return htmlAstWithErrors;
        };
        TemplateParser.prototype.getInterpolationConfig = function (component) {
            if (component.template) {
                return interpolation_config_1.InterpolationConfig.fromArray(component.template.interpolation);
            }
            return undefined;
        };
        /** @internal */
        TemplateParser.prototype._assertNoReferenceDuplicationOnTemplate = function (result, errors) {
            var existingReferences = [];
            result.filter(function (element) { return !!element.references; })
                .forEach(function (element) { return element.references.forEach(function (reference) {
                var name = reference.name;
                if (existingReferences.indexOf(name) < 0) {
                    existingReferences.push(name);
                }
                else {
                    var error = new TemplateParseError("Reference \"#" + name + "\" is defined several times", reference.sourceSpan, parse_util_1.ParseErrorLevel.ERROR);
                    errors.push(error);
                }
            }); });
        };
        return TemplateParser;
    }());
    exports.TemplateParser = TemplateParser;
    var TemplateParseVisitor = /** @class */ (function () {
        function TemplateParseVisitor(reflector, config, providerViewContext, directives, _bindingParser, _schemaRegistry, _schemas, _targetErrors) {
            var _this = this;
            this.reflector = reflector;
            this.config = config;
            this.providerViewContext = providerViewContext;
            this._bindingParser = _bindingParser;
            this._schemaRegistry = _schemaRegistry;
            this._schemas = _schemas;
            this._targetErrors = _targetErrors;
            this.selectorMatcher = new selector_1.SelectorMatcher();
            this.directivesIndex = new Map();
            this.ngContentCount = 0;
            // Note: queries start with id 1 so we can use the number in a Bloom filter!
            this.contentQueryStartId = providerViewContext.component.viewQueries.length + 1;
            directives.forEach(function (directive, index) {
                var selector = selector_1.CssSelector.parse(directive.selector);
                _this.selectorMatcher.addSelectables(selector, directive);
                _this.directivesIndex.set(directive, index);
            });
        }
        TemplateParseVisitor.prototype.visitExpansion = function (expansion, context) {
            return null;
        };
        TemplateParseVisitor.prototype.visitExpansionCase = function (expansionCase, context) {
            return null;
        };
        TemplateParseVisitor.prototype.visitText = function (text, parent) {
            var ngContentIndex = parent.findNgContentIndex(TEXT_CSS_SELECTOR());
            var valueNoNgsp = html_whitespaces_1.replaceNgsp(text.value);
            var expr = this._bindingParser.parseInterpolation(valueNoNgsp, text.sourceSpan);
            return expr ? new t.BoundTextAst(expr, ngContentIndex, text.sourceSpan) :
                new t.TextAst(valueNoNgsp, ngContentIndex, text.sourceSpan);
        };
        TemplateParseVisitor.prototype.visitAttribute = function (attribute, context) {
            return new t.AttrAst(attribute.name, attribute.value, attribute.sourceSpan);
        };
        TemplateParseVisitor.prototype.visitComment = function (comment, context) {
            return null;
        };
        TemplateParseVisitor.prototype.visitElement = function (element, parent) {
            var _this = this;
            var queryStartIndex = this.contentQueryStartId;
            var elName = element.name;
            var preparsedElement = template_preparser_1.preparseElement(element);
            if (preparsedElement.type === template_preparser_1.PreparsedElementType.SCRIPT ||
                preparsedElement.type === template_preparser_1.PreparsedElementType.STYLE) {
                // Skipping <script> for security reasons
                // Skipping <style> as we already processed them
                // in the StyleCompiler
                return null;
            }
            if (preparsedElement.type === template_preparser_1.PreparsedElementType.STYLESHEET &&
                style_url_resolver_1.isStyleUrlResolvable(preparsedElement.hrefAttr)) {
                // Skipping stylesheets with either relative urls or package scheme as we already processed
                // them in the StyleCompiler
                return null;
            }
            var matchableAttrs = [];
            var elementOrDirectiveProps = [];
            var elementOrDirectiveRefs = [];
            var elementVars = [];
            var events = [];
            var templateElementOrDirectiveProps = [];
            var templateMatchableAttrs = [];
            var templateElementVars = [];
            var hasInlineTemplates = false;
            var attrs = [];
            var isTemplateElement = tags_1.isNgTemplate(element.name);
            element.attrs.forEach(function (attr) {
                var parsedVariables = [];
                var hasBinding = _this._parseAttr(isTemplateElement, attr, matchableAttrs, elementOrDirectiveProps, events, elementOrDirectiveRefs, elementVars);
                elementVars.push.apply(elementVars, tslib_1.__spreadArray([], tslib_1.__read(parsedVariables.map(function (v) { return t.VariableAst.fromParsedVariable(v); }))));
                var templateValue;
                var templateKey;
                var normalizedName = _this._normalizeAttributeName(attr.name);
                if (normalizedName.startsWith(TEMPLATE_ATTR_PREFIX)) {
                    templateValue = attr.value;
                    templateKey = normalizedName.substring(TEMPLATE_ATTR_PREFIX.length);
                }
                var hasTemplateBinding = templateValue != null;
                if (hasTemplateBinding) {
                    if (hasInlineTemplates) {
                        _this._reportError("Can't have multiple template bindings on one element. Use only one attribute prefixed with *", attr.sourceSpan);
                    }
                    hasInlineTemplates = true;
                    var parsedVariables_1 = [];
                    var absoluteOffset = (attr.valueSpan || attr.sourceSpan).start.offset;
                    _this._bindingParser.parseInlineTemplateBinding(templateKey, templateValue, attr.sourceSpan, absoluteOffset, templateMatchableAttrs, templateElementOrDirectiveProps, parsedVariables_1, false /* isIvyAst */);
                    templateElementVars.push.apply(templateElementVars, tslib_1.__spreadArray([], tslib_1.__read(parsedVariables_1.map(function (v) { return t.VariableAst.fromParsedVariable(v); }))));
                }
                if (!hasBinding && !hasTemplateBinding) {
                    // don't include the bindings as attributes as well in the AST
                    attrs.push(_this.visitAttribute(attr, null));
                    matchableAttrs.push([attr.name, attr.value]);
                }
            });
            var elementCssSelector = createElementCssSelector(elName, matchableAttrs);
            var _a = this._parseDirectives(this.selectorMatcher, elementCssSelector), directiveMetas = _a.directives, matchElement = _a.matchElement;
            var references = [];
            var boundDirectivePropNames = new Set();
            var directiveAsts = this._createDirectiveAsts(isTemplateElement, element.name, directiveMetas, elementOrDirectiveProps, elementOrDirectiveRefs, element.sourceSpan, references, boundDirectivePropNames);
            var elementProps = this._createElementPropertyAsts(element.name, elementOrDirectiveProps, boundDirectivePropNames);
            var isViewRoot = parent.isTemplateElement || hasInlineTemplates;
            var providerContext = new provider_analyzer_1.ProviderElementContext(this.providerViewContext, parent.providerContext, isViewRoot, directiveAsts, attrs, references, isTemplateElement, queryStartIndex, element.sourceSpan);
            var children = html.visitAll(preparsedElement.nonBindable ? NON_BINDABLE_VISITOR : this, element.children, ElementContext.create(isTemplateElement, directiveAsts, isTemplateElement ? parent.providerContext : providerContext));
            providerContext.afterElement();
            // Override the actual selector when the `ngProjectAs` attribute is provided
            var projectionSelector = preparsedElement.projectAs != '' ?
                selector_1.CssSelector.parse(preparsedElement.projectAs)[0] :
                elementCssSelector;
            var ngContentIndex = parent.findNgContentIndex(projectionSelector);
            var parsedElement;
            if (preparsedElement.type === template_preparser_1.PreparsedElementType.NG_CONTENT) {
                // `<ng-content>` element
                if (element.children && !element.children.every(_isEmptyTextNode)) {
                    this._reportError("<ng-content> element cannot have content.", element.sourceSpan);
                }
                parsedElement = new t.NgContentAst(this.ngContentCount++, hasInlineTemplates ? null : ngContentIndex, element.sourceSpan);
            }
            else if (isTemplateElement) {
                // `<ng-template>` element
                this._assertAllEventsPublishedByDirectives(directiveAsts, events);
                this._assertNoComponentsNorElementBindingsOnTemplate(directiveAsts, elementProps, element.sourceSpan);
                parsedElement = new t.EmbeddedTemplateAst(attrs, events, references, elementVars, providerContext.transformedDirectiveAsts, providerContext.transformProviders, providerContext.transformedHasViewContainer, providerContext.queryMatches, children, hasInlineTemplates ? null : ngContentIndex, element.sourceSpan);
            }
            else {
                // element other than `<ng-content>` and `<ng-template>`
                this._assertElementExists(matchElement, element);
                this._assertOnlyOneComponent(directiveAsts, element.sourceSpan);
                var ngContentIndex_1 = hasInlineTemplates ? null : parent.findNgContentIndex(projectionSelector);
                parsedElement = new t.ElementAst(elName, attrs, elementProps, events, references, providerContext.transformedDirectiveAsts, providerContext.transformProviders, providerContext.transformedHasViewContainer, providerContext.queryMatches, children, hasInlineTemplates ? null : ngContentIndex_1, element.sourceSpan, element.endSourceSpan || null);
            }
            if (hasInlineTemplates) {
                // The element as a *-attribute
                var templateQueryStartIndex = this.contentQueryStartId;
                var templateSelector = createElementCssSelector('ng-template', templateMatchableAttrs);
                var directives = this._parseDirectives(this.selectorMatcher, templateSelector).directives;
                var templateBoundDirectivePropNames = new Set();
                var templateDirectiveAsts = this._createDirectiveAsts(true, elName, directives, templateElementOrDirectiveProps, [], element.sourceSpan, [], templateBoundDirectivePropNames);
                var templateElementProps = this._createElementPropertyAsts(elName, templateElementOrDirectiveProps, templateBoundDirectivePropNames);
                this._assertNoComponentsNorElementBindingsOnTemplate(templateDirectiveAsts, templateElementProps, element.sourceSpan);
                var templateProviderContext = new provider_analyzer_1.ProviderElementContext(this.providerViewContext, parent.providerContext, parent.isTemplateElement, templateDirectiveAsts, [], [], true, templateQueryStartIndex, element.sourceSpan);
                templateProviderContext.afterElement();
                parsedElement = new t.EmbeddedTemplateAst([], [], [], templateElementVars, templateProviderContext.transformedDirectiveAsts, templateProviderContext.transformProviders, templateProviderContext.transformedHasViewContainer, templateProviderContext.queryMatches, [parsedElement], ngContentIndex, element.sourceSpan);
            }
            return parsedElement;
        };
        TemplateParseVisitor.prototype._parseAttr = function (isTemplateElement, attr, targetMatchableAttrs, targetProps, targetEvents, targetRefs, targetVars) {
            var name = this._normalizeAttributeName(attr.name);
            var value = attr.value;
            var srcSpan = attr.sourceSpan;
            var absoluteOffset = attr.valueSpan ? attr.valueSpan.start.offset : srcSpan.start.offset;
            var boundEvents = [];
            var bindParts = name.match(BIND_NAME_REGEXP);
            var hasBinding = false;
            if (bindParts !== null) {
                hasBinding = true;
                if (bindParts[KW_BIND_IDX] != null) {
                    this._bindingParser.parsePropertyBinding(bindParts[IDENT_KW_IDX], value, false, srcSpan, absoluteOffset, attr.valueSpan, targetMatchableAttrs, targetProps);
                }
                else if (bindParts[KW_LET_IDX]) {
                    if (isTemplateElement) {
                        var identifier = bindParts[IDENT_KW_IDX];
                        this._parseVariable(identifier, value, srcSpan, targetVars);
                    }
                    else {
                        this._reportError("\"let-\" is only supported on ng-template elements.", srcSpan);
                    }
                }
                else if (bindParts[KW_REF_IDX]) {
                    var identifier = bindParts[IDENT_KW_IDX];
                    this._parseReference(identifier, value, srcSpan, targetRefs);
                }
                else if (bindParts[KW_ON_IDX]) {
                    this._bindingParser.parseEvent(bindParts[IDENT_KW_IDX], value, srcSpan, attr.valueSpan || srcSpan, targetMatchableAttrs, boundEvents);
                }
                else if (bindParts[KW_BINDON_IDX]) {
                    this._bindingParser.parsePropertyBinding(bindParts[IDENT_KW_IDX], value, false, srcSpan, absoluteOffset, attr.valueSpan, targetMatchableAttrs, targetProps);
                    this._parseAssignmentEvent(bindParts[IDENT_KW_IDX], value, srcSpan, attr.valueSpan || srcSpan, targetMatchableAttrs, boundEvents);
                }
                else if (bindParts[KW_AT_IDX]) {
                    this._bindingParser.parseLiteralAttr(name, value, srcSpan, absoluteOffset, attr.valueSpan, targetMatchableAttrs, targetProps);
                }
                else if (bindParts[IDENT_BANANA_BOX_IDX]) {
                    this._bindingParser.parsePropertyBinding(bindParts[IDENT_BANANA_BOX_IDX], value, false, srcSpan, absoluteOffset, attr.valueSpan, targetMatchableAttrs, targetProps);
                    this._parseAssignmentEvent(bindParts[IDENT_BANANA_BOX_IDX], value, srcSpan, attr.valueSpan || srcSpan, targetMatchableAttrs, boundEvents);
                }
                else if (bindParts[IDENT_PROPERTY_IDX]) {
                    this._bindingParser.parsePropertyBinding(bindParts[IDENT_PROPERTY_IDX], value, false, srcSpan, absoluteOffset, attr.valueSpan, targetMatchableAttrs, targetProps);
                }
                else if (bindParts[IDENT_EVENT_IDX]) {
                    this._bindingParser.parseEvent(bindParts[IDENT_EVENT_IDX], value, srcSpan, attr.valueSpan || srcSpan, targetMatchableAttrs, boundEvents);
                }
            }
            else {
                hasBinding = this._bindingParser.parsePropertyInterpolation(name, value, srcSpan, attr.valueSpan, targetMatchableAttrs, targetProps);
            }
            if (!hasBinding) {
                this._bindingParser.parseLiteralAttr(name, value, srcSpan, absoluteOffset, attr.valueSpan, targetMatchableAttrs, targetProps);
            }
            targetEvents.push.apply(targetEvents, tslib_1.__spreadArray([], tslib_1.__read(boundEvents.map(function (e) { return t.BoundEventAst.fromParsedEvent(e); }))));
            return hasBinding;
        };
        TemplateParseVisitor.prototype._normalizeAttributeName = function (attrName) {
            return /^data-/i.test(attrName) ? attrName.substring(5) : attrName;
        };
        TemplateParseVisitor.prototype._parseVariable = function (identifier, value, sourceSpan, targetVars) {
            if (identifier.indexOf('-') > -1) {
                this._reportError("\"-\" is not allowed in variable names", sourceSpan);
            }
            else if (identifier.length === 0) {
                this._reportError("Variable does not have a name", sourceSpan);
            }
            targetVars.push(new t.VariableAst(identifier, value, sourceSpan));
        };
        TemplateParseVisitor.prototype._parseReference = function (identifier, value, sourceSpan, targetRefs) {
            if (identifier.indexOf('-') > -1) {
                this._reportError("\"-\" is not allowed in reference names", sourceSpan);
            }
            else if (identifier.length === 0) {
                this._reportError("Reference does not have a name", sourceSpan);
            }
            targetRefs.push(new ElementOrDirectiveRef(identifier, value, sourceSpan));
        };
        TemplateParseVisitor.prototype._parseAssignmentEvent = function (name, expression, sourceSpan, valueSpan, targetMatchableAttrs, targetEvents) {
            this._bindingParser.parseEvent(name + "Change", expression + "=$event", sourceSpan, valueSpan, targetMatchableAttrs, targetEvents);
        };
        TemplateParseVisitor.prototype._parseDirectives = function (selectorMatcher, elementCssSelector) {
            var _this = this;
            // Need to sort the directives so that we get consistent results throughout,
            // as selectorMatcher uses Maps inside.
            // Also deduplicate directives as they might match more than one time!
            var directives = util_1.newArray(this.directivesIndex.size);
            // Whether any directive selector matches on the element name
            var matchElement = false;
            selectorMatcher.match(elementCssSelector, function (selector, directive) {
                directives[_this.directivesIndex.get(directive)] = directive;
                matchElement = matchElement || selector.hasElementSelector();
            });
            return {
                directives: directives.filter(function (dir) { return !!dir; }),
                matchElement: matchElement,
            };
        };
        TemplateParseVisitor.prototype._createDirectiveAsts = function (isTemplateElement, elementName, directives, props, elementOrDirectiveRefs, elementSourceSpan, targetReferences, targetBoundDirectivePropNames) {
            var _this = this;
            var matchedReferences = new Set();
            var component = null;
            var directiveAsts = directives.map(function (directive) {
                var sourceSpan = new parse_util_1.ParseSourceSpan(elementSourceSpan.start, elementSourceSpan.end, elementSourceSpan.fullStart, "Directive " + compile_metadata_1.identifierName(directive.type));
                if (directive.isComponent) {
                    component = directive;
                }
                var directiveProperties = [];
                var boundProperties = _this._bindingParser.createDirectiveHostPropertyAsts(directive, elementName, sourceSpan);
                var hostProperties = boundProperties.map(function (prop) { return t.BoundElementPropertyAst.fromBoundProperty(prop); });
                // Note: We need to check the host properties here as well,
                // as we don't know the element name in the DirectiveWrapperCompiler yet.
                hostProperties = _this._checkPropertiesInSchema(elementName, hostProperties);
                var parsedEvents = _this._bindingParser.createDirectiveHostEventAsts(directive, sourceSpan);
                _this._createDirectivePropertyAsts(directive.inputs, props, directiveProperties, targetBoundDirectivePropNames);
                elementOrDirectiveRefs.forEach(function (elOrDirRef) {
                    if ((elOrDirRef.value.length === 0 && directive.isComponent) ||
                        (elOrDirRef.isReferenceToDirective(directive))) {
                        targetReferences.push(new t.ReferenceAst(elOrDirRef.name, identifiers_1.createTokenForReference(directive.type.reference), elOrDirRef.value, elOrDirRef.sourceSpan));
                        matchedReferences.add(elOrDirRef.name);
                    }
                });
                var hostEvents = parsedEvents.map(function (e) { return t.BoundEventAst.fromParsedEvent(e); });
                var contentQueryStartId = _this.contentQueryStartId;
                _this.contentQueryStartId += directive.queries.length;
                return new t.DirectiveAst(directive, directiveProperties, hostProperties, hostEvents, contentQueryStartId, sourceSpan);
            });
            elementOrDirectiveRefs.forEach(function (elOrDirRef) {
                if (elOrDirRef.value.length > 0) {
                    if (!matchedReferences.has(elOrDirRef.name)) {
                        _this._reportError("There is no directive with \"exportAs\" set to \"" + elOrDirRef.value + "\"", elOrDirRef.sourceSpan);
                    }
                }
                else if (!component) {
                    var refToken = null;
                    if (isTemplateElement) {
                        refToken = identifiers_1.createTokenForExternalReference(_this.reflector, identifiers_1.Identifiers.TemplateRef);
                    }
                    targetReferences.push(new t.ReferenceAst(elOrDirRef.name, refToken, elOrDirRef.value, elOrDirRef.sourceSpan));
                }
            });
            return directiveAsts;
        };
        TemplateParseVisitor.prototype._createDirectivePropertyAsts = function (directiveProperties, boundProps, targetBoundDirectiveProps, targetBoundDirectivePropNames) {
            if (directiveProperties) {
                var boundPropsByName_1 = new Map();
                boundProps.forEach(function (boundProp) {
                    var prevValue = boundPropsByName_1.get(boundProp.name);
                    if (!prevValue || prevValue.isLiteral) {
                        // give [a]="b" a higher precedence than a="b" on the same element
                        boundPropsByName_1.set(boundProp.name, boundProp);
                    }
                });
                Object.keys(directiveProperties).forEach(function (dirProp) {
                    var elProp = directiveProperties[dirProp];
                    var boundProp = boundPropsByName_1.get(elProp);
                    // Bindings are optional, so this binding only needs to be set up if an expression is given.
                    if (boundProp) {
                        targetBoundDirectivePropNames.add(boundProp.name);
                        if (!isEmptyExpression(boundProp.expression)) {
                            targetBoundDirectiveProps.push(new t.BoundDirectivePropertyAst(dirProp, boundProp.name, boundProp.expression, boundProp.sourceSpan));
                        }
                    }
                });
            }
        };
        TemplateParseVisitor.prototype._createElementPropertyAsts = function (elementName, props, boundDirectivePropNames) {
            var _this = this;
            var boundElementProps = [];
            props.forEach(function (prop) {
                if (!prop.isLiteral && !boundDirectivePropNames.has(prop.name)) {
                    var boundProp = _this._bindingParser.createBoundElementProperty(elementName, prop);
                    boundElementProps.push(t.BoundElementPropertyAst.fromBoundProperty(boundProp));
                }
            });
            return this._checkPropertiesInSchema(elementName, boundElementProps);
        };
        TemplateParseVisitor.prototype._findComponentDirectives = function (directives) {
            return directives.filter(function (directive) { return directive.directive.isComponent; });
        };
        TemplateParseVisitor.prototype._findComponentDirectiveNames = function (directives) {
            return this._findComponentDirectives(directives)
                .map(function (directive) { return compile_metadata_1.identifierName(directive.directive.type); });
        };
        TemplateParseVisitor.prototype._assertOnlyOneComponent = function (directives, sourceSpan) {
            var componentTypeNames = this._findComponentDirectiveNames(directives);
            if (componentTypeNames.length > 1) {
                this._reportError("More than one component matched on this element.\n" +
                    "Make sure that only one component's selector can match a given element.\n" +
                    ("Conflicting components: " + componentTypeNames.join(',')), sourceSpan);
            }
        };
        /**
         * Make sure that non-angular tags conform to the schemas.
         *
         * Note: An element is considered an angular tag when at least one directive selector matches the
         * tag name.
         *
         * @param matchElement Whether any directive has matched on the tag name
         * @param element the html element
         */
        TemplateParseVisitor.prototype._assertElementExists = function (matchElement, element) {
            var elName = element.name.replace(/^:xhtml:/, '');
            if (!matchElement && !this._schemaRegistry.hasElement(elName, this._schemas)) {
                var errorMsg = "'" + elName + "' is not a known element:\n";
                errorMsg += "1. If '" + elName + "' is an Angular component, then verify that it is part of this module.\n";
                if (elName.indexOf('-') > -1) {
                    errorMsg += "2. If '" + elName + "' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@NgModule.schemas' of this component to suppress this message.";
                }
                else {
                    errorMsg +=
                        "2. To allow any element add 'NO_ERRORS_SCHEMA' to the '@NgModule.schemas' of this component.";
                }
                this._reportError(errorMsg, element.sourceSpan);
            }
        };
        TemplateParseVisitor.prototype._assertNoComponentsNorElementBindingsOnTemplate = function (directives, elementProps, sourceSpan) {
            var _this = this;
            var componentTypeNames = this._findComponentDirectiveNames(directives);
            if (componentTypeNames.length > 0) {
                this._reportError("Components on an embedded template: " + componentTypeNames.join(','), sourceSpan);
            }
            elementProps.forEach(function (prop) {
                _this._reportError("Property binding " + prop.name + " not used by any directive on an embedded template. Make sure that the property name is spelled correctly and all directives are listed in the \"@NgModule.declarations\".", sourceSpan);
            });
        };
        TemplateParseVisitor.prototype._assertAllEventsPublishedByDirectives = function (directives, events) {
            var _this = this;
            var allDirectiveEvents = new Set();
            directives.forEach(function (directive) {
                Object.keys(directive.directive.outputs).forEach(function (k) {
                    var eventName = directive.directive.outputs[k];
                    allDirectiveEvents.add(eventName);
                });
            });
            events.forEach(function (event) {
                if (event.target != null || !allDirectiveEvents.has(event.name)) {
                    _this._reportError("Event binding " + event
                        .fullName + " not emitted by any directive on an embedded template. Make sure that the event name is spelled correctly and all directives are listed in the \"@NgModule.declarations\".", event.sourceSpan);
                }
            });
        };
        TemplateParseVisitor.prototype._checkPropertiesInSchema = function (elementName, boundProps) {
            var _this = this;
            // Note: We can't filter out empty expressions before this method,
            // as we still want to validate them!
            return boundProps.filter(function (boundProp) {
                if (boundProp.type === 0 /* Property */ &&
                    !_this._schemaRegistry.hasProperty(elementName, boundProp.name, _this._schemas)) {
                    var errorMsg = "Can't bind to '" + boundProp.name + "' since it isn't a known property of '" + elementName + "'.";
                    if (elementName.startsWith('ng-')) {
                        errorMsg +=
                            "\n1. If '" + boundProp
                                .name + "' is an Angular directive, then add 'CommonModule' to the '@NgModule.imports' of this component." +
                                "\n2. To allow any property add 'NO_ERRORS_SCHEMA' to the '@NgModule.schemas' of this component.";
                    }
                    else if (elementName.indexOf('-') > -1) {
                        errorMsg +=
                            "\n1. If '" + elementName + "' is an Angular component and it has '" + boundProp.name + "' input, then verify that it is part of this module." +
                                ("\n2. If '" + elementName + "' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@NgModule.schemas' of this component to suppress this message.") +
                                "\n3. To allow any property add 'NO_ERRORS_SCHEMA' to the '@NgModule.schemas' of this component.";
                    }
                    _this._reportError(errorMsg, boundProp.sourceSpan);
                }
                return !isEmptyExpression(boundProp.value);
            });
        };
        TemplateParseVisitor.prototype._reportError = function (message, sourceSpan, level) {
            if (level === void 0) { level = parse_util_1.ParseErrorLevel.ERROR; }
            this._targetErrors.push(new parse_util_1.ParseError(sourceSpan, message, level));
        };
        return TemplateParseVisitor;
    }());
    var NonBindableVisitor = /** @class */ (function () {
        function NonBindableVisitor() {
        }
        NonBindableVisitor.prototype.visitElement = function (ast, parent) {
            var preparsedElement = template_preparser_1.preparseElement(ast);
            if (preparsedElement.type === template_preparser_1.PreparsedElementType.SCRIPT ||
                preparsedElement.type === template_preparser_1.PreparsedElementType.STYLE ||
                preparsedElement.type === template_preparser_1.PreparsedElementType.STYLESHEET) {
                // Skipping <script> for security reasons
                // Skipping <style> and stylesheets as we already processed them
                // in the StyleCompiler
                return null;
            }
            var attrNameAndValues = ast.attrs.map(function (attr) { return [attr.name, attr.value]; });
            var selector = createElementCssSelector(ast.name, attrNameAndValues);
            var ngContentIndex = parent.findNgContentIndex(selector);
            var children = html.visitAll(this, ast.children, EMPTY_ELEMENT_CONTEXT);
            return new t.ElementAst(ast.name, html.visitAll(this, ast.attrs), [], [], [], [], [], false, [], children, ngContentIndex, ast.sourceSpan, ast.endSourceSpan);
        };
        NonBindableVisitor.prototype.visitComment = function (comment, context) {
            return null;
        };
        NonBindableVisitor.prototype.visitAttribute = function (attribute, context) {
            return new t.AttrAst(attribute.name, attribute.value, attribute.sourceSpan);
        };
        NonBindableVisitor.prototype.visitText = function (text, parent) {
            var ngContentIndex = parent.findNgContentIndex(TEXT_CSS_SELECTOR());
            return new t.TextAst(text.value, ngContentIndex, text.sourceSpan);
        };
        NonBindableVisitor.prototype.visitExpansion = function (expansion, context) {
            return expansion;
        };
        NonBindableVisitor.prototype.visitExpansionCase = function (expansionCase, context) {
            return expansionCase;
        };
        return NonBindableVisitor;
    }());
    /**
     * A reference to an element or directive in a template. E.g., the reference in this template:
     *
     * <div #myMenu="coolMenu">
     *
     * would be {name: 'myMenu', value: 'coolMenu', sourceSpan: ...}
     */
    var ElementOrDirectiveRef = /** @class */ (function () {
        function ElementOrDirectiveRef(name, value, sourceSpan) {
            this.name = name;
            this.value = value;
            this.sourceSpan = sourceSpan;
        }
        /** Gets whether this is a reference to the given directive. */
        ElementOrDirectiveRef.prototype.isReferenceToDirective = function (directive) {
            return splitExportAs(directive.exportAs).indexOf(this.value) !== -1;
        };
        return ElementOrDirectiveRef;
    }());
    /** Splits a raw, potentially comma-delimited `exportAs` value into an array of names. */
    function splitExportAs(exportAs) {
        return exportAs ? exportAs.split(',').map(function (e) { return e.trim(); }) : [];
    }
    function splitClasses(classAttrValue) {
        return classAttrValue.trim().split(/\s+/g);
    }
    exports.splitClasses = splitClasses;
    var ElementContext = /** @class */ (function () {
        function ElementContext(isTemplateElement, _ngContentIndexMatcher, _wildcardNgContentIndex, providerContext) {
            this.isTemplateElement = isTemplateElement;
            this._ngContentIndexMatcher = _ngContentIndexMatcher;
            this._wildcardNgContentIndex = _wildcardNgContentIndex;
            this.providerContext = providerContext;
        }
        ElementContext.create = function (isTemplateElement, directives, providerContext) {
            var matcher = new selector_1.SelectorMatcher();
            var wildcardNgContentIndex = null;
            var component = directives.find(function (directive) { return directive.directive.isComponent; });
            if (component) {
                var ngContentSelectors = component.directive.template.ngContentSelectors;
                for (var i = 0; i < ngContentSelectors.length; i++) {
                    var selector = ngContentSelectors[i];
                    if (selector === '*') {
                        wildcardNgContentIndex = i;
                    }
                    else {
                        matcher.addSelectables(selector_1.CssSelector.parse(ngContentSelectors[i]), i);
                    }
                }
            }
            return new ElementContext(isTemplateElement, matcher, wildcardNgContentIndex, providerContext);
        };
        ElementContext.prototype.findNgContentIndex = function (selector) {
            var ngContentIndices = [];
            this._ngContentIndexMatcher.match(selector, function (selector, ngContentIndex) {
                ngContentIndices.push(ngContentIndex);
            });
            ngContentIndices.sort();
            if (this._wildcardNgContentIndex != null) {
                ngContentIndices.push(this._wildcardNgContentIndex);
            }
            return ngContentIndices.length > 0 ? ngContentIndices[0] : null;
        };
        return ElementContext;
    }());
    function createElementCssSelector(elementName, attributes) {
        var cssSelector = new selector_1.CssSelector();
        var elNameNoNs = tags_1.splitNsName(elementName)[1];
        cssSelector.setElement(elNameNoNs);
        for (var i = 0; i < attributes.length; i++) {
            var attrName = attributes[i][0];
            var attrNameNoNs = tags_1.splitNsName(attrName)[1];
            var attrValue = attributes[i][1];
            cssSelector.addAttribute(attrNameNoNs, attrValue);
            if (attrName.toLowerCase() == CLASS_ATTR) {
                var classes = splitClasses(attrValue);
                classes.forEach(function (className) { return cssSelector.addClassName(className); });
            }
        }
        return cssSelector;
    }
    exports.createElementCssSelector = createElementCssSelector;
    var EMPTY_ELEMENT_CONTEXT = new ElementContext(true, new selector_1.SelectorMatcher(), null, null);
    var NON_BINDABLE_VISITOR = new NonBindableVisitor();
    function _isEmptyTextNode(node) {
        return node instanceof html.Text && node.value.trim().length == 0;
    }
    function removeSummaryDuplicates(items) {
        var map = new Map();
        items.forEach(function (item) {
            if (!map.get(item.type.reference)) {
                map.set(item.type.reference, item);
            }
        });
        return Array.from(map.values());
    }
    exports.removeSummaryDuplicates = removeSummaryDuplicates;
    function isEmptyExpression(ast) {
        if (ast instanceof ast_1.ASTWithSource) {
            ast = ast.ast;
        }
        return ast instanceof ast_1.EmptyExpr;
    }
    exports.isEmptyExpression = isEmptyExpression;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVtcGxhdGVfcGFyc2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3RlbXBsYXRlX3BhcnNlci90ZW1wbGF0ZV9wYXJzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILDJFQUFxSztJQUlySyxtRUFBb0g7SUFFcEgsaUVBQXFHO0lBQ3JHLDBEQUF5QztJQUN6QywyRUFBcUU7SUFDckUscUZBQTZFO0lBQzdFLHFGQUEwRDtJQUMxRCw2RkFBc0U7SUFDdEUsNkRBQTREO0lBQzVELCtEQUEyRTtJQUMzRSw2RUFBaUY7SUFFakYsMkRBQXlEO0lBQ3pELCtFQUEyRDtJQUMzRCxtREFBdUQ7SUFFdkQsdUZBQStDO0lBQy9DLHNFQUFvQztJQUNwQywrRkFBMkU7SUFFM0UsSUFBTSxnQkFBZ0IsR0FDbEIsMEdBQTBHLENBQUM7SUFFL0csb0JBQW9CO0lBQ3BCLElBQU0sV0FBVyxHQUFHLENBQUMsQ0FBQztJQUN0QixtQkFBbUI7SUFDbkIsSUFBTSxVQUFVLEdBQUcsQ0FBQyxDQUFDO0lBQ3JCLHFCQUFxQjtJQUNyQixJQUFNLFVBQVUsR0FBRyxDQUFDLENBQUM7SUFDckIsa0JBQWtCO0lBQ2xCLElBQU0sU0FBUyxHQUFHLENBQUMsQ0FBQztJQUNwQixzQkFBc0I7SUFDdEIsSUFBTSxhQUFhLEdBQUcsQ0FBQyxDQUFDO0lBQ3hCLGdCQUFnQjtJQUNoQixJQUFNLFNBQVMsR0FBRyxDQUFDLENBQUM7SUFDcEIsb0ZBQW9GO0lBQ3BGLElBQU0sWUFBWSxHQUFHLENBQUMsQ0FBQztJQUN2QixtQ0FBbUM7SUFDbkMsSUFBTSxvQkFBb0IsR0FBRyxDQUFDLENBQUM7SUFDL0IsaUNBQWlDO0lBQ2pDLElBQU0sa0JBQWtCLEdBQUcsQ0FBQyxDQUFDO0lBQzdCLGtDQUFrQztJQUNsQyxJQUFNLGVBQWUsR0FBRyxFQUFFLENBQUM7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Q0FBQyxDQUFDO0lBQzFGLElBQU0sb0JBQW9CLEdBQUcsSUFBSSxrQkFBa0IsRUFBRSxDQUFDO0lBRXRELFNBQVMsZ0JBQWdCLENBQUMsSUFBZTtRQUN2QyxPQUFPLElBQUksWUFBWSxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQztJQUNwRSxDQUFDO0lBRUQsU0FBZ0IsdUJBQXVCLENBQXdDLEtBQVU7UUFDdkYsSUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztRQUU5QixLQUFLLENBQUMsT0FBTyxDQUFDLFVBQUMsSUFBSTtZQUNqQixJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFO2dCQUNqQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO2FBQ3BDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQVZELDBEQVVDO0lBRUQsU0FBZ0IsaUJBQWlCLENBQUMsR0FBUTtRQUN4QyxJQUFJLEdBQUcsWUFBWSxtQkFBYSxFQUFFO1lBQ2hDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDO1NBQ2Y7UUFDRCxPQUFPLEdBQUcsWUFBWSxlQUFTLENBQUM7SUFDbEMsQ0FBQztJQUxELDhDQUtDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLCBDb21waWxlRGlyZWN0aXZlU3VtbWFyeSwgQ29tcGlsZVBpcGVTdW1tYXJ5LCBDb21waWxlVG9rZW5NZXRhZGF0YSwgQ29tcGlsZVR5cGVNZXRhZGF0YSwgaWRlbnRpZmllck5hbWV9IGZyb20gJy4uL2NvbXBpbGVfbWV0YWRhdGEnO1xuaW1wb3J0IHtDb21waWxlUmVmbGVjdG9yfSBmcm9tICcuLi9jb21waWxlX3JlZmxlY3Rvcic7XG5pbXBvcnQge0NvbXBpbGVyQ29uZmlnfSBmcm9tICcuLi9jb25maWcnO1xuaW1wb3J0IHtTY2hlbWFNZXRhZGF0YX0gZnJvbSAnLi4vY29yZSc7XG5pbXBvcnQge0FTVCwgQVNUV2l0aFNvdXJjZSwgRW1wdHlFeHByLCBQYXJzZWRFdmVudCwgUGFyc2VkUHJvcGVydHksIFBhcnNlZFZhcmlhYmxlfSBmcm9tICcuLi9leHByZXNzaW9uX3BhcnNlci9hc3QnO1xuaW1wb3J0IHtQYXJzZXJ9IGZyb20gJy4uL2V4cHJlc3Npb25fcGFyc2VyL3BhcnNlcic7XG5pbXBvcnQge2NyZWF0ZVRva2VuRm9yRXh0ZXJuYWxSZWZlcmVuY2UsIGNyZWF0ZVRva2VuRm9yUmVmZXJlbmNlLCBJZGVudGlmaWVyc30gZnJvbSAnLi4vaWRlbnRpZmllcnMnO1xuaW1wb3J0ICogYXMgaHRtbCBmcm9tICcuLi9tbF9wYXJzZXIvYXN0JztcbmltcG9ydCB7SHRtbFBhcnNlciwgUGFyc2VUcmVlUmVzdWx0fSBmcm9tICcuLi9tbF9wYXJzZXIvaHRtbF9wYXJzZXInO1xuaW1wb3J0IHtyZW1vdmVXaGl0ZXNwYWNlcywgcmVwbGFjZU5nc3B9IGZyb20gJy4uL21sX3BhcnNlci9odG1sX3doaXRlc3BhY2VzJztcbmltcG9ydCB7ZXhwYW5kTm9kZXN9IGZyb20gJy4uL21sX3BhcnNlci9pY3VfYXN0X2V4cGFuZGVyJztcbmltcG9ydCB7SW50ZXJwb2xhdGlvbkNvbmZpZ30gZnJvbSAnLi4vbWxfcGFyc2VyL2ludGVycG9sYXRpb25fY29uZmlnJztcbmltcG9ydCB7aXNOZ1RlbXBsYXRlLCBzcGxpdE5zTmFtZX0gZnJvbSAnLi4vbWxfcGFyc2VyL3RhZ3MnO1xuaW1wb3J0IHtQYXJzZUVycm9yLCBQYXJzZUVycm9yTGV2ZWwsIFBhcnNlU291cmNlU3Bhbn0gZnJvbSAnLi4vcGFyc2VfdXRpbCc7XG5pbXBvcnQge1Byb3ZpZGVyRWxlbWVudENvbnRleHQsIFByb3ZpZGVyVmlld0NvbnRleHR9IGZyb20gJy4uL3Byb3ZpZGVyX2FuYWx5emVyJztcbmltcG9ydCB7RWxlbWVudFNjaGVtYVJlZ2lzdHJ5fSBmcm9tICcuLi9zY2hlbWEvZWxlbWVudF9zY2hlbWFfcmVnaXN0cnknO1xuaW1wb3J0IHtDc3NTZWxlY3RvciwgU2VsZWN0b3JNYXRjaGVyfSBmcm9tICcuLi9zZWxlY3Rvcic7XG5pbXBvcnQge2lzU3R5bGVVcmxSZXNvbHZhYmxlfSBmcm9tICcuLi9zdHlsZV91cmxfcmVzb2x2ZXInO1xuaW1wb3J0IHtDb25zb2xlLCBuZXdBcnJheSwgc3ludGF4RXJyb3J9IGZyb20gJy4uL3V0aWwnO1xuXG5pbXBvcnQge0JpbmRpbmdQYXJzZXJ9IGZyb20gJy4vYmluZGluZ19wYXJzZXInO1xuaW1wb3J0ICogYXMgdCBmcm9tICcuL3RlbXBsYXRlX2FzdCc7XG5pbXBvcnQge1ByZXBhcnNlZEVsZW1lbnRUeXBlLCBwcmVwYXJzZUVsZW1lbnR9IGZyb20gJy4vdGVtcGxhdGVfcHJlcGFyc2VyJztcblxuY29uc3QgQklORF9OQU1FX1JFR0VYUCA9XG4gICAgL14oPzooPzooPzooYmluZC0pfChsZXQtKXwocmVmLXwjKXwob24tKXwoYmluZG9uLSl8KEApKSguKikpfFxcW1xcKChbXlxcKV0rKVxcKVxcXXxcXFsoW15cXF1dKylcXF18XFwoKFteXFwpXSspXFwpKSQvO1xuXG4vLyBHcm91cCAxID0gXCJiaW5kLVwiXG5jb25zdCBLV19CSU5EX0lEWCA9IDE7XG4vLyBHcm91cCAyID0gXCJsZXQtXCJcbmNvbnN0IEtXX0xFVF9JRFggPSAyO1xuLy8gR3JvdXAgMyA9IFwicmVmLS8jXCJcbmNvbnN0IEtXX1JFRl9JRFggPSAzO1xuLy8gR3JvdXAgNCA9IFwib24tXCJcbmNvbnN0IEtXX09OX0lEWCA9IDQ7XG4vLyBHcm91cCA1ID0gXCJiaW5kb24tXCJcbmNvbnN0IEtXX0JJTkRPTl9JRFggPSA1O1xuLy8gR3JvdXAgNiA9IFwiQFwiXG5jb25zdCBLV19BVF9JRFggPSA2O1xuLy8gR3JvdXAgNyA9IHRoZSBpZGVudGlmaWVyIGFmdGVyIFwiYmluZC1cIiwgXCJsZXQtXCIsIFwicmVmLS8jXCIsIFwib24tXCIsIFwiYmluZG9uLVwiIG9yIFwiQFwiXG5jb25zdCBJREVOVF9LV19JRFggPSA3O1xuLy8gR3JvdXAgOCA9IGlkZW50aWZpZXIgaW5zaWRlIFsoKV1cbmNvbnN0IElERU5UX0JBTkFOQV9CT1hfSURYID0gODtcbi8vIEdyb3VwIDkgPSBpZGVudGlmaWVyIGluc2lkZSBbXVxuY29uc3QgSURFTlRfUFJPUEVSVFlfSURYID0gOTtcbi8vIEdyb3VwIDEwID0gaWRlbnRpZmllciBpbnNpZGUgKClcbmNvbnN0IElERU5UX0VWRU5UX0lEWCA9IDEwO1xuXG5jb25zdCBURU1QTEFURV9BVFRSX1BSRUZJWCA9ICcqJztcbmNvbnN0IENMQVNTX0FUVFIgPSAnY2xhc3MnO1xuXG5sZXQgX1RFWFRfQ1NTX1NFTEVDVE9SITogQ3NzU2VsZWN0b3I7XG5mdW5jdGlvbiBURVhUX0NTU19TRUxFQ1RPUigpOiBDc3NTZWxlY3RvciB7XG4gIGlmICghX1RFWFRfQ1NTX1NFTEVDVE9SKSB7XG4gICAgX1RFWFRfQ1NTX1NFTEVDVE9SID0gQ3NzU2VsZWN0b3IucGFyc2UoJyonKVswXTtcbiAgfVxuICByZXR1cm4gX1RFWFRfQ1NTX1NFTEVDVE9SO1xufVxuXG5leHBvcnQgY2xhc3MgVGVtcGxhdGVQYXJzZUVycm9yIGV4dGVuZHMgUGFyc2VFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U6IHN0cmluZywgc3BhbjogUGFyc2VTb3VyY2VTcGFuLCBsZXZlbDogUGFyc2VFcnJvckxldmVsKSB7XG4gICAgc3VwZXIoc3BhbiwgbWVzc2FnZSwgbGV2ZWwpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBUZW1wbGF0ZVBhcnNlUmVzdWx0IHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgdGVtcGxhdGVBc3Q/OiB0LlRlbXBsYXRlQXN0W10sIHB1YmxpYyB1c2VkUGlwZXM/OiBDb21waWxlUGlwZVN1bW1hcnlbXSxcbiAgICAgIHB1YmxpYyBlcnJvcnM/OiBQYXJzZUVycm9yW10pIHt9XG59XG5cbmV4cG9ydCBjbGFzcyBUZW1wbGF0ZVBhcnNlciB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBfY29uZmlnOiBDb21waWxlckNvbmZpZywgcHJpdmF0ZSBfcmVmbGVjdG9yOiBDb21waWxlUmVmbGVjdG9yLFxuICAgICAgcHJpdmF0ZSBfZXhwclBhcnNlcjogUGFyc2VyLCBwcml2YXRlIF9zY2hlbWFSZWdpc3RyeTogRWxlbWVudFNjaGVtYVJlZ2lzdHJ5LFxuICAgICAgcHJpdmF0ZSBfaHRtbFBhcnNlcjogSHRtbFBhcnNlciwgcHJpdmF0ZSBfY29uc29sZTogQ29uc29sZXxudWxsLFxuICAgICAgcHVibGljIHRyYW5zZm9ybXM6IHQuVGVtcGxhdGVBc3RWaXNpdG9yW10pIHt9XG5cbiAgcHVibGljIGdldCBleHByZXNzaW9uUGFyc2VyKCkge1xuICAgIHJldHVybiB0aGlzLl9leHByUGFyc2VyO1xuICB9XG5cbiAgcGFyc2UoXG4gICAgICBjb21wb25lbnQ6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSwgdGVtcGxhdGU6IHN0cmluZ3xQYXJzZVRyZWVSZXN1bHQsXG4gICAgICBkaXJlY3RpdmVzOiBDb21waWxlRGlyZWN0aXZlU3VtbWFyeVtdLCBwaXBlczogQ29tcGlsZVBpcGVTdW1tYXJ5W10sIHNjaGVtYXM6IFNjaGVtYU1ldGFkYXRhW10sXG4gICAgICB0ZW1wbGF0ZVVybDogc3RyaW5nLFxuICAgICAgcHJlc2VydmVXaGl0ZXNwYWNlczogYm9vbGVhbik6IHt0ZW1wbGF0ZTogdC5UZW1wbGF0ZUFzdFtdLCBwaXBlczogQ29tcGlsZVBpcGVTdW1tYXJ5W119IHtcbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLnRyeVBhcnNlKFxuICAgICAgICBjb21wb25lbnQsIHRlbXBsYXRlLCBkaXJlY3RpdmVzLCBwaXBlcywgc2NoZW1hcywgdGVtcGxhdGVVcmwsIHByZXNlcnZlV2hpdGVzcGFjZXMpO1xuICAgIGNvbnN0IHdhcm5pbmdzID0gcmVzdWx0LmVycm9ycyEuZmlsdGVyKGVycm9yID0+IGVycm9yLmxldmVsID09PSBQYXJzZUVycm9yTGV2ZWwuV0FSTklORyk7XG5cbiAgICBjb25zdCBlcnJvcnMgPSByZXN1bHQuZXJyb3JzIS5maWx0ZXIoZXJyb3IgPT4gZXJyb3IubGV2ZWwgPT09IFBhcnNlRXJyb3JMZXZlbC5FUlJPUik7XG5cbiAgICBpZiAod2FybmluZ3MubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5fY29uc29sZT8ud2FybihgVGVtcGxhdGUgcGFyc2Ugd2FybmluZ3M6XFxuJHt3YXJuaW5ncy5qb2luKCdcXG4nKX1gKTtcbiAgICB9XG5cbiAgICBpZiAoZXJyb3JzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IGVycm9yU3RyaW5nID0gZXJyb3JzLmpvaW4oJ1xcbicpO1xuICAgICAgdGhyb3cgc3ludGF4RXJyb3IoYFRlbXBsYXRlIHBhcnNlIGVycm9yczpcXG4ke2Vycm9yU3RyaW5nfWAsIGVycm9ycyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHt0ZW1wbGF0ZTogcmVzdWx0LnRlbXBsYXRlQXN0ISwgcGlwZXM6IHJlc3VsdC51c2VkUGlwZXMhfTtcbiAgfVxuXG4gIHRyeVBhcnNlKFxuICAgICAgY29tcG9uZW50OiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEsIHRlbXBsYXRlOiBzdHJpbmd8UGFyc2VUcmVlUmVzdWx0LFxuICAgICAgZGlyZWN0aXZlczogQ29tcGlsZURpcmVjdGl2ZVN1bW1hcnlbXSwgcGlwZXM6IENvbXBpbGVQaXBlU3VtbWFyeVtdLCBzY2hlbWFzOiBTY2hlbWFNZXRhZGF0YVtdLFxuICAgICAgdGVtcGxhdGVVcmw6IHN0cmluZywgcHJlc2VydmVXaGl0ZXNwYWNlczogYm9vbGVhbik6IFRlbXBsYXRlUGFyc2VSZXN1bHQge1xuICAgIGxldCBodG1sUGFyc2VSZXN1bHQgPSB0eXBlb2YgdGVtcGxhdGUgPT09ICdzdHJpbmcnID9cbiAgICAgICAgdGhpcy5faHRtbFBhcnNlciEucGFyc2UodGVtcGxhdGUsIHRlbXBsYXRlVXJsLCB7XG4gICAgICAgICAgdG9rZW5pemVFeHBhbnNpb25Gb3JtczogdHJ1ZSxcbiAgICAgICAgICBpbnRlcnBvbGF0aW9uQ29uZmlnOiB0aGlzLmdldEludGVycG9sYXRpb25Db25maWcoY29tcG9uZW50KVxuICAgICAgICB9KSA6XG4gICAgICAgIHRlbXBsYXRlO1xuXG4gICAgaWYgKCFwcmVzZXJ2ZVdoaXRlc3BhY2VzKSB7XG4gICAgICBodG1sUGFyc2VSZXN1bHQgPSByZW1vdmVXaGl0ZXNwYWNlcyhodG1sUGFyc2VSZXN1bHQpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnRyeVBhcnNlSHRtbChcbiAgICAgICAgdGhpcy5leHBhbmRIdG1sKGh0bWxQYXJzZVJlc3VsdCksIGNvbXBvbmVudCwgZGlyZWN0aXZlcywgcGlwZXMsIHNjaGVtYXMpO1xuICB9XG5cbiAgdHJ5UGFyc2VIdG1sKFxuICAgICAgaHRtbEFzdFdpdGhFcnJvcnM6IFBhcnNlVHJlZVJlc3VsdCwgY29tcG9uZW50OiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEsXG4gICAgICBkaXJlY3RpdmVzOiBDb21waWxlRGlyZWN0aXZlU3VtbWFyeVtdLCBwaXBlczogQ29tcGlsZVBpcGVTdW1tYXJ5W10sXG4gICAgICBzY2hlbWFzOiBTY2hlbWFNZXRhZGF0YVtdKTogVGVtcGxhdGVQYXJzZVJlc3VsdCB7XG4gICAgbGV0IHJlc3VsdDogdC5UZW1wbGF0ZUFzdFtdO1xuICAgIGNvbnN0IGVycm9ycyA9IGh0bWxBc3RXaXRoRXJyb3JzLmVycm9ycztcbiAgICBjb25zdCB1c2VkUGlwZXM6IENvbXBpbGVQaXBlU3VtbWFyeVtdID0gW107XG4gICAgaWYgKGh0bWxBc3RXaXRoRXJyb3JzLnJvb3ROb2Rlcy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCB1bmlxRGlyZWN0aXZlcyA9IHJlbW92ZVN1bW1hcnlEdXBsaWNhdGVzKGRpcmVjdGl2ZXMpO1xuICAgICAgY29uc3QgdW5pcVBpcGVzID0gcmVtb3ZlU3VtbWFyeUR1cGxpY2F0ZXMocGlwZXMpO1xuICAgICAgY29uc3QgcHJvdmlkZXJWaWV3Q29udGV4dCA9IG5ldyBQcm92aWRlclZpZXdDb250ZXh0KHRoaXMuX3JlZmxlY3RvciwgY29tcG9uZW50KTtcbiAgICAgIGxldCBpbnRlcnBvbGF0aW9uQ29uZmlnOiBJbnRlcnBvbGF0aW9uQ29uZmlnID0gdW5kZWZpbmVkITtcbiAgICAgIGlmIChjb21wb25lbnQudGVtcGxhdGUgJiYgY29tcG9uZW50LnRlbXBsYXRlLmludGVycG9sYXRpb24pIHtcbiAgICAgICAgaW50ZXJwb2xhdGlvbkNvbmZpZyA9IHtcbiAgICAgICAgICBzdGFydDogY29tcG9uZW50LnRlbXBsYXRlLmludGVycG9sYXRpb25bMF0sXG4gICAgICAgICAgZW5kOiBjb21wb25lbnQudGVtcGxhdGUuaW50ZXJwb2xhdGlvblsxXVxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgY29uc3QgYmluZGluZ1BhcnNlciA9IG5ldyBCaW5kaW5nUGFyc2VyKFxuICAgICAgICAgIHRoaXMuX2V4cHJQYXJzZXIsIGludGVycG9sYXRpb25Db25maWchLCB0aGlzLl9zY2hlbWFSZWdpc3RyeSwgdW5pcVBpcGVzLCBlcnJvcnMpO1xuICAgICAgY29uc3QgcGFyc2VWaXNpdG9yID0gbmV3IFRlbXBsYXRlUGFyc2VWaXNpdG9yKFxuICAgICAgICAgIHRoaXMuX3JlZmxlY3RvciwgdGhpcy5fY29uZmlnLCBwcm92aWRlclZpZXdDb250ZXh0LCB1bmlxRGlyZWN0aXZlcywgYmluZGluZ1BhcnNlcixcbiAgICAgICAgICB0aGlzLl9zY2hlbWFSZWdpc3RyeSwgc2NoZW1hcywgZXJyb3JzKTtcbiAgICAgIHJlc3VsdCA9IGh0bWwudmlzaXRBbGwocGFyc2VWaXNpdG9yLCBodG1sQXN0V2l0aEVycm9ycy5yb290Tm9kZXMsIEVNUFRZX0VMRU1FTlRfQ09OVEVYVCk7XG4gICAgICBlcnJvcnMucHVzaCguLi5wcm92aWRlclZpZXdDb250ZXh0LmVycm9ycyk7XG4gICAgICB1c2VkUGlwZXMucHVzaCguLi5iaW5kaW5nUGFyc2VyLmdldFVzZWRQaXBlcygpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0ID0gW107XG4gICAgfVxuICAgIHRoaXMuX2Fzc2VydE5vUmVmZXJlbmNlRHVwbGljYXRpb25PblRlbXBsYXRlKHJlc3VsdCwgZXJyb3JzKTtcblxuICAgIGlmIChlcnJvcnMubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIG5ldyBUZW1wbGF0ZVBhcnNlUmVzdWx0KHJlc3VsdCwgdXNlZFBpcGVzLCBlcnJvcnMpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnRyYW5zZm9ybXMpIHtcbiAgICAgIHRoaXMudHJhbnNmb3Jtcy5mb3JFYWNoKCh0cmFuc2Zvcm06IHQuVGVtcGxhdGVBc3RWaXNpdG9yKSA9PiB7XG4gICAgICAgIHJlc3VsdCA9IHQudGVtcGxhdGVWaXNpdEFsbCh0cmFuc2Zvcm0sIHJlc3VsdCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFRlbXBsYXRlUGFyc2VSZXN1bHQocmVzdWx0LCB1c2VkUGlwZXMsIGVycm9ycyk7XG4gIH1cblxuICBleHBhbmRIdG1sKGh0bWxBc3RXaXRoRXJyb3JzOiBQYXJzZVRyZWVSZXN1bHQsIGZvcmNlZDogYm9vbGVhbiA9IGZhbHNlKTogUGFyc2VUcmVlUmVzdWx0IHtcbiAgICBjb25zdCBlcnJvcnM6IFBhcnNlRXJyb3JbXSA9IGh0bWxBc3RXaXRoRXJyb3JzLmVycm9ycztcblxuICAgIGlmIChlcnJvcnMubGVuZ3RoID09IDAgfHwgZm9yY2VkKSB7XG4gICAgICAvLyBUcmFuc2Zvcm0gSUNVIG1lc3NhZ2VzIHRvIGFuZ3VsYXIgZGlyZWN0aXZlc1xuICAgICAgY29uc3QgZXhwYW5kZWRIdG1sQXN0ID0gZXhwYW5kTm9kZXMoaHRtbEFzdFdpdGhFcnJvcnMucm9vdE5vZGVzKTtcbiAgICAgIGVycm9ycy5wdXNoKC4uLmV4cGFuZGVkSHRtbEFzdC5lcnJvcnMpO1xuICAgICAgaHRtbEFzdFdpdGhFcnJvcnMgPSBuZXcgUGFyc2VUcmVlUmVzdWx0KGV4cGFuZGVkSHRtbEFzdC5ub2RlcywgZXJyb3JzKTtcbiAgICB9XG4gICAgcmV0dXJuIGh0bWxBc3RXaXRoRXJyb3JzO1xuICB9XG5cbiAgZ2V0SW50ZXJwb2xhdGlvbkNvbmZpZyhjb21wb25lbnQ6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSk6IEludGVycG9sYXRpb25Db25maWd8dW5kZWZpbmVkIHtcbiAgICBpZiAoY29tcG9uZW50LnRlbXBsYXRlKSB7XG4gICAgICByZXR1cm4gSW50ZXJwb2xhdGlvbkNvbmZpZy5mcm9tQXJyYXkoY29tcG9uZW50LnRlbXBsYXRlLmludGVycG9sYXRpb24pO1xuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfYXNzZXJ0Tm9SZWZlcmVuY2VEdXBsaWNhdGlvbk9uVGVtcGxhdGUocmVzdWx0OiB0LlRlbXBsYXRlQXN0W10sIGVycm9yczogVGVtcGxhdGVQYXJzZUVycm9yW10pOlxuICAgICAgdm9pZCB7XG4gICAgY29uc3QgZXhpc3RpbmdSZWZlcmVuY2VzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgcmVzdWx0LmZpbHRlcihlbGVtZW50ID0+ICEhKDxhbnk+ZWxlbWVudCkucmVmZXJlbmNlcylcbiAgICAgICAgLmZvckVhY2goZWxlbWVudCA9PiAoPGFueT5lbGVtZW50KS5yZWZlcmVuY2VzLmZvckVhY2goKHJlZmVyZW5jZTogdC5SZWZlcmVuY2VBc3QpID0+IHtcbiAgICAgICAgICBjb25zdCBuYW1lID0gcmVmZXJlbmNlLm5hbWU7XG4gICAgICAgICAgaWYgKGV4aXN0aW5nUmVmZXJlbmNlcy5pbmRleE9mKG5hbWUpIDwgMCkge1xuICAgICAgICAgICAgZXhpc3RpbmdSZWZlcmVuY2VzLnB1c2gobmFtZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yID0gbmV3IFRlbXBsYXRlUGFyc2VFcnJvcihcbiAgICAgICAgICAgICAgICBgUmVmZXJlbmNlIFwiIyR7bmFtZX1cIiBpcyBkZWZpbmVkIHNldmVyYWwgdGltZXNgLCByZWZlcmVuY2Uuc291cmNlU3BhbixcbiAgICAgICAgICAgICAgICBQYXJzZUVycm9yTGV2ZWwuRVJST1IpO1xuICAgICAgICAgICAgZXJyb3JzLnB1c2goZXJyb3IpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuICB9XG59XG5cbmNsYXNzIFRlbXBsYXRlUGFyc2VWaXNpdG9yIGltcGxlbWVudHMgaHRtbC5WaXNpdG9yIHtcbiAgc2VsZWN0b3JNYXRjaGVyID0gbmV3IFNlbGVjdG9yTWF0Y2hlcigpO1xuICBkaXJlY3RpdmVzSW5kZXggPSBuZXcgTWFwPENvbXBpbGVEaXJlY3RpdmVTdW1tYXJ5LCBudW1iZXI+KCk7XG4gIG5nQ29udGVudENvdW50ID0gMDtcbiAgY29udGVudFF1ZXJ5U3RhcnRJZDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSByZWZsZWN0b3I6IENvbXBpbGVSZWZsZWN0b3IsIHByaXZhdGUgY29uZmlnOiBDb21waWxlckNvbmZpZyxcbiAgICAgIHB1YmxpYyBwcm92aWRlclZpZXdDb250ZXh0OiBQcm92aWRlclZpZXdDb250ZXh0LCBkaXJlY3RpdmVzOiBDb21waWxlRGlyZWN0aXZlU3VtbWFyeVtdLFxuICAgICAgcHJpdmF0ZSBfYmluZGluZ1BhcnNlcjogQmluZGluZ1BhcnNlciwgcHJpdmF0ZSBfc2NoZW1hUmVnaXN0cnk6IEVsZW1lbnRTY2hlbWFSZWdpc3RyeSxcbiAgICAgIHByaXZhdGUgX3NjaGVtYXM6IFNjaGVtYU1ldGFkYXRhW10sIHByaXZhdGUgX3RhcmdldEVycm9yczogVGVtcGxhdGVQYXJzZUVycm9yW10pIHtcbiAgICAvLyBOb3RlOiBxdWVyaWVzIHN0YXJ0IHdpdGggaWQgMSBzbyB3ZSBjYW4gdXNlIHRoZSBudW1iZXIgaW4gYSBCbG9vbSBmaWx0ZXIhXG4gICAgdGhpcy5jb250ZW50UXVlcnlTdGFydElkID0gcHJvdmlkZXJWaWV3Q29udGV4dC5jb21wb25lbnQudmlld1F1ZXJpZXMubGVuZ3RoICsgMTtcbiAgICBkaXJlY3RpdmVzLmZvckVhY2goKGRpcmVjdGl2ZSwgaW5kZXgpID0+IHtcbiAgICAgIGNvbnN0IHNlbGVjdG9yID0gQ3NzU2VsZWN0b3IucGFyc2UoZGlyZWN0aXZlLnNlbGVjdG9yISk7XG4gICAgICB0aGlzLnNlbGVjdG9yTWF0Y2hlci5hZGRTZWxlY3RhYmxlcyhzZWxlY3RvciwgZGlyZWN0aXZlKTtcbiAgICAgIHRoaXMuZGlyZWN0aXZlc0luZGV4LnNldChkaXJlY3RpdmUsIGluZGV4KTtcbiAgICB9KTtcbiAgfVxuXG4gIHZpc2l0RXhwYW5zaW9uKGV4cGFuc2lvbjogaHRtbC5FeHBhbnNpb24sIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICB2aXNpdEV4cGFuc2lvbkNhc2UoZXhwYW5zaW9uQ2FzZTogaHRtbC5FeHBhbnNpb25DYXNlLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgdmlzaXRUZXh0KHRleHQ6IGh0bWwuVGV4dCwgcGFyZW50OiBFbGVtZW50Q29udGV4dCk6IGFueSB7XG4gICAgY29uc3QgbmdDb250ZW50SW5kZXggPSBwYXJlbnQuZmluZE5nQ29udGVudEluZGV4KFRFWFRfQ1NTX1NFTEVDVE9SKCkpITtcbiAgICBjb25zdCB2YWx1ZU5vTmdzcCA9IHJlcGxhY2VOZ3NwKHRleHQudmFsdWUpO1xuICAgIGNvbnN0IGV4cHIgPSB0aGlzLl9iaW5kaW5nUGFyc2VyLnBhcnNlSW50ZXJwb2xhdGlvbih2YWx1ZU5vTmdzcCwgdGV4dC5zb3VyY2VTcGFuKTtcbiAgICByZXR1cm4gZXhwciA/IG5ldyB0LkJvdW5kVGV4dEFzdChleHByLCBuZ0NvbnRlbnRJbmRleCwgdGV4dC5zb3VyY2VTcGFuKSA6XG4gICAgICAgICAgICAgICAgICBuZXcgdC5UZXh0QXN0KHZhbHVlTm9OZ3NwLCBuZ0NvbnRlbnRJbmRleCwgdGV4dC5zb3VyY2VTcGFuKTtcbiAgfVxuXG4gIHZpc2l0QXR0cmlidXRlKGF0dHJpYnV0ZTogaHRtbC5BdHRyaWJ1dGUsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIG5ldyB0LkF0dHJBc3QoYXR0cmlidXRlLm5hbWUsIGF0dHJpYnV0ZS52YWx1ZSwgYXR0cmlidXRlLnNvdXJjZVNwYW4pO1xuICB9XG5cbiAgdmlzaXRDb21tZW50KGNvbW1lbnQ6IGh0bWwuQ29tbWVudCwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHZpc2l0RWxlbWVudChlbGVtZW50OiBodG1sLkVsZW1lbnQsIHBhcmVudDogRWxlbWVudENvbnRleHQpOiBhbnkge1xuICAgIGNvbnN0IHF1ZXJ5U3RhcnRJbmRleCA9IHRoaXMuY29udGVudFF1ZXJ5U3RhcnRJZDtcbiAgICBjb25zdCBlbE5hbWUgPSBlbGVtZW50Lm5hbWU7XG4gICAgY29uc3QgcHJlcGFyc2VkRWxlbWVudCA9IHByZXBhcnNlRWxlbWVudChlbGVtZW50KTtcbiAgICBpZiAocHJlcGFyc2VkRWxlbWVudC50eXBlID09PSBQcmVwYXJzZWRFbGVtZW50VHlwZS5TQ1JJUFQgfHxcbiAgICAgICAgcHJlcGFyc2VkRWxlbWVudC50eXBlID09PSBQcmVwYXJzZWRFbGVtZW50VHlwZS5TVFlMRSkge1xuICAgICAgLy8gU2tpcHBpbmcgPHNjcmlwdD4gZm9yIHNlY3VyaXR5IHJlYXNvbnNcbiAgICAgIC8vIFNraXBwaW5nIDxzdHlsZT4gYXMgd2UgYWxyZWFkeSBwcm9jZXNzZWQgdGhlbVxuICAgICAgLy8gaW4gdGhlIFN0eWxlQ29tcGlsZXJcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBpZiAocHJlcGFyc2VkRWxlbWVudC50eXBlID09PSBQcmVwYXJzZWRFbGVtZW50VHlwZS5TVFlMRVNIRUVUICYmXG4gICAgICAgIGlzU3R5bGVVcmxSZXNvbHZhYmxlKHByZXBhcnNlZEVsZW1lbnQuaHJlZkF0dHIpKSB7XG4gICAgICAvLyBTa2lwcGluZyBzdHlsZXNoZWV0cyB3aXRoIGVpdGhlciByZWxhdGl2ZSB1cmxzIG9yIHBhY2thZ2Ugc2NoZW1lIGFzIHdlIGFscmVhZHkgcHJvY2Vzc2VkXG4gICAgICAvLyB0aGVtIGluIHRoZSBTdHlsZUNvbXBpbGVyXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBtYXRjaGFibGVBdHRyczogW3N0cmluZywgc3RyaW5nXVtdID0gW107XG4gICAgY29uc3QgZWxlbWVudE9yRGlyZWN0aXZlUHJvcHM6IFBhcnNlZFByb3BlcnR5W10gPSBbXTtcbiAgICBjb25zdCBlbGVtZW50T3JEaXJlY3RpdmVSZWZzOiBFbGVtZW50T3JEaXJlY3RpdmVSZWZbXSA9IFtdO1xuICAgIGNvbnN0IGVsZW1lbnRWYXJzOiB0LlZhcmlhYmxlQXN0W10gPSBbXTtcbiAgICBjb25zdCBldmVudHM6IHQuQm91bmRFdmVudEFzdFtdID0gW107XG5cbiAgICBjb25zdCB0ZW1wbGF0ZUVsZW1lbnRPckRpcmVjdGl2ZVByb3BzOiBQYXJzZWRQcm9wZXJ0eVtdID0gW107XG4gICAgY29uc3QgdGVtcGxhdGVNYXRjaGFibGVBdHRyczogW3N0cmluZywgc3RyaW5nXVtdID0gW107XG4gICAgY29uc3QgdGVtcGxhdGVFbGVtZW50VmFyczogdC5WYXJpYWJsZUFzdFtdID0gW107XG5cbiAgICBsZXQgaGFzSW5saW5lVGVtcGxhdGVzID0gZmFsc2U7XG4gICAgY29uc3QgYXR0cnM6IHQuQXR0ckFzdFtdID0gW107XG4gICAgY29uc3QgaXNUZW1wbGF0ZUVsZW1lbnQgPSBpc05nVGVtcGxhdGUoZWxlbWVudC5uYW1lKTtcblxuICAgIGVsZW1lbnQuYXR0cnMuZm9yRWFjaChhdHRyID0+IHtcbiAgICAgIGNvbnN0IHBhcnNlZFZhcmlhYmxlczogUGFyc2VkVmFyaWFibGVbXSA9IFtdO1xuICAgICAgY29uc3QgaGFzQmluZGluZyA9IHRoaXMuX3BhcnNlQXR0cihcbiAgICAgICAgICBpc1RlbXBsYXRlRWxlbWVudCwgYXR0ciwgbWF0Y2hhYmxlQXR0cnMsIGVsZW1lbnRPckRpcmVjdGl2ZVByb3BzLCBldmVudHMsXG4gICAgICAgICAgZWxlbWVudE9yRGlyZWN0aXZlUmVmcywgZWxlbWVudFZhcnMpO1xuICAgICAgZWxlbWVudFZhcnMucHVzaCguLi5wYXJzZWRWYXJpYWJsZXMubWFwKHYgPT4gdC5WYXJpYWJsZUFzdC5mcm9tUGFyc2VkVmFyaWFibGUodikpKTtcblxuICAgICAgbGV0IHRlbXBsYXRlVmFsdWU6IHN0cmluZ3x1bmRlZmluZWQ7XG4gICAgICBsZXQgdGVtcGxhdGVLZXk6IHN0cmluZ3x1bmRlZmluZWQ7XG4gICAgICBjb25zdCBub3JtYWxpemVkTmFtZSA9IHRoaXMuX25vcm1hbGl6ZUF0dHJpYnV0ZU5hbWUoYXR0ci5uYW1lKTtcblxuICAgICAgaWYgKG5vcm1hbGl6ZWROYW1lLnN0YXJ0c1dpdGgoVEVNUExBVEVfQVRUUl9QUkVGSVgpKSB7XG4gICAgICAgIHRlbXBsYXRlVmFsdWUgPSBhdHRyLnZhbHVlO1xuICAgICAgICB0ZW1wbGF0ZUtleSA9IG5vcm1hbGl6ZWROYW1lLnN1YnN0cmluZyhURU1QTEFURV9BVFRSX1BSRUZJWC5sZW5ndGgpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBoYXNUZW1wbGF0ZUJpbmRpbmcgPSB0ZW1wbGF0ZVZhbHVlICE9IG51bGw7XG4gICAgICBpZiAoaGFzVGVtcGxhdGVCaW5kaW5nKSB7XG4gICAgICAgIGlmIChoYXNJbmxpbmVUZW1wbGF0ZXMpIHtcbiAgICAgICAgICB0aGlzLl9yZXBvcnRFcnJvcihcbiAgICAgICAgICAgICAgYENhbid0IGhhdmUgbXVsdGlwbGUgdGVtcGxhdGUgYmluZGluZ3Mgb24gb25lIGVsZW1lbnQuIFVzZSBvbmx5IG9uZSBhdHRyaWJ1dGUgcHJlZml4ZWQgd2l0aCAqYCxcbiAgICAgICAgICAgICAgYXR0ci5zb3VyY2VTcGFuKTtcbiAgICAgICAgfVxuICAgICAgICBoYXNJbmxpbmVUZW1wbGF0ZXMgPSB0cnVlO1xuICAgICAgICBjb25zdCBwYXJzZWRWYXJpYWJsZXM6IFBhcnNlZFZhcmlhYmxlW10gPSBbXTtcbiAgICAgICAgY29uc3QgYWJzb2x1dGVPZmZzZXQgPSAoYXR0ci52YWx1ZVNwYW4gfHwgYXR0ci5zb3VyY2VTcGFuKS5zdGFydC5vZmZzZXQ7XG4gICAgICAgIHRoaXMuX2JpbmRpbmdQYXJzZXIucGFyc2VJbmxpbmVUZW1wbGF0ZUJpbmRpbmcoXG4gICAgICAgICAgICB0ZW1wbGF0ZUtleSEsIHRlbXBsYXRlVmFsdWUhLCBhdHRyLnNvdXJjZVNwYW4sIGFic29sdXRlT2Zmc2V0LCB0ZW1wbGF0ZU1hdGNoYWJsZUF0dHJzLFxuICAgICAgICAgICAgdGVtcGxhdGVFbGVtZW50T3JEaXJlY3RpdmVQcm9wcywgcGFyc2VkVmFyaWFibGVzLCBmYWxzZSAvKiBpc0l2eUFzdCAqLyk7XG4gICAgICAgIHRlbXBsYXRlRWxlbWVudFZhcnMucHVzaCguLi5wYXJzZWRWYXJpYWJsZXMubWFwKHYgPT4gdC5WYXJpYWJsZUFzdC5mcm9tUGFyc2VkVmFyaWFibGUodikpKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFoYXNCaW5kaW5nICYmICFoYXNUZW1wbGF0ZUJpbmRpbmcpIHtcbiAgICAgICAgLy8gZG9uJ3QgaW5jbHVkZSB0aGUgYmluZGluZ3MgYXMgYXR0cmlidXRlcyBhcyB3ZWxsIGluIHRoZSBBU1RcbiAgICAgICAgYXR0cnMucHVzaCh0aGlzLnZpc2l0QXR0cmlidXRlKGF0dHIsIG51bGwpKTtcbiAgICAgICAgbWF0Y2hhYmxlQXR0cnMucHVzaChbYXR0ci5uYW1lLCBhdHRyLnZhbHVlXSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBjb25zdCBlbGVtZW50Q3NzU2VsZWN0b3IgPSBjcmVhdGVFbGVtZW50Q3NzU2VsZWN0b3IoZWxOYW1lLCBtYXRjaGFibGVBdHRycyk7XG4gICAgY29uc3Qge2RpcmVjdGl2ZXM6IGRpcmVjdGl2ZU1ldGFzLCBtYXRjaEVsZW1lbnR9ID1cbiAgICAgICAgdGhpcy5fcGFyc2VEaXJlY3RpdmVzKHRoaXMuc2VsZWN0b3JNYXRjaGVyLCBlbGVtZW50Q3NzU2VsZWN0b3IpO1xuICAgIGNvbnN0IHJlZmVyZW5jZXM6IHQuUmVmZXJlbmNlQXN0W10gPSBbXTtcbiAgICBjb25zdCBib3VuZERpcmVjdGl2ZVByb3BOYW1lcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgIGNvbnN0IGRpcmVjdGl2ZUFzdHMgPSB0aGlzLl9jcmVhdGVEaXJlY3RpdmVBc3RzKFxuICAgICAgICBpc1RlbXBsYXRlRWxlbWVudCwgZWxlbWVudC5uYW1lLCBkaXJlY3RpdmVNZXRhcywgZWxlbWVudE9yRGlyZWN0aXZlUHJvcHMsXG4gICAgICAgIGVsZW1lbnRPckRpcmVjdGl2ZVJlZnMsIGVsZW1lbnQuc291cmNlU3BhbiwgcmVmZXJlbmNlcywgYm91bmREaXJlY3RpdmVQcm9wTmFtZXMpO1xuICAgIGNvbnN0IGVsZW1lbnRQcm9wczogdC5Cb3VuZEVsZW1lbnRQcm9wZXJ0eUFzdFtdID0gdGhpcy5fY3JlYXRlRWxlbWVudFByb3BlcnR5QXN0cyhcbiAgICAgICAgZWxlbWVudC5uYW1lLCBlbGVtZW50T3JEaXJlY3RpdmVQcm9wcywgYm91bmREaXJlY3RpdmVQcm9wTmFtZXMpO1xuICAgIGNvbnN0IGlzVmlld1Jvb3QgPSBwYXJlbnQuaXNUZW1wbGF0ZUVsZW1lbnQgfHwgaGFzSW5saW5lVGVtcGxhdGVzO1xuXG4gICAgY29uc3QgcHJvdmlkZXJDb250ZXh0ID0gbmV3IFByb3ZpZGVyRWxlbWVudENvbnRleHQoXG4gICAgICAgIHRoaXMucHJvdmlkZXJWaWV3Q29udGV4dCwgcGFyZW50LnByb3ZpZGVyQ29udGV4dCEsIGlzVmlld1Jvb3QsIGRpcmVjdGl2ZUFzdHMsIGF0dHJzLFxuICAgICAgICByZWZlcmVuY2VzLCBpc1RlbXBsYXRlRWxlbWVudCwgcXVlcnlTdGFydEluZGV4LCBlbGVtZW50LnNvdXJjZVNwYW4pO1xuXG4gICAgY29uc3QgY2hpbGRyZW46IHQuVGVtcGxhdGVBc3RbXSA9IGh0bWwudmlzaXRBbGwoXG4gICAgICAgIHByZXBhcnNlZEVsZW1lbnQubm9uQmluZGFibGUgPyBOT05fQklOREFCTEVfVklTSVRPUiA6IHRoaXMsIGVsZW1lbnQuY2hpbGRyZW4sXG4gICAgICAgIEVsZW1lbnRDb250ZXh0LmNyZWF0ZShcbiAgICAgICAgICAgIGlzVGVtcGxhdGVFbGVtZW50LCBkaXJlY3RpdmVBc3RzLFxuICAgICAgICAgICAgaXNUZW1wbGF0ZUVsZW1lbnQgPyBwYXJlbnQucHJvdmlkZXJDb250ZXh0ISA6IHByb3ZpZGVyQ29udGV4dCkpO1xuICAgIHByb3ZpZGVyQ29udGV4dC5hZnRlckVsZW1lbnQoKTtcbiAgICAvLyBPdmVycmlkZSB0aGUgYWN0dWFsIHNlbGVjdG9yIHdoZW4gdGhlIGBuZ1Byb2plY3RBc2AgYXR0cmlidXRlIGlzIHByb3ZpZGVkXG4gICAgY29uc3QgcHJvamVjdGlvblNlbGVjdG9yID0gcHJlcGFyc2VkRWxlbWVudC5wcm9qZWN0QXMgIT0gJycgP1xuICAgICAgICBDc3NTZWxlY3Rvci5wYXJzZShwcmVwYXJzZWRFbGVtZW50LnByb2plY3RBcylbMF0gOlxuICAgICAgICBlbGVtZW50Q3NzU2VsZWN0b3I7XG4gICAgY29uc3QgbmdDb250ZW50SW5kZXggPSBwYXJlbnQuZmluZE5nQ29udGVudEluZGV4KHByb2plY3Rpb25TZWxlY3RvcikhO1xuICAgIGxldCBwYXJzZWRFbGVtZW50OiB0LlRlbXBsYXRlQXN0O1xuXG4gICAgaWYgKHByZXBhcnNlZEVsZW1lbnQudHlwZSA9PT0gUHJlcGFyc2VkRWxlbWVudFR5cGUuTkdfQ09OVEVOVCkge1xuICAgICAgLy8gYDxuZy1jb250ZW50PmAgZWxlbWVudFxuICAgICAgaWYgKGVsZW1lbnQuY2hpbGRyZW4gJiYgIWVsZW1lbnQuY2hpbGRyZW4uZXZlcnkoX2lzRW1wdHlUZXh0Tm9kZSkpIHtcbiAgICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoYDxuZy1jb250ZW50PiBlbGVtZW50IGNhbm5vdCBoYXZlIGNvbnRlbnQuYCwgZWxlbWVudC5zb3VyY2VTcGFuKTtcbiAgICAgIH1cblxuICAgICAgcGFyc2VkRWxlbWVudCA9IG5ldyB0Lk5nQ29udGVudEFzdChcbiAgICAgICAgICB0aGlzLm5nQ29udGVudENvdW50KyssIGhhc0lubGluZVRlbXBsYXRlcyA/IG51bGwhIDogbmdDb250ZW50SW5kZXgsIGVsZW1lbnQuc291cmNlU3Bhbik7XG4gICAgfSBlbHNlIGlmIChpc1RlbXBsYXRlRWxlbWVudCkge1xuICAgICAgLy8gYDxuZy10ZW1wbGF0ZT5gIGVsZW1lbnRcbiAgICAgIHRoaXMuX2Fzc2VydEFsbEV2ZW50c1B1Ymxpc2hlZEJ5RGlyZWN0aXZlcyhkaXJlY3RpdmVBc3RzLCBldmVudHMpO1xuICAgICAgdGhpcy5fYXNzZXJ0Tm9Db21wb25lbnRzTm9yRWxlbWVudEJpbmRpbmdzT25UZW1wbGF0ZShcbiAgICAgICAgICBkaXJlY3RpdmVBc3RzLCBlbGVtZW50UHJvcHMsIGVsZW1lbnQuc291cmNlU3Bhbik7XG5cbiAgICAgIHBhcnNlZEVsZW1lbnQgPSBuZXcgdC5FbWJlZGRlZFRlbXBsYXRlQXN0KFxuICAgICAgICAgIGF0dHJzLCBldmVudHMsIHJlZmVyZW5jZXMsIGVsZW1lbnRWYXJzLCBwcm92aWRlckNvbnRleHQudHJhbnNmb3JtZWREaXJlY3RpdmVBc3RzLFxuICAgICAgICAgIHByb3ZpZGVyQ29udGV4dC50cmFuc2Zvcm1Qcm92aWRlcnMsIHByb3ZpZGVyQ29udGV4dC50cmFuc2Zvcm1lZEhhc1ZpZXdDb250YWluZXIsXG4gICAgICAgICAgcHJvdmlkZXJDb250ZXh0LnF1ZXJ5TWF0Y2hlcywgY2hpbGRyZW4sIGhhc0lubGluZVRlbXBsYXRlcyA/IG51bGwhIDogbmdDb250ZW50SW5kZXgsXG4gICAgICAgICAgZWxlbWVudC5zb3VyY2VTcGFuKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gZWxlbWVudCBvdGhlciB0aGFuIGA8bmctY29udGVudD5gIGFuZCBgPG5nLXRlbXBsYXRlPmBcbiAgICAgIHRoaXMuX2Fzc2VydEVsZW1lbnRFeGlzdHMobWF0Y2hFbGVtZW50LCBlbGVtZW50KTtcbiAgICAgIHRoaXMuX2Fzc2VydE9ubHlPbmVDb21wb25lbnQoZGlyZWN0aXZlQXN0cywgZWxlbWVudC5zb3VyY2VTcGFuKTtcblxuICAgICAgY29uc3QgbmdDb250ZW50SW5kZXggPVxuICAgICAgICAgIGhhc0lubGluZVRlbXBsYXRlcyA/IG51bGwgOiBwYXJlbnQuZmluZE5nQ29udGVudEluZGV4KHByb2plY3Rpb25TZWxlY3Rvcik7XG4gICAgICBwYXJzZWRFbGVtZW50ID0gbmV3IHQuRWxlbWVudEFzdChcbiAgICAgICAgICBlbE5hbWUsIGF0dHJzLCBlbGVtZW50UHJvcHMsIGV2ZW50cywgcmVmZXJlbmNlcywgcHJvdmlkZXJDb250ZXh0LnRyYW5zZm9ybWVkRGlyZWN0aXZlQXN0cyxcbiAgICAgICAgICBwcm92aWRlckNvbnRleHQudHJhbnNmb3JtUHJvdmlkZXJzLCBwcm92aWRlckNvbnRleHQudHJhbnNmb3JtZWRIYXNWaWV3Q29udGFpbmVyLFxuICAgICAgICAgIHByb3ZpZGVyQ29udGV4dC5xdWVyeU1hdGNoZXMsIGNoaWxkcmVuLCBoYXNJbmxpbmVUZW1wbGF0ZXMgPyBudWxsIDogbmdDb250ZW50SW5kZXgsXG4gICAgICAgICAgZWxlbWVudC5zb3VyY2VTcGFuLCBlbGVtZW50LmVuZFNvdXJjZVNwYW4gfHwgbnVsbCk7XG4gICAgfVxuXG4gICAgaWYgKGhhc0lubGluZVRlbXBsYXRlcykge1xuICAgICAgLy8gVGhlIGVsZW1lbnQgYXMgYSAqLWF0dHJpYnV0ZVxuICAgICAgY29uc3QgdGVtcGxhdGVRdWVyeVN0YXJ0SW5kZXggPSB0aGlzLmNvbnRlbnRRdWVyeVN0YXJ0SWQ7XG4gICAgICBjb25zdCB0ZW1wbGF0ZVNlbGVjdG9yID0gY3JlYXRlRWxlbWVudENzc1NlbGVjdG9yKCduZy10ZW1wbGF0ZScsIHRlbXBsYXRlTWF0Y2hhYmxlQXR0cnMpO1xuICAgICAgY29uc3Qge2RpcmVjdGl2ZXN9ID0gdGhpcy5fcGFyc2VEaXJlY3RpdmVzKHRoaXMuc2VsZWN0b3JNYXRjaGVyLCB0ZW1wbGF0ZVNlbGVjdG9yKTtcbiAgICAgIGNvbnN0IHRlbXBsYXRlQm91bmREaXJlY3RpdmVQcm9wTmFtZXMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICAgIGNvbnN0IHRlbXBsYXRlRGlyZWN0aXZlQXN0cyA9IHRoaXMuX2NyZWF0ZURpcmVjdGl2ZUFzdHMoXG4gICAgICAgICAgdHJ1ZSwgZWxOYW1lLCBkaXJlY3RpdmVzLCB0ZW1wbGF0ZUVsZW1lbnRPckRpcmVjdGl2ZVByb3BzLCBbXSwgZWxlbWVudC5zb3VyY2VTcGFuLCBbXSxcbiAgICAgICAgICB0ZW1wbGF0ZUJvdW5kRGlyZWN0aXZlUHJvcE5hbWVzKTtcbiAgICAgIGNvbnN0IHRlbXBsYXRlRWxlbWVudFByb3BzOiB0LkJvdW5kRWxlbWVudFByb3BlcnR5QXN0W10gPSB0aGlzLl9jcmVhdGVFbGVtZW50UHJvcGVydHlBc3RzKFxuICAgICAgICAgIGVsTmFtZSwgdGVtcGxhdGVFbGVtZW50T3JEaXJlY3RpdmVQcm9wcywgdGVtcGxhdGVCb3VuZERpcmVjdGl2ZVByb3BOYW1lcyk7XG4gICAgICB0aGlzLl9hc3NlcnROb0NvbXBvbmVudHNOb3JFbGVtZW50QmluZGluZ3NPblRlbXBsYXRlKFxuICAgICAgICAgIHRlbXBsYXRlRGlyZWN0aXZlQXN0cywgdGVtcGxhdGVFbGVtZW50UHJvcHMsIGVsZW1lbnQuc291cmNlU3Bhbik7XG4gICAgICBjb25zdCB0ZW1wbGF0ZVByb3ZpZGVyQ29udGV4dCA9IG5ldyBQcm92aWRlckVsZW1lbnRDb250ZXh0KFxuICAgICAgICAgIHRoaXMucHJvdmlkZXJWaWV3Q29udGV4dCwgcGFyZW50LnByb3ZpZGVyQ29udGV4dCEsIHBhcmVudC5pc1RlbXBsYXRlRWxlbWVudCxcbiAgICAgICAgICB0ZW1wbGF0ZURpcmVjdGl2ZUFzdHMsIFtdLCBbXSwgdHJ1ZSwgdGVtcGxhdGVRdWVyeVN0YXJ0SW5kZXgsIGVsZW1lbnQuc291cmNlU3Bhbik7XG4gICAgICB0ZW1wbGF0ZVByb3ZpZGVyQ29udGV4dC5hZnRlckVsZW1lbnQoKTtcblxuICAgICAgcGFyc2VkRWxlbWVudCA9IG5ldyB0LkVtYmVkZGVkVGVtcGxhdGVBc3QoXG4gICAgICAgICAgW10sIFtdLCBbXSwgdGVtcGxhdGVFbGVtZW50VmFycywgdGVtcGxhdGVQcm92aWRlckNvbnRleHQudHJhbnNmb3JtZWREaXJlY3RpdmVBc3RzLFxuICAgICAgICAgIHRlbXBsYXRlUHJvdmlkZXJDb250ZXh0LnRyYW5zZm9ybVByb3ZpZGVycyxcbiAgICAgICAgICB0ZW1wbGF0ZVByb3ZpZGVyQ29udGV4dC50cmFuc2Zvcm1lZEhhc1ZpZXdDb250YWluZXIsIHRlbXBsYXRlUHJvdmlkZXJDb250ZXh0LnF1ZXJ5TWF0Y2hlcyxcbiAgICAgICAgICBbcGFyc2VkRWxlbWVudF0sIG5nQ29udGVudEluZGV4LCBlbGVtZW50LnNvdXJjZVNwYW4pO1xuICAgIH1cblxuICAgIHJldHVybiBwYXJzZWRFbGVtZW50O1xuICB9XG5cbiAgcHJpdmF0ZSBfcGFyc2VBdHRyKFxuICAgICAgaXNUZW1wbGF0ZUVsZW1lbnQ6IGJvb2xlYW4sIGF0dHI6IGh0bWwuQXR0cmlidXRlLCB0YXJnZXRNYXRjaGFibGVBdHRyczogc3RyaW5nW11bXSxcbiAgICAgIHRhcmdldFByb3BzOiBQYXJzZWRQcm9wZXJ0eVtdLCB0YXJnZXRFdmVudHM6IHQuQm91bmRFdmVudEFzdFtdLFxuICAgICAgdGFyZ2V0UmVmczogRWxlbWVudE9yRGlyZWN0aXZlUmVmW10sIHRhcmdldFZhcnM6IHQuVmFyaWFibGVBc3RbXSk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IG5hbWUgPSB0aGlzLl9ub3JtYWxpemVBdHRyaWJ1dGVOYW1lKGF0dHIubmFtZSk7XG4gICAgY29uc3QgdmFsdWUgPSBhdHRyLnZhbHVlO1xuICAgIGNvbnN0IHNyY1NwYW4gPSBhdHRyLnNvdXJjZVNwYW47XG4gICAgY29uc3QgYWJzb2x1dGVPZmZzZXQgPSBhdHRyLnZhbHVlU3BhbiA/IGF0dHIudmFsdWVTcGFuLnN0YXJ0Lm9mZnNldCA6IHNyY1NwYW4uc3RhcnQub2Zmc2V0O1xuXG4gICAgY29uc3QgYm91bmRFdmVudHM6IFBhcnNlZEV2ZW50W10gPSBbXTtcbiAgICBjb25zdCBiaW5kUGFydHMgPSBuYW1lLm1hdGNoKEJJTkRfTkFNRV9SRUdFWFApO1xuICAgIGxldCBoYXNCaW5kaW5nID0gZmFsc2U7XG5cbiAgICBpZiAoYmluZFBhcnRzICE9PSBudWxsKSB7XG4gICAgICBoYXNCaW5kaW5nID0gdHJ1ZTtcbiAgICAgIGlmIChiaW5kUGFydHNbS1dfQklORF9JRFhdICE9IG51bGwpIHtcbiAgICAgICAgdGhpcy5fYmluZGluZ1BhcnNlci5wYXJzZVByb3BlcnR5QmluZGluZyhcbiAgICAgICAgICAgIGJpbmRQYXJ0c1tJREVOVF9LV19JRFhdLCB2YWx1ZSwgZmFsc2UsIHNyY1NwYW4sIGFic29sdXRlT2Zmc2V0LCBhdHRyLnZhbHVlU3BhbixcbiAgICAgICAgICAgIHRhcmdldE1hdGNoYWJsZUF0dHJzLCB0YXJnZXRQcm9wcyk7XG5cbiAgICAgIH0gZWxzZSBpZiAoYmluZFBhcnRzW0tXX0xFVF9JRFhdKSB7XG4gICAgICAgIGlmIChpc1RlbXBsYXRlRWxlbWVudCkge1xuICAgICAgICAgIGNvbnN0IGlkZW50aWZpZXIgPSBiaW5kUGFydHNbSURFTlRfS1dfSURYXTtcbiAgICAgICAgICB0aGlzLl9wYXJzZVZhcmlhYmxlKGlkZW50aWZpZXIsIHZhbHVlLCBzcmNTcGFuLCB0YXJnZXRWYXJzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl9yZXBvcnRFcnJvcihgXCJsZXQtXCIgaXMgb25seSBzdXBwb3J0ZWQgb24gbmctdGVtcGxhdGUgZWxlbWVudHMuYCwgc3JjU3Bhbik7XG4gICAgICAgIH1cblxuICAgICAgfSBlbHNlIGlmIChiaW5kUGFydHNbS1dfUkVGX0lEWF0pIHtcbiAgICAgICAgY29uc3QgaWRlbnRpZmllciA9IGJpbmRQYXJ0c1tJREVOVF9LV19JRFhdO1xuICAgICAgICB0aGlzLl9wYXJzZVJlZmVyZW5jZShpZGVudGlmaWVyLCB2YWx1ZSwgc3JjU3BhbiwgdGFyZ2V0UmVmcyk7XG5cbiAgICAgIH0gZWxzZSBpZiAoYmluZFBhcnRzW0tXX09OX0lEWF0pIHtcbiAgICAgICAgdGhpcy5fYmluZGluZ1BhcnNlci5wYXJzZUV2ZW50KFxuICAgICAgICAgICAgYmluZFBhcnRzW0lERU5UX0tXX0lEWF0sIHZhbHVlLCBzcmNTcGFuLCBhdHRyLnZhbHVlU3BhbiB8fCBzcmNTcGFuLFxuICAgICAgICAgICAgdGFyZ2V0TWF0Y2hhYmxlQXR0cnMsIGJvdW5kRXZlbnRzKTtcblxuICAgICAgfSBlbHNlIGlmIChiaW5kUGFydHNbS1dfQklORE9OX0lEWF0pIHtcbiAgICAgICAgdGhpcy5fYmluZGluZ1BhcnNlci5wYXJzZVByb3BlcnR5QmluZGluZyhcbiAgICAgICAgICAgIGJpbmRQYXJ0c1tJREVOVF9LV19JRFhdLCB2YWx1ZSwgZmFsc2UsIHNyY1NwYW4sIGFic29sdXRlT2Zmc2V0LCBhdHRyLnZhbHVlU3BhbixcbiAgICAgICAgICAgIHRhcmdldE1hdGNoYWJsZUF0dHJzLCB0YXJnZXRQcm9wcyk7XG4gICAgICAgIHRoaXMuX3BhcnNlQXNzaWdubWVudEV2ZW50KFxuICAgICAgICAgICAgYmluZFBhcnRzW0lERU5UX0tXX0lEWF0sIHZhbHVlLCBzcmNTcGFuLCBhdHRyLnZhbHVlU3BhbiB8fCBzcmNTcGFuLFxuICAgICAgICAgICAgdGFyZ2V0TWF0Y2hhYmxlQXR0cnMsIGJvdW5kRXZlbnRzKTtcblxuICAgICAgfSBlbHNlIGlmIChiaW5kUGFydHNbS1dfQVRfSURYXSkge1xuICAgICAgICB0aGlzLl9iaW5kaW5nUGFyc2VyLnBhcnNlTGl0ZXJhbEF0dHIoXG4gICAgICAgICAgICBuYW1lLCB2YWx1ZSwgc3JjU3BhbiwgYWJzb2x1dGVPZmZzZXQsIGF0dHIudmFsdWVTcGFuLCB0YXJnZXRNYXRjaGFibGVBdHRycyxcbiAgICAgICAgICAgIHRhcmdldFByb3BzKTtcblxuICAgICAgfSBlbHNlIGlmIChiaW5kUGFydHNbSURFTlRfQkFOQU5BX0JPWF9JRFhdKSB7XG4gICAgICAgIHRoaXMuX2JpbmRpbmdQYXJzZXIucGFyc2VQcm9wZXJ0eUJpbmRpbmcoXG4gICAgICAgICAgICBiaW5kUGFydHNbSURFTlRfQkFOQU5BX0JPWF9JRFhdLCB2YWx1ZSwgZmFsc2UsIHNyY1NwYW4sIGFic29sdXRlT2Zmc2V0LCBhdHRyLnZhbHVlU3BhbixcbiAgICAgICAgICAgIHRhcmdldE1hdGNoYWJsZUF0dHJzLCB0YXJnZXRQcm9wcyk7XG4gICAgICAgIHRoaXMuX3BhcnNlQXNzaWdubWVudEV2ZW50KFxuICAgICAgICAgICAgYmluZFBhcnRzW0lERU5UX0JBTkFOQV9CT1hfSURYXSwgdmFsdWUsIHNyY1NwYW4sIGF0dHIudmFsdWVTcGFuIHx8IHNyY1NwYW4sXG4gICAgICAgICAgICB0YXJnZXRNYXRjaGFibGVBdHRycywgYm91bmRFdmVudHMpO1xuXG4gICAgICB9IGVsc2UgaWYgKGJpbmRQYXJ0c1tJREVOVF9QUk9QRVJUWV9JRFhdKSB7XG4gICAgICAgIHRoaXMuX2JpbmRpbmdQYXJzZXIucGFyc2VQcm9wZXJ0eUJpbmRpbmcoXG4gICAgICAgICAgICBiaW5kUGFydHNbSURFTlRfUFJPUEVSVFlfSURYXSwgdmFsdWUsIGZhbHNlLCBzcmNTcGFuLCBhYnNvbHV0ZU9mZnNldCwgYXR0ci52YWx1ZVNwYW4sXG4gICAgICAgICAgICB0YXJnZXRNYXRjaGFibGVBdHRycywgdGFyZ2V0UHJvcHMpO1xuXG4gICAgICB9IGVsc2UgaWYgKGJpbmRQYXJ0c1tJREVOVF9FVkVOVF9JRFhdKSB7XG4gICAgICAgIHRoaXMuX2JpbmRpbmdQYXJzZXIucGFyc2VFdmVudChcbiAgICAgICAgICAgIGJpbmRQYXJ0c1tJREVOVF9FVkVOVF9JRFhdLCB2YWx1ZSwgc3JjU3BhbiwgYXR0ci52YWx1ZVNwYW4gfHwgc3JjU3BhbixcbiAgICAgICAgICAgIHRhcmdldE1hdGNoYWJsZUF0dHJzLCBib3VuZEV2ZW50cyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGhhc0JpbmRpbmcgPSB0aGlzLl9iaW5kaW5nUGFyc2VyLnBhcnNlUHJvcGVydHlJbnRlcnBvbGF0aW9uKFxuICAgICAgICAgIG5hbWUsIHZhbHVlLCBzcmNTcGFuLCBhdHRyLnZhbHVlU3BhbiwgdGFyZ2V0TWF0Y2hhYmxlQXR0cnMsIHRhcmdldFByb3BzKTtcbiAgICB9XG5cbiAgICBpZiAoIWhhc0JpbmRpbmcpIHtcbiAgICAgIHRoaXMuX2JpbmRpbmdQYXJzZXIucGFyc2VMaXRlcmFsQXR0cihcbiAgICAgICAgICBuYW1lLCB2YWx1ZSwgc3JjU3BhbiwgYWJzb2x1dGVPZmZzZXQsIGF0dHIudmFsdWVTcGFuLCB0YXJnZXRNYXRjaGFibGVBdHRycywgdGFyZ2V0UHJvcHMpO1xuICAgIH1cblxuICAgIHRhcmdldEV2ZW50cy5wdXNoKC4uLmJvdW5kRXZlbnRzLm1hcChlID0+IHQuQm91bmRFdmVudEFzdC5mcm9tUGFyc2VkRXZlbnQoZSkpKTtcblxuICAgIHJldHVybiBoYXNCaW5kaW5nO1xuICB9XG5cbiAgcHJpdmF0ZSBfbm9ybWFsaXplQXR0cmlidXRlTmFtZShhdHRyTmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gL15kYXRhLS9pLnRlc3QoYXR0ck5hbWUpID8gYXR0ck5hbWUuc3Vic3RyaW5nKDUpIDogYXR0ck5hbWU7XG4gIH1cblxuICBwcml2YXRlIF9wYXJzZVZhcmlhYmxlKFxuICAgICAgaWRlbnRpZmllcjogc3RyaW5nLCB2YWx1ZTogc3RyaW5nLCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sIHRhcmdldFZhcnM6IHQuVmFyaWFibGVBc3RbXSkge1xuICAgIGlmIChpZGVudGlmaWVyLmluZGV4T2YoJy0nKSA+IC0xKSB7XG4gICAgICB0aGlzLl9yZXBvcnRFcnJvcihgXCItXCIgaXMgbm90IGFsbG93ZWQgaW4gdmFyaWFibGUgbmFtZXNgLCBzb3VyY2VTcGFuKTtcbiAgICB9IGVsc2UgaWYgKGlkZW50aWZpZXIubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aGlzLl9yZXBvcnRFcnJvcihgVmFyaWFibGUgZG9lcyBub3QgaGF2ZSBhIG5hbWVgLCBzb3VyY2VTcGFuKTtcbiAgICB9XG5cbiAgICB0YXJnZXRWYXJzLnB1c2gobmV3IHQuVmFyaWFibGVBc3QoaWRlbnRpZmllciwgdmFsdWUsIHNvdXJjZVNwYW4pKTtcbiAgfVxuXG4gIHByaXZhdGUgX3BhcnNlUmVmZXJlbmNlKFxuICAgICAgaWRlbnRpZmllcjogc3RyaW5nLCB2YWx1ZTogc3RyaW5nLCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgICB0YXJnZXRSZWZzOiBFbGVtZW50T3JEaXJlY3RpdmVSZWZbXSkge1xuICAgIGlmIChpZGVudGlmaWVyLmluZGV4T2YoJy0nKSA+IC0xKSB7XG4gICAgICB0aGlzLl9yZXBvcnRFcnJvcihgXCItXCIgaXMgbm90IGFsbG93ZWQgaW4gcmVmZXJlbmNlIG5hbWVzYCwgc291cmNlU3Bhbik7XG4gICAgfSBlbHNlIGlmIChpZGVudGlmaWVyLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoYFJlZmVyZW5jZSBkb2VzIG5vdCBoYXZlIGEgbmFtZWAsIHNvdXJjZVNwYW4pO1xuICAgIH1cblxuICAgIHRhcmdldFJlZnMucHVzaChuZXcgRWxlbWVudE9yRGlyZWN0aXZlUmVmKGlkZW50aWZpZXIsIHZhbHVlLCBzb3VyY2VTcGFuKSk7XG4gIH1cblxuICBwcml2YXRlIF9wYXJzZUFzc2lnbm1lbnRFdmVudChcbiAgICAgIG5hbWU6IHN0cmluZywgZXhwcmVzc2lvbjogc3RyaW5nLCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sIHZhbHVlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgICAgdGFyZ2V0TWF0Y2hhYmxlQXR0cnM6IHN0cmluZ1tdW10sIHRhcmdldEV2ZW50czogUGFyc2VkRXZlbnRbXSkge1xuICAgIHRoaXMuX2JpbmRpbmdQYXJzZXIucGFyc2VFdmVudChcbiAgICAgICAgYCR7bmFtZX1DaGFuZ2VgLCBgJHtleHByZXNzaW9ufT0kZXZlbnRgLCBzb3VyY2VTcGFuLCB2YWx1ZVNwYW4sIHRhcmdldE1hdGNoYWJsZUF0dHJzLFxuICAgICAgICB0YXJnZXRFdmVudHMpO1xuICB9XG5cbiAgcHJpdmF0ZSBfcGFyc2VEaXJlY3RpdmVzKHNlbGVjdG9yTWF0Y2hlcjogU2VsZWN0b3JNYXRjaGVyLCBlbGVtZW50Q3NzU2VsZWN0b3I6IENzc1NlbGVjdG9yKTpcbiAgICAgIHtkaXJlY3RpdmVzOiBDb21waWxlRGlyZWN0aXZlU3VtbWFyeVtdLCBtYXRjaEVsZW1lbnQ6IGJvb2xlYW59IHtcbiAgICAvLyBOZWVkIHRvIHNvcnQgdGhlIGRpcmVjdGl2ZXMgc28gdGhhdCB3ZSBnZXQgY29uc2lzdGVudCByZXN1bHRzIHRocm91Z2hvdXQsXG4gICAgLy8gYXMgc2VsZWN0b3JNYXRjaGVyIHVzZXMgTWFwcyBpbnNpZGUuXG4gICAgLy8gQWxzbyBkZWR1cGxpY2F0ZSBkaXJlY3RpdmVzIGFzIHRoZXkgbWlnaHQgbWF0Y2ggbW9yZSB0aGFuIG9uZSB0aW1lIVxuICAgIGNvbnN0IGRpcmVjdGl2ZXMgPSBuZXdBcnJheSh0aGlzLmRpcmVjdGl2ZXNJbmRleC5zaXplKTtcbiAgICAvLyBXaGV0aGVyIGFueSBkaXJlY3RpdmUgc2VsZWN0b3IgbWF0Y2hlcyBvbiB0aGUgZWxlbWVudCBuYW1lXG4gICAgbGV0IG1hdGNoRWxlbWVudCA9IGZhbHNlO1xuXG4gICAgc2VsZWN0b3JNYXRjaGVyLm1hdGNoKGVsZW1lbnRDc3NTZWxlY3RvciwgKHNlbGVjdG9yLCBkaXJlY3RpdmUpID0+IHtcbiAgICAgIGRpcmVjdGl2ZXNbdGhpcy5kaXJlY3RpdmVzSW5kZXguZ2V0KGRpcmVjdGl2ZSkhXSA9IGRpcmVjdGl2ZTtcbiAgICAgIG1hdGNoRWxlbWVudCA9IG1hdGNoRWxlbWVudCB8fCBzZWxlY3Rvci5oYXNFbGVtZW50U2VsZWN0b3IoKTtcbiAgICB9KTtcblxuICAgIHJldHVybiB7XG4gICAgICBkaXJlY3RpdmVzOiBkaXJlY3RpdmVzLmZpbHRlcihkaXIgPT4gISFkaXIpLFxuICAgICAgbWF0Y2hFbGVtZW50LFxuICAgIH07XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVEaXJlY3RpdmVBc3RzKFxuICAgICAgaXNUZW1wbGF0ZUVsZW1lbnQ6IGJvb2xlYW4sIGVsZW1lbnROYW1lOiBzdHJpbmcsIGRpcmVjdGl2ZXM6IENvbXBpbGVEaXJlY3RpdmVTdW1tYXJ5W10sXG4gICAgICBwcm9wczogUGFyc2VkUHJvcGVydHlbXSwgZWxlbWVudE9yRGlyZWN0aXZlUmVmczogRWxlbWVudE9yRGlyZWN0aXZlUmVmW10sXG4gICAgICBlbGVtZW50U291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLCB0YXJnZXRSZWZlcmVuY2VzOiB0LlJlZmVyZW5jZUFzdFtdLFxuICAgICAgdGFyZ2V0Qm91bmREaXJlY3RpdmVQcm9wTmFtZXM6IFNldDxzdHJpbmc+KTogdC5EaXJlY3RpdmVBc3RbXSB7XG4gICAgY29uc3QgbWF0Y2hlZFJlZmVyZW5jZXMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICBsZXQgY29tcG9uZW50OiBDb21waWxlRGlyZWN0aXZlU3VtbWFyeSA9IG51bGwhO1xuXG4gICAgY29uc3QgZGlyZWN0aXZlQXN0cyA9IGRpcmVjdGl2ZXMubWFwKChkaXJlY3RpdmUpID0+IHtcbiAgICAgIGNvbnN0IHNvdXJjZVNwYW4gPSBuZXcgUGFyc2VTb3VyY2VTcGFuKFxuICAgICAgICAgIGVsZW1lbnRTb3VyY2VTcGFuLnN0YXJ0LCBlbGVtZW50U291cmNlU3Bhbi5lbmQsIGVsZW1lbnRTb3VyY2VTcGFuLmZ1bGxTdGFydCxcbiAgICAgICAgICBgRGlyZWN0aXZlICR7aWRlbnRpZmllck5hbWUoZGlyZWN0aXZlLnR5cGUpfWApO1xuXG4gICAgICBpZiAoZGlyZWN0aXZlLmlzQ29tcG9uZW50KSB7XG4gICAgICAgIGNvbXBvbmVudCA9IGRpcmVjdGl2ZTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGRpcmVjdGl2ZVByb3BlcnRpZXM6IHQuQm91bmREaXJlY3RpdmVQcm9wZXJ0eUFzdFtdID0gW107XG4gICAgICBjb25zdCBib3VuZFByb3BlcnRpZXMgPVxuICAgICAgICAgIHRoaXMuX2JpbmRpbmdQYXJzZXIuY3JlYXRlRGlyZWN0aXZlSG9zdFByb3BlcnR5QXN0cyhkaXJlY3RpdmUsIGVsZW1lbnROYW1lLCBzb3VyY2VTcGFuKSE7XG5cbiAgICAgIGxldCBob3N0UHJvcGVydGllcyA9XG4gICAgICAgICAgYm91bmRQcm9wZXJ0aWVzLm1hcChwcm9wID0+IHQuQm91bmRFbGVtZW50UHJvcGVydHlBc3QuZnJvbUJvdW5kUHJvcGVydHkocHJvcCkpO1xuICAgICAgLy8gTm90ZTogV2UgbmVlZCB0byBjaGVjayB0aGUgaG9zdCBwcm9wZXJ0aWVzIGhlcmUgYXMgd2VsbCxcbiAgICAgIC8vIGFzIHdlIGRvbid0IGtub3cgdGhlIGVsZW1lbnQgbmFtZSBpbiB0aGUgRGlyZWN0aXZlV3JhcHBlckNvbXBpbGVyIHlldC5cbiAgICAgIGhvc3RQcm9wZXJ0aWVzID0gdGhpcy5fY2hlY2tQcm9wZXJ0aWVzSW5TY2hlbWEoZWxlbWVudE5hbWUsIGhvc3RQcm9wZXJ0aWVzKTtcbiAgICAgIGNvbnN0IHBhcnNlZEV2ZW50cyA9IHRoaXMuX2JpbmRpbmdQYXJzZXIuY3JlYXRlRGlyZWN0aXZlSG9zdEV2ZW50QXN0cyhkaXJlY3RpdmUsIHNvdXJjZVNwYW4pITtcbiAgICAgIHRoaXMuX2NyZWF0ZURpcmVjdGl2ZVByb3BlcnR5QXN0cyhcbiAgICAgICAgICBkaXJlY3RpdmUuaW5wdXRzLCBwcm9wcywgZGlyZWN0aXZlUHJvcGVydGllcywgdGFyZ2V0Qm91bmREaXJlY3RpdmVQcm9wTmFtZXMpO1xuICAgICAgZWxlbWVudE9yRGlyZWN0aXZlUmVmcy5mb3JFYWNoKChlbE9yRGlyUmVmKSA9PiB7XG4gICAgICAgIGlmICgoZWxPckRpclJlZi52YWx1ZS5sZW5ndGggPT09IDAgJiYgZGlyZWN0aXZlLmlzQ29tcG9uZW50KSB8fFxuICAgICAgICAgICAgKGVsT3JEaXJSZWYuaXNSZWZlcmVuY2VUb0RpcmVjdGl2ZShkaXJlY3RpdmUpKSkge1xuICAgICAgICAgIHRhcmdldFJlZmVyZW5jZXMucHVzaChuZXcgdC5SZWZlcmVuY2VBc3QoXG4gICAgICAgICAgICAgIGVsT3JEaXJSZWYubmFtZSwgY3JlYXRlVG9rZW5Gb3JSZWZlcmVuY2UoZGlyZWN0aXZlLnR5cGUucmVmZXJlbmNlKSwgZWxPckRpclJlZi52YWx1ZSxcbiAgICAgICAgICAgICAgZWxPckRpclJlZi5zb3VyY2VTcGFuKSk7XG4gICAgICAgICAgbWF0Y2hlZFJlZmVyZW5jZXMuYWRkKGVsT3JEaXJSZWYubmFtZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgY29uc3QgaG9zdEV2ZW50cyA9IHBhcnNlZEV2ZW50cy5tYXAoZSA9PiB0LkJvdW5kRXZlbnRBc3QuZnJvbVBhcnNlZEV2ZW50KGUpKTtcbiAgICAgIGNvbnN0IGNvbnRlbnRRdWVyeVN0YXJ0SWQgPSB0aGlzLmNvbnRlbnRRdWVyeVN0YXJ0SWQ7XG4gICAgICB0aGlzLmNvbnRlbnRRdWVyeVN0YXJ0SWQgKz0gZGlyZWN0aXZlLnF1ZXJpZXMubGVuZ3RoO1xuICAgICAgcmV0dXJuIG5ldyB0LkRpcmVjdGl2ZUFzdChcbiAgICAgICAgICBkaXJlY3RpdmUsIGRpcmVjdGl2ZVByb3BlcnRpZXMsIGhvc3RQcm9wZXJ0aWVzLCBob3N0RXZlbnRzLCBjb250ZW50UXVlcnlTdGFydElkLFxuICAgICAgICAgIHNvdXJjZVNwYW4pO1xuICAgIH0pO1xuXG4gICAgZWxlbWVudE9yRGlyZWN0aXZlUmVmcy5mb3JFYWNoKChlbE9yRGlyUmVmKSA9PiB7XG4gICAgICBpZiAoZWxPckRpclJlZi52YWx1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgIGlmICghbWF0Y2hlZFJlZmVyZW5jZXMuaGFzKGVsT3JEaXJSZWYubmFtZSkpIHtcbiAgICAgICAgICB0aGlzLl9yZXBvcnRFcnJvcihcbiAgICAgICAgICAgICAgYFRoZXJlIGlzIG5vIGRpcmVjdGl2ZSB3aXRoIFwiZXhwb3J0QXNcIiBzZXQgdG8gXCIke2VsT3JEaXJSZWYudmFsdWV9XCJgLFxuICAgICAgICAgICAgICBlbE9yRGlyUmVmLnNvdXJjZVNwYW4pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKCFjb21wb25lbnQpIHtcbiAgICAgICAgbGV0IHJlZlRva2VuOiBDb21waWxlVG9rZW5NZXRhZGF0YSA9IG51bGwhO1xuICAgICAgICBpZiAoaXNUZW1wbGF0ZUVsZW1lbnQpIHtcbiAgICAgICAgICByZWZUb2tlbiA9IGNyZWF0ZVRva2VuRm9yRXh0ZXJuYWxSZWZlcmVuY2UodGhpcy5yZWZsZWN0b3IsIElkZW50aWZpZXJzLlRlbXBsYXRlUmVmKTtcbiAgICAgICAgfVxuICAgICAgICB0YXJnZXRSZWZlcmVuY2VzLnB1c2goXG4gICAgICAgICAgICBuZXcgdC5SZWZlcmVuY2VBc3QoZWxPckRpclJlZi5uYW1lLCByZWZUb2tlbiwgZWxPckRpclJlZi52YWx1ZSwgZWxPckRpclJlZi5zb3VyY2VTcGFuKSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGRpcmVjdGl2ZUFzdHM7XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVEaXJlY3RpdmVQcm9wZXJ0eUFzdHMoXG4gICAgICBkaXJlY3RpdmVQcm9wZXJ0aWVzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSwgYm91bmRQcm9wczogUGFyc2VkUHJvcGVydHlbXSxcbiAgICAgIHRhcmdldEJvdW5kRGlyZWN0aXZlUHJvcHM6IHQuQm91bmREaXJlY3RpdmVQcm9wZXJ0eUFzdFtdLFxuICAgICAgdGFyZ2V0Qm91bmREaXJlY3RpdmVQcm9wTmFtZXM6IFNldDxzdHJpbmc+KSB7XG4gICAgaWYgKGRpcmVjdGl2ZVByb3BlcnRpZXMpIHtcbiAgICAgIGNvbnN0IGJvdW5kUHJvcHNCeU5hbWUgPSBuZXcgTWFwPHN0cmluZywgUGFyc2VkUHJvcGVydHk+KCk7XG4gICAgICBib3VuZFByb3BzLmZvckVhY2goYm91bmRQcm9wID0+IHtcbiAgICAgICAgY29uc3QgcHJldlZhbHVlID0gYm91bmRQcm9wc0J5TmFtZS5nZXQoYm91bmRQcm9wLm5hbWUpO1xuICAgICAgICBpZiAoIXByZXZWYWx1ZSB8fCBwcmV2VmFsdWUuaXNMaXRlcmFsKSB7XG4gICAgICAgICAgLy8gZ2l2ZSBbYV09XCJiXCIgYSBoaWdoZXIgcHJlY2VkZW5jZSB0aGFuIGE9XCJiXCIgb24gdGhlIHNhbWUgZWxlbWVudFxuICAgICAgICAgIGJvdW5kUHJvcHNCeU5hbWUuc2V0KGJvdW5kUHJvcC5uYW1lLCBib3VuZFByb3ApO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgT2JqZWN0LmtleXMoZGlyZWN0aXZlUHJvcGVydGllcykuZm9yRWFjaChkaXJQcm9wID0+IHtcbiAgICAgICAgY29uc3QgZWxQcm9wID0gZGlyZWN0aXZlUHJvcGVydGllc1tkaXJQcm9wXTtcbiAgICAgICAgY29uc3QgYm91bmRQcm9wID0gYm91bmRQcm9wc0J5TmFtZS5nZXQoZWxQcm9wKTtcblxuICAgICAgICAvLyBCaW5kaW5ncyBhcmUgb3B0aW9uYWwsIHNvIHRoaXMgYmluZGluZyBvbmx5IG5lZWRzIHRvIGJlIHNldCB1cCBpZiBhbiBleHByZXNzaW9uIGlzIGdpdmVuLlxuICAgICAgICBpZiAoYm91bmRQcm9wKSB7XG4gICAgICAgICAgdGFyZ2V0Qm91bmREaXJlY3RpdmVQcm9wTmFtZXMuYWRkKGJvdW5kUHJvcC5uYW1lKTtcbiAgICAgICAgICBpZiAoIWlzRW1wdHlFeHByZXNzaW9uKGJvdW5kUHJvcC5leHByZXNzaW9uKSkge1xuICAgICAgICAgICAgdGFyZ2V0Qm91bmREaXJlY3RpdmVQcm9wcy5wdXNoKG5ldyB0LkJvdW5kRGlyZWN0aXZlUHJvcGVydHlBc3QoXG4gICAgICAgICAgICAgICAgZGlyUHJvcCwgYm91bmRQcm9wLm5hbWUsIGJvdW5kUHJvcC5leHByZXNzaW9uLCBib3VuZFByb3Auc291cmNlU3BhbikpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfY3JlYXRlRWxlbWVudFByb3BlcnR5QXN0cyhcbiAgICAgIGVsZW1lbnROYW1lOiBzdHJpbmcsIHByb3BzOiBQYXJzZWRQcm9wZXJ0eVtdLFxuICAgICAgYm91bmREaXJlY3RpdmVQcm9wTmFtZXM6IFNldDxzdHJpbmc+KTogdC5Cb3VuZEVsZW1lbnRQcm9wZXJ0eUFzdFtdIHtcbiAgICBjb25zdCBib3VuZEVsZW1lbnRQcm9wczogdC5Cb3VuZEVsZW1lbnRQcm9wZXJ0eUFzdFtdID0gW107XG5cbiAgICBwcm9wcy5mb3JFYWNoKChwcm9wOiBQYXJzZWRQcm9wZXJ0eSkgPT4ge1xuICAgICAgaWYgKCFwcm9wLmlzTGl0ZXJhbCAmJiAhYm91bmREaXJlY3RpdmVQcm9wTmFtZXMuaGFzKHByb3AubmFtZSkpIHtcbiAgICAgICAgY29uc3QgYm91bmRQcm9wID0gdGhpcy5fYmluZGluZ1BhcnNlci5jcmVhdGVCb3VuZEVsZW1lbnRQcm9wZXJ0eShlbGVtZW50TmFtZSwgcHJvcCk7XG4gICAgICAgIGJvdW5kRWxlbWVudFByb3BzLnB1c2godC5Cb3VuZEVsZW1lbnRQcm9wZXJ0eUFzdC5mcm9tQm91bmRQcm9wZXJ0eShib3VuZFByb3ApKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcy5fY2hlY2tQcm9wZXJ0aWVzSW5TY2hlbWEoZWxlbWVudE5hbWUsIGJvdW5kRWxlbWVudFByb3BzKTtcbiAgfVxuXG4gIHByaXZhdGUgX2ZpbmRDb21wb25lbnREaXJlY3RpdmVzKGRpcmVjdGl2ZXM6IHQuRGlyZWN0aXZlQXN0W10pOiB0LkRpcmVjdGl2ZUFzdFtdIHtcbiAgICByZXR1cm4gZGlyZWN0aXZlcy5maWx0ZXIoZGlyZWN0aXZlID0+IGRpcmVjdGl2ZS5kaXJlY3RpdmUuaXNDb21wb25lbnQpO1xuICB9XG5cbiAgcHJpdmF0ZSBfZmluZENvbXBvbmVudERpcmVjdGl2ZU5hbWVzKGRpcmVjdGl2ZXM6IHQuRGlyZWN0aXZlQXN0W10pOiBzdHJpbmdbXSB7XG4gICAgcmV0dXJuIHRoaXMuX2ZpbmRDb21wb25lbnREaXJlY3RpdmVzKGRpcmVjdGl2ZXMpXG4gICAgICAgIC5tYXAoZGlyZWN0aXZlID0+IGlkZW50aWZpZXJOYW1lKGRpcmVjdGl2ZS5kaXJlY3RpdmUudHlwZSkhKTtcbiAgfVxuXG4gIHByaXZhdGUgX2Fzc2VydE9ubHlPbmVDb21wb25lbnQoZGlyZWN0aXZlczogdC5EaXJlY3RpdmVBc3RbXSwgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuKSB7XG4gICAgY29uc3QgY29tcG9uZW50VHlwZU5hbWVzID0gdGhpcy5fZmluZENvbXBvbmVudERpcmVjdGl2ZU5hbWVzKGRpcmVjdGl2ZXMpO1xuICAgIGlmIChjb21wb25lbnRUeXBlTmFtZXMubGVuZ3RoID4gMSkge1xuICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoXG4gICAgICAgICAgYE1vcmUgdGhhbiBvbmUgY29tcG9uZW50IG1hdGNoZWQgb24gdGhpcyBlbGVtZW50LlxcbmAgK1xuICAgICAgICAgICAgICBgTWFrZSBzdXJlIHRoYXQgb25seSBvbmUgY29tcG9uZW50J3Mgc2VsZWN0b3IgY2FuIG1hdGNoIGEgZ2l2ZW4gZWxlbWVudC5cXG5gICtcbiAgICAgICAgICAgICAgYENvbmZsaWN0aW5nIGNvbXBvbmVudHM6ICR7Y29tcG9uZW50VHlwZU5hbWVzLmpvaW4oJywnKX1gLFxuICAgICAgICAgIHNvdXJjZVNwYW4pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBNYWtlIHN1cmUgdGhhdCBub24tYW5ndWxhciB0YWdzIGNvbmZvcm0gdG8gdGhlIHNjaGVtYXMuXG4gICAqXG4gICAqIE5vdGU6IEFuIGVsZW1lbnQgaXMgY29uc2lkZXJlZCBhbiBhbmd1bGFyIHRhZyB3aGVuIGF0IGxlYXN0IG9uZSBkaXJlY3RpdmUgc2VsZWN0b3IgbWF0Y2hlcyB0aGVcbiAgICogdGFnIG5hbWUuXG4gICAqXG4gICAqIEBwYXJhbSBtYXRjaEVsZW1lbnQgV2hldGhlciBhbnkgZGlyZWN0aXZlIGhhcyBtYXRjaGVkIG9uIHRoZSB0YWcgbmFtZVxuICAgKiBAcGFyYW0gZWxlbWVudCB0aGUgaHRtbCBlbGVtZW50XG4gICAqL1xuICBwcml2YXRlIF9hc3NlcnRFbGVtZW50RXhpc3RzKG1hdGNoRWxlbWVudDogYm9vbGVhbiwgZWxlbWVudDogaHRtbC5FbGVtZW50KSB7XG4gICAgY29uc3QgZWxOYW1lID0gZWxlbWVudC5uYW1lLnJlcGxhY2UoL146eGh0bWw6LywgJycpO1xuXG4gICAgaWYgKCFtYXRjaEVsZW1lbnQgJiYgIXRoaXMuX3NjaGVtYVJlZ2lzdHJ5Lmhhc0VsZW1lbnQoZWxOYW1lLCB0aGlzLl9zY2hlbWFzKSkge1xuICAgICAgbGV0IGVycm9yTXNnID0gYCcke2VsTmFtZX0nIGlzIG5vdCBhIGtub3duIGVsZW1lbnQ6XFxuYDtcbiAgICAgIGVycm9yTXNnICs9IGAxLiBJZiAnJHtcbiAgICAgICAgICBlbE5hbWV9JyBpcyBhbiBBbmd1bGFyIGNvbXBvbmVudCwgdGhlbiB2ZXJpZnkgdGhhdCBpdCBpcyBwYXJ0IG9mIHRoaXMgbW9kdWxlLlxcbmA7XG4gICAgICBpZiAoZWxOYW1lLmluZGV4T2YoJy0nKSA+IC0xKSB7XG4gICAgICAgIGVycm9yTXNnICs9IGAyLiBJZiAnJHtcbiAgICAgICAgICAgIGVsTmFtZX0nIGlzIGEgV2ViIENvbXBvbmVudCB0aGVuIGFkZCAnQ1VTVE9NX0VMRU1FTlRTX1NDSEVNQScgdG8gdGhlICdATmdNb2R1bGUuc2NoZW1hcycgb2YgdGhpcyBjb21wb25lbnQgdG8gc3VwcHJlc3MgdGhpcyBtZXNzYWdlLmA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlcnJvck1zZyArPVxuICAgICAgICAgICAgYDIuIFRvIGFsbG93IGFueSBlbGVtZW50IGFkZCAnTk9fRVJST1JTX1NDSEVNQScgdG8gdGhlICdATmdNb2R1bGUuc2NoZW1hcycgb2YgdGhpcyBjb21wb25lbnQuYDtcbiAgICAgIH1cbiAgICAgIHRoaXMuX3JlcG9ydEVycm9yKGVycm9yTXNnLCBlbGVtZW50LnNvdXJjZVNwYW4pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2Fzc2VydE5vQ29tcG9uZW50c05vckVsZW1lbnRCaW5kaW5nc09uVGVtcGxhdGUoXG4gICAgICBkaXJlY3RpdmVzOiB0LkRpcmVjdGl2ZUFzdFtdLCBlbGVtZW50UHJvcHM6IHQuQm91bmRFbGVtZW50UHJvcGVydHlBc3RbXSxcbiAgICAgIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3Bhbikge1xuICAgIGNvbnN0IGNvbXBvbmVudFR5cGVOYW1lczogc3RyaW5nW10gPSB0aGlzLl9maW5kQ29tcG9uZW50RGlyZWN0aXZlTmFtZXMoZGlyZWN0aXZlcyk7XG4gICAgaWYgKGNvbXBvbmVudFR5cGVOYW1lcy5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLl9yZXBvcnRFcnJvcihcbiAgICAgICAgICBgQ29tcG9uZW50cyBvbiBhbiBlbWJlZGRlZCB0ZW1wbGF0ZTogJHtjb21wb25lbnRUeXBlTmFtZXMuam9pbignLCcpfWAsIHNvdXJjZVNwYW4pO1xuICAgIH1cbiAgICBlbGVtZW50UHJvcHMuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgIHRoaXMuX3JlcG9ydEVycm9yKFxuICAgICAgICAgIGBQcm9wZXJ0eSBiaW5kaW5nICR7XG4gICAgICAgICAgICAgIHByb3AubmFtZX0gbm90IHVzZWQgYnkgYW55IGRpcmVjdGl2ZSBvbiBhbiBlbWJlZGRlZCB0ZW1wbGF0ZS4gTWFrZSBzdXJlIHRoYXQgdGhlIHByb3BlcnR5IG5hbWUgaXMgc3BlbGxlZCBjb3JyZWN0bHkgYW5kIGFsbCBkaXJlY3RpdmVzIGFyZSBsaXN0ZWQgaW4gdGhlIFwiQE5nTW9kdWxlLmRlY2xhcmF0aW9uc1wiLmAsXG4gICAgICAgICAgc291cmNlU3Bhbik7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9hc3NlcnRBbGxFdmVudHNQdWJsaXNoZWRCeURpcmVjdGl2ZXMoXG4gICAgICBkaXJlY3RpdmVzOiB0LkRpcmVjdGl2ZUFzdFtdLCBldmVudHM6IHQuQm91bmRFdmVudEFzdFtdKSB7XG4gICAgY29uc3QgYWxsRGlyZWN0aXZlRXZlbnRzID0gbmV3IFNldDxzdHJpbmc+KCk7XG5cbiAgICBkaXJlY3RpdmVzLmZvckVhY2goZGlyZWN0aXZlID0+IHtcbiAgICAgIE9iamVjdC5rZXlzKGRpcmVjdGl2ZS5kaXJlY3RpdmUub3V0cHV0cykuZm9yRWFjaChrID0+IHtcbiAgICAgICAgY29uc3QgZXZlbnROYW1lID0gZGlyZWN0aXZlLmRpcmVjdGl2ZS5vdXRwdXRzW2tdO1xuICAgICAgICBhbGxEaXJlY3RpdmVFdmVudHMuYWRkKGV2ZW50TmFtZSk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIGV2ZW50cy5mb3JFYWNoKGV2ZW50ID0+IHtcbiAgICAgIGlmIChldmVudC50YXJnZXQgIT0gbnVsbCB8fCAhYWxsRGlyZWN0aXZlRXZlbnRzLmhhcyhldmVudC5uYW1lKSkge1xuICAgICAgICB0aGlzLl9yZXBvcnRFcnJvcihcbiAgICAgICAgICAgIGBFdmVudCBiaW5kaW5nICR7XG4gICAgICAgICAgICAgICAgZXZlbnRcbiAgICAgICAgICAgICAgICAgICAgLmZ1bGxOYW1lfSBub3QgZW1pdHRlZCBieSBhbnkgZGlyZWN0aXZlIG9uIGFuIGVtYmVkZGVkIHRlbXBsYXRlLiBNYWtlIHN1cmUgdGhhdCB0aGUgZXZlbnQgbmFtZSBpcyBzcGVsbGVkIGNvcnJlY3RseSBhbmQgYWxsIGRpcmVjdGl2ZXMgYXJlIGxpc3RlZCBpbiB0aGUgXCJATmdNb2R1bGUuZGVjbGFyYXRpb25zXCIuYCxcbiAgICAgICAgICAgIGV2ZW50LnNvdXJjZVNwYW4pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfY2hlY2tQcm9wZXJ0aWVzSW5TY2hlbWEoZWxlbWVudE5hbWU6IHN0cmluZywgYm91bmRQcm9wczogdC5Cb3VuZEVsZW1lbnRQcm9wZXJ0eUFzdFtdKTpcbiAgICAgIHQuQm91bmRFbGVtZW50UHJvcGVydHlBc3RbXSB7XG4gICAgLy8gTm90ZTogV2UgY2FuJ3QgZmlsdGVyIG91dCBlbXB0eSBleHByZXNzaW9ucyBiZWZvcmUgdGhpcyBtZXRob2QsXG4gICAgLy8gYXMgd2Ugc3RpbGwgd2FudCB0byB2YWxpZGF0ZSB0aGVtIVxuICAgIHJldHVybiBib3VuZFByb3BzLmZpbHRlcigoYm91bmRQcm9wKSA9PiB7XG4gICAgICBpZiAoYm91bmRQcm9wLnR5cGUgPT09IHQuUHJvcGVydHlCaW5kaW5nVHlwZS5Qcm9wZXJ0eSAmJlxuICAgICAgICAgICF0aGlzLl9zY2hlbWFSZWdpc3RyeS5oYXNQcm9wZXJ0eShlbGVtZW50TmFtZSwgYm91bmRQcm9wLm5hbWUsIHRoaXMuX3NjaGVtYXMpKSB7XG4gICAgICAgIGxldCBlcnJvck1zZyA9IGBDYW4ndCBiaW5kIHRvICcke2JvdW5kUHJvcC5uYW1lfScgc2luY2UgaXQgaXNuJ3QgYSBrbm93biBwcm9wZXJ0eSBvZiAnJHtcbiAgICAgICAgICAgIGVsZW1lbnROYW1lfScuYDtcbiAgICAgICAgaWYgKGVsZW1lbnROYW1lLnN0YXJ0c1dpdGgoJ25nLScpKSB7XG4gICAgICAgICAgZXJyb3JNc2cgKz1cbiAgICAgICAgICAgICAgYFxcbjEuIElmICcke1xuICAgICAgICAgICAgICAgICAgYm91bmRQcm9wXG4gICAgICAgICAgICAgICAgICAgICAgLm5hbWV9JyBpcyBhbiBBbmd1bGFyIGRpcmVjdGl2ZSwgdGhlbiBhZGQgJ0NvbW1vbk1vZHVsZScgdG8gdGhlICdATmdNb2R1bGUuaW1wb3J0cycgb2YgdGhpcyBjb21wb25lbnQuYCArXG4gICAgICAgICAgICAgIGBcXG4yLiBUbyBhbGxvdyBhbnkgcHJvcGVydHkgYWRkICdOT19FUlJPUlNfU0NIRU1BJyB0byB0aGUgJ0BOZ01vZHVsZS5zY2hlbWFzJyBvZiB0aGlzIGNvbXBvbmVudC5gO1xuICAgICAgICB9IGVsc2UgaWYgKGVsZW1lbnROYW1lLmluZGV4T2YoJy0nKSA+IC0xKSB7XG4gICAgICAgICAgZXJyb3JNc2cgKz1cbiAgICAgICAgICAgICAgYFxcbjEuIElmICcke2VsZW1lbnROYW1lfScgaXMgYW4gQW5ndWxhciBjb21wb25lbnQgYW5kIGl0IGhhcyAnJHtcbiAgICAgICAgICAgICAgICAgIGJvdW5kUHJvcC5uYW1lfScgaW5wdXQsIHRoZW4gdmVyaWZ5IHRoYXQgaXQgaXMgcGFydCBvZiB0aGlzIG1vZHVsZS5gICtcbiAgICAgICAgICAgICAgYFxcbjIuIElmICcke1xuICAgICAgICAgICAgICAgICAgZWxlbWVudE5hbWV9JyBpcyBhIFdlYiBDb21wb25lbnQgdGhlbiBhZGQgJ0NVU1RPTV9FTEVNRU5UU19TQ0hFTUEnIHRvIHRoZSAnQE5nTW9kdWxlLnNjaGVtYXMnIG9mIHRoaXMgY29tcG9uZW50IHRvIHN1cHByZXNzIHRoaXMgbWVzc2FnZS5gICtcbiAgICAgICAgICAgICAgYFxcbjMuIFRvIGFsbG93IGFueSBwcm9wZXJ0eSBhZGQgJ05PX0VSUk9SU19TQ0hFTUEnIHRvIHRoZSAnQE5nTW9kdWxlLnNjaGVtYXMnIG9mIHRoaXMgY29tcG9uZW50LmA7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoZXJyb3JNc2csIGJvdW5kUHJvcC5zb3VyY2VTcGFuKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiAhaXNFbXB0eUV4cHJlc3Npb24oYm91bmRQcm9wLnZhbHVlKTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX3JlcG9ydEVycm9yKFxuICAgICAgbWVzc2FnZTogc3RyaW5nLCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgICBsZXZlbDogUGFyc2VFcnJvckxldmVsID0gUGFyc2VFcnJvckxldmVsLkVSUk9SKSB7XG4gICAgdGhpcy5fdGFyZ2V0RXJyb3JzLnB1c2gobmV3IFBhcnNlRXJyb3Ioc291cmNlU3BhbiwgbWVzc2FnZSwgbGV2ZWwpKTtcbiAgfVxufVxuXG5jbGFzcyBOb25CaW5kYWJsZVZpc2l0b3IgaW1wbGVtZW50cyBodG1sLlZpc2l0b3Ige1xuICB2aXNpdEVsZW1lbnQoYXN0OiBodG1sLkVsZW1lbnQsIHBhcmVudDogRWxlbWVudENvbnRleHQpOiB0LkVsZW1lbnRBc3R8bnVsbCB7XG4gICAgY29uc3QgcHJlcGFyc2VkRWxlbWVudCA9IHByZXBhcnNlRWxlbWVudChhc3QpO1xuICAgIGlmIChwcmVwYXJzZWRFbGVtZW50LnR5cGUgPT09IFByZXBhcnNlZEVsZW1lbnRUeXBlLlNDUklQVCB8fFxuICAgICAgICBwcmVwYXJzZWRFbGVtZW50LnR5cGUgPT09IFByZXBhcnNlZEVsZW1lbnRUeXBlLlNUWUxFIHx8XG4gICAgICAgIHByZXBhcnNlZEVsZW1lbnQudHlwZSA9PT0gUHJlcGFyc2VkRWxlbWVudFR5cGUuU1RZTEVTSEVFVCkge1xuICAgICAgLy8gU2tpcHBpbmcgPHNjcmlwdD4gZm9yIHNlY3VyaXR5IHJlYXNvbnNcbiAgICAgIC8vIFNraXBwaW5nIDxzdHlsZT4gYW5kIHN0eWxlc2hlZXRzIGFzIHdlIGFscmVhZHkgcHJvY2Vzc2VkIHRoZW1cbiAgICAgIC8vIGluIHRoZSBTdHlsZUNvbXBpbGVyXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBhdHRyTmFtZUFuZFZhbHVlcyA9IGFzdC5hdHRycy5tYXAoKGF0dHIpOiBbc3RyaW5nLCBzdHJpbmddID0+IFthdHRyLm5hbWUsIGF0dHIudmFsdWVdKTtcbiAgICBjb25zdCBzZWxlY3RvciA9IGNyZWF0ZUVsZW1lbnRDc3NTZWxlY3Rvcihhc3QubmFtZSwgYXR0ck5hbWVBbmRWYWx1ZXMpO1xuICAgIGNvbnN0IG5nQ29udGVudEluZGV4ID0gcGFyZW50LmZpbmROZ0NvbnRlbnRJbmRleChzZWxlY3Rvcik7XG4gICAgY29uc3QgY2hpbGRyZW46IHQuVGVtcGxhdGVBc3RbXSA9IGh0bWwudmlzaXRBbGwodGhpcywgYXN0LmNoaWxkcmVuLCBFTVBUWV9FTEVNRU5UX0NPTlRFWFQpO1xuICAgIHJldHVybiBuZXcgdC5FbGVtZW50QXN0KFxuICAgICAgICBhc3QubmFtZSwgaHRtbC52aXNpdEFsbCh0aGlzLCBhc3QuYXR0cnMpLCBbXSwgW10sIFtdLCBbXSwgW10sIGZhbHNlLCBbXSwgY2hpbGRyZW4sXG4gICAgICAgIG5nQ29udGVudEluZGV4LCBhc3Quc291cmNlU3BhbiwgYXN0LmVuZFNvdXJjZVNwYW4pO1xuICB9XG4gIHZpc2l0Q29tbWVudChjb21tZW50OiBodG1sLkNvbW1lbnQsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICB2aXNpdEF0dHJpYnV0ZShhdHRyaWJ1dGU6IGh0bWwuQXR0cmlidXRlLCBjb250ZXh0OiBhbnkpOiB0LkF0dHJBc3Qge1xuICAgIHJldHVybiBuZXcgdC5BdHRyQXN0KGF0dHJpYnV0ZS5uYW1lLCBhdHRyaWJ1dGUudmFsdWUsIGF0dHJpYnV0ZS5zb3VyY2VTcGFuKTtcbiAgfVxuXG4gIHZpc2l0VGV4dCh0ZXh0OiBodG1sLlRleHQsIHBhcmVudDogRWxlbWVudENvbnRleHQpOiB0LlRleHRBc3Qge1xuICAgIGNvbnN0IG5nQ29udGVudEluZGV4ID0gcGFyZW50LmZpbmROZ0NvbnRlbnRJbmRleChURVhUX0NTU19TRUxFQ1RPUigpKSE7XG4gICAgcmV0dXJuIG5ldyB0LlRleHRBc3QodGV4dC52YWx1ZSwgbmdDb250ZW50SW5kZXgsIHRleHQuc291cmNlU3Bhbik7XG4gIH1cblxuICB2aXNpdEV4cGFuc2lvbihleHBhbnNpb246IGh0bWwuRXhwYW5zaW9uLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiBleHBhbnNpb247XG4gIH1cblxuICB2aXNpdEV4cGFuc2lvbkNhc2UoZXhwYW5zaW9uQ2FzZTogaHRtbC5FeHBhbnNpb25DYXNlLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiBleHBhbnNpb25DYXNlO1xuICB9XG59XG5cbi8qKlxuICogQSByZWZlcmVuY2UgdG8gYW4gZWxlbWVudCBvciBkaXJlY3RpdmUgaW4gYSB0ZW1wbGF0ZS4gRS5nLiwgdGhlIHJlZmVyZW5jZSBpbiB0aGlzIHRlbXBsYXRlOlxuICpcbiAqIDxkaXYgI215TWVudT1cImNvb2xNZW51XCI+XG4gKlxuICogd291bGQgYmUge25hbWU6ICdteU1lbnUnLCB2YWx1ZTogJ2Nvb2xNZW51Jywgc291cmNlU3BhbjogLi4ufVxuICovXG5jbGFzcyBFbGVtZW50T3JEaXJlY3RpdmVSZWYge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgbmFtZTogc3RyaW5nLCBwdWJsaWMgdmFsdWU6IHN0cmluZywgcHVibGljIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3Bhbikge31cblxuICAvKiogR2V0cyB3aGV0aGVyIHRoaXMgaXMgYSByZWZlcmVuY2UgdG8gdGhlIGdpdmVuIGRpcmVjdGl2ZS4gKi9cbiAgaXNSZWZlcmVuY2VUb0RpcmVjdGl2ZShkaXJlY3RpdmU6IENvbXBpbGVEaXJlY3RpdmVTdW1tYXJ5KSB7XG4gICAgcmV0dXJuIHNwbGl0RXhwb3J0QXMoZGlyZWN0aXZlLmV4cG9ydEFzKS5pbmRleE9mKHRoaXMudmFsdWUpICE9PSAtMTtcbiAgfVxufVxuXG4vKiogU3BsaXRzIGEgcmF3LCBwb3RlbnRpYWxseSBjb21tYS1kZWxpbWl0ZWQgYGV4cG9ydEFzYCB2YWx1ZSBpbnRvIGFuIGFycmF5IG9mIG5hbWVzLiAqL1xuZnVuY3Rpb24gc3BsaXRFeHBvcnRBcyhleHBvcnRBczogc3RyaW5nfG51bGwpOiBzdHJpbmdbXSB7XG4gIHJldHVybiBleHBvcnRBcyA/IGV4cG9ydEFzLnNwbGl0KCcsJykubWFwKGUgPT4gZS50cmltKCkpIDogW107XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzcGxpdENsYXNzZXMoY2xhc3NBdHRyVmFsdWU6IHN0cmluZyk6IHN0cmluZ1tdIHtcbiAgcmV0dXJuIGNsYXNzQXR0clZhbHVlLnRyaW0oKS5zcGxpdCgvXFxzKy9nKTtcbn1cblxuY2xhc3MgRWxlbWVudENvbnRleHQge1xuICBzdGF0aWMgY3JlYXRlKFxuICAgICAgaXNUZW1wbGF0ZUVsZW1lbnQ6IGJvb2xlYW4sIGRpcmVjdGl2ZXM6IHQuRGlyZWN0aXZlQXN0W10sXG4gICAgICBwcm92aWRlckNvbnRleHQ6IFByb3ZpZGVyRWxlbWVudENvbnRleHQpOiBFbGVtZW50Q29udGV4dCB7XG4gICAgY29uc3QgbWF0Y2hlciA9IG5ldyBTZWxlY3Rvck1hdGNoZXIoKTtcbiAgICBsZXQgd2lsZGNhcmROZ0NvbnRlbnRJbmRleDogbnVtYmVyID0gbnVsbCE7XG4gICAgY29uc3QgY29tcG9uZW50ID0gZGlyZWN0aXZlcy5maW5kKGRpcmVjdGl2ZSA9PiBkaXJlY3RpdmUuZGlyZWN0aXZlLmlzQ29tcG9uZW50KTtcbiAgICBpZiAoY29tcG9uZW50KSB7XG4gICAgICBjb25zdCBuZ0NvbnRlbnRTZWxlY3RvcnMgPSBjb21wb25lbnQuZGlyZWN0aXZlLnRlbXBsYXRlICEubmdDb250ZW50U2VsZWN0b3JzO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBuZ0NvbnRlbnRTZWxlY3RvcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3Qgc2VsZWN0b3IgPSBuZ0NvbnRlbnRTZWxlY3RvcnNbaV07XG4gICAgICAgIGlmIChzZWxlY3RvciA9PT0gJyonKSB7XG4gICAgICAgICAgd2lsZGNhcmROZ0NvbnRlbnRJbmRleCA9IGk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbWF0Y2hlci5hZGRTZWxlY3RhYmxlcyhDc3NTZWxlY3Rvci5wYXJzZShuZ0NvbnRlbnRTZWxlY3RvcnNbaV0pLCBpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbmV3IEVsZW1lbnRDb250ZXh0KGlzVGVtcGxhdGVFbGVtZW50LCBtYXRjaGVyLCB3aWxkY2FyZE5nQ29udGVudEluZGV4LCBwcm92aWRlckNvbnRleHQpO1xuICB9XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIGlzVGVtcGxhdGVFbGVtZW50OiBib29sZWFuLCBwcml2YXRlIF9uZ0NvbnRlbnRJbmRleE1hdGNoZXI6IFNlbGVjdG9yTWF0Y2hlcixcbiAgICAgIHByaXZhdGUgX3dpbGRjYXJkTmdDb250ZW50SW5kZXg6IG51bWJlcnxudWxsLFxuICAgICAgcHVibGljIHByb3ZpZGVyQ29udGV4dDogUHJvdmlkZXJFbGVtZW50Q29udGV4dHxudWxsKSB7fVxuXG4gIGZpbmROZ0NvbnRlbnRJbmRleChzZWxlY3RvcjogQ3NzU2VsZWN0b3IpOiBudW1iZXJ8bnVsbCB7XG4gICAgY29uc3QgbmdDb250ZW50SW5kaWNlczogbnVtYmVyW10gPSBbXTtcbiAgICB0aGlzLl9uZ0NvbnRlbnRJbmRleE1hdGNoZXIubWF0Y2goc2VsZWN0b3IsIChzZWxlY3RvciwgbmdDb250ZW50SW5kZXgpID0+IHtcbiAgICAgIG5nQ29udGVudEluZGljZXMucHVzaChuZ0NvbnRlbnRJbmRleCk7XG4gICAgfSk7XG4gICAgbmdDb250ZW50SW5kaWNlcy5zb3J0KCk7XG4gICAgaWYgKHRoaXMuX3dpbGRjYXJkTmdDb250ZW50SW5kZXggIT0gbnVsbCkge1xuICAgICAgbmdDb250ZW50SW5kaWNlcy5wdXNoKHRoaXMuX3dpbGRjYXJkTmdDb250ZW50SW5kZXgpO1xuICAgIH1cbiAgICByZXR1cm4gbmdDb250ZW50SW5kaWNlcy5sZW5ndGggPiAwID8gbmdDb250ZW50SW5kaWNlc1swXSA6IG51bGw7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnRDc3NTZWxlY3RvcihcbiAgICBlbGVtZW50TmFtZTogc3RyaW5nLCBhdHRyaWJ1dGVzOiBbc3RyaW5nLCBzdHJpbmddW10pOiBDc3NTZWxlY3RvciB7XG4gIGNvbnN0IGNzc1NlbGVjdG9yID0gbmV3IENzc1NlbGVjdG9yKCk7XG4gIGNvbnN0IGVsTmFtZU5vTnMgPSBzcGxpdE5zTmFtZShlbGVtZW50TmFtZSlbMV07XG5cbiAgY3NzU2VsZWN0b3Iuc2V0RWxlbWVudChlbE5hbWVOb05zKTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGF0dHJpYnV0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBhdHRyTmFtZSA9IGF0dHJpYnV0ZXNbaV1bMF07XG4gICAgY29uc3QgYXR0ck5hbWVOb05zID0gc3BsaXROc05hbWUoYXR0ck5hbWUpWzFdO1xuICAgIGNvbnN0IGF0dHJWYWx1ZSA9IGF0dHJpYnV0ZXNbaV1bMV07XG5cbiAgICBjc3NTZWxlY3Rvci5hZGRBdHRyaWJ1dGUoYXR0ck5hbWVOb05zLCBhdHRyVmFsdWUpO1xuICAgIGlmIChhdHRyTmFtZS50b0xvd2VyQ2FzZSgpID09IENMQVNTX0FUVFIpIHtcbiAgICAgIGNvbnN0IGNsYXNzZXMgPSBzcGxpdENsYXNzZXMoYXR0clZhbHVlKTtcbiAgICAgIGNsYXNzZXMuZm9yRWFjaChjbGFzc05hbWUgPT4gY3NzU2VsZWN0b3IuYWRkQ2xhc3NOYW1lKGNsYXNzTmFtZSkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gY3NzU2VsZWN0b3I7XG59XG5cbmNvbnN0IEVNUFRZX0VMRU1FTlRfQ09OVEVYVCA9IG5ldyBFbGVtZW50Q29udGV4dCh0cnVlLCBuZXcgU2VsZWN0b3JNYXRjaGVyKCksIG51bGwsIG51bGwpO1xuY29uc3QgTk9OX0JJTkRBQkxFX1ZJU0lUT1IgPSBuZXcgTm9uQmluZGFibGVWaXNpdG9yKCk7XG5cbmZ1bmN0aW9uIF9pc0VtcHR5VGV4dE5vZGUobm9kZTogaHRtbC5Ob2RlKTogYm9vbGVhbiB7XG4gIHJldHVybiBub2RlIGluc3RhbmNlb2YgaHRtbC5UZXh0ICYmIG5vZGUudmFsdWUudHJpbSgpLmxlbmd0aCA9PSAwO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlU3VtbWFyeUR1cGxpY2F0ZXM8VCBleHRlbmRzIHt0eXBlOiBDb21waWxlVHlwZU1ldGFkYXRhfT4oaXRlbXM6IFRbXSk6IFRbXSB7XG4gIGNvbnN0IG1hcCA9IG5ldyBNYXA8YW55LCBUPigpO1xuXG4gIGl0ZW1zLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICBpZiAoIW1hcC5nZXQoaXRlbS50eXBlLnJlZmVyZW5jZSkpIHtcbiAgICAgIG1hcC5zZXQoaXRlbS50eXBlLnJlZmVyZW5jZSwgaXRlbSk7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gQXJyYXkuZnJvbShtYXAudmFsdWVzKCkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNFbXB0eUV4cHJlc3Npb24oYXN0OiBBU1QpOiBib29sZWFuIHtcbiAgaWYgKGFzdCBpbnN0YW5jZW9mIEFTVFdpdGhTb3VyY2UpIHtcbiAgICBhc3QgPSBhc3QuYXN0O1xuICB9XG4gIHJldHVybiBhc3QgaW5zdGFuY2VvZiBFbXB0eUV4cHI7XG59XG4iXX0=