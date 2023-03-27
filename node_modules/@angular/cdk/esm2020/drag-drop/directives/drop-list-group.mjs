/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Input, InjectionToken } from '@angular/core';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import * as i0 from "@angular/core";
/**
 * Injection token that can be used to reference instances of `CdkDropListGroup`. It serves as
 * alternative token to the actual `CdkDropListGroup` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
export const CDK_DROP_LIST_GROUP = new InjectionToken('CdkDropListGroup');
/**
 * Declaratively connects sibling `cdkDropList` instances together. All of the `cdkDropList`
 * elements that are placed inside a `cdkDropListGroup` will be connected to each other
 * automatically. Can be used as an alternative to the `cdkDropListConnectedTo` input
 * from `cdkDropList`.
 */
export class CdkDropListGroup {
    constructor() {
        /** Drop lists registered inside the group. */
        this._items = new Set();
        this._disabled = false;
    }
    /** Whether starting a dragging sequence from inside this group is disabled. */
    get disabled() {
        return this._disabled;
    }
    set disabled(value) {
        this._disabled = coerceBooleanProperty(value);
    }
    ngOnDestroy() {
        this._items.clear();
    }
}
CdkDropListGroup.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: CdkDropListGroup, deps: [], target: i0.ɵɵFactoryTarget.Directive });
CdkDropListGroup.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "15.2.0-rc.0", type: CdkDropListGroup, isStandalone: true, selector: "[cdkDropListGroup]", inputs: { disabled: ["cdkDropListGroupDisabled", "disabled"] }, providers: [{ provide: CDK_DROP_LIST_GROUP, useExisting: CdkDropListGroup }], exportAs: ["cdkDropListGroup"], ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: CdkDropListGroup, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkDropListGroup]',
                    exportAs: 'cdkDropListGroup',
                    standalone: true,
                    providers: [{ provide: CDK_DROP_LIST_GROUP, useExisting: CdkDropListGroup }],
                }]
        }], propDecorators: { disabled: [{
                type: Input,
                args: ['cdkDropListGroupDisabled']
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJvcC1saXN0LWdyb3VwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9kcmFnLWRyb3AvZGlyZWN0aXZlcy9kcm9wLWxpc3QtZ3JvdXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFNBQVMsRUFBYSxLQUFLLEVBQUUsY0FBYyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQzFFLE9BQU8sRUFBZSxxQkFBcUIsRUFBQyxNQUFNLHVCQUF1QixDQUFDOztBQUUxRTs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxjQUFjLENBQ25ELGtCQUFrQixDQUNuQixDQUFDO0FBRUY7Ozs7O0dBS0c7QUFPSCxNQUFNLE9BQU8sZ0JBQWdCO0lBTjdCO1FBT0UsOENBQThDO1FBQ3JDLFdBQU0sR0FBRyxJQUFJLEdBQUcsRUFBSyxDQUFDO1FBVXZCLGNBQVMsR0FBRyxLQUFLLENBQUM7S0FLM0I7SUFiQywrRUFBK0U7SUFDL0UsSUFDSSxRQUFRO1FBQ1YsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQ3hCLENBQUM7SUFDRCxJQUFJLFFBQVEsQ0FBQyxLQUFtQjtRQUM5QixJQUFJLENBQUMsU0FBUyxHQUFHLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2hELENBQUM7SUFHRCxXQUFXO1FBQ1QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUN0QixDQUFDOztrSEFoQlUsZ0JBQWdCO3NHQUFoQixnQkFBZ0IsaUlBRmhCLENBQUMsRUFBQyxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsV0FBVyxFQUFFLGdCQUFnQixFQUFDLENBQUM7Z0dBRS9ELGdCQUFnQjtrQkFONUIsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsb0JBQW9CO29CQUM5QixRQUFRLEVBQUUsa0JBQWtCO29CQUM1QixVQUFVLEVBQUUsSUFBSTtvQkFDaEIsU0FBUyxFQUFFLENBQUMsRUFBQyxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsV0FBVyxrQkFBa0IsRUFBQyxDQUFDO2lCQUMzRTs4QkFPSyxRQUFRO3NCQURYLEtBQUs7dUJBQUMsMEJBQTBCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aXZlLCBPbkRlc3Ryb3ksIElucHV0LCBJbmplY3Rpb25Ub2tlbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0Jvb2xlYW5JbnB1dCwgY29lcmNlQm9vbGVhblByb3BlcnR5fSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xuXG4vKipcbiAqIEluamVjdGlvbiB0b2tlbiB0aGF0IGNhbiBiZSB1c2VkIHRvIHJlZmVyZW5jZSBpbnN0YW5jZXMgb2YgYENka0Ryb3BMaXN0R3JvdXBgLiBJdCBzZXJ2ZXMgYXNcbiAqIGFsdGVybmF0aXZlIHRva2VuIHRvIHRoZSBhY3R1YWwgYENka0Ryb3BMaXN0R3JvdXBgIGNsYXNzIHdoaWNoIGNvdWxkIGNhdXNlIHVubmVjZXNzYXJ5XG4gKiByZXRlbnRpb24gb2YgdGhlIGNsYXNzIGFuZCBpdHMgZGlyZWN0aXZlIG1ldGFkYXRhLlxuICovXG5leHBvcnQgY29uc3QgQ0RLX0RST1BfTElTVF9HUk9VUCA9IG5ldyBJbmplY3Rpb25Ub2tlbjxDZGtEcm9wTGlzdEdyb3VwPHVua25vd24+PihcbiAgJ0Nka0Ryb3BMaXN0R3JvdXAnLFxuKTtcblxuLyoqXG4gKiBEZWNsYXJhdGl2ZWx5IGNvbm5lY3RzIHNpYmxpbmcgYGNka0Ryb3BMaXN0YCBpbnN0YW5jZXMgdG9nZXRoZXIuIEFsbCBvZiB0aGUgYGNka0Ryb3BMaXN0YFxuICogZWxlbWVudHMgdGhhdCBhcmUgcGxhY2VkIGluc2lkZSBhIGBjZGtEcm9wTGlzdEdyb3VwYCB3aWxsIGJlIGNvbm5lY3RlZCB0byBlYWNoIG90aGVyXG4gKiBhdXRvbWF0aWNhbGx5LiBDYW4gYmUgdXNlZCBhcyBhbiBhbHRlcm5hdGl2ZSB0byB0aGUgYGNka0Ryb3BMaXN0Q29ubmVjdGVkVG9gIGlucHV0XG4gKiBmcm9tIGBjZGtEcm9wTGlzdGAuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGtEcm9wTGlzdEdyb3VwXScsXG4gIGV4cG9ydEFzOiAnY2RrRHJvcExpc3RHcm91cCcsXG4gIHN0YW5kYWxvbmU6IHRydWUsXG4gIHByb3ZpZGVyczogW3twcm92aWRlOiBDREtfRFJPUF9MSVNUX0dST1VQLCB1c2VFeGlzdGluZzogQ2RrRHJvcExpc3RHcm91cH1dLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtEcm9wTGlzdEdyb3VwPFQ+IGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgLyoqIERyb3AgbGlzdHMgcmVnaXN0ZXJlZCBpbnNpZGUgdGhlIGdyb3VwLiAqL1xuICByZWFkb25seSBfaXRlbXMgPSBuZXcgU2V0PFQ+KCk7XG5cbiAgLyoqIFdoZXRoZXIgc3RhcnRpbmcgYSBkcmFnZ2luZyBzZXF1ZW5jZSBmcm9tIGluc2lkZSB0aGlzIGdyb3VwIGlzIGRpc2FibGVkLiAqL1xuICBASW5wdXQoJ2Nka0Ryb3BMaXN0R3JvdXBEaXNhYmxlZCcpXG4gIGdldCBkaXNhYmxlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fZGlzYWJsZWQ7XG4gIH1cbiAgc2V0IGRpc2FibGVkKHZhbHVlOiBCb29sZWFuSW5wdXQpIHtcbiAgICB0aGlzLl9kaXNhYmxlZCA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSh2YWx1ZSk7XG4gIH1cbiAgcHJpdmF0ZSBfZGlzYWJsZWQgPSBmYWxzZTtcblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLl9pdGVtcy5jbGVhcigpO1xuICB9XG59XG4iXX0=