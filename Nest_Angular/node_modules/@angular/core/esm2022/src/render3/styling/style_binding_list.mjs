/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { keyValueArrayIndexOf } from '../../util/array_utils';
import { assertEqual, assertIndexInRange, assertNotEqual } from '../../util/assert';
import { assertFirstUpdatePass } from '../assert';
import { getTStylingRangeNext, getTStylingRangePrev, setTStylingRangeNext, setTStylingRangeNextDuplicate, setTStylingRangePrev, setTStylingRangePrevDuplicate, toTStylingRange, } from '../interfaces/styling';
import { getTView } from '../state';
/**
 * NOTE: The word `styling` is used interchangeably as style or class styling.
 *
 * This file contains code to link styling instructions together so that they can be replayed in
 * priority order. The file exists because Ivy styling instruction execution order does not match
 * that of the priority order. The purpose of this code is to create a linked list so that the
 * instructions can be traversed in priority order when computing the styles.
 *
 * Assume we are dealing with the following code:
 * ```
 * @Component({
 *   template: `
 *     <my-cmp [style]=" {color: '#001'} "
 *             [style.color]=" #002 "
 *             dir-style-color-1
 *             dir-style-color-2> `
 * })
 * class ExampleComponent {
 *   static ngComp = ... {
 *     ...
 *     // Compiler ensures that `ɵɵstyleProp` is after `ɵɵstyleMap`
 *     ɵɵstyleMap({color: '#001'});
 *     ɵɵstyleProp('color', '#002');
 *     ...
 *   }
 * }
 *
 * @Directive({
 *   selector: `[dir-style-color-1]',
 * })
 * class Style1Directive {
 *   @HostBinding('style') style = {color: '#005'};
 *   @HostBinding('style.color') color = '#006';
 *
 *   static ngDir = ... {
 *     ...
 *     // Compiler ensures that `ɵɵstyleProp` is after `ɵɵstyleMap`
 *     ɵɵstyleMap({color: '#005'});
 *     ɵɵstyleProp('color', '#006');
 *     ...
 *   }
 * }
 *
 * @Directive({
 *   selector: `[dir-style-color-2]',
 * })
 * class Style2Directive {
 *   @HostBinding('style') style = {color: '#007'};
 *   @HostBinding('style.color') color = '#008';
 *
 *   static ngDir = ... {
 *     ...
 *     // Compiler ensures that `ɵɵstyleProp` is after `ɵɵstyleMap`
 *     ɵɵstyleMap({color: '#007'});
 *     ɵɵstyleProp('color', '#008');
 *     ...
 *   }
 * }
 *
 * @Directive({
 *   selector: `my-cmp',
 * })
 * class MyComponent {
 *   @HostBinding('style') style = {color: '#003'};
 *   @HostBinding('style.color') color = '#004';
 *
 *   static ngComp = ... {
 *     ...
 *     // Compiler ensures that `ɵɵstyleProp` is after `ɵɵstyleMap`
 *     ɵɵstyleMap({color: '#003'});
 *     ɵɵstyleProp('color', '#004');
 *     ...
 *   }
 * }
 * ```
 *
 * The Order of instruction execution is:
 *
 * NOTE: the comment binding location is for illustrative purposes only.
 *
 * ```
 * // Template: (ExampleComponent)
 *     ɵɵstyleMap({color: '#001'});   // Binding index: 10
 *     ɵɵstyleProp('color', '#002');  // Binding index: 12
 * // MyComponent
 *     ɵɵstyleMap({color: '#003'});   // Binding index: 20
 *     ɵɵstyleProp('color', '#004');  // Binding index: 22
 * // Style1Directive
 *     ɵɵstyleMap({color: '#005'});   // Binding index: 24
 *     ɵɵstyleProp('color', '#006');  // Binding index: 26
 * // Style2Directive
 *     ɵɵstyleMap({color: '#007'});   // Binding index: 28
 *     ɵɵstyleProp('color', '#008');  // Binding index: 30
 * ```
 *
 * The correct priority order of concatenation is:
 *
 * ```
 * // MyComponent
 *     ɵɵstyleMap({color: '#003'});   // Binding index: 20
 *     ɵɵstyleProp('color', '#004');  // Binding index: 22
 * // Style1Directive
 *     ɵɵstyleMap({color: '#005'});   // Binding index: 24
 *     ɵɵstyleProp('color', '#006');  // Binding index: 26
 * // Style2Directive
 *     ɵɵstyleMap({color: '#007'});   // Binding index: 28
 *     ɵɵstyleProp('color', '#008');  // Binding index: 30
 * // Template: (ExampleComponent)
 *     ɵɵstyleMap({color: '#001'});   // Binding index: 10
 *     ɵɵstyleProp('color', '#002');  // Binding index: 12
 * ```
 *
 * What color should be rendered?
 *
 * Once the items are correctly sorted in the list, the answer is simply the last item in the
 * concatenation list which is `#002`.
 *
 * To do so we keep a linked list of all of the bindings which pertain to this element.
 * Notice that the bindings are inserted in the order of execution, but the `TView.data` allows
 * us to traverse them in the order of priority.
 *
 * |Idx|`TView.data`|`LView`          | Notes
 * |---|------------|-----------------|--------------
 * |...|            |                 |
 * |10 |`null`      |`{color: '#001'}`| `ɵɵstyleMap('color', {color: '#001'})`
 * |11 |`30 | 12`   | ...             |
 * |12 |`color`     |`'#002'`         | `ɵɵstyleProp('color', '#002')`
 * |13 |`10 | 0`    | ...             |
 * |...|            |                 |
 * |20 |`null`      |`{color: '#003'}`| `ɵɵstyleMap('color', {color: '#003'})`
 * |21 |`0 | 22`    | ...             |
 * |22 |`color`     |`'#004'`         | `ɵɵstyleProp('color', '#004')`
 * |23 |`20 | 24`   | ...             |
 * |24 |`null`      |`{color: '#005'}`| `ɵɵstyleMap('color', {color: '#005'})`
 * |25 |`22 | 26`   | ...             |
 * |26 |`color`     |`'#006'`         | `ɵɵstyleProp('color', '#006')`
 * |27 |`24 | 28`   | ...             |
 * |28 |`null`      |`{color: '#007'}`| `ɵɵstyleMap('color', {color: '#007'})`
 * |29 |`26 | 30`   | ...             |
 * |30 |`color`     |`'#008'`         | `ɵɵstyleProp('color', '#008')`
 * |31 |`28 | 10`   | ...             |
 *
 * The above data structure allows us to re-concatenate the styling no matter which data binding
 * changes.
 *
 * NOTE: in addition to keeping track of next/previous index the `TView.data` also stores prev/next
 * duplicate bit. The duplicate bit if true says there either is a binding with the same name or
 * there is a map (which may contain the name). This information is useful in knowing if other
 * styles with higher priority need to be searched for overwrites.
 *
 * NOTE: See `should support example in 'tnode_linked_list.ts' documentation` in
 * `tnode_linked_list_spec.ts` for working example.
 */
let __unused_const_as_closure_does_not_like_standalone_comment_blocks__;
/**
 * Insert new `tStyleValue` at `TData` and link existing style bindings such that we maintain linked
 * list of styles and compute the duplicate flag.
 *
 * Note: this function is executed during `firstUpdatePass` only to populate the `TView.data`.
 *
 * The function works by keeping track of `tStylingRange` which contains two pointers pointing to
 * the head/tail of the template portion of the styles.
 *  - if `isHost === false` (we are template) then insertion is at tail of `TStylingRange`
 *  - if `isHost === true` (we are host binding) then insertion is at head of `TStylingRange`
 *
 * @param tData The `TData` to insert into.
 * @param tNode `TNode` associated with the styling element.
 * @param tStylingKey See `TStylingKey`.
 * @param index location of where `tStyleValue` should be stored (and linked into list.)
 * @param isHostBinding `true` if the insertion is for a `hostBinding`. (insertion is in front of
 *               template.)
 * @param isClassBinding True if the associated `tStylingKey` as a `class` styling.
 *                       `tNode.classBindings` should be used (or `tNode.styleBindings` otherwise.)
 */
export function insertTStylingBinding(tData, tNode, tStylingKeyWithStatic, index, isHostBinding, isClassBinding) {
    ngDevMode && assertFirstUpdatePass(getTView());
    let tBindings = isClassBinding ? tNode.classBindings : tNode.styleBindings;
    let tmplHead = getTStylingRangePrev(tBindings);
    let tmplTail = getTStylingRangeNext(tBindings);
    tData[index] = tStylingKeyWithStatic;
    let isKeyDuplicateOfStatic = false;
    let tStylingKey;
    if (Array.isArray(tStylingKeyWithStatic)) {
        // We are case when the `TStylingKey` contains static fields as well.
        const staticKeyValueArray = tStylingKeyWithStatic;
        tStylingKey = staticKeyValueArray[1]; // unwrap.
        // We need to check if our key is present in the static so that we can mark it as duplicate.
        if (tStylingKey === null ||
            keyValueArrayIndexOf(staticKeyValueArray, tStylingKey) > 0) {
            // tStylingKey is present in the statics, need to mark it as duplicate.
            isKeyDuplicateOfStatic = true;
        }
    }
    else {
        tStylingKey = tStylingKeyWithStatic;
    }
    if (isHostBinding) {
        // We are inserting host bindings
        // If we don't have template bindings then `tail` is 0.
        const hasTemplateBindings = tmplTail !== 0;
        // This is important to know because that means that the `head` can't point to the first
        // template bindings (there are none.) Instead the head points to the tail of the template.
        if (hasTemplateBindings) {
            // template head's "prev" will point to last host binding or to 0 if no host bindings yet
            const previousNode = getTStylingRangePrev(tData[tmplHead + 1]);
            tData[index + 1] = toTStylingRange(previousNode, tmplHead);
            // if a host binding has already been registered, we need to update the next of that host
            // binding to point to this one
            if (previousNode !== 0) {
                // We need to update the template-tail value to point to us.
                tData[previousNode + 1] = setTStylingRangeNext(tData[previousNode + 1], index);
            }
            // The "previous" of the template binding head should point to this host binding
            tData[tmplHead + 1] = setTStylingRangePrev(tData[tmplHead + 1], index);
        }
        else {
            tData[index + 1] = toTStylingRange(tmplHead, 0);
            // if a host binding has already been registered, we need to update the next of that host
            // binding to point to this one
            if (tmplHead !== 0) {
                // We need to update the template-tail value to point to us.
                tData[tmplHead + 1] = setTStylingRangeNext(tData[tmplHead + 1], index);
            }
            // if we don't have template, the head points to template-tail, and needs to be advanced.
            tmplHead = index;
        }
    }
    else {
        // We are inserting in template section.
        // We need to set this binding's "previous" to the current template tail
        tData[index + 1] = toTStylingRange(tmplTail, 0);
        ngDevMode &&
            assertEqual(tmplHead !== 0 && tmplTail === 0, false, 'Adding template bindings after hostBindings is not allowed.');
        if (tmplHead === 0) {
            tmplHead = index;
        }
        else {
            // We need to update the previous value "next" to point to this binding
            tData[tmplTail + 1] = setTStylingRangeNext(tData[tmplTail + 1], index);
        }
        tmplTail = index;
    }
    // Now we need to update / compute the duplicates.
    // Starting with our location search towards head (least priority)
    if (isKeyDuplicateOfStatic) {
        tData[index + 1] = setTStylingRangePrevDuplicate(tData[index + 1]);
    }
    markDuplicates(tData, tStylingKey, index, true);
    markDuplicates(tData, tStylingKey, index, false);
    markDuplicateOfResidualStyling(tNode, tStylingKey, tData, index, isClassBinding);
    tBindings = toTStylingRange(tmplHead, tmplTail);
    if (isClassBinding) {
        tNode.classBindings = tBindings;
    }
    else {
        tNode.styleBindings = tBindings;
    }
}
/**
 * Look into the residual styling to see if the current `tStylingKey` is duplicate of residual.
 *
 * @param tNode `TNode` where the residual is stored.
 * @param tStylingKey `TStylingKey` to store.
 * @param tData `TData` associated with the current `LView`.
 * @param index location of where `tStyleValue` should be stored (and linked into list.)
 * @param isClassBinding True if the associated `tStylingKey` as a `class` styling.
 *                       `tNode.classBindings` should be used (or `tNode.styleBindings` otherwise.)
 */
function markDuplicateOfResidualStyling(tNode, tStylingKey, tData, index, isClassBinding) {
    const residual = isClassBinding ? tNode.residualClasses : tNode.residualStyles;
    if (residual != null /* or undefined */ &&
        typeof tStylingKey == 'string' &&
        keyValueArrayIndexOf(residual, tStylingKey) >= 0) {
        // We have duplicate in the residual so mark ourselves as duplicate.
        tData[index + 1] = setTStylingRangeNextDuplicate(tData[index + 1]);
    }
}
/**
 * Marks `TStyleValue`s as duplicates if another style binding in the list has the same
 * `TStyleValue`.
 *
 * NOTE: this function is intended to be called twice once with `isPrevDir` set to `true` and once
 * with it set to `false` to search both the previous as well as next items in the list.
 *
 * No duplicate case
 * ```
 *   [style.color]
 *   [style.width.px] <<- index
 *   [style.height.px]
 * ```
 *
 * In the above case adding `[style.width.px]` to the existing `[style.color]` produces no
 * duplicates because `width` is not found in any other part of the linked list.
 *
 * Duplicate case
 * ```
 *   [style.color]
 *   [style.width.em]
 *   [style.width.px] <<- index
 * ```
 * In the above case adding `[style.width.px]` will produce a duplicate with `[style.width.em]`
 * because `width` is found in the chain.
 *
 * Map case 1
 * ```
 *   [style.width.px]
 *   [style.color]
 *   [style]  <<- index
 * ```
 * In the above case adding `[style]` will produce a duplicate with any other bindings because
 * `[style]` is a Map and as such is fully dynamic and could produce `color` or `width`.
 *
 * Map case 2
 * ```
 *   [style]
 *   [style.width.px]
 *   [style.color]  <<- index
 * ```
 * In the above case adding `[style.color]` will produce a duplicate because there is already a
 * `[style]` binding which is a Map and as such is fully dynamic and could produce `color` or
 * `width`.
 *
 * NOTE: Once `[style]` (Map) is added into the system all things are mapped as duplicates.
 * NOTE: We use `style` as example, but same logic is applied to `class`es as well.
 *
 * @param tData `TData` where the linked list is stored.
 * @param tStylingKey `TStylingKeyPrimitive` which contains the value to compare to other keys in
 *        the linked list.
 * @param index Starting location in the linked list to search from
 * @param isPrevDir Direction.
 *        - `true` for previous (lower priority);
 *        - `false` for next (higher priority).
 */
function markDuplicates(tData, tStylingKey, index, isPrevDir) {
    const tStylingAtIndex = tData[index + 1];
    const isMap = tStylingKey === null;
    let cursor = isPrevDir
        ? getTStylingRangePrev(tStylingAtIndex)
        : getTStylingRangeNext(tStylingAtIndex);
    let foundDuplicate = false;
    // We keep iterating as long as we have a cursor
    // AND either:
    // - we found what we are looking for, OR
    // - we are a map in which case we have to continue searching even after we find what we were
    //   looking for since we are a wild card and everything needs to be flipped to duplicate.
    while (cursor !== 0 && (foundDuplicate === false || isMap)) {
        ngDevMode && assertIndexInRange(tData, cursor);
        const tStylingValueAtCursor = tData[cursor];
        const tStyleRangeAtCursor = tData[cursor + 1];
        if (isStylingMatch(tStylingValueAtCursor, tStylingKey)) {
            foundDuplicate = true;
            tData[cursor + 1] = isPrevDir
                ? setTStylingRangeNextDuplicate(tStyleRangeAtCursor)
                : setTStylingRangePrevDuplicate(tStyleRangeAtCursor);
        }
        cursor = isPrevDir
            ? getTStylingRangePrev(tStyleRangeAtCursor)
            : getTStylingRangeNext(tStyleRangeAtCursor);
    }
    if (foundDuplicate) {
        // if we found a duplicate, than mark ourselves.
        tData[index + 1] = isPrevDir
            ? setTStylingRangePrevDuplicate(tStylingAtIndex)
            : setTStylingRangeNextDuplicate(tStylingAtIndex);
    }
}
/**
 * Determines if two `TStylingKey`s are a match.
 *
 * When computing whether a binding contains a duplicate, we need to compare if the instruction
 * `TStylingKey` has a match.
 *
 * Here are examples of `TStylingKey`s which match given `tStylingKeyCursor` is:
 * - `color`
 *    - `color`    // Match another color
 *    - `null`     // That means that `tStylingKey` is a `classMap`/`styleMap` instruction
 *    - `['', 'color', 'other', true]` // wrapped `color` so match
 *    - `['', null, 'other', true]`       // wrapped `null` so match
 *    - `['', 'width', 'color', 'value']` // wrapped static value contains a match on `'color'`
 * - `null`       // `tStylingKeyCursor` always match as it is `classMap`/`styleMap` instruction
 *
 * @param tStylingKeyCursor
 * @param tStylingKey
 */
function isStylingMatch(tStylingKeyCursor, tStylingKey) {
    ngDevMode &&
        assertNotEqual(Array.isArray(tStylingKey), true, "Expected that 'tStylingKey' has been unwrapped");
    if (tStylingKeyCursor === null || // If the cursor is `null` it means that we have map at that
        // location so we must assume that we have a match.
        tStylingKey == null || // If `tStylingKey` is `null` then it is a map therefor assume that it
        // contains a match.
        (Array.isArray(tStylingKeyCursor) ? tStylingKeyCursor[1] : tStylingKeyCursor) === tStylingKey // If the keys match explicitly than we are a match.
    ) {
        return true;
    }
    else if (Array.isArray(tStylingKeyCursor) && typeof tStylingKey === 'string') {
        // if we did not find a match, but `tStylingKeyCursor` is `KeyValueArray` that means cursor has
        // statics and we need to check those as well.
        return keyValueArrayIndexOf(tStylingKeyCursor, tStylingKey) >= 0; // see if we are matching the key
    }
    return false;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3R5bGVfYmluZGluZ19saXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvcmVuZGVyMy9zdHlsaW5nL3N0eWxlX2JpbmRpbmdfbGlzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQWdCLG9CQUFvQixFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFDM0UsT0FBTyxFQUFDLFdBQVcsRUFBRSxrQkFBa0IsRUFBRSxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNsRixPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSxXQUFXLENBQUM7QUFFaEQsT0FBTyxFQUNMLG9CQUFvQixFQUNwQixvQkFBb0IsRUFDcEIsb0JBQW9CLEVBQ3BCLDZCQUE2QixFQUM3QixvQkFBb0IsRUFDcEIsNkJBQTZCLEVBQzdCLGVBQWUsR0FJaEIsTUFBTSx1QkFBdUIsQ0FBQztBQUUvQixPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sVUFBVSxDQUFDO0FBRWxDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXdKRztBQUNILElBQUksbUVBQThFLENBQUM7QUFFbkY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FtQkc7QUFDSCxNQUFNLFVBQVUscUJBQXFCLENBQ25DLEtBQVksRUFDWixLQUFZLEVBQ1oscUJBQWtDLEVBQ2xDLEtBQWEsRUFDYixhQUFzQixFQUN0QixjQUF1QjtJQUV2QixTQUFTLElBQUkscUJBQXFCLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUMvQyxJQUFJLFNBQVMsR0FBRyxjQUFjLENBQUMsQ0FBQyxDQUFD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LENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLEtBQUssV0FBVyxDQUFDLG9EQUFvRDtNQUNsSixDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO1NBQU0sSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLElBQUksT0FBTyxXQUFXLEtBQUssUUFBUSxFQUFFLENBQUM7UUFDL0UsK0ZBQStGO1FBQy9GLDhDQUE4QztRQUM5QyxPQUFPLG9CQUFvQixDQUFDLGlCQUFpQixFQUFFLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLGlDQUFpQztJQUNyRyxDQUFDO0lBQ0QsT0FBTyxLQUFLLENBQUM7QUFDZixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0tleVZhbHVlQXJyYXksIGtleVZhbHVlQXJyYXlJbmRleE9mfSBmcm9tICcuLi8uLi91dGlsL2FycmF5X3V0aWxzJztcbmltcG9ydCB7YXNzZXJ0RXF1YWwsIGFzc2VydEluZGV4SW5SYW5nZSwgYXNzZXJ0Tm90RXF1YWx9IGZyb20gJy4uLy4uL3V0aWwvYXNzZXJ0JztcbmltcG9ydCB7YXNzZXJ0Rmlyc3RVcGRhdGVQYXNzfSBmcm9tICcuLi9hc3NlcnQnO1xuaW1wb3J0IHtUTm9kZX0gZnJvbSAnLi4vaW50ZXJmYWNlcy9ub2RlJztcbmltcG9ydCB7XG4gIGdldFRTdHlsaW5nUmFuZ2VOZXh0LFxuICBnZXRUU3R5bGluZ1JhbmdlUHJldixcbiAgc2V0VFN0eWxpbmdSYW5nZU5leHQsXG4gIHNldFRTdHlsaW5nUmFuZ2VOZXh0RHVwbGljYXRlLFxuICBzZXRUU3R5bGluZ1JhbmdlUHJldixcbiAgc2V0VFN0eWxpbmdSYW5nZVByZXZEdXBsaWNhdGUsXG4gIHRvVFN0eWxpbmdSYW5nZSxcbiAgVFN0eWxpbmdLZXksXG4gIFRTdHlsaW5nS2V5UHJpbWl0aXZlLFxuICBUU3R5bGluZ1JhbmdlLFxufSBmcm9tICcuLi9pbnRlcmZhY2VzL3N0eWxpbmcnO1xuaW1wb3J0IHtURGF0YX0gZnJvbSAnLi4vaW50ZXJmYWNlcy92aWV3JztcbmltcG9ydCB7Z2V0VFZpZXd9IGZyb20gJy4uL3N0YXRlJztcblxuLyoqXG4gKiBOT1RFOiBUaGUgd29yZCBgc3R5bGluZ2AgaXMgdXNlZCBpbnRlcmNoYW5nZWFibHkgYXMgc3R5bGUgb3IgY2xhc3Mgc3R5bGluZy5cbiAqXG4gKiBUaGlzIGZpbGUgY29udGFpbnMgY29kZSB0byBsaW5rIHN0eWxpbmcgaW5zdHJ1Y3Rpb25zIHRvZ2V0aGVyIHNvIHRoYXQgdGhleSBjYW4gYmUgcmVwbGF5ZWQgaW5cbiAqIHByaW9yaXR5IG9yZGVyLiBUaGUgZmlsZSBleGlzdHMgYmVjYXVzZSBJdnkgc3R5bGluZyBpbnN0cnVjdGlvbiBleGVjdXRpb24gb3JkZXIgZG9lcyBub3QgbWF0Y2hcbiAqIHRoYXQgb2YgdGhlIHByaW9yaXR5IG9yZGVyLiBUaGUgcHVycG9zZSBvZiB0aGlzIGNvZGUgaXMgdG8gY3JlYXRlIGEgbGlua2VkIGxpc3Qgc28gdGhhdCB0aGVcbiAqIGluc3RydWN0aW9ucyBjYW4gYmUgdHJhdmVyc2VkIGluIHByaW9yaXR5IG9yZGVyIHdoZW4gY29tcHV0aW5nIHRoZSBzdHlsZXMuXG4gKlxuICogQXNzdW1lIHdlIGFyZSBkZWFsaW5nIHdpdGggdGhlIGZvbGxvd2luZyBjb2RlOlxuICogYGBgXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgICA8bXktY21wIFtzdHlsZV09XCIge2NvbG9yOiAnIzAwMSd9IFwiXG4gKiAgICAgICAgICAgICBbc3R5bGUuY29sb3JdPVwiICMwMDIgXCJcbiAqICAgICAgICAgICAgIGRpci1zdHlsZS1jb2xvci0xXG4gKiAgICAgICAgICAgICBkaXItc3R5bGUtY29sb3ItMj4gYFxuICogfSlcbiAqIGNsYXNzIEV4YW1wbGVDb21wb25lbnQge1xuICogICBzdGF0aWMgbmdDb21wID0gLi4uIHtcbiAqICAgICAuLi5cbiAqICAgICAvLyBDb21waWxlciBlbnN1cmVzIHRoYXQgYMm1ybVzdHlsZVByb3BgIGlzIGFmdGVyIGDJtcm1c3R5bGVNYXBgXG4gKiAgICAgybXJtXN0eWxlTWFwKHtjb2xvcjogJyMwMDEnfSk7XG4gKiAgICAgybXJtXN0eWxlUHJvcCgnY29sb3InLCAnIzAwMicpO1xuICogICAgIC4uLlxuICogICB9XG4gKiB9XG4gKlxuICogQERpcmVjdGl2ZSh7XG4gKiAgIHNlbGVjdG9yOiBgW2Rpci1zdHlsZS1jb2xvci0xXScsXG4gKiB9KVxuICogY2xhc3MgU3R5bGUxRGlyZWN0aXZlIHtcbiAqICAgQEhvc3RCaW5kaW5nKCdzdHlsZScpIHN0eWxlID0ge2NvbG9yOiAnIzAwNSd9O1xuICogICBASG9zdEJpbmRpbmcoJ3N0eWxlLmNvbG9yJykgY29sb3IgPSAnIzAwNic7XG4gKlxuICogICBzdGF0aWMgbmdEaXIgPSAuLi4ge1xuICogICAgIC4uLlxuICogICAgIC8vIENvbXBpbGVyIGVuc3VyZXMgdGhhdCBgybXJtXN0eWxlUHJvcGAgaXMgYWZ0ZXIgYMm1ybVzdHlsZU1hcGBcbiAqICAgICDJtcm1c3R5bGVNYXAoe2NvbG9yOiAnIzAwNSd9KTtcbiAqICAgICDJtcm1c3R5bGVQcm9wKCdjb2xvcicsICcjMDA2Jyk7XG4gKiAgICAgLi4uXG4gKiAgIH1cbiAqIH1cbiAqXG4gKiBARGlyZWN0aXZlKHtcbiAqICAgc2VsZWN0b3I6IGBbZGlyLXN0eWxlLWNvbG9yLTJdJyxcbiAqIH0pXG4gKiBjbGFzcyBTdHlsZTJEaXJlY3RpdmUge1xuICogICBASG9zdEJpbmRpbmcoJ3N0eWxlJykgc3R5bGUgPSB7Y29sb3I6ICcjMDA3J307XG4gKiAgIEBIb3N0QmluZGluZygnc3R5bGUuY29sb3InKSBjb2xvciA9ICcjMDA4JztcbiAqXG4gKiAgIHN0YXRpYyBuZ0RpciA9IC4uLiB7XG4gKiAgICAgLi4uXG4gKiAgICAgLy8gQ29tcGlsZXIgZW5zdXJlcyB0aGF0IGDJtcm1c3R5bGVQcm9wYCBpcyBhZnRlciBgybXJtXN0eWxlTWFwYFxuICogICAgIMm1ybVzdHlsZU1hcCh7Y29sb3I6ICcjMDA3J30pO1xuICogICAgIMm1ybVzdHlsZVByb3AoJ2NvbG9yJywgJyMwMDgnKTtcbiAqICAgICAuLi5cbiAqICAgfVxuICogfVxuICpcbiAqIEBEaXJlY3RpdmUoe1xuICogICBzZWxlY3RvcjogYG15LWNtcCcsXG4gKiB9KVxuICogY2xhc3MgTXlDb21wb25lbnQge1xuICogICBASG9zdEJpbmRpbmcoJ3N0eWxlJykgc3R5bGUgPSB7Y29sb3I6ICcjMDAzJ307XG4gKiAgIEBIb3N0QmluZGluZygnc3R5bGUuY29sb3InKSBjb2xvciA9ICcjMDA0JztcbiAqXG4gKiAgIHN0YXRpYyBuZ0NvbXAgPSAuLi4ge1xuICogICAgIC4uLlxuICogICAgIC8vIENvbXBpbGVyIGVuc3VyZXMgdGhhdCBgybXJtXN0eWxlUHJvcGAgaXMgYWZ0ZXIgYMm1ybVzdHlsZU1hcGBcbiAqICAgICDJtcm1c3R5bGVNYXAoe2NvbG9yOiAnIzAwMyd9KTtcbiAqICAgICDJtcm1c3R5bGVQcm9wKCdjb2xvcicsICcjMDA0Jyk7XG4gKiAgICAgLi4uXG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIFRoZSBPcmRlciBvZiBpbnN0cnVjdGlvbiBleGVjdXRpb24gaXM6XG4gKlxuICogTk9URTogdGhlIGNvbW1lbnQgYmluZGluZyBsb2NhdGlvbiBpcyBmb3IgaWxsdXN0cmF0aXZlIHB1cnBvc2VzIG9ubHkuXG4gKlxuICogYGBgXG4gKiAvLyBUZW1wbGF0ZTogKEV4YW1wbGVDb21wb25lbnQpXG4gKiAgICAgybXJtXN0eWxlTWFwKHtjb2xvcjogJyMwMDEnfSk7ICAgLy8gQmluZGluZyBpbmRleDogMTBcbiAqICAgICDJtcm1c3R5bGVQcm9wKCdjb2xvcicsICcjMDAyJyk7ICAvLyBCaW5kaW5nIGluZGV4OiAxMlxuICogLy8gTXlDb21wb25lbnRcbiAqICAgICDJtcm1c3R5bGVNYXAoe2NvbG9yOiAnIzAwMyd9KTsgICAvLyBCaW5kaW5nIGluZGV4OiAyMFxuICogICAgIMm1ybVzdHlsZVByb3AoJ2NvbG9yJywgJyMwMDQnKTsgIC8vIEJpbmRpbmcgaW5kZXg6IDIyXG4gKiAvLyBTdHlsZTFEaXJlY3RpdmVcbiAqICAgICDJtcm1c3R5bGVNYXAoe2NvbG9yOiAnIzAwNSd9KTsgICAvLyBCaW5kaW5nIGluZGV4OiAyNFxuICogICAgIMm1ybVzdHlsZVByb3AoJ2NvbG9yJywgJyMwMDYnKTsgIC8vIEJpbmRpbmcgaW5kZXg6IDI2XG4gKiAvLyBTdHlsZTJEaXJlY3RpdmVcbiAqICAgICDJtcm1c3R5bGVNYXAoe2NvbG9yOiAnIzAwNyd9KTsgICAvLyBCaW5kaW5nIGluZGV4OiAyOFxuICogICAgIMm1ybVzdHlsZVByb3AoJ2NvbG9yJywgJyMwMDgnKTsgIC8vIEJpbmRpbmcgaW5kZXg6IDMwXG4gKiBgYGBcbiAqXG4gKiBUaGUgY29ycmVjdCBwcmlvcml0eSBvcmRlciBvZiBjb25jYXRlbmF0aW9uIGlzOlxuICpcbiAqIGBgYFxuICogLy8gTXlDb21wb25lbnRcbiAqICAgICDJtcm1c3R5bGVNYXAoe2NvbG9yOiAnIzAwMyd9KTsgICAvLyBCaW5kaW5nIGluZGV4OiAyMFxuICogICAgIMm1ybVzdHlsZVByb3AoJ2NvbG9yJywgJyMwMDQnKTsgIC8vIEJpbmRpbmcgaW5kZXg6IDIyXG4gKiAvLyBTdHlsZTFEaXJlY3RpdmVcbiAqICAgICDJtcm1c3R5bGVNYXAoe2NvbG9yOiAnIzAwNSd9KTsgICAvLyBCaW5kaW5nIGluZGV4OiAyNFxuICogICAgIMm1ybVzdHlsZVByb3AoJ2NvbG9yJywgJyMwMDYnKTsgIC8vIEJpbmRpbmcgaW5kZXg6IDI2XG4gKiAvLyBTdHlsZTJEaXJlY3RpdmVcbiAqICAgICDJtcm1c3R5bGVNYXAoe2NvbG9yOiAnIzAwNyd9KTsgICAvLyBCaW5kaW5nIGluZGV4OiAyOFxuICogICAgIMm1ybVzdHlsZVByb3AoJ2NvbG9yJywgJyMwMDgnKTsgIC8vIEJpbmRpbmcgaW5kZXg6IDMwXG4gKiAvLyBUZW1wbGF0ZTogKEV4YW1wbGVDb21wb25lbnQpXG4gKiAgICAgybXJtXN0eWxlTWFwKHtjb2xvcjogJyMwMDEnfSk7ICAgLy8gQmluZGluZyBpbmRleDogMTBcbiAqICAgICDJtcm1c3R5bGVQcm9wKCdjb2xvcicsICcjMDAyJyk7ICAvLyBCaW5kaW5nIGluZGV4OiAxMlxuICogYGBgXG4gKlxuICogV2hhdCBjb2xvciBzaG91bGQgYmUgcmVuZGVyZWQ/XG4gKlxuICogT25jZSB0aGUgaXRlbXMgYXJlIGNvcnJlY3RseSBzb3J0ZWQgaW4gdGhlIGxpc3QsIHRoZSBhbnN3ZXIgaXMgc2ltcGx5IHRoZSBsYXN0IGl0ZW0gaW4gdGhlXG4gKiBjb25jYXRlbmF0aW9uIGxpc3Qgd2hpY2ggaXMgYCMwMDJgLlxuICpcbiAqIFRvIGRvIHNvIHdlIGtlZXAgYSBsaW5rZWQgbGlzdCBvZiBhbGwgb2YgdGhlIGJpbmRpbmdzIHdoaWNoIHBlcnRhaW4gdG8gdGhpcyBlbGVtZW50LlxuICogTm90aWNlIHRoYXQgdGhlIGJpbmRpbmdzIGFyZSBpbnNlcnRlZCBpbiB0aGUgb3JkZXIgb2YgZXhlY3V0aW9uLCBidXQgdGhlIGBUVmlldy5kYXRhYCBhbGxvd3NcbiAqIHVzIHRvIHRyYXZlcnNlIHRoZW0gaW4gdGhlIG9yZGVyIG9mIHByaW9yaXR5LlxuICpcbiAqIHxJZHh8YFRWaWV3LmRhdGFgfGBMVmlld2AgICAgICAgICAgfCBOb3Rlc1xuICogfC0tLXwtLS0tLS0tLS0tLS18LS0tLS0tLS0tLS0tLS0tLS18LS0tLS0tLS0tLS0tLS1cbiAqIHwuLi58ICAgICAgICAgICAgfCAgICAgICAgICAgICAgICAgfFxuICogfDEwIHxgbnVsbGAgICAgICB8YHtjb2xvcjogJyMwMDEnfWB8IGDJtcm1c3R5bGVNYXAoJ2NvbG9yJywge2NvbG9yOiAnIzAwMSd9KWBcbiAqIHwxMSB8YDMwIHwgMTJgICAgfCAuLi4gICAgICAgICAgICAgfFxuICogfDEyIHxgY29sb3JgICAgICB8YCcjMDAyJ2AgICAgICAgICB8IGDJtcm1c3R5bGVQcm9wKCdjb2xvcicsICcjMDAyJylgXG4gKiB8MTMgfGAxMCB8IDBgICAgIHwgLi4uICAgICAgICAgICAgIHxcbiAqIHwuLi58ICAgICAgICAgICAgfCAgICAgICAgICAgICAgICAgfFxuICogfDIwIHxgbnVsbGAgICAgICB8YHtjb2xvcjogJyMwMDMnfWB8IGDJtcm1c3R5bGVNYXAoJ2NvbG9yJywge2NvbG9yOiAnIzAwMyd9KWBcbiAqIHwyMSB8YDAgfCAyMmAgICAgfCAuLi4gICAgICAgICAgICAgfFxuICogfDIyIHxgY29sb3JgICAgICB8YCcjMDA0J2AgICAgICAgICB8IGDJtcm1c3R5bGVQcm9wKCdjb2xvcicsICcjMDA0JylgXG4gKiB8MjMgfGAyMCB8IDI0YCAgIHwgLi4uICAgICAgICAgICAgIHxcbiAqIHwyNCB8YG51bGxgICAgICAgfGB7Y29sb3I6ICcjMDA1J31gfCBgybXJtXN0eWxlTWFwKCdjb2xvcicsIHtjb2xvcjogJyMwMDUnfSlgXG4gKiB8MjUgfGAyMiB8IDI2YCAgIHwgLi4uICAgICAgICAgICAgIHxcbiAqIHwyNiB8YGNvbG9yYCAgICAgfGAnIzAwNidgICAgICAgICAgfCBgybXJtXN0eWxlUHJvcCgnY29sb3InLCAnIzAwNicpYFxuICogfDI3IHxgMjQgfCAyOGAgICB8IC4uLiAgICAgICAgICAgICB8XG4gKiB8MjggfGBudWxsYCAgICAgIHxge2NvbG9yOiAnIzAwNyd9YHwgYMm1ybVzdHlsZU1hcCgnY29sb3InLCB7Y29sb3I6ICcjMDA3J30pYFxuICogfDI5IHxgMjYgfCAzMGAgICB8IC4uLiAgICAgICAgICAgICB8XG4gKiB8MzAgfGBjb2xvcmAgICAgIHxgJyMwMDgnYCAgICAgICAgIHwgYMm1ybVzdHlsZVByb3AoJ2NvbG9yJywgJyMwMDgnKWBcbiAqIHwzMSB8YDI4IHwgMTBgICAgfCAuLi4gICAgICAgICAgICAgfFxuICpcbiAqIFRoZSBhYm92ZSBkYXRhIHN0cnVjdHVyZSBhbGxvd3MgdXMgdG8gcmUtY29uY2F0ZW5hdGUgdGhlIHN0eWxpbmcgbm8gbWF0dGVyIHdoaWNoIGRhdGEgYmluZGluZ1xuICogY2hhbmdlcy5cbiAqXG4gKiBOT1RFOiBpbiBhZGRpdGlvbiB0byBrZWVwaW5nIHRyYWNrIG9mIG5leHQvcHJldmlvdXMgaW5kZXggdGhlIGBUVmlldy5kYXRhYCBhbHNvIHN0b3JlcyBwcmV2L25leHRcbiAqIGR1cGxpY2F0ZSBiaXQuIFRoZSBkdXBsaWNhdGUgYml0IGlmIHRydWUgc2F5cyB0aGVyZSBlaXRoZXIgaXMgYSBiaW5kaW5nIHdpdGggdGhlIHNhbWUgbmFtZSBvclxuICogdGhlcmUgaXMgYSBtYXAgKHdoaWNoIG1heSBjb250YWluIHRoZSBuYW1lKS4gVGhpcyBpbmZvcm1hdGlvbiBpcyB1c2VmdWwgaW4ga25vd2luZyBpZiBvdGhlclxuICogc3R5bGVzIHdpdGggaGlnaGVyIHByaW9yaXR5IG5lZWQgdG8gYmUgc2VhcmNoZWQgZm9yIG92ZXJ3cml0ZXMuXG4gKlxuICogTk9URTogU2VlIGBzaG91bGQgc3VwcG9ydCBleGFtcGxlIGluICd0bm9kZV9saW5rZWRfbGlzdC50cycgZG9jdW1lbnRhdGlvbmAgaW5cbiAqIGB0bm9kZV9saW5rZWRfbGlzdF9zcGVjLnRzYCBmb3Igd29ya2luZyBleGFtcGxlLlxuICovXG5sZXQgX191bnVzZWRfY29uc3RfYXNfY2xvc3VyZV9kb2VzX25vdF9saWtlX3N0YW5kYWxvbmVfY29tbWVudF9ibG9ja3NfXzogdW5kZWZpbmVkO1xuXG4vKipcbiAqIEluc2VydCBuZXcgYHRTdHlsZVZhbHVlYCBhdCBgVERhdGFgIGFuZCBsaW5rIGV4aXN0aW5nIHN0eWxlIGJpbmRpbmdzIHN1Y2ggdGhhdCB3ZSBtYWludGFpbiBsaW5rZWRcbiAqIGxpc3Qgb2Ygc3R5bGVzIGFuZCBjb21wdXRlIHRoZSBkdXBsaWNhdGUgZmxhZy5cbiAqXG4gKiBOb3RlOiB0aGlzIGZ1bmN0aW9uIGlzIGV4ZWN1dGVkIGR1cmluZyBgZmlyc3RVcGRhdGVQYXNzYCBvbmx5IHRvIHBvcHVsYXRlIHRoZSBgVFZpZXcuZGF0YWAuXG4gKlxuICogVGhlIGZ1bmN0aW9uIHdvcmtzIGJ5IGtlZXBpbmcgdHJhY2sgb2YgYHRTdHlsaW5nUmFuZ2VgIHdoaWNoIGNvbnRhaW5zIHR3byBwb2ludGVycyBwb2ludGluZyB0b1xuICogdGhlIGhlYWQvdGFpbCBvZiB0aGUgdGVtcGxhdGUgcG9ydGlvbiBvZiB0aGUgc3R5bGVzLlxuICogIC0gaWYgYGlzSG9zdCA9PT0gZmFsc2VgICh3ZSBhcmUgdGVtcGxhdGUpIHRoZW4gaW5zZXJ0aW9uIGlzIGF0IHRhaWwgb2YgYFRTdHlsaW5nUmFuZ2VgXG4gKiAgLSBpZiBgaXNIb3N0ID09PSB0cnVlYCAod2UgYXJlIGhvc3QgYmluZGluZykgdGhlbiBpbnNlcnRpb24gaXMgYXQgaGVhZCBvZiBgVFN0eWxpbmdSYW5nZWBcbiAqXG4gKiBAcGFyYW0gdERhdGEgVGhlIGBURGF0YWAgdG8gaW5zZXJ0IGludG8uXG4gKiBAcGFyYW0gdE5vZGUgYFROb2RlYCBhc3NvY2lhdGVkIHdpdGggdGhlIHN0eWxpbmcgZWxlbWVudC5cbiAqIEBwYXJhbSB0U3R5bGluZ0tleSBTZWUgYFRTdHlsaW5nS2V5YC5cbiAqIEBwYXJhbSBpbmRleCBsb2NhdGlvbiBvZiB3aGVyZSBgdFN0eWxlVmFsdWVgIHNob3VsZCBiZSBzdG9yZWQgKGFuZCBsaW5rZWQgaW50byBsaXN0LilcbiAqIEBwYXJhbSBpc0hvc3RCaW5kaW5nIGB0cnVlYCBpZiB0aGUgaW5zZXJ0aW9uIGlzIGZvciBhIGBob3N0QmluZGluZ2AuIChpbnNlcnRpb24gaXMgaW4gZnJvbnQgb2ZcbiAqICAgICAgICAgICAgICAgdGVtcGxhdGUuKVxuICogQHBhcmFtIGlzQ2xhc3NCaW5kaW5nIFRydWUgaWYgdGhlIGFzc29jaWF0ZWQgYHRTdHlsaW5nS2V5YCBhcyBhIGBjbGFzc2Agc3R5bGluZy5cbiAqICAgICAgICAgICAgICAgICAgICAgICBgdE5vZGUuY2xhc3NCaW5kaW5nc2Agc2hvdWxkIGJlIHVzZWQgKG9yIGB0Tm9kZS5zdHlsZUJpbmRpbmdzYCBvdGhlcndpc2UuKVxuICovXG5leHBvcnQgZnVuY3Rpb24gaW5zZXJ0VFN0eWxpbmdCaW5kaW5nKFxuICB0RGF0YTogVERhdGEsXG4gIHROb2RlOiBUTm9kZSxcbiAgdFN0eWxpbmdLZXlXaXRoU3RhdGljOiBUU3R5bGluZ0tleSxcbiAgaW5kZXg6IG51bWJlcixcbiAgaXNIb3N0QmluZGluZzogYm9vbGVhbixcbiAgaXNDbGFzc0JpbmRpbmc6IGJvb2xlYW4sXG4pOiB2b2lkIHtcbiAgbmdEZXZNb2RlICYmIGFzc2VydEZpcnN0VXBkYXRlUGFzcyhnZXRUVmlldygpKTtcbiAgbGV0IHRCaW5kaW5ncyA9IGlzQ2xhc3NCaW5kaW5nID8gdE5vZGUuY2xhc3NCaW5kaW5ncyA6IHROb2RlLnN0eWxlQmluZGluZ3M7XG4gIGxldCB0bXBsSGVhZCA9IGdldFRTdHlsaW5nUmFuZ2VQcmV2KHRCaW5kaW5ncyk7XG4gIGxldCB0bXBsVGFpbCA9IGdldFRTdHlsaW5nUmFuZ2VOZXh0KHRCaW5kaW5ncyk7XG5cbiAgdERhdGFbaW5kZXhdID0gdFN0eWxpbmdLZXlXaXRoU3RhdGljO1xuICBsZXQgaXNLZXlEdXBsaWNhdGVPZlN0YXRpYyA9IGZhbHNlO1xuICBsZXQgdFN0eWxpbmdLZXk6IFRTdHlsaW5nS2V5UHJpbWl0aXZlO1xuICBpZiAoQXJyYXkuaXNBcnJheSh0U3R5bGluZ0tleVdpdGhTdGF0aWMpKSB7XG4gICAgLy8gV2UgYXJlIGNhc2Ugd2hlbiB0aGUgYFRTdHlsaW5nS2V5YCBjb250YWlucyBzdGF0aWMgZmllbGRzIGFzIHdlbGwuXG4gICAgY29uc3Qgc3RhdGljS2V5VmFsdWVBcnJheSA9IHRTdHlsaW5nS2V5V2l0aFN0YXRpYyBhcyBLZXlWYWx1ZUFycmF5PGFueT47XG4gICAgdFN0eWxpbmdLZXkgPSBzdGF0aWNLZXlWYWx1ZUFycmF5WzFdOyAvLyB1bndyYXAuXG4gICAgLy8gV2UgbmVlZCB0byBjaGVjayBpZiBvdXIga2V5IGlzIHByZXNlbnQgaW4gdGhlIHN0YXRpYyBzbyB0aGF0IHdlIGNhbiBtYXJrIGl0IGFzIGR1cGxpY2F0ZS5cbiAgICBpZiAoXG4gICAgICB0U3R5bGluZ0tleSA9PT0gbnVsbCB8fFxuICAgICAga2V5VmFsdWVBcnJheUluZGV4T2Yoc3RhdGljS2V5VmFsdWVBcnJheSwgdFN0eWxpbmdLZXkgYXMgc3RyaW5nKSA+IDBcbiAgICApIHtcbiAgICAgIC8vIHRTdHlsaW5nS2V5IGlzIHByZXNlbnQgaW4gdGhlIHN0YXRpY3MsIG5lZWQgdG8gbWFyayBpdCBhcyBkdXBsaWNhdGUuXG4gICAgICBpc0tleUR1cGxpY2F0ZU9mU3RhdGljID0gdHJ1ZTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdFN0eWxpbmdLZXkgPSB0U3R5bGluZ0tleVdpdGhTdGF0aWM7XG4gIH1cbiAgaWYgKGlzSG9zdEJpbmRpbmcpIHtcbiAgICAvLyBXZSBhcmUgaW5zZXJ0aW5nIGhvc3QgYmluZGluZ3NcblxuICAgIC8vIElmIHdlIGRvbid0IGhhdmUgdGVtcGxhdGUgYmluZGluZ3MgdGhlbiBgdGFpbGAgaXMgMC5cbiAgICBjb25zdCBoYXNUZW1wbGF0ZUJpbmRpbmdzID0gdG1wbFRhaWwgIT09IDA7XG4gICAgLy8gVGhpcyBpcyBpbXBvcnRhbnQgdG8ga25vdyBiZWNhdXNlIHRoYXQgbWVhbnMgdGhhdCB0aGUgYGhlYWRgIGNhbid0IHBvaW50IHRvIHRoZSBmaXJzdFxuICAgIC8vIHRlbXBsYXRlIGJpbmRpbmdzICh0aGVyZSBhcmUgbm9uZS4pIEluc3RlYWQgdGhlIGhlYWQgcG9pbnRzIHRvIHRoZSB0YWlsIG9mIHRoZSB0ZW1wbGF0ZS5cbiAgICBpZiAoaGFzVGVtcGxhdGVCaW5kaW5ncykge1xuICAgICAgLy8gdGVtcGxhdGUgaGVhZCdzIFwicHJldlwiIHdpbGwgcG9pbnQgdG8gbGFzdCBob3N0IGJpbmRpbmcgb3IgdG8gMCBpZiBubyBob3N0IGJpbmRpbmdzIHlldFxuICAgICAgY29uc3QgcHJldmlvdXNOb2RlID0gZ2V0VFN0eWxpbmdSYW5nZVByZXYodERhdGFbdG1wbEhlYWQgKyAxXSBhcyBUU3R5bGluZ1JhbmdlKTtcbiAgICAgIHREYXRhW2luZGV4ICsgMV0gPSB0b1RTdHlsaW5nUmFuZ2UocHJldmlvdXNOb2RlLCB0bXBsSGVhZCk7XG4gICAgICAvLyBpZiBhIGhvc3QgYmluZGluZyBoYXMgYWxyZWFkeSBiZWVuIHJlZ2lzdGVyZWQsIHdlIG5lZWQgdG8gdXBkYXRlIHRoZSBuZXh0IG9mIHRoYXQgaG9zdFxuICAgICAgLy8gYmluZGluZyB0byBwb2ludCB0byB0aGlzIG9uZVxuICAgICAgaWYgKHByZXZpb3VzTm9kZSAhPT0gMCkge1xuICAgICAgICAvLyBXZSBuZWVkIHRvIHVwZGF0ZSB0aGUgdGVtcGxhdGUtdGFpbCB2YWx1ZSB0byBwb2ludCB0byB1cy5cbiAgICAgICAgdERhdGFbcHJldmlvdXNOb2RlICsgMV0gPSBzZXRUU3R5bGluZ1JhbmdlTmV4dChcbiAgICAgICAgICB0RGF0YVtwcmV2aW91c05vZGUgKyAxXSBhcyBUU3R5bGluZ1JhbmdlLFxuICAgICAgICAgIGluZGV4LFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgLy8gVGhlIFwicHJldmlvdXNcIiBvZiB0aGUgdGVtcGxhdGUgYmluZGluZyBoZWFkIHNob3VsZCBwb2ludCB0byB0aGlzIGhvc3QgYmluZGluZ1xuICAgICAgdERhdGFbdG1wbEhlYWQgKyAxXSA9IHNldFRTdHlsaW5nUmFuZ2VQcmV2KHREYXRhW3RtcGxIZWFkICsgMV0gYXMgVFN0eWxpbmdSYW5nZSwgaW5kZXgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0RGF0YVtpbmRleCArIDFdID0gdG9UU3R5bGluZ1JhbmdlKHRtcGxIZWFkLCAwKTtcbiAgICAgIC8vIGlmIGEgaG9zdCBiaW5kaW5nIGhhcyBhbHJlYWR5IGJlZW4gcmVnaXN0ZXJlZCwgd2UgbmVlZCB0byB1cGRhdGUgdGhlIG5leHQgb2YgdGhhdCBob3N0XG4gICAgICAvLyBiaW5kaW5nIHRvIHBvaW50IHRvIHRoaXMgb25lXG4gICAgICBpZiAodG1wbEhlYWQgIT09IDApIHtcbiAgICAgICAgLy8gV2UgbmVlZCB0byB1cGRhdGUgdGhlIHRlbXBsYXRlLXRhaWwgdmFsdWUgdG8gcG9pbnQgdG8gdXMuXG4gICAgICAgIHREYXRhW3RtcGxIZWFkICsgMV0gPSBzZXRUU3R5bGluZ1JhbmdlTmV4dCh0RGF0YVt0bXBsSGVhZCArIDFdIGFzIFRTdHlsaW5nUmFuZ2UsIGluZGV4KTtcbiAgICAgIH1cbiAgICAgIC8vIGlmIHdlIGRvbid0IGhhdmUgdGVtcGxhdGUsIHRoZSBoZWFkIHBvaW50cyB0byB0ZW1wbGF0ZS10YWlsLCBhbmQgbmVlZHMgdG8gYmUgYWR2YW5jZWQuXG4gICAgICB0bXBsSGVhZCA9IGluZGV4O1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAvLyBXZSBhcmUgaW5zZXJ0aW5nIGluIHRlbXBsYXRlIHNlY3Rpb24uXG4gICAgLy8gV2UgbmVlZCB0byBzZXQgdGhpcyBiaW5kaW5nJ3MgXCJwcmV2aW91c1wiIHRvIHRoZSBjdXJyZW50IHRlbXBsYXRlIHRhaWxcbiAgICB0RGF0YVtpbmRleCArIDFdID0gdG9UU3R5bGluZ1JhbmdlKHRtcGxUYWlsLCAwKTtcbiAgICBuZ0Rldk1vZGUgJiZcbiAgICAgIGFzc2VydEVxdWFsKFxuICAgICAgICB0bXBsSGVhZCAhPT0gMCAmJiB0bXBsVGFpbCA9PT0gMCxcbiAgICAgICAgZmFsc2UsXG4gICAgICAgICdBZGRpbmcgdGVtcGxhdGUgYmluZGluZ3MgYWZ0ZXIgaG9zdEJpbmRpbmdzIGlzIG5vdCBhbGxvd2VkLicsXG4gICAgICApO1xuICAgIGlmICh0bXBsSGVhZCA9PT0gMCkge1xuICAgICAgdG1wbEhlYWQgPSBpbmRleDtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gV2UgbmVlZCB0byB1cGRhdGUgdGhlIHByZXZpb3VzIHZhbHVlIFwibmV4dFwiIHRvIHBvaW50IHRvIHRoaXMgYmluZGluZ1xuICAgICAgdERhdGFbdG1wbFRhaWwgKyAxXSA9IHNldFRTdHlsaW5nUmFuZ2VOZXh0KHREYXRhW3RtcGxUYWlsICsgMV0gYXMgVFN0eWxpbmdSYW5nZSwgaW5kZXgpO1xuICAgIH1cbiAgICB0bXBsVGFpbCA9IGluZGV4O1xuICB9XG5cbiAgLy8gTm93IHdlIG5lZWQgdG8gdXBkYXRlIC8gY29tcHV0ZSB0aGUgZHVwbGljYXRlcy5cbiAgLy8gU3RhcnRpbmcgd2l0aCBvdXIgbG9jYXRpb24gc2VhcmNoIHRvd2FyZHMgaGVhZCAobGVhc3QgcHJpb3JpdHkpXG4gIGlmIChpc0tleUR1cGxpY2F0ZU9mU3RhdGljKSB7XG4gICAgdERhdGFbaW5kZXggKyAxXSA9IHNldFRTdHlsaW5nUmFuZ2VQcmV2RHVwbGljYXRlKHREYXRhW2luZGV4ICsgMV0gYXMgVFN0eWxpbmdSYW5nZSk7XG4gIH1cbiAgbWFya0R1cGxpY2F0ZXModERhdGEsIHRTdHlsaW5nS2V5LCBpbmRleCwgdHJ1ZSk7XG4gIG1hcmtEdXBsaWNhdGVzKHREYXRhLCB0U3R5bGluZ0tleSwgaW5kZXgsIGZhbHNlKTtcbiAgbWFya0R1cGxpY2F0ZU9mUmVzaWR1YWxTdHlsaW5nKHROb2RlLCB0U3R5bGluZ0tleSwgdERhdGEsIGluZGV4LCBpc0NsYXNzQmluZGluZyk7XG5cbiAgdEJpbmRpbmdzID0gdG9UU3R5bGluZ1JhbmdlKHRtcGxIZWFkLCB0bXBsVGFpbCk7XG4gIGlmIChpc0NsYXNzQmluZGluZykge1xuICAgIHROb2RlLmNsYXNzQmluZGluZ3MgPSB0QmluZGluZ3M7XG4gIH0gZWxzZSB7XG4gICAgdE5vZGUuc3R5bGVCaW5kaW5ncyA9IHRCaW5kaW5ncztcbiAgfVxufVxuXG4vKipcbiAqIExvb2sgaW50byB0aGUgcmVzaWR1YWwgc3R5bGluZyB0byBzZWUgaWYgdGhlIGN1cnJlbnQgYHRTdHlsaW5nS2V5YCBpcyBkdXBsaWNhdGUgb2YgcmVzaWR1YWwuXG4gKlxuICogQHBhcmFtIHROb2RlIGBUTm9kZWAgd2hlcmUgdGhlIHJlc2lkdWFsIGlzIHN0b3JlZC5cbiAqIEBwYXJhbSB0U3R5bGluZ0tleSBgVFN0eWxpbmdLZXlgIHRvIHN0b3JlLlxuICogQHBhcmFtIHREYXRhIGBURGF0YWAgYXNzb2NpYXRlZCB3aXRoIHRoZSBjdXJyZW50IGBMVmlld2AuXG4gKiBAcGFyYW0gaW5kZXggbG9jYXRpb24gb2Ygd2hlcmUgYHRTdHlsZVZhbHVlYCBzaG91bGQgYmUgc3RvcmVkIChhbmQgbGlua2VkIGludG8gbGlzdC4pXG4gKiBAcGFyYW0gaXNDbGFzc0JpbmRpbmcgVHJ1ZSBpZiB0aGUgYXNzb2NpYXRlZCBgdFN0eWxpbmdLZXlgIGFzIGEgYGNsYXNzYCBzdHlsaW5nLlxuICogICAgICAgICAgICAgICAgICAgICAgIGB0Tm9kZS5jbGFzc0JpbmRpbmdzYCBzaG91bGQgYmUgdXNlZCAob3IgYHROb2RlLnN0eWxlQmluZGluZ3NgIG90aGVyd2lzZS4pXG4gKi9cbmZ1bmN0aW9uIG1hcmtEdXBsaWNhdGVPZlJlc2lkdWFsU3R5bGluZyhcbiAgdE5vZGU6IFROb2RlLFxuICB0U3R5bGluZ0tleTogVFN0eWxpbmdLZXksXG4gIHREYXRhOiBURGF0YSxcbiAgaW5kZXg6IG51bWJlcixcbiAgaXNDbGFzc0JpbmRpbmc6IGJvb2xlYW4sXG4pIHtcbiAgY29uc3QgcmVzaWR1YWwgPSBpc0NsYXNzQmluZGluZyA/IHROb2RlLnJlc2lkdWFsQ2xhc3NlcyA6IHROb2RlLnJlc2lkdWFsU3R5bGVzO1xuICBpZiAoXG4gICAgcmVzaWR1YWwgIT0gbnVsbCAvKiBvciB1bmRlZmluZWQgKi8gJiZcbiAgICB0eXBlb2YgdFN0eWxpbmdLZXkgPT0gJ3N0cmluZycgJiZcbiAgICBrZXlWYWx1ZUFycmF5SW5kZXhPZihyZXNpZHVhbCwgdFN0eWxpbmdLZXkpID49IDBcbiAgKSB7XG4gICAgLy8gV2UgaGF2ZSBkdXBsaWNhdGUgaW4gdGhlIHJlc2lkdWFsIHNvIG1hcmsgb3Vyc2VsdmVzIGFzIGR1cGxpY2F0ZS5cbiAgICB0RGF0YVtpbmRleCArIDFdID0gc2V0VFN0eWxpbmdSYW5nZU5leHREdXBsaWNhdGUodERhdGFbaW5kZXggKyAxXSBhcyBUU3R5bGluZ1JhbmdlKTtcbiAgfVxufVxuXG4vKipcbiAqIE1hcmtzIGBUU3R5bGVWYWx1ZWBzIGFzIGR1cGxpY2F0ZXMgaWYgYW5vdGhlciBzdHlsZSBiaW5kaW5nIGluIHRoZSBsaXN0IGhhcyB0aGUgc2FtZVxuICogYFRTdHlsZVZhbHVlYC5cbiAqXG4gKiBOT1RFOiB0aGlzIGZ1bmN0aW9uIGlzIGludGVuZGVkIHRvIGJlIGNhbGxlZCB0d2ljZSBvbmNlIHdpdGggYGlzUHJldkRpcmAgc2V0IHRvIGB0cnVlYCBhbmQgb25jZVxuICogd2l0aCBpdCBzZXQgdG8gYGZhbHNlYCB0byBzZWFyY2ggYm90aCB0aGUgcHJldmlvdXMgYXMgd2VsbCBhcyBuZXh0IGl0ZW1zIGluIHRoZSBsaXN0LlxuICpcbiAqIE5vIGR1cGxpY2F0ZSBjYXNlXG4gKiBgYGBcbiAqICAgW3N0eWxlLmNvbG9yXVxuICogICBbc3R5bGUud2lkdGgucHhdIDw8LSBpbmRleFxuICogICBbc3R5bGUuaGVpZ2h0LnB4XVxuICogYGBgXG4gKlxuICogSW4gdGhlIGFib3ZlIGNhc2UgYWRkaW5nIGBbc3R5bGUud2lkdGgucHhdYCB0byB0aGUgZXhpc3RpbmcgYFtzdHlsZS5jb2xvcl1gIHByb2R1Y2VzIG5vXG4gKiBkdXBsaWNhdGVzIGJlY2F1c2UgYHdpZHRoYCBpcyBub3QgZm91bmQgaW4gYW55IG90aGVyIHBhcnQgb2YgdGhlIGxpbmtlZCBsaXN0LlxuICpcbiAqIER1cGxpY2F0ZSBjYXNlXG4gKiBgYGBcbiAqICAgW3N0eWxlLmNvbG9yXVxuICogICBbc3R5bGUud2lkdGguZW1dXG4gKiAgIFtzdHlsZS53aWR0aC5weF0gPDwtIGluZGV4XG4gKiBgYGBcbiAqIEluIHRoZSBhYm92ZSBjYXNlIGFkZGluZyBgW3N0eWxlLndpZHRoLnB4XWAgd2lsbCBwcm9kdWNlIGEgZHVwbGljYXRlIHdpdGggYFtzdHlsZS53aWR0aC5lbV1gXG4gKiBiZWNhdXNlIGB3aWR0aGAgaXMgZm91bmQgaW4gdGhlIGNoYWluLlxuICpcbiAqIE1hcCBjYXNlIDFcbiAqIGBgYFxuICogICBbc3R5bGUud2lkdGgucHhdXG4gKiAgIFtzdHlsZS5jb2xvcl1cbiAqICAgW3N0eWxlXSAgPDwtIGluZGV4XG4gKiBgYGBcbiAqIEluIHRoZSBhYm92ZSBjYXNlIGFkZGluZyBgW3N0eWxlXWAgd2lsbCBwcm9kdWNlIGEgZHVwbGljYXRlIHdpdGggYW55IG90aGVyIGJpbmRpbmdzIGJlY2F1c2VcbiAqIGBbc3R5bGVdYCBpcyBhIE1hcCBhbmQgYXMgc3VjaCBpcyBmdWxseSBkeW5hbWljIGFuZCBjb3VsZCBwcm9kdWNlIGBjb2xvcmAgb3IgYHdpZHRoYC5cbiAqXG4gKiBNYXAgY2FzZSAyXG4gKiBgYGBcbiAqICAgW3N0eWxlXVxuICogICBbc3R5bGUud2lkdGgucHhdXG4gKiAgIFtzdHlsZS5jb2xvcl0gIDw8LSBpbmRleFxuICogYGBgXG4gKiBJbiB0aGUgYWJvdmUgY2FzZSBhZGRpbmcgYFtzdHlsZS5jb2xvcl1gIHdpbGwgcHJvZHVjZSBhIGR1cGxpY2F0ZSBiZWNhdXNlIHRoZXJlIGlzIGFscmVhZHkgYVxuICogYFtzdHlsZV1gIGJpbmRpbmcgd2hpY2ggaXMgYSBNYXAgYW5kIGFzIHN1Y2ggaXMgZnVsbHkgZHluYW1pYyBhbmQgY291bGQgcHJvZHVjZSBgY29sb3JgIG9yXG4gKiBgd2lkdGhgLlxuICpcbiAqIE5PVEU6IE9uY2UgYFtzdHlsZV1gIChNYXApIGlzIGFkZGVkIGludG8gdGhlIHN5c3RlbSBhbGwgdGhpbmdzIGFyZSBtYXBwZWQgYXMgZHVwbGljYXRlcy5cbiAqIE5PVEU6IFdlIHVzZSBgc3R5bGVgIGFzIGV4YW1wbGUsIGJ1dCBzYW1lIGxvZ2ljIGlzIGFwcGxpZWQgdG8gYGNsYXNzYGVzIGFzIHdlbGwuXG4gKlxuICogQHBhcmFtIHREYXRhIGBURGF0YWAgd2hlcmUgdGhlIGxpbmtlZCBsaXN0IGlzIHN0b3JlZC5cbiAqIEBwYXJhbSB0U3R5bGluZ0tleSBgVFN0eWxpbmdLZXlQcmltaXRpdmVgIHdoaWNoIGNvbnRhaW5zIHRoZSB2YWx1ZSB0byBjb21wYXJlIHRvIG90aGVyIGtleXMgaW5cbiAqICAgICAgICB0aGUgbGlua2VkIGxpc3QuXG4gKiBAcGFyYW0gaW5kZXggU3RhcnRpbmcgbG9jYXRpb24gaW4gdGhlIGxpbmtlZCBsaXN0IHRvIHNlYXJjaCBmcm9tXG4gKiBAcGFyYW0gaXNQcmV2RGlyIERpcmVjdGlvbi5cbiAqICAgICAgICAtIGB0cnVlYCBmb3IgcHJldmlvdXMgKGxvd2VyIHByaW9yaXR5KTtcbiAqICAgICAgICAtIGBmYWxzZWAgZm9yIG5leHQgKGhpZ2hlciBwcmlvcml0eSkuXG4gKi9cbmZ1bmN0aW9uIG1hcmtEdXBsaWNhdGVzKFxuICB0RGF0YTogVERhdGEsXG4gIHRTdHlsaW5nS2V5OiBUU3R5bGluZ0tleVByaW1pdGl2ZSxcbiAgaW5kZXg6IG51bWJlcixcbiAgaXNQcmV2RGlyOiBib29sZWFuLFxuKSB7XG4gIGNvbnN0IHRTdHlsaW5nQXRJbmRleCA9IHREYXRhW2luZGV4ICsgMV0gYXMgVFN0eWxpbmdSYW5nZTtcbiAgY29uc3QgaXNNYXAgPSB0U3R5bGluZ0tleSA9PT0gbnVsbDtcbiAgbGV0IGN1cnNvciA9IGlzUHJldkRpclxuICAgID8gZ2V0VFN0eWxpbmdSYW5nZVByZXYodFN0eWxpbmdBdEluZGV4KVxuICAgIDogZ2V0VFN0eWxpbmdSYW5nZU5leHQodFN0eWxpbmdBdEluZGV4KTtcbiAgbGV0IGZvdW5kRHVwbGljYXRlID0gZmFsc2U7XG4gIC8vIFdlIGtlZXAgaXRlcmF0aW5nIGFzIGxvbmcgYXMgd2UgaGF2ZSBhIGN1cnNvclxuICAvLyBBTkQgZWl0aGVyOlxuICAvLyAtIHdlIGZvdW5kIHdoYXQgd2UgYXJlIGxvb2tpbmcgZm9yLCBPUlxuICAvLyAtIHdlIGFyZSBhIG1hcCBpbiB3aGljaCBjYXNlIHdlIGhhdmUgdG8gY29udGludWUgc2VhcmNoaW5nIGV2ZW4gYWZ0ZXIgd2UgZmluZCB3aGF0IHdlIHdlcmVcbiAgLy8gICBsb29raW5nIGZvciBzaW5jZSB3ZSBhcmUgYSB3aWxkIGNhcmQgYW5kIGV2ZXJ5dGhpbmcgbmVlZHMgdG8gYmUgZmxpcHBlZCB0byBkdXBsaWNhdGUuXG4gIHdoaWxlIChjdXJzb3IgIT09IDAgJiYgKGZvdW5kRHVwbGljYXRlID09PSBmYWxzZSB8fCBpc01hcCkpIHtcbiAgICBuZ0Rldk1vZGUgJiYgYXNzZXJ0SW5kZXhJblJhbmdlKHREYXRhLCBjdXJzb3IpO1xuICAgIGNvbnN0IHRTdHlsaW5nVmFsdWVBdEN1cnNvciA9IHREYXRhW2N1cnNvcl0gYXMgVFN0eWxpbmdLZXk7XG4gICAgY29uc3QgdFN0eWxlUmFuZ2VBdEN1cnNvciA9IHREYXRhW2N1cnNvciArIDFdIGFzIFRTdHlsaW5nUmFuZ2U7XG4gICAgaWYgKGlzU3R5bGluZ01hdGNoKHRTdHlsaW5nVmFsdWVBdEN1cnNvciwgdFN0eWxpbmdLZXkpKSB7XG4gICAgICBmb3VuZER1cGxpY2F0ZSA9IHRydWU7XG4gICAgICB0RGF0YVtjdXJzb3IgKyAxXSA9IGlzUHJldkRpclxuICAgICAgICA/IHNldFRTdHlsaW5nUmFuZ2VOZXh0RHVwbGljYXRlKHRTdHlsZVJhbmdlQXRDdXJzb3IpXG4gICAgICAgIDogc2V0VFN0eWxpbmdSYW5nZVByZXZEdXBsaWNhdGUodFN0eWxlUmFuZ2VBdEN1cnNvcik7XG4gICAgfVxuICAgIGN1cnNvciA9IGlzUHJldkRpclxuICAgICAgPyBnZXRUU3R5bGluZ1JhbmdlUHJldih0U3R5bGVSYW5nZUF0Q3Vyc29yKVxuICAgICAgOiBnZXRUU3R5bGluZ1JhbmdlTmV4dCh0U3R5bGVSYW5nZUF0Q3Vyc29yKTtcbiAgfVxuICBpZiAoZm91bmREdXBsaWNhdGUpIHtcbiAgICAvLyBpZiB3ZSBmb3VuZCBhIGR1cGxpY2F0ZSwgdGhhbiBtYXJrIG91cnNlbHZlcy5cbiAgICB0RGF0YVtpbmRleCArIDFdID0gaXNQcmV2RGlyXG4gICAgICA/IHNldFRTdHlsaW5nUmFuZ2VQcmV2RHVwbGljYXRlKHRTdHlsaW5nQXRJbmRleClcbiAgICAgIDogc2V0VFN0eWxpbmdSYW5nZU5leHREdXBsaWNhdGUodFN0eWxpbmdBdEluZGV4KTtcbiAgfVxufVxuXG4vKipcbiAqIERldGVybWluZXMgaWYgdHdvIGBUU3R5bGluZ0tleWBzIGFyZSBhIG1hdGNoLlxuICpcbiAqIFdoZW4gY29tcHV0aW5nIHdoZXRoZXIgYSBiaW5kaW5nIGNvbnRhaW5zIGEgZHVwbGljYXRlLCB3ZSBuZWVkIHRvIGNvbXBhcmUgaWYgdGhlIGluc3RydWN0aW9uXG4gKiBgVFN0eWxpbmdLZXlgIGhhcyBhIG1hdGNoLlxuICpcbiAqIEhlcmUgYXJlIGV4YW1wbGVzIG9mIGBUU3R5bGluZ0tleWBzIHdoaWNoIG1hdGNoIGdpdmVuIGB0U3R5bGluZ0tleUN1cnNvcmAgaXM6XG4gKiAtIGBjb2xvcmBcbiAqICAgIC0gYGNvbG9yYCAgICAvLyBNYXRjaCBhbm90aGVyIGNvbG9yXG4gKiAgICAtIGBudWxsYCAgICAgLy8gVGhhdCBtZWFucyB0aGF0IGB0U3R5bGluZ0tleWAgaXMgYSBgY2xhc3NNYXBgL2BzdHlsZU1hcGAgaW5zdHJ1Y3Rpb25cbiAqICAgIC0gYFsnJywgJ2NvbG9yJywgJ290aGVyJywgdHJ1ZV1gIC8vIHdyYXBwZWQgYGNvbG9yYCBzbyBtYXRjaFxuICogICAgLSBgWycnLCBudWxsLCAnb3RoZXInLCB0cnVlXWAgICAgICAgLy8gd3JhcHBlZCBgbnVsbGAgc28gbWF0Y2hcbiAqICAgIC0gYFsnJywgJ3dpZHRoJywgJ2NvbG9yJywgJ3ZhbHVlJ11gIC8vIHdyYXBwZWQgc3RhdGljIHZhbHVlIGNvbnRhaW5zIGEgbWF0Y2ggb24gYCdjb2xvcidgXG4gKiAtIGBudWxsYCAgICAgICAvLyBgdFN0eWxpbmdLZXlDdXJzb3JgIGFsd2F5cyBtYXRjaCBhcyBpdCBpcyBgY2xhc3NNYXBgL2BzdHlsZU1hcGAgaW5zdHJ1Y3Rpb25cbiAqXG4gKiBAcGFyYW0gdFN0eWxpbmdLZXlDdXJzb3JcbiAqIEBwYXJhbSB0U3R5bGluZ0tleVxuICovXG5mdW5jdGlvbiBpc1N0eWxpbmdNYXRjaCh0U3R5bGluZ0tleUN1cnNvcjogVFN0eWxpbmdLZXksIHRTdHlsaW5nS2V5OiBUU3R5bGluZ0tleVByaW1pdGl2ZSkge1xuICBuZ0Rldk1vZGUgJiZcbiAgICBhc3NlcnROb3RFcXVhbChcbiAgICAgIEFycmF5LmlzQXJyYXkodFN0eWxpbmdLZXkpLFxuICAgICAgdHJ1ZSxcbiAgICAgIFwiRXhwZWN0ZWQgdGhhdCAndFN0eWxpbmdLZXknIGhhcyBiZWVuIHVud3JhcHBlZFwiLFxuICAgICk7XG4gIGlmIChcbiAgICB0U3R5bGluZ0tleUN1cnNvciA9PT0gbnVsbCB8fCAvLyBJZiB0aGUgY3Vyc29yIGlzIGBudWxsYCBpdCBtZWFucyB0aGF0IHdlIGhhdmUgbWFwIGF0IHRoYXRcbiAgICAvLyBsb2NhdGlvbiBzbyB3ZSBtdXN0IGFzc3VtZSB0aGF0IHdlIGhhdmUgYSBtYXRjaC5cbiAgICB0U3R5bGluZ0tleSA9PSBudWxsIHx8IC8vIElmIGB0U3R5bGluZ0tleWAgaXMgYG51bGxgIHRoZW4gaXQgaXMgYSBtYXAgdGhlcmVmb3IgYXNzdW1lIHRoYXQgaXRcbiAgICAvLyBjb250YWlucyBhIG1hdGNoLlxuICAgIChBcnJheS5pc0FycmF5KHRTdHlsaW5nS2V5Q3Vyc29yKSA/IHRTdHlsaW5nS2V5Q3Vyc29yWzFdIDogdFN0eWxpbmdLZXlDdXJzb3IpID09PSB0U3R5bGluZ0tleSAvLyBJZiB0aGUga2V5cyBtYXRjaCBleHBsaWNpdGx5IHRoYW4gd2UgYXJlIGEgbWF0Y2guXG4gICkge1xuICAgIHJldHVybiB0cnVlO1xuICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkodFN0eWxpbmdLZXlDdXJzb3IpICYmIHR5cGVvZiB0U3R5bGluZ0tleSA9PT0gJ3N0cmluZycpIHtcbiAgICAvLyBpZiB3ZSBkaWQgbm90IGZpbmQgYSBtYXRjaCwgYnV0IGB0U3R5bGluZ0tleUN1cnNvcmAgaXMgYEtleVZhbHVlQXJyYXlgIHRoYXQgbWVhbnMgY3Vyc29yIGhhc1xuICAgIC8vIHN0YXRpY3MgYW5kIHdlIG5lZWQgdG8gY2hlY2sgdGhvc2UgYXMgd2VsbC5cbiAgICByZXR1cm4ga2V5VmFsdWVBcnJheUluZGV4T2YodFN0eWxpbmdLZXlDdXJzb3IsIHRTdHlsaW5nS2V5KSA+PSAwOyAvLyBzZWUgaWYgd2UgYXJlIG1hdGNoaW5nIHRoZSBrZXlcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG4iXX0=