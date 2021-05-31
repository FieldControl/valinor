/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output, ViewEncapsulation, NgZone, } from '@angular/core';
import { take } from 'rxjs/operators';
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
/**
 * An internal component used to display calendar data in a table.
 * @docs-private
 */
export class MatCalendarBody {
    constructor(_elementRef, _ngZone) {
        this._elementRef = _elementRef;
        this._ngZone = _ngZone;
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
        /**
         * Event handler for when the user's pointer leaves an element
         * inside the calendar body (e.g. by hovering out or blurring).
         */
        this._leaveHandler = (event) => {
            // We only need to hit the zone when we're selecting a range.
            if (this.previewEnd !== null && this.isRange) {
                // Only reset the preview end value when leaving cells. This looks better, because
                // we have a gap between the cells and the rows and we don't want to remove the
                // range just for it to show up again when the user moves a few pixels to the side.
                if (event.target && isTableCell(event.target)) {
                    this._ngZone.run(() => this.previewChange.emit({ value: null, event }));
                }
            }
        };
        _ngZone.runOutsideAngular(() => {
            const element = _elementRef.nativeElement;
            element.addEventListener('mouseenter', this._enterHandler, true);
            element.addEventListener('focus', this._enterHandler, true);
            element.addEventListener('mouseleave', this._leaveHandler, true);
            element.addEventListener('blur', this._leaveHandler, true);
        });
    }
    /** Called when a cell is clicked. */
    _cellClicked(cell, event) {
        if (cell.enabled) {
            this.selectedValueChange.emit({ value: cell.value, event });
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
            this._cellPadding = `${50 * this.cellAspectRatio / numCols}%`;
        }
        if (columnChanges || !this._cellWidth) {
            this._cellWidth = `${100 / numCols}%`;
        }
    }
    ngOnDestroy() {
        const element = this._elementRef.nativeElement;
        element.removeEventListener('mouseenter', this._enterHandler, true);
        element.removeEventListener('focus', this._enterHandler, true);
        element.removeEventListener('mouseleave', this._leaveHandler, true);
        element.removeEventListener('blur', this._leaveHandler, true);
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
    /** Focuses the active cell after the microtask queue is empty. */
    _focusActiveCell(movePreview = true) {
        this._ngZone.runOutsideAngular(() => {
            this._ngZone.onStable.pipe(take(1)).subscribe(() => {
                const activeCell = this._elementRef.nativeElement.querySelector('.mat-calendar-body-active');
                if (activeCell) {
                    if (!movePreview) {
                        this._skipNextFocus = true;
                    }
                    activeCell.focus();
                }
            });
        });
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
    /** Finds the MatCalendarCell that corresponds to a DOM node. */
    _getCellFromElement(element) {
        let cell;
        if (isTableCell(element)) {
            cell = element;
        }
        else if (isTableCell(element.parentNode)) {
            cell = element.parentNode;
        }
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
MatCalendarBody.decorators = [
    { type: Component, args: [{
                selector: '[mat-calendar-body]',
                template: "<!--\n  If there's not enough space in the first row, create a separate label row. We mark this row as\n  aria-hidden because we don't want it to be read out as one of the weeks in the month.\n-->\n<tr *ngIf=\"_firstRowOffset < labelMinRequiredCells\" aria-hidden=\"true\">\n  <td class=\"mat-calendar-body-label\"\n      [attr.colspan]=\"numCols\"\n      [style.paddingTop]=\"_cellPadding\"\n      [style.paddingBottom]=\"_cellPadding\">\n    {{label}}\n  </td>\n</tr>\n\n<!-- Create the first row separately so we can include a special spacer cell. -->\n<tr *ngFor=\"let row of rows; let rowIndex = index\" role=\"row\">\n  <!--\n    We mark this cell as aria-hidden so it doesn't get read out as one of the days in the week.\n    The aspect ratio of the table cells is maintained by setting the top and bottom padding as a\n    percentage of the width (a variant of the trick described here:\n    https://www.w3schools.com/howto/howto_css_aspect_ratio.asp).\n  -->\n  <td *ngIf=\"rowIndex === 0 && _firstRowOffset\"\n      aria-hidden=\"true\"\n      class=\"mat-calendar-body-label\"\n      [attr.colspan]=\"_firstRowOffset\"\n      [style.paddingTop]=\"_cellPadding\"\n      [style.paddingBottom]=\"_cellPadding\">\n    {{_firstRowOffset >= labelMinRequiredCells ? label : ''}}\n  </td>\n  <td *ngFor=\"let item of row; let colIndex = index\"\n      role=\"gridcell\"\n      class=\"mat-calendar-body-cell\"\n      [ngClass]=\"item.cssClasses\"\n      [tabindex]=\"_isActiveCell(rowIndex, colIndex) ? 0 : -1\"\n      [attr.data-mat-row]=\"rowIndex\"\n      [attr.data-mat-col]=\"colIndex\"\n      [class.mat-calendar-body-disabled]=\"!item.enabled\"\n      [class.mat-calendar-body-active]=\"_isActiveCell(rowIndex, colIndex)\"\n      [class.mat-calendar-body-range-start]=\"_isRangeStart(item.compareValue)\"\n      [class.mat-calendar-body-range-end]=\"_isRangeEnd(item.compareValue)\"\n      [class.mat-calendar-body-in-range]=\"_isInRange(item.compareValue)\"\n      [class.mat-calendar-body-comparison-bridge-start]=\"_isComparisonBridgeStart(item.compareValue, rowIndex, colIndex)\"\n      [class.mat-calendar-body-comparison-bridge-end]=\"_isComparisonBridgeEnd(item.compareValue, rowIndex, colIndex)\"\n      [class.mat-calendar-body-comparison-start]=\"_isComparisonStart(item.compareValue)\"\n      [class.mat-calendar-body-comparison-end]=\"_isComparisonEnd(item.compareValue)\"\n      [class.mat-calendar-body-in-comparison-range]=\"_isInComparisonRange(item.compareValue)\"\n      [class.mat-calendar-body-preview-start]=\"_isPreviewStart(item.compareValue)\"\n      [class.mat-calendar-body-preview-end]=\"_isPreviewEnd(item.compareValue)\"\n      [class.mat-calendar-body-in-preview]=\"_isInPreview(item.compareValue)\"\n      [attr.aria-label]=\"item.ariaLabel\"\n      [attr.aria-disabled]=\"!item.enabled || null\"\n      [attr.aria-selected]=\"_isSelected(item.compareValue)\"\n      (click)=\"_cellClicked(item, $event)\"\n      [style.width]=\"_cellWidth\"\n      [style.paddingTop]=\"_cellPadding\"\n      [style.paddingBottom]=\"_cellPadding\">\n      <div class=\"mat-calendar-body-cell-content mat-focus-indicator\"\n        [class.mat-calendar-body-selected]=\"_isSelected(item.compareValue)\"\n        [class.mat-calendar-body-comparison-identical]=\"_isComparisonIdentical(item.compareValue)\"\n        [class.mat-calendar-body-today]=\"todayValue === item.compareValue\">\n        {{item.displayValue}}\n      </div>\n      <div class=\"mat-calendar-body-cell-preview\"></div>\n  </td>\n</tr>\n",
                host: {
                    'class': 'mat-calendar-body',
                    'role': 'grid',
                    'aria-readonly': 'true'
                },
                exportAs: 'matCalendarBody',
                encapsulation: ViewEncapsulation.None,
                changeDetection: ChangeDetectionStrategy.OnPush,
                styles: [".mat-calendar-body{min-width:224px}.mat-calendar-body-label{height:0;line-height:0;text-align:left;padding-left:4.7142857143%;padding-right:4.7142857143%}.mat-calendar-body-cell{position:relative;height:0;line-height:0;text-align:center;outline:none;cursor:pointer}.mat-calendar-body-cell::before,.mat-calendar-body-cell::after,.mat-calendar-body-cell-preview{content:\"\";position:absolute;top:5%;left:0;z-index:0;box-sizing:border-box;height:90%;width:100%}.mat-calendar-body-range-start:not(.mat-calendar-body-in-comparison-range)::before,.mat-calendar-body-range-start::after,.mat-calendar-body-comparison-start:not(.mat-calendar-body-comparison-bridge-start)::before,.mat-calendar-body-comparison-start::after,.mat-calendar-body-preview-start .mat-calendar-body-cell-preview{left:5%;width:95%;border-top-left-radius:999px;border-bottom-left-radius:999px}[dir=rtl] .mat-calendar-body-range-start:not(.mat-calendar-body-in-comparison-range)::before,[dir=rtl] .mat-calendar-body-range-start::after,[dir=rtl] .mat-calendar-body-comparison-start:not(.mat-calendar-body-comparison-bridge-start)::before,[dir=rtl] .mat-calendar-body-comparison-start::after,[dir=rtl] .mat-calendar-body-preview-start .mat-calendar-body-cell-preview{left:0;border-radius:0;border-top-right-radius:999px;border-bottom-right-radius:999px}.mat-calendar-body-range-end:not(.mat-calendar-body-in-comparison-range)::before,.mat-calendar-body-range-end::after,.mat-calendar-body-comparison-end:not(.mat-calendar-body-comparison-bridge-end)::before,.mat-calendar-body-comparison-end::after,.mat-calendar-body-preview-end .mat-calendar-body-cell-preview{width:95%;border-top-right-radius:999px;border-bottom-right-radius:999px}[dir=rtl] .mat-calendar-body-range-end:not(.mat-calendar-body-in-comparison-range)::before,[dir=rtl] .mat-calendar-body-range-end::after,[dir=rtl] .mat-calendar-body-comparison-end:not(.mat-calendar-body-comparison-bridge-end)::before,[dir=rtl] .mat-calendar-body-comparison-end::after,[dir=rtl] .mat-calendar-body-preview-end .mat-calendar-body-cell-preview{left:5%;border-radius:0;border-top-left-radius:999px;border-bottom-left-radius:999px}[dir=rtl] .mat-calendar-body-comparison-bridge-start.mat-calendar-body-range-end::after,[dir=rtl] .mat-calendar-body-comparison-bridge-end.mat-calendar-body-range-start::after{width:95%;border-top-right-radius:999px;border-bottom-right-radius:999px}.mat-calendar-body-comparison-start.mat-calendar-body-range-end::after,[dir=rtl] .mat-calendar-body-comparison-start.mat-calendar-body-range-end::after,.mat-calendar-body-comparison-end.mat-calendar-body-range-start::after,[dir=rtl] .mat-calendar-body-comparison-end.mat-calendar-body-range-start::after{width:90%}.mat-calendar-body-in-preview .mat-calendar-body-cell-preview{border-top:dashed 1px;border-bottom:dashed 1px}.mat-calendar-body-preview-start .mat-calendar-body-cell-preview{border-left:dashed 1px}[dir=rtl] .mat-calendar-body-preview-start .mat-calendar-body-cell-preview{border-left:0;border-right:dashed 1px}.mat-calendar-body-preview-end .mat-calendar-body-cell-preview{border-right:dashed 1px}[dir=rtl] .mat-calendar-body-preview-end .mat-calendar-body-cell-preview{border-right:0;border-left:dashed 1px}.mat-calendar-body-disabled{cursor:default}.cdk-high-contrast-active .mat-calendar-body-disabled{opacity:.5}.mat-calendar-body-cell-content{top:5%;left:5%;z-index:1;display:flex;align-items:center;justify-content:center;box-sizing:border-box;width:90%;height:90%;line-height:1;border-width:1px;border-style:solid;border-radius:999px}.mat-calendar-body-cell-content.mat-focus-indicator{position:absolute}.cdk-high-contrast-active .mat-calendar-body-cell-content{border:none}.cdk-high-contrast-active .mat-datepicker-popup:not(:empty),.cdk-high-contrast-active .mat-calendar-body-selected{outline:solid 1px}.cdk-high-contrast-active .mat-calendar-body-today{outline:dotted 1px}.cdk-high-contrast-active .cdk-keyboard-focused .mat-calendar-body-active>.mat-calendar-body-cell-content:not(.mat-calendar-body-selected),.cdk-high-contrast-active .cdk-program-focused .mat-calendar-body-active>.mat-calendar-body-cell-content:not(.mat-calendar-body-selected){outline:dotted 2px}[dir=rtl] .mat-calendar-body-label{text-align:right}@media(hover: none){.mat-calendar-body-cell:not(.mat-calendar-body-disabled):hover>.mat-calendar-body-cell-content:not(.mat-calendar-body-selected){background-color:transparent}}\n"]
            },] }
];
MatCalendarBody.ctorParameters = () => [
    { type: ElementRef },
    { type: NgZone }
];
MatCalendarBody.propDecorators = {
    label: [{ type: Input }],
    rows: [{ type: Input }],
    todayValue: [{ type: Input }],
    startValue: [{ type: Input }],
    endValue: [{ type: Input }],
    labelMinRequiredCells: [{ type: Input }],
    numCols: [{ type: Input }],
    activeCell: [{ type: Input }],
    isRange: [{ type: Input }],
    cellAspectRatio: [{ type: Input }],
    comparisonStart: [{ type: Input }],
    comparisonEnd: [{ type: Input }],
    previewStart: [{ type: Input }],
    previewEnd: [{ type: Input }],
    selectedValueChange: [{ type: Output }],
    previewChange: [{ type: Output }]
};
/** Checks whether a node is a table cell element. */
function isTableCell(node) {
    return node.nodeName === 'TD';
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
    return rangeEnabled && start !== null && end !== null && start !== end &&
        value >= start && value <= end;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FsZW5kYXItYm9keS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9kYXRlcGlja2VyL2NhbGVuZGFyLWJvZHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLHVCQUF1QixFQUN2QixTQUFTLEVBQ1QsVUFBVSxFQUNWLFlBQVksRUFDWixLQUFLLEVBQ0wsTUFBTSxFQUNOLGlCQUFpQixFQUNqQixNQUFNLEdBSVAsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLElBQUksRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBU3BDOzs7R0FHRztBQUNILE1BQU0sT0FBTyxlQUFlO0lBQzFCLFlBQW1CLEtBQWEsRUFDYixZQUFvQixFQUNwQixTQUFpQixFQUNqQixPQUFnQixFQUNoQixhQUF3QyxFQUFFLEVBQzFDLGVBQWUsS0FBSyxFQUNwQixRQUFZO1FBTlosVUFBSyxHQUFMLEtBQUssQ0FBUTtRQUNiLGlCQUFZLEdBQVosWUFBWSxDQUFRO1FBQ3BCLGNBQVMsR0FBVCxTQUFTLENBQVE7UUFDakIsWUFBTyxHQUFQLE9BQU8sQ0FBUztRQUNoQixlQUFVLEdBQVYsVUFBVSxDQUFnQztRQUMxQyxpQkFBWSxHQUFaLFlBQVksQ0FBUTtRQUNwQixhQUFRLEdBQVIsUUFBUSxDQUFJO0lBQUcsQ0FBQztDQUNwQztBQVFEOzs7R0FHRztBQWNILE1BQU0sT0FBTyxlQUFlO0lBb0UxQixZQUFvQixXQUFvQyxFQUFVLE9BQWU7UUFBN0QsZ0JBQVcsR0FBWCxXQUFXLENBQXlCO1FBQVUsWUFBTyxHQUFQLE9BQU8sQ0FBUTtRQTNDakYsMENBQTBDO1FBQ2pDLFlBQU8sR0FBVyxDQUFDLENBQUM7UUFFN0IsdURBQXVEO1FBQzlDLGVBQVUsR0FBVyxDQUFDLENBQUM7UUFFaEMseUNBQXlDO1FBQ2hDLFlBQU8sR0FBWSxLQUFLLENBQUM7UUFFbEM7OztXQUdHO1FBQ00sb0JBQWUsR0FBVyxDQUFDLENBQUM7UUFRckMsa0NBQWtDO1FBQ3pCLGlCQUFZLEdBQWtCLElBQUksQ0FBQztRQUU1QyxnQ0FBZ0M7UUFDdkIsZUFBVSxHQUFrQixJQUFJLENBQUM7UUFFMUMsMENBQTBDO1FBQ3ZCLHdCQUFtQixHQUFHLElBQUksWUFBWSxFQUFnQyxDQUFDO1FBRTFGLHVFQUF1RTtRQUNwRCxrQkFBYSxHQUM5QixJQUFJLFlBQVksRUFBZ0QsQ0FBQztRQXFMbkU7OztXQUdHO1FBQ0ssa0JBQWEsR0FBRyxDQUFDLEtBQVksRUFBRSxFQUFFO1lBQ3ZDLElBQUksSUFBSSxDQUFDLGNBQWMsSUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLE9BQU8sRUFBRTtnQkFDakQsSUFBSSxDQUFDLGNBQWMsR0FBRyxLQUFLLENBQUM7Z0JBQzVCLE9BQU87YUFDUjtZQUVELDZEQUE2RDtZQUM3RCxJQUFJLEtBQUssQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDaEMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxNQUFxQixDQUFDLENBQUM7Z0JBRW5FLElBQUksSUFBSSxFQUFFO29CQUNSLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEVBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBQyxDQUFDLENBQUMsQ0FBQztpQkFDN0Y7YUFDRjtRQUNILENBQUMsQ0FBQTtRQUVEOzs7V0FHRztRQUNLLGtCQUFhLEdBQUcsQ0FBQyxLQUFZLEVBQUUsRUFBRTtZQUN2Qyw2REFBNkQ7WUFDN0QsSUFBSSxJQUFJLENBQUMsVUFBVSxLQUFLLElBQUksSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUM1QyxrRkFBa0Y7Z0JBQ2xGLCtFQUErRTtnQkFDL0UsbUZBQW1GO2dCQUNuRixJQUFJLEtBQUssQ0FBQyxNQUFNLElBQUksV0FBVyxDQUFDLEtBQUssQ0FBQyxNQUFxQixDQUFDLEVBQUU7b0JBQzVELElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEVBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ3ZFO2FBQ0Y7UUFDSCxDQUFDLENBQUE7UUEzTUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRTtZQUM3QixNQUFNLE9BQU8sR0FBRyxXQUFXLENBQUMsYUFBYSxDQUFDO1lBQzFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNqRSxPQUFPLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDNUQsT0FBTyxDQUFDLGdCQUFnQixDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ2pFLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM3RCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxxQ0FBcUM7SUFDckMsWUFBWSxDQUFDLElBQXFCLEVBQUUsS0FBaUI7UUFDbkQsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ2hCLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsRUFBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDO1NBQzNEO0lBQ0gsQ0FBQztJQUVELDJEQUEyRDtJQUMzRCxXQUFXLENBQUMsS0FBYTtRQUN2QixPQUFPLElBQUksQ0FBQyxVQUFVLEtBQUssS0FBSyxJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssS0FBSyxDQUFDO0lBQzlELENBQUM7SUFFRCxXQUFXLENBQUMsT0FBc0I7UUFDaEMsTUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3pDLE1BQU0sRUFBQyxJQUFJLEVBQUUsT0FBTyxFQUFDLEdBQUcsSUFBSSxDQUFDO1FBRTdCLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLGFBQWEsRUFBRTtZQUNwQyxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksSUFBSSxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDN0Y7UUFFRCxJQUFJLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLGFBQWEsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUU7WUFDckUsSUFBSSxDQUFDLFlBQVksR0FBRyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsZUFBZSxHQUFHLE9BQU8sR0FBRyxDQUFDO1NBQy9EO1FBRUQsSUFBSSxhQUFhLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ3JDLElBQUksQ0FBQyxVQUFVLEdBQUcsR0FBRyxHQUFHLEdBQUcsT0FBTyxHQUFHLENBQUM7U0FDdkM7SUFDSCxDQUFDO0lBRUQsV0FBVztRQUNULE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDO1FBQy9DLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNwRSxPQUFPLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDL0QsT0FBTyxDQUFDLG1CQUFtQixDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3BFLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNoRSxDQUFDO0lBRUQsd0NBQXdDO0lBQ3hDLGFBQWEsQ0FBQyxRQUFnQixFQUFFLFFBQWdCO1FBQzlDLElBQUksVUFBVSxHQUFHLFFBQVEsR0FBRyxJQUFJLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQztRQUVwRCxzRUFBc0U7UUFDdEUsSUFBSSxRQUFRLEVBQUU7WUFDWixVQUFVLElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQztTQUNwQztRQUVELE9BQU8sVUFBVSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUM7SUFDdkMsQ0FBQztJQUVELGtFQUFrRTtJQUNsRSxnQkFBZ0IsQ0FBQyxXQUFXLEdBQUcsSUFBSTtRQUNqQyxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRTtZQUNsQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRTtnQkFDakQsTUFBTSxVQUFVLEdBQ1osSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLDJCQUEyQixDQUFDLENBQUM7Z0JBRTlFLElBQUksVUFBVSxFQUFFO29CQUNkLElBQUksQ0FBQyxXQUFXLEVBQUU7d0JBQ2hCLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO3FCQUM1QjtvQkFFRCxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7aUJBQ3BCO1lBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCwyREFBMkQ7SUFDM0QsYUFBYSxDQUFDLEtBQWE7UUFDekIsT0FBTyxPQUFPLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3hELENBQUM7SUFFRCx5REFBeUQ7SUFDekQsV0FBVyxDQUFDLEtBQWE7UUFDdkIsT0FBTyxLQUFLLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3RELENBQUM7SUFFRCxtRUFBbUU7SUFDbkUsVUFBVSxDQUFDLEtBQWE7UUFDdEIsT0FBTyxTQUFTLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDeEUsQ0FBQztJQUVELGlFQUFpRTtJQUNqRSxrQkFBa0IsQ0FBQyxLQUFhO1FBQzlCLE9BQU8sT0FBTyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUNsRSxDQUFDO0lBRUQsc0ZBQXNGO0lBQ3RGLHdCQUF3QixDQUFDLEtBQWEsRUFBRSxRQUFnQixFQUFFLFFBQWdCO1FBQ3hFLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDM0YsT0FBTyxLQUFLLENBQUM7U0FDZDtRQUVELElBQUksWUFBWSxHQUFnQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUVsRixJQUFJLENBQUMsWUFBWSxFQUFFO1lBQ2pCLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQzVDLFlBQVksR0FBRyxXQUFXLElBQUksV0FBVyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7U0FDbkU7UUFFRCxPQUFPLFlBQVksSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ3RFLENBQUM7SUFFRCxxRkFBcUY7SUFDckYsc0JBQXNCLENBQUMsS0FBYSxFQUFFLFFBQWdCLEVBQUUsUUFBZ0I7UUFDdEUsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUN2RixPQUFPLEtBQUssQ0FBQztTQUNkO1FBRUQsSUFBSSxRQUFRLEdBQWdDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBRTlFLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDYixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUN4QyxRQUFRLEdBQUcsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNsQztRQUVELE9BQU8sUUFBUSxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDaEUsQ0FBQztJQUVELCtEQUErRDtJQUMvRCxnQkFBZ0IsQ0FBQyxLQUFhO1FBQzVCLE9BQU8sS0FBSyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUNoRSxDQUFDO0lBRUQsbUVBQW1FO0lBQ25FLG9CQUFvQixDQUFDLEtBQWE7UUFDaEMsT0FBTyxTQUFTLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDbEYsQ0FBQztJQUVEOzs7Ozs7Ozs7T0FTRztJQUNILHNCQUFzQixDQUFDLEtBQWE7UUFDbEMsc0RBQXNEO1FBQ3RELG9EQUFvRDtRQUNwRCxPQUFPLElBQUksQ0FBQyxlQUFlLEtBQUssSUFBSSxDQUFDLGFBQWEsSUFBSSxLQUFLLEtBQUssSUFBSSxDQUFDLGVBQWUsQ0FBQztJQUN2RixDQUFDO0lBRUQsOERBQThEO0lBQzlELGVBQWUsQ0FBQyxLQUFhO1FBQzNCLE9BQU8sT0FBTyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUM1RCxDQUFDO0lBRUQsNERBQTREO0lBQzVELGFBQWEsQ0FBQyxLQUFhO1FBQ3pCLE9BQU8sS0FBSyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUMxRCxDQUFDO0lBRUQsd0RBQXdEO0lBQ3hELFlBQVksQ0FBQyxLQUFhO1FBQ3hCLE9BQU8sU0FBUyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzVFLENBQUM7SUFzQ0QsZ0VBQWdFO0lBQ3hELG1CQUFtQixDQUFDLE9BQW9CO1FBQzlDLElBQUksSUFBNkIsQ0FBQztRQUVsQyxJQUFJLFdBQVcsQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUN4QixJQUFJLEdBQUcsT0FBTyxDQUFDO1NBQ2hCO2FBQU0sSUFBSSxXQUFXLENBQUMsT0FBTyxDQUFDLFVBQVcsQ0FBQyxFQUFFO1lBQzNDLElBQUksR0FBRyxPQUFPLENBQUMsVUFBeUIsQ0FBQztTQUMxQztRQUVELElBQUksSUFBSSxFQUFFO1lBQ1IsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUM5QyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBRTlDLElBQUksR0FBRyxJQUFJLEdBQUcsRUFBRTtnQkFDZCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7YUFDaEQ7U0FDRjtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQzs7O1lBblRGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUscUJBQXFCO2dCQUMvQixvOUdBQWlDO2dCQUVqQyxJQUFJLEVBQUU7b0JBQ0osT0FBTyxFQUFFLG1CQUFtQjtvQkFDNUIsTUFBTSxFQUFFLE1BQU07b0JBQ2QsZUFBZSxFQUFFLE1BQU07aUJBQ3hCO2dCQUNELFFBQVEsRUFBRSxpQkFBaUI7Z0JBQzNCLGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxJQUFJO2dCQUNyQyxlQUFlLEVBQUUsdUJBQXVCLENBQUMsTUFBTTs7YUFDaEQ7OztZQXZEQyxVQUFVO1lBS1YsTUFBTTs7O29CQTJETCxLQUFLO21CQUdMLEtBQUs7eUJBR0wsS0FBSzt5QkFHTCxLQUFLO3VCQUdMLEtBQUs7b0NBR0wsS0FBSztzQkFHTCxLQUFLO3lCQUdMLEtBQUs7c0JBR0wsS0FBSzs4QkFNTCxLQUFLOzhCQUdMLEtBQUs7NEJBR0wsS0FBSzsyQkFHTCxLQUFLO3lCQUdMLEtBQUs7a0NBR0wsTUFBTTs0QkFHTixNQUFNOztBQWtQVCxxREFBcUQ7QUFDckQsU0FBUyxXQUFXLENBQUMsSUFBVTtJQUM3QixPQUFPLElBQUksQ0FBQyxRQUFRLEtBQUssSUFBSSxDQUFDO0FBQ2hDLENBQUM7QUFFRCxzREFBc0Q7QUFDdEQsU0FBUyxPQUFPLENBQUMsS0FBYSxFQUFFLEtBQW9CLEVBQUUsR0FBa0I7SUFDdEUsT0FBTyxHQUFHLEtBQUssSUFBSSxJQUFJLEtBQUssS0FBSyxHQUFHLElBQUksS0FBSyxHQUFHLEdBQUcsSUFBSSxLQUFLLEtBQUssS0FBSyxDQUFDO0FBQ3pFLENBQUM7QUFFRCxvREFBb0Q7QUFDcEQsU0FBUyxLQUFLLENBQUMsS0FBYSxFQUFFLEtBQW9CLEVBQUUsR0FBa0I7SUFDcEUsT0FBTyxLQUFLLEtBQUssSUFBSSxJQUFJLEtBQUssS0FBSyxHQUFHLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLEtBQUssR0FBRyxDQUFDO0FBQzVFLENBQUM7QUFFRCxtREFBbUQ7QUFDbkQsU0FBUyxTQUFTLENBQUMsS0FBYSxFQUNiLEtBQW9CLEVBQ3BCLEdBQWtCLEVBQ2xCLFlBQXFCO0lBQ3RDLE9BQU8sWUFBWSxJQUFJLEtBQUssS0FBSyxJQUFJLElBQUksR0FBRyxLQUFLLElBQUksSUFBSSxLQUFLLEtBQUssR0FBRztRQUMvRCxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxHQUFHLENBQUM7QUFDeEMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgQ29tcG9uZW50LFxuICBFbGVtZW50UmVmLFxuICBFdmVudEVtaXR0ZXIsXG4gIElucHV0LFxuICBPdXRwdXQsXG4gIFZpZXdFbmNhcHN1bGF0aW9uLFxuICBOZ1pvbmUsXG4gIE9uQ2hhbmdlcyxcbiAgU2ltcGxlQ2hhbmdlcyxcbiAgT25EZXN0cm95LFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7dGFrZX0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG4vKiogRXh0cmEgQ1NTIGNsYXNzZXMgdGhhdCBjYW4gYmUgYXNzb2NpYXRlZCB3aXRoIGEgY2FsZW5kYXIgY2VsbC4gKi9cbmV4cG9ydCB0eXBlIE1hdENhbGVuZGFyQ2VsbENzc0NsYXNzZXMgPSBzdHJpbmcgfCBzdHJpbmdbXSB8IFNldDxzdHJpbmc+IHwge1trZXk6IHN0cmluZ106IGFueX07XG5cbi8qKiBGdW5jdGlvbiB0aGF0IGNhbiBnZW5lcmF0ZSB0aGUgZXh0cmEgY2xhc3NlcyB0aGF0IHNob3VsZCBiZSBhZGRlZCB0byBhIGNhbGVuZGFyIGNlbGwuICovXG5leHBvcnQgdHlwZSBNYXRDYWxlbmRhckNlbGxDbGFzc0Z1bmN0aW9uPEQ+ID1cbiAgICAoZGF0ZTogRCwgdmlldzogJ21vbnRoJyB8ICd5ZWFyJyB8ICdtdWx0aS15ZWFyJykgPT4gTWF0Q2FsZW5kYXJDZWxsQ3NzQ2xhc3NlcztcblxuLyoqXG4gKiBBbiBpbnRlcm5hbCBjbGFzcyB0aGF0IHJlcHJlc2VudHMgdGhlIGRhdGEgY29ycmVzcG9uZGluZyB0byBhIHNpbmdsZSBjYWxlbmRhciBjZWxsLlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5leHBvcnQgY2xhc3MgTWF0Q2FsZW5kYXJDZWxsPEQgPSBhbnk+IHtcbiAgY29uc3RydWN0b3IocHVibGljIHZhbHVlOiBudW1iZXIsXG4gICAgICAgICAgICAgIHB1YmxpYyBkaXNwbGF5VmFsdWU6IHN0cmluZyxcbiAgICAgICAgICAgICAgcHVibGljIGFyaWFMYWJlbDogc3RyaW5nLFxuICAgICAgICAgICAgICBwdWJsaWMgZW5hYmxlZDogYm9vbGVhbixcbiAgICAgICAgICAgICAgcHVibGljIGNzc0NsYXNzZXM6IE1hdENhbGVuZGFyQ2VsbENzc0NsYXNzZXMgPSB7fSxcbiAgICAgICAgICAgICAgcHVibGljIGNvbXBhcmVWYWx1ZSA9IHZhbHVlLFxuICAgICAgICAgICAgICBwdWJsaWMgcmF3VmFsdWU/OiBEKSB7fVxufVxuXG4vKiogRXZlbnQgZW1pdHRlZCB3aGVuIGEgZGF0ZSBpbnNpZGUgdGhlIGNhbGVuZGFyIGlzIHRyaWdnZXJlZCBhcyBhIHJlc3VsdCBvZiBhIHVzZXIgYWN0aW9uLiAqL1xuZXhwb3J0IGludGVyZmFjZSBNYXRDYWxlbmRhclVzZXJFdmVudDxEPiB7XG4gIHZhbHVlOiBEO1xuICBldmVudDogRXZlbnQ7XG59XG5cbi8qKlxuICogQW4gaW50ZXJuYWwgY29tcG9uZW50IHVzZWQgdG8gZGlzcGxheSBjYWxlbmRhciBkYXRhIGluIGEgdGFibGUuXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ1ttYXQtY2FsZW5kYXItYm9keV0nLFxuICB0ZW1wbGF0ZVVybDogJ2NhbGVuZGFyLWJvZHkuaHRtbCcsXG4gIHN0eWxlVXJsczogWydjYWxlbmRhci1ib2R5LmNzcyddLFxuICBob3N0OiB7XG4gICAgJ2NsYXNzJzogJ21hdC1jYWxlbmRhci1ib2R5JyxcbiAgICAncm9sZSc6ICdncmlkJyxcbiAgICAnYXJpYS1yZWFkb25seSc6ICd0cnVlJ1xuICB9LFxuICBleHBvcnRBczogJ21hdENhbGVuZGFyQm9keScsXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxufSlcbmV4cG9ydCBjbGFzcyBNYXRDYWxlbmRhckJvZHkgaW1wbGVtZW50cyBPbkNoYW5nZXMsIE9uRGVzdHJveSB7XG4gIC8qKlxuICAgKiBVc2VkIHRvIHNraXAgdGhlIG5leHQgZm9jdXMgZXZlbnQgd2hlbiByZW5kZXJpbmcgdGhlIHByZXZpZXcgcmFuZ2UuXG4gICAqIFdlIG5lZWQgYSBmbGFnIGxpa2UgdGhpcywgYmVjYXVzZSBzb21lIGJyb3dzZXJzIGZpcmUgZm9jdXMgZXZlbnRzIGFzeW5jaHJvbm91c2x5LlxuICAgKi9cbiAgcHJpdmF0ZSBfc2tpcE5leHRGb2N1czogYm9vbGVhbjtcblxuICAvKiogVGhlIGxhYmVsIGZvciB0aGUgdGFibGUuIChlLmcuIFwiSmFuIDIwMTdcIikuICovXG4gIEBJbnB1dCgpIGxhYmVsOiBzdHJpbmc7XG5cbiAgLyoqIFRoZSBjZWxscyB0byBkaXNwbGF5IGluIHRoZSB0YWJsZS4gKi9cbiAgQElucHV0KCkgcm93czogTWF0Q2FsZW5kYXJDZWxsW11bXTtcblxuICAvKiogVGhlIHZhbHVlIGluIHRoZSB0YWJsZSB0aGF0IGNvcnJlc3BvbmRzIHRvIHRvZGF5LiAqL1xuICBASW5wdXQoKSB0b2RheVZhbHVlOiBudW1iZXI7XG5cbiAgLyoqIFN0YXJ0IHZhbHVlIG9mIHRoZSBzZWxlY3RlZCBkYXRlIHJhbmdlLiAqL1xuICBASW5wdXQoKSBzdGFydFZhbHVlOiBudW1iZXI7XG5cbiAgLyoqIEVuZCB2YWx1ZSBvZiB0aGUgc2VsZWN0ZWQgZGF0ZSByYW5nZS4gKi9cbiAgQElucHV0KCkgZW5kVmFsdWU6IG51bWJlcjtcblxuICAvKiogVGhlIG1pbmltdW0gbnVtYmVyIG9mIGZyZWUgY2VsbHMgbmVlZGVkIHRvIGZpdCB0aGUgbGFiZWwgaW4gdGhlIGZpcnN0IHJvdy4gKi9cbiAgQElucHV0KCkgbGFiZWxNaW5SZXF1aXJlZENlbGxzOiBudW1iZXI7XG5cbiAgLyoqIFRoZSBudW1iZXIgb2YgY29sdW1ucyBpbiB0aGUgdGFibGUuICovXG4gIEBJbnB1dCgpIG51bUNvbHM6IG51bWJlciA9IDc7XG5cbiAgLyoqIFRoZSBjZWxsIG51bWJlciBvZiB0aGUgYWN0aXZlIGNlbGwgaW4gdGhlIHRhYmxlLiAqL1xuICBASW5wdXQoKSBhY3RpdmVDZWxsOiBudW1iZXIgPSAwO1xuXG4gIC8qKiBXaGV0aGVyIGEgcmFuZ2UgaXMgYmVpbmcgc2VsZWN0ZWQuICovXG4gIEBJbnB1dCgpIGlzUmFuZ2U6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAvKipcbiAgICogVGhlIGFzcGVjdCByYXRpbyAod2lkdGggLyBoZWlnaHQpIHRvIHVzZSBmb3IgdGhlIGNlbGxzIGluIHRoZSB0YWJsZS4gVGhpcyBhc3BlY3QgcmF0aW8gd2lsbCBiZVxuICAgKiBtYWludGFpbmVkIGV2ZW4gYXMgdGhlIHRhYmxlIHJlc2l6ZXMuXG4gICAqL1xuICBASW5wdXQoKSBjZWxsQXNwZWN0UmF0aW86IG51bWJlciA9IDE7XG5cbiAgLyoqIFN0YXJ0IG9mIHRoZSBjb21wYXJpc29uIHJhbmdlLiAqL1xuICBASW5wdXQoKSBjb21wYXJpc29uU3RhcnQ6IG51bWJlciB8IG51bGw7XG5cbiAgLyoqIEVuZCBvZiB0aGUgY29tcGFyaXNvbiByYW5nZS4gKi9cbiAgQElucHV0KCkgY29tcGFyaXNvbkVuZDogbnVtYmVyIHwgbnVsbDtcblxuICAvKiogU3RhcnQgb2YgdGhlIHByZXZpZXcgcmFuZ2UuICovXG4gIEBJbnB1dCgpIHByZXZpZXdTdGFydDogbnVtYmVyIHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqIEVuZCBvZiB0aGUgcHJldmlldyByYW5nZS4gKi9cbiAgQElucHV0KCkgcHJldmlld0VuZDogbnVtYmVyIHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqIEVtaXRzIHdoZW4gYSBuZXcgdmFsdWUgaXMgc2VsZWN0ZWQuICovXG4gIEBPdXRwdXQoKSByZWFkb25seSBzZWxlY3RlZFZhbHVlQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxNYXRDYWxlbmRhclVzZXJFdmVudDxudW1iZXI+PigpO1xuXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSBwcmV2aWV3IGhhcyBjaGFuZ2VkIGFzIGEgcmVzdWx0IG9mIGEgdXNlciBhY3Rpb24uICovXG4gIEBPdXRwdXQoKSByZWFkb25seSBwcmV2aWV3Q2hhbmdlID1cbiAgICBuZXcgRXZlbnRFbWl0dGVyPE1hdENhbGVuZGFyVXNlckV2ZW50PE1hdENhbGVuZGFyQ2VsbCB8IG51bGw+PigpO1xuXG4gIC8qKiBUaGUgbnVtYmVyIG9mIGJsYW5rIGNlbGxzIHRvIHB1dCBhdCB0aGUgYmVnaW5uaW5nIGZvciB0aGUgZmlyc3Qgcm93LiAqL1xuICBfZmlyc3RSb3dPZmZzZXQ6IG51bWJlcjtcblxuICAvKiogUGFkZGluZyBmb3IgdGhlIGluZGl2aWR1YWwgZGF0ZSBjZWxscy4gKi9cbiAgX2NlbGxQYWRkaW5nOiBzdHJpbmc7XG5cbiAgLyoqIFdpZHRoIG9mIGFuIGluZGl2aWR1YWwgY2VsbC4gKi9cbiAgX2NlbGxXaWR0aDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+LCBwcml2YXRlIF9uZ1pvbmU6IE5nWm9uZSkge1xuICAgIF9uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgY29uc3QgZWxlbWVudCA9IF9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7XG4gICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCB0aGlzLl9lbnRlckhhbmRsZXIsIHRydWUpO1xuICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsIHRoaXMuX2VudGVySGFuZGxlciwgdHJ1ZSk7XG4gICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCB0aGlzLl9sZWF2ZUhhbmRsZXIsIHRydWUpO1xuICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdibHVyJywgdGhpcy5fbGVhdmVIYW5kbGVyLCB0cnVlKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBDYWxsZWQgd2hlbiBhIGNlbGwgaXMgY2xpY2tlZC4gKi9cbiAgX2NlbGxDbGlja2VkKGNlbGw6IE1hdENhbGVuZGFyQ2VsbCwgZXZlbnQ6IE1vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICBpZiAoY2VsbC5lbmFibGVkKSB7XG4gICAgICB0aGlzLnNlbGVjdGVkVmFsdWVDaGFuZ2UuZW1pdCh7dmFsdWU6IGNlbGwudmFsdWUsIGV2ZW50fSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFJldHVybnMgd2hldGhlciBhIGNlbGwgc2hvdWxkIGJlIG1hcmtlZCBhcyBzZWxlY3RlZC4gKi9cbiAgX2lzU2VsZWN0ZWQodmFsdWU6IG51bWJlcikge1xuICAgIHJldHVybiB0aGlzLnN0YXJ0VmFsdWUgPT09IHZhbHVlIHx8IHRoaXMuZW5kVmFsdWUgPT09IHZhbHVlO1xuICB9XG5cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykge1xuICAgIGNvbnN0IGNvbHVtbkNoYW5nZXMgPSBjaGFuZ2VzWydudW1Db2xzJ107XG4gICAgY29uc3Qge3Jvd3MsIG51bUNvbHN9ID0gdGhpcztcblxuICAgIGlmIChjaGFuZ2VzWydyb3dzJ10gfHwgY29sdW1uQ2hhbmdlcykge1xuICAgICAgdGhpcy5fZmlyc3RSb3dPZmZzZXQgPSByb3dzICYmIHJvd3MubGVuZ3RoICYmIHJvd3NbMF0ubGVuZ3RoID8gbnVtQ29scyAtIHJvd3NbMF0ubGVuZ3RoIDogMDtcbiAgICB9XG5cbiAgICBpZiAoY2hhbmdlc1snY2VsbEFzcGVjdFJhdGlvJ10gfHwgY29sdW1uQ2hhbmdlcyB8fCAhdGhpcy5fY2VsbFBhZGRpbmcpIHtcbiAgICAgIHRoaXMuX2NlbGxQYWRkaW5nID0gYCR7NTAgKiB0aGlzLmNlbGxBc3BlY3RSYXRpbyAvIG51bUNvbHN9JWA7XG4gICAgfVxuXG4gICAgaWYgKGNvbHVtbkNoYW5nZXMgfHwgIXRoaXMuX2NlbGxXaWR0aCkge1xuICAgICAgdGhpcy5fY2VsbFdpZHRoID0gYCR7MTAwIC8gbnVtQ29sc30lYDtcbiAgICB9XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xuICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsIHRoaXMuX2VudGVySGFuZGxlciwgdHJ1ZSk7XG4gICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdmb2N1cycsIHRoaXMuX2VudGVySGFuZGxlciwgdHJ1ZSk7XG4gICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgdGhpcy5fbGVhdmVIYW5kbGVyLCB0cnVlKTtcbiAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2JsdXInLCB0aGlzLl9sZWF2ZUhhbmRsZXIsIHRydWUpO1xuICB9XG5cbiAgLyoqIFJldHVybnMgd2hldGhlciBhIGNlbGwgaXMgYWN0aXZlLiAqL1xuICBfaXNBY3RpdmVDZWxsKHJvd0luZGV4OiBudW1iZXIsIGNvbEluZGV4OiBudW1iZXIpOiBib29sZWFuIHtcbiAgICBsZXQgY2VsbE51bWJlciA9IHJvd0luZGV4ICogdGhpcy5udW1Db2xzICsgY29sSW5kZXg7XG5cbiAgICAvLyBBY2NvdW50IGZvciB0aGUgZmFjdCB0aGF0IHRoZSBmaXJzdCByb3cgbWF5IG5vdCBoYXZlIGFzIG1hbnkgY2VsbHMuXG4gICAgaWYgKHJvd0luZGV4KSB7XG4gICAgICBjZWxsTnVtYmVyIC09IHRoaXMuX2ZpcnN0Um93T2Zmc2V0O1xuICAgIH1cblxuICAgIHJldHVybiBjZWxsTnVtYmVyID09IHRoaXMuYWN0aXZlQ2VsbDtcbiAgfVxuXG4gIC8qKiBGb2N1c2VzIHRoZSBhY3RpdmUgY2VsbCBhZnRlciB0aGUgbWljcm90YXNrIHF1ZXVlIGlzIGVtcHR5LiAqL1xuICBfZm9jdXNBY3RpdmVDZWxsKG1vdmVQcmV2aWV3ID0gdHJ1ZSkge1xuICAgIHRoaXMuX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICB0aGlzLl9uZ1pvbmUub25TdGFibGUucGlwZSh0YWtlKDEpKS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICBjb25zdCBhY3RpdmVDZWxsOiBIVE1MRWxlbWVudCB8IG51bGwgPVxuICAgICAgICAgICAgdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tYXQtY2FsZW5kYXItYm9keS1hY3RpdmUnKTtcblxuICAgICAgICBpZiAoYWN0aXZlQ2VsbCkge1xuICAgICAgICAgIGlmICghbW92ZVByZXZpZXcpIHtcbiAgICAgICAgICAgIHRoaXMuX3NraXBOZXh0Rm9jdXMgPSB0cnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGFjdGl2ZUNlbGwuZm9jdXMoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKiogR2V0cyB3aGV0aGVyIGEgdmFsdWUgaXMgdGhlIHN0YXJ0IG9mIHRoZSBtYWluIHJhbmdlLiAqL1xuICBfaXNSYW5nZVN0YXJ0KHZhbHVlOiBudW1iZXIpIHtcbiAgICByZXR1cm4gaXNTdGFydCh2YWx1ZSwgdGhpcy5zdGFydFZhbHVlLCB0aGlzLmVuZFZhbHVlKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHdoZXRoZXIgYSB2YWx1ZSBpcyB0aGUgZW5kIG9mIHRoZSBtYWluIHJhbmdlLiAqL1xuICBfaXNSYW5nZUVuZCh2YWx1ZTogbnVtYmVyKSB7XG4gICAgcmV0dXJuIGlzRW5kKHZhbHVlLCB0aGlzLnN0YXJ0VmFsdWUsIHRoaXMuZW5kVmFsdWUpO1xuICB9XG5cbiAgLyoqIEdldHMgd2hldGhlciBhIHZhbHVlIGlzIHdpdGhpbiB0aGUgY3VycmVudGx5LXNlbGVjdGVkIHJhbmdlLiAqL1xuICBfaXNJblJhbmdlKHZhbHVlOiBudW1iZXIpOiBib29sZWFuIHtcbiAgICByZXR1cm4gaXNJblJhbmdlKHZhbHVlLCB0aGlzLnN0YXJ0VmFsdWUsIHRoaXMuZW5kVmFsdWUsIHRoaXMuaXNSYW5nZSk7XG4gIH1cblxuICAvKiogR2V0cyB3aGV0aGVyIGEgdmFsdWUgaXMgdGhlIHN0YXJ0IG9mIHRoZSBjb21wYXJpc29uIHJhbmdlLiAqL1xuICBfaXNDb21wYXJpc29uU3RhcnQodmFsdWU6IG51bWJlcikge1xuICAgIHJldHVybiBpc1N0YXJ0KHZhbHVlLCB0aGlzLmNvbXBhcmlzb25TdGFydCwgdGhpcy5jb21wYXJpc29uRW5kKTtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBjZWxsIGlzIGEgc3RhcnQgYnJpZGdlIGNlbGwgYmV0d2VlbiB0aGUgbWFpbiBhbmQgY29tcGFyaXNvbiByYW5nZXMuICovXG4gIF9pc0NvbXBhcmlzb25CcmlkZ2VTdGFydCh2YWx1ZTogbnVtYmVyLCByb3dJbmRleDogbnVtYmVyLCBjb2xJbmRleDogbnVtYmVyKSB7XG4gICAgaWYgKCF0aGlzLl9pc0NvbXBhcmlzb25TdGFydCh2YWx1ZSkgfHwgdGhpcy5faXNSYW5nZVN0YXJ0KHZhbHVlKSB8fCAhdGhpcy5faXNJblJhbmdlKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGxldCBwcmV2aW91c0NlbGw6IE1hdENhbGVuZGFyQ2VsbCB8IHVuZGVmaW5lZCA9IHRoaXMucm93c1tyb3dJbmRleF1bY29sSW5kZXggLSAxXTtcblxuICAgIGlmICghcHJldmlvdXNDZWxsKSB7XG4gICAgICBjb25zdCBwcmV2aW91c1JvdyA9IHRoaXMucm93c1tyb3dJbmRleCAtIDFdO1xuICAgICAgcHJldmlvdXNDZWxsID0gcHJldmlvdXNSb3cgJiYgcHJldmlvdXNSb3dbcHJldmlvdXNSb3cubGVuZ3RoIC0gMV07XG4gICAgfVxuXG4gICAgcmV0dXJuIHByZXZpb3VzQ2VsbCAmJiAhdGhpcy5faXNSYW5nZUVuZChwcmV2aW91c0NlbGwuY29tcGFyZVZhbHVlKTtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBjZWxsIGlzIGFuIGVuZCBicmlkZ2UgY2VsbCBiZXR3ZWVuIHRoZSBtYWluIGFuZCBjb21wYXJpc29uIHJhbmdlcy4gKi9cbiAgX2lzQ29tcGFyaXNvbkJyaWRnZUVuZCh2YWx1ZTogbnVtYmVyLCByb3dJbmRleDogbnVtYmVyLCBjb2xJbmRleDogbnVtYmVyKSB7XG4gICAgaWYgKCF0aGlzLl9pc0NvbXBhcmlzb25FbmQodmFsdWUpIHx8IHRoaXMuX2lzUmFuZ2VFbmQodmFsdWUpIHx8ICF0aGlzLl9pc0luUmFuZ2UodmFsdWUpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgbGV0IG5leHRDZWxsOiBNYXRDYWxlbmRhckNlbGwgfCB1bmRlZmluZWQgPSB0aGlzLnJvd3Nbcm93SW5kZXhdW2NvbEluZGV4ICsgMV07XG5cbiAgICBpZiAoIW5leHRDZWxsKSB7XG4gICAgICBjb25zdCBuZXh0Um93ID0gdGhpcy5yb3dzW3Jvd0luZGV4ICsgMV07XG4gICAgICBuZXh0Q2VsbCA9IG5leHRSb3cgJiYgbmV4dFJvd1swXTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV4dENlbGwgJiYgIXRoaXMuX2lzUmFuZ2VTdGFydChuZXh0Q2VsbC5jb21wYXJlVmFsdWUpO1xuICB9XG5cbiAgLyoqIEdldHMgd2hldGhlciBhIHZhbHVlIGlzIHRoZSBlbmQgb2YgdGhlIGNvbXBhcmlzb24gcmFuZ2UuICovXG4gIF9pc0NvbXBhcmlzb25FbmQodmFsdWU6IG51bWJlcikge1xuICAgIHJldHVybiBpc0VuZCh2YWx1ZSwgdGhpcy5jb21wYXJpc29uU3RhcnQsIHRoaXMuY29tcGFyaXNvbkVuZCk7XG4gIH1cblxuICAvKiogR2V0cyB3aGV0aGVyIGEgdmFsdWUgaXMgd2l0aGluIHRoZSBjdXJyZW50IGNvbXBhcmlzb24gcmFuZ2UuICovXG4gIF9pc0luQ29tcGFyaXNvblJhbmdlKHZhbHVlOiBudW1iZXIpIHtcbiAgICByZXR1cm4gaXNJblJhbmdlKHZhbHVlLCB0aGlzLmNvbXBhcmlzb25TdGFydCwgdGhpcy5jb21wYXJpc29uRW5kLCB0aGlzLmlzUmFuZ2UpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgd2hldGhlciBhIHZhbHVlIGlzIHRoZSBzYW1lIGFzIHRoZSBzdGFydCBhbmQgZW5kIG9mIHRoZSBjb21wYXJpc29uIHJhbmdlLlxuICAgKiBGb3IgY29udGV4dCwgdGhlIGZ1bmN0aW9ucyB0aGF0IHdlIHVzZSB0byBkZXRlcm1pbmUgd2hldGhlciBzb21ldGhpbmcgaXMgdGhlIHN0YXJ0L2VuZCBvZlxuICAgKiBhIHJhbmdlIGRvbid0IGFsbG93IGZvciB0aGUgc3RhcnQgYW5kIGVuZCB0byBiZSBvbiB0aGUgc2FtZSBkYXksIGJlY2F1c2Ugd2UnZCBoYXZlIHRvIHVzZVxuICAgKiBtdWNoIG1vcmUgc3BlY2lmaWMgQ1NTIHNlbGVjdG9ycyB0byBzdHlsZSB0aGVtIGNvcnJlY3RseSBpbiBhbGwgc2NlbmFyaW9zLiBUaGlzIGlzIGZpbmUgZm9yXG4gICAqIHRoZSByZWd1bGFyIHJhbmdlLCBiZWNhdXNlIHdoZW4gaXQgaGFwcGVucywgdGhlIHNlbGVjdGVkIHN0eWxlcyB0YWtlIG92ZXIgYW5kIHN0aWxsIHNob3cgd2hlcmVcbiAgICogdGhlIHJhbmdlIHdvdWxkJ3ZlIGJlZW4sIGhvd2V2ZXIgd2UgZG9uJ3QgaGF2ZSB0aGVzZSBzZWxlY3RlZCBzdHlsZXMgZm9yIGEgY29tcGFyaXNvbiByYW5nZS5cbiAgICogVGhpcyBmdW5jdGlvbiBpcyB1c2VkIHRvIGFwcGx5IGEgY2xhc3MgdGhhdCBzZXJ2ZXMgdGhlIHNhbWUgcHVycG9zZSBhcyB0aGUgb25lIGZvciBzZWxlY3RlZFxuICAgKiBkYXRlcywgYnV0IGl0IG9ubHkgYXBwbGllcyBpbiB0aGUgY29udGV4dCBvZiBhIGNvbXBhcmlzb24gcmFuZ2UuXG4gICAqL1xuICBfaXNDb21wYXJpc29uSWRlbnRpY2FsKHZhbHVlOiBudW1iZXIpIHtcbiAgICAvLyBOb3RlIHRoYXQgd2UgZG9uJ3QgbmVlZCB0byBudWxsIGNoZWNrIHRoZSBzdGFydC9lbmRcbiAgICAvLyBoZXJlLCBiZWNhdXNlIHRoZSBgdmFsdWVgIHdpbGwgYWx3YXlzIGJlIGRlZmluZWQuXG4gICAgcmV0dXJuIHRoaXMuY29tcGFyaXNvblN0YXJ0ID09PSB0aGlzLmNvbXBhcmlzb25FbmQgJiYgdmFsdWUgPT09IHRoaXMuY29tcGFyaXNvblN0YXJ0O1xuICB9XG5cbiAgLyoqIEdldHMgd2hldGhlciBhIHZhbHVlIGlzIHRoZSBzdGFydCBvZiB0aGUgcHJldmlldyByYW5nZS4gKi9cbiAgX2lzUHJldmlld1N0YXJ0KHZhbHVlOiBudW1iZXIpIHtcbiAgICByZXR1cm4gaXNTdGFydCh2YWx1ZSwgdGhpcy5wcmV2aWV3U3RhcnQsIHRoaXMucHJldmlld0VuZCk7XG4gIH1cblxuICAvKiogR2V0cyB3aGV0aGVyIGEgdmFsdWUgaXMgdGhlIGVuZCBvZiB0aGUgcHJldmlldyByYW5nZS4gKi9cbiAgX2lzUHJldmlld0VuZCh2YWx1ZTogbnVtYmVyKSB7XG4gICAgcmV0dXJuIGlzRW5kKHZhbHVlLCB0aGlzLnByZXZpZXdTdGFydCwgdGhpcy5wcmV2aWV3RW5kKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHdoZXRoZXIgYSB2YWx1ZSBpcyBpbnNpZGUgdGhlIHByZXZpZXcgcmFuZ2UuICovXG4gIF9pc0luUHJldmlldyh2YWx1ZTogbnVtYmVyKSB7XG4gICAgcmV0dXJuIGlzSW5SYW5nZSh2YWx1ZSwgdGhpcy5wcmV2aWV3U3RhcnQsIHRoaXMucHJldmlld0VuZCwgdGhpcy5pc1JhbmdlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFdmVudCBoYW5kbGVyIGZvciB3aGVuIHRoZSB1c2VyIGVudGVycyBhbiBlbGVtZW50XG4gICAqIGluc2lkZSB0aGUgY2FsZW5kYXIgYm9keSAoZS5nLiBieSBob3ZlcmluZyBpbiBvciBmb2N1cykuXG4gICAqL1xuICBwcml2YXRlIF9lbnRlckhhbmRsZXIgPSAoZXZlbnQ6IEV2ZW50KSA9PiB7XG4gICAgaWYgKHRoaXMuX3NraXBOZXh0Rm9jdXMgJiYgZXZlbnQudHlwZSA9PT0gJ2ZvY3VzJykge1xuICAgICAgdGhpcy5fc2tpcE5leHRGb2N1cyA9IGZhbHNlO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFdlIG9ubHkgbmVlZCB0byBoaXQgdGhlIHpvbmUgd2hlbiB3ZSdyZSBzZWxlY3RpbmcgYSByYW5nZS5cbiAgICBpZiAoZXZlbnQudGFyZ2V0ICYmIHRoaXMuaXNSYW5nZSkge1xuICAgICAgY29uc3QgY2VsbCA9IHRoaXMuX2dldENlbGxGcm9tRWxlbWVudChldmVudC50YXJnZXQgYXMgSFRNTEVsZW1lbnQpO1xuXG4gICAgICBpZiAoY2VsbCkge1xuICAgICAgICB0aGlzLl9uZ1pvbmUucnVuKCgpID0+IHRoaXMucHJldmlld0NoYW5nZS5lbWl0KHt2YWx1ZTogY2VsbC5lbmFibGVkID8gY2VsbCA6IG51bGwsIGV2ZW50fSkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBFdmVudCBoYW5kbGVyIGZvciB3aGVuIHRoZSB1c2VyJ3MgcG9pbnRlciBsZWF2ZXMgYW4gZWxlbWVudFxuICAgKiBpbnNpZGUgdGhlIGNhbGVuZGFyIGJvZHkgKGUuZy4gYnkgaG92ZXJpbmcgb3V0IG9yIGJsdXJyaW5nKS5cbiAgICovXG4gIHByaXZhdGUgX2xlYXZlSGFuZGxlciA9IChldmVudDogRXZlbnQpID0+IHtcbiAgICAvLyBXZSBvbmx5IG5lZWQgdG8gaGl0IHRoZSB6b25lIHdoZW4gd2UncmUgc2VsZWN0aW5nIGEgcmFuZ2UuXG4gICAgaWYgKHRoaXMucHJldmlld0VuZCAhPT0gbnVsbCAmJiB0aGlzLmlzUmFuZ2UpIHtcbiAgICAgIC8vIE9ubHkgcmVzZXQgdGhlIHByZXZpZXcgZW5kIHZhbHVlIHdoZW4gbGVhdmluZyBjZWxscy4gVGhpcyBsb29rcyBiZXR0ZXIsIGJlY2F1c2VcbiAgICAgIC8vIHdlIGhhdmUgYSBnYXAgYmV0d2VlbiB0aGUgY2VsbHMgYW5kIHRoZSByb3dzIGFuZCB3ZSBkb24ndCB3YW50IHRvIHJlbW92ZSB0aGVcbiAgICAgIC8vIHJhbmdlIGp1c3QgZm9yIGl0IHRvIHNob3cgdXAgYWdhaW4gd2hlbiB0aGUgdXNlciBtb3ZlcyBhIGZldyBwaXhlbHMgdG8gdGhlIHNpZGUuXG4gICAgICBpZiAoZXZlbnQudGFyZ2V0ICYmIGlzVGFibGVDZWxsKGV2ZW50LnRhcmdldCBhcyBIVE1MRWxlbWVudCkpIHtcbiAgICAgICAgdGhpcy5fbmdab25lLnJ1bigoKSA9PiB0aGlzLnByZXZpZXdDaGFuZ2UuZW1pdCh7dmFsdWU6IG51bGwsIGV2ZW50fSkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBGaW5kcyB0aGUgTWF0Q2FsZW5kYXJDZWxsIHRoYXQgY29ycmVzcG9uZHMgdG8gYSBET00gbm9kZS4gKi9cbiAgcHJpdmF0ZSBfZ2V0Q2VsbEZyb21FbGVtZW50KGVsZW1lbnQ6IEhUTUxFbGVtZW50KTogTWF0Q2FsZW5kYXJDZWxsIHwgbnVsbCB7XG4gICAgbGV0IGNlbGw6IEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkO1xuXG4gICAgaWYgKGlzVGFibGVDZWxsKGVsZW1lbnQpKSB7XG4gICAgICBjZWxsID0gZWxlbWVudDtcbiAgICB9IGVsc2UgaWYgKGlzVGFibGVDZWxsKGVsZW1lbnQucGFyZW50Tm9kZSEpKSB7XG4gICAgICBjZWxsID0gZWxlbWVudC5wYXJlbnROb2RlIGFzIEhUTUxFbGVtZW50O1xuICAgIH1cblxuICAgIGlmIChjZWxsKSB7XG4gICAgICBjb25zdCByb3cgPSBjZWxsLmdldEF0dHJpYnV0ZSgnZGF0YS1tYXQtcm93Jyk7XG4gICAgICBjb25zdCBjb2wgPSBjZWxsLmdldEF0dHJpYnV0ZSgnZGF0YS1tYXQtY29sJyk7XG5cbiAgICAgIGlmIChyb3cgJiYgY29sKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJvd3NbcGFyc2VJbnQocm93KV1bcGFyc2VJbnQoY29sKV07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxufVxuXG4vKiogQ2hlY2tzIHdoZXRoZXIgYSBub2RlIGlzIGEgdGFibGUgY2VsbCBlbGVtZW50LiAqL1xuZnVuY3Rpb24gaXNUYWJsZUNlbGwobm9kZTogTm9kZSk6IG5vZGUgaXMgSFRNTFRhYmxlQ2VsbEVsZW1lbnQge1xuICByZXR1cm4gbm9kZS5ub2RlTmFtZSA9PT0gJ1REJztcbn1cblxuLyoqIENoZWNrcyB3aGV0aGVyIGEgdmFsdWUgaXMgdGhlIHN0YXJ0IG9mIGEgcmFuZ2UuICovXG5mdW5jdGlvbiBpc1N0YXJ0KHZhbHVlOiBudW1iZXIsIHN0YXJ0OiBudW1iZXIgfCBudWxsLCBlbmQ6IG51bWJlciB8IG51bGwpOiBib29sZWFuIHtcbiAgcmV0dXJuIGVuZCAhPT0gbnVsbCAmJiBzdGFydCAhPT0gZW5kICYmIHZhbHVlIDwgZW5kICYmIHZhbHVlID09PSBzdGFydDtcbn1cblxuLyoqIENoZWNrcyB3aGV0aGVyIGEgdmFsdWUgaXMgdGhlIGVuZCBvZiBhIHJhbmdlLiAqL1xuZnVuY3Rpb24gaXNFbmQodmFsdWU6IG51bWJlciwgc3RhcnQ6IG51bWJlciB8IG51bGwsIGVuZDogbnVtYmVyIHwgbnVsbCk6IGJvb2xlYW4ge1xuICByZXR1cm4gc3RhcnQgIT09IG51bGwgJiYgc3RhcnQgIT09IGVuZCAmJiB2YWx1ZSA+PSBzdGFydCAmJiB2YWx1ZSA9PT0gZW5kO1xufVxuXG4vKiogQ2hlY2tzIHdoZXRoZXIgYSB2YWx1ZSBpcyBpbnNpZGUgb2YgYSByYW5nZS4gKi9cbmZ1bmN0aW9uIGlzSW5SYW5nZSh2YWx1ZTogbnVtYmVyLFxuICAgICAgICAgICAgICAgICAgIHN0YXJ0OiBudW1iZXIgfCBudWxsLFxuICAgICAgICAgICAgICAgICAgIGVuZDogbnVtYmVyIHwgbnVsbCxcbiAgICAgICAgICAgICAgICAgICByYW5nZUVuYWJsZWQ6IGJvb2xlYW4pOiBib29sZWFuIHtcbiAgcmV0dXJuIHJhbmdlRW5hYmxlZCAmJiBzdGFydCAhPT0gbnVsbCAmJiBlbmQgIT09IG51bGwgJiYgc3RhcnQgIT09IGVuZCAmJlxuICAgICAgICAgdmFsdWUgPj0gc3RhcnQgJiYgdmFsdWUgPD0gZW5kO1xufVxuIl19