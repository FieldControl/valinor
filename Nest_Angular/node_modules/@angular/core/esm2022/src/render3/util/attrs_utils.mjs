/**
 * Assigns all attribute values to the provided element via the inferred renderer.
 *
 * This function accepts two forms of attribute entries:
 *
 * default: (key, value):
 *  attrs = [key1, value1, key2, value2]
 *
 * namespaced: (NAMESPACE_MARKER, uri, name, value)
 *  attrs = [NAMESPACE_MARKER, uri, name, value, NAMESPACE_MARKER, uri, name, value]
 *
 * The `attrs` array can contain a mix of both the default and namespaced entries.
 * The "default" values are set without a marker, but if the function comes across
 * a marker value then it will attempt to set a namespaced value. If the marker is
 * not of a namespaced value then the function will quit and return the index value
 * where it stopped during the iteration of the attrs array.
 *
 * See [AttributeMarker] to understand what the namespace marker value is.
 *
 * Note that this instruction does not support assigning style and class values to
 * an element. See `elementStart` and `elementHostAttrs` to learn how styling values
 * are applied to an element.
 * @param renderer The renderer to be used
 * @param native The element that the attributes will be assigned to
 * @param attrs The attribute array of values that will be assigned to the element
 * @returns the index value that was last accessed in the attributes array
 */
export function setUpAttributes(renderer, native, attrs) {
    let i = 0;
    while (i < attrs.length) {
        const value = attrs[i];
        if (typeof value === 'number') {
            // only namespaces are supported. Other value types (such as style/class
            // entries) are not supported in this function.
            if (value !== 0 /* AttributeMarker.NamespaceURI */) {
                break;
            }
            // we just landed on the marker value ... therefore
            // we should skip to the next entry
            i++;
            const namespaceURI = attrs[i++];
            const attrName = attrs[i++];
            const attrVal = attrs[i++];
            ngDevMode && ngDevMode.rendererSetAttribute++;
            renderer.setAttribute(native, attrName, attrVal, namespaceURI);
        }
        else {
            // attrName is string;
            const attrName = value;
            const attrVal = attrs[++i];
            // Standard attributes
            ngDevMode && ngDevMode.rendererSetAttribute++;
            if (isAnimationProp(attrName)) {
                renderer.setProperty(native, attrName, attrVal);
            }
            else {
                renderer.setAttribute(native, attrName, attrVal);
            }
            i++;
        }
    }
    // another piece of code may iterate over the same attributes array. Therefore
    // it may be helpful to return the exact spot where the attributes array exited
    // whether by running into an unsupported marker or if all the static values were
    // iterated over.
    return i;
}
/**
 * Test whether the given value is a marker that indicates that the following
 * attribute values in a `TAttributes` array are only the names of attributes,
 * and not name-value pairs.
 * @param marker The attribute marker to test.
 * @returns true if the marker is a "name-only" marker (e.g. `Bindings`, `Template` or `I18n`).
 */
export function isNameOnlyAttributeMarker(marker) {
    return (marker === 3 /* AttributeMarker.Bindings */ ||
        marker === 4 /* AttributeMarker.Template */ ||
        marker === 6 /* AttributeMarker.I18n */);
}
export function isAnimationProp(name) {
    // Perf note: accessing charCodeAt to check for the first character of a string is faster as
    // compared to accessing a character at index 0 (ex. name[0]). The main reason for this is that
    // charCodeAt doesn't allocate memory to return a substring.
    return name.charCodeAt(0) === 64 /* CharCode.AT_SIGN */;
}
/**
 * Merges `src` `TAttributes` into `dst` `TAttributes` removing any duplicates in the process.
 *
 * This merge function keeps the order of attrs same.
 *
 * @param dst Location of where the merged `TAttributes` should end up.
 * @param src `TAttributes` which should be appended to `dst`
 */
export function mergeHostAttrs(dst, src) {
    if (src === null || src.length === 0) {
        // do nothing
    }
    else if (dst === null || dst.length === 0) {
        // We have source, but dst is empty, just make a copy.
        dst = src.slice();
    }
    else {
        let srcMarker = -1 /* AttributeMarker.ImplicitAttributes */;
        for (let i = 0; i < src.length; i++) {
            const item = src[i];
            if (typeof item === 'number') {
                srcMarker = item;
            }
            else {
                if (srcMarker === 0 /* AttributeMarker.NamespaceURI */) {
                    // Case where we need to consume `key1`, `key2`, `value` items.
                }
                else if (srcMarker === -1 /* AttributeMarker.ImplicitAttributes */ ||
                    srcMarker === 2 /* AttributeMarker.Styles */) {
                    // Case where we have to consume `key1` and `value` only.
                    mergeHostAttribute(dst, srcMarker, item, null, src[++i]);
                }
                else {
                    // Case where we have to consume `key1` only.
                    mergeHostAttribute(dst, srcMarker, item, null, null);
                }
            }
        }
    }
    return dst;
}
/**
 * Append `key`/`value` to existing `TAttributes` taking region marker and duplicates into account.
 *
 * @param dst `TAttributes` to append to.
 * @param marker Region where the `key`/`value` should be added.
 * @param key1 Key to add to `TAttributes`
 * @param key2 Key to add to `TAttributes` (in case of `AttributeMarker.NamespaceURI`)
 * @param value Value to add or to overwrite to `TAttributes` Only used if `marker` is not Class.
 */
export function mergeHostAttribute(dst, marker, key1, key2, value) {
    let i = 0;
    // Assume that new markers will be inserted at the end.
    let markerInsertPosition = dst.length;
    // scan until correct type.
    if (marker === -1 /* AttributeMarker.ImplicitAttributes */) {
        markerInsertPosition = -1;
    }
    else {
        while (i < dst.length) {
            const dstValue = dst[i++];
            if (typeof dstValue === 'number') {
                if (dstValue === marker) {
                    markerInsertPosition = -1;
                    break;
                }
                else if (dstValue > marker) {
                    // We need to save this as we want the markers to be inserted in specific order.
                    markerInsertPosition = i - 1;
                    break;
                }
            }
        }
    }
    // search until you find place of insertion
    while (i < dst.length) {
        const item = dst[i];
        if (typeof item === 'number') {
            // since `i` started as the index after the marker, we did not find it if we are at the next
            // marker
            break;
        }
        else if (item === key1) {
            // We already have same token
            if (key2 === null) {
                if (value !== null) {
                    dst[i + 1] = value;
                }
                return;
            }
            else if (key2 === dst[i + 1]) {
                dst[i + 2] = value;
                return;
            }
        }
        // Increment counter.
        i++;
        if (key2 !== null)
            i++;
        if (value !== null)
            i++;
    }
    // insert at location.
    if (markerInsertPosition !== -1) {
        dst.splice(markerInsertPosition, 0, marker);
        i = markerInsertPosition + 1;
    }
    dst.splice(i++, 0, key1);
    if (key2 !== null) {
        dst.splice(i++, 0, key2);
    }
    if (value !== null) {
        dst.splice(i++, 0, value);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXR0cnNfdXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9yZW5kZXIzL3V0aWwvYXR0cnNfdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBY0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBMEJHO0FBQ0gsTUFBTSxVQUFVLGVBQWUsQ0FBQyxRQUFrQixFQUFFLE1BQWdCLEVBQUUsS0FBa0I7SUFDdEYsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ1YsT0FBTyxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3hCLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2QixJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRSxDQUFDO1lBQzlCLHdFQUF3RTtZQUN4RSwrQ0FBK0M7WUFDL0MsSUFBSSxLQUFLLHlDQUFpQyxFQUFFLENBQUM7Z0JBQzNDLE1BQU07WUFDUixDQUFDO1lBRUQsbURBQW1EO1lBQ25ELG1DQUFtQztZQUNuQyxDQUFDLEVBQUUsQ0FBQztZQUVKLE1BQU0sWUFBWSxHQUFHLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBVyxDQUFDO1lBQzFDLE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBVyxDQUFDO1lBQ3RDLE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBVyxDQUFDO1lBQ3JDLFNBQVMsSUFBSSxTQUFTLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztZQUM5QyxRQUFRLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQ2pFLENBQUM7YUFBTSxDQUFDO1lBQ04sc0JBQXNCO1lBQ3RCLE1BQU0sUUFBUSxHQUFHLEtBQWUsQ0FBQztZQUNqQyxNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMs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LEVBQUUsQ0FBQztnQkFDL0IsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxLQUFNLENBQUM7Z0JBQ3BCLE9BQU87WUFDVCxDQUFDO1FBQ0gsQ0FBQztRQUNELHFCQUFxQjtRQUNyQixDQUFDLEVBQUUsQ0FBQztRQUNKLElBQUksSUFBSSxLQUFLLElBQUk7WUFBRSxDQUFDLEVBQUUsQ0FBQztRQUN2QixJQUFJLEtBQUssS0FBSyxJQUFJO1lBQUUsQ0FBQyxFQUFFLENBQUM7SUFDMUIsQ0FBQztJQUVELHNCQUFzQjtJQUN0QixJQUFJLG9CQUFvQixLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDaEMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDNUMsQ0FBQyxHQUFHLG9CQUFvQixHQUFHLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBQ0QsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDekIsSUFBSSxJQUFJLEtBQUssSUFBSSxFQUFFLENBQUM7UUFDbEIsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDM0IsQ0FBQztJQUNELElBQUksS0FBSyxLQUFLLElBQUksRUFBRSxDQUFDO1FBQ25CLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzVCLENBQUM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtDaGFyQ29kZX0gZnJvbSAnLi4vLi4vdXRpbC9jaGFyX2NvZGUnO1xuaW1wb3J0IHtBdHRyaWJ1dGVNYXJrZXJ9IGZyb20gJy4uL2ludGVyZmFjZXMvYXR0cmlidXRlX21hcmtlcic7XG5pbXBvcnQge1RBdHRyaWJ1dGVzfSBmcm9tICcuLi9pbnRlcmZhY2VzL25vZGUnO1xuaW1wb3J0IHtDc3NTZWxlY3Rvcn0gZnJvbSAnLi4vaW50ZXJmYWNlcy9wcm9qZWN0aW9uJztcbmltcG9ydCB7UmVuZGVyZXJ9IGZyb20gJy4uL2ludGVyZmFjZXMvcmVuZGVyZXInO1xuaW1wb3J0IHtSRWxlbWVudH0gZnJvbSAnLi4vaW50ZXJmYWNlcy9yZW5kZXJlcl9kb20nO1xuXG4vKipcbiAqIEFzc2lnbnMgYWxsIGF0dHJpYnV0ZSB2YWx1ZXMgdG8gdGhlIHByb3ZpZGVkIGVsZW1lbnQgdmlhIHRoZSBpbmZlcnJlZCByZW5kZXJlci5cbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIGFjY2VwdHMgdHdvIGZvcm1zIG9mIGF0dHJpYnV0ZSBlbnRyaWVzOlxuICpcbiAqIGRlZmF1bHQ6IChrZXksIHZhbHVlKTpcbiAqICBhdHRycyA9IFtrZXkxLCB2YWx1ZTEsIGtleTIsIHZhbHVlMl1cbiAqXG4gKiBuYW1lc3BhY2VkOiAoTkFNRVNQQUNFX01BUktFUiwgdXJpLCBuYW1lLCB2YWx1ZSlcbiAqICBhdHRycyA9IFtOQU1FU1BBQ0VfTUFSS0VSLCB1cmksIG5hbWUsIHZhbHVlLCBOQU1FU1BBQ0VfTUFSS0VSLCB1cmksIG5hbWUsIHZhbHVlXVxuICpcbiAqIFRoZSBgYXR0cnNgIGFycmF5IGNhbiBjb250YWluIGEgbWl4IG9mIGJvdGggdGhlIGRlZmF1bHQgYW5kIG5hbWVzcGFjZWQgZW50cmllcy5cbiAqIFRoZSBcImRlZmF1bHRcIiB2YWx1ZXMgYXJlIHNldCB3aXRob3V0IGEgbWFya2VyLCBidXQgaWYgdGhlIGZ1bmN0aW9uIGNvbWVzIGFjcm9zc1xuICogYSBtYXJrZXIgdmFsdWUgdGhlbiBpdCB3aWxsIGF0dGVtcHQgdG8gc2V0IGEgbmFtZXNwYWNlZCB2YWx1ZS4gSWYgdGhlIG1hcmtlciBpc1xuICogbm90IG9mIGEgbmFtZXNwYWNlZCB2YWx1ZSB0aGVuIHRoZSBmdW5jdGlvbiB3aWxsIHF1aXQgYW5kIHJldHVybiB0aGUgaW5kZXggdmFsdWVcbiAqIHdoZXJlIGl0IHN0b3BwZWQgZHVyaW5nIHRoZSBpdGVyYXRpb24gb2YgdGhlIGF0dHJzIGFycmF5LlxuICpcbiAqIFNlZSBbQXR0cmlidXRlTWFya2VyXSB0byB1bmRlcnN0YW5kIHdoYXQgdGhlIG5hbWVzcGFjZSBtYXJrZXIgdmFsdWUgaXMuXG4gKlxuICogTm90ZSB0aGF0IHRoaXMgaW5zdHJ1Y3Rpb24gZG9lcyBub3Qgc3VwcG9ydCBhc3NpZ25pbmcgc3R5bGUgYW5kIGNsYXNzIHZhbHVlcyB0b1xuICogYW4gZWxlbWVudC4gU2VlIGBlbGVtZW50U3RhcnRgIGFuZCBgZWxlbWVudEhvc3RBdHRyc2AgdG8gbGVhcm4gaG93IHN0eWxpbmcgdmFsdWVzXG4gKiBhcmUgYXBwbGllZCB0byBhbiBlbGVtZW50LlxuICogQHBhcmFtIHJlbmRlcmVyIFRoZSByZW5kZXJlciB0byBiZSB1c2VkXG4gKiBAcGFyYW0gbmF0aXZlIFRoZSBlbGVtZW50IHRoYXQgdGhlIGF0dHJpYnV0ZXMgd2lsbCBiZSBhc3NpZ25lZCB0b1xuICogQHBhcmFtIGF0dHJzIFRoZSBhdHRyaWJ1dGUgYXJyYXkgb2YgdmFsdWVzIHRoYXQgd2lsbCBiZSBhc3NpZ25lZCB0byB0aGUgZWxlbWVudFxuICogQHJldHVybnMgdGhlIGluZGV4IHZhbHVlIHRoYXQgd2FzIGxhc3QgYWNjZXNzZWQgaW4gdGhlIGF0dHJpYnV0ZXMgYXJyYXlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldFVwQXR0cmlidXRlcyhyZW5kZXJlcjogUmVuZGVyZXIsIG5hdGl2ZTogUkVsZW1lbnQsIGF0dHJzOiBUQXR0cmlidXRlcyk6IG51bWJlciB7XG4gIGxldCBpID0gMDtcbiAgd2hpbGUgKGkgPCBhdHRycy5sZW5ndGgpIHtcbiAgICBjb25zdCB2YWx1ZSA9IGF0dHJzW2ldO1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInKSB7XG4gICAgICAvLyBvbmx5IG5hbWVzcGFjZXMgYXJlIHN1cHBvcnRlZC4gT3RoZXIgdmFsdWUgdHlwZXMgKHN1Y2ggYXMgc3R5bGUvY2xhc3NcbiAgICAgIC8vIGVudHJpZXMpIGFyZSBub3Qgc3VwcG9ydGVkIGluIHRoaXMgZnVuY3Rpb24uXG4gICAgICBpZiAodmFsdWUgIT09IEF0dHJpYnV0ZU1hcmtlci5OYW1lc3BhY2VVUkkpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIC8vIHdlIGp1c3QgbGFuZGVkIG9uIHRoZSBtYXJrZXIgdmFsdWUgLi4uIHRoZXJlZm9yZVxuICAgICAgLy8gd2Ugc2hvdWxkIHNraXAgdG8gdGhlIG5leHQgZW50cnlcbiAgICAgIGkrKztcblxuICAgICAgY29uc3QgbmFtZXNwYWNlVVJJID0gYXR0cnNbaSsrXSBhcyBzdHJpbmc7XG4gICAgICBjb25zdCBhdHRyTmFtZSA9IGF0dHJzW2krK10gYXMgc3RyaW5nO1xuICAgICAgY29uc3QgYXR0clZhbCA9IGF0dHJzW2krK10gYXMgc3RyaW5nO1xuICAgICAgbmdEZXZNb2RlICYmIG5nRGV2TW9kZS5yZW5kZXJlclNldEF0dHJpYnV0ZSsrO1xuICAgICAgcmVuZGVyZXIuc2V0QXR0cmlidXRlKG5hdGl2ZSwgYXR0ck5hbWUsIGF0dHJWYWwsIG5hbWVzcGFjZVVSSSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGF0dHJOYW1lIGlzIHN0cmluZztcbiAgICAgIGNvbnN0IGF0dHJOYW1lID0gdmFsdWUgYXMgc3RyaW5nO1xuICAgICAgY29uc3QgYXR0clZhbCA9IGF0dHJzWysraV07XG4gICAgICAvLyBTdGFuZGFyZCBhdHRyaWJ1dGVzXG4gICAgICBuZ0Rldk1vZGUgJiYgbmdEZXZNb2RlLnJlbmRlcmVyU2V0QXR0cmlidXRlKys7XG4gICAgICBpZiAoaXNBbmltYXRpb25Qcm9wKGF0dHJOYW1lKSkge1xuICAgICAgICByZW5kZXJlci5zZXRQcm9wZXJ0eShuYXRpdmUsIGF0dHJOYW1lLCBhdHRyVmFsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlbmRlcmVyLnNldEF0dHJpYnV0ZShuYXRpdmUsIGF0dHJOYW1lLCBhdHRyVmFsIGFzIHN0cmluZyk7XG4gICAgICB9XG4gICAgICBpKys7XG4gICAgfVxuICB9XG5cbiAgLy8gYW5vdGhlciBwaWVjZSBvZiBjb2RlIG1heSBpdGVyYXRlIG92ZXIgdGhlIHNhbWUgYXR0cmlidXRlcyBhcnJheS4gVGhlcmVmb3JlXG4gIC8vIGl0IG1heSBiZSBoZWxwZnVsIHRvIHJldHVybiB0aGUgZXhhY3Qgc3BvdCB3aGVyZSB0aGUgYXR0cmlidXRlcyBhcnJheSBleGl0ZWRcbiAgLy8gd2hldGhlciBieSBydW5uaW5nIGludG8gYW4gdW5zdXBwb3J0ZWQgbWFya2VyIG9yIGlmIGFsbCB0aGUgc3RhdGljIHZhbHVlcyB3ZXJlXG4gIC8vIGl0ZXJhdGVkIG92ZXIuXG4gIHJldHVybiBpO1xufVxuXG4vKipcbiAqIFRlc3Qgd2hldGhlciB0aGUgZ2l2ZW4gdmFsdWUgaXMgYSBtYXJrZXIgdGhhdCBpbmRpY2F0ZXMgdGhhdCB0aGUgZm9sbG93aW5nXG4gKiBhdHRyaWJ1dGUgdmFsdWVzIGluIGEgYFRBdHRyaWJ1dGVzYCBhcnJheSBhcmUgb25seSB0aGUgbmFtZXMgb2YgYXR0cmlidXRlcyxcbiAqIGFuZCBub3QgbmFtZS12YWx1ZSBwYWlycy5cbiAqIEBwYXJhbSBtYXJrZXIgVGhlIGF0dHJpYnV0ZSBtYXJrZXIgdG8gdGVzdC5cbiAqIEByZXR1cm5zIHRydWUgaWYgdGhlIG1hcmtlciBpcyBhIFwibmFtZS1vbmx5XCIgbWFya2VyIChlLmcuIGBCaW5kaW5nc2AsIGBUZW1wbGF0ZWAgb3IgYEkxOG5gKS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzTmFtZU9ubHlBdHRyaWJ1dGVNYXJrZXIobWFya2VyOiBzdHJpbmcgfCBBdHRyaWJ1dGVNYXJrZXIgfCBDc3NTZWxlY3Rvcikge1xuICByZXR1cm4gKFxuICAgIG1hcmtlciA9PT0gQXR0cmlidXRlTWFya2VyLkJpbmRpbmdzIHx8XG4gICAgbWFya2VyID09PSBBdHRyaWJ1dGVNYXJrZXIuVGVtcGxhdGUgfHxcbiAgICBtYXJrZXIgPT09IEF0dHJpYnV0ZU1hcmtlci5JMThuXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0FuaW1hdGlvblByb3AobmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIC8vIFBlcmYgbm90ZTogYWNjZXNzaW5nIGNoYXJDb2RlQXQgdG8gY2hlY2sgZm9yIHRoZSBmaXJzdCBjaGFyYWN0ZXIgb2YgYSBzdHJpbmcgaXMgZmFzdGVyIGFzXG4gIC8vIGNvbXBhcmVkIHRvIGFjY2Vzc2luZyBhIGNoYXJhY3RlciBhdCBpbmRleCAwIChleC4gbmFtZVswXSkuIFRoZSBtYWluIHJlYXNvbiBmb3IgdGhpcyBpcyB0aGF0XG4gIC8vIGNoYXJDb2RlQXQgZG9lc24ndCBhbGxvY2F0ZSBtZW1vcnkgdG8gcmV0dXJuIGEgc3Vic3RyaW5nLlxuICByZXR1cm4gbmFtZS5jaGFyQ29kZUF0KDApID09PSBDaGFyQ29kZS5BVF9TSUdOO1xufVxuXG4vKipcbiAqIE1lcmdlcyBgc3JjYCBgVEF0dHJpYnV0ZXNgIGludG8gYGRzdGAgYFRBdHRyaWJ1dGVzYCByZW1vdmluZyBhbnkgZHVwbGljYXRlcyBpbiB0aGUgcHJvY2Vzcy5cbiAqXG4gKiBUaGlzIG1lcmdlIGZ1bmN0aW9uIGtlZXBzIHRoZSBvcmRlciBvZiBhdHRycyBzYW1lLlxuICpcbiAqIEBwYXJhbSBkc3QgTG9jYXRpb24gb2Ygd2hlcmUgdGhlIG1lcmdlZCBgVEF0dHJpYnV0ZXNgIHNob3VsZCBlbmQgdXAuXG4gKiBAcGFyYW0gc3JjIGBUQXR0cmlidXRlc2Agd2hpY2ggc2hvdWxkIGJlIGFwcGVuZGVkIHRvIGBkc3RgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtZXJnZUhvc3RBdHRycyhcbiAgZHN0OiBUQXR0cmlidXRlcyB8IG51bGwsXG4gIHNyYzogVEF0dHJpYnV0ZXMgfCBudWxsLFxuKTogVEF0dHJpYnV0ZXMgfCBudWxsIHtcbiAgaWYgKHNyYyA9PT0gbnVsbCB8fCBzcmMubGVuZ3RoID09PSAwKSB7XG4gICAgLy8gZG8gbm90aGluZ1xuICB9IGVsc2UgaWYgKGRzdCA9PT0gbnVsbCB8fCBkc3QubGVuZ3RoID09PSAwKSB7XG4gICAgLy8gV2UgaGF2ZSBzb3VyY2UsIGJ1dCBkc3QgaXMgZW1wdHksIGp1c3QgbWFrZSBhIGNvcHkuXG4gICAgZHN0ID0gc3JjLnNsaWNlKCk7XG4gIH0gZWxzZSB7XG4gICAgbGV0IHNyY01hcmtlcjogQXR0cmlidXRlTWFya2VyID0gQXR0cmlidXRlTWFya2VyLkltcGxpY2l0QXR0cmlidXRlcztcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNyYy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgaXRlbSA9IHNyY1tpXTtcbiAgICAgIGlmICh0eXBlb2YgaXRlbSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgc3JjTWFya2VyID0gaXRlbTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChzcmNNYXJrZXIgPT09IEF0dHJpYnV0ZU1hcmtlci5OYW1lc3BhY2VVUkkpIHtcbiAgICAgICAgICAvLyBDYXNlIHdoZXJlIHdlIG5lZWQgdG8gY29uc3VtZSBga2V5MWAsIGBrZXkyYCwgYHZhbHVlYCBpdGVtcy5cbiAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICBzcmNNYXJrZXIgPT09IEF0dHJpYnV0ZU1hcmtlci5JbXBsaWNpdEF0dHJpYnV0ZXMgfHxcbiAgICAgICAgICBzcmNNYXJrZXIgPT09IEF0dHJpYnV0ZU1hcmtlci5TdHlsZXNcbiAgICAgICAgKSB7XG4gICAgICAgICAgLy8gQ2FzZSB3aGVyZSB3ZSBoYXZlIHRvIGNvbnN1bWUgYGtleTFgIGFuZCBgdmFsdWVgIG9ubHkuXG4gICAgICAgICAgbWVyZ2VIb3N0QXR0cmlidXRlKGRzdCwgc3JjTWFya2VyLCBpdGVtIGFzIHN0cmluZywgbnVsbCwgc3JjWysraV0gYXMgc3RyaW5nKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBDYXNlIHdoZXJlIHdlIGhhdmUgdG8gY29uc3VtZSBga2V5MWAgb25seS5cbiAgICAgICAgICBtZXJnZUhvc3RBdHRyaWJ1dGUoZHN0LCBzcmNNYXJrZXIsIGl0ZW0gYXMgc3RyaW5nLCBudWxsLCBudWxsKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gZHN0O1xufVxuXG4vKipcbiAqIEFwcGVuZCBga2V5YC9gdmFsdWVgIHRvIGV4aXN0aW5nIGBUQXR0cmlidXRlc2AgdGFraW5nIHJlZ2lvbiBtYXJrZXIgYW5kIGR1cGxpY2F0ZXMgaW50byBhY2NvdW50LlxuICpcbiAqIEBwYXJhbSBkc3QgYFRBdHRyaWJ1dGVzYCB0byBhcHBlbmQgdG8uXG4gKiBAcGFyYW0gbWFya2VyIFJlZ2lvbiB3aGVyZSB0aGUgYGtleWAvYHZhbHVlYCBzaG91bGQgYmUgYWRkZWQuXG4gKiBAcGFyYW0ga2V5MSBLZXkgdG8gYWRkIHRvIGBUQXR0cmlidXRlc2BcbiAqIEBwYXJhbSBrZXkyIEtleSB0byBhZGQgdG8gYFRBdHRyaWJ1dGVzYCAoaW4gY2FzZSBvZiBgQXR0cmlidXRlTWFya2VyLk5hbWVzcGFjZVVSSWApXG4gKiBAcGFyYW0gdmFsdWUgVmFsdWUgdG8gYWRkIG9yIHRvIG92ZXJ3cml0ZSB0byBgVEF0dHJpYnV0ZXNgIE9ubHkgdXNlZCBpZiBgbWFya2VyYCBpcyBub3QgQ2xhc3MuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtZXJnZUhvc3RBdHRyaWJ1dGUoXG4gIGRzdDogVEF0dHJpYnV0ZXMsXG4gIG1hcmtlcjogQXR0cmlidXRlTWFya2VyLFxuICBrZXkxOiBzdHJpbmcsXG4gIGtleTI6IHN0cmluZyB8IG51bGwsXG4gIHZhbHVlOiBzdHJpbmcgfCBudWxsLFxuKTogdm9pZCB7XG4gIGxldCBpID0gMDtcbiAgLy8gQXNzdW1lIHRoYXQgbmV3IG1hcmtlcnMgd2lsbCBiZSBpbnNlcnRlZCBhdCB0aGUgZW5kLlxuICBsZXQgbWFya2VySW5zZXJ0UG9zaXRpb24gPSBkc3QubGVuZ3RoO1xuICAvLyBzY2FuIHVudGlsIGNvcnJlY3QgdHlwZS5cbiAgaWYgKG1hcmtlciA9PT0gQXR0cmlidXRlTWFya2VyLkltcGxpY2l0QXR0cmlidXRlcykge1xuICAgIG1hcmtlckluc2VydFBvc2l0aW9uID0gLTE7XG4gIH0gZWxzZSB7XG4gICAgd2hpbGUgKGkgPCBkc3QubGVuZ3RoKSB7XG4gICAgICBjb25zdCBkc3RWYWx1ZSA9IGRzdFtpKytdO1xuICAgICAgaWYgKHR5cGVvZiBkc3RWYWx1ZSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgaWYgKGRzdFZhbHVlID09PSBtYXJrZXIpIHtcbiAgICAgICAgICBtYXJrZXJJbnNlcnRQb3NpdGlvbiA9IC0xO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9IGVsc2UgaWYgKGRzdFZhbHVlID4gbWFya2VyKSB7XG4gICAgICAgICAgLy8gV2UgbmVlZCB0byBzYXZlIHRoaXMgYXMgd2Ugd2FudCB0aGUgbWFya2VycyB0byBiZSBpbnNlcnRlZCBpbiBzcGVjaWZpYyBvcmRlci5cbiAgICAgICAgICBtYXJrZXJJbnNlcnRQb3NpdGlvbiA9IGkgLSAxO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gc2VhcmNoIHVudGlsIHlvdSBmaW5kIHBsYWNlIG9mIGluc2VydGlvblxuICB3aGlsZSAoaSA8IGRzdC5sZW5ndGgpIHtcbiAgICBjb25zdCBpdGVtID0gZHN0W2ldO1xuICAgIGlmICh0eXBlb2YgaXRlbSA9PT0gJ251bWJlcicpIHtcbiAgICAgIC8vIHNpbmNlIGBpYCBzdGFydGVkIGFzIHRoZSBpbmRleCBhZnRlciB0aGUgbWFya2VyLCB3ZSBkaWQgbm90IGZpbmQgaXQgaWYgd2UgYXJlIGF0IHRoZSBuZXh0XG4gICAgICAvLyBtYXJrZXJcbiAgICAgIGJyZWFrO1xuICAgIH0gZWxzZSBpZiAoaXRlbSA9PT0ga2V5MSkge1xuICAgICAgLy8gV2UgYWxyZWFkeSBoYXZlIHNhbWUgdG9rZW5cbiAgICAgIGlmIChrZXkyID09PSBudWxsKSB7XG4gICAgICAgIGlmICh2YWx1ZSAhPT0gbnVsbCkge1xuICAgICAgICAgIGRzdFtpICsgMV0gPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgICB9IGVsc2UgaWYgKGtleTIgPT09IGRzdFtpICsgMV0pIHtcbiAgICAgICAgZHN0W2kgKyAyXSA9IHZhbHVlITtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBJbmNyZW1lbnQgY291bnRlci5cbiAgICBpKys7XG4gICAgaWYgKGtleTIgIT09IG51bGwpIGkrKztcbiAgICBpZiAodmFsdWUgIT09IG51bGwpIGkrKztcbiAgfVxuXG4gIC8vIGluc2VydCBhdCBsb2NhdGlvbi5cbiAgaWYgKG1hcmtlckluc2VydFBvc2l0aW9uICE9PSAtMSkge1xuICAgIGRzdC5zcGxpY2UobWFya2VySW5zZXJ0UG9zaXRpb24sIDAsIG1hcmtlcik7XG4gICAgaSA9IG1hcmtlckluc2VydFBvc2l0aW9uICsgMTtcbiAgfVxuICBkc3Quc3BsaWNlKGkrKywgMCwga2V5MSk7XG4gIGlmIChrZXkyICE9PSBudWxsKSB7XG4gICAgZHN0LnNwbGljZShpKyssIDAsIGtleTIpO1xuICB9XG4gIGlmICh2YWx1ZSAhPT0gbnVsbCkge1xuICAgIGRzdC5zcGxpY2UoaSsrLCAwLCB2YWx1ZSk7XG4gIH1cbn1cbiJdfQ==