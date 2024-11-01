/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * Returns element classes in form of a stable (sorted) string.
 *
 * @param element HTML Element.
 * @returns Returns element classes in form of a stable (sorted) string.
 */
export function getSortedClassName(element) {
    const names = Object.keys(getElementClasses(element));
    names.sort();
    return names.join(' ');
}
/**
 * Returns element classes in form of a map.
 *
 * @param element HTML Element.
 * @returns Map of class values.
 */
export function getElementClasses(element) {
    const classes = {};
    if (element.nodeType === Node.ELEMENT_NODE) {
        const classList = element.classList;
        for (let i = 0; i < classList.length; i++) {
            const key = classList[i];
            classes[key] = true;
        }
    }
    return classes;
}
/**
 * Returns element styles in form of a stable (sorted) string.
 *
 * @param element HTML Element.
 * @returns Returns element styles in form of a stable (sorted) string.
 */
export function getSortedStyle(element) {
    const styles = getElementStyles(element);
    const names = Object.keys(styles);
    names.sort();
    let sorted = '';
    names.forEach((key) => {
        const value = styles[key];
        if (value != null && value !== '') {
            if (sorted !== '')
                sorted += ' ';
            sorted += key + ': ' + value + ';';
        }
    });
    return sorted;
}
/**
 * Returns element styles in form of a map.
 *
 * @param element HTML Element.
 * @returns Map of style values.
 */
export function getElementStyles(element) {
    const styles = {};
    if (element.nodeType === Node.ELEMENT_NODE) {
        const style = element.style;
        // reading `style.color` is a work around for a bug in Domino. The issue is that Domino has
        // stale value for `style.length`. It seems that reading a property from the element causes the
        // stale value to be updated. (As of Domino v 2.1.3)
        style.color;
        for (let i = 0; i < style.length; i++) {
            const key = style.item(i);
            const value = style.getPropertyValue(key);
            if (value !== '') {
                styles[key] = value;
            }
        }
    }
    return styles;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3R5bGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvdGVzdGluZy9zcmMvc3R5bGluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSDs7Ozs7R0FLRztBQUNILE1BQU0sVUFBVSxrQkFBa0IsQ0FBQyxPQUFnQjtJQUNqRCxNQUFNLEtBQUssR0FBYSxNQUFNLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDaEUsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ2IsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3pCLENBQUM7QUFFRDs7Ozs7R0FLRztBQUNILE1BQU0sVUFBVSxpQkFBaUIsQ0FBQyxPQUFnQjtJQUNoRCxNQUFNLE9BQU8sR0FBMEIsRUFBRSxDQUFDO0lBQzFDLElBQUksT0FBTyxDQUFDLFFBQVEsS0FBSyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDM0MsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQztRQUNwQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQzFDLE1BQU0sR0FBRyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN6QixPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQ3RCLENBQUM7SUFDSCxDQUFDO0lBQ0QsT0FBTyxPQUFPLENBQUM7QUFDakIsQ0FBQztBQUVEOzs7OztHQUtHO0FBQ0gsTUFBTSxVQUFVLGNBQWMsQ0FBQyxPQUFnQjtJQUM3QyxNQUFNLE1BQU0sR0FBRyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN6QyxNQUFNLEtBQUssR0FBYSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzVDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNiLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztJQUNoQixLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7UUFDcEIsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzFCLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxLQUFLLEtBQUssRUFBRSxFQUFFLENBQUM7WUFDbEMsSUFBSSxNQUFNLEtBQUssRUFBRTtnQkFBRSxNQUFNLElBQUksR0FBRyxDQUFDO1lBQ2pDLE1BQU0sSUFBSSxHQUFHLEdBQUcsSUFBSSxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUM7UUFDckMsQ0FBQztJQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0gsT0FBTyxNQUFNLENBQUM7QUFDaEIsQ0FBQztBQUVEOzs7OztHQUtHO0FBQ0gsTUFBTSxVQUFVLGdCQUFnQixDQUFDLE9BQWdCO0lBQy9DLE1BQU0sTUFBTSxHQUE0QixFQUFFLENBQUM7SUFDM0MsSUFBSSxPQUFPLENBQUMsUUFBUSxLQUFLLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUMzQyxNQUFNLEtBQUssR0FBSSxPQUF1QixDQUFDLEtBQUssQ0FBQztRQUM3QywyRkFBMkY7UUFDM0YsK0ZBQStGO1FBQy9GLG9EQUFvRDtRQUNwRCxLQUFLLENBQUMsS0FBSyxDQUFDO1FBQ1osS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUN0QyxNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFCLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMxQyxJQUFJLEtBQUssS0FBSyxFQUFFLEVBQUUsQ0FBQztnQkFDakIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQztZQUN0QixDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7SUFDRCxPQUFPLE1BQU0sQ0FBQztBQUNoQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG4vKipcbiAqIFJldHVybnMgZWxlbWVudCBjbGFzc2VzIGluIGZvcm0gb2YgYSBzdGFibGUgKHNvcnRlZCkgc3RyaW5nLlxuICpcbiAqIEBwYXJhbSBlbGVtZW50IEhUTUwgRWxlbWVudC5cbiAqIEByZXR1cm5zIFJldHVybnMgZWxlbWVudCBjbGFzc2VzIGluIGZvcm0gb2YgYSBzdGFibGUgKHNvcnRlZCkgc3RyaW5nLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0U29ydGVkQ2xhc3NOYW1lKGVsZW1lbnQ6IEVsZW1lbnQpOiBzdHJpbmcge1xuICBjb25zdCBuYW1lczogc3RyaW5nW10gPSBPYmplY3Qua2V5cyhnZXRFbGVtZW50Q2xhc3NlcyhlbGVtZW50KSk7XG4gIG5hbWVzLnNvcnQoKTtcbiAgcmV0dXJuIG5hbWVzLmpvaW4oJyAnKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGVsZW1lbnQgY2xhc3NlcyBpbiBmb3JtIG9mIGEgbWFwLlxuICpcbiAqIEBwYXJhbSBlbGVtZW50IEhUTUwgRWxlbWVudC5cbiAqIEByZXR1cm5zIE1hcCBvZiBjbGFzcyB2YWx1ZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRFbGVtZW50Q2xhc3NlcyhlbGVtZW50OiBFbGVtZW50KToge1trZXk6IHN0cmluZ106IHRydWV9IHtcbiAgY29uc3QgY2xhc3Nlczoge1trZXk6IHN0cmluZ106IHRydWV9ID0ge307XG4gIGlmIChlbGVtZW50Lm5vZGVUeXBlID09PSBOb2RlLkVMRU1FTlRfTk9ERSkge1xuICAgIGNvbnN0IGNsYXNzTGlzdCA9IGVsZW1lbnQuY2xhc3NMaXN0O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2xhc3NMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBrZXkgPSBjbGFzc0xpc3RbaV07XG4gICAgICBjbGFzc2VzW2tleV0gPSB0cnVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gY2xhc3Nlcztcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGVsZW1lbnQgc3R5bGVzIGluIGZvcm0gb2YgYSBzdGFibGUgKHNvcnRlZCkgc3RyaW5nLlxuICpcbiAqIEBwYXJhbSBlbGVtZW50IEhUTUwgRWxlbWVudC5cbiAqIEByZXR1cm5zIFJldHVybnMgZWxlbWVudCBzdHlsZXMgaW4gZm9ybSBvZiBhIHN0YWJsZSAoc29ydGVkKSBzdHJpbmcuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRTb3J0ZWRTdHlsZShlbGVtZW50OiBFbGVtZW50KTogc3RyaW5nIHtcbiAgY29uc3Qgc3R5bGVzID0gZ2V0RWxlbWVudFN0eWxlcyhlbGVtZW50KTtcbiAgY29uc3QgbmFtZXM6IHN0cmluZ1tdID0gT2JqZWN0LmtleXMoc3R5bGVzKTtcbiAgbmFtZXMuc29ydCgpO1xuICBsZXQgc29ydGVkID0gJyc7XG4gIG5hbWVzLmZvckVhY2goKGtleSkgPT4ge1xuICAgIGNvbnN0IHZhbHVlID0gc3R5bGVzW2tleV07XG4gICAgaWYgKHZhbHVlICE9IG51bGwgJiYgdmFsdWUgIT09ICcnKSB7XG4gICAgICBpZiAoc29ydGVkICE9PSAnJykgc29ydGVkICs9ICcgJztcbiAgICAgIHNvcnRlZCArPSBrZXkgKyAnOiAnICsgdmFsdWUgKyAnOyc7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIHNvcnRlZDtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGVsZW1lbnQgc3R5bGVzIGluIGZvcm0gb2YgYSBtYXAuXG4gKlxuICogQHBhcmFtIGVsZW1lbnQgSFRNTCBFbGVtZW50LlxuICogQHJldHVybnMgTWFwIG9mIHN0eWxlIHZhbHVlcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEVsZW1lbnRTdHlsZXMoZWxlbWVudDogRWxlbWVudCk6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9IHtcbiAgY29uc3Qgc3R5bGVzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuICBpZiAoZWxlbWVudC5ub2RlVHlwZSA9PT0gTm9kZS5FTEVNRU5UX05PREUpIHtcbiAgICBjb25zdCBzdHlsZSA9IChlbGVtZW50IGFzIEhUTUxFbGVtZW50KS5zdHlsZTtcbiAgICAvLyByZWFkaW5nIGBzdHlsZS5jb2xvcmAgaXMgYSB3b3JrIGFyb3VuZCBmb3IgYSBidWcgaW4gRG9taW5vLiBUaGUgaXNzdWUgaXMgdGhhdCBEb21pbm8gaGFzXG4gICAgLy8gc3RhbGUgdmFsdWUgZm9yIGBzdHlsZS5sZW5ndGhgLiBJdCBzZWVtcyB0aGF0IHJlYWRpbmcgYSBwcm9wZXJ0eSBmcm9tIHRoZSBlbGVtZW50IGNhdXNlcyB0aGVcbiAgICAvLyBzdGFsZSB2YWx1ZSB0byBiZSB1cGRhdGVkLiAoQXMgb2YgRG9taW5vIHYgMi4xLjMpXG4gICAgc3R5bGUuY29sb3I7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdHlsZS5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3Qga2V5ID0gc3R5bGUuaXRlbShpKTtcbiAgICAgIGNvbnN0IHZhbHVlID0gc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZShrZXkpO1xuICAgICAgaWYgKHZhbHVlICE9PSAnJykge1xuICAgICAgICBzdHlsZXNba2V5XSA9IHZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gc3R5bGVzO1xufVxuIl19