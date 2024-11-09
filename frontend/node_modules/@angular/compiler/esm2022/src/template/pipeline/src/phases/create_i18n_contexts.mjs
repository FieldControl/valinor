/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlX2kxOG5fY29udGV4dHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvdGVtcGxhdGUvcGlwZWxpbmUvc3JjL3BoYXNlcy9jcmVhdGVfaTE4bl9jb250ZXh0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFHSCxPQUFPLEtBQUssRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUcvQjs7Ozs7Ozs7O0dBU0c7QUFDSCxNQUFNLFVBQVUsa0JBQWtCLENBQUMsR0FBbUI7SUFDcEQsMENBQTBDO0lBQzFDLE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxHQUFHLEVBQTJCLENBQUM7SUFDaEUsS0FBSyxNQUFNLElBQUksSUFBSSxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDN0IsS0FBSyxNQUFNLEVBQUUsSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQztZQUM1QixRQUFRLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDaEIsS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQztnQkFDdkIsS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQztnQkFDeEIsS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQztnQkFDekIsS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLGtCQUFrQjtvQkFDL0IsSUFBSSxFQUFFLENBQUMsV0FBVyxLQUFLLElBQUksRUFBRSxDQUFDO3dCQUM1QixTQUFTO29CQUNYLENBQUM7b0JBQ0QsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQzt3QkFDOUMsTUFBTSxXQUFXLEdBQUcsRUFBRSxDQUFDLG1CQUFtQixDQUN0QyxFQUFFLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsY0FBYyxF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QWEsR0FBRyxJQUFJLENBQUM7b0JBQ3JCLE1BQU07Z0JBQ1IsS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVE7b0JBQ3JCLElBQUksYUFBYSxLQUFLLElBQUksRUFBRSxDQUFDO3dCQUMzQixNQUFNLEtBQUssQ0FBQywwREFBMEQsQ0FBQyxDQUFDO29CQUMxRSxDQUFDO29CQUNELElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEtBQUssYUFBYSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsQ0FBQzt3QkFDL0MscUZBQXFGO3dCQUNyRixtQkFBbUI7d0JBQ25CLE1BQU0sU0FBUyxHQUFHLEVBQUUsQ0FBQyxtQkFBbUIsQ0FDcEMsRUFBRSxDQUFDLGVBQWUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLGNBQWMsRUFBRSxFQUFFLGFBQWEsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLE9BQU8sRUFBRSxJQUFLLENBQ3RGLENBQUM7d0JBQ0YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7d0JBQzVCLEVBQUUsQ0FBQyxPQUFPLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQztvQkFDOUIsQ0FBQzt5QkFBTSxDQUFDO3dCQUNOLGlGQUFpRjt3QkFDakYsb0RBQW9EO3dCQUNwRCxFQUFFLENBQUMsT0FBTyxHQUFHLGFBQWEsQ0FBQyxPQUFPLENBQUM7d0JBQ25DLHVCQUF1QixDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFFLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDO29CQUN4RixDQUFDO29CQUNELE1BQU07WUFDVixDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIGkxOG4gZnJvbSAnLi4vLi4vLi4vLi4vaTE4bi9pMThuX2FzdCc7XG5pbXBvcnQgKiBhcyBpciBmcm9tICcuLi8uLi9pcic7XG5pbXBvcnQge0NvbXBpbGF0aW9uSm9ifSBmcm9tICcuLi9jb21waWxhdGlvbic7XG5cbi8qKlxuICogQ3JlYXRlIG9uZSBoZWxwZXIgY29udGV4dCBvcCBwZXIgaTE4biBibG9jayAoaW5jbHVkaW5nIGdlbmVyYXRlIGRlc2NlbmRpbmcgYmxvY2tzKS5cbiAqXG4gKiBBbHNvLCBpZiBhbiBJQ1UgZXhpc3RzIGluc2lkZSBhbiBpMThuIGJsb2NrIHRoYXQgYWxzbyBjb250YWlucyBvdGhlciBsb2NhbGl6YWJsZSBjb250ZW50IChzdWNoIGFzXG4gKiBzdHJpbmcpLCBjcmVhdGUgYW4gYWRkaXRpb25hbCBoZWxwZXIgY29udGV4dCBvcCBmb3IgdGhlIElDVS5cbiAqXG4gKiBUaGVzZSBjb250ZXh0IG9wcyBhcmUgbGF0ZXIgdXNlZCBmb3IgZ2VuZXJhdGluZyBpMThuIG1lc3NhZ2VzLiAoQWx0aG91Z2ggd2UgZ2VuZXJhdGUgYXQgbGVhc3Qgb25lXG4gKiBjb250ZXh0IG9wIHBlciBuZXN0ZWQgdmlldywgd2Ugd2lsbCBjb2xsZWN0IHRoZW0gdXAgdGhlIHRyZWUgbGF0ZXIsIHRvIGdlbmVyYXRlIGEgdG9wLWxldmVsXG4gKiBtZXNzYWdlLilcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUkxOG5Db250ZXh0cyhqb2I6IENvbXBpbGF0aW9uSm9iKSB7XG4gIC8vIENyZWF0ZSBpMThuIGNvbnRleHQgb3BzIGZvciBpMThuIGF0dHJzLlxuICBjb25zdCBhdHRyQ29udGV4dEJ5TWVzc2FnZSA9IG5ldyBNYXA8aTE4bi5NZXNzYWdlLCBpci5YcmVmSWQ+KCk7XG4gIGZvciAoY29uc3QgdW5pdCBvZiBqb2IudW5pdHMpIHtcbiAgICBmb3IgKGNvbnN0IG9wIG9mIHVuaXQub3BzKCkpIHtcbiAgICAgIHN3aXRjaCAob3Aua2luZCkge1xuICAgICAgICBjYXNlIGlyLk9wS2luZC5CaW5kaW5nOlxuICAgICAgICBjYXNlIGlyLk9wS2luZC5Qcm9wZXJ0eTpcbiAgICAgICAgY2FzZSBpci5PcEtpbmQuQXR0cmlidXRlOlxuICAgICAgICBjYXNlIGlyLk9wS2luZC5FeHRyYWN0ZWRBdHRyaWJ1dGU6XG4gICAgICAgICAgaWYgKG9wLmkxOG5NZXNzYWdlID09PSBudWxsKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCFhdHRyQ29udGV4dEJ5TWVzc2FnZS5oYXMob3AuaTE4bk1lc3NhZ2UpKSB7XG4gICAgICAgICAgICBjb25zdCBpMThuQ29udGV4dCA9IGlyLmNyZWF0ZUkxOG5Db250ZXh0T3AoXG4gICAgICAgICAgICAgICAgaXIuSTE4bkNvbnRleHRLaW5kLkF0dHIsIGpvYi5hbGxvY2F0ZVhyZWZJZCgpLCBudWxsLCBvcC5pMThuTWVzc2FnZSwgbnVsbCEpO1xuICAgICAgICAgICAgdW5pdC5jcmVhdGUucHVzaChpMThuQ29udGV4dCk7XG4gICAgICAgICAgICBhdHRyQ29udGV4dEJ5TWVzc2FnZS5zZXQob3AuaTE4bk1lc3NhZ2UsIGkxOG5Db250ZXh0LnhyZWYpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBvcC5pMThuQ29udGV4dCA9IGF0dHJDb250ZXh0QnlNZXNzYWdlLmdldChvcC5pMThuTWVzc2FnZSkhO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIENyZWF0ZSBpMThuIGNvbnRleHQgb3BzIGZvciByb290IGkxOG4gYmxvY2tzLlxuICBjb25zdCBibG9ja0NvbnRleHRCeUkxOG5CbG9jayA9IG5ldyBNYXA8aXIuWHJlZklkLCBpci5JMThuQ29udGV4dE9wPigpO1xuICBmb3IgKGNvbnN0IHVuaXQgb2Ygam9iLnVuaXRzKSB7XG4gICAgZm9yIChjb25zdCBvcCBvZiB1bml0LmNyZWF0ZSkge1xuICAgICAgc3dpdGNoIChvcC5raW5kKSB7XG4gICAgICAgIGNhc2UgaXIuT3BLaW5kLkkxOG5TdGFydDpcbiAgICAgICAgICBpZiAob3AueHJlZiA9PT0gb3Aucm9vdCkge1xuICAgICAgICAgICAgY29uc3QgY29udGV4dE9wID0gaXIuY3JlYXRlSTE4bkNvbnRleHRPcChcbiAgICAgICAgICAgICAgICBpci5JMThuQ29udGV4dEtpbmQuUm9vdEkxOG4sIGpvYi5hbGxvY2F0ZVhyZWZJZCgpLCBvcC54cmVmLCBvcC5tZXNzYWdlLCBudWxsISk7XG4gICAgICAgICAgICB1bml0LmNyZWF0ZS5wdXNoKGNvbnRleHRPcCk7XG4gICAgICAgICAgICBvcC5jb250ZXh0ID0gY29udGV4dE9wLnhyZWY7XG4gICAgICAgICAgICBibG9ja0NvbnRleHRCeUkxOG5CbG9jay5zZXQob3AueHJlZiwgY29udGV4dE9wKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gQXNzaWduIGkxOG4gY29udGV4dHMgZm9yIGNoaWxkIGkxOG4gYmxvY2tzLiBUaGVzZSBkb24ndCBuZWVkIHRoZWlyIG93biBjb25leHQsIGluc3RlYWQgdGhleVxuICAvLyBzaG91bGQgaW5oZXJpdCBmcm9tIHRoZWlyIHJvb3QgaTE4biBibG9jay5cbiAgZm9yIChjb25zdCB1bml0IG9mIGpvYi51bml0cykge1xuICAgIGZvciAoY29uc3Qgb3Agb2YgdW5pdC5jcmVhdGUpIHtcbiAgICAgIGlmIChvcC5raW5kID09PSBpci5PcEtpbmQuSTE4blN0YXJ0ICYmIG9wLnhyZWYgIT09IG9wLnJvb3QpIHtcbiAgICAgICAgY29uc3Qgcm9vdENvbnRleHQgPSBibG9ja0NvbnRleHRCeUkxOG5CbG9jay5nZXQob3Aucm9vdCk7XG4gICAgICAgIGlmIChyb290Q29udGV4dCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdGhyb3cgRXJyb3IoJ0Fzc2VydGlvbkVycm9yOiBSb290IGkxOG4gYmxvY2sgaTE4biBjb250ZXh0IHNob3VsZCBoYXZlIGJlZW4gY3JlYXRlZC4nKTtcbiAgICAgICAgfVxuICAgICAgICBvcC5jb250ZXh0ID0gcm9vdENvbnRleHQueHJlZjtcbiAgICAgICAgYmxvY2tDb250ZXh0QnlJMThuQmxvY2suc2V0KG9wLnhyZWYsIHJvb3RDb250ZXh0KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBDcmVhdGUgb3IgYXNzaWduIGkxOG4gY29udGV4dHMgZm9yIElDVXMuXG4gIGxldCBjdXJyZW50STE4bk9wOiBpci5JMThuU3RhcnRPcHxudWxsID0gbnVsbDtcbiAgZm9yIChjb25zdCB1bml0IG9mIGpvYi51bml0cykge1xuICAgIGZvciAoY29uc3Qgb3Agb2YgdW5pdC5jcmVhdGUpIHtcbiAgICAgIHN3aXRjaCAob3Aua2luZCkge1xuICAgICAgICBjYXNlIGlyLk9wS2luZC5JMThuU3RhcnQ6XG4gICAgICAgICAgY3VycmVudEkxOG5PcCA9IG9wO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIGlyLk9wS2luZC5JMThuRW5kOlxuICAgICAgICAgIGN1cnJlbnRJMThuT3AgPSBudWxsO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIGlyLk9wS2luZC5JY3VTdGFydDpcbiAgICAgICAgICBpZiAoY3VycmVudEkxOG5PcCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdGhyb3cgRXJyb3IoJ0Fzc2VydGlvbkVycm9yOiBVbmV4cGVjdGVkIElDVSBvdXRzaWRlIG9mIGFuIGkxOG4gYmxvY2suJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChvcC5tZXNzYWdlLmlkICE9PSBjdXJyZW50STE4bk9wLm1lc3NhZ2UuaWQpIHtcbiAgICAgICAgICAgIC8vIFRoaXMgSUNVIGlzIGEgc3ViLW1lc3NhZ2UgaW5zaWRlIGl0cyBwYXJlbnQgaTE4biBibG9jayBtZXNzYWdlLiBXZSBuZWVkIHRvIGdpdmUgaXRcbiAgICAgICAgICAgIC8vIGl0cyBvd24gY29udGV4dC5cbiAgICAgICAgICAgIGNvbnN0IGNvbnRleHRPcCA9IGlyLmNyZWF0ZUkxOG5Db250ZXh0T3AoXG4gICAgICAgICAgICAgICAgaXIuSTE4bkNvbnRleHRLaW5kLkljdSwgam9iLmFsbG9jYXRlWHJlZklkKCksIGN1cnJlbnRJMThuT3Aucm9vdCwgb3AubWVzc2FnZSwgbnVsbCFcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICB1bml0LmNyZWF0ZS5wdXNoKGNvbnRleHRPcCk7XG4gICAgICAgICAgICBvcC5jb250ZXh0ID0gY29udGV4dE9wLnhyZWY7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFRoaXMgSUNVIGlzIHRoZSBvbmx5IHRyYW5zbGF0YWJsZSBjb250ZW50IGluIGl0cyBwYXJlbnQgaTE4biBibG9jay4gV2UgbmVlZCB0b1xuICAgICAgICAgICAgLy8gY29udmVydCB0aGUgcGFyZW50J3MgY29udGV4dCBpbnRvIGFuIElDVSBjb250ZXh0LlxuICAgICAgICAgICAgb3AuY29udGV4dCA9IGN1cnJlbnRJMThuT3AuY29udGV4dDtcbiAgICAgICAgICAgIGJsb2NrQ29udGV4dEJ5STE4bkJsb2NrLmdldChjdXJyZW50STE4bk9wLnhyZWYpIS5jb250ZXh0S2luZCA9IGlyLkkxOG5Db250ZXh0S2luZC5JY3U7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19