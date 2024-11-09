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
                    conditionalCase.expr =
                        new o.BinaryOperatorExpr(o.BinaryOperator.Identical, useTmp, conditionalCase.expr);
                }
                else if (conditionalCase.alias !== null) {
                    const caseExpressionTemporaryXref = job.allocateXrefId();
                    conditionalCase.expr =
                        new ir.AssignTemporaryExpr(conditionalCase.expr, caseExpressionTemporaryXref);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZGl0aW9uYWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3RlbXBsYXRlL3BpcGVsaW5lL3NyYy9waGFzZXMvY29uZGl0aW9uYWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sS0FBSyxDQUFDLE1BQU0sK0JBQStCLENBQUM7QUFDbkQsT0FBTyxLQUFLLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFHL0I7O0dBRUc7QUFDSCxNQUFNLFVBQVUsOEJBQThCLENBQUMsR0FBNEI7SUFDekUsS0FBSyxNQUFNLElBQUksSUFBSSxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDN0IsS0FBSyxNQUFNLEVBQUUsSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQztZQUM1QixJQUFJLEVBQUUsQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDdEMsU0FBUztZQUNYLENBQUM7WUFFRCxJQUFJLElBQWtCLENBQUM7WUFFdkIsdUZBQXVGO1lBQ3ZGLE1BQU0sV0FBVyxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxDQUFDO1lBQzFFLElBQUksV0FBVyxJQUFJLENBQUMsRUFBRSxDQUFDO2dCQUNyQixNQUFNLElBQUksR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDO2dCQUNoRSxJQUFJLEdBQUcsSUFBSSxFQUFFLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3RDLENBQUM7aUJBQU0sQ0FBQztnQkFDTiwrRUFBK0U7Z0JBQy9FLElBQUksR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkIsQ0FBQztZQUVELHNGQUFzRjtZQUN0RixJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDO1lBRTdGLDhGQUE4RjtZQUM5RixpREFBaUQ7WUFDakQsS0FBSyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUNuRCxJQUFJLGVBQWUsR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN2QyxJQUFJLGVBQWUsQ0FBQyxJQUFJLEtBQUssSUFBSSxFQUFFLENBQUM7b0JBQ2xDLFNBQVM7Z0JBQ1gsQ0FBQztnQkFDRCxJQUFJLEdBQUcsS0FBSyxJQUFJLEVBQUUsQ0FBQztvQkFDakIsTUFBTSxNQUFNLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ2xFLGVBQWUsQ0FBQyxJQUFJO3dCQUNoQixJQUFJLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUUsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUN6RixDQUFDO3FCQUFNLElBQUksZUFBZSxDQUFDLEtBQUssS0FBSyxJQUFJLEVBQUUsQ0FBQztvQkFDMUMsTUFBTSwyQkFBMkIsR0FBRyxHQUFHLENBQUMsY0FBYyxFQUFFLENBQUM7b0JBQ3pELGVBQWUsQ0FBQyxJQUFJO3dCQUNoQixJQUFJLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLDJCQUEyQixDQUFDLENBQUM7b0JBQ2xGLEVBQUUsQ0FBQyxZQUFZLEdBQUcsSUFBSSxFQUFFLENBQUMsaUJBQWlCLENBQUMsMkJBQTJCLENBQUMsQ0FBQztnQkFDMUUsQ0FBQztnQkFDRCxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsZUFBZSxDQUN4QixlQUFlLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDdEYsQ0FBQztZQUVELGlEQUFpRDtZQUNqRCxFQUFFLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztZQUVwQix3RkFBd0Y7WUFDeEYsaURBQWlEO1lBQ2pELEVBQUUsQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDO1FBQ3JCLENBQUM7SUFDSCxDQUFDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBvIGZyb20gJy4uLy4uLy4uLy4uL291dHB1dC9vdXRwdXRfYXN0JztcbmltcG9ydCAqIGFzIGlyIGZyb20gJy4uLy4uL2lyJztcbmltcG9ydCB7Q29tcG9uZW50Q29tcGlsYXRpb25Kb2J9IGZyb20gJy4uL2NvbXBpbGF0aW9uJztcblxuLyoqXG4gKiBDb2xsYXBzZSB0aGUgdmFyaW91cyBjb25kaXRpb25zIG9mIGNvbmRpdGlvbmFsIG9wcyAoaWYsIHN3aXRjaCkgaW50byBhIHNpbmdsZSB0ZXN0IGV4cHJlc3Npb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZUNvbmRpdGlvbmFsRXhwcmVzc2lvbnMoam9iOiBDb21wb25lbnRDb21waWxhdGlvbkpvYik6IHZvaWQge1xuICBmb3IgKGNvbnN0IHVuaXQgb2Ygam9iLnVuaXRzKSB7XG4gICAgZm9yIChjb25zdCBvcCBvZiB1bml0Lm9wcygpKSB7XG4gICAgICBpZiAob3Aua2luZCAhPT0gaXIuT3BLaW5kLkNvbmRpdGlvbmFsKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBsZXQgdGVzdDogby5FeHByZXNzaW9uO1xuXG4gICAgICAvLyBBbnkgY2FzZSB3aXRoIGEgYG51bGxgIGNvbmRpdGlvbiBpcyBgZGVmYXVsdGAuIElmIG9uZSBleGlzdHMsIGRlZmF1bHQgdG8gaXQgaW5zdGVhZC5cbiAgICAgIGNvbnN0IGRlZmF1bHRDYXNlID0gb3AuY29uZGl0aW9ucy5maW5kSW5kZXgoKGNvbmQpID0+IGNvbmQuZXhwciA9PT0gbnVsbCk7XG4gICAgICBpZiAoZGVmYXVsdENhc2UgPj0gMCkge1xuICAgICAgICBjb25zdCBzbG90ID0gb3AuY29uZGl0aW9ucy5zcGxpY2UoZGVmYXVsdENhc2UsIDEpWzBdLnRhcmdldFNsb3Q7XG4gICAgICAgIHRlc3QgPSBuZXcgaXIuU2xvdExpdGVyYWxFeHByKHNsb3QpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQnkgZGVmYXVsdCwgYSBzd2l0Y2ggZXZhbHVhdGVzIHRvIGAtMWAsIGNhdXNpbmcgbm8gdGVtcGxhdGUgdG8gYmUgZGlzcGxheWVkLlxuICAgICAgICB0ZXN0ID0gby5saXRlcmFsKC0xKTtcbiAgICAgIH1cblxuICAgICAgLy8gU3dpdGNoIGV4cHJlc3Npb25zIGFzc2lnbiB0aGVpciBtYWluIHRlc3QgdG8gYSB0ZW1wb3JhcnksIHRvIGF2b2lkIHJlLWV4ZWN1dGluZyBpdC5cbiAgICAgIGxldCB0bXAgPSBvcC50ZXN0ID09IG51bGwgPyBudWxsIDogbmV3IGlyLkFzc2lnblRlbXBvcmFyeUV4cHIob3AudGVzdCwgam9iLmFsbG9jYXRlWHJlZklkKCkpO1xuXG4gICAgICAvLyBGb3IgZWFjaCByZW1haW5pbmcgY29uZGl0aW9uLCB0ZXN0IHdoZXRoZXIgdGhlIHRlbXBvcmFyeSBzYXRpZmllcyB0aGUgY2hlY2suIChJZiBubyB0ZW1wIGlzXG4gICAgICAvLyBwcmVzZW50LCBqdXN0IGNoZWNrIGVhY2ggZXhwcmVzc2lvbiBkaXJlY3RseS4pXG4gICAgICBmb3IgKGxldCBpID0gb3AuY29uZGl0aW9ucy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICBsZXQgY29uZGl0aW9uYWxDYXNlID0gb3AuY29uZGl0aW9uc1tpXTtcbiAgICAgICAgaWYgKGNvbmRpdGlvbmFsQ2FzZS5leHByID09PSBudWxsKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRtcCAhPT0gbnVsbCkge1xuICAgICAgICAgIGNvbnN0IHVzZVRtcCA9IGkgPT09IDAgPyB0bXAgOiBuZXcgaXIuUmVhZFRlbXBvcmFyeUV4cHIodG1wLnhyZWYpO1xuICAgICAgICAgIGNvbmRpdGlvbmFsQ2FzZS5leHByID1cbiAgICAgICAgICAgICAgbmV3IG8uQmluYXJ5T3BlcmF0b3JFeHByKG8uQmluYXJ5T3BlcmF0b3IuSWRlbnRpY2FsLCB1c2VUbXAsIGNvbmRpdGlvbmFsQ2FzZS5leHByKTtcbiAgICAgICAgfSBlbHNlIGlmIChjb25kaXRpb25hbENhc2UuYWxpYXMgIT09IG51bGwpIHtcbiAgICAgICAgICBjb25zdCBjYXNlRXhwcmVzc2lvblRlbXBvcmFyeVhyZWYgPSBqb2IuYWxsb2NhdGVYcmVmSWQoKTtcbiAgICAgICAgICBjb25kaXRpb25hbENhc2UuZXhwciA9XG4gICAgICAgICAgICAgIG5ldyBpci5Bc3NpZ25UZW1wb3JhcnlFeHByKGNvbmRpdGlvbmFsQ2FzZS5leHByLCBjYXNlRXhwcmVzc2lvblRlbXBvcmFyeVhyZWYpO1xuICAgICAgICAgIG9wLmNvbnRleHRWYWx1ZSA9IG5ldyBpci5SZWFkVGVtcG9yYXJ5RXhwcihjYXNlRXhwcmVzc2lvblRlbXBvcmFyeVhyZWYpO1xuICAgICAgICB9XG4gICAgICAgIHRlc3QgPSBuZXcgby5Db25kaXRpb25hbEV4cHIoXG4gICAgICAgICAgICBjb25kaXRpb25hbENhc2UuZXhwciwgbmV3IGlyLlNsb3RMaXRlcmFsRXhwcihjb25kaXRpb25hbENhc2UudGFyZ2V0U2xvdCksIHRlc3QpO1xuICAgICAgfVxuXG4gICAgICAvLyBTYXZlIHRoZSByZXN1bHRpbmcgYWdncmVnYXRlIEpvb3N0LWV4cHJlc3Npb24uXG4gICAgICBvcC5wcm9jZXNzZWQgPSB0ZXN0O1xuXG4gICAgICAvLyBDbGVhciB0aGUgb3JpZ2luYWwgY29uZGl0aW9ucyBhcnJheSwgc2luY2Ugd2Ugbm8gbG9uZ2VyIG5lZWQgaXQsIGFuZCBkb24ndCB3YW50IGl0IHRvXG4gICAgICAvLyBhZmZlY3Qgc3Vic2VxdWVudCBwaGFzZXMgKGUuZy4gcGlwZSBjcmVhdGlvbikuXG4gICAgICBvcC5jb25kaXRpb25zID0gW107XG4gICAgfVxuICB9XG59XG4iXX0=