/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { formatRuntimeError } from '../errors';
import { assertNotSame } from '../util/assert';
import { stringifyForError } from './util/stringify_utils';
/**
 * A type representing the live collection to be reconciled with any new (incoming) collection. This
 * is an adapter class that makes it possible to work with different internal data structures,
 * regardless of the actual values of the incoming collection.
 */
export class LiveCollection {
    destroy(item) {
        // noop by default
    }
    updateValue(index, value) {
        // noop by default
    }
    // operations below could be implemented on top of the operations defined so far, but having
    // them explicitly allow clear expression of intent and potentially more performant
    // implementations
    swap(index1, index2) {
        const startIdx = Math.min(index1, index2);
        const endIdx = Math.max(index1, index2);
        const endItem = this.detach(endIdx);
        if (endIdx - startIdx > 1) {
            const startItem = this.detach(startIdx);
            this.attach(startIdx, endItem);
            this.attach(endIdx, startItem);
        }
        else {
            this.attach(startIdx, endItem);
        }
    }
    move(prevIndex, newIdx) {
        this.attach(newIdx, this.detach(prevIndex));
    }
}
function valuesMatching(liveIdx, liveValue, newIdx, newValue, trackBy) {
    if (liveIdx === newIdx && Object.is(liveValue, newValue)) {
        // matching and no value identity to update
        return 1;
    }
    else if (Object.is(trackBy(liveIdx, liveValue), trackBy(newIdx, newValue))) {
        // matching but requires value identity update
        return -1;
    }
    return 0;
}
function recordDuplicateKeys(keyToIdx, key, idx) {
    const idxSoFar = keyToIdx.get(key);
    if (idxSoFar !== undefined) {
        idxSoFar.add(idx);
    }
    else {
        keyToIdx.set(key, new Set([idx]));
    }
}
/**
 * The live collection reconciliation algorithm that perform various in-place operations, so it
 * reflects the content of the new (incoming) collection.
 *
 * The reconciliation algorithm has 2 code paths:
 * - "fast" path that don't require any memory allocation;
 * - "slow" path that requires additional memory allocation for intermediate data structures used to
 * collect additional information about the live collection.
 * It might happen that the algorithm switches between the two modes in question in a single
 * reconciliation path - generally it tries to stay on the "fast" path as much as possible.
 *
 * The overall complexity of the algorithm is O(n + m) for speed and O(n) for memory (where n is the
 * length of the live collection and m is the length of the incoming collection). Given the problem
 * at hand the complexity / performance constraints makes it impossible to perform the absolute
 * minimum of operation to reconcile the 2 collections. The algorithm makes different tradeoffs to
 * stay within reasonable performance bounds and may apply sub-optimal number of operations in
 * certain situations.
 *
 * @param liveCollection the current, live collection;
 * @param newCollection the new, incoming collection;
 * @param trackByFn key generation function that determines equality between items in the life and
 *     incoming collection;
 */
export function reconcile(liveCollection, newCollection, trackByFn) {
    let detachedItems = undefined;
    let liveKeysInTheFuture = undefined;
    let liveStartIdx = 0;
    let liveEndIdx = liveCollection.length - 1;
    const duplicateKeys = ngDevMode ? new Map() : undefined;
    if (Array.isArray(newCollection)) {
        let newEndIdx = newCollection.length - 1;
        while (liveStartIdx <= liveEndIdx && liveStartIdx <= newEndIdx) {
            // compare from the beginning
            const liveStartValue = liveCollection.at(liveStartIdx);
            const newStartValue = newCollection[liveStartIdx];
            if (ngDevMode) {
                recordDuplicateKeys(duplicateKeys, trackByFn(liveStartIdx, newStartValue), liveStartIdx);
            }
            const isStartMatching = valuesMatching(liveStartIdx, liveStartValue, liveStartIdx, newStartValue, trackByFn);
            if (isStartMatching !== 0) {
                if (isStartMatching < 0) {
                    liveCollection.updateValue(liveStartIdx, newStartValue);
                }
                liveStartIdx++;
                continue;
            }
            // compare from the end
            // TODO(perf): do _all_ the matching from the end
            const liveEndValue = liveCollection.at(liveEndIdx);
            const newEndValue = newCollection[newEndIdx];
            if (ngDevMode) {
                recordDuplicateKeys(duplicateKeys, trackByFn(newEndIdx, newEndValue), newEndIdx);
            }
            const isEndMatching = valuesMatching(liveEndIdx, liveEndValue, newEndIdx, newEndValue, trackByFn);
            if (isEndMatching !== 0) {
                if (isEndMatching < 0) {
                    liveCollection.updateValue(liveEndIdx, newEndValue);
                }
                liveEndIdx--;
                newEndIdx--;
                continue;
            }
            // Detect swap and moves:
            const liveStartKey = trackByFn(liveStartIdx, liveStartValue);
            const liveEndKey = trackByFn(liveEndIdx, liveEndValue);
            const newStartKey = trackByFn(liveStartIdx, newStartValue);
            if (Object.is(newStartKey, liveEndKey)) {
                const newEndKey = trackByFn(newEndIdx, newEndValue);
                // detect swap on both ends;
                if (Object.is(newEndKey, liveStartKey)) {
                    liveCollection.swap(liveStartIdx, liveEndIdx);
                    liveCollection.updateValue(liveEndIdx, newEndValue);
                    newEndIdx--;
                    liveEndIdx--;
                }
                else {
                    // the new item is the same as the live item with the end pointer - this is a move forward
                    // to an earlier index;
                    liveCollection.move(liveEndIdx, liveStartIdx);
                }
                liveCollection.updateValue(liveStartIdx, newStartValue);
                liveStartIdx++;
                continue;
            }
            // Fallback to the slow path: we need to learn more about the content of the live and new
            // collections.
            detachedItems ??= new UniqueValueMultiKeyMap();
            liveKeysInTheFuture ??= initLiveItemsInTheFuture(liveCollection, liveStartIdx, liveEndIdx, trackByFn);
            // Check if I'm inserting a previously detached item: if so, attach it here
            if (attachPreviouslyDetached(liveCollection, detachedItems, liveStartIdx, newStartKey)) {
                liveCollection.updateValue(liveStartIdx, newStartValue);
                liveStartIdx++;
                liveEndIdx++;
            }
            else if (!liveKeysInTheFuture.has(newStartKey)) {
                // Check if we seen a new item that doesn't exist in the old collection and must be INSERTED
                const newItem = liveCollection.create(liveStartIdx, newCollection[liveStartIdx]);
                liveCollection.attach(liveStartIdx, newItem);
                liveStartIdx++;
                liveEndIdx++;
            }
            else {
                // We know that the new item exists later on in old collection but we don't know its index
                // and as the consequence can't move it (don't know where to find it). Detach the old item,
                // hoping that it unlocks the fast path again.
                detachedItems.set(liveStartKey, liveCollection.detach(liveStartIdx));
                liveEndIdx--;
            }
        }
        // Final cleanup steps:
        // - more items in the new collection => insert
        while (liveStartIdx <= newEndIdx) {
            createOrAttach(liveCollection, detachedItems, trackByFn, liveStartIdx, newCollection[liveStartIdx]);
            liveStartIdx++;
        }
    }
    else if (newCollection != null) {
        // iterable - immediately fallback to the slow path
        const newCollectionIterator = newCollection[Symbol.iterator]();
        let newIterationResult = newCollectionIterator.next();
        while (!newIterationResult.done && liveStartIdx <= liveEndIdx) {
            const liveValue = liveCollection.at(liveStartIdx);
            const newValue = newIterationResult.value;
            if (ngDevMode) {
                recordDuplicateKeys(duplicateKeys, trackByFn(liveStartIdx, newValue), liveStartIdx);
            }
            const isStartMatching = valuesMatching(liveStartIdx, liveValue, liveStartIdx, newValue, trackByFn);
            if (isStartMatching !== 0) {
                // found a match - move on, but update value
                if (isStartMatching < 0) {
                    liveCollection.updateValue(liveStartIdx, newValue);
                }
                liveStartIdx++;
                newIterationResult = newCollectionIterator.next();
            }
            else {
                detachedItems ??= new UniqueValueMultiKeyMap();
                liveKeysInTheFuture ??= initLiveItemsInTheFuture(liveCollection, liveStartIdx, liveEndIdx, trackByFn);
                // Check if I'm inserting a previously detached item: if so, attach it here
                const newKey = trackByFn(liveStartIdx, newValue);
                if (attachPreviouslyDetached(liveCollection, detachedItems, liveStartIdx, newKey)) {
                    liveCollection.updateValue(liveStartIdx, newValue);
                    liveStartIdx++;
                    liveEndIdx++;
                    newIterationResult = newCollectionIterator.next();
                }
                else if (!liveKeysInTheFuture.has(newKey)) {
                    liveCollection.attach(liveStartIdx, liveCollection.create(liveStartIdx, newValue));
                    liveStartIdx++;
                    liveEndIdx++;
                    newIterationResult = newCollectionIterator.next();
                }
                else {
                    // it is a move forward - detach the current item without advancing in collections
                    const liveKey = trackByFn(liveStartIdx, liveValue);
                    detachedItems.set(liveKey, liveCollection.detach(liveStartIdx));
                    liveEndIdx--;
                }
            }
        }
        // this is a new item as we run out of the items in the old collection - create or attach a
        // previously detached one
        while (!newIterationResult.done) {
            createOrAttach(liveCollection, detachedItems, trackByFn, liveCollection.length, newIterationResult.value);
            newIterationResult = newCollectionIterator.next();
        }
    }
    // Cleanups common to the array and iterable:
    // - more items in the live collection => delete starting from the end;
    while (liveStartIdx <= liveEndIdx) {
        liveCollection.destroy(liveCollection.detach(liveEndIdx--));
    }
    // - destroy items that were detached but never attached again.
    detachedItems?.forEach((item) => {
        liveCollection.destroy(item);
    });
    // report duplicate keys (dev mode only)
    if (ngDevMode) {
        let duplicatedKeysMsg = [];
        for (const [key, idxSet] of duplicateKeys) {
            if (idxSet.size > 1) {
                const idx = [...idxSet].sort((a, b) => a - b);
                for (let i = 1; i < idx.length; i++) {
                    duplicatedKeysMsg.push(`key "${stringifyForError(key)}" at index "${idx[i - 1]}" and "${idx[i]}"`);
                }
            }
        }
        if (duplicatedKeysMsg.length > 0) {
            const message = formatRuntimeError(-955 /* RuntimeErrorCode.LOOP_TRACK_DUPLICATE_KEYS */, 'The provided track expression resulted in duplicated keys for a given collection. ' +
                'Adjust the tracking expression such that it uniquely identifies all the items in the collection. ' +
                'Duplicated keys were: \n' +
                duplicatedKeysMsg.join(', \n') +
                '.');
            // tslint:disable-next-line:no-console
            console.warn(message);
        }
    }
}
function attachPreviouslyDetached(prevCollection, detachedItems, index, key) {
    if (detachedItems !== undefined && detachedItems.has(key)) {
        prevCollection.attach(index, detachedItems.get(key));
        detachedItems.delete(key);
        return true;
    }
    return false;
}
function createOrAttach(liveCollection, detachedItems, trackByFn, index, value) {
    if (!attachPreviouslyDetached(liveCollection, detachedItems, index, trackByFn(index, value))) {
        const newItem = liveCollection.create(index, value);
        liveCollection.attach(index, newItem);
    }
    else {
        liveCollection.updateValue(index, value);
    }
}
function initLiveItemsInTheFuture(liveCollection, start, end, trackByFn) {
    const keys = new Set();
    for (let i = start; i <= end; i++) {
        keys.add(trackByFn(i, liveCollection.at(i)));
    }
    return keys;
}
/**
 * A specific, partial implementation of the Map interface with the following characteristics:
 * - allows multiple values for a given key;
 * - maintain FIFO order for multiple values corresponding to a given key;
 * - assumes that all values are unique.
 *
 * The implementation aims at having the minimal overhead for cases where keys are _not_ duplicated
 * (the most common case in the list reconciliation algorithm). To achieve this, the first value for
 * a given key is stored in a regular map. Then, when more values are set for a given key, we
 * maintain a form of linked list in a separate map. To maintain this linked list we assume that all
 * values (in the entire collection) are unique.
 */
export class UniqueValueMultiKeyMap {
    constructor() {
        // A map from a key to the first value corresponding to this key.
        this.kvMap = new Map();
        // A map that acts as a linked list of values - each value maps to the next value in this "linked
        // list" (this only works if values are unique). Allocated lazily to avoid memory consumption when
        // there are no duplicated values.
        this._vMap = undefined;
    }
    has(key) {
        return this.kvMap.has(key);
    }
    delete(key) {
        if (!this.has(key))
            return false;
        const value = this.kvMap.get(key);
        if (this._vMap !== undefined && this._vMap.has(value)) {
            this.kvMap.set(key, this._vMap.get(value));
            this._vMap.delete(value);
        }
        else {
            this.kvMap.delete(key);
        }
        return true;
    }
    get(key) {
        return this.kvMap.get(key);
    }
    set(key, value) {
        if (this.kvMap.has(key)) {
            let prevValue = this.kvMap.get(key);
            ngDevMode &&
                assertNotSame(prevValue, value, `Detected a duplicated value ${value} for the key ${key}`);
            if (this._vMap === undefined) {
                this._vMap = new Map();
            }
            const vMap = this._vMap;
            while (vMap.has(prevValue)) {
                prevValue = vMap.get(prevValue);
            }
            vMap.set(prevValue, value);
        }
        else {
            this.kvMap.set(key, value);
        }
    }
    forEach(cb) {
        for (let [key, value] of this.kvMap) {
            cb(value, key);
            if (this._vMap !== undefined) {
                const vMap = this._vMap;
                while (vMap.has(value)) {
                    value = vMap.get(value);
                    cb(value, key);
                }
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdF9yZWNvbmNpbGlhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL3JlbmRlcjMvbGlzdF9yZWNvbmNpbGlhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFHSCxPQUFPLEVBQUMsa0JBQWtCLEVBQW1CLE1BQU0sV0FBVyxDQUFDO0FBQy9ELE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUU3QyxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUV6RDs7OztHQUlHO0FBQ0gsTUFBTSxPQUFnQixjQUFjO0lBTWxDLE9BQU8sQ0FBQyxJQUFPO1FBQ2Isa0JBQWtCO0lBQ3BCLENBQUM7SUFDRCxXQUFXLENBQUMsS0FBYSxFQUFFLEtBQVE7UUFDakMsa0JBQWtCO0lBQ3BCLENBQUM7SUFFRCw0RkFBNEY7SUFDNUYsbUZBQW1GO0lBQ25GLGtCQUFrQjtJQUNsQixJQUFJLENBQUMsTUFBYyxFQUFFLE1BQWM7UUFDakMsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDMUMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDeEMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNwQyxJQUFJLE1BQU0sR0FBRyxRQUFRLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDMUIsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN4QyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUMvQixJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxTQUFTLENB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LENBQUM7SUFDSCxDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCB7VHJhY2tCeUZ1bmN0aW9ufSBmcm9tICcuLi9jaGFuZ2VfZGV0ZWN0aW9uJztcbmltcG9ydCB7Zm9ybWF0UnVudGltZUVycm9yLCBSdW50aW1lRXJyb3JDb2RlfSBmcm9tICcuLi9lcnJvcnMnO1xuaW1wb3J0IHthc3NlcnROb3RTYW1lfSBmcm9tICcuLi91dGlsL2Fzc2VydCc7XG5cbmltcG9ydCB7c3RyaW5naWZ5Rm9yRXJyb3J9IGZyb20gJy4vdXRpbC9zdHJpbmdpZnlfdXRpbHMnO1xuXG4vKipcbiAqIEEgdHlwZSByZXByZXNlbnRpbmcgdGhlIGxpdmUgY29sbGVjdGlvbiB0byBiZSByZWNvbmNpbGVkIHdpdGggYW55IG5ldyAoaW5jb21pbmcpIGNvbGxlY3Rpb24uIFRoaXNcbiAqIGlzIGFuIGFkYXB0ZXIgY2xhc3MgdGhhdCBtYWtlcyBpdCBwb3NzaWJsZSB0byB3b3JrIHdpdGggZGlmZmVyZW50IGludGVybmFsIGRhdGEgc3RydWN0dXJlcyxcbiAqIHJlZ2FyZGxlc3Mgb2YgdGhlIGFjdHVhbCB2YWx1ZXMgb2YgdGhlIGluY29taW5nIGNvbGxlY3Rpb24uXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBMaXZlQ29sbGVjdGlvbjxULCBWPiB7XG4gIGFic3RyYWN0IGdldCBsZW5ndGgoKTogbnVtYmVyO1xuICBhYnN0cmFjdCBhdChpbmRleDogbnVtYmVyKTogVjtcbiAgYWJzdHJhY3QgYXR0YWNoKGluZGV4OiBudW1iZXIsIGl0ZW06IFQpOiB2b2lkO1xuICBhYnN0cmFjdCBkZXRhY2goaW5kZXg6IG51bWJlcik6IFQ7XG4gIGFic3RyYWN0IGNyZWF0ZShpbmRleDogbnVtYmVyLCB2YWx1ZTogVik6IFQ7XG4gIGRlc3Ryb3koaXRlbTogVCk6IHZvaWQge1xuICAgIC8vIG5vb3AgYnkgZGVmYXVsdFxuICB9XG4gIHVwZGF0ZVZhbHVlKGluZGV4OiBudW1iZXIsIHZhbHVlOiBWKTogdm9pZCB7XG4gICAgLy8gbm9vcCBieSBkZWZhdWx0XG4gIH1cblxuICAvLyBvcGVyYXRpb25zIGJlbG93IGNvdWxkIGJlIGltcGxlbWVudGVkIG9uIHRvcCBvZiB0aGUgb3BlcmF0aW9ucyBkZWZpbmVkIHNvIGZhciwgYnV0IGhhdmluZ1xuICAvLyB0aGVtIGV4cGxpY2l0bHkgYWxsb3cgY2xlYXIgZXhwcmVzc2lvbiBvZiBpbnRlbnQgYW5kIHBvdGVudGlhbGx5IG1vcmUgcGVyZm9ybWFudFxuICAvLyBpbXBsZW1lbnRhdGlvbnNcbiAgc3dhcChpbmRleDE6IG51bWJlciwgaW5kZXgyOiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCBzdGFydElkeCA9IE1hdGgubWluKGluZGV4MSwgaW5kZXgyKTtcbiAgICBjb25zdCBlbmRJZHggPSBNYXRoLm1heChpbmRleDEsIGluZGV4Mik7XG4gICAgY29uc3QgZW5kSXRlbSA9IHRoaXMuZGV0YWNoKGVuZElkeCk7XG4gICAgaWYgKGVuZElkeCAtIHN0YXJ0SWR4ID4gMSkge1xuICAgICAgY29uc3Qgc3RhcnRJdGVtID0gdGhpcy5kZXRhY2goc3RhcnRJZHgpO1xuICAgICAgdGhpcy5hdHRhY2goc3RhcnRJZHgsIGVuZEl0ZW0pO1xuICAgICAgdGhpcy5hdHRhY2goZW5kSWR4LCBzdGFydEl0ZW0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmF0dGFjaChzdGFydElkeCwgZW5kSXRlbSk7XG4gICAgfVxuICB9XG4gIG1vdmUocHJldkluZGV4OiBudW1iZXIsIG5ld0lkeDogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5hdHRhY2gobmV3SWR4LCB0aGlzLmRldGFjaChwcmV2SW5kZXgpKTtcbiAgfVxufVxuXG5mdW5jdGlvbiB2YWx1ZXNNYXRjaGluZzxWPihcbiAgbGl2ZUlkeDogbnVtYmVyLFxuICBsaXZlVmFsdWU6IFYsXG4gIG5ld0lkeDogbnVtYmVyLFxuICBuZXdWYWx1ZTogVixcbiAgdHJhY2tCeTogVHJhY2tCeUZ1bmN0aW9uPFY+LFxuKTogbnVtYmVyIHtcbiAgaWYgKGxpdmVJZHggPT09IG5ld0lkeCAmJiBPYmplY3QuaXMobGl2ZVZhbHVlLCBuZXdWYWx1ZSkpIHtcbiAgICAvLyBtYXRjaGluZyBhbmQgbm8gdmFsdWUgaWRlbnRpdHkgdG8gdXBkYXRlXG4gICAgcmV0dXJuIDE7XG4gIH0gZWxzZSBpZiAoT2JqZWN0LmlzKHRyYWNrQnkobGl2ZUlkeCwgbGl2ZVZhbHVlKSwgdHJhY2tCeShuZXdJZHgsIG5ld1ZhbHVlKSkpIHtcbiAgICAvLyBtYXRjaGluZyBidXQgcmVxdWlyZXMgdmFsdWUgaWRlbnRpdHkgdXBkYXRlXG4gICAgcmV0dXJuIC0xO1xuICB9XG5cbiAgcmV0dXJuIDA7XG59XG5cbmZ1bmN0aW9uIHJlY29yZER1cGxpY2F0ZUtleXMoa2V5VG9JZHg6IE1hcDx1bmtub3duLCBTZXQ8bnVtYmVyPj4sIGtleTogdW5rbm93biwgaWR4OiBudW1iZXIpOiB2b2lkIHtcbiAgY29uc3QgaWR4U29GYXIgPSBrZXlUb0lkeC5nZXQoa2V5KTtcblxuICBpZiAoaWR4U29GYXIgIT09IHVuZGVmaW5lZCkge1xuICAgIGlkeFNvRmFyLmFkZChpZHgpO1xuICB9IGVsc2Uge1xuICAgIGtleVRvSWR4LnNldChrZXksIG5ldyBTZXQoW2lkeF0pKTtcbiAgfVxufVxuXG4vKipcbiAqIFRoZSBsaXZlIGNvbGxlY3Rpb24gcmVjb25jaWxpYXRpb24gYWxnb3JpdGhtIHRoYXQgcGVyZm9ybSB2YXJpb3VzIGluLXBsYWNlIG9wZXJhdGlvbnMsIHNvIGl0XG4gKiByZWZsZWN0cyB0aGUgY29udGVudCBvZiB0aGUgbmV3IChpbmNvbWluZykgY29sbGVjdGlvbi5cbiAqXG4gKiBUaGUgcmVjb25jaWxpYXRpb24gYWxnb3JpdGhtIGhhcyAyIGNvZGUgcGF0aHM6XG4gKiAtIFwiZmFzdFwiIHBhdGggdGhhdCBkb24ndCByZXF1aXJlIGFueSBtZW1vcnkgYWxsb2NhdGlvbjtcbiAqIC0gXCJzbG93XCIgcGF0aCB0aGF0IHJlcXVpcmVzIGFkZGl0aW9uYWwgbWVtb3J5IGFsbG9jYXRpb24gZm9yIGludGVybWVkaWF0ZSBkYXRhIHN0cnVjdHVyZXMgdXNlZCB0b1xuICogY29sbGVjdCBhZGRpdGlvbmFsIGluZm9ybWF0aW9uIGFib3V0IHRoZSBsaXZlIGNvbGxlY3Rpb24uXG4gKiBJdCBtaWdodCBoYXBwZW4gdGhhdCB0aGUgYWxnb3JpdGhtIHN3aXRjaGVzIGJldHdlZW4gdGhlIHR3byBtb2RlcyBpbiBxdWVzdGlvbiBpbiBhIHNpbmdsZVxuICogcmVjb25jaWxpYXRpb24gcGF0aCAtIGdlbmVyYWxseSBpdCB0cmllcyB0byBzdGF5IG9uIHRoZSBcImZhc3RcIiBwYXRoIGFzIG11Y2ggYXMgcG9zc2libGUuXG4gKlxuICogVGhlIG92ZXJhbGwgY29tcGxleGl0eSBvZiB0aGUgYWxnb3JpdGhtIGlzIE8obiArIG0pIGZvciBzcGVlZCBhbmQgTyhuKSBmb3IgbWVtb3J5ICh3aGVyZSBuIGlzIHRoZVxuICogbGVuZ3RoIG9mIHRoZSBsaXZlIGNvbGxlY3Rpb24gYW5kIG0gaXMgdGhlIGxlbmd0aCBvZiB0aGUgaW5jb21pbmcgY29sbGVjdGlvbikuIEdpdmVuIHRoZSBwcm9ibGVtXG4gKiBhdCBoYW5kIHRoZSBjb21wbGV4aXR5IC8gcGVyZm9ybWFuY2UgY29uc3RyYWludHMgbWFrZXMgaXQgaW1wb3NzaWJsZSB0byBwZXJmb3JtIHRoZSBhYnNvbHV0ZVxuICogbWluaW11bSBvZiBvcGVyYXRpb24gdG8gcmVjb25jaWxlIHRoZSAyIGNvbGxlY3Rpb25zLiBUaGUgYWxnb3JpdGhtIG1ha2VzIGRpZmZlcmVudCB0cmFkZW9mZnMgdG9cbiAqIHN0YXkgd2l0aGluIHJlYXNvbmFibGUgcGVyZm9ybWFuY2UgYm91bmRzIGFuZCBtYXkgYXBwbHkgc3ViLW9wdGltYWwgbnVtYmVyIG9mIG9wZXJhdGlvbnMgaW5cbiAqIGNlcnRhaW4gc2l0dWF0aW9ucy5cbiAqXG4gKiBAcGFyYW0gbGl2ZUNvbGxlY3Rpb24gdGhlIGN1cnJlbnQsIGxpdmUgY29sbGVjdGlvbjtcbiAqIEBwYXJhbSBuZXdDb2xsZWN0aW9uIHRoZSBuZXcsIGluY29taW5nIGNvbGxlY3Rpb247XG4gKiBAcGFyYW0gdHJhY2tCeUZuIGtleSBnZW5lcmF0aW9uIGZ1bmN0aW9uIHRoYXQgZGV0ZXJtaW5lcyBlcXVhbGl0eSBiZXR3ZWVuIGl0ZW1zIGluIHRoZSBsaWZlIGFuZFxuICogICAgIGluY29taW5nIGNvbGxlY3Rpb247XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZWNvbmNpbGU8VCwgVj4oXG4gIGxpdmVDb2xsZWN0aW9uOiBMaXZlQ29sbGVjdGlvbjxULCBWPixcbiAgbmV3Q29sbGVjdGlvbjogSXRlcmFibGU8Vj4gfCB1bmRlZmluZWQgfCBudWxsLFxuICB0cmFja0J5Rm46IFRyYWNrQnlGdW5jdGlvbjxWPixcbik6IHZvaWQge1xuICBsZXQgZGV0YWNoZWRJdGVtczogVW5pcXVlVmFsdWVNdWx0aUtleU1hcDx1bmtub3duLCBUPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgbGV0IGxpdmVLZXlzSW5UaGVGdXR1cmU6IFNldDx1bmtub3duPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcblxuICBsZXQgbGl2ZVN0YXJ0SWR4ID0gMDtcbiAgbGV0IGxpdmVFbmRJZHggPSBsaXZlQ29sbGVjdGlvbi5sZW5ndGggLSAxO1xuXG4gIGNvbnN0IGR1cGxpY2F0ZUtleXMgPSBuZ0Rldk1vZGUgPyBuZXcgTWFwPHVua25vd24sIFNldDxudW1iZXI+PigpIDogdW5kZWZpbmVkO1xuXG4gIGlmIChBcnJheS5pc0FycmF5KG5ld0NvbGxlY3Rpb24pKSB7XG4gICAgbGV0IG5ld0VuZElkeCA9IG5ld0NvbGxlY3Rpb24ubGVuZ3RoIC0gMTtcblxuICAgIHdoaWxlIChsaXZlU3RhcnRJZHggPD0gbGl2ZUVuZElkeCAmJiBsaXZlU3RhcnRJZHggPD0gbmV3RW5kSWR4KSB7XG4gICAgICAvLyBjb21wYXJlIGZyb20gdGhlIGJlZ2lubmluZ1xuICAgICAgY29uc3QgbGl2ZVN0YXJ0VmFsdWUgPSBsaXZlQ29sbGVjdGlvbi5hdChsaXZlU3RhcnRJZHgpO1xuICAgICAgY29uc3QgbmV3U3RhcnRWYWx1ZSA9IG5ld0NvbGxlY3Rpb25bbGl2ZVN0YXJ0SWR4XTtcblxuICAgICAgaWYgKG5nRGV2TW9kZSkge1xuICAgICAgICByZWNvcmREdXBsaWNhdGVLZXlzKGR1cGxpY2F0ZUtleXMhLCB0cmFja0J5Rm4obGl2ZVN0YXJ0SWR4LCBuZXdTdGFydFZhbHVlKSwgbGl2ZVN0YXJ0SWR4KTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgaXNTdGFydE1hdGNoaW5nID0gdmFsdWVzTWF0Y2hpbmcoXG4gICAgICAgIGxpdmVTdGFydElkeCxcbiAgICAgICAgbGl2ZVN0YXJ0VmFsdWUsXG4gICAgICAgIGxpdmVTdGFydElkeCxcbiAgICAgICAgbmV3U3RhcnRWYWx1ZSxcbiAgICAgICAgdHJhY2tCeUZuLFxuICAgICAgKTtcbiAgICAgIGlmIChpc1N0YXJ0TWF0Y2hpbmcgIT09IDApIHtcbiAgICAgICAgaWYgKGlzU3RhcnRNYXRjaGluZyA8IDApIHtcbiAgICAgICAgICBsaXZlQ29sbGVjdGlvbi51cGRhdGVWYWx1ZShsaXZlU3RhcnRJZHgsIG5ld1N0YXJ0VmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGxpdmVTdGFydElkeCsrO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gY29tcGFyZSBmcm9tIHRoZSBlbmRcbiAgICAgIC8vIFRPRE8ocGVyZik6IGRvIF9hbGxfIHRoZSBtYXRjaGluZyBmcm9tIHRoZSBlbmRcbiAgICAgIGNvbnN0IGxpdmVFbmRWYWx1ZSA9IGxpdmVDb2xsZWN0aW9uLmF0KGxpdmVFbmRJZHgpO1xuICAgICAgY29uc3QgbmV3RW5kVmFsdWUgPSBuZXdDb2xsZWN0aW9uW25ld0VuZElkeF07XG5cbiAgICAgIGlmIChuZ0Rldk1vZGUpIHtcbiAgICAgICAgcmVjb3JkRHVwbGljYXRlS2V5cyhkdXBsaWNhdGVLZXlzISwgdHJhY2tCeUZuKG5ld0VuZElkeCwgbmV3RW5kVmFsdWUpLCBuZXdFbmRJZHgpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBpc0VuZE1hdGNoaW5nID0gdmFsdWVzTWF0Y2hpbmcoXG4gICAgICAgIGxpdmVFbmRJZHgsXG4gICAgICAgIGxpdmVFbmRWYWx1ZSxcbiAgICAgICAgbmV3RW5kSWR4LFxuICAgICAgICBuZXdFbmRWYWx1ZSxcbiAgICAgICAgdHJhY2tCeUZuLFxuICAgICAgKTtcbiAgICAgIGlmIChpc0VuZE1hdGNoaW5nICE9PSAwKSB7XG4gICAgICAgIGlmIChpc0VuZE1hdGNoaW5nIDwgMCkge1xuICAgICAgICAgIGxpdmVDb2xsZWN0aW9uLnVwZGF0ZVZhbHVlKGxpdmVFbmRJZHgsIG5ld0VuZFZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBsaXZlRW5kSWR4LS07XG4gICAgICAgIG5ld0VuZElkeC0tO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gRGV0ZWN0IHN3YXAgYW5kIG1vdmVzOlxuICAgICAgY29uc3QgbGl2ZVN0YXJ0S2V5ID0gdHJhY2tCeUZuKGxpdmVTdGFydElkeCwgbGl2ZVN0YXJ0VmFsdWUpO1xuICAgICAgY29uc3QgbGl2ZUVuZEtleSA9IHRyYWNrQnlGbihsaXZlRW5kSWR4LCBsaXZlRW5kVmFsdWUpO1xuICAgICAgY29uc3QgbmV3U3RhcnRLZXkgPSB0cmFja0J5Rm4obGl2ZVN0YXJ0SWR4LCBuZXdTdGFydFZhbHVlKTtcbiAgICAgIGlmIChPYmplY3QuaXMobmV3U3RhcnRLZXksIGxpdmVFbmRLZXkpKSB7XG4gICAgICAgIGNvbnN0IG5ld0VuZEtleSA9IHRyYWNrQnlGbihuZXdFbmRJZHgsIG5ld0VuZFZhbHVlKTtcbiAgICAgICAgLy8gZGV0ZWN0IHN3YXAgb24gYm90aCBlbmRzO1xuICAgICAgICBpZiAoT2JqZWN0LmlzKG5ld0VuZEtleSwgbGl2ZVN0YXJ0S2V5KSkge1xuICAgICAgICAgIGxpdmVDb2xsZWN0aW9uLnN3YXAobGl2ZVN0YXJ0SWR4LCBsaXZlRW5kSWR4KTtcbiAgICAgICAgICBsaXZlQ29sbGVjdGlvbi51cGRhdGVWYWx1ZShsaXZlRW5kSWR4LCBuZXdFbmRWYWx1ZSk7XG4gICAgICAgICAgbmV3RW5kSWR4LS07XG4gICAgICAgICAgbGl2ZUVuZElkeC0tO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIHRoZSBuZXcgaXRlbSBpcyB0aGUgc2FtZSBhcyB0aGUgbGl2ZSBpdGVtIHdpdGggdGhlIGVuZCBwb2ludGVyIC0gdGhpcyBpcyBhIG1vdmUgZm9yd2FyZFxuICAgICAgICAgIC8vIHRvIGFuIGVhcmxpZXIgaW5kZXg7XG4gICAgICAgICAgbGl2ZUNvbGxlY3Rpb24ubW92ZShsaXZlRW5kSWR4LCBsaXZlU3RhcnRJZHgpO1xuICAgICAgICB9XG4gICAgICAgIGxpdmVDb2xsZWN0aW9uLnVwZGF0ZVZhbHVlKGxpdmVTdGFydElkeCwgbmV3U3RhcnRWYWx1ZSk7XG4gICAgICAgIGxpdmVTdGFydElkeCsrO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gRmFsbGJhY2sgdG8gdGhlIHNsb3cgcGF0aDogd2UgbmVlZCB0byBsZWFybiBtb3JlIGFib3V0IHRoZSBjb250ZW50IG9mIHRoZSBsaXZlIGFuZCBuZXdcbiAgICAgIC8vIGNvbGxlY3Rpb25zLlxuICAgICAgZGV0YWNoZWRJdGVtcyA/Pz0gbmV3IFVuaXF1ZVZhbHVlTXVsdGlLZXlNYXAoKTtcbiAgICAgIGxpdmVLZXlzSW5UaGVGdXR1cmUgPz89IGluaXRMaXZlSXRlbXNJblRoZUZ1dHVyZShcbiAgICAgICAgbGl2ZUNvbGxlY3Rpb24sXG4gICAgICAgIGxpdmVTdGFydElkeCxcbiAgICAgICAgbGl2ZUVuZElkeCxcbiAgICAgICAgdHJhY2tCeUZuLFxuICAgICAgKTtcblxuICAgICAgLy8gQ2hlY2sgaWYgSSdtIGluc2VydGluZyBhIHByZXZpb3VzbHkgZGV0YWNoZWQgaXRlbTogaWYgc28sIGF0dGFjaCBpdCBoZXJlXG4gICAgICBpZiAoYXR0YWNoUHJldmlvdXNseURldGFjaGVkKGxpdmVDb2xsZWN0aW9uLCBkZXRhY2hlZEl0ZW1zLCBsaXZlU3RhcnRJZHgsIG5ld1N0YXJ0S2V5KSkge1xuICAgICAgICBsaXZlQ29sbGVjdGlvbi51cGRhdGVWYWx1ZShsaXZlU3RhcnRJZHgsIG5ld1N0YXJ0VmFsdWUpO1xuICAgICAgICBsaXZlU3RhcnRJZHgrKztcbiAgICAgICAgbGl2ZUVuZElkeCsrO1xuICAgICAgfSBlbHNlIGlmICghbGl2ZUtleXNJblRoZUZ1dHVyZS5oYXMobmV3U3RhcnRLZXkpKSB7XG4gICAgICAgIC8vIENoZWNrIGlmIHdlIHNlZW4gYSBuZXcgaXRlbSB0aGF0IGRvZXNuJ3QgZXhpc3QgaW4gdGhlIG9sZCBjb2xsZWN0aW9uIGFuZCBtdXN0IGJlIElOU0VSVEVEXG4gICAgICAgIGNvbnN0IG5ld0l0ZW0gPSBsaXZlQ29sbGVjdGlvbi5jcmVhdGUobGl2ZVN0YXJ0SWR4LCBuZXdDb2xsZWN0aW9uW2xpdmVTdGFydElkeF0pO1xuICAgICAgICBsaXZlQ29sbGVjdGlvbi5hdHRhY2gobGl2ZVN0YXJ0SWR4LCBuZXdJdGVtKTtcbiAgICAgICAgbGl2ZVN0YXJ0SWR4Kys7XG4gICAgICAgIGxpdmVFbmRJZHgrKztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFdlIGtub3cgdGhhdCB0aGUgbmV3IGl0ZW0gZXhpc3RzIGxhdGVyIG9uIGluIG9sZCBjb2xsZWN0aW9uIGJ1dCB3ZSBkb24ndCBrbm93IGl0cyBpbmRleFxuICAgICAgICAvLyBhbmQgYXMgdGhlIGNvbnNlcXVlbmNlIGNhbid0IG1vdmUgaXQgKGRvbid0IGtub3cgd2hlcmUgdG8gZmluZCBpdCkuIERldGFjaCB0aGUgb2xkIGl0ZW0sXG4gICAgICAgIC8vIGhvcGluZyB0aGF0IGl0IHVubG9ja3MgdGhlIGZhc3QgcGF0aCBhZ2Fpbi5cbiAgICAgICAgZGV0YWNoZWRJdGVtcy5zZXQobGl2ZVN0YXJ0S2V5LCBsaXZlQ29sbGVjdGlvbi5kZXRhY2gobGl2ZVN0YXJ0SWR4KSk7XG4gICAgICAgIGxpdmVFbmRJZHgtLTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBGaW5hbCBjbGVhbnVwIHN0ZXBzOlxuICAgIC8vIC0gbW9yZSBpdGVtcyBpbiB0aGUgbmV3IGNvbGxlY3Rpb24gPT4gaW5zZXJ0XG4gICAgd2hpbGUgKGxpdmVTdGFydElkeCA8PSBuZXdFbmRJZHgpIHtcbiAgICAgIGNyZWF0ZU9yQXR0YWNoKFxuICAgICAgICBsaXZlQ29sbGVjdGlvbixcbiAgICAgICAgZGV0YWNoZWRJdGVtcyxcbiAgICAgICAgdHJhY2tCeUZuLFxuICAgICAgICBsaXZlU3RhcnRJZHgsXG4gICAgICAgIG5ld0NvbGxlY3Rpb25bbGl2ZVN0YXJ0SWR4XSxcbiAgICAgICk7XG4gICAgICBsaXZlU3RhcnRJZHgrKztcbiAgICB9XG4gIH0gZWxzZSBpZiAobmV3Q29sbGVjdGlvbiAhPSBudWxsKSB7XG4gICAgLy8gaXRlcmFibGUgLSBpbW1lZGlhdGVseSBmYWxsYmFjayB0byB0aGUgc2xvdyBwYXRoXG4gICAgY29uc3QgbmV3Q29sbGVjdGlvbkl0ZXJhdG9yID0gbmV3Q29sbGVjdGlvbltTeW1ib2wuaXRlcmF0b3JdKCk7XG4gICAgbGV0IG5ld0l0ZXJhdGlvblJlc3VsdCA9IG5ld0NvbGxlY3Rpb25JdGVyYXRvci5uZXh0KCk7XG4gICAgd2hpbGUgKCFuZXdJdGVyYXRpb25SZXN1bHQuZG9uZSAmJiBsaXZlU3RhcnRJZHggPD0gbGl2ZUVuZElkeCkge1xuICAgICAgY29uc3QgbGl2ZVZhbHVlID0gbGl2ZUNvbGxlY3Rpb24uYXQobGl2ZVN0YXJ0SWR4KTtcbiAgICAgIGNvbnN0IG5ld1ZhbHVlID0gbmV3SXRlcmF0aW9uUmVzdWx0LnZhbHVlO1xuXG4gICAgICBpZiAobmdEZXZNb2RlKSB7XG4gICAgICAgIHJlY29yZER1cGxpY2F0ZUtleXMoZHVwbGljYXRlS2V5cyEsIHRyYWNrQnlGbihsaXZlU3RhcnRJZHgsIG5ld1ZhbHVlKSwgbGl2ZVN0YXJ0SWR4KTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgaXNTdGFydE1hdGNoaW5nID0gdmFsdWVzTWF0Y2hpbmcoXG4gICAgICAgIGxpdmVTdGFydElkeCxcbiAgICAgICAgbGl2ZVZhbHVlLFxuICAgICAgICBsaXZlU3RhcnRJZHgsXG4gICAgICAgIG5ld1ZhbHVlLFxuICAgICAgICB0cmFja0J5Rm4sXG4gICAgICApO1xuICAgICAgaWYgKGlzU3RhcnRNYXRjaGluZyAhPT0gMCkge1xuICAgICAgICAvLyBmb3VuZCBhIG1hdGNoIC0gbW92ZSBvbiwgYnV0IHVwZGF0ZSB2YWx1ZVxuICAgICAgICBpZiAoaXNTdGFydE1hdGNoaW5nIDwgMCkge1xuICAgICAgICAgIGxpdmVDb2xsZWN0aW9uLnVwZGF0ZVZhbHVlKGxpdmVTdGFydElkeCwgbmV3VmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGxpdmVTdGFydElkeCsrO1xuICAgICAgICBuZXdJdGVyYXRpb25SZXN1bHQgPSBuZXdDb2xsZWN0aW9uSXRlcmF0b3IubmV4dCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGV0YWNoZWRJdGVtcyA/Pz0gbmV3IFVuaXF1ZVZhbHVlTXVsdGlLZXlNYXAoKTtcbiAgICAgICAgbGl2ZUtleXNJblRoZUZ1dHVyZSA/Pz0gaW5pdExpdmVJdGVtc0luVGhlRnV0dXJlKFxuICAgICAgICAgIGxpdmVDb2xsZWN0aW9uLFxuICAgICAgICAgIGxpdmVTdGFydElkeCxcbiAgICAgICAgICBsaXZlRW5kSWR4LFxuICAgICAgICAgIHRyYWNrQnlGbixcbiAgICAgICAgKTtcblxuICAgICAgICAvLyBDaGVjayBpZiBJJ20gaW5zZXJ0aW5nIGEgcHJldmlvdXNseSBkZXRhY2hlZCBpdGVtOiBpZiBzbywgYXR0YWNoIGl0IGhlcmVcbiAgICAgICAgY29uc3QgbmV3S2V5ID0gdHJhY2tCeUZuKGxpdmVTdGFydElkeCwgbmV3VmFsdWUpO1xuICAgICAgICBpZiAoYXR0YWNoUHJldmlvdXNseURldGFjaGVkKGxpdmVDb2xsZWN0aW9uLCBkZXRhY2hlZEl0ZW1zLCBsaXZlU3RhcnRJZHgsIG5ld0tleSkpIHtcbiAgICAgICAgICBsaXZlQ29sbGVjdGlvbi51cGRhdGVWYWx1ZShsaXZlU3RhcnRJZHgsIG5ld1ZhbHVlKTtcbiAgICAgICAgICBsaXZlU3RhcnRJZHgrKztcbiAgICAgICAgICBsaXZlRW5kSWR4Kys7XG4gICAgICAgICAgbmV3SXRlcmF0aW9uUmVzdWx0ID0gbmV3Q29sbGVjdGlvbkl0ZXJhdG9yLm5leHQoKTtcbiAgICAgICAgfSBlbHNlIGlmICghbGl2ZUtleXNJblRoZUZ1dHVyZS5oYXMobmV3S2V5KSkge1xuICAgICAgICAgIGxpdmVDb2xsZWN0aW9uLmF0dGFjaChsaXZlU3RhcnRJZHgsIGxpdmVDb2xsZWN0aW9uLmNyZWF0ZShsaXZlU3RhcnRJZHgsIG5ld1ZhbHVlKSk7XG4gICAgICAgICAgbGl2ZVN0YXJ0SWR4Kys7XG4gICAgICAgICAgbGl2ZUVuZElkeCsrO1xuICAgICAgICAgIG5ld0l0ZXJhdGlvblJlc3VsdCA9IG5ld0NvbGxlY3Rpb25JdGVyYXRvci5uZXh0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gaXQgaXMgYSBtb3ZlIGZvcndhcmQgLSBkZXRhY2ggdGhlIGN1cnJlbnQgaXRlbSB3aXRob3V0IGFkdmFuY2luZyBpbiBjb2xsZWN0aW9uc1xuICAgICAgICAgIGNvbnN0IGxpdmVLZXkgPSB0cmFja0J5Rm4obGl2ZVN0YXJ0SWR4LCBsaXZlVmFsdWUpO1xuICAgICAgICAgIGRldGFjaGVkSXRlbXMuc2V0KGxpdmVLZXksIGxpdmVDb2xsZWN0aW9uLmRldGFjaChsaXZlU3RhcnRJZHgpKTtcbiAgICAgICAgICBsaXZlRW5kSWR4LS07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyB0aGlzIGlzIGEgbmV3IGl0ZW0gYXMgd2UgcnVuIG91dCBvZiB0aGUgaXRlbXMgaW4gdGhlIG9sZCBjb2xsZWN0aW9uIC0gY3JlYXRlIG9yIGF0dGFjaCBhXG4gICAgLy8gcHJldmlvdXNseSBkZXRhY2hlZCBvbmVcbiAgICB3aGlsZSAoIW5ld0l0ZXJhdGlvblJlc3VsdC5kb25lKSB7XG4gICAgICBjcmVhdGVPckF0dGFjaChcbiAgICAgICAgbGl2ZUNvbGxlY3Rpb24sXG4gICAgICAgIGRldGFjaGVkSXRlbXMsXG4gICAgICAgIHRyYWNrQnlGbixcbiAgICAgICAgbGl2ZUNvbGxlY3Rpb24ubGVuZ3RoLFxuICAgICAgICBuZXdJdGVyYXRpb25SZXN1bHQudmFsdWUsXG4gICAgICApO1xuICAgICAgbmV3SXRlcmF0aW9uUmVzdWx0ID0gbmV3Q29sbGVjdGlvbkl0ZXJhdG9yLm5leHQoKTtcbiAgICB9XG4gIH1cblxuICAvLyBDbGVhbnVwcyBjb21tb24gdG8gdGhlIGFycmF5IGFuZCBpdGVyYWJsZTpcbiAgLy8gLSBtb3JlIGl0ZW1zIGluIHRoZSBsaXZlIGNvbGxlY3Rpb24gPT4gZGVsZXRlIHN0YXJ0aW5nIGZyb20gdGhlIGVuZDtcbiAgd2hpbGUgKGxpdmVTdGFydElkeCA8PSBsaXZlRW5kSWR4KSB7XG4gICAgbGl2ZUNvbGxlY3Rpb24uZGVzdHJveShsaXZlQ29sbGVjdGlvbi5kZXRhY2gobGl2ZUVuZElkeC0tKSk7XG4gIH1cblxuICAvLyAtIGRlc3Ryb3kgaXRlbXMgdGhhdCB3ZXJlIGRldGFjaGVkIGJ1dCBuZXZlciBhdHRhY2hlZCBhZ2Fpbi5cbiAgZGV0YWNoZWRJdGVtcz8uZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgIGxpdmVDb2xsZWN0aW9uLmRlc3Ryb3koaXRlbSk7XG4gIH0pO1xuXG4gIC8vIHJlcG9ydCBkdXBsaWNhdGUga2V5cyAoZGV2IG1vZGUgb25seSlcbiAgaWYgKG5nRGV2TW9kZSkge1xuICAgIGxldCBkdXBsaWNhdGVkS2V5c01zZyA9IFtdO1xuICAgIGZvciAoY29uc3QgW2tleSwgaWR4U2V0XSBvZiBkdXBsaWNhdGVLZXlzISkge1xuICAgICAgaWYgKGlkeFNldC5zaXplID4gMSkge1xuICAgICAgICBjb25zdCBpZHggPSBbLi4uaWR4U2V0XS5zb3J0KChhLCBiKSA9PiBhIC0gYik7XG4gICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwgaWR4Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgZHVwbGljYXRlZEtleXNNc2cucHVzaChcbiAgICAgICAgICAgIGBrZXkgXCIke3N0cmluZ2lmeUZvckVycm9yKGtleSl9XCIgYXQgaW5kZXggXCIke2lkeFtpIC0gMV19XCIgYW5kIFwiJHtpZHhbaV19XCJgLFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZHVwbGljYXRlZEtleXNNc2cubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgbWVzc2FnZSA9IGZvcm1hdFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5MT09QX1RSQUNLX0RVUExJQ0FURV9LRVlTLFxuICAgICAgICAnVGhlIHByb3ZpZGVkIHRyYWNrIGV4cHJlc3Npb24gcmVzdWx0ZWQgaW4gZHVwbGljYXRlZCBrZXlzIGZvciBhIGdpdmVuIGNvbGxlY3Rpb24uICcgK1xuICAgICAgICAgICdBZGp1c3QgdGhlIHRyYWNraW5nIGV4cHJlc3Npb24gc3VjaCB0aGF0IGl0IHVuaXF1ZWx5IGlkZW50aWZpZXMgYWxsIHRoZSBpdGVtcyBpbiB0aGUgY29sbGVjdGlvbi4gJyArXG4gICAgICAgICAgJ0R1cGxpY2F0ZWQga2V5cyB3ZXJlOiBcXG4nICtcbiAgICAgICAgICBkdXBsaWNhdGVkS2V5c01zZy5qb2luKCcsIFxcbicpICtcbiAgICAgICAgICAnLicsXG4gICAgICApO1xuXG4gICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tY29uc29sZVxuICAgICAgY29uc29sZS53YXJuKG1lc3NhZ2UpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBhdHRhY2hQcmV2aW91c2x5RGV0YWNoZWQ8VCwgVj4oXG4gIHByZXZDb2xsZWN0aW9uOiBMaXZlQ29sbGVjdGlvbjxULCBWPixcbiAgZGV0YWNoZWRJdGVtczogVW5pcXVlVmFsdWVNdWx0aUtleU1hcDx1bmtub3duLCBUPiB8IHVuZGVmaW5lZCxcbiAgaW5kZXg6IG51bWJlcixcbiAga2V5OiB1bmtub3duLFxuKTogYm9vbGVhbiB7XG4gIGlmIChkZXRhY2hlZEl0ZW1zICE9PSB1bmRlZmluZWQgJiYgZGV0YWNoZWRJdGVtcy5oYXMoa2V5KSkge1xuICAgIHByZXZDb2xsZWN0aW9uLmF0dGFjaChpbmRleCwgZGV0YWNoZWRJdGVtcy5nZXQoa2V5KSEpO1xuICAgIGRldGFjaGVkSXRlbXMuZGVsZXRlKGtleSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVPckF0dGFjaDxULCBWPihcbiAgbGl2ZUNvbGxlY3Rpb246IExpdmVDb2xsZWN0aW9uPFQsIFY+LFxuICBkZXRhY2hlZEl0ZW1zOiBVbmlxdWVWYWx1ZU11bHRpS2V5TWFwPHVua25vd24sIFQ+IHwgdW5kZWZpbmVkLFxuICB0cmFja0J5Rm46IFRyYWNrQnlGdW5jdGlvbjx1bmtub3duPixcbiAgaW5kZXg6IG51bWJlcixcbiAgdmFsdWU6IFYsXG4pIHtcbiAgaWYgKCFhdHRhY2hQcmV2aW91c2x5RGV0YWNoZWQobGl2ZUNvbGxlY3Rpb24sIGRldGFjaGVkSXRlbXMsIGluZGV4LCB0cmFja0J5Rm4oaW5kZXgsIHZhbHVlKSkpIHtcbiAgICBjb25zdCBuZXdJdGVtID0gbGl2ZUNvbGxlY3Rpb24uY3JlYXRlKGluZGV4LCB2YWx1ZSk7XG4gICAgbGl2ZUNvbGxlY3Rpb24uYXR0YWNoKGluZGV4LCBuZXdJdGVtKTtcbiAgfSBlbHNlIHtcbiAgICBsaXZlQ29sbGVjdGlvbi51cGRhdGVWYWx1ZShpbmRleCwgdmFsdWUpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGluaXRMaXZlSXRlbXNJblRoZUZ1dHVyZTxUPihcbiAgbGl2ZUNvbGxlY3Rpb246IExpdmVDb2xsZWN0aW9uPHVua25vd24sIHVua25vd24+LFxuICBzdGFydDogbnVtYmVyLFxuICBlbmQ6IG51bWJlcixcbiAgdHJhY2tCeUZuOiBUcmFja0J5RnVuY3Rpb248dW5rbm93bj4sXG4pOiBTZXQ8dW5rbm93bj4ge1xuICBjb25zdCBrZXlzID0gbmV3IFNldCgpO1xuICBmb3IgKGxldCBpID0gc3RhcnQ7IGkgPD0gZW5kOyBpKyspIHtcbiAgICBrZXlzLmFkZCh0cmFja0J5Rm4oaSwgbGl2ZUNvbGxlY3Rpb24uYXQoaSkpKTtcbiAgfVxuICByZXR1cm4ga2V5cztcbn1cblxuLyoqXG4gKiBBIHNwZWNpZmljLCBwYXJ0aWFsIGltcGxlbWVudGF0aW9uIG9mIHRoZSBNYXAgaW50ZXJmYWNlIHdpdGggdGhlIGZvbGxvd2luZyBjaGFyYWN0ZXJpc3RpY3M6XG4gKiAtIGFsbG93cyBtdWx0aXBsZSB2YWx1ZXMgZm9yIGEgZ2l2ZW4ga2V5O1xuICogLSBtYWludGFpbiBGSUZPIG9yZGVyIGZvciBtdWx0aXBsZSB2YWx1ZXMgY29ycmVzcG9uZGluZyB0byBhIGdpdmVuIGtleTtcbiAqIC0gYXNzdW1lcyB0aGF0IGFsbCB2YWx1ZXMgYXJlIHVuaXF1ZS5cbiAqXG4gKiBUaGUgaW1wbGVtZW50YXRpb24gYWltcyBhdCBoYXZpbmcgdGhlIG1pbmltYWwgb3ZlcmhlYWQgZm9yIGNhc2VzIHdoZXJlIGtleXMgYXJlIF9ub3RfIGR1cGxpY2F0ZWRcbiAqICh0aGUgbW9zdCBjb21tb24gY2FzZSBpbiB0aGUgbGlzdCByZWNvbmNpbGlhdGlvbiBhbGdvcml0aG0pLiBUbyBhY2hpZXZlIHRoaXMsIHRoZSBmaXJzdCB2YWx1ZSBmb3JcbiAqIGEgZ2l2ZW4ga2V5IGlzIHN0b3JlZCBpbiBhIHJlZ3VsYXIgbWFwLiBUaGVuLCB3aGVuIG1vcmUgdmFsdWVzIGFyZSBzZXQgZm9yIGEgZ2l2ZW4ga2V5LCB3ZVxuICogbWFpbnRhaW4gYSBmb3JtIG9mIGxpbmtlZCBsaXN0IGluIGEgc2VwYXJhdGUgbWFwLiBUbyBtYWludGFpbiB0aGlzIGxpbmtlZCBsaXN0IHdlIGFzc3VtZSB0aGF0IGFsbFxuICogdmFsdWVzIChpbiB0aGUgZW50aXJlIGNvbGxlY3Rpb24pIGFyZSB1bmlxdWUuXG4gKi9cbmV4cG9ydCBjbGFzcyBVbmlxdWVWYWx1ZU11bHRpS2V5TWFwPEssIFY+IHtcbiAgLy8gQSBtYXAgZnJvbSBhIGtleSB0byB0aGUgZmlyc3QgdmFsdWUgY29ycmVzcG9uZGluZyB0byB0aGlzIGtleS5cbiAgcHJpdmF0ZSBrdk1hcCA9IG5ldyBNYXA8SywgVj4oKTtcbiAgLy8gQSBtYXAgdGhhdCBhY3RzIGFzIGEgbGlua2VkIGxpc3Qgb2YgdmFsdWVzIC0gZWFjaCB2YWx1ZSBtYXBzIHRvIHRoZSBuZXh0IHZhbHVlIGluIHRoaXMgXCJsaW5rZWRcbiAgLy8gbGlzdFwiICh0aGlzIG9ubHkgd29ya3MgaWYgdmFsdWVzIGFyZSB1bmlxdWUpLiBBbGxvY2F0ZWQgbGF6aWx5IHRvIGF2b2lkIG1lbW9yeSBjb25zdW1wdGlvbiB3aGVuXG4gIC8vIHRoZXJlIGFyZSBubyBkdXBsaWNhdGVkIHZhbHVlcy5cbiAgcHJpdmF0ZSBfdk1hcDogTWFwPFYsIFY+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuXG4gIGhhcyhrZXk6IEspOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5rdk1hcC5oYXMoa2V5KTtcbiAgfVxuXG4gIGRlbGV0ZShrZXk6IEspOiBib29sZWFuIHtcbiAgICBpZiAoIXRoaXMuaGFzKGtleSkpIHJldHVybiBmYWxzZTtcblxuICAgIGNvbnN0IHZhbHVlID0gdGhpcy5rdk1hcC5nZXQoa2V5KSE7XG4gICAgaWYgKHRoaXMuX3ZNYXAgIT09IHVuZGVmaW5lZCAmJiB0aGlzLl92TWFwLmhhcyh2YWx1ZSkpIHtcbiAgICAgIHRoaXMua3ZNYXAuc2V0KGtleSwgdGhpcy5fdk1hcC5nZXQodmFsdWUpISk7XG4gICAgICB0aGlzLl92TWFwLmRlbGV0ZSh2YWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMua3ZNYXAuZGVsZXRlKGtleSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBnZXQoa2V5OiBLKTogViB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMua3ZNYXAuZ2V0KGtleSk7XG4gIH1cblxuICBzZXQoa2V5OiBLLCB2YWx1ZTogVik6IHZvaWQge1xuICAgIGlmICh0aGlzLmt2TWFwLmhhcyhrZXkpKSB7XG4gICAgICBsZXQgcHJldlZhbHVlID0gdGhpcy5rdk1hcC5nZXQoa2V5KSE7XG4gICAgICBuZ0Rldk1vZGUgJiZcbiAgICAgICAgYXNzZXJ0Tm90U2FtZShwcmV2VmFsdWUsIHZhbHVlLCBgRGV0ZWN0ZWQgYSBkdXBsaWNhdGVkIHZhbHVlICR7dmFsdWV9IGZvciB0aGUga2V5ICR7a2V5fWApO1xuXG4gICAgICBpZiAodGhpcy5fdk1hcCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRoaXMuX3ZNYXAgPSBuZXcgTWFwKCk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHZNYXAgPSB0aGlzLl92TWFwO1xuICAgICAgd2hpbGUgKHZNYXAuaGFzKHByZXZWYWx1ZSkpIHtcbiAgICAgICAgcHJldlZhbHVlID0gdk1hcC5nZXQocHJldlZhbHVlKSE7XG4gICAgICB9XG4gICAgICB2TWFwLnNldChwcmV2VmFsdWUsIHZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5rdk1hcC5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgZm9yRWFjaChjYjogKHY6IFYsIGs6IEspID0+IHZvaWQpIHtcbiAgICBmb3IgKGxldCBba2V5LCB2YWx1ZV0gb2YgdGhpcy5rdk1hcCkge1xuICAgICAgY2IodmFsdWUsIGtleSk7XG4gICAgICBpZiAodGhpcy5fdk1hcCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbnN0IHZNYXAgPSB0aGlzLl92TWFwO1xuICAgICAgICB3aGlsZSAodk1hcC5oYXModmFsdWUpKSB7XG4gICAgICAgICAgdmFsdWUgPSB2TWFwLmdldCh2YWx1ZSkhO1xuICAgICAgICAgIGNiKHZhbHVlLCBrZXkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=