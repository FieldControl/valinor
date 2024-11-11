/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
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
            op.track = ir.transformExpressionsInExpression(op.track, (expr) => {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhY2tfZm5fZ2VuZXJhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy90ZW1wbGF0ZS9waXBlbGluZS9zcmMvcGhhc2VzL3RyYWNrX2ZuX2dlbmVyYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxLQUFLLENBQUMsTUFBTSwrQkFBK0IsQ0FBQztBQUNuRCxPQUFPLEtBQUssRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUkvQjs7Ozs7OztHQU9HO0FBQ0gsTUFBTSxVQUFVLGdCQUFnQixDQUFDLEdBQW1CO0lBQ2xELEtBQUssTUFBTSxJQUFJLElBQUksR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzdCLEtBQUssTUFBTSxFQUFFLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQzdCLElBQUksRUFBRSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUN6QyxTQUFTO1lBQ1gsQ0FBQztZQUNELElBQUksRUFBRSxDQUFDLFNBQVMsS0FBSyxJQUFJLEVBQUUsQ0FBQztnQkFDMUIsK0VBQStFO2dCQUMvRSxTQUFTO1lBQ1gsQ0FBQztZQUVELG9DQUFvQztZQUNwQyxJQUFJLG9CQUFvQixHQUFHLEtBQUssQ0FBQztZQUNqQyxFQUFFLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxnQ0FBZ0MsQ0FDNUMsRUFBRSxDQUFDLEtBQUssRUFDUixDQUFDLElBQUksRUFBRSxFQUFFO2dCQUNQLElBQUksSUFBSSxZQUFZLEVBQUUsQ0FBQyxlQUFlLElBQUksSUFBSSxZQUFZLEVBQUUsQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO29CQUNyRixNQUFNLElBQUksS0FBSyxDQUFDLHNEQUFzRCxDQUFDLENBQUM7Z0JBQzFFLENBQUM7Z0JBQ0QsSUFBSSxJQUFJLFlBQVksRUFBRSxDQUFDLGdCQUFnQixFQUFFLENBQUM7b0JBQ3hDLG9CQUFvQixHQUFHLElBQUksQ0FBQztvQkFDNUIsT0FBTyxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUM1QixDQUFDO2dCQUNELE9BQU8sSUFBSSxDQUFDO1lBQ2QsQ0FBQyxFQUNELEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQzNCLENBQUM7WUFFRixJQUFJLEVBQXdDLENBQUM7WUFFN0MsTUFBTSxRQUFRLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDbkUsSUFBSSxvQkFBb0IsRUFBRSxDQUFDO2dCQUN6QixFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZFLENBQUM7aUJBQU0sQ0FBQztnQkFDTixFQUFFLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3JDLENBQUM7WUFFRCxFQUFFLENBQUMsU0FBUyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsRUFBRSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQ3RFLENBQUM7SUFDSCxDQUFDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgbyBmcm9tICcuLi8uLi8uLi8uLi9vdXRwdXQvb3V0cHV0X2FzdCc7XG5pbXBvcnQgKiBhcyBpciBmcm9tICcuLi8uLi9pcic7XG5cbmltcG9ydCB0eXBlIHtDb21waWxhdGlvbkpvYn0gZnJvbSAnLi4vY29tcGlsYXRpb24nO1xuXG4vKipcbiAqIEdlbmVyYXRlIHRyYWNrIGZ1bmN0aW9ucyB0aGF0IG5lZWQgdG8gYmUgZXh0cmFjdGVkIHRvIHRoZSBjb25zdGFudCBwb29sLiBUaGlzIGVudGFpbHMgd3JhcHBpbmdcbiAqIHRoZW0gaW4gYW4gYXJyb3cgKG9yIHRyYWRpdGlvbmFsKSBmdW5jdGlvbiwgcmVwbGFjaW5nIGNvbnRleHQgcmVhZHMgd2l0aCBgdGhpcy5gLCBhbmQgc3RvcmluZ1xuICogdGhlbSBpbiB0aGUgY29uc3RhbnQgcG9vbC5cbiAqXG4gKiBOb3RlIHRoYXQsIGlmIGEgdHJhY2sgZnVuY3Rpb24gd2FzIHByZXZpb3VzbHkgb3B0aW1pemVkLCBpdCB3aWxsIG5vdCBuZWVkIHRvIGJlIGV4dHJhY3RlZCwgYW5kXG4gKiB0aGlzIHBoYXNlIGlzIGEgbm8tb3AuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZVRyYWNrRm5zKGpvYjogQ29tcGlsYXRpb25Kb2IpOiB2b2lkIHtcbiAgZm9yIChjb25zdCB1bml0IG9mIGpvYi51bml0cykge1xuICAgIGZvciAoY29uc3Qgb3Agb2YgdW5pdC5jcmVhdGUpIHtcbiAgICAgIGlmIChvcC5raW5kICE9PSBpci5PcEtpbmQuUmVwZWF0ZXJDcmVhdGUpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBpZiAob3AudHJhY2tCeUZuICE9PSBudWxsKSB7XG4gICAgICAgIC8vIFRoZSBmaW5hbCB0cmFjayBmdW5jdGlvbiB3YXMgYWxyZWFkeSBzZXQsIHByb2JhYmx5IGJlY2F1c2UgaXQgd2FzIG9wdGltaXplZC5cbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIEZpbmQgYWxsIGNvbXBvbmVudCBjb250ZXh0IHJlYWRzLlxuICAgICAgbGV0IHVzZXNDb21wb25lbnRDb250ZXh0ID0gZmFsc2U7XG4gICAgICBvcC50cmFjayA9IGlyLnRyYW5zZm9ybUV4cHJlc3Npb25zSW5FeHByZXNzaW9uKFxuICAgICAgICBvcC50cmFjayxcbiAgICAgICAgKGV4cHIpID0+IHtcbiAgICAgICAgICBpZiAoZXhwciBpbnN0YW5jZW9mIGlyLlBpcGVCaW5kaW5nRXhwciB8fCBleHByIGluc3RhbmNlb2YgaXIuUGlwZUJpbmRpbmdWYXJpYWRpY0V4cHIpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSWxsZWdhbCBTdGF0ZTogUGlwZXMgYXJlIG5vdCBhbGxvd2VkIGluIHRoaXMgY29udGV4dGApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoZXhwciBpbnN0YW5jZW9mIGlyLlRyYWNrQ29udGV4dEV4cHIpIHtcbiAgICAgICAgICAgIHVzZXNDb21wb25lbnRDb250ZXh0ID0gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybiBvLnZhcmlhYmxlKCd0aGlzJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBleHByO1xuICAgICAgICB9LFxuICAgICAgICBpci5WaXNpdG9yQ29udGV4dEZsYWcuTm9uZSxcbiAgICAgICk7XG5cbiAgICAgIGxldCBmbjogby5GdW5jdGlvbkV4cHIgfCBvLkFycm93RnVuY3Rpb25FeHByO1xuXG4gICAgICBjb25zdCBmblBhcmFtcyA9IFtuZXcgby5GblBhcmFtKCckaW5kZXgnKSwgbmV3IG8uRm5QYXJhbSgnJGl0ZW0nKV07XG4gICAgICBpZiAodXNlc0NvbXBvbmVudENvbnRleHQpIHtcbiAgICAgICAgZm4gPSBuZXcgby5GdW5jdGlvbkV4cHIoZm5QYXJhbXMsIFtuZXcgby5SZXR1cm5TdGF0ZW1lbnQob3AudHJhY2spXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmbiA9IG8uYXJyb3dGbihmblBhcmFtcywgb3AudHJhY2spO1xuICAgICAgfVxuXG4gICAgICBvcC50cmFja0J5Rm4gPSBqb2IucG9vbC5nZXRTaGFyZWRGdW5jdGlvblJlZmVyZW5jZShmbiwgJ19mb3JUcmFjaycpO1xuICAgIH1cbiAgfVxufVxuIl19