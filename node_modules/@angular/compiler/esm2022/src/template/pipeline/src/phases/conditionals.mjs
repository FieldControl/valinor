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
 * Collapse the various conditions of conditional ops (if, switch) into a single test expression.
 */
export function generateConditionalExpressions(job) {
    for (const unit of job.units) {
        for (const op of unit.ops()) {
            if (op.kind !== ir.OpKind.Conditional) {
                continue;
            }
            let test;
            // Any case with a `null` condition is `default`. If one exists, default to it instead.
            const defaultCase = op.conditions.findIndex((cond) => cond.expr === null);
            if (defaultCase >= 0) {
                const slot = op.conditions.splice(defaultCase, 1)[0].targetSlot;
                test = new ir.SlotLiteralExpr(slot);
            }
            else {
                // By default, a switch evaluates to `-1`, causing no template to be displayed.
                test = o.literal(-1);
            }
            // Switch expressions assign their main test to a temporary, to avoid re-executing it.
            let tmp = op.test == null ? null : new ir.AssignTemporaryExpr(op.test, job.allocateXrefId());
            // For each remaining condition, test whether the temporary satifies the check. (If no temp is
            // present, just check each expression directly.)
            for (let i = op.conditions.length - 1; i >= 0; i--) {
                let conditionalCase = op.conditions[i];
                if (conditionalCase.expr === null) {
                    continue;
                }
                if (tmp !== null) {
                    const useTmp = i === 0 ? tmp : new ir.ReadTemporaryExpr(tmp.xref);
                    conditionalCase.expr = new o.BinaryOperatorExpr(o.BinaryOperator.Identical, useTmp, conditionalCase.expr);
                }
                else if (conditionalCase.alias !== null) {
                    const caseExpressionTemporaryXref = job.allocateXrefId();
                    conditionalCase.expr = new ir.AssignTemporaryExpr(conditionalCase.expr, caseExpressionTemporaryXref);
                    op.contextValue = new ir.ReadTemporaryExpr(caseExpressionTemporaryXref);
                }
                test = new o.ConditionalExpr(conditionalCase.expr, new ir.SlotLiteralExpr(conditionalCase.targetSlot), test);
            }
            // Save the resulting aggregate Joost-expression.
            op.processed = test;
            // Clear the original conditions array, since we no longer need it, and don't want it to
            // affect subsequent phases (e.g. pipe creation).
            op.conditions = [];
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZGl0aW9uYWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3RlbXBsYXRlL3BpcGVsaW5lL3NyYy9waGFzZXMvY29uZGl0aW9uYWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sS0FBSyxDQUFDLE1BQU0sK0JBQStCLENBQUM7QUFDbkQsT0FBTyxLQUFLLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFHL0I7O0dBRUc7QUFDSCxNQUFNLFVBQVUsOEJBQThCLENBQUMsR0FBNEI7SUFDekUsS0FBSyxNQUFNLElBQUksSUFBSSxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDN0IsS0FBSyxNQUFNLEVBQUUsSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQztZQUM1QixJQUFJLEVBQUUsQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDdEMsU0FBUztZQUNYLENBQUM7WUFFRCxJQUFJLElBQWtCLENBQUM7WUFFdkIsdUZBQXVGO1lBQ3ZGLE1BQU0sV0FBVyxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxDQUFDO1lBQzFFLElBQUksV0FBVyxJQUFJLENBQUMsRUFBRSxDQUFDO2dCQUNyQixNQUFNLElBQUksR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDO2dCQUNoRSxJQUFJLEdBQUcsSUFBSSxFQUFFLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3RDLENBQUM7aUJBQU0sQ0FBQztnQkFDTiwrRUFBK0U7Z0JBQy9FLElBQUksR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkIsQ0FBQztZQUVELHNGQUFzRjtZQUN0RixJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDO1lBRTdGLDhGQUE4RjtZQUM5RixpREFBaUQ7WUFDakQsS0FBSyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUNuRCxJQUFJLGVBQWUsR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN2QyxJQUFJLGVBQWUsQ0FBQyxJQUFJLEtBQUssSUFBSSxFQUFFLENBQUM7b0JBQ2xDLFNBQVM7Z0JBQ1gsQ0FBQztnQkFDRCxJQUFJLEdBQUcsS0FBSyxJQUFJLEVBQUUsQ0FBQztvQkFDakIsTUFBTSxNQUFNLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ2xFLGVBQWUsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsa0JBQWtCLENBQzdDLENBQUMsQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUMxQixNQUFNLEVBQ04sZUFBZSxDQUFDLElBQUksQ0FDckIsQ0FBQztnQkFDSixDQUFDO3FCQUFNLElBQUksZUFBZSxDQUFDLEtBQUssS0FBSyxJQUFJLEVBQUUsQ0FBQztvQkFDMUMsTUFBTSwyQkFBMkIsR0FBRyxHQUFHLENBQUMsY0FBYyxFQUFFLENBQUM7b0JBQ3pELGVBQWUsQ0FBQyxJQUFJLEdBQUcsSUFBSSxFQUFFLENBQUMsbUJBQW1CLENBQy9DLGVBQWUsQ0FBQyxJQUFJLEVBQ3BCLDJCQUEyQixDQUM1QixDQUFDO29CQUNGLEVBQUUsQ0FBQyxZQUFZLEdBQUcsSUFBSSxFQUFFLENBQUMsaUJBQWlCLENBQUMsMkJBQTJCLENBQUMsQ0FBQztnQkFDMUUsQ0FBQztnQkFDRCxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsZUFBZSxDQUMxQixlQUFlLENBQUMsSUFBSSxFQUNwQixJQUFJLEVBQUUsQ0FBQyxlQUFlLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxFQUNsRCxJQUFJLENBQ0wsQ0FBQztZQUNKLENBQUM7WUFFRCxpREFBaUQ7WUFDakQsRUFBRSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7WUFFcEIsd0ZBQXdGO1lBQ3hGLGlEQUFpRDtZQUNqRCxFQUFFLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUNyQixDQUFDO0lBQ0gsQ0FBQztBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIG8gZnJvbSAnLi4vLi4vLi4vLi4vb3V0cHV0L291dHB1dF9hc3QnO1xuaW1wb3J0ICogYXMgaXIgZnJvbSAnLi4vLi4vaXInO1xuaW1wb3J0IHtDb21wb25lbnRDb21waWxhdGlvbkpvYn0gZnJvbSAnLi4vY29tcGlsYXRpb24nO1xuXG4vKipcbiAqIENvbGxhcHNlIHRoZSB2YXJpb3VzIGNvbmRpdGlvbnMgb2YgY29uZGl0aW9uYWwgb3BzIChpZiwgc3dpdGNoKSBpbnRvIGEgc2luZ2xlIHRlc3QgZXhwcmVzc2lvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlQ29uZGl0aW9uYWxFeHByZXNzaW9ucyhqb2I6IENvbXBvbmVudENvbXBpbGF0aW9uSm9iKTogdm9pZCB7XG4gIGZvciAoY29uc3QgdW5pdCBvZiBqb2IudW5pdHMpIHtcbiAgICBmb3IgKGNvbnN0IG9wIG9mIHVuaXQub3BzKCkpIHtcbiAgICAgIGlmIChvcC5raW5kICE9PSBpci5PcEtpbmQuQ29uZGl0aW9uYWwpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGxldCB0ZXN0OiBvLkV4cHJlc3Npb247XG5cbiAgICAgIC8vIEFueSBjYXNlIHdpdGggYSBgbnVsbGAgY29uZGl0aW9uIGlzIGBkZWZhdWx0YC4gSWYgb25lIGV4aXN0cywgZGVmYXVsdCB0byBpdCBpbnN0ZWFkLlxuICAgICAgY29uc3QgZGVmYXVsdENhc2UgPSBvcC5jb25kaXRpb25zLmZpbmRJbmRleCgoY29uZCkgPT4gY29uZC5leHByID09PSBudWxsKTtcbiAgICAgIGlmIChkZWZhdWx0Q2FzZSA+PSAwKSB7XG4gICAgICAgIGNvbnN0IHNsb3QgPSBvcC5jb25kaXRpb25zLnNwbGljZShkZWZhdWx0Q2FzZSwgMSlbMF0udGFyZ2V0U2xvdDtcbiAgICAgICAgdGVzdCA9IG5ldyBpci5TbG90TGl0ZXJhbEV4cHIoc2xvdCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBCeSBkZWZhdWx0LCBhIHN3aXRjaCBldmFsdWF0ZXMgdG8gYC0xYCwgY2F1c2luZyBubyB0ZW1wbGF0ZSB0byBiZSBkaXNwbGF5ZWQuXG4gICAgICAgIHRlc3QgPSBvLmxpdGVyYWwoLTEpO1xuICAgICAgfVxuXG4gICAgICAvLyBTd2l0Y2ggZXhwcmVzc2lvbnMgYXNzaWduIHRoZWlyIG1haW4gdGVzdCB0byBhIHRlbXBvcmFyeSwgdG8gYXZvaWQgcmUtZXhlY3V0aW5nIGl0LlxuICAgICAgbGV0IHRtcCA9IG9wLnRlc3QgPT0gbnVsbCA/IG51bGwgOiBuZXcgaXIuQXNzaWduVGVtcG9yYXJ5RXhwcihvcC50ZXN0LCBqb2IuYWxsb2NhdGVYcmVmSWQoKSk7XG5cbiAgICAgIC8vIEZvciBlYWNoIHJlbWFpbmluZyBjb25kaXRpb24sIHRlc3Qgd2hldGhlciB0aGUgdGVtcG9yYXJ5IHNhdGlmaWVzIHRoZSBjaGVjay4gKElmIG5vIHRlbXAgaXNcbiAgICAgIC8vIHByZXNlbnQsIGp1c3QgY2hlY2sgZWFjaCBleHByZXNzaW9uIGRpcmVjdGx5LilcbiAgICAgIGZvciAobGV0IGkgPSBvcC5jb25kaXRpb25zLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIGxldCBjb25kaXRpb25hbENhc2UgPSBvcC5jb25kaXRpb25zW2ldO1xuICAgICAgICBpZiAoY29uZGl0aW9uYWxDYXNlLmV4cHIgPT09IG51bGwpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodG1wICE9PSBudWxsKSB7XG4gICAgICAgICAgY29uc3QgdXNlVG1wID0gaSA9PT0gMCA/IHRtcCA6IG5ldyBpci5SZWFkVGVtcG9yYXJ5RXhwcih0bXAueHJlZik7XG4gICAgICAgICAgY29uZGl0aW9uYWxDYXNlLmV4cHIgPSBuZXcgby5CaW5hcnlPcGVyYXRvckV4cHIoXG4gICAgICAgICAgICBvLkJpbmFyeU9wZXJhdG9yLklkZW50aWNhbCxcbiAgICAgICAgICAgIHVzZVRtcCxcbiAgICAgICAgICAgIGNvbmRpdGlvbmFsQ2FzZS5leHByLFxuICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSBpZiAoY29uZGl0aW9uYWxDYXNlLmFsaWFzICE9PSBudWxsKSB7XG4gICAgICAgICAgY29uc3QgY2FzZUV4cHJlc3Npb25UZW1wb3JhcnlYcmVmID0gam9iLmFsbG9jYXRlWHJlZklkKCk7XG4gICAgICAgICAgY29uZGl0aW9uYWxDYXNlLmV4cHIgPSBuZXcgaXIuQXNzaWduVGVtcG9yYXJ5RXhwcihcbiAgICAgICAgICAgIGNvbmRpdGlvbmFsQ2FzZS5leHByLFxuICAgICAgICAgICAgY2FzZUV4cHJlc3Npb25UZW1wb3JhcnlYcmVmLFxuICAgICAgICAgICk7XG4gICAgICAgICAgb3AuY29udGV4dFZhbHVlID0gbmV3IGlyLlJlYWRUZW1wb3JhcnlFeHByKGNhc2VFeHByZXNzaW9uVGVtcG9yYXJ5WHJlZik7XG4gICAgICAgIH1cbiAgICAgICAgdGVzdCA9IG5ldyBvLkNvbmRpdGlvbmFsRXhwcihcbiAgICAgICAgICBjb25kaXRpb25hbENhc2UuZXhwcixcbiAgICAgICAgICBuZXcgaXIuU2xvdExpdGVyYWxFeHByKGNvbmRpdGlvbmFsQ2FzZS50YXJnZXRTbG90KSxcbiAgICAgICAgICB0ZXN0LFxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICAvLyBTYXZlIHRoZSByZXN1bHRpbmcgYWdncmVnYXRlIEpvb3N0LWV4cHJlc3Npb24uXG4gICAgICBvcC5wcm9jZXNzZWQgPSB0ZXN0O1xuXG4gICAgICAvLyBDbGVhciB0aGUgb3JpZ2luYWwgY29uZGl0aW9ucyBhcnJheSwgc2luY2Ugd2Ugbm8gbG9uZ2VyIG5lZWQgaXQsIGFuZCBkb24ndCB3YW50IGl0IHRvXG4gICAgICAvLyBhZmZlY3Qgc3Vic2VxdWVudCBwaGFzZXMgKGUuZy4gcGlwZSBjcmVhdGlvbikuXG4gICAgICBvcC5jb25kaXRpb25zID0gW107XG4gICAgfVxuICB9XG59XG4iXX0=