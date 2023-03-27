/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { BehaviorSubject, combineLatest, merge, of as observableOf, Subject, } from 'rxjs';
import { DataSource } from '@angular/cdk/collections';
import { _isNumberValue } from '@angular/cdk/coercion';
import { map } from 'rxjs/operators';
/**
 * Corresponds to `Number.MAX_SAFE_INTEGER`. Moved out into a variable here due to
 * flaky browser support and the value not being defined in Closure's typings.
 */
const MAX_SAFE_INTEGER = 9007199254740991;
/** Shared base class with MDC-based implementation. */
export class _MatTableDataSource extends DataSource {
    /** Array of data that should be rendered by the table, where each object represents one row. */
    get data() {
        return this._data.value;
    }
    set data(data) {
        data = Array.isArray(data) ? data : [];
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
    get filter() {
        return this._filter.value;
    }
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
    get sort() {
        return this._sort;
    }
    set sort(sort) {
        this._sort = sort;
        this._updateChangeSubscription();
    }
    /**
     * Instance of the paginator component used by the table to control what page of the data is
     * displayed. Page changes emitted by the paginator will trigger an update to the
     * table's rendered data.
     *
     * Note that the data source uses the paginator's properties to calculate which page of data
     * should be displayed. If the paginator receives its properties as template inputs,
     * e.g. `[pageLength]=100` or `[pageIndex]=1`, then be sure that the paginator's view has been
     * initialized before assigning it to this data source.
     */
    get paginator() {
        return this._paginator;
    }
    set paginator(paginator) {
        this._paginator = paginator;
        this._updateChangeSubscription();
    }
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
            const dataStr = Object.keys(data)
                .reduce((currentTerm, key) => {
                // Use an obscure Unicode character to delimit the words in the concatenated string.
                // This avoids matches where the values of two columns combined will match the user's query
                // (e.g. `Flute` and `Stop` will match `Test`). The character is intended to be something
                // that has a very low chance of being typed in by somebody in a text field. This one in
                // particular is "White up-pointing triangle with dot" from
                // https://en.wikipedia.org/wiki/List_of_Unicode_characters
                return currentTerm + data[key] + '◬';
            }, '')
                .toLowerCase();
            // Transform the filter by converting it to lowercase and removing whitespace.
            const transformedFilter = filter.trim().toLowerCase();
            return dataStr.indexOf(transformedFilter) != -1;
        };
        this._data = new BehaviorSubject(initialData);
        this._updateChangeSubscription();
    }
    /**
     * Subscribe to changes that should trigger an update to the table's rendered rows. When the
     * changes occur, process the current state of the filter, sort, and pagination along with
     * the provided base data and send it to the table for rendering.
     */
    _updateChangeSubscription() {
        // Sorting and/or pagination should be watched if sort and/or paginator are provided.
        // The events should emit whenever the component emits a change or initializes, or if no
        // component is provided, a stream with just a null event should be provided.
        // The `sortChange` and `pageChange` acts as a signal to the combineLatests below so that the
        // pipeline can progress to the next step. Note that the value from these streams are not used,
        // they purely act as a signal to progress in the pipeline.
        const sortChange = this._sort
            ? merge(this._sort.sortChange, this._sort.initialized)
            : observableOf(null);
        const pageChange = this._paginator
            ? merge(this._paginator.page, this._internalPageChanges, this._paginator.initialized)
            : observableOf(null);
        const dataStream = this._data;
        // Watch for base data or filter changes to provide a filtered set of data.
        const filteredData = combineLatest([dataStream, this._filter]).pipe(map(([data]) => this._filterData(data)));
        // Watch for filtered data or sort changes to provide an ordered set of data.
        const orderedData = combineLatest([filteredData, sortChange]).pipe(map(([data]) => this._orderData(data)));
        // Watch for ordered data or page changes to provide a paged set of data.
        const paginatedData = combineLatest([orderedData, pageChange]).pipe(map(([data]) => this._pageData(data)));
        // Watched for paged data changes and send the result to the table to render.
        this._renderChangesSubscription?.unsubscribe();
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
        this.filteredData =
            this.filter == null || this.filter === ''
                ? data
                : data.filter(obj => this.filterPredicate(obj, this.filter));
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
     * Returns a paged slice of the provided data array according to the provided paginator's page
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
        this._renderChangesSubscription?.unsubscribe();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUtZGF0YS1zb3VyY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvdGFibGUvdGFibGUtZGF0YS1zb3VyY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLGVBQWUsRUFDZixhQUFhLEVBQ2IsS0FBSyxFQUVMLEVBQUUsSUFBSSxZQUFZLEVBQ2xCLE9BQU8sR0FFUixNQUFNLE1BQU0sQ0FBQztBQUNkLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUVwRCxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDckQsT0FBTyxFQUFDLEdBQUcsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBMEJuQzs7O0dBR0c7QUFDSCxNQUFNLGdCQUFnQixHQUFHLGdCQUFnQixDQUFDO0FBRTFDLHVEQUF1RDtBQUN2RCxNQUFNLE9BQU8sbUJBR1gsU0FBUSxVQUFhO0lBMkJyQixnR0FBZ0c7SUFDaEcsSUFBSSxJQUFJO1FBQ04sT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQztJQUMxQixDQUFDO0lBRUQsSUFBSSxJQUFJLENBQUMsSUFBUztRQUNoQixJQUFJLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDdkMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdEIsMERBQTBEO1FBQzFELHdEQUF3RDtRQUN4RCxJQUFJLENBQUMsSUFBSSxDQUFDLDBCQUEwQixFQUFFO1lBQ3BDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDeEI7SUFDSCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsSUFBSSxNQUFNO1FBQ1IsT0FBTyxJQUFJLENBQUMsT0FB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QUFNLEdBQUcsa0JBQWtCLENBQUM7WUFFdEMsd0VBQXdFO1lBQ3hFLElBQUksU0FBUyxDQUFDLFNBQVMsR0FBRyxDQUFDLEVBQUU7Z0JBQzNCLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDaEYsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLGFBQWEsQ0FBQyxDQUFDO2dCQUVsRSxJQUFJLFlBQVksS0FBSyxTQUFTLENBQUMsU0FBUyxFQUFFO29CQUN4QyxTQUFTLENBQUMsU0FBUyxHQUFHLFlBQVksQ0FBQztvQkFFbkMsK0RBQStEO29CQUMvRCxrRUFBa0U7b0JBQ2xFLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQztpQkFDbEM7YUFDRjtRQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVEOzs7T0FHRztJQUNILE9BQU87UUFDTCxJQUFJLENBQUMsSUFBSSxDQUFDLDBCQUEwQixFQUFFO1lBQ3BDLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO1NBQ2xDO1FBRUQsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDO0lBQzFCLENBQUM7SUFFRDs7O09BR0c7SUFDSCxVQUFVO1FBQ1IsSUFBSSxDQUFDLDBCQUEwQixFQUFFLFdBQVcsRUFBRSxDQUFDO1FBQy9DLElBQUksQ0FBQywwQkFBMEIsR0FBRyxJQUFJLENBQUM7SUFDekMsQ0FBQztDQUNGO0FBRUQ7Ozs7Ozs7Ozs7OztHQVlHO0FBQ0gsTUFBTSxPQUFPLGtCQUdYLFNBQVEsbUJBQXlCO0NBQUciLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgQmVoYXZpb3JTdWJqZWN0LFxuICBjb21iaW5lTGF0ZXN0LFxuICBtZXJnZSxcbiAgT2JzZXJ2YWJsZSxcbiAgb2YgYXMgb2JzZXJ2YWJsZU9mLFxuICBTdWJqZWN0LFxuICBTdWJzY3JpcHRpb24sXG59IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtEYXRhU291cmNlfSBmcm9tICdAYW5ndWxhci9jZGsvY29sbGVjdGlvbnMnO1xuaW1wb3J0IHtNYXRTb3J0LCBTb3J0fSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9zb3J0JztcbmltcG9ydCB7X2lzTnVtYmVyVmFsdWV9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQge21hcH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG4vKipcbiAqIEludGVyZmFjZSB0aGF0IG1hdGNoZXMgdGhlIHJlcXVpcmVkIEFQSSBwYXJ0cyBmb3IgdGhlIE1hdFBhZ2luYXRvcidzIFBhZ2VFdmVudC5cbiAqIERlY291cGxlZCBzbyB0aGF0IHVzZXJzIGNhbiBkZXBlbmQgb24gZWl0aGVyIHRoZSBsZWdhY3kgb3IgTURDLWJhc2VkIHBhZ2luYXRvci5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBNYXRUYWJsZURhdGFTb3VyY2VQYWdlRXZlbnQge1xuICBwYWdlSW5kZXg6IG51bWJlcjtcbiAgcGFnZVNpemU6IG51bWJlcjtcbiAgbGVuZ3RoOiBudW1iZXI7XG59XG5cbi8qKlxuICogSW50ZXJmYWNlIHRoYXQgbWF0Y2hlcyB0aGUgcmVxdWlyZWQgQVBJIHBhcnRzIG9mIHRoZSBNYXRQYWdpbmF0b3IuXG4gKiBEZWNvdXBsZWQgc28gdGhhdCB1c2VycyBjYW4gZGVwZW5kIG9uIGVpdGhlciB0aGUgbGVnYWN5IG9yIE1EQy1iYXNlZCBwYWdpbmF0b3IuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTWF0VGFibGVEYXRhU291cmNlUGFnaW5hdG9yIHtcbiAgcGFnZTogU3ViamVjdDxNYXRUYWJsZURhdGFTb3VyY2VQYWdlRXZlbnQ+O1xuICBwYWdlSW5kZXg6IG51bWJlcjtcbiAgaW5pdGlhbGl6ZWQ6IE9ic2VydmFibGU8dm9pZD47XG4gIHBhZ2VTaXplOiBudW1iZXI7XG4gIGxlbmd0aDogbnVtYmVyO1xuICBmaXJzdFBhZ2U6ICgpID0+IHZvaWQ7XG4gIGxhc3RQYWdlOiAoKSA9PiB2b2lkO1xufVxuXG4vKipcbiAqIENvcnJlc3BvbmRzIHRvIGBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUmAuIE1vdmVkIG91dCBpbnRvIGEgdmFyaWFibGUgaGVyZSBkdWUgdG9cbiAqIGZsYWt5IGJyb3dzZXIgc3VwcG9ydCBhbmQgdGhlIHZhbHVlIG5vdCBiZWluZyBkZWZpbmVkIGluIENsb3N1cmUncyB0eXBpbmdzLlxuICovXG5jb25zdCBNQVhfU0FGRV9JTlRFR0VSID0gOTAwNzE5OTI1NDc0MDk5MTtcblxuLyoqIFNoYXJlZCBiYXNlIGNsYXNzIHdpdGggTURDLWJhc2VkIGltcGxlbWVudGF0aW9uLiAqL1xuZXhwb3J0IGNsYXNzIF9NYXRUYWJsZURhdGFTb3VyY2U8XG4gIFQsXG4gIFAgZXh0ZW5kcyBNYXRUYWJsZURhdGFTb3VyY2VQYWdpbmF0b3IgPSBNYXRUYWJsZURhdGFTb3VyY2VQYWdpbmF0b3IsXG4+IGV4dGVuZHMgRGF0YVNvdXJjZTxUPiB7XG4gIC8qKiBTdHJlYW0gdGhhdCBlbWl0cyB3aGVuIGEgbmV3IGRhdGEgYXJyYXkgaXMgc2V0IG9uIHRoZSBkYXRhIHNvdXJjZS4gKi9cbiAgcHJpdmF0ZSByZWFkb25seSBfZGF0YTogQmVoYXZpb3JTdWJqZWN0PFRbXT47XG5cbiAgLyoqIFN0cmVhbSBlbWl0dGluZyByZW5kZXIgZGF0YSB0byB0aGUgdGFibGUgKGRlcGVuZHMgb24gb3JkZXJlZCBkYXRhIGNoYW5nZXMpLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9yZW5kZXJEYXRhID0gbmV3IEJlaGF2aW9yU3ViamVjdDxUW10+KFtdKTtcblxuICAvKiogU3RyZWFtIHRoYXQgZW1pdHMgd2hlbiBhIG5ldyBmaWx0ZXIgc3RyaW5nIGlzIHNldCBvbiB0aGUgZGF0YSBzb3VyY2UuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX2ZpbHRlciA9IG5ldyBCZWhhdmlvclN1YmplY3Q8c3RyaW5nPignJyk7XG5cbiAgLyoqIFVzZWQgdG8gcmVhY3QgdG8gaW50ZXJuYWwgY2hhbmdlcyBvZiB0aGUgcGFnaW5hdG9yIHRoYXQgYXJlIG1hZGUgYnkgdGhlIGRhdGEgc291cmNlIGl0c2VsZi4gKi9cbiAgcHJpdmF0ZSByZWFkb25seSBfaW50ZXJuYWxQYWdlQ2hhbmdlcyA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG5cbiAgLyoqXG4gICAqIFN1YnNjcmlwdGlvbiB0byB0aGUgY2hhbmdlcyB0aGF0IHNob3VsZCB0cmlnZ2VyIGFuIHVwZGF0ZSB0byB0aGUgdGFibGUncyByZW5kZXJlZCByb3dzLCBzdWNoXG4gICAqIGFzIGZpbHRlcmluZywgc29ydGluZywgcGFnaW5hdGlvbiwgb3IgYmFzZSBkYXRhIGNoYW5nZXMuXG4gICAqL1xuICBfcmVuZGVyQ2hhbmdlc1N1YnNjcmlwdGlvbjogU3Vic2NyaXB0aW9uIHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqXG4gICAqIFRoZSBmaWx0ZXJlZCBzZXQgb2YgZGF0YSB0aGF0IGhhcyBiZWVuIG1hdGNoZWQgYnkgdGhlIGZpbHRlciBzdHJpbmcsIG9yIGFsbCB0aGUgZGF0YSBpZiB0aGVyZVxuICAgKiBpcyBubyBmaWx0ZXIuIFVzZWZ1bCBmb3Iga25vd2luZyB0aGUgc2V0IG9mIGRhdGEgdGhlIHRhYmxlIHJlcHJlc2VudHMuXG4gICAqIEZvciBleGFtcGxlLCBhICdzZWxlY3RBbGwoKScgZnVuY3Rpb24gd291bGQgbGlrZWx5IHdhbnQgdG8gc2VsZWN0IHRoZSBzZXQgb2YgZmlsdGVyZWQgZGF0YVxuICAgKiBzaG93biB0byB0aGUgdXNlciByYXRoZXIgdGhhbiBhbGwgdGhlIGRhdGEuXG4gICAqL1xuICBmaWx0ZXJlZERhdGE6IFRbXTtcblxuICAvKiogQXJyYXkgb2YgZGF0YSB0aGF0IHNob3VsZCBiZSByZW5kZXJlZCBieSB0aGUgdGFibGUsIHdoZXJlIGVhY2ggb2JqZWN0IHJlcHJlc2VudHMgb25lIHJvdy4gKi9cbiAgZ2V0IGRhdGEoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGEudmFsdWU7XG4gIH1cblxuICBzZXQgZGF0YShkYXRhOiBUW10pIHtcbiAgICBkYXRhID0gQXJyYXkuaXNBcnJheShkYXRhKSA/IGRhdGEgOiBbXTtcbiAgICB0aGlzLl9kYXRhLm5leHQoZGF0YSk7XG4gICAgLy8gTm9ybWFsbHkgdGhlIGBmaWx0ZXJlZERhdGFgIGlzIHVwZGF0ZWQgYnkgdGhlIHJlLXJlbmRlclxuICAgIC8vIHN1YnNjcmlwdGlvbiwgYnV0IHRoYXQgd29uJ3QgaGFwcGVuIGlmIGl0J3MgaW5hY3RpdmUuXG4gICAgaWYgKCF0aGlzLl9yZW5kZXJDaGFuZ2VzU3Vic2NyaXB0aW9uKSB7XG4gICAgICB0aGlzLl9maWx0ZXJEYXRhKGRhdGEpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBGaWx0ZXIgdGVybSB0aGF0IHNob3VsZCBiZSB1c2VkIHRvIGZpbHRlciBvdXQgb2JqZWN0cyBmcm9tIHRoZSBkYXRhIGFycmF5LiBUbyBvdmVycmlkZSBob3dcbiAgICogZGF0YSBvYmplY3RzIG1hdGNoIHRvIHRoaXMgZmlsdGVyIHN0cmluZywgcHJvdmlkZSBhIGN1c3RvbSBmdW5jdGlvbiBmb3IgZmlsdGVyUHJlZGljYXRlLlxuICAgKi9cbiAgZ2V0IGZpbHRlcigpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9maWx0ZXIudmFsdWU7XG4gIH1cblxuICBzZXQgZmlsdGVyKGZpbHRlcjogc3RyaW5nKSB7XG4gICAgdGhpcy5fZmlsdGVyLm5leHQoZmlsdGVyKTtcbiAgICAvLyBOb3JtYWxseSB0aGUgYGZpbHRlcmVkRGF0YWAgaXMgdXBkYXRlZCBieSB0aGUgcmUtcmVuZGVyXG4gICAgLy8gc3Vic2NyaXB0aW9uLCBidXQgdGhhdCB3b24ndCBoYXBwZW4gaWYgaXQncyBpbmFjdGl2ZS5cbiAgICBpZiAoIXRoaXMuX3JlbmRlckNoYW5nZXNTdWJzY3JpcHRpb24pIHtcbiAgICAgIHRoaXMuX2ZpbHRlckRhdGEodGhpcy5kYXRhKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSW5zdGFuY2Ugb2YgdGhlIE1hdFNvcnQgZGlyZWN0aXZlIHVzZWQgYnkgdGhlIHRhYmxlIHRvIGNvbnRyb2wgaXRzIHNvcnRpbmcuIFNvcnQgY2hhbmdlc1xuICAgKiBlbWl0dGVkIGJ5IHRoZSBNYXRTb3J0IHdpbGwgdHJpZ2dlciBhbiB1cGRhdGUgdG8gdGhlIHRhYmxlJ3MgcmVuZGVyZWQgZGF0YS5cbiAgICovXG4gIGdldCBzb3J0KCk6IE1hdFNvcnQgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fc29ydDtcbiAgfVxuXG4gIHNldCBzb3J0KHNvcnQ6IE1hdFNvcnQgfCBudWxsKSB7XG4gICAgdGhpcy5fc29ydCA9IHNvcnQ7XG4gICAgdGhpcy5fdXBkYXRlQ2hhbmdlU3Vic2NyaXB0aW9uKCk7XG4gIH1cblxuICBwcml2YXRlIF9zb3J0OiBNYXRTb3J0IHwgbnVsbDtcblxuICAvKipcbiAgICogSW5zdGFuY2Ugb2YgdGhlIHBhZ2luYXRvciBjb21wb25lbnQgdXNlZCBieSB0aGUgdGFibGUgdG8gY29udHJvbCB3aGF0IHBhZ2Ugb2YgdGhlIGRhdGEgaXNcbiAgICogZGlzcGxheWVkLiBQYWdlIGNoYW5nZXMgZW1pdHRlZCBieSB0aGUgcGFnaW5hdG9yIHdpbGwgdHJpZ2dlciBhbiB1cGRhdGUgdG8gdGhlXG4gICAqIHRhYmxlJ3MgcmVuZGVyZWQgZGF0YS5cbiAgICpcbiAgICogTm90ZSB0aGF0IHRoZSBkYXRhIHNvdXJjZSB1c2VzIHRoZSBwYWdpbmF0b3IncyBwcm9wZXJ0aWVzIHRvIGNhbGN1bGF0ZSB3aGljaCBwYWdlIG9mIGRhdGFcbiAgICogc2hvdWxkIGJlIGRpc3BsYXllZC4gSWYgdGhlIHBhZ2luYXRvciByZWNlaXZlcyBpdHMgcHJvcGVydGllcyBhcyB0ZW1wbGF0ZSBpbnB1dHMsXG4gICAqIGUuZy4gYFtwYWdlTGVuZ3RoXT0xMDBgIG9yIGBbcGFnZUluZGV4XT0xYCwgdGhlbiBiZSBzdXJlIHRoYXQgdGhlIHBhZ2luYXRvcidzIHZpZXcgaGFzIGJlZW5cbiAgICogaW5pdGlhbGl6ZWQgYmVmb3JlIGFzc2lnbmluZyBpdCB0byB0aGlzIGRhdGEgc291cmNlLlxuICAgKi9cbiAgZ2V0IHBhZ2luYXRvcigpOiBQIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX3BhZ2luYXRvcjtcbiAgfVxuXG4gIHNldCBwYWdpbmF0b3IocGFnaW5hdG9yOiBQIHwgbnVsbCkge1xuICAgIHRoaXMuX3BhZ2luYXRvciA9IHBhZ2luYXRvcjtcbiAgICB0aGlzLl91cGRhdGVDaGFuZ2VTdWJzY3JpcHRpb24oKTtcbiAgfVxuXG4gIHByaXZhdGUgX3BhZ2luYXRvcjogUCB8IG51bGw7XG5cbiAgLyoqXG4gICAqIERhdGEgYWNjZXNzb3IgZnVuY3Rpb24gdGhhdCBpcyB1c2VkIGZvciBhY2Nlc3NpbmcgZGF0YSBwcm9wZXJ0aWVzIGZvciBzb3J0aW5nIHRocm91Z2hcbiAgICogdGhlIGRlZmF1bHQgc29ydERhdGEgZnVuY3Rpb24uXG4gICAqIFRoaXMgZGVmYXVsdCBmdW5jdGlvbiBhc3N1bWVzIHRoYXQgdGhlIHNvcnQgaGVhZGVyIElEcyAod2hpY2ggZGVmYXVsdHMgdG8gdGhlIGNvbHVtbiBuYW1lKVxuICAgKiBtYXRjaGVzIHRoZSBkYXRhJ3MgcHJvcGVydGllcyAoZS5nLiBjb2x1bW4gWHl6IHJlcHJlc2VudHMgZGF0YVsnWHl6J10pLlxuICAgKiBNYXkgYmUgc2V0IHRvIGEgY3VzdG9tIGZ1bmN0aW9uIGZvciBkaWZmZXJlbnQgYmVoYXZpb3IuXG4gICAqIEBwYXJhbSBkYXRhIERhdGEgb2JqZWN0IHRoYXQgaXMgYmVpbmcgYWNjZXNzZWQuXG4gICAqIEBwYXJhbSBzb3J0SGVhZGVySWQgVGhlIG5hbWUgb2YgdGhlIGNvbHVtbiB0aGF0IHJlcHJlc2VudHMgdGhlIGRhdGEuXG4gICAqL1xuICBzb3J0aW5nRGF0YUFjY2Vzc29yOiAoZGF0YTogVCwgc29ydEhlYWRlcklkOiBzdHJpbmcpID0+IHN0cmluZyB8IG51bWJlciA9IChcbiAgICBkYXRhOiBULFxuICAgIHNvcnRIZWFkZXJJZDogc3RyaW5nLFxuICApOiBzdHJpbmcgfCBudW1iZXIgPT4ge1xuICAgIGNvbnN0IHZhbHVlID0gKGRhdGEgYXMgdW5rbm93biBhcyBSZWNvcmQ8c3RyaW5nLCBhbnk+KVtzb3J0SGVhZGVySWRdO1xuXG4gICAgaWYgKF9pc051bWJlclZhbHVlKHZhbHVlKSkge1xuICAgICAgY29uc3QgbnVtYmVyVmFsdWUgPSBOdW1iZXIodmFsdWUpO1xuXG4gICAgICAvLyBOdW1iZXJzIGJleW9uZCBgTUFYX1NBRkVfSU5URUdFUmAgY2FuJ3QgYmUgY29tcGFyZWQgcmVsaWFibHkgc28gd2VcbiAgICAgIC8vIGxlYXZlIHRoZW0gYXMgc3RyaW5ncy4gRm9yIG1vcmUgaW5mbzogaHR0cHM6Ly9nb28uZ2wveTV2YlNnXG4gICAgICByZXR1cm4gbnVtYmVyVmFsdWUgPCBNQVhfU0FGRV9JTlRFR0VSID8gbnVtYmVyVmFsdWUgOiB2YWx1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdmFsdWU7XG4gIH07XG5cbiAgLyoqXG4gICAqIEdldHMgYSBzb3J0ZWQgY29weSBvZiB0aGUgZGF0YSBhcnJheSBiYXNlZCBvbiB0aGUgc3RhdGUgb2YgdGhlIE1hdFNvcnQuIENhbGxlZFxuICAgKiBhZnRlciBjaGFuZ2VzIGFyZSBtYWRlIHRvIHRoZSBmaWx0ZXJlZCBkYXRhIG9yIHdoZW4gc29ydCBjaGFuZ2VzIGFyZSBlbWl0dGVkIGZyb20gTWF0U29ydC5cbiAgICogQnkgZGVmYXVsdCwgdGhlIGZ1bmN0aW9uIHJldHJpZXZlcyB0aGUgYWN0aXZlIHNvcnQgYW5kIGl0cyBkaXJlY3Rpb24gYW5kIGNvbXBhcmVzIGRhdGFcbiAgICogYnkgcmV0cmlldmluZyBkYXRhIHVzaW5nIHRoZSBzb3J0aW5nRGF0YUFjY2Vzc29yLiBNYXkgYmUgb3ZlcnJpZGRlbiBmb3IgYSBjdXN0b20gaW1wbGVtZW50YXRpb25cbiAgICogb2YgZGF0YSBvcmRlcmluZy5cbiAgICogQHBhcmFtIGRhdGEgVGhlIGFycmF5IG9mIGRhdGEgdGhhdCBzaG91bGQgYmUgc29ydGVkLlxuICAgKiBAcGFyYW0gc29ydCBUaGUgY29ubmVjdGVkIE1hdFNvcnQgdGhhdCBob2xkcyB0aGUgY3VycmVudCBzb3J0IHN0YXRlLlxuICAgKi9cbiAgc29ydERhdGE6IChkYXRhOiBUW10sIHNvcnQ6IE1hdFNvcnQpID0+IFRbXSA9IChkYXRhOiBUW10sIHNvcnQ6IE1hdFNvcnQpOiBUW10gPT4ge1xuICAgIGNvbnN0IGFjdGl2ZSA9IHNvcnQuYWN0aXZlO1xuICAgIGNvbnN0IGRpcmVjdGlvbiA9IHNvcnQuZGlyZWN0aW9uO1xuICAgIGlmICghYWN0aXZlIHx8IGRpcmVjdGlvbiA9PSAnJykge1xuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfVxuXG4gICAgcmV0dXJuIGRhdGEuc29ydCgoYSwgYikgPT4ge1xuICAgICAgbGV0IHZhbHVlQSA9IHRoaXMuc29ydGluZ0RhdGFBY2Nlc3NvcihhLCBhY3RpdmUpO1xuICAgICAgbGV0IHZhbHVlQiA9IHRoaXMuc29ydGluZ0RhdGFBY2Nlc3NvcihiLCBhY3RpdmUpO1xuXG4gICAgICAvLyBJZiB0aGVyZSBhcmUgZGF0YSBpbiB0aGUgY29sdW1uIHRoYXQgY2FuIGJlIGNvbnZlcnRlZCB0byBhIG51bWJlcixcbiAgICAgIC8vIGl0IG11c3QgYmUgZW5zdXJlZCB0aGF0IHRoZSByZXN0IG9mIHRoZSBkYXRhXG4gICAgICAvLyBpcyBvZiB0aGUgc2FtZSB0eXBlIHNvIGFzIG5vdCB0byBvcmRlciBpbmNvcnJlY3RseS5cbiAgICAgIGNvbnN0IHZhbHVlQVR5cGUgPSB0eXBlb2YgdmFsdWVBO1xuICAgICAgY29uc3QgdmFsdWVCVHlwZSA9IHR5cGVvZiB2YWx1ZUI7XG5cbiAgICAgIGlmICh2YWx1ZUFUeXBlICE9PSB2YWx1ZUJUeXBlKSB7XG4gICAgICAgIGlmICh2YWx1ZUFUeXBlID09PSAnbnVtYmVyJykge1xuICAgICAgICAgIHZhbHVlQSArPSAnJztcbiAgICAgICAgfVxuICAgICAgICBpZiAodmFsdWVCVHlwZSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICB2YWx1ZUIgKz0gJyc7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gSWYgYm90aCB2YWx1ZUEgYW5kIHZhbHVlQiBleGlzdCAodHJ1dGh5KSwgdGhlbiBjb21wYXJlIHRoZSB0d28uIE90aGVyd2lzZSwgY2hlY2sgaWZcbiAgICAgIC8vIG9uZSB2YWx1ZSBleGlzdHMgd2hpbGUgdGhlIG90aGVyIGRvZXNuJ3QuIEluIHRoaXMgY2FzZSwgZXhpc3RpbmcgdmFsdWUgc2hvdWxkIGNvbWUgbGFzdC5cbiAgICAgIC8vIFRoaXMgYXZvaWRzIGluY29uc2lzdGVudCByZXN1bHRzIHdoZW4gY29tcGFyaW5nIHZhbHVlcyB0byB1bmRlZmluZWQvbnVsbC5cbiAgICAgIC8vIElmIG5laXRoZXIgdmFsdWUgZXhpc3RzLCByZXR1cm4gMCAoZXF1YWwpLlxuICAgICAgbGV0IGNvbXBhcmF0b3JSZXN1bHQgPSAwO1xuICAgICAgaWYgKHZhbHVlQSAhPSBudWxsICYmIHZhbHVlQiAhPSBudWxsKSB7XG4gICAgICAgIC8vIENoZWNrIGlmIG9uZSB2YWx1ZSBpcyBncmVhdGVyIHRoYW4gdGhlIG90aGVyOyBpZiBlcXVhbCwgY29tcGFyYXRvclJlc3VsdCBzaG91bGQgcmVtYWluIDAuXG4gICAgICAgIGlmICh2YWx1ZUEgPiB2YWx1ZUIpIHtcbiAgICAgICAgICBjb21wYXJhdG9yUmVzdWx0ID0gMTtcbiAgICAgICAgfSBlbHNlIGlmICh2YWx1ZUEgPCB2YWx1ZUIpIHtcbiAgICAgICAgICBjb21wYXJhdG9yUmVzdWx0ID0gLTE7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodmFsdWVBICE9IG51bGwpIHtcbiAgICAgICAgY29tcGFyYXRvclJlc3VsdCA9IDE7XG4gICAgICB9IGVsc2UgaWYgKHZhbHVlQiAhPSBudWxsKSB7XG4gICAgICAgIGNvbXBhcmF0b3JSZXN1bHQgPSAtMTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGNvbXBhcmF0b3JSZXN1bHQgKiAoZGlyZWN0aW9uID09ICdhc2MnID8gMSA6IC0xKTtcbiAgICB9KTtcbiAgfTtcblxuICAvKipcbiAgICogQ2hlY2tzIGlmIGEgZGF0YSBvYmplY3QgbWF0Y2hlcyB0aGUgZGF0YSBzb3VyY2UncyBmaWx0ZXIgc3RyaW5nLiBCeSBkZWZhdWx0LCBlYWNoIGRhdGEgb2JqZWN0XG4gICAqIGlzIGNvbnZlcnRlZCB0byBhIHN0cmluZyBvZiBpdHMgcHJvcGVydGllcyBhbmQgcmV0dXJucyB0cnVlIGlmIHRoZSBmaWx0ZXIgaGFzXG4gICAqIGF0IGxlYXN0IG9uZSBvY2N1cnJlbmNlIGluIHRoYXQgc3RyaW5nLiBCeSBkZWZhdWx0LCB0aGUgZmlsdGVyIHN0cmluZyBoYXMgaXRzIHdoaXRlc3BhY2VcbiAgICogdHJpbW1lZCBhbmQgdGhlIG1hdGNoIGlzIGNhc2UtaW5zZW5zaXRpdmUuIE1heSBiZSBvdmVycmlkZGVuIGZvciBhIGN1c3RvbSBpbXBsZW1lbnRhdGlvbiBvZlxuICAgKiBmaWx0ZXIgbWF0Y2hpbmcuXG4gICAqIEBwYXJhbSBkYXRhIERhdGEgb2JqZWN0IHVzZWQgdG8gY2hlY2sgYWdhaW5zdCB0aGUgZmlsdGVyLlxuICAgKiBAcGFyYW0gZmlsdGVyIEZpbHRlciBzdHJpbmcgdGhhdCBoYXMgYmVlbiBzZXQgb24gdGhlIGRhdGEgc291cmNlLlxuICAgKiBAcmV0dXJucyBXaGV0aGVyIHRoZSBmaWx0ZXIgbWF0Y2hlcyBhZ2FpbnN0IHRoZSBkYXRhXG4gICAqL1xuICBmaWx0ZXJQcmVkaWNhdGU6IChkYXRhOiBULCBmaWx0ZXI6IHN0cmluZykgPT4gYm9vbGVhbiA9IChkYXRhOiBULCBmaWx0ZXI6IHN0cmluZyk6IGJvb2xlYW4gPT4ge1xuICAgIC8vIFRyYW5zZm9ybSB0aGUgZGF0YSBpbnRvIGEgbG93ZXJjYXNlIHN0cmluZyBvZiBhbGwgcHJvcGVydHkgdmFsdWVzLlxuICAgIGNvbnN0IGRhdGFTdHIgPSBPYmplY3Qua2V5cyhkYXRhIGFzIHVua25vd24gYXMgUmVjb3JkPHN0cmluZywgYW55PilcbiAgICAgIC5yZWR1Y2UoKGN1cnJlbnRUZXJtOiBzdHJpbmcsIGtleTogc3RyaW5nKSA9PiB7XG4gICAgICAgIC8vIFVzZSBhbiBvYnNjdXJlIFVuaWNvZGUgY2hhcmFjdGVyIHRvIGRlbGltaXQgdGhlIHdvcmRzIGluIHRoZSBjb25jYXRlbmF0ZWQgc3RyaW5nLlxuICAgICAgICAvLyBUaGlzIGF2b2lkcyBtYXRjaGVzIHdoZXJlIHRoZSB2YWx1ZXMgb2YgdHdvIGNvbHVtbnMgY29tYmluZWQgd2lsbCBtYXRjaCB0aGUgdXNlcidzIHF1ZXJ5XG4gICAgICAgIC8vIChlLmcuIGBGbHV0ZWAgYW5kIGBTdG9wYCB3aWxsIG1hdGNoIGBUZXN0YCkuIFRoZSBjaGFyYWN0ZXIgaXMgaW50ZW5kZWQgdG8gYmUgc29tZXRoaW5nXG4gICAgICAgIC8vIHRoYXQgaGFzIGEgdmVyeSBsb3cgY2hhbmNlIG9mIGJlaW5nIHR5cGVkIGluIGJ5IHNvbWVib2R5IGluIGEgdGV4dCBmaWVsZC4gVGhpcyBvbmUgaW5cbiAgICAgICAgLy8gcGFydGljdWxhciBpcyBcIldoaXRlIHVwLXBvaW50aW5nIHRyaWFuZ2xlIHdpdGggZG90XCIgZnJvbVxuICAgICAgICAvLyBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9MaXN0X29mX1VuaWNvZGVfY2hhcmFjdGVyc1xuICAgICAgICByZXR1cm4gY3VycmVudFRlcm0gKyAoZGF0YSBhcyB1bmtub3duIGFzIFJlY29yZDxzdHJpbmcsIGFueT4pW2tleV0gKyAn4pesJztcbiAgICAgIH0sICcnKVxuICAgICAgLnRvTG93ZXJDYXNlKCk7XG5cbiAgICAvLyBUcmFuc2Zvcm0gdGhlIGZpbHRlciBieSBjb252ZXJ0aW5nIGl0IHRvIGxvd2VyY2FzZSBhbmQgcmVtb3Zpbmcgd2hpdGVzcGFjZS5cbiAgICBjb25zdCB0cmFuc2Zvcm1lZEZpbHRlciA9IGZpbHRlci50cmltKCkudG9Mb3dlckNhc2UoKTtcblxuICAgIHJldHVybiBkYXRhU3RyLmluZGV4T2YodHJhbnNmb3JtZWRGaWx0ZXIpICE9IC0xO1xuICB9O1xuXG4gIGNvbnN0cnVjdG9yKGluaXRpYWxEYXRhOiBUW10gPSBbXSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5fZGF0YSA9IG5ldyBCZWhhdmlvclN1YmplY3Q8VFtdPihpbml0aWFsRGF0YSk7XG4gICAgdGhpcy5fdXBkYXRlQ2hhbmdlU3Vic2NyaXB0aW9uKCk7XG4gIH1cblxuICAvKipcbiAgICogU3Vic2NyaWJlIHRvIGNoYW5nZXMgdGhhdCBzaG91bGQgdHJpZ2dlciBhbiB1cGRhdGUgdG8gdGhlIHRhYmxlJ3MgcmVuZGVyZWQgcm93cy4gV2hlbiB0aGVcbiAgICogY2hhbmdlcyBvY2N1ciwgcHJvY2VzcyB0aGUgY3VycmVudCBzdGF0ZSBvZiB0aGUgZmlsdGVyLCBzb3J0LCBhbmQgcGFnaW5hdGlvbiBhbG9uZyB3aXRoXG4gICAqIHRoZSBwcm92aWRlZCBiYXNlIGRhdGEgYW5kIHNlbmQgaXQgdG8gdGhlIHRhYmxlIGZvciByZW5kZXJpbmcuXG4gICAqL1xuICBfdXBkYXRlQ2hhbmdlU3Vic2NyaXB0aW9uKCkge1xuICAgIC8vIFNvcnRpbmcgYW5kL29yIHBhZ2luYXRpb24gc2hvdWxkIGJlIHdhdGNoZWQgaWYgc29ydCBhbmQvb3IgcGFnaW5hdG9yIGFyZSBwcm92aWRlZC5cbiAgICAvLyBUaGUgZXZlbnRzIHNob3VsZCBlbWl0IHdoZW5ldmVyIHRoZSBjb21wb25lbnQgZW1pdHMgYSBjaGFuZ2Ugb3IgaW5pdGlhbGl6ZXMsIG9yIGlmIG5vXG4gICAgLy8gY29tcG9uZW50IGlzIHByb3ZpZGVkLCBhIHN0cmVhbSB3aXRoIGp1c3QgYSBudWxsIGV2ZW50IHNob3VsZCBiZSBwcm92aWRlZC5cbiAgICAvLyBUaGUgYHNvcnRDaGFuZ2VgIGFuZCBgcGFnZUNoYW5nZWAgYWN0cyBhcyBhIHNpZ25hbCB0byB0aGUgY29tYmluZUxhdGVzdHMgYmVsb3cgc28gdGhhdCB0aGVcbiAgICAvLyBwaXBlbGluZSBjYW4gcHJvZ3Jlc3MgdG8gdGhlIG5leHQgc3RlcC4gTm90ZSB0aGF0IHRoZSB2YWx1ZSBmcm9tIHRoZXNlIHN0cmVhbXMgYXJlIG5vdCB1c2VkLFxuICAgIC8vIHRoZXkgcHVyZWx5IGFjdCBhcyBhIHNpZ25hbCB0byBwcm9ncmVzcyBpbiB0aGUgcGlwZWxpbmUuXG4gICAgY29uc3Qgc29ydENoYW5nZTogT2JzZXJ2YWJsZTxTb3J0IHwgbnVsbCB8IHZvaWQ+ID0gdGhpcy5fc29ydFxuICAgICAgPyAobWVyZ2UodGhpcy5fc29ydC5zb3J0Q2hhbmdlLCB0aGlzLl9zb3J0LmluaXRpYWxpemVkKSBhcyBPYnNlcnZhYmxlPFNvcnQgfCB2b2lkPilcbiAgICAgIDogb2JzZXJ2YWJsZU9mKG51bGwpO1xuICAgIGNvbnN0IHBhZ2VDaGFuZ2U6IE9ic2VydmFibGU8TWF0VGFibGVEYXRhU291cmNlUGFnZUV2ZW50IHwgbnVsbCB8IHZvaWQ+ID0gdGhpcy5fcGFnaW5hdG9yXG4gICAgICA/IChtZXJnZShcbiAgICAgICAgICB0aGlzLl9wYWdpbmF0b3IucGFnZSxcbiAgICAgICAgICB0aGlzLl9pbnRlcm5hbFBhZ2VDaGFuZ2VzLFxuICAgICAgICAgIHRoaXMuX3BhZ2luYXRvci5pbml0aWFsaXplZCxcbiAgICAgICAgKSBhcyBPYnNlcnZhYmxlPE1hdFRhYmxlRGF0YVNvdXJjZVBhZ2VFdmVudCB8IHZvaWQ+KVxuICAgICAgOiBvYnNlcnZhYmxlT2YobnVsbCk7XG4gICAgY29uc3QgZGF0YVN0cmVhbSA9IHRoaXMuX2RhdGE7XG4gICAgLy8gV2F0Y2ggZm9yIGJhc2UgZGF0YSBvciBmaWx0ZXIgY2hhbmdlcyB0byBwcm92aWRlIGEgZmlsdGVyZWQgc2V0IG9mIGRhdGEuXG4gICAgY29uc3QgZmlsdGVyZWREYXRhID0gY29tYmluZUxhdGVzdChbZGF0YVN0cmVhbSwgdGhpcy5fZmlsdGVyXSkucGlwZShcbiAgICAgIG1hcCgoW2RhdGFdKSA9PiB0aGlzLl9maWx0ZXJEYXRhKGRhdGEpKSxcbiAgICApO1xuICAgIC8vIFdhdGNoIGZvciBmaWx0ZXJlZCBkYXRhIG9yIHNvcnQgY2hhbmdlcyB0byBwcm92aWRlIGFuIG9yZGVyZWQgc2V0IG9mIGRhdGEuXG4gICAgY29uc3Qgb3JkZXJlZERhdGEgPSBjb21iaW5lTGF0ZXN0KFtmaWx0ZXJlZERhdGEsIHNvcnRDaGFuZ2VdKS5waXBlKFxuICAgICAgbWFwKChbZGF0YV0pID0+IHRoaXMuX29yZGVyRGF0YShkYXRhKSksXG4gICAgKTtcbiAgICAvLyBXYXRjaCBmb3Igb3JkZXJlZCBkYXRhIG9yIHBhZ2UgY2hhbmdlcyB0byBwcm92aWRlIGEgcGFnZWQgc2V0IG9mIGRhdGEuXG4gICAgY29uc3QgcGFnaW5hdGVkRGF0YSA9IGNvbWJpbmVMYXRlc3QoW29yZGVyZWREYXRhLCBwYWdlQ2hhbmdlXSkucGlwZShcbiAgICAgIG1hcCgoW2RhdGFdKSA9PiB0aGlzLl9wYWdlRGF0YShkYXRhKSksXG4gICAgKTtcbiAgICAvLyBXYXRjaGVkIGZvciBwYWdlZCBkYXRhIGNoYW5nZXMgYW5kIHNlbmQgdGhlIHJlc3VsdCB0byB0aGUgdGFibGUgdG8gcmVuZGVyLlxuICAgIHRoaXMuX3JlbmRlckNoYW5nZXNTdWJzY3JpcHRpb24/LnVuc3Vic2NyaWJlKCk7XG4gICAgdGhpcy5fcmVuZGVyQ2hhbmdlc1N1YnNjcmlwdGlvbiA9IHBhZ2luYXRlZERhdGEuc3Vic2NyaWJlKGRhdGEgPT4gdGhpcy5fcmVuZGVyRGF0YS5uZXh0KGRhdGEpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgZmlsdGVyZWQgZGF0YSBhcnJheSB3aGVyZSBlYWNoIGZpbHRlciBvYmplY3QgY29udGFpbnMgdGhlIGZpbHRlciBzdHJpbmcgd2l0aGluXG4gICAqIHRoZSByZXN1bHQgb2YgdGhlIGZpbHRlclRlcm1BY2Nlc3NvciBmdW5jdGlvbi4gSWYgbm8gZmlsdGVyIGlzIHNldCwgcmV0dXJucyB0aGUgZGF0YSBhcnJheVxuICAgKiBhcyBwcm92aWRlZC5cbiAgICovXG4gIF9maWx0ZXJEYXRhKGRhdGE6IFRbXSkge1xuICAgIC8vIElmIHRoZXJlIGlzIGEgZmlsdGVyIHN0cmluZywgZmlsdGVyIG91dCBkYXRhIHRoYXQgZG9lcyBub3QgY29udGFpbiBpdC5cbiAgICAvLyBFYWNoIGRhdGEgb2JqZWN0IGlzIGNvbnZlcnRlZCB0byBhIHN0cmluZyB1c2luZyB0aGUgZnVuY3Rpb24gZGVmaW5lZCBieSBmaWx0ZXJUZXJtQWNjZXNzb3IuXG4gICAgLy8gTWF5IGJlIG92ZXJyaWRkZW4gZm9yIGN1c3RvbWl6YXRpb24uXG4gICAgdGhpcy5maWx0ZXJlZERhdGEgPVxuICAgICAgdGhpcy5maWx0ZXIgPT0gbnVsbCB8fCB0aGlzLmZpbHRlciA9PT0gJydcbiAgICAgICAgPyBkYXRhXG4gICAgICAgIDogZGF0YS5maWx0ZXIob2JqID0+IHRoaXMuZmlsdGVyUHJlZGljYXRlKG9iaiwgdGhpcy5maWx0ZXIpKTtcblxuICAgIGlmICh0aGlzLnBhZ2luYXRvcikge1xuICAgICAgdGhpcy5fdXBkYXRlUGFnaW5hdG9yKHRoaXMuZmlsdGVyZWREYXRhLmxlbmd0aCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuZmlsdGVyZWREYXRhO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBzb3J0ZWQgY29weSBvZiB0aGUgZGF0YSBpZiBNYXRTb3J0IGhhcyBhIHNvcnQgYXBwbGllZCwgb3RoZXJ3aXNlIGp1c3QgcmV0dXJucyB0aGVcbiAgICogZGF0YSBhcnJheSBhcyBwcm92aWRlZC4gVXNlcyB0aGUgZGVmYXVsdCBkYXRhIGFjY2Vzc29yIGZvciBkYXRhIGxvb2t1cCwgdW5sZXNzIGFcbiAgICogc29ydERhdGFBY2Nlc3NvciBmdW5jdGlvbiBpcyBkZWZpbmVkLlxuICAgKi9cbiAgX29yZGVyRGF0YShkYXRhOiBUW10pOiBUW10ge1xuICAgIC8vIElmIHRoZXJlIGlzIG5vIGFjdGl2ZSBzb3J0IG9yIGRpcmVjdGlvbiwgcmV0dXJuIHRoZSBkYXRhIHdpdGhvdXQgdHJ5aW5nIHRvIHNvcnQuXG4gICAgaWYgKCF0aGlzLnNvcnQpIHtcbiAgICAgIHJldHVybiBkYXRhO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnNvcnREYXRhKGRhdGEuc2xpY2UoKSwgdGhpcy5zb3J0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgcGFnZWQgc2xpY2Ugb2YgdGhlIHByb3ZpZGVkIGRhdGEgYXJyYXkgYWNjb3JkaW5nIHRvIHRoZSBwcm92aWRlZCBwYWdpbmF0b3IncyBwYWdlXG4gICAqIGluZGV4IGFuZCBsZW5ndGguIElmIHRoZXJlIGlzIG5vIHBhZ2luYXRvciBwcm92aWRlZCwgcmV0dXJucyB0aGUgZGF0YSBhcnJheSBhcyBwcm92aWRlZC5cbiAgICovXG4gIF9wYWdlRGF0YShkYXRhOiBUW10pOiBUW10ge1xuICAgIGlmICghdGhpcy5wYWdpbmF0b3IpIHtcbiAgICAgIHJldHVybiBkYXRhO1xuICAgIH1cblxuICAgIGNvbnN0IHN0YXJ0SW5kZXggPSB0aGlzLnBhZ2luYXRvci5wYWdlSW5kZXggKiB0aGlzLnBhZ2luYXRvci5wYWdlU2l6ZTtcbiAgICByZXR1cm4gZGF0YS5zbGljZShzdGFydEluZGV4LCBzdGFydEluZGV4ICsgdGhpcy5wYWdpbmF0b3IucGFnZVNpemUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIHBhZ2luYXRvciB0byByZWZsZWN0IHRoZSBsZW5ndGggb2YgdGhlIGZpbHRlcmVkIGRhdGEsIGFuZCBtYWtlcyBzdXJlIHRoYXQgdGhlIHBhZ2VcbiAgICogaW5kZXggZG9lcyBub3QgZXhjZWVkIHRoZSBwYWdpbmF0b3IncyBsYXN0IHBhZ2UuIFZhbHVlcyBhcmUgY2hhbmdlZCBpbiBhIHJlc29sdmVkIHByb21pc2UgdG9cbiAgICogZ3VhcmQgYWdhaW5zdCBtYWtpbmcgcHJvcGVydHkgY2hhbmdlcyB3aXRoaW4gYSByb3VuZCBvZiBjaGFuZ2UgZGV0ZWN0aW9uLlxuICAgKi9cbiAgX3VwZGF0ZVBhZ2luYXRvcihmaWx0ZXJlZERhdGFMZW5ndGg6IG51bWJlcikge1xuICAgIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oKCkgPT4ge1xuICAgICAgY29uc3QgcGFnaW5hdG9yID0gdGhpcy5wYWdpbmF0b3I7XG5cbiAgICAgIGlmICghcGFnaW5hdG9yKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgcGFnaW5hdG9yLmxlbmd0aCA9IGZpbHRlcmVkRGF0YUxlbmd0aDtcblxuICAgICAgLy8gSWYgdGhlIHBhZ2UgaW5kZXggaXMgc2V0IGJleW9uZCB0aGUgcGFnZSwgcmVkdWNlIGl0IHRvIHRoZSBsYXN0IHBhZ2UuXG4gICAgICBpZiAocGFnaW5hdG9yLnBhZ2VJbmRleCA+IDApIHtcbiAgICAgICAgY29uc3QgbGFzdFBhZ2VJbmRleCA9IE1hdGguY2VpbChwYWdpbmF0b3IubGVuZ3RoIC8gcGFnaW5hdG9yLnBhZ2VTaXplKSAtIDEgfHwgMDtcbiAgICAgICAgY29uc3QgbmV3UGFnZUluZGV4ID0gTWF0aC5taW4ocGFnaW5hdG9yLnBhZ2VJbmRleCwgbGFzdFBhZ2VJbmRleCk7XG5cbiAgICAgICAgaWYgKG5ld1BhZ2VJbmRleCAhPT0gcGFnaW5hdG9yLnBhZ2VJbmRleCkge1xuICAgICAgICAgIHBhZ2luYXRvci5wYWdlSW5kZXggPSBuZXdQYWdlSW5kZXg7XG5cbiAgICAgICAgICAvLyBTaW5jZSB0aGUgcGFnaW5hdG9yIG9ubHkgZW1pdHMgYWZ0ZXIgdXNlci1nZW5lcmF0ZWQgY2hhbmdlcyxcbiAgICAgICAgICAvLyB3ZSBuZWVkIG91ciBvd24gc3RyZWFtIHNvIHdlIGtub3cgdG8gc2hvdWxkIHJlLXJlbmRlciB0aGUgZGF0YS5cbiAgICAgICAgICB0aGlzLl9pbnRlcm5hbFBhZ2VDaGFuZ2VzLm5leHQoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFVzZWQgYnkgdGhlIE1hdFRhYmxlLiBDYWxsZWQgd2hlbiBpdCBjb25uZWN0cyB0byB0aGUgZGF0YSBzb3VyY2UuXG4gICAqIEBkb2NzLXByaXZhdGVcbiAgICovXG4gIGNvbm5lY3QoKSB7XG4gICAgaWYgKCF0aGlzLl9yZW5kZXJDaGFuZ2VzU3Vic2NyaXB0aW9uKSB7XG4gICAgICB0aGlzLl91cGRhdGVDaGFuZ2VTdWJzY3JpcHRpb24oKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fcmVuZGVyRGF0YTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVc2VkIGJ5IHRoZSBNYXRUYWJsZS4gQ2FsbGVkIHdoZW4gaXQgZGlzY29ubmVjdHMgZnJvbSB0aGUgZGF0YSBzb3VyY2UuXG4gICAqIEBkb2NzLXByaXZhdGVcbiAgICovXG4gIGRpc2Nvbm5lY3QoKSB7XG4gICAgdGhpcy5fcmVuZGVyQ2hhbmdlc1N1YnNjcmlwdGlvbj8udW5zdWJzY3JpYmUoKTtcbiAgICB0aGlzLl9yZW5kZXJDaGFuZ2VzU3Vic2NyaXB0aW9uID0gbnVsbDtcbiAgfVxufVxuXG4vKipcbiAqIERhdGEgc291cmNlIHRoYXQgYWNjZXB0cyBhIGNsaWVudC1zaWRlIGRhdGEgYXJyYXkgYW5kIGluY2x1ZGVzIG5hdGl2ZSBzdXBwb3J0IG9mIGZpbHRlcmluZyxcbiAqIHNvcnRpbmcgKHVzaW5nIE1hdFNvcnQpLCBhbmQgcGFnaW5hdGlvbiAodXNpbmcgTWF0UGFnaW5hdG9yKS5cbiAqXG4gKiBBbGxvd3MgZm9yIHNvcnQgY3VzdG9taXphdGlvbiBieSBvdmVycmlkaW5nIHNvcnRpbmdEYXRhQWNjZXNzb3IsIHdoaWNoIGRlZmluZXMgaG93IGRhdGFcbiAqIHByb3BlcnRpZXMgYXJlIGFjY2Vzc2VkLiBBbHNvIGFsbG93cyBmb3IgZmlsdGVyIGN1c3RvbWl6YXRpb24gYnkgb3ZlcnJpZGluZyBmaWx0ZXJUZXJtQWNjZXNzb3IsXG4gKiB3aGljaCBkZWZpbmVzIGhvdyByb3cgZGF0YSBpcyBjb252ZXJ0ZWQgdG8gYSBzdHJpbmcgZm9yIGZpbHRlciBtYXRjaGluZy5cbiAqXG4gKiAqKk5vdGU6KiogVGhpcyBjbGFzcyBpcyBtZWFudCB0byBiZSBhIHNpbXBsZSBkYXRhIHNvdXJjZSB0byBoZWxwIHlvdSBnZXQgc3RhcnRlZC4gQXMgc3VjaFxuICogaXQgaXNuJ3QgZXF1aXBwZWQgdG8gaGFuZGxlIHNvbWUgbW9yZSBhZHZhbmNlZCBjYXNlcyBsaWtlIHJvYnVzdCBpMThuIHN1cHBvcnQgb3Igc2VydmVyLXNpZGVcbiAqIGludGVyYWN0aW9ucy4gSWYgeW91ciBhcHAgbmVlZHMgdG8gc3VwcG9ydCBtb3JlIGFkdmFuY2VkIHVzZSBjYXNlcywgY29uc2lkZXIgaW1wbGVtZW50aW5nIHlvdXJcbiAqIG93biBgRGF0YVNvdXJjZWAuXG4gKi9cbmV4cG9ydCBjbGFzcyBNYXRUYWJsZURhdGFTb3VyY2U8XG4gIFQsXG4gIFAgZXh0ZW5kcyBNYXRUYWJsZURhdGFTb3VyY2VQYWdpbmF0b3IgPSBNYXRUYWJsZURhdGFTb3VyY2VQYWdpbmF0b3IsXG4+IGV4dGVuZHMgX01hdFRhYmxlRGF0YVNvdXJjZTxULCBQPiB7fVxuIl19