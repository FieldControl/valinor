/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ChangeDetectionStrategy, Component, Directive, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { TemplatePortal } from '@angular/cdk/portal';
import { MatDatepickerBase } from './datepicker-base';
/** Button that will close the datepicker and assign the current selection to the data model. */
export class MatDatepickerApply {
    constructor(_datepicker) {
        this._datepicker = _datepicker;
    }
    _applySelection() {
        this._datepicker._applyPendingSelection();
        this._datepicker.close();
    }
}
MatDatepickerApply.decorators = [
    { type: Directive, args: [{
                selector: '[matDatepickerApply], [matDateRangePickerApply]',
                host: { '(click)': '_applySelection()' }
            },] }
];
MatDatepickerApply.ctorParameters = () => [
    { type: MatDatepickerBase }
];
/** Button that will close the datepicker and discard the current selection. */
export class MatDatepickerCancel {
    constructor(_datepicker) {
        this._datepicker = _datepicker;
    }
}
MatDatepickerCancel.decorators = [
    { type: Directive, args: [{
                selector: '[matDatepickerCancel], [matDateRangePickerCancel]',
                host: { '(click)': '_datepicker.close()' }
            },] }
];
MatDatepickerCancel.ctorParameters = () => [
    { type: MatDatepickerBase }
];
/**
 * Container that can be used to project a row of action buttons
 * to the bottom of a datepicker or date range picker.
 */
export class MatDatepickerActions {
    constructor(_datepicker, _viewContainerRef) {
        this._datepicker = _datepicker;
        this._viewContainerRef = _viewContainerRef;
    }
    ngAfterViewInit() {
        this._portal = new TemplatePortal(this._template, this._viewContainerRef);
        this._datepicker.registerActions(this._portal);
    }
    ngOnDestroy() {
        var _a;
        this._datepicker.removeActions(this._portal);
        // Needs to be null checked since we initialize it in `ngAfterViewInit`.
        if (this._portal && this._portal.isAttached) {
            (_a = this._portal) === null || _a === void 0 ? void 0 : _a.detach();
        }
    }
}
MatDatepickerActions.decorators = [
    { type: Component, args: [{
                selector: 'mat-datepicker-actions, mat-date-range-picker-actions',
                template: `
    <ng-template>
      <div class="mat-datepicker-actions">
        <ng-content></ng-content>
      </div>
    </ng-template>
  `,
                changeDetection: ChangeDetectionStrategy.OnPush,
                encapsulation: ViewEncapsulation.None,
                styles: [".mat-datepicker-actions{display:flex;justify-content:flex-end;align-items:center;padding:0 8px 8px 8px}.mat-datepicker-actions .mat-button-base+.mat-button-base{margin-left:8px}[dir=rtl] .mat-datepicker-actions .mat-button-base+.mat-button-base{margin-left:0;margin-right:8px}\n"]
            },] }
];
MatDatepickerActions.ctorParameters = () => [
    { type: MatDatepickerBase },
    { type: ViewContainerRef }
];
MatDatepickerActions.propDecorators = {
    _template: [{ type: ViewChild, args: [TemplateRef,] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZXBpY2tlci1hY3Rpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL2RhdGVwaWNrZXIvZGF0ZXBpY2tlci1hY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFFTCx1QkFBdUIsRUFDdkIsU0FBUyxFQUNULFNBQVMsRUFFVCxXQUFXLEVBQ1gsU0FBUyxFQUNULGdCQUFnQixFQUNoQixpQkFBaUIsRUFDbEIsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ25ELE9BQU8sRUFBQyxpQkFBaUIsRUFBdUIsTUFBTSxtQkFBbUIsQ0FBQztBQUcxRSxnR0FBZ0c7QUFLaEcsTUFBTSxPQUFPLGtCQUFrQjtJQUM3QixZQUFvQixXQUFzRTtRQUF0RSxnQkFBVyxHQUFYLFdBQVcsQ0FBMkQ7SUFBRyxDQUFDO0lBRTlGLGVBQWU7UUFDYixJQUFJLENBQUMsV0FBVyxDQUFDLHNCQUFzQixFQUFFLENBQUM7UUFDMUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUMzQixDQUFDOzs7WUFWRixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLGlEQUFpRDtnQkFDM0QsSUFBSSxFQUFFLEVBQUMsU0FBUyxFQUFFLG1CQUFtQixFQUFDO2FBQ3ZDOzs7WUFQTyxpQkFBaUI7O0FBa0J6QiwrRUFBK0U7QUFLL0UsTUFBTSxPQUFPLG1CQUFtQjtJQUM5QixZQUFtQixXQUFzRTtRQUF0RSxnQkFBVyxHQUFYLFdBQVcsQ0FBMkQ7SUFBRyxDQUFDOzs7WUFMOUYsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSxtREFBbUQ7Z0JBQzdELElBQUksRUFBRSxFQUFDLFNBQVMsRUFBRSxxQkFBcUIsRUFBQzthQUN6Qzs7O1lBdEJPLGlCQUFpQjs7QUE0QnpCOzs7R0FHRztBQWNILE1BQU0sT0FBTyxvQkFBb0I7SUFJL0IsWUFDVSxXQUFzRSxFQUN0RSxpQkFBbUM7UUFEbkMsZ0JBQVcsR0FBWCxXQUFXLENBQTJEO1FBQ3RFLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBa0I7SUFBRyxDQUFDO0lBRWpELGVBQWU7UUFDYixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksY0FBYyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDMUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFFRCxXQUFXOztRQUNULElBQUksQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUU3Qyx3RUFBd0U7UUFDeEUsSUFBSSxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFO1lBQzNDLE1BQUEsSUFBSSxDQUFDLE9BQU8sMENBQUUsTUFBTSxFQUFFLENBQUM7U0FDeEI7SUFDSCxDQUFDOzs7WUFqQ0YsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSx1REFBdUQ7Z0JBRWpFLFFBQVEsRUFBRTs7Ozs7O0dBTVQ7Z0JBQ0QsZUFBZSxFQUFFLHVCQUF1QixDQUFDLE1BQU07Z0JBQy9DLGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxJQUFJOzthQUN0Qzs7O1lBNUNPLGlCQUFpQjtZQUp2QixnQkFBZ0I7Ozt3QkFrRGYsU0FBUyxTQUFDLFdBQVciLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgQWZ0ZXJWaWV3SW5pdCxcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIENvbXBvbmVudCxcbiAgRGlyZWN0aXZlLFxuICBPbkRlc3Ryb3ksXG4gIFRlbXBsYXRlUmVmLFxuICBWaWV3Q2hpbGQsXG4gIFZpZXdDb250YWluZXJSZWYsXG4gIFZpZXdFbmNhcHN1bGF0aW9uXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtUZW1wbGF0ZVBvcnRhbH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BvcnRhbCc7XG5pbXBvcnQge01hdERhdGVwaWNrZXJCYXNlLCBNYXREYXRlcGlja2VyQ29udHJvbH0gZnJvbSAnLi9kYXRlcGlja2VyLWJhc2UnO1xuXG5cbi8qKiBCdXR0b24gdGhhdCB3aWxsIGNsb3NlIHRoZSBkYXRlcGlja2VyIGFuZCBhc3NpZ24gdGhlIGN1cnJlbnQgc2VsZWN0aW9uIHRvIHRoZSBkYXRhIG1vZGVsLiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW21hdERhdGVwaWNrZXJBcHBseV0sIFttYXREYXRlUmFuZ2VQaWNrZXJBcHBseV0nLFxuICBob3N0OiB7JyhjbGljayknOiAnX2FwcGx5U2VsZWN0aW9uKCknfVxufSlcbmV4cG9ydCBjbGFzcyBNYXREYXRlcGlja2VyQXBwbHkge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9kYXRlcGlja2VyOiBNYXREYXRlcGlja2VyQmFzZTxNYXREYXRlcGlja2VyQ29udHJvbDx1bmtub3duPiwgdW5rbm93bj4pIHt9XG5cbiAgX2FwcGx5U2VsZWN0aW9uKCkge1xuICAgIHRoaXMuX2RhdGVwaWNrZXIuX2FwcGx5UGVuZGluZ1NlbGVjdGlvbigpO1xuICAgIHRoaXMuX2RhdGVwaWNrZXIuY2xvc2UoKTtcbiAgfVxufVxuXG5cbi8qKiBCdXR0b24gdGhhdCB3aWxsIGNsb3NlIHRoZSBkYXRlcGlja2VyIGFuZCBkaXNjYXJkIHRoZSBjdXJyZW50IHNlbGVjdGlvbi4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1ttYXREYXRlcGlja2VyQ2FuY2VsXSwgW21hdERhdGVSYW5nZVBpY2tlckNhbmNlbF0nLFxuICBob3N0OiB7JyhjbGljayknOiAnX2RhdGVwaWNrZXIuY2xvc2UoKSd9XG59KVxuZXhwb3J0IGNsYXNzIE1hdERhdGVwaWNrZXJDYW5jZWwge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgX2RhdGVwaWNrZXI6IE1hdERhdGVwaWNrZXJCYXNlPE1hdERhdGVwaWNrZXJDb250cm9sPHVua25vd24+LCB1bmtub3duPikge31cbn1cblxuXG4vKipcbiAqIENvbnRhaW5lciB0aGF0IGNhbiBiZSB1c2VkIHRvIHByb2plY3QgYSByb3cgb2YgYWN0aW9uIGJ1dHRvbnNcbiAqIHRvIHRoZSBib3R0b20gb2YgYSBkYXRlcGlja2VyIG9yIGRhdGUgcmFuZ2UgcGlja2VyLlxuICovXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdtYXQtZGF0ZXBpY2tlci1hY3Rpb25zLCBtYXQtZGF0ZS1yYW5nZS1waWNrZXItYWN0aW9ucycsXG4gIHN0eWxlVXJsczogWydkYXRlcGlja2VyLWFjdGlvbnMuY3NzJ10sXG4gIHRlbXBsYXRlOiBgXG4gICAgPG5nLXRlbXBsYXRlPlxuICAgICAgPGRpdiBjbGFzcz1cIm1hdC1kYXRlcGlja2VyLWFjdGlvbnNcIj5cbiAgICAgICAgPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PlxuICAgICAgPC9kaXY+XG4gICAgPC9uZy10ZW1wbGF0ZT5cbiAgYCxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmVcbn0pXG5leHBvcnQgY2xhc3MgTWF0RGF0ZXBpY2tlckFjdGlvbnMgaW1wbGVtZW50cyBBZnRlclZpZXdJbml0LCBPbkRlc3Ryb3kge1xuICBAVmlld0NoaWxkKFRlbXBsYXRlUmVmKSBfdGVtcGxhdGU6IFRlbXBsYXRlUmVmPHVua25vd24+O1xuICBwcml2YXRlIF9wb3J0YWw6IFRlbXBsYXRlUG9ydGFsO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgX2RhdGVwaWNrZXI6IE1hdERhdGVwaWNrZXJCYXNlPE1hdERhdGVwaWNrZXJDb250cm9sPHVua25vd24+LCB1bmtub3duPixcbiAgICBwcml2YXRlIF92aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmKSB7fVxuXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAgICB0aGlzLl9wb3J0YWwgPSBuZXcgVGVtcGxhdGVQb3J0YWwodGhpcy5fdGVtcGxhdGUsIHRoaXMuX3ZpZXdDb250YWluZXJSZWYpO1xuICAgIHRoaXMuX2RhdGVwaWNrZXIucmVnaXN0ZXJBY3Rpb25zKHRoaXMuX3BvcnRhbCk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLl9kYXRlcGlja2VyLnJlbW92ZUFjdGlvbnModGhpcy5fcG9ydGFsKTtcblxuICAgIC8vIE5lZWRzIHRvIGJlIG51bGwgY2hlY2tlZCBzaW5jZSB3ZSBpbml0aWFsaXplIGl0IGluIGBuZ0FmdGVyVmlld0luaXRgLlxuICAgIGlmICh0aGlzLl9wb3J0YWwgJiYgdGhpcy5fcG9ydGFsLmlzQXR0YWNoZWQpIHtcbiAgICAgIHRoaXMuX3BvcnRhbD8uZGV0YWNoKCk7XG4gICAgfVxuICB9XG59XG4iXX0=