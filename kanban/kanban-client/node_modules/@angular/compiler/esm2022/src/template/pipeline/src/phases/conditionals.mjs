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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZGl0aW9uYWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3RlbXBsYXRlL3BpcGVsaW5lL3NyYy9waGFzZXMvY29uZGl0aW9uYWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sS0FBSyxDQUFDLE1BQU0sK0JBQStCLENBQUM7QUFDbkQsT0FBTyxLQUFLLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFHL0I7O0dBRUc7QUFDSCxNQUFNLFVBQVUsOEJBQThCLENBQUMsR0FBNEI7SUFDekUsS0FBSyxNQUFNLElBQUksSUFBSSxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDN0IsS0FBSyxNQUFNLEVBQUUsSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQztZQUM1QixJQUFJLEVBQUUsQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDdEMsU0FBUztZQUNYLENBQUM7WUFFRCxJQUFJLElBQWtCLENBQUM7WUFFdkIsdUZBQXVGO1lBQ3ZGLE1BQU0sV0FBVyxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxDQUFDO1lBQzFFLElBQUksV0FBVyxJQUFJLENBQUMsRUFBRSxDQUFDO2dCQUNyQixNQUFNLElBQUksR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDO2dCQUNoRSxJQUFJLEdBQUcsSUFBSSxFQUFFLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3RDLENBQUM7aUJBQU0sQ0FBQztnQkFDTiwrRUFBK0U7Z0JBQy9FLElBQUksR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkIsQ0FBQztZQUVELHNGQUFzRjtZQUN0RixJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDO1lBRTdGLDhGQUE4RjtZQUM5RixpREFBaUQ7WUFDakQsS0FBSyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUNuRCxJQUFJLGVBQWUsR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN2QyxJQUFJLGVBQWUsQ0FBQyxJQUFJLEtBQUssSUFBSSxFQUFFLENBQUM7b0JBQ2xDLFNBQVM7Z0JBQ1gsQ0FBQztnQkFDRCxJQUFJLEdBQUcsS0FBSyxJQUFJLEVBQUUsQ0FBQztvQkFDakIsTUFBTSxNQUFNLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ2xFLGVBQWUsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsa0JBQWtCLENBQzdDLENBQUMsQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUMxQixNQUFNLEVBQ04sZUFBZSxDQUFDLElBQUksQ0FDckIsQ0FBQztnQkFDSixDQUFDO3FCQUFNLElBQUksZUFBZSxDQUFDLEtBQUssS0FBSyxJQUFJLEVBQUUsQ0FBQztvQkFDMUMsTUFBTSwyQkFBMkIsR0FBRyxHQUFHLENBQUMsY0FBYyxFQUFFLENBQUM7b0JBQ3pELGVBQWUsQ0FBQyxJQUFJLEdBQUcsSUFBSSxFQUFFLENBQUMsbUJBQW1CLENBQy9DLGVBQWUsQ0FBQyxJQUFJLEVBQ3BCLDJCQUEyQixDQUM1QixDQUFDO29CQUNGLEVBQUUsQ0FBQyxZQUFZLEdBQUcsSUFBSSxFQUFFLENBQUMsaUJBQWlCLENBQUMsMkJBQTJCLENBQUMsQ0FBQztnQkFDMUUsQ0FBQztnQkFDRCxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsZUFBZSxDQUMxQixlQUFlLENBQUMsSUFBSSxFQUNwQixJQUFJLEVBQUUsQ0FBQyxlQUFlLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxFQUNsRCxJQUFJLENBQ0wsQ0FBQztZQUNKLENBQUM7WUFFRCxpREFBaUQ7WUFDakQsRUFBRSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7WUFFcEIsd0ZBQXdGO1lBQ3hGLGlEQUFpRDtZQUNqRCxFQUFFLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUNyQixDQUFDO0lBQ0gsQ0FBQztBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgbyBmcm9tICcuLi8uLi8uLi8uLi9vdXRwdXQvb3V0cHV0X2FzdCc7XG5pbXBvcnQgKiBhcyBpciBmcm9tICcuLi8uLi9pcic7XG5pbXBvcnQge0NvbXBvbmVudENvbXBpbGF0aW9uSm9ifSBmcm9tICcuLi9jb21waWxhdGlvbic7XG5cbi8qKlxuICogQ29sbGFwc2UgdGhlIHZhcmlvdXMgY29uZGl0aW9ucyBvZiBjb25kaXRpb25hbCBvcHMgKGlmLCBzd2l0Y2gpIGludG8gYSBzaW5nbGUgdGVzdCBleHByZXNzaW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVDb25kaXRpb25hbEV4cHJlc3Npb25zKGpvYjogQ29tcG9uZW50Q29tcGlsYXRpb25Kb2IpOiB2b2lkIHtcbiAgZm9yIChjb25zdCB1bml0IG9mIGpvYi51bml0cykge1xuICAgIGZvciAoY29uc3Qgb3Agb2YgdW5pdC5vcHMoKSkge1xuICAgICAgaWYgKG9wLmtpbmQgIT09IGlyLk9wS2luZC5Db25kaXRpb25hbCkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgbGV0IHRlc3Q6IG8uRXhwcmVzc2lvbjtcblxuICAgICAgLy8gQW55IGNhc2Ugd2l0aCBhIGBudWxsYCBjb25kaXRpb24gaXMgYGRlZmF1bHRgLiBJZiBvbmUgZXhpc3RzLCBkZWZhdWx0IHRvIGl0IGluc3RlYWQuXG4gICAgICBjb25zdCBkZWZhdWx0Q2FzZSA9IG9wLmNvbmRpdGlvbnMuZmluZEluZGV4KChjb25kKSA9PiBjb25kLmV4cHIgPT09IG51bGwpO1xuICAgICAgaWYgKGRlZmF1bHRDYXNlID49IDApIHtcbiAgICAgICAgY29uc3Qgc2xvdCA9IG9wLmNvbmRpdGlvbnMuc3BsaWNlKGRlZmF1bHRDYXNlLCAxKVswXS50YXJnZXRTbG90O1xuICAgICAgICB0ZXN0ID0gbmV3IGlyLlNsb3RMaXRlcmFsRXhwcihzbG90KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEJ5IGRlZmF1bHQsIGEgc3dpdGNoIGV2YWx1YXRlcyB0byBgLTFgLCBjYXVzaW5nIG5vIHRlbXBsYXRlIHRvIGJlIGRpc3BsYXllZC5cbiAgICAgICAgdGVzdCA9IG8ubGl0ZXJhbCgtMSk7XG4gICAgICB9XG5cbiAgICAgIC8vIFN3aXRjaCBleHByZXNzaW9ucyBhc3NpZ24gdGhlaXIgbWFpbiB0ZXN0IHRvIGEgdGVtcG9yYXJ5LCB0byBhdm9pZCByZS1leGVjdXRpbmcgaXQuXG4gICAgICBsZXQgdG1wID0gb3AudGVzdCA9PSBudWxsID8gbnVsbCA6IG5ldyBpci5Bc3NpZ25UZW1wb3JhcnlFeHByKG9wLnRlc3QsIGpvYi5hbGxvY2F0ZVhyZWZJZCgpKTtcblxuICAgICAgLy8gRm9yIGVhY2ggcmVtYWluaW5nIGNvbmRpdGlvbiwgdGVzdCB3aGV0aGVyIHRoZSB0ZW1wb3Jhcnkgc2F0aWZpZXMgdGhlIGNoZWNrLiAoSWYgbm8gdGVtcCBpc1xuICAgICAgLy8gcHJlc2VudCwganVzdCBjaGVjayBlYWNoIGV4cHJlc3Npb24gZGlyZWN0bHkuKVxuICAgICAgZm9yIChsZXQgaSA9IG9wLmNvbmRpdGlvbnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgbGV0IGNvbmRpdGlvbmFsQ2FzZSA9IG9wLmNvbmRpdGlvbnNbaV07XG4gICAgICAgIGlmIChjb25kaXRpb25hbENhc2UuZXhwciA9PT0gbnVsbCkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0bXAgIT09IG51bGwpIHtcbiAgICAgICAgICBjb25zdCB1c2VUbXAgPSBpID09PSAwID8gdG1wIDogbmV3IGlyLlJlYWRUZW1wb3JhcnlFeHByKHRtcC54cmVmKTtcbiAgICAgICAgICBjb25kaXRpb25hbENhc2UuZXhwciA9IG5ldyBvLkJpbmFyeU9wZXJhdG9yRXhwcihcbiAgICAgICAgICAgIG8uQmluYXJ5T3BlcmF0b3IuSWRlbnRpY2FsLFxuICAgICAgICAgICAgdXNlVG1wLFxuICAgICAgICAgICAgY29uZGl0aW9uYWxDYXNlLmV4cHIsXG4gICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIGlmIChjb25kaXRpb25hbENhc2UuYWxpYXMgIT09IG51bGwpIHtcbiAgICAgICAgICBjb25zdCBjYXNlRXhwcmVzc2lvblRlbXBvcmFyeVhyZWYgPSBqb2IuYWxsb2NhdGVYcmVmSWQoKTtcbiAgICAgICAgICBjb25kaXRpb25hbENhc2UuZXhwciA9IG5ldyBpci5Bc3NpZ25UZW1wb3JhcnlFeHByKFxuICAgICAgICAgICAgY29uZGl0aW9uYWxDYXNlLmV4cHIsXG4gICAgICAgICAgICBjYXNlRXhwcmVzc2lvblRlbXBvcmFyeVhyZWYsXG4gICAgICAgICAgKTtcbiAgICAgICAgICBvcC5jb250ZXh0VmFsdWUgPSBuZXcgaXIuUmVhZFRlbXBvcmFyeUV4cHIoY2FzZUV4cHJlc3Npb25UZW1wb3JhcnlYcmVmKTtcbiAgICAgICAgfVxuICAgICAgICB0ZXN0ID0gbmV3IG8uQ29uZGl0aW9uYWxFeHByKFxuICAgICAgICAgIGNvbmRpdGlvbmFsQ2FzZS5leHByLFxuICAgICAgICAgIG5ldyBpci5TbG90TGl0ZXJhbEV4cHIoY29uZGl0aW9uYWxDYXNlLnRhcmdldFNsb3QpLFxuICAgICAgICAgIHRlc3QsXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIC8vIFNhdmUgdGhlIHJlc3VsdGluZyBhZ2dyZWdhdGUgSm9vc3QtZXhwcmVzc2lvbi5cbiAgICAgIG9wLnByb2Nlc3NlZCA9IHRlc3Q7XG5cbiAgICAgIC8vIENsZWFyIHRoZSBvcmlnaW5hbCBjb25kaXRpb25zIGFycmF5LCBzaW5jZSB3ZSBubyBsb25nZXIgbmVlZCBpdCwgYW5kIGRvbid0IHdhbnQgaXQgdG9cbiAgICAgIC8vIGFmZmVjdCBzdWJzZXF1ZW50IHBoYXNlcyAoZS5nLiBwaXBlIGNyZWF0aW9uKS5cbiAgICAgIG9wLmNvbmRpdGlvbnMgPSBbXTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==