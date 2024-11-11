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
 * Pipes that accept more than 4 arguments are variadic, and are handled with a different runtime
 * instruction.
 */
export function createVariadicPipes(job) {
    for (const unit of job.units) {
        for (const op of unit.update) {
            ir.transformExpressionsInOp(op, (expr) => {
                if (!(expr instanceof ir.PipeBindingExpr)) {
                    return expr;
                }
                // Pipes are variadic if they have more than 4 arguments.
                if (expr.args.length <= 4) {
                    return expr;
                }
                return new ir.PipeBindingVariadicExpr(expr.target, expr.targetSlot, expr.name, o.literalArr(expr.args), expr.args.length);
            }, ir.VisitorContextFlag.None);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGlwZV92YXJpYWRpYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy90ZW1wbGF0ZS9waXBlbGluZS9zcmMvcGhhc2VzL3BpcGVfdmFyaWFkaWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxLQUFLLENBQUMsTUFBTSwrQkFBK0IsQ0FBQztBQUNuRCxPQUFPLEtBQUssRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUkvQjs7O0dBR0c7QUFDSCxNQUFNLFVBQVUsbUJBQW1CLENBQUMsR0FBbUI7SUFDckQsS0FBSyxNQUFNLElBQUksSUFBSSxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDN0IsS0FBSyxNQUFNLEVBQUUsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDN0IsRUFBRSxDQUFDLHdCQUF3QixDQUN6QixFQUFFLEVBQ0YsQ0FBQyxJQUFJLEVBQUUsRUFBRTtnQkFDUCxJQUFJLENBQUMsQ0FBQyxJQUFJLFlBQVksRUFBRSxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUM7b0JBQzFDLE9BQU8sSUFBSSxDQUFDO2dCQUNkLENBQUM7Z0JBRUQseURBQXlEO2dCQUN6RCxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRSxDQUFDO29CQUMxQixPQUFPLElBQUksQ0FBQztnQkFDZCxDQUFDO2dCQUVELE9BQU8sSUFBSSxFQUFFLENBQUMsdUJBQXVCLENBQ25DLElBQUksQ0FBQyxNQUFNLEVBQ1gsSUFBSSxDQUFDLFVBQVUsRUFDZixJQUFJLENBQUMsSUFBSSxFQUNULENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUN2QixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FDakIsQ0FBQztZQUNKLENBQUMsRUFDRCxFQUFFLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUMzQixDQUFDO1FBQ0osQ0FBQztJQUNILENBQUM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBvIGZyb20gJy4uLy4uLy4uLy4uL291dHB1dC9vdXRwdXRfYXN0JztcbmltcG9ydCAqIGFzIGlyIGZyb20gJy4uLy4uL2lyJztcblxuaW1wb3J0IHR5cGUge0NvbXBpbGF0aW9uSm9iLCBDb21wb25lbnRDb21waWxhdGlvbkpvYn0gZnJvbSAnLi4vY29tcGlsYXRpb24nO1xuXG4vKipcbiAqIFBpcGVzIHRoYXQgYWNjZXB0IG1vcmUgdGhhbiA0IGFyZ3VtZW50cyBhcmUgdmFyaWFkaWMsIGFuZCBhcmUgaGFuZGxlZCB3aXRoIGEgZGlmZmVyZW50IHJ1bnRpbWVcbiAqIGluc3RydWN0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlVmFyaWFkaWNQaXBlcyhqb2I6IENvbXBpbGF0aW9uSm9iKTogdm9pZCB7XG4gIGZvciAoY29uc3QgdW5pdCBvZiBqb2IudW5pdHMpIHtcbiAgICBmb3IgKGNvbnN0IG9wIG9mIHVuaXQudXBkYXRlKSB7XG4gICAgICBpci50cmFuc2Zvcm1FeHByZXNzaW9uc0luT3AoXG4gICAgICAgIG9wLFxuICAgICAgICAoZXhwcikgPT4ge1xuICAgICAgICAgIGlmICghKGV4cHIgaW5zdGFuY2VvZiBpci5QaXBlQmluZGluZ0V4cHIpKSB7XG4gICAgICAgICAgICByZXR1cm4gZXhwcjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBQaXBlcyBhcmUgdmFyaWFkaWMgaWYgdGhleSBoYXZlIG1vcmUgdGhhbiA0IGFyZ3VtZW50cy5cbiAgICAgICAgICBpZiAoZXhwci5hcmdzLmxlbmd0aCA8PSA0KSB7XG4gICAgICAgICAgICByZXR1cm4gZXhwcjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gbmV3IGlyLlBpcGVCaW5kaW5nVmFyaWFkaWNFeHByKFxuICAgICAgICAgICAgZXhwci50YXJnZXQsXG4gICAgICAgICAgICBleHByLnRhcmdldFNsb3QsXG4gICAgICAgICAgICBleHByLm5hbWUsXG4gICAgICAgICAgICBvLmxpdGVyYWxBcnIoZXhwci5hcmdzKSxcbiAgICAgICAgICAgIGV4cHIuYXJncy5sZW5ndGgsXG4gICAgICAgICAgKTtcbiAgICAgICAgfSxcbiAgICAgICAgaXIuVmlzaXRvckNvbnRleHRGbGFnLk5vbmUsXG4gICAgICApO1xuICAgIH1cbiAgfVxufVxuIl19