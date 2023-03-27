/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output, ViewEncapsulation, NgZone, } from '@angular/core';
import { take } from 'rxjs/operators';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
/**
 * An internal class that represents the data corresponding to a single calendar cell.
 * @docs-private
 */
export class MatCalendarCell {
    constructor(value, displayValue, ariaLabel, enabled, cssClasses = {}, compareValue = value, rawValue) {
        this.value = value;
        this.displayValue = displayValue;
        this.ariaLabel = ariaLabel;
        this.enabled = enabled;
        this.cssClasses = cssClasses;
        this.compareValue = compareValue;
        this.rawValue = rawValue;
    }
}
let calendarBodyId = 1;
/**
 * An internal component used to display calendar data in a table.
 * @docs-private
 */
export class MatCalendarBody {
    ngAfterViewChecked() {
        if (this._focusActiveCellAfterViewChecked) {
            this._focusActiveCell();
            this._focusActiveCellAfterViewChecked = false;
        }
    }
    constructor(_elementRef, _ngZone) {
        this._elementRef = _elementRef;
        this._ngZone = _ngZone;
        /**
         * Used to focus the active cell after change detection has run.
         */
        this._focusActiveCellAfterViewChecked = false;
        /** The number of columns in the table. */
        this.numCols = 7;
        /** The cell number of the active cell in the table. */
        this.activeCell = 0;
        /** Whether a range is being selected. */
        this.isRange = false;
        /**
         * The aspect ratio (width / height) to use for the cells in the table. This aspect ratio will be
         * maintained even as the table resizes.
         */
        this.cellAspectRatio = 1;
        /** Start of the preview range. */
        this.previewStart = null;
        /** End of the preview range. */
        this.previewEnd = null;
        /** Emits when a new value is selected. */
        this.selectedValueChange = new EventEmitter();
        /** Emits when the preview has changed as a result of a user action. */
        this.previewChange = new EventEmitter();
        this.activeDateChange = new EventEmitter();
        /** Emits the date at the possible start of a drag event. */
        this.dragStarted = new EventEmitter();
        /** Emits the date at the conclusion of a drag, or null if mouse was not released on a date. */
        this.dragEnded = new EventEmitter();
        this._didDragSinceMouseDown = false;
        /**
         * Event handler for when the user enters an element
         * inside the calendar body (e.g. by hovering in or focus).
         */
        this._enterHandler = (event) => {
            if (this._skipNextFocus && event.type === 'focus') {
                this._skipNextFocus = false;
                return;
            }
            // We only need to hit the zone when we're selecting a range.
            if (event.target && this.isRange) {
                const cell = this._getCellFromElement(event.target);
                if (cell) {
                    this._ngZone.run(() => this.previewChange.emit({ value: cell.enabled ? cell : null, event }));
                }
            }
        };
        this._touchmoveHandler = (event) => {
            if (!this.isRange)
                return;
            const target = getActualTouchTarget(event);
            const cell = target ? this._getCellFromElement(target) : null;
            if (target !== event.target) {
                this._didDragSinceMouseDown = true;
            }
            // If the initial target of the touch is a date cell, prevent default so
            // that the move is not handled as a scroll.
            if (getCellElement(event.target)) {
                event.preventDefault();
            }
            this._ngZone.run(() => this.previewChange.emit({ value: cell?.enabled ? cell : null, event }));
        };
        /**
         * Event handler for when the user's pointer leaves an element
         * inside the calendar body (e.g. by hovering out or blurring).
         */
        this._leaveHandler = (event) => {
            // We only need to hit the zone when we're selecting a range.
            if (this.previewEnd !== null && this.isRange) {
                if (event.type !== 'blur') {
                    this._didDragSinceMouseDown = true;
                }
                // Only reset the preview end value when leaving cells. This looks better, because
                // we have a gap between the cells and the rows and we don't want to remove the
                // range just for it to show up again when the user moves a few pixels to the side.
                if (event.target &&
                    this._getCellFromElement(event.target) &&
                    !(event.relatedTarget &&
                        this._getCellFromElement(event.relatedTarget))) {
                    this._ngZone.run(() => this.previewChange.emit({ value: null, event }));
                }
            }
        };
        /**
         * Triggered on mousedown or touchstart on a date cell.
         * Respsonsible for starting a drag sequence.
         */
        this._mousedownHandler = (event) => {
            if (!this.isRange)
                return;
            this._didDragSinceMouseDown = false;
            // Begin a drag if a cell within the current range was targeted.
            const cell = event.target && this._getCellFromElement(event.target);
            if (!cell || !this._isInRange(cell.rawValue)) {
                return;
            }
            this._ngZone.run(() => {
                this.dragStarted.emit({
                    value: cell.rawValue,
                    event,
                });
            });
        };
        /** Triggered on mouseup anywhere. Respsonsible for ending a drag sequence. */
        this._mouseupHandler = (event) => {
            if (!this.isRange)
                return;
            const cellElement = getCellElement(event.target);
            if (!cellElement) {
                // Mouseup happened outside of datepicker. Cancel drag.
                this._ngZone.run(() => {
                    this.dragEnded.emit({ value: null, event });
                });
                return;
            }
            if (cellElement.closest('.mat-calendar-body') !== this._elementRef.nativeElement) {
                // Mouseup happened inside a different month instance.
                // Allow it to handle the event.
                return;
            }
            this._ngZone.run(() => {
                const cell = this._getCellFromElement(cellElement);
                this.dragEnded.emit({ value: cell?.rawValue ?? null, event });
            });
        };
        /** Triggered on touchend anywhere. Respsonsible for ending a drag sequence. */
        this._touchendHandler = (event) => {
            const target = getActualTouchTarget(event);
            if (target) {
                this._mouseupHandler({ target });
            }
        };
        this._id = `mat-calendar-body-${calendarBodyId++}`;
        this._startDateLabelId = `${this._id}-start-date`;
        this._endDateLabelId = `${this._id}-end-date`;
        _ngZone.runOutsideAngular(() => {
            const element = _elementRef.nativeElement;
            element.addEventListener('mouseenter', this._enterHandler, true);
            element.addEventListener('touchmove', this._touchmoveHandler, true);
            element.addEventListener('focus', this._enterHandler, true);
            element.addEventListener('mouseleave', this._leaveHandler, true);
            element.addEventListener('blur', this._leaveHandler, true);
            element.addEventListener('mousedown', this._mousedownHandler);
            element.addEventListener('touchstart', this._mousedownHandler);
            window.addEventListener('mouseup', this._mouseupHandler);
            window.addEventListener('touchend', this._touchendHandler);
        });
    }
    /** Called when a cell is clicked. */
    _cellClicked(cell, event) {
        // Ignore "clicks" that are actually canceled drags (eg the user dragged
        // off and then went back to this cell to undo).
        if (this._didDragSinceMouseDown) {
            return;
        }
        if (cell.enabled) {
            this.selectedValueChange.emit({ value: cell.value, event });
        }
    }
    _emitActiveDateChange(cell, event) {
        if (cell.enabled) {
            this.activeDateChange.emit({ value: cell.value, event });
        }
    }
    /** Returns whether a cell should be marked as selected. */
    _isSelected(value) {
        return this.startValue === value || this.endValue === value;
    }
    ngOnChanges(changes) {
        const columnChanges = changes['numCols'];
        const { rows, numCols } = this;
        if (changes['rows'] || columnChanges) {
            this._firstRowOffset = rows && rows.length && rows[0].length ? numCols - rows[0].length : 0;
        }
        if (changes['cellAspectRatio'] || columnChanges || !this._cellPadding) {
            this._cellPadding = `${(50 * this.cellAspectRatio) / numCols}%`;
        }
        if (columnChanges || !this._cellWidth) {
            this._cellWidth = `${100 / numCols}%`;
        }
    }
    ngOnDestroy() {
        const element = this._elementRef.nativeElement;
        element.removeEventListener('mouseenter', this._enterHandler, true);
        element.removeEventListener('touchmove', this._touchmoveHandler, true);
        element.removeEventListener('focus', this._enterHandler, true);
        element.removeEventListener('mouseleave', this._leaveHandler, true);
        element.removeEventListener('blur', this._leaveHandler, true);
        element.removeEventListener('mousedown', this._mousedownHandler);
        element.removeEventListener('touchstart', this._mousedownHandler);
        window.removeEventListener('mouseup', this._mouseupHandler);
        window.removeEventListener('touchend', this._touchendHandler);
    }
    /** Returns whether a cell is active. */
    _isActiveCell(rowIndex, colIndex) {
        let cellNumber = rowIndex * this.numCols + colIndex;
        // Account for the fact that the first row may not have as many cells.
        if (rowIndex) {
            cellNumber -= this._firstRowOffset;
        }
        return cellNumber == this.activeCell;
    }
    /**
     * Focuses the active cell after the microtask queue is empty.
     *
     * Adding a 0ms setTimeout seems to fix Voiceover losing focus when pressing PageUp/PageDown
     * (issue #24330).
     *
     * Determined a 0ms by gradually increasing duration from 0 and testing two use cases with screen
     * reader enabled:
     *
     * 1. Pressing PageUp/PageDown repeatedly with pausing between each key press.
     * 2. Pressing and holding the PageDown key with repeated keys enabled.
     *
     * Test 1 worked roughly 95-99% of the time with 0ms and got a little bit better as the duration
     * increased. Test 2 got slightly better until the duration was long enough to interfere with
     * repeated keys. If the repeated key speed was faster than the timeout duration, then pressing
     * and holding pagedown caused the entire page to scroll.
     *
     * Since repeated key speed can verify across machines, determined that any duration could
     * potentially interfere with repeated keys. 0ms would be best because it almost entirely
     * eliminates the focus being lost in Voiceover (#24330) without causing unintended side effects.
     * Adding delay also complicates writing tests.
     */
    _focusActiveCell(movePreview = true) {
        this._ngZone.runOutsideAngular(() => {
            this._ngZone.onStable.pipe(take(1)).subscribe(() => {
                setTimeout(() => {
                    const activeCell = this._elementRef.nativeElement.querySelector('.mat-calendar-body-active');
                    if (activeCell) {
                        if (!movePreview) {
                            this._skipNextFocus = true;
                        }
                        activeCell.focus();
                    }
                });
            });
        });
    }
    /** Focuses the active cell after change detection has run and the microtask queue is empty. */
    _scheduleFocusActiveCellAfterViewChecked() {
        this._focusActiveCellAfterViewChecked = true;
    }
    /** Gets whether a value is the start of the main range. */
    _isRangeStart(value) {
        return isStart(value, this.startValue, this.endValue);
    }
    /** Gets whether a value is the end of the main range. */
    _isRangeEnd(value) {
        return isEnd(value, this.startValue, this.endValue);
    }
    /** Gets whether a value is within the currently-selected range. */
    _isInRange(value) {
        return isInRange(value, this.startValue, this.endValue, this.isRange);
    }
    /** Gets whether a value is the start of the comparison range. */
    _isComparisonStart(value) {
        return isStart(value, this.comparisonStart, this.comparisonEnd);
    }
    /** Whether the cell is a start bridge cell between the main and comparison ranges. */
    _isComparisonBridgeStart(value, rowIndex, colIndex) {
        if (!this._isComparisonStart(value) || this._isRangeStart(value) || !this._isInRange(value)) {
            return false;
        }
        let previousCell = this.rows[rowIndex][colIndex - 1];
        if (!previousCell) {
            const previousRow = this.rows[rowIndex - 1];
            previousCell = previousRow && previousRow[previousRow.length - 1];
        }
        return previousCell && !this._isRangeEnd(previousCell.compareValue);
    }
    /** Whether the cell is an end bridge cell between the main and comparison ranges. */
    _isComparisonBridgeEnd(value, rowIndex, colIndex) {
        if (!this._isComparisonEnd(value) || this._isRangeEnd(value) || !this._isInRange(value)) {
            return false;
        }
        let nextCell = this.rows[rowIndex][colIndex + 1];
        if (!nextCell) {
            const nextRow = this.rows[rowIndex + 1];
            nextCell = nextRow && nextRow[0];
        }
        return nextCell && !this._isRangeStart(nextCell.compareValue);
    }
    /** Gets whether a value is the end of the comparison range. */
    _isComparisonEnd(value) {
        return isEnd(value, this.comparisonStart, this.comparisonEnd);
    }
    /** Gets whether a value is within the current comparison range. */
    _isInComparisonRange(value) {
        return isInRange(value, this.comparisonStart, this.comparisonEnd, this.isRange);
    }
    /**
     * Gets whether a value is the same as the start and end of the comparison range.
     * For context, the functions that we use to determine whether something is the start/end of
     * a range don't allow for the start and end to be on the same day, because we'd have to use
     * much more specific CSS selectors to style them correctly in all scenarios. This is fine for
     * the regular range, because when it happens, the selected styles take over and still show where
     * the range would've been, however we don't have these selected styles for a comparison range.
     * This function is used to apply a class that serves the same purpose as the one for selected
     * dates, but it only applies in the context of a comparison range.
     */
    _isComparisonIdentical(value) {
        // Note that we don't need to null check the start/end
        // here, because the `value` will always be defined.
        return this.comparisonStart === this.comparisonEnd && value === this.comparisonStart;
    }
    /** Gets whether a value is the start of the preview range. */
    _isPreviewStart(value) {
        return isStart(value, this.previewStart, this.previewEnd);
    }
    /** Gets whether a value is the end of the preview range. */
    _isPreviewEnd(value) {
        return isEnd(value, this.previewStart, this.previewEnd);
    }
    /** Gets whether a value is inside the preview range. */
    _isInPreview(value) {
        return isInRange(value, this.previewStart, this.previewEnd, this.isRange);
    }
    /** Gets ids of aria descriptions for the start and end of a date range. */
    _getDescribedby(value) {
        if (!this.isRange) {
            return null;
        }
        if (this.startValue === value && this.endValue === value) {
            return `${this._startDateLabelId} ${this._endDateLabelId}`;
        }
        else if (this.startValue === value) {
            return this._startDateLabelId;
        }
        else if (this.endValue === value) {
            return this._endDateLabelId;
        }
        return null;
    }
    /** Finds the MatCalendarCell that corresponds to a DOM node. */
    _getCellFromElement(element) {
        const cell = getCellElement(element);
        if (cell) {
            const row = cell.getAttribute('data-mat-row');
            const col = cell.getAttribute('data-mat-col');
            if (row && col) {
                return this.rows[parseInt(row)][parseInt(col)];
            }
        }
        return null;
    }
}
MatCalendarBody.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: MatCalendarBody, deps: [{ token: i0.ElementRef }, { token: i0.NgZone }], target: i0.ɵɵFactoryTarget.Component });
MatCalendarBody.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "15.2.0-rc.0", type: MatCalendarBody, selector: "[mat-calendar-body]", inputs: { label: "label", rows: "rows", todayValue: "todayValue", startValue: "startValue", endValue: "endValue", labelMinRequiredCells: "labelMinRequiredCells", numCols: "numCols", activeCell: "activeCell", isRange: "isRange", cellAspectRatio: "cellAspectRatio", comparisonStart: "comparisonStart", comparisonEnd: "comparisonEnd", previewStart: "previewStart", previewEnd: "previewEnd", startDateAccessibleName: "startDateAccessibleName", endDateAccessibleName: "endDateAccessibleName" }, outputs: { selectedValueChange: "selectedValueChange", previewChange: "previewChange", activeDateChange: "activeDateChange", dragStarted: "dragStarted", dragEnded: "dragEnded" }, host: { classAttribute: "mat-calendar-body" }, exportAs: ["matCalendarBody"], usesOnChanges: true, ngImport: i0, template: "<!--\n  If there's not enough space in the first row, create a separate label row. We mark this row as\n  aria-hidden because we don't want it to be read out as one of the weeks in the month.\n-->\n<tr *ngIf=\"_firstRowOffset < labelMinRequiredCells\" aria-hidden=\"true\">\n  <td class=\"mat-calendar-body-label\"\n      [attr.colspan]=\"numCols\"\n      [style.paddingTop]=\"_cellPadding\"\n      [style.paddingBottom]=\"_cellPadding\">\n    {{label}}\n  </td>\n</tr>\n\n<!-- Create the first row separately so we can include a special spacer cell. -->\n<tr *ngFor=\"let row of rows; let rowIndex = index\" role=\"row\">\n  <!--\n    This cell is purely decorative, but we can't put `aria-hidden` or `role=\"presentation\"` on it,\n    because it throws off the week days for the rest of the row on NVDA. The aspect ratio of the\n    table cells is maintained by setting the top and bottom padding as a percentage of the width\n    (a variant of the trick described here: https://www.w3schools.com/howto/howto_css_aspect_ratio.asp).\n  -->\n  <td *ngIf=\"rowIndex === 0 && _firstRowOffset\"\n      class=\"mat-calendar-body-label\"\n      [attr.colspan]=\"_firstRowOffset\"\n      [style.paddingTop]=\"_cellPadding\"\n      [style.paddingBottom]=\"_cellPadding\">\n    {{_firstRowOffset >= labelMinRequiredCells ? label : ''}}\n  </td>\n  <!--\n    Each gridcell in the calendar contains a button, which signals to assistive technology that the\n    cell is interactable, as well as the selection state via `aria-pressed`. See #23476 for\n    background.\n  -->\n  <td\n    *ngFor=\"let item of row; let colIndex = index\"\n    role=\"gridcell\"\n    class=\"mat-calendar-body-cell-container\"\n    [style.width]=\"_cellWidth\"\n    [style.paddingTop]=\"_cellPadding\"\n    [style.paddingBottom]=\"_cellPadding\"\n    [attr.data-mat-row]=\"rowIndex\"\n    [attr.data-mat-col]=\"colIndex\"\n  >\n    <button\n        type=\"button\"\n        class=\"mat-calendar-body-cell\"\n        [ngClass]=\"item.cssClasses\"\n        [tabindex]=\"_isActiveCell(rowIndex, colIndex) ? 0 : -1\"\n        [class.mat-calendar-body-disabled]=\"!item.enabled\"\n        [class.mat-calendar-body-active]=\"_isActiveCell(rowIndex, colIndex)\"\n        [class.mat-calendar-body-range-start]=\"_isRangeStart(item.compareValue)\"\n        [class.mat-calendar-body-range-end]=\"_isRangeEnd(item.compareValue)\"\n        [class.mat-calendar-body-in-range]=\"_isInRange(item.compareValue)\"\n        [class.mat-calendar-body-comparison-bridge-start]=\"_isComparisonBridgeStart(item.compareValue, rowIndex, colIndex)\"\n        [class.mat-calendar-body-comparison-bridge-end]=\"_isComparisonBridgeEnd(item.compareValue, rowIndex, colIndex)\"\n        [class.mat-calendar-body-comparison-start]=\"_isComparisonStart(item.compareValue)\"\n        [class.mat-calendar-body-comparison-end]=\"_isComparisonEnd(item.compareValue)\"\n        [class.mat-calendar-body-in-comparison-range]=\"_isInComparisonRange(item.compareValue)\"\n        [class.mat-calendar-body-preview-start]=\"_isPreviewStart(item.compareValue)\"\n        [class.mat-calendar-body-preview-end]=\"_isPreviewEnd(item.compareValue)\"\n        [class.mat-calendar-body-in-preview]=\"_isInPreview(item.compareValue)\"\n        [attr.aria-label]=\"item.ariaLabel\"\n        [attr.aria-disabled]=\"!item.enabled || null\"\n        [attr.aria-pressed]=\"_isSelected(item.compareValue)\"\n        [attr.aria-current]=\"todayValue === item.compareValue ? 'date' : null\"\n        [attr.aria-describedby]=\"_getDescribedby(item.compareValue)\"\n        (click)=\"_cellClicked(item, $event)\"\n        (focus)=\"_emitActiveDateChange(item, $event)\">\n        <div class=\"mat-calendar-body-cell-content mat-focus-indicator\"\n          [class.mat-calendar-body-selected]=\"_isSelected(item.compareValue)\"\n          [class.mat-calendar-body-comparison-identical]=\"_isComparisonIdentical(item.compareValue)\"\n          [class.mat-calendar-body-today]=\"todayValue === item.compareValue\">\n          {{item.displayValue}}\n        </div>\n        <div class=\"mat-calendar-body-cell-preview\" aria-hidden=\"true\"></div>\n    </button>\n  </td>\n</tr>\n\n<label [id]=\"_startDateLabelId\" class=\"mat-calendar-body-hidden-label\">\n  {{startDateAccessibleName}}\n</label>\n<label [id]=\"_endDateLabelId\" class=\"mat-calendar-body-hidden-label\">\n  {{endDateAccessibleName}}\n</label>\n", styles: [".mat-calendar-body{min-width:224px}.mat-calendar-body-label{height:0;line-height:0;text-align:left;padding-left:4.7142857143%;padding-right:4.7142857143%}.mat-calendar-body-hidden-label{display:none}.mat-calendar-body-cell-container{position:relative;height:0;line-height:0}.mat-calendar-body-cell{-webkit-user-select:none;user-select:none;cursor:pointer;outline:none;border:none;-webkit-tap-highlight-color:rgba(0,0,0,0);position:absolute;top:0;left:0;width:100%;height:100%;background:none;text-align:center;outline:none;font-family:inherit;margin:0}.mat-calendar-body-cell::-moz-focus-inner{border:0}.mat-calendar-body-cell::before,.mat-calendar-body-cell::after,.mat-calendar-body-cell-preview{content:\"\";position:absolute;top:5%;left:0;z-index:0;box-sizing:border-box;height:90%;width:100%}.mat-calendar-body-range-start:not(.mat-calendar-body-in-comparison-range)::before,.mat-calendar-body-range-start::after,.mat-calendar-body-comparison-start:not(.mat-calendar-body-comparison-bridge-start)::before,.mat-calendar-body-comparison-start::after,.mat-calendar-body-preview-start .mat-calendar-body-cell-preview{left:5%;width:95%;border-top-left-radius:999px;border-bottom-left-radius:999px}[dir=rtl] .mat-calendar-body-range-start:not(.mat-calendar-body-in-comparison-range)::before,[dir=rtl] .mat-calendar-body-range-start::after,[dir=rtl] .mat-calendar-body-comparison-start:not(.mat-calendar-body-comparison-bridge-start)::before,[dir=rtl] .mat-calendar-body-comparison-start::after,[dir=rtl] .mat-calendar-body-preview-start .mat-calendar-body-cell-preview{left:0;border-radius:0;border-top-right-radius:999px;border-bottom-right-radius:999px}.mat-calendar-body-range-end:not(.mat-calendar-body-in-comparison-range)::before,.mat-calendar-body-range-end::after,.mat-calendar-body-comparison-end:not(.mat-calendar-body-comparison-bridge-end)::before,.mat-calendar-body-comparison-end::after,.mat-calendar-body-preview-end .mat-calendar-body-cell-preview{width:95%;border-top-right-radius:999px;border-bottom-right-radius:999px}[dir=rtl] .mat-calendar-body-range-end:not(.mat-calendar-body-in-comparison-range)::before,[dir=rtl] .mat-calendar-body-range-end::after,[dir=rtl] .mat-calendar-body-comparison-end:not(.mat-calendar-body-comparison-bridge-end)::before,[dir=rtl] .mat-calendar-body-comparison-end::after,[dir=rtl] .mat-calendar-body-preview-end .mat-calendar-body-cell-preview{left:5%;border-radius:0;border-top-left-radius:999px;border-bottom-left-radius:999px}[dir=rtl] .mat-calendar-body-comparison-bridge-start.mat-calendar-body-range-end::after,[dir=rtl] .mat-calendar-body-comparison-bridge-end.mat-calendar-body-range-start::after{width:95%;border-top-right-radius:999px;border-bottom-right-radius:999px}.mat-calendar-body-comparison-start.mat-calendar-body-range-end::after,[dir=rtl] .mat-calendar-body-comparison-start.mat-calendar-body-range-end::after,.mat-calendar-body-comparison-end.mat-calendar-body-range-start::after,[dir=rtl] .mat-calendar-body-comparison-end.mat-calendar-body-range-start::after{width:90%}.mat-calendar-body-in-preview .mat-calendar-body-cell-preview{border-top:dashed 1px;border-bottom:dashed 1px}.mat-calendar-body-preview-start .mat-calendar-body-cell-preview{border-left:dashed 1px}[dir=rtl] .mat-calendar-body-preview-start .mat-calendar-body-cell-preview{border-left:0;border-right:dashed 1px}.mat-calendar-body-preview-end .mat-calendar-body-cell-preview{border-right:dashed 1px}[dir=rtl] .mat-calendar-body-preview-end .mat-calendar-body-cell-preview{border-right:0;border-left:dashed 1px}.mat-calendar-body-disabled{cursor:default}.cdk-high-contrast-active .mat-calendar-body-disabled{opacity:.5}.mat-calendar-body-cell-content{top:5%;left:5%;z-index:1;display:flex;align-items:center;justify-content:center;box-sizing:border-box;width:90%;height:90%;line-height:1;border-width:1px;border-style:solid;border-radius:999px}.mat-calendar-body-cell-content.mat-focus-indicator{position:absolute}.cdk-high-contrast-active .mat-calendar-body-cell-content{border:none}.cdk-high-contrast-active .mat-datepicker-popup:not(:empty),.cdk-high-contrast-active .mat-calendar-body-cell:not(.mat-calendar-body-in-range) .mat-calendar-body-selected{outline:solid 1px}.cdk-high-contrast-active .mat-calendar-body-today{outline:dotted 1px}.cdk-high-contrast-active .mat-calendar-body-cell::before,.cdk-high-contrast-active .mat-calendar-body-cell::after,.cdk-high-contrast-active .mat-calendar-body-selected{background:none}.cdk-high-contrast-active .mat-calendar-body-in-range::before,.cdk-high-contrast-active .mat-calendar-body-comparison-bridge-start::before,.cdk-high-contrast-active .mat-calendar-body-comparison-bridge-end::before{border-top:solid 1px;border-bottom:solid 1px}.cdk-high-contrast-active .mat-calendar-body-range-start::before{border-left:solid 1px}[dir=rtl] .cdk-high-contrast-active .mat-calendar-body-range-start::before{border-left:0;border-right:solid 1px}.cdk-high-contrast-active .mat-calendar-body-range-end::before{border-right:solid 1px}[dir=rtl] .cdk-high-contrast-active .mat-calendar-body-range-end::before{border-right:0;border-left:solid 1px}.cdk-high-contrast-active .mat-calendar-body-in-comparison-range::before{border-top:dashed 1px;border-bottom:dashed 1px}.cdk-high-contrast-active .mat-calendar-body-comparison-start::before{border-left:dashed 1px}[dir=rtl] .cdk-high-contrast-active .mat-calendar-body-comparison-start::before{border-left:0;border-right:dashed 1px}.cdk-high-contrast-active .mat-calendar-body-comparison-end::before{border-right:dashed 1px}[dir=rtl] .cdk-high-contrast-active .mat-calendar-body-comparison-end::before{border-right:0;border-left:dashed 1px}[dir=rtl] .mat-calendar-body-label{text-align:right}"], dependencies: [{ kind: "directive", type: i1.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: i1.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: MatCalendarBody, decorators: [{
            type: Component,
            args: [{ selector: '[mat-calendar-body]', host: {
                        'class': 'mat-calendar-body',
                    }, exportAs: 'matCalendarBody', encapsulation: ViewEncapsulation.None, changeDetection: ChangeDetectionStrategy.OnPush, template: "<!--\n  If there's not enough space in the first row, create a separate label row. We mark this row as\n  aria-hidden because we don't want it to be read out as one of the weeks in the month.\n-->\n<tr *ngIf=\"_firstRowOffset < labelMinRequiredCells\" aria-hidden=\"true\">\n  <td class=\"mat-calendar-body-label\"\n      [attr.colspan]=\"numCols\"\n      [style.paddingTop]=\"_cellPadding\"\n      [style.paddingBottom]=\"_cellPadding\">\n    {{label}}\n  </td>\n</tr>\n\n<!-- Create the first row separately so we can include a special spacer cell. -->\n<tr *ngFor=\"let row of rows; let rowIndex = index\" role=\"row\">\n  <!--\n    This cell is purely decorative, but we can't put `aria-hidden` or `role=\"presentation\"` on it,\n    because it throws off the week days for the rest of the row on NVDA. The aspect ratio of the\n    table cells is maintained by setting the top and bottom padding as a percentage of the width\n    (a variant of the trick described here: https://www.w3schools.com/howto/howto_css_aspect_ratio.asp).\n  -->\n  <td *ngIf=\"rowIndex === 0 && _firstRowOffset\"\n      class=\"mat-calendar-body-label\"\n      [attr.colspan]=\"_firstRowOffset\"\n      [style.paddingTop]=\"_cellPadding\"\n      [style.paddingBottom]=\"_cellPadding\">\n    {{_firstRowOffset >= labelMinRequiredCells ? label : ''}}\n  </td>\n  <!--\n    Each gridcell in the calendar contains a button, which signals to assistive technology that the\n    cell is interactable, as well as the selection state via `aria-pressed`. See #23476 for\n    background.\n  -->\n  <td\n    *ngFor=\"let item of row; let colIndex = index\"\n    role=\"gridcell\"\n    class=\"mat-calendar-body-cell-container\"\n    [style.width]=\"_cellWidth\"\n    [style.paddingTop]=\"_cellPadding\"\n    [style.paddingBottom]=\"_cellPadding\"\n    [attr.data-mat-row]=\"rowIndex\"\n    [attr.data-mat-col]=\"colIndex\"\n  >\n    <button\n        type=\"button\"\n        class=\"mat-calendar-body-cell\"\n        [ngClass]=\"item.cssClasses\"\n        [tabindex]=\"_isActiveCell(rowIndex, colIndex) ? 0 : -1\"\n        [class.mat-calendar-body-disabled]=\"!item.enabled\"\n        [class.mat-calendar-body-active]=\"_isActiveCell(rowIndex, colIndex)\"\n        [class.mat-calendar-body-range-start]=\"_isRangeStart(item.compareValue)\"\n        [class.mat-calendar-body-range-end]=\"_isRangeEnd(item.compareValue)\"\n        [class.mat-calendar-body-in-range]=\"_isInRange(item.compareValue)\"\n        [class.mat-calendar-body-comparison-bridge-start]=\"_isComparisonBridgeStart(item.compareValue, rowIndex, colIndex)\"\n        [class.mat-calendar-body-comparison-bridge-end]=\"_isComparisonBridgeEnd(item.compareValue, rowIndex, colIndex)\"\n        [class.mat-calendar-body-comparison-start]=\"_isComparisonStart(item.compareValue)\"\n        [class.mat-calendar-body-comparison-end]=\"_isComparisonEnd(item.compareValue)\"\n        [class.mat-calendar-body-in-comparison-range]=\"_isInComparisonRange(item.compareValue)\"\n        [class.mat-calendar-body-preview-start]=\"_isPreviewStart(item.compareValue)\"\n        [class.mat-calendar-body-preview-end]=\"_isPreviewEnd(item.compareValue)\"\n        [class.mat-calendar-body-in-preview]=\"_isInPreview(item.compareValue)\"\n        [attr.aria-label]=\"item.ariaLabel\"\n        [attr.aria-disabled]=\"!item.enabled || null\"\n        [attr.aria-pressed]=\"_isSelected(item.compareValue)\"\n        [attr.aria-current]=\"todayValue === item.compareValue ? 'date' : null\"\n        [attr.aria-describedby]=\"_getDescribedby(item.compareValue)\"\n        (click)=\"_cellClicked(item, $event)\"\n        (focus)=\"_emitActiveDateChange(item, $event)\">\n        <div class=\"mat-calendar-body-cell-content mat-focus-indicator\"\n          [class.mat-calendar-body-selected]=\"_isSelected(item.compareValue)\"\n          [class.mat-calendar-body-comparison-identical]=\"_isComparisonIdentical(item.compareValue)\"\n          [class.mat-calendar-body-today]=\"todayValue === item.compareValue\">\n          {{item.displayValue}}\n        </div>\n        <div class=\"mat-calendar-body-cell-preview\" aria-hidden=\"true\"></div>\n    </button>\n  </td>\n</tr>\n\n<label [id]=\"_startDateLabelId\" class=\"mat-calendar-body-hidden-label\">\n  {{startDateAccessibleName}}\n</label>\n<label [id]=\"_endDateLabelId\" class=\"mat-calendar-body-hidden-label\">\n  {{endDateAccessibleName}}\n</label>\n", styles: [".mat-calendar-body{min-width:224px}.mat-calendar-body-label{height:0;line-height:0;text-align:left;padding-left:4.7142857143%;padding-right:4.7142857143%}.mat-calendar-body-hidden-label{display:none}.mat-calendar-body-cell-container{position:relative;height:0;line-height:0}.mat-calendar-body-cell{-webkit-user-select:none;user-select:none;cursor:pointer;outline:none;border:none;-webkit-tap-highlight-color:rgba(0,0,0,0);position:absolute;top:0;left:0;width:100%;height:100%;background:none;text-align:center;outline:none;font-family:inherit;margin:0}.mat-calendar-body-cell::-moz-focus-inner{border:0}.mat-calendar-body-cell::before,.mat-calendar-body-cell::after,.mat-calendar-body-cell-preview{content:\"\";position:absolute;top:5%;left:0;z-index:0;box-sizing:border-box;height:90%;width:100%}.mat-calendar-body-range-start:not(.mat-calendar-body-in-comparison-range)::before,.mat-calendar-body-range-start::after,.mat-calendar-body-comparison-start:not(.mat-calendar-body-comparison-bridge-start)::before,.mat-calendar-body-comparison-start::after,.mat-calendar-body-preview-start .mat-calendar-body-cell-preview{left:5%;width:95%;border-top-left-radius:999px;border-bottom-left-radius:999px}[dir=rtl] .mat-calendar-body-range-start:not(.mat-calendar-body-in-comparison-range)::before,[dir=rtl] .mat-calendar-body-range-start::after,[dir=rtl] .mat-calendar-body-comparison-start:not(.mat-calendar-body-comparison-bridge-start)::before,[dir=rtl] .mat-calendar-body-comparison-start::after,[dir=rtl] .mat-calendar-body-preview-start .mat-calendar-body-cell-preview{left:0;border-radius:0;border-top-right-radius:999px;border-bottom-right-radius:999px}.mat-calendar-body-range-end:not(.mat-calendar-body-in-comparison-range)::before,.mat-calendar-body-range-end::after,.mat-calendar-body-comparison-end:not(.mat-calendar-body-comparison-bridge-end)::before,.mat-calendar-body-comparison-end::after,.mat-calendar-body-preview-end .mat-calendar-body-cell-preview{width:95%;border-top-right-radius:999px;border-bottom-right-radius:999px}[dir=rtl] .mat-calendar-body-range-end:not(.mat-calendar-body-in-comparison-range)::before,[dir=rtl] .mat-calendar-body-range-end::after,[dir=rtl] .mat-calendar-body-comparison-end:not(.mat-calendar-body-comparison-bridge-end)::before,[dir=rtl] .mat-calendar-body-comparison-end::after,[dir=rtl] .mat-calendar-body-preview-end .mat-calendar-body-cell-preview{left:5%;border-radius:0;border-top-left-radius:999px;border-bottom-left-radius:999px}[dir=rtl] .mat-calendar-body-comparison-bridge-start.mat-calendar-body-range-end::after,[dir=rtl] .mat-calendar-body-comparison-bridge-end.mat-calendar-body-range-start::after{width:95%;border-top-right-radius:999px;border-bottom-right-radius:999px}.mat-calendar-body-comparison-start.mat-calendar-body-range-end::after,[dir=rtl] .mat-calendar-body-comparison-start.mat-calendar-body-range-end::after,.mat-calendar-body-comparison-end.mat-calendar-body-range-start::after,[dir=rtl] .mat-calendar-body-comparison-end.mat-calendar-body-range-start::after{width:90%}.mat-calendar-body-in-preview .mat-calendar-body-cell-preview{border-top:dashed 1px;border-bottom:dashed 1px}.mat-calendar-body-preview-start .mat-calendar-body-cell-preview{border-left:dashed 1px}[dir=rtl] .mat-calendar-body-preview-start .mat-calendar-body-cell-preview{border-left:0;border-right:dashed 1px}.mat-calendar-body-preview-end .mat-calendar-body-cell-preview{border-right:dashed 1px}[dir=rtl] .mat-calendar-body-preview-end .mat-calendar-body-cell-preview{border-right:0;border-left:dashed 1px}.mat-calendar-body-disabled{cursor:default}.cdk-high-contrast-active .mat-calendar-body-disabled{opacity:.5}.mat-calendar-body-cell-content{top:5%;left:5%;z-index:1;display:flex;align-items:center;justify-content:center;box-sizing:border-box;width:90%;height:90%;line-height:1;border-width:1px;border-style:solid;border-radius:999px}.mat-calendar-body-cell-content.mat-focus-indicator{position:absolute}.cdk-high-contrast-active .mat-calendar-body-cell-content{border:none}.cdk-high-contrast-active .mat-datepicker-popup:not(:empty),.cdk-high-contrast-active .mat-calendar-body-cell:not(.mat-calendar-body-in-range) .mat-calendar-body-selected{outline:solid 1px}.cdk-high-contrast-active .mat-calendar-body-today{outline:dotted 1px}.cdk-high-contrast-active .mat-calendar-body-cell::before,.cdk-high-contrast-active .mat-calendar-body-cell::after,.cdk-high-contrast-active .mat-calendar-body-selected{background:none}.cdk-high-contrast-active .mat-calendar-body-in-range::before,.cdk-high-contrast-active .mat-calendar-body-comparison-bridge-start::before,.cdk-high-contrast-active .mat-calendar-body-comparison-bridge-end::before{border-top:solid 1px;border-bottom:solid 1px}.cdk-high-contrast-active .mat-calendar-body-range-start::before{border-left:solid 1px}[dir=rtl] .cdk-high-contrast-active .mat-calendar-body-range-start::before{border-left:0;border-right:solid 1px}.cdk-high-contrast-active .mat-calendar-body-range-end::before{border-right:solid 1px}[dir=rtl] .cdk-high-contrast-active .mat-calendar-body-range-end::before{border-right:0;border-left:solid 1px}.cdk-high-contrast-active .mat-calendar-body-in-comparison-range::before{border-top:dashed 1px;border-bottom:dashed 1px}.cdk-high-contrast-active .mat-calendar-body-comparison-start::before{border-left:dashed 1px}[dir=rtl] .cdk-high-contrast-active .mat-calendar-body-comparison-start::before{border-left:0;border-right:dashed 1px}.cdk-high-contrast-active .mat-calendar-body-comparison-end::before{border-right:dashed 1px}[dir=rtl] .cdk-high-contrast-active .mat-calendar-body-comparison-end::before{border-right:0;border-left:dashed 1px}[dir=rtl] .mat-calendar-body-label{text-align:right}"] }]
        }], ctorParameters: function () { return [{ type: i0.ElementRef }, { type: i0.NgZone }]; }, propDecorators: { label: [{
                type: Input
            }], rows: [{
                type: Input
            }], todayValue: [{
                type: Input
            }], startValue: [{
                type: Input
            }], endValue: [{
                type: Input
            }], labelMinRequiredCells: [{
                type: Input
            }], numCols: [{
                type: Input
            }], activeCell: [{
                type: Input
            }], isRange: [{
                type: Input
            }], cellAspectRatio: [{
                type: Input
            }], comparisonStart: [{
                type: Input
            }], comparisonEnd: [{
                type: Input
            }], previewStart: [{
                type: Input
            }], previewEnd: [{
                type: Input
            }], startDateAccessibleName: [{
                type: Input
            }], endDateAccessibleName: [{
                type: Input
            }], selectedValueChange: [{
                type: Output
            }], previewChange: [{
                type: Output
            }], activeDateChange: [{
                type: Output
            }], dragStarted: [{
                type: Output
            }], dragEnded: [{
                type: Output
            }] } });
/** Checks whether a node is a table cell element. */
function isTableCell(node) {
    return node?.nodeName === 'TD';
}
/**
 * Gets the date table cell element that is or contains the specified element.
 * Or returns null if element is not part of a date cell.
 */
function getCellElement(element) {
    let cell;
    if (isTableCell(element)) {
        cell = element;
    }
    else if (isTableCell(element.parentNode)) {
        cell = element.parentNode;
    }
    else if (isTableCell(element.parentNode?.parentNode)) {
        cell = element.parentNode.parentNode;
    }
    return cell?.getAttribute('data-mat-row') != null ? cell : null;
}
/** Checks whether a value is the start of a range. */
function isStart(value, start, end) {
    return end !== null && start !== end && value < end && value === start;
}
/** Checks whether a value is the end of a range. */
function isEnd(value, start, end) {
    return start !== null && start !== end && value >= start && value === end;
}
/** Checks whether a value is inside of a range. */
function isInRange(value, start, end, rangeEnabled) {
    return (rangeEnabled &&
        start !== null &&
        end !== null &&
        start !== end &&
        value >= start &&
        value <= end);
}
/**
 * Extracts the element that actually corresponds to a touch event's location
 * (rather than the element that initiated the sequence of touch events).
 */
function getActualTouchTarget(event) {
    const touchLocation = event.changedTouches[0];
    return document.elementFromPoint(touchLocation.clientX, touchLocation.clientY);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FsZW5kYXItYm9keS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9kYXRlcGlja2VyL2NhbGVuZGFyLWJvZHkudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvZGF0ZXBpY2tlci9jYWxlbmRhci1ib2R5Lmh0bWwiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLHVCQUF1QixFQUN2QixTQUFTLEVBQ1QsVUFBVSxFQUNWLFlBQVksRUFDWixLQUFLLEVBQ0wsTUFBTSxFQUNOLGlCQUFpQixFQUNqQixNQUFNLEdBS1AsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLElBQUksRUFBQyxNQUFNLGdCQUFnQixDQUFDOzs7QUFXcEM7OztHQUdHO0FBQ0gsTUFBTSxPQUFPLGVBQWU7SUFDMUIsWUFDUyxLQUFhLEVBQ2IsWUFBb0IsRUFDcEIsU0FBaUIsRUFDakIsT0FBZ0IsRUFDaEIsYUFBd0MsRUFBRSxFQUMxQyxlQUFlLEtBQUssRUFDcEIsUUFBWTtRQU5aLFVBQUssR0FBTCxLQUFLLENBQVE7UUFDYixpQkFBWSxHQUFaLFlBQVksQ0FBUTtRQUNwQixjQUFTLEdBQVQsU0FBUyxDQUFRO1FBQ2pCLFlBQU8sR0FBUCxPQUFPLENBQVM7UUFDaEIsZUFBVSxHQUFWLFVBQVUsQ0FBZ0M7UUFDMUMsaUJBQVksR0FBWixZQUFZLENBQVE7UUFDcEIsYUFBUSxHQUFSLFFBQVEsQ0FBSTtJQUNsQixDQUFDO0NBQ0w7QUFRRCxJQUFJLGNBQWMsR0FBRyxDQUFDLENBQUM7QUFFdkI7OztHQUdHO0FBWUgsTUFBTSxPQUFPLGVBQWU7SUFvQzFCLGtCQUFrQjtRQUNoQixJQUFJLElBQUksQ0FBQyxnQ0FBZ0MsRUFBRTtZQUN6QyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUN4QixJQUFJLENBQUMsZ0NBQWdDLEdBQUcsS0FBSyxDQUFDO1NB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O0FBQ3RELFNBQVMsT0FBTyxDQUFDLEtBQWEsRUFBRSxLQUFvQixFQUFFLEdBQWtCO0lBQ3RFLE9BQU8sR0FBRyxLQUFLLElBQUksSUFBSSxLQUFLLEtBQUssR0FBRyxJQUFJLEtBQUssR0FBRyxHQUFHLElBQUksS0FBSyxLQUFLLEtBQUssQ0FBQztBQUN6RSxDQUFDO0FBRUQsb0RBQW9EO0FBQ3BELFNBQVMsS0FBSyxDQUFDLEtBQWEsRUFBRSxLQUFvQixFQUFFLEdBQWtCO0lBQ3BFLE9BQU8sS0FBSyxLQUFLLElBQUksSUFBSSxLQUFLLEtBQUssR0FBRyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxLQUFLLEdBQUcsQ0FBQztBQUM1RSxDQUFDO0FBRUQsbURBQW1EO0FBQ25ELFNBQVMsU0FBUyxDQUNoQixLQUFhLEVBQ2IsS0FBb0IsRUFDcEIsR0FBa0IsRUFDbEIsWUFBcUI7SUFFckIsT0FBTyxDQUNMLFlBQVk7UUFDWixLQUFLLEtBQUssSUFBSTtRQUNkLEdBQUcsS0FBSyxJQUFJO1FBQ1osS0FBSyxLQUFLLEdBQUc7UUFDYixLQUFLLElBQUksS0FBSztRQUNkLEtBQUssSUFBSSxHQUFHLENBQ2IsQ0FBQztBQUNKLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxTQUFTLG9CQUFvQixDQUFDLEtBQWlCO0lBQzdDLE1BQU0sYUFBYSxHQUFHLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDOUMsT0FBTyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDakYsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgQ29tcG9uZW50LFxuICBFbGVtZW50UmVmLFxuICBFdmVudEVtaXR0ZXIsXG4gIElucHV0LFxuICBPdXRwdXQsXG4gIFZpZXdFbmNhcHN1bGF0aW9uLFxuICBOZ1pvbmUsXG4gIE9uQ2hhbmdlcyxcbiAgU2ltcGxlQ2hhbmdlcyxcbiAgT25EZXN0cm95LFxuICBBZnRlclZpZXdDaGVja2VkLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7dGFrZX0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG4vKiogRXh0cmEgQ1NTIGNsYXNzZXMgdGhhdCBjYW4gYmUgYXNzb2NpYXRlZCB3aXRoIGEgY2FsZW5kYXIgY2VsbC4gKi9cbmV4cG9ydCB0eXBlIE1hdENhbGVuZGFyQ2VsbENzc0NsYXNzZXMgPSBzdHJpbmcgfCBzdHJpbmdbXSB8IFNldDxzdHJpbmc+IHwge1trZXk6IHN0cmluZ106IGFueX07XG5cbi8qKiBGdW5jdGlvbiB0aGF0IGNhbiBnZW5lcmF0ZSB0aGUgZXh0cmEgY2xhc3NlcyB0aGF0IHNob3VsZCBiZSBhZGRlZCB0byBhIGNhbGVuZGFyIGNlbGwuICovXG5leHBvcnQgdHlwZSBNYXRDYWxlbmRhckNlbGxDbGFzc0Z1bmN0aW9uPEQ+ID0gKFxuICBkYXRlOiBELFxuICB2aWV3OiAnbW9udGgnIHwgJ3llYXInIHwgJ211bHRpLXllYXInLFxuKSA9PiBNYXRDYWxlbmRhckNlbGxDc3NDbGFzc2VzO1xuXG4vKipcbiAqIEFuIGludGVybmFsIGNsYXNzIHRoYXQgcmVwcmVzZW50cyB0aGUgZGF0YSBjb3JyZXNwb25kaW5nIHRvIGEgc2luZ2xlIGNhbGVuZGFyIGNlbGwuXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbmV4cG9ydCBjbGFzcyBNYXRDYWxlbmRhckNlbGw8RCA9IGFueT4ge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgdmFsdWU6IG51bWJlcixcbiAgICBwdWJsaWMgZGlzcGxheVZhbHVlOiBzdHJpbmcsXG4gICAgcHVibGljIGFyaWFMYWJlbDogc3RyaW5nLFxuICAgIHB1YmxpYyBlbmFibGVkOiBib29sZWFuLFxuICAgIHB1YmxpYyBjc3NDbGFzc2VzOiBNYXRDYWxlbmRhckNlbGxDc3NDbGFzc2VzID0ge30sXG4gICAgcHVibGljIGNvbXBhcmVWYWx1ZSA9IHZhbHVlLFxuICAgIHB1YmxpYyByYXdWYWx1ZT86IEQsXG4gICkge31cbn1cblxuLyoqIEV2ZW50IGVtaXR0ZWQgd2hlbiBhIGRhdGUgaW5zaWRlIHRoZSBjYWxlbmRhciBpcyB0cmlnZ2VyZWQgYXMgYSByZXN1bHQgb2YgYSB1c2VyIGFjdGlvbi4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTWF0Q2FsZW5kYXJVc2VyRXZlbnQ8RD4ge1xuICB2YWx1ZTogRDtcbiAgZXZlbnQ6IEV2ZW50O1xufVxuXG5sZXQgY2FsZW5kYXJCb2R5SWQgPSAxO1xuXG4vKipcbiAqIEFuIGludGVybmFsIGNvbXBvbmVudCB1c2VkIHRvIGRpc3BsYXkgY2FsZW5kYXIgZGF0YSBpbiBhIHRhYmxlLlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdbbWF0LWNhbGVuZGFyLWJvZHldJyxcbiAgdGVtcGxhdGVVcmw6ICdjYWxlbmRhci1ib2R5Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsnY2FsZW5kYXItYm9keS5jc3MnXSxcbiAgaG9zdDoge1xuICAgICdjbGFzcyc6ICdtYXQtY2FsZW5kYXItYm9keScsXG4gIH0sXG4gIGV4cG9ydEFzOiAnbWF0Q2FsZW5kYXJCb2R5JyxcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG59KVxuZXhwb3J0IGNsYXNzIE1hdENhbGVuZGFyQm9keTxEID0gYW55PiBpbXBsZW1lbnRzIE9uQ2hhbmdlcywgT25EZXN0cm95LCBBZnRlclZpZXdDaGVja2VkIHtcbiAgLyoqXG4gICAqIFVzZWQgdG8gc2tpcCB0aGUgbmV4dCBmb2N1cyBldmVudCB3aGVuIHJlbmRlcmluZyB0aGUgcHJldmlldyByYW5nZS5cbiAgICogV2UgbmVlZCBhIGZsYWcgbGlrZSB0aGlzLCBiZWNhdXNlIHNvbWUgYnJvd3NlcnMgZmlyZSBmb2N1cyBldmVudHMgYXN5bmNocm9ub3VzbHkuXG4gICAqL1xuICBwcml2YXRlIF9za2lwTmV4dEZvY3VzOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBVc2VkIHRvIGZvY3VzIHRoZSBhY3RpdmUgY2VsbCBhZnRlciBjaGFuZ2UgZGV0ZWN0aW9uIGhhcyBydW4uXG4gICAqL1xuICBwcml2YXRlIF9mb2N1c0FjdGl2ZUNlbGxBZnRlclZpZXdDaGVja2VkID0gZmFsc2U7XG5cbiAgLyoqIFRoZSBsYWJlbCBmb3IgdGhlIHRhYmxlLiAoZS5nLiBcIkphbiAyMDE3XCIpLiAqL1xuICBASW5wdXQoKSBsYWJlbDogc3RyaW5nO1xuXG4gIC8qKiBUaGUgY2VsbHMgdG8gZGlzcGxheSBpbiB0aGUgdGFibGUuICovXG4gIEBJbnB1dCgpIHJvd3M6IE1hdENhbGVuZGFyQ2VsbFtdW107XG5cbiAgLyoqIFRoZSB2YWx1ZSBpbiB0aGUgdGFibGUgdGhhdCBjb3JyZXNwb25kcyB0byB0b2RheS4gKi9cbiAgQElucHV0KCkgdG9kYXlWYWx1ZTogbnVtYmVyO1xuXG4gIC8qKiBTdGFydCB2YWx1ZSBvZiB0aGUgc2VsZWN0ZWQgZGF0ZSByYW5nZS4gKi9cbiAgQElucHV0KCkgc3RhcnRWYWx1ZTogbnVtYmVyO1xuXG4gIC8qKiBFbmQgdmFsdWUgb2YgdGhlIHNlbGVjdGVkIGRhdGUgcmFuZ2UuICovXG4gIEBJbnB1dCgpIGVuZFZhbHVlOiBudW1iZXI7XG5cbiAgLyoqIFRoZSBtaW5pbXVtIG51bWJlciBvZiBmcmVlIGNlbGxzIG5lZWRlZCB0byBmaXQgdGhlIGxhYmVsIGluIHRoZSBmaXJzdCByb3cuICovXG4gIEBJbnB1dCgpIGxhYmVsTWluUmVxdWlyZWRDZWxsczogbnVtYmVyO1xuXG4gIC8qKiBUaGUgbnVtYmVyIG9mIGNvbHVtbnMgaW4gdGhlIHRhYmxlLiAqL1xuICBASW5wdXQoKSBudW1Db2xzOiBudW1iZXIgPSA3O1xuXG4gIC8qKiBUaGUgY2VsbCBudW1iZXIgb2YgdGhlIGFjdGl2ZSBjZWxsIGluIHRoZSB0YWJsZS4gKi9cbiAgQElucHV0KCkgYWN0aXZlQ2VsbDogbnVtYmVyID0gMDtcblxuICBuZ0FmdGVyVmlld0NoZWNrZWQoKSB7XG4gICAgaWYgKHRoaXMuX2ZvY3VzQWN0aXZlQ2VsbEFmdGVyVmlld0NoZWNrZWQpIHtcbiAgICAgIHRoaXMuX2ZvY3VzQWN0aXZlQ2VsbCgpO1xuICAgICAgdGhpcy5fZm9jdXNBY3RpdmVDZWxsQWZ0ZXJWaWV3Q2hlY2tlZCA9IGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBXaGV0aGVyIGEgcmFuZ2UgaXMgYmVpbmcgc2VsZWN0ZWQuICovXG4gIEBJbnB1dCgpIGlzUmFuZ2U6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAvKipcbiAgICogVGhlIGFzcGVjdCByYXRpbyAod2lkdGggLyBoZWlnaHQpIHRvIHVzZSBmb3IgdGhlIGNlbGxzIGluIHRoZSB0YWJsZS4gVGhpcyBhc3BlY3QgcmF0aW8gd2lsbCBiZVxuICAgKiBtYWludGFpbmVkIGV2ZW4gYXMgdGhlIHRhYmxlIHJlc2l6ZXMuXG4gICAqL1xuICBASW5wdXQoKSBjZWxsQXNwZWN0UmF0aW86IG51bWJlciA9IDE7XG5cbiAgLyoqIFN0YXJ0IG9mIHRoZSBjb21wYXJpc29uIHJhbmdlLiAqL1xuICBASW5wdXQoKSBjb21wYXJpc29uU3RhcnQ6IG51bWJlciB8IG51bGw7XG5cbiAgLyoqIEVuZCBvZiB0aGUgY29tcGFyaXNvbiByYW5nZS4gKi9cbiAgQElucHV0KCkgY29tcGFyaXNvbkVuZDogbnVtYmVyIHwgbnVsbDtcblxuICAvKiogU3RhcnQgb2YgdGhlIHByZXZpZXcgcmFuZ2UuICovXG4gIEBJbnB1dCgpIHByZXZpZXdTdGFydDogbnVtYmVyIHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqIEVuZCBvZiB0aGUgcHJldmlldyByYW5nZS4gKi9cbiAgQElucHV0KCkgcHJldmlld0VuZDogbnVtYmVyIHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqIEFSSUEgQWNjZXNzaWJsZSBuYW1lIG9mIHRoZSBgPGlucHV0IG1hdFN0YXJ0RGF0ZS8+YCAqL1xuICBASW5wdXQoKSBzdGFydERhdGVBY2Nlc3NpYmxlTmFtZTogc3RyaW5nIHwgbnVsbDtcblxuICAvKiogQVJJQSBBY2Nlc3NpYmxlIG5hbWUgb2YgdGhlIGA8aW5wdXQgbWF0RW5kRGF0ZS8+YCAqL1xuICBASW5wdXQoKSBlbmREYXRlQWNjZXNzaWJsZU5hbWU6IHN0cmluZyB8IG51bGw7XG5cbiAgLyoqIEVtaXRzIHdoZW4gYSBuZXcgdmFsdWUgaXMgc2VsZWN0ZWQuICovXG4gIEBPdXRwdXQoKSByZWFkb25seSBzZWxlY3RlZFZhbHVlQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxNYXRDYWxlbmRhclVzZXJFdmVudDxudW1iZXI+PigpO1xuXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSBwcmV2aWV3IGhhcyBjaGFuZ2VkIGFzIGEgcmVzdWx0IG9mIGEgdXNlciBhY3Rpb24uICovXG4gIEBPdXRwdXQoKSByZWFkb25seSBwcmV2aWV3Q2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxcbiAgICBNYXRDYWxlbmRhclVzZXJFdmVudDxNYXRDYWxlbmRhckNlbGwgfCBudWxsPlxuICA+KCk7XG5cbiAgQE91dHB1dCgpIHJlYWRvbmx5IGFjdGl2ZURhdGVDaGFuZ2UgPSBuZXcgRXZlbnRFbWl0dGVyPE1hdENhbGVuZGFyVXNlckV2ZW50PG51bWJlcj4+KCk7XG5cbiAgLyoqIEVtaXRzIHRoZSBkYXRlIGF0IHRoZSBwb3NzaWJsZSBzdGFydCBvZiBhIGRyYWcgZXZlbnQuICovXG4gIEBPdXRwdXQoKSByZWFkb25seSBkcmFnU3RhcnRlZCA9IG5ldyBFdmVudEVtaXR0ZXI8TWF0Q2FsZW5kYXJVc2VyRXZlbnQ8RD4+KCk7XG5cbiAgLyoqIEVtaXRzIHRoZSBkYXRlIGF0IHRoZSBjb25jbHVzaW9uIG9mIGEgZHJhZywgb3IgbnVsbCBpZiBtb3VzZSB3YXMgbm90IHJlbGVhc2VkIG9uIGEgZGF0ZS4gKi9cbiAgQE91dHB1dCgpIHJlYWRvbmx5IGRyYWdFbmRlZCA9IG5ldyBFdmVudEVtaXR0ZXI8TWF0Q2FsZW5kYXJVc2VyRXZlbnQ8RCB8IG51bGw+PigpO1xuXG4gIC8qKiBUaGUgbnVtYmVyIG9mIGJsYW5rIGNlbGxzIHRvIHB1dCBhdCB0aGUgYmVnaW5uaW5nIGZvciB0aGUgZmlyc3Qgcm93LiAqL1xuICBfZmlyc3RSb3dPZmZzZXQ6IG51bWJlcjtcblxuICAvKiogUGFkZGluZyBmb3IgdGhlIGluZGl2aWR1YWwgZGF0ZSBjZWxscy4gKi9cbiAgX2NlbGxQYWRkaW5nOiBzdHJpbmc7XG5cbiAgLyoqIFdpZHRoIG9mIGFuIGluZGl2aWR1YWwgY2VsbC4gKi9cbiAgX2NlbGxXaWR0aDogc3RyaW5nO1xuXG4gIHByaXZhdGUgX2RpZERyYWdTaW5jZU1vdXNlRG93biA9IGZhbHNlO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+LCBwcml2YXRlIF9uZ1pvbmU6IE5nWm9uZSkge1xuICAgIF9uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgY29uc3QgZWxlbWVudCA9IF9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7XG4gICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCB0aGlzLl9lbnRlckhhbmRsZXIsIHRydWUpO1xuICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0aGlzLl90b3VjaG1vdmVIYW5kbGVyLCB0cnVlKTtcbiAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXMnLCB0aGlzLl9lbnRlckhhbmRsZXIsIHRydWUpO1xuICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgdGhpcy5fbGVhdmVIYW5kbGVyLCB0cnVlKTtcbiAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignYmx1cicsIHRoaXMuX2xlYXZlSGFuZGxlciwgdHJ1ZSk7XG4gICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuX21vdXNlZG93bkhhbmRsZXIpO1xuICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdGhpcy5fbW91c2Vkb3duSGFuZGxlcik7XG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMuX21vdXNldXBIYW5kbGVyKTtcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMuX3RvdWNoZW5kSGFuZGxlcik7XG4gICAgfSk7XG4gIH1cblxuICAvKiogQ2FsbGVkIHdoZW4gYSBjZWxsIGlzIGNsaWNrZWQuICovXG4gIF9jZWxsQ2xpY2tlZChjZWxsOiBNYXRDYWxlbmRhckNlbGwsIGV2ZW50OiBNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgLy8gSWdub3JlIFwiY2xpY2tzXCIgdGhhdCBhcmUgYWN0dWFsbHkgY2FuY2VsZWQgZHJhZ3MgKGVnIHRoZSB1c2VyIGRyYWdnZWRcbiAgICAvLyBvZmYgYW5kIHRoZW4gd2VudCBiYWNrIHRvIHRoaXMgY2VsbCB0byB1bmRvKS5cbiAgICBpZiAodGhpcy5fZGlkRHJhZ1NpbmNlTW91c2VEb3duKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGNlbGwuZW5hYmxlZCkge1xuICAgICAgdGhpcy5zZWxlY3RlZFZhbHVlQ2hhbmdlLmVtaXQoe3ZhbHVlOiBjZWxsLnZhbHVlLCBldmVudH0pO1xuICAgIH1cbiAgfVxuXG4gIF9lbWl0QWN0aXZlRGF0ZUNoYW5nZShjZWxsOiBNYXRDYWxlbmRhckNlbGwsIGV2ZW50OiBGb2N1c0V2ZW50KTogdm9pZCB7XG4gICAgaWYgKGNlbGwuZW5hYmxlZCkge1xuICAgICAgdGhpcy5hY3RpdmVEYXRlQ2hhbmdlLmVtaXQoe3ZhbHVlOiBjZWxsLnZhbHVlLCBldmVudH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBSZXR1cm5zIHdoZXRoZXIgYSBjZWxsIHNob3VsZCBiZSBtYXJrZWQgYXMgc2VsZWN0ZWQuICovXG4gIF9pc1NlbGVjdGVkKHZhbHVlOiBudW1iZXIpIHtcbiAgICByZXR1cm4gdGhpcy5zdGFydFZhbHVlID09PSB2YWx1ZSB8fCB0aGlzLmVuZFZhbHVlID09PSB2YWx1ZTtcbiAgfVxuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpIHtcbiAgICBjb25zdCBjb2x1bW5DaGFuZ2VzID0gY2hhbmdlc1snbnVtQ29scyddO1xuICAgIGNvbnN0IHtyb3dzLCBudW1Db2xzfSA9IHRoaXM7XG5cbiAgICBpZiAoY2hhbmdlc1sncm93cyddIHx8IGNvbHVtbkNoYW5nZXMpIHtcbiAgICAgIHRoaXMuX2ZpcnN0Um93T2Zmc2V0ID0gcm93cyAmJiByb3dzLmxlbmd0aCAmJiByb3dzWzBdLmxlbmd0aCA/IG51bUNvbHMgLSByb3dzWzBdLmxlbmd0aCA6IDA7XG4gICAgfVxuXG4gICAgaWYgKGNoYW5nZXNbJ2NlbGxBc3BlY3RSYXRpbyddIHx8IGNvbHVtbkNoYW5nZXMgfHwgIXRoaXMuX2NlbGxQYWRkaW5nKSB7XG4gICAgICB0aGlzLl9jZWxsUGFkZGluZyA9IGAkeyg1MCAqIHRoaXMuY2VsbEFzcGVjdFJhdGlvKSAvIG51bUNvbHN9JWA7XG4gICAgfVxuXG4gICAgaWYgKGNvbHVtbkNoYW5nZXMgfHwgIXRoaXMuX2NlbGxXaWR0aCkge1xuICAgICAgdGhpcy5fY2VsbFdpZHRoID0gYCR7MTAwIC8gbnVtQ29sc30lYDtcbiAgICB9XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xuICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsIHRoaXMuX2VudGVySGFuZGxlciwgdHJ1ZSk7XG4gICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0aGlzLl90b3VjaG1vdmVIYW5kbGVyLCB0cnVlKTtcbiAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgdGhpcy5fZW50ZXJIYW5kbGVyLCB0cnVlKTtcbiAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCB0aGlzLl9sZWF2ZUhhbmRsZXIsIHRydWUpO1xuICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignYmx1cicsIHRoaXMuX2xlYXZlSGFuZGxlciwgdHJ1ZSk7XG4gICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLl9tb3VzZWRvd25IYW5kbGVyKTtcbiAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCB0aGlzLl9tb3VzZWRvd25IYW5kbGVyKTtcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMuX21vdXNldXBIYW5kbGVyKTtcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB0aGlzLl90b3VjaGVuZEhhbmRsZXIpO1xuICB9XG5cbiAgLyoqIFJldHVybnMgd2hldGhlciBhIGNlbGwgaXMgYWN0aXZlLiAqL1xuICBfaXNBY3RpdmVDZWxsKHJvd0luZGV4OiBudW1iZXIsIGNvbEluZGV4OiBudW1iZXIpOiBib29sZWFuIHtcbiAgICBsZXQgY2VsbE51bWJlciA9IHJvd0luZGV4ICogdGhpcy5udW1Db2xzICsgY29sSW5kZXg7XG5cbiAgICAvLyBBY2NvdW50IGZvciB0aGUgZmFjdCB0aGF0IHRoZSBmaXJzdCByb3cgbWF5IG5vdCBoYXZlIGFzIG1hbnkgY2VsbHMuXG4gICAgaWYgKHJvd0luZGV4KSB7XG4gICAgICBjZWxsTnVtYmVyIC09IHRoaXMuX2ZpcnN0Um93T2Zmc2V0O1xuICAgIH1cblxuICAgIHJldHVybiBjZWxsTnVtYmVyID09IHRoaXMuYWN0aXZlQ2VsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBGb2N1c2VzIHRoZSBhY3RpdmUgY2VsbCBhZnRlciB0aGUgbWljcm90YXNrIHF1ZXVlIGlzIGVtcHR5LlxuICAgKlxuICAgKiBBZGRpbmcgYSAwbXMgc2V0VGltZW91dCBzZWVtcyB0byBmaXggVm9pY2VvdmVyIGxvc2luZyBmb2N1cyB3aGVuIHByZXNzaW5nIFBhZ2VVcC9QYWdlRG93blxuICAgKiAoaXNzdWUgIzI0MzMwKS5cbiAgICpcbiAgICogRGV0ZXJtaW5lZCBhIDBtcyBieSBncmFkdWFsbHkgaW5jcmVhc2luZyBkdXJhdGlvbiBmcm9tIDAgYW5kIHRlc3RpbmcgdHdvIHVzZSBjYXNlcyB3aXRoIHNjcmVlblxuICAgKiByZWFkZXIgZW5hYmxlZDpcbiAgICpcbiAgICogMS4gUHJlc3NpbmcgUGFnZVVwL1BhZ2VEb3duIHJlcGVhdGVkbHkgd2l0aCBwYXVzaW5nIGJldHdlZW4gZWFjaCBrZXkgcHJlc3MuXG4gICAqIDIuIFByZXNzaW5nIGFuZCBob2xkaW5nIHRoZSBQYWdlRG93biBrZXkgd2l0aCByZXBlYXRlZCBrZXlzIGVuYWJsZWQuXG4gICAqXG4gICAqIFRlc3QgMSB3b3JrZWQgcm91Z2hseSA5NS05OSUgb2YgdGhlIHRpbWUgd2l0aCAwbXMgYW5kIGdvdCBhIGxpdHRsZSBiaXQgYmV0dGVyIGFzIHRoZSBkdXJhdGlvblxuICAgKiBpbmNyZWFzZWQuIFRlc3QgMiBnb3Qgc2xpZ2h0bHkgYmV0dGVyIHVudGlsIHRoZSBkdXJhdGlvbiB3YXMgbG9uZyBlbm91Z2ggdG8gaW50ZXJmZXJlIHdpdGhcbiAgICogcmVwZWF0ZWQga2V5cy4gSWYgdGhlIHJlcGVhdGVkIGtleSBzcGVlZCB3YXMgZmFzdGVyIHRoYW4gdGhlIHRpbWVvdXQgZHVyYXRpb24sIHRoZW4gcHJlc3NpbmdcbiAgICogYW5kIGhvbGRpbmcgcGFnZWRvd24gY2F1c2VkIHRoZSBlbnRpcmUgcGFnZSB0byBzY3JvbGwuXG4gICAqXG4gICAqIFNpbmNlIHJlcGVhdGVkIGtleSBzcGVlZCBjYW4gdmVyaWZ5IGFjcm9zcyBtYWNoaW5lcywgZGV0ZXJtaW5lZCB0aGF0IGFueSBkdXJhdGlvbiBjb3VsZFxuICAgKiBwb3RlbnRpYWxseSBpbnRlcmZlcmUgd2l0aCByZXBlYXRlZCBrZXlzLiAwbXMgd291bGQgYmUgYmVzdCBiZWNhdXNlIGl0IGFsbW9zdCBlbnRpcmVseVxuICAgKiBlbGltaW5hdGVzIHRoZSBmb2N1cyBiZWluZyBsb3N0IGluIFZvaWNlb3ZlciAoIzI0MzMwKSB3aXRob3V0IGNhdXNpbmcgdW5pbnRlbmRlZCBzaWRlIGVmZmVjdHMuXG4gICAqIEFkZGluZyBkZWxheSBhbHNvIGNvbXBsaWNhdGVzIHdyaXRpbmcgdGVzdHMuXG4gICAqL1xuICBfZm9jdXNBY3RpdmVDZWxsKG1vdmVQcmV2aWV3ID0gdHJ1ZSkge1xuICAgIHRoaXMuX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICB0aGlzLl9uZ1pvbmUub25TdGFibGUucGlwZSh0YWtlKDEpKS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICBjb25zdCBhY3RpdmVDZWxsOiBIVE1MRWxlbWVudCB8IG51bGwgPSB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICAgICAgICAgICcubWF0LWNhbGVuZGFyLWJvZHktYWN0aXZlJyxcbiAgICAgICAgICApO1xuXG4gICAgICAgICAgaWYgKGFjdGl2ZUNlbGwpIHtcbiAgICAgICAgICAgIGlmICghbW92ZVByZXZpZXcpIHtcbiAgICAgICAgICAgICAgdGhpcy5fc2tpcE5leHRGb2N1cyA9IHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGFjdGl2ZUNlbGwuZm9jdXMoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKiogRm9jdXNlcyB0aGUgYWN0aXZlIGNlbGwgYWZ0ZXIgY2hhbmdlIGRldGVjdGlvbiBoYXMgcnVuIGFuZCB0aGUgbWljcm90YXNrIHF1ZXVlIGlzIGVtcHR5LiAqL1xuICBfc2NoZWR1bGVGb2N1c0FjdGl2ZUNlbGxBZnRlclZpZXdDaGVja2VkKCkge1xuICAgIHRoaXMuX2ZvY3VzQWN0aXZlQ2VsbEFmdGVyVmlld0NoZWNrZWQgPSB0cnVlO1xuICB9XG5cbiAgLyoqIEdldHMgd2hldGhlciBhIHZhbHVlIGlzIHRoZSBzdGFydCBvZiB0aGUgbWFpbiByYW5nZS4gKi9cbiAgX2lzUmFuZ2VTdGFydCh2YWx1ZTogbnVtYmVyKSB7XG4gICAgcmV0dXJuIGlzU3RhcnQodmFsdWUsIHRoaXMuc3RhcnRWYWx1ZSwgdGhpcy5lbmRWYWx1ZSk7XG4gIH1cblxuICAvKiogR2V0cyB3aGV0aGVyIGEgdmFsdWUgaXMgdGhlIGVuZCBvZiB0aGUgbWFpbiByYW5nZS4gKi9cbiAgX2lzUmFuZ2VFbmQodmFsdWU6IG51bWJlcikge1xuICAgIHJldHVybiBpc0VuZCh2YWx1ZSwgdGhpcy5zdGFydFZhbHVlLCB0aGlzLmVuZFZhbHVlKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHdoZXRoZXIgYSB2YWx1ZSBpcyB3aXRoaW4gdGhlIGN1cnJlbnRseS1zZWxlY3RlZCByYW5nZS4gKi9cbiAgX2lzSW5SYW5nZSh2YWx1ZTogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGlzSW5SYW5nZSh2YWx1ZSwgdGhpcy5zdGFydFZhbHVlLCB0aGlzLmVuZFZhbHVlLCB0aGlzLmlzUmFuZ2UpO1xuICB9XG5cbiAgLyoqIEdldHMgd2hldGhlciBhIHZhbHVlIGlzIHRoZSBzdGFydCBvZiB0aGUgY29tcGFyaXNvbiByYW5nZS4gKi9cbiAgX2lzQ29tcGFyaXNvblN0YXJ0KHZhbHVlOiBudW1iZXIpIHtcbiAgICByZXR1cm4gaXNTdGFydCh2YWx1ZSwgdGhpcy5jb21wYXJpc29uU3RhcnQsIHRoaXMuY29tcGFyaXNvbkVuZCk7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgY2VsbCBpcyBhIHN0YXJ0IGJyaWRnZSBjZWxsIGJldHdlZW4gdGhlIG1haW4gYW5kIGNvbXBhcmlzb24gcmFuZ2VzLiAqL1xuICBfaXNDb21wYXJpc29uQnJpZGdlU3RhcnQodmFsdWU6IG51bWJlciwgcm93SW5kZXg6IG51bWJlciwgY29sSW5kZXg6IG51bWJlcikge1xuICAgIGlmICghdGhpcy5faXNDb21wYXJpc29uU3RhcnQodmFsdWUpIHx8IHRoaXMuX2lzUmFuZ2VTdGFydCh2YWx1ZSkgfHwgIXRoaXMuX2lzSW5SYW5nZSh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBsZXQgcHJldmlvdXNDZWxsOiBNYXRDYWxlbmRhckNlbGwgfCB1bmRlZmluZWQgPSB0aGlzLnJvd3Nbcm93SW5kZXhdW2NvbEluZGV4IC0gMV07XG5cbiAgICBpZiAoIXByZXZpb3VzQ2VsbCkge1xuICAgICAgY29uc3QgcHJldmlvdXNSb3cgPSB0aGlzLnJvd3Nbcm93SW5kZXggLSAxXTtcbiAgICAgIHByZXZpb3VzQ2VsbCA9IHByZXZpb3VzUm93ICYmIHByZXZpb3VzUm93W3ByZXZpb3VzUm93Lmxlbmd0aCAtIDFdO1xuICAgIH1cblxuICAgIHJldHVybiBwcmV2aW91c0NlbGwgJiYgIXRoaXMuX2lzUmFuZ2VFbmQocHJldmlvdXNDZWxsLmNvbXBhcmVWYWx1ZSk7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgY2VsbCBpcyBhbiBlbmQgYnJpZGdlIGNlbGwgYmV0d2VlbiB0aGUgbWFpbiBhbmQgY29tcGFyaXNvbiByYW5nZXMuICovXG4gIF9pc0NvbXBhcmlzb25CcmlkZ2VFbmQodmFsdWU6IG51bWJlciwgcm93SW5kZXg6IG51bWJlciwgY29sSW5kZXg6IG51bWJlcikge1xuICAgIGlmICghdGhpcy5faXNDb21wYXJpc29uRW5kKHZhbHVlKSB8fCB0aGlzLl9pc1JhbmdlRW5kKHZhbHVlKSB8fCAhdGhpcy5faXNJblJhbmdlKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGxldCBuZXh0Q2VsbDogTWF0Q2FsZW5kYXJDZWxsIHwgdW5kZWZpbmVkID0gdGhpcy5yb3dzW3Jvd0luZGV4XVtjb2xJbmRleCArIDFdO1xuXG4gICAgaWYgKCFuZXh0Q2VsbCkge1xuICAgICAgY29uc3QgbmV4dFJvdyA9IHRoaXMucm93c1tyb3dJbmRleCArIDFdO1xuICAgICAgbmV4dENlbGwgPSBuZXh0Um93ICYmIG5leHRSb3dbMF07XG4gICAgfVxuXG4gICAgcmV0dXJuIG5leHRDZWxsICYmICF0aGlzLl9pc1JhbmdlU3RhcnQobmV4dENlbGwuY29tcGFyZVZhbHVlKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHdoZXRoZXIgYSB2YWx1ZSBpcyB0aGUgZW5kIG9mIHRoZSBjb21wYXJpc29uIHJhbmdlLiAqL1xuICBfaXNDb21wYXJpc29uRW5kKHZhbHVlOiBudW1iZXIpIHtcbiAgICByZXR1cm4gaXNFbmQodmFsdWUsIHRoaXMuY29tcGFyaXNvblN0YXJ0LCB0aGlzLmNvbXBhcmlzb25FbmQpO1xuICB9XG5cbiAgLyoqIEdldHMgd2hldGhlciBhIHZhbHVlIGlzIHdpdGhpbiB0aGUgY3VycmVudCBjb21wYXJpc29uIHJhbmdlLiAqL1xuICBfaXNJbkNvbXBhcmlzb25SYW5nZSh2YWx1ZTogbnVtYmVyKSB7XG4gICAgcmV0dXJuIGlzSW5SYW5nZSh2YWx1ZSwgdGhpcy5jb21wYXJpc29uU3RhcnQsIHRoaXMuY29tcGFyaXNvbkVuZCwgdGhpcy5pc1JhbmdlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHdoZXRoZXIgYSB2YWx1ZSBpcyB0aGUgc2FtZSBhcyB0aGUgc3RhcnQgYW5kIGVuZCBvZiB0aGUgY29tcGFyaXNvbiByYW5nZS5cbiAgICogRm9yIGNvbnRleHQsIHRoZSBmdW5jdGlvbnMgdGhhdCB3ZSB1c2UgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgc29tZXRoaW5nIGlzIHRoZSBzdGFydC9lbmQgb2ZcbiAgICogYSByYW5nZSBkb24ndCBhbGxvdyBmb3IgdGhlIHN0YXJ0IGFuZCBlbmQgdG8gYmUgb24gdGhlIHNhbWUgZGF5LCBiZWNhdXNlIHdlJ2QgaGF2ZSB0byB1c2VcbiAgICogbXVjaCBtb3JlIHNwZWNpZmljIENTUyBzZWxlY3RvcnMgdG8gc3R5bGUgdGhlbSBjb3JyZWN0bHkgaW4gYWxsIHNjZW5hcmlvcy4gVGhpcyBpcyBmaW5lIGZvclxuICAgKiB0aGUgcmVndWxhciByYW5nZSwgYmVjYXVzZSB3aGVuIGl0IGhhcHBlbnMsIHRoZSBzZWxlY3RlZCBzdHlsZXMgdGFrZSBvdmVyIGFuZCBzdGlsbCBzaG93IHdoZXJlXG4gICAqIHRoZSByYW5nZSB3b3VsZCd2ZSBiZWVuLCBob3dldmVyIHdlIGRvbid0IGhhdmUgdGhlc2Ugc2VsZWN0ZWQgc3R5bGVzIGZvciBhIGNvbXBhcmlzb24gcmFuZ2UuXG4gICAqIFRoaXMgZnVuY3Rpb24gaXMgdXNlZCB0byBhcHBseSBhIGNsYXNzIHRoYXQgc2VydmVzIHRoZSBzYW1lIHB1cnBvc2UgYXMgdGhlIG9uZSBmb3Igc2VsZWN0ZWRcbiAgICogZGF0ZXMsIGJ1dCBpdCBvbmx5IGFwcGxpZXMgaW4gdGhlIGNvbnRleHQgb2YgYSBjb21wYXJpc29uIHJhbmdlLlxuICAgKi9cbiAgX2lzQ29tcGFyaXNvbklkZW50aWNhbCh2YWx1ZTogbnVtYmVyKSB7XG4gICAgLy8gTm90ZSB0aGF0IHdlIGRvbid0IG5lZWQgdG8gbnVsbCBjaGVjayB0aGUgc3RhcnQvZW5kXG4gICAgLy8gaGVyZSwgYmVjYXVzZSB0aGUgYHZhbHVlYCB3aWxsIGFsd2F5cyBiZSBkZWZpbmVkLlxuICAgIHJldHVybiB0aGlzLmNvbXBhcmlzb25TdGFydCA9PT0gdGhpcy5jb21wYXJpc29uRW5kICYmIHZhbHVlID09PSB0aGlzLmNvbXBhcmlzb25TdGFydDtcbiAgfVxuXG4gIC8qKiBHZXRzIHdoZXRoZXIgYSB2YWx1ZSBpcyB0aGUgc3RhcnQgb2YgdGhlIHByZXZpZXcgcmFuZ2UuICovXG4gIF9pc1ByZXZpZXdTdGFydCh2YWx1ZTogbnVtYmVyKSB7XG4gICAgcmV0dXJuIGlzU3RhcnQodmFsdWUsIHRoaXMucHJldmlld1N0YXJ0LCB0aGlzLnByZXZpZXdFbmQpO1xuICB9XG5cbiAgLyoqIEdldHMgd2hldGhlciBhIHZhbHVlIGlzIHRoZSBlbmQgb2YgdGhlIHByZXZpZXcgcmFuZ2UuICovXG4gIF9pc1ByZXZpZXdFbmQodmFsdWU6IG51bWJlcikge1xuICAgIHJldHVybiBpc0VuZCh2YWx1ZSwgdGhpcy5wcmV2aWV3U3RhcnQsIHRoaXMucHJldmlld0VuZCk7XG4gIH1cblxuICAvKiogR2V0cyB3aGV0aGVyIGEgdmFsdWUgaXMgaW5zaWRlIHRoZSBwcmV2aWV3IHJhbmdlLiAqL1xuICBfaXNJblByZXZpZXcodmFsdWU6IG51bWJlcikge1xuICAgIHJldHVybiBpc0luUmFuZ2UodmFsdWUsIHRoaXMucHJldmlld1N0YXJ0LCB0aGlzLnByZXZpZXdFbmQsIHRoaXMuaXNSYW5nZSk7XG4gIH1cblxuICAvKiogR2V0cyBpZHMgb2YgYXJpYSBkZXNjcmlwdGlvbnMgZm9yIHRoZSBzdGFydCBhbmQgZW5kIG9mIGEgZGF0ZSByYW5nZS4gKi9cbiAgX2dldERlc2NyaWJlZGJ5KHZhbHVlOiBudW1iZXIpOiBzdHJpbmcgfCBudWxsIHtcbiAgICBpZiAoIXRoaXMuaXNSYW5nZSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc3RhcnRWYWx1ZSA9PT0gdmFsdWUgJiYgdGhpcy5lbmRWYWx1ZSA9PT0gdmFsdWUpIHtcbiAgICAgIHJldHVybiBgJHt0aGlzLl9zdGFydERhdGVMYWJlbElkfSAke3RoaXMuX2VuZERhdGVMYWJlbElkfWA7XG4gICAgfSBlbHNlIGlmICh0aGlzLnN0YXJ0VmFsdWUgPT09IHZhbHVlKSB7XG4gICAgICByZXR1cm4gdGhpcy5fc3RhcnREYXRlTGFiZWxJZDtcbiAgICB9IGVsc2UgaWYgKHRoaXMuZW5kVmFsdWUgPT09IHZhbHVlKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZW5kRGF0ZUxhYmVsSWQ7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEV2ZW50IGhhbmRsZXIgZm9yIHdoZW4gdGhlIHVzZXIgZW50ZXJzIGFuIGVsZW1lbnRcbiAgICogaW5zaWRlIHRoZSBjYWxlbmRhciBib2R5IChlLmcuIGJ5IGhvdmVyaW5nIGluIG9yIGZvY3VzKS5cbiAgICovXG4gIHByaXZhdGUgX2VudGVySGFuZGxlciA9IChldmVudDogRXZlbnQpID0+IHtcbiAgICBpZiAodGhpcy5fc2tpcE5leHRGb2N1cyAmJiBldmVudC50eXBlID09PSAnZm9jdXMnKSB7XG4gICAgICB0aGlzLl9za2lwTmV4dEZvY3VzID0gZmFsc2U7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gV2Ugb25seSBuZWVkIHRvIGhpdCB0aGUgem9uZSB3aGVuIHdlJ3JlIHNlbGVjdGluZyBhIHJhbmdlLlxuICAgIGlmIChldmVudC50YXJnZXQgJiYgdGhpcy5pc1JhbmdlKSB7XG4gICAgICBjb25zdCBjZWxsID0gdGhpcy5fZ2V0Q2VsbEZyb21FbGVtZW50KGV2ZW50LnRhcmdldCBhcyBIVE1MRWxlbWVudCk7XG5cbiAgICAgIGlmIChjZWxsKSB7XG4gICAgICAgIHRoaXMuX25nWm9uZS5ydW4oKCkgPT4gdGhpcy5wcmV2aWV3Q2hhbmdlLmVtaXQoe3ZhbHVlOiBjZWxsLmVuYWJsZWQgPyBjZWxsIDogbnVsbCwgZXZlbnR9KSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIHByaXZhdGUgX3RvdWNobW92ZUhhbmRsZXIgPSAoZXZlbnQ6IFRvdWNoRXZlbnQpID0+IHtcbiAgICBpZiAoIXRoaXMuaXNSYW5nZSkgcmV0dXJuO1xuXG4gICAgY29uc3QgdGFyZ2V0ID0gZ2V0QWN0dWFsVG91Y2hUYXJnZXQoZXZlbnQpO1xuICAgIGNvbnN0IGNlbGwgPSB0YXJnZXQgPyB0aGlzLl9nZXRDZWxsRnJvbUVsZW1lbnQodGFyZ2V0IGFzIEhUTUxFbGVtZW50KSA6IG51bGw7XG5cbiAgICBpZiAodGFyZ2V0ICE9PSBldmVudC50YXJnZXQpIHtcbiAgICAgIHRoaXMuX2RpZERyYWdTaW5jZU1vdXNlRG93biA9IHRydWU7XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIGluaXRpYWwgdGFyZ2V0IG9mIHRoZSB0b3VjaCBpcyBhIGRhdGUgY2VsbCwgcHJldmVudCBkZWZhdWx0IHNvXG4gICAgLy8gdGhhdCB0aGUgbW92ZSBpcyBub3QgaGFuZGxlZCBhcyBhIHNjcm9sbC5cbiAgICBpZiAoZ2V0Q2VsbEVsZW1lbnQoZXZlbnQudGFyZ2V0IGFzIEhUTUxFbGVtZW50KSkge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG5cbiAgICB0aGlzLl9uZ1pvbmUucnVuKCgpID0+IHRoaXMucHJldmlld0NoYW5nZS5lbWl0KHt2YWx1ZTogY2VsbD8uZW5hYmxlZCA/IGNlbGwgOiBudWxsLCBldmVudH0pKTtcbiAgfTtcblxuICAvKipcbiAgICogRXZlbnQgaGFuZGxlciBmb3Igd2hlbiB0aGUgdXNlcidzIHBvaW50ZXIgbGVhdmVzIGFuIGVsZW1lbnRcbiAgICogaW5zaWRlIHRoZSBjYWxlbmRhciBib2R5IChlLmcuIGJ5IGhvdmVyaW5nIG91dCBvciBibHVycmluZykuXG4gICAqL1xuICBwcml2YXRlIF9sZWF2ZUhhbmRsZXIgPSAoZXZlbnQ6IEV2ZW50KSA9PiB7XG4gICAgLy8gV2Ugb25seSBuZWVkIHRvIGhpdCB0aGUgem9uZSB3aGVuIHdlJ3JlIHNlbGVjdGluZyBhIHJhbmdlLlxuICAgIGlmICh0aGlzLnByZXZpZXdFbmQgIT09IG51bGwgJiYgdGhpcy5pc1JhbmdlKSB7XG4gICAgICBpZiAoZXZlbnQudHlwZSAhPT0gJ2JsdXInKSB7XG4gICAgICAgIHRoaXMuX2RpZERyYWdTaW5jZU1vdXNlRG93biA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIC8vIE9ubHkgcmVzZXQgdGhlIHByZXZpZXcgZW5kIHZhbHVlIHdoZW4gbGVhdmluZyBjZWxscy4gVGhpcyBsb29rcyBiZXR0ZXIsIGJlY2F1c2VcbiAgICAgIC8vIHdlIGhhdmUgYSBnYXAgYmV0d2VlbiB0aGUgY2VsbHMgYW5kIHRoZSByb3dzIGFuZCB3ZSBkb24ndCB3YW50IHRvIHJlbW92ZSB0aGVcbiAgICAgIC8vIHJhbmdlIGp1c3QgZm9yIGl0IHRvIHNob3cgdXAgYWdhaW4gd2hlbiB0aGUgdXNlciBtb3ZlcyBhIGZldyBwaXhlbHMgdG8gdGhlIHNpZGUuXG4gICAgICBpZiAoXG4gICAgICAgIGV2ZW50LnRhcmdldCAmJlxuICAgICAgICB0aGlzLl9nZXRDZWxsRnJvbUVsZW1lbnQoZXZlbnQudGFyZ2V0IGFzIEhUTUxFbGVtZW50KSAmJlxuICAgICAgICAhKFxuICAgICAgICAgIChldmVudCBhcyBNb3VzZUV2ZW50KS5yZWxhdGVkVGFyZ2V0ICYmXG4gICAgICAgICAgdGhpcy5fZ2V0Q2VsbEZyb21FbGVtZW50KChldmVudCBhcyBNb3VzZUV2ZW50KS5yZWxhdGVkVGFyZ2V0IGFzIEhUTUxFbGVtZW50KVxuICAgICAgICApXG4gICAgICApIHtcbiAgICAgICAgdGhpcy5fbmdab25lLnJ1bigoKSA9PiB0aGlzLnByZXZpZXdDaGFuZ2UuZW1pdCh7dmFsdWU6IG51bGwsIGV2ZW50fSkpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogVHJpZ2dlcmVkIG9uIG1vdXNlZG93biBvciB0b3VjaHN0YXJ0IG9uIGEgZGF0ZSBjZWxsLlxuICAgKiBSZXNwc29uc2libGUgZm9yIHN0YXJ0aW5nIGEgZHJhZyBzZXF1ZW5jZS5cbiAgICovXG4gIHByaXZhdGUgX21vdXNlZG93bkhhbmRsZXIgPSAoZXZlbnQ6IEV2ZW50KSA9PiB7XG4gICAgaWYgKCF0aGlzLmlzUmFuZ2UpIHJldHVybjtcblxuICAgIHRoaXMuX2RpZERyYWdTaW5jZU1vdXNlRG93biA9IGZhbHNlO1xuICAgIC8vIEJlZ2luIGEgZHJhZyBpZiBhIGNlbGwgd2l0aGluIHRoZSBjdXJyZW50IHJhbmdlIHdhcyB0YXJnZXRlZC5cbiAgICBjb25zdCBjZWxsID0gZXZlbnQudGFyZ2V0ICYmIHRoaXMuX2dldENlbGxGcm9tRWxlbWVudChldmVudC50YXJnZXQgYXMgSFRNTEVsZW1lbnQpO1xuICAgIGlmICghY2VsbCB8fCAhdGhpcy5faXNJblJhbmdlKGNlbGwucmF3VmFsdWUpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fbmdab25lLnJ1bigoKSA9PiB7XG4gICAgICB0aGlzLmRyYWdTdGFydGVkLmVtaXQoe1xuICAgICAgICB2YWx1ZTogY2VsbC5yYXdWYWx1ZSxcbiAgICAgICAgZXZlbnQsXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfTtcblxuICAvKiogVHJpZ2dlcmVkIG9uIG1vdXNldXAgYW55d2hlcmUuIFJlc3Bzb25zaWJsZSBmb3IgZW5kaW5nIGEgZHJhZyBzZXF1ZW5jZS4gKi9cbiAgcHJpdmF0ZSBfbW91c2V1cEhhbmRsZXIgPSAoZXZlbnQ6IEV2ZW50KSA9PiB7XG4gICAgaWYgKCF0aGlzLmlzUmFuZ2UpIHJldHVybjtcblxuICAgIGNvbnN0IGNlbGxFbGVtZW50ID0gZ2V0Q2VsbEVsZW1lbnQoZXZlbnQudGFyZ2V0IGFzIEhUTUxFbGVtZW50KTtcbiAgICBpZiAoIWNlbGxFbGVtZW50KSB7XG4gICAgICAvLyBNb3VzZXVwIGhhcHBlbmVkIG91dHNpZGUgb2YgZGF0ZXBpY2tlci4gQ2FuY2VsIGRyYWcuXG4gICAgICB0aGlzLl9uZ1pvbmUucnVuKCgpID0+IHtcbiAgICAgICAgdGhpcy5kcmFnRW5kZWQuZW1pdCh7dmFsdWU6IG51bGwsIGV2ZW50fSk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoY2VsbEVsZW1lbnQuY2xvc2VzdCgnLm1hdC1jYWxlbmRhci1ib2R5JykgIT09IHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudCkge1xuICAgICAgLy8gTW91c2V1cCBoYXBwZW5lZCBpbnNpZGUgYSBkaWZmZXJlbnQgbW9udGggaW5zdGFuY2UuXG4gICAgICAvLyBBbGxvdyBpdCB0byBoYW5kbGUgdGhlIGV2ZW50LlxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX25nWm9uZS5ydW4oKCkgPT4ge1xuICAgICAgY29uc3QgY2VsbCA9IHRoaXMuX2dldENlbGxGcm9tRWxlbWVudChjZWxsRWxlbWVudCk7XG4gICAgICB0aGlzLmRyYWdFbmRlZC5lbWl0KHt2YWx1ZTogY2VsbD8ucmF3VmFsdWUgPz8gbnVsbCwgZXZlbnR9KTtcbiAgICB9KTtcbiAgfTtcblxuICAvKiogVHJpZ2dlcmVkIG9uIHRvdWNoZW5kIGFueXdoZXJlLiBSZXNwc29uc2libGUgZm9yIGVuZGluZyBhIGRyYWcgc2VxdWVuY2UuICovXG4gIHByaXZhdGUgX3RvdWNoZW5kSGFuZGxlciA9IChldmVudDogVG91Y2hFdmVudCkgPT4ge1xuICAgIGNvbnN0IHRhcmdldCA9IGdldEFjdHVhbFRvdWNoVGFyZ2V0KGV2ZW50KTtcblxuICAgIGlmICh0YXJnZXQpIHtcbiAgICAgIHRoaXMuX21vdXNldXBIYW5kbGVyKHt0YXJnZXR9IGFzIHVua25vd24gYXMgRXZlbnQpO1xuICAgIH1cbiAgfTtcblxuICAvKiogRmluZHMgdGhlIE1hdENhbGVuZGFyQ2VsbCB0aGF0IGNvcnJlc3BvbmRzIHRvIGEgRE9NIG5vZGUuICovXG4gIHByaXZhdGUgX2dldENlbGxGcm9tRWxlbWVudChlbGVtZW50OiBIVE1MRWxlbWVudCk6IE1hdENhbGVuZGFyQ2VsbCB8IG51bGwge1xuICAgIGNvbnN0IGNlbGwgPSBnZXRDZWxsRWxlbWVudChlbGVtZW50KTtcblxuICAgIGlmIChjZWxsKSB7XG4gICAgICBjb25zdCByb3cgPSBjZWxsLmdldEF0dHJpYnV0ZSgnZGF0YS1tYXQtcm93Jyk7XG4gICAgICBjb25zdCBjb2wgPSBjZWxsLmdldEF0dHJpYnV0ZSgnZGF0YS1tYXQtY29sJyk7XG5cbiAgICAgIGlmIChyb3cgJiYgY29sKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJvd3NbcGFyc2VJbnQocm93KV1bcGFyc2VJbnQoY29sKV07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBwcml2YXRlIF9pZCA9IGBtYXQtY2FsZW5kYXItYm9keS0ke2NhbGVuZGFyQm9keUlkKyt9YDtcblxuICBfc3RhcnREYXRlTGFiZWxJZCA9IGAke3RoaXMuX2lkfS1zdGFydC1kYXRlYDtcblxuICBfZW5kRGF0ZUxhYmVsSWQgPSBgJHt0aGlzLl9pZH0tZW5kLWRhdGVgO1xufVxuXG4vKiogQ2hlY2tzIHdoZXRoZXIgYSBub2RlIGlzIGEgdGFibGUgY2VsbCBlbGVtZW50LiAqL1xuZnVuY3Rpb24gaXNUYWJsZUNlbGwobm9kZTogTm9kZSB8IHVuZGVmaW5lZCB8IG51bGwpOiBub2RlIGlzIEhUTUxUYWJsZUNlbGxFbGVtZW50IHtcbiAgcmV0dXJuIG5vZGU/Lm5vZGVOYW1lID09PSAnVEQnO1xufVxuXG4vKipcbiAqIEdldHMgdGhlIGRhdGUgdGFibGUgY2VsbCBlbGVtZW50IHRoYXQgaXMgb3IgY29udGFpbnMgdGhlIHNwZWNpZmllZCBlbGVtZW50LlxuICogT3IgcmV0dXJucyBudWxsIGlmIGVsZW1lbnQgaXMgbm90IHBhcnQgb2YgYSBkYXRlIGNlbGwuXG4gKi9cbmZ1bmN0aW9uIGdldENlbGxFbGVtZW50KGVsZW1lbnQ6IEhUTUxFbGVtZW50KTogSFRNTEVsZW1lbnQgfCBudWxsIHtcbiAgbGV0IGNlbGw6IEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkO1xuICBpZiAoaXNUYWJsZUNlbGwoZWxlbWVudCkpIHtcbiAgICBjZWxsID0gZWxlbWVudDtcbiAgfSBlbHNlIGlmIChpc1RhYmxlQ2VsbChlbGVtZW50LnBhcmVudE5vZGUpKSB7XG4gICAgY2VsbCA9IGVsZW1lbnQucGFyZW50Tm9kZSBhcyBIVE1MRWxlbWVudDtcbiAgfSBlbHNlIGlmIChpc1RhYmxlQ2VsbChlbGVtZW50LnBhcmVudE5vZGU/LnBhcmVudE5vZGUpKSB7XG4gICAgY2VsbCA9IGVsZW1lbnQucGFyZW50Tm9kZSEucGFyZW50Tm9kZSBhcyBIVE1MRWxlbWVudDtcbiAgfVxuXG4gIHJldHVybiBjZWxsPy5nZXRBdHRyaWJ1dGUoJ2RhdGEtbWF0LXJvdycpICE9IG51bGwgPyBjZWxsIDogbnVsbDtcbn1cblxuLyoqIENoZWNrcyB3aGV0aGVyIGEgdmFsdWUgaXMgdGhlIHN0YXJ0IG9mIGEgcmFuZ2UuICovXG5mdW5jdGlvbiBpc1N0YXJ0KHZhbHVlOiBudW1iZXIsIHN0YXJ0OiBudW1iZXIgfCBudWxsLCBlbmQ6IG51bWJlciB8IG51bGwpOiBib29sZWFuIHtcbiAgcmV0dXJuIGVuZCAhPT0gbnVsbCAmJiBzdGFydCAhPT0gZW5kICYmIHZhbHVlIDwgZW5kICYmIHZhbHVlID09PSBzdGFydDtcbn1cblxuLyoqIENoZWNrcyB3aGV0aGVyIGEgdmFsdWUgaXMgdGhlIGVuZCBvZiBhIHJhbmdlLiAqL1xuZnVuY3Rpb24gaXNFbmQodmFsdWU6IG51bWJlciwgc3RhcnQ6IG51bWJlciB8IG51bGwsIGVuZDogbnVtYmVyIHwgbnVsbCk6IGJvb2xlYW4ge1xuICByZXR1cm4gc3RhcnQgIT09IG51bGwgJiYgc3RhcnQgIT09IGVuZCAmJiB2YWx1ZSA+PSBzdGFydCAmJiB2YWx1ZSA9PT0gZW5kO1xufVxuXG4vKiogQ2hlY2tzIHdoZXRoZXIgYSB2YWx1ZSBpcyBpbnNpZGUgb2YgYSByYW5nZS4gKi9cbmZ1bmN0aW9uIGlzSW5SYW5nZShcbiAgdmFsdWU6IG51bWJlcixcbiAgc3RhcnQ6IG51bWJlciB8IG51bGwsXG4gIGVuZDogbnVtYmVyIHwgbnVsbCxcbiAgcmFuZ2VFbmFibGVkOiBib29sZWFuLFxuKTogYm9vbGVhbiB7XG4gIHJldHVybiAoXG4gICAgcmFuZ2VFbmFibGVkICYmXG4gICAgc3RhcnQgIT09IG51bGwgJiZcbiAgICBlbmQgIT09IG51bGwgJiZcbiAgICBzdGFydCAhPT0gZW5kICYmXG4gICAgdmFsdWUgPj0gc3RhcnQgJiZcbiAgICB2YWx1ZSA8PSBlbmRcbiAgKTtcbn1cblxuLyoqXG4gKiBFeHRyYWN0cyB0aGUgZWxlbWVudCB0aGF0IGFjdHVhbGx5IGNvcnJlc3BvbmRzIHRvIGEgdG91Y2ggZXZlbnQncyBsb2NhdGlvblxuICogKHJhdGhlciB0aGFuIHRoZSBlbGVtZW50IHRoYXQgaW5pdGlhdGVkIHRoZSBzZXF1ZW5jZSBvZiB0b3VjaCBldmVudHMpLlxuICovXG5mdW5jdGlvbiBnZXRBY3R1YWxUb3VjaFRhcmdldChldmVudDogVG91Y2hFdmVudCk6IEVsZW1lbnQgfCBudWxsIHtcbiAgY29uc3QgdG91Y2hMb2NhdGlvbiA9IGV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdO1xuICByZXR1cm4gZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludCh0b3VjaExvY2F0aW9uLmNsaWVudFgsIHRvdWNoTG9jYXRpb24uY2xpZW50WSk7XG59XG4iLCI8IS0tXG4gIElmIHRoZXJlJ3Mgbm90IGVub3VnaCBzcGFjZSBpbiB0aGUgZmlyc3Qgcm93LCBjcmVhdGUgYSBzZXBhcmF0ZSBsYWJlbCByb3cuIFdlIG1hcmsgdGhpcyByb3cgYXNcbiAgYXJpYS1oaWRkZW4gYmVjYXVzZSB3ZSBkb24ndCB3YW50IGl0IHRvIGJlIHJlYWQgb3V0IGFzIG9uZSBvZiB0aGUgd2Vla3MgaW4gdGhlIG1vbnRoLlxuLS0+XG48dHIgKm5nSWY9XCJfZmlyc3RSb3dPZmZzZXQgPCBsYWJlbE1pblJlcXVpcmVkQ2VsbHNcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgPHRkIGNsYXNzPVwibWF0LWNhbGVuZGFyLWJvZHktbGFiZWxcIlxuICAgICAgW2F0dHIuY29sc3Bhbl09XCJudW1Db2xzXCJcbiAgICAgIFtzdHlsZS5wYWRkaW5nVG9wXT1cIl9jZWxsUGFkZGluZ1wiXG4gICAgICBbc3R5bGUucGFkZGluZ0JvdHRvbV09XCJfY2VsbFBhZGRpbmdcIj5cbiAgICB7e2xhYmVsfX1cbiAgPC90ZD5cbjwvdHI+XG5cbjwhLS0gQ3JlYXRlIHRoZSBmaXJzdCByb3cgc2VwYXJhdGVseSBzbyB3ZSBjYW4gaW5jbHVkZSBhIHNwZWNpYWwgc3BhY2VyIGNlbGwuIC0tPlxuPHRyICpuZ0Zvcj1cImxldCByb3cgb2Ygcm93czsgbGV0IHJvd0luZGV4ID0gaW5kZXhcIiByb2xlPVwicm93XCI+XG4gIDwhLS1cbiAgICBUaGlzIGNlbGwgaXMgcHVyZWx5IGRlY29yYXRpdmUsIGJ1dCB3ZSBjYW4ndCBwdXQgYGFyaWEtaGlkZGVuYCBvciBgcm9sZT1cInByZXNlbnRhdGlvblwiYCBvbiBpdCxcbiAgICBiZWNhdXNlIGl0IHRocm93cyBvZmYgdGhlIHdlZWsgZGF5cyBmb3IgdGhlIHJlc3Qgb2YgdGhlIHJvdyBvbiBOVkRBLiBUaGUgYXNwZWN0IHJhdGlvIG9mIHRoZVxuICAgIHRhYmxlIGNlbGxzIGlzIG1haW50YWluZWQgYnkgc2V0dGluZyB0aGUgdG9wIGFuZCBib3R0b20gcGFkZGluZyBhcyBhIHBlcmNlbnRhZ2Ugb2YgdGhlIHdpZHRoXG4gICAgKGEgdmFyaWFudCBvZiB0aGUgdHJpY2sgZGVzY3JpYmVkIGhlcmU6IGh0dHBzOi8vd3d3Lnczc2Nob29scy5jb20vaG93dG8vaG93dG9fY3NzX2FzcGVjdF9yYXRpby5hc3ApLlxuICAtLT5cbiAgPHRkICpuZ0lmPVwicm93SW5kZXggPT09IDAgJiYgX2ZpcnN0Um93T2Zmc2V0XCJcbiAgICAgIGNsYXNzPVwibWF0LWNhbGVuZGFyLWJvZHktbGFiZWxcIlxuICAgICAgW2F0dHIuY29sc3Bhbl09XCJfZmlyc3RSb3dPZmZzZXRcIlxuICAgICAgW3N0eWxlLnBhZGRpbmdUb3BdPVwiX2NlbGxQYWRkaW5nXCJcbiAgICAgIFtzdHlsZS5wYWRkaW5nQm90dG9tXT1cIl9jZWxsUGFkZGluZ1wiPlxuICAgIHt7X2ZpcnN0Um93T2Zmc2V0ID49IGxhYmVsTWluUmVxdWlyZWRDZWxscyA/IGxhYmVsIDogJyd9fVxuICA8L3RkPlxuICA8IS0tXG4gICAgRWFjaCBncmlkY2VsbCBpbiB0aGUgY2FsZW5kYXIgY29udGFpbnMgYSBidXR0b24sIHdoaWNoIHNpZ25hbHMgdG8gYXNzaXN0aXZlIHRlY2hub2xvZ3kgdGhhdCB0aGVcbiAgICBjZWxsIGlzIGludGVyYWN0YWJsZSwgYXMgd2VsbCBhcyB0aGUgc2VsZWN0aW9uIHN0YXRlIHZpYSBgYXJpYS1wcmVzc2VkYC4gU2VlICMyMzQ3NiBmb3JcbiAgICBiYWNrZ3JvdW5kLlxuICAtLT5cbiAgPHRkXG4gICAgKm5nRm9yPVwibGV0IGl0ZW0gb2Ygcm93OyBsZXQgY29sSW5kZXggPSBpbmRleFwiXG4gICAgcm9sZT1cImdyaWRjZWxsXCJcbiAgICBjbGFzcz1cIm1hdC1jYWxlbmRhci1ib2R5LWNlbGwtY29udGFpbmVyXCJcbiAgICBbc3R5bGUud2lkdGhdPVwiX2NlbGxXaWR0aFwiXG4gICAgW3N0eWxlLnBhZGRpbmdUb3BdPVwiX2NlbGxQYWRkaW5nXCJcbiAgICBbc3R5bGUucGFkZGluZ0JvdHRvbV09XCJfY2VsbFBhZGRpbmdcIlxuICAgIFthdHRyLmRhdGEtbWF0LXJvd109XCJyb3dJbmRleFwiXG4gICAgW2F0dHIuZGF0YS1tYXQtY29sXT1cImNvbEluZGV4XCJcbiAgPlxuICAgIDxidXR0b25cbiAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgIGNsYXNzPVwibWF0LWNhbGVuZGFyLWJvZHktY2VsbFwiXG4gICAgICAgIFtuZ0NsYXNzXT1cIml0ZW0uY3NzQ2xhc3Nlc1wiXG4gICAgICAgIFt0YWJpbmRleF09XCJfaXNBY3RpdmVDZWxsKHJvd0luZGV4LCBjb2xJbmRleCkgPyAwIDogLTFcIlxuICAgICAgICBbY2xhc3MubWF0LWNhbGVuZGFyLWJvZHktZGlzYWJsZWRdPVwiIWl0ZW0uZW5hYmxlZFwiXG4gICAgICAgIFtjbGFzcy5tYXQtY2FsZW5kYXItYm9keS1hY3RpdmVdPVwiX2lzQWN0aXZlQ2VsbChyb3dJbmRleCwgY29sSW5kZXgpXCJcbiAgICAgICAgW2NsYXNzLm1hdC1jYWxlbmRhci1ib2R5LXJhbmdlLXN0YXJ0XT1cIl9pc1JhbmdlU3RhcnQoaXRlbS5jb21wYXJlVmFsdWUpXCJcbiAgICAgICAgW2NsYXNzLm1hdC1jYWxlbmRhci1ib2R5LXJhbmdlLWVuZF09XCJfaXNSYW5nZUVuZChpdGVtLmNvbXBhcmVWYWx1ZSlcIlxuICAgICAgICBbY2xhc3MubWF0LWNhbGVuZGFyLWJvZHktaW4tcmFuZ2VdPVwiX2lzSW5SYW5nZShpdGVtLmNvbXBhcmVWYWx1ZSlcIlxuICAgICAgICBbY2xhc3MubWF0LWNhbGVuZGFyLWJvZHktY29tcGFyaXNvbi1icmlkZ2Utc3RhcnRdPVwiX2lzQ29tcGFyaXNvbkJyaWRnZVN0YXJ0KGl0ZW0uY29tcGFyZVZhbHVlLCByb3dJbmRleCwgY29sSW5kZXgpXCJcbiAgICAgICAgW2NsYXNzLm1hdC1jYWxlbmRhci1ib2R5LWNvbXBhcmlzb24tYnJpZGdlLWVuZF09XCJfaXNDb21wYXJpc29uQnJpZGdlRW5kKGl0ZW0uY29tcGFyZVZhbHVlLCByb3dJbmRleCwgY29sSW5kZXgpXCJcbiAgICAgICAgW2NsYXNzLm1hdC1jYWxlbmRhci1ib2R5LWNvbXBhcmlzb24tc3RhcnRdPVwiX2lzQ29tcGFyaXNvblN0YXJ0KGl0ZW0uY29tcGFyZVZhbHVlKVwiXG4gICAgICAgIFtjbGFzcy5tYXQtY2FsZW5kYXItYm9keS1jb21wYXJpc29uLWVuZF09XCJfaXNDb21wYXJpc29uRW5kKGl0ZW0uY29tcGFyZVZhbHVlKVwiXG4gICAgICAgIFtjbGFzcy5tYXQtY2FsZW5kYXItYm9keS1pbi1jb21wYXJpc29uLXJhbmdlXT1cIl9pc0luQ29tcGFyaXNvblJhbmdlKGl0ZW0uY29tcGFyZVZhbHVlKVwiXG4gICAgICAgIFtjbGFzcy5tYXQtY2FsZW5kYXItYm9keS1wcmV2aWV3LXN0YXJ0XT1cIl9pc1ByZXZpZXdTdGFydChpdGVtLmNvbXBhcmVWYWx1ZSlcIlxuICAgICAgICBbY2xhc3MubWF0LWNhbGVuZGFyLWJvZHktcHJldmlldy1lbmRdPVwiX2lzUHJldmlld0VuZChpdGVtLmNvbXBhcmVWYWx1ZSlcIlxuICAgICAgICBbY2xhc3MubWF0LWNhbGVuZGFyLWJvZHktaW4tcHJldmlld109XCJfaXNJblByZXZpZXcoaXRlbS5jb21wYXJlVmFsdWUpXCJcbiAgICAgICAgW2F0dHIuYXJpYS1sYWJlbF09XCJpdGVtLmFyaWFMYWJlbFwiXG4gICAgICAgIFthdHRyLmFyaWEtZGlzYWJsZWRdPVwiIWl0ZW0uZW5hYmxlZCB8fCBudWxsXCJcbiAgICAgICAgW2F0dHIuYXJpYS1wcmVzc2VkXT1cIl9pc1NlbGVjdGVkKGl0ZW0uY29tcGFyZVZhbHVlKVwiXG4gICAgICAgIFthdHRyLmFyaWEtY3VycmVudF09XCJ0b2RheVZhbHVlID09PSBpdGVtLmNvbXBhcmVWYWx1ZSA/ICdkYXRlJyA6IG51bGxcIlxuICAgICAgICBbYXR0ci5hcmlhLWRlc2NyaWJlZGJ5XT1cIl9nZXREZXNjcmliZWRieShpdGVtLmNvbXBhcmVWYWx1ZSlcIlxuICAgICAgICAoY2xpY2spPVwiX2NlbGxDbGlja2VkKGl0ZW0sICRldmVudClcIlxuICAgICAgICAoZm9jdXMpPVwiX2VtaXRBY3RpdmVEYXRlQ2hhbmdlKGl0ZW0sICRldmVudClcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIm1hdC1jYWxlbmRhci1ib2R5LWNlbGwtY29udGVudCBtYXQtZm9jdXMtaW5kaWNhdG9yXCJcbiAgICAgICAgICBbY2xhc3MubWF0LWNhbGVuZGFyLWJvZHktc2VsZWN0ZWRdPVwiX2lzU2VsZWN0ZWQoaXRlbS5jb21wYXJlVmFsdWUpXCJcbiAgICAgICAgICBbY2xhc3MubWF0LWNhbGVuZGFyLWJvZHktY29tcGFyaXNvbi1pZGVudGljYWxdPVwiX2lzQ29tcGFyaXNvbklkZW50aWNhbChpdGVtLmNvbXBhcmVWYWx1ZSlcIlxuICAgICAgICAgIFtjbGFzcy5tYXQtY2FsZW5kYXItYm9keS10b2RheV09XCJ0b2RheVZhbHVlID09PSBpdGVtLmNvbXBhcmVWYWx1ZVwiPlxuICAgICAgICAgIHt7aXRlbS5kaXNwbGF5VmFsdWV9fVxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIm1hdC1jYWxlbmRhci1ib2R5LWNlbGwtcHJldmlld1wiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvZGl2PlxuICAgIDwvYnV0dG9uPlxuICA8L3RkPlxuPC90cj5cblxuPGxhYmVsIFtpZF09XCJfc3RhcnREYXRlTGFiZWxJZFwiIGNsYXNzPVwibWF0LWNhbGVuZGFyLWJvZHktaGlkZGVuLWxhYmVsXCI+XG4gIHt7c3RhcnREYXRlQWNjZXNzaWJsZU5hbWV9fVxuPC9sYWJlbD5cbjxsYWJlbCBbaWRdPVwiX2VuZERhdGVMYWJlbElkXCIgY2xhc3M9XCJtYXQtY2FsZW5kYXItYm9keS1oaWRkZW4tbGFiZWxcIj5cbiAge3tlbmREYXRlQWNjZXNzaWJsZU5hbWV9fVxuPC9sYWJlbD5cbiJdfQ==