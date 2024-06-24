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
 * Find all assignments and usages of temporary variables, which are linked to each other with cross
 * references. Generate names for each cross-reference, and add a `DeclareVarStmt` to initialize
 * them at the beginning of the update block.
 *
 * TODO: Sometimes, it will be possible to reuse names across different subexpressions. For example,
 * in the double keyed read `a?.[f()]?.[f()]`, the two function calls have non-overlapping scopes.
 * Implement an algorithm for reuse.
 */
export function generateTemporaryVariables(job) {
    for (const unit of job.units) {
        unit.create.prepend(generateTemporaries(unit.create));
        unit.update.prepend(generateTemporaries(unit.update));
    }
}
function generateTemporaries(ops) {
    let opCount = 0;
    let generatedStatements = [];
    // For each op, search for any variables that are assigned or read. For each variable, generate a
    // name and produce a `DeclareVarStmt` to the beginning of the block.
    for (const op of ops) {
        // Identify the final time each temp var is read.
        const finalReads = new Map();
        ir.visitExpressionsInOp(op, (expr, flag) => {
            if (flag & ir.VisitorContextFlag.InChildOperation) {
                return;
            }
            if (expr instanceof ir.ReadTemporaryExpr) {
                finalReads.set(expr.xref, expr);
            }
        });
        // Name the temp vars, accounting for the fact that a name can be reused after it has been
        // read for the final time.
        let count = 0;
        const assigned = new Set();
        const released = new Set();
        const defs = new Map();
        ir.visitExpressionsInOp(op, (expr, flag) => {
            if (flag & ir.VisitorContextFlag.InChildOperation) {
                return;
            }
            if (expr instanceof ir.AssignTemporaryExpr) {
                if (!assigned.has(expr.xref)) {
                    assigned.add(expr.xref);
                    // TODO: Exactly replicate the naming scheme used by `TemplateDefinitionBuilder`.
                    // It seems to rely on an expression index instead of an op index.
                    defs.set(expr.xref, `tmp_${opCount}_${count++}`);
                }
                assignName(defs, expr);
            }
            else if (expr instanceof ir.ReadTemporaryExpr) {
                if (finalReads.get(expr.xref) === expr) {
                    released.add(expr.xref);
                    count--;
                }
                assignName(defs, expr);
            }
        });
        // Add declarations for the temp vars.
        generatedStatements.push(...Array.from(new Set(defs.values())).map((name) => ir.createStatementOp(new o.DeclareVarStmt(name))));
        opCount++;
        if (op.kind === ir.OpKind.Listener || op.kind === ir.OpKind.TwoWayListener) {
            op.handlerOps.prepend(generateTemporaries(op.handlerOps));
        }
    }
    return generatedStatements;
}
/**
 * Assigns a name to the temporary variable in the given temporary variable expression.
 */
function assignName(names, expr) {
    const name = names.get(expr.xref);
    if (name === undefined) {
        throw new Error(`Found xref with unassigned name: ${expr.xref}`);
    }
    expr.name = name;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVtcG9yYXJ5X3ZhcmlhYmxlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy90ZW1wbGF0ZS9waXBlbGluZS9zcmMvcGhhc2VzL3RlbXBvcmFyeV92YXJpYWJsZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxLQUFLLENBQUMsTUFBTSwrQkFBK0IsQ0FBQztBQUNuRCxPQUFPLEtBQUssRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUcvQjs7Ozs7Ozs7R0FRRztBQUNILE1BQU0sVUFBVSwwQkFBMEIsQ0FBQyxHQUFtQjtJQUM1RCxLQUFLLE1BQU0sSUFBSSxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM3QixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUF1QyxDQUFDLENBQUM7UUFDNUYsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBdUMsQ0FBQyxDQUFDO0lBQzlGLENBQUM7QUFDSCxDQUFDO0FBRUQsU0FBUyxtQkFBbUIsQ0FDMUIsR0FBeUM7SUFFekMsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDO0lBQ2hCLElBQUksbUJBQW1CLEdBQXVDLEVBQUUsQ0FBQztJQUVqRSxpR0FBaUc7SUFDakcscUVBQXFFO0lBQ3JFLEtBQUssTUFBTSxFQUFFLElBQUksR0FBRyxFQUFFLENBQUM7UUFDckIsaURBQWlEO1FBQ2pELE1BQU0sVUFBVSxHQUFHLElBQUksR0FBRyxFQUFtQyxDQUFDO1FBQzlELEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEVBQUU7WUFDekMsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDLGtCQUFrQixDQUFDLGdC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QUFDLG9DQUFvQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUNuRSxDQUFDO0lBQ0QsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7QUFDbkIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBvIGZyb20gJy4uLy4uLy4uLy4uL291dHB1dC9vdXRwdXRfYXN0JztcbmltcG9ydCAqIGFzIGlyIGZyb20gJy4uLy4uL2lyJztcbmltcG9ydCB0eXBlIHtDb21waWxhdGlvbkpvYn0gZnJvbSAnLi4vY29tcGlsYXRpb24nO1xuXG4vKipcbiAqIEZpbmQgYWxsIGFzc2lnbm1lbnRzIGFuZCB1c2FnZXMgb2YgdGVtcG9yYXJ5IHZhcmlhYmxlcywgd2hpY2ggYXJlIGxpbmtlZCB0byBlYWNoIG90aGVyIHdpdGggY3Jvc3NcbiAqIHJlZmVyZW5jZXMuIEdlbmVyYXRlIG5hbWVzIGZvciBlYWNoIGNyb3NzLXJlZmVyZW5jZSwgYW5kIGFkZCBhIGBEZWNsYXJlVmFyU3RtdGAgdG8gaW5pdGlhbGl6ZVxuICogdGhlbSBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSB1cGRhdGUgYmxvY2suXG4gKlxuICogVE9ETzogU29tZXRpbWVzLCBpdCB3aWxsIGJlIHBvc3NpYmxlIHRvIHJldXNlIG5hbWVzIGFjcm9zcyBkaWZmZXJlbnQgc3ViZXhwcmVzc2lvbnMuIEZvciBleGFtcGxlLFxuICogaW4gdGhlIGRvdWJsZSBrZXllZCByZWFkIGBhPy5bZigpXT8uW2YoKV1gLCB0aGUgdHdvIGZ1bmN0aW9uIGNhbGxzIGhhdmUgbm9uLW92ZXJsYXBwaW5nIHNjb3Blcy5cbiAqIEltcGxlbWVudCBhbiBhbGdvcml0aG0gZm9yIHJldXNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVUZW1wb3JhcnlWYXJpYWJsZXMoam9iOiBDb21waWxhdGlvbkpvYik6IHZvaWQge1xuICBmb3IgKGNvbnN0IHVuaXQgb2Ygam9iLnVuaXRzKSB7XG4gICAgdW5pdC5jcmVhdGUucHJlcGVuZChnZW5lcmF0ZVRlbXBvcmFyaWVzKHVuaXQuY3JlYXRlKSBhcyBBcnJheTxpci5TdGF0ZW1lbnRPcDxpci5DcmVhdGVPcD4+KTtcbiAgICB1bml0LnVwZGF0ZS5wcmVwZW5kKGdlbmVyYXRlVGVtcG9yYXJpZXModW5pdC51cGRhdGUpIGFzIEFycmF5PGlyLlN0YXRlbWVudE9wPGlyLlVwZGF0ZU9wPj4pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdlbmVyYXRlVGVtcG9yYXJpZXMoXG4gIG9wczogaXIuT3BMaXN0PGlyLkNyZWF0ZU9wIHwgaXIuVXBkYXRlT3A+LFxuKTogQXJyYXk8aXIuU3RhdGVtZW50T3A8aXIuQ3JlYXRlT3AgfCBpci5VcGRhdGVPcD4+IHtcbiAgbGV0IG9wQ291bnQgPSAwO1xuICBsZXQgZ2VuZXJhdGVkU3RhdGVtZW50czogQXJyYXk8aXIuU3RhdGVtZW50T3A8aXIuVXBkYXRlT3A+PiA9IFtdO1xuXG4gIC8vIEZvciBlYWNoIG9wLCBzZWFyY2ggZm9yIGFueSB2YXJpYWJsZXMgdGhhdCBhcmUgYXNzaWduZWQgb3IgcmVhZC4gRm9yIGVhY2ggdmFyaWFibGUsIGdlbmVyYXRlIGFcbiAgLy8gbmFtZSBhbmQgcHJvZHVjZSBhIGBEZWNsYXJlVmFyU3RtdGAgdG8gdGhlIGJlZ2lubmluZyBvZiB0aGUgYmxvY2suXG4gIGZvciAoY29uc3Qgb3Agb2Ygb3BzKSB7XG4gICAgLy8gSWRlbnRpZnkgdGhlIGZpbmFsIHRpbWUgZWFjaCB0ZW1wIHZhciBpcyByZWFkLlxuICAgIGNvbnN0IGZpbmFsUmVhZHMgPSBuZXcgTWFwPGlyLlhyZWZJZCwgaXIuUmVhZFRlbXBvcmFyeUV4cHI+KCk7XG4gICAgaXIudmlzaXRFeHByZXNzaW9uc0luT3Aob3AsIChleHByLCBmbGFnKSA9PiB7XG4gICAgICBpZiAoZmxhZyAmIGlyLlZpc2l0b3JDb250ZXh0RmxhZy5JbkNoaWxkT3BlcmF0aW9uKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmIChleHByIGluc3RhbmNlb2YgaXIuUmVhZFRlbXBvcmFyeUV4cHIpIHtcbiAgICAgICAgZmluYWxSZWFkcy5zZXQoZXhwci54cmVmLCBleHByKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIE5hbWUgdGhlIHRlbXAgdmFycywgYWNjb3VudGluZyBmb3IgdGhlIGZhY3QgdGhhdCBhIG5hbWUgY2FuIGJlIHJldXNlZCBhZnRlciBpdCBoYXMgYmVlblxuICAgIC8vIHJlYWQgZm9yIHRoZSBmaW5hbCB0aW1lLlxuICAgIGxldCBjb3VudCA9IDA7XG4gICAgY29uc3QgYXNzaWduZWQgPSBuZXcgU2V0PGlyLlhyZWZJZD4oKTtcbiAgICBjb25zdCByZWxlYXNlZCA9IG5ldyBTZXQ8aXIuWHJlZklkPigpO1xuICAgIGNvbnN0IGRlZnMgPSBuZXcgTWFwPGlyLlhyZWZJZCwgc3RyaW5nPigpO1xuICAgIGlyLnZpc2l0RXhwcmVzc2lvbnNJbk9wKG9wLCAoZXhwciwgZmxhZykgPT4ge1xuICAgICAgaWYgKGZsYWcgJiBpci5WaXNpdG9yQ29udGV4dEZsYWcuSW5DaGlsZE9wZXJhdGlvbikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoZXhwciBpbnN0YW5jZW9mIGlyLkFzc2lnblRlbXBvcmFyeUV4cHIpIHtcbiAgICAgICAgaWYgKCFhc3NpZ25lZC5oYXMoZXhwci54cmVmKSkge1xuICAgICAgICAgIGFzc2lnbmVkLmFkZChleHByLnhyZWYpO1xuICAgICAgICAgIC8vIFRPRE86IEV4YWN0bHkgcmVwbGljYXRlIHRoZSBuYW1pbmcgc2NoZW1lIHVzZWQgYnkgYFRlbXBsYXRlRGVmaW5pdGlvbkJ1aWxkZXJgLlxuICAgICAgICAgIC8vIEl0IHNlZW1zIHRvIHJlbHkgb24gYW4gZXhwcmVzc2lvbiBpbmRleCBpbnN0ZWFkIG9mIGFuIG9wIGluZGV4LlxuICAgICAgICAgIGRlZnMuc2V0KGV4cHIueHJlZiwgYHRtcF8ke29wQ291bnR9XyR7Y291bnQrK31gKTtcbiAgICAgICAgfVxuICAgICAgICBhc3NpZ25OYW1lKGRlZnMsIGV4cHIpO1xuICAgICAgfSBlbHNlIGlmIChleHByIGluc3RhbmNlb2YgaXIuUmVhZFRlbXBvcmFyeUV4cHIpIHtcbiAgICAgICAgaWYgKGZpbmFsUmVhZHMuZ2V0KGV4cHIueHJlZikgPT09IGV4cHIpIHtcbiAgICAgICAgICByZWxlYXNlZC5hZGQoZXhwci54cmVmKTtcbiAgICAgICAgICBjb3VudC0tO1xuICAgICAgICB9XG4gICAgICAgIGFzc2lnbk5hbWUoZGVmcywgZXhwcik7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBBZGQgZGVjbGFyYXRpb25zIGZvciB0aGUgdGVtcCB2YXJzLlxuICAgIGdlbmVyYXRlZFN0YXRlbWVudHMucHVzaChcbiAgICAgIC4uLkFycmF5LmZyb20obmV3IFNldChkZWZzLnZhbHVlcygpKSkubWFwKChuYW1lKSA9PlxuICAgICAgICBpci5jcmVhdGVTdGF0ZW1lbnRPcDxpci5VcGRhdGVPcD4obmV3IG8uRGVjbGFyZVZhclN0bXQobmFtZSkpLFxuICAgICAgKSxcbiAgICApO1xuICAgIG9wQ291bnQrKztcblxuICAgIGlmIChvcC5raW5kID09PSBpci5PcEtpbmQuTGlzdGVuZXIgfHwgb3Aua2luZCA9PT0gaXIuT3BLaW5kLlR3b1dheUxpc3RlbmVyKSB7XG4gICAgICBvcC5oYW5kbGVyT3BzLnByZXBlbmQoZ2VuZXJhdGVUZW1wb3JhcmllcyhvcC5oYW5kbGVyT3BzKSBhcyBpci5VcGRhdGVPcFtdKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZ2VuZXJhdGVkU3RhdGVtZW50cztcbn1cblxuLyoqXG4gKiBBc3NpZ25zIGEgbmFtZSB0byB0aGUgdGVtcG9yYXJ5IHZhcmlhYmxlIGluIHRoZSBnaXZlbiB0ZW1wb3JhcnkgdmFyaWFibGUgZXhwcmVzc2lvbi5cbiAqL1xuZnVuY3Rpb24gYXNzaWduTmFtZShcbiAgbmFtZXM6IE1hcDxpci5YcmVmSWQsIHN0cmluZz4sXG4gIGV4cHI6IGlyLkFzc2lnblRlbXBvcmFyeUV4cHIgfCBpci5SZWFkVGVtcG9yYXJ5RXhwcixcbikge1xuICBjb25zdCBuYW1lID0gbmFtZXMuZ2V0KGV4cHIueHJlZik7XG4gIGlmIChuYW1lID09PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEZvdW5kIHhyZWYgd2l0aCB1bmFzc2lnbmVkIG5hbWU6ICR7ZXhwci54cmVmfWApO1xuICB9XG4gIGV4cHIubmFtZSA9IG5hbWU7XG59XG4iXX0=