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
 * Find any function calls to `$any`, excluding `this.$any`, and delete them, since they have no
 * runtime effects.
 */
export function deleteAnyCasts(job) {
    for (const unit of job.units) {
        for (const op of unit.ops()) {
            ir.transformExpressionsInOp(op, removeAnys, ir.VisitorContextFlag.None);
        }
    }
}
function removeAnys(e) {
    if (e instanceof o.InvokeFunctionExpr &&
        e.fn instanceof ir.LexicalReadExpr &&
        e.fn.name === '$any') {
        if (e.args.length !== 1) {
            throw new Error('The $any builtin function expects exactly one argument.');
        }
        return e.args[0];
    }
    return e;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW55X2Nhc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvdGVtcGxhdGUvcGlwZWxpbmUvc3JjL3BoYXNlcy9hbnlfY2FzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEtBQUssQ0FBQyxNQUFNLCtCQUErQixDQUFDO0FBQ25ELE9BQU8sS0FBSyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRy9COzs7R0FHRztBQUNILE1BQU0sVUFBVSxjQUFjLENBQUMsR0FBbUI7SUFDaEQsS0FBSyxNQUFNLElBQUksSUFBSSxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDN0IsS0FBSyxNQUFNLEVBQUUsSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQztZQUM1QixFQUFFLENBQUMsd0JBQXdCLENBQUMsRUFBRSxFQUFFLFVBQVUsRUFBRSxFQUFFLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDMUUsQ0FBQztJQUNILENBQUM7QUFDSCxDQUFDO0FBRUQsU0FBUyxVQUFVLENBQUMsQ0FBZTtJQUNqQyxJQUNFLENBQUMsWUFBWSxDQUFDLENBQUMsa0JBQWtCO1FBQ2pDLENBQUMsQ0FBQyxFQUFFLFlBQVksRUFBRSxDQUFDLGVBQWU7UUFDbEMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEtBQUssTUFBTSxFQUNwQixDQUFDO1FBQ0QsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUN4QixNQUFNLElBQUksS0FBSyxDQUFDLHlEQUF5RCxDQUFDLENBQUM7UUFDN0UsQ0FBQztRQUNELE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNuQixDQUFDO0lBQ0QsT0FBTyxDQUFDLENBQUM7QUFDWCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBvIGZyb20gJy4uLy4uLy4uLy4uL291dHB1dC9vdXRwdXRfYXN0JztcbmltcG9ydCAqIGFzIGlyIGZyb20gJy4uLy4uL2lyJztcbmltcG9ydCB7Q29tcGlsYXRpb25Kb2J9IGZyb20gJy4uL2NvbXBpbGF0aW9uJztcblxuLyoqXG4gKiBGaW5kIGFueSBmdW5jdGlvbiBjYWxscyB0byBgJGFueWAsIGV4Y2x1ZGluZyBgdGhpcy4kYW55YCwgYW5kIGRlbGV0ZSB0aGVtLCBzaW5jZSB0aGV5IGhhdmUgbm9cbiAqIHJ1bnRpbWUgZWZmZWN0cy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlbGV0ZUFueUNhc3RzKGpvYjogQ29tcGlsYXRpb25Kb2IpOiB2b2lkIHtcbiAgZm9yIChjb25zdCB1bml0IG9mIGpvYi51bml0cykge1xuICAgIGZvciAoY29uc3Qgb3Agb2YgdW5pdC5vcHMoKSkge1xuICAgICAgaXIudHJhbnNmb3JtRXhwcmVzc2lvbnNJbk9wKG9wLCByZW1vdmVBbnlzLCBpci5WaXNpdG9yQ29udGV4dEZsYWcuTm9uZSk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUFueXMoZTogby5FeHByZXNzaW9uKTogby5FeHByZXNzaW9uIHtcbiAgaWYgKFxuICAgIGUgaW5zdGFuY2VvZiBvLkludm9rZUZ1bmN0aW9uRXhwciAmJlxuICAgIGUuZm4gaW5zdGFuY2VvZiBpci5MZXhpY2FsUmVhZEV4cHIgJiZcbiAgICBlLmZuLm5hbWUgPT09ICckYW55J1xuICApIHtcbiAgICBpZiAoZS5hcmdzLmxlbmd0aCAhPT0gMSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGUgJGFueSBidWlsdGluIGZ1bmN0aW9uIGV4cGVjdHMgZXhhY3RseSBvbmUgYXJndW1lbnQuJyk7XG4gICAgfVxuICAgIHJldHVybiBlLmFyZ3NbMF07XG4gIH1cbiAgcmV0dXJuIGU7XG59XG4iXX0=