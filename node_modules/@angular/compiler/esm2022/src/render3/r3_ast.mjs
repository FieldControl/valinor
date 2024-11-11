/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ParsedEventType, } from '../expression_parser/ast';
/**
 * This is an R3 `Node`-like wrapper for a raw `html.Comment` node. We do not currently
 * require the implementation of a visitor for Comments as they are only collected at
 * the top-level of the R3 AST, and only if `Render3ParseOptions['collectCommentNodes']`
 * is true.
 */
export class Comment {
    constructor(value, sourceSpan) {
        this.value = value;
        this.sourceSpan = sourceSpan;
    }
    visit(_visitor) {
        throw new Error('visit() not implemented for Comment');
    }
}
export class Text {
    constructor(value, sourceSpan) {
        this.value = value;
        this.sourceSpan = sourceSpan;
    }
    visit(visitor) {
        return visitor.visitText(this);
    }
}
export class BoundText {
    constructor(value, sourceSpan, i18n) {
        this.value = value;
        this.sourceSpan = sourceSpan;
        this.i18n = i18n;
    }
    visit(visitor) {
        return visitor.visitBoundText(this);
    }
}
/**
 * Represents a text attribute in the template.
 *
 * `valueSpan` may not be present in cases where there is no value `<div a></div>`.
 * `keySpan` may also not be present for synthetic attributes from ICU expansions.
 */
export class TextAttribute {
    constructor(name, value, sourceSpan, keySpan, valueSpan, i18n) {
        this.name = name;
        this.value = value;
        this.sourceSpan = sourceSpan;
        this.keySpan = keySpan;
        this.valueSpan = valueSpan;
        this.i18n = i18n;
    }
    visit(visitor) {
        return visitor.visitTextAttribute(this);
    }
}
export class BoundAttribute {
    constructor(name, type, securityContext, value, unit, sourceSpan, keySpan, valueSpan, i18n) {
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
    static fromBoundElementProperty(prop, i18n) {
        if (prop.keySpan === undefined) {
            throw new Error(`Unexpected state: keySpan must be defined for bound attributes but was not for ${prop.name}: ${prop.sourceSpan}`);
        }
        return new BoundAttribute(prop.name, prop.type, prop.securityContext, prop.value, prop.unit, prop.sourceSpan, prop.keySpan, prop.valueSpan, i18n);
    }
    visit(visitor) {
        return visitor.visitBoundAttribute(this);
    }
}
export class BoundEvent {
    constructor(name, type, handler, target, phase, sourceSpan, handlerSpan, keySpan) {
        this.name = name;
        this.type = type;
        this.handler = handler;
        this.target = target;
        this.phase = phase;
        this.sourceSpan = sourceSpan;
        this.handlerSpan = handlerSpan;
        this.keySpan = keySpan;
    }
    static fromParsedEvent(event) {
        const target = event.type === ParsedEventType.Regular ? event.targetOrPhase : null;
        const phase = event.type === ParsedEventType.Animation ? event.targetOrPhase : null;
        if (event.keySpan === undefined) {
            throw new Error(`Unexpected state: keySpan must be defined for bound event but was not for ${event.name}: ${event.sourceSpan}`);
        }
        return new BoundEvent(event.name, event.type, event.handler, target, phase, event.sourceSpan, event.handlerSpan, event.keySpan);
    }
    visit(visitor) {
        return visitor.visitBoundEvent(this);
    }
}
export class Element {
    constructor(name, attributes, inputs, outputs, children, references, sourceSpan, startSourceSpan, endSourceSpan, i18n) {
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
    visit(visitor) {
        return visitor.visitElement(this);
    }
}
export class DeferredTrigger {
    constructor(nameSpan, sourceSpan, prefetchSpan, whenOrOnSourceSpan) {
        this.nameSpan = nameSpan;
        this.sourceSpan = sourceSpan;
        this.prefetchSpan = prefetchSpan;
        this.whenOrOnSourceSpan = whenOrOnSourceSpan;
    }
    visit(visitor) {
        return visitor.visitDeferredTrigger(this);
    }
}
export class BoundDeferredTrigger extends DeferredTrigger {
    constructor(value, sourceSpan, prefetchSpan, whenSourceSpan) {
        // BoundDeferredTrigger is for 'when' triggers. These aren't really "triggers" and don't have a
        // nameSpan. Trigger names are the built in event triggers like hover, interaction, etc.
        super(/** nameSpan */ null, sourceSpan, prefetchSpan, whenSourceSpan);
        this.value = value;
    }
}
export class IdleDeferredTrigger extends DeferredTrigger {
}
export class ImmediateDeferredTrigger extends DeferredTrigger {
}
export class HoverDeferredTrigger extends DeferredTrigger {
    constructor(reference, nameSpan, sourceSpan, prefetchSpan, onSourceSpan) {
        super(nameSpan, sourceSpan, prefetchSpan, onSourceSpan);
        this.reference = reference;
    }
}
export class TimerDeferredTrigger extends DeferredTrigger {
    constructor(delay, nameSpan, sourceSpan, prefetchSpan, onSourceSpan) {
        super(nameSpan, sourceSpan, prefetchSpan, onSourceSpan);
        this.delay = delay;
    }
}
export class InteractionDeferredTrigger extends DeferredTrigger {
    constructor(reference, nameSpan, sourceSpan, prefetchSpan, onSourceSpan) {
        super(nameSpan, sourceSpan, prefetchSpan, onSourceSpan);
        this.reference = reference;
    }
}
export class ViewportDeferredTrigger extends DeferredTrigger {
    constructor(reference, nameSpan, sourceSpan, prefetchSpan, onSourceSpan) {
        super(nameSpan, sourceSpan, prefetchSpan, onSourceSpan);
        this.reference = reference;
    }
}
export class BlockNode {
    constructor(nameSpan, sourceSpan, startSourceSpan, endSourceSpan) {
        this.nameSpan = nameSpan;
        this.sourceSpan = sourceSpan;
        this.startSourceSpan = startSourceSpan;
        this.endSourceSpan = endSourceSpan;
    }
}
export class DeferredBlockPlaceholder extends BlockNode {
    constructor(children, minimumTime, nameSpan, sourceSpan, startSourceSpan, endSourceSpan, i18n) {
        super(nameSpan, sourceSpan, startSourceSpan, endSourceSpan);
        this.children = children;
        this.minimumTime = minimumTime;
        this.i18n = i18n;
    }
    visit(visitor) {
        return visitor.visitDeferredBlockPlaceholder(this);
    }
}
export class DeferredBlockLoading extends BlockNode {
    constructor(children, afterTime, minimumTime, nameSpan, sourceSpan, startSourceSpan, endSourceSpan, i18n) {
        super(nameSpan, sourceSpan, startSourceSpan, endSourceSpan);
        this.children = children;
        this.afterTime = afterTime;
        this.minimumTime = minimumTime;
        this.i18n = i18n;
    }
    visit(visitor) {
        return visitor.visitDeferredBlockLoading(this);
    }
}
export class DeferredBlockError extends BlockNode {
    constructor(children, nameSpan, sourceSpan, startSourceSpan, endSourceSpan, i18n) {
        super(nameSpan, sourceSpan, startSourceSpan, endSourceSpan);
        this.children = children;
        this.i18n = i18n;
    }
    visit(visitor) {
        return visitor.visitDeferredBlockError(this);
    }
}
export class DeferredBlock extends BlockNode {
    constructor(children, triggers, prefetchTriggers, placeholder, loading, error, nameSpan, sourceSpan, mainBlockSpan, startSourceSpan, endSourceSpan, i18n) {
        super(nameSpan, sourceSpan, startSourceSpan, endSourceSpan);
        this.children = children;
        this.placeholder = placeholder;
        this.loading = loading;
        this.error = error;
        this.mainBlockSpan = mainBlockSpan;
        this.i18n = i18n;
        this.triggers = triggers;
        this.prefetchTriggers = prefetchTriggers;
        // We cache the keys since we know that they won't change and we
        // don't want to enumarate them every time we're traversing the AST.
        this.definedTriggers = Object.keys(triggers);
        this.definedPrefetchTriggers = Object.keys(prefetchTriggers);
    }
    visit(visitor) {
        return visitor.visitDeferredBlock(this);
    }
    visitAll(visitor) {
        this.visitTriggers(this.definedTriggers, this.triggers, visitor);
        this.visitTriggers(this.definedPrefetchTriggers, this.prefetchTriggers, visitor);
        visitAll(visitor, this.children);
        const remainingBlocks = [this.placeholder, this.loading, this.error].filter((x) => x !== null);
        visitAll(visitor, remainingBlocks);
    }
    visitTriggers(keys, triggers, visitor) {
        visitAll(visitor, keys.map((k) => triggers[k]));
    }
}
export class SwitchBlock extends BlockNode {
    constructor(expression, cases, 
    /**
     * These blocks are only captured to allow for autocompletion in the language service. They
     * aren't meant to be processed in any other way.
     */
    unknownBlocks, sourceSpan, startSourceSpan, endSourceSpan, nameSpan) {
        super(nameSpan, sourceSpan, startSourceSpan, endSourceSpan);
        this.expression = expression;
        this.cases = cases;
        this.unknownBlocks = unknownBlocks;
    }
    visit(visitor) {
        return visitor.visitSwitchBlock(this);
    }
}
export class SwitchBlockCase extends BlockNode {
    constructor(expression, children, sourceSpan, startSourceSpan, endSourceSpan, nameSpan, i18n) {
        super(nameSpan, sourceSpan, startSourceSpan, endSourceSpan);
        this.expression = expression;
        this.children = children;
        this.i18n = i18n;
    }
    visit(visitor) {
        return visitor.visitSwitchBlockCase(this);
    }
}
export class ForLoopBlock extends BlockNode {
    constructor(item, expression, trackBy, trackKeywordSpan, contextVariables, children, empty, sourceSpan, mainBlockSpan, startSourceSpan, endSourceSpan, nameSpan, i18n) {
        super(nameSpan, sourceSpan, startSourceSpan, endSourceSpan);
        this.item = item;
        this.expression = expression;
        this.trackBy = trackBy;
        this.trackKeywordSpan = trackKeywordSpan;
        this.contextVariables = contextVariables;
        this.children = children;
        this.empty = empty;
        this.mainBlockSpan = mainBlockSpan;
        this.i18n = i18n;
    }
    visit(visitor) {
        return visitor.visitForLoopBlock(this);
    }
}
export class ForLoopBlockEmpty extends BlockNode {
    constructor(children, sourceSpan, startSourceSpan, endSourceSpan, nameSpan, i18n) {
        super(nameSpan, sourceSpan, startSourceSpan, endSourceSpan);
        this.children = children;
        this.i18n = i18n;
    }
    visit(visitor) {
        return visitor.visitForLoopBlockEmpty(this);
    }
}
export class IfBlock extends BlockNode {
    constructor(branches, sourceSpan, startSourceSpan, endSourceSpan, nameSpan) {
        super(nameSpan, sourceSpan, startSourceSpan, endSourceSpan);
        this.branches = branches;
    }
    visit(visitor) {
        return visitor.visitIfBlock(this);
    }
}
export class IfBlockBranch extends BlockNode {
    constructor(expression, children, expressionAlias, sourceSpan, startSourceSpan, endSourceSpan, nameSpan, i18n) {
        super(nameSpan, sourceSpan, startSourceSpan, endSourceSpan);
        this.expression = expression;
        this.children = children;
        this.expressionAlias = expressionAlias;
        this.i18n = i18n;
    }
    visit(visitor) {
        return visitor.visitIfBlockBranch(this);
    }
}
export class UnknownBlock {
    constructor(name, sourceSpan, nameSpan) {
        this.name = name;
        this.sourceSpan = sourceSpan;
        this.nameSpan = nameSpan;
    }
    visit(visitor) {
        return visitor.visitUnknownBlock(this);
    }
}
export class LetDeclaration {
    constructor(name, value, sourceSpan, nameSpan, valueSpan) {
        this.name = name;
        this.value = value;
        this.sourceSpan = sourceSpan;
        this.nameSpan = nameSpan;
        this.valueSpan = valueSpan;
    }
    visit(visitor) {
        return visitor.visitLetDeclaration(this);
    }
}
export class Template {
    constructor(
    // tagName is the name of the container element, if applicable.
    // `null` is a special case for when there is a structural directive on an `ng-template` so
    // the renderer can differentiate between the synthetic template and the one written in the
    // file.
    tagName, attributes, inputs, outputs, templateAttrs, children, references, variables, sourceSpan, startSourceSpan, endSourceSpan, i18n) {
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
    visit(visitor) {
        return visitor.visitTemplate(this);
    }
}
export class Content {
    constructor(selector, attributes, children, sourceSpan, i18n) {
        this.selector = selector;
        this.attributes = attributes;
        this.children = children;
        this.sourceSpan = sourceSpan;
        this.i18n = i18n;
        this.name = 'ng-content';
    }
    visit(visitor) {
        return visitor.visitContent(this);
    }
}
export class Variable {
    constructor(name, value, sourceSpan, keySpan, valueSpan) {
        this.name = name;
        this.value = value;
        this.sourceSpan = sourceSpan;
        this.keySpan = keySpan;
        this.valueSpan = valueSpan;
    }
    visit(visitor) {
        return visitor.visitVariable(this);
    }
}
export class Reference {
    constructor(name, value, sourceSpan, keySpan, valueSpan) {
        this.name = name;
        this.value = value;
        this.sourceSpan = sourceSpan;
        this.keySpan = keySpan;
        this.valueSpan = valueSpan;
    }
    visit(visitor) {
        return visitor.visitReference(this);
    }
}
export class Icu {
    constructor(vars, placeholders, sourceSpan, i18n) {
        this.vars = vars;
        this.placeholders = placeholders;
        this.sourceSpan = sourceSpan;
        this.i18n = i18n;
    }
    visit(visitor) {
        return visitor.visitIcu(this);
    }
}
export class RecursiveVisitor {
    visitElement(element) {
        visitAll(this, element.attributes);
        visitAll(this, element.inputs);
        visitAll(this, element.outputs);
        visitAll(this, element.children);
        visitAll(this, element.references);
    }
    visitTemplate(template) {
        visitAll(this, template.attributes);
        visitAll(this, template.inputs);
        visitAll(this, template.outputs);
        visitAll(this, template.children);
        visitAll(this, template.references);
        visitAll(this, template.variables);
    }
    visitDeferredBlock(deferred) {
        deferred.visitAll(this);
    }
    visitDeferredBlockPlaceholder(block) {
        visitAll(this, block.children);
    }
    visitDeferredBlockError(block) {
        visitAll(this, block.children);
    }
    visitDeferredBlockLoading(block) {
        visitAll(this, block.children);
    }
    visitSwitchBlock(block) {
        visitAll(this, block.cases);
    }
    visitSwitchBlockCase(block) {
        visitAll(this, block.children);
    }
    visitForLoopBlock(block) {
        const blockItems = [block.item, ...block.contextVariables, ...block.children];
        block.empty && blockItems.push(block.empty);
        visitAll(this, blockItems);
    }
    visitForLoopBlockEmpty(block) {
        visitAll(this, block.children);
    }
    visitIfBlock(block) {
        visitAll(this, block.branches);
    }
    visitIfBlockBranch(block) {
        const blockItems = block.children;
        block.expressionAlias && blockItems.push(block.expressionAlias);
        visitAll(this, blockItems);
    }
    visitContent(content) {
        visitAll(this, content.children);
    }
    visitVariable(variable) { }
    visitReference(reference) { }
    visitTextAttribute(attribute) { }
    visitBoundAttribute(attribute) { }
    visitBoundEvent(attribute) { }
    visitText(text) { }
    visitBoundText(text) { }
    visitIcu(icu) { }
    visitDeferredTrigger(trigger) { }
    visitUnknownBlock(block) { }
    visitLetDeclaration(decl) { }
}
export function visitAll(visitor, nodes) {
    const result = [];
    if (visitor.visit) {
        for (const node of nodes) {
            visitor.visit(node) || node.visit(visitor);
        }
    }
    else {
        for (const node of nodes) {
            const newNode = node.visit(visitor);
            if (newNode) {
                result.push(newNode);
            }
        }
    }
    return result;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicjNfYXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3JlbmRlcjMvcjNfYXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUdILE9BQU8sRUFNTCxlQUFlLEdBQ2hCLE1BQU0sMEJBQTBCLENBQUM7QUFTbEM7Ozs7O0dBS0c7QUFDSCxNQUFNLE9BQU8sT0FBTztJQUNsQixZQUNTLEtBQWEsRUFDYixVQUEyQjtRQUQzQixVQUFLLEdBQUwsS0FBSyxDQUFRO1FBQ2IsZUFBVSxHQUFWLFVBQVUsQ0FBaUI7SUFDakMsQ0FBQztJQUNKLEtBQUssQ0FBUyxRQUF5QjtRQUNyQyxNQUFNLElBQUksS0FBSyxDQUFDLHFDQUFxQyxDQUFDLENBQUM7SUFDekQsQ0FBQztDQUNGO0FBRUQsTUFBTSxPQUFPLElBQUk7SUFDZixZQUNTLEtBQWEsRUFDYixVQUEyQjtRQUQzQixVQUFLLEdBQUwsS0FBSyxDQUFRO1FBQ2IsZUFBVSxHQUFWLFVBQVUsQ0FBaUI7SUFDakMsQ0FBQztJQUNKLEtBQUssQ0FBUyxPQUF3QjtRQUNwQyxPQUFPLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDakMsQ0FBQztDQUNGO0FBRUQsTUFBTSxPQUFPLFNBQVM7SUFDcEIsWUFDUyxLQUFVLEVBQ1YsVUFBMkIsRUFDM0IsSUFBZTtRQUZmLFVBQUssR0FBTCxLQUFLLENBQUs7UUFDVixlQUFVLEdBQVYsVUFBVSxDQUFpQjtRQUMzQixTQUFJLEdBQUosSUFBSSxDQUFXO0lBQ3JCLENBQUM7SUFDSixLQUFLLENBQVMsT0FBd0I7UUFDcEMsT0FBTyxPQUFPLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3RDLENBQUM7Q0FDRjtBQUVEOzs7OztHQUtHO0FBQ0gsTUFBTSxPQUFPLGFBQWE7SUFDeEIsWUFDUyxJQUFZLEVBQ1osS0FBYSxFQUNiLFVBQTJC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QixJQUFTLENBQUM7Q0FDbkQ7QUFFRCxNQUFNLFVBQVUsUUFBUSxDQUFTLE9BQXdCLEVBQUUsS0FBYTtJQUN0RSxNQUFNLE1BQU0sR0FBYSxFQUFFLENBQUM7SUFDNUIsSUFBSSxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDbEIsS0FBSyxNQUFNLElBQUksSUFBSSxLQUFLLEVBQUUsQ0FBQztZQUN6QixPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDN0MsQ0FBQztJQUNILENBQUM7U0FBTSxDQUFDO1FBQ04sS0FBSyxNQUFNLElBQUksSUFBSSxLQUFLLEVBQUUsQ0FBQztZQUN6QixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3BDLElBQUksT0FBTyxFQUFFLENBQUM7Z0JBQ1osTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN2QixDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7SUFDRCxPQUFPLE1BQU0sQ0FBQztBQUNoQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1NlY3VyaXR5Q29udGV4dH0gZnJvbSAnLi4vY29yZSc7XG5pbXBvcnQge1xuICBBU1QsXG4gIEFTVFdpdGhTb3VyY2UsXG4gIEJpbmRpbmdUeXBlLFxuICBCb3VuZEVsZW1lbnRQcm9wZXJ0eSxcbiAgUGFyc2VkRXZlbnQsXG4gIFBhcnNlZEV2ZW50VHlwZSxcbn0gZnJvbSAnLi4vZXhwcmVzc2lvbl9wYXJzZXIvYXN0JztcbmltcG9ydCB7STE4bk1ldGF9IGZyb20gJy4uL2kxOG4vaTE4bl9hc3QnO1xuaW1wb3J0IHtQYXJzZVNvdXJjZVNwYW59IGZyb20gJy4uL3BhcnNlX3V0aWwnO1xuXG5leHBvcnQgaW50ZXJmYWNlIE5vZGUge1xuICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW47XG4gIHZpc2l0PFJlc3VsdD4odmlzaXRvcjogVmlzaXRvcjxSZXN1bHQ+KTogUmVzdWx0O1xufVxuXG4vKipcbiAqIFRoaXMgaXMgYW4gUjMgYE5vZGVgLWxpa2Ugd3JhcHBlciBmb3IgYSByYXcgYGh0bWwuQ29tbWVudGAgbm9kZS4gV2UgZG8gbm90IGN1cnJlbnRseVxuICogcmVxdWlyZSB0aGUgaW1wbGVtZW50YXRpb24gb2YgYSB2aXNpdG9yIGZvciBDb21tZW50cyBhcyB0aGV5IGFyZSBvbmx5IGNvbGxlY3RlZCBhdFxuICogdGhlIHRvcC1sZXZlbCBvZiB0aGUgUjMgQVNULCBhbmQgb25seSBpZiBgUmVuZGVyM1BhcnNlT3B0aW9uc1snY29sbGVjdENvbW1lbnROb2RlcyddYFxuICogaXMgdHJ1ZS5cbiAqL1xuZXhwb3J0IGNsYXNzIENvbW1lbnQgaW1wbGVtZW50cyBOb2RlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIHZhbHVlOiBzdHJpbmcsXG4gICAgcHVibGljIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgKSB7fVxuICB2aXNpdDxSZXN1bHQ+KF92aXNpdG9yOiBWaXNpdG9yPFJlc3VsdD4pOiBSZXN1bHQge1xuICAgIHRocm93IG5ldyBFcnJvcigndmlzaXQoKSBub3QgaW1wbGVtZW50ZWQgZm9yIENvbW1lbnQnKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgVGV4dCBpbXBsZW1lbnRzIE5vZGUge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgdmFsdWU6IHN0cmluZyxcbiAgICBwdWJsaWMgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICApIHt9XG4gIHZpc2l0PFJlc3VsdD4odmlzaXRvcjogVmlzaXRvcjxSZXN1bHQ+KTogUmVzdWx0IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdFRleHQodGhpcyk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEJvdW5kVGV4dCBpbXBsZW1lbnRzIE5vZGUge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgdmFsdWU6IEFTVCxcbiAgICBwdWJsaWMgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgIHB1YmxpYyBpMThuPzogSTE4bk1ldGEsXG4gICkge31cbiAgdmlzaXQ8UmVzdWx0Pih2aXNpdG9yOiBWaXNpdG9yPFJlc3VsdD4pOiBSZXN1bHQge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0Qm91bmRUZXh0KHRoaXMpO1xuICB9XG59XG5cbi8qKlxuICogUmVwcmVzZW50cyBhIHRleHQgYXR0cmlidXRlIGluIHRoZSB0ZW1wbGF0ZS5cbiAqXG4gKiBgdmFsdWVTcGFuYCBtYXkgbm90IGJlIHByZXNlbnQgaW4gY2FzZXMgd2hlcmUgdGhlcmUgaXMgbm8gdmFsdWUgYDxkaXYgYT48L2Rpdj5gLlxuICogYGtleVNwYW5gIG1heSBhbHNvIG5vdCBiZSBwcmVzZW50IGZvciBzeW50aGV0aWMgYXR0cmlidXRlcyBmcm9tIElDVSBleHBhbnNpb25zLlxuICovXG5leHBvcnQgY2xhc3MgVGV4dEF0dHJpYnV0ZSBpbXBsZW1lbnRzIE5vZGUge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgbmFtZTogc3RyaW5nLFxuICAgIHB1YmxpYyB2YWx1ZTogc3RyaW5nLFxuICAgIHB1YmxpYyBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgcmVhZG9ubHkga2V5U3BhbjogUGFyc2VTb3VyY2VTcGFuIHwgdW5kZWZpbmVkLFxuICAgIHB1YmxpYyB2YWx1ZVNwYW4/OiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgcHVibGljIGkxOG4/OiBJMThuTWV0YSxcbiAgKSB7fVxuICB2aXNpdDxSZXN1bHQ+KHZpc2l0b3I6IFZpc2l0b3I8UmVzdWx0Pik6IFJlc3VsdCB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRUZXh0QXR0cmlidXRlKHRoaXMpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBCb3VuZEF0dHJpYnV0ZSBpbXBsZW1lbnRzIE5vZGUge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgbmFtZTogc3RyaW5nLFxuICAgIHB1YmxpYyB0eXBlOiBCaW5kaW5nVHlwZSxcbiAgICBwdWJsaWMgc2VjdXJpdHlDb250ZXh0OiBTZWN1cml0eUNvbnRleHQsXG4gICAgcHVibGljIHZhbHVlOiBBU1QsXG4gICAgcHVibGljIHVuaXQ6IHN0cmluZyB8IG51bGwsXG4gICAgcHVibGljIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICByZWFkb25seSBrZXlTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgcHVibGljIHZhbHVlU3BhbjogUGFyc2VTb3VyY2VTcGFuIHwgdW5kZWZpbmVkLFxuICAgIHB1YmxpYyBpMThuOiBJMThuTWV0YSB8IHVuZGVmaW5lZCxcbiAgKSB7fVxuXG4gIHN0YXRpYyBmcm9tQm91bmRFbGVtZW50UHJvcGVydHkocHJvcDogQm91bmRFbGVtZW50UHJvcGVydHksIGkxOG4/OiBJMThuTWV0YSk6IEJvdW5kQXR0cmlidXRlIHtcbiAgICBpZiAocHJvcC5rZXlTcGFuID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYFVuZXhwZWN0ZWQgc3RhdGU6IGtleVNwYW4gbXVzdCBiZSBkZWZpbmVkIGZvciBib3VuZCBhdHRyaWJ1dGVzIGJ1dCB3YXMgbm90IGZvciAke3Byb3AubmFtZX06ICR7cHJvcC5zb3VyY2VTcGFufWAsXG4gICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IEJvdW5kQXR0cmlidXRlKFxuICAgICAgcHJvcC5uYW1lLFxuICAgICAgcHJvcC50eXBlLFxuICAgICAgcHJvcC5zZWN1cml0eUNvbnRleHQsXG4gICAgICBwcm9wLnZhbHVlLFxuICAgICAgcHJvcC51bml0LFxuICAgICAgcHJvcC5zb3VyY2VTcGFuLFxuICAgICAgcHJvcC5rZXlTcGFuLFxuICAgICAgcHJvcC52YWx1ZVNwYW4sXG4gICAgICBpMThuLFxuICAgICk7XG4gIH1cblxuICB2aXNpdDxSZXN1bHQ+KHZpc2l0b3I6IFZpc2l0b3I8UmVzdWx0Pik6IFJlc3VsdCB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRCb3VuZEF0dHJpYnV0ZSh0aGlzKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQm91bmRFdmVudCBpbXBsZW1lbnRzIE5vZGUge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgbmFtZTogc3RyaW5nLFxuICAgIHB1YmxpYyB0eXBlOiBQYXJzZWRFdmVudFR5cGUsXG4gICAgcHVibGljIGhhbmRsZXI6IEFTVCxcbiAgICBwdWJsaWMgdGFyZ2V0OiBzdHJpbmcgfCBudWxsLFxuICAgIHB1YmxpYyBwaGFzZTogc3RyaW5nIHwgbnVsbCxcbiAgICBwdWJsaWMgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgIHB1YmxpYyBoYW5kbGVyU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgIHJlYWRvbmx5IGtleVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgKSB7fVxuXG4gIHN0YXRpYyBmcm9tUGFyc2VkRXZlbnQoZXZlbnQ6IFBhcnNlZEV2ZW50KSB7XG4gICAgY29uc3QgdGFyZ2V0OiBzdHJpbmcgfCBudWxsID1cbiAgICAgIGV2ZW50LnR5cGUgPT09IFBhcnNlZEV2ZW50VHlwZS5SZWd1bGFyID8gZXZlbnQudGFyZ2V0T3JQaGFzZSA6IG51bGw7XG4gICAgY29uc3QgcGhhc2U6IHN0cmluZyB8IG51bGwgPVxuICAgICAgZXZlbnQudHlwZSA9PT0gUGFyc2VkRXZlbnRUeXBlLkFuaW1hdGlvbiA/IGV2ZW50LnRhcmdldE9yUGhhc2UgOiBudWxsO1xuICAgIGlmIChldmVudC5rZXlTcGFuID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYFVuZXhwZWN0ZWQgc3RhdGU6IGtleVNwYW4gbXVzdCBiZSBkZWZpbmVkIGZvciBib3VuZCBldmVudCBidXQgd2FzIG5vdCBmb3IgJHtldmVudC5uYW1lfTogJHtldmVudC5zb3VyY2VTcGFufWAsXG4gICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IEJvdW5kRXZlbnQoXG4gICAgICBldmVudC5uYW1lLFxuICAgICAgZXZlbnQudHlwZSxcbiAgICAgIGV2ZW50LmhhbmRsZXIsXG4gICAgICB0YXJnZXQsXG4gICAgICBwaGFzZSxcbiAgICAgIGV2ZW50LnNvdXJjZVNwYW4sXG4gICAgICBldmVudC5oYW5kbGVyU3BhbixcbiAgICAgIGV2ZW50LmtleVNwYW4sXG4gICAgKTtcbiAgfVxuXG4gIHZpc2l0PFJlc3VsdD4odmlzaXRvcjogVmlzaXRvcjxSZXN1bHQ+KTogUmVzdWx0IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdEJvdW5kRXZlbnQodGhpcyk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEVsZW1lbnQgaW1wbGVtZW50cyBOb2RlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIG5hbWU6IHN0cmluZyxcbiAgICBwdWJsaWMgYXR0cmlidXRlczogVGV4dEF0dHJpYnV0ZVtdLFxuICAgIHB1YmxpYyBpbnB1dHM6IEJvdW5kQXR0cmlidXRlW10sXG4gICAgcHVibGljIG91dHB1dHM6IEJvdW5kRXZlbnRbXSxcbiAgICBwdWJsaWMgY2hpbGRyZW46IE5vZGVbXSxcbiAgICBwdWJsaWMgcmVmZXJlbmNlczogUmVmZXJlbmNlW10sXG4gICAgcHVibGljIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICBwdWJsaWMgc3RhcnRTb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgcHVibGljIGVuZFNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbiB8IG51bGwsXG4gICAgcHVibGljIGkxOG4/OiBJMThuTWV0YSxcbiAgKSB7fVxuICB2aXNpdDxSZXN1bHQ+KHZpc2l0b3I6IFZpc2l0b3I8UmVzdWx0Pik6IFJlc3VsdCB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRFbGVtZW50KHRoaXMpO1xuICB9XG59XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBEZWZlcnJlZFRyaWdnZXIgaW1wbGVtZW50cyBOb2RlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIG5hbWVTcGFuOiBQYXJzZVNvdXJjZVNwYW4gfCBudWxsLFxuICAgIHB1YmxpYyBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgcHVibGljIHByZWZldGNoU3BhbjogUGFyc2VTb3VyY2VTcGFuIHwgbnVsbCxcbiAgICBwdWJsaWMgd2hlbk9yT25Tb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4gfCBudWxsLFxuICApIHt9XG5cbiAgdmlzaXQ8UmVzdWx0Pih2aXNpdG9yOiBWaXNpdG9yPFJlc3VsdD4pOiBSZXN1bHQge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0RGVmZXJyZWRUcmlnZ2VyKHRoaXMpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBCb3VuZERlZmVycmVkVHJpZ2dlciBleHRlbmRzIERlZmVycmVkVHJpZ2dlciB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyB2YWx1ZTogQVNULFxuICAgIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICBwcmVmZXRjaFNwYW46IFBhcnNlU291cmNlU3BhbiB8IG51bGwsXG4gICAgd2hlblNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgKSB7XG4gICAgLy8gQm91bmREZWZlcnJlZFRyaWdnZXIgaXMgZm9yICd3aGVuJyB0cmlnZ2Vycy4gVGhlc2UgYXJlbid0IHJlYWxseSBcInRyaWdnZXJzXCIgYW5kIGRvbid0IGhhdmUgYVxuICAgIC8vIG5hbWVTcGFuLiBUcmlnZ2VyIG5hbWVzIGFyZSB0aGUgYnVpbHQgaW4gZXZlbnQgdHJpZ2dlcnMgbGlrZSBob3ZlciwgaW50ZXJhY3Rpb24sIGV0Yy5cbiAgICBzdXBlcigvKiogbmFtZVNwYW4gKi8gbnVsbCwgc291cmNlU3BhbiwgcHJlZmV0Y2hTcGFuLCB3aGVuU291cmNlU3Bhbik7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIElkbGVEZWZlcnJlZFRyaWdnZXIgZXh0ZW5kcyBEZWZlcnJlZFRyaWdnZXIge31cblxuZXhwb3J0IGNsYXNzIEltbWVkaWF0ZURlZmVycmVkVHJpZ2dlciBleHRlbmRzIERlZmVycmVkVHJpZ2dlciB7fVxuXG5leHBvcnQgY2xhc3MgSG92ZXJEZWZlcnJlZFRyaWdnZXIgZXh0ZW5kcyBEZWZlcnJlZFRyaWdnZXIge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgcmVmZXJlbmNlOiBzdHJpbmcgfCBudWxsLFxuICAgIG5hbWVTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgIHByZWZldGNoU3BhbjogUGFyc2VTb3VyY2VTcGFuIHwgbnVsbCxcbiAgICBvblNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbiB8IG51bGwsXG4gICkge1xuICAgIHN1cGVyKG5hbWVTcGFuLCBzb3VyY2VTcGFuLCBwcmVmZXRjaFNwYW4sIG9uU291cmNlU3Bhbik7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFRpbWVyRGVmZXJyZWRUcmlnZ2VyIGV4dGVuZHMgRGVmZXJyZWRUcmlnZ2VyIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIGRlbGF5OiBudW1iZXIsXG4gICAgbmFtZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgcHJlZmV0Y2hTcGFuOiBQYXJzZVNvdXJjZVNwYW4gfCBudWxsLFxuICAgIG9uU291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuIHwgbnVsbCxcbiAgKSB7XG4gICAgc3VwZXIobmFtZVNwYW4sIHNvdXJjZVNwYW4sIHByZWZldGNoU3Bhbiwgb25Tb3VyY2VTcGFuKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgSW50ZXJhY3Rpb25EZWZlcnJlZFRyaWdnZXIgZXh0ZW5kcyBEZWZlcnJlZFRyaWdnZXIge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgcmVmZXJlbmNlOiBzdHJpbmcgfCBudWxsLFxuICAgIG5hbWVTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgIHByZWZldGNoU3BhbjogUGFyc2VTb3VyY2VTcGFuIHwgbnVsbCxcbiAgICBvblNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbiB8IG51bGwsXG4gICkge1xuICAgIHN1cGVyKG5hbWVTcGFuLCBzb3VyY2VTcGFuLCBwcmVmZXRjaFNwYW4sIG9uU291cmNlU3Bhbik7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFZpZXdwb3J0RGVmZXJyZWRUcmlnZ2VyIGV4dGVuZHMgRGVmZXJyZWRUcmlnZ2VyIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIHJlZmVyZW5jZTogc3RyaW5nIHwgbnVsbCxcbiAgICBuYW1lU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICBwcmVmZXRjaFNwYW46IFBhcnNlU291cmNlU3BhbiB8IG51bGwsXG4gICAgb25Tb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4gfCBudWxsLFxuICApIHtcbiAgICBzdXBlcihuYW1lU3Bhbiwgc291cmNlU3BhbiwgcHJlZmV0Y2hTcGFuLCBvblNvdXJjZVNwYW4pO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBCbG9ja05vZGUge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgbmFtZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICBwdWJsaWMgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgIHB1YmxpYyBzdGFydFNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICBwdWJsaWMgZW5kU291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuIHwgbnVsbCxcbiAgKSB7fVxufVxuXG5leHBvcnQgY2xhc3MgRGVmZXJyZWRCbG9ja1BsYWNlaG9sZGVyIGV4dGVuZHMgQmxvY2tOb2RlIGltcGxlbWVudHMgTm9kZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBjaGlsZHJlbjogTm9kZVtdLFxuICAgIHB1YmxpYyBtaW5pbXVtVGltZTogbnVtYmVyIHwgbnVsbCxcbiAgICBuYW1lU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICBzdGFydFNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICBlbmRTb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4gfCBudWxsLFxuICAgIHB1YmxpYyBpMThuPzogSTE4bk1ldGEsXG4gICkge1xuICAgIHN1cGVyKG5hbWVTcGFuLCBzb3VyY2VTcGFuLCBzdGFydFNvdXJjZVNwYW4sIGVuZFNvdXJjZVNwYW4pO1xuICB9XG5cbiAgdmlzaXQ8UmVzdWx0Pih2aXNpdG9yOiBWaXNpdG9yPFJlc3VsdD4pOiBSZXN1bHQge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0RGVmZXJyZWRCbG9ja1BsYWNlaG9sZGVyKHRoaXMpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBEZWZlcnJlZEJsb2NrTG9hZGluZyBleHRlbmRzIEJsb2NrTm9kZSBpbXBsZW1lbnRzIE5vZGUge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgY2hpbGRyZW46IE5vZGVbXSxcbiAgICBwdWJsaWMgYWZ0ZXJUaW1lOiBudW1iZXIgfCBudWxsLFxuICAgIHB1YmxpYyBtaW5pbXVtVGltZTogbnVtYmVyIHwgbnVsbCxcbiAgICBuYW1lU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICBzdGFydFNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICBlbmRTb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4gfCBudWxsLFxuICAgIHB1YmxpYyBpMThuPzogSTE4bk1ldGEsXG4gICkge1xuICAgIHN1cGVyKG5hbWVTcGFuLCBzb3VyY2VTcGFuLCBzdGFydFNvdXJjZVNwYW4sIGVuZFNvdXJjZVNwYW4pO1xuICB9XG5cbiAgdmlzaXQ8UmVzdWx0Pih2aXNpdG9yOiBWaXNpdG9yPFJlc3VsdD4pOiBSZXN1bHQge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0RGVmZXJyZWRCbG9ja0xvYWRpbmcodGhpcyk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIERlZmVycmVkQmxvY2tFcnJvciBleHRlbmRzIEJsb2NrTm9kZSBpbXBsZW1lbnRzIE5vZGUge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgY2hpbGRyZW46IE5vZGVbXSxcbiAgICBuYW1lU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICBzdGFydFNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICBlbmRTb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4gfCBudWxsLFxuICAgIHB1YmxpYyBpMThuPzogSTE4bk1ldGEsXG4gICkge1xuICAgIHN1cGVyKG5hbWVTcGFuLCBzb3VyY2VTcGFuLCBzdGFydFNvdXJjZVNwYW4sIGVuZFNvdXJjZVNwYW4pO1xuICB9XG5cbiAgdmlzaXQ8UmVzdWx0Pih2aXNpdG9yOiBWaXNpdG9yPFJlc3VsdD4pOiBSZXN1bHQge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0RGVmZXJyZWRCbG9ja0Vycm9yKHRoaXMpO1xuICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGVmZXJyZWRCbG9ja1RyaWdnZXJzIHtcbiAgd2hlbj86IEJvdW5kRGVmZXJyZWRUcmlnZ2VyO1xuICBpZGxlPzogSWRsZURlZmVycmVkVHJpZ2dlcjtcbiAgaW1tZWRpYXRlPzogSW1tZWRpYXRlRGVmZXJyZWRUcmlnZ2VyO1xuICBob3Zlcj86IEhvdmVyRGVmZXJyZWRUcmlnZ2VyO1xuICB0aW1lcj86IFRpbWVyRGVmZXJyZWRUcmlnZ2VyO1xuICBpbnRlcmFjdGlvbj86IEludGVyYWN0aW9uRGVmZXJyZWRUcmlnZ2VyO1xuICB2aWV3cG9ydD86IFZpZXdwb3J0RGVmZXJyZWRUcmlnZ2VyO1xufVxuXG5leHBvcnQgY2xhc3MgRGVmZXJyZWRCbG9jayBleHRlbmRzIEJsb2NrTm9kZSBpbXBsZW1lbnRzIE5vZGUge1xuICByZWFkb25seSB0cmlnZ2VyczogUmVhZG9ubHk8RGVmZXJyZWRCbG9ja1RyaWdnZXJzPjtcbiAgcmVhZG9ubHkgcHJlZmV0Y2hUcmlnZ2VyczogUmVhZG9ubHk8RGVmZXJyZWRCbG9ja1RyaWdnZXJzPjtcbiAgcHJpdmF0ZSByZWFkb25seSBkZWZpbmVkVHJpZ2dlcnM6IChrZXlvZiBEZWZlcnJlZEJsb2NrVHJpZ2dlcnMpW107XG4gIHByaXZhdGUgcmVhZG9ubHkgZGVmaW5lZFByZWZldGNoVHJpZ2dlcnM6IChrZXlvZiBEZWZlcnJlZEJsb2NrVHJpZ2dlcnMpW107XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIGNoaWxkcmVuOiBOb2RlW10sXG4gICAgdHJpZ2dlcnM6IERlZmVycmVkQmxvY2tUcmlnZ2VycyxcbiAgICBwcmVmZXRjaFRyaWdnZXJzOiBEZWZlcnJlZEJsb2NrVHJpZ2dlcnMsXG4gICAgcHVibGljIHBsYWNlaG9sZGVyOiBEZWZlcnJlZEJsb2NrUGxhY2Vob2xkZXIgfCBudWxsLFxuICAgIHB1YmxpYyBsb2FkaW5nOiBEZWZlcnJlZEJsb2NrTG9hZGluZyB8IG51bGwsXG4gICAgcHVibGljIGVycm9yOiBEZWZlcnJlZEJsb2NrRXJyb3IgfCBudWxsLFxuICAgIG5hbWVTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgIHB1YmxpYyBtYWluQmxvY2tTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgc3RhcnRTb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgZW5kU291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuIHwgbnVsbCxcbiAgICBwdWJsaWMgaTE4bj86IEkxOG5NZXRhLFxuICApIHtcbiAgICBzdXBlcihuYW1lU3Bhbiwgc291cmNlU3Bhbiwgc3RhcnRTb3VyY2VTcGFuLCBlbmRTb3VyY2VTcGFuKTtcbiAgICB0aGlzLnRyaWdnZXJzID0gdHJpZ2dlcnM7XG4gICAgdGhpcy5wcmVmZXRjaFRyaWdnZXJzID0gcHJlZmV0Y2hUcmlnZ2VycztcbiAgICAvLyBXZSBjYWNoZSB0aGUga2V5cyBzaW5jZSB3ZSBrbm93IHRoYXQgdGhleSB3b24ndCBjaGFuZ2UgYW5kIHdlXG4gICAgLy8gZG9uJ3Qgd2FudCB0byBlbnVtYXJhdGUgdGhlbSBldmVyeSB0aW1lIHdlJ3JlIHRyYXZlcnNpbmcgdGhlIEFTVC5cbiAgICB0aGlzLmRlZmluZWRUcmlnZ2VycyA9IE9iamVjdC5rZXlzKHRyaWdnZXJzKSBhcyAoa2V5b2YgRGVmZXJyZWRCbG9ja1RyaWdnZXJzKVtdO1xuICAgIHRoaXMuZGVmaW5lZFByZWZldGNoVHJpZ2dlcnMgPSBPYmplY3Qua2V5cyhwcmVmZXRjaFRyaWdnZXJzKSBhcyAoa2V5b2YgRGVmZXJyZWRCbG9ja1RyaWdnZXJzKVtdO1xuICB9XG5cbiAgdmlzaXQ8UmVzdWx0Pih2aXNpdG9yOiBWaXNpdG9yPFJlc3VsdD4pOiBSZXN1bHQge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0RGVmZXJyZWRCbG9jayh0aGlzKTtcbiAgfVxuXG4gIHZpc2l0QWxsKHZpc2l0b3I6IFZpc2l0b3I8dW5rbm93bj4pOiB2b2lkIHtcbiAgICB0aGlzLnZpc2l0VHJpZ2dlcnModGhpcy5kZWZpbmVkVHJpZ2dlcnMsIHRoaXMudHJpZ2dlcnMsIHZpc2l0b3IpO1xuICAgIHRoaXMudmlzaXRUcmlnZ2Vycyh0aGlzLmRlZmluZWRQcmVmZXRjaFRyaWdnZXJzLCB0aGlzLnByZWZldGNoVHJpZ2dlcnMsIHZpc2l0b3IpO1xuICAgIHZpc2l0QWxsKHZpc2l0b3IsIHRoaXMuY2hpbGRyZW4pO1xuICAgIGNvbnN0IHJlbWFpbmluZ0Jsb2NrcyA9IFt0aGlzLnBsYWNlaG9sZGVyLCB0aGlzLmxvYWRpbmcsIHRoaXMuZXJyb3JdLmZpbHRlcihcbiAgICAgICh4KSA9PiB4ICE9PSBudWxsLFxuICAgICkgYXMgQXJyYXk8Tm9kZT47XG4gICAgdmlzaXRBbGwodmlzaXRvciwgcmVtYWluaW5nQmxvY2tzKTtcbiAgfVxuXG4gIHByaXZhdGUgdmlzaXRUcmlnZ2VycyhcbiAgICBrZXlzOiAoa2V5b2YgRGVmZXJyZWRCbG9ja1RyaWdnZXJzKVtdLFxuICAgIHRyaWdnZXJzOiBEZWZlcnJlZEJsb2NrVHJpZ2dlcnMsXG4gICAgdmlzaXRvcjogVmlzaXRvcixcbiAgKSB7XG4gICAgdmlzaXRBbGwoXG4gICAgICB2aXNpdG9yLFxuICAgICAga2V5cy5tYXAoKGspID0+IHRyaWdnZXJzW2tdISksXG4gICAgKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgU3dpdGNoQmxvY2sgZXh0ZW5kcyBCbG9ja05vZGUgaW1wbGVtZW50cyBOb2RlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIGV4cHJlc3Npb246IEFTVCxcbiAgICBwdWJsaWMgY2FzZXM6IFN3aXRjaEJsb2NrQ2FzZVtdLFxuICAgIC8qKlxuICAgICAqIFRoZXNlIGJsb2NrcyBhcmUgb25seSBjYXB0dXJlZCB0byBhbGxvdyBmb3IgYXV0b2NvbXBsZXRpb24gaW4gdGhlIGxhbmd1YWdlIHNlcnZpY2UuIFRoZXlcbiAgICAgKiBhcmVuJ3QgbWVhbnQgdG8gYmUgcHJvY2Vzc2VkIGluIGFueSBvdGhlciB3YXkuXG4gICAgICovXG4gICAgcHVibGljIHVua25vd25CbG9ja3M6IFVua25vd25CbG9ja1tdLFxuICAgIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICBzdGFydFNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICBlbmRTb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4gfCBudWxsLFxuICAgIG5hbWVTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICkge1xuICAgIHN1cGVyKG5hbWVTcGFuLCBzb3VyY2VTcGFuLCBzdGFydFNvdXJjZVNwYW4sIGVuZFNvdXJjZVNwYW4pO1xuICB9XG5cbiAgdmlzaXQ8UmVzdWx0Pih2aXNpdG9yOiBWaXNpdG9yPFJlc3VsdD4pOiBSZXN1bHQge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0U3dpdGNoQmxvY2sodGhpcyk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFN3aXRjaEJsb2NrQ2FzZSBleHRlbmRzIEJsb2NrTm9kZSBpbXBsZW1lbnRzIE5vZGUge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgZXhwcmVzc2lvbjogQVNUIHwgbnVsbCxcbiAgICBwdWJsaWMgY2hpbGRyZW46IE5vZGVbXSxcbiAgICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgc3RhcnRTb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgZW5kU291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuIHwgbnVsbCxcbiAgICBuYW1lU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgIHB1YmxpYyBpMThuPzogSTE4bk1ldGEsXG4gICkge1xuICAgIHN1cGVyKG5hbWVTcGFuLCBzb3VyY2VTcGFuLCBzdGFydFNvdXJjZVNwYW4sIGVuZFNvdXJjZVNwYW4pO1xuICB9XG5cbiAgdmlzaXQ8UmVzdWx0Pih2aXNpdG9yOiBWaXNpdG9yPFJlc3VsdD4pOiBSZXN1bHQge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0U3dpdGNoQmxvY2tDYXNlKHRoaXMpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBGb3JMb29wQmxvY2sgZXh0ZW5kcyBCbG9ja05vZGUgaW1wbGVtZW50cyBOb2RlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIGl0ZW06IFZhcmlhYmxlLFxuICAgIHB1YmxpYyBleHByZXNzaW9uOiBBU1RXaXRoU291cmNlLFxuICAgIHB1YmxpYyB0cmFja0J5OiBBU1RXaXRoU291cmNlLFxuICAgIHB1YmxpYyB0cmFja0tleXdvcmRTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgcHVibGljIGNvbnRleHRWYXJpYWJsZXM6IFZhcmlhYmxlW10sXG4gICAgcHVibGljIGNoaWxkcmVuOiBOb2RlW10sXG4gICAgcHVibGljIGVtcHR5OiBGb3JMb29wQmxvY2tFbXB0eSB8IG51bGwsXG4gICAgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgIHB1YmxpYyBtYWluQmxvY2tTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgc3RhcnRTb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgZW5kU291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuIHwgbnVsbCxcbiAgICBuYW1lU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgIHB1YmxpYyBpMThuPzogSTE4bk1ldGEsXG4gICkge1xuICAgIHN1cGVyKG5hbWVTcGFuLCBzb3VyY2VTcGFuLCBzdGFydFNvdXJjZVNwYW4sIGVuZFNvdXJjZVNwYW4pO1xuICB9XG5cbiAgdmlzaXQ8UmVzdWx0Pih2aXNpdG9yOiBWaXNpdG9yPFJlc3VsdD4pOiBSZXN1bHQge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0Rm9yTG9vcEJsb2NrKHRoaXMpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBGb3JMb29wQmxvY2tFbXB0eSBleHRlbmRzIEJsb2NrTm9kZSBpbXBsZW1lbnRzIE5vZGUge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgY2hpbGRyZW46IE5vZGVbXSxcbiAgICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgc3RhcnRTb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgZW5kU291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuIHwgbnVsbCxcbiAgICBuYW1lU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgIHB1YmxpYyBpMThuPzogSTE4bk1ldGEsXG4gICkge1xuICAgIHN1cGVyKG5hbWVTcGFuLCBzb3VyY2VTcGFuLCBzdGFydFNvdXJjZVNwYW4sIGVuZFNvdXJjZVNwYW4pO1xuICB9XG5cbiAgdmlzaXQ8UmVzdWx0Pih2aXNpdG9yOiBWaXNpdG9yPFJlc3VsdD4pOiBSZXN1bHQge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0Rm9yTG9vcEJsb2NrRW1wdHkodGhpcyk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIElmQmxvY2sgZXh0ZW5kcyBCbG9ja05vZGUgaW1wbGVtZW50cyBOb2RlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIGJyYW5jaGVzOiBJZkJsb2NrQnJhbmNoW10sXG4gICAgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgIHN0YXJ0U291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgIGVuZFNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbiB8IG51bGwsXG4gICAgbmFtZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgKSB7XG4gICAgc3VwZXIobmFtZVNwYW4sIHNvdXJjZVNwYW4sIHN0YXJ0U291cmNlU3BhbiwgZW5kU291cmNlU3Bhbik7XG4gIH1cblxuICB2aXNpdDxSZXN1bHQ+KHZpc2l0b3I6IFZpc2l0b3I8UmVzdWx0Pik6IFJlc3VsdCB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRJZkJsb2NrKHRoaXMpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBJZkJsb2NrQnJhbmNoIGV4dGVuZHMgQmxvY2tOb2RlIGltcGxlbWVudHMgTm9kZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBleHByZXNzaW9uOiBBU1QgfCBudWxsLFxuICAgIHB1YmxpYyBjaGlsZHJlbjogTm9kZVtdLFxuICAgIHB1YmxpYyBleHByZXNzaW9uQWxpYXM6IFZhcmlhYmxlIHwgbnVsbCxcbiAgICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgc3RhcnRTb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgZW5kU291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuIHwgbnVsbCxcbiAgICBuYW1lU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgIHB1YmxpYyBpMThuPzogSTE4bk1ldGEsXG4gICkge1xuICAgIHN1cGVyKG5hbWVTcGFuLCBzb3VyY2VTcGFuLCBzdGFydFNvdXJjZVNwYW4sIGVuZFNvdXJjZVNwYW4pO1xuICB9XG5cbiAgdmlzaXQ8UmVzdWx0Pih2aXNpdG9yOiBWaXNpdG9yPFJlc3VsdD4pOiBSZXN1bHQge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0SWZCbG9ja0JyYW5jaCh0aGlzKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgVW5rbm93bkJsb2NrIGltcGxlbWVudHMgTm9kZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBuYW1lOiBzdHJpbmcsXG4gICAgcHVibGljIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICBwdWJsaWMgbmFtZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgKSB7fVxuXG4gIHZpc2l0PFJlc3VsdD4odmlzaXRvcjogVmlzaXRvcjxSZXN1bHQ+KTogUmVzdWx0IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdFVua25vd25CbG9jayh0aGlzKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgTGV0RGVjbGFyYXRpb24gaW1wbGVtZW50cyBOb2RlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIG5hbWU6IHN0cmluZyxcbiAgICBwdWJsaWMgdmFsdWU6IEFTVCxcbiAgICBwdWJsaWMgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgIHB1YmxpYyBuYW1lU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgIHB1YmxpYyB2YWx1ZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgKSB7fVxuXG4gIHZpc2l0PFJlc3VsdD4odmlzaXRvcjogVmlzaXRvcjxSZXN1bHQ+KTogUmVzdWx0IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdExldERlY2xhcmF0aW9uKHRoaXMpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBUZW1wbGF0ZSBpbXBsZW1lbnRzIE5vZGUge1xuICBjb25zdHJ1Y3RvcihcbiAgICAvLyB0YWdOYW1lIGlzIHRoZSBuYW1lIG9mIHRoZSBjb250YWluZXIgZWxlbWVudCwgaWYgYXBwbGljYWJsZS5cbiAgICAvLyBgbnVsbGAgaXMgYSBzcGVjaWFsIGNhc2UgZm9yIHdoZW4gdGhlcmUgaXMgYSBzdHJ1Y3R1cmFsIGRpcmVjdGl2ZSBvbiBhbiBgbmctdGVtcGxhdGVgIHNvXG4gICAgLy8gdGhlIHJlbmRlcmVyIGNhbiBkaWZmZXJlbnRpYXRlIGJldHdlZW4gdGhlIHN5bnRoZXRpYyB0ZW1wbGF0ZSBhbmQgdGhlIG9uZSB3cml0dGVuIGluIHRoZVxuICAgIC8vIGZpbGUuXG4gICAgcHVibGljIHRhZ05hbWU6IHN0cmluZyB8IG51bGwsXG4gICAgcHVibGljIGF0dHJpYnV0ZXM6IFRleHRBdHRyaWJ1dGVbXSxcbiAgICBwdWJsaWMgaW5wdXRzOiBCb3VuZEF0dHJpYnV0ZVtdLFxuICAgIHB1YmxpYyBvdXRwdXRzOiBCb3VuZEV2ZW50W10sXG4gICAgcHVibGljIHRlbXBsYXRlQXR0cnM6IChCb3VuZEF0dHJpYnV0ZSB8IFRleHRBdHRyaWJ1dGUpW10sXG4gICAgcHVibGljIGNoaWxkcmVuOiBOb2RlW10sXG4gICAgcHVibGljIHJlZmVyZW5jZXM6IFJlZmVyZW5jZVtdLFxuICAgIHB1YmxpYyB2YXJpYWJsZXM6IFZhcmlhYmxlW10sXG4gICAgcHVibGljIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICBwdWJsaWMgc3RhcnRTb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgcHVibGljIGVuZFNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbiB8IG51bGwsXG4gICAgcHVibGljIGkxOG4/OiBJMThuTWV0YSxcbiAgKSB7fVxuICB2aXNpdDxSZXN1bHQ+KHZpc2l0b3I6IFZpc2l0b3I8UmVzdWx0Pik6IFJlc3VsdCB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRUZW1wbGF0ZSh0aGlzKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQ29udGVudCBpbXBsZW1lbnRzIE5vZGUge1xuICByZWFkb25seSBuYW1lID0gJ25nLWNvbnRlbnQnO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBzZWxlY3Rvcjogc3RyaW5nLFxuICAgIHB1YmxpYyBhdHRyaWJ1dGVzOiBUZXh0QXR0cmlidXRlW10sXG4gICAgcHVibGljIGNoaWxkcmVuOiBOb2RlW10sXG4gICAgcHVibGljIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICBwdWJsaWMgaTE4bj86IEkxOG5NZXRhLFxuICApIHt9XG4gIHZpc2l0PFJlc3VsdD4odmlzaXRvcjogVmlzaXRvcjxSZXN1bHQ+KTogUmVzdWx0IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdENvbnRlbnQodGhpcyk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFZhcmlhYmxlIGltcGxlbWVudHMgTm9kZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBuYW1lOiBzdHJpbmcsXG4gICAgcHVibGljIHZhbHVlOiBzdHJpbmcsXG4gICAgcHVibGljIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICByZWFkb25seSBrZXlTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgcHVibGljIHZhbHVlU3Bhbj86IFBhcnNlU291cmNlU3BhbixcbiAgKSB7fVxuICB2aXNpdDxSZXN1bHQ+KHZpc2l0b3I6IFZpc2l0b3I8UmVzdWx0Pik6IFJlc3VsdCB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRWYXJpYWJsZSh0aGlzKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUmVmZXJlbmNlIGltcGxlbWVudHMgTm9kZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBuYW1lOiBzdHJpbmcsXG4gICAgcHVibGljIHZhbHVlOiBzdHJpbmcsXG4gICAgcHVibGljIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICByZWFkb25seSBrZXlTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgcHVibGljIHZhbHVlU3Bhbj86IFBhcnNlU291cmNlU3BhbixcbiAgKSB7fVxuICB2aXNpdDxSZXN1bHQ+KHZpc2l0b3I6IFZpc2l0b3I8UmVzdWx0Pik6IFJlc3VsdCB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRSZWZlcmVuY2UodGhpcyk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEljdSBpbXBsZW1lbnRzIE5vZGUge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgdmFyczoge1tuYW1lOiBzdHJpbmddOiBCb3VuZFRleHR9LFxuICAgIHB1YmxpYyBwbGFjZWhvbGRlcnM6IHtbbmFtZTogc3RyaW5nXTogVGV4dCB8IEJvdW5kVGV4dH0sXG4gICAgcHVibGljIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICBwdWJsaWMgaTE4bj86IEkxOG5NZXRhLFxuICApIHt9XG4gIHZpc2l0PFJlc3VsdD4odmlzaXRvcjogVmlzaXRvcjxSZXN1bHQ+KTogUmVzdWx0IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdEljdSh0aGlzKTtcbiAgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFZpc2l0b3I8UmVzdWx0ID0gYW55PiB7XG4gIC8vIFJldHVybmluZyBhIHRydXRoeSB2YWx1ZSBmcm9tIGB2aXNpdCgpYCB3aWxsIHByZXZlbnQgYHZpc2l0QWxsKClgIGZyb20gdGhlIGNhbGwgdG8gdGhlIHR5cGVkXG4gIC8vIG1ldGhvZCBhbmQgcmVzdWx0IHJldHVybmVkIHdpbGwgYmVjb21lIHRoZSByZXN1bHQgaW5jbHVkZWQgaW4gYHZpc2l0QWxsKClgcyByZXN1bHQgYXJyYXkuXG4gIHZpc2l0Pyhub2RlOiBOb2RlKTogUmVzdWx0O1xuXG4gIHZpc2l0RWxlbWVudChlbGVtZW50OiBFbGVtZW50KTogUmVzdWx0O1xuICB2aXNpdFRlbXBsYXRlKHRlbXBsYXRlOiBUZW1wbGF0ZSk6IFJlc3VsdDtcbiAgdmlzaXRDb250ZW50KGNvbnRlbnQ6IENvbnRlbnQpOiBSZXN1bHQ7XG4gIHZpc2l0VmFyaWFibGUodmFyaWFibGU6IFZhcmlhYmxlKTogUmVzdWx0O1xuICB2aXNpdFJlZmVyZW5jZShyZWZlcmVuY2U6IFJlZmVyZW5jZSk6IFJlc3VsdDtcbiAgdmlzaXRUZXh0QXR0cmlidXRlKGF0dHJpYnV0ZTogVGV4dEF0dHJpYnV0ZSk6IFJlc3VsdDtcbiAgdmlzaXRCb3VuZEF0dHJpYnV0ZShhdHRyaWJ1dGU6IEJvdW5kQXR0cmlidXRlKTogUmVzdWx0O1xuICB2aXNpdEJvdW5kRXZlbnQoYXR0cmlidXRlOiBCb3VuZEV2ZW50KTogUmVzdWx0O1xuICB2aXNpdFRleHQodGV4dDogVGV4dCk6IFJlc3VsdDtcbiAgdmlzaXRCb3VuZFRleHQodGV4dDogQm91bmRUZXh0KTogUmVzdWx0O1xuICB2aXNpdEljdShpY3U6IEljdSk6IFJlc3VsdDtcbiAgdmlzaXREZWZlcnJlZEJsb2NrKGRlZmVycmVkOiBEZWZlcnJlZEJsb2NrKTogUmVzdWx0O1xuICB2aXNpdERlZmVycmVkQmxvY2tQbGFjZWhvbGRlcihibG9jazogRGVmZXJyZWRCbG9ja1BsYWNlaG9sZGVyKTogUmVzdWx0O1xuICB2aXNpdERlZmVycmVkQmxvY2tFcnJvcihibG9jazogRGVmZXJyZWRCbG9ja0Vycm9yKTogUmVzdWx0O1xuICB2aXNpdERlZmVycmVkQmxvY2tMb2FkaW5nKGJsb2NrOiBEZWZlcnJlZEJsb2NrTG9hZGluZyk6IFJlc3VsdDtcbiAgdmlzaXREZWZlcnJlZFRyaWdnZXIodHJpZ2dlcjogRGVmZXJyZWRUcmlnZ2VyKTogUmVzdWx0O1xuICB2aXNpdFN3aXRjaEJsb2NrKGJsb2NrOiBTd2l0Y2hCbG9jayk6IFJlc3VsdDtcbiAgdmlzaXRTd2l0Y2hCbG9ja0Nhc2UoYmxvY2s6IFN3aXRjaEJsb2NrQ2FzZSk6IFJlc3VsdDtcbiAgdmlzaXRGb3JMb29wQmxvY2soYmxvY2s6IEZvckxvb3BCbG9jayk6IFJlc3VsdDtcbiAgdmlzaXRGb3JMb29wQmxvY2tFbXB0eShibG9jazogRm9yTG9vcEJsb2NrRW1wdHkpOiBSZXN1bHQ7XG4gIHZpc2l0SWZCbG9jayhibG9jazogSWZCbG9jayk6IFJlc3VsdDtcbiAgdmlzaXRJZkJsb2NrQnJhbmNoKGJsb2NrOiBJZkJsb2NrQnJhbmNoKTogUmVzdWx0O1xuICB2aXNpdFVua25vd25CbG9jayhibG9jazogVW5rbm93bkJsb2NrKTogUmVzdWx0O1xuICB2aXNpdExldERlY2xhcmF0aW9uKGRlY2w6IExldERlY2xhcmF0aW9uKTogUmVzdWx0O1xufVxuXG5leHBvcnQgY2xhc3MgUmVjdXJzaXZlVmlzaXRvciBpbXBsZW1lbnRzIFZpc2l0b3I8dm9pZD4ge1xuICB2aXNpdEVsZW1lbnQoZWxlbWVudDogRWxlbWVudCk6IHZvaWQge1xuICAgIHZpc2l0QWxsKHRoaXMsIGVsZW1lbnQuYXR0cmlidXRlcyk7XG4gICAgdmlzaXRBbGwodGhpcywgZWxlbWVudC5pbnB1dHMpO1xuICAgIHZpc2l0QWxsKHRoaXMsIGVsZW1lbnQub3V0cHV0cyk7XG4gICAgdmlzaXRBbGwodGhpcywgZWxlbWVudC5jaGlsZHJlbik7XG4gICAgdmlzaXRBbGwodGhpcywgZWxlbWVudC5yZWZlcmVuY2VzKTtcbiAgfVxuICB2aXNpdFRlbXBsYXRlKHRlbXBsYXRlOiBUZW1wbGF0ZSk6IHZvaWQge1xuICAgIHZpc2l0QWxsKHRoaXMsIHRlbXBsYXRlLmF0dHJpYnV0ZXMpO1xuICAgIHZpc2l0QWxsKHRoaXMsIHRlbXBsYXRlLmlucHV0cyk7XG4gICAgdmlzaXRBbGwodGhpcywgdGVtcGxhdGUub3V0cHV0cyk7XG4gICAgdmlzaXRBbGwodGhpcywgdGVtcGxhdGUuY2hpbGRyZW4pO1xuICAgIHZpc2l0QWxsKHRoaXMsIHRlbXBsYXRlLnJlZmVyZW5jZXMpO1xuICAgIHZpc2l0QWxsKHRoaXMsIHRlbXBsYXRlLnZhcmlhYmxlcyk7XG4gIH1cbiAgdmlzaXREZWZlcnJlZEJsb2NrKGRlZmVycmVkOiBEZWZlcnJlZEJsb2NrKTogdm9pZCB7XG4gICAgZGVmZXJyZWQudmlzaXRBbGwodGhpcyk7XG4gIH1cbiAgdmlzaXREZWZlcnJlZEJsb2NrUGxhY2Vob2xkZXIoYmxvY2s6IERlZmVycmVkQmxvY2tQbGFjZWhvbGRlcik6IHZvaWQge1xuICAgIHZpc2l0QWxsKHRoaXMsIGJsb2NrLmNoaWxkcmVuKTtcbiAgfVxuICB2aXNpdERlZmVycmVkQmxvY2tFcnJvcihibG9jazogRGVmZXJyZWRCbG9ja0Vycm9yKTogdm9pZCB7XG4gICAgdmlzaXRBbGwodGhpcywgYmxvY2suY2hpbGRyZW4pO1xuICB9XG4gIHZpc2l0RGVmZXJyZWRCbG9ja0xvYWRpbmcoYmxvY2s6IERlZmVycmVkQmxvY2tMb2FkaW5nKTogdm9pZCB7XG4gICAgdmlzaXRBbGwodGhpcywgYmxvY2suY2hpbGRyZW4pO1xuICB9XG4gIHZpc2l0U3dpdGNoQmxvY2soYmxvY2s6IFN3aXRjaEJsb2NrKTogdm9pZCB7XG4gICAgdmlzaXRBbGwodGhpcywgYmxvY2suY2FzZXMpO1xuICB9XG4gIHZpc2l0U3dpdGNoQmxvY2tDYXNlKGJsb2NrOiBTd2l0Y2hCbG9ja0Nhc2UpOiB2b2lkIHtcbiAgICB2aXNpdEFsbCh0aGlzLCBibG9jay5jaGlsZHJlbik7XG4gIH1cbiAgdmlzaXRGb3JMb29wQmxvY2soYmxvY2s6IEZvckxvb3BCbG9jayk6IHZvaWQge1xuICAgIGNvbnN0IGJsb2NrSXRlbXMgPSBbYmxvY2suaXRlbSwgLi4uYmxvY2suY29udGV4dFZhcmlhYmxlcywgLi4uYmxvY2suY2hpbGRyZW5dO1xuICAgIGJsb2NrLmVtcHR5ICYmIGJsb2NrSXRlbXMucHVzaChibG9jay5lbXB0eSk7XG4gICAgdmlzaXRBbGwodGhpcywgYmxvY2tJdGVtcyk7XG4gIH1cbiAgdmlzaXRGb3JMb29wQmxvY2tFbXB0eShibG9jazogRm9yTG9vcEJsb2NrRW1wdHkpOiB2b2lkIHtcbiAgICB2aXNpdEFsbCh0aGlzLCBibG9jay5jaGlsZHJlbik7XG4gIH1cbiAgdmlzaXRJZkJsb2NrKGJsb2NrOiBJZkJsb2NrKTogdm9pZCB7XG4gICAgdmlzaXRBbGwodGhpcywgYmxvY2suYnJhbmNoZXMpO1xuICB9XG4gIHZpc2l0SWZCbG9ja0JyYW5jaChibG9jazogSWZCbG9ja0JyYW5jaCk6IHZvaWQge1xuICAgIGNvbnN0IGJsb2NrSXRlbXMgPSBibG9jay5jaGlsZHJlbjtcbiAgICBibG9jay5leHByZXNzaW9uQWxpYXMgJiYgYmxvY2tJdGVtcy5wdXNoKGJsb2NrLmV4cHJlc3Npb25BbGlhcyk7XG4gICAgdmlzaXRBbGwodGhpcywgYmxvY2tJdGVtcyk7XG4gIH1cbiAgdmlzaXRDb250ZW50KGNvbnRlbnQ6IENvbnRlbnQpOiB2b2lkIHtcbiAgICB2aXNpdEFsbCh0aGlzLCBjb250ZW50LmNoaWxkcmVuKTtcbiAgfVxuICB2aXNpdFZhcmlhYmxlKHZhcmlhYmxlOiBWYXJpYWJsZSk6IHZvaWQge31cbiAgdmlzaXRSZWZlcmVuY2UocmVmZXJlbmNlOiBSZWZlcmVuY2UpOiB2b2lkIHt9XG4gIHZpc2l0VGV4dEF0dHJpYnV0ZShhdHRyaWJ1dGU6IFRleHRBdHRyaWJ1dGUpOiB2b2lkIHt9XG4gIHZpc2l0Qm91bmRBdHRyaWJ1dGUoYXR0cmlidXRlOiBCb3VuZEF0dHJpYnV0ZSk6IHZvaWQge31cbiAgdmlzaXRCb3VuZEV2ZW50KGF0dHJpYnV0ZTogQm91bmRFdmVudCk6IHZvaWQge31cbiAgdmlzaXRUZXh0KHRleHQ6IFRleHQpOiB2b2lkIHt9XG4gIHZpc2l0Qm91bmRUZXh0KHRleHQ6IEJvdW5kVGV4dCk6IHZvaWQge31cbiAgdmlzaXRJY3UoaWN1OiBJY3UpOiB2b2lkIHt9XG4gIHZpc2l0RGVmZXJyZWRUcmlnZ2VyKHRyaWdnZXI6IERlZmVycmVkVHJpZ2dlcik6IHZvaWQge31cbiAgdmlzaXRVbmtub3duQmxvY2soYmxvY2s6IFVua25vd25CbG9jayk6IHZvaWQge31cbiAgdmlzaXRMZXREZWNsYXJhdGlvbihkZWNsOiBMZXREZWNsYXJhdGlvbik6IHZvaWQge31cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHZpc2l0QWxsPFJlc3VsdD4odmlzaXRvcjogVmlzaXRvcjxSZXN1bHQ+LCBub2RlczogTm9kZVtdKTogUmVzdWx0W10ge1xuICBjb25zdCByZXN1bHQ6IFJlc3VsdFtdID0gW107XG4gIGlmICh2aXNpdG9yLnZpc2l0KSB7XG4gICAgZm9yIChjb25zdCBub2RlIG9mIG5vZGVzKSB7XG4gICAgICB2aXNpdG9yLnZpc2l0KG5vZGUpIHx8IG5vZGUudmlzaXQodmlzaXRvcik7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGZvciAoY29uc3Qgbm9kZSBvZiBub2Rlcykge1xuICAgICAgY29uc3QgbmV3Tm9kZSA9IG5vZGUudmlzaXQodmlzaXRvcik7XG4gICAgICBpZiAobmV3Tm9kZSkge1xuICAgICAgICByZXN1bHQucHVzaChuZXdOb2RlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cbiJdfQ==