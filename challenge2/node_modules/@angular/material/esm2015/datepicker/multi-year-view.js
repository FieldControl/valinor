/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { DOWN_ARROW, END, ENTER, HOME, LEFT_ARROW, PAGE_DOWN, PAGE_UP, RIGHT_ARROW, UP_ARROW, SPACE, } from '@angular/cdk/keycodes';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Optional, Output, ViewChild, ViewEncapsulation, } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { Directionality } from '@angular/cdk/bidi';
import { MatCalendarBody, MatCalendarCell, } from './calendar-body';
import { createMissingDateImplError } from './datepicker-errors';
import { Subscription } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { DateRange } from './date-selection-model';
export const yearsPerPage = 24;
export const yearsPerRow = 4;
/**
 * An internal component used to display a year selector in the datepicker.
 * @docs-private
 */
export class MatMultiYearView {
    constructor(_changeDetectorRef, _dateAdapter, _dir) {
        this._changeDetectorRef = _changeDetectorRef;
        this._dateAdapter = _dateAdapter;
        this._dir = _dir;
        this._rerenderSubscription = Subscription.EMPTY;
        /** Emits when a new year is selected. */
        this.selectedChange = new EventEmitter();
        /** Emits the selected year. This doesn't imply a change on the selected date */
        this.yearSelected = new EventEmitter();
        /** Emits when any date is activated. */
        this.activeDateChange = new EventEmitter();
        if (!this._dateAdapter && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw createMissingDateImplError('DateAdapter');
        }
        this._activeDate = this._dateAdapter.today();
    }
    /** The date to display in this multi-year view (everything other than the year is ignored). */
    get activeDate() { return this._activeDate; }
    set activeDate(value) {
        let oldActiveDate = this._activeDate;
        const validDate = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value)) || this._dateAdapter.today();
        this._activeDate = this._dateAdapter.clampDate(validDate, this.minDate, this.maxDate);
        if (!isSameMultiYearView(this._dateAdapter, oldActiveDate, this._activeDate, this.minDate, this.maxDate)) {
            this._init();
        }
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
        this._setSelectedYear(value);
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
    ngAfterContentInit() {
        this._rerenderSubscription = this._dateAdapter.localeChanges
            .pipe(startWith(null))
            .subscribe(() => this._init());
    }
    ngOnDestroy() {
        this._rerenderSubscription.unsubscribe();
    }
    /** Initializes this multi-year view. */
    _init() {
        this._todayYear = this._dateAdapter.getYear(this._dateAdapter.today());
        // We want a range years such that we maximize the number of
        // enabled dates visible at once. This prevents issues where the minimum year
        // is the last item of a page OR the maximum year is the first item of a page.
        // The offset from the active year to the "slot" for the starting year is the
        // *actual* first rendered year in the multi-year view.
        const activeYear = this._dateAdapter.getYear(this._activeDate);
        const minYearOfPage = activeYear - getActiveOffset(this._dateAdapter, this.activeDate, this.minDate, this.maxDate);
        this._years = [];
        for (let i = 0, row = []; i < yearsPerPage; i++) {
            row.push(minYearOfPage + i);
            if (row.length == yearsPerRow) {
                this._years.push(row.map(year => this._createCellForYear(year)));
                row = [];
            }
        }
        this._changeDetectorRef.markForCheck();
    }
    /** Handles when a new year is selected. */
    _yearSelected(event) {
        const year = event.value;
        this.yearSelected.emit(this._dateAdapter.createDate(year, 0, 1));
        let month = this._dateAdapter.getMonth(this.activeDate);
        let daysInMonth = this._dateAdapter.getNumDaysInMonth(this._dateAdapter.createDate(year, month, 1));
        this.selectedChange.emit(this._dateAdapter.createDate(year, month, Math.min(this._dateAdapter.getDate(this.activeDate), daysInMonth)));
    }
    /** Handles keydown events on the calendar body when calendar is in multi-year view. */
    _handleCalendarBodyKeydown(event) {
        const oldActiveDate = this._activeDate;
        const isRtl = this._isRtl();
        switch (event.keyCode) {
            case LEFT_ARROW:
                this.activeDate = this._dateAdapter.addCalendarYears(this._activeDate, isRtl ? 1 : -1);
                break;
            case RIGHT_ARROW:
                this.activeDate = this._dateAdapter.addCalendarYears(this._activeDate, isRtl ? -1 : 1);
                break;
            case UP_ARROW:
                this.activeDate = this._dateAdapter.addCalendarYears(this._activeDate, -yearsPerRow);
                break;
            case DOWN_ARROW:
                this.activeDate = this._dateAdapter.addCalendarYears(this._activeDate, yearsPerRow);
                break;
            case HOME:
                this.activeDate = this._dateAdapter.addCalendarYears(this._activeDate, -getActiveOffset(this._dateAdapter, this.activeDate, this.minDate, this.maxDate));
                break;
            case END:
                this.activeDate = this._dateAdapter.addCalendarYears(this._activeDate, yearsPerPage - getActiveOffset(this._dateAdapter, this.activeDate, this.minDate, this.maxDate) - 1);
                break;
            case PAGE_UP:
                this.activeDate =
                    this._dateAdapter.addCalendarYears(this._activeDate, event.altKey ? -yearsPerPage * 10 : -yearsPerPage);
                break;
            case PAGE_DOWN:
                this.activeDate =
                    this._dateAdapter.addCalendarYears(this._activeDate, event.altKey ? yearsPerPage * 10 : yearsPerPage);
                break;
            case ENTER:
            case SPACE:
                this._yearSelected({ value: this._dateAdapter.getYear(this._activeDate), event });
                break;
            default:
                // Don't prevent default or focus active cell on keys that we don't explicitly handle.
                return;
        }
        if (this._dateAdapter.compareDate(oldActiveDate, this.activeDate)) {
            this.activeDateChange.emit(this.activeDate);
        }
        this._focusActiveCell();
        // Prevent unexpected default actions such as form submission.
        event.preventDefault();
    }
    _getActiveCell() {
        return getActiveOffset(this._dateAdapter, this.activeDate, this.minDate, this.maxDate);
    }
    /** Focuses the active cell after the microtask queue is empty. */
    _focusActiveCell() {
        this._matCalendarBody._focusActiveCell();
    }
    /** Creates an MatCalendarCell for the given year. */
    _createCellForYear(year) {
        const date = this._dateAdapter.createDate(year, 0, 1);
        const yearName = this._dateAdapter.getYearName(date);
        const cellClasses = this.dateClass ? this.dateClass(date, 'multi-year') : undefined;
        return new MatCalendarCell(year, yearName, yearName, this._shouldEnableYear(year), cellClasses);
    }
    /** Whether the given year is enabled. */
    _shouldEnableYear(year) {
        // disable if the year is greater than maxDate lower than minDate
        if (year === undefined || year === null ||
            (this.maxDate && year > this._dateAdapter.getYear(this.maxDate)) ||
            (this.minDate && year < this._dateAdapter.getYear(this.minDate))) {
            return false;
        }
        // enable if it reaches here and there's no filter defined
        if (!this.dateFilter) {
            return true;
        }
        const firstOfYear = this._dateAdapter.createDate(year, 0, 1);
        // If any date in the year is enabled count the year as enabled.
        for (let date = firstOfYear; this._dateAdapter.getYear(date) == year; date = this._dateAdapter.addCalendarDays(date, 1)) {
            if (this.dateFilter(date)) {
                return true;
            }
        }
        return false;
    }
    /** Determines whether the user has the RTL layout direction. */
    _isRtl() {
        return this._dir && this._dir.value === 'rtl';
    }
    /** Sets the currently-highlighted year based on a model value. */
    _setSelectedYear(value) {
        this._selectedYear = null;
        if (value instanceof DateRange) {
            const displayValue = value.start || value.end;
            if (displayValue) {
                this._selectedYear = this._dateAdapter.getYear(displayValue);
            }
        }
        else if (value) {
            this._selectedYear = this._dateAdapter.getYear(value);
        }
    }
}
MatMultiYearView.decorators = [
    { type: Component, args: [{
                selector: 'mat-multi-year-view',
                template: "<table class=\"mat-calendar-table\" role=\"presentation\">\n  <thead class=\"mat-calendar-table-header\">\n    <tr><th class=\"mat-calendar-table-header-divider\" colspan=\"4\"></th></tr>\n  </thead>\n  <tbody mat-calendar-body\n         [rows]=\"_years\"\n         [todayValue]=\"_todayYear\"\n         [startValue]=\"_selectedYear!\"\n         [endValue]=\"_selectedYear!\"\n         [numCols]=\"4\"\n         [cellAspectRatio]=\"4 / 7\"\n         [activeCell]=\"_getActiveCell()\"\n         (selectedValueChange)=\"_yearSelected($event)\"\n         (keydown)=\"_handleCalendarBodyKeydown($event)\">\n  </tbody>\n</table>\n",
                exportAs: 'matMultiYearView',
                encapsulation: ViewEncapsulation.None,
                changeDetection: ChangeDetectionStrategy.OnPush
            },] }
];
MatMultiYearView.ctorParameters = () => [
    { type: ChangeDetectorRef },
    { type: DateAdapter, decorators: [{ type: Optional }] },
    { type: Directionality, decorators: [{ type: Optional }] }
];
MatMultiYearView.propDecorators = {
    activeDate: [{ type: Input }],
    selected: [{ type: Input }],
    minDate: [{ type: Input }],
    maxDate: [{ type: Input }],
    dateFilter: [{ type: Input }],
    dateClass: [{ type: Input }],
    selectedChange: [{ type: Output }],
    yearSelected: [{ type: Output }],
    activeDateChange: [{ type: Output }],
    _matCalendarBody: [{ type: ViewChild, args: [MatCalendarBody,] }]
};
export function isSameMultiYearView(dateAdapter, date1, date2, minDate, maxDate) {
    const year1 = dateAdapter.getYear(date1);
    const year2 = dateAdapter.getYear(date2);
    const startingYear = getStartingYear(dateAdapter, minDate, maxDate);
    return Math.floor((year1 - startingYear) / yearsPerPage) ===
        Math.floor((year2 - startingYear) / yearsPerPage);
}
/**
 * When the multi-year view is first opened, the active year will be in view.
 * So we compute how many years are between the active year and the *slot* where our
 * "startingYear" will render when paged into view.
 */
export function getActiveOffset(dateAdapter, activeDate, minDate, maxDate) {
    const activeYear = dateAdapter.getYear(activeDate);
    return euclideanModulo((activeYear - getStartingYear(dateAdapter, minDate, maxDate)), yearsPerPage);
}
/**
 * We pick a "starting" year such that either the maximum year would be at the end
 * or the minimum year would be at the beginning of a page.
 */
function getStartingYear(dateAdapter, minDate, maxDate) {
    let startingYear = 0;
    if (maxDate) {
        const maxYear = dateAdapter.getYear(maxDate);
        startingYear = maxYear - yearsPerPage + 1;
    }
    else if (minDate) {
        startingYear = dateAdapter.getYear(minDate);
    }
    return startingYear;
}
/** Gets remainder that is non-negative, even if first number is negative */
function euclideanModulo(a, b) {
    return (a % b + b) % b;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXVsdGkteWVhci12aWV3LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL2RhdGVwaWNrZXIvbXVsdGkteWVhci12aWV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFDTCxVQUFVLEVBQ1YsR0FBRyxFQUNILEtBQUssRUFDTCxJQUFJLEVBQ0osVUFBVSxFQUNWLFNBQVMsRUFDVCxPQUFPLEVBQ1AsV0FBVyxFQUNYLFFBQVEsRUFDUixLQUFLLEdBQ04sTUFBTSx1QkFBdUIsQ0FBQztBQUMvQixPQUFPLEVBRUwsdUJBQXVCLEVBQ3ZCLGlCQUFpQixFQUNqQixTQUFTLEVBQ1QsWUFBWSxFQUNaLEtBQUssRUFDTCxRQUFRLEVBQ1IsTUFBTSxFQUNOLFNBQVMsRUFDVCxpQkFBaUIsR0FFbEIsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQ25ELE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNqRCxPQUFPLEVBQ0wsZUFBZSxFQUNmLGVBQWUsR0FHaEIsTUFBTSxpQkFBaUIsQ0FBQztBQUN6QixPQUFPLEVBQUMsMEJBQTBCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUMvRCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQ2xDLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUN6QyxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFFakQsTUFBTSxDQUFDLE1BQU0sWUFBWSxHQUFHLEVBQUUsQ0FBQztBQUUvQixNQUFNLENBQUMsTUFBTSxXQUFXLEdBQUcsQ0FBQyxDQUFDO0FBRTdCOzs7R0FHRztBQVFILE1BQU0sT0FBTyxnQkFBZ0I7SUErRTNCLFlBQW9CLGtCQUFxQyxFQUMxQixZQUE0QixFQUMzQixJ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aUI7SUFDaEYsTUFBTSxVQUFVLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNuRCxPQUFPLGVBQWUsQ0FBQyxDQUFDLFVBQVUsR0FBRyxlQUFlLENBQUMsV0FBVyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUNsRixZQUFZLENBQUMsQ0FBQztBQUNsQixDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBUyxlQUFlLENBQ3RCLFdBQTJCLEVBQUUsT0FBaUIsRUFBRSxPQUFpQjtJQUNqRSxJQUFJLFlBQVksR0FBRyxDQUFDLENBQUM7SUFDckIsSUFBSSxPQUFPLEVBQUU7UUFDWCxNQUFNLE9BQU8sR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzdDLFlBQVksR0FBRyxPQUFPLEdBQUcsWUFBWSxHQUFHLENBQUMsQ0FBQztLQUMzQztTQUFNLElBQUksT0FBTyxFQUFFO1FBQ2xCLFlBQVksR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQzdDO0lBQ0QsT0FBTyxZQUFZLENBQUM7QUFDdEIsQ0FBQztBQUVELDRFQUE0RTtBQUM1RSxTQUFTLGVBQWUsQ0FBRSxDQUFTLEVBQUUsQ0FBUztJQUM1QyxPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDekIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBET1dOX0FSUk9XLFxuICBFTkQsXG4gIEVOVEVSLFxuICBIT01FLFxuICBMRUZUX0FSUk9XLFxuICBQQUdFX0RPV04sXG4gIFBBR0VfVVAsXG4gIFJJR0hUX0FSUk9XLFxuICBVUF9BUlJPVyxcbiAgU1BBQ0UsXG59IGZyb20gJ0Bhbmd1bGFyL2Nkay9rZXljb2Rlcyc7XG5pbXBvcnQge1xuICBBZnRlckNvbnRlbnRJbml0LFxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gIENvbXBvbmVudCxcbiAgRXZlbnRFbWl0dGVyLFxuICBJbnB1dCxcbiAgT3B0aW9uYWwsXG4gIE91dHB1dCxcbiAgVmlld0NoaWxkLFxuICBWaWV3RW5jYXBzdWxhdGlvbixcbiAgT25EZXN0cm95LFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7RGF0ZUFkYXB0ZXJ9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2NvcmUnO1xuaW1wb3J0IHtEaXJlY3Rpb25hbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHtcbiAgTWF0Q2FsZW5kYXJCb2R5LFxuICBNYXRDYWxlbmRhckNlbGwsXG4gIE1hdENhbGVuZGFyVXNlckV2ZW50LFxuICBNYXRDYWxlbmRhckNlbGxDbGFzc0Z1bmN0aW9uLFxufSBmcm9tICcuL2NhbGVuZGFyLWJvZHknO1xuaW1wb3J0IHtjcmVhdGVNaXNzaW5nRGF0ZUltcGxFcnJvcn0gZnJvbSAnLi9kYXRlcGlja2VyLWVycm9ycyc7XG5pbXBvcnQge1N1YnNjcmlwdGlvbn0gZnJvbSAncnhqcyc7XG5pbXBvcnQge3N0YXJ0V2l0aH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHtEYXRlUmFuZ2V9IGZyb20gJy4vZGF0ZS1zZWxlY3Rpb24tbW9kZWwnO1xuXG5leHBvcnQgY29uc3QgeWVhcnNQZXJQYWdlID0gMjQ7XG5cbmV4cG9ydCBjb25zdCB5ZWFyc1BlclJvdyA9IDQ7XG5cbi8qKlxuICogQW4gaW50ZXJuYWwgY29tcG9uZW50IHVzZWQgdG8gZGlzcGxheSBhIHllYXIgc2VsZWN0b3IgaW4gdGhlIGRhdGVwaWNrZXIuXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ21hdC1tdWx0aS15ZWFyLXZpZXcnLFxuICB0ZW1wbGF0ZVVybDogJ211bHRpLXllYXItdmlldy5odG1sJyxcbiAgZXhwb3J0QXM6ICdtYXRNdWx0aVllYXJWaWV3JyxcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2hcbn0pXG5leHBvcnQgY2xhc3MgTWF0TXVsdGlZZWFyVmlldzxEPiBpbXBsZW1lbnRzIEFmdGVyQ29udGVudEluaXQsIE9uRGVzdHJveSB7XG4gIHByaXZhdGUgX3JlcmVuZGVyU3Vic2NyaXB0aW9uID0gU3Vic2NyaXB0aW9uLkVNUFRZO1xuXG4gIC8qKiBUaGUgZGF0ZSB0byBkaXNwbGF5IGluIHRoaXMgbXVsdGkteWVhciB2aWV3IChldmVyeXRoaW5nIG90aGVyIHRoYW4gdGhlIHllYXIgaXMgaWdub3JlZCkuICovXG4gIEBJbnB1dCgpXG4gIGdldCBhY3RpdmVEYXRlKCk6IEQgeyByZXR1cm4gdGhpcy5fYWN0aXZlRGF0ZTsgfVxuICBzZXQgYWN0aXZlRGF0ZSh2YWx1ZTogRCkge1xuICAgIGxldCBvbGRBY3RpdmVEYXRlID0gdGhpcy5fYWN0aXZlRGF0ZTtcbiAgICBjb25zdCB2YWxpZERhdGUgPVxuICAgICAgdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0VmFsaWREYXRlT3JOdWxsKFxuICAgICAgICB0aGlzLl9kYXRlQWRhcHRlci5kZXNlcmlhbGl6ZSh2YWx1ZSlcbiAgICAgICkgfHwgdGhpcy5fZGF0ZUFkYXB0ZXIudG9kYXkoKTtcbiAgICB0aGlzLl9hY3RpdmVEYXRlID0gdGhpcy5fZGF0ZUFkYXB0ZXIuY2xhbXBEYXRlKHZhbGlkRGF0ZSwgdGhpcy5taW5EYXRlLCB0aGlzLm1heERhdGUpO1xuXG4gICAgaWYgKCFpc1NhbWVNdWx0aVllYXJWaWV3KFxuICAgICAgdGhpcy5fZGF0ZUFkYXB0ZXIsIG9sZEFjdGl2ZURhdGUsIHRoaXMuX2FjdGl2ZURhdGUsIHRoaXMubWluRGF0ZSwgdGhpcy5tYXhEYXRlKSkge1xuICAgICAgdGhpcy5faW5pdCgpO1xuICAgIH1cbiAgfVxuICBwcml2YXRlIF9hY3RpdmVEYXRlOiBEO1xuXG4gIC8qKiBUaGUgY3VycmVudGx5IHNlbGVjdGVkIGRhdGUuICovXG4gIEBJbnB1dCgpXG4gIGdldCBzZWxlY3RlZCgpOiBEYXRlUmFuZ2U8RD4gfCBEIHwgbnVsbCB7IHJldHVybiB0aGlzLl9zZWxlY3RlZDsgfVxuICBzZXQgc2VsZWN0ZWQodmFsdWU6IERhdGVSYW5nZTxEPiB8IEQgfCBudWxsKSB7XG4gICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgRGF0ZVJhbmdlKSB7XG4gICAgICB0aGlzLl9zZWxlY3RlZCA9IHZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9zZWxlY3RlZCA9IHRoaXMuX2RhdGVBZGFwdGVyLmdldFZhbGlkRGF0ZU9yTnVsbCh0aGlzLl9kYXRlQWRhcHRlci5kZXNlcmlhbGl6ZSh2YWx1ZSkpO1xuICAgIH1cblxuICAgIHRoaXMuX3NldFNlbGVjdGVkWWVhcih2YWx1ZSk7XG4gIH1cbiAgcHJpdmF0ZSBfc2VsZWN0ZWQ6IERhdGVSYW5nZTxEPiB8IEQgfCBudWxsO1xuXG5cbiAgLyoqIFRoZSBtaW5pbXVtIHNlbGVjdGFibGUgZGF0ZS4gKi9cbiAgQElucHV0KClcbiAgZ2V0IG1pbkRhdGUoKTogRCB8IG51bGwgeyByZXR1cm4gdGhpcy5fbWluRGF0ZTsgfVxuICBzZXQgbWluRGF0ZSh2YWx1ZTogRCB8IG51bGwpIHtcbiAgICB0aGlzLl9taW5EYXRlID0gdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0VmFsaWREYXRlT3JOdWxsKHRoaXMuX2RhdGVBZGFwdGVyLmRlc2VyaWFsaXplKHZhbHVlKSk7XG4gIH1cbiAgcHJpdmF0ZSBfbWluRGF0ZTogRCB8IG51bGw7XG5cbiAgLyoqIFRoZSBtYXhpbXVtIHNlbGVjdGFibGUgZGF0ZS4gKi9cbiAgQElucHV0KClcbiAgZ2V0IG1heERhdGUoKTogRCB8IG51bGwgeyByZXR1cm4gdGhpcy5fbWF4RGF0ZTsgfVxuICBzZXQgbWF4RGF0ZSh2YWx1ZTogRCB8IG51bGwpIHtcbiAgICB0aGlzLl9tYXhEYXRlID0gdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0VmFsaWREYXRlT3JOdWxsKHRoaXMuX2RhdGVBZGFwdGVyLmRlc2VyaWFsaXplKHZhbHVlKSk7XG4gIH1cbiAgcHJpdmF0ZSBfbWF4RGF0ZTogRCB8IG51bGw7XG5cbiAgLyoqIEEgZnVuY3Rpb24gdXNlZCB0byBmaWx0ZXIgd2hpY2ggZGF0ZXMgYXJlIHNlbGVjdGFibGUuICovXG4gIEBJbnB1dCgpIGRhdGVGaWx0ZXI6IChkYXRlOiBEKSA9PiBib29sZWFuO1xuXG4gIC8qKiBGdW5jdGlvbiB0aGF0IGNhbiBiZSB1c2VkIHRvIGFkZCBjdXN0b20gQ1NTIGNsYXNzZXMgdG8gZGF0ZSBjZWxscy4gKi9cbiAgQElucHV0KCkgZGF0ZUNsYXNzOiBNYXRDYWxlbmRhckNlbGxDbGFzc0Z1bmN0aW9uPEQ+O1xuXG4gIC8qKiBFbWl0cyB3aGVuIGEgbmV3IHllYXIgaXMgc2VsZWN0ZWQuICovXG4gIEBPdXRwdXQoKSByZWFkb25seSBzZWxlY3RlZENoYW5nZTogRXZlbnRFbWl0dGVyPEQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxEPigpO1xuXG4gIC8qKiBFbWl0cyB0aGUgc2VsZWN0ZWQgeWVhci4gVGhpcyBkb2Vzbid0IGltcGx5IGEgY2hhbmdlIG9uIHRoZSBzZWxlY3RlZCBkYXRlICovXG4gIEBPdXRwdXQoKSByZWFkb25seSB5ZWFyU2VsZWN0ZWQ6IEV2ZW50RW1pdHRlcjxEPiA9IG5ldyBFdmVudEVtaXR0ZXI8RD4oKTtcblxuICAvKiogRW1pdHMgd2hlbiBhbnkgZGF0ZSBpcyBhY3RpdmF0ZWQuICovXG4gIEBPdXRwdXQoKSByZWFkb25seSBhY3RpdmVEYXRlQ2hhbmdlOiBFdmVudEVtaXR0ZXI8RD4gPSBuZXcgRXZlbnRFbWl0dGVyPEQ+KCk7XG5cbiAgLyoqIFRoZSBib2R5IG9mIGNhbGVuZGFyIHRhYmxlICovXG4gIEBWaWV3Q2hpbGQoTWF0Q2FsZW5kYXJCb2R5KSBfbWF0Q2FsZW5kYXJCb2R5OiBNYXRDYWxlbmRhckJvZHk7XG5cbiAgLyoqIEdyaWQgb2YgY2FsZW5kYXIgY2VsbHMgcmVwcmVzZW50aW5nIHRoZSBjdXJyZW50bHkgZGlzcGxheWVkIHllYXJzLiAqL1xuICBfeWVhcnM6IE1hdENhbGVuZGFyQ2VsbFtdW107XG5cbiAgLyoqIFRoZSB5ZWFyIHRoYXQgdG9kYXkgZmFsbHMgb24uICovXG4gIF90b2RheVllYXI6IG51bWJlcjtcblxuICAvKiogVGhlIHllYXIgb2YgdGhlIHNlbGVjdGVkIGRhdGUuIE51bGwgaWYgdGhlIHNlbGVjdGVkIGRhdGUgaXMgbnVsbC4gKi9cbiAgX3NlbGVjdGVkWWVhcjogbnVtYmVyIHwgbnVsbDtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9jaGFuZ2VEZXRlY3RvclJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gICAgICAgICAgICAgIEBPcHRpb25hbCgpIHB1YmxpYyBfZGF0ZUFkYXB0ZXI6IERhdGVBZGFwdGVyPEQ+LFxuICAgICAgICAgICAgICBAT3B0aW9uYWwoKSBwcml2YXRlIF9kaXI/OiBEaXJlY3Rpb25hbGl0eSkge1xuICAgIGlmICghdGhpcy5fZGF0ZUFkYXB0ZXIgJiYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkpIHtcbiAgICAgIHRocm93IGNyZWF0ZU1pc3NpbmdEYXRlSW1wbEVycm9yKCdEYXRlQWRhcHRlcicpO1xuICAgIH1cblxuICAgIHRoaXMuX2FjdGl2ZURhdGUgPSB0aGlzLl9kYXRlQWRhcHRlci50b2RheSgpO1xuICB9XG5cbiAgbmdBZnRlckNvbnRlbnRJbml0KCkge1xuICAgIHRoaXMuX3JlcmVuZGVyU3Vic2NyaXB0aW9uID0gdGhpcy5fZGF0ZUFkYXB0ZXIubG9jYWxlQ2hhbmdlc1xuICAgICAgLnBpcGUoc3RhcnRXaXRoKG51bGwpKVxuICAgICAgLnN1YnNjcmliZSgoKSA9PiB0aGlzLl9pbml0KCkpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5fcmVyZW5kZXJTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgfVxuXG4gIC8qKiBJbml0aWFsaXplcyB0aGlzIG11bHRpLXllYXIgdmlldy4gKi9cbiAgX2luaXQoKSB7XG4gICAgdGhpcy5fdG9kYXlZZWFyID0gdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0WWVhcih0aGlzLl9kYXRlQWRhcHRlci50b2RheSgpKTtcblxuICAgIC8vIFdlIHdhbnQgYSByYW5nZSB5ZWFycyBzdWNoIHRoYXQgd2UgbWF4aW1pemUgdGhlIG51bWJlciBvZlxuICAgIC8vIGVuYWJsZWQgZGF0ZXMgdmlzaWJsZSBhdCBvbmNlLiBUaGlzIHByZXZlbnRzIGlzc3VlcyB3aGVyZSB0aGUgbWluaW11bSB5ZWFyXG4gICAgLy8gaXMgdGhlIGxhc3QgaXRlbSBvZiBhIHBhZ2UgT1IgdGhlIG1heGltdW0geWVhciBpcyB0aGUgZmlyc3QgaXRlbSBvZiBhIHBhZ2UuXG5cbiAgICAvLyBUaGUgb2Zmc2V0IGZyb20gdGhlIGFjdGl2ZSB5ZWFyIHRvIHRoZSBcInNsb3RcIiBmb3IgdGhlIHN0YXJ0aW5nIHllYXIgaXMgdGhlXG4gICAgLy8gKmFjdHVhbCogZmlyc3QgcmVuZGVyZWQgeWVhciBpbiB0aGUgbXVsdGkteWVhciB2aWV3LlxuICAgIGNvbnN0IGFjdGl2ZVllYXIgPSB0aGlzLl9kYXRlQWRhcHRlci5nZXRZZWFyKHRoaXMuX2FjdGl2ZURhdGUpO1xuICAgIGNvbnN0IG1pblllYXJPZlBhZ2UgPSBhY3RpdmVZZWFyIC0gZ2V0QWN0aXZlT2Zmc2V0KFxuICAgICAgdGhpcy5fZGF0ZUFkYXB0ZXIsIHRoaXMuYWN0aXZlRGF0ZSwgdGhpcy5taW5EYXRlLCB0aGlzLm1heERhdGUpO1xuXG4gICAgdGhpcy5feWVhcnMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMCwgcm93OiBudW1iZXJbXSA9IFtdOyBpIDwgeWVhcnNQZXJQYWdlOyBpKyspIHtcbiAgICAgIHJvdy5wdXNoKG1pblllYXJPZlBhZ2UgKyBpKTtcbiAgICAgIGlmIChyb3cubGVuZ3RoID09IHllYXJzUGVyUm93KSB7XG4gICAgICAgIHRoaXMuX3llYXJzLnB1c2gocm93Lm1hcCh5ZWFyID0+IHRoaXMuX2NyZWF0ZUNlbGxGb3JZZWFyKHllYXIpKSk7XG4gICAgICAgIHJvdyA9IFtdO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKTtcbiAgfVxuXG4gIC8qKiBIYW5kbGVzIHdoZW4gYSBuZXcgeWVhciBpcyBzZWxlY3RlZC4gKi9cbiAgX3llYXJTZWxlY3RlZChldmVudDogTWF0Q2FsZW5kYXJVc2VyRXZlbnQ8bnVtYmVyPikge1xuICAgIGNvbnN0IHllYXIgPSBldmVudC52YWx1ZTtcbiAgICB0aGlzLnllYXJTZWxlY3RlZC5lbWl0KHRoaXMuX2RhdGVBZGFwdGVyLmNyZWF0ZURhdGUoeWVhciwgMCwgMSkpO1xuICAgIGxldCBtb250aCA9IHRoaXMuX2RhdGVBZGFwdGVyLmdldE1vbnRoKHRoaXMuYWN0aXZlRGF0ZSk7XG4gICAgbGV0IGRheXNJbk1vbnRoID1cbiAgICAgICAgdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0TnVtRGF5c0luTW9udGgodGhpcy5fZGF0ZUFkYXB0ZXIuY3JlYXRlRGF0ZSh5ZWFyLCBtb250aCwgMSkpO1xuICAgIHRoaXMuc2VsZWN0ZWRDaGFuZ2UuZW1pdCh0aGlzLl9kYXRlQWRhcHRlci5jcmVhdGVEYXRlKHllYXIsIG1vbnRoLFxuICAgICAgICBNYXRoLm1pbih0aGlzLl9kYXRlQWRhcHRlci5nZXREYXRlKHRoaXMuYWN0aXZlRGF0ZSksIGRheXNJbk1vbnRoKSkpO1xuICB9XG5cbiAgLyoqIEhhbmRsZXMga2V5ZG93biBldmVudHMgb24gdGhlIGNhbGVuZGFyIGJvZHkgd2hlbiBjYWxlbmRhciBpcyBpbiBtdWx0aS15ZWFyIHZpZXcuICovXG4gIF9oYW5kbGVDYWxlbmRhckJvZHlLZXlkb3duKGV2ZW50OiBLZXlib2FyZEV2ZW50KTogdm9pZCB7XG4gICAgY29uc3Qgb2xkQWN0aXZlRGF0ZSA9IHRoaXMuX2FjdGl2ZURhdGU7XG4gICAgY29uc3QgaXNSdGwgPSB0aGlzLl9pc1J0bCgpO1xuXG4gICAgc3dpdGNoIChldmVudC5rZXlDb2RlKSB7XG4gICAgICBjYXNlIExFRlRfQVJST1c6XG4gICAgICAgIHRoaXMuYWN0aXZlRGF0ZSA9IHRoaXMuX2RhdGVBZGFwdGVyLmFkZENhbGVuZGFyWWVhcnModGhpcy5fYWN0aXZlRGF0ZSwgaXNSdGwgPyAxIDogLTEpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgUklHSFRfQVJST1c6XG4gICAgICAgIHRoaXMuYWN0aXZlRGF0ZSA9IHRoaXMuX2RhdGVBZGFwdGVyLmFkZENhbGVuZGFyWWVhcnModGhpcy5fYWN0aXZlRGF0ZSwgaXNSdGwgPyAtMSA6IDEpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgVVBfQVJST1c6XG4gICAgICAgIHRoaXMuYWN0aXZlRGF0ZSA9IHRoaXMuX2RhdGVBZGFwdGVyLmFkZENhbGVuZGFyWWVhcnModGhpcy5fYWN0aXZlRGF0ZSwgLXllYXJzUGVyUm93KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIERPV05fQVJST1c6XG4gICAgICAgIHRoaXMuYWN0aXZlRGF0ZSA9IHRoaXMuX2RhdGVBZGFwdGVyLmFkZENhbGVuZGFyWWVhcnModGhpcy5fYWN0aXZlRGF0ZSwgeWVhcnNQZXJSb3cpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgSE9NRTpcbiAgICAgICAgdGhpcy5hY3RpdmVEYXRlID0gdGhpcy5fZGF0ZUFkYXB0ZXIuYWRkQ2FsZW5kYXJZZWFycyh0aGlzLl9hY3RpdmVEYXRlLFxuICAgICAgICAgIC1nZXRBY3RpdmVPZmZzZXQodGhpcy5fZGF0ZUFkYXB0ZXIsIHRoaXMuYWN0aXZlRGF0ZSwgdGhpcy5taW5EYXRlLCB0aGlzLm1heERhdGUpKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEVORDpcbiAgICAgICAgdGhpcy5hY3RpdmVEYXRlID0gdGhpcy5fZGF0ZUFkYXB0ZXIuYWRkQ2FsZW5kYXJZZWFycyh0aGlzLl9hY3RpdmVEYXRlLFxuICAgICAgICAgIHllYXJzUGVyUGFnZSAtIGdldEFjdGl2ZU9mZnNldChcbiAgICAgICAgICAgIHRoaXMuX2RhdGVBZGFwdGVyLCB0aGlzLmFjdGl2ZURhdGUsIHRoaXMubWluRGF0ZSwgdGhpcy5tYXhEYXRlKSAtIDEpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgUEFHRV9VUDpcbiAgICAgICAgdGhpcy5hY3RpdmVEYXRlID1cbiAgICAgICAgICAgIHRoaXMuX2RhdGVBZGFwdGVyLmFkZENhbGVuZGFyWWVhcnMoXG4gICAgICAgICAgICAgICAgdGhpcy5fYWN0aXZlRGF0ZSwgZXZlbnQuYWx0S2V5ID8gLXllYXJzUGVyUGFnZSAqIDEwIDogLXllYXJzUGVyUGFnZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBQQUdFX0RPV046XG4gICAgICAgIHRoaXMuYWN0aXZlRGF0ZSA9XG4gICAgICAgICAgICB0aGlzLl9kYXRlQWRhcHRlci5hZGRDYWxlbmRhclllYXJzKFxuICAgICAgICAgICAgICAgIHRoaXMuX2FjdGl2ZURhdGUsIGV2ZW50LmFsdEtleSA/IHllYXJzUGVyUGFnZSAqIDEwIDogeWVhcnNQZXJQYWdlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEVOVEVSOlxuICAgICAgY2FzZSBTUEFDRTpcbiAgICAgICAgdGhpcy5feWVhclNlbGVjdGVkKHt2YWx1ZTogdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0WWVhcih0aGlzLl9hY3RpdmVEYXRlKSwgZXZlbnR9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICAvLyBEb24ndCBwcmV2ZW50IGRlZmF1bHQgb3IgZm9jdXMgYWN0aXZlIGNlbGwgb24ga2V5cyB0aGF0IHdlIGRvbid0IGV4cGxpY2l0bHkgaGFuZGxlLlxuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0aGlzLl9kYXRlQWRhcHRlci5jb21wYXJlRGF0ZShvbGRBY3RpdmVEYXRlLCB0aGlzLmFjdGl2ZURhdGUpKSB7XG4gICAgICB0aGlzLmFjdGl2ZURhdGVDaGFuZ2UuZW1pdCh0aGlzLmFjdGl2ZURhdGUpO1xuICAgIH1cblxuICAgIHRoaXMuX2ZvY3VzQWN0aXZlQ2VsbCgpO1xuICAgIC8vIFByZXZlbnQgdW5leHBlY3RlZCBkZWZhdWx0IGFjdGlvbnMgc3VjaCBhcyBmb3JtIHN1Ym1pc3Npb24uXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgfVxuXG4gIF9nZXRBY3RpdmVDZWxsKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIGdldEFjdGl2ZU9mZnNldCh0aGlzLl9kYXRlQWRhcHRlciwgdGhpcy5hY3RpdmVEYXRlLCB0aGlzLm1pbkRhdGUsIHRoaXMubWF4RGF0ZSk7XG4gIH1cblxuICAvKiogRm9jdXNlcyB0aGUgYWN0aXZlIGNlbGwgYWZ0ZXIgdGhlIG1pY3JvdGFzayBxdWV1ZSBpcyBlbXB0eS4gKi9cbiAgX2ZvY3VzQWN0aXZlQ2VsbCgpIHtcbiAgICB0aGlzLl9tYXRDYWxlbmRhckJvZHkuX2ZvY3VzQWN0aXZlQ2VsbCgpO1xuICB9XG5cbiAgLyoqIENyZWF0ZXMgYW4gTWF0Q2FsZW5kYXJDZWxsIGZvciB0aGUgZ2l2ZW4geWVhci4gKi9cbiAgcHJpdmF0ZSBfY3JlYXRlQ2VsbEZvclllYXIoeWVhcjogbnVtYmVyKSB7XG4gICAgY29uc3QgZGF0ZSA9IHRoaXMuX2RhdGVBZGFwdGVyLmNyZWF0ZURhdGUoeWVhciwgMCwgMSk7XG4gICAgY29uc3QgeWVhck5hbWUgPSB0aGlzLl9kYXRlQWRhcHRlci5nZXRZZWFyTmFtZShkYXRlKTtcbiAgICBjb25zdCBjZWxsQ2xhc3NlcyA9IHRoaXMuZGF0ZUNsYXNzID8gdGhpcy5kYXRlQ2xhc3MoZGF0ZSwgJ211bHRpLXllYXInKSA6IHVuZGVmaW5lZDtcblxuICAgIHJldHVybiBuZXcgTWF0Q2FsZW5kYXJDZWxsKHllYXIsIHllYXJOYW1lLCB5ZWFyTmFtZSwgdGhpcy5fc2hvdWxkRW5hYmxlWWVhcih5ZWFyKSwgY2VsbENsYXNzZXMpO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGdpdmVuIHllYXIgaXMgZW5hYmxlZC4gKi9cbiAgcHJpdmF0ZSBfc2hvdWxkRW5hYmxlWWVhcih5ZWFyOiBudW1iZXIpIHtcbiAgICAvLyBkaXNhYmxlIGlmIHRoZSB5ZWFyIGlzIGdyZWF0ZXIgdGhhbiBtYXhEYXRlIGxvd2VyIHRoYW4gbWluRGF0ZVxuICAgIGlmICh5ZWFyID09PSB1bmRlZmluZWQgfHwgeWVhciA9PT0gbnVsbCB8fFxuICAgICAgICAodGhpcy5tYXhEYXRlICYmIHllYXIgPiB0aGlzLl9kYXRlQWRhcHRlci5nZXRZZWFyKHRoaXMubWF4RGF0ZSkpIHx8XG4gICAgICAgICh0aGlzLm1pbkRhdGUgJiYgeWVhciA8IHRoaXMuX2RhdGVBZGFwdGVyLmdldFllYXIodGhpcy5taW5EYXRlKSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBlbmFibGUgaWYgaXQgcmVhY2hlcyBoZXJlIGFuZCB0aGVyZSdzIG5vIGZpbHRlciBkZWZpbmVkXG4gICAgaWYgKCF0aGlzLmRhdGVGaWx0ZXIpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGNvbnN0IGZpcnN0T2ZZZWFyID0gdGhpcy5fZGF0ZUFkYXB0ZXIuY3JlYXRlRGF0ZSh5ZWFyLCAwLCAxKTtcblxuICAgIC8vIElmIGFueSBkYXRlIGluIHRoZSB5ZWFyIGlzIGVuYWJsZWQgY291bnQgdGhlIHllYXIgYXMgZW5hYmxlZC5cbiAgICBmb3IgKGxldCBkYXRlID0gZmlyc3RPZlllYXI7IHRoaXMuX2RhdGVBZGFwdGVyLmdldFllYXIoZGF0ZSkgPT0geWVhcjtcbiAgICAgIGRhdGUgPSB0aGlzLl9kYXRlQWRhcHRlci5hZGRDYWxlbmRhckRheXMoZGF0ZSwgMSkpIHtcbiAgICAgIGlmICh0aGlzLmRhdGVGaWx0ZXIoZGF0ZSkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqIERldGVybWluZXMgd2hldGhlciB0aGUgdXNlciBoYXMgdGhlIFJUTCBsYXlvdXQgZGlyZWN0aW9uLiAqL1xuICBwcml2YXRlIF9pc1J0bCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZGlyICYmIHRoaXMuX2Rpci52YWx1ZSA9PT0gJ3J0bCc7XG4gIH1cblxuICAvKiogU2V0cyB0aGUgY3VycmVudGx5LWhpZ2hsaWdodGVkIHllYXIgYmFzZWQgb24gYSBtb2RlbCB2YWx1ZS4gKi9cbiAgcHJpdmF0ZSBfc2V0U2VsZWN0ZWRZZWFyKHZhbHVlOiBEYXRlUmFuZ2U8RD4gfCBEIHwgbnVsbCkge1xuICAgIHRoaXMuX3NlbGVjdGVkWWVhciA9IG51bGw7XG5cbiAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBEYXRlUmFuZ2UpIHtcbiAgICAgIGNvbnN0IGRpc3BsYXlWYWx1ZSA9IHZhbHVlLnN0YXJ0IHx8IHZhbHVlLmVuZDtcblxuICAgICAgaWYgKGRpc3BsYXlWYWx1ZSkge1xuICAgICAgICB0aGlzLl9zZWxlY3RlZFllYXIgPSB0aGlzLl9kYXRlQWRhcHRlci5nZXRZZWFyKGRpc3BsYXlWYWx1ZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh2YWx1ZSkge1xuICAgICAgdGhpcy5fc2VsZWN0ZWRZZWFyID0gdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0WWVhcih2YWx1ZSk7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1NhbWVNdWx0aVllYXJWaWV3PEQ+KFxuICBkYXRlQWRhcHRlcjogRGF0ZUFkYXB0ZXI8RD4sIGRhdGUxOiBELCBkYXRlMjogRCwgbWluRGF0ZTogRCB8IG51bGwsIG1heERhdGU6IEQgfCBudWxsKTogYm9vbGVhbiB7XG4gIGNvbnN0IHllYXIxID0gZGF0ZUFkYXB0ZXIuZ2V0WWVhcihkYXRlMSk7XG4gIGNvbnN0IHllYXIyID0gZGF0ZUFkYXB0ZXIuZ2V0WWVhcihkYXRlMik7XG4gIGNvbnN0IHN0YXJ0aW5nWWVhciA9IGdldFN0YXJ0aW5nWWVhcihkYXRlQWRhcHRlciwgbWluRGF0ZSwgbWF4RGF0ZSk7XG4gIHJldHVybiBNYXRoLmZsb29yKCh5ZWFyMSAtIHN0YXJ0aW5nWWVhcikgLyB5ZWFyc1BlclBhZ2UpID09PVxuICAgICAgICAgIE1hdGguZmxvb3IoKHllYXIyIC0gc3RhcnRpbmdZZWFyKSAvIHllYXJzUGVyUGFnZSk7XG59XG5cbi8qKlxuICogV2hlbiB0aGUgbXVsdGkteWVhciB2aWV3IGlzIGZpcnN0IG9wZW5lZCwgdGhlIGFjdGl2ZSB5ZWFyIHdpbGwgYmUgaW4gdmlldy5cbiAqIFNvIHdlIGNvbXB1dGUgaG93IG1hbnkgeWVhcnMgYXJlIGJldHdlZW4gdGhlIGFjdGl2ZSB5ZWFyIGFuZCB0aGUgKnNsb3QqIHdoZXJlIG91clxuICogXCJzdGFydGluZ1llYXJcIiB3aWxsIHJlbmRlciB3aGVuIHBhZ2VkIGludG8gdmlldy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFjdGl2ZU9mZnNldDxEPihcbiAgZGF0ZUFkYXB0ZXI6IERhdGVBZGFwdGVyPEQ+LCBhY3RpdmVEYXRlOiBELCBtaW5EYXRlOiBEIHwgbnVsbCwgbWF4RGF0ZTogRCB8IG51bGwpOiBudW1iZXIge1xuICBjb25zdCBhY3RpdmVZZWFyID0gZGF0ZUFkYXB0ZXIuZ2V0WWVhcihhY3RpdmVEYXRlKTtcbiAgcmV0dXJuIGV1Y2xpZGVhbk1vZHVsbygoYWN0aXZlWWVhciAtIGdldFN0YXJ0aW5nWWVhcihkYXRlQWRhcHRlciwgbWluRGF0ZSwgbWF4RGF0ZSkpLFxuICAgIHllYXJzUGVyUGFnZSk7XG59XG5cbi8qKlxuICogV2UgcGljayBhIFwic3RhcnRpbmdcIiB5ZWFyIHN1Y2ggdGhhdCBlaXRoZXIgdGhlIG1heGltdW0geWVhciB3b3VsZCBiZSBhdCB0aGUgZW5kXG4gKiBvciB0aGUgbWluaW11bSB5ZWFyIHdvdWxkIGJlIGF0IHRoZSBiZWdpbm5pbmcgb2YgYSBwYWdlLlxuICovXG5mdW5jdGlvbiBnZXRTdGFydGluZ1llYXI8RD4oXG4gIGRhdGVBZGFwdGVyOiBEYXRlQWRhcHRlcjxEPiwgbWluRGF0ZTogRCB8IG51bGwsIG1heERhdGU6IEQgfCBudWxsKTogbnVtYmVyIHtcbiAgbGV0IHN0YXJ0aW5nWWVhciA9IDA7XG4gIGlmIChtYXhEYXRlKSB7XG4gICAgY29uc3QgbWF4WWVhciA9IGRhdGVBZGFwdGVyLmdldFllYXIobWF4RGF0ZSk7XG4gICAgc3RhcnRpbmdZZWFyID0gbWF4WWVhciAtIHllYXJzUGVyUGFnZSArIDE7XG4gIH0gZWxzZSBpZiAobWluRGF0ZSkge1xuICAgIHN0YXJ0aW5nWWVhciA9IGRhdGVBZGFwdGVyLmdldFllYXIobWluRGF0ZSk7XG4gIH1cbiAgcmV0dXJuIHN0YXJ0aW5nWWVhcjtcbn1cblxuLyoqIEdldHMgcmVtYWluZGVyIHRoYXQgaXMgbm9uLW5lZ2F0aXZlLCBldmVuIGlmIGZpcnN0IG51bWJlciBpcyBuZWdhdGl2ZSAqL1xuZnVuY3Rpb24gZXVjbGlkZWFuTW9kdWxvIChhOiBudW1iZXIsIGI6IG51bWJlcik6IG51bWJlciB7XG4gIHJldHVybiAoYSAlIGIgKyBiKSAlIGI7XG59XG4iXX0=