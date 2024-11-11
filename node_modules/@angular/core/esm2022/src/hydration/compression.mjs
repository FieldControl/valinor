/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { REFERENCE_NODE_BODY, REFERENCE_NODE_HOST } from './interfaces';
/**
 * Regexp that extracts a reference node information from the compressed node location.
 * The reference node is represented as either:
 *  - a number which points to an LView slot
 *  - the `b` char which indicates that the lookup should start from the `document.body`
 *  - the `h` char to start lookup from the component host node (`lView[HOST]`)
 */
const REF_EXTRACTOR_REGEXP = new RegExp(`^(\\d+)*(${REFERENCE_NODE_BODY}|${REFERENCE_NODE_HOST})*(.*)`);
/**
 * Helper function that takes a reference node location and a set of navigation steps
 * (from the reference node) to a target node and outputs a string that represents
 * a location.
 *
 * For example, given: referenceNode = 'b' (body) and path = ['firstChild', 'firstChild',
 * 'nextSibling'], the function returns: `bf2n`.
 */
export function compressNodeLocation(referenceNode, path) {
    const result = [referenceNode];
    for (const segment of path) {
        const lastIdx = result.length - 1;
        if (lastIdx > 0 && result[lastIdx - 1] === segment) {
            // An empty string in a count slot represents 1 occurrence of an instruction.
            const value = (result[lastIdx] || 1);
            result[lastIdx] = value + 1;
        }
        else {
            // Adding a new segment to the path.
            // Using an empty string in a counter field to avoid encoding `1`s
            // into the path, since they are implicit (e.g. `f1n1` vs `fn`), so
            // it's enough to have a single char in this case.
            result.push(segment, '');
        }
    }
    return result.join('');
}
/**
 * Helper function that reverts the `compressNodeLocation` and transforms a given
 * string into an array where at 0th position there is a reference node info and
 * after that it contains information (in pairs) about a navigation step and the
 * number of repetitions.
 *
 * For example, the path like 'bf2n' will be transformed to:
 * ['b', 'firstChild', 2, 'nextSibling', 1].
 *
 * This information is later consumed by the code that navigates the DOM to find
 * a given node by its location.
 */
export function decompressNodeLocation(path) {
    const matches = path.match(REF_EXTRACTOR_REGEXP);
    const [_, refNodeId, refNodeName, rest] = matches;
    // If a reference node is represented by an index, transform it to a number.
    const ref = refNodeId ? parseInt(refNodeId, 10) : refNodeName;
    const steps = [];
    // Match all segments in a path.
    for (const [_, step, count] of rest.matchAll(/(f|n)(\d*)/g)) {
        const repeat = parseInt(count, 10) || 1;
        steps.push(step, repeat);
    }
    return [ref, ...steps];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcHJlc3Npb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9oeWRyYXRpb24vY29tcHJlc3Npb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFxQixtQkFBbUIsRUFBRSxtQkFBbUIsRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUUxRjs7Ozs7O0dBTUc7QUFDSCxNQUFNLG9CQUFvQixHQUFHLElBQUksTUFBTSxDQUNyQyxZQUFZLG1CQUFtQixJQUFJLG1CQUFtQixRQUFRLENBQy9ELENBQUM7QUFFRjs7Ozs7OztHQU9HO0FBQ0gsTUFBTSxVQUFVLG9CQUFvQixDQUFDLGFBQXFCLEVBQUUsSUFBMEI7SUFDcEYsTUFBTSxNQUFNLEdBQTJCLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDdkQsS0FBSyxNQUFNLE9BQU8sSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUMzQixNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUNsQyxJQUFJLE9BQU8sR0FBRyxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsS0FBSyxPQUFPLEVBQUUsQ0FBQztZQUNuRCw2RUFBNkU7WUFDN0UsTUFBTSxLQUFLLEdBQUcsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFXLENBQUM7WUFDL0MsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUM7UUFDOUIsQ0FBQzthQUFNLENBQUM7WUFDTixvQ0FBb0M7WUFDcEMsa0VBQWtFO1lBQ2xFLG1FQUFtRTtZQUNuRSxrREFBa0Q7WUFDbEQsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDM0IsQ0FBQztJQUNILENBQUM7SUFDRCxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDekIsQ0FBQztBQUVEOzs7Ozs7Ozs7OztHQVdHO0FBQ0gsTUFBTSxVQUFVLHNCQUFzQixDQUNwQyxJQUFZO0lBRVosTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsQ0FBRSxDQUFDO0lBQ2xELE1BQU0sQ0FBQyxDQUFDLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUM7SUFDbEQsNEVBQTRFO0lBQzVFLE1BQU0sR0FBRyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDO0lBQzlELE1BQU0sS0FBSyxHQUFvQyxFQUFFLENBQUM7SUFDbEQsZ0NBQWdDO0lBQ2hDLEtBQUssTUFBTSxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDO1FBQzVELE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3hDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBMEIsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBQ0QsT0FBTyxDQUFDLEdBQUcsRUFBRSxHQUFHLEtBQUssQ0FBQyxDQUFDO0FBQ3pCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCB7Tm9kZU5hdmlnYXRpb25TdGVwLCBSRUZFUkVOQ0VfTk9ERV9CT0RZLCBSRUZFUkVOQ0VfTk9ERV9IT1NUfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuXG4vKipcbiAqIFJlZ2V4cCB0aGF0IGV4dHJhY3RzIGEgcmVmZXJlbmNlIG5vZGUgaW5mb3JtYXRpb24gZnJvbSB0aGUgY29tcHJlc3NlZCBub2RlIGxvY2F0aW9uLlxuICogVGhlIHJlZmVyZW5jZSBub2RlIGlzIHJlcHJlc2VudGVkIGFzIGVpdGhlcjpcbiAqICAtIGEgbnVtYmVyIHdoaWNoIHBvaW50cyB0byBhbiBMVmlldyBzbG90XG4gKiAgLSB0aGUgYGJgIGNoYXIgd2hpY2ggaW5kaWNhdGVzIHRoYXQgdGhlIGxvb2t1cCBzaG91bGQgc3RhcnQgZnJvbSB0aGUgYGRvY3VtZW50LmJvZHlgXG4gKiAgLSB0aGUgYGhgIGNoYXIgdG8gc3RhcnQgbG9va3VwIGZyb20gdGhlIGNvbXBvbmVudCBob3N0IG5vZGUgKGBsVmlld1tIT1NUXWApXG4gKi9cbmNvbnN0IFJFRl9FWFRSQUNUT1JfUkVHRVhQID0gbmV3IFJlZ0V4cChcbiAgYF4oXFxcXGQrKSooJHtSRUZFUkVOQ0VfTk9ERV9CT0RZfXwke1JFRkVSRU5DRV9OT0RFX0hPU1R9KSooLiopYCxcbik7XG5cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9uIHRoYXQgdGFrZXMgYSByZWZlcmVuY2Ugbm9kZSBsb2NhdGlvbiBhbmQgYSBzZXQgb2YgbmF2aWdhdGlvbiBzdGVwc1xuICogKGZyb20gdGhlIHJlZmVyZW5jZSBub2RlKSB0byBhIHRhcmdldCBub2RlIGFuZCBvdXRwdXRzIGEgc3RyaW5nIHRoYXQgcmVwcmVzZW50c1xuICogYSBsb2NhdGlvbi5cbiAqXG4gKiBGb3IgZXhhbXBsZSwgZ2l2ZW46IHJlZmVyZW5jZU5vZGUgPSAnYicgKGJvZHkpIGFuZCBwYXRoID0gWydmaXJzdENoaWxkJywgJ2ZpcnN0Q2hpbGQnLFxuICogJ25leHRTaWJsaW5nJ10sIHRoZSBmdW5jdGlvbiByZXR1cm5zOiBgYmYybmAuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb21wcmVzc05vZGVMb2NhdGlvbihyZWZlcmVuY2VOb2RlOiBzdHJpbmcsIHBhdGg6IE5vZGVOYXZpZ2F0aW9uU3RlcFtdKTogc3RyaW5nIHtcbiAgY29uc3QgcmVzdWx0OiBBcnJheTxzdHJpbmcgfCBudW1iZXI+ID0gW3JlZmVyZW5jZU5vZGVdO1xuICBmb3IgKGNvbnN0IHNlZ21lbnQgb2YgcGF0aCkge1xuICAgIGNvbnN0IGxhc3RJZHggPSByZXN1bHQubGVuZ3RoIC0gMTtcbiAgICBpZiAobGFzdElkeCA+IDAgJiYgcmVzdWx0W2xhc3RJZHggLSAxXSA9PT0gc2VnbWVudCkge1xuICAgICAgLy8gQW4gZW1wdHkgc3RyaW5nIGluIGEgY291bnQgc2xvdCByZXByZXNlbnRzIDEgb2NjdXJyZW5jZSBvZiBhbiBpbnN0cnVjdGlvbi5cbiAgICAgIGNvbnN0IHZhbHVlID0gKHJlc3VsdFtsYXN0SWR4XSB8fCAxKSBhcyBudW1iZXI7XG4gICAgICByZXN1bHRbbGFzdElkeF0gPSB2YWx1ZSArIDE7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEFkZGluZyBhIG5ldyBzZWdtZW50IHRvIHRoZSBwYXRoLlxuICAgICAgLy8gVXNpbmcgYW4gZW1wdHkgc3RyaW5nIGluIGEgY291bnRlciBmaWVsZCB0byBhdm9pZCBlbmNvZGluZyBgMWBzXG4gICAgICAvLyBpbnRvIHRoZSBwYXRoLCBzaW5jZSB0aGV5IGFyZSBpbXBsaWNpdCAoZS5nLiBgZjFuMWAgdnMgYGZuYCksIHNvXG4gICAgICAvLyBpdCdzIGVub3VnaCB0byBoYXZlIGEgc2luZ2xlIGNoYXIgaW4gdGhpcyBjYXNlLlxuICAgICAgcmVzdWx0LnB1c2goc2VnbWVudCwgJycpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0LmpvaW4oJycpO1xufVxuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0aGF0IHJldmVydHMgdGhlIGBjb21wcmVzc05vZGVMb2NhdGlvbmAgYW5kIHRyYW5zZm9ybXMgYSBnaXZlblxuICogc3RyaW5nIGludG8gYW4gYXJyYXkgd2hlcmUgYXQgMHRoIHBvc2l0aW9uIHRoZXJlIGlzIGEgcmVmZXJlbmNlIG5vZGUgaW5mbyBhbmRcbiAqIGFmdGVyIHRoYXQgaXQgY29udGFpbnMgaW5mb3JtYXRpb24gKGluIHBhaXJzKSBhYm91dCBhIG5hdmlnYXRpb24gc3RlcCBhbmQgdGhlXG4gKiBudW1iZXIgb2YgcmVwZXRpdGlvbnMuXG4gKlxuICogRm9yIGV4YW1wbGUsIHRoZSBwYXRoIGxpa2UgJ2JmMm4nIHdpbGwgYmUgdHJhbnNmb3JtZWQgdG86XG4gKiBbJ2InLCAnZmlyc3RDaGlsZCcsIDIsICduZXh0U2libGluZycsIDFdLlxuICpcbiAqIFRoaXMgaW5mb3JtYXRpb24gaXMgbGF0ZXIgY29uc3VtZWQgYnkgdGhlIGNvZGUgdGhhdCBuYXZpZ2F0ZXMgdGhlIERPTSB0byBmaW5kXG4gKiBhIGdpdmVuIG5vZGUgYnkgaXRzIGxvY2F0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVjb21wcmVzc05vZGVMb2NhdGlvbihcbiAgcGF0aDogc3RyaW5nLFxuKTogW3N0cmluZyB8IG51bWJlciwgLi4uKG51bWJlciB8IE5vZGVOYXZpZ2F0aW9uU3RlcClbXV0ge1xuICBjb25zdCBtYXRjaGVzID0gcGF0aC5tYXRjaChSRUZfRVhUUkFDVE9SX1JFR0VYUCkhO1xuICBjb25zdCBbXywgcmVmTm9kZUlkLCByZWZOb2RlTmFtZSwgcmVzdF0gPSBtYXRjaGVzO1xuICAvLyBJZiBhIHJlZmVyZW5jZSBub2RlIGlzIHJlcHJlc2VudGVkIGJ5IGFuIGluZGV4LCB0cmFuc2Zvcm0gaXQgdG8gYSBudW1iZXIuXG4gIGNvbnN0IHJlZiA9IHJlZk5vZGVJZCA/IHBhcnNlSW50KHJlZk5vZGVJZCwgMTApIDogcmVmTm9kZU5hbWU7XG4gIGNvbnN0IHN0ZXBzOiAobnVtYmVyIHwgTm9kZU5hdmlnYXRpb25TdGVwKVtdID0gW107XG4gIC8vIE1hdGNoIGFsbCBzZWdtZW50cyBpbiBhIHBhdGguXG4gIGZvciAoY29uc3QgW18sIHN0ZXAsIGNvdW50XSBvZiByZXN0Lm1hdGNoQWxsKC8oZnxuKShcXGQqKS9nKSkge1xuICAgIGNvbnN0IHJlcGVhdCA9IHBhcnNlSW50KGNvdW50LCAxMCkgfHwgMTtcbiAgICBzdGVwcy5wdXNoKHN0ZXAgYXMgTm9kZU5hdmlnYXRpb25TdGVwLCByZXBlYXQpO1xuICB9XG4gIHJldHVybiBbcmVmLCAuLi5zdGVwc107XG59XG4iXX0=