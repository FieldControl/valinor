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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVtcG9yYXJ5X3ZhcmlhYmxlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy90ZW1wbGF0ZS9waXBlbGluZS9zcmMvcGhhc2VzL3RlbXBvcmFyeV92YXJpYWJsZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxLQUFLLENBQUMsTUFBTSwrQkFBK0IsQ0FBQztBQUNuRCxPQUFPLEtBQUssRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUcvQjs7Ozs7Ozs7R0FRRztBQUNILE1BQU0sVUFBVSwwQkFBMEIsQ0FBQyxHQUFtQjtJQUM1RCxLQUFLLE1BQU0sSUFBSSxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM3QixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUF1QyxDQUFDLENBQUM7UUFDNUYsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBdUMsQ0FBQyxDQUFDO0lBQzlGLENBQUM7QUFDSCxDQUFDO0FBRUQsU0FBUyxtQkFBbUIsQ0FDMUIsR0FBeUM7SUFFekMsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDO0lBQ2hCLElBQUksbUJBQW1CLEdBQXVDLEVBQUUsQ0FBQztJQUVqRSxpR0FBaUc7SUFDakcscUVBQXFFO0lBQ3JFLEtBQUssTUFBTSxFQUFFLElBQUksR0FBRyxFQUFFLENBQUM7UUFDckIsaURBQWlEO1FBQ2pELE1BQU0sVUFBVSxHQUFHLElBQUksR0FBRyxFQUFtQyxDQUFDO1FBQzlELEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEVBQUU7WUFDekMsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDLGtCQUFrQixDQUFDLGdC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QUFDLG9DQUFvQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUNuRSxDQUFDO0lBQ0QsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7QUFDbkIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgbyBmcm9tICcuLi8uLi8uLi8uLi9vdXRwdXQvb3V0cHV0X2FzdCc7XG5pbXBvcnQgKiBhcyBpciBmcm9tICcuLi8uLi9pcic7XG5pbXBvcnQgdHlwZSB7Q29tcGlsYXRpb25Kb2J9IGZyb20gJy4uL2NvbXBpbGF0aW9uJztcblxuLyoqXG4gKiBGaW5kIGFsbCBhc3NpZ25tZW50cyBhbmQgdXNhZ2VzIG9mIHRlbXBvcmFyeSB2YXJpYWJsZXMsIHdoaWNoIGFyZSBsaW5rZWQgdG8gZWFjaCBvdGhlciB3aXRoIGNyb3NzXG4gKiByZWZlcmVuY2VzLiBHZW5lcmF0ZSBuYW1lcyBmb3IgZWFjaCBjcm9zcy1yZWZlcmVuY2UsIGFuZCBhZGQgYSBgRGVjbGFyZVZhclN0bXRgIHRvIGluaXRpYWxpemVcbiAqIHRoZW0gYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgdXBkYXRlIGJsb2NrLlxuICpcbiAqIFRPRE86IFNvbWV0aW1lcywgaXQgd2lsbCBiZSBwb3NzaWJsZSB0byByZXVzZSBuYW1lcyBhY3Jvc3MgZGlmZmVyZW50IHN1YmV4cHJlc3Npb25zLiBGb3IgZXhhbXBsZSxcbiAqIGluIHRoZSBkb3VibGUga2V5ZWQgcmVhZCBgYT8uW2YoKV0/LltmKCldYCwgdGhlIHR3byBmdW5jdGlvbiBjYWxscyBoYXZlIG5vbi1vdmVybGFwcGluZyBzY29wZXMuXG4gKiBJbXBsZW1lbnQgYW4gYWxnb3JpdGhtIGZvciByZXVzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlVGVtcG9yYXJ5VmFyaWFibGVzKGpvYjogQ29tcGlsYXRpb25Kb2IpOiB2b2lkIHtcbiAgZm9yIChjb25zdCB1bml0IG9mIGpvYi51bml0cykge1xuICAgIHVuaXQuY3JlYXRlLnByZXBlbmQoZ2VuZXJhdGVUZW1wb3Jhcmllcyh1bml0LmNyZWF0ZSkgYXMgQXJyYXk8aXIuU3RhdGVtZW50T3A8aXIuQ3JlYXRlT3A+Pik7XG4gICAgdW5pdC51cGRhdGUucHJlcGVuZChnZW5lcmF0ZVRlbXBvcmFyaWVzKHVuaXQudXBkYXRlKSBhcyBBcnJheTxpci5TdGF0ZW1lbnRPcDxpci5VcGRhdGVPcD4+KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZW5lcmF0ZVRlbXBvcmFyaWVzKFxuICBvcHM6IGlyLk9wTGlzdDxpci5DcmVhdGVPcCB8IGlyLlVwZGF0ZU9wPixcbik6IEFycmF5PGlyLlN0YXRlbWVudE9wPGlyLkNyZWF0ZU9wIHwgaXIuVXBkYXRlT3A+PiB7XG4gIGxldCBvcENvdW50ID0gMDtcbiAgbGV0IGdlbmVyYXRlZFN0YXRlbWVudHM6IEFycmF5PGlyLlN0YXRlbWVudE9wPGlyLlVwZGF0ZU9wPj4gPSBbXTtcblxuICAvLyBGb3IgZWFjaCBvcCwgc2VhcmNoIGZvciBhbnkgdmFyaWFibGVzIHRoYXQgYXJlIGFzc2lnbmVkIG9yIHJlYWQuIEZvciBlYWNoIHZhcmlhYmxlLCBnZW5lcmF0ZSBhXG4gIC8vIG5hbWUgYW5kIHByb2R1Y2UgYSBgRGVjbGFyZVZhclN0bXRgIHRvIHRoZSBiZWdpbm5pbmcgb2YgdGhlIGJsb2NrLlxuICBmb3IgKGNvbnN0IG9wIG9mIG9wcykge1xuICAgIC8vIElkZW50aWZ5IHRoZSBmaW5hbCB0aW1lIGVhY2ggdGVtcCB2YXIgaXMgcmVhZC5cbiAgICBjb25zdCBmaW5hbFJlYWRzID0gbmV3IE1hcDxpci5YcmVmSWQsIGlyLlJlYWRUZW1wb3JhcnlFeHByPigpO1xuICAgIGlyLnZpc2l0RXhwcmVzc2lvbnNJbk9wKG9wLCAoZXhwciwgZmxhZykgPT4ge1xuICAgICAgaWYgKGZsYWcgJiBpci5WaXNpdG9yQ29udGV4dEZsYWcuSW5DaGlsZE9wZXJhdGlvbikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoZXhwciBpbnN0YW5jZW9mIGlyLlJlYWRUZW1wb3JhcnlFeHByKSB7XG4gICAgICAgIGZpbmFsUmVhZHMuc2V0KGV4cHIueHJlZiwgZXhwcik7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBOYW1lIHRoZSB0ZW1wIHZhcnMsIGFjY291bnRpbmcgZm9yIHRoZSBmYWN0IHRoYXQgYSBuYW1lIGNhbiBiZSByZXVzZWQgYWZ0ZXIgaXQgaGFzIGJlZW5cbiAgICAvLyByZWFkIGZvciB0aGUgZmluYWwgdGltZS5cbiAgICBsZXQgY291bnQgPSAwO1xuICAgIGNvbnN0IGFzc2lnbmVkID0gbmV3IFNldDxpci5YcmVmSWQ+KCk7XG4gICAgY29uc3QgcmVsZWFzZWQgPSBuZXcgU2V0PGlyLlhyZWZJZD4oKTtcbiAgICBjb25zdCBkZWZzID0gbmV3IE1hcDxpci5YcmVmSWQsIHN0cmluZz4oKTtcbiAgICBpci52aXNpdEV4cHJlc3Npb25zSW5PcChvcCwgKGV4cHIsIGZsYWcpID0+IHtcbiAgICAgIGlmIChmbGFnICYgaXIuVmlzaXRvckNvbnRleHRGbGFnLkluQ2hpbGRPcGVyYXRpb24pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKGV4cHIgaW5zdGFuY2VvZiBpci5Bc3NpZ25UZW1wb3JhcnlFeHByKSB7XG4gICAgICAgIGlmICghYXNzaWduZWQuaGFzKGV4cHIueHJlZikpIHtcbiAgICAgICAgICBhc3NpZ25lZC5hZGQoZXhwci54cmVmKTtcbiAgICAgICAgICAvLyBUT0RPOiBFeGFjdGx5IHJlcGxpY2F0ZSB0aGUgbmFtaW5nIHNjaGVtZSB1c2VkIGJ5IGBUZW1wbGF0ZURlZmluaXRpb25CdWlsZGVyYC5cbiAgICAgICAgICAvLyBJdCBzZWVtcyB0byByZWx5IG9uIGFuIGV4cHJlc3Npb24gaW5kZXggaW5zdGVhZCBvZiBhbiBvcCBpbmRleC5cbiAgICAgICAgICBkZWZzLnNldChleHByLnhyZWYsIGB0bXBfJHtvcENvdW50fV8ke2NvdW50Kyt9YCk7XG4gICAgICAgIH1cbiAgICAgICAgYXNzaWduTmFtZShkZWZzLCBleHByKTtcbiAgICAgIH0gZWxzZSBpZiAoZXhwciBpbnN0YW5jZW9mIGlyLlJlYWRUZW1wb3JhcnlFeHByKSB7XG4gICAgICAgIGlmIChmaW5hbFJlYWRzLmdldChleHByLnhyZWYpID09PSBleHByKSB7XG4gICAgICAgICAgcmVsZWFzZWQuYWRkKGV4cHIueHJlZik7XG4gICAgICAgICAgY291bnQtLTtcbiAgICAgICAgfVxuICAgICAgICBhc3NpZ25OYW1lKGRlZnMsIGV4cHIpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gQWRkIGRlY2xhcmF0aW9ucyBmb3IgdGhlIHRlbXAgdmFycy5cbiAgICBnZW5lcmF0ZWRTdGF0ZW1lbnRzLnB1c2goXG4gICAgICAuLi5BcnJheS5mcm9tKG5ldyBTZXQoZGVmcy52YWx1ZXMoKSkpLm1hcCgobmFtZSkgPT5cbiAgICAgICAgaXIuY3JlYXRlU3RhdGVtZW50T3A8aXIuVXBkYXRlT3A+KG5ldyBvLkRlY2xhcmVWYXJTdG10KG5hbWUpKSxcbiAgICAgICksXG4gICAgKTtcbiAgICBvcENvdW50Kys7XG5cbiAgICBpZiAob3Aua2luZCA9PT0gaXIuT3BLaW5kLkxpc3RlbmVyIHx8IG9wLmtpbmQgPT09IGlyLk9wS2luZC5Ud29XYXlMaXN0ZW5lcikge1xuICAgICAgb3AuaGFuZGxlck9wcy5wcmVwZW5kKGdlbmVyYXRlVGVtcG9yYXJpZXMob3AuaGFuZGxlck9wcykgYXMgaXIuVXBkYXRlT3BbXSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGdlbmVyYXRlZFN0YXRlbWVudHM7XG59XG5cbi8qKlxuICogQXNzaWducyBhIG5hbWUgdG8gdGhlIHRlbXBvcmFyeSB2YXJpYWJsZSBpbiB0aGUgZ2l2ZW4gdGVtcG9yYXJ5IHZhcmlhYmxlIGV4cHJlc3Npb24uXG4gKi9cbmZ1bmN0aW9uIGFzc2lnbk5hbWUoXG4gIG5hbWVzOiBNYXA8aXIuWHJlZklkLCBzdHJpbmc+LFxuICBleHByOiBpci5Bc3NpZ25UZW1wb3JhcnlFeHByIHwgaXIuUmVhZFRlbXBvcmFyeUV4cHIsXG4pIHtcbiAgY29uc3QgbmFtZSA9IG5hbWVzLmdldChleHByLnhyZWYpO1xuICBpZiAobmFtZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBGb3VuZCB4cmVmIHdpdGggdW5hc3NpZ25lZCBuYW1lOiAke2V4cHIueHJlZn1gKTtcbiAgfVxuICBleHByLm5hbWUgPSBuYW1lO1xufVxuIl19