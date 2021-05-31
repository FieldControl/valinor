/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { animate, state, style, transition, trigger, keyframes, query, animateChild, } from '@angular/animations';
import { AnimationCurves, AnimationDurations } from '@angular/material/core';
const SORT_ANIMATION_TRANSITION = AnimationDurations.ENTERING + ' ' +
    AnimationCurves.STANDARD_CURVE;
/**
 * Animations used by MatSort.
 * @docs-private
 */
export const matSortAnimations = {
    /** Animation that moves the sort indicator. */
    indicator: trigger('indicator', [
        state('active-asc, asc', style({ transform: 'translateY(0px)' })),
        // 10px is the height of the sort indicator, minus the width of the pointers
        state('active-desc, desc', style({ transform: 'translateY(10px)' })),
        transition('active-asc <=> active-desc', animate(SORT_ANIMATION_TRANSITION))
    ]),
    /** Animation that rotates the left pointer of the indicator based on the sorting direction. */
    leftPointer: trigger('leftPointer', [
        state('active-asc, asc', style({ transform: 'rotate(-45deg)' })),
        state('active-desc, desc', style({ transform: 'rotate(45deg)' })),
        transition('active-asc <=> active-desc', animate(SORT_ANIMATION_TRANSITION))
    ]),
    /** Animation that rotates the right pointer of the indicator based on the sorting direction. */
    rightPointer: trigger('rightPointer', [
        state('active-asc, asc', style({ transform: 'rotate(45deg)' })),
        state('active-desc, desc', style({ transform: 'rotate(-45deg)' })),
        transition('active-asc <=> active-desc', animate(SORT_ANIMATION_TRANSITION))
    ]),
    /** Animation that controls the arrow opacity. */
    arrowOpacity: trigger('arrowOpacity', [
        state('desc-to-active, asc-to-active, active', style({ opacity: 1 })),
        state('desc-to-hint, asc-to-hint, hint', style({ opacity: .54 })),
        state('hint-to-desc, active-to-desc, desc, hint-to-asc, active-to-asc, asc, void', style({ opacity: 0 })),
        // Transition between all states except for immediate transitions
        transition('* => asc, * => desc, * => active, * => hint, * => void', animate('0ms')),
        transition('* <=> *', animate(SORT_ANIMATION_TRANSITION)),
    ]),
    /**
     * Animation for the translation of the arrow as a whole. States are separated into two
     * groups: ones with animations and others that are immediate. Immediate states are asc, desc,
     * peek, and active. The other states define a specific animation (source-to-destination)
     * and are determined as a function of their prev user-perceived state and what the next state
     * should be.
     */
    arrowPosition: trigger('arrowPosition', [
        // Hidden Above => Hint Center
        transition('* => desc-to-hint, * => desc-to-active', animate(SORT_ANIMATION_TRANSITION, keyframes([
            style({ transform: 'translateY(-25%)' }),
            style({ transform: 'translateY(0)' })
        ]))),
        // Hint Center => Hidden Below
        transition('* => hint-to-desc, * => active-to-desc', animate(SORT_ANIMATION_TRANSITION, keyframes([
            style({ transform: 'translateY(0)' }),
            style({ transform: 'translateY(25%)' })
        ]))),
        // Hidden Below => Hint Center
        transition('* => asc-to-hint, * => asc-to-active', animate(SORT_ANIMATION_TRANSITION, keyframes([
            style({ transform: 'translateY(25%)' }),
            style({ transform: 'translateY(0)' })
        ]))),
        // Hint Center => Hidden Above
        transition('* => hint-to-asc, * => active-to-asc', animate(SORT_ANIMATION_TRANSITION, keyframes([
            style({ transform: 'translateY(0)' }),
            style({ transform: 'translateY(-25%)' })
        ]))),
        state('desc-to-hint, asc-to-hint, hint, desc-to-active, asc-to-active, active', style({ transform: 'translateY(0)' })),
        state('hint-to-desc, active-to-desc, desc', style({ transform: 'translateY(-25%)' })),
        state('hint-to-asc, active-to-asc, asc', style({ transform: 'translateY(25%)' })),
    ]),
    /** Necessary trigger that calls animate on children animations. */
    allowChildren: trigger('allowChildren', [
        transition('* <=> *', [
            query('@*', animateChild(), { optional: true })
        ])
    ]),
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29ydC1hbmltYXRpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL3NvcnQvc29ydC1hbmltYXRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUNILE9BQU8sRUFDTCxPQUFPLEVBQ1AsS0FBSyxFQUNMLEtBQUssRUFDTCxVQUFVLEVBQ1YsT0FBTyxFQUNQLFNBQVMsRUFDaUIsS0FBSyxFQUFFLFlBQVksR0FDOUMsTUFBTSxxQkFBcUIsQ0FBQztBQUM3QixPQUFPLEVBQUMsZUFBZSxFQUFFLGtCQUFrQixFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFFM0UsTUFBTSx5QkFBeUIsR0FBRyxrQkFBa0IsQ0FBQyxRQUFRLEdBQUcsR0FBRztJQUNqQyxlQUFlLENBQUMsY0FBYyxDQUFDO0FBRWpFOzs7R0FHRztBQUNILE1BQU0sQ0FBQyxNQUFNLGlCQUFpQixHQU8xQjtJQUNGLCtDQUErQztJQUMvQyxTQUFTLEVBQUUsT0FBTyxDQUFDLFdBQVcsRUFBRTtRQUM5QixLQUFLLENBQUMsaUJBQWlCLEVBQUUsS0FBSyxDQUFDLEVBQUMsU0FBUyxFQUFFLGlCQUFpQixFQUFDLENBQUMsQ0FBQztRQUMvRCw0RUFBNEU7UUFDNUUsS0FBSyxDQUFDLG1CQUFtQixFQUFFLEtBQUssQ0FBQyxFQUFDLFNBQVMsRUFBRSxrQkFBa0IsRUFBQyxDQUFDLENBQUM7UUFDbEUsVUFBVSxDQUFDLDRCQUE0QixFQUFFLE9BQU8sQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0tBQzdFLENBQUM7SUFFRiwrRkFBK0Y7SUFDL0YsV0FBVyxFQUFFLE9BQU8sQ0FBQyxhQUFhLEVBQUU7UUFDbEMsS0FBSyxDQUFDLGlCQUFpQixFQUFFLEtBQUssQ0FBQyxFQUFDLFNBQVMsRUFBRSxnQkFBZ0IsRUFBQyxDQUFDLENBQUM7UUFDOUQsS0FBSyxDQUFDLG1CQUFtQixFQUFFLEtBQUssQ0FBQyxFQUFDLFNB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QUFtRTtJQUNuRSxhQUFhLEVBQUUsT0FBTyxDQUFDLGVBQWUsRUFBRTtRQUN0QyxVQUFVLENBQUMsU0FBUyxFQUFFO1lBQ3BCLEtBQUssQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLEVBQUUsRUFBQyxRQUFRLEVBQUUsSUFBSSxFQUFDLENBQUM7U0FDOUMsQ0FBQztLQUNILENBQUM7Q0FDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge1xuICBhbmltYXRlLFxuICBzdGF0ZSxcbiAgc3R5bGUsXG4gIHRyYW5zaXRpb24sXG4gIHRyaWdnZXIsXG4gIGtleWZyYW1lcyxcbiAgQW5pbWF0aW9uVHJpZ2dlck1ldGFkYXRhLCBxdWVyeSwgYW5pbWF0ZUNoaWxkLFxufSBmcm9tICdAYW5ndWxhci9hbmltYXRpb25zJztcbmltcG9ydCB7QW5pbWF0aW9uQ3VydmVzLCBBbmltYXRpb25EdXJhdGlvbnN9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2NvcmUnO1xuXG5jb25zdCBTT1JUX0FOSU1BVElPTl9UUkFOU0lUSU9OID0gQW5pbWF0aW9uRHVyYXRpb25zLkVOVEVSSU5HICsgJyAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBBbmltYXRpb25DdXJ2ZXMuU1RBTkRBUkRfQ1VSVkU7XG5cbi8qKlxuICogQW5pbWF0aW9ucyB1c2VkIGJ5IE1hdFNvcnQuXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbmV4cG9ydCBjb25zdCBtYXRTb3J0QW5pbWF0aW9uczoge1xuICByZWFkb25seSBpbmRpY2F0b3I6IEFuaW1hdGlvblRyaWdnZXJNZXRhZGF0YTtcbiAgcmVhZG9ubHkgbGVmdFBvaW50ZXI6IEFuaW1hdGlvblRyaWdnZXJNZXRhZGF0YTtcbiAgcmVhZG9ubHkgcmlnaHRQb2ludGVyOiBBbmltYXRpb25UcmlnZ2VyTWV0YWRhdGE7XG4gIHJlYWRvbmx5IGFycm93T3BhY2l0eTogQW5pbWF0aW9uVHJpZ2dlck1ldGFkYXRhO1xuICByZWFkb25seSBhcnJvd1Bvc2l0aW9uOiBBbmltYXRpb25UcmlnZ2VyTWV0YWRhdGE7XG4gIHJlYWRvbmx5IGFsbG93Q2hpbGRyZW46IEFuaW1hdGlvblRyaWdnZXJNZXRhZGF0YTtcbn0gPSB7XG4gIC8qKiBBbmltYXRpb24gdGhhdCBtb3ZlcyB0aGUgc29ydCBpbmRpY2F0b3IuICovXG4gIGluZGljYXRvcjogdHJpZ2dlcignaW5kaWNhdG9yJywgW1xuICAgIHN0YXRlKCdhY3RpdmUtYXNjLCBhc2MnLCBzdHlsZSh7dHJhbnNmb3JtOiAndHJhbnNsYXRlWSgwcHgpJ30pKSxcbiAgICAvLyAxMHB4IGlzIHRoZSBoZWlnaHQgb2YgdGhlIHNvcnQgaW5kaWNhdG9yLCBtaW51cyB0aGUgd2lkdGggb2YgdGhlIHBvaW50ZXJzXG4gICAgc3RhdGUoJ2FjdGl2ZS1kZXNjLCBkZXNjJywgc3R5bGUoe3RyYW5zZm9ybTogJ3RyYW5zbGF0ZVkoMTBweCknfSkpLFxuICAgIHRyYW5zaXRpb24oJ2FjdGl2ZS1hc2MgPD0+IGFjdGl2ZS1kZXNjJywgYW5pbWF0ZShTT1JUX0FOSU1BVElPTl9UUkFOU0lUSU9OKSlcbiAgXSksXG5cbiAgLyoqIEFuaW1hdGlvbiB0aGF0IHJvdGF0ZXMgdGhlIGxlZnQgcG9pbnRlciBvZiB0aGUgaW5kaWNhdG9yIGJhc2VkIG9uIHRoZSBzb3J0aW5nIGRpcmVjdGlvbi4gKi9cbiAgbGVmdFBvaW50ZXI6IHRyaWdnZXIoJ2xlZnRQb2ludGVyJywgW1xuICAgIHN0YXRlKCdhY3RpdmUtYXNjLCBhc2MnLCBzdHlsZSh7dHJhbnNmb3JtOiAncm90YXRlKC00NWRlZyknfSkpLFxuICAgIHN0YXRlKCdhY3RpdmUtZGVzYywgZGVzYycsIHN0eWxlKHt0cmFuc2Zvcm06ICdyb3RhdGUoNDVkZWcpJ30pKSxcbiAgICB0cmFuc2l0aW9uKCdhY3RpdmUtYXNjIDw9PiBhY3RpdmUtZGVzYycsIGFuaW1hdGUoU09SVF9BTklNQVRJT05fVFJBTlNJVElPTikpXG4gIF0pLFxuXG4gIC8qKiBBbmltYXRpb24gdGhhdCByb3RhdGVzIHRoZSByaWdodCBwb2ludGVyIG9mIHRoZSBpbmRpY2F0b3IgYmFzZWQgb24gdGhlIHNvcnRpbmcgZGlyZWN0aW9uLiAqL1xuICByaWdodFBvaW50ZXI6IHRyaWdnZXIoJ3JpZ2h0UG9pbnRlcicsIFtcbiAgICBzdGF0ZSgnYWN0aXZlLWFzYywgYXNjJywgc3R5bGUoe3RyYW5zZm9ybTogJ3JvdGF0ZSg0NWRlZyknfSkpLFxuICAgIHN0YXRlKCdhY3RpdmUtZGVzYywgZGVzYycsIHN0eWxlKHt0cmFuc2Zvcm06ICdyb3RhdGUoLTQ1ZGVnKSd9KSksXG4gICAgdHJhbnNpdGlvbignYWN0aXZlLWFzYyA8PT4gYWN0aXZlLWRlc2MnLCBhbmltYXRlKFNPUlRfQU5JTUFUSU9OX1RSQU5TSVRJT04pKVxuICBdKSxcblxuICAvKiogQW5pbWF0aW9uIHRoYXQgY29udHJvbHMgdGhlIGFycm93IG9wYWNpdHkuICovXG4gIGFycm93T3BhY2l0eTogdHJpZ2dlcignYXJyb3dPcGFjaXR5JywgW1xuICAgIHN0YXRlKCdkZXNjLXRvLWFjdGl2ZSwgYXNjLXRvLWFjdGl2ZSwgYWN0aXZlJywgc3R5bGUoe29wYWNpdHk6IDF9KSksXG4gICAgc3RhdGUoJ2Rlc2MtdG8taGludCwgYXNjLXRvLWhpbnQsIGhpbnQnLCBzdHlsZSh7b3BhY2l0eTogLjU0fSkpLFxuICAgIHN0YXRlKCdoaW50LXRvLWRlc2MsIGFjdGl2ZS10by1kZXNjLCBkZXNjLCBoaW50LXRvLWFzYywgYWN0aXZlLXRvLWFzYywgYXNjLCB2b2lkJyxcbiAgICAgICAgc3R5bGUoe29wYWNpdHk6IDB9KSksXG4gICAgLy8gVHJhbnNpdGlvbiBiZXR3ZWVuIGFsbCBzdGF0ZXMgZXhjZXB0IGZvciBpbW1lZGlhdGUgdHJhbnNpdGlvbnNcbiAgICB0cmFuc2l0aW9uKCcqID0+IGFzYywgKiA9PiBkZXNjLCAqID0+IGFjdGl2ZSwgKiA9PiBoaW50LCAqID0+IHZvaWQnLCBhbmltYXRlKCcwbXMnKSksXG4gICAgdHJhbnNpdGlvbignKiA8PT4gKicsIGFuaW1hdGUoU09SVF9BTklNQVRJT05fVFJBTlNJVElPTikpLFxuICBdKSxcblxuICAvKipcbiAgICogQW5pbWF0aW9uIGZvciB0aGUgdHJhbnNsYXRpb24gb2YgdGhlIGFycm93IGFzIGEgd2hvbGUuIFN0YXRlcyBhcmUgc2VwYXJhdGVkIGludG8gdHdvXG4gICAqIGdyb3Vwczogb25lcyB3aXRoIGFuaW1hdGlvbnMgYW5kIG90aGVycyB0aGF0IGFyZSBpbW1lZGlhdGUuIEltbWVkaWF0ZSBzdGF0ZXMgYXJlIGFzYywgZGVzYyxcbiAgICogcGVlaywgYW5kIGFjdGl2ZS4gVGhlIG90aGVyIHN0YXRlcyBkZWZpbmUgYSBzcGVjaWZpYyBhbmltYXRpb24gKHNvdXJjZS10by1kZXN0aW5hdGlvbilcbiAgICogYW5kIGFyZSBkZXRlcm1pbmVkIGFzIGEgZnVuY3Rpb24gb2YgdGhlaXIgcHJldiB1c2VyLXBlcmNlaXZlZCBzdGF0ZSBhbmQgd2hhdCB0aGUgbmV4dCBzdGF0ZVxuICAgKiBzaG91bGQgYmUuXG4gICAqL1xuICBhcnJvd1Bvc2l0aW9uOiB0cmlnZ2VyKCdhcnJvd1Bvc2l0aW9uJywgW1xuICAgIC8vIEhpZGRlbiBBYm92ZSA9PiBIaW50IENlbnRlclxuICAgIHRyYW5zaXRpb24oJyogPT4gZGVzYy10by1oaW50LCAqID0+IGRlc2MtdG8tYWN0aXZlJyxcbiAgICAgICAgYW5pbWF0ZShTT1JUX0FOSU1BVElPTl9UUkFOU0lUSU9OLCBrZXlmcmFtZXMoW1xuICAgICAgICAgIHN0eWxlKHt0cmFuc2Zvcm06ICd0cmFuc2xhdGVZKC0yNSUpJ30pLFxuICAgICAgICAgIHN0eWxlKHt0cmFuc2Zvcm06ICd0cmFuc2xhdGVZKDApJ30pXG4gICAgICAgIF0pKSksXG4gICAgLy8gSGludCBDZW50ZXIgPT4gSGlkZGVuIEJlbG93XG4gICAgdHJhbnNpdGlvbignKiA9PiBoaW50LXRvLWRlc2MsICogPT4gYWN0aXZlLXRvLWRlc2MnLFxuICAgICAgICBhbmltYXRlKFNPUlRfQU5JTUFUSU9OX1RSQU5TSVRJT04sIGtleWZyYW1lcyhbXG4gICAgICAgICAgc3R5bGUoe3RyYW5zZm9ybTogJ3RyYW5zbGF0ZVkoMCknfSksXG4gICAgICAgICAgc3R5bGUoe3RyYW5zZm9ybTogJ3RyYW5zbGF0ZVkoMjUlKSd9KVxuICAgICAgICBdKSkpLFxuICAgIC8vIEhpZGRlbiBCZWxvdyA9PiBIaW50IENlbnRlclxuICAgIHRyYW5zaXRpb24oJyogPT4gYXNjLXRvLWhpbnQsICogPT4gYXNjLXRvLWFjdGl2ZScsXG4gICAgICAgIGFuaW1hdGUoU09SVF9BTklNQVRJT05fVFJBTlNJVElPTiwga2V5ZnJhbWVzKFtcbiAgICAgICAgICBzdHlsZSh7dHJhbnNmb3JtOiAndHJhbnNsYXRlWSgyNSUpJ30pLFxuICAgICAgICAgIHN0eWxlKHt0cmFuc2Zvcm06ICd0cmFuc2xhdGVZKDApJ30pXG4gICAgICAgIF0pKSksXG4gICAgLy8gSGludCBDZW50ZXIgPT4gSGlkZGVuIEFib3ZlXG4gICAgdHJhbnNpdGlvbignKiA9PiBoaW50LXRvLWFzYywgKiA9PiBhY3RpdmUtdG8tYXNjJyxcbiAgICAgICAgYW5pbWF0ZShTT1JUX0FOSU1BVElPTl9UUkFOU0lUSU9OLCBrZXlmcmFtZXMoW1xuICAgICAgICAgIHN0eWxlKHt0cmFuc2Zvcm06ICd0cmFuc2xhdGVZKDApJ30pLFxuICAgICAgICAgIHN0eWxlKHt0cmFuc2Zvcm06ICd0cmFuc2xhdGVZKC0yNSUpJ30pXG4gICAgICAgIF0pKSksXG4gICAgc3RhdGUoJ2Rlc2MtdG8taGludCwgYXNjLXRvLWhpbnQsIGhpbnQsIGRlc2MtdG8tYWN0aXZlLCBhc2MtdG8tYWN0aXZlLCBhY3RpdmUnLFxuICAgICAgICBzdHlsZSh7dHJhbnNmb3JtOiAndHJhbnNsYXRlWSgwKSd9KSksXG4gICAgc3RhdGUoJ2hpbnQtdG8tZGVzYywgYWN0aXZlLXRvLWRlc2MsIGRlc2MnLFxuICAgICAgICBzdHlsZSh7dHJhbnNmb3JtOiAndHJhbnNsYXRlWSgtMjUlKSd9KSksXG4gICAgc3RhdGUoJ2hpbnQtdG8tYXNjLCBhY3RpdmUtdG8tYXNjLCBhc2MnLFxuICAgICAgICBzdHlsZSh7dHJhbnNmb3JtOiAndHJhbnNsYXRlWSgyNSUpJ30pKSxcbiAgXSksXG5cbiAgLyoqIE5lY2Vzc2FyeSB0cmlnZ2VyIHRoYXQgY2FsbHMgYW5pbWF0ZSBvbiBjaGlsZHJlbiBhbmltYXRpb25zLiAqL1xuICBhbGxvd0NoaWxkcmVuOiB0cmlnZ2VyKCdhbGxvd0NoaWxkcmVuJywgW1xuICAgIHRyYW5zaXRpb24oJyogPD0+IConLCBbXG4gICAgICBxdWVyeSgnQConLCBhbmltYXRlQ2hpbGQoKSwge29wdGlvbmFsOiB0cnVlfSlcbiAgICBdKVxuICBdKSxcbn07XG4iXX0=