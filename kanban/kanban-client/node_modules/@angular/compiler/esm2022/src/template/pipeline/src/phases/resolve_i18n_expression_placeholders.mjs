/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ir from '../../ir';
/**
 * Resolve the i18n expression placeholders in i18n messages.
 */
export function resolveI18nExpressionPlaceholders(job) {
    // Record all of the i18n context ops, and the sub-template index for each i18n op.
    const subTemplateIndices = new Map();
    const i18nContexts = new Map();
    const icuPlaceholders = new Map();
    for (const unit of job.units) {
        for (const op of unit.create) {
            switch (op.kind) {
                case ir.OpKind.I18nStart:
                    subTemplateIndices.set(op.xref, op.subTemplateIndex);
                    break;
                case ir.OpKind.I18nContext:
                    i18nContexts.set(op.xref, op);
                    break;
                case ir.OpKind.IcuPlaceholder:
                    icuPlaceholders.set(op.xref, op);
                    break;
            }
        }
    }
    // Keep track of the next available expression index for each i18n message.
    const expressionIndices = new Map();
    // Keep track of a reference index for each expression.
    // We use different references for normal i18n expressio and attribute i18n expressions. This is
    // because child i18n blocks in templates don't get their own context, since they're rolled into
    // the translated message of the parent, but they may target a different slot.
    const referenceIndex = (op) => op.usage === ir.I18nExpressionFor.I18nText ? op.i18nOwner : op.context;
    for (const unit of job.units) {
        for (const op of unit.update) {
            if (op.kind === ir.OpKind.I18nExpression) {
                const index = expressionIndices.get(referenceIndex(op)) || 0;
                const subTemplateIndex = subTemplateIndices.get(op.i18nOwner) ?? null;
                const value = {
                    value: index,
                    subTemplateIndex: subTemplateIndex,
                    flags: ir.I18nParamValueFlags.ExpressionIndex,
                };
                updatePlaceholder(op, value, i18nContexts, icuPlaceholders);
                expressionIndices.set(referenceIndex(op), index + 1);
            }
        }
    }
}
function updatePlaceholder(op, value, i18nContexts, icuPlaceholders) {
    if (op.i18nPlaceholder !== null) {
        const i18nContext = i18nContexts.get(op.context);
        const params = op.resolutionTime === ir.I18nParamResolutionTime.Creation
            ? i18nContext.params
            : i18nContext.postprocessingParams;
        const values = params.get(op.i18nPlaceholder) || [];
        values.push(value);
        params.set(op.i18nPlaceholder, values);
    }
    if (op.icuPlaceholder !== null) {
        const icuPlaceholderOp = icuPlaceholders.get(op.icuPlaceholder);
        icuPlaceholderOp?.expressionPlaceholders.push(value);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb2x2ZV9pMThuX2V4cHJlc3Npb25fcGxhY2Vob2xkZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3RlbXBsYXRlL3BpcGVsaW5lL3NyYy9waGFzZXMvcmVzb2x2ZV9pMThuX2V4cHJlc3Npb25fcGxhY2Vob2xkZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sS0FBSyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRy9COztHQUVHO0FBQ0gsTUFBTSxVQUFVLGlDQUFpQyxDQUFDLEdBQTRCO0lBQzVFLG1GQUFtRjtJQUNuRixNQUFNLGtCQUFrQixHQUFHLElBQUksR0FBRyxFQUE0QixDQUFDO0lBQy9ELE1BQU0sWUFBWSxHQUFHLElBQUksR0FBRyxFQUErQixDQUFDO0lBQzVELE1BQU0sZUFBZSxHQUFHLElBQUksR0FBRyxFQUFrQyxDQUFDO0lBQ2xFLEtBQUssTUFBTSxJQUFJLElBQUksR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzdCLEtBQUssTUFBTSxFQUFFLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQzdCLFFBQVEsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNoQixLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUztvQkFDdEIsa0JBQWtCLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLGdCQUFnQixDQUFDLENBQUM7b0JBQ3JELE1BQU07Z0JBQ1IsS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLFdBQVc7b0JBQ3hCLFlBQVksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztvQkFDOUIsTUFBTTtnQkFDUixLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsY0FBYztvQkFDM0IsZUFBZSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO29CQUNqQyxNQUFNO1lBQ1YsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0lBRUQsMkVBQTJFO0lBQzNFLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxHQUFHLEVBQXFCLENBQUM7SUFFdkQsdURBQXVEO0lBQ3ZELGdHQUFnRztJQUNoRyxnR0FBZ0c7SUFDaEcsOEVBQThFO0lBQzlFLE1BQU0sY0FBYyxHQUFHLENBQUMsRUFBdUIsRUFBYSxFQUFFLENBQzVELEVBQUUsQ0FBQyxLQUFLLEtBQUssRUFBRSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQztJQUV6RSxLQUFLLE1BQU0sSUFBSSxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM3QixLQUFLLE1BQU0sRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUM3QixJQUFJLEVBQUUsQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDekMsTUFBTSxLQUFLLEdBQUcsaUJBQWlCLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDN0QsTUFBTSxnQkFBZ0IsR0FBRyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLElBQUksQ0FBQztnQkFDdEUsTUFBTSxLQUFLLEdBQXNCO29CQUMvQixLQUFLLEVBQUUsS0FBSztvQkFDWixnQkFBZ0IsRUFBRSxnQkFBZ0I7b0JBQ2xDLEtBQUssRUFBRSxFQUFFLENBQUMsbUJBQW1CLENBQUMsZUFBZTtpQkFDOUMsQ0FBQztnQkFDRixpQkFBaUIsQ0FBQyxFQUFFLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRSxlQUFlLENBQUMsQ0FBQztnQkFDNUQsaUJBQWlCLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDdkQsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0FBQ0gsQ0FBQztBQUVELFNBQVMsaUJBQWlCLENBQ3hCLEVBQXVCLEVBQ3ZCLEtBQXdCLEVBQ3hCLFlBQThDLEVBQzlDLGVBQW9EO0lBRXBELElBQUksRUFBRSxDQUFDLGVBQWUsS0FBSyxJQUFJLEVBQUUsQ0FBQztRQUNoQyxNQUFNLFdBQVcsR0FBRyxZQUFZLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUUsQ0FBQztRQUNsRCxNQUFNLE1BQU0sR0FDVixFQUFFLENBQUMsY0FBYyxLQUFLLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxRQUFRO1lBQ3ZELENBQUMsQ0FBQyxXQUFXLENBQUMsTUFBTTtZQUNwQixDQUFDLENBQUMsV0FBVyxDQUFDLG9CQUFvQixDQUFDO1FBQ3ZDLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNwRCxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ25CLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLGVBQWUsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUN6QyxDQUFDO0lBQ0QsSUFBSSxFQUFFLENBQUMsY0FBYyxLQUFLLElBQUksRUFBRSxDQUFDO1FBQy9CLE1BQU0sZ0JBQWdCLEdBQUcsZUFBZSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDaEUsZ0JBQWdCLEVBQUUsc0JBQXNCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3ZELENBQUM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIGlyIGZyb20gJy4uLy4uL2lyJztcbmltcG9ydCB7Q29tcG9uZW50Q29tcGlsYXRpb25Kb2J9IGZyb20gJy4uL2NvbXBpbGF0aW9uJztcblxuLyoqXG4gKiBSZXNvbHZlIHRoZSBpMThuIGV4cHJlc3Npb24gcGxhY2Vob2xkZXJzIGluIGkxOG4gbWVzc2FnZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlSTE4bkV4cHJlc3Npb25QbGFjZWhvbGRlcnMoam9iOiBDb21wb25lbnRDb21waWxhdGlvbkpvYikge1xuICAvLyBSZWNvcmQgYWxsIG9mIHRoZSBpMThuIGNvbnRleHQgb3BzLCBhbmQgdGhlIHN1Yi10ZW1wbGF0ZSBpbmRleCBmb3IgZWFjaCBpMThuIG9wLlxuICBjb25zdCBzdWJUZW1wbGF0ZUluZGljZXMgPSBuZXcgTWFwPGlyLlhyZWZJZCwgbnVtYmVyIHwgbnVsbD4oKTtcbiAgY29uc3QgaTE4bkNvbnRleHRzID0gbmV3IE1hcDxpci5YcmVmSWQsIGlyLkkxOG5Db250ZXh0T3A+KCk7XG4gIGNvbnN0IGljdVBsYWNlaG9sZGVycyA9IG5ldyBNYXA8aXIuWHJlZklkLCBpci5JY3VQbGFjZWhvbGRlck9wPigpO1xuICBmb3IgKGNvbnN0IHVuaXQgb2Ygam9iLnVuaXRzKSB7XG4gICAgZm9yIChjb25zdCBvcCBvZiB1bml0LmNyZWF0ZSkge1xuICAgICAgc3dpdGNoIChvcC5raW5kKSB7XG4gICAgICAgIGNhc2UgaXIuT3BLaW5kLkkxOG5TdGFydDpcbiAgICAgICAgICBzdWJUZW1wbGF0ZUluZGljZXMuc2V0KG9wLnhyZWYsIG9wLnN1YlRlbXBsYXRlSW5kZXgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIGlyLk9wS2luZC5JMThuQ29udGV4dDpcbiAgICAgICAgICBpMThuQ29udGV4dHMuc2V0KG9wLnhyZWYsIG9wKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBpci5PcEtpbmQuSWN1UGxhY2Vob2xkZXI6XG4gICAgICAgICAgaWN1UGxhY2Vob2xkZXJzLnNldChvcC54cmVmLCBvcCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gS2VlcCB0cmFjayBvZiB0aGUgbmV4dCBhdmFpbGFibGUgZXhwcmVzc2lvbiBpbmRleCBmb3IgZWFjaCBpMThuIG1lc3NhZ2UuXG4gIGNvbnN0IGV4cHJlc3Npb25JbmRpY2VzID0gbmV3IE1hcDxpci5YcmVmSWQsIG51bWJlcj4oKTtcblxuICAvLyBLZWVwIHRyYWNrIG9mIGEgcmVmZXJlbmNlIGluZGV4IGZvciBlYWNoIGV4cHJlc3Npb24uXG4gIC8vIFdlIHVzZSBkaWZmZXJlbnQgcmVmZXJlbmNlcyBmb3Igbm9ybWFsIGkxOG4gZXhwcmVzc2lvIGFuZCBhdHRyaWJ1dGUgaTE4biBleHByZXNzaW9ucy4gVGhpcyBpc1xuICAvLyBiZWNhdXNlIGNoaWxkIGkxOG4gYmxvY2tzIGluIHRlbXBsYXRlcyBkb24ndCBnZXQgdGhlaXIgb3duIGNvbnRleHQsIHNpbmNlIHRoZXkncmUgcm9sbGVkIGludG9cbiAgLy8gdGhlIHRyYW5zbGF0ZWQgbWVzc2FnZSBvZiB0aGUgcGFyZW50LCBidXQgdGhleSBtYXkgdGFyZ2V0IGEgZGlmZmVyZW50IHNsb3QuXG4gIGNvbnN0IHJlZmVyZW5jZUluZGV4ID0gKG9wOiBpci5JMThuRXhwcmVzc2lvbk9wKTogaXIuWHJlZklkID0+XG4gICAgb3AudXNhZ2UgPT09IGlyLkkxOG5FeHByZXNzaW9uRm9yLkkxOG5UZXh0ID8gb3AuaTE4bk93bmVyIDogb3AuY29udGV4dDtcblxuICBmb3IgKGNvbnN0IHVuaXQgb2Ygam9iLnVuaXRzKSB7XG4gICAgZm9yIChjb25zdCBvcCBvZiB1bml0LnVwZGF0ZSkge1xuICAgICAgaWYgKG9wLmtpbmQgPT09IGlyLk9wS2luZC5JMThuRXhwcmVzc2lvbikge1xuICAgICAgICBjb25zdCBpbmRleCA9IGV4cHJlc3Npb25JbmRpY2VzLmdldChyZWZlcmVuY2VJbmRleChvcCkpIHx8IDA7XG4gICAgICAgIGNvbnN0IHN1YlRlbXBsYXRlSW5kZXggPSBzdWJUZW1wbGF0ZUluZGljZXMuZ2V0KG9wLmkxOG5Pd25lcikgPz8gbnVsbDtcbiAgICAgICAgY29uc3QgdmFsdWU6IGlyLkkxOG5QYXJhbVZhbHVlID0ge1xuICAgICAgICAgIHZhbHVlOiBpbmRleCxcbiAgICAgICAgICBzdWJUZW1wbGF0ZUluZGV4OiBzdWJUZW1wbGF0ZUluZGV4LFxuICAgICAgICAgIGZsYWdzOiBpci5JMThuUGFyYW1WYWx1ZUZsYWdzLkV4cHJlc3Npb25JbmRleCxcbiAgICAgICAgfTtcbiAgICAgICAgdXBkYXRlUGxhY2Vob2xkZXIob3AsIHZhbHVlLCBpMThuQ29udGV4dHMsIGljdVBsYWNlaG9sZGVycyk7XG4gICAgICAgIGV4cHJlc3Npb25JbmRpY2VzLnNldChyZWZlcmVuY2VJbmRleChvcCksIGluZGV4ICsgMSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZVBsYWNlaG9sZGVyKFxuICBvcDogaXIuSTE4bkV4cHJlc3Npb25PcCxcbiAgdmFsdWU6IGlyLkkxOG5QYXJhbVZhbHVlLFxuICBpMThuQ29udGV4dHM6IE1hcDxpci5YcmVmSWQsIGlyLkkxOG5Db250ZXh0T3A+LFxuICBpY3VQbGFjZWhvbGRlcnM6IE1hcDxpci5YcmVmSWQsIGlyLkljdVBsYWNlaG9sZGVyT3A+LFxuKSB7XG4gIGlmIChvcC5pMThuUGxhY2Vob2xkZXIgIT09IG51bGwpIHtcbiAgICBjb25zdCBpMThuQ29udGV4dCA9IGkxOG5Db250ZXh0cy5nZXQob3AuY29udGV4dCkhO1xuICAgIGNvbnN0IHBhcmFtcyA9XG4gICAgICBvcC5yZXNvbHV0aW9uVGltZSA9PT0gaXIuSTE4blBhcmFtUmVzb2x1dGlvblRpbWUuQ3JlYXRpb25cbiAgICAgICAgPyBpMThuQ29udGV4dC5wYXJhbXNcbiAgICAgICAgOiBpMThuQ29udGV4dC5wb3N0cHJvY2Vzc2luZ1BhcmFtcztcbiAgICBjb25zdCB2YWx1ZXMgPSBwYXJhbXMuZ2V0KG9wLmkxOG5QbGFjZWhvbGRlcikgfHwgW107XG4gICAgdmFsdWVzLnB1c2godmFsdWUpO1xuICAgIHBhcmFtcy5zZXQob3AuaTE4blBsYWNlaG9sZGVyLCB2YWx1ZXMpO1xuICB9XG4gIGlmIChvcC5pY3VQbGFjZWhvbGRlciAhPT0gbnVsbCkge1xuICAgIGNvbnN0IGljdVBsYWNlaG9sZGVyT3AgPSBpY3VQbGFjZWhvbGRlcnMuZ2V0KG9wLmljdVBsYWNlaG9sZGVyKTtcbiAgICBpY3VQbGFjZWhvbGRlck9wPy5leHByZXNzaW9uUGxhY2Vob2xkZXJzLnB1c2godmFsdWUpO1xuICB9XG59XG4iXX0=