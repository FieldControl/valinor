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
                    flags: ir.I18nParamValueFlags.ExpressionIndex
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
        const params = op.resolutionTime === ir.I18nParamResolutionTime.Creation ?
            i18nContext.params :
            i18nContext.postprocessingParams;
        const values = params.get(op.i18nPlaceholder) || [];
        values.push(value);
        params.set(op.i18nPlaceholder, values);
    }
    if (op.icuPlaceholder !== null) {
        const icuPlaceholderOp = icuPlaceholders.get(op.icuPlaceholder);
        icuPlaceholderOp?.expressionPlaceholders.push(value);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb2x2ZV9pMThuX2V4cHJlc3Npb25fcGxhY2Vob2xkZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3RlbXBsYXRlL3BpcGVsaW5lL3NyYy9waGFzZXMvcmVzb2x2ZV9pMThuX2V4cHJlc3Npb25fcGxhY2Vob2xkZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sS0FBSyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRy9COztHQUVHO0FBQ0gsTUFBTSxVQUFVLGlDQUFpQyxDQUFDLEdBQTRCO0lBQzVFLG1GQUFtRjtJQUNuRixNQUFNLGtCQUFrQixHQUFHLElBQUksR0FBRyxFQUEwQixDQUFDO0lBQzdELE1BQU0sWUFBWSxHQUFHLElBQUksR0FBRyxFQUErQixDQUFDO0lBQzVELE1BQU0sZUFBZSxHQUFHLElBQUksR0FBRyxFQUFrQyxDQUFDO0lBQ2xFLEtBQUssTUFBTSxJQUFJLElBQUksR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzdCLEtBQUssTUFBTSxFQUFFLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQzdCLFFBQVEsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNoQixLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUztvQkFDdEIsa0JBQWtCLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLGdCQUFnQixDQUFDLENBQUM7b0JBQ3JELE1BQU07Z0JBQ1IsS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLFdBQVc7b0JBQ3hCLFlBQVksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztvQkFDOUIsTUFBTTtnQkFDUixLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsY0FBYztvQkFDM0IsZUFBZSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO29CQUNqQyxNQUFNO1lBQ1YsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0lBRUQsMkVBQTJFO0lBQzNFLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxHQUFHLEVBQXFCLENBQUM7SUFFdkQsdURBQXVEO0lBQ3ZELGdHQUFnRztJQUNoRyxnR0FBZ0c7SUFDaEcsOEVBQThFO0lBQzlFLE1BQU0sY0FBYyxHQUFHLENBQUMsRUFBdUIsRUFBYSxFQUFFLENBQzFELEVBQUUsQ0FBQyxLQUFLLEtBQUssRUFBRSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQztJQUUzRSxLQUFLLE1BQU0sSUFBSSxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM3QixLQUFLLE1BQU0sRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUM3QixJQUFJLEVBQUUsQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDekMsTUFBTSxLQUFLLEdBQUcsaUJBQWlCLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDN0QsTUFBTSxnQkFBZ0IsR0FBRyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLElBQUksQ0FBQztnQkFDdEUsTUFBTSxLQUFLLEdBQXNCO29CQUMvQixLQUFLLEVBQUUsS0FBSztvQkFDWixnQkFBZ0IsRUFBRSxnQkFBZ0I7b0JBQ2xDLEtBQUssRUFBRSxFQUFFLENBQUMsbUJBQW1CLENBQUMsZUFBZTtpQkFDOUMsQ0FBQztnQkFDRixpQkFBaUIsQ0FBQyxFQUFFLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRSxlQUFlLENBQUMsQ0FBQztnQkFDNUQsaUJBQWlCLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDdkQsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0FBQ0gsQ0FBQztBQUVELFNBQVMsaUJBQWlCLENBQ3RCLEVBQXVCLEVBQUUsS0FBd0IsRUFDakQsWUFBOEMsRUFDOUMsZUFBb0Q7SUFDdEQsSUFBSSxFQUFFLENBQUMsZUFBZSxLQUFLLElBQUksRUFBRSxDQUFDO1FBQ2hDLE1BQU0sV0FBVyxHQUFHLFlBQVksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBRSxDQUFDO1FBQ2xELE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQyxjQUFjLEtBQUssRUFBRSxDQUFDLHVCQUF1QixDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3RFLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNwQixXQUFXLENBQUMsb0JBQW9CLENBQUM7UUFDckMsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3BELE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbkIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsZUFBZSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFDRCxJQUFJLEVBQUUsQ0FBQyxjQUFjLEtBQUssSUFBSSxFQUFFLENBQUM7UUFDL0IsTUFBTSxnQkFBZ0IsR0FBRyxlQUFlLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUNoRSxnQkFBZ0IsRUFBRSxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDdkQsQ0FBQztBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgaXIgZnJvbSAnLi4vLi4vaXInO1xuaW1wb3J0IHtDb21wb25lbnRDb21waWxhdGlvbkpvYn0gZnJvbSAnLi4vY29tcGlsYXRpb24nO1xuXG4vKipcbiAqIFJlc29sdmUgdGhlIGkxOG4gZXhwcmVzc2lvbiBwbGFjZWhvbGRlcnMgaW4gaTE4biBtZXNzYWdlcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVJMThuRXhwcmVzc2lvblBsYWNlaG9sZGVycyhqb2I6IENvbXBvbmVudENvbXBpbGF0aW9uSm9iKSB7XG4gIC8vIFJlY29yZCBhbGwgb2YgdGhlIGkxOG4gY29udGV4dCBvcHMsIGFuZCB0aGUgc3ViLXRlbXBsYXRlIGluZGV4IGZvciBlYWNoIGkxOG4gb3AuXG4gIGNvbnN0IHN1YlRlbXBsYXRlSW5kaWNlcyA9IG5ldyBNYXA8aXIuWHJlZklkLCBudW1iZXJ8bnVsbD4oKTtcbiAgY29uc3QgaTE4bkNvbnRleHRzID0gbmV3IE1hcDxpci5YcmVmSWQsIGlyLkkxOG5Db250ZXh0T3A+KCk7XG4gIGNvbnN0IGljdVBsYWNlaG9sZGVycyA9IG5ldyBNYXA8aXIuWHJlZklkLCBpci5JY3VQbGFjZWhvbGRlck9wPigpO1xuICBmb3IgKGNvbnN0IHVuaXQgb2Ygam9iLnVuaXRzKSB7XG4gICAgZm9yIChjb25zdCBvcCBvZiB1bml0LmNyZWF0ZSkge1xuICAgICAgc3dpdGNoIChvcC5raW5kKSB7XG4gICAgICAgIGNhc2UgaXIuT3BLaW5kLkkxOG5TdGFydDpcbiAgICAgICAgICBzdWJUZW1wbGF0ZUluZGljZXMuc2V0KG9wLnhyZWYsIG9wLnN1YlRlbXBsYXRlSW5kZXgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIGlyLk9wS2luZC5JMThuQ29udGV4dDpcbiAgICAgICAgICBpMThuQ29udGV4dHMuc2V0KG9wLnhyZWYsIG9wKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBpci5PcEtpbmQuSWN1UGxhY2Vob2xkZXI6XG4gICAgICAgICAgaWN1UGxhY2Vob2xkZXJzLnNldChvcC54cmVmLCBvcCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gS2VlcCB0cmFjayBvZiB0aGUgbmV4dCBhdmFpbGFibGUgZXhwcmVzc2lvbiBpbmRleCBmb3IgZWFjaCBpMThuIG1lc3NhZ2UuXG4gIGNvbnN0IGV4cHJlc3Npb25JbmRpY2VzID0gbmV3IE1hcDxpci5YcmVmSWQsIG51bWJlcj4oKTtcblxuICAvLyBLZWVwIHRyYWNrIG9mIGEgcmVmZXJlbmNlIGluZGV4IGZvciBlYWNoIGV4cHJlc3Npb24uXG4gIC8vIFdlIHVzZSBkaWZmZXJlbnQgcmVmZXJlbmNlcyBmb3Igbm9ybWFsIGkxOG4gZXhwcmVzc2lvIGFuZCBhdHRyaWJ1dGUgaTE4biBleHByZXNzaW9ucy4gVGhpcyBpc1xuICAvLyBiZWNhdXNlIGNoaWxkIGkxOG4gYmxvY2tzIGluIHRlbXBsYXRlcyBkb24ndCBnZXQgdGhlaXIgb3duIGNvbnRleHQsIHNpbmNlIHRoZXkncmUgcm9sbGVkIGludG9cbiAgLy8gdGhlIHRyYW5zbGF0ZWQgbWVzc2FnZSBvZiB0aGUgcGFyZW50LCBidXQgdGhleSBtYXkgdGFyZ2V0IGEgZGlmZmVyZW50IHNsb3QuXG4gIGNvbnN0IHJlZmVyZW5jZUluZGV4ID0gKG9wOiBpci5JMThuRXhwcmVzc2lvbk9wKTogaXIuWHJlZklkID0+XG4gICAgICBvcC51c2FnZSA9PT0gaXIuSTE4bkV4cHJlc3Npb25Gb3IuSTE4blRleHQgPyBvcC5pMThuT3duZXIgOiBvcC5jb250ZXh0O1xuXG4gIGZvciAoY29uc3QgdW5pdCBvZiBqb2IudW5pdHMpIHtcbiAgICBmb3IgKGNvbnN0IG9wIG9mIHVuaXQudXBkYXRlKSB7XG4gICAgICBpZiAob3Aua2luZCA9PT0gaXIuT3BLaW5kLkkxOG5FeHByZXNzaW9uKSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gZXhwcmVzc2lvbkluZGljZXMuZ2V0KHJlZmVyZW5jZUluZGV4KG9wKSkgfHwgMDtcbiAgICAgICAgY29uc3Qgc3ViVGVtcGxhdGVJbmRleCA9IHN1YlRlbXBsYXRlSW5kaWNlcy5nZXQob3AuaTE4bk93bmVyKSA/PyBudWxsO1xuICAgICAgICBjb25zdCB2YWx1ZTogaXIuSTE4blBhcmFtVmFsdWUgPSB7XG4gICAgICAgICAgdmFsdWU6IGluZGV4LFxuICAgICAgICAgIHN1YlRlbXBsYXRlSW5kZXg6IHN1YlRlbXBsYXRlSW5kZXgsXG4gICAgICAgICAgZmxhZ3M6IGlyLkkxOG5QYXJhbVZhbHVlRmxhZ3MuRXhwcmVzc2lvbkluZGV4XG4gICAgICAgIH07XG4gICAgICAgIHVwZGF0ZVBsYWNlaG9sZGVyKG9wLCB2YWx1ZSwgaTE4bkNvbnRleHRzLCBpY3VQbGFjZWhvbGRlcnMpO1xuICAgICAgICBleHByZXNzaW9uSW5kaWNlcy5zZXQocmVmZXJlbmNlSW5kZXgob3ApLCBpbmRleCArIDEpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiB1cGRhdGVQbGFjZWhvbGRlcihcbiAgICBvcDogaXIuSTE4bkV4cHJlc3Npb25PcCwgdmFsdWU6IGlyLkkxOG5QYXJhbVZhbHVlLFxuICAgIGkxOG5Db250ZXh0czogTWFwPGlyLlhyZWZJZCwgaXIuSTE4bkNvbnRleHRPcD4sXG4gICAgaWN1UGxhY2Vob2xkZXJzOiBNYXA8aXIuWHJlZklkLCBpci5JY3VQbGFjZWhvbGRlck9wPikge1xuICBpZiAob3AuaTE4blBsYWNlaG9sZGVyICE9PSBudWxsKSB7XG4gICAgY29uc3QgaTE4bkNvbnRleHQgPSBpMThuQ29udGV4dHMuZ2V0KG9wLmNvbnRleHQpITtcbiAgICBjb25zdCBwYXJhbXMgPSBvcC5yZXNvbHV0aW9uVGltZSA9PT0gaXIuSTE4blBhcmFtUmVzb2x1dGlvblRpbWUuQ3JlYXRpb24gP1xuICAgICAgICBpMThuQ29udGV4dC5wYXJhbXMgOlxuICAgICAgICBpMThuQ29udGV4dC5wb3N0cHJvY2Vzc2luZ1BhcmFtcztcbiAgICBjb25zdCB2YWx1ZXMgPSBwYXJhbXMuZ2V0KG9wLmkxOG5QbGFjZWhvbGRlcikgfHwgW107XG4gICAgdmFsdWVzLnB1c2godmFsdWUpO1xuICAgIHBhcmFtcy5zZXQob3AuaTE4blBsYWNlaG9sZGVyLCB2YWx1ZXMpO1xuICB9XG4gIGlmIChvcC5pY3VQbGFjZWhvbGRlciAhPT0gbnVsbCkge1xuICAgIGNvbnN0IGljdVBsYWNlaG9sZGVyT3AgPSBpY3VQbGFjZWhvbGRlcnMuZ2V0KG9wLmljdVBsYWNlaG9sZGVyKTtcbiAgICBpY3VQbGFjZWhvbGRlck9wPy5leHByZXNzaW9uUGxhY2Vob2xkZXJzLnB1c2godmFsdWUpO1xuICB9XG59XG4iXX0=