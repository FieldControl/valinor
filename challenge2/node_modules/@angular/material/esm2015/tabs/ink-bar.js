/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, ElementRef, Inject, InjectionToken, NgZone, Optional } from '@angular/core';
import { ANIMATION_MODULE_TYPE } from '@angular/platform-browser/animations';
/** Injection token for the MatInkBar's Positioner. */
export const _MAT_INK_BAR_POSITIONER = new InjectionToken('MatInkBarPositioner', {
    providedIn: 'root',
    factory: _MAT_INK_BAR_POSITIONER_FACTORY
});
/**
 * The default positioner function for the MatInkBar.
 * @docs-private
 */
export function _MAT_INK_BAR_POSITIONER_FACTORY() {
    const method = (element) => ({
        left: element ? (element.offsetLeft || 0) + 'px' : '0',
        width: element ? (element.offsetWidth || 0) + 'px' : '0',
    });
    return method;
}
/**
 * The ink-bar is used to display and animate the line underneath the current active tab label.
 * @docs-private
 */
export class MatInkBar {
    constructor(_elementRef, _ngZone, _inkBarPositioner, _animationMode) {
        this._elementRef = _elementRef;
        this._ngZone = _ngZone;
        this._inkBarPositioner = _inkBarPositioner;
        this._animationMode = _animationMode;
    }
    /**
     * Calculates the styles from the provided element in order to align the ink-bar to that element.
     * Shows the ink bar if previously set as hidden.
     * @param element
     */
    alignToElement(element) {
        this.show();
        if (typeof requestAnimationFrame !== 'undefined') {
            this._ngZone.runOutsideAngular(() => {
                requestAnimationFrame(() => this._setStyles(element));
            });
        }
        else {
            this._setStyles(element);
        }
    }
    /** Shows the ink bar. */
    show() {
        this._elementRef.nativeElement.style.visibility = 'visible';
    }
    /** Hides the ink bar. */
    hide() {
        this._elementRef.nativeElement.style.visibility = 'hidden';
    }
    /**
     * Sets the proper styles to the ink bar element.
     * @param element
     */
    _setStyles(element) {
        const positions = this._inkBarPositioner(element);
        const inkBar = this._elementRef.nativeElement;
        inkBar.style.left = positions.left;
        inkBar.style.width = positions.width;
    }
}
MatInkBar.decorators = [
    { type: Directive, args: [{
                selector: 'mat-ink-bar',
                host: {
                    'class': 'mat-ink-bar',
                    '[class._mat-animation-noopable]': `_animationMode === 'NoopAnimations'`,
                },
            },] }
];
MatInkBar.ctorParameters = () => [
    { type: ElementRef },
    { type: NgZone },
    { type: undefined, decorators: [{ type: Inject, args: [_MAT_INK_BAR_POSITIONER,] }] },
    { type: String, decorators: [{ type: Optional }, { type: Inject, args: [ANIMATION_MODULE_TYPE,] }] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5rLWJhci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC90YWJzL2luay1iYXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLGNBQWMsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQzlGLE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLHNDQUFzQyxDQUFDO0FBVzNFLHNEQUFzRDtBQUN0RCxNQUFNLENBQUMsTUFBTSx1QkFBdUIsR0FDbEMsSUFBSSxjQUFjLENBQXVCLHFCQUFxQixFQUFFO0lBQzlELFVBQVUsRUFBRSxNQUFNO0lBQ2xCLE9BQU8sRUFBRSwrQkFBK0I7Q0FDekMsQ0FBQyxDQUFDO0FBRUw7OztHQUdHO0FBQ0gsTUFBTSxVQUFVLCtCQUErQjtJQUM3QyxNQUFNLE1BQU0sR0FBRyxDQUFDLE9BQW9CLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDeEMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRztRQUN0RCxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxXQUFXLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHO0tBQ3pELENBQUMsQ0FBQztJQUVILE9BQU8sTUFBTSxDQUFDO0FBQ2hCLENBQUM7QUFFRDs7O0dBR0c7QUFRSCxNQUFNLE9BQU8sU0FBUztJQUNwQixZQUNVLFdBQW9DLEVBQ3BDLE9BQWUsRUFDa0IsaUJBQXVDLEVBQzlCLGNBQXVCO1FBSGpFLGdCQUFXLEdBQVgsV0FBVyxDQUF5QjtRQUNwQyxZQUFPLEdBQVAsT0FBTyxDQUFRO1FBQ2tCLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBc0I7UUFDOUIsbUJBQWMsR0FBZCxjQUFjLENBQVM7SUFBSSxDQUFDO0lBRWhGOzs7O09BSUc7SUFDSCxjQUFjLENBQUMsT0FBb0I7UUFDakMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBRVosSUFBSSxPQUFPLHFCQUFxQixLQUFLLFdBQVcsRUFBRTtZQUNoRCxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRTtnQkFDbEMscUJBQXFCLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ3hELENBQUMsQ0FBQyxDQUFDO1NBQ0o7YUFBTTtZQUNMLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDMUI7SUFDSCxDQUFDO0lBRUQseUJBQXlCO0lBQ3pCLElBQUk7UUFDRixJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQztJQUM5RCxDQUFDO0lBRUQseUJBQXlCO0lBQ3pCLElBQUk7UUFDRixJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQztJQUM3RCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0ssVUFBVSxDQUFDLE9BQW9CO1FBQ3JDLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNsRCxNQUFNLE1BQU0sR0FBZ0IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUM7UUFFM0QsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQztRQUNuQyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDO0lBQ3ZDLENBQUM7OztZQW5ERixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLGFBQWE7Z0JBQ3ZCLElBQUksRUFBRTtvQkFDSixPQUFPLEVBQUUsYUFBYTtvQkFDdEIsaUNBQWlDLEVBQUUscUNBQXFDO2lCQUN6RTthQUNGOzs7WUExQ2tCLFVBQVU7WUFBMEIsTUFBTTs0Q0ErQ3hELE1BQU0sU0FBQyx1QkFBdUI7eUNBQzlCLFFBQVEsWUFBSSxNQUFNLFNBQUMscUJBQXFCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aXZlLCBFbGVtZW50UmVmLCBJbmplY3QsIEluamVjdGlvblRva2VuLCBOZ1pvbmUsIE9wdGlvbmFsfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7QU5JTUFUSU9OX01PRFVMRV9UWVBFfSBmcm9tICdAYW5ndWxhci9wbGF0Zm9ybS1icm93c2VyL2FuaW1hdGlvbnMnO1xuXG5cbi8qKlxuICogSW50ZXJmYWNlIGZvciBhIGEgTWF0SW5rQmFyIHBvc2l0aW9uZXIgbWV0aG9kLCBkZWZpbmluZyB0aGUgcG9zaXRpb25pbmcgYW5kIHdpZHRoIG9mIHRoZSBpbmtcbiAqIGJhciBpbiBhIHNldCBvZiB0YWJzLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIF9NYXRJbmtCYXJQb3NpdGlvbmVyIHtcbiAgKGVsZW1lbnQ6IEhUTUxFbGVtZW50KTogeyBsZWZ0OiBzdHJpbmcsIHdpZHRoOiBzdHJpbmcgfTtcbn1cblxuLyoqIEluamVjdGlvbiB0b2tlbiBmb3IgdGhlIE1hdElua0JhcidzIFBvc2l0aW9uZXIuICovXG5leHBvcnQgY29uc3QgX01BVF9JTktfQkFSX1BPU0lUSU9ORVIgPVxuICBuZXcgSW5qZWN0aW9uVG9rZW48X01hdElua0JhclBvc2l0aW9uZXI+KCdNYXRJbmtCYXJQb3NpdGlvbmVyJywge1xuICAgIHByb3ZpZGVkSW46ICdyb290JyxcbiAgICBmYWN0b3J5OiBfTUFUX0lOS19CQVJfUE9TSVRJT05FUl9GQUNUT1JZXG4gIH0pO1xuXG4vKipcbiAqIFRoZSBkZWZhdWx0IHBvc2l0aW9uZXIgZnVuY3Rpb24gZm9yIHRoZSBNYXRJbmtCYXIuXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBfTUFUX0lOS19CQVJfUE9TSVRJT05FUl9GQUNUT1JZKCk6IF9NYXRJbmtCYXJQb3NpdGlvbmVyIHtcbiAgY29uc3QgbWV0aG9kID0gKGVsZW1lbnQ6IEhUTUxFbGVtZW50KSA9PiAoe1xuICAgIGxlZnQ6IGVsZW1lbnQgPyAoZWxlbWVudC5vZmZzZXRMZWZ0IHx8IDApICsgJ3B4JyA6ICcwJyxcbiAgICB3aWR0aDogZWxlbWVudCA/IChlbGVtZW50Lm9mZnNldFdpZHRoIHx8IDApICsgJ3B4JyA6ICcwJyxcbiAgfSk7XG5cbiAgcmV0dXJuIG1ldGhvZDtcbn1cblxuLyoqXG4gKiBUaGUgaW5rLWJhciBpcyB1c2VkIHRvIGRpc3BsYXkgYW5kIGFuaW1hdGUgdGhlIGxpbmUgdW5kZXJuZWF0aCB0aGUgY3VycmVudCBhY3RpdmUgdGFiIGxhYmVsLlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdtYXQtaW5rLWJhcicsXG4gIGhvc3Q6IHtcbiAgICAnY2xhc3MnOiAnbWF0LWluay1iYXInLFxuICAgICdbY2xhc3MuX21hdC1hbmltYXRpb24tbm9vcGFibGVdJzogYF9hbmltYXRpb25Nb2RlID09PSAnTm9vcEFuaW1hdGlvbnMnYCxcbiAgfSxcbn0pXG5leHBvcnQgY2xhc3MgTWF0SW5rQmFyIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBfZWxlbWVudFJlZjogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sXG4gICAgcHJpdmF0ZSBfbmdab25lOiBOZ1pvbmUsXG4gICAgQEluamVjdChfTUFUX0lOS19CQVJfUE9TSVRJT05FUikgcHJpdmF0ZSBfaW5rQmFyUG9zaXRpb25lcjogX01hdElua0JhclBvc2l0aW9uZXIsXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChBTklNQVRJT05fTU9EVUxFX1RZUEUpIHB1YmxpYyBfYW5pbWF0aW9uTW9kZT86IHN0cmluZykgeyB9XG5cbiAgLyoqXG4gICAqIENhbGN1bGF0ZXMgdGhlIHN0eWxlcyBmcm9tIHRoZSBwcm92aWRlZCBlbGVtZW50IGluIG9yZGVyIHRvIGFsaWduIHRoZSBpbmstYmFyIHRvIHRoYXQgZWxlbWVudC5cbiAgICogU2hvd3MgdGhlIGluayBiYXIgaWYgcHJldmlvdXNseSBzZXQgYXMgaGlkZGVuLlxuICAgKiBAcGFyYW0gZWxlbWVudFxuICAgKi9cbiAgYWxpZ25Ub0VsZW1lbnQoZWxlbWVudDogSFRNTEVsZW1lbnQpIHtcbiAgICB0aGlzLnNob3coKTtcblxuICAgIGlmICh0eXBlb2YgcmVxdWVzdEFuaW1hdGlvbkZyYW1lICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhpcy5fbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHRoaXMuX3NldFN0eWxlcyhlbGVtZW50KSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fc2V0U3R5bGVzKGVsZW1lbnQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBTaG93cyB0aGUgaW5rIGJhci4gKi9cbiAgc2hvdygpOiB2b2lkIHtcbiAgICB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuc3R5bGUudmlzaWJpbGl0eSA9ICd2aXNpYmxlJztcbiAgfVxuXG4gIC8qKiBIaWRlcyB0aGUgaW5rIGJhci4gKi9cbiAgaGlkZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuc3R5bGUudmlzaWJpbGl0eSA9ICdoaWRkZW4nO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHByb3BlciBzdHlsZXMgdG8gdGhlIGluayBiYXIgZWxlbWVudC5cbiAgICogQHBhcmFtIGVsZW1lbnRcbiAgICovXG4gIHByaXZhdGUgX3NldFN0eWxlcyhlbGVtZW50OiBIVE1MRWxlbWVudCkge1xuICAgIGNvbnN0IHBvc2l0aW9ucyA9IHRoaXMuX2lua0JhclBvc2l0aW9uZXIoZWxlbWVudCk7XG4gICAgY29uc3QgaW5rQmFyOiBIVE1MRWxlbWVudCA9IHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudDtcblxuICAgIGlua0Jhci5zdHlsZS5sZWZ0ID0gcG9zaXRpb25zLmxlZnQ7XG4gICAgaW5rQmFyLnN0eWxlLndpZHRoID0gcG9zaXRpb25zLndpZHRoO1xuICB9XG59XG4iXX0=