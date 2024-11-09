/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CdkPortalOutlet, ComponentPortal } from '@angular/cdk/portal';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, forwardRef, Inject, Input, Optional, Output, ViewChild, ViewEncapsulation, } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { Subject } from 'rxjs';
import { createMissingDateImplError } from './datepicker-errors';
import { MatDatepickerIntl } from './datepicker-intl';
import { MatMonthView } from './month-view';
import { getActiveOffset, isSameMultiYearView, MatMultiYearView, yearsPerPage, } from './multi-year-view';
import { MatYearView } from './year-view';
import { MAT_SINGLE_DATE_SELECTION_MODEL_PROVIDER, DateRange } from './date-selection-model';
import { MatIconButton, MatButton } from '@angular/material/button';
import { CdkMonitorFocus } from '@angular/cdk/a11y';
import * as i0 from "@angular/core";
import * as i1 from "./datepicker-intl";
import * as i2 from "@angular/material/core";
let calendarHeaderId = 1;
/** Default header for MatCalendar */
export class MatCalendarHeader {
    constructor(_intl, calendar, _dateAdapter, _dateFormats, changeDetectorRef) {
        this._intl = _intl;
        this.calendar = calendar;
        this._dateAdapter = _dateAdapter;
        this._dateFormats = _dateFormats;
        this._id = `mat-calendar-header-${calendarHeaderId++}`;
        this._periodButtonLabelId = `${this._id}-period-label`;
        this.calendar.stateChanges.subscribe(() => changeDetectorRef.markForCheck());
    }
    /** The display text for the current calendar view. */
    get periodButtonText() {
        if (this.calendar.currentView == 'month') {
            return this._dateAdapter
                .format(this.calendar.activeDate, this._dateFormats.display.monthYearLabel)
                .toLocaleUpperCase();
        }
        if (this.calendar.currentView == 'year') {
            return this._dateAdapter.getYearName(this.calendar.activeDate);
        }
        return this._intl.formatYearRange(...this._formatMinAndMaxYearLabels());
    }
    /** The aria description for the current calendar view. */
    get periodButtonDescription() {
        if (this.calendar.currentView == 'month') {
            return this._dateAdapter
                .format(this.calendar.activeDate, this._dateFormats.display.monthYearLabel)
                .toLocaleUpperCase();
        }
        if (this.calendar.currentView == 'year') {
            return this._dateAdapter.getYearName(this.calendar.activeDate);
        }
        // Format a label for the window of years displayed in the multi-year calendar view. Use
        // `formatYearRangeLabel` because it is TTS friendly.
        return this._intl.formatYearRangeLabel(...this._formatMinAndMaxYearLabels());
    }
    /** The `aria-label` for changing the calendar view. */
    get periodButtonLabel() {
        return this.calendar.currentView == 'month'
            ? this._intl.switchToMultiYearViewLabel
            : this._intl.switchToMonthViewLabel;
    }
    /** The label for the previous button. */
    get prevButtonLabel() {
        return {
            'month': this._intl.prevMonthLabel,
            'year': this._intl.prevYearLabel,
            'multi-year': this._intl.prevMultiYearLabel,
        }[this.calendar.currentView];
    }
    /** The label for the next button. */
    get nextButtonLabel() {
        return {
            'month': this._intl.nextMonthLabel,
            'year': this._intl.nextYearLabel,
            'multi-year': this._intl.nextMultiYearLabel,
        }[this.calendar.currentView];
    }
    /** Handles user clicks on the period label. */
    currentPeriodClicked() {
        this.calendar.currentView = this.calendar.currentView == 'month' ? 'multi-year' : 'month';
    }
    /** Handles user clicks on the previous button. */
    previousClicked() {
        this.calendar.activeDate =
            this.calendar.currentView == 'month'
                ? this._dateAdapter.addCalendarMonths(this.calendar.activeDate, -1)
                : this._dateAdapter.addCalendarYears(this.calendar.activeDate, this.calendar.currentView == 'year' ? -1 : -yearsPerPage);
    }
    /** Handles user clicks on the next button. */
    nextClicked() {
        this.calendar.activeDate =
            this.calendar.currentView == 'month'
                ? this._dateAdapter.addCalendarMonths(this.calendar.activeDate, 1)
                : this._dateAdapter.addCalendarYears(this.calendar.activeDate, this.calendar.currentView == 'year' ? 1 : yearsPerPage);
    }
    /** Whether the previous period button is enabled. */
    previousEnabled() {
        if (!this.calendar.minDate) {
            return true;
        }
        return (!this.calendar.minDate || !this._isSameView(this.calendar.activeDate, this.calendar.minDate));
    }
    /** Whether the next period button is enabled. */
    nextEnabled() {
        return (!this.calendar.maxDate || !this._isSameView(this.calendar.activeDate, this.calendar.maxDate));
    }
    /** Whether the two dates represent the same view in the current view mode (month or year). */
    _isSameView(date1, date2) {
        if (this.calendar.currentView == 'month') {
            return (this._dateAdapter.getYear(date1) == this._dateAdapter.getYear(date2) &&
                this._dateAdapter.getMonth(date1) == this._dateAdapter.getMonth(date2));
        }
        if (this.calendar.currentView == 'year') {
            return this._dateAdapter.getYear(date1) == this._dateAdapter.getYear(date2);
        }
        // Otherwise we are in 'multi-year' view.
        return isSameMultiYearView(this._dateAdapter, date1, date2, this.calendar.minDate, this.calendar.maxDate);
    }
    /**
     * Format two individual labels for the minimum year and maximum year available in the multi-year
     * calendar view. Returns an array of two strings where the first string is the formatted label
     * for the minimum year, and the second string is the formatted label for the maximum year.
     */
    _formatMinAndMaxYearLabels() {
        // The offset from the active year to the "slot" for the starting year is the
        // *actual* first rendered year in the multi-year view, and the last year is
        // just yearsPerPage - 1 away.
        const activeYear = this._dateAdapter.getYear(this.calendar.activeDate);
        const minYearOfPage = activeYear -
            getActiveOffset(this._dateAdapter, this.calendar.activeDate, this.calendar.minDate, this.calendar.maxDate);
        const maxYearOfPage = minYearOfPage + yearsPerPage - 1;
        const minYearLabel = this._dateAdapter.getYearName(this._dateAdapter.createDate(minYearOfPage, 0, 1));
        const maxYearLabel = this._dateAdapter.getYearName(this._dateAdapter.createDate(maxYearOfPage, 0, 1));
        return [minYearLabel, maxYearLabel];
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.2.0", ngImport: i0, type: MatCalendarHeader, deps: [{ token: i1.MatDatepickerIntl }, { token: forwardRef(() => MatCalendar) }, { token: i2.DateAdapter, optional: true }, { token: MAT_DATE_FORMATS, optional: true }, { token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "17.2.0", type: MatCalendarHeader, isStandalone: true, selector: "mat-calendar-header", exportAs: ["matCalendarHeader"], ngImport: i0, template: "<div class=\"mat-calendar-header\">\n  <div class=\"mat-calendar-controls\">\n    <!-- [Firefox Issue: https://bugzilla.mozilla.org/show_bug.cgi?id=1880533] \n      Relocated label next to related button and made visually hidden via cdk-visually-hidden\n      to enable label to appear in a11y tree for SR when using Firefox -->\n    <label [id]=\"_periodButtonLabelId\" class=\"cdk-visually-hidden\">{{periodButtonDescription}}</label>\n    <button mat-button type=\"button\" class=\"mat-calendar-period-button\"\n            (click)=\"currentPeriodClicked()\" [attr.aria-label]=\"periodButtonLabel\"\n            [attr.aria-describedby]=\"_periodButtonLabelId\" aria-live=\"polite\">\n      <span aria-hidden=\"true\">{{periodButtonText}}</span>\n      <svg class=\"mat-calendar-arrow\" [class.mat-calendar-invert]=\"calendar.currentView !== 'month'\"\n           viewBox=\"0 0 10 5\" focusable=\"false\" aria-hidden=\"true\">\n           <polygon points=\"0,0 5,5 10,0\"/>\n      </svg>\n    </button>\n\n    <div class=\"mat-calendar-spacer\"></div>\n\n    <ng-content></ng-content>\n\n    <button mat-icon-button type=\"button\" class=\"mat-calendar-previous-button\"\n            [disabled]=\"!previousEnabled()\" (click)=\"previousClicked()\"\n            [attr.aria-label]=\"prevButtonLabel\">\n    </button>\n\n    <button mat-icon-button type=\"button\" class=\"mat-calendar-next-button\"\n            [disabled]=\"!nextEnabled()\" (click)=\"nextClicked()\"\n            [attr.aria-label]=\"nextButtonLabel\">\n    </button>\n  </div>\n</div>\n", dependencies: [{ kind: "component", type: MatButton, selector: "    button[mat-button], button[mat-raised-button], button[mat-flat-button],    button[mat-stroked-button]  ", exportAs: ["matButton"] }, { kind: "component", type: MatIconButton, selector: "button[mat-icon-button]", exportAs: ["matButton"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.2.0", ngImport: i0, type: MatCalendarHeader, decorators: [{
            type: Component,
            args: [{ selector: 'mat-calendar-header', exportAs: 'matCalendarHeader', encapsulation: ViewEncapsulation.None, changeDetection: ChangeDetectionStrategy.OnPush, standalone: true, imports: [MatButton, MatIconButton], template: "<div class=\"mat-calendar-header\">\n  <div class=\"mat-calendar-controls\">\n    <!-- [Firefox Issue: https://bugzilla.mozilla.org/show_bug.cgi?id=1880533] \n      Relocated label next to related button and made visually hidden via cdk-visually-hidden\n      to enable label to appear in a11y tree for SR when using Firefox -->\n    <label [id]=\"_periodButtonLabelId\" class=\"cdk-visually-hidden\">{{periodButtonDescription}}</label>\n    <button mat-button type=\"button\" class=\"mat-calendar-period-button\"\n            (click)=\"currentPeriodClicked()\" [attr.aria-label]=\"periodButtonLabel\"\n            [attr.aria-describedby]=\"_periodButtonLabelId\" aria-live=\"polite\">\n      <span aria-hidden=\"true\">{{periodButtonText}}</span>\n      <svg class=\"mat-calendar-arrow\" [class.mat-calendar-invert]=\"calendar.currentView !== 'month'\"\n           viewBox=\"0 0 10 5\" focusable=\"false\" aria-hidden=\"true\">\n           <polygon points=\"0,0 5,5 10,0\"/>\n      </svg>\n    </button>\n\n    <div class=\"mat-calendar-spacer\"></div>\n\n    <ng-content></ng-content>\n\n    <button mat-icon-button type=\"button\" class=\"mat-calendar-previous-button\"\n            [disabled]=\"!previousEnabled()\" (click)=\"previousClicked()\"\n            [attr.aria-label]=\"prevButtonLabel\">\n    </button>\n\n    <button mat-icon-button type=\"button\" class=\"mat-calendar-next-button\"\n            [disabled]=\"!nextEnabled()\" (click)=\"nextClicked()\"\n            [attr.aria-label]=\"nextButtonLabel\">\n    </button>\n  </div>\n</div>\n" }]
        }], ctorParameters: () => [{ type: i1.MatDatepickerIntl }, { type: MatCalendar, decorators: [{
                    type: Inject,
                    args: [forwardRef(() => MatCalendar)]
                }] }, { type: i2.DateAdapter, decorators: [{
                    type: Optional
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [MAT_DATE_FORMATS]
                }] }, { type: i0.ChangeDetectorRef }] });
/** A calendar that is used as part of the datepicker. */
export class MatCalendar {
    /** A date representing the period (month or year) to start the calendar in. */
    get startAt() {
        return this._startAt;
    }
    set startAt(value) {
        this._startAt = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value));
    }
    /** The currently selected date. */
    get selected() {
        return this._selected;
    }
    set selected(value) {
        if (value instanceof DateRange) {
            this._selected = value;
        }
        else {
            this._selected = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value));
        }
    }
    /** The minimum selectable date. */
    get minDate() {
        return this._minDate;
    }
    set minDate(value) {
        this._minDate = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value));
    }
    /** The maximum selectable date. */
    get maxDate() {
        return this._maxDate;
    }
    set maxDate(value) {
        this._maxDate = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value));
    }
    /**
     * The current active date. This determines which time period is shown and which date is
     * highlighted when using keyboard navigation.
     */
    get activeDate() {
        return this._clampedActiveDate;
    }
    set activeDate(value) {
        this._clampedActiveDate = this._dateAdapter.clampDate(value, this.minDate, this.maxDate);
        this.stateChanges.next();
        this._changeDetectorRef.markForCheck();
    }
    /** Whether the calendar is in month view. */
    get currentView() {
        return this._currentView;
    }
    set currentView(value) {
        const viewChangedResult = this._currentView !== value ? value : null;
        this._currentView = value;
        this._moveFocusOnNextTick = true;
        this._changeDetectorRef.markForCheck();
        if (viewChangedResult) {
            this.viewChanged.emit(viewChangedResult);
        }
    }
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
        /** Emits a new date range value when the user completes a drag drop operation. */
        this._userDragDrop = new EventEmitter();
        /** Origin of active drag, or null when dragging is not active. */
        this._activeDrag = null;
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
        // Ignore date changes that are at a different time on the same day. This fixes issues where
        // the calendar re-renders when there is no meaningful change to [minDate] or [maxDate]
        // (#24435).
        const minDateChange = changes['minDate'] &&
            !this._dateAdapter.sameDate(changes['minDate'].previousValue, changes['minDate'].currentValue)
            ? changes['minDate']
            : undefined;
        const maxDateChange = changes['maxDate'] &&
            !this._dateAdapter.sameDate(changes['maxDate'].previousValue, changes['maxDate'].currentValue)
            ? changes['maxDate']
            : undefined;
        const change = minDateChange || maxDateChange || changes['dateFilter'];
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
    /** Focuses the active date. */
    focusActiveCell() {
        this._getCurrentViewComponent()._focusActiveCell(false);
    }
    /** Updates today's date after an update of the active date */
    updateTodaysDate() {
        this._getCurrentViewComponent()._init();
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
    /** Called when the user starts dragging to change a date range. */
    _dragStarted(event) {
        this._activeDrag = event;
    }
    /**
     * Called when a drag completes. It may end in cancelation or in the selection
     * of a new range.
     */
    _dragEnded(event) {
        if (!this._activeDrag)
            return;
        if (event.value) {
            this._userDragDrop.emit(event);
        }
        this._activeDrag = null;
    }
    /** Returns the component instance that corresponds to the current calendar view. */
    _getCurrentViewComponent() {
        // The return type is explicitly written as a union to ensure that the Closure compiler does
        // not optimize calls to _init(). Without the explicit return type, TypeScript narrows it to
        // only the first component type. See https://github.com/angular/components/issues/22996.
        return this.monthView || this.yearView || this.multiYearView;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.2.0", ngImport: i0, type: MatCalendar, deps: [{ token: i1.MatDatepickerIntl }, { token: i2.DateAdapter, optional: true }, { token: MAT_DATE_FORMATS, optional: true }, { token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "17.2.0", type: MatCalendar, isStandalone: true, selector: "mat-calendar", inputs: { headerComponent: "headerComponent", startAt: "startAt", startView: "startView", selected: "selected", minDate: "minDate", maxDate: "maxDate", dateFilter: "dateFilter", dateClass: "dateClass", comparisonStart: "comparisonStart", comparisonEnd: "comparisonEnd", startDateAccessibleName: "startDateAccessibleName", endDateAccessibleName: "endDateAccessibleName" }, outputs: { selectedChange: "selectedChange", yearSelected: "yearSelected", monthSelected: "monthSelected", viewChanged: "viewChanged", _userSelection: "_userSelection", _userDragDrop: "_userDragDrop" }, host: { classAttribute: "mat-calendar" }, providers: [MAT_SINGLE_DATE_SELECTION_MODEL_PROVIDER], viewQueries: [{ propertyName: "monthView", first: true, predicate: MatMonthView, descendants: true }, { propertyName: "yearView", first: true, predicate: MatYearView, descendants: true }, { propertyName: "multiYearView", first: true, predicate: MatMultiYearView, descendants: true }], exportAs: ["matCalendar"], usesOnChanges: true, ngImport: i0, template: "<ng-template [cdkPortalOutlet]=\"_calendarHeaderPortal\"></ng-template>\n\n<div class=\"mat-calendar-content\" cdkMonitorSubtreeFocus tabindex=\"-1\">\n  @switch (currentView) {\n    @case ('month') {\n        <mat-month-view\n            [(activeDate)]=\"activeDate\"\n            [selected]=\"selected\"\n            [dateFilter]=\"dateFilter\"\n            [maxDate]=\"maxDate\"\n            [minDate]=\"minDate\"\n            [dateClass]=\"dateClass\"\n            [comparisonStart]=\"comparisonStart\"\n            [comparisonEnd]=\"comparisonEnd\"\n            [startDateAccessibleName]=\"startDateAccessibleName\"\n            [endDateAccessibleName]=\"endDateAccessibleName\"\n            (_userSelection)=\"_dateSelected($event)\"\n            (dragStarted)=\"_dragStarted($event)\"\n            (dragEnded)=\"_dragEnded($event)\"\n            [activeDrag]=\"_activeDrag\"></mat-month-view>\n    }\n\n    @case ('year') {\n        <mat-year-view\n            [(activeDate)]=\"activeDate\"\n            [selected]=\"selected\"\n            [dateFilter]=\"dateFilter\"\n            [maxDate]=\"maxDate\"\n            [minDate]=\"minDate\"\n            [dateClass]=\"dateClass\"\n            (monthSelected)=\"_monthSelectedInYearView($event)\"\n            (selectedChange)=\"_goToDateInView($event, 'month')\"></mat-year-view>\n    }\n\n    @case ('multi-year') {\n        <mat-multi-year-view\n            [(activeDate)]=\"activeDate\"\n            [selected]=\"selected\"\n            [dateFilter]=\"dateFilter\"\n            [maxDate]=\"maxDate\"\n            [minDate]=\"minDate\"\n            [dateClass]=\"dateClass\"\n            (yearSelected)=\"_yearSelectedInMultiYearView($event)\"\n            (selectedChange)=\"_goToDateInView($event, 'year')\"></mat-multi-year-view>\n    }\n  }\n</div>\n", styles: [".mat-calendar{display:block;font-family:var(--mat-datepicker-calendar-text-font);font-size:var(--mat-datepicker-calendar-text-size)}.mat-calendar-header{padding:8px 8px 0 8px}.mat-calendar-content{padding:0 8px 8px 8px;outline:none}.mat-calendar-controls{display:flex;align-items:center;margin:5% calc(4.7142857143% - 16px)}.mat-calendar-spacer{flex:1 1 auto}.mat-calendar-period-button{min-width:0;margin:0 8px;font-size:var(--mat-datepicker-calendar-period-button-text-size);font-weight:var(--mat-datepicker-calendar-period-button-text-weight);--mdc-text-button-label-text-color:var(--mat-datepicker-calendar-period-button-text-color)}.mat-calendar-arrow{display:inline-block;width:10px;height:5px;margin:0 0 0 5px;vertical-align:middle;fill:var(--mat-datepicker-calendar-period-button-icon-color)}.mat-calendar-arrow.mat-calendar-invert{transform:rotate(180deg)}[dir=rtl] .mat-calendar-arrow{margin:0 5px 0 0}.cdk-high-contrast-active .mat-calendar-arrow{fill:CanvasText}.mat-calendar-previous-button,.mat-calendar-next-button{position:relative}.mat-datepicker-content .mat-calendar-previous-button:not(.mat-mdc-button-disabled),.mat-datepicker-content .mat-calendar-next-button:not(.mat-mdc-button-disabled){color:var(--mat-datepicker-calendar-navigation-button-icon-color)}.mat-calendar-previous-button::after,.mat-calendar-next-button::after{top:0;left:0;right:0;bottom:0;position:absolute;content:\"\";margin:15.5px;border:0 solid currentColor;border-top-width:2px}[dir=rtl] .mat-calendar-previous-button,[dir=rtl] .mat-calendar-next-button{transform:rotate(180deg)}.mat-calendar-previous-button::after{border-left-width:2px;transform:translateX(2px) rotate(-45deg)}.mat-calendar-next-button::after{border-right-width:2px;transform:translateX(-2px) rotate(45deg)}.mat-calendar-table{border-spacing:0;border-collapse:collapse;width:100%}.mat-calendar-table-header th{text-align:center;padding:0 0 8px 0;color:var(--mat-datepicker-calendar-header-text-color);font-size:var(--mat-datepicker-calendar-header-text-size);font-weight:var(--mat-datepicker-calendar-header-text-weight)}.mat-calendar-table-header-divider{position:relative;height:1px}.mat-calendar-table-header-divider::after{content:\"\";position:absolute;top:0;left:-8px;right:-8px;height:1px;background:var(--mat-datepicker-calendar-header-divider-color)}.mat-calendar-body-cell-content::before{margin:calc(calc(var(--mat-focus-indicator-border-width, 3px) + 3px)*-1)}.mat-calendar-body-cell:focus .mat-focus-indicator::before{content:\"\"}"], dependencies: [{ kind: "directive", type: CdkPortalOutlet, selector: "[cdkPortalOutlet]", inputs: ["cdkPortalOutlet"], outputs: ["attached"], exportAs: ["cdkPortalOutlet"] }, { kind: "directive", type: CdkMonitorFocus, selector: "[cdkMonitorElementFocus], [cdkMonitorSubtreeFocus]", outputs: ["cdkFocusChange"], exportAs: ["cdkMonitorFocus"] }, { kind: "component", type: MatMonthView, selector: "mat-month-view", inputs: ["activeDate", "selected", "minDate", "maxDate", "dateFilter", "dateClass", "comparisonStart", "comparisonEnd", "startDateAccessibleName", "endDateAccessibleName", "activeDrag"], outputs: ["selectedChange", "_userSelection", "dragStarted", "dragEnded", "activeDateChange"], exportAs: ["matMonthView"] }, { kind: "component", type: MatYearView, selector: "mat-year-view", inputs: ["activeDate", "selected", "minDate", "maxDate", "dateFilter", "dateClass"], outputs: ["selectedChange", "monthSelected", "activeDateChange"], exportAs: ["matYearView"] }, { kind: "component", type: MatMultiYearView, selector: "mat-multi-year-view", inputs: ["activeDate", "selected", "minDate", "maxDate", "dateFilter", "dateClass"], outputs: ["selectedChange", "yearSelected", "activeDateChange"], exportAs: ["matMultiYearView"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.2.0", ngImport: i0, type: MatCalendar, decorators: [{
            type: Component,
            args: [{ selector: 'mat-calendar', host: {
                        'class': 'mat-calendar',
                    }, exportAs: 'matCalendar', encapsulation: ViewEncapsulation.None, changeDetection: ChangeDetectionStrategy.OnPush, providers: [MAT_SINGLE_DATE_SELECTION_MODEL_PROVIDER], standalone: true, imports: [CdkPortalOutlet, CdkMonitorFocus, MatMonthView, MatYearView, MatMultiYearView], template: "<ng-template [cdkPortalOutlet]=\"_calendarHeaderPortal\"></ng-template>\n\n<div class=\"mat-calendar-content\" cdkMonitorSubtreeFocus tabindex=\"-1\">\n  @switch (currentView) {\n    @case ('month') {\n        <mat-month-view\n            [(activeDate)]=\"activeDate\"\n            [selected]=\"selected\"\n            [dateFilter]=\"dateFilter\"\n            [maxDate]=\"maxDate\"\n            [minDate]=\"minDate\"\n            [dateClass]=\"dateClass\"\n            [comparisonStart]=\"comparisonStart\"\n            [comparisonEnd]=\"comparisonEnd\"\n            [startDateAccessibleName]=\"startDateAccessibleName\"\n            [endDateAccessibleName]=\"endDateAccessibleName\"\n            (_userSelection)=\"_dateSelected($event)\"\n            (dragStarted)=\"_dragStarted($event)\"\n            (dragEnded)=\"_dragEnded($event)\"\n            [activeDrag]=\"_activeDrag\"></mat-month-view>\n    }\n\n    @case ('year') {\n        <mat-year-view\n            [(activeDate)]=\"activeDate\"\n            [selected]=\"selected\"\n            [dateFilter]=\"dateFilter\"\n            [maxDate]=\"maxDate\"\n            [minDate]=\"minDate\"\n            [dateClass]=\"dateClass\"\n            (monthSelected)=\"_monthSelectedInYearView($event)\"\n            (selectedChange)=\"_goToDateInView($event, 'month')\"></mat-year-view>\n    }\n\n    @case ('multi-year') {\n        <mat-multi-year-view\n            [(activeDate)]=\"activeDate\"\n            [selected]=\"selected\"\n            [dateFilter]=\"dateFilter\"\n            [maxDate]=\"maxDate\"\n            [minDate]=\"minDate\"\n            [dateClass]=\"dateClass\"\n            (yearSelected)=\"_yearSelectedInMultiYearView($event)\"\n            (selectedChange)=\"_goToDateInView($event, 'year')\"></mat-multi-year-view>\n    }\n  }\n</div>\n", styles: [".mat-calendar{display:block;font-family:var(--mat-datepicker-calendar-text-font);font-size:var(--mat-datepicker-calendar-text-size)}.mat-calendar-header{padding:8px 8px 0 8px}.mat-calendar-content{padding:0 8px 8px 8px;outline:none}.mat-calendar-controls{display:flex;align-items:center;margin:5% calc(4.7142857143% - 16px)}.mat-calendar-spacer{flex:1 1 auto}.mat-calendar-period-button{min-width:0;margin:0 8px;font-size:var(--mat-datepicker-calendar-period-button-text-size);font-weight:var(--mat-datepicker-calendar-period-button-text-weight);--mdc-text-button-label-text-color:var(--mat-datepicker-calendar-period-button-text-color)}.mat-calendar-arrow{display:inline-block;width:10px;height:5px;margin:0 0 0 5px;vertical-align:middle;fill:var(--mat-datepicker-calendar-period-button-icon-color)}.mat-calendar-arrow.mat-calendar-invert{transform:rotate(180deg)}[dir=rtl] .mat-calendar-arrow{margin:0 5px 0 0}.cdk-high-contrast-active .mat-calendar-arrow{fill:CanvasText}.mat-calendar-previous-button,.mat-calendar-next-button{position:relative}.mat-datepicker-content .mat-calendar-previous-button:not(.mat-mdc-button-disabled),.mat-datepicker-content .mat-calendar-next-button:not(.mat-mdc-button-disabled){color:var(--mat-datepicker-calendar-navigation-button-icon-color)}.mat-calendar-previous-button::after,.mat-calendar-next-button::after{top:0;left:0;right:0;bottom:0;position:absolute;content:\"\";margin:15.5px;border:0 solid currentColor;border-top-width:2px}[dir=rtl] .mat-calendar-previous-button,[dir=rtl] .mat-calendar-next-button{transform:rotate(180deg)}.mat-calendar-previous-button::after{border-left-width:2px;transform:translateX(2px) rotate(-45deg)}.mat-calendar-next-button::after{border-right-width:2px;transform:translateX(-2px) rotate(45deg)}.mat-calendar-table{border-spacing:0;border-collapse:collapse;width:100%}.mat-calendar-table-header th{text-align:center;padding:0 0 8px 0;color:var(--mat-datepicker-calendar-header-text-color);font-size:var(--mat-datepicker-calendar-header-text-size);font-weight:var(--mat-datepicker-calendar-header-text-weight)}.mat-calendar-table-header-divider{position:relative;height:1px}.mat-calendar-table-header-divider::after{content:\"\";position:absolute;top:0;left:-8px;right:-8px;height:1px;background:var(--mat-datepicker-calendar-header-divider-color)}.mat-calendar-body-cell-content::before{margin:calc(calc(var(--mat-focus-indicator-border-width, 3px) + 3px)*-1)}.mat-calendar-body-cell:focus .mat-focus-indicator::before{content:\"\"}"] }]
        }], ctorParameters: () => [{ type: i1.MatDatepickerIntl }, { type: i2.DateAdapter, decorators: [{
                    type: Optional
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [MAT_DATE_FORMATS]
                }] }, { type: i0.ChangeDetectorRef }], propDecorators: { headerComponent: [{
                type: Input
            }], startAt: [{
                type: Input
            }], startView: [{
                type: Input
            }], selected: [{
                type: Input
            }], minDate: [{
                type: Input
            }], maxDate: [{
                type: Input
            }], dateFilter: [{
                type: Input
            }], dateClass: [{
                type: Input
            }], comparisonStart: [{
                type: Input
            }], comparisonEnd: [{
                type: Input
            }], startDateAccessibleName: [{
                type: Input
            }], endDateAccessibleName: [{
                type: Input
            }], selectedChange: [{
                type: Output
            }], yearSelected: [{
                type: Output
            }], monthSelected: [{
                type: Output
            }], viewChanged: [{
                type: Output
            }], _userSelection: [{
                type: Output
            }], _userDragDrop: [{
                type: Output
            }], monthView: [{
                type: ViewChild,
                args: [MatMonthView]
            }], yearView: [{
                type: ViewChild,
                args: [MatYearView]
            }], multiYearView: [{
                type: ViewChild,
                args: [MatMultiYearView]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FsZW5kYXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvZGF0ZXBpY2tlci9jYWxlbmRhci50cyIsIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9kYXRlcGlja2VyL2NhbGVuZGFyLWhlYWRlci5odG1sIiwiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL2RhdGVwaWNrZXIvY2FsZW5kYXIuaHRtbCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsZUFBZSxFQUFFLGVBQWUsRUFBd0IsTUFBTSxxQkFBcUIsQ0FBQztBQUM1RixPQUFPLEVBR0wsdUJBQXVCLEVBQ3ZCLGlCQUFpQixFQUNqQixTQUFTLEVBQ1QsWUFBWSxFQUNaLFVBQVUsRUFDVixNQUFNLEVBQ04sS0FBSyxFQUdMLFFBQVEsRUFDUixNQUFNLEVBR04sU0FBUyxFQUNULGlCQUFpQixHQUNsQixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUMsV0FBVyxFQUFFLGdCQUFnQixFQUFpQixNQUFNLHdCQUF3QixDQUFDO0FBQ3JGLE9BQU8sRUFBQyxPQUFPLEVBQWUsTUFBTSxNQUFNLENBQUM7QUFFM0MsT0FBTyxFQUFDLDBCQUEwQixFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDL0QsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDcEQsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUMxQyxPQUFPLEVBQ0wsZUFBZSxFQUNmLG1CQUFtQixFQUNuQixnQkFBZ0IsRUFDaEIsWUFBWSxHQUNiLE1BQU0sbUJBQW1CLENBQUM7QUFDM0IsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUN4QyxPQUFPLEVBQUMsd0NBQXdDLEVBQUUsU0FBUyxFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFDM0YsT0FBTyxFQUFD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LGVBQWUsRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFLGdCQUFnQixDQUFDOzswQkFnS3JGLFFBQVE7OzBCQUNSLFFBQVE7OzBCQUFJLE1BQU07MkJBQUMsZ0JBQWdCO3lFQTdKN0IsZUFBZTtzQkFBdkIsS0FBSztnQkFnQkYsT0FBTztzQkFEVixLQUFLO2dCQVVHLFNBQVM7c0JBQWpCLEtBQUs7Z0JBSUYsUUFBUTtzQkFEWCxLQUFLO2dCQWVGLE9BQU87c0JBRFYsS0FBSztnQkFXRixPQUFPO3NCQURWLEtBQUs7Z0JBVUcsVUFBVTtzQkFBbEIsS0FBSztnQkFHRyxTQUFTO3NCQUFqQixLQUFLO2dCQUdHLGVBQWU7c0JBQXZCLEtBQUs7Z0JBR0csYUFBYTtzQkFBckIsS0FBSztnQkFHRyx1QkFBdUI7c0JBQS9CLEtBQUs7Z0JBR0cscUJBQXFCO3NCQUE3QixLQUFLO2dCQUdhLGNBQWM7c0JBQWhDLE1BQU07Z0JBTVksWUFBWTtzQkFBOUIsTUFBTTtnQkFNWSxhQUFhO3NCQUEvQixNQUFNO2dCQUtZLFdBQVc7c0JBQTdCLE1BQU07Z0JBS1ksY0FBYztzQkFBaEMsTUFBTTtnQkFJWSxhQUFhO3NCQUEvQixNQUFNO2dCQUdrQixTQUFTO3NCQUFqQyxTQUFTO3VCQUFDLFlBQVk7Z0JBR0MsUUFBUTtzQkFBL0IsU0FBUzt1QkFBQyxXQUFXO2dCQUdPLGFBQWE7c0JBQXpDLFNBQVM7dUJBQUMsZ0JBQWdCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q2RrUG9ydGFsT3V0bGV0LCBDb21wb25lbnRQb3J0YWwsIENvbXBvbmVudFR5cGUsIFBvcnRhbH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BvcnRhbCc7XG5pbXBvcnQge1xuICBBZnRlckNvbnRlbnRJbml0LFxuICBBZnRlclZpZXdDaGVja2VkLFxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gIENvbXBvbmVudCxcbiAgRXZlbnRFbWl0dGVyLFxuICBmb3J3YXJkUmVmLFxuICBJbmplY3QsXG4gIElucHV0LFxuICBPbkNoYW5nZXMsXG4gIE9uRGVzdHJveSxcbiAgT3B0aW9uYWwsXG4gIE91dHB1dCxcbiAgU2ltcGxlQ2hhbmdlLFxuICBTaW1wbGVDaGFuZ2VzLFxuICBWaWV3Q2hpbGQsXG4gIFZpZXdFbmNhcHN1bGF0aW9uLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7RGF0ZUFkYXB0ZXIsIE1BVF9EQVRFX0ZPUk1BVFMsIE1hdERhdGVGb3JtYXRzfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9jb3JlJztcbmltcG9ydCB7U3ViamVjdCwgU3Vic2NyaXB0aW9ufSBmcm9tICdyeGpzJztcbmltcG9ydCB7TWF0Q2FsZW5kYXJVc2VyRXZlbnQsIE1hdENhbGVuZGFyQ2VsbENsYXNzRnVuY3Rpb259IGZyb20gJy4vY2FsZW5kYXItYm9keSc7XG5pbXBvcnQge2NyZWF0ZU1pc3NpbmdEYXRlSW1wbEVycm9yfSBmcm9tICcuL2RhdGVwaWNrZXItZXJyb3JzJztcbmltcG9ydCB7TWF0RGF0ZXBpY2tlckludGx9IGZyb20gJy4vZGF0ZXBpY2tlci1pbnRsJztcbmltcG9ydCB7TWF0TW9udGhWaWV3fSBmcm9tICcuL21vbnRoLXZpZXcnO1xuaW1wb3J0IHtcbiAgZ2V0QWN0aXZlT2Zmc2V0LFxuICBpc1NhbWVNdWx0aVllYXJWaWV3LFxuICBNYXRNdWx0aVllYXJWaWV3LFxuICB5ZWFyc1BlclBhZ2UsXG59IGZyb20gJy4vbXVsdGkteWVhci12aWV3JztcbmltcG9ydCB7TWF0WWVhclZpZXd9IGZyb20gJy4veWVhci12aWV3JztcbmltcG9ydCB7TUFUX1NJTkdMRV9EQVRFX1NFTEVDVElPTl9NT0RFTF9QUk9WSURFUiwgRGF0ZVJhbmdlfSBmcm9tICcuL2RhdGUtc2VsZWN0aW9uLW1vZGVsJztcbmltcG9ydCB7TWF0SWNvbkJ1dHRvbiwgTWF0QnV0dG9ufSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9idXR0b24nO1xuaW1wb3J0IHtDZGtNb25pdG9yRm9jdXN9IGZyb20gJ0Bhbmd1bGFyL2Nkay9hMTF5JztcblxubGV0IGNhbGVuZGFySGVhZGVySWQgPSAxO1xuXG4vKipcbiAqIFBvc3NpYmxlIHZpZXdzIGZvciB0aGUgY2FsZW5kYXIuXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbmV4cG9ydCB0eXBlIE1hdENhbGVuZGFyVmlldyA9ICdtb250aCcgfCAneWVhcicgfCAnbXVsdGkteWVhcic7XG5cbi8qKiBEZWZhdWx0IGhlYWRlciBmb3IgTWF0Q2FsZW5kYXIgKi9cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ21hdC1jYWxlbmRhci1oZWFkZXInLFxuICB0ZW1wbGF0ZVVybDogJ2NhbGVuZGFyLWhlYWRlci5odG1sJyxcbiAgZXhwb3J0QXM6ICdtYXRDYWxlbmRhckhlYWRlcicsXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxuICBzdGFuZGFsb25lOiB0cnVlLFxuICBpbXBvcnRzOiBbTWF0QnV0dG9uLCBNYXRJY29uQnV0dG9uXSxcbn0pXG5leHBvcnQgY2xhc3MgTWF0Q2FsZW5kYXJIZWFkZXI8RD4ge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIF9pbnRsOiBNYXREYXRlcGlja2VySW50bCxcbiAgICBASW5qZWN0KGZvcndhcmRSZWYoKCkgPT4gTWF0Q2FsZW5kYXIpKSBwdWJsaWMgY2FsZW5kYXI6IE1hdENhbGVuZGFyPEQ+LFxuICAgIEBPcHRpb25hbCgpIHByaXZhdGUgX2RhdGVBZGFwdGVyOiBEYXRlQWRhcHRlcjxEPixcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KE1BVF9EQVRFX0ZPUk1BVFMpIHByaXZhdGUgX2RhdGVGb3JtYXRzOiBNYXREYXRlRm9ybWF0cyxcbiAgICBjaGFuZ2VEZXRlY3RvclJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gICkge1xuICAgIHRoaXMuY2FsZW5kYXIuc3RhdGVDaGFuZ2VzLnN1YnNjcmliZSgoKSA9PiBjaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKSk7XG4gIH1cblxuICAvKiogVGhlIGRpc3BsYXkgdGV4dCBmb3IgdGhlIGN1cnJlbnQgY2FsZW5kYXIgdmlldy4gKi9cbiAgZ2V0IHBlcmlvZEJ1dHRvblRleHQoKTogc3RyaW5nIHtcbiAgICBpZiAodGhpcy5jYWxlbmRhci5jdXJyZW50VmlldyA9PSAnbW9udGgnKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZGF0ZUFkYXB0ZXJcbiAgICAgICAgLmZvcm1hdCh0aGlzLmNhbGVuZGFyLmFjdGl2ZURhdGUsIHRoaXMuX2RhdGVGb3JtYXRzLmRpc3BsYXkubW9udGhZZWFyTGFiZWwpXG4gICAgICAgIC50b0xvY2FsZVVwcGVyQ2FzZSgpO1xuICAgIH1cbiAgICBpZiAodGhpcy5jYWxlbmRhci5jdXJyZW50VmlldyA9PSAneWVhcicpIHtcbiAgICAgIHJldHVybiB0aGlzLl9kYXRlQWRhcHRlci5nZXRZZWFyTmFtZSh0aGlzLmNhbGVuZGFyLmFjdGl2ZURhdGUpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9pbnRsLmZvcm1hdFllYXJSYW5nZSguLi50aGlzLl9mb3JtYXRNaW5BbmRNYXhZZWFyTGFiZWxzKCkpO1xuICB9XG5cbiAgLyoqIFRoZSBhcmlhIGRlc2NyaXB0aW9uIGZvciB0aGUgY3VycmVudCBjYWxlbmRhciB2aWV3LiAqL1xuICBnZXQgcGVyaW9kQnV0dG9uRGVzY3JpcHRpb24oKTogc3RyaW5nIHtcbiAgICBpZiAodGhpcy5jYWxlbmRhci5jdXJyZW50VmlldyA9PSAnbW9udGgnKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZGF0ZUFkYXB0ZXJcbiAgICAgICAgLmZvcm1hdCh0aGlzLmNhbGVuZGFyLmFjdGl2ZURhdGUsIHRoaXMuX2RhdGVGb3JtYXRzLmRpc3BsYXkubW9udGhZZWFyTGFiZWwpXG4gICAgICAgIC50b0xvY2FsZVVwcGVyQ2FzZSgpO1xuICAgIH1cbiAgICBpZiAodGhpcy5jYWxlbmRhci5jdXJyZW50VmlldyA9PSAneWVhcicpIHtcbiAgICAgIHJldHVybiB0aGlzLl9kYXRlQWRhcHRlci5nZXRZZWFyTmFtZSh0aGlzLmNhbGVuZGFyLmFjdGl2ZURhdGUpO1xuICAgIH1cblxuICAgIC8vIEZvcm1hdCBhIGxhYmVsIGZvciB0aGUgd2luZG93IG9mIHllYXJzIGRpc3BsYXllZCBpbiB0aGUgbXVsdGkteWVhciBjYWxlbmRhciB2aWV3LiBVc2VcbiAgICAvLyBgZm9ybWF0WWVhclJhbmdlTGFiZWxgIGJlY2F1c2UgaXQgaXMgVFRTIGZyaWVuZGx5LlxuICAgIHJldHVybiB0aGlzLl9pbnRsLmZvcm1hdFllYXJSYW5nZUxhYmVsKC4uLnRoaXMuX2Zvcm1hdE1pbkFuZE1heFllYXJMYWJlbHMoKSk7XG4gIH1cblxuICAvKiogVGhlIGBhcmlhLWxhYmVsYCBmb3IgY2hhbmdpbmcgdGhlIGNhbGVuZGFyIHZpZXcuICovXG4gIGdldCBwZXJpb2RCdXR0b25MYWJlbCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmNhbGVuZGFyLmN1cnJlbnRWaWV3ID09ICdtb250aCdcbiAgICAgID8gdGhpcy5faW50bC5zd2l0Y2hUb011bHRpWWVhclZpZXdMYWJlbFxuICAgICAgOiB0aGlzLl9pbnRsLnN3aXRjaFRvTW9udGhWaWV3TGFiZWw7XG4gIH1cblxuICAvKiogVGhlIGxhYmVsIGZvciB0aGUgcHJldmlvdXMgYnV0dG9uLiAqL1xuICBnZXQgcHJldkJ1dHRvbkxhYmVsKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHtcbiAgICAgICdtb250aCc6IHRoaXMuX2ludGwucHJldk1vbnRoTGFiZWwsXG4gICAgICAneWVhcic6IHRoaXMuX2ludGwucHJldlllYXJMYWJlbCxcbiAgICAgICdtdWx0aS15ZWFyJzogdGhpcy5faW50bC5wcmV2TXVsdGlZZWFyTGFiZWwsXG4gICAgfVt0aGlzLmNhbGVuZGFyLmN1cnJlbnRWaWV3XTtcbiAgfVxuXG4gIC8qKiBUaGUgbGFiZWwgZm9yIHRoZSBuZXh0IGJ1dHRvbi4gKi9cbiAgZ2V0IG5leHRCdXR0b25MYWJlbCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB7XG4gICAgICAnbW9udGgnOiB0aGlzLl9pbnRsLm5leHRNb250aExhYmVsLFxuICAgICAgJ3llYXInOiB0aGlzLl9pbnRsLm5leHRZZWFyTGFiZWwsXG4gICAgICAnbXVsdGkteWVhcic6IHRoaXMuX2ludGwubmV4dE11bHRpWWVhckxhYmVsLFxuICAgIH1bdGhpcy5jYWxlbmRhci5jdXJyZW50Vmlld107XG4gIH1cblxuICAvKiogSGFuZGxlcyB1c2VyIGNsaWNrcyBvbiB0aGUgcGVyaW9kIGxhYmVsLiAqL1xuICBjdXJyZW50UGVyaW9kQ2xpY2tlZCgpOiB2b2lkIHtcbiAgICB0aGlzLmNhbGVuZGFyLmN1cnJlbnRWaWV3ID0gdGhpcy5jYWxlbmRhci5jdXJyZW50VmlldyA9PSAnbW9udGgnID8gJ211bHRpLXllYXInIDogJ21vbnRoJztcbiAgfVxuXG4gIC8qKiBIYW5kbGVzIHVzZXIgY2xpY2tzIG9uIHRoZSBwcmV2aW91cyBidXR0b24uICovXG4gIHByZXZpb3VzQ2xpY2tlZCgpOiB2b2lkIHtcbiAgICB0aGlzLmNhbGVuZGFyLmFjdGl2ZURhdGUgPVxuICAgICAgdGhpcy5jYWxlbmRhci5jdXJyZW50VmlldyA9PSAnbW9udGgnXG4gICAgICAgID8gdGhpcy5fZGF0ZUFkYXB0ZXIuYWRkQ2FsZW5kYXJNb250aHModGhpcy5jYWxlbmRhci5hY3RpdmVEYXRlLCAtMSlcbiAgICAgICAgOiB0aGlzLl9kYXRlQWRhcHRlci5hZGRDYWxlbmRhclllYXJzKFxuICAgICAgICAgICAgdGhpcy5jYWxlbmRhci5hY3RpdmVEYXRlLFxuICAgICAgICAgICAgdGhpcy5jYWxlbmRhci5jdXJyZW50VmlldyA9PSAneWVhcicgPyAtMSA6IC15ZWFyc1BlclBhZ2UsXG4gICAgICAgICAgKTtcbiAgfVxuXG4gIC8qKiBIYW5kbGVzIHVzZXIgY2xpY2tzIG9uIHRoZSBuZXh0IGJ1dHRvbi4gKi9cbiAgbmV4dENsaWNrZWQoKTogdm9pZCB7XG4gICAgdGhpcy5jYWxlbmRhci5hY3RpdmVEYXRlID1cbiAgICAgIHRoaXMuY2FsZW5kYXIuY3VycmVudFZpZXcgPT0gJ21vbnRoJ1xuICAgICAgICA/IHRoaXMuX2RhdGVBZGFwdGVyLmFkZENhbGVuZGFyTW9udGhzKHRoaXMuY2FsZW5kYXIuYWN0aXZlRGF0ZSwgMSlcbiAgICAgICAgOiB0aGlzLl9kYXRlQWRhcHRlci5hZGRDYWxlbmRhclllYXJzKFxuICAgICAgICAgICAgdGhpcy5jYWxlbmRhci5hY3RpdmVEYXRlLFxuICAgICAgICAgICAgdGhpcy5jYWxlbmRhci5jdXJyZW50VmlldyA9PSAneWVhcicgPyAxIDogeWVhcnNQZXJQYWdlLFxuICAgICAgICAgICk7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgcHJldmlvdXMgcGVyaW9kIGJ1dHRvbiBpcyBlbmFibGVkLiAqL1xuICBwcmV2aW91c0VuYWJsZWQoKTogYm9vbGVhbiB7XG4gICAgaWYgKCF0aGlzLmNhbGVuZGFyLm1pbkRhdGUpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gKFxuICAgICAgIXRoaXMuY2FsZW5kYXIubWluRGF0ZSB8fCAhdGhpcy5faXNTYW1lVmlldyh0aGlzLmNhbGVuZGFyLmFjdGl2ZURhdGUsIHRoaXMuY2FsZW5kYXIubWluRGF0ZSlcbiAgICApO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIG5leHQgcGVyaW9kIGJ1dHRvbiBpcyBlbmFibGVkLiAqL1xuICBuZXh0RW5hYmxlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gKFxuICAgICAgIXRoaXMuY2FsZW5kYXIubWF4RGF0ZSB8fCAhdGhpcy5faXNTYW1lVmlldyh0aGlzLmNhbGVuZGFyLmFjdGl2ZURhdGUsIHRoaXMuY2FsZW5kYXIubWF4RGF0ZSlcbiAgICApO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIHR3byBkYXRlcyByZXByZXNlbnQgdGhlIHNhbWUgdmlldyBpbiB0aGUgY3VycmVudCB2aWV3IG1vZGUgKG1vbnRoIG9yIHllYXIpLiAqL1xuICBwcml2YXRlIF9pc1NhbWVWaWV3KGRhdGUxOiBELCBkYXRlMjogRCk6IGJvb2xlYW4ge1xuICAgIGlmICh0aGlzLmNhbGVuZGFyLmN1cnJlbnRWaWV3ID09ICdtb250aCcpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIHRoaXMuX2RhdGVBZGFwdGVyLmdldFllYXIoZGF0ZTEpID09IHRoaXMuX2RhdGVBZGFwdGVyLmdldFllYXIoZGF0ZTIpICYmXG4gICAgICAgIHRoaXMuX2RhdGVBZGFwdGVyLmdldE1vbnRoKGRhdGUxKSA9PSB0aGlzLl9kYXRlQWRhcHRlci5nZXRNb250aChkYXRlMilcbiAgICAgICk7XG4gICAgfVxuICAgIGlmICh0aGlzLmNhbGVuZGFyLmN1cnJlbnRWaWV3ID09ICd5ZWFyJykge1xuICAgICAgcmV0dXJuIHRoaXMuX2RhdGVBZGFwdGVyLmdldFllYXIoZGF0ZTEpID09IHRoaXMuX2RhdGVBZGFwdGVyLmdldFllYXIoZGF0ZTIpO1xuICAgIH1cbiAgICAvLyBPdGhlcndpc2Ugd2UgYXJlIGluICdtdWx0aS15ZWFyJyB2aWV3LlxuICAgIHJldHVybiBpc1NhbWVNdWx0aVllYXJWaWV3KFxuICAgICAgdGhpcy5fZGF0ZUFkYXB0ZXIsXG4gICAgICBkYXRlMSxcbiAgICAgIGRhdGUyLFxuICAgICAgdGhpcy5jYWxlbmRhci5taW5EYXRlLFxuICAgICAgdGhpcy5jYWxlbmRhci5tYXhEYXRlLFxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogRm9ybWF0IHR3byBpbmRpdmlkdWFsIGxhYmVscyBmb3IgdGhlIG1pbmltdW0geWVhciBhbmQgbWF4aW11bSB5ZWFyIGF2YWlsYWJsZSBpbiB0aGUgbXVsdGkteWVhclxuICAgKiBjYWxlbmRhciB2aWV3LiBSZXR1cm5zIGFuIGFycmF5IG9mIHR3byBzdHJpbmdzIHdoZXJlIHRoZSBmaXJzdCBzdHJpbmcgaXMgdGhlIGZvcm1hdHRlZCBsYWJlbFxuICAgKiBmb3IgdGhlIG1pbmltdW0geWVhciwgYW5kIHRoZSBzZWNvbmQgc3RyaW5nIGlzIHRoZSBmb3JtYXR0ZWQgbGFiZWwgZm9yIHRoZSBtYXhpbXVtIHllYXIuXG4gICAqL1xuICBwcml2YXRlIF9mb3JtYXRNaW5BbmRNYXhZZWFyTGFiZWxzKCk6IFttaW5ZZWFyTGFiZWw6IHN0cmluZywgbWF4WWVhckxhYmVsOiBzdHJpbmddIHtcbiAgICAvLyBUaGUgb2Zmc2V0IGZyb20gdGhlIGFjdGl2ZSB5ZWFyIHRvIHRoZSBcInNsb3RcIiBmb3IgdGhlIHN0YXJ0aW5nIHllYXIgaXMgdGhlXG4gICAgLy8gKmFjdHVhbCogZmlyc3QgcmVuZGVyZWQgeWVhciBpbiB0aGUgbXVsdGkteWVhciB2aWV3LCBhbmQgdGhlIGxhc3QgeWVhciBpc1xuICAgIC8vIGp1c3QgeWVhcnNQZXJQYWdlIC0gMSBhd2F5LlxuICAgIGNvbnN0IGFjdGl2ZVllYXIgPSB0aGlzLl9kYXRlQWRhcHRlci5nZXRZZWFyKHRoaXMuY2FsZW5kYXIuYWN0aXZlRGF0ZSk7XG4gICAgY29uc3QgbWluWWVhck9mUGFnZSA9XG4gICAgICBhY3RpdmVZZWFyIC1cbiAgICAgIGdldEFjdGl2ZU9mZnNldChcbiAgICAgICAgdGhpcy5fZGF0ZUFkYXB0ZXIsXG4gICAgICAgIHRoaXMuY2FsZW5kYXIuYWN0aXZlRGF0ZSxcbiAgICAgICAgdGhpcy5jYWxlbmRhci5taW5EYXRlLFxuICAgICAgICB0aGlzLmNhbGVuZGFyLm1heERhdGUsXG4gICAgICApO1xuICAgIGNvbnN0IG1heFllYXJPZlBhZ2UgPSBtaW5ZZWFyT2ZQYWdlICsgeWVhcnNQZXJQYWdlIC0gMTtcbiAgICBjb25zdCBtaW5ZZWFyTGFiZWwgPSB0aGlzLl9kYXRlQWRhcHRlci5nZXRZZWFyTmFtZShcbiAgICAgIHRoaXMuX2RhdGVBZGFwdGVyLmNyZWF0ZURhdGUobWluWWVhck9mUGFnZSwgMCwgMSksXG4gICAgKTtcbiAgICBjb25zdCBtYXhZZWFyTGFiZWwgPSB0aGlzLl9kYXRlQWRhcHRlci5nZXRZZWFyTmFtZShcbiAgICAgIHRoaXMuX2RhdGVBZGFwdGVyLmNyZWF0ZURhdGUobWF4WWVhck9mUGFnZSwgMCwgMSksXG4gICAgKTtcblxuICAgIHJldHVybiBbbWluWWVhckxhYmVsLCBtYXhZZWFyTGFiZWxdO1xuICB9XG5cbiAgcHJpdmF0ZSBfaWQgPSBgbWF0LWNhbGVuZGFyLWhlYWRlci0ke2NhbGVuZGFySGVhZGVySWQrK31gO1xuXG4gIF9wZXJpb2RCdXR0b25MYWJlbElkID0gYCR7dGhpcy5faWR9LXBlcmlvZC1sYWJlbGA7XG59XG5cbi8qKiBBIGNhbGVuZGFyIHRoYXQgaXMgdXNlZCBhcyBwYXJ0IG9mIHRoZSBkYXRlcGlja2VyLiAqL1xuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbWF0LWNhbGVuZGFyJyxcbiAgdGVtcGxhdGVVcmw6ICdjYWxlbmRhci5odG1sJyxcbiAgc3R5bGVVcmw6ICdjYWxlbmRhci5jc3MnLFxuICBob3N0OiB7XG4gICAgJ2NsYXNzJzogJ21hdC1jYWxlbmRhcicsXG4gIH0sXG4gIGV4cG9ydEFzOiAnbWF0Q2FsZW5kYXInLFxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaCxcbiAgcHJvdmlkZXJzOiBbTUFUX1NJTkdMRV9EQVRFX1NFTEVDVElPTl9NT0RFTF9QUk9WSURFUl0sXG4gIHN0YW5kYWxvbmU6IHRydWUsXG4gIGltcG9ydHM6IFtDZGtQb3J0YWxPdXRsZXQsIENka01vbml0b3JGb2N1cywgTWF0TW9udGhWaWV3LCBNYXRZZWFyVmlldywgTWF0TXVsdGlZZWFyVmlld10sXG59KVxuZXhwb3J0IGNsYXNzIE1hdENhbGVuZGFyPEQ+IGltcGxlbWVudHMgQWZ0ZXJDb250ZW50SW5pdCwgQWZ0ZXJWaWV3Q2hlY2tlZCwgT25EZXN0cm95LCBPbkNoYW5nZXMge1xuICAvKiogQW4gaW5wdXQgaW5kaWNhdGluZyB0aGUgdHlwZSBvZiB0aGUgaGVhZGVyIGNvbXBvbmVudCwgaWYgc2V0LiAqL1xuICBASW5wdXQoKSBoZWFkZXJDb21wb25lbnQ6IENvbXBvbmVudFR5cGU8YW55PjtcblxuICAvKiogQSBwb3J0YWwgY29udGFpbmluZyB0aGUgaGVhZGVyIGNvbXBvbmVudCB0eXBlIGZvciB0aGlzIGNhbGVuZGFyLiAqL1xuICBfY2FsZW5kYXJIZWFkZXJQb3J0YWw6IFBvcnRhbDxhbnk+O1xuXG4gIHByaXZhdGUgX2ludGxDaGFuZ2VzOiBTdWJzY3JpcHRpb247XG5cbiAgLyoqXG4gICAqIFVzZWQgZm9yIHNjaGVkdWxpbmcgdGhhdCBmb2N1cyBzaG91bGQgYmUgbW92ZWQgdG8gdGhlIGFjdGl2ZSBjZWxsIG9uIHRoZSBuZXh0IHRpY2suXG4gICAqIFdlIG5lZWQgdG8gc2NoZWR1bGUgaXQsIHJhdGhlciB0aGFuIGRvIGl0IGltbWVkaWF0ZWx5LCBiZWNhdXNlIHdlIGhhdmUgdG8gd2FpdFxuICAgKiBmb3IgQW5ndWxhciB0byByZS1ldmFsdWF0ZSB0aGUgdmlldyBjaGlsZHJlbi5cbiAgICovXG4gIHByaXZhdGUgX21vdmVGb2N1c09uTmV4dFRpY2sgPSBmYWxzZTtcblxuICAvKiogQSBkYXRlIHJlcHJlc2VudGluZyB0aGUgcGVyaW9kIChtb250aCBvciB5ZWFyKSB0byBzdGFydCB0aGUgY2FsZW5kYXIgaW4uICovXG4gIEBJbnB1dCgpXG4gIGdldCBzdGFydEF0KCk6IEQgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fc3RhcnRBdDtcbiAgfVxuICBzZXQgc3RhcnRBdCh2YWx1ZTogRCB8IG51bGwpIHtcbiAgICB0aGlzLl9zdGFydEF0ID0gdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0VmFsaWREYXRlT3JOdWxsKHRoaXMuX2RhdGVBZGFwdGVyLmRlc2VyaWFsaXplKHZhbHVlKSk7XG4gIH1cbiAgcHJpdmF0ZSBfc3RhcnRBdDogRCB8IG51bGw7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGNhbGVuZGFyIHNob3VsZCBiZSBzdGFydGVkIGluIG1vbnRoIG9yIHllYXIgdmlldy4gKi9cbiAgQElucHV0KCkgc3RhcnRWaWV3OiBNYXRDYWxlbmRhclZpZXcgPSAnbW9udGgnO1xuXG4gIC8qKiBUaGUgY3VycmVudGx5IHNlbGVjdGVkIGRhdGUuICovXG4gIEBJbnB1dCgpXG4gIGdldCBzZWxlY3RlZCgpOiBEYXRlUmFuZ2U8RD4gfCBEIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX3NlbGVjdGVkO1xuICB9XG4gIHNldCBzZWxlY3RlZCh2YWx1ZTogRGF0ZVJhbmdlPEQ+IHwgRCB8IG51bGwpIHtcbiAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBEYXRlUmFuZ2UpIHtcbiAgICAgIHRoaXMuX3NlbGVjdGVkID0gdmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3NlbGVjdGVkID0gdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0VmFsaWREYXRlT3JOdWxsKHRoaXMuX2RhdGVBZGFwdGVyLmRlc2VyaWFsaXplKHZhbHVlKSk7XG4gICAgfVxuICB9XG4gIHByaXZhdGUgX3NlbGVjdGVkOiBEYXRlUmFuZ2U8RD4gfCBEIHwgbnVsbDtcblxuICAvKiogVGhlIG1pbmltdW0gc2VsZWN0YWJsZSBkYXRlLiAqL1xuICBASW5wdXQoKVxuICBnZXQgbWluRGF0ZSgpOiBEIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX21pbkRhdGU7XG4gIH1cbiAgc2V0IG1pbkRhdGUodmFsdWU6IEQgfCBudWxsKSB7XG4gICAgdGhpcy5fbWluRGF0ZSA9IHRoaXMuX2RhdGVBZGFwdGVyLmdldFZhbGlkRGF0ZU9yTnVsbCh0aGlzLl9kYXRlQWRhcHRlci5kZXNlcmlhbGl6ZSh2YWx1ZSkpO1xuICB9XG4gIHByaXZhdGUgX21pbkRhdGU6IEQgfCBudWxsO1xuXG4gIC8qKiBUaGUgbWF4aW11bSBzZWxlY3RhYmxlIGRhdGUuICovXG4gIEBJbnB1dCgpXG4gIGdldCBtYXhEYXRlKCk6IEQgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fbWF4RGF0ZTtcbiAgfVxuICBzZXQgbWF4RGF0ZSh2YWx1ZTogRCB8IG51bGwpIHtcbiAgICB0aGlzLl9tYXhEYXRlID0gdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0VmFsaWREYXRlT3JOdWxsKHRoaXMuX2RhdGVBZGFwdGVyLmRlc2VyaWFsaXplKHZhbHVlKSk7XG4gIH1cbiAgcHJpdmF0ZSBfbWF4RGF0ZTogRCB8IG51bGw7XG5cbiAgLyoqIEZ1bmN0aW9uIHVzZWQgdG8gZmlsdGVyIHdoaWNoIGRhdGVzIGFyZSBzZWxlY3RhYmxlLiAqL1xuICBASW5wdXQoKSBkYXRlRmlsdGVyOiAoZGF0ZTogRCkgPT4gYm9vbGVhbjtcblxuICAvKiogRnVuY3Rpb24gdGhhdCBjYW4gYmUgdXNlZCB0byBhZGQgY3VzdG9tIENTUyBjbGFzc2VzIHRvIGRhdGVzLiAqL1xuICBASW5wdXQoKSBkYXRlQ2xhc3M6IE1hdENhbGVuZGFyQ2VsbENsYXNzRnVuY3Rpb248RD47XG5cbiAgLyoqIFN0YXJ0IG9mIHRoZSBjb21wYXJpc29uIHJhbmdlLiAqL1xuICBASW5wdXQoKSBjb21wYXJpc29uU3RhcnQ6IEQgfCBudWxsO1xuXG4gIC8qKiBFbmQgb2YgdGhlIGNvbXBhcmlzb24gcmFuZ2UuICovXG4gIEBJbnB1dCgpIGNvbXBhcmlzb25FbmQ6IEQgfCBudWxsO1xuXG4gIC8qKiBBUklBIEFjY2Vzc2libGUgbmFtZSBvZiB0aGUgYDxpbnB1dCBtYXRTdGFydERhdGUvPmAgKi9cbiAgQElucHV0KCkgc3RhcnREYXRlQWNjZXNzaWJsZU5hbWU6IHN0cmluZyB8IG51bGw7XG5cbiAgLyoqIEFSSUEgQWNjZXNzaWJsZSBuYW1lIG9mIHRoZSBgPGlucHV0IG1hdEVuZERhdGUvPmAgKi9cbiAgQElucHV0KCkgZW5kRGF0ZUFjY2Vzc2libGVOYW1lOiBzdHJpbmcgfCBudWxsO1xuXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgZGF0ZSBjaGFuZ2VzLiAqL1xuICBAT3V0cHV0KCkgcmVhZG9ubHkgc2VsZWN0ZWRDaGFuZ2U6IEV2ZW50RW1pdHRlcjxEIHwgbnVsbD4gPSBuZXcgRXZlbnRFbWl0dGVyPEQgfCBudWxsPigpO1xuXG4gIC8qKlxuICAgKiBFbWl0cyB0aGUgeWVhciBjaG9zZW4gaW4gbXVsdGl5ZWFyIHZpZXcuXG4gICAqIFRoaXMgZG9lc24ndCBpbXBseSBhIGNoYW5nZSBvbiB0aGUgc2VsZWN0ZWQgZGF0ZS5cbiAgICovXG4gIEBPdXRwdXQoKSByZWFkb25seSB5ZWFyU2VsZWN0ZWQ6IEV2ZW50RW1pdHRlcjxEPiA9IG5ldyBFdmVudEVtaXR0ZXI8RD4oKTtcblxuICAvKipcbiAgICogRW1pdHMgdGhlIG1vbnRoIGNob3NlbiBpbiB5ZWFyIHZpZXcuXG4gICAqIFRoaXMgZG9lc24ndCBpbXBseSBhIGNoYW5nZSBvbiB0aGUgc2VsZWN0ZWQgZGF0ZS5cbiAgICovXG4gIEBPdXRwdXQoKSByZWFkb25seSBtb250aFNlbGVjdGVkOiBFdmVudEVtaXR0ZXI8RD4gPSBuZXcgRXZlbnRFbWl0dGVyPEQ+KCk7XG5cbiAgLyoqXG4gICAqIEVtaXRzIHdoZW4gdGhlIGN1cnJlbnQgdmlldyBjaGFuZ2VzLlxuICAgKi9cbiAgQE91dHB1dCgpIHJlYWRvbmx5IHZpZXdDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8TWF0Q2FsZW5kYXJWaWV3PiA9IG5ldyBFdmVudEVtaXR0ZXI8TWF0Q2FsZW5kYXJWaWV3PihcbiAgICB0cnVlLFxuICApO1xuXG4gIC8qKiBFbWl0cyB3aGVuIGFueSBkYXRlIGlzIHNlbGVjdGVkLiAqL1xuICBAT3V0cHV0KCkgcmVhZG9ubHkgX3VzZXJTZWxlY3Rpb246IEV2ZW50RW1pdHRlcjxNYXRDYWxlbmRhclVzZXJFdmVudDxEIHwgbnVsbD4+ID1cbiAgICBuZXcgRXZlbnRFbWl0dGVyPE1hdENhbGVuZGFyVXNlckV2ZW50PEQgfCBudWxsPj4oKTtcblxuICAvKiogRW1pdHMgYSBuZXcgZGF0ZSByYW5nZSB2YWx1ZSB3aGVuIHRoZSB1c2VyIGNvbXBsZXRlcyBhIGRyYWcgZHJvcCBvcGVyYXRpb24uICovXG4gIEBPdXRwdXQoKSByZWFkb25seSBfdXNlckRyYWdEcm9wID0gbmV3IEV2ZW50RW1pdHRlcjxNYXRDYWxlbmRhclVzZXJFdmVudDxEYXRlUmFuZ2U8RD4+PigpO1xuXG4gIC8qKiBSZWZlcmVuY2UgdG8gdGhlIGN1cnJlbnQgbW9udGggdmlldyBjb21wb25lbnQuICovXG4gIEBWaWV3Q2hpbGQoTWF0TW9udGhWaWV3KSBtb250aFZpZXc6IE1hdE1vbnRoVmlldzxEPjtcblxuICAvKiogUmVmZXJlbmNlIHRvIHRoZSBjdXJyZW50IHllYXIgdmlldyBjb21wb25lbnQuICovXG4gIEBWaWV3Q2hpbGQoTWF0WWVhclZpZXcpIHllYXJWaWV3OiBNYXRZZWFyVmlldzxEPjtcblxuICAvKiogUmVmZXJlbmNlIHRvIHRoZSBjdXJyZW50IG11bHRpLXllYXIgdmlldyBjb21wb25lbnQuICovXG4gIEBWaWV3Q2hpbGQoTWF0TXVsdGlZZWFyVmlldykgbXVsdGlZZWFyVmlldzogTWF0TXVsdGlZZWFyVmlldzxEPjtcblxuICAvKipcbiAgICogVGhlIGN1cnJlbnQgYWN0aXZlIGRhdGUuIFRoaXMgZGV0ZXJtaW5lcyB3aGljaCB0aW1lIHBlcmlvZCBpcyBzaG93biBhbmQgd2hpY2ggZGF0ZSBpc1xuICAgKiBoaWdobGlnaHRlZCB3aGVuIHVzaW5nIGtleWJvYXJkIG5hdmlnYXRpb24uXG4gICAqL1xuICBnZXQgYWN0aXZlRGF0ZSgpOiBEIHtcbiAgICByZXR1cm4gdGhpcy5fY2xhbXBlZEFjdGl2ZURhdGU7XG4gIH1cbiAgc2V0IGFjdGl2ZURhdGUodmFsdWU6IEQpIHtcbiAgICB0aGlzLl9jbGFtcGVkQWN0aXZlRGF0ZSA9IHRoaXMuX2RhdGVBZGFwdGVyLmNsYW1wRGF0ZSh2YWx1ZSwgdGhpcy5taW5EYXRlLCB0aGlzLm1heERhdGUpO1xuICAgIHRoaXMuc3RhdGVDaGFuZ2VzLm5leHQoKTtcbiAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKTtcbiAgfVxuICBwcml2YXRlIF9jbGFtcGVkQWN0aXZlRGF0ZTogRDtcblxuICAvKiogV2hldGhlciB0aGUgY2FsZW5kYXIgaXMgaW4gbW9udGggdmlldy4gKi9cbiAgZ2V0IGN1cnJlbnRWaWV3KCk6IE1hdENhbGVuZGFyVmlldyB7XG4gICAgcmV0dXJuIHRoaXMuX2N1cnJlbnRWaWV3O1xuICB9XG4gIHNldCBjdXJyZW50Vmlldyh2YWx1ZTogTWF0Q2FsZW5kYXJWaWV3KSB7XG4gICAgY29uc3Qgdmlld0NoYW5nZWRSZXN1bHQgPSB0aGlzLl9jdXJyZW50VmlldyAhPT0gdmFsdWUgPyB2YWx1ZSA6IG51bGw7XG4gICAgdGhpcy5fY3VycmVudFZpZXcgPSB2YWx1ZTtcbiAgICB0aGlzLl9tb3ZlRm9jdXNPbk5leHRUaWNrID0gdHJ1ZTtcbiAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKTtcbiAgICBpZiAodmlld0NoYW5nZWRSZXN1bHQpIHtcbiAgICAgIHRoaXMudmlld0NoYW5nZWQuZW1pdCh2aWV3Q2hhbmdlZFJlc3VsdCk7XG4gICAgfVxuICB9XG4gIHByaXZhdGUgX2N1cnJlbnRWaWV3OiBNYXRDYWxlbmRhclZpZXc7XG5cbiAgLyoqIE9yaWdpbiBvZiBhY3RpdmUgZHJhZywgb3IgbnVsbCB3aGVuIGRyYWdnaW5nIGlzIG5vdCBhY3RpdmUuICovXG4gIHByb3RlY3RlZCBfYWN0aXZlRHJhZzogTWF0Q2FsZW5kYXJVc2VyRXZlbnQ8RD4gfCBudWxsID0gbnVsbDtcblxuICAvKipcbiAgICogRW1pdHMgd2hlbmV2ZXIgdGhlcmUgaXMgYSBzdGF0ZSBjaGFuZ2UgdGhhdCB0aGUgaGVhZGVyIG1heSBuZWVkIHRvIHJlc3BvbmQgdG8uXG4gICAqL1xuICByZWFkb25seSBzdGF0ZUNoYW5nZXMgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIF9pbnRsOiBNYXREYXRlcGlja2VySW50bCxcbiAgICBAT3B0aW9uYWwoKSBwcml2YXRlIF9kYXRlQWRhcHRlcjogRGF0ZUFkYXB0ZXI8RD4sXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChNQVRfREFURV9GT1JNQVRTKSBwcml2YXRlIF9kYXRlRm9ybWF0czogTWF0RGF0ZUZvcm1hdHMsXG4gICAgcHJpdmF0ZSBfY2hhbmdlRGV0ZWN0b3JSZWY6IENoYW5nZURldGVjdG9yUmVmLFxuICApIHtcbiAgICBpZiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSB7XG4gICAgICBpZiAoIXRoaXMuX2RhdGVBZGFwdGVyKSB7XG4gICAgICAgIHRocm93IGNyZWF0ZU1pc3NpbmdEYXRlSW1wbEVycm9yKCdEYXRlQWRhcHRlcicpO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMuX2RhdGVGb3JtYXRzKSB7XG4gICAgICAgIHRocm93IGNyZWF0ZU1pc3NpbmdEYXRlSW1wbEVycm9yKCdNQVRfREFURV9GT1JNQVRTJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5faW50bENoYW5nZXMgPSBfaW50bC5jaGFuZ2VzLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICBfY2hhbmdlRGV0ZWN0b3JSZWYubWFya0ZvckNoZWNrKCk7XG4gICAgICB0aGlzLnN0YXRlQ2hhbmdlcy5uZXh0KCk7XG4gICAgfSk7XG4gIH1cblxuICBuZ0FmdGVyQ29udGVudEluaXQoKSB7XG4gICAgdGhpcy5fY2FsZW5kYXJIZWFkZXJQb3J0YWwgPSBuZXcgQ29tcG9uZW50UG9ydGFsKHRoaXMuaGVhZGVyQ29tcG9uZW50IHx8IE1hdENhbGVuZGFySGVhZGVyKTtcbiAgICB0aGlzLmFjdGl2ZURhdGUgPSB0aGlzLnN0YXJ0QXQgfHwgdGhpcy5fZGF0ZUFkYXB0ZXIudG9kYXkoKTtcblxuICAgIC8vIEFzc2lnbiB0byB0aGUgcHJpdmF0ZSBwcm9wZXJ0eSBzaW5jZSB3ZSBkb24ndCB3YW50IHRvIG1vdmUgZm9jdXMgb24gaW5pdC5cbiAgICB0aGlzLl9jdXJyZW50VmlldyA9IHRoaXMuc3RhcnRWaWV3O1xuICB9XG5cbiAgbmdBZnRlclZpZXdDaGVja2VkKCkge1xuICAgIGlmICh0aGlzLl9tb3ZlRm9jdXNPbk5leHRUaWNrKSB7XG4gICAgICB0aGlzLl9tb3ZlRm9jdXNPbk5leHRUaWNrID0gZmFsc2U7XG4gICAgICB0aGlzLmZvY3VzQWN0aXZlQ2VsbCgpO1xuICAgIH1cbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuX2ludGxDaGFuZ2VzLnVuc3Vic2NyaWJlKCk7XG4gICAgdGhpcy5zdGF0ZUNoYW5nZXMuY29tcGxldGUoKTtcbiAgfVxuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpIHtcbiAgICAvLyBJZ25vcmUgZGF0ZSBjaGFuZ2VzIHRoYXQgYXJlIGF0IGEgZGlmZmVyZW50IHRpbWUgb24gdGhlIHNhbWUgZGF5LiBUaGlzIGZpeGVzIGlzc3VlcyB3aGVyZVxuICAgIC8vIHRoZSBjYWxlbmRhciByZS1yZW5kZXJzIHdoZW4gdGhlcmUgaXMgbm8gbWVhbmluZ2Z1bCBjaGFuZ2UgdG8gW21pbkRhdGVdIG9yIFttYXhEYXRlXVxuICAgIC8vICgjMjQ0MzUpLlxuICAgIGNvbnN0IG1pbkRhdGVDaGFuZ2U6IFNpbXBsZUNoYW5nZSB8IHVuZGVmaW5lZCA9XG4gICAgICBjaGFuZ2VzWydtaW5EYXRlJ10gJiZcbiAgICAgICF0aGlzLl9kYXRlQWRhcHRlci5zYW1lRGF0ZShjaGFuZ2VzWydtaW5EYXRlJ10ucHJldmlvdXNWYWx1ZSwgY2hhbmdlc1snbWluRGF0ZSddLmN1cnJlbnRWYWx1ZSlcbiAgICAgICAgPyBjaGFuZ2VzWydtaW5EYXRlJ11cbiAgICAgICAgOiB1bmRlZmluZWQ7XG4gICAgY29uc3QgbWF4RGF0ZUNoYW5nZTogU2ltcGxlQ2hhbmdlIHwgdW5kZWZpbmVkID1cbiAgICAgIGNoYW5nZXNbJ21heERhdGUnXSAmJlxuICAgICAgIXRoaXMuX2RhdGVBZGFwdGVyLnNhbWVEYXRlKGNoYW5nZXNbJ21heERhdGUnXS5wcmV2aW91c1ZhbHVlLCBjaGFuZ2VzWydtYXhEYXRlJ10uY3VycmVudFZhbHVlKVxuICAgICAgICA/IGNoYW5nZXNbJ21heERhdGUnXVxuICAgICAgICA6IHVuZGVmaW5lZDtcblxuICAgIGNvbnN0IGNoYW5nZSA9IG1pbkRhdGVDaGFuZ2UgfHwgbWF4RGF0ZUNoYW5nZSB8fCBjaGFuZ2VzWydkYXRlRmlsdGVyJ107XG5cbiAgICBpZiAoY2hhbmdlICYmICFjaGFuZ2UuZmlyc3RDaGFuZ2UpIHtcbiAgICAgIGNvbnN0IHZpZXcgPSB0aGlzLl9nZXRDdXJyZW50Vmlld0NvbXBvbmVudCgpO1xuXG4gICAgICBpZiAodmlldykge1xuICAgICAgICAvLyBXZSBuZWVkIHRvIGBkZXRlY3RDaGFuZ2VzYCBtYW51YWxseSBoZXJlLCBiZWNhdXNlIHRoZSBgbWluRGF0ZWAsIGBtYXhEYXRlYCBldGMuIGFyZVxuICAgICAgICAvLyBwYXNzZWQgZG93biB0byB0aGUgdmlldyB2aWEgZGF0YSBiaW5kaW5ncyB3aGljaCB3b24ndCBiZSB1cC10by1kYXRlIHdoZW4gd2UgY2FsbCBgX2luaXRgLlxuICAgICAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5kZXRlY3RDaGFuZ2VzKCk7XG4gICAgICAgIHZpZXcuX2luaXQoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnN0YXRlQ2hhbmdlcy5uZXh0KCk7XG4gIH1cblxuICAvKiogRm9jdXNlcyB0aGUgYWN0aXZlIGRhdGUuICovXG4gIGZvY3VzQWN0aXZlQ2VsbCgpIHtcbiAgICB0aGlzLl9nZXRDdXJyZW50Vmlld0NvbXBvbmVudCgpLl9mb2N1c0FjdGl2ZUNlbGwoZmFsc2UpO1xuICB9XG5cbiAgLyoqIFVwZGF0ZXMgdG9kYXkncyBkYXRlIGFmdGVyIGFuIHVwZGF0ZSBvZiB0aGUgYWN0aXZlIGRhdGUgKi9cbiAgdXBkYXRlVG9kYXlzRGF0ZSgpIHtcbiAgICB0aGlzLl9nZXRDdXJyZW50Vmlld0NvbXBvbmVudCgpLl9pbml0KCk7XG4gIH1cblxuICAvKiogSGFuZGxlcyBkYXRlIHNlbGVjdGlvbiBpbiB0aGUgbW9udGggdmlldy4gKi9cbiAgX2RhdGVTZWxlY3RlZChldmVudDogTWF0Q2FsZW5kYXJVc2VyRXZlbnQ8RCB8IG51bGw+KTogdm9pZCB7XG4gICAgY29uc3QgZGF0ZSA9IGV2ZW50LnZhbHVlO1xuXG4gICAgaWYgKFxuICAgICAgdGhpcy5zZWxlY3RlZCBpbnN0YW5jZW9mIERhdGVSYW5nZSB8fFxuICAgICAgKGRhdGUgJiYgIXRoaXMuX2RhdGVBZGFwdGVyLnNhbWVEYXRlKGRhdGUsIHRoaXMuc2VsZWN0ZWQpKVxuICAgICkge1xuICAgICAgdGhpcy5zZWxlY3RlZENoYW5nZS5lbWl0KGRhdGUpO1xuICAgIH1cblxuICAgIHRoaXMuX3VzZXJTZWxlY3Rpb24uZW1pdChldmVudCk7XG4gIH1cblxuICAvKiogSGFuZGxlcyB5ZWFyIHNlbGVjdGlvbiBpbiB0aGUgbXVsdGl5ZWFyIHZpZXcuICovXG4gIF95ZWFyU2VsZWN0ZWRJbk11bHRpWWVhclZpZXcobm9ybWFsaXplZFllYXI6IEQpIHtcbiAgICB0aGlzLnllYXJTZWxlY3RlZC5lbWl0KG5vcm1hbGl6ZWRZZWFyKTtcbiAgfVxuXG4gIC8qKiBIYW5kbGVzIG1vbnRoIHNlbGVjdGlvbiBpbiB0aGUgeWVhciB2aWV3LiAqL1xuICBfbW9udGhTZWxlY3RlZEluWWVhclZpZXcobm9ybWFsaXplZE1vbnRoOiBEKSB7XG4gICAgdGhpcy5tb250aFNlbGVjdGVkLmVtaXQobm9ybWFsaXplZE1vbnRoKTtcbiAgfVxuXG4gIC8qKiBIYW5kbGVzIHllYXIvbW9udGggc2VsZWN0aW9uIGluIHRoZSBtdWx0aS15ZWFyL3llYXIgdmlld3MuICovXG4gIF9nb1RvRGF0ZUluVmlldyhkYXRlOiBELCB2aWV3OiAnbW9udGgnIHwgJ3llYXInIHwgJ211bHRpLXllYXInKTogdm9pZCB7XG4gICAgdGhpcy5hY3RpdmVEYXRlID0gZGF0ZTtcbiAgICB0aGlzLmN1cnJlbnRWaWV3ID0gdmlldztcbiAgfVxuXG4gIC8qKiBDYWxsZWQgd2hlbiB0aGUgdXNlciBzdGFydHMgZHJhZ2dpbmcgdG8gY2hhbmdlIGEgZGF0ZSByYW5nZS4gKi9cbiAgX2RyYWdTdGFydGVkKGV2ZW50OiBNYXRDYWxlbmRhclVzZXJFdmVudDxEPikge1xuICAgIHRoaXMuX2FjdGl2ZURyYWcgPSBldmVudDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBhIGRyYWcgY29tcGxldGVzLiBJdCBtYXkgZW5kIGluIGNhbmNlbGF0aW9uIG9yIGluIHRoZSBzZWxlY3Rpb25cbiAgICogb2YgYSBuZXcgcmFuZ2UuXG4gICAqL1xuICBfZHJhZ0VuZGVkKGV2ZW50OiBNYXRDYWxlbmRhclVzZXJFdmVudDxEYXRlUmFuZ2U8RD4gfCBudWxsPikge1xuICAgIGlmICghdGhpcy5fYWN0aXZlRHJhZykgcmV0dXJuO1xuXG4gICAgaWYgKGV2ZW50LnZhbHVlKSB7XG4gICAgICB0aGlzLl91c2VyRHJhZ0Ryb3AuZW1pdChldmVudCBhcyBNYXRDYWxlbmRhclVzZXJFdmVudDxEYXRlUmFuZ2U8RD4+KTtcbiAgICB9XG5cbiAgICB0aGlzLl9hY3RpdmVEcmFnID0gbnVsbDtcbiAgfVxuXG4gIC8qKiBSZXR1cm5zIHRoZSBjb21wb25lbnQgaW5zdGFuY2UgdGhhdCBjb3JyZXNwb25kcyB0byB0aGUgY3VycmVudCBjYWxlbmRhciB2aWV3LiAqL1xuICBwcml2YXRlIF9nZXRDdXJyZW50Vmlld0NvbXBvbmVudCgpOiBNYXRNb250aFZpZXc8RD4gfCBNYXRZZWFyVmlldzxEPiB8IE1hdE11bHRpWWVhclZpZXc8RD4ge1xuICAgIC8vIFRoZSByZXR1cm4gdHlwZSBpcyBleHBsaWNpdGx5IHdyaXR0ZW4gYXMgYSB1bmlvbiB0byBlbnN1cmUgdGhhdCB0aGUgQ2xvc3VyZSBjb21waWxlciBkb2VzXG4gICAgLy8gbm90IG9wdGltaXplIGNhbGxzIHRvIF9pbml0KCkuIFdpdGhvdXQgdGhlIGV4cGxpY2l0IHJldHVybiB0eXBlLCBUeXBlU2NyaXB0IG5hcnJvd3MgaXQgdG9cbiAgICAvLyBvbmx5IHRoZSBmaXJzdCBjb21wb25lbnQgdHlwZS4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2NvbXBvbmVudHMvaXNzdWVzLzIyOTk2LlxuICAgIHJldHVybiB0aGlzLm1vbnRoVmlldyB8fCB0aGlzLnllYXJWaWV3IHx8IHRoaXMubXVsdGlZZWFyVmlldztcbiAgfVxufVxuIiwiPGRpdiBjbGFzcz1cIm1hdC1jYWxlbmRhci1oZWFkZXJcIj5cbiAgPGRpdiBjbGFzcz1cIm1hdC1jYWxlbmRhci1jb250cm9sc1wiPlxuICAgIDwhLS0gW0ZpcmVmb3ggSXNzdWU6IGh0dHBzOi8vYnVnemlsbGEubW96aWxsYS5vcmcvc2hvd19idWcuY2dpP2lkPTE4ODA1MzNdIFxuICAgICAgUmVsb2NhdGVkIGxhYmVsIG5leHQgdG8gcmVsYXRlZCBidXR0b24gYW5kIG1hZGUgdmlzdWFsbHkgaGlkZGVuIHZpYSBjZGstdmlzdWFsbHktaGlkZGVuXG4gICAgICB0byBlbmFibGUgbGFiZWwgdG8gYXBwZWFyIGluIGExMXkgdHJlZSBmb3IgU1Igd2hlbiB1c2luZyBGaXJlZm94IC0tPlxuICAgIDxsYWJlbCBbaWRdPVwiX3BlcmlvZEJ1dHRvbkxhYmVsSWRcIiBjbGFzcz1cImNkay12aXN1YWxseS1oaWRkZW5cIj57e3BlcmlvZEJ1dHRvbkRlc2NyaXB0aW9ufX08L2xhYmVsPlxuICAgIDxidXR0b24gbWF0LWJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJtYXQtY2FsZW5kYXItcGVyaW9kLWJ1dHRvblwiXG4gICAgICAgICAgICAoY2xpY2spPVwiY3VycmVudFBlcmlvZENsaWNrZWQoKVwiIFthdHRyLmFyaWEtbGFiZWxdPVwicGVyaW9kQnV0dG9uTGFiZWxcIlxuICAgICAgICAgICAgW2F0dHIuYXJpYS1kZXNjcmliZWRieV09XCJfcGVyaW9kQnV0dG9uTGFiZWxJZFwiIGFyaWEtbGl2ZT1cInBvbGl0ZVwiPlxuICAgICAgPHNwYW4gYXJpYS1oaWRkZW49XCJ0cnVlXCI+e3twZXJpb2RCdXR0b25UZXh0fX08L3NwYW4+XG4gICAgICA8c3ZnIGNsYXNzPVwibWF0LWNhbGVuZGFyLWFycm93XCIgW2NsYXNzLm1hdC1jYWxlbmRhci1pbnZlcnRdPVwiY2FsZW5kYXIuY3VycmVudFZpZXcgIT09ICdtb250aCdcIlxuICAgICAgICAgICB2aWV3Qm94PVwiMCAwIDEwIDVcIiBmb2N1c2FibGU9XCJmYWxzZVwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgICAgICA8cG9seWdvbiBwb2ludHM9XCIwLDAgNSw1IDEwLDBcIi8+XG4gICAgICA8L3N2Zz5cbiAgICA8L2J1dHRvbj5cblxuICAgIDxkaXYgY2xhc3M9XCJtYXQtY2FsZW5kYXItc3BhY2VyXCI+PC9kaXY+XG5cbiAgICA8bmctY29udGVudD48L25nLWNvbnRlbnQ+XG5cbiAgICA8YnV0dG9uIG1hdC1pY29uLWJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJtYXQtY2FsZW5kYXItcHJldmlvdXMtYnV0dG9uXCJcbiAgICAgICAgICAgIFtkaXNhYmxlZF09XCIhcHJldmlvdXNFbmFibGVkKClcIiAoY2xpY2spPVwicHJldmlvdXNDbGlja2VkKClcIlxuICAgICAgICAgICAgW2F0dHIuYXJpYS1sYWJlbF09XCJwcmV2QnV0dG9uTGFiZWxcIj5cbiAgICA8L2J1dHRvbj5cblxuICAgIDxidXR0b24gbWF0LWljb24tYnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cIm1hdC1jYWxlbmRhci1uZXh0LWJ1dHRvblwiXG4gICAgICAgICAgICBbZGlzYWJsZWRdPVwiIW5leHRFbmFibGVkKClcIiAoY2xpY2spPVwibmV4dENsaWNrZWQoKVwiXG4gICAgICAgICAgICBbYXR0ci5hcmlhLWxhYmVsXT1cIm5leHRCdXR0b25MYWJlbFwiPlxuICAgIDwvYnV0dG9uPlxuICA8L2Rpdj5cbjwvZGl2PlxuIiwiPG5nLXRlbXBsYXRlIFtjZGtQb3J0YWxPdXRsZXRdPVwiX2NhbGVuZGFySGVhZGVyUG9ydGFsXCI+PC9uZy10ZW1wbGF0ZT5cblxuPGRpdiBjbGFzcz1cIm1hdC1jYWxlbmRhci1jb250ZW50XCIgY2RrTW9uaXRvclN1YnRyZWVGb2N1cyB0YWJpbmRleD1cIi0xXCI+XG4gIEBzd2l0Y2ggKGN1cnJlbnRWaWV3KSB7XG4gICAgQGNhc2UgKCdtb250aCcpIHtcbiAgICAgICAgPG1hdC1tb250aC12aWV3XG4gICAgICAgICAgICBbKGFjdGl2ZURhdGUpXT1cImFjdGl2ZURhdGVcIlxuICAgICAgICAgICAgW3NlbGVjdGVkXT1cInNlbGVjdGVkXCJcbiAgICAgICAgICAgIFtkYXRlRmlsdGVyXT1cImRhdGVGaWx0ZXJcIlxuICAgICAgICAgICAgW21heERhdGVdPVwibWF4RGF0ZVwiXG4gICAgICAgICAgICBbbWluRGF0ZV09XCJtaW5EYXRlXCJcbiAgICAgICAgICAgIFtkYXRlQ2xhc3NdPVwiZGF0ZUNsYXNzXCJcbiAgICAgICAgICAgIFtjb21wYXJpc29uU3RhcnRdPVwiY29tcGFyaXNvblN0YXJ0XCJcbiAgICAgICAgICAgIFtjb21wYXJpc29uRW5kXT1cImNvbXBhcmlzb25FbmRcIlxuICAgICAgICAgICAgW3N0YXJ0RGF0ZUFjY2Vzc2libGVOYW1lXT1cInN0YXJ0RGF0ZUFjY2Vzc2libGVOYW1lXCJcbiAgICAgICAgICAgIFtlbmREYXRlQWNjZXNzaWJsZU5hbWVdPVwiZW5kRGF0ZUFjY2Vzc2libGVOYW1lXCJcbiAgICAgICAgICAgIChfdXNlclNlbGVjdGlvbik9XCJfZGF0ZVNlbGVjdGVkKCRldmVudClcIlxuICAgICAgICAgICAgKGRyYWdTdGFydGVkKT1cIl9kcmFnU3RhcnRlZCgkZXZlbnQpXCJcbiAgICAgICAgICAgIChkcmFnRW5kZWQpPVwiX2RyYWdFbmRlZCgkZXZlbnQpXCJcbiAgICAgICAgICAgIFthY3RpdmVEcmFnXT1cIl9hY3RpdmVEcmFnXCI+PC9tYXQtbW9udGgtdmlldz5cbiAgICB9XG5cbiAgICBAY2FzZSAoJ3llYXInKSB7XG4gICAgICAgIDxtYXQteWVhci12aWV3XG4gICAgICAgICAgICBbKGFjdGl2ZURhdGUpXT1cImFjdGl2ZURhdGVcIlxuICAgICAgICAgICAgW3NlbGVjdGVkXT1cInNlbGVjdGVkXCJcbiAgICAgICAgICAgIFtkYXRlRmlsdGVyXT1cImRhdGVGaWx0ZXJcIlxuICAgICAgICAgICAgW21heERhdGVdPVwibWF4RGF0ZVwiXG4gICAgICAgICAgICBbbWluRGF0ZV09XCJtaW5EYXRlXCJcbiAgICAgICAgICAgIFtkYXRlQ2xhc3NdPVwiZGF0ZUNsYXNzXCJcbiAgICAgICAgICAgIChtb250aFNlbGVjdGVkKT1cIl9tb250aFNlbGVjdGVkSW5ZZWFyVmlldygkZXZlbnQpXCJcbiAgICAgICAgICAgIChzZWxlY3RlZENoYW5nZSk9XCJfZ29Ub0RhdGVJblZpZXcoJGV2ZW50LCAnbW9udGgnKVwiPjwvbWF0LXllYXItdmlldz5cbiAgICB9XG5cbiAgICBAY2FzZSAoJ211bHRpLXllYXInKSB7XG4gICAgICAgIDxtYXQtbXVsdGkteWVhci12aWV3XG4gICAgICAgICAgICBbKGFjdGl2ZURhdGUpXT1cImFjdGl2ZURhdGVcIlxuICAgICAgICAgICAgW3NlbGVjdGVkXT1cInNlbGVjdGVkXCJcbiAgICAgICAgICAgIFtkYXRlRmlsdGVyXT1cImRhdGVGaWx0ZXJcIlxuICAgICAgICAgICAgW21heERhdGVdPVwibWF4RGF0ZVwiXG4gICAgICAgICAgICBbbWluRGF0ZV09XCJtaW5EYXRlXCJcbiAgICAgICAgICAgIFtkYXRlQ2xhc3NdPVwiZGF0ZUNsYXNzXCJcbiAgICAgICAgICAgICh5ZWFyU2VsZWN0ZWQpPVwiX3llYXJTZWxlY3RlZEluTXVsdGlZZWFyVmlldygkZXZlbnQpXCJcbiAgICAgICAgICAgIChzZWxlY3RlZENoYW5nZSk9XCJfZ29Ub0RhdGVJblZpZXcoJGV2ZW50LCAneWVhcicpXCI+PC9tYXQtbXVsdGkteWVhci12aWV3PlxuICAgIH1cbiAgfVxuPC9kaXY+XG4iXX0=