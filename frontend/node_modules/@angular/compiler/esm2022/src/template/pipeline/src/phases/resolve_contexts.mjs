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
 * Resolves `ir.ContextExpr` expressions (which represent embedded view or component contexts) to
 * either the `ctx` parameter to component functions (for the current view context) or to variables
 * that store those contexts (for contexts accessed via the `nextContext()` instruction).
 */
export function resolveContexts(job) {
    for (const unit of job.units) {
        processLexicalScope(unit, unit.create);
        processLexicalScope(unit, unit.update);
    }
}
function processLexicalScope(view, ops) {
    // Track the expressions used to access all available contexts within the current view, by the
    // view `ir.XrefId`.
    const scope = new Map();
    // The current view's context is accessible via the `ctx` parameter.
    scope.set(view.xref, o.variable('ctx'));
    for (const op of ops) {
        switch (op.kind) {
            case ir.OpKind.Variable:
                switch (op.variable.kind) {
                    case ir.SemanticVariableKind.Context:
                        scope.set(op.variable.view, new ir.ReadVariableExpr(op.xref));
                        break;
                }
                break;
            case ir.OpKind.Listener:
            case ir.OpKind.TwoWayListener:
                processLexicalScope(view, op.handlerOps);
                break;
        }
    }
    if (view === view.job.root) {
        // Prefer `ctx` of the root view to any variables which happen to contain the root context.
        scope.set(view.xref, o.variable('ctx'));
    }
    for (const op of ops) {
        ir.transformExpressionsInOp(op, expr => {
            if (expr instanceof ir.ContextExpr) {
                if (!scope.has(expr.view)) {
                    throw new Error(`No context found for reference to view ${expr.view} from view ${view.xref}`);
                }
                return scope.get(expr.view);
            }
            else {
                return expr;
            }
        }, ir.VisitorContextFlag.None);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb2x2ZV9jb250ZXh0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy90ZW1wbGF0ZS9waXBlbGluZS9zcmMvcGhhc2VzL3Jlc29sdmVfY29udGV4dHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxLQUFLLENBQUMsTUFBTSwrQkFBK0IsQ0FBQztBQUNuRCxPQUFPLEtBQUssRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUcvQjs7OztHQUlHO0FBQ0gsTUFBTSxVQUFVLGVBQWUsQ0FBQyxHQUFtQjtJQUNqRCxLQUFLLE1BQU0sSUFBSSxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM3QixtQkFBbUIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3ZDLG1CQUFtQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDekMsQ0FBQztBQUNILENBQUM7QUFFRCxTQUFTLG1CQUFtQixDQUFDLElBQXFCLEVBQUUsR0FBdUM7SUFDekYsOEZBQThGO0lBQzlGLG9CQUFvQjtJQUNwQixNQUFNLEtBQUssR0FBRyxJQUFJLEdBQUcsRUFBMkIsQ0FBQztJQUVqRCxvRUFBb0U7SUFDcEUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUV4QyxLQUFLLE1BQU0sRUFBRSxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ3JCLFFBQVEsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2hCLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRO2dCQUNyQixRQUFRLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7b0JBQ3pCLEtBQUssRUFBRSxDQUFDLG9CQUFvQixDQUFDLE9BQU87d0JBQ2xDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7d0JBQzlELE1BQU07Z0JBQ1YsQ0FBQztnQkFDRCxNQUFNO1lBQ1IsS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQztZQUN4QixLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsY0FBYztnQkFDM0IsbUJBQW1CLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDekMsTUFBTTtRQUNWLENBQUM7SUFDSCxDQUFDO0lBRUQsSUFBSSxJQUFJLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUMzQiwyRkFBMkY7UUFDM0YsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBRUQsS0FBSyxNQUFNLEVBQUUsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNyQixFQUFFLENBQUMsd0JBQXdCLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFO1lBQ3JDLElBQUksSUFBSSxZQUFZLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDbkMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7b0JBQzFCLE1BQU0sSUFBSSxLQUFLLENBQ1gsMENBQTBDLElBQUksQ0FBQyxJQUFJLGNBQWMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7Z0JBQ3BGLENBQUM7Z0JBQ0QsT0FBTyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUUsQ0FBQztZQUMvQixDQUFDO2lCQUFNLENBQUM7Z0JBQ04sT0FBTyxJQUFJLENBQUM7WUFDZCxDQUFDO1FBQ0gsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNqQyxDQUFDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBvIGZyb20gJy4uLy4uLy4uLy4uL291dHB1dC9vdXRwdXRfYXN0JztcbmltcG9ydCAqIGFzIGlyIGZyb20gJy4uLy4uL2lyJztcbmltcG9ydCB7Q29tcGlsYXRpb25Kb2IsIENvbXBpbGF0aW9uVW5pdCwgQ29tcG9uZW50Q29tcGlsYXRpb25Kb2IsIFZpZXdDb21waWxhdGlvblVuaXR9IGZyb20gJy4uL2NvbXBpbGF0aW9uJztcblxuLyoqXG4gKiBSZXNvbHZlcyBgaXIuQ29udGV4dEV4cHJgIGV4cHJlc3Npb25zICh3aGljaCByZXByZXNlbnQgZW1iZWRkZWQgdmlldyBvciBjb21wb25lbnQgY29udGV4dHMpIHRvXG4gKiBlaXRoZXIgdGhlIGBjdHhgIHBhcmFtZXRlciB0byBjb21wb25lbnQgZnVuY3Rpb25zIChmb3IgdGhlIGN1cnJlbnQgdmlldyBjb250ZXh0KSBvciB0byB2YXJpYWJsZXNcbiAqIHRoYXQgc3RvcmUgdGhvc2UgY29udGV4dHMgKGZvciBjb250ZXh0cyBhY2Nlc3NlZCB2aWEgdGhlIGBuZXh0Q29udGV4dCgpYCBpbnN0cnVjdGlvbikuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlQ29udGV4dHMoam9iOiBDb21waWxhdGlvbkpvYik6IHZvaWQge1xuICBmb3IgKGNvbnN0IHVuaXQgb2Ygam9iLnVuaXRzKSB7XG4gICAgcHJvY2Vzc0xleGljYWxTY29wZSh1bml0LCB1bml0LmNyZWF0ZSk7XG4gICAgcHJvY2Vzc0xleGljYWxTY29wZSh1bml0LCB1bml0LnVwZGF0ZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gcHJvY2Vzc0xleGljYWxTY29wZSh2aWV3OiBDb21waWxhdGlvblVuaXQsIG9wczogaXIuT3BMaXN0PGlyLkNyZWF0ZU9wfGlyLlVwZGF0ZU9wPik6IHZvaWQge1xuICAvLyBUcmFjayB0aGUgZXhwcmVzc2lvbnMgdXNlZCB0byBhY2Nlc3MgYWxsIGF2YWlsYWJsZSBjb250ZXh0cyB3aXRoaW4gdGhlIGN1cnJlbnQgdmlldywgYnkgdGhlXG4gIC8vIHZpZXcgYGlyLlhyZWZJZGAuXG4gIGNvbnN0IHNjb3BlID0gbmV3IE1hcDxpci5YcmVmSWQsIG8uRXhwcmVzc2lvbj4oKTtcblxuICAvLyBUaGUgY3VycmVudCB2aWV3J3MgY29udGV4dCBpcyBhY2Nlc3NpYmxlIHZpYSB0aGUgYGN0eGAgcGFyYW1ldGVyLlxuICBzY29wZS5zZXQodmlldy54cmVmLCBvLnZhcmlhYmxlKCdjdHgnKSk7XG5cbiAgZm9yIChjb25zdCBvcCBvZiBvcHMpIHtcbiAgICBzd2l0Y2ggKG9wLmtpbmQpIHtcbiAgICAgIGNhc2UgaXIuT3BLaW5kLlZhcmlhYmxlOlxuICAgICAgICBzd2l0Y2ggKG9wLnZhcmlhYmxlLmtpbmQpIHtcbiAgICAgICAgICBjYXNlIGlyLlNlbWFudGljVmFyaWFibGVLaW5kLkNvbnRleHQ6XG4gICAgICAgICAgICBzY29wZS5zZXQob3AudmFyaWFibGUudmlldywgbmV3IGlyLlJlYWRWYXJpYWJsZUV4cHIob3AueHJlZikpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIGlyLk9wS2luZC5MaXN0ZW5lcjpcbiAgICAgIGNhc2UgaXIuT3BLaW5kLlR3b1dheUxpc3RlbmVyOlxuICAgICAgICBwcm9jZXNzTGV4aWNhbFNjb3BlKHZpZXcsIG9wLmhhbmRsZXJPcHMpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBpZiAodmlldyA9PT0gdmlldy5qb2Iucm9vdCkge1xuICAgIC8vIFByZWZlciBgY3R4YCBvZiB0aGUgcm9vdCB2aWV3IHRvIGFueSB2YXJpYWJsZXMgd2hpY2ggaGFwcGVuIHRvIGNvbnRhaW4gdGhlIHJvb3QgY29udGV4dC5cbiAgICBzY29wZS5zZXQodmlldy54cmVmLCBvLnZhcmlhYmxlKCdjdHgnKSk7XG4gIH1cblxuICBmb3IgKGNvbnN0IG9wIG9mIG9wcykge1xuICAgIGlyLnRyYW5zZm9ybUV4cHJlc3Npb25zSW5PcChvcCwgZXhwciA9PiB7XG4gICAgICBpZiAoZXhwciBpbnN0YW5jZW9mIGlyLkNvbnRleHRFeHByKSB7XG4gICAgICAgIGlmICghc2NvcGUuaGFzKGV4cHIudmlldykpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgIGBObyBjb250ZXh0IGZvdW5kIGZvciByZWZlcmVuY2UgdG8gdmlldyAke2V4cHIudmlld30gZnJvbSB2aWV3ICR7dmlldy54cmVmfWApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzY29wZS5nZXQoZXhwci52aWV3KSE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZXhwcjtcbiAgICAgIH1cbiAgICB9LCBpci5WaXNpdG9yQ29udGV4dEZsYWcuTm9uZSk7XG4gIH1cbn1cbiJdfQ==