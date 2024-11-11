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
 * Any variable inside a listener with the name `$event` will be transformed into a output lexical
 * read immediately, and does not participate in any of the normal logic for handling variables.
 */
export function resolveDollarEvent(job) {
    for (const unit of job.units) {
        transformDollarEvent(unit.create);
        transformDollarEvent(unit.update);
    }
}
function transformDollarEvent(ops) {
    for (const op of ops) {
        if (op.kind === ir.OpKind.Listener || op.kind === ir.OpKind.TwoWayListener) {
            ir.transformExpressionsInOp(op, (expr) => {
                if (expr instanceof ir.LexicalReadExpr && expr.name === '$event') {
                    // Two-way listeners always consume `$event` so they omit this field.
                    if (op.kind === ir.OpKind.Listener) {
                        op.consumesDollarEvent = true;
                    }
                    return new o.ReadVarExpr(expr.name);
                }
                return expr;
            }, ir.VisitorContextFlag.InChildOperation);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb2x2ZV9kb2xsYXJfZXZlbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvdGVtcGxhdGUvcGlwZWxpbmUvc3JjL3BoYXNlcy9yZXNvbHZlX2RvbGxhcl9ldmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEtBQUssQ0FBQyxNQUFNLCtCQUErQixDQUFDO0FBQ25ELE9BQU8sS0FBSyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRy9COzs7R0FHRztBQUNILE1BQU0sVUFBVSxrQkFBa0IsQ0FBQyxHQUFtQjtJQUNwRCxLQUFLLE1BQU0sSUFBSSxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM3QixvQkFBb0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbEMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3BDLENBQUM7QUFDSCxDQUFDO0FBRUQsU0FBUyxvQkFBb0IsQ0FBQyxHQUFvRDtJQUNoRixLQUFLLE1BQU0sRUFBRSxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ3JCLElBQUksRUFBRSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsSUFBSSxFQUFFLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDM0UsRUFBRSxDQUFDLHdCQUF3QixDQUN6QixFQUFFLEVBQ0YsQ0FBQyxJQUFJLEVBQUUsRUFBRTtnQkFDUCxJQUFJLElBQUksWUFBWSxFQUFFLENBQUMsZUFBZSxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssUUFBUSxFQUFFLENBQUM7b0JBQ2pFLHFFQUFxRTtvQkFDckUsSUFBSSxFQUFFLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7d0JBQ25DLEVBQUUsQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLENBQUM7b0JBQ2hDLENBQUM7b0JBQ0QsT0FBTyxJQUFJLENBQUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUN0QyxDQUFDO2dCQUNELE9BQU8sSUFBSSxDQUFDO1lBQ2QsQ0FBQyxFQUNELEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxnQkFBZ0IsQ0FDdkMsQ0FBQztRQUNKLENBQUM7SUFDSCxDQUFDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgbyBmcm9tICcuLi8uLi8uLi8uLi9vdXRwdXQvb3V0cHV0X2FzdCc7XG5pbXBvcnQgKiBhcyBpciBmcm9tICcuLi8uLi9pcic7XG5pbXBvcnQgdHlwZSB7Q29tcGlsYXRpb25Kb2J9IGZyb20gJy4uL2NvbXBpbGF0aW9uJztcblxuLyoqXG4gKiBBbnkgdmFyaWFibGUgaW5zaWRlIGEgbGlzdGVuZXIgd2l0aCB0aGUgbmFtZSBgJGV2ZW50YCB3aWxsIGJlIHRyYW5zZm9ybWVkIGludG8gYSBvdXRwdXQgbGV4aWNhbFxuICogcmVhZCBpbW1lZGlhdGVseSwgYW5kIGRvZXMgbm90IHBhcnRpY2lwYXRlIGluIGFueSBvZiB0aGUgbm9ybWFsIGxvZ2ljIGZvciBoYW5kbGluZyB2YXJpYWJsZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlRG9sbGFyRXZlbnQoam9iOiBDb21waWxhdGlvbkpvYik6IHZvaWQge1xuICBmb3IgKGNvbnN0IHVuaXQgb2Ygam9iLnVuaXRzKSB7XG4gICAgdHJhbnNmb3JtRG9sbGFyRXZlbnQodW5pdC5jcmVhdGUpO1xuICAgIHRyYW5zZm9ybURvbGxhckV2ZW50KHVuaXQudXBkYXRlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiB0cmFuc2Zvcm1Eb2xsYXJFdmVudChvcHM6IGlyLk9wTGlzdDxpci5DcmVhdGVPcD4gfCBpci5PcExpc3Q8aXIuVXBkYXRlT3A+KTogdm9pZCB7XG4gIGZvciAoY29uc3Qgb3Agb2Ygb3BzKSB7XG4gICAgaWYgKG9wLmtpbmQgPT09IGlyLk9wS2luZC5MaXN0ZW5lciB8fCBvcC5raW5kID09PSBpci5PcEtpbmQuVHdvV2F5TGlzdGVuZXIpIHtcbiAgICAgIGlyLnRyYW5zZm9ybUV4cHJlc3Npb25zSW5PcChcbiAgICAgICAgb3AsXG4gICAgICAgIChleHByKSA9PiB7XG4gICAgICAgICAgaWYgKGV4cHIgaW5zdGFuY2VvZiBpci5MZXhpY2FsUmVhZEV4cHIgJiYgZXhwci5uYW1lID09PSAnJGV2ZW50Jykge1xuICAgICAgICAgICAgLy8gVHdvLXdheSBsaXN0ZW5lcnMgYWx3YXlzIGNvbnN1bWUgYCRldmVudGAgc28gdGhleSBvbWl0IHRoaXMgZmllbGQuXG4gICAgICAgICAgICBpZiAob3Aua2luZCA9PT0gaXIuT3BLaW5kLkxpc3RlbmVyKSB7XG4gICAgICAgICAgICAgIG9wLmNvbnN1bWVzRG9sbGFyRXZlbnQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG5ldyBvLlJlYWRWYXJFeHByKGV4cHIubmFtZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBleHByO1xuICAgICAgICB9LFxuICAgICAgICBpci5WaXNpdG9yQ29udGV4dEZsYWcuSW5DaGlsZE9wZXJhdGlvbixcbiAgICAgICk7XG4gICAgfVxuICB9XG59XG4iXX0=