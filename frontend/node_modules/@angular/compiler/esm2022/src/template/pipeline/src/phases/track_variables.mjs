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
            op.track = ir.transformExpressionsInExpression(op.track, expr => {
                if (expr instanceof ir.LexicalReadExpr) {
                    if (expr.name === op.varNames.$index) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhY2tfdmFyaWFibGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3RlbXBsYXRlL3BpcGVsaW5lL3NyYy9waGFzZXMvdHJhY2tfdmFyaWFibGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sS0FBSyxDQUFDLE1BQU0sK0JBQStCLENBQUM7QUFDbkQsT0FBTyxLQUFLLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFJL0I7Ozs7R0FJRztBQUNILE1BQU0sVUFBVSxzQkFBc0IsQ0FBQyxHQUFtQjtJQUN4RCxLQUFLLE1BQU0sSUFBSSxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM3QixLQUFLLE1BQU0sRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUM3QixJQUFJLEVBQUUsQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDekMsU0FBUztZQUNYLENBQUM7WUFFRCxFQUFFLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxnQ0FBZ0MsQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFO2dCQUM5RCxJQUFJLElBQUksWUFBWSxFQUFFLENBQUMsZUFBZSxFQUFFLENBQUM7b0JBQ3ZDLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDO3dCQUNyQyxPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQzlCLENBQUM7eUJBQU0sSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLENBQUM7d0JBQy9DLE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDN0IsQ0FBQztvQkFFRCwrREFBK0Q7Z0JBQ2pFLENBQUM7Z0JBQ0QsT0FBTyxJQUFJLENBQUM7WUFDZCxDQUFDLEVBQUUsRUFBRSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pDLENBQUM7SUFDSCxDQUFDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBvIGZyb20gJy4uLy4uLy4uLy4uL291dHB1dC9vdXRwdXRfYXN0JztcbmltcG9ydCAqIGFzIGlyIGZyb20gJy4uLy4uL2lyJztcblxuaW1wb3J0IHR5cGUge0NvbXBpbGF0aW9uSm9ifSBmcm9tICcuLi9jb21waWxhdGlvbic7XG5cbi8qKlxuICogSW5zaWRlIHRoZSBgdHJhY2tgIGV4cHJlc3Npb24gb24gYSBgZm9yYCByZXBlYXRlciwgdGhlIGAkaW5kZXhgIGFuZCBgJGl0ZW1gIHZhcmlhYmxlcyBhcmVcbiAqIGFtYmllbnRseSBhdmFpbGFibGUuIEluIHRoaXMgcGhhc2UsIHdlIGZpbmQgdGhvc2UgdmFyaWFibGUgdXNhZ2VzLCBhbmQgcmVwbGFjZSB0aGVtIHdpdGggdGhlXG4gKiBhcHByb3ByaWF0ZSBvdXRwdXQgcmVhZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlVHJhY2tWYXJpYWJsZXMoam9iOiBDb21waWxhdGlvbkpvYik6IHZvaWQge1xuICBmb3IgKGNvbnN0IHVuaXQgb2Ygam9iLnVuaXRzKSB7XG4gICAgZm9yIChjb25zdCBvcCBvZiB1bml0LmNyZWF0ZSkge1xuICAgICAgaWYgKG9wLmtpbmQgIT09IGlyLk9wS2luZC5SZXBlYXRlckNyZWF0ZSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgb3AudHJhY2sgPSBpci50cmFuc2Zvcm1FeHByZXNzaW9uc0luRXhwcmVzc2lvbihvcC50cmFjaywgZXhwciA9PiB7XG4gICAgICAgIGlmIChleHByIGluc3RhbmNlb2YgaXIuTGV4aWNhbFJlYWRFeHByKSB7XG4gICAgICAgICAgaWYgKGV4cHIubmFtZSA9PT0gb3AudmFyTmFtZXMuJGluZGV4KSB7XG4gICAgICAgICAgICByZXR1cm4gby52YXJpYWJsZSgnJGluZGV4Jyk7XG4gICAgICAgICAgfSBlbHNlIGlmIChleHByLm5hbWUgPT09IG9wLnZhck5hbWVzLiRpbXBsaWNpdCkge1xuICAgICAgICAgICAgcmV0dXJuIG8udmFyaWFibGUoJyRpdGVtJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gVE9ETzogaGFuZGxlIHByb2hpYml0ZWQgY29udGV4dCB2YXJpYWJsZXMgKGVtaXQgYXMgZ2xvYmFscz8pXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGV4cHI7XG4gICAgICB9LCBpci5WaXNpdG9yQ29udGV4dEZsYWcuTm9uZSk7XG4gICAgfVxuICB9XG59XG4iXX0=