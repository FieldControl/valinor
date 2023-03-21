/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { EventEmitter } from '../event_emitter';
import { arrayEquals, flatten } from '../util/array_utils';
function symbolIterator() {
    // @ts-expect-error accessing a private member
    return this._results[Symbol.iterator]();
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
     * Returns `Observable` of `QueryList` notifying the subscriber of changes.
     */
    get changes() {
        return this._changes || (this._changes = new EventEmitter());
    }
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
        // [Symbol.iterator](): Iterator<T> { ... }
        const proto = QueryList.prototype;
        if (!proto[Symbol.iterator])
            proto[Symbol.iterator] = symbolIterator;
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
Symbol.iterator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVlcnlfbGlzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL2xpbmtlci9xdWVyeV9saXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUlILE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUM5QyxPQUFPLEVBQUMsV0FBVyxFQUFFLE9BQU8sRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBRXpELFNBQVMsY0FBYztJQUNyQiw4Q0FBOEM7SUFDOUMsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO0FBQzFDLENBQUM7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXlCRztBQUNILE1BQU0sT0FBTyxTQUFTO0lBVXBCOztPQUVHO0lBQ0gsSUFBSSxPQUFPO1FBQ1QsT0FBTyxJQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLFlBQVksRUFBRSxDQUFDLENBQUM7SUFDL0QsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxZQUFvQiwyQkFBb0MsS0FBSztRQUF6Qyw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQWlCO1FBckI3QyxVQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ3JCLGFBQVEsR0FBYSxFQUFFLENBQUM7UUFDeEIscUJBQWdCLEdBQVksS0FBSyxDQUFDO1FBQ2xDLGFBQVEsR0FBb0MsSUFBSSxDQUFDO1FBRWhELFdBQU0sR0FBVyxDQUFDLENBQUM7UUFDbkIsVUFBSyxHQUFNLFNBQVUsQ0FBQztRQUN0QixTQUFJLEdBQU0sU0FBVSxDQUFDO1FBZTVCLDZGQUE2RjtRQUM3Riw2RkFBNkY7UUFDN0YsbUJBQW1CO1FBQ25CLDJDQUEyQztRQUMzQyxNQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxLQUFL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QUFNLENBQUMsUUFBUSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge09ic2VydmFibGV9IGZyb20gJ3J4anMnO1xuXG5pbXBvcnQge0V2ZW50RW1pdHRlcn0gZnJvbSAnLi4vZXZlbnRfZW1pdHRlcic7XG5pbXBvcnQge2FycmF5RXF1YWxzLCBmbGF0dGVufSBmcm9tICcuLi91dGlsL2FycmF5X3V0aWxzJztcblxuZnVuY3Rpb24gc3ltYm9sSXRlcmF0b3I8VD4odGhpczogUXVlcnlMaXN0PFQ+KTogSXRlcmF0b3I8VD4ge1xuICAvLyBAdHMtZXhwZWN0LWVycm9yIGFjY2Vzc2luZyBhIHByaXZhdGUgbWVtYmVyXG4gIHJldHVybiB0aGlzLl9yZXN1bHRzW1N5bWJvbC5pdGVyYXRvcl0oKTtcbn1cblxuLyoqXG4gKiBBbiB1bm1vZGlmaWFibGUgbGlzdCBvZiBpdGVtcyB0aGF0IEFuZ3VsYXIga2VlcHMgdXAgdG8gZGF0ZSB3aGVuIHRoZSBzdGF0ZVxuICogb2YgdGhlIGFwcGxpY2F0aW9uIGNoYW5nZXMuXG4gKlxuICogVGhlIHR5cGUgb2Ygb2JqZWN0IHRoYXQge0BsaW5rIFZpZXdDaGlsZHJlbn0sIHtAbGluayBDb250ZW50Q2hpbGRyZW59LCBhbmQge0BsaW5rIFF1ZXJ5TGlzdH1cbiAqIHByb3ZpZGUuXG4gKlxuICogSW1wbGVtZW50cyBhbiBpdGVyYWJsZSBpbnRlcmZhY2UsIHRoZXJlZm9yZSBpdCBjYW4gYmUgdXNlZCBpbiBib3RoIEVTNlxuICogamF2YXNjcmlwdCBgZm9yICh2YXIgaSBvZiBpdGVtcylgIGxvb3BzIGFzIHdlbGwgYXMgaW4gQW5ndWxhciB0ZW1wbGF0ZXMgd2l0aFxuICogYCpuZ0Zvcj1cImxldCBpIG9mIG15TGlzdFwiYC5cbiAqXG4gKiBDaGFuZ2VzIGNhbiBiZSBvYnNlcnZlZCBieSBzdWJzY3JpYmluZyB0byB0aGUgY2hhbmdlcyBgT2JzZXJ2YWJsZWAuXG4gKlxuICogTk9URTogSW4gdGhlIGZ1dHVyZSB0aGlzIGNsYXNzIHdpbGwgaW1wbGVtZW50IGFuIGBPYnNlcnZhYmxlYCBpbnRlcmZhY2UuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqICMjIyBFeGFtcGxlXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBAQ29tcG9uZW50KHsuLi59KVxuICogY2xhc3MgQ29udGFpbmVyIHtcbiAqICAgQFZpZXdDaGlsZHJlbihJdGVtKSBpdGVtczpRdWVyeUxpc3Q8SXRlbT47XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBRdWVyeUxpc3Q8VD4gaW1wbGVtZW50cyBJdGVyYWJsZTxUPiB7XG4gIHB1YmxpYyByZWFkb25seSBkaXJ0eSA9IHRydWU7XG4gIHByaXZhdGUgX3Jlc3VsdHM6IEFycmF5PFQ+ID0gW107XG4gIHByaXZhdGUgX2NoYW5nZXNEZXRlY3RlZDogYm9vbGVhbiA9IGZhbHNlO1xuICBwcml2YXRlIF9jaGFuZ2VzOiBFdmVudEVtaXR0ZXI8UXVlcnlMaXN0PFQ+PnxudWxsID0gbnVsbDtcblxuICByZWFkb25seSBsZW5ndGg6IG51bWJlciA9IDA7XG4gIHJlYWRvbmx5IGZpcnN0OiBUID0gdW5kZWZpbmVkITtcbiAgcmVhZG9ubHkgbGFzdDogVCA9IHVuZGVmaW5lZCE7XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYE9ic2VydmFibGVgIG9mIGBRdWVyeUxpc3RgIG5vdGlmeWluZyB0aGUgc3Vic2NyaWJlciBvZiBjaGFuZ2VzLlxuICAgKi9cbiAgZ2V0IGNoYW5nZXMoKTogT2JzZXJ2YWJsZTxhbnk+IHtcbiAgICByZXR1cm4gdGhpcy5fY2hhbmdlcyB8fCAodGhpcy5fY2hhbmdlcyA9IG5ldyBFdmVudEVtaXR0ZXIoKSk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIGVtaXREaXN0aW5jdENoYW5nZXNPbmx5IFdoZXRoZXIgYFF1ZXJ5TGlzdC5jaGFuZ2VzYCBzaG91bGQgZmlyZSBvbmx5IHdoZW4gYWN0dWFsIGNoYW5nZVxuICAgKiAgICAgaGFzIG9jY3VycmVkLiBPciBpZiBpdCBzaG91bGQgZmlyZSB3aGVuIHF1ZXJ5IGlzIHJlY29tcHV0ZWQuIChyZWNvbXB1dGluZyBjb3VsZCByZXNvbHZlIGluXG4gICAqICAgICB0aGUgc2FtZSByZXN1bHQpXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9lbWl0RGlzdGluY3RDaGFuZ2VzT25seTogYm9vbGVhbiA9IGZhbHNlKSB7XG4gICAgLy8gVGhpcyBmdW5jdGlvbiBzaG91bGQgYmUgZGVjbGFyZWQgb24gdGhlIHByb3RvdHlwZSwgYnV0IGRvaW5nIHNvIHRoZXJlIHdpbGwgY2F1c2UgdGhlIGNsYXNzXG4gICAgLy8gZGVjbGFyYXRpb24gdG8gaGF2ZSBzaWRlLWVmZmVjdHMgYW5kIGJlY29tZSBub3QgdHJlZS1zaGFrYWJsZS4gRm9yIHRoaXMgcmVhc29uIHdlIGRvIGl0IGluXG4gICAgLy8gdGhlIGNvbnN0cnVjdG9yLlxuICAgIC8vIFtTeW1ib2wuaXRlcmF0b3JdKCk6IEl0ZXJhdG9yPFQ+IHsgLi4uIH1cbiAgICBjb25zdCBwcm90byA9IFF1ZXJ5TGlzdC5wcm90b3R5cGU7XG4gICAgaWYgKCFwcm90b1tTeW1ib2wuaXRlcmF0b3JdKSBwcm90b1tTeW1ib2wuaXRlcmF0b3JdID0gc3ltYm9sSXRlcmF0b3I7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgUXVlcnlMaXN0IGVudHJ5IGF0IGBpbmRleGAuXG4gICAqL1xuICBnZXQoaW5kZXg6IG51bWJlcik6IFR8dW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5fcmVzdWx0c1tpbmRleF07XG4gIH1cblxuICAvKipcbiAgICogU2VlXG4gICAqIFtBcnJheS5tYXBdKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0FycmF5L21hcClcbiAgICovXG4gIG1hcDxVPihmbjogKGl0ZW06IFQsIGluZGV4OiBudW1iZXIsIGFycmF5OiBUW10pID0+IFUpOiBVW10ge1xuICAgIHJldHVybiB0aGlzLl9yZXN1bHRzLm1hcChmbik7XG4gIH1cblxuICAvKipcbiAgICogU2VlXG4gICAqIFtBcnJheS5maWx0ZXJdKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0FycmF5L2ZpbHRlcilcbiAgICovXG4gIGZpbHRlcihmbjogKGl0ZW06IFQsIGluZGV4OiBudW1iZXIsIGFycmF5OiBUW10pID0+IGJvb2xlYW4pOiBUW10ge1xuICAgIHJldHVybiB0aGlzLl9yZXN1bHRzLmZpbHRlcihmbik7XG4gIH1cblxuICAvKipcbiAgICogU2VlXG4gICAqIFtBcnJheS5maW5kXShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9BcnJheS9maW5kKVxuICAgKi9cbiAgZmluZChmbjogKGl0ZW06IFQsIGluZGV4OiBudW1iZXIsIGFycmF5OiBUW10pID0+IGJvb2xlYW4pOiBUfHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMuX3Jlc3VsdHMuZmluZChmbik7XG4gIH1cblxuICAvKipcbiAgICogU2VlXG4gICAqIFtBcnJheS5yZWR1Y2VdKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0FycmF5L3JlZHVjZSlcbiAgICovXG4gIHJlZHVjZTxVPihmbjogKHByZXZWYWx1ZTogVSwgY3VyVmFsdWU6IFQsIGN1ckluZGV4OiBudW1iZXIsIGFycmF5OiBUW10pID0+IFUsIGluaXQ6IFUpOiBVIHtcbiAgICByZXR1cm4gdGhpcy5fcmVzdWx0cy5yZWR1Y2UoZm4sIGluaXQpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlZVxuICAgKiBbQXJyYXkuZm9yRWFjaF0oaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvQXJyYXkvZm9yRWFjaClcbiAgICovXG4gIGZvckVhY2goZm46IChpdGVtOiBULCBpbmRleDogbnVtYmVyLCBhcnJheTogVFtdKSA9PiB2b2lkKTogdm9pZCB7XG4gICAgdGhpcy5fcmVzdWx0cy5mb3JFYWNoKGZuKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWVcbiAgICogW0FycmF5LnNvbWVdKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0FycmF5L3NvbWUpXG4gICAqL1xuICBzb21lKGZuOiAodmFsdWU6IFQsIGluZGV4OiBudW1iZXIsIGFycmF5OiBUW10pID0+IGJvb2xlYW4pOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fcmVzdWx0cy5zb21lKGZuKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgY29weSBvZiB0aGUgaW50ZXJuYWwgcmVzdWx0cyBsaXN0IGFzIGFuIEFycmF5LlxuICAgKi9cbiAgdG9BcnJheSgpOiBUW10ge1xuICAgIHJldHVybiB0aGlzLl9yZXN1bHRzLnNsaWNlKCk7XG4gIH1cblxuICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9yZXN1bHRzLnRvU3RyaW5nKCk7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyB0aGUgc3RvcmVkIGRhdGEgb2YgdGhlIHF1ZXJ5IGxpc3QsIGFuZCByZXNldHMgdGhlIGBkaXJ0eWAgZmxhZyB0byBgZmFsc2VgLCBzbyB0aGF0XG4gICAqIG9uIGNoYW5nZSBkZXRlY3Rpb24sIGl0IHdpbGwgbm90IG5vdGlmeSBvZiBjaGFuZ2VzIHRvIHRoZSBxdWVyaWVzLCB1bmxlc3MgYSBuZXcgY2hhbmdlXG4gICAqIG9jY3Vycy5cbiAgICpcbiAgICogQHBhcmFtIHJlc3VsdHNUcmVlIFRoZSBxdWVyeSByZXN1bHRzIHRvIHN0b3JlXG4gICAqIEBwYXJhbSBpZGVudGl0eUFjY2Vzc29yIE9wdGlvbmFsIGZ1bmN0aW9uIGZvciBleHRyYWN0aW5nIHN0YWJsZSBvYmplY3QgaWRlbnRpdHkgZnJvbSBhIHZhbHVlXG4gICAqICAgIGluIHRoZSBhcnJheS4gVGhpcyBmdW5jdGlvbiBpcyBleGVjdXRlZCBmb3IgZWFjaCBlbGVtZW50IG9mIHRoZSBxdWVyeSByZXN1bHQgbGlzdCB3aGlsZVxuICAgKiAgICBjb21wYXJpbmcgY3VycmVudCBxdWVyeSBsaXN0IHdpdGggdGhlIG5ldyBvbmUgKHByb3ZpZGVkIGFzIGEgZmlyc3QgYXJndW1lbnQgb2YgdGhlIGByZXNldGBcbiAgICogICAgZnVuY3Rpb24pIHRvIGRldGVjdCBpZiB0aGUgbGlzdHMgYXJlIGRpZmZlcmVudC4gSWYgdGhlIGZ1bmN0aW9uIGlzIG5vdCBwcm92aWRlZCwgZWxlbWVudHNcbiAgICogICAgYXJlIGNvbXBhcmVkIGFzIGlzICh3aXRob3V0IGFueSBwcmUtcHJvY2Vzc2luZykuXG4gICAqL1xuICByZXNldChyZXN1bHRzVHJlZTogQXJyYXk8VHxhbnlbXT4sIGlkZW50aXR5QWNjZXNzb3I/OiAodmFsdWU6IFQpID0+IHVua25vd24pOiB2b2lkIHtcbiAgICAvLyBDYXN0IHRvIGBRdWVyeUxpc3RJbnRlcm5hbGAgc28gdGhhdCB3ZSBjYW4gbXV0YXRlIGZpZWxkcyB3aGljaCBhcmUgcmVhZG9ubHkgZm9yIHRoZSB1c2FnZSBvZlxuICAgIC8vIFF1ZXJ5TGlzdCAoYnV0IG5vdCBmb3IgUXVlcnlMaXN0IGl0c2VsZi4pXG4gICAgY29uc3Qgc2VsZiA9IHRoaXMgYXMgUXVlcnlMaXN0SW50ZXJuYWw8VD47XG4gICAgKHNlbGYgYXMge2RpcnR5OiBib29sZWFufSkuZGlydHkgPSBmYWxzZTtcbiAgICBjb25zdCBuZXdSZXN1bHRGbGF0ID0gZmxhdHRlbihyZXN1bHRzVHJlZSk7XG4gICAgaWYgKHRoaXMuX2NoYW5nZXNEZXRlY3RlZCA9ICFhcnJheUVxdWFscyhzZWxmLl9yZXN1bHRzLCBuZXdSZXN1bHRGbGF0LCBpZGVudGl0eUFjY2Vzc29yKSkge1xuICAgICAgc2VsZi5fcmVzdWx0cyA9IG5ld1Jlc3VsdEZsYXQ7XG4gICAgICBzZWxmLmxlbmd0aCA9IG5ld1Jlc3VsdEZsYXQubGVuZ3RoO1xuICAgICAgc2VsZi5sYXN0ID0gbmV3UmVzdWx0RmxhdFt0aGlzLmxlbmd0aCAtIDFdO1xuICAgICAgc2VsZi5maXJzdCA9IG5ld1Jlc3VsdEZsYXRbMF07XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRyaWdnZXJzIGEgY2hhbmdlIGV2ZW50IGJ5IGVtaXR0aW5nIG9uIHRoZSBgY2hhbmdlc2Age0BsaW5rIEV2ZW50RW1pdHRlcn0uXG4gICAqL1xuICBub3RpZnlPbkNoYW5nZXMoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2NoYW5nZXMgJiYgKHRoaXMuX2NoYW5nZXNEZXRlY3RlZCB8fCAhdGhpcy5fZW1pdERpc3RpbmN0Q2hhbmdlc09ubHkpKVxuICAgICAgdGhpcy5fY2hhbmdlcy5lbWl0KHRoaXMpO1xuICB9XG5cbiAgLyoqIGludGVybmFsICovXG4gIHNldERpcnR5KCkge1xuICAgICh0aGlzIGFzIHtkaXJ0eTogYm9vbGVhbn0pLmRpcnR5ID0gdHJ1ZTtcbiAgfVxuXG4gIC8qKiBpbnRlcm5hbCAqL1xuICBkZXN0cm95KCk6IHZvaWQge1xuICAgICh0aGlzLmNoYW5nZXMgYXMgRXZlbnRFbWl0dGVyPGFueT4pLmNvbXBsZXRlKCk7XG4gICAgKHRoaXMuY2hhbmdlcyBhcyBFdmVudEVtaXR0ZXI8YW55PikudW5zdWJzY3JpYmUoKTtcbiAgfVxuXG4gIC8vIFRoZSBpbXBsZW1lbnRhdGlvbiBvZiBgU3ltYm9sLml0ZXJhdG9yYCBzaG91bGQgYmUgZGVjbGFyZWQgaGVyZSwgYnV0IHRoaXMgd291bGQgY2F1c2VcbiAgLy8gdHJlZS1zaGFraW5nIGlzc3VlcyB3aXRoIGBRdWVyeUxpc3QuIFNvIGluc3RlYWQsIGl0J3MgYWRkZWQgaW4gdGhlIGNvbnN0cnVjdG9yIChzZWUgY29tbWVudHNcbiAgLy8gdGhlcmUpIGFuZCB0aGlzIGRlY2xhcmF0aW9uIGlzIGxlZnQgaGVyZSB0byBlbnN1cmUgdGhhdCBUeXBlU2NyaXB0IGNvbnNpZGVycyBRdWVyeUxpc3QgdG9cbiAgLy8gaW1wbGVtZW50IHRoZSBJdGVyYWJsZSBpbnRlcmZhY2UuIFRoaXMgaXMgcmVxdWlyZWQgZm9yIHRlbXBsYXRlIHR5cGUtY2hlY2tpbmcgb2YgTmdGb3IgbG9vcHNcbiAgLy8gb3ZlciBRdWVyeUxpc3RzIHRvIHdvcmsgY29ycmVjdGx5LCBzaW5jZSBRdWVyeUxpc3QgbXVzdCBiZSBhc3NpZ25hYmxlIHRvIE5nSXRlcmFibGUuXG4gIFtTeW1ib2wuaXRlcmF0b3JdITogKCkgPT4gSXRlcmF0b3I8VD47XG59XG5cbi8qKlxuICogSW50ZXJuYWwgc2V0IG9mIEFQSXMgdXNlZCBieSB0aGUgZnJhbWV3b3JrLiAobm90IHRvIGJlIG1hZGUgcHVibGljKVxuICovXG5pbnRlcmZhY2UgUXVlcnlMaXN0SW50ZXJuYWw8VD4gZXh0ZW5kcyBRdWVyeUxpc3Q8VD4ge1xuICByZXNldChhOiBhbnlbXSk6IHZvaWQ7XG4gIG5vdGlmeU9uQ2hhbmdlcygpOiB2b2lkO1xuICBsZW5ndGg6IG51bWJlcjtcbiAgbGFzdDogVDtcbiAgZmlyc3Q6IFQ7XG59XG4iXX0=