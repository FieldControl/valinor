/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvcGFnYXRlX2kxOG5fYmxvY2tzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3RlbXBsYXRlL3BpcGVsaW5lL3NyYy9waGFzZXMvcHJvcGFnYXRlX2kxOG5fYmxvY2tzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUdILE9BQU8sS0FBSyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRy9COzs7OztHQUtHO0FBQ0gsTUFBTSxVQUFVLG1CQUFtQixDQUFDLEdBQTRCO0lBQzlELDhCQUE4QixDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDOUMsQ0FBQztBQUVEOztHQUVHO0FBQ0gsU0FBUyw4QkFBOEIsQ0FDckMsSUFBeUIsRUFDekIsZ0JBQXdCO0lBRXhCLElBQUksU0FBUyxHQUEwQixJQUFJLENBQUM7SUFDNUMsS0FBSyxNQUFNLEVBQUUsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDN0IsUUFBUSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDaEIsS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLFNBQVM7Z0JBQ3RCLEVBQUUsQ0FBQyxnQkFBZ0IsR0FBRyxnQkFBZ0IsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUM7Z0JBQ3ZFLFNBQVMsR0FBRyxFQUFFLENBQUM7Z0JBQ2YsTUFBTTtZQUNSLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPO2dCQUNwQiw4RUFBOEU7Z0JBQzlFLElBQUksU0FBVSxDQUFDLGdCQUFnQixLQUFLLElBQUksRUFBRSxDQUFDO29CQUN6QyxnQkFBZ0IsR0FBRyxDQUFDLENBQUM7Z0JBQ3ZCLENBQUM7Z0JBQ0QsU0FBUyxHQUFHLElBQUksQ0FBQztnQkFDakIsTUFBTTtZQUNSLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRO2dCQUNyQixnQkFBZ0IsR0FBRywwQkFBMEIsQ0FDM0MsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUUsRUFDNUIsU0FBUyxFQUNULEVBQUUsQ0FBQyxlQUFlLEVBQ2xCLGdCQUFnQixDQUNqQixDQUFDO2dCQUNGLE1BQU07WUFDUixLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsY0FBYztnQkFDM0IsOENBQThDO2dCQUM5QyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBRSxDQUFDO2dCQUM3QyxnQkFBZ0IsR0FBRywwQkFBMEIsQ0FDM0MsT0FBTyxFQUNQLFNBQVMsRUFDVCxFQUFFLENBQUMsZUFBZSxFQUNsQixnQkFBZ0IsQ0FDakIsQ0FBQztnQkFDRixnRkFBZ0Y7Z0JBQ2hGLElBQUksRUFBRSxDQUFDLFNBQVMsS0FBSyxJQUFJLEVBQUUsQ0FBQztvQkFDMUIsZ0JBQWdCLEdBQUcsMEJBQTBCLENBQzNDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFFLEVBQ2pDLFNBQVMsRUFDVCxFQUFFLENBQUMsb0JBQW9CLEVBQ3ZCLGdCQUFnQixDQUNqQixDQUFDO2dCQUNKLENBQUM7Z0JBQ0QsTUFBTTtRQUNWLENBQUM7SUFDSCxDQUFDO0lBQ0QsT0FBTyxnQkFBZ0IsQ0FBQztBQUMxQixDQUFDO0FBRUQ7O0dBRUc7QUFDSCxTQUFTLDBCQUEwQixDQUNqQyxJQUF5QixFQUN6QixTQUFnQyxFQUNoQyxlQUF3RSxFQUN4RSxnQkFBd0I7SUFFeEIseUZBQXlGO0lBQ3pGLGtEQUFrRDtJQUNsRCxJQUFJLGVBQWUsS0FBSyxTQUFTLEVBQUUsQ0FBQztRQUNsQyxJQUFJLFNBQVMsS0FBSyxJQUFJLEVBQUUsQ0FBQztZQUN2QixNQUFNLEtBQUssQ0FBQyxpRUFBaUUsQ0FBQyxDQUFDO1FBQ2pGLENBQUM7UUFDRCxnQkFBZ0IsRUFBRSxDQUFDO1FBQ25CLG9CQUFvQixDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztJQUN4QyxDQUFDO0lBRUQsa0RBQWtEO0lBQ2xELE9BQU8sOEJBQThCLENBQUMsSUFBSSxFQUFFLGdCQUFnQixDQUFDLENBQUM7QUFDaEUsQ0FBQztBQUVEOztHQUVHO0FBQ0gsU0FBUyxvQkFBb0IsQ0FBQyxJQUF5QixFQUFFLFVBQTBCO0lBQ2pGLCtFQUErRTtJQUMvRSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUN4RCxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ3JDLEVBQUUsQ0FBQyxNQUFNLENBQUMsV0FBVztRQUNuQix5RUFBeUU7UUFDekUsRUFBRSxDQUFDLGlCQUFpQixDQUFDLEVBQUUsRUFBRSxVQUFVLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQ25FLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUNqQixDQUFDO1FBQ0YsRUFBRSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLGVBQWUsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN6RSxDQUFDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgaTE4biBmcm9tICcuLi8uLi8uLi8uLi9pMThuL2kxOG5fYXN0JztcbmltcG9ydCAqIGFzIGlyIGZyb20gJy4uLy4uL2lyJztcbmltcG9ydCB7Q29tcG9uZW50Q29tcGlsYXRpb25Kb2IsIFZpZXdDb21waWxhdGlvblVuaXR9IGZyb20gJy4uL2NvbXBpbGF0aW9uJztcblxuLyoqXG4gKiBQcm9wYWdhdGUgaTE4biBibG9ja3MgZG93biB0aHJvdWdoIGNoaWxkIHRlbXBsYXRlcyB0aGF0IGFjdCBhcyBwbGFjZWhvbGRlcnMgaW4gdGhlIHJvb3QgaTE4blxuICogbWVzc2FnZS4gU3BlY2lmaWNhbGx5LCBwZXJmb3JtIGFuIGluLW9yZGVyIHRyYXZlcnNhbCBvZiBhbGwgdGhlIHZpZXdzLCBhbmQgYWRkIGkxOG5TdGFydC9pMThuRW5kXG4gKiBvcCBwYWlycyBpbnRvIGRlc2NlbmRpbmcgdmlld3MuIEFsc28sIGFzc2lnbiBhbiBpbmNyZWFzaW5nIHN1Yi10ZW1wbGF0ZSBpbmRleCB0byBlYWNoXG4gKiBkZXNjZW5kaW5nIHZpZXcuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcm9wYWdhdGVJMThuQmxvY2tzKGpvYjogQ29tcG9uZW50Q29tcGlsYXRpb25Kb2IpOiB2b2lkIHtcbiAgcHJvcGFnYXRlSTE4bkJsb2Nrc1RvVGVtcGxhdGVzKGpvYi5yb290LCAwKTtcbn1cblxuLyoqXG4gKiBQcm9wYWdhdGVzIGkxOG4gb3BzIGluIHRoZSBnaXZlbiB2aWV3IHRocm91Z2ggdG8gYW55IGNoaWxkIHZpZXdzIHJlY3Vyc2l2ZWx5LlxuICovXG5mdW5jdGlvbiBwcm9wYWdhdGVJMThuQmxvY2tzVG9UZW1wbGF0ZXMoXG4gIHVuaXQ6IFZpZXdDb21waWxhdGlvblVuaXQsXG4gIHN1YlRlbXBsYXRlSW5kZXg6IG51bWJlcixcbik6IG51bWJlciB7XG4gIGxldCBpMThuQmxvY2s6IGlyLkkxOG5TdGFydE9wIHwgbnVsbCA9IG51bGw7XG4gIGZvciAoY29uc3Qgb3Agb2YgdW5pdC5jcmVhdGUpIHtcbiAgICBzd2l0Y2ggKG9wLmtpbmQpIHtcbiAgICAgIGNhc2UgaXIuT3BLaW5kLkkxOG5TdGFydDpcbiAgICAgICAgb3Auc3ViVGVtcGxhdGVJbmRleCA9IHN1YlRlbXBsYXRlSW5kZXggPT09IDAgPyBudWxsIDogc3ViVGVtcGxhdGVJbmRleDtcbiAgICAgICAgaTE4bkJsb2NrID0gb3A7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBpci5PcEtpbmQuSTE4bkVuZDpcbiAgICAgICAgLy8gV2hlbiB3ZSBleGl0IGEgcm9vdC1sZXZlbCBpMThuIGJsb2NrLCByZXNldCB0aGUgc3ViLXRlbXBsYXRlIGluZGV4IGNvdW50ZXIuXG4gICAgICAgIGlmIChpMThuQmxvY2shLnN1YlRlbXBsYXRlSW5kZXggPT09IG51bGwpIHtcbiAgICAgICAgICBzdWJUZW1wbGF0ZUluZGV4ID0gMDtcbiAgICAgICAgfVxuICAgICAgICBpMThuQmxvY2sgPSBudWxsO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgaXIuT3BLaW5kLlRlbXBsYXRlOlxuICAgICAgICBzdWJUZW1wbGF0ZUluZGV4ID0gcHJvcGFnYXRlSTE4bkJsb2Nrc0ZvclZpZXcoXG4gICAgICAgICAgdW5pdC5qb2Iudmlld3MuZ2V0KG9wLnhyZWYpISxcbiAgICAgICAgICBpMThuQmxvY2ssXG4gICAgICAgICAgb3AuaTE4blBsYWNlaG9sZGVyLFxuICAgICAgICAgIHN1YlRlbXBsYXRlSW5kZXgsXG4gICAgICAgICk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBpci5PcEtpbmQuUmVwZWF0ZXJDcmVhdGU6XG4gICAgICAgIC8vIFByb3BhZ2F0ZSBpMThuIGJsb2NrcyB0byB0aGUgQGZvciB0ZW1wbGF0ZS5cbiAgICAgICAgY29uc3QgZm9yVmlldyA9IHVuaXQuam9iLnZpZXdzLmdldChvcC54cmVmKSE7XG4gICAgICAgIHN1YlRlbXBsYXRlSW5kZXggPSBwcm9wYWdhdGVJMThuQmxvY2tzRm9yVmlldyhcbiAgICAgICAgICBmb3JWaWV3LFxuICAgICAgICAgIGkxOG5CbG9jayxcbiAgICAgICAgICBvcC5pMThuUGxhY2Vob2xkZXIsXG4gICAgICAgICAgc3ViVGVtcGxhdGVJbmRleCxcbiAgICAgICAgKTtcbiAgICAgICAgLy8gVGhlbiBpZiB0aGVyZSdzIGFuIEBlbXB0eSB0ZW1wbGF0ZSwgcHJvcGFnYXRlIHRoZSBpMThuIGJsb2NrcyBmb3IgaXQgYXMgd2VsbC5cbiAgICAgICAgaWYgKG9wLmVtcHR5VmlldyAhPT0gbnVsbCkge1xuICAgICAgICAgIHN1YlRlbXBsYXRlSW5kZXggPSBwcm9wYWdhdGVJMThuQmxvY2tzRm9yVmlldyhcbiAgICAgICAgICAgIHVuaXQuam9iLnZpZXdzLmdldChvcC5lbXB0eVZpZXcpISxcbiAgICAgICAgICAgIGkxOG5CbG9jayxcbiAgICAgICAgICAgIG9wLmVtcHR5STE4blBsYWNlaG9sZGVyLFxuICAgICAgICAgICAgc3ViVGVtcGxhdGVJbmRleCxcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gc3ViVGVtcGxhdGVJbmRleDtcbn1cblxuLyoqXG4gKiBQcm9wYWdhdGUgaTE4biBibG9ja3MgZm9yIGEgdmlldy5cbiAqL1xuZnVuY3Rpb24gcHJvcGFnYXRlSTE4bkJsb2Nrc0ZvclZpZXcoXG4gIHZpZXc6IFZpZXdDb21waWxhdGlvblVuaXQsXG4gIGkxOG5CbG9jazogaXIuSTE4blN0YXJ0T3AgfCBudWxsLFxuICBpMThuUGxhY2Vob2xkZXI6IGkxOG4uVGFnUGxhY2Vob2xkZXIgfCBpMThuLkJsb2NrUGxhY2Vob2xkZXIgfCB1bmRlZmluZWQsXG4gIHN1YlRlbXBsYXRlSW5kZXg6IG51bWJlcixcbikge1xuICAvLyBXZSBmb3VuZCBhbiA8bmctdGVtcGxhdGU+IGluc2lkZSBhbiBpMThuIGJsb2NrOyBpbmNyZW1lbnQgdGhlIHN1Yi10ZW1wbGF0ZSBjb3VudGVyIGFuZFxuICAvLyB3cmFwIHRoZSB0ZW1wbGF0ZSdzIHZpZXcgaW4gYSBjaGlsZCBpMThuIGJsb2NrLlxuICBpZiAoaTE4blBsYWNlaG9sZGVyICE9PSB1bmRlZmluZWQpIHtcbiAgICBpZiAoaTE4bkJsb2NrID09PSBudWxsKSB7XG4gICAgICB0aHJvdyBFcnJvcignRXhwZWN0ZWQgdGVtcGxhdGUgd2l0aCBpMThuIHBsYWNlaG9sZGVyIHRvIGJlIGluIGFuIGkxOG4gYmxvY2suJyk7XG4gICAgfVxuICAgIHN1YlRlbXBsYXRlSW5kZXgrKztcbiAgICB3cmFwVGVtcGxhdGVXaXRoSTE4bih2aWV3LCBpMThuQmxvY2spO1xuICB9XG5cbiAgLy8gQ29udGludWUgdHJhdmVyc2luZyBpbnNpZGUgdGhlIHRlbXBsYXRlJ3Mgdmlldy5cbiAgcmV0dXJuIHByb3BhZ2F0ZUkxOG5CbG9ja3NUb1RlbXBsYXRlcyh2aWV3LCBzdWJUZW1wbGF0ZUluZGV4KTtcbn1cblxuLyoqXG4gKiBXcmFwcyBhIHRlbXBsYXRlIHZpZXcgd2l0aCBpMThuIHN0YXJ0IGFuZCBlbmQgb3BzLlxuICovXG5mdW5jdGlvbiB3cmFwVGVtcGxhdGVXaXRoSTE4bih1bml0OiBWaWV3Q29tcGlsYXRpb25Vbml0LCBwYXJlbnRJMThuOiBpci5JMThuU3RhcnRPcCkge1xuICAvLyBPbmx5IGFkZCBpMThuIG9wcyBpZiB0aGV5IGhhdmUgbm90IGFscmVhZHkgYmVlbiBwcm9wYWdhdGVkIHRvIHRoaXMgdGVtcGxhdGUuXG4gIGlmICh1bml0LmNyZWF0ZS5oZWFkLm5leHQ/LmtpbmQgIT09IGlyLk9wS2luZC5JMThuU3RhcnQpIHtcbiAgICBjb25zdCBpZCA9IHVuaXQuam9iLmFsbG9jYXRlWHJlZklkKCk7XG4gICAgaXIuT3BMaXN0Lmluc2VydEFmdGVyKFxuICAgICAgLy8gTmVzdGVkIG5nLXRlbXBsYXRlIGkxOG4gc3RhcnQvZW5kIG9wcyBzaG91bGQgbm90IHJlY2VpdmUgc291cmNlIHNwYW5zLlxuICAgICAgaXIuY3JlYXRlSTE4blN0YXJ0T3AoaWQsIHBhcmVudEkxOG4ubWVzc2FnZSwgcGFyZW50STE4bi5yb290LCBudWxsKSxcbiAgICAgIHVuaXQuY3JlYXRlLmhlYWQsXG4gICAgKTtcbiAgICBpci5PcExpc3QuaW5zZXJ0QmVmb3JlKGlyLmNyZWF0ZUkxOG5FbmRPcChpZCwgbnVsbCksIHVuaXQuY3JlYXRlLnRhaWwpO1xuICB9XG59XG4iXX0=