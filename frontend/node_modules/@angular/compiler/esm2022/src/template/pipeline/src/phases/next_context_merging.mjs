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
 * Merges logically sequential `NextContextExpr` operations.
 *
 * `NextContextExpr` can be referenced repeatedly, "popping" the runtime's context stack each time.
 * When two such expressions appear back-to-back, it's possible to merge them together into a single
 * `NextContextExpr` that steps multiple contexts. This merging is possible if all conditions are
 * met:
 *
 *   * The result of the `NextContextExpr` that's folded into the subsequent one is not stored (that
 *     is, the call is purely side-effectful).
 *   * No operations in between them uses the implicit context.
 */
export function mergeNextContextExpressions(job) {
    for (const unit of job.units) {
        for (const op of unit.create) {
            if (op.kind === ir.OpKind.Listener || op.kind === ir.OpKind.TwoWayListener) {
                mergeNextContextsInOps(op.handlerOps);
            }
        }
        mergeNextContextsInOps(unit.update);
    }
}
function mergeNextContextsInOps(ops) {
    for (const op of ops) {
        // Look for a candidate operation to maybe merge.
        if (op.kind !== ir.OpKind.Statement || !(op.statement instanceof o.ExpressionStatement) ||
            !(op.statement.expr instanceof ir.NextContextExpr)) {
            continue;
        }
        const mergeSteps = op.statement.expr.steps;
        // Try to merge this `ir.NextContextExpr`.
        let tryToMerge = true;
        for (let candidate = op.next; candidate.kind !== ir.OpKind.ListEnd && tryToMerge; candidate = candidate.next) {
            ir.visitExpressionsInOp(candidate, (expr, flags) => {
                if (!ir.isIrExpression(expr)) {
                    return expr;
                }
                if (!tryToMerge) {
                    // Either we've already merged, or failed to merge.
                    return;
                }
                if (flags & ir.VisitorContextFlag.InChildOperation) {
                    // We cannot merge into child operations.
                    return;
                }
                switch (expr.kind) {
                    case ir.ExpressionKind.NextContext:
                        // Merge the previous `ir.NextContextExpr` into this one.
                        expr.steps += mergeSteps;
                        ir.OpList.remove(op);
                        tryToMerge = false;
                        break;
                    case ir.ExpressionKind.GetCurrentView:
                    case ir.ExpressionKind.Reference:
                        // Can't merge past a dependency on the context.
                        tryToMerge = false;
                        break;
                }
                return;
            });
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmV4dF9jb250ZXh0X21lcmdpbmcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvdGVtcGxhdGUvcGlwZWxpbmUvc3JjL3BoYXNlcy9uZXh0X2NvbnRleHRfbWVyZ2luZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEtBQUssQ0FBQyxNQUFNLCtCQUErQixDQUFDO0FBQ25ELE9BQU8sS0FBSyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBSS9COzs7Ozs7Ozs7OztHQVdHO0FBQ0gsTUFBTSxVQUFVLDJCQUEyQixDQUFDLEdBQW1CO0lBQzdELEtBQUssTUFBTSxJQUFJLElBQUksR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzdCLEtBQUssTUFBTSxFQUFFLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQzdCLElBQUksRUFBRSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsSUFBSSxFQUFFLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQzNFLHNCQUFzQixDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN4QyxDQUFDO1FBQ0gsQ0FBQztRQUNELHNCQUFzQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN0QyxDQUFDO0FBQ0gsQ0FBQztBQUVELFNBQVMsc0JBQXNCLENBQUMsR0FBMkI7SUFDekQsS0FBSyxNQUFNLEVBQUUsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNyQixpREFBaUQ7UUFDakQsSUFBSSxFQUFFLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsU0FBUyxZQUFZLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQztZQUNuRixDQUFDLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLFlBQVksRUFBRSxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUM7WUFDdkQsU0FBUztRQUNYLENBQUM7UUFFRCxNQUFNLFVBQVUsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7UUFFM0MsMENBQTBDO1FBQzFDLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQztRQUN0QixLQUFLLElBQUksU0FBUyxHQUFHLEVBQUUsQ0FBQyxJQUFLLEVBQUUsU0FBUyxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sSUFBSSxVQUFVLEVBQzVFLFNBQVMsR0FBRyxTQUFTLENBQUMsSUFBSyxFQUFFLENBQUM7WUFDakMsRUFBRSxDQUFDLG9CQUFvQixDQUFDLFNBQVMsRUFBRSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRTtnQkFDakQsSUFBSSxDQUFDLEVBQUUsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztvQkFDN0IsT0FBTyxJQUFJLENBQUM7Z0JBQ2QsQ0FBQztnQkFFRCxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7b0JBQ2hCLG1EQUFtRDtvQkFDbkQsT0FBTztnQkFDVCxDQUFDO2dCQUVELElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO29CQUNuRCx5Q0FBeUM7b0JBQ3pDLE9BQU87Z0JBQ1QsQ0FBQztnQkFFRCxRQUFRLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFDbEIsS0FBSyxFQUFFLENBQUMsY0FBYyxDQUFDLFdBQVc7d0JBQ2hDLHlEQUF5RDt3QkFDekQsSUFBSSxDQUFDLEtBQUssSUFBSSxVQUFVLENBQUM7d0JBQ3pCLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQWlCLENBQUMsQ0FBQzt3QkFDcEMsVUFBVSxHQUFHLEtBQUssQ0FBQzt3QkFDbkIsTUFBTTtvQkFDUixLQUFLLEVBQUUsQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDO29CQUN0QyxLQUFLLEVBQUUsQ0FBQyxjQUFjLENBQUMsU0FBUzt3QkFDOUIsZ0RBQWdEO3dCQUNoRCxVQUFVLEdBQUcsS0FBSyxDQUFDO3dCQUNuQixNQUFNO2dCQUNWLENBQUM7Z0JBQ0QsT0FBTztZQUNULENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztJQUNILENBQUM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIG8gZnJvbSAnLi4vLi4vLi4vLi4vb3V0cHV0L291dHB1dF9hc3QnO1xuaW1wb3J0ICogYXMgaXIgZnJvbSAnLi4vLi4vaXInO1xuXG5pbXBvcnQgdHlwZSB7Q29tcGlsYXRpb25Kb2J9IGZyb20gJy4uL2NvbXBpbGF0aW9uJztcblxuLyoqXG4gKiBNZXJnZXMgbG9naWNhbGx5IHNlcXVlbnRpYWwgYE5leHRDb250ZXh0RXhwcmAgb3BlcmF0aW9ucy5cbiAqXG4gKiBgTmV4dENvbnRleHRFeHByYCBjYW4gYmUgcmVmZXJlbmNlZCByZXBlYXRlZGx5LCBcInBvcHBpbmdcIiB0aGUgcnVudGltZSdzIGNvbnRleHQgc3RhY2sgZWFjaCB0aW1lLlxuICogV2hlbiB0d28gc3VjaCBleHByZXNzaW9ucyBhcHBlYXIgYmFjay10by1iYWNrLCBpdCdzIHBvc3NpYmxlIHRvIG1lcmdlIHRoZW0gdG9nZXRoZXIgaW50byBhIHNpbmdsZVxuICogYE5leHRDb250ZXh0RXhwcmAgdGhhdCBzdGVwcyBtdWx0aXBsZSBjb250ZXh0cy4gVGhpcyBtZXJnaW5nIGlzIHBvc3NpYmxlIGlmIGFsbCBjb25kaXRpb25zIGFyZVxuICogbWV0OlxuICpcbiAqICAgKiBUaGUgcmVzdWx0IG9mIHRoZSBgTmV4dENvbnRleHRFeHByYCB0aGF0J3MgZm9sZGVkIGludG8gdGhlIHN1YnNlcXVlbnQgb25lIGlzIG5vdCBzdG9yZWQgKHRoYXRcbiAqICAgICBpcywgdGhlIGNhbGwgaXMgcHVyZWx5IHNpZGUtZWZmZWN0ZnVsKS5cbiAqICAgKiBObyBvcGVyYXRpb25zIGluIGJldHdlZW4gdGhlbSB1c2VzIHRoZSBpbXBsaWNpdCBjb250ZXh0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gbWVyZ2VOZXh0Q29udGV4dEV4cHJlc3Npb25zKGpvYjogQ29tcGlsYXRpb25Kb2IpOiB2b2lkIHtcbiAgZm9yIChjb25zdCB1bml0IG9mIGpvYi51bml0cykge1xuICAgIGZvciAoY29uc3Qgb3Agb2YgdW5pdC5jcmVhdGUpIHtcbiAgICAgIGlmIChvcC5raW5kID09PSBpci5PcEtpbmQuTGlzdGVuZXIgfHwgb3Aua2luZCA9PT0gaXIuT3BLaW5kLlR3b1dheUxpc3RlbmVyKSB7XG4gICAgICAgIG1lcmdlTmV4dENvbnRleHRzSW5PcHMob3AuaGFuZGxlck9wcyk7XG4gICAgICB9XG4gICAgfVxuICAgIG1lcmdlTmV4dENvbnRleHRzSW5PcHModW5pdC51cGRhdGUpO1xuICB9XG59XG5cbmZ1bmN0aW9uIG1lcmdlTmV4dENvbnRleHRzSW5PcHMob3BzOiBpci5PcExpc3Q8aXIuVXBkYXRlT3A+KTogdm9pZCB7XG4gIGZvciAoY29uc3Qgb3Agb2Ygb3BzKSB7XG4gICAgLy8gTG9vayBmb3IgYSBjYW5kaWRhdGUgb3BlcmF0aW9uIHRvIG1heWJlIG1lcmdlLlxuICAgIGlmIChvcC5raW5kICE9PSBpci5PcEtpbmQuU3RhdGVtZW50IHx8ICEob3Auc3RhdGVtZW50IGluc3RhbmNlb2Ygby5FeHByZXNzaW9uU3RhdGVtZW50KSB8fFxuICAgICAgICAhKG9wLnN0YXRlbWVudC5leHByIGluc3RhbmNlb2YgaXIuTmV4dENvbnRleHRFeHByKSkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgY29uc3QgbWVyZ2VTdGVwcyA9IG9wLnN0YXRlbWVudC5leHByLnN0ZXBzO1xuXG4gICAgLy8gVHJ5IHRvIG1lcmdlIHRoaXMgYGlyLk5leHRDb250ZXh0RXhwcmAuXG4gICAgbGV0IHRyeVRvTWVyZ2UgPSB0cnVlO1xuICAgIGZvciAobGV0IGNhbmRpZGF0ZSA9IG9wLm5leHQhOyBjYW5kaWRhdGUua2luZCAhPT0gaXIuT3BLaW5kLkxpc3RFbmQgJiYgdHJ5VG9NZXJnZTtcbiAgICAgICAgIGNhbmRpZGF0ZSA9IGNhbmRpZGF0ZS5uZXh0ISkge1xuICAgICAgaXIudmlzaXRFeHByZXNzaW9uc0luT3AoY2FuZGlkYXRlLCAoZXhwciwgZmxhZ3MpID0+IHtcbiAgICAgICAgaWYgKCFpci5pc0lyRXhwcmVzc2lvbihleHByKSkge1xuICAgICAgICAgIHJldHVybiBleHByO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0cnlUb01lcmdlKSB7XG4gICAgICAgICAgLy8gRWl0aGVyIHdlJ3ZlIGFscmVhZHkgbWVyZ2VkLCBvciBmYWlsZWQgdG8gbWVyZ2UuXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGZsYWdzICYgaXIuVmlzaXRvckNvbnRleHRGbGFnLkluQ2hpbGRPcGVyYXRpb24pIHtcbiAgICAgICAgICAvLyBXZSBjYW5ub3QgbWVyZ2UgaW50byBjaGlsZCBvcGVyYXRpb25zLlxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHN3aXRjaCAoZXhwci5raW5kKSB7XG4gICAgICAgICAgY2FzZSBpci5FeHByZXNzaW9uS2luZC5OZXh0Q29udGV4dDpcbiAgICAgICAgICAgIC8vIE1lcmdlIHRoZSBwcmV2aW91cyBgaXIuTmV4dENvbnRleHRFeHByYCBpbnRvIHRoaXMgb25lLlxuICAgICAgICAgICAgZXhwci5zdGVwcyArPSBtZXJnZVN0ZXBzO1xuICAgICAgICAgICAgaXIuT3BMaXN0LnJlbW92ZShvcCBhcyBpci5VcGRhdGVPcCk7XG4gICAgICAgICAgICB0cnlUb01lcmdlID0gZmFsc2U7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIGlyLkV4cHJlc3Npb25LaW5kLkdldEN1cnJlbnRWaWV3OlxuICAgICAgICAgIGNhc2UgaXIuRXhwcmVzc2lvbktpbmQuUmVmZXJlbmNlOlxuICAgICAgICAgICAgLy8gQ2FuJ3QgbWVyZ2UgcGFzdCBhIGRlcGVuZGVuY3kgb24gdGhlIGNvbnRleHQuXG4gICAgICAgICAgICB0cnlUb01lcmdlID0gZmFsc2U7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==