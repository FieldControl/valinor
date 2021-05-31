/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { animate, animateChild, query, state, style, transition, trigger, } from '@angular/animations';
/**
 * The following are all the animations for the mat-select component, with each
 * const containing the metadata for one animation.
 *
 * The values below match the implementation of the AngularJS Material mat-select animation.
 * @docs-private
 */
export const matSelectAnimations = {
    /**
     * This animation ensures the select's overlay panel animation (transformPanel) is called when
     * closing the select.
     * This is needed due to https://github.com/angular/angular/issues/23302
     */
    transformPanelWrap: trigger('transformPanelWrap', [
        transition('* => void', query('@transformPanel', [animateChild()], { optional: true }))
    ]),
    /**
     * This animation transforms the select's overlay panel on and off the page.
     *
     * When the panel is attached to the DOM, it expands its width by the amount of padding, scales it
     * up to 100% on the Y axis, fades in its border, and translates slightly up and to the
     * side to ensure the option text correctly overlaps the trigger text.
     *
     * When the panel is removed from the DOM, it simply fades out linearly.
     */
    transformPanel: trigger('transformPanel', [
        state('void', style({
            transform: 'scaleY(0.8)',
            minWidth: '100%',
            opacity: 0
        })),
        state('showing', style({
            opacity: 1,
            minWidth: 'calc(100% + 32px)',
            transform: 'scaleY(1)'
        })),
        state('showing-multiple', style({
            opacity: 1,
            minWidth: 'calc(100% + 64px)',
            transform: 'scaleY(1)'
        })),
        transition('void => *', animate('120ms cubic-bezier(0, 0, 0.2, 1)')),
        transition('* => void', animate('100ms 25ms linear', style({ opacity: 0 })))
    ])
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0LWFuaW1hdGlvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvc2VsZWN0L3NlbGVjdC1hbmltYXRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFDTCxPQUFPLEVBQ1AsWUFBWSxFQUVaLEtBQUssRUFDTCxLQUFLLEVBQ0wsS0FBSyxFQUNMLFVBQVUsRUFDVixPQUFPLEdBQ1IsTUFBTSxxQkFBcUIsQ0FBQztBQUU3Qjs7Ozs7O0dBTUc7QUFDSCxNQUFNLENBQUMsTUFBTSxtQkFBbUIsR0FHNUI7SUFDRjs7OztPQUlHO0lBQ0gsa0JBQWtCLEVBQUUsT0FBTyxDQUFDLG9CQUFvQixFQUFFO1FBQzlDLFVBQVUsQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDLGlCQUFpQixFQUFFLENBQUMsWUFBWSxFQUFFLENBQUMsRUFDN0QsRUFBQyxRQUFRLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztLQUN6QixDQUFDO0lBRUY7Ozs7Ozs7O09BUUc7SUFDSCxjQUFjLEVBQUUsT0FBTyxDQUFDLGdCQUFnQixFQUFFO1FBQ3hDLEtBQUssQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDO1lBQ2xCLFNBQVMsRUFBRSxhQUFhO1lBQ3hCLFFBQVEsRUFBRSxNQUFNO1lBQ2hCLE9BQU8sRUFBRSxDQUFDO1NBQ1gsQ0FBQyxDQUFDO1FBQ0gsS0FBSyxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUM7WUFDckIsT0FBTyxFQUFFLENBQUM7WUFDVixRQUFRLEVBQUUsbUJBQW1CO1lBQzdCLFNBQVMsRUFBRSxXQUFXO1NBQ3ZCLENBQUMsQ0FBQztRQUNILEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxLQUFLLENBQUM7WUFDOUIsT0FBTyxFQUFFLENBQUM7WUFDVixRQUFRLEVBQUUsbUJBQW1CO1lBQzdCLFNBQVMsRUFBRSxXQUFXO1NBQ3ZCLENBQUMsQ0FBQztRQUNILFVBQVUsQ0FBQyxXQUFXLEVBQUUsT0FBTyxDQUFDLGtDQUFrQyxDQUFDLENBQUM7UUFDcEUsVUFBVSxDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsbUJBQW1CLEVBQUUsS0FBSyxDQUFDLEVBQUMsT0FBTyxFQUFFLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQztLQUMzRSxDQUFDO0NBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBhbmltYXRlLFxuICBhbmltYXRlQ2hpbGQsXG4gIEFuaW1hdGlvblRyaWdnZXJNZXRhZGF0YSxcbiAgcXVlcnksXG4gIHN0YXRlLFxuICBzdHlsZSxcbiAgdHJhbnNpdGlvbixcbiAgdHJpZ2dlcixcbn0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG5cbi8qKlxuICogVGhlIGZvbGxvd2luZyBhcmUgYWxsIHRoZSBhbmltYXRpb25zIGZvciB0aGUgbWF0LXNlbGVjdCBjb21wb25lbnQsIHdpdGggZWFjaFxuICogY29uc3QgY29udGFpbmluZyB0aGUgbWV0YWRhdGEgZm9yIG9uZSBhbmltYXRpb24uXG4gKlxuICogVGhlIHZhbHVlcyBiZWxvdyBtYXRjaCB0aGUgaW1wbGVtZW50YXRpb24gb2YgdGhlIEFuZ3VsYXJKUyBNYXRlcmlhbCBtYXQtc2VsZWN0IGFuaW1hdGlvbi5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuZXhwb3J0IGNvbnN0IG1hdFNlbGVjdEFuaW1hdGlvbnM6IHtcbiAgcmVhZG9ubHkgdHJhbnNmb3JtUGFuZWxXcmFwOiBBbmltYXRpb25UcmlnZ2VyTWV0YWRhdGE7XG4gIHJlYWRvbmx5IHRyYW5zZm9ybVBhbmVsOiBBbmltYXRpb25UcmlnZ2VyTWV0YWRhdGE7XG59ID0ge1xuICAvKipcbiAgICogVGhpcyBhbmltYXRpb24gZW5zdXJlcyB0aGUgc2VsZWN0J3Mgb3ZlcmxheSBwYW5lbCBhbmltYXRpb24gKHRyYW5zZm9ybVBhbmVsKSBpcyBjYWxsZWQgd2hlblxuICAgKiBjbG9zaW5nIHRoZSBzZWxlY3QuXG4gICAqIFRoaXMgaXMgbmVlZGVkIGR1ZSB0byBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyL2lzc3Vlcy8yMzMwMlxuICAgKi9cbiAgdHJhbnNmb3JtUGFuZWxXcmFwOiB0cmlnZ2VyKCd0cmFuc2Zvcm1QYW5lbFdyYXAnLCBbXG4gICAgICB0cmFuc2l0aW9uKCcqID0+IHZvaWQnLCBxdWVyeSgnQHRyYW5zZm9ybVBhbmVsJywgW2FuaW1hdGVDaGlsZCgpXSxcbiAgICAgICAgICB7b3B0aW9uYWw6IHRydWV9KSlcbiAgXSksXG5cbiAgLyoqXG4gICAqIFRoaXMgYW5pbWF0aW9uIHRyYW5zZm9ybXMgdGhlIHNlbGVjdCdzIG92ZXJsYXkgcGFuZWwgb24gYW5kIG9mZiB0aGUgcGFnZS5cbiAgICpcbiAgICogV2hlbiB0aGUgcGFuZWwgaXMgYXR0YWNoZWQgdG8gdGhlIERPTSwgaXQgZXhwYW5kcyBpdHMgd2lkdGggYnkgdGhlIGFtb3VudCBvZiBwYWRkaW5nLCBzY2FsZXMgaXRcbiAgICogdXAgdG8gMTAwJSBvbiB0aGUgWSBheGlzLCBmYWRlcyBpbiBpdHMgYm9yZGVyLCBhbmQgdHJhbnNsYXRlcyBzbGlnaHRseSB1cCBhbmQgdG8gdGhlXG4gICAqIHNpZGUgdG8gZW5zdXJlIHRoZSBvcHRpb24gdGV4dCBjb3JyZWN0bHkgb3ZlcmxhcHMgdGhlIHRyaWdnZXIgdGV4dC5cbiAgICpcbiAgICogV2hlbiB0aGUgcGFuZWwgaXMgcmVtb3ZlZCBmcm9tIHRoZSBET00sIGl0IHNpbXBseSBmYWRlcyBvdXQgbGluZWFybHkuXG4gICAqL1xuICB0cmFuc2Zvcm1QYW5lbDogdHJpZ2dlcigndHJhbnNmb3JtUGFuZWwnLCBbXG4gICAgc3RhdGUoJ3ZvaWQnLCBzdHlsZSh7XG4gICAgICB0cmFuc2Zvcm06ICdzY2FsZVkoMC44KScsXG4gICAgICBtaW5XaWR0aDogJzEwMCUnLFxuICAgICAgb3BhY2l0eTogMFxuICAgIH0pKSxcbiAgICBzdGF0ZSgnc2hvd2luZycsIHN0eWxlKHtcbiAgICAgIG9wYWNpdHk6IDEsXG4gICAgICBtaW5XaWR0aDogJ2NhbGMoMTAwJSArIDMycHgpJywgLy8gMzJweCA9IDIgKiAxNnB4IHBhZGRpbmdcbiAgICAgIHRyYW5zZm9ybTogJ3NjYWxlWSgxKSdcbiAgICB9KSksXG4gICAgc3RhdGUoJ3Nob3dpbmctbXVsdGlwbGUnLCBzdHlsZSh7XG4gICAgICBvcGFjaXR5OiAxLFxuICAgICAgbWluV2lkdGg6ICdjYWxjKDEwMCUgKyA2NHB4KScsIC8vIDY0cHggPSA0OHB4IHBhZGRpbmcgb24gdGhlIGxlZnQgKyAxNnB4IHBhZGRpbmcgb24gdGhlIHJpZ2h0XG4gICAgICB0cmFuc2Zvcm06ICdzY2FsZVkoMSknXG4gICAgfSkpLFxuICAgIHRyYW5zaXRpb24oJ3ZvaWQgPT4gKicsIGFuaW1hdGUoJzEyMG1zIGN1YmljLWJlemllcigwLCAwLCAwLjIsIDEpJykpLFxuICAgIHRyYW5zaXRpb24oJyogPT4gdm9pZCcsIGFuaW1hdGUoJzEwMG1zIDI1bXMgbGluZWFyJywgc3R5bGUoe29wYWNpdHk6IDB9KSkpXG4gIF0pXG59O1xuIl19