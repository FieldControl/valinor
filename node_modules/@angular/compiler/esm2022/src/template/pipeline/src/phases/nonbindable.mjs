/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as ir from '../../ir';
/**
 * Looks up an element in the given map by xref ID.
 */
function lookupElement(elements, xref) {
    const el = elements.get(xref);
    if (el === undefined) {
        throw new Error('All attributes should have an element-like target.');
    }
    return el;
}
/**
 * When a container is marked with `ngNonBindable`, the non-bindable characteristic also applies to
 * all descendants of that container. Therefore, we must emit `disableBindings` and `enableBindings`
 * instructions for every such container.
 */
export function disableBindings(job) {
    const elements = new Map();
    for (const view of job.units) {
        for (const op of view.create) {
            if (!ir.isElementOrContainerOp(op)) {
                continue;
            }
            elements.set(op.xref, op);
        }
    }
    for (const unit of job.units) {
        for (const op of unit.create) {
            if ((op.kind === ir.OpKind.ElementStart || op.kind === ir.OpKind.ContainerStart) &&
                op.nonBindable) {
                ir.OpList.insertAfter(ir.createDisableBindingsOp(op.xref), op);
            }
            if ((op.kind === ir.OpKind.ElementEnd || op.kind === ir.OpKind.ContainerEnd) &&
                lookupElement(elements, op.xref).nonBindable) {
                ir.OpList.insertBefore(ir.createEnableBindingsOp(op.xref), op);
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9uYmluZGFibGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvdGVtcGxhdGUvcGlwZWxpbmUvc3JjL3BoYXNlcy9ub25iaW5kYWJsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEtBQUssRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUcvQjs7R0FFRztBQUNILFNBQVMsYUFBYSxDQUNwQixRQUFrRCxFQUNsRCxJQUFlO0lBRWYsTUFBTSxFQUFFLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM5QixJQUFJLEVBQUUsS0FBSyxTQUFTLEVBQUUsQ0FBQztRQUNyQixNQUFNLElBQUksS0FBSyxDQUFDLG9EQUFvRCxDQUFDLENBQUM7SUFDeEUsQ0FBQztJQUNELE9BQU8sRUFBRSxDQUFDO0FBQ1osQ0FBQztBQUVEOzs7O0dBSUc7QUFDSCxNQUFNLFVBQVUsZUFBZSxDQUFDLEdBQW1CO0lBQ2pELE1BQU0sUUFBUSxHQUFHLElBQUksR0FBRyxFQUF1QyxDQUFDO0lBQ2hFLEtBQUssTUFBTSxJQUFJLElBQUksR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzdCLEtBQUssTUFBTSxFQUFFLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQzdCLElBQUksQ0FBQyxFQUFFLENBQUMsc0JBQXNCLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDbkMsU0FBUztZQUNYLENBQUM7WUFDRCxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDNUIsQ0FBQztJQUNILENBQUM7SUFFRCxLQUFLLE1BQU0sSUFBSSxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM3QixLQUFLLE1BQU0sRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUM3QixJQUNFLENBQUMsRUFBRSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLFlBQVksSUFBSSxFQUFFLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDO2dCQUM1RSxFQUFFLENBQUMsV0FBVyxFQUNkLENBQUM7Z0JBQ0QsRUFBRSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQWMsRUFBRSxDQUFDLHVCQUF1QixDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUM5RSxDQUFDO1lBQ0QsSUFDRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxVQUFVLElBQUksRUFBRSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQztnQkFDeEUsYUFBYSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsV0FBVyxFQUM1QyxDQUFDO2dCQUNELEVBQUUsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFjLEVBQUUsQ0FBQyxzQkFBc0IsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDOUUsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgaXIgZnJvbSAnLi4vLi4vaXInO1xuaW1wb3J0IHR5cGUge0NvbXBpbGF0aW9uSm9ifSBmcm9tICcuLi9jb21waWxhdGlvbic7XG5cbi8qKlxuICogTG9va3MgdXAgYW4gZWxlbWVudCBpbiB0aGUgZ2l2ZW4gbWFwIGJ5IHhyZWYgSUQuXG4gKi9cbmZ1bmN0aW9uIGxvb2t1cEVsZW1lbnQoXG4gIGVsZW1lbnRzOiBNYXA8aXIuWHJlZklkLCBpci5FbGVtZW50T3JDb250YWluZXJPcHM+LFxuICB4cmVmOiBpci5YcmVmSWQsXG4pOiBpci5FbGVtZW50T3JDb250YWluZXJPcHMge1xuICBjb25zdCBlbCA9IGVsZW1lbnRzLmdldCh4cmVmKTtcbiAgaWYgKGVsID09PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0FsbCBhdHRyaWJ1dGVzIHNob3VsZCBoYXZlIGFuIGVsZW1lbnQtbGlrZSB0YXJnZXQuJyk7XG4gIH1cbiAgcmV0dXJuIGVsO1xufVxuXG4vKipcbiAqIFdoZW4gYSBjb250YWluZXIgaXMgbWFya2VkIHdpdGggYG5nTm9uQmluZGFibGVgLCB0aGUgbm9uLWJpbmRhYmxlIGNoYXJhY3RlcmlzdGljIGFsc28gYXBwbGllcyB0b1xuICogYWxsIGRlc2NlbmRhbnRzIG9mIHRoYXQgY29udGFpbmVyLiBUaGVyZWZvcmUsIHdlIG11c3QgZW1pdCBgZGlzYWJsZUJpbmRpbmdzYCBhbmQgYGVuYWJsZUJpbmRpbmdzYFxuICogaW5zdHJ1Y3Rpb25zIGZvciBldmVyeSBzdWNoIGNvbnRhaW5lci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRpc2FibGVCaW5kaW5ncyhqb2I6IENvbXBpbGF0aW9uSm9iKTogdm9pZCB7XG4gIGNvbnN0IGVsZW1lbnRzID0gbmV3IE1hcDxpci5YcmVmSWQsIGlyLkVsZW1lbnRPckNvbnRhaW5lck9wcz4oKTtcbiAgZm9yIChjb25zdCB2aWV3IG9mIGpvYi51bml0cykge1xuICAgIGZvciAoY29uc3Qgb3Agb2Ygdmlldy5jcmVhdGUpIHtcbiAgICAgIGlmICghaXIuaXNFbGVtZW50T3JDb250YWluZXJPcChvcCkpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBlbGVtZW50cy5zZXQob3AueHJlZiwgb3ApO1xuICAgIH1cbiAgfVxuXG4gIGZvciAoY29uc3QgdW5pdCBvZiBqb2IudW5pdHMpIHtcbiAgICBmb3IgKGNvbnN0IG9wIG9mIHVuaXQuY3JlYXRlKSB7XG4gICAgICBpZiAoXG4gICAgICAgIChvcC5raW5kID09PSBpci5PcEtpbmQuRWxlbWVudFN0YXJ0IHx8IG9wLmtpbmQgPT09IGlyLk9wS2luZC5Db250YWluZXJTdGFydCkgJiZcbiAgICAgICAgb3Aubm9uQmluZGFibGVcbiAgICAgICkge1xuICAgICAgICBpci5PcExpc3QuaW5zZXJ0QWZ0ZXI8aXIuQ3JlYXRlT3A+KGlyLmNyZWF0ZURpc2FibGVCaW5kaW5nc09wKG9wLnhyZWYpLCBvcCk7XG4gICAgICB9XG4gICAgICBpZiAoXG4gICAgICAgIChvcC5raW5kID09PSBpci5PcEtpbmQuRWxlbWVudEVuZCB8fCBvcC5raW5kID09PSBpci5PcEtpbmQuQ29udGFpbmVyRW5kKSAmJlxuICAgICAgICBsb29rdXBFbGVtZW50KGVsZW1lbnRzLCBvcC54cmVmKS5ub25CaW5kYWJsZVxuICAgICAgKSB7XG4gICAgICAgIGlyLk9wTGlzdC5pbnNlcnRCZWZvcmU8aXIuQ3JlYXRlT3A+KGlyLmNyZWF0ZUVuYWJsZUJpbmRpbmdzT3Aob3AueHJlZiksIG9wKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==