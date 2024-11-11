/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as ir from '../../ir';
/**
 * Removes any `storeLet` calls that aren't referenced outside of the current view.
 */
export function optimizeStoreLet(job) {
    const letUsedExternally = new Set();
    // Since `@let` declarations can be referenced in child views, both in
    // the creation block (via listeners) and in the update block, we have
    // to look through all the ops to find the references.
    for (const unit of job.units) {
        for (const op of unit.ops()) {
            ir.visitExpressionsInOp(op, (expr) => {
                if (expr instanceof ir.ContextLetReferenceExpr) {
                    letUsedExternally.add(expr.target);
                }
            });
        }
    }
    // TODO(crisbeto): potentially remove the unused calls completely, pending discussion.
    for (const unit of job.units) {
        for (const op of unit.update) {
            ir.transformExpressionsInOp(op, (expression) => expression instanceof ir.StoreLetExpr && !letUsedExternally.has(expression.target)
                ? expression.value
                : expression, ir.VisitorContextFlag.None);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmVfbGV0X29wdGltaXphdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy90ZW1wbGF0ZS9waXBlbGluZS9zcmMvcGhhc2VzL3N0b3JlX2xldF9vcHRpbWl6YXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBR0gsT0FBTyxLQUFLLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFHL0I7O0dBRUc7QUFDSCxNQUFNLFVBQVUsZ0JBQWdCLENBQUMsR0FBbUI7SUFDbEQsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLEdBQUcsRUFBYSxDQUFDO0lBRS9DLHNFQUFzRTtJQUN0RSxzRUFBc0U7SUFDdEUsc0RBQXNEO0lBQ3RELEtBQUssTUFBTSxJQUFJLElBQUksR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzdCLEtBQUssTUFBTSxFQUFFLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUM7WUFDNUIsRUFBRSxDQUFDLG9CQUFvQixDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFO2dCQUNuQyxJQUFJLElBQUksWUFBWSxFQUFFLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztvQkFDL0MsaUJBQWlCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDckMsQ0FBQztZQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztJQUNILENBQUM7SUFFRCxzRkFBc0Y7SUFDdEYsS0FBSyxNQUFNLElBQUksSUFBSSxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDN0IsS0FBSyxNQUFNLEVBQUUsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDN0IsRUFBRSxDQUFDLHdCQUF3QixDQUN6QixFQUFFLEVBQ0YsQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUNiLFVBQVUsWUFBWSxFQUFFLENBQUMsWUFBWSxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUM7Z0JBQ2hGLENBQUMsQ0FBQyxVQUFVLENBQUMsS0FBSztnQkFDbEIsQ0FBQyxDQUFDLFVBQVUsRUFDaEIsRUFBRSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FDM0IsQ0FBQztRQUNKLENBQUM7SUFDSCxDQUFDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qIVxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgbyBmcm9tICcuLi8uLi8uLi8uLi9vdXRwdXQvb3V0cHV0X2FzdCc7XG5pbXBvcnQgKiBhcyBpciBmcm9tICcuLi8uLi9pcic7XG5pbXBvcnQge0NvbXBpbGF0aW9uSm9ifSBmcm9tICcuLi9jb21waWxhdGlvbic7XG5cbi8qKlxuICogUmVtb3ZlcyBhbnkgYHN0b3JlTGV0YCBjYWxscyB0aGF0IGFyZW4ndCByZWZlcmVuY2VkIG91dHNpZGUgb2YgdGhlIGN1cnJlbnQgdmlldy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG9wdGltaXplU3RvcmVMZXQoam9iOiBDb21waWxhdGlvbkpvYik6IHZvaWQge1xuICBjb25zdCBsZXRVc2VkRXh0ZXJuYWxseSA9IG5ldyBTZXQ8aXIuWHJlZklkPigpO1xuXG4gIC8vIFNpbmNlIGBAbGV0YCBkZWNsYXJhdGlvbnMgY2FuIGJlIHJlZmVyZW5jZWQgaW4gY2hpbGQgdmlld3MsIGJvdGggaW5cbiAgLy8gdGhlIGNyZWF0aW9uIGJsb2NrICh2aWEgbGlzdGVuZXJzKSBhbmQgaW4gdGhlIHVwZGF0ZSBibG9jaywgd2UgaGF2ZVxuICAvLyB0byBsb29rIHRocm91Z2ggYWxsIHRoZSBvcHMgdG8gZmluZCB0aGUgcmVmZXJlbmNlcy5cbiAgZm9yIChjb25zdCB1bml0IG9mIGpvYi51bml0cykge1xuICAgIGZvciAoY29uc3Qgb3Agb2YgdW5pdC5vcHMoKSkge1xuICAgICAgaXIudmlzaXRFeHByZXNzaW9uc0luT3Aob3AsIChleHByKSA9PiB7XG4gICAgICAgIGlmIChleHByIGluc3RhbmNlb2YgaXIuQ29udGV4dExldFJlZmVyZW5jZUV4cHIpIHtcbiAgICAgICAgICBsZXRVc2VkRXh0ZXJuYWxseS5hZGQoZXhwci50YXJnZXQpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvLyBUT0RPKGNyaXNiZXRvKTogcG90ZW50aWFsbHkgcmVtb3ZlIHRoZSB1bnVzZWQgY2FsbHMgY29tcGxldGVseSwgcGVuZGluZyBkaXNjdXNzaW9uLlxuICBmb3IgKGNvbnN0IHVuaXQgb2Ygam9iLnVuaXRzKSB7XG4gICAgZm9yIChjb25zdCBvcCBvZiB1bml0LnVwZGF0ZSkge1xuICAgICAgaXIudHJhbnNmb3JtRXhwcmVzc2lvbnNJbk9wKFxuICAgICAgICBvcCxcbiAgICAgICAgKGV4cHJlc3Npb24pID0+XG4gICAgICAgICAgZXhwcmVzc2lvbiBpbnN0YW5jZW9mIGlyLlN0b3JlTGV0RXhwciAmJiAhbGV0VXNlZEV4dGVybmFsbHkuaGFzKGV4cHJlc3Npb24udGFyZ2V0KVxuICAgICAgICAgICAgPyBleHByZXNzaW9uLnZhbHVlXG4gICAgICAgICAgICA6IGV4cHJlc3Npb24sXG4gICAgICAgIGlyLlZpc2l0b3JDb250ZXh0RmxhZy5Ob25lLFxuICAgICAgKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==