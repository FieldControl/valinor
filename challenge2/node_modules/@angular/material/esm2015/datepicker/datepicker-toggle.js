/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Attribute, ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChild, Directive, Input, ViewEncapsulation, ViewChild, } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { merge, of as observableOf, Subscription } from 'rxjs';
import { MatDatepickerIntl } from './datepicker-intl';
/** Can be used to override the icon of a `matDatepickerToggle`. */
export class MatDatepickerToggleIcon {
}
MatDatepickerToggleIcon.decorators = [
    { type: Directive, args: [{
                selector: '[matDatepickerToggleIcon]'
            },] }
];
export class MatDatepickerToggle {
    constructor(_intl, _changeDetectorRef, defaultTabIndex) {
        this._intl = _intl;
        this._changeDetectorRef = _changeDetectorRef;
        this._stateChanges = Subscription.EMPTY;
        const parsedTabIndex = Number(defaultTabIndex);
        this.tabIndex = (parsedTabIndex || parsedTabIndex === 0) ? parsedTabIndex : null;
    }
    /** Whether the toggle button is disabled. */
    get disabled() {
        if (this._disabled === undefined && this.datepicker) {
            return this.datepicker.disabled;
        }
        return !!this._disabled;
    }
    set disabled(value) {
        this._disabled = coerceBooleanProperty(value);
    }
    ngOnChanges(changes) {
        if (changes['datepicker']) {
            this._watchStateChanges();
        }
    }
    ngOnDestroy() {
        this._stateChanges.unsubscribe();
    }
    ngAfterContentInit() {
        this._watchStateChanges();
    }
    _open(event) {
        if (this.datepicker && !this.disabled) {
            this.datepicker.open();
            event.stopPropagation();
        }
    }
    _watchStateChanges() {
        const datepickerStateChanged = this.datepicker ? this.datepicker.stateChanges : observableOf();
        const inputStateChanged = this.datepicker && this.datepicker.datepickerInput ?
            this.datepicker.datepickerInput.stateChanges : observableOf();
        const datepickerToggled = this.datepicker ?
            merge(this.datepicker.openedStream, this.datepicker.closedStream) :
            observableOf();
        this._stateChanges.unsubscribe();
        this._stateChanges = merge(this._intl.changes, datepickerStateChanged, inputStateChanged, datepickerToggled).subscribe(() => this._changeDetectorRef.markForCheck());
    }
}
MatDatepickerToggle.decorators = [
    { type: Component, args: [{
                selector: 'mat-datepicker-toggle',
                template: "<button\n  #button\n  mat-icon-button\n  type=\"button\"\n  [attr.aria-haspopup]=\"datepicker ? 'dialog' : null\"\n  [attr.aria-label]=\"ariaLabel || _intl.openCalendarLabel\"\n  [attr.tabindex]=\"disabled ? -1 : tabIndex\"\n  [disabled]=\"disabled\"\n  [disableRipple]=\"disableRipple\">\n\n  <svg\n    *ngIf=\"!_customIcon\"\n    class=\"mat-datepicker-toggle-default-icon\"\n    viewBox=\"0 0 24 24\"\n    width=\"24px\"\n    height=\"24px\"\n    fill=\"currentColor\"\n    focusable=\"false\">\n    <path d=\"M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z\"/>\n  </svg>\n\n  <ng-content select=\"[matDatepickerToggleIcon]\"></ng-content>\n</button>\n",
                host: {
                    'class': 'mat-datepicker-toggle',
                    '[attr.tabindex]': 'null',
                    '[class.mat-datepicker-toggle-active]': 'datepicker && datepicker.opened',
                    '[class.mat-accent]': 'datepicker && datepicker.color === "accent"',
                    '[class.mat-warn]': 'datepicker && datepicker.color === "warn"',
                    // Used by the test harness to tie this toggle to its datepicker.
                    '[attr.data-mat-calendar]': 'datepicker ? datepicker.id : null',
                    // Bind the `click` on the host, rather than the inner `button`, so that we can call
                    // `stopPropagation` on it without affecting the user's `click` handlers. We need to stop
                    // it so that the input doesn't get focused automatically by the form field (See #21836).
                    '(click)': '_open($event)',
                },
                exportAs: 'matDatepickerToggle',
                encapsulation: ViewEncapsulation.None,
                changeDetection: ChangeDetectionStrategy.OnPush,
                styles: [".mat-form-field-appearance-legacy .mat-form-field-prefix .mat-datepicker-toggle-default-icon,.mat-form-field-appearance-legacy .mat-form-field-suffix .mat-datepicker-toggle-default-icon{width:1em}.mat-form-field:not(.mat-form-field-appearance-legacy) .mat-form-field-prefix .mat-datepicker-toggle-default-icon,.mat-form-field:not(.mat-form-field-appearance-legacy) .mat-form-field-suffix .mat-datepicker-toggle-default-icon{display:block;width:1.5em;height:1.5em}.mat-form-field:not(.mat-form-field-appearance-legacy) .mat-form-field-prefix .mat-icon-button .mat-datepicker-toggle-default-icon,.mat-form-field:not(.mat-form-field-appearance-legacy) .mat-form-field-suffix .mat-icon-button .mat-datepicker-toggle-default-icon{margin:auto}.cdk-high-contrast-active .mat-datepicker-toggle-default-icon{color:CanvasText}\n"]
            },] }
];
MatDatepickerToggle.ctorParameters = () => [
    { type: MatDatepickerIntl },
    { type: ChangeDetectorRef },
    { type: String, decorators: [{ type: Attribute, args: ['tabindex',] }] }
];
MatDatepickerToggle.propDecorators = {
    datepicker: [{ type: Input, args: ['for',] }],
    tabIndex: [{ type: Input }],
    ariaLabel: [{ type: Input, args: ['aria-label',] }],
    disabled: [{ type: Input }],
    disableRipple: [{ type: Input }],
    _customIcon: [{ type: ContentChild, args: [MatDatepickerToggleIcon,] }],
    _button: [{ type: ViewChild, args: ['button',] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZXBpY2tlci10b2dnbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvZGF0ZXBpY2tlci9kYXRlcGlja2VyLXRvZ2dsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQWUscUJBQXFCLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUMxRSxPQUFPLEVBRUwsU0FBUyxFQUNULHVCQUF1QixFQUN2QixpQkFBaUIsRUFDakIsU0FBUyxFQUNULFlBQVksRUFDWixTQUFTLEVBQ1QsS0FBSyxFQUlMLGlCQUFpQixFQUNqQixTQUFTLEdBQ1YsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLDBCQUEwQixDQUFDO0FBQ25ELE9BQU8sRUFBQyxLQUFLLEVBQWMsRUFBRSxJQUFJLFlBQVksRUFBRSxZQUFZLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDekUsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFJcEQsbUVBQW1FO0FBSW5FLE1BQU0sT0FBTyx1QkFBdUI7OztZQUhuQyxTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLDJCQUEyQjthQUN0Qzs7QUF5QkQsTUFBTSxPQUFPLG1CQUFtQjtJQW1DOUIsWUFDUyxLQUF3QixFQUN2QixrQkFBcUMsRUFDdEIsZUFBdUI7UUFGdkMsVUFBSyxHQUFMLEtBQUssQ0FBbUI7UUFDdkIsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFtQjtRQXBDdkMsa0JBQWEsR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDO1FBdUN6QyxNQUFNLGNBQWMsR0FBRyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDL0MsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLGNBQWMsSUFBSSxjQUFjLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsSUFB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Q3RCLEtBQUssU0FBQyxLQUFLO3VCQUdYLEtBQUs7d0JBR0wsS0FBSyxTQUFDLFlBQVk7dUJBR2xCLEtBQUs7NEJBY0wsS0FBSzswQkFHTCxZQUFZLFNBQUMsdUJBQXVCO3NCQUdwQyxTQUFTLFNBQUMsUUFBUSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0Jvb2xlYW5JbnB1dCwgY29lcmNlQm9vbGVhblByb3BlcnR5fSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xuaW1wb3J0IHtcbiAgQWZ0ZXJDb250ZW50SW5pdCxcbiAgQXR0cmlidXRlLFxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gIENvbXBvbmVudCxcbiAgQ29udGVudENoaWxkLFxuICBEaXJlY3RpdmUsXG4gIElucHV0LFxuICBPbkNoYW5nZXMsXG4gIE9uRGVzdHJveSxcbiAgU2ltcGxlQ2hhbmdlcyxcbiAgVmlld0VuY2Fwc3VsYXRpb24sXG4gIFZpZXdDaGlsZCxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge01hdEJ1dHRvbn0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvYnV0dG9uJztcbmltcG9ydCB7bWVyZ2UsIE9ic2VydmFibGUsIG9mIGFzIG9ic2VydmFibGVPZiwgU3Vic2NyaXB0aW9ufSBmcm9tICdyeGpzJztcbmltcG9ydCB7TWF0RGF0ZXBpY2tlckludGx9IGZyb20gJy4vZGF0ZXBpY2tlci1pbnRsJztcbmltcG9ydCB7TWF0RGF0ZXBpY2tlckNvbnRyb2wsIE1hdERhdGVwaWNrZXJQYW5lbH0gZnJvbSAnLi9kYXRlcGlja2VyLWJhc2UnO1xuXG5cbi8qKiBDYW4gYmUgdXNlZCB0byBvdmVycmlkZSB0aGUgaWNvbiBvZiBhIGBtYXREYXRlcGlja2VyVG9nZ2xlYC4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1ttYXREYXRlcGlja2VyVG9nZ2xlSWNvbl0nXG59KVxuZXhwb3J0IGNsYXNzIE1hdERhdGVwaWNrZXJUb2dnbGVJY29uIHt9XG5cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbWF0LWRhdGVwaWNrZXItdG9nZ2xlJyxcbiAgdGVtcGxhdGVVcmw6ICdkYXRlcGlja2VyLXRvZ2dsZS5odG1sJyxcbiAgc3R5bGVVcmxzOiBbJ2RhdGVwaWNrZXItdG9nZ2xlLmNzcyddLFxuICBob3N0OiB7XG4gICAgJ2NsYXNzJzogJ21hdC1kYXRlcGlja2VyLXRvZ2dsZScsXG4gICAgJ1thdHRyLnRhYmluZGV4XSc6ICdudWxsJyxcbiAgICAnW2NsYXNzLm1hdC1kYXRlcGlja2VyLXRvZ2dsZS1hY3RpdmVdJzogJ2RhdGVwaWNrZXIgJiYgZGF0ZXBpY2tlci5vcGVuZWQnLFxuICAgICdbY2xhc3MubWF0LWFjY2VudF0nOiAnZGF0ZXBpY2tlciAmJiBkYXRlcGlja2VyLmNvbG9yID09PSBcImFjY2VudFwiJyxcbiAgICAnW2NsYXNzLm1hdC13YXJuXSc6ICdkYXRlcGlja2VyICYmIGRhdGVwaWNrZXIuY29sb3IgPT09IFwid2FyblwiJyxcbiAgICAvLyBVc2VkIGJ5IHRoZSB0ZXN0IGhhcm5lc3MgdG8gdGllIHRoaXMgdG9nZ2xlIHRvIGl0cyBkYXRlcGlja2VyLlxuICAgICdbYXR0ci5kYXRhLW1hdC1jYWxlbmRhcl0nOiAnZGF0ZXBpY2tlciA/IGRhdGVwaWNrZXIuaWQgOiBudWxsJyxcbiAgICAvLyBCaW5kIHRoZSBgY2xpY2tgIG9uIHRoZSBob3N0LCByYXRoZXIgdGhhbiB0aGUgaW5uZXIgYGJ1dHRvbmAsIHNvIHRoYXQgd2UgY2FuIGNhbGxcbiAgICAvLyBgc3RvcFByb3BhZ2F0aW9uYCBvbiBpdCB3aXRob3V0IGFmZmVjdGluZyB0aGUgdXNlcidzIGBjbGlja2AgaGFuZGxlcnMuIFdlIG5lZWQgdG8gc3RvcFxuICAgIC8vIGl0IHNvIHRoYXQgdGhlIGlucHV0IGRvZXNuJ3QgZ2V0IGZvY3VzZWQgYXV0b21hdGljYWxseSBieSB0aGUgZm9ybSBmaWVsZCAoU2VlICMyMTgzNikuXG4gICAgJyhjbGljayknOiAnX29wZW4oJGV2ZW50KScsXG4gIH0sXG4gIGV4cG9ydEFzOiAnbWF0RGF0ZXBpY2tlclRvZ2dsZScsXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxufSlcbmV4cG9ydCBjbGFzcyBNYXREYXRlcGlja2VyVG9nZ2xlPEQ+IGltcGxlbWVudHMgQWZ0ZXJDb250ZW50SW5pdCwgT25DaGFuZ2VzLCBPbkRlc3Ryb3kge1xuICBwcml2YXRlIF9zdGF0ZUNoYW5nZXMgPSBTdWJzY3JpcHRpb24uRU1QVFk7XG5cbiAgLyoqIERhdGVwaWNrZXIgaW5zdGFuY2UgdGhhdCB0aGUgYnV0dG9uIHdpbGwgdG9nZ2xlLiAqL1xuICBASW5wdXQoJ2ZvcicpIGRhdGVwaWNrZXI6IE1hdERhdGVwaWNrZXJQYW5lbDxNYXREYXRlcGlja2VyQ29udHJvbDxhbnk+LCBEPjtcblxuICAvKiogVGFiaW5kZXggZm9yIHRoZSB0b2dnbGUuICovXG4gIEBJbnB1dCgpIHRhYkluZGV4OiBudW1iZXIgfCBudWxsO1xuXG4gIC8qKiBTY3JlZW5yZWFkZXIgbGFiZWwgZm9yIHRoZSBidXR0b24uICovXG4gIEBJbnB1dCgnYXJpYS1sYWJlbCcpIGFyaWFMYWJlbDogc3RyaW5nO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSB0b2dnbGUgYnV0dG9uIGlzIGRpc2FibGVkLiAqL1xuICBASW5wdXQoKVxuICBnZXQgZGlzYWJsZWQoKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMuX2Rpc2FibGVkID09PSB1bmRlZmluZWQgJiYgdGhpcy5kYXRlcGlja2VyKSB7XG4gICAgICByZXR1cm4gdGhpcy5kYXRlcGlja2VyLmRpc2FibGVkO1xuICAgIH1cblxuICAgIHJldHVybiAhIXRoaXMuX2Rpc2FibGVkO1xuICB9XG4gIHNldCBkaXNhYmxlZCh2YWx1ZTogYm9vbGVhbikge1xuICAgIHRoaXMuX2Rpc2FibGVkID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHZhbHVlKTtcbiAgfVxuICBwcml2YXRlIF9kaXNhYmxlZDogYm9vbGVhbjtcblxuICAvKiogV2hldGhlciByaXBwbGVzIG9uIHRoZSB0b2dnbGUgc2hvdWxkIGJlIGRpc2FibGVkLiAqL1xuICBASW5wdXQoKSBkaXNhYmxlUmlwcGxlOiBib29sZWFuO1xuXG4gIC8qKiBDdXN0b20gaWNvbiBzZXQgYnkgdGhlIGNvbnN1bWVyLiAqL1xuICBAQ29udGVudENoaWxkKE1hdERhdGVwaWNrZXJUb2dnbGVJY29uKSBfY3VzdG9tSWNvbjogTWF0RGF0ZXBpY2tlclRvZ2dsZUljb247XG5cbiAgLyoqIFVuZGVybHlpbmcgYnV0dG9uIGVsZW1lbnQuICovXG4gIEBWaWV3Q2hpbGQoJ2J1dHRvbicpIF9idXR0b246IE1hdEJ1dHRvbjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgX2ludGw6IE1hdERhdGVwaWNrZXJJbnRsLFxuICAgIHByaXZhdGUgX2NoYW5nZURldGVjdG9yUmVmOiBDaGFuZ2VEZXRlY3RvclJlZixcbiAgICBAQXR0cmlidXRlKCd0YWJpbmRleCcpIGRlZmF1bHRUYWJJbmRleDogc3RyaW5nKSB7XG5cbiAgICBjb25zdCBwYXJzZWRUYWJJbmRleCA9IE51bWJlcihkZWZhdWx0VGFiSW5kZXgpO1xuICAgIHRoaXMudGFiSW5kZXggPSAocGFyc2VkVGFiSW5kZXggfHwgcGFyc2VkVGFiSW5kZXggPT09IDApID8gcGFyc2VkVGFiSW5kZXggOiBudWxsO1xuICB9XG5cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykge1xuICAgIGlmIChjaGFuZ2VzWydkYXRlcGlja2VyJ10pIHtcbiAgICAgIHRoaXMuX3dhdGNoU3RhdGVDaGFuZ2VzKCk7XG4gICAgfVxuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5fc3RhdGVDaGFuZ2VzLnVuc3Vic2NyaWJlKCk7XG4gIH1cblxuICBuZ0FmdGVyQ29udGVudEluaXQoKSB7XG4gICAgdGhpcy5fd2F0Y2hTdGF0ZUNoYW5nZXMoKTtcbiAgfVxuXG4gIF9vcGVuKGV2ZW50OiBFdmVudCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmRhdGVwaWNrZXIgJiYgIXRoaXMuZGlzYWJsZWQpIHtcbiAgICAgIHRoaXMuZGF0ZXBpY2tlci5vcGVuKCk7XG4gICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF93YXRjaFN0YXRlQ2hhbmdlcygpIHtcbiAgICBjb25zdCBkYXRlcGlja2VyU3RhdGVDaGFuZ2VkID0gdGhpcy5kYXRlcGlja2VyID8gdGhpcy5kYXRlcGlja2VyLnN0YXRlQ2hhbmdlcyA6IG9ic2VydmFibGVPZigpO1xuICAgIGNvbnN0IGlucHV0U3RhdGVDaGFuZ2VkID0gdGhpcy5kYXRlcGlja2VyICYmIHRoaXMuZGF0ZXBpY2tlci5kYXRlcGlja2VySW5wdXQgP1xuICAgICAgICB0aGlzLmRhdGVwaWNrZXIuZGF0ZXBpY2tlcklucHV0LnN0YXRlQ2hhbmdlcyA6IG9ic2VydmFibGVPZigpO1xuICAgIGNvbnN0IGRhdGVwaWNrZXJUb2dnbGVkID0gdGhpcy5kYXRlcGlja2VyID9cbiAgICAgICAgbWVyZ2UodGhpcy5kYXRlcGlja2VyLm9wZW5lZFN0cmVhbSwgdGhpcy5kYXRlcGlja2VyLmNsb3NlZFN0cmVhbSkgOlxuICAgICAgICBvYnNlcnZhYmxlT2YoKTtcblxuICAgIHRoaXMuX3N0YXRlQ2hhbmdlcy51bnN1YnNjcmliZSgpO1xuICAgIHRoaXMuX3N0YXRlQ2hhbmdlcyA9IG1lcmdlKFxuICAgICAgdGhpcy5faW50bC5jaGFuZ2VzLFxuICAgICAgZGF0ZXBpY2tlclN0YXRlQ2hhbmdlZCBhcyBPYnNlcnZhYmxlPHZvaWQ+LFxuICAgICAgaW5wdXRTdGF0ZUNoYW5nZWQsXG4gICAgICBkYXRlcGlja2VyVG9nZ2xlZFxuICAgICkuc3Vic2NyaWJlKCgpID0+IHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpKTtcbiAgfVxuXG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9kaXNhYmxlZDogQm9vbGVhbklucHV0O1xufVxuIl19