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
 * `ir.ConstCollectedExpr` may be present in any IR expression. This means that expression needs to
 * be lifted into the component const array, and replaced with a reference to the const array at its
 *
 * usage site. This phase walks the IR and performs this transformation.
 */
export function collectConstExpressions(job) {
    for (const unit of job.units) {
        for (const op of unit.ops()) {
            ir.transformExpressionsInOp(op, (expr) => {
                if (!(expr instanceof ir.ConstCollectedExpr)) {
                    return expr;
                }
                return o.literal(job.addConst(expr.expr));
            }, ir.VisitorContextFlag.None);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFzX2NvbnN0X2V4cHJlc3Npb25fY29sbGVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy90ZW1wbGF0ZS9waXBlbGluZS9zcmMvcGhhc2VzL2hhc19jb25zdF9leHByZXNzaW9uX2NvbGxlY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxLQUFLLENBQUMsTUFBTSwrQkFBK0IsQ0FBQztBQUNuRCxPQUFPLEtBQUssRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUcvQjs7Ozs7R0FLRztBQUNILE1BQU0sVUFBVSx1QkFBdUIsQ0FBQyxHQUE0QjtJQUNsRSxLQUFLLE1BQU0sSUFBSSxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM3QixLQUFLLE1BQU0sRUFBRSxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDO1lBQzVCLEVBQUUsQ0FBQyx3QkFBd0IsQ0FDekIsRUFBRSxFQUNGLENBQUMsSUFBSSxFQUFFLEVBQUU7Z0JBQ1AsSUFBSSxDQUFDLENBQUMsSUFBSSxZQUFZLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLENBQUM7b0JBQzdDLE9BQU8sSUFBSSxDQUFDO2dCQUNkLENBQUM7Z0JBQ0QsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDNUMsQ0FBQyxFQUNELEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQzNCLENBQUM7UUFDSixDQUFDO0lBQ0gsQ0FBQztBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgbyBmcm9tICcuLi8uLi8uLi8uLi9vdXRwdXQvb3V0cHV0X2FzdCc7XG5pbXBvcnQgKiBhcyBpciBmcm9tICcuLi8uLi9pcic7XG5pbXBvcnQgdHlwZSB7Q29tcG9uZW50Q29tcGlsYXRpb25Kb2J9IGZyb20gJy4uL2NvbXBpbGF0aW9uJztcblxuLyoqXG4gKiBgaXIuQ29uc3RDb2xsZWN0ZWRFeHByYCBtYXkgYmUgcHJlc2VudCBpbiBhbnkgSVIgZXhwcmVzc2lvbi4gVGhpcyBtZWFucyB0aGF0IGV4cHJlc3Npb24gbmVlZHMgdG9cbiAqIGJlIGxpZnRlZCBpbnRvIHRoZSBjb21wb25lbnQgY29uc3QgYXJyYXksIGFuZCByZXBsYWNlZCB3aXRoIGEgcmVmZXJlbmNlIHRvIHRoZSBjb25zdCBhcnJheSBhdCBpdHNcbiAqXG4gKiB1c2FnZSBzaXRlLiBUaGlzIHBoYXNlIHdhbGtzIHRoZSBJUiBhbmQgcGVyZm9ybXMgdGhpcyB0cmFuc2Zvcm1hdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbGxlY3RDb25zdEV4cHJlc3Npb25zKGpvYjogQ29tcG9uZW50Q29tcGlsYXRpb25Kb2IpOiB2b2lkIHtcbiAgZm9yIChjb25zdCB1bml0IG9mIGpvYi51bml0cykge1xuICAgIGZvciAoY29uc3Qgb3Agb2YgdW5pdC5vcHMoKSkge1xuICAgICAgaXIudHJhbnNmb3JtRXhwcmVzc2lvbnNJbk9wKFxuICAgICAgICBvcCxcbiAgICAgICAgKGV4cHIpID0+IHtcbiAgICAgICAgICBpZiAoIShleHByIGluc3RhbmNlb2YgaXIuQ29uc3RDb2xsZWN0ZWRFeHByKSkge1xuICAgICAgICAgICAgcmV0dXJuIGV4cHI7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBvLmxpdGVyYWwoam9iLmFkZENvbnN0KGV4cHIuZXhwcikpO1xuICAgICAgICB9LFxuICAgICAgICBpci5WaXNpdG9yQ29udGV4dEZsYWcuTm9uZSxcbiAgICAgICk7XG4gICAgfVxuICB9XG59XG4iXX0=