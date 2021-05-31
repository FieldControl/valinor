/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { animate, state, style, transition, trigger, } from '@angular/animations';
/**
 * Animations used by MatDialog.
 * @docs-private
 */
export const matDialogAnimations = {
    /** Animation that is applied on the dialog container by default. */
    dialogContainer: trigger('dialogContainer', [
        // Note: The `enter` animation transitions to `transform: none`, because for some reason
        // specifying the transform explicitly, causes IE both to blur the dialog content and
        // decimate the animation performance. Leaving it as `none` solves both issues.
        state('void, exit', style({ opacity: 0, transform: 'scale(0.7)' })),
        state('enter', style({ transform: 'none' })),
        transition('* => enter', animate('150ms cubic-bezier(0, 0, 0.2, 1)', style({ transform: 'none', opacity: 1 }))),
        transition('* => void, * => exit', animate('75ms cubic-bezier(0.4, 0.0, 0.2, 1)', style({ opacity: 0 }))),
    ])
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLWFuaW1hdGlvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvZGlhbG9nL2RpYWxvZy1hbmltYXRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUNILE9BQU8sRUFDTCxPQUFPLEVBQ1AsS0FBSyxFQUNMLEtBQUssRUFDTCxVQUFVLEVBQ1YsT0FBTyxHQUVSLE1BQU0scUJBQXFCLENBQUM7QUFFN0I7OztHQUdHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sbUJBQW1CLEdBRTVCO0lBQ0Ysb0VBQW9FO0lBQ3BFLGVBQWUsRUFBRSxPQUFPLENBQUMsaUJBQWlCLEVBQUU7UUFDMUMsd0ZBQXdGO1FBQ3hGLHFGQUFxRjtRQUNyRiwrRUFBK0U7UUFDL0UsS0FBSyxDQUFDLFlBQVksRUFBRSxLQUFLLENBQUMsRUFBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUMsQ0FBQyxDQUFDO1FBQ2pFLEtBQUssQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLEVBQUMsU0FBUyxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7UUFDMUMsVUFBVSxDQUFDLFlBQVksRUFBRSxPQUFPLENBQUMsa0NBQWtDLEVBQy9ELEtBQUssQ0FBQyxFQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQztRQUM1QyxVQUFVLENBQUMsc0JBQXNCLEVBQzdCLE9BQU8sQ0FBQyxxQ0FBcUMsRUFBRSxLQUFLLENBQUMsRUFBQyxPQUFPLEVBQUUsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ3pFLENBQUM7Q0FDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge1xuICBhbmltYXRlLFxuICBzdGF0ZSxcbiAgc3R5bGUsXG4gIHRyYW5zaXRpb24sXG4gIHRyaWdnZXIsXG4gIEFuaW1hdGlvblRyaWdnZXJNZXRhZGF0YSxcbn0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG5cbi8qKlxuICogQW5pbWF0aW9ucyB1c2VkIGJ5IE1hdERpYWxvZy5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuZXhwb3J0IGNvbnN0IG1hdERpYWxvZ0FuaW1hdGlvbnM6IHtcbiAgcmVhZG9ubHkgZGlhbG9nQ29udGFpbmVyOiBBbmltYXRpb25UcmlnZ2VyTWV0YWRhdGE7XG59ID0ge1xuICAvKiogQW5pbWF0aW9uIHRoYXQgaXMgYXBwbGllZCBvbiB0aGUgZGlhbG9nIGNvbnRhaW5lciBieSBkZWZhdWx0LiAqL1xuICBkaWFsb2dDb250YWluZXI6IHRyaWdnZXIoJ2RpYWxvZ0NvbnRhaW5lcicsIFtcbiAgICAvLyBOb3RlOiBUaGUgYGVudGVyYCBhbmltYXRpb24gdHJhbnNpdGlvbnMgdG8gYHRyYW5zZm9ybTogbm9uZWAsIGJlY2F1c2UgZm9yIHNvbWUgcmVhc29uXG4gICAgLy8gc3BlY2lmeWluZyB0aGUgdHJhbnNmb3JtIGV4cGxpY2l0bHksIGNhdXNlcyBJRSBib3RoIHRvIGJsdXIgdGhlIGRpYWxvZyBjb250ZW50IGFuZFxuICAgIC8vIGRlY2ltYXRlIHRoZSBhbmltYXRpb24gcGVyZm9ybWFuY2UuIExlYXZpbmcgaXQgYXMgYG5vbmVgIHNvbHZlcyBib3RoIGlzc3Vlcy5cbiAgICBzdGF0ZSgndm9pZCwgZXhpdCcsIHN0eWxlKHtvcGFjaXR5OiAwLCB0cmFuc2Zvcm06ICdzY2FsZSgwLjcpJ30pKSxcbiAgICBzdGF0ZSgnZW50ZXInLCBzdHlsZSh7dHJhbnNmb3JtOiAnbm9uZSd9KSksXG4gICAgdHJhbnNpdGlvbignKiA9PiBlbnRlcicsIGFuaW1hdGUoJzE1MG1zIGN1YmljLWJlemllcigwLCAwLCAwLjIsIDEpJyxcbiAgICAgICAgc3R5bGUoe3RyYW5zZm9ybTogJ25vbmUnLCBvcGFjaXR5OiAxfSkpKSxcbiAgICB0cmFuc2l0aW9uKCcqID0+IHZvaWQsICogPT4gZXhpdCcsXG4gICAgICAgIGFuaW1hdGUoJzc1bXMgY3ViaWMtYmV6aWVyKDAuNCwgMC4wLCAwLjIsIDEpJywgc3R5bGUoe29wYWNpdHk6IDB9KSkpLFxuICBdKVxufTtcbiJdfQ==