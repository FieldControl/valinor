/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, TemplateRef, Input, InjectionToken } from '@angular/core';
import * as i0 from "@angular/core";
/**
 * Injection token that can be used to reference instances of `CdkDragPlaceholder`. It serves as
 * alternative token to the actual `CdkDragPlaceholder` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
export const CDK_DRAG_PLACEHOLDER = new InjectionToken('CdkDragPlaceholder');
/**
 * Element that will be used as a template for the placeholder of a CdkDrag when
 * it is being dragged. The placeholder is displayed in place of the element being dragged.
 */
export class CdkDragPlaceholder {
    constructor(templateRef) {
        this.templateRef = templateRef;
    }
}
CdkDragPlaceholder.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: CdkDragPlaceholder, deps: [{ token: i0.TemplateRef }], target: i0.ɵɵFactoryTarget.Directive });
CdkDragPlaceholder.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "15.2.0-rc.0", type: CdkDragPlaceholder, isStandalone: true, selector: "ng-template[cdkDragPlaceholder]", inputs: { data: "data" }, providers: [{ provide: CDK_DRAG_PLACEHOLDER, useExisting: CdkDragPlaceholder }], ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: CdkDragPlaceholder, decorators: [{
            type: Directive,
            args: [{
                    selector: 'ng-template[cdkDragPlaceholder]',
                    standalone: true,
                    providers: [{ provide: CDK_DRAG_PLACEHOLDER, useExisting: CdkDragPlaceholder }],
                }]
        }], ctorParameters: function () { return [{ type: i0.TemplateRef }]; }, propDecorators: { data: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJhZy1wbGFjZWhvbGRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvZHJhZy1kcm9wL2RpcmVjdGl2ZXMvZHJhZy1wbGFjZWhvbGRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsU0FBUyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsY0FBYyxFQUFDLE1BQU0sZUFBZSxDQUFDOztBQUU1RTs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxjQUFjLENBQXFCLG9CQUFvQixDQUFDLENBQUM7QUFFakc7OztHQUdHO0FBTUgsTUFBTSxPQUFPLGtCQUFrQjtJQUc3QixZQUFtQixXQUEyQjtRQUEzQixnQkFBVyxHQUFYLFdBQVcsQ0FBZ0I7SUFBRyxDQUFDOztvSEFIdkMsa0JBQWtCO3dHQUFsQixrQkFBa0Isd0dBRmxCLENBQUMsRUFBQyxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsV0FBVyxFQUFFLGtCQUFrQixFQUFDLENBQUM7Z0dBRWxFLGtCQUFrQjtrQkFMOUIsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsaUNBQWlDO29CQUMzQyxVQUFVLEVBQUUsSUFBSTtvQkFDaEIsU0FBUyxFQUFFLENBQUMsRUFBQyxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsV0FBVyxvQkFBb0IsRUFBQyxDQUFDO2lCQUM5RTtrR0FHVSxJQUFJO3NCQUFaLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtEaXJlY3RpdmUsIFRlbXBsYXRlUmVmLCBJbnB1dCwgSW5qZWN0aW9uVG9rZW59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG4vKipcbiAqIEluamVjdGlvbiB0b2tlbiB0aGF0IGNhbiBiZSB1c2VkIHRvIHJlZmVyZW5jZSBpbnN0YW5jZXMgb2YgYENka0RyYWdQbGFjZWhvbGRlcmAuIEl0IHNlcnZlcyBhc1xuICogYWx0ZXJuYXRpdmUgdG9rZW4gdG8gdGhlIGFjdHVhbCBgQ2RrRHJhZ1BsYWNlaG9sZGVyYCBjbGFzcyB3aGljaCBjb3VsZCBjYXVzZSB1bm5lY2Vzc2FyeVxuICogcmV0ZW50aW9uIG9mIHRoZSBjbGFzcyBhbmQgaXRzIGRpcmVjdGl2ZSBtZXRhZGF0YS5cbiAqL1xuZXhwb3J0IGNvbnN0IENES19EUkFHX1BMQUNFSE9MREVSID0gbmV3IEluamVjdGlvblRva2VuPENka0RyYWdQbGFjZWhvbGRlcj4oJ0Nka0RyYWdQbGFjZWhvbGRlcicpO1xuXG4vKipcbiAqIEVsZW1lbnQgdGhhdCB3aWxsIGJlIHVzZWQgYXMgYSB0ZW1wbGF0ZSBmb3IgdGhlIHBsYWNlaG9sZGVyIG9mIGEgQ2RrRHJhZyB3aGVuXG4gKiBpdCBpcyBiZWluZyBkcmFnZ2VkLiBUaGUgcGxhY2Vob2xkZXIgaXMgZGlzcGxheWVkIGluIHBsYWNlIG9mIHRoZSBlbGVtZW50IGJlaW5nIGRyYWdnZWQuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ25nLXRlbXBsYXRlW2Nka0RyYWdQbGFjZWhvbGRlcl0nLFxuICBzdGFuZGFsb25lOiB0cnVlLFxuICBwcm92aWRlcnM6IFt7cHJvdmlkZTogQ0RLX0RSQUdfUExBQ0VIT0xERVIsIHVzZUV4aXN0aW5nOiBDZGtEcmFnUGxhY2Vob2xkZXJ9XSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrRHJhZ1BsYWNlaG9sZGVyPFQgPSBhbnk+IHtcbiAgLyoqIENvbnRleHQgZGF0YSB0byBiZSBhZGRlZCB0byB0aGUgcGxhY2Vob2xkZXIgdGVtcGxhdGUgaW5zdGFuY2UuICovXG4gIEBJbnB1dCgpIGRhdGE6IFQ7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB0ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY8VD4pIHt9XG59XG4iXX0=