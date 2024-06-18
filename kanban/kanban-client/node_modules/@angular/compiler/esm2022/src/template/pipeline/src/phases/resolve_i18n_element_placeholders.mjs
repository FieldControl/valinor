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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb2x2ZV9pMThuX2VsZW1lbnRfcGxhY2Vob2xkZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3RlbXBsYXRlL3BpcGVsaW5lL3NyYy9waGFzZXMvcmVzb2x2ZV9pMThuX2VsZW1lbnRfcGxhY2Vob2xkZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUdILE9BQU8sS0FBSyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRy9COztHQUVHO0FBQ0gsTUFBTSxVQUFVLDhCQUE4QixDQUFDLEdBQTRCO0lBQ3pFLGdFQUFnRTtJQUNoRSxNQUFNLFlBQVksR0FBRyxJQUFJLEdBQUcsRUFBK0IsQ0FBQztJQUM1RCxNQUFNLFFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBZ0MsQ0FBQztJQUN6RCxLQUFLLE1BQU0sSUFBSSxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM3QixLQUFLLE1BQU0sRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUM3QixRQUFRLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDaEIsS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLFdBQVc7b0JBQ3hCLFlBQVksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztvQkFDOUIsTUFBTTtnQkFDUixLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsWUFBWTtvQkFDekIsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO29CQUMxQixNQUFNO1lBQ1YsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0lBRUQsMEJBQTBCLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQ3BFLENBQUM7QUFFRDs7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V0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ2xDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgaTE4biBmcm9tICcuLi8uLi8uLi8uLi9pMThuL2kxOG5fYXN0JztcbmltcG9ydCAqIGFzIGlyIGZyb20gJy4uLy4uL2lyJztcbmltcG9ydCB7Q29tcG9uZW50Q29tcGlsYXRpb25Kb2IsIFZpZXdDb21waWxhdGlvblVuaXR9IGZyb20gJy4uL2NvbXBpbGF0aW9uJztcblxuLyoqXG4gKiBSZXNvbHZlIHRoZSBlbGVtZW50IHBsYWNlaG9sZGVycyBpbiBpMThuIG1lc3NhZ2VzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZUkxOG5FbGVtZW50UGxhY2Vob2xkZXJzKGpvYjogQ29tcG9uZW50Q29tcGlsYXRpb25Kb2IpIHtcbiAgLy8gUmVjb3JkIGFsbCBvZiB0aGUgZWxlbWVudCBhbmQgaTE4biBjb250ZXh0IG9wcyBmb3IgdXNlIGxhdGVyLlxuICBjb25zdCBpMThuQ29udGV4dHMgPSBuZXcgTWFwPGlyLlhyZWZJZCwgaXIuSTE4bkNvbnRleHRPcD4oKTtcbiAgY29uc3QgZWxlbWVudHMgPSBuZXcgTWFwPGlyLlhyZWZJZCwgaXIuRWxlbWVudFN0YXJ0T3A+KCk7XG4gIGZvciAoY29uc3QgdW5pdCBvZiBqb2IudW5pdHMpIHtcbiAgICBmb3IgKGNvbnN0IG9wIG9mIHVuaXQuY3JlYXRlKSB7XG4gICAgICBzd2l0Y2ggKG9wLmtpbmQpIHtcbiAgICAgICAgY2FzZSBpci5PcEtpbmQuSTE4bkNvbnRleHQ6XG4gICAgICAgICAgaTE4bkNvbnRleHRzLnNldChvcC54cmVmLCBvcCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgaXIuT3BLaW5kLkVsZW1lbnRTdGFydDpcbiAgICAgICAgICBlbGVtZW50cy5zZXQob3AueHJlZiwgb3ApO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJlc29sdmVQbGFjZWhvbGRlcnNGb3JWaWV3KGpvYiwgam9iLnJvb3QsIGkxOG5Db250ZXh0cywgZWxlbWVudHMpO1xufVxuXG4vKipcbiAqIFJlY3Vyc2l2ZWx5IHJlc29sdmVzIGVsZW1lbnQgYW5kIHRlbXBsYXRlIHRhZyBwbGFjZWhvbGRlcnMgaW4gdGhlIGdpdmVuIHZpZXcuXG4gKi9cbmZ1bmN0aW9uIHJlc29sdmVQbGFjZWhvbGRlcnNGb3JWaWV3KFxuICBqb2I6IENvbXBvbmVudENvbXBpbGF0aW9uSm9iLFxuICB1bml0OiBWaWV3Q29tcGlsYXRpb25Vbml0LFxuICBpMThuQ29udGV4dHM6IE1hcDxpci5YcmVmSWQsIGlyLkkxOG5Db250ZXh0T3A+LFxuICBlbGVtZW50czogTWFwPGlyLlhyZWZJZCwgaXIuRWxlbWVudFN0YXJ0T3A+LFxuICBwZW5kaW5nU3RydWN0dXJhbERpcmVjdGl2ZT86IGlyLlRlbXBsYXRlT3AsXG4pIHtcbiAgLy8gVHJhY2sgdGhlIGN1cnJlbnQgaTE4biBvcCBhbmQgY29ycmVzcG9uZGluZyBpMThuIGNvbnRleHQgb3AgYXMgd2Ugc3RlcCB0aHJvdWdoIHRoZSBjcmVhdGlvblxuICAvLyBJUi5cbiAgbGV0IGN1cnJlbnRPcHM6IHtpMThuQmxvY2s6IGlyLkkxOG5TdGFydE9wOyBpMThuQ29udGV4dDogaXIuSTE4bkNvbnRleHRPcH0gfCBudWxsID0gbnVsbDtcbiAgbGV0IHBlbmRpbmdTdHJ1Y3R1cmFsRGlyZWN0aXZlQ2xvc2VzID0gbmV3IE1hcDxpci5YcmVmSWQsIGlyLlRlbXBsYXRlT3A+KCk7XG4gIGZvciAoY29uc3Qgb3Agb2YgdW5pdC5jcmVhdGUpIHtcbiAgICBzd2l0Y2ggKG9wLmtpbmQpIHtcbiAgICAgIGNhc2UgaXIuT3BLaW5kLkkxOG5TdGFydDpcbiAgICAgICAgaWYgKCFvcC5jb250ZXh0KSB7XG4gICAgICAgICAgdGhyb3cgRXJyb3IoJ0NvdWxkIG5vdCBmaW5kIGkxOG4gY29udGV4dCBmb3IgaTE4biBvcCcpO1xuICAgICAgICB9XG4gICAgICAgIGN1cnJlbnRPcHMgPSB7aTE4bkJsb2NrOiBvcCwgaTE4bkNvbnRleHQ6IGkxOG5Db250ZXh0cy5nZXQob3AuY29udGV4dCkhfTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIGlyLk9wS2luZC5JMThuRW5kOlxuICAgICAgICBjdXJyZW50T3BzID0gbnVsbDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIGlyLk9wS2luZC5FbGVtZW50U3RhcnQ6XG4gICAgICAgIC8vIEZvciBlbGVtZW50cyB3aXRoIGkxOG4gcGxhY2Vob2xkZXJzLCByZWNvcmQgaXRzIHNsb3QgdmFsdWUgaW4gdGhlIHBhcmFtcyBtYXAgdW5kZXIgdGhlXG4gICAgICAgIC8vIGNvcnJlc3BvbmRpbmcgdGFnIHN0YXJ0IHBsYWNlaG9sZGVyLlxuICAgICAgICBpZiAob3AuaTE4blBsYWNlaG9sZGVyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBpZiAoY3VycmVudE9wcyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdGhyb3cgRXJyb3IoJ2kxOG4gdGFnIHBsYWNlaG9sZGVyIHNob3VsZCBvbmx5IG9jY3VyIGluc2lkZSBhbiBpMThuIGJsb2NrJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJlY29yZEVsZW1lbnRTdGFydChcbiAgICAgICAgICAgIG9wLFxuICAgICAgICAgICAgY3VycmVudE9wcy5pMThuQ29udGV4dCxcbiAgICAgICAgICAgIGN1cnJlbnRPcHMuaTE4bkJsb2NrLFxuICAgICAgICAgICAgcGVuZGluZ1N0cnVjdHVyYWxEaXJlY3RpdmUsXG4gICAgICAgICAgKTtcbiAgICAgICAgICAvLyBJZiB0aGVyZSBpcyBhIHNlcGFyYXRlIGNsb3NlIHRhZyBwbGFjZWhvbGRlciBmb3IgdGhpcyBlbGVtZW50LCBzYXZlIHRoZSBwZW5kaW5nXG4gICAgICAgICAgLy8gc3RydWN0dXJhbCBkaXJlY3RpdmUgc28gd2UgY2FuIHBhc3MgaXQgdG8gdGhlIGNsb3NpbmcgdGFnIGFzIHdlbGwuXG4gICAgICAgICAgaWYgKHBlbmRpbmdTdHJ1Y3R1cmFsRGlyZWN0aXZlICYmIG9wLmkxOG5QbGFjZWhvbGRlci5jbG9zZU5hbWUpIHtcbiAgICAgICAgICAgIHBlbmRpbmdTdHJ1Y3R1cmFsRGlyZWN0aXZlQ2xvc2VzLnNldChvcC54cmVmLCBwZW5kaW5nU3RydWN0dXJhbERpcmVjdGl2ZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIENsZWFyIG91dCB0aGUgcGVuZGluZyBzdHJ1Y3R1cmFsIGRpcmVjdGl2ZSBub3cgdGhhdCBpdHMgYmVlbiBhY2NvdW50ZWQgZm9yLlxuICAgICAgICAgIHBlbmRpbmdTdHJ1Y3R1cmFsRGlyZWN0aXZlID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBpci5PcEtpbmQuRWxlbWVudEVuZDpcbiAgICAgICAgLy8gRm9yIGVsZW1lbnRzIHdpdGggaTE4biBwbGFjZWhvbGRlcnMsIHJlY29yZCBpdHMgc2xvdCB2YWx1ZSBpbiB0aGUgcGFyYW1zIG1hcCB1bmRlciB0aGVcbiAgICAgICAgLy8gY29ycmVzcG9uZGluZyB0YWcgY2xvc2UgcGxhY2Vob2xkZXIuXG4gICAgICAgIGNvbnN0IHN0YXJ0T3AgPSBlbGVtZW50cy5nZXQob3AueHJlZik7XG4gICAgICAgIGlmIChzdGFydE9wICYmIHN0YXJ0T3AuaTE4blBsYWNlaG9sZGVyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBpZiAoY3VycmVudE9wcyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdGhyb3cgRXJyb3IoXG4gICAgICAgICAgICAgICdBc3NlcnRpb25FcnJvcjogaTE4biB0YWcgcGxhY2Vob2xkZXIgc2hvdWxkIG9ubHkgb2NjdXIgaW5zaWRlIGFuIGkxOG4gYmxvY2snLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmVjb3JkRWxlbWVudENsb3NlKFxuICAgICAgICAgICAgc3RhcnRPcCxcbiAgICAgICAgICAgIGN1cnJlbnRPcHMuaTE4bkNvbnRleHQsXG4gICAgICAgICAgICBjdXJyZW50T3BzLmkxOG5CbG9jayxcbiAgICAgICAgICAgIHBlbmRpbmdTdHJ1Y3R1cmFsRGlyZWN0aXZlQ2xvc2VzLmdldChvcC54cmVmKSxcbiAgICAgICAgICApO1xuICAgICAgICAgIC8vIENsZWFyIG91dCB0aGUgcGVuZGluZyBzdHJ1Y3R1cmFsIGRpcmVjdGl2ZSBjbG9zZSB0aGF0IHdhcyBhY2NvdW50ZWQgZm9yLlxuICAgICAgICAgIHBlbmRpbmdTdHJ1Y3R1cmFsRGlyZWN0aXZlQ2xvc2VzLmRlbGV0ZShvcC54cmVmKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgaXIuT3BLaW5kLlByb2plY3Rpb246XG4gICAgICAgIC8vIEZvciBjb250ZW50IHByb2plY3Rpb25zIHdpdGggaTE4biBwbGFjZWhvbGRlcnMsIHJlY29yZCBpdHMgc2xvdCB2YWx1ZSBpbiB0aGUgcGFyYW1zIG1hcFxuICAgICAgICAvLyB1bmRlciB0aGUgY29ycmVzcG9uZGluZyB0YWcgc3RhcnQgYW5kIGNsb3NlIHBsYWNlaG9sZGVycy5cbiAgICAgICAgaWYgKG9wLmkxOG5QbGFjZWhvbGRlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgaWYgKGN1cnJlbnRPcHMgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRocm93IEVycm9yKCdpMThuIHRhZyBwbGFjZWhvbGRlciBzaG91bGQgb25seSBvY2N1ciBpbnNpZGUgYW4gaTE4biBibG9jaycpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZWNvcmRFbGVtZW50U3RhcnQoXG4gICAgICAgICAgICBvcCxcbiAgICAgICAgICAgIGN1cnJlbnRPcHMuaTE4bkNvbnRleHQsXG4gICAgICAgICAgICBjdXJyZW50T3BzLmkxOG5CbG9jayxcbiAgICAgICAgICAgIHBlbmRpbmdTdHJ1Y3R1cmFsRGlyZWN0aXZlLFxuICAgICAgICAgICk7XG4gICAgICAgICAgcmVjb3JkRWxlbWVudENsb3NlKFxuICAgICAgICAgICAgb3AsXG4gICAgICAgICAgICBjdXJyZW50T3BzLmkxOG5Db250ZXh0LFxuICAgICAgICAgICAgY3VycmVudE9wcy5pMThuQmxvY2ssXG4gICAgICAgICAgICBwZW5kaW5nU3RydWN0dXJhbERpcmVjdGl2ZSxcbiAgICAgICAgICApO1xuICAgICAgICAgIC8vIENsZWFyIG91dCB0aGUgcGVuZGluZyBzdHJ1Y3R1cmFsIGRpcmVjdGl2ZSBub3cgdGhhdCBpdHMgYmVlbiBhY2NvdW50ZWQgZm9yLlxuICAgICAgICAgIHBlbmRpbmdTdHJ1Y3R1cmFsRGlyZWN0aXZlID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBpci5PcEtpbmQuVGVtcGxhdGU6XG4gICAgICAgIGNvbnN0IHZpZXcgPSBqb2Iudmlld3MuZ2V0KG9wLnhyZWYpITtcbiAgICAgICAgaWYgKG9wLmkxOG5QbGFjZWhvbGRlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgLy8gSWYgdGhlcmUgaXMgbm8gaTE4biBwbGFjZWhvbGRlciwganVzdCByZWN1cnNlIGludG8gdGhlIHZpZXcgaW4gY2FzZSBpdCBjb250YWlucyBpMThuXG4gICAgICAgICAgLy8gYmxvY2tzLlxuICAgICAgICAgIHJlc29sdmVQbGFjZWhvbGRlcnNGb3JWaWV3KGpvYiwgdmlldywgaTE4bkNvbnRleHRzLCBlbGVtZW50cyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKGN1cnJlbnRPcHMgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRocm93IEVycm9yKCdpMThuIHRhZyBwbGFjZWhvbGRlciBzaG91bGQgb25seSBvY2N1ciBpbnNpZGUgYW4gaTE4biBibG9jaycpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAob3AudGVtcGxhdGVLaW5kID09PSBpci5UZW1wbGF0ZUtpbmQuU3RydWN0dXJhbCkge1xuICAgICAgICAgICAgLy8gSWYgdGhpcyBpcyBhIHN0cnVjdHVyYWwgZGlyZWN0aXZlIHRlbXBsYXRlLCBkb24ndCByZWNvcmQgYW55dGhpbmcgeWV0LiBJbnN0ZWFkIHBhc3NcbiAgICAgICAgICAgIC8vIHRoZSBjdXJyZW50IHRlbXBsYXRlIGFzIGEgcGVuZGluZyBzdHJ1Y3R1cmFsIGRpcmVjdGl2ZSB0byBiZSByZWNvcmRlZCB3aGVuIHdlIGZpbmRcbiAgICAgICAgICAgIC8vIHRoZSBlbGVtZW50LCBjb250ZW50LCBvciB0ZW1wbGF0ZSBpdCBiZWxvbmdzIHRvLiBUaGlzIGFsbG93cyB1cyB0byBjcmVhdGUgY29tYmluZWRcbiAgICAgICAgICAgIC8vIHZhbHVlcyB0aGF0IHJlcHJlc2VudCwgZS5nLiB0aGUgc3RhcnQgb2YgYSB0ZW1wbGF0ZSBhbmQgZWxlbWVudCBhdCB0aGUgc2FtZSB0aW1lLlxuICAgICAgICAgICAgcmVzb2x2ZVBsYWNlaG9sZGVyc0ZvclZpZXcoam9iLCB2aWV3LCBpMThuQ29udGV4dHMsIGVsZW1lbnRzLCBvcCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIElmIHRoaXMgaXMgc29tZSBvdGhlciBraW5kIG9mIHRlbXBsYXRlLCB3ZSBjYW4gcmVjb3JkIGl0cyBzdGFydCwgcmVjdXJzZSBpbnRvIGl0c1xuICAgICAgICAgICAgLy8gdmlldywgYW5kIHRoZW4gcmVjb3JkIGl0cyBlbmQuXG4gICAgICAgICAgICByZWNvcmRUZW1wbGF0ZVN0YXJ0KFxuICAgICAgICAgICAgICBqb2IsXG4gICAgICAgICAgICAgIHZpZXcsXG4gICAgICAgICAgICAgIG9wLmhhbmRsZS5zbG90ISxcbiAgICAgICAgICAgICAgb3AuaTE4blBsYWNlaG9sZGVyLFxuICAgICAgICAgICAgICBjdXJyZW50T3BzLmkxOG5Db250ZXh0LFxuICAgICAgICAgICAgICBjdXJyZW50T3BzLmkxOG5CbG9jayxcbiAgICAgICAgICAgICAgcGVuZGluZ1N0cnVjdHVyYWxEaXJlY3RpdmUsXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgcmVzb2x2ZVBsYWNlaG9sZGVyc0ZvclZpZXcoam9iLCB2aWV3LCBpMThuQ29udGV4dHMsIGVsZW1lbnRzKTtcbiAgICAgICAgICAgIHJlY29yZFRlbXBsYXRlQ2xvc2UoXG4gICAgICAgICAgICAgIGpvYixcbiAgICAgICAgICAgICAgdmlldyxcbiAgICAgICAgICAgICAgb3AuaGFuZGxlLnNsb3QhLFxuICAgICAgICAgICAgICBvcC5pMThuUGxhY2Vob2xkZXIsXG4gICAgICAgICAgICAgIGN1cnJlbnRPcHMhLmkxOG5Db250ZXh0LFxuICAgICAgICAgICAgICBjdXJyZW50T3BzIS5pMThuQmxvY2ssXG4gICAgICAgICAgICAgIHBlbmRpbmdTdHJ1Y3R1cmFsRGlyZWN0aXZlLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHBlbmRpbmdTdHJ1Y3R1cmFsRGlyZWN0aXZlID0gdW5kZWZpbmVkO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgaXIuT3BLaW5kLlJlcGVhdGVyQ3JlYXRlOlxuICAgICAgICBpZiAocGVuZGluZ1N0cnVjdHVyYWxEaXJlY3RpdmUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHRocm93IEVycm9yKCdBc3NlcnRpb25FcnJvcjogVW5leHBlY3RlZCBzdHJ1Y3R1cmFsIGRpcmVjdGl2ZSBhc3NvY2lhdGVkIHdpdGggQGZvciBibG9jaycpO1xuICAgICAgICB9XG4gICAgICAgIC8vIFJlcGVhdGVyQ3JlYXRlIGhhcyAzIHNsb3RzOiB0aGUgZmlyc3QgaXMgZm9yIHRoZSBvcCBpdHNlbGYsIHRoZSBzZWNvbmQgaXMgZm9yIHRoZSBAZm9yXG4gICAgICAgIC8vIHRlbXBsYXRlIGFuZCB0aGUgKG9wdGlvbmFsKSB0aGlyZCBpcyBmb3IgdGhlIEBlbXB0eSB0ZW1wbGF0ZS5cbiAgICAgICAgY29uc3QgZm9yU2xvdCA9IG9wLmhhbmRsZS5zbG90ISArIDE7XG4gICAgICAgIGNvbnN0IGZvclZpZXcgPSBqb2Iudmlld3MuZ2V0KG9wLnhyZWYpITtcbiAgICAgICAgLy8gRmlyc3QgcmVjb3JkIGFsbCBvZiB0aGUgcGxhY2Vob2xkZXJzIGZvciB0aGUgQGZvciB0ZW1wbGF0ZS5cbiAgICAgICAgaWYgKG9wLmkxOG5QbGFjZWhvbGRlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgLy8gSWYgdGhlcmUgaXMgbm8gaTE4biBwbGFjZWhvbGRlciwganVzdCByZWN1cnNlIGludG8gdGhlIHZpZXcgaW4gY2FzZSBpdCBjb250YWlucyBpMThuXG4gICAgICAgICAgLy8gYmxvY2tzLlxuICAgICAgICAgIHJlc29sdmVQbGFjZWhvbGRlcnNGb3JWaWV3KGpvYiwgZm9yVmlldywgaTE4bkNvbnRleHRzLCBlbGVtZW50cyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKGN1cnJlbnRPcHMgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRocm93IEVycm9yKCdpMThuIHRhZyBwbGFjZWhvbGRlciBzaG91bGQgb25seSBvY2N1ciBpbnNpZGUgYW4gaTE4biBibG9jaycpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZWNvcmRUZW1wbGF0ZVN0YXJ0KFxuICAgICAgICAgICAgam9iLFxuICAgICAgICAgICAgZm9yVmlldyxcbiAgICAgICAgICAgIGZvclNsb3QsXG4gICAgICAgICAgICBvcC5pMThuUGxhY2Vob2xkZXIsXG4gICAgICAgICAgICBjdXJyZW50T3BzLmkxOG5Db250ZXh0LFxuICAgICAgICAgICAgY3VycmVudE9wcy5pMThuQmxvY2ssXG4gICAgICAgICAgICBwZW5kaW5nU3RydWN0dXJhbERpcmVjdGl2ZSxcbiAgICAgICAgICApO1xuICAgICAgICAgIHJlc29sdmVQbGFjZWhvbGRlcnNGb3JWaWV3KGpvYiwgZm9yVmlldywgaTE4bkNvbnRleHRzLCBlbGVtZW50cyk7XG4gICAgICAgICAgcmVjb3JkVGVtcGxhdGVDbG9zZShcbiAgICAgICAgICAgIGpvYixcbiAgICAgICAgICAgIGZvclZpZXcsXG4gICAgICAgICAgICBmb3JTbG90LFxuICAgICAgICAgICAgb3AuaTE4blBsYWNlaG9sZGVyLFxuICAgICAgICAgICAgY3VycmVudE9wcyEuaTE4bkNvbnRleHQsXG4gICAgICAgICAgICBjdXJyZW50T3BzIS5pMThuQmxvY2ssXG4gICAgICAgICAgICBwZW5kaW5nU3RydWN0dXJhbERpcmVjdGl2ZSxcbiAgICAgICAgICApO1xuICAgICAgICAgIHBlbmRpbmdTdHJ1Y3R1cmFsRGlyZWN0aXZlID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIC8vIFRoZW4gaWYgdGhlcmUncyBhbiBAZW1wdHkgdGVtcGxhdGUsIGFkZCBpdHMgcGxhY2Vob2xkZXJzIGFzIHdlbGwuXG4gICAgICAgIGlmIChvcC5lbXB0eVZpZXcgIT09IG51bGwpIHtcbiAgICAgICAgICAvLyBSZXBlYXRlckNyZWF0ZSBoYXMgMyBzbG90czogdGhlIGZpcnN0IGlzIGZvciB0aGUgb3AgaXRzZWxmLCB0aGUgc2Vjb25kIGlzIGZvciB0aGUgQGZvclxuICAgICAgICAgIC8vIHRlbXBsYXRlIGFuZCB0aGUgKG9wdGlvbmFsKSB0aGlyZCBpcyBmb3IgdGhlIEBlbXB0eSB0ZW1wbGF0ZS5cbiAgICAgICAgICBjb25zdCBlbXB0eVNsb3QgPSBvcC5oYW5kbGUuc2xvdCEgKyAyO1xuICAgICAgICAgIGNvbnN0IGVtcHR5VmlldyA9IGpvYi52aWV3cy5nZXQob3AuZW1wdHlWaWV3ISkhO1xuICAgICAgICAgIGlmIChvcC5lbXB0eUkxOG5QbGFjZWhvbGRlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAvLyBJZiB0aGVyZSBpcyBubyBpMThuIHBsYWNlaG9sZGVyLCBqdXN0IHJlY3Vyc2UgaW50byB0aGUgdmlldyBpbiBjYXNlIGl0IGNvbnRhaW5zIGkxOG5cbiAgICAgICAgICAgIC8vIGJsb2Nrcy5cbiAgICAgICAgICAgIHJlc29sdmVQbGFjZWhvbGRlcnNGb3JWaWV3KGpvYiwgZW1wdHlWaWV3LCBpMThuQ29udGV4dHMsIGVsZW1lbnRzKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRPcHMgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgdGhyb3cgRXJyb3IoJ2kxOG4gdGFnIHBsYWNlaG9sZGVyIHNob3VsZCBvbmx5IG9jY3VyIGluc2lkZSBhbiBpMThuIGJsb2NrJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZWNvcmRUZW1wbGF0ZVN0YXJ0KFxuICAgICAgICAgICAgICBqb2IsXG4gICAgICAgICAgICAgIGVtcHR5VmlldyxcbiAgICAgICAgICAgICAgZW1wdHlTbG90LFxuICAgICAgICAgICAgICBvcC5lbXB0eUkxOG5QbGFjZWhvbGRlcixcbiAgICAgICAgICAgICAgY3VycmVudE9wcy5pMThuQ29udGV4dCxcbiAgICAgICAgICAgICAgY3VycmVudE9wcy5pMThuQmxvY2ssXG4gICAgICAgICAgICAgIHBlbmRpbmdTdHJ1Y3R1cmFsRGlyZWN0aXZlLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHJlc29sdmVQbGFjZWhvbGRlcnNGb3JWaWV3KGpvYiwgZW1wdHlWaWV3LCBpMThuQ29udGV4dHMsIGVsZW1lbnRzKTtcbiAgICAgICAgICAgIHJlY29yZFRlbXBsYXRlQ2xvc2UoXG4gICAgICAgICAgICAgIGpvYixcbiAgICAgICAgICAgICAgZW1wdHlWaWV3LFxuICAgICAgICAgICAgICBlbXB0eVNsb3QsXG4gICAgICAgICAgICAgIG9wLmVtcHR5STE4blBsYWNlaG9sZGVyLFxuICAgICAgICAgICAgICBjdXJyZW50T3BzIS5pMThuQ29udGV4dCxcbiAgICAgICAgICAgICAgY3VycmVudE9wcyEuaTE4bkJsb2NrLFxuICAgICAgICAgICAgICBwZW5kaW5nU3RydWN0dXJhbERpcmVjdGl2ZSxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBwZW5kaW5nU3RydWN0dXJhbERpcmVjdGl2ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogUmVjb3JkcyBhbiBpMThuIHBhcmFtIHZhbHVlIGZvciB0aGUgc3RhcnQgb2YgYW4gZWxlbWVudC5cbiAqL1xuZnVuY3Rpb24gcmVjb3JkRWxlbWVudFN0YXJ0KFxuICBvcDogaXIuRWxlbWVudFN0YXJ0T3AgfCBpci5Qcm9qZWN0aW9uT3AsXG4gIGkxOG5Db250ZXh0OiBpci5JMThuQ29udGV4dE9wLFxuICBpMThuQmxvY2s6IGlyLkkxOG5TdGFydE9wLFxuICBzdHJ1Y3R1cmFsRGlyZWN0aXZlPzogaXIuVGVtcGxhdGVPcCxcbikge1xuICBjb25zdCB7c3RhcnROYW1lLCBjbG9zZU5hbWV9ID0gb3AuaTE4blBsYWNlaG9sZGVyITtcbiAgbGV0IGZsYWdzID0gaXIuSTE4blBhcmFtVmFsdWVGbGFncy5FbGVtZW50VGFnIHwgaXIuSTE4blBhcmFtVmFsdWVGbGFncy5PcGVuVGFnO1xuICBsZXQgdmFsdWU6IGlyLkkxOG5QYXJhbVZhbHVlWyd2YWx1ZSddID0gb3AuaGFuZGxlLnNsb3QhO1xuICAvLyBJZiB0aGUgZWxlbWVudCBpcyBhc3NvY2lhdGVkIHdpdGggYSBzdHJ1Y3R1cmFsIGRpcmVjdGl2ZSwgc3RhcnQgaXQgYXMgd2VsbC5cbiAgaWYgKHN0cnVjdHVyYWxEaXJlY3RpdmUgIT09IHVuZGVmaW5lZCkge1xuICAgIGZsYWdzIHw9IGlyLkkxOG5QYXJhbVZhbHVlRmxhZ3MuVGVtcGxhdGVUYWc7XG4gICAgdmFsdWUgPSB7ZWxlbWVudDogdmFsdWUsIHRlbXBsYXRlOiBzdHJ1Y3R1cmFsRGlyZWN0aXZlLmhhbmRsZS5zbG90IX07XG4gIH1cbiAgLy8gRm9yIHNlbGYtY2xvc2luZyB0YWdzLCB0aGVyZSBpcyBubyBjbG9zZSB0YWcgcGxhY2Vob2xkZXIuIEluc3RlYWQsIHRoZSBzdGFydCB0YWdcbiAgLy8gcGxhY2Vob2xkZXIgYWNjb3VudHMgZm9yIHRoZSBzdGFydCBhbmQgY2xvc2Ugb2YgdGhlIGVsZW1lbnQuXG4gIGlmICghY2xvc2VOYW1lKSB7XG4gICAgZmxhZ3MgfD0gaXIuSTE4blBhcmFtVmFsdWVGbGFncy5DbG9zZVRhZztcbiAgfVxuICBhZGRQYXJhbShpMThuQ29udGV4dC5wYXJhbXMsIHN0YXJ0TmFtZSwgdmFsdWUsIGkxOG5CbG9jay5zdWJUZW1wbGF0ZUluZGV4LCBmbGFncyk7XG59XG5cbi8qKlxuICogUmVjb3JkcyBhbiBpMThuIHBhcmFtIHZhbHVlIGZvciB0aGUgY2xvc2luZyBvZiBhbiBlbGVtZW50LlxuICovXG5mdW5jdGlvbiByZWNvcmRFbGVtZW50Q2xvc2UoXG4gIG9wOiBpci5FbGVtZW50U3RhcnRPcCB8IGlyLlByb2plY3Rpb25PcCxcbiAgaTE4bkNvbnRleHQ6IGlyLkkxOG5Db250ZXh0T3AsXG4gIGkxOG5CbG9jazogaXIuSTE4blN0YXJ0T3AsXG4gIHN0cnVjdHVyYWxEaXJlY3RpdmU/OiBpci5UZW1wbGF0ZU9wLFxuKSB7XG4gIGNvbnN0IHtjbG9zZU5hbWV9ID0gb3AuaTE4blBsYWNlaG9sZGVyITtcbiAgLy8gU2VsZi1jbG9zaW5nIHRhZ3MgZG9uJ3QgaGF2ZSBhIGNsb3NpbmcgdGFnIHBsYWNlaG9sZGVyLCBpbnN0ZWFkIHRoZSBlbGVtZW50IGNsb3NpbmcgaXNcbiAgLy8gcmVjb3JkZWQgdmlhIGFuIGFkZGl0aW9uYWwgZmxhZyBvbiB0aGUgZWxlbWVudCBzdGFydCB2YWx1ZS5cbiAgaWYgKGNsb3NlTmFtZSkge1xuICAgIGxldCBmbGFncyA9IGlyLkkxOG5QYXJhbVZhbHVlRmxhZ3MuRWxlbWVudFRhZyB8IGlyLkkxOG5QYXJhbVZhbHVlRmxhZ3MuQ2xvc2VUYWc7XG4gICAgbGV0IHZhbHVlOiBpci5JMThuUGFyYW1WYWx1ZVsndmFsdWUnXSA9IG9wLmhhbmRsZS5zbG90ITtcbiAgICAvLyBJZiB0aGUgZWxlbWVudCBpcyBhc3NvY2lhdGVkIHdpdGggYSBzdHJ1Y3R1cmFsIGRpcmVjdGl2ZSwgY2xvc2UgaXQgYXMgd2VsbC5cbiAgICBpZiAoc3RydWN0dXJhbERpcmVjdGl2ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBmbGFncyB8PSBpci5JMThuUGFyYW1WYWx1ZUZsYWdzLlRlbXBsYXRlVGFnO1xuICAgICAgdmFsdWUgPSB7ZWxlbWVudDogdmFsdWUsIHRlbXBsYXRlOiBzdHJ1Y3R1cmFsRGlyZWN0aXZlLmhhbmRsZS5zbG90IX07XG4gICAgfVxuICAgIGFkZFBhcmFtKGkxOG5Db250ZXh0LnBhcmFtcywgY2xvc2VOYW1lLCB2YWx1ZSwgaTE4bkJsb2NrLnN1YlRlbXBsYXRlSW5kZXgsIGZsYWdzKTtcbiAgfVxufVxuXG4vKipcbiAqIFJlY29yZHMgYW4gaTE4biBwYXJhbSB2YWx1ZSBmb3IgdGhlIHN0YXJ0IG9mIGEgdGVtcGxhdGUuXG4gKi9cbmZ1bmN0aW9uIHJlY29yZFRlbXBsYXRlU3RhcnQoXG4gIGpvYjogQ29tcG9uZW50Q29tcGlsYXRpb25Kb2IsXG4gIHZpZXc6IFZpZXdDb21waWxhdGlvblVuaXQsXG4gIHNsb3Q6IG51bWJlcixcbiAgaTE4blBsYWNlaG9sZGVyOiBpMThuLlRhZ1BsYWNlaG9sZGVyIHwgaTE4bi5CbG9ja1BsYWNlaG9sZGVyLFxuICBpMThuQ29udGV4dDogaXIuSTE4bkNvbnRleHRPcCxcbiAgaTE4bkJsb2NrOiBpci5JMThuU3RhcnRPcCxcbiAgc3RydWN0dXJhbERpcmVjdGl2ZT86IGlyLlRlbXBsYXRlT3AsXG4pIHtcbiAgbGV0IHtzdGFydE5hbWUsIGNsb3NlTmFtZX0gPSBpMThuUGxhY2Vob2xkZXI7XG4gIGxldCBmbGFncyA9IGlyLkkxOG5QYXJhbVZhbHVlRmxhZ3MuVGVtcGxhdGVUYWcgfCBpci5JMThuUGFyYW1WYWx1ZUZsYWdzLk9wZW5UYWc7XG4gIC8vIEZvciBzZWxmLWNsb3NpbmcgdGFncywgdGhlcmUgaXMgbm8gY2xvc2UgdGFnIHBsYWNlaG9sZGVyLiBJbnN0ZWFkLCB0aGUgc3RhcnQgdGFnXG4gIC8vIHBsYWNlaG9sZGVyIGFjY291bnRzIGZvciB0aGUgc3RhcnQgYW5kIGNsb3NlIG9mIHRoZSBlbGVtZW50LlxuICBpZiAoIWNsb3NlTmFtZSkge1xuICAgIGZsYWdzIHw9IGlyLkkxOG5QYXJhbVZhbHVlRmxhZ3MuQ2xvc2VUYWc7XG4gIH1cbiAgLy8gSWYgdGhlIHRlbXBsYXRlIGlzIGFzc29jaWF0ZWQgd2l0aCBhIHN0cnVjdHVyYWwgZGlyZWN0aXZlLCByZWNvcmQgdGhlIHN0cnVjdHVyYWwgZGlyZWN0aXZlJ3NcbiAgLy8gc3RhcnQgZmlyc3QuIFNpbmNlIHRoaXMgdGVtcGxhdGUgbXVzdCBiZSBpbiB0aGUgc3RydWN0dXJhbCBkaXJlY3RpdmUncyB2aWV3LCB3ZSBjYW4ganVzdFxuICAvLyBkaXJlY3RseSB1c2UgdGhlIGN1cnJlbnQgaTE4biBibG9jaydzIHN1Yi10ZW1wbGF0ZSBpbmRleC5cbiAgaWYgKHN0cnVjdHVyYWxEaXJlY3RpdmUgIT09IHVuZGVmaW5lZCkge1xuICAgIGFkZFBhcmFtKFxuICAgICAgaTE4bkNvbnRleHQucGFyYW1zLFxuICAgICAgc3RhcnROYW1lLFxuICAgICAgc3RydWN0dXJhbERpcmVjdGl2ZS5oYW5kbGUuc2xvdCEsXG4gICAgICBpMThuQmxvY2suc3ViVGVtcGxhdGVJbmRleCxcbiAgICAgIGZsYWdzLFxuICAgICk7XG4gIH1cbiAgLy8gUmVjb3JkIHRoZSBzdGFydCBvZiB0aGUgdGVtcGxhdGUuIEZvciB0aGUgc3ViLXRlbXBsYXRlIGluZGV4LCBwYXNzIHRoZSBpbmRleCBmb3IgdGhlIHRlbXBsYXRlJ3NcbiAgLy8gdmlldywgcmF0aGVyIHRoYW4gdGhlIGN1cnJlbnQgaTE4biBibG9jaydzIGluZGV4LlxuICBhZGRQYXJhbShcbiAgICBpMThuQ29udGV4dC5wYXJhbXMsXG4gICAgc3RhcnROYW1lLFxuICAgIHNsb3QsXG4gICAgZ2V0U3ViVGVtcGxhdGVJbmRleEZvclRlbXBsYXRlVGFnKGpvYiwgaTE4bkJsb2NrLCB2aWV3KSxcbiAgICBmbGFncyxcbiAgKTtcbn1cblxuLyoqXG4gKiBSZWNvcmRzIGFuIGkxOG4gcGFyYW0gdmFsdWUgZm9yIHRoZSBjbG9zaW5nIG9mIGEgdGVtcGxhdGUuXG4gKi9cbmZ1bmN0aW9uIHJlY29yZFRlbXBsYXRlQ2xvc2UoXG4gIGpvYjogQ29tcG9uZW50Q29tcGlsYXRpb25Kb2IsXG4gIHZpZXc6IFZpZXdDb21waWxhdGlvblVuaXQsXG4gIHNsb3Q6IG51bWJlcixcbiAgaTE4blBsYWNlaG9sZGVyOiBpMThuLlRhZ1BsYWNlaG9sZGVyIHwgaTE4bi5CbG9ja1BsYWNlaG9sZGVyLFxuICBpMThuQ29udGV4dDogaXIuSTE4bkNvbnRleHRPcCxcbiAgaTE4bkJsb2NrOiBpci5JMThuU3RhcnRPcCxcbiAgc3RydWN0dXJhbERpcmVjdGl2ZT86IGlyLlRlbXBsYXRlT3AsXG4pIHtcbiAgY29uc3Qge2Nsb3NlTmFtZX0gPSBpMThuUGxhY2Vob2xkZXI7XG4gIGNvbnN0IGZsYWdzID0gaXIuSTE4blBhcmFtVmFsdWVGbGFncy5UZW1wbGF0ZVRhZyB8IGlyLkkxOG5QYXJhbVZhbHVlRmxhZ3MuQ2xvc2VUYWc7XG4gIC8vIFNlbGYtY2xvc2luZyB0YWdzIGRvbid0IGhhdmUgYSBjbG9zaW5nIHRhZyBwbGFjZWhvbGRlciwgaW5zdGVhZCB0aGUgdGVtcGxhdGUncyBjbG9zaW5nIGlzXG4gIC8vIHJlY29yZGVkIHZpYSBhbiBhZGRpdGlvbmFsIGZsYWcgb24gdGhlIHRlbXBsYXRlIHN0YXJ0IHZhbHVlLlxuICBpZiAoY2xvc2VOYW1lKSB7XG4gICAgLy8gUmVjb3JkIHRoZSBjbG9zaW5nIG9mIHRoZSB0ZW1wbGF0ZS4gRm9yIHRoZSBzdWItdGVtcGxhdGUgaW5kZXgsIHBhc3MgdGhlIGluZGV4IGZvciB0aGVcbiAgICAvLyB0ZW1wbGF0ZSdzIHZpZXcsIHJhdGhlciB0aGFuIHRoZSBjdXJyZW50IGkxOG4gYmxvY2sncyBpbmRleC5cbiAgICBhZGRQYXJhbShcbiAgICAgIGkxOG5Db250ZXh0LnBhcmFtcyxcbiAgICAgIGNsb3NlTmFtZSxcbiAgICAgIHNsb3QsXG4gICAgICBnZXRTdWJUZW1wbGF0ZUluZGV4Rm9yVGVtcGxhdGVUYWcoam9iLCBpMThuQmxvY2ssIHZpZXcpLFxuICAgICAgZmxhZ3MsXG4gICAgKTtcbiAgICAvLyBJZiB0aGUgdGVtcGxhdGUgaXMgYXNzb2NpYXRlZCB3aXRoIGEgc3RydWN0dXJhbCBkaXJlY3RpdmUsIHJlY29yZCB0aGUgc3RydWN0dXJhbCBkaXJlY3RpdmUnc1xuICAgIC8vIGNsb3NpbmcgYWZ0ZXIuIFNpbmNlIHRoaXMgdGVtcGxhdGUgbXVzdCBiZSBpbiB0aGUgc3RydWN0dXJhbCBkaXJlY3RpdmUncyB2aWV3LCB3ZSBjYW4ganVzdFxuICAgIC8vIGRpcmVjdGx5IHVzZSB0aGUgY3VycmVudCBpMThuIGJsb2NrJ3Mgc3ViLXRlbXBsYXRlIGluZGV4LlxuICAgIGlmIChzdHJ1Y3R1cmFsRGlyZWN0aXZlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGFkZFBhcmFtKFxuICAgICAgICBpMThuQ29udGV4dC5wYXJhbXMsXG4gICAgICAgIGNsb3NlTmFtZSxcbiAgICAgICAgc3RydWN0dXJhbERpcmVjdGl2ZS5oYW5kbGUuc2xvdCEsXG4gICAgICAgIGkxOG5CbG9jay5zdWJUZW1wbGF0ZUluZGV4LFxuICAgICAgICBmbGFncyxcbiAgICAgICk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogR2V0IHRoZSBzdWJUZW1wbGF0ZUluZGV4IGZvciB0aGUgZ2l2ZW4gdGVtcGxhdGUgb3AuIEZvciB0ZW1wbGF0ZSBvcHMsIHVzZSB0aGUgc3ViVGVtcGxhdGVJbmRleCBvZlxuICogdGhlIGNoaWxkIGkxOG4gYmxvY2sgaW5zaWRlIHRoZSB0ZW1wbGF0ZS5cbiAqL1xuZnVuY3Rpb24gZ2V0U3ViVGVtcGxhdGVJbmRleEZvclRlbXBsYXRlVGFnKFxuICBqb2I6IENvbXBvbmVudENvbXBpbGF0aW9uSm9iLFxuICBpMThuT3A6IGlyLkkxOG5TdGFydE9wLFxuICB2aWV3OiBWaWV3Q29tcGlsYXRpb25Vbml0LFxuKTogbnVtYmVyIHwgbnVsbCB7XG4gIGZvciAoY29uc3QgY2hpbGRPcCBvZiB2aWV3LmNyZWF0ZSkge1xuICAgIGlmIChjaGlsZE9wLmtpbmQgPT09IGlyLk9wS2luZC5JMThuU3RhcnQpIHtcbiAgICAgIHJldHVybiBjaGlsZE9wLnN1YlRlbXBsYXRlSW5kZXg7XG4gICAgfVxuICB9XG4gIHJldHVybiBpMThuT3Auc3ViVGVtcGxhdGVJbmRleDtcbn1cblxuLyoqXG4gKiBBZGQgYSBwYXJhbSB2YWx1ZSB0byB0aGUgZ2l2ZW4gcGFyYW1zIG1hcC5cbiAqL1xuZnVuY3Rpb24gYWRkUGFyYW0oXG4gIHBhcmFtczogTWFwPHN0cmluZywgaXIuSTE4blBhcmFtVmFsdWVbXT4sXG4gIHBsYWNlaG9sZGVyOiBzdHJpbmcsXG4gIHZhbHVlOiBzdHJpbmcgfCBudW1iZXIgfCB7ZWxlbWVudDogbnVtYmVyOyB0ZW1wbGF0ZTogbnVtYmVyfSxcbiAgc3ViVGVtcGxhdGVJbmRleDogbnVtYmVyIHwgbnVsbCxcbiAgZmxhZ3M6IGlyLkkxOG5QYXJhbVZhbHVlRmxhZ3MsXG4pIHtcbiAgY29uc3QgdmFsdWVzID0gcGFyYW1zLmdldChwbGFjZWhvbGRlcikgPz8gW107XG4gIHZhbHVlcy5wdXNoKHt2YWx1ZSwgc3ViVGVtcGxhdGVJbmRleCwgZmxhZ3N9KTtcbiAgcGFyYW1zLnNldChwbGFjZWhvbGRlciwgdmFsdWVzKTtcbn1cbiJdfQ==