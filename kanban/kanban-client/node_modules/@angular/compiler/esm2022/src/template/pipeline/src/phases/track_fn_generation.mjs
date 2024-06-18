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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhY2tfZm5fZ2VuZXJhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy90ZW1wbGF0ZS9waXBlbGluZS9zcmMvcGhhc2VzL3RyYWNrX2ZuX2dlbmVyYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxLQUFLLENBQUMsTUFBTSwrQkFBK0IsQ0FBQztBQUNuRCxPQUFPLEtBQUssRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUkvQjs7Ozs7OztHQU9HO0FBQ0gsTUFBTSxVQUFVLGdCQUFnQixDQUFDLEdBQW1CO0lBQ2xELEtBQUssTUFBTSxJQUFJLElBQUksR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzdCLEtBQUssTUFBTSxFQUFFLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQzdCLElBQUksRUFBRSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUN6QyxTQUFTO1lBQ1gsQ0FBQztZQUNELElBQUksRUFBRSxDQUFDLFNBQVMsS0FBSyxJQUFJLEVBQUUsQ0FBQztnQkFDMUIsK0VBQStFO2dCQUMvRSxTQUFTO1lBQ1gsQ0FBQztZQUVELG9DQUFvQztZQUNwQyxJQUFJLG9CQUFvQixHQUFHLEtBQUssQ0FBQztZQUNqQyxFQUFFLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxnQ0FBZ0MsQ0FDNUMsRUFBRSxDQUFDLEtBQUssRUFDUixDQUFDLElBQUksRUFBRSxFQUFFO2dCQUNQLElBQUksSUFBSSxZQUFZLEVBQUUsQ0FBQyxlQUFlLElBQUksSUFBSSxZQUFZLEVBQUUsQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO29CQUNyRixNQUFNLElBQUksS0FBSyxDQUFDLHNEQUFzRCxDQUFDLENBQUM7Z0JBQzFFLENBQUM7Z0JBQ0QsSUFBSSxJQUFJLFlBQVksRUFBRSxDQUFDLGdCQUFnQixFQUFFLENBQUM7b0JBQ3hDLG9CQUFvQixHQUFHLElBQUksQ0FBQztvQkFDNUIsT0FBTyxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUM1QixDQUFDO2dCQUNELE9BQU8sSUFBSSxDQUFDO1lBQ2QsQ0FBQyxFQUNELEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQzNCLENBQUM7WUFFRixJQUFJLEVBQXdDLENBQUM7WUFFN0MsTUFBTSxRQUFRLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDbkUsSUFBSSxvQkFBb0IsRUFBRSxDQUFDO2dCQUN6QixFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZFLENBQUM7aUJBQU0sQ0FBQztnQkFDTixFQUFFLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3JDLENBQUM7WUFFRCxFQUFFLENBQUMsU0FBUyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsRUFBRSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQ3RFLENBQUM7SUFDSCxDQUFDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBvIGZyb20gJy4uLy4uLy4uLy4uL291dHB1dC9vdXRwdXRfYXN0JztcbmltcG9ydCAqIGFzIGlyIGZyb20gJy4uLy4uL2lyJztcblxuaW1wb3J0IHR5cGUge0NvbXBpbGF0aW9uSm9ifSBmcm9tICcuLi9jb21waWxhdGlvbic7XG5cbi8qKlxuICogR2VuZXJhdGUgdHJhY2sgZnVuY3Rpb25zIHRoYXQgbmVlZCB0byBiZSBleHRyYWN0ZWQgdG8gdGhlIGNvbnN0YW50IHBvb2wuIFRoaXMgZW50YWlscyB3cmFwcGluZ1xuICogdGhlbSBpbiBhbiBhcnJvdyAob3IgdHJhZGl0aW9uYWwpIGZ1bmN0aW9uLCByZXBsYWNpbmcgY29udGV4dCByZWFkcyB3aXRoIGB0aGlzLmAsIGFuZCBzdG9yaW5nXG4gKiB0aGVtIGluIHRoZSBjb25zdGFudCBwb29sLlxuICpcbiAqIE5vdGUgdGhhdCwgaWYgYSB0cmFjayBmdW5jdGlvbiB3YXMgcHJldmlvdXNseSBvcHRpbWl6ZWQsIGl0IHdpbGwgbm90IG5lZWQgdG8gYmUgZXh0cmFjdGVkLCBhbmRcbiAqIHRoaXMgcGhhc2UgaXMgYSBuby1vcC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlVHJhY2tGbnMoam9iOiBDb21waWxhdGlvbkpvYik6IHZvaWQge1xuICBmb3IgKGNvbnN0IHVuaXQgb2Ygam9iLnVuaXRzKSB7XG4gICAgZm9yIChjb25zdCBvcCBvZiB1bml0LmNyZWF0ZSkge1xuICAgICAgaWYgKG9wLmtpbmQgIT09IGlyLk9wS2luZC5SZXBlYXRlckNyZWF0ZSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGlmIChvcC50cmFja0J5Rm4gIT09IG51bGwpIHtcbiAgICAgICAgLy8gVGhlIGZpbmFsIHRyYWNrIGZ1bmN0aW9uIHdhcyBhbHJlYWR5IHNldCwgcHJvYmFibHkgYmVjYXVzZSBpdCB3YXMgb3B0aW1pemVkLlxuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gRmluZCBhbGwgY29tcG9uZW50IGNvbnRleHQgcmVhZHMuXG4gICAgICBsZXQgdXNlc0NvbXBvbmVudENvbnRleHQgPSBmYWxzZTtcbiAgICAgIG9wLnRyYWNrID0gaXIudHJhbnNmb3JtRXhwcmVzc2lvbnNJbkV4cHJlc3Npb24oXG4gICAgICAgIG9wLnRyYWNrLFxuICAgICAgICAoZXhwcikgPT4ge1xuICAgICAgICAgIGlmIChleHByIGluc3RhbmNlb2YgaXIuUGlwZUJpbmRpbmdFeHByIHx8IGV4cHIgaW5zdGFuY2VvZiBpci5QaXBlQmluZGluZ1ZhcmlhZGljRXhwcikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbGxlZ2FsIFN0YXRlOiBQaXBlcyBhcmUgbm90IGFsbG93ZWQgaW4gdGhpcyBjb250ZXh0YCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChleHByIGluc3RhbmNlb2YgaXIuVHJhY2tDb250ZXh0RXhwcikge1xuICAgICAgICAgICAgdXNlc0NvbXBvbmVudENvbnRleHQgPSB0cnVlO1xuICAgICAgICAgICAgcmV0dXJuIG8udmFyaWFibGUoJ3RoaXMnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGV4cHI7XG4gICAgICAgIH0sXG4gICAgICAgIGlyLlZpc2l0b3JDb250ZXh0RmxhZy5Ob25lLFxuICAgICAgKTtcblxuICAgICAgbGV0IGZuOiBvLkZ1bmN0aW9uRXhwciB8IG8uQXJyb3dGdW5jdGlvbkV4cHI7XG5cbiAgICAgIGNvbnN0IGZuUGFyYW1zID0gW25ldyBvLkZuUGFyYW0oJyRpbmRleCcpLCBuZXcgby5GblBhcmFtKCckaXRlbScpXTtcbiAgICAgIGlmICh1c2VzQ29tcG9uZW50Q29udGV4dCkge1xuICAgICAgICBmbiA9IG5ldyBvLkZ1bmN0aW9uRXhwcihmblBhcmFtcywgW25ldyBvLlJldHVyblN0YXRlbWVudChvcC50cmFjayldKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZuID0gby5hcnJvd0ZuKGZuUGFyYW1zLCBvcC50cmFjayk7XG4gICAgICB9XG5cbiAgICAgIG9wLnRyYWNrQnlGbiA9IGpvYi5wb29sLmdldFNoYXJlZEZ1bmN0aW9uUmVmZXJlbmNlKGZuLCAnX2ZvclRyYWNrJyk7XG4gICAgfVxuICB9XG59XG4iXX0=