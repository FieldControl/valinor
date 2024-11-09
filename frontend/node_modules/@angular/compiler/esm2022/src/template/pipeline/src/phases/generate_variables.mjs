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
 * Generate a preamble sequence for each view creation block and listener function which declares
 * any variables that be referenced in other operations in the block.
 *
 * Variables generated include:
 *   * a saved view context to be used to restore the current view in event listeners.
 *   * the context of the restored view within event listener handlers.
 *   * context variables from the current view as well as all parent views (including the root
 *     context if needed).
 *   * local references from elements within the current view and any lexical parents.
 *
 * Variables are generated here unconditionally, and may optimized away in future operations if it
 * turns out their values (and any side effects) are unused.
 */
export function generateVariables(job) {
    recursivelyProcessView(job.root, /* there is no parent scope for the root view */ null);
}
/**
 * Process the given `ViewCompilation` and generate preambles for it and any listeners that it
 * declares.
 *
 * @param `parentScope` a scope extracted from the parent view which captures any variables which
 *     should be inherited by this view. `null` if the current view is the root view.
 */
function recursivelyProcessView(view, parentScope) {
    // Extract a `Scope` from this view.
    const scope = getScopeForView(view, parentScope);
    for (const op of view.create) {
        switch (op.kind) {
            case ir.OpKind.Template:
                // Descend into child embedded views.
                recursivelyProcessView(view.job.views.get(op.xref), scope);
                break;
            case ir.OpKind.RepeaterCreate:
                // Descend into child embedded views.
                recursivelyProcessView(view.job.views.get(op.xref), scope);
                if (op.emptyView) {
                    recursivelyProcessView(view.job.views.get(op.emptyView), scope);
                }
                break;
            case ir.OpKind.Listener:
            case ir.OpKind.TwoWayListener:
                // Prepend variables to listener handler functions.
                op.handlerOps.prepend(generateVariablesInScopeForView(view, scope));
                break;
        }
    }
    // Prepend the declarations for all available variables in scope to the `update` block.
    const preambleOps = generateVariablesInScopeForView(view, scope);
    view.update.prepend(preambleOps);
}
/**
 * Process a view and generate a `Scope` representing the variables available for reference within
 * that view.
 */
function getScopeForView(view, parent) {
    const scope = {
        view: view.xref,
        viewContextVariable: {
            kind: ir.SemanticVariableKind.Context,
            name: null,
            view: view.xref,
        },
        contextVariables: new Map(),
        aliases: view.aliases,
        references: [],
        parent,
    };
    for (const identifier of view.contextVariables.keys()) {
        scope.contextVariables.set(identifier, {
            kind: ir.SemanticVariableKind.Identifier,
            name: null,
            identifier,
        });
    }
    for (const op of view.create) {
        switch (op.kind) {
            case ir.OpKind.ElementStart:
            case ir.OpKind.Template:
                if (!Array.isArray(op.localRefs)) {
                    throw new Error(`AssertionError: expected localRefs to be an array`);
                }
                // Record available local references from this element.
                for (let offset = 0; offset < op.localRefs.length; offset++) {
                    scope.references.push({
                        name: op.localRefs[offset].name,
                        targetId: op.xref,
                        targetSlot: op.handle,
                        offset,
                        variable: {
                            kind: ir.SemanticVariableKind.Identifier,
                            name: null,
                            identifier: op.localRefs[offset].name,
                        },
                    });
                }
                break;
        }
    }
    return scope;
}
/**
 * Generate declarations for all variables that are in scope for a given view.
 *
 * This is a recursive process, as views inherit variables available from their parent view, which
 * itself may have inherited variables, etc.
 */
function generateVariablesInScopeForView(view, scope) {
    const newOps = [];
    if (scope.view !== view.xref) {
        // Before generating variables for a parent view, we need to switch to the context of the parent
        // view with a `nextContext` expression. This context switching operation itself declares a
        // variable, because the context of the view may be referenced directly.
        newOps.push(ir.createVariableOp(view.job.allocateXrefId(), scope.viewContextVariable, new ir.NextContextExpr(), ir.VariableFlags.None));
    }
    // Add variables for all context variables available in this scope's view.
    const scopeView = view.job.views.get(scope.view);
    for (const [name, value] of scopeView.contextVariables) {
        const context = new ir.ContextExpr(scope.view);
        // We either read the context, or, if the variable is CTX_REF, use the context directly.
        const variable = value === ir.CTX_REF ? context : new o.ReadPropExpr(context, value);
        // Add the variable declaration.
        newOps.push(ir.createVariableOp(view.job.allocateXrefId(), scope.contextVariables.get(name), variable, ir.VariableFlags.None));
    }
    for (const alias of scopeView.aliases) {
        newOps.push(ir.createVariableOp(view.job.allocateXrefId(), alias, alias.expression.clone(), ir.VariableFlags.AlwaysInline));
    }
    // Add variables for all local references declared for elements in this scope.
    for (const ref of scope.references) {
        newOps.push(ir.createVariableOp(view.job.allocateXrefId(), ref.variable, new ir.ReferenceExpr(ref.targetId, ref.targetSlot, ref.offset), ir.VariableFlags.None));
    }
    if (scope.parent !== null) {
        // Recursively add variables from the parent scope.
        newOps.push(...generateVariablesInScopeForView(view, scope.parent));
    }
    return newOps;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVfdmFyaWFibGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3RlbXBsYXRlL3BpcGVsaW5lL3NyYy9waGFzZXMvZ2VuZXJhdGVfdmFyaWFibGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sS0FBSyxDQUFDLE1BQU0sK0JBQStCLENBQUM7QUFDbkQsT0FBTyxLQUFLLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFJL0I7Ozs7Ozs7Ozs7Ozs7R0FhRztBQUNILE1BQU0sVUFBVSxpQkFBaUIsQ0FBQyxHQUE0QjtJQUM1RCxzQkFBc0IsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLGdEQUFnRCxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzFGLENBQUM7QUFFRDs7Ozs7O0dBTUc7QUFDSCxTQUFTLHNCQUFzQixDQUFDLElBQXlCLEVBQUUsV0FBdUI7SUFDaEYsb0NBQW9DO0lBQ3BDLE1BQU0sS0FBSyxHQUFHLGVBQWUsQ0FBQyxJQUFJLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFFakQsS0FBSyxNQUFNLEVBQUUsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDN0IsUUFBUSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDaEIsS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVE7Z0JBQ3JCLHFDQUFxQztnQkFDckMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDNUQsTUFBTTtZQUNSLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxjQUFjO2dCQUMzQixxQ0FBcUM7Z0JBQ3JDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQzVELElBQUksRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFDO29CQUNqQixzQkFBc0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUNuRSxDQUFDO2dCQUNELE1BQU07WUFDUixLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDO1lBQ3hCLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxjQUFjO2dCQUMzQixtREFBbUQ7Z0JBQ25ELEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLCtCQUErQixDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUNwRSxNQUFNO1FBQ1YsQ0FBQztJQUNILENBQUM7SUFFRCx1RkFBdUY7SUFDdkYsTUFBTSxXQUFXLEdBQUcsK0JBQStCLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ2pFLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ25DLENBQUM7QUF5REQ7OztHQUdHO0FBQ0gsU0FBUyxlQUFlLENBQUMsSUFBeUIsRUFBRSxNQUFrQjtJQUNwRSxNQUFNLEtBQUssR0FBVTtRQUNuQixJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7UUFDZixtQkFBbUIsRUFBRTtZQUNuQixJQUFJLEVBQUUsRUFBRSxDQUFDLG9CQUFvQixDQUFDLE9BQU87WUFDckMsSUFBSSxFQUFFLElBQUk7WUFDVixJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7U0FDaEI7UUFDRCxnQkFBZ0IsRUFBRSxJQUFJLEdBQUcsRUFBK0I7UUFDeEQsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPO1FBQ3JCLFVBQVUsRUFBRSxFQUFFO1FBQ2QsTUFBTTtLQUNQLENBQUM7SUFFRixLQUFLLE1BQU0sVUFBVSxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDO1FBQ3RELEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFO1lBQ3JDLElBQUksRUFBRSxFQUFFLENBQUMsb0JBQW9CLENBQUMsVUFBVTtZQUN4QyxJQUFJLEVBQUUsSUFBSTtZQUNWLFVBQVU7U0FDWCxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsS0FBSyxNQUFNLEVBQUUsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDN0IsUUFBUSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDaEIsS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQztZQUM1QixLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUTtnQkFDckIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUM7b0JBQ2pDLE1BQU0sSUFBSSxLQUFLLENBQUMsbURBQW1ELENBQUMsQ0FBQztnQkFDdkUsQ0FBQztnQkFFRCx1REFBdUQ7Z0JBQ3ZELEtBQUssSUFBSSxNQUFNLEdBQUcsQ0FBQyxFQUFFLE1BQU0sR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDO29CQUM1RCxLQUFLLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQzt3QkFDcEIsSUFBSSxFQUFFLEVBQUUsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSTt3QkFDL0IsUUFBUSxFQUFFLEVBQUUsQ0FBQyxJQUFJO3dCQUNqQixVQUFVLEVBQUUsRUFBRSxDQUFDLE1BQU07d0JBQ3JCLE1BQU07d0JBQ04sUUFBUSxFQUFFOzRCQUNSLElBQUksRUFBRSxFQUFFLENBQUMsb0JBQW9CLENBQUMsVUFBVTs0QkFDeEMsSUFBSSxFQUFFLElBQUk7NEJBQ1YsVUFBVSxFQUFFLEVBQUUsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSTt5QkFDdEM7cUJBQ0YsQ0FBQyxDQUFDO2dCQUNMLENBQUM7Z0JBQ0QsTUFBTTtRQUNWLENBQUM7SUFDSCxDQUFDO0lBRUQsT0FBTyxLQUFLLENBQUM7QUFDZixDQUFDO0FBRUQ7Ozs7O0dBS0c7QUFDSCxTQUFTLCtCQUErQixDQUNwQyxJQUF5QixFQUFFLEtBQVk7SUFDekMsTUFBTSxNQUFNLEdBQWlDLEVBQUUsQ0FBQztJQUVoRCxJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzdCLGdHQUFnRztRQUNoRywyRkFBMkY7UUFDM0Ysd0VBQXdFO1FBQ3hFLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLGdCQUFnQixDQUMzQixJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxFQUFFLEtBQUssQ0FBQyxtQkFBbUIsRUFBRSxJQUFJLEVBQUUsQ0FBQyxlQUFlLEVBQUUsRUFDOUUsRUFBRSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQzlCLENBQUM7SUFFRCwwRUFBMEU7SUFDMUUsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUUsQ0FBQztJQUNsRCxLQUFLLE1BQU0sQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUksU0FBUyxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFDdkQsTUFBTSxPQUFPLEdBQUcsSUFBSSxFQUFFLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMvQyx3RkFBd0Y7UUFDeEYsTUFBTSxRQUFRLEdBQUcsS0FBSyxLQUFLLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNyRixnQ0FBZ0M7UUFDaEMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLENBQzNCLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLEVBQUUsS0FBSyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUUsRUFBRSxRQUFRLEVBQ3RFLEVBQUUsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUM5QixDQUFDO0lBRUQsS0FBSyxNQUFNLEtBQUssSUFBSSxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDdEMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLENBQzNCLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO0lBQ2xHLENBQUM7SUFFRCw4RUFBOEU7SUFDOUUsS0FBSyxNQUFNLEdBQUcsSUFBSSxLQUFLLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDbkMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLENBQzNCLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLEVBQUUsR0FBRyxDQUFDLFFBQVEsRUFDdkMsSUFBSSxFQUFFLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLFVBQVUsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQzlGLENBQUM7SUFFRCxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssSUFBSSxFQUFFLENBQUM7UUFDMUIsbURBQW1EO1FBQ25ELE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRywrQkFBK0IsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDdEUsQ0FBQztJQUNELE9BQU8sTUFBTSxDQUFDO0FBQ2hCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgbyBmcm9tICcuLi8uLi8uLi8uLi9vdXRwdXQvb3V0cHV0X2FzdCc7XG5pbXBvcnQgKiBhcyBpciBmcm9tICcuLi8uLi9pcic7XG5cbmltcG9ydCB0eXBlIHtDb21wb25lbnRDb21waWxhdGlvbkpvYiwgVmlld0NvbXBpbGF0aW9uVW5pdH0gZnJvbSAnLi4vY29tcGlsYXRpb24nO1xuXG4vKipcbiAqIEdlbmVyYXRlIGEgcHJlYW1ibGUgc2VxdWVuY2UgZm9yIGVhY2ggdmlldyBjcmVhdGlvbiBibG9jayBhbmQgbGlzdGVuZXIgZnVuY3Rpb24gd2hpY2ggZGVjbGFyZXNcbiAqIGFueSB2YXJpYWJsZXMgdGhhdCBiZSByZWZlcmVuY2VkIGluIG90aGVyIG9wZXJhdGlvbnMgaW4gdGhlIGJsb2NrLlxuICpcbiAqIFZhcmlhYmxlcyBnZW5lcmF0ZWQgaW5jbHVkZTpcbiAqICAgKiBhIHNhdmVkIHZpZXcgY29udGV4dCB0byBiZSB1c2VkIHRvIHJlc3RvcmUgdGhlIGN1cnJlbnQgdmlldyBpbiBldmVudCBsaXN0ZW5lcnMuXG4gKiAgICogdGhlIGNvbnRleHQgb2YgdGhlIHJlc3RvcmVkIHZpZXcgd2l0aGluIGV2ZW50IGxpc3RlbmVyIGhhbmRsZXJzLlxuICogICAqIGNvbnRleHQgdmFyaWFibGVzIGZyb20gdGhlIGN1cnJlbnQgdmlldyBhcyB3ZWxsIGFzIGFsbCBwYXJlbnQgdmlld3MgKGluY2x1ZGluZyB0aGUgcm9vdFxuICogICAgIGNvbnRleHQgaWYgbmVlZGVkKS5cbiAqICAgKiBsb2NhbCByZWZlcmVuY2VzIGZyb20gZWxlbWVudHMgd2l0aGluIHRoZSBjdXJyZW50IHZpZXcgYW5kIGFueSBsZXhpY2FsIHBhcmVudHMuXG4gKlxuICogVmFyaWFibGVzIGFyZSBnZW5lcmF0ZWQgaGVyZSB1bmNvbmRpdGlvbmFsbHksIGFuZCBtYXkgb3B0aW1pemVkIGF3YXkgaW4gZnV0dXJlIG9wZXJhdGlvbnMgaWYgaXRcbiAqIHR1cm5zIG91dCB0aGVpciB2YWx1ZXMgKGFuZCBhbnkgc2lkZSBlZmZlY3RzKSBhcmUgdW51c2VkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVWYXJpYWJsZXMoam9iOiBDb21wb25lbnRDb21waWxhdGlvbkpvYik6IHZvaWQge1xuICByZWN1cnNpdmVseVByb2Nlc3NWaWV3KGpvYi5yb290LCAvKiB0aGVyZSBpcyBubyBwYXJlbnQgc2NvcGUgZm9yIHRoZSByb290IHZpZXcgKi8gbnVsbCk7XG59XG5cbi8qKlxuICogUHJvY2VzcyB0aGUgZ2l2ZW4gYFZpZXdDb21waWxhdGlvbmAgYW5kIGdlbmVyYXRlIHByZWFtYmxlcyBmb3IgaXQgYW5kIGFueSBsaXN0ZW5lcnMgdGhhdCBpdFxuICogZGVjbGFyZXMuXG4gKlxuICogQHBhcmFtIGBwYXJlbnRTY29wZWAgYSBzY29wZSBleHRyYWN0ZWQgZnJvbSB0aGUgcGFyZW50IHZpZXcgd2hpY2ggY2FwdHVyZXMgYW55IHZhcmlhYmxlcyB3aGljaFxuICogICAgIHNob3VsZCBiZSBpbmhlcml0ZWQgYnkgdGhpcyB2aWV3LiBgbnVsbGAgaWYgdGhlIGN1cnJlbnQgdmlldyBpcyB0aGUgcm9vdCB2aWV3LlxuICovXG5mdW5jdGlvbiByZWN1cnNpdmVseVByb2Nlc3NWaWV3KHZpZXc6IFZpZXdDb21waWxhdGlvblVuaXQsIHBhcmVudFNjb3BlOiBTY29wZXxudWxsKTogdm9pZCB7XG4gIC8vIEV4dHJhY3QgYSBgU2NvcGVgIGZyb20gdGhpcyB2aWV3LlxuICBjb25zdCBzY29wZSA9IGdldFNjb3BlRm9yVmlldyh2aWV3LCBwYXJlbnRTY29wZSk7XG5cbiAgZm9yIChjb25zdCBvcCBvZiB2aWV3LmNyZWF0ZSkge1xuICAgIHN3aXRjaCAob3Aua2luZCkge1xuICAgICAgY2FzZSBpci5PcEtpbmQuVGVtcGxhdGU6XG4gICAgICAgIC8vIERlc2NlbmQgaW50byBjaGlsZCBlbWJlZGRlZCB2aWV3cy5cbiAgICAgICAgcmVjdXJzaXZlbHlQcm9jZXNzVmlldyh2aWV3LmpvYi52aWV3cy5nZXQob3AueHJlZikhLCBzY29wZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBpci5PcEtpbmQuUmVwZWF0ZXJDcmVhdGU6XG4gICAgICAgIC8vIERlc2NlbmQgaW50byBjaGlsZCBlbWJlZGRlZCB2aWV3cy5cbiAgICAgICAgcmVjdXJzaXZlbHlQcm9jZXNzVmlldyh2aWV3LmpvYi52aWV3cy5nZXQob3AueHJlZikhLCBzY29wZSk7XG4gICAgICAgIGlmIChvcC5lbXB0eVZpZXcpIHtcbiAgICAgICAgICByZWN1cnNpdmVseVByb2Nlc3NWaWV3KHZpZXcuam9iLnZpZXdzLmdldChvcC5lbXB0eVZpZXcpISwgc2NvcGUpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBpci5PcEtpbmQuTGlzdGVuZXI6XG4gICAgICBjYXNlIGlyLk9wS2luZC5Ud29XYXlMaXN0ZW5lcjpcbiAgICAgICAgLy8gUHJlcGVuZCB2YXJpYWJsZXMgdG8gbGlzdGVuZXIgaGFuZGxlciBmdW5jdGlvbnMuXG4gICAgICAgIG9wLmhhbmRsZXJPcHMucHJlcGVuZChnZW5lcmF0ZVZhcmlhYmxlc0luU2NvcGVGb3JWaWV3KHZpZXcsIHNjb3BlKSk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIC8vIFByZXBlbmQgdGhlIGRlY2xhcmF0aW9ucyBmb3IgYWxsIGF2YWlsYWJsZSB2YXJpYWJsZXMgaW4gc2NvcGUgdG8gdGhlIGB1cGRhdGVgIGJsb2NrLlxuICBjb25zdCBwcmVhbWJsZU9wcyA9IGdlbmVyYXRlVmFyaWFibGVzSW5TY29wZUZvclZpZXcodmlldywgc2NvcGUpO1xuICB2aWV3LnVwZGF0ZS5wcmVwZW5kKHByZWFtYmxlT3BzKTtcbn1cblxuLyoqXG4gKiBMZXhpY2FsIHNjb3BlIG9mIGEgdmlldywgaW5jbHVkaW5nIGEgcmVmZXJlbmNlIHRvIGl0cyBwYXJlbnQgdmlldydzIHNjb3BlLCBpZiBhbnkuXG4gKi9cbmludGVyZmFjZSBTY29wZSB7XG4gIC8qKlxuICAgKiBgWHJlZklkYCBvZiB0aGUgdmlldyB0byB3aGljaCB0aGlzIHNjb3BlIGNvcnJlc3BvbmRzLlxuICAgKi9cbiAgdmlldzogaXIuWHJlZklkO1xuXG4gIHZpZXdDb250ZXh0VmFyaWFibGU6IGlyLlNlbWFudGljVmFyaWFibGU7XG5cbiAgY29udGV4dFZhcmlhYmxlczogTWFwPHN0cmluZywgaXIuU2VtYW50aWNWYXJpYWJsZT47XG5cbiAgYWxpYXNlczogU2V0PGlyLkFsaWFzVmFyaWFibGU+O1xuXG4gIC8qKlxuICAgKiBMb2NhbCByZWZlcmVuY2VzIGNvbGxlY3RlZCBmcm9tIGVsZW1lbnRzIHdpdGhpbiB0aGUgdmlldy5cbiAgICovXG4gIHJlZmVyZW5jZXM6IFJlZmVyZW5jZVtdO1xuXG4gIC8qKlxuICAgKiBgU2NvcGVgIG9mIHRoZSBwYXJlbnQgdmlldywgaWYgYW55LlxuICAgKi9cbiAgcGFyZW50OiBTY29wZXxudWxsO1xufVxuXG4vKipcbiAqIEluZm9ybWF0aW9uIG5lZWRlZCBhYm91dCBhIGxvY2FsIHJlZmVyZW5jZSBjb2xsZWN0ZWQgZnJvbSBhbiBlbGVtZW50IHdpdGhpbiBhIHZpZXcuXG4gKi9cbmludGVyZmFjZSBSZWZlcmVuY2Uge1xuICAvKipcbiAgICogTmFtZSBnaXZlbiB0byB0aGUgbG9jYWwgcmVmZXJlbmNlIHZhcmlhYmxlIHdpdGhpbiB0aGUgdGVtcGxhdGUuXG4gICAqXG4gICAqIFRoaXMgaXMgbm90IHRoZSBuYW1lIHdoaWNoIHdpbGwgYmUgdXNlZCBmb3IgdGhlIHZhcmlhYmxlIGRlY2xhcmF0aW9uIGluIHRoZSBnZW5lcmF0ZWRcbiAgICogdGVtcGxhdGUgY29kZS5cbiAgICovXG4gIG5hbWU6IHN0cmluZztcblxuICAvKipcbiAgICogYFhyZWZJZGAgb2YgdGhlIGVsZW1lbnQtbGlrZSBub2RlIHdoaWNoIHRoaXMgcmVmZXJlbmNlIHRhcmdldHMuXG4gICAqXG4gICAqIFRoZSByZWZlcmVuY2UgbWF5IGJlIGVpdGhlciB0byB0aGUgZWxlbWVudCAob3IgdGVtcGxhdGUpIGl0c2VsZiwgb3IgdG8gYSBkaXJlY3RpdmUgb24gaXQuXG4gICAqL1xuICB0YXJnZXRJZDogaXIuWHJlZklkO1xuXG4gIHRhcmdldFNsb3Q6IGlyLlNsb3RIYW5kbGU7XG5cbiAgLyoqXG4gICAqIEEgZ2VuZXJhdGVkIG9mZnNldCBvZiB0aGlzIHJlZmVyZW5jZSBhbW9uZyBhbGwgdGhlIHJlZmVyZW5jZXMgb24gYSBzcGVjaWZpYyBlbGVtZW50LlxuICAgKi9cbiAgb2Zmc2V0OiBudW1iZXI7XG5cbiAgdmFyaWFibGU6IGlyLlNlbWFudGljVmFyaWFibGU7XG59XG5cbi8qKlxuICogUHJvY2VzcyBhIHZpZXcgYW5kIGdlbmVyYXRlIGEgYFNjb3BlYCByZXByZXNlbnRpbmcgdGhlIHZhcmlhYmxlcyBhdmFpbGFibGUgZm9yIHJlZmVyZW5jZSB3aXRoaW5cbiAqIHRoYXQgdmlldy5cbiAqL1xuZnVuY3Rpb24gZ2V0U2NvcGVGb3JWaWV3KHZpZXc6IFZpZXdDb21waWxhdGlvblVuaXQsIHBhcmVudDogU2NvcGV8bnVsbCk6IFNjb3BlIHtcbiAgY29uc3Qgc2NvcGU6IFNjb3BlID0ge1xuICAgIHZpZXc6IHZpZXcueHJlZixcbiAgICB2aWV3Q29udGV4dFZhcmlhYmxlOiB7XG4gICAgICBraW5kOiBpci5TZW1hbnRpY1ZhcmlhYmxlS2luZC5Db250ZXh0LFxuICAgICAgbmFtZTogbnVsbCxcbiAgICAgIHZpZXc6IHZpZXcueHJlZixcbiAgICB9LFxuICAgIGNvbnRleHRWYXJpYWJsZXM6IG5ldyBNYXA8c3RyaW5nLCBpci5TZW1hbnRpY1ZhcmlhYmxlPigpLFxuICAgIGFsaWFzZXM6IHZpZXcuYWxpYXNlcyxcbiAgICByZWZlcmVuY2VzOiBbXSxcbiAgICBwYXJlbnQsXG4gIH07XG5cbiAgZm9yIChjb25zdCBpZGVudGlmaWVyIG9mIHZpZXcuY29udGV4dFZhcmlhYmxlcy5rZXlzKCkpIHtcbiAgICBzY29wZS5jb250ZXh0VmFyaWFibGVzLnNldChpZGVudGlmaWVyLCB7XG4gICAgICBraW5kOiBpci5TZW1hbnRpY1ZhcmlhYmxlS2luZC5JZGVudGlmaWVyLFxuICAgICAgbmFtZTogbnVsbCxcbiAgICAgIGlkZW50aWZpZXIsXG4gICAgfSk7XG4gIH1cblxuICBmb3IgKGNvbnN0IG9wIG9mIHZpZXcuY3JlYXRlKSB7XG4gICAgc3dpdGNoIChvcC5raW5kKSB7XG4gICAgICBjYXNlIGlyLk9wS2luZC5FbGVtZW50U3RhcnQ6XG4gICAgICBjYXNlIGlyLk9wS2luZC5UZW1wbGF0ZTpcbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KG9wLmxvY2FsUmVmcykpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEFzc2VydGlvbkVycm9yOiBleHBlY3RlZCBsb2NhbFJlZnMgdG8gYmUgYW4gYXJyYXlgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlY29yZCBhdmFpbGFibGUgbG9jYWwgcmVmZXJlbmNlcyBmcm9tIHRoaXMgZWxlbWVudC5cbiAgICAgICAgZm9yIChsZXQgb2Zmc2V0ID0gMDsgb2Zmc2V0IDwgb3AubG9jYWxSZWZzLmxlbmd0aDsgb2Zmc2V0KyspIHtcbiAgICAgICAgICBzY29wZS5yZWZlcmVuY2VzLnB1c2goe1xuICAgICAgICAgICAgbmFtZTogb3AubG9jYWxSZWZzW29mZnNldF0ubmFtZSxcbiAgICAgICAgICAgIHRhcmdldElkOiBvcC54cmVmLFxuICAgICAgICAgICAgdGFyZ2V0U2xvdDogb3AuaGFuZGxlLFxuICAgICAgICAgICAgb2Zmc2V0LFxuICAgICAgICAgICAgdmFyaWFibGU6IHtcbiAgICAgICAgICAgICAga2luZDogaXIuU2VtYW50aWNWYXJpYWJsZUtpbmQuSWRlbnRpZmllcixcbiAgICAgICAgICAgICAgbmFtZTogbnVsbCxcbiAgICAgICAgICAgICAgaWRlbnRpZmllcjogb3AubG9jYWxSZWZzW29mZnNldF0ubmFtZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHNjb3BlO1xufVxuXG4vKipcbiAqIEdlbmVyYXRlIGRlY2xhcmF0aW9ucyBmb3IgYWxsIHZhcmlhYmxlcyB0aGF0IGFyZSBpbiBzY29wZSBmb3IgYSBnaXZlbiB2aWV3LlxuICpcbiAqIFRoaXMgaXMgYSByZWN1cnNpdmUgcHJvY2VzcywgYXMgdmlld3MgaW5oZXJpdCB2YXJpYWJsZXMgYXZhaWxhYmxlIGZyb20gdGhlaXIgcGFyZW50IHZpZXcsIHdoaWNoXG4gKiBpdHNlbGYgbWF5IGhhdmUgaW5oZXJpdGVkIHZhcmlhYmxlcywgZXRjLlxuICovXG5mdW5jdGlvbiBnZW5lcmF0ZVZhcmlhYmxlc0luU2NvcGVGb3JWaWV3KFxuICAgIHZpZXc6IFZpZXdDb21waWxhdGlvblVuaXQsIHNjb3BlOiBTY29wZSk6IGlyLlZhcmlhYmxlT3A8aXIuVXBkYXRlT3A+W10ge1xuICBjb25zdCBuZXdPcHM6IGlyLlZhcmlhYmxlT3A8aXIuVXBkYXRlT3A+W10gPSBbXTtcblxuICBpZiAoc2NvcGUudmlldyAhPT0gdmlldy54cmVmKSB7XG4gICAgLy8gQmVmb3JlIGdlbmVyYXRpbmcgdmFyaWFibGVzIGZvciBhIHBhcmVudCB2aWV3LCB3ZSBuZWVkIHRvIHN3aXRjaCB0byB0aGUgY29udGV4dCBvZiB0aGUgcGFyZW50XG4gICAgLy8gdmlldyB3aXRoIGEgYG5leHRDb250ZXh0YCBleHByZXNzaW9uLiBUaGlzIGNvbnRleHQgc3dpdGNoaW5nIG9wZXJhdGlvbiBpdHNlbGYgZGVjbGFyZXMgYVxuICAgIC8vIHZhcmlhYmxlLCBiZWNhdXNlIHRoZSBjb250ZXh0IG9mIHRoZSB2aWV3IG1heSBiZSByZWZlcmVuY2VkIGRpcmVjdGx5LlxuICAgIG5ld09wcy5wdXNoKGlyLmNyZWF0ZVZhcmlhYmxlT3AoXG4gICAgICAgIHZpZXcuam9iLmFsbG9jYXRlWHJlZklkKCksIHNjb3BlLnZpZXdDb250ZXh0VmFyaWFibGUsIG5ldyBpci5OZXh0Q29udGV4dEV4cHIoKSxcbiAgICAgICAgaXIuVmFyaWFibGVGbGFncy5Ob25lKSk7XG4gIH1cblxuICAvLyBBZGQgdmFyaWFibGVzIGZvciBhbGwgY29udGV4dCB2YXJpYWJsZXMgYXZhaWxhYmxlIGluIHRoaXMgc2NvcGUncyB2aWV3LlxuICBjb25zdCBzY29wZVZpZXcgPSB2aWV3LmpvYi52aWV3cy5nZXQoc2NvcGUudmlldykhO1xuICBmb3IgKGNvbnN0IFtuYW1lLCB2YWx1ZV0gb2Ygc2NvcGVWaWV3LmNvbnRleHRWYXJpYWJsZXMpIHtcbiAgICBjb25zdCBjb250ZXh0ID0gbmV3IGlyLkNvbnRleHRFeHByKHNjb3BlLnZpZXcpO1xuICAgIC8vIFdlIGVpdGhlciByZWFkIHRoZSBjb250ZXh0LCBvciwgaWYgdGhlIHZhcmlhYmxlIGlzIENUWF9SRUYsIHVzZSB0aGUgY29udGV4dCBkaXJlY3RseS5cbiAgICBjb25zdCB2YXJpYWJsZSA9IHZhbHVlID09PSBpci5DVFhfUkVGID8gY29udGV4dCA6IG5ldyBvLlJlYWRQcm9wRXhwcihjb250ZXh0LCB2YWx1ZSk7XG4gICAgLy8gQWRkIHRoZSB2YXJpYWJsZSBkZWNsYXJhdGlvbi5cbiAgICBuZXdPcHMucHVzaChpci5jcmVhdGVWYXJpYWJsZU9wKFxuICAgICAgICB2aWV3LmpvYi5hbGxvY2F0ZVhyZWZJZCgpLCBzY29wZS5jb250ZXh0VmFyaWFibGVzLmdldChuYW1lKSEsIHZhcmlhYmxlLFxuICAgICAgICBpci5WYXJpYWJsZUZsYWdzLk5vbmUpKTtcbiAgfVxuXG4gIGZvciAoY29uc3QgYWxpYXMgb2Ygc2NvcGVWaWV3LmFsaWFzZXMpIHtcbiAgICBuZXdPcHMucHVzaChpci5jcmVhdGVWYXJpYWJsZU9wKFxuICAgICAgICB2aWV3LmpvYi5hbGxvY2F0ZVhyZWZJZCgpLCBhbGlhcywgYWxpYXMuZXhwcmVzc2lvbi5jbG9uZSgpLCBpci5WYXJpYWJsZUZsYWdzLkFsd2F5c0lubGluZSkpO1xuICB9XG5cbiAgLy8gQWRkIHZhcmlhYmxlcyBmb3IgYWxsIGxvY2FsIHJlZmVyZW5jZXMgZGVjbGFyZWQgZm9yIGVsZW1lbnRzIGluIHRoaXMgc2NvcGUuXG4gIGZvciAoY29uc3QgcmVmIG9mIHNjb3BlLnJlZmVyZW5jZXMpIHtcbiAgICBuZXdPcHMucHVzaChpci5jcmVhdGVWYXJpYWJsZU9wKFxuICAgICAgICB2aWV3LmpvYi5hbGxvY2F0ZVhyZWZJZCgpLCByZWYudmFyaWFibGUsXG4gICAgICAgIG5ldyBpci5SZWZlcmVuY2VFeHByKHJlZi50YXJnZXRJZCwgcmVmLnRhcmdldFNsb3QsIHJlZi5vZmZzZXQpLCBpci5WYXJpYWJsZUZsYWdzLk5vbmUpKTtcbiAgfVxuXG4gIGlmIChzY29wZS5wYXJlbnQgIT09IG51bGwpIHtcbiAgICAvLyBSZWN1cnNpdmVseSBhZGQgdmFyaWFibGVzIGZyb20gdGhlIHBhcmVudCBzY29wZS5cbiAgICBuZXdPcHMucHVzaCguLi5nZW5lcmF0ZVZhcmlhYmxlc0luU2NvcGVGb3JWaWV3KHZpZXcsIHNjb3BlLnBhcmVudCkpO1xuICB9XG4gIHJldHVybiBuZXdPcHM7XG59XG4iXX0=