/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as ir from '../../ir';
/**
 * Wraps ICUs that do not already belong to an i18n block in a new i18n block.
 */
export function wrapI18nIcus(job) {
    for (const unit of job.units) {
        let currentI18nOp = null;
        let addedI18nId = null;
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
                        addedI18nId = job.allocateXrefId();
                        // ICU i18n start/end ops should not receive source spans.
                        ir.OpList.insertBefore(ir.createI18nStartOp(addedI18nId, op.message, undefined, null), op);
                    }
                    break;
                case ir.OpKind.IcuEnd:
                    if (addedI18nId !== null) {
                        ir.OpList.insertAfter(ir.createI18nEndOp(addedI18nId, null), op);
                        addedI18nId = null;
                    }
                    break;
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid3JhcF9pY3VzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3RlbXBsYXRlL3BpcGVsaW5lL3NyYy9waGFzZXMvd3JhcF9pY3VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sS0FBSyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRy9COztHQUVHO0FBQ0gsTUFBTSxVQUFVLFlBQVksQ0FBQyxHQUFtQjtJQUM5QyxLQUFLLE1BQU0sSUFBSSxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM3QixJQUFJLGFBQWEsR0FBMEIsSUFBSSxDQUFDO1FBQ2hELElBQUksV0FBVyxHQUFxQixJQUFJLENBQUM7UUFDekMsS0FBSyxNQUFNLEVBQUUsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDN0IsUUFBUSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2hCLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxTQUFTO29CQUN0QixhQUFhLEdBQUcsRUFBRSxDQUFDO29CQUNuQixNQUFNO2dCQUNSLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPO29CQUNwQixhQUFhLEdBQUcsSUFBSSxDQUFDO29CQUNyQixNQUFNO2dCQUNSLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRO29CQUNyQixJQUFJLGFBQWEsS0FBSyxJQUFJLEVBQUUsQ0FBQzt3QkFDM0IsV0FBVyxHQUFHLEdBQUcsQ0FBQyxjQUFjLEVBQUUsQ0FBQzt3QkFDbkMsMERBQTBEO3dCQUMxRCxFQUFFLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FDcEIsRUFBRSxDQUFDLGlCQUFpQixDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsRUFDOUQsRUFBRSxDQUNILENBQUM7b0JBQ0osQ0FBQztvQkFDRCxNQUFNO2dCQUNSLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNO29CQUNuQixJQUFJLFdBQVcsS0FBSyxJQUFJLEVBQUUsQ0FBQzt3QkFDekIsRUFBRSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQWMsRUFBRSxDQUFDLGVBQWUsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7d0JBQzlFLFdBQVcsR0FBRyxJQUFJLENBQUM7b0JBQ3JCLENBQUM7b0JBQ0QsTUFBTTtZQUNWLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIGlyIGZyb20gJy4uLy4uL2lyJztcbmltcG9ydCB7Q29tcGlsYXRpb25Kb2J9IGZyb20gJy4uL2NvbXBpbGF0aW9uJztcblxuLyoqXG4gKiBXcmFwcyBJQ1VzIHRoYXQgZG8gbm90IGFscmVhZHkgYmVsb25nIHRvIGFuIGkxOG4gYmxvY2sgaW4gYSBuZXcgaTE4biBibG9jay5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdyYXBJMThuSWN1cyhqb2I6IENvbXBpbGF0aW9uSm9iKTogdm9pZCB7XG4gIGZvciAoY29uc3QgdW5pdCBvZiBqb2IudW5pdHMpIHtcbiAgICBsZXQgY3VycmVudEkxOG5PcDogaXIuSTE4blN0YXJ0T3AgfCBudWxsID0gbnVsbDtcbiAgICBsZXQgYWRkZWRJMThuSWQ6IGlyLlhyZWZJZCB8IG51bGwgPSBudWxsO1xuICAgIGZvciAoY29uc3Qgb3Agb2YgdW5pdC5jcmVhdGUpIHtcbiAgICAgIHN3aXRjaCAob3Aua2luZCkge1xuICAgICAgICBjYXNlIGlyLk9wS2luZC5JMThuU3RhcnQ6XG4gICAgICAgICAgY3VycmVudEkxOG5PcCA9IG9wO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIGlyLk9wS2luZC5JMThuRW5kOlxuICAgICAgICAgIGN1cnJlbnRJMThuT3AgPSBudWxsO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIGlyLk9wS2luZC5JY3VTdGFydDpcbiAgICAgICAgICBpZiAoY3VycmVudEkxOG5PcCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgYWRkZWRJMThuSWQgPSBqb2IuYWxsb2NhdGVYcmVmSWQoKTtcbiAgICAgICAgICAgIC8vIElDVSBpMThuIHN0YXJ0L2VuZCBvcHMgc2hvdWxkIG5vdCByZWNlaXZlIHNvdXJjZSBzcGFucy5cbiAgICAgICAgICAgIGlyLk9wTGlzdC5pbnNlcnRCZWZvcmU8aXIuQ3JlYXRlT3A+KFxuICAgICAgICAgICAgICBpci5jcmVhdGVJMThuU3RhcnRPcChhZGRlZEkxOG5JZCwgb3AubWVzc2FnZSwgdW5kZWZpbmVkLCBudWxsKSxcbiAgICAgICAgICAgICAgb3AsXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBpci5PcEtpbmQuSWN1RW5kOlxuICAgICAgICAgIGlmIChhZGRlZEkxOG5JZCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgaXIuT3BMaXN0Lmluc2VydEFmdGVyPGlyLkNyZWF0ZU9wPihpci5jcmVhdGVJMThuRW5kT3AoYWRkZWRJMThuSWQsIG51bGwpLCBvcCk7XG4gICAgICAgICAgICBhZGRlZEkxOG5JZCA9IG51bGw7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19