/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as ir from '../../ir';
import { ComponentCompilationJob } from '../compilation';
/**
 * Counts the number of variable slots used within each view, and stores that on the view itself, as
 * well as propagates it to the `ir.TemplateOp` for embedded views.
 */
export function countVariables(job) {
    // First, count the vars used in each view, and update the view-level counter.
    for (const unit of job.units) {
        let varCount = 0;
        // Count variables on top-level ops first. Don't explore nested expressions just yet.
        for (const op of unit.ops()) {
            if (ir.hasConsumesVarsTrait(op)) {
                varCount += varsUsedByOp(op);
            }
        }
        // Count variables on expressions inside ops. We do this later because some of these expressions
        // might be conditional (e.g. `pipeBinding` inside of a ternary), and we don't want to interfere
        // with indices for top-level binding slots (e.g. `property`).
        for (const op of unit.ops()) {
            ir.visitExpressionsInOp(op, (expr) => {
                if (!ir.isIrExpression(expr)) {
                    return;
                }
                // TemplateDefinitionBuilder assigns variable offsets for everything but pure functions
                // first, and then assigns offsets to pure functions lazily. We emulate that behavior by
                // assigning offsets in two passes instead of one, only in compatibility mode.
                if (job.compatibility === ir.CompatibilityMode.TemplateDefinitionBuilder &&
                    expr instanceof ir.PureFunctionExpr) {
                    return;
                }
                // Some expressions require knowledge of the number of variable slots consumed.
                if (ir.hasUsesVarOffsetTrait(expr)) {
                    expr.varOffset = varCount;
                }
                if (ir.hasConsumesVarsTrait(expr)) {
                    varCount += varsUsedByIrExpression(expr);
                }
            });
        }
        // Compatibility mode pass for pure function offsets (as explained above).
        if (job.compatibility === ir.CompatibilityMode.TemplateDefinitionBuilder) {
            for (const op of unit.ops()) {
                ir.visitExpressionsInOp(op, (expr) => {
                    if (!ir.isIrExpression(expr) || !(expr instanceof ir.PureFunctionExpr)) {
                        return;
                    }
                    // Some expressions require knowledge of the number of variable slots consumed.
                    if (ir.hasUsesVarOffsetTrait(expr)) {
                        expr.varOffset = varCount;
                    }
                    if (ir.hasConsumesVarsTrait(expr)) {
                        varCount += varsUsedByIrExpression(expr);
                    }
                });
            }
        }
        unit.vars = varCount;
    }
    if (job instanceof ComponentCompilationJob) {
        // Add var counts for each view to the `ir.TemplateOp` which declares that view (if the view is
        // an embedded view).
        for (const unit of job.units) {
            for (const op of unit.create) {
                if (op.kind !== ir.OpKind.Template && op.kind !== ir.OpKind.RepeaterCreate) {
                    continue;
                }
                const childView = job.views.get(op.xref);
                op.vars = childView.vars;
                // TODO: currently we handle the vars for the RepeaterCreate empty template in the reify
                // phase. We should handle that here instead.
            }
        }
    }
}
/**
 * Different operations that implement `ir.UsesVarsTrait` use different numbers of variables, so
 * count the variables used by any particular `op`.
 */
function varsUsedByOp(op) {
    let slots;
    switch (op.kind) {
        case ir.OpKind.Property:
        case ir.OpKind.HostProperty:
        case ir.OpKind.Attribute:
            // All of these bindings use 1 variable slot, plus 1 slot for every interpolated expression,
            // if any.
            slots = 1;
            if (op.expression instanceof ir.Interpolation && !isSingletonInterpolation(op.expression)) {
                slots += op.expression.expressions.length;
            }
            return slots;
        case ir.OpKind.TwoWayProperty:
            // Two-way properties can only have expressions so they only need one variable slot.
            return 1;
        case ir.OpKind.StyleProp:
        case ir.OpKind.ClassProp:
        case ir.OpKind.StyleMap:
        case ir.OpKind.ClassMap:
            // Style & class bindings use 2 variable slots, plus 1 slot for every interpolated expression,
            // if any.
            slots = 2;
            if (op.expression instanceof ir.Interpolation) {
                slots += op.expression.expressions.length;
            }
            return slots;
        case ir.OpKind.InterpolateText:
            // `ir.InterpolateTextOp`s use a variable slot for each dynamic expression.
            return op.interpolation.expressions.length;
        case ir.OpKind.I18nExpression:
        case ir.OpKind.Conditional:
        case ir.OpKind.DeferWhen:
        case ir.OpKind.StoreLet:
            return 1;
        case ir.OpKind.RepeaterCreate:
            // Repeaters may require an extra variable binding slot, if they have an empty view, for the
            // empty block tracking.
            // TODO: It's a bit odd to have a create mode instruction consume variable slots. Maybe we can
            // find a way to use the Repeater update op instead.
            return op.emptyView ? 1 : 0;
        default:
            throw new Error(`Unhandled op: ${ir.OpKind[op.kind]}`);
    }
}
export function varsUsedByIrExpression(expr) {
    switch (expr.kind) {
        case ir.ExpressionKind.PureFunctionExpr:
            return 1 + expr.args.length;
        case ir.ExpressionKind.PipeBinding:
            return 1 + expr.args.length;
        case ir.ExpressionKind.PipeBindingVariadic:
            return 1 + expr.numArgs;
        case ir.ExpressionKind.StoreLet:
            return 1;
        default:
            throw new Error(`AssertionError: unhandled ConsumesVarsTrait expression ${expr.constructor.name}`);
    }
}
function isSingletonInterpolation(expr) {
    if (expr.expressions.length !== 1 || expr.strings.length !== 2) {
        return false;
    }
    if (expr.strings[0] !== '' || expr.strings[1] !== '') {
        return false;
    }
    return true;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFyX2NvdW50aW5nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3RlbXBsYXRlL3BpcGVsaW5lL3NyYy9waGFzZXMvdmFyX2NvdW50aW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sS0FBSyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBQy9CLE9BQU8sRUFBaUIsdUJBQXVCLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUV2RTs7O0dBR0c7QUFDSCxNQUFNLFVBQVUsY0FBYyxDQUFDLEdBQW1CO0lBQ2hELDhFQUE4RTtJQUM5RSxLQUFLLE1BQU0sSUFBSSxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM3QixJQUFJLFFBQVEsR0FBRyxDQUFDLENBQUM7UUFFakIscUZBQXFGO1FBQ3JGLEtBQUssTUFBTSxFQUFFLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUM7WUFDNUIsSUFBSSxFQUFFLENBQUMsb0JBQW9CLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDaEMsUUFBUSxJQUFJLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUMvQixDQUFDO1FBQ0gsQ0FBQztRQUVELGdHQUFnRztRQUNoRyxnR0FBZ0c7UUFDaEcsOERBQThEO1FBQzlELEtBQUssTUFBTSxFQUFFLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUM7WUFDNUIsRUFBRSxDQUFDLG9CQUFvQixDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFO2dCQUNuQyxJQUFJLENBQUMsRUFBRSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO29CQUM3QixPQUFPO2dCQUNULENBQUM7Z0JBRUQsdUZBQXVGO2dCQUN2Rix3RkFBd0Y7Z0JBQ3hGLDhFQUE4RTtnQkFDOUUsSUFDRSxHQUFHLENB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QUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQztRQUNyRCxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFDRCxPQUFPLElBQUksQ0FBQztBQUNkLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIGlyIGZyb20gJy4uLy4uL2lyJztcbmltcG9ydCB7Q29tcGlsYXRpb25Kb2IsIENvbXBvbmVudENvbXBpbGF0aW9uSm9ifSBmcm9tICcuLi9jb21waWxhdGlvbic7XG5cbi8qKlxuICogQ291bnRzIHRoZSBudW1iZXIgb2YgdmFyaWFibGUgc2xvdHMgdXNlZCB3aXRoaW4gZWFjaCB2aWV3LCBhbmQgc3RvcmVzIHRoYXQgb24gdGhlIHZpZXcgaXRzZWxmLCBhc1xuICogd2VsbCBhcyBwcm9wYWdhdGVzIGl0IHRvIHRoZSBgaXIuVGVtcGxhdGVPcGAgZm9yIGVtYmVkZGVkIHZpZXdzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY291bnRWYXJpYWJsZXMoam9iOiBDb21waWxhdGlvbkpvYik6IHZvaWQge1xuICAvLyBGaXJzdCwgY291bnQgdGhlIHZhcnMgdXNlZCBpbiBlYWNoIHZpZXcsIGFuZCB1cGRhdGUgdGhlIHZpZXctbGV2ZWwgY291bnRlci5cbiAgZm9yIChjb25zdCB1bml0IG9mIGpvYi51bml0cykge1xuICAgIGxldCB2YXJDb3VudCA9IDA7XG5cbiAgICAvLyBDb3VudCB2YXJpYWJsZXMgb24gdG9wLWxldmVsIG9wcyBmaXJzdC4gRG9uJ3QgZXhwbG9yZSBuZXN0ZWQgZXhwcmVzc2lvbnMganVzdCB5ZXQuXG4gICAgZm9yIChjb25zdCBvcCBvZiB1bml0Lm9wcygpKSB7XG4gICAgICBpZiAoaXIuaGFzQ29uc3VtZXNWYXJzVHJhaXQob3ApKSB7XG4gICAgICAgIHZhckNvdW50ICs9IHZhcnNVc2VkQnlPcChvcCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQ291bnQgdmFyaWFibGVzIG9uIGV4cHJlc3Npb25zIGluc2lkZSBvcHMuIFdlIGRvIHRoaXMgbGF0ZXIgYmVjYXVzZSBzb21lIG9mIHRoZXNlIGV4cHJlc3Npb25zXG4gICAgLy8gbWlnaHQgYmUgY29uZGl0aW9uYWwgKGUuZy4gYHBpcGVCaW5kaW5nYCBpbnNpZGUgb2YgYSB0ZXJuYXJ5KSwgYW5kIHdlIGRvbid0IHdhbnQgdG8gaW50ZXJmZXJlXG4gICAgLy8gd2l0aCBpbmRpY2VzIGZvciB0b3AtbGV2ZWwgYmluZGluZyBzbG90cyAoZS5nLiBgcHJvcGVydHlgKS5cbiAgICBmb3IgKGNvbnN0IG9wIG9mIHVuaXQub3BzKCkpIHtcbiAgICAgIGlyLnZpc2l0RXhwcmVzc2lvbnNJbk9wKG9wLCAoZXhwcikgPT4ge1xuICAgICAgICBpZiAoIWlyLmlzSXJFeHByZXNzaW9uKGV4cHIpKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGVtcGxhdGVEZWZpbml0aW9uQnVpbGRlciBhc3NpZ25zIHZhcmlhYmxlIG9mZnNldHMgZm9yIGV2ZXJ5dGhpbmcgYnV0IHB1cmUgZnVuY3Rpb25zXG4gICAgICAgIC8vIGZpcnN0LCBhbmQgdGhlbiBhc3NpZ25zIG9mZnNldHMgdG8gcHVyZSBmdW5jdGlvbnMgbGF6aWx5LiBXZSBlbXVsYXRlIHRoYXQgYmVoYXZpb3IgYnlcbiAgICAgICAgLy8gYXNzaWduaW5nIG9mZnNldHMgaW4gdHdvIHBhc3NlcyBpbnN0ZWFkIG9mIG9uZSwgb25seSBpbiBjb21wYXRpYmlsaXR5IG1vZGUuXG4gICAgICAgIGlmIChcbiAgICAgICAgICBqb2IuY29tcGF0aWJpbGl0eSA9PT0gaXIuQ29tcGF0aWJpbGl0eU1vZGUuVGVtcGxhdGVEZWZpbml0aW9uQnVpbGRlciAmJlxuICAgICAgICAgIGV4cHIgaW5zdGFuY2VvZiBpci5QdXJlRnVuY3Rpb25FeHByXG4gICAgICAgICkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNvbWUgZXhwcmVzc2lvbnMgcmVxdWlyZSBrbm93bGVkZ2Ugb2YgdGhlIG51bWJlciBvZiB2YXJpYWJsZSBzbG90cyBjb25zdW1lZC5cbiAgICAgICAgaWYgKGlyLmhhc1VzZXNWYXJPZmZzZXRUcmFpdChleHByKSkge1xuICAgICAgICAgIGV4cHIudmFyT2Zmc2V0ID0gdmFyQ291bnQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaXIuaGFzQ29uc3VtZXNWYXJzVHJhaXQoZXhwcikpIHtcbiAgICAgICAgICB2YXJDb3VudCArPSB2YXJzVXNlZEJ5SXJFeHByZXNzaW9uKGV4cHIpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBDb21wYXRpYmlsaXR5IG1vZGUgcGFzcyBmb3IgcHVyZSBmdW5jdGlvbiBvZmZzZXRzIChhcyBleHBsYWluZWQgYWJvdmUpLlxuICAgIGlmIChqb2IuY29tcGF0aWJpbGl0eSA9PT0gaXIuQ29tcGF0aWJpbGl0eU1vZGUuVGVtcGxhdGVEZWZpbml0aW9uQnVpbGRlcikge1xuICAgICAgZm9yIChjb25zdCBvcCBvZiB1bml0Lm9wcygpKSB7XG4gICAgICAgIGlyLnZpc2l0RXhwcmVzc2lvbnNJbk9wKG9wLCAoZXhwcikgPT4ge1xuICAgICAgICAgIGlmICghaXIuaXNJckV4cHJlc3Npb24oZXhwcikgfHwgIShleHByIGluc3RhbmNlb2YgaXIuUHVyZUZ1bmN0aW9uRXhwcikpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBTb21lIGV4cHJlc3Npb25zIHJlcXVpcmUga25vd2xlZGdlIG9mIHRoZSBudW1iZXIgb2YgdmFyaWFibGUgc2xvdHMgY29uc3VtZWQuXG4gICAgICAgICAgaWYgKGlyLmhhc1VzZXNWYXJPZmZzZXRUcmFpdChleHByKSkge1xuICAgICAgICAgICAgZXhwci52YXJPZmZzZXQgPSB2YXJDb3VudDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoaXIuaGFzQ29uc3VtZXNWYXJzVHJhaXQoZXhwcikpIHtcbiAgICAgICAgICAgIHZhckNvdW50ICs9IHZhcnNVc2VkQnlJckV4cHJlc3Npb24oZXhwcik7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB1bml0LnZhcnMgPSB2YXJDb3VudDtcbiAgfVxuXG4gIGlmIChqb2IgaW5zdGFuY2VvZiBDb21wb25lbnRDb21waWxhdGlvbkpvYikge1xuICAgIC8vIEFkZCB2YXIgY291bnRzIGZvciBlYWNoIHZpZXcgdG8gdGhlIGBpci5UZW1wbGF0ZU9wYCB3aGljaCBkZWNsYXJlcyB0aGF0IHZpZXcgKGlmIHRoZSB2aWV3IGlzXG4gICAgLy8gYW4gZW1iZWRkZWQgdmlldykuXG4gICAgZm9yIChjb25zdCB1bml0IG9mIGpvYi51bml0cykge1xuICAgICAgZm9yIChjb25zdCBvcCBvZiB1bml0LmNyZWF0ZSkge1xuICAgICAgICBpZiAob3Aua2luZCAhPT0gaXIuT3BLaW5kLlRlbXBsYXRlICYmIG9wLmtpbmQgIT09IGlyLk9wS2luZC5SZXBlYXRlckNyZWF0ZSkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY2hpbGRWaWV3ID0gam9iLnZpZXdzLmdldChvcC54cmVmKSE7XG4gICAgICAgIG9wLnZhcnMgPSBjaGlsZFZpZXcudmFycztcblxuICAgICAgICAvLyBUT0RPOiBjdXJyZW50bHkgd2UgaGFuZGxlIHRoZSB2YXJzIGZvciB0aGUgUmVwZWF0ZXJDcmVhdGUgZW1wdHkgdGVtcGxhdGUgaW4gdGhlIHJlaWZ5XG4gICAgICAgIC8vIHBoYXNlLiBXZSBzaG91bGQgaGFuZGxlIHRoYXQgaGVyZSBpbnN0ZWFkLlxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIERpZmZlcmVudCBvcGVyYXRpb25zIHRoYXQgaW1wbGVtZW50IGBpci5Vc2VzVmFyc1RyYWl0YCB1c2UgZGlmZmVyZW50IG51bWJlcnMgb2YgdmFyaWFibGVzLCBzb1xuICogY291bnQgdGhlIHZhcmlhYmxlcyB1c2VkIGJ5IGFueSBwYXJ0aWN1bGFyIGBvcGAuXG4gKi9cbmZ1bmN0aW9uIHZhcnNVc2VkQnlPcChvcDogKGlyLkNyZWF0ZU9wIHwgaXIuVXBkYXRlT3ApICYgaXIuQ29uc3VtZXNWYXJzVHJhaXQpOiBudW1iZXIge1xuICBsZXQgc2xvdHM6IG51bWJlcjtcbiAgc3dpdGNoIChvcC5raW5kKSB7XG4gICAgY2FzZSBpci5PcEtpbmQuUHJvcGVydHk6XG4gICAgY2FzZSBpci5PcEtpbmQuSG9zdFByb3BlcnR5OlxuICAgIGNhc2UgaXIuT3BLaW5kLkF0dHJpYnV0ZTpcbiAgICAgIC8vIEFsbCBvZiB0aGVzZSBiaW5kaW5ncyB1c2UgMSB2YXJpYWJsZSBzbG90LCBwbHVzIDEgc2xvdCBmb3IgZXZlcnkgaW50ZXJwb2xhdGVkIGV4cHJlc3Npb24sXG4gICAgICAvLyBpZiBhbnkuXG4gICAgICBzbG90cyA9IDE7XG4gICAgICBpZiAob3AuZXhwcmVzc2lvbiBpbnN0YW5jZW9mIGlyLkludGVycG9sYXRpb24gJiYgIWlzU2luZ2xldG9uSW50ZXJwb2xhdGlvbihvcC5leHByZXNzaW9uKSkge1xuICAgICAgICBzbG90cyArPSBvcC5leHByZXNzaW9uLmV4cHJlc3Npb25zLmxlbmd0aDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzbG90cztcbiAgICBjYXNlIGlyLk9wS2luZC5Ud29XYXlQcm9wZXJ0eTpcbiAgICAgIC8vIFR3by13YXkgcHJvcGVydGllcyBjYW4gb25seSBoYXZlIGV4cHJlc3Npb25zIHNvIHRoZXkgb25seSBuZWVkIG9uZSB2YXJpYWJsZSBzbG90LlxuICAgICAgcmV0dXJuIDE7XG4gICAgY2FzZSBpci5PcEtpbmQuU3R5bGVQcm9wOlxuICAgIGNhc2UgaXIuT3BLaW5kLkNsYXNzUHJvcDpcbiAgICBjYXNlIGlyLk9wS2luZC5TdHlsZU1hcDpcbiAgICBjYXNlIGlyLk9wS2luZC5DbGFzc01hcDpcbiAgICAgIC8vIFN0eWxlICYgY2xhc3MgYmluZGluZ3MgdXNlIDIgdmFyaWFibGUgc2xvdHMsIHBsdXMgMSBzbG90IGZvciBldmVyeSBpbnRlcnBvbGF0ZWQgZXhwcmVzc2lvbixcbiAgICAgIC8vIGlmIGFueS5cbiAgICAgIHNsb3RzID0gMjtcbiAgICAgIGlmIChvcC5leHByZXNzaW9uIGluc3RhbmNlb2YgaXIuSW50ZXJwb2xhdGlvbikge1xuICAgICAgICBzbG90cyArPSBvcC5leHByZXNzaW9uLmV4cHJlc3Npb25zLmxlbmd0aDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzbG90cztcbiAgICBjYXNlIGlyLk9wS2luZC5JbnRlcnBvbGF0ZVRleHQ6XG4gICAgICAvLyBgaXIuSW50ZXJwb2xhdGVUZXh0T3BgcyB1c2UgYSB2YXJpYWJsZSBzbG90IGZvciBlYWNoIGR5bmFtaWMgZXhwcmVzc2lvbi5cbiAgICAgIHJldHVybiBvcC5pbnRlcnBvbGF0aW9uLmV4cHJlc3Npb25zLmxlbmd0aDtcbiAgICBjYXNlIGlyLk9wS2luZC5JMThuRXhwcmVzc2lvbjpcbiAgICBjYXNlIGlyLk9wS2luZC5Db25kaXRpb25hbDpcbiAgICBjYXNlIGlyLk9wS2luZC5EZWZlcldoZW46XG4gICAgY2FzZSBpci5PcEtpbmQuU3RvcmVMZXQ6XG4gICAgICByZXR1cm4gMTtcbiAgICBjYXNlIGlyLk9wS2luZC5SZXBlYXRlckNyZWF0ZTpcbiAgICAgIC8vIFJlcGVhdGVycyBtYXkgcmVxdWlyZSBhbiBleHRyYSB2YXJpYWJsZSBiaW5kaW5nIHNsb3QsIGlmIHRoZXkgaGF2ZSBhbiBlbXB0eSB2aWV3LCBmb3IgdGhlXG4gICAgICAvLyBlbXB0eSBibG9jayB0cmFja2luZy5cbiAgICAgIC8vIFRPRE86IEl0J3MgYSBiaXQgb2RkIHRvIGhhdmUgYSBjcmVhdGUgbW9kZSBpbnN0cnVjdGlvbiBjb25zdW1lIHZhcmlhYmxlIHNsb3RzLiBNYXliZSB3ZSBjYW5cbiAgICAgIC8vIGZpbmQgYSB3YXkgdG8gdXNlIHRoZSBSZXBlYXRlciB1cGRhdGUgb3AgaW5zdGVhZC5cbiAgICAgIHJldHVybiBvcC5lbXB0eVZpZXcgPyAxIDogMDtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmhhbmRsZWQgb3A6ICR7aXIuT3BLaW5kW29wLmtpbmRdfWApO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2YXJzVXNlZEJ5SXJFeHByZXNzaW9uKGV4cHI6IGlyLkV4cHJlc3Npb24gJiBpci5Db25zdW1lc1ZhcnNUcmFpdCk6IG51bWJlciB7XG4gIHN3aXRjaCAoZXhwci5raW5kKSB7XG4gICAgY2FzZSBpci5FeHByZXNzaW9uS2luZC5QdXJlRnVuY3Rpb25FeHByOlxuICAgICAgcmV0dXJuIDEgKyBleHByLmFyZ3MubGVuZ3RoO1xuICAgIGNhc2UgaXIuRXhwcmVzc2lvbktpbmQuUGlwZUJpbmRpbmc6XG4gICAgICByZXR1cm4gMSArIGV4cHIuYXJncy5sZW5ndGg7XG4gICAgY2FzZSBpci5FeHByZXNzaW9uS2luZC5QaXBlQmluZGluZ1ZhcmlhZGljOlxuICAgICAgcmV0dXJuIDEgKyBleHByLm51bUFyZ3M7XG4gICAgY2FzZSBpci5FeHByZXNzaW9uS2luZC5TdG9yZUxldDpcbiAgICAgIHJldHVybiAxO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBBc3NlcnRpb25FcnJvcjogdW5oYW5kbGVkIENvbnN1bWVzVmFyc1RyYWl0IGV4cHJlc3Npb24gJHtleHByLmNvbnN0cnVjdG9yLm5hbWV9YCxcbiAgICAgICk7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNTaW5nbGV0b25JbnRlcnBvbGF0aW9uKGV4cHI6IGlyLkludGVycG9sYXRpb24pOiBib29sZWFuIHtcbiAgaWYgKGV4cHIuZXhwcmVzc2lvbnMubGVuZ3RoICE9PSAxIHx8IGV4cHIuc3RyaW5ncy5sZW5ndGggIT09IDIpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKGV4cHIuc3RyaW5nc1swXSAhPT0gJycgfHwgZXhwci5zdHJpbmdzWzFdICE9PSAnJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cbiJdfQ==