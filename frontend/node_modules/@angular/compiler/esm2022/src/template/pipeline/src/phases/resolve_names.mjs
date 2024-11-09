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
 * Resolves lexical references in views (`ir.LexicalReadExpr`) to either a target variable or to
 * property reads on the top-level component context.
 *
 * Also matches `ir.RestoreViewExpr` expressions with the variables of their corresponding saved
 * views.
 */
export function resolveNames(job) {
    for (const unit of job.units) {
        processLexicalScope(unit, unit.create, null);
        processLexicalScope(unit, unit.update, null);
    }
}
function processLexicalScope(unit, ops, savedView) {
    // Maps names defined in the lexical scope of this template to the `ir.XrefId`s of the variable
    // declarations which represent those values.
    //
    // Since variables are generated in each view for the entire lexical scope (including any
    // identifiers from parent templates) only local variables need be considered here.
    const scope = new Map();
    // First, step through the operations list and:
    // 1) build up the `scope` mapping
    // 2) recurse into any listener functions
    for (const op of ops) {
        switch (op.kind) {
            case ir.OpKind.Variable:
                switch (op.variable.kind) {
                    case ir.SemanticVariableKind.Identifier:
                    case ir.SemanticVariableKind.Alias:
                        // This variable represents some kind of identifier which can be used in the template.
                        if (scope.has(op.variable.identifier)) {
                            continue;
                        }
                        scope.set(op.variable.identifier, op.xref);
                        break;
                    case ir.SemanticVariableKind.SavedView:
                        // This variable represents a snapshot of the current view context, and can be used to
                        // restore that context within listener functions.
                        savedView = {
                            view: op.variable.view,
                            variable: op.xref,
                        };
                        break;
                }
                break;
            case ir.OpKind.Listener:
            case ir.OpKind.TwoWayListener:
                // Listener functions have separate variable declarations, so process them as a separate
                // lexical scope.
                processLexicalScope(unit, op.handlerOps, savedView);
                break;
        }
    }
    // Next, use the `scope` mapping to match `ir.LexicalReadExpr` with defined names in the lexical
    // scope. Also, look for `ir.RestoreViewExpr`s and match them with the snapshotted view context
    // variable.
    for (const op of ops) {
        if (op.kind == ir.OpKind.Listener || op.kind === ir.OpKind.TwoWayListener) {
            // Listeners were already processed above with their own scopes.
            continue;
        }
        ir.transformExpressionsInOp(op, (expr) => {
            if (expr instanceof ir.LexicalReadExpr) {
                // `expr` is a read of a name within the lexical scope of this view.
                // Either that name is defined within the current view, or it represents a property from the
                // main component context.
                if (scope.has(expr.name)) {
                    // This was a defined variable in the current scope.
                    return new ir.ReadVariableExpr(scope.get(expr.name));
                }
                else {
                    // Reading from the component context.
                    return new o.ReadPropExpr(new ir.ContextExpr(unit.job.root.xref), expr.name);
                }
            }
            else if (expr instanceof ir.RestoreViewExpr && typeof expr.view === 'number') {
                // `ir.RestoreViewExpr` happens in listener functions and restores a saved view from the
                // parent creation list. We expect to find that we captured the `savedView` previously, and
                // that it matches the expected view to be restored.
                if (savedView === null || savedView.view !== expr.view) {
                    throw new Error(`AssertionError: no saved view ${expr.view} from view ${unit.xref}`);
                }
                expr.view = new ir.ReadVariableExpr(savedView.variable);
                return expr;
            }
            else {
                return expr;
            }
        }, ir.VisitorContextFlag.None);
    }
    for (const op of ops) {
        ir.visitExpressionsInOp(op, expr => {
            if (expr instanceof ir.LexicalReadExpr) {
                throw new Error(`AssertionError: no lexical reads should remain, but found read of ${expr.name}`);
            }
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb2x2ZV9uYW1lcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy90ZW1wbGF0ZS9waXBlbGluZS9zcmMvcGhhc2VzL3Jlc29sdmVfbmFtZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxLQUFLLENBQUMsTUFBTSwrQkFBK0IsQ0FBQztBQUNuRCxPQUFPLEtBQUssRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUcvQjs7Ozs7O0dBTUc7QUFDSCxNQUFNLFVBQVUsWUFBWSxDQUFDLEdBQW1CO0lBQzlDLEtBQUssTUFBTSxJQUFJLElBQUksR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzdCLG1CQUFtQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzdDLG1CQUFtQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQy9DLENBQUM7QUFDSCxDQUFDO0FBRUQsU0FBUyxtQkFBbUIsQ0FDeEIsSUFBcUIsRUFBRSxHQUFrRCxFQUN6RSxTQUF5QjtJQUMzQiwrRkFBK0Y7SUFDL0YsNkNBQTZDO0lBQzdDLEVBQUU7SUFDRix5RkFBeUY7SUFDekYsbUZBQW1GO0lBQ25GLE1BQU0sS0FBSyxHQUFHLElBQUksR0FBRyxFQUFxQixDQUFDO0lBRTNDLCtDQUErQztJQUMvQyxrQ0FBa0M7SUFDbEMseUNBQXlDO0lBQ3pDLEtBQUssTUFBTSxFQUFFLElBQUksR0FBRyxFQUFFLENBQUM7UUFDckIsUUFBUSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDaEIsS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVE7Z0JBQ3JCLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFDekIsS0FBSyxFQUFFLENBQUMs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TSxDQUFDO2dCQUNOLE9BQU8sSUFBSSxDQUFDO1lBQ2QsQ0FBQztRQUNILENBQUMsRUFBRSxFQUFFLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDakMsQ0FBQztJQUVELEtBQUssTUFBTSxFQUFFLElBQUksR0FBRyxFQUFFLENBQUM7UUFDckIsRUFBRSxDQUFDLG9CQUFvQixDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRTtZQUNqQyxJQUFJLElBQUksWUFBWSxFQUFFLENBQUMsZUFBZSxFQUFFLENBQUM7Z0JBQ3ZDLE1BQU0sSUFBSSxLQUFLLENBQ1gscUVBQXFFLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQ3hGLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIG8gZnJvbSAnLi4vLi4vLi4vLi4vb3V0cHV0L291dHB1dF9hc3QnO1xuaW1wb3J0ICogYXMgaXIgZnJvbSAnLi4vLi4vaXInO1xuaW1wb3J0IHtDb21waWxhdGlvbkpvYiwgQ29tcGlsYXRpb25Vbml0LCBWaWV3Q29tcGlsYXRpb25Vbml0fSBmcm9tICcuLi9jb21waWxhdGlvbic7XG5cbi8qKlxuICogUmVzb2x2ZXMgbGV4aWNhbCByZWZlcmVuY2VzIGluIHZpZXdzIChgaXIuTGV4aWNhbFJlYWRFeHByYCkgdG8gZWl0aGVyIGEgdGFyZ2V0IHZhcmlhYmxlIG9yIHRvXG4gKiBwcm9wZXJ0eSByZWFkcyBvbiB0aGUgdG9wLWxldmVsIGNvbXBvbmVudCBjb250ZXh0LlxuICpcbiAqIEFsc28gbWF0Y2hlcyBgaXIuUmVzdG9yZVZpZXdFeHByYCBleHByZXNzaW9ucyB3aXRoIHRoZSB2YXJpYWJsZXMgb2YgdGhlaXIgY29ycmVzcG9uZGluZyBzYXZlZFxuICogdmlld3MuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlTmFtZXMoam9iOiBDb21waWxhdGlvbkpvYik6IHZvaWQge1xuICBmb3IgKGNvbnN0IHVuaXQgb2Ygam9iLnVuaXRzKSB7XG4gICAgcHJvY2Vzc0xleGljYWxTY29wZSh1bml0LCB1bml0LmNyZWF0ZSwgbnVsbCk7XG4gICAgcHJvY2Vzc0xleGljYWxTY29wZSh1bml0LCB1bml0LnVwZGF0ZSwgbnVsbCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gcHJvY2Vzc0xleGljYWxTY29wZShcbiAgICB1bml0OiBDb21waWxhdGlvblVuaXQsIG9wczogaXIuT3BMaXN0PGlyLkNyZWF0ZU9wPnxpci5PcExpc3Q8aXIuVXBkYXRlT3A+LFxuICAgIHNhdmVkVmlldzogU2F2ZWRWaWV3fG51bGwpOiB2b2lkIHtcbiAgLy8gTWFwcyBuYW1lcyBkZWZpbmVkIGluIHRoZSBsZXhpY2FsIHNjb3BlIG9mIHRoaXMgdGVtcGxhdGUgdG8gdGhlIGBpci5YcmVmSWRgcyBvZiB0aGUgdmFyaWFibGVcbiAgLy8gZGVjbGFyYXRpb25zIHdoaWNoIHJlcHJlc2VudCB0aG9zZSB2YWx1ZXMuXG4gIC8vXG4gIC8vIFNpbmNlIHZhcmlhYmxlcyBhcmUgZ2VuZXJhdGVkIGluIGVhY2ggdmlldyBmb3IgdGhlIGVudGlyZSBsZXhpY2FsIHNjb3BlIChpbmNsdWRpbmcgYW55XG4gIC8vIGlkZW50aWZpZXJzIGZyb20gcGFyZW50IHRlbXBsYXRlcykgb25seSBsb2NhbCB2YXJpYWJsZXMgbmVlZCBiZSBjb25zaWRlcmVkIGhlcmUuXG4gIGNvbnN0IHNjb3BlID0gbmV3IE1hcDxzdHJpbmcsIGlyLlhyZWZJZD4oKTtcblxuICAvLyBGaXJzdCwgc3RlcCB0aHJvdWdoIHRoZSBvcGVyYXRpb25zIGxpc3QgYW5kOlxuICAvLyAxKSBidWlsZCB1cCB0aGUgYHNjb3BlYCBtYXBwaW5nXG4gIC8vIDIpIHJlY3Vyc2UgaW50byBhbnkgbGlzdGVuZXIgZnVuY3Rpb25zXG4gIGZvciAoY29uc3Qgb3Agb2Ygb3BzKSB7XG4gICAgc3dpdGNoIChvcC5raW5kKSB7XG4gICAgICBjYXNlIGlyLk9wS2luZC5WYXJpYWJsZTpcbiAgICAgICAgc3dpdGNoIChvcC52YXJpYWJsZS5raW5kKSB7XG4gICAgICAgICAgY2FzZSBpci5TZW1hbnRpY1ZhcmlhYmxlS2luZC5JZGVudGlmaWVyOlxuICAgICAgICAgIGNhc2UgaXIuU2VtYW50aWNWYXJpYWJsZUtpbmQuQWxpYXM6XG4gICAgICAgICAgICAvLyBUaGlzIHZhcmlhYmxlIHJlcHJlc2VudHMgc29tZSBraW5kIG9mIGlkZW50aWZpZXIgd2hpY2ggY2FuIGJlIHVzZWQgaW4gdGhlIHRlbXBsYXRlLlxuICAgICAgICAgICAgaWYgKHNjb3BlLmhhcyhvcC52YXJpYWJsZS5pZGVudGlmaWVyKSkge1xuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNjb3BlLnNldChvcC52YXJpYWJsZS5pZGVudGlmaWVyLCBvcC54cmVmKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgaXIuU2VtYW50aWNWYXJpYWJsZUtpbmQuU2F2ZWRWaWV3OlxuICAgICAgICAgICAgLy8gVGhpcyB2YXJpYWJsZSByZXByZXNlbnRzIGEgc25hcHNob3Qgb2YgdGhlIGN1cnJlbnQgdmlldyBjb250ZXh0LCBhbmQgY2FuIGJlIHVzZWQgdG9cbiAgICAgICAgICAgIC8vIHJlc3RvcmUgdGhhdCBjb250ZXh0IHdpdGhpbiBsaXN0ZW5lciBmdW5jdGlvbnMuXG4gICAgICAgICAgICBzYXZlZFZpZXcgPSB7XG4gICAgICAgICAgICAgIHZpZXc6IG9wLnZhcmlhYmxlLnZpZXcsXG4gICAgICAgICAgICAgIHZhcmlhYmxlOiBvcC54cmVmLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBpci5PcEtpbmQuTGlzdGVuZXI6XG4gICAgICBjYXNlIGlyLk9wS2luZC5Ud29XYXlMaXN0ZW5lcjpcbiAgICAgICAgLy8gTGlzdGVuZXIgZnVuY3Rpb25zIGhhdmUgc2VwYXJhdGUgdmFyaWFibGUgZGVjbGFyYXRpb25zLCBzbyBwcm9jZXNzIHRoZW0gYXMgYSBzZXBhcmF0ZVxuICAgICAgICAvLyBsZXhpY2FsIHNjb3BlLlxuICAgICAgICBwcm9jZXNzTGV4aWNhbFNjb3BlKHVuaXQsIG9wLmhhbmRsZXJPcHMsIHNhdmVkVmlldyk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIC8vIE5leHQsIHVzZSB0aGUgYHNjb3BlYCBtYXBwaW5nIHRvIG1hdGNoIGBpci5MZXhpY2FsUmVhZEV4cHJgIHdpdGggZGVmaW5lZCBuYW1lcyBpbiB0aGUgbGV4aWNhbFxuICAvLyBzY29wZS4gQWxzbywgbG9vayBmb3IgYGlyLlJlc3RvcmVWaWV3RXhwcmBzIGFuZCBtYXRjaCB0aGVtIHdpdGggdGhlIHNuYXBzaG90dGVkIHZpZXcgY29udGV4dFxuICAvLyB2YXJpYWJsZS5cbiAgZm9yIChjb25zdCBvcCBvZiBvcHMpIHtcbiAgICBpZiAob3Aua2luZCA9PSBpci5PcEtpbmQuTGlzdGVuZXIgfHwgb3Aua2luZCA9PT0gaXIuT3BLaW5kLlR3b1dheUxpc3RlbmVyKSB7XG4gICAgICAvLyBMaXN0ZW5lcnMgd2VyZSBhbHJlYWR5IHByb2Nlc3NlZCBhYm92ZSB3aXRoIHRoZWlyIG93biBzY29wZXMuXG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgaXIudHJhbnNmb3JtRXhwcmVzc2lvbnNJbk9wKG9wLCAoZXhwcikgPT4ge1xuICAgICAgaWYgKGV4cHIgaW5zdGFuY2VvZiBpci5MZXhpY2FsUmVhZEV4cHIpIHtcbiAgICAgICAgLy8gYGV4cHJgIGlzIGEgcmVhZCBvZiBhIG5hbWUgd2l0aGluIHRoZSBsZXhpY2FsIHNjb3BlIG9mIHRoaXMgdmlldy5cbiAgICAgICAgLy8gRWl0aGVyIHRoYXQgbmFtZSBpcyBkZWZpbmVkIHdpdGhpbiB0aGUgY3VycmVudCB2aWV3LCBvciBpdCByZXByZXNlbnRzIGEgcHJvcGVydHkgZnJvbSB0aGVcbiAgICAgICAgLy8gbWFpbiBjb21wb25lbnQgY29udGV4dC5cbiAgICAgICAgaWYgKHNjb3BlLmhhcyhleHByLm5hbWUpKSB7XG4gICAgICAgICAgLy8gVGhpcyB3YXMgYSBkZWZpbmVkIHZhcmlhYmxlIGluIHRoZSBjdXJyZW50IHNjb3BlLlxuICAgICAgICAgIHJldHVybiBuZXcgaXIuUmVhZFZhcmlhYmxlRXhwcihzY29wZS5nZXQoZXhwci5uYW1lKSEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFJlYWRpbmcgZnJvbSB0aGUgY29tcG9uZW50IGNvbnRleHQuXG4gICAgICAgICAgcmV0dXJuIG5ldyBvLlJlYWRQcm9wRXhwcihuZXcgaXIuQ29udGV4dEV4cHIodW5pdC5qb2Iucm9vdC54cmVmKSwgZXhwci5uYW1lKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChleHByIGluc3RhbmNlb2YgaXIuUmVzdG9yZVZpZXdFeHByICYmIHR5cGVvZiBleHByLnZpZXcgPT09ICdudW1iZXInKSB7XG4gICAgICAgIC8vIGBpci5SZXN0b3JlVmlld0V4cHJgIGhhcHBlbnMgaW4gbGlzdGVuZXIgZnVuY3Rpb25zIGFuZCByZXN0b3JlcyBhIHNhdmVkIHZpZXcgZnJvbSB0aGVcbiAgICAgICAgLy8gcGFyZW50IGNyZWF0aW9uIGxpc3QuIFdlIGV4cGVjdCB0byBmaW5kIHRoYXQgd2UgY2FwdHVyZWQgdGhlIGBzYXZlZFZpZXdgIHByZXZpb3VzbHksIGFuZFxuICAgICAgICAvLyB0aGF0IGl0IG1hdGNoZXMgdGhlIGV4cGVjdGVkIHZpZXcgdG8gYmUgcmVzdG9yZWQuXG4gICAgICAgIGlmIChzYXZlZFZpZXcgPT09IG51bGwgfHwgc2F2ZWRWaWV3LnZpZXcgIT09IGV4cHIudmlldykge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQXNzZXJ0aW9uRXJyb3I6IG5vIHNhdmVkIHZpZXcgJHtleHByLnZpZXd9IGZyb20gdmlldyAke3VuaXQueHJlZn1gKTtcbiAgICAgICAgfVxuICAgICAgICBleHByLnZpZXcgPSBuZXcgaXIuUmVhZFZhcmlhYmxlRXhwcihzYXZlZFZpZXcudmFyaWFibGUpO1xuICAgICAgICByZXR1cm4gZXhwcjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBleHByO1xuICAgICAgfVxuICAgIH0sIGlyLlZpc2l0b3JDb250ZXh0RmxhZy5Ob25lKTtcbiAgfVxuXG4gIGZvciAoY29uc3Qgb3Agb2Ygb3BzKSB7XG4gICAgaXIudmlzaXRFeHByZXNzaW9uc0luT3Aob3AsIGV4cHIgPT4ge1xuICAgICAgaWYgKGV4cHIgaW5zdGFuY2VvZiBpci5MZXhpY2FsUmVhZEV4cHIpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYEFzc2VydGlvbkVycm9yOiBubyBsZXhpY2FsIHJlYWRzIHNob3VsZCByZW1haW4sIGJ1dCBmb3VuZCByZWFkIG9mICR7ZXhwci5uYW1lfWApO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG5cbi8qKlxuICogSW5mb3JtYXRpb24gYWJvdXQgYSBgU2F2ZWRWaWV3YCB2YXJpYWJsZS5cbiAqL1xuaW50ZXJmYWNlIFNhdmVkVmlldyB7XG4gIC8qKlxuICAgKiBUaGUgdmlldyBgaXIuWHJlZklkYCB3aGljaCB3YXMgc2F2ZWQgaW50byB0aGlzIHZhcmlhYmxlLlxuICAgKi9cbiAgdmlldzogaXIuWHJlZklkO1xuXG4gIC8qKlxuICAgKiBUaGUgYGlyLlhyZWZJZGAgb2YgdGhlIHZhcmlhYmxlIGludG8gd2hpY2ggdGhlIHZpZXcgd2FzIHNhdmVkLlxuICAgKi9cbiAgdmFyaWFibGU6IGlyLlhyZWZJZDtcbn1cbiJdfQ==