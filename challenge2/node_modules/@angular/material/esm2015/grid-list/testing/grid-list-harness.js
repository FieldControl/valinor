/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { ComponentHarness, HarnessPredicate, parallel } from '@angular/cdk/testing';
import { ɵTileCoordinator as TileCoordinator } from '@angular/material/grid-list';
import { MatGridTileHarness } from './grid-tile-harness';
/** Harness for interacting with a standard `MatGridList` in tests. */
export class MatGridListHarness extends ComponentHarness {
    constructor() {
        super(...arguments);
        /**
         * Tile coordinator that is used by the "MatGridList" for computing
         * positions of tiles. We leverage the coordinator to provide an API
         * for retrieving tiles based on visual tile positions.
         */
        this._tileCoordinator = new TileCoordinator();
    }
    /**
     * Gets a `HarnessPredicate` that can be used to search for a `MatGridListHarness`
     * that meets certain criteria.
     * @param options Options for filtering which dialog instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(MatGridListHarness, options);
    }
    /** Gets all tiles of the grid-list. */
    getTiles(filters = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.locatorForAll(MatGridTileHarness.with(filters))();
        });
    }
    /** Gets the amount of columns of the grid-list. */
    getColumns() {
        return __awaiter(this, void 0, void 0, function* () {
            return Number(yield (yield this.host()).getAttribute('cols'));
        });
    }
    /**
     * Gets a tile of the grid-list that is located at the given location.
     * @param row Zero-based row index.
     * @param column Zero-based column index.
     */
    getTileAtPosition({ row, column }) {
        return __awaiter(this, void 0, void 0, function* () {
            const [tileHarnesses, columns] = yield parallel(() => [this.getTiles(), this.getColumns()]);
            const tileSpans = tileHarnesses.map(t => parallel(() => [t.getColspan(), t.getRowspan()]));
            const tiles = (yield parallel(() => tileSpans))
                .map(([colspan, rowspan]) => ({ colspan, rowspan }));
            // Update the tile coordinator to reflect the current column amount and
            // rendered tiles. We update upon every call of this method since we do not
            // know if tiles have been added, removed or updated (in terms of rowspan/colspan).
            this._tileCoordinator.update(columns, tiles);
            // The tile coordinator respects the colspan and rowspan for calculating the positions
            // of tiles, but it does not create multiple position entries if a tile spans over multiple
            // columns or rows. We want to provide an API where developers can retrieve a tile based on
            // any position that lies within the visual tile boundaries. For example: If a tile spans
            // over two columns, then the same tile should be returned for either column indices.
            for (let i = 0; i < this._tileCoordinator.positions.length; i++) {
                const position = this._tileCoordinator.positions[i];
                const { rowspan, colspan } = tiles[i];
                // Return the tile harness if the given position visually resolves to the tile.
                if (column >= position.col && column <= position.col + colspan - 1 && row >= position.row &&
                    row <= position.row + rowspan - 1) {
                    return tileHarnesses[i];
                }
            }
            throw Error('Could not find tile at given position.');
        });
    }
}
/** The selector for the host element of a `MatGridList` instance. */
MatGridListHarness.hostSelector = '.mat-grid-list';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JpZC1saXN0LWhhcm5lc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvZ3JpZC1saXN0L3Rlc3RpbmcvZ3JpZC1saXN0LWhhcm5lc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFBQyxnQkFBZ0IsRUFBRSxnQkFBZ0IsRUFBRSxRQUFRLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUNsRixPQUFPLEVBQUMsZ0JBQWdCLElBQUksZUFBZSxFQUFDLE1BQU0sNkJBQTZCLENBQUM7QUFFaEYsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFFdkQsc0VBQXNFO0FBQ3RFLE1BQU0sT0FBTyxrQkFBbUIsU0FBUSxnQkFBZ0I7SUFBeEQ7O1FBY0U7Ozs7V0FJRztRQUNLLHFCQUFnQixHQUFHLElBQUksZUFBZSxFQUFFLENBQUM7SUEyQ25ELENBQUM7SUExREM7Ozs7O09BS0c7SUFDSCxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQWtDLEVBQUU7UUFDOUMsT0FBTyxJQUFJLGdCQUFnQixDQUFDLGtCQUFrQixFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzNELENBQUM7SUFTRCx1Q0FBdUM7SUFDakMsUUFBUSxDQUFDLFVBQWtDLEVBQUU7O1lBQ2pELE9BQU8sTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDdEUsQ0FBQztLQUFBO0lBRUQsbURBQW1EO0lBQzdDLFVBQVU7O1lBQ2QsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDaEUsQ0FBQztLQUFBO0lBRUQ7Ozs7T0FJRztJQUNHLGlCQUFpQixDQUFDLEVBQUMsR0FBRyxFQUFFLE1BQU0sRUFBZ0M7O1lBRWxFLE1BQU0sQ0FBQyxhQUFhLEVBQUUsT0FBTyxDQUFDLEdBQUcsTUFBTSxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM1RixNQUFNLFNBQVMsR0FBRyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMzRixNQUFNLEtBQUssR0FBRyxDQUFDLE1BQU0sUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2lCQUMxQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkQsdUVBQXVFO1lBQ3ZFLDJFQUEyRTtZQUMzRSxtRkFBbUY7WUFDbkYsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDN0Msc0ZBQXNGO1lBQ3RGLDJGQUEyRjtZQUMzRiwyRkFBMkY7WUFDM0YseUZBQXlGO1lBQ3pGLHFGQUFxRjtZQUNyRixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQy9ELE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BELE1BQU0sRUFBQyxPQUFPLEVBQUUsT0FBTyxFQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNwQywrRUFBK0U7Z0JBQy9FLElBQUksTUFBTSxJQUFJLFFBQVEsQ0FBQyxHQUFHLElBQUksTUFBTSxJQUFJLFFBQVEsQ0FBQyxHQUFHLEdBQUcsT0FBTyxHQUFHLENBQUMsSUFBSSxHQUFHLElBQUksUUFBUSxDQUFDLEdBQUc7b0JBQ3JGLEdBQUcsSUFBSSxRQUFRLENBQUMsR0FBRyxHQUFHLE9BQU8sR0FBRyxDQUFDLEVBQUU7b0JBQ3JDLE9BQU8sYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUN6QjthQUNGO1lBQ0QsTUFBTSxLQUFLLENBQUMsd0NBQXdDLENBQUMsQ0FBQztRQUN4RCxDQUFDO0tBQUE7O0FBNURELHFFQUFxRTtBQUM5RCwrQkFBWSxHQUFHLGdCQUFnQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q29tcG9uZW50SGFybmVzcywgSGFybmVzc1ByZWRpY2F0ZSwgcGFyYWxsZWx9IGZyb20gJ0Bhbmd1bGFyL2Nkay90ZXN0aW5nJztcbmltcG9ydCB7ybVUaWxlQ29vcmRpbmF0b3IgYXMgVGlsZUNvb3JkaW5hdG9yfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9ncmlkLWxpc3QnO1xuaW1wb3J0IHtHcmlkTGlzdEhhcm5lc3NGaWx0ZXJzLCBHcmlkVGlsZUhhcm5lc3NGaWx0ZXJzfSBmcm9tICcuL2dyaWQtbGlzdC1oYXJuZXNzLWZpbHRlcnMnO1xuaW1wb3J0IHtNYXRHcmlkVGlsZUhhcm5lc3N9IGZyb20gJy4vZ3JpZC10aWxlLWhhcm5lc3MnO1xuXG4vKiogSGFybmVzcyBmb3IgaW50ZXJhY3Rpbmcgd2l0aCBhIHN0YW5kYXJkIGBNYXRHcmlkTGlzdGAgaW4gdGVzdHMuICovXG5leHBvcnQgY2xhc3MgTWF0R3JpZExpc3RIYXJuZXNzIGV4dGVuZHMgQ29tcG9uZW50SGFybmVzcyB7XG4gIC8qKiBUaGUgc2VsZWN0b3IgZm9yIHRoZSBob3N0IGVsZW1lbnQgb2YgYSBgTWF0R3JpZExpc3RgIGluc3RhbmNlLiAqL1xuICBzdGF0aWMgaG9zdFNlbGVjdG9yID0gJy5tYXQtZ3JpZC1saXN0JztcblxuICAvKipcbiAgICogR2V0cyBhIGBIYXJuZXNzUHJlZGljYXRlYCB0aGF0IGNhbiBiZSB1c2VkIHRvIHNlYXJjaCBmb3IgYSBgTWF0R3JpZExpc3RIYXJuZXNzYFxuICAgKiB0aGF0IG1lZXRzIGNlcnRhaW4gY3JpdGVyaWEuXG4gICAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbnMgZm9yIGZpbHRlcmluZyB3aGljaCBkaWFsb2cgaW5zdGFuY2VzIGFyZSBjb25zaWRlcmVkIGEgbWF0Y2guXG4gICAqIEByZXR1cm4gYSBgSGFybmVzc1ByZWRpY2F0ZWAgY29uZmlndXJlZCB3aXRoIHRoZSBnaXZlbiBvcHRpb25zLlxuICAgKi9cbiAgc3RhdGljIHdpdGgob3B0aW9uczogR3JpZExpc3RIYXJuZXNzRmlsdGVycyA9IHt9KTogSGFybmVzc1ByZWRpY2F0ZTxNYXRHcmlkTGlzdEhhcm5lc3M+IHtcbiAgICByZXR1cm4gbmV3IEhhcm5lc3NQcmVkaWNhdGUoTWF0R3JpZExpc3RIYXJuZXNzLCBvcHRpb25zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaWxlIGNvb3JkaW5hdG9yIHRoYXQgaXMgdXNlZCBieSB0aGUgXCJNYXRHcmlkTGlzdFwiIGZvciBjb21wdXRpbmdcbiAgICogcG9zaXRpb25zIG9mIHRpbGVzLiBXZSBsZXZlcmFnZSB0aGUgY29vcmRpbmF0b3IgdG8gcHJvdmlkZSBhbiBBUElcbiAgICogZm9yIHJldHJpZXZpbmcgdGlsZXMgYmFzZWQgb24gdmlzdWFsIHRpbGUgcG9zaXRpb25zLlxuICAgKi9cbiAgcHJpdmF0ZSBfdGlsZUNvb3JkaW5hdG9yID0gbmV3IFRpbGVDb29yZGluYXRvcigpO1xuXG4gIC8qKiBHZXRzIGFsbCB0aWxlcyBvZiB0aGUgZ3JpZC1saXN0LiAqL1xuICBhc3luYyBnZXRUaWxlcyhmaWx0ZXJzOiBHcmlkVGlsZUhhcm5lc3NGaWx0ZXJzID0ge30pOiBQcm9taXNlPE1hdEdyaWRUaWxlSGFybmVzc1tdPiB7XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMubG9jYXRvckZvckFsbChNYXRHcmlkVGlsZUhhcm5lc3Mud2l0aChmaWx0ZXJzKSkoKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBhbW91bnQgb2YgY29sdW1ucyBvZiB0aGUgZ3JpZC1saXN0LiAqL1xuICBhc3luYyBnZXRDb2x1bW5zKCk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgcmV0dXJuIE51bWJlcihhd2FpdCAoYXdhaXQgdGhpcy5ob3N0KCkpLmdldEF0dHJpYnV0ZSgnY29scycpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIGEgdGlsZSBvZiB0aGUgZ3JpZC1saXN0IHRoYXQgaXMgbG9jYXRlZCBhdCB0aGUgZ2l2ZW4gbG9jYXRpb24uXG4gICAqIEBwYXJhbSByb3cgWmVyby1iYXNlZCByb3cgaW5kZXguXG4gICAqIEBwYXJhbSBjb2x1bW4gWmVyby1iYXNlZCBjb2x1bW4gaW5kZXguXG4gICAqL1xuICBhc3luYyBnZXRUaWxlQXRQb3NpdGlvbih7cm93LCBjb2x1bW59OiB7cm93OiBudW1iZXIsIGNvbHVtbjogbnVtYmVyfSk6XG4gICAgICBQcm9taXNlPE1hdEdyaWRUaWxlSGFybmVzcz4ge1xuICAgIGNvbnN0IFt0aWxlSGFybmVzc2VzLCBjb2x1bW5zXSA9IGF3YWl0IHBhcmFsbGVsKCgpID0+IFt0aGlzLmdldFRpbGVzKCksIHRoaXMuZ2V0Q29sdW1ucygpXSk7XG4gICAgY29uc3QgdGlsZVNwYW5zID0gdGlsZUhhcm5lc3Nlcy5tYXAodCA9PiBwYXJhbGxlbCgoKSA9PiBbdC5nZXRDb2xzcGFuKCksIHQuZ2V0Um93c3BhbigpXSkpO1xuICAgIGNvbnN0IHRpbGVzID0gKGF3YWl0IHBhcmFsbGVsKCgpID0+IHRpbGVTcGFucykpXG4gICAgICAgIC5tYXAoKFtjb2xzcGFuLCByb3dzcGFuXSkgPT4gKHtjb2xzcGFuLCByb3dzcGFufSkpO1xuICAgIC8vIFVwZGF0ZSB0aGUgdGlsZSBjb29yZGluYXRvciB0byByZWZsZWN0IHRoZSBjdXJyZW50IGNvbHVtbiBhbW91bnQgYW5kXG4gICAgLy8gcmVuZGVyZWQgdGlsZXMuIFdlIHVwZGF0ZSB1cG9uIGV2ZXJ5IGNhbGwgb2YgdGhpcyBtZXRob2Qgc2luY2Ugd2UgZG8gbm90XG4gICAgLy8ga25vdyBpZiB0aWxlcyBoYXZlIGJlZW4gYWRkZWQsIHJlbW92ZWQgb3IgdXBkYXRlZCAoaW4gdGVybXMgb2Ygcm93c3Bhbi9jb2xzcGFuKS5cbiAgICB0aGlzLl90aWxlQ29vcmRpbmF0b3IudXBkYXRlKGNvbHVtbnMsIHRpbGVzKTtcbiAgICAvLyBUaGUgdGlsZSBjb29yZGluYXRvciByZXNwZWN0cyB0aGUgY29sc3BhbiBhbmQgcm93c3BhbiBmb3IgY2FsY3VsYXRpbmcgdGhlIHBvc2l0aW9uc1xuICAgIC8vIG9mIHRpbGVzLCBidXQgaXQgZG9lcyBub3QgY3JlYXRlIG11bHRpcGxlIHBvc2l0aW9uIGVudHJpZXMgaWYgYSB0aWxlIHNwYW5zIG92ZXIgbXVsdGlwbGVcbiAgICAvLyBjb2x1bW5zIG9yIHJvd3MuIFdlIHdhbnQgdG8gcHJvdmlkZSBhbiBBUEkgd2hlcmUgZGV2ZWxvcGVycyBjYW4gcmV0cmlldmUgYSB0aWxlIGJhc2VkIG9uXG4gICAgLy8gYW55IHBvc2l0aW9uIHRoYXQgbGllcyB3aXRoaW4gdGhlIHZpc3VhbCB0aWxlIGJvdW5kYXJpZXMuIEZvciBleGFtcGxlOiBJZiBhIHRpbGUgc3BhbnNcbiAgICAvLyBvdmVyIHR3byBjb2x1bW5zLCB0aGVuIHRoZSBzYW1lIHRpbGUgc2hvdWxkIGJlIHJldHVybmVkIGZvciBlaXRoZXIgY29sdW1uIGluZGljZXMuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl90aWxlQ29vcmRpbmF0b3IucG9zaXRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBwb3NpdGlvbiA9IHRoaXMuX3RpbGVDb29yZGluYXRvci5wb3NpdGlvbnNbaV07XG4gICAgICBjb25zdCB7cm93c3BhbiwgY29sc3Bhbn0gPSB0aWxlc1tpXTtcbiAgICAgIC8vIFJldHVybiB0aGUgdGlsZSBoYXJuZXNzIGlmIHRoZSBnaXZlbiBwb3NpdGlvbiB2aXN1YWxseSByZXNvbHZlcyB0byB0aGUgdGlsZS5cbiAgICAgIGlmIChjb2x1bW4gPj0gcG9zaXRpb24uY29sICYmIGNvbHVtbiA8PSBwb3NpdGlvbi5jb2wgKyBjb2xzcGFuIC0gMSAmJiByb3cgPj0gcG9zaXRpb24ucm93ICYmXG4gICAgICAgICAgcm93IDw9IHBvc2l0aW9uLnJvdyArIHJvd3NwYW4gLSAxKSB7XG4gICAgICAgIHJldHVybiB0aWxlSGFybmVzc2VzW2ldO1xuICAgICAgfVxuICAgIH1cbiAgICB0aHJvdyBFcnJvcignQ291bGQgbm90IGZpbmQgdGlsZSBhdCBnaXZlbiBwb3NpdGlvbi4nKTtcbiAgfVxufVxuIl19