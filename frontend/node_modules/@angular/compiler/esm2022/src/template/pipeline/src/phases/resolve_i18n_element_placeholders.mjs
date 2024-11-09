/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ir from '../../ir';
/**
 * Resolve the element placeholders in i18n messages.
 */
export function resolveI18nElementPlaceholders(job) {
    // Record all of the element and i18n context ops for use later.
    const i18nContexts = new Map();
    const elements = new Map();
    for (const unit of job.units) {
        for (const op of unit.create) {
            switch (op.kind) {
                case ir.OpKind.I18nContext:
                    i18nContexts.set(op.xref, op);
                    break;
                case ir.OpKind.ElementStart:
                    elements.set(op.xref, op);
                    break;
            }
        }
    }
    resolvePlaceholdersForView(job, job.root, i18nContexts, elements);
}
/**
 * Recursively resolves element and template tag placeholders in the given view.
 */
function resolvePlaceholdersForView(job, unit, i18nContexts, elements, pendingStructuralDirective) {
    // Track the current i18n op and corresponding i18n context op as we step through the creation
    // IR.
    let currentOps = null;
    let pendingStructuralDirectiveCloses = new Map();
    for (const op of unit.create) {
        switch (op.kind) {
            case ir.OpKind.I18nStart:
                if (!op.context) {
                    throw Error('Could not find i18n context for i18n op');
                }
                currentOps = { i18nBlock: op, i18nContext: i18nContexts.get(op.context) };
                break;
            case ir.OpKind.I18nEnd:
                currentOps = null;
                break;
            case ir.OpKind.ElementStart:
                // For elements with i18n placeholders, record its slot value in the params map under the
                // corresponding tag start placeholder.
                if (op.i18nPlaceholder !== undefined) {
                    if (currentOps === null) {
                        throw Error('i18n tag placeholder should only occur inside an i18n block');
                    }
                    recordElementStart(op, currentOps.i18nContext, currentOps.i18nBlock, pendingStructuralDirective);
                    // If there is a separate close tag placeholder for this element, save the pending
                    // structural directive so we can pass it to the closing tag as well.
                    if (pendingStructuralDirective && op.i18nPlaceholder.closeName) {
                        pendingStructuralDirectiveCloses.set(op.xref, pendingStructuralDirective);
                    }
                    // Clear out the pending structural directive now that its been accounted for.
                    pendingStructuralDirective = undefined;
                }
                break;
            case ir.OpKind.ElementEnd:
                // For elements with i18n placeholders, record its slot value in the params map under the
                // corresponding tag close placeholder.
                const startOp = elements.get(op.xref);
                if (startOp && startOp.i18nPlaceholder !== undefined) {
                    if (currentOps === null) {
                        throw Error('AssertionError: i18n tag placeholder should only occur inside an i18n block');
                    }
                    recordElementClose(startOp, currentOps.i18nContext, currentOps.i18nBlock, pendingStructuralDirectiveCloses.get(op.xref));
                    // Clear out the pending structural directive close that was accounted for.
                    pendingStructuralDirectiveCloses.delete(op.xref);
                }
                break;
            case ir.OpKind.Projection:
                // For content projections with i18n placeholders, record its slot value in the params map
                // under the corresponding tag start and close placeholders.
                if (op.i18nPlaceholder !== undefined) {
                    if (currentOps === null) {
                        throw Error('i18n tag placeholder should only occur inside an i18n block');
                    }
                    recordElementStart(op, currentOps.i18nContext, currentOps.i18nBlock, pendingStructuralDirective);
                    recordElementClose(op, currentOps.i18nContext, currentOps.i18nBlock, pendingStructuralDirective);
                    // Clear out the pending structural directive now that its been accounted for.
                    pendingStructuralDirective = undefined;
                }
                break;
            case ir.OpKind.Template:
                const view = job.views.get(op.xref);
                if (op.i18nPlaceholder === undefined) {
                    // If there is no i18n placeholder, just recurse into the view in case it contains i18n
                    // blocks.
                    resolvePlaceholdersForView(job, view, i18nContexts, elements);
                }
                else {
                    if (currentOps === null) {
                        throw Error('i18n tag placeholder should only occur inside an i18n block');
                    }
                    if (op.templateKind === ir.TemplateKind.Structural) {
                        // If this is a structural directive template, don't record anything yet. Instead pass
                        // the current template as a pending structural directive to be recorded when we find
                        // the element, content, or template it belongs to. This allows us to create combined
                        // values that represent, e.g. the start of a template and element at the same time.
                        resolvePlaceholdersForView(job, view, i18nContexts, elements, op);
                    }
                    else {
                        // If this is some other kind of template, we can record its start, recurse into its
                        // view, and then record its end.
                        recordTemplateStart(job, view, op.handle.slot, op.i18nPlaceholder, currentOps.i18nContext, currentOps.i18nBlock, pendingStructuralDirective);
                        resolvePlaceholdersForView(job, view, i18nContexts, elements);
                        recordTemplateClose(job, view, op.handle.slot, op.i18nPlaceholder, currentOps.i18nContext, currentOps.i18nBlock, pendingStructuralDirective);
                        pendingStructuralDirective = undefined;
                    }
                }
                break;
            case ir.OpKind.RepeaterCreate:
                if (pendingStructuralDirective !== undefined) {
                    throw Error('AssertionError: Unexpected structural directive associated with @for block');
                }
                // RepeaterCreate has 3 slots: the first is for the op itself, the second is for the @for
                // template and the (optional) third is for the @empty template.
                const forSlot = op.handle.slot + 1;
                const forView = job.views.get(op.xref);
                // First record all of the placeholders for the @for template.
                if (op.i18nPlaceholder === undefined) {
                    // If there is no i18n placeholder, just recurse into the view in case it contains i18n
                    // blocks.
                    resolvePlaceholdersForView(job, forView, i18nContexts, elements);
                }
                else {
                    if (currentOps === null) {
                        throw Error('i18n tag placeholder should only occur inside an i18n block');
                    }
                    recordTemplateStart(job, forView, forSlot, op.i18nPlaceholder, currentOps.i18nContext, currentOps.i18nBlock, pendingStructuralDirective);
                    resolvePlaceholdersForView(job, forView, i18nContexts, elements);
                    recordTemplateClose(job, forView, forSlot, op.i18nPlaceholder, currentOps.i18nContext, currentOps.i18nBlock, pendingStructuralDirective);
                    pendingStructuralDirective = undefined;
                }
                // Then if there's an @empty template, add its placeholders as well.
                if (op.emptyView !== null) {
                    // RepeaterCreate has 3 slots: the first is for the op itself, the second is for the @for
                    // template and the (optional) third is for the @empty template.
                    const emptySlot = op.handle.slot + 2;
                    const emptyView = job.views.get(op.emptyView);
                    if (op.emptyI18nPlaceholder === undefined) {
                        // If there is no i18n placeholder, just recurse into the view in case it contains i18n
                        // blocks.
                        resolvePlaceholdersForView(job, emptyView, i18nContexts, elements);
                    }
                    else {
                        if (currentOps === null) {
                            throw Error('i18n tag placeholder should only occur inside an i18n block');
                        }
                        recordTemplateStart(job, emptyView, emptySlot, op.emptyI18nPlaceholder, currentOps.i18nContext, currentOps.i18nBlock, pendingStructuralDirective);
                        resolvePlaceholdersForView(job, emptyView, i18nContexts, elements);
                        recordTemplateClose(job, emptyView, emptySlot, op.emptyI18nPlaceholder, currentOps.i18nContext, currentOps.i18nBlock, pendingStructuralDirective);
                        pendingStructuralDirective = undefined;
                    }
                }
                break;
        }
    }
}
/**
 * Records an i18n param value for the start of an element.
 */
function recordElementStart(op, i18nContext, i18nBlock, structuralDirective) {
    const { startName, closeName } = op.i18nPlaceholder;
    let flags = ir.I18nParamValueFlags.ElementTag | ir.I18nParamValueFlags.OpenTag;
    let value = op.handle.slot;
    // If the element is associated with a structural directive, start it as well.
    if (structuralDirective !== undefined) {
        flags |= ir.I18nParamValueFlags.TemplateTag;
        value = { element: value, template: structuralDirective.handle.slot };
    }
    // For self-closing tags, there is no close tag placeholder. Instead, the start tag
    // placeholder accounts for the start and close of the element.
    if (!closeName) {
        flags |= ir.I18nParamValueFlags.CloseTag;
    }
    addParam(i18nContext.params, startName, value, i18nBlock.subTemplateIndex, flags);
}
/**
 * Records an i18n param value for the closing of an element.
 */
function recordElementClose(op, i18nContext, i18nBlock, structuralDirective) {
    const { closeName } = op.i18nPlaceholder;
    // Self-closing tags don't have a closing tag placeholder, instead the element closing is
    // recorded via an additional flag on the element start value.
    if (closeName) {
        let flags = ir.I18nParamValueFlags.ElementTag | ir.I18nParamValueFlags.CloseTag;
        let value = op.handle.slot;
        // If the element is associated with a structural directive, close it as well.
        if (structuralDirective !== undefined) {
            flags |= ir.I18nParamValueFlags.TemplateTag;
            value = { element: value, template: structuralDirective.handle.slot };
        }
        addParam(i18nContext.params, closeName, value, i18nBlock.subTemplateIndex, flags);
    }
}
/**
 * Records an i18n param value for the start of a template.
 */
function recordTemplateStart(job, view, slot, i18nPlaceholder, i18nContext, i18nBlock, structuralDirective) {
    let { startName, closeName } = i18nPlaceholder;
    let flags = ir.I18nParamValueFlags.TemplateTag | ir.I18nParamValueFlags.OpenTag;
    // For self-closing tags, there is no close tag placeholder. Instead, the start tag
    // placeholder accounts for the start and close of the element.
    if (!closeName) {
        flags |= ir.I18nParamValueFlags.CloseTag;
    }
    // If the template is associated with a structural directive, record the structural directive's
    // start first. Since this template must be in the structural directive's view, we can just
    // directly use the current i18n block's sub-template index.
    if (structuralDirective !== undefined) {
        addParam(i18nContext.params, startName, structuralDirective.handle.slot, i18nBlock.subTemplateIndex, flags);
    }
    // Record the start of the template. For the sub-template index, pass the index for the template's
    // view, rather than the current i18n block's index.
    addParam(i18nContext.params, startName, slot, getSubTemplateIndexForTemplateTag(job, i18nBlock, view), flags);
}
/**
 * Records an i18n param value for the closing of a template.
 */
function recordTemplateClose(job, view, slot, i18nPlaceholder, i18nContext, i18nBlock, structuralDirective) {
    const { closeName } = i18nPlaceholder;
    const flags = ir.I18nParamValueFlags.TemplateTag | ir.I18nParamValueFlags.CloseTag;
    // Self-closing tags don't have a closing tag placeholder, instead the template's closing is
    // recorded via an additional flag on the template start value.
    if (closeName) {
        // Record the closing of the template. For the sub-template index, pass the index for the
        // template's view, rather than the current i18n block's index.
        addParam(i18nContext.params, closeName, slot, getSubTemplateIndexForTemplateTag(job, i18nBlock, view), flags);
        // If the template is associated with a structural directive, record the structural directive's
        // closing after. Since this template must be in the structural directive's view, we can just
        // directly use the current i18n block's sub-template index.
        if (structuralDirective !== undefined) {
            addParam(i18nContext.params, closeName, structuralDirective.handle.slot, i18nBlock.subTemplateIndex, flags);
        }
    }
}
/**
 * Get the subTemplateIndex for the given template op. For template ops, use the subTemplateIndex of
 * the child i18n block inside the template.
 */
function getSubTemplateIndexForTemplateTag(job, i18nOp, view) {
    for (const childOp of view.create) {
        if (childOp.kind === ir.OpKind.I18nStart) {
            return childOp.subTemplateIndex;
        }
    }
    return i18nOp.subTemplateIndex;
}
/**
 * Add a param value to the given params map.
 */
function addParam(params, placeholder, value, subTemplateIndex, flags) {
    const values = params.get(placeholder) ?? [];
    values.push({ value, subTemplateIndex, flags });
    params.set(placeholder, values);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb2x2ZV9pMThuX2VsZW1lbnRfcGxhY2Vob2xkZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3RlbXBsYXRlL3BpcGVsaW5lL3NyYy9waGFzZXMvcmVzb2x2ZV9pMThuX2VsZW1lbnRfcGxhY2Vob2xkZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUdILE9BQU8sS0FBSyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRy9COztHQUVHO0FBQ0gsTUFBTSxVQUFVLDhCQUE4QixDQUFDLEdBQTRCO0lBQ3pFLGdFQUFnRTtJQUNoRSxNQUFNLFlBQVksR0FBRyxJQUFJLEdBQUcsRUFBK0IsQ0FBQztJQUM1RCxNQUFNLFFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBZ0MsQ0FBQztJQUN6RCxLQUFLLE1BQU0sSUFBSSxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM3QixLQUFLLE1BQU0sRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUM3QixRQUFRLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDaEIsS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLFdBQVc7b0JBQ3hCLFlBQVksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztvQkFDOUIsTUFBTTtnQkFDUixLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsWUFBWTtvQkFDekIsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO29CQUMxQixNQUFNO1lBQ1YsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0lBRUQsMEJBQTBCLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQ3BFLENBQUM7QUFFRDs7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ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBpMThuIGZyb20gJy4uLy4uLy4uLy4uL2kxOG4vaTE4bl9hc3QnO1xuaW1wb3J0ICogYXMgaXIgZnJvbSAnLi4vLi4vaXInO1xuaW1wb3J0IHtDb21wb25lbnRDb21waWxhdGlvbkpvYiwgVmlld0NvbXBpbGF0aW9uVW5pdH0gZnJvbSAnLi4vY29tcGlsYXRpb24nO1xuXG4vKipcbiAqIFJlc29sdmUgdGhlIGVsZW1lbnQgcGxhY2Vob2xkZXJzIGluIGkxOG4gbWVzc2FnZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlSTE4bkVsZW1lbnRQbGFjZWhvbGRlcnMoam9iOiBDb21wb25lbnRDb21waWxhdGlvbkpvYikge1xuICAvLyBSZWNvcmQgYWxsIG9mIHRoZSBlbGVtZW50IGFuZCBpMThuIGNvbnRleHQgb3BzIGZvciB1c2UgbGF0ZXIuXG4gIGNvbnN0IGkxOG5Db250ZXh0cyA9IG5ldyBNYXA8aXIuWHJlZklkLCBpci5JMThuQ29udGV4dE9wPigpO1xuICBjb25zdCBlbGVtZW50cyA9IG5ldyBNYXA8aXIuWHJlZklkLCBpci5FbGVtZW50U3RhcnRPcD4oKTtcbiAgZm9yIChjb25zdCB1bml0IG9mIGpvYi51bml0cykge1xuICAgIGZvciAoY29uc3Qgb3Agb2YgdW5pdC5jcmVhdGUpIHtcbiAgICAgIHN3aXRjaCAob3Aua2luZCkge1xuICAgICAgICBjYXNlIGlyLk9wS2luZC5JMThuQ29udGV4dDpcbiAgICAgICAgICBpMThuQ29udGV4dHMuc2V0KG9wLnhyZWYsIG9wKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBpci5PcEtpbmQuRWxlbWVudFN0YXJ0OlxuICAgICAgICAgIGVsZW1lbnRzLnNldChvcC54cmVmLCBvcCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmVzb2x2ZVBsYWNlaG9sZGVyc0ZvclZpZXcoam9iLCBqb2Iucm9vdCwgaTE4bkNvbnRleHRzLCBlbGVtZW50cyk7XG59XG5cbi8qKlxuICogUmVjdXJzaXZlbHkgcmVzb2x2ZXMgZWxlbWVudCBhbmQgdGVtcGxhdGUgdGFnIHBsYWNlaG9sZGVycyBpbiB0aGUgZ2l2ZW4gdmlldy5cbiAqL1xuZnVuY3Rpb24gcmVzb2x2ZVBsYWNlaG9sZGVyc0ZvclZpZXcoXG4gICAgam9iOiBDb21wb25lbnRDb21waWxhdGlvbkpvYiwgdW5pdDogVmlld0NvbXBpbGF0aW9uVW5pdCxcbiAgICBpMThuQ29udGV4dHM6IE1hcDxpci5YcmVmSWQsIGlyLkkxOG5Db250ZXh0T3A+LCBlbGVtZW50czogTWFwPGlyLlhyZWZJZCwgaXIuRWxlbWVudFN0YXJ0T3A+LFxuICAgIHBlbmRpbmdTdHJ1Y3R1cmFsRGlyZWN0aXZlPzogaXIuVGVtcGxhdGVPcCkge1xuICAvLyBUcmFjayB0aGUgY3VycmVudCBpMThuIG9wIGFuZCBjb3JyZXNwb25kaW5nIGkxOG4gY29udGV4dCBvcCBhcyB3ZSBzdGVwIHRocm91Z2ggdGhlIGNyZWF0aW9uXG4gIC8vIElSLlxuICBsZXQgY3VycmVudE9wczoge2kxOG5CbG9jazogaXIuSTE4blN0YXJ0T3AsIGkxOG5Db250ZXh0OiBpci5JMThuQ29udGV4dE9wfXxudWxsID0gbnVsbDtcbiAgbGV0IHBlbmRpbmdTdHJ1Y3R1cmFsRGlyZWN0aXZlQ2xvc2VzID0gbmV3IE1hcDxpci5YcmVmSWQsIGlyLlRlbXBsYXRlT3A+KCk7XG4gIGZvciAoY29uc3Qgb3Agb2YgdW5pdC5jcmVhdGUpIHtcbiAgICBzd2l0Y2ggKG9wLmtpbmQpIHtcbiAgICAgIGNhc2UgaXIuT3BLaW5kLkkxOG5TdGFydDpcbiAgICAgICAgaWYgKCFvcC5jb250ZXh0KSB7XG4gICAgICAgICAgdGhyb3cgRXJyb3IoJ0NvdWxkIG5vdCBmaW5kIGkxOG4gY29udGV4dCBmb3IgaTE4biBvcCcpO1xuICAgICAgICB9XG4gICAgICAgIGN1cnJlbnRPcHMgPSB7aTE4bkJsb2NrOiBvcCwgaTE4bkNvbnRleHQ6IGkxOG5Db250ZXh0cy5nZXQob3AuY29udGV4dCkhfTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIGlyLk9wS2luZC5JMThuRW5kOlxuICAgICAgICBjdXJyZW50T3BzID0gbnVsbDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIGlyLk9wS2luZC5FbGVtZW50U3RhcnQ6XG4gICAgICAgIC8vIEZvciBlbGVtZW50cyB3aXRoIGkxOG4gcGxhY2Vob2xkZXJzLCByZWNvcmQgaXRzIHNsb3QgdmFsdWUgaW4gdGhlIHBhcmFtcyBtYXAgdW5kZXIgdGhlXG4gICAgICAgIC8vIGNvcnJlc3BvbmRpbmcgdGFnIHN0YXJ0IHBsYWNlaG9sZGVyLlxuICAgICAgICBpZiAob3AuaTE4blBsYWNlaG9sZGVyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBpZiAoY3VycmVudE9wcyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdGhyb3cgRXJyb3IoJ2kxOG4gdGFnIHBsYWNlaG9sZGVyIHNob3VsZCBvbmx5IG9jY3VyIGluc2lkZSBhbiBpMThuIGJsb2NrJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJlY29yZEVsZW1lbnRTdGFydChcbiAgICAgICAgICAgICAgb3AsIGN1cnJlbnRPcHMuaTE4bkNvbnRleHQsIGN1cnJlbnRPcHMuaTE4bkJsb2NrLCBwZW5kaW5nU3RydWN0dXJhbERpcmVjdGl2ZSk7XG4gICAgICAgICAgLy8gSWYgdGhlcmUgaXMgYSBzZXBhcmF0ZSBjbG9zZSB0YWcgcGxhY2Vob2xkZXIgZm9yIHRoaXMgZWxlbWVudCwgc2F2ZSB0aGUgcGVuZGluZ1xuICAgICAgICAgIC8vIHN0cnVjdHVyYWwgZGlyZWN0aXZlIHNvIHdlIGNhbiBwYXNzIGl0IHRvIHRoZSBjbG9zaW5nIHRhZyBhcyB3ZWxsLlxuICAgICAgICAgIGlmIChwZW5kaW5nU3RydWN0dXJhbERpcmVjdGl2ZSAmJiBvcC5pMThuUGxhY2Vob2xkZXIuY2xvc2VOYW1lKSB7XG4gICAgICAgICAgICBwZW5kaW5nU3RydWN0dXJhbERpcmVjdGl2ZUNsb3Nlcy5zZXQob3AueHJlZiwgcGVuZGluZ1N0cnVjdHVyYWxEaXJlY3RpdmUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBDbGVhciBvdXQgdGhlIHBlbmRpbmcgc3RydWN0dXJhbCBkaXJlY3RpdmUgbm93IHRoYXQgaXRzIGJlZW4gYWNjb3VudGVkIGZvci5cbiAgICAgICAgICBwZW5kaW5nU3RydWN0dXJhbERpcmVjdGl2ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgaXIuT3BLaW5kLkVsZW1lbnRFbmQ6XG4gICAgICAgIC8vIEZvciBlbGVtZW50cyB3aXRoIGkxOG4gcGxhY2Vob2xkZXJzLCByZWNvcmQgaXRzIHNsb3QgdmFsdWUgaW4gdGhlIHBhcmFtcyBtYXAgdW5kZXIgdGhlXG4gICAgICAgIC8vIGNvcnJlc3BvbmRpbmcgdGFnIGNsb3NlIHBsYWNlaG9sZGVyLlxuICAgICAgICBjb25zdCBzdGFydE9wID0gZWxlbWVudHMuZ2V0KG9wLnhyZWYpO1xuICAgICAgICBpZiAoc3RhcnRPcCAmJiBzdGFydE9wLmkxOG5QbGFjZWhvbGRlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgaWYgKGN1cnJlbnRPcHMgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRocm93IEVycm9yKFxuICAgICAgICAgICAgICAgICdBc3NlcnRpb25FcnJvcjogaTE4biB0YWcgcGxhY2Vob2xkZXIgc2hvdWxkIG9ubHkgb2NjdXIgaW5zaWRlIGFuIGkxOG4gYmxvY2snKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmVjb3JkRWxlbWVudENsb3NlKFxuICAgICAgICAgICAgICBzdGFydE9wLCBjdXJyZW50T3BzLmkxOG5Db250ZXh0LCBjdXJyZW50T3BzLmkxOG5CbG9jayxcbiAgICAgICAgICAgICAgcGVuZGluZ1N0cnVjdHVyYWxEaXJlY3RpdmVDbG9zZXMuZ2V0KG9wLnhyZWYpKTtcbiAgICAgICAgICAvLyBDbGVhciBvdXQgdGhlIHBlbmRpbmcgc3RydWN0dXJhbCBkaXJlY3RpdmUgY2xvc2UgdGhhdCB3YXMgYWNjb3VudGVkIGZvci5cbiAgICAgICAgICBwZW5kaW5nU3RydWN0dXJhbERpcmVjdGl2ZUNsb3Nlcy5kZWxldGUob3AueHJlZik7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIGlyLk9wS2luZC5Qcm9qZWN0aW9uOlxuICAgICAgICAvLyBGb3IgY29udGVudCBwcm9qZWN0aW9ucyB3aXRoIGkxOG4gcGxhY2Vob2xkZXJzLCByZWNvcmQgaXRzIHNsb3QgdmFsdWUgaW4gdGhlIHBhcmFtcyBtYXBcbiAgICAgICAgLy8gdW5kZXIgdGhlIGNvcnJlc3BvbmRpbmcgdGFnIHN0YXJ0IGFuZCBjbG9zZSBwbGFjZWhvbGRlcnMuXG4gICAgICAgIGlmIChvcC5pMThuUGxhY2Vob2xkZXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGlmIChjdXJyZW50T3BzID09PSBudWxsKSB7XG4gICAgICAgICAgICB0aHJvdyBFcnJvcignaTE4biB0YWcgcGxhY2Vob2xkZXIgc2hvdWxkIG9ubHkgb2NjdXIgaW5zaWRlIGFuIGkxOG4gYmxvY2snKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmVjb3JkRWxlbWVudFN0YXJ0KFxuICAgICAgICAgICAgICBvcCwgY3VycmVudE9wcy5pMThuQ29udGV4dCwgY3VycmVudE9wcy5pMThuQmxvY2ssIHBlbmRpbmdTdHJ1Y3R1cmFsRGlyZWN0aXZlKTtcbiAgICAgICAgICByZWNvcmRFbGVtZW50Q2xvc2UoXG4gICAgICAgICAgICAgIG9wLCBjdXJyZW50T3BzLmkxOG5Db250ZXh0LCBjdXJyZW50T3BzLmkxOG5CbG9jaywgcGVuZGluZ1N0cnVjdHVyYWxEaXJlY3RpdmUpO1xuICAgICAgICAgIC8vIENsZWFyIG91dCB0aGUgcGVuZGluZyBzdHJ1Y3R1cmFsIGRpcmVjdGl2ZSBub3cgdGhhdCBpdHMgYmVlbiBhY2NvdW50ZWQgZm9yLlxuICAgICAgICAgIHBlbmRpbmdTdHJ1Y3R1cmFsRGlyZWN0aXZlID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBpci5PcEtpbmQuVGVtcGxhdGU6XG4gICAgICAgIGNvbnN0IHZpZXcgPSBqb2Iudmlld3MuZ2V0KG9wLnhyZWYpITtcbiAgICAgICAgaWYgKG9wLmkxOG5QbGFjZWhvbGRlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgLy8gSWYgdGhlcmUgaXMgbm8gaTE4biBwbGFjZWhvbGRlciwganVzdCByZWN1cnNlIGludG8gdGhlIHZpZXcgaW4gY2FzZSBpdCBjb250YWlucyBpMThuXG4gICAgICAgICAgLy8gYmxvY2tzLlxuICAgICAgICAgIHJlc29sdmVQbGFjZWhvbGRlcnNGb3JWaWV3KGpvYiwgdmlldywgaTE4bkNvbnRleHRzLCBlbGVtZW50cyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKGN1cnJlbnRPcHMgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRocm93IEVycm9yKCdpMThuIHRhZyBwbGFjZWhvbGRlciBzaG91bGQgb25seSBvY2N1ciBpbnNpZGUgYW4gaTE4biBibG9jaycpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAob3AudGVtcGxhdGVLaW5kID09PSBpci5UZW1wbGF0ZUtpbmQuU3RydWN0dXJhbCkge1xuICAgICAgICAgICAgLy8gSWYgdGhpcyBpcyBhIHN0cnVjdHVyYWwgZGlyZWN0aXZlIHRlbXBsYXRlLCBkb24ndCByZWNvcmQgYW55dGhpbmcgeWV0LiBJbnN0ZWFkIHBhc3NcbiAgICAgICAgICAgIC8vIHRoZSBjdXJyZW50IHRlbXBsYXRlIGFzIGEgcGVuZGluZyBzdHJ1Y3R1cmFsIGRpcmVjdGl2ZSB0byBiZSByZWNvcmRlZCB3aGVuIHdlIGZpbmRcbiAgICAgICAgICAgIC8vIHRoZSBlbGVtZW50LCBjb250ZW50LCBvciB0ZW1wbGF0ZSBpdCBiZWxvbmdzIHRvLiBUaGlzIGFsbG93cyB1cyB0byBjcmVhdGUgY29tYmluZWRcbiAgICAgICAgICAgIC8vIHZhbHVlcyB0aGF0IHJlcHJlc2VudCwgZS5nLiB0aGUgc3RhcnQgb2YgYSB0ZW1wbGF0ZSBhbmQgZWxlbWVudCBhdCB0aGUgc2FtZSB0aW1lLlxuICAgICAgICAgICAgcmVzb2x2ZVBsYWNlaG9sZGVyc0ZvclZpZXcoam9iLCB2aWV3LCBpMThuQ29udGV4dHMsIGVsZW1lbnRzLCBvcCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIElmIHRoaXMgaXMgc29tZSBvdGhlciBraW5kIG9mIHRlbXBsYXRlLCB3ZSBjYW4gcmVjb3JkIGl0cyBzdGFydCwgcmVjdXJzZSBpbnRvIGl0c1xuICAgICAgICAgICAgLy8gdmlldywgYW5kIHRoZW4gcmVjb3JkIGl0cyBlbmQuXG4gICAgICAgICAgICByZWNvcmRUZW1wbGF0ZVN0YXJ0KFxuICAgICAgICAgICAgICAgIGpvYiwgdmlldywgb3AuaGFuZGxlLnNsb3QhLCBvcC5pMThuUGxhY2Vob2xkZXIsIGN1cnJlbnRPcHMuaTE4bkNvbnRleHQsXG4gICAgICAgICAgICAgICAgY3VycmVudE9wcy5pMThuQmxvY2ssIHBlbmRpbmdTdHJ1Y3R1cmFsRGlyZWN0aXZlKTtcbiAgICAgICAgICAgIHJlc29sdmVQbGFjZWhvbGRlcnNGb3JWaWV3KGpvYiwgdmlldywgaTE4bkNvbnRleHRzLCBlbGVtZW50cyk7XG4gICAgICAgICAgICByZWNvcmRUZW1wbGF0ZUNsb3NlKFxuICAgICAgICAgICAgICAgIGpvYiwgdmlldywgb3AuaGFuZGxlLnNsb3QhLCBvcC5pMThuUGxhY2Vob2xkZXIsIGN1cnJlbnRPcHMhLmkxOG5Db250ZXh0LFxuICAgICAgICAgICAgICAgIGN1cnJlbnRPcHMhLmkxOG5CbG9jaywgcGVuZGluZ1N0cnVjdHVyYWxEaXJlY3RpdmUpO1xuICAgICAgICAgICAgcGVuZGluZ1N0cnVjdHVyYWxEaXJlY3RpdmUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBpci5PcEtpbmQuUmVwZWF0ZXJDcmVhdGU6XG4gICAgICAgIGlmIChwZW5kaW5nU3RydWN0dXJhbERpcmVjdGl2ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdGhyb3cgRXJyb3IoJ0Fzc2VydGlvbkVycm9yOiBVbmV4cGVjdGVkIHN0cnVjdHVyYWwgZGlyZWN0aXZlIGFzc29jaWF0ZWQgd2l0aCBAZm9yIGJsb2NrJyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gUmVwZWF0ZXJDcmVhdGUgaGFzIDMgc2xvdHM6IHRoZSBmaXJzdCBpcyBmb3IgdGhlIG9wIGl0c2VsZiwgdGhlIHNlY29uZCBpcyBmb3IgdGhlIEBmb3JcbiAgICAgICAgLy8gdGVtcGxhdGUgYW5kIHRoZSAob3B0aW9uYWwpIHRoaXJkIGlzIGZvciB0aGUgQGVtcHR5IHRlbXBsYXRlLlxuICAgICAgICBjb25zdCBmb3JTbG90ID0gb3AuaGFuZGxlLnNsb3QhICsgMTtcbiAgICAgICAgY29uc3QgZm9yVmlldyA9IGpvYi52aWV3cy5nZXQob3AueHJlZikhO1xuICAgICAgICAvLyBGaXJzdCByZWNvcmQgYWxsIG9mIHRoZSBwbGFjZWhvbGRlcnMgZm9yIHRoZSBAZm9yIHRlbXBsYXRlLlxuICAgICAgICBpZiAob3AuaTE4blBsYWNlaG9sZGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAvLyBJZiB0aGVyZSBpcyBubyBpMThuIHBsYWNlaG9sZGVyLCBqdXN0IHJlY3Vyc2UgaW50byB0aGUgdmlldyBpbiBjYXNlIGl0IGNvbnRhaW5zIGkxOG5cbiAgICAgICAgICAvLyBibG9ja3MuXG4gICAgICAgICAgcmVzb2x2ZVBsYWNlaG9sZGVyc0ZvclZpZXcoam9iLCBmb3JWaWV3LCBpMThuQ29udGV4dHMsIGVsZW1lbnRzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoY3VycmVudE9wcyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdGhyb3cgRXJyb3IoJ2kxOG4gdGFnIHBsYWNlaG9sZGVyIHNob3VsZCBvbmx5IG9jY3VyIGluc2lkZSBhbiBpMThuIGJsb2NrJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJlY29yZFRlbXBsYXRlU3RhcnQoXG4gICAgICAgICAgICAgIGpvYiwgZm9yVmlldywgZm9yU2xvdCwgb3AuaTE4blBsYWNlaG9sZGVyLCBjdXJyZW50T3BzLmkxOG5Db250ZXh0LFxuICAgICAgICAgICAgICBjdXJyZW50T3BzLmkxOG5CbG9jaywgcGVuZGluZ1N0cnVjdHVyYWxEaXJlY3RpdmUpO1xuICAgICAgICAgIHJlc29sdmVQbGFjZWhvbGRlcnNGb3JWaWV3KGpvYiwgZm9yVmlldywgaTE4bkNvbnRleHRzLCBlbGVtZW50cyk7XG4gICAgICAgICAgcmVjb3JkVGVtcGxhdGVDbG9zZShcbiAgICAgICAgICAgICAgam9iLCBmb3JWaWV3LCBmb3JTbG90LCBvcC5pMThuUGxhY2Vob2xkZXIsIGN1cnJlbnRPcHMhLmkxOG5Db250ZXh0LFxuICAgICAgICAgICAgICBjdXJyZW50T3BzIS5pMThuQmxvY2ssIHBlbmRpbmdTdHJ1Y3R1cmFsRGlyZWN0aXZlKTtcbiAgICAgICAgICBwZW5kaW5nU3RydWN0dXJhbERpcmVjdGl2ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICAvLyBUaGVuIGlmIHRoZXJlJ3MgYW4gQGVtcHR5IHRlbXBsYXRlLCBhZGQgaXRzIHBsYWNlaG9sZGVycyBhcyB3ZWxsLlxuICAgICAgICBpZiAob3AuZW1wdHlWaWV3ICE9PSBudWxsKSB7XG4gICAgICAgICAgLy8gUmVwZWF0ZXJDcmVhdGUgaGFzIDMgc2xvdHM6IHRoZSBmaXJzdCBpcyBmb3IgdGhlIG9wIGl0c2VsZiwgdGhlIHNlY29uZCBpcyBmb3IgdGhlIEBmb3JcbiAgICAgICAgICAvLyB0ZW1wbGF0ZSBhbmQgdGhlIChvcHRpb25hbCkgdGhpcmQgaXMgZm9yIHRoZSBAZW1wdHkgdGVtcGxhdGUuXG4gICAgICAgICAgY29uc3QgZW1wdHlTbG90ID0gb3AuaGFuZGxlLnNsb3QhICsgMjtcbiAgICAgICAgICBjb25zdCBlbXB0eVZpZXcgPSBqb2Iudmlld3MuZ2V0KG9wLmVtcHR5VmlldyEpITtcbiAgICAgICAgICBpZiAob3AuZW1wdHlJMThuUGxhY2Vob2xkZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgLy8gSWYgdGhlcmUgaXMgbm8gaTE4biBwbGFjZWhvbGRlciwganVzdCByZWN1cnNlIGludG8gdGhlIHZpZXcgaW4gY2FzZSBpdCBjb250YWlucyBpMThuXG4gICAgICAgICAgICAvLyBibG9ja3MuXG4gICAgICAgICAgICByZXNvbHZlUGxhY2Vob2xkZXJzRm9yVmlldyhqb2IsIGVtcHR5VmlldywgaTE4bkNvbnRleHRzLCBlbGVtZW50cyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50T3BzID09PSBudWxsKSB7XG4gICAgICAgICAgICAgIHRocm93IEVycm9yKCdpMThuIHRhZyBwbGFjZWhvbGRlciBzaG91bGQgb25seSBvY2N1ciBpbnNpZGUgYW4gaTE4biBibG9jaycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVjb3JkVGVtcGxhdGVTdGFydChcbiAgICAgICAgICAgICAgICBqb2IsIGVtcHR5VmlldywgZW1wdHlTbG90LCBvcC5lbXB0eUkxOG5QbGFjZWhvbGRlciwgY3VycmVudE9wcy5pMThuQ29udGV4dCxcbiAgICAgICAgICAgICAgICBjdXJyZW50T3BzLmkxOG5CbG9jaywgcGVuZGluZ1N0cnVjdHVyYWxEaXJlY3RpdmUpO1xuICAgICAgICAgICAgcmVzb2x2ZVBsYWNlaG9sZGVyc0ZvclZpZXcoam9iLCBlbXB0eVZpZXcsIGkxOG5Db250ZXh0cywgZWxlbWVudHMpO1xuICAgICAgICAgICAgcmVjb3JkVGVtcGxhdGVDbG9zZShcbiAgICAgICAgICAgICAgICBqb2IsIGVtcHR5VmlldywgZW1wdHlTbG90LCBvcC5lbXB0eUkxOG5QbGFjZWhvbGRlciwgY3VycmVudE9wcyEuaTE4bkNvbnRleHQsXG4gICAgICAgICAgICAgICAgY3VycmVudE9wcyEuaTE4bkJsb2NrLCBwZW5kaW5nU3RydWN0dXJhbERpcmVjdGl2ZSk7XG4gICAgICAgICAgICBwZW5kaW5nU3RydWN0dXJhbERpcmVjdGl2ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogUmVjb3JkcyBhbiBpMThuIHBhcmFtIHZhbHVlIGZvciB0aGUgc3RhcnQgb2YgYW4gZWxlbWVudC5cbiAqL1xuZnVuY3Rpb24gcmVjb3JkRWxlbWVudFN0YXJ0KFxuICAgIG9wOiBpci5FbGVtZW50U3RhcnRPcHxpci5Qcm9qZWN0aW9uT3AsIGkxOG5Db250ZXh0OiBpci5JMThuQ29udGV4dE9wLCBpMThuQmxvY2s6IGlyLkkxOG5TdGFydE9wLFxuICAgIHN0cnVjdHVyYWxEaXJlY3RpdmU/OiBpci5UZW1wbGF0ZU9wKSB7XG4gIGNvbnN0IHtzdGFydE5hbWUsIGNsb3NlTmFtZX0gPSBvcC5pMThuUGxhY2Vob2xkZXIhO1xuICBsZXQgZmxhZ3MgPSBpci5JMThuUGFyYW1WYWx1ZUZsYWdzLkVsZW1lbnRUYWcgfCBpci5JMThuUGFyYW1WYWx1ZUZsYWdzLk9wZW5UYWc7XG4gIGxldCB2YWx1ZTogaXIuSTE4blBhcmFtVmFsdWVbJ3ZhbHVlJ10gPSBvcC5oYW5kbGUuc2xvdCE7XG4gIC8vIElmIHRoZSBlbGVtZW50IGlzIGFzc29jaWF0ZWQgd2l0aCBhIHN0cnVjdHVyYWwgZGlyZWN0aXZlLCBzdGFydCBpdCBhcyB3ZWxsLlxuICBpZiAoc3RydWN0dXJhbERpcmVjdGl2ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgZmxhZ3MgfD0gaXIuSTE4blBhcmFtVmFsdWVGbGFncy5UZW1wbGF0ZVRhZztcbiAgICB2YWx1ZSA9IHtlbGVtZW50OiB2YWx1ZSwgdGVtcGxhdGU6IHN0cnVjdHVyYWxEaXJlY3RpdmUuaGFuZGxlLnNsb3QhfTtcbiAgfVxuICAvLyBGb3Igc2VsZi1jbG9zaW5nIHRhZ3MsIHRoZXJlIGlzIG5vIGNsb3NlIHRhZyBwbGFjZWhvbGRlci4gSW5zdGVhZCwgdGhlIHN0YXJ0IHRhZ1xuICAvLyBwbGFjZWhvbGRlciBhY2NvdW50cyBmb3IgdGhlIHN0YXJ0IGFuZCBjbG9zZSBvZiB0aGUgZWxlbWVudC5cbiAgaWYgKCFjbG9zZU5hbWUpIHtcbiAgICBmbGFncyB8PSBpci5JMThuUGFyYW1WYWx1ZUZsYWdzLkNsb3NlVGFnO1xuICB9XG4gIGFkZFBhcmFtKGkxOG5Db250ZXh0LnBhcmFtcywgc3RhcnROYW1lLCB2YWx1ZSwgaTE4bkJsb2NrLnN1YlRlbXBsYXRlSW5kZXgsIGZsYWdzKTtcbn1cblxuLyoqXG4gKiBSZWNvcmRzIGFuIGkxOG4gcGFyYW0gdmFsdWUgZm9yIHRoZSBjbG9zaW5nIG9mIGFuIGVsZW1lbnQuXG4gKi9cbmZ1bmN0aW9uIHJlY29yZEVsZW1lbnRDbG9zZShcbiAgICBvcDogaXIuRWxlbWVudFN0YXJ0T3B8aXIuUHJvamVjdGlvbk9wLCBpMThuQ29udGV4dDogaXIuSTE4bkNvbnRleHRPcCwgaTE4bkJsb2NrOiBpci5JMThuU3RhcnRPcCxcbiAgICBzdHJ1Y3R1cmFsRGlyZWN0aXZlPzogaXIuVGVtcGxhdGVPcCkge1xuICBjb25zdCB7Y2xvc2VOYW1lfSA9IG9wLmkxOG5QbGFjZWhvbGRlciE7XG4gIC8vIFNlbGYtY2xvc2luZyB0YWdzIGRvbid0IGhhdmUgYSBjbG9zaW5nIHRhZyBwbGFjZWhvbGRlciwgaW5zdGVhZCB0aGUgZWxlbWVudCBjbG9zaW5nIGlzXG4gIC8vIHJlY29yZGVkIHZpYSBhbiBhZGRpdGlvbmFsIGZsYWcgb24gdGhlIGVsZW1lbnQgc3RhcnQgdmFsdWUuXG4gIGlmIChjbG9zZU5hbWUpIHtcbiAgICBsZXQgZmxhZ3MgPSBpci5JMThuUGFyYW1WYWx1ZUZsYWdzLkVsZW1lbnRUYWcgfCBpci5JMThuUGFyYW1WYWx1ZUZsYWdzLkNsb3NlVGFnO1xuICAgIGxldCB2YWx1ZTogaXIuSTE4blBhcmFtVmFsdWVbJ3ZhbHVlJ10gPSBvcC5oYW5kbGUuc2xvdCE7XG4gICAgLy8gSWYgdGhlIGVsZW1lbnQgaXMgYXNzb2NpYXRlZCB3aXRoIGEgc3RydWN0dXJhbCBkaXJlY3RpdmUsIGNsb3NlIGl0IGFzIHdlbGwuXG4gICAgaWYgKHN0cnVjdHVyYWxEaXJlY3RpdmUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgZmxhZ3MgfD0gaXIuSTE4blBhcmFtVmFsdWVGbGFncy5UZW1wbGF0ZVRhZztcbiAgICAgIHZhbHVlID0ge2VsZW1lbnQ6IHZhbHVlLCB0ZW1wbGF0ZTogc3RydWN0dXJhbERpcmVjdGl2ZS5oYW5kbGUuc2xvdCF9O1xuICAgIH1cbiAgICBhZGRQYXJhbShpMThuQ29udGV4dC5wYXJhbXMsIGNsb3NlTmFtZSwgdmFsdWUsIGkxOG5CbG9jay5zdWJUZW1wbGF0ZUluZGV4LCBmbGFncyk7XG4gIH1cbn1cblxuLyoqXG4gKiBSZWNvcmRzIGFuIGkxOG4gcGFyYW0gdmFsdWUgZm9yIHRoZSBzdGFydCBvZiBhIHRlbXBsYXRlLlxuICovXG5mdW5jdGlvbiByZWNvcmRUZW1wbGF0ZVN0YXJ0KFxuICAgIGpvYjogQ29tcG9uZW50Q29tcGlsYXRpb25Kb2IsIHZpZXc6IFZpZXdDb21waWxhdGlvblVuaXQsIHNsb3Q6IG51bWJlcixcbiAgICBpMThuUGxhY2Vob2xkZXI6IGkxOG4uVGFnUGxhY2Vob2xkZXJ8aTE4bi5CbG9ja1BsYWNlaG9sZGVyLCBpMThuQ29udGV4dDogaXIuSTE4bkNvbnRleHRPcCxcbiAgICBpMThuQmxvY2s6IGlyLkkxOG5TdGFydE9wLCBzdHJ1Y3R1cmFsRGlyZWN0aXZlPzogaXIuVGVtcGxhdGVPcCkge1xuICBsZXQge3N0YXJ0TmFtZSwgY2xvc2VOYW1lfSA9IGkxOG5QbGFjZWhvbGRlcjtcbiAgbGV0IGZsYWdzID0gaXIuSTE4blBhcmFtVmFsdWVGbGFncy5UZW1wbGF0ZVRhZyB8IGlyLkkxOG5QYXJhbVZhbHVlRmxhZ3MuT3BlblRhZztcbiAgLy8gRm9yIHNlbGYtY2xvc2luZyB0YWdzLCB0aGVyZSBpcyBubyBjbG9zZSB0YWcgcGxhY2Vob2xkZXIuIEluc3RlYWQsIHRoZSBzdGFydCB0YWdcbiAgLy8gcGxhY2Vob2xkZXIgYWNjb3VudHMgZm9yIHRoZSBzdGFydCBhbmQgY2xvc2Ugb2YgdGhlIGVsZW1lbnQuXG4gIGlmICghY2xvc2VOYW1lKSB7XG4gICAgZmxhZ3MgfD0gaXIuSTE4blBhcmFtVmFsdWVGbGFncy5DbG9zZVRhZztcbiAgfVxuICAvLyBJZiB0aGUgdGVtcGxhdGUgaXMgYXNzb2NpYXRlZCB3aXRoIGEgc3RydWN0dXJhbCBkaXJlY3RpdmUsIHJlY29yZCB0aGUgc3RydWN0dXJhbCBkaXJlY3RpdmUnc1xuICAvLyBzdGFydCBmaXJzdC4gU2luY2UgdGhpcyB0ZW1wbGF0ZSBtdXN0IGJlIGluIHRoZSBzdHJ1Y3R1cmFsIGRpcmVjdGl2ZSdzIHZpZXcsIHdlIGNhbiBqdXN0XG4gIC8vIGRpcmVjdGx5IHVzZSB0aGUgY3VycmVudCBpMThuIGJsb2NrJ3Mgc3ViLXRlbXBsYXRlIGluZGV4LlxuICBpZiAoc3RydWN0dXJhbERpcmVjdGl2ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgYWRkUGFyYW0oXG4gICAgICAgIGkxOG5Db250ZXh0LnBhcmFtcywgc3RhcnROYW1lLCBzdHJ1Y3R1cmFsRGlyZWN0aXZlLmhhbmRsZS5zbG90ISwgaTE4bkJsb2NrLnN1YlRlbXBsYXRlSW5kZXgsXG4gICAgICAgIGZsYWdzKTtcbiAgfVxuICAvLyBSZWNvcmQgdGhlIHN0YXJ0IG9mIHRoZSB0ZW1wbGF0ZS4gRm9yIHRoZSBzdWItdGVtcGxhdGUgaW5kZXgsIHBhc3MgdGhlIGluZGV4IGZvciB0aGUgdGVtcGxhdGUnc1xuICAvLyB2aWV3LCByYXRoZXIgdGhhbiB0aGUgY3VycmVudCBpMThuIGJsb2NrJ3MgaW5kZXguXG4gIGFkZFBhcmFtKFxuICAgICAgaTE4bkNvbnRleHQucGFyYW1zLCBzdGFydE5hbWUsIHNsb3QsIGdldFN1YlRlbXBsYXRlSW5kZXhGb3JUZW1wbGF0ZVRhZyhqb2IsIGkxOG5CbG9jaywgdmlldyksXG4gICAgICBmbGFncyk7XG59XG5cbi8qKlxuICogUmVjb3JkcyBhbiBpMThuIHBhcmFtIHZhbHVlIGZvciB0aGUgY2xvc2luZyBvZiBhIHRlbXBsYXRlLlxuICovXG5mdW5jdGlvbiByZWNvcmRUZW1wbGF0ZUNsb3NlKFxuICAgIGpvYjogQ29tcG9uZW50Q29tcGlsYXRpb25Kb2IsIHZpZXc6IFZpZXdDb21waWxhdGlvblVuaXQsIHNsb3Q6IG51bWJlcixcbiAgICBpMThuUGxhY2Vob2xkZXI6IGkxOG4uVGFnUGxhY2Vob2xkZXJ8aTE4bi5CbG9ja1BsYWNlaG9sZGVyLCBpMThuQ29udGV4dDogaXIuSTE4bkNvbnRleHRPcCxcbiAgICBpMThuQmxvY2s6IGlyLkkxOG5TdGFydE9wLCBzdHJ1Y3R1cmFsRGlyZWN0aXZlPzogaXIuVGVtcGxhdGVPcCkge1xuICBjb25zdCB7Y2xvc2VOYW1lfSA9IGkxOG5QbGFjZWhvbGRlcjtcbiAgY29uc3QgZmxhZ3MgPSBpci5JMThuUGFyYW1WYWx1ZUZsYWdzLlRlbXBsYXRlVGFnIHwgaXIuSTE4blBhcmFtVmFsdWVGbGFncy5DbG9zZVRhZztcbiAgLy8gU2VsZi1jbG9zaW5nIHRhZ3MgZG9uJ3QgaGF2ZSBhIGNsb3NpbmcgdGFnIHBsYWNlaG9sZGVyLCBpbnN0ZWFkIHRoZSB0ZW1wbGF0ZSdzIGNsb3NpbmcgaXNcbiAgLy8gcmVjb3JkZWQgdmlhIGFuIGFkZGl0aW9uYWwgZmxhZyBvbiB0aGUgdGVtcGxhdGUgc3RhcnQgdmFsdWUuXG4gIGlmIChjbG9zZU5hbWUpIHtcbiAgICAvLyBSZWNvcmQgdGhlIGNsb3Npbmcgb2YgdGhlIHRlbXBsYXRlLiBGb3IgdGhlIHN1Yi10ZW1wbGF0ZSBpbmRleCwgcGFzcyB0aGUgaW5kZXggZm9yIHRoZVxuICAgIC8vIHRlbXBsYXRlJ3MgdmlldywgcmF0aGVyIHRoYW4gdGhlIGN1cnJlbnQgaTE4biBibG9jaydzIGluZGV4LlxuICAgIGFkZFBhcmFtKFxuICAgICAgICBpMThuQ29udGV4dC5wYXJhbXMsIGNsb3NlTmFtZSwgc2xvdCxcbiAgICAgICAgZ2V0U3ViVGVtcGxhdGVJbmRleEZvclRlbXBsYXRlVGFnKGpvYiwgaTE4bkJsb2NrLCB2aWV3KSwgZmxhZ3MpO1xuICAgIC8vIElmIHRoZSB0ZW1wbGF0ZSBpcyBhc3NvY2lhdGVkIHdpdGggYSBzdHJ1Y3R1cmFsIGRpcmVjdGl2ZSwgcmVjb3JkIHRoZSBzdHJ1Y3R1cmFsIGRpcmVjdGl2ZSdzXG4gICAgLy8gY2xvc2luZyBhZnRlci4gU2luY2UgdGhpcyB0ZW1wbGF0ZSBtdXN0IGJlIGluIHRoZSBzdHJ1Y3R1cmFsIGRpcmVjdGl2ZSdzIHZpZXcsIHdlIGNhbiBqdXN0XG4gICAgLy8gZGlyZWN0bHkgdXNlIHRoZSBjdXJyZW50IGkxOG4gYmxvY2sncyBzdWItdGVtcGxhdGUgaW5kZXguXG4gICAgaWYgKHN0cnVjdHVyYWxEaXJlY3RpdmUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgYWRkUGFyYW0oXG4gICAgICAgICAgaTE4bkNvbnRleHQucGFyYW1zLCBjbG9zZU5hbWUsIHN0cnVjdHVyYWxEaXJlY3RpdmUuaGFuZGxlLnNsb3QhLFxuICAgICAgICAgIGkxOG5CbG9jay5zdWJUZW1wbGF0ZUluZGV4LCBmbGFncyk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogR2V0IHRoZSBzdWJUZW1wbGF0ZUluZGV4IGZvciB0aGUgZ2l2ZW4gdGVtcGxhdGUgb3AuIEZvciB0ZW1wbGF0ZSBvcHMsIHVzZSB0aGUgc3ViVGVtcGxhdGVJbmRleCBvZlxuICogdGhlIGNoaWxkIGkxOG4gYmxvY2sgaW5zaWRlIHRoZSB0ZW1wbGF0ZS5cbiAqL1xuZnVuY3Rpb24gZ2V0U3ViVGVtcGxhdGVJbmRleEZvclRlbXBsYXRlVGFnKFxuICAgIGpvYjogQ29tcG9uZW50Q29tcGlsYXRpb25Kb2IsIGkxOG5PcDogaXIuSTE4blN0YXJ0T3AsIHZpZXc6IFZpZXdDb21waWxhdGlvblVuaXQpOiBudW1iZXJ8bnVsbCB7XG4gIGZvciAoY29uc3QgY2hpbGRPcCBvZiB2aWV3LmNyZWF0ZSkge1xuICAgIGlmIChjaGlsZE9wLmtpbmQgPT09IGlyLk9wS2luZC5JMThuU3RhcnQpIHtcbiAgICAgIHJldHVybiBjaGlsZE9wLnN1YlRlbXBsYXRlSW5kZXg7XG4gICAgfVxuICB9XG4gIHJldHVybiBpMThuT3Auc3ViVGVtcGxhdGVJbmRleDtcbn1cblxuLyoqXG4gKiBBZGQgYSBwYXJhbSB2YWx1ZSB0byB0aGUgZ2l2ZW4gcGFyYW1zIG1hcC5cbiAqL1xuZnVuY3Rpb24gYWRkUGFyYW0oXG4gICAgcGFyYW1zOiBNYXA8c3RyaW5nLCBpci5JMThuUGFyYW1WYWx1ZVtdPiwgcGxhY2Vob2xkZXI6IHN0cmluZyxcbiAgICB2YWx1ZTogc3RyaW5nfG51bWJlcnx7ZWxlbWVudDogbnVtYmVyLCB0ZW1wbGF0ZTogbnVtYmVyfSwgc3ViVGVtcGxhdGVJbmRleDogbnVtYmVyfG51bGwsXG4gICAgZmxhZ3M6IGlyLkkxOG5QYXJhbVZhbHVlRmxhZ3MpIHtcbiAgY29uc3QgdmFsdWVzID0gcGFyYW1zLmdldChwbGFjZWhvbGRlcikgPz8gW107XG4gIHZhbHVlcy5wdXNoKHt2YWx1ZSwgc3ViVGVtcGxhdGVJbmRleCwgZmxhZ3N9KTtcbiAgcGFyYW1zLnNldChwbGFjZWhvbGRlciwgdmFsdWVzKTtcbn1cbiJdfQ==