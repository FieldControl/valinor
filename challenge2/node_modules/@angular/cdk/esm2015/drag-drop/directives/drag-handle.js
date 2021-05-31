/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Directive, ElementRef, Inject, InjectionToken, Input, Optional, SkipSelf, } from '@angular/core';
import { Subject } from 'rxjs';
import { CDK_DRAG_PARENT } from '../drag-parent';
import { assertElementNode } from './assertions';
/**
 * Injection token that can be used to reference instances of `CdkDragHandle`. It serves as
 * alternative token to the actual `CdkDragHandle` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
export const CDK_DRAG_HANDLE = new InjectionToken('CdkDragHandle');
/** Handle that can be used to drag a CdkDrag instance. */
export class CdkDragHandle {
    constructor(element, parentDrag) {
        this.element = element;
        /** Emits when the state of the handle has changed. */
        this._stateChanges = new Subject();
        this._disabled = false;
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
            assertElementNode(element.nativeElement, 'cdkDragHandle');
        }
        this._parentDrag = parentDrag;
    }
    /** Whether starting to drag through this handle is disabled. */
    get disabled() { return this._disabled; }
    set disabled(value) {
        this._disabled = coerceBooleanProperty(value);
        this._stateChanges.next(this);
    }
    ngOnDestroy() {
        this._stateChanges.complete();
    }
}
CdkDragHandle.decorators = [
    { type: Directive, args: [{
                selector: '[cdkDragHandle]',
                host: {
                    'class': 'cdk-drag-handle'
                },
                providers: [{ provide: CDK_DRAG_HANDLE, useExisting: CdkDragHandle }],
            },] }
];
CdkDragHandle.ctorParameters = () => [
    { type: ElementRef },
    { type: undefined, decorators: [{ type: Inject, args: [CDK_DRAG_PARENT,] }, { type: Optional }, { type: SkipSelf }] }
];
CdkDragHandle.propDecorators = {
    disabled: [{ type: Input, args: ['cdkDragHandleDisabled',] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJhZy1oYW5kbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL2RyYWctZHJvcC9kaXJlY3RpdmVzL2RyYWctaGFuZGxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBZSxxQkFBcUIsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQzFFLE9BQU8sRUFDTCxTQUFTLEVBQ1QsVUFBVSxFQUNWLE1BQU0sRUFDTixjQUFjLEVBQ2QsS0FBSyxFQUVMLFFBQVEsRUFDUixRQUFRLEdBQ1QsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUM3QixPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDL0MsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sY0FBYyxDQUFDO0FBRS9DOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsTUFBTSxlQUFlLEdBQUcsSUFBSSxjQUFjLENBQWdCLGVBQWUsQ0FBQyxDQUFDO0FBRWxGLDBEQUEwRDtBQVExRCxNQUFNLE9BQU8sYUFBYTtJQWdCeEIsWUFDUyxPQUFnQyxFQUNVLFVBQWdCO1FBRDFELFlBQU8sR0FBUCxPQUFPLENBQXlCO1FBYnpDLHNEQUFzRDtRQUM3QyxrQkFBYSxHQUFHLElBQUksT0FBTyxFQUFpQixDQUFDO1FBUzlDLGNBQVMsR0FBRyxLQUFLLENBQUM7UUFNeEIsSUFBSSxPQUFPLFNBQVMsS0FBSyxXQUFXLElBQUksU0FBUyxFQUFFO1lBQ2pELGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsZUFBZSxDQUFDLENBQUM7U0FDM0Q7UUFFRCxJQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztJQUNoQyxDQUFDO0lBbEJELGdFQUFnRTtJQUNoRSxJQUNJLFFBQVEsS0FBYyxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO0lBQ2xELElBQUksUUFBUSxDQUFDLEtBQWM7UUFDekIsSUFBSSxDQUFDLFNBQVMsR0FBRyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM5QyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNoQyxDQUFDO0lBY0QsV0FBVztRQUNULElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDaEMsQ0FBQzs7O1lBcENGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsaUJBQWlCO2dCQUMzQixJQUFJLEVBQUU7b0JBQ0osT0FBTyxFQUFFLGlCQUFpQjtpQkFDM0I7Z0JBQ0QsU0FBUyxFQUFFLENBQUMsRUFBQyxPQUFPLEVBQUUsZUFBZSxFQUFFLFdBQVcsRUFBRSxhQUFhLEVBQUMsQ0FBQzthQUNwRTs7O1lBMUJDLFVBQVU7NENBNkNQLE1BQU0sU0FBQyxlQUFlLGNBQUcsUUFBUSxZQUFJLFFBQVE7Ozt1QkFWL0MsS0FBSyxTQUFDLHVCQUF1QiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0Jvb2xlYW5JbnB1dCwgY29lcmNlQm9vbGVhblByb3BlcnR5fSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xuaW1wb3J0IHtcbiAgRGlyZWN0aXZlLFxuICBFbGVtZW50UmVmLFxuICBJbmplY3QsXG4gIEluamVjdGlvblRva2VuLFxuICBJbnB1dCxcbiAgT25EZXN0cm95LFxuICBPcHRpb25hbCxcbiAgU2tpcFNlbGYsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtTdWJqZWN0fSBmcm9tICdyeGpzJztcbmltcG9ydCB7Q0RLX0RSQUdfUEFSRU5UfSBmcm9tICcuLi9kcmFnLXBhcmVudCc7XG5pbXBvcnQge2Fzc2VydEVsZW1lbnROb2RlfSBmcm9tICcuL2Fzc2VydGlvbnMnO1xuXG4vKipcbiAqIEluamVjdGlvbiB0b2tlbiB0aGF0IGNhbiBiZSB1c2VkIHRvIHJlZmVyZW5jZSBpbnN0YW5jZXMgb2YgYENka0RyYWdIYW5kbGVgLiBJdCBzZXJ2ZXMgYXNcbiAqIGFsdGVybmF0aXZlIHRva2VuIHRvIHRoZSBhY3R1YWwgYENka0RyYWdIYW5kbGVgIGNsYXNzIHdoaWNoIGNvdWxkIGNhdXNlIHVubmVjZXNzYXJ5XG4gKiByZXRlbnRpb24gb2YgdGhlIGNsYXNzIGFuZCBpdHMgZGlyZWN0aXZlIG1ldGFkYXRhLlxuICovXG5leHBvcnQgY29uc3QgQ0RLX0RSQUdfSEFORExFID0gbmV3IEluamVjdGlvblRva2VuPENka0RyYWdIYW5kbGU+KCdDZGtEcmFnSGFuZGxlJyk7XG5cbi8qKiBIYW5kbGUgdGhhdCBjYW4gYmUgdXNlZCB0byBkcmFnIGEgQ2RrRHJhZyBpbnN0YW5jZS4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGtEcmFnSGFuZGxlXScsXG4gIGhvc3Q6IHtcbiAgICAnY2xhc3MnOiAnY2RrLWRyYWctaGFuZGxlJ1xuICB9LFxuICBwcm92aWRlcnM6IFt7cHJvdmlkZTogQ0RLX0RSQUdfSEFORExFLCB1c2VFeGlzdGluZzogQ2RrRHJhZ0hhbmRsZX1dLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtEcmFnSGFuZGxlIGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgLyoqIENsb3Nlc3QgcGFyZW50IGRyYWdnYWJsZSBpbnN0YW5jZS4gKi9cbiAgX3BhcmVudERyYWc6IHt9IHwgdW5kZWZpbmVkO1xuXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSBzdGF0ZSBvZiB0aGUgaGFuZGxlIGhhcyBjaGFuZ2VkLiAqL1xuICByZWFkb25seSBfc3RhdGVDaGFuZ2VzID0gbmV3IFN1YmplY3Q8Q2RrRHJhZ0hhbmRsZT4oKTtcblxuICAvKiogV2hldGhlciBzdGFydGluZyB0byBkcmFnIHRocm91Z2ggdGhpcyBoYW5kbGUgaXMgZGlzYWJsZWQuICovXG4gIEBJbnB1dCgnY2RrRHJhZ0hhbmRsZURpc2FibGVkJylcbiAgZ2V0IGRpc2FibGVkKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5fZGlzYWJsZWQ7IH1cbiAgc2V0IGRpc2FibGVkKHZhbHVlOiBib29sZWFuKSB7XG4gICAgdGhpcy5fZGlzYWJsZWQgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodmFsdWUpO1xuICAgIHRoaXMuX3N0YXRlQ2hhbmdlcy5uZXh0KHRoaXMpO1xuICB9XG4gIHByaXZhdGUgX2Rpc2FibGVkID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIGVsZW1lbnQ6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+LFxuICAgIEBJbmplY3QoQ0RLX0RSQUdfUEFSRU5UKSBAT3B0aW9uYWwoKSBAU2tpcFNlbGYoKSBwYXJlbnREcmFnPzogYW55KSB7XG5cbiAgICBpZiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSB7XG4gICAgICBhc3NlcnRFbGVtZW50Tm9kZShlbGVtZW50Lm5hdGl2ZUVsZW1lbnQsICdjZGtEcmFnSGFuZGxlJyk7XG4gICAgfVxuXG4gICAgdGhpcy5fcGFyZW50RHJhZyA9IHBhcmVudERyYWc7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLl9zdGF0ZUNoYW5nZXMuY29tcGxldGUoKTtcbiAgfVxuXG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9kaXNhYmxlZDogQm9vbGVhbklucHV0O1xufVxuIl19