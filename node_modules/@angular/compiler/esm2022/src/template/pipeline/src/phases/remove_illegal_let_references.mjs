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
 * It's not allowed to access a `@let` declaration before it has been defined. This is enforced
 * already via template type checking, however it can trip some of the assertions in the pipeline.
 * E.g. the naming phase can fail because we resolved the variable here, but the variable doesn't
 * exist anymore because the optimization phase removed it since it's invalid. To avoid surfacing
 * confusing errors to users in the case where template type checking isn't running (e.g. in JIT
 * mode) this phase detects illegal forward references and replaces them with `undefined`.
 * Eventually users will see the proper error from the template type checker.
 */
export function removeIllegalLetReferences(job) {
    for (const unit of job.units) {
        for (const op of unit.update) {
            if (op.kind !== ir.OpKind.Variable ||
                op.variable.kind !== ir.SemanticVariableKind.Identifier ||
                !(op.initializer instanceof ir.StoreLetExpr)) {
                continue;
            }
            const name = op.variable.identifier;
            let current = op;
            while (current && current.kind !== ir.OpKind.ListEnd) {
                ir.transformExpressionsInOp(current, (expr) => expr instanceof ir.LexicalReadExpr && expr.name === name ? o.literal(undefined) : expr, ir.VisitorContextFlag.None);
                current = current.prev;
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3ZlX2lsbGVnYWxfbGV0X3JlZmVyZW5jZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvdGVtcGxhdGUvcGlwZWxpbmUvc3JjL3BoYXNlcy9yZW1vdmVfaWxsZWdhbF9sZXRfcmVmZXJlbmNlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEtBQUssQ0FBQyxNQUFNLCtCQUErQixDQUFDO0FBQ25ELE9BQU8sS0FBSyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRy9COzs7Ozs7OztHQVFHO0FBQ0gsTUFBTSxVQUFVLDBCQUEwQixDQUFDLEdBQW1CO0lBQzVELEtBQUssTUFBTSxJQUFJLElBQUksR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzdCLEtBQUssTUFBTSxFQUFFLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQzdCLElBQ0UsRUFBRSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVE7Z0JBQzlCLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQyxVQUFVO2dCQUN2RCxDQUFDLENBQUMsRUFBRSxDQUFDLFdBQVcsWUFBWSxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQzVDLENBQUM7Z0JBQ0QsU0FBUztZQUNYLENBQUM7WUFFRCxNQUFNLElBQUksR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQztZQUNwQyxJQUFJLE9BQU8sR0FBdUIsRUFBRSxDQUFDO1lBQ3JDLE9BQU8sT0FBTyxJQUFJLE9BQU8sQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDckQsRUFBRSxDQUFDLHdCQUF3QixDQUN6QixPQUFPLEVBQ1AsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUNQLElBQUksWUFBWSxFQUFFLENBQUMsZUFBZSxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQ3hGLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQzNCLENBQUM7Z0JBQ0YsT0FBTyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUM7WUFDekIsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgbyBmcm9tICcuLi8uLi8uLi8uLi9vdXRwdXQvb3V0cHV0X2FzdCc7XG5pbXBvcnQgKiBhcyBpciBmcm9tICcuLi8uLi9pcic7XG5pbXBvcnQge0NvbXBpbGF0aW9uSm9ifSBmcm9tICcuLi9jb21waWxhdGlvbic7XG5cbi8qKlxuICogSXQncyBub3QgYWxsb3dlZCB0byBhY2Nlc3MgYSBgQGxldGAgZGVjbGFyYXRpb24gYmVmb3JlIGl0IGhhcyBiZWVuIGRlZmluZWQuIFRoaXMgaXMgZW5mb3JjZWRcbiAqIGFscmVhZHkgdmlhIHRlbXBsYXRlIHR5cGUgY2hlY2tpbmcsIGhvd2V2ZXIgaXQgY2FuIHRyaXAgc29tZSBvZiB0aGUgYXNzZXJ0aW9ucyBpbiB0aGUgcGlwZWxpbmUuXG4gKiBFLmcuIHRoZSBuYW1pbmcgcGhhc2UgY2FuIGZhaWwgYmVjYXVzZSB3ZSByZXNvbHZlZCB0aGUgdmFyaWFibGUgaGVyZSwgYnV0IHRoZSB2YXJpYWJsZSBkb2Vzbid0XG4gKiBleGlzdCBhbnltb3JlIGJlY2F1c2UgdGhlIG9wdGltaXphdGlvbiBwaGFzZSByZW1vdmVkIGl0IHNpbmNlIGl0J3MgaW52YWxpZC4gVG8gYXZvaWQgc3VyZmFjaW5nXG4gKiBjb25mdXNpbmcgZXJyb3JzIHRvIHVzZXJzIGluIHRoZSBjYXNlIHdoZXJlIHRlbXBsYXRlIHR5cGUgY2hlY2tpbmcgaXNuJ3QgcnVubmluZyAoZS5nLiBpbiBKSVRcbiAqIG1vZGUpIHRoaXMgcGhhc2UgZGV0ZWN0cyBpbGxlZ2FsIGZvcndhcmQgcmVmZXJlbmNlcyBhbmQgcmVwbGFjZXMgdGhlbSB3aXRoIGB1bmRlZmluZWRgLlxuICogRXZlbnR1YWxseSB1c2VycyB3aWxsIHNlZSB0aGUgcHJvcGVyIGVycm9yIGZyb20gdGhlIHRlbXBsYXRlIHR5cGUgY2hlY2tlci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZUlsbGVnYWxMZXRSZWZlcmVuY2VzKGpvYjogQ29tcGlsYXRpb25Kb2IpOiB2b2lkIHtcbiAgZm9yIChjb25zdCB1bml0IG9mIGpvYi51bml0cykge1xuICAgIGZvciAoY29uc3Qgb3Agb2YgdW5pdC51cGRhdGUpIHtcbiAgICAgIGlmIChcbiAgICAgICAgb3Aua2luZCAhPT0gaXIuT3BLaW5kLlZhcmlhYmxlIHx8XG4gICAgICAgIG9wLnZhcmlhYmxlLmtpbmQgIT09IGlyLlNlbWFudGljVmFyaWFibGVLaW5kLklkZW50aWZpZXIgfHxcbiAgICAgICAgIShvcC5pbml0aWFsaXplciBpbnN0YW5jZW9mIGlyLlN0b3JlTGV0RXhwcilcbiAgICAgICkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgbmFtZSA9IG9wLnZhcmlhYmxlLmlkZW50aWZpZXI7XG4gICAgICBsZXQgY3VycmVudDogaXIuVXBkYXRlT3AgfCBudWxsID0gb3A7XG4gICAgICB3aGlsZSAoY3VycmVudCAmJiBjdXJyZW50LmtpbmQgIT09IGlyLk9wS2luZC5MaXN0RW5kKSB7XG4gICAgICAgIGlyLnRyYW5zZm9ybUV4cHJlc3Npb25zSW5PcChcbiAgICAgICAgICBjdXJyZW50LFxuICAgICAgICAgIChleHByKSA9PlxuICAgICAgICAgICAgZXhwciBpbnN0YW5jZW9mIGlyLkxleGljYWxSZWFkRXhwciAmJiBleHByLm5hbWUgPT09IG5hbWUgPyBvLmxpdGVyYWwodW5kZWZpbmVkKSA6IGV4cHIsXG4gICAgICAgICAgaXIuVmlzaXRvckNvbnRleHRGbGFnLk5vbmUsXG4gICAgICAgICk7XG4gICAgICAgIGN1cnJlbnQgPSBjdXJyZW50LnByZXY7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=