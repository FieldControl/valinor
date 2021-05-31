/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ChangeDetectionStrategy, Component, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from './snack-bar-config';
import { MatSnackBarRef } from './snack-bar-ref';
/**
 * A component used to open as the default snack bar, matching material spec.
 * This should only be used internally by the snack bar service.
 */
export class SimpleSnackBar {
    constructor(snackBarRef, data) {
        this.snackBarRef = snackBarRef;
        this.data = data;
    }
    /** Performs the action on the snack bar. */
    action() {
        this.snackBarRef.dismissWithAction();
    }
    /** If the action button should be shown. */
    get hasAction() {
        return !!this.data.action;
    }
}
SimpleSnackBar.decorators = [
    { type: Component, args: [{
                selector: 'simple-snack-bar',
                template: "<span>{{data.message}}</span>\n<div class=\"mat-simple-snackbar-action\"  *ngIf=\"hasAction\">\n  <button mat-button (click)=\"action()\">{{data.action}}</button>\n</div>\n",
                encapsulation: ViewEncapsulation.None,
                changeDetection: ChangeDetectionStrategy.OnPush,
                host: {
                    'class': 'mat-simple-snackbar',
                },
                styles: [".mat-simple-snackbar{display:flex;justify-content:space-between;align-items:center;line-height:20px;opacity:1}.mat-simple-snackbar-action{flex-shrink:0;margin:-8px -8px -8px 8px}.mat-simple-snackbar-action button{max-height:36px;min-width:0}[dir=rtl] .mat-simple-snackbar-action{margin-left:-8px;margin-right:8px}\n"]
            },] }
];
SimpleSnackBar.ctorParameters = () => [
    { type: MatSnackBarRef },
    { type: undefined, decorators: [{ type: Inject, args: [MAT_SNACK_BAR_DATA,] }] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2ltcGxlLXNuYWNrLWJhci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9zbmFjay1iYXIvc2ltcGxlLXNuYWNrLWJhci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsdUJBQXVCLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxpQkFBaUIsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUM1RixPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUN0RCxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFhL0M7OztHQUdHO0FBV0gsTUFBTSxPQUFPLGNBQWM7SUFJekIsWUFDUyxXQUEyQyxFQUN0QixJQUFTO1FBRDlCLGdCQUFXLEdBQVgsV0FBVyxDQUFnQztRQUVsRCxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztJQUNuQixDQUFDO0lBRUQsNENBQTRDO0lBQzVDLE1BQU07UUFDSixJQUFJLENBQUMsV0FBVyxDQUFDLGlCQUFpQixFQUFFLENBQUM7SUFDdkMsQ0FBQztJQUVELDRDQUE0QztJQUM1QyxJQUFJLFNBQVM7UUFDWCxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUM1QixDQUFDOzs7WUE1QkYsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSxrQkFBa0I7Z0JBQzVCLHdMQUFvQztnQkFFcEMsYUFBYSxFQUFFLGlCQUFpQixDQUFDLElBQUk7Z0JBQ3JDLGVBQWUsRUFBRSx1QkFBdUIsQ0FBQyxNQUFNO2dCQUMvQyxJQUFJLEVBQUU7b0JBQ0osT0FBTyxFQUFFLHFCQUFxQjtpQkFDL0I7O2FBQ0Y7OztZQTFCTyxjQUFjOzRDQWlDakIsTUFBTSxTQUFDLGtCQUFrQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NoYW5nZURldGVjdGlvblN0cmF0ZWd5LCBDb21wb25lbnQsIEluamVjdCwgVmlld0VuY2Fwc3VsYXRpb259IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtNQVRfU05BQ0tfQkFSX0RBVEF9IGZyb20gJy4vc25hY2stYmFyLWNvbmZpZyc7XG5pbXBvcnQge01hdFNuYWNrQmFyUmVmfSBmcm9tICcuL3NuYWNrLWJhci1yZWYnO1xuXG5cbi8qKlxuICogSW50ZXJmYWNlIGZvciBhIHNpbXBsZSBzbmFjayBiYXIgY29tcG9uZW50IHRoYXQgaGFzIGEgbWVzc2FnZSBhbmQgYSBzaW5nbGUgYWN0aW9uLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFRleHRPbmx5U25hY2tCYXIge1xuICBkYXRhOiB7bWVzc2FnZTogc3RyaW5nLCBhY3Rpb246IHN0cmluZ307XG4gIHNuYWNrQmFyUmVmOiBNYXRTbmFja0JhclJlZjxUZXh0T25seVNuYWNrQmFyPjtcbiAgYWN0aW9uOiAoKSA9PiB2b2lkO1xuICBoYXNBY3Rpb246IGJvb2xlYW47XG59XG5cbi8qKlxuICogQSBjb21wb25lbnQgdXNlZCB0byBvcGVuIGFzIHRoZSBkZWZhdWx0IHNuYWNrIGJhciwgbWF0Y2hpbmcgbWF0ZXJpYWwgc3BlYy5cbiAqIFRoaXMgc2hvdWxkIG9ubHkgYmUgdXNlZCBpbnRlcm5hbGx5IGJ5IHRoZSBzbmFjayBiYXIgc2VydmljZS5cbiAqL1xuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnc2ltcGxlLXNuYWNrLWJhcicsXG4gIHRlbXBsYXRlVXJsOiAnc2ltcGxlLXNuYWNrLWJhci5odG1sJyxcbiAgc3R5bGVVcmxzOiBbJ3NpbXBsZS1zbmFjay1iYXIuY3NzJ10sXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxuICBob3N0OiB7XG4gICAgJ2NsYXNzJzogJ21hdC1zaW1wbGUtc25hY2tiYXInLFxuICB9XG59KVxuZXhwb3J0IGNsYXNzIFNpbXBsZVNuYWNrQmFyIGltcGxlbWVudHMgVGV4dE9ubHlTbmFja0JhciB7XG4gIC8qKiBEYXRhIHRoYXQgd2FzIGluamVjdGVkIGludG8gdGhlIHNuYWNrIGJhci4gKi9cbiAgZGF0YToge21lc3NhZ2U6IHN0cmluZywgYWN0aW9uOiBzdHJpbmd9O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBzbmFja0JhclJlZjogTWF0U25hY2tCYXJSZWY8U2ltcGxlU25hY2tCYXI+LFxuICAgIEBJbmplY3QoTUFUX1NOQUNLX0JBUl9EQVRBKSBkYXRhOiBhbnkpIHtcbiAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICB9XG5cbiAgLyoqIFBlcmZvcm1zIHRoZSBhY3Rpb24gb24gdGhlIHNuYWNrIGJhci4gKi9cbiAgYWN0aW9uKCk6IHZvaWQge1xuICAgIHRoaXMuc25hY2tCYXJSZWYuZGlzbWlzc1dpdGhBY3Rpb24oKTtcbiAgfVxuXG4gIC8qKiBJZiB0aGUgYWN0aW9uIGJ1dHRvbiBzaG91bGQgYmUgc2hvd24uICovXG4gIGdldCBoYXNBY3Rpb24oKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICEhdGhpcy5kYXRhLmFjdGlvbjtcbiAgfVxufVxuIl19