/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { trigger, state, style, animate, transition, } from '@angular/animations';
/**
 * Animations used by the mat-menu component.
 * Animation duration and timing values are based on:
 * https://material.io/guidelines/components/menus.html#menus-usage
 * @docs-private
 */
export const matMenuAnimations = {
    /**
     * This animation controls the menu panel's entry and exit from the page.
     *
     * When the menu panel is added to the DOM, it scales in and fades in its border.
     *
     * When the menu panel is removed from the DOM, it simply fades out after a brief
     * delay to display the ripple.
     */
    transformMenu: trigger('transformMenu', [
        state('void', style({
            opacity: 0,
            transform: 'scale(0.8)'
        })),
        transition('void => enter', animate('120ms cubic-bezier(0, 0, 0.2, 1)', style({
            opacity: 1,
            transform: 'scale(1)'
        }))),
        transition('* => void', animate('100ms 25ms linear', style({ opacity: 0 })))
    ]),
    /**
     * This animation fades in the background color and content of the menu panel
     * after its containing element is scaled in.
     */
    fadeInItems: trigger('fadeInItems', [
        // TODO(crisbeto): this is inside the `transformMenu`
        // now. Remove next time we do breaking changes.
        state('showing', style({ opacity: 1 })),
        transition('void => *', [
            style({ opacity: 0 }),
            animate('400ms 100ms cubic-bezier(0.55, 0, 0.55, 0.2)')
        ])
    ])
};
/**
 * @deprecated
 * @breaking-change 8.0.0
 * @docs-private
 */
export const fadeInItems = matMenuAnimations.fadeInItems;
/**
 * @deprecated
 * @breaking-change 8.0.0
 * @docs-private
 */
export const transformMenu = matMenuAnimations.transformMenu;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1hbmltYXRpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL21lbnUvbWVudS1hbmltYXRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU0sRUFDSixPQUFPLEVBQ1AsS0FBSyxFQUNMLEtBQUssRUFDTCxPQUFPLEVBQ1AsVUFBVSxHQUVYLE1BQU0scUJBQXFCLENBQUM7QUFFN0I7Ozs7O0dBS0c7QUFDSCxNQUFNLENBQUMsTUFBTSxpQkFBaUIsR0FHMUI7SUFDRjs7Ozs7OztPQU9HO0lBQ0gsYUFBYSxFQUFFLE9BQU8sQ0FBQyxlQUFlLEVBQUU7UUFDdEMsS0FBSyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUM7WUFDbEIsT0FBTyxFQUFFLENBQUM7WUFDVixTQUFTLEVBQUUsWUFBWTtTQUN4QixDQUFDLENBQUM7UUFDSCxVQUFVLENBQUMsZUFBZSxFQUFFLE9BQU8sQ0FBQyxrQ0FBa0MsRUFBRSxLQUFLLENBQUM7WUFDNUUsT0FBTyxFQUFFLENBQUM7WUFDVixTQUFTLEVBQUUsVUFBVTtTQUN0QixDQUFDLENBQUMsQ0FBQztRQUNKLFVBQVUsQ0FBQyxXQUFXLEVBQUUsT0FBTyxDQUFDLG1CQUFtQixFQUFFLEtBQUssQ0FBQyxFQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUM7S0FDM0UsQ0FBQztJQUdGOzs7T0FHRztJQUNILFdBQVcsRUFBRSxPQUFPLENBQUMsYUFBYSxFQUFFO1FBQ2xDLHFEQUFxRDtRQUNyRCxnREFBZ0Q7UUFDaEQsS0FBSyxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsRUFBQyxPQUFPLEVBQUUsQ0FBQyxFQUFDLENBQUMsQ0FBQztRQUNyQyxVQUFVLENBQUMsV0FBVyxFQUFFO1lBQ3RCLEtBQUssQ0FBQyxFQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUMsQ0FBQztZQUNuQixPQUFPLENBQUMsOENBQThDLENBQUM7U0FDeEQsQ0FBQztLQUNILENBQUM7Q0FDSCxDQUFDO0FBRUY7Ozs7R0FJRztBQUNILE1BQU0sQ0FBQyxNQUFNLFdBQVcsR0FBRyxpQkFBaUIsQ0FBQyxXQUFXLENBQUM7QUFFekQ7Ozs7R0FJRztBQUNILE1BQU0sQ0FBQyxNQUFNLGFBQWEsR0FBRyxpQkFBaUIsQ0FBQyxhQUFhLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0e1xuICB0cmlnZ2VyLFxuICBzdGF0ZSxcbiAgc3R5bGUsXG4gIGFuaW1hdGUsXG4gIHRyYW5zaXRpb24sXG4gIEFuaW1hdGlvblRyaWdnZXJNZXRhZGF0YSxcbn0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG5cbi8qKlxuICogQW5pbWF0aW9ucyB1c2VkIGJ5IHRoZSBtYXQtbWVudSBjb21wb25lbnQuXG4gKiBBbmltYXRpb24gZHVyYXRpb24gYW5kIHRpbWluZyB2YWx1ZXMgYXJlIGJhc2VkIG9uOlxuICogaHR0cHM6Ly9tYXRlcmlhbC5pby9ndWlkZWxpbmVzL2NvbXBvbmVudHMvbWVudXMuaHRtbCNtZW51cy11c2FnZVxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5leHBvcnQgY29uc3QgbWF0TWVudUFuaW1hdGlvbnM6IHtcbiAgcmVhZG9ubHkgdHJhbnNmb3JtTWVudTogQW5pbWF0aW9uVHJpZ2dlck1ldGFkYXRhO1xuICByZWFkb25seSBmYWRlSW5JdGVtczogQW5pbWF0aW9uVHJpZ2dlck1ldGFkYXRhO1xufSA9IHtcbiAgLyoqXG4gICAqIFRoaXMgYW5pbWF0aW9uIGNvbnRyb2xzIHRoZSBtZW51IHBhbmVsJ3MgZW50cnkgYW5kIGV4aXQgZnJvbSB0aGUgcGFnZS5cbiAgICpcbiAgICogV2hlbiB0aGUgbWVudSBwYW5lbCBpcyBhZGRlZCB0byB0aGUgRE9NLCBpdCBzY2FsZXMgaW4gYW5kIGZhZGVzIGluIGl0cyBib3JkZXIuXG4gICAqXG4gICAqIFdoZW4gdGhlIG1lbnUgcGFuZWwgaXMgcmVtb3ZlZCBmcm9tIHRoZSBET00sIGl0IHNpbXBseSBmYWRlcyBvdXQgYWZ0ZXIgYSBicmllZlxuICAgKiBkZWxheSB0byBkaXNwbGF5IHRoZSByaXBwbGUuXG4gICAqL1xuICB0cmFuc2Zvcm1NZW51OiB0cmlnZ2VyKCd0cmFuc2Zvcm1NZW51JywgW1xuICAgIHN0YXRlKCd2b2lkJywgc3R5bGUoe1xuICAgICAgb3BhY2l0eTogMCxcbiAgICAgIHRyYW5zZm9ybTogJ3NjYWxlKDAuOCknXG4gICAgfSkpLFxuICAgIHRyYW5zaXRpb24oJ3ZvaWQgPT4gZW50ZXInLCBhbmltYXRlKCcxMjBtcyBjdWJpYy1iZXppZXIoMCwgMCwgMC4yLCAxKScsIHN0eWxlKHtcbiAgICAgIG9wYWNpdHk6IDEsXG4gICAgICB0cmFuc2Zvcm06ICdzY2FsZSgxKSdcbiAgICB9KSkpLFxuICAgIHRyYW5zaXRpb24oJyogPT4gdm9pZCcsIGFuaW1hdGUoJzEwMG1zIDI1bXMgbGluZWFyJywgc3R5bGUoe29wYWNpdHk6IDB9KSkpXG4gIF0pLFxuXG5cbiAgLyoqXG4gICAqIFRoaXMgYW5pbWF0aW9uIGZhZGVzIGluIHRoZSBiYWNrZ3JvdW5kIGNvbG9yIGFuZCBjb250ZW50IG9mIHRoZSBtZW51IHBhbmVsXG4gICAqIGFmdGVyIGl0cyBjb250YWluaW5nIGVsZW1lbnQgaXMgc2NhbGVkIGluLlxuICAgKi9cbiAgZmFkZUluSXRlbXM6IHRyaWdnZXIoJ2ZhZGVJbkl0ZW1zJywgW1xuICAgIC8vIFRPRE8oY3Jpc2JldG8pOiB0aGlzIGlzIGluc2lkZSB0aGUgYHRyYW5zZm9ybU1lbnVgXG4gICAgLy8gbm93LiBSZW1vdmUgbmV4dCB0aW1lIHdlIGRvIGJyZWFraW5nIGNoYW5nZXMuXG4gICAgc3RhdGUoJ3Nob3dpbmcnLCBzdHlsZSh7b3BhY2l0eTogMX0pKSxcbiAgICB0cmFuc2l0aW9uKCd2b2lkID0+IConLCBbXG4gICAgICBzdHlsZSh7b3BhY2l0eTogMH0pLFxuICAgICAgYW5pbWF0ZSgnNDAwbXMgMTAwbXMgY3ViaWMtYmV6aWVyKDAuNTUsIDAsIDAuNTUsIDAuMiknKVxuICAgIF0pXG4gIF0pXG59O1xuXG4vKipcbiAqIEBkZXByZWNhdGVkXG4gKiBAYnJlYWtpbmctY2hhbmdlIDguMC4wXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbmV4cG9ydCBjb25zdCBmYWRlSW5JdGVtcyA9IG1hdE1lbnVBbmltYXRpb25zLmZhZGVJbkl0ZW1zO1xuXG4vKipcbiAqIEBkZXByZWNhdGVkXG4gKiBAYnJlYWtpbmctY2hhbmdlIDguMC4wXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbmV4cG9ydCBjb25zdCB0cmFuc2Zvcm1NZW51ID0gbWF0TWVudUFuaW1hdGlvbnMudHJhbnNmb3JtTWVudTtcbiJdfQ==