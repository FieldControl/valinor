/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { animate, keyframes, state, style, transition, trigger, } from '@angular/animations';
/**
 * Animations used by MatTooltip.
 * @docs-private
 */
export const matTooltipAnimations = {
    /** Animation that transitions a tooltip in and out. */
    tooltipState: trigger('state', [
        state('initial, void, hidden', style({ opacity: 0, transform: 'scale(0)' })),
        state('visible', style({ transform: 'scale(1)' })),
        transition('* => visible', animate('200ms cubic-bezier(0, 0, 0.2, 1)', keyframes([
            style({ opacity: 0, transform: 'scale(0)', offset: 0 }),
            style({ opacity: 0.5, transform: 'scale(0.99)', offset: 0.5 }),
            style({ opacity: 1, transform: 'scale(1)', offset: 1 })
        ]))),
        transition('* => hidden', animate('100ms cubic-bezier(0, 0, 0.2, 1)', style({ opacity: 0 }))),
    ])
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9vbHRpcC1hbmltYXRpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL3Rvb2x0aXAvdG9vbHRpcC1hbmltYXRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUNILE9BQU8sRUFDTCxPQUFPLEVBRVAsU0FBUyxFQUNULEtBQUssRUFDTCxLQUFLLEVBQ0wsVUFBVSxFQUNWLE9BQU8sR0FDUixNQUFNLHFCQUFxQixDQUFDO0FBRTdCOzs7R0FHRztBQUNILE1BQU0sQ0FBQyxNQUFNLG9CQUFvQixHQUU3QjtJQUNGLHVEQUF1RDtJQUN2RCxZQUFZLEVBQUUsT0FBTyxDQUFDLE9BQU8sRUFBRTtRQUM3QixLQUFLLENBQUMsdUJBQXVCLEVBQUUsS0FBSyxDQUFDLEVBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFDLENBQUMsQ0FBQztRQUMxRSxLQUFLLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxFQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUMsQ0FBQyxDQUFDO1FBQ2hELFVBQVUsQ0FBQyxjQUFjLEVBQUUsT0FBTyxDQUFDLGtDQUFrQyxFQUFFLFNBQVMsQ0FBQztZQUMvRSxLQUFLLENBQUMsRUFBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBQyxDQUFDO1lBQ3JELEtBQUssQ0FBQyxFQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLGFBQWEsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFDLENBQUM7WUFDNUQsS0FBSyxDQUFDLEVBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUMsQ0FBQztTQUN0RCxDQUFDLENBQUMsQ0FBQztRQUNKLFVBQVUsQ0FBQyxhQUFhLEVBQUUsT0FBTyxDQUFDLGtDQUFrQyxFQUFFLEtBQUssQ0FBQyxFQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUM7S0FDNUYsQ0FBQztDQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7XG4gIGFuaW1hdGUsXG4gIEFuaW1hdGlvblRyaWdnZXJNZXRhZGF0YSxcbiAga2V5ZnJhbWVzLFxuICBzdGF0ZSxcbiAgc3R5bGUsXG4gIHRyYW5zaXRpb24sXG4gIHRyaWdnZXIsXG59IGZyb20gJ0Bhbmd1bGFyL2FuaW1hdGlvbnMnO1xuXG4vKipcbiAqIEFuaW1hdGlvbnMgdXNlZCBieSBNYXRUb29sdGlwLlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5leHBvcnQgY29uc3QgbWF0VG9vbHRpcEFuaW1hdGlvbnM6IHtcbiAgcmVhZG9ubHkgdG9vbHRpcFN0YXRlOiBBbmltYXRpb25UcmlnZ2VyTWV0YWRhdGE7XG59ID0ge1xuICAvKiogQW5pbWF0aW9uIHRoYXQgdHJhbnNpdGlvbnMgYSB0b29sdGlwIGluIGFuZCBvdXQuICovXG4gIHRvb2x0aXBTdGF0ZTogdHJpZ2dlcignc3RhdGUnLCBbXG4gICAgc3RhdGUoJ2luaXRpYWwsIHZvaWQsIGhpZGRlbicsIHN0eWxlKHtvcGFjaXR5OiAwLCB0cmFuc2Zvcm06ICdzY2FsZSgwKSd9KSksXG4gICAgc3RhdGUoJ3Zpc2libGUnLCBzdHlsZSh7dHJhbnNmb3JtOiAnc2NhbGUoMSknfSkpLFxuICAgIHRyYW5zaXRpb24oJyogPT4gdmlzaWJsZScsIGFuaW1hdGUoJzIwMG1zIGN1YmljLWJlemllcigwLCAwLCAwLjIsIDEpJywga2V5ZnJhbWVzKFtcbiAgICAgIHN0eWxlKHtvcGFjaXR5OiAwLCB0cmFuc2Zvcm06ICdzY2FsZSgwKScsIG9mZnNldDogMH0pLFxuICAgICAgc3R5bGUoe29wYWNpdHk6IDAuNSwgdHJhbnNmb3JtOiAnc2NhbGUoMC45OSknLCBvZmZzZXQ6IDAuNX0pLFxuICAgICAgc3R5bGUoe29wYWNpdHk6IDEsIHRyYW5zZm9ybTogJ3NjYWxlKDEpJywgb2Zmc2V0OiAxfSlcbiAgICBdKSkpLFxuICAgIHRyYW5zaXRpb24oJyogPT4gaGlkZGVuJywgYW5pbWF0ZSgnMTAwbXMgY3ViaWMtYmV6aWVyKDAsIDAsIDAuMiwgMSknLCBzdHlsZSh7b3BhY2l0eTogMH0pKSksXG4gIF0pXG59O1xuIl19