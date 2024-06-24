/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb2x2ZV9kZWZlcl9kZXBzX2Zucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy90ZW1wbGF0ZS9waXBlbGluZS9zcmMvcGhhc2VzL3Jlc29sdmVfZGVmZXJfZGVwc19mbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxLQUFLLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFHL0I7O0dBRUc7QUFDSCxNQUFNLFVBQVUsbUJBQW1CLENBQUMsR0FBNEI7SUFDOUQsS0FBSyxNQUFNLElBQUksSUFBSSxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDN0IsS0FBSyxNQUFNLEVBQUUsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDN0IsSUFBSSxFQUFFLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ2hDLElBQUksRUFBRSxDQUFDLFVBQVUsS0FBSyxJQUFJLEVBQUUsQ0FBQztvQkFDM0IsU0FBUztnQkFDWCxDQUFDO2dCQUVELElBQUksRUFBRSxDQUFDLGFBQWEsS0FBSyxJQUFJLEVBQUUsQ0FBQztvQkFDOUIsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxJQUFJLEVBQUUsQ0FBQzt3QkFDNUIsTUFBTSxJQUFJLEtBQUssQ0FDYiw4RUFBOEUsQ0FDL0UsQ0FBQztvQkFDSixDQUFDO29CQUNELE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQztvQkFDM0QsRUFBRSxDQUFDLFVBQVUsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUNqRCxFQUFFLENBQUMsYUFBYSxFQUNoQixHQUFHLFlBQVksVUFBVSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksU0FBUztvQkFDaEQsa0RBQWtELENBQUMsS0FBSyxDQUN6RCxDQUFDO2dCQUNKLENBQUM7WUFDSCxDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIGlyIGZyb20gJy4uLy4uL2lyJztcbmltcG9ydCB7Q29tcG9uZW50Q29tcGlsYXRpb25Kb2J9IGZyb20gJy4uL2NvbXBpbGF0aW9uJztcblxuLyoqXG4gKiBSZXNvbHZlIHRoZSBkZXBlbmRlbmN5IGZ1bmN0aW9uIG9mIGEgZGVmZXJyZWQgYmxvY2suXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlRGVmZXJEZXBzRm5zKGpvYjogQ29tcG9uZW50Q29tcGlsYXRpb25Kb2IpOiB2b2lkIHtcbiAgZm9yIChjb25zdCB1bml0IG9mIGpvYi51bml0cykge1xuICAgIGZvciAoY29uc3Qgb3Agb2YgdW5pdC5jcmVhdGUpIHtcbiAgICAgIGlmIChvcC5raW5kID09PSBpci5PcEtpbmQuRGVmZXIpIHtcbiAgICAgICAgaWYgKG9wLnJlc29sdmVyRm4gIT09IG51bGwpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvcC5vd25SZXNvbHZlckZuICE9PSBudWxsKSB7XG4gICAgICAgICAgaWYgKG9wLmhhbmRsZS5zbG90ID09PSBudWxsKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICdBc3NlcnRpb25FcnJvcjogc2xvdCBtdXN0IGJlIGFzc2lnbmVkIGJlZm9yZSBleHRyYWN0aW5nIGRlZmVyIGRlcHMgZnVuY3Rpb25zJyxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IGZ1bGxQYXRoTmFtZSA9IHVuaXQuZm5OYW1lPy5yZXBsYWNlKCdfVGVtcGxhdGUnLCAnJyk7XG4gICAgICAgICAgb3AucmVzb2x2ZXJGbiA9IGpvYi5wb29sLmdldFNoYXJlZEZ1bmN0aW9uUmVmZXJlbmNlKFxuICAgICAgICAgICAgb3Aub3duUmVzb2x2ZXJGbixcbiAgICAgICAgICAgIGAke2Z1bGxQYXRoTmFtZX1fRGVmZXJfJHtvcC5oYW5kbGUuc2xvdH1fRGVwc0ZuYCxcbiAgICAgICAgICAgIC8qIERvbid0IHVzZSB1bmlxdWUgbmFtZXMgZm9yIFREQiBjb21wYXRpYmlsaXR5ICovIGZhbHNlLFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==