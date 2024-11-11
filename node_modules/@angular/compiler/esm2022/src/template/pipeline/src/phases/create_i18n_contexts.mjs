/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as ir from '../../ir';
/**
 * Create one helper context op per i18n block (including generate descending blocks).
 *
 * Also, if an ICU exists inside an i18n block that also contains other localizable content (such as
 * string), create an additional helper context op for the ICU.
 *
 * These context ops are later used for generating i18n messages. (Although we generate at least one
 * context op per nested view, we will collect them up the tree later, to generate a top-level
 * message.)
 */
export function createI18nContexts(job) {
    // Create i18n context ops for i18n attrs.
    const attrContextByMessage = new Map();
    for (const unit of job.units) {
        for (const op of unit.ops()) {
            switch (op.kind) {
                case ir.OpKind.Binding:
                case ir.OpKind.Property:
                case ir.OpKind.Attribute:
                case ir.OpKind.ExtractedAttribute:
                    if (op.i18nMessage === null) {
                        continue;
                    }
                    if (!attrContextByMessage.has(op.i18nMessage)) {
                        const i18nContext = ir.createI18nContextOp(ir.I18nContextKind.Attr, job.allocateXrefId(), null, op.i18nMessage, null);
                        unit.create.push(i18nContext);
                        attrContextByMessage.set(op.i18nMessage, i18nContext.xref);
                    }
                    op.i18nContext = attrContextByMessage.get(op.i18nMessage);
                    break;
            }
        }
    }
    // Create i18n context ops for root i18n blocks.
    const blockContextByI18nBlock = new Map();
    for (const unit of job.units) {
        for (const op of unit.create) {
            switch (op.kind) {
                case ir.OpKind.I18nStart:
                    if (op.xref === op.root) {
                        const contextOp = ir.createI18nContextOp(ir.I18nContextKind.RootI18n, job.allocateXrefId(), op.xref, op.message, null);
                        unit.create.push(contextOp);
                        op.context = contextOp.xref;
                        blockContextByI18nBlock.set(op.xref, contextOp);
                    }
                    break;
            }
        }
    }
    // Assign i18n contexts for child i18n blocks. These don't need their own conext, instead they
    // should inherit from their root i18n block.
    for (const unit of job.units) {
        for (const op of unit.create) {
            if (op.kind === ir.OpKind.I18nStart && op.xref !== op.root) {
                const rootContext = blockContextByI18nBlock.get(op.root);
                if (rootContext === undefined) {
                    throw Error('AssertionError: Root i18n block i18n context should have been created.');
                }
                op.context = rootContext.xref;
                blockContextByI18nBlock.set(op.xref, rootContext);
            }
        }
    }
    // Create or assign i18n contexts for ICUs.
    let currentI18nOp = null;
    for (const unit of job.units) {
        for (const op of unit.create) {
            switch (op.kind) {
                case ir.OpKind.I18nStart:
                    currentI18nOp = op;
                    break;
                case ir.OpKind.I18nEnd:
                    currentI18nOp = null;
                    break;
                case ir.OpKind.IcuStart:
                    if (currentI18nOp === null) {
                        throw Error('AssertionError: Unexpected ICU outside of an i18n block.');
                    }
                    if (op.message.id !== currentI18nOp.message.id) {
                        // This ICU is a sub-message inside its parent i18n block message. We need to give it
                        // its own context.
                        const contextOp = ir.createI18nContextOp(ir.I18nContextKind.Icu, job.allocateXrefId(), currentI18nOp.root, op.message, null);
                        unit.create.push(contextOp);
                        op.context = contextOp.xref;
                    }
                    else {
                        // This ICU is the only translatable content in its parent i18n block. We need to
                        // convert the parent's context into an ICU context.
                        op.context = currentI18nOp.context;
                        blockContextByI18nBlock.get(currentI18nOp.xref).contextKind = ir.I18nContextKind.Icu;
                    }
                    break;
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlX2kxOG5fY29udGV4dHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvdGVtcGxhdGUvcGlwZWxpbmUvc3JjL3BoYXNlcy9jcmVhdGVfaTE4bl9jb250ZXh0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFHSCxPQUFPLEtBQUssRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUcvQjs7Ozs7Ozs7O0dBU0c7QUFDSCxNQUFNLFVBQVUsa0JBQWtCLENBQUMsR0FBbUI7SUFDcEQsMENBQTBDO0lBQzFDLE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxHQUFHLEVBQTJCLENBQUM7SUFDaEUsS0FBSyxNQUFNLElBQUksSUFBSSxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDN0IsS0FBSyxNQUFNLEVBQUUsSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQztZQUM1QixRQUFRLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDaEIsS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQztnQkFDdkIsS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQztnQkFDeEIsS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQztnQkFDekIsS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLGtCQUFrQjtvQkFDL0IsSUFBSSxFQUFFLENBQUMsV0FBVyxLQUFLLElBQUksRUFBRSxDQUFDO3dCQUM1QixTQUFTO29CQUNYLENBQUM7b0JBQ0QsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQzt3QkFDOUMsTUFBTSxXQUFXLEdBQUcsRUFBRSxDQUFDLG1CQUFtQixDQUN4QyxFQUFFLENBQUMsZUFBZSxDQUFDLElBQUksRUFDdkIsR0FBRyxDQUFDLGNBQWMs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YUFBYSxHQUFHLElBQUksQ0FBQztvQkFDckIsTUFBTTtnQkFDUixLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUTtvQkFDckIsSUFBSSxhQUFhLEtBQUssSUFBSSxFQUFFLENBQUM7d0JBQzNCLE1BQU0sS0FBSyxDQUFDLDBEQUEwRCxDQUFDLENBQUM7b0JBQzFFLENBQUM7b0JBQ0QsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsS0FBSyxhQUFhLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxDQUFDO3dCQUMvQyxxRkFBcUY7d0JBQ3JGLG1CQUFtQjt3QkFDbkIsTUFBTSxTQUFTLEdBQUcsRUFBRSxDQUFDLG1CQUFtQixDQUN0QyxFQUFFLENBQUMsZUFBZSxDQUFDLEdBQUcsRUFDdEIsR0FBRyxDQUFDLGNBQWMsRUFBRSxFQUNwQixhQUFhLENBQUMsSUFBSSxFQUNsQixFQUFFLENBQUMsT0FBTyxFQUNWLElBQUssQ0FDTixDQUFDO3dCQUNGLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO3dCQUM1QixFQUFFLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUM7b0JBQzlCLENBQUM7eUJBQU0sQ0FBQzt3QkFDTixpRkFBaUY7d0JBQ2pGLG9EQUFvRDt3QkFDcEQsRUFBRSxDQUFDLE9BQU8sR0FBRyxhQUFhLENBQUMsT0FBTyxDQUFDO3dCQUNuQyx1QkFBdUIsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBRSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQztvQkFDeEYsQ0FBQztvQkFDRCxNQUFNO1lBQ1YsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgaTE4biBmcm9tICcuLi8uLi8uLi8uLi9pMThuL2kxOG5fYXN0JztcbmltcG9ydCAqIGFzIGlyIGZyb20gJy4uLy4uL2lyJztcbmltcG9ydCB7Q29tcGlsYXRpb25Kb2J9IGZyb20gJy4uL2NvbXBpbGF0aW9uJztcblxuLyoqXG4gKiBDcmVhdGUgb25lIGhlbHBlciBjb250ZXh0IG9wIHBlciBpMThuIGJsb2NrIChpbmNsdWRpbmcgZ2VuZXJhdGUgZGVzY2VuZGluZyBibG9ja3MpLlxuICpcbiAqIEFsc28sIGlmIGFuIElDVSBleGlzdHMgaW5zaWRlIGFuIGkxOG4gYmxvY2sgdGhhdCBhbHNvIGNvbnRhaW5zIG90aGVyIGxvY2FsaXphYmxlIGNvbnRlbnQgKHN1Y2ggYXNcbiAqIHN0cmluZyksIGNyZWF0ZSBhbiBhZGRpdGlvbmFsIGhlbHBlciBjb250ZXh0IG9wIGZvciB0aGUgSUNVLlxuICpcbiAqIFRoZXNlIGNvbnRleHQgb3BzIGFyZSBsYXRlciB1c2VkIGZvciBnZW5lcmF0aW5nIGkxOG4gbWVzc2FnZXMuIChBbHRob3VnaCB3ZSBnZW5lcmF0ZSBhdCBsZWFzdCBvbmVcbiAqIGNvbnRleHQgb3AgcGVyIG5lc3RlZCB2aWV3LCB3ZSB3aWxsIGNvbGxlY3QgdGhlbSB1cCB0aGUgdHJlZSBsYXRlciwgdG8gZ2VuZXJhdGUgYSB0b3AtbGV2ZWxcbiAqIG1lc3NhZ2UuKVxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlSTE4bkNvbnRleHRzKGpvYjogQ29tcGlsYXRpb25Kb2IpIHtcbiAgLy8gQ3JlYXRlIGkxOG4gY29udGV4dCBvcHMgZm9yIGkxOG4gYXR0cnMuXG4gIGNvbnN0IGF0dHJDb250ZXh0QnlNZXNzYWdlID0gbmV3IE1hcDxpMThuLk1lc3NhZ2UsIGlyLlhyZWZJZD4oKTtcbiAgZm9yIChjb25zdCB1bml0IG9mIGpvYi51bml0cykge1xuICAgIGZvciAoY29uc3Qgb3Agb2YgdW5pdC5vcHMoKSkge1xuICAgICAgc3dpdGNoIChvcC5raW5kKSB7XG4gICAgICAgIGNhc2UgaXIuT3BLaW5kLkJpbmRpbmc6XG4gICAgICAgIGNhc2UgaXIuT3BLaW5kLlByb3BlcnR5OlxuICAgICAgICBjYXNlIGlyLk9wS2luZC5BdHRyaWJ1dGU6XG4gICAgICAgIGNhc2UgaXIuT3BLaW5kLkV4dHJhY3RlZEF0dHJpYnV0ZTpcbiAgICAgICAgICBpZiAob3AuaTE4bk1lc3NhZ2UgPT09IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoIWF0dHJDb250ZXh0QnlNZXNzYWdlLmhhcyhvcC5pMThuTWVzc2FnZSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGkxOG5Db250ZXh0ID0gaXIuY3JlYXRlSTE4bkNvbnRleHRPcChcbiAgICAgICAgICAgICAgaXIuSTE4bkNvbnRleHRLaW5kLkF0dHIsXG4gICAgICAgICAgICAgIGpvYi5hbGxvY2F0ZVhyZWZJZCgpLFxuICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICBvcC5pMThuTWVzc2FnZSxcbiAgICAgICAgICAgICAgbnVsbCEsXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgdW5pdC5jcmVhdGUucHVzaChpMThuQ29udGV4dCk7XG4gICAgICAgICAgICBhdHRyQ29udGV4dEJ5TWVzc2FnZS5zZXQob3AuaTE4bk1lc3NhZ2UsIGkxOG5Db250ZXh0LnhyZWYpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBvcC5pMThuQ29udGV4dCA9IGF0dHJDb250ZXh0QnlNZXNzYWdlLmdldChvcC5pMThuTWVzc2FnZSkhO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIENyZWF0ZSBpMThuIGNvbnRleHQgb3BzIGZvciByb290IGkxOG4gYmxvY2tzLlxuICBjb25zdCBibG9ja0NvbnRleHRCeUkxOG5CbG9jayA9IG5ldyBNYXA8aXIuWHJlZklkLCBpci5JMThuQ29udGV4dE9wPigpO1xuICBmb3IgKGNvbnN0IHVuaXQgb2Ygam9iLnVuaXRzKSB7XG4gICAgZm9yIChjb25zdCBvcCBvZiB1bml0LmNyZWF0ZSkge1xuICAgICAgc3dpdGNoIChvcC5raW5kKSB7XG4gICAgICAgIGNhc2UgaXIuT3BLaW5kLkkxOG5TdGFydDpcbiAgICAgICAgICBpZiAob3AueHJlZiA9PT0gb3Aucm9vdCkge1xuICAgICAgICAgICAgY29uc3QgY29udGV4dE9wID0gaXIuY3JlYXRlSTE4bkNvbnRleHRPcChcbiAgICAgICAgICAgICAgaXIuSTE4bkNvbnRleHRLaW5kLlJvb3RJMThuLFxuICAgICAgICAgICAgICBqb2IuYWxsb2NhdGVYcmVmSWQoKSxcbiAgICAgICAgICAgICAgb3AueHJlZixcbiAgICAgICAgICAgICAgb3AubWVzc2FnZSxcbiAgICAgICAgICAgICAgbnVsbCEsXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgdW5pdC5jcmVhdGUucHVzaChjb250ZXh0T3ApO1xuICAgICAgICAgICAgb3AuY29udGV4dCA9IGNvbnRleHRPcC54cmVmO1xuICAgICAgICAgICAgYmxvY2tDb250ZXh0QnlJMThuQmxvY2suc2V0KG9wLnhyZWYsIGNvbnRleHRPcCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIEFzc2lnbiBpMThuIGNvbnRleHRzIGZvciBjaGlsZCBpMThuIGJsb2Nrcy4gVGhlc2UgZG9uJ3QgbmVlZCB0aGVpciBvd24gY29uZXh0LCBpbnN0ZWFkIHRoZXlcbiAgLy8gc2hvdWxkIGluaGVyaXQgZnJvbSB0aGVpciByb290IGkxOG4gYmxvY2suXG4gIGZvciAoY29uc3QgdW5pdCBvZiBqb2IudW5pdHMpIHtcbiAgICBmb3IgKGNvbnN0IG9wIG9mIHVuaXQuY3JlYXRlKSB7XG4gICAgICBpZiAob3Aua2luZCA9PT0gaXIuT3BLaW5kLkkxOG5TdGFydCAmJiBvcC54cmVmICE9PSBvcC5yb290KSB7XG4gICAgICAgIGNvbnN0IHJvb3RDb250ZXh0ID0gYmxvY2tDb250ZXh0QnlJMThuQmxvY2suZ2V0KG9wLnJvb3QpO1xuICAgICAgICBpZiAocm9vdENvbnRleHQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHRocm93IEVycm9yKCdBc3NlcnRpb25FcnJvcjogUm9vdCBpMThuIGJsb2NrIGkxOG4gY29udGV4dCBzaG91bGQgaGF2ZSBiZWVuIGNyZWF0ZWQuJyk7XG4gICAgICAgIH1cbiAgICAgICAgb3AuY29udGV4dCA9IHJvb3RDb250ZXh0LnhyZWY7XG4gICAgICAgIGJsb2NrQ29udGV4dEJ5STE4bkJsb2NrLnNldChvcC54cmVmLCByb290Q29udGV4dCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gQ3JlYXRlIG9yIGFzc2lnbiBpMThuIGNvbnRleHRzIGZvciBJQ1VzLlxuICBsZXQgY3VycmVudEkxOG5PcDogaXIuSTE4blN0YXJ0T3AgfCBudWxsID0gbnVsbDtcbiAgZm9yIChjb25zdCB1bml0IG9mIGpvYi51bml0cykge1xuICAgIGZvciAoY29uc3Qgb3Agb2YgdW5pdC5jcmVhdGUpIHtcbiAgICAgIHN3aXRjaCAob3Aua2luZCkge1xuICAgICAgICBjYXNlIGlyLk9wS2luZC5JMThuU3RhcnQ6XG4gICAgICAgICAgY3VycmVudEkxOG5PcCA9IG9wO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIGlyLk9wS2luZC5JMThuRW5kOlxuICAgICAgICAgIGN1cnJlbnRJMThuT3AgPSBudWxsO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIGlyLk9wS2luZC5JY3VTdGFydDpcbiAgICAgICAgICBpZiAoY3VycmVudEkxOG5PcCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdGhyb3cgRXJyb3IoJ0Fzc2VydGlvbkVycm9yOiBVbmV4cGVjdGVkIElDVSBvdXRzaWRlIG9mIGFuIGkxOG4gYmxvY2suJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChvcC5tZXNzYWdlLmlkICE9PSBjdXJyZW50STE4bk9wLm1lc3NhZ2UuaWQpIHtcbiAgICAgICAgICAgIC8vIFRoaXMgSUNVIGlzIGEgc3ViLW1lc3NhZ2UgaW5zaWRlIGl0cyBwYXJlbnQgaTE4biBibG9jayBtZXNzYWdlLiBXZSBuZWVkIHRvIGdpdmUgaXRcbiAgICAgICAgICAgIC8vIGl0cyBvd24gY29udGV4dC5cbiAgICAgICAgICAgIGNvbnN0IGNvbnRleHRPcCA9IGlyLmNyZWF0ZUkxOG5Db250ZXh0T3AoXG4gICAgICAgICAgICAgIGlyLkkxOG5Db250ZXh0S2luZC5JY3UsXG4gICAgICAgICAgICAgIGpvYi5hbGxvY2F0ZVhyZWZJZCgpLFxuICAgICAgICAgICAgICBjdXJyZW50STE4bk9wLnJvb3QsXG4gICAgICAgICAgICAgIG9wLm1lc3NhZ2UsXG4gICAgICAgICAgICAgIG51bGwhLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHVuaXQuY3JlYXRlLnB1c2goY29udGV4dE9wKTtcbiAgICAgICAgICAgIG9wLmNvbnRleHQgPSBjb250ZXh0T3AueHJlZjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gVGhpcyBJQ1UgaXMgdGhlIG9ubHkgdHJhbnNsYXRhYmxlIGNvbnRlbnQgaW4gaXRzIHBhcmVudCBpMThuIGJsb2NrLiBXZSBuZWVkIHRvXG4gICAgICAgICAgICAvLyBjb252ZXJ0IHRoZSBwYXJlbnQncyBjb250ZXh0IGludG8gYW4gSUNVIGNvbnRleHQuXG4gICAgICAgICAgICBvcC5jb250ZXh0ID0gY3VycmVudEkxOG5PcC5jb250ZXh0O1xuICAgICAgICAgICAgYmxvY2tDb250ZXh0QnlJMThuQmxvY2suZ2V0KGN1cnJlbnRJMThuT3AueHJlZikhLmNvbnRleHRLaW5kID0gaXIuSTE4bkNvbnRleHRLaW5kLkljdTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=