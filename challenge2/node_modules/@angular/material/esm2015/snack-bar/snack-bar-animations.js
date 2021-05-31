/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { animate, state, style, transition, trigger, } from '@angular/animations';
/**
 * Animations used by the Material snack bar.
 * @docs-private
 */
export const matSnackBarAnimations = {
    /** Animation that shows and hides a snack bar. */
    snackBarState: trigger('state', [
        state('void, hidden', style({
            transform: 'scale(0.8)',
            opacity: 0,
        })),
        state('visible', style({
            transform: 'scale(1)',
            opacity: 1,
        })),
        transition('* => visible', animate('150ms cubic-bezier(0, 0, 0.2, 1)')),
        transition('* => void, * => hidden', animate('75ms cubic-bezier(0.4, 0.0, 1, 1)', style({
            opacity: 0
        }))),
    ])
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic25hY2stYmFyLWFuaW1hdGlvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvc25hY2stYmFyL3NuYWNrLWJhci1hbmltYXRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUNILE9BQU8sRUFDTCxPQUFPLEVBQ1AsS0FBSyxFQUNMLEtBQUssRUFDTCxVQUFVLEVBQ1YsT0FBTyxHQUVSLE1BQU0scUJBQXFCLENBQUM7QUFFN0I7OztHQUdHO0FBQ0gsTUFBTSxDQUFDLE1BQU0scUJBQXFCLEdBRTlCO0lBQ0Ysa0RBQWtEO0lBQ2xELGFBQWEsRUFBRSxPQUFPLENBQUMsT0FBTyxFQUFFO1FBQzlCLEtBQUssQ0FBQyxjQUFjLEVBQUUsS0FBSyxDQUFDO1lBQzFCLFNBQVMsRUFBRSxZQUFZO1lBQ3ZCLE9BQU8sRUFBRSxDQUFDO1NBQ1gsQ0FBQyxDQUFDO1FBQ0gsS0FBSyxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUM7WUFDckIsU0FBUyxFQUFFLFVBQVU7WUFDckIsT0FBTyxFQUFFLENBQUM7U0FDWCxDQUFDLENBQUM7UUFDSCxVQUFVLENBQUMsY0FBYyxFQUFFLE9BQU8sQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDO1FBQ3ZFLFVBQVUsQ0FBQyx3QkFBd0IsRUFBRSxPQUFPLENBQUMsbUNBQW1DLEVBQUUsS0FBSyxDQUFDO1lBQ3RGLE9BQU8sRUFBRSxDQUFDO1NBQ1gsQ0FBQyxDQUFDLENBQUM7S0FDTCxDQUFDO0NBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtcbiAgYW5pbWF0ZSxcbiAgc3RhdGUsXG4gIHN0eWxlLFxuICB0cmFuc2l0aW9uLFxuICB0cmlnZ2VyLFxuICBBbmltYXRpb25UcmlnZ2VyTWV0YWRhdGEsXG59IGZyb20gJ0Bhbmd1bGFyL2FuaW1hdGlvbnMnO1xuXG4vKipcbiAqIEFuaW1hdGlvbnMgdXNlZCBieSB0aGUgTWF0ZXJpYWwgc25hY2sgYmFyLlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5leHBvcnQgY29uc3QgbWF0U25hY2tCYXJBbmltYXRpb25zOiB7XG4gIHJlYWRvbmx5IHNuYWNrQmFyU3RhdGU6IEFuaW1hdGlvblRyaWdnZXJNZXRhZGF0YTtcbn0gPSB7XG4gIC8qKiBBbmltYXRpb24gdGhhdCBzaG93cyBhbmQgaGlkZXMgYSBzbmFjayBiYXIuICovXG4gIHNuYWNrQmFyU3RhdGU6IHRyaWdnZXIoJ3N0YXRlJywgW1xuICAgIHN0YXRlKCd2b2lkLCBoaWRkZW4nLCBzdHlsZSh7XG4gICAgICB0cmFuc2Zvcm06ICdzY2FsZSgwLjgpJyxcbiAgICAgIG9wYWNpdHk6IDAsXG4gICAgfSkpLFxuICAgIHN0YXRlKCd2aXNpYmxlJywgc3R5bGUoe1xuICAgICAgdHJhbnNmb3JtOiAnc2NhbGUoMSknLFxuICAgICAgb3BhY2l0eTogMSxcbiAgICB9KSksXG4gICAgdHJhbnNpdGlvbignKiA9PiB2aXNpYmxlJywgYW5pbWF0ZSgnMTUwbXMgY3ViaWMtYmV6aWVyKDAsIDAsIDAuMiwgMSknKSksXG4gICAgdHJhbnNpdGlvbignKiA9PiB2b2lkLCAqID0+IGhpZGRlbicsIGFuaW1hdGUoJzc1bXMgY3ViaWMtYmV6aWVyKDAuNCwgMC4wLCAxLCAxKScsIHN0eWxlKHtcbiAgICAgIG9wYWNpdHk6IDBcbiAgICB9KSkpLFxuICBdKVxufTtcbiJdfQ==