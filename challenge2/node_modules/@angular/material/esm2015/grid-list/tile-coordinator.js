/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Class for determining, from a list of tiles, the (row, col) position of each of those tiles
 * in the grid. This is necessary (rather than just rendering the tiles in normal document flow)
 * because the tiles can have a rowspan.
 *
 * The positioning algorithm greedily places each tile as soon as it encounters a gap in the grid
 * large enough to accommodate it so that the tiles still render in the same order in which they
 * are given.
 *
 * The basis of the algorithm is the use of an array to track the already placed tiles. Each
 * element of the array corresponds to a column, and the value indicates how many cells in that
 * column are already occupied; zero indicates an empty cell. Moving "down" to the next row
 * decrements each value in the tracking array (indicating that the column is one cell closer to
 * being free).
 *
 * @docs-private
 */
export class TileCoordinator {
    constructor() {
        /** Index at which the search for the next gap will start. */
        this.columnIndex = 0;
        /** The current row index. */
        this.rowIndex = 0;
    }
    /** Gets the total number of rows occupied by tiles */
    get rowCount() { return this.rowIndex + 1; }
    /**
     * Gets the total span of rows occupied by tiles.
     * Ex: A list with 1 row that contains a tile with rowspan 2 will have a total rowspan of 2.
     */
    get rowspan() {
        const lastRowMax = Math.max(...this.tracker);
        // if any of the tiles has a rowspan that pushes it beyond the total row count,
        // add the difference to the rowcount
        return lastRowMax > 1 ? this.rowCount + lastRowMax - 1 : this.rowCount;
    }
    /**
     * Updates the tile positions.
     * @param numColumns Amount of columns in the grid.
     * @param tiles Tiles to be positioned.
     */
    update(numColumns, tiles) {
        this.columnIndex = 0;
        this.rowIndex = 0;
        this.tracker = new Array(numColumns);
        this.tracker.fill(0, 0, this.tracker.length);
        this.positions = tiles.map(tile => this._trackTile(tile));
    }
    /** Calculates the row and col position of a tile. */
    _trackTile(tile) {
        // Find a gap large enough for this tile.
        const gapStartIndex = this._findMatchingGap(tile.colspan);
        // Place tile in the resulting gap.
        this._markTilePosition(gapStartIndex, tile);
        // The next time we look for a gap, the search will start at columnIndex, which should be
        // immediately after the tile that has just been placed.
        this.columnIndex = gapStartIndex + tile.colspan;
        return new TilePosition(this.rowIndex, gapStartIndex);
    }
    /** Finds the next available space large enough to fit the tile. */
    _findMatchingGap(tileCols) {
        if (tileCols > this.tracker.length && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw Error(`mat-grid-list: tile with colspan ${tileCols} is wider than ` +
                `grid with cols="${this.tracker.length}".`);
        }
        // Start index is inclusive, end index is exclusive.
        let gapStartIndex = -1;
        let gapEndIndex = -1;
        // Look for a gap large enough to fit the given tile. Empty spaces are marked with a zero.
        do {
            // If we've reached the end of the row, go to the next row.
            if (this.columnIndex + tileCols > this.tracker.length) {
                this._nextRow();
                gapStartIndex = this.tracker.indexOf(0, this.columnIndex);
                gapEndIndex = this._findGapEndIndex(gapStartIndex);
                continue;
            }
            gapStartIndex = this.tracker.indexOf(0, this.columnIndex);
            // If there are no more empty spaces in this row at all, move on to the next row.
            if (gapStartIndex == -1) {
                this._nextRow();
                gapStartIndex = this.tracker.indexOf(0, this.columnIndex);
                gapEndIndex = this._findGapEndIndex(gapStartIndex);
                continue;
            }
            gapEndIndex = this._findGapEndIndex(gapStartIndex);
            // If a gap large enough isn't found, we want to start looking immediately after the current
            // gap on the next iteration.
            this.columnIndex = gapStartIndex + 1;
            // Continue iterating until we find a gap wide enough for this tile. Since gapEndIndex is
            // exclusive, gapEndIndex is 0 means we didn't find a gap and should continue.
        } while ((gapEndIndex - gapStartIndex < tileCols) || (gapEndIndex == 0));
        // If we still didn't manage to find a gap, ensure that the index is
        // at least zero so the tile doesn't get pulled out of the grid.
        return Math.max(gapStartIndex, 0);
    }
    /** Move "down" to the next row. */
    _nextRow() {
        this.columnIndex = 0;
        this.rowIndex++;
        // Decrement all spaces by one to reflect moving down one row.
        for (let i = 0; i < this.tracker.length; i++) {
            this.tracker[i] = Math.max(0, this.tracker[i] - 1);
        }
    }
    /**
     * Finds the end index (exclusive) of a gap given the index from which to start looking.
     * The gap ends when a non-zero value is found.
     */
    _findGapEndIndex(gapStartIndex) {
        for (let i = gapStartIndex + 1; i < this.tracker.length; i++) {
            if (this.tracker[i] != 0) {
                return i;
            }
        }
        // The gap ends with the end of the row.
        return this.tracker.length;
    }
    /** Update the tile tracker to account for the given tile in the given space. */
    _markTilePosition(start, tile) {
        for (let i = 0; i < tile.colspan; i++) {
            this.tracker[start + i] = tile.rowspan;
        }
    }
}
/**
 * Simple data structure for tile position (row, col).
 * @docs-private
 */
export class TilePosition {
    constructor(row, col) {
        this.row = row;
        this.col = col;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGlsZS1jb29yZGluYXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9ncmlkLWxpc3QvdGlsZS1jb29yZGluYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFhSDs7Ozs7Ozs7Ozs7Ozs7OztHQWdCRztBQUNILE1BQU0sT0FBTyxlQUFlO0lBQTVCO1FBSUUsNkRBQTZEO1FBQzdELGdCQUFXLEdBQVcsQ0FBQyxDQUFDO1FBRXhCLDZCQUE2QjtRQUM3QixhQUFRLEdBQVcsQ0FBQyxDQUFDO0lBOEh2QixDQUFDO0lBNUhDLHNEQUFzRDtJQUN0RCxJQUFJLFFBQVEsS0FBYSxPQUFPLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUVwRDs7O09BR0c7SUFDSCxJQUFJLE9BQU87UUFDVCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzdDLCtFQUErRTtRQUMvRSxxQ0FBcUM7UUFDckMsT0FBTyxVQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxHQUFHLFVBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDekUsQ0FBQztJQUtEOzs7O09BSUc7SUFDSCxNQUFNLENBQUMsVUFBa0IsRUFBRSxLQUFhO1FBQ3RDLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDO1FBQ3JCLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1FBRWxCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDckMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzdDLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUM1RCxDQUFDO0lBRUQscURBQXFEO0lBQzdDLFVBQVUsQ0FBQyxJQUFVO1FBQzNCLHlDQUF5QztRQUN6QyxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRTFELG1DQUFtQztRQUNuQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRTVDLHlGQUF5RjtRQUN6Rix3REFBd0Q7UUFDeEQsSUFBSSxDQUFDLFdBQVcsR0FBRyxhQUFhLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUVoRCxPQUFPLElBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsYUFBYSxDQUFDLENBQUM7SUFDeEQsQ0FBQztJQUVELG1FQUFtRTtJQUMzRCxnQkFBZ0IsQ0FBQyxRQUFnQjtRQUN2QyxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLE9BQU8sU0FBUyxLQUFLLFdBQVcsSUFBSSxTQUFTLENBQUMsRUFBRTtZQUNyRixNQUFNLEtBQUssQ0FBQyxvQ0FBb0MsUUFBUSxpQkFBaUI7Z0JBQ3pELG1CQUFtQixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUM7U0FDN0Q7UUFFRCxvREFBb0Q7UUFDcEQsSUFBSSxhQUFhLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDdkIsSUFBSSxXQUFXLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFFckIsMEZBQTBGO1FBQzFGLEdBQUc7WUFDRCwyREFBMkQ7WUFDM0QsSUFBSSxJQUFJLENBQUMsV0FBVyxHQUFHLFFBQVEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRTtnQkFDckQsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUNoQixhQUFhLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDMUQsV0FBVyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsQ0FBQztnQkFDbkQsU0FBUzthQUNWO1lBRUQsYUFBYSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7WUFFMUQsaUZBQWlGO1lBQ2pGLElBQUksYUFBYSxJQUFJLENBQUMsQ0FBQyxFQUFFO2dCQUN2QixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ2hCLGFBQWEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUMxRCxXQUFXLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxDQUFDO2dCQUNuRCxTQUFTO2FBQ1Y7WUFFRCxXQUFXLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBRW5ELDRGQUE0RjtZQUM1Riw2QkFBNkI7WUFDN0IsSUFBSSxDQUFDLFdBQVcsR0FBRyxhQUFhLEdBQUcsQ0FBQyxDQUFDO1lBRXJDLHlGQUF5RjtZQUN6Riw4RUFBOEU7U0FDL0UsUUFBUSxDQUFDLFdBQVcsR0FBRyxhQUFhLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLElBQUksQ0FBQyxDQUFDLEVBQUU7UUFFekUsb0VBQW9FO1FBQ3BFLGdFQUFnRTtRQUNoRSxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ3BDLENBQUM7SUFFRCxtQ0FBbUM7SUFDM0IsUUFBUTtRQUNkLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDO1FBQ3JCLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUVoQiw4REFBOEQ7UUFDOUQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzVDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztTQUNwRDtJQUNILENBQUM7SUFFRDs7O09BR0c7SUFDSyxnQkFBZ0IsQ0FBQyxhQUFxQjtRQUM1QyxLQUFLLElBQUksQ0FBQyxHQUFHLGFBQWEsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzVELElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ3hCLE9BQU8sQ0FBQyxDQUFDO2FBQ1Y7U0FDRjtRQUVELHdDQUF3QztRQUN4QyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO0lBQzdCLENBQUM7SUFFRCxnRkFBZ0Y7SUFDeEUsaUJBQWlCLENBQUMsS0FBYSxFQUFFLElBQVU7UUFDakQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDckMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztTQUN4QztJQUNILENBQUM7Q0FDRjtBQUVEOzs7R0FHRztBQUNILE1BQU0sT0FBTyxZQUFZO0lBQ3ZCLFlBQW1CLEdBQVcsRUFBUyxHQUFXO1FBQS9CLFFBQUcsR0FBSCxHQUFHLENBQVE7UUFBUyxRQUFHLEdBQUgsR0FBRyxDQUFRO0lBQUcsQ0FBQztDQUN2RCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vKipcbiAqIEludGVyZmFjZSBkZXNjcmliaW5nIGEgdGlsZS5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBUaWxlIHtcbiAgLyoqIEFtb3VudCBvZiByb3dzIHRoYXQgdGhlIHRpbGUgdGFrZXMgdXAuICovXG4gIHJvd3NwYW46IG51bWJlcjtcbiAgLyoqIEFtb3VudCBvZiBjb2x1bW5zIHRoYXQgdGhlIHRpbGUgdGFrZXMgdXAuICovXG4gIGNvbHNwYW46IG51bWJlcjtcbn1cblxuLyoqXG4gKiBDbGFzcyBmb3IgZGV0ZXJtaW5pbmcsIGZyb20gYSBsaXN0IG9mIHRpbGVzLCB0aGUgKHJvdywgY29sKSBwb3NpdGlvbiBvZiBlYWNoIG9mIHRob3NlIHRpbGVzXG4gKiBpbiB0aGUgZ3JpZC4gVGhpcyBpcyBuZWNlc3NhcnkgKHJhdGhlciB0aGFuIGp1c3QgcmVuZGVyaW5nIHRoZSB0aWxlcyBpbiBub3JtYWwgZG9jdW1lbnQgZmxvdylcbiAqIGJlY2F1c2UgdGhlIHRpbGVzIGNhbiBoYXZlIGEgcm93c3Bhbi5cbiAqXG4gKiBUaGUgcG9zaXRpb25pbmcgYWxnb3JpdGhtIGdyZWVkaWx5IHBsYWNlcyBlYWNoIHRpbGUgYXMgc29vbiBhcyBpdCBlbmNvdW50ZXJzIGEgZ2FwIGluIHRoZSBncmlkXG4gKiBsYXJnZSBlbm91Z2ggdG8gYWNjb21tb2RhdGUgaXQgc28gdGhhdCB0aGUgdGlsZXMgc3RpbGwgcmVuZGVyIGluIHRoZSBzYW1lIG9yZGVyIGluIHdoaWNoIHRoZXlcbiAqIGFyZSBnaXZlbi5cbiAqXG4gKiBUaGUgYmFzaXMgb2YgdGhlIGFsZ29yaXRobSBpcyB0aGUgdXNlIG9mIGFuIGFycmF5IHRvIHRyYWNrIHRoZSBhbHJlYWR5IHBsYWNlZCB0aWxlcy4gRWFjaFxuICogZWxlbWVudCBvZiB0aGUgYXJyYXkgY29ycmVzcG9uZHMgdG8gYSBjb2x1bW4sIGFuZCB0aGUgdmFsdWUgaW5kaWNhdGVzIGhvdyBtYW55IGNlbGxzIGluIHRoYXRcbiAqIGNvbHVtbiBhcmUgYWxyZWFkeSBvY2N1cGllZDsgemVybyBpbmRpY2F0ZXMgYW4gZW1wdHkgY2VsbC4gTW92aW5nIFwiZG93blwiIHRvIHRoZSBuZXh0IHJvd1xuICogZGVjcmVtZW50cyBlYWNoIHZhbHVlIGluIHRoZSB0cmFja2luZyBhcnJheSAoaW5kaWNhdGluZyB0aGF0IHRoZSBjb2x1bW4gaXMgb25lIGNlbGwgY2xvc2VyIHRvXG4gKiBiZWluZyBmcmVlKS5cbiAqXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbmV4cG9ydCBjbGFzcyBUaWxlQ29vcmRpbmF0b3Ige1xuICAvKiogVHJhY2tpbmcgYXJyYXkgKHNlZSBjbGFzcyBkZXNjcmlwdGlvbikuICovXG4gIHRyYWNrZXI6IG51bWJlcltdO1xuXG4gIC8qKiBJbmRleCBhdCB3aGljaCB0aGUgc2VhcmNoIGZvciB0aGUgbmV4dCBnYXAgd2lsbCBzdGFydC4gKi9cbiAgY29sdW1uSW5kZXg6IG51bWJlciA9IDA7XG5cbiAgLyoqIFRoZSBjdXJyZW50IHJvdyBpbmRleC4gKi9cbiAgcm93SW5kZXg6IG51bWJlciA9IDA7XG5cbiAgLyoqIEdldHMgdGhlIHRvdGFsIG51bWJlciBvZiByb3dzIG9jY3VwaWVkIGJ5IHRpbGVzICovXG4gIGdldCByb3dDb3VudCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5yb3dJbmRleCArIDE7IH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgdG90YWwgc3BhbiBvZiByb3dzIG9jY3VwaWVkIGJ5IHRpbGVzLlxuICAgKiBFeDogQSBsaXN0IHdpdGggMSByb3cgdGhhdCBjb250YWlucyBhIHRpbGUgd2l0aCByb3dzcGFuIDIgd2lsbCBoYXZlIGEgdG90YWwgcm93c3BhbiBvZiAyLlxuICAgKi9cbiAgZ2V0IHJvd3NwYW4oKSB7XG4gICAgY29uc3QgbGFzdFJvd01heCA9IE1hdGgubWF4KC4uLnRoaXMudHJhY2tlcik7XG4gICAgLy8gaWYgYW55IG9mIHRoZSB0aWxlcyBoYXMgYSByb3dzcGFuIHRoYXQgcHVzaGVzIGl0IGJleW9uZCB0aGUgdG90YWwgcm93IGNvdW50LFxuICAgIC8vIGFkZCB0aGUgZGlmZmVyZW5jZSB0byB0aGUgcm93Y291bnRcbiAgICByZXR1cm4gbGFzdFJvd01heCA+IDEgPyB0aGlzLnJvd0NvdW50ICsgbGFzdFJvd01heCAtIDEgOiB0aGlzLnJvd0NvdW50O1xuICB9XG5cbiAgLyoqIFRoZSBjb21wdXRlZCAocm93LCBjb2wpIHBvc2l0aW9uIG9mIGVhY2ggdGlsZSAodGhlIG91dHB1dCkuICovXG4gIHBvc2l0aW9uczogVGlsZVBvc2l0aW9uW107XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIHRpbGUgcG9zaXRpb25zLlxuICAgKiBAcGFyYW0gbnVtQ29sdW1ucyBBbW91bnQgb2YgY29sdW1ucyBpbiB0aGUgZ3JpZC5cbiAgICogQHBhcmFtIHRpbGVzIFRpbGVzIHRvIGJlIHBvc2l0aW9uZWQuXG4gICAqL1xuICB1cGRhdGUobnVtQ29sdW1uczogbnVtYmVyLCB0aWxlczogVGlsZVtdKSB7XG4gICAgdGhpcy5jb2x1bW5JbmRleCA9IDA7XG4gICAgdGhpcy5yb3dJbmRleCA9IDA7XG5cbiAgICB0aGlzLnRyYWNrZXIgPSBuZXcgQXJyYXkobnVtQ29sdW1ucyk7XG4gICAgdGhpcy50cmFja2VyLmZpbGwoMCwgMCwgdGhpcy50cmFja2VyLmxlbmd0aCk7XG4gICAgdGhpcy5wb3NpdGlvbnMgPSB0aWxlcy5tYXAodGlsZSA9PiB0aGlzLl90cmFja1RpbGUodGlsZSkpO1xuICB9XG5cbiAgLyoqIENhbGN1bGF0ZXMgdGhlIHJvdyBhbmQgY29sIHBvc2l0aW9uIG9mIGEgdGlsZS4gKi9cbiAgcHJpdmF0ZSBfdHJhY2tUaWxlKHRpbGU6IFRpbGUpOiBUaWxlUG9zaXRpb24ge1xuICAgIC8vIEZpbmQgYSBnYXAgbGFyZ2UgZW5vdWdoIGZvciB0aGlzIHRpbGUuXG4gICAgY29uc3QgZ2FwU3RhcnRJbmRleCA9IHRoaXMuX2ZpbmRNYXRjaGluZ0dhcCh0aWxlLmNvbHNwYW4pO1xuXG4gICAgLy8gUGxhY2UgdGlsZSBpbiB0aGUgcmVzdWx0aW5nIGdhcC5cbiAgICB0aGlzLl9tYXJrVGlsZVBvc2l0aW9uKGdhcFN0YXJ0SW5kZXgsIHRpbGUpO1xuXG4gICAgLy8gVGhlIG5leHQgdGltZSB3ZSBsb29rIGZvciBhIGdhcCwgdGhlIHNlYXJjaCB3aWxsIHN0YXJ0IGF0IGNvbHVtbkluZGV4LCB3aGljaCBzaG91bGQgYmVcbiAgICAvLyBpbW1lZGlhdGVseSBhZnRlciB0aGUgdGlsZSB0aGF0IGhhcyBqdXN0IGJlZW4gcGxhY2VkLlxuICAgIHRoaXMuY29sdW1uSW5kZXggPSBnYXBTdGFydEluZGV4ICsgdGlsZS5jb2xzcGFuO1xuXG4gICAgcmV0dXJuIG5ldyBUaWxlUG9zaXRpb24odGhpcy5yb3dJbmRleCwgZ2FwU3RhcnRJbmRleCk7XG4gIH1cblxuICAvKiogRmluZHMgdGhlIG5leHQgYXZhaWxhYmxlIHNwYWNlIGxhcmdlIGVub3VnaCB0byBmaXQgdGhlIHRpbGUuICovXG4gIHByaXZhdGUgX2ZpbmRNYXRjaGluZ0dhcCh0aWxlQ29sczogbnVtYmVyKTogbnVtYmVyIHtcbiAgICBpZiAodGlsZUNvbHMgPiB0aGlzLnRyYWNrZXIubGVuZ3RoICYmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpKSB7XG4gICAgICB0aHJvdyBFcnJvcihgbWF0LWdyaWQtbGlzdDogdGlsZSB3aXRoIGNvbHNwYW4gJHt0aWxlQ29sc30gaXMgd2lkZXIgdGhhbiBgICtcbiAgICAgICAgICAgICAgICAgICAgICBgZ3JpZCB3aXRoIGNvbHM9XCIke3RoaXMudHJhY2tlci5sZW5ndGh9XCIuYCk7XG4gICAgfVxuXG4gICAgLy8gU3RhcnQgaW5kZXggaXMgaW5jbHVzaXZlLCBlbmQgaW5kZXggaXMgZXhjbHVzaXZlLlxuICAgIGxldCBnYXBTdGFydEluZGV4ID0gLTE7XG4gICAgbGV0IGdhcEVuZEluZGV4ID0gLTE7XG5cbiAgICAvLyBMb29rIGZvciBhIGdhcCBsYXJnZSBlbm91Z2ggdG8gZml0IHRoZSBnaXZlbiB0aWxlLiBFbXB0eSBzcGFjZXMgYXJlIG1hcmtlZCB3aXRoIGEgemVyby5cbiAgICBkbyB7XG4gICAgICAvLyBJZiB3ZSd2ZSByZWFjaGVkIHRoZSBlbmQgb2YgdGhlIHJvdywgZ28gdG8gdGhlIG5leHQgcm93LlxuICAgICAgaWYgKHRoaXMuY29sdW1uSW5kZXggKyB0aWxlQ29scyA+IHRoaXMudHJhY2tlci5sZW5ndGgpIHtcbiAgICAgICAgdGhpcy5fbmV4dFJvdygpO1xuICAgICAgICBnYXBTdGFydEluZGV4ID0gdGhpcy50cmFja2VyLmluZGV4T2YoMCwgdGhpcy5jb2x1bW5JbmRleCk7XG4gICAgICAgIGdhcEVuZEluZGV4ID0gdGhpcy5fZmluZEdhcEVuZEluZGV4KGdhcFN0YXJ0SW5kZXgpO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgZ2FwU3RhcnRJbmRleCA9IHRoaXMudHJhY2tlci5pbmRleE9mKDAsIHRoaXMuY29sdW1uSW5kZXgpO1xuXG4gICAgICAvLyBJZiB0aGVyZSBhcmUgbm8gbW9yZSBlbXB0eSBzcGFjZXMgaW4gdGhpcyByb3cgYXQgYWxsLCBtb3ZlIG9uIHRvIHRoZSBuZXh0IHJvdy5cbiAgICAgIGlmIChnYXBTdGFydEluZGV4ID09IC0xKSB7XG4gICAgICAgIHRoaXMuX25leHRSb3coKTtcbiAgICAgICAgZ2FwU3RhcnRJbmRleCA9IHRoaXMudHJhY2tlci5pbmRleE9mKDAsIHRoaXMuY29sdW1uSW5kZXgpO1xuICAgICAgICBnYXBFbmRJbmRleCA9IHRoaXMuX2ZpbmRHYXBFbmRJbmRleChnYXBTdGFydEluZGV4KTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGdhcEVuZEluZGV4ID0gdGhpcy5fZmluZEdhcEVuZEluZGV4KGdhcFN0YXJ0SW5kZXgpO1xuXG4gICAgICAvLyBJZiBhIGdhcCBsYXJnZSBlbm91Z2ggaXNuJ3QgZm91bmQsIHdlIHdhbnQgdG8gc3RhcnQgbG9va2luZyBpbW1lZGlhdGVseSBhZnRlciB0aGUgY3VycmVudFxuICAgICAgLy8gZ2FwIG9uIHRoZSBuZXh0IGl0ZXJhdGlvbi5cbiAgICAgIHRoaXMuY29sdW1uSW5kZXggPSBnYXBTdGFydEluZGV4ICsgMTtcblxuICAgICAgLy8gQ29udGludWUgaXRlcmF0aW5nIHVudGlsIHdlIGZpbmQgYSBnYXAgd2lkZSBlbm91Z2ggZm9yIHRoaXMgdGlsZS4gU2luY2UgZ2FwRW5kSW5kZXggaXNcbiAgICAgIC8vIGV4Y2x1c2l2ZSwgZ2FwRW5kSW5kZXggaXMgMCBtZWFucyB3ZSBkaWRuJ3QgZmluZCBhIGdhcCBhbmQgc2hvdWxkIGNvbnRpbnVlLlxuICAgIH0gd2hpbGUgKChnYXBFbmRJbmRleCAtIGdhcFN0YXJ0SW5kZXggPCB0aWxlQ29scykgfHwgKGdhcEVuZEluZGV4ID09IDApKTtcblxuICAgIC8vIElmIHdlIHN0aWxsIGRpZG4ndCBtYW5hZ2UgdG8gZmluZCBhIGdhcCwgZW5zdXJlIHRoYXQgdGhlIGluZGV4IGlzXG4gICAgLy8gYXQgbGVhc3QgemVybyBzbyB0aGUgdGlsZSBkb2Vzbid0IGdldCBwdWxsZWQgb3V0IG9mIHRoZSBncmlkLlxuICAgIHJldHVybiBNYXRoLm1heChnYXBTdGFydEluZGV4LCAwKTtcbiAgfVxuXG4gIC8qKiBNb3ZlIFwiZG93blwiIHRvIHRoZSBuZXh0IHJvdy4gKi9cbiAgcHJpdmF0ZSBfbmV4dFJvdygpOiB2b2lkIHtcbiAgICB0aGlzLmNvbHVtbkluZGV4ID0gMDtcbiAgICB0aGlzLnJvd0luZGV4Kys7XG5cbiAgICAvLyBEZWNyZW1lbnQgYWxsIHNwYWNlcyBieSBvbmUgdG8gcmVmbGVjdCBtb3ZpbmcgZG93biBvbmUgcm93LlxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy50cmFja2VyLmxlbmd0aDsgaSsrKSB7XG4gICAgICB0aGlzLnRyYWNrZXJbaV0gPSBNYXRoLm1heCgwLCB0aGlzLnRyYWNrZXJbaV0gLSAxKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRmluZHMgdGhlIGVuZCBpbmRleCAoZXhjbHVzaXZlKSBvZiBhIGdhcCBnaXZlbiB0aGUgaW5kZXggZnJvbSB3aGljaCB0byBzdGFydCBsb29raW5nLlxuICAgKiBUaGUgZ2FwIGVuZHMgd2hlbiBhIG5vbi16ZXJvIHZhbHVlIGlzIGZvdW5kLlxuICAgKi9cbiAgcHJpdmF0ZSBfZmluZEdhcEVuZEluZGV4KGdhcFN0YXJ0SW5kZXg6IG51bWJlcik6IG51bWJlciB7XG4gICAgZm9yIChsZXQgaSA9IGdhcFN0YXJ0SW5kZXggKyAxOyBpIDwgdGhpcy50cmFja2VyLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAodGhpcy50cmFja2VyW2ldICE9IDApIHtcbiAgICAgICAgcmV0dXJuIGk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gVGhlIGdhcCBlbmRzIHdpdGggdGhlIGVuZCBvZiB0aGUgcm93LlxuICAgIHJldHVybiB0aGlzLnRyYWNrZXIubGVuZ3RoO1xuICB9XG5cbiAgLyoqIFVwZGF0ZSB0aGUgdGlsZSB0cmFja2VyIHRvIGFjY291bnQgZm9yIHRoZSBnaXZlbiB0aWxlIGluIHRoZSBnaXZlbiBzcGFjZS4gKi9cbiAgcHJpdmF0ZSBfbWFya1RpbGVQb3NpdGlvbihzdGFydDogbnVtYmVyLCB0aWxlOiBUaWxlKTogdm9pZCB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aWxlLmNvbHNwYW47IGkrKykge1xuICAgICAgdGhpcy50cmFja2VyW3N0YXJ0ICsgaV0gPSB0aWxlLnJvd3NwYW47XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogU2ltcGxlIGRhdGEgc3RydWN0dXJlIGZvciB0aWxlIHBvc2l0aW9uIChyb3csIGNvbCkuXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbmV4cG9ydCBjbGFzcyBUaWxlUG9zaXRpb24ge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgcm93OiBudW1iZXIsIHB1YmxpYyBjb2w6IG51bWJlcikge31cbn1cbiJdfQ==