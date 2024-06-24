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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlX2kxOG5fY29udGV4dHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvdGVtcGxhdGUvcGlwZWxpbmUvc3JjL3BoYXNlcy9jcmVhdGVfaTE4bl9jb250ZXh0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFHSCxPQUFPLEtBQUssRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUcvQjs7Ozs7Ozs7O0dBU0c7QUFDSCxNQUFNLFVBQVUsa0JBQWtCLENBQUMsR0FBbUI7SUFDcEQsMENBQTBDO0lBQzFDLE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxHQUFHLEVBQTJCLENBQUM7SUFDaEUsS0FBSyxNQUFNLElBQUksSUFBSSxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDN0IsS0FBSyxNQUFNLEVBQUUsSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQztZQUM1QixRQUFRLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDaEIsS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQztnQkFDdkIsS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQztnQkFDeEIsS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQztnQkFDekIsS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLGtCQUFrQjtvQkFDL0IsSUFBSSxFQUFFLENBQUMsV0FBVyxLQUFLLElBQUksRUFBRSxDQUFDO3dCQUM1QixTQUFTO29CQUNYLENBQUM7b0JBQ0QsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQzt3QkFDOUMsTUFBTSxXQUFXLEdBQUcsRUFBRSxDQUFDLG1CQUFtQixDQUN4QyxFQUFFLENBQUMsZUFBZSxDQUFDLElBQUksRUFDdkIsR0FBRyxDQUFDLGNBQWMs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YUFBYSxHQUFHLElBQUksQ0FBQztvQkFDckIsTUFBTTtnQkFDUixLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUTtvQkFDckIsSUFBSSxhQUFhLEtBQUssSUFBSSxFQUFFLENBQUM7d0JBQzNCLE1BQU0sS0FBSyxDQUFDLDBEQUEwRCxDQUFDLENBQUM7b0JBQzFFLENBQUM7b0JBQ0QsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsS0FBSyxhQUFhLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxDQUFDO3dCQUMvQyxxRkFBcUY7d0JBQ3JGLG1CQUFtQjt3QkFDbkIsTUFBTSxTQUFTLEdBQUcsRUFBRSxDQUFDLG1CQUFtQixDQUN0QyxFQUFFLENBQUMsZUFBZSxDQUFDLEdBQUcsRUFDdEIsR0FBRyxDQUFDLGNBQWMsRUFBRSxFQUNwQixhQUFhLENBQUMsSUFBSSxFQUNsQixFQUFFLENBQUMsT0FBTyxFQUNWLElBQUssQ0FDTixDQUFDO3dCQUNGLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO3dCQUM1QixFQUFFLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUM7b0JBQzlCLENBQUM7eUJBQU0sQ0FBQzt3QkFDTixpRkFBaUY7d0JBQ2pGLG9EQUFvRDt3QkFDcEQsRUFBRSxDQUFDLE9BQU8sR0FBRyxhQUFhLENBQUMsT0FBTyxDQUFDO3dCQUNuQyx1QkFBdUIsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBRSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQztvQkFDeEYsQ0FBQztvQkFDRCxNQUFNO1lBQ1YsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBpMThuIGZyb20gJy4uLy4uLy4uLy4uL2kxOG4vaTE4bl9hc3QnO1xuaW1wb3J0ICogYXMgaXIgZnJvbSAnLi4vLi4vaXInO1xuaW1wb3J0IHtDb21waWxhdGlvbkpvYn0gZnJvbSAnLi4vY29tcGlsYXRpb24nO1xuXG4vKipcbiAqIENyZWF0ZSBvbmUgaGVscGVyIGNvbnRleHQgb3AgcGVyIGkxOG4gYmxvY2sgKGluY2x1ZGluZyBnZW5lcmF0ZSBkZXNjZW5kaW5nIGJsb2NrcykuXG4gKlxuICogQWxzbywgaWYgYW4gSUNVIGV4aXN0cyBpbnNpZGUgYW4gaTE4biBibG9jayB0aGF0IGFsc28gY29udGFpbnMgb3RoZXIgbG9jYWxpemFibGUgY29udGVudCAoc3VjaCBhc1xuICogc3RyaW5nKSwgY3JlYXRlIGFuIGFkZGl0aW9uYWwgaGVscGVyIGNvbnRleHQgb3AgZm9yIHRoZSBJQ1UuXG4gKlxuICogVGhlc2UgY29udGV4dCBvcHMgYXJlIGxhdGVyIHVzZWQgZm9yIGdlbmVyYXRpbmcgaTE4biBtZXNzYWdlcy4gKEFsdGhvdWdoIHdlIGdlbmVyYXRlIGF0IGxlYXN0IG9uZVxuICogY29udGV4dCBvcCBwZXIgbmVzdGVkIHZpZXcsIHdlIHdpbGwgY29sbGVjdCB0aGVtIHVwIHRoZSB0cmVlIGxhdGVyLCB0byBnZW5lcmF0ZSBhIHRvcC1sZXZlbFxuICogbWVzc2FnZS4pXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVJMThuQ29udGV4dHMoam9iOiBDb21waWxhdGlvbkpvYikge1xuICAvLyBDcmVhdGUgaTE4biBjb250ZXh0IG9wcyBmb3IgaTE4biBhdHRycy5cbiAgY29uc3QgYXR0ckNvbnRleHRCeU1lc3NhZ2UgPSBuZXcgTWFwPGkxOG4uTWVzc2FnZSwgaXIuWHJlZklkPigpO1xuICBmb3IgKGNvbnN0IHVuaXQgb2Ygam9iLnVuaXRzKSB7XG4gICAgZm9yIChjb25zdCBvcCBvZiB1bml0Lm9wcygpKSB7XG4gICAgICBzd2l0Y2ggKG9wLmtpbmQpIHtcbiAgICAgICAgY2FzZSBpci5PcEtpbmQuQmluZGluZzpcbiAgICAgICAgY2FzZSBpci5PcEtpbmQuUHJvcGVydHk6XG4gICAgICAgIGNhc2UgaXIuT3BLaW5kLkF0dHJpYnV0ZTpcbiAgICAgICAgY2FzZSBpci5PcEtpbmQuRXh0cmFjdGVkQXR0cmlidXRlOlxuICAgICAgICAgIGlmIChvcC5pMThuTWVzc2FnZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghYXR0ckNvbnRleHRCeU1lc3NhZ2UuaGFzKG9wLmkxOG5NZXNzYWdlKSkge1xuICAgICAgICAgICAgY29uc3QgaTE4bkNvbnRleHQgPSBpci5jcmVhdGVJMThuQ29udGV4dE9wKFxuICAgICAgICAgICAgICBpci5JMThuQ29udGV4dEtpbmQuQXR0cixcbiAgICAgICAgICAgICAgam9iLmFsbG9jYXRlWHJlZklkKCksXG4gICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgIG9wLmkxOG5NZXNzYWdlLFxuICAgICAgICAgICAgICBudWxsISxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICB1bml0LmNyZWF0ZS5wdXNoKGkxOG5Db250ZXh0KTtcbiAgICAgICAgICAgIGF0dHJDb250ZXh0QnlNZXNzYWdlLnNldChvcC5pMThuTWVzc2FnZSwgaTE4bkNvbnRleHQueHJlZik7XG4gICAgICAgICAgfVxuICAgICAgICAgIG9wLmkxOG5Db250ZXh0ID0gYXR0ckNvbnRleHRCeU1lc3NhZ2UuZ2V0KG9wLmkxOG5NZXNzYWdlKSE7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gQ3JlYXRlIGkxOG4gY29udGV4dCBvcHMgZm9yIHJvb3QgaTE4biBibG9ja3MuXG4gIGNvbnN0IGJsb2NrQ29udGV4dEJ5STE4bkJsb2NrID0gbmV3IE1hcDxpci5YcmVmSWQsIGlyLkkxOG5Db250ZXh0T3A+KCk7XG4gIGZvciAoY29uc3QgdW5pdCBvZiBqb2IudW5pdHMpIHtcbiAgICBmb3IgKGNvbnN0IG9wIG9mIHVuaXQuY3JlYXRlKSB7XG4gICAgICBzd2l0Y2ggKG9wLmtpbmQpIHtcbiAgICAgICAgY2FzZSBpci5PcEtpbmQuSTE4blN0YXJ0OlxuICAgICAgICAgIGlmIChvcC54cmVmID09PSBvcC5yb290KSB7XG4gICAgICAgICAgICBjb25zdCBjb250ZXh0T3AgPSBpci5jcmVhdGVJMThuQ29udGV4dE9wKFxuICAgICAgICAgICAgICBpci5JMThuQ29udGV4dEtpbmQuUm9vdEkxOG4sXG4gICAgICAgICAgICAgIGpvYi5hbGxvY2F0ZVhyZWZJZCgpLFxuICAgICAgICAgICAgICBvcC54cmVmLFxuICAgICAgICAgICAgICBvcC5tZXNzYWdlLFxuICAgICAgICAgICAgICBudWxsISxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICB1bml0LmNyZWF0ZS5wdXNoKGNvbnRleHRPcCk7XG4gICAgICAgICAgICBvcC5jb250ZXh0ID0gY29udGV4dE9wLnhyZWY7XG4gICAgICAgICAgICBibG9ja0NvbnRleHRCeUkxOG5CbG9jay5zZXQob3AueHJlZiwgY29udGV4dE9wKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gQXNzaWduIGkxOG4gY29udGV4dHMgZm9yIGNoaWxkIGkxOG4gYmxvY2tzLiBUaGVzZSBkb24ndCBuZWVkIHRoZWlyIG93biBjb25leHQsIGluc3RlYWQgdGhleVxuICAvLyBzaG91bGQgaW5oZXJpdCBmcm9tIHRoZWlyIHJvb3QgaTE4biBibG9jay5cbiAgZm9yIChjb25zdCB1bml0IG9mIGpvYi51bml0cykge1xuICAgIGZvciAoY29uc3Qgb3Agb2YgdW5pdC5jcmVhdGUpIHtcbiAgICAgIGlmIChvcC5raW5kID09PSBpci5PcEtpbmQuSTE4blN0YXJ0ICYmIG9wLnhyZWYgIT09IG9wLnJvb3QpIHtcbiAgICAgICAgY29uc3Qgcm9vdENvbnRleHQgPSBibG9ja0NvbnRleHRCeUkxOG5CbG9jay5nZXQob3Aucm9vdCk7XG4gICAgICAgIGlmIChyb290Q29udGV4dCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdGhyb3cgRXJyb3IoJ0Fzc2VydGlvbkVycm9yOiBSb290IGkxOG4gYmxvY2sgaTE4biBjb250ZXh0IHNob3VsZCBoYXZlIGJlZW4gY3JlYXRlZC4nKTtcbiAgICAgICAgfVxuICAgICAgICBvcC5jb250ZXh0ID0gcm9vdENvbnRleHQueHJlZjtcbiAgICAgICAgYmxvY2tDb250ZXh0QnlJMThuQmxvY2suc2V0KG9wLnhyZWYsIHJvb3RDb250ZXh0KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBDcmVhdGUgb3IgYXNzaWduIGkxOG4gY29udGV4dHMgZm9yIElDVXMuXG4gIGxldCBjdXJyZW50STE4bk9wOiBpci5JMThuU3RhcnRPcCB8IG51bGwgPSBudWxsO1xuICBmb3IgKGNvbnN0IHVuaXQgb2Ygam9iLnVuaXRzKSB7XG4gICAgZm9yIChjb25zdCBvcCBvZiB1bml0LmNyZWF0ZSkge1xuICAgICAgc3dpdGNoIChvcC5raW5kKSB7XG4gICAgICAgIGNhc2UgaXIuT3BLaW5kLkkxOG5TdGFydDpcbiAgICAgICAgICBjdXJyZW50STE4bk9wID0gb3A7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgaXIuT3BLaW5kLkkxOG5FbmQ6XG4gICAgICAgICAgY3VycmVudEkxOG5PcCA9IG51bGw7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgaXIuT3BLaW5kLkljdVN0YXJ0OlxuICAgICAgICAgIGlmIChjdXJyZW50STE4bk9wID09PSBudWxsKSB7XG4gICAgICAgICAgICB0aHJvdyBFcnJvcignQXNzZXJ0aW9uRXJyb3I6IFVuZXhwZWN0ZWQgSUNVIG91dHNpZGUgb2YgYW4gaTE4biBibG9jay4nKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKG9wLm1lc3NhZ2UuaWQgIT09IGN1cnJlbnRJMThuT3AubWVzc2FnZS5pZCkge1xuICAgICAgICAgICAgLy8gVGhpcyBJQ1UgaXMgYSBzdWItbWVzc2FnZSBpbnNpZGUgaXRzIHBhcmVudCBpMThuIGJsb2NrIG1lc3NhZ2UuIFdlIG5lZWQgdG8gZ2l2ZSBpdFxuICAgICAgICAgICAgLy8gaXRzIG93biBjb250ZXh0LlxuICAgICAgICAgICAgY29uc3QgY29udGV4dE9wID0gaXIuY3JlYXRlSTE4bkNvbnRleHRPcChcbiAgICAgICAgICAgICAgaXIuSTE4bkNvbnRleHRLaW5kLkljdSxcbiAgICAgICAgICAgICAgam9iLmFsbG9jYXRlWHJlZklkKCksXG4gICAgICAgICAgICAgIGN1cnJlbnRJMThuT3Aucm9vdCxcbiAgICAgICAgICAgICAgb3AubWVzc2FnZSxcbiAgICAgICAgICAgICAgbnVsbCEsXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgdW5pdC5jcmVhdGUucHVzaChjb250ZXh0T3ApO1xuICAgICAgICAgICAgb3AuY29udGV4dCA9IGNvbnRleHRPcC54cmVmO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBUaGlzIElDVSBpcyB0aGUgb25seSB0cmFuc2xhdGFibGUgY29udGVudCBpbiBpdHMgcGFyZW50IGkxOG4gYmxvY2suIFdlIG5lZWQgdG9cbiAgICAgICAgICAgIC8vIGNvbnZlcnQgdGhlIHBhcmVudCdzIGNvbnRleHQgaW50byBhbiBJQ1UgY29udGV4dC5cbiAgICAgICAgICAgIG9wLmNvbnRleHQgPSBjdXJyZW50STE4bk9wLmNvbnRleHQ7XG4gICAgICAgICAgICBibG9ja0NvbnRleHRCeUkxOG5CbG9jay5nZXQoY3VycmVudEkxOG5PcC54cmVmKSEuY29udGV4dEtpbmQgPSBpci5JMThuQ29udGV4dEtpbmQuSWN1O1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==