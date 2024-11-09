/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
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
        const target = event.type === 0 /* ParsedEventType.Regular */ ? event.targetOrPhase : null;
        const phase = event.type === 1 /* ParsedEventType.Animation */ ? event.targetOrPhase : null;
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
        const remainingBlocks = [this.placeholder, this.loading, this.error].filter(x => x !== null);
        visitAll(visitor, remainingBlocks);
    }
    visitTriggers(keys, triggers, visitor) {
        visitAll(visitor, keys.map(k => triggers[k]));
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
    constructor(selector, attributes, sourceSpan, i18n) {
        this.selector = selector;
        this.attributes = attributes;
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
        const blockItems = [block.item, ...Object.values(block.contextVariables), ...block.children];
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
    visitContent(content) { }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicjNfYXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3JlbmRlcjMvcjNfYXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQVlIOzs7OztHQUtHO0FBQ0gsTUFBTSxPQUFPLE9BQU87SUFDbEIsWUFBbUIsS0FBYSxFQUFTLFVBQTJCO1FBQWpELFVBQUssR0FBTCxLQUFLLENBQVE7UUFBUyxlQUFVLEdBQVYsVUFBVSxDQUFpQjtJQUFHLENBQUM7SUFDeEUsS0FBSyxDQUFTLFFBQXlCO1FBQ3JDLE1BQU0sSUFBSSxLQUFLLENBQUMscUNBQXFDLENBQUMsQ0FBQztJQUN6RCxDQUFDO0NBQ0Y7QUFFRCxNQUFNLE9BQU8sSUFBSTtJQUNmLFlBQW1CLEtBQWEsRUFBUyxVQUEyQjtRQUFqRCxVQUFLLEdBQUwsS0FBSyxDQUFRO1FBQVMsZUFBVSxHQUFWLFVBQVUsQ0FBaUI7SUFBRyxDQUFDO0lBQ3hFLEtBQUssQ0FBUyxPQUF3QjtRQUNwQyxPQUFPLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDakMsQ0FBQztDQUNGO0FBRUQsTUFBTSxPQUFPLFNBQVM7SUFDcEIsWUFBbUIsS0FBVSxFQUFTLFVBQTJCLEVBQVMsSUFBZTtRQUF0RSxVQUFLLEdBQUwsS0FBSyxDQUFLO1FBQVMsZUFBVSxHQUFWLFVBQVUsQ0FBaUI7UUFBUyxTQUFJLEdBQUosSUFBSSxDQUFXO0lBQUcsQ0FBQztJQUM3RixLQUFLLENBQVMsT0FBd0I7UUFDcEMsT0FBTyxPQUFPLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3RDLENBQUM7Q0FDRjtBQUVEOzs7OztHQUtHO0FBQ0gsTUFBTSxPQUFPLGFBQWE7SUFDeEIsWUFDVyxJQUFZLEVBQVMsS0FBYSxFQUFTLFVBQTJCLEVBQ3BFLE9BQWtDLEVBQVMsU0FBMkIsRUFDeEUsSUFBZTtRQUZmLFNB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LGFBQWEsQ0FBQyxRQUFrQixJQUFTLENBQUM7SUFDMUMsY0FBYyxDQUFDLFNBQW9CLElBQVMsQ0FBQztJQUM3QyxrQkFBa0IsQ0FBQyxTQUF3QixJQUFTLENBQUM7SUFDckQsbUJBQW1CLENBQUMsU0FBeUIsSUFBUyxDQUFDO0lBQ3ZELGVBQWUsQ0FBQyxTQUFxQixJQUFTLENBQUM7SUFDL0MsU0FBUyxDQUFDLElBQVUsSUFBUyxDQUFDO0lBQzlCLGNBQWMsQ0FBQyxJQUFlLElBQVMsQ0FBQztJQUN4QyxRQUFRLENBQUMsR0FBUSxJQUFTLENBQUM7SUFDM0Isb0JBQW9CLENBQUMsT0FBd0IsSUFBUyxDQUFDO0lBQ3ZELGlCQUFpQixDQUFDLEtBQW1CLElBQVMsQ0FBQztDQUNoRDtBQUdELE1BQU0sVUFBVSxRQUFRLENBQVMsT0FBd0IsRUFBRSxLQUFhO0lBQ3RFLE1BQU0sTUFBTSxHQUFhLEVBQUUsQ0FBQztJQUM1QixJQUFJLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNsQixLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRSxDQUFDO1lBQ3pCLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM3QyxDQUFDO0lBQ0gsQ0FBQztTQUFNLENBQUM7UUFDTixLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRSxDQUFDO1lBQ3pCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDcEMsSUFBSSxPQUFPLEVBQUUsQ0FBQztnQkFDWixNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3ZCLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztJQUNELE9BQU8sTUFBTSxDQUFDO0FBQ2hCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtTZWN1cml0eUNvbnRleHR9IGZyb20gJy4uL2NvcmUnO1xuaW1wb3J0IHtBU1QsIEFTVFdpdGhTb3VyY2UsIEJpbmRpbmdUeXBlLCBCb3VuZEVsZW1lbnRQcm9wZXJ0eSwgUGFyc2VkRXZlbnQsIFBhcnNlZEV2ZW50VHlwZX0gZnJvbSAnLi4vZXhwcmVzc2lvbl9wYXJzZXIvYXN0JztcbmltcG9ydCB7STE4bk1ldGF9IGZyb20gJy4uL2kxOG4vaTE4bl9hc3QnO1xuaW1wb3J0IHtQYXJzZVNvdXJjZVNwYW59IGZyb20gJy4uL3BhcnNlX3V0aWwnO1xuXG5leHBvcnQgaW50ZXJmYWNlIE5vZGUge1xuICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW47XG4gIHZpc2l0PFJlc3VsdD4odmlzaXRvcjogVmlzaXRvcjxSZXN1bHQ+KTogUmVzdWx0O1xufVxuXG4vKipcbiAqIFRoaXMgaXMgYW4gUjMgYE5vZGVgLWxpa2Ugd3JhcHBlciBmb3IgYSByYXcgYGh0bWwuQ29tbWVudGAgbm9kZS4gV2UgZG8gbm90IGN1cnJlbnRseVxuICogcmVxdWlyZSB0aGUgaW1wbGVtZW50YXRpb24gb2YgYSB2aXNpdG9yIGZvciBDb21tZW50cyBhcyB0aGV5IGFyZSBvbmx5IGNvbGxlY3RlZCBhdFxuICogdGhlIHRvcC1sZXZlbCBvZiB0aGUgUjMgQVNULCBhbmQgb25seSBpZiBgUmVuZGVyM1BhcnNlT3B0aW9uc1snY29sbGVjdENvbW1lbnROb2RlcyddYFxuICogaXMgdHJ1ZS5cbiAqL1xuZXhwb3J0IGNsYXNzIENvbW1lbnQgaW1wbGVtZW50cyBOb2RlIHtcbiAgY29uc3RydWN0b3IocHVibGljIHZhbHVlOiBzdHJpbmcsIHB1YmxpYyBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pIHt9XG4gIHZpc2l0PFJlc3VsdD4oX3Zpc2l0b3I6IFZpc2l0b3I8UmVzdWx0Pik6IFJlc3VsdCB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCd2aXNpdCgpIG5vdCBpbXBsZW1lbnRlZCBmb3IgQ29tbWVudCcpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBUZXh0IGltcGxlbWVudHMgTm9kZSB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB2YWx1ZTogc3RyaW5nLCBwdWJsaWMgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuKSB7fVxuICB2aXNpdDxSZXN1bHQ+KHZpc2l0b3I6IFZpc2l0b3I8UmVzdWx0Pik6IFJlc3VsdCB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRUZXh0KHRoaXMpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBCb3VuZFRleHQgaW1wbGVtZW50cyBOb2RlIHtcbiAgY29uc3RydWN0b3IocHVibGljIHZhbHVlOiBBU1QsIHB1YmxpYyBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sIHB1YmxpYyBpMThuPzogSTE4bk1ldGEpIHt9XG4gIHZpc2l0PFJlc3VsdD4odmlzaXRvcjogVmlzaXRvcjxSZXN1bHQ+KTogUmVzdWx0IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdEJvdW5kVGV4dCh0aGlzKTtcbiAgfVxufVxuXG4vKipcbiAqIFJlcHJlc2VudHMgYSB0ZXh0IGF0dHJpYnV0ZSBpbiB0aGUgdGVtcGxhdGUuXG4gKlxuICogYHZhbHVlU3BhbmAgbWF5IG5vdCBiZSBwcmVzZW50IGluIGNhc2VzIHdoZXJlIHRoZXJlIGlzIG5vIHZhbHVlIGA8ZGl2IGE+PC9kaXY+YC5cbiAqIGBrZXlTcGFuYCBtYXkgYWxzbyBub3QgYmUgcHJlc2VudCBmb3Igc3ludGhldGljIGF0dHJpYnV0ZXMgZnJvbSBJQ1UgZXhwYW5zaW9ucy5cbiAqL1xuZXhwb3J0IGNsYXNzIFRleHRBdHRyaWJ1dGUgaW1wbGVtZW50cyBOb2RlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgbmFtZTogc3RyaW5nLCBwdWJsaWMgdmFsdWU6IHN0cmluZywgcHVibGljIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICAgIHJlYWRvbmx5IGtleVNwYW46IFBhcnNlU291cmNlU3Bhbnx1bmRlZmluZWQsIHB1YmxpYyB2YWx1ZVNwYW4/OiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgICBwdWJsaWMgaTE4bj86IEkxOG5NZXRhKSB7fVxuICB2aXNpdDxSZXN1bHQ+KHZpc2l0b3I6IFZpc2l0b3I8UmVzdWx0Pik6IFJlc3VsdCB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRUZXh0QXR0cmlidXRlKHRoaXMpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBCb3VuZEF0dHJpYnV0ZSBpbXBsZW1lbnRzIE5vZGUge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyBuYW1lOiBzdHJpbmcsIHB1YmxpYyB0eXBlOiBCaW5kaW5nVHlwZSwgcHVibGljIHNlY3VyaXR5Q29udGV4dDogU2VjdXJpdHlDb250ZXh0LFxuICAgICAgcHVibGljIHZhbHVlOiBBU1QsIHB1YmxpYyB1bml0OiBzdHJpbmd8bnVsbCwgcHVibGljIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICAgIHJlYWRvbmx5IGtleVNwYW46IFBhcnNlU291cmNlU3BhbiwgcHVibGljIHZhbHVlU3BhbjogUGFyc2VTb3VyY2VTcGFufHVuZGVmaW5lZCxcbiAgICAgIHB1YmxpYyBpMThuOiBJMThuTWV0YXx1bmRlZmluZWQpIHt9XG5cbiAgc3RhdGljIGZyb21Cb3VuZEVsZW1lbnRQcm9wZXJ0eShwcm9wOiBCb3VuZEVsZW1lbnRQcm9wZXJ0eSwgaTE4bj86IEkxOG5NZXRhKTogQm91bmRBdHRyaWJ1dGUge1xuICAgIGlmIChwcm9wLmtleVNwYW4gPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBVbmV4cGVjdGVkIHN0YXRlOiBrZXlTcGFuIG11c3QgYmUgZGVmaW5lZCBmb3IgYm91bmQgYXR0cmlidXRlcyBidXQgd2FzIG5vdCBmb3IgJHtcbiAgICAgICAgICAgICAgcHJvcC5uYW1lfTogJHtwcm9wLnNvdXJjZVNwYW59YCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgQm91bmRBdHRyaWJ1dGUoXG4gICAgICAgIHByb3AubmFtZSwgcHJvcC50eXBlLCBwcm9wLnNlY3VyaXR5Q29udGV4dCwgcHJvcC52YWx1ZSwgcHJvcC51bml0LCBwcm9wLnNvdXJjZVNwYW4sXG4gICAgICAgIHByb3Aua2V5U3BhbiwgcHJvcC52YWx1ZVNwYW4sIGkxOG4pO1xuICB9XG5cbiAgdmlzaXQ8UmVzdWx0Pih2aXNpdG9yOiBWaXNpdG9yPFJlc3VsdD4pOiBSZXN1bHQge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0Qm91bmRBdHRyaWJ1dGUodGhpcyk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEJvdW5kRXZlbnQgaW1wbGVtZW50cyBOb2RlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgbmFtZTogc3RyaW5nLCBwdWJsaWMgdHlwZTogUGFyc2VkRXZlbnRUeXBlLCBwdWJsaWMgaGFuZGxlcjogQVNULFxuICAgICAgcHVibGljIHRhcmdldDogc3RyaW5nfG51bGwsIHB1YmxpYyBwaGFzZTogc3RyaW5nfG51bGwsIHB1YmxpYyBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgICBwdWJsaWMgaGFuZGxlclNwYW46IFBhcnNlU291cmNlU3BhbiwgcmVhZG9ubHkga2V5U3BhbjogUGFyc2VTb3VyY2VTcGFuKSB7fVxuXG4gIHN0YXRpYyBmcm9tUGFyc2VkRXZlbnQoZXZlbnQ6IFBhcnNlZEV2ZW50KSB7XG4gICAgY29uc3QgdGFyZ2V0OiBzdHJpbmd8bnVsbCA9IGV2ZW50LnR5cGUgPT09IFBhcnNlZEV2ZW50VHlwZS5SZWd1bGFyID8gZXZlbnQudGFyZ2V0T3JQaGFzZSA6IG51bGw7XG4gICAgY29uc3QgcGhhc2U6IHN0cmluZ3xudWxsID1cbiAgICAgICAgZXZlbnQudHlwZSA9PT0gUGFyc2VkRXZlbnRUeXBlLkFuaW1hdGlvbiA/IGV2ZW50LnRhcmdldE9yUGhhc2UgOiBudWxsO1xuICAgIGlmIChldmVudC5rZXlTcGFuID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5leHBlY3RlZCBzdGF0ZToga2V5U3BhbiBtdXN0IGJlIGRlZmluZWQgZm9yIGJvdW5kIGV2ZW50IGJ1dCB3YXMgbm90IGZvciAke1xuICAgICAgICAgIGV2ZW50Lm5hbWV9OiAke2V2ZW50LnNvdXJjZVNwYW59YCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgQm91bmRFdmVudChcbiAgICAgICAgZXZlbnQubmFtZSwgZXZlbnQudHlwZSwgZXZlbnQuaGFuZGxlciwgdGFyZ2V0LCBwaGFzZSwgZXZlbnQuc291cmNlU3BhbiwgZXZlbnQuaGFuZGxlclNwYW4sXG4gICAgICAgIGV2ZW50LmtleVNwYW4pO1xuICB9XG5cbiAgdmlzaXQ8UmVzdWx0Pih2aXNpdG9yOiBWaXNpdG9yPFJlc3VsdD4pOiBSZXN1bHQge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0Qm91bmRFdmVudCh0aGlzKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRWxlbWVudCBpbXBsZW1lbnRzIE5vZGUge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyBuYW1lOiBzdHJpbmcsIHB1YmxpYyBhdHRyaWJ1dGVzOiBUZXh0QXR0cmlidXRlW10sIHB1YmxpYyBpbnB1dHM6IEJvdW5kQXR0cmlidXRlW10sXG4gICAgICBwdWJsaWMgb3V0cHV0czogQm91bmRFdmVudFtdLCBwdWJsaWMgY2hpbGRyZW46IE5vZGVbXSwgcHVibGljIHJlZmVyZW5jZXM6IFJlZmVyZW5jZVtdLFxuICAgICAgcHVibGljIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbiwgcHVibGljIHN0YXJ0U291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgICAgcHVibGljIGVuZFNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbnxudWxsLCBwdWJsaWMgaTE4bj86IEkxOG5NZXRhKSB7fVxuICB2aXNpdDxSZXN1bHQ+KHZpc2l0b3I6IFZpc2l0b3I8UmVzdWx0Pik6IFJlc3VsdCB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRFbGVtZW50KHRoaXMpO1xuICB9XG59XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBEZWZlcnJlZFRyaWdnZXIgaW1wbGVtZW50cyBOb2RlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgbmFtZVNwYW46IFBhcnNlU291cmNlU3BhbnxudWxsLCBwdWJsaWMgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgICAgcHVibGljIHByZWZldGNoU3BhbjogUGFyc2VTb3VyY2VTcGFufG51bGwsIHB1YmxpYyB3aGVuT3JPblNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbnxudWxsKSB7fVxuXG4gIHZpc2l0PFJlc3VsdD4odmlzaXRvcjogVmlzaXRvcjxSZXN1bHQ+KTogUmVzdWx0IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdERlZmVycmVkVHJpZ2dlcih0aGlzKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQm91bmREZWZlcnJlZFRyaWdnZXIgZXh0ZW5kcyBEZWZlcnJlZFRyaWdnZXIge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyB2YWx1ZTogQVNULCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sIHByZWZldGNoU3BhbjogUGFyc2VTb3VyY2VTcGFufG51bGwsXG4gICAgICB3aGVuU291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuKSB7XG4gICAgLy8gQm91bmREZWZlcnJlZFRyaWdnZXIgaXMgZm9yICd3aGVuJyB0cmlnZ2Vycy4gVGhlc2UgYXJlbid0IHJlYWxseSBcInRyaWdnZXJzXCIgYW5kIGRvbid0IGhhdmUgYVxuICAgIC8vIG5hbWVTcGFuLiBUcmlnZ2VyIG5hbWVzIGFyZSB0aGUgYnVpbHQgaW4gZXZlbnQgdHJpZ2dlcnMgbGlrZSBob3ZlciwgaW50ZXJhY3Rpb24sIGV0Yy5cbiAgICBzdXBlcigvKiogbmFtZVNwYW4gKi8gbnVsbCwgc291cmNlU3BhbiwgcHJlZmV0Y2hTcGFuLCB3aGVuU291cmNlU3Bhbik7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIElkbGVEZWZlcnJlZFRyaWdnZXIgZXh0ZW5kcyBEZWZlcnJlZFRyaWdnZXIge31cblxuZXhwb3J0IGNsYXNzIEltbWVkaWF0ZURlZmVycmVkVHJpZ2dlciBleHRlbmRzIERlZmVycmVkVHJpZ2dlciB7fVxuXG5leHBvcnQgY2xhc3MgSG92ZXJEZWZlcnJlZFRyaWdnZXIgZXh0ZW5kcyBEZWZlcnJlZFRyaWdnZXIge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyByZWZlcmVuY2U6IHN0cmluZ3xudWxsLCBuYW1lU3BhbjogUGFyc2VTb3VyY2VTcGFuLCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgICBwcmVmZXRjaFNwYW46IFBhcnNlU291cmNlU3BhbnxudWxsLCBvblNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbnxudWxsKSB7XG4gICAgc3VwZXIobmFtZVNwYW4sIHNvdXJjZVNwYW4sIHByZWZldGNoU3Bhbiwgb25Tb3VyY2VTcGFuKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgVGltZXJEZWZlcnJlZFRyaWdnZXIgZXh0ZW5kcyBEZWZlcnJlZFRyaWdnZXIge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyBkZWxheTogbnVtYmVyLCBuYW1lU3BhbjogUGFyc2VTb3VyY2VTcGFuLCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgICBwcmVmZXRjaFNwYW46IFBhcnNlU291cmNlU3BhbnxudWxsLCBvblNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbnxudWxsKSB7XG4gICAgc3VwZXIobmFtZVNwYW4sIHNvdXJjZVNwYW4sIHByZWZldGNoU3Bhbiwgb25Tb3VyY2VTcGFuKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgSW50ZXJhY3Rpb25EZWZlcnJlZFRyaWdnZXIgZXh0ZW5kcyBEZWZlcnJlZFRyaWdnZXIge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyByZWZlcmVuY2U6IHN0cmluZ3xudWxsLCBuYW1lU3BhbjogUGFyc2VTb3VyY2VTcGFuLCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgICBwcmVmZXRjaFNwYW46IFBhcnNlU291cmNlU3BhbnxudWxsLCBvblNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbnxudWxsKSB7XG4gICAgc3VwZXIobmFtZVNwYW4sIHNvdXJjZVNwYW4sIHByZWZldGNoU3Bhbiwgb25Tb3VyY2VTcGFuKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgVmlld3BvcnREZWZlcnJlZFRyaWdnZXIgZXh0ZW5kcyBEZWZlcnJlZFRyaWdnZXIge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyByZWZlcmVuY2U6IHN0cmluZ3xudWxsLCBuYW1lU3BhbjogUGFyc2VTb3VyY2VTcGFuLCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgICBwcmVmZXRjaFNwYW46IFBhcnNlU291cmNlU3BhbnxudWxsLCBvblNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbnxudWxsKSB7XG4gICAgc3VwZXIobmFtZVNwYW4sIHNvdXJjZVNwYW4sIHByZWZldGNoU3Bhbiwgb25Tb3VyY2VTcGFuKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQmxvY2tOb2RlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgbmFtZVNwYW46IFBhcnNlU291cmNlU3BhbiwgcHVibGljIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICAgIHB1YmxpYyBzdGFydFNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbiwgcHVibGljIGVuZFNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbnxudWxsKSB7fVxufVxuXG5leHBvcnQgY2xhc3MgRGVmZXJyZWRCbG9ja1BsYWNlaG9sZGVyIGV4dGVuZHMgQmxvY2tOb2RlIGltcGxlbWVudHMgTm9kZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIGNoaWxkcmVuOiBOb2RlW10sIHB1YmxpYyBtaW5pbXVtVGltZTogbnVtYmVyfG51bGwsIG5hbWVTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sIHN0YXJ0U291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgICAgZW5kU291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFufG51bGwsIHB1YmxpYyBpMThuPzogSTE4bk1ldGEpIHtcbiAgICBzdXBlcihuYW1lU3Bhbiwgc291cmNlU3Bhbiwgc3RhcnRTb3VyY2VTcGFuLCBlbmRTb3VyY2VTcGFuKTtcbiAgfVxuXG4gIHZpc2l0PFJlc3VsdD4odmlzaXRvcjogVmlzaXRvcjxSZXN1bHQ+KTogUmVzdWx0IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdERlZmVycmVkQmxvY2tQbGFjZWhvbGRlcih0aGlzKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRGVmZXJyZWRCbG9ja0xvYWRpbmcgZXh0ZW5kcyBCbG9ja05vZGUgaW1wbGVtZW50cyBOb2RlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgY2hpbGRyZW46IE5vZGVbXSwgcHVibGljIGFmdGVyVGltZTogbnVtYmVyfG51bGwsIHB1YmxpYyBtaW5pbXVtVGltZTogbnVtYmVyfG51bGwsXG4gICAgICBuYW1lU3BhbjogUGFyc2VTb3VyY2VTcGFuLCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sIHN0YXJ0U291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgICAgZW5kU291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFufG51bGwsIHB1YmxpYyBpMThuPzogSTE4bk1ldGEpIHtcbiAgICBzdXBlcihuYW1lU3Bhbiwgc291cmNlU3Bhbiwgc3RhcnRTb3VyY2VTcGFuLCBlbmRTb3VyY2VTcGFuKTtcbiAgfVxuXG4gIHZpc2l0PFJlc3VsdD4odmlzaXRvcjogVmlzaXRvcjxSZXN1bHQ+KTogUmVzdWx0IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdERlZmVycmVkQmxvY2tMb2FkaW5nKHRoaXMpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBEZWZlcnJlZEJsb2NrRXJyb3IgZXh0ZW5kcyBCbG9ja05vZGUgaW1wbGVtZW50cyBOb2RlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgY2hpbGRyZW46IE5vZGVbXSwgbmFtZVNwYW46IFBhcnNlU291cmNlU3Bhbiwgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgICAgc3RhcnRTb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sIGVuZFNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbnxudWxsLFxuICAgICAgcHVibGljIGkxOG4/OiBJMThuTWV0YSkge1xuICAgIHN1cGVyKG5hbWVTcGFuLCBzb3VyY2VTcGFuLCBzdGFydFNvdXJjZVNwYW4sIGVuZFNvdXJjZVNwYW4pO1xuICB9XG5cbiAgdmlzaXQ8UmVzdWx0Pih2aXNpdG9yOiBWaXNpdG9yPFJlc3VsdD4pOiBSZXN1bHQge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0RGVmZXJyZWRCbG9ja0Vycm9yKHRoaXMpO1xuICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGVmZXJyZWRCbG9ja1RyaWdnZXJzIHtcbiAgd2hlbj86IEJvdW5kRGVmZXJyZWRUcmlnZ2VyO1xuICBpZGxlPzogSWRsZURlZmVycmVkVHJpZ2dlcjtcbiAgaW1tZWRpYXRlPzogSW1tZWRpYXRlRGVmZXJyZWRUcmlnZ2VyO1xuICBob3Zlcj86IEhvdmVyRGVmZXJyZWRUcmlnZ2VyO1xuICB0aW1lcj86IFRpbWVyRGVmZXJyZWRUcmlnZ2VyO1xuICBpbnRlcmFjdGlvbj86IEludGVyYWN0aW9uRGVmZXJyZWRUcmlnZ2VyO1xuICB2aWV3cG9ydD86IFZpZXdwb3J0RGVmZXJyZWRUcmlnZ2VyO1xufVxuXG5leHBvcnQgY2xhc3MgRGVmZXJyZWRCbG9jayBleHRlbmRzIEJsb2NrTm9kZSBpbXBsZW1lbnRzIE5vZGUge1xuICByZWFkb25seSB0cmlnZ2VyczogUmVhZG9ubHk8RGVmZXJyZWRCbG9ja1RyaWdnZXJzPjtcbiAgcmVhZG9ubHkgcHJlZmV0Y2hUcmlnZ2VyczogUmVhZG9ubHk8RGVmZXJyZWRCbG9ja1RyaWdnZXJzPjtcbiAgcHJpdmF0ZSByZWFkb25seSBkZWZpbmVkVHJpZ2dlcnM6IChrZXlvZiBEZWZlcnJlZEJsb2NrVHJpZ2dlcnMpW107XG4gIHByaXZhdGUgcmVhZG9ubHkgZGVmaW5lZFByZWZldGNoVHJpZ2dlcnM6IChrZXlvZiBEZWZlcnJlZEJsb2NrVHJpZ2dlcnMpW107XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgY2hpbGRyZW46IE5vZGVbXSwgdHJpZ2dlcnM6IERlZmVycmVkQmxvY2tUcmlnZ2VycyxcbiAgICAgIHByZWZldGNoVHJpZ2dlcnM6IERlZmVycmVkQmxvY2tUcmlnZ2VycywgcHVibGljIHBsYWNlaG9sZGVyOiBEZWZlcnJlZEJsb2NrUGxhY2Vob2xkZXJ8bnVsbCxcbiAgICAgIHB1YmxpYyBsb2FkaW5nOiBEZWZlcnJlZEJsb2NrTG9hZGluZ3xudWxsLCBwdWJsaWMgZXJyb3I6IERlZmVycmVkQmxvY2tFcnJvcnxudWxsLFxuICAgICAgbmFtZVNwYW46IFBhcnNlU291cmNlU3Bhbiwgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLCBwdWJsaWMgbWFpbkJsb2NrU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgICAgc3RhcnRTb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sIGVuZFNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbnxudWxsLFxuICAgICAgcHVibGljIGkxOG4/OiBJMThuTWV0YSkge1xuICAgIHN1cGVyKG5hbWVTcGFuLCBzb3VyY2VTcGFuLCBzdGFydFNvdXJjZVNwYW4sIGVuZFNvdXJjZVNwYW4pO1xuICAgIHRoaXMudHJpZ2dlcnMgPSB0cmlnZ2VycztcbiAgICB0aGlzLnByZWZldGNoVHJpZ2dlcnMgPSBwcmVmZXRjaFRyaWdnZXJzO1xuICAgIC8vIFdlIGNhY2hlIHRoZSBrZXlzIHNpbmNlIHdlIGtub3cgdGhhdCB0aGV5IHdvbid0IGNoYW5nZSBhbmQgd2VcbiAgICAvLyBkb24ndCB3YW50IHRvIGVudW1hcmF0ZSB0aGVtIGV2ZXJ5IHRpbWUgd2UncmUgdHJhdmVyc2luZyB0aGUgQVNULlxuICAgIHRoaXMuZGVmaW5lZFRyaWdnZXJzID0gT2JqZWN0LmtleXModHJpZ2dlcnMpIGFzIChrZXlvZiBEZWZlcnJlZEJsb2NrVHJpZ2dlcnMpW107XG4gICAgdGhpcy5kZWZpbmVkUHJlZmV0Y2hUcmlnZ2VycyA9IE9iamVjdC5rZXlzKHByZWZldGNoVHJpZ2dlcnMpIGFzIChrZXlvZiBEZWZlcnJlZEJsb2NrVHJpZ2dlcnMpW107XG4gIH1cblxuICB2aXNpdDxSZXN1bHQ+KHZpc2l0b3I6IFZpc2l0b3I8UmVzdWx0Pik6IFJlc3VsdCB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXREZWZlcnJlZEJsb2NrKHRoaXMpO1xuICB9XG5cbiAgdmlzaXRBbGwodmlzaXRvcjogVmlzaXRvcjx1bmtub3duPik6IHZvaWQge1xuICAgIHRoaXMudmlzaXRUcmlnZ2Vycyh0aGlzLmRlZmluZWRUcmlnZ2VycywgdGhpcy50cmlnZ2VycywgdmlzaXRvcik7XG4gICAgdGhpcy52aXNpdFRyaWdnZXJzKHRoaXMuZGVmaW5lZFByZWZldGNoVHJpZ2dlcnMsIHRoaXMucHJlZmV0Y2hUcmlnZ2VycywgdmlzaXRvcik7XG4gICAgdmlzaXRBbGwodmlzaXRvciwgdGhpcy5jaGlsZHJlbik7XG4gICAgY29uc3QgcmVtYWluaW5nQmxvY2tzID1cbiAgICAgICAgW3RoaXMucGxhY2Vob2xkZXIsIHRoaXMubG9hZGluZywgdGhpcy5lcnJvcl0uZmlsdGVyKHggPT4geCAhPT0gbnVsbCkgYXMgQXJyYXk8Tm9kZT47XG4gICAgdmlzaXRBbGwodmlzaXRvciwgcmVtYWluaW5nQmxvY2tzKTtcbiAgfVxuXG4gIHByaXZhdGUgdmlzaXRUcmlnZ2VycyhcbiAgICAgIGtleXM6IChrZXlvZiBEZWZlcnJlZEJsb2NrVHJpZ2dlcnMpW10sIHRyaWdnZXJzOiBEZWZlcnJlZEJsb2NrVHJpZ2dlcnMsIHZpc2l0b3I6IFZpc2l0b3IpIHtcbiAgICB2aXNpdEFsbCh2aXNpdG9yLCBrZXlzLm1hcChrID0+IHRyaWdnZXJzW2tdISkpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTd2l0Y2hCbG9jayBleHRlbmRzIEJsb2NrTm9kZSBpbXBsZW1lbnRzIE5vZGUge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyBleHByZXNzaW9uOiBBU1QsIHB1YmxpYyBjYXNlczogU3dpdGNoQmxvY2tDYXNlW10sXG4gICAgICAvKipcbiAgICAgICAqIFRoZXNlIGJsb2NrcyBhcmUgb25seSBjYXB0dXJlZCB0byBhbGxvdyBmb3IgYXV0b2NvbXBsZXRpb24gaW4gdGhlIGxhbmd1YWdlIHNlcnZpY2UuIFRoZXlcbiAgICAgICAqIGFyZW4ndCBtZWFudCB0byBiZSBwcm9jZXNzZWQgaW4gYW55IG90aGVyIHdheS5cbiAgICAgICAqL1xuICAgICAgcHVibGljIHVua25vd25CbG9ja3M6IFVua25vd25CbG9ja1tdLCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgICBzdGFydFNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbiwgZW5kU291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFufG51bGwsXG4gICAgICBuYW1lU3BhbjogUGFyc2VTb3VyY2VTcGFuKSB7XG4gICAgc3VwZXIobmFtZVNwYW4sIHNvdXJjZVNwYW4sIHN0YXJ0U291cmNlU3BhbiwgZW5kU291cmNlU3Bhbik7XG4gIH1cblxuICB2aXNpdDxSZXN1bHQ+KHZpc2l0b3I6IFZpc2l0b3I8UmVzdWx0Pik6IFJlc3VsdCB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRTd2l0Y2hCbG9jayh0aGlzKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgU3dpdGNoQmxvY2tDYXNlIGV4dGVuZHMgQmxvY2tOb2RlIGltcGxlbWVudHMgTm9kZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIGV4cHJlc3Npb246IEFTVHxudWxsLCBwdWJsaWMgY2hpbGRyZW46IE5vZGVbXSwgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgICAgc3RhcnRTb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sIGVuZFNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbnxudWxsLFxuICAgICAgbmFtZVNwYW46IFBhcnNlU291cmNlU3BhbiwgcHVibGljIGkxOG4/OiBJMThuTWV0YSkge1xuICAgIHN1cGVyKG5hbWVTcGFuLCBzb3VyY2VTcGFuLCBzdGFydFNvdXJjZVNwYW4sIGVuZFNvdXJjZVNwYW4pO1xuICB9XG5cbiAgdmlzaXQ8UmVzdWx0Pih2aXNpdG9yOiBWaXNpdG9yPFJlc3VsdD4pOiBSZXN1bHQge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0U3dpdGNoQmxvY2tDYXNlKHRoaXMpO1xuICB9XG59XG5cbi8vIE5vdGU6IHRoaXMgaXMgYSB3ZWlyZCB3YXkgdG8gZGVmaW5lIHRoZSBwcm9wZXJ0aWVzLCBidXQgd2UgZG8gaXQgc28gdGhhdCB3ZSBjYW5cbi8vIGdldCBzdHJvbmcgdHlwaW5nIHdoZW4gdGhlIGNvbnRleHQgaXMgcGFzc2VkIHRocm91Z2ggYE9iamVjdC52YWx1ZXNgLlxuLyoqIENvbnRleHQgdmFyaWFibGVzIHRoYXQgY2FuIGJlIHVzZWQgaW5zaWRlIGEgYEZvckxvb3BCbG9ja2AuICovXG5leHBvcnQgdHlwZSBGb3JMb29wQmxvY2tDb250ZXh0ID1cbiAgICBSZWNvcmQ8JyRpbmRleCd8JyRmaXJzdCd8JyRsYXN0J3wnJGV2ZW4nfCckb2RkJ3wnJGNvdW50JywgVmFyaWFibGU+O1xuXG5leHBvcnQgY2xhc3MgRm9yTG9vcEJsb2NrIGV4dGVuZHMgQmxvY2tOb2RlIGltcGxlbWVudHMgTm9kZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIGl0ZW06IFZhcmlhYmxlLCBwdWJsaWMgZXhwcmVzc2lvbjogQVNUV2l0aFNvdXJjZSwgcHVibGljIHRyYWNrQnk6IEFTVFdpdGhTb3VyY2UsXG4gICAgICBwdWJsaWMgdHJhY2tLZXl3b3JkU3BhbjogUGFyc2VTb3VyY2VTcGFuLCBwdWJsaWMgY29udGV4dFZhcmlhYmxlczogRm9yTG9vcEJsb2NrQ29udGV4dCxcbiAgICAgIHB1YmxpYyBjaGlsZHJlbjogTm9kZVtdLCBwdWJsaWMgZW1wdHk6IEZvckxvb3BCbG9ja0VtcHR5fG51bGwsIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICAgIHB1YmxpYyBtYWluQmxvY2tTcGFuOiBQYXJzZVNvdXJjZVNwYW4sIHN0YXJ0U291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgICAgZW5kU291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFufG51bGwsIG5hbWVTcGFuOiBQYXJzZVNvdXJjZVNwYW4sIHB1YmxpYyBpMThuPzogSTE4bk1ldGEpIHtcbiAgICBzdXBlcihuYW1lU3Bhbiwgc291cmNlU3Bhbiwgc3RhcnRTb3VyY2VTcGFuLCBlbmRTb3VyY2VTcGFuKTtcbiAgfVxuXG4gIHZpc2l0PFJlc3VsdD4odmlzaXRvcjogVmlzaXRvcjxSZXN1bHQ+KTogUmVzdWx0IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdEZvckxvb3BCbG9jayh0aGlzKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRm9yTG9vcEJsb2NrRW1wdHkgZXh0ZW5kcyBCbG9ja05vZGUgaW1wbGVtZW50cyBOb2RlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgY2hpbGRyZW46IE5vZGVbXSwgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLCBzdGFydFNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICAgIGVuZFNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbnxudWxsLCBuYW1lU3BhbjogUGFyc2VTb3VyY2VTcGFuLCBwdWJsaWMgaTE4bj86IEkxOG5NZXRhKSB7XG4gICAgc3VwZXIobmFtZVNwYW4sIHNvdXJjZVNwYW4sIHN0YXJ0U291cmNlU3BhbiwgZW5kU291cmNlU3Bhbik7XG4gIH1cblxuICB2aXNpdDxSZXN1bHQ+KHZpc2l0b3I6IFZpc2l0b3I8UmVzdWx0Pik6IFJlc3VsdCB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRGb3JMb29wQmxvY2tFbXB0eSh0aGlzKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgSWZCbG9jayBleHRlbmRzIEJsb2NrTm9kZSBpbXBsZW1lbnRzIE5vZGUge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyBicmFuY2hlczogSWZCbG9ja0JyYW5jaFtdLCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgICBzdGFydFNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbiwgZW5kU291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFufG51bGwsXG4gICAgICBuYW1lU3BhbjogUGFyc2VTb3VyY2VTcGFuKSB7XG4gICAgc3VwZXIobmFtZVNwYW4sIHNvdXJjZVNwYW4sIHN0YXJ0U291cmNlU3BhbiwgZW5kU291cmNlU3Bhbik7XG4gIH1cblxuICB2aXNpdDxSZXN1bHQ+KHZpc2l0b3I6IFZpc2l0b3I8UmVzdWx0Pik6IFJlc3VsdCB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRJZkJsb2NrKHRoaXMpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBJZkJsb2NrQnJhbmNoIGV4dGVuZHMgQmxvY2tOb2RlIGltcGxlbWVudHMgTm9kZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIGV4cHJlc3Npb246IEFTVHxudWxsLCBwdWJsaWMgY2hpbGRyZW46IE5vZGVbXSwgcHVibGljIGV4cHJlc3Npb25BbGlhczogVmFyaWFibGV8bnVsbCxcbiAgICAgIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3Bhbiwgc3RhcnRTb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgICBlbmRTb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW58bnVsbCwgbmFtZVNwYW46IFBhcnNlU291cmNlU3BhbiwgcHVibGljIGkxOG4/OiBJMThuTWV0YSkge1xuICAgIHN1cGVyKG5hbWVTcGFuLCBzb3VyY2VTcGFuLCBzdGFydFNvdXJjZVNwYW4sIGVuZFNvdXJjZVNwYW4pO1xuICB9XG5cbiAgdmlzaXQ8UmVzdWx0Pih2aXNpdG9yOiBWaXNpdG9yPFJlc3VsdD4pOiBSZXN1bHQge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0SWZCbG9ja0JyYW5jaCh0aGlzKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgVW5rbm93bkJsb2NrIGltcGxlbWVudHMgTm9kZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIG5hbWU6IHN0cmluZywgcHVibGljIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbiwgcHVibGljIG5hbWVTcGFuOiBQYXJzZVNvdXJjZVNwYW4pIHt9XG5cbiAgdmlzaXQ8UmVzdWx0Pih2aXNpdG9yOiBWaXNpdG9yPFJlc3VsdD4pOiBSZXN1bHQge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0VW5rbm93bkJsb2NrKHRoaXMpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBUZW1wbGF0ZSBpbXBsZW1lbnRzIE5vZGUge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIC8vIHRhZ05hbWUgaXMgdGhlIG5hbWUgb2YgdGhlIGNvbnRhaW5lciBlbGVtZW50LCBpZiBhcHBsaWNhYmxlLlxuICAgICAgLy8gYG51bGxgIGlzIGEgc3BlY2lhbCBjYXNlIGZvciB3aGVuIHRoZXJlIGlzIGEgc3RydWN0dXJhbCBkaXJlY3RpdmUgb24gYW4gYG5nLXRlbXBsYXRlYCBzb1xuICAgICAgLy8gdGhlIHJlbmRlcmVyIGNhbiBkaWZmZXJlbnRpYXRlIGJldHdlZW4gdGhlIHN5bnRoZXRpYyB0ZW1wbGF0ZSBhbmQgdGhlIG9uZSB3cml0dGVuIGluIHRoZVxuICAgICAgLy8gZmlsZS5cbiAgICAgIHB1YmxpYyB0YWdOYW1lOiBzdHJpbmd8bnVsbCxcbiAgICAgIHB1YmxpYyBhdHRyaWJ1dGVzOiBUZXh0QXR0cmlidXRlW10sXG4gICAgICBwdWJsaWMgaW5wdXRzOiBCb3VuZEF0dHJpYnV0ZVtdLFxuICAgICAgcHVibGljIG91dHB1dHM6IEJvdW5kRXZlbnRbXSxcbiAgICAgIHB1YmxpYyB0ZW1wbGF0ZUF0dHJzOiAoQm91bmRBdHRyaWJ1dGV8VGV4dEF0dHJpYnV0ZSlbXSxcbiAgICAgIHB1YmxpYyBjaGlsZHJlbjogTm9kZVtdLFxuICAgICAgcHVibGljIHJlZmVyZW5jZXM6IFJlZmVyZW5jZVtdLFxuICAgICAgcHVibGljIHZhcmlhYmxlczogVmFyaWFibGVbXSxcbiAgICAgIHB1YmxpYyBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgICBwdWJsaWMgc3RhcnRTb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgICBwdWJsaWMgZW5kU291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFufG51bGwsXG4gICAgICBwdWJsaWMgaTE4bj86IEkxOG5NZXRhLFxuICApIHt9XG4gIHZpc2l0PFJlc3VsdD4odmlzaXRvcjogVmlzaXRvcjxSZXN1bHQ+KTogUmVzdWx0IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdFRlbXBsYXRlKHRoaXMpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBDb250ZW50IGltcGxlbWVudHMgTm9kZSB7XG4gIHJlYWRvbmx5IG5hbWUgPSAnbmctY29udGVudCc7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgc2VsZWN0b3I6IHN0cmluZywgcHVibGljIGF0dHJpYnV0ZXM6IFRleHRBdHRyaWJ1dGVbXSxcbiAgICAgIHB1YmxpYyBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sIHB1YmxpYyBpMThuPzogSTE4bk1ldGEpIHt9XG4gIHZpc2l0PFJlc3VsdD4odmlzaXRvcjogVmlzaXRvcjxSZXN1bHQ+KTogUmVzdWx0IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdENvbnRlbnQodGhpcyk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFZhcmlhYmxlIGltcGxlbWVudHMgTm9kZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIG5hbWU6IHN0cmluZywgcHVibGljIHZhbHVlOiBzdHJpbmcsIHB1YmxpYyBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgICByZWFkb25seSBrZXlTcGFuOiBQYXJzZVNvdXJjZVNwYW4sIHB1YmxpYyB2YWx1ZVNwYW4/OiBQYXJzZVNvdXJjZVNwYW4pIHt9XG4gIHZpc2l0PFJlc3VsdD4odmlzaXRvcjogVmlzaXRvcjxSZXN1bHQ+KTogUmVzdWx0IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdFZhcmlhYmxlKHRoaXMpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBSZWZlcmVuY2UgaW1wbGVtZW50cyBOb2RlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgbmFtZTogc3RyaW5nLCBwdWJsaWMgdmFsdWU6IHN0cmluZywgcHVibGljIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICAgIHJlYWRvbmx5IGtleVNwYW46IFBhcnNlU291cmNlU3BhbiwgcHVibGljIHZhbHVlU3Bhbj86IFBhcnNlU291cmNlU3Bhbikge31cbiAgdmlzaXQ8UmVzdWx0Pih2aXNpdG9yOiBWaXNpdG9yPFJlc3VsdD4pOiBSZXN1bHQge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0UmVmZXJlbmNlKHRoaXMpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBJY3UgaW1wbGVtZW50cyBOb2RlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgdmFyczoge1tuYW1lOiBzdHJpbmddOiBCb3VuZFRleHR9LFxuICAgICAgcHVibGljIHBsYWNlaG9sZGVyczoge1tuYW1lOiBzdHJpbmddOiBUZXh0fEJvdW5kVGV4dH0sIHB1YmxpYyBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgICBwdWJsaWMgaTE4bj86IEkxOG5NZXRhKSB7fVxuICB2aXNpdDxSZXN1bHQ+KHZpc2l0b3I6IFZpc2l0b3I8UmVzdWx0Pik6IFJlc3VsdCB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRJY3UodGhpcyk7XG4gIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBWaXNpdG9yPFJlc3VsdCA9IGFueT4ge1xuICAvLyBSZXR1cm5pbmcgYSB0cnV0aHkgdmFsdWUgZnJvbSBgdmlzaXQoKWAgd2lsbCBwcmV2ZW50IGB2aXNpdEFsbCgpYCBmcm9tIHRoZSBjYWxsIHRvIHRoZSB0eXBlZFxuICAvLyBtZXRob2QgYW5kIHJlc3VsdCByZXR1cm5lZCB3aWxsIGJlY29tZSB0aGUgcmVzdWx0IGluY2x1ZGVkIGluIGB2aXNpdEFsbCgpYHMgcmVzdWx0IGFycmF5LlxuICB2aXNpdD8obm9kZTogTm9kZSk6IFJlc3VsdDtcblxuICB2aXNpdEVsZW1lbnQoZWxlbWVudDogRWxlbWVudCk6IFJlc3VsdDtcbiAgdmlzaXRUZW1wbGF0ZSh0ZW1wbGF0ZTogVGVtcGxhdGUpOiBSZXN1bHQ7XG4gIHZpc2l0Q29udGVudChjb250ZW50OiBDb250ZW50KTogUmVzdWx0O1xuICB2aXNpdFZhcmlhYmxlKHZhcmlhYmxlOiBWYXJpYWJsZSk6IFJlc3VsdDtcbiAgdmlzaXRSZWZlcmVuY2UocmVmZXJlbmNlOiBSZWZlcmVuY2UpOiBSZXN1bHQ7XG4gIHZpc2l0VGV4dEF0dHJpYnV0ZShhdHRyaWJ1dGU6IFRleHRBdHRyaWJ1dGUpOiBSZXN1bHQ7XG4gIHZpc2l0Qm91bmRBdHRyaWJ1dGUoYXR0cmlidXRlOiBCb3VuZEF0dHJpYnV0ZSk6IFJlc3VsdDtcbiAgdmlzaXRCb3VuZEV2ZW50KGF0dHJpYnV0ZTogQm91bmRFdmVudCk6IFJlc3VsdDtcbiAgdmlzaXRUZXh0KHRleHQ6IFRleHQpOiBSZXN1bHQ7XG4gIHZpc2l0Qm91bmRUZXh0KHRleHQ6IEJvdW5kVGV4dCk6IFJlc3VsdDtcbiAgdmlzaXRJY3UoaWN1OiBJY3UpOiBSZXN1bHQ7XG4gIHZpc2l0RGVmZXJyZWRCbG9jayhkZWZlcnJlZDogRGVmZXJyZWRCbG9jayk6IFJlc3VsdDtcbiAgdmlzaXREZWZlcnJlZEJsb2NrUGxhY2Vob2xkZXIoYmxvY2s6IERlZmVycmVkQmxvY2tQbGFjZWhvbGRlcik6IFJlc3VsdDtcbiAgdmlzaXREZWZlcnJlZEJsb2NrRXJyb3IoYmxvY2s6IERlZmVycmVkQmxvY2tFcnJvcik6IFJlc3VsdDtcbiAgdmlzaXREZWZlcnJlZEJsb2NrTG9hZGluZyhibG9jazogRGVmZXJyZWRCbG9ja0xvYWRpbmcpOiBSZXN1bHQ7XG4gIHZpc2l0RGVmZXJyZWRUcmlnZ2VyKHRyaWdnZXI6IERlZmVycmVkVHJpZ2dlcik6IFJlc3VsdDtcbiAgdmlzaXRTd2l0Y2hCbG9jayhibG9jazogU3dpdGNoQmxvY2spOiBSZXN1bHQ7XG4gIHZpc2l0U3dpdGNoQmxvY2tDYXNlKGJsb2NrOiBTd2l0Y2hCbG9ja0Nhc2UpOiBSZXN1bHQ7XG4gIHZpc2l0Rm9yTG9vcEJsb2NrKGJsb2NrOiBGb3JMb29wQmxvY2spOiBSZXN1bHQ7XG4gIHZpc2l0Rm9yTG9vcEJsb2NrRW1wdHkoYmxvY2s6IEZvckxvb3BCbG9ja0VtcHR5KTogUmVzdWx0O1xuICB2aXNpdElmQmxvY2soYmxvY2s6IElmQmxvY2spOiBSZXN1bHQ7XG4gIHZpc2l0SWZCbG9ja0JyYW5jaChibG9jazogSWZCbG9ja0JyYW5jaCk6IFJlc3VsdDtcbiAgdmlzaXRVbmtub3duQmxvY2soYmxvY2s6IFVua25vd25CbG9jayk6IFJlc3VsdDtcbn1cblxuZXhwb3J0IGNsYXNzIFJlY3Vyc2l2ZVZpc2l0b3IgaW1wbGVtZW50cyBWaXNpdG9yPHZvaWQ+IHtcbiAgdmlzaXRFbGVtZW50KGVsZW1lbnQ6IEVsZW1lbnQpOiB2b2lkIHtcbiAgICB2aXNpdEFsbCh0aGlzLCBlbGVtZW50LmF0dHJpYnV0ZXMpO1xuICAgIHZpc2l0QWxsKHRoaXMsIGVsZW1lbnQuaW5wdXRzKTtcbiAgICB2aXNpdEFsbCh0aGlzLCBlbGVtZW50Lm91dHB1dHMpO1xuICAgIHZpc2l0QWxsKHRoaXMsIGVsZW1lbnQuY2hpbGRyZW4pO1xuICAgIHZpc2l0QWxsKHRoaXMsIGVsZW1lbnQucmVmZXJlbmNlcyk7XG4gIH1cbiAgdmlzaXRUZW1wbGF0ZSh0ZW1wbGF0ZTogVGVtcGxhdGUpOiB2b2lkIHtcbiAgICB2aXNpdEFsbCh0aGlzLCB0ZW1wbGF0ZS5hdHRyaWJ1dGVzKTtcbiAgICB2aXNpdEFsbCh0aGlzLCB0ZW1wbGF0ZS5pbnB1dHMpO1xuICAgIHZpc2l0QWxsKHRoaXMsIHRlbXBsYXRlLm91dHB1dHMpO1xuICAgIHZpc2l0QWxsKHRoaXMsIHRlbXBsYXRlLmNoaWxkcmVuKTtcbiAgICB2aXNpdEFsbCh0aGlzLCB0ZW1wbGF0ZS5yZWZlcmVuY2VzKTtcbiAgICB2aXNpdEFsbCh0aGlzLCB0ZW1wbGF0ZS52YXJpYWJsZXMpO1xuICB9XG4gIHZpc2l0RGVmZXJyZWRCbG9jayhkZWZlcnJlZDogRGVmZXJyZWRCbG9jayk6IHZvaWQge1xuICAgIGRlZmVycmVkLnZpc2l0QWxsKHRoaXMpO1xuICB9XG4gIHZpc2l0RGVmZXJyZWRCbG9ja1BsYWNlaG9sZGVyKGJsb2NrOiBEZWZlcnJlZEJsb2NrUGxhY2Vob2xkZXIpOiB2b2lkIHtcbiAgICB2aXNpdEFsbCh0aGlzLCBibG9jay5jaGlsZHJlbik7XG4gIH1cbiAgdmlzaXREZWZlcnJlZEJsb2NrRXJyb3IoYmxvY2s6IERlZmVycmVkQmxvY2tFcnJvcik6IHZvaWQge1xuICAgIHZpc2l0QWxsKHRoaXMsIGJsb2NrLmNoaWxkcmVuKTtcbiAgfVxuICB2aXNpdERlZmVycmVkQmxvY2tMb2FkaW5nKGJsb2NrOiBEZWZlcnJlZEJsb2NrTG9hZGluZyk6IHZvaWQge1xuICAgIHZpc2l0QWxsKHRoaXMsIGJsb2NrLmNoaWxkcmVuKTtcbiAgfVxuICB2aXNpdFN3aXRjaEJsb2NrKGJsb2NrOiBTd2l0Y2hCbG9jayk6IHZvaWQge1xuICAgIHZpc2l0QWxsKHRoaXMsIGJsb2NrLmNhc2VzKTtcbiAgfVxuICB2aXNpdFN3aXRjaEJsb2NrQ2FzZShibG9jazogU3dpdGNoQmxvY2tDYXNlKTogdm9pZCB7XG4gICAgdmlzaXRBbGwodGhpcywgYmxvY2suY2hpbGRyZW4pO1xuICB9XG4gIHZpc2l0Rm9yTG9vcEJsb2NrKGJsb2NrOiBGb3JMb29wQmxvY2spOiB2b2lkIHtcbiAgICBjb25zdCBibG9ja0l0ZW1zID0gW2Jsb2NrLml0ZW0sIC4uLk9iamVjdC52YWx1ZXMoYmxvY2suY29udGV4dFZhcmlhYmxlcyksIC4uLmJsb2NrLmNoaWxkcmVuXTtcbiAgICBibG9jay5lbXB0eSAmJiBibG9ja0l0ZW1zLnB1c2goYmxvY2suZW1wdHkpO1xuICAgIHZpc2l0QWxsKHRoaXMsIGJsb2NrSXRlbXMpO1xuICB9XG4gIHZpc2l0Rm9yTG9vcEJsb2NrRW1wdHkoYmxvY2s6IEZvckxvb3BCbG9ja0VtcHR5KTogdm9pZCB7XG4gICAgdmlzaXRBbGwodGhpcywgYmxvY2suY2hpbGRyZW4pO1xuICB9XG4gIHZpc2l0SWZCbG9jayhibG9jazogSWZCbG9jayk6IHZvaWQge1xuICAgIHZpc2l0QWxsKHRoaXMsIGJsb2NrLmJyYW5jaGVzKTtcbiAgfVxuICB2aXNpdElmQmxvY2tCcmFuY2goYmxvY2s6IElmQmxvY2tCcmFuY2gpOiB2b2lkIHtcbiAgICBjb25zdCBibG9ja0l0ZW1zID0gYmxvY2suY2hpbGRyZW47XG4gICAgYmxvY2suZXhwcmVzc2lvbkFsaWFzICYmIGJsb2NrSXRlbXMucHVzaChibG9jay5leHByZXNzaW9uQWxpYXMpO1xuICAgIHZpc2l0QWxsKHRoaXMsIGJsb2NrSXRlbXMpO1xuICB9XG4gIHZpc2l0Q29udGVudChjb250ZW50OiBDb250ZW50KTogdm9pZCB7fVxuICB2aXNpdFZhcmlhYmxlKHZhcmlhYmxlOiBWYXJpYWJsZSk6IHZvaWQge31cbiAgdmlzaXRSZWZlcmVuY2UocmVmZXJlbmNlOiBSZWZlcmVuY2UpOiB2b2lkIHt9XG4gIHZpc2l0VGV4dEF0dHJpYnV0ZShhdHRyaWJ1dGU6IFRleHRBdHRyaWJ1dGUpOiB2b2lkIHt9XG4gIHZpc2l0Qm91bmRBdHRyaWJ1dGUoYXR0cmlidXRlOiBCb3VuZEF0dHJpYnV0ZSk6IHZvaWQge31cbiAgdmlzaXRCb3VuZEV2ZW50KGF0dHJpYnV0ZTogQm91bmRFdmVudCk6IHZvaWQge31cbiAgdmlzaXRUZXh0KHRleHQ6IFRleHQpOiB2b2lkIHt9XG4gIHZpc2l0Qm91bmRUZXh0KHRleHQ6IEJvdW5kVGV4dCk6IHZvaWQge31cbiAgdmlzaXRJY3UoaWN1OiBJY3UpOiB2b2lkIHt9XG4gIHZpc2l0RGVmZXJyZWRUcmlnZ2VyKHRyaWdnZXI6IERlZmVycmVkVHJpZ2dlcik6IHZvaWQge31cbiAgdmlzaXRVbmtub3duQmxvY2soYmxvY2s6IFVua25vd25CbG9jayk6IHZvaWQge31cbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gdmlzaXRBbGw8UmVzdWx0Pih2aXNpdG9yOiBWaXNpdG9yPFJlc3VsdD4sIG5vZGVzOiBOb2RlW10pOiBSZXN1bHRbXSB7XG4gIGNvbnN0IHJlc3VsdDogUmVzdWx0W10gPSBbXTtcbiAgaWYgKHZpc2l0b3IudmlzaXQpIHtcbiAgICBmb3IgKGNvbnN0IG5vZGUgb2Ygbm9kZXMpIHtcbiAgICAgIHZpc2l0b3IudmlzaXQobm9kZSkgfHwgbm9kZS52aXNpdCh2aXNpdG9yKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgZm9yIChjb25zdCBub2RlIG9mIG5vZGVzKSB7XG4gICAgICBjb25zdCBuZXdOb2RlID0gbm9kZS52aXNpdCh2aXNpdG9yKTtcbiAgICAgIGlmIChuZXdOb2RlKSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKG5ld05vZGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuIl19