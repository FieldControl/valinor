/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';
/**
 * Generate track functions that need to be extracted to the constant pool. This entails wrapping
 * them in an arrow (or traditional) function, replacing context reads with `this.`, and storing
 * them in the constant pool.
 *
 * Note that, if a track function was previously optimized, it will not need to be extracted, and
 * this phase is a no-op.
 */
export function generateTrackFns(job) {
    for (const unit of job.units) {
        for (const op of unit.create) {
            if (op.kind !== ir.OpKind.RepeaterCreate) {
                continue;
            }
            if (op.trackByFn !== null) {
                // The final track function was already set, probably because it was optimized.
                continue;
            }
            // Find all component context reads.
            let usesComponentContext = false;
            op.track = ir.transformExpressionsInExpression(op.track, expr => {
                if (expr instanceof ir.PipeBindingExpr || expr instanceof ir.PipeBindingVariadicExpr) {
                    throw new Error(`Illegal State: Pipes are not allowed in this context`);
                }
                if (expr instanceof ir.TrackContextExpr) {
                    usesComponentContext = true;
                    return o.variable('this');
                }
                return expr;
            }, ir.VisitorContextFlag.None);
            let fn;
            const fnParams = [new o.FnParam('$index'), new o.FnParam('$item')];
            if (usesComponentContext) {
                fn = new o.FunctionExpr(fnParams, [new o.ReturnStatement(op.track)]);
            }
            else {
                fn = o.arrowFn(fnParams, op.track);
            }
            op.trackByFn = job.pool.getSharedFunctionReference(fn, '_forTrack');
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhY2tfZm5fZ2VuZXJhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy90ZW1wbGF0ZS9waXBlbGluZS9zcmMvcGhhc2VzL3RyYWNrX2ZuX2dlbmVyYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxLQUFLLENBQUMsTUFBTSwrQkFBK0IsQ0FBQztBQUNuRCxPQUFPLEtBQUssRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUkvQjs7Ozs7OztHQU9HO0FBQ0gsTUFBTSxVQUFVLGdCQUFnQixDQUFDLEdBQW1CO0lBQ2xELEtBQUssTUFBTSxJQUFJLElBQUksR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzdCLEtBQUssTUFBTSxFQUFFLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQzdCLElBQUksRUFBRSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUN6QyxTQUFTO1lBQ1gsQ0FBQztZQUNELElBQUksRUFBRSxDQUFDLFNBQVMsS0FBSyxJQUFJLEVBQUUsQ0FBQztnQkFDMUIsK0VBQStFO2dCQUMvRSxTQUFTO1lBQ1gsQ0FBQztZQUVELG9DQUFvQztZQUNwQyxJQUFJLG9CQUFvQixHQUFHLEtBQUssQ0FBQztZQUNqQyxFQUFFLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxnQ0FBZ0MsQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFO2dCQUM5RCxJQUFJLElBQUksWUFBWSxFQUFFLENBQUMsZUFBZSxJQUFJLElBQUksWUFBWSxFQUFFLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztvQkFDckYsTUFBTSxJQUFJLEtBQUssQ0FBQyxzREFBc0QsQ0FBQyxDQUFDO2dCQUMxRSxDQUFDO2dCQUNELElBQUksSUFBSSxZQUFZLEVBQUUsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO29CQUN4QyxvQkFBb0IsR0FBRyxJQUFJLENBQUM7b0JBQzVCLE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDNUIsQ0FBQztnQkFDRCxPQUFPLElBQUksQ0FBQztZQUNkLENBQUMsRUFBRSxFQUFFLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFL0IsSUFBSSxFQUFzQyxDQUFDO1lBRTNDLE1BQU0sUUFBUSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ25FLElBQUksb0JBQW9CLEVBQUUsQ0FBQztnQkFDekIsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN2RSxDQUFDO2lCQUFNLENBQUM7Z0JBQ04sRUFBRSxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNyQyxDQUFDO1lBRUQsRUFBRSxDQUFDLFNBQVMsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLEVBQUUsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUN0RSxDQUFDO0lBQ0gsQ0FBQztBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgbyBmcm9tICcuLi8uLi8uLi8uLi9vdXRwdXQvb3V0cHV0X2FzdCc7XG5pbXBvcnQgKiBhcyBpciBmcm9tICcuLi8uLi9pcic7XG5cbmltcG9ydCB0eXBlIHtDb21waWxhdGlvbkpvYn0gZnJvbSAnLi4vY29tcGlsYXRpb24nO1xuXG4vKipcbiAqIEdlbmVyYXRlIHRyYWNrIGZ1bmN0aW9ucyB0aGF0IG5lZWQgdG8gYmUgZXh0cmFjdGVkIHRvIHRoZSBjb25zdGFudCBwb29sLiBUaGlzIGVudGFpbHMgd3JhcHBpbmdcbiAqIHRoZW0gaW4gYW4gYXJyb3cgKG9yIHRyYWRpdGlvbmFsKSBmdW5jdGlvbiwgcmVwbGFjaW5nIGNvbnRleHQgcmVhZHMgd2l0aCBgdGhpcy5gLCBhbmQgc3RvcmluZ1xuICogdGhlbSBpbiB0aGUgY29uc3RhbnQgcG9vbC5cbiAqXG4gKiBOb3RlIHRoYXQsIGlmIGEgdHJhY2sgZnVuY3Rpb24gd2FzIHByZXZpb3VzbHkgb3B0aW1pemVkLCBpdCB3aWxsIG5vdCBuZWVkIHRvIGJlIGV4dHJhY3RlZCwgYW5kXG4gKiB0aGlzIHBoYXNlIGlzIGEgbm8tb3AuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZVRyYWNrRm5zKGpvYjogQ29tcGlsYXRpb25Kb2IpOiB2b2lkIHtcbiAgZm9yIChjb25zdCB1bml0IG9mIGpvYi51bml0cykge1xuICAgIGZvciAoY29uc3Qgb3Agb2YgdW5pdC5jcmVhdGUpIHtcbiAgICAgIGlmIChvcC5raW5kICE9PSBpci5PcEtpbmQuUmVwZWF0ZXJDcmVhdGUpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBpZiAob3AudHJhY2tCeUZuICE9PSBudWxsKSB7XG4gICAgICAgIC8vIFRoZSBmaW5hbCB0cmFjayBmdW5jdGlvbiB3YXMgYWxyZWFkeSBzZXQsIHByb2JhYmx5IGJlY2F1c2UgaXQgd2FzIG9wdGltaXplZC5cbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIEZpbmQgYWxsIGNvbXBvbmVudCBjb250ZXh0IHJlYWRzLlxuICAgICAgbGV0IHVzZXNDb21wb25lbnRDb250ZXh0ID0gZmFsc2U7XG4gICAgICBvcC50cmFjayA9IGlyLnRyYW5zZm9ybUV4cHJlc3Npb25zSW5FeHByZXNzaW9uKG9wLnRyYWNrLCBleHByID0+IHtcbiAgICAgICAgaWYgKGV4cHIgaW5zdGFuY2VvZiBpci5QaXBlQmluZGluZ0V4cHIgfHwgZXhwciBpbnN0YW5jZW9mIGlyLlBpcGVCaW5kaW5nVmFyaWFkaWNFeHByKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbGxlZ2FsIFN0YXRlOiBQaXBlcyBhcmUgbm90IGFsbG93ZWQgaW4gdGhpcyBjb250ZXh0YCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGV4cHIgaW5zdGFuY2VvZiBpci5UcmFja0NvbnRleHRFeHByKSB7XG4gICAgICAgICAgdXNlc0NvbXBvbmVudENvbnRleHQgPSB0cnVlO1xuICAgICAgICAgIHJldHVybiBvLnZhcmlhYmxlKCd0aGlzJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGV4cHI7XG4gICAgICB9LCBpci5WaXNpdG9yQ29udGV4dEZsYWcuTm9uZSk7XG5cbiAgICAgIGxldCBmbjogby5GdW5jdGlvbkV4cHJ8by5BcnJvd0Z1bmN0aW9uRXhwcjtcblxuICAgICAgY29uc3QgZm5QYXJhbXMgPSBbbmV3IG8uRm5QYXJhbSgnJGluZGV4JyksIG5ldyBvLkZuUGFyYW0oJyRpdGVtJyldO1xuICAgICAgaWYgKHVzZXNDb21wb25lbnRDb250ZXh0KSB7XG4gICAgICAgIGZuID0gbmV3IG8uRnVuY3Rpb25FeHByKGZuUGFyYW1zLCBbbmV3IG8uUmV0dXJuU3RhdGVtZW50KG9wLnRyYWNrKV0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm4gPSBvLmFycm93Rm4oZm5QYXJhbXMsIG9wLnRyYWNrKTtcbiAgICAgIH1cblxuICAgICAgb3AudHJhY2tCeUZuID0gam9iLnBvb2wuZ2V0U2hhcmVkRnVuY3Rpb25SZWZlcmVuY2UoZm4sICdfZm9yVHJhY2snKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==