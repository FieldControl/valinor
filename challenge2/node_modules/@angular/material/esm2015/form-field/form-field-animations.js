/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { animate, state, style, transition, trigger, } from '@angular/animations';
/**
 * Animations used by the MatFormField.
 * @docs-private
 */
export const matFormFieldAnimations = {
    /** Animation that transitions the form field's error and hint messages. */
    transitionMessages: trigger('transitionMessages', [
        // TODO(mmalerba): Use angular animations for label animation as well.
        state('enter', style({ opacity: 1, transform: 'translateY(0%)' })),
        transition('void => enter', [
            style({ opacity: 0, transform: 'translateY(-5px)' }),
            animate('300ms cubic-bezier(0.55, 0, 0.55, 0.2)'),
        ]),
    ])
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybS1maWVsZC1hbmltYXRpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL2Zvcm0tZmllbGQvZm9ybS1maWVsZC1hbmltYXRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUNILE9BQU8sRUFDTCxPQUFPLEVBQ1AsS0FBSyxFQUNMLEtBQUssRUFDTCxVQUFVLEVBQ1YsT0FBTyxHQUVSLE1BQU0scUJBQXFCLENBQUM7QUFFN0I7OztHQUdHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sc0JBQXNCLEdBRS9CO0lBQ0YsMkVBQTJFO0lBQzNFLGtCQUFrQixFQUFFLE9BQU8sQ0FBQyxvQkFBb0IsRUFBRTtRQUNoRCxzRUFBc0U7UUFDdEUsS0FBSyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxnQkFBZ0IsRUFBRSxDQUFDLENBQUM7UUFDbEUsVUFBVSxDQUFDLGVBQWUsRUFBRTtZQUMxQixLQUFLLENBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxrQkFBa0IsRUFBRSxDQUFDO1lBQ3BELE9BQU8sQ0FBQyx3Q0FBd0MsQ0FBQztTQUNsRCxDQUFDO0tBQ0gsQ0FBQztDQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7XG4gIGFuaW1hdGUsXG4gIHN0YXRlLFxuICBzdHlsZSxcbiAgdHJhbnNpdGlvbixcbiAgdHJpZ2dlcixcbiAgQW5pbWF0aW9uVHJpZ2dlck1ldGFkYXRhLFxufSBmcm9tICdAYW5ndWxhci9hbmltYXRpb25zJztcblxuLyoqXG4gKiBBbmltYXRpb25zIHVzZWQgYnkgdGhlIE1hdEZvcm1GaWVsZC5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuZXhwb3J0IGNvbnN0IG1hdEZvcm1GaWVsZEFuaW1hdGlvbnM6IHtcbiAgcmVhZG9ubHkgdHJhbnNpdGlvbk1lc3NhZ2VzOiBBbmltYXRpb25UcmlnZ2VyTWV0YWRhdGFcbn0gPSB7XG4gIC8qKiBBbmltYXRpb24gdGhhdCB0cmFuc2l0aW9ucyB0aGUgZm9ybSBmaWVsZCdzIGVycm9yIGFuZCBoaW50IG1lc3NhZ2VzLiAqL1xuICB0cmFuc2l0aW9uTWVzc2FnZXM6IHRyaWdnZXIoJ3RyYW5zaXRpb25NZXNzYWdlcycsIFtcbiAgICAvLyBUT0RPKG1tYWxlcmJhKTogVXNlIGFuZ3VsYXIgYW5pbWF0aW9ucyBmb3IgbGFiZWwgYW5pbWF0aW9uIGFzIHdlbGwuXG4gICAgc3RhdGUoJ2VudGVyJywgc3R5bGUoeyBvcGFjaXR5OiAxLCB0cmFuc2Zvcm06ICd0cmFuc2xhdGVZKDAlKScgfSkpLFxuICAgIHRyYW5zaXRpb24oJ3ZvaWQgPT4gZW50ZXInLCBbXG4gICAgICBzdHlsZSh7IG9wYWNpdHk6IDAsIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZVkoLTVweCknIH0pLFxuICAgICAgYW5pbWF0ZSgnMzAwbXMgY3ViaWMtYmV6aWVyKDAuNTUsIDAsIDAuNTUsIDAuMiknKSxcbiAgICBdKSxcbiAgXSlcbn07XG4iXX0=