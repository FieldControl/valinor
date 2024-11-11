/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as ir from '../../ir';
/**
 * Removes text nodes within i18n blocks since they are already hardcoded into the i18n message.
 * Also, replaces interpolations on these text nodes with i18n expressions of the non-text portions,
 * which will be applied later.
 */
export function convertI18nText(job) {
    for (const unit of job.units) {
        // Remove all text nodes within i18n blocks, their content is already captured in the i18n
        // message.
        let currentI18n = null;
        let currentIcu = null;
        const textNodeI18nBlocks = new Map();
        const textNodeIcus = new Map();
        const icuPlaceholderByText = new Map();
        for (const op of unit.create) {
            switch (op.kind) {
                case ir.OpKind.I18nStart:
                    if (op.context === null) {
                        throw Error('I18n op should have its context set.');
                    }
                    currentI18n = op;
                    break;
                case ir.OpKind.I18nEnd:
                    currentI18n = null;
                    break;
                case ir.OpKind.IcuStart:
                    if (op.context === null) {
                        throw Error('Icu op should have its context set.');
                    }
                    currentIcu = op;
                    break;
                case ir.OpKind.IcuEnd:
                    currentIcu = null;
                    break;
                case ir.OpKind.Text:
                    if (currentI18n !== null) {
                        textNodeI18nBlocks.set(op.xref, currentI18n);
                        textNodeIcus.set(op.xref, currentIcu);
                        if (op.icuPlaceholder !== null) {
                            // Create an op to represent the ICU placeholder. Initially set its static text to the
                            // value of the text op, though this may be overwritten later if this text op is a
                            // placeholder for an interpolation.
                            const icuPlaceholderOp = ir.createIcuPlaceholderOp(job.allocateXrefId(), op.icuPlaceholder, [op.initialValue]);
                            ir.OpList.replace(op, icuPlaceholderOp);
                            icuPlaceholderByText.set(op.xref, icuPlaceholderOp);
                        }
                        else {
                            // Otherwise just remove the text op, since its value is already accounted for in the
                            // translated message.
                            ir.OpList.remove(op);
                        }
                    }
                    break;
            }
        }
        // Update any interpolations to the removed text, and instead represent them as a series of i18n
        // expressions that we then apply.
        for (const op of unit.update) {
            switch (op.kind) {
                case ir.OpKind.InterpolateText:
                    if (!textNodeI18nBlocks.has(op.target)) {
                        continue;
                    }
                    const i18nOp = textNodeI18nBlocks.get(op.target);
                    const icuOp = textNodeIcus.get(op.target);
                    const icuPlaceholder = icuPlaceholderByText.get(op.target);
                    const contextId = icuOp ? icuOp.context : i18nOp.context;
                    const resolutionTime = icuOp
                        ? ir.I18nParamResolutionTime.Postproccessing
                        : ir.I18nParamResolutionTime.Creation;
                    const ops = [];
                    for (let i = 0; i < op.interpolation.expressions.length; i++) {
                        const expr = op.interpolation.expressions[i];
                        // For now, this i18nExpression depends on the slot context of the enclosing i18n block.
                        // Later, we will modify this, and advance to a different point.
                        ops.push(ir.createI18nExpressionOp(contextId, i18nOp.xref, i18nOp.xref, i18nOp.handle, expr, icuPlaceholder?.xref ?? null, op.interpolation.i18nPlaceholders[i] ?? null, resolutionTime, ir.I18nExpressionFor.I18nText, '', expr.sourceSpan ?? op.sourceSpan));
                    }
                    ir.OpList.replaceWithMany(op, ops);
                    // If this interpolation is part of an ICU placeholder, add the strings and expressions to
                    // the placeholder.
                    if (icuPlaceholder !== undefined) {
                        icuPlaceholder.strings = op.interpolation.strings;
                    }
                    break;
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaTE4bl90ZXh0X2V4dHJhY3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvdGVtcGxhdGUvcGlwZWxpbmUvc3JjL3BoYXNlcy9pMThuX3RleHRfZXh0cmFjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEtBQUssRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUcvQjs7OztHQUlHO0FBQ0gsTUFBTSxVQUFVLGVBQWUsQ0FBQyxHQUFtQjtJQUNqRCxLQUFLLE1BQU0sSUFBSSxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM3QiwwRkFBMEY7UUFDMUYsV0FBVztRQUNYLElBQUksV0FBVyxHQUEwQixJQUFJLENBQUM7UUFDOUMsSUFBSSxVQUFVLEdBQXlCLElBQUksQ0FBQztRQUM1QyxNQUFNLGtCQUFrQixHQUFHLElBQUksR0FBRyxFQUE2QixDQUFDO1FBQ2hFLE1BQU0sWUFBWSxHQUFHLElBQUksR0FBRyxFQUFtQyxDQUFDO1FBQ2hFLE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxHQUFHLEVBQWtDLENBQUM7UUFDdkUsS0FBSyxNQUFNLEVBQUUsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDN0IsUUFBUSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2hCLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxTQUFTO29CQUN0QixJQUFJLEVBQUUsQ0FBQyxPQUFPLEtBQUssSUFBSSxFQUFFLENBQUM7d0JBQ3hCLE1BQU0sS0FBSyxDQUFDLHNDQUFzQyxDQUFDLENBQUM7b0JBQ3RELENBQUM7b0JBQ0QsV0FBVyxHQUFHLEVBQUUsQ0FBQztvQkFDakIsTUFBTTtnQkFDUixLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTztvQkFDcEIsV0FBVyxHQUFHLElBQUksQ0FBQztvQkFDbkIsTUFB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LENBQUMsQ0FBQyxDQUFDO3dCQUM3Qyx3RkFBd0Y7d0JBQ3hGLGdFQUFnRTt3QkFDaEUsR0FBRyxDQUFDLElBQUksQ0FDTixFQUFFLENBQUMsc0JBQXNCLENBQ3ZCLFNBQVUsRUFDVixNQUFNLENBQUMsSUFBSSxFQUNYLE1BQU0sQ0FBQyxJQUFJLEVBQ1gsTUFBTSxDQUFDLE1BQU0sRUFDYixJQUFJLEVBQ0osY0FBYyxFQUFFLElBQUksSUFBSSxJQUFJLEVBQzVCLEVBQUUsQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxFQUM1QyxjQUFjLEVBQ2QsRUFBRSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsRUFDN0IsRUFBRSxFQUNGLElBQUksQ0FBQyxVQUFVLElBQUksRUFBRSxDQUFDLFVBQVUsQ0FDakMsQ0FDRixDQUFDO29CQUNKLENBQUM7b0JBQ0QsRUFBRSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsRUFBaUIsRUFBRSxHQUFHLENBQUMsQ0FBQztvQkFDbEQsMEZBQTBGO29CQUMxRixtQkFBbUI7b0JBQ25CLElBQUksY0FBYyxLQUFLLFNBQVMsRUFBRSxDQUFDO3dCQUNqQyxjQUFjLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDO29CQUNwRCxDQUFDO29CQUNELE1BQU07WUFDVixDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBpciBmcm9tICcuLi8uLi9pcic7XG5pbXBvcnQge0NvbXBpbGF0aW9uSm9ifSBmcm9tICcuLi9jb21waWxhdGlvbic7XG5cbi8qKlxuICogUmVtb3ZlcyB0ZXh0IG5vZGVzIHdpdGhpbiBpMThuIGJsb2NrcyBzaW5jZSB0aGV5IGFyZSBhbHJlYWR5IGhhcmRjb2RlZCBpbnRvIHRoZSBpMThuIG1lc3NhZ2UuXG4gKiBBbHNvLCByZXBsYWNlcyBpbnRlcnBvbGF0aW9ucyBvbiB0aGVzZSB0ZXh0IG5vZGVzIHdpdGggaTE4biBleHByZXNzaW9ucyBvZiB0aGUgbm9uLXRleHQgcG9ydGlvbnMsXG4gKiB3aGljaCB3aWxsIGJlIGFwcGxpZWQgbGF0ZXIuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb252ZXJ0STE4blRleHQoam9iOiBDb21waWxhdGlvbkpvYik6IHZvaWQge1xuICBmb3IgKGNvbnN0IHVuaXQgb2Ygam9iLnVuaXRzKSB7XG4gICAgLy8gUmVtb3ZlIGFsbCB0ZXh0IG5vZGVzIHdpdGhpbiBpMThuIGJsb2NrcywgdGhlaXIgY29udGVudCBpcyBhbHJlYWR5IGNhcHR1cmVkIGluIHRoZSBpMThuXG4gICAgLy8gbWVzc2FnZS5cbiAgICBsZXQgY3VycmVudEkxOG46IGlyLkkxOG5TdGFydE9wIHwgbnVsbCA9IG51bGw7XG4gICAgbGV0IGN1cnJlbnRJY3U6IGlyLkljdVN0YXJ0T3AgfCBudWxsID0gbnVsbDtcbiAgICBjb25zdCB0ZXh0Tm9kZUkxOG5CbG9ja3MgPSBuZXcgTWFwPGlyLlhyZWZJZCwgaXIuSTE4blN0YXJ0T3A+KCk7XG4gICAgY29uc3QgdGV4dE5vZGVJY3VzID0gbmV3IE1hcDxpci5YcmVmSWQsIGlyLkljdVN0YXJ0T3AgfCBudWxsPigpO1xuICAgIGNvbnN0IGljdVBsYWNlaG9sZGVyQnlUZXh0ID0gbmV3IE1hcDxpci5YcmVmSWQsIGlyLkljdVBsYWNlaG9sZGVyT3A+KCk7XG4gICAgZm9yIChjb25zdCBvcCBvZiB1bml0LmNyZWF0ZSkge1xuICAgICAgc3dpdGNoIChvcC5raW5kKSB7XG4gICAgICAgIGNhc2UgaXIuT3BLaW5kLkkxOG5TdGFydDpcbiAgICAgICAgICBpZiAob3AuY29udGV4dCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdGhyb3cgRXJyb3IoJ0kxOG4gb3Agc2hvdWxkIGhhdmUgaXRzIGNvbnRleHQgc2V0LicpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjdXJyZW50STE4biA9IG9wO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIGlyLk9wS2luZC5JMThuRW5kOlxuICAgICAgICAgIGN1cnJlbnRJMThuID0gbnVsbDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBpci5PcEtpbmQuSWN1U3RhcnQ6XG4gICAgICAgICAgaWYgKG9wLmNvbnRleHQgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRocm93IEVycm9yKCdJY3Ugb3Agc2hvdWxkIGhhdmUgaXRzIGNvbnRleHQgc2V0LicpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjdXJyZW50SWN1ID0gb3A7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgaXIuT3BLaW5kLkljdUVuZDpcbiAgICAgICAgICBjdXJyZW50SWN1ID0gbnVsbDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBpci5PcEtpbmQuVGV4dDpcbiAgICAgICAgICBpZiAoY3VycmVudEkxOG4gIT09IG51bGwpIHtcbiAgICAgICAgICAgIHRleHROb2RlSTE4bkJsb2Nrcy5zZXQob3AueHJlZiwgY3VycmVudEkxOG4pO1xuICAgICAgICAgICAgdGV4dE5vZGVJY3VzLnNldChvcC54cmVmLCBjdXJyZW50SWN1KTtcbiAgICAgICAgICAgIGlmIChvcC5pY3VQbGFjZWhvbGRlciAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAvLyBDcmVhdGUgYW4gb3AgdG8gcmVwcmVzZW50IHRoZSBJQ1UgcGxhY2Vob2xkZXIuIEluaXRpYWxseSBzZXQgaXRzIHN0YXRpYyB0ZXh0IHRvIHRoZVxuICAgICAgICAgICAgICAvLyB2YWx1ZSBvZiB0aGUgdGV4dCBvcCwgdGhvdWdoIHRoaXMgbWF5IGJlIG92ZXJ3cml0dGVuIGxhdGVyIGlmIHRoaXMgdGV4dCBvcCBpcyBhXG4gICAgICAgICAgICAgIC8vIHBsYWNlaG9sZGVyIGZvciBhbiBpbnRlcnBvbGF0aW9uLlxuICAgICAgICAgICAgICBjb25zdCBpY3VQbGFjZWhvbGRlck9wID0gaXIuY3JlYXRlSWN1UGxhY2Vob2xkZXJPcChcbiAgICAgICAgICAgICAgICBqb2IuYWxsb2NhdGVYcmVmSWQoKSxcbiAgICAgICAgICAgICAgICBvcC5pY3VQbGFjZWhvbGRlcixcbiAgICAgICAgICAgICAgICBbb3AuaW5pdGlhbFZhbHVlXSxcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgaXIuT3BMaXN0LnJlcGxhY2U8aXIuQ3JlYXRlT3A+KG9wLCBpY3VQbGFjZWhvbGRlck9wKTtcbiAgICAgICAgICAgICAgaWN1UGxhY2Vob2xkZXJCeVRleHQuc2V0KG9wLnhyZWYsIGljdVBsYWNlaG9sZGVyT3ApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gT3RoZXJ3aXNlIGp1c3QgcmVtb3ZlIHRoZSB0ZXh0IG9wLCBzaW5jZSBpdHMgdmFsdWUgaXMgYWxyZWFkeSBhY2NvdW50ZWQgZm9yIGluIHRoZVxuICAgICAgICAgICAgICAvLyB0cmFuc2xhdGVkIG1lc3NhZ2UuXG4gICAgICAgICAgICAgIGlyLk9wTGlzdC5yZW1vdmU8aXIuQ3JlYXRlT3A+KG9wKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gVXBkYXRlIGFueSBpbnRlcnBvbGF0aW9ucyB0byB0aGUgcmVtb3ZlZCB0ZXh0LCBhbmQgaW5zdGVhZCByZXByZXNlbnQgdGhlbSBhcyBhIHNlcmllcyBvZiBpMThuXG4gICAgLy8gZXhwcmVzc2lvbnMgdGhhdCB3ZSB0aGVuIGFwcGx5LlxuICAgIGZvciAoY29uc3Qgb3Agb2YgdW5pdC51cGRhdGUpIHtcbiAgICAgIHN3aXRjaCAob3Aua2luZCkge1xuICAgICAgICBjYXNlIGlyLk9wS2luZC5JbnRlcnBvbGF0ZVRleHQ6XG4gICAgICAgICAgaWYgKCF0ZXh0Tm9kZUkxOG5CbG9ja3MuaGFzKG9wLnRhcmdldCkpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IGkxOG5PcCA9IHRleHROb2RlSTE4bkJsb2Nrcy5nZXQob3AudGFyZ2V0KSE7XG4gICAgICAgICAgY29uc3QgaWN1T3AgPSB0ZXh0Tm9kZUljdXMuZ2V0KG9wLnRhcmdldCk7XG4gICAgICAgICAgY29uc3QgaWN1UGxhY2Vob2xkZXIgPSBpY3VQbGFjZWhvbGRlckJ5VGV4dC5nZXQob3AudGFyZ2V0KTtcbiAgICAgICAgICBjb25zdCBjb250ZXh0SWQgPSBpY3VPcCA/IGljdU9wLmNvbnRleHQgOiBpMThuT3AuY29udGV4dDtcbiAgICAgICAgICBjb25zdCByZXNvbHV0aW9uVGltZSA9IGljdU9wXG4gICAgICAgICAgICA/IGlyLkkxOG5QYXJhbVJlc29sdXRpb25UaW1lLlBvc3Rwcm9jY2Vzc2luZ1xuICAgICAgICAgICAgOiBpci5JMThuUGFyYW1SZXNvbHV0aW9uVGltZS5DcmVhdGlvbjtcbiAgICAgICAgICBjb25zdCBvcHM6IGlyLkkxOG5FeHByZXNzaW9uT3BbXSA9IFtdO1xuICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3AuaW50ZXJwb2xhdGlvbi5leHByZXNzaW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgZXhwciA9IG9wLmludGVycG9sYXRpb24uZXhwcmVzc2lvbnNbaV07XG4gICAgICAgICAgICAvLyBGb3Igbm93LCB0aGlzIGkxOG5FeHByZXNzaW9uIGRlcGVuZHMgb24gdGhlIHNsb3QgY29udGV4dCBvZiB0aGUgZW5jbG9zaW5nIGkxOG4gYmxvY2suXG4gICAgICAgICAgICAvLyBMYXRlciwgd2Ugd2lsbCBtb2RpZnkgdGhpcywgYW5kIGFkdmFuY2UgdG8gYSBkaWZmZXJlbnQgcG9pbnQuXG4gICAgICAgICAgICBvcHMucHVzaChcbiAgICAgICAgICAgICAgaXIuY3JlYXRlSTE4bkV4cHJlc3Npb25PcChcbiAgICAgICAgICAgICAgICBjb250ZXh0SWQhLFxuICAgICAgICAgICAgICAgIGkxOG5PcC54cmVmLFxuICAgICAgICAgICAgICAgIGkxOG5PcC54cmVmLFxuICAgICAgICAgICAgICAgIGkxOG5PcC5oYW5kbGUsXG4gICAgICAgICAgICAgICAgZXhwcixcbiAgICAgICAgICAgICAgICBpY3VQbGFjZWhvbGRlcj8ueHJlZiA/PyBudWxsLFxuICAgICAgICAgICAgICAgIG9wLmludGVycG9sYXRpb24uaTE4blBsYWNlaG9sZGVyc1tpXSA/PyBudWxsLFxuICAgICAgICAgICAgICAgIHJlc29sdXRpb25UaW1lLFxuICAgICAgICAgICAgICAgIGlyLkkxOG5FeHByZXNzaW9uRm9yLkkxOG5UZXh0LFxuICAgICAgICAgICAgICAgICcnLFxuICAgICAgICAgICAgICAgIGV4cHIuc291cmNlU3BhbiA/PyBvcC5zb3VyY2VTcGFuLFxuICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaXIuT3BMaXN0LnJlcGxhY2VXaXRoTWFueShvcCBhcyBpci5VcGRhdGVPcCwgb3BzKTtcbiAgICAgICAgICAvLyBJZiB0aGlzIGludGVycG9sYXRpb24gaXMgcGFydCBvZiBhbiBJQ1UgcGxhY2Vob2xkZXIsIGFkZCB0aGUgc3RyaW5ncyBhbmQgZXhwcmVzc2lvbnMgdG9cbiAgICAgICAgICAvLyB0aGUgcGxhY2Vob2xkZXIuXG4gICAgICAgICAgaWYgKGljdVBsYWNlaG9sZGVyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGljdVBsYWNlaG9sZGVyLnN0cmluZ3MgPSBvcC5pbnRlcnBvbGF0aW9uLnN0cmluZ3M7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19