/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9uYmluZGFibGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvdGVtcGxhdGUvcGlwZWxpbmUvc3JjL3BoYXNlcy9ub25iaW5kYWJsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEtBQUssRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUcvQjs7R0FFRztBQUNILFNBQVMsYUFBYSxDQUNsQixRQUFrRCxFQUFFLElBQWU7SUFDckUsTUFBTSxFQUFFLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM5QixJQUFJLEVBQUUsS0FBSyxTQUFTLEVBQUUsQ0FBQztRQUNyQixNQUFNLElBQUksS0FBSyxDQUFDLG9EQUFvRCxDQUFDLENBQUM7SUFDeEUsQ0FBQztJQUNELE9BQU8sRUFBRSxDQUFDO0FBQ1osQ0FBQztBQUVEOzs7O0dBSUc7QUFDSCxNQUFNLFVBQVUsZUFBZSxDQUFDLEdBQW1CO0lBQ2pELE1BQU0sUUFBUSxHQUFHLElBQUksR0FBRyxFQUF1QyxDQUFDO0lBQ2hFLEtBQUssTUFBTSxJQUFJLElBQUksR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzdCLEtBQUssTUFBTSxFQUFFLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQzdCLElBQUksQ0FBQyxFQUFFLENBQUMsc0JBQXNCLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDbkMsU0FBUztZQUNYLENBQUM7WUFDRCxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDNUIsQ0FBQztJQUNILENBQUM7SUFFRCxLQUFLLE1BQU0sSUFBSSxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM3QixLQUFLLE1BQU0sRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUM3QixJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLFlBQVksSUFBSSxFQUFFLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDO2dCQUM1RSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQ25CLEVBQUUsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFjLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDOUUsQ0FBQztZQUNELElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsVUFBVSxJQUFJLEVBQUUsQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUM7Z0JBQ3hFLGFBQWEsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUNqRCxFQUFFLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBYyxFQUFFLENBQUMsc0JBQXNCLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzlFLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgaXIgZnJvbSAnLi4vLi4vaXInO1xuaW1wb3J0IHR5cGUge0NvbXBpbGF0aW9uSm9ifSBmcm9tICcuLi9jb21waWxhdGlvbic7XG5cbi8qKlxuICogTG9va3MgdXAgYW4gZWxlbWVudCBpbiB0aGUgZ2l2ZW4gbWFwIGJ5IHhyZWYgSUQuXG4gKi9cbmZ1bmN0aW9uIGxvb2t1cEVsZW1lbnQoXG4gICAgZWxlbWVudHM6IE1hcDxpci5YcmVmSWQsIGlyLkVsZW1lbnRPckNvbnRhaW5lck9wcz4sIHhyZWY6IGlyLlhyZWZJZCk6IGlyLkVsZW1lbnRPckNvbnRhaW5lck9wcyB7XG4gIGNvbnN0IGVsID0gZWxlbWVudHMuZ2V0KHhyZWYpO1xuICBpZiAoZWwgPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IG5ldyBFcnJvcignQWxsIGF0dHJpYnV0ZXMgc2hvdWxkIGhhdmUgYW4gZWxlbWVudC1saWtlIHRhcmdldC4nKTtcbiAgfVxuICByZXR1cm4gZWw7XG59XG5cbi8qKlxuICogV2hlbiBhIGNvbnRhaW5lciBpcyBtYXJrZWQgd2l0aCBgbmdOb25CaW5kYWJsZWAsIHRoZSBub24tYmluZGFibGUgY2hhcmFjdGVyaXN0aWMgYWxzbyBhcHBsaWVzIHRvXG4gKiBhbGwgZGVzY2VuZGFudHMgb2YgdGhhdCBjb250YWluZXIuIFRoZXJlZm9yZSwgd2UgbXVzdCBlbWl0IGBkaXNhYmxlQmluZGluZ3NgIGFuZCBgZW5hYmxlQmluZGluZ3NgXG4gKiBpbnN0cnVjdGlvbnMgZm9yIGV2ZXJ5IHN1Y2ggY29udGFpbmVyLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZGlzYWJsZUJpbmRpbmdzKGpvYjogQ29tcGlsYXRpb25Kb2IpOiB2b2lkIHtcbiAgY29uc3QgZWxlbWVudHMgPSBuZXcgTWFwPGlyLlhyZWZJZCwgaXIuRWxlbWVudE9yQ29udGFpbmVyT3BzPigpO1xuICBmb3IgKGNvbnN0IHZpZXcgb2Ygam9iLnVuaXRzKSB7XG4gICAgZm9yIChjb25zdCBvcCBvZiB2aWV3LmNyZWF0ZSkge1xuICAgICAgaWYgKCFpci5pc0VsZW1lbnRPckNvbnRhaW5lck9wKG9wKSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGVsZW1lbnRzLnNldChvcC54cmVmLCBvcCk7XG4gICAgfVxuICB9XG5cbiAgZm9yIChjb25zdCB1bml0IG9mIGpvYi51bml0cykge1xuICAgIGZvciAoY29uc3Qgb3Agb2YgdW5pdC5jcmVhdGUpIHtcbiAgICAgIGlmICgob3Aua2luZCA9PT0gaXIuT3BLaW5kLkVsZW1lbnRTdGFydCB8fCBvcC5raW5kID09PSBpci5PcEtpbmQuQ29udGFpbmVyU3RhcnQpICYmXG4gICAgICAgICAgb3Aubm9uQmluZGFibGUpIHtcbiAgICAgICAgaXIuT3BMaXN0Lmluc2VydEFmdGVyPGlyLkNyZWF0ZU9wPihpci5jcmVhdGVEaXNhYmxlQmluZGluZ3NPcChvcC54cmVmKSwgb3ApO1xuICAgICAgfVxuICAgICAgaWYgKChvcC5raW5kID09PSBpci5PcEtpbmQuRWxlbWVudEVuZCB8fCBvcC5raW5kID09PSBpci5PcEtpbmQuQ29udGFpbmVyRW5kKSAmJlxuICAgICAgICAgIGxvb2t1cEVsZW1lbnQoZWxlbWVudHMsIG9wLnhyZWYpLm5vbkJpbmRhYmxlKSB7XG4gICAgICAgIGlyLk9wTGlzdC5pbnNlcnRCZWZvcmU8aXIuQ3JlYXRlT3A+KGlyLmNyZWF0ZUVuYWJsZUJpbmRpbmdzT3Aob3AueHJlZiksIG9wKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==