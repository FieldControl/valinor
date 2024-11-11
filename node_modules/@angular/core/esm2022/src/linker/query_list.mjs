/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
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
    static { Symbol.iterator; }
    /**
     * Returns `Observable` of `QueryList` notifying the subscriber of changes.
     */
    get changes() {
        return (this._changes ??= new EventEmitter());
    }
    /**
     * @param emitDistinctChangesOnly Whether `QueryList.changes` should fire only when actual change
     *     has occurred. Or if it should fire when query is recomputed. (recomputing could resolve in
     *     the same result)
     */
    constructor(_emitDistinctChangesOnly = false) {
        this._emitDistinctChangesOnly = _emitDistinctChangesOnly;
        this.dirty = true;
        this._onDirty = undefined;
        this._results = [];
        this._changesDetected = false;
        this._changes = undefined;
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
        this.dirty = false;
        const newResultFlat = flatten(resultsTree);
        if ((this._changesDetected = !arrayEquals(this._results, newResultFlat, identityAccessor))) {
            this._results = newResultFlat;
            this.length = newResultFlat.length;
            this.last = newResultFlat[this.length - 1];
            this.first = newResultFlat[0];
        }
    }
    /**
     * Triggers a change event by emitting on the `changes` {@link EventEmitter}.
     */
    notifyOnChanges() {
        if (this._changes !== undefined && (this._changesDetected || !this._emitDistinctChangesOnly))
            this._changes.emit(this);
    }
    /** @internal */
    onDirty(cb) {
        this._onDirty = cb;
    }
    /** internal */
    setDirty() {
        this.dirty = true;
        this._onDirty?.();
    }
    /** internal */
    destroy() {
        if (this._changes !== undefined) {
            this._changes.complete();
            this._changes.unsubscribe();
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVlcnlfbGlzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL2xpbmtlci9xdWVyeV9saXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUlILE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUU5QyxPQUFPLEVBQUMsV0FBVyxFQUFFLE9BQU8sRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBRXpELFNBQVMsY0FBYztJQUNyQiw4Q0FBOEM7SUFDOUMsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO0FBQzFDLENBQUM7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXlCRztBQUNILE1BQU0sT0FBTyxTQUFTO2FBMkpuQixNQUFNLENBQUMsUUFBUTtJQWhKaEI7O09BRUc7SUFDSCxJQUFJLE9BQU87UUFDVCxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsS0FBSyxJQUFJLFlBQVksRUFBRSxDQUFDLENBQUM7SUFDaEQsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxZQUFvQiwyQkFBb0MsS0FBSztRQUF6Qyw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQWlCO1FBdEI3QyxVQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ3JCLGFBQVEsR0FBZ0IsU0FBUyxDQUFDO1FBQ2xDLGFBQVEsR0FBYSxFQUFFLENBQUM7UUFDeEIscUJBQWdCLEdBQVksS0FBSyxDQUFDO1FBQ2xDLGFBQVEsR0FBMkMsU0FBUyxDQUFDO1FBRTVELFdBQU0sR0FBVyxDQUFDLENBQUM7UUFDbkIsVUFBSyxHQUFNLFNBQVUsQ0FBQztRQUN0QixTQUFJLEdBQU0sU0FBVSxDQUFDO1FBZTVCLDZGQUE2RjtRQUM3Riw2RkFBNkY7UUFDN0YsbUJBQW1CO1FBQ25CLDJDQUEyQztRQUMzQyxNQUFNLEtBQUssR0FBRyxTQUFTLENBQUMs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QUFPO1FBQ0wsSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLFNBQVMsRUFBRSxDQUFDO1lBQ2hDLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDekIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUM5QixDQUFDO0lBQ0gsQ0FBQztDQVFGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge09ic2VydmFibGV9IGZyb20gJ3J4anMnO1xuXG5pbXBvcnQge0V2ZW50RW1pdHRlcn0gZnJvbSAnLi4vZXZlbnRfZW1pdHRlcic7XG5pbXBvcnQge1dyaXRhYmxlfSBmcm9tICcuLi9pbnRlcmZhY2UvdHlwZSc7XG5pbXBvcnQge2FycmF5RXF1YWxzLCBmbGF0dGVufSBmcm9tICcuLi91dGlsL2FycmF5X3V0aWxzJztcblxuZnVuY3Rpb24gc3ltYm9sSXRlcmF0b3I8VD4odGhpczogUXVlcnlMaXN0PFQ+KTogSXRlcmF0b3I8VD4ge1xuICAvLyBAdHMtZXhwZWN0LWVycm9yIGFjY2Vzc2luZyBhIHByaXZhdGUgbWVtYmVyXG4gIHJldHVybiB0aGlzLl9yZXN1bHRzW1N5bWJvbC5pdGVyYXRvcl0oKTtcbn1cblxuLyoqXG4gKiBBbiB1bm1vZGlmaWFibGUgbGlzdCBvZiBpdGVtcyB0aGF0IEFuZ3VsYXIga2VlcHMgdXAgdG8gZGF0ZSB3aGVuIHRoZSBzdGF0ZVxuICogb2YgdGhlIGFwcGxpY2F0aW9uIGNoYW5nZXMuXG4gKlxuICogVGhlIHR5cGUgb2Ygb2JqZWN0IHRoYXQge0BsaW5rIFZpZXdDaGlsZHJlbn0sIHtAbGluayBDb250ZW50Q2hpbGRyZW59LCBhbmQge0BsaW5rIFF1ZXJ5TGlzdH1cbiAqIHByb3ZpZGUuXG4gKlxuICogSW1wbGVtZW50cyBhbiBpdGVyYWJsZSBpbnRlcmZhY2UsIHRoZXJlZm9yZSBpdCBjYW4gYmUgdXNlZCBpbiBib3RoIEVTNlxuICogamF2YXNjcmlwdCBgZm9yICh2YXIgaSBvZiBpdGVtcylgIGxvb3BzIGFzIHdlbGwgYXMgaW4gQW5ndWxhciB0ZW1wbGF0ZXMgd2l0aFxuICogYCpuZ0Zvcj1cImxldCBpIG9mIG15TGlzdFwiYC5cbiAqXG4gKiBDaGFuZ2VzIGNhbiBiZSBvYnNlcnZlZCBieSBzdWJzY3JpYmluZyB0byB0aGUgY2hhbmdlcyBgT2JzZXJ2YWJsZWAuXG4gKlxuICogTk9URTogSW4gdGhlIGZ1dHVyZSB0aGlzIGNsYXNzIHdpbGwgaW1wbGVtZW50IGFuIGBPYnNlcnZhYmxlYCBpbnRlcmZhY2UuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqICMjIyBFeGFtcGxlXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBAQ29tcG9uZW50KHsuLi59KVxuICogY2xhc3MgQ29udGFpbmVyIHtcbiAqICAgQFZpZXdDaGlsZHJlbihJdGVtKSBpdGVtczpRdWVyeUxpc3Q8SXRlbT47XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBRdWVyeUxpc3Q8VD4gaW1wbGVtZW50cyBJdGVyYWJsZTxUPiB7XG4gIHB1YmxpYyByZWFkb25seSBkaXJ0eSA9IHRydWU7XG4gIHByaXZhdGUgX29uRGlydHk/OiAoKSA9PiB2b2lkID0gdW5kZWZpbmVkO1xuICBwcml2YXRlIF9yZXN1bHRzOiBBcnJheTxUPiA9IFtdO1xuICBwcml2YXRlIF9jaGFuZ2VzRGV0ZWN0ZWQ6IGJvb2xlYW4gPSBmYWxzZTtcbiAgcHJpdmF0ZSBfY2hhbmdlczogRXZlbnRFbWl0dGVyPFF1ZXJ5TGlzdDxUPj4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG5cbiAgcmVhZG9ubHkgbGVuZ3RoOiBudW1iZXIgPSAwO1xuICByZWFkb25seSBmaXJzdDogVCA9IHVuZGVmaW5lZCE7XG4gIHJlYWRvbmx5IGxhc3Q6IFQgPSB1bmRlZmluZWQhO1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGBPYnNlcnZhYmxlYCBvZiBgUXVlcnlMaXN0YCBub3RpZnlpbmcgdGhlIHN1YnNjcmliZXIgb2YgY2hhbmdlcy5cbiAgICovXG4gIGdldCBjaGFuZ2VzKCk6IE9ic2VydmFibGU8YW55PiB7XG4gICAgcmV0dXJuICh0aGlzLl9jaGFuZ2VzID8/PSBuZXcgRXZlbnRFbWl0dGVyKCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBlbWl0RGlzdGluY3RDaGFuZ2VzT25seSBXaGV0aGVyIGBRdWVyeUxpc3QuY2hhbmdlc2Agc2hvdWxkIGZpcmUgb25seSB3aGVuIGFjdHVhbCBjaGFuZ2VcbiAgICogICAgIGhhcyBvY2N1cnJlZC4gT3IgaWYgaXQgc2hvdWxkIGZpcmUgd2hlbiBxdWVyeSBpcyByZWNvbXB1dGVkLiAocmVjb21wdXRpbmcgY291bGQgcmVzb2x2ZSBpblxuICAgKiAgICAgdGhlIHNhbWUgcmVzdWx0KVxuICAgKi9cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfZW1pdERpc3RpbmN0Q2hhbmdlc09ubHk6IGJvb2xlYW4gPSBmYWxzZSkge1xuICAgIC8vIFRoaXMgZnVuY3Rpb24gc2hvdWxkIGJlIGRlY2xhcmVkIG9uIHRoZSBwcm90b3R5cGUsIGJ1dCBkb2luZyBzbyB0aGVyZSB3aWxsIGNhdXNlIHRoZSBjbGFzc1xuICAgIC8vIGRlY2xhcmF0aW9uIHRvIGhhdmUgc2lkZS1lZmZlY3RzIGFuZCBiZWNvbWUgbm90IHRyZWUtc2hha2FibGUuIEZvciB0aGlzIHJlYXNvbiB3ZSBkbyBpdCBpblxuICAgIC8vIHRoZSBjb25zdHJ1Y3Rvci5cbiAgICAvLyBbU3ltYm9sLml0ZXJhdG9yXSgpOiBJdGVyYXRvcjxUPiB7IC4uLiB9XG4gICAgY29uc3QgcHJvdG8gPSBRdWVyeUxpc3QucHJvdG90eXBlO1xuICAgIGlmICghcHJvdG9bU3ltYm9sLml0ZXJhdG9yXSkgcHJvdG9bU3ltYm9sLml0ZXJhdG9yXSA9IHN5bWJvbEl0ZXJhdG9yO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIFF1ZXJ5TGlzdCBlbnRyeSBhdCBgaW5kZXhgLlxuICAgKi9cbiAgZ2V0KGluZGV4OiBudW1iZXIpOiBUIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5fcmVzdWx0c1tpbmRleF07XG4gIH1cblxuICAvKipcbiAgICogU2VlXG4gICAqIFtBcnJheS5tYXBdKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0FycmF5L21hcClcbiAgICovXG4gIG1hcDxVPihmbjogKGl0ZW06IFQsIGluZGV4OiBudW1iZXIsIGFycmF5OiBUW10pID0+IFUpOiBVW10ge1xuICAgIHJldHVybiB0aGlzLl9yZXN1bHRzLm1hcChmbik7XG4gIH1cblxuICAvKipcbiAgICogU2VlXG4gICAqIFtBcnJheS5maWx0ZXJdKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0FycmF5L2ZpbHRlcilcbiAgICovXG4gIGZpbHRlcjxTIGV4dGVuZHMgVD4ocHJlZGljYXRlOiAodmFsdWU6IFQsIGluZGV4OiBudW1iZXIsIGFycmF5OiByZWFkb25seSBUW10pID0+IHZhbHVlIGlzIFMpOiBTW107XG4gIGZpbHRlcihwcmVkaWNhdGU6ICh2YWx1ZTogVCwgaW5kZXg6IG51bWJlciwgYXJyYXk6IHJlYWRvbmx5IFRbXSkgPT4gdW5rbm93bik6IFRbXTtcbiAgZmlsdGVyKGZuOiAoaXRlbTogVCwgaW5kZXg6IG51bWJlciwgYXJyYXk6IFRbXSkgPT4gYm9vbGVhbik6IFRbXSB7XG4gICAgcmV0dXJuIHRoaXMuX3Jlc3VsdHMuZmlsdGVyKGZuKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWVcbiAgICogW0FycmF5LmZpbmRdKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0FycmF5L2ZpbmQpXG4gICAqL1xuICBmaW5kKGZuOiAoaXRlbTogVCwgaW5kZXg6IG51bWJlciwgYXJyYXk6IFRbXSkgPT4gYm9vbGVhbik6IFQgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLl9yZXN1bHRzLmZpbmQoZm4pO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlZVxuICAgKiBbQXJyYXkucmVkdWNlXShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9BcnJheS9yZWR1Y2UpXG4gICAqL1xuICByZWR1Y2U8VT4oZm46IChwcmV2VmFsdWU6IFUsIGN1clZhbHVlOiBULCBjdXJJbmRleDogbnVtYmVyLCBhcnJheTogVFtdKSA9PiBVLCBpbml0OiBVKTogVSB7XG4gICAgcmV0dXJuIHRoaXMuX3Jlc3VsdHMucmVkdWNlKGZuLCBpbml0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWVcbiAgICogW0FycmF5LmZvckVhY2hdKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0FycmF5L2ZvckVhY2gpXG4gICAqL1xuICBmb3JFYWNoKGZuOiAoaXRlbTogVCwgaW5kZXg6IG51bWJlciwgYXJyYXk6IFRbXSkgPT4gdm9pZCk6IHZvaWQge1xuICAgIHRoaXMuX3Jlc3VsdHMuZm9yRWFjaChmbik7XG4gIH1cblxuICAvKipcbiAgICogU2VlXG4gICAqIFtBcnJheS5zb21lXShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9BcnJheS9zb21lKVxuICAgKi9cbiAgc29tZShmbjogKHZhbHVlOiBULCBpbmRleDogbnVtYmVyLCBhcnJheTogVFtdKSA9PiBib29sZWFuKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX3Jlc3VsdHMuc29tZShmbik7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIGNvcHkgb2YgdGhlIGludGVybmFsIHJlc3VsdHMgbGlzdCBhcyBhbiBBcnJheS5cbiAgICovXG4gIHRvQXJyYXkoKTogVFtdIHtcbiAgICByZXR1cm4gdGhpcy5fcmVzdWx0cy5zbGljZSgpO1xuICB9XG5cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fcmVzdWx0cy50b1N0cmluZygpO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIHN0b3JlZCBkYXRhIG9mIHRoZSBxdWVyeSBsaXN0LCBhbmQgcmVzZXRzIHRoZSBgZGlydHlgIGZsYWcgdG8gYGZhbHNlYCwgc28gdGhhdFxuICAgKiBvbiBjaGFuZ2UgZGV0ZWN0aW9uLCBpdCB3aWxsIG5vdCBub3RpZnkgb2YgY2hhbmdlcyB0byB0aGUgcXVlcmllcywgdW5sZXNzIGEgbmV3IGNoYW5nZVxuICAgKiBvY2N1cnMuXG4gICAqXG4gICAqIEBwYXJhbSByZXN1bHRzVHJlZSBUaGUgcXVlcnkgcmVzdWx0cyB0byBzdG9yZVxuICAgKiBAcGFyYW0gaWRlbnRpdHlBY2Nlc3NvciBPcHRpb25hbCBmdW5jdGlvbiBmb3IgZXh0cmFjdGluZyBzdGFibGUgb2JqZWN0IGlkZW50aXR5IGZyb20gYSB2YWx1ZVxuICAgKiAgICBpbiB0aGUgYXJyYXkuIFRoaXMgZnVuY3Rpb24gaXMgZXhlY3V0ZWQgZm9yIGVhY2ggZWxlbWVudCBvZiB0aGUgcXVlcnkgcmVzdWx0IGxpc3Qgd2hpbGVcbiAgICogICAgY29tcGFyaW5nIGN1cnJlbnQgcXVlcnkgbGlzdCB3aXRoIHRoZSBuZXcgb25lIChwcm92aWRlZCBhcyBhIGZpcnN0IGFyZ3VtZW50IG9mIHRoZSBgcmVzZXRgXG4gICAqICAgIGZ1bmN0aW9uKSB0byBkZXRlY3QgaWYgdGhlIGxpc3RzIGFyZSBkaWZmZXJlbnQuIElmIHRoZSBmdW5jdGlvbiBpcyBub3QgcHJvdmlkZWQsIGVsZW1lbnRzXG4gICAqICAgIGFyZSBjb21wYXJlZCBhcyBpcyAod2l0aG91dCBhbnkgcHJlLXByb2Nlc3NpbmcpLlxuICAgKi9cbiAgcmVzZXQocmVzdWx0c1RyZWU6IEFycmF5PFQgfCBhbnlbXT4sIGlkZW50aXR5QWNjZXNzb3I/OiAodmFsdWU6IFQpID0+IHVua25vd24pOiB2b2lkIHtcbiAgICAodGhpcyBhcyB7ZGlydHk6IGJvb2xlYW59KS5kaXJ0eSA9IGZhbHNlO1xuICAgIGNvbnN0IG5ld1Jlc3VsdEZsYXQgPSBmbGF0dGVuKHJlc3VsdHNUcmVlKTtcbiAgICBpZiAoKHRoaXMuX2NoYW5nZXNEZXRlY3RlZCA9ICFhcnJheUVxdWFscyh0aGlzLl9yZXN1bHRzLCBuZXdSZXN1bHRGbGF0LCBpZGVudGl0eUFjY2Vzc29yKSkpIHtcbiAgICAgIHRoaXMuX3Jlc3VsdHMgPSBuZXdSZXN1bHRGbGF0O1xuICAgICAgKHRoaXMgYXMgV3JpdGFibGU8dGhpcz4pLmxlbmd0aCA9IG5ld1Jlc3VsdEZsYXQubGVuZ3RoO1xuICAgICAgKHRoaXMgYXMgV3JpdGFibGU8dGhpcz4pLmxhc3QgPSBuZXdSZXN1bHRGbGF0W3RoaXMubGVuZ3RoIC0gMV07XG4gICAgICAodGhpcyBhcyBXcml0YWJsZTx0aGlzPikuZmlyc3QgPSBuZXdSZXN1bHRGbGF0WzBdO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUcmlnZ2VycyBhIGNoYW5nZSBldmVudCBieSBlbWl0dGluZyBvbiB0aGUgYGNoYW5nZXNgIHtAbGluayBFdmVudEVtaXR0ZXJ9LlxuICAgKi9cbiAgbm90aWZ5T25DaGFuZ2VzKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9jaGFuZ2VzICE9PSB1bmRlZmluZWQgJiYgKHRoaXMuX2NoYW5nZXNEZXRlY3RlZCB8fCAhdGhpcy5fZW1pdERpc3RpbmN0Q2hhbmdlc09ubHkpKVxuICAgICAgdGhpcy5fY2hhbmdlcy5lbWl0KHRoaXMpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBvbkRpcnR5KGNiOiAoKSA9PiB2b2lkKSB7XG4gICAgdGhpcy5fb25EaXJ0eSA9IGNiO1xuICB9XG5cbiAgLyoqIGludGVybmFsICovXG4gIHNldERpcnR5KCkge1xuICAgICh0aGlzIGFzIHtkaXJ0eTogYm9vbGVhbn0pLmRpcnR5ID0gdHJ1ZTtcbiAgICB0aGlzLl9vbkRpcnR5Py4oKTtcbiAgfVxuXG4gIC8qKiBpbnRlcm5hbCAqL1xuICBkZXN0cm95KCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9jaGFuZ2VzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuX2NoYW5nZXMuY29tcGxldGUoKTtcbiAgICAgIHRoaXMuX2NoYW5nZXMudW5zdWJzY3JpYmUoKTtcbiAgICB9XG4gIH1cblxuICAvLyBUaGUgaW1wbGVtZW50YXRpb24gb2YgYFN5bWJvbC5pdGVyYXRvcmAgc2hvdWxkIGJlIGRlY2xhcmVkIGhlcmUsIGJ1dCB0aGlzIHdvdWxkIGNhdXNlXG4gIC8vIHRyZWUtc2hha2luZyBpc3N1ZXMgd2l0aCBgUXVlcnlMaXN0LiBTbyBpbnN0ZWFkLCBpdCdzIGFkZGVkIGluIHRoZSBjb25zdHJ1Y3RvciAoc2VlIGNvbW1lbnRzXG4gIC8vIHRoZXJlKSBhbmQgdGhpcyBkZWNsYXJhdGlvbiBpcyBsZWZ0IGhlcmUgdG8gZW5zdXJlIHRoYXQgVHlwZVNjcmlwdCBjb25zaWRlcnMgUXVlcnlMaXN0IHRvXG4gIC8vIGltcGxlbWVudCB0aGUgSXRlcmFibGUgaW50ZXJmYWNlLiBUaGlzIGlzIHJlcXVpcmVkIGZvciB0ZW1wbGF0ZSB0eXBlLWNoZWNraW5nIG9mIE5nRm9yIGxvb3BzXG4gIC8vIG92ZXIgUXVlcnlMaXN0cyB0byB3b3JrIGNvcnJlY3RseSwgc2luY2UgUXVlcnlMaXN0IG11c3QgYmUgYXNzaWduYWJsZSB0byBOZ0l0ZXJhYmxlLlxuICBbU3ltYm9sLml0ZXJhdG9yXSE6ICgpID0+IEl0ZXJhdG9yPFQ+O1xufVxuIl19