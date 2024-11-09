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
                    const resolutionTime = icuOp ? ir.I18nParamResolutionTime.Postproccessing :
                        ir.I18nParamResolutionTime.Creation;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaTE4bl90ZXh0X2V4dHJhY3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvdGVtcGxhdGUvcGlwZWxpbmUvc3JjL3BoYXNlcy9pMThuX3RleHRfZXh0cmFjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEtBQUssRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUcvQjs7OztHQUlHO0FBQ0gsTUFBTSxVQUFVLGVBQWUsQ0FBQyxHQUFtQjtJQUNqRCxLQUFLLE1BQU0sSUFBSSxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM3QiwwRkFBMEY7UUFDMUYsV0FBVztRQUNYLElBQUksV0FBVyxHQUF3QixJQUFJLENBQUM7UUFDNUMsSUFBSSxVQUFVLEdBQXVCLElBQUksQ0FBQztRQUMxQyxNQUFNLGtCQUFrQixHQUFHLElBQUksR0FBRyxFQUE2QixDQUFDO1FBQ2hFLE1BQU0sWUFBWSxHQUFHLElBQUksR0FBRyxFQUFpQyxDQUFDO1FBQzlELE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxHQUFHLEVBQWtDLENBQUM7UUFDdkUsS0FBSyxNQUFNLEVBQUUsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDN0IsUUFBUSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2hCLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxTQUFTO29CQUN0QixJQUFJLEVBQUUsQ0FBQyxPQUFPLEtBQUssSUFBSSxFQUFFLENBQUM7d0JBQ3hCLE1BQU0sS0FBSyxDQUFDLHNDQUFzQyxDQUFDLENBQUM7b0JBQ3RELENBQUM7b0JBQ0QsV0FBVyxHQUFHLEVBQUUsQ0FBQztvQkFDakIsTUFBTTtnQkFDUixLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTztvQkFDcEIsV0FBVyxHQUFHLElBQUksQ0FBQztvQkFDbkIsTUFB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QyxDQUFDLENBQUM7d0JBQzdDLHdGQUF3Rjt3QkFDeEYsZ0VBQWdFO3dCQUNoRSxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxzQkFBc0IsQ0FDOUIsU0FBVSxFQUFFLE1BQU0sQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsTUFBTSxFQUFFLElBQUksRUFDekQsY0FBYyxFQUFFLElBQUksSUFBSSxJQUFJLEVBQUUsRUFBRSxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQzFFLGNBQWMsRUFBRSxFQUFFLENBQUMsaUJBQWlCLENBQUMsUUFBUSxFQUFFLEVBQUUsRUFDakQsSUFBSSxDQUFDLFVBQVUsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztvQkFDekMsQ0FBQztvQkFDRCxFQUFFLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxFQUFpQixFQUFFLEdBQUcsQ0FBQyxDQUFDO29CQUNsRCwwRkFBMEY7b0JBQzFGLG1CQUFtQjtvQkFDbkIsSUFBSSxjQUFjLEtBQUssU0FBUyxFQUFFLENBQUM7d0JBQ2pDLGNBQWMsQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUM7b0JBQ3BELENBQUM7b0JBQ0QsTUFBTTtZQUNWLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgaXIgZnJvbSAnLi4vLi4vaXInO1xuaW1wb3J0IHtDb21waWxhdGlvbkpvYn0gZnJvbSAnLi4vY29tcGlsYXRpb24nO1xuXG4vKipcbiAqIFJlbW92ZXMgdGV4dCBub2RlcyB3aXRoaW4gaTE4biBibG9ja3Mgc2luY2UgdGhleSBhcmUgYWxyZWFkeSBoYXJkY29kZWQgaW50byB0aGUgaTE4biBtZXNzYWdlLlxuICogQWxzbywgcmVwbGFjZXMgaW50ZXJwb2xhdGlvbnMgb24gdGhlc2UgdGV4dCBub2RlcyB3aXRoIGkxOG4gZXhwcmVzc2lvbnMgb2YgdGhlIG5vbi10ZXh0IHBvcnRpb25zLFxuICogd2hpY2ggd2lsbCBiZSBhcHBsaWVkIGxhdGVyLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY29udmVydEkxOG5UZXh0KGpvYjogQ29tcGlsYXRpb25Kb2IpOiB2b2lkIHtcbiAgZm9yIChjb25zdCB1bml0IG9mIGpvYi51bml0cykge1xuICAgIC8vIFJlbW92ZSBhbGwgdGV4dCBub2RlcyB3aXRoaW4gaTE4biBibG9ja3MsIHRoZWlyIGNvbnRlbnQgaXMgYWxyZWFkeSBjYXB0dXJlZCBpbiB0aGUgaTE4blxuICAgIC8vIG1lc3NhZ2UuXG4gICAgbGV0IGN1cnJlbnRJMThuOiBpci5JMThuU3RhcnRPcHxudWxsID0gbnVsbDtcbiAgICBsZXQgY3VycmVudEljdTogaXIuSWN1U3RhcnRPcHxudWxsID0gbnVsbDtcbiAgICBjb25zdCB0ZXh0Tm9kZUkxOG5CbG9ja3MgPSBuZXcgTWFwPGlyLlhyZWZJZCwgaXIuSTE4blN0YXJ0T3A+KCk7XG4gICAgY29uc3QgdGV4dE5vZGVJY3VzID0gbmV3IE1hcDxpci5YcmVmSWQsIGlyLkljdVN0YXJ0T3B8bnVsbD4oKTtcbiAgICBjb25zdCBpY3VQbGFjZWhvbGRlckJ5VGV4dCA9IG5ldyBNYXA8aXIuWHJlZklkLCBpci5JY3VQbGFjZWhvbGRlck9wPigpO1xuICAgIGZvciAoY29uc3Qgb3Agb2YgdW5pdC5jcmVhdGUpIHtcbiAgICAgIHN3aXRjaCAob3Aua2luZCkge1xuICAgICAgICBjYXNlIGlyLk9wS2luZC5JMThuU3RhcnQ6XG4gICAgICAgICAgaWYgKG9wLmNvbnRleHQgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRocm93IEVycm9yKCdJMThuIG9wIHNob3VsZCBoYXZlIGl0cyBjb250ZXh0IHNldC4nKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY3VycmVudEkxOG4gPSBvcDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBpci5PcEtpbmQuSTE4bkVuZDpcbiAgICAgICAgICBjdXJyZW50STE4biA9IG51bGw7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgaXIuT3BLaW5kLkljdVN0YXJ0OlxuICAgICAgICAgIGlmIChvcC5jb250ZXh0ID09PSBudWxsKSB7XG4gICAgICAgICAgICB0aHJvdyBFcnJvcignSWN1IG9wIHNob3VsZCBoYXZlIGl0cyBjb250ZXh0IHNldC4nKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY3VycmVudEljdSA9IG9wO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIGlyLk9wS2luZC5JY3VFbmQ6XG4gICAgICAgICAgY3VycmVudEljdSA9IG51bGw7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgaXIuT3BLaW5kLlRleHQ6XG4gICAgICAgICAgaWYgKGN1cnJlbnRJMThuICE9PSBudWxsKSB7XG4gICAgICAgICAgICB0ZXh0Tm9kZUkxOG5CbG9ja3Muc2V0KG9wLnhyZWYsIGN1cnJlbnRJMThuKTtcbiAgICAgICAgICAgIHRleHROb2RlSWN1cy5zZXQob3AueHJlZiwgY3VycmVudEljdSk7XG4gICAgICAgICAgICBpZiAob3AuaWN1UGxhY2Vob2xkZXIgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgLy8gQ3JlYXRlIGFuIG9wIHRvIHJlcHJlc2VudCB0aGUgSUNVIHBsYWNlaG9sZGVyLiBJbml0aWFsbHkgc2V0IGl0cyBzdGF0aWMgdGV4dCB0byB0aGVcbiAgICAgICAgICAgICAgLy8gdmFsdWUgb2YgdGhlIHRleHQgb3AsIHRob3VnaCB0aGlzIG1heSBiZSBvdmVyd3JpdHRlbiBsYXRlciBpZiB0aGlzIHRleHQgb3AgaXMgYVxuICAgICAgICAgICAgICAvLyBwbGFjZWhvbGRlciBmb3IgYW4gaW50ZXJwb2xhdGlvbi5cbiAgICAgICAgICAgICAgY29uc3QgaWN1UGxhY2Vob2xkZXJPcCA9IGlyLmNyZWF0ZUljdVBsYWNlaG9sZGVyT3AoXG4gICAgICAgICAgICAgICAgICBqb2IuYWxsb2NhdGVYcmVmSWQoKSwgb3AuaWN1UGxhY2Vob2xkZXIsIFtvcC5pbml0aWFsVmFsdWVdKTtcbiAgICAgICAgICAgICAgaXIuT3BMaXN0LnJlcGxhY2U8aXIuQ3JlYXRlT3A+KG9wLCBpY3VQbGFjZWhvbGRlck9wKTtcbiAgICAgICAgICAgICAgaWN1UGxhY2Vob2xkZXJCeVRleHQuc2V0KG9wLnhyZWYsIGljdVBsYWNlaG9sZGVyT3ApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gT3RoZXJ3aXNlIGp1c3QgcmVtb3ZlIHRoZSB0ZXh0IG9wLCBzaW5jZSBpdHMgdmFsdWUgaXMgYWxyZWFkeSBhY2NvdW50ZWQgZm9yIGluIHRoZVxuICAgICAgICAgICAgICAvLyB0cmFuc2xhdGVkIG1lc3NhZ2UuXG4gICAgICAgICAgICAgIGlyLk9wTGlzdC5yZW1vdmU8aXIuQ3JlYXRlT3A+KG9wKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gVXBkYXRlIGFueSBpbnRlcnBvbGF0aW9ucyB0byB0aGUgcmVtb3ZlZCB0ZXh0LCBhbmQgaW5zdGVhZCByZXByZXNlbnQgdGhlbSBhcyBhIHNlcmllcyBvZiBpMThuXG4gICAgLy8gZXhwcmVzc2lvbnMgdGhhdCB3ZSB0aGVuIGFwcGx5LlxuICAgIGZvciAoY29uc3Qgb3Agb2YgdW5pdC51cGRhdGUpIHtcbiAgICAgIHN3aXRjaCAob3Aua2luZCkge1xuICAgICAgICBjYXNlIGlyLk9wS2luZC5JbnRlcnBvbGF0ZVRleHQ6XG4gICAgICAgICAgaWYgKCF0ZXh0Tm9kZUkxOG5CbG9ja3MuaGFzKG9wLnRhcmdldCkpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IGkxOG5PcCA9IHRleHROb2RlSTE4bkJsb2Nrcy5nZXQob3AudGFyZ2V0KSE7XG4gICAgICAgICAgY29uc3QgaWN1T3AgPSB0ZXh0Tm9kZUljdXMuZ2V0KG9wLnRhcmdldCk7XG4gICAgICAgICAgY29uc3QgaWN1UGxhY2Vob2xkZXIgPSBpY3VQbGFjZWhvbGRlckJ5VGV4dC5nZXQob3AudGFyZ2V0KTtcbiAgICAgICAgICBjb25zdCBjb250ZXh0SWQgPSBpY3VPcCA/IGljdU9wLmNvbnRleHQgOiBpMThuT3AuY29udGV4dDtcbiAgICAgICAgICBjb25zdCByZXNvbHV0aW9uVGltZSA9IGljdU9wID8gaXIuSTE4blBhcmFtUmVzb2x1dGlvblRpbWUuUG9zdHByb2NjZXNzaW5nIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXIuSTE4blBhcmFtUmVzb2x1dGlvblRpbWUuQ3JlYXRpb247XG4gICAgICAgICAgY29uc3Qgb3BzOiBpci5JMThuRXhwcmVzc2lvbk9wW10gPSBbXTtcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG9wLmludGVycG9sYXRpb24uZXhwcmVzc2lvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGV4cHIgPSBvcC5pbnRlcnBvbGF0aW9uLmV4cHJlc3Npb25zW2ldO1xuICAgICAgICAgICAgLy8gRm9yIG5vdywgdGhpcyBpMThuRXhwcmVzc2lvbiBkZXBlbmRzIG9uIHRoZSBzbG90IGNvbnRleHQgb2YgdGhlIGVuY2xvc2luZyBpMThuIGJsb2NrLlxuICAgICAgICAgICAgLy8gTGF0ZXIsIHdlIHdpbGwgbW9kaWZ5IHRoaXMsIGFuZCBhZHZhbmNlIHRvIGEgZGlmZmVyZW50IHBvaW50LlxuICAgICAgICAgICAgb3BzLnB1c2goaXIuY3JlYXRlSTE4bkV4cHJlc3Npb25PcChcbiAgICAgICAgICAgICAgICBjb250ZXh0SWQhLCBpMThuT3AueHJlZiwgaTE4bk9wLnhyZWYsIGkxOG5PcC5oYW5kbGUsIGV4cHIsXG4gICAgICAgICAgICAgICAgaWN1UGxhY2Vob2xkZXI/LnhyZWYgPz8gbnVsbCwgb3AuaW50ZXJwb2xhdGlvbi5pMThuUGxhY2Vob2xkZXJzW2ldID8/IG51bGwsXG4gICAgICAgICAgICAgICAgcmVzb2x1dGlvblRpbWUsIGlyLkkxOG5FeHByZXNzaW9uRm9yLkkxOG5UZXh0LCAnJyxcbiAgICAgICAgICAgICAgICBleHByLnNvdXJjZVNwYW4gPz8gb3Auc291cmNlU3BhbikpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpci5PcExpc3QucmVwbGFjZVdpdGhNYW55KG9wIGFzIGlyLlVwZGF0ZU9wLCBvcHMpO1xuICAgICAgICAgIC8vIElmIHRoaXMgaW50ZXJwb2xhdGlvbiBpcyBwYXJ0IG9mIGFuIElDVSBwbGFjZWhvbGRlciwgYWRkIHRoZSBzdHJpbmdzIGFuZCBleHByZXNzaW9ucyB0b1xuICAgICAgICAgIC8vIHRoZSBwbGFjZWhvbGRlci5cbiAgICAgICAgICBpZiAoaWN1UGxhY2Vob2xkZXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgaWN1UGxhY2Vob2xkZXIuc3RyaW5ncyA9IG9wLmludGVycG9sYXRpb24uc3RyaW5ncztcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=