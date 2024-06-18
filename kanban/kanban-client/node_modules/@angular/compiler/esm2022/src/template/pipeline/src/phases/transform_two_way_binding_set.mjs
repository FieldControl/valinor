/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtX3R3b193YXlfYmluZGluZ19zZXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvdGVtcGxhdGUvcGlwZWxpbmUvc3JjL3BoYXNlcy90cmFuc2Zvcm1fdHdvX3dheV9iaW5kaW5nX3NldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEtBQUssQ0FBQyxNQUFNLCtCQUErQixDQUFDO0FBQ25ELE9BQU8sS0FBSyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBQy9CLE9BQU8sS0FBSyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFHckM7Ozs7O0dBS0c7QUFDSCxNQUFNLFVBQVUseUJBQXlCLENBQUMsR0FBbUI7SUFDM0QsS0FBSyxNQUFNLElBQUksSUFBSSxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDN0IsS0FBSyxNQUFNLEVBQUUsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDN0IsSUFBSSxFQUFFLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQ3pDLEVBQUUsQ0FBQyx3QkFBd0IsQ0FDekIsRUFBRSxFQUNGLENBQUMsSUFBSSxFQUFFLEVBQUU7b0JBQ1AsSUFBSSxDQUFDLENBQUMsSUFBSSxZQUFZLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFLENBQUM7d0JBQy9DLE9BQU8sSUFBSSxDQUFDO29CQUNkLENBQUM7b0JBRUQsTUFBTSxFQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUMsR0FBRyxJQUFJLENBQUM7b0JBRTdCLElBQUksTUFBTSxZQUFZLENBQUMsQ0FBQyxZQUFZLElBQUksTUFBTSxZQUFZLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQzt3QkFDeEUsT0FBTyxFQUFFLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7b0JBQ2xFLENBQUM7b0JBRUQsOEVBQThFO29CQUM5RSxvRkFBb0Y7b0JBQ3BGLHNGQUFzRjtvQkFDdEYsMEZBQTBGO29CQUMxRix5Q0FBeUM7b0JBQ3pDLElBQUksTUFBTSxZQUFZLEVBQUUsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO3dCQUMxQyxPQUFPLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7b0JBQzVDLENBQUM7b0JBRUQsTUFBTSxJQUFJLEtBQUssQ0FBQyxtREFBbUQsQ0FBQyxDQUFDO2dCQUN2RSxDQUFDLEVBQ0QsRUFBRSxDQUFDLGtCQUFrQixDQUFDLGdCQUFnQixDQUN2QyxDQUFDO1lBQ0osQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBvIGZyb20gJy4uLy4uLy4uLy4uL291dHB1dC9vdXRwdXRfYXN0JztcbmltcG9ydCAqIGFzIGlyIGZyb20gJy4uLy4uL2lyJztcbmltcG9ydCAqIGFzIG5nIGZyb20gJy4uL2luc3RydWN0aW9uJztcbmltcG9ydCB0eXBlIHtDb21waWxhdGlvbkpvYn0gZnJvbSAnLi4vY29tcGlsYXRpb24nO1xuXG4vKipcbiAqIFRyYW5zZm9ybXMgYSBgVHdvV2F5QmluZGluZ1NldGAgZXhwcmVzc2lvbiBpbnRvIGFuIGV4cHJlc3Npb24gdGhhdCBlaXRoZXJcbiAqIHNldHMgYSB2YWx1ZSB0aHJvdWdoIHRoZSBgdHdvV2F5QmluZGluZ1NldGAgaW5zdHJ1Y3Rpb24gb3IgZmFsbHMgYmFjayB0byBzZXR0aW5nXG4gKiB0aGUgdmFsdWUgZGlyZWN0bHkuIEUuZy4gdGhlIGV4cHJlc3Npb24gYFR3b1dheUJpbmRpbmdTZXQodGFyZ2V0LCB2YWx1ZSlgIGJlY29tZXM6XG4gKiBgbmcudHdvV2F5QmluZGluZ1NldCh0YXJnZXQsIHZhbHVlKSB8fCAodGFyZ2V0ID0gdmFsdWUpYC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zZm9ybVR3b1dheUJpbmRpbmdTZXQoam9iOiBDb21waWxhdGlvbkpvYik6IHZvaWQge1xuICBmb3IgKGNvbnN0IHVuaXQgb2Ygam9iLnVuaXRzKSB7XG4gICAgZm9yIChjb25zdCBvcCBvZiB1bml0LmNyZWF0ZSkge1xuICAgICAgaWYgKG9wLmtpbmQgPT09IGlyLk9wS2luZC5Ud29XYXlMaXN0ZW5lcikge1xuICAgICAgICBpci50cmFuc2Zvcm1FeHByZXNzaW9uc0luT3AoXG4gICAgICAgICAgb3AsXG4gICAgICAgICAgKGV4cHIpID0+IHtcbiAgICAgICAgICAgIGlmICghKGV4cHIgaW5zdGFuY2VvZiBpci5Ud29XYXlCaW5kaW5nU2V0RXhwcikpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGV4cHI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHt0YXJnZXQsIHZhbHVlfSA9IGV4cHI7XG5cbiAgICAgICAgICAgIGlmICh0YXJnZXQgaW5zdGFuY2VvZiBvLlJlYWRQcm9wRXhwciB8fCB0YXJnZXQgaW5zdGFuY2VvZiBvLlJlYWRLZXlFeHByKSB7XG4gICAgICAgICAgICAgIHJldHVybiBuZy50d29XYXlCaW5kaW5nU2V0KHRhcmdldCwgdmFsdWUpLm9yKHRhcmdldC5zZXQodmFsdWUpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQVNTVU1QVElPTjogaGVyZSB3ZSdyZSBhc3N1bWluZyB0aGF0IGBSZWFkVmFyaWFibGVFeHByYCB3aWxsIGJlIGEgcmVmZXJlbmNlXG4gICAgICAgICAgICAvLyB0byBhIGxvY2FsIHRlbXBsYXRlIHZhcmlhYmxlLiBUaGlzIGFwcGVhcnMgdG8gYmUgdGhlIGNhc2UgYXQgdGhlIHRpbWUgb2Ygd3JpdGluZy5cbiAgICAgICAgICAgIC8vIElmIHRoZSBleHByZXNzaW9uIGlzIHRhcmdldGluZyBhIHZhcmlhYmxlIHJlYWQsIHdlIG9ubHkgZW1pdCB0aGUgYHR3b1dheUJpbmRpbmdTZXRgXG4gICAgICAgICAgICAvLyBzaW5jZSB0aGUgZmFsbGJhY2sgd291bGQgYmUgYXR0ZW1wdGluZyB0byB3cml0ZSBpbnRvIGEgY29uc3RhbnQuIEludmFsaWQgdXNhZ2VzIHdpbGwgYmVcbiAgICAgICAgICAgIC8vIGZsYWdnZWQgZHVyaW5nIHRlbXBsYXRlIHR5cGUgY2hlY2tpbmcuXG4gICAgICAgICAgICBpZiAodGFyZ2V0IGluc3RhbmNlb2YgaXIuUmVhZFZhcmlhYmxlRXhwcikge1xuICAgICAgICAgICAgICByZXR1cm4gbmcudHdvV2F5QmluZGluZ1NldCh0YXJnZXQsIHZhbHVlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbnN1cHBvcnRlZCBleHByZXNzaW9uIGluIHR3by13YXkgYWN0aW9uIGJpbmRpbmcuYCk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBpci5WaXNpdG9yQ29udGV4dEZsYWcuSW5DaGlsZE9wZXJhdGlvbixcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==