(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/cdk/a11y'), require('@angular/cdk/overlay'), require('@angular/cdk/portal'), require('@angular/common'), require('@angular/core'), require('@angular/material/button'), require('@angular/cdk/scrolling'), require('@angular/material/core'), require('rxjs'), require('@angular/cdk/keycodes'), require('@angular/cdk/bidi'), require('rxjs/operators'), require('@angular/cdk/coercion'), require('@angular/cdk/platform'), require('@angular/animations'), require('@angular/forms'), require('@angular/material/form-field'), require('@angular/material/input')) :
    typeof define === 'function' && define.amd ? define('@angular/material/datepicker', ['exports', '@angular/cdk/a11y', '@angular/cdk/overlay', '@angular/cdk/portal', '@angular/common', '@angular/core', '@angular/material/button', '@angular/cdk/scrolling', '@angular/material/core', 'rxjs', '@angular/cdk/keycodes', '@angular/cdk/bidi', 'rxjs/operators', '@angular/cdk/coercion', '@angular/cdk/platform', '@angular/animations', '@angular/forms', '@angular/material/form-field', '@angular/material/input'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.ng = global.ng || {}, global.ng.material = global.ng.material || {}, global.ng.material.datepicker = {}), global.ng.cdk.a11y, global.ng.cdk.overlay, global.ng.cdk.portal, global.ng.common, global.ng.core, global.ng.material.button, global.ng.cdk.scrolling, global.ng.material.core, global.rxjs, global.ng.cdk.keycodes, global.ng.cdk.bidi, global.rxjs.operators, global.ng.cdk.coercion, global.ng.cdk.platform, global.ng.animations, global.ng.forms, global.ng.material.formField, global.ng.material.input));
}(this, (function (exports, a11y, overlay, portal, common, i0, button, scrolling, core, rxjs, keycodes, bidi, operators, coercion, platform, animations, forms, formField, input) { 'use strict';

    function _interopNamespace(e) {
        if (e && e.__esModule) return e;
        var n = Object.create(null);
        if (e) {
            Object.keys(e).forEach(function (k) {
                if (k !== 'default') {
                    var d = Object.getOwnPropertyDescriptor(e, k);
                    Object.defineProperty(n, k, d.get ? d : {
                        enumerable: true,
                        get: function () {
                            return e[k];
                        }
                    });
                }
            });
        }
        n['default'] = e;
        return Object.freeze(n);
    }

    var i0__namespace = /*#__PURE__*/_interopNamespace(i0);

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /** @docs-private */
    function createMissingDateImplError(provider) {
        return Error("MatDatepicker: No provider found for " + provider + ". You must import one of the following " +
            "modules at your application root: MatNativeDateModule, MatMomentDateModule, or provide a " +
            "custom implementation.");
    }

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /** Datepicker data that requires internationalization. */
    var MatDatepickerIntl = /** @class */ (function () {
        function MatDatepickerIntl() {
            /**
             * Stream that emits whenever the labels here are changed. Use this to notify
             * components if the labels have changed after initialization.
             */
            this.changes = new rxjs.Subject();
            /** A label for the calendar popup (used by screen readers). */
            this.calendarLabel = 'Calendar';
            /** A label for the button used to open the calendar popup (used by screen readers). */
            this.openCalendarLabel = 'Open calendar';
            /** Label for the button used to close the calendar popup. */
            this.closeCalendarLabel = 'Close calendar';
            /** A label for the previous month button (used by screen readers). */
            this.prevMonthLabel = 'Previous month';
            /** A label for the next month button (used by screen readers). */
            this.nextMonthLabel = 'Next month';
            /** A label for the previous year button (used by screen readers). */
            this.prevYearLabel = 'Previous year';
            /** A label for the next year button (used by screen readers). */
            this.nextYearLabel = 'Next year';
            /** A label for the previous multi-year button (used by screen readers). */
            this.prevMultiYearLabel = 'Previous 24 years';
            /** A label for the next multi-year button (used by screen readers). */
            this.nextMultiYearLabel = 'Next 24 years';
            /** A label for the 'switch to month view' button (used by screen readers). */
            this.switchToMonthViewLabel = 'Choose date';
            /** A label for the 'switch to year view' button (used by screen readers). */
            this.switchToMultiYearViewLabel = 'Choose month and year';
        }
        /** Formats a range of years. */
        MatDatepickerIntl.prototype.formatYearRange = function (start, end) {
            return start + " \u2013 " + end;
        };
        return MatDatepickerIntl;
    }());
    MatDatepickerIntl.ɵprov = i0__namespace.ɵɵdefineInjectable({ factory: function MatDatepickerIntl_Factory() { return new MatDatepickerIntl(); }, token: MatDatepickerIntl, providedIn: "root" });
    MatDatepickerIntl.decorators = [
        { type: i0.Injectable, args: [{ providedIn: 'root' },] }
    ];

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /**
     * An internal class that represents the data corresponding to a single calendar cell.
     * @docs-private
     */
    var MatCalendarCell = /** @class */ (function () {
        function MatCalendarCell(value, displayValue, ariaLabel, enabled, cssClasses, compareValue, rawValue) {
            if (cssClasses === void 0) { cssClasses = {}; }
            if (compareValue === void 0) { compareValue = value; }
            this.value = value;
            this.displayValue = displayValue;
            this.ariaLabel = ariaLabel;
            this.enabled = enabled;
            this.cssClasses = cssClasses;
            this.compareValue = compareValue;
            this.rawValue = rawValue;
        }
        return MatCalendarCell;
    }());
    /**
     * An internal component used to display calendar data in a table.
     * @docs-private
     */
    var MatCalendarBody = /** @class */ (function () {
        function MatCalendarBody(_elementRef, _ngZone) {
            var _this = this;
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
            this.selectedValueChange = new i0.EventEmitter();
            /** Emits when the preview has changed as a result of a user action. */
            this.previewChange = new i0.EventEmitter();
            /**
             * Event handler for when the user enters an element
             * inside the calendar body (e.g. by hovering in or focus).
             */
            this._enterHandler = function (event) {
                if (_this._skipNextFocus && event.type === 'focus') {
                    _this._skipNextFocus = false;
                    return;
                }
                // We only need to hit the zone when we're selecting a range.
                if (event.target && _this.isRange) {
                    var cell_1 = _this._getCellFromElement(event.target);
                    if (cell_1) {
                        _this._ngZone.run(function () { return _this.previewChange.emit({ value: cell_1.enabled ? cell_1 : null, event: event }); });
                    }
                }
            };
            /**
             * Event handler for when the user's pointer leaves an element
             * inside the calendar body (e.g. by hovering out or blurring).
             */
            this._leaveHandler = function (event) {
                // We only need to hit the zone when we're selecting a range.
                if (_this.previewEnd !== null && _this.isRange) {
                    // Only reset the preview end value when leaving cells. This looks better, because
                    // we have a gap between the cells and the rows and we don't want to remove the
                    // range just for it to show up again when the user moves a few pixels to the side.
                    if (event.target && isTableCell(event.target)) {
                        _this._ngZone.run(function () { return _this.previewChange.emit({ value: null, event: event }); });
                    }
                }
            };
            _ngZone.runOutsideAngular(function () {
                var element = _elementRef.nativeElement;
                element.addEventListener('mouseenter', _this._enterHandler, true);
                element.addEventListener('focus', _this._enterHandler, true);
                element.addEventListener('mouseleave', _this._leaveHandler, true);
                element.addEventListener('blur', _this._leaveHandler, true);
            });
        }
        /** Called when a cell is clicked. */
        MatCalendarBody.prototype._cellClicked = function (cell, event) {
            if (cell.enabled) {
                this.selectedValueChange.emit({ value: cell.value, event: event });
            }
        };
        /** Returns whether a cell should be marked as selected. */
        MatCalendarBody.prototype._isSelected = function (value) {
            return this.startValue === value || this.endValue === value;
        };
        MatCalendarBody.prototype.ngOnChanges = function (changes) {
            var columnChanges = changes['numCols'];
            var _a = this, rows = _a.rows, numCols = _a.numCols;
            if (changes['rows'] || columnChanges) {
                this._firstRowOffset = rows && rows.length && rows[0].length ? numCols - rows[0].length : 0;
            }
            if (changes['cellAspectRatio'] || columnChanges || !this._cellPadding) {
                this._cellPadding = 50 * this.cellAspectRatio / numCols + "%";
            }
            if (columnChanges || !this._cellWidth) {
                this._cellWidth = 100 / numCols + "%";
            }
        };
        MatCalendarBody.prototype.ngOnDestroy = function () {
            var element = this._elementRef.nativeElement;
            element.removeEventListener('mouseenter', this._enterHandler, true);
            element.removeEventListener('focus', this._enterHandler, true);
            element.removeEventListener('mouseleave', this._leaveHandler, true);
            element.removeEventListener('blur', this._leaveHandler, true);
        };
        /** Returns whether a cell is active. */
        MatCalendarBody.prototype._isActiveCell = function (rowIndex, colIndex) {
            var cellNumber = rowIndex * this.numCols + colIndex;
            // Account for the fact that the first row may not have as many cells.
            if (rowIndex) {
                cellNumber -= this._firstRowOffset;
            }
            return cellNumber == this.activeCell;
        };
        /** Focuses the active cell after the microtask queue is empty. */
        MatCalendarBody.prototype._focusActiveCell = function (movePreview) {
            var _this = this;
            if (movePreview === void 0) { movePreview = true; }
            this._ngZone.runOutsideAngular(function () {
                _this._ngZone.onStable.pipe(operators.take(1)).subscribe(function () {
                    var activeCell = _this._elementRef.nativeElement.querySelector('.mat-calendar-body-active');
                    if (activeCell) {
                        if (!movePreview) {
                            _this._skipNextFocus = true;
                        }
                        activeCell.focus();
                    }
                });
            });
        };
        /** Gets whether a value is the start of the main range. */
        MatCalendarBody.prototype._isRangeStart = function (value) {
            return isStart(value, this.startValue, this.endValue);
        };
        /** Gets whether a value is the end of the main range. */
        MatCalendarBody.prototype._isRangeEnd = function (value) {
            return isEnd(value, this.startValue, this.endValue);
        };
        /** Gets whether a value is within the currently-selected range. */
        MatCalendarBody.prototype._isInRange = function (value) {
            return isInRange(value, this.startValue, this.endValue, this.isRange);
        };
        /** Gets whether a value is the start of the comparison range. */
        MatCalendarBody.prototype._isComparisonStart = function (value) {
            return isStart(value, this.comparisonStart, this.comparisonEnd);
        };
        /** Whether the cell is a start bridge cell between the main and comparison ranges. */
        MatCalendarBody.prototype._isComparisonBridgeStart = function (value, rowIndex, colIndex) {
            if (!this._isComparisonStart(value) || this._isRangeStart(value) || !this._isInRange(value)) {
                return false;
            }
            var previousCell = this.rows[rowIndex][colIndex - 1];
            if (!previousCell) {
                var previousRow = this.rows[rowIndex - 1];
                previousCell = previousRow && previousRow[previousRow.length - 1];
            }
            return previousCell && !this._isRangeEnd(previousCell.compareValue);
        };
        /** Whether the cell is an end bridge cell between the main and comparison ranges. */
        MatCalendarBody.prototype._isComparisonBridgeEnd = function (value, rowIndex, colIndex) {
            if (!this._isComparisonEnd(value) || this._isRangeEnd(value) || !this._isInRange(value)) {
                return false;
            }
            var nextCell = this.rows[rowIndex][colIndex + 1];
            if (!nextCell) {
                var nextRow = this.rows[rowIndex + 1];
                nextCell = nextRow && nextRow[0];
            }
            return nextCell && !this._isRangeStart(nextCell.compareValue);
        };
        /** Gets whether a value is the end of the comparison range. */
        MatCalendarBody.prototype._isComparisonEnd = function (value) {
            return isEnd(value, this.comparisonStart, this.comparisonEnd);
        };
        /** Gets whether a value is within the current comparison range. */
        MatCalendarBody.prototype._isInComparisonRange = function (value) {
            return isInRange(value, this.comparisonStart, this.comparisonEnd, this.isRange);
        };
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
        MatCalendarBody.prototype._isComparisonIdentical = function (value) {
            // Note that we don't need to null check the start/end
            // here, because the `value` will always be defined.
            return this.comparisonStart === this.comparisonEnd && value === this.comparisonStart;
        };
        /** Gets whether a value is the start of the preview range. */
        MatCalendarBody.prototype._isPreviewStart = function (value) {
            return isStart(value, this.previewStart, this.previewEnd);
        };
        /** Gets whether a value is the end of the preview range. */
        MatCalendarBody.prototype._isPreviewEnd = function (value) {
            return isEnd(value, this.previewStart, this.previewEnd);
        };
        /** Gets whether a value is inside the preview range. */
        MatCalendarBody.prototype._isInPreview = function (value) {
            return isInRange(value, this.previewStart, this.previewEnd, this.isRange);
        };
        /** Finds the MatCalendarCell that corresponds to a DOM node. */
        MatCalendarBody.prototype._getCellFromElement = function (element) {
            var cell;
            if (isTableCell(element)) {
                cell = element;
            }
            else if (isTableCell(element.parentNode)) {
                cell = element.parentNode;
            }
            if (cell) {
                var row = cell.getAttribute('data-mat-row');
                var col = cell.getAttribute('data-mat-col');
                if (row && col) {
                    return this.rows[parseInt(row)][parseInt(col)];
                }
            }
            return null;
        };
        return MatCalendarBody;
    }());
    MatCalendarBody.decorators = [
        { type: i0.Component, args: [{
                    selector: '[mat-calendar-body]',
                    template: "<!--\n  If there's not enough space in the first row, create a separate label row. We mark this row as\n  aria-hidden because we don't want it to be read out as one of the weeks in the month.\n-->\n<tr *ngIf=\"_firstRowOffset < labelMinRequiredCells\" aria-hidden=\"true\">\n  <td class=\"mat-calendar-body-label\"\n      [attr.colspan]=\"numCols\"\n      [style.paddingTop]=\"_cellPadding\"\n      [style.paddingBottom]=\"_cellPadding\">\n    {{label}}\n  </td>\n</tr>\n\n<!-- Create the first row separately so we can include a special spacer cell. -->\n<tr *ngFor=\"let row of rows; let rowIndex = index\" role=\"row\">\n  <!--\n    We mark this cell as aria-hidden so it doesn't get read out as one of the days in the week.\n    The aspect ratio of the table cells is maintained by setting the top and bottom padding as a\n    percentage of the width (a variant of the trick described here:\n    https://www.w3schools.com/howto/howto_css_aspect_ratio.asp).\n  -->\n  <td *ngIf=\"rowIndex === 0 && _firstRowOffset\"\n      aria-hidden=\"true\"\n      class=\"mat-calendar-body-label\"\n      [attr.colspan]=\"_firstRowOffset\"\n      [style.paddingTop]=\"_cellPadding\"\n      [style.paddingBottom]=\"_cellPadding\">\n    {{_firstRowOffset >= labelMinRequiredCells ? label : ''}}\n  </td>\n  <td *ngFor=\"let item of row; let colIndex = index\"\n      role=\"gridcell\"\n      class=\"mat-calendar-body-cell\"\n      [ngClass]=\"item.cssClasses\"\n      [tabindex]=\"_isActiveCell(rowIndex, colIndex) ? 0 : -1\"\n      [attr.data-mat-row]=\"rowIndex\"\n      [attr.data-mat-col]=\"colIndex\"\n      [class.mat-calendar-body-disabled]=\"!item.enabled\"\n      [class.mat-calendar-body-active]=\"_isActiveCell(rowIndex, colIndex)\"\n      [class.mat-calendar-body-range-start]=\"_isRangeStart(item.compareValue)\"\n      [class.mat-calendar-body-range-end]=\"_isRangeEnd(item.compareValue)\"\n      [class.mat-calendar-body-in-range]=\"_isInRange(item.compareValue)\"\n      [class.mat-calendar-body-comparison-bridge-start]=\"_isComparisonBridgeStart(item.compareValue, rowIndex, colIndex)\"\n      [class.mat-calendar-body-comparison-bridge-end]=\"_isComparisonBridgeEnd(item.compareValue, rowIndex, colIndex)\"\n      [class.mat-calendar-body-comparison-start]=\"_isComparisonStart(item.compareValue)\"\n      [class.mat-calendar-body-comparison-end]=\"_isComparisonEnd(item.compareValue)\"\n      [class.mat-calendar-body-in-comparison-range]=\"_isInComparisonRange(item.compareValue)\"\n      [class.mat-calendar-body-preview-start]=\"_isPreviewStart(item.compareValue)\"\n      [class.mat-calendar-body-preview-end]=\"_isPreviewEnd(item.compareValue)\"\n      [class.mat-calendar-body-in-preview]=\"_isInPreview(item.compareValue)\"\n      [attr.aria-label]=\"item.ariaLabel\"\n      [attr.aria-disabled]=\"!item.enabled || null\"\n      [attr.aria-selected]=\"_isSelected(item.compareValue)\"\n      (click)=\"_cellClicked(item, $event)\"\n      [style.width]=\"_cellWidth\"\n      [style.paddingTop]=\"_cellPadding\"\n      [style.paddingBottom]=\"_cellPadding\">\n      <div class=\"mat-calendar-body-cell-content mat-focus-indicator\"\n        [class.mat-calendar-body-selected]=\"_isSelected(item.compareValue)\"\n        [class.mat-calendar-body-comparison-identical]=\"_isComparisonIdentical(item.compareValue)\"\n        [class.mat-calendar-body-today]=\"todayValue === item.compareValue\">\n        {{item.displayValue}}\n      </div>\n      <div class=\"mat-calendar-body-cell-preview\"></div>\n  </td>\n</tr>\n",
                    host: {
                        'class': 'mat-calendar-body',
                        'role': 'grid',
                        'aria-readonly': 'true'
                    },
                    exportAs: 'matCalendarBody',
                    encapsulation: i0.ViewEncapsulation.None,
                    changeDetection: i0.ChangeDetectionStrategy.OnPush,
                    styles: [".mat-calendar-body{min-width:224px}.mat-calendar-body-label{height:0;line-height:0;text-align:left;padding-left:4.7142857143%;padding-right:4.7142857143%}.mat-calendar-body-cell{position:relative;height:0;line-height:0;text-align:center;outline:none;cursor:pointer}.mat-calendar-body-cell::before,.mat-calendar-body-cell::after,.mat-calendar-body-cell-preview{content:\"\";position:absolute;top:5%;left:0;z-index:0;box-sizing:border-box;height:90%;width:100%}.mat-calendar-body-range-start:not(.mat-calendar-body-in-comparison-range)::before,.mat-calendar-body-range-start::after,.mat-calendar-body-comparison-start:not(.mat-calendar-body-comparison-bridge-start)::before,.mat-calendar-body-comparison-start::after,.mat-calendar-body-preview-start .mat-calendar-body-cell-preview{left:5%;width:95%;border-top-left-radius:999px;border-bottom-left-radius:999px}[dir=rtl] .mat-calendar-body-range-start:not(.mat-calendar-body-in-comparison-range)::before,[dir=rtl] .mat-calendar-body-range-start::after,[dir=rtl] .mat-calendar-body-comparison-start:not(.mat-calendar-body-comparison-bridge-start)::before,[dir=rtl] .mat-calendar-body-comparison-start::after,[dir=rtl] .mat-calendar-body-preview-start .mat-calendar-body-cell-preview{left:0;border-radius:0;border-top-right-radius:999px;border-bottom-right-radius:999px}.mat-calendar-body-range-end:not(.mat-calendar-body-in-comparison-range)::before,.mat-calendar-body-range-end::after,.mat-calendar-body-comparison-end:not(.mat-calendar-body-comparison-bridge-end)::before,.mat-calendar-body-comparison-end::after,.mat-calendar-body-preview-end .mat-calendar-body-cell-preview{width:95%;border-top-right-radius:999px;border-bottom-right-radius:999px}[dir=rtl] .mat-calendar-body-range-end:not(.mat-calendar-body-in-comparison-range)::before,[dir=rtl] .mat-calendar-body-range-end::after,[dir=rtl] .mat-calendar-body-comparison-end:not(.mat-calendar-body-comparison-bridge-end)::before,[dir=rtl] .mat-calendar-body-comparison-end::after,[dir=rtl] .mat-calendar-body-preview-end .mat-calendar-body-cell-preview{left:5%;border-radius:0;border-top-left-radius:999px;border-bottom-left-radius:999px}[dir=rtl] .mat-calendar-body-comparison-bridge-start.mat-calendar-body-range-end::after,[dir=rtl] .mat-calendar-body-comparison-bridge-end.mat-calendar-body-range-start::after{width:95%;border-top-right-radius:999px;border-bottom-right-radius:999px}.mat-calendar-body-comparison-start.mat-calendar-body-range-end::after,[dir=rtl] .mat-calendar-body-comparison-start.mat-calendar-body-range-end::after,.mat-calendar-body-comparison-end.mat-calendar-body-range-start::after,[dir=rtl] .mat-calendar-body-comparison-end.mat-calendar-body-range-start::after{width:90%}.mat-calendar-body-in-preview .mat-calendar-body-cell-preview{border-top:dashed 1px;border-bottom:dashed 1px}.mat-calendar-body-preview-start .mat-calendar-body-cell-preview{border-left:dashed 1px}[dir=rtl] .mat-calendar-body-preview-start .mat-calendar-body-cell-preview{border-left:0;border-right:dashed 1px}.mat-calendar-body-preview-end .mat-calendar-body-cell-preview{border-right:dashed 1px}[dir=rtl] .mat-calendar-body-preview-end .mat-calendar-body-cell-preview{border-right:0;border-left:dashed 1px}.mat-calendar-body-disabled{cursor:default}.cdk-high-contrast-active .mat-calendar-body-disabled{opacity:.5}.mat-calendar-body-cell-content{top:5%;left:5%;z-index:1;display:flex;align-items:center;justify-content:center;box-sizing:border-box;width:90%;height:90%;line-height:1;border-width:1px;border-style:solid;border-radius:999px}.mat-calendar-body-cell-content.mat-focus-indicator{position:absolute}.cdk-high-contrast-active .mat-calendar-body-cell-content{border:none}.cdk-high-contrast-active .mat-datepicker-popup:not(:empty),.cdk-high-contrast-active .mat-calendar-body-selected{outline:solid 1px}.cdk-high-contrast-active .mat-calendar-body-today{outline:dotted 1px}.cdk-high-contrast-active .cdk-keyboard-focused .mat-calendar-body-active>.mat-calendar-body-cell-content:not(.mat-calendar-body-selected),.cdk-high-contrast-active .cdk-program-focused .mat-calendar-body-active>.mat-calendar-body-cell-content:not(.mat-calendar-body-selected){outline:dotted 2px}[dir=rtl] .mat-calendar-body-label{text-align:right}@media(hover: none){.mat-calendar-body-cell:not(.mat-calendar-body-disabled):hover>.mat-calendar-body-cell-content:not(.mat-calendar-body-selected){background-color:transparent}}\n"]
                },] }
    ];
    MatCalendarBody.ctorParameters = function () { return [
        { type: i0.ElementRef },
        { type: i0.NgZone }
    ]; };
    MatCalendarBody.propDecorators = {
        label: [{ type: i0.Input }],
        rows: [{ type: i0.Input }],
        todayValue: [{ type: i0.Input }],
        startValue: [{ type: i0.Input }],
        endValue: [{ type: i0.Input }],
        labelMinRequiredCells: [{ type: i0.Input }],
        numCols: [{ type: i0.Input }],
        activeCell: [{ type: i0.Input }],
        isRange: [{ type: i0.Input }],
        cellAspectRatio: [{ type: i0.Input }],
        comparisonStart: [{ type: i0.Input }],
        comparisonEnd: [{ type: i0.Input }],
        previewStart: [{ type: i0.Input }],
        previewEnd: [{ type: i0.Input }],
        selectedValueChange: [{ type: i0.Output }],
        previewChange: [{ type: i0.Output }]
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

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b)
                if (Object.prototype.hasOwnProperty.call(b, p))
                    d[p] = b[p]; };
        return extendStatics(d, b);
    };
    function __extends(d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }
    var __assign = function () {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s)
                    if (Object.prototype.hasOwnProperty.call(s, p))
                        t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };
    function __rest(s, e) {
        var t = {};
        for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
                t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }
    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
            r = Reflect.decorate(decorators, target, key, desc);
        else
            for (var i = decorators.length - 1; i >= 0; i--)
                if (d = decorators[i])
                    r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }
    function __param(paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); };
    }
    function __metadata(metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
            return Reflect.metadata(metadataKey, metadataValue);
    }
    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try {
                step(generator.next(value));
            }
            catch (e) {
                reject(e);
            } }
            function rejected(value) { try {
                step(generator["throw"](value));
            }
            catch (e) {
                reject(e);
            } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }
    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function () { if (t[0] & 1)
                throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f)
                throw new TypeError("Generator is already executing.");
            while (_)
                try {
                    if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
                        return t;
                    if (y = 0, t)
                        op = [op[0] & 2, t.value];
                    switch (op[0]) {
                        case 0:
                        case 1:
                            t = op;
                            break;
                        case 4:
                            _.label++;
                            return { value: op[1], done: false };
                        case 5:
                            _.label++;
                            y = op[1];
                            op = [0];
                            continue;
                        case 7:
                            op = _.ops.pop();
                            _.trys.pop();
                            continue;
                        default:
                            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                                _ = 0;
                                continue;
                            }
                            if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                                _.label = op[1];
                                break;
                            }
                            if (op[0] === 6 && _.label < t[1]) {
                                _.label = t[1];
                                t = op;
                                break;
                            }
                            if (t && _.label < t[2]) {
                                _.label = t[2];
                                _.ops.push(op);
                                break;
                            }
                            if (t[2])
                                _.ops.pop();
                            _.trys.pop();
                            continue;
                    }
                    op = body.call(thisArg, _);
                }
                catch (e) {
                    op = [6, e];
                    y = 0;
                }
                finally {
                    f = t = 0;
                }
            if (op[0] & 5)
                throw op[1];
            return { value: op[0] ? op[1] : void 0, done: true };
        }
    }
    var __createBinding = Object.create ? (function (o, m, k, k2) {
        if (k2 === undefined)
            k2 = k;
        Object.defineProperty(o, k2, { enumerable: true, get: function () { return m[k]; } });
    }) : (function (o, m, k, k2) {
        if (k2 === undefined)
            k2 = k;
        o[k2] = m[k];
    });
    function __exportStar(m, o) {
        for (var p in m)
            if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p))
                __createBinding(o, m, p);
    }
    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m)
            return m.call(o);
        if (o && typeof o.length === "number")
            return {
                next: function () {
                    if (o && i >= o.length)
                        o = void 0;
                    return { value: o && o[i++], done: !o };
                }
            };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }
    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m)
            return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
                ar.push(r.value);
        }
        catch (error) {
            e = { error: error };
        }
        finally {
            try {
                if (r && !r.done && (m = i["return"]))
                    m.call(i);
            }
            finally {
                if (e)
                    throw e.error;
            }
        }
        return ar;
    }
    /** @deprecated */
    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }
    /** @deprecated */
    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++)
            s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    }
    function __spreadArray(to, from) {
        for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
            to[j] = from[i];
        return to;
    }
    function __await(v) {
        return this instanceof __await ? (this.v = v, this) : new __await(v);
    }
    function __asyncGenerator(thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator)
            throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
        function verb(n) { if (g[n])
            i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
        function resume(n, v) { try {
            step(g[n](v));
        }
        catch (e) {
            settle(q[0][3], e);
        } }
        function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
        function fulfill(value) { resume("next", value); }
        function reject(value) { resume("throw", value); }
        function settle(f, v) { if (f(v), q.shift(), q.length)
            resume(q[0][0], q[0][1]); }
    }
    function __asyncDelegator(o) {
        var i, p;
        return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
        function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
    }
    function __asyncValues(o) {
        if (!Symbol.asyncIterator)
            throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
        function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
        function settle(resolve, reject, d, v) { Promise.resolve(v).then(function (v) { resolve({ value: v, done: d }); }, reject); }
    }
    function __makeTemplateObject(cooked, raw) {
        if (Object.defineProperty) {
            Object.defineProperty(cooked, "raw", { value: raw });
        }
        else {
            cooked.raw = raw;
        }
        return cooked;
    }
    ;
    var __setModuleDefault = Object.create ? (function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function (o, v) {
        o["default"] = v;
    };
    function __importStar(mod) {
        if (mod && mod.__esModule)
            return mod;
        var result = {};
        if (mod != null)
            for (var k in mod)
                if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
                    __createBinding(result, mod, k);
        __setModuleDefault(result, mod);
        return result;
    }
    function __importDefault(mod) {
        return (mod && mod.__esModule) ? mod : { default: mod };
    }
    function __classPrivateFieldGet(receiver, privateMap) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to get private field on non-instance");
        }
        return privateMap.get(receiver);
    }
    function __classPrivateFieldSet(receiver, privateMap, value) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to set private field on non-instance");
        }
        privateMap.set(receiver, value);
        return value;
    }

    /** A class representing a range of dates. */
    var DateRange = /** @class */ (function () {
        function DateRange(
        /** The start date of the range. */
        start, 
        /** The end date of the range. */
        end) {
            this.start = start;
            this.end = end;
        }
        return DateRange;
    }());
    /**
     * A selection model containing a date selection.
     * @docs-private
     */
    var MatDateSelectionModel = /** @class */ (function () {
        function MatDateSelectionModel(
        /** The current selection. */
        selection, _adapter) {
            this.selection = selection;
            this._adapter = _adapter;
            this._selectionChanged = new rxjs.Subject();
            /** Emits when the selection has changed. */
            this.selectionChanged = this._selectionChanged;
            this.selection = selection;
        }
        /**
         * Updates the current selection in the model.
         * @param value New selection that should be assigned.
         * @param source Object that triggered the selection change.
         */
        MatDateSelectionModel.prototype.updateSelection = function (value, source) {
            var oldValue = this.selection;
            this.selection = value;
            this._selectionChanged.next({ selection: value, source: source, oldValue: oldValue });
        };
        MatDateSelectionModel.prototype.ngOnDestroy = function () {
            this._selectionChanged.complete();
        };
        MatDateSelectionModel.prototype._isValidDateInstance = function (date) {
            return this._adapter.isDateInstance(date) && this._adapter.isValid(date);
        };
        return MatDateSelectionModel;
    }());
    MatDateSelectionModel.decorators = [
        { type: i0.Injectable }
    ];
    MatDateSelectionModel.ctorParameters = function () { return [
        { type: undefined },
        { type: core.DateAdapter }
    ]; };
    /**
     * A selection model that contains a single date.
     * @docs-private
     */
    var MatSingleDateSelectionModel = /** @class */ (function (_super) {
        __extends(MatSingleDateSelectionModel, _super);
        function MatSingleDateSelectionModel(adapter) {
            return _super.call(this, null, adapter) || this;
        }
        /**
         * Adds a date to the current selection. In the case of a single date selection, the added date
         * simply overwrites the previous selection
         */
        MatSingleDateSelectionModel.prototype.add = function (date) {
            _super.prototype.updateSelection.call(this, date, this);
        };
        /** Checks whether the current selection is valid. */
        MatSingleDateSelectionModel.prototype.isValid = function () {
            return this.selection != null && this._isValidDateInstance(this.selection);
        };
        /**
         * Checks whether the current selection is complete. In the case of a single date selection, this
         * is true if the current selection is not null.
         */
        MatSingleDateSelectionModel.prototype.isComplete = function () {
            return this.selection != null;
        };
        /** Clones the selection model. */
        MatSingleDateSelectionModel.prototype.clone = function () {
            var clone = new MatSingleDateSelectionModel(this._adapter);
            clone.updateSelection(this.selection, this);
            return clone;
        };
        return MatSingleDateSelectionModel;
    }(MatDateSelectionModel));
    MatSingleDateSelectionModel.decorators = [
        { type: i0.Injectable }
    ];
    MatSingleDateSelectionModel.ctorParameters = function () { return [
        { type: core.DateAdapter }
    ]; };
    /**
     * A selection model that contains a date range.
     * @docs-private
     */
    var MatRangeDateSelectionModel = /** @class */ (function (_super) {
        __extends(MatRangeDateSelectionModel, _super);
        function MatRangeDateSelectionModel(adapter) {
            return _super.call(this, new DateRange(null, null), adapter) || this;
        }
        /**
         * Adds a date to the current selection. In the case of a date range selection, the added date
         * fills in the next `null` value in the range. If both the start and the end already have a date,
         * the selection is reset so that the given date is the new `start` and the `end` is null.
         */
        MatRangeDateSelectionModel.prototype.add = function (date) {
            var _a = this.selection, start = _a.start, end = _a.end;
            if (start == null) {
                start = date;
            }
            else if (end == null) {
                end = date;
            }
            else {
                start = date;
                end = null;
            }
            _super.prototype.updateSelection.call(this, new DateRange(start, end), this);
        };
        /** Checks whether the current selection is valid. */
        MatRangeDateSelectionModel.prototype.isValid = function () {
            var _a = this.selection, start = _a.start, end = _a.end;
            // Empty ranges are valid.
            if (start == null && end == null) {
                return true;
            }
            // Complete ranges are only valid if both dates are valid and the start is before the end.
            if (start != null && end != null) {
                return this._isValidDateInstance(start) && this._isValidDateInstance(end) &&
                    this._adapter.compareDate(start, end) <= 0;
            }
            // Partial ranges are valid if the start/end is valid.
            return (start == null || this._isValidDateInstance(start)) &&
                (end == null || this._isValidDateInstance(end));
        };
        /**
         * Checks whether the current selection is complete. In the case of a date range selection, this
         * is true if the current selection has a non-null `start` and `end`.
         */
        MatRangeDateSelectionModel.prototype.isComplete = function () {
            return this.selection.start != null && this.selection.end != null;
        };
        /** Clones the selection model. */
        MatRangeDateSelectionModel.prototype.clone = function () {
            var clone = new MatRangeDateSelectionModel(this._adapter);
            clone.updateSelection(this.selection, this);
            return clone;
        };
        return MatRangeDateSelectionModel;
    }(MatDateSelectionModel));
    MatRangeDateSelectionModel.decorators = [
        { type: i0.Injectable }
    ];
    MatRangeDateSelectionModel.ctorParameters = function () { return [
        { type: core.DateAdapter }
    ]; };
    /** @docs-private */
    function MAT_SINGLE_DATE_SELECTION_MODEL_FACTORY(parent, adapter) {
        return parent || new MatSingleDateSelectionModel(adapter);
    }
    /**
     * Used to provide a single selection model to a component.
     * @docs-private
     */
    var MAT_SINGLE_DATE_SELECTION_MODEL_PROVIDER = {
        provide: MatDateSelectionModel,
        deps: [[new i0.Optional(), new i0.SkipSelf(), MatDateSelectionModel], core.DateAdapter],
        useFactory: MAT_SINGLE_DATE_SELECTION_MODEL_FACTORY,
    };
    /** @docs-private */
    function MAT_RANGE_DATE_SELECTION_MODEL_FACTORY(parent, adapter) {
        return parent || new MatRangeDateSelectionModel(adapter);
    }
    /**
     * Used to provide a range selection model to a component.
     * @docs-private
     */
    var MAT_RANGE_DATE_SELECTION_MODEL_PROVIDER = {
        provide: MatDateSelectionModel,
        deps: [[new i0.Optional(), new i0.SkipSelf(), MatDateSelectionModel], core.DateAdapter],
        useFactory: MAT_RANGE_DATE_SELECTION_MODEL_FACTORY,
    };

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /** Injection token used to customize the date range selection behavior. */
    var MAT_DATE_RANGE_SELECTION_STRATEGY = new i0.InjectionToken('MAT_DATE_RANGE_SELECTION_STRATEGY');
    /** Provides the default date range selection behavior. */
    var DefaultMatCalendarRangeStrategy = /** @class */ (function () {
        function DefaultMatCalendarRangeStrategy(_dateAdapter) {
            this._dateAdapter = _dateAdapter;
        }
        DefaultMatCalendarRangeStrategy.prototype.selectionFinished = function (date, currentRange) {
            var start = currentRange.start, end = currentRange.end;
            if (start == null) {
                start = date;
            }
            else if (end == null && date && this._dateAdapter.compareDate(date, start) >= 0) {
                end = date;
            }
            else {
                start = date;
                end = null;
            }
            return new DateRange(start, end);
        };
        DefaultMatCalendarRangeStrategy.prototype.createPreview = function (activeDate, currentRange) {
            var start = null;
            var end = null;
            if (currentRange.start && !currentRange.end && activeDate) {
                start = currentRange.start;
                end = activeDate;
            }
            return new DateRange(start, end);
        };
        return DefaultMatCalendarRangeStrategy;
    }());
    DefaultMatCalendarRangeStrategy.decorators = [
        { type: i0.Injectable }
    ];
    DefaultMatCalendarRangeStrategy.ctorParameters = function () { return [
        { type: core.DateAdapter }
    ]; };
    /** @docs-private */
    function MAT_CALENDAR_RANGE_STRATEGY_PROVIDER_FACTORY(parent, adapter) {
        return parent || new DefaultMatCalendarRangeStrategy(adapter);
    }
    /** @docs-private */
    var MAT_CALENDAR_RANGE_STRATEGY_PROVIDER = {
        provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
        deps: [[new i0.Optional(), new i0.SkipSelf(), MAT_DATE_RANGE_SELECTION_STRATEGY], core.DateAdapter],
        useFactory: MAT_CALENDAR_RANGE_STRATEGY_PROVIDER_FACTORY,
    };

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var DAYS_PER_WEEK = 7;
    /**
     * An internal component used to display a single month in the datepicker.
     * @docs-private
     */
    var MatMonthView = /** @class */ (function () {
        function MatMonthView(_changeDetectorRef, _dateFormats, _dateAdapter, _dir, _rangeStrategy) {
            this._changeDetectorRef = _changeDetectorRef;
            this._dateFormats = _dateFormats;
            this._dateAdapter = _dateAdapter;
            this._dir = _dir;
            this._rangeStrategy = _rangeStrategy;
            this._rerenderSubscription = rxjs.Subscription.EMPTY;
            /** Emits when a new date is selected. */
            this.selectedChange = new i0.EventEmitter();
            /** Emits when any date is selected. */
            this._userSelection = new i0.EventEmitter();
            /** Emits when any date is activated. */
            this.activeDateChange = new i0.EventEmitter();
            if (typeof ngDevMode === 'undefined' || ngDevMode) {
                if (!this._dateAdapter) {
                    throw createMissingDateImplError('DateAdapter');
                }
                if (!this._dateFormats) {
                    throw createMissingDateImplError('MAT_DATE_FORMATS');
                }
            }
            this._activeDate = this._dateAdapter.today();
        }
        Object.defineProperty(MatMonthView.prototype, "activeDate", {
            /**
             * The date to display in this month view (everything other than the month and year is ignored).
             */
            get: function () { return this._activeDate; },
            set: function (value) {
                var oldActiveDate = this._activeDate;
                var validDate = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value)) || this._dateAdapter.today();
                this._activeDate = this._dateAdapter.clampDate(validDate, this.minDate, this.maxDate);
                if (!this._hasSameMonthAndYear(oldActiveDate, this._activeDate)) {
                    this._init();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatMonthView.prototype, "selected", {
            /** The currently selected date. */
            get: function () { return this._selected; },
            set: function (value) {
                if (value instanceof DateRange) {
                    this._selected = value;
                }
                else {
                    this._selected = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value));
                }
                this._setRanges(this._selected);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatMonthView.prototype, "minDate", {
            /** The minimum selectable date. */
            get: function () { return this._minDate; },
            set: function (value) {
                this._minDate = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value));
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatMonthView.prototype, "maxDate", {
            /** The maximum selectable date. */
            get: function () { return this._maxDate; },
            set: function (value) {
                this._maxDate = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value));
            },
            enumerable: false,
            configurable: true
        });
        MatMonthView.prototype.ngAfterContentInit = function () {
            var _this = this;
            this._rerenderSubscription = this._dateAdapter.localeChanges
                .pipe(operators.startWith(null))
                .subscribe(function () { return _this._init(); });
        };
        MatMonthView.prototype.ngOnChanges = function (changes) {
            var comparisonChange = changes['comparisonStart'] || changes['comparisonEnd'];
            if (comparisonChange && !comparisonChange.firstChange) {
                this._setRanges(this.selected);
            }
        };
        MatMonthView.prototype.ngOnDestroy = function () {
            this._rerenderSubscription.unsubscribe();
        };
        /** Handles when a new date is selected. */
        MatMonthView.prototype._dateSelected = function (event) {
            var date = event.value;
            var selectedYear = this._dateAdapter.getYear(this.activeDate);
            var selectedMonth = this._dateAdapter.getMonth(this.activeDate);
            var selectedDate = this._dateAdapter.createDate(selectedYear, selectedMonth, date);
            var rangeStartDate;
            var rangeEndDate;
            if (this._selected instanceof DateRange) {
                rangeStartDate = this._getDateInCurrentMonth(this._selected.start);
                rangeEndDate = this._getDateInCurrentMonth(this._selected.end);
            }
            else {
                rangeStartDate = rangeEndDate = this._getDateInCurrentMonth(this._selected);
            }
            if (rangeStartDate !== date || rangeEndDate !== date) {
                this.selectedChange.emit(selectedDate);
            }
            this._userSelection.emit({ value: selectedDate, event: event.event });
            this._previewStart = this._previewEnd = null;
            this._changeDetectorRef.markForCheck();
        };
        /** Handles keydown events on the calendar body when calendar is in month view. */
        MatMonthView.prototype._handleCalendarBodyKeydown = function (event) {
            // TODO(mmalerba): We currently allow keyboard navigation to disabled dates, but just prevent
            // disabled ones from being selected. This may not be ideal, we should look into whether
            // navigation should skip over disabled dates, and if so, how to implement that efficiently.
            var oldActiveDate = this._activeDate;
            var isRtl = this._isRtl();
            switch (event.keyCode) {
                case keycodes.LEFT_ARROW:
                    this.activeDate = this._dateAdapter.addCalendarDays(this._activeDate, isRtl ? 1 : -1);
                    break;
                case keycodes.RIGHT_ARROW:
                    this.activeDate = this._dateAdapter.addCalendarDays(this._activeDate, isRtl ? -1 : 1);
                    break;
                case keycodes.UP_ARROW:
                    this.activeDate = this._dateAdapter.addCalendarDays(this._activeDate, -7);
                    break;
                case keycodes.DOWN_ARROW:
                    this.activeDate = this._dateAdapter.addCalendarDays(this._activeDate, 7);
                    break;
                case keycodes.HOME:
                    this.activeDate = this._dateAdapter.addCalendarDays(this._activeDate, 1 - this._dateAdapter.getDate(this._activeDate));
                    break;
                case keycodes.END:
                    this.activeDate = this._dateAdapter.addCalendarDays(this._activeDate, (this._dateAdapter.getNumDaysInMonth(this._activeDate) -
                        this._dateAdapter.getDate(this._activeDate)));
                    break;
                case keycodes.PAGE_UP:
                    this.activeDate = event.altKey ?
                        this._dateAdapter.addCalendarYears(this._activeDate, -1) :
                        this._dateAdapter.addCalendarMonths(this._activeDate, -1);
                    break;
                case keycodes.PAGE_DOWN:
                    this.activeDate = event.altKey ?
                        this._dateAdapter.addCalendarYears(this._activeDate, 1) :
                        this._dateAdapter.addCalendarMonths(this._activeDate, 1);
                    break;
                case keycodes.ENTER:
                case keycodes.SPACE:
                    if (!this.dateFilter || this.dateFilter(this._activeDate)) {
                        this._dateSelected({ value: this._dateAdapter.getDate(this._activeDate), event: event });
                        // Prevent unexpected default actions such as form submission.
                        event.preventDefault();
                    }
                    return;
                case keycodes.ESCAPE:
                    // Abort the current range selection if the user presses escape mid-selection.
                    if (this._previewEnd != null && !keycodes.hasModifierKey(event)) {
                        this._previewStart = this._previewEnd = null;
                        this.selectedChange.emit(null);
                        this._userSelection.emit({ value: null, event: event });
                        event.preventDefault();
                        event.stopPropagation(); // Prevents the overlay from closing.
                    }
                    return;
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
        };
        /** Initializes this month view. */
        MatMonthView.prototype._init = function () {
            this._setRanges(this.selected);
            this._todayDate = this._getCellCompareValue(this._dateAdapter.today());
            this._monthLabel = this._dateFormats.display.monthLabel
                ? this._dateAdapter.format(this.activeDate, this._dateFormats.display.monthLabel)
                : this._dateAdapter.getMonthNames('short')[this._dateAdapter.getMonth(this.activeDate)]
                    .toLocaleUpperCase();
            var firstOfMonth = this._dateAdapter.createDate(this._dateAdapter.getYear(this.activeDate), this._dateAdapter.getMonth(this.activeDate), 1);
            this._firstWeekOffset =
                (DAYS_PER_WEEK + this._dateAdapter.getDayOfWeek(firstOfMonth) -
                    this._dateAdapter.getFirstDayOfWeek()) % DAYS_PER_WEEK;
            this._initWeekdays();
            this._createWeekCells();
            this._changeDetectorRef.markForCheck();
        };
        /** Focuses the active cell after the microtask queue is empty. */
        MatMonthView.prototype._focusActiveCell = function (movePreview) {
            this._matCalendarBody._focusActiveCell(movePreview);
        };
        /** Called when the user has activated a new cell and the preview needs to be updated. */
        MatMonthView.prototype._previewChanged = function (_a) {
            var event = _a.event, cell = _a.value;
            if (this._rangeStrategy) {
                // We can assume that this will be a range, because preview
                // events aren't fired for single date selections.
                var value = cell ? cell.rawValue : null;
                var previewRange = this._rangeStrategy.createPreview(value, this.selected, event);
                this._previewStart = this._getCellCompareValue(previewRange.start);
                this._previewEnd = this._getCellCompareValue(previewRange.end);
                // Note that here we need to use `detectChanges`, rather than `markForCheck`, because
                // the way `_focusActiveCell` is set up at the moment makes it fire at the wrong time
                // when navigating one month back using the keyboard which will cause this handler
                // to throw a "changed after checked" error when updating the preview state.
                this._changeDetectorRef.detectChanges();
            }
        };
        /** Initializes the weekdays. */
        MatMonthView.prototype._initWeekdays = function () {
            var firstDayOfWeek = this._dateAdapter.getFirstDayOfWeek();
            var narrowWeekdays = this._dateAdapter.getDayOfWeekNames('narrow');
            var longWeekdays = this._dateAdapter.getDayOfWeekNames('long');
            // Rotate the labels for days of the week based on the configured first day of the week.
            var weekdays = longWeekdays.map(function (long, i) {
                return { long: long, narrow: narrowWeekdays[i] };
            });
            this._weekdays = weekdays.slice(firstDayOfWeek).concat(weekdays.slice(0, firstDayOfWeek));
        };
        /** Creates MatCalendarCells for the dates in this month. */
        MatMonthView.prototype._createWeekCells = function () {
            var daysInMonth = this._dateAdapter.getNumDaysInMonth(this.activeDate);
            var dateNames = this._dateAdapter.getDateNames();
            this._weeks = [[]];
            for (var i = 0, cell = this._firstWeekOffset; i < daysInMonth; i++, cell++) {
                if (cell == DAYS_PER_WEEK) {
                    this._weeks.push([]);
                    cell = 0;
                }
                var date = this._dateAdapter.createDate(this._dateAdapter.getYear(this.activeDate), this._dateAdapter.getMonth(this.activeDate), i + 1);
                var enabled = this._shouldEnableDate(date);
                var ariaLabel = this._dateAdapter.format(date, this._dateFormats.display.dateA11yLabel);
                var cellClasses = this.dateClass ? this.dateClass(date, 'month') : undefined;
                this._weeks[this._weeks.length - 1].push(new MatCalendarCell(i + 1, dateNames[i], ariaLabel, enabled, cellClasses, this._getCellCompareValue(date), date));
            }
        };
        /** Date filter for the month */
        MatMonthView.prototype._shouldEnableDate = function (date) {
            return !!date &&
                (!this.minDate || this._dateAdapter.compareDate(date, this.minDate) >= 0) &&
                (!this.maxDate || this._dateAdapter.compareDate(date, this.maxDate) <= 0) &&
                (!this.dateFilter || this.dateFilter(date));
        };
        /**
         * Gets the date in this month that the given Date falls on.
         * Returns null if the given Date is in another month.
         */
        MatMonthView.prototype._getDateInCurrentMonth = function (date) {
            return date && this._hasSameMonthAndYear(date, this.activeDate) ?
                this._dateAdapter.getDate(date) : null;
        };
        /** Checks whether the 2 dates are non-null and fall within the same month of the same year. */
        MatMonthView.prototype._hasSameMonthAndYear = function (d1, d2) {
            return !!(d1 && d2 && this._dateAdapter.getMonth(d1) == this._dateAdapter.getMonth(d2) &&
                this._dateAdapter.getYear(d1) == this._dateAdapter.getYear(d2));
        };
        /** Gets the value that will be used to one cell to another. */
        MatMonthView.prototype._getCellCompareValue = function (date) {
            if (date) {
                // We use the time since the Unix epoch to compare dates in this view, rather than the
                // cell values, because we need to support ranges that span across multiple months/years.
                var year = this._dateAdapter.getYear(date);
                var month = this._dateAdapter.getMonth(date);
                var day = this._dateAdapter.getDate(date);
                return new Date(year, month, day).getTime();
            }
            return null;
        };
        /** Determines whether the user has the RTL layout direction. */
        MatMonthView.prototype._isRtl = function () {
            return this._dir && this._dir.value === 'rtl';
        };
        /** Sets the current range based on a model value. */
        MatMonthView.prototype._setRanges = function (selectedValue) {
            if (selectedValue instanceof DateRange) {
                this._rangeStart = this._getCellCompareValue(selectedValue.start);
                this._rangeEnd = this._getCellCompareValue(selectedValue.end);
                this._isRange = true;
            }
            else {
                this._rangeStart = this._rangeEnd = this._getCellCompareValue(selectedValue);
                this._isRange = false;
            }
            this._comparisonRangeStart = this._getCellCompareValue(this.comparisonStart);
            this._comparisonRangeEnd = this._getCellCompareValue(this.comparisonEnd);
        };
        return MatMonthView;
    }());
    MatMonthView.decorators = [
        { type: i0.Component, args: [{
                    selector: 'mat-month-view',
                    template: "<table class=\"mat-calendar-table\" role=\"presentation\">\n  <thead class=\"mat-calendar-table-header\">\n    <tr>\n      <th scope=\"col\" *ngFor=\"let day of _weekdays\" [attr.aria-label]=\"day.long\">{{day.narrow}}</th>\n    </tr>\n    <tr><th class=\"mat-calendar-table-header-divider\" colspan=\"7\" aria-hidden=\"true\"></th></tr>\n  </thead>\n  <tbody mat-calendar-body\n         [label]=\"_monthLabel\"\n         [rows]=\"_weeks\"\n         [todayValue]=\"_todayDate!\"\n         [startValue]=\"_rangeStart!\"\n         [endValue]=\"_rangeEnd!\"\n         [comparisonStart]=\"_comparisonRangeStart\"\n         [comparisonEnd]=\"_comparisonRangeEnd\"\n         [previewStart]=\"_previewStart\"\n         [previewEnd]=\"_previewEnd\"\n         [isRange]=\"_isRange\"\n         [labelMinRequiredCells]=\"3\"\n         [activeCell]=\"_dateAdapter.getDate(activeDate) - 1\"\n         (selectedValueChange)=\"_dateSelected($event)\"\n         (previewChange)=\"_previewChanged($event)\"\n         (keydown)=\"_handleCalendarBodyKeydown($event)\">\n  </tbody>\n</table>\n",
                    exportAs: 'matMonthView',
                    encapsulation: i0.ViewEncapsulation.None,
                    changeDetection: i0.ChangeDetectionStrategy.OnPush
                },] }
    ];
    MatMonthView.ctorParameters = function () { return [
        { type: i0.ChangeDetectorRef },
        { type: undefined, decorators: [{ type: i0.Optional }, { type: i0.Inject, args: [core.MAT_DATE_FORMATS,] }] },
        { type: core.DateAdapter, decorators: [{ type: i0.Optional }] },
        { type: bidi.Directionality, decorators: [{ type: i0.Optional }] },
        { type: undefined, decorators: [{ type: i0.Inject, args: [MAT_DATE_RANGE_SELECTION_STRATEGY,] }, { type: i0.Optional }] }
    ]; };
    MatMonthView.propDecorators = {
        activeDate: [{ type: i0.Input }],
        selected: [{ type: i0.Input }],
        minDate: [{ type: i0.Input }],
        maxDate: [{ type: i0.Input }],
        dateFilter: [{ type: i0.Input }],
        dateClass: [{ type: i0.Input }],
        comparisonStart: [{ type: i0.Input }],
        comparisonEnd: [{ type: i0.Input }],
        selectedChange: [{ type: i0.Output }],
        _userSelection: [{ type: i0.Output }],
        activeDateChange: [{ type: i0.Output }],
        _matCalendarBody: [{ type: i0.ViewChild, args: [MatCalendarBody,] }]
    };

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var yearsPerPage = 24;
    var yearsPerRow = 4;
    /**
     * An internal component used to display a year selector in the datepicker.
     * @docs-private
     */
    var MatMultiYearView = /** @class */ (function () {
        function MatMultiYearView(_changeDetectorRef, _dateAdapter, _dir) {
            this._changeDetectorRef = _changeDetectorRef;
            this._dateAdapter = _dateAdapter;
            this._dir = _dir;
            this._rerenderSubscription = rxjs.Subscription.EMPTY;
            /** Emits when a new year is selected. */
            this.selectedChange = new i0.EventEmitter();
            /** Emits the selected year. This doesn't imply a change on the selected date */
            this.yearSelected = new i0.EventEmitter();
            /** Emits when any date is activated. */
            this.activeDateChange = new i0.EventEmitter();
            if (!this._dateAdapter && (typeof ngDevMode === 'undefined' || ngDevMode)) {
                throw createMissingDateImplError('DateAdapter');
            }
            this._activeDate = this._dateAdapter.today();
        }
        Object.defineProperty(MatMultiYearView.prototype, "activeDate", {
            /** The date to display in this multi-year view (everything other than the year is ignored). */
            get: function () { return this._activeDate; },
            set: function (value) {
                var oldActiveDate = this._activeDate;
                var validDate = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value)) || this._dateAdapter.today();
                this._activeDate = this._dateAdapter.clampDate(validDate, this.minDate, this.maxDate);
                if (!isSameMultiYearView(this._dateAdapter, oldActiveDate, this._activeDate, this.minDate, this.maxDate)) {
                    this._init();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatMultiYearView.prototype, "selected", {
            /** The currently selected date. */
            get: function () { return this._selected; },
            set: function (value) {
                if (value instanceof DateRange) {
                    this._selected = value;
                }
                else {
                    this._selected = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value));
                }
                this._setSelectedYear(value);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatMultiYearView.prototype, "minDate", {
            /** The minimum selectable date. */
            get: function () { return this._minDate; },
            set: function (value) {
                this._minDate = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value));
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatMultiYearView.prototype, "maxDate", {
            /** The maximum selectable date. */
            get: function () { return this._maxDate; },
            set: function (value) {
                this._maxDate = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value));
            },
            enumerable: false,
            configurable: true
        });
        MatMultiYearView.prototype.ngAfterContentInit = function () {
            var _this = this;
            this._rerenderSubscription = this._dateAdapter.localeChanges
                .pipe(operators.startWith(null))
                .subscribe(function () { return _this._init(); });
        };
        MatMultiYearView.prototype.ngOnDestroy = function () {
            this._rerenderSubscription.unsubscribe();
        };
        /** Initializes this multi-year view. */
        MatMultiYearView.prototype._init = function () {
            var _this = this;
            this._todayYear = this._dateAdapter.getYear(this._dateAdapter.today());
            // We want a range years such that we maximize the number of
            // enabled dates visible at once. This prevents issues where the minimum year
            // is the last item of a page OR the maximum year is the first item of a page.
            // The offset from the active year to the "slot" for the starting year is the
            // *actual* first rendered year in the multi-year view.
            var activeYear = this._dateAdapter.getYear(this._activeDate);
            var minYearOfPage = activeYear - getActiveOffset(this._dateAdapter, this.activeDate, this.minDate, this.maxDate);
            this._years = [];
            for (var i = 0, row = []; i < yearsPerPage; i++) {
                row.push(minYearOfPage + i);
                if (row.length == yearsPerRow) {
                    this._years.push(row.map(function (year) { return _this._createCellForYear(year); }));
                    row = [];
                }
            }
            this._changeDetectorRef.markForCheck();
        };
        /** Handles when a new year is selected. */
        MatMultiYearView.prototype._yearSelected = function (event) {
            var year = event.value;
            this.yearSelected.emit(this._dateAdapter.createDate(year, 0, 1));
            var month = this._dateAdapter.getMonth(this.activeDate);
            var daysInMonth = this._dateAdapter.getNumDaysInMonth(this._dateAdapter.createDate(year, month, 1));
            this.selectedChange.emit(this._dateAdapter.createDate(year, month, Math.min(this._dateAdapter.getDate(this.activeDate), daysInMonth)));
        };
        /** Handles keydown events on the calendar body when calendar is in multi-year view. */
        MatMultiYearView.prototype._handleCalendarBodyKeydown = function (event) {
            var oldActiveDate = this._activeDate;
            var isRtl = this._isRtl();
            switch (event.keyCode) {
                case keycodes.LEFT_ARROW:
                    this.activeDate = this._dateAdapter.addCalendarYears(this._activeDate, isRtl ? 1 : -1);
                    break;
                case keycodes.RIGHT_ARROW:
                    this.activeDate = this._dateAdapter.addCalendarYears(this._activeDate, isRtl ? -1 : 1);
                    break;
                case keycodes.UP_ARROW:
                    this.activeDate = this._dateAdapter.addCalendarYears(this._activeDate, -yearsPerRow);
                    break;
                case keycodes.DOWN_ARROW:
                    this.activeDate = this._dateAdapter.addCalendarYears(this._activeDate, yearsPerRow);
                    break;
                case keycodes.HOME:
                    this.activeDate = this._dateAdapter.addCalendarYears(this._activeDate, -getActiveOffset(this._dateAdapter, this.activeDate, this.minDate, this.maxDate));
                    break;
                case keycodes.END:
                    this.activeDate = this._dateAdapter.addCalendarYears(this._activeDate, yearsPerPage - getActiveOffset(this._dateAdapter, this.activeDate, this.minDate, this.maxDate) - 1);
                    break;
                case keycodes.PAGE_UP:
                    this.activeDate =
                        this._dateAdapter.addCalendarYears(this._activeDate, event.altKey ? -yearsPerPage * 10 : -yearsPerPage);
                    break;
                case keycodes.PAGE_DOWN:
                    this.activeDate =
                        this._dateAdapter.addCalendarYears(this._activeDate, event.altKey ? yearsPerPage * 10 : yearsPerPage);
                    break;
                case keycodes.ENTER:
                case keycodes.SPACE:
                    this._yearSelected({ value: this._dateAdapter.getYear(this._activeDate), event: event });
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
        };
        MatMultiYearView.prototype._getActiveCell = function () {
            return getActiveOffset(this._dateAdapter, this.activeDate, this.minDate, this.maxDate);
        };
        /** Focuses the active cell after the microtask queue is empty. */
        MatMultiYearView.prototype._focusActiveCell = function () {
            this._matCalendarBody._focusActiveCell();
        };
        /** Creates an MatCalendarCell for the given year. */
        MatMultiYearView.prototype._createCellForYear = function (year) {
            var date = this._dateAdapter.createDate(year, 0, 1);
            var yearName = this._dateAdapter.getYearName(date);
            var cellClasses = this.dateClass ? this.dateClass(date, 'multi-year') : undefined;
            return new MatCalendarCell(year, yearName, yearName, this._shouldEnableYear(year), cellClasses);
        };
        /** Whether the given year is enabled. */
        MatMultiYearView.prototype._shouldEnableYear = function (year) {
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
            var firstOfYear = this._dateAdapter.createDate(year, 0, 1);
            // If any date in the year is enabled count the year as enabled.
            for (var date = firstOfYear; this._dateAdapter.getYear(date) == year; date = this._dateAdapter.addCalendarDays(date, 1)) {
                if (this.dateFilter(date)) {
                    return true;
                }
            }
            return false;
        };
        /** Determines whether the user has the RTL layout direction. */
        MatMultiYearView.prototype._isRtl = function () {
            return this._dir && this._dir.value === 'rtl';
        };
        /** Sets the currently-highlighted year based on a model value. */
        MatMultiYearView.prototype._setSelectedYear = function (value) {
            this._selectedYear = null;
            if (value instanceof DateRange) {
                var displayValue = value.start || value.end;
                if (displayValue) {
                    this._selectedYear = this._dateAdapter.getYear(displayValue);
                }
            }
            else if (value) {
                this._selectedYear = this._dateAdapter.getYear(value);
            }
        };
        return MatMultiYearView;
    }());
    MatMultiYearView.decorators = [
        { type: i0.Component, args: [{
                    selector: 'mat-multi-year-view',
                    template: "<table class=\"mat-calendar-table\" role=\"presentation\">\n  <thead class=\"mat-calendar-table-header\">\n    <tr><th class=\"mat-calendar-table-header-divider\" colspan=\"4\"></th></tr>\n  </thead>\n  <tbody mat-calendar-body\n         [rows]=\"_years\"\n         [todayValue]=\"_todayYear\"\n         [startValue]=\"_selectedYear!\"\n         [endValue]=\"_selectedYear!\"\n         [numCols]=\"4\"\n         [cellAspectRatio]=\"4 / 7\"\n         [activeCell]=\"_getActiveCell()\"\n         (selectedValueChange)=\"_yearSelected($event)\"\n         (keydown)=\"_handleCalendarBodyKeydown($event)\">\n  </tbody>\n</table>\n",
                    exportAs: 'matMultiYearView',
                    encapsulation: i0.ViewEncapsulation.None,
                    changeDetection: i0.ChangeDetectionStrategy.OnPush
                },] }
    ];
    MatMultiYearView.ctorParameters = function () { return [
        { type: i0.ChangeDetectorRef },
        { type: core.DateAdapter, decorators: [{ type: i0.Optional }] },
        { type: bidi.Directionality, decorators: [{ type: i0.Optional }] }
    ]; };
    MatMultiYearView.propDecorators = {
        activeDate: [{ type: i0.Input }],
        selected: [{ type: i0.Input }],
        minDate: [{ type: i0.Input }],
        maxDate: [{ type: i0.Input }],
        dateFilter: [{ type: i0.Input }],
        dateClass: [{ type: i0.Input }],
        selectedChange: [{ type: i0.Output }],
        yearSelected: [{ type: i0.Output }],
        activeDateChange: [{ type: i0.Output }],
        _matCalendarBody: [{ type: i0.ViewChild, args: [MatCalendarBody,] }]
    };
    function isSameMultiYearView(dateAdapter, date1, date2, minDate, maxDate) {
        var year1 = dateAdapter.getYear(date1);
        var year2 = dateAdapter.getYear(date2);
        var startingYear = getStartingYear(dateAdapter, minDate, maxDate);
        return Math.floor((year1 - startingYear) / yearsPerPage) ===
            Math.floor((year2 - startingYear) / yearsPerPage);
    }
    /**
     * When the multi-year view is first opened, the active year will be in view.
     * So we compute how many years are between the active year and the *slot* where our
     * "startingYear" will render when paged into view.
     */
    function getActiveOffset(dateAdapter, activeDate, minDate, maxDate) {
        var activeYear = dateAdapter.getYear(activeDate);
        return euclideanModulo((activeYear - getStartingYear(dateAdapter, minDate, maxDate)), yearsPerPage);
    }
    /**
     * We pick a "starting" year such that either the maximum year would be at the end
     * or the minimum year would be at the beginning of a page.
     */
    function getStartingYear(dateAdapter, minDate, maxDate) {
        var startingYear = 0;
        if (maxDate) {
            var maxYear = dateAdapter.getYear(maxDate);
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

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /**
     * An internal component used to display a single year in the datepicker.
     * @docs-private
     */
    var MatYearView = /** @class */ (function () {
        function MatYearView(_changeDetectorRef, _dateFormats, _dateAdapter, _dir) {
            this._changeDetectorRef = _changeDetectorRef;
            this._dateFormats = _dateFormats;
            this._dateAdapter = _dateAdapter;
            this._dir = _dir;
            this._rerenderSubscription = rxjs.Subscription.EMPTY;
            /** Emits when a new month is selected. */
            this.selectedChange = new i0.EventEmitter();
            /** Emits the selected month. This doesn't imply a change on the selected date */
            this.monthSelected = new i0.EventEmitter();
            /** Emits when any date is activated. */
            this.activeDateChange = new i0.EventEmitter();
            if (typeof ngDevMode === 'undefined' || ngDevMode) {
                if (!this._dateAdapter) {
                    throw createMissingDateImplError('DateAdapter');
                }
                if (!this._dateFormats) {
                    throw createMissingDateImplError('MAT_DATE_FORMATS');
                }
            }
            this._activeDate = this._dateAdapter.today();
        }
        Object.defineProperty(MatYearView.prototype, "activeDate", {
            /** The date to display in this year view (everything other than the year is ignored). */
            get: function () { return this._activeDate; },
            set: function (value) {
                var oldActiveDate = this._activeDate;
                var validDate = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value)) || this._dateAdapter.today();
                this._activeDate = this._dateAdapter.clampDate(validDate, this.minDate, this.maxDate);
                if (this._dateAdapter.getYear(oldActiveDate) !== this._dateAdapter.getYear(this._activeDate)) {
                    this._init();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatYearView.prototype, "selected", {
            /** The currently selected date. */
            get: function () { return this._selected; },
            set: function (value) {
                if (value instanceof DateRange) {
                    this._selected = value;
                }
                else {
                    this._selected = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value));
                }
                this._setSelectedMonth(value);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatYearView.prototype, "minDate", {
            /** The minimum selectable date. */
            get: function () { return this._minDate; },
            set: function (value) {
                this._minDate = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value));
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatYearView.prototype, "maxDate", {
            /** The maximum selectable date. */
            get: function () { return this._maxDate; },
            set: function (value) {
                this._maxDate = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value));
            },
            enumerable: false,
            configurable: true
        });
        MatYearView.prototype.ngAfterContentInit = function () {
            var _this = this;
            this._rerenderSubscription = this._dateAdapter.localeChanges
                .pipe(operators.startWith(null))
                .subscribe(function () { return _this._init(); });
        };
        MatYearView.prototype.ngOnDestroy = function () {
            this._rerenderSubscription.unsubscribe();
        };
        /** Handles when a new month is selected. */
        MatYearView.prototype._monthSelected = function (event) {
            var month = event.value;
            var normalizedDate = this._dateAdapter.createDate(this._dateAdapter.getYear(this.activeDate), month, 1);
            this.monthSelected.emit(normalizedDate);
            var daysInMonth = this._dateAdapter.getNumDaysInMonth(normalizedDate);
            this.selectedChange.emit(this._dateAdapter.createDate(this._dateAdapter.getYear(this.activeDate), month, Math.min(this._dateAdapter.getDate(this.activeDate), daysInMonth)));
        };
        /** Handles keydown events on the calendar body when calendar is in year view. */
        MatYearView.prototype._handleCalendarBodyKeydown = function (event) {
            // TODO(mmalerba): We currently allow keyboard navigation to disabled dates, but just prevent
            // disabled ones from being selected. This may not be ideal, we should look into whether
            // navigation should skip over disabled dates, and if so, how to implement that efficiently.
            var oldActiveDate = this._activeDate;
            var isRtl = this._isRtl();
            switch (event.keyCode) {
                case keycodes.LEFT_ARROW:
                    this.activeDate = this._dateAdapter.addCalendarMonths(this._activeDate, isRtl ? 1 : -1);
                    break;
                case keycodes.RIGHT_ARROW:
                    this.activeDate = this._dateAdapter.addCalendarMonths(this._activeDate, isRtl ? -1 : 1);
                    break;
                case keycodes.UP_ARROW:
                    this.activeDate = this._dateAdapter.addCalendarMonths(this._activeDate, -4);
                    break;
                case keycodes.DOWN_ARROW:
                    this.activeDate = this._dateAdapter.addCalendarMonths(this._activeDate, 4);
                    break;
                case keycodes.HOME:
                    this.activeDate = this._dateAdapter.addCalendarMonths(this._activeDate, -this._dateAdapter.getMonth(this._activeDate));
                    break;
                case keycodes.END:
                    this.activeDate = this._dateAdapter.addCalendarMonths(this._activeDate, 11 - this._dateAdapter.getMonth(this._activeDate));
                    break;
                case keycodes.PAGE_UP:
                    this.activeDate =
                        this._dateAdapter.addCalendarYears(this._activeDate, event.altKey ? -10 : -1);
                    break;
                case keycodes.PAGE_DOWN:
                    this.activeDate =
                        this._dateAdapter.addCalendarYears(this._activeDate, event.altKey ? 10 : 1);
                    break;
                case keycodes.ENTER:
                case keycodes.SPACE:
                    this._monthSelected({ value: this._dateAdapter.getMonth(this._activeDate), event: event });
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
        };
        /** Initializes this year view. */
        MatYearView.prototype._init = function () {
            var _this = this;
            this._setSelectedMonth(this.selected);
            this._todayMonth = this._getMonthInCurrentYear(this._dateAdapter.today());
            this._yearLabel = this._dateAdapter.getYearName(this.activeDate);
            var monthNames = this._dateAdapter.getMonthNames('short');
            // First row of months only contains 5 elements so we can fit the year label on the same row.
            this._months = [[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11]].map(function (row) { return row.map(function (month) { return _this._createCellForMonth(month, monthNames[month]); }); });
            this._changeDetectorRef.markForCheck();
        };
        /** Focuses the active cell after the microtask queue is empty. */
        MatYearView.prototype._focusActiveCell = function () {
            this._matCalendarBody._focusActiveCell();
        };
        /**
         * Gets the month in this year that the given Date falls on.
         * Returns null if the given Date is in another year.
         */
        MatYearView.prototype._getMonthInCurrentYear = function (date) {
            return date && this._dateAdapter.getYear(date) == this._dateAdapter.getYear(this.activeDate) ?
                this._dateAdapter.getMonth(date) : null;
        };
        /** Creates an MatCalendarCell for the given month. */
        MatYearView.prototype._createCellForMonth = function (month, monthName) {
            var date = this._dateAdapter.createDate(this._dateAdapter.getYear(this.activeDate), month, 1);
            var ariaLabel = this._dateAdapter.format(date, this._dateFormats.display.monthYearA11yLabel);
            var cellClasses = this.dateClass ? this.dateClass(date, 'year') : undefined;
            return new MatCalendarCell(month, monthName.toLocaleUpperCase(), ariaLabel, this._shouldEnableMonth(month), cellClasses);
        };
        /** Whether the given month is enabled. */
        MatYearView.prototype._shouldEnableMonth = function (month) {
            var activeYear = this._dateAdapter.getYear(this.activeDate);
            if (month === undefined || month === null ||
                this._isYearAndMonthAfterMaxDate(activeYear, month) ||
                this._isYearAndMonthBeforeMinDate(activeYear, month)) {
                return false;
            }
            if (!this.dateFilter) {
                return true;
            }
            var firstOfMonth = this._dateAdapter.createDate(activeYear, month, 1);
            // If any date in the month is enabled count the month as enabled.
            for (var date = firstOfMonth; this._dateAdapter.getMonth(date) == month; date = this._dateAdapter.addCalendarDays(date, 1)) {
                if (this.dateFilter(date)) {
                    return true;
                }
            }
            return false;
        };
        /**
         * Tests whether the combination month/year is after this.maxDate, considering
         * just the month and year of this.maxDate
         */
        MatYearView.prototype._isYearAndMonthAfterMaxDate = function (year, month) {
            if (this.maxDate) {
                var maxYear = this._dateAdapter.getYear(this.maxDate);
                var maxMonth = this._dateAdapter.getMonth(this.maxDate);
                return year > maxYear || (year === maxYear && month > maxMonth);
            }
            return false;
        };
        /**
         * Tests whether the combination month/year is before this.minDate, considering
         * just the month and year of this.minDate
         */
        MatYearView.prototype._isYearAndMonthBeforeMinDate = function (year, month) {
            if (this.minDate) {
                var minYear = this._dateAdapter.getYear(this.minDate);
                var minMonth = this._dateAdapter.getMonth(this.minDate);
                return year < minYear || (year === minYear && month < minMonth);
            }
            return false;
        };
        /** Determines whether the user has the RTL layout direction. */
        MatYearView.prototype._isRtl = function () {
            return this._dir && this._dir.value === 'rtl';
        };
        /** Sets the currently-selected month based on a model value. */
        MatYearView.prototype._setSelectedMonth = function (value) {
            if (value instanceof DateRange) {
                this._selectedMonth = this._getMonthInCurrentYear(value.start) ||
                    this._getMonthInCurrentYear(value.end);
            }
            else {
                this._selectedMonth = this._getMonthInCurrentYear(value);
            }
        };
        return MatYearView;
    }());
    MatYearView.decorators = [
        { type: i0.Component, args: [{
                    selector: 'mat-year-view',
                    template: "<table class=\"mat-calendar-table\" role=\"presentation\">\n  <thead class=\"mat-calendar-table-header\">\n    <tr><th class=\"mat-calendar-table-header-divider\" colspan=\"4\"></th></tr>\n  </thead>\n  <tbody mat-calendar-body\n         [label]=\"_yearLabel\"\n         [rows]=\"_months\"\n         [todayValue]=\"_todayMonth!\"\n         [startValue]=\"_selectedMonth!\"\n         [endValue]=\"_selectedMonth!\"\n         [labelMinRequiredCells]=\"2\"\n         [numCols]=\"4\"\n         [cellAspectRatio]=\"4 / 7\"\n         [activeCell]=\"_dateAdapter.getMonth(activeDate)\"\n         (selectedValueChange)=\"_monthSelected($event)\"\n         (keydown)=\"_handleCalendarBodyKeydown($event)\">\n  </tbody>\n</table>\n",
                    exportAs: 'matYearView',
                    encapsulation: i0.ViewEncapsulation.None,
                    changeDetection: i0.ChangeDetectionStrategy.OnPush
                },] }
    ];
    MatYearView.ctorParameters = function () { return [
        { type: i0.ChangeDetectorRef },
        { type: undefined, decorators: [{ type: i0.Optional }, { type: i0.Inject, args: [core.MAT_DATE_FORMATS,] }] },
        { type: core.DateAdapter, decorators: [{ type: i0.Optional }] },
        { type: bidi.Directionality, decorators: [{ type: i0.Optional }] }
    ]; };
    MatYearView.propDecorators = {
        activeDate: [{ type: i0.Input }],
        selected: [{ type: i0.Input }],
        minDate: [{ type: i0.Input }],
        maxDate: [{ type: i0.Input }],
        dateFilter: [{ type: i0.Input }],
        dateClass: [{ type: i0.Input }],
        selectedChange: [{ type: i0.Output }],
        monthSelected: [{ type: i0.Output }],
        activeDateChange: [{ type: i0.Output }],
        _matCalendarBody: [{ type: i0.ViewChild, args: [MatCalendarBody,] }]
    };

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /** Counter used to generate unique IDs. */
    var uniqueId = 0;
    /** Default header for MatCalendar */
    var MatCalendarHeader = /** @class */ (function () {
        function MatCalendarHeader(_intl, calendar, _dateAdapter, _dateFormats, changeDetectorRef) {
            this._intl = _intl;
            this.calendar = calendar;
            this._dateAdapter = _dateAdapter;
            this._dateFormats = _dateFormats;
            this._buttonDescriptionId = "mat-calendar-button-" + uniqueId++;
            this.calendar.stateChanges.subscribe(function () { return changeDetectorRef.markForCheck(); });
        }
        Object.defineProperty(MatCalendarHeader.prototype, "periodButtonText", {
            /** The label for the current calendar view. */
            get: function () {
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
                var activeYear = this._dateAdapter.getYear(this.calendar.activeDate);
                var minYearOfPage = activeYear - getActiveOffset(this._dateAdapter, this.calendar.activeDate, this.calendar.minDate, this.calendar.maxDate);
                var maxYearOfPage = minYearOfPage + yearsPerPage - 1;
                var minYearName = this._dateAdapter.getYearName(this._dateAdapter.createDate(minYearOfPage, 0, 1));
                var maxYearName = this._dateAdapter.getYearName(this._dateAdapter.createDate(maxYearOfPage, 0, 1));
                return this._intl.formatYearRange(minYearName, maxYearName);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatCalendarHeader.prototype, "periodButtonLabel", {
            get: function () {
                return this.calendar.currentView == 'month' ?
                    this._intl.switchToMultiYearViewLabel : this._intl.switchToMonthViewLabel;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatCalendarHeader.prototype, "prevButtonLabel", {
            /** The label for the previous button. */
            get: function () {
                return {
                    'month': this._intl.prevMonthLabel,
                    'year': this._intl.prevYearLabel,
                    'multi-year': this._intl.prevMultiYearLabel
                }[this.calendar.currentView];
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatCalendarHeader.prototype, "nextButtonLabel", {
            /** The label for the next button. */
            get: function () {
                return {
                    'month': this._intl.nextMonthLabel,
                    'year': this._intl.nextYearLabel,
                    'multi-year': this._intl.nextMultiYearLabel
                }[this.calendar.currentView];
            },
            enumerable: false,
            configurable: true
        });
        /** Handles user clicks on the period label. */
        MatCalendarHeader.prototype.currentPeriodClicked = function () {
            this.calendar.currentView = this.calendar.currentView == 'month' ? 'multi-year' : 'month';
        };
        /** Handles user clicks on the previous button. */
        MatCalendarHeader.prototype.previousClicked = function () {
            this.calendar.activeDate = this.calendar.currentView == 'month' ?
                this._dateAdapter.addCalendarMonths(this.calendar.activeDate, -1) :
                this._dateAdapter.addCalendarYears(this.calendar.activeDate, this.calendar.currentView == 'year' ? -1 : -yearsPerPage);
        };
        /** Handles user clicks on the next button. */
        MatCalendarHeader.prototype.nextClicked = function () {
            this.calendar.activeDate = this.calendar.currentView == 'month' ?
                this._dateAdapter.addCalendarMonths(this.calendar.activeDate, 1) :
                this._dateAdapter.addCalendarYears(this.calendar.activeDate, this.calendar.currentView == 'year' ? 1 : yearsPerPage);
        };
        /** Whether the previous period button is enabled. */
        MatCalendarHeader.prototype.previousEnabled = function () {
            if (!this.calendar.minDate) {
                return true;
            }
            return !this.calendar.minDate ||
                !this._isSameView(this.calendar.activeDate, this.calendar.minDate);
        };
        /** Whether the next period button is enabled. */
        MatCalendarHeader.prototype.nextEnabled = function () {
            return !this.calendar.maxDate ||
                !this._isSameView(this.calendar.activeDate, this.calendar.maxDate);
        };
        /** Whether the two dates represent the same view in the current view mode (month or year). */
        MatCalendarHeader.prototype._isSameView = function (date1, date2) {
            if (this.calendar.currentView == 'month') {
                return this._dateAdapter.getYear(date1) == this._dateAdapter.getYear(date2) &&
                    this._dateAdapter.getMonth(date1) == this._dateAdapter.getMonth(date2);
            }
            if (this.calendar.currentView == 'year') {
                return this._dateAdapter.getYear(date1) == this._dateAdapter.getYear(date2);
            }
            // Otherwise we are in 'multi-year' view.
            return isSameMultiYearView(this._dateAdapter, date1, date2, this.calendar.minDate, this.calendar.maxDate);
        };
        return MatCalendarHeader;
    }());
    MatCalendarHeader.decorators = [
        { type: i0.Component, args: [{
                    selector: 'mat-calendar-header',
                    template: "<div class=\"mat-calendar-header\">\n  <div class=\"mat-calendar-controls\">\n    <button mat-button type=\"button\" class=\"mat-calendar-period-button\"\n            (click)=\"currentPeriodClicked()\" [attr.aria-label]=\"periodButtonLabel\"\n            [attr.aria-describedby]=\"_buttonDescriptionId\"\n            cdkAriaLive=\"polite\">\n      <span [attr.id]=\"_buttonDescriptionId\">{{periodButtonText}}</span>\n      <div class=\"mat-calendar-arrow\"\n           [class.mat-calendar-invert]=\"calendar.currentView !== 'month'\"></div>\n    </button>\n\n    <div class=\"mat-calendar-spacer\"></div>\n\n    <ng-content></ng-content>\n\n    <button mat-icon-button type=\"button\" class=\"mat-calendar-previous-button\"\n            [disabled]=\"!previousEnabled()\" (click)=\"previousClicked()\"\n            [attr.aria-label]=\"prevButtonLabel\">\n    </button>\n\n    <button mat-icon-button type=\"button\" class=\"mat-calendar-next-button\"\n            [disabled]=\"!nextEnabled()\" (click)=\"nextClicked()\"\n            [attr.aria-label]=\"nextButtonLabel\">\n    </button>\n  </div>\n</div>\n",
                    exportAs: 'matCalendarHeader',
                    encapsulation: i0.ViewEncapsulation.None,
                    changeDetection: i0.ChangeDetectionStrategy.OnPush
                },] }
    ];
    MatCalendarHeader.ctorParameters = function () { return [
        { type: MatDatepickerIntl },
        { type: MatCalendar, decorators: [{ type: i0.Inject, args: [i0.forwardRef(function () { return MatCalendar; }),] }] },
        { type: core.DateAdapter, decorators: [{ type: i0.Optional }] },
        { type: undefined, decorators: [{ type: i0.Optional }, { type: i0.Inject, args: [core.MAT_DATE_FORMATS,] }] },
        { type: i0.ChangeDetectorRef }
    ]; };
    /**
     * A calendar that is used as part of the datepicker.
     * @docs-private
     */
    var MatCalendar = /** @class */ (function () {
        function MatCalendar(_intl, _dateAdapter, _dateFormats, _changeDetectorRef) {
            var _this = this;
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
            this.selectedChange = new i0.EventEmitter();
            /**
             * Emits the year chosen in multiyear view.
             * This doesn't imply a change on the selected date.
             */
            this.yearSelected = new i0.EventEmitter();
            /**
             * Emits the month chosen in year view.
             * This doesn't imply a change on the selected date.
             */
            this.monthSelected = new i0.EventEmitter();
            /**
             * Emits when the current view changes.
             */
            this.viewChanged = new i0.EventEmitter(true);
            /** Emits when any date is selected. */
            this._userSelection = new i0.EventEmitter();
            /**
             * Emits whenever there is a state change that the header may need to respond to.
             */
            this.stateChanges = new rxjs.Subject();
            if (typeof ngDevMode === 'undefined' || ngDevMode) {
                if (!this._dateAdapter) {
                    throw createMissingDateImplError('DateAdapter');
                }
                if (!this._dateFormats) {
                    throw createMissingDateImplError('MAT_DATE_FORMATS');
                }
            }
            this._intlChanges = _intl.changes.subscribe(function () {
                _changeDetectorRef.markForCheck();
                _this.stateChanges.next();
            });
        }
        Object.defineProperty(MatCalendar.prototype, "startAt", {
            /** A date representing the period (month or year) to start the calendar in. */
            get: function () { return this._startAt; },
            set: function (value) {
                this._startAt = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value));
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatCalendar.prototype, "selected", {
            /** The currently selected date. */
            get: function () { return this._selected; },
            set: function (value) {
                if (value instanceof DateRange) {
                    this._selected = value;
                }
                else {
                    this._selected = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value));
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatCalendar.prototype, "minDate", {
            /** The minimum selectable date. */
            get: function () { return this._minDate; },
            set: function (value) {
                this._minDate = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value));
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatCalendar.prototype, "maxDate", {
            /** The maximum selectable date. */
            get: function () { return this._maxDate; },
            set: function (value) {
                this._maxDate = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value));
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatCalendar.prototype, "activeDate", {
            /**
             * The current active date. This determines which time period is shown and which date is
             * highlighted when using keyboard navigation.
             */
            get: function () { return this._clampedActiveDate; },
            set: function (value) {
                this._clampedActiveDate = this._dateAdapter.clampDate(value, this.minDate, this.maxDate);
                this.stateChanges.next();
                this._changeDetectorRef.markForCheck();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatCalendar.prototype, "currentView", {
            /** Whether the calendar is in month view. */
            get: function () { return this._currentView; },
            set: function (value) {
                var viewChangedResult = this._currentView !== value ? value : null;
                this._currentView = value;
                this._moveFocusOnNextTick = true;
                this._changeDetectorRef.markForCheck();
                if (viewChangedResult) {
                    this.viewChanged.emit(viewChangedResult);
                }
            },
            enumerable: false,
            configurable: true
        });
        MatCalendar.prototype.ngAfterContentInit = function () {
            this._calendarHeaderPortal = new portal.ComponentPortal(this.headerComponent || MatCalendarHeader);
            this.activeDate = this.startAt || this._dateAdapter.today();
            // Assign to the private property since we don't want to move focus on init.
            this._currentView = this.startView;
        };
        MatCalendar.prototype.ngAfterViewChecked = function () {
            if (this._moveFocusOnNextTick) {
                this._moveFocusOnNextTick = false;
                this.focusActiveCell();
            }
        };
        MatCalendar.prototype.ngOnDestroy = function () {
            this._intlChanges.unsubscribe();
            this.stateChanges.complete();
        };
        MatCalendar.prototype.ngOnChanges = function (changes) {
            var change = changes['minDate'] || changes['maxDate'] || changes['dateFilter'];
            if (change && !change.firstChange) {
                var view = this._getCurrentViewComponent();
                if (view) {
                    // We need to `detectChanges` manually here, because the `minDate`, `maxDate` etc. are
                    // passed down to the view via data bindings which won't be up-to-date when we call `_init`.
                    this._changeDetectorRef.detectChanges();
                    view._init();
                }
            }
            this.stateChanges.next();
        };
        MatCalendar.prototype.focusActiveCell = function () {
            this._getCurrentViewComponent()._focusActiveCell(false);
        };
        /** Updates today's date after an update of the active date */
        MatCalendar.prototype.updateTodaysDate = function () {
            var currentView = this.currentView;
            var view;
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
        };
        /** Handles date selection in the month view. */
        MatCalendar.prototype._dateSelected = function (event) {
            var date = event.value;
            if (this.selected instanceof DateRange ||
                (date && !this._dateAdapter.sameDate(date, this.selected))) {
                this.selectedChange.emit(date);
            }
            this._userSelection.emit(event);
        };
        /** Handles year selection in the multiyear view. */
        MatCalendar.prototype._yearSelectedInMultiYearView = function (normalizedYear) {
            this.yearSelected.emit(normalizedYear);
        };
        /** Handles month selection in the year view. */
        MatCalendar.prototype._monthSelectedInYearView = function (normalizedMonth) {
            this.monthSelected.emit(normalizedMonth);
        };
        /** Handles year/month selection in the multi-year/year views. */
        MatCalendar.prototype._goToDateInView = function (date, view) {
            this.activeDate = date;
            this.currentView = view;
        };
        /** Returns the component instance that corresponds to the current calendar view. */
        MatCalendar.prototype._getCurrentViewComponent = function () {
            return this.monthView || this.yearView || this.multiYearView;
        };
        return MatCalendar;
    }());
    MatCalendar.decorators = [
        { type: i0.Component, args: [{
                    selector: 'mat-calendar',
                    template: "<ng-template [cdkPortalOutlet]=\"_calendarHeaderPortal\"></ng-template>\n\n<div class=\"mat-calendar-content\" [ngSwitch]=\"currentView\" cdkMonitorSubtreeFocus tabindex=\"-1\">\n  <mat-month-view\n      *ngSwitchCase=\"'month'\"\n      [(activeDate)]=\"activeDate\"\n      [selected]=\"selected\"\n      [dateFilter]=\"dateFilter\"\n      [maxDate]=\"maxDate\"\n      [minDate]=\"minDate\"\n      [dateClass]=\"dateClass\"\n      [comparisonStart]=\"comparisonStart\"\n      [comparisonEnd]=\"comparisonEnd\"\n      (_userSelection)=\"_dateSelected($event)\">\n  </mat-month-view>\n\n  <mat-year-view\n      *ngSwitchCase=\"'year'\"\n      [(activeDate)]=\"activeDate\"\n      [selected]=\"selected\"\n      [dateFilter]=\"dateFilter\"\n      [maxDate]=\"maxDate\"\n      [minDate]=\"minDate\"\n      [dateClass]=\"dateClass\"\n      (monthSelected)=\"_monthSelectedInYearView($event)\"\n      (selectedChange)=\"_goToDateInView($event, 'month')\">\n  </mat-year-view>\n\n  <mat-multi-year-view\n      *ngSwitchCase=\"'multi-year'\"\n      [(activeDate)]=\"activeDate\"\n      [selected]=\"selected\"\n      [dateFilter]=\"dateFilter\"\n      [maxDate]=\"maxDate\"\n      [minDate]=\"minDate\"\n      [dateClass]=\"dateClass\"\n      (yearSelected)=\"_yearSelectedInMultiYearView($event)\"\n      (selectedChange)=\"_goToDateInView($event, 'year')\">\n  </mat-multi-year-view>\n</div>\n",
                    host: {
                        'class': 'mat-calendar',
                    },
                    exportAs: 'matCalendar',
                    encapsulation: i0.ViewEncapsulation.None,
                    changeDetection: i0.ChangeDetectionStrategy.OnPush,
                    providers: [MAT_SINGLE_DATE_SELECTION_MODEL_PROVIDER],
                    styles: [".mat-calendar{display:block}.mat-calendar-header{padding:8px 8px 0 8px}.mat-calendar-content{padding:0 8px 8px 8px;outline:none}.mat-calendar-controls{display:flex;margin:5% calc(33% / 7 - 16px)}.mat-calendar-controls .mat-icon-button:hover .mat-button-focus-overlay{opacity:.04}.mat-calendar-spacer{flex:1 1 auto}.mat-calendar-period-button{min-width:0}.mat-calendar-arrow{display:inline-block;width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top-width:5px;border-top-style:solid;margin:0 0 0 5px;vertical-align:middle}.mat-calendar-arrow.mat-calendar-invert{transform:rotate(180deg)}[dir=rtl] .mat-calendar-arrow{margin:0 5px 0 0}.mat-calendar-previous-button,.mat-calendar-next-button{position:relative}.mat-calendar-previous-button::after,.mat-calendar-next-button::after{top:0;left:0;right:0;bottom:0;position:absolute;content:\"\";margin:15.5px;border:0 solid currentColor;border-top-width:2px}[dir=rtl] .mat-calendar-previous-button,[dir=rtl] .mat-calendar-next-button{transform:rotate(180deg)}.mat-calendar-previous-button::after{border-left-width:2px;transform:translateX(2px) rotate(-45deg)}.mat-calendar-next-button::after{border-right-width:2px;transform:translateX(-2px) rotate(45deg)}.mat-calendar-table{border-spacing:0;border-collapse:collapse;width:100%}.mat-calendar-table-header th{text-align:center;padding:0 0 8px 0}.mat-calendar-table-header-divider{position:relative;height:1px}.mat-calendar-table-header-divider::after{content:\"\";position:absolute;top:0;left:-8px;right:-8px;height:1px}\n"]
                },] }
    ];
    MatCalendar.ctorParameters = function () { return [
        { type: MatDatepickerIntl },
        { type: core.DateAdapter, decorators: [{ type: i0.Optional }] },
        { type: undefined, decorators: [{ type: i0.Optional }, { type: i0.Inject, args: [core.MAT_DATE_FORMATS,] }] },
        { type: i0.ChangeDetectorRef }
    ]; };
    MatCalendar.propDecorators = {
        headerComponent: [{ type: i0.Input }],
        startAt: [{ type: i0.Input }],
        startView: [{ type: i0.Input }],
        selected: [{ type: i0.Input }],
        minDate: [{ type: i0.Input }],
        maxDate: [{ type: i0.Input }],
        dateFilter: [{ type: i0.Input }],
        dateClass: [{ type: i0.Input }],
        comparisonStart: [{ type: i0.Input }],
        comparisonEnd: [{ type: i0.Input }],
        selectedChange: [{ type: i0.Output }],
        yearSelected: [{ type: i0.Output }],
        monthSelected: [{ type: i0.Output }],
        viewChanged: [{ type: i0.Output }],
        _userSelection: [{ type: i0.Output }],
        monthView: [{ type: i0.ViewChild, args: [MatMonthView,] }],
        yearView: [{ type: i0.ViewChild, args: [MatYearView,] }],
        multiYearView: [{ type: i0.ViewChild, args: [MatMultiYearView,] }]
    };

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /**
     * Animations used by the Material datepicker.
     * @docs-private
     */
    var matDatepickerAnimations = {
        /** Transforms the height of the datepicker's calendar. */
        transformPanel: animations.trigger('transformPanel', [
            animations.transition('void => enter-dropdown', animations.animate('120ms cubic-bezier(0, 0, 0.2, 1)', animations.keyframes([
                animations.style({ opacity: 0, transform: 'scale(1, 0.8)' }),
                animations.style({ opacity: 1, transform: 'scale(1, 1)' })
            ]))),
            animations.transition('void => enter-dialog', animations.animate('150ms cubic-bezier(0, 0, 0.2, 1)', animations.keyframes([
                animations.style({ opacity: 0, transform: 'scale(0.7)' }),
                animations.style({ transform: 'none', opacity: 1 })
            ]))),
            animations.transition('* => void', animations.animate('100ms linear', animations.style({ opacity: 0 })))
        ]),
        /** Fades in the content of the calendar. */
        fadeInCalendar: animations.trigger('fadeInCalendar', [
            animations.state('void', animations.style({ opacity: 0 })),
            animations.state('enter', animations.style({ opacity: 1 })),
            // TODO(crisbeto): this animation should be removed since it isn't quite on spec, but we
            // need to keep it until #12440 gets in, otherwise the exit animation will look glitchy.
            animations.transition('void => *', animations.animate('120ms 100ms cubic-bezier(0.55, 0, 0.55, 0.2)'))
        ])
    };

    /** Used to generate a unique ID for each datepicker instance. */
    var datepickerUid = 0;
    /** Injection token that determines the scroll handling while the calendar is open. */
    var MAT_DATEPICKER_SCROLL_STRATEGY = new i0.InjectionToken('mat-datepicker-scroll-strategy');
    /** @docs-private */
    function MAT_DATEPICKER_SCROLL_STRATEGY_FACTORY(overlay) {
        return function () { return overlay.scrollStrategies.reposition(); };
    }
    /** @docs-private */
    var MAT_DATEPICKER_SCROLL_STRATEGY_FACTORY_PROVIDER = {
        provide: MAT_DATEPICKER_SCROLL_STRATEGY,
        deps: [overlay.Overlay],
        useFactory: MAT_DATEPICKER_SCROLL_STRATEGY_FACTORY,
    };
    // Boilerplate for applying mixins to MatDatepickerContent.
    /** @docs-private */
    var MatDatepickerContentBase = /** @class */ (function () {
        function MatDatepickerContentBase(_elementRef) {
            this._elementRef = _elementRef;
        }
        return MatDatepickerContentBase;
    }());
    var _MatDatepickerContentMixinBase = core.mixinColor(MatDatepickerContentBase);
    /**
     * Component used as the content for the datepicker overlay. We use this instead of using
     * MatCalendar directly as the content so we can control the initial focus. This also gives us a
     * place to put additional features of the overlay that are not part of the calendar itself in the
     * future. (e.g. confirmation buttons).
     * @docs-private
     */
    var MatDatepickerContent = /** @class */ (function (_super) {
        __extends(MatDatepickerContent, _super);
        function MatDatepickerContent(elementRef, _changeDetectorRef, _globalModel, _dateAdapter, _rangeSelectionStrategy, intl) {
            var _this = _super.call(this, elementRef) || this;
            _this._changeDetectorRef = _changeDetectorRef;
            _this._globalModel = _globalModel;
            _this._dateAdapter = _dateAdapter;
            _this._rangeSelectionStrategy = _rangeSelectionStrategy;
            _this._subscriptions = new rxjs.Subscription();
            /** Emits when an animation has finished. */
            _this._animationDone = new rxjs.Subject();
            /** Portal with projected action buttons. */
            _this._actionsPortal = null;
            _this._closeButtonText = intl.closeCalendarLabel;
            return _this;
        }
        MatDatepickerContent.prototype.ngOnInit = function () {
            // If we have actions, clone the model so that we have the ability to cancel the selection,
            // otherwise update the global model directly. Note that we want to assign this as soon as
            // possible, but `_actionsPortal` isn't available in the constructor so we do it in `ngOnInit`.
            this._model = this._actionsPortal ? this._globalModel.clone() : this._globalModel;
            this._animationState = this.datepicker.touchUi ? 'enter-dialog' : 'enter-dropdown';
        };
        MatDatepickerContent.prototype.ngAfterViewInit = function () {
            var _this = this;
            this._subscriptions.add(this.datepicker.stateChanges.subscribe(function () {
                _this._changeDetectorRef.markForCheck();
            }));
            this._calendar.focusActiveCell();
        };
        MatDatepickerContent.prototype.ngOnDestroy = function () {
            this._subscriptions.unsubscribe();
            this._animationDone.complete();
        };
        MatDatepickerContent.prototype._handleUserSelection = function (event) {
            var selection = this._model.selection;
            var value = event.value;
            var isRange = selection instanceof DateRange;
            // If we're selecting a range and we have a selection strategy, always pass the value through
            // there. Otherwise don't assign null values to the model, unless we're selecting a range.
            // A null value when picking a range means that the user cancelled the selection (e.g. by
            // pressing escape), whereas when selecting a single value it means that the value didn't
            // change. This isn't very intuitive, but it's here for backwards-compatibility.
            if (isRange && this._rangeSelectionStrategy) {
                var newSelection = this._rangeSelectionStrategy.selectionFinished(value, selection, event.event);
                this._model.updateSelection(newSelection, this);
            }
            else if (value && (isRange ||
                !this._dateAdapter.sameDate(value, selection))) {
                this._model.add(value);
            }
            // Delegate closing the overlay to the actions.
            if ((!this._model || this._model.isComplete()) && !this._actionsPortal) {
                this.datepicker.close();
            }
        };
        MatDatepickerContent.prototype._startExitAnimation = function () {
            this._animationState = 'void';
            this._changeDetectorRef.markForCheck();
        };
        MatDatepickerContent.prototype._getSelected = function () {
            return this._model.selection;
        };
        /** Applies the current pending selection to the global model. */
        MatDatepickerContent.prototype._applyPendingSelection = function () {
            if (this._model !== this._globalModel) {
                this._globalModel.updateSelection(this._model.selection, this);
            }
        };
        return MatDatepickerContent;
    }(_MatDatepickerContentMixinBase));
    MatDatepickerContent.decorators = [
        { type: i0.Component, args: [{
                    selector: 'mat-datepicker-content',
                    template: "<div\n  cdkTrapFocus\n  class=\"mat-datepicker-content-container\"\n  [class.mat-datepicker-content-container-with-actions]=\"_actionsPortal\">\n  <mat-calendar\n    [id]=\"datepicker.id\"\n    [ngClass]=\"datepicker.panelClass\"\n    [startAt]=\"datepicker.startAt\"\n    [startView]=\"datepicker.startView\"\n    [minDate]=\"datepicker._getMinDate()\"\n    [maxDate]=\"datepicker._getMaxDate()\"\n    [dateFilter]=\"datepicker._getDateFilter()\"\n    [headerComponent]=\"datepicker.calendarHeaderComponent\"\n    [selected]=\"_getSelected()\"\n    [dateClass]=\"datepicker.dateClass\"\n    [comparisonStart]=\"comparisonStart\"\n    [comparisonEnd]=\"comparisonEnd\"\n    [@fadeInCalendar]=\"'enter'\"\n    (yearSelected)=\"datepicker._selectYear($event)\"\n    (monthSelected)=\"datepicker._selectMonth($event)\"\n    (viewChanged)=\"datepicker._viewChanged($event)\"\n    (_userSelection)=\"_handleUserSelection($event)\"></mat-calendar>\n\n  <ng-template [cdkPortalOutlet]=\"_actionsPortal\"></ng-template>\n\n  <!-- Invisible close button for screen reader users. -->\n  <button\n    type=\"button\"\n    mat-raised-button\n    [color]=\"color || 'primary'\"\n    class=\"mat-datepicker-close-button\"\n    [class.cdk-visually-hidden]=\"!_closeButtonFocused\"\n    (focus)=\"_closeButtonFocused = true\"\n    (blur)=\"_closeButtonFocused = false\"\n    (click)=\"datepicker.close()\">{{ _closeButtonText }}</button>\n</div>\n",
                    host: {
                        'class': 'mat-datepicker-content',
                        '[@transformPanel]': '_animationState',
                        '(@transformPanel.done)': '_animationDone.next()',
                        '[class.mat-datepicker-content-touch]': 'datepicker.touchUi',
                    },
                    animations: [
                        matDatepickerAnimations.transformPanel,
                        matDatepickerAnimations.fadeInCalendar,
                    ],
                    exportAs: 'matDatepickerContent',
                    encapsulation: i0.ViewEncapsulation.None,
                    changeDetection: i0.ChangeDetectionStrategy.OnPush,
                    inputs: ['color'],
                    styles: [".mat-datepicker-content{display:block;border-radius:4px}.mat-datepicker-content .mat-calendar{width:296px;height:354px}.mat-datepicker-content .mat-datepicker-close-button{position:absolute;top:100%;left:0;margin-top:8px}.ng-animating .mat-datepicker-content .mat-datepicker-close-button{display:none}.mat-datepicker-content-container{display:flex;flex-direction:column;justify-content:space-between}.mat-datepicker-content-touch{display:block;max-height:80vh;position:relative;overflow:visible}.mat-datepicker-content-touch .mat-datepicker-content-container{min-height:312px;max-height:788px;min-width:250px;max-width:750px}.mat-datepicker-content-touch .mat-calendar{width:100%;height:auto}@media all and (orientation: landscape){.mat-datepicker-content-touch .mat-datepicker-content-container{width:64vh;height:80vh}}@media all and (orientation: portrait){.mat-datepicker-content-touch .mat-datepicker-content-container{width:80vw;height:100vw}.mat-datepicker-content-touch .mat-datepicker-content-container-with-actions{height:115vw}}\n"]
                },] }
    ];
    MatDatepickerContent.ctorParameters = function () { return [
        { type: i0.ElementRef },
        { type: i0.ChangeDetectorRef },
        { type: MatDateSelectionModel },
        { type: core.DateAdapter },
        { type: undefined, decorators: [{ type: i0.Optional }, { type: i0.Inject, args: [MAT_DATE_RANGE_SELECTION_STRATEGY,] }] },
        { type: MatDatepickerIntl }
    ]; };
    MatDatepickerContent.propDecorators = {
        _calendar: [{ type: i0.ViewChild, args: [MatCalendar,] }]
    };
    /** Base class for a datepicker. */
    var MatDatepickerBase = /** @class */ (function () {
        function MatDatepickerBase(
        /**
         * @deprecated `_dialog` parameter is no longer being used and it will be removed.
         * @breaking-change 13.0.0
         */
        _dialog, _overlay, _ngZone, _viewContainerRef, scrollStrategy, _dateAdapter, _dir, 
        /**
         * @deprecated No longer being used. To be removed.
         * @breaking-change 13.0.0
         */
        _document, _model) {
            this._overlay = _overlay;
            this._ngZone = _ngZone;
            this._viewContainerRef = _viewContainerRef;
            this._dateAdapter = _dateAdapter;
            this._dir = _dir;
            this._model = _model;
            this._inputStateChanges = rxjs.Subscription.EMPTY;
            /** The view that the calendar should start in. */
            this.startView = 'month';
            this._touchUi = false;
            /** Preferred position of the datepicker in the X axis. */
            this.xPosition = 'start';
            /** Preferred position of the datepicker in the Y axis. */
            this.yPosition = 'below';
            this._restoreFocus = true;
            /**
             * Emits selected year in multiyear view.
             * This doesn't imply a change on the selected date.
             */
            this.yearSelected = new i0.EventEmitter();
            /**
             * Emits selected month in year view.
             * This doesn't imply a change on the selected date.
             */
            this.monthSelected = new i0.EventEmitter();
            /**
             * Emits when the current view changes.
             */
            this.viewChanged = new i0.EventEmitter(true);
            /** Emits when the datepicker has been opened. */
            this.openedStream = new i0.EventEmitter();
            /** Emits when the datepicker has been closed. */
            this.closedStream = new i0.EventEmitter();
            this._opened = false;
            /** The id for the datepicker calendar. */
            this.id = "mat-datepicker-" + datepickerUid++;
            /** The element that was focused before the datepicker was opened. */
            this._focusedElementBeforeOpen = null;
            /** Unique class that will be added to the backdrop so that the test harnesses can look it up. */
            this._backdropHarnessClass = this.id + "-backdrop";
            /** Emits when the datepicker's state changes. */
            this.stateChanges = new rxjs.Subject();
            if (!this._dateAdapter && (typeof ngDevMode === 'undefined' || ngDevMode)) {
                throw createMissingDateImplError('DateAdapter');
            }
            this._scrollStrategy = scrollStrategy;
        }
        Object.defineProperty(MatDatepickerBase.prototype, "startAt", {
            /** The date to open the calendar to initially. */
            get: function () {
                // If an explicit startAt is set we start there, otherwise we start at whatever the currently
                // selected value is.
                return this._startAt || (this.datepickerInput ? this.datepickerInput.getStartValue() : null);
            },
            set: function (value) {
                this._startAt = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value));
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatDatepickerBase.prototype, "color", {
            /** Color palette to use on the datepicker's calendar. */
            get: function () {
                return this._color ||
                    (this.datepickerInput ? this.datepickerInput.getThemePalette() : undefined);
            },
            set: function (value) {
                this._color = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatDatepickerBase.prototype, "touchUi", {
            /**
             * Whether the calendar UI is in touch mode. In touch mode the calendar opens in a dialog rather
             * than a dropdown and elements have more padding to allow for bigger touch targets.
             */
            get: function () { return this._touchUi; },
            set: function (value) {
                this._touchUi = coercion.coerceBooleanProperty(value);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatDatepickerBase.prototype, "disabled", {
            /** Whether the datepicker pop-up should be disabled. */
            get: function () {
                return this._disabled === undefined && this.datepickerInput ?
                    this.datepickerInput.disabled : !!this._disabled;
            },
            set: function (value) {
                var newValue = coercion.coerceBooleanProperty(value);
                if (newValue !== this._disabled) {
                    this._disabled = newValue;
                    this.stateChanges.next(undefined);
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatDatepickerBase.prototype, "restoreFocus", {
            /**
             * Whether to restore focus to the previously-focused element when the calendar is closed.
             * Note that automatic focus restoration is an accessibility feature and it is recommended that
             * you provide your own equivalent, if you decide to turn it off.
             */
            get: function () { return this._restoreFocus; },
            set: function (value) {
                this._restoreFocus = coercion.coerceBooleanProperty(value);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatDatepickerBase.prototype, "panelClass", {
            /**
             * Classes to be passed to the date picker panel.
             * Supports string and string array values, similar to `ngClass`.
             */
            get: function () { return this._panelClass; },
            set: function (value) {
                this._panelClass = coercion.coerceStringArray(value);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatDatepickerBase.prototype, "opened", {
            /** Whether the calendar is open. */
            get: function () { return this._opened; },
            set: function (value) {
                coercion.coerceBooleanProperty(value) ? this.open() : this.close();
            },
            enumerable: false,
            configurable: true
        });
        /** The minimum selectable date. */
        MatDatepickerBase.prototype._getMinDate = function () {
            return this.datepickerInput && this.datepickerInput.min;
        };
        /** The maximum selectable date. */
        MatDatepickerBase.prototype._getMaxDate = function () {
            return this.datepickerInput && this.datepickerInput.max;
        };
        MatDatepickerBase.prototype._getDateFilter = function () {
            return this.datepickerInput && this.datepickerInput.dateFilter;
        };
        MatDatepickerBase.prototype.ngOnChanges = function (changes) {
            var positionChange = changes['xPosition'] || changes['yPosition'];
            if (positionChange && !positionChange.firstChange && this._overlayRef) {
                var positionStrategy = this._overlayRef.getConfig().positionStrategy;
                if (positionStrategy instanceof overlay.FlexibleConnectedPositionStrategy) {
                    this._setConnectedPositions(positionStrategy);
                    if (this.opened) {
                        this._overlayRef.updatePosition();
                    }
                }
            }
            this.stateChanges.next(undefined);
        };
        MatDatepickerBase.prototype.ngOnDestroy = function () {
            this._destroyOverlay();
            this.close();
            this._inputStateChanges.unsubscribe();
            this.stateChanges.complete();
        };
        /** Selects the given date */
        MatDatepickerBase.prototype.select = function (date) {
            this._model.add(date);
        };
        /** Emits the selected year in multiyear view */
        MatDatepickerBase.prototype._selectYear = function (normalizedYear) {
            this.yearSelected.emit(normalizedYear);
        };
        /** Emits selected month in year view */
        MatDatepickerBase.prototype._selectMonth = function (normalizedMonth) {
            this.monthSelected.emit(normalizedMonth);
        };
        /** Emits changed view */
        MatDatepickerBase.prototype._viewChanged = function (view) {
            this.viewChanged.emit(view);
        };
        /**
         * Register an input with this datepicker.
         * @param input The datepicker input to register with this datepicker.
         * @returns Selection model that the input should hook itself up to.
         */
        MatDatepickerBase.prototype.registerInput = function (input) {
            var _this = this;
            if (this.datepickerInput && (typeof ngDevMode === 'undefined' || ngDevMode)) {
                throw Error('A MatDatepicker can only be associated with a single input.');
            }
            this._inputStateChanges.unsubscribe();
            this.datepickerInput = input;
            this._inputStateChanges =
                input.stateChanges.subscribe(function () { return _this.stateChanges.next(undefined); });
            return this._model;
        };
        /**
         * Registers a portal containing action buttons with the datepicker.
         * @param portal Portal to be registered.
         */
        MatDatepickerBase.prototype.registerActions = function (portal) {
            if (this._actionsPortal && (typeof ngDevMode === 'undefined' || ngDevMode)) {
                throw Error('A MatDatepicker can only be associated with a single actions row.');
            }
            this._actionsPortal = portal;
        };
        /**
         * Removes a portal containing action buttons from the datepicker.
         * @param portal Portal to be removed.
         */
        MatDatepickerBase.prototype.removeActions = function (portal) {
            if (portal === this._actionsPortal) {
                this._actionsPortal = null;
            }
        };
        /** Open the calendar. */
        MatDatepickerBase.prototype.open = function () {
            if (this._opened || this.disabled) {
                return;
            }
            if (!this.datepickerInput && (typeof ngDevMode === 'undefined' || ngDevMode)) {
                throw Error('Attempted to open an MatDatepicker with no associated input.');
            }
            this._focusedElementBeforeOpen = platform._getFocusedElementPierceShadowDom();
            this._openOverlay();
            this._opened = true;
            this.openedStream.emit();
        };
        /** Close the calendar. */
        MatDatepickerBase.prototype.close = function () {
            var _this = this;
            if (!this._opened) {
                return;
            }
            if (this._componentRef) {
                var instance = this._componentRef.instance;
                instance._startExitAnimation();
                instance._animationDone.pipe(operators.take(1)).subscribe(function () { return _this._destroyOverlay(); });
            }
            var completeClose = function () {
                // The `_opened` could've been reset already if
                // we got two events in quick succession.
                if (_this._opened) {
                    _this._opened = false;
                    _this.closedStream.emit();
                    _this._focusedElementBeforeOpen = null;
                }
            };
            if (this._restoreFocus && this._focusedElementBeforeOpen &&
                typeof this._focusedElementBeforeOpen.focus === 'function') {
                // Because IE moves focus asynchronously, we can't count on it being restored before we've
                // marked the datepicker as closed. If the event fires out of sequence and the element that
                // we're refocusing opens the datepicker on focus, the user could be stuck with not being
                // able to close the calendar at all. We work around it by making the logic, that marks
                // the datepicker as closed, async as well.
                this._focusedElementBeforeOpen.focus();
                setTimeout(completeClose);
            }
            else {
                completeClose();
            }
        };
        /** Applies the current pending selection on the overlay to the model. */
        MatDatepickerBase.prototype._applyPendingSelection = function () {
            var _a, _b;
            (_b = (_a = this._componentRef) === null || _a === void 0 ? void 0 : _a.instance) === null || _b === void 0 ? void 0 : _b._applyPendingSelection();
        };
        /** Forwards relevant values from the datepicker to the datepicker content inside the overlay. */
        MatDatepickerBase.prototype._forwardContentValues = function (instance) {
            instance.datepicker = this;
            instance.color = this.color;
            instance._actionsPortal = this._actionsPortal;
        };
        /** Opens the overlay with the calendar. */
        MatDatepickerBase.prototype._openOverlay = function () {
            var _this = this;
            this._destroyOverlay();
            var isDialog = this.touchUi;
            var labelId = this.datepickerInput.getOverlayLabelId();
            var portal$1 = new portal.ComponentPortal(MatDatepickerContent, this._viewContainerRef);
            var overlayRef = this._overlayRef = this._overlay.create(new overlay.OverlayConfig({
                positionStrategy: isDialog ? this._getDialogStrategy() : this._getDropdownStrategy(),
                hasBackdrop: true,
                backdropClass: [
                    isDialog ? 'cdk-overlay-dark-backdrop' : 'mat-overlay-transparent-backdrop',
                    this._backdropHarnessClass
                ],
                direction: this._dir,
                scrollStrategy: isDialog ? this._overlay.scrollStrategies.block() : this._scrollStrategy(),
                panelClass: "mat-datepicker-" + (isDialog ? 'dialog' : 'popup'),
            }));
            var overlayElement = overlayRef.overlayElement;
            overlayElement.setAttribute('role', 'dialog');
            if (labelId) {
                overlayElement.setAttribute('aria-labelledby', labelId);
            }
            if (isDialog) {
                overlayElement.setAttribute('aria-modal', 'true');
            }
            this._getCloseStream(overlayRef).subscribe(function (event) {
                if (event) {
                    event.preventDefault();
                }
                _this.close();
            });
            this._componentRef = overlayRef.attach(portal$1);
            this._forwardContentValues(this._componentRef.instance);
            // Update the position once the calendar has rendered. Only relevant in dropdown mode.
            if (!isDialog) {
                this._ngZone.onStable.pipe(operators.take(1)).subscribe(function () { return overlayRef.updatePosition(); });
            }
        };
        /** Destroys the current overlay. */
        MatDatepickerBase.prototype._destroyOverlay = function () {
            if (this._overlayRef) {
                this._overlayRef.dispose();
                this._overlayRef = this._componentRef = null;
            }
        };
        /** Gets a position strategy that will open the calendar as a dropdown. */
        MatDatepickerBase.prototype._getDialogStrategy = function () {
            return this._overlay.position().global().centerHorizontally().centerVertically();
        };
        /** Gets a position strategy that will open the calendar as a dropdown. */
        MatDatepickerBase.prototype._getDropdownStrategy = function () {
            var strategy = this._overlay.position()
                .flexibleConnectedTo(this.datepickerInput.getConnectedOverlayOrigin())
                .withTransformOriginOn('.mat-datepicker-content')
                .withFlexibleDimensions(false)
                .withViewportMargin(8)
                .withLockedPosition();
            return this._setConnectedPositions(strategy);
        };
        /** Sets the positions of the datepicker in dropdown mode based on the current configuration. */
        MatDatepickerBase.prototype._setConnectedPositions = function (strategy) {
            var primaryX = this.xPosition === 'end' ? 'end' : 'start';
            var secondaryX = primaryX === 'start' ? 'end' : 'start';
            var primaryY = this.yPosition === 'above' ? 'bottom' : 'top';
            var secondaryY = primaryY === 'top' ? 'bottom' : 'top';
            return strategy.withPositions([
                {
                    originX: primaryX,
                    originY: secondaryY,
                    overlayX: primaryX,
                    overlayY: primaryY
                },
                {
                    originX: primaryX,
                    originY: primaryY,
                    overlayX: primaryX,
                    overlayY: secondaryY
                },
                {
                    originX: secondaryX,
                    originY: secondaryY,
                    overlayX: secondaryX,
                    overlayY: primaryY
                },
                {
                    originX: secondaryX,
                    originY: primaryY,
                    overlayX: secondaryX,
                    overlayY: secondaryY
                }
            ]);
        };
        /** Gets an observable that will emit when the overlay is supposed to be closed. */
        MatDatepickerBase.prototype._getCloseStream = function (overlayRef) {
            var _this = this;
            return rxjs.merge(overlayRef.backdropClick(), overlayRef.detachments(), overlayRef.keydownEvents().pipe(operators.filter(function (event) {
                // Closing on alt + up is only valid when there's an input associated with the datepicker.
                return (event.keyCode === keycodes.ESCAPE && !keycodes.hasModifierKey(event)) || (_this.datepickerInput &&
                    keycodes.hasModifierKey(event, 'altKey') && event.keyCode === keycodes.UP_ARROW);
            })));
        };
        return MatDatepickerBase;
    }());
    MatDatepickerBase.decorators = [
        { type: i0.Directive }
    ];
    MatDatepickerBase.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: i0.Inject, args: [i0.ElementRef,] }] },
        { type: overlay.Overlay },
        { type: i0.NgZone },
        { type: i0.ViewContainerRef },
        { type: undefined, decorators: [{ type: i0.Inject, args: [MAT_DATEPICKER_SCROLL_STRATEGY,] }] },
        { type: core.DateAdapter, decorators: [{ type: i0.Optional }] },
        { type: bidi.Directionality, decorators: [{ type: i0.Optional }] },
        { type: undefined, decorators: [{ type: i0.Optional }, { type: i0.Inject, args: [common.DOCUMENT,] }] },
        { type: MatDateSelectionModel }
    ]; };
    MatDatepickerBase.propDecorators = {
        calendarHeaderComponent: [{ type: i0.Input }],
        startAt: [{ type: i0.Input }],
        startView: [{ type: i0.Input }],
        color: [{ type: i0.Input }],
        touchUi: [{ type: i0.Input }],
        disabled: [{ type: i0.Input }],
        xPosition: [{ type: i0.Input }],
        yPosition: [{ type: i0.Input }],
        restoreFocus: [{ type: i0.Input }],
        yearSelected: [{ type: i0.Output }],
        monthSelected: [{ type: i0.Output }],
        viewChanged: [{ type: i0.Output }],
        dateClass: [{ type: i0.Input }],
        openedStream: [{ type: i0.Output, args: ['opened',] }],
        closedStream: [{ type: i0.Output, args: ['closed',] }],
        panelClass: [{ type: i0.Input }],
        opened: [{ type: i0.Input }]
    };

    // TODO(mmalerba): We use a component instead of a directive here so the user can use implicit
    // template reference variables (e.g. #d vs #d="matDatepicker"). We can change this to a directive
    // if angular adds support for `exportAs: '$implicit'` on directives.
    /** Component responsible for managing the datepicker popup/dialog. */
    var MatDatepicker = /** @class */ (function (_super) {
        __extends(MatDatepicker, _super);
        function MatDatepicker() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return MatDatepicker;
    }(MatDatepickerBase));
    MatDatepicker.decorators = [
        { type: i0.Component, args: [{
                    selector: 'mat-datepicker',
                    template: '',
                    exportAs: 'matDatepicker',
                    changeDetection: i0.ChangeDetectionStrategy.OnPush,
                    encapsulation: i0.ViewEncapsulation.None,
                    providers: [
                        MAT_SINGLE_DATE_SELECTION_MODEL_PROVIDER,
                        { provide: MatDatepickerBase, useExisting: MatDatepicker },
                    ]
                },] }
    ];

    /**
     * An event used for datepicker input and change events. We don't always have access to a native
     * input or change event because the event may have been triggered by the user clicking on the
     * calendar popup. For consistency, we always use MatDatepickerInputEvent instead.
     */
    var MatDatepickerInputEvent = /** @class */ (function () {
        function MatDatepickerInputEvent(
        /** Reference to the datepicker input component that emitted the event. */
        target, 
        /** Reference to the native input element associated with the datepicker input. */
        targetElement) {
            this.target = target;
            this.targetElement = targetElement;
            this.value = this.target.value;
        }
        return MatDatepickerInputEvent;
    }());
    /** Base class for datepicker inputs. */
    var MatDatepickerInputBase = /** @class */ (function () {
        function MatDatepickerInputBase(_elementRef, _dateAdapter, _dateFormats) {
            var _this = this;
            this._elementRef = _elementRef;
            this._dateAdapter = _dateAdapter;
            this._dateFormats = _dateFormats;
            /** Emits when a `change` event is fired on this `<input>`. */
            this.dateChange = new i0.EventEmitter();
            /** Emits when an `input` event is fired on this `<input>`. */
            this.dateInput = new i0.EventEmitter();
            /** Emits when the internal state has changed */
            this.stateChanges = new rxjs.Subject();
            this._onTouched = function () { };
            this._validatorOnChange = function () { };
            this._cvaOnChange = function () { };
            this._valueChangesSubscription = rxjs.Subscription.EMPTY;
            this._localeSubscription = rxjs.Subscription.EMPTY;
            /** The form control validator for whether the input parses. */
            this._parseValidator = function () {
                return _this._lastValueValid ?
                    null : { 'matDatepickerParse': { 'text': _this._elementRef.nativeElement.value } };
            };
            /** The form control validator for the date filter. */
            this._filterValidator = function (control) {
                var controlValue = _this._dateAdapter.getValidDateOrNull(_this._dateAdapter.deserialize(control.value));
                return !controlValue || _this._matchesFilter(controlValue) ?
                    null : { 'matDatepickerFilter': true };
            };
            /** The form control validator for the min date. */
            this._minValidator = function (control) {
                var controlValue = _this._dateAdapter.getValidDateOrNull(_this._dateAdapter.deserialize(control.value));
                var min = _this._getMinDate();
                return (!min || !controlValue ||
                    _this._dateAdapter.compareDate(min, controlValue) <= 0) ?
                    null : { 'matDatepickerMin': { 'min': min, 'actual': controlValue } };
            };
            /** The form control validator for the max date. */
            this._maxValidator = function (control) {
                var controlValue = _this._dateAdapter.getValidDateOrNull(_this._dateAdapter.deserialize(control.value));
                var max = _this._getMaxDate();
                return (!max || !controlValue ||
                    _this._dateAdapter.compareDate(max, controlValue) >= 0) ?
                    null : { 'matDatepickerMax': { 'max': max, 'actual': controlValue } };
            };
            /** Whether the last value set on the input was valid. */
            this._lastValueValid = false;
            if (typeof ngDevMode === 'undefined' || ngDevMode) {
                if (!this._dateAdapter) {
                    throw createMissingDateImplError('DateAdapter');
                }
                if (!this._dateFormats) {
                    throw createMissingDateImplError('MAT_DATE_FORMATS');
                }
            }
            // Update the displayed date when the locale changes.
            this._localeSubscription = _dateAdapter.localeChanges.subscribe(function () {
                _this._assignValueProgrammatically(_this.value);
            });
        }
        Object.defineProperty(MatDatepickerInputBase.prototype, "value", {
            /** The value of the input. */
            get: function () {
                return this._model ? this._getValueFromModel(this._model.selection) : this._pendingValue;
            },
            set: function (value) {
                this._assignValueProgrammatically(value);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatDatepickerInputBase.prototype, "disabled", {
            /** Whether the datepicker-input is disabled. */
            get: function () { return !!this._disabled || this._parentDisabled(); },
            set: function (value) {
                var newValue = coercion.coerceBooleanProperty(value);
                var element = this._elementRef.nativeElement;
                if (this._disabled !== newValue) {
                    this._disabled = newValue;
                    this.stateChanges.next(undefined);
                }
                // We need to null check the `blur` method, because it's undefined during SSR.
                // In Ivy static bindings are invoked earlier, before the element is attached to the DOM.
                // This can cause an error to be thrown in some browsers (IE/Edge) which assert that the
                // element has been inserted.
                if (newValue && this._isInitialized && element.blur) {
                    // Normally, native input elements automatically blur if they turn disabled. This behavior
                    // is problematic, because it would mean that it triggers another change detection cycle,
                    // which then causes a changed after checked error if the input element was focused before.
                    element.blur();
                }
            },
            enumerable: false,
            configurable: true
        });
        /** Gets the base validator functions. */
        MatDatepickerInputBase.prototype._getValidators = function () {
            return [this._parseValidator, this._minValidator, this._maxValidator, this._filterValidator];
        };
        /** Registers a date selection model with the input. */
        MatDatepickerInputBase.prototype._registerModel = function (model) {
            var _this = this;
            this._model = model;
            this._valueChangesSubscription.unsubscribe();
            if (this._pendingValue) {
                this._assignValue(this._pendingValue);
            }
            this._valueChangesSubscription = this._model.selectionChanged.subscribe(function (event) {
                if (_this._shouldHandleChangeEvent(event)) {
                    var value = _this._getValueFromModel(event.selection);
                    _this._lastValueValid = _this._isValidValue(value);
                    _this._cvaOnChange(value);
                    _this._onTouched();
                    _this._formatValue(value);
                    _this.dateInput.emit(new MatDatepickerInputEvent(_this, _this._elementRef.nativeElement));
                    _this.dateChange.emit(new MatDatepickerInputEvent(_this, _this._elementRef.nativeElement));
                }
            });
        };
        MatDatepickerInputBase.prototype.ngAfterViewInit = function () {
            this._isInitialized = true;
        };
        MatDatepickerInputBase.prototype.ngOnChanges = function (changes) {
            if (dateInputsHaveChanged(changes, this._dateAdapter)) {
                this.stateChanges.next(undefined);
            }
        };
        MatDatepickerInputBase.prototype.ngOnDestroy = function () {
            this._valueChangesSubscription.unsubscribe();
            this._localeSubscription.unsubscribe();
            this.stateChanges.complete();
        };
        /** @docs-private */
        MatDatepickerInputBase.prototype.registerOnValidatorChange = function (fn) {
            this._validatorOnChange = fn;
        };
        /** @docs-private */
        MatDatepickerInputBase.prototype.validate = function (c) {
            return this._validator ? this._validator(c) : null;
        };
        // Implemented as part of ControlValueAccessor.
        MatDatepickerInputBase.prototype.writeValue = function (value) {
            this._assignValueProgrammatically(value);
        };
        // Implemented as part of ControlValueAccessor.
        MatDatepickerInputBase.prototype.registerOnChange = function (fn) {
            this._cvaOnChange = fn;
        };
        // Implemented as part of ControlValueAccessor.
        MatDatepickerInputBase.prototype.registerOnTouched = function (fn) {
            this._onTouched = fn;
        };
        // Implemented as part of ControlValueAccessor.
        MatDatepickerInputBase.prototype.setDisabledState = function (isDisabled) {
            this.disabled = isDisabled;
        };
        MatDatepickerInputBase.prototype._onKeydown = function (event) {
            var isAltDownArrow = event.altKey && event.keyCode === keycodes.DOWN_ARROW;
            if (isAltDownArrow && !this._elementRef.nativeElement.readOnly) {
                this._openPopup();
                event.preventDefault();
            }
        };
        MatDatepickerInputBase.prototype._onInput = function (value) {
            var lastValueWasValid = this._lastValueValid;
            var date = this._dateAdapter.parse(value, this._dateFormats.parse.dateInput);
            this._lastValueValid = this._isValidValue(date);
            date = this._dateAdapter.getValidDateOrNull(date);
            if (!this._dateAdapter.sameDate(date, this.value)) {
                this._assignValue(date);
                this._cvaOnChange(date);
                this.dateInput.emit(new MatDatepickerInputEvent(this, this._elementRef.nativeElement));
            }
            else {
                // Call the CVA change handler for invalid values
                // since this is what marks the control as dirty.
                if (value && !this.value) {
                    this._cvaOnChange(date);
                }
                if (lastValueWasValid !== this._lastValueValid) {
                    this._validatorOnChange();
                }
            }
        };
        MatDatepickerInputBase.prototype._onChange = function () {
            this.dateChange.emit(new MatDatepickerInputEvent(this, this._elementRef.nativeElement));
        };
        /** Handles blur events on the input. */
        MatDatepickerInputBase.prototype._onBlur = function () {
            // Reformat the input only if we have a valid value.
            if (this.value) {
                this._formatValue(this.value);
            }
            this._onTouched();
        };
        /** Formats a value and sets it on the input element. */
        MatDatepickerInputBase.prototype._formatValue = function (value) {
            this._elementRef.nativeElement.value =
                value ? this._dateAdapter.format(value, this._dateFormats.display.dateInput) : '';
        };
        /** Assigns a value to the model. */
        MatDatepickerInputBase.prototype._assignValue = function (value) {
            // We may get some incoming values before the model was
            // assigned. Save the value so that we can assign it later.
            if (this._model) {
                this._assignValueToModel(value);
                this._pendingValue = null;
            }
            else {
                this._pendingValue = value;
            }
        };
        /** Whether a value is considered valid. */
        MatDatepickerInputBase.prototype._isValidValue = function (value) {
            return !value || this._dateAdapter.isValid(value);
        };
        /**
         * Checks whether a parent control is disabled. This is in place so that it can be overridden
         * by inputs extending this one which can be placed inside of a group that can be disabled.
         */
        MatDatepickerInputBase.prototype._parentDisabled = function () {
            return false;
        };
        /** Programmatically assigns a value to the input. */
        MatDatepickerInputBase.prototype._assignValueProgrammatically = function (value) {
            value = this._dateAdapter.deserialize(value);
            this._lastValueValid = this._isValidValue(value);
            value = this._dateAdapter.getValidDateOrNull(value);
            this._assignValue(value);
            this._formatValue(value);
        };
        /** Gets whether a value matches the current date filter. */
        MatDatepickerInputBase.prototype._matchesFilter = function (value) {
            var filter = this._getDateFilter();
            return !filter || filter(value);
        };
        return MatDatepickerInputBase;
    }());
    MatDatepickerInputBase.decorators = [
        { type: i0.Directive }
    ];
    MatDatepickerInputBase.ctorParameters = function () { return [
        { type: i0.ElementRef },
        { type: core.DateAdapter, decorators: [{ type: i0.Optional }] },
        { type: undefined, decorators: [{ type: i0.Optional }, { type: i0.Inject, args: [core.MAT_DATE_FORMATS,] }] }
    ]; };
    MatDatepickerInputBase.propDecorators = {
        value: [{ type: i0.Input }],
        disabled: [{ type: i0.Input }],
        dateChange: [{ type: i0.Output }],
        dateInput: [{ type: i0.Output }]
    };
    /**
     * Checks whether the `SimpleChanges` object from an `ngOnChanges`
     * callback has any changes, accounting for date objects.
     */
    function dateInputsHaveChanged(changes, adapter) {
        var e_1, _a;
        var keys = Object.keys(changes);
        try {
            for (var keys_1 = __values(keys), keys_1_1 = keys_1.next(); !keys_1_1.done; keys_1_1 = keys_1.next()) {
                var key = keys_1_1.value;
                var _b = changes[key], previousValue = _b.previousValue, currentValue = _b.currentValue;
                if (adapter.isDateInstance(previousValue) && adapter.isDateInstance(currentValue)) {
                    if (!adapter.sameDate(previousValue, currentValue)) {
                        return true;
                    }
                }
                else {
                    return true;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (keys_1_1 && !keys_1_1.done && (_a = keys_1.return)) _a.call(keys_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return false;
    }

    /** @docs-private */
    var MAT_DATEPICKER_VALUE_ACCESSOR = {
        provide: forms.NG_VALUE_ACCESSOR,
        useExisting: i0.forwardRef(function () { return MatDatepickerInput; }),
        multi: true
    };
    /** @docs-private */
    var MAT_DATEPICKER_VALIDATORS = {
        provide: forms.NG_VALIDATORS,
        useExisting: i0.forwardRef(function () { return MatDatepickerInput; }),
        multi: true
    };
    /** Directive used to connect an input to a MatDatepicker. */
    var MatDatepickerInput = /** @class */ (function (_super) {
        __extends(MatDatepickerInput, _super);
        function MatDatepickerInput(elementRef, dateAdapter, dateFormats, _formField) {
            var _this = _super.call(this, elementRef, dateAdapter, dateFormats) || this;
            _this._formField = _formField;
            _this._closedSubscription = rxjs.Subscription.EMPTY;
            _this._validator = forms.Validators.compose(_super.prototype._getValidators.call(_this));
            return _this;
        }
        Object.defineProperty(MatDatepickerInput.prototype, "matDatepicker", {
            /** The datepicker that this input is associated with. */
            set: function (datepicker) {
                var _this = this;
                if (datepicker) {
                    this._datepicker = datepicker;
                    this._closedSubscription = datepicker.closedStream.subscribe(function () { return _this._onTouched(); });
                    this._registerModel(datepicker.registerInput(this));
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatDatepickerInput.prototype, "min", {
            /** The minimum valid date. */
            get: function () { return this._min; },
            set: function (value) {
                var validValue = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value));
                if (!this._dateAdapter.sameDate(validValue, this._min)) {
                    this._min = validValue;
                    this._validatorOnChange();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatDatepickerInput.prototype, "max", {
            /** The maximum valid date. */
            get: function () { return this._max; },
            set: function (value) {
                var validValue = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value));
                if (!this._dateAdapter.sameDate(validValue, this._max)) {
                    this._max = validValue;
                    this._validatorOnChange();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatDatepickerInput.prototype, "dateFilter", {
            /** Function that can be used to filter out dates within the datepicker. */
            get: function () { return this._dateFilter; },
            set: function (value) {
                var wasMatchingValue = this._matchesFilter(this.value);
                this._dateFilter = value;
                if (this._matchesFilter(this.value) !== wasMatchingValue) {
                    this._validatorOnChange();
                }
            },
            enumerable: false,
            configurable: true
        });
        /**
         * Gets the element that the datepicker popup should be connected to.
         * @return The element to connect the popup to.
         */
        MatDatepickerInput.prototype.getConnectedOverlayOrigin = function () {
            return this._formField ? this._formField.getConnectedOverlayOrigin() : this._elementRef;
        };
        /** Gets the ID of an element that should be used a description for the calendar overlay. */
        MatDatepickerInput.prototype.getOverlayLabelId = function () {
            if (this._formField) {
                return this._formField.getLabelId();
            }
            return this._elementRef.nativeElement.getAttribute('aria-labelledby');
        };
        /** Returns the palette used by the input's form field, if any. */
        MatDatepickerInput.prototype.getThemePalette = function () {
            return this._formField ? this._formField.color : undefined;
        };
        /** Gets the value at which the calendar should start. */
        MatDatepickerInput.prototype.getStartValue = function () {
            return this.value;
        };
        MatDatepickerInput.prototype.ngOnDestroy = function () {
            _super.prototype.ngOnDestroy.call(this);
            this._closedSubscription.unsubscribe();
        };
        /** Opens the associated datepicker. */
        MatDatepickerInput.prototype._openPopup = function () {
            if (this._datepicker) {
                this._datepicker.open();
            }
        };
        MatDatepickerInput.prototype._getValueFromModel = function (modelValue) {
            return modelValue;
        };
        MatDatepickerInput.prototype._assignValueToModel = function (value) {
            if (this._model) {
                this._model.updateSelection(value, this);
            }
        };
        /** Gets the input's minimum date. */
        MatDatepickerInput.prototype._getMinDate = function () {
            return this._min;
        };
        /** Gets the input's maximum date. */
        MatDatepickerInput.prototype._getMaxDate = function () {
            return this._max;
        };
        /** Gets the input's date filtering function. */
        MatDatepickerInput.prototype._getDateFilter = function () {
            return this._dateFilter;
        };
        MatDatepickerInput.prototype._shouldHandleChangeEvent = function (event) {
            return event.source !== this;
        };
        return MatDatepickerInput;
    }(MatDatepickerInputBase));
    MatDatepickerInput.decorators = [
        { type: i0.Directive, args: [{
                    selector: 'input[matDatepicker]',
                    providers: [
                        MAT_DATEPICKER_VALUE_ACCESSOR,
                        MAT_DATEPICKER_VALIDATORS,
                        { provide: input.MAT_INPUT_VALUE_ACCESSOR, useExisting: MatDatepickerInput },
                    ],
                    host: {
                        'class': 'mat-datepicker-input',
                        '[attr.aria-haspopup]': '_datepicker ? "dialog" : null',
                        '[attr.aria-owns]': '(_datepicker?.opened && _datepicker.id) || null',
                        '[attr.min]': 'min ? _dateAdapter.toIso8601(min) : null',
                        '[attr.max]': 'max ? _dateAdapter.toIso8601(max) : null',
                        // Used by the test harness to tie this input to its calendar. We can't depend on
                        // `aria-owns` for this, because it's only defined while the calendar is open.
                        '[attr.data-mat-calendar]': '_datepicker ? _datepicker.id : null',
                        '[disabled]': 'disabled',
                        '(input)': '_onInput($event.target.value)',
                        '(change)': '_onChange()',
                        '(blur)': '_onBlur()',
                        '(keydown)': '_onKeydown($event)',
                    },
                    exportAs: 'matDatepickerInput',
                },] }
    ];
    MatDatepickerInput.ctorParameters = function () { return [
        { type: i0.ElementRef },
        { type: core.DateAdapter, decorators: [{ type: i0.Optional }] },
        { type: undefined, decorators: [{ type: i0.Optional }, { type: i0.Inject, args: [core.MAT_DATE_FORMATS,] }] },
        { type: formField.MatFormField, decorators: [{ type: i0.Optional }, { type: i0.Inject, args: [formField.MAT_FORM_FIELD,] }] }
    ]; };
    MatDatepickerInput.propDecorators = {
        matDatepicker: [{ type: i0.Input }],
        min: [{ type: i0.Input }],
        max: [{ type: i0.Input }],
        dateFilter: [{ type: i0.Input, args: ['matDatepickerFilter',] }]
    };

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /** Can be used to override the icon of a `matDatepickerToggle`. */
    var MatDatepickerToggleIcon = /** @class */ (function () {
        function MatDatepickerToggleIcon() {
        }
        return MatDatepickerToggleIcon;
    }());
    MatDatepickerToggleIcon.decorators = [
        { type: i0.Directive, args: [{
                    selector: '[matDatepickerToggleIcon]'
                },] }
    ];
    var MatDatepickerToggle = /** @class */ (function () {
        function MatDatepickerToggle(_intl, _changeDetectorRef, defaultTabIndex) {
            this._intl = _intl;
            this._changeDetectorRef = _changeDetectorRef;
            this._stateChanges = rxjs.Subscription.EMPTY;
            var parsedTabIndex = Number(defaultTabIndex);
            this.tabIndex = (parsedTabIndex || parsedTabIndex === 0) ? parsedTabIndex : null;
        }
        Object.defineProperty(MatDatepickerToggle.prototype, "disabled", {
            /** Whether the toggle button is disabled. */
            get: function () {
                if (this._disabled === undefined && this.datepicker) {
                    return this.datepicker.disabled;
                }
                return !!this._disabled;
            },
            set: function (value) {
                this._disabled = coercion.coerceBooleanProperty(value);
            },
            enumerable: false,
            configurable: true
        });
        MatDatepickerToggle.prototype.ngOnChanges = function (changes) {
            if (changes['datepicker']) {
                this._watchStateChanges();
            }
        };
        MatDatepickerToggle.prototype.ngOnDestroy = function () {
            this._stateChanges.unsubscribe();
        };
        MatDatepickerToggle.prototype.ngAfterContentInit = function () {
            this._watchStateChanges();
        };
        MatDatepickerToggle.prototype._open = function (event) {
            if (this.datepicker && !this.disabled) {
                this.datepicker.open();
                event.stopPropagation();
            }
        };
        MatDatepickerToggle.prototype._watchStateChanges = function () {
            var _this = this;
            var datepickerStateChanged = this.datepicker ? this.datepicker.stateChanges : rxjs.of();
            var inputStateChanged = this.datepicker && this.datepicker.datepickerInput ?
                this.datepicker.datepickerInput.stateChanges : rxjs.of();
            var datepickerToggled = this.datepicker ?
                rxjs.merge(this.datepicker.openedStream, this.datepicker.closedStream) :
                rxjs.of();
            this._stateChanges.unsubscribe();
            this._stateChanges = rxjs.merge(this._intl.changes, datepickerStateChanged, inputStateChanged, datepickerToggled).subscribe(function () { return _this._changeDetectorRef.markForCheck(); });
        };
        return MatDatepickerToggle;
    }());
    MatDatepickerToggle.decorators = [
        { type: i0.Component, args: [{
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
                    encapsulation: i0.ViewEncapsulation.None,
                    changeDetection: i0.ChangeDetectionStrategy.OnPush,
                    styles: [".mat-form-field-appearance-legacy .mat-form-field-prefix .mat-datepicker-toggle-default-icon,.mat-form-field-appearance-legacy .mat-form-field-suffix .mat-datepicker-toggle-default-icon{width:1em}.mat-form-field:not(.mat-form-field-appearance-legacy) .mat-form-field-prefix .mat-datepicker-toggle-default-icon,.mat-form-field:not(.mat-form-field-appearance-legacy) .mat-form-field-suffix .mat-datepicker-toggle-default-icon{display:block;width:1.5em;height:1.5em}.mat-form-field:not(.mat-form-field-appearance-legacy) .mat-form-field-prefix .mat-icon-button .mat-datepicker-toggle-default-icon,.mat-form-field:not(.mat-form-field-appearance-legacy) .mat-form-field-suffix .mat-icon-button .mat-datepicker-toggle-default-icon{margin:auto}.cdk-high-contrast-active .mat-datepicker-toggle-default-icon{color:CanvasText}\n"]
                },] }
    ];
    MatDatepickerToggle.ctorParameters = function () { return [
        { type: MatDatepickerIntl },
        { type: i0.ChangeDetectorRef },
        { type: String, decorators: [{ type: i0.Attribute, args: ['tabindex',] }] }
    ]; };
    MatDatepickerToggle.propDecorators = {
        datepicker: [{ type: i0.Input, args: ['for',] }],
        tabIndex: [{ type: i0.Input }],
        ariaLabel: [{ type: i0.Input, args: ['aria-label',] }],
        disabled: [{ type: i0.Input }],
        disableRipple: [{ type: i0.Input }],
        _customIcon: [{ type: i0.ContentChild, args: [MatDatepickerToggleIcon,] }],
        _button: [{ type: i0.ViewChild, args: ['button',] }]
    };

    /**
     * Used to provide the date range input wrapper component
     * to the parts without circular dependencies.
     */
    var MAT_DATE_RANGE_INPUT_PARENT = new i0.InjectionToken('MAT_DATE_RANGE_INPUT_PARENT');
    /**
     * Base class for the individual inputs that can be projected inside a `mat-date-range-input`.
     */
    var MatDateRangeInputPartBase = /** @class */ (function (_super) {
        __extends(MatDateRangeInputPartBase, _super);
        function MatDateRangeInputPartBase(_rangeInput, elementRef, _defaultErrorStateMatcher, _injector, _parentForm, _parentFormGroup, dateAdapter, dateFormats) {
            var _this = _super.call(this, elementRef, dateAdapter, dateFormats) || this;
            _this._rangeInput = _rangeInput;
            _this._defaultErrorStateMatcher = _defaultErrorStateMatcher;
            _this._injector = _injector;
            _this._parentForm = _parentForm;
            _this._parentFormGroup = _parentFormGroup;
            return _this;
        }
        MatDateRangeInputPartBase.prototype.ngOnInit = function () {
            // We need the date input to provide itself as a `ControlValueAccessor` and a `Validator`, while
            // injecting its `NgControl` so that the error state is handled correctly. This introduces a
            // circular dependency, because both `ControlValueAccessor` and `Validator` depend on the input
            // itself. Usually we can work around it for the CVA, but there's no API to do it for the
            // validator. We work around it here by injecting the `NgControl` in `ngOnInit`, after
            // everything has been resolved.
            // tslint:disable-next-line:no-bitwise
            var ngControl = this._injector.get(forms.NgControl, null, i0.InjectFlags.Self | i0.InjectFlags.Optional);
            if (ngControl) {
                this.ngControl = ngControl;
            }
        };
        MatDateRangeInputPartBase.prototype.ngDoCheck = function () {
            if (this.ngControl) {
                // We need to re-evaluate this on every change detection cycle, because there are some
                // error triggers that we can't subscribe to (e.g. parent form submissions). This means
                // that whatever logic is in here has to be super lean or we risk destroying the performance.
                this.updateErrorState();
            }
        };
        /** Gets whether the input is empty. */
        MatDateRangeInputPartBase.prototype.isEmpty = function () {
            return this._elementRef.nativeElement.value.length === 0;
        };
        /** Gets the placeholder of the input. */
        MatDateRangeInputPartBase.prototype._getPlaceholder = function () {
            return this._elementRef.nativeElement.placeholder;
        };
        /** Focuses the input. */
        MatDateRangeInputPartBase.prototype.focus = function () {
            this._elementRef.nativeElement.focus();
        };
        /** Handles `input` events on the input element. */
        MatDateRangeInputPartBase.prototype._onInput = function (value) {
            _super.prototype._onInput.call(this, value);
            this._rangeInput._handleChildValueChange();
        };
        /** Opens the datepicker associated with the input. */
        MatDateRangeInputPartBase.prototype._openPopup = function () {
            this._rangeInput._openDatepicker();
        };
        /** Gets the minimum date from the range input. */
        MatDateRangeInputPartBase.prototype._getMinDate = function () {
            return this._rangeInput.min;
        };
        /** Gets the maximum date from the range input. */
        MatDateRangeInputPartBase.prototype._getMaxDate = function () {
            return this._rangeInput.max;
        };
        /** Gets the date filter function from the range input. */
        MatDateRangeInputPartBase.prototype._getDateFilter = function () {
            return this._rangeInput.dateFilter;
        };
        MatDateRangeInputPartBase.prototype._parentDisabled = function () {
            return this._rangeInput._groupDisabled;
        };
        MatDateRangeInputPartBase.prototype._shouldHandleChangeEvent = function (_b) {
            var source = _b.source;
            return source !== this._rangeInput._startInput && source !== this._rangeInput._endInput;
        };
        MatDateRangeInputPartBase.prototype._assignValueProgrammatically = function (value) {
            _super.prototype._assignValueProgrammatically.call(this, value);
            var opposite = (this === this._rangeInput._startInput ? this._rangeInput._endInput :
                this._rangeInput._startInput);
            opposite === null || opposite === void 0 ? void 0 : opposite._validatorOnChange();
        };
        return MatDateRangeInputPartBase;
    }(MatDatepickerInputBase));
    MatDateRangeInputPartBase.decorators = [
        { type: i0.Directive }
    ];
    MatDateRangeInputPartBase.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: i0.Inject, args: [MAT_DATE_RANGE_INPUT_PARENT,] }] },
        { type: i0.ElementRef },
        { type: core.ErrorStateMatcher },
        { type: i0.Injector },
        { type: forms.NgForm, decorators: [{ type: i0.Optional }] },
        { type: forms.FormGroupDirective, decorators: [{ type: i0.Optional }] },
        { type: core.DateAdapter, decorators: [{ type: i0.Optional }] },
        { type: undefined, decorators: [{ type: i0.Optional }, { type: i0.Inject, args: [core.MAT_DATE_FORMATS,] }] }
    ]; };
    var _MatDateRangeInputBase = 
    // Needs to be `as any`, because the base class is abstract.
    core.mixinErrorState(MatDateRangeInputPartBase);
    /** Input for entering the start date in a `mat-date-range-input`. */
    var MatStartDate = /** @class */ (function (_super) {
        __extends(MatStartDate, _super);
        function MatStartDate(rangeInput, elementRef, defaultErrorStateMatcher, injector, parentForm, parentFormGroup, dateAdapter, dateFormats) {
            var _this = 
            // TODO(crisbeto): this constructor shouldn't be necessary, but ViewEngine doesn't seem to
            // handle DI correctly when it is inherited from `MatDateRangeInputPartBase`. We can drop this
            // constructor once ViewEngine is removed.
            _super.call(this, rangeInput, elementRef, defaultErrorStateMatcher, injector, parentForm, parentFormGroup, dateAdapter, dateFormats) || this;
            /** Validator that checks that the start date isn't after the end date. */
            _this._startValidator = function (control) {
                var start = _this._dateAdapter.getValidDateOrNull(_this._dateAdapter.deserialize(control.value));
                var end = _this._model ? _this._model.selection.end : null;
                return (!start || !end ||
                    _this._dateAdapter.compareDate(start, end) <= 0) ?
                    null : { 'matStartDateInvalid': { 'end': end, 'actual': start } };
            };
            _this._validator = forms.Validators.compose(__spreadArray(__spreadArray([], __read(_super.prototype._getValidators.call(_this))), [_this._startValidator]));
            return _this;
        }
        MatStartDate.prototype.ngOnInit = function () {
            // Normally this happens automatically, but it seems to break if not added explicitly when all
            // of the criteria below are met:
            // 1) The class extends a TS mixin.
            // 2) The application is running in ViewEngine.
            // 3) The application is being transpiled through tsickle.
            // This can be removed once google3 is completely migrated to Ivy.
            _super.prototype.ngOnInit.call(this);
        };
        MatStartDate.prototype.ngDoCheck = function () {
            // Normally this happens automatically, but it seems to break if not added explicitly when all
            // of the criteria below are met:
            // 1) The class extends a TS mixin.
            // 2) The application is running in ViewEngine.
            // 3) The application is being transpiled through tsickle.
            // This can be removed once google3 is completely migrated to Ivy.
            _super.prototype.ngDoCheck.call(this);
        };
        MatStartDate.prototype._getValueFromModel = function (modelValue) {
            return modelValue.start;
        };
        MatStartDate.prototype._shouldHandleChangeEvent = function (change) {
            var _a;
            if (!_super.prototype._shouldHandleChangeEvent.call(this, change)) {
                return false;
            }
            else {
                return !((_a = change.oldValue) === null || _a === void 0 ? void 0 : _a.start) ? !!change.selection.start :
                    !change.selection.start ||
                        !!this._dateAdapter.compareDate(change.oldValue.start, change.selection.start);
            }
        };
        MatStartDate.prototype._assignValueToModel = function (value) {
            if (this._model) {
                var range = new DateRange(value, this._model.selection.end);
                this._model.updateSelection(range, this);
            }
        };
        MatStartDate.prototype._formatValue = function (value) {
            _super.prototype._formatValue.call(this, value);
            // Any time the input value is reformatted we need to tell the parent.
            this._rangeInput._handleChildValueChange();
        };
        /** Gets the value that should be used when mirroring the input's size. */
        MatStartDate.prototype.getMirrorValue = function () {
            var element = this._elementRef.nativeElement;
            var value = element.value;
            return value.length > 0 ? value : element.placeholder;
        };
        return MatStartDate;
    }(_MatDateRangeInputBase));
    MatStartDate.decorators = [
        { type: i0.Directive, args: [{
                    selector: 'input[matStartDate]',
                    host: {
                        'class': 'mat-start-date mat-date-range-input-inner',
                        '[disabled]': 'disabled',
                        '(input)': '_onInput($event.target.value)',
                        '(change)': '_onChange()',
                        '(keydown)': '_onKeydown($event)',
                        '[attr.id]': '_rangeInput.id',
                        '[attr.aria-haspopup]': '_rangeInput.rangePicker ? "dialog" : null',
                        '[attr.aria-owns]': '(_rangeInput.rangePicker?.opened && _rangeInput.rangePicker.id) || null',
                        '[attr.min]': '_getMinDate() ? _dateAdapter.toIso8601(_getMinDate()) : null',
                        '[attr.max]': '_getMaxDate() ? _dateAdapter.toIso8601(_getMaxDate()) : null',
                        '(blur)': '_onBlur()',
                        'type': 'text',
                    },
                    providers: [
                        { provide: forms.NG_VALUE_ACCESSOR, useExisting: MatStartDate, multi: true },
                        { provide: forms.NG_VALIDATORS, useExisting: MatStartDate, multi: true }
                    ],
                    // These need to be specified explicitly, because some tooling doesn't
                    // seem to pick them up from the base class. See #20932.
                    outputs: ['dateChange', 'dateInput'],
                    inputs: ['errorStateMatcher']
                },] }
    ];
    MatStartDate.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: i0.Inject, args: [MAT_DATE_RANGE_INPUT_PARENT,] }] },
        { type: i0.ElementRef },
        { type: core.ErrorStateMatcher },
        { type: i0.Injector },
        { type: forms.NgForm, decorators: [{ type: i0.Optional }] },
        { type: forms.FormGroupDirective, decorators: [{ type: i0.Optional }] },
        { type: core.DateAdapter, decorators: [{ type: i0.Optional }] },
        { type: undefined, decorators: [{ type: i0.Optional }, { type: i0.Inject, args: [core.MAT_DATE_FORMATS,] }] }
    ]; };
    /** Input for entering the end date in a `mat-date-range-input`. */
    var MatEndDate = /** @class */ (function (_super) {
        __extends(MatEndDate, _super);
        function MatEndDate(rangeInput, elementRef, defaultErrorStateMatcher, injector, parentForm, parentFormGroup, dateAdapter, dateFormats) {
            var _this = 
            // TODO(crisbeto): this constructor shouldn't be necessary, but ViewEngine doesn't seem to
            // handle DI correctly when it is inherited from `MatDateRangeInputPartBase`. We can drop this
            // constructor once ViewEngine is removed.
            _super.call(this, rangeInput, elementRef, defaultErrorStateMatcher, injector, parentForm, parentFormGroup, dateAdapter, dateFormats) || this;
            /** Validator that checks that the end date isn't before the start date. */
            _this._endValidator = function (control) {
                var end = _this._dateAdapter.getValidDateOrNull(_this._dateAdapter.deserialize(control.value));
                var start = _this._model ? _this._model.selection.start : null;
                return (!end || !start ||
                    _this._dateAdapter.compareDate(end, start) >= 0) ?
                    null : { 'matEndDateInvalid': { 'start': start, 'actual': end } };
            };
            _this._validator = forms.Validators.compose(__spreadArray(__spreadArray([], __read(_super.prototype._getValidators.call(_this))), [_this._endValidator]));
            return _this;
        }
        MatEndDate.prototype.ngOnInit = function () {
            // Normally this happens automatically, but it seems to break if not added explicitly when all
            // of the criteria below are met:
            // 1) The class extends a TS mixin.
            // 2) The application is running in ViewEngine.
            // 3) The application is being transpiled through tsickle.
            // This can be removed once google3 is completely migrated to Ivy.
            _super.prototype.ngOnInit.call(this);
        };
        MatEndDate.prototype.ngDoCheck = function () {
            // Normally this happens automatically, but it seems to break if not added explicitly when all
            // of the criteria below are met:
            // 1) The class extends a TS mixin.
            // 2) The application is running in ViewEngine.
            // 3) The application is being transpiled through tsickle.
            // This can be removed once google3 is completely migrated to Ivy.
            _super.prototype.ngDoCheck.call(this);
        };
        MatEndDate.prototype._getValueFromModel = function (modelValue) {
            return modelValue.end;
        };
        MatEndDate.prototype._shouldHandleChangeEvent = function (change) {
            var _a;
            if (!_super.prototype._shouldHandleChangeEvent.call(this, change)) {
                return false;
            }
            else {
                return !((_a = change.oldValue) === null || _a === void 0 ? void 0 : _a.end) ? !!change.selection.end :
                    !change.selection.end ||
                        !!this._dateAdapter.compareDate(change.oldValue.end, change.selection.end);
            }
        };
        MatEndDate.prototype._assignValueToModel = function (value) {
            if (this._model) {
                var range = new DateRange(this._model.selection.start, value);
                this._model.updateSelection(range, this);
            }
        };
        MatEndDate.prototype._onKeydown = function (event) {
            // If the user is pressing backspace on an empty end input, move focus back to the start.
            if (event.keyCode === keycodes.BACKSPACE && !this._elementRef.nativeElement.value) {
                this._rangeInput._startInput.focus();
            }
            _super.prototype._onKeydown.call(this, event);
        };
        return MatEndDate;
    }(_MatDateRangeInputBase));
    MatEndDate.decorators = [
        { type: i0.Directive, args: [{
                    selector: 'input[matEndDate]',
                    host: {
                        'class': 'mat-end-date mat-date-range-input-inner',
                        '[disabled]': 'disabled',
                        '(input)': '_onInput($event.target.value)',
                        '(change)': '_onChange()',
                        '(keydown)': '_onKeydown($event)',
                        '[attr.aria-haspopup]': '_rangeInput.rangePicker ? "dialog" : null',
                        '[attr.aria-owns]': '(_rangeInput.rangePicker?.opened && _rangeInput.rangePicker.id) || null',
                        '[attr.min]': '_getMinDate() ? _dateAdapter.toIso8601(_getMinDate()) : null',
                        '[attr.max]': '_getMaxDate() ? _dateAdapter.toIso8601(_getMaxDate()) : null',
                        '(blur)': '_onBlur()',
                        'type': 'text',
                    },
                    providers: [
                        { provide: forms.NG_VALUE_ACCESSOR, useExisting: MatEndDate, multi: true },
                        { provide: forms.NG_VALIDATORS, useExisting: MatEndDate, multi: true }
                    ],
                    // These need to be specified explicitly, because some tooling doesn't
                    // seem to pick them up from the base class. See #20932.
                    outputs: ['dateChange', 'dateInput'],
                    inputs: ['errorStateMatcher']
                },] }
    ];
    MatEndDate.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: i0.Inject, args: [MAT_DATE_RANGE_INPUT_PARENT,] }] },
        { type: i0.ElementRef },
        { type: core.ErrorStateMatcher },
        { type: i0.Injector },
        { type: forms.NgForm, decorators: [{ type: i0.Optional }] },
        { type: forms.FormGroupDirective, decorators: [{ type: i0.Optional }] },
        { type: core.DateAdapter, decorators: [{ type: i0.Optional }] },
        { type: undefined, decorators: [{ type: i0.Optional }, { type: i0.Inject, args: [core.MAT_DATE_FORMATS,] }] }
    ]; };

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var nextUniqueId = 0;
    var MatDateRangeInput = /** @class */ (function () {
        function MatDateRangeInput(_changeDetectorRef, _elementRef, control, _dateAdapter, _formField) {
            this._changeDetectorRef = _changeDetectorRef;
            this._elementRef = _elementRef;
            this._dateAdapter = _dateAdapter;
            this._formField = _formField;
            this._closedSubscription = rxjs.Subscription.EMPTY;
            /** Unique ID for the input. */
            this.id = "mat-date-range-input-" + nextUniqueId++;
            /** Whether the control is focused. */
            this.focused = false;
            /** Name of the form control. */
            this.controlType = 'mat-date-range-input';
            this._groupDisabled = false;
            /** Value for the `aria-describedby` attribute of the inputs. */
            this._ariaDescribedBy = null;
            /** Separator text to be shown between the inputs. */
            this.separator = '–';
            /** Start of the comparison range that should be shown in the calendar. */
            this.comparisonStart = null;
            /** End of the comparison range that should be shown in the calendar. */
            this.comparisonEnd = null;
            /** Emits when the input's state has changed. */
            this.stateChanges = new rxjs.Subject();
            if (!_dateAdapter && (typeof ngDevMode === 'undefined' || ngDevMode)) {
                throw createMissingDateImplError('DateAdapter');
            }
            // The datepicker module can be used both with MDC and non-MDC form fields. We have
            // to conditionally add the MDC input class so that the range picker looks correctly.
            if (_formField === null || _formField === void 0 ? void 0 : _formField._elementRef.nativeElement.classList.contains('mat-mdc-form-field')) {
                _elementRef.nativeElement.classList.add('mat-mdc-input-element');
            }
            // TODO(crisbeto): remove `as any` after #18206 lands.
            this.ngControl = control;
        }
        Object.defineProperty(MatDateRangeInput.prototype, "value", {
            /** Current value of the range input. */
            get: function () {
                return this._model ? this._model.selection : null;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatDateRangeInput.prototype, "shouldLabelFloat", {
            /** Whether the control's label should float. */
            get: function () {
                return this.focused || !this.empty;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatDateRangeInput.prototype, "placeholder", {
            /**
             * Implemented as a part of `MatFormFieldControl`.
             * Set the placeholder attribute on `matStartDate` and `matEndDate`.
             * @docs-private
             */
            get: function () {
                var _a, _b;
                var start = ((_a = this._startInput) === null || _a === void 0 ? void 0 : _a._getPlaceholder()) || '';
                var end = ((_b = this._endInput) === null || _b === void 0 ? void 0 : _b._getPlaceholder()) || '';
                return (start || end) ? start + " " + this.separator + " " + end : '';
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatDateRangeInput.prototype, "rangePicker", {
            /** The range picker that this input is associated with. */
            get: function () { return this._rangePicker; },
            set: function (rangePicker) {
                var _this = this;
                if (rangePicker) {
                    this._model = rangePicker.registerInput(this);
                    this._rangePicker = rangePicker;
                    this._closedSubscription.unsubscribe();
                    this._closedSubscription = rangePicker.closedStream.subscribe(function () {
                        var _a, _b;
                        (_a = _this._startInput) === null || _a === void 0 ? void 0 : _a._onTouched();
                        (_b = _this._endInput) === null || _b === void 0 ? void 0 : _b._onTouched();
                    });
                    this._registerModel(this._model);
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatDateRangeInput.prototype, "required", {
            /** Whether the input is required. */
            get: function () { return !!this._required; },
            set: function (value) {
                this._required = coercion.coerceBooleanProperty(value);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatDateRangeInput.prototype, "dateFilter", {
            /** Function that can be used to filter out dates within the date range picker. */
            get: function () { return this._dateFilter; },
            set: function (value) {
                var start = this._startInput;
                var end = this._endInput;
                var wasMatchingStart = start && start._matchesFilter(start.value);
                var wasMatchingEnd = end && end._matchesFilter(start.value);
                this._dateFilter = value;
                if (start && start._matchesFilter(start.value) !== wasMatchingStart) {
                    start._validatorOnChange();
                }
                if (end && end._matchesFilter(end.value) !== wasMatchingEnd) {
                    end._validatorOnChange();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatDateRangeInput.prototype, "min", {
            /** The minimum valid date. */
            get: function () { return this._min; },
            set: function (value) {
                var validValue = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value));
                if (!this._dateAdapter.sameDate(validValue, this._min)) {
                    this._min = validValue;
                    this._revalidate();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatDateRangeInput.prototype, "max", {
            /** The maximum valid date. */
            get: function () { return this._max; },
            set: function (value) {
                var validValue = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value));
                if (!this._dateAdapter.sameDate(validValue, this._max)) {
                    this._max = validValue;
                    this._revalidate();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatDateRangeInput.prototype, "disabled", {
            /** Whether the input is disabled. */
            get: function () {
                return (this._startInput && this._endInput) ?
                    (this._startInput.disabled && this._endInput.disabled) :
                    this._groupDisabled;
            },
            set: function (value) {
                var newValue = coercion.coerceBooleanProperty(value);
                if (newValue !== this._groupDisabled) {
                    this._groupDisabled = newValue;
                    this.stateChanges.next(undefined);
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatDateRangeInput.prototype, "errorState", {
            /** Whether the input is in an error state. */
            get: function () {
                if (this._startInput && this._endInput) {
                    return this._startInput.errorState || this._endInput.errorState;
                }
                return false;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatDateRangeInput.prototype, "empty", {
            /** Whether the datepicker input is empty. */
            get: function () {
                var startEmpty = this._startInput ? this._startInput.isEmpty() : false;
                var endEmpty = this._endInput ? this._endInput.isEmpty() : false;
                return startEmpty && endEmpty;
            },
            enumerable: false,
            configurable: true
        });
        /**
         * Implemented as a part of `MatFormFieldControl`.
         * @docs-private
         */
        MatDateRangeInput.prototype.setDescribedByIds = function (ids) {
            this._ariaDescribedBy = ids.length ? ids.join(' ') : null;
        };
        /**
         * Implemented as a part of `MatFormFieldControl`.
         * @docs-private
         */
        MatDateRangeInput.prototype.onContainerClick = function () {
            if (!this.focused && !this.disabled) {
                if (!this._model || !this._model.selection.start) {
                    this._startInput.focus();
                }
                else {
                    this._endInput.focus();
                }
            }
        };
        MatDateRangeInput.prototype.ngAfterContentInit = function () {
            var _this = this;
            if (typeof ngDevMode === 'undefined' || ngDevMode) {
                if (!this._startInput) {
                    throw Error('mat-date-range-input must contain a matStartDate input');
                }
                if (!this._endInput) {
                    throw Error('mat-date-range-input must contain a matEndDate input');
                }
            }
            if (this._model) {
                this._registerModel(this._model);
            }
            // We don't need to unsubscribe from this, because we
            // know that the input streams will be completed on destroy.
            rxjs.merge(this._startInput.stateChanges, this._endInput.stateChanges).subscribe(function () {
                _this.stateChanges.next(undefined);
            });
        };
        MatDateRangeInput.prototype.ngOnChanges = function (changes) {
            if (dateInputsHaveChanged(changes, this._dateAdapter)) {
                this.stateChanges.next(undefined);
            }
        };
        MatDateRangeInput.prototype.ngOnDestroy = function () {
            this._closedSubscription.unsubscribe();
            this.stateChanges.complete();
        };
        /** Gets the date at which the calendar should start. */
        MatDateRangeInput.prototype.getStartValue = function () {
            return this.value ? this.value.start : null;
        };
        /** Gets the input's theme palette. */
        MatDateRangeInput.prototype.getThemePalette = function () {
            return this._formField ? this._formField.color : undefined;
        };
        /** Gets the element to which the calendar overlay should be attached. */
        MatDateRangeInput.prototype.getConnectedOverlayOrigin = function () {
            return this._formField ? this._formField.getConnectedOverlayOrigin() : this._elementRef;
        };
        /** Gets the ID of an element that should be used a description for the calendar overlay. */
        MatDateRangeInput.prototype.getOverlayLabelId = function () {
            return this._formField ? this._formField.getLabelId() : null;
        };
        /** Gets the value that is used to mirror the state input. */
        MatDateRangeInput.prototype._getInputMirrorValue = function () {
            return this._startInput ? this._startInput.getMirrorValue() : '';
        };
        /** Whether the input placeholders should be hidden. */
        MatDateRangeInput.prototype._shouldHidePlaceholders = function () {
            return this._startInput ? !this._startInput.isEmpty() : false;
        };
        /** Handles the value in one of the child inputs changing. */
        MatDateRangeInput.prototype._handleChildValueChange = function () {
            this.stateChanges.next(undefined);
            this._changeDetectorRef.markForCheck();
        };
        /** Opens the date range picker associated with the input. */
        MatDateRangeInput.prototype._openDatepicker = function () {
            if (this._rangePicker) {
                this._rangePicker.open();
            }
        };
        /** Whether the separate text should be hidden. */
        MatDateRangeInput.prototype._shouldHideSeparator = function () {
            return (!this._formField || (this._formField.getLabelId() &&
                !this._formField._shouldLabelFloat())) && this.empty;
        };
        /** Gets the value for the `aria-labelledby` attribute of the inputs. */
        MatDateRangeInput.prototype._getAriaLabelledby = function () {
            var formField = this._formField;
            return formField && formField._hasFloatingLabel() ? formField._labelId : null;
        };
        /** Updates the focused state of the range input. */
        MatDateRangeInput.prototype._updateFocus = function (origin) {
            this.focused = origin !== null;
            this.stateChanges.next();
        };
        /** Re-runs the validators on the start/end inputs. */
        MatDateRangeInput.prototype._revalidate = function () {
            if (this._startInput) {
                this._startInput._validatorOnChange();
            }
            if (this._endInput) {
                this._endInput._validatorOnChange();
            }
        };
        /** Registers the current date selection model with the start/end inputs. */
        MatDateRangeInput.prototype._registerModel = function (model) {
            if (this._startInput) {
                this._startInput._registerModel(model);
            }
            if (this._endInput) {
                this._endInput._registerModel(model);
            }
        };
        return MatDateRangeInput;
    }());
    MatDateRangeInput.decorators = [
        { type: i0.Component, args: [{
                    selector: 'mat-date-range-input',
                    template: "<div\n  class=\"mat-date-range-input-container\"\n  cdkMonitorSubtreeFocus\n  (cdkFocusChange)=\"_updateFocus($event)\">\n  <div class=\"mat-date-range-input-start-wrapper\">\n    <ng-content select=\"input[matStartDate]\"></ng-content>\n    <span\n      class=\"mat-date-range-input-mirror\"\n      aria-hidden=\"true\">{{_getInputMirrorValue()}}</span>\n  </div>\n\n  <span\n    class=\"mat-date-range-input-separator\"\n    [class.mat-date-range-input-separator-hidden]=\"_shouldHideSeparator()\">{{separator}}</span>\n\n  <div class=\"mat-date-range-input-end-wrapper\">\n    <ng-content select=\"input[matEndDate]\"></ng-content>\n  </div>\n</div>\n\n",
                    exportAs: 'matDateRangeInput',
                    host: {
                        'class': 'mat-date-range-input',
                        '[class.mat-date-range-input-hide-placeholders]': '_shouldHidePlaceholders()',
                        '[class.mat-date-range-input-required]': 'required',
                        '[attr.id]': 'null',
                        'role': 'group',
                        '[attr.aria-labelledby]': '_getAriaLabelledby()',
                        '[attr.aria-describedby]': '_ariaDescribedBy',
                        // Used by the test harness to tie this input to its calendar. We can't depend on
                        // `aria-owns` for this, because it's only defined while the calendar is open.
                        '[attr.data-mat-calendar]': 'rangePicker ? rangePicker.id : null',
                    },
                    changeDetection: i0.ChangeDetectionStrategy.OnPush,
                    encapsulation: i0.ViewEncapsulation.None,
                    providers: [
                        { provide: formField.MatFormFieldControl, useExisting: MatDateRangeInput },
                        { provide: MAT_DATE_RANGE_INPUT_PARENT, useExisting: MatDateRangeInput },
                    ],
                    styles: [".mat-date-range-input{display:block;width:100%}.mat-date-range-input-container{display:flex;align-items:center}.mat-date-range-input-separator{transition:opacity 400ms 133.3333333333ms cubic-bezier(0.25, 0.8, 0.25, 1);margin:0 4px}.mat-date-range-input-separator-hidden{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;opacity:0;transition:none}.mat-date-range-input-inner{font:inherit;background:transparent;color:currentColor;border:none;outline:none;padding:0;margin:0;vertical-align:bottom;text-align:inherit;-webkit-appearance:none;width:100%}.mat-date-range-input-inner::-ms-clear,.mat-date-range-input-inner::-ms-reveal{display:none}.mat-date-range-input-inner:-moz-ui-invalid{box-shadow:none}.mat-date-range-input-inner::placeholder{transition:color 400ms 133.3333333333ms cubic-bezier(0.25, 0.8, 0.25, 1)}.mat-date-range-input-inner::-moz-placeholder{transition:color 400ms 133.3333333333ms cubic-bezier(0.25, 0.8, 0.25, 1)}.mat-date-range-input-inner::-webkit-input-placeholder{transition:color 400ms 133.3333333333ms cubic-bezier(0.25, 0.8, 0.25, 1)}.mat-date-range-input-inner:-ms-input-placeholder{transition:color 400ms 133.3333333333ms cubic-bezier(0.25, 0.8, 0.25, 1)}.mat-form-field-hide-placeholder .mat-date-range-input-inner::placeholder,.mat-date-range-input-hide-placeholders .mat-date-range-input-inner::placeholder{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;color:transparent !important;-webkit-text-fill-color:transparent;transition:none}.mat-form-field-hide-placeholder .mat-date-range-input-inner::-moz-placeholder,.mat-date-range-input-hide-placeholders .mat-date-range-input-inner::-moz-placeholder{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;color:transparent !important;-webkit-text-fill-color:transparent;transition:none}.mat-form-field-hide-placeholder .mat-date-range-input-inner::-webkit-input-placeholder,.mat-date-range-input-hide-placeholders .mat-date-range-input-inner::-webkit-input-placeholder{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;color:transparent !important;-webkit-text-fill-color:transparent;transition:none}.mat-form-field-hide-placeholder .mat-date-range-input-inner:-ms-input-placeholder,.mat-date-range-input-hide-placeholders .mat-date-range-input-inner:-ms-input-placeholder{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;color:transparent !important;-webkit-text-fill-color:transparent;transition:none}.mat-date-range-input-mirror{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;visibility:hidden;white-space:nowrap;display:inline-block;min-width:2px}.mat-date-range-input-start-wrapper{position:relative;overflow:hidden;max-width:calc(50% - 4px)}.mat-date-range-input-start-wrapper .mat-date-range-input-inner{position:absolute;top:0;left:0}.mat-date-range-input-end-wrapper{flex-grow:1;max-width:calc(50% - 4px)}.mat-form-field-type-mat-date-range-input .mat-form-field-infix{width:200px}\n"]
                },] }
    ];
    MatDateRangeInput.ctorParameters = function () { return [
        { type: i0.ChangeDetectorRef },
        { type: i0.ElementRef },
        { type: forms.ControlContainer, decorators: [{ type: i0.Optional }, { type: i0.Self }] },
        { type: core.DateAdapter, decorators: [{ type: i0.Optional }] },
        { type: formField.MatFormField, decorators: [{ type: i0.Optional }, { type: i0.Inject, args: [formField.MAT_FORM_FIELD,] }] }
    ]; };
    MatDateRangeInput.propDecorators = {
        rangePicker: [{ type: i0.Input }],
        required: [{ type: i0.Input }],
        dateFilter: [{ type: i0.Input }],
        min: [{ type: i0.Input }],
        max: [{ type: i0.Input }],
        disabled: [{ type: i0.Input }],
        separator: [{ type: i0.Input }],
        comparisonStart: [{ type: i0.Input }],
        comparisonEnd: [{ type: i0.Input }],
        _startInput: [{ type: i0.ContentChild, args: [MatStartDate,] }],
        _endInput: [{ type: i0.ContentChild, args: [MatEndDate,] }]
    };

    // TODO(mmalerba): We use a component instead of a directive here so the user can use implicit
    // template reference variables (e.g. #d vs #d="matDateRangePicker"). We can change this to a
    // directive if angular adds support for `exportAs: '$implicit'` on directives.
    /** Component responsible for managing the date range picker popup/dialog. */
    var MatDateRangePicker = /** @class */ (function (_super) {
        __extends(MatDateRangePicker, _super);
        function MatDateRangePicker() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MatDateRangePicker.prototype._forwardContentValues = function (instance) {
            _super.prototype._forwardContentValues.call(this, instance);
            var input = this.datepickerInput;
            if (input) {
                instance.comparisonStart = input.comparisonStart;
                instance.comparisonEnd = input.comparisonEnd;
            }
        };
        return MatDateRangePicker;
    }(MatDatepickerBase));
    MatDateRangePicker.decorators = [
        { type: i0.Component, args: [{
                    selector: 'mat-date-range-picker',
                    template: '',
                    exportAs: 'matDateRangePicker',
                    changeDetection: i0.ChangeDetectionStrategy.OnPush,
                    encapsulation: i0.ViewEncapsulation.None,
                    providers: [
                        MAT_RANGE_DATE_SELECTION_MODEL_PROVIDER,
                        MAT_CALENDAR_RANGE_STRATEGY_PROVIDER,
                        { provide: MatDatepickerBase, useExisting: MatDateRangePicker },
                    ]
                },] }
    ];

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /** Button that will close the datepicker and assign the current selection to the data model. */
    var MatDatepickerApply = /** @class */ (function () {
        function MatDatepickerApply(_datepicker) {
            this._datepicker = _datepicker;
        }
        MatDatepickerApply.prototype._applySelection = function () {
            this._datepicker._applyPendingSelection();
            this._datepicker.close();
        };
        return MatDatepickerApply;
    }());
    MatDatepickerApply.decorators = [
        { type: i0.Directive, args: [{
                    selector: '[matDatepickerApply], [matDateRangePickerApply]',
                    host: { '(click)': '_applySelection()' }
                },] }
    ];
    MatDatepickerApply.ctorParameters = function () { return [
        { type: MatDatepickerBase }
    ]; };
    /** Button that will close the datepicker and discard the current selection. */
    var MatDatepickerCancel = /** @class */ (function () {
        function MatDatepickerCancel(_datepicker) {
            this._datepicker = _datepicker;
        }
        return MatDatepickerCancel;
    }());
    MatDatepickerCancel.decorators = [
        { type: i0.Directive, args: [{
                    selector: '[matDatepickerCancel], [matDateRangePickerCancel]',
                    host: { '(click)': '_datepicker.close()' }
                },] }
    ];
    MatDatepickerCancel.ctorParameters = function () { return [
        { type: MatDatepickerBase }
    ]; };
    /**
     * Container that can be used to project a row of action buttons
     * to the bottom of a datepicker or date range picker.
     */
    var MatDatepickerActions = /** @class */ (function () {
        function MatDatepickerActions(_datepicker, _viewContainerRef) {
            this._datepicker = _datepicker;
            this._viewContainerRef = _viewContainerRef;
        }
        MatDatepickerActions.prototype.ngAfterViewInit = function () {
            this._portal = new portal.TemplatePortal(this._template, this._viewContainerRef);
            this._datepicker.registerActions(this._portal);
        };
        MatDatepickerActions.prototype.ngOnDestroy = function () {
            var _a;
            this._datepicker.removeActions(this._portal);
            // Needs to be null checked since we initialize it in `ngAfterViewInit`.
            if (this._portal && this._portal.isAttached) {
                (_a = this._portal) === null || _a === void 0 ? void 0 : _a.detach();
            }
        };
        return MatDatepickerActions;
    }());
    MatDatepickerActions.decorators = [
        { type: i0.Component, args: [{
                    selector: 'mat-datepicker-actions, mat-date-range-picker-actions',
                    template: "\n    <ng-template>\n      <div class=\"mat-datepicker-actions\">\n        <ng-content></ng-content>\n      </div>\n    </ng-template>\n  ",
                    changeDetection: i0.ChangeDetectionStrategy.OnPush,
                    encapsulation: i0.ViewEncapsulation.None,
                    styles: [".mat-datepicker-actions{display:flex;justify-content:flex-end;align-items:center;padding:0 8px 8px 8px}.mat-datepicker-actions .mat-button-base+.mat-button-base{margin-left:8px}[dir=rtl] .mat-datepicker-actions .mat-button-base+.mat-button-base{margin-left:0;margin-right:8px}\n"]
                },] }
    ];
    MatDatepickerActions.ctorParameters = function () { return [
        { type: MatDatepickerBase },
        { type: i0.ViewContainerRef }
    ]; };
    MatDatepickerActions.propDecorators = {
        _template: [{ type: i0.ViewChild, args: [i0.TemplateRef,] }]
    };

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var MatDatepickerModule = /** @class */ (function () {
        function MatDatepickerModule() {
        }
        return MatDatepickerModule;
    }());
    MatDatepickerModule.decorators = [
        { type: i0.NgModule, args: [{
                    imports: [
                        common.CommonModule,
                        button.MatButtonModule,
                        overlay.OverlayModule,
                        a11y.A11yModule,
                        portal.PortalModule,
                        core.MatCommonModule,
                    ],
                    exports: [
                        scrolling.CdkScrollableModule,
                        MatCalendar,
                        MatCalendarBody,
                        MatDatepicker,
                        MatDatepickerContent,
                        MatDatepickerInput,
                        MatDatepickerToggle,
                        MatDatepickerToggleIcon,
                        MatMonthView,
                        MatYearView,
                        MatMultiYearView,
                        MatCalendarHeader,
                        MatDateRangeInput,
                        MatStartDate,
                        MatEndDate,
                        MatDateRangePicker,
                        MatDatepickerActions,
                        MatDatepickerCancel,
                        MatDatepickerApply
                    ],
                    declarations: [
                        MatCalendar,
                        MatCalendarBody,
                        MatDatepicker,
                        MatDatepickerContent,
                        MatDatepickerInput,
                        MatDatepickerToggle,
                        MatDatepickerToggleIcon,
                        MatMonthView,
                        MatYearView,
                        MatMultiYearView,
                        MatCalendarHeader,
                        MatDateRangeInput,
                        MatStartDate,
                        MatEndDate,
                        MatDateRangePicker,
                        MatDatepickerActions,
                        MatDatepickerCancel,
                        MatDatepickerApply
                    ],
                    providers: [
                        MatDatepickerIntl,
                        MAT_DATEPICKER_SCROLL_STRATEGY_FACTORY_PROVIDER
                    ],
                    entryComponents: [
                        MatDatepickerContent,
                        MatCalendarHeader,
                    ]
                },] }
    ];

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */

    /**
     * Generated bundle index. Do not edit.
     */

    exports.DateRange = DateRange;
    exports.DefaultMatCalendarRangeStrategy = DefaultMatCalendarRangeStrategy;
    exports.MAT_DATEPICKER_SCROLL_STRATEGY = MAT_DATEPICKER_SCROLL_STRATEGY;
    exports.MAT_DATEPICKER_SCROLL_STRATEGY_FACTORY = MAT_DATEPICKER_SCROLL_STRATEGY_FACTORY;
    exports.MAT_DATEPICKER_SCROLL_STRATEGY_FACTORY_PROVIDER = MAT_DATEPICKER_SCROLL_STRATEGY_FACTORY_PROVIDER;
    exports.MAT_DATEPICKER_VALIDATORS = MAT_DATEPICKER_VALIDATORS;
    exports.MAT_DATEPICKER_VALUE_ACCESSOR = MAT_DATEPICKER_VALUE_ACCESSOR;
    exports.MAT_DATE_RANGE_SELECTION_STRATEGY = MAT_DATE_RANGE_SELECTION_STRATEGY;
    exports.MAT_RANGE_DATE_SELECTION_MODEL_FACTORY = MAT_RANGE_DATE_SELECTION_MODEL_FACTORY;
    exports.MAT_RANGE_DATE_SELECTION_MODEL_PROVIDER = MAT_RANGE_DATE_SELECTION_MODEL_PROVIDER;
    exports.MAT_SINGLE_DATE_SELECTION_MODEL_FACTORY = MAT_SINGLE_DATE_SELECTION_MODEL_FACTORY;
    exports.MAT_SINGLE_DATE_SELECTION_MODEL_PROVIDER = MAT_SINGLE_DATE_SELECTION_MODEL_PROVIDER;
    exports.MatCalendar = MatCalendar;
    exports.MatCalendarBody = MatCalendarBody;
    exports.MatCalendarCell = MatCalendarCell;
    exports.MatCalendarHeader = MatCalendarHeader;
    exports.MatDateRangeInput = MatDateRangeInput;
    exports.MatDateRangePicker = MatDateRangePicker;
    exports.MatDateSelectionModel = MatDateSelectionModel;
    exports.MatDatepicker = MatDatepicker;
    exports.MatDatepickerActions = MatDatepickerActions;
    exports.MatDatepickerApply = MatDatepickerApply;
    exports.MatDatepickerCancel = MatDatepickerCancel;
    exports.MatDatepickerContent = MatDatepickerContent;
    exports.MatDatepickerInput = MatDatepickerInput;
    exports.MatDatepickerInputEvent = MatDatepickerInputEvent;
    exports.MatDatepickerIntl = MatDatepickerIntl;
    exports.MatDatepickerModule = MatDatepickerModule;
    exports.MatDatepickerToggle = MatDatepickerToggle;
    exports.MatDatepickerToggleIcon = MatDatepickerToggleIcon;
    exports.MatEndDate = MatEndDate;
    exports.MatMonthView = MatMonthView;
    exports.MatMultiYearView = MatMultiYearView;
    exports.MatRangeDateSelectionModel = MatRangeDateSelectionModel;
    exports.MatSingleDateSelectionModel = MatSingleDateSelectionModel;
    exports.MatStartDate = MatStartDate;
    exports.MatYearView = MatYearView;
    exports.matDatepickerAnimations = matDatepickerAnimations;
    exports.yearsPerPage = yearsPerPage;
    exports.yearsPerRow = yearsPerRow;
    exports.ɵangular_material_src_material_datepicker_datepicker_a = MAT_CALENDAR_RANGE_STRATEGY_PROVIDER_FACTORY;
    exports.ɵangular_material_src_material_datepicker_datepicker_b = MAT_CALENDAR_RANGE_STRATEGY_PROVIDER;
    exports.ɵangular_material_src_material_datepicker_datepicker_c = MatDatepickerBase;
    exports.ɵangular_material_src_material_datepicker_datepicker_d = MatDatepickerInputBase;
    exports.ɵangular_material_src_material_datepicker_datepicker_e = MAT_DATE_RANGE_INPUT_PARENT;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=material-datepicker.umd.js.map
