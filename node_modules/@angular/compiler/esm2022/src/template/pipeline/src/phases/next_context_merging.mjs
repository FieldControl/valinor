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
        if (op.kind !== ir.OpKind.Statement ||
            !(op.statement instanceof o.ExpressionStatement) ||
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
                    case ir.ExpressionKind.ContextLetReference:
                        // Can't merge past a dependency on the context.
                        tryToMerge = false;
                        break;
                }
                return;
            });
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmV4dF9jb250ZXh0X21lcmdpbmcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvdGVtcGxhdGUvcGlwZWxpbmUvc3JjL3BoYXNlcy9uZXh0X2NvbnRleHRfbWVyZ2luZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEtBQUssQ0FBQyxNQUFNLCtCQUErQixDQUFDO0FBQ25ELE9BQU8sS0FBSyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBSS9COzs7Ozs7Ozs7OztHQVdHO0FBQ0gsTUFBTSxVQUFVLDJCQUEyQixDQUFDLEdBQW1CO0lBQzdELEtBQUssTUFBTSxJQUFJLElBQUksR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzdCLEtBQUssTUFBTSxFQUFFLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQzdCLElBQUksRUFBRSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsSUFBSSxFQUFFLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQzNFLHNCQUFzQixDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN4QyxDQUFDO1FBQ0gsQ0FBQztRQUNELHNCQUFzQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN0QyxDQUFDO0FBQ0gsQ0FBQztBQUVELFNBQVMsc0JBQXNCLENBQUMsR0FBMkI7SUFDekQsS0FBSyxNQUFNLEVBQUUsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNyQixpREFBaUQ7UUFDakQsSUFDRSxFQUFFLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUztZQUMvQixDQUFDLENBQUMsRUFBRSxDQUFDLFNBQVMsWUFBWSxDQUFDLENBQUMsbUJBQW1CLENBQUM7WUFDaEQsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxZQUFZLEVBQUUsQ0FBQyxlQUFlLENBQUMsRUFDbEQsQ0FBQztZQUNELFNBQVM7UUFDWCxDQUFDO1FBRUQsTUFBTSxVQUFVLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBRTNDLDBDQUEwQztRQUMxQyxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUM7UUFDdEIsS0FDRSxJQUFJLFNBQVMsR0FBRyxFQUFFLENBQUMsSUFBSyxFQUN4QixTQUFTLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxJQUFJLFVBQVUsRUFDbEQsU0FBUyxHQUFHLFNBQVMsQ0FBQyxJQUFLLEVBQzNCLENBQUM7WUFDRCxFQUFFLENBQUMsb0JBQW9CLENBQUMsU0FBUyxFQUFFLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxFQUFFO2dCQUNqRCxJQUFJLENBQUMsRUFBRSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO29CQUM3QixPQUFPLElBQUksQ0FBQztnQkFDZCxDQUFDO2dCQUVELElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztvQkFDaEIsbURBQW1EO29CQUNuRCxPQUFPO2dCQUNULENBQUM7Z0JBRUQsSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDLGtCQUFrQixDQUFDLGdCQUFnQixFQUFFLENBQUM7b0JBQ25ELHlDQUF5QztvQkFDekMsT0FBTztnQkFDVCxDQUFDO2dCQUVELFFBQVEsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO29CQUNsQixLQUFLLEVBQUUsQ0FBQyxjQUFjLENBQUMsV0FBVzt3QkFDaEMseURBQXlEO3dCQUN6RCxJQUFJLENBQUMsS0FBSyxJQUFJLFVBQVUsQ0FBQzt3QkFDekIsRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBaUIsQ0FBQyxDQUFDO3dCQUNwQyxVQUFVLEdBQUcsS0FBSyxDQUFDO3dCQUNuQixNQUFNO29CQUNSLEtBQUssRUFBRSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUM7b0JBQ3RDLEtBQUssRUFBRSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUM7b0JBQ2pDLEtBQUssRUFBRSxDQUFDLGNBQWMsQ0FBQyxtQkFBbUI7d0JBQ3hDLGdEQUFnRDt3QkFDaEQsVUFBVSxHQUFHLEtBQUssQ0FBQzt3QkFDbkIsTUFBTTtnQkFDVixDQUFDO2dCQUNELE9BQU87WUFDVCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7SUFDSCxDQUFDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgbyBmcm9tICcuLi8uLi8uLi8uLi9vdXRwdXQvb3V0cHV0X2FzdCc7XG5pbXBvcnQgKiBhcyBpciBmcm9tICcuLi8uLi9pcic7XG5cbmltcG9ydCB0eXBlIHtDb21waWxhdGlvbkpvYn0gZnJvbSAnLi4vY29tcGlsYXRpb24nO1xuXG4vKipcbiAqIE1lcmdlcyBsb2dpY2FsbHkgc2VxdWVudGlhbCBgTmV4dENvbnRleHRFeHByYCBvcGVyYXRpb25zLlxuICpcbiAqIGBOZXh0Q29udGV4dEV4cHJgIGNhbiBiZSByZWZlcmVuY2VkIHJlcGVhdGVkbHksIFwicG9wcGluZ1wiIHRoZSBydW50aW1lJ3MgY29udGV4dCBzdGFjayBlYWNoIHRpbWUuXG4gKiBXaGVuIHR3byBzdWNoIGV4cHJlc3Npb25zIGFwcGVhciBiYWNrLXRvLWJhY2ssIGl0J3MgcG9zc2libGUgdG8gbWVyZ2UgdGhlbSB0b2dldGhlciBpbnRvIGEgc2luZ2xlXG4gKiBgTmV4dENvbnRleHRFeHByYCB0aGF0IHN0ZXBzIG11bHRpcGxlIGNvbnRleHRzLiBUaGlzIG1lcmdpbmcgaXMgcG9zc2libGUgaWYgYWxsIGNvbmRpdGlvbnMgYXJlXG4gKiBtZXQ6XG4gKlxuICogICAqIFRoZSByZXN1bHQgb2YgdGhlIGBOZXh0Q29udGV4dEV4cHJgIHRoYXQncyBmb2xkZWQgaW50byB0aGUgc3Vic2VxdWVudCBvbmUgaXMgbm90IHN0b3JlZCAodGhhdFxuICogICAgIGlzLCB0aGUgY2FsbCBpcyBwdXJlbHkgc2lkZS1lZmZlY3RmdWwpLlxuICogICAqIE5vIG9wZXJhdGlvbnMgaW4gYmV0d2VlbiB0aGVtIHVzZXMgdGhlIGltcGxpY2l0IGNvbnRleHQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtZXJnZU5leHRDb250ZXh0RXhwcmVzc2lvbnMoam9iOiBDb21waWxhdGlvbkpvYik6IHZvaWQge1xuICBmb3IgKGNvbnN0IHVuaXQgb2Ygam9iLnVuaXRzKSB7XG4gICAgZm9yIChjb25zdCBvcCBvZiB1bml0LmNyZWF0ZSkge1xuICAgICAgaWYgKG9wLmtpbmQgPT09IGlyLk9wS2luZC5MaXN0ZW5lciB8fCBvcC5raW5kID09PSBpci5PcEtpbmQuVHdvV2F5TGlzdGVuZXIpIHtcbiAgICAgICAgbWVyZ2VOZXh0Q29udGV4dHNJbk9wcyhvcC5oYW5kbGVyT3BzKTtcbiAgICAgIH1cbiAgICB9XG4gICAgbWVyZ2VOZXh0Q29udGV4dHNJbk9wcyh1bml0LnVwZGF0ZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gbWVyZ2VOZXh0Q29udGV4dHNJbk9wcyhvcHM6IGlyLk9wTGlzdDxpci5VcGRhdGVPcD4pOiB2b2lkIHtcbiAgZm9yIChjb25zdCBvcCBvZiBvcHMpIHtcbiAgICAvLyBMb29rIGZvciBhIGNhbmRpZGF0ZSBvcGVyYXRpb24gdG8gbWF5YmUgbWVyZ2UuXG4gICAgaWYgKFxuICAgICAgb3Aua2luZCAhPT0gaXIuT3BLaW5kLlN0YXRlbWVudCB8fFxuICAgICAgIShvcC5zdGF0ZW1lbnQgaW5zdGFuY2VvZiBvLkV4cHJlc3Npb25TdGF0ZW1lbnQpIHx8XG4gICAgICAhKG9wLnN0YXRlbWVudC5leHByIGluc3RhbmNlb2YgaXIuTmV4dENvbnRleHRFeHByKVxuICAgICkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgY29uc3QgbWVyZ2VTdGVwcyA9IG9wLnN0YXRlbWVudC5leHByLnN0ZXBzO1xuXG4gICAgLy8gVHJ5IHRvIG1lcmdlIHRoaXMgYGlyLk5leHRDb250ZXh0RXhwcmAuXG4gICAgbGV0IHRyeVRvTWVyZ2UgPSB0cnVlO1xuICAgIGZvciAoXG4gICAgICBsZXQgY2FuZGlkYXRlID0gb3AubmV4dCE7XG4gICAgICBjYW5kaWRhdGUua2luZCAhPT0gaXIuT3BLaW5kLkxpc3RFbmQgJiYgdHJ5VG9NZXJnZTtcbiAgICAgIGNhbmRpZGF0ZSA9IGNhbmRpZGF0ZS5uZXh0IVxuICAgICkge1xuICAgICAgaXIudmlzaXRFeHByZXNzaW9uc0luT3AoY2FuZGlkYXRlLCAoZXhwciwgZmxhZ3MpID0+IHtcbiAgICAgICAgaWYgKCFpci5pc0lyRXhwcmVzc2lvbihleHByKSkge1xuICAgICAgICAgIHJldHVybiBleHByO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0cnlUb01lcmdlKSB7XG4gICAgICAgICAgLy8gRWl0aGVyIHdlJ3ZlIGFscmVhZHkgbWVyZ2VkLCBvciBmYWlsZWQgdG8gbWVyZ2UuXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGZsYWdzICYgaXIuVmlzaXRvckNvbnRleHRGbGFnLkluQ2hpbGRPcGVyYXRpb24pIHtcbiAgICAgICAgICAvLyBXZSBjYW5ub3QgbWVyZ2UgaW50byBjaGlsZCBvcGVyYXRpb25zLlxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHN3aXRjaCAoZXhwci5raW5kKSB7XG4gICAgICAgICAgY2FzZSBpci5FeHByZXNzaW9uS2luZC5OZXh0Q29udGV4dDpcbiAgICAgICAgICAgIC8vIE1lcmdlIHRoZSBwcmV2aW91cyBgaXIuTmV4dENvbnRleHRFeHByYCBpbnRvIHRoaXMgb25lLlxuICAgICAgICAgICAgZXhwci5zdGVwcyArPSBtZXJnZVN0ZXBzO1xuICAgICAgICAgICAgaXIuT3BMaXN0LnJlbW92ZShvcCBhcyBpci5VcGRhdGVPcCk7XG4gICAgICAgICAgICB0cnlUb01lcmdlID0gZmFsc2U7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIGlyLkV4cHJlc3Npb25LaW5kLkdldEN1cnJlbnRWaWV3OlxuICAgICAgICAgIGNhc2UgaXIuRXhwcmVzc2lvbktpbmQuUmVmZXJlbmNlOlxuICAgICAgICAgIGNhc2UgaXIuRXhwcmVzc2lvbktpbmQuQ29udGV4dExldFJlZmVyZW5jZTpcbiAgICAgICAgICAgIC8vIENhbid0IG1lcmdlIHBhc3QgYSBkZXBlbmRlbmN5IG9uIHRoZSBjb250ZXh0LlxuICAgICAgICAgICAgdHJ5VG9NZXJnZSA9IGZhbHNlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG59XG4iXX0=