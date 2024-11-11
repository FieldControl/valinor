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
        ir.transformExpressionsInOp(op, (expr) => {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb2x2ZV9jb250ZXh0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy90ZW1wbGF0ZS9waXBlbGluZS9zcmMvcGhhc2VzL3Jlc29sdmVfY29udGV4dHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxLQUFLLENBQUMsTUFBTSwrQkFBK0IsQ0FBQztBQUNuRCxPQUFPLEtBQUssRUFBRSxNQUFNLFVBQVUsQ0FBQztBQVEvQjs7OztHQUlHO0FBQ0gsTUFBTSxVQUFVLGVBQWUsQ0FBQyxHQUFtQjtJQUNqRCxLQUFLLE1BQU0sSUFBSSxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM3QixtQkFBbUIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3ZDLG1CQUFtQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDekMsQ0FBQztBQUNILENBQUM7QUFFRCxTQUFTLG1CQUFtQixDQUMxQixJQUFxQixFQUNyQixHQUF5QztJQUV6Qyw4RkFBOEY7SUFDOUYsb0JBQW9CO0lBQ3BCLE1BQU0sS0FBSyxHQUFHLElBQUksR0FBRyxFQUEyQixDQUFDO0lBRWpELG9FQUFvRTtJQUNwRSxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBRXhDLEtBQUssTUFBTSxFQUFFLElBQUksR0FBRyxFQUFFLENBQUM7UUFDckIsUUFBUSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDaEIsS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVE7Z0JBQ3JCLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFDekIsS0FBSyxFQUFFLENBQUMsb0JBQW9CLENBQUMsT0FBTzt3QkFDbEMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzt3QkFDOUQsTUFBTTtnQkFDVixDQUFDO2dCQUNELE1BQU07WUFDUixLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDO1lBQ3hCLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxjQUFjO2dCQUMzQixtQkFBbUIsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUN6QyxNQUFNO1FBQ1YsQ0FBQztJQUNILENBQUM7SUFFRCxJQUFJLElBQUksS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzNCLDJGQUEyRjtRQUMzRixLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFFRCxLQUFLLE1BQU0sRUFBRSxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ3JCLEVBQUUsQ0FBQyx3QkFBd0IsQ0FDekIsRUFBRSxFQUNGLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDUCxJQUFJLElBQUksWUFBWSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQ25DLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO29CQUMxQixNQUFNLElBQUksS0FBSyxDQUNiLDBDQUEwQyxJQUFJLENBQUMsSUFBSSxjQUFjLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FDN0UsQ0FBQztnQkFDSixDQUFDO2dCQUNELE9BQU8sS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFFLENBQUM7WUFDL0IsQ0FBQztpQkFBTSxDQUFDO2dCQUNOLE9BQU8sSUFBSSxDQUFDO1lBQ2QsQ0FBQztRQUNILENBQUMsRUFDRCxFQUFFLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUMzQixDQUFDO0lBQ0osQ0FBQztBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIG8gZnJvbSAnLi4vLi4vLi4vLi4vb3V0cHV0L291dHB1dF9hc3QnO1xuaW1wb3J0ICogYXMgaXIgZnJvbSAnLi4vLi4vaXInO1xuaW1wb3J0IHtcbiAgQ29tcGlsYXRpb25Kb2IsXG4gIENvbXBpbGF0aW9uVW5pdCxcbiAgQ29tcG9uZW50Q29tcGlsYXRpb25Kb2IsXG4gIFZpZXdDb21waWxhdGlvblVuaXQsXG59IGZyb20gJy4uL2NvbXBpbGF0aW9uJztcblxuLyoqXG4gKiBSZXNvbHZlcyBgaXIuQ29udGV4dEV4cHJgIGV4cHJlc3Npb25zICh3aGljaCByZXByZXNlbnQgZW1iZWRkZWQgdmlldyBvciBjb21wb25lbnQgY29udGV4dHMpIHRvXG4gKiBlaXRoZXIgdGhlIGBjdHhgIHBhcmFtZXRlciB0byBjb21wb25lbnQgZnVuY3Rpb25zIChmb3IgdGhlIGN1cnJlbnQgdmlldyBjb250ZXh0KSBvciB0byB2YXJpYWJsZXNcbiAqIHRoYXQgc3RvcmUgdGhvc2UgY29udGV4dHMgKGZvciBjb250ZXh0cyBhY2Nlc3NlZCB2aWEgdGhlIGBuZXh0Q29udGV4dCgpYCBpbnN0cnVjdGlvbikuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlQ29udGV4dHMoam9iOiBDb21waWxhdGlvbkpvYik6IHZvaWQge1xuICBmb3IgKGNvbnN0IHVuaXQgb2Ygam9iLnVuaXRzKSB7XG4gICAgcHJvY2Vzc0xleGljYWxTY29wZSh1bml0LCB1bml0LmNyZWF0ZSk7XG4gICAgcHJvY2Vzc0xleGljYWxTY29wZSh1bml0LCB1bml0LnVwZGF0ZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gcHJvY2Vzc0xleGljYWxTY29wZShcbiAgdmlldzogQ29tcGlsYXRpb25Vbml0LFxuICBvcHM6IGlyLk9wTGlzdDxpci5DcmVhdGVPcCB8IGlyLlVwZGF0ZU9wPixcbik6IHZvaWQge1xuICAvLyBUcmFjayB0aGUgZXhwcmVzc2lvbnMgdXNlZCB0byBhY2Nlc3MgYWxsIGF2YWlsYWJsZSBjb250ZXh0cyB3aXRoaW4gdGhlIGN1cnJlbnQgdmlldywgYnkgdGhlXG4gIC8vIHZpZXcgYGlyLlhyZWZJZGAuXG4gIGNvbnN0IHNjb3BlID0gbmV3IE1hcDxpci5YcmVmSWQsIG8uRXhwcmVzc2lvbj4oKTtcblxuICAvLyBUaGUgY3VycmVudCB2aWV3J3MgY29udGV4dCBpcyBhY2Nlc3NpYmxlIHZpYSB0aGUgYGN0eGAgcGFyYW1ldGVyLlxuICBzY29wZS5zZXQodmlldy54cmVmLCBvLnZhcmlhYmxlKCdjdHgnKSk7XG5cbiAgZm9yIChjb25zdCBvcCBvZiBvcHMpIHtcbiAgICBzd2l0Y2ggKG9wLmtpbmQpIHtcbiAgICAgIGNhc2UgaXIuT3BLaW5kLlZhcmlhYmxlOlxuICAgICAgICBzd2l0Y2ggKG9wLnZhcmlhYmxlLmtpbmQpIHtcbiAgICAgICAgICBjYXNlIGlyLlNlbWFudGljVmFyaWFibGVLaW5kLkNvbnRleHQ6XG4gICAgICAgICAgICBzY29wZS5zZXQob3AudmFyaWFibGUudmlldywgbmV3IGlyLlJlYWRWYXJpYWJsZUV4cHIob3AueHJlZikpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIGlyLk9wS2luZC5MaXN0ZW5lcjpcbiAgICAgIGNhc2UgaXIuT3BLaW5kLlR3b1dheUxpc3RlbmVyOlxuICAgICAgICBwcm9jZXNzTGV4aWNhbFNjb3BlKHZpZXcsIG9wLmhhbmRsZXJPcHMpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBpZiAodmlldyA9PT0gdmlldy5qb2Iucm9vdCkge1xuICAgIC8vIFByZWZlciBgY3R4YCBvZiB0aGUgcm9vdCB2aWV3IHRvIGFueSB2YXJpYWJsZXMgd2hpY2ggaGFwcGVuIHRvIGNvbnRhaW4gdGhlIHJvb3QgY29udGV4dC5cbiAgICBzY29wZS5zZXQodmlldy54cmVmLCBvLnZhcmlhYmxlKCdjdHgnKSk7XG4gIH1cblxuICBmb3IgKGNvbnN0IG9wIG9mIG9wcykge1xuICAgIGlyLnRyYW5zZm9ybUV4cHJlc3Npb25zSW5PcChcbiAgICAgIG9wLFxuICAgICAgKGV4cHIpID0+IHtcbiAgICAgICAgaWYgKGV4cHIgaW5zdGFuY2VvZiBpci5Db250ZXh0RXhwcikge1xuICAgICAgICAgIGlmICghc2NvcGUuaGFzKGV4cHIudmlldykpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgYE5vIGNvbnRleHQgZm91bmQgZm9yIHJlZmVyZW5jZSB0byB2aWV3ICR7ZXhwci52aWV3fSBmcm9tIHZpZXcgJHt2aWV3LnhyZWZ9YCxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBzY29wZS5nZXQoZXhwci52aWV3KSE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIGV4cHI7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBpci5WaXNpdG9yQ29udGV4dEZsYWcuTm9uZSxcbiAgICApO1xuICB9XG59XG4iXX0=