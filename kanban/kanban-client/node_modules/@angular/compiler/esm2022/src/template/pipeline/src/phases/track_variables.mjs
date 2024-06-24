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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhY2tfdmFyaWFibGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3RlbXBsYXRlL3BpcGVsaW5lL3NyYy9waGFzZXMvdHJhY2tfdmFyaWFibGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sS0FBSyxDQUFDLE1BQU0sK0JBQStCLENBQUM7QUFDbkQsT0FBTyxLQUFLLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFJL0I7Ozs7R0FJRztBQUNILE1BQU0sVUFBVSxzQkFBc0IsQ0FBQyxHQUFtQjtJQUN4RCxLQUFLLE1BQU0sSUFBSSxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM3QixLQUFLLE1BQU0sRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUM3QixJQUFJLEVBQUUsQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDekMsU0FBUztZQUNYLENBQUM7WUFFRCxFQUFFLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxnQ0FBZ0MsQ0FDNUMsRUFBRSxDQUFDLEtBQUssRUFDUixDQUFDLElBQUksRUFBRSxFQUFFO2dCQUNQLElBQUksSUFBSSxZQUFZLEVBQUUsQ0FBQyxlQUFlLEVBQUUsQ0FBQztvQkFDdkMsSUFBSSxFQUFFLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7d0JBQ3RDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDOUIsQ0FBQzt5QkFBTSxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsQ0FBQzt3QkFDL0MsT0FBTyxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUM3QixDQUFDO29CQUVELCtEQUErRDtnQkFDakUsQ0FBQztnQkFDRCxPQUFPLElBQUksQ0FBQztZQUNkLENBQUMsRUFDRCxFQUFFLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUMzQixDQUFDO1FBQ0osQ0FBQztJQUNILENBQUM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIG8gZnJvbSAnLi4vLi4vLi4vLi4vb3V0cHV0L291dHB1dF9hc3QnO1xuaW1wb3J0ICogYXMgaXIgZnJvbSAnLi4vLi4vaXInO1xuXG5pbXBvcnQgdHlwZSB7Q29tcGlsYXRpb25Kb2J9IGZyb20gJy4uL2NvbXBpbGF0aW9uJztcblxuLyoqXG4gKiBJbnNpZGUgdGhlIGB0cmFja2AgZXhwcmVzc2lvbiBvbiBhIGBmb3JgIHJlcGVhdGVyLCB0aGUgYCRpbmRleGAgYW5kIGAkaXRlbWAgdmFyaWFibGVzIGFyZVxuICogYW1iaWVudGx5IGF2YWlsYWJsZS4gSW4gdGhpcyBwaGFzZSwgd2UgZmluZCB0aG9zZSB2YXJpYWJsZSB1c2FnZXMsIGFuZCByZXBsYWNlIHRoZW0gd2l0aCB0aGVcbiAqIGFwcHJvcHJpYXRlIG91dHB1dCByZWFkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVUcmFja1ZhcmlhYmxlcyhqb2I6IENvbXBpbGF0aW9uSm9iKTogdm9pZCB7XG4gIGZvciAoY29uc3QgdW5pdCBvZiBqb2IudW5pdHMpIHtcbiAgICBmb3IgKGNvbnN0IG9wIG9mIHVuaXQuY3JlYXRlKSB7XG4gICAgICBpZiAob3Aua2luZCAhPT0gaXIuT3BLaW5kLlJlcGVhdGVyQ3JlYXRlKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBvcC50cmFjayA9IGlyLnRyYW5zZm9ybUV4cHJlc3Npb25zSW5FeHByZXNzaW9uKFxuICAgICAgICBvcC50cmFjayxcbiAgICAgICAgKGV4cHIpID0+IHtcbiAgICAgICAgICBpZiAoZXhwciBpbnN0YW5jZW9mIGlyLkxleGljYWxSZWFkRXhwcikge1xuICAgICAgICAgICAgaWYgKG9wLnZhck5hbWVzLiRpbmRleC5oYXMoZXhwci5uYW1lKSkge1xuICAgICAgICAgICAgICByZXR1cm4gby52YXJpYWJsZSgnJGluZGV4Jyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGV4cHIubmFtZSA9PT0gb3AudmFyTmFtZXMuJGltcGxpY2l0KSB7XG4gICAgICAgICAgICAgIHJldHVybiBvLnZhcmlhYmxlKCckaXRlbScpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBUT0RPOiBoYW5kbGUgcHJvaGliaXRlZCBjb250ZXh0IHZhcmlhYmxlcyAoZW1pdCBhcyBnbG9iYWxzPylcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGV4cHI7XG4gICAgICAgIH0sXG4gICAgICAgIGlyLlZpc2l0b3JDb250ZXh0RmxhZy5Ob25lLFxuICAgICAgKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==