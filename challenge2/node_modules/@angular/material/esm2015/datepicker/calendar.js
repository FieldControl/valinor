/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ComponentPortal } from '@angular/cdk/portal';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, forwardRef, Inject, Input, Optional, Output, ViewChild, ViewEncapsulation, } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS, } from '@angular/material/core';
import { Subject } from 'rxjs';
import { createMissingDateImplError } from './datepicker-errors';
import { MatDatepickerIntl } from './datepicker-intl';
import { MatMonthView } from './month-view';
import { getActiveOffset, isSameMultiYearView, MatMultiYearView, yearsPerPage } from './multi-year-view';
import { MatYearView } from './year-view';
import { MAT_SINGLE_DATE_SELECTION_MODEL_PROVIDER, DateRange } from './date-selection-model';
/** Counter used to generate unique IDs. */
let uniqueId = 0;
/** Default header for MatCalendar */
export class MatCalendarHeader {
    constructor(_intl, calendar, _dateAdapter, _dateFormats, changeDetectorRef) {
        this._intl = _intl;
        this.calendar = calendar;
        this._dateAdapter = _dateAdapter;
        this._dateFormats = _dateFormats;
        this._buttonDescriptionId = `mat-calendar-button-${uniqueId++}`;
        this.calendar.stateChanges.subscribe(() => changeDetectorRef.markForCheck());
    }
    /** The label for the current calendar view. */
    get periodButtonText() {
        if (this.calendar.currentView == 'month') {
            return this._dateAdapter
                .format(this.calendar.activeDate, this._dateFormats.display.monthYearLabel)
                .toLocaleUpperCase();
        }
        if (this.calendar.currentView == 'year') {
            return this._dateAdapter.getYearName(this.calendar.activeDate);
        }
        // The offset from the active year to the "slot" for the starting year is the
        // *actual* first rendered year in the multi-year view, and the last year is
        // just yearsPerPage - 1 away.
        const activeYear = this._dateAdapter.getYear(this.calendar.activeDate);
        const minYearOfPage = activeYear - getActiveOffset(this._dateAdapter, this.calendar.activeDate, this.calendar.minDate, this.calendar.maxDate);
        const maxYearOfPage = minYearOfPage + yearsPerPage - 1;
        const minYearName = this._dateAdapter.getYearName(this._dateAdapter.createDate(minYearOfPage, 0, 1));
        const maxYearName = this._dateAdapter.getYearName(this._dateAdapter.createDate(maxYearOfPage, 0, 1));
        return this._intl.formatYearRange(minYearName, maxYearName);
    }
    get periodButtonLabel() {
        return this.calendar.currentView == 'month' ?
            this._intl.switchToMultiYearViewLabel : this._intl.switchToMonthViewLabel;
    }
    /** The label for the previous button. */
    get prevButtonLabel() {
        return {
            'month': this._intl.prevMonthLabel,
            'year': this._intl.prevYearLabel,
            'multi-year': this._intl.prevMultiYearLabel
        }[this.calendar.currentView];
    }
    /** The label for the next button. */
    get nextButtonLabel() {
        return {
            'month': this._intl.nextMonthLabel,
            'year': this._intl.nextYearLabel,
            'multi-year': this._intl.nextMultiYearLabel
        }[this.calendar.currentView];
    }
    /** Handles user clicks on the period label. */
    currentPeriodClicked() {
        this.calendar.currentView = this.calendar.currentView == 'month' ? 'multi-year' : 'month';
    }
    /** Handles user clicks on the previous button. */
    previousClicked() {
        this.calendar.activeDate = this.calendar.currentView == 'month' ?
            this._dateAdapter.addCalendarMonths(this.calendar.activeDate, -1) :
            this._dateAdapter.addCalendarYears(this.calendar.activeDate, this.calendar.currentView == 'year' ? -1 : -yearsPerPage);
    }
    /** Handles user clicks on the next button. */
    nextClicked() {
        this.calendar.activeDate = this.calendar.currentView == 'month' ?
            this._dateAdapter.addCalendarMonths(this.calendar.activeDate, 1) :
            this._dateAdapter.addCalendarYears(this.calendar.activeDate, this.calendar.currentView == 'year' ? 1 : yearsPerPage);
    }
    /** Whether the previous period button is enabled. */
    previousEnabled() {
        if (!this.calendar.minDate) {
            return true;
        }
        return !this.calendar.minDate ||
            !this._isSameView(this.calendar.activeDate, this.calendar.minDate);
    }
    /** Whether the next period button is enabled. */
    nextEnabled() {
        return !this.calendar.maxDate ||
            !this._isSameView(this.calendar.activeDate, this.calendar.maxDate);
    }
    /** Whether the two dates represent the same view in the current view mode (month or year). */
    _isSameView(date1, date2) {
        if (this.calendar.currentView == 'month') {
            return this._dateAdapter.getYear(date1) == this._dateAdapter.getYear(date2) &&
                this._dateAdapter.getMonth(date1) == this._dateAdapter.getMonth(date2);
        }
        if (this.calendar.currentView == 'year') {
            return this._dateAdapter.getYear(date1) == this._dateAdapter.getYear(date2);
        }
        // Otherwise we are in 'multi-year' view.
        return isSameMultiYearView(this._dateAdapter, date1, date2, this.calendar.minDate, this.calendar.maxDate);
    }
}
MatCalendarHeader.decorators = [
    { type: Component, args: [{
                selector: 'mat-calendar-header',
                template: "<div class=\"mat-calendar-header\">\n  <div class=\"mat-calendar-controls\">\n    <button mat-button type=\"button\" class=\"mat-calendar-period-button\"\n            (click)=\"currentPeriodClicked()\" [attr.aria-label]=\"periodButtonLabel\"\n            [attr.aria-describedby]=\"_buttonDescriptionId\"\n            cdkAriaLive=\"polite\">\n      <span [attr.id]=\"_buttonDescriptionId\">{{periodButtonText}}</span>\n      <div class=\"mat-calendar-arrow\"\n           [class.mat-calendar-invert]=\"calendar.currentView !== 'month'\"></div>\n    </button>\n\n    <div class=\"mat-calendar-spacer\"></div>\n\n    <ng-content></ng-content>\n\n    <button mat-icon-button type=\"button\" class=\"mat-calendar-previous-button\"\n            [disabled]=\"!previousEnabled()\" (click)=\"previousClicked()\"\n            [attr.aria-label]=\"prevButtonLabel\">\n    </button>\n\n    <button mat-icon-button type=\"button\" class=\"mat-calendar-next-button\"\n            [disabled]=\"!nextEnabled()\" (click)=\"nextClicked()\"\n            [attr.aria-label]=\"nextButtonLabel\">\n    </button>\n  </div>\n</div>\n",
                exportAs: 'matCalendarHeader',
                encapsulation: ViewEncapsulation.None,
                changeDetection: ChangeDetectionStrategy.OnPush
            },] }
];
MatCalendarHeader.ctorParameters = () => [
    { type: MatDatepickerIntl },
    { type: MatCalendar, decorators: [{ type: Inject, args: [forwardRef(() => MatCalendar),] }] },
    { type: DateAdapter, decorators: [{ type: Optional }] },
    { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [MAT_DATE_FORMATS,] }] },
    { type: ChangeDetectorRef }
];
/**
 * A calendar that is used as part of the datepicker.
 * @docs-private
 */
export class MatCalendar {
    constructor(_intl, _dateAdapter, _dateFormats, _changeDetectorRef) {
        this._dateAdapter = _dateAdapter;
        this._dateFormats = _dateFormats;
        this._changeDetectorRef = _changeDetectorRef;
        /**
         * Used for scheduling that focus should be moved to the active cell on the next tick.
         * We need to schedule it, rather than do it immediately, because we have to wait
         * for Angular to re-evaluate the view children.
         */
        this._moveFocusOnNextTick = false;
        /** Whether the calendar should be started in month or year view. */
        this.startView = 'month';
        /** Emits when the currently selected date changes. */
        this.selectedChange = new EventEmitter();
        /**
         * Emits the year chosen in multiyear view.
         * This doesn't imply a change on the selected date.
         */
        this.yearSelected = new EventEmitter();
        /**
         * Emits the month chosen in year view.
         * This doesn't imply a change on the selected date.
         */
        this.monthSelected = new EventEmitter();
        /**
         * Emits when the current view changes.
         */
        this.viewChanged = new EventEmitter(true);
        /** Emits when any date is selected. */
        this._userSelection = new EventEmitter();
        /**
         * Emits whenever there is a state change that the header may need to respond to.
         */
        this.stateChanges = new Subject();
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
            if (!this._dateAdapter) {
                throw createMissingDateImplError('DateAdapter');
            }
            if (!this._dateFormats) {
                throw createMissingDateImplError('MAT_DATE_FORMATS');
            }
        }
        this._intlChanges = _intl.changes.subscribe(() => {
            _changeDetectorRef.markForCheck();
            this.stateChanges.next();
        });
    }
    /** A date representing the period (month or year) to start the calendar in. */
    get startAt() { return this._startAt; }
    set startAt(value) {
        this._startAt = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value));
    }
    /** The currently selected date. */
    get selected() { return this._selected; }
    set selected(value) {
        if (value instanceof DateRange) {
            this._selected = value;
        }
        else {
            this._selected = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value));
        }
    }
    /** The minimum selectable date. */
    get minDate() { return this._minDate; }
    set minDate(value) {
        this._minDate = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value));
    }
    /** The maximum selectable date. */
    get maxDate() { return this._maxDate; }
    set maxDate(value) {
        this._maxDate = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value));
    }
    /**
     * The current active date. This determines which time period is shown and which date is
     * highlighted when using keyboard navigation.
     */
    get activeDate() { return this._clampedActiveDate; }
    set activeDate(value) {
        this._clampedActiveDate = this._dateAdapter.clampDate(value, this.minDate, this.maxDate);
        this.stateChanges.next();
        this._changeDetectorRef.markForCheck();
    }
    /** Whether the calendar is in month view. */
    get currentView() { return this._currentView; }
    set currentView(value) {
        const viewChangedResult = this._currentView !== value ? value : null;
        this._currentView = value;
        this._moveFocusOnNextTick = true;
        this._changeDetectorRef.markForCheck();
        if (viewChangedResult) {
            this.viewChanged.emit(viewChangedResult);
        }
    }
    ngAfterContentInit() {
        this._calendarHeaderPortal = new ComponentPortal(this.headerComponent || MatCalendarHeader);
        this.activeDate = this.startAt || this._dateAdapter.today();
        // Assign to the private property since we don't want to move focus on init.
        this._currentView = this.startView;
    }
    ngAfterViewChecked() {
        if (this._moveFocusOnNextTick) {
            this._moveFocusOnNextTick = false;
            this.focusActiveCell();
        }
    }
    ngOnDestroy() {
        this._intlChanges.unsubscribe();
        this.stateChanges.complete();
    }
    ngOnChanges(changes) {
        const change = changes['minDate'] || changes['maxDate'] || changes['dateFilter'];
        if (change && !change.firstChange) {
            const view = this._getCurrentViewComponent();
            if (view) {
                // We need to `detectChanges` manually here, because the `minDate`, `maxDate` etc. are
                // passed down to the view via data bindings which won't be up-to-date when we call `_init`.
                this._changeDetectorRef.detectChanges();
                view._init();
            }
        }
        this.stateChanges.next();
    }
    focusActiveCell() {
        this._getCurrentViewComponent()._focusActiveCell(false);
    }
    /** Updates today's date after an update of the active date */
    updateTodaysDate() {
        const currentView = this.currentView;
        let view;
        if (currentView === 'month') {
            view = this.monthView;
        }
        else if (currentView === 'year') {
            view = this.yearView;
        }
        else {
            view = this.multiYearView;
        }
        view._init();
    }
    /** Handles date selection in the month view. */
    _dateSelected(event) {
        const date = event.value;
        if (this.selected instanceof DateRange ||
            (date && !this._dateAdapter.sameDate(date, this.selected))) {
            this.selectedChange.emit(date);
        }
        this._userSelection.emit(event);
    }
    /** Handles year selection in the multiyear view. */
    _yearSelectedInMultiYearView(normalizedYear) {
        this.yearSelected.emit(normalizedYear);
    }
    /** Handles month selection in the year view. */
    _monthSelectedInYearView(normalizedMonth) {
        this.monthSelected.emit(normalizedMonth);
    }
    /** Handles year/month selection in the multi-year/year views. */
    _goToDateInView(date, view) {
        this.activeDate = date;
        this.currentView = view;
    }
    /** Returns the component instance that corresponds to the current calendar view. */
    _getCurrentViewComponent() {
        return this.monthView || this.yearView || this.multiYearView;
    }
}
MatCalendar.decorators = [
    { type: Component, args: [{
                selector: 'mat-calendar',
                template: "<ng-template [cdkPortalOutlet]=\"_calendarHeaderPortal\"></ng-template>\n\n<div class=\"mat-calendar-content\" [ngSwitch]=\"currentView\" cdkMonitorSubtreeFocus tabindex=\"-1\">\n  <mat-month-view\n      *ngSwitchCase=\"'month'\"\n      [(activeDate)]=\"activeDate\"\n      [selected]=\"selected\"\n      [dateFilter]=\"dateFilter\"\n      [maxDate]=\"maxDate\"\n      [minDate]=\"minDate\"\n      [dateClass]=\"dateClass\"\n      [comparisonStart]=\"comparisonStart\"\n      [comparisonEnd]=\"comparisonEnd\"\n      (_userSelection)=\"_dateSelected($event)\">\n  </mat-month-view>\n\n  <mat-year-view\n      *ngSwitchCase=\"'year'\"\n      [(activeDate)]=\"activeDate\"\n      [selected]=\"selected\"\n      [dateFilter]=\"dateFilter\"\n      [maxDate]=\"maxDate\"\n      [minDate]=\"minDate\"\n      [dateClass]=\"dateClass\"\n      (monthSelected)=\"_monthSelectedInYearView($event)\"\n      (selectedChange)=\"_goToDateInView($event, 'month')\">\n  </mat-year-view>\n\n  <mat-multi-year-view\n      *ngSwitchCase=\"'multi-year'\"\n      [(activeDate)]=\"activeDate\"\n      [selected]=\"selected\"\n      [dateFilter]=\"dateFilter\"\n      [maxDate]=\"maxDate\"\n      [minDate]=\"minDate\"\n      [dateClass]=\"dateClass\"\n      (yearSelected)=\"_yearSelectedInMultiYearView($event)\"\n      (selectedChange)=\"_goToDateInView($event, 'year')\">\n  </mat-multi-year-view>\n</div>\n",
                host: {
                    'class': 'mat-calendar',
                },
                exportAs: 'matCalendar',
                encapsulation: ViewEncapsulation.None,
                changeDetection: ChangeDetectionStrategy.OnPush,
                providers: [MAT_SINGLE_DATE_SELECTION_MODEL_PROVIDER],
                styles: [".mat-calendar{display:block}.mat-calendar-header{padding:8px 8px 0 8px}.mat-calendar-content{padding:0 8px 8px 8px;outline:none}.mat-calendar-controls{display:flex;margin:5% calc(33% / 7 - 16px)}.mat-calendar-controls .mat-icon-button:hover .mat-button-focus-overlay{opacity:.04}.mat-calendar-spacer{flex:1 1 auto}.mat-calendar-period-button{min-width:0}.mat-calendar-arrow{display:inline-block;width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top-width:5px;border-top-style:solid;margin:0 0 0 5px;vertical-align:middle}.mat-calendar-arrow.mat-calendar-invert{transform:rotate(180deg)}[dir=rtl] .mat-calendar-arrow{margin:0 5px 0 0}.mat-calendar-previous-button,.mat-calendar-next-button{position:relative}.mat-calendar-previous-button::after,.mat-calendar-next-button::after{top:0;left:0;right:0;bottom:0;position:absolute;content:\"\";margin:15.5px;border:0 solid currentColor;border-top-width:2px}[dir=rtl] .mat-calendar-previous-button,[dir=rtl] .mat-calendar-next-button{transform:rotate(180deg)}.mat-calendar-previous-button::after{border-left-width:2px;transform:translateX(2px) rotate(-45deg)}.mat-calendar-next-button::after{border-right-width:2px;transform:translateX(-2px) rotate(45deg)}.mat-calendar-table{border-spacing:0;border-collapse:collapse;width:100%}.mat-calendar-table-header th{text-align:center;padding:0 0 8px 0}.mat-calendar-table-header-divider{position:relative;height:1px}.mat-calendar-table-header-divider::after{content:\"\";position:absolute;top:0;left:-8px;right:-8px;height:1px}\n"]
            },] }
];
MatCalendar.ctorParameters = () => [
    { type: MatDatepickerIntl },
    { type: DateAdapter, decorators: [{ type: Optional }] },
    { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [MAT_DATE_FORMATS,] }] },
    { type: ChangeDetectorRef }
];
MatCalendar.propDecorators = {
    headerComponent: [{ type: Input }],
    startAt: [{ type: Input }],
    startView: [{ type: Input }],
    selected: [{ type: Input }],
    minDate: [{ type: Input }],
    maxDate: [{ type: Input }],
    dateFilter: [{ type: Input }],
    dateClass: [{ type: Input }],
    comparisonStart: [{ type: Input }],
    comparisonEnd: [{ type: Input }],
    selectedChange: [{ type: Output }],
    yearSelected: [{ type: Output }],
    monthSelected: [{ type: Output }],
    viewChanged: [{ type: Output }],
    _userSelection: [{ type: Output }],
    monthView: [{ type: ViewChild, args: [MatMonthView,] }],
    yearView: [{ type: ViewChild, args: [MatYearView,] }],
    multiYearView: [{ type: ViewChild, args: [MatMultiYearView,] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FsZW5kYXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvZGF0ZXBpY2tlci9jYWxlbmRhci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsZUFBZSxFQUF3QixNQUFNLHFCQUFxQixDQUFDO0FBQzNFLE9BQU8sRUFHTCx1QkFBdUIsRUFDdkIsaUJBQWlCLEVBQ2pCLFNBQVMsRUFDVCxZQUFZLEVBQ1osVUFBVSxFQUNWLE1BQU0sRUFDTixLQUFLLEVBR0wsUUFBUSxFQUNSLE1BQU0sRUFFTixTQUFTLEVBQ1QsaUJBQWlCLEdBQ2xCLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFDTCxXQUFXLEVBQ1gsZ0JBQWdCLEdBRWpCLE1BQU0sd0JBQXdCLENBQUM7QUFDaEMsT0FBTyxFQUFDLE9BQU8sRUFBZSxNQUFNLE1BQU0sQ0FBQztBQUUzQyxPQUFPLEVBQUMsMEJBQTBCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUMvRCxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNwRCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBQzFDLE9BQU8sRUFDTCxlQUFlLEVBQ2YsbUJBQW1CLEVBQ25CLGdCQUFnQixFQUNoQixZQUFZLEVBQ2IsTUFBTSxtQkFBbUIsQ0FBQztBQUMzQixPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQ3hDLE9BQU8sRUFBQyx3Q0FBd0MsRUFBRSxTQUFTLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQVEzRiwyQ0FBMkM7QUFDM0MsSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDO0FBRWpCLHFDQUFxQztBQVFyQyxNQUFNLE9BQU8saUJBQWlCO0lBRzVCLFlBQW9CLEtBQXdCLEVBQ2MsUUFBd0IsRUFDbEQsWUFBNEIsRUFDRixZQUE0QixFQUMxRSxpQkFBb0M7UUFK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QkFzTGhCLEtBQUs7c0JBZUwsS0FBSzt3QkFRTCxLQUFLO3VCQUdMLEtBQUs7c0JBWUwsS0FBSztzQkFRTCxLQUFLO3lCQVFMLEtBQUs7d0JBR0wsS0FBSzs4QkFHTCxLQUFLOzRCQUdMLEtBQUs7NkJBR0wsTUFBTTsyQkFNTixNQUFNOzRCQU1OLE1BQU07MEJBS04sTUFBTTs2QkFJTixNQUFNO3dCQUlOLFNBQVMsU0FBQyxZQUFZO3VCQUd0QixTQUFTLFNBQUMsV0FBVzs0QkFHckIsU0FBUyxTQUFDLGdCQUFnQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbXBvbmVudFBvcnRhbCwgQ29tcG9uZW50VHlwZSwgUG9ydGFsfSBmcm9tICdAYW5ndWxhci9jZGsvcG9ydGFsJztcbmltcG9ydCB7XG4gIEFmdGVyQ29udGVudEluaXQsXG4gIEFmdGVyVmlld0NoZWNrZWQsXG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICBDaGFuZ2VEZXRlY3RvclJlZixcbiAgQ29tcG9uZW50LFxuICBFdmVudEVtaXR0ZXIsXG4gIGZvcndhcmRSZWYsXG4gIEluamVjdCxcbiAgSW5wdXQsXG4gIE9uQ2hhbmdlcyxcbiAgT25EZXN0cm95LFxuICBPcHRpb25hbCxcbiAgT3V0cHV0LFxuICBTaW1wbGVDaGFuZ2VzLFxuICBWaWV3Q2hpbGQsXG4gIFZpZXdFbmNhcHN1bGF0aW9uLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7XG4gIERhdGVBZGFwdGVyLFxuICBNQVRfREFURV9GT1JNQVRTLFxuICBNYXREYXRlRm9ybWF0cyxcbn0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvY29yZSc7XG5pbXBvcnQge1N1YmplY3QsIFN1YnNjcmlwdGlvbn0gZnJvbSAncnhqcyc7XG5pbXBvcnQge01hdENhbGVuZGFyVXNlckV2ZW50LCBNYXRDYWxlbmRhckNlbGxDbGFzc0Z1bmN0aW9ufSBmcm9tICcuL2NhbGVuZGFyLWJvZHknO1xuaW1wb3J0IHtjcmVhdGVNaXNzaW5nRGF0ZUltcGxFcnJvcn0gZnJvbSAnLi9kYXRlcGlja2VyLWVycm9ycyc7XG5pbXBvcnQge01hdERhdGVwaWNrZXJJbnRsfSBmcm9tICcuL2RhdGVwaWNrZXItaW50bCc7XG5pbXBvcnQge01hdE1vbnRoVmlld30gZnJvbSAnLi9tb250aC12aWV3JztcbmltcG9ydCB7XG4gIGdldEFjdGl2ZU9mZnNldCxcbiAgaXNTYW1lTXVsdGlZZWFyVmlldyxcbiAgTWF0TXVsdGlZZWFyVmlldyxcbiAgeWVhcnNQZXJQYWdlXG59IGZyb20gJy4vbXVsdGkteWVhci12aWV3JztcbmltcG9ydCB7TWF0WWVhclZpZXd9IGZyb20gJy4veWVhci12aWV3JztcbmltcG9ydCB7TUFUX1NJTkdMRV9EQVRFX1NFTEVDVElPTl9NT0RFTF9QUk9WSURFUiwgRGF0ZVJhbmdlfSBmcm9tICcuL2RhdGUtc2VsZWN0aW9uLW1vZGVsJztcblxuLyoqXG4gKiBQb3NzaWJsZSB2aWV3cyBmb3IgdGhlIGNhbGVuZGFyLlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5leHBvcnQgdHlwZSBNYXRDYWxlbmRhclZpZXcgPSAnbW9udGgnIHwgJ3llYXInIHwgJ211bHRpLXllYXInO1xuXG4vKiogQ291bnRlciB1c2VkIHRvIGdlbmVyYXRlIHVuaXF1ZSBJRHMuICovXG5sZXQgdW5pcXVlSWQgPSAwO1xuXG4vKiogRGVmYXVsdCBoZWFkZXIgZm9yIE1hdENhbGVuZGFyICovXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdtYXQtY2FsZW5kYXItaGVhZGVyJyxcbiAgdGVtcGxhdGVVcmw6ICdjYWxlbmRhci1oZWFkZXIuaHRtbCcsXG4gIGV4cG9ydEFzOiAnbWF0Q2FsZW5kYXJIZWFkZXInLFxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaCxcbn0pXG5leHBvcnQgY2xhc3MgTWF0Q2FsZW5kYXJIZWFkZXI8RD4ge1xuICBfYnV0dG9uRGVzY3JpcHRpb25JZCA9IGBtYXQtY2FsZW5kYXItYnV0dG9uLSR7dW5pcXVlSWQrK31gO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2ludGw6IE1hdERhdGVwaWNrZXJJbnRsLFxuICAgICAgICAgICAgICBASW5qZWN0KGZvcndhcmRSZWYoKCkgPT4gTWF0Q2FsZW5kYXIpKSBwdWJsaWMgY2FsZW5kYXI6IE1hdENhbGVuZGFyPEQ+LFxuICAgICAgICAgICAgICBAT3B0aW9uYWwoKSBwcml2YXRlIF9kYXRlQWRhcHRlcjogRGF0ZUFkYXB0ZXI8RD4sXG4gICAgICAgICAgICAgIEBPcHRpb25hbCgpIEBJbmplY3QoTUFUX0RBVEVfRk9STUFUUykgcHJpdmF0ZSBfZGF0ZUZvcm1hdHM6IE1hdERhdGVGb3JtYXRzLFxuICAgICAgICAgICAgICBjaGFuZ2VEZXRlY3RvclJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYpIHtcblxuICAgIHRoaXMuY2FsZW5kYXIuc3RhdGVDaGFuZ2VzLnN1YnNjcmliZSgoKSA9PiBjaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKSk7XG4gIH1cblxuICAvKiogVGhlIGxhYmVsIGZvciB0aGUgY3VycmVudCBjYWxlbmRhciB2aWV3LiAqL1xuICBnZXQgcGVyaW9kQnV0dG9uVGV4dCgpOiBzdHJpbmcge1xuICAgIGlmICh0aGlzLmNhbGVuZGFyLmN1cnJlbnRWaWV3ID09ICdtb250aCcpIHtcbiAgICAgIHJldHVybiB0aGlzLl9kYXRlQWRhcHRlclxuICAgICAgICAgIC5mb3JtYXQodGhpcy5jYWxlbmRhci5hY3RpdmVEYXRlLCB0aGlzLl9kYXRlRm9ybWF0cy5kaXNwbGF5Lm1vbnRoWWVhckxhYmVsKVxuICAgICAgICAgICAgICAudG9Mb2NhbGVVcHBlckNhc2UoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuY2FsZW5kYXIuY3VycmVudFZpZXcgPT0gJ3llYXInKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0WWVhck5hbWUodGhpcy5jYWxlbmRhci5hY3RpdmVEYXRlKTtcbiAgICB9XG5cbiAgICAvLyBUaGUgb2Zmc2V0IGZyb20gdGhlIGFjdGl2ZSB5ZWFyIHRvIHRoZSBcInNsb3RcIiBmb3IgdGhlIHN0YXJ0aW5nIHllYXIgaXMgdGhlXG4gICAgLy8gKmFjdHVhbCogZmlyc3QgcmVuZGVyZWQgeWVhciBpbiB0aGUgbXVsdGkteWVhciB2aWV3LCBhbmQgdGhlIGxhc3QgeWVhciBpc1xuICAgIC8vIGp1c3QgeWVhcnNQZXJQYWdlIC0gMSBhd2F5LlxuICAgIGNvbnN0IGFjdGl2ZVllYXIgPSB0aGlzLl9kYXRlQWRhcHRlci5nZXRZZWFyKHRoaXMuY2FsZW5kYXIuYWN0aXZlRGF0ZSk7XG4gICAgY29uc3QgbWluWWVhck9mUGFnZSA9IGFjdGl2ZVllYXIgLSBnZXRBY3RpdmVPZmZzZXQoXG4gICAgICB0aGlzLl9kYXRlQWRhcHRlciwgdGhpcy5jYWxlbmRhci5hY3RpdmVEYXRlLCB0aGlzLmNhbGVuZGFyLm1pbkRhdGUsIHRoaXMuY2FsZW5kYXIubWF4RGF0ZSk7XG4gICAgY29uc3QgbWF4WWVhck9mUGFnZSA9IG1pblllYXJPZlBhZ2UgKyB5ZWFyc1BlclBhZ2UgLSAxO1xuICAgIGNvbnN0IG1pblllYXJOYW1lID1cbiAgICAgIHRoaXMuX2RhdGVBZGFwdGVyLmdldFllYXJOYW1lKHRoaXMuX2RhdGVBZGFwdGVyLmNyZWF0ZURhdGUobWluWWVhck9mUGFnZSwgMCwgMSkpO1xuICAgIGNvbnN0IG1heFllYXJOYW1lID1cbiAgICAgIHRoaXMuX2RhdGVBZGFwdGVyLmdldFllYXJOYW1lKHRoaXMuX2RhdGVBZGFwdGVyLmNyZWF0ZURhdGUobWF4WWVhck9mUGFnZSwgMCwgMSkpO1xuICAgIHJldHVybiB0aGlzLl9pbnRsLmZvcm1hdFllYXJSYW5nZShtaW5ZZWFyTmFtZSwgbWF4WWVhck5hbWUpO1xuICB9XG5cbiAgZ2V0IHBlcmlvZEJ1dHRvbkxhYmVsKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuY2FsZW5kYXIuY3VycmVudFZpZXcgPT0gJ21vbnRoJyA/XG4gICAgICAgIHRoaXMuX2ludGwuc3dpdGNoVG9NdWx0aVllYXJWaWV3TGFiZWwgOiB0aGlzLl9pbnRsLnN3aXRjaFRvTW9udGhWaWV3TGFiZWw7XG4gIH1cblxuICAvKiogVGhlIGxhYmVsIGZvciB0aGUgcHJldmlvdXMgYnV0dG9uLiAqL1xuICBnZXQgcHJldkJ1dHRvbkxhYmVsKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHtcbiAgICAgICdtb250aCc6IHRoaXMuX2ludGwucHJldk1vbnRoTGFiZWwsXG4gICAgICAneWVhcic6IHRoaXMuX2ludGwucHJldlllYXJMYWJlbCxcbiAgICAgICdtdWx0aS15ZWFyJzogdGhpcy5faW50bC5wcmV2TXVsdGlZZWFyTGFiZWxcbiAgICB9W3RoaXMuY2FsZW5kYXIuY3VycmVudFZpZXddO1xuICB9XG5cbiAgLyoqIFRoZSBsYWJlbCBmb3IgdGhlIG5leHQgYnV0dG9uLiAqL1xuICBnZXQgbmV4dEJ1dHRvbkxhYmVsKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHtcbiAgICAgICdtb250aCc6IHRoaXMuX2ludGwubmV4dE1vbnRoTGFiZWwsXG4gICAgICAneWVhcic6IHRoaXMuX2ludGwubmV4dFllYXJMYWJlbCxcbiAgICAgICdtdWx0aS15ZWFyJzogdGhpcy5faW50bC5uZXh0TXVsdGlZZWFyTGFiZWxcbiAgICB9W3RoaXMuY2FsZW5kYXIuY3VycmVudFZpZXddO1xuICB9XG5cbiAgLyoqIEhhbmRsZXMgdXNlciBjbGlja3Mgb24gdGhlIHBlcmlvZCBsYWJlbC4gKi9cbiAgY3VycmVudFBlcmlvZENsaWNrZWQoKTogdm9pZCB7XG4gICAgdGhpcy5jYWxlbmRhci5jdXJyZW50VmlldyA9IHRoaXMuY2FsZW5kYXIuY3VycmVudFZpZXcgPT0gJ21vbnRoJyA/ICdtdWx0aS15ZWFyJyA6ICdtb250aCc7XG4gIH1cblxuICAvKiogSGFuZGxlcyB1c2VyIGNsaWNrcyBvbiB0aGUgcHJldmlvdXMgYnV0dG9uLiAqL1xuICBwcmV2aW91c0NsaWNrZWQoKTogdm9pZCB7XG4gICAgdGhpcy5jYWxlbmRhci5hY3RpdmVEYXRlID0gdGhpcy5jYWxlbmRhci5jdXJyZW50VmlldyA9PSAnbW9udGgnID9cbiAgICAgICAgdGhpcy5fZGF0ZUFkYXB0ZXIuYWRkQ2FsZW5kYXJNb250aHModGhpcy5jYWxlbmRhci5hY3RpdmVEYXRlLCAtMSkgOlxuICAgICAgICAgICAgdGhpcy5fZGF0ZUFkYXB0ZXIuYWRkQ2FsZW5kYXJZZWFycyhcbiAgICAgICAgICAgICAgICB0aGlzLmNhbGVuZGFyLmFjdGl2ZURhdGUsIHRoaXMuY2FsZW5kYXIuY3VycmVudFZpZXcgPT0gJ3llYXInID8gLTEgOiAteWVhcnNQZXJQYWdlXG4gICAgICAgICAgICApO1xuICB9XG5cbiAgLyoqIEhhbmRsZXMgdXNlciBjbGlja3Mgb24gdGhlIG5leHQgYnV0dG9uLiAqL1xuICBuZXh0Q2xpY2tlZCgpOiB2b2lkIHtcbiAgICB0aGlzLmNhbGVuZGFyLmFjdGl2ZURhdGUgPSB0aGlzLmNhbGVuZGFyLmN1cnJlbnRWaWV3ID09ICdtb250aCcgP1xuICAgICAgICB0aGlzLl9kYXRlQWRhcHRlci5hZGRDYWxlbmRhck1vbnRocyh0aGlzLmNhbGVuZGFyLmFjdGl2ZURhdGUsIDEpIDpcbiAgICAgICAgICAgIHRoaXMuX2RhdGVBZGFwdGVyLmFkZENhbGVuZGFyWWVhcnMoXG4gICAgICAgICAgICAgICAgdGhpcy5jYWxlbmRhci5hY3RpdmVEYXRlLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNhbGVuZGFyLmN1cnJlbnRWaWV3ID09ICd5ZWFyJyA/IDEgOiB5ZWFyc1BlclBhZ2VcbiAgICAgICAgICAgICk7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgcHJldmlvdXMgcGVyaW9kIGJ1dHRvbiBpcyBlbmFibGVkLiAqL1xuICBwcmV2aW91c0VuYWJsZWQoKTogYm9vbGVhbiB7XG4gICAgaWYgKCF0aGlzLmNhbGVuZGFyLm1pbkRhdGUpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gIXRoaXMuY2FsZW5kYXIubWluRGF0ZSB8fFxuICAgICAgICAhdGhpcy5faXNTYW1lVmlldyh0aGlzLmNhbGVuZGFyLmFjdGl2ZURhdGUsIHRoaXMuY2FsZW5kYXIubWluRGF0ZSk7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgbmV4dCBwZXJpb2QgYnV0dG9uIGlzIGVuYWJsZWQuICovXG4gIG5leHRFbmFibGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhdGhpcy5jYWxlbmRhci5tYXhEYXRlIHx8XG4gICAgICAgICF0aGlzLl9pc1NhbWVWaWV3KHRoaXMuY2FsZW5kYXIuYWN0aXZlRGF0ZSwgdGhpcy5jYWxlbmRhci5tYXhEYXRlKTtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSB0d28gZGF0ZXMgcmVwcmVzZW50IHRoZSBzYW1lIHZpZXcgaW4gdGhlIGN1cnJlbnQgdmlldyBtb2RlIChtb250aCBvciB5ZWFyKS4gKi9cbiAgcHJpdmF0ZSBfaXNTYW1lVmlldyhkYXRlMTogRCwgZGF0ZTI6IEQpOiBib29sZWFuIHtcbiAgICBpZiAodGhpcy5jYWxlbmRhci5jdXJyZW50VmlldyA9PSAnbW9udGgnKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0WWVhcihkYXRlMSkgPT0gdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0WWVhcihkYXRlMikgJiZcbiAgICAgICAgICB0aGlzLl9kYXRlQWRhcHRlci5nZXRNb250aChkYXRlMSkgPT0gdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0TW9udGgoZGF0ZTIpO1xuICAgIH1cbiAgICBpZiAodGhpcy5jYWxlbmRhci5jdXJyZW50VmlldyA9PSAneWVhcicpIHtcbiAgICAgIHJldHVybiB0aGlzLl9kYXRlQWRhcHRlci5nZXRZZWFyKGRhdGUxKSA9PSB0aGlzLl9kYXRlQWRhcHRlci5nZXRZZWFyKGRhdGUyKTtcbiAgICB9XG4gICAgLy8gT3RoZXJ3aXNlIHdlIGFyZSBpbiAnbXVsdGkteWVhcicgdmlldy5cbiAgICByZXR1cm4gaXNTYW1lTXVsdGlZZWFyVmlldyhcbiAgICAgIHRoaXMuX2RhdGVBZGFwdGVyLCBkYXRlMSwgZGF0ZTIsIHRoaXMuY2FsZW5kYXIubWluRGF0ZSwgdGhpcy5jYWxlbmRhci5tYXhEYXRlKTtcbiAgfVxufVxuXG4vKipcbiAqIEEgY2FsZW5kYXIgdGhhdCBpcyB1c2VkIGFzIHBhcnQgb2YgdGhlIGRhdGVwaWNrZXIuXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ21hdC1jYWxlbmRhcicsXG4gIHRlbXBsYXRlVXJsOiAnY2FsZW5kYXIuaHRtbCcsXG4gIHN0eWxlVXJsczogWydjYWxlbmRhci5jc3MnXSxcbiAgaG9zdDoge1xuICAgICdjbGFzcyc6ICdtYXQtY2FsZW5kYXInLFxuICB9LFxuICBleHBvcnRBczogJ21hdENhbGVuZGFyJyxcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG4gIHByb3ZpZGVyczogW01BVF9TSU5HTEVfREFURV9TRUxFQ1RJT05fTU9ERUxfUFJPVklERVJdXG59KVxuZXhwb3J0IGNsYXNzIE1hdENhbGVuZGFyPEQ+IGltcGxlbWVudHMgQWZ0ZXJDb250ZW50SW5pdCwgQWZ0ZXJWaWV3Q2hlY2tlZCwgT25EZXN0cm95LCBPbkNoYW5nZXMge1xuICAvKiogQW4gaW5wdXQgaW5kaWNhdGluZyB0aGUgdHlwZSBvZiB0aGUgaGVhZGVyIGNvbXBvbmVudCwgaWYgc2V0LiAqL1xuICBASW5wdXQoKSBoZWFkZXJDb21wb25lbnQ6IENvbXBvbmVudFR5cGU8YW55PjtcblxuICAvKiogQSBwb3J0YWwgY29udGFpbmluZyB0aGUgaGVhZGVyIGNvbXBvbmVudCB0eXBlIGZvciB0aGlzIGNhbGVuZGFyLiAqL1xuICBfY2FsZW5kYXJIZWFkZXJQb3J0YWw6IFBvcnRhbDxhbnk+O1xuXG4gIHByaXZhdGUgX2ludGxDaGFuZ2VzOiBTdWJzY3JpcHRpb247XG5cbiAgLyoqXG4gICAqIFVzZWQgZm9yIHNjaGVkdWxpbmcgdGhhdCBmb2N1cyBzaG91bGQgYmUgbW92ZWQgdG8gdGhlIGFjdGl2ZSBjZWxsIG9uIHRoZSBuZXh0IHRpY2suXG4gICAqIFdlIG5lZWQgdG8gc2NoZWR1bGUgaXQsIHJhdGhlciB0aGFuIGRvIGl0IGltbWVkaWF0ZWx5LCBiZWNhdXNlIHdlIGhhdmUgdG8gd2FpdFxuICAgKiBmb3IgQW5ndWxhciB0byByZS1ldmFsdWF0ZSB0aGUgdmlldyBjaGlsZHJlbi5cbiAgICovXG4gIHByaXZhdGUgX21vdmVGb2N1c09uTmV4dFRpY2sgPSBmYWxzZTtcblxuICAvKiogQSBkYXRlIHJlcHJlc2VudGluZyB0aGUgcGVyaW9kIChtb250aCBvciB5ZWFyKSB0byBzdGFydCB0aGUgY2FsZW5kYXIgaW4uICovXG4gIEBJbnB1dCgpXG4gIGdldCBzdGFydEF0KCk6IEQgfCBudWxsIHsgcmV0dXJuIHRoaXMuX3N0YXJ0QXQ7IH1cbiAgc2V0IHN0YXJ0QXQodmFsdWU6IEQgfCBudWxsKSB7XG4gICAgdGhpcy5fc3RhcnRBdCA9IHRoaXMuX2RhdGVBZGFwdGVyLmdldFZhbGlkRGF0ZU9yTnVsbCh0aGlzLl9kYXRlQWRhcHRlci5kZXNlcmlhbGl6ZSh2YWx1ZSkpO1xuICB9XG4gIHByaXZhdGUgX3N0YXJ0QXQ6IEQgfCBudWxsO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBjYWxlbmRhciBzaG91bGQgYmUgc3RhcnRlZCBpbiBtb250aCBvciB5ZWFyIHZpZXcuICovXG4gIEBJbnB1dCgpIHN0YXJ0VmlldzogTWF0Q2FsZW5kYXJWaWV3ID0gJ21vbnRoJztcblxuICAvKiogVGhlIGN1cnJlbnRseSBzZWxlY3RlZCBkYXRlLiAqL1xuICBASW5wdXQoKVxuICBnZXQgc2VsZWN0ZWQoKTogRGF0ZVJhbmdlPEQ+IHwgRCB8IG51bGwgeyByZXR1cm4gdGhpcy5fc2VsZWN0ZWQ7IH1cbiAgc2V0IHNlbGVjdGVkKHZhbHVlOiBEYXRlUmFuZ2U8RD4gfCBEIHwgbnVsbCkge1xuICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIERhdGVSYW5nZSkge1xuICAgICAgdGhpcy5fc2VsZWN0ZWQgPSB2YWx1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fc2VsZWN0ZWQgPSB0aGlzLl9kYXRlQWRhcHRlci5nZXRWYWxpZERhdGVPck51bGwodGhpcy5fZGF0ZUFkYXB0ZXIuZGVzZXJpYWxpemUodmFsdWUpKTtcbiAgICB9XG4gIH1cbiAgcHJpdmF0ZSBfc2VsZWN0ZWQ6IERhdGVSYW5nZTxEPiB8IEQgfCBudWxsO1xuXG4gIC8qKiBUaGUgbWluaW11bSBzZWxlY3RhYmxlIGRhdGUuICovXG4gIEBJbnB1dCgpXG4gIGdldCBtaW5EYXRlKCk6IEQgfCBudWxsIHsgcmV0dXJuIHRoaXMuX21pbkRhdGU7IH1cbiAgc2V0IG1pbkRhdGUodmFsdWU6IEQgfCBudWxsKSB7XG4gICAgdGhpcy5fbWluRGF0ZSA9IHRoaXMuX2RhdGVBZGFwdGVyLmdldFZhbGlkRGF0ZU9yTnVsbCh0aGlzLl9kYXRlQWRhcHRlci5kZXNlcmlhbGl6ZSh2YWx1ZSkpO1xuICB9XG4gIHByaXZhdGUgX21pbkRhdGU6IEQgfCBudWxsO1xuXG4gIC8qKiBUaGUgbWF4aW11bSBzZWxlY3RhYmxlIGRhdGUuICovXG4gIEBJbnB1dCgpXG4gIGdldCBtYXhEYXRlKCk6IEQgfCBudWxsIHsgcmV0dXJuIHRoaXMuX21heERhdGU7IH1cbiAgc2V0IG1heERhdGUodmFsdWU6IEQgfCBudWxsKSB7XG4gICAgdGhpcy5fbWF4RGF0ZSA9IHRoaXMuX2RhdGVBZGFwdGVyLmdldFZhbGlkRGF0ZU9yTnVsbCh0aGlzLl9kYXRlQWRhcHRlci5kZXNlcmlhbGl6ZSh2YWx1ZSkpO1xuICB9XG4gIHByaXZhdGUgX21heERhdGU6IEQgfCBudWxsO1xuXG4gIC8qKiBGdW5jdGlvbiB1c2VkIHRvIGZpbHRlciB3aGljaCBkYXRlcyBhcmUgc2VsZWN0YWJsZS4gKi9cbiAgQElucHV0KCkgZGF0ZUZpbHRlcjogKGRhdGU6IEQpID0+IGJvb2xlYW47XG5cbiAgLyoqIEZ1bmN0aW9uIHRoYXQgY2FuIGJlIHVzZWQgdG8gYWRkIGN1c3RvbSBDU1MgY2xhc3NlcyB0byBkYXRlcy4gKi9cbiAgQElucHV0KCkgZGF0ZUNsYXNzOiBNYXRDYWxlbmRhckNlbGxDbGFzc0Z1bmN0aW9uPEQ+O1xuXG4gIC8qKiBTdGFydCBvZiB0aGUgY29tcGFyaXNvbiByYW5nZS4gKi9cbiAgQElucHV0KCkgY29tcGFyaXNvblN0YXJ0OiBEIHwgbnVsbDtcblxuICAvKiogRW5kIG9mIHRoZSBjb21wYXJpc29uIHJhbmdlLiAqL1xuICBASW5wdXQoKSBjb21wYXJpc29uRW5kOiBEIHwgbnVsbDtcblxuICAvKiogRW1pdHMgd2hlbiB0aGUgY3VycmVudGx5IHNlbGVjdGVkIGRhdGUgY2hhbmdlcy4gKi9cbiAgQE91dHB1dCgpIHJlYWRvbmx5IHNlbGVjdGVkQ2hhbmdlOiBFdmVudEVtaXR0ZXI8RCB8IG51bGw+ID0gbmV3IEV2ZW50RW1pdHRlcjxEIHwgbnVsbD4oKTtcblxuICAvKipcbiAgICogRW1pdHMgdGhlIHllYXIgY2hvc2VuIGluIG11bHRpeWVhciB2aWV3LlxuICAgKiBUaGlzIGRvZXNuJ3QgaW1wbHkgYSBjaGFuZ2Ugb24gdGhlIHNlbGVjdGVkIGRhdGUuXG4gICAqL1xuICBAT3V0cHV0KCkgcmVhZG9ubHkgeWVhclNlbGVjdGVkOiBFdmVudEVtaXR0ZXI8RD4gPSBuZXcgRXZlbnRFbWl0dGVyPEQ+KCk7XG5cbiAgLyoqXG4gICAqIEVtaXRzIHRoZSBtb250aCBjaG9zZW4gaW4geWVhciB2aWV3LlxuICAgKiBUaGlzIGRvZXNuJ3QgaW1wbHkgYSBjaGFuZ2Ugb24gdGhlIHNlbGVjdGVkIGRhdGUuXG4gICAqL1xuICBAT3V0cHV0KCkgcmVhZG9ubHkgbW9udGhTZWxlY3RlZDogRXZlbnRFbWl0dGVyPEQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxEPigpO1xuXG4gIC8qKlxuICAgKiBFbWl0cyB3aGVuIHRoZSBjdXJyZW50IHZpZXcgY2hhbmdlcy5cbiAgICovXG4gIEBPdXRwdXQoKSByZWFkb25seSB2aWV3Q2hhbmdlZDogRXZlbnRFbWl0dGVyPE1hdENhbGVuZGFyVmlldz4gPVxuICAgIG5ldyBFdmVudEVtaXR0ZXI8TWF0Q2FsZW5kYXJWaWV3Pih0cnVlKTtcblxuICAvKiogRW1pdHMgd2hlbiBhbnkgZGF0ZSBpcyBzZWxlY3RlZC4gKi9cbiAgQE91dHB1dCgpIHJlYWRvbmx5IF91c2VyU2VsZWN0aW9uOiBFdmVudEVtaXR0ZXI8TWF0Q2FsZW5kYXJVc2VyRXZlbnQ8RCB8IG51bGw+PiA9XG4gICAgICBuZXcgRXZlbnRFbWl0dGVyPE1hdENhbGVuZGFyVXNlckV2ZW50PEQgfCBudWxsPj4oKTtcblxuICAvKiogUmVmZXJlbmNlIHRvIHRoZSBjdXJyZW50IG1vbnRoIHZpZXcgY29tcG9uZW50LiAqL1xuICBAVmlld0NoaWxkKE1hdE1vbnRoVmlldykgbW9udGhWaWV3OiBNYXRNb250aFZpZXc8RD47XG5cbiAgLyoqIFJlZmVyZW5jZSB0byB0aGUgY3VycmVudCB5ZWFyIHZpZXcgY29tcG9uZW50LiAqL1xuICBAVmlld0NoaWxkKE1hdFllYXJWaWV3KSB5ZWFyVmlldzogTWF0WWVhclZpZXc8RD47XG5cbiAgLyoqIFJlZmVyZW5jZSB0byB0aGUgY3VycmVudCBtdWx0aS15ZWFyIHZpZXcgY29tcG9uZW50LiAqL1xuICBAVmlld0NoaWxkKE1hdE11bHRpWWVhclZpZXcpIG11bHRpWWVhclZpZXc6IE1hdE11bHRpWWVhclZpZXc8RD47XG5cbiAgLyoqXG4gICAqIFRoZSBjdXJyZW50IGFjdGl2ZSBkYXRlLiBUaGlzIGRldGVybWluZXMgd2hpY2ggdGltZSBwZXJpb2QgaXMgc2hvd24gYW5kIHdoaWNoIGRhdGUgaXNcbiAgICogaGlnaGxpZ2h0ZWQgd2hlbiB1c2luZyBrZXlib2FyZCBuYXZpZ2F0aW9uLlxuICAgKi9cbiAgZ2V0IGFjdGl2ZURhdGUoKTogRCB7IHJldHVybiB0aGlzLl9jbGFtcGVkQWN0aXZlRGF0ZTsgfVxuICBzZXQgYWN0aXZlRGF0ZSh2YWx1ZTogRCkge1xuICAgIHRoaXMuX2NsYW1wZWRBY3RpdmVEYXRlID0gdGhpcy5fZGF0ZUFkYXB0ZXIuY2xhbXBEYXRlKHZhbHVlLCB0aGlzLm1pbkRhdGUsIHRoaXMubWF4RGF0ZSk7XG4gICAgdGhpcy5zdGF0ZUNoYW5nZXMubmV4dCgpO1xuICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xuICB9XG4gIHByaXZhdGUgX2NsYW1wZWRBY3RpdmVEYXRlOiBEO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBjYWxlbmRhciBpcyBpbiBtb250aCB2aWV3LiAqL1xuICBnZXQgY3VycmVudFZpZXcoKTogTWF0Q2FsZW5kYXJWaWV3IHsgcmV0dXJuIHRoaXMuX2N1cnJlbnRWaWV3OyB9XG4gIHNldCBjdXJyZW50Vmlldyh2YWx1ZTogTWF0Q2FsZW5kYXJWaWV3KSB7XG4gICAgY29uc3Qgdmlld0NoYW5nZWRSZXN1bHQgPSB0aGlzLl9jdXJyZW50VmlldyAhPT0gdmFsdWUgPyB2YWx1ZSA6IG51bGw7XG4gICAgdGhpcy5fY3VycmVudFZpZXcgPSB2YWx1ZTtcbiAgICB0aGlzLl9tb3ZlRm9jdXNPbk5leHRUaWNrID0gdHJ1ZTtcbiAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKTtcbiAgICBpZiAodmlld0NoYW5nZWRSZXN1bHQpIHtcbiAgICAgIHRoaXMudmlld0NoYW5nZWQuZW1pdCh2aWV3Q2hhbmdlZFJlc3VsdCk7XG4gICAgfVxuICB9XG4gIHByaXZhdGUgX2N1cnJlbnRWaWV3OiBNYXRDYWxlbmRhclZpZXc7XG5cbiAgLyoqXG4gICAqIEVtaXRzIHdoZW5ldmVyIHRoZXJlIGlzIGEgc3RhdGUgY2hhbmdlIHRoYXQgdGhlIGhlYWRlciBtYXkgbmVlZCB0byByZXNwb25kIHRvLlxuICAgKi9cbiAgcmVhZG9ubHkgc3RhdGVDaGFuZ2VzID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcblxuICBjb25zdHJ1Y3RvcihfaW50bDogTWF0RGF0ZXBpY2tlckludGwsXG4gICAgICAgICAgICAgIEBPcHRpb25hbCgpIHByaXZhdGUgX2RhdGVBZGFwdGVyOiBEYXRlQWRhcHRlcjxEPixcbiAgICAgICAgICAgICAgQE9wdGlvbmFsKCkgQEluamVjdChNQVRfREFURV9GT1JNQVRTKSBwcml2YXRlIF9kYXRlRm9ybWF0czogTWF0RGF0ZUZvcm1hdHMsXG4gICAgICAgICAgICAgIHByaXZhdGUgX2NoYW5nZURldGVjdG9yUmVmOiBDaGFuZ2VEZXRlY3RvclJlZikge1xuXG4gICAgaWYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkge1xuICAgICAgaWYgKCF0aGlzLl9kYXRlQWRhcHRlcikge1xuICAgICAgICB0aHJvdyBjcmVhdGVNaXNzaW5nRGF0ZUltcGxFcnJvcignRGF0ZUFkYXB0ZXInKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCF0aGlzLl9kYXRlRm9ybWF0cykge1xuICAgICAgICB0aHJvdyBjcmVhdGVNaXNzaW5nRGF0ZUltcGxFcnJvcignTUFUX0RBVEVfRk9STUFUUycpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuX2ludGxDaGFuZ2VzID0gX2ludGwuY2hhbmdlcy5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgX2NoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xuICAgICAgdGhpcy5zdGF0ZUNoYW5nZXMubmV4dCgpO1xuICAgIH0pO1xuICB9XG5cbiAgbmdBZnRlckNvbnRlbnRJbml0KCkge1xuICAgIHRoaXMuX2NhbGVuZGFySGVhZGVyUG9ydGFsID0gbmV3IENvbXBvbmVudFBvcnRhbCh0aGlzLmhlYWRlckNvbXBvbmVudCB8fCBNYXRDYWxlbmRhckhlYWRlcik7XG4gICAgdGhpcy5hY3RpdmVEYXRlID0gdGhpcy5zdGFydEF0IHx8IHRoaXMuX2RhdGVBZGFwdGVyLnRvZGF5KCk7XG5cbiAgICAvLyBBc3NpZ24gdG8gdGhlIHByaXZhdGUgcHJvcGVydHkgc2luY2Ugd2UgZG9uJ3Qgd2FudCB0byBtb3ZlIGZvY3VzIG9uIGluaXQuXG4gICAgdGhpcy5fY3VycmVudFZpZXcgPSB0aGlzLnN0YXJ0VmlldztcbiAgfVxuXG4gIG5nQWZ0ZXJWaWV3Q2hlY2tlZCgpIHtcbiAgICBpZiAodGhpcy5fbW92ZUZvY3VzT25OZXh0VGljaykge1xuICAgICAgdGhpcy5fbW92ZUZvY3VzT25OZXh0VGljayA9IGZhbHNlO1xuICAgICAgdGhpcy5mb2N1c0FjdGl2ZUNlbGwoKTtcbiAgICB9XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLl9pbnRsQ2hhbmdlcy51bnN1YnNjcmliZSgpO1xuICAgIHRoaXMuc3RhdGVDaGFuZ2VzLmNvbXBsZXRlKCk7XG4gIH1cblxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XG4gICAgY29uc3QgY2hhbmdlID1cbiAgICAgICAgY2hhbmdlc1snbWluRGF0ZSddIHx8IGNoYW5nZXNbJ21heERhdGUnXSB8fCBjaGFuZ2VzWydkYXRlRmlsdGVyJ107XG5cbiAgICBpZiAoY2hhbmdlICYmICFjaGFuZ2UuZmlyc3RDaGFuZ2UpIHtcbiAgICAgIGNvbnN0IHZpZXcgPSB0aGlzLl9nZXRDdXJyZW50Vmlld0NvbXBvbmVudCgpO1xuXG4gICAgICBpZiAodmlldykge1xuICAgICAgICAvLyBXZSBuZWVkIHRvIGBkZXRlY3RDaGFuZ2VzYCBtYW51YWxseSBoZXJlLCBiZWNhdXNlIHRoZSBgbWluRGF0ZWAsIGBtYXhEYXRlYCBldGMuIGFyZVxuICAgICAgICAvLyBwYXNzZWQgZG93biB0byB0aGUgdmlldyB2aWEgZGF0YSBiaW5kaW5ncyB3aGljaCB3b24ndCBiZSB1cC10by1kYXRlIHdoZW4gd2UgY2FsbCBgX2luaXRgLlxuICAgICAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5kZXRlY3RDaGFuZ2VzKCk7XG4gICAgICAgIHZpZXcuX2luaXQoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnN0YXRlQ2hhbmdlcy5uZXh0KCk7XG4gIH1cblxuICBmb2N1c0FjdGl2ZUNlbGwoKSB7XG4gICAgdGhpcy5fZ2V0Q3VycmVudFZpZXdDb21wb25lbnQoKS5fZm9jdXNBY3RpdmVDZWxsKGZhbHNlKTtcbiAgfVxuXG4gIC8qKiBVcGRhdGVzIHRvZGF5J3MgZGF0ZSBhZnRlciBhbiB1cGRhdGUgb2YgdGhlIGFjdGl2ZSBkYXRlICovXG4gIHVwZGF0ZVRvZGF5c0RhdGUoKSB7XG4gICAgY29uc3QgY3VycmVudFZpZXcgPSB0aGlzLmN1cnJlbnRWaWV3O1xuICAgIGxldCB2aWV3OiBNYXRNb250aFZpZXc8RD4gfCBNYXRZZWFyVmlldzxEPiB8IE1hdE11bHRpWWVhclZpZXc8RD47XG5cbiAgICBpZiAoY3VycmVudFZpZXcgPT09ICdtb250aCcpIHtcbiAgICAgIHZpZXcgPSB0aGlzLm1vbnRoVmlldztcbiAgICB9IGVsc2UgaWYgKGN1cnJlbnRWaWV3ID09PSAneWVhcicpIHtcbiAgICAgIHZpZXcgPSB0aGlzLnllYXJWaWV3O1xuICAgIH0gZWxzZSB7XG4gICAgICB2aWV3ID0gdGhpcy5tdWx0aVllYXJWaWV3O1xuICAgIH1cblxuICAgIHZpZXcuX2luaXQoKTtcbiAgfVxuXG4gIC8qKiBIYW5kbGVzIGRhdGUgc2VsZWN0aW9uIGluIHRoZSBtb250aCB2aWV3LiAqL1xuICBfZGF0ZVNlbGVjdGVkKGV2ZW50OiBNYXRDYWxlbmRhclVzZXJFdmVudDxEIHwgbnVsbD4pOiB2b2lkIHtcbiAgICBjb25zdCBkYXRlID0gZXZlbnQudmFsdWU7XG5cbiAgICBpZiAodGhpcy5zZWxlY3RlZCBpbnN0YW5jZW9mIERhdGVSYW5nZSB8fFxuICAgICAgICAoZGF0ZSAmJiAhdGhpcy5fZGF0ZUFkYXB0ZXIuc2FtZURhdGUoZGF0ZSwgdGhpcy5zZWxlY3RlZCkpKSB7XG4gICAgICB0aGlzLnNlbGVjdGVkQ2hhbmdlLmVtaXQoZGF0ZSk7XG4gICAgfVxuXG4gICAgdGhpcy5fdXNlclNlbGVjdGlvbi5lbWl0KGV2ZW50KTtcbiAgfVxuXG4gIC8qKiBIYW5kbGVzIHllYXIgc2VsZWN0aW9uIGluIHRoZSBtdWx0aXllYXIgdmlldy4gKi9cbiAgX3llYXJTZWxlY3RlZEluTXVsdGlZZWFyVmlldyhub3JtYWxpemVkWWVhcjogRCkge1xuICAgIHRoaXMueWVhclNlbGVjdGVkLmVtaXQobm9ybWFsaXplZFllYXIpO1xuICB9XG5cbiAgLyoqIEhhbmRsZXMgbW9udGggc2VsZWN0aW9uIGluIHRoZSB5ZWFyIHZpZXcuICovXG4gIF9tb250aFNlbGVjdGVkSW5ZZWFyVmlldyhub3JtYWxpemVkTW9udGg6IEQpIHtcbiAgICB0aGlzLm1vbnRoU2VsZWN0ZWQuZW1pdChub3JtYWxpemVkTW9udGgpO1xuICB9XG5cbiAgLyoqIEhhbmRsZXMgeWVhci9tb250aCBzZWxlY3Rpb24gaW4gdGhlIG11bHRpLXllYXIveWVhciB2aWV3cy4gKi9cbiAgX2dvVG9EYXRlSW5WaWV3KGRhdGU6IEQsIHZpZXc6ICdtb250aCcgfCAneWVhcicgfCAnbXVsdGkteWVhcicpOiB2b2lkIHtcbiAgICB0aGlzLmFjdGl2ZURhdGUgPSBkYXRlO1xuICAgIHRoaXMuY3VycmVudFZpZXcgPSB2aWV3O1xuICB9XG5cbiAgLyoqIFJldHVybnMgdGhlIGNvbXBvbmVudCBpbnN0YW5jZSB0aGF0IGNvcnJlc3BvbmRzIHRvIHRoZSBjdXJyZW50IGNhbGVuZGFyIHZpZXcuICovXG4gIHByaXZhdGUgX2dldEN1cnJlbnRWaWV3Q29tcG9uZW50KCkge1xuICAgIHJldHVybiB0aGlzLm1vbnRoVmlldyB8fCB0aGlzLnllYXJWaWV3IHx8IHRoaXMubXVsdGlZZWFyVmlldztcbiAgfVxufVxuIl19