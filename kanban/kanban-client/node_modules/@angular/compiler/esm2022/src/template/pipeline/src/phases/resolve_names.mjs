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
        ir.visitExpressionsInOp(op, (expr) => {
            if (expr instanceof ir.LexicalReadExpr) {
                throw new Error(`AssertionError: no lexical reads should remain, but found read of ${expr.name}`);
            }
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb2x2ZV9uYW1lcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy90ZW1wbGF0ZS9waXBlbGluZS9zcmMvcGhhc2VzL3Jlc29sdmVfbmFtZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxLQUFLLENBQUMsTUFBTSwrQkFBK0IsQ0FBQztBQUNuRCxPQUFPLEtBQUssRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUcvQjs7Ozs7O0dBTUc7QUFDSCxNQUFNLFVBQVUsWUFBWSxDQUFDLEdBQW1CO0lBQzlDLEtBQUssTUFBTSxJQUFJLElBQUksR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzdCLG1CQUFtQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzdDLG1CQUFtQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQy9DLENBQUM7QUFDSCxDQUFDO0FBRUQsU0FBUyxtQkFBbUIsQ0FDMUIsSUFBcUIsRUFDckIsR0FBb0QsRUFDcEQsU0FBMkI7SUFFM0IsK0ZBQStGO0lBQy9GLDZDQUE2QztJQUM3QyxFQUFFO0lBQ0YseUZBQXlGO0lBQ3pGLG1GQUFtRjtJQUNuRixNQUFNLEtBQUssR0FBRyxJQUFJLEdBQUcsRUFBcUIsQ0FBQztJQUUzQywrQ0FBK0M7SUFDL0Msa0NBQWtDO0lBQ2xDLHlDQUF5QztJQUN6QyxLQUFLLE1BQU0sRUFBRSxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ3JCLFFBQVEsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2hCLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRO2dCQUNyQixRQUFRLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7b0JBQ3pCLEtBQUssRUFBRSxDQUFD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QU0sQ0FBQztnQkFDTixPQUFPLElBQUksQ0FBQztZQUNkLENBQUM7UUFDSCxDQUFDLEVBQ0QsRUFBRSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FDM0IsQ0FBQztJQUNKLENBQUM7SUFFRCxLQUFLLE1BQU0sRUFBRSxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ3JCLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRTtZQUNuQyxJQUFJLElBQUksWUFBWSxFQUFFLENBQUMsZUFBZSxFQUFFLENBQUM7Z0JBQ3ZDLE1BQU0sSUFBSSxLQUFLLENBQ2IscUVBQXFFLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FDakYsQ0FBQztZQUNKLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIG8gZnJvbSAnLi4vLi4vLi4vLi4vb3V0cHV0L291dHB1dF9hc3QnO1xuaW1wb3J0ICogYXMgaXIgZnJvbSAnLi4vLi4vaXInO1xuaW1wb3J0IHtDb21waWxhdGlvbkpvYiwgQ29tcGlsYXRpb25Vbml0LCBWaWV3Q29tcGlsYXRpb25Vbml0fSBmcm9tICcuLi9jb21waWxhdGlvbic7XG5cbi8qKlxuICogUmVzb2x2ZXMgbGV4aWNhbCByZWZlcmVuY2VzIGluIHZpZXdzIChgaXIuTGV4aWNhbFJlYWRFeHByYCkgdG8gZWl0aGVyIGEgdGFyZ2V0IHZhcmlhYmxlIG9yIHRvXG4gKiBwcm9wZXJ0eSByZWFkcyBvbiB0aGUgdG9wLWxldmVsIGNvbXBvbmVudCBjb250ZXh0LlxuICpcbiAqIEFsc28gbWF0Y2hlcyBgaXIuUmVzdG9yZVZpZXdFeHByYCBleHByZXNzaW9ucyB3aXRoIHRoZSB2YXJpYWJsZXMgb2YgdGhlaXIgY29ycmVzcG9uZGluZyBzYXZlZFxuICogdmlld3MuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlTmFtZXMoam9iOiBDb21waWxhdGlvbkpvYik6IHZvaWQge1xuICBmb3IgKGNvbnN0IHVuaXQgb2Ygam9iLnVuaXRzKSB7XG4gICAgcHJvY2Vzc0xleGljYWxTY29wZSh1bml0LCB1bml0LmNyZWF0ZSwgbnVsbCk7XG4gICAgcHJvY2Vzc0xleGljYWxTY29wZSh1bml0LCB1bml0LnVwZGF0ZSwgbnVsbCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gcHJvY2Vzc0xleGljYWxTY29wZShcbiAgdW5pdDogQ29tcGlsYXRpb25Vbml0LFxuICBvcHM6IGlyLk9wTGlzdDxpci5DcmVhdGVPcD4gfCBpci5PcExpc3Q8aXIuVXBkYXRlT3A+LFxuICBzYXZlZFZpZXc6IFNhdmVkVmlldyB8IG51bGwsXG4pOiB2b2lkIHtcbiAgLy8gTWFwcyBuYW1lcyBkZWZpbmVkIGluIHRoZSBsZXhpY2FsIHNjb3BlIG9mIHRoaXMgdGVtcGxhdGUgdG8gdGhlIGBpci5YcmVmSWRgcyBvZiB0aGUgdmFyaWFibGVcbiAgLy8gZGVjbGFyYXRpb25zIHdoaWNoIHJlcHJlc2VudCB0aG9zZSB2YWx1ZXMuXG4gIC8vXG4gIC8vIFNpbmNlIHZhcmlhYmxlcyBhcmUgZ2VuZXJhdGVkIGluIGVhY2ggdmlldyBmb3IgdGhlIGVudGlyZSBsZXhpY2FsIHNjb3BlIChpbmNsdWRpbmcgYW55XG4gIC8vIGlkZW50aWZpZXJzIGZyb20gcGFyZW50IHRlbXBsYXRlcykgb25seSBsb2NhbCB2YXJpYWJsZXMgbmVlZCBiZSBjb25zaWRlcmVkIGhlcmUuXG4gIGNvbnN0IHNjb3BlID0gbmV3IE1hcDxzdHJpbmcsIGlyLlhyZWZJZD4oKTtcblxuICAvLyBGaXJzdCwgc3RlcCB0aHJvdWdoIHRoZSBvcGVyYXRpb25zIGxpc3QgYW5kOlxuICAvLyAxKSBidWlsZCB1cCB0aGUgYHNjb3BlYCBtYXBwaW5nXG4gIC8vIDIpIHJlY3Vyc2UgaW50byBhbnkgbGlzdGVuZXIgZnVuY3Rpb25zXG4gIGZvciAoY29uc3Qgb3Agb2Ygb3BzKSB7XG4gICAgc3dpdGNoIChvcC5raW5kKSB7XG4gICAgICBjYXNlIGlyLk9wS2luZC5WYXJpYWJsZTpcbiAgICAgICAgc3dpdGNoIChvcC52YXJpYWJsZS5raW5kKSB7XG4gICAgICAgICAgY2FzZSBpci5TZW1hbnRpY1ZhcmlhYmxlS2luZC5JZGVudGlmaWVyOlxuICAgICAgICAgIGNhc2UgaXIuU2VtYW50aWNWYXJpYWJsZUtpbmQuQWxpYXM6XG4gICAgICAgICAgICAvLyBUaGlzIHZhcmlhYmxlIHJlcHJlc2VudHMgc29tZSBraW5kIG9mIGlkZW50aWZpZXIgd2hpY2ggY2FuIGJlIHVzZWQgaW4gdGhlIHRlbXBsYXRlLlxuICAgICAgICAgICAgaWYgKHNjb3BlLmhhcyhvcC52YXJpYWJsZS5pZGVudGlmaWVyKSkge1xuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNjb3BlLnNldChvcC52YXJpYWJsZS5pZGVudGlmaWVyLCBvcC54cmVmKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgaXIuU2VtYW50aWNWYXJpYWJsZUtpbmQuU2F2ZWRWaWV3OlxuICAgICAgICAgICAgLy8gVGhpcyB2YXJpYWJsZSByZXByZXNlbnRzIGEgc25hcHNob3Qgb2YgdGhlIGN1cnJlbnQgdmlldyBjb250ZXh0LCBhbmQgY2FuIGJlIHVzZWQgdG9cbiAgICAgICAgICAgIC8vIHJlc3RvcmUgdGhhdCBjb250ZXh0IHdpdGhpbiBsaXN0ZW5lciBmdW5jdGlvbnMuXG4gICAgICAgICAgICBzYXZlZFZpZXcgPSB7XG4gICAgICAgICAgICAgIHZpZXc6IG9wLnZhcmlhYmxlLnZpZXcsXG4gICAgICAgICAgICAgIHZhcmlhYmxlOiBvcC54cmVmLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBpci5PcEtpbmQuTGlzdGVuZXI6XG4gICAgICBjYXNlIGlyLk9wS2luZC5Ud29XYXlMaXN0ZW5lcjpcbiAgICAgICAgLy8gTGlzdGVuZXIgZnVuY3Rpb25zIGhhdmUgc2VwYXJhdGUgdmFyaWFibGUgZGVjbGFyYXRpb25zLCBzbyBwcm9jZXNzIHRoZW0gYXMgYSBzZXBhcmF0ZVxuICAgICAgICAvLyBsZXhpY2FsIHNjb3BlLlxuICAgICAgICBwcm9jZXNzTGV4aWNhbFNjb3BlKHVuaXQsIG9wLmhhbmRsZXJPcHMsIHNhdmVkVmlldyk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIC8vIE5leHQsIHVzZSB0aGUgYHNjb3BlYCBtYXBwaW5nIHRvIG1hdGNoIGBpci5MZXhpY2FsUmVhZEV4cHJgIHdpdGggZGVmaW5lZCBuYW1lcyBpbiB0aGUgbGV4aWNhbFxuICAvLyBzY29wZS4gQWxzbywgbG9vayBmb3IgYGlyLlJlc3RvcmVWaWV3RXhwcmBzIGFuZCBtYXRjaCB0aGVtIHdpdGggdGhlIHNuYXBzaG90dGVkIHZpZXcgY29udGV4dFxuICAvLyB2YXJpYWJsZS5cbiAgZm9yIChjb25zdCBvcCBvZiBvcHMpIHtcbiAgICBpZiAob3Aua2luZCA9PSBpci5PcEtpbmQuTGlzdGVuZXIgfHwgb3Aua2luZCA9PT0gaXIuT3BLaW5kLlR3b1dheUxpc3RlbmVyKSB7XG4gICAgICAvLyBMaXN0ZW5lcnMgd2VyZSBhbHJlYWR5IHByb2Nlc3NlZCBhYm92ZSB3aXRoIHRoZWlyIG93biBzY29wZXMuXG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgaXIudHJhbnNmb3JtRXhwcmVzc2lvbnNJbk9wKFxuICAgICAgb3AsXG4gICAgICAoZXhwcikgPT4ge1xuICAgICAgICBpZiAoZXhwciBpbnN0YW5jZW9mIGlyLkxleGljYWxSZWFkRXhwcikge1xuICAgICAgICAgIC8vIGBleHByYCBpcyBhIHJlYWQgb2YgYSBuYW1lIHdpdGhpbiB0aGUgbGV4aWNhbCBzY29wZSBvZiB0aGlzIHZpZXcuXG4gICAgICAgICAgLy8gRWl0aGVyIHRoYXQgbmFtZSBpcyBkZWZpbmVkIHdpdGhpbiB0aGUgY3VycmVudCB2aWV3LCBvciBpdCByZXByZXNlbnRzIGEgcHJvcGVydHkgZnJvbSB0aGVcbiAgICAgICAgICAvLyBtYWluIGNvbXBvbmVudCBjb250ZXh0LlxuICAgICAgICAgIGlmIChzY29wZS5oYXMoZXhwci5uYW1lKSkge1xuICAgICAgICAgICAgLy8gVGhpcyB3YXMgYSBkZWZpbmVkIHZhcmlhYmxlIGluIHRoZSBjdXJyZW50IHNjb3BlLlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBpci5SZWFkVmFyaWFibGVFeHByKHNjb3BlLmdldChleHByLm5hbWUpISk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFJlYWRpbmcgZnJvbSB0aGUgY29tcG9uZW50IGNvbnRleHQuXG4gICAgICAgICAgICByZXR1cm4gbmV3IG8uUmVhZFByb3BFeHByKG5ldyBpci5Db250ZXh0RXhwcih1bml0LmpvYi5yb290LnhyZWYpLCBleHByLm5hbWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChleHByIGluc3RhbmNlb2YgaXIuUmVzdG9yZVZpZXdFeHByICYmIHR5cGVvZiBleHByLnZpZXcgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgLy8gYGlyLlJlc3RvcmVWaWV3RXhwcmAgaGFwcGVucyBpbiBsaXN0ZW5lciBmdW5jdGlvbnMgYW5kIHJlc3RvcmVzIGEgc2F2ZWQgdmlldyBmcm9tIHRoZVxuICAgICAgICAgIC8vIHBhcmVudCBjcmVhdGlvbiBsaXN0LiBXZSBleHBlY3QgdG8gZmluZCB0aGF0IHdlIGNhcHR1cmVkIHRoZSBgc2F2ZWRWaWV3YCBwcmV2aW91c2x5LCBhbmRcbiAgICAgICAgICAvLyB0aGF0IGl0IG1hdGNoZXMgdGhlIGV4cGVjdGVkIHZpZXcgdG8gYmUgcmVzdG9yZWQuXG4gICAgICAgICAgaWYgKHNhdmVkVmlldyA9PT0gbnVsbCB8fCBzYXZlZFZpZXcudmlldyAhPT0gZXhwci52aWV3KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEFzc2VydGlvbkVycm9yOiBubyBzYXZlZCB2aWV3ICR7ZXhwci52aWV3fSBmcm9tIHZpZXcgJHt1bml0LnhyZWZ9YCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGV4cHIudmlldyA9IG5ldyBpci5SZWFkVmFyaWFibGVFeHByKHNhdmVkVmlldy52YXJpYWJsZSk7XG4gICAgICAgICAgcmV0dXJuIGV4cHI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIGV4cHI7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBpci5WaXNpdG9yQ29udGV4dEZsYWcuTm9uZSxcbiAgICApO1xuICB9XG5cbiAgZm9yIChjb25zdCBvcCBvZiBvcHMpIHtcbiAgICBpci52aXNpdEV4cHJlc3Npb25zSW5PcChvcCwgKGV4cHIpID0+IHtcbiAgICAgIGlmIChleHByIGluc3RhbmNlb2YgaXIuTGV4aWNhbFJlYWRFeHByKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgQXNzZXJ0aW9uRXJyb3I6IG5vIGxleGljYWwgcmVhZHMgc2hvdWxkIHJlbWFpbiwgYnV0IGZvdW5kIHJlYWQgb2YgJHtleHByLm5hbWV9YCxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAqIEluZm9ybWF0aW9uIGFib3V0IGEgYFNhdmVkVmlld2AgdmFyaWFibGUuXG4gKi9cbmludGVyZmFjZSBTYXZlZFZpZXcge1xuICAvKipcbiAgICogVGhlIHZpZXcgYGlyLlhyZWZJZGAgd2hpY2ggd2FzIHNhdmVkIGludG8gdGhpcyB2YXJpYWJsZS5cbiAgICovXG4gIHZpZXc6IGlyLlhyZWZJZDtcblxuICAvKipcbiAgICogVGhlIGBpci5YcmVmSWRgIG9mIHRoZSB2YXJpYWJsZSBpbnRvIHdoaWNoIHRoZSB2aWV3IHdhcyBzYXZlZC5cbiAgICovXG4gIHZhcmlhYmxlOiBpci5YcmVmSWQ7XG59XG4iXX0=