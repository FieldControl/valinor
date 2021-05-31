/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { ComponentHarness, HarnessPredicate, parallel, } from '@angular/cdk/testing';
import { MatCellHarness, MatHeaderCellHarness, MatFooterCellHarness } from './cell-harness';
export class _MatRowHarnessBase extends ComponentHarness {
    /** Gets a list of `MatCellHarness` for all cells in the row. */
    getCells(filter = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.locatorForAll(this._cellHarness.with(filter))();
        });
    }
    /** Gets the text of the cells in the row. */
    getCellTextByIndex(filter = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const cells = yield this.getCells(filter);
            return parallel(() => cells.map(cell => cell.getText()));
        });
    }
    /** Gets the text inside the row organized by columns. */
    getCellTextByColumnName() {
        return __awaiter(this, void 0, void 0, function* () {
            const output = {};
            const cells = yield this.getCells();
            const cellsData = yield parallel(() => cells.map(cell => {
                return parallel(() => [cell.getColumnName(), cell.getText()]);
            }));
            cellsData.forEach(([columnName, text]) => output[columnName] = text);
            return output;
        });
    }
}
/** Harness for interacting with a standard Angular Material table row. */
export class MatRowHarness extends _MatRowHarnessBase {
    constructor() {
        super(...arguments);
        this._cellHarness = MatCellHarness;
    }
    /**
     * Gets a `HarnessPredicate` that can be used to search for a table row with specific attributes.
     * @param options Options for narrowing the search
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(MatRowHarness, options);
    }
}
/** The selector for the host element of a `MatRowHarness` instance. */
MatRowHarness.hostSelector = '.mat-row';
/** Harness for interacting with a standard Angular Material table header row. */
export class MatHeaderRowHarness extends _MatRowHarnessBase {
    constructor() {
        super(...arguments);
        this._cellHarness = MatHeaderCellHarness;
    }
    /**
     * Gets a `HarnessPredicate` that can be used to search for
     * a table header row with specific attributes.
     * @param options Options for narrowing the search
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(MatHeaderRowHarness, options);
    }
}
/** The selector for the host element of a `MatHeaderRowHarness` instance. */
MatHeaderRowHarness.hostSelector = '.mat-header-row';
/** Harness for interacting with a standard Angular Material table footer row. */
export class MatFooterRowHarness extends _MatRowHarnessBase {
    constructor() {
        super(...arguments);
        this._cellHarness = MatFooterCellHarness;
    }
    /**
     * Gets a `HarnessPredicate` that can be used to search for
     * a table footer row cell with specific attributes.
     * @param options Options for narrowing the search
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(MatFooterRowHarness, options);
    }
}
/** The selector for the host element of a `MatFooterRowHarness` instance. */
MatFooterRowHarness.hostSelector = '.mat-footer-row';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm93LWhhcm5lc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvdGFibGUvdGVzdGluZy9yb3ctaGFybmVzcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUNMLGdCQUFnQixFQUVoQixnQkFBZ0IsRUFDaEIsUUFBUSxHQUNULE1BQU0sc0JBQXNCLENBQUM7QUFFOUIsT0FBTyxFQUFDLGNBQWMsRUFBRSxvQkFBb0IsRUFBRSxvQkFBb0IsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBTzFGLE1BQU0sT0FBZ0Isa0JBSXBCLFNBQVEsZ0JBQWdCO0lBR3hCLGdFQUFnRTtJQUMxRCxRQUFRLENBQUMsU0FBNkIsRUFBRTs7WUFDNUMsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUM5RCxDQUFDO0tBQUE7SUFFRCw2Q0FBNkM7SUFDdkMsa0JBQWtCLENBQUMsU0FBNkIsRUFBRTs7WUFDdEQsTUFBTSxLQUFLLEdBQUcsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzFDLE9BQU8sUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzNELENBQUM7S0FBQTtJQUVELHlEQUF5RDtJQUNuRCx1QkFBdUI7O1lBQzNCLE1BQU0sTUFBTSxHQUE2QixFQUFFLENBQUM7WUFDNUMsTUFBTSxLQUFLLEdBQUcsTUFBTSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDcEMsTUFBTSxTQUFTLEdBQUcsTUFBTSxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDdEQsT0FBTyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNoRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ0osU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7WUFDckUsT0FBTyxNQUFNLENBQUM7UUFDaEIsQ0FBQztLQUFBO0NBQ0Y7QUFFRCwwRUFBMEU7QUFDMUUsTUFBTSxPQUFPLGFBQWMsU0FBUSxrQkFBeUQ7SUFBNUY7O1FBR1ksaUJBQVksR0FBRyxjQUFjLENBQUM7SUFVMUMsQ0FBQztJQVJDOzs7O09BSUc7SUFDSCxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQTZCLEVBQUU7UUFDekMsT0FBTyxJQUFJLGdCQUFnQixDQUFDLGFBQWEsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUN0RCxDQUFDOztBQVhELHVFQUF1RTtBQUNoRSwwQkFBWSxHQUFHLFVBQVUsQ0FBQztBQWFuQyxpRkFBaUY7QUFDakYsTUFBTSxPQUFPLG1CQUFvQixTQUFRLGtCQUNXO0lBRHBEOztRQUlZLGlCQUFZLEdBQUcsb0JBQW9CLENBQUM7SUFXaEQsQ0FBQztJQVRDOzs7OztPQUtHO0lBQ0gsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUE2QixFQUFFO1FBQ3pDLE9BQU8sSUFBSSxnQkFBZ0IsQ0FBQyxtQkFBbUIsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUM1RCxDQUFDOztBQVpELDZFQUE2RTtBQUN0RSxnQ0FBWSxHQUFHLGlCQUFpQixDQUFDO0FBZTFDLGlGQUFpRjtBQUNqRixNQUFNLE9BQU8sbUJBQW9CLFNBQVEsa0JBQ1c7SUFEcEQ7O1FBSVksaUJBQVksR0FBRyxvQkFBb0IsQ0FBQztJQVdoRCxDQUFDO0lBVEM7Ozs7O09BS0c7SUFDSCxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQTZCLEVBQUU7UUFDekMsT0FBTyxJQUFJLGdCQUFnQixDQUFDLG1CQUFtQixFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzVELENBQUM7O0FBWkQsNkVBQTZFO0FBQ3RFLGdDQUFZLEdBQUcsaUJBQWlCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgQ29tcG9uZW50SGFybmVzcyxcbiAgQ29tcG9uZW50SGFybmVzc0NvbnN0cnVjdG9yLFxuICBIYXJuZXNzUHJlZGljYXRlLFxuICBwYXJhbGxlbCxcbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL3Rlc3RpbmcnO1xuaW1wb3J0IHtSb3dIYXJuZXNzRmlsdGVycywgQ2VsbEhhcm5lc3NGaWx0ZXJzfSBmcm9tICcuL3RhYmxlLWhhcm5lc3MtZmlsdGVycyc7XG5pbXBvcnQge01hdENlbGxIYXJuZXNzLCBNYXRIZWFkZXJDZWxsSGFybmVzcywgTWF0Rm9vdGVyQ2VsbEhhcm5lc3N9IGZyb20gJy4vY2VsbC1oYXJuZXNzJztcblxuLyoqIFRleHQgZXh0cmFjdGVkIGZyb20gYSB0YWJsZSByb3cgb3JnYW5pemVkIGJ5IGNvbHVtbnMuICovXG5leHBvcnQgaW50ZXJmYWNlIE1hdFJvd0hhcm5lc3NDb2x1bW5zVGV4dCB7XG4gIFtjb2x1bW5OYW1lOiBzdHJpbmddOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBfTWF0Um93SGFybmVzc0Jhc2U8XG4gIENlbGxUeXBlIGV4dGVuZHMgKENvbXBvbmVudEhhcm5lc3NDb25zdHJ1Y3RvcjxDZWxsPiAmIHtcbiAgICB3aXRoOiAob3B0aW9ucz86IENlbGxIYXJuZXNzRmlsdGVycykgPT4gSGFybmVzc1ByZWRpY2F0ZTxDZWxsPn0pLFxuICBDZWxsIGV4dGVuZHMgQ29tcG9uZW50SGFybmVzcyAmIHtnZXRUZXh0KCk6IFByb21pc2U8c3RyaW5nPiwgZ2V0Q29sdW1uTmFtZSgpOiBQcm9taXNlPHN0cmluZz59XG4+IGV4dGVuZHMgQ29tcG9uZW50SGFybmVzcyB7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCBfY2VsbEhhcm5lc3M6IENlbGxUeXBlO1xuXG4gIC8qKiBHZXRzIGEgbGlzdCBvZiBgTWF0Q2VsbEhhcm5lc3NgIGZvciBhbGwgY2VsbHMgaW4gdGhlIHJvdy4gKi9cbiAgYXN5bmMgZ2V0Q2VsbHMoZmlsdGVyOiBDZWxsSGFybmVzc0ZpbHRlcnMgPSB7fSk6IFByb21pc2U8Q2VsbFtdPiB7XG4gICAgcmV0dXJuIHRoaXMubG9jYXRvckZvckFsbCh0aGlzLl9jZWxsSGFybmVzcy53aXRoKGZpbHRlcikpKCk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgdGV4dCBvZiB0aGUgY2VsbHMgaW4gdGhlIHJvdy4gKi9cbiAgYXN5bmMgZ2V0Q2VsbFRleHRCeUluZGV4KGZpbHRlcjogQ2VsbEhhcm5lc3NGaWx0ZXJzID0ge30pOiBQcm9taXNlPHN0cmluZ1tdPiB7XG4gICAgY29uc3QgY2VsbHMgPSBhd2FpdCB0aGlzLmdldENlbGxzKGZpbHRlcik7XG4gICAgcmV0dXJuIHBhcmFsbGVsKCgpID0+IGNlbGxzLm1hcChjZWxsID0+IGNlbGwuZ2V0VGV4dCgpKSk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgdGV4dCBpbnNpZGUgdGhlIHJvdyBvcmdhbml6ZWQgYnkgY29sdW1ucy4gKi9cbiAgYXN5bmMgZ2V0Q2VsbFRleHRCeUNvbHVtbk5hbWUoKTogUHJvbWlzZTxNYXRSb3dIYXJuZXNzQ29sdW1uc1RleHQ+IHtcbiAgICBjb25zdCBvdXRwdXQ6IE1hdFJvd0hhcm5lc3NDb2x1bW5zVGV4dCA9IHt9O1xuICAgIGNvbnN0IGNlbGxzID0gYXdhaXQgdGhpcy5nZXRDZWxscygpO1xuICAgIGNvbnN0IGNlbGxzRGF0YSA9IGF3YWl0IHBhcmFsbGVsKCgpID0+IGNlbGxzLm1hcChjZWxsID0+IHtcbiAgICAgIHJldHVybiBwYXJhbGxlbCgoKSA9PiBbY2VsbC5nZXRDb2x1bW5OYW1lKCksIGNlbGwuZ2V0VGV4dCgpXSk7XG4gICAgfSkpO1xuICAgIGNlbGxzRGF0YS5mb3JFYWNoKChbY29sdW1uTmFtZSwgdGV4dF0pID0+IG91dHB1dFtjb2x1bW5OYW1lXSA9IHRleHQpO1xuICAgIHJldHVybiBvdXRwdXQ7XG4gIH1cbn1cblxuLyoqIEhhcm5lc3MgZm9yIGludGVyYWN0aW5nIHdpdGggYSBzdGFuZGFyZCBBbmd1bGFyIE1hdGVyaWFsIHRhYmxlIHJvdy4gKi9cbmV4cG9ydCBjbGFzcyBNYXRSb3dIYXJuZXNzIGV4dGVuZHMgX01hdFJvd0hhcm5lc3NCYXNlPHR5cGVvZiBNYXRDZWxsSGFybmVzcywgTWF0Q2VsbEhhcm5lc3M+IHtcbiAgLyoqIFRoZSBzZWxlY3RvciBmb3IgdGhlIGhvc3QgZWxlbWVudCBvZiBhIGBNYXRSb3dIYXJuZXNzYCBpbnN0YW5jZS4gKi9cbiAgc3RhdGljIGhvc3RTZWxlY3RvciA9ICcubWF0LXJvdyc7XG4gIHByb3RlY3RlZCBfY2VsbEhhcm5lc3MgPSBNYXRDZWxsSGFybmVzcztcblxuICAvKipcbiAgICogR2V0cyBhIGBIYXJuZXNzUHJlZGljYXRlYCB0aGF0IGNhbiBiZSB1c2VkIHRvIHNlYXJjaCBmb3IgYSB0YWJsZSByb3cgd2l0aCBzcGVjaWZpYyBhdHRyaWJ1dGVzLlxuICAgKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25zIGZvciBuYXJyb3dpbmcgdGhlIHNlYXJjaFxuICAgKiBAcmV0dXJuIGEgYEhhcm5lc3NQcmVkaWNhdGVgIGNvbmZpZ3VyZWQgd2l0aCB0aGUgZ2l2ZW4gb3B0aW9ucy5cbiAgICovXG4gIHN0YXRpYyB3aXRoKG9wdGlvbnM6IFJvd0hhcm5lc3NGaWx0ZXJzID0ge30pOiBIYXJuZXNzUHJlZGljYXRlPE1hdFJvd0hhcm5lc3M+IHtcbiAgICByZXR1cm4gbmV3IEhhcm5lc3NQcmVkaWNhdGUoTWF0Um93SGFybmVzcywgb3B0aW9ucyk7XG4gIH1cbn1cblxuLyoqIEhhcm5lc3MgZm9yIGludGVyYWN0aW5nIHdpdGggYSBzdGFuZGFyZCBBbmd1bGFyIE1hdGVyaWFsIHRhYmxlIGhlYWRlciByb3cuICovXG5leHBvcnQgY2xhc3MgTWF0SGVhZGVyUm93SGFybmVzcyBleHRlbmRzIF9NYXRSb3dIYXJuZXNzQmFzZTxcbiAgdHlwZW9mIE1hdEhlYWRlckNlbGxIYXJuZXNzLCBNYXRIZWFkZXJDZWxsSGFybmVzcz4ge1xuICAvKiogVGhlIHNlbGVjdG9yIGZvciB0aGUgaG9zdCBlbGVtZW50IG9mIGEgYE1hdEhlYWRlclJvd0hhcm5lc3NgIGluc3RhbmNlLiAqL1xuICBzdGF0aWMgaG9zdFNlbGVjdG9yID0gJy5tYXQtaGVhZGVyLXJvdyc7XG4gIHByb3RlY3RlZCBfY2VsbEhhcm5lc3MgPSBNYXRIZWFkZXJDZWxsSGFybmVzcztcblxuICAvKipcbiAgICogR2V0cyBhIGBIYXJuZXNzUHJlZGljYXRlYCB0aGF0IGNhbiBiZSB1c2VkIHRvIHNlYXJjaCBmb3JcbiAgICogYSB0YWJsZSBoZWFkZXIgcm93IHdpdGggc3BlY2lmaWMgYXR0cmlidXRlcy5cbiAgICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyBmb3IgbmFycm93aW5nIHRoZSBzZWFyY2hcbiAgICogQHJldHVybiBhIGBIYXJuZXNzUHJlZGljYXRlYCBjb25maWd1cmVkIHdpdGggdGhlIGdpdmVuIG9wdGlvbnMuXG4gICAqL1xuICBzdGF0aWMgd2l0aChvcHRpb25zOiBSb3dIYXJuZXNzRmlsdGVycyA9IHt9KTogSGFybmVzc1ByZWRpY2F0ZTxNYXRIZWFkZXJSb3dIYXJuZXNzPiB7XG4gICAgcmV0dXJuIG5ldyBIYXJuZXNzUHJlZGljYXRlKE1hdEhlYWRlclJvd0hhcm5lc3MsIG9wdGlvbnMpO1xuICB9XG59XG5cblxuLyoqIEhhcm5lc3MgZm9yIGludGVyYWN0aW5nIHdpdGggYSBzdGFuZGFyZCBBbmd1bGFyIE1hdGVyaWFsIHRhYmxlIGZvb3RlciByb3cuICovXG5leHBvcnQgY2xhc3MgTWF0Rm9vdGVyUm93SGFybmVzcyBleHRlbmRzIF9NYXRSb3dIYXJuZXNzQmFzZTxcbiAgdHlwZW9mIE1hdEZvb3RlckNlbGxIYXJuZXNzLCBNYXRGb290ZXJDZWxsSGFybmVzcz4ge1xuICAvKiogVGhlIHNlbGVjdG9yIGZvciB0aGUgaG9zdCBlbGVtZW50IG9mIGEgYE1hdEZvb3RlclJvd0hhcm5lc3NgIGluc3RhbmNlLiAqL1xuICBzdGF0aWMgaG9zdFNlbGVjdG9yID0gJy5tYXQtZm9vdGVyLXJvdyc7XG4gIHByb3RlY3RlZCBfY2VsbEhhcm5lc3MgPSBNYXRGb290ZXJDZWxsSGFybmVzcztcblxuICAvKipcbiAgICogR2V0cyBhIGBIYXJuZXNzUHJlZGljYXRlYCB0aGF0IGNhbiBiZSB1c2VkIHRvIHNlYXJjaCBmb3JcbiAgICogYSB0YWJsZSBmb290ZXIgcm93IGNlbGwgd2l0aCBzcGVjaWZpYyBhdHRyaWJ1dGVzLlxuICAgKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25zIGZvciBuYXJyb3dpbmcgdGhlIHNlYXJjaFxuICAgKiBAcmV0dXJuIGEgYEhhcm5lc3NQcmVkaWNhdGVgIGNvbmZpZ3VyZWQgd2l0aCB0aGUgZ2l2ZW4gb3B0aW9ucy5cbiAgICovXG4gIHN0YXRpYyB3aXRoKG9wdGlvbnM6IFJvd0hhcm5lc3NGaWx0ZXJzID0ge30pOiBIYXJuZXNzUHJlZGljYXRlPE1hdEZvb3RlclJvd0hhcm5lc3M+IHtcbiAgICByZXR1cm4gbmV3IEhhcm5lc3NQcmVkaWNhdGUoTWF0Rm9vdGVyUm93SGFybmVzcywgb3B0aW9ucyk7XG4gIH1cbn1cbiJdfQ==