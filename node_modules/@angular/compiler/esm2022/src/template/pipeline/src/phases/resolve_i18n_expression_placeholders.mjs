/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb2x2ZV9pMThuX2V4cHJlc3Npb25fcGxhY2Vob2xkZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3RlbXBsYXRlL3BpcGVsaW5lL3NyYy9waGFzZXMvcmVzb2x2ZV9pMThuX2V4cHJlc3Npb25fcGxhY2Vob2xkZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sS0FBSyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRy9COztHQUVHO0FBQ0gsTUFBTSxVQUFVLGlDQUFpQyxDQUFDLEdBQTRCO0lBQzVFLG1GQUFtRjtJQUNuRixNQUFNLGtCQUFrQixHQUFHLElBQUksR0FBRyxFQUE0QixDQUFDO0lBQy9ELE1BQU0sWUFBWSxHQUFHLElBQUksR0FBRyxFQUErQixDQUFDO0lBQzVELE1BQU0sZUFBZSxHQUFHLElBQUksR0FBRyxFQUFrQyxDQUFDO0lBQ2xFLEtBQUssTUFBTSxJQUFJLElBQUksR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzdCLEtBQUssTUFBTSxFQUFFLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQzdCLFFBQVEsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNoQixLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUztvQkFDdEIsa0JBQWtCLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLGdCQUFnQixDQUFDLENBQUM7b0JBQ3JELE1BQU07Z0JBQ1IsS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLFdBQVc7b0JBQ3hCLFlBQVksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztvQkFDOUIsTUFBTTtnQkFDUixLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsY0FBYztvQkFDM0IsZUFBZSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO29CQUNqQyxNQUFNO1lBQ1YsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0lBRUQsMkVBQTJFO0lBQzNFLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxHQUFHLEVBQXFCLENBQUM7SUFFdkQsdURBQXVEO0lBQ3ZELGdHQUFnRztJQUNoRyxnR0FBZ0c7SUFDaEcsOEVBQThFO0lBQzlFLE1BQU0sY0FBYyxHQUFHLENBQUMsRUFBdUIsRUFBYSxFQUFFLENBQzVELEVBQUUsQ0FBQyxLQUFLLEtBQUssRUFBRSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQztJQUV6RSxLQUFLLE1BQU0sSUFBSSxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM3QixLQUFLLE1BQU0sRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUM3QixJQUFJLEVBQUUsQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDekMsTUFBTSxLQUFLLEdBQUcsaUJBQWlCLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDN0QsTUFBTSxnQkFBZ0IsR0FBRyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLElBQUksQ0FBQztnQkFDdEUsTUFBTSxLQUFLLEdBQXNCO29CQUMvQixLQUFLLEVBQUUsS0FBSztvQkFDWixnQkFBZ0IsRUFBRSxnQkFBZ0I7b0JBQ2xDLEtBQUssRUFBRSxFQUFFLENBQUMsbUJBQW1CLENBQUMsZUFBZTtpQkFDOUMsQ0FBQztnQkFDRixpQkFBaUIsQ0FBQyxFQUFFLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRSxlQUFlLENBQUMsQ0FBQztnQkFDNUQsaUJBQWlCLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDdkQsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0FBQ0gsQ0FBQztBQUVELFNBQVMsaUJBQWlCLENBQ3hCLEVBQXVCLEVBQ3ZCLEtBQXdCLEVBQ3hCLFlBQThDLEVBQzlDLGVBQW9EO0lBRXBELElBQUksRUFBRSxDQUFDLGVBQWUsS0FBSyxJQUFJLEVBQUUsQ0FBQztRQUNoQyxNQUFNLFdBQVcsR0FBRyxZQUFZLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUUsQ0FBQztRQUNsRCxNQUFNLE1BQU0sR0FDVixFQUFFLENBQUMsY0FBYyxLQUFLLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxRQUFRO1lBQ3ZELENBQUMsQ0FBQyxXQUFXLENBQUMsTUFBTTtZQUNwQixDQUFDLENBQUMsV0FBVyxDQUFDLG9CQUFvQixDQUFDO1FBQ3ZDLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNwRCxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ25CLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLGVBQWUsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUN6QyxDQUFDO0lBQ0QsSUFBSSxFQUFFLENBQUMsY0FBYyxLQUFLLElBQUksRUFBRSxDQUFDO1FBQy9CLE1BQU0sZ0JBQWdCLEdBQUcsZUFBZSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDaEUsZ0JBQWdCLEVBQUUsc0JBQXNCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3ZELENBQUM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBpciBmcm9tICcuLi8uLi9pcic7XG5pbXBvcnQge0NvbXBvbmVudENvbXBpbGF0aW9uSm9ifSBmcm9tICcuLi9jb21waWxhdGlvbic7XG5cbi8qKlxuICogUmVzb2x2ZSB0aGUgaTE4biBleHByZXNzaW9uIHBsYWNlaG9sZGVycyBpbiBpMThuIG1lc3NhZ2VzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZUkxOG5FeHByZXNzaW9uUGxhY2Vob2xkZXJzKGpvYjogQ29tcG9uZW50Q29tcGlsYXRpb25Kb2IpIHtcbiAgLy8gUmVjb3JkIGFsbCBvZiB0aGUgaTE4biBjb250ZXh0IG9wcywgYW5kIHRoZSBzdWItdGVtcGxhdGUgaW5kZXggZm9yIGVhY2ggaTE4biBvcC5cbiAgY29uc3Qgc3ViVGVtcGxhdGVJbmRpY2VzID0gbmV3IE1hcDxpci5YcmVmSWQsIG51bWJlciB8IG51bGw+KCk7XG4gIGNvbnN0IGkxOG5Db250ZXh0cyA9IG5ldyBNYXA8aXIuWHJlZklkLCBpci5JMThuQ29udGV4dE9wPigpO1xuICBjb25zdCBpY3VQbGFjZWhvbGRlcnMgPSBuZXcgTWFwPGlyLlhyZWZJZCwgaXIuSWN1UGxhY2Vob2xkZXJPcD4oKTtcbiAgZm9yIChjb25zdCB1bml0IG9mIGpvYi51bml0cykge1xuICAgIGZvciAoY29uc3Qgb3Agb2YgdW5pdC5jcmVhdGUpIHtcbiAgICAgIHN3aXRjaCAob3Aua2luZCkge1xuICAgICAgICBjYXNlIGlyLk9wS2luZC5JMThuU3RhcnQ6XG4gICAgICAgICAgc3ViVGVtcGxhdGVJbmRpY2VzLnNldChvcC54cmVmLCBvcC5zdWJUZW1wbGF0ZUluZGV4KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBpci5PcEtpbmQuSTE4bkNvbnRleHQ6XG4gICAgICAgICAgaTE4bkNvbnRleHRzLnNldChvcC54cmVmLCBvcCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgaXIuT3BLaW5kLkljdVBsYWNlaG9sZGVyOlxuICAgICAgICAgIGljdVBsYWNlaG9sZGVycy5zZXQob3AueHJlZiwgb3ApO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIEtlZXAgdHJhY2sgb2YgdGhlIG5leHQgYXZhaWxhYmxlIGV4cHJlc3Npb24gaW5kZXggZm9yIGVhY2ggaTE4biBtZXNzYWdlLlxuICBjb25zdCBleHByZXNzaW9uSW5kaWNlcyA9IG5ldyBNYXA8aXIuWHJlZklkLCBudW1iZXI+KCk7XG5cbiAgLy8gS2VlcCB0cmFjayBvZiBhIHJlZmVyZW5jZSBpbmRleCBmb3IgZWFjaCBleHByZXNzaW9uLlxuICAvLyBXZSB1c2UgZGlmZmVyZW50IHJlZmVyZW5jZXMgZm9yIG5vcm1hbCBpMThuIGV4cHJlc3NpbyBhbmQgYXR0cmlidXRlIGkxOG4gZXhwcmVzc2lvbnMuIFRoaXMgaXNcbiAgLy8gYmVjYXVzZSBjaGlsZCBpMThuIGJsb2NrcyBpbiB0ZW1wbGF0ZXMgZG9uJ3QgZ2V0IHRoZWlyIG93biBjb250ZXh0LCBzaW5jZSB0aGV5J3JlIHJvbGxlZCBpbnRvXG4gIC8vIHRoZSB0cmFuc2xhdGVkIG1lc3NhZ2Ugb2YgdGhlIHBhcmVudCwgYnV0IHRoZXkgbWF5IHRhcmdldCBhIGRpZmZlcmVudCBzbG90LlxuICBjb25zdCByZWZlcmVuY2VJbmRleCA9IChvcDogaXIuSTE4bkV4cHJlc3Npb25PcCk6IGlyLlhyZWZJZCA9PlxuICAgIG9wLnVzYWdlID09PSBpci5JMThuRXhwcmVzc2lvbkZvci5JMThuVGV4dCA/IG9wLmkxOG5Pd25lciA6IG9wLmNvbnRleHQ7XG5cbiAgZm9yIChjb25zdCB1bml0IG9mIGpvYi51bml0cykge1xuICAgIGZvciAoY29uc3Qgb3Agb2YgdW5pdC51cGRhdGUpIHtcbiAgICAgIGlmIChvcC5raW5kID09PSBpci5PcEtpbmQuSTE4bkV4cHJlc3Npb24pIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSBleHByZXNzaW9uSW5kaWNlcy5nZXQocmVmZXJlbmNlSW5kZXgob3ApKSB8fCAwO1xuICAgICAgICBjb25zdCBzdWJUZW1wbGF0ZUluZGV4ID0gc3ViVGVtcGxhdGVJbmRpY2VzLmdldChvcC5pMThuT3duZXIpID8/IG51bGw7XG4gICAgICAgIGNvbnN0IHZhbHVlOiBpci5JMThuUGFyYW1WYWx1ZSA9IHtcbiAgICAgICAgICB2YWx1ZTogaW5kZXgsXG4gICAgICAgICAgc3ViVGVtcGxhdGVJbmRleDogc3ViVGVtcGxhdGVJbmRleCxcbiAgICAgICAgICBmbGFnczogaXIuSTE4blBhcmFtVmFsdWVGbGFncy5FeHByZXNzaW9uSW5kZXgsXG4gICAgICAgIH07XG4gICAgICAgIHVwZGF0ZVBsYWNlaG9sZGVyKG9wLCB2YWx1ZSwgaTE4bkNvbnRleHRzLCBpY3VQbGFjZWhvbGRlcnMpO1xuICAgICAgICBleHByZXNzaW9uSW5kaWNlcy5zZXQocmVmZXJlbmNlSW5kZXgob3ApLCBpbmRleCArIDEpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiB1cGRhdGVQbGFjZWhvbGRlcihcbiAgb3A6IGlyLkkxOG5FeHByZXNzaW9uT3AsXG4gIHZhbHVlOiBpci5JMThuUGFyYW1WYWx1ZSxcbiAgaTE4bkNvbnRleHRzOiBNYXA8aXIuWHJlZklkLCBpci5JMThuQ29udGV4dE9wPixcbiAgaWN1UGxhY2Vob2xkZXJzOiBNYXA8aXIuWHJlZklkLCBpci5JY3VQbGFjZWhvbGRlck9wPixcbikge1xuICBpZiAob3AuaTE4blBsYWNlaG9sZGVyICE9PSBudWxsKSB7XG4gICAgY29uc3QgaTE4bkNvbnRleHQgPSBpMThuQ29udGV4dHMuZ2V0KG9wLmNvbnRleHQpITtcbiAgICBjb25zdCBwYXJhbXMgPVxuICAgICAgb3AucmVzb2x1dGlvblRpbWUgPT09IGlyLkkxOG5QYXJhbVJlc29sdXRpb25UaW1lLkNyZWF0aW9uXG4gICAgICAgID8gaTE4bkNvbnRleHQucGFyYW1zXG4gICAgICAgIDogaTE4bkNvbnRleHQucG9zdHByb2Nlc3NpbmdQYXJhbXM7XG4gICAgY29uc3QgdmFsdWVzID0gcGFyYW1zLmdldChvcC5pMThuUGxhY2Vob2xkZXIpIHx8IFtdO1xuICAgIHZhbHVlcy5wdXNoKHZhbHVlKTtcbiAgICBwYXJhbXMuc2V0KG9wLmkxOG5QbGFjZWhvbGRlciwgdmFsdWVzKTtcbiAgfVxuICBpZiAob3AuaWN1UGxhY2Vob2xkZXIgIT09IG51bGwpIHtcbiAgICBjb25zdCBpY3VQbGFjZWhvbGRlck9wID0gaWN1UGxhY2Vob2xkZXJzLmdldChvcC5pY3VQbGFjZWhvbGRlcik7XG4gICAgaWN1UGxhY2Vob2xkZXJPcD8uZXhwcmVzc2lvblBsYWNlaG9sZGVycy5wdXNoKHZhbHVlKTtcbiAgfVxufVxuIl19