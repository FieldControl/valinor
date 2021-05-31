/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * List of all possible directions that can be used for sticky positioning.
 * @docs-private
 */
export const STICKY_DIRECTIONS = ['top', 'bottom', 'left', 'right'];
/**
 * Applies and removes sticky positioning styles to the `CdkTable` rows and columns cells.
 * @docs-private
 */
export class StickyStyler {
    /**
     * @param _isNativeHtmlTable Whether the sticky logic should be based on a table
     *     that uses the native `<table>` element.
     * @param _stickCellCss The CSS class that will be applied to every row/cell that has
     *     sticky positioning applied.
     * @param direction The directionality context of the table (ltr/rtl); affects column positioning
     *     by reversing left/right positions.
     * @param _isBrowser Whether the table is currently being rendered on the server or the client.
     * @param _needsPositionStickyOnElement Whether we need to specify position: sticky on cells
     *     using inline styles. If false, it is assumed that position: sticky is included in
     *     the component stylesheet for _stickCellCss.
     * @param _positionListener A listener that is notified of changes to sticky rows/columns
     *     and their dimensions.
     */
    constructor(_isNativeHtmlTable, _stickCellCss, direction, _coalescedStyleScheduler, _isBrowser = true, _needsPositionStickyOnElement = true, _positionListener) {
        this._isNativeHtmlTable = _isNativeHtmlTable;
        this._stickCellCss = _stickCellCss;
        this.direction = direction;
        this._coalescedStyleScheduler = _coalescedStyleScheduler;
        this._isBrowser = _isBrowser;
        this._needsPositionStickyOnElement = _needsPositionStickyOnElement;
        this._positionListener = _positionListener;
        this._cachedCellWidths = [];
        this._borderCellCss = {
            'top': `${_stickCellCss}-border-elem-top`,
            'bottom': `${_stickCellCss}-border-elem-bottom`,
            'left': `${_stickCellCss}-border-elem-left`,
            'right': `${_stickCellCss}-border-elem-right`,
        };
    }
    /**
     * Clears the sticky positioning styles from the row and its cells by resetting the `position`
     * style, setting the zIndex to 0, and unsetting each provided sticky direction.
     * @param rows The list of rows that should be cleared from sticking in the provided directions
     * @param stickyDirections The directions that should no longer be set as sticky on the rows.
     */
    clearStickyPositioning(rows, stickyDirections) {
        const elementsToClear = [];
        for (const row of rows) {
            // If the row isn't an element (e.g. if it's an `ng-container`),
            // it won't have inline styles or `children` so we skip it.
            if (row.nodeType !== row.ELEMENT_NODE) {
                continue;
            }
            elementsToClear.push(row);
            for (let i = 0; i < row.children.length; i++) {
                elementsToClear.push(row.children[i]);
            }
        }
        // Coalesce with sticky row/column updates (and potentially other changes like column resize).
        this._coalescedStyleScheduler.schedule(() => {
            for (const element of elementsToClear) {
                this._removeStickyStyle(element, stickyDirections);
            }
        });
    }
    /**
     * Applies sticky left and right positions to the cells of each row according to the sticky
     * states of the rendered column definitions.
     * @param rows The rows that should have its set of cells stuck according to the sticky states.
     * @param stickyStartStates A list of boolean states where each state represents whether the cell
     *     in this index position should be stuck to the start of the row.
     * @param stickyEndStates A list of boolean states where each state represents whether the cell
     *     in this index position should be stuck to the end of the row.
     * @param recalculateCellWidths Whether the sticky styler should recalculate the width of each
     *     column cell. If `false` cached widths will be used instead.
     */
    updateStickyColumns(rows, stickyStartStates, stickyEndStates, recalculateCellWidths = true) {
        if (!rows.length || !this._isBrowser || !(stickyStartStates.some(state => state) ||
            stickyEndStates.some(state => state))) {
            if (this._positionListener) {
                this._positionListener.stickyColumnsUpdated({ sizes: [] });
                this._positionListener.stickyEndColumnsUpdated({ sizes: [] });
            }
            return;
        }
        const firstRow = rows[0];
        const numCells = firstRow.children.length;
        const cellWidths = this._getCellWidths(firstRow, recalculateCellWidths);
        const startPositions = this._getStickyStartColumnPositions(cellWidths, stickyStartStates);
        const endPositions = this._getStickyEndColumnPositions(cellWidths, stickyEndStates);
        const lastStickyStart = stickyStartStates.lastIndexOf(true);
        const firstStickyEnd = stickyEndStates.indexOf(true);
        // Coalesce with sticky row updates (and potentially other changes like column resize).
        this._coalescedStyleScheduler.schedule(() => {
            const isRtl = this.direction === 'rtl';
            const start = isRtl ? 'right' : 'left';
            const end = isRtl ? 'left' : 'right';
            for (const row of rows) {
                for (let i = 0; i < numCells; i++) {
                    const cell = row.children[i];
                    if (stickyStartStates[i]) {
                        this._addStickyStyle(cell, start, startPositions[i], i === lastStickyStart);
                    }
                    if (stickyEndStates[i]) {
                        this._addStickyStyle(cell, end, endPositions[i], i === firstStickyEnd);
                    }
                }
            }
            if (this._positionListener) {
                this._positionListener.stickyColumnsUpdated({
                    sizes: lastStickyStart === -1 ?
                        [] :
                        cellWidths
                            .slice(0, lastStickyStart + 1)
                            .map((width, index) => stickyStartStates[index] ? width : null)
                });
                this._positionListener.stickyEndColumnsUpdated({
                    sizes: firstStickyEnd === -1 ?
                        [] :
                        cellWidths
                            .slice(firstStickyEnd)
                            .map((width, index) => stickyEndStates[index + firstStickyEnd] ? width : null)
                            .reverse()
                });
            }
        });
    }
    /**
     * Applies sticky positioning to the row's cells if using the native table layout, and to the
     * row itself otherwise.
     * @param rowsToStick The list of rows that should be stuck according to their corresponding
     *     sticky state and to the provided top or bottom position.
     * @param stickyStates A list of boolean states where each state represents whether the row
     *     should be stuck in the particular top or bottom position.
     * @param position The position direction in which the row should be stuck if that row should be
     *     sticky.
     *
     */
    stickRows(rowsToStick, stickyStates, position) {
        // Since we can't measure the rows on the server, we can't stick the rows properly.
        if (!this._isBrowser) {
            return;
        }
        // If positioning the rows to the bottom, reverse their order when evaluating the sticky
        // position such that the last row stuck will be "bottom: 0px" and so on. Note that the
        // sticky states need to be reversed as well.
        const rows = position === 'bottom' ? rowsToStick.slice().reverse() : rowsToStick;
        const states = position === 'bottom' ? stickyStates.slice().reverse() : stickyStates;
        // Measure row heights all at once before adding sticky styles to reduce layout thrashing.
        const stickyOffsets = [];
        const stickyCellHeights = [];
        const elementsToStick = [];
        for (let rowIndex = 0, stickyOffset = 0; rowIndex < rows.length; rowIndex++) {
            if (!states[rowIndex]) {
                continue;
            }
            stickyOffsets[rowIndex] = stickyOffset;
            const row = rows[rowIndex];
            elementsToStick[rowIndex] = this._isNativeHtmlTable ?
                Array.from(row.children) : [row];
            const height = row.getBoundingClientRect().height;
            stickyOffset += height;
            stickyCellHeights[rowIndex] = height;
        }
        const borderedRowIndex = states.lastIndexOf(true);
        // Coalesce with other sticky row updates (top/bottom), sticky columns updates
        // (and potentially other changes like column resize).
        this._coalescedStyleScheduler.schedule(() => {
            var _a, _b;
            for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
                if (!states[rowIndex]) {
                    continue;
                }
                const offset = stickyOffsets[rowIndex];
                const isBorderedRowIndex = rowIndex === borderedRowIndex;
                for (const element of elementsToStick[rowIndex]) {
                    this._addStickyStyle(element, position, offset, isBorderedRowIndex);
                }
            }
            if (position === 'top') {
                (_a = this._positionListener) === null || _a === void 0 ? void 0 : _a.stickyHeaderRowsUpdated({ sizes: stickyCellHeights, offsets: stickyOffsets, elements: elementsToStick });
            }
            else {
                (_b = this._positionListener) === null || _b === void 0 ? void 0 : _b.stickyFooterRowsUpdated({ sizes: stickyCellHeights, offsets: stickyOffsets, elements: elementsToStick });
            }
        });
    }
    /**
     * When using the native table in Safari, sticky footer cells do not stick. The only way to stick
     * footer rows is to apply sticky styling to the tfoot container. This should only be done if
     * all footer rows are sticky. If not all footer rows are sticky, remove sticky positioning from
     * the tfoot element.
     */
    updateStickyFooterContainer(tableElement, stickyStates) {
        if (!this._isNativeHtmlTable) {
            return;
        }
        const tfoot = tableElement.querySelector('tfoot');
        // Coalesce with other sticky updates (and potentially other changes like column resize).
        this._coalescedStyleScheduler.schedule(() => {
            if (stickyStates.some(state => !state)) {
                this._removeStickyStyle(tfoot, ['bottom']);
            }
            else {
                this._addStickyStyle(tfoot, 'bottom', 0, false);
            }
        });
    }
    /**
     * Removes the sticky style on the element by removing the sticky cell CSS class, re-evaluating
     * the zIndex, removing each of the provided sticky directions, and removing the
     * sticky position if there are no more directions.
     */
    _removeStickyStyle(element, stickyDirections) {
        for (const dir of stickyDirections) {
            element.style[dir] = '';
            element.classList.remove(this._borderCellCss[dir]);
        }
        // If the element no longer has any more sticky directions, remove sticky positioning and
        // the sticky CSS class.
        // Short-circuit checking element.style[dir] for stickyDirections as they
        // were already removed above.
        const hasDirection = STICKY_DIRECTIONS.some(dir => stickyDirections.indexOf(dir) === -1 && element.style[dir]);
        if (hasDirection) {
            element.style.zIndex = this._getCalculatedZIndex(element);
        }
        else {
            // When not hasDirection, _getCalculatedZIndex will always return ''.
            element.style.zIndex = '';
            if (this._needsPositionStickyOnElement) {
                element.style.position = '';
            }
            element.classList.remove(this._stickCellCss);
        }
    }
    /**
     * Adds the sticky styling to the element by adding the sticky style class, changing position
     * to be sticky (and -webkit-sticky), setting the appropriate zIndex, and adding a sticky
     * direction and value.
     */
    _addStickyStyle(element, dir, dirValue, isBorderElement) {
        element.classList.add(this._stickCellCss);
        if (isBorderElement) {
            element.classList.add(this._borderCellCss[dir]);
        }
        element.style[dir] = `${dirValue}px`;
        element.style.zIndex = this._getCalculatedZIndex(element);
        if (this._needsPositionStickyOnElement) {
            element.style.cssText += 'position: -webkit-sticky; position: sticky; ';
        }
    }
    /**
     * Calculate what the z-index should be for the element, depending on what directions (top,
     * bottom, left, right) have been set. It should be true that elements with a top direction
     * should have the highest index since these are elements like a table header. If any of those
     * elements are also sticky in another direction, then they should appear above other elements
     * that are only sticky top (e.g. a sticky column on a sticky header). Bottom-sticky elements
     * (e.g. footer rows) should then be next in the ordering such that they are below the header
     * but above any non-sticky elements. Finally, left/right sticky elements (e.g. sticky columns)
     * should minimally increment so that they are above non-sticky elements but below top and bottom
     * elements.
     */
    _getCalculatedZIndex(element) {
        const zIndexIncrements = {
            top: 100,
            bottom: 10,
            left: 1,
            right: 1,
        };
        let zIndex = 0;
        // Use `Iterable` instead of `Array` because TypeScript, as of 3.6.3,
        // loses the array generic type in the `for of`. But we *also* have to use `Array` because
        // typescript won't iterate over an `Iterable` unless you compile with `--downlevelIteration`
        for (const dir of STICKY_DIRECTIONS) {
            if (element.style[dir]) {
                zIndex += zIndexIncrements[dir];
            }
        }
        return zIndex ? `${zIndex}` : '';
    }
    /** Gets the widths for each cell in the provided row. */
    _getCellWidths(row, recalculateCellWidths = true) {
        if (!recalculateCellWidths && this._cachedCellWidths.length) {
            return this._cachedCellWidths;
        }
        const cellWidths = [];
        const firstRowCells = row.children;
        for (let i = 0; i < firstRowCells.length; i++) {
            let cell = firstRowCells[i];
            cellWidths.push(cell.getBoundingClientRect().width);
        }
        this._cachedCellWidths = cellWidths;
        return cellWidths;
    }
    /**
     * Determines the left and right positions of each sticky column cell, which will be the
     * accumulation of all sticky column cell widths to the left and right, respectively.
     * Non-sticky cells do not need to have a value set since their positions will not be applied.
     */
    _getStickyStartColumnPositions(widths, stickyStates) {
        const positions = [];
        let nextPosition = 0;
        for (let i = 0; i < widths.length; i++) {
            if (stickyStates[i]) {
                positions[i] = nextPosition;
                nextPosition += widths[i];
            }
        }
        return positions;
    }
    /**
     * Determines the left and right positions of each sticky column cell, which will be the
     * accumulation of all sticky column cell widths to the left and right, respectively.
     * Non-sticky cells do not need to have a value set since their positions will not be applied.
     */
    _getStickyEndColumnPositions(widths, stickyStates) {
        const positions = [];
        let nextPosition = 0;
        for (let i = widths.length; i > 0; i--) {
            if (stickyStates[i]) {
                positions[i] = nextPosition;
                nextPosition += widths[i];
            }
        }
        return positions;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RpY2t5LXN0eWxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvdGFibGUvc3RpY2t5LXN0eWxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFZSDs7O0dBR0c7QUFDSCxNQUFNLENBQUMsTUFBTSxpQkFBaUIsR0FBc0IsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztBQUd2Rjs7O0dBR0c7QUFDSCxNQUFNLE9BQU8sWUFBWTtJQUl2Qjs7Ozs7Ozs7Ozs7OztPQWFHO0lBQ0gsWUFBb0Isa0JBQTJCLEVBQzNCLGFBQXFCLEVBQ3RCLFNBQW9CLEVBQ25CLHdCQUFrRCxFQUNsRCxhQUFhLElBQUksRUFDUixnQ0FBZ0MsSUFBSSxFQUNwQyxpQkFBNkM7UUFOdEQsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFTO1FBQzNCLGtCQUFhLEdBQWIsYUFBYSxDQUFRO1FBQ3RCLGNBQVMsR0FBVCxTQUFTLENBQVc7UUFDbkIsNkJBQXdCLEdBQXhCLHdCQUF3QixDQUEwQjtRQUNsRCxlQUFVLEdBQVYsVUFBVSxDQUFPO1FBQ1Isa0NBQTZCLEdBQTdCLDZCQUE2QixDQUFPO1FBQ3BDLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBNEI7UUF2QmxFLHNCQUFpQixHQUFhLEVBQUUsQ0FBQztRQXdCdkMsSUFBSSxDQUFDLGNBQWMsR0FBRztZQUNwQixLQUFLLEVBQUUsR0FBRyxhQUFhLGtCQUFrQjtZQUN6QyxRQUFRLEVBQUUsR0FBRyxhQUFhLHFCQUFxQjtZQUMvQyxNQUFNLEVBQUUsR0FBRyxhQUFhLG1CQUFtQjtZQUMzQyxPQUFPLEVBQUUsR0FBRyxhQUFhLG9CQUFvQjtTQUM5QyxDQUFDO0lBQ0osQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsc0JBQXNCLENBQUMsSUFBbUIsRUFBRSxnQkFBbUM7UUFDN0UsTUFBTSxlQUFlLEdBQWtCLEVBQUUsQ0FB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QUMsS0FBSyxDQUFDLENBQUM7U0FDckQ7UUFFRCxJQUFJLENBQUMsaUJBQWlCLEdBQUcsVUFBVSxDQUFDO1FBQ3BDLE9BQU8sVUFBVSxDQUFDO0lBQ3BCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsOEJBQThCLENBQUMsTUFBZ0IsRUFBRSxZQUF1QjtRQUN0RSxNQUFNLFNBQVMsR0FBYSxFQUFFLENBQUM7UUFDL0IsSUFBSSxZQUFZLEdBQUcsQ0FBQyxDQUFDO1FBRXJCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3RDLElBQUksWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUNuQixTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsWUFBWSxDQUFDO2dCQUM1QixZQUFZLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQzNCO1NBQ0Y7UUFFRCxPQUFPLFNBQVMsQ0FBQztJQUNuQixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILDRCQUE0QixDQUFDLE1BQWdCLEVBQUUsWUFBdUI7UUFDcEUsTUFBTSxTQUFTLEdBQWEsRUFBRSxDQUFDO1FBQy9CLElBQUksWUFBWSxHQUFHLENBQUMsQ0FBQztRQUVyQixLQUFLLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUN0QyxJQUFJLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDbkIsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLFlBQVksQ0FBQztnQkFDNUIsWUFBWSxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUMzQjtTQUNGO1FBRUQsT0FBTyxTQUFTLENBQUM7SUFDbkIsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8qKlxuICogRGlyZWN0aW9ucyB0aGF0IGNhbiBiZSB1c2VkIHdoZW4gc2V0dGluZyBzdGlja3kgcG9zaXRpb25pbmcuXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbmltcG9ydCB7RGlyZWN0aW9ufSBmcm9tICdAYW5ndWxhci9jZGsvYmlkaSc7XG5pbXBvcnQge19Db2FsZXNjZWRTdHlsZVNjaGVkdWxlcn0gZnJvbSAnLi9jb2FsZXNjZWQtc3R5bGUtc2NoZWR1bGVyJztcbmltcG9ydCB7U3RpY2t5UG9zaXRpb25pbmdMaXN0ZW5lcn0gZnJvbSAnLi9zdGlja3ktcG9zaXRpb24tbGlzdGVuZXInO1xuXG5leHBvcnQgdHlwZSBTdGlja3lEaXJlY3Rpb24gPSAndG9wJyB8ICdib3R0b20nIHwgJ2xlZnQnIHwgJ3JpZ2h0JztcblxuLyoqXG4gKiBMaXN0IG9mIGFsbCBwb3NzaWJsZSBkaXJlY3Rpb25zIHRoYXQgY2FuIGJlIHVzZWQgZm9yIHN0aWNreSBwb3NpdGlvbmluZy5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuZXhwb3J0IGNvbnN0IFNUSUNLWV9ESVJFQ1RJT05TOiBTdGlja3lEaXJlY3Rpb25bXSA9IFsndG9wJywgJ2JvdHRvbScsICdsZWZ0JywgJ3JpZ2h0J107XG5cblxuLyoqXG4gKiBBcHBsaWVzIGFuZCByZW1vdmVzIHN0aWNreSBwb3NpdGlvbmluZyBzdHlsZXMgdG8gdGhlIGBDZGtUYWJsZWAgcm93cyBhbmQgY29sdW1ucyBjZWxscy5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuZXhwb3J0IGNsYXNzIFN0aWNreVN0eWxlciB7XG4gIHByaXZhdGUgX2NhY2hlZENlbGxXaWR0aHM6IG51bWJlcltdID0gW107XG4gIHByaXZhdGUgcmVhZG9ubHkgX2JvcmRlckNlbGxDc3M6IFJlYWRvbmx5PHtbZCBpbiBTdGlja3lEaXJlY3Rpb25dOiBzdHJpbmd9PjtcblxuICAvKipcbiAgICogQHBhcmFtIF9pc05hdGl2ZUh0bWxUYWJsZSBXaGV0aGVyIHRoZSBzdGlja3kgbG9naWMgc2hvdWxkIGJlIGJhc2VkIG9uIGEgdGFibGVcbiAgICogICAgIHRoYXQgdXNlcyB0aGUgbmF0aXZlIGA8dGFibGU+YCBlbGVtZW50LlxuICAgKiBAcGFyYW0gX3N0aWNrQ2VsbENzcyBUaGUgQ1NTIGNsYXNzIHRoYXQgd2lsbCBiZSBhcHBsaWVkIHRvIGV2ZXJ5IHJvdy9jZWxsIHRoYXQgaGFzXG4gICAqICAgICBzdGlja3kgcG9zaXRpb25pbmcgYXBwbGllZC5cbiAgICogQHBhcmFtIGRpcmVjdGlvbiBUaGUgZGlyZWN0aW9uYWxpdHkgY29udGV4dCBvZiB0aGUgdGFibGUgKGx0ci9ydGwpOyBhZmZlY3RzIGNvbHVtbiBwb3NpdGlvbmluZ1xuICAgKiAgICAgYnkgcmV2ZXJzaW5nIGxlZnQvcmlnaHQgcG9zaXRpb25zLlxuICAgKiBAcGFyYW0gX2lzQnJvd3NlciBXaGV0aGVyIHRoZSB0YWJsZSBpcyBjdXJyZW50bHkgYmVpbmcgcmVuZGVyZWQgb24gdGhlIHNlcnZlciBvciB0aGUgY2xpZW50LlxuICAgKiBAcGFyYW0gX25lZWRzUG9zaXRpb25TdGlja3lPbkVsZW1lbnQgV2hldGhlciB3ZSBuZWVkIHRvIHNwZWNpZnkgcG9zaXRpb246IHN0aWNreSBvbiBjZWxsc1xuICAgKiAgICAgdXNpbmcgaW5saW5lIHN0eWxlcy4gSWYgZmFsc2UsIGl0IGlzIGFzc3VtZWQgdGhhdCBwb3NpdGlvbjogc3RpY2t5IGlzIGluY2x1ZGVkIGluXG4gICAqICAgICB0aGUgY29tcG9uZW50IHN0eWxlc2hlZXQgZm9yIF9zdGlja0NlbGxDc3MuXG4gICAqIEBwYXJhbSBfcG9zaXRpb25MaXN0ZW5lciBBIGxpc3RlbmVyIHRoYXQgaXMgbm90aWZpZWQgb2YgY2hhbmdlcyB0byBzdGlja3kgcm93cy9jb2x1bW5zXG4gICAqICAgICBhbmQgdGhlaXIgZGltZW5zaW9ucy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2lzTmF0aXZlSHRtbFRhYmxlOiBib29sZWFuLFxuICAgICAgICAgICAgICBwcml2YXRlIF9zdGlja0NlbGxDc3M6IHN0cmluZyxcbiAgICAgICAgICAgICAgcHVibGljIGRpcmVjdGlvbjogRGlyZWN0aW9uLFxuICAgICAgICAgICAgICBwcml2YXRlIF9jb2FsZXNjZWRTdHlsZVNjaGVkdWxlcjogX0NvYWxlc2NlZFN0eWxlU2NoZWR1bGVyLFxuICAgICAgICAgICAgICBwcml2YXRlIF9pc0Jyb3dzZXIgPSB0cnVlLFxuICAgICAgICAgICAgICBwcml2YXRlIHJlYWRvbmx5IF9uZWVkc1Bvc2l0aW9uU3RpY2t5T25FbGVtZW50ID0gdHJ1ZSxcbiAgICAgICAgICAgICAgcHJpdmF0ZSByZWFkb25seSBfcG9zaXRpb25MaXN0ZW5lcj86IFN0aWNreVBvc2l0aW9uaW5nTGlzdGVuZXIpIHtcbiAgICB0aGlzLl9ib3JkZXJDZWxsQ3NzID0ge1xuICAgICAgJ3RvcCc6IGAke19zdGlja0NlbGxDc3N9LWJvcmRlci1lbGVtLXRvcGAsXG4gICAgICAnYm90dG9tJzogYCR7X3N0aWNrQ2VsbENzc30tYm9yZGVyLWVsZW0tYm90dG9tYCxcbiAgICAgICdsZWZ0JzogYCR7X3N0aWNrQ2VsbENzc30tYm9yZGVyLWVsZW0tbGVmdGAsXG4gICAgICAncmlnaHQnOiBgJHtfc3RpY2tDZWxsQ3NzfS1ib3JkZXItZWxlbS1yaWdodGAsXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhcnMgdGhlIHN0aWNreSBwb3NpdGlvbmluZyBzdHlsZXMgZnJvbSB0aGUgcm93IGFuZCBpdHMgY2VsbHMgYnkgcmVzZXR0aW5nIHRoZSBgcG9zaXRpb25gXG4gICAqIHN0eWxlLCBzZXR0aW5nIHRoZSB6SW5kZXggdG8gMCwgYW5kIHVuc2V0dGluZyBlYWNoIHByb3ZpZGVkIHN0aWNreSBkaXJlY3Rpb24uXG4gICAqIEBwYXJhbSByb3dzIFRoZSBsaXN0IG9mIHJvd3MgdGhhdCBzaG91bGQgYmUgY2xlYXJlZCBmcm9tIHN0aWNraW5nIGluIHRoZSBwcm92aWRlZCBkaXJlY3Rpb25zXG4gICAqIEBwYXJhbSBzdGlja3lEaXJlY3Rpb25zIFRoZSBkaXJlY3Rpb25zIHRoYXQgc2hvdWxkIG5vIGxvbmdlciBiZSBzZXQgYXMgc3RpY2t5IG9uIHRoZSByb3dzLlxuICAgKi9cbiAgY2xlYXJTdGlja3lQb3NpdGlvbmluZyhyb3dzOiBIVE1MRWxlbWVudFtdLCBzdGlja3lEaXJlY3Rpb25zOiBTdGlja3lEaXJlY3Rpb25bXSkge1xuICAgIGNvbnN0IGVsZW1lbnRzVG9DbGVhcjogSFRNTEVsZW1lbnRbXSA9IFtdO1xuICAgIGZvciAoY29uc3Qgcm93IG9mIHJvd3MpIHtcbiAgICAgIC8vIElmIHRoZSByb3cgaXNuJ3QgYW4gZWxlbWVudCAoZS5nLiBpZiBpdCdzIGFuIGBuZy1jb250YWluZXJgKSxcbiAgICAgIC8vIGl0IHdvbid0IGhhdmUgaW5saW5lIHN0eWxlcyBvciBgY2hpbGRyZW5gIHNvIHdlIHNraXAgaXQuXG4gICAgICBpZiAocm93Lm5vZGVUeXBlICE9PSByb3cuRUxFTUVOVF9OT0RFKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBlbGVtZW50c1RvQ2xlYXIucHVzaChyb3cpO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCByb3cuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZWxlbWVudHNUb0NsZWFyLnB1c2gocm93LmNoaWxkcmVuW2ldIGFzIEhUTUxFbGVtZW50KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBDb2FsZXNjZSB3aXRoIHN0aWNreSByb3cvY29sdW1uIHVwZGF0ZXMgKGFuZCBwb3RlbnRpYWxseSBvdGhlciBjaGFuZ2VzIGxpa2UgY29sdW1uIHJlc2l6ZSkuXG4gICAgdGhpcy5fY29hbGVzY2VkU3R5bGVTY2hlZHVsZXIuc2NoZWR1bGUoKCkgPT4ge1xuICAgICAgZm9yIChjb25zdCBlbGVtZW50IG9mIGVsZW1lbnRzVG9DbGVhcikge1xuICAgICAgICB0aGlzLl9yZW1vdmVTdGlja3lTdHlsZShlbGVtZW50LCBzdGlja3lEaXJlY3Rpb25zKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBcHBsaWVzIHN0aWNreSBsZWZ0IGFuZCByaWdodCBwb3NpdGlvbnMgdG8gdGhlIGNlbGxzIG9mIGVhY2ggcm93IGFjY29yZGluZyB0byB0aGUgc3RpY2t5XG4gICAqIHN0YXRlcyBvZiB0aGUgcmVuZGVyZWQgY29sdW1uIGRlZmluaXRpb25zLlxuICAgKiBAcGFyYW0gcm93cyBUaGUgcm93cyB0aGF0IHNob3VsZCBoYXZlIGl0cyBzZXQgb2YgY2VsbHMgc3R1Y2sgYWNjb3JkaW5nIHRvIHRoZSBzdGlja3kgc3RhdGVzLlxuICAgKiBAcGFyYW0gc3RpY2t5U3RhcnRTdGF0ZXMgQSBsaXN0IG9mIGJvb2xlYW4gc3RhdGVzIHdoZXJlIGVhY2ggc3RhdGUgcmVwcmVzZW50cyB3aGV0aGVyIHRoZSBjZWxsXG4gICAqICAgICBpbiB0aGlzIGluZGV4IHBvc2l0aW9uIHNob3VsZCBiZSBzdHVjayB0byB0aGUgc3RhcnQgb2YgdGhlIHJvdy5cbiAgICogQHBhcmFtIHN0aWNreUVuZFN0YXRlcyBBIGxpc3Qgb2YgYm9vbGVhbiBzdGF0ZXMgd2hlcmUgZWFjaCBzdGF0ZSByZXByZXNlbnRzIHdoZXRoZXIgdGhlIGNlbGxcbiAgICogICAgIGluIHRoaXMgaW5kZXggcG9zaXRpb24gc2hvdWxkIGJlIHN0dWNrIHRvIHRoZSBlbmQgb2YgdGhlIHJvdy5cbiAgICogQHBhcmFtIHJlY2FsY3VsYXRlQ2VsbFdpZHRocyBXaGV0aGVyIHRoZSBzdGlja3kgc3R5bGVyIHNob3VsZCByZWNhbGN1bGF0ZSB0aGUgd2lkdGggb2YgZWFjaFxuICAgKiAgICAgY29sdW1uIGNlbGwuIElmIGBmYWxzZWAgY2FjaGVkIHdpZHRocyB3aWxsIGJlIHVzZWQgaW5zdGVhZC5cbiAgICovXG4gIHVwZGF0ZVN0aWNreUNvbHVtbnMoXG4gICAgICByb3dzOiBIVE1MRWxlbWVudFtdLCBzdGlja3lTdGFydFN0YXRlczogYm9vbGVhbltdLCBzdGlja3lFbmRTdGF0ZXM6IGJvb2xlYW5bXSxcbiAgICAgIHJlY2FsY3VsYXRlQ2VsbFdpZHRocyA9IHRydWUpIHtcbiAgICBpZiAoIXJvd3MubGVuZ3RoIHx8ICF0aGlzLl9pc0Jyb3dzZXIgfHwgIShzdGlja3lTdGFydFN0YXRlcy5zb21lKHN0YXRlID0+IHN0YXRlKSB8fFxuICAgICAgICBzdGlja3lFbmRTdGF0ZXMuc29tZShzdGF0ZSA9PiBzdGF0ZSkpKSB7XG4gICAgICBpZiAodGhpcy5fcG9zaXRpb25MaXN0ZW5lcikge1xuICAgICAgICB0aGlzLl9wb3NpdGlvbkxpc3RlbmVyLnN0aWNreUNvbHVtbnNVcGRhdGVkKHtzaXplczogW119KTtcbiAgICAgICAgdGhpcy5fcG9zaXRpb25MaXN0ZW5lci5zdGlja3lFbmRDb2x1bW5zVXBkYXRlZCh7c2l6ZXM6IFtdfSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBmaXJzdFJvdyA9IHJvd3NbMF07XG4gICAgY29uc3QgbnVtQ2VsbHMgPSBmaXJzdFJvdy5jaGlsZHJlbi5sZW5ndGg7XG4gICAgY29uc3QgY2VsbFdpZHRoczogbnVtYmVyW10gPSB0aGlzLl9nZXRDZWxsV2lkdGhzKGZpcnN0Um93LCByZWNhbGN1bGF0ZUNlbGxXaWR0aHMpO1xuXG4gICAgY29uc3Qgc3RhcnRQb3NpdGlvbnMgPSB0aGlzLl9nZXRTdGlja3lTdGFydENvbHVtblBvc2l0aW9ucyhjZWxsV2lkdGhzLCBzdGlja3lTdGFydFN0YXRlcyk7XG4gICAgY29uc3QgZW5kUG9zaXRpb25zID0gdGhpcy5fZ2V0U3RpY2t5RW5kQ29sdW1uUG9zaXRpb25zKGNlbGxXaWR0aHMsIHN0aWNreUVuZFN0YXRlcyk7XG5cbiAgICBjb25zdCBsYXN0U3RpY2t5U3RhcnQgPSBzdGlja3lTdGFydFN0YXRlcy5sYXN0SW5kZXhPZih0cnVlKTtcbiAgICBjb25zdCBmaXJzdFN0aWNreUVuZCA9IHN0aWNreUVuZFN0YXRlcy5pbmRleE9mKHRydWUpO1xuXG4gICAgLy8gQ29hbGVzY2Ugd2l0aCBzdGlja3kgcm93IHVwZGF0ZXMgKGFuZCBwb3RlbnRpYWxseSBvdGhlciBjaGFuZ2VzIGxpa2UgY29sdW1uIHJlc2l6ZSkuXG4gICAgdGhpcy5fY29hbGVzY2VkU3R5bGVTY2hlZHVsZXIuc2NoZWR1bGUoKCkgPT4ge1xuICAgICAgY29uc3QgaXNSdGwgPSB0aGlzLmRpcmVjdGlvbiA9PT0gJ3J0bCc7XG4gICAgICBjb25zdCBzdGFydCA9IGlzUnRsID8gJ3JpZ2h0JyA6ICdsZWZ0JztcbiAgICAgIGNvbnN0IGVuZCA9IGlzUnRsID8gJ2xlZnQnIDogJ3JpZ2h0JztcblxuICAgICAgZm9yIChjb25zdCByb3cgb2Ygcm93cykge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG51bUNlbGxzOyBpKyspIHtcbiAgICAgICAgICBjb25zdCBjZWxsID0gcm93LmNoaWxkcmVuW2ldIGFzIEhUTUxFbGVtZW50O1xuICAgICAgICAgIGlmIChzdGlja3lTdGFydFN0YXRlc1tpXSkge1xuICAgICAgICAgICAgdGhpcy5fYWRkU3RpY2t5U3R5bGUoY2VsbCwgc3RhcnQsIHN0YXJ0UG9zaXRpb25zW2ldLCBpID09PSBsYXN0U3RpY2t5U3RhcnQpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChzdGlja3lFbmRTdGF0ZXNbaV0pIHtcbiAgICAgICAgICAgIHRoaXMuX2FkZFN0aWNreVN0eWxlKGNlbGwsIGVuZCwgZW5kUG9zaXRpb25zW2ldLCBpID09PSBmaXJzdFN0aWNreUVuZCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLl9wb3NpdGlvbkxpc3RlbmVyKSB7XG4gICAgICAgIHRoaXMuX3Bvc2l0aW9uTGlzdGVuZXIuc3RpY2t5Q29sdW1uc1VwZGF0ZWQoe1xuICAgICAgICAgIHNpemVzOiBsYXN0U3RpY2t5U3RhcnQgPT09IC0xID9cbiAgICAgICAgICAgIFtdIDpcbiAgICAgICAgICAgIGNlbGxXaWR0aHNcbiAgICAgICAgICAgICAgICAuc2xpY2UoMCwgbGFzdFN0aWNreVN0YXJ0ICsgMSlcbiAgICAgICAgICAgICAgICAubWFwKCh3aWR0aCwgaW5kZXgpID0+IHN0aWNreVN0YXJ0U3RhdGVzW2luZGV4XSA/IHdpZHRoIDogbnVsbClcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuX3Bvc2l0aW9uTGlzdGVuZXIuc3RpY2t5RW5kQ29sdW1uc1VwZGF0ZWQoe1xuICAgICAgICAgIHNpemVzOiBmaXJzdFN0aWNreUVuZCA9PT0gLTEgP1xuICAgICAgICAgICAgW10gOlxuICAgICAgICAgICAgY2VsbFdpZHRoc1xuICAgICAgICAgICAgICAgIC5zbGljZShmaXJzdFN0aWNreUVuZClcbiAgICAgICAgICAgICAgICAubWFwKCh3aWR0aCwgaW5kZXgpID0+IHN0aWNreUVuZFN0YXRlc1tpbmRleCArIGZpcnN0U3RpY2t5RW5kXSA/IHdpZHRoIDogbnVsbClcbiAgICAgICAgICAgICAgICAucmV2ZXJzZSgpXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEFwcGxpZXMgc3RpY2t5IHBvc2l0aW9uaW5nIHRvIHRoZSByb3cncyBjZWxscyBpZiB1c2luZyB0aGUgbmF0aXZlIHRhYmxlIGxheW91dCwgYW5kIHRvIHRoZVxuICAgKiByb3cgaXRzZWxmIG90aGVyd2lzZS5cbiAgICogQHBhcmFtIHJvd3NUb1N0aWNrIFRoZSBsaXN0IG9mIHJvd3MgdGhhdCBzaG91bGQgYmUgc3R1Y2sgYWNjb3JkaW5nIHRvIHRoZWlyIGNvcnJlc3BvbmRpbmdcbiAgICogICAgIHN0aWNreSBzdGF0ZSBhbmQgdG8gdGhlIHByb3ZpZGVkIHRvcCBvciBib3R0b20gcG9zaXRpb24uXG4gICAqIEBwYXJhbSBzdGlja3lTdGF0ZXMgQSBsaXN0IG9mIGJvb2xlYW4gc3RhdGVzIHdoZXJlIGVhY2ggc3RhdGUgcmVwcmVzZW50cyB3aGV0aGVyIHRoZSByb3dcbiAgICogICAgIHNob3VsZCBiZSBzdHVjayBpbiB0aGUgcGFydGljdWxhciB0b3Agb3IgYm90dG9tIHBvc2l0aW9uLlxuICAgKiBAcGFyYW0gcG9zaXRpb24gVGhlIHBvc2l0aW9uIGRpcmVjdGlvbiBpbiB3aGljaCB0aGUgcm93IHNob3VsZCBiZSBzdHVjayBpZiB0aGF0IHJvdyBzaG91bGQgYmVcbiAgICogICAgIHN0aWNreS5cbiAgICpcbiAgICovXG4gIHN0aWNrUm93cyhyb3dzVG9TdGljazogSFRNTEVsZW1lbnRbXSwgc3RpY2t5U3RhdGVzOiBib29sZWFuW10sIHBvc2l0aW9uOiAndG9wJyB8ICdib3R0b20nKSB7XG4gICAgLy8gU2luY2Ugd2UgY2FuJ3QgbWVhc3VyZSB0aGUgcm93cyBvbiB0aGUgc2VydmVyLCB3ZSBjYW4ndCBzdGljayB0aGUgcm93cyBwcm9wZXJseS5cbiAgICBpZiAoIXRoaXMuX2lzQnJvd3Nlcikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIElmIHBvc2l0aW9uaW5nIHRoZSByb3dzIHRvIHRoZSBib3R0b20sIHJldmVyc2UgdGhlaXIgb3JkZXIgd2hlbiBldmFsdWF0aW5nIHRoZSBzdGlja3lcbiAgICAvLyBwb3NpdGlvbiBzdWNoIHRoYXQgdGhlIGxhc3Qgcm93IHN0dWNrIHdpbGwgYmUgXCJib3R0b206IDBweFwiIGFuZCBzbyBvbi4gTm90ZSB0aGF0IHRoZVxuICAgIC8vIHN0aWNreSBzdGF0ZXMgbmVlZCB0byBiZSByZXZlcnNlZCBhcyB3ZWxsLlxuICAgIGNvbnN0IHJvd3MgPSBwb3NpdGlvbiA9PT0gJ2JvdHRvbScgPyByb3dzVG9TdGljay5zbGljZSgpLnJldmVyc2UoKSA6IHJvd3NUb1N0aWNrO1xuICAgIGNvbnN0IHN0YXRlcyA9IHBvc2l0aW9uID09PSAnYm90dG9tJyA/IHN0aWNreVN0YXRlcy5zbGljZSgpLnJldmVyc2UoKSA6IHN0aWNreVN0YXRlcztcblxuICAgIC8vIE1lYXN1cmUgcm93IGhlaWdodHMgYWxsIGF0IG9uY2UgYmVmb3JlIGFkZGluZyBzdGlja3kgc3R5bGVzIHRvIHJlZHVjZSBsYXlvdXQgdGhyYXNoaW5nLlxuICAgIGNvbnN0IHN0aWNreU9mZnNldHM6IG51bWJlcltdID0gW107XG4gICAgY29uc3Qgc3RpY2t5Q2VsbEhlaWdodHM6IChudW1iZXJ8dW5kZWZpbmVkKVtdID0gW107XG4gICAgY29uc3QgZWxlbWVudHNUb1N0aWNrOiBIVE1MRWxlbWVudFtdW10gPSBbXTtcbiAgICBmb3IgKGxldCByb3dJbmRleCA9IDAsIHN0aWNreU9mZnNldCA9IDA7IHJvd0luZGV4IDwgcm93cy5sZW5ndGg7IHJvd0luZGV4KyspIHtcbiAgICAgIGlmICghc3RhdGVzW3Jvd0luZGV4XSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgc3RpY2t5T2Zmc2V0c1tyb3dJbmRleF0gPSBzdGlja3lPZmZzZXQ7XG4gICAgICBjb25zdCByb3cgPSByb3dzW3Jvd0luZGV4XTtcbiAgICAgIGVsZW1lbnRzVG9TdGlja1tyb3dJbmRleF0gPSB0aGlzLl9pc05hdGl2ZUh0bWxUYWJsZSA/XG4gICAgICAgICAgQXJyYXkuZnJvbShyb3cuY2hpbGRyZW4pIGFzIEhUTUxFbGVtZW50W10gOiBbcm93XTtcblxuICAgICAgY29uc3QgaGVpZ2h0ID0gcm93LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodDtcbiAgICAgIHN0aWNreU9mZnNldCArPSBoZWlnaHQ7XG4gICAgICBzdGlja3lDZWxsSGVpZ2h0c1tyb3dJbmRleF0gPSBoZWlnaHQ7XG4gICAgfVxuXG4gICAgY29uc3QgYm9yZGVyZWRSb3dJbmRleCA9IHN0YXRlcy5sYXN0SW5kZXhPZih0cnVlKTtcblxuICAgIC8vIENvYWxlc2NlIHdpdGggb3RoZXIgc3RpY2t5IHJvdyB1cGRhdGVzICh0b3AvYm90dG9tKSwgc3RpY2t5IGNvbHVtbnMgdXBkYXRlc1xuICAgIC8vIChhbmQgcG90ZW50aWFsbHkgb3RoZXIgY2hhbmdlcyBsaWtlIGNvbHVtbiByZXNpemUpLlxuICAgIHRoaXMuX2NvYWxlc2NlZFN0eWxlU2NoZWR1bGVyLnNjaGVkdWxlKCgpID0+IHtcbiAgICAgIGZvciAobGV0IHJvd0luZGV4ID0gMDsgcm93SW5kZXggPCByb3dzLmxlbmd0aDsgcm93SW5kZXgrKykge1xuICAgICAgICBpZiAoIXN0YXRlc1tyb3dJbmRleF0pIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG9mZnNldCA9IHN0aWNreU9mZnNldHNbcm93SW5kZXhdO1xuICAgICAgICBjb25zdCBpc0JvcmRlcmVkUm93SW5kZXggPSByb3dJbmRleCA9PT0gYm9yZGVyZWRSb3dJbmRleDtcbiAgICAgICAgZm9yIChjb25zdCBlbGVtZW50IG9mIGVsZW1lbnRzVG9TdGlja1tyb3dJbmRleF0pIHtcbiAgICAgICAgICB0aGlzLl9hZGRTdGlja3lTdHlsZShlbGVtZW50LCBwb3NpdGlvbiwgb2Zmc2V0LCBpc0JvcmRlcmVkUm93SW5kZXgpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChwb3NpdGlvbiA9PT0gJ3RvcCcpIHtcbiAgICAgICAgdGhpcy5fcG9zaXRpb25MaXN0ZW5lcj8uc3RpY2t5SGVhZGVyUm93c1VwZGF0ZWQoXG4gICAgICAgICAgICB7c2l6ZXM6IHN0aWNreUNlbGxIZWlnaHRzLCBvZmZzZXRzOiBzdGlja3lPZmZzZXRzLCBlbGVtZW50czogZWxlbWVudHNUb1N0aWNrfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9wb3NpdGlvbkxpc3RlbmVyPy5zdGlja3lGb290ZXJSb3dzVXBkYXRlZChcbiAgICAgICAgICAgIHtzaXplczogc3RpY2t5Q2VsbEhlaWdodHMsIG9mZnNldHM6IHN0aWNreU9mZnNldHMsIGVsZW1lbnRzOiBlbGVtZW50c1RvU3RpY2t9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGVuIHVzaW5nIHRoZSBuYXRpdmUgdGFibGUgaW4gU2FmYXJpLCBzdGlja3kgZm9vdGVyIGNlbGxzIGRvIG5vdCBzdGljay4gVGhlIG9ubHkgd2F5IHRvIHN0aWNrXG4gICAqIGZvb3RlciByb3dzIGlzIHRvIGFwcGx5IHN0aWNreSBzdHlsaW5nIHRvIHRoZSB0Zm9vdCBjb250YWluZXIuIFRoaXMgc2hvdWxkIG9ubHkgYmUgZG9uZSBpZlxuICAgKiBhbGwgZm9vdGVyIHJvd3MgYXJlIHN0aWNreS4gSWYgbm90IGFsbCBmb290ZXIgcm93cyBhcmUgc3RpY2t5LCByZW1vdmUgc3RpY2t5IHBvc2l0aW9uaW5nIGZyb21cbiAgICogdGhlIHRmb290IGVsZW1lbnQuXG4gICAqL1xuICB1cGRhdGVTdGlja3lGb290ZXJDb250YWluZXIodGFibGVFbGVtZW50OiBFbGVtZW50LCBzdGlja3lTdGF0ZXM6IGJvb2xlYW5bXSkge1xuICAgIGlmICghdGhpcy5faXNOYXRpdmVIdG1sVGFibGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB0Zm9vdCA9IHRhYmxlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCd0Zm9vdCcpITtcblxuICAgIC8vIENvYWxlc2NlIHdpdGggb3RoZXIgc3RpY2t5IHVwZGF0ZXMgKGFuZCBwb3RlbnRpYWxseSBvdGhlciBjaGFuZ2VzIGxpa2UgY29sdW1uIHJlc2l6ZSkuXG4gICAgdGhpcy5fY29hbGVzY2VkU3R5bGVTY2hlZHVsZXIuc2NoZWR1bGUoKCkgPT4ge1xuICAgICAgaWYgKHN0aWNreVN0YXRlcy5zb21lKHN0YXRlID0+ICFzdGF0ZSkpIHtcbiAgICAgICAgdGhpcy5fcmVtb3ZlU3RpY2t5U3R5bGUodGZvb3QsIFsnYm90dG9tJ10pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fYWRkU3RpY2t5U3R5bGUodGZvb3QsICdib3R0b20nLCAwLCBmYWxzZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyB0aGUgc3RpY2t5IHN0eWxlIG9uIHRoZSBlbGVtZW50IGJ5IHJlbW92aW5nIHRoZSBzdGlja3kgY2VsbCBDU1MgY2xhc3MsIHJlLWV2YWx1YXRpbmdcbiAgICogdGhlIHpJbmRleCwgcmVtb3ZpbmcgZWFjaCBvZiB0aGUgcHJvdmlkZWQgc3RpY2t5IGRpcmVjdGlvbnMsIGFuZCByZW1vdmluZyB0aGVcbiAgICogc3RpY2t5IHBvc2l0aW9uIGlmIHRoZXJlIGFyZSBubyBtb3JlIGRpcmVjdGlvbnMuXG4gICAqL1xuICBfcmVtb3ZlU3RpY2t5U3R5bGUoZWxlbWVudDogSFRNTEVsZW1lbnQsIHN0aWNreURpcmVjdGlvbnM6IFN0aWNreURpcmVjdGlvbltdKSB7XG4gICAgZm9yIChjb25zdCBkaXIgb2Ygc3RpY2t5RGlyZWN0aW9ucykge1xuICAgICAgZWxlbWVudC5zdHlsZVtkaXJdID0gJyc7XG4gICAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUodGhpcy5fYm9yZGVyQ2VsbENzc1tkaXJdKTtcbiAgICB9XG5cbiAgICAvLyBJZiB0aGUgZWxlbWVudCBubyBsb25nZXIgaGFzIGFueSBtb3JlIHN0aWNreSBkaXJlY3Rpb25zLCByZW1vdmUgc3RpY2t5IHBvc2l0aW9uaW5nIGFuZFxuICAgIC8vIHRoZSBzdGlja3kgQ1NTIGNsYXNzLlxuICAgIC8vIFNob3J0LWNpcmN1aXQgY2hlY2tpbmcgZWxlbWVudC5zdHlsZVtkaXJdIGZvciBzdGlja3lEaXJlY3Rpb25zIGFzIHRoZXlcbiAgICAvLyB3ZXJlIGFscmVhZHkgcmVtb3ZlZCBhYm92ZS5cbiAgICBjb25zdCBoYXNEaXJlY3Rpb24gPSBTVElDS1lfRElSRUNUSU9OUy5zb21lKGRpciA9PlxuICAgICAgICBzdGlja3lEaXJlY3Rpb25zLmluZGV4T2YoZGlyKSA9PT0gLTEgJiYgZWxlbWVudC5zdHlsZVtkaXJdKTtcbiAgICBpZiAoaGFzRGlyZWN0aW9uKSB7XG4gICAgICBlbGVtZW50LnN0eWxlLnpJbmRleCA9IHRoaXMuX2dldENhbGN1bGF0ZWRaSW5kZXgoZWxlbWVudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFdoZW4gbm90IGhhc0RpcmVjdGlvbiwgX2dldENhbGN1bGF0ZWRaSW5kZXggd2lsbCBhbHdheXMgcmV0dXJuICcnLlxuICAgICAgZWxlbWVudC5zdHlsZS56SW5kZXggPSAnJztcbiAgICAgIGlmICh0aGlzLl9uZWVkc1Bvc2l0aW9uU3RpY2t5T25FbGVtZW50KSB7XG4gICAgICAgIGVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAnJztcbiAgICAgIH1cbiAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSh0aGlzLl9zdGlja0NlbGxDc3MpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIHRoZSBzdGlja3kgc3R5bGluZyB0byB0aGUgZWxlbWVudCBieSBhZGRpbmcgdGhlIHN0aWNreSBzdHlsZSBjbGFzcywgY2hhbmdpbmcgcG9zaXRpb25cbiAgICogdG8gYmUgc3RpY2t5IChhbmQgLXdlYmtpdC1zdGlja3kpLCBzZXR0aW5nIHRoZSBhcHByb3ByaWF0ZSB6SW5kZXgsIGFuZCBhZGRpbmcgYSBzdGlja3lcbiAgICogZGlyZWN0aW9uIGFuZCB2YWx1ZS5cbiAgICovXG4gIF9hZGRTdGlja3lTdHlsZShlbGVtZW50OiBIVE1MRWxlbWVudCwgZGlyOiBTdGlja3lEaXJlY3Rpb24sIGRpclZhbHVlOiBudW1iZXIsXG4gICAgICBpc0JvcmRlckVsZW1lbnQ6IGJvb2xlYW4pIHtcbiAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQodGhpcy5fc3RpY2tDZWxsQ3NzKTtcbiAgICBpZiAoaXNCb3JkZXJFbGVtZW50KSB7XG4gICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQodGhpcy5fYm9yZGVyQ2VsbENzc1tkaXJdKTtcbiAgICB9XG4gICAgZWxlbWVudC5zdHlsZVtkaXJdID0gYCR7ZGlyVmFsdWV9cHhgO1xuICAgIGVsZW1lbnQuc3R5bGUuekluZGV4ID0gdGhpcy5fZ2V0Q2FsY3VsYXRlZFpJbmRleChlbGVtZW50KTtcbiAgICBpZiAodGhpcy5fbmVlZHNQb3NpdGlvblN0aWNreU9uRWxlbWVudCkge1xuICAgICAgZWxlbWVudC5zdHlsZS5jc3NUZXh0ICs9ICdwb3NpdGlvbjogLXdlYmtpdC1zdGlja3k7IHBvc2l0aW9uOiBzdGlja3k7ICc7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENhbGN1bGF0ZSB3aGF0IHRoZSB6LWluZGV4IHNob3VsZCBiZSBmb3IgdGhlIGVsZW1lbnQsIGRlcGVuZGluZyBvbiB3aGF0IGRpcmVjdGlvbnMgKHRvcCxcbiAgICogYm90dG9tLCBsZWZ0LCByaWdodCkgaGF2ZSBiZWVuIHNldC4gSXQgc2hvdWxkIGJlIHRydWUgdGhhdCBlbGVtZW50cyB3aXRoIGEgdG9wIGRpcmVjdGlvblxuICAgKiBzaG91bGQgaGF2ZSB0aGUgaGlnaGVzdCBpbmRleCBzaW5jZSB0aGVzZSBhcmUgZWxlbWVudHMgbGlrZSBhIHRhYmxlIGhlYWRlci4gSWYgYW55IG9mIHRob3NlXG4gICAqIGVsZW1lbnRzIGFyZSBhbHNvIHN0aWNreSBpbiBhbm90aGVyIGRpcmVjdGlvbiwgdGhlbiB0aGV5IHNob3VsZCBhcHBlYXIgYWJvdmUgb3RoZXIgZWxlbWVudHNcbiAgICogdGhhdCBhcmUgb25seSBzdGlja3kgdG9wIChlLmcuIGEgc3RpY2t5IGNvbHVtbiBvbiBhIHN0aWNreSBoZWFkZXIpLiBCb3R0b20tc3RpY2t5IGVsZW1lbnRzXG4gICAqIChlLmcuIGZvb3RlciByb3dzKSBzaG91bGQgdGhlbiBiZSBuZXh0IGluIHRoZSBvcmRlcmluZyBzdWNoIHRoYXQgdGhleSBhcmUgYmVsb3cgdGhlIGhlYWRlclxuICAgKiBidXQgYWJvdmUgYW55IG5vbi1zdGlja3kgZWxlbWVudHMuIEZpbmFsbHksIGxlZnQvcmlnaHQgc3RpY2t5IGVsZW1lbnRzIChlLmcuIHN0aWNreSBjb2x1bW5zKVxuICAgKiBzaG91bGQgbWluaW1hbGx5IGluY3JlbWVudCBzbyB0aGF0IHRoZXkgYXJlIGFib3ZlIG5vbi1zdGlja3kgZWxlbWVudHMgYnV0IGJlbG93IHRvcCBhbmQgYm90dG9tXG4gICAqIGVsZW1lbnRzLlxuICAgKi9cbiAgX2dldENhbGN1bGF0ZWRaSW5kZXgoZWxlbWVudDogSFRNTEVsZW1lbnQpOiBzdHJpbmcge1xuICAgIGNvbnN0IHpJbmRleEluY3JlbWVudHMgPSB7XG4gICAgICB0b3A6IDEwMCxcbiAgICAgIGJvdHRvbTogMTAsXG4gICAgICBsZWZ0OiAxLFxuICAgICAgcmlnaHQ6IDEsXG4gICAgfTtcblxuICAgIGxldCB6SW5kZXggPSAwO1xuICAgIC8vIFVzZSBgSXRlcmFibGVgIGluc3RlYWQgb2YgYEFycmF5YCBiZWNhdXNlIFR5cGVTY3JpcHQsIGFzIG9mIDMuNi4zLFxuICAgIC8vIGxvc2VzIHRoZSBhcnJheSBnZW5lcmljIHR5cGUgaW4gdGhlIGBmb3Igb2ZgLiBCdXQgd2UgKmFsc28qIGhhdmUgdG8gdXNlIGBBcnJheWAgYmVjYXVzZVxuICAgIC8vIHR5cGVzY3JpcHQgd29uJ3QgaXRlcmF0ZSBvdmVyIGFuIGBJdGVyYWJsZWAgdW5sZXNzIHlvdSBjb21waWxlIHdpdGggYC0tZG93bmxldmVsSXRlcmF0aW9uYFxuICAgIGZvciAoY29uc3QgZGlyIG9mIFNUSUNLWV9ESVJFQ1RJT05TIGFzIEl0ZXJhYmxlPFN0aWNreURpcmVjdGlvbj4gJiBTdGlja3lEaXJlY3Rpb25bXSkge1xuICAgICAgaWYgKGVsZW1lbnQuc3R5bGVbZGlyXSkge1xuICAgICAgICB6SW5kZXggKz0gekluZGV4SW5jcmVtZW50c1tkaXJdO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB6SW5kZXggPyBgJHt6SW5kZXh9YCA6ICcnO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIHdpZHRocyBmb3IgZWFjaCBjZWxsIGluIHRoZSBwcm92aWRlZCByb3cuICovXG4gIF9nZXRDZWxsV2lkdGhzKHJvdzogSFRNTEVsZW1lbnQsIHJlY2FsY3VsYXRlQ2VsbFdpZHRocyA9IHRydWUpOiBudW1iZXJbXSB7XG4gICAgaWYgKCFyZWNhbGN1bGF0ZUNlbGxXaWR0aHMgJiYgdGhpcy5fY2FjaGVkQ2VsbFdpZHRocy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiB0aGlzLl9jYWNoZWRDZWxsV2lkdGhzO1xuICAgIH1cblxuICAgIGNvbnN0IGNlbGxXaWR0aHM6IG51bWJlcltdID0gW107XG4gICAgY29uc3QgZmlyc3RSb3dDZWxscyA9IHJvdy5jaGlsZHJlbjtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZpcnN0Um93Q2VsbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxldCBjZWxsOiBIVE1MRWxlbWVudCA9IGZpcnN0Um93Q2VsbHNbaV0gYXMgSFRNTEVsZW1lbnQ7XG4gICAgICBjZWxsV2lkdGhzLnB1c2goY2VsbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aCk7XG4gICAgfVxuXG4gICAgdGhpcy5fY2FjaGVkQ2VsbFdpZHRocyA9IGNlbGxXaWR0aHM7XG4gICAgcmV0dXJuIGNlbGxXaWR0aHM7XG4gIH1cblxuICAvKipcbiAgICogRGV0ZXJtaW5lcyB0aGUgbGVmdCBhbmQgcmlnaHQgcG9zaXRpb25zIG9mIGVhY2ggc3RpY2t5IGNvbHVtbiBjZWxsLCB3aGljaCB3aWxsIGJlIHRoZVxuICAgKiBhY2N1bXVsYXRpb24gb2YgYWxsIHN0aWNreSBjb2x1bW4gY2VsbCB3aWR0aHMgdG8gdGhlIGxlZnQgYW5kIHJpZ2h0LCByZXNwZWN0aXZlbHkuXG4gICAqIE5vbi1zdGlja3kgY2VsbHMgZG8gbm90IG5lZWQgdG8gaGF2ZSBhIHZhbHVlIHNldCBzaW5jZSB0aGVpciBwb3NpdGlvbnMgd2lsbCBub3QgYmUgYXBwbGllZC5cbiAgICovXG4gIF9nZXRTdGlja3lTdGFydENvbHVtblBvc2l0aW9ucyh3aWR0aHM6IG51bWJlcltdLCBzdGlja3lTdGF0ZXM6IGJvb2xlYW5bXSk6IG51bWJlcltdIHtcbiAgICBjb25zdCBwb3NpdGlvbnM6IG51bWJlcltdID0gW107XG4gICAgbGV0IG5leHRQb3NpdGlvbiA9IDA7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHdpZHRocy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHN0aWNreVN0YXRlc1tpXSkge1xuICAgICAgICBwb3NpdGlvbnNbaV0gPSBuZXh0UG9zaXRpb247XG4gICAgICAgIG5leHRQb3NpdGlvbiArPSB3aWR0aHNbaV07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHBvc2l0aW9ucztcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIHRoZSBsZWZ0IGFuZCByaWdodCBwb3NpdGlvbnMgb2YgZWFjaCBzdGlja3kgY29sdW1uIGNlbGwsIHdoaWNoIHdpbGwgYmUgdGhlXG4gICAqIGFjY3VtdWxhdGlvbiBvZiBhbGwgc3RpY2t5IGNvbHVtbiBjZWxsIHdpZHRocyB0byB0aGUgbGVmdCBhbmQgcmlnaHQsIHJlc3BlY3RpdmVseS5cbiAgICogTm9uLXN0aWNreSBjZWxscyBkbyBub3QgbmVlZCB0byBoYXZlIGEgdmFsdWUgc2V0IHNpbmNlIHRoZWlyIHBvc2l0aW9ucyB3aWxsIG5vdCBiZSBhcHBsaWVkLlxuICAgKi9cbiAgX2dldFN0aWNreUVuZENvbHVtblBvc2l0aW9ucyh3aWR0aHM6IG51bWJlcltdLCBzdGlja3lTdGF0ZXM6IGJvb2xlYW5bXSk6IG51bWJlcltdIHtcbiAgICBjb25zdCBwb3NpdGlvbnM6IG51bWJlcltdID0gW107XG4gICAgbGV0IG5leHRQb3NpdGlvbiA9IDA7XG5cbiAgICBmb3IgKGxldCBpID0gd2lkdGhzLmxlbmd0aDsgaSA+IDA7IGktLSkge1xuICAgICAgaWYgKHN0aWNreVN0YXRlc1tpXSkge1xuICAgICAgICBwb3NpdGlvbnNbaV0gPSBuZXh0UG9zaXRpb247XG4gICAgICAgIG5leHRQb3NpdGlvbiArPSB3aWR0aHNbaV07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHBvc2l0aW9ucztcbiAgfVxufVxuIl19