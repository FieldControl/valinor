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
 * When inside of a listener, we may need access to one or more enclosing views. Therefore, each
 * view should save the current view, and each listener must have the ability to restore the
 * appropriate view. We eagerly generate all save view variables; they will be optimized away later.
 */
export function saveAndRestoreView(job) {
    for (const unit of job.units) {
        unit.create.prepend([
            ir.createVariableOp(unit.job.allocateXrefId(), {
                kind: ir.SemanticVariableKind.SavedView,
                name: null,
                view: unit.xref,
            }, new ir.GetCurrentViewExpr(), ir.VariableFlags.None),
        ]);
        for (const op of unit.create) {
            if (op.kind !== ir.OpKind.Listener && op.kind !== ir.OpKind.TwoWayListener) {
                continue;
            }
            // Embedded views always need the save/restore view operation.
            let needsRestoreView = unit !== job.root;
            if (!needsRestoreView) {
                for (const handlerOp of op.handlerOps) {
                    ir.visitExpressionsInOp(handlerOp, (expr) => {
                        if (expr instanceof ir.ReferenceExpr || expr instanceof ir.ContextLetReferenceExpr) {
                            // Listeners that reference() a local ref need the save/restore view operation.
                            needsRestoreView = true;
                        }
                    });
                }
            }
            if (needsRestoreView) {
                addSaveRestoreViewOperationToListener(unit, op);
            }
        }
    }
}
function addSaveRestoreViewOperationToListener(unit, op) {
    op.handlerOps.prepend([
        ir.createVariableOp(unit.job.allocateXrefId(), {
            kind: ir.SemanticVariableKind.Context,
            name: null,
            view: unit.xref,
        }, new ir.RestoreViewExpr(unit.xref), ir.VariableFlags.None),
    ]);
    // The "restore view" operation in listeners requires a call to `resetView` to reset the
    // context prior to returning from the listener operation. Find any `return` statements in
    // the listener body and wrap them in a call to reset the view.
    for (const handlerOp of op.handlerOps) {
        if (handlerOp.kind === ir.OpKind.Statement &&
            handlerOp.statement instanceof o.ReturnStatement) {
            handlerOp.statement.value = new ir.ResetViewExpr(handlerOp.statement.value);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2F2ZV9yZXN0b3JlX3ZpZXcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvdGVtcGxhdGUvcGlwZWxpbmUvc3JjL3BoYXNlcy9zYXZlX3Jlc3RvcmVfdmlldy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEtBQUssQ0FBQyxNQUFNLCtCQUErQixDQUFDO0FBQ25ELE9BQU8sS0FBSyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRy9COzs7O0dBSUc7QUFDSCxNQUFNLFVBQVUsa0JBQWtCLENBQUMsR0FBNEI7SUFDN0QsS0FBSyxNQUFNLElBQUksSUFBSSxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDN0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUM7WUFDbEIsRUFBRSxDQUFDLGdCQUFnQixDQUNqQixJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxFQUN6QjtnQkFDRSxJQUFJLEVBQUUsRUFBRSxDQUFDLG9CQUFvQixDQUFDLFNBQVM7Z0JBQ3ZDLElBQUksRUFBRSxJQUFJO2dCQUNWLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTthQUNoQixFQUNELElBQUksRUFBRSxDQUFDLGtCQUFrQixFQUFFLEVBQzNCLEVBQUUsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUN0QjtTQUNGLENBQUMsQ0FBQztRQUVILEtBQUssTUFBTSxFQUFFLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQzdCLElBQUksRUFBRSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsSUFBSSxFQUFFLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQzNFLFNBQVM7WUFDWCxDQUFDO1lBRUQsOERBQThEO1lBQzlELElBQUksZ0JBQWdCLEdBQUcsSUFBSSxLQUFLLEdBQUcsQ0FBQyxJQUFJLENBQUM7WUFFekMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7Z0JBQ3RCLEtBQUssTUFBTSxTQUFTLElBQUksRUFBRSxDQUFDLFVBQVUsRUFBRSxDQUFDO29CQUN0QyxFQUFFLENBQUMsb0JBQW9CLENBQUMsU0FBUyxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUU7d0JBQzFDLElBQUksSUFBSSxZQUFZLEVBQUUsQ0FBQyxhQUFhLElBQUksSUFBSSxZQUFZLEVBQUUsQ0FBQyx1QkFBdUIsRUFBRSxDQUFDOzRCQUNuRiwrRUFBK0U7NEJBQy9FLGdCQUFnQixHQUFHLElBQUksQ0FBQzt3QkFDMUIsQ0FBQztvQkFDSCxDQUFDLENBQUMsQ0FBQztnQkFDTCxDQUFDO1lBQ0gsQ0FBQztZQUVELElBQUksZ0JBQWdCLEVBQUUsQ0FBQztnQkFDckIscUNBQXFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ2xELENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztBQUNILENBQUM7QUFFRCxTQUFTLHFDQUFxQyxDQUM1QyxJQUF5QixFQUN6QixFQUF1QztJQUV2QyxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQztRQUNwQixFQUFFLENBQUMsZ0JBQWdCLENBQ2pCLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLEVBQ3pCO1lBQ0UsSUFBSSxFQUFFLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPO1lBQ3JDLElBQUksRUFBRSxJQUFJO1lBQ1YsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO1NBQ2hCLEVBQ0QsSUFBSSxFQUFFLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFDakMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQ3RCO0tBQ0YsQ0FBQyxDQUFDO0lBRUgsd0ZBQXdGO0lBQ3hGLDBGQUEwRjtJQUMxRiwrREFBK0Q7SUFDL0QsS0FBSyxNQUFNLFNBQVMsSUFBSSxFQUFFLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDdEMsSUFDRSxTQUFTLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUztZQUN0QyxTQUFTLENBQUMsU0FBUyxZQUFZLENBQUMsQ0FBQyxlQUFlLEVBQ2hELENBQUM7WUFDRCxTQUFTLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyxJQUFJLEVBQUUsQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM5RSxDQUFDO0lBQ0gsQ0FBQztBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIG8gZnJvbSAnLi4vLi4vLi4vLi4vb3V0cHV0L291dHB1dF9hc3QnO1xuaW1wb3J0ICogYXMgaXIgZnJvbSAnLi4vLi4vaXInO1xuaW1wb3J0IHR5cGUge0NvbXBvbmVudENvbXBpbGF0aW9uSm9iLCBWaWV3Q29tcGlsYXRpb25Vbml0fSBmcm9tICcuLi9jb21waWxhdGlvbic7XG5cbi8qKlxuICogV2hlbiBpbnNpZGUgb2YgYSBsaXN0ZW5lciwgd2UgbWF5IG5lZWQgYWNjZXNzIHRvIG9uZSBvciBtb3JlIGVuY2xvc2luZyB2aWV3cy4gVGhlcmVmb3JlLCBlYWNoXG4gKiB2aWV3IHNob3VsZCBzYXZlIHRoZSBjdXJyZW50IHZpZXcsIGFuZCBlYWNoIGxpc3RlbmVyIG11c3QgaGF2ZSB0aGUgYWJpbGl0eSB0byByZXN0b3JlIHRoZVxuICogYXBwcm9wcmlhdGUgdmlldy4gV2UgZWFnZXJseSBnZW5lcmF0ZSBhbGwgc2F2ZSB2aWV3IHZhcmlhYmxlczsgdGhleSB3aWxsIGJlIG9wdGltaXplZCBhd2F5IGxhdGVyLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2F2ZUFuZFJlc3RvcmVWaWV3KGpvYjogQ29tcG9uZW50Q29tcGlsYXRpb25Kb2IpOiB2b2lkIHtcbiAgZm9yIChjb25zdCB1bml0IG9mIGpvYi51bml0cykge1xuICAgIHVuaXQuY3JlYXRlLnByZXBlbmQoW1xuICAgICAgaXIuY3JlYXRlVmFyaWFibGVPcDxpci5DcmVhdGVPcD4oXG4gICAgICAgIHVuaXQuam9iLmFsbG9jYXRlWHJlZklkKCksXG4gICAgICAgIHtcbiAgICAgICAgICBraW5kOiBpci5TZW1hbnRpY1ZhcmlhYmxlS2luZC5TYXZlZFZpZXcsXG4gICAgICAgICAgbmFtZTogbnVsbCxcbiAgICAgICAgICB2aWV3OiB1bml0LnhyZWYsXG4gICAgICAgIH0sXG4gICAgICAgIG5ldyBpci5HZXRDdXJyZW50Vmlld0V4cHIoKSxcbiAgICAgICAgaXIuVmFyaWFibGVGbGFncy5Ob25lLFxuICAgICAgKSxcbiAgICBdKTtcblxuICAgIGZvciAoY29uc3Qgb3Agb2YgdW5pdC5jcmVhdGUpIHtcbiAgICAgIGlmIChvcC5raW5kICE9PSBpci5PcEtpbmQuTGlzdGVuZXIgJiYgb3Aua2luZCAhPT0gaXIuT3BLaW5kLlR3b1dheUxpc3RlbmVyKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBFbWJlZGRlZCB2aWV3cyBhbHdheXMgbmVlZCB0aGUgc2F2ZS9yZXN0b3JlIHZpZXcgb3BlcmF0aW9uLlxuICAgICAgbGV0IG5lZWRzUmVzdG9yZVZpZXcgPSB1bml0ICE9PSBqb2Iucm9vdDtcblxuICAgICAgaWYgKCFuZWVkc1Jlc3RvcmVWaWV3KSB7XG4gICAgICAgIGZvciAoY29uc3QgaGFuZGxlck9wIG9mIG9wLmhhbmRsZXJPcHMpIHtcbiAgICAgICAgICBpci52aXNpdEV4cHJlc3Npb25zSW5PcChoYW5kbGVyT3AsIChleHByKSA9PiB7XG4gICAgICAgICAgICBpZiAoZXhwciBpbnN0YW5jZW9mIGlyLlJlZmVyZW5jZUV4cHIgfHwgZXhwciBpbnN0YW5jZW9mIGlyLkNvbnRleHRMZXRSZWZlcmVuY2VFeHByKSB7XG4gICAgICAgICAgICAgIC8vIExpc3RlbmVycyB0aGF0IHJlZmVyZW5jZSgpIGEgbG9jYWwgcmVmIG5lZWQgdGhlIHNhdmUvcmVzdG9yZSB2aWV3IG9wZXJhdGlvbi5cbiAgICAgICAgICAgICAgbmVlZHNSZXN0b3JlVmlldyA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKG5lZWRzUmVzdG9yZVZpZXcpIHtcbiAgICAgICAgYWRkU2F2ZVJlc3RvcmVWaWV3T3BlcmF0aW9uVG9MaXN0ZW5lcih1bml0LCBvcCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGFkZFNhdmVSZXN0b3JlVmlld09wZXJhdGlvblRvTGlzdGVuZXIoXG4gIHVuaXQ6IFZpZXdDb21waWxhdGlvblVuaXQsXG4gIG9wOiBpci5MaXN0ZW5lck9wIHwgaXIuVHdvV2F5TGlzdGVuZXJPcCxcbikge1xuICBvcC5oYW5kbGVyT3BzLnByZXBlbmQoW1xuICAgIGlyLmNyZWF0ZVZhcmlhYmxlT3A8aXIuVXBkYXRlT3A+KFxuICAgICAgdW5pdC5qb2IuYWxsb2NhdGVYcmVmSWQoKSxcbiAgICAgIHtcbiAgICAgICAga2luZDogaXIuU2VtYW50aWNWYXJpYWJsZUtpbmQuQ29udGV4dCxcbiAgICAgICAgbmFtZTogbnVsbCxcbiAgICAgICAgdmlldzogdW5pdC54cmVmLFxuICAgICAgfSxcbiAgICAgIG5ldyBpci5SZXN0b3JlVmlld0V4cHIodW5pdC54cmVmKSxcbiAgICAgIGlyLlZhcmlhYmxlRmxhZ3MuTm9uZSxcbiAgICApLFxuICBdKTtcblxuICAvLyBUaGUgXCJyZXN0b3JlIHZpZXdcIiBvcGVyYXRpb24gaW4gbGlzdGVuZXJzIHJlcXVpcmVzIGEgY2FsbCB0byBgcmVzZXRWaWV3YCB0byByZXNldCB0aGVcbiAgLy8gY29udGV4dCBwcmlvciB0byByZXR1cm5pbmcgZnJvbSB0aGUgbGlzdGVuZXIgb3BlcmF0aW9uLiBGaW5kIGFueSBgcmV0dXJuYCBzdGF0ZW1lbnRzIGluXG4gIC8vIHRoZSBsaXN0ZW5lciBib2R5IGFuZCB3cmFwIHRoZW0gaW4gYSBjYWxsIHRvIHJlc2V0IHRoZSB2aWV3LlxuICBmb3IgKGNvbnN0IGhhbmRsZXJPcCBvZiBvcC5oYW5kbGVyT3BzKSB7XG4gICAgaWYgKFxuICAgICAgaGFuZGxlck9wLmtpbmQgPT09IGlyLk9wS2luZC5TdGF0ZW1lbnQgJiZcbiAgICAgIGhhbmRsZXJPcC5zdGF0ZW1lbnQgaW5zdGFuY2VvZiBvLlJldHVyblN0YXRlbWVudFxuICAgICkge1xuICAgICAgaGFuZGxlck9wLnN0YXRlbWVudC52YWx1ZSA9IG5ldyBpci5SZXNldFZpZXdFeHByKGhhbmRsZXJPcC5zdGF0ZW1lbnQudmFsdWUpO1xuICAgIH1cbiAgfVxufVxuIl19