/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { EventEmitter } from '../event_emitter';
import { arrayEquals, flatten } from '../util/array_utils';
import { getSymbolIterator } from '../util/symbol';
function symbolIterator() {
    return this._results[getSymbolIterator()]();
}
/**
 * An unmodifiable list of items that Angular keeps up to date when the state
 * of the application changes.
 *
 * The type of object that {@link ViewChildren}, {@link ContentChildren}, and {@link QueryList}
 * provide.
 *
 * Implements an iterable interface, therefore it can be used in both ES6
 * javascript `for (var i of items)` loops as well as in Angular templates with
 * `*ngFor="let i of myList"`.
 *
 * Changes can be observed by subscribing to the changes `Observable`.
 *
 * NOTE: In the future this class will implement an `Observable` interface.
 *
 * @usageNotes
 * ### Example
 * ```typescript
 * @Component({...})
 * class Container {
 *   @ViewChildren(Item) items:QueryList<Item>;
 * }
 * ```
 *
 * @publicApi
 */
export class QueryList {
    /**
     * @param emitDistinctChangesOnly Whether `QueryList.changes` should fire only when actual change
     *     has occurred. Or if it should fire when query is recomputed. (recomputing could resolve in
     *     the same result)
     */
    constructor(_emitDistinctChangesOnly = false) {
        this._emitDistinctChangesOnly = _emitDistinctChangesOnly;
        this.dirty = true;
        this._results = [];
        this._changesDetected = false;
        this._changes = null;
        this.length = 0;
        this.first = undefined;
        this.last = undefined;
        // This function should be declared on the prototype, but doing so there will cause the class
        // declaration to have side-effects and become not tree-shakable. For this reason we do it in
        // the constructor.
        // [getSymbolIterator()](): Iterator<T> { ... }
        const symbol = getSymbolIterator();
        const proto = QueryList.prototype;
        if (!proto[symbol])
            proto[symbol] = symbolIterator;
    }
    /**
     * Returns `Observable` of `QueryList` notifying the subscriber of changes.
     */
    get changes() {
        return this._changes || (this._changes = new EventEmitter());
    }
    /**
     * Returns the QueryList entry at `index`.
     */
    get(index) {
        return this._results[index];
    }
    /**
     * See
     * [Array.map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map)
     */
    map(fn) {
        return this._results.map(fn);
    }
    /**
     * See
     * [Array.filter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)
     */
    filter(fn) {
        return this._results.filter(fn);
    }
    /**
     * See
     * [Array.find](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find)
     */
    find(fn) {
        return this._results.find(fn);
    }
    /**
     * See
     * [Array.reduce](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce)
     */
    reduce(fn, init) {
        return this._results.reduce(fn, init);
    }
    /**
     * See
     * [Array.forEach](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach)
     */
    forEach(fn) {
        this._results.forEach(fn);
    }
    /**
     * See
     * [Array.some](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some)
     */
    some(fn) {
        return this._results.some(fn);
    }
    /**
     * Returns a copy of the internal results list as an Array.
     */
    toArray() {
        return this._results.slice();
    }
    toString() {
        return this._results.toString();
    }
    /**
     * Updates the stored data of the query list, and resets the `dirty` flag to `false`, so that
     * on change detection, it will not notify of changes to the queries, unless a new change
     * occurs.
     *
     * @param resultsTree The query results to store
     * @param identityAccessor Optional function for extracting stable object identity from a value
     *    in the array. This function is executed for each element of the query result list while
     *    comparing current query list with the new one (provided as a first argument of the `reset`
     *    function) to detect if the lists are different. If the function is not provided, elements
     *    are compared as is (without any pre-processing).
     */
    reset(resultsTree, identityAccessor) {
        // Cast to `QueryListInternal` so that we can mutate fields which are readonly for the usage of
        // QueryList (but not for QueryList itself.)
        const self = this;
        self.dirty = false;
        const newResultFlat = flatten(resultsTree);
        if (this._changesDetected = !arrayEquals(self._results, newResultFlat, identityAccessor)) {
            self._results = newResultFlat;
            self.length = newResultFlat.length;
            self.last = newResultFlat[this.length - 1];
            self.first = newResultFlat[0];
        }
    }
    /**
     * Triggers a change event by emitting on the `changes` {@link EventEmitter}.
     */
    notifyOnChanges() {
        if (this._changes && (this._changesDetected || !this._emitDistinctChangesOnly))
            this._changes.emit(this);
    }
    /** internal */
    setDirty() {
        this.dirty = true;
    }
    /** internal */
    destroy() {
        this.changes.complete();
        this.changes.unsubscribe();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVlcnlfbGlzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL2xpbmtlci9xdWVyeV9saXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUlILE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUM5QyxPQUFPLEVBQUMsV0FBVyxFQUFFLE9BQU8sRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ3pELE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBRWpELFNBQVMsY0FBYztJQUNyQixPQUFTLElBQW9DLENBQUMsUUFBZ0IsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUN4RixDQUFDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F5Qkc7QUFDSCxNQUFNLE9BQU8sU0FBUztJQWlCcEI7Ozs7T0FJRztJQUNILFlBQW9CLDJCQUFvQyxLQUFLO1FBQXpDLDZCQUF3QixHQUF4Qix3QkFBd0IsQ0FBaUI7UUFyQjdDLFVBQUssR0FBRyxJQUFJLENBQUM7UUFDckIsYUFBUSxHQUFhLEVBQUUsQ0FBQztRQUN4QixxQkFBZ0IsR0FBWSxLQUFLLENBQUM7UUFDbEMsYUFBUSxHQUFvQyxJQUFJLENBQUM7UUFFaEQsV0FBTSxHQUFXLENBQUMsQ0FBQztRQUNuQixVQUFLLEdBQU0sU0FBVSxDQUFDO1FBQ3RCLFNBQUksR0FBTSxTQUFVLENBQUM7UUFlNUIsNkZBQTZGO1FBQzdGLDZGQUE2RjtRQUM3RixtQkFBbUI7UUFDbkIsK0NBQStDO1FBQy9DLE1BQU0sTUFBTSxHQUFHLGlCQUFpQixFQUFFLENBQUM7UUFDbkMsTUFBTSxLQUFLLEdBQUcsU0FBUyxDQUFDLFNBQWdCLENBQUM7UUFDekMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7WUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcs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Q0FBQyxPQUE2QixDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3BELENBQUM7Q0FRRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge09ic2VydmFibGV9IGZyb20gJ3J4anMnO1xuXG5pbXBvcnQge0V2ZW50RW1pdHRlcn0gZnJvbSAnLi4vZXZlbnRfZW1pdHRlcic7XG5pbXBvcnQge2FycmF5RXF1YWxzLCBmbGF0dGVufSBmcm9tICcuLi91dGlsL2FycmF5X3V0aWxzJztcbmltcG9ydCB7Z2V0U3ltYm9sSXRlcmF0b3J9IGZyb20gJy4uL3V0aWwvc3ltYm9sJztcblxuZnVuY3Rpb24gc3ltYm9sSXRlcmF0b3I8VD4odGhpczogUXVlcnlMaXN0PFQ+KTogSXRlcmF0b3I8VD4ge1xuICByZXR1cm4gKCh0aGlzIGFzIGFueSBhcyB7X3Jlc3VsdHM6IEFycmF5PFQ+fSkuX3Jlc3VsdHMgYXMgYW55KVtnZXRTeW1ib2xJdGVyYXRvcigpXSgpO1xufVxuXG4vKipcbiAqIEFuIHVubW9kaWZpYWJsZSBsaXN0IG9mIGl0ZW1zIHRoYXQgQW5ndWxhciBrZWVwcyB1cCB0byBkYXRlIHdoZW4gdGhlIHN0YXRlXG4gKiBvZiB0aGUgYXBwbGljYXRpb24gY2hhbmdlcy5cbiAqXG4gKiBUaGUgdHlwZSBvZiBvYmplY3QgdGhhdCB7QGxpbmsgVmlld0NoaWxkcmVufSwge0BsaW5rIENvbnRlbnRDaGlsZHJlbn0sIGFuZCB7QGxpbmsgUXVlcnlMaXN0fVxuICogcHJvdmlkZS5cbiAqXG4gKiBJbXBsZW1lbnRzIGFuIGl0ZXJhYmxlIGludGVyZmFjZSwgdGhlcmVmb3JlIGl0IGNhbiBiZSB1c2VkIGluIGJvdGggRVM2XG4gKiBqYXZhc2NyaXB0IGBmb3IgKHZhciBpIG9mIGl0ZW1zKWAgbG9vcHMgYXMgd2VsbCBhcyBpbiBBbmd1bGFyIHRlbXBsYXRlcyB3aXRoXG4gKiBgKm5nRm9yPVwibGV0IGkgb2YgbXlMaXN0XCJgLlxuICpcbiAqIENoYW5nZXMgY2FuIGJlIG9ic2VydmVkIGJ5IHN1YnNjcmliaW5nIHRvIHRoZSBjaGFuZ2VzIGBPYnNlcnZhYmxlYC5cbiAqXG4gKiBOT1RFOiBJbiB0aGUgZnV0dXJlIHRoaXMgY2xhc3Mgd2lsbCBpbXBsZW1lbnQgYW4gYE9ic2VydmFibGVgIGludGVyZmFjZS5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogIyMjIEV4YW1wbGVcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIEBDb21wb25lbnQoey4uLn0pXG4gKiBjbGFzcyBDb250YWluZXIge1xuICogICBAVmlld0NoaWxkcmVuKEl0ZW0pIGl0ZW1zOlF1ZXJ5TGlzdDxJdGVtPjtcbiAqIH1cbiAqIGBgYFxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIFF1ZXJ5TGlzdDxUPiBpbXBsZW1lbnRzIEl0ZXJhYmxlPFQ+IHtcbiAgcHVibGljIHJlYWRvbmx5IGRpcnR5ID0gdHJ1ZTtcbiAgcHJpdmF0ZSBfcmVzdWx0czogQXJyYXk8VD4gPSBbXTtcbiAgcHJpdmF0ZSBfY2hhbmdlc0RldGVjdGVkOiBib29sZWFuID0gZmFsc2U7XG4gIHByaXZhdGUgX2NoYW5nZXM6IEV2ZW50RW1pdHRlcjxRdWVyeUxpc3Q8VD4+fG51bGwgPSBudWxsO1xuXG4gIHJlYWRvbmx5IGxlbmd0aDogbnVtYmVyID0gMDtcbiAgcmVhZG9ubHkgZmlyc3Q6IFQgPSB1bmRlZmluZWQhO1xuICByZWFkb25seSBsYXN0OiBUID0gdW5kZWZpbmVkITtcblxuICAvKipcbiAgICogUmV0dXJucyBgT2JzZXJ2YWJsZWAgb2YgYFF1ZXJ5TGlzdGAgbm90aWZ5aW5nIHRoZSBzdWJzY3JpYmVyIG9mIGNoYW5nZXMuXG4gICAqL1xuICBnZXQgY2hhbmdlcygpOiBPYnNlcnZhYmxlPGFueT4ge1xuICAgIHJldHVybiB0aGlzLl9jaGFuZ2VzIHx8ICh0aGlzLl9jaGFuZ2VzID0gbmV3IEV2ZW50RW1pdHRlcigpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0gZW1pdERpc3RpbmN0Q2hhbmdlc09ubHkgV2hldGhlciBgUXVlcnlMaXN0LmNoYW5nZXNgIHNob3VsZCBmaXJlIG9ubHkgd2hlbiBhY3R1YWwgY2hhbmdlXG4gICAqICAgICBoYXMgb2NjdXJyZWQuIE9yIGlmIGl0IHNob3VsZCBmaXJlIHdoZW4gcXVlcnkgaXMgcmVjb21wdXRlZC4gKHJlY29tcHV0aW5nIGNvdWxkIHJlc29sdmUgaW5cbiAgICogICAgIHRoZSBzYW1lIHJlc3VsdClcbiAgICovXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2VtaXREaXN0aW5jdENoYW5nZXNPbmx5OiBib29sZWFuID0gZmFsc2UpIHtcbiAgICAvLyBUaGlzIGZ1bmN0aW9uIHNob3VsZCBiZSBkZWNsYXJlZCBvbiB0aGUgcHJvdG90eXBlLCBidXQgZG9pbmcgc28gdGhlcmUgd2lsbCBjYXVzZSB0aGUgY2xhc3NcbiAgICAvLyBkZWNsYXJhdGlvbiB0byBoYXZlIHNpZGUtZWZmZWN0cyBhbmQgYmVjb21lIG5vdCB0cmVlLXNoYWthYmxlLiBGb3IgdGhpcyByZWFzb24gd2UgZG8gaXQgaW5cbiAgICAvLyB0aGUgY29uc3RydWN0b3IuXG4gICAgLy8gW2dldFN5bWJvbEl0ZXJhdG9yKCldKCk6IEl0ZXJhdG9yPFQ+IHsgLi4uIH1cbiAgICBjb25zdCBzeW1ib2wgPSBnZXRTeW1ib2xJdGVyYXRvcigpO1xuICAgIGNvbnN0IHByb3RvID0gUXVlcnlMaXN0LnByb3RvdHlwZSBhcyBhbnk7XG4gICAgaWYgKCFwcm90b1tzeW1ib2xdKSBwcm90b1tzeW1ib2xdID0gc3ltYm9sSXRlcmF0b3I7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgUXVlcnlMaXN0IGVudHJ5IGF0IGBpbmRleGAuXG4gICAqL1xuICBnZXQoaW5kZXg6IG51bWJlcik6IFR8dW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5fcmVzdWx0c1tpbmRleF07XG4gIH1cblxuICAvKipcbiAgICogU2VlXG4gICAqIFtBcnJheS5tYXBdKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0FycmF5L21hcClcbiAgICovXG4gIG1hcDxVPihmbjogKGl0ZW06IFQsIGluZGV4OiBudW1iZXIsIGFycmF5OiBUW10pID0+IFUpOiBVW10ge1xuICAgIHJldHVybiB0aGlzLl9yZXN1bHRzLm1hcChmbik7XG4gIH1cblxuICAvKipcbiAgICogU2VlXG4gICAqIFtBcnJheS5maWx0ZXJdKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0FycmF5L2ZpbHRlcilcbiAgICovXG4gIGZpbHRlcihmbjogKGl0ZW06IFQsIGluZGV4OiBudW1iZXIsIGFycmF5OiBUW10pID0+IGJvb2xlYW4pOiBUW10ge1xuICAgIHJldHVybiB0aGlzLl9yZXN1bHRzLmZpbHRlcihmbik7XG4gIH1cblxuICAvKipcbiAgICogU2VlXG4gICAqIFtBcnJheS5maW5kXShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9BcnJheS9maW5kKVxuICAgKi9cbiAgZmluZChmbjogKGl0ZW06IFQsIGluZGV4OiBudW1iZXIsIGFycmF5OiBUW10pID0+IGJvb2xlYW4pOiBUfHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMuX3Jlc3VsdHMuZmluZChmbik7XG4gIH1cblxuICAvKipcbiAgICogU2VlXG4gICAqIFtBcnJheS5yZWR1Y2VdKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0FycmF5L3JlZHVjZSlcbiAgICovXG4gIHJlZHVjZTxVPihmbjogKHByZXZWYWx1ZTogVSwgY3VyVmFsdWU6IFQsIGN1ckluZGV4OiBudW1iZXIsIGFycmF5OiBUW10pID0+IFUsIGluaXQ6IFUpOiBVIHtcbiAgICByZXR1cm4gdGhpcy5fcmVzdWx0cy5yZWR1Y2UoZm4sIGluaXQpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlZVxuICAgKiBbQXJyYXkuZm9yRWFjaF0oaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvQXJyYXkvZm9yRWFjaClcbiAgICovXG4gIGZvckVhY2goZm46IChpdGVtOiBULCBpbmRleDogbnVtYmVyLCBhcnJheTogVFtdKSA9PiB2b2lkKTogdm9pZCB7XG4gICAgdGhpcy5fcmVzdWx0cy5mb3JFYWNoKGZuKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWVcbiAgICogW0FycmF5LnNvbWVdKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0FycmF5L3NvbWUpXG4gICAqL1xuICBzb21lKGZuOiAodmFsdWU6IFQsIGluZGV4OiBudW1iZXIsIGFycmF5OiBUW10pID0+IGJvb2xlYW4pOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fcmVzdWx0cy5zb21lKGZuKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgY29weSBvZiB0aGUgaW50ZXJuYWwgcmVzdWx0cyBsaXN0IGFzIGFuIEFycmF5LlxuICAgKi9cbiAgdG9BcnJheSgpOiBUW10ge1xuICAgIHJldHVybiB0aGlzLl9yZXN1bHRzLnNsaWNlKCk7XG4gIH1cblxuICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9yZXN1bHRzLnRvU3RyaW5nKCk7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyB0aGUgc3RvcmVkIGRhdGEgb2YgdGhlIHF1ZXJ5IGxpc3QsIGFuZCByZXNldHMgdGhlIGBkaXJ0eWAgZmxhZyB0byBgZmFsc2VgLCBzbyB0aGF0XG4gICAqIG9uIGNoYW5nZSBkZXRlY3Rpb24sIGl0IHdpbGwgbm90IG5vdGlmeSBvZiBjaGFuZ2VzIHRvIHRoZSBxdWVyaWVzLCB1bmxlc3MgYSBuZXcgY2hhbmdlXG4gICAqIG9jY3Vycy5cbiAgICpcbiAgICogQHBhcmFtIHJlc3VsdHNUcmVlIFRoZSBxdWVyeSByZXN1bHRzIHRvIHN0b3JlXG4gICAqIEBwYXJhbSBpZGVudGl0eUFjY2Vzc29yIE9wdGlvbmFsIGZ1bmN0aW9uIGZvciBleHRyYWN0aW5nIHN0YWJsZSBvYmplY3QgaWRlbnRpdHkgZnJvbSBhIHZhbHVlXG4gICAqICAgIGluIHRoZSBhcnJheS4gVGhpcyBmdW5jdGlvbiBpcyBleGVjdXRlZCBmb3IgZWFjaCBlbGVtZW50IG9mIHRoZSBxdWVyeSByZXN1bHQgbGlzdCB3aGlsZVxuICAgKiAgICBjb21wYXJpbmcgY3VycmVudCBxdWVyeSBsaXN0IHdpdGggdGhlIG5ldyBvbmUgKHByb3ZpZGVkIGFzIGEgZmlyc3QgYXJndW1lbnQgb2YgdGhlIGByZXNldGBcbiAgICogICAgZnVuY3Rpb24pIHRvIGRldGVjdCBpZiB0aGUgbGlzdHMgYXJlIGRpZmZlcmVudC4gSWYgdGhlIGZ1bmN0aW9uIGlzIG5vdCBwcm92aWRlZCwgZWxlbWVudHNcbiAgICogICAgYXJlIGNvbXBhcmVkIGFzIGlzICh3aXRob3V0IGFueSBwcmUtcHJvY2Vzc2luZykuXG4gICAqL1xuICByZXNldChyZXN1bHRzVHJlZTogQXJyYXk8VHxhbnlbXT4sIGlkZW50aXR5QWNjZXNzb3I/OiAodmFsdWU6IFQpID0+IHVua25vd24pOiB2b2lkIHtcbiAgICAvLyBDYXN0IHRvIGBRdWVyeUxpc3RJbnRlcm5hbGAgc28gdGhhdCB3ZSBjYW4gbXV0YXRlIGZpZWxkcyB3aGljaCBhcmUgcmVhZG9ubHkgZm9yIHRoZSB1c2FnZSBvZlxuICAgIC8vIFF1ZXJ5TGlzdCAoYnV0IG5vdCBmb3IgUXVlcnlMaXN0IGl0c2VsZi4pXG4gICAgY29uc3Qgc2VsZiA9IHRoaXMgYXMgUXVlcnlMaXN0SW50ZXJuYWw8VD47XG4gICAgKHNlbGYgYXMge2RpcnR5OiBib29sZWFufSkuZGlydHkgPSBmYWxzZTtcbiAgICBjb25zdCBuZXdSZXN1bHRGbGF0ID0gZmxhdHRlbihyZXN1bHRzVHJlZSk7XG4gICAgaWYgKHRoaXMuX2NoYW5nZXNEZXRlY3RlZCA9ICFhcnJheUVxdWFscyhzZWxmLl9yZXN1bHRzLCBuZXdSZXN1bHRGbGF0LCBpZGVudGl0eUFjY2Vzc29yKSkge1xuICAgICAgc2VsZi5fcmVzdWx0cyA9IG5ld1Jlc3VsdEZsYXQ7XG4gICAgICBzZWxmLmxlbmd0aCA9IG5ld1Jlc3VsdEZsYXQubGVuZ3RoO1xuICAgICAgc2VsZi5sYXN0ID0gbmV3UmVzdWx0RmxhdFt0aGlzLmxlbmd0aCAtIDFdO1xuICAgICAgc2VsZi5maXJzdCA9IG5ld1Jlc3VsdEZsYXRbMF07XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRyaWdnZXJzIGEgY2hhbmdlIGV2ZW50IGJ5IGVtaXR0aW5nIG9uIHRoZSBgY2hhbmdlc2Age0BsaW5rIEV2ZW50RW1pdHRlcn0uXG4gICAqL1xuICBub3RpZnlPbkNoYW5nZXMoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2NoYW5nZXMgJiYgKHRoaXMuX2NoYW5nZXNEZXRlY3RlZCB8fCAhdGhpcy5fZW1pdERpc3RpbmN0Q2hhbmdlc09ubHkpKVxuICAgICAgdGhpcy5fY2hhbmdlcy5lbWl0KHRoaXMpO1xuICB9XG5cbiAgLyoqIGludGVybmFsICovXG4gIHNldERpcnR5KCkge1xuICAgICh0aGlzIGFzIHtkaXJ0eTogYm9vbGVhbn0pLmRpcnR5ID0gdHJ1ZTtcbiAgfVxuXG4gIC8qKiBpbnRlcm5hbCAqL1xuICBkZXN0cm95KCk6IHZvaWQge1xuICAgICh0aGlzLmNoYW5nZXMgYXMgRXZlbnRFbWl0dGVyPGFueT4pLmNvbXBsZXRlKCk7XG4gICAgKHRoaXMuY2hhbmdlcyBhcyBFdmVudEVtaXR0ZXI8YW55PikudW5zdWJzY3JpYmUoKTtcbiAgfVxuXG4gIC8vIFRoZSBpbXBsZW1lbnRhdGlvbiBvZiBgU3ltYm9sLml0ZXJhdG9yYCBzaG91bGQgYmUgZGVjbGFyZWQgaGVyZSwgYnV0IHRoaXMgd291bGQgY2F1c2VcbiAgLy8gdHJlZS1zaGFraW5nIGlzc3VlcyB3aXRoIGBRdWVyeUxpc3QuIFNvIGluc3RlYWQsIGl0J3MgYWRkZWQgaW4gdGhlIGNvbnN0cnVjdG9yIChzZWUgY29tbWVudHNcbiAgLy8gdGhlcmUpIGFuZCB0aGlzIGRlY2xhcmF0aW9uIGlzIGxlZnQgaGVyZSB0byBlbnN1cmUgdGhhdCBUeXBlU2NyaXB0IGNvbnNpZGVycyBRdWVyeUxpc3QgdG9cbiAgLy8gaW1wbGVtZW50IHRoZSBJdGVyYWJsZSBpbnRlcmZhY2UuIFRoaXMgaXMgcmVxdWlyZWQgZm9yIHRlbXBsYXRlIHR5cGUtY2hlY2tpbmcgb2YgTmdGb3IgbG9vcHNcbiAgLy8gb3ZlciBRdWVyeUxpc3RzIHRvIHdvcmsgY29ycmVjdGx5LCBzaW5jZSBRdWVyeUxpc3QgbXVzdCBiZSBhc3NpZ25hYmxlIHRvIE5nSXRlcmFibGUuXG4gIFtTeW1ib2wuaXRlcmF0b3JdITogKCkgPT4gSXRlcmF0b3I8VD47XG59XG5cbi8qKlxuICogSW50ZXJuYWwgc2V0IG9mIEFQSXMgdXNlZCBieSB0aGUgZnJhbWV3b3JrLiAobm90IHRvIGJlIG1hZGUgcHVibGljKVxuICovXG5pbnRlcmZhY2UgUXVlcnlMaXN0SW50ZXJuYWw8VD4gZXh0ZW5kcyBRdWVyeUxpc3Q8VD4ge1xuICByZXNldChhOiBhbnlbXSk6IHZvaWQ7XG4gIG5vdGlmeU9uQ2hhbmdlcygpOiB2b2lkO1xuICBsZW5ndGg6IG51bWJlcjtcbiAgbGFzdDogVDtcbiAgZmlyc3Q6IFQ7XG59Il19