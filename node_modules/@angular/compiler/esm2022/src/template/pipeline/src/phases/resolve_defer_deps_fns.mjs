/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as ir from '../../ir';
/**
 * Resolve the dependency function of a deferred block.
 */
export function resolveDeferDepsFns(job) {
    for (const unit of job.units) {
        for (const op of unit.create) {
            if (op.kind === ir.OpKind.Defer) {
                if (op.resolverFn !== null) {
                    continue;
                }
                if (op.ownResolverFn !== null) {
                    if (op.handle.slot === null) {
                        throw new Error('AssertionError: slot must be assigned before extracting defer deps functions');
                    }
                    const fullPathName = unit.fnName?.replace('_Template', '');
                    op.resolverFn = job.pool.getSharedFunctionReference(op.ownResolverFn, `${fullPathName}_Defer_${op.handle.slot}_DepsFn`, 
                    /* Don't use unique names for TDB compatibility */ false);
                }
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb2x2ZV9kZWZlcl9kZXBzX2Zucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy90ZW1wbGF0ZS9waXBlbGluZS9zcmMvcGhhc2VzL3Jlc29sdmVfZGVmZXJfZGVwc19mbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxLQUFLLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFHL0I7O0dBRUc7QUFDSCxNQUFNLFVBQVUsbUJBQW1CLENBQUMsR0FBNEI7SUFDOUQsS0FBSyxNQUFNLElBQUksSUFBSSxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDN0IsS0FBSyxNQUFNLEVBQUUsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDN0IsSUFBSSxFQUFFLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ2hDLElBQUksRUFBRSxDQUFDLFVBQVUsS0FBSyxJQUFJLEVBQUUsQ0FBQztvQkFDM0IsU0FBUztnQkFDWCxDQUFDO2dCQUVELElBQUksRUFBRSxDQUFDLGFBQWEsS0FBSyxJQUFJLEVBQUUsQ0FBQztvQkFDOUIsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxJQUFJLEVBQUUsQ0FBQzt3QkFDNUIsTUFBTSxJQUFJLEtBQUssQ0FDYiw4RUFBOEUsQ0FDL0UsQ0FBQztvQkFDSixDQUFDO29CQUNELE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQztvQkFDM0QsRUFBRSxDQUFDLFVBQVUsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUNqRCxFQUFFLENBQUMsYUFBYSxFQUNoQixHQUFHLFlBQVksVUFBVSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksU0FBUztvQkFDaEQsa0RBQWtELENBQUMsS0FBSyxDQUN6RCxDQUFDO2dCQUNKLENBQUM7WUFDSCxDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBpciBmcm9tICcuLi8uLi9pcic7XG5pbXBvcnQge0NvbXBvbmVudENvbXBpbGF0aW9uSm9ifSBmcm9tICcuLi9jb21waWxhdGlvbic7XG5cbi8qKlxuICogUmVzb2x2ZSB0aGUgZGVwZW5kZW5jeSBmdW5jdGlvbiBvZiBhIGRlZmVycmVkIGJsb2NrLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZURlZmVyRGVwc0Zucyhqb2I6IENvbXBvbmVudENvbXBpbGF0aW9uSm9iKTogdm9pZCB7XG4gIGZvciAoY29uc3QgdW5pdCBvZiBqb2IudW5pdHMpIHtcbiAgICBmb3IgKGNvbnN0IG9wIG9mIHVuaXQuY3JlYXRlKSB7XG4gICAgICBpZiAob3Aua2luZCA9PT0gaXIuT3BLaW5kLkRlZmVyKSB7XG4gICAgICAgIGlmIChvcC5yZXNvbHZlckZuICE9PSBudWxsKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAob3Aub3duUmVzb2x2ZXJGbiAhPT0gbnVsbCkge1xuICAgICAgICAgIGlmIChvcC5oYW5kbGUuc2xvdCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAnQXNzZXJ0aW9uRXJyb3I6IHNsb3QgbXVzdCBiZSBhc3NpZ25lZCBiZWZvcmUgZXh0cmFjdGluZyBkZWZlciBkZXBzIGZ1bmN0aW9ucycsXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBmdWxsUGF0aE5hbWUgPSB1bml0LmZuTmFtZT8ucmVwbGFjZSgnX1RlbXBsYXRlJywgJycpO1xuICAgICAgICAgIG9wLnJlc29sdmVyRm4gPSBqb2IucG9vbC5nZXRTaGFyZWRGdW5jdGlvblJlZmVyZW5jZShcbiAgICAgICAgICAgIG9wLm93blJlc29sdmVyRm4sXG4gICAgICAgICAgICBgJHtmdWxsUGF0aE5hbWV9X0RlZmVyXyR7b3AuaGFuZGxlLnNsb3R9X0RlcHNGbmAsXG4gICAgICAgICAgICAvKiBEb24ndCB1c2UgdW5pcXVlIG5hbWVzIGZvciBUREIgY29tcGF0aWJpbGl0eSAqLyBmYWxzZSxcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=