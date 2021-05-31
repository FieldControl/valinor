(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/ngtsc/indexer/src/template", ["require", "exports", "tslib", "@angular/compiler", "@angular/compiler-cli/src/ngtsc/indexer/src/api"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getTemplateIdentifiers = void 0;
    var tslib_1 = require("tslib");
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var compiler_1 = require("@angular/compiler");
    var api_1 = require("@angular/compiler-cli/src/ngtsc/indexer/src/api");
    /**
     * Visits the AST of an Angular template syntax expression, finding interesting
     * entities (variable references, etc.). Creates an array of Entities found in
     * the expression, with the location of the Entities being relative to the
     * expression.
     *
     * Visiting `text {{prop}}` will return
     * `[TopLevelIdentifier {name: 'prop', span: {start: 7, end: 11}}]`.
     */
    var ExpressionVisitor = /** @class */ (function (_super) {
        tslib_1.__extends(ExpressionVisitor, _super);
        function ExpressionVisitor(expressionStr, absoluteOffset, boundTemplate, targetToIdentifier) {
            var _this = _super.call(this) || this;
            _this.expressionStr = expressionStr;
            _this.absoluteOffset = absoluteOffset;
            _this.boundTemplate = boundTemplate;
            _this.targetToIdentifier = targetToIdentifier;
            _this.identifiers = [];
            return _this;
        }
        /**
         * Returns identifiers discovered in an expression.
         *
         * @param ast expression AST to visit
         * @param source expression AST source code
         * @param absoluteOffset absolute byte offset from start of the file to the start of the AST
         * source code.
         * @param boundTemplate bound target of the entire template, which can be used to query for the
         * entities expressions target.
         * @param targetToIdentifier closure converting a template target node to its identifier.
         */
        ExpressionVisitor.getIdentifiers = function (ast, source, absoluteOffset, boundTemplate, targetToIdentifier) {
            var visitor = new ExpressionVisitor(source, absoluteOffset, boundTemplate, targetToIdentifier);
            visitor.visit(ast);
            return visitor.identifiers;
        };
        ExpressionVisitor.prototype.visit = function (ast) {
            ast.visit(this);
        };
        ExpressionVisitor.prototype.visitMethodCall = function (ast, context) {
            this.visitIdentifier(ast, api_1.IdentifierKind.Method);
            _super.prototype.visitMethodCall.call(this, ast, context);
        };
        ExpressionVisitor.prototype.visitPropertyRead = function (ast, context) {
            this.visitIdentifier(ast, api_1.IdentifierKind.Property);
            _super.prototype.visitPropertyRead.call(this, ast, context);
        };
        ExpressionVisitor.prototype.visitPropertyWrite = function (ast, context) {
            this.visitIdentifier(ast, api_1.IdentifierKind.Property);
            _super.prototype.visitPropertyWrite.call(this, ast, context);
        };
        /**
         * Visits an identifier, adding it to the identifier store if it is useful for indexing.
         *
         * @param ast expression AST the identifier is in
         * @param kind identifier kind
         */
        ExpressionVisitor.prototype.visitIdentifier = function (ast, kind) {
            // The definition of a non-top-level property such as `bar` in `{{foo.bar}}` is currently
            // impossible to determine by an indexer and unsupported by the indexing module.
            // The indexing module also does not currently support references to identifiers declared in the
            // template itself, which have a non-null expression target.
            if (!(ast.receiver instanceof compiler_1.ImplicitReceiver)) {
                return;
            }
            // The source span of the requested AST starts at a location that is offset from the expression.
            var identifierStart = ast.sourceSpan.start - this.absoluteOffset;
            if (!this.expressionStr.substring(identifierStart).startsWith(ast.name)) {
                throw new Error("Impossible state: \"" + ast.name + "\" not found in \"" + this.expressionStr + "\" at location " + identifierStart);
            }
            // Join the relative position of the expression within a node with the absolute position
            // of the node to get the absolute position of the expression in the source code.
            var absoluteStart = this.absoluteOffset + identifierStart;
            var span = new api_1.AbsoluteSourceSpan(absoluteStart, absoluteStart + ast.name.length);
            var targetAst = this.boundTemplate.getExpressionTarget(ast);
            var target = targetAst ? this.targetToIdentifier(targetAst) : null;
            var identifier = {
                name: ast.name,
                span: span,
                kind: kind,
                target: target,
            };
            this.identifiers.push(identifier);
        };
        return ExpressionVisitor;
    }(compiler_1.RecursiveAstVisitor));
    /**
     * Visits the AST of a parsed Angular template. Discovers and stores
     * identifiers of interest, deferring to an `ExpressionVisitor` as needed.
     */
    var TemplateVisitor = /** @class */ (function (_super) {
        tslib_1.__extends(TemplateVisitor, _super);
        /**
         * Creates a template visitor for a bound template target. The bound target can be used when
         * deferred to the expression visitor to get information about the target of an expression.
         *
         * @param boundTemplate bound template target
         */
        function TemplateVisitor(boundTemplate) {
            var _this = _super.call(this) || this;
            _this.boundTemplate = boundTemplate;
            // Identifiers of interest found in the template.
            _this.identifiers = new Set();
            // Map of targets in a template to their identifiers.
            _this.targetIdentifierCache = new Map();
            // Map of elements and templates to their identifiers.
            _this.elementAndTemplateIdentifierCache = new Map();
            return _this;
        }
        /**
         * Visits a node in the template.
         *
         * @param node node to visit
         */
        TemplateVisitor.prototype.visit = function (node) {
            node.visit(this);
        };
        TemplateVisitor.prototype.visitAll = function (nodes) {
            var _this = this;
            nodes.forEach(function (node) { return _this.visit(node); });
        };
        /**
         * Add an identifier for an HTML element and visit its children recursively.
         *
         * @param element
         */
        TemplateVisitor.prototype.visitElement = function (element) {
            var elementIdentifier = this.elementOrTemplateToIdentifier(element);
            this.identifiers.add(elementIdentifier);
            this.visitAll(element.references);
            this.visitAll(element.inputs);
            this.visitAll(element.attributes);
            this.visitAll(element.children);
            this.visitAll(element.outputs);
        };
        TemplateVisitor.prototype.visitTemplate = function (template) {
            var templateIdentifier = this.elementOrTemplateToIdentifier(template);
            this.identifiers.add(templateIdentifier);
            this.visitAll(template.variables);
            this.visitAll(template.attributes);
            this.visitAll(template.templateAttrs);
            this.visitAll(template.children);
            this.visitAll(template.references);
        };
        TemplateVisitor.prototype.visitBoundAttribute = function (attribute) {
            var _this = this;
            // If the bound attribute has no value, it cannot have any identifiers in the value expression.
            if (attribute.valueSpan === undefined) {
                return;
            }
            var identifiers = ExpressionVisitor.getIdentifiers(attribute.value, attribute.valueSpan.toString(), attribute.valueSpan.start.offset, this.boundTemplate, this.targetToIdentifier.bind(this));
            identifiers.forEach(function (id) { return _this.identifiers.add(id); });
        };
        TemplateVisitor.prototype.visitBoundEvent = function (attribute) {
            this.visitExpression(attribute.handler);
        };
        TemplateVisitor.prototype.visitBoundText = function (text) {
            this.visitExpression(text.value);
        };
        TemplateVisitor.prototype.visitReference = function (reference) {
            var referenceIdentifer = this.targetToIdentifier(reference);
            this.identifiers.add(referenceIdentifer);
        };
        TemplateVisitor.prototype.visitVariable = function (variable) {
            var variableIdentifier = this.targetToIdentifier(variable);
            this.identifiers.add(variableIdentifier);
        };
        /** Creates an identifier for a template element or template node. */
        TemplateVisitor.prototype.elementOrTemplateToIdentifier = function (node) {
            // If this node has already been seen, return the cached result.
            if (this.elementAndTemplateIdentifierCache.has(node)) {
                return this.elementAndTemplateIdentifierCache.get(node);
            }
            var name;
            var kind;
            if (node instanceof compiler_1.TmplAstTemplate) {
                name = node.tagName;
                kind = api_1.IdentifierKind.Template;
            }
            else {
                name = node.name;
                kind = api_1.IdentifierKind.Element;
            }
            var sourceSpan = node.startSourceSpan;
            // An element's or template's source span can be of the form `<element>`, `<element />`, or
            // `<element></element>`. Only the selector is interesting to the indexer, so the source is
            // searched for the first occurrence of the element (selector) name.
            var start = this.getStartLocation(name, sourceSpan);
            var absoluteSpan = new api_1.AbsoluteSourceSpan(start, start + name.length);
            // Record the nodes's attributes, which an indexer can later traverse to see if any of them
            // specify a used directive on the node.
            var attributes = node.attributes.map(function (_a) {
                var name = _a.name, sourceSpan = _a.sourceSpan;
                return {
                    name: name,
                    span: new api_1.AbsoluteSourceSpan(sourceSpan.start.offset, sourceSpan.end.offset),
                    kind: api_1.IdentifierKind.Attribute,
                };
            });
            var usedDirectives = this.boundTemplate.getDirectivesOfNode(node) || [];
            var identifier = {
                name: name,
                span: absoluteSpan,
                kind: kind,
                attributes: new Set(attributes),
                usedDirectives: new Set(usedDirectives.map(function (dir) {
                    return {
                        node: dir.ref.node,
                        selector: dir.selector,
                    };
                })),
                // cast b/c pre-TypeScript 3.5 unions aren't well discriminated
            };
            this.elementAndTemplateIdentifierCache.set(node, identifier);
            return identifier;
        };
        /** Creates an identifier for a template reference or template variable target. */
        TemplateVisitor.prototype.targetToIdentifier = function (node) {
            // If this node has already been seen, return the cached result.
            if (this.targetIdentifierCache.has(node)) {
                return this.targetIdentifierCache.get(node);
            }
            var name = node.name, sourceSpan = node.sourceSpan;
            var start = this.getStartLocation(name, sourceSpan);
            var span = new api_1.AbsoluteSourceSpan(start, start + name.length);
            var identifier;
            if (node instanceof compiler_1.TmplAstReference) {
                // If the node is a reference, we care about its target. The target can be an element, a
                // template, a directive applied on a template or element (in which case the directive field
                // is non-null), or nothing at all.
                var refTarget = this.boundTemplate.getReferenceTarget(node);
                var target = null;
                if (refTarget) {
                    if (refTarget instanceof compiler_1.TmplAstElement || refTarget instanceof compiler_1.TmplAstTemplate) {
                        target = {
                            node: this.elementOrTemplateToIdentifier(refTarget),
                            directive: null,
                        };
                    }
                    else {
                        target = {
                            node: this.elementOrTemplateToIdentifier(refTarget.node),
                            directive: refTarget.directive.ref.node,
                        };
                    }
                }
                identifier = {
                    name: name,
                    span: span,
                    kind: api_1.IdentifierKind.Reference,
                    target: target,
                };
            }
            else {
                identifier = {
                    name: name,
                    span: span,
                    kind: api_1.IdentifierKind.Variable,
                };
            }
            this.targetIdentifierCache.set(node, identifier);
            return identifier;
        };
        /** Gets the start location of a string in a SourceSpan */
        TemplateVisitor.prototype.getStartLocation = function (name, context) {
            var localStr = context.toString();
            if (!localStr.includes(name)) {
                throw new Error("Impossible state: \"" + name + "\" not found in \"" + localStr + "\"");
            }
            return context.start.offset + localStr.indexOf(name);
        };
        /**
         * Visits a node's expression and adds its identifiers, if any, to the visitor's state.
         * Only ASTs with information about the expression source and its location are visited.
         *
         * @param node node whose expression to visit
         */
        TemplateVisitor.prototype.visitExpression = function (ast) {
            var _this = this;
            // Only include ASTs that have information about their source and absolute source spans.
            if (ast instanceof compiler_1.ASTWithSource && ast.source !== null) {
                // Make target to identifier mapping closure stateful to this visitor instance.
                var targetToIdentifier = this.targetToIdentifier.bind(this);
                var absoluteOffset = ast.sourceSpan.start;
                var identifiers = ExpressionVisitor.getIdentifiers(ast, ast.source, absoluteOffset, this.boundTemplate, targetToIdentifier);
                identifiers.forEach(function (id) { return _this.identifiers.add(id); });
            }
        };
        return TemplateVisitor;
    }(compiler_1.TmplAstRecursiveVisitor));
    /**
     * Traverses a template AST and builds identifiers discovered in it.
     *
     * @param boundTemplate bound template target, which can be used for querying expression targets.
     * @return identifiers in template
     */
    function getTemplateIdentifiers(boundTemplate) {
        var visitor = new TemplateVisitor(boundTemplate);
        if (boundTemplate.target.template !== undefined) {
            visitor.visitAll(boundTemplate.target.template);
        }
        return visitor.identifiers;
    }
    exports.getTemplateIdentifiers = getTemplateIdentifiers;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVtcGxhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL2luZGV4ZXIvc3JjL3RlbXBsYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCw4Q0FBeVU7SUFDelUsdUVBQTROO0lBaUI1Tjs7Ozs7Ozs7T0FRRztJQUNIO1FBQWdDLDZDQUFtQjtRQUdqRCwyQkFDcUIsYUFBcUIsRUFBbUIsY0FBc0IsRUFDOUQsYUFBeUMsRUFDekMsa0JBQTREO1lBSGpGLFlBSUUsaUJBQU8sU0FDUjtZQUpvQixtQkFBYSxHQUFiLGFBQWEsQ0FBUTtZQUFtQixvQkFBYyxHQUFkLGNBQWMsQ0FBUTtZQUM5RCxtQkFBYSxHQUFiLGFBQWEsQ0FBNEI7WUFDekMsd0JBQWtCLEdBQWxCLGtCQUFrQixDQUEwQztZQUx4RSxpQkFBVyxHQUEyQixFQUFFLENBQUM7O1FBT2xELENBQUM7UUFFRDs7Ozs7Ozs7OztXQVVHO1FBQ0ksZ0NBQWMsR0FBckIsVUFDSSxHQUFRLEVBQUUsTUFBYyxFQUFFLGNBQXNCLEVBQUUsYUFBeUMsRUFDM0Ysa0JBQTREO1lBQzlELElBQU0sT0FBTyxHQUNULElBQUksaUJBQWlCLENBQUMsTUFBTSxFQUFFLGNBQWMsRUFBRSxhQUFhLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztZQUNyRixPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ25CLE9BQU8sT0FBTyxDQUFDLFdBQVcsQ0FBQztRQUM3QixDQUFDO1FBRUQsaUNBQUssR0FBTCxVQUFNLEdBQVE7WUFDWixHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xCLENBQUM7UUFFRCwyQ0FBZSxHQUFmLFVBQWdCLEdBQWUsRUFBRSxPQUFXO1lBQzFDLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxFQUFF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Q0gsc0JBQUM7SUFBRCxDQUFDLEFBMU5ELENBQThCLGtDQUF1QixHQTBOcEQ7SUFFRDs7Ozs7T0FLRztJQUNILFNBQWdCLHNCQUFzQixDQUFDLGFBQXlDO1FBRTlFLElBQU0sT0FBTyxHQUFHLElBQUksZUFBZSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ25ELElBQUksYUFBYSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEtBQUssU0FBUyxFQUFFO1lBQy9DLE9BQU8sQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUNqRDtRQUNELE9BQU8sT0FBTyxDQUFDLFdBQVcsQ0FBQztJQUM3QixDQUFDO0lBUEQsd0RBT0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7QVNULCBBU1RXaXRoU291cmNlLCBCb3VuZFRhcmdldCwgSW1wbGljaXRSZWNlaXZlciwgTWV0aG9kQ2FsbCwgUGFyc2VTb3VyY2VTcGFuLCBQcm9wZXJ0eVJlYWQsIFByb3BlcnR5V3JpdGUsIFJlY3Vyc2l2ZUFzdFZpc2l0b3IsIFRtcGxBc3RCb3VuZEF0dHJpYnV0ZSwgVG1wbEFzdEJvdW5kRXZlbnQsIFRtcGxBc3RCb3VuZFRleHQsIFRtcGxBc3RFbGVtZW50LCBUbXBsQXN0Tm9kZSwgVG1wbEFzdFJlY3Vyc2l2ZVZpc2l0b3IsIFRtcGxBc3RSZWZlcmVuY2UsIFRtcGxBc3RUZW1wbGF0ZSwgVG1wbEFzdFZhcmlhYmxlfSBmcm9tICdAYW5ndWxhci9jb21waWxlcic7XG5pbXBvcnQge0Fic29sdXRlU291cmNlU3BhbiwgQXR0cmlidXRlSWRlbnRpZmllciwgRWxlbWVudElkZW50aWZpZXIsIElkZW50aWZpZXJLaW5kLCBNZXRob2RJZGVudGlmaWVyLCBQcm9wZXJ0eUlkZW50aWZpZXIsIFJlZmVyZW5jZUlkZW50aWZpZXIsIFRlbXBsYXRlTm9kZUlkZW50aWZpZXIsIFRvcExldmVsSWRlbnRpZmllciwgVmFyaWFibGVJZGVudGlmaWVyfSBmcm9tICcuL2FwaSc7XG5pbXBvcnQge0NvbXBvbmVudE1ldGF9IGZyb20gJy4vY29udGV4dCc7XG5cbi8qKlxuICogQSBwYXJzZWQgbm9kZSBpbiBhIHRlbXBsYXRlLCB3aGljaCBtYXkgaGF2ZSBhIG5hbWUgKGlmIGl0IGlzIGEgc2VsZWN0b3IpIG9yXG4gKiBiZSBhbm9ueW1vdXMgKGxpa2UgYSB0ZXh0IHNwYW4pLlxuICovXG5pbnRlcmZhY2UgSFRNTE5vZGUgZXh0ZW5kcyBUbXBsQXN0Tm9kZSB7XG4gIHRhZ05hbWU/OiBzdHJpbmc7XG4gIG5hbWU/OiBzdHJpbmc7XG59XG5cbnR5cGUgRXhwcmVzc2lvbklkZW50aWZpZXIgPSBQcm9wZXJ0eUlkZW50aWZpZXJ8TWV0aG9kSWRlbnRpZmllcjtcbnR5cGUgVG1wbFRhcmdldCA9IFRtcGxBc3RSZWZlcmVuY2V8VG1wbEFzdFZhcmlhYmxlO1xudHlwZSBUYXJnZXRJZGVudGlmaWVyID0gUmVmZXJlbmNlSWRlbnRpZmllcnxWYXJpYWJsZUlkZW50aWZpZXI7XG50eXBlIFRhcmdldElkZW50aWZpZXJNYXAgPSBNYXA8VG1wbFRhcmdldCwgVGFyZ2V0SWRlbnRpZmllcj47XG5cbi8qKlxuICogVmlzaXRzIHRoZSBBU1Qgb2YgYW4gQW5ndWxhciB0ZW1wbGF0ZSBzeW50YXggZXhwcmVzc2lvbiwgZmluZGluZyBpbnRlcmVzdGluZ1xuICogZW50aXRpZXMgKHZhcmlhYmxlIHJlZmVyZW5jZXMsIGV0Yy4pLiBDcmVhdGVzIGFuIGFycmF5IG9mIEVudGl0aWVzIGZvdW5kIGluXG4gKiB0aGUgZXhwcmVzc2lvbiwgd2l0aCB0aGUgbG9jYXRpb24gb2YgdGhlIEVudGl0aWVzIGJlaW5nIHJlbGF0aXZlIHRvIHRoZVxuICogZXhwcmVzc2lvbi5cbiAqXG4gKiBWaXNpdGluZyBgdGV4dCB7e3Byb3B9fWAgd2lsbCByZXR1cm5cbiAqIGBbVG9wTGV2ZWxJZGVudGlmaWVyIHtuYW1lOiAncHJvcCcsIHNwYW46IHtzdGFydDogNywgZW5kOiAxMX19XWAuXG4gKi9cbmNsYXNzIEV4cHJlc3Npb25WaXNpdG9yIGV4dGVuZHMgUmVjdXJzaXZlQXN0VmlzaXRvciB7XG4gIHJlYWRvbmx5IGlkZW50aWZpZXJzOiBFeHByZXNzaW9uSWRlbnRpZmllcltdID0gW107XG5cbiAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgcmVhZG9ubHkgZXhwcmVzc2lvblN0cjogc3RyaW5nLCBwcml2YXRlIHJlYWRvbmx5IGFic29sdXRlT2Zmc2V0OiBudW1iZXIsXG4gICAgICBwcml2YXRlIHJlYWRvbmx5IGJvdW5kVGVtcGxhdGU6IEJvdW5kVGFyZ2V0PENvbXBvbmVudE1ldGE+LFxuICAgICAgcHJpdmF0ZSByZWFkb25seSB0YXJnZXRUb0lkZW50aWZpZXI6ICh0YXJnZXQ6IFRtcGxUYXJnZXQpID0+IFRhcmdldElkZW50aWZpZXIpIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgaWRlbnRpZmllcnMgZGlzY292ZXJlZCBpbiBhbiBleHByZXNzaW9uLlxuICAgKlxuICAgKiBAcGFyYW0gYXN0IGV4cHJlc3Npb24gQVNUIHRvIHZpc2l0XG4gICAqIEBwYXJhbSBzb3VyY2UgZXhwcmVzc2lvbiBBU1Qgc291cmNlIGNvZGVcbiAgICogQHBhcmFtIGFic29sdXRlT2Zmc2V0IGFic29sdXRlIGJ5dGUgb2Zmc2V0IGZyb20gc3RhcnQgb2YgdGhlIGZpbGUgdG8gdGhlIHN0YXJ0IG9mIHRoZSBBU1RcbiAgICogc291cmNlIGNvZGUuXG4gICAqIEBwYXJhbSBib3VuZFRlbXBsYXRlIGJvdW5kIHRhcmdldCBvZiB0aGUgZW50aXJlIHRlbXBsYXRlLCB3aGljaCBjYW4gYmUgdXNlZCB0byBxdWVyeSBmb3IgdGhlXG4gICAqIGVudGl0aWVzIGV4cHJlc3Npb25zIHRhcmdldC5cbiAgICogQHBhcmFtIHRhcmdldFRvSWRlbnRpZmllciBjbG9zdXJlIGNvbnZlcnRpbmcgYSB0ZW1wbGF0ZSB0YXJnZXQgbm9kZSB0byBpdHMgaWRlbnRpZmllci5cbiAgICovXG4gIHN0YXRpYyBnZXRJZGVudGlmaWVycyhcbiAgICAgIGFzdDogQVNULCBzb3VyY2U6IHN0cmluZywgYWJzb2x1dGVPZmZzZXQ6IG51bWJlciwgYm91bmRUZW1wbGF0ZTogQm91bmRUYXJnZXQ8Q29tcG9uZW50TWV0YT4sXG4gICAgICB0YXJnZXRUb0lkZW50aWZpZXI6ICh0YXJnZXQ6IFRtcGxUYXJnZXQpID0+IFRhcmdldElkZW50aWZpZXIpOiBUb3BMZXZlbElkZW50aWZpZXJbXSB7XG4gICAgY29uc3QgdmlzaXRvciA9XG4gICAgICAgIG5ldyBFeHByZXNzaW9uVmlzaXRvcihzb3VyY2UsIGFic29sdXRlT2Zmc2V0LCBib3VuZFRlbXBsYXRlLCB0YXJnZXRUb0lkZW50aWZpZXIpO1xuICAgIHZpc2l0b3IudmlzaXQoYXN0KTtcbiAgICByZXR1cm4gdmlzaXRvci5pZGVudGlmaWVycztcbiAgfVxuXG4gIHZpc2l0KGFzdDogQVNUKSB7XG4gICAgYXN0LnZpc2l0KHRoaXMpO1xuICB9XG5cbiAgdmlzaXRNZXRob2RDYWxsKGFzdDogTWV0aG9kQ2FsbCwgY29udGV4dDoge30pIHtcbiAgICB0aGlzLnZpc2l0SWRlbnRpZmllcihhc3QsIElkZW50aWZpZXJLaW5kLk1ldGhvZCk7XG4gICAgc3VwZXIudmlzaXRNZXRob2RDYWxsKGFzdCwgY29udGV4dCk7XG4gIH1cblxuICB2aXNpdFByb3BlcnR5UmVhZChhc3Q6IFByb3BlcnR5UmVhZCwgY29udGV4dDoge30pIHtcbiAgICB0aGlzLnZpc2l0SWRlbnRpZmllcihhc3QsIElkZW50aWZpZXJLaW5kLlByb3BlcnR5KTtcbiAgICBzdXBlci52aXNpdFByb3BlcnR5UmVhZChhc3QsIGNvbnRleHQpO1xuICB9XG5cbiAgdmlzaXRQcm9wZXJ0eVdyaXRlKGFzdDogUHJvcGVydHlXcml0ZSwgY29udGV4dDoge30pIHtcbiAgICB0aGlzLnZpc2l0SWRlbnRpZmllcihhc3QsIElkZW50aWZpZXJLaW5kLlByb3BlcnR5KTtcbiAgICBzdXBlci52aXNpdFByb3BlcnR5V3JpdGUoYXN0LCBjb250ZXh0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBWaXNpdHMgYW4gaWRlbnRpZmllciwgYWRkaW5nIGl0IHRvIHRoZSBpZGVudGlmaWVyIHN0b3JlIGlmIGl0IGlzIHVzZWZ1bCBmb3IgaW5kZXhpbmcuXG4gICAqXG4gICAqIEBwYXJhbSBhc3QgZXhwcmVzc2lvbiBBU1QgdGhlIGlkZW50aWZpZXIgaXMgaW5cbiAgICogQHBhcmFtIGtpbmQgaWRlbnRpZmllciBraW5kXG4gICAqL1xuICBwcml2YXRlIHZpc2l0SWRlbnRpZmllcihcbiAgICAgIGFzdDogQVNUJntuYW1lOiBzdHJpbmcsIHJlY2VpdmVyOiBBU1R9LCBraW5kOiBFeHByZXNzaW9uSWRlbnRpZmllclsna2luZCddKSB7XG4gICAgLy8gVGhlIGRlZmluaXRpb24gb2YgYSBub24tdG9wLWxldmVsIHByb3BlcnR5IHN1Y2ggYXMgYGJhcmAgaW4gYHt7Zm9vLmJhcn19YCBpcyBjdXJyZW50bHlcbiAgICAvLyBpbXBvc3NpYmxlIHRvIGRldGVybWluZSBieSBhbiBpbmRleGVyIGFuZCB1bnN1cHBvcnRlZCBieSB0aGUgaW5kZXhpbmcgbW9kdWxlLlxuICAgIC8vIFRoZSBpbmRleGluZyBtb2R1bGUgYWxzbyBkb2VzIG5vdCBjdXJyZW50bHkgc3VwcG9ydCByZWZlcmVuY2VzIHRvIGlkZW50aWZpZXJzIGRlY2xhcmVkIGluIHRoZVxuICAgIC8vIHRlbXBsYXRlIGl0c2VsZiwgd2hpY2ggaGF2ZSBhIG5vbi1udWxsIGV4cHJlc3Npb24gdGFyZ2V0LlxuICAgIGlmICghKGFzdC5yZWNlaXZlciBpbnN0YW5jZW9mIEltcGxpY2l0UmVjZWl2ZXIpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gVGhlIHNvdXJjZSBzcGFuIG9mIHRoZSByZXF1ZXN0ZWQgQVNUIHN0YXJ0cyBhdCBhIGxvY2F0aW9uIHRoYXQgaXMgb2Zmc2V0IGZyb20gdGhlIGV4cHJlc3Npb24uXG4gICAgY29uc3QgaWRlbnRpZmllclN0YXJ0ID0gYXN0LnNvdXJjZVNwYW4uc3RhcnQgLSB0aGlzLmFic29sdXRlT2Zmc2V0O1xuICAgIGlmICghdGhpcy5leHByZXNzaW9uU3RyLnN1YnN0cmluZyhpZGVudGlmaWVyU3RhcnQpLnN0YXJ0c1dpdGgoYXN0Lm5hbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEltcG9zc2libGUgc3RhdGU6IFwiJHthc3QubmFtZX1cIiBub3QgZm91bmQgaW4gXCIke1xuICAgICAgICAgIHRoaXMuZXhwcmVzc2lvblN0cn1cIiBhdCBsb2NhdGlvbiAke2lkZW50aWZpZXJTdGFydH1gKTtcbiAgICB9XG5cbiAgICAvLyBKb2luIHRoZSByZWxhdGl2ZSBwb3NpdGlvbiBvZiB0aGUgZXhwcmVzc2lvbiB3aXRoaW4gYSBub2RlIHdpdGggdGhlIGFic29sdXRlIHBvc2l0aW9uXG4gICAgLy8gb2YgdGhlIG5vZGUgdG8gZ2V0IHRoZSBhYnNvbHV0ZSBwb3NpdGlvbiBvZiB0aGUgZXhwcmVzc2lvbiBpbiB0aGUgc291cmNlIGNvZGUuXG4gICAgY29uc3QgYWJzb2x1dGVTdGFydCA9IHRoaXMuYWJzb2x1dGVPZmZzZXQgKyBpZGVudGlmaWVyU3RhcnQ7XG4gICAgY29uc3Qgc3BhbiA9IG5ldyBBYnNvbHV0ZVNvdXJjZVNwYW4oYWJzb2x1dGVTdGFydCwgYWJzb2x1dGVTdGFydCArIGFzdC5uYW1lLmxlbmd0aCk7XG5cbiAgICBjb25zdCB0YXJnZXRBc3QgPSB0aGlzLmJvdW5kVGVtcGxhdGUuZ2V0RXhwcmVzc2lvblRhcmdldChhc3QpO1xuICAgIGNvbnN0IHRhcmdldCA9IHRhcmdldEFzdCA/IHRoaXMudGFyZ2V0VG9JZGVudGlmaWVyKHRhcmdldEFzdCkgOiBudWxsO1xuICAgIGNvbnN0IGlkZW50aWZpZXIgPSB7XG4gICAgICBuYW1lOiBhc3QubmFtZSxcbiAgICAgIHNwYW4sXG4gICAgICBraW5kLFxuICAgICAgdGFyZ2V0LFxuICAgIH0gYXMgRXhwcmVzc2lvbklkZW50aWZpZXI7XG5cbiAgICB0aGlzLmlkZW50aWZpZXJzLnB1c2goaWRlbnRpZmllcik7XG4gIH1cbn1cblxuLyoqXG4gKiBWaXNpdHMgdGhlIEFTVCBvZiBhIHBhcnNlZCBBbmd1bGFyIHRlbXBsYXRlLiBEaXNjb3ZlcnMgYW5kIHN0b3Jlc1xuICogaWRlbnRpZmllcnMgb2YgaW50ZXJlc3QsIGRlZmVycmluZyB0byBhbiBgRXhwcmVzc2lvblZpc2l0b3JgIGFzIG5lZWRlZC5cbiAqL1xuY2xhc3MgVGVtcGxhdGVWaXNpdG9yIGV4dGVuZHMgVG1wbEFzdFJlY3Vyc2l2ZVZpc2l0b3Ige1xuICAvLyBJZGVudGlmaWVycyBvZiBpbnRlcmVzdCBmb3VuZCBpbiB0aGUgdGVtcGxhdGUuXG4gIHJlYWRvbmx5IGlkZW50aWZpZXJzID0gbmV3IFNldDxUb3BMZXZlbElkZW50aWZpZXI+KCk7XG5cbiAgLy8gTWFwIG9mIHRhcmdldHMgaW4gYSB0ZW1wbGF0ZSB0byB0aGVpciBpZGVudGlmaWVycy5cbiAgcHJpdmF0ZSByZWFkb25seSB0YXJnZXRJZGVudGlmaWVyQ2FjaGU6IFRhcmdldElkZW50aWZpZXJNYXAgPSBuZXcgTWFwKCk7XG5cbiAgLy8gTWFwIG9mIGVsZW1lbnRzIGFuZCB0ZW1wbGF0ZXMgdG8gdGhlaXIgaWRlbnRpZmllcnMuXG4gIHByaXZhdGUgcmVhZG9ubHkgZWxlbWVudEFuZFRlbXBsYXRlSWRlbnRpZmllckNhY2hlID1cbiAgICAgIG5ldyBNYXA8VG1wbEFzdEVsZW1lbnR8VG1wbEFzdFRlbXBsYXRlLCBFbGVtZW50SWRlbnRpZmllcnxUZW1wbGF0ZU5vZGVJZGVudGlmaWVyPigpO1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgdGVtcGxhdGUgdmlzaXRvciBmb3IgYSBib3VuZCB0ZW1wbGF0ZSB0YXJnZXQuIFRoZSBib3VuZCB0YXJnZXQgY2FuIGJlIHVzZWQgd2hlblxuICAgKiBkZWZlcnJlZCB0byB0aGUgZXhwcmVzc2lvbiB2aXNpdG9yIHRvIGdldCBpbmZvcm1hdGlvbiBhYm91dCB0aGUgdGFyZ2V0IG9mIGFuIGV4cHJlc3Npb24uXG4gICAqXG4gICAqIEBwYXJhbSBib3VuZFRlbXBsYXRlIGJvdW5kIHRlbXBsYXRlIHRhcmdldFxuICAgKi9cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBib3VuZFRlbXBsYXRlOiBCb3VuZFRhcmdldDxDb21wb25lbnRNZXRhPikge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICAvKipcbiAgICogVmlzaXRzIGEgbm9kZSBpbiB0aGUgdGVtcGxhdGUuXG4gICAqXG4gICAqIEBwYXJhbSBub2RlIG5vZGUgdG8gdmlzaXRcbiAgICovXG4gIHZpc2l0KG5vZGU6IEhUTUxOb2RlKSB7XG4gICAgbm9kZS52aXNpdCh0aGlzKTtcbiAgfVxuXG4gIHZpc2l0QWxsKG5vZGVzOiBUbXBsQXN0Tm9kZVtdKSB7XG4gICAgbm9kZXMuZm9yRWFjaChub2RlID0+IHRoaXMudmlzaXQobm9kZSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhbiBpZGVudGlmaWVyIGZvciBhbiBIVE1MIGVsZW1lbnQgYW5kIHZpc2l0IGl0cyBjaGlsZHJlbiByZWN1cnNpdmVseS5cbiAgICpcbiAgICogQHBhcmFtIGVsZW1lbnRcbiAgICovXG4gIHZpc2l0RWxlbWVudChlbGVtZW50OiBUbXBsQXN0RWxlbWVudCkge1xuICAgIGNvbnN0IGVsZW1lbnRJZGVudGlmaWVyID0gdGhpcy5lbGVtZW50T3JUZW1wbGF0ZVRvSWRlbnRpZmllcihlbGVtZW50KTtcblxuICAgIHRoaXMuaWRlbnRpZmllcnMuYWRkKGVsZW1lbnRJZGVudGlmaWVyKTtcblxuICAgIHRoaXMudmlzaXRBbGwoZWxlbWVudC5yZWZlcmVuY2VzKTtcbiAgICB0aGlzLnZpc2l0QWxsKGVsZW1lbnQuaW5wdXRzKTtcbiAgICB0aGlzLnZpc2l0QWxsKGVsZW1lbnQuYXR0cmlidXRlcyk7XG4gICAgdGhpcy52aXNpdEFsbChlbGVtZW50LmNoaWxkcmVuKTtcbiAgICB0aGlzLnZpc2l0QWxsKGVsZW1lbnQub3V0cHV0cyk7XG4gIH1cbiAgdmlzaXRUZW1wbGF0ZSh0ZW1wbGF0ZTogVG1wbEFzdFRlbXBsYXRlKSB7XG4gICAgY29uc3QgdGVtcGxhdGVJZGVudGlmaWVyID0gdGhpcy5lbGVtZW50T3JUZW1wbGF0ZVRvSWRlbnRpZmllcih0ZW1wbGF0ZSk7XG5cbiAgICB0aGlzLmlkZW50aWZpZXJzLmFkZCh0ZW1wbGF0ZUlkZW50aWZpZXIpO1xuXG4gICAgdGhpcy52aXNpdEFsbCh0ZW1wbGF0ZS52YXJpYWJsZXMpO1xuICAgIHRoaXMudmlzaXRBbGwodGVtcGxhdGUuYXR0cmlidXRlcyk7XG4gICAgdGhpcy52aXNpdEFsbCh0ZW1wbGF0ZS50ZW1wbGF0ZUF0dHJzKTtcbiAgICB0aGlzLnZpc2l0QWxsKHRlbXBsYXRlLmNoaWxkcmVuKTtcbiAgICB0aGlzLnZpc2l0QWxsKHRlbXBsYXRlLnJlZmVyZW5jZXMpO1xuICB9XG4gIHZpc2l0Qm91bmRBdHRyaWJ1dGUoYXR0cmlidXRlOiBUbXBsQXN0Qm91bmRBdHRyaWJ1dGUpIHtcbiAgICAvLyBJZiB0aGUgYm91bmQgYXR0cmlidXRlIGhhcyBubyB2YWx1ZSwgaXQgY2Fubm90IGhhdmUgYW55IGlkZW50aWZpZXJzIGluIHRoZSB2YWx1ZSBleHByZXNzaW9uLlxuICAgIGlmIChhdHRyaWJ1dGUudmFsdWVTcGFuID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBpZGVudGlmaWVycyA9IEV4cHJlc3Npb25WaXNpdG9yLmdldElkZW50aWZpZXJzKFxuICAgICAgICBhdHRyaWJ1dGUudmFsdWUsIGF0dHJpYnV0ZS52YWx1ZVNwYW4udG9TdHJpbmcoKSwgYXR0cmlidXRlLnZhbHVlU3Bhbi5zdGFydC5vZmZzZXQsXG4gICAgICAgIHRoaXMuYm91bmRUZW1wbGF0ZSwgdGhpcy50YXJnZXRUb0lkZW50aWZpZXIuYmluZCh0aGlzKSk7XG4gICAgaWRlbnRpZmllcnMuZm9yRWFjaChpZCA9PiB0aGlzLmlkZW50aWZpZXJzLmFkZChpZCkpO1xuICB9XG4gIHZpc2l0Qm91bmRFdmVudChhdHRyaWJ1dGU6IFRtcGxBc3RCb3VuZEV2ZW50KSB7XG4gICAgdGhpcy52aXNpdEV4cHJlc3Npb24oYXR0cmlidXRlLmhhbmRsZXIpO1xuICB9XG4gIHZpc2l0Qm91bmRUZXh0KHRleHQ6IFRtcGxBc3RCb3VuZFRleHQpIHtcbiAgICB0aGlzLnZpc2l0RXhwcmVzc2lvbih0ZXh0LnZhbHVlKTtcbiAgfVxuICB2aXNpdFJlZmVyZW5jZShyZWZlcmVuY2U6IFRtcGxBc3RSZWZlcmVuY2UpIHtcbiAgICBjb25zdCByZWZlcmVuY2VJZGVudGlmZXIgPSB0aGlzLnRhcmdldFRvSWRlbnRpZmllcihyZWZlcmVuY2UpO1xuXG4gICAgdGhpcy5pZGVudGlmaWVycy5hZGQocmVmZXJlbmNlSWRlbnRpZmVyKTtcbiAgfVxuICB2aXNpdFZhcmlhYmxlKHZhcmlhYmxlOiBUbXBsQXN0VmFyaWFibGUpIHtcbiAgICBjb25zdCB2YXJpYWJsZUlkZW50aWZpZXIgPSB0aGlzLnRhcmdldFRvSWRlbnRpZmllcih2YXJpYWJsZSk7XG5cbiAgICB0aGlzLmlkZW50aWZpZXJzLmFkZCh2YXJpYWJsZUlkZW50aWZpZXIpO1xuICB9XG5cbiAgLyoqIENyZWF0ZXMgYW4gaWRlbnRpZmllciBmb3IgYSB0ZW1wbGF0ZSBlbGVtZW50IG9yIHRlbXBsYXRlIG5vZGUuICovXG4gIHByaXZhdGUgZWxlbWVudE9yVGVtcGxhdGVUb0lkZW50aWZpZXIobm9kZTogVG1wbEFzdEVsZW1lbnR8VG1wbEFzdFRlbXBsYXRlKTogRWxlbWVudElkZW50aWZpZXJcbiAgICAgIHxUZW1wbGF0ZU5vZGVJZGVudGlmaWVyIHtcbiAgICAvLyBJZiB0aGlzIG5vZGUgaGFzIGFscmVhZHkgYmVlbiBzZWVuLCByZXR1cm4gdGhlIGNhY2hlZCByZXN1bHQuXG4gICAgaWYgKHRoaXMuZWxlbWVudEFuZFRlbXBsYXRlSWRlbnRpZmllckNhY2hlLmhhcyhub2RlKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudEFuZFRlbXBsYXRlSWRlbnRpZmllckNhY2hlLmdldChub2RlKSE7XG4gICAgfVxuXG4gICAgbGV0IG5hbWU6IHN0cmluZztcbiAgICBsZXQga2luZDogSWRlbnRpZmllcktpbmQuRWxlbWVudHxJZGVudGlmaWVyS2luZC5UZW1wbGF0ZTtcbiAgICBpZiAobm9kZSBpbnN0YW5jZW9mIFRtcGxBc3RUZW1wbGF0ZSkge1xuICAgICAgbmFtZSA9IG5vZGUudGFnTmFtZTtcbiAgICAgIGtpbmQgPSBJZGVudGlmaWVyS2luZC5UZW1wbGF0ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmFtZSA9IG5vZGUubmFtZTtcbiAgICAgIGtpbmQgPSBJZGVudGlmaWVyS2luZC5FbGVtZW50O1xuICAgIH1cbiAgICBjb25zdCBzb3VyY2VTcGFuID0gbm9kZS5zdGFydFNvdXJjZVNwYW47XG4gICAgLy8gQW4gZWxlbWVudCdzIG9yIHRlbXBsYXRlJ3Mgc291cmNlIHNwYW4gY2FuIGJlIG9mIHRoZSBmb3JtIGA8ZWxlbWVudD5gLCBgPGVsZW1lbnQgLz5gLCBvclxuICAgIC8vIGA8ZWxlbWVudD48L2VsZW1lbnQ+YC4gT25seSB0aGUgc2VsZWN0b3IgaXMgaW50ZXJlc3RpbmcgdG8gdGhlIGluZGV4ZXIsIHNvIHRoZSBzb3VyY2UgaXNcbiAgICAvLyBzZWFyY2hlZCBmb3IgdGhlIGZpcnN0IG9jY3VycmVuY2Ugb2YgdGhlIGVsZW1lbnQgKHNlbGVjdG9yKSBuYW1lLlxuICAgIGNvbnN0IHN0YXJ0ID0gdGhpcy5nZXRTdGFydExvY2F0aW9uKG5hbWUsIHNvdXJjZVNwYW4pO1xuICAgIGNvbnN0IGFic29sdXRlU3BhbiA9IG5ldyBBYnNvbHV0ZVNvdXJjZVNwYW4oc3RhcnQsIHN0YXJ0ICsgbmFtZS5sZW5ndGgpO1xuXG4gICAgLy8gUmVjb3JkIHRoZSBub2RlcydzIGF0dHJpYnV0ZXMsIHdoaWNoIGFuIGluZGV4ZXIgY2FuIGxhdGVyIHRyYXZlcnNlIHRvIHNlZSBpZiBhbnkgb2YgdGhlbVxuICAgIC8vIHNwZWNpZnkgYSB1c2VkIGRpcmVjdGl2ZSBvbiB0aGUgbm9kZS5cbiAgICBjb25zdCBhdHRyaWJ1dGVzID0gbm9kZS5hdHRyaWJ1dGVzLm1hcCgoe25hbWUsIHNvdXJjZVNwYW59KTogQXR0cmlidXRlSWRlbnRpZmllciA9PiB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBuYW1lLFxuICAgICAgICBzcGFuOiBuZXcgQWJzb2x1dGVTb3VyY2VTcGFuKHNvdXJjZVNwYW4uc3RhcnQub2Zmc2V0LCBzb3VyY2VTcGFuLmVuZC5vZmZzZXQpLFxuICAgICAgICBraW5kOiBJZGVudGlmaWVyS2luZC5BdHRyaWJ1dGUsXG4gICAgICB9O1xuICAgIH0pO1xuICAgIGNvbnN0IHVzZWREaXJlY3RpdmVzID0gdGhpcy5ib3VuZFRlbXBsYXRlLmdldERpcmVjdGl2ZXNPZk5vZGUobm9kZSkgfHwgW107XG5cbiAgICBjb25zdCBpZGVudGlmaWVyID0ge1xuICAgICAgbmFtZSxcbiAgICAgIHNwYW46IGFic29sdXRlU3BhbixcbiAgICAgIGtpbmQsXG4gICAgICBhdHRyaWJ1dGVzOiBuZXcgU2V0KGF0dHJpYnV0ZXMpLFxuICAgICAgdXNlZERpcmVjdGl2ZXM6IG5ldyBTZXQodXNlZERpcmVjdGl2ZXMubWFwKGRpciA9PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgbm9kZTogZGlyLnJlZi5ub2RlLFxuICAgICAgICAgIHNlbGVjdG9yOiBkaXIuc2VsZWN0b3IsXG4gICAgICAgIH07XG4gICAgICB9KSksXG4gICAgICAvLyBjYXN0IGIvYyBwcmUtVHlwZVNjcmlwdCAzLjUgdW5pb25zIGFyZW4ndCB3ZWxsIGRpc2NyaW1pbmF0ZWRcbiAgICB9IGFzIEVsZW1lbnRJZGVudGlmaWVyIHxcbiAgICAgICAgVGVtcGxhdGVOb2RlSWRlbnRpZmllcjtcblxuICAgIHRoaXMuZWxlbWVudEFuZFRlbXBsYXRlSWRlbnRpZmllckNhY2hlLnNldChub2RlLCBpZGVudGlmaWVyKTtcbiAgICByZXR1cm4gaWRlbnRpZmllcjtcbiAgfVxuXG4gIC8qKiBDcmVhdGVzIGFuIGlkZW50aWZpZXIgZm9yIGEgdGVtcGxhdGUgcmVmZXJlbmNlIG9yIHRlbXBsYXRlIHZhcmlhYmxlIHRhcmdldC4gKi9cbiAgcHJpdmF0ZSB0YXJnZXRUb0lkZW50aWZpZXIobm9kZTogVG1wbEFzdFJlZmVyZW5jZXxUbXBsQXN0VmFyaWFibGUpOiBUYXJnZXRJZGVudGlmaWVyIHtcbiAgICAvLyBJZiB0aGlzIG5vZGUgaGFzIGFscmVhZHkgYmVlbiBzZWVuLCByZXR1cm4gdGhlIGNhY2hlZCByZXN1bHQuXG4gICAgaWYgKHRoaXMudGFyZ2V0SWRlbnRpZmllckNhY2hlLmhhcyhub2RlKSkge1xuICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0SWRlbnRpZmllckNhY2hlLmdldChub2RlKSE7XG4gICAgfVxuXG4gICAgY29uc3Qge25hbWUsIHNvdXJjZVNwYW59ID0gbm9kZTtcbiAgICBjb25zdCBzdGFydCA9IHRoaXMuZ2V0U3RhcnRMb2NhdGlvbihuYW1lLCBzb3VyY2VTcGFuKTtcbiAgICBjb25zdCBzcGFuID0gbmV3IEFic29sdXRlU291cmNlU3BhbihzdGFydCwgc3RhcnQgKyBuYW1lLmxlbmd0aCk7XG4gICAgbGV0IGlkZW50aWZpZXI6IFJlZmVyZW5jZUlkZW50aWZpZXJ8VmFyaWFibGVJZGVudGlmaWVyO1xuICAgIGlmIChub2RlIGluc3RhbmNlb2YgVG1wbEFzdFJlZmVyZW5jZSkge1xuICAgICAgLy8gSWYgdGhlIG5vZGUgaXMgYSByZWZlcmVuY2UsIHdlIGNhcmUgYWJvdXQgaXRzIHRhcmdldC4gVGhlIHRhcmdldCBjYW4gYmUgYW4gZWxlbWVudCwgYVxuICAgICAgLy8gdGVtcGxhdGUsIGEgZGlyZWN0aXZlIGFwcGxpZWQgb24gYSB0ZW1wbGF0ZSBvciBlbGVtZW50IChpbiB3aGljaCBjYXNlIHRoZSBkaXJlY3RpdmUgZmllbGRcbiAgICAgIC8vIGlzIG5vbi1udWxsKSwgb3Igbm90aGluZyBhdCBhbGwuXG4gICAgICBjb25zdCByZWZUYXJnZXQgPSB0aGlzLmJvdW5kVGVtcGxhdGUuZ2V0UmVmZXJlbmNlVGFyZ2V0KG5vZGUpO1xuICAgICAgbGV0IHRhcmdldCA9IG51bGw7XG4gICAgICBpZiAocmVmVGFyZ2V0KSB7XG4gICAgICAgIGlmIChyZWZUYXJnZXQgaW5zdGFuY2VvZiBUbXBsQXN0RWxlbWVudCB8fCByZWZUYXJnZXQgaW5zdGFuY2VvZiBUbXBsQXN0VGVtcGxhdGUpIHtcbiAgICAgICAgICB0YXJnZXQgPSB7XG4gICAgICAgICAgICBub2RlOiB0aGlzLmVsZW1lbnRPclRlbXBsYXRlVG9JZGVudGlmaWVyKHJlZlRhcmdldCksXG4gICAgICAgICAgICBkaXJlY3RpdmU6IG51bGwsXG4gICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0YXJnZXQgPSB7XG4gICAgICAgICAgICBub2RlOiB0aGlzLmVsZW1lbnRPclRlbXBsYXRlVG9JZGVudGlmaWVyKHJlZlRhcmdldC5ub2RlKSxcbiAgICAgICAgICAgIGRpcmVjdGl2ZTogcmVmVGFyZ2V0LmRpcmVjdGl2ZS5yZWYubm9kZSxcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlkZW50aWZpZXIgPSB7XG4gICAgICAgIG5hbWUsXG4gICAgICAgIHNwYW4sXG4gICAgICAgIGtpbmQ6IElkZW50aWZpZXJLaW5kLlJlZmVyZW5jZSxcbiAgICAgICAgdGFyZ2V0LFxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWRlbnRpZmllciA9IHtcbiAgICAgICAgbmFtZSxcbiAgICAgICAgc3BhbixcbiAgICAgICAga2luZDogSWRlbnRpZmllcktpbmQuVmFyaWFibGUsXG4gICAgICB9O1xuICAgIH1cblxuICAgIHRoaXMudGFyZ2V0SWRlbnRpZmllckNhY2hlLnNldChub2RlLCBpZGVudGlmaWVyKTtcbiAgICByZXR1cm4gaWRlbnRpZmllcjtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBzdGFydCBsb2NhdGlvbiBvZiBhIHN0cmluZyBpbiBhIFNvdXJjZVNwYW4gKi9cbiAgcHJpdmF0ZSBnZXRTdGFydExvY2F0aW9uKG5hbWU6IHN0cmluZywgY29udGV4dDogUGFyc2VTb3VyY2VTcGFuKTogbnVtYmVyIHtcbiAgICBjb25zdCBsb2NhbFN0ciA9IGNvbnRleHQudG9TdHJpbmcoKTtcbiAgICBpZiAoIWxvY2FsU3RyLmluY2x1ZGVzKG5hbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEltcG9zc2libGUgc3RhdGU6IFwiJHtuYW1lfVwiIG5vdCBmb3VuZCBpbiBcIiR7bG9jYWxTdHJ9XCJgKTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbnRleHQuc3RhcnQub2Zmc2V0ICsgbG9jYWxTdHIuaW5kZXhPZihuYW1lKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBWaXNpdHMgYSBub2RlJ3MgZXhwcmVzc2lvbiBhbmQgYWRkcyBpdHMgaWRlbnRpZmllcnMsIGlmIGFueSwgdG8gdGhlIHZpc2l0b3IncyBzdGF0ZS5cbiAgICogT25seSBBU1RzIHdpdGggaW5mb3JtYXRpb24gYWJvdXQgdGhlIGV4cHJlc3Npb24gc291cmNlIGFuZCBpdHMgbG9jYXRpb24gYXJlIHZpc2l0ZWQuXG4gICAqXG4gICAqIEBwYXJhbSBub2RlIG5vZGUgd2hvc2UgZXhwcmVzc2lvbiB0byB2aXNpdFxuICAgKi9cbiAgcHJpdmF0ZSB2aXNpdEV4cHJlc3Npb24oYXN0OiBBU1QpIHtcbiAgICAvLyBPbmx5IGluY2x1ZGUgQVNUcyB0aGF0IGhhdmUgaW5mb3JtYXRpb24gYWJvdXQgdGhlaXIgc291cmNlIGFuZCBhYnNvbHV0ZSBzb3VyY2Ugc3BhbnMuXG4gICAgaWYgKGFzdCBpbnN0YW5jZW9mIEFTVFdpdGhTb3VyY2UgJiYgYXN0LnNvdXJjZSAhPT0gbnVsbCkge1xuICAgICAgLy8gTWFrZSB0YXJnZXQgdG8gaWRlbnRpZmllciBtYXBwaW5nIGNsb3N1cmUgc3RhdGVmdWwgdG8gdGhpcyB2aXNpdG9yIGluc3RhbmNlLlxuICAgICAgY29uc3QgdGFyZ2V0VG9JZGVudGlmaWVyID0gdGhpcy50YXJnZXRUb0lkZW50aWZpZXIuYmluZCh0aGlzKTtcbiAgICAgIGNvbnN0IGFic29sdXRlT2Zmc2V0ID0gYXN0LnNvdXJjZVNwYW4uc3RhcnQ7XG4gICAgICBjb25zdCBpZGVudGlmaWVycyA9IEV4cHJlc3Npb25WaXNpdG9yLmdldElkZW50aWZpZXJzKFxuICAgICAgICAgIGFzdCwgYXN0LnNvdXJjZSwgYWJzb2x1dGVPZmZzZXQsIHRoaXMuYm91bmRUZW1wbGF0ZSwgdGFyZ2V0VG9JZGVudGlmaWVyKTtcbiAgICAgIGlkZW50aWZpZXJzLmZvckVhY2goaWQgPT4gdGhpcy5pZGVudGlmaWVycy5hZGQoaWQpKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBUcmF2ZXJzZXMgYSB0ZW1wbGF0ZSBBU1QgYW5kIGJ1aWxkcyBpZGVudGlmaWVycyBkaXNjb3ZlcmVkIGluIGl0LlxuICpcbiAqIEBwYXJhbSBib3VuZFRlbXBsYXRlIGJvdW5kIHRlbXBsYXRlIHRhcmdldCwgd2hpY2ggY2FuIGJlIHVzZWQgZm9yIHF1ZXJ5aW5nIGV4cHJlc3Npb24gdGFyZ2V0cy5cbiAqIEByZXR1cm4gaWRlbnRpZmllcnMgaW4gdGVtcGxhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFRlbXBsYXRlSWRlbnRpZmllcnMoYm91bmRUZW1wbGF0ZTogQm91bmRUYXJnZXQ8Q29tcG9uZW50TWV0YT4pOlxuICAgIFNldDxUb3BMZXZlbElkZW50aWZpZXI+IHtcbiAgY29uc3QgdmlzaXRvciA9IG5ldyBUZW1wbGF0ZVZpc2l0b3IoYm91bmRUZW1wbGF0ZSk7XG4gIGlmIChib3VuZFRlbXBsYXRlLnRhcmdldC50ZW1wbGF0ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgdmlzaXRvci52aXNpdEFsbChib3VuZFRlbXBsYXRlLnRhcmdldC50ZW1wbGF0ZSk7XG4gIH1cbiAgcmV0dXJuIHZpc2l0b3IuaWRlbnRpZmllcnM7XG59XG4iXX0=