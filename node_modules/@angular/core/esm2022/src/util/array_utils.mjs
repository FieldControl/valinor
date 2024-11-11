/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { assertEqual, assertLessThanOrEqual } from './assert';
/**
 * Determines if the contents of two arrays is identical
 *
 * @param a first array
 * @param b second array
 * @param identityAccessor Optional function for extracting stable object identity from a value in
 *     the array.
 */
export function arrayEquals(a, b, identityAccessor) {
    if (a.length !== b.length)
        return false;
    for (let i = 0; i < a.length; i++) {
        let valueA = a[i];
        let valueB = b[i];
        if (identityAccessor) {
            valueA = identityAccessor(valueA);
            valueB = identityAccessor(valueB);
        }
        if (valueB !== valueA) {
            return false;
        }
    }
    return true;
}
/**
 * Flattens an array.
 */
export function flatten(list) {
    return list.flat(Number.POSITIVE_INFINITY);
}
export function deepForEach(input, fn) {
    input.forEach((value) => (Array.isArray(value) ? deepForEach(value, fn) : fn(value)));
}
export function addToArray(arr, index, value) {
    // perf: array.push is faster than array.splice!
    if (index >= arr.length) {
        arr.push(value);
    }
    else {
        arr.splice(index, 0, value);
    }
}
export function removeFromArray(arr, index) {
    // perf: array.pop is faster than array.splice!
    if (index >= arr.length - 1) {
        return arr.pop();
    }
    else {
        return arr.splice(index, 1)[0];
    }
}
export function newArray(size, value) {
    const list = [];
    for (let i = 0; i < size; i++) {
        list.push(value);
    }
    return list;
}
/**
 * Remove item from array (Same as `Array.splice()` but faster.)
 *
 * `Array.splice()` is not as fast because it has to allocate an array for the elements which were
 * removed. This causes memory pressure and slows down code when most of the time we don't
 * care about the deleted items array.
 *
 * https://jsperf.com/fast-array-splice (About 20x faster)
 *
 * @param array Array to splice
 * @param index Index of element in array to remove.
 * @param count Number of items to remove.
 */
export function arraySplice(array, index, count) {
    const length = array.length - count;
    while (index < length) {
        array[index] = array[index + count];
        index++;
    }
    while (count--) {
        array.pop(); // shrink the array
    }
}
/**
 * Same as `Array.splice(index, 0, value)` but faster.
 *
 * `Array.splice()` is not fast because it has to allocate an array for the elements which were
 * removed. This causes memory pressure and slows down code when most of the time we don't
 * care about the deleted items array.
 *
 * @param array Array to splice.
 * @param index Index in array where the `value` should be added.
 * @param value Value to add to array.
 */
export function arrayInsert(array, index, value) {
    ngDevMode && assertLessThanOrEqual(index, array.length, "Can't insert past array end.");
    let end = array.length;
    while (end > index) {
        const previousEnd = end - 1;
        array[end] = array[previousEnd];
        end = previousEnd;
    }
    array[index] = value;
}
/**
 * Same as `Array.splice2(index, 0, value1, value2)` but faster.
 *
 * `Array.splice()` is not fast because it has to allocate an array for the elements which were
 * removed. This causes memory pressure and slows down code when most of the time we don't
 * care about the deleted items array.
 *
 * @param array Array to splice.
 * @param index Index in array where the `value` should be added.
 * @param value1 Value to add to array.
 * @param value2 Value to add to array.
 */
export function arrayInsert2(array, index, value1, value2) {
    ngDevMode && assertLessThanOrEqual(index, array.length, "Can't insert past array end.");
    let end = array.length;
    if (end == index) {
        // inserting at the end.
        array.push(value1, value2);
    }
    else if (end === 1) {
        // corner case when we have less items in array than we have items to insert.
        array.push(value2, array[0]);
        array[0] = value1;
    }
    else {
        end--;
        array.push(array[end - 1], array[end]);
        while (end > index) {
            const previousEnd = end - 2;
            array[end] = array[previousEnd];
            end--;
        }
        array[index] = value1;
        array[index + 1] = value2;
    }
}
/**
 * Get an index of an `value` in a sorted `array`.
 *
 * NOTE:
 * - This uses binary search algorithm for fast removals.
 *
 * @param array A sorted array to binary search.
 * @param value The value to look for.
 * @returns index of the value.
 *   - positive index if value found.
 *   - negative index if value not found. (`~index` to get the value where it should have been
 *     located)
 */
export function arrayIndexOfSorted(array, value) {
    return _arrayIndexOfSorted(array, value, 0);
}
/**
 * Set a `value` for a `key`.
 *
 * @param keyValueArray to modify.
 * @param key The key to locate or create.
 * @param value The value to set for a `key`.
 * @returns index (always even) of where the value vas set.
 */
export function keyValueArraySet(keyValueArray, key, value) {
    let index = keyValueArrayIndexOf(keyValueArray, key);
    if (index >= 0) {
        // if we found it set it.
        keyValueArray[index | 1] = value;
    }
    else {
        index = ~index;
        arrayInsert2(keyValueArray, index, key, value);
    }
    return index;
}
/**
 * Retrieve a `value` for a `key` (on `undefined` if not found.)
 *
 * @param keyValueArray to search.
 * @param key The key to locate.
 * @return The `value` stored at the `key` location or `undefined if not found.
 */
export function keyValueArrayGet(keyValueArray, key) {
    const index = keyValueArrayIndexOf(keyValueArray, key);
    if (index >= 0) {
        // if we found it retrieve it.
        return keyValueArray[index | 1];
    }
    return undefined;
}
/**
 * Retrieve a `key` index value in the array or `-1` if not found.
 *
 * @param keyValueArray to search.
 * @param key The key to locate.
 * @returns index of where the key is (or should have been.)
 *   - positive (even) index if key found.
 *   - negative index if key not found. (`~index` (even) to get the index where it should have
 *     been inserted.)
 */
export function keyValueArrayIndexOf(keyValueArray, key) {
    return _arrayIndexOfSorted(keyValueArray, key, 1);
}
/**
 * Delete a `key` (and `value`) from the `KeyValueArray`.
 *
 * @param keyValueArray to modify.
 * @param key The key to locate or delete (if exist).
 * @returns index of where the key was (or should have been.)
 *   - positive (even) index if key found and deleted.
 *   - negative index if key not found. (`~index` (even) to get the index where it should have
 *     been.)
 */
export function keyValueArrayDelete(keyValueArray, key) {
    const index = keyValueArrayIndexOf(keyValueArray, key);
    if (index >= 0) {
        // if we found it remove it.
        arraySplice(keyValueArray, index, 2);
    }
    return index;
}
/**
 * INTERNAL: Get an index of an `value` in a sorted `array` by grouping search by `shift`.
 *
 * NOTE:
 * - This uses binary search algorithm for fast removals.
 *
 * @param array A sorted array to binary search.
 * @param value The value to look for.
 * @param shift grouping shift.
 *   - `0` means look at every location
 *   - `1` means only look at every other (even) location (the odd locations are to be ignored as
 *         they are values.)
 * @returns index of the value.
 *   - positive index if value found.
 *   - negative index if value not found. (`~index` to get the value where it should have been
 * inserted)
 */
function _arrayIndexOfSorted(array, value, shift) {
    ngDevMode && assertEqual(Array.isArray(array), true, 'Expecting an array');
    let start = 0;
    let end = array.length >> shift;
    while (end !== start) {
        const middle = start + ((end - start) >> 1); // find the middle.
        const current = array[middle << shift];
        if (value === current) {
            return middle << shift;
        }
        else if (current > value) {
            end = middle;
        }
        else {
            start = middle + 1; // We already searched middle so make it non-inclusive by adding 1
        }
    }
    return ~(end << shift);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJyYXlfdXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy91dGlsL2FycmF5X3V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxXQUFXLEVBQUUscUJBQXFCLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFFNUQ7Ozs7Ozs7R0FPRztBQUNILE1BQU0sVUFBVSxXQUFXLENBQUksQ0FBTSxFQUFFLENBQU0sRUFBRSxnQkFBd0M7SUFDckYsSUFBSSxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxNQUFNO1FBQUUsT0FBTyxLQUFLLENBQUM7SUFDeEMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztRQUNsQyxJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEIsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2xCLElBQUksZ0JBQWdCLEVBQUUsQ0FBQztZQUNyQixNQUFNLEdBQUcsZ0JBQWdCLENBQUMsTUFBTSxDQUFRLENBQUM7WUFDekMsTUFBTSxHQUFHLGdCQUFnQixDQUFDLE1BQU0sQ0FBUSxDQUFDO1FBQzNDLENBQUM7UUFDRCxJQUFJLE1BQU0sS0FBSyxNQUFNLEVBQUUsQ0FBQztZQUN0QixPQUFPLEtBQUssQ0FBQztRQUNmLENBQUM7SUFDSCxDQUFDO0lBQ0QsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDO0FBRUQ7O0dBRUc7QUFDSCxNQUFNLFVBQVUsT0FBTyxDQUFDLElBQVc7SUFDakMsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQzdDLENBQUM7QUFFRCxNQUFNLFVBQVUsV0FBVyxDQUFJLEtBQW9C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Q0FBQyxFQUFFLENBQUM7UUFDZiw0QkFBNEI7UUFDNUIsV0FBVyxDQUFDLGFBQWEsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUNELE9BQU8sS0FBSyxDQUFDO0FBQ2YsQ0FBQztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7O0dBZ0JHO0FBQ0gsU0FBUyxtQkFBbUIsQ0FBQyxLQUFlLEVBQUUsS0FBYSxFQUFFLEtBQWE7SUFDeEUsU0FBUyxJQUFJLFdBQVcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLElBQUksRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO0lBQzNFLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztJQUNkLElBQUksR0FBRyxHQUFHLEtBQUssQ0FBQyxNQUFNLElBQUksS0FBSyxDQUFDO0lBQ2hDLE9BQU8sR0FBRyxLQUFLLEtBQUssRUFBRSxDQUFDO1FBQ3JCLE1BQU0sTUFBTSxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsbUJBQW1CO1FBQ2hFLE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxNQUFNLElBQUksS0FBSyxDQUFDLENBQUM7UUFDdkMsSUFBSSxLQUFLLEtBQUssT0FBTyxFQUFFLENBQUM7WUFDdEIsT0FBTyxNQUFNLElBQUksS0FBSyxDQUFDO1FBQ3pCLENBQUM7YUFBTSxJQUFJLE9BQU8sR0FBRyxLQUFLLEVBQUUsQ0FBQztZQUMzQixHQUFHLEdBQUcsTUFBTSxDQUFDO1FBQ2YsQ0FBQzthQUFNLENBQUM7WUFDTixLQUFLLEdBQUcsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLGtFQUFrRTtRQUN4RixDQUFDO0lBQ0gsQ0FBQztJQUNELE9BQU8sQ0FBQyxDQUFDLEdBQUcsSUFBSSxLQUFLLENBQUMsQ0FBQztBQUN6QixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2Fzc2VydEVxdWFsLCBhc3NlcnRMZXNzVGhhbk9yRXF1YWx9IGZyb20gJy4vYXNzZXJ0JztcblxuLyoqXG4gKiBEZXRlcm1pbmVzIGlmIHRoZSBjb250ZW50cyBvZiB0d28gYXJyYXlzIGlzIGlkZW50aWNhbFxuICpcbiAqIEBwYXJhbSBhIGZpcnN0IGFycmF5XG4gKiBAcGFyYW0gYiBzZWNvbmQgYXJyYXlcbiAqIEBwYXJhbSBpZGVudGl0eUFjY2Vzc29yIE9wdGlvbmFsIGZ1bmN0aW9uIGZvciBleHRyYWN0aW5nIHN0YWJsZSBvYmplY3QgaWRlbnRpdHkgZnJvbSBhIHZhbHVlIGluXG4gKiAgICAgdGhlIGFycmF5LlxuICovXG5leHBvcnQgZnVuY3Rpb24gYXJyYXlFcXVhbHM8VD4oYTogVFtdLCBiOiBUW10sIGlkZW50aXR5QWNjZXNzb3I/OiAodmFsdWU6IFQpID0+IHVua25vd24pOiBib29sZWFuIHtcbiAgaWYgKGEubGVuZ3RoICE9PSBiLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGEubGVuZ3RoOyBpKyspIHtcbiAgICBsZXQgdmFsdWVBID0gYVtpXTtcbiAgICBsZXQgdmFsdWVCID0gYltpXTtcbiAgICBpZiAoaWRlbnRpdHlBY2Nlc3Nvcikge1xuICAgICAgdmFsdWVBID0gaWRlbnRpdHlBY2Nlc3Nvcih2YWx1ZUEpIGFzIGFueTtcbiAgICAgIHZhbHVlQiA9IGlkZW50aXR5QWNjZXNzb3IodmFsdWVCKSBhcyBhbnk7XG4gICAgfVxuICAgIGlmICh2YWx1ZUIgIT09IHZhbHVlQSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuLyoqXG4gKiBGbGF0dGVucyBhbiBhcnJheS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZsYXR0ZW4obGlzdDogYW55W10pOiBhbnlbXSB7XG4gIHJldHVybiBsaXN0LmZsYXQoTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlZXBGb3JFYWNoPFQ+KGlucHV0OiAoVCB8IGFueVtdKVtdLCBmbjogKHZhbHVlOiBUKSA9PiB2b2lkKTogdm9pZCB7XG4gIGlucHV0LmZvckVhY2goKHZhbHVlKSA9PiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkgPyBkZWVwRm9yRWFjaCh2YWx1ZSwgZm4pIDogZm4odmFsdWUpKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRUb0FycmF5KGFycjogYW55W10sIGluZGV4OiBudW1iZXIsIHZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgLy8gcGVyZjogYXJyYXkucHVzaCBpcyBmYXN0ZXIgdGhhbiBhcnJheS5zcGxpY2UhXG4gIGlmIChpbmRleCA+PSBhcnIubGVuZ3RoKSB7XG4gICAgYXJyLnB1c2godmFsdWUpO1xuICB9IGVsc2Uge1xuICAgIGFyci5zcGxpY2UoaW5kZXgsIDAsIHZhbHVlKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlRnJvbUFycmF5KGFycjogYW55W10sIGluZGV4OiBudW1iZXIpOiBhbnkge1xuICAvLyBwZXJmOiBhcnJheS5wb3AgaXMgZmFzdGVyIHRoYW4gYXJyYXkuc3BsaWNlIVxuICBpZiAoaW5kZXggPj0gYXJyLmxlbmd0aCAtIDEpIHtcbiAgICByZXR1cm4gYXJyLnBvcCgpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBhcnIuc3BsaWNlKGluZGV4LCAxKVswXTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbmV3QXJyYXk8VCA9IGFueT4oc2l6ZTogbnVtYmVyKTogVFtdO1xuZXhwb3J0IGZ1bmN0aW9uIG5ld0FycmF5PFQ+KHNpemU6IG51bWJlciwgdmFsdWU6IFQpOiBUW107XG5leHBvcnQgZnVuY3Rpb24gbmV3QXJyYXk8VD4oc2l6ZTogbnVtYmVyLCB2YWx1ZT86IFQpOiBUW10ge1xuICBjb25zdCBsaXN0OiBUW10gPSBbXTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaXplOyBpKyspIHtcbiAgICBsaXN0LnB1c2godmFsdWUhKTtcbiAgfVxuICByZXR1cm4gbGlzdDtcbn1cblxuLyoqXG4gKiBSZW1vdmUgaXRlbSBmcm9tIGFycmF5IChTYW1lIGFzIGBBcnJheS5zcGxpY2UoKWAgYnV0IGZhc3Rlci4pXG4gKlxuICogYEFycmF5LnNwbGljZSgpYCBpcyBub3QgYXMgZmFzdCBiZWNhdXNlIGl0IGhhcyB0byBhbGxvY2F0ZSBhbiBhcnJheSBmb3IgdGhlIGVsZW1lbnRzIHdoaWNoIHdlcmVcbiAqIHJlbW92ZWQuIFRoaXMgY2F1c2VzIG1lbW9yeSBwcmVzc3VyZSBhbmQgc2xvd3MgZG93biBjb2RlIHdoZW4gbW9zdCBvZiB0aGUgdGltZSB3ZSBkb24ndFxuICogY2FyZSBhYm91dCB0aGUgZGVsZXRlZCBpdGVtcyBhcnJheS5cbiAqXG4gKiBodHRwczovL2pzcGVyZi5jb20vZmFzdC1hcnJheS1zcGxpY2UgKEFib3V0IDIweCBmYXN0ZXIpXG4gKlxuICogQHBhcmFtIGFycmF5IEFycmF5IHRvIHNwbGljZVxuICogQHBhcmFtIGluZGV4IEluZGV4IG9mIGVsZW1lbnQgaW4gYXJyYXkgdG8gcmVtb3ZlLlxuICogQHBhcmFtIGNvdW50IE51bWJlciBvZiBpdGVtcyB0byByZW1vdmUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhcnJheVNwbGljZShhcnJheTogYW55W10sIGluZGV4OiBudW1iZXIsIGNvdW50OiBudW1iZXIpOiB2b2lkIHtcbiAgY29uc3QgbGVuZ3RoID0gYXJyYXkubGVuZ3RoIC0gY291bnQ7XG4gIHdoaWxlIChpbmRleCA8IGxlbmd0aCkge1xuICAgIGFycmF5W2luZGV4XSA9IGFycmF5W2luZGV4ICsgY291bnRdO1xuICAgIGluZGV4Kys7XG4gIH1cbiAgd2hpbGUgKGNvdW50LS0pIHtcbiAgICBhcnJheS5wb3AoKTsgLy8gc2hyaW5rIHRoZSBhcnJheVxuICB9XG59XG5cbi8qKlxuICogU2FtZSBhcyBgQXJyYXkuc3BsaWNlKGluZGV4LCAwLCB2YWx1ZSlgIGJ1dCBmYXN0ZXIuXG4gKlxuICogYEFycmF5LnNwbGljZSgpYCBpcyBub3QgZmFzdCBiZWNhdXNlIGl0IGhhcyB0byBhbGxvY2F0ZSBhbiBhcnJheSBmb3IgdGhlIGVsZW1lbnRzIHdoaWNoIHdlcmVcbiAqIHJlbW92ZWQuIFRoaXMgY2F1c2VzIG1lbW9yeSBwcmVzc3VyZSBhbmQgc2xvd3MgZG93biBjb2RlIHdoZW4gbW9zdCBvZiB0aGUgdGltZSB3ZSBkb24ndFxuICogY2FyZSBhYm91dCB0aGUgZGVsZXRlZCBpdGVtcyBhcnJheS5cbiAqXG4gKiBAcGFyYW0gYXJyYXkgQXJyYXkgdG8gc3BsaWNlLlxuICogQHBhcmFtIGluZGV4IEluZGV4IGluIGFycmF5IHdoZXJlIHRoZSBgdmFsdWVgIHNob3VsZCBiZSBhZGRlZC5cbiAqIEBwYXJhbSB2YWx1ZSBWYWx1ZSB0byBhZGQgdG8gYXJyYXkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhcnJheUluc2VydChhcnJheTogYW55W10sIGluZGV4OiBudW1iZXIsIHZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgbmdEZXZNb2RlICYmIGFzc2VydExlc3NUaGFuT3JFcXVhbChpbmRleCwgYXJyYXkubGVuZ3RoLCBcIkNhbid0IGluc2VydCBwYXN0IGFycmF5IGVuZC5cIik7XG4gIGxldCBlbmQgPSBhcnJheS5sZW5ndGg7XG4gIHdoaWxlIChlbmQgPiBpbmRleCkge1xuICAgIGNvbnN0IHByZXZpb3VzRW5kID0gZW5kIC0gMTtcbiAgICBhcnJheVtlbmRdID0gYXJyYXlbcHJldmlvdXNFbmRdO1xuICAgIGVuZCA9IHByZXZpb3VzRW5kO1xuICB9XG4gIGFycmF5W2luZGV4XSA9IHZhbHVlO1xufVxuXG4vKipcbiAqIFNhbWUgYXMgYEFycmF5LnNwbGljZTIoaW5kZXgsIDAsIHZhbHVlMSwgdmFsdWUyKWAgYnV0IGZhc3Rlci5cbiAqXG4gKiBgQXJyYXkuc3BsaWNlKClgIGlzIG5vdCBmYXN0IGJlY2F1c2UgaXQgaGFzIHRvIGFsbG9jYXRlIGFuIGFycmF5IGZvciB0aGUgZWxlbWVudHMgd2hpY2ggd2VyZVxuICogcmVtb3ZlZC4gVGhpcyBjYXVzZXMgbWVtb3J5IHByZXNzdXJlIGFuZCBzbG93cyBkb3duIGNvZGUgd2hlbiBtb3N0IG9mIHRoZSB0aW1lIHdlIGRvbid0XG4gKiBjYXJlIGFib3V0IHRoZSBkZWxldGVkIGl0ZW1zIGFycmF5LlxuICpcbiAqIEBwYXJhbSBhcnJheSBBcnJheSB0byBzcGxpY2UuXG4gKiBAcGFyYW0gaW5kZXggSW5kZXggaW4gYXJyYXkgd2hlcmUgdGhlIGB2YWx1ZWAgc2hvdWxkIGJlIGFkZGVkLlxuICogQHBhcmFtIHZhbHVlMSBWYWx1ZSB0byBhZGQgdG8gYXJyYXkuXG4gKiBAcGFyYW0gdmFsdWUyIFZhbHVlIHRvIGFkZCB0byBhcnJheS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFycmF5SW5zZXJ0MihhcnJheTogYW55W10sIGluZGV4OiBudW1iZXIsIHZhbHVlMTogYW55LCB2YWx1ZTI6IGFueSk6IHZvaWQge1xuICBuZ0Rldk1vZGUgJiYgYXNzZXJ0TGVzc1RoYW5PckVxdWFsKGluZGV4LCBhcnJheS5sZW5ndGgsIFwiQ2FuJ3QgaW5zZXJ0IHBhc3QgYXJyYXkgZW5kLlwiKTtcbiAgbGV0IGVuZCA9IGFycmF5Lmxlbmd0aDtcbiAgaWYgKGVuZCA9PSBpbmRleCkge1xuICAgIC8vIGluc2VydGluZyBhdCB0aGUgZW5kLlxuICAgIGFycmF5LnB1c2godmFsdWUxLCB2YWx1ZTIpO1xuICB9IGVsc2UgaWYgKGVuZCA9PT0gMSkge1xuICAgIC8vIGNvcm5lciBjYXNlIHdoZW4gd2UgaGF2ZSBsZXNzIGl0ZW1zIGluIGFycmF5IHRoYW4gd2UgaGF2ZSBpdGVtcyB0byBpbnNlcnQuXG4gICAgYXJyYXkucHVzaCh2YWx1ZTIsIGFycmF5WzBdKTtcbiAgICBhcnJheVswXSA9IHZhbHVlMTtcbiAgfSBlbHNlIHtcbiAgICBlbmQtLTtcbiAgICBhcnJheS5wdXNoKGFycmF5W2VuZCAtIDFdLCBhcnJheVtlbmRdKTtcbiAgICB3aGlsZSAoZW5kID4gaW5kZXgpIHtcbiAgICAgIGNvbnN0IHByZXZpb3VzRW5kID0gZW5kIC0gMjtcbiAgICAgIGFycmF5W2VuZF0gPSBhcnJheVtwcmV2aW91c0VuZF07XG4gICAgICBlbmQtLTtcbiAgICB9XG4gICAgYXJyYXlbaW5kZXhdID0gdmFsdWUxO1xuICAgIGFycmF5W2luZGV4ICsgMV0gPSB2YWx1ZTI7XG4gIH1cbn1cblxuLyoqXG4gKiBHZXQgYW4gaW5kZXggb2YgYW4gYHZhbHVlYCBpbiBhIHNvcnRlZCBgYXJyYXlgLlxuICpcbiAqIE5PVEU6XG4gKiAtIFRoaXMgdXNlcyBiaW5hcnkgc2VhcmNoIGFsZ29yaXRobSBmb3IgZmFzdCByZW1vdmFscy5cbiAqXG4gKiBAcGFyYW0gYXJyYXkgQSBzb3J0ZWQgYXJyYXkgdG8gYmluYXJ5IHNlYXJjaC5cbiAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUgdG8gbG9vayBmb3IuXG4gKiBAcmV0dXJucyBpbmRleCBvZiB0aGUgdmFsdWUuXG4gKiAgIC0gcG9zaXRpdmUgaW5kZXggaWYgdmFsdWUgZm91bmQuXG4gKiAgIC0gbmVnYXRpdmUgaW5kZXggaWYgdmFsdWUgbm90IGZvdW5kLiAoYH5pbmRleGAgdG8gZ2V0IHRoZSB2YWx1ZSB3aGVyZSBpdCBzaG91bGQgaGF2ZSBiZWVuXG4gKiAgICAgbG9jYXRlZClcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFycmF5SW5kZXhPZlNvcnRlZChhcnJheTogc3RyaW5nW10sIHZhbHVlOiBzdHJpbmcpOiBudW1iZXIge1xuICByZXR1cm4gX2FycmF5SW5kZXhPZlNvcnRlZChhcnJheSwgdmFsdWUsIDApO1xufVxuXG4vKipcbiAqIGBLZXlWYWx1ZUFycmF5YCBpcyBhbiBhcnJheSB3aGVyZSBldmVuIHBvc2l0aW9ucyBjb250YWluIGtleXMgYW5kIG9kZCBwb3NpdGlvbnMgY29udGFpbiB2YWx1ZXMuXG4gKlxuICogYEtleVZhbHVlQXJyYXlgIHByb3ZpZGVzIGEgdmVyeSBlZmZpY2llbnQgd2F5IG9mIGl0ZXJhdGluZyBvdmVyIGl0cyBjb250ZW50cy4gRm9yIHNtYWxsXG4gKiBzZXRzICh+MTApIHRoZSBjb3N0IG9mIGJpbmFyeSBzZWFyY2hpbmcgYW4gYEtleVZhbHVlQXJyYXlgIGhhcyBhYm91dCB0aGUgc2FtZSBwZXJmb3JtYW5jZVxuICogY2hhcmFjdGVyaXN0aWNzIHRoYXQgb2YgYSBgTWFwYCB3aXRoIHNpZ25pZmljYW50bHkgYmV0dGVyIG1lbW9yeSBmb290cHJpbnQuXG4gKlxuICogSWYgdXNlZCBhcyBhIGBNYXBgIHRoZSBrZXlzIGFyZSBzdG9yZWQgaW4gYWxwaGFiZXRpY2FsIG9yZGVyIHNvIHRoYXQgdGhleSBjYW4gYmUgYmluYXJ5IHNlYXJjaGVkXG4gKiBmb3IgcmV0cmlldmFsLlxuICpcbiAqIFNlZTogYGtleVZhbHVlQXJyYXlTZXRgLCBga2V5VmFsdWVBcnJheUdldGAsIGBrZXlWYWx1ZUFycmF5SW5kZXhPZmAsIGBrZXlWYWx1ZUFycmF5RGVsZXRlYC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBLZXlWYWx1ZUFycmF5PFZBTFVFPiBleHRlbmRzIEFycmF5PFZBTFVFIHwgc3RyaW5nPiB7XG4gIF9fYnJhbmRfXzogJ2FycmF5LW1hcCc7XG59XG5cbi8qKlxuICogU2V0IGEgYHZhbHVlYCBmb3IgYSBga2V5YC5cbiAqXG4gKiBAcGFyYW0ga2V5VmFsdWVBcnJheSB0byBtb2RpZnkuXG4gKiBAcGFyYW0ga2V5IFRoZSBrZXkgdG8gbG9jYXRlIG9yIGNyZWF0ZS5cbiAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUgdG8gc2V0IGZvciBhIGBrZXlgLlxuICogQHJldHVybnMgaW5kZXggKGFsd2F5cyBldmVuKSBvZiB3aGVyZSB0aGUgdmFsdWUgdmFzIHNldC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGtleVZhbHVlQXJyYXlTZXQ8Vj4oXG4gIGtleVZhbHVlQXJyYXk6IEtleVZhbHVlQXJyYXk8Vj4sXG4gIGtleTogc3RyaW5nLFxuICB2YWx1ZTogVixcbik6IG51bWJlciB7XG4gIGxldCBpbmRleCA9IGtleVZhbHVlQXJyYXlJbmRleE9mKGtleVZhbHVlQXJyYXksIGtleSk7XG4gIGlmIChpbmRleCA+PSAwKSB7XG4gICAgLy8gaWYgd2UgZm91bmQgaXQgc2V0IGl0LlxuICAgIGtleVZhbHVlQXJyYXlbaW5kZXggfCAxXSA9IHZhbHVlO1xuICB9IGVsc2Uge1xuICAgIGluZGV4ID0gfmluZGV4O1xuICAgIGFycmF5SW5zZXJ0MihrZXlWYWx1ZUFycmF5LCBpbmRleCwga2V5LCB2YWx1ZSk7XG4gIH1cbiAgcmV0dXJuIGluZGV4O1xufVxuXG4vKipcbiAqIFJldHJpZXZlIGEgYHZhbHVlYCBmb3IgYSBga2V5YCAob24gYHVuZGVmaW5lZGAgaWYgbm90IGZvdW5kLilcbiAqXG4gKiBAcGFyYW0ga2V5VmFsdWVBcnJheSB0byBzZWFyY2guXG4gKiBAcGFyYW0ga2V5IFRoZSBrZXkgdG8gbG9jYXRlLlxuICogQHJldHVybiBUaGUgYHZhbHVlYCBzdG9yZWQgYXQgdGhlIGBrZXlgIGxvY2F0aW9uIG9yIGB1bmRlZmluZWQgaWYgbm90IGZvdW5kLlxuICovXG5leHBvcnQgZnVuY3Rpb24ga2V5VmFsdWVBcnJheUdldDxWPihrZXlWYWx1ZUFycmF5OiBLZXlWYWx1ZUFycmF5PFY+LCBrZXk6IHN0cmluZyk6IFYgfCB1bmRlZmluZWQge1xuICBjb25zdCBpbmRleCA9IGtleVZhbHVlQXJyYXlJbmRleE9mKGtleVZhbHVlQXJyYXksIGtleSk7XG4gIGlmIChpbmRleCA+PSAwKSB7XG4gICAgLy8gaWYgd2UgZm91bmQgaXQgcmV0cmlldmUgaXQuXG4gICAgcmV0dXJuIGtleVZhbHVlQXJyYXlbaW5kZXggfCAxXSBhcyBWO1xuICB9XG4gIHJldHVybiB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogUmV0cmlldmUgYSBga2V5YCBpbmRleCB2YWx1ZSBpbiB0aGUgYXJyYXkgb3IgYC0xYCBpZiBub3QgZm91bmQuXG4gKlxuICogQHBhcmFtIGtleVZhbHVlQXJyYXkgdG8gc2VhcmNoLlxuICogQHBhcmFtIGtleSBUaGUga2V5IHRvIGxvY2F0ZS5cbiAqIEByZXR1cm5zIGluZGV4IG9mIHdoZXJlIHRoZSBrZXkgaXMgKG9yIHNob3VsZCBoYXZlIGJlZW4uKVxuICogICAtIHBvc2l0aXZlIChldmVuKSBpbmRleCBpZiBrZXkgZm91bmQuXG4gKiAgIC0gbmVnYXRpdmUgaW5kZXggaWYga2V5IG5vdCBmb3VuZC4gKGB+aW5kZXhgIChldmVuKSB0byBnZXQgdGhlIGluZGV4IHdoZXJlIGl0IHNob3VsZCBoYXZlXG4gKiAgICAgYmVlbiBpbnNlcnRlZC4pXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBrZXlWYWx1ZUFycmF5SW5kZXhPZjxWPihrZXlWYWx1ZUFycmF5OiBLZXlWYWx1ZUFycmF5PFY+LCBrZXk6IHN0cmluZyk6IG51bWJlciB7XG4gIHJldHVybiBfYXJyYXlJbmRleE9mU29ydGVkKGtleVZhbHVlQXJyYXkgYXMgc3RyaW5nW10sIGtleSwgMSk7XG59XG5cbi8qKlxuICogRGVsZXRlIGEgYGtleWAgKGFuZCBgdmFsdWVgKSBmcm9tIHRoZSBgS2V5VmFsdWVBcnJheWAuXG4gKlxuICogQHBhcmFtIGtleVZhbHVlQXJyYXkgdG8gbW9kaWZ5LlxuICogQHBhcmFtIGtleSBUaGUga2V5IHRvIGxvY2F0ZSBvciBkZWxldGUgKGlmIGV4aXN0KS5cbiAqIEByZXR1cm5zIGluZGV4IG9mIHdoZXJlIHRoZSBrZXkgd2FzIChvciBzaG91bGQgaGF2ZSBiZWVuLilcbiAqICAgLSBwb3NpdGl2ZSAoZXZlbikgaW5kZXggaWYga2V5IGZvdW5kIGFuZCBkZWxldGVkLlxuICogICAtIG5lZ2F0aXZlIGluZGV4IGlmIGtleSBub3QgZm91bmQuIChgfmluZGV4YCAoZXZlbikgdG8gZ2V0IHRoZSBpbmRleCB3aGVyZSBpdCBzaG91bGQgaGF2ZVxuICogICAgIGJlZW4uKVxuICovXG5leHBvcnQgZnVuY3Rpb24ga2V5VmFsdWVBcnJheURlbGV0ZTxWPihrZXlWYWx1ZUFycmF5OiBLZXlWYWx1ZUFycmF5PFY+LCBrZXk6IHN0cmluZyk6IG51bWJlciB7XG4gIGNvbnN0IGluZGV4ID0ga2V5VmFsdWVBcnJheUluZGV4T2Yoa2V5VmFsdWVBcnJheSwga2V5KTtcbiAgaWYgKGluZGV4ID49IDApIHtcbiAgICAvLyBpZiB3ZSBmb3VuZCBpdCByZW1vdmUgaXQuXG4gICAgYXJyYXlTcGxpY2Uoa2V5VmFsdWVBcnJheSwgaW5kZXgsIDIpO1xuICB9XG4gIHJldHVybiBpbmRleDtcbn1cblxuLyoqXG4gKiBJTlRFUk5BTDogR2V0IGFuIGluZGV4IG9mIGFuIGB2YWx1ZWAgaW4gYSBzb3J0ZWQgYGFycmF5YCBieSBncm91cGluZyBzZWFyY2ggYnkgYHNoaWZ0YC5cbiAqXG4gKiBOT1RFOlxuICogLSBUaGlzIHVzZXMgYmluYXJ5IHNlYXJjaCBhbGdvcml0aG0gZm9yIGZhc3QgcmVtb3ZhbHMuXG4gKlxuICogQHBhcmFtIGFycmF5IEEgc29ydGVkIGFycmF5IHRvIGJpbmFyeSBzZWFyY2guXG4gKiBAcGFyYW0gdmFsdWUgVGhlIHZhbHVlIHRvIGxvb2sgZm9yLlxuICogQHBhcmFtIHNoaWZ0IGdyb3VwaW5nIHNoaWZ0LlxuICogICAtIGAwYCBtZWFucyBsb29rIGF0IGV2ZXJ5IGxvY2F0aW9uXG4gKiAgIC0gYDFgIG1lYW5zIG9ubHkgbG9vayBhdCBldmVyeSBvdGhlciAoZXZlbikgbG9jYXRpb24gKHRoZSBvZGQgbG9jYXRpb25zIGFyZSB0byBiZSBpZ25vcmVkIGFzXG4gKiAgICAgICAgIHRoZXkgYXJlIHZhbHVlcy4pXG4gKiBAcmV0dXJucyBpbmRleCBvZiB0aGUgdmFsdWUuXG4gKiAgIC0gcG9zaXRpdmUgaW5kZXggaWYgdmFsdWUgZm91bmQuXG4gKiAgIC0gbmVnYXRpdmUgaW5kZXggaWYgdmFsdWUgbm90IGZvdW5kLiAoYH5pbmRleGAgdG8gZ2V0IHRoZSB2YWx1ZSB3aGVyZSBpdCBzaG91bGQgaGF2ZSBiZWVuXG4gKiBpbnNlcnRlZClcbiAqL1xuZnVuY3Rpb24gX2FycmF5SW5kZXhPZlNvcnRlZChhcnJheTogc3RyaW5nW10sIHZhbHVlOiBzdHJpbmcsIHNoaWZ0OiBudW1iZXIpOiBudW1iZXIge1xuICBuZ0Rldk1vZGUgJiYgYXNzZXJ0RXF1YWwoQXJyYXkuaXNBcnJheShhcnJheSksIHRydWUsICdFeHBlY3RpbmcgYW4gYXJyYXknKTtcbiAgbGV0IHN0YXJ0ID0gMDtcbiAgbGV0IGVuZCA9IGFycmF5Lmxlbmd0aCA+PiBzaGlmdDtcbiAgd2hpbGUgKGVuZCAhPT0gc3RhcnQpIHtcbiAgICBjb25zdCBtaWRkbGUgPSBzdGFydCArICgoZW5kIC0gc3RhcnQpID4+IDEpOyAvLyBmaW5kIHRoZSBtaWRkbGUuXG4gICAgY29uc3QgY3VycmVudCA9IGFycmF5W21pZGRsZSA8PCBzaGlmdF07XG4gICAgaWYgKHZhbHVlID09PSBjdXJyZW50KSB7XG4gICAgICByZXR1cm4gbWlkZGxlIDw8IHNoaWZ0O1xuICAgIH0gZWxzZSBpZiAoY3VycmVudCA+IHZhbHVlKSB7XG4gICAgICBlbmQgPSBtaWRkbGU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0YXJ0ID0gbWlkZGxlICsgMTsgLy8gV2UgYWxyZWFkeSBzZWFyY2hlZCBtaWRkbGUgc28gbWFrZSBpdCBub24taW5jbHVzaXZlIGJ5IGFkZGluZyAxXG4gICAgfVxuICB9XG4gIHJldHVybiB+KGVuZCA8PCBzaGlmdCk7XG59XG4iXX0=