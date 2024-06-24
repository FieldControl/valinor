/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaTE4bl90ZXh0X2V4dHJhY3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvdGVtcGxhdGUvcGlwZWxpbmUvc3JjL3BoYXNlcy9pMThuX3RleHRfZXh0cmFjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEtBQUssRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUcvQjs7OztHQUlHO0FBQ0gsTUFBTSxVQUFVLGVBQWUsQ0FBQyxHQUFtQjtJQUNqRCxLQUFLLE1BQU0sSUFBSSxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM3QiwwRkFBMEY7UUFDMUYsV0FBVztRQUNYLElBQUksV0FBVyxHQUEwQixJQUFJLENBQUM7UUFDOUMsSUFBSSxVQUFVLEdBQXlCLElBQUksQ0FBQztRQUM1QyxNQUFNLGtCQUFrQixHQUFHLElBQUksR0FBRyxFQUE2QixDQUFDO1FBQ2hFLE1BQU0sWUFBWSxHQUFHLElBQUksR0FBRyxFQUFtQyxDQUFDO1FBQ2hFLE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxHQUFHLEVBQWtDLENBQUM7UUFDdkUsS0FBSyxNQUFNLEVBQUUsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDN0IsUUFBUSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2hCLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxTQUFTO29CQUN0QixJQUFJLEVBQUUsQ0FBQyxPQUFPLEtBQUssSUFBSSxFQUFFLENBQUM7d0JBQ3hCLE1BQU0sS0FBSyxDQUFDLHNDQUFzQyxDQUFDLENBQUM7b0JBQ3RELENBQUM7b0JBQ0QsV0FBVyxHQUFHLEVBQUUsQ0FBQztvQkFDakIsTUFBTTtnQkFDUixLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTztvQkFDcEIsV0FBVyxHQUFHLElBQUksQ0FBQztvQkFDbkIsTUFB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LENBQUMsQ0FBQyxDQUFDO3dCQUM3Qyx3RkFBd0Y7d0JBQ3hGLGdFQUFnRTt3QkFDaEUsR0FBRyxDQUFDLElBQUksQ0FDTixFQUFFLENBQUMsc0JBQXNCLENBQ3ZCLFNBQVUsRUFDVixNQUFNLENBQUMsSUFBSSxFQUNYLE1BQU0sQ0FBQyxJQUFJLEVBQ1gsTUFBTSxDQUFDLE1BQU0sRUFDYixJQUFJLEVBQ0osY0FBYyxFQUFFLElBQUksSUFBSSxJQUFJLEVBQzVCLEVBQUUsQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxFQUM1QyxjQUFjLEVBQ2QsRUFBRSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsRUFDN0IsRUFBRSxFQUNGLElBQUksQ0FBQyxVQUFVLElBQUksRUFBRSxDQUFDLFVBQVUsQ0FDakMsQ0FDRixDQUFDO29CQUNKLENBQUM7b0JBQ0QsRUFBRSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsRUFBaUIsRUFBRSxHQUFHLENBQUMsQ0FBQztvQkFDbEQsMEZBQTBGO29CQUMxRixtQkFBbUI7b0JBQ25CLElBQUksY0FBYyxLQUFLLFNBQVMsRUFBRSxDQUFDO3dCQUNqQyxjQUFjLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDO29CQUNwRCxDQUFDO29CQUNELE1BQU07WUFDVixDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIGlyIGZyb20gJy4uLy4uL2lyJztcbmltcG9ydCB7Q29tcGlsYXRpb25Kb2J9IGZyb20gJy4uL2NvbXBpbGF0aW9uJztcblxuLyoqXG4gKiBSZW1vdmVzIHRleHQgbm9kZXMgd2l0aGluIGkxOG4gYmxvY2tzIHNpbmNlIHRoZXkgYXJlIGFscmVhZHkgaGFyZGNvZGVkIGludG8gdGhlIGkxOG4gbWVzc2FnZS5cbiAqIEFsc28sIHJlcGxhY2VzIGludGVycG9sYXRpb25zIG9uIHRoZXNlIHRleHQgbm9kZXMgd2l0aCBpMThuIGV4cHJlc3Npb25zIG9mIHRoZSBub24tdGV4dCBwb3J0aW9ucyxcbiAqIHdoaWNoIHdpbGwgYmUgYXBwbGllZCBsYXRlci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbnZlcnRJMThuVGV4dChqb2I6IENvbXBpbGF0aW9uSm9iKTogdm9pZCB7XG4gIGZvciAoY29uc3QgdW5pdCBvZiBqb2IudW5pdHMpIHtcbiAgICAvLyBSZW1vdmUgYWxsIHRleHQgbm9kZXMgd2l0aGluIGkxOG4gYmxvY2tzLCB0aGVpciBjb250ZW50IGlzIGFscmVhZHkgY2FwdHVyZWQgaW4gdGhlIGkxOG5cbiAgICAvLyBtZXNzYWdlLlxuICAgIGxldCBjdXJyZW50STE4bjogaXIuSTE4blN0YXJ0T3AgfCBudWxsID0gbnVsbDtcbiAgICBsZXQgY3VycmVudEljdTogaXIuSWN1U3RhcnRPcCB8IG51bGwgPSBudWxsO1xuICAgIGNvbnN0IHRleHROb2RlSTE4bkJsb2NrcyA9IG5ldyBNYXA8aXIuWHJlZklkLCBpci5JMThuU3RhcnRPcD4oKTtcbiAgICBjb25zdCB0ZXh0Tm9kZUljdXMgPSBuZXcgTWFwPGlyLlhyZWZJZCwgaXIuSWN1U3RhcnRPcCB8IG51bGw+KCk7XG4gICAgY29uc3QgaWN1UGxhY2Vob2xkZXJCeVRleHQgPSBuZXcgTWFwPGlyLlhyZWZJZCwgaXIuSWN1UGxhY2Vob2xkZXJPcD4oKTtcbiAgICBmb3IgKGNvbnN0IG9wIG9mIHVuaXQuY3JlYXRlKSB7XG4gICAgICBzd2l0Y2ggKG9wLmtpbmQpIHtcbiAgICAgICAgY2FzZSBpci5PcEtpbmQuSTE4blN0YXJ0OlxuICAgICAgICAgIGlmIChvcC5jb250ZXh0ID09PSBudWxsKSB7XG4gICAgICAgICAgICB0aHJvdyBFcnJvcignSTE4biBvcCBzaG91bGQgaGF2ZSBpdHMgY29udGV4dCBzZXQuJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGN1cnJlbnRJMThuID0gb3A7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgaXIuT3BLaW5kLkkxOG5FbmQ6XG4gICAgICAgICAgY3VycmVudEkxOG4gPSBudWxsO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIGlyLk9wS2luZC5JY3VTdGFydDpcbiAgICAgICAgICBpZiAob3AuY29udGV4dCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdGhyb3cgRXJyb3IoJ0ljdSBvcCBzaG91bGQgaGF2ZSBpdHMgY29udGV4dCBzZXQuJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGN1cnJlbnRJY3UgPSBvcDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBpci5PcEtpbmQuSWN1RW5kOlxuICAgICAgICAgIGN1cnJlbnRJY3UgPSBudWxsO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIGlyLk9wS2luZC5UZXh0OlxuICAgICAgICAgIGlmIChjdXJyZW50STE4biAhPT0gbnVsbCkge1xuICAgICAgICAgICAgdGV4dE5vZGVJMThuQmxvY2tzLnNldChvcC54cmVmLCBjdXJyZW50STE4bik7XG4gICAgICAgICAgICB0ZXh0Tm9kZUljdXMuc2V0KG9wLnhyZWYsIGN1cnJlbnRJY3UpO1xuICAgICAgICAgICAgaWYgKG9wLmljdVBsYWNlaG9sZGVyICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgIC8vIENyZWF0ZSBhbiBvcCB0byByZXByZXNlbnQgdGhlIElDVSBwbGFjZWhvbGRlci4gSW5pdGlhbGx5IHNldCBpdHMgc3RhdGljIHRleHQgdG8gdGhlXG4gICAgICAgICAgICAgIC8vIHZhbHVlIG9mIHRoZSB0ZXh0IG9wLCB0aG91Z2ggdGhpcyBtYXkgYmUgb3ZlcndyaXR0ZW4gbGF0ZXIgaWYgdGhpcyB0ZXh0IG9wIGlzIGFcbiAgICAgICAgICAgICAgLy8gcGxhY2Vob2xkZXIgZm9yIGFuIGludGVycG9sYXRpb24uXG4gICAgICAgICAgICAgIGNvbnN0IGljdVBsYWNlaG9sZGVyT3AgPSBpci5jcmVhdGVJY3VQbGFjZWhvbGRlck9wKFxuICAgICAgICAgICAgICAgIGpvYi5hbGxvY2F0ZVhyZWZJZCgpLFxuICAgICAgICAgICAgICAgIG9wLmljdVBsYWNlaG9sZGVyLFxuICAgICAgICAgICAgICAgIFtvcC5pbml0aWFsVmFsdWVdLFxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICBpci5PcExpc3QucmVwbGFjZTxpci5DcmVhdGVPcD4ob3AsIGljdVBsYWNlaG9sZGVyT3ApO1xuICAgICAgICAgICAgICBpY3VQbGFjZWhvbGRlckJ5VGV4dC5zZXQob3AueHJlZiwgaWN1UGxhY2Vob2xkZXJPcCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBPdGhlcndpc2UganVzdCByZW1vdmUgdGhlIHRleHQgb3AsIHNpbmNlIGl0cyB2YWx1ZSBpcyBhbHJlYWR5IGFjY291bnRlZCBmb3IgaW4gdGhlXG4gICAgICAgICAgICAgIC8vIHRyYW5zbGF0ZWQgbWVzc2FnZS5cbiAgICAgICAgICAgICAgaXIuT3BMaXN0LnJlbW92ZTxpci5DcmVhdGVPcD4ob3ApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBVcGRhdGUgYW55IGludGVycG9sYXRpb25zIHRvIHRoZSByZW1vdmVkIHRleHQsIGFuZCBpbnN0ZWFkIHJlcHJlc2VudCB0aGVtIGFzIGEgc2VyaWVzIG9mIGkxOG5cbiAgICAvLyBleHByZXNzaW9ucyB0aGF0IHdlIHRoZW4gYXBwbHkuXG4gICAgZm9yIChjb25zdCBvcCBvZiB1bml0LnVwZGF0ZSkge1xuICAgICAgc3dpdGNoIChvcC5raW5kKSB7XG4gICAgICAgIGNhc2UgaXIuT3BLaW5kLkludGVycG9sYXRlVGV4dDpcbiAgICAgICAgICBpZiAoIXRleHROb2RlSTE4bkJsb2Nrcy5oYXMob3AudGFyZ2V0KSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3QgaTE4bk9wID0gdGV4dE5vZGVJMThuQmxvY2tzLmdldChvcC50YXJnZXQpITtcbiAgICAgICAgICBjb25zdCBpY3VPcCA9IHRleHROb2RlSWN1cy5nZXQob3AudGFyZ2V0KTtcbiAgICAgICAgICBjb25zdCBpY3VQbGFjZWhvbGRlciA9IGljdVBsYWNlaG9sZGVyQnlUZXh0LmdldChvcC50YXJnZXQpO1xuICAgICAgICAgIGNvbnN0IGNvbnRleHRJZCA9IGljdU9wID8gaWN1T3AuY29udGV4dCA6IGkxOG5PcC5jb250ZXh0O1xuICAgICAgICAgIGNvbnN0IHJlc29sdXRpb25UaW1lID0gaWN1T3BcbiAgICAgICAgICAgID8gaXIuSTE4blBhcmFtUmVzb2x1dGlvblRpbWUuUG9zdHByb2NjZXNzaW5nXG4gICAgICAgICAgICA6IGlyLkkxOG5QYXJhbVJlc29sdXRpb25UaW1lLkNyZWF0aW9uO1xuICAgICAgICAgIGNvbnN0IG9wczogaXIuSTE4bkV4cHJlc3Npb25PcFtdID0gW107XG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvcC5pbnRlcnBvbGF0aW9uLmV4cHJlc3Npb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBleHByID0gb3AuaW50ZXJwb2xhdGlvbi5leHByZXNzaW9uc1tpXTtcbiAgICAgICAgICAgIC8vIEZvciBub3csIHRoaXMgaTE4bkV4cHJlc3Npb24gZGVwZW5kcyBvbiB0aGUgc2xvdCBjb250ZXh0IG9mIHRoZSBlbmNsb3NpbmcgaTE4biBibG9jay5cbiAgICAgICAgICAgIC8vIExhdGVyLCB3ZSB3aWxsIG1vZGlmeSB0aGlzLCBhbmQgYWR2YW5jZSB0byBhIGRpZmZlcmVudCBwb2ludC5cbiAgICAgICAgICAgIG9wcy5wdXNoKFxuICAgICAgICAgICAgICBpci5jcmVhdGVJMThuRXhwcmVzc2lvbk9wKFxuICAgICAgICAgICAgICAgIGNvbnRleHRJZCEsXG4gICAgICAgICAgICAgICAgaTE4bk9wLnhyZWYsXG4gICAgICAgICAgICAgICAgaTE4bk9wLnhyZWYsXG4gICAgICAgICAgICAgICAgaTE4bk9wLmhhbmRsZSxcbiAgICAgICAgICAgICAgICBleHByLFxuICAgICAgICAgICAgICAgIGljdVBsYWNlaG9sZGVyPy54cmVmID8/IG51bGwsXG4gICAgICAgICAgICAgICAgb3AuaW50ZXJwb2xhdGlvbi5pMThuUGxhY2Vob2xkZXJzW2ldID8/IG51bGwsXG4gICAgICAgICAgICAgICAgcmVzb2x1dGlvblRpbWUsXG4gICAgICAgICAgICAgICAgaXIuSTE4bkV4cHJlc3Npb25Gb3IuSTE4blRleHQsXG4gICAgICAgICAgICAgICAgJycsXG4gICAgICAgICAgICAgICAgZXhwci5zb3VyY2VTcGFuID8/IG9wLnNvdXJjZVNwYW4sXG4gICAgICAgICAgICAgICksXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpci5PcExpc3QucmVwbGFjZVdpdGhNYW55KG9wIGFzIGlyLlVwZGF0ZU9wLCBvcHMpO1xuICAgICAgICAgIC8vIElmIHRoaXMgaW50ZXJwb2xhdGlvbiBpcyBwYXJ0IG9mIGFuIElDVSBwbGFjZWhvbGRlciwgYWRkIHRoZSBzdHJpbmdzIGFuZCBleHByZXNzaW9ucyB0b1xuICAgICAgICAgIC8vIHRoZSBwbGFjZWhvbGRlci5cbiAgICAgICAgICBpZiAoaWN1UGxhY2Vob2xkZXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgaWN1UGxhY2Vob2xkZXIuc3RyaW5ncyA9IG9wLmludGVycG9sYXRpb24uc3RyaW5ncztcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=