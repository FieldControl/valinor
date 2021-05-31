/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * RegExp that can be used to check whether a value will
 * be allowed inside a CSS `calc()` expression.
 */
const cssCalcAllowedValue = /^-?\d+((\.\d+)?[A-Za-z%$]?)+$/;
/**
 * Sets the style properties for an individual tile, given the position calculated by the
 * Tile Coordinator.
 * @docs-private
 */
export class TileStyler {
    constructor() {
        this._rows = 0;
        this._rowspan = 0;
    }
    /**
     * Adds grid-list layout info once it is available. Cannot be processed in the constructor
     * because these properties haven't been calculated by that point.
     *
     * @param gutterSize Size of the grid's gutter.
     * @param tracker Instance of the TileCoordinator.
     * @param cols Amount of columns in the grid.
     * @param direction Layout direction of the grid.
     */
    init(gutterSize, tracker, cols, direction) {
        this._gutterSize = normalizeUnits(gutterSize);
        this._rows = tracker.rowCount;
        this._rowspan = tracker.rowspan;
        this._cols = cols;
        this._direction = direction;
    }
    /**
     * Computes the amount of space a single 1x1 tile would take up (width or height).
     * Used as a basis for other calculations.
     * @param sizePercent Percent of the total grid-list space that one 1x1 tile would take up.
     * @param gutterFraction Fraction of the gutter size taken up by one 1x1 tile.
     * @return The size of a 1x1 tile as an expression that can be evaluated via CSS calc().
     */
    getBaseTileSize(sizePercent, gutterFraction) {
        // Take the base size percent (as would be if evenly dividing the size between cells),
        // and then subtracting the size of one gutter. However, since there are no gutters on the
        // edges, each tile only uses a fraction (gutterShare = numGutters / numCells) of the gutter
        // size. (Imagine having one gutter per tile, and then breaking up the extra gutter on the
        // edge evenly among the cells).
        return `(${sizePercent}% - (${this._gutterSize} * ${gutterFraction}))`;
    }
    /**
     * Gets The horizontal or vertical position of a tile, e.g., the 'top' or 'left' property value.
     * @param offset Number of tiles that have already been rendered in the row/column.
     * @param baseSize Base size of a 1x1 tile (as computed in getBaseTileSize).
     * @return Position of the tile as a CSS calc() expression.
     */
    getTilePosition(baseSize, offset) {
        // The position comes the size of a 1x1 tile plus gutter for each previous tile in the
        // row/column (offset).
        return offset === 0 ? '0' : calc(`(${baseSize} + ${this._gutterSize}) * ${offset}`);
    }
    /**
     * Gets the actual size of a tile, e.g., width or height, taking rowspan or colspan into account.
     * @param baseSize Base size of a 1x1 tile (as computed in getBaseTileSize).
     * @param span The tile's rowspan or colspan.
     * @return Size of the tile as a CSS calc() expression.
     */
    getTileSize(baseSize, span) {
        return `(${baseSize} * ${span}) + (${span - 1} * ${this._gutterSize})`;
    }
    /**
     * Sets the style properties to be applied to a tile for the given row and column index.
     * @param tile Tile to which to apply the styling.
     * @param rowIndex Index of the tile's row.
     * @param colIndex Index of the tile's column.
     */
    setStyle(tile, rowIndex, colIndex) {
        // Percent of the available horizontal space that one column takes up.
        let percentWidthPerTile = 100 / this._cols;
        // Fraction of the vertical gutter size that each column takes up.
        // For example, if there are 5 columns, each column uses 4/5 = 0.8 times the gutter width.
        let gutterWidthFractionPerTile = (this._cols - 1) / this._cols;
        this.setColStyles(tile, colIndex, percentWidthPerTile, gutterWidthFractionPerTile);
        this.setRowStyles(tile, rowIndex, percentWidthPerTile, gutterWidthFractionPerTile);
    }
    /** Sets the horizontal placement of the tile in the list. */
    setColStyles(tile, colIndex, percentWidth, gutterWidth) {
        // Base horizontal size of a column.
        let baseTileWidth = this.getBaseTileSize(percentWidth, gutterWidth);
        // The width and horizontal position of each tile is always calculated the same way, but the
        // height and vertical position depends on the rowMode.
        let side = this._direction === 'rtl' ? 'right' : 'left';
        tile._setStyle(side, this.getTilePosition(baseTileWidth, colIndex));
        tile._setStyle('width', calc(this.getTileSize(baseTileWidth, tile.colspan)));
    }
    /**
     * Calculates the total size taken up by gutters across one axis of a list.
     */
    getGutterSpan() {
        return `${this._gutterSize} * (${this._rowspan} - 1)`;
    }
    /**
     * Calculates the total size taken up by tiles across one axis of a list.
     * @param tileHeight Height of the tile.
     */
    getTileSpan(tileHeight) {
        return `${this._rowspan} * ${this.getTileSize(tileHeight, 1)}`;
    }
    /**
     * Calculates the computed height and returns the correct style property to set.
     * This method can be implemented by each type of TileStyler.
     * @docs-private
     */
    getComputedHeight() { return null; }
}
/**
 * This type of styler is instantiated when the user passes in a fixed row height.
 * Example `<mat-grid-list cols="3" rowHeight="100px">`
 * @docs-private
 */
export class FixedTileStyler extends TileStyler {
    constructor(fixedRowHeight) {
        super();
        this.fixedRowHeight = fixedRowHeight;
    }
    init(gutterSize, tracker, cols, direction) {
        super.init(gutterSize, tracker, cols, direction);
        this.fixedRowHeight = normalizeUnits(this.fixedRowHeight);
        if (!cssCalcAllowedValue.test(this.fixedRowHeight) &&
            (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw Error(`Invalid value "${this.fixedRowHeight}" set as rowHeight.`);
        }
    }
    setRowStyles(tile, rowIndex) {
        tile._setStyle('top', this.getTilePosition(this.fixedRowHeight, rowIndex));
        tile._setStyle('height', calc(this.getTileSize(this.fixedRowHeight, tile.rowspan)));
    }
    getComputedHeight() {
        return [
            'height', calc(`${this.getTileSpan(this.fixedRowHeight)} + ${this.getGutterSpan()}`)
        ];
    }
    reset(list) {
        list._setListStyle(['height', null]);
        if (list._tiles) {
            list._tiles.forEach(tile => {
                tile._setStyle('top', null);
                tile._setStyle('height', null);
            });
        }
    }
}
/**
 * This type of styler is instantiated when the user passes in a width:height ratio
 * for the row height.  Example `<mat-grid-list cols="3" rowHeight="3:1">`
 * @docs-private
 */
export class RatioTileStyler extends TileStyler {
    constructor(value) {
        super();
        this._parseRatio(value);
    }
    setRowStyles(tile, rowIndex, percentWidth, gutterWidth) {
        let percentHeightPerTile = percentWidth / this.rowHeightRatio;
        this.baseTileHeight = this.getBaseTileSize(percentHeightPerTile, gutterWidth);
        // Use padding-top and margin-top to maintain the given aspect ratio, as
        // a percentage-based value for these properties is applied versus the *width* of the
        // containing block. See http://www.w3.org/TR/CSS2/box.html#margin-properties
        tile._setStyle('marginTop', this.getTilePosition(this.baseTileHeight, rowIndex));
        tile._setStyle('paddingTop', calc(this.getTileSize(this.baseTileHeight, tile.rowspan)));
    }
    getComputedHeight() {
        return [
            'paddingBottom', calc(`${this.getTileSpan(this.baseTileHeight)} + ${this.getGutterSpan()}`)
        ];
    }
    reset(list) {
        list._setListStyle(['paddingBottom', null]);
        list._tiles.forEach(tile => {
            tile._setStyle('marginTop', null);
            tile._setStyle('paddingTop', null);
        });
    }
    _parseRatio(value) {
        const ratioParts = value.split(':');
        if (ratioParts.length !== 2 && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw Error(`mat-grid-list: invalid ratio given for row-height: "${value}"`);
        }
        this.rowHeightRatio = parseFloat(ratioParts[0]) / parseFloat(ratioParts[1]);
    }
}
/**
 * This type of styler is instantiated when the user selects a "fit" row height mode.
 * In other words, the row height will reflect the total height of the container divided
 * by the number of rows.  Example `<mat-grid-list cols="3" rowHeight="fit">`
 *
 * @docs-private
 */
export class FitTileStyler extends TileStyler {
    setRowStyles(tile, rowIndex) {
        // Percent of the available vertical space that one row takes up.
        let percentHeightPerTile = 100 / this._rowspan;
        // Fraction of the horizontal gutter size that each column takes up.
        let gutterHeightPerTile = (this._rows - 1) / this._rows;
        // Base vertical size of a column.
        let baseTileHeight = this.getBaseTileSize(percentHeightPerTile, gutterHeightPerTile);
        tile._setStyle('top', this.getTilePosition(baseTileHeight, rowIndex));
        tile._setStyle('height', calc(this.getTileSize(baseTileHeight, tile.rowspan)));
    }
    reset(list) {
        if (list._tiles) {
            list._tiles.forEach(tile => {
                tile._setStyle('top', null);
                tile._setStyle('height', null);
            });
        }
    }
}
/** Wraps a CSS string in a calc function */
function calc(exp) {
    return `calc(${exp})`;
}
/** Appends pixels to a CSS string if no units are given. */
function normalizeUnits(value) {
    return value.match(/([A-Za-z%]+)$/) ? value : `${value}px`;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGlsZS1zdHlsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvZ3JpZC1saXN0L3RpbGUtc3R5bGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQU1IOzs7R0FHRztBQUNILE1BQU0sbUJBQW1CLEdBQUcsK0JBQStCLENBQUM7QUFRNUQ7Ozs7R0FJRztBQUNILE1BQU0sT0FBZ0IsVUFBVTtJQUFoQztRQUVFLFVBQUssR0FBVyxDQUFDLENBQUM7UUFDbEIsYUFBUSxHQUFXLENBQUMsQ0FBQztJQWlJdkIsQ0FBQztJQTdIQzs7Ozs7Ozs7T0FRRztJQUNILElBQUksQ0FBQyxVQUFrQixFQUFFLE9BQXdCLEVBQUUsSUFBWSxFQUFFLFNBQWlCO1FBQ2hGLElBQUksQ0FBQyxXQUFXLEdBQUcsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzlDLElBQUksQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQztRQUM5QixJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUM7UUFDaEMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDbEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7SUFDOUIsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNILGVBQWUsQ0FBQyxXQUFtQixFQUFFLGNBQXNCO1FBQ3pELHNGQUFzRjtRQUN0RiwwRkFBMEY7UUFDMUYsNEZBQTRGO1FBQzVGLDBGQUEwRjtRQUMxRixnQ0FBZ0M7UUFDaEMsT0FBTyxJQUFJLFdBQVcsUUFBUSxJQUFJLENBQUMsV0FBVyxNQUFNLGNBQWMsSUFBSSxDQUFDO0lBQ3pFLENBQUM7SUFHRDs7Ozs7T0FLRztJQUNILGVBQWUsQ0FBQyxRQUFnQixFQUFFLE1BQWM7UUFDOUMsc0ZBQXNGO1FBQ3RGLHVCQUF1QjtRQUN2QixPQUFPLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxD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LEVBQUU7WUFDZixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDekIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQzVCLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ2pDLENBQUMsQ0FBQyxDQUFDO1NBQ0o7SUFDSCxDQUFDO0NBQ0Y7QUFHRCw0Q0FBNEM7QUFDNUMsU0FBUyxJQUFJLENBQUMsR0FBVztJQUN2QixPQUFPLFFBQVEsR0FBRyxHQUFHLENBQUM7QUFDeEIsQ0FBQztBQUdELDREQUE0RDtBQUM1RCxTQUFTLGNBQWMsQ0FBQyxLQUFhO0lBQ25DLE9BQU8sS0FBSyxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssSUFBSSxDQUFDO0FBQzdELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtRdWVyeUxpc3R9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtNYXRHcmlkVGlsZX0gZnJvbSAnLi9ncmlkLXRpbGUnO1xuaW1wb3J0IHtUaWxlQ29vcmRpbmF0b3J9IGZyb20gJy4vdGlsZS1jb29yZGluYXRvcic7XG5cbi8qKlxuICogUmVnRXhwIHRoYXQgY2FuIGJlIHVzZWQgdG8gY2hlY2sgd2hldGhlciBhIHZhbHVlIHdpbGxcbiAqIGJlIGFsbG93ZWQgaW5zaWRlIGEgQ1NTIGBjYWxjKClgIGV4cHJlc3Npb24uXG4gKi9cbmNvbnN0IGNzc0NhbGNBbGxvd2VkVmFsdWUgPSAvXi0/XFxkKygoXFwuXFxkKyk/W0EtWmEteiUkXT8pKyQvO1xuXG4vKiogT2JqZWN0IHRoYXQgY2FuIGJlIHN0eWxlZCBieSB0aGUgYFRpbGVTdHlsZXJgLiAqL1xuZXhwb3J0IGludGVyZmFjZSBUaWxlU3R5bGVUYXJnZXQge1xuICBfc2V0TGlzdFN0eWxlKHN0eWxlOiBbc3RyaW5nLCBzdHJpbmcgfCBudWxsXSB8IG51bGwpOiB2b2lkO1xuICBfdGlsZXM6IFF1ZXJ5TGlzdDxNYXRHcmlkVGlsZT47XG59XG5cbi8qKlxuICogU2V0cyB0aGUgc3R5bGUgcHJvcGVydGllcyBmb3IgYW4gaW5kaXZpZHVhbCB0aWxlLCBnaXZlbiB0aGUgcG9zaXRpb24gY2FsY3VsYXRlZCBieSB0aGVcbiAqIFRpbGUgQ29vcmRpbmF0b3IuXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBUaWxlU3R5bGVyIHtcbiAgX2d1dHRlclNpemU6IHN0cmluZztcbiAgX3Jvd3M6IG51bWJlciA9IDA7XG4gIF9yb3dzcGFuOiBudW1iZXIgPSAwO1xuICBfY29sczogbnVtYmVyO1xuICBfZGlyZWN0aW9uOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIEFkZHMgZ3JpZC1saXN0IGxheW91dCBpbmZvIG9uY2UgaXQgaXMgYXZhaWxhYmxlLiBDYW5ub3QgYmUgcHJvY2Vzc2VkIGluIHRoZSBjb25zdHJ1Y3RvclxuICAgKiBiZWNhdXNlIHRoZXNlIHByb3BlcnRpZXMgaGF2ZW4ndCBiZWVuIGNhbGN1bGF0ZWQgYnkgdGhhdCBwb2ludC5cbiAgICpcbiAgICogQHBhcmFtIGd1dHRlclNpemUgU2l6ZSBvZiB0aGUgZ3JpZCdzIGd1dHRlci5cbiAgICogQHBhcmFtIHRyYWNrZXIgSW5zdGFuY2Ugb2YgdGhlIFRpbGVDb29yZGluYXRvci5cbiAgICogQHBhcmFtIGNvbHMgQW1vdW50IG9mIGNvbHVtbnMgaW4gdGhlIGdyaWQuXG4gICAqIEBwYXJhbSBkaXJlY3Rpb24gTGF5b3V0IGRpcmVjdGlvbiBvZiB0aGUgZ3JpZC5cbiAgICovXG4gIGluaXQoZ3V0dGVyU2l6ZTogc3RyaW5nLCB0cmFja2VyOiBUaWxlQ29vcmRpbmF0b3IsIGNvbHM6IG51bWJlciwgZGlyZWN0aW9uOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9ndXR0ZXJTaXplID0gbm9ybWFsaXplVW5pdHMoZ3V0dGVyU2l6ZSk7XG4gICAgdGhpcy5fcm93cyA9IHRyYWNrZXIucm93Q291bnQ7XG4gICAgdGhpcy5fcm93c3BhbiA9IHRyYWNrZXIucm93c3BhbjtcbiAgICB0aGlzLl9jb2xzID0gY29scztcbiAgICB0aGlzLl9kaXJlY3Rpb24gPSBkaXJlY3Rpb247XG4gIH1cblxuICAvKipcbiAgICogQ29tcHV0ZXMgdGhlIGFtb3VudCBvZiBzcGFjZSBhIHNpbmdsZSAxeDEgdGlsZSB3b3VsZCB0YWtlIHVwICh3aWR0aCBvciBoZWlnaHQpLlxuICAgKiBVc2VkIGFzIGEgYmFzaXMgZm9yIG90aGVyIGNhbGN1bGF0aW9ucy5cbiAgICogQHBhcmFtIHNpemVQZXJjZW50IFBlcmNlbnQgb2YgdGhlIHRvdGFsIGdyaWQtbGlzdCBzcGFjZSB0aGF0IG9uZSAxeDEgdGlsZSB3b3VsZCB0YWtlIHVwLlxuICAgKiBAcGFyYW0gZ3V0dGVyRnJhY3Rpb24gRnJhY3Rpb24gb2YgdGhlIGd1dHRlciBzaXplIHRha2VuIHVwIGJ5IG9uZSAxeDEgdGlsZS5cbiAgICogQHJldHVybiBUaGUgc2l6ZSBvZiBhIDF4MSB0aWxlIGFzIGFuIGV4cHJlc3Npb24gdGhhdCBjYW4gYmUgZXZhbHVhdGVkIHZpYSBDU1MgY2FsYygpLlxuICAgKi9cbiAgZ2V0QmFzZVRpbGVTaXplKHNpemVQZXJjZW50OiBudW1iZXIsIGd1dHRlckZyYWN0aW9uOiBudW1iZXIpOiBzdHJpbmcge1xuICAgIC8vIFRha2UgdGhlIGJhc2Ugc2l6ZSBwZXJjZW50IChhcyB3b3VsZCBiZSBpZiBldmVubHkgZGl2aWRpbmcgdGhlIHNpemUgYmV0d2VlbiBjZWxscyksXG4gICAgLy8gYW5kIHRoZW4gc3VidHJhY3RpbmcgdGhlIHNpemUgb2Ygb25lIGd1dHRlci4gSG93ZXZlciwgc2luY2UgdGhlcmUgYXJlIG5vIGd1dHRlcnMgb24gdGhlXG4gICAgLy8gZWRnZXMsIGVhY2ggdGlsZSBvbmx5IHVzZXMgYSBmcmFjdGlvbiAoZ3V0dGVyU2hhcmUgPSBudW1HdXR0ZXJzIC8gbnVtQ2VsbHMpIG9mIHRoZSBndXR0ZXJcbiAgICAvLyBzaXplLiAoSW1hZ2luZSBoYXZpbmcgb25lIGd1dHRlciBwZXIgdGlsZSwgYW5kIHRoZW4gYnJlYWtpbmcgdXAgdGhlIGV4dHJhIGd1dHRlciBvbiB0aGVcbiAgICAvLyBlZGdlIGV2ZW5seSBhbW9uZyB0aGUgY2VsbHMpLlxuICAgIHJldHVybiBgKCR7c2l6ZVBlcmNlbnR9JSAtICgke3RoaXMuX2d1dHRlclNpemV9ICogJHtndXR0ZXJGcmFjdGlvbn0pKWA7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBHZXRzIFRoZSBob3Jpem9udGFsIG9yIHZlcnRpY2FsIHBvc2l0aW9uIG9mIGEgdGlsZSwgZS5nLiwgdGhlICd0b3AnIG9yICdsZWZ0JyBwcm9wZXJ0eSB2YWx1ZS5cbiAgICogQHBhcmFtIG9mZnNldCBOdW1iZXIgb2YgdGlsZXMgdGhhdCBoYXZlIGFscmVhZHkgYmVlbiByZW5kZXJlZCBpbiB0aGUgcm93L2NvbHVtbi5cbiAgICogQHBhcmFtIGJhc2VTaXplIEJhc2Ugc2l6ZSBvZiBhIDF4MSB0aWxlIChhcyBjb21wdXRlZCBpbiBnZXRCYXNlVGlsZVNpemUpLlxuICAgKiBAcmV0dXJuIFBvc2l0aW9uIG9mIHRoZSB0aWxlIGFzIGEgQ1NTIGNhbGMoKSBleHByZXNzaW9uLlxuICAgKi9cbiAgZ2V0VGlsZVBvc2l0aW9uKGJhc2VTaXplOiBzdHJpbmcsIG9mZnNldDogbnVtYmVyKTogc3RyaW5nIHtcbiAgICAvLyBUaGUgcG9zaXRpb24gY29tZXMgdGhlIHNpemUgb2YgYSAxeDEgdGlsZSBwbHVzIGd1dHRlciBmb3IgZWFjaCBwcmV2aW91cyB0aWxlIGluIHRoZVxuICAgIC8vIHJvdy9jb2x1bW4gKG9mZnNldCkuXG4gICAgcmV0dXJuIG9mZnNldCA9PT0gMCA/ICcwJyA6IGNhbGMoYCgke2Jhc2VTaXplfSArICR7dGhpcy5fZ3V0dGVyU2l6ZX0pICogJHtvZmZzZXR9YCk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBhY3R1YWwgc2l6ZSBvZiBhIHRpbGUsIGUuZy4sIHdpZHRoIG9yIGhlaWdodCwgdGFraW5nIHJvd3NwYW4gb3IgY29sc3BhbiBpbnRvIGFjY291bnQuXG4gICAqIEBwYXJhbSBiYXNlU2l6ZSBCYXNlIHNpemUgb2YgYSAxeDEgdGlsZSAoYXMgY29tcHV0ZWQgaW4gZ2V0QmFzZVRpbGVTaXplKS5cbiAgICogQHBhcmFtIHNwYW4gVGhlIHRpbGUncyByb3dzcGFuIG9yIGNvbHNwYW4uXG4gICAqIEByZXR1cm4gU2l6ZSBvZiB0aGUgdGlsZSBhcyBhIENTUyBjYWxjKCkgZXhwcmVzc2lvbi5cbiAgICovXG4gIGdldFRpbGVTaXplKGJhc2VTaXplOiBzdHJpbmcsIHNwYW46IG51bWJlcik6IHN0cmluZyB7XG4gICAgcmV0dXJuIGAoJHtiYXNlU2l6ZX0gKiAke3NwYW59KSArICgke3NwYW4gLSAxfSAqICR7dGhpcy5fZ3V0dGVyU2l6ZX0pYDtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHN0eWxlIHByb3BlcnRpZXMgdG8gYmUgYXBwbGllZCB0byBhIHRpbGUgZm9yIHRoZSBnaXZlbiByb3cgYW5kIGNvbHVtbiBpbmRleC5cbiAgICogQHBhcmFtIHRpbGUgVGlsZSB0byB3aGljaCB0byBhcHBseSB0aGUgc3R5bGluZy5cbiAgICogQHBhcmFtIHJvd0luZGV4IEluZGV4IG9mIHRoZSB0aWxlJ3Mgcm93LlxuICAgKiBAcGFyYW0gY29sSW5kZXggSW5kZXggb2YgdGhlIHRpbGUncyBjb2x1bW4uXG4gICAqL1xuICBzZXRTdHlsZSh0aWxlOiBNYXRHcmlkVGlsZSwgcm93SW5kZXg6IG51bWJlciwgY29sSW5kZXg6IG51bWJlcik6IHZvaWQge1xuICAgIC8vIFBlcmNlbnQgb2YgdGhlIGF2YWlsYWJsZSBob3Jpem9udGFsIHNwYWNlIHRoYXQgb25lIGNvbHVtbiB0YWtlcyB1cC5cbiAgICBsZXQgcGVyY2VudFdpZHRoUGVyVGlsZSA9IDEwMCAvIHRoaXMuX2NvbHM7XG5cbiAgICAvLyBGcmFjdGlvbiBvZiB0aGUgdmVydGljYWwgZ3V0dGVyIHNpemUgdGhhdCBlYWNoIGNvbHVtbiB0YWtlcyB1cC5cbiAgICAvLyBGb3IgZXhhbXBsZSwgaWYgdGhlcmUgYXJlIDUgY29sdW1ucywgZWFjaCBjb2x1bW4gdXNlcyA0LzUgPSAwLjggdGltZXMgdGhlIGd1dHRlciB3aWR0aC5cbiAgICBsZXQgZ3V0dGVyV2lkdGhGcmFjdGlvblBlclRpbGUgPSAodGhpcy5fY29scyAtIDEpIC8gdGhpcy5fY29scztcblxuICAgIHRoaXMuc2V0Q29sU3R5bGVzKHRpbGUsIGNvbEluZGV4LCBwZXJjZW50V2lkdGhQZXJUaWxlLCBndXR0ZXJXaWR0aEZyYWN0aW9uUGVyVGlsZSk7XG4gICAgdGhpcy5zZXRSb3dTdHlsZXModGlsZSwgcm93SW5kZXgsIHBlcmNlbnRXaWR0aFBlclRpbGUsIGd1dHRlcldpZHRoRnJhY3Rpb25QZXJUaWxlKTtcbiAgfVxuXG4gIC8qKiBTZXRzIHRoZSBob3Jpem9udGFsIHBsYWNlbWVudCBvZiB0aGUgdGlsZSBpbiB0aGUgbGlzdC4gKi9cbiAgc2V0Q29sU3R5bGVzKHRpbGU6IE1hdEdyaWRUaWxlLCBjb2xJbmRleDogbnVtYmVyLCBwZXJjZW50V2lkdGg6IG51bWJlcixcbiAgICAgICAgICAgICAgIGd1dHRlcldpZHRoOiBudW1iZXIpIHtcbiAgICAvLyBCYXNlIGhvcml6b250YWwgc2l6ZSBvZiBhIGNvbHVtbi5cbiAgICBsZXQgYmFzZVRpbGVXaWR0aCA9IHRoaXMuZ2V0QmFzZVRpbGVTaXplKHBlcmNlbnRXaWR0aCwgZ3V0dGVyV2lkdGgpO1xuXG4gICAgLy8gVGhlIHdpZHRoIGFuZCBob3Jpem9udGFsIHBvc2l0aW9uIG9mIGVhY2ggdGlsZSBpcyBhbHdheXMgY2FsY3VsYXRlZCB0aGUgc2FtZSB3YXksIGJ1dCB0aGVcbiAgICAvLyBoZWlnaHQgYW5kIHZlcnRpY2FsIHBvc2l0aW9uIGRlcGVuZHMgb24gdGhlIHJvd01vZGUuXG4gICAgbGV0IHNpZGUgPSB0aGlzLl9kaXJlY3Rpb24gPT09ICdydGwnID8gJ3JpZ2h0JyA6ICdsZWZ0JztcbiAgICB0aWxlLl9zZXRTdHlsZShzaWRlLCB0aGlzLmdldFRpbGVQb3NpdGlvbihiYXNlVGlsZVdpZHRoLCBjb2xJbmRleCkpO1xuICAgIHRpbGUuX3NldFN0eWxlKCd3aWR0aCcsIGNhbGModGhpcy5nZXRUaWxlU2l6ZShiYXNlVGlsZVdpZHRoLCB0aWxlLmNvbHNwYW4pKSk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsY3VsYXRlcyB0aGUgdG90YWwgc2l6ZSB0YWtlbiB1cCBieSBndXR0ZXJzIGFjcm9zcyBvbmUgYXhpcyBvZiBhIGxpc3QuXG4gICAqL1xuICBnZXRHdXR0ZXJTcGFuKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGAke3RoaXMuX2d1dHRlclNpemV9ICogKCR7dGhpcy5fcm93c3Bhbn0gLSAxKWA7XG4gIH1cblxuICAvKipcbiAgICogQ2FsY3VsYXRlcyB0aGUgdG90YWwgc2l6ZSB0YWtlbiB1cCBieSB0aWxlcyBhY3Jvc3Mgb25lIGF4aXMgb2YgYSBsaXN0LlxuICAgKiBAcGFyYW0gdGlsZUhlaWdodCBIZWlnaHQgb2YgdGhlIHRpbGUuXG4gICAqL1xuICBnZXRUaWxlU3Bhbih0aWxlSGVpZ2h0OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBgJHt0aGlzLl9yb3dzcGFufSAqICR7dGhpcy5nZXRUaWxlU2l6ZSh0aWxlSGVpZ2h0LCAxKX1gO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHZlcnRpY2FsIHBsYWNlbWVudCBvZiB0aGUgdGlsZSBpbiB0aGUgbGlzdC5cbiAgICogVGhpcyBtZXRob2Qgd2lsbCBiZSBpbXBsZW1lbnRlZCBieSBlYWNoIHR5cGUgb2YgVGlsZVN0eWxlci5cbiAgICogQGRvY3MtcHJpdmF0ZVxuICAgKi9cbiAgYWJzdHJhY3Qgc2V0Um93U3R5bGVzKHRpbGU6IE1hdEdyaWRUaWxlLCByb3dJbmRleDogbnVtYmVyLCBwZXJjZW50V2lkdGg6IG51bWJlcixcbiAgICAgICAgICAgICAgICAgICAgICAgIGd1dHRlcldpZHRoOiBudW1iZXIpOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBDYWxjdWxhdGVzIHRoZSBjb21wdXRlZCBoZWlnaHQgYW5kIHJldHVybnMgdGhlIGNvcnJlY3Qgc3R5bGUgcHJvcGVydHkgdG8gc2V0LlxuICAgKiBUaGlzIG1ldGhvZCBjYW4gYmUgaW1wbGVtZW50ZWQgYnkgZWFjaCB0eXBlIG9mIFRpbGVTdHlsZXIuXG4gICAqIEBkb2NzLXByaXZhdGVcbiAgICovXG4gIGdldENvbXB1dGVkSGVpZ2h0KCk6IFtzdHJpbmcsIHN0cmluZ10gfCBudWxsIHsgcmV0dXJuIG51bGw7IH1cblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gdGhlIHRpbGUgc3R5bGVyIGlzIHN3YXBwZWQgb3V0IHdpdGggYSBkaWZmZXJlbnQgb25lLiBUbyBiZSB1c2VkIGZvciBjbGVhbnVwLlxuICAgKiBAcGFyYW0gbGlzdCBHcmlkIGxpc3QgdGhhdCB0aGUgc3R5bGVyIHdhcyBhdHRhY2hlZCB0by5cbiAgICogQGRvY3MtcHJpdmF0ZVxuICAgKi9cbiAgYWJzdHJhY3QgcmVzZXQobGlzdDogVGlsZVN0eWxlVGFyZ2V0KTogdm9pZDtcbn1cblxuXG4vKipcbiAqIFRoaXMgdHlwZSBvZiBzdHlsZXIgaXMgaW5zdGFudGlhdGVkIHdoZW4gdGhlIHVzZXIgcGFzc2VzIGluIGEgZml4ZWQgcm93IGhlaWdodC5cbiAqIEV4YW1wbGUgYDxtYXQtZ3JpZC1saXN0IGNvbHM9XCIzXCIgcm93SGVpZ2h0PVwiMTAwcHhcIj5gXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbmV4cG9ydCBjbGFzcyBGaXhlZFRpbGVTdHlsZXIgZXh0ZW5kcyBUaWxlU3R5bGVyIHtcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgZml4ZWRSb3dIZWlnaHQ6IHN0cmluZykgeyBzdXBlcigpOyB9XG5cbiAgaW5pdChndXR0ZXJTaXplOiBzdHJpbmcsIHRyYWNrZXI6IFRpbGVDb29yZGluYXRvciwgY29sczogbnVtYmVyLCBkaXJlY3Rpb246IHN0cmluZykge1xuICAgIHN1cGVyLmluaXQoZ3V0dGVyU2l6ZSwgdHJhY2tlciwgY29scywgZGlyZWN0aW9uKTtcbiAgICB0aGlzLmZpeGVkUm93SGVpZ2h0ID0gbm9ybWFsaXplVW5pdHModGhpcy5maXhlZFJvd0hlaWdodCk7XG5cbiAgICBpZiAoIWNzc0NhbGNBbGxvd2VkVmFsdWUudGVzdCh0aGlzLmZpeGVkUm93SGVpZ2h0KSAmJlxuICAgICAgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkpIHtcbiAgICAgIHRocm93IEVycm9yKGBJbnZhbGlkIHZhbHVlIFwiJHt0aGlzLmZpeGVkUm93SGVpZ2h0fVwiIHNldCBhcyByb3dIZWlnaHQuYCk7XG4gICAgfVxuICB9XG5cbiAgc2V0Um93U3R5bGVzKHRpbGU6IE1hdEdyaWRUaWxlLCByb3dJbmRleDogbnVtYmVyKTogdm9pZCB7XG4gICAgdGlsZS5fc2V0U3R5bGUoJ3RvcCcsIHRoaXMuZ2V0VGlsZVBvc2l0aW9uKHRoaXMuZml4ZWRSb3dIZWlnaHQsIHJvd0luZGV4KSk7XG4gICAgdGlsZS5fc2V0U3R5bGUoJ2hlaWdodCcsIGNhbGModGhpcy5nZXRUaWxlU2l6ZSh0aGlzLmZpeGVkUm93SGVpZ2h0LCB0aWxlLnJvd3NwYW4pKSk7XG4gIH1cblxuICBnZXRDb21wdXRlZEhlaWdodCgpOiBbc3RyaW5nLCBzdHJpbmddIHtcbiAgICByZXR1cm4gW1xuICAgICAgJ2hlaWdodCcsIGNhbGMoYCR7dGhpcy5nZXRUaWxlU3Bhbih0aGlzLmZpeGVkUm93SGVpZ2h0KX0gKyAke3RoaXMuZ2V0R3V0dGVyU3BhbigpfWApXG4gICAgXTtcbiAgfVxuXG4gIHJlc2V0KGxpc3Q6IFRpbGVTdHlsZVRhcmdldCkge1xuICAgIGxpc3QuX3NldExpc3RTdHlsZShbJ2hlaWdodCcsIG51bGxdKTtcblxuICAgIGlmIChsaXN0Ll90aWxlcykge1xuICAgICAgbGlzdC5fdGlsZXMuZm9yRWFjaCh0aWxlID0+IHtcbiAgICAgICAgdGlsZS5fc2V0U3R5bGUoJ3RvcCcsIG51bGwpO1xuICAgICAgICB0aWxlLl9zZXRTdHlsZSgnaGVpZ2h0JywgbnVsbCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbn1cblxuXG4vKipcbiAqIFRoaXMgdHlwZSBvZiBzdHlsZXIgaXMgaW5zdGFudGlhdGVkIHdoZW4gdGhlIHVzZXIgcGFzc2VzIGluIGEgd2lkdGg6aGVpZ2h0IHJhdGlvXG4gKiBmb3IgdGhlIHJvdyBoZWlnaHQuICBFeGFtcGxlIGA8bWF0LWdyaWQtbGlzdCBjb2xzPVwiM1wiIHJvd0hlaWdodD1cIjM6MVwiPmBcbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuZXhwb3J0IGNsYXNzIFJhdGlvVGlsZVN0eWxlciBleHRlbmRzIFRpbGVTdHlsZXIge1xuXG4gIC8qKiBSYXRpbyB3aWR0aDpoZWlnaHQgZ2l2ZW4gYnkgdXNlciB0byBkZXRlcm1pbmUgcm93IGhlaWdodC4gKi9cbiAgcm93SGVpZ2h0UmF0aW86IG51bWJlcjtcbiAgYmFzZVRpbGVIZWlnaHQ6IHN0cmluZztcblxuICBjb25zdHJ1Y3Rvcih2YWx1ZTogc3RyaW5nKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLl9wYXJzZVJhdGlvKHZhbHVlKTtcbiAgfVxuXG4gIHNldFJvd1N0eWxlcyh0aWxlOiBNYXRHcmlkVGlsZSwgcm93SW5kZXg6IG51bWJlciwgcGVyY2VudFdpZHRoOiBudW1iZXIsXG4gICAgICAgICAgICAgICBndXR0ZXJXaWR0aDogbnVtYmVyKTogdm9pZCB7XG4gICAgbGV0IHBlcmNlbnRIZWlnaHRQZXJUaWxlID0gcGVyY2VudFdpZHRoIC8gdGhpcy5yb3dIZWlnaHRSYXRpbztcbiAgICB0aGlzLmJhc2VUaWxlSGVpZ2h0ID0gdGhpcy5nZXRCYXNlVGlsZVNpemUocGVyY2VudEhlaWdodFBlclRpbGUsIGd1dHRlcldpZHRoKTtcblxuICAgIC8vIFVzZSBwYWRkaW5nLXRvcCBhbmQgbWFyZ2luLXRvcCB0byBtYWludGFpbiB0aGUgZ2l2ZW4gYXNwZWN0IHJhdGlvLCBhc1xuICAgIC8vIGEgcGVyY2VudGFnZS1iYXNlZCB2YWx1ZSBmb3IgdGhlc2UgcHJvcGVydGllcyBpcyBhcHBsaWVkIHZlcnN1cyB0aGUgKndpZHRoKiBvZiB0aGVcbiAgICAvLyBjb250YWluaW5nIGJsb2NrLiBTZWUgaHR0cDovL3d3dy53My5vcmcvVFIvQ1NTMi9ib3guaHRtbCNtYXJnaW4tcHJvcGVydGllc1xuICAgIHRpbGUuX3NldFN0eWxlKCdtYXJnaW5Ub3AnLCB0aGlzLmdldFRpbGVQb3NpdGlvbih0aGlzLmJhc2VUaWxlSGVpZ2h0LCByb3dJbmRleCkpO1xuICAgIHRpbGUuX3NldFN0eWxlKCdwYWRkaW5nVG9wJywgY2FsYyh0aGlzLmdldFRpbGVTaXplKHRoaXMuYmFzZVRpbGVIZWlnaHQsIHRpbGUucm93c3BhbikpKTtcbiAgfVxuXG4gIGdldENvbXB1dGVkSGVpZ2h0KCk6IFtzdHJpbmcsIHN0cmluZ10ge1xuICAgIHJldHVybiBbXG4gICAgICAncGFkZGluZ0JvdHRvbScsIGNhbGMoYCR7dGhpcy5nZXRUaWxlU3Bhbih0aGlzLmJhc2VUaWxlSGVpZ2h0KX0gKyAke3RoaXMuZ2V0R3V0dGVyU3BhbigpfWApXG4gICAgXTtcbiAgfVxuXG4gIHJlc2V0KGxpc3Q6IFRpbGVTdHlsZVRhcmdldCkge1xuICAgIGxpc3QuX3NldExpc3RTdHlsZShbJ3BhZGRpbmdCb3R0b20nLCBudWxsXSk7XG5cbiAgICBsaXN0Ll90aWxlcy5mb3JFYWNoKHRpbGUgPT4ge1xuICAgICAgdGlsZS5fc2V0U3R5bGUoJ21hcmdpblRvcCcsIG51bGwpO1xuICAgICAgdGlsZS5fc2V0U3R5bGUoJ3BhZGRpbmdUb3AnLCBudWxsKTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX3BhcnNlUmF0aW8odmFsdWU6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IHJhdGlvUGFydHMgPSB2YWx1ZS5zcGxpdCgnOicpO1xuXG4gICAgaWYgKHJhdGlvUGFydHMubGVuZ3RoICE9PSAyICYmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpKSB7XG4gICAgICB0aHJvdyBFcnJvcihgbWF0LWdyaWQtbGlzdDogaW52YWxpZCByYXRpbyBnaXZlbiBmb3Igcm93LWhlaWdodDogXCIke3ZhbHVlfVwiYCk7XG4gICAgfVxuXG4gICAgdGhpcy5yb3dIZWlnaHRSYXRpbyA9IHBhcnNlRmxvYXQocmF0aW9QYXJ0c1swXSkgLyBwYXJzZUZsb2F0KHJhdGlvUGFydHNbMV0pO1xuICB9XG59XG5cbi8qKlxuICogVGhpcyB0eXBlIG9mIHN0eWxlciBpcyBpbnN0YW50aWF0ZWQgd2hlbiB0aGUgdXNlciBzZWxlY3RzIGEgXCJmaXRcIiByb3cgaGVpZ2h0IG1vZGUuXG4gKiBJbiBvdGhlciB3b3JkcywgdGhlIHJvdyBoZWlnaHQgd2lsbCByZWZsZWN0IHRoZSB0b3RhbCBoZWlnaHQgb2YgdGhlIGNvbnRhaW5lciBkaXZpZGVkXG4gKiBieSB0aGUgbnVtYmVyIG9mIHJvd3MuICBFeGFtcGxlIGA8bWF0LWdyaWQtbGlzdCBjb2xzPVwiM1wiIHJvd0hlaWdodD1cImZpdFwiPmBcbiAqXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbmV4cG9ydCBjbGFzcyBGaXRUaWxlU3R5bGVyIGV4dGVuZHMgVGlsZVN0eWxlciB7XG4gIHNldFJvd1N0eWxlcyh0aWxlOiBNYXRHcmlkVGlsZSwgcm93SW5kZXg6IG51bWJlcik6IHZvaWQge1xuICAgIC8vIFBlcmNlbnQgb2YgdGhlIGF2YWlsYWJsZSB2ZXJ0aWNhbCBzcGFjZSB0aGF0IG9uZSByb3cgdGFrZXMgdXAuXG4gICAgbGV0IHBlcmNlbnRIZWlnaHRQZXJUaWxlID0gMTAwIC8gdGhpcy5fcm93c3BhbjtcblxuICAgIC8vIEZyYWN0aW9uIG9mIHRoZSBob3Jpem9udGFsIGd1dHRlciBzaXplIHRoYXQgZWFjaCBjb2x1bW4gdGFrZXMgdXAuXG4gICAgbGV0IGd1dHRlckhlaWdodFBlclRpbGUgPSAodGhpcy5fcm93cyAtIDEpIC8gdGhpcy5fcm93cztcblxuICAgIC8vIEJhc2UgdmVydGljYWwgc2l6ZSBvZiBhIGNvbHVtbi5cbiAgICBsZXQgYmFzZVRpbGVIZWlnaHQgPSB0aGlzLmdldEJhc2VUaWxlU2l6ZShwZXJjZW50SGVpZ2h0UGVyVGlsZSwgZ3V0dGVySGVpZ2h0UGVyVGlsZSk7XG5cbiAgICB0aWxlLl9zZXRTdHlsZSgndG9wJywgdGhpcy5nZXRUaWxlUG9zaXRpb24oYmFzZVRpbGVIZWlnaHQsIHJvd0luZGV4KSk7XG4gICAgdGlsZS5fc2V0U3R5bGUoJ2hlaWdodCcsIGNhbGModGhpcy5nZXRUaWxlU2l6ZShiYXNlVGlsZUhlaWdodCwgdGlsZS5yb3dzcGFuKSkpO1xuICB9XG5cbiAgcmVzZXQobGlzdDogVGlsZVN0eWxlVGFyZ2V0KSB7XG4gICAgaWYgKGxpc3QuX3RpbGVzKSB7XG4gICAgICBsaXN0Ll90aWxlcy5mb3JFYWNoKHRpbGUgPT4ge1xuICAgICAgICB0aWxlLl9zZXRTdHlsZSgndG9wJywgbnVsbCk7XG4gICAgICAgIHRpbGUuX3NldFN0eWxlKCdoZWlnaHQnLCBudWxsKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxufVxuXG5cbi8qKiBXcmFwcyBhIENTUyBzdHJpbmcgaW4gYSBjYWxjIGZ1bmN0aW9uICovXG5mdW5jdGlvbiBjYWxjKGV4cDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGBjYWxjKCR7ZXhwfSlgO1xufVxuXG5cbi8qKiBBcHBlbmRzIHBpeGVscyB0byBhIENTUyBzdHJpbmcgaWYgbm8gdW5pdHMgYXJlIGdpdmVuLiAqL1xuZnVuY3Rpb24gbm9ybWFsaXplVW5pdHModmFsdWU6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiB2YWx1ZS5tYXRjaCgvKFtBLVphLXolXSspJC8pID8gdmFsdWUgOiBgJHt2YWx1ZX1weGA7XG59XG5cbiJdfQ==