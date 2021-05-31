/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { _isNumberValue } from '@angular/cdk/coercion';
import { DataSource } from '@angular/cdk/table';
import { BehaviorSubject, combineLatest, merge, of as observableOf, Subject, } from 'rxjs';
import { map } from 'rxjs/operators';
/**
 * Corresponds to `Number.MAX_SAFE_INTEGER`. Moved out into a variable here due to
 * flaky browser support and the value not being defined in Closure's typings.
 */
const MAX_SAFE_INTEGER = 9007199254740991;
/** Shared base class with MDC-based implementation. */
export class _MatTableDataSource extends DataSource {
    constructor(initialData = []) {
        super();
        /** Stream emitting render data to the table (depends on ordered data changes). */
        this._renderData = new BehaviorSubject([]);
        /** Stream that emits when a new filter string is set on the data source. */
        this._filter = new BehaviorSubject('');
        /** Used to react to internal changes of the paginator that are made by the data source itself. */
        this._internalPageChanges = new Subject();
        /**
         * Subscription to the changes that should trigger an update to the table's rendered rows, such
         * as filtering, sorting, pagination, or base data changes.
         */
        this._renderChangesSubscription = null;
        /**
         * Data accessor function that is used for accessing data properties for sorting through
         * the default sortData function.
         * This default function assumes that the sort header IDs (which defaults to the column name)
         * matches the data's properties (e.g. column Xyz represents data['Xyz']).
         * May be set to a custom function for different behavior.
         * @param data Data object that is being accessed.
         * @param sortHeaderId The name of the column that represents the data.
         */
        this.sortingDataAccessor = (data, sortHeaderId) => {
            const value = data[sortHeaderId];
            if (_isNumberValue(value)) {
                const numberValue = Number(value);
                // Numbers beyond `MAX_SAFE_INTEGER` can't be compared reliably so we
                // leave them as strings. For more info: https://goo.gl/y5vbSg
                return numberValue < MAX_SAFE_INTEGER ? numberValue : value;
            }
            return value;
        };
        /**
         * Gets a sorted copy of the data array based on the state of the MatSort. Called
         * after changes are made to the filtered data or when sort changes are emitted from MatSort.
         * By default, the function retrieves the active sort and its direction and compares data
         * by retrieving data using the sortingDataAccessor. May be overridden for a custom implementation
         * of data ordering.
         * @param data The array of data that should be sorted.
         * @param sort The connected MatSort that holds the current sort state.
         */
        this.sortData = (data, sort) => {
            const active = sort.active;
            const direction = sort.direction;
            if (!active || direction == '') {
                return data;
            }
            return data.sort((a, b) => {
                let valueA = this.sortingDataAccessor(a, active);
                let valueB = this.sortingDataAccessor(b, active);
                // If there are data in the column that can be converted to a number,
                // it must be ensured that the rest of the data
                // is of the same type so as not to order incorrectly.
                const valueAType = typeof valueA;
                const valueBType = typeof valueB;
                if (valueAType !== valueBType) {
                    if (valueAType === 'number') {
                        valueA += '';
                    }
                    if (valueBType === 'number') {
                        valueB += '';
                    }
                }
                // If both valueA and valueB exist (truthy), then compare the two. Otherwise, check if
                // one value exists while the other doesn't. In this case, existing value should come last.
                // This avoids inconsistent results when comparing values to undefined/null.
                // If neither value exists, return 0 (equal).
                let comparatorResult = 0;
                if (valueA != null && valueB != null) {
                    // Check if one value is greater than the other; if equal, comparatorResult should remain 0.
                    if (valueA > valueB) {
                        comparatorResult = 1;
                    }
                    else if (valueA < valueB) {
                        comparatorResult = -1;
                    }
                }
                else if (valueA != null) {
                    comparatorResult = 1;
                }
                else if (valueB != null) {
                    comparatorResult = -1;
                }
                return comparatorResult * (direction == 'asc' ? 1 : -1);
            });
        };
        /**
         * Checks if a data object matches the data source's filter string. By default, each data object
         * is converted to a string of its properties and returns true if the filter has
         * at least one occurrence in that string. By default, the filter string has its whitespace
         * trimmed and the match is case-insensitive. May be overridden for a custom implementation of
         * filter matching.
         * @param data Data object used to check against the filter.
         * @param filter Filter string that has been set on the data source.
         * @returns Whether the filter matches against the data
         */
        this.filterPredicate = (data, filter) => {
            // Transform the data into a lowercase string of all property values.
            const dataStr = Object.keys(data).reduce((currentTerm, key) => {
                // Use an obscure Unicode character to delimit the words in the concatenated string.
                // This avoids matches where the values of two columns combined will match the user's query
                // (e.g. `Flute` and `Stop` will match `Test`). The character is intended to be something
                // that has a very low chance of being typed in by somebody in a text field. This one in
                // particular is "White up-pointing triangle with dot" from
                // https://en.wikipedia.org/wiki/List_of_Unicode_characters
                return currentTerm + data[key] + '◬';
            }, '').toLowerCase();
            // Transform the filter by converting it to lowercase and removing whitespace.
            const transformedFilter = filter.trim().toLowerCase();
            return dataStr.indexOf(transformedFilter) != -1;
        };
        this._data = new BehaviorSubject(initialData);
        this._updateChangeSubscription();
    }
    /** Array of data that should be rendered by the table, where each object represents one row. */
    get data() { return this._data.value; }
    set data(data) {
        this._data.next(data);
        // Normally the `filteredData` is updated by the re-render
        // subscription, but that won't happen if it's inactive.
        if (!this._renderChangesSubscription) {
            this._filterData(data);
        }
    }
    /**
     * Filter term that should be used to filter out objects from the data array. To override how
     * data objects match to this filter string, provide a custom function for filterPredicate.
     */
    get filter() { return this._filter.value; }
    set filter(filter) {
        this._filter.next(filter);
        // Normally the `filteredData` is updated by the re-render
        // subscription, but that won't happen if it's inactive.
        if (!this._renderChangesSubscription) {
            this._filterData(this.data);
        }
    }
    /**
     * Instance of the MatSort directive used by the table to control its sorting. Sort changes
     * emitted by the MatSort will trigger an update to the table's rendered data.
     */
    get sort() { return this._sort; }
    set sort(sort) {
        this._sort = sort;
        this._updateChangeSubscription();
    }
    /**
     * Instance of the MatPaginator component used by the table to control what page of the data is
     * displayed. Page changes emitted by the MatPaginator will trigger an update to the
     * table's rendered data.
     *
     * Note that the data source uses the paginator's properties to calculate which page of data
     * should be displayed. If the paginator receives its properties as template inputs,
     * e.g. `[pageLength]=100` or `[pageIndex]=1`, then be sure that the paginator's view has been
     * initialized before assigning it to this data source.
     */
    get paginator() { return this._paginator; }
    set paginator(paginator) {
        this._paginator = paginator;
        this._updateChangeSubscription();
    }
    /**
     * Subscribe to changes that should trigger an update to the table's rendered rows. When the
     * changes occur, process the current state of the filter, sort, and pagination along with
     * the provided base data and send it to the table for rendering.
     */
    _updateChangeSubscription() {
        var _a;
        // Sorting and/or pagination should be watched if MatSort and/or MatPaginator are provided.
        // The events should emit whenever the component emits a change or initializes, or if no
        // component is provided, a stream with just a null event should be provided.
        // The `sortChange` and `pageChange` acts as a signal to the combineLatests below so that the
        // pipeline can progress to the next step. Note that the value from these streams are not used,
        // they purely act as a signal to progress in the pipeline.
        const sortChange = this._sort ?
            merge(this._sort.sortChange, this._sort.initialized) :
            observableOf(null);
        const pageChange = this._paginator ?
            merge(this._paginator.page, this._internalPageChanges, this._paginator.initialized) :
            observableOf(null);
        const dataStream = this._data;
        // Watch for base data or filter changes to provide a filtered set of data.
        const filteredData = combineLatest([dataStream, this._filter])
            .pipe(map(([data]) => this._filterData(data)));
        // Watch for filtered data or sort changes to provide an ordered set of data.
        const orderedData = combineLatest([filteredData, sortChange])
            .pipe(map(([data]) => this._orderData(data)));
        // Watch for ordered data or page changes to provide a paged set of data.
        const paginatedData = combineLatest([orderedData, pageChange])
            .pipe(map(([data]) => this._pageData(data)));
        // Watched for paged data changes and send the result to the table to render.
        (_a = this._renderChangesSubscription) === null || _a === void 0 ? void 0 : _a.unsubscribe();
        this._renderChangesSubscription = paginatedData.subscribe(data => this._renderData.next(data));
    }
    /**
     * Returns a filtered data array where each filter object contains the filter string within
     * the result of the filterTermAccessor function. If no filter is set, returns the data array
     * as provided.
     */
    _filterData(data) {
        // If there is a filter string, filter out data that does not contain it.
        // Each data object is converted to a string using the function defined by filterTermAccessor.
        // May be overridden for customization.
        this.filteredData = (this.filter == null || this.filter === '') ? data :
            data.filter(obj => this.filterPredicate(obj, this.filter));
        if (this.paginator) {
            this._updatePaginator(this.filteredData.length);
        }
        return this.filteredData;
    }
    /**
     * Returns a sorted copy of the data if MatSort has a sort applied, otherwise just returns the
     * data array as provided. Uses the default data accessor for data lookup, unless a
     * sortDataAccessor function is defined.
     */
    _orderData(data) {
        // If there is no active sort or direction, return the data without trying to sort.
        if (!this.sort) {
            return data;
        }
        return this.sortData(data.slice(), this.sort);
    }
    /**
     * Returns a paged slice of the provided data array according to the provided MatPaginator's page
     * index and length. If there is no paginator provided, returns the data array as provided.
     */
    _pageData(data) {
        if (!this.paginator) {
            return data;
        }
        const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
        return data.slice(startIndex, startIndex + this.paginator.pageSize);
    }
    /**
     * Updates the paginator to reflect the length of the filtered data, and makes sure that the page
     * index does not exceed the paginator's last page. Values are changed in a resolved promise to
     * guard against making property changes within a round of change detection.
     */
    _updatePaginator(filteredDataLength) {
        Promise.resolve().then(() => {
            const paginator = this.paginator;
            if (!paginator) {
                return;
            }
            paginator.length = filteredDataLength;
            // If the page index is set beyond the page, reduce it to the last page.
            if (paginator.pageIndex > 0) {
                const lastPageIndex = Math.ceil(paginator.length / paginator.pageSize) - 1 || 0;
                const newPageIndex = Math.min(paginator.pageIndex, lastPageIndex);
                if (newPageIndex !== paginator.pageIndex) {
                    paginator.pageIndex = newPageIndex;
                    // Since the paginator only emits after user-generated changes,
                    // we need our own stream so we know to should re-render the data.
                    this._internalPageChanges.next();
                }
            }
        });
    }
    /**
     * Used by the MatTable. Called when it connects to the data source.
     * @docs-private
     */
    connect() {
        if (!this._renderChangesSubscription) {
            this._updateChangeSubscription();
        }
        return this._renderData;
    }
    /**
     * Used by the MatTable. Called when it disconnects from the data source.
     * @docs-private
     */
    disconnect() {
        var _a;
        (_a = this._renderChangesSubscription) === null || _a === void 0 ? void 0 : _a.unsubscribe();
        this._renderChangesSubscription = null;
    }
}
/**
 * Data source that accepts a client-side data array and includes native support of filtering,
 * sorting (using MatSort), and pagination (using MatPaginator).
 *
 * Allows for sort customization by overriding sortingDataAccessor, which defines how data
 * properties are accessed. Also allows for filter customization by overriding filterTermAccessor,
 * which defines how row data is converted to a string for filter matching.
 *
 * **Note:** This class is meant to be a simple data source to help you get started. As such
 * it isn't equipped to handle some more advanced cases like robust i18n support or server-side
 * interactions. If your app needs to support more advanced use cases, consider implementing your
 * own `DataSource`.
 */
export class MatTableDataSource extends _MatTableDataSource {
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUtZGF0YS1zb3VyY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvdGFibGUvdGFibGUtZGF0YS1zb3VyY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQ3JELE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUc5QyxPQUFPLEVBQ0wsZUFBZSxFQUNmLGFBQWEsRUFDYixLQUFLLEVBRUwsRUFBRSxJQUFJLFlBQVksRUFDbEIsT0FBTyxHQUVSLE1BQU0sTUFBTSxDQUFDO0FBQ2QsT0FBTyxFQUFDLEdBQUcsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBRW5DOzs7R0FHRztBQUNILE1BQU0sZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUM7QUF3QjFDLHVEQUF1RDtBQUN2RCxNQUFNLE9BQU8sbUJBRVQsU0FBUSxVQUFhO0lBdUx2QixZQUFZLGNBQW1CLEVBQUU7UUFDL0IsS0FBSyxFQUFFLENBQUM7UUFwTFYsa0ZBQWtGO1FBQ2pFLGdCQUFXLEdBQUcsSUFBSSxlQUFlLENBQU0sRUFBRSxDQUFDLENBQUM7UUFFNUQsNEVBQTRFO1FBQzNELFlBQU8sR0FBRyxJQUFJLGVBQWUsQ0FBUyxFQUFFLENBQUMsQ0FBQztRQUUzRCxrR0FBa0c7UUFDakYseUJBQW9CLEdBQUcsSUFBSSxPQUFPLEVBQVEsQ0FBQztRQUU1RDs7O1dBR0c7UUFDSCwrQkFBMEIsR0FBc0IsSUFBSSxDQUFDO1FBK0RyRDs7Ozs7Ozs7V0FRRztRQUNILHdCQUFtQixHQUNmLENBQUMsSUFBTyxFQUFFLFlBQW9CLEVBQWlCLEVBQUU7WUFDbkQsTUFBTSxLQUFLLEdBQUksSUFBNkIsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUUzRCxJQUFJLGNBQWMsQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDekIsTUFBTSxX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QzNCLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDaEYsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLGFBQWEsQ0FBQyxDQUFDO2dCQUVsRSxJQUFJLFlBQVksS0FBSyxTQUFTLENBQUMsU0FBUyxFQUFFO29CQUN4QyxTQUFTLENBQUMsU0FBUyxHQUFHLFlBQVksQ0FBQztvQkFFbkMsK0RBQStEO29CQUMvRCxrRUFBa0U7b0JBQ2xFLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQztpQkFDbEM7YUFDRjtRQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVEOzs7T0FHRztJQUNILE9BQU87UUFDTCxJQUFJLENBQUMsSUFBSSxDQUFDLDBCQUEwQixFQUFFO1lBQ3BDLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO1NBQ2xDO1FBRUQsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDO0lBQzFCLENBQUM7SUFFRDs7O09BR0c7SUFDSCxVQUFVOztRQUNSLE1BQUEsSUFBSSxDQUFDLDBCQUEwQiwwQ0FBRSxXQUFXLEVBQUUsQ0FBQztRQUMvQyxJQUFJLENBQUMsMEJBQTBCLEdBQUcsSUFBSSxDQUFDO0lBQ3pDLENBQUM7Q0FDRjtBQUVEOzs7Ozs7Ozs7Ozs7R0FZRztBQUNILE1BQU0sT0FBTyxrQkFBc0IsU0FBUSxtQkFBb0M7Q0FBRyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge19pc051bWJlclZhbHVlfSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xuaW1wb3J0IHtEYXRhU291cmNlfSBmcm9tICdAYW5ndWxhci9jZGsvdGFibGUnO1xuaW1wb3J0IHtNYXRQYWdpbmF0b3J9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL3BhZ2luYXRvcic7XG5pbXBvcnQge01hdFNvcnQsIFNvcnR9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL3NvcnQnO1xuaW1wb3J0IHtcbiAgQmVoYXZpb3JTdWJqZWN0LFxuICBjb21iaW5lTGF0ZXN0LFxuICBtZXJnZSxcbiAgT2JzZXJ2YWJsZSxcbiAgb2YgYXMgb2JzZXJ2YWJsZU9mLFxuICBTdWJqZWN0LFxuICBTdWJzY3JpcHRpb24sXG59IGZyb20gJ3J4anMnO1xuaW1wb3J0IHttYXB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuLyoqXG4gKiBDb3JyZXNwb25kcyB0byBgTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVJgLiBNb3ZlZCBvdXQgaW50byBhIHZhcmlhYmxlIGhlcmUgZHVlIHRvXG4gKiBmbGFreSBicm93c2VyIHN1cHBvcnQgYW5kIHRoZSB2YWx1ZSBub3QgYmVpbmcgZGVmaW5lZCBpbiBDbG9zdXJlJ3MgdHlwaW5ncy5cbiAqL1xuY29uc3QgTUFYX1NBRkVfSU5URUdFUiA9IDkwMDcxOTkyNTQ3NDA5OTE7XG5cbi8qKlxuICogSW50ZXJmYWNlIHRoYXQgbWF0Y2hlcyB0aGUgcmVxdWlyZWQgQVBJIHBhcnRzIGZvciB0aGUgTWF0UGFnaW5hdG9yJ3MgUGFnZUV2ZW50LlxuICogRGVjb3VwbGVkIHNvIHRoYXQgdXNlcnMgY2FuIGRlcGVuZCBvbiBlaXRoZXIgdGhlIGxlZ2FjeSBvciBNREMtYmFzZWQgcGFnaW5hdG9yLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIE1hdFRhYmxlRGF0YVNvdXJjZVBhZ2VFdmVudCB7XG4gIHBhZ2VJbmRleDogbnVtYmVyO1xuICBwYWdlU2l6ZTogbnVtYmVyO1xuICBsZW5ndGg6IG51bWJlcjtcbn1cblxuLyoqXG4gKiBJbnRlcmZhY2UgdGhhdCBtYXRjaGVzIHRoZSByZXF1aXJlZCBBUEkgcGFydHMgb2YgdGhlIE1hdFBhZ2luYXRvci5cbiAqIERlY291cGxlZCBzbyB0aGF0IHVzZXJzIGNhbiBkZXBlbmQgb24gZWl0aGVyIHRoZSBsZWdhY3kgb3IgTURDLWJhc2VkIHBhZ2luYXRvci5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBNYXRUYWJsZURhdGFTb3VyY2VQYWdpbmF0b3Ige1xuICBwYWdlOiBTdWJqZWN0PE1hdFRhYmxlRGF0YVNvdXJjZVBhZ2VFdmVudD47XG4gIHBhZ2VJbmRleDogbnVtYmVyO1xuICBpbml0aWFsaXplZDogT2JzZXJ2YWJsZTx2b2lkPjtcbiAgcGFnZVNpemU6IG51bWJlcjtcbiAgbGVuZ3RoOiBudW1iZXI7XG59XG5cbi8qKiBTaGFyZWQgYmFzZSBjbGFzcyB3aXRoIE1EQy1iYXNlZCBpbXBsZW1lbnRhdGlvbi4gKi9cbmV4cG9ydCBjbGFzcyBfTWF0VGFibGVEYXRhU291cmNlPFQsXG4gICAgUCBleHRlbmRzIE1hdFRhYmxlRGF0YVNvdXJjZVBhZ2luYXRvciA9IE1hdFRhYmxlRGF0YVNvdXJjZVBhZ2luYXRvcj5cbiAgICBleHRlbmRzIERhdGFTb3VyY2U8VD4ge1xuICAvKiogU3RyZWFtIHRoYXQgZW1pdHMgd2hlbiBhIG5ldyBkYXRhIGFycmF5IGlzIHNldCBvbiB0aGUgZGF0YSBzb3VyY2UuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX2RhdGE6IEJlaGF2aW9yU3ViamVjdDxUW10+O1xuXG4gIC8qKiBTdHJlYW0gZW1pdHRpbmcgcmVuZGVyIGRhdGEgdG8gdGhlIHRhYmxlIChkZXBlbmRzIG9uIG9yZGVyZWQgZGF0YSBjaGFuZ2VzKS4gKi9cbiAgcHJpdmF0ZSByZWFkb25seSBfcmVuZGVyRGF0YSA9IG5ldyBCZWhhdmlvclN1YmplY3Q8VFtdPihbXSk7XG5cbiAgLyoqIFN0cmVhbSB0aGF0IGVtaXRzIHdoZW4gYSBuZXcgZmlsdGVyIHN0cmluZyBpcyBzZXQgb24gdGhlIGRhdGEgc291cmNlLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9maWx0ZXIgPSBuZXcgQmVoYXZpb3JTdWJqZWN0PHN0cmluZz4oJycpO1xuXG4gIC8qKiBVc2VkIHRvIHJlYWN0IHRvIGludGVybmFsIGNoYW5nZXMgb2YgdGhlIHBhZ2luYXRvciB0aGF0IGFyZSBtYWRlIGJ5IHRoZSBkYXRhIHNvdXJjZSBpdHNlbGYuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX2ludGVybmFsUGFnZUNoYW5nZXMgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIC8qKlxuICAgKiBTdWJzY3JpcHRpb24gdG8gdGhlIGNoYW5nZXMgdGhhdCBzaG91bGQgdHJpZ2dlciBhbiB1cGRhdGUgdG8gdGhlIHRhYmxlJ3MgcmVuZGVyZWQgcm93cywgc3VjaFxuICAgKiBhcyBmaWx0ZXJpbmcsIHNvcnRpbmcsIHBhZ2luYXRpb24sIG9yIGJhc2UgZGF0YSBjaGFuZ2VzLlxuICAgKi9cbiAgX3JlbmRlckNoYW5nZXNTdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbnxudWxsID0gbnVsbDtcblxuICAvKipcbiAgICogVGhlIGZpbHRlcmVkIHNldCBvZiBkYXRhIHRoYXQgaGFzIGJlZW4gbWF0Y2hlZCBieSB0aGUgZmlsdGVyIHN0cmluZywgb3IgYWxsIHRoZSBkYXRhIGlmIHRoZXJlXG4gICAqIGlzIG5vIGZpbHRlci4gVXNlZnVsIGZvciBrbm93aW5nIHRoZSBzZXQgb2YgZGF0YSB0aGUgdGFibGUgcmVwcmVzZW50cy5cbiAgICogRm9yIGV4YW1wbGUsIGEgJ3NlbGVjdEFsbCgpJyBmdW5jdGlvbiB3b3VsZCBsaWtlbHkgd2FudCB0byBzZWxlY3QgdGhlIHNldCBvZiBmaWx0ZXJlZCBkYXRhXG4gICAqIHNob3duIHRvIHRoZSB1c2VyIHJhdGhlciB0aGFuIGFsbCB0aGUgZGF0YS5cbiAgICovXG4gIGZpbHRlcmVkRGF0YTogVFtdO1xuXG4gIC8qKiBBcnJheSBvZiBkYXRhIHRoYXQgc2hvdWxkIGJlIHJlbmRlcmVkIGJ5IHRoZSB0YWJsZSwgd2hlcmUgZWFjaCBvYmplY3QgcmVwcmVzZW50cyBvbmUgcm93LiAqL1xuICBnZXQgZGF0YSgpIHsgcmV0dXJuIHRoaXMuX2RhdGEudmFsdWU7IH1cbiAgc2V0IGRhdGEoZGF0YTogVFtdKSB7XG4gICAgdGhpcy5fZGF0YS5uZXh0KGRhdGEpO1xuICAgIC8vIE5vcm1hbGx5IHRoZSBgZmlsdGVyZWREYXRhYCBpcyB1cGRhdGVkIGJ5IHRoZSByZS1yZW5kZXJcbiAgICAvLyBzdWJzY3JpcHRpb24sIGJ1dCB0aGF0IHdvbid0IGhhcHBlbiBpZiBpdCdzIGluYWN0aXZlLlxuICAgIGlmICghdGhpcy5fcmVuZGVyQ2hhbmdlc1N1YnNjcmlwdGlvbikge1xuICAgICAgdGhpcy5fZmlsdGVyRGF0YShkYXRhKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRmlsdGVyIHRlcm0gdGhhdCBzaG91bGQgYmUgdXNlZCB0byBmaWx0ZXIgb3V0IG9iamVjdHMgZnJvbSB0aGUgZGF0YSBhcnJheS4gVG8gb3ZlcnJpZGUgaG93XG4gICAqIGRhdGEgb2JqZWN0cyBtYXRjaCB0byB0aGlzIGZpbHRlciBzdHJpbmcsIHByb3ZpZGUgYSBjdXN0b20gZnVuY3Rpb24gZm9yIGZpbHRlclByZWRpY2F0ZS5cbiAgICovXG4gIGdldCBmaWx0ZXIoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMuX2ZpbHRlci52YWx1ZTsgfVxuICBzZXQgZmlsdGVyKGZpbHRlcjogc3RyaW5nKSB7XG4gICAgdGhpcy5fZmlsdGVyLm5leHQoZmlsdGVyKTtcbiAgICAvLyBOb3JtYWxseSB0aGUgYGZpbHRlcmVkRGF0YWAgaXMgdXBkYXRlZCBieSB0aGUgcmUtcmVuZGVyXG4gICAgLy8gc3Vic2NyaXB0aW9uLCBidXQgdGhhdCB3b24ndCBoYXBwZW4gaWYgaXQncyBpbmFjdGl2ZS5cbiAgICBpZiAoIXRoaXMuX3JlbmRlckNoYW5nZXNTdWJzY3JpcHRpb24pIHtcbiAgICAgIHRoaXMuX2ZpbHRlckRhdGEodGhpcy5kYXRhKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSW5zdGFuY2Ugb2YgdGhlIE1hdFNvcnQgZGlyZWN0aXZlIHVzZWQgYnkgdGhlIHRhYmxlIHRvIGNvbnRyb2wgaXRzIHNvcnRpbmcuIFNvcnQgY2hhbmdlc1xuICAgKiBlbWl0dGVkIGJ5IHRoZSBNYXRTb3J0IHdpbGwgdHJpZ2dlciBhbiB1cGRhdGUgdG8gdGhlIHRhYmxlJ3MgcmVuZGVyZWQgZGF0YS5cbiAgICovXG4gIGdldCBzb3J0KCk6IE1hdFNvcnQgfCBudWxsIHsgcmV0dXJuIHRoaXMuX3NvcnQ7IH1cbiAgc2V0IHNvcnQoc29ydDogTWF0U29ydHxudWxsKSB7XG4gICAgdGhpcy5fc29ydCA9IHNvcnQ7XG4gICAgdGhpcy5fdXBkYXRlQ2hhbmdlU3Vic2NyaXB0aW9uKCk7XG4gIH1cbiAgcHJpdmF0ZSBfc29ydDogTWF0U29ydHxudWxsO1xuXG4gIC8qKlxuICAgKiBJbnN0YW5jZSBvZiB0aGUgTWF0UGFnaW5hdG9yIGNvbXBvbmVudCB1c2VkIGJ5IHRoZSB0YWJsZSB0byBjb250cm9sIHdoYXQgcGFnZSBvZiB0aGUgZGF0YSBpc1xuICAgKiBkaXNwbGF5ZWQuIFBhZ2UgY2hhbmdlcyBlbWl0dGVkIGJ5IHRoZSBNYXRQYWdpbmF0b3Igd2lsbCB0cmlnZ2VyIGFuIHVwZGF0ZSB0byB0aGVcbiAgICogdGFibGUncyByZW5kZXJlZCBkYXRhLlxuICAgKlxuICAgKiBOb3RlIHRoYXQgdGhlIGRhdGEgc291cmNlIHVzZXMgdGhlIHBhZ2luYXRvcidzIHByb3BlcnRpZXMgdG8gY2FsY3VsYXRlIHdoaWNoIHBhZ2Ugb2YgZGF0YVxuICAgKiBzaG91bGQgYmUgZGlzcGxheWVkLiBJZiB0aGUgcGFnaW5hdG9yIHJlY2VpdmVzIGl0cyBwcm9wZXJ0aWVzIGFzIHRlbXBsYXRlIGlucHV0cyxcbiAgICogZS5nLiBgW3BhZ2VMZW5ndGhdPTEwMGAgb3IgYFtwYWdlSW5kZXhdPTFgLCB0aGVuIGJlIHN1cmUgdGhhdCB0aGUgcGFnaW5hdG9yJ3MgdmlldyBoYXMgYmVlblxuICAgKiBpbml0aWFsaXplZCBiZWZvcmUgYXNzaWduaW5nIGl0IHRvIHRoaXMgZGF0YSBzb3VyY2UuXG4gICAqL1xuICBnZXQgcGFnaW5hdG9yKCk6IFAgfCBudWxsIHsgcmV0dXJuIHRoaXMuX3BhZ2luYXRvcjsgfVxuICBzZXQgcGFnaW5hdG9yKHBhZ2luYXRvcjogUCB8IG51bGwpIHtcbiAgICB0aGlzLl9wYWdpbmF0b3IgPSBwYWdpbmF0b3I7XG4gICAgdGhpcy5fdXBkYXRlQ2hhbmdlU3Vic2NyaXB0aW9uKCk7XG4gIH1cbiAgcHJpdmF0ZSBfcGFnaW5hdG9yOiBQIHwgbnVsbDtcblxuICAvKipcbiAgICogRGF0YSBhY2Nlc3NvciBmdW5jdGlvbiB0aGF0IGlzIHVzZWQgZm9yIGFjY2Vzc2luZyBkYXRhIHByb3BlcnRpZXMgZm9yIHNvcnRpbmcgdGhyb3VnaFxuICAgKiB0aGUgZGVmYXVsdCBzb3J0RGF0YSBmdW5jdGlvbi5cbiAgICogVGhpcyBkZWZhdWx0IGZ1bmN0aW9uIGFzc3VtZXMgdGhhdCB0aGUgc29ydCBoZWFkZXIgSURzICh3aGljaCBkZWZhdWx0cyB0byB0aGUgY29sdW1uIG5hbWUpXG4gICAqIG1hdGNoZXMgdGhlIGRhdGEncyBwcm9wZXJ0aWVzIChlLmcuIGNvbHVtbiBYeXogcmVwcmVzZW50cyBkYXRhWydYeXonXSkuXG4gICAqIE1heSBiZSBzZXQgdG8gYSBjdXN0b20gZnVuY3Rpb24gZm9yIGRpZmZlcmVudCBiZWhhdmlvci5cbiAgICogQHBhcmFtIGRhdGEgRGF0YSBvYmplY3QgdGhhdCBpcyBiZWluZyBhY2Nlc3NlZC5cbiAgICogQHBhcmFtIHNvcnRIZWFkZXJJZCBUaGUgbmFtZSBvZiB0aGUgY29sdW1uIHRoYXQgcmVwcmVzZW50cyB0aGUgZGF0YS5cbiAgICovXG4gIHNvcnRpbmdEYXRhQWNjZXNzb3I6ICgoZGF0YTogVCwgc29ydEhlYWRlcklkOiBzdHJpbmcpID0+IHN0cmluZ3xudW1iZXIpID1cbiAgICAgIChkYXRhOiBULCBzb3J0SGVhZGVySWQ6IHN0cmluZyk6IHN0cmluZ3xudW1iZXIgPT4ge1xuICAgIGNvbnN0IHZhbHVlID0gKGRhdGEgYXMge1trZXk6IHN0cmluZ106IGFueX0pW3NvcnRIZWFkZXJJZF07XG5cbiAgICBpZiAoX2lzTnVtYmVyVmFsdWUodmFsdWUpKSB7XG4gICAgICBjb25zdCBudW1iZXJWYWx1ZSA9IE51bWJlcih2YWx1ZSk7XG5cbiAgICAgIC8vIE51bWJlcnMgYmV5b25kIGBNQVhfU0FGRV9JTlRFR0VSYCBjYW4ndCBiZSBjb21wYXJlZCByZWxpYWJseSBzbyB3ZVxuICAgICAgLy8gbGVhdmUgdGhlbSBhcyBzdHJpbmdzLiBGb3IgbW9yZSBpbmZvOiBodHRwczovL2dvby5nbC95NXZiU2dcbiAgICAgIHJldHVybiBudW1iZXJWYWx1ZSA8IE1BWF9TQUZFX0lOVEVHRVIgPyBudW1iZXJWYWx1ZSA6IHZhbHVlO1xuICAgIH1cblxuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIGEgc29ydGVkIGNvcHkgb2YgdGhlIGRhdGEgYXJyYXkgYmFzZWQgb24gdGhlIHN0YXRlIG9mIHRoZSBNYXRTb3J0LiBDYWxsZWRcbiAgICogYWZ0ZXIgY2hhbmdlcyBhcmUgbWFkZSB0byB0aGUgZmlsdGVyZWQgZGF0YSBvciB3aGVuIHNvcnQgY2hhbmdlcyBhcmUgZW1pdHRlZCBmcm9tIE1hdFNvcnQuXG4gICAqIEJ5IGRlZmF1bHQsIHRoZSBmdW5jdGlvbiByZXRyaWV2ZXMgdGhlIGFjdGl2ZSBzb3J0IGFuZCBpdHMgZGlyZWN0aW9uIGFuZCBjb21wYXJlcyBkYXRhXG4gICAqIGJ5IHJldHJpZXZpbmcgZGF0YSB1c2luZyB0aGUgc29ydGluZ0RhdGFBY2Nlc3Nvci4gTWF5IGJlIG92ZXJyaWRkZW4gZm9yIGEgY3VzdG9tIGltcGxlbWVudGF0aW9uXG4gICAqIG9mIGRhdGEgb3JkZXJpbmcuXG4gICAqIEBwYXJhbSBkYXRhIFRoZSBhcnJheSBvZiBkYXRhIHRoYXQgc2hvdWxkIGJlIHNvcnRlZC5cbiAgICogQHBhcmFtIHNvcnQgVGhlIGNvbm5lY3RlZCBNYXRTb3J0IHRoYXQgaG9sZHMgdGhlIGN1cnJlbnQgc29ydCBzdGF0ZS5cbiAgICovXG4gIHNvcnREYXRhOiAoKGRhdGE6IFRbXSwgc29ydDogTWF0U29ydCkgPT4gVFtdKSA9IChkYXRhOiBUW10sIHNvcnQ6IE1hdFNvcnQpOiBUW10gPT4ge1xuICAgIGNvbnN0IGFjdGl2ZSA9IHNvcnQuYWN0aXZlO1xuICAgIGNvbnN0IGRpcmVjdGlvbiA9IHNvcnQuZGlyZWN0aW9uO1xuICAgIGlmICghYWN0aXZlIHx8IGRpcmVjdGlvbiA9PSAnJykgeyByZXR1cm4gZGF0YTsgfVxuXG4gICAgcmV0dXJuIGRhdGEuc29ydCgoYSwgYikgPT4ge1xuICAgICAgbGV0IHZhbHVlQSA9IHRoaXMuc29ydGluZ0RhdGFBY2Nlc3NvcihhLCBhY3RpdmUpO1xuICAgICAgbGV0IHZhbHVlQiA9IHRoaXMuc29ydGluZ0RhdGFBY2Nlc3NvcihiLCBhY3RpdmUpO1xuXG4gICAgICAvLyBJZiB0aGVyZSBhcmUgZGF0YSBpbiB0aGUgY29sdW1uIHRoYXQgY2FuIGJlIGNvbnZlcnRlZCB0byBhIG51bWJlcixcbiAgICAgIC8vIGl0IG11c3QgYmUgZW5zdXJlZCB0aGF0IHRoZSByZXN0IG9mIHRoZSBkYXRhXG4gICAgICAvLyBpcyBvZiB0aGUgc2FtZSB0eXBlIHNvIGFzIG5vdCB0byBvcmRlciBpbmNvcnJlY3RseS5cbiAgICAgIGNvbnN0IHZhbHVlQVR5cGUgPSB0eXBlb2YgdmFsdWVBO1xuICAgICAgY29uc3QgdmFsdWVCVHlwZSA9IHR5cGVvZiB2YWx1ZUI7XG5cbiAgICAgIGlmICh2YWx1ZUFUeXBlICE9PSB2YWx1ZUJUeXBlKSB7XG4gICAgICAgIGlmICh2YWx1ZUFUeXBlID09PSAnbnVtYmVyJykgeyB2YWx1ZUEgKz0gJyc7IH1cbiAgICAgICAgaWYgKHZhbHVlQlR5cGUgPT09ICdudW1iZXInKSB7IHZhbHVlQiArPSAnJzsgfVxuICAgICAgfVxuXG4gICAgICAvLyBJZiBib3RoIHZhbHVlQSBhbmQgdmFsdWVCIGV4aXN0ICh0cnV0aHkpLCB0aGVuIGNvbXBhcmUgdGhlIHR3by4gT3RoZXJ3aXNlLCBjaGVjayBpZlxuICAgICAgLy8gb25lIHZhbHVlIGV4aXN0cyB3aGlsZSB0aGUgb3RoZXIgZG9lc24ndC4gSW4gdGhpcyBjYXNlLCBleGlzdGluZyB2YWx1ZSBzaG91bGQgY29tZSBsYXN0LlxuICAgICAgLy8gVGhpcyBhdm9pZHMgaW5jb25zaXN0ZW50IHJlc3VsdHMgd2hlbiBjb21wYXJpbmcgdmFsdWVzIHRvIHVuZGVmaW5lZC9udWxsLlxuICAgICAgLy8gSWYgbmVpdGhlciB2YWx1ZSBleGlzdHMsIHJldHVybiAwIChlcXVhbCkuXG4gICAgICBsZXQgY29tcGFyYXRvclJlc3VsdCA9IDA7XG4gICAgICBpZiAodmFsdWVBICE9IG51bGwgJiYgdmFsdWVCICE9IG51bGwpIHtcbiAgICAgICAgLy8gQ2hlY2sgaWYgb25lIHZhbHVlIGlzIGdyZWF0ZXIgdGhhbiB0aGUgb3RoZXI7IGlmIGVxdWFsLCBjb21wYXJhdG9yUmVzdWx0IHNob3VsZCByZW1haW4gMC5cbiAgICAgICAgaWYgKHZhbHVlQSA+IHZhbHVlQikge1xuICAgICAgICAgIGNvbXBhcmF0b3JSZXN1bHQgPSAxO1xuICAgICAgICB9IGVsc2UgaWYgKHZhbHVlQSA8IHZhbHVlQikge1xuICAgICAgICAgIGNvbXBhcmF0b3JSZXN1bHQgPSAtMTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICh2YWx1ZUEgIT0gbnVsbCkge1xuICAgICAgICBjb21wYXJhdG9yUmVzdWx0ID0gMTtcbiAgICAgIH0gZWxzZSBpZiAodmFsdWVCICE9IG51bGwpIHtcbiAgICAgICAgY29tcGFyYXRvclJlc3VsdCA9IC0xO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gY29tcGFyYXRvclJlc3VsdCAqIChkaXJlY3Rpb24gPT0gJ2FzYycgPyAxIDogLTEpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiBhIGRhdGEgb2JqZWN0IG1hdGNoZXMgdGhlIGRhdGEgc291cmNlJ3MgZmlsdGVyIHN0cmluZy4gQnkgZGVmYXVsdCwgZWFjaCBkYXRhIG9iamVjdFxuICAgKiBpcyBjb252ZXJ0ZWQgdG8gYSBzdHJpbmcgb2YgaXRzIHByb3BlcnRpZXMgYW5kIHJldHVybnMgdHJ1ZSBpZiB0aGUgZmlsdGVyIGhhc1xuICAgKiBhdCBsZWFzdCBvbmUgb2NjdXJyZW5jZSBpbiB0aGF0IHN0cmluZy4gQnkgZGVmYXVsdCwgdGhlIGZpbHRlciBzdHJpbmcgaGFzIGl0cyB3aGl0ZXNwYWNlXG4gICAqIHRyaW1tZWQgYW5kIHRoZSBtYXRjaCBpcyBjYXNlLWluc2Vuc2l0aXZlLiBNYXkgYmUgb3ZlcnJpZGRlbiBmb3IgYSBjdXN0b20gaW1wbGVtZW50YXRpb24gb2ZcbiAgICogZmlsdGVyIG1hdGNoaW5nLlxuICAgKiBAcGFyYW0gZGF0YSBEYXRhIG9iamVjdCB1c2VkIHRvIGNoZWNrIGFnYWluc3QgdGhlIGZpbHRlci5cbiAgICogQHBhcmFtIGZpbHRlciBGaWx0ZXIgc3RyaW5nIHRoYXQgaGFzIGJlZW4gc2V0IG9uIHRoZSBkYXRhIHNvdXJjZS5cbiAgICogQHJldHVybnMgV2hldGhlciB0aGUgZmlsdGVyIG1hdGNoZXMgYWdhaW5zdCB0aGUgZGF0YVxuICAgKi9cbiAgZmlsdGVyUHJlZGljYXRlOiAoKGRhdGE6IFQsIGZpbHRlcjogc3RyaW5nKSA9PiBib29sZWFuKSA9IChkYXRhOiBULCBmaWx0ZXI6IHN0cmluZyk6IGJvb2xlYW4gPT4ge1xuICAgIC8vIFRyYW5zZm9ybSB0aGUgZGF0YSBpbnRvIGEgbG93ZXJjYXNlIHN0cmluZyBvZiBhbGwgcHJvcGVydHkgdmFsdWVzLlxuICAgIGNvbnN0IGRhdGFTdHIgPSBPYmplY3Qua2V5cyhkYXRhKS5yZWR1Y2UoKGN1cnJlbnRUZXJtOiBzdHJpbmcsIGtleTogc3RyaW5nKSA9PiB7XG4gICAgICAvLyBVc2UgYW4gb2JzY3VyZSBVbmljb2RlIGNoYXJhY3RlciB0byBkZWxpbWl0IHRoZSB3b3JkcyBpbiB0aGUgY29uY2F0ZW5hdGVkIHN0cmluZy5cbiAgICAgIC8vIFRoaXMgYXZvaWRzIG1hdGNoZXMgd2hlcmUgdGhlIHZhbHVlcyBvZiB0d28gY29sdW1ucyBjb21iaW5lZCB3aWxsIG1hdGNoIHRoZSB1c2VyJ3MgcXVlcnlcbiAgICAgIC8vIChlLmcuIGBGbHV0ZWAgYW5kIGBTdG9wYCB3aWxsIG1hdGNoIGBUZXN0YCkuIFRoZSBjaGFyYWN0ZXIgaXMgaW50ZW5kZWQgdG8gYmUgc29tZXRoaW5nXG4gICAgICAvLyB0aGF0IGhhcyBhIHZlcnkgbG93IGNoYW5jZSBvZiBiZWluZyB0eXBlZCBpbiBieSBzb21lYm9keSBpbiBhIHRleHQgZmllbGQuIFRoaXMgb25lIGluXG4gICAgICAvLyBwYXJ0aWN1bGFyIGlzIFwiV2hpdGUgdXAtcG9pbnRpbmcgdHJpYW5nbGUgd2l0aCBkb3RcIiBmcm9tXG4gICAgICAvLyBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9MaXN0X29mX1VuaWNvZGVfY2hhcmFjdGVyc1xuICAgICAgcmV0dXJuIGN1cnJlbnRUZXJtICsgKGRhdGEgYXMge1trZXk6IHN0cmluZ106IGFueX0pW2tleV0gKyAn4pesJztcbiAgICB9LCAnJykudG9Mb3dlckNhc2UoKTtcblxuICAgIC8vIFRyYW5zZm9ybSB0aGUgZmlsdGVyIGJ5IGNvbnZlcnRpbmcgaXQgdG8gbG93ZXJjYXNlIGFuZCByZW1vdmluZyB3aGl0ZXNwYWNlLlxuICAgIGNvbnN0IHRyYW5zZm9ybWVkRmlsdGVyID0gZmlsdGVyLnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xuXG4gICAgcmV0dXJuIGRhdGFTdHIuaW5kZXhPZih0cmFuc2Zvcm1lZEZpbHRlcikgIT0gLTE7XG4gIH1cblxuICBjb25zdHJ1Y3Rvcihpbml0aWFsRGF0YTogVFtdID0gW10pIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuX2RhdGEgPSBuZXcgQmVoYXZpb3JTdWJqZWN0PFRbXT4oaW5pdGlhbERhdGEpO1xuICAgIHRoaXMuX3VwZGF0ZUNoYW5nZVN1YnNjcmlwdGlvbigpO1xuICB9XG5cbiAgLyoqXG4gICAqIFN1YnNjcmliZSB0byBjaGFuZ2VzIHRoYXQgc2hvdWxkIHRyaWdnZXIgYW4gdXBkYXRlIHRvIHRoZSB0YWJsZSdzIHJlbmRlcmVkIHJvd3MuIFdoZW4gdGhlXG4gICAqIGNoYW5nZXMgb2NjdXIsIHByb2Nlc3MgdGhlIGN1cnJlbnQgc3RhdGUgb2YgdGhlIGZpbHRlciwgc29ydCwgYW5kIHBhZ2luYXRpb24gYWxvbmcgd2l0aFxuICAgKiB0aGUgcHJvdmlkZWQgYmFzZSBkYXRhIGFuZCBzZW5kIGl0IHRvIHRoZSB0YWJsZSBmb3IgcmVuZGVyaW5nLlxuICAgKi9cbiAgX3VwZGF0ZUNoYW5nZVN1YnNjcmlwdGlvbigpIHtcbiAgICAvLyBTb3J0aW5nIGFuZC9vciBwYWdpbmF0aW9uIHNob3VsZCBiZSB3YXRjaGVkIGlmIE1hdFNvcnQgYW5kL29yIE1hdFBhZ2luYXRvciBhcmUgcHJvdmlkZWQuXG4gICAgLy8gVGhlIGV2ZW50cyBzaG91bGQgZW1pdCB3aGVuZXZlciB0aGUgY29tcG9uZW50IGVtaXRzIGEgY2hhbmdlIG9yIGluaXRpYWxpemVzLCBvciBpZiBub1xuICAgIC8vIGNvbXBvbmVudCBpcyBwcm92aWRlZCwgYSBzdHJlYW0gd2l0aCBqdXN0IGEgbnVsbCBldmVudCBzaG91bGQgYmUgcHJvdmlkZWQuXG4gICAgLy8gVGhlIGBzb3J0Q2hhbmdlYCBhbmQgYHBhZ2VDaGFuZ2VgIGFjdHMgYXMgYSBzaWduYWwgdG8gdGhlIGNvbWJpbmVMYXRlc3RzIGJlbG93IHNvIHRoYXQgdGhlXG4gICAgLy8gcGlwZWxpbmUgY2FuIHByb2dyZXNzIHRvIHRoZSBuZXh0IHN0ZXAuIE5vdGUgdGhhdCB0aGUgdmFsdWUgZnJvbSB0aGVzZSBzdHJlYW1zIGFyZSBub3QgdXNlZCxcbiAgICAvLyB0aGV5IHB1cmVseSBhY3QgYXMgYSBzaWduYWwgdG8gcHJvZ3Jlc3MgaW4gdGhlIHBpcGVsaW5lLlxuICAgIGNvbnN0IHNvcnRDaGFuZ2U6IE9ic2VydmFibGU8U29ydHxudWxsfHZvaWQ+ID0gdGhpcy5fc29ydCA/XG4gICAgICAgIG1lcmdlKHRoaXMuX3NvcnQuc29ydENoYW5nZSwgdGhpcy5fc29ydC5pbml0aWFsaXplZCkgYXMgT2JzZXJ2YWJsZTxTb3J0fHZvaWQ+IDpcbiAgICAgICAgb2JzZXJ2YWJsZU9mKG51bGwpO1xuICAgIGNvbnN0IHBhZ2VDaGFuZ2U6IE9ic2VydmFibGU8TWF0VGFibGVEYXRhU291cmNlUGFnZUV2ZW50fG51bGx8dm9pZD4gPSB0aGlzLl9wYWdpbmF0b3IgP1xuICAgICAgICBtZXJnZShcbiAgICAgICAgICB0aGlzLl9wYWdpbmF0b3IucGFnZSxcbiAgICAgICAgICB0aGlzLl9pbnRlcm5hbFBhZ2VDaGFuZ2VzLFxuICAgICAgICAgIHRoaXMuX3BhZ2luYXRvci5pbml0aWFsaXplZFxuICAgICAgICApIGFzIE9ic2VydmFibGU8TWF0VGFibGVEYXRhU291cmNlUGFnZUV2ZW50fHZvaWQ+IDpcbiAgICAgICAgb2JzZXJ2YWJsZU9mKG51bGwpO1xuICAgIGNvbnN0IGRhdGFTdHJlYW0gPSB0aGlzLl9kYXRhO1xuICAgIC8vIFdhdGNoIGZvciBiYXNlIGRhdGEgb3IgZmlsdGVyIGNoYW5nZXMgdG8gcHJvdmlkZSBhIGZpbHRlcmVkIHNldCBvZiBkYXRhLlxuICAgIGNvbnN0IGZpbHRlcmVkRGF0YSA9IGNvbWJpbmVMYXRlc3QoW2RhdGFTdHJlYW0sIHRoaXMuX2ZpbHRlcl0pXG4gICAgICAucGlwZShtYXAoKFtkYXRhXSkgPT4gdGhpcy5fZmlsdGVyRGF0YShkYXRhKSkpO1xuICAgIC8vIFdhdGNoIGZvciBmaWx0ZXJlZCBkYXRhIG9yIHNvcnQgY2hhbmdlcyB0byBwcm92aWRlIGFuIG9yZGVyZWQgc2V0IG9mIGRhdGEuXG4gICAgY29uc3Qgb3JkZXJlZERhdGEgPSBjb21iaW5lTGF0ZXN0KFtmaWx0ZXJlZERhdGEsIHNvcnRDaGFuZ2VdKVxuICAgICAgLnBpcGUobWFwKChbZGF0YV0pID0+IHRoaXMuX29yZGVyRGF0YShkYXRhKSkpO1xuICAgIC8vIFdhdGNoIGZvciBvcmRlcmVkIGRhdGEgb3IgcGFnZSBjaGFuZ2VzIHRvIHByb3ZpZGUgYSBwYWdlZCBzZXQgb2YgZGF0YS5cbiAgICBjb25zdCBwYWdpbmF0ZWREYXRhID0gY29tYmluZUxhdGVzdChbb3JkZXJlZERhdGEsIHBhZ2VDaGFuZ2VdKVxuICAgICAgLnBpcGUobWFwKChbZGF0YV0pID0+IHRoaXMuX3BhZ2VEYXRhKGRhdGEpKSk7XG4gICAgLy8gV2F0Y2hlZCBmb3IgcGFnZWQgZGF0YSBjaGFuZ2VzIGFuZCBzZW5kIHRoZSByZXN1bHQgdG8gdGhlIHRhYmxlIHRvIHJlbmRlci5cbiAgICB0aGlzLl9yZW5kZXJDaGFuZ2VzU3Vic2NyaXB0aW9uPy51bnN1YnNjcmliZSgpO1xuICAgIHRoaXMuX3JlbmRlckNoYW5nZXNTdWJzY3JpcHRpb24gPSBwYWdpbmF0ZWREYXRhLnN1YnNjcmliZShkYXRhID0+IHRoaXMuX3JlbmRlckRhdGEubmV4dChkYXRhKSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIGZpbHRlcmVkIGRhdGEgYXJyYXkgd2hlcmUgZWFjaCBmaWx0ZXIgb2JqZWN0IGNvbnRhaW5zIHRoZSBmaWx0ZXIgc3RyaW5nIHdpdGhpblxuICAgKiB0aGUgcmVzdWx0IG9mIHRoZSBmaWx0ZXJUZXJtQWNjZXNzb3IgZnVuY3Rpb24uIElmIG5vIGZpbHRlciBpcyBzZXQsIHJldHVybnMgdGhlIGRhdGEgYXJyYXlcbiAgICogYXMgcHJvdmlkZWQuXG4gICAqL1xuICBfZmlsdGVyRGF0YShkYXRhOiBUW10pIHtcbiAgICAvLyBJZiB0aGVyZSBpcyBhIGZpbHRlciBzdHJpbmcsIGZpbHRlciBvdXQgZGF0YSB0aGF0IGRvZXMgbm90IGNvbnRhaW4gaXQuXG4gICAgLy8gRWFjaCBkYXRhIG9iamVjdCBpcyBjb252ZXJ0ZWQgdG8gYSBzdHJpbmcgdXNpbmcgdGhlIGZ1bmN0aW9uIGRlZmluZWQgYnkgZmlsdGVyVGVybUFjY2Vzc29yLlxuICAgIC8vIE1heSBiZSBvdmVycmlkZGVuIGZvciBjdXN0b21pemF0aW9uLlxuICAgIHRoaXMuZmlsdGVyZWREYXRhID0gKHRoaXMuZmlsdGVyID09IG51bGwgfHwgdGhpcy5maWx0ZXIgPT09ICcnKSA/IGRhdGEgOlxuICAgICAgICBkYXRhLmZpbHRlcihvYmogPT4gdGhpcy5maWx0ZXJQcmVkaWNhdGUob2JqLCB0aGlzLmZpbHRlcikpO1xuXG4gICAgaWYgKHRoaXMucGFnaW5hdG9yKSB7IHRoaXMuX3VwZGF0ZVBhZ2luYXRvcih0aGlzLmZpbHRlcmVkRGF0YS5sZW5ndGgpOyB9XG5cbiAgICByZXR1cm4gdGhpcy5maWx0ZXJlZERhdGE7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHNvcnRlZCBjb3B5IG9mIHRoZSBkYXRhIGlmIE1hdFNvcnQgaGFzIGEgc29ydCBhcHBsaWVkLCBvdGhlcndpc2UganVzdCByZXR1cm5zIHRoZVxuICAgKiBkYXRhIGFycmF5IGFzIHByb3ZpZGVkLiBVc2VzIHRoZSBkZWZhdWx0IGRhdGEgYWNjZXNzb3IgZm9yIGRhdGEgbG9va3VwLCB1bmxlc3MgYVxuICAgKiBzb3J0RGF0YUFjY2Vzc29yIGZ1bmN0aW9uIGlzIGRlZmluZWQuXG4gICAqL1xuICBfb3JkZXJEYXRhKGRhdGE6IFRbXSk6IFRbXSB7XG4gICAgLy8gSWYgdGhlcmUgaXMgbm8gYWN0aXZlIHNvcnQgb3IgZGlyZWN0aW9uLCByZXR1cm4gdGhlIGRhdGEgd2l0aG91dCB0cnlpbmcgdG8gc29ydC5cbiAgICBpZiAoIXRoaXMuc29ydCkgeyByZXR1cm4gZGF0YTsgfVxuXG4gICAgcmV0dXJuIHRoaXMuc29ydERhdGEoZGF0YS5zbGljZSgpLCB0aGlzLnNvcnQpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBwYWdlZCBzbGljZSBvZiB0aGUgcHJvdmlkZWQgZGF0YSBhcnJheSBhY2NvcmRpbmcgdG8gdGhlIHByb3ZpZGVkIE1hdFBhZ2luYXRvcidzIHBhZ2VcbiAgICogaW5kZXggYW5kIGxlbmd0aC4gSWYgdGhlcmUgaXMgbm8gcGFnaW5hdG9yIHByb3ZpZGVkLCByZXR1cm5zIHRoZSBkYXRhIGFycmF5IGFzIHByb3ZpZGVkLlxuICAgKi9cbiAgX3BhZ2VEYXRhKGRhdGE6IFRbXSk6IFRbXSB7XG4gICAgaWYgKCF0aGlzLnBhZ2luYXRvcikgeyByZXR1cm4gZGF0YTsgfVxuXG4gICAgY29uc3Qgc3RhcnRJbmRleCA9IHRoaXMucGFnaW5hdG9yLnBhZ2VJbmRleCAqIHRoaXMucGFnaW5hdG9yLnBhZ2VTaXplO1xuICAgIHJldHVybiBkYXRhLnNsaWNlKHN0YXJ0SW5kZXgsIHN0YXJ0SW5kZXggKyB0aGlzLnBhZ2luYXRvci5wYWdlU2l6ZSk7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyB0aGUgcGFnaW5hdG9yIHRvIHJlZmxlY3QgdGhlIGxlbmd0aCBvZiB0aGUgZmlsdGVyZWQgZGF0YSwgYW5kIG1ha2VzIHN1cmUgdGhhdCB0aGUgcGFnZVxuICAgKiBpbmRleCBkb2VzIG5vdCBleGNlZWQgdGhlIHBhZ2luYXRvcidzIGxhc3QgcGFnZS4gVmFsdWVzIGFyZSBjaGFuZ2VkIGluIGEgcmVzb2x2ZWQgcHJvbWlzZSB0b1xuICAgKiBndWFyZCBhZ2FpbnN0IG1ha2luZyBwcm9wZXJ0eSBjaGFuZ2VzIHdpdGhpbiBhIHJvdW5kIG9mIGNoYW5nZSBkZXRlY3Rpb24uXG4gICAqL1xuICBfdXBkYXRlUGFnaW5hdG9yKGZpbHRlcmVkRGF0YUxlbmd0aDogbnVtYmVyKSB7XG4gICAgUHJvbWlzZS5yZXNvbHZlKCkudGhlbigoKSA9PiB7XG4gICAgICBjb25zdCBwYWdpbmF0b3IgPSB0aGlzLnBhZ2luYXRvcjtcblxuICAgICAgaWYgKCFwYWdpbmF0b3IpIHsgcmV0dXJuOyB9XG5cbiAgICAgIHBhZ2luYXRvci5sZW5ndGggPSBmaWx0ZXJlZERhdGFMZW5ndGg7XG5cbiAgICAgIC8vIElmIHRoZSBwYWdlIGluZGV4IGlzIHNldCBiZXlvbmQgdGhlIHBhZ2UsIHJlZHVjZSBpdCB0byB0aGUgbGFzdCBwYWdlLlxuICAgICAgaWYgKHBhZ2luYXRvci5wYWdlSW5kZXggPiAwKSB7XG4gICAgICAgIGNvbnN0IGxhc3RQYWdlSW5kZXggPSBNYXRoLmNlaWwocGFnaW5hdG9yLmxlbmd0aCAvIHBhZ2luYXRvci5wYWdlU2l6ZSkgLSAxIHx8IDA7XG4gICAgICAgIGNvbnN0IG5ld1BhZ2VJbmRleCA9IE1hdGgubWluKHBhZ2luYXRvci5wYWdlSW5kZXgsIGxhc3RQYWdlSW5kZXgpO1xuXG4gICAgICAgIGlmIChuZXdQYWdlSW5kZXggIT09IHBhZ2luYXRvci5wYWdlSW5kZXgpIHtcbiAgICAgICAgICBwYWdpbmF0b3IucGFnZUluZGV4ID0gbmV3UGFnZUluZGV4O1xuXG4gICAgICAgICAgLy8gU2luY2UgdGhlIHBhZ2luYXRvciBvbmx5IGVtaXRzIGFmdGVyIHVzZXItZ2VuZXJhdGVkIGNoYW5nZXMsXG4gICAgICAgICAgLy8gd2UgbmVlZCBvdXIgb3duIHN0cmVhbSBzbyB3ZSBrbm93IHRvIHNob3VsZCByZS1yZW5kZXIgdGhlIGRhdGEuXG4gICAgICAgICAgdGhpcy5faW50ZXJuYWxQYWdlQ2hhbmdlcy5uZXh0KCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVc2VkIGJ5IHRoZSBNYXRUYWJsZS4gQ2FsbGVkIHdoZW4gaXQgY29ubmVjdHMgdG8gdGhlIGRhdGEgc291cmNlLlxuICAgKiBAZG9jcy1wcml2YXRlXG4gICAqL1xuICBjb25uZWN0KCkge1xuICAgIGlmICghdGhpcy5fcmVuZGVyQ2hhbmdlc1N1YnNjcmlwdGlvbikge1xuICAgICAgdGhpcy5fdXBkYXRlQ2hhbmdlU3Vic2NyaXB0aW9uKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX3JlbmRlckRhdGE7XG4gIH1cblxuICAvKipcbiAgICogVXNlZCBieSB0aGUgTWF0VGFibGUuIENhbGxlZCB3aGVuIGl0IGRpc2Nvbm5lY3RzIGZyb20gdGhlIGRhdGEgc291cmNlLlxuICAgKiBAZG9jcy1wcml2YXRlXG4gICAqL1xuICBkaXNjb25uZWN0KCkge1xuICAgIHRoaXMuX3JlbmRlckNoYW5nZXNTdWJzY3JpcHRpb24/LnVuc3Vic2NyaWJlKCk7XG4gICAgdGhpcy5fcmVuZGVyQ2hhbmdlc1N1YnNjcmlwdGlvbiA9IG51bGw7XG4gIH1cbn1cblxuLyoqXG4gKiBEYXRhIHNvdXJjZSB0aGF0IGFjY2VwdHMgYSBjbGllbnQtc2lkZSBkYXRhIGFycmF5IGFuZCBpbmNsdWRlcyBuYXRpdmUgc3VwcG9ydCBvZiBmaWx0ZXJpbmcsXG4gKiBzb3J0aW5nICh1c2luZyBNYXRTb3J0KSwgYW5kIHBhZ2luYXRpb24gKHVzaW5nIE1hdFBhZ2luYXRvcikuXG4gKlxuICogQWxsb3dzIGZvciBzb3J0IGN1c3RvbWl6YXRpb24gYnkgb3ZlcnJpZGluZyBzb3J0aW5nRGF0YUFjY2Vzc29yLCB3aGljaCBkZWZpbmVzIGhvdyBkYXRhXG4gKiBwcm9wZXJ0aWVzIGFyZSBhY2Nlc3NlZC4gQWxzbyBhbGxvd3MgZm9yIGZpbHRlciBjdXN0b21pemF0aW9uIGJ5IG92ZXJyaWRpbmcgZmlsdGVyVGVybUFjY2Vzc29yLFxuICogd2hpY2ggZGVmaW5lcyBob3cgcm93IGRhdGEgaXMgY29udmVydGVkIHRvIGEgc3RyaW5nIGZvciBmaWx0ZXIgbWF0Y2hpbmcuXG4gKlxuICogKipOb3RlOioqIFRoaXMgY2xhc3MgaXMgbWVhbnQgdG8gYmUgYSBzaW1wbGUgZGF0YSBzb3VyY2UgdG8gaGVscCB5b3UgZ2V0IHN0YXJ0ZWQuIEFzIHN1Y2hcbiAqIGl0IGlzbid0IGVxdWlwcGVkIHRvIGhhbmRsZSBzb21lIG1vcmUgYWR2YW5jZWQgY2FzZXMgbGlrZSByb2J1c3QgaTE4biBzdXBwb3J0IG9yIHNlcnZlci1zaWRlXG4gKiBpbnRlcmFjdGlvbnMuIElmIHlvdXIgYXBwIG5lZWRzIHRvIHN1cHBvcnQgbW9yZSBhZHZhbmNlZCB1c2UgY2FzZXMsIGNvbnNpZGVyIGltcGxlbWVudGluZyB5b3VyXG4gKiBvd24gYERhdGFTb3VyY2VgLlxuICovXG5leHBvcnQgY2xhc3MgTWF0VGFibGVEYXRhU291cmNlPFQ+IGV4dGVuZHMgX01hdFRhYmxlRGF0YVNvdXJjZTxULCBNYXRQYWdpbmF0b3I+IHt9XG4iXX0=