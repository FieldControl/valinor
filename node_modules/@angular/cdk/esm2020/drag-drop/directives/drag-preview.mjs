/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Directive, InjectionToken, Input, TemplateRef } from '@angular/core';
import * as i0 from "@angular/core";
/**
 * Injection token that can be used to reference instances of `CdkDragPreview`. It serves as
 * alternative token to the actual `CdkDragPreview` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
export const CDK_DRAG_PREVIEW = new InjectionToken('CdkDragPreview');
/**
 * Element that will be used as a template for the preview
 * of a CdkDrag when it is being dragged.
 */
export class CdkDragPreview {
    /** Whether the preview should preserve the same size as the item that is being dragged. */
    get matchSize() {
        return this._matchSize;
    }
    set matchSize(value) {
        this._matchSize = coerceBooleanProperty(value);
    }
    constructor(templateRef) {
        this.templateRef = templateRef;
        this._matchSize = false;
    }
}
CdkDragPreview.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: CdkDragPreview, deps: [{ token: i0.TemplateRef }], target: i0.ɵɵFactoryTarget.Directive });
CdkDragPreview.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "15.2.0-rc.0", type: CdkDragPreview, isStandalone: true, selector: "ng-template[cdkDragPreview]", inputs: { data: "data", matchSize: "matchSize" }, providers: [{ provide: CDK_DRAG_PREVIEW, useExisting: CdkDragPreview }], ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: CdkDragPreview, decorators: [{
            type: Directive,
            args: [{
                    selector: 'ng-template[cdkDragPreview]',
                    standalone: true,
                    providers: [{ provide: CDK_DRAG_PREVIEW, useExisting: CdkDragPreview }],
                }]
        }], ctorParameters: function () { return [{ type: i0.TemplateRef }]; }, propDecorators: { data: [{
                type: Input
            }], matchSize: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJhZy1wcmV2aWV3LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9kcmFnLWRyb3AvZGlyZWN0aXZlcy9kcmFnLXByZXZpZXcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFlLHFCQUFxQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDMUUsT0FBTyxFQUFDLFNBQVMsRUFBRSxjQUFjLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBQyxNQUFNLGVBQWUsQ0FBQzs7QUFFNUU7Ozs7R0FJRztBQUNILE1BQU0sQ0FBQyxNQUFNLGdCQUFnQixHQUFHLElBQUksY0FBYyxDQUFpQixnQkFBZ0IsQ0FBQyxDQUFDO0FBRXJGOzs7R0FHRztBQU1ILE1BQU0sT0FBTyxjQUFjO0lBSXpCLDJGQUEyRjtJQUMzRixJQUNJLFNBQVM7UUFDWCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUM7SUFDekIsQ0FBQztJQUNELElBQUksU0FBUyxDQUFDLEtBQW1CO1FBQy9CLElBQUksQ0FBQyxVQUFVLEdBQUcscUJBQXFCLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDakQsQ0FBQztJQUdELFlBQW1CLFdBQTJCO1FBQTNCLGdCQUFXLEdBQVgsV0FBVyxDQUFnQjtRQUZ0QyxlQUFVLEdBQUcsS0FBSyxDQUFDO0lBRXNCLENBQUM7O2dIQWR2QyxjQUFjO29HQUFkLGNBQWMsNEhBRmQsQ0FBQyxFQUFDLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxXQUFXLEVBQUUsY0FBYyxFQUFDLENBQUM7Z0dBRTFELGNBQWM7a0JBTDFCLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLDZCQUE2QjtvQkFDdkMsVUFBVSxFQUFFLElBQUk7b0JBQ2hCLFNBQVMsRUFBRSxDQUFDLEVBQUMsT0FBTyxFQUFFLGdCQUFnQixFQUFFLFdBQVcsZ0JBQWdCLEVBQUMsQ0FBQztpQkFDdEU7a0dBR1UsSUFBSTtzQkFBWixLQUFLO2dCQUlGLFNBQVM7c0JBRFosS0FBSyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0Jvb2xlYW5JbnB1dCwgY29lcmNlQm9vbGVhblByb3BlcnR5fSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xuaW1wb3J0IHtEaXJlY3RpdmUsIEluamVjdGlvblRva2VuLCBJbnB1dCwgVGVtcGxhdGVSZWZ9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG4vKipcbiAqIEluamVjdGlvbiB0b2tlbiB0aGF0IGNhbiBiZSB1c2VkIHRvIHJlZmVyZW5jZSBpbnN0YW5jZXMgb2YgYENka0RyYWdQcmV2aWV3YC4gSXQgc2VydmVzIGFzXG4gKiBhbHRlcm5hdGl2ZSB0b2tlbiB0byB0aGUgYWN0dWFsIGBDZGtEcmFnUHJldmlld2AgY2xhc3Mgd2hpY2ggY291bGQgY2F1c2UgdW5uZWNlc3NhcnlcbiAqIHJldGVudGlvbiBvZiB0aGUgY2xhc3MgYW5kIGl0cyBkaXJlY3RpdmUgbWV0YWRhdGEuXG4gKi9cbmV4cG9ydCBjb25zdCBDREtfRFJBR19QUkVWSUVXID0gbmV3IEluamVjdGlvblRva2VuPENka0RyYWdQcmV2aWV3PignQ2RrRHJhZ1ByZXZpZXcnKTtcblxuLyoqXG4gKiBFbGVtZW50IHRoYXQgd2lsbCBiZSB1c2VkIGFzIGEgdGVtcGxhdGUgZm9yIHRoZSBwcmV2aWV3XG4gKiBvZiBhIENka0RyYWcgd2hlbiBpdCBpcyBiZWluZyBkcmFnZ2VkLlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICduZy10ZW1wbGF0ZVtjZGtEcmFnUHJldmlld10nLFxuICBzdGFuZGFsb25lOiB0cnVlLFxuICBwcm92aWRlcnM6IFt7cHJvdmlkZTogQ0RLX0RSQUdfUFJFVklFVywgdXNlRXhpc3Rpbmc6IENka0RyYWdQcmV2aWV3fV0sXG59KVxuZXhwb3J0IGNsYXNzIENka0RyYWdQcmV2aWV3PFQgPSBhbnk+IHtcbiAgLyoqIENvbnRleHQgZGF0YSB0byBiZSBhZGRlZCB0byB0aGUgcHJldmlldyB0ZW1wbGF0ZSBpbnN0YW5jZS4gKi9cbiAgQElucHV0KCkgZGF0YTogVDtcblxuICAvKiogV2hldGhlciB0aGUgcHJldmlldyBzaG91bGQgcHJlc2VydmUgdGhlIHNhbWUgc2l6ZSBhcyB0aGUgaXRlbSB0aGF0IGlzIGJlaW5nIGRyYWdnZWQuICovXG4gIEBJbnB1dCgpXG4gIGdldCBtYXRjaFNpemUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX21hdGNoU2l6ZTtcbiAgfVxuICBzZXQgbWF0Y2hTaXplKHZhbHVlOiBCb29sZWFuSW5wdXQpIHtcbiAgICB0aGlzLl9tYXRjaFNpemUgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodmFsdWUpO1xuICB9XG4gIHByaXZhdGUgX21hdGNoU2l6ZSA9IGZhbHNlO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB0ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY8VD4pIHt9XG59XG4iXX0=