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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb2x2ZV9jb250ZXh0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy90ZW1wbGF0ZS9waXBlbGluZS9zcmMvcGhhc2VzL3Jlc29sdmVfY29udGV4dHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxLQUFLLENBQUMsTUFBTSwrQkFBK0IsQ0FBQztBQUNuRCxPQUFPLEtBQUssRUFBRSxNQUFNLFVBQVUsQ0FBQztBQVEvQjs7OztHQUlHO0FBQ0gsTUFBTSxVQUFVLGVBQWUsQ0FBQyxHQUFtQjtJQUNqRCxLQUFLLE1BQU0sSUFBSSxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM3QixtQkFBbUIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3ZDLG1CQUFtQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDekMsQ0FBQztBQUNILENBQUM7QUFFRCxTQUFTLG1CQUFtQixDQUMxQixJQUFxQixFQUNyQixHQUF5QztJQUV6Qyw4RkFBOEY7SUFDOUYsb0JBQW9CO0lBQ3BCLE1BQU0sS0FBSyxHQUFHLElBQUksR0FBRyxFQUEyQixDQUFDO0lBRWpELG9FQUFvRTtJQUNwRSxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBRXhDLEtBQUssTUFBTSxFQUFFLElBQUksR0FBRyxFQUFFLENBQUM7UUFDckIsUUFBUSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDaEIsS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVE7Z0JBQ3JCLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFDekIsS0FBSyxFQUFFLENBQUMsb0JBQW9CLENBQUMsT0FBTzt3QkFDbEMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzt3QkFDOUQsTUFBTTtnQkFDVixDQUFDO2dCQUNELE1BQU07WUFDUixLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDO1lBQ3hCLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxjQUFjO2dCQUMzQixtQkFBbUIsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUN6QyxNQUFNO1FBQ1YsQ0FBQztJQUNILENBQUM7SUFFRCxJQUFJLElBQUksS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzNCLDJGQUEyRjtRQUMzRixLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFFRCxLQUFLLE1BQU0sRUFBRSxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ3JCLEVBQUUsQ0FBQyx3QkFBd0IsQ0FDekIsRUFBRSxFQUNGLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDUCxJQUFJLElBQUksWUFBWSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQ25DLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO29CQUMxQixNQUFNLElBQUksS0FBSyxDQUNiLDBDQUEwQyxJQUFJLENBQUMsSUFBSSxjQUFjLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FDN0UsQ0FBQztnQkFDSixDQUFDO2dCQUNELE9BQU8sS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFFLENBQUM7WUFDL0IsQ0FBQztpQkFBTSxDQUFDO2dCQUNOLE9BQU8sSUFBSSxDQUFDO1lBQ2QsQ0FBQztRQUNILENBQUMsRUFDRCxFQUFFLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUMzQixDQUFDO0lBQ0osQ0FBQztBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgbyBmcm9tICcuLi8uLi8uLi8uLi9vdXRwdXQvb3V0cHV0X2FzdCc7XG5pbXBvcnQgKiBhcyBpciBmcm9tICcuLi8uLi9pcic7XG5pbXBvcnQge1xuICBDb21waWxhdGlvbkpvYixcbiAgQ29tcGlsYXRpb25Vbml0LFxuICBDb21wb25lbnRDb21waWxhdGlvbkpvYixcbiAgVmlld0NvbXBpbGF0aW9uVW5pdCxcbn0gZnJvbSAnLi4vY29tcGlsYXRpb24nO1xuXG4vKipcbiAqIFJlc29sdmVzIGBpci5Db250ZXh0RXhwcmAgZXhwcmVzc2lvbnMgKHdoaWNoIHJlcHJlc2VudCBlbWJlZGRlZCB2aWV3IG9yIGNvbXBvbmVudCBjb250ZXh0cykgdG9cbiAqIGVpdGhlciB0aGUgYGN0eGAgcGFyYW1ldGVyIHRvIGNvbXBvbmVudCBmdW5jdGlvbnMgKGZvciB0aGUgY3VycmVudCB2aWV3IGNvbnRleHQpIG9yIHRvIHZhcmlhYmxlc1xuICogdGhhdCBzdG9yZSB0aG9zZSBjb250ZXh0cyAoZm9yIGNvbnRleHRzIGFjY2Vzc2VkIHZpYSB0aGUgYG5leHRDb250ZXh0KClgIGluc3RydWN0aW9uKS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVDb250ZXh0cyhqb2I6IENvbXBpbGF0aW9uSm9iKTogdm9pZCB7XG4gIGZvciAoY29uc3QgdW5pdCBvZiBqb2IudW5pdHMpIHtcbiAgICBwcm9jZXNzTGV4aWNhbFNjb3BlKHVuaXQsIHVuaXQuY3JlYXRlKTtcbiAgICBwcm9jZXNzTGV4aWNhbFNjb3BlKHVuaXQsIHVuaXQudXBkYXRlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBwcm9jZXNzTGV4aWNhbFNjb3BlKFxuICB2aWV3OiBDb21waWxhdGlvblVuaXQsXG4gIG9wczogaXIuT3BMaXN0PGlyLkNyZWF0ZU9wIHwgaXIuVXBkYXRlT3A+LFxuKTogdm9pZCB7XG4gIC8vIFRyYWNrIHRoZSBleHByZXNzaW9ucyB1c2VkIHRvIGFjY2VzcyBhbGwgYXZhaWxhYmxlIGNvbnRleHRzIHdpdGhpbiB0aGUgY3VycmVudCB2aWV3LCBieSB0aGVcbiAgLy8gdmlldyBgaXIuWHJlZklkYC5cbiAgY29uc3Qgc2NvcGUgPSBuZXcgTWFwPGlyLlhyZWZJZCwgby5FeHByZXNzaW9uPigpO1xuXG4gIC8vIFRoZSBjdXJyZW50IHZpZXcncyBjb250ZXh0IGlzIGFjY2Vzc2libGUgdmlhIHRoZSBgY3R4YCBwYXJhbWV0ZXIuXG4gIHNjb3BlLnNldCh2aWV3LnhyZWYsIG8udmFyaWFibGUoJ2N0eCcpKTtcblxuICBmb3IgKGNvbnN0IG9wIG9mIG9wcykge1xuICAgIHN3aXRjaCAob3Aua2luZCkge1xuICAgICAgY2FzZSBpci5PcEtpbmQuVmFyaWFibGU6XG4gICAgICAgIHN3aXRjaCAob3AudmFyaWFibGUua2luZCkge1xuICAgICAgICAgIGNhc2UgaXIuU2VtYW50aWNWYXJpYWJsZUtpbmQuQ29udGV4dDpcbiAgICAgICAgICAgIHNjb3BlLnNldChvcC52YXJpYWJsZS52aWV3LCBuZXcgaXIuUmVhZFZhcmlhYmxlRXhwcihvcC54cmVmKSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgaXIuT3BLaW5kLkxpc3RlbmVyOlxuICAgICAgY2FzZSBpci5PcEtpbmQuVHdvV2F5TGlzdGVuZXI6XG4gICAgICAgIHByb2Nlc3NMZXhpY2FsU2NvcGUodmlldywgb3AuaGFuZGxlck9wcyk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIGlmICh2aWV3ID09PSB2aWV3LmpvYi5yb290KSB7XG4gICAgLy8gUHJlZmVyIGBjdHhgIG9mIHRoZSByb290IHZpZXcgdG8gYW55IHZhcmlhYmxlcyB3aGljaCBoYXBwZW4gdG8gY29udGFpbiB0aGUgcm9vdCBjb250ZXh0LlxuICAgIHNjb3BlLnNldCh2aWV3LnhyZWYsIG8udmFyaWFibGUoJ2N0eCcpKTtcbiAgfVxuXG4gIGZvciAoY29uc3Qgb3Agb2Ygb3BzKSB7XG4gICAgaXIudHJhbnNmb3JtRXhwcmVzc2lvbnNJbk9wKFxuICAgICAgb3AsXG4gICAgICAoZXhwcikgPT4ge1xuICAgICAgICBpZiAoZXhwciBpbnN0YW5jZW9mIGlyLkNvbnRleHRFeHByKSB7XG4gICAgICAgICAgaWYgKCFzY29wZS5oYXMoZXhwci52aWV3KSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICBgTm8gY29udGV4dCBmb3VuZCBmb3IgcmVmZXJlbmNlIHRvIHZpZXcgJHtleHByLnZpZXd9IGZyb20gdmlldyAke3ZpZXcueHJlZn1gLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHNjb3BlLmdldChleHByLnZpZXcpITtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gZXhwcjtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGlyLlZpc2l0b3JDb250ZXh0RmxhZy5Ob25lLFxuICAgICk7XG4gIH1cbn1cbiJdfQ==