/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ir from '../../ir';
/**
 * Propagate i18n blocks down through child templates that act as placeholders in the root i18n
 * message. Specifically, perform an in-order traversal of all the views, and add i18nStart/i18nEnd
 * op pairs into descending views. Also, assign an increasing sub-template index to each
 * descending view.
 */
export function propagateI18nBlocks(job) {
    propagateI18nBlocksToTemplates(job.root, 0);
}
/**
 * Propagates i18n ops in the given view through to any child views recursively.
 */
function propagateI18nBlocksToTemplates(unit, subTemplateIndex) {
    let i18nBlock = null;
    for (const op of unit.create) {
        switch (op.kind) {
            case ir.OpKind.I18nStart:
                op.subTemplateIndex = subTemplateIndex === 0 ? null : subTemplateIndex;
                i18nBlock = op;
                break;
            case ir.OpKind.I18nEnd:
                // When we exit a root-level i18n block, reset the sub-template index counter.
                if (i18nBlock.subTemplateIndex === null) {
                    subTemplateIndex = 0;
                }
                i18nBlock = null;
                break;
            case ir.OpKind.Template:
                subTemplateIndex = propagateI18nBlocksForView(unit.job.views.get(op.xref), i18nBlock, op.i18nPlaceholder, subTemplateIndex);
                break;
            case ir.OpKind.RepeaterCreate:
                // Propagate i18n blocks to the @for template.
                const forView = unit.job.views.get(op.xref);
                subTemplateIndex = propagateI18nBlocksForView(forView, i18nBlock, op.i18nPlaceholder, subTemplateIndex);
                // Then if there's an @empty template, propagate the i18n blocks for it as well.
                if (op.emptyView !== null) {
                    subTemplateIndex = propagateI18nBlocksForView(unit.job.views.get(op.emptyView), i18nBlock, op.emptyI18nPlaceholder, subTemplateIndex);
                }
                break;
        }
    }
    return subTemplateIndex;
}
/**
 * Propagate i18n blocks for a view.
 */
function propagateI18nBlocksForView(view, i18nBlock, i18nPlaceholder, subTemplateIndex) {
    // We found an <ng-template> inside an i18n block; increment the sub-template counter and
    // wrap the template's view in a child i18n block.
    if (i18nPlaceholder !== undefined) {
        if (i18nBlock === null) {
            throw Error('Expected template with i18n placeholder to be in an i18n block.');
        }
        subTemplateIndex++;
        wrapTemplateWithI18n(view, i18nBlock);
    }
    // Continue traversing inside the template's view.
    return propagateI18nBlocksToTemplates(view, subTemplateIndex);
}
/**
 * Wraps a template view with i18n start and end ops.
 */
function wrapTemplateWithI18n(unit, parentI18n) {
    // Only add i18n ops if they have not already been propagated to this template.
    if (unit.create.head.next?.kind !== ir.OpKind.I18nStart) {
        const id = unit.job.allocateXrefId();
        ir.OpList.insertAfter(
        // Nested ng-template i18n start/end ops should not receive source spans.
        ir.createI18nStartOp(id, parentI18n.message, parentI18n.root, null), unit.create.head);
        ir.OpList.insertBefore(ir.createI18nEndOp(id, null), unit.create.tail);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvcGFnYXRlX2kxOG5fYmxvY2tzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3RlbXBsYXRlL3BpcGVsaW5lL3NyYy9waGFzZXMvcHJvcGFnYXRlX2kxOG5fYmxvY2tzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUdILE9BQU8sS0FBSyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRy9COzs7OztHQUtHO0FBQ0gsTUFBTSxVQUFVLG1CQUFtQixDQUFDLEdBQTRCO0lBQzlELDhCQUE4QixDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDOUMsQ0FBQztBQUVEOztHQUVHO0FBQ0gsU0FBUyw4QkFBOEIsQ0FDckMsSUFBeUIsRUFDekIsZ0JBQXdCO0lBRXhCLElBQUksU0FBUyxHQUEwQixJQUFJLENBQUM7SUFDNUMsS0FBSyxNQUFNLEVBQUUsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDN0IsUUFBUSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDaEIsS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLFNBQVM7Z0JBQ3RCLEVBQUUsQ0FBQyxnQkFBZ0IsR0FBRyxnQkFBZ0IsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUM7Z0JBQ3ZFLFNBQVMsR0FBRyxFQUFFLENBQUM7Z0JBQ2YsTUFBTTtZQUNSLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPO2dCQUNwQiw4RUFBOEU7Z0JBQzlFLElBQUksU0FBVSxDQUFDLGdCQUFnQixLQUFLLElBQUksRUFBRSxDQUFDO29CQUN6QyxnQkFBZ0IsR0FBRyxDQUFDLENBQUM7Z0JBQ3ZCLENBQUM7Z0JBQ0QsU0FBUyxHQUFHLElBQUksQ0FBQztnQkFDakIsTUFBTTtZQUNSLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRO2dCQUNyQixnQkFBZ0IsR0FBRywwQkFBMEIsQ0FDM0MsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUUsRUFDNUIsU0FBUyxFQUNULEVBQUUsQ0FBQyxlQUFlLEVBQ2xCLGdCQUFnQixDQUNqQixDQUFDO2dCQUNGLE1BQU07WUFDUixLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsY0FBYztnQkFDM0IsOENBQThDO2dCQUM5QyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBRSxDQUFDO2dCQUM3QyxnQkFBZ0IsR0FBRywwQkFBMEIsQ0FDM0MsT0FBTyxFQUNQLFNBQVMsRUFDVCxFQUFFLENBQUMsZUFBZSxFQUNsQixnQkFBZ0IsQ0FDakIsQ0FBQztnQkFDRixnRkFBZ0Y7Z0JBQ2hGLElBQUksRUFBRSxDQUFDLFNBQVMsS0FBSyxJQUFJLEVBQUUsQ0FBQztvQkFDMUIsZ0JBQWdCLEdBQUcsMEJBQTBCLENBQzNDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFFLEVBQ2pDLFNBQVMsRUFDVCxFQUFFLENBQUMsb0JBQW9CLEVBQ3ZCLGdCQUFnQixDQUNqQixDQUFDO2dCQUNKLENBQUM7Z0JBQ0QsTUFBTTtRQUNWLENBQUM7SUFDSCxDQUFDO0lBQ0QsT0FBTyxnQkFBZ0IsQ0FBQztBQUMxQixDQUFDO0FBRUQ7O0dBRUc7QUFDSCxTQUFTLDBCQUEwQixDQUNqQyxJQUF5QixFQUN6QixTQUFnQyxFQUNoQyxlQUF3RSxFQUN4RSxnQkFBd0I7SUFFeEIseUZBQXlGO0lBQ3pGLGtEQUFrRDtJQUNsRCxJQUFJLGVBQWUsS0FBSyxTQUFTLEVBQUUsQ0FBQztRQUNsQyxJQUFJLFNBQVMsS0FBSyxJQUFJLEVBQUUsQ0FBQztZQUN2QixNQUFNLEtBQUssQ0FBQyxpRUFBaUUsQ0FBQyxDQUFDO1FBQ2pGLENBQUM7UUFDRCxnQkFBZ0IsRUFBRSxDQUFDO1FBQ25CLG9CQUFvQixDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztJQUN4QyxDQUFDO0lBRUQsa0RBQWtEO0lBQ2xELE9BQU8sOEJBQThCLENBQUMsSUFBSSxFQUFFLGdCQUFnQixDQUFDLENBQUM7QUFDaEUsQ0FBQztBQUVEOztHQUVHO0FBQ0gsU0FBUyxvQkFBb0IsQ0FBQyxJQUF5QixFQUFFLFVBQTBCO0lBQ2pGLCtFQUErRTtJQUMvRSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUN4RCxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ3JDLEVBQUUsQ0FBQyxNQUFNLENBQUMsV0FBVztRQUNuQix5RUFBeUU7UUFDekUsRUFBRSxDQUFDLGlCQUFpQixDQUFDLEVBQUUsRUFBRSxVQUFVLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQ25FLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUNqQixDQUFDO1FBQ0YsRUFBRSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLGVBQWUsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN6RSxDQUFDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBpMThuIGZyb20gJy4uLy4uLy4uLy4uL2kxOG4vaTE4bl9hc3QnO1xuaW1wb3J0ICogYXMgaXIgZnJvbSAnLi4vLi4vaXInO1xuaW1wb3J0IHtDb21wb25lbnRDb21waWxhdGlvbkpvYiwgVmlld0NvbXBpbGF0aW9uVW5pdH0gZnJvbSAnLi4vY29tcGlsYXRpb24nO1xuXG4vKipcbiAqIFByb3BhZ2F0ZSBpMThuIGJsb2NrcyBkb3duIHRocm91Z2ggY2hpbGQgdGVtcGxhdGVzIHRoYXQgYWN0IGFzIHBsYWNlaG9sZGVycyBpbiB0aGUgcm9vdCBpMThuXG4gKiBtZXNzYWdlLiBTcGVjaWZpY2FsbHksIHBlcmZvcm0gYW4gaW4tb3JkZXIgdHJhdmVyc2FsIG9mIGFsbCB0aGUgdmlld3MsIGFuZCBhZGQgaTE4blN0YXJ0L2kxOG5FbmRcbiAqIG9wIHBhaXJzIGludG8gZGVzY2VuZGluZyB2aWV3cy4gQWxzbywgYXNzaWduIGFuIGluY3JlYXNpbmcgc3ViLXRlbXBsYXRlIGluZGV4IHRvIGVhY2hcbiAqIGRlc2NlbmRpbmcgdmlldy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByb3BhZ2F0ZUkxOG5CbG9ja3Moam9iOiBDb21wb25lbnRDb21waWxhdGlvbkpvYik6IHZvaWQge1xuICBwcm9wYWdhdGVJMThuQmxvY2tzVG9UZW1wbGF0ZXMoam9iLnJvb3QsIDApO1xufVxuXG4vKipcbiAqIFByb3BhZ2F0ZXMgaTE4biBvcHMgaW4gdGhlIGdpdmVuIHZpZXcgdGhyb3VnaCB0byBhbnkgY2hpbGQgdmlld3MgcmVjdXJzaXZlbHkuXG4gKi9cbmZ1bmN0aW9uIHByb3BhZ2F0ZUkxOG5CbG9ja3NUb1RlbXBsYXRlcyhcbiAgdW5pdDogVmlld0NvbXBpbGF0aW9uVW5pdCxcbiAgc3ViVGVtcGxhdGVJbmRleDogbnVtYmVyLFxuKTogbnVtYmVyIHtcbiAgbGV0IGkxOG5CbG9jazogaXIuSTE4blN0YXJ0T3AgfCBudWxsID0gbnVsbDtcbiAgZm9yIChjb25zdCBvcCBvZiB1bml0LmNyZWF0ZSkge1xuICAgIHN3aXRjaCAob3Aua2luZCkge1xuICAgICAgY2FzZSBpci5PcEtpbmQuSTE4blN0YXJ0OlxuICAgICAgICBvcC5zdWJUZW1wbGF0ZUluZGV4ID0gc3ViVGVtcGxhdGVJbmRleCA9PT0gMCA/IG51bGwgOiBzdWJUZW1wbGF0ZUluZGV4O1xuICAgICAgICBpMThuQmxvY2sgPSBvcDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIGlyLk9wS2luZC5JMThuRW5kOlxuICAgICAgICAvLyBXaGVuIHdlIGV4aXQgYSByb290LWxldmVsIGkxOG4gYmxvY2ssIHJlc2V0IHRoZSBzdWItdGVtcGxhdGUgaW5kZXggY291bnRlci5cbiAgICAgICAgaWYgKGkxOG5CbG9jayEuc3ViVGVtcGxhdGVJbmRleCA9PT0gbnVsbCkge1xuICAgICAgICAgIHN1YlRlbXBsYXRlSW5kZXggPSAwO1xuICAgICAgICB9XG4gICAgICAgIGkxOG5CbG9jayA9IG51bGw7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBpci5PcEtpbmQuVGVtcGxhdGU6XG4gICAgICAgIHN1YlRlbXBsYXRlSW5kZXggPSBwcm9wYWdhdGVJMThuQmxvY2tzRm9yVmlldyhcbiAgICAgICAgICB1bml0LmpvYi52aWV3cy5nZXQob3AueHJlZikhLFxuICAgICAgICAgIGkxOG5CbG9jayxcbiAgICAgICAgICBvcC5pMThuUGxhY2Vob2xkZXIsXG4gICAgICAgICAgc3ViVGVtcGxhdGVJbmRleCxcbiAgICAgICAgKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIGlyLk9wS2luZC5SZXBlYXRlckNyZWF0ZTpcbiAgICAgICAgLy8gUHJvcGFnYXRlIGkxOG4gYmxvY2tzIHRvIHRoZSBAZm9yIHRlbXBsYXRlLlxuICAgICAgICBjb25zdCBmb3JWaWV3ID0gdW5pdC5qb2Iudmlld3MuZ2V0KG9wLnhyZWYpITtcbiAgICAgICAgc3ViVGVtcGxhdGVJbmRleCA9IHByb3BhZ2F0ZUkxOG5CbG9ja3NGb3JWaWV3KFxuICAgICAgICAgIGZvclZpZXcsXG4gICAgICAgICAgaTE4bkJsb2NrLFxuICAgICAgICAgIG9wLmkxOG5QbGFjZWhvbGRlcixcbiAgICAgICAgICBzdWJUZW1wbGF0ZUluZGV4LFxuICAgICAgICApO1xuICAgICAgICAvLyBUaGVuIGlmIHRoZXJlJ3MgYW4gQGVtcHR5IHRlbXBsYXRlLCBwcm9wYWdhdGUgdGhlIGkxOG4gYmxvY2tzIGZvciBpdCBhcyB3ZWxsLlxuICAgICAgICBpZiAob3AuZW1wdHlWaWV3ICE9PSBudWxsKSB7XG4gICAgICAgICAgc3ViVGVtcGxhdGVJbmRleCA9IHByb3BhZ2F0ZUkxOG5CbG9ja3NGb3JWaWV3KFxuICAgICAgICAgICAgdW5pdC5qb2Iudmlld3MuZ2V0KG9wLmVtcHR5VmlldykhLFxuICAgICAgICAgICAgaTE4bkJsb2NrLFxuICAgICAgICAgICAgb3AuZW1wdHlJMThuUGxhY2Vob2xkZXIsXG4gICAgICAgICAgICBzdWJUZW1wbGF0ZUluZGV4LFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHJldHVybiBzdWJUZW1wbGF0ZUluZGV4O1xufVxuXG4vKipcbiAqIFByb3BhZ2F0ZSBpMThuIGJsb2NrcyBmb3IgYSB2aWV3LlxuICovXG5mdW5jdGlvbiBwcm9wYWdhdGVJMThuQmxvY2tzRm9yVmlldyhcbiAgdmlldzogVmlld0NvbXBpbGF0aW9uVW5pdCxcbiAgaTE4bkJsb2NrOiBpci5JMThuU3RhcnRPcCB8IG51bGwsXG4gIGkxOG5QbGFjZWhvbGRlcjogaTE4bi5UYWdQbGFjZWhvbGRlciB8IGkxOG4uQmxvY2tQbGFjZWhvbGRlciB8IHVuZGVmaW5lZCxcbiAgc3ViVGVtcGxhdGVJbmRleDogbnVtYmVyLFxuKSB7XG4gIC8vIFdlIGZvdW5kIGFuIDxuZy10ZW1wbGF0ZT4gaW5zaWRlIGFuIGkxOG4gYmxvY2s7IGluY3JlbWVudCB0aGUgc3ViLXRlbXBsYXRlIGNvdW50ZXIgYW5kXG4gIC8vIHdyYXAgdGhlIHRlbXBsYXRlJ3MgdmlldyBpbiBhIGNoaWxkIGkxOG4gYmxvY2suXG4gIGlmIChpMThuUGxhY2Vob2xkZXIgIT09IHVuZGVmaW5lZCkge1xuICAgIGlmIChpMThuQmxvY2sgPT09IG51bGwpIHtcbiAgICAgIHRocm93IEVycm9yKCdFeHBlY3RlZCB0ZW1wbGF0ZSB3aXRoIGkxOG4gcGxhY2Vob2xkZXIgdG8gYmUgaW4gYW4gaTE4biBibG9jay4nKTtcbiAgICB9XG4gICAgc3ViVGVtcGxhdGVJbmRleCsrO1xuICAgIHdyYXBUZW1wbGF0ZVdpdGhJMThuKHZpZXcsIGkxOG5CbG9jayk7XG4gIH1cblxuICAvLyBDb250aW51ZSB0cmF2ZXJzaW5nIGluc2lkZSB0aGUgdGVtcGxhdGUncyB2aWV3LlxuICByZXR1cm4gcHJvcGFnYXRlSTE4bkJsb2Nrc1RvVGVtcGxhdGVzKHZpZXcsIHN1YlRlbXBsYXRlSW5kZXgpO1xufVxuXG4vKipcbiAqIFdyYXBzIGEgdGVtcGxhdGUgdmlldyB3aXRoIGkxOG4gc3RhcnQgYW5kIGVuZCBvcHMuXG4gKi9cbmZ1bmN0aW9uIHdyYXBUZW1wbGF0ZVdpdGhJMThuKHVuaXQ6IFZpZXdDb21waWxhdGlvblVuaXQsIHBhcmVudEkxOG46IGlyLkkxOG5TdGFydE9wKSB7XG4gIC8vIE9ubHkgYWRkIGkxOG4gb3BzIGlmIHRoZXkgaGF2ZSBub3QgYWxyZWFkeSBiZWVuIHByb3BhZ2F0ZWQgdG8gdGhpcyB0ZW1wbGF0ZS5cbiAgaWYgKHVuaXQuY3JlYXRlLmhlYWQubmV4dD8ua2luZCAhPT0gaXIuT3BLaW5kLkkxOG5TdGFydCkge1xuICAgIGNvbnN0IGlkID0gdW5pdC5qb2IuYWxsb2NhdGVYcmVmSWQoKTtcbiAgICBpci5PcExpc3QuaW5zZXJ0QWZ0ZXIoXG4gICAgICAvLyBOZXN0ZWQgbmctdGVtcGxhdGUgaTE4biBzdGFydC9lbmQgb3BzIHNob3VsZCBub3QgcmVjZWl2ZSBzb3VyY2Ugc3BhbnMuXG4gICAgICBpci5jcmVhdGVJMThuU3RhcnRPcChpZCwgcGFyZW50STE4bi5tZXNzYWdlLCBwYXJlbnRJMThuLnJvb3QsIG51bGwpLFxuICAgICAgdW5pdC5jcmVhdGUuaGVhZCxcbiAgICApO1xuICAgIGlyLk9wTGlzdC5pbnNlcnRCZWZvcmUoaXIuY3JlYXRlSTE4bkVuZE9wKGlkLCBudWxsKSwgdW5pdC5jcmVhdGUudGFpbCk7XG4gIH1cbn1cbiJdfQ==