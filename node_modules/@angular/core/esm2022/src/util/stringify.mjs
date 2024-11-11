/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export function stringify(token) {
    if (typeof token === 'string') {
        return token;
    }
    if (Array.isArray(token)) {
        return '[' + token.map(stringify).join(', ') + ']';
    }
    if (token == null) {
        return '' + token;
    }
    if (token.overriddenName) {
        return `${token.overriddenName}`;
    }
    if (token.name) {
        return `${token.name}`;
    }
    const res = token.toString();
    if (res == null) {
        return '' + res;
    }
    const newLineIndex = res.indexOf('\n');
    return newLineIndex === -1 ? res : res.substring(0, newLineIndex);
}
/**
 * Concatenates two strings with separator, allocating new strings only when necessary.
 *
 * @param before before string.
 * @param separator separator string.
 * @param after after string.
 * @returns concatenated string.
 */
export function concatStringsWithSpace(before, after) {
    return before == null || before === ''
        ? after === null
            ? ''
            : after
        : after == null || after === ''
            ? before
            : before + ' ' + after;
}
/**
 * Ellipses the string in the middle when longer than the max length
 *
 * @param string
 * @param maxLength of the output string
 * @returns ellipsed string with ... in the middle
 */
export function truncateMiddle(str, maxLength = 100) {
    if (!str || maxLength < 1 || str.length <= maxLength)
        return str;
    if (maxLength == 1)
        return str.substring(0, 1) + '...';
    const halfLimit = Math.round(maxLength / 2);
    return str.substring(0, halfLimit) + '...' + str.substring(str.length - halfLimit);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyaW5naWZ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvdXRpbC9zdHJpbmdpZnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsTUFBTSxVQUFVLFNBQVMsQ0FBQyxLQUFVO0lBQ2xDLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxFQUFFLENBQUM7UUFDOUIsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBRUQsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7UUFDekIsT0FBTyxHQUFHLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDO0lBQ3JELENBQUM7SUFFRCxJQUFJLEtBQUssSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUNsQixPQUFPLEVBQUUsR0FBRyxLQUFLLENBQUM7SUFDcEIsQ0FBQztJQUVELElBQUksS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ3pCLE9BQU8sR0FBRyxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7SUFDbkMsQ0FBQztJQUVELElBQUksS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2YsT0FBTyxHQUFHLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUN6QixDQUFDO0lBRUQsTUFBTSxHQUFHLEdBQUcsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBRTdCLElBQUksR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO1FBQ2hCLE9BQU8sRUFBRSxHQUFHLEdBQUcsQ0FBQztJQUNsQixDQUFDO0lBRUQsTUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN2QyxPQUFPLFlBQVksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxZQUFZLENBQUMsQ0FBQztBQUNwRSxDQUFDO0FBRUQ7Ozs7Ozs7R0FPRztBQUNILE1BQU0sVUFBVSxzQkFBc0IsQ0FBQyxNQUFxQixFQUFFLEtBQW9CO0lBQ2hGLE9BQU8sTUFBTSxJQUFJLElBQUksSUFBSSxNQUFNLEtBQUssRUFBRTtRQUNwQyxDQUFDLENBQUMsS0FBSyxLQUFLLElBQUk7WUFDZCxDQUFDLENBQUMsRUFBRTtZQUNKLENBQUMsQ0FBQyxLQUFLO1FBQ1QsQ0FBQyxDQUFDLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxLQUFLLEVBQUU7WUFDN0IsQ0FBQyxDQUFDLE1BQU07WUFDUixDQUFDLENBQUMsTUFBTSxHQUFHLEdBQUcsR0FBRyxLQUFLLENBQUM7QUFDN0IsQ0FBQztBQUVEOzs7Ozs7R0FNRztBQUNILE1BQU0sVUFBVSxjQUFjLENBQUMsR0FBVyxFQUFFLFNBQVMsR0FBRyxHQUFHO0lBQ3pELElBQUksQ0FBQyxHQUFHLElBQUksU0FBUyxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsTUFBTSxJQUFJLFNBQVM7UUFBRSxPQUFPLEdBQUcsQ0FBQztJQUNqRSxJQUFJLFNBQVMsSUFBSSxDQUFDO1FBQUUsT0FBTyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUM7SUFFdkQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDNUMsT0FBTyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsR0FBRyxLQUFLLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQyxDQUFDO0FBQ3JGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBzdHJpbmdpZnkodG9rZW46IGFueSk6IHN0cmluZyB7XG4gIGlmICh0eXBlb2YgdG9rZW4gPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHRva2VuO1xuICB9XG5cbiAgaWYgKEFycmF5LmlzQXJyYXkodG9rZW4pKSB7XG4gICAgcmV0dXJuICdbJyArIHRva2VuLm1hcChzdHJpbmdpZnkpLmpvaW4oJywgJykgKyAnXSc7XG4gIH1cblxuICBpZiAodG9rZW4gPT0gbnVsbCkge1xuICAgIHJldHVybiAnJyArIHRva2VuO1xuICB9XG5cbiAgaWYgKHRva2VuLm92ZXJyaWRkZW5OYW1lKSB7XG4gICAgcmV0dXJuIGAke3Rva2VuLm92ZXJyaWRkZW5OYW1lfWA7XG4gIH1cblxuICBpZiAodG9rZW4ubmFtZSkge1xuICAgIHJldHVybiBgJHt0b2tlbi5uYW1lfWA7XG4gIH1cblxuICBjb25zdCByZXMgPSB0b2tlbi50b1N0cmluZygpO1xuXG4gIGlmIChyZXMgPT0gbnVsbCkge1xuICAgIHJldHVybiAnJyArIHJlcztcbiAgfVxuXG4gIGNvbnN0IG5ld0xpbmVJbmRleCA9IHJlcy5pbmRleE9mKCdcXG4nKTtcbiAgcmV0dXJuIG5ld0xpbmVJbmRleCA9PT0gLTEgPyByZXMgOiByZXMuc3Vic3RyaW5nKDAsIG5ld0xpbmVJbmRleCk7XG59XG5cbi8qKlxuICogQ29uY2F0ZW5hdGVzIHR3byBzdHJpbmdzIHdpdGggc2VwYXJhdG9yLCBhbGxvY2F0aW5nIG5ldyBzdHJpbmdzIG9ubHkgd2hlbiBuZWNlc3NhcnkuXG4gKlxuICogQHBhcmFtIGJlZm9yZSBiZWZvcmUgc3RyaW5nLlxuICogQHBhcmFtIHNlcGFyYXRvciBzZXBhcmF0b3Igc3RyaW5nLlxuICogQHBhcmFtIGFmdGVyIGFmdGVyIHN0cmluZy5cbiAqIEByZXR1cm5zIGNvbmNhdGVuYXRlZCBzdHJpbmcuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb25jYXRTdHJpbmdzV2l0aFNwYWNlKGJlZm9yZTogc3RyaW5nIHwgbnVsbCwgYWZ0ZXI6IHN0cmluZyB8IG51bGwpOiBzdHJpbmcge1xuICByZXR1cm4gYmVmb3JlID09IG51bGwgfHwgYmVmb3JlID09PSAnJ1xuICAgID8gYWZ0ZXIgPT09IG51bGxcbiAgICAgID8gJydcbiAgICAgIDogYWZ0ZXJcbiAgICA6IGFmdGVyID09IG51bGwgfHwgYWZ0ZXIgPT09ICcnXG4gICAgICA/IGJlZm9yZVxuICAgICAgOiBiZWZvcmUgKyAnICcgKyBhZnRlcjtcbn1cblxuLyoqXG4gKiBFbGxpcHNlcyB0aGUgc3RyaW5nIGluIHRoZSBtaWRkbGUgd2hlbiBsb25nZXIgdGhhbiB0aGUgbWF4IGxlbmd0aFxuICpcbiAqIEBwYXJhbSBzdHJpbmdcbiAqIEBwYXJhbSBtYXhMZW5ndGggb2YgdGhlIG91dHB1dCBzdHJpbmdcbiAqIEByZXR1cm5zIGVsbGlwc2VkIHN0cmluZyB3aXRoIC4uLiBpbiB0aGUgbWlkZGxlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cnVuY2F0ZU1pZGRsZShzdHI6IHN0cmluZywgbWF4TGVuZ3RoID0gMTAwKTogc3RyaW5nIHtcbiAgaWYgKCFzdHIgfHwgbWF4TGVuZ3RoIDwgMSB8fCBzdHIubGVuZ3RoIDw9IG1heExlbmd0aCkgcmV0dXJuIHN0cjtcbiAgaWYgKG1heExlbmd0aCA9PSAxKSByZXR1cm4gc3RyLnN1YnN0cmluZygwLCAxKSArICcuLi4nO1xuXG4gIGNvbnN0IGhhbGZMaW1pdCA9IE1hdGgucm91bmQobWF4TGVuZ3RoIC8gMik7XG4gIHJldHVybiBzdHIuc3Vic3RyaW5nKDAsIGhhbGZMaW1pdCkgKyAnLi4uJyArIHN0ci5zdWJzdHJpbmcoc3RyLmxlbmd0aCAtIGhhbGZMaW1pdCk7XG59XG4iXX0=