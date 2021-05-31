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
        define("@angular/compiler/src/render3/r3_template_transform", ["require", "exports", "tslib", "@angular/compiler/src/ml_parser/ast", "@angular/compiler/src/ml_parser/html_whitespaces", "@angular/compiler/src/ml_parser/tags", "@angular/compiler/src/parse_util", "@angular/compiler/src/style_url_resolver", "@angular/compiler/src/template_parser/template_preparser", "@angular/compiler/src/render3/r3_ast", "@angular/compiler/src/render3/view/i18n/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.htmlAstToRender3Ast = void 0;
    var tslib_1 = require("tslib");
    var html = require("@angular/compiler/src/ml_parser/ast");
    var html_whitespaces_1 = require("@angular/compiler/src/ml_parser/html_whitespaces");
    var tags_1 = require("@angular/compiler/src/ml_parser/tags");
    var parse_util_1 = require("@angular/compiler/src/parse_util");
    var style_url_resolver_1 = require("@angular/compiler/src/style_url_resolver");
    var template_preparser_1 = require("@angular/compiler/src/template_parser/template_preparser");
    var t = require("@angular/compiler/src/render3/r3_ast");
    var util_1 = require("@angular/compiler/src/render3/view/i18n/util");
    var BIND_NAME_REGEXP = /^(?:(bind-)|(let-)|(ref-|#)|(on-)|(bindon-)|(@))(.*)$/;
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
    var BINDING_DELIMS = {
        BANANA_BOX: { start: '[(', end: ')]' },
        PROPERTY: { start: '[', end: ']' },
        EVENT: { start: '(', end: ')' },
    };
    var TEMPLATE_ATTR_PREFIX = '*';
    function htmlAstToRender3Ast(htmlNodes, bindingParser, options) {
        var transformer = new HtmlAstToIvyAst(bindingParser, options);
        var ivyNodes = html.visitAll(transformer, htmlNodes);
        // Errors might originate in either the binding parser or the html to ivy transformer
        var allErrors = bindingParser.errors.concat(transformer.errors);
        var result = {
            nodes: ivyNodes,
            errors: allErrors,
            styleUrls: transformer.styleUrls,
            styles: transformer.styles,
            ngContentSelectors: transformer.ngContentSelectors
        };
        if (options.collectCommentNodes) {
            result.commentNodes = transformer.commentNodes;
        }
        return result;
    }
    exports.htmlAstToRender3Ast = htmlAstToRender3Ast;
    var HtmlAstToIvyAst = /** @class */ (function () {
        function HtmlAstToIvyAst(bindingParser, options) {
            this.bindingParser = bindingParser;
            this.options = options;
            this.errors = [];
            this.styles = [];
            this.styleUrls = [];
            this.ngContentSelectors = [];
            // This array will be populated if `Render3ParseOptions['collectCommentNodes']` is true
            this.commentNodes = [];
            this.inI18nBlock = false;
        }
        // HTML visitor
        HtmlAstToIvyAst.prototype.visitElement = function (element) {
            var e_1, _a;
            var _this = this;
            var isI18nRootElement = util_1.isI18nRootNode(element.i18n);
            if (isI18nRootElement) {
                if (this.inI18nBlock) {
                    this.reportError('Cannot mark an element as translatable inside of a translatable section. Please remove the nested i18n marker.', element.sourceSpan);
                }
                this.inI18nBlock = true;
            }
            var preparsedElement = template_preparser_1.preparseElement(element);
            if (preparsedElement.type === template_preparser_1.PreparsedElementType.SCRIPT) {
                return null;
            }
            else if (preparsedElement.type === template_preparser_1.PreparsedElementType.STYLE) {
                var contents = textContents(element);
                if (contents !== null) {
                    this.styles.push(contents);
                }
                return null;
            }
            else if (preparsedElement.type === template_preparser_1.PreparsedElementType.STYLESHEET &&
                style_url_resolver_1.isStyleUrlResolvable(preparsedElement.hrefAttr)) {
                this.styleUrls.push(preparsedElement.hrefAttr);
                return null;
            }
            // Whether the element is a `<ng-template>`
            var isTemplateElement = tags_1.isNgTemplate(element.name);
            var parsedProperties = [];
            var boundEvents = [];
            var variables = [];
            var references = [];
            var attributes = [];
            var i18nAttrsMeta = {};
            var templateParsedProperties = [];
            var templateVariables = [];
            // Whether the element has any *-attribute
            var elementHasInlineTemplate = false;
            try {
                for (var _b = tslib_1.__values(element.attrs), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var attribute = _c.value;
                    var hasBinding = false;
                    var normalizedName = normalizeAttributeName(attribute.name);
                    // `*attr` defines template bindings
                    var isTemplateBinding = false;
                    if (attribute.i18n) {
                        i18nAttrsMeta[attribute.name] = attribute.i18n;
                    }
                    if (normalizedName.startsWith(TEMPLATE_ATTR_PREFIX)) {
                        // *-attributes
                        if (elementHasInlineTemplate) {
                            this.reportError("Can't have multiple template bindings on one element. Use only one attribute prefixed with *", attribute.sourceSpan);
                        }
                        isTemplateBinding = true;
                        elementHasInlineTemplate = true;
                        var templateValue = attribute.value;
                        var templateKey = normalizedName.substring(TEMPLATE_ATTR_PREFIX.length);
                        var parsedVariables = [];
                        var absoluteValueOffset = attribute.valueSpan ?
                            attribute.valueSpan.start.offset :
                            // If there is no value span the attribute does not have a value, like `attr` in
                            //`<div attr></div>`. In this case, point to one character beyond the last character of
                            // the attribute name.
                            attribute.sourceSpan.start.offset + attribute.name.length;
                        this.bindingParser.parseInlineTemplateBinding(templateKey, templateValue, attribute.sourceSpan, absoluteValueOffset, [], templateParsedProperties, parsedVariables, true /* isIvyAst */);
                        templateVariables.push.apply(templateVariables, tslib_1.__spreadArray([], tslib_1.__read(parsedVariables.map(function (v) { return new t.Variable(v.name, v.value, v.sourceSpan, v.keySpan, v.valueSpan); }))));
                    }
                    else {
                        // Check for variables, events, property bindings, interpolation
                        hasBinding = this.parseAttribute(isTemplateElement, attribute, [], parsedProperties, boundEvents, variables, references);
                    }
                    if (!hasBinding && !isTemplateBinding) {
                        // don't include the bindings as attributes as well in the AST
                        attributes.push(this.visitAttribute(attribute));
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            var children = html.visitAll(preparsedElement.nonBindable ? NON_BINDABLE_VISITOR : this, element.children);
            var parsedElement;
            if (preparsedElement.type === template_preparser_1.PreparsedElementType.NG_CONTENT) {
                // `<ng-content>`
                if (element.children &&
                    !element.children.every(function (node) { return isEmptyTextNode(node) || isCommentNode(node); })) {
                    this.reportError("<ng-content> element cannot have content.", element.sourceSpan);
                }
                var selector = preparsedElement.selectAttr;
                var attrs = element.attrs.map(function (attr) { return _this.visitAttribute(attr); });
                parsedElement = new t.Content(selector, attrs, element.sourceSpan, element.i18n);
                this.ngContentSelectors.push(selector);
            }
            else if (isTemplateElement) {
                // `<ng-template>`
                var attrs = this.extractAttributes(element.name, parsedProperties, i18nAttrsMeta);
                parsedElement = new t.Template(element.name, attributes, attrs.bound, boundEvents, [ /* no template attributes */], children, references, variables, element.sourceSpan, element.startSourceSpan, element.endSourceSpan, element.i18n);
            }
            else {
                var attrs = this.extractAttributes(element.name, parsedProperties, i18nAttrsMeta);
                parsedElement = new t.Element(element.name, attributes, attrs.bound, boundEvents, children, references, element.sourceSpan, element.startSourceSpan, element.endSourceSpan, element.i18n);
            }
            if (elementHasInlineTemplate) {
                // If this node is an inline-template (e.g. has *ngFor) then we need to create a template
                // node that contains this node.
                // Moreover, if the node is an element, then we need to hoist its attributes to the template
                // node for matching against content projection selectors.
                var attrs = this.extractAttributes('ng-template', templateParsedProperties, i18nAttrsMeta);
                var templateAttrs_1 = [];
                attrs.literal.forEach(function (attr) { return templateAttrs_1.push(attr); });
                attrs.bound.forEach(function (attr) { return templateAttrs_1.push(attr); });
                var hoistedAttrs = parsedElement instanceof t.Element ?
                    {
                        attributes: parsedElement.attributes,
                        inputs: parsedElement.inputs,
                        outputs: parsedElement.outputs,
                    } :
                    { attributes: [], inputs: [], outputs: [] };
                // For <ng-template>s with structural directives on them, avoid passing i18n information to
                // the wrapping template to prevent unnecessary i18n instructions from being generated. The
                // necessary i18n meta information will be extracted from child elements.
                var i18n_1 = isTemplateElement && isI18nRootElement ? undefined : element.i18n;
                // TODO(pk): test for this case
                parsedElement = new t.Template(parsedElement.name, hoistedAttrs.attributes, hoistedAttrs.inputs, hoistedAttrs.outputs, templateAttrs_1, [parsedElement], [ /* no references */], templateVariables, element.sourceSpan, element.startSourceSpan, element.endSourceSpan, i18n_1);
            }
            if (isI18nRootElement) {
                this.inI18nBlock = false;
            }
            return parsedElement;
        };
        HtmlAstToIvyAst.prototype.visitAttribute = function (attribute) {
            return new t.TextAttribute(attribute.name, attribute.value, attribute.sourceSpan, attribute.keySpan, attribute.valueSpan, attribute.i18n);
        };
        HtmlAstToIvyAst.prototype.visitText = function (text) {
            return this._visitTextWithInterpolation(text.value, text.sourceSpan, text.i18n);
        };
        HtmlAstToIvyAst.prototype.visitExpansion = function (expansion) {
            var _this = this;
            if (!expansion.i18n) {
                // do not generate Icu in case it was created
                // outside of i18n block in a template
                return null;
            }
            if (!util_1.isI18nRootNode(expansion.i18n)) {
                throw new Error("Invalid type \"" + expansion.i18n.constructor + "\" for \"i18n\" property of " + expansion.sourceSpan.toString() + ". Expected a \"Message\"");
            }
            var message = expansion.i18n;
            var vars = {};
            var placeholders = {};
            // extract VARs from ICUs - we process them separately while
            // assembling resulting message via goog.getMsg function, since
            // we need to pass them to top-level goog.getMsg call
            Object.keys(message.placeholders).forEach(function (key) {
                var value = message.placeholders[key];
                if (key.startsWith(util_1.I18N_ICU_VAR_PREFIX)) {
                    // Currently when the `plural` or `select` keywords in an ICU contain trailing spaces (e.g.
                    // `{count, select , ...}`), these spaces are also included into the key names in ICU vars
                    // (e.g. "VAR_SELECT "). These trailing spaces are not desirable, since they will later be
                    // converted into `_` symbols while normalizing placeholder names, which might lead to
                    // mismatches at runtime (i.e. placeholder will not be replaced with the correct value).
                    var formattedKey = key.trim();
                    var ast = _this.bindingParser.parseInterpolationExpression(value.text, value.sourceSpan);
                    vars[formattedKey] = new t.BoundText(ast, value.sourceSpan);
                }
                else {
                    placeholders[key] = _this._visitTextWithInterpolation(value.text, value.sourceSpan);
                }
            });
            return new t.Icu(vars, placeholders, expansion.sourceSpan, message);
        };
        HtmlAstToIvyAst.prototype.visitExpansionCase = function (expansionCase) {
            return null;
        };
        HtmlAstToIvyAst.prototype.visitComment = function (comment) {
            if (this.options.collectCommentNodes) {
                this.commentNodes.push(new t.Comment(comment.value || '', comment.sourceSpan));
            }
            return null;
        };
        // convert view engine `ParsedProperty` to a format suitable for IVY
        HtmlAstToIvyAst.prototype.extractAttributes = function (elementName, properties, i18nPropsMeta) {
            var _this = this;
            var bound = [];
            var literal = [];
            properties.forEach(function (prop) {
                var i18n = i18nPropsMeta[prop.name];
                if (prop.isLiteral) {
                    literal.push(new t.TextAttribute(prop.name, prop.expression.source || '', prop.sourceSpan, prop.keySpan, prop.valueSpan, i18n));
                }
                else {
                    // Note that validation is skipped and property mapping is disabled
                    // due to the fact that we need to make sure a given prop is not an
                    // input of a directive and directive matching happens at runtime.
                    var bep = _this.bindingParser.createBoundElementProperty(elementName, prop, /* skipValidation */ true, /* mapPropertyName */ false);
                    bound.push(t.BoundAttribute.fromBoundElementProperty(bep, i18n));
                }
            });
            return { bound: bound, literal: literal };
        };
        HtmlAstToIvyAst.prototype.parseAttribute = function (isTemplateElement, attribute, matchableAttributes, parsedProperties, boundEvents, variables, references) {
            var name = normalizeAttributeName(attribute.name);
            var value = attribute.value;
            var srcSpan = attribute.sourceSpan;
            var absoluteOffset = attribute.valueSpan ? attribute.valueSpan.start.offset : srcSpan.start.offset;
            function createKeySpan(srcSpan, prefix, identifier) {
                // We need to adjust the start location for the keySpan to account for the removed 'data-'
                // prefix from `normalizeAttributeName`.
                var normalizationAdjustment = attribute.name.length - name.length;
                var keySpanStart = srcSpan.start.moveBy(prefix.length + normalizationAdjustment);
                var keySpanEnd = keySpanStart.moveBy(identifier.length);
                return new parse_util_1.ParseSourceSpan(keySpanStart, keySpanEnd, keySpanStart, identifier);
            }
            var bindParts = name.match(BIND_NAME_REGEXP);
            if (bindParts) {
                if (bindParts[KW_BIND_IDX] != null) {
                    var identifier = bindParts[IDENT_KW_IDX];
                    var keySpan_1 = createKeySpan(srcSpan, bindParts[KW_BIND_IDX], identifier);
                    this.bindingParser.parsePropertyBinding(identifier, value, false, srcSpan, absoluteOffset, attribute.valueSpan, matchableAttributes, parsedProperties, keySpan_1);
                }
                else if (bindParts[KW_LET_IDX]) {
                    if (isTemplateElement) {
                        var identifier = bindParts[IDENT_KW_IDX];
                        var keySpan_2 = createKeySpan(srcSpan, bindParts[KW_LET_IDX], identifier);
                        this.parseVariable(identifier, value, srcSpan, keySpan_2, attribute.valueSpan, variables);
                    }
                    else {
                        this.reportError("\"let-\" is only supported on ng-template elements.", srcSpan);
                    }
                }
                else if (bindParts[KW_REF_IDX]) {
                    var identifier = bindParts[IDENT_KW_IDX];
                    var keySpan_3 = createKeySpan(srcSpan, bindParts[KW_REF_IDX], identifier);
                    this.parseReference(identifier, value, srcSpan, keySpan_3, attribute.valueSpan, references);
                }
                else if (bindParts[KW_ON_IDX]) {
                    var events = [];
                    var identifier = bindParts[IDENT_KW_IDX];
                    var keySpan_4 = createKeySpan(srcSpan, bindParts[KW_ON_IDX], identifier);
                    this.bindingParser.parseEvent(identifier, value, srcSpan, attribute.valueSpan || srcSpan, matchableAttributes, events, keySpan_4);
                    addEvents(events, boundEvents);
                }
                else if (bindParts[KW_BINDON_IDX]) {
                    var identifier = bindParts[IDENT_KW_IDX];
                    var keySpan_5 = createKeySpan(srcSpan, bindParts[KW_BINDON_IDX], identifier);
                    this.bindingParser.parsePropertyBinding(identifier, value, false, srcSpan, absoluteOffset, attribute.valueSpan, matchableAttributes, parsedProperties, keySpan_5);
                    this.parseAssignmentEvent(identifier, value, srcSpan, attribute.valueSpan, matchableAttributes, boundEvents, keySpan_5);
                }
                else if (bindParts[KW_AT_IDX]) {
                    var keySpan_6 = createKeySpan(srcSpan, '', name);
                    this.bindingParser.parseLiteralAttr(name, value, srcSpan, absoluteOffset, attribute.valueSpan, matchableAttributes, parsedProperties, keySpan_6);
                }
                return true;
            }
            // We didn't see a kw-prefixed property binding, but we have not yet checked
            // for the []/()/[()] syntax.
            var delims = null;
            if (name.startsWith(BINDING_DELIMS.BANANA_BOX.start)) {
                delims = BINDING_DELIMS.BANANA_BOX;
            }
            else if (name.startsWith(BINDING_DELIMS.PROPERTY.start)) {
                delims = BINDING_DELIMS.PROPERTY;
            }
            else if (name.startsWith(BINDING_DELIMS.EVENT.start)) {
                delims = BINDING_DELIMS.EVENT;
            }
            if (delims !== null &&
                // NOTE: older versions of the parser would match a start/end delimited
                // binding iff the property name was terminated by the ending delimiter
                // and the identifier in the binding was non-empty.
                // TODO(ayazhafiz): update this to handle malformed bindings.
                name.endsWith(delims.end) && name.length > delims.start.length + delims.end.length) {
                var identifier = name.substring(delims.start.length, name.length - delims.end.length);
                var keySpan_7 = createKeySpan(srcSpan, delims.start, identifier);
                if (delims.start === BINDING_DELIMS.BANANA_BOX.start) {
                    this.bindingParser.parsePropertyBinding(identifier, value, false, srcSpan, absoluteOffset, attribute.valueSpan, matchableAttributes, parsedProperties, keySpan_7);
                    this.parseAssignmentEvent(identifier, value, srcSpan, attribute.valueSpan, matchableAttributes, boundEvents, keySpan_7);
                }
                else if (delims.start === BINDING_DELIMS.PROPERTY.start) {
                    this.bindingParser.parsePropertyBinding(identifier, value, false, srcSpan, absoluteOffset, attribute.valueSpan, matchableAttributes, parsedProperties, keySpan_7);
                }
                else {
                    var events = [];
                    this.bindingParser.parseEvent(identifier, value, srcSpan, attribute.valueSpan || srcSpan, matchableAttributes, events, keySpan_7);
                    addEvents(events, boundEvents);
                }
                return true;
            }
            // No explicit binding found.
            var keySpan = createKeySpan(srcSpan, '' /* prefix */, name);
            var hasBinding = this.bindingParser.parsePropertyInterpolation(name, value, srcSpan, attribute.valueSpan, matchableAttributes, parsedProperties, keySpan);
            return hasBinding;
        };
        HtmlAstToIvyAst.prototype._visitTextWithInterpolation = function (value, sourceSpan, i18n) {
            var valueNoNgsp = html_whitespaces_1.replaceNgsp(value);
            var expr = this.bindingParser.parseInterpolation(valueNoNgsp, sourceSpan);
            return expr ? new t.BoundText(expr, sourceSpan, i18n) : new t.Text(valueNoNgsp, sourceSpan);
        };
        HtmlAstToIvyAst.prototype.parseVariable = function (identifier, value, sourceSpan, keySpan, valueSpan, variables) {
            if (identifier.indexOf('-') > -1) {
                this.reportError("\"-\" is not allowed in variable names", sourceSpan);
            }
            else if (identifier.length === 0) {
                this.reportError("Variable does not have a name", sourceSpan);
            }
            variables.push(new t.Variable(identifier, value, sourceSpan, keySpan, valueSpan));
        };
        HtmlAstToIvyAst.prototype.parseReference = function (identifier, value, sourceSpan, keySpan, valueSpan, references) {
            if (identifier.indexOf('-') > -1) {
                this.reportError("\"-\" is not allowed in reference names", sourceSpan);
            }
            else if (identifier.length === 0) {
                this.reportError("Reference does not have a name", sourceSpan);
            }
            else if (references.some(function (reference) { return reference.name === identifier; })) {
                this.reportError("Reference \"#" + identifier + "\" is defined more than once", sourceSpan);
            }
            references.push(new t.Reference(identifier, value, sourceSpan, keySpan, valueSpan));
        };
        HtmlAstToIvyAst.prototype.parseAssignmentEvent = function (name, expression, sourceSpan, valueSpan, targetMatchableAttrs, boundEvents, keySpan) {
            var events = [];
            this.bindingParser.parseEvent(name + "Change", expression + "=$event", sourceSpan, valueSpan || sourceSpan, targetMatchableAttrs, events, keySpan);
            addEvents(events, boundEvents);
        };
        HtmlAstToIvyAst.prototype.reportError = function (message, sourceSpan, level) {
            if (level === void 0) { level = parse_util_1.ParseErrorLevel.ERROR; }
            this.errors.push(new parse_util_1.ParseError(sourceSpan, message, level));
        };
        return HtmlAstToIvyAst;
    }());
    var NonBindableVisitor = /** @class */ (function () {
        function NonBindableVisitor() {
        }
        NonBindableVisitor.prototype.visitElement = function (ast) {
            var preparsedElement = template_preparser_1.preparseElement(ast);
            if (preparsedElement.type === template_preparser_1.PreparsedElementType.SCRIPT ||
                preparsedElement.type === template_preparser_1.PreparsedElementType.STYLE ||
                preparsedElement.type === template_preparser_1.PreparsedElementType.STYLESHEET) {
                // Skipping <script> for security reasons
                // Skipping <style> and stylesheets as we already processed them
                // in the StyleCompiler
                return null;
            }
            var children = html.visitAll(this, ast.children, null);
            return new t.Element(ast.name, html.visitAll(this, ast.attrs), 
            /* inputs */ [], /* outputs */ [], children, /* references */ [], ast.sourceSpan, ast.startSourceSpan, ast.endSourceSpan);
        };
        NonBindableVisitor.prototype.visitComment = function (comment) {
            return null;
        };
        NonBindableVisitor.prototype.visitAttribute = function (attribute) {
            return new t.TextAttribute(attribute.name, attribute.value, attribute.sourceSpan, attribute.keySpan, attribute.valueSpan, attribute.i18n);
        };
        NonBindableVisitor.prototype.visitText = function (text) {
            return new t.Text(text.value, text.sourceSpan);
        };
        NonBindableVisitor.prototype.visitExpansion = function (expansion) {
            return null;
        };
        NonBindableVisitor.prototype.visitExpansionCase = function (expansionCase) {
            return null;
        };
        return NonBindableVisitor;
    }());
    var NON_BINDABLE_VISITOR = new NonBindableVisitor();
    function normalizeAttributeName(attrName) {
        return /^data-/i.test(attrName) ? attrName.substring(5) : attrName;
    }
    function addEvents(events, boundEvents) {
        boundEvents.push.apply(boundEvents, tslib_1.__spreadArray([], tslib_1.__read(events.map(function (e) { return t.BoundEvent.fromParsedEvent(e); }))));
    }
    function isEmptyTextNode(node) {
        return node instanceof html.Text && node.value.trim().length == 0;
    }
    function isCommentNode(node) {
        return node instanceof html.Comment;
    }
    function textContents(node) {
        if (node.children.length !== 1 || !(node.children[0] instanceof html.Text)) {
            return null;
        }
        else {
            return node.children[0].value;
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicjNfdGVtcGxhdGVfdHJhbnNmb3JtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3JlbmRlcjMvcjNfdGVtcGxhdGVfdHJhbnNmb3JtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFJSCwwREFBeUM7SUFDekMscUZBQTBEO0lBQzFELDZEQUErQztJQUMvQywrREFBMkU7SUFDM0UsK0VBQTJEO0lBRTNELCtGQUE0RjtJQUU1Rix3REFBOEI7SUFDOUIscUVBQXFFO0lBRXJFLElBQU0sZ0JBQWdCLEdBQUcsdURBQXVELENBQUM7SUFFakYsb0JBQW9CO0lBQ3BCLElBQU0sV0FBVyxHQUFHLENBQUMsQ0FBQztJQUN0QixtQkFBbUI7SUFDbkIsSUFBTSxVQUFVLEdBQUcsQ0FBQyxDQUFDO0lBQ3JCLHFCQUFxQjtJQUNyQixJQUFNLFVBQVUsR0FBRyxDQUFDLENBQUM7SUFDckIsa0JBQWtCO0lBQ2xCLElBQU0sU0FBUyxHQUFHLENBQUMsQ0FBQztJQUNwQixzQkFBc0I7SUFDdEIsSUFBTSxhQUFhLEdBQUcsQ0FBQyxDQUFDO0lBQ3hCLGdCQUFnQjtJQUNoQixJQUFNLFNBQVMsR0FBRyxDQUFDLENBQUM7SUFDcEIsb0ZBQW9GO0lBQ3BGLElBQU0sWUFBWSxHQUFHLENBQUMsQ0FBQztJQUV2QixJQUFNLGNBQWMsR0FBRztRQUNyQixVQUFVLEVBQUUsRUFBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUM7UUFDcEMsUUFBUSxFQUFFLEVBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFDO1FBQ2hDLEtBQUssRUFBRSxFQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBQztLQUM5QixDQUFDO0lBRUYsSUFBTSxvQkFBb0IsR0FBRyxHQUFHLENBQUM7SUFpQmpDLFNBQWdCLG1CQUFtQixDQUMvQixTQUFzQixFQUFFLGFBQTRCLEVBQ3BELE9BQTRCO1FBQzlCLElBQU0sV0FBVyxHQUFHLElBQUksZUFBZSxDQUFDLGFBQWEsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNoRSxJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUV2RCxxRkFBcUY7UUFDckYsSUFBTSxTQUFTLEdBQUcsYUFBYSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRWxFLElBQU0sTUFBTSxHQUF1QjtZQUNqQyxLQUFLLEVBQUUsUUFBUTtZQUNmLE1BQU0sRUFBRSxTQUFTO1lBQ2pCLFNBQVMsRUFBRSxXQUFXLENBQUMsU0FBUztZQUNoQyxNQUFNLEVBQUUsV0FBVyxDQUFDLE1BQU07WUFDMUIsa0JBQWtCLEVBQUUsV0FBVyxDQUFDLGtCQUFrQjtTQUNuRCxDQUFDO1FBQ0YsSUFBSSxPQUFPLENBQUMsbUJBQW1CLEVBQUU7WUFDL0IsTUFBTSxDQUFDLFlBQVksR0FBRyxXQUFXLENBQUMsWUFBWSxDQUFDO1NBQ2hEO1FBQ0QsT0FBTyxNQUFNLENBQUM7SUFDaEIsQ0FBQztJQXBCRCxrREFvQkM7SUFFRDtRQVNFLHlCQUFvQixhQUE0QixFQUFVLE9BQTRCO1lBQWxFLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1lBQVUsWUFBTyxHQUFQLE9BQU8sQ0FBcUI7WUFSdEYsV0FBTSxHQUFpQixFQUFFLENBQUM7WUFDMUIsV0FBTSxHQUFhLEVBQUUsQ0FBQztZQUN0QixjQUFTLEdBQWEsRUFBRSxDQUFDO1lBQ3pCLHVCQUFrQixHQUFhLEVBQUUsQ0FBQztZQUNsQyx1RkFBdUY7WUFDdkYsaUJBQVksR0FBZ0IsRUFBRSxDQUFDO1lBQ3ZCLGdCQUFXLEdBQVksS0FBSyxDQUFDO1FBRW9ELENBQUM7UUFFMUYsZUFBZTtRQUNmLHNDQUFZLEdBQVosVUFBYSxPQUFxQjs7WUFBbEMsaUJBMEpDO1lBekpDLElBQU0saUJBQWlCLEdBQUcscUJBQWMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdkQsSUFBSSxpQkFBaUIsRUFBRTtnQkFDckIsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO29CQUNwQixJQUFJLENBQUMsV0FBVyxDQUNaLGdIQUFnSCxFQUNoSCxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7aUJBQ3pCO2dCQUNELElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO2FBQ3pCO1lBQ0QsSUFBTSxnQkFBZ0IsR0FBRyxvQ0FBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ2xELElBQUksZ0JBQWdCLENBQUMsSUFBSSxLQUFLLHlDQUFvQixDQUFDLE1BQU0sRUFBRTtnQkFDekQsT0FBTyxJQUFJLENBQUM7YUFDYjtpQkFBTSxJQUFJLGdCQUFnQixDQUFDLElBQUksS0FBSyx5Q0FBb0IsQ0FBQyxLQUFLLEVBQUU7Z0JBQy9ELElBQU0sUUFBUSxHQUFHLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDdkMsSUFBSSxRQUFRLEtBQUssSUFBSSxFQUFFO29CQUNyQixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztpQkFDNUI7Z0JBQ0QsT0FBTyxJQUFJLENBQUM7YUFDYjtpQkFBTSxJQUNILGdCQUFnQixDQUFDLElBQUksS0FBSyx5Q0FBb0IsQ0FBQyxVQUFVO2dCQUN6RCx5Q0FBb0IsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDbkQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQy9DLE9BQU8sSUFBSSxDQUFDO2FBQ2I7WUFFRCwyQ0FBMkM7WUFDM0MsSUFBTSxpQkFBaUIsR0FBRyxtQkFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUVyRCxJQUFNLGdCQUFnQixHQUFxQixFQUFFLENBQUM7WUFDOUMsSUFBTSxXQUFXLEdBQW1CLEVBQUUsQ0FBQztZQUN2QyxJQUFNLFNBQVMsR0FBaUIsRUFBRSxDQUFDO1lBQ25DLElBQU0sVUFBVSxHQUFrQixFQUFFLENBQUM7WUFDckMsSUFBTSxVQUFVLEdBQXNCLEVBQUUsQ0FBQztZQUN6QyxJQUFNLGFBQWEsR0FBbUMsRUFBRSxDQUFDO1lBRXpELElBQU0sd0JBQXdCLEdBQXFCLEVBQUUsQ0FBQztZQUN0RCxJQUFNLGlCQUFpQixHQUFpQixFQUFFLENBQUM7WUFFM0MsMENBQTBDO1lBQzFDLElBQUksd0JBQXdCLEdBQUcsS0FBSyxDQUFDOztnQkFFckMsS0FBd0IsSUFBQSxLQUFBLGlCQUFBLE9BQU8sQ0FBQyxLQUFLLENBQUEsZ0JBQUEsNEJBQUU7b0JBQWxDLElBQU0sU0FBUyxXQUFBO29CQUNsQixJQUFJLFVBQVUsR0FBRyxLQUFLLENBQUM7b0JBQ3ZCLElBQU0sY0FBYyxHQUFHLHNCQUFzQixDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFFOUQsb0NBQW9DO29CQUNwQyxJQUFJLGlCQUFpQixHQUFHLEtBQUssQ0FBQztvQkFFOUIsSUFBSSxTQUFTLENBQUMsSUFBSSxFQUFFO3dCQUNsQixhQUFhLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUM7cUJBQ2hEO29CQUVELElBQUksY0FBYyxDQUFDLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFO3dCQUNuRCxlQUFlO3dCQUNmLElBQUksd0JBQXdCLEVBQUU7NEJBQzVCLElBQUksQ0FBQyxXQUFXLENBQ1osOEZBQThGLEVBQzlGLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQzt5QkFDM0I7d0JBQ0QsaUJBQWlCLEdBQUcsSUFBSSxDQUFDO3dCQUN6Qix3QkFBd0IsR0FBRyxJQUFJLENBQUM7d0JBQ2hDLElBQU0sYUFBYSxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUM7d0JBQ3RDLElBQU0sV0FBVyxHQUFHLGNBQWMsQ0FBQyxTQUFTLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLENBQUM7d0JBRTFFLElBQU0sZUFBZSxHQUFxQixFQUFFLENBQUM7d0JBQzdDLElBQU0sbUJBQW1CLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDOzRCQUM3QyxTQUFTLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQzs0QkFDbEMsZ0ZBQWdGOzRCQUNoRix1RkFBdUY7NEJBQ3ZGLHNCQUFzQjs0QkFDdEIsU0FBUyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO3dCQUU5RCxJQUFJLENBQUMsYUFBYSxDQUFDLDBCQUEwQixDQUN6QyxXQUFXLEVBQUUsYUFBYSxFQUFFLFNBQVMsQ0FBQyxVQUFVLEVBQUUsbUJBQW1CLEVBQUUsRUFBRSxFQUN6RSx3QkFBd0IsRUFBRSxlQUFlLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO3dCQUNwRSxpQkFBaUIsQ0FBQyxJQUFJLE9BQXRCLGlCQUFpQiwyQ0FBUyxlQUFlLENBQUMsR0FBRyxDQUN6QyxVQUFBLENBQUMsSUFBSSxPQUFBLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsRUFBckUsQ0FBcUUsQ0FBQyxJQUFFO3FCQUNsRjt5QkFBTTt3QkFDTCxnRUFBZ0U7d0JBQ2hFLFVBQVUsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUM1QixpQkFBaUIsRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFFLGdCQUFnQixFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsVUFBVSxDQUFDLENBQUM7cUJBQzdGO29CQUVELElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxpQkFBaUIsRUFBRTt3QkFDckMsOERBQThEO3dCQUM5RCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztxQkFDakQ7aUJBQ0Y7Ozs7Ozs7OztZQUVELElBQU0sUUFBUSxHQUNWLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUVoRyxJQUFJLGFBQStCLENBQUM7WUFDcEMsSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLEtBQUsseUNBQW9CLENBQUMsVUFBVSxFQUFFO2dCQUM3RCxpQkFBaUI7Z0JBQ2pCLElBQUksT0FBTyxDQUFDLFFBQVE7b0JBQ2hCLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQ25CLFVBQUMsSUFBZSxJQUFLLE9BQUEsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBNUMsQ0FBNEMsQ0FBQyxFQUFFO29CQUMxRSxJQUFJLENBQUMsV0FBVyxDQUFDLDJDQUEyQyxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztpQkFDbkY7Z0JBQ0QsSUFBTSxRQUFRLEdBQUcsZ0JBQWdCLENBQUMsVUFBVSxDQUFDO2dCQUM3QyxJQUFNLEtBQUssR0FBc0IsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSxLQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxFQUF6QixDQUF5QixDQUFDLENBQUM7Z0JBQ3RGLGFBQWEsR0FBRyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFFakYsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUN4QztpQkFBTSxJQUFJLGlCQUFpQixFQUFFO2dCQUM1QixrQkFBa0I7Z0JBQ2xCLElBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFLGFBQWEsQ0FBQyxDQUFDO2dCQUVwRixhQUFhLEdBQUcsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUMxQixPQUFPLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxLQUFLLENBQUMsS0FBSyxFQUFFLFdBQVcsRUFBRSxFQUFDLDRCQUE0QixDQUFDLEVBQ2xGLFFBQVEsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLGVBQWUsRUFDNUUsT0FBTyxDQUFDLGFBQWEsRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDMUM7aUJBQU07Z0JBQ0wsSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUUsYUFBYSxDQUFDLENBQUM7Z0JBQ3BGLGFBQWEsR0FBRyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQ3pCLE9BQU8sQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLEtBQUssQ0FBQyxLQUFLLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQ3hFLE9BQU8sQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLGVBQWUsRUFBRSxPQUFPLENBQUMsYUFBYSxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUN2RjtZQUVELElBQUksd0JBQXdCLEVBQUU7Z0JBQzVCLHlGQUF5RjtnQkFDekYsZ0NBQWdDO2dCQUNoQyw0RkFBNEY7Z0JBQzVGLDBEQUEwRDtnQkFDMUQsSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGFBQWEsRUFBRSx3QkFBd0IsRUFBRSxhQUFhLENBQUMsQ0FBQztnQkFDN0YsSUFBTSxlQUFhLEdBQXlDLEVBQUUsQ0FBQztnQkFDL0QsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSxlQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUF4QixDQUF3QixDQUFDLENBQUM7Z0JBQ3hELEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQUEsSUFBSSxJQUFJLE9BQUEsZUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBeEIsQ0FBd0IsQ0FBQyxDQUFDO2dCQUN0RCxJQUFNLFlBQVksR0FBRyxhQUFhLFlBQVksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUNyRDt3QkFDRSxVQUFVLEVBQUUsYUFBYSxDQUFDLFVBQVU7d0JBQ3BDLE1BQU0sRUFBRSxhQUFhLENBQUMsTUFBTTt3QkFDNUIsT0FBTyxFQUFFLGFBQWEsQ0FBQyxPQUFPO3FCQUMvQixDQUFDLENBQUM7b0JBQ0gsRUFBQyxVQUFVLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBQyxDQUFDO2dCQUU5QywyRkFBMkY7Z0JBQzNGLDJGQUEyRjtnQkFDM0YseUVBQXlFO2dCQUN6RSxJQUFNLE1BQUksR0FBRyxpQkFBaUIsSUFBSSxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO2dCQUUvRSwrQkFBK0I7Z0JBQy9CLGFBQWEsR0FBRyxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQ3pCLGFBQXVDLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQyxVQUFVLEVBQ3RFLFlBQVksQ0FBQyxNQUFNLEVBQUUsWUFBWSxDQUFDLE9BQU8sRUFBRSxlQUFhLEVBQUUsQ0FBQyxhQUFhLENBQUMsRUFDekUsRUFBQyxtQkFBbUIsQ0FBQyxFQUFFLGlCQUFpQixFQUFFLE9BQU8sQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLGVBQWUsRUFDckYsT0FBTyxDQUFDLGFBQWEsRUFBRSxNQUFJLENBQUMsQ0FBQzthQUNsQztZQUNELElBQUksaUJBQWlCLEVBQUU7Z0JBQ3JCLElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO2FBQzFCO1lBQ0QsT0FBTyxhQUFhLENBQUM7UUFDdkIsQ0FBQztRQUVELHdDQUFjLEdBQWQsVUFBZSxTQUF5QjtZQUN0QyxPQUFPLElBQUksQ0FBQyxDQUFDLGFBQWEsQ0FDdEIsU0FBUyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxVQUFVLEVBQUUsU0FBUyxDQUFDLE9BQU8sRUFDeEUsU0FBUyxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDM0MsQ0FBQztRQUVELG1DQUFTLEdBQVQsVUFBVSxJQUFlO1lBQ3ZCLE9BQU8sSUFBSSxDQUFDLDJCQUEyQixDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbEYsQ0FBQztRQUVELHdDQUFjLEdBQWQsVUFBZSxTQUF5QjtZQUF4QyxpQkFrQ0M7WUFqQ0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUU7Z0JBQ25CLDZDQUE2QztnQkFDN0Msc0NBQXNDO2dCQUN0QyxPQUFPLElBQUksQ0FBQzthQUNiO1lBQ0QsSUFBSSxDQUFDLHFCQUFjLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUNuQyxNQUFNLElBQUksS0FBSyxDQUFDLG9CQUFpQixTQUFTLENBQUMsSUFBSSxDQUFDLFdBQVcsb0NBQ3ZELFNBQVMsQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLDZCQUF3QixDQUFDLENBQUM7YUFDOUQ7WUFDRCxJQUFNLE9BQU8sR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDO1lBQy9CLElBQU0sSUFBSSxHQUFrQyxFQUFFLENBQUM7WUFDL0MsSUFBTSxZQUFZLEdBQXlDLEVBQUUsQ0FBQztZQUM5RCw0REFBNEQ7WUFDNUQsK0RBQStEO1lBQy9ELHFEQUFxRDtZQUNyRCxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBQSxHQUFHO2dCQUMzQyxJQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUN4QyxJQUFJLEdBQUcsQ0FBQyxVQUFVLENBQUMsMEJBQW1CLENBQUMsRUFBRTtvQkFDdkMsMkZBQTJGO29CQUMzRiwwRkFBMEY7b0JBQzFGLDBGQUEwRjtvQkFDMUYsc0ZBQXNGO29CQUN0Rix3RkFBd0Y7b0JBQ3hGLElBQU0sWUFBWSxHQUFHLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFFaEMsSUFBTSxHQUFHLEdBQUcsS0FBSSxDQUFDLGFBQWEsQ0FBQyw0QkFBNEIsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQztvQkFFMUYsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2lCQUM3RDtxQkFBTTtvQkFDTCxZQUFZLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSSxDQUFDLDJCQUEyQixDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2lCQUNwRjtZQUNILENBQUMsQ0FBQyxDQUFDO1lBQ0gsT0FBTyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxTQUFTLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3RFLENBQUM7UUFFRCw0Q0FBa0IsR0FBbEIsVUFBbUIsYUFBaUM7WUFDbEQsT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDO1FBRUQsc0NBQVksR0FBWixVQUFhLE9BQXFCO1lBQ2hDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsRUFBRTtnQkFDcEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLElBQUksRUFBRSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO2FBQ2hGO1lBQ0QsT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDO1FBRUQsb0VBQW9FO1FBQzVELDJDQUFpQixHQUF6QixVQUNJLFdBQW1CLEVBQUUsVUFBNEIsRUFDakQsYUFBNkM7WUFGakQsaUJBd0JDO1lBcEJDLElBQU0sS0FBSyxHQUF1QixFQUFFLENBQUM7WUFDckMsSUFBTSxPQUFPLEdBQXNCLEVBQUUsQ0FBQztZQUV0QyxVQUFVLENBQUMsT0FBTyxDQUFDLFVBQUEsSUFBSTtnQkFDckIsSUFBTSxJQUFJLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDdEMsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO29CQUNsQixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLGFBQWEsQ0FDNUIsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sSUFBSSxFQUFFLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQ3RGLElBQUksQ0FBQyxDQUFDLENBQUM7aUJBQ1o7cUJBQU07b0JBQ0wsbUVBQW1FO29CQUNuRSxtRUFBbUU7b0JBQ25FLGtFQUFrRTtvQkFDbEUsSUFBTSxHQUFHLEdBQUcsS0FBSSxDQUFDLGFBQWEsQ0FBQywwQkFBMEIsQ0FDckQsV0FBVyxFQUFFLElBQUksRUFBRSxvQkFBb0IsQ0FBQyxJQUFJLEVBQUUscUJBQXFCLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQy9FLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztpQkFDbEU7WUFDSCxDQUFDLENBQUMsQ0FBQztZQUVILE9BQU8sRUFBQyxLQUFLLE9BQUEsRUFBRSxPQUFPLFNBQUEsRUFBQyxDQUFDO1FBQzFCLENBQUM7UUFFTyx3Q0FBYyxHQUF0QixVQUNJLGlCQUEwQixFQUFFLFNBQXlCLEVBQUUsbUJBQStCLEVBQ3RGLGdCQUFrQyxFQUFFLFdBQTJCLEVBQUUsU0FBdUIsRUFDeEYsVUFBeUI7WUFDM0IsSUFBTSxJQUFJLEdBQUcsc0JBQXNCLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3BELElBQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUM7WUFDOUIsSUFBTSxPQUFPLEdBQUcsU0FBUyxDQUFDLFVBQVUsQ0FBQztZQUNyQyxJQUFNLGNBQWMsR0FDaEIsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztZQUVsRixTQUFTLGFBQWEsQ0FBQyxPQUF3QixFQUFFLE1BQWMsRUFBRSxVQUFrQjtnQkFDakYsMEZBQTBGO2dCQUMxRix3Q0FBd0M7Z0JBQ3hDLElBQU0sdUJBQXVCLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztnQkFDcEUsSUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyx1QkFBdUIsQ0FBQyxDQUFDO2dCQUNuRixJQUFNLFVBQVUsR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDMUQsT0FBTyxJQUFJLDRCQUFlLENBQUMsWUFBWSxFQUFFLFVBQVUsRUFBRSxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDakYsQ0FBQztZQUVELElBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUUvQyxJQUFJLFNBQVMsRUFBRTtnQkFDYixJQUFJLFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxJQUFJLEVBQUU7b0JBQ2xDLElBQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQztvQkFDM0MsSUFBTSxTQUFPLEdBQUcsYUFBYSxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsV0FBVyxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUM7b0JBQzNFLElBQUksQ0FBQyxhQUFhLENBQUMsb0JBQW9CLENBQ25DLFVBQVUsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxjQUFjLEVBQUUsU0FBUyxDQUFDLFNBQVMsRUFDdEUsbUJBQW1CLEVBQUUsZ0JBQWdCLEVBQUUsU0FBTyxDQUFDLENBQUM7aUJBRXJEO3FCQUFNLElBQUksU0FBUyxDQUFDLFVBQVUsQ0FBQyxFQUFFO29CQUNoQyxJQUFJLGlCQUFpQixFQUFFO3dCQUNyQixJQUFNLFVBQVUsR0FBRyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUM7d0JBQzNDLElBQU0sU0FBTyxHQUFHLGFBQWEsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLFVBQVUsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDO3dCQUMxRSxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLFNBQU8sRUFBRSxTQUFTLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO3FCQUN6Rjt5QkFBTTt3QkFDTCxJQUFJLENBQUMsV0FBVyxDQUFDLHFEQUFtRCxFQUFFLE9BQU8sQ0FBQyxDQUFDO3FCQUNoRjtpQkFFRjtxQkFBTSxJQUFJLFNBQVMsQ0FBQyxVQUFVLENBQUMsRUFBRTtvQkFDaEMsSUFBTSxVQUFVLEdBQUcsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDO29CQUMzQyxJQUFNLFNBQU8sR0FBRyxhQUFhLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxVQUFVLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQztvQkFDMUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxTQUFPLEVBQUUsU0FBUyxDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQztpQkFDM0Y7cUJBQU0sSUFBSSxTQUFTLENBQUMsU0FBUyxDQUFDLEVBQUU7b0JBQy9CLElBQU0sTUFBTSxHQUFrQixFQUFFLENBQUM7b0JBQ2pDLElBQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQztvQkFDM0MsSUFBTSxTQUFPLEdBQUcsYUFBYSxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsU0FBUyxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUM7b0JBQ3pFLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUN6QixVQUFVLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxTQUFTLENBQUMsU0FBUyxJQUFJLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLEVBQ3ZGLFNBQU8sQ0FBQyxDQUFDO29CQUNiLFNBQVMsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUM7aUJBQ2hDO3FCQUFNLElBQUksU0FBUyxDQUFDLGFBQWEsQ0FBQyxFQUFFO29CQUNuQyxJQUFNLFVBQVUsR0FBRyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUM7b0JBQzNDLElBQU0sU0FBTyxHQUFHLGFBQWEsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLGFBQWEsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDO29CQUM3RSxJQUFJLENBQUMsYUFBYSxDQUFDLG9CQUFvQixDQUNuQyxVQUFVLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsY0FBYyxFQUFFLFNBQVMsQ0FBQyxTQUFTLEVBQ3RFLG1CQUFtQixFQUFFLGdCQUFnQixFQUFFLFNBQU8sQ0FBQyxDQUFDO29CQUNwRCxJQUFJLENBQUMsb0JBQW9CLENBQ3JCLFVBQVUsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLFNBQVMsQ0FBQyxTQUFTLEVBQUUsbUJBQW1CLEVBQUUsV0FBVyxFQUNqRixTQUFPLENBQUMsQ0FBQztpQkFDZDtxQkFBTSxJQUFJLFNBQVMsQ0FBQyxTQUFTLENBQUMsRUFBRTtvQkFDL0IsSUFBTSxTQUFPLEdBQUcsYUFBYSxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7b0JBQ2pELElBQUksQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLENBQy9CLElBQUksRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLGNBQWMsRUFBRSxTQUFTLENBQUMsU0FBUyxFQUFFLG1CQUFtQixFQUM5RSxnQkFBZ0IsRUFBRSxTQUFPLENBQUMsQ0FBQztpQkFDaEM7Z0JBQ0QsT0FBTyxJQUFJLENBQUM7YUFDYjtZQUVELDRFQUE0RTtZQUM1RSw2QkFBNkI7WUFDN0IsSUFBSSxNQUFNLEdBQXNDLElBQUksQ0FBQztZQUNyRCxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDcEQsTUFBTSxHQUFHLGNBQWMsQ0FBQyxVQUFVLENBQUM7YUFDcEM7aUJBQU0sSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ3pELE1BQU0sR0FBRyxjQUFjLENBQUMsUUFBUSxDQUFDO2FBQ2xDO2lCQUFNLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUN0RCxNQUFNLEdBQUcsY0FBYyxDQUFDLEtBQUssQ0FBQzthQUMvQjtZQUNELElBQUksTUFBTSxLQUFLLElBQUk7Z0JBQ2YsdUVBQXVFO2dCQUN2RSx1RUFBdUU7Z0JBQ3ZFLG1EQUFtRDtnQkFDbkQsNkRBQTZEO2dCQUM3RCxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFO2dCQUN0RixJQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDeEYsSUFBTSxTQUFPLEdBQUcsYUFBYSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFDO2dCQUNqRSxJQUFJLE1BQU0sQ0FBQyxLQUFLLEtBQUssY0FBYyxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUU7b0JBQ3BELElBQUksQ0FBQyxhQUFhLENBQUMsb0JBQW9CLENBQ25DLFVBQVUsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxjQUFjLEVBQUUsU0FBUyxDQUFDLFNBQVMsRUFDdEUsbUJBQW1CLEVBQUUsZ0JBQWdCLEVBQUUsU0FBTyxDQUFDLENBQUM7b0JBQ3BELElBQUksQ0FBQyxvQkFBb0IsQ0FDckIsVUFBVSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsU0FBUyxDQUFDLFNBQVMsRUFBRSxtQkFBbUIsRUFBRSxXQUFXLEVBQ2pGLFNBQU8sQ0FBQyxDQUFDO2lCQUNkO3FCQUFNLElBQUksTUFBTSxDQUFDLEtBQUssS0FBSyxjQUFjLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRTtvQkFDekQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxvQkFBb0IsQ0FDbkMsVUFBVSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLGNBQWMsRUFBRSxTQUFTLENBQUMsU0FBUyxFQUN0RSxtQkFBbUIsRUFBRSxnQkFBZ0IsRUFBRSxTQUFPLENBQUMsQ0FBQztpQkFDckQ7cUJBQU07b0JBQ0wsSUFBTSxNQUFNLEdBQWtCLEVBQUUsQ0FBQztvQkFDakMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQ3pCLFVBQVUsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLFNBQVMsQ0FBQyxTQUFTLElBQUksT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sRUFDdkYsU0FBTyxDQUFDLENBQUM7b0JBQ2IsU0FBUyxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQztpQkFDaEM7Z0JBRUQsT0FBTyxJQUFJLENBQUM7YUFDYjtZQUVELDZCQUE2QjtZQUM3QixJQUFNLE9BQU8sR0FBRyxhQUFhLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDOUQsSUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQywwQkFBMEIsQ0FDNUQsSUFBSSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsU0FBUyxDQUFDLFNBQVMsRUFBRSxtQkFBbUIsRUFBRSxnQkFBZ0IsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUMvRixPQUFPLFVBQVUsQ0FBQztRQUNwQixDQUFDO1FBRU8scURBQTJCLEdBQW5DLFVBQ0ksS0FBYSxFQUFFLFVBQTJCLEVBQUUsSUFBb0I7WUFDbEUsSUFBTSxXQUFXLEdBQUcsOEJBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN2QyxJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLGtCQUFrQixDQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUM1RSxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDOUYsQ0FBQztRQUVPLHVDQUFhLEdBQXJCLFVBQ0ksVUFBa0IsRUFBRSxLQUFhLEVBQUUsVUFBMkIsRUFBRSxPQUF3QixFQUN4RixTQUFvQyxFQUFFLFNBQXVCO1lBQy9ELElBQUksVUFBVSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtnQkFDaEMsSUFBSSxDQUFDLFdBQVcsQ0FBQyx3Q0FBc0MsRUFBRSxVQUFVLENBQUMsQ0FBQzthQUN0RTtpQkFBTSxJQUFJLFVBQVUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUNsQyxJQUFJLENBQUMsV0FBVyxDQUFDLCtCQUErQixFQUFFLFVBQVUsQ0FBQyxDQUFDO2FBQy9EO1lBRUQsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7UUFDcEYsQ0FBQztRQUVPLHdDQUFjLEdBQXRCLFVBQ0ksVUFBa0IsRUFBRSxLQUFhLEVBQUUsVUFBMkIsRUFBRSxPQUF3QixFQUN4RixTQUFvQyxFQUFFLFVBQXlCO1lBQ2pFLElBQUksVUFBVSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtnQkFDaEMsSUFBSSxDQUFDLFdBQVcsQ0FBQyx5Q0FBdUMsRUFBRSxVQUFVLENBQUMsQ0FBQzthQUN2RTtpQkFBTSxJQUFJLFVBQVUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUNsQyxJQUFJLENBQUMsV0FBVyxDQUFDLGdDQUFnQyxFQUFFLFVBQVUsQ0FBQyxDQUFDO2FBQ2hFO2lCQUFNLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxVQUFBLFNBQVMsSUFBSSxPQUFBLFNBQVMsQ0FBQyxJQUFJLEtBQUssVUFBVSxFQUE3QixDQUE2QixDQUFDLEVBQUU7Z0JBQ3RFLElBQUksQ0FBQyxXQUFXLENBQUMsa0JBQWUsVUFBVSxpQ0FBNkIsRUFBRSxVQUFVLENBQUMsQ0FBQzthQUN0RjtZQUVELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBQ3RGLENBQUM7UUFFTyw4Q0FBb0IsR0FBNUIsVUFDSSxJQUFZLEVBQUUsVUFBa0IsRUFBRSxVQUEyQixFQUM3RCxTQUFvQyxFQUFFLG9CQUFnQyxFQUN0RSxXQUEyQixFQUFFLE9BQXdCO1lBQ3ZELElBQU0sTUFBTSxHQUFrQixFQUFFLENBQUM7WUFDakMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQ3RCLElBQUksV0FBUSxFQUFLLFVBQVUsWUFBUyxFQUFFLFVBQVUsRUFBRSxTQUFTLElBQUksVUFBVSxFQUM1RSxvQkFBb0IsRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDM0MsU0FBUyxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQztRQUNqQyxDQUFDO1FBRU8scUNBQVcsR0FBbkIsVUFDSSxPQUFlLEVBQUUsVUFBMkIsRUFDNUMsS0FBOEM7WUFBOUMsc0JBQUEsRUFBQSxRQUF5Qiw0QkFBZSxDQUFDLEtBQUs7WUFDaEQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSx1QkFBVSxDQUFDLFVBQVUsRUFBRSxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUMvRCxDQUFDO1FBQ0gsc0JBQUM7SUFBRCxDQUFDLEFBaGFELElBZ2FDO0lBRUQ7UUFBQTtRQXdDQSxDQUFDO1FBdkNDLHlDQUFZLEdBQVosVUFBYSxHQUFpQjtZQUM1QixJQUFNLGdCQUFnQixHQUFHLG9DQUFlLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDOUMsSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLEtBQUsseUNBQW9CLENBQUMsTUFBTTtnQkFDckQsZ0JBQWdCLENBQUMsSUFBSSxLQUFLLHlDQUFvQixDQUFDLEtBQUs7Z0JBQ3BELGdCQUFnQixDQUFDLElBQUksS0FBSyx5Q0FBb0IsQ0FBQyxVQUFVLEVBQUU7Z0JBQzdELHlDQUF5QztnQkFDekMsZ0VBQWdFO2dCQUNoRSx1QkFBdUI7Z0JBQ3ZCLE9BQU8sSUFBSSxDQUFDO2FBQ2I7WUFFRCxJQUFNLFFBQVEsR0FBYSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ25FLE9BQU8sSUFBSSxDQUFDLENBQUMsT0FBTyxDQUNoQixHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxLQUFLLENBQXNCO1lBQzdELFlBQVksQ0FBQSxFQUFFLEVBQUUsYUFBYSxDQUFBLEVBQUUsRUFBRSxRQUFRLEVBQUcsZ0JBQWdCLENBQUEsRUFBRSxFQUFFLEdBQUcsQ0FBQyxVQUFVLEVBQzlFLEdBQUcsQ0FBQyxlQUFlLEVBQUUsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQzlDLENBQUM7UUFFRCx5Q0FBWSxHQUFaLFVBQWEsT0FBcUI7WUFDaEMsT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDO1FBRUQsMkNBQWMsR0FBZCxVQUFlLFNBQXlCO1lBQ3RDLE9BQU8sSUFBSSxDQUFDLENBQUMsYUFBYSxDQUN0QixTQUFTLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLFVBQVUsRUFBRSxTQUFTLENBQUMsT0FBTyxFQUN4RSxTQUFTLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMzQyxDQUFDO1FBRUQsc0NBQVMsR0FBVCxVQUFVLElBQWU7WUFDdkIsT0FBTyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDakQsQ0FBQztRQUVELDJDQUFjLEdBQWQsVUFBZSxTQUF5QjtZQUN0QyxPQUFPLElBQUksQ0FBQztRQUNkLENBQUM7UUFFRCwrQ0FBa0IsR0FBbEIsVUFBbUIsYUFBaUM7WUFDbEQsT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDO1FBQ0gseUJBQUM7SUFBRCxDQUFDLEFBeENELElBd0NDO0lBRUQsSUFBTSxvQkFBb0IsR0FBRyxJQUFJLGtCQUFrQixFQUFFLENBQUM7SUFFdEQsU0FBUyxzQkFBc0IsQ0FBQyxRQUFnQjtRQUM5QyxPQUFPLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztJQUNyRSxDQUFDO0lBRUQsU0FBUyxTQUFTLENBQUMsTUFBcUIsRUFBRSxXQUEyQjtRQUNuRSxXQUFXLENBQUMsSUFBSSxPQUFoQixXQUFXLDJDQUFTLE1BQU0sQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsRUFBL0IsQ0FBK0IsQ0FBQyxJQUFFO0lBQ3hFLENBQUM7SUFFRCxTQUFTLGVBQWUsQ0FBQyxJQUFlO1FBQ3RDLE9BQU8sSUFBSSxZQUFZLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDO0lBQ3BFLENBQUM7SUFFRCxTQUFTLGFBQWEsQ0FBQyxJQUFlO1FBQ3BDLE9BQU8sSUFBSSxZQUFZLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDdEMsQ0FBQztJQUVELFNBQVMsWUFBWSxDQUFDLElBQWtCO1FBQ3RDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxZQUFZLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUMxRSxPQUFPLElBQUksQ0FBQztTQUNiO2FBQU07WUFDTCxPQUFRLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFlLENBQUMsS0FBSyxDQUFDO1NBQzlDO0lBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1BhcnNlZEV2ZW50LCBQYXJzZWRQcm9wZXJ0eSwgUGFyc2VkVmFyaWFibGV9IGZyb20gJy4uL2V4cHJlc3Npb25fcGFyc2VyL2FzdCc7XG5pbXBvcnQgKiBhcyBpMThuIGZyb20gJy4uL2kxOG4vaTE4bl9hc3QnO1xuaW1wb3J0ICogYXMgaHRtbCBmcm9tICcuLi9tbF9wYXJzZXIvYXN0JztcbmltcG9ydCB7cmVwbGFjZU5nc3B9IGZyb20gJy4uL21sX3BhcnNlci9odG1sX3doaXRlc3BhY2VzJztcbmltcG9ydCB7aXNOZ1RlbXBsYXRlfSBmcm9tICcuLi9tbF9wYXJzZXIvdGFncyc7XG5pbXBvcnQge1BhcnNlRXJyb3IsIFBhcnNlRXJyb3JMZXZlbCwgUGFyc2VTb3VyY2VTcGFufSBmcm9tICcuLi9wYXJzZV91dGlsJztcbmltcG9ydCB7aXNTdHlsZVVybFJlc29sdmFibGV9IGZyb20gJy4uL3N0eWxlX3VybF9yZXNvbHZlcic7XG5pbXBvcnQge0JpbmRpbmdQYXJzZXJ9IGZyb20gJy4uL3RlbXBsYXRlX3BhcnNlci9iaW5kaW5nX3BhcnNlcic7XG5pbXBvcnQge1ByZXBhcnNlZEVsZW1lbnRUeXBlLCBwcmVwYXJzZUVsZW1lbnR9IGZyb20gJy4uL3RlbXBsYXRlX3BhcnNlci90ZW1wbGF0ZV9wcmVwYXJzZXInO1xuXG5pbXBvcnQgKiBhcyB0IGZyb20gJy4vcjNfYXN0JztcbmltcG9ydCB7STE4Tl9JQ1VfVkFSX1BSRUZJWCwgaXNJMThuUm9vdE5vZGV9IGZyb20gJy4vdmlldy9pMThuL3V0aWwnO1xuXG5jb25zdCBCSU5EX05BTUVfUkVHRVhQID0gL14oPzooYmluZC0pfChsZXQtKXwocmVmLXwjKXwob24tKXwoYmluZG9uLSl8KEApKSguKikkLztcblxuLy8gR3JvdXAgMSA9IFwiYmluZC1cIlxuY29uc3QgS1dfQklORF9JRFggPSAxO1xuLy8gR3JvdXAgMiA9IFwibGV0LVwiXG5jb25zdCBLV19MRVRfSURYID0gMjtcbi8vIEdyb3VwIDMgPSBcInJlZi0vI1wiXG5jb25zdCBLV19SRUZfSURYID0gMztcbi8vIEdyb3VwIDQgPSBcIm9uLVwiXG5jb25zdCBLV19PTl9JRFggPSA0O1xuLy8gR3JvdXAgNSA9IFwiYmluZG9uLVwiXG5jb25zdCBLV19CSU5ET05fSURYID0gNTtcbi8vIEdyb3VwIDYgPSBcIkBcIlxuY29uc3QgS1dfQVRfSURYID0gNjtcbi8vIEdyb3VwIDcgPSB0aGUgaWRlbnRpZmllciBhZnRlciBcImJpbmQtXCIsIFwibGV0LVwiLCBcInJlZi0vI1wiLCBcIm9uLVwiLCBcImJpbmRvbi1cIiBvciBcIkBcIlxuY29uc3QgSURFTlRfS1dfSURYID0gNztcblxuY29uc3QgQklORElOR19ERUxJTVMgPSB7XG4gIEJBTkFOQV9CT1g6IHtzdGFydDogJ1soJywgZW5kOiAnKV0nfSxcbiAgUFJPUEVSVFk6IHtzdGFydDogJ1snLCBlbmQ6ICddJ30sXG4gIEVWRU5UOiB7c3RhcnQ6ICcoJywgZW5kOiAnKSd9LFxufTtcblxuY29uc3QgVEVNUExBVEVfQVRUUl9QUkVGSVggPSAnKic7XG5cbi8vIFJlc3VsdCBvZiB0aGUgaHRtbCBBU1QgdG8gSXZ5IEFTVCB0cmFuc2Zvcm1hdGlvblxuZXhwb3J0IGludGVyZmFjZSBSZW5kZXIzUGFyc2VSZXN1bHQge1xuICBub2RlczogdC5Ob2RlW107XG4gIGVycm9yczogUGFyc2VFcnJvcltdO1xuICBzdHlsZXM6IHN0cmluZ1tdO1xuICBzdHlsZVVybHM6IHN0cmluZ1tdO1xuICBuZ0NvbnRlbnRTZWxlY3RvcnM6IHN0cmluZ1tdO1xuICAvLyBXaWxsIGJlIGRlZmluZWQgaWYgYFJlbmRlcjNQYXJzZU9wdGlvbnNbJ2NvbGxlY3RDb21tZW50Tm9kZXMnXWAgaXMgdHJ1ZVxuICBjb21tZW50Tm9kZXM/OiB0LkNvbW1lbnRbXTtcbn1cblxuaW50ZXJmYWNlIFJlbmRlcjNQYXJzZU9wdGlvbnMge1xuICBjb2xsZWN0Q29tbWVudE5vZGVzOiBib29sZWFuO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaHRtbEFzdFRvUmVuZGVyM0FzdChcbiAgICBodG1sTm9kZXM6IGh0bWwuTm9kZVtdLCBiaW5kaW5nUGFyc2VyOiBCaW5kaW5nUGFyc2VyLFxuICAgIG9wdGlvbnM6IFJlbmRlcjNQYXJzZU9wdGlvbnMpOiBSZW5kZXIzUGFyc2VSZXN1bHQge1xuICBjb25zdCB0cmFuc2Zvcm1lciA9IG5ldyBIdG1sQXN0VG9JdnlBc3QoYmluZGluZ1BhcnNlciwgb3B0aW9ucyk7XG4gIGNvbnN0IGl2eU5vZGVzID0gaHRtbC52aXNpdEFsbCh0cmFuc2Zvcm1lciwgaHRtbE5vZGVzKTtcblxuICAvLyBFcnJvcnMgbWlnaHQgb3JpZ2luYXRlIGluIGVpdGhlciB0aGUgYmluZGluZyBwYXJzZXIgb3IgdGhlIGh0bWwgdG8gaXZ5IHRyYW5zZm9ybWVyXG4gIGNvbnN0IGFsbEVycm9ycyA9IGJpbmRpbmdQYXJzZXIuZXJyb3JzLmNvbmNhdCh0cmFuc2Zvcm1lci5lcnJvcnMpO1xuXG4gIGNvbnN0IHJlc3VsdDogUmVuZGVyM1BhcnNlUmVzdWx0ID0ge1xuICAgIG5vZGVzOiBpdnlOb2RlcyxcbiAgICBlcnJvcnM6IGFsbEVycm9ycyxcbiAgICBzdHlsZVVybHM6IHRyYW5zZm9ybWVyLnN0eWxlVXJscyxcbiAgICBzdHlsZXM6IHRyYW5zZm9ybWVyLnN0eWxlcyxcbiAgICBuZ0NvbnRlbnRTZWxlY3RvcnM6IHRyYW5zZm9ybWVyLm5nQ29udGVudFNlbGVjdG9yc1xuICB9O1xuICBpZiAob3B0aW9ucy5jb2xsZWN0Q29tbWVudE5vZGVzKSB7XG4gICAgcmVzdWx0LmNvbW1lbnROb2RlcyA9IHRyYW5zZm9ybWVyLmNvbW1lbnROb2RlcztcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5jbGFzcyBIdG1sQXN0VG9JdnlBc3QgaW1wbGVtZW50cyBodG1sLlZpc2l0b3Ige1xuICBlcnJvcnM6IFBhcnNlRXJyb3JbXSA9IFtdO1xuICBzdHlsZXM6IHN0cmluZ1tdID0gW107XG4gIHN0eWxlVXJsczogc3RyaW5nW10gPSBbXTtcbiAgbmdDb250ZW50U2VsZWN0b3JzOiBzdHJpbmdbXSA9IFtdO1xuICAvLyBUaGlzIGFycmF5IHdpbGwgYmUgcG9wdWxhdGVkIGlmIGBSZW5kZXIzUGFyc2VPcHRpb25zWydjb2xsZWN0Q29tbWVudE5vZGVzJ11gIGlzIHRydWVcbiAgY29tbWVudE5vZGVzOiB0LkNvbW1lbnRbXSA9IFtdO1xuICBwcml2YXRlIGluSTE4bkJsb2NrOiBib29sZWFuID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBiaW5kaW5nUGFyc2VyOiBCaW5kaW5nUGFyc2VyLCBwcml2YXRlIG9wdGlvbnM6IFJlbmRlcjNQYXJzZU9wdGlvbnMpIHt9XG5cbiAgLy8gSFRNTCB2aXNpdG9yXG4gIHZpc2l0RWxlbWVudChlbGVtZW50OiBodG1sLkVsZW1lbnQpOiB0Lk5vZGV8bnVsbCB7XG4gICAgY29uc3QgaXNJMThuUm9vdEVsZW1lbnQgPSBpc0kxOG5Sb290Tm9kZShlbGVtZW50LmkxOG4pO1xuICAgIGlmIChpc0kxOG5Sb290RWxlbWVudCkge1xuICAgICAgaWYgKHRoaXMuaW5JMThuQmxvY2spIHtcbiAgICAgICAgdGhpcy5yZXBvcnRFcnJvcihcbiAgICAgICAgICAgICdDYW5ub3QgbWFyayBhbiBlbGVtZW50IGFzIHRyYW5zbGF0YWJsZSBpbnNpZGUgb2YgYSB0cmFuc2xhdGFibGUgc2VjdGlvbi4gUGxlYXNlIHJlbW92ZSB0aGUgbmVzdGVkIGkxOG4gbWFya2VyLicsXG4gICAgICAgICAgICBlbGVtZW50LnNvdXJjZVNwYW4pO1xuICAgICAgfVxuICAgICAgdGhpcy5pbkkxOG5CbG9jayA9IHRydWU7XG4gICAgfVxuICAgIGNvbnN0IHByZXBhcnNlZEVsZW1lbnQgPSBwcmVwYXJzZUVsZW1lbnQoZWxlbWVudCk7XG4gICAgaWYgKHByZXBhcnNlZEVsZW1lbnQudHlwZSA9PT0gUHJlcGFyc2VkRWxlbWVudFR5cGUuU0NSSVBUKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9IGVsc2UgaWYgKHByZXBhcnNlZEVsZW1lbnQudHlwZSA9PT0gUHJlcGFyc2VkRWxlbWVudFR5cGUuU1RZTEUpIHtcbiAgICAgIGNvbnN0IGNvbnRlbnRzID0gdGV4dENvbnRlbnRzKGVsZW1lbnQpO1xuICAgICAgaWYgKGNvbnRlbnRzICE9PSBudWxsKSB7XG4gICAgICAgIHRoaXMuc3R5bGVzLnB1c2goY29udGVudHMpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSBlbHNlIGlmIChcbiAgICAgICAgcHJlcGFyc2VkRWxlbWVudC50eXBlID09PSBQcmVwYXJzZWRFbGVtZW50VHlwZS5TVFlMRVNIRUVUICYmXG4gICAgICAgIGlzU3R5bGVVcmxSZXNvbHZhYmxlKHByZXBhcnNlZEVsZW1lbnQuaHJlZkF0dHIpKSB7XG4gICAgICB0aGlzLnN0eWxlVXJscy5wdXNoKHByZXBhcnNlZEVsZW1lbnQuaHJlZkF0dHIpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8gV2hldGhlciB0aGUgZWxlbWVudCBpcyBhIGA8bmctdGVtcGxhdGU+YFxuICAgIGNvbnN0IGlzVGVtcGxhdGVFbGVtZW50ID0gaXNOZ1RlbXBsYXRlKGVsZW1lbnQubmFtZSk7XG5cbiAgICBjb25zdCBwYXJzZWRQcm9wZXJ0aWVzOiBQYXJzZWRQcm9wZXJ0eVtdID0gW107XG4gICAgY29uc3QgYm91bmRFdmVudHM6IHQuQm91bmRFdmVudFtdID0gW107XG4gICAgY29uc3QgdmFyaWFibGVzOiB0LlZhcmlhYmxlW10gPSBbXTtcbiAgICBjb25zdCByZWZlcmVuY2VzOiB0LlJlZmVyZW5jZVtdID0gW107XG4gICAgY29uc3QgYXR0cmlidXRlczogdC5UZXh0QXR0cmlidXRlW10gPSBbXTtcbiAgICBjb25zdCBpMThuQXR0cnNNZXRhOiB7W2tleTogc3RyaW5nXTogaTE4bi5JMThuTWV0YX0gPSB7fTtcblxuICAgIGNvbnN0IHRlbXBsYXRlUGFyc2VkUHJvcGVydGllczogUGFyc2VkUHJvcGVydHlbXSA9IFtdO1xuICAgIGNvbnN0IHRlbXBsYXRlVmFyaWFibGVzOiB0LlZhcmlhYmxlW10gPSBbXTtcblxuICAgIC8vIFdoZXRoZXIgdGhlIGVsZW1lbnQgaGFzIGFueSAqLWF0dHJpYnV0ZVxuICAgIGxldCBlbGVtZW50SGFzSW5saW5lVGVtcGxhdGUgPSBmYWxzZTtcblxuICAgIGZvciAoY29uc3QgYXR0cmlidXRlIG9mIGVsZW1lbnQuYXR0cnMpIHtcbiAgICAgIGxldCBoYXNCaW5kaW5nID0gZmFsc2U7XG4gICAgICBjb25zdCBub3JtYWxpemVkTmFtZSA9IG5vcm1hbGl6ZUF0dHJpYnV0ZU5hbWUoYXR0cmlidXRlLm5hbWUpO1xuXG4gICAgICAvLyBgKmF0dHJgIGRlZmluZXMgdGVtcGxhdGUgYmluZGluZ3NcbiAgICAgIGxldCBpc1RlbXBsYXRlQmluZGluZyA9IGZhbHNlO1xuXG4gICAgICBpZiAoYXR0cmlidXRlLmkxOG4pIHtcbiAgICAgICAgaTE4bkF0dHJzTWV0YVthdHRyaWJ1dGUubmFtZV0gPSBhdHRyaWJ1dGUuaTE4bjtcbiAgICAgIH1cblxuICAgICAgaWYgKG5vcm1hbGl6ZWROYW1lLnN0YXJ0c1dpdGgoVEVNUExBVEVfQVRUUl9QUkVGSVgpKSB7XG4gICAgICAgIC8vICotYXR0cmlidXRlc1xuICAgICAgICBpZiAoZWxlbWVudEhhc0lubGluZVRlbXBsYXRlKSB7XG4gICAgICAgICAgdGhpcy5yZXBvcnRFcnJvcihcbiAgICAgICAgICAgICAgYENhbid0IGhhdmUgbXVsdGlwbGUgdGVtcGxhdGUgYmluZGluZ3Mgb24gb25lIGVsZW1lbnQuIFVzZSBvbmx5IG9uZSBhdHRyaWJ1dGUgcHJlZml4ZWQgd2l0aCAqYCxcbiAgICAgICAgICAgICAgYXR0cmlidXRlLnNvdXJjZVNwYW4pO1xuICAgICAgICB9XG4gICAgICAgIGlzVGVtcGxhdGVCaW5kaW5nID0gdHJ1ZTtcbiAgICAgICAgZWxlbWVudEhhc0lubGluZVRlbXBsYXRlID0gdHJ1ZTtcbiAgICAgICAgY29uc3QgdGVtcGxhdGVWYWx1ZSA9IGF0dHJpYnV0ZS52YWx1ZTtcbiAgICAgICAgY29uc3QgdGVtcGxhdGVLZXkgPSBub3JtYWxpemVkTmFtZS5zdWJzdHJpbmcoVEVNUExBVEVfQVRUUl9QUkVGSVgubGVuZ3RoKTtcblxuICAgICAgICBjb25zdCBwYXJzZWRWYXJpYWJsZXM6IFBhcnNlZFZhcmlhYmxlW10gPSBbXTtcbiAgICAgICAgY29uc3QgYWJzb2x1dGVWYWx1ZU9mZnNldCA9IGF0dHJpYnV0ZS52YWx1ZVNwYW4gP1xuICAgICAgICAgICAgYXR0cmlidXRlLnZhbHVlU3Bhbi5zdGFydC5vZmZzZXQgOlxuICAgICAgICAgICAgLy8gSWYgdGhlcmUgaXMgbm8gdmFsdWUgc3BhbiB0aGUgYXR0cmlidXRlIGRvZXMgbm90IGhhdmUgYSB2YWx1ZSwgbGlrZSBgYXR0cmAgaW5cbiAgICAgICAgICAgIC8vYDxkaXYgYXR0cj48L2Rpdj5gLiBJbiB0aGlzIGNhc2UsIHBvaW50IHRvIG9uZSBjaGFyYWN0ZXIgYmV5b25kIHRoZSBsYXN0IGNoYXJhY3RlciBvZlxuICAgICAgICAgICAgLy8gdGhlIGF0dHJpYnV0ZSBuYW1lLlxuICAgICAgICAgICAgYXR0cmlidXRlLnNvdXJjZVNwYW4uc3RhcnQub2Zmc2V0ICsgYXR0cmlidXRlLm5hbWUubGVuZ3RoO1xuXG4gICAgICAgIHRoaXMuYmluZGluZ1BhcnNlci5wYXJzZUlubGluZVRlbXBsYXRlQmluZGluZyhcbiAgICAgICAgICAgIHRlbXBsYXRlS2V5LCB0ZW1wbGF0ZVZhbHVlLCBhdHRyaWJ1dGUuc291cmNlU3BhbiwgYWJzb2x1dGVWYWx1ZU9mZnNldCwgW10sXG4gICAgICAgICAgICB0ZW1wbGF0ZVBhcnNlZFByb3BlcnRpZXMsIHBhcnNlZFZhcmlhYmxlcywgdHJ1ZSAvKiBpc0l2eUFzdCAqLyk7XG4gICAgICAgIHRlbXBsYXRlVmFyaWFibGVzLnB1c2goLi4ucGFyc2VkVmFyaWFibGVzLm1hcChcbiAgICAgICAgICAgIHYgPT4gbmV3IHQuVmFyaWFibGUodi5uYW1lLCB2LnZhbHVlLCB2LnNvdXJjZVNwYW4sIHYua2V5U3Bhbiwgdi52YWx1ZVNwYW4pKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBDaGVjayBmb3IgdmFyaWFibGVzLCBldmVudHMsIHByb3BlcnR5IGJpbmRpbmdzLCBpbnRlcnBvbGF0aW9uXG4gICAgICAgIGhhc0JpbmRpbmcgPSB0aGlzLnBhcnNlQXR0cmlidXRlKFxuICAgICAgICAgICAgaXNUZW1wbGF0ZUVsZW1lbnQsIGF0dHJpYnV0ZSwgW10sIHBhcnNlZFByb3BlcnRpZXMsIGJvdW5kRXZlbnRzLCB2YXJpYWJsZXMsIHJlZmVyZW5jZXMpO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWhhc0JpbmRpbmcgJiYgIWlzVGVtcGxhdGVCaW5kaW5nKSB7XG4gICAgICAgIC8vIGRvbid0IGluY2x1ZGUgdGhlIGJpbmRpbmdzIGFzIGF0dHJpYnV0ZXMgYXMgd2VsbCBpbiB0aGUgQVNUXG4gICAgICAgIGF0dHJpYnV0ZXMucHVzaCh0aGlzLnZpc2l0QXR0cmlidXRlKGF0dHJpYnV0ZSkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGNoaWxkcmVuOiB0Lk5vZGVbXSA9XG4gICAgICAgIGh0bWwudmlzaXRBbGwocHJlcGFyc2VkRWxlbWVudC5ub25CaW5kYWJsZSA/IE5PTl9CSU5EQUJMRV9WSVNJVE9SIDogdGhpcywgZWxlbWVudC5jaGlsZHJlbik7XG5cbiAgICBsZXQgcGFyc2VkRWxlbWVudDogdC5Ob2RlfHVuZGVmaW5lZDtcbiAgICBpZiAocHJlcGFyc2VkRWxlbWVudC50eXBlID09PSBQcmVwYXJzZWRFbGVtZW50VHlwZS5OR19DT05URU5UKSB7XG4gICAgICAvLyBgPG5nLWNvbnRlbnQ+YFxuICAgICAgaWYgKGVsZW1lbnQuY2hpbGRyZW4gJiZcbiAgICAgICAgICAhZWxlbWVudC5jaGlsZHJlbi5ldmVyeShcbiAgICAgICAgICAgICAgKG5vZGU6IGh0bWwuTm9kZSkgPT4gaXNFbXB0eVRleHROb2RlKG5vZGUpIHx8IGlzQ29tbWVudE5vZGUobm9kZSkpKSB7XG4gICAgICAgIHRoaXMucmVwb3J0RXJyb3IoYDxuZy1jb250ZW50PiBlbGVtZW50IGNhbm5vdCBoYXZlIGNvbnRlbnQuYCwgZWxlbWVudC5zb3VyY2VTcGFuKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHNlbGVjdG9yID0gcHJlcGFyc2VkRWxlbWVudC5zZWxlY3RBdHRyO1xuICAgICAgY29uc3QgYXR0cnM6IHQuVGV4dEF0dHJpYnV0ZVtdID0gZWxlbWVudC5hdHRycy5tYXAoYXR0ciA9PiB0aGlzLnZpc2l0QXR0cmlidXRlKGF0dHIpKTtcbiAgICAgIHBhcnNlZEVsZW1lbnQgPSBuZXcgdC5Db250ZW50KHNlbGVjdG9yLCBhdHRycywgZWxlbWVudC5zb3VyY2VTcGFuLCBlbGVtZW50LmkxOG4pO1xuXG4gICAgICB0aGlzLm5nQ29udGVudFNlbGVjdG9ycy5wdXNoKHNlbGVjdG9yKTtcbiAgICB9IGVsc2UgaWYgKGlzVGVtcGxhdGVFbGVtZW50KSB7XG4gICAgICAvLyBgPG5nLXRlbXBsYXRlPmBcbiAgICAgIGNvbnN0IGF0dHJzID0gdGhpcy5leHRyYWN0QXR0cmlidXRlcyhlbGVtZW50Lm5hbWUsIHBhcnNlZFByb3BlcnRpZXMsIGkxOG5BdHRyc01ldGEpO1xuXG4gICAgICBwYXJzZWRFbGVtZW50ID0gbmV3IHQuVGVtcGxhdGUoXG4gICAgICAgICAgZWxlbWVudC5uYW1lLCBhdHRyaWJ1dGVzLCBhdHRycy5ib3VuZCwgYm91bmRFdmVudHMsIFsvKiBubyB0ZW1wbGF0ZSBhdHRyaWJ1dGVzICovXSxcbiAgICAgICAgICBjaGlsZHJlbiwgcmVmZXJlbmNlcywgdmFyaWFibGVzLCBlbGVtZW50LnNvdXJjZVNwYW4sIGVsZW1lbnQuc3RhcnRTb3VyY2VTcGFuLFxuICAgICAgICAgIGVsZW1lbnQuZW5kU291cmNlU3BhbiwgZWxlbWVudC5pMThuKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgYXR0cnMgPSB0aGlzLmV4dHJhY3RBdHRyaWJ1dGVzKGVsZW1lbnQubmFtZSwgcGFyc2VkUHJvcGVydGllcywgaTE4bkF0dHJzTWV0YSk7XG4gICAgICBwYXJzZWRFbGVtZW50ID0gbmV3IHQuRWxlbWVudChcbiAgICAgICAgICBlbGVtZW50Lm5hbWUsIGF0dHJpYnV0ZXMsIGF0dHJzLmJvdW5kLCBib3VuZEV2ZW50cywgY2hpbGRyZW4sIHJlZmVyZW5jZXMsXG4gICAgICAgICAgZWxlbWVudC5zb3VyY2VTcGFuLCBlbGVtZW50LnN0YXJ0U291cmNlU3BhbiwgZWxlbWVudC5lbmRTb3VyY2VTcGFuLCBlbGVtZW50LmkxOG4pO1xuICAgIH1cblxuICAgIGlmIChlbGVtZW50SGFzSW5saW5lVGVtcGxhdGUpIHtcbiAgICAgIC8vIElmIHRoaXMgbm9kZSBpcyBhbiBpbmxpbmUtdGVtcGxhdGUgKGUuZy4gaGFzICpuZ0ZvcikgdGhlbiB3ZSBuZWVkIHRvIGNyZWF0ZSBhIHRlbXBsYXRlXG4gICAgICAvLyBub2RlIHRoYXQgY29udGFpbnMgdGhpcyBub2RlLlxuICAgICAgLy8gTW9yZW92ZXIsIGlmIHRoZSBub2RlIGlzIGFuIGVsZW1lbnQsIHRoZW4gd2UgbmVlZCB0byBob2lzdCBpdHMgYXR0cmlidXRlcyB0byB0aGUgdGVtcGxhdGVcbiAgICAgIC8vIG5vZGUgZm9yIG1hdGNoaW5nIGFnYWluc3QgY29udGVudCBwcm9qZWN0aW9uIHNlbGVjdG9ycy5cbiAgICAgIGNvbnN0IGF0dHJzID0gdGhpcy5leHRyYWN0QXR0cmlidXRlcygnbmctdGVtcGxhdGUnLCB0ZW1wbGF0ZVBhcnNlZFByb3BlcnRpZXMsIGkxOG5BdHRyc01ldGEpO1xuICAgICAgY29uc3QgdGVtcGxhdGVBdHRyczogKHQuVGV4dEF0dHJpYnV0ZXx0LkJvdW5kQXR0cmlidXRlKVtdID0gW107XG4gICAgICBhdHRycy5saXRlcmFsLmZvckVhY2goYXR0ciA9PiB0ZW1wbGF0ZUF0dHJzLnB1c2goYXR0cikpO1xuICAgICAgYXR0cnMuYm91bmQuZm9yRWFjaChhdHRyID0+IHRlbXBsYXRlQXR0cnMucHVzaChhdHRyKSk7XG4gICAgICBjb25zdCBob2lzdGVkQXR0cnMgPSBwYXJzZWRFbGVtZW50IGluc3RhbmNlb2YgdC5FbGVtZW50ID9cbiAgICAgICAgICB7XG4gICAgICAgICAgICBhdHRyaWJ1dGVzOiBwYXJzZWRFbGVtZW50LmF0dHJpYnV0ZXMsXG4gICAgICAgICAgICBpbnB1dHM6IHBhcnNlZEVsZW1lbnQuaW5wdXRzLFxuICAgICAgICAgICAgb3V0cHV0czogcGFyc2VkRWxlbWVudC5vdXRwdXRzLFxuICAgICAgICAgIH0gOlxuICAgICAgICAgIHthdHRyaWJ1dGVzOiBbXSwgaW5wdXRzOiBbXSwgb3V0cHV0czogW119O1xuXG4gICAgICAvLyBGb3IgPG5nLXRlbXBsYXRlPnMgd2l0aCBzdHJ1Y3R1cmFsIGRpcmVjdGl2ZXMgb24gdGhlbSwgYXZvaWQgcGFzc2luZyBpMThuIGluZm9ybWF0aW9uIHRvXG4gICAgICAvLyB0aGUgd3JhcHBpbmcgdGVtcGxhdGUgdG8gcHJldmVudCB1bm5lY2Vzc2FyeSBpMThuIGluc3RydWN0aW9ucyBmcm9tIGJlaW5nIGdlbmVyYXRlZC4gVGhlXG4gICAgICAvLyBuZWNlc3NhcnkgaTE4biBtZXRhIGluZm9ybWF0aW9uIHdpbGwgYmUgZXh0cmFjdGVkIGZyb20gY2hpbGQgZWxlbWVudHMuXG4gICAgICBjb25zdCBpMThuID0gaXNUZW1wbGF0ZUVsZW1lbnQgJiYgaXNJMThuUm9vdEVsZW1lbnQgPyB1bmRlZmluZWQgOiBlbGVtZW50LmkxOG47XG5cbiAgICAgIC8vIFRPRE8ocGspOiB0ZXN0IGZvciB0aGlzIGNhc2VcbiAgICAgIHBhcnNlZEVsZW1lbnQgPSBuZXcgdC5UZW1wbGF0ZShcbiAgICAgICAgICAocGFyc2VkRWxlbWVudCBhcyB0LkVsZW1lbnQgfCB0LkNvbnRlbnQpLm5hbWUsIGhvaXN0ZWRBdHRycy5hdHRyaWJ1dGVzLFxuICAgICAgICAgIGhvaXN0ZWRBdHRycy5pbnB1dHMsIGhvaXN0ZWRBdHRycy5vdXRwdXRzLCB0ZW1wbGF0ZUF0dHJzLCBbcGFyc2VkRWxlbWVudF0sXG4gICAgICAgICAgWy8qIG5vIHJlZmVyZW5jZXMgKi9dLCB0ZW1wbGF0ZVZhcmlhYmxlcywgZWxlbWVudC5zb3VyY2VTcGFuLCBlbGVtZW50LnN0YXJ0U291cmNlU3BhbixcbiAgICAgICAgICBlbGVtZW50LmVuZFNvdXJjZVNwYW4sIGkxOG4pO1xuICAgIH1cbiAgICBpZiAoaXNJMThuUm9vdEVsZW1lbnQpIHtcbiAgICAgIHRoaXMuaW5JMThuQmxvY2sgPSBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHBhcnNlZEVsZW1lbnQ7XG4gIH1cblxuICB2aXNpdEF0dHJpYnV0ZShhdHRyaWJ1dGU6IGh0bWwuQXR0cmlidXRlKTogdC5UZXh0QXR0cmlidXRlIHtcbiAgICByZXR1cm4gbmV3IHQuVGV4dEF0dHJpYnV0ZShcbiAgICAgICAgYXR0cmlidXRlLm5hbWUsIGF0dHJpYnV0ZS52YWx1ZSwgYXR0cmlidXRlLnNvdXJjZVNwYW4sIGF0dHJpYnV0ZS5rZXlTcGFuLFxuICAgICAgICBhdHRyaWJ1dGUudmFsdWVTcGFuLCBhdHRyaWJ1dGUuaTE4bik7XG4gIH1cblxuICB2aXNpdFRleHQodGV4dDogaHRtbC5UZXh0KTogdC5Ob2RlIHtcbiAgICByZXR1cm4gdGhpcy5fdmlzaXRUZXh0V2l0aEludGVycG9sYXRpb24odGV4dC52YWx1ZSwgdGV4dC5zb3VyY2VTcGFuLCB0ZXh0LmkxOG4pO1xuICB9XG5cbiAgdmlzaXRFeHBhbnNpb24oZXhwYW5zaW9uOiBodG1sLkV4cGFuc2lvbik6IHQuSWN1fG51bGwge1xuICAgIGlmICghZXhwYW5zaW9uLmkxOG4pIHtcbiAgICAgIC8vIGRvIG5vdCBnZW5lcmF0ZSBJY3UgaW4gY2FzZSBpdCB3YXMgY3JlYXRlZFxuICAgICAgLy8gb3V0c2lkZSBvZiBpMThuIGJsb2NrIGluIGEgdGVtcGxhdGVcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBpZiAoIWlzSTE4blJvb3ROb2RlKGV4cGFuc2lvbi5pMThuKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHR5cGUgXCIke2V4cGFuc2lvbi5pMThuLmNvbnN0cnVjdG9yfVwiIGZvciBcImkxOG5cIiBwcm9wZXJ0eSBvZiAke1xuICAgICAgICAgIGV4cGFuc2lvbi5zb3VyY2VTcGFuLnRvU3RyaW5nKCl9LiBFeHBlY3RlZCBhIFwiTWVzc2FnZVwiYCk7XG4gICAgfVxuICAgIGNvbnN0IG1lc3NhZ2UgPSBleHBhbnNpb24uaTE4bjtcbiAgICBjb25zdCB2YXJzOiB7W25hbWU6IHN0cmluZ106IHQuQm91bmRUZXh0fSA9IHt9O1xuICAgIGNvbnN0IHBsYWNlaG9sZGVyczoge1tuYW1lOiBzdHJpbmddOiB0LlRleHR8dC5Cb3VuZFRleHR9ID0ge307XG4gICAgLy8gZXh0cmFjdCBWQVJzIGZyb20gSUNVcyAtIHdlIHByb2Nlc3MgdGhlbSBzZXBhcmF0ZWx5IHdoaWxlXG4gICAgLy8gYXNzZW1ibGluZyByZXN1bHRpbmcgbWVzc2FnZSB2aWEgZ29vZy5nZXRNc2cgZnVuY3Rpb24sIHNpbmNlXG4gICAgLy8gd2UgbmVlZCB0byBwYXNzIHRoZW0gdG8gdG9wLWxldmVsIGdvb2cuZ2V0TXNnIGNhbGxcbiAgICBPYmplY3Qua2V5cyhtZXNzYWdlLnBsYWNlaG9sZGVycykuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgY29uc3QgdmFsdWUgPSBtZXNzYWdlLnBsYWNlaG9sZGVyc1trZXldO1xuICAgICAgaWYgKGtleS5zdGFydHNXaXRoKEkxOE5fSUNVX1ZBUl9QUkVGSVgpKSB7XG4gICAgICAgIC8vIEN1cnJlbnRseSB3aGVuIHRoZSBgcGx1cmFsYCBvciBgc2VsZWN0YCBrZXl3b3JkcyBpbiBhbiBJQ1UgY29udGFpbiB0cmFpbGluZyBzcGFjZXMgKGUuZy5cbiAgICAgICAgLy8gYHtjb3VudCwgc2VsZWN0ICwgLi4ufWApLCB0aGVzZSBzcGFjZXMgYXJlIGFsc28gaW5jbHVkZWQgaW50byB0aGUga2V5IG5hbWVzIGluIElDVSB2YXJzXG4gICAgICAgIC8vIChlLmcuIFwiVkFSX1NFTEVDVCBcIikuIFRoZXNlIHRyYWlsaW5nIHNwYWNlcyBhcmUgbm90IGRlc2lyYWJsZSwgc2luY2UgdGhleSB3aWxsIGxhdGVyIGJlXG4gICAgICAgIC8vIGNvbnZlcnRlZCBpbnRvIGBfYCBzeW1ib2xzIHdoaWxlIG5vcm1hbGl6aW5nIHBsYWNlaG9sZGVyIG5hbWVzLCB3aGljaCBtaWdodCBsZWFkIHRvXG4gICAgICAgIC8vIG1pc21hdGNoZXMgYXQgcnVudGltZSAoaS5lLiBwbGFjZWhvbGRlciB3aWxsIG5vdCBiZSByZXBsYWNlZCB3aXRoIHRoZSBjb3JyZWN0IHZhbHVlKS5cbiAgICAgICAgY29uc3QgZm9ybWF0dGVkS2V5ID0ga2V5LnRyaW0oKTtcblxuICAgICAgICBjb25zdCBhc3QgPSB0aGlzLmJpbmRpbmdQYXJzZXIucGFyc2VJbnRlcnBvbGF0aW9uRXhwcmVzc2lvbih2YWx1ZS50ZXh0LCB2YWx1ZS5zb3VyY2VTcGFuKTtcblxuICAgICAgICB2YXJzW2Zvcm1hdHRlZEtleV0gPSBuZXcgdC5Cb3VuZFRleHQoYXN0LCB2YWx1ZS5zb3VyY2VTcGFuKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBsYWNlaG9sZGVyc1trZXldID0gdGhpcy5fdmlzaXRUZXh0V2l0aEludGVycG9sYXRpb24odmFsdWUudGV4dCwgdmFsdWUuc291cmNlU3Bhbik7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIG5ldyB0LkljdSh2YXJzLCBwbGFjZWhvbGRlcnMsIGV4cGFuc2lvbi5zb3VyY2VTcGFuLCBtZXNzYWdlKTtcbiAgfVxuXG4gIHZpc2l0RXhwYW5zaW9uQ2FzZShleHBhbnNpb25DYXNlOiBodG1sLkV4cGFuc2lvbkNhc2UpOiBudWxsIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHZpc2l0Q29tbWVudChjb21tZW50OiBodG1sLkNvbW1lbnQpOiBudWxsIHtcbiAgICBpZiAodGhpcy5vcHRpb25zLmNvbGxlY3RDb21tZW50Tm9kZXMpIHtcbiAgICAgIHRoaXMuY29tbWVudE5vZGVzLnB1c2gobmV3IHQuQ29tbWVudChjb21tZW50LnZhbHVlIHx8ICcnLCBjb21tZW50LnNvdXJjZVNwYW4pKTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvLyBjb252ZXJ0IHZpZXcgZW5naW5lIGBQYXJzZWRQcm9wZXJ0eWAgdG8gYSBmb3JtYXQgc3VpdGFibGUgZm9yIElWWVxuICBwcml2YXRlIGV4dHJhY3RBdHRyaWJ1dGVzKFxuICAgICAgZWxlbWVudE5hbWU6IHN0cmluZywgcHJvcGVydGllczogUGFyc2VkUHJvcGVydHlbXSxcbiAgICAgIGkxOG5Qcm9wc01ldGE6IHtba2V5OiBzdHJpbmddOiBpMThuLkkxOG5NZXRhfSk6XG4gICAgICB7Ym91bmQ6IHQuQm91bmRBdHRyaWJ1dGVbXSwgbGl0ZXJhbDogdC5UZXh0QXR0cmlidXRlW119IHtcbiAgICBjb25zdCBib3VuZDogdC5Cb3VuZEF0dHJpYnV0ZVtdID0gW107XG4gICAgY29uc3QgbGl0ZXJhbDogdC5UZXh0QXR0cmlidXRlW10gPSBbXTtcblxuICAgIHByb3BlcnRpZXMuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgIGNvbnN0IGkxOG4gPSBpMThuUHJvcHNNZXRhW3Byb3AubmFtZV07XG4gICAgICBpZiAocHJvcC5pc0xpdGVyYWwpIHtcbiAgICAgICAgbGl0ZXJhbC5wdXNoKG5ldyB0LlRleHRBdHRyaWJ1dGUoXG4gICAgICAgICAgICBwcm9wLm5hbWUsIHByb3AuZXhwcmVzc2lvbi5zb3VyY2UgfHwgJycsIHByb3Auc291cmNlU3BhbiwgcHJvcC5rZXlTcGFuLCBwcm9wLnZhbHVlU3BhbixcbiAgICAgICAgICAgIGkxOG4pKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIE5vdGUgdGhhdCB2YWxpZGF0aW9uIGlzIHNraXBwZWQgYW5kIHByb3BlcnR5IG1hcHBpbmcgaXMgZGlzYWJsZWRcbiAgICAgICAgLy8gZHVlIHRvIHRoZSBmYWN0IHRoYXQgd2UgbmVlZCB0byBtYWtlIHN1cmUgYSBnaXZlbiBwcm9wIGlzIG5vdCBhblxuICAgICAgICAvLyBpbnB1dCBvZiBhIGRpcmVjdGl2ZSBhbmQgZGlyZWN0aXZlIG1hdGNoaW5nIGhhcHBlbnMgYXQgcnVudGltZS5cbiAgICAgICAgY29uc3QgYmVwID0gdGhpcy5iaW5kaW5nUGFyc2VyLmNyZWF0ZUJvdW5kRWxlbWVudFByb3BlcnR5KFxuICAgICAgICAgICAgZWxlbWVudE5hbWUsIHByb3AsIC8qIHNraXBWYWxpZGF0aW9uICovIHRydWUsIC8qIG1hcFByb3BlcnR5TmFtZSAqLyBmYWxzZSk7XG4gICAgICAgIGJvdW5kLnB1c2godC5Cb3VuZEF0dHJpYnV0ZS5mcm9tQm91bmRFbGVtZW50UHJvcGVydHkoYmVwLCBpMThuKSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4ge2JvdW5kLCBsaXRlcmFsfTtcbiAgfVxuXG4gIHByaXZhdGUgcGFyc2VBdHRyaWJ1dGUoXG4gICAgICBpc1RlbXBsYXRlRWxlbWVudDogYm9vbGVhbiwgYXR0cmlidXRlOiBodG1sLkF0dHJpYnV0ZSwgbWF0Y2hhYmxlQXR0cmlidXRlczogc3RyaW5nW11bXSxcbiAgICAgIHBhcnNlZFByb3BlcnRpZXM6IFBhcnNlZFByb3BlcnR5W10sIGJvdW5kRXZlbnRzOiB0LkJvdW5kRXZlbnRbXSwgdmFyaWFibGVzOiB0LlZhcmlhYmxlW10sXG4gICAgICByZWZlcmVuY2VzOiB0LlJlZmVyZW5jZVtdKSB7XG4gICAgY29uc3QgbmFtZSA9IG5vcm1hbGl6ZUF0dHJpYnV0ZU5hbWUoYXR0cmlidXRlLm5hbWUpO1xuICAgIGNvbnN0IHZhbHVlID0gYXR0cmlidXRlLnZhbHVlO1xuICAgIGNvbnN0IHNyY1NwYW4gPSBhdHRyaWJ1dGUuc291cmNlU3BhbjtcbiAgICBjb25zdCBhYnNvbHV0ZU9mZnNldCA9XG4gICAgICAgIGF0dHJpYnV0ZS52YWx1ZVNwYW4gPyBhdHRyaWJ1dGUudmFsdWVTcGFuLnN0YXJ0Lm9mZnNldCA6IHNyY1NwYW4uc3RhcnQub2Zmc2V0O1xuXG4gICAgZnVuY3Rpb24gY3JlYXRlS2V5U3BhbihzcmNTcGFuOiBQYXJzZVNvdXJjZVNwYW4sIHByZWZpeDogc3RyaW5nLCBpZGVudGlmaWVyOiBzdHJpbmcpIHtcbiAgICAgIC8vIFdlIG5lZWQgdG8gYWRqdXN0IHRoZSBzdGFydCBsb2NhdGlvbiBmb3IgdGhlIGtleVNwYW4gdG8gYWNjb3VudCBmb3IgdGhlIHJlbW92ZWQgJ2RhdGEtJ1xuICAgICAgLy8gcHJlZml4IGZyb20gYG5vcm1hbGl6ZUF0dHJpYnV0ZU5hbWVgLlxuICAgICAgY29uc3Qgbm9ybWFsaXphdGlvbkFkanVzdG1lbnQgPSBhdHRyaWJ1dGUubmFtZS5sZW5ndGggLSBuYW1lLmxlbmd0aDtcbiAgICAgIGNvbnN0IGtleVNwYW5TdGFydCA9IHNyY1NwYW4uc3RhcnQubW92ZUJ5KHByZWZpeC5sZW5ndGggKyBub3JtYWxpemF0aW9uQWRqdXN0bWVudCk7XG4gICAgICBjb25zdCBrZXlTcGFuRW5kID0ga2V5U3BhblN0YXJ0Lm1vdmVCeShpZGVudGlmaWVyLmxlbmd0aCk7XG4gICAgICByZXR1cm4gbmV3IFBhcnNlU291cmNlU3BhbihrZXlTcGFuU3RhcnQsIGtleVNwYW5FbmQsIGtleVNwYW5TdGFydCwgaWRlbnRpZmllcik7XG4gICAgfVxuXG4gICAgY29uc3QgYmluZFBhcnRzID0gbmFtZS5tYXRjaChCSU5EX05BTUVfUkVHRVhQKTtcblxuICAgIGlmIChiaW5kUGFydHMpIHtcbiAgICAgIGlmIChiaW5kUGFydHNbS1dfQklORF9JRFhdICE9IG51bGwpIHtcbiAgICAgICAgY29uc3QgaWRlbnRpZmllciA9IGJpbmRQYXJ0c1tJREVOVF9LV19JRFhdO1xuICAgICAgICBjb25zdCBrZXlTcGFuID0gY3JlYXRlS2V5U3BhbihzcmNTcGFuLCBiaW5kUGFydHNbS1dfQklORF9JRFhdLCBpZGVudGlmaWVyKTtcbiAgICAgICAgdGhpcy5iaW5kaW5nUGFyc2VyLnBhcnNlUHJvcGVydHlCaW5kaW5nKFxuICAgICAgICAgICAgaWRlbnRpZmllciwgdmFsdWUsIGZhbHNlLCBzcmNTcGFuLCBhYnNvbHV0ZU9mZnNldCwgYXR0cmlidXRlLnZhbHVlU3BhbixcbiAgICAgICAgICAgIG1hdGNoYWJsZUF0dHJpYnV0ZXMsIHBhcnNlZFByb3BlcnRpZXMsIGtleVNwYW4pO1xuXG4gICAgICB9IGVsc2UgaWYgKGJpbmRQYXJ0c1tLV19MRVRfSURYXSkge1xuICAgICAgICBpZiAoaXNUZW1wbGF0ZUVsZW1lbnQpIHtcbiAgICAgICAgICBjb25zdCBpZGVudGlmaWVyID0gYmluZFBhcnRzW0lERU5UX0tXX0lEWF07XG4gICAgICAgICAgY29uc3Qga2V5U3BhbiA9IGNyZWF0ZUtleVNwYW4oc3JjU3BhbiwgYmluZFBhcnRzW0tXX0xFVF9JRFhdLCBpZGVudGlmaWVyKTtcbiAgICAgICAgICB0aGlzLnBhcnNlVmFyaWFibGUoaWRlbnRpZmllciwgdmFsdWUsIHNyY1NwYW4sIGtleVNwYW4sIGF0dHJpYnV0ZS52YWx1ZVNwYW4sIHZhcmlhYmxlcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5yZXBvcnRFcnJvcihgXCJsZXQtXCIgaXMgb25seSBzdXBwb3J0ZWQgb24gbmctdGVtcGxhdGUgZWxlbWVudHMuYCwgc3JjU3Bhbik7XG4gICAgICAgIH1cblxuICAgICAgfSBlbHNlIGlmIChiaW5kUGFydHNbS1dfUkVGX0lEWF0pIHtcbiAgICAgICAgY29uc3QgaWRlbnRpZmllciA9IGJpbmRQYXJ0c1tJREVOVF9LV19JRFhdO1xuICAgICAgICBjb25zdCBrZXlTcGFuID0gY3JlYXRlS2V5U3BhbihzcmNTcGFuLCBiaW5kUGFydHNbS1dfUkVGX0lEWF0sIGlkZW50aWZpZXIpO1xuICAgICAgICB0aGlzLnBhcnNlUmVmZXJlbmNlKGlkZW50aWZpZXIsIHZhbHVlLCBzcmNTcGFuLCBrZXlTcGFuLCBhdHRyaWJ1dGUudmFsdWVTcGFuLCByZWZlcmVuY2VzKTtcbiAgICAgIH0gZWxzZSBpZiAoYmluZFBhcnRzW0tXX09OX0lEWF0pIHtcbiAgICAgICAgY29uc3QgZXZlbnRzOiBQYXJzZWRFdmVudFtdID0gW107XG4gICAgICAgIGNvbnN0IGlkZW50aWZpZXIgPSBiaW5kUGFydHNbSURFTlRfS1dfSURYXTtcbiAgICAgICAgY29uc3Qga2V5U3BhbiA9IGNyZWF0ZUtleVNwYW4oc3JjU3BhbiwgYmluZFBhcnRzW0tXX09OX0lEWF0sIGlkZW50aWZpZXIpO1xuICAgICAgICB0aGlzLmJpbmRpbmdQYXJzZXIucGFyc2VFdmVudChcbiAgICAgICAgICAgIGlkZW50aWZpZXIsIHZhbHVlLCBzcmNTcGFuLCBhdHRyaWJ1dGUudmFsdWVTcGFuIHx8IHNyY1NwYW4sIG1hdGNoYWJsZUF0dHJpYnV0ZXMsIGV2ZW50cyxcbiAgICAgICAgICAgIGtleVNwYW4pO1xuICAgICAgICBhZGRFdmVudHMoZXZlbnRzLCBib3VuZEV2ZW50cyk7XG4gICAgICB9IGVsc2UgaWYgKGJpbmRQYXJ0c1tLV19CSU5ET05fSURYXSkge1xuICAgICAgICBjb25zdCBpZGVudGlmaWVyID0gYmluZFBhcnRzW0lERU5UX0tXX0lEWF07XG4gICAgICAgIGNvbnN0IGtleVNwYW4gPSBjcmVhdGVLZXlTcGFuKHNyY1NwYW4sIGJpbmRQYXJ0c1tLV19CSU5ET05fSURYXSwgaWRlbnRpZmllcik7XG4gICAgICAgIHRoaXMuYmluZGluZ1BhcnNlci5wYXJzZVByb3BlcnR5QmluZGluZyhcbiAgICAgICAgICAgIGlkZW50aWZpZXIsIHZhbHVlLCBmYWxzZSwgc3JjU3BhbiwgYWJzb2x1dGVPZmZzZXQsIGF0dHJpYnV0ZS52YWx1ZVNwYW4sXG4gICAgICAgICAgICBtYXRjaGFibGVBdHRyaWJ1dGVzLCBwYXJzZWRQcm9wZXJ0aWVzLCBrZXlTcGFuKTtcbiAgICAgICAgdGhpcy5wYXJzZUFzc2lnbm1lbnRFdmVudChcbiAgICAgICAgICAgIGlkZW50aWZpZXIsIHZhbHVlLCBzcmNTcGFuLCBhdHRyaWJ1dGUudmFsdWVTcGFuLCBtYXRjaGFibGVBdHRyaWJ1dGVzLCBib3VuZEV2ZW50cyxcbiAgICAgICAgICAgIGtleVNwYW4pO1xuICAgICAgfSBlbHNlIGlmIChiaW5kUGFydHNbS1dfQVRfSURYXSkge1xuICAgICAgICBjb25zdCBrZXlTcGFuID0gY3JlYXRlS2V5U3BhbihzcmNTcGFuLCAnJywgbmFtZSk7XG4gICAgICAgIHRoaXMuYmluZGluZ1BhcnNlci5wYXJzZUxpdGVyYWxBdHRyKFxuICAgICAgICAgICAgbmFtZSwgdmFsdWUsIHNyY1NwYW4sIGFic29sdXRlT2Zmc2V0LCBhdHRyaWJ1dGUudmFsdWVTcGFuLCBtYXRjaGFibGVBdHRyaWJ1dGVzLFxuICAgICAgICAgICAgcGFyc2VkUHJvcGVydGllcywga2V5U3Bhbik7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBXZSBkaWRuJ3Qgc2VlIGEga3ctcHJlZml4ZWQgcHJvcGVydHkgYmluZGluZywgYnV0IHdlIGhhdmUgbm90IHlldCBjaGVja2VkXG4gICAgLy8gZm9yIHRoZSBbXS8oKS9bKCldIHN5bnRheC5cbiAgICBsZXQgZGVsaW1zOiB7c3RhcnQ6IHN0cmluZywgZW5kOiBzdHJpbmd9fG51bGwgPSBudWxsO1xuICAgIGlmIChuYW1lLnN0YXJ0c1dpdGgoQklORElOR19ERUxJTVMuQkFOQU5BX0JPWC5zdGFydCkpIHtcbiAgICAgIGRlbGltcyA9IEJJTkRJTkdfREVMSU1TLkJBTkFOQV9CT1g7XG4gICAgfSBlbHNlIGlmIChuYW1lLnN0YXJ0c1dpdGgoQklORElOR19ERUxJTVMuUFJPUEVSVFkuc3RhcnQpKSB7XG4gICAgICBkZWxpbXMgPSBCSU5ESU5HX0RFTElNUy5QUk9QRVJUWTtcbiAgICB9IGVsc2UgaWYgKG5hbWUuc3RhcnRzV2l0aChCSU5ESU5HX0RFTElNUy5FVkVOVC5zdGFydCkpIHtcbiAgICAgIGRlbGltcyA9IEJJTkRJTkdfREVMSU1TLkVWRU5UO1xuICAgIH1cbiAgICBpZiAoZGVsaW1zICE9PSBudWxsICYmXG4gICAgICAgIC8vIE5PVEU6IG9sZGVyIHZlcnNpb25zIG9mIHRoZSBwYXJzZXIgd291bGQgbWF0Y2ggYSBzdGFydC9lbmQgZGVsaW1pdGVkXG4gICAgICAgIC8vIGJpbmRpbmcgaWZmIHRoZSBwcm9wZXJ0eSBuYW1lIHdhcyB0ZXJtaW5hdGVkIGJ5IHRoZSBlbmRpbmcgZGVsaW1pdGVyXG4gICAgICAgIC8vIGFuZCB0aGUgaWRlbnRpZmllciBpbiB0aGUgYmluZGluZyB3YXMgbm9uLWVtcHR5LlxuICAgICAgICAvLyBUT0RPKGF5YXpoYWZpeik6IHVwZGF0ZSB0aGlzIHRvIGhhbmRsZSBtYWxmb3JtZWQgYmluZGluZ3MuXG4gICAgICAgIG5hbWUuZW5kc1dpdGgoZGVsaW1zLmVuZCkgJiYgbmFtZS5sZW5ndGggPiBkZWxpbXMuc3RhcnQubGVuZ3RoICsgZGVsaW1zLmVuZC5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IGlkZW50aWZpZXIgPSBuYW1lLnN1YnN0cmluZyhkZWxpbXMuc3RhcnQubGVuZ3RoLCBuYW1lLmxlbmd0aCAtIGRlbGltcy5lbmQubGVuZ3RoKTtcbiAgICAgIGNvbnN0IGtleVNwYW4gPSBjcmVhdGVLZXlTcGFuKHNyY1NwYW4sIGRlbGltcy5zdGFydCwgaWRlbnRpZmllcik7XG4gICAgICBpZiAoZGVsaW1zLnN0YXJ0ID09PSBCSU5ESU5HX0RFTElNUy5CQU5BTkFfQk9YLnN0YXJ0KSB7XG4gICAgICAgIHRoaXMuYmluZGluZ1BhcnNlci5wYXJzZVByb3BlcnR5QmluZGluZyhcbiAgICAgICAgICAgIGlkZW50aWZpZXIsIHZhbHVlLCBmYWxzZSwgc3JjU3BhbiwgYWJzb2x1dGVPZmZzZXQsIGF0dHJpYnV0ZS52YWx1ZVNwYW4sXG4gICAgICAgICAgICBtYXRjaGFibGVBdHRyaWJ1dGVzLCBwYXJzZWRQcm9wZXJ0aWVzLCBrZXlTcGFuKTtcbiAgICAgICAgdGhpcy5wYXJzZUFzc2lnbm1lbnRFdmVudChcbiAgICAgICAgICAgIGlkZW50aWZpZXIsIHZhbHVlLCBzcmNTcGFuLCBhdHRyaWJ1dGUudmFsdWVTcGFuLCBtYXRjaGFibGVBdHRyaWJ1dGVzLCBib3VuZEV2ZW50cyxcbiAgICAgICAgICAgIGtleVNwYW4pO1xuICAgICAgfSBlbHNlIGlmIChkZWxpbXMuc3RhcnQgPT09IEJJTkRJTkdfREVMSU1TLlBST1BFUlRZLnN0YXJ0KSB7XG4gICAgICAgIHRoaXMuYmluZGluZ1BhcnNlci5wYXJzZVByb3BlcnR5QmluZGluZyhcbiAgICAgICAgICAgIGlkZW50aWZpZXIsIHZhbHVlLCBmYWxzZSwgc3JjU3BhbiwgYWJzb2x1dGVPZmZzZXQsIGF0dHJpYnV0ZS52YWx1ZVNwYW4sXG4gICAgICAgICAgICBtYXRjaGFibGVBdHRyaWJ1dGVzLCBwYXJzZWRQcm9wZXJ0aWVzLCBrZXlTcGFuKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGV2ZW50czogUGFyc2VkRXZlbnRbXSA9IFtdO1xuICAgICAgICB0aGlzLmJpbmRpbmdQYXJzZXIucGFyc2VFdmVudChcbiAgICAgICAgICAgIGlkZW50aWZpZXIsIHZhbHVlLCBzcmNTcGFuLCBhdHRyaWJ1dGUudmFsdWVTcGFuIHx8IHNyY1NwYW4sIG1hdGNoYWJsZUF0dHJpYnV0ZXMsIGV2ZW50cyxcbiAgICAgICAgICAgIGtleVNwYW4pO1xuICAgICAgICBhZGRFdmVudHMoZXZlbnRzLCBib3VuZEV2ZW50cyk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8vIE5vIGV4cGxpY2l0IGJpbmRpbmcgZm91bmQuXG4gICAgY29uc3Qga2V5U3BhbiA9IGNyZWF0ZUtleVNwYW4oc3JjU3BhbiwgJycgLyogcHJlZml4ICovLCBuYW1lKTtcbiAgICBjb25zdCBoYXNCaW5kaW5nID0gdGhpcy5iaW5kaW5nUGFyc2VyLnBhcnNlUHJvcGVydHlJbnRlcnBvbGF0aW9uKFxuICAgICAgICBuYW1lLCB2YWx1ZSwgc3JjU3BhbiwgYXR0cmlidXRlLnZhbHVlU3BhbiwgbWF0Y2hhYmxlQXR0cmlidXRlcywgcGFyc2VkUHJvcGVydGllcywga2V5U3Bhbik7XG4gICAgcmV0dXJuIGhhc0JpbmRpbmc7XG4gIH1cblxuICBwcml2YXRlIF92aXNpdFRleHRXaXRoSW50ZXJwb2xhdGlvbihcbiAgICAgIHZhbHVlOiBzdHJpbmcsIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbiwgaTE4bj86IGkxOG4uSTE4bk1ldGEpOiB0LlRleHR8dC5Cb3VuZFRleHQge1xuICAgIGNvbnN0IHZhbHVlTm9OZ3NwID0gcmVwbGFjZU5nc3AodmFsdWUpO1xuICAgIGNvbnN0IGV4cHIgPSB0aGlzLmJpbmRpbmdQYXJzZXIucGFyc2VJbnRlcnBvbGF0aW9uKHZhbHVlTm9OZ3NwLCBzb3VyY2VTcGFuKTtcbiAgICByZXR1cm4gZXhwciA/IG5ldyB0LkJvdW5kVGV4dChleHByLCBzb3VyY2VTcGFuLCBpMThuKSA6IG5ldyB0LlRleHQodmFsdWVOb05nc3AsIHNvdXJjZVNwYW4pO1xuICB9XG5cbiAgcHJpdmF0ZSBwYXJzZVZhcmlhYmxlKFxuICAgICAgaWRlbnRpZmllcjogc3RyaW5nLCB2YWx1ZTogc3RyaW5nLCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sIGtleVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICAgIHZhbHVlU3BhbjogUGFyc2VTb3VyY2VTcGFufHVuZGVmaW5lZCwgdmFyaWFibGVzOiB0LlZhcmlhYmxlW10pIHtcbiAgICBpZiAoaWRlbnRpZmllci5pbmRleE9mKCctJykgPiAtMSkge1xuICAgICAgdGhpcy5yZXBvcnRFcnJvcihgXCItXCIgaXMgbm90IGFsbG93ZWQgaW4gdmFyaWFibGUgbmFtZXNgLCBzb3VyY2VTcGFuKTtcbiAgICB9IGVsc2UgaWYgKGlkZW50aWZpZXIubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aGlzLnJlcG9ydEVycm9yKGBWYXJpYWJsZSBkb2VzIG5vdCBoYXZlIGEgbmFtZWAsIHNvdXJjZVNwYW4pO1xuICAgIH1cblxuICAgIHZhcmlhYmxlcy5wdXNoKG5ldyB0LlZhcmlhYmxlKGlkZW50aWZpZXIsIHZhbHVlLCBzb3VyY2VTcGFuLCBrZXlTcGFuLCB2YWx1ZVNwYW4pKTtcbiAgfVxuXG4gIHByaXZhdGUgcGFyc2VSZWZlcmVuY2UoXG4gICAgICBpZGVudGlmaWVyOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcsIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3Bhbiwga2V5U3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgICAgdmFsdWVTcGFuOiBQYXJzZVNvdXJjZVNwYW58dW5kZWZpbmVkLCByZWZlcmVuY2VzOiB0LlJlZmVyZW5jZVtdKSB7XG4gICAgaWYgKGlkZW50aWZpZXIuaW5kZXhPZignLScpID4gLTEpIHtcbiAgICAgIHRoaXMucmVwb3J0RXJyb3IoYFwiLVwiIGlzIG5vdCBhbGxvd2VkIGluIHJlZmVyZW5jZSBuYW1lc2AsIHNvdXJjZVNwYW4pO1xuICAgIH0gZWxzZSBpZiAoaWRlbnRpZmllci5sZW5ndGggPT09IDApIHtcbiAgICAgIHRoaXMucmVwb3J0RXJyb3IoYFJlZmVyZW5jZSBkb2VzIG5vdCBoYXZlIGEgbmFtZWAsIHNvdXJjZVNwYW4pO1xuICAgIH0gZWxzZSBpZiAocmVmZXJlbmNlcy5zb21lKHJlZmVyZW5jZSA9PiByZWZlcmVuY2UubmFtZSA9PT0gaWRlbnRpZmllcikpIHtcbiAgICAgIHRoaXMucmVwb3J0RXJyb3IoYFJlZmVyZW5jZSBcIiMke2lkZW50aWZpZXJ9XCIgaXMgZGVmaW5lZCBtb3JlIHRoYW4gb25jZWAsIHNvdXJjZVNwYW4pO1xuICAgIH1cblxuICAgIHJlZmVyZW5jZXMucHVzaChuZXcgdC5SZWZlcmVuY2UoaWRlbnRpZmllciwgdmFsdWUsIHNvdXJjZVNwYW4sIGtleVNwYW4sIHZhbHVlU3BhbikpO1xuICB9XG5cbiAgcHJpdmF0ZSBwYXJzZUFzc2lnbm1lbnRFdmVudChcbiAgICAgIG5hbWU6IHN0cmluZywgZXhwcmVzc2lvbjogc3RyaW5nLCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgICB2YWx1ZVNwYW46IFBhcnNlU291cmNlU3Bhbnx1bmRlZmluZWQsIHRhcmdldE1hdGNoYWJsZUF0dHJzOiBzdHJpbmdbXVtdLFxuICAgICAgYm91bmRFdmVudHM6IHQuQm91bmRFdmVudFtdLCBrZXlTcGFuOiBQYXJzZVNvdXJjZVNwYW4pIHtcbiAgICBjb25zdCBldmVudHM6IFBhcnNlZEV2ZW50W10gPSBbXTtcbiAgICB0aGlzLmJpbmRpbmdQYXJzZXIucGFyc2VFdmVudChcbiAgICAgICAgYCR7bmFtZX1DaGFuZ2VgLCBgJHtleHByZXNzaW9ufT0kZXZlbnRgLCBzb3VyY2VTcGFuLCB2YWx1ZVNwYW4gfHwgc291cmNlU3BhbixcbiAgICAgICAgdGFyZ2V0TWF0Y2hhYmxlQXR0cnMsIGV2ZW50cywga2V5U3Bhbik7XG4gICAgYWRkRXZlbnRzKGV2ZW50cywgYm91bmRFdmVudHMpO1xuICB9XG5cbiAgcHJpdmF0ZSByZXBvcnRFcnJvcihcbiAgICAgIG1lc3NhZ2U6IHN0cmluZywgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgICAgbGV2ZWw6IFBhcnNlRXJyb3JMZXZlbCA9IFBhcnNlRXJyb3JMZXZlbC5FUlJPUikge1xuICAgIHRoaXMuZXJyb3JzLnB1c2gobmV3IFBhcnNlRXJyb3Ioc291cmNlU3BhbiwgbWVzc2FnZSwgbGV2ZWwpKTtcbiAgfVxufVxuXG5jbGFzcyBOb25CaW5kYWJsZVZpc2l0b3IgaW1wbGVtZW50cyBodG1sLlZpc2l0b3Ige1xuICB2aXNpdEVsZW1lbnQoYXN0OiBodG1sLkVsZW1lbnQpOiB0LkVsZW1lbnR8bnVsbCB7XG4gICAgY29uc3QgcHJlcGFyc2VkRWxlbWVudCA9IHByZXBhcnNlRWxlbWVudChhc3QpO1xuICAgIGlmIChwcmVwYXJzZWRFbGVtZW50LnR5cGUgPT09IFByZXBhcnNlZEVsZW1lbnRUeXBlLlNDUklQVCB8fFxuICAgICAgICBwcmVwYXJzZWRFbGVtZW50LnR5cGUgPT09IFByZXBhcnNlZEVsZW1lbnRUeXBlLlNUWUxFIHx8XG4gICAgICAgIHByZXBhcnNlZEVsZW1lbnQudHlwZSA9PT0gUHJlcGFyc2VkRWxlbWVudFR5cGUuU1RZTEVTSEVFVCkge1xuICAgICAgLy8gU2tpcHBpbmcgPHNjcmlwdD4gZm9yIHNlY3VyaXR5IHJlYXNvbnNcbiAgICAgIC8vIFNraXBwaW5nIDxzdHlsZT4gYW5kIHN0eWxlc2hlZXRzIGFzIHdlIGFscmVhZHkgcHJvY2Vzc2VkIHRoZW1cbiAgICAgIC8vIGluIHRoZSBTdHlsZUNvbXBpbGVyXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBjaGlsZHJlbjogdC5Ob2RlW10gPSBodG1sLnZpc2l0QWxsKHRoaXMsIGFzdC5jaGlsZHJlbiwgbnVsbCk7XG4gICAgcmV0dXJuIG5ldyB0LkVsZW1lbnQoXG4gICAgICAgIGFzdC5uYW1lLCBodG1sLnZpc2l0QWxsKHRoaXMsIGFzdC5hdHRycykgYXMgdC5UZXh0QXR0cmlidXRlW10sXG4gICAgICAgIC8qIGlucHV0cyAqL1tdLCAvKiBvdXRwdXRzICovW10sIGNoaWxkcmVuLMKgIC8qIHJlZmVyZW5jZXMgKi9bXSwgYXN0LnNvdXJjZVNwYW4sXG4gICAgICAgIGFzdC5zdGFydFNvdXJjZVNwYW4sIGFzdC5lbmRTb3VyY2VTcGFuKTtcbiAgfVxuXG4gIHZpc2l0Q29tbWVudChjb21tZW50OiBodG1sLkNvbW1lbnQpOiBhbnkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgdmlzaXRBdHRyaWJ1dGUoYXR0cmlidXRlOiBodG1sLkF0dHJpYnV0ZSk6IHQuVGV4dEF0dHJpYnV0ZSB7XG4gICAgcmV0dXJuIG5ldyB0LlRleHRBdHRyaWJ1dGUoXG4gICAgICAgIGF0dHJpYnV0ZS5uYW1lLCBhdHRyaWJ1dGUudmFsdWUsIGF0dHJpYnV0ZS5zb3VyY2VTcGFuLCBhdHRyaWJ1dGUua2V5U3BhbixcbiAgICAgICAgYXR0cmlidXRlLnZhbHVlU3BhbiwgYXR0cmlidXRlLmkxOG4pO1xuICB9XG5cbiAgdmlzaXRUZXh0KHRleHQ6IGh0bWwuVGV4dCk6IHQuVGV4dCB7XG4gICAgcmV0dXJuIG5ldyB0LlRleHQodGV4dC52YWx1ZSwgdGV4dC5zb3VyY2VTcGFuKTtcbiAgfVxuXG4gIHZpc2l0RXhwYW5zaW9uKGV4cGFuc2lvbjogaHRtbC5FeHBhbnNpb24pOiBhbnkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgdmlzaXRFeHBhbnNpb25DYXNlKGV4cGFuc2lvbkNhc2U6IGh0bWwuRXhwYW5zaW9uQ2FzZSk6IGFueSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuY29uc3QgTk9OX0JJTkRBQkxFX1ZJU0lUT1IgPSBuZXcgTm9uQmluZGFibGVWaXNpdG9yKCk7XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZUF0dHJpYnV0ZU5hbWUoYXR0ck5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiAvXmRhdGEtL2kudGVzdChhdHRyTmFtZSkgPyBhdHRyTmFtZS5zdWJzdHJpbmcoNSkgOiBhdHRyTmFtZTtcbn1cblxuZnVuY3Rpb24gYWRkRXZlbnRzKGV2ZW50czogUGFyc2VkRXZlbnRbXSwgYm91bmRFdmVudHM6IHQuQm91bmRFdmVudFtdKSB7XG4gIGJvdW5kRXZlbnRzLnB1c2goLi4uZXZlbnRzLm1hcChlID0+IHQuQm91bmRFdmVudC5mcm9tUGFyc2VkRXZlbnQoZSkpKTtcbn1cblxuZnVuY3Rpb24gaXNFbXB0eVRleHROb2RlKG5vZGU6IGh0bWwuTm9kZSk6IGJvb2xlYW4ge1xuICByZXR1cm4gbm9kZSBpbnN0YW5jZW9mIGh0bWwuVGV4dCAmJiBub2RlLnZhbHVlLnRyaW0oKS5sZW5ndGggPT0gMDtcbn1cblxuZnVuY3Rpb24gaXNDb21tZW50Tm9kZShub2RlOiBodG1sLk5vZGUpOiBib29sZWFuIHtcbiAgcmV0dXJuIG5vZGUgaW5zdGFuY2VvZiBodG1sLkNvbW1lbnQ7XG59XG5cbmZ1bmN0aW9uIHRleHRDb250ZW50cyhub2RlOiBodG1sLkVsZW1lbnQpOiBzdHJpbmd8bnVsbCB7XG4gIGlmIChub2RlLmNoaWxkcmVuLmxlbmd0aCAhPT0gMSB8fCAhKG5vZGUuY2hpbGRyZW5bMF0gaW5zdGFuY2VvZiBodG1sLlRleHQpKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIChub2RlLmNoaWxkcmVuWzBdIGFzIGh0bWwuVGV4dCkudmFsdWU7XG4gIH1cbn1cbiJdfQ==