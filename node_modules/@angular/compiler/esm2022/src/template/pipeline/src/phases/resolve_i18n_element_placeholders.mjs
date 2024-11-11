/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb2x2ZV9pMThuX2VsZW1lbnRfcGxhY2Vob2xkZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3RlbXBsYXRlL3BpcGVsaW5lL3NyYy9waGFzZXMvcmVzb2x2ZV9pMThuX2VsZW1lbnRfcGxhY2Vob2xkZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUdILE9BQU8sS0FBSyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRy9COztHQUVHO0FBQ0gsTUFBTSxVQUFVLDhCQUE4QixDQUFDLEdBQTRCO0lBQ3pFLGdFQUFnRTtJQUNoRSxNQUFNLFlBQVksR0FBRyxJQUFJLEdBQUcsRUFBK0IsQ0FBQztJQUM1RCxNQUFNLFFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBZ0MsQ0FBQztJQUN6RCxLQUFLLE1BQU0sSUFBSSxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM3QixLQUFLLE1BQU0sRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUM3QixRQUFRLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDaEIsS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLFdBQVc7b0JBQ3hCLFlBQVksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztvQkFDOUIsTUFBTTtnQkFDUixLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsWUFBWTtvQkFDekIsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO29CQUMxQixNQUFNO1lBQ1YsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0lBRUQsMEJBQTBCLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQ3BFLENBQUM7QUFFRDs7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V0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ2xDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIGkxOG4gZnJvbSAnLi4vLi4vLi4vLi4vaTE4bi9pMThuX2FzdCc7XG5pbXBvcnQgKiBhcyBpciBmcm9tICcuLi8uLi9pcic7XG5pbXBvcnQge0NvbXBvbmVudENvbXBpbGF0aW9uSm9iLCBWaWV3Q29tcGlsYXRpb25Vbml0fSBmcm9tICcuLi9jb21waWxhdGlvbic7XG5cbi8qKlxuICogUmVzb2x2ZSB0aGUgZWxlbWVudCBwbGFjZWhvbGRlcnMgaW4gaTE4biBtZXNzYWdlcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVJMThuRWxlbWVudFBsYWNlaG9sZGVycyhqb2I6IENvbXBvbmVudENvbXBpbGF0aW9uSm9iKSB7XG4gIC8vIFJlY29yZCBhbGwgb2YgdGhlIGVsZW1lbnQgYW5kIGkxOG4gY29udGV4dCBvcHMgZm9yIHVzZSBsYXRlci5cbiAgY29uc3QgaTE4bkNvbnRleHRzID0gbmV3IE1hcDxpci5YcmVmSWQsIGlyLkkxOG5Db250ZXh0T3A+KCk7XG4gIGNvbnN0IGVsZW1lbnRzID0gbmV3IE1hcDxpci5YcmVmSWQsIGlyLkVsZW1lbnRTdGFydE9wPigpO1xuICBmb3IgKGNvbnN0IHVuaXQgb2Ygam9iLnVuaXRzKSB7XG4gICAgZm9yIChjb25zdCBvcCBvZiB1bml0LmNyZWF0ZSkge1xuICAgICAgc3dpdGNoIChvcC5raW5kKSB7XG4gICAgICAgIGNhc2UgaXIuT3BLaW5kLkkxOG5Db250ZXh0OlxuICAgICAgICAgIGkxOG5Db250ZXh0cy5zZXQob3AueHJlZiwgb3ApO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIGlyLk9wS2luZC5FbGVtZW50U3RhcnQ6XG4gICAgICAgICAgZWxlbWVudHMuc2V0KG9wLnhyZWYsIG9wKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXNvbHZlUGxhY2Vob2xkZXJzRm9yVmlldyhqb2IsIGpvYi5yb290LCBpMThuQ29udGV4dHMsIGVsZW1lbnRzKTtcbn1cblxuLyoqXG4gKiBSZWN1cnNpdmVseSByZXNvbHZlcyBlbGVtZW50IGFuZCB0ZW1wbGF0ZSB0YWcgcGxhY2Vob2xkZXJzIGluIHRoZSBnaXZlbiB2aWV3LlxuICovXG5mdW5jdGlvbiByZXNvbHZlUGxhY2Vob2xkZXJzRm9yVmlldyhcbiAgam9iOiBDb21wb25lbnRDb21waWxhdGlvbkpvYixcbiAgdW5pdDogVmlld0NvbXBpbGF0aW9uVW5pdCxcbiAgaTE4bkNvbnRleHRzOiBNYXA8aXIuWHJlZklkLCBpci5JMThuQ29udGV4dE9wPixcbiAgZWxlbWVudHM6IE1hcDxpci5YcmVmSWQsIGlyLkVsZW1lbnRTdGFydE9wPixcbiAgcGVuZGluZ1N0cnVjdHVyYWxEaXJlY3RpdmU/OiBpci5UZW1wbGF0ZU9wLFxuKSB7XG4gIC8vIFRyYWNrIHRoZSBjdXJyZW50IGkxOG4gb3AgYW5kIGNvcnJlc3BvbmRpbmcgaTE4biBjb250ZXh0IG9wIGFzIHdlIHN0ZXAgdGhyb3VnaCB0aGUgY3JlYXRpb25cbiAgLy8gSVIuXG4gIGxldCBjdXJyZW50T3BzOiB7aTE4bkJsb2NrOiBpci5JMThuU3RhcnRPcDsgaTE4bkNvbnRleHQ6IGlyLkkxOG5Db250ZXh0T3B9IHwgbnVsbCA9IG51bGw7XG4gIGxldCBwZW5kaW5nU3RydWN0dXJhbERpcmVjdGl2ZUNsb3NlcyA9IG5ldyBNYXA8aXIuWHJlZklkLCBpci5UZW1wbGF0ZU9wPigpO1xuICBmb3IgKGNvbnN0IG9wIG9mIHVuaXQuY3JlYXRlKSB7XG4gICAgc3dpdGNoIChvcC5raW5kKSB7XG4gICAgICBjYXNlIGlyLk9wS2luZC5JMThuU3RhcnQ6XG4gICAgICAgIGlmICghb3AuY29udGV4dCkge1xuICAgICAgICAgIHRocm93IEVycm9yKCdDb3VsZCBub3QgZmluZCBpMThuIGNvbnRleHQgZm9yIGkxOG4gb3AnKTtcbiAgICAgICAgfVxuICAgICAgICBjdXJyZW50T3BzID0ge2kxOG5CbG9jazogb3AsIGkxOG5Db250ZXh0OiBpMThuQ29udGV4dHMuZ2V0KG9wLmNvbnRleHQpIX07XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBpci5PcEtpbmQuSTE4bkVuZDpcbiAgICAgICAgY3VycmVudE9wcyA9IG51bGw7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBpci5PcEtpbmQuRWxlbWVudFN0YXJ0OlxuICAgICAgICAvLyBGb3IgZWxlbWVudHMgd2l0aCBpMThuIHBsYWNlaG9sZGVycywgcmVjb3JkIGl0cyBzbG90IHZhbHVlIGluIHRoZSBwYXJhbXMgbWFwIHVuZGVyIHRoZVxuICAgICAgICAvLyBjb3JyZXNwb25kaW5nIHRhZyBzdGFydCBwbGFjZWhvbGRlci5cbiAgICAgICAgaWYgKG9wLmkxOG5QbGFjZWhvbGRlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgaWYgKGN1cnJlbnRPcHMgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRocm93IEVycm9yKCdpMThuIHRhZyBwbGFjZWhvbGRlciBzaG91bGQgb25seSBvY2N1ciBpbnNpZGUgYW4gaTE4biBibG9jaycpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZWNvcmRFbGVtZW50U3RhcnQoXG4gICAgICAgICAgICBvcCxcbiAgICAgICAgICAgIGN1cnJlbnRPcHMuaTE4bkNvbnRleHQsXG4gICAgICAgICAgICBjdXJyZW50T3BzLmkxOG5CbG9jayxcbiAgICAgICAgICAgIHBlbmRpbmdTdHJ1Y3R1cmFsRGlyZWN0aXZlLFxuICAgICAgICAgICk7XG4gICAgICAgICAgLy8gSWYgdGhlcmUgaXMgYSBzZXBhcmF0ZSBjbG9zZSB0YWcgcGxhY2Vob2xkZXIgZm9yIHRoaXMgZWxlbWVudCwgc2F2ZSB0aGUgcGVuZGluZ1xuICAgICAgICAgIC8vIHN0cnVjdHVyYWwgZGlyZWN0aXZlIHNvIHdlIGNhbiBwYXNzIGl0IHRvIHRoZSBjbG9zaW5nIHRhZyBhcyB3ZWxsLlxuICAgICAgICAgIGlmIChwZW5kaW5nU3RydWN0dXJhbERpcmVjdGl2ZSAmJiBvcC5pMThuUGxhY2Vob2xkZXIuY2xvc2VOYW1lKSB7XG4gICAgICAgICAgICBwZW5kaW5nU3RydWN0dXJhbERpcmVjdGl2ZUNsb3Nlcy5zZXQob3AueHJlZiwgcGVuZGluZ1N0cnVjdHVyYWxEaXJlY3RpdmUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBDbGVhciBvdXQgdGhlIHBlbmRpbmcgc3RydWN0dXJhbCBkaXJlY3RpdmUgbm93IHRoYXQgaXRzIGJlZW4gYWNjb3VudGVkIGZvci5cbiAgICAgICAgICBwZW5kaW5nU3RydWN0dXJhbERpcmVjdGl2ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgaXIuT3BLaW5kLkVsZW1lbnRFbmQ6XG4gICAgICAgIC8vIEZvciBlbGVtZW50cyB3aXRoIGkxOG4gcGxhY2Vob2xkZXJzLCByZWNvcmQgaXRzIHNsb3QgdmFsdWUgaW4gdGhlIHBhcmFtcyBtYXAgdW5kZXIgdGhlXG4gICAgICAgIC8vIGNvcnJlc3BvbmRpbmcgdGFnIGNsb3NlIHBsYWNlaG9sZGVyLlxuICAgICAgICBjb25zdCBzdGFydE9wID0gZWxlbWVudHMuZ2V0KG9wLnhyZWYpO1xuICAgICAgICBpZiAoc3RhcnRPcCAmJiBzdGFydE9wLmkxOG5QbGFjZWhvbGRlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgaWYgKGN1cnJlbnRPcHMgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRocm93IEVycm9yKFxuICAgICAgICAgICAgICAnQXNzZXJ0aW9uRXJyb3I6IGkxOG4gdGFnIHBsYWNlaG9sZGVyIHNob3VsZCBvbmx5IG9jY3VyIGluc2lkZSBhbiBpMThuIGJsb2NrJyxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJlY29yZEVsZW1lbnRDbG9zZShcbiAgICAgICAgICAgIHN0YXJ0T3AsXG4gICAgICAgICAgICBjdXJyZW50T3BzLmkxOG5Db250ZXh0LFxuICAgICAgICAgICAgY3VycmVudE9wcy5pMThuQmxvY2ssXG4gICAgICAgICAgICBwZW5kaW5nU3RydWN0dXJhbERpcmVjdGl2ZUNsb3Nlcy5nZXQob3AueHJlZiksXG4gICAgICAgICAgKTtcbiAgICAgICAgICAvLyBDbGVhciBvdXQgdGhlIHBlbmRpbmcgc3RydWN0dXJhbCBkaXJlY3RpdmUgY2xvc2UgdGhhdCB3YXMgYWNjb3VudGVkIGZvci5cbiAgICAgICAgICBwZW5kaW5nU3RydWN0dXJhbERpcmVjdGl2ZUNsb3Nlcy5kZWxldGUob3AueHJlZik7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIGlyLk9wS2luZC5Qcm9qZWN0aW9uOlxuICAgICAgICAvLyBGb3IgY29udGVudCBwcm9qZWN0aW9ucyB3aXRoIGkxOG4gcGxhY2Vob2xkZXJzLCByZWNvcmQgaXRzIHNsb3QgdmFsdWUgaW4gdGhlIHBhcmFtcyBtYXBcbiAgICAgICAgLy8gdW5kZXIgdGhlIGNvcnJlc3BvbmRpbmcgdGFnIHN0YXJ0IGFuZCBjbG9zZSBwbGFjZWhvbGRlcnMuXG4gICAgICAgIGlmIChvcC5pMThuUGxhY2Vob2xkZXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGlmIChjdXJyZW50T3BzID09PSBudWxsKSB7XG4gICAgICAgICAgICB0aHJvdyBFcnJvcignaTE4biB0YWcgcGxhY2Vob2xkZXIgc2hvdWxkIG9ubHkgb2NjdXIgaW5zaWRlIGFuIGkxOG4gYmxvY2snKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmVjb3JkRWxlbWVudFN0YXJ0KFxuICAgICAgICAgICAgb3AsXG4gICAgICAgICAgICBjdXJyZW50T3BzLmkxOG5Db250ZXh0LFxuICAgICAgICAgICAgY3VycmVudE9wcy5pMThuQmxvY2ssXG4gICAgICAgICAgICBwZW5kaW5nU3RydWN0dXJhbERpcmVjdGl2ZSxcbiAgICAgICAgICApO1xuICAgICAgICAgIHJlY29yZEVsZW1lbnRDbG9zZShcbiAgICAgICAgICAgIG9wLFxuICAgICAgICAgICAgY3VycmVudE9wcy5pMThuQ29udGV4dCxcbiAgICAgICAgICAgIGN1cnJlbnRPcHMuaTE4bkJsb2NrLFxuICAgICAgICAgICAgcGVuZGluZ1N0cnVjdHVyYWxEaXJlY3RpdmUsXG4gICAgICAgICAgKTtcbiAgICAgICAgICAvLyBDbGVhciBvdXQgdGhlIHBlbmRpbmcgc3RydWN0dXJhbCBkaXJlY3RpdmUgbm93IHRoYXQgaXRzIGJlZW4gYWNjb3VudGVkIGZvci5cbiAgICAgICAgICBwZW5kaW5nU3RydWN0dXJhbERpcmVjdGl2ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgaXIuT3BLaW5kLlRlbXBsYXRlOlxuICAgICAgICBjb25zdCB2aWV3ID0gam9iLnZpZXdzLmdldChvcC54cmVmKSE7XG4gICAgICAgIGlmIChvcC5pMThuUGxhY2Vob2xkZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIC8vIElmIHRoZXJlIGlzIG5vIGkxOG4gcGxhY2Vob2xkZXIsIGp1c3QgcmVjdXJzZSBpbnRvIHRoZSB2aWV3IGluIGNhc2UgaXQgY29udGFpbnMgaTE4blxuICAgICAgICAgIC8vIGJsb2Nrcy5cbiAgICAgICAgICByZXNvbHZlUGxhY2Vob2xkZXJzRm9yVmlldyhqb2IsIHZpZXcsIGkxOG5Db250ZXh0cywgZWxlbWVudHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChjdXJyZW50T3BzID09PSBudWxsKSB7XG4gICAgICAgICAgICB0aHJvdyBFcnJvcignaTE4biB0YWcgcGxhY2Vob2xkZXIgc2hvdWxkIG9ubHkgb2NjdXIgaW5zaWRlIGFuIGkxOG4gYmxvY2snKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKG9wLnRlbXBsYXRlS2luZCA9PT0gaXIuVGVtcGxhdGVLaW5kLlN0cnVjdHVyYWwpIHtcbiAgICAgICAgICAgIC8vIElmIHRoaXMgaXMgYSBzdHJ1Y3R1cmFsIGRpcmVjdGl2ZSB0ZW1wbGF0ZSwgZG9uJ3QgcmVjb3JkIGFueXRoaW5nIHlldC4gSW5zdGVhZCBwYXNzXG4gICAgICAgICAgICAvLyB0aGUgY3VycmVudCB0ZW1wbGF0ZSBhcyBhIHBlbmRpbmcgc3RydWN0dXJhbCBkaXJlY3RpdmUgdG8gYmUgcmVjb3JkZWQgd2hlbiB3ZSBmaW5kXG4gICAgICAgICAgICAvLyB0aGUgZWxlbWVudCwgY29udGVudCwgb3IgdGVtcGxhdGUgaXQgYmVsb25ncyB0by4gVGhpcyBhbGxvd3MgdXMgdG8gY3JlYXRlIGNvbWJpbmVkXG4gICAgICAgICAgICAvLyB2YWx1ZXMgdGhhdCByZXByZXNlbnQsIGUuZy4gdGhlIHN0YXJ0IG9mIGEgdGVtcGxhdGUgYW5kIGVsZW1lbnQgYXQgdGhlIHNhbWUgdGltZS5cbiAgICAgICAgICAgIHJlc29sdmVQbGFjZWhvbGRlcnNGb3JWaWV3KGpvYiwgdmlldywgaTE4bkNvbnRleHRzLCBlbGVtZW50cywgb3ApO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBJZiB0aGlzIGlzIHNvbWUgb3RoZXIga2luZCBvZiB0ZW1wbGF0ZSwgd2UgY2FuIHJlY29yZCBpdHMgc3RhcnQsIHJlY3Vyc2UgaW50byBpdHNcbiAgICAgICAgICAgIC8vIHZpZXcsIGFuZCB0aGVuIHJlY29yZCBpdHMgZW5kLlxuICAgICAgICAgICAgcmVjb3JkVGVtcGxhdGVTdGFydChcbiAgICAgICAgICAgICAgam9iLFxuICAgICAgICAgICAgICB2aWV3LFxuICAgICAgICAgICAgICBvcC5oYW5kbGUuc2xvdCEsXG4gICAgICAgICAgICAgIG9wLmkxOG5QbGFjZWhvbGRlcixcbiAgICAgICAgICAgICAgY3VycmVudE9wcy5pMThuQ29udGV4dCxcbiAgICAgICAgICAgICAgY3VycmVudE9wcy5pMThuQmxvY2ssXG4gICAgICAgICAgICAgIHBlbmRpbmdTdHJ1Y3R1cmFsRGlyZWN0aXZlLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHJlc29sdmVQbGFjZWhvbGRlcnNGb3JWaWV3KGpvYiwgdmlldywgaTE4bkNvbnRleHRzLCBlbGVtZW50cyk7XG4gICAgICAgICAgICByZWNvcmRUZW1wbGF0ZUNsb3NlKFxuICAgICAgICAgICAgICBqb2IsXG4gICAgICAgICAgICAgIHZpZXcsXG4gICAgICAgICAgICAgIG9wLmhhbmRsZS5zbG90ISxcbiAgICAgICAgICAgICAgb3AuaTE4blBsYWNlaG9sZGVyLFxuICAgICAgICAgICAgICBjdXJyZW50T3BzIS5pMThuQ29udGV4dCxcbiAgICAgICAgICAgICAgY3VycmVudE9wcyEuaTE4bkJsb2NrLFxuICAgICAgICAgICAgICBwZW5kaW5nU3RydWN0dXJhbERpcmVjdGl2ZSxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBwZW5kaW5nU3RydWN0dXJhbERpcmVjdGl2ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIGlyLk9wS2luZC5SZXBlYXRlckNyZWF0ZTpcbiAgICAgICAgaWYgKHBlbmRpbmdTdHJ1Y3R1cmFsRGlyZWN0aXZlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICB0aHJvdyBFcnJvcignQXNzZXJ0aW9uRXJyb3I6IFVuZXhwZWN0ZWQgc3RydWN0dXJhbCBkaXJlY3RpdmUgYXNzb2NpYXRlZCB3aXRoIEBmb3IgYmxvY2snKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBSZXBlYXRlckNyZWF0ZSBoYXMgMyBzbG90czogdGhlIGZpcnN0IGlzIGZvciB0aGUgb3AgaXRzZWxmLCB0aGUgc2Vjb25kIGlzIGZvciB0aGUgQGZvclxuICAgICAgICAvLyB0ZW1wbGF0ZSBhbmQgdGhlIChvcHRpb25hbCkgdGhpcmQgaXMgZm9yIHRoZSBAZW1wdHkgdGVtcGxhdGUuXG4gICAgICAgIGNvbnN0IGZvclNsb3QgPSBvcC5oYW5kbGUuc2xvdCEgKyAxO1xuICAgICAgICBjb25zdCBmb3JWaWV3ID0gam9iLnZpZXdzLmdldChvcC54cmVmKSE7XG4gICAgICAgIC8vIEZpcnN0IHJlY29yZCBhbGwgb2YgdGhlIHBsYWNlaG9sZGVycyBmb3IgdGhlIEBmb3IgdGVtcGxhdGUuXG4gICAgICAgIGlmIChvcC5pMThuUGxhY2Vob2xkZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIC8vIElmIHRoZXJlIGlzIG5vIGkxOG4gcGxhY2Vob2xkZXIsIGp1c3QgcmVjdXJzZSBpbnRvIHRoZSB2aWV3IGluIGNhc2UgaXQgY29udGFpbnMgaTE4blxuICAgICAgICAgIC8vIGJsb2Nrcy5cbiAgICAgICAgICByZXNvbHZlUGxhY2Vob2xkZXJzRm9yVmlldyhqb2IsIGZvclZpZXcsIGkxOG5Db250ZXh0cywgZWxlbWVudHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChjdXJyZW50T3BzID09PSBudWxsKSB7XG4gICAgICAgICAgICB0aHJvdyBFcnJvcignaTE4biB0YWcgcGxhY2Vob2xkZXIgc2hvdWxkIG9ubHkgb2NjdXIgaW5zaWRlIGFuIGkxOG4gYmxvY2snKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmVjb3JkVGVtcGxhdGVTdGFydChcbiAgICAgICAgICAgIGpvYixcbiAgICAgICAgICAgIGZvclZpZXcsXG4gICAgICAgICAgICBmb3JTbG90LFxuICAgICAgICAgICAgb3AuaTE4blBsYWNlaG9sZGVyLFxuICAgICAgICAgICAgY3VycmVudE9wcy5pMThuQ29udGV4dCxcbiAgICAgICAgICAgIGN1cnJlbnRPcHMuaTE4bkJsb2NrLFxuICAgICAgICAgICAgcGVuZGluZ1N0cnVjdHVyYWxEaXJlY3RpdmUsXG4gICAgICAgICAgKTtcbiAgICAgICAgICByZXNvbHZlUGxhY2Vob2xkZXJzRm9yVmlldyhqb2IsIGZvclZpZXcsIGkxOG5Db250ZXh0cywgZWxlbWVudHMpO1xuICAgICAgICAgIHJlY29yZFRlbXBsYXRlQ2xvc2UoXG4gICAgICAgICAgICBqb2IsXG4gICAgICAgICAgICBmb3JWaWV3LFxuICAgICAgICAgICAgZm9yU2xvdCxcbiAgICAgICAgICAgIG9wLmkxOG5QbGFjZWhvbGRlcixcbiAgICAgICAgICAgIGN1cnJlbnRPcHMhLmkxOG5Db250ZXh0LFxuICAgICAgICAgICAgY3VycmVudE9wcyEuaTE4bkJsb2NrLFxuICAgICAgICAgICAgcGVuZGluZ1N0cnVjdHVyYWxEaXJlY3RpdmUsXG4gICAgICAgICAgKTtcbiAgICAgICAgICBwZW5kaW5nU3RydWN0dXJhbERpcmVjdGl2ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICAvLyBUaGVuIGlmIHRoZXJlJ3MgYW4gQGVtcHR5IHRlbXBsYXRlLCBhZGQgaXRzIHBsYWNlaG9sZGVycyBhcyB3ZWxsLlxuICAgICAgICBpZiAob3AuZW1wdHlWaWV3ICE9PSBudWxsKSB7XG4gICAgICAgICAgLy8gUmVwZWF0ZXJDcmVhdGUgaGFzIDMgc2xvdHM6IHRoZSBmaXJzdCBpcyBmb3IgdGhlIG9wIGl0c2VsZiwgdGhlIHNlY29uZCBpcyBmb3IgdGhlIEBmb3JcbiAgICAgICAgICAvLyB0ZW1wbGF0ZSBhbmQgdGhlIChvcHRpb25hbCkgdGhpcmQgaXMgZm9yIHRoZSBAZW1wdHkgdGVtcGxhdGUuXG4gICAgICAgICAgY29uc3QgZW1wdHlTbG90ID0gb3AuaGFuZGxlLnNsb3QhICsgMjtcbiAgICAgICAgICBjb25zdCBlbXB0eVZpZXcgPSBqb2Iudmlld3MuZ2V0KG9wLmVtcHR5VmlldyEpITtcbiAgICAgICAgICBpZiAob3AuZW1wdHlJMThuUGxhY2Vob2xkZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgLy8gSWYgdGhlcmUgaXMgbm8gaTE4biBwbGFjZWhvbGRlciwganVzdCByZWN1cnNlIGludG8gdGhlIHZpZXcgaW4gY2FzZSBpdCBjb250YWlucyBpMThuXG4gICAgICAgICAgICAvLyBibG9ja3MuXG4gICAgICAgICAgICByZXNvbHZlUGxhY2Vob2xkZXJzRm9yVmlldyhqb2IsIGVtcHR5VmlldywgaTE4bkNvbnRleHRzLCBlbGVtZW50cyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50T3BzID09PSBudWxsKSB7XG4gICAgICAgICAgICAgIHRocm93IEVycm9yKCdpMThuIHRhZyBwbGFjZWhvbGRlciBzaG91bGQgb25seSBvY2N1ciBpbnNpZGUgYW4gaTE4biBibG9jaycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVjb3JkVGVtcGxhdGVTdGFydChcbiAgICAgICAgICAgICAgam9iLFxuICAgICAgICAgICAgICBlbXB0eVZpZXcsXG4gICAgICAgICAgICAgIGVtcHR5U2xvdCxcbiAgICAgICAgICAgICAgb3AuZW1wdHlJMThuUGxhY2Vob2xkZXIsXG4gICAgICAgICAgICAgIGN1cnJlbnRPcHMuaTE4bkNvbnRleHQsXG4gICAgICAgICAgICAgIGN1cnJlbnRPcHMuaTE4bkJsb2NrLFxuICAgICAgICAgICAgICBwZW5kaW5nU3RydWN0dXJhbERpcmVjdGl2ZSxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICByZXNvbHZlUGxhY2Vob2xkZXJzRm9yVmlldyhqb2IsIGVtcHR5VmlldywgaTE4bkNvbnRleHRzLCBlbGVtZW50cyk7XG4gICAgICAgICAgICByZWNvcmRUZW1wbGF0ZUNsb3NlKFxuICAgICAgICAgICAgICBqb2IsXG4gICAgICAgICAgICAgIGVtcHR5VmlldyxcbiAgICAgICAgICAgICAgZW1wdHlTbG90LFxuICAgICAgICAgICAgICBvcC5lbXB0eUkxOG5QbGFjZWhvbGRlcixcbiAgICAgICAgICAgICAgY3VycmVudE9wcyEuaTE4bkNvbnRleHQsXG4gICAgICAgICAgICAgIGN1cnJlbnRPcHMhLmkxOG5CbG9jayxcbiAgICAgICAgICAgICAgcGVuZGluZ1N0cnVjdHVyYWxEaXJlY3RpdmUsXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgcGVuZGluZ1N0cnVjdHVyYWxEaXJlY3RpdmUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFJlY29yZHMgYW4gaTE4biBwYXJhbSB2YWx1ZSBmb3IgdGhlIHN0YXJ0IG9mIGFuIGVsZW1lbnQuXG4gKi9cbmZ1bmN0aW9uIHJlY29yZEVsZW1lbnRTdGFydChcbiAgb3A6IGlyLkVsZW1lbnRTdGFydE9wIHwgaXIuUHJvamVjdGlvbk9wLFxuICBpMThuQ29udGV4dDogaXIuSTE4bkNvbnRleHRPcCxcbiAgaTE4bkJsb2NrOiBpci5JMThuU3RhcnRPcCxcbiAgc3RydWN0dXJhbERpcmVjdGl2ZT86IGlyLlRlbXBsYXRlT3AsXG4pIHtcbiAgY29uc3Qge3N0YXJ0TmFtZSwgY2xvc2VOYW1lfSA9IG9wLmkxOG5QbGFjZWhvbGRlciE7XG4gIGxldCBmbGFncyA9IGlyLkkxOG5QYXJhbVZhbHVlRmxhZ3MuRWxlbWVudFRhZyB8IGlyLkkxOG5QYXJhbVZhbHVlRmxhZ3MuT3BlblRhZztcbiAgbGV0IHZhbHVlOiBpci5JMThuUGFyYW1WYWx1ZVsndmFsdWUnXSA9IG9wLmhhbmRsZS5zbG90ITtcbiAgLy8gSWYgdGhlIGVsZW1lbnQgaXMgYXNzb2NpYXRlZCB3aXRoIGEgc3RydWN0dXJhbCBkaXJlY3RpdmUsIHN0YXJ0IGl0IGFzIHdlbGwuXG4gIGlmIChzdHJ1Y3R1cmFsRGlyZWN0aXZlICE9PSB1bmRlZmluZWQpIHtcbiAgICBmbGFncyB8PSBpci5JMThuUGFyYW1WYWx1ZUZsYWdzLlRlbXBsYXRlVGFnO1xuICAgIHZhbHVlID0ge2VsZW1lbnQ6IHZhbHVlLCB0ZW1wbGF0ZTogc3RydWN0dXJhbERpcmVjdGl2ZS5oYW5kbGUuc2xvdCF9O1xuICB9XG4gIC8vIEZvciBzZWxmLWNsb3NpbmcgdGFncywgdGhlcmUgaXMgbm8gY2xvc2UgdGFnIHBsYWNlaG9sZGVyLiBJbnN0ZWFkLCB0aGUgc3RhcnQgdGFnXG4gIC8vIHBsYWNlaG9sZGVyIGFjY291bnRzIGZvciB0aGUgc3RhcnQgYW5kIGNsb3NlIG9mIHRoZSBlbGVtZW50LlxuICBpZiAoIWNsb3NlTmFtZSkge1xuICAgIGZsYWdzIHw9IGlyLkkxOG5QYXJhbVZhbHVlRmxhZ3MuQ2xvc2VUYWc7XG4gIH1cbiAgYWRkUGFyYW0oaTE4bkNvbnRleHQucGFyYW1zLCBzdGFydE5hbWUsIHZhbHVlLCBpMThuQmxvY2suc3ViVGVtcGxhdGVJbmRleCwgZmxhZ3MpO1xufVxuXG4vKipcbiAqIFJlY29yZHMgYW4gaTE4biBwYXJhbSB2YWx1ZSBmb3IgdGhlIGNsb3Npbmcgb2YgYW4gZWxlbWVudC5cbiAqL1xuZnVuY3Rpb24gcmVjb3JkRWxlbWVudENsb3NlKFxuICBvcDogaXIuRWxlbWVudFN0YXJ0T3AgfCBpci5Qcm9qZWN0aW9uT3AsXG4gIGkxOG5Db250ZXh0OiBpci5JMThuQ29udGV4dE9wLFxuICBpMThuQmxvY2s6IGlyLkkxOG5TdGFydE9wLFxuICBzdHJ1Y3R1cmFsRGlyZWN0aXZlPzogaXIuVGVtcGxhdGVPcCxcbikge1xuICBjb25zdCB7Y2xvc2VOYW1lfSA9IG9wLmkxOG5QbGFjZWhvbGRlciE7XG4gIC8vIFNlbGYtY2xvc2luZyB0YWdzIGRvbid0IGhhdmUgYSBjbG9zaW5nIHRhZyBwbGFjZWhvbGRlciwgaW5zdGVhZCB0aGUgZWxlbWVudCBjbG9zaW5nIGlzXG4gIC8vIHJlY29yZGVkIHZpYSBhbiBhZGRpdGlvbmFsIGZsYWcgb24gdGhlIGVsZW1lbnQgc3RhcnQgdmFsdWUuXG4gIGlmIChjbG9zZU5hbWUpIHtcbiAgICBsZXQgZmxhZ3MgPSBpci5JMThuUGFyYW1WYWx1ZUZsYWdzLkVsZW1lbnRUYWcgfCBpci5JMThuUGFyYW1WYWx1ZUZsYWdzLkNsb3NlVGFnO1xuICAgIGxldCB2YWx1ZTogaXIuSTE4blBhcmFtVmFsdWVbJ3ZhbHVlJ10gPSBvcC5oYW5kbGUuc2xvdCE7XG4gICAgLy8gSWYgdGhlIGVsZW1lbnQgaXMgYXNzb2NpYXRlZCB3aXRoIGEgc3RydWN0dXJhbCBkaXJlY3RpdmUsIGNsb3NlIGl0IGFzIHdlbGwuXG4gICAgaWYgKHN0cnVjdHVyYWxEaXJlY3RpdmUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgZmxhZ3MgfD0gaXIuSTE4blBhcmFtVmFsdWVGbGFncy5UZW1wbGF0ZVRhZztcbiAgICAgIHZhbHVlID0ge2VsZW1lbnQ6IHZhbHVlLCB0ZW1wbGF0ZTogc3RydWN0dXJhbERpcmVjdGl2ZS5oYW5kbGUuc2xvdCF9O1xuICAgIH1cbiAgICBhZGRQYXJhbShpMThuQ29udGV4dC5wYXJhbXMsIGNsb3NlTmFtZSwgdmFsdWUsIGkxOG5CbG9jay5zdWJUZW1wbGF0ZUluZGV4LCBmbGFncyk7XG4gIH1cbn1cblxuLyoqXG4gKiBSZWNvcmRzIGFuIGkxOG4gcGFyYW0gdmFsdWUgZm9yIHRoZSBzdGFydCBvZiBhIHRlbXBsYXRlLlxuICovXG5mdW5jdGlvbiByZWNvcmRUZW1wbGF0ZVN0YXJ0KFxuICBqb2I6IENvbXBvbmVudENvbXBpbGF0aW9uSm9iLFxuICB2aWV3OiBWaWV3Q29tcGlsYXRpb25Vbml0LFxuICBzbG90OiBudW1iZXIsXG4gIGkxOG5QbGFjZWhvbGRlcjogaTE4bi5UYWdQbGFjZWhvbGRlciB8IGkxOG4uQmxvY2tQbGFjZWhvbGRlcixcbiAgaTE4bkNvbnRleHQ6IGlyLkkxOG5Db250ZXh0T3AsXG4gIGkxOG5CbG9jazogaXIuSTE4blN0YXJ0T3AsXG4gIHN0cnVjdHVyYWxEaXJlY3RpdmU/OiBpci5UZW1wbGF0ZU9wLFxuKSB7XG4gIGxldCB7c3RhcnROYW1lLCBjbG9zZU5hbWV9ID0gaTE4blBsYWNlaG9sZGVyO1xuICBsZXQgZmxhZ3MgPSBpci5JMThuUGFyYW1WYWx1ZUZsYWdzLlRlbXBsYXRlVGFnIHwgaXIuSTE4blBhcmFtVmFsdWVGbGFncy5PcGVuVGFnO1xuICAvLyBGb3Igc2VsZi1jbG9zaW5nIHRhZ3MsIHRoZXJlIGlzIG5vIGNsb3NlIHRhZyBwbGFjZWhvbGRlci4gSW5zdGVhZCwgdGhlIHN0YXJ0IHRhZ1xuICAvLyBwbGFjZWhvbGRlciBhY2NvdW50cyBmb3IgdGhlIHN0YXJ0IGFuZCBjbG9zZSBvZiB0aGUgZWxlbWVudC5cbiAgaWYgKCFjbG9zZU5hbWUpIHtcbiAgICBmbGFncyB8PSBpci5JMThuUGFyYW1WYWx1ZUZsYWdzLkNsb3NlVGFnO1xuICB9XG4gIC8vIElmIHRoZSB0ZW1wbGF0ZSBpcyBhc3NvY2lhdGVkIHdpdGggYSBzdHJ1Y3R1cmFsIGRpcmVjdGl2ZSwgcmVjb3JkIHRoZSBzdHJ1Y3R1cmFsIGRpcmVjdGl2ZSdzXG4gIC8vIHN0YXJ0IGZpcnN0LiBTaW5jZSB0aGlzIHRlbXBsYXRlIG11c3QgYmUgaW4gdGhlIHN0cnVjdHVyYWwgZGlyZWN0aXZlJ3Mgdmlldywgd2UgY2FuIGp1c3RcbiAgLy8gZGlyZWN0bHkgdXNlIHRoZSBjdXJyZW50IGkxOG4gYmxvY2sncyBzdWItdGVtcGxhdGUgaW5kZXguXG4gIGlmIChzdHJ1Y3R1cmFsRGlyZWN0aXZlICE9PSB1bmRlZmluZWQpIHtcbiAgICBhZGRQYXJhbShcbiAgICAgIGkxOG5Db250ZXh0LnBhcmFtcyxcbiAgICAgIHN0YXJ0TmFtZSxcbiAgICAgIHN0cnVjdHVyYWxEaXJlY3RpdmUuaGFuZGxlLnNsb3QhLFxuICAgICAgaTE4bkJsb2NrLnN1YlRlbXBsYXRlSW5kZXgsXG4gICAgICBmbGFncyxcbiAgICApO1xuICB9XG4gIC8vIFJlY29yZCB0aGUgc3RhcnQgb2YgdGhlIHRlbXBsYXRlLiBGb3IgdGhlIHN1Yi10ZW1wbGF0ZSBpbmRleCwgcGFzcyB0aGUgaW5kZXggZm9yIHRoZSB0ZW1wbGF0ZSdzXG4gIC8vIHZpZXcsIHJhdGhlciB0aGFuIHRoZSBjdXJyZW50IGkxOG4gYmxvY2sncyBpbmRleC5cbiAgYWRkUGFyYW0oXG4gICAgaTE4bkNvbnRleHQucGFyYW1zLFxuICAgIHN0YXJ0TmFtZSxcbiAgICBzbG90LFxuICAgIGdldFN1YlRlbXBsYXRlSW5kZXhGb3JUZW1wbGF0ZVRhZyhqb2IsIGkxOG5CbG9jaywgdmlldyksXG4gICAgZmxhZ3MsXG4gICk7XG59XG5cbi8qKlxuICogUmVjb3JkcyBhbiBpMThuIHBhcmFtIHZhbHVlIGZvciB0aGUgY2xvc2luZyBvZiBhIHRlbXBsYXRlLlxuICovXG5mdW5jdGlvbiByZWNvcmRUZW1wbGF0ZUNsb3NlKFxuICBqb2I6IENvbXBvbmVudENvbXBpbGF0aW9uSm9iLFxuICB2aWV3OiBWaWV3Q29tcGlsYXRpb25Vbml0LFxuICBzbG90OiBudW1iZXIsXG4gIGkxOG5QbGFjZWhvbGRlcjogaTE4bi5UYWdQbGFjZWhvbGRlciB8IGkxOG4uQmxvY2tQbGFjZWhvbGRlcixcbiAgaTE4bkNvbnRleHQ6IGlyLkkxOG5Db250ZXh0T3AsXG4gIGkxOG5CbG9jazogaXIuSTE4blN0YXJ0T3AsXG4gIHN0cnVjdHVyYWxEaXJlY3RpdmU/OiBpci5UZW1wbGF0ZU9wLFxuKSB7XG4gIGNvbnN0IHtjbG9zZU5hbWV9ID0gaTE4blBsYWNlaG9sZGVyO1xuICBjb25zdCBmbGFncyA9IGlyLkkxOG5QYXJhbVZhbHVlRmxhZ3MuVGVtcGxhdGVUYWcgfCBpci5JMThuUGFyYW1WYWx1ZUZsYWdzLkNsb3NlVGFnO1xuICAvLyBTZWxmLWNsb3NpbmcgdGFncyBkb24ndCBoYXZlIGEgY2xvc2luZyB0YWcgcGxhY2Vob2xkZXIsIGluc3RlYWQgdGhlIHRlbXBsYXRlJ3MgY2xvc2luZyBpc1xuICAvLyByZWNvcmRlZCB2aWEgYW4gYWRkaXRpb25hbCBmbGFnIG9uIHRoZSB0ZW1wbGF0ZSBzdGFydCB2YWx1ZS5cbiAgaWYgKGNsb3NlTmFtZSkge1xuICAgIC8vIFJlY29yZCB0aGUgY2xvc2luZyBvZiB0aGUgdGVtcGxhdGUuIEZvciB0aGUgc3ViLXRlbXBsYXRlIGluZGV4LCBwYXNzIHRoZSBpbmRleCBmb3IgdGhlXG4gICAgLy8gdGVtcGxhdGUncyB2aWV3LCByYXRoZXIgdGhhbiB0aGUgY3VycmVudCBpMThuIGJsb2NrJ3MgaW5kZXguXG4gICAgYWRkUGFyYW0oXG4gICAgICBpMThuQ29udGV4dC5wYXJhbXMsXG4gICAgICBjbG9zZU5hbWUsXG4gICAgICBzbG90LFxuICAgICAgZ2V0U3ViVGVtcGxhdGVJbmRleEZvclRlbXBsYXRlVGFnKGpvYiwgaTE4bkJsb2NrLCB2aWV3KSxcbiAgICAgIGZsYWdzLFxuICAgICk7XG4gICAgLy8gSWYgdGhlIHRlbXBsYXRlIGlzIGFzc29jaWF0ZWQgd2l0aCBhIHN0cnVjdHVyYWwgZGlyZWN0aXZlLCByZWNvcmQgdGhlIHN0cnVjdHVyYWwgZGlyZWN0aXZlJ3NcbiAgICAvLyBjbG9zaW5nIGFmdGVyLiBTaW5jZSB0aGlzIHRlbXBsYXRlIG11c3QgYmUgaW4gdGhlIHN0cnVjdHVyYWwgZGlyZWN0aXZlJ3Mgdmlldywgd2UgY2FuIGp1c3RcbiAgICAvLyBkaXJlY3RseSB1c2UgdGhlIGN1cnJlbnQgaTE4biBibG9jaydzIHN1Yi10ZW1wbGF0ZSBpbmRleC5cbiAgICBpZiAoc3RydWN0dXJhbERpcmVjdGl2ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBhZGRQYXJhbShcbiAgICAgICAgaTE4bkNvbnRleHQucGFyYW1zLFxuICAgICAgICBjbG9zZU5hbWUsXG4gICAgICAgIHN0cnVjdHVyYWxEaXJlY3RpdmUuaGFuZGxlLnNsb3QhLFxuICAgICAgICBpMThuQmxvY2suc3ViVGVtcGxhdGVJbmRleCxcbiAgICAgICAgZmxhZ3MsXG4gICAgICApO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEdldCB0aGUgc3ViVGVtcGxhdGVJbmRleCBmb3IgdGhlIGdpdmVuIHRlbXBsYXRlIG9wLiBGb3IgdGVtcGxhdGUgb3BzLCB1c2UgdGhlIHN1YlRlbXBsYXRlSW5kZXggb2ZcbiAqIHRoZSBjaGlsZCBpMThuIGJsb2NrIGluc2lkZSB0aGUgdGVtcGxhdGUuXG4gKi9cbmZ1bmN0aW9uIGdldFN1YlRlbXBsYXRlSW5kZXhGb3JUZW1wbGF0ZVRhZyhcbiAgam9iOiBDb21wb25lbnRDb21waWxhdGlvbkpvYixcbiAgaTE4bk9wOiBpci5JMThuU3RhcnRPcCxcbiAgdmlldzogVmlld0NvbXBpbGF0aW9uVW5pdCxcbik6IG51bWJlciB8IG51bGwge1xuICBmb3IgKGNvbnN0IGNoaWxkT3Agb2Ygdmlldy5jcmVhdGUpIHtcbiAgICBpZiAoY2hpbGRPcC5raW5kID09PSBpci5PcEtpbmQuSTE4blN0YXJ0KSB7XG4gICAgICByZXR1cm4gY2hpbGRPcC5zdWJUZW1wbGF0ZUluZGV4O1xuICAgIH1cbiAgfVxuICByZXR1cm4gaTE4bk9wLnN1YlRlbXBsYXRlSW5kZXg7XG59XG5cbi8qKlxuICogQWRkIGEgcGFyYW0gdmFsdWUgdG8gdGhlIGdpdmVuIHBhcmFtcyBtYXAuXG4gKi9cbmZ1bmN0aW9uIGFkZFBhcmFtKFxuICBwYXJhbXM6IE1hcDxzdHJpbmcsIGlyLkkxOG5QYXJhbVZhbHVlW10+LFxuICBwbGFjZWhvbGRlcjogc3RyaW5nLFxuICB2YWx1ZTogc3RyaW5nIHwgbnVtYmVyIHwge2VsZW1lbnQ6IG51bWJlcjsgdGVtcGxhdGU6IG51bWJlcn0sXG4gIHN1YlRlbXBsYXRlSW5kZXg6IG51bWJlciB8IG51bGwsXG4gIGZsYWdzOiBpci5JMThuUGFyYW1WYWx1ZUZsYWdzLFxuKSB7XG4gIGNvbnN0IHZhbHVlcyA9IHBhcmFtcy5nZXQocGxhY2Vob2xkZXIpID8/IFtdO1xuICB2YWx1ZXMucHVzaCh7dmFsdWUsIHN1YlRlbXBsYXRlSW5kZXgsIGZsYWdzfSk7XG4gIHBhcmFtcy5zZXQocGxhY2Vob2xkZXIsIHZhbHVlcyk7XG59XG4iXX0=