/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef, EventEmitter, NgZone, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
/** Extra CSS classes that can be associated with a calendar cell. */
export declare type MatCalendarCellCssClasses = string | string[] | Set<string> | {
    [key: string]: any;
};
/** Function that can generate the extra classes that should be added to a calendar cell. */
export declare type MatCalendarCellClassFunction<D> = (date: D, view: 'month' | 'year' | 'multi-year') => MatCalendarCellCssClasses;
/**
 * An internal class that represents the data corresponding to a single calendar cell.
 * @docs-private
 */
export declare class MatCalendarCell<D = any> {
    value: number;
    displayValue: string;
    ariaLabel: string;
    enabled: boolean;
    cssClasses: MatCalendarCellCssClasses;
    compareValue: number;
    rawValue?: D | undefined;
    constructor(value: number, displayValue: string, ariaLabel: string, enabled: boolean, cssClasses?: MatCalendarCellCssClasses, compareValue?: number, rawValue?: D | undefined);
}
/** Event emitted when a date inside the calendar is triggered as a result of a user action. */
export interface MatCalendarUserEvent<D> {
    value: D;
    event: Event;
}
/**
 * An internal component used to display calendar data in a table.
 * @docs-private
 */
export declare class MatCalendarBody implements OnChanges, OnDestroy {
    private _elementRef;
    private _ngZone;
    /**
     * Used to skip the next focus event when rendering the preview range.
     * We need a flag like this, because some browsers fire focus events asynchronously.
     */
    private _skipNextFocus;
    /** The label for the table. (e.g. "Jan 2017"). */
    label: string;
    /** The cells to display in the table. */
    rows: MatCalendarCell[][];
    /** The value in the table that corresponds to today. */
    todayValue: number;
    /** Start value of the selected date range. */
    startValue: number;
    /** End value of the selected date range. */
    endValue: number;
    /** The minimum number of free cells needed to fit the label in the first row. */
    labelMinRequiredCells: number;
    /** The number of columns in the table. */
    numCols: number;
    /** The cell number of the active cell in the table. */
    activeCell: number;
    /** Whether a range is being selected. */
    isRange: boolean;
    /**
     * The aspect ratio (width / height) to use for the cells in the table. This aspect ratio will be
     * maintained even as the table resizes.
     */
    cellAspectRatio: number;
    /** Start of the comparison range. */
    comparisonStart: number | null;
    /** End of the comparison range. */
    comparisonEnd: number | null;
    /** Start of the preview range. */
    previewStart: number | null;
    /** End of the preview range. */
    previewEnd: number | null;
    /** Emits when a new value is selected. */
    readonly selectedValueChange: EventEmitter<MatCalendarUserEvent<number>>;
    /** Emits when the preview has changed as a result of a user action. */
    readonly previewChange: EventEmitter<MatCalendarUserEvent<MatCalendarCell<any> | null>>;
    /** The number of blank cells to put at the beginning for the first row. */
    _firstRowOffset: number;
    /** Padding for the individual date cells. */
    _cellPadding: string;
    /** Width of an individual cell. */
    _cellWidth: string;
    constructor(_elementRef: ElementRef<HTMLElement>, _ngZone: NgZone);
    /** Called when a cell is clicked. */
    _cellClicked(cell: MatCalendarCell, event: MouseEvent): void;
    /** Returns whether a cell should be marked as selected. */
    _isSelected(value: number): boolean;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    /** Returns whether a cell is active. */
    _isActiveCell(rowIndex: number, colIndex: number): boolean;
    /** Focuses the active cell after the microtask queue is empty. */
    _focusActiveCell(movePreview?: boolean): void;
    /** Gets whether a value is the start of the main range. */
    _isRangeStart(value: number): boolean;
    /** Gets whether a value is the end of the main range. */
    _isRangeEnd(value: number): boolean;
    /** Gets whether a value is within the currently-selected range. */
    _isInRange(value: number): boolean;
    /** Gets whether a value is the start of the comparison range. */
    _isComparisonStart(value: number): boolean;
    /** Whether the cell is a start bridge cell between the main and comparison ranges. */
    _isComparisonBridgeStart(value: number, rowIndex: number, colIndex: number): boolean;
    /** Whether the cell is an end bridge cell between the main and comparison ranges. */
    _isComparisonBridgeEnd(value: number, rowIndex: number, colIndex: number): boolean;
    /** Gets whether a value is the end of the comparison range. */
    _isComparisonEnd(value: number): boolean;
    /** Gets whether a value is within the current comparison range. */
    _isInComparisonRange(value: number): boolean;
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
    _isComparisonIdentical(value: number): boolean;
    /** Gets whether a value is the start of the preview range. */
    _isPreviewStart(value: number): boolean;
    /** Gets whether a value is the end of the preview range. */
    _isPreviewEnd(value: number): boolean;
    /** Gets whether a value is inside the preview range. */
    _isInPreview(value: number): boolean;
    /**
     * Event handler for when the user enters an element
     * inside the calendar body (e.g. by hovering in or focus).
     */
    private _enterHandler;
    /**
     * Event handler for when the user's pointer leaves an element
     * inside the calendar body (e.g. by hovering out or blurring).
     */
    private _leaveHandler;
    /** Finds the MatCalendarCell that corresponds to a DOM node. */
    private _getCellFromElement;
}
