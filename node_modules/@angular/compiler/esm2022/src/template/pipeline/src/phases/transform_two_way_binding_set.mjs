/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';
import * as ng from '../instruction';
/**
 * Transforms a `TwoWayBindingSet` expression into an expression that either
 * sets a value through the `twoWayBindingSet` instruction or falls back to setting
 * the value directly. E.g. the expression `TwoWayBindingSet(target, value)` becomes:
 * `ng.twoWayBindingSet(target, value) || (target = value)`.
 */
export function transformTwoWayBindingSet(job) {
    for (const unit of job.units) {
        for (const op of unit.create) {
            if (op.kind === ir.OpKind.TwoWayListener) {
                ir.transformExpressionsInOp(op, (expr) => {
                    if (!(expr instanceof ir.TwoWayBindingSetExpr)) {
                        return expr;
                    }
                    const { target, value } = expr;
                    if (target instanceof o.ReadPropExpr || target instanceof o.ReadKeyExpr) {
                        return ng.twoWayBindingSet(target, value).or(target.set(value));
                    }
                    // ASSUMPTION: here we're assuming that `ReadVariableExpr` will be a reference
                    // to a local template variable. This appears to be the case at the time of writing.
                    // If the expression is targeting a variable read, we only emit the `twoWayBindingSet`
                    // since the fallback would be attempting to write into a constant. Invalid usages will be
                    // flagged during template type checking.
                    if (target instanceof ir.ReadVariableExpr) {
                        return ng.twoWayBindingSet(target, value);
                    }
                    throw new Error(`Unsupported expression in two-way action binding.`);
                }, ir.VisitorContextFlag.InChildOperation);
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtX3R3b193YXlfYmluZGluZ19zZXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvdGVtcGxhdGUvcGlwZWxpbmUvc3JjL3BoYXNlcy90cmFuc2Zvcm1fdHdvX3dheV9iaW5kaW5nX3NldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEtBQUssQ0FBQyxNQUFNLCtCQUErQixDQUFDO0FBQ25ELE9BQU8sS0FBSyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBQy9CLE9BQU8sS0FBSyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFHckM7Ozs7O0dBS0c7QUFDSCxNQUFNLFVBQVUseUJBQXlCLENBQUMsR0FBbUI7SUFDM0QsS0FBSyxNQUFNLElBQUksSUFBSSxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDN0IsS0FBSyxNQUFNLEVBQUUsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDN0IsSUFBSSxFQUFFLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQ3pDLEVBQUUsQ0FBQyx3QkFBd0IsQ0FDekIsRUFBRSxFQUNGLENBQUMsSUFBSSxFQUFFLEVBQUU7b0JBQ1AsSUFBSSxDQUFDLENBQUMsSUFBSSxZQUFZLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFLENBQUM7d0JBQy9DLE9BQU8sSUFBSSxDQUFDO29CQUNkLENBQUM7b0JBRUQsTUFBTSxFQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUMsR0FBRyxJQUFJLENBQUM7b0JBRTdCLElBQUksTUFBTSxZQUFZLENBQUMsQ0FBQyxZQUFZLElBQUksTUFBTSxZQUFZLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQzt3QkFDeEUsT0FBTyxFQUFFLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7b0JBQ2xFLENBQUM7b0JBRUQsOEVBQThFO29CQUM5RSxvRkFBb0Y7b0JBQ3BGLHNGQUFzRjtvQkFDdEYsMEZBQTBGO29CQUMxRix5Q0FBeUM7b0JBQ3pDLElBQUksTUFBTSxZQUFZLEVBQUUsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO3dCQUMxQyxPQUFPLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7b0JBQzVDLENBQUM7b0JBRUQsTUFBTSxJQUFJLEtBQUssQ0FBQyxtREFBbUQsQ0FBQyxDQUFDO2dCQUN2RSxDQUFDLEVBQ0QsRUFBRSxDQUFDLGtCQUFrQixDQUFDLGdCQUFnQixDQUN2QyxDQUFDO1lBQ0osQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgbyBmcm9tICcuLi8uLi8uLi8uLi9vdXRwdXQvb3V0cHV0X2FzdCc7XG5pbXBvcnQgKiBhcyBpciBmcm9tICcuLi8uLi9pcic7XG5pbXBvcnQgKiBhcyBuZyBmcm9tICcuLi9pbnN0cnVjdGlvbic7XG5pbXBvcnQgdHlwZSB7Q29tcGlsYXRpb25Kb2J9IGZyb20gJy4uL2NvbXBpbGF0aW9uJztcblxuLyoqXG4gKiBUcmFuc2Zvcm1zIGEgYFR3b1dheUJpbmRpbmdTZXRgIGV4cHJlc3Npb24gaW50byBhbiBleHByZXNzaW9uIHRoYXQgZWl0aGVyXG4gKiBzZXRzIGEgdmFsdWUgdGhyb3VnaCB0aGUgYHR3b1dheUJpbmRpbmdTZXRgIGluc3RydWN0aW9uIG9yIGZhbGxzIGJhY2sgdG8gc2V0dGluZ1xuICogdGhlIHZhbHVlIGRpcmVjdGx5LiBFLmcuIHRoZSBleHByZXNzaW9uIGBUd29XYXlCaW5kaW5nU2V0KHRhcmdldCwgdmFsdWUpYCBiZWNvbWVzOlxuICogYG5nLnR3b1dheUJpbmRpbmdTZXQodGFyZ2V0LCB2YWx1ZSkgfHwgKHRhcmdldCA9IHZhbHVlKWAuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1Ud29XYXlCaW5kaW5nU2V0KGpvYjogQ29tcGlsYXRpb25Kb2IpOiB2b2lkIHtcbiAgZm9yIChjb25zdCB1bml0IG9mIGpvYi51bml0cykge1xuICAgIGZvciAoY29uc3Qgb3Agb2YgdW5pdC5jcmVhdGUpIHtcbiAgICAgIGlmIChvcC5raW5kID09PSBpci5PcEtpbmQuVHdvV2F5TGlzdGVuZXIpIHtcbiAgICAgICAgaXIudHJhbnNmb3JtRXhwcmVzc2lvbnNJbk9wKFxuICAgICAgICAgIG9wLFxuICAgICAgICAgIChleHByKSA9PiB7XG4gICAgICAgICAgICBpZiAoIShleHByIGluc3RhbmNlb2YgaXIuVHdvV2F5QmluZGluZ1NldEV4cHIpKSB7XG4gICAgICAgICAgICAgIHJldHVybiBleHByO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCB7dGFyZ2V0LCB2YWx1ZX0gPSBleHByO1xuXG4gICAgICAgICAgICBpZiAodGFyZ2V0IGluc3RhbmNlb2Ygby5SZWFkUHJvcEV4cHIgfHwgdGFyZ2V0IGluc3RhbmNlb2Ygby5SZWFkS2V5RXhwcikge1xuICAgICAgICAgICAgICByZXR1cm4gbmcudHdvV2F5QmluZGluZ1NldCh0YXJnZXQsIHZhbHVlKS5vcih0YXJnZXQuc2V0KHZhbHVlKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEFTU1VNUFRJT046IGhlcmUgd2UncmUgYXNzdW1pbmcgdGhhdCBgUmVhZFZhcmlhYmxlRXhwcmAgd2lsbCBiZSBhIHJlZmVyZW5jZVxuICAgICAgICAgICAgLy8gdG8gYSBsb2NhbCB0ZW1wbGF0ZSB2YXJpYWJsZS4gVGhpcyBhcHBlYXJzIHRvIGJlIHRoZSBjYXNlIGF0IHRoZSB0aW1lIG9mIHdyaXRpbmcuXG4gICAgICAgICAgICAvLyBJZiB0aGUgZXhwcmVzc2lvbiBpcyB0YXJnZXRpbmcgYSB2YXJpYWJsZSByZWFkLCB3ZSBvbmx5IGVtaXQgdGhlIGB0d29XYXlCaW5kaW5nU2V0YFxuICAgICAgICAgICAgLy8gc2luY2UgdGhlIGZhbGxiYWNrIHdvdWxkIGJlIGF0dGVtcHRpbmcgdG8gd3JpdGUgaW50byBhIGNvbnN0YW50LiBJbnZhbGlkIHVzYWdlcyB3aWxsIGJlXG4gICAgICAgICAgICAvLyBmbGFnZ2VkIGR1cmluZyB0ZW1wbGF0ZSB0eXBlIGNoZWNraW5nLlxuICAgICAgICAgICAgaWYgKHRhcmdldCBpbnN0YW5jZW9mIGlyLlJlYWRWYXJpYWJsZUV4cHIpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIG5nLnR3b1dheUJpbmRpbmdTZXQodGFyZ2V0LCB2YWx1ZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5zdXBwb3J0ZWQgZXhwcmVzc2lvbiBpbiB0d28td2F5IGFjdGlvbiBiaW5kaW5nLmApO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgaXIuVmlzaXRvckNvbnRleHRGbGFnLkluQ2hpbGRPcGVyYXRpb24sXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=