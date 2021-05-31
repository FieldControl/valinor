/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { animate, state, style, transition, trigger, keyframes, } from '@angular/animations';
/**
 * Animations used by the Material datepicker.
 * @docs-private
 */
export const matDatepickerAnimations = {
    /** Transforms the height of the datepicker's calendar. */
    transformPanel: trigger('transformPanel', [
        transition('void => enter-dropdown', animate('120ms cubic-bezier(0, 0, 0.2, 1)', keyframes([
            style({ opacity: 0, transform: 'scale(1, 0.8)' }),
            style({ opacity: 1, transform: 'scale(1, 1)' })
        ]))),
        transition('void => enter-dialog', animate('150ms cubic-bezier(0, 0, 0.2, 1)', keyframes([
            style({ opacity: 0, transform: 'scale(0.7)' }),
            style({ transform: 'none', opacity: 1 })
        ]))),
        transition('* => void', animate('100ms linear', style({ opacity: 0 })))
    ]),
    /** Fades in the content of the calendar. */
    fadeInCalendar: trigger('fadeInCalendar', [
        state('void', style({ opacity: 0 })),
        state('enter', style({ opacity: 1 })),
        // TODO(crisbeto): this animation should be removed since it isn't quite on spec, but we
        // need to keep it until #12440 gets in, otherwise the exit animation will look glitchy.
        transition('void => *', animate('120ms 100ms cubic-bezier(0.55, 0, 0.55, 0.2)'))
    ])
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZXBpY2tlci1hbmltYXRpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL2RhdGVwaWNrZXIvZGF0ZXBpY2tlci1hbmltYXRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUNILE9BQU8sRUFDTCxPQUFPLEVBQ1AsS0FBSyxFQUNMLEtBQUssRUFDTCxVQUFVLEVBQ1YsT0FBTyxFQUNQLFNBQVMsR0FFVixNQUFNLHFCQUFxQixDQUFDO0FBRTdCOzs7R0FHRztBQUNILE1BQU0sQ0FBQyxNQUFNLHVCQUF1QixHQUdoQztJQUNGLDBEQUEwRDtJQUMxRCxjQUFjLEVBQUUsT0FBTyxDQUFDLGdCQUFnQixFQUFFO1FBQ3hDLFVBQVUsQ0FBQyx3QkFBd0IsRUFBRSxPQUFPLENBQUMsa0NBQWtDLEVBQUUsU0FBUyxDQUFDO1lBQ3pGLEtBQUssQ0FBQyxFQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLGVBQWUsRUFBQyxDQUFDO1lBQy9DLEtBQUssQ0FBQyxFQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLGFBQWEsRUFBQyxDQUFDO1NBQzlDLENBQUMsQ0FBQyxDQUFDO1FBQ0osVUFBVSxDQUFDLHNCQUFzQixFQUFFLE9BQU8sQ0FBQyxrQ0FBa0MsRUFBRSxTQUFTLENBQUM7WUFDdkYsS0FBSyxDQUFDLEVBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFDLENBQUM7WUFDNUMsS0FBSyxDQUFDLEVBQUMsU0FBUyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFDLENBQUM7U0FDdkMsQ0FBQyxDQUFDLENBQUM7UUFDSixVQUFVLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxjQUFjLEVBQUUsS0FBSyxDQUFDLEVBQUMsT0FBTyxFQUFFLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQztLQUN0RSxDQUFDO0lBRUYsNENBQTRDO0lBQzVDLGNBQWMsRUFBRSxPQUFPLENBQUMsZ0JBQWdCLEVBQUU7UUFDeEMsS0FBSyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsRUFBQyxPQUFPLEVBQUUsQ0FBQyxFQUFDLENBQUMsQ0FBQztRQUNsQyxLQUFLLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxFQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDO1FBRW5DLHdGQUF3RjtRQUN4Rix3RkFBd0Y7UUFDeEYsVUFBVSxDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsOENBQThDLENBQUMsQ0FBQztLQUNqRixDQUFDO0NBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtcbiAgYW5pbWF0ZSxcbiAgc3RhdGUsXG4gIHN0eWxlLFxuICB0cmFuc2l0aW9uLFxuICB0cmlnZ2VyLFxuICBrZXlmcmFtZXMsXG4gIEFuaW1hdGlvblRyaWdnZXJNZXRhZGF0YSxcbn0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG5cbi8qKlxuICogQW5pbWF0aW9ucyB1c2VkIGJ5IHRoZSBNYXRlcmlhbCBkYXRlcGlja2VyLlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5leHBvcnQgY29uc3QgbWF0RGF0ZXBpY2tlckFuaW1hdGlvbnM6IHtcbiAgcmVhZG9ubHkgdHJhbnNmb3JtUGFuZWw6IEFuaW1hdGlvblRyaWdnZXJNZXRhZGF0YTtcbiAgcmVhZG9ubHkgZmFkZUluQ2FsZW5kYXI6IEFuaW1hdGlvblRyaWdnZXJNZXRhZGF0YTtcbn0gPSB7XG4gIC8qKiBUcmFuc2Zvcm1zIHRoZSBoZWlnaHQgb2YgdGhlIGRhdGVwaWNrZXIncyBjYWxlbmRhci4gKi9cbiAgdHJhbnNmb3JtUGFuZWw6IHRyaWdnZXIoJ3RyYW5zZm9ybVBhbmVsJywgW1xuICAgIHRyYW5zaXRpb24oJ3ZvaWQgPT4gZW50ZXItZHJvcGRvd24nLCBhbmltYXRlKCcxMjBtcyBjdWJpYy1iZXppZXIoMCwgMCwgMC4yLCAxKScsIGtleWZyYW1lcyhbXG4gICAgICBzdHlsZSh7b3BhY2l0eTogMCwgdHJhbnNmb3JtOiAnc2NhbGUoMSwgMC44KSd9KSxcbiAgICAgIHN0eWxlKHtvcGFjaXR5OiAxLCB0cmFuc2Zvcm06ICdzY2FsZSgxLCAxKSd9KVxuICAgIF0pKSksXG4gICAgdHJhbnNpdGlvbigndm9pZCA9PiBlbnRlci1kaWFsb2cnLCBhbmltYXRlKCcxNTBtcyBjdWJpYy1iZXppZXIoMCwgMCwgMC4yLCAxKScsIGtleWZyYW1lcyhbXG4gICAgICBzdHlsZSh7b3BhY2l0eTogMCwgdHJhbnNmb3JtOiAnc2NhbGUoMC43KSd9KSxcbiAgICAgIHN0eWxlKHt0cmFuc2Zvcm06ICdub25lJywgb3BhY2l0eTogMX0pXG4gICAgXSkpKSxcbiAgICB0cmFuc2l0aW9uKCcqID0+IHZvaWQnLCBhbmltYXRlKCcxMDBtcyBsaW5lYXInLCBzdHlsZSh7b3BhY2l0eTogMH0pKSlcbiAgXSksXG5cbiAgLyoqIEZhZGVzIGluIHRoZSBjb250ZW50IG9mIHRoZSBjYWxlbmRhci4gKi9cbiAgZmFkZUluQ2FsZW5kYXI6IHRyaWdnZXIoJ2ZhZGVJbkNhbGVuZGFyJywgW1xuICAgIHN0YXRlKCd2b2lkJywgc3R5bGUoe29wYWNpdHk6IDB9KSksXG4gICAgc3RhdGUoJ2VudGVyJywgc3R5bGUoe29wYWNpdHk6IDF9KSksXG5cbiAgICAvLyBUT0RPKGNyaXNiZXRvKTogdGhpcyBhbmltYXRpb24gc2hvdWxkIGJlIHJlbW92ZWQgc2luY2UgaXQgaXNuJ3QgcXVpdGUgb24gc3BlYywgYnV0IHdlXG4gICAgLy8gbmVlZCB0byBrZWVwIGl0IHVudGlsICMxMjQ0MCBnZXRzIGluLCBvdGhlcndpc2UgdGhlIGV4aXQgYW5pbWF0aW9uIHdpbGwgbG9vayBnbGl0Y2h5LlxuICAgIHRyYW5zaXRpb24oJ3ZvaWQgPT4gKicsIGFuaW1hdGUoJzEyMG1zIDEwMG1zIGN1YmljLWJlemllcigwLjU1LCAwLCAwLjU1LCAwLjIpJykpXG4gIF0pXG59O1xuIl19