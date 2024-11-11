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
    // Symbols defined within the current scope. They take precedence over ones defined outside.
    const localDefinitions = new Map();
    // First, step through the operations list and:
    // 1) build up the `scope` mapping
    // 2) recurse into any listener functions
    for (const op of ops) {
        switch (op.kind) {
            case ir.OpKind.Variable:
                switch (op.variable.kind) {
                    case ir.SemanticVariableKind.Identifier:
                        if (op.variable.local) {
                            if (localDefinitions.has(op.variable.identifier)) {
                                continue;
                            }
                            localDefinitions.set(op.variable.identifier, op.xref);
                        }
                        else if (scope.has(op.variable.identifier)) {
                            continue;
                        }
                        scope.set(op.variable.identifier, op.xref);
                        break;
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
                if (localDefinitions.has(expr.name)) {
                    return new ir.ReadVariableExpr(localDefinitions.get(expr.name));
                }
                else if (scope.has(expr.name)) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb2x2ZV9uYW1lcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy90ZW1wbGF0ZS9waXBlbGluZS9zcmMvcGhhc2VzL3Jlc29sdmVfbmFtZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxLQUFLLENBQUMsTUFBTSwrQkFBK0IsQ0FBQztBQUNuRCxPQUFPLEtBQUssRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUcvQjs7Ozs7O0dBTUc7QUFDSCxNQUFNLFVBQVUsWUFBWSxDQUFDLEdBQW1CO0lBQzlDLEtBQUssTUFBTSxJQUFJLElBQUksR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzdCLG1CQUFtQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzdDLG1CQUFtQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQy9DLENBQUM7QUFDSCxDQUFDO0FBRUQsU0FBUyxtQkFBbUIsQ0FDMUIsSUFBcUIsRUFDckIsR0FBb0QsRUFDcEQsU0FBMkI7SUFFM0IsK0ZBQStGO0lBQy9GLDZDQUE2QztJQUM3QyxFQUFFO0lBQ0YseUZBQXlGO0lBQ3pGLG1GQUFtRjtJQUNuRixNQUFNLEtBQUssR0FBRyxJQUFJLEdBQUcsRUFBcUIsQ0FBQztJQUUzQyw0RkFBNEY7SUFDNUYsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLEdBQUcsRUFBcUIsQ0FBQztJQUV0RCwrQ0FBK0M7SUFDL0Msa0NBQWtDO0lBQ2xDLHlDQUF5QztJQUN6QyxLQUFLLE1BQU0sRUFBRSxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ3JCLFFBQVEsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2hCLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRO2dCQUNyQixRQUFR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LElBQUksS0FBSyxDQUNiLHFFQUFxRSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQ2pGLENBQUM7WUFDSixDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgbyBmcm9tICcuLi8uLi8uLi8uLi9vdXRwdXQvb3V0cHV0X2FzdCc7XG5pbXBvcnQgKiBhcyBpciBmcm9tICcuLi8uLi9pcic7XG5pbXBvcnQge0NvbXBpbGF0aW9uSm9iLCBDb21waWxhdGlvblVuaXR9IGZyb20gJy4uL2NvbXBpbGF0aW9uJztcblxuLyoqXG4gKiBSZXNvbHZlcyBsZXhpY2FsIHJlZmVyZW5jZXMgaW4gdmlld3MgKGBpci5MZXhpY2FsUmVhZEV4cHJgKSB0byBlaXRoZXIgYSB0YXJnZXQgdmFyaWFibGUgb3IgdG9cbiAqIHByb3BlcnR5IHJlYWRzIG9uIHRoZSB0b3AtbGV2ZWwgY29tcG9uZW50IGNvbnRleHQuXG4gKlxuICogQWxzbyBtYXRjaGVzIGBpci5SZXN0b3JlVmlld0V4cHJgIGV4cHJlc3Npb25zIHdpdGggdGhlIHZhcmlhYmxlcyBvZiB0aGVpciBjb3JyZXNwb25kaW5nIHNhdmVkXG4gKiB2aWV3cy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVOYW1lcyhqb2I6IENvbXBpbGF0aW9uSm9iKTogdm9pZCB7XG4gIGZvciAoY29uc3QgdW5pdCBvZiBqb2IudW5pdHMpIHtcbiAgICBwcm9jZXNzTGV4aWNhbFNjb3BlKHVuaXQsIHVuaXQuY3JlYXRlLCBudWxsKTtcbiAgICBwcm9jZXNzTGV4aWNhbFNjb3BlKHVuaXQsIHVuaXQudXBkYXRlLCBudWxsKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBwcm9jZXNzTGV4aWNhbFNjb3BlKFxuICB1bml0OiBDb21waWxhdGlvblVuaXQsXG4gIG9wczogaXIuT3BMaXN0PGlyLkNyZWF0ZU9wPiB8IGlyLk9wTGlzdDxpci5VcGRhdGVPcD4sXG4gIHNhdmVkVmlldzogU2F2ZWRWaWV3IHwgbnVsbCxcbik6IHZvaWQge1xuICAvLyBNYXBzIG5hbWVzIGRlZmluZWQgaW4gdGhlIGxleGljYWwgc2NvcGUgb2YgdGhpcyB0ZW1wbGF0ZSB0byB0aGUgYGlyLlhyZWZJZGBzIG9mIHRoZSB2YXJpYWJsZVxuICAvLyBkZWNsYXJhdGlvbnMgd2hpY2ggcmVwcmVzZW50IHRob3NlIHZhbHVlcy5cbiAgLy9cbiAgLy8gU2luY2UgdmFyaWFibGVzIGFyZSBnZW5lcmF0ZWQgaW4gZWFjaCB2aWV3IGZvciB0aGUgZW50aXJlIGxleGljYWwgc2NvcGUgKGluY2x1ZGluZyBhbnlcbiAgLy8gaWRlbnRpZmllcnMgZnJvbSBwYXJlbnQgdGVtcGxhdGVzKSBvbmx5IGxvY2FsIHZhcmlhYmxlcyBuZWVkIGJlIGNvbnNpZGVyZWQgaGVyZS5cbiAgY29uc3Qgc2NvcGUgPSBuZXcgTWFwPHN0cmluZywgaXIuWHJlZklkPigpO1xuXG4gIC8vIFN5bWJvbHMgZGVmaW5lZCB3aXRoaW4gdGhlIGN1cnJlbnQgc2NvcGUuIFRoZXkgdGFrZSBwcmVjZWRlbmNlIG92ZXIgb25lcyBkZWZpbmVkIG91dHNpZGUuXG4gIGNvbnN0IGxvY2FsRGVmaW5pdGlvbnMgPSBuZXcgTWFwPHN0cmluZywgaXIuWHJlZklkPigpO1xuXG4gIC8vIEZpcnN0LCBzdGVwIHRocm91Z2ggdGhlIG9wZXJhdGlvbnMgbGlzdCBhbmQ6XG4gIC8vIDEpIGJ1aWxkIHVwIHRoZSBgc2NvcGVgIG1hcHBpbmdcbiAgLy8gMikgcmVjdXJzZSBpbnRvIGFueSBsaXN0ZW5lciBmdW5jdGlvbnNcbiAgZm9yIChjb25zdCBvcCBvZiBvcHMpIHtcbiAgICBzd2l0Y2ggKG9wLmtpbmQpIHtcbiAgICAgIGNhc2UgaXIuT3BLaW5kLlZhcmlhYmxlOlxuICAgICAgICBzd2l0Y2ggKG9wLnZhcmlhYmxlLmtpbmQpIHtcbiAgICAgICAgICBjYXNlIGlyLlNlbWFudGljVmFyaWFibGVLaW5kLklkZW50aWZpZXI6XG4gICAgICAgICAgICBpZiAob3AudmFyaWFibGUubG9jYWwpIHtcbiAgICAgICAgICAgICAgaWYgKGxvY2FsRGVmaW5pdGlvbnMuaGFzKG9wLnZhcmlhYmxlLmlkZW50aWZpZXIpKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgbG9jYWxEZWZpbml0aW9ucy5zZXQob3AudmFyaWFibGUuaWRlbnRpZmllciwgb3AueHJlZik7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHNjb3BlLmhhcyhvcC52YXJpYWJsZS5pZGVudGlmaWVyKSkge1xuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNjb3BlLnNldChvcC52YXJpYWJsZS5pZGVudGlmaWVyLCBvcC54cmVmKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgaXIuU2VtYW50aWNWYXJpYWJsZUtpbmQuQWxpYXM6XG4gICAgICAgICAgICAvLyBUaGlzIHZhcmlhYmxlIHJlcHJlc2VudHMgc29tZSBraW5kIG9mIGlkZW50aWZpZXIgd2hpY2ggY2FuIGJlIHVzZWQgaW4gdGhlIHRlbXBsYXRlLlxuICAgICAgICAgICAgaWYgKHNjb3BlLmhhcyhvcC52YXJpYWJsZS5pZGVudGlmaWVyKSkge1xuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNjb3BlLnNldChvcC52YXJpYWJsZS5pZGVudGlmaWVyLCBvcC54cmVmKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgaXIuU2VtYW50aWNWYXJpYWJsZUtpbmQuU2F2ZWRWaWV3OlxuICAgICAgICAgICAgLy8gVGhpcyB2YXJpYWJsZSByZXByZXNlbnRzIGEgc25hcHNob3Qgb2YgdGhlIGN1cnJlbnQgdmlldyBjb250ZXh0LCBhbmQgY2FuIGJlIHVzZWQgdG9cbiAgICAgICAgICAgIC8vIHJlc3RvcmUgdGhhdCBjb250ZXh0IHdpdGhpbiBsaXN0ZW5lciBmdW5jdGlvbnMuXG4gICAgICAgICAgICBzYXZlZFZpZXcgPSB7XG4gICAgICAgICAgICAgIHZpZXc6IG9wLnZhcmlhYmxlLnZpZXcsXG4gICAgICAgICAgICAgIHZhcmlhYmxlOiBvcC54cmVmLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBpci5PcEtpbmQuTGlzdGVuZXI6XG4gICAgICBjYXNlIGlyLk9wS2luZC5Ud29XYXlMaXN0ZW5lcjpcbiAgICAgICAgLy8gTGlzdGVuZXIgZnVuY3Rpb25zIGhhdmUgc2VwYXJhdGUgdmFyaWFibGUgZGVjbGFyYXRpb25zLCBzbyBwcm9jZXNzIHRoZW0gYXMgYSBzZXBhcmF0ZVxuICAgICAgICAvLyBsZXhpY2FsIHNjb3BlLlxuICAgICAgICBwcm9jZXNzTGV4aWNhbFNjb3BlKHVuaXQsIG9wLmhhbmRsZXJPcHMsIHNhdmVkVmlldyk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIC8vIE5leHQsIHVzZSB0aGUgYHNjb3BlYCBtYXBwaW5nIHRvIG1hdGNoIGBpci5MZXhpY2FsUmVhZEV4cHJgIHdpdGggZGVmaW5lZCBuYW1lcyBpbiB0aGUgbGV4aWNhbFxuICAvLyBzY29wZS4gQWxzbywgbG9vayBmb3IgYGlyLlJlc3RvcmVWaWV3RXhwcmBzIGFuZCBtYXRjaCB0aGVtIHdpdGggdGhlIHNuYXBzaG90dGVkIHZpZXcgY29udGV4dFxuICAvLyB2YXJpYWJsZS5cbiAgZm9yIChjb25zdCBvcCBvZiBvcHMpIHtcbiAgICBpZiAob3Aua2luZCA9PSBpci5PcEtpbmQuTGlzdGVuZXIgfHwgb3Aua2luZCA9PT0gaXIuT3BLaW5kLlR3b1dheUxpc3RlbmVyKSB7XG4gICAgICAvLyBMaXN0ZW5lcnMgd2VyZSBhbHJlYWR5IHByb2Nlc3NlZCBhYm92ZSB3aXRoIHRoZWlyIG93biBzY29wZXMuXG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgaXIudHJhbnNmb3JtRXhwcmVzc2lvbnNJbk9wKFxuICAgICAgb3AsXG4gICAgICAoZXhwcikgPT4ge1xuICAgICAgICBpZiAoZXhwciBpbnN0YW5jZW9mIGlyLkxleGljYWxSZWFkRXhwcikge1xuICAgICAgICAgIC8vIGBleHByYCBpcyBhIHJlYWQgb2YgYSBuYW1lIHdpdGhpbiB0aGUgbGV4aWNhbCBzY29wZSBvZiB0aGlzIHZpZXcuXG4gICAgICAgICAgLy8gRWl0aGVyIHRoYXQgbmFtZSBpcyBkZWZpbmVkIHdpdGhpbiB0aGUgY3VycmVudCB2aWV3LCBvciBpdCByZXByZXNlbnRzIGEgcHJvcGVydHkgZnJvbSB0aGVcbiAgICAgICAgICAvLyBtYWluIGNvbXBvbmVudCBjb250ZXh0LlxuICAgICAgICAgIGlmIChsb2NhbERlZmluaXRpb25zLmhhcyhleHByLm5hbWUpKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IGlyLlJlYWRWYXJpYWJsZUV4cHIobG9jYWxEZWZpbml0aW9ucy5nZXQoZXhwci5uYW1lKSEpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoc2NvcGUuaGFzKGV4cHIubmFtZSkpIHtcbiAgICAgICAgICAgIC8vIFRoaXMgd2FzIGEgZGVmaW5lZCB2YXJpYWJsZSBpbiB0aGUgY3VycmVudCBzY29wZS5cbiAgICAgICAgICAgIHJldHVybiBuZXcgaXIuUmVhZFZhcmlhYmxlRXhwcihzY29wZS5nZXQoZXhwci5uYW1lKSEpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBSZWFkaW5nIGZyb20gdGhlIGNvbXBvbmVudCBjb250ZXh0LlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBvLlJlYWRQcm9wRXhwcihuZXcgaXIuQ29udGV4dEV4cHIodW5pdC5qb2Iucm9vdC54cmVmKSwgZXhwci5uYW1lKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoZXhwciBpbnN0YW5jZW9mIGlyLlJlc3RvcmVWaWV3RXhwciAmJiB0eXBlb2YgZXhwci52aWV3ID09PSAnbnVtYmVyJykge1xuICAgICAgICAgIC8vIGBpci5SZXN0b3JlVmlld0V4cHJgIGhhcHBlbnMgaW4gbGlzdGVuZXIgZnVuY3Rpb25zIGFuZCByZXN0b3JlcyBhIHNhdmVkIHZpZXcgZnJvbSB0aGVcbiAgICAgICAgICAvLyBwYXJlbnQgY3JlYXRpb24gbGlzdC4gV2UgZXhwZWN0IHRvIGZpbmQgdGhhdCB3ZSBjYXB0dXJlZCB0aGUgYHNhdmVkVmlld2AgcHJldmlvdXNseSwgYW5kXG4gICAgICAgICAgLy8gdGhhdCBpdCBtYXRjaGVzIHRoZSBleHBlY3RlZCB2aWV3IHRvIGJlIHJlc3RvcmVkLlxuICAgICAgICAgIGlmIChzYXZlZFZpZXcgPT09IG51bGwgfHwgc2F2ZWRWaWV3LnZpZXcgIT09IGV4cHIudmlldykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBBc3NlcnRpb25FcnJvcjogbm8gc2F2ZWQgdmlldyAke2V4cHIudmlld30gZnJvbSB2aWV3ICR7dW5pdC54cmVmfWApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBleHByLnZpZXcgPSBuZXcgaXIuUmVhZFZhcmlhYmxlRXhwcihzYXZlZFZpZXcudmFyaWFibGUpO1xuICAgICAgICAgIHJldHVybiBleHByO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBleHByO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgaXIuVmlzaXRvckNvbnRleHRGbGFnLk5vbmUsXG4gICAgKTtcbiAgfVxuXG4gIGZvciAoY29uc3Qgb3Agb2Ygb3BzKSB7XG4gICAgaXIudmlzaXRFeHByZXNzaW9uc0luT3Aob3AsIChleHByKSA9PiB7XG4gICAgICBpZiAoZXhwciBpbnN0YW5jZW9mIGlyLkxleGljYWxSZWFkRXhwcikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYEFzc2VydGlvbkVycm9yOiBubyBsZXhpY2FsIHJlYWRzIHNob3VsZCByZW1haW4sIGJ1dCBmb3VuZCByZWFkIG9mICR7ZXhwci5uYW1lfWAsXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn1cblxuLyoqXG4gKiBJbmZvcm1hdGlvbiBhYm91dCBhIGBTYXZlZFZpZXdgIHZhcmlhYmxlLlxuICovXG5pbnRlcmZhY2UgU2F2ZWRWaWV3IHtcbiAgLyoqXG4gICAqIFRoZSB2aWV3IGBpci5YcmVmSWRgIHdoaWNoIHdhcyBzYXZlZCBpbnRvIHRoaXMgdmFyaWFibGUuXG4gICAqL1xuICB2aWV3OiBpci5YcmVmSWQ7XG5cbiAgLyoqXG4gICAqIFRoZSBgaXIuWHJlZklkYCBvZiB0aGUgdmFyaWFibGUgaW50byB3aGljaCB0aGUgdmlldyB3YXMgc2F2ZWQuXG4gICAqL1xuICB2YXJpYWJsZTogaXIuWHJlZklkO1xufVxuIl19