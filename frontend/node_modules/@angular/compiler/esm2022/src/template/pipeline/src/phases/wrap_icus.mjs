/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
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
                        // ICU i18n start/end ops should not recieve source spans.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid3JhcF9pY3VzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3RlbXBsYXRlL3BpcGVsaW5lL3NyYy9waGFzZXMvd3JhcF9pY3VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sS0FBSyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRy9COztHQUVHO0FBQ0gsTUFBTSxVQUFVLFlBQVksQ0FBQyxHQUFtQjtJQUM5QyxLQUFLLE1BQU0sSUFBSSxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM3QixJQUFJLGFBQWEsR0FBd0IsSUFBSSxDQUFDO1FBQzlDLElBQUksV0FBVyxHQUFtQixJQUFJLENBQUM7UUFDdkMsS0FBSyxNQUFNLEVBQUUsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDN0IsUUFBUSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2hCLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxTQUFTO29CQUN0QixhQUFhLEdBQUcsRUFBRSxDQUFDO29CQUNuQixNQUFNO2dCQUNSLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPO29CQUNwQixhQUFhLEdBQUcsSUFBSSxDQUFDO29CQUNyQixNQUFNO2dCQUNSLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRO29CQUNyQixJQUFJLGFBQWEsS0FBSyxJQUFJLEVBQUUsQ0FBQzt3QkFDM0IsV0FBVyxHQUFHLEdBQUcsQ0FBQyxjQUFjLEVBQUUsQ0FBQzt3QkFDbkMsMERBQTBEO3dCQUMxRCxFQUFFLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FDbEIsRUFBRSxDQUFDLGlCQUFpQixDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztvQkFDMUUsQ0FBQztvQkFDRCxNQUFNO2dCQUNSLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNO29CQUNuQixJQUFJLFdBQVcsS0FBSyxJQUFJLEVBQUUsQ0FBQzt3QkFDekIsRUFBRSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQWMsRUFBRSxDQUFDLGVBQWUsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7d0JBQzlFLFdBQVcsR0FBRyxJQUFJLENBQUM7b0JBQ3JCLENBQUM7b0JBQ0QsTUFBTTtZQUNWLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgaXIgZnJvbSAnLi4vLi4vaXInO1xuaW1wb3J0IHtDb21waWxhdGlvbkpvYn0gZnJvbSAnLi4vY29tcGlsYXRpb24nO1xuXG4vKipcbiAqIFdyYXBzIElDVXMgdGhhdCBkbyBub3QgYWxyZWFkeSBiZWxvbmcgdG8gYW4gaTE4biBibG9jayBpbiBhIG5ldyBpMThuIGJsb2NrLlxuICovXG5leHBvcnQgZnVuY3Rpb24gd3JhcEkxOG5JY3VzKGpvYjogQ29tcGlsYXRpb25Kb2IpOiB2b2lkIHtcbiAgZm9yIChjb25zdCB1bml0IG9mIGpvYi51bml0cykge1xuICAgIGxldCBjdXJyZW50STE4bk9wOiBpci5JMThuU3RhcnRPcHxudWxsID0gbnVsbDtcbiAgICBsZXQgYWRkZWRJMThuSWQ6IGlyLlhyZWZJZHxudWxsID0gbnVsbDtcbiAgICBmb3IgKGNvbnN0IG9wIG9mIHVuaXQuY3JlYXRlKSB7XG4gICAgICBzd2l0Y2ggKG9wLmtpbmQpIHtcbiAgICAgICAgY2FzZSBpci5PcEtpbmQuSTE4blN0YXJ0OlxuICAgICAgICAgIGN1cnJlbnRJMThuT3AgPSBvcDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBpci5PcEtpbmQuSTE4bkVuZDpcbiAgICAgICAgICBjdXJyZW50STE4bk9wID0gbnVsbDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBpci5PcEtpbmQuSWN1U3RhcnQ6XG4gICAgICAgICAgaWYgKGN1cnJlbnRJMThuT3AgPT09IG51bGwpIHtcbiAgICAgICAgICAgIGFkZGVkSTE4bklkID0gam9iLmFsbG9jYXRlWHJlZklkKCk7XG4gICAgICAgICAgICAvLyBJQ1UgaTE4biBzdGFydC9lbmQgb3BzIHNob3VsZCBub3QgcmVjaWV2ZSBzb3VyY2Ugc3BhbnMuXG4gICAgICAgICAgICBpci5PcExpc3QuaW5zZXJ0QmVmb3JlPGlyLkNyZWF0ZU9wPihcbiAgICAgICAgICAgICAgICBpci5jcmVhdGVJMThuU3RhcnRPcChhZGRlZEkxOG5JZCwgb3AubWVzc2FnZSwgdW5kZWZpbmVkLCBudWxsKSwgb3ApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBpci5PcEtpbmQuSWN1RW5kOlxuICAgICAgICAgIGlmIChhZGRlZEkxOG5JZCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgaXIuT3BMaXN0Lmluc2VydEFmdGVyPGlyLkNyZWF0ZU9wPihpci5jcmVhdGVJMThuRW5kT3AoYWRkZWRJMThuSWQsIG51bGwpLCBvcCk7XG4gICAgICAgICAgICBhZGRlZEkxOG5JZCA9IG51bGw7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19