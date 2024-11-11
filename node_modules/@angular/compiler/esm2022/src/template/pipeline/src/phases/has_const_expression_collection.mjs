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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFzX2NvbnN0X2V4cHJlc3Npb25fY29sbGVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy90ZW1wbGF0ZS9waXBlbGluZS9zcmMvcGhhc2VzL2hhc19jb25zdF9leHByZXNzaW9uX2NvbGxlY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxLQUFLLENBQUMsTUFBTSwrQkFBK0IsQ0FBQztBQUNuRCxPQUFPLEtBQUssRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUcvQjs7Ozs7R0FLRztBQUNILE1BQU0sVUFBVSx1QkFBdUIsQ0FBQyxHQUE0QjtJQUNsRSxLQUFLLE1BQU0sSUFBSSxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM3QixLQUFLLE1BQU0sRUFBRSxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDO1lBQzVCLEVBQUUsQ0FBQyx3QkFBd0IsQ0FDekIsRUFBRSxFQUNGLENBQUMsSUFBSSxFQUFFLEVBQUU7Z0JBQ1AsSUFBSSxDQUFDLENBQUMsSUFBSSxZQUFZLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLENBQUM7b0JBQzdDLE9BQU8sSUFBSSxDQUFDO2dCQUNkLENBQUM7Z0JBQ0QsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDNUMsQ0FBQyxFQUNELEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQzNCLENBQUM7UUFDSixDQUFDO0lBQ0gsQ0FBQztBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIG8gZnJvbSAnLi4vLi4vLi4vLi4vb3V0cHV0L291dHB1dF9hc3QnO1xuaW1wb3J0ICogYXMgaXIgZnJvbSAnLi4vLi4vaXInO1xuaW1wb3J0IHR5cGUge0NvbXBvbmVudENvbXBpbGF0aW9uSm9ifSBmcm9tICcuLi9jb21waWxhdGlvbic7XG5cbi8qKlxuICogYGlyLkNvbnN0Q29sbGVjdGVkRXhwcmAgbWF5IGJlIHByZXNlbnQgaW4gYW55IElSIGV4cHJlc3Npb24uIFRoaXMgbWVhbnMgdGhhdCBleHByZXNzaW9uIG5lZWRzIHRvXG4gKiBiZSBsaWZ0ZWQgaW50byB0aGUgY29tcG9uZW50IGNvbnN0IGFycmF5LCBhbmQgcmVwbGFjZWQgd2l0aCBhIHJlZmVyZW5jZSB0byB0aGUgY29uc3QgYXJyYXkgYXQgaXRzXG4gKlxuICogdXNhZ2Ugc2l0ZS4gVGhpcyBwaGFzZSB3YWxrcyB0aGUgSVIgYW5kIHBlcmZvcm1zIHRoaXMgdHJhbnNmb3JtYXRpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb2xsZWN0Q29uc3RFeHByZXNzaW9ucyhqb2I6IENvbXBvbmVudENvbXBpbGF0aW9uSm9iKTogdm9pZCB7XG4gIGZvciAoY29uc3QgdW5pdCBvZiBqb2IudW5pdHMpIHtcbiAgICBmb3IgKGNvbnN0IG9wIG9mIHVuaXQub3BzKCkpIHtcbiAgICAgIGlyLnRyYW5zZm9ybUV4cHJlc3Npb25zSW5PcChcbiAgICAgICAgb3AsXG4gICAgICAgIChleHByKSA9PiB7XG4gICAgICAgICAgaWYgKCEoZXhwciBpbnN0YW5jZW9mIGlyLkNvbnN0Q29sbGVjdGVkRXhwcikpIHtcbiAgICAgICAgICAgIHJldHVybiBleHByO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gby5saXRlcmFsKGpvYi5hZGRDb25zdChleHByLmV4cHIpKTtcbiAgICAgICAgfSxcbiAgICAgICAgaXIuVmlzaXRvckNvbnRleHRGbGFnLk5vbmUsXG4gICAgICApO1xuICAgIH1cbiAgfVxufVxuIl19