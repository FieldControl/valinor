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
 * Inside the `track` expression on a `for` repeater, the `$index` and `$item` variables are
 * ambiently available. In this phase, we find those variable usages, and replace them with the
 * appropriate output read.
 */
export function generateTrackVariables(job) {
    for (const unit of job.units) {
        for (const op of unit.create) {
            if (op.kind !== ir.OpKind.RepeaterCreate) {
                continue;
            }
            op.track = ir.transformExpressionsInExpression(op.track, (expr) => {
                if (expr instanceof ir.LexicalReadExpr) {
                    if (op.varNames.$index.has(expr.name)) {
                        return o.variable('$index');
                    }
                    else if (expr.name === op.varNames.$implicit) {
                        return o.variable('$item');
                    }
                    // TODO: handle prohibited context variables (emit as globals?)
                }
                return expr;
            }, ir.VisitorContextFlag.None);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhY2tfdmFyaWFibGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3RlbXBsYXRlL3BpcGVsaW5lL3NyYy9waGFzZXMvdHJhY2tfdmFyaWFibGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sS0FBSyxDQUFDLE1BQU0sK0JBQStCLENBQUM7QUFDbkQsT0FBTyxLQUFLLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFJL0I7Ozs7R0FJRztBQUNILE1BQU0sVUFBVSxzQkFBc0IsQ0FBQyxHQUFtQjtJQUN4RCxLQUFLLE1BQU0sSUFBSSxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM3QixLQUFLLE1BQU0sRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUM3QixJQUFJLEVBQUUsQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDekMsU0FBUztZQUNYLENBQUM7WUFFRCxFQUFFLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxnQ0FBZ0MsQ0FDNUMsRUFBRSxDQUFDLEtBQUssRUFDUixDQUFDLElBQUksRUFBRSxFQUFFO2dCQUNQLElBQUksSUFBSSxZQUFZLEVBQUUsQ0FBQyxlQUFlLEVBQUUsQ0FBQztvQkFDdkMsSUFBSSxFQUFFLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7d0JBQ3RDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDOUIsQ0FBQzt5QkFBTSxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsQ0FBQzt3QkFDL0MsT0FBTyxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUM3QixDQUFDO29CQUVELCtEQUErRDtnQkFDakUsQ0FBQztnQkFDRCxPQUFPLElBQUksQ0FBQztZQUNkLENBQUMsRUFDRCxFQUFFLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUMzQixDQUFDO1FBQ0osQ0FBQztJQUNILENBQUM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBvIGZyb20gJy4uLy4uLy4uLy4uL291dHB1dC9vdXRwdXRfYXN0JztcbmltcG9ydCAqIGFzIGlyIGZyb20gJy4uLy4uL2lyJztcblxuaW1wb3J0IHR5cGUge0NvbXBpbGF0aW9uSm9ifSBmcm9tICcuLi9jb21waWxhdGlvbic7XG5cbi8qKlxuICogSW5zaWRlIHRoZSBgdHJhY2tgIGV4cHJlc3Npb24gb24gYSBgZm9yYCByZXBlYXRlciwgdGhlIGAkaW5kZXhgIGFuZCBgJGl0ZW1gIHZhcmlhYmxlcyBhcmVcbiAqIGFtYmllbnRseSBhdmFpbGFibGUuIEluIHRoaXMgcGhhc2UsIHdlIGZpbmQgdGhvc2UgdmFyaWFibGUgdXNhZ2VzLCBhbmQgcmVwbGFjZSB0aGVtIHdpdGggdGhlXG4gKiBhcHByb3ByaWF0ZSBvdXRwdXQgcmVhZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlVHJhY2tWYXJpYWJsZXMoam9iOiBDb21waWxhdGlvbkpvYik6IHZvaWQge1xuICBmb3IgKGNvbnN0IHVuaXQgb2Ygam9iLnVuaXRzKSB7XG4gICAgZm9yIChjb25zdCBvcCBvZiB1bml0LmNyZWF0ZSkge1xuICAgICAgaWYgKG9wLmtpbmQgIT09IGlyLk9wS2luZC5SZXBlYXRlckNyZWF0ZSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgb3AudHJhY2sgPSBpci50cmFuc2Zvcm1FeHByZXNzaW9uc0luRXhwcmVzc2lvbihcbiAgICAgICAgb3AudHJhY2ssXG4gICAgICAgIChleHByKSA9PiB7XG4gICAgICAgICAgaWYgKGV4cHIgaW5zdGFuY2VvZiBpci5MZXhpY2FsUmVhZEV4cHIpIHtcbiAgICAgICAgICAgIGlmIChvcC52YXJOYW1lcy4kaW5kZXguaGFzKGV4cHIubmFtZSkpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIG8udmFyaWFibGUoJyRpbmRleCcpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChleHByLm5hbWUgPT09IG9wLnZhck5hbWVzLiRpbXBsaWNpdCkge1xuICAgICAgICAgICAgICByZXR1cm4gby52YXJpYWJsZSgnJGl0ZW0nKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gVE9ETzogaGFuZGxlIHByb2hpYml0ZWQgY29udGV4dCB2YXJpYWJsZXMgKGVtaXQgYXMgZ2xvYmFscz8pXG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBleHByO1xuICAgICAgICB9LFxuICAgICAgICBpci5WaXNpdG9yQ29udGV4dEZsYWcuTm9uZSxcbiAgICAgICk7XG4gICAgfVxuICB9XG59XG4iXX0=