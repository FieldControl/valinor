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
        define("@angular/compiler/src/render3/r3_ast", ["require", "exports", "tslib"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.transformAll = exports.visitAll = exports.TransformVisitor = exports.RecursiveVisitor = exports.NullVisitor = exports.Icu = exports.Reference = exports.Variable = exports.Content = exports.Template = exports.Element = exports.BoundEvent = exports.BoundAttribute = exports.TextAttribute = exports.BoundText = exports.Text = exports.Comment = void 0;
    var tslib_1 = require("tslib");
    /**
     * This is an R3 `Node`-like wrapper for a raw `html.Comment` node. We do not currently
     * require the implementation of a visitor for Comments as they are only collected at
     * the top-level of the R3 AST, and only if `Render3ParseOptions['collectCommentNodes']`
     * is true.
     */
    var Comment = /** @class */ (function () {
        function Comment(value, sourceSpan) {
            this.value = value;
            this.sourceSpan = sourceSpan;
        }
        Comment.prototype.visit = function (_visitor) {
            throw new Error('visit() not implemented for Comment');
        };
        return Comment;
    }());
    exports.Comment = Comment;
    var Text = /** @class */ (function () {
        function Text(value, sourceSpan) {
            this.value = value;
            this.sourceSpan = sourceSpan;
        }
        Text.prototype.visit = function (visitor) {
            return visitor.visitText(this);
        };
        return Text;
    }());
    exports.Text = Text;
    var BoundText = /** @class */ (function () {
        function BoundText(value, sourceSpan, i18n) {
            this.value = value;
            this.sourceSpan = sourceSpan;
            this.i18n = i18n;
        }
        BoundText.prototype.visit = function (visitor) {
            return visitor.visitBoundText(this);
        };
        return BoundText;
    }());
    exports.BoundText = BoundText;
    /**
     * Represents a text attribute in the template.
     *
     * `valueSpan` may not be present in cases where there is no value `<div a></div>`.
     * `keySpan` may also not be present for synthetic attributes from ICU expansions.
     */
    var TextAttribute = /** @class */ (function () {
        function TextAttribute(name, value, sourceSpan, keySpan, valueSpan, i18n) {
            this.name = name;
            this.value = value;
            this.sourceSpan = sourceSpan;
            this.keySpan = keySpan;
            this.valueSpan = valueSpan;
            this.i18n = i18n;
        }
        TextAttribute.prototype.visit = function (visitor) {
            return visitor.visitTextAttribute(this);
        };
        return TextAttribute;
    }());
    exports.TextAttribute = TextAttribute;
    var BoundAttribute = /** @class */ (function () {
        function BoundAttribute(name, type, securityContext, value, unit, sourceSpan, keySpan, valueSpan, i18n) {
            this.name = name;
            this.type = type;
            this.securityContext = securityContext;
            this.value = value;
            this.unit = unit;
            this.sourceSpan = sourceSpan;
            this.keySpan = keySpan;
            this.valueSpan = valueSpan;
            this.i18n = i18n;
        }
        BoundAttribute.fromBoundElementProperty = function (prop, i18n) {
            if (prop.keySpan === undefined) {
                throw new Error("Unexpected state: keySpan must be defined for bound attributes but was not for " + prop.name + ": " + prop.sourceSpan);
            }
            return new BoundAttribute(prop.name, prop.type, prop.securityContext, prop.value, prop.unit, prop.sourceSpan, prop.keySpan, prop.valueSpan, i18n);
        };
        BoundAttribute.prototype.visit = function (visitor) {
            return visitor.visitBoundAttribute(this);
        };
        return BoundAttribute;
    }());
    exports.BoundAttribute = BoundAttribute;
    var BoundEvent = /** @class */ (function () {
        function BoundEvent(name, type, handler, target, phase, sourceSpan, handlerSpan, keySpan) {
            this.name = name;
            this.type = type;
            this.handler = handler;
            this.target = target;
            this.phase = phase;
            this.sourceSpan = sourceSpan;
            this.handlerSpan = handlerSpan;
            this.keySpan = keySpan;
        }
        BoundEvent.fromParsedEvent = function (event) {
            var target = event.type === 0 /* Regular */ ? event.targetOrPhase : null;
            var phase = event.type === 1 /* Animation */ ? event.targetOrPhase : null;
            if (event.keySpan === undefined) {
                throw new Error("Unexpected state: keySpan must be defined for bound event but was not for " + event.name + ": " + event.sourceSpan);
            }
            return new BoundEvent(event.name, event.type, event.handler, target, phase, event.sourceSpan, event.handlerSpan, event.keySpan);
        };
        BoundEvent.prototype.visit = function (visitor) {
            return visitor.visitBoundEvent(this);
        };
        return BoundEvent;
    }());
    exports.BoundEvent = BoundEvent;
    var Element = /** @class */ (function () {
        function Element(name, attributes, inputs, outputs, children, references, sourceSpan, startSourceSpan, endSourceSpan, i18n) {
            this.name = name;
            this.attributes = attributes;
            this.inputs = inputs;
            this.outputs = outputs;
            this.children = children;
            this.references = references;
            this.sourceSpan = sourceSpan;
            this.startSourceSpan = startSourceSpan;
            this.endSourceSpan = endSourceSpan;
            this.i18n = i18n;
        }
        Element.prototype.visit = function (visitor) {
            return visitor.visitElement(this);
        };
        return Element;
    }());
    exports.Element = Element;
    var Template = /** @class */ (function () {
        function Template(tagName, attributes, inputs, outputs, templateAttrs, children, references, variables, sourceSpan, startSourceSpan, endSourceSpan, i18n) {
            this.tagName = tagName;
            this.attributes = attributes;
            this.inputs = inputs;
            this.outputs = outputs;
            this.templateAttrs = templateAttrs;
            this.children = children;
            this.references = references;
            this.variables = variables;
            this.sourceSpan = sourceSpan;
            this.startSourceSpan = startSourceSpan;
            this.endSourceSpan = endSourceSpan;
            this.i18n = i18n;
        }
        Template.prototype.visit = function (visitor) {
            return visitor.visitTemplate(this);
        };
        return Template;
    }());
    exports.Template = Template;
    var Content = /** @class */ (function () {
        function Content(selector, attributes, sourceSpan, i18n) {
            this.selector = selector;
            this.attributes = attributes;
            this.sourceSpan = sourceSpan;
            this.i18n = i18n;
            this.name = 'ng-content';
        }
        Content.prototype.visit = function (visitor) {
            return visitor.visitContent(this);
        };
        return Content;
    }());
    exports.Content = Content;
    var Variable = /** @class */ (function () {
        function Variable(name, value, sourceSpan, keySpan, valueSpan) {
            this.name = name;
            this.value = value;
            this.sourceSpan = sourceSpan;
            this.keySpan = keySpan;
            this.valueSpan = valueSpan;
        }
        Variable.prototype.visit = function (visitor) {
            return visitor.visitVariable(this);
        };
        return Variable;
    }());
    exports.Variable = Variable;
    var Reference = /** @class */ (function () {
        function Reference(name, value, sourceSpan, keySpan, valueSpan) {
            this.name = name;
            this.value = value;
            this.sourceSpan = sourceSpan;
            this.keySpan = keySpan;
            this.valueSpan = valueSpan;
        }
        Reference.prototype.visit = function (visitor) {
            return visitor.visitReference(this);
        };
        return Reference;
    }());
    exports.Reference = Reference;
    var Icu = /** @class */ (function () {
        function Icu(vars, placeholders, sourceSpan, i18n) {
            this.vars = vars;
            this.placeholders = placeholders;
            this.sourceSpan = sourceSpan;
            this.i18n = i18n;
        }
        Icu.prototype.visit = function (visitor) {
            return visitor.visitIcu(this);
        };
        return Icu;
    }());
    exports.Icu = Icu;
    var NullVisitor = /** @class */ (function () {
        function NullVisitor() {
        }
        NullVisitor.prototype.visitElement = function (element) { };
        NullVisitor.prototype.visitTemplate = function (template) { };
        NullVisitor.prototype.visitContent = function (content) { };
        NullVisitor.prototype.visitVariable = function (variable) { };
        NullVisitor.prototype.visitReference = function (reference) { };
        NullVisitor.prototype.visitTextAttribute = function (attribute) { };
        NullVisitor.prototype.visitBoundAttribute = function (attribute) { };
        NullVisitor.prototype.visitBoundEvent = function (attribute) { };
        NullVisitor.prototype.visitText = function (text) { };
        NullVisitor.prototype.visitBoundText = function (text) { };
        NullVisitor.prototype.visitIcu = function (icu) { };
        return NullVisitor;
    }());
    exports.NullVisitor = NullVisitor;
    var RecursiveVisitor = /** @class */ (function () {
        function RecursiveVisitor() {
        }
        RecursiveVisitor.prototype.visitElement = function (element) {
            visitAll(this, element.attributes);
            visitAll(this, element.children);
            visitAll(this, element.references);
        };
        RecursiveVisitor.prototype.visitTemplate = function (template) {
            visitAll(this, template.attributes);
            visitAll(this, template.children);
            visitAll(this, template.references);
            visitAll(this, template.variables);
        };
        RecursiveVisitor.prototype.visitContent = function (content) { };
        RecursiveVisitor.prototype.visitVariable = function (variable) { };
        RecursiveVisitor.prototype.visitReference = function (reference) { };
        RecursiveVisitor.prototype.visitTextAttribute = function (attribute) { };
        RecursiveVisitor.prototype.visitBoundAttribute = function (attribute) { };
        RecursiveVisitor.prototype.visitBoundEvent = function (attribute) { };
        RecursiveVisitor.prototype.visitText = function (text) { };
        RecursiveVisitor.prototype.visitBoundText = function (text) { };
        RecursiveVisitor.prototype.visitIcu = function (icu) { };
        return RecursiveVisitor;
    }());
    exports.RecursiveVisitor = RecursiveVisitor;
    var TransformVisitor = /** @class */ (function () {
        function TransformVisitor() {
        }
        TransformVisitor.prototype.visitElement = function (element) {
            var newAttributes = transformAll(this, element.attributes);
            var newInputs = transformAll(this, element.inputs);
            var newOutputs = transformAll(this, element.outputs);
            var newChildren = transformAll(this, element.children);
            var newReferences = transformAll(this, element.references);
            if (newAttributes != element.attributes || newInputs != element.inputs ||
                newOutputs != element.outputs || newChildren != element.children ||
                newReferences != element.references) {
                return new Element(element.name, newAttributes, newInputs, newOutputs, newChildren, newReferences, element.sourceSpan, element.startSourceSpan, element.endSourceSpan);
            }
            return element;
        };
        TransformVisitor.prototype.visitTemplate = function (template) {
            var newAttributes = transformAll(this, template.attributes);
            var newInputs = transformAll(this, template.inputs);
            var newOutputs = transformAll(this, template.outputs);
            var newTemplateAttrs = transformAll(this, template.templateAttrs);
            var newChildren = transformAll(this, template.children);
            var newReferences = transformAll(this, template.references);
            var newVariables = transformAll(this, template.variables);
            if (newAttributes != template.attributes || newInputs != template.inputs ||
                newOutputs != template.outputs || newTemplateAttrs != template.templateAttrs ||
                newChildren != template.children || newReferences != template.references ||
                newVariables != template.variables) {
                return new Template(template.tagName, newAttributes, newInputs, newOutputs, newTemplateAttrs, newChildren, newReferences, newVariables, template.sourceSpan, template.startSourceSpan, template.endSourceSpan);
            }
            return template;
        };
        TransformVisitor.prototype.visitContent = function (content) {
            return content;
        };
        TransformVisitor.prototype.visitVariable = function (variable) {
            return variable;
        };
        TransformVisitor.prototype.visitReference = function (reference) {
            return reference;
        };
        TransformVisitor.prototype.visitTextAttribute = function (attribute) {
            return attribute;
        };
        TransformVisitor.prototype.visitBoundAttribute = function (attribute) {
            return attribute;
        };
        TransformVisitor.prototype.visitBoundEvent = function (attribute) {
            return attribute;
        };
        TransformVisitor.prototype.visitText = function (text) {
            return text;
        };
        TransformVisitor.prototype.visitBoundText = function (text) {
            return text;
        };
        TransformVisitor.prototype.visitIcu = function (icu) {
            return icu;
        };
        return TransformVisitor;
    }());
    exports.TransformVisitor = TransformVisitor;
    function visitAll(visitor, nodes) {
        var e_1, _a, e_2, _b;
        var result = [];
        if (visitor.visit) {
            try {
                for (var nodes_1 = tslib_1.__values(nodes), nodes_1_1 = nodes_1.next(); !nodes_1_1.done; nodes_1_1 = nodes_1.next()) {
                    var node = nodes_1_1.value;
                    var newNode = visitor.visit(node) || node.visit(visitor);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (nodes_1_1 && !nodes_1_1.done && (_a = nodes_1.return)) _a.call(nodes_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        else {
            try {
                for (var nodes_2 = tslib_1.__values(nodes), nodes_2_1 = nodes_2.next(); !nodes_2_1.done; nodes_2_1 = nodes_2.next()) {
                    var node = nodes_2_1.value;
                    var newNode = node.visit(visitor);
                    if (newNode) {
                        result.push(newNode);
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (nodes_2_1 && !nodes_2_1.done && (_b = nodes_2.return)) _b.call(nodes_2);
                }
                finally { if (e_2) throw e_2.error; }
            }
        }
        return result;
    }
    exports.visitAll = visitAll;
    function transformAll(visitor, nodes) {
        var e_3, _a;
        var result = [];
        var changed = false;
        try {
            for (var nodes_3 = tslib_1.__values(nodes), nodes_3_1 = nodes_3.next(); !nodes_3_1.done; nodes_3_1 = nodes_3.next()) {
                var node = nodes_3_1.value;
                var newNode = node.visit(visitor);
                if (newNode) {
                    result.push(newNode);
                }
                changed = changed || newNode != node;
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (nodes_3_1 && !nodes_3_1.done && (_a = nodes_3.return)) _a.call(nodes_3);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return changed ? result : nodes;
    }
    exports.transformAll = transformAll;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicjNfYXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3JlbmRlcjMvcjNfYXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFZSDs7Ozs7T0FLRztJQUNIO1FBQ0UsaUJBQW1CLEtBQWEsRUFBUyxVQUEyQjtZQUFqRCxVQUFLLEdBQUwsS0FBSyxDQUFRO1lBQVMsZUFBVSxHQUFWLFVBQVUsQ0FBaUI7UUFBRyxDQUFDO1FBQ3hFLHVCQUFLLEdBQUwsVUFBYyxRQUF5QjtZQUNyQyxNQUFNLElBQUksS0FBSyxDQUFDLHFDQUFxQyxDQUFDLENBQUM7UUFDekQsQ0FBQztRQUNILGNBQUM7SUFBRCxDQUFDLEFBTEQsSUFLQztJQUxZLDBCQUFPO0lBT3BCO1FBQ0UsY0FBbUIsS0FBYSxFQUFTLFVBQTJCO1lBQWpELFVBQUssR0FBTCxLQUFLLENBQVE7WUFBUyxlQUFVLEdBQVYsVUFBVSxDQUFpQjtRQUFHLENBQUM7UUFDeEUsb0JBQUssR0FBTCxVQUFjLE9BQXdCO1lBQ3BDLE9BQU8sT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNqQyxDQUFDO1FBQ0gsV0FBQztJQUFELENBQUMsQUFMRCxJQUtDO0lBTFksb0JBQUk7SUFPakI7UUFDRSxtQkFBbUIsS0FBVSxFQUFTLFVBQTJCLEVBQVMsSUFBZTtZQUF0RSxVQUFLLEdBQUwsS0FBSyxDQUFLO1lBQVMsZUFBVSxHQUFWLFVBQVUsQ0FBaUI7WUFBUyxTQUFJLEdBQUosSUFBSSxDQUFXO1FBQUcsQ0FBQztRQUM3Rix5QkFBSyxHQUFMLFVBQWMsT0FBd0I7WUFDcEMsT0FBTyxPQUFPLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3RDLENBQUM7UUFDSCxnQkFBQztJQUFELENBQUMsQUFMRCxJQUtDO0lBTFksOEJBQVM7SUFPdEI7Ozs7O09BS0c7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QUMsQ0FBQztnQkFDcEMsSUFBSSxPQUFPLEVBQUU7b0JBQ1gsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFpQixDQUFDLENBQUM7aUJBQ2hDO2dCQUNELE9BQU8sR0FBRyxPQUFPLElBQUksT0FBTyxJQUFJLElBQUksQ0FBQzthQUN0Qzs7Ozs7Ozs7O1FBQ0QsT0FBTyxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0lBQ2xDLENBQUM7SUFaRCxvQ0FZQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1NlY3VyaXR5Q29udGV4dH0gZnJvbSAnLi4vY29yZSc7XG5pbXBvcnQge0FTVCwgQmluZGluZ1R5cGUsIEJvdW5kRWxlbWVudFByb3BlcnR5LCBQYXJzZWRFdmVudCwgUGFyc2VkRXZlbnRUeXBlfSBmcm9tICcuLi9leHByZXNzaW9uX3BhcnNlci9hc3QnO1xuaW1wb3J0IHtJMThuTWV0YX0gZnJvbSAnLi4vaTE4bi9pMThuX2FzdCc7XG5pbXBvcnQge1BhcnNlU291cmNlU3Bhbn0gZnJvbSAnLi4vcGFyc2VfdXRpbCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgTm9kZSB7XG4gIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbjtcbiAgdmlzaXQ8UmVzdWx0Pih2aXNpdG9yOiBWaXNpdG9yPFJlc3VsdD4pOiBSZXN1bHQ7XG59XG5cbi8qKlxuICogVGhpcyBpcyBhbiBSMyBgTm9kZWAtbGlrZSB3cmFwcGVyIGZvciBhIHJhdyBgaHRtbC5Db21tZW50YCBub2RlLiBXZSBkbyBub3QgY3VycmVudGx5XG4gKiByZXF1aXJlIHRoZSBpbXBsZW1lbnRhdGlvbiBvZiBhIHZpc2l0b3IgZm9yIENvbW1lbnRzIGFzIHRoZXkgYXJlIG9ubHkgY29sbGVjdGVkIGF0XG4gKiB0aGUgdG9wLWxldmVsIG9mIHRoZSBSMyBBU1QsIGFuZCBvbmx5IGlmIGBSZW5kZXIzUGFyc2VPcHRpb25zWydjb2xsZWN0Q29tbWVudE5vZGVzJ11gXG4gKiBpcyB0cnVlLlxuICovXG5leHBvcnQgY2xhc3MgQ29tbWVudCBpbXBsZW1lbnRzIE5vZGUge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgdmFsdWU6IHN0cmluZywgcHVibGljIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3Bhbikge31cbiAgdmlzaXQ8UmVzdWx0PihfdmlzaXRvcjogVmlzaXRvcjxSZXN1bHQ+KTogUmVzdWx0IHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Zpc2l0KCkgbm90IGltcGxlbWVudGVkIGZvciBDb21tZW50Jyk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFRleHQgaW1wbGVtZW50cyBOb2RlIHtcbiAgY29uc3RydWN0b3IocHVibGljIHZhbHVlOiBzdHJpbmcsIHB1YmxpYyBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pIHt9XG4gIHZpc2l0PFJlc3VsdD4odmlzaXRvcjogVmlzaXRvcjxSZXN1bHQ+KTogUmVzdWx0IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdFRleHQodGhpcyk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEJvdW5kVGV4dCBpbXBsZW1lbnRzIE5vZGUge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgdmFsdWU6IEFTVCwgcHVibGljIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbiwgcHVibGljIGkxOG4/OiBJMThuTWV0YSkge31cbiAgdmlzaXQ8UmVzdWx0Pih2aXNpdG9yOiBWaXNpdG9yPFJlc3VsdD4pOiBSZXN1bHQge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0Qm91bmRUZXh0KHRoaXMpO1xuICB9XG59XG5cbi8qKlxuICogUmVwcmVzZW50cyBhIHRleHQgYXR0cmlidXRlIGluIHRoZSB0ZW1wbGF0ZS5cbiAqXG4gKiBgdmFsdWVTcGFuYCBtYXkgbm90IGJlIHByZXNlbnQgaW4gY2FzZXMgd2hlcmUgdGhlcmUgaXMgbm8gdmFsdWUgYDxkaXYgYT48L2Rpdj5gLlxuICogYGtleVNwYW5gIG1heSBhbHNvIG5vdCBiZSBwcmVzZW50IGZvciBzeW50aGV0aWMgYXR0cmlidXRlcyBmcm9tIElDVSBleHBhbnNpb25zLlxuICovXG5leHBvcnQgY2xhc3MgVGV4dEF0dHJpYnV0ZSBpbXBsZW1lbnRzIE5vZGUge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyBuYW1lOiBzdHJpbmcsIHB1YmxpYyB2YWx1ZTogc3RyaW5nLCBwdWJsaWMgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgICAgcmVhZG9ubHkga2V5U3BhbjogUGFyc2VTb3VyY2VTcGFufHVuZGVmaW5lZCwgcHVibGljIHZhbHVlU3Bhbj86IFBhcnNlU291cmNlU3BhbixcbiAgICAgIHB1YmxpYyBpMThuPzogSTE4bk1ldGEpIHt9XG4gIHZpc2l0PFJlc3VsdD4odmlzaXRvcjogVmlzaXRvcjxSZXN1bHQ+KTogUmVzdWx0IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdFRleHRBdHRyaWJ1dGUodGhpcyk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEJvdW5kQXR0cmlidXRlIGltcGxlbWVudHMgTm9kZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIG5hbWU6IHN0cmluZywgcHVibGljIHR5cGU6IEJpbmRpbmdUeXBlLCBwdWJsaWMgc2VjdXJpdHlDb250ZXh0OiBTZWN1cml0eUNvbnRleHQsXG4gICAgICBwdWJsaWMgdmFsdWU6IEFTVCwgcHVibGljIHVuaXQ6IHN0cmluZ3xudWxsLCBwdWJsaWMgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgICAgcmVhZG9ubHkga2V5U3BhbjogUGFyc2VTb3VyY2VTcGFuLCBwdWJsaWMgdmFsdWVTcGFuOiBQYXJzZVNvdXJjZVNwYW58dW5kZWZpbmVkLFxuICAgICAgcHVibGljIGkxOG46IEkxOG5NZXRhfHVuZGVmaW5lZCkge31cblxuICBzdGF0aWMgZnJvbUJvdW5kRWxlbWVudFByb3BlcnR5KHByb3A6IEJvdW5kRWxlbWVudFByb3BlcnR5LCBpMThuPzogSTE4bk1ldGEpOiBCb3VuZEF0dHJpYnV0ZSB7XG4gICAgaWYgKHByb3Aua2V5U3BhbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYFVuZXhwZWN0ZWQgc3RhdGU6IGtleVNwYW4gbXVzdCBiZSBkZWZpbmVkIGZvciBib3VuZCBhdHRyaWJ1dGVzIGJ1dCB3YXMgbm90IGZvciAke1xuICAgICAgICAgICAgICBwcm9wLm5hbWV9OiAke3Byb3Auc291cmNlU3Bhbn1gKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBCb3VuZEF0dHJpYnV0ZShcbiAgICAgICAgcHJvcC5uYW1lLCBwcm9wLnR5cGUsIHByb3Auc2VjdXJpdHlDb250ZXh0LCBwcm9wLnZhbHVlLCBwcm9wLnVuaXQsIHByb3Auc291cmNlU3BhbixcbiAgICAgICAgcHJvcC5rZXlTcGFuLCBwcm9wLnZhbHVlU3BhbiwgaTE4bik7XG4gIH1cblxuICB2aXNpdDxSZXN1bHQ+KHZpc2l0b3I6IFZpc2l0b3I8UmVzdWx0Pik6IFJlc3VsdCB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRCb3VuZEF0dHJpYnV0ZSh0aGlzKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQm91bmRFdmVudCBpbXBsZW1lbnRzIE5vZGUge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyBuYW1lOiBzdHJpbmcsIHB1YmxpYyB0eXBlOiBQYXJzZWRFdmVudFR5cGUsIHB1YmxpYyBoYW5kbGVyOiBBU1QsXG4gICAgICBwdWJsaWMgdGFyZ2V0OiBzdHJpbmd8bnVsbCwgcHVibGljIHBoYXNlOiBzdHJpbmd8bnVsbCwgcHVibGljIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICAgIHB1YmxpYyBoYW5kbGVyU3BhbjogUGFyc2VTb3VyY2VTcGFuLCByZWFkb25seSBrZXlTcGFuOiBQYXJzZVNvdXJjZVNwYW4pIHt9XG5cbiAgc3RhdGljIGZyb21QYXJzZWRFdmVudChldmVudDogUGFyc2VkRXZlbnQpIHtcbiAgICBjb25zdCB0YXJnZXQ6IHN0cmluZ3xudWxsID0gZXZlbnQudHlwZSA9PT0gUGFyc2VkRXZlbnRUeXBlLlJlZ3VsYXIgPyBldmVudC50YXJnZXRPclBoYXNlIDogbnVsbDtcbiAgICBjb25zdCBwaGFzZTogc3RyaW5nfG51bGwgPVxuICAgICAgICBldmVudC50eXBlID09PSBQYXJzZWRFdmVudFR5cGUuQW5pbWF0aW9uID8gZXZlbnQudGFyZ2V0T3JQaGFzZSA6IG51bGw7XG4gICAgaWYgKGV2ZW50LmtleVNwYW4gPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmV4cGVjdGVkIHN0YXRlOiBrZXlTcGFuIG11c3QgYmUgZGVmaW5lZCBmb3IgYm91bmQgZXZlbnQgYnV0IHdhcyBub3QgZm9yICR7XG4gICAgICAgICAgZXZlbnQubmFtZX06ICR7ZXZlbnQuc291cmNlU3Bhbn1gKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBCb3VuZEV2ZW50KFxuICAgICAgICBldmVudC5uYW1lLCBldmVudC50eXBlLCBldmVudC5oYW5kbGVyLCB0YXJnZXQsIHBoYXNlLCBldmVudC5zb3VyY2VTcGFuLCBldmVudC5oYW5kbGVyU3BhbixcbiAgICAgICAgZXZlbnQua2V5U3Bhbik7XG4gIH1cblxuICB2aXNpdDxSZXN1bHQ+KHZpc2l0b3I6IFZpc2l0b3I8UmVzdWx0Pik6IFJlc3VsdCB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRCb3VuZEV2ZW50KHRoaXMpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBFbGVtZW50IGltcGxlbWVudHMgTm9kZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIG5hbWU6IHN0cmluZywgcHVibGljIGF0dHJpYnV0ZXM6IFRleHRBdHRyaWJ1dGVbXSwgcHVibGljIGlucHV0czogQm91bmRBdHRyaWJ1dGVbXSxcbiAgICAgIHB1YmxpYyBvdXRwdXRzOiBCb3VuZEV2ZW50W10sIHB1YmxpYyBjaGlsZHJlbjogTm9kZVtdLCBwdWJsaWMgcmVmZXJlbmNlczogUmVmZXJlbmNlW10sXG4gICAgICBwdWJsaWMgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLCBwdWJsaWMgc3RhcnRTb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgICBwdWJsaWMgZW5kU291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFufG51bGwsIHB1YmxpYyBpMThuPzogSTE4bk1ldGEpIHt9XG4gIHZpc2l0PFJlc3VsdD4odmlzaXRvcjogVmlzaXRvcjxSZXN1bHQ+KTogUmVzdWx0IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdEVsZW1lbnQodGhpcyk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFRlbXBsYXRlIGltcGxlbWVudHMgTm9kZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIHRhZ05hbWU6IHN0cmluZywgcHVibGljIGF0dHJpYnV0ZXM6IFRleHRBdHRyaWJ1dGVbXSwgcHVibGljIGlucHV0czogQm91bmRBdHRyaWJ1dGVbXSxcbiAgICAgIHB1YmxpYyBvdXRwdXRzOiBCb3VuZEV2ZW50W10sIHB1YmxpYyB0ZW1wbGF0ZUF0dHJzOiAoQm91bmRBdHRyaWJ1dGV8VGV4dEF0dHJpYnV0ZSlbXSxcbiAgICAgIHB1YmxpYyBjaGlsZHJlbjogTm9kZVtdLCBwdWJsaWMgcmVmZXJlbmNlczogUmVmZXJlbmNlW10sIHB1YmxpYyB2YXJpYWJsZXM6IFZhcmlhYmxlW10sXG4gICAgICBwdWJsaWMgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLCBwdWJsaWMgc3RhcnRTb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgICBwdWJsaWMgZW5kU291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFufG51bGwsIHB1YmxpYyBpMThuPzogSTE4bk1ldGEpIHt9XG4gIHZpc2l0PFJlc3VsdD4odmlzaXRvcjogVmlzaXRvcjxSZXN1bHQ+KTogUmVzdWx0IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdFRlbXBsYXRlKHRoaXMpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBDb250ZW50IGltcGxlbWVudHMgTm9kZSB7XG4gIHJlYWRvbmx5IG5hbWUgPSAnbmctY29udGVudCc7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgc2VsZWN0b3I6IHN0cmluZywgcHVibGljIGF0dHJpYnV0ZXM6IFRleHRBdHRyaWJ1dGVbXSxcbiAgICAgIHB1YmxpYyBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sIHB1YmxpYyBpMThuPzogSTE4bk1ldGEpIHt9XG4gIHZpc2l0PFJlc3VsdD4odmlzaXRvcjogVmlzaXRvcjxSZXN1bHQ+KTogUmVzdWx0IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdENvbnRlbnQodGhpcyk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFZhcmlhYmxlIGltcGxlbWVudHMgTm9kZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIG5hbWU6IHN0cmluZywgcHVibGljIHZhbHVlOiBzdHJpbmcsIHB1YmxpYyBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgICByZWFkb25seSBrZXlTcGFuOiBQYXJzZVNvdXJjZVNwYW4sIHB1YmxpYyB2YWx1ZVNwYW4/OiBQYXJzZVNvdXJjZVNwYW4pIHt9XG4gIHZpc2l0PFJlc3VsdD4odmlzaXRvcjogVmlzaXRvcjxSZXN1bHQ+KTogUmVzdWx0IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdFZhcmlhYmxlKHRoaXMpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBSZWZlcmVuY2UgaW1wbGVtZW50cyBOb2RlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgbmFtZTogc3RyaW5nLCBwdWJsaWMgdmFsdWU6IHN0cmluZywgcHVibGljIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICAgIHJlYWRvbmx5IGtleVNwYW46IFBhcnNlU291cmNlU3BhbiwgcHVibGljIHZhbHVlU3Bhbj86IFBhcnNlU291cmNlU3Bhbikge31cbiAgdmlzaXQ8UmVzdWx0Pih2aXNpdG9yOiBWaXNpdG9yPFJlc3VsdD4pOiBSZXN1bHQge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0UmVmZXJlbmNlKHRoaXMpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBJY3UgaW1wbGVtZW50cyBOb2RlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgdmFyczoge1tuYW1lOiBzdHJpbmddOiBCb3VuZFRleHR9LFxuICAgICAgcHVibGljIHBsYWNlaG9sZGVyczoge1tuYW1lOiBzdHJpbmddOiBUZXh0fEJvdW5kVGV4dH0sIHB1YmxpYyBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgICBwdWJsaWMgaTE4bj86IEkxOG5NZXRhKSB7fVxuICB2aXNpdDxSZXN1bHQ+KHZpc2l0b3I6IFZpc2l0b3I8UmVzdWx0Pik6IFJlc3VsdCB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRJY3UodGhpcyk7XG4gIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBWaXNpdG9yPFJlc3VsdCA9IGFueT4ge1xuICAvLyBSZXR1cm5pbmcgYSB0cnV0aHkgdmFsdWUgZnJvbSBgdmlzaXQoKWAgd2lsbCBwcmV2ZW50IGB2aXNpdEFsbCgpYCBmcm9tIHRoZSBjYWxsIHRvIHRoZSB0eXBlZFxuICAvLyBtZXRob2QgYW5kIHJlc3VsdCByZXR1cm5lZCB3aWxsIGJlY29tZSB0aGUgcmVzdWx0IGluY2x1ZGVkIGluIGB2aXNpdEFsbCgpYHMgcmVzdWx0IGFycmF5LlxuICB2aXNpdD8obm9kZTogTm9kZSk6IFJlc3VsdDtcblxuICB2aXNpdEVsZW1lbnQoZWxlbWVudDogRWxlbWVudCk6IFJlc3VsdDtcbiAgdmlzaXRUZW1wbGF0ZSh0ZW1wbGF0ZTogVGVtcGxhdGUpOiBSZXN1bHQ7XG4gIHZpc2l0Q29udGVudChjb250ZW50OiBDb250ZW50KTogUmVzdWx0O1xuICB2aXNpdFZhcmlhYmxlKHZhcmlhYmxlOiBWYXJpYWJsZSk6IFJlc3VsdDtcbiAgdmlzaXRSZWZlcmVuY2UocmVmZXJlbmNlOiBSZWZlcmVuY2UpOiBSZXN1bHQ7XG4gIHZpc2l0VGV4dEF0dHJpYnV0ZShhdHRyaWJ1dGU6IFRleHRBdHRyaWJ1dGUpOiBSZXN1bHQ7XG4gIHZpc2l0Qm91bmRBdHRyaWJ1dGUoYXR0cmlidXRlOiBCb3VuZEF0dHJpYnV0ZSk6IFJlc3VsdDtcbiAgdmlzaXRCb3VuZEV2ZW50KGF0dHJpYnV0ZTogQm91bmRFdmVudCk6IFJlc3VsdDtcbiAgdmlzaXRUZXh0KHRleHQ6IFRleHQpOiBSZXN1bHQ7XG4gIHZpc2l0Qm91bmRUZXh0KHRleHQ6IEJvdW5kVGV4dCk6IFJlc3VsdDtcbiAgdmlzaXRJY3UoaWN1OiBJY3UpOiBSZXN1bHQ7XG59XG5cbmV4cG9ydCBjbGFzcyBOdWxsVmlzaXRvciBpbXBsZW1lbnRzIFZpc2l0b3I8dm9pZD4ge1xuICB2aXNpdEVsZW1lbnQoZWxlbWVudDogRWxlbWVudCk6IHZvaWQge31cbiAgdmlzaXRUZW1wbGF0ZSh0ZW1wbGF0ZTogVGVtcGxhdGUpOiB2b2lkIHt9XG4gIHZpc2l0Q29udGVudChjb250ZW50OiBDb250ZW50KTogdm9pZCB7fVxuICB2aXNpdFZhcmlhYmxlKHZhcmlhYmxlOiBWYXJpYWJsZSk6IHZvaWQge31cbiAgdmlzaXRSZWZlcmVuY2UocmVmZXJlbmNlOiBSZWZlcmVuY2UpOiB2b2lkIHt9XG4gIHZpc2l0VGV4dEF0dHJpYnV0ZShhdHRyaWJ1dGU6IFRleHRBdHRyaWJ1dGUpOiB2b2lkIHt9XG4gIHZpc2l0Qm91bmRBdHRyaWJ1dGUoYXR0cmlidXRlOiBCb3VuZEF0dHJpYnV0ZSk6IHZvaWQge31cbiAgdmlzaXRCb3VuZEV2ZW50KGF0dHJpYnV0ZTogQm91bmRFdmVudCk6IHZvaWQge31cbiAgdmlzaXRUZXh0KHRleHQ6IFRleHQpOiB2b2lkIHt9XG4gIHZpc2l0Qm91bmRUZXh0KHRleHQ6IEJvdW5kVGV4dCk6IHZvaWQge31cbiAgdmlzaXRJY3UoaWN1OiBJY3UpOiB2b2lkIHt9XG59XG5cbmV4cG9ydCBjbGFzcyBSZWN1cnNpdmVWaXNpdG9yIGltcGxlbWVudHMgVmlzaXRvcjx2b2lkPiB7XG4gIHZpc2l0RWxlbWVudChlbGVtZW50OiBFbGVtZW50KTogdm9pZCB7XG4gICAgdmlzaXRBbGwodGhpcywgZWxlbWVudC5hdHRyaWJ1dGVzKTtcbiAgICB2aXNpdEFsbCh0aGlzLCBlbGVtZW50LmNoaWxkcmVuKTtcbiAgICB2aXNpdEFsbCh0aGlzLCBlbGVtZW50LnJlZmVyZW5jZXMpO1xuICB9XG4gIHZpc2l0VGVtcGxhdGUodGVtcGxhdGU6IFRlbXBsYXRlKTogdm9pZCB7XG4gICAgdmlzaXRBbGwodGhpcywgdGVtcGxhdGUuYXR0cmlidXRlcyk7XG4gICAgdmlzaXRBbGwodGhpcywgdGVtcGxhdGUuY2hpbGRyZW4pO1xuICAgIHZpc2l0QWxsKHRoaXMsIHRlbXBsYXRlLnJlZmVyZW5jZXMpO1xuICAgIHZpc2l0QWxsKHRoaXMsIHRlbXBsYXRlLnZhcmlhYmxlcyk7XG4gIH1cbiAgdmlzaXRDb250ZW50KGNvbnRlbnQ6IENvbnRlbnQpOiB2b2lkIHt9XG4gIHZpc2l0VmFyaWFibGUodmFyaWFibGU6IFZhcmlhYmxlKTogdm9pZCB7fVxuICB2aXNpdFJlZmVyZW5jZShyZWZlcmVuY2U6IFJlZmVyZW5jZSk6IHZvaWQge31cbiAgdmlzaXRUZXh0QXR0cmlidXRlKGF0dHJpYnV0ZTogVGV4dEF0dHJpYnV0ZSk6IHZvaWQge31cbiAgdmlzaXRCb3VuZEF0dHJpYnV0ZShhdHRyaWJ1dGU6IEJvdW5kQXR0cmlidXRlKTogdm9pZCB7fVxuICB2aXNpdEJvdW5kRXZlbnQoYXR0cmlidXRlOiBCb3VuZEV2ZW50KTogdm9pZCB7fVxuICB2aXNpdFRleHQodGV4dDogVGV4dCk6IHZvaWQge31cbiAgdmlzaXRCb3VuZFRleHQodGV4dDogQm91bmRUZXh0KTogdm9pZCB7fVxuICB2aXNpdEljdShpY3U6IEljdSk6IHZvaWQge31cbn1cblxuZXhwb3J0IGNsYXNzIFRyYW5zZm9ybVZpc2l0b3IgaW1wbGVtZW50cyBWaXNpdG9yPE5vZGU+IHtcbiAgdmlzaXRFbGVtZW50KGVsZW1lbnQ6IEVsZW1lbnQpOiBOb2RlIHtcbiAgICBjb25zdCBuZXdBdHRyaWJ1dGVzID0gdHJhbnNmb3JtQWxsKHRoaXMsIGVsZW1lbnQuYXR0cmlidXRlcyk7XG4gICAgY29uc3QgbmV3SW5wdXRzID0gdHJhbnNmb3JtQWxsKHRoaXMsIGVsZW1lbnQuaW5wdXRzKTtcbiAgICBjb25zdCBuZXdPdXRwdXRzID0gdHJhbnNmb3JtQWxsKHRoaXMsIGVsZW1lbnQub3V0cHV0cyk7XG4gICAgY29uc3QgbmV3Q2hpbGRyZW4gPSB0cmFuc2Zvcm1BbGwodGhpcywgZWxlbWVudC5jaGlsZHJlbik7XG4gICAgY29uc3QgbmV3UmVmZXJlbmNlcyA9IHRyYW5zZm9ybUFsbCh0aGlzLCBlbGVtZW50LnJlZmVyZW5jZXMpO1xuICAgIGlmIChuZXdBdHRyaWJ1dGVzICE9IGVsZW1lbnQuYXR0cmlidXRlcyB8fCBuZXdJbnB1dHMgIT0gZWxlbWVudC5pbnB1dHMgfHxcbiAgICAgICAgbmV3T3V0cHV0cyAhPSBlbGVtZW50Lm91dHB1dHMgfHwgbmV3Q2hpbGRyZW4gIT0gZWxlbWVudC5jaGlsZHJlbiB8fFxuICAgICAgICBuZXdSZWZlcmVuY2VzICE9IGVsZW1lbnQucmVmZXJlbmNlcykge1xuICAgICAgcmV0dXJuIG5ldyBFbGVtZW50KFxuICAgICAgICAgIGVsZW1lbnQubmFtZSwgbmV3QXR0cmlidXRlcywgbmV3SW5wdXRzLCBuZXdPdXRwdXRzLCBuZXdDaGlsZHJlbiwgbmV3UmVmZXJlbmNlcyxcbiAgICAgICAgICBlbGVtZW50LnNvdXJjZVNwYW4sIGVsZW1lbnQuc3RhcnRTb3VyY2VTcGFuLCBlbGVtZW50LmVuZFNvdXJjZVNwYW4pO1xuICAgIH1cbiAgICByZXR1cm4gZWxlbWVudDtcbiAgfVxuXG4gIHZpc2l0VGVtcGxhdGUodGVtcGxhdGU6IFRlbXBsYXRlKTogTm9kZSB7XG4gICAgY29uc3QgbmV3QXR0cmlidXRlcyA9IHRyYW5zZm9ybUFsbCh0aGlzLCB0ZW1wbGF0ZS5hdHRyaWJ1dGVzKTtcbiAgICBjb25zdCBuZXdJbnB1dHMgPSB0cmFuc2Zvcm1BbGwodGhpcywgdGVtcGxhdGUuaW5wdXRzKTtcbiAgICBjb25zdCBuZXdPdXRwdXRzID0gdHJhbnNmb3JtQWxsKHRoaXMsIHRlbXBsYXRlLm91dHB1dHMpO1xuICAgIGNvbnN0IG5ld1RlbXBsYXRlQXR0cnMgPSB0cmFuc2Zvcm1BbGwodGhpcywgdGVtcGxhdGUudGVtcGxhdGVBdHRycyk7XG4gICAgY29uc3QgbmV3Q2hpbGRyZW4gPSB0cmFuc2Zvcm1BbGwodGhpcywgdGVtcGxhdGUuY2hpbGRyZW4pO1xuICAgIGNvbnN0IG5ld1JlZmVyZW5jZXMgPSB0cmFuc2Zvcm1BbGwodGhpcywgdGVtcGxhdGUucmVmZXJlbmNlcyk7XG4gICAgY29uc3QgbmV3VmFyaWFibGVzID0gdHJhbnNmb3JtQWxsKHRoaXMsIHRlbXBsYXRlLnZhcmlhYmxlcyk7XG4gICAgaWYgKG5ld0F0dHJpYnV0ZXMgIT0gdGVtcGxhdGUuYXR0cmlidXRlcyB8fCBuZXdJbnB1dHMgIT0gdGVtcGxhdGUuaW5wdXRzIHx8XG4gICAgICAgIG5ld091dHB1dHMgIT0gdGVtcGxhdGUub3V0cHV0cyB8fCBuZXdUZW1wbGF0ZUF0dHJzICE9IHRlbXBsYXRlLnRlbXBsYXRlQXR0cnMgfHxcbiAgICAgICAgbmV3Q2hpbGRyZW4gIT0gdGVtcGxhdGUuY2hpbGRyZW4gfHwgbmV3UmVmZXJlbmNlcyAhPSB0ZW1wbGF0ZS5yZWZlcmVuY2VzIHx8XG4gICAgICAgIG5ld1ZhcmlhYmxlcyAhPSB0ZW1wbGF0ZS52YXJpYWJsZXMpIHtcbiAgICAgIHJldHVybiBuZXcgVGVtcGxhdGUoXG4gICAgICAgICAgdGVtcGxhdGUudGFnTmFtZSwgbmV3QXR0cmlidXRlcywgbmV3SW5wdXRzLCBuZXdPdXRwdXRzLCBuZXdUZW1wbGF0ZUF0dHJzLCBuZXdDaGlsZHJlbixcbiAgICAgICAgICBuZXdSZWZlcmVuY2VzLCBuZXdWYXJpYWJsZXMsIHRlbXBsYXRlLnNvdXJjZVNwYW4sIHRlbXBsYXRlLnN0YXJ0U291cmNlU3BhbixcbiAgICAgICAgICB0ZW1wbGF0ZS5lbmRTb3VyY2VTcGFuKTtcbiAgICB9XG4gICAgcmV0dXJuIHRlbXBsYXRlO1xuICB9XG5cbiAgdmlzaXRDb250ZW50KGNvbnRlbnQ6IENvbnRlbnQpOiBOb2RlIHtcbiAgICByZXR1cm4gY29udGVudDtcbiAgfVxuXG4gIHZpc2l0VmFyaWFibGUodmFyaWFibGU6IFZhcmlhYmxlKTogTm9kZSB7XG4gICAgcmV0dXJuIHZhcmlhYmxlO1xuICB9XG4gIHZpc2l0UmVmZXJlbmNlKHJlZmVyZW5jZTogUmVmZXJlbmNlKTogTm9kZSB7XG4gICAgcmV0dXJuIHJlZmVyZW5jZTtcbiAgfVxuICB2aXNpdFRleHRBdHRyaWJ1dGUoYXR0cmlidXRlOiBUZXh0QXR0cmlidXRlKTogTm9kZSB7XG4gICAgcmV0dXJuIGF0dHJpYnV0ZTtcbiAgfVxuICB2aXNpdEJvdW5kQXR0cmlidXRlKGF0dHJpYnV0ZTogQm91bmRBdHRyaWJ1dGUpOiBOb2RlIHtcbiAgICByZXR1cm4gYXR0cmlidXRlO1xuICB9XG4gIHZpc2l0Qm91bmRFdmVudChhdHRyaWJ1dGU6IEJvdW5kRXZlbnQpOiBOb2RlIHtcbiAgICByZXR1cm4gYXR0cmlidXRlO1xuICB9XG4gIHZpc2l0VGV4dCh0ZXh0OiBUZXh0KTogTm9kZSB7XG4gICAgcmV0dXJuIHRleHQ7XG4gIH1cbiAgdmlzaXRCb3VuZFRleHQodGV4dDogQm91bmRUZXh0KTogTm9kZSB7XG4gICAgcmV0dXJuIHRleHQ7XG4gIH1cbiAgdmlzaXRJY3UoaWN1OiBJY3UpOiBOb2RlIHtcbiAgICByZXR1cm4gaWN1O1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2aXNpdEFsbDxSZXN1bHQ+KHZpc2l0b3I6IFZpc2l0b3I8UmVzdWx0Piwgbm9kZXM6IE5vZGVbXSk6IFJlc3VsdFtdIHtcbiAgY29uc3QgcmVzdWx0OiBSZXN1bHRbXSA9IFtdO1xuICBpZiAodmlzaXRvci52aXNpdCkge1xuICAgIGZvciAoY29uc3Qgbm9kZSBvZiBub2Rlcykge1xuICAgICAgY29uc3QgbmV3Tm9kZSA9IHZpc2l0b3IudmlzaXQobm9kZSkgfHwgbm9kZS52aXNpdCh2aXNpdG9yKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgZm9yIChjb25zdCBub2RlIG9mIG5vZGVzKSB7XG4gICAgICBjb25zdCBuZXdOb2RlID0gbm9kZS52aXNpdCh2aXNpdG9yKTtcbiAgICAgIGlmIChuZXdOb2RlKSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKG5ld05vZGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNmb3JtQWxsPFJlc3VsdCBleHRlbmRzIE5vZGU+KFxuICAgIHZpc2l0b3I6IFZpc2l0b3I8Tm9kZT4sIG5vZGVzOiBSZXN1bHRbXSk6IFJlc3VsdFtdIHtcbiAgY29uc3QgcmVzdWx0OiBSZXN1bHRbXSA9IFtdO1xuICBsZXQgY2hhbmdlZCA9IGZhbHNlO1xuICBmb3IgKGNvbnN0IG5vZGUgb2Ygbm9kZXMpIHtcbiAgICBjb25zdCBuZXdOb2RlID0gbm9kZS52aXNpdCh2aXNpdG9yKTtcbiAgICBpZiAobmV3Tm9kZSkge1xuICAgICAgcmVzdWx0LnB1c2gobmV3Tm9kZSBhcyBSZXN1bHQpO1xuICAgIH1cbiAgICBjaGFuZ2VkID0gY2hhbmdlZCB8fCBuZXdOb2RlICE9IG5vZGU7XG4gIH1cbiAgcmV0dXJuIGNoYW5nZWQgPyByZXN1bHQgOiBub2Rlcztcbn1cbiJdfQ==