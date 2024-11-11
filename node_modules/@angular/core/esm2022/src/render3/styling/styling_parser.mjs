/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { assertEqual, throwError } from '../../util/assert';
// Global state of the parser. (This makes parser non-reentrant, but that is not an issue)
const parserState = {
    textEnd: 0,
    key: 0,
    keyEnd: 0,
    value: 0,
    valueEnd: 0,
};
/**
 * Retrieves the last parsed `key` of style.
 * @param text the text to substring the key from.
 */
export function getLastParsedKey(text) {
    return text.substring(parserState.key, parserState.keyEnd);
}
/**
 * Retrieves the last parsed `value` of style.
 * @param text the text to substring the key from.
 */
export function getLastParsedValue(text) {
    return text.substring(parserState.value, parserState.valueEnd);
}
/**
 * Initializes `className` string for parsing and parses the first token.
 *
 * This function is intended to be used in this format:
 * ```
 * for (let i = parseClassName(text); i >= 0; i = parseClassNameNext(text, i)) {
 *   const key = getLastParsedKey();
 *   ...
 * }
 * ```
 * @param text `className` to parse
 * @returns index where the next invocation of `parseClassNameNext` should resume.
 */
export function parseClassName(text) {
    resetParserState(text);
    return parseClassNameNext(text, consumeWhitespace(text, 0, parserState.textEnd));
}
/**
 * Parses next `className` token.
 *
 * This function is intended to be used in this format:
 * ```
 * for (let i = parseClassName(text); i >= 0; i = parseClassNameNext(text, i)) {
 *   const key = getLastParsedKey();
 *   ...
 * }
 * ```
 *
 * @param text `className` to parse
 * @param index where the parsing should resume.
 * @returns index where the next invocation of `parseClassNameNext` should resume.
 */
export function parseClassNameNext(text, index) {
    const end = parserState.textEnd;
    if (end === index) {
        return -1;
    }
    index = parserState.keyEnd = consumeClassToken(text, (parserState.key = index), end);
    return consumeWhitespace(text, index, end);
}
/**
 * Initializes `cssText` string for parsing and parses the first key/values.
 *
 * This function is intended to be used in this format:
 * ```
 * for (let i = parseStyle(text); i >= 0; i = parseStyleNext(text, i))) {
 *   const key = getLastParsedKey();
 *   const value = getLastParsedValue();
 *   ...
 * }
 * ```
 * @param text `cssText` to parse
 * @returns index where the next invocation of `parseStyleNext` should resume.
 */
export function parseStyle(text) {
    resetParserState(text);
    return parseStyleNext(text, consumeWhitespace(text, 0, parserState.textEnd));
}
/**
 * Parses the next `cssText` key/values.
 *
 * This function is intended to be used in this format:
 * ```
 * for (let i = parseStyle(text); i >= 0; i = parseStyleNext(text, i))) {
 *   const key = getLastParsedKey();
 *   const value = getLastParsedValue();
 *   ...
 * }
 *
 * @param text `cssText` to parse
 * @param index where the parsing should resume.
 * @returns index where the next invocation of `parseStyleNext` should resume.
 */
export function parseStyleNext(text, startIndex) {
    const end = parserState.textEnd;
    let index = (parserState.key = consumeWhitespace(text, startIndex, end));
    if (end === index) {
        // we reached an end so just quit
        return -1;
    }
    index = parserState.keyEnd = consumeStyleKey(text, index, end);
    index = consumeSeparator(text, index, end, 58 /* CharCode.COLON */);
    index = parserState.value = consumeWhitespace(text, index, end);
    index = parserState.valueEnd = consumeStyleValue(text, index, end);
    return consumeSeparator(text, index, end, 59 /* CharCode.SEMI_COLON */);
}
/**
 * Reset the global state of the styling parser.
 * @param text The styling text to parse.
 */
export function resetParserState(text) {
    parserState.key = 0;
    parserState.keyEnd = 0;
    parserState.value = 0;
    parserState.valueEnd = 0;
    parserState.textEnd = text.length;
}
/**
 * Returns index of next non-whitespace character.
 *
 * @param text Text to scan
 * @param startIndex Starting index of character where the scan should start.
 * @param endIndex Ending index of character where the scan should end.
 * @returns Index of next non-whitespace character (May be the same as `start` if no whitespace at
 *          that location.)
 */
export function consumeWhitespace(text, startIndex, endIndex) {
    while (startIndex < endIndex && text.charCodeAt(startIndex) <= 32 /* CharCode.SPACE */) {
        startIndex++;
    }
    return startIndex;
}
/**
 * Returns index of last char in class token.
 *
 * @param text Text to scan
 * @param startIndex Starting index of character where the scan should start.
 * @param endIndex Ending index of character where the scan should end.
 * @returns Index after last char in class token.
 */
export function consumeClassToken(text, startIndex, endIndex) {
    while (startIndex < endIndex && text.charCodeAt(startIndex) > 32 /* CharCode.SPACE */) {
        startIndex++;
    }
    return startIndex;
}
/**
 * Consumes all of the characters belonging to style key and token.
 *
 * @param text Text to scan
 * @param startIndex Starting index of character where the scan should start.
 * @param endIndex Ending index of character where the scan should end.
 * @returns Index after last style key character.
 */
export function consumeStyleKey(text, startIndex, endIndex) {
    let ch;
    while (startIndex < endIndex &&
        ((ch = text.charCodeAt(startIndex)) === 45 /* CharCode.DASH */ ||
            ch === 95 /* CharCode.UNDERSCORE */ ||
            ((ch & -33 /* CharCode.UPPER_CASE */) >= 65 /* CharCode.A */ && (ch & -33 /* CharCode.UPPER_CASE */) <= 90 /* CharCode.Z */) ||
            (ch >= 48 /* CharCode.ZERO */ && ch <= 57 /* CharCode.NINE */))) {
        startIndex++;
    }
    return startIndex;
}
/**
 * Consumes all whitespace and the separator `:` after the style key.
 *
 * @param text Text to scan
 * @param startIndex Starting index of character where the scan should start.
 * @param endIndex Ending index of character where the scan should end.
 * @returns Index after separator and surrounding whitespace.
 */
export function consumeSeparator(text, startIndex, endIndex, separator) {
    startIndex = consumeWhitespace(text, startIndex, endIndex);
    if (startIndex < endIndex) {
        if (ngDevMode && text.charCodeAt(startIndex) !== separator) {
            malformedStyleError(text, String.fromCharCode(separator), startIndex);
        }
        startIndex++;
    }
    return startIndex;
}
/**
 * Consumes style value honoring `url()` and `""` text.
 *
 * @param text Text to scan
 * @param startIndex Starting index of character where the scan should start.
 * @param endIndex Ending index of character where the scan should end.
 * @returns Index after last style value character.
 */
export function consumeStyleValue(text, startIndex, endIndex) {
    let ch1 = -1; // 1st previous character
    let ch2 = -1; // 2nd previous character
    let ch3 = -1; // 3rd previous character
    let i = startIndex;
    let lastChIndex = i;
    while (i < endIndex) {
        const ch = text.charCodeAt(i++);
        if (ch === 59 /* CharCode.SEMI_COLON */) {
            return lastChIndex;
        }
        else if (ch === 34 /* CharCode.DOUBLE_QUOTE */ || ch === 39 /* CharCode.SINGLE_QUOTE */) {
            lastChIndex = i = consumeQuotedText(text, ch, i, endIndex);
        }
        else if (startIndex === i - 4 && // We have seen only 4 characters so far "URL(" (Ignore "foo_URL()")
            ch3 === 85 /* CharCode.U */ &&
            ch2 === 82 /* CharCode.R */ &&
            ch1 === 76 /* CharCode.L */ &&
            ch === 40 /* CharCode.OPEN_PAREN */) {
            lastChIndex = i = consumeQuotedText(text, 41 /* CharCode.CLOSE_PAREN */, i, endIndex);
        }
        else if (ch > 32 /* CharCode.SPACE */) {
            // if we have a non-whitespace character then capture its location
            lastChIndex = i;
        }
        ch3 = ch2;
        ch2 = ch1;
        ch1 = ch & -33 /* CharCode.UPPER_CASE */;
    }
    return lastChIndex;
}
/**
 * Consumes all of the quoted characters.
 *
 * @param text Text to scan
 * @param quoteCharCode CharCode of either `"` or `'` quote or `)` for `url(...)`.
 * @param startIndex Starting index of character where the scan should start.
 * @param endIndex Ending index of character where the scan should end.
 * @returns Index after quoted characters.
 */
export function consumeQuotedText(text, quoteCharCode, startIndex, endIndex) {
    let ch1 = -1; // 1st previous character
    let index = startIndex;
    while (index < endIndex) {
        const ch = text.charCodeAt(index++);
        if (ch == quoteCharCode && ch1 !== 92 /* CharCode.BACK_SLASH */) {
            return index;
        }
        if (ch == 92 /* CharCode.BACK_SLASH */ && ch1 === 92 /* CharCode.BACK_SLASH */) {
            // two back slashes cancel each other out. For example `"\\"` should properly end the
            // quotation. (It should not assume that the last `"` is escaped.)
            ch1 = 0;
        }
        else {
            ch1 = ch;
        }
    }
    throw ngDevMode
        ? malformedStyleError(text, String.fromCharCode(quoteCharCode), endIndex)
        : new Error();
}
function malformedStyleError(text, expecting, index) {
    ngDevMode && assertEqual(typeof text === 'string', true, 'String expected here');
    throw throwError(`Malformed style at location ${index} in string '` +
        text.substring(0, index) +
        '[>>' +
        text.substring(index, index + 1) +
        '<<]' +
        text.slice(index + 1) +
        `'. Expecting '${expecting}'.`);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3R5bGluZ19wYXJzZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9yZW5kZXIzL3N0eWxpbmcvc3R5bGluZ19wYXJzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFdBQVcsRUFBRSxVQUFVLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQWtDMUQsMEZBQTBGO0FBQzFGLE1BQU0sV0FBVyxHQUFnQjtJQUMvQixPQUFPLEVBQUUsQ0FBQztJQUNWLEdBQUcsRUFBRSxDQUFDO0lBQ04sTUFBTSxFQUFFLENBQUM7SUFDVCxLQUFLLEVBQUUsQ0FBQztJQUNSLFFBQVEsRUFBRSxDQUFDO0NBQ1osQ0FBQztBQUVGOzs7R0FHRztBQUNILE1BQU0sVUFBVSxnQkFBZ0IsQ0FBQyxJQUFZO0lBQzNDLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM3RCxDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsTUFBTSxVQUFVLGtCQUFrQixDQUFDLElBQVk7SUFDN0MsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ2pFLENBQUM7QUFFRDs7Ozs7Ozs7Ozs7O0dBWUc7QUFDSCxNQUFNLFVBQVUsY0FBYyxDQUFDLElBQVk7SUFDekMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdkIsT0FBTyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsaUJBQWlCLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztBQUNuRixDQUFDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7O0dBY0c7QUFDSCxNQUFNLFVBQVUsa0JBQWtCLENBQUMsSUFBWSxFQUFFLEtBQWE7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TCxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBQ2hDLEtBQUs7UUFDTCxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7UUFDckIsaUJBQWlCLFNBQVMsSUFBSSxDQUNqQyxDQUFDO0FBQ0osQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHthc3NlcnRFcXVhbCwgdGhyb3dFcnJvcn0gZnJvbSAnLi4vLi4vdXRpbC9hc3NlcnQnO1xuaW1wb3J0IHtDaGFyQ29kZX0gZnJvbSAnLi4vLi4vdXRpbC9jaGFyX2NvZGUnO1xuXG4vKipcbiAqIFN0b3JlcyB0aGUgbG9jYXRpb25zIG9mIGtleS92YWx1ZSBpbmRleGVzIHdoaWxlIHBhcnNpbmcgc3R5bGluZy5cbiAqXG4gKiBJbiBjYXNlIG9mIGBjc3NUZXh0YCBwYXJzaW5nIHRoZSBpbmRleGVzIGFyZSBsaWtlIHNvOlxuICogYGBgXG4gKiAgIFwia2V5MTogdmFsdWUxOyBrZXkyOiB2YWx1ZTI7IGtleTM6IHZhbHVlM1wiXG4gKiAgICAgICAgICAgICAgICAgIF4gICBeIF4gICAgIF4gICAgICAgICAgICAgXlxuICogICAgICAgICAgICAgICAgICB8ICAgfCB8ICAgICB8ICAgICAgICAgICAgICstLSB0ZXh0RW5kXG4gKiAgICAgICAgICAgICAgICAgIHwgICB8IHwgICAgICstLS0tLS0tLS0tLS0tLS0tIHZhbHVlRW5kXG4gKiAgICAgICAgICAgICAgICAgIHwgICB8ICstLS0tLS0tLS0tLS0tLS0tLS0tLS0tIHZhbHVlXG4gKiAgICAgICAgICAgICAgICAgIHwgICArLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIGtleUVuZFxuICogICAgICAgICAgICAgICAgICArLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBrZXlcbiAqIGBgYFxuICpcbiAqIEluIGNhc2Ugb2YgYGNsYXNzTmFtZWAgcGFyc2luZyB0aGUgaW5kZXhlcyBhcmUgbGlrZSBzbzpcbiAqIGBgYFxuICogICBcImtleTEga2V5MiBrZXkzXCJcbiAqICAgICAgICAgXiAgIF4gICAgXlxuICogICAgICAgICB8ICAgfCAgICArLS0gdGV4dEVuZFxuICogICAgICAgICB8ICAgKy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBrZXlFbmRcbiAqICAgICAgICAgKy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0ga2V5XG4gKiBgYGBcbiAqIE5PVEU6IGB2YWx1ZWAgYW5kIGB2YWx1ZUVuZGAgYXJlIHVzZWQgb25seSBmb3Igc3R5bGVzLCBub3QgY2xhc3Nlcy5cbiAqL1xuaW50ZXJmYWNlIFBhcnNlclN0YXRlIHtcbiAgdGV4dEVuZDogbnVtYmVyO1xuICBrZXk6IG51bWJlcjtcbiAga2V5RW5kOiBudW1iZXI7XG4gIHZhbHVlOiBudW1iZXI7XG4gIHZhbHVlRW5kOiBudW1iZXI7XG59XG4vLyBHbG9iYWwgc3RhdGUgb2YgdGhlIHBhcnNlci4gKFRoaXMgbWFrZXMgcGFyc2VyIG5vbi1yZWVudHJhbnQsIGJ1dCB0aGF0IGlzIG5vdCBhbiBpc3N1ZSlcbmNvbnN0IHBhcnNlclN0YXRlOiBQYXJzZXJTdGF0ZSA9IHtcbiAgdGV4dEVuZDogMCxcbiAga2V5OiAwLFxuICBrZXlFbmQ6IDAsXG4gIHZhbHVlOiAwLFxuICB2YWx1ZUVuZDogMCxcbn07XG5cbi8qKlxuICogUmV0cmlldmVzIHRoZSBsYXN0IHBhcnNlZCBga2V5YCBvZiBzdHlsZS5cbiAqIEBwYXJhbSB0ZXh0IHRoZSB0ZXh0IHRvIHN1YnN0cmluZyB0aGUga2V5IGZyb20uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMYXN0UGFyc2VkS2V5KHRleHQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiB0ZXh0LnN1YnN0cmluZyhwYXJzZXJTdGF0ZS5rZXksIHBhcnNlclN0YXRlLmtleUVuZCk7XG59XG5cbi8qKlxuICogUmV0cmlldmVzIHRoZSBsYXN0IHBhcnNlZCBgdmFsdWVgIG9mIHN0eWxlLlxuICogQHBhcmFtIHRleHQgdGhlIHRleHQgdG8gc3Vic3RyaW5nIHRoZSBrZXkgZnJvbS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExhc3RQYXJzZWRWYWx1ZSh0ZXh0OiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gdGV4dC5zdWJzdHJpbmcocGFyc2VyU3RhdGUudmFsdWUsIHBhcnNlclN0YXRlLnZhbHVlRW5kKTtcbn1cblxuLyoqXG4gKiBJbml0aWFsaXplcyBgY2xhc3NOYW1lYCBzdHJpbmcgZm9yIHBhcnNpbmcgYW5kIHBhcnNlcyB0aGUgZmlyc3QgdG9rZW4uXG4gKlxuICogVGhpcyBmdW5jdGlvbiBpcyBpbnRlbmRlZCB0byBiZSB1c2VkIGluIHRoaXMgZm9ybWF0OlxuICogYGBgXG4gKiBmb3IgKGxldCBpID0gcGFyc2VDbGFzc05hbWUodGV4dCk7IGkgPj0gMDsgaSA9IHBhcnNlQ2xhc3NOYW1lTmV4dCh0ZXh0LCBpKSkge1xuICogICBjb25zdCBrZXkgPSBnZXRMYXN0UGFyc2VkS2V5KCk7XG4gKiAgIC4uLlxuICogfVxuICogYGBgXG4gKiBAcGFyYW0gdGV4dCBgY2xhc3NOYW1lYCB0byBwYXJzZVxuICogQHJldHVybnMgaW5kZXggd2hlcmUgdGhlIG5leHQgaW52b2NhdGlvbiBvZiBgcGFyc2VDbGFzc05hbWVOZXh0YCBzaG91bGQgcmVzdW1lLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VDbGFzc05hbWUodGV4dDogc3RyaW5nKTogbnVtYmVyIHtcbiAgcmVzZXRQYXJzZXJTdGF0ZSh0ZXh0KTtcbiAgcmV0dXJuIHBhcnNlQ2xhc3NOYW1lTmV4dCh0ZXh0LCBjb25zdW1lV2hpdGVzcGFjZSh0ZXh0LCAwLCBwYXJzZXJTdGF0ZS50ZXh0RW5kKSk7XG59XG5cbi8qKlxuICogUGFyc2VzIG5leHQgYGNsYXNzTmFtZWAgdG9rZW4uXG4gKlxuICogVGhpcyBmdW5jdGlvbiBpcyBpbnRlbmRlZCB0byBiZSB1c2VkIGluIHRoaXMgZm9ybWF0OlxuICogYGBgXG4gKiBmb3IgKGxldCBpID0gcGFyc2VDbGFzc05hbWUodGV4dCk7IGkgPj0gMDsgaSA9IHBhcnNlQ2xhc3NOYW1lTmV4dCh0ZXh0LCBpKSkge1xuICogICBjb25zdCBrZXkgPSBnZXRMYXN0UGFyc2VkS2V5KCk7XG4gKiAgIC4uLlxuICogfVxuICogYGBgXG4gKlxuICogQHBhcmFtIHRleHQgYGNsYXNzTmFtZWAgdG8gcGFyc2VcbiAqIEBwYXJhbSBpbmRleCB3aGVyZSB0aGUgcGFyc2luZyBzaG91bGQgcmVzdW1lLlxuICogQHJldHVybnMgaW5kZXggd2hlcmUgdGhlIG5leHQgaW52b2NhdGlvbiBvZiBgcGFyc2VDbGFzc05hbWVOZXh0YCBzaG91bGQgcmVzdW1lLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VDbGFzc05hbWVOZXh0KHRleHQ6IHN0cmluZywgaW5kZXg6IG51bWJlcik6IG51bWJlciB7XG4gIGNvbnN0IGVuZCA9IHBhcnNlclN0YXRlLnRleHRFbmQ7XG4gIGlmIChlbmQgPT09IGluZGV4KSB7XG4gICAgcmV0dXJuIC0xO1xuICB9XG4gIGluZGV4ID0gcGFyc2VyU3RhdGUua2V5RW5kID0gY29uc3VtZUNsYXNzVG9rZW4odGV4dCwgKHBhcnNlclN0YXRlLmtleSA9IGluZGV4KSwgZW5kKTtcbiAgcmV0dXJuIGNvbnN1bWVXaGl0ZXNwYWNlKHRleHQsIGluZGV4LCBlbmQpO1xufVxuXG4vKipcbiAqIEluaXRpYWxpemVzIGBjc3NUZXh0YCBzdHJpbmcgZm9yIHBhcnNpbmcgYW5kIHBhcnNlcyB0aGUgZmlyc3Qga2V5L3ZhbHVlcy5cbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIGlzIGludGVuZGVkIHRvIGJlIHVzZWQgaW4gdGhpcyBmb3JtYXQ6XG4gKiBgYGBcbiAqIGZvciAobGV0IGkgPSBwYXJzZVN0eWxlKHRleHQpOyBpID49IDA7IGkgPSBwYXJzZVN0eWxlTmV4dCh0ZXh0LCBpKSkpIHtcbiAqICAgY29uc3Qga2V5ID0gZ2V0TGFzdFBhcnNlZEtleSgpO1xuICogICBjb25zdCB2YWx1ZSA9IGdldExhc3RQYXJzZWRWYWx1ZSgpO1xuICogICAuLi5cbiAqIH1cbiAqIGBgYFxuICogQHBhcmFtIHRleHQgYGNzc1RleHRgIHRvIHBhcnNlXG4gKiBAcmV0dXJucyBpbmRleCB3aGVyZSB0aGUgbmV4dCBpbnZvY2F0aW9uIG9mIGBwYXJzZVN0eWxlTmV4dGAgc2hvdWxkIHJlc3VtZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlU3R5bGUodGV4dDogc3RyaW5nKTogbnVtYmVyIHtcbiAgcmVzZXRQYXJzZXJTdGF0ZSh0ZXh0KTtcbiAgcmV0dXJuIHBhcnNlU3R5bGVOZXh0KHRleHQsIGNvbnN1bWVXaGl0ZXNwYWNlKHRleHQsIDAsIHBhcnNlclN0YXRlLnRleHRFbmQpKTtcbn1cblxuLyoqXG4gKiBQYXJzZXMgdGhlIG5leHQgYGNzc1RleHRgIGtleS92YWx1ZXMuXG4gKlxuICogVGhpcyBmdW5jdGlvbiBpcyBpbnRlbmRlZCB0byBiZSB1c2VkIGluIHRoaXMgZm9ybWF0OlxuICogYGBgXG4gKiBmb3IgKGxldCBpID0gcGFyc2VTdHlsZSh0ZXh0KTsgaSA+PSAwOyBpID0gcGFyc2VTdHlsZU5leHQodGV4dCwgaSkpKSB7XG4gKiAgIGNvbnN0IGtleSA9IGdldExhc3RQYXJzZWRLZXkoKTtcbiAqICAgY29uc3QgdmFsdWUgPSBnZXRMYXN0UGFyc2VkVmFsdWUoKTtcbiAqICAgLi4uXG4gKiB9XG4gKlxuICogQHBhcmFtIHRleHQgYGNzc1RleHRgIHRvIHBhcnNlXG4gKiBAcGFyYW0gaW5kZXggd2hlcmUgdGhlIHBhcnNpbmcgc2hvdWxkIHJlc3VtZS5cbiAqIEByZXR1cm5zIGluZGV4IHdoZXJlIHRoZSBuZXh0IGludm9jYXRpb24gb2YgYHBhcnNlU3R5bGVOZXh0YCBzaG91bGQgcmVzdW1lLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VTdHlsZU5leHQodGV4dDogc3RyaW5nLCBzdGFydEluZGV4OiBudW1iZXIpOiBudW1iZXIge1xuICBjb25zdCBlbmQgPSBwYXJzZXJTdGF0ZS50ZXh0RW5kO1xuICBsZXQgaW5kZXggPSAocGFyc2VyU3RhdGUua2V5ID0gY29uc3VtZVdoaXRlc3BhY2UodGV4dCwgc3RhcnRJbmRleCwgZW5kKSk7XG4gIGlmIChlbmQgPT09IGluZGV4KSB7XG4gICAgLy8gd2UgcmVhY2hlZCBhbiBlbmQgc28ganVzdCBxdWl0XG4gICAgcmV0dXJuIC0xO1xuICB9XG4gIGluZGV4ID0gcGFyc2VyU3RhdGUua2V5RW5kID0gY29uc3VtZVN0eWxlS2V5KHRleHQsIGluZGV4LCBlbmQpO1xuICBpbmRleCA9IGNvbnN1bWVTZXBhcmF0b3IodGV4dCwgaW5kZXgsIGVuZCwgQ2hhckNvZGUuQ09MT04pO1xuICBpbmRleCA9IHBhcnNlclN0YXRlLnZhbHVlID0gY29uc3VtZVdoaXRlc3BhY2UodGV4dCwgaW5kZXgsIGVuZCk7XG4gIGluZGV4ID0gcGFyc2VyU3RhdGUudmFsdWVFbmQgPSBjb25zdW1lU3R5bGVWYWx1ZSh0ZXh0LCBpbmRleCwgZW5kKTtcbiAgcmV0dXJuIGNvbnN1bWVTZXBhcmF0b3IodGV4dCwgaW5kZXgsIGVuZCwgQ2hhckNvZGUuU0VNSV9DT0xPTik7XG59XG5cbi8qKlxuICogUmVzZXQgdGhlIGdsb2JhbCBzdGF0ZSBvZiB0aGUgc3R5bGluZyBwYXJzZXIuXG4gKiBAcGFyYW0gdGV4dCBUaGUgc3R5bGluZyB0ZXh0IHRvIHBhcnNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzZXRQYXJzZXJTdGF0ZSh0ZXh0OiBzdHJpbmcpOiB2b2lkIHtcbiAgcGFyc2VyU3RhdGUua2V5ID0gMDtcbiAgcGFyc2VyU3RhdGUua2V5RW5kID0gMDtcbiAgcGFyc2VyU3RhdGUudmFsdWUgPSAwO1xuICBwYXJzZXJTdGF0ZS52YWx1ZUVuZCA9IDA7XG4gIHBhcnNlclN0YXRlLnRleHRFbmQgPSB0ZXh0Lmxlbmd0aDtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGluZGV4IG9mIG5leHQgbm9uLXdoaXRlc3BhY2UgY2hhcmFjdGVyLlxuICpcbiAqIEBwYXJhbSB0ZXh0IFRleHQgdG8gc2NhblxuICogQHBhcmFtIHN0YXJ0SW5kZXggU3RhcnRpbmcgaW5kZXggb2YgY2hhcmFjdGVyIHdoZXJlIHRoZSBzY2FuIHNob3VsZCBzdGFydC5cbiAqIEBwYXJhbSBlbmRJbmRleCBFbmRpbmcgaW5kZXggb2YgY2hhcmFjdGVyIHdoZXJlIHRoZSBzY2FuIHNob3VsZCBlbmQuXG4gKiBAcmV0dXJucyBJbmRleCBvZiBuZXh0IG5vbi13aGl0ZXNwYWNlIGNoYXJhY3RlciAoTWF5IGJlIHRoZSBzYW1lIGFzIGBzdGFydGAgaWYgbm8gd2hpdGVzcGFjZSBhdFxuICogICAgICAgICAgdGhhdCBsb2NhdGlvbi4pXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb25zdW1lV2hpdGVzcGFjZSh0ZXh0OiBzdHJpbmcsIHN0YXJ0SW5kZXg6IG51bWJlciwgZW5kSW5kZXg6IG51bWJlcik6IG51bWJlciB7XG4gIHdoaWxlIChzdGFydEluZGV4IDwgZW5kSW5kZXggJiYgdGV4dC5jaGFyQ29kZUF0KHN0YXJ0SW5kZXgpIDw9IENoYXJDb2RlLlNQQUNFKSB7XG4gICAgc3RhcnRJbmRleCsrO1xuICB9XG4gIHJldHVybiBzdGFydEluZGV4O1xufVxuXG4vKipcbiAqIFJldHVybnMgaW5kZXggb2YgbGFzdCBjaGFyIGluIGNsYXNzIHRva2VuLlxuICpcbiAqIEBwYXJhbSB0ZXh0IFRleHQgdG8gc2NhblxuICogQHBhcmFtIHN0YXJ0SW5kZXggU3RhcnRpbmcgaW5kZXggb2YgY2hhcmFjdGVyIHdoZXJlIHRoZSBzY2FuIHNob3VsZCBzdGFydC5cbiAqIEBwYXJhbSBlbmRJbmRleCBFbmRpbmcgaW5kZXggb2YgY2hhcmFjdGVyIHdoZXJlIHRoZSBzY2FuIHNob3VsZCBlbmQuXG4gKiBAcmV0dXJucyBJbmRleCBhZnRlciBsYXN0IGNoYXIgaW4gY2xhc3MgdG9rZW4uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb25zdW1lQ2xhc3NUb2tlbih0ZXh0OiBzdHJpbmcsIHN0YXJ0SW5kZXg6IG51bWJlciwgZW5kSW5kZXg6IG51bWJlcik6IG51bWJlciB7XG4gIHdoaWxlIChzdGFydEluZGV4IDwgZW5kSW5kZXggJiYgdGV4dC5jaGFyQ29kZUF0KHN0YXJ0SW5kZXgpID4gQ2hhckNvZGUuU1BBQ0UpIHtcbiAgICBzdGFydEluZGV4Kys7XG4gIH1cbiAgcmV0dXJuIHN0YXJ0SW5kZXg7XG59XG5cbi8qKlxuICogQ29uc3VtZXMgYWxsIG9mIHRoZSBjaGFyYWN0ZXJzIGJlbG9uZ2luZyB0byBzdHlsZSBrZXkgYW5kIHRva2VuLlxuICpcbiAqIEBwYXJhbSB0ZXh0IFRleHQgdG8gc2NhblxuICogQHBhcmFtIHN0YXJ0SW5kZXggU3RhcnRpbmcgaW5kZXggb2YgY2hhcmFjdGVyIHdoZXJlIHRoZSBzY2FuIHNob3VsZCBzdGFydC5cbiAqIEBwYXJhbSBlbmRJbmRleCBFbmRpbmcgaW5kZXggb2YgY2hhcmFjdGVyIHdoZXJlIHRoZSBzY2FuIHNob3VsZCBlbmQuXG4gKiBAcmV0dXJucyBJbmRleCBhZnRlciBsYXN0IHN0eWxlIGtleSBjaGFyYWN0ZXIuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb25zdW1lU3R5bGVLZXkodGV4dDogc3RyaW5nLCBzdGFydEluZGV4OiBudW1iZXIsIGVuZEluZGV4OiBudW1iZXIpOiBudW1iZXIge1xuICBsZXQgY2g6IG51bWJlcjtcbiAgd2hpbGUgKFxuICAgIHN0YXJ0SW5kZXggPCBlbmRJbmRleCAmJlxuICAgICgoY2ggPSB0ZXh0LmNoYXJDb2RlQXQoc3RhcnRJbmRleCkpID09PSBDaGFyQ29kZS5EQVNIIHx8XG4gICAgICBjaCA9PT0gQ2hhckNvZGUuVU5ERVJTQ09SRSB8fFxuICAgICAgKChjaCAmIENoYXJDb2RlLlVQUEVSX0NBU0UpID49IENoYXJDb2RlLkEgJiYgKGNoICYgQ2hhckNvZGUuVVBQRVJfQ0FTRSkgPD0gQ2hhckNvZGUuWikgfHxcbiAgICAgIChjaCA+PSBDaGFyQ29kZS5aRVJPICYmIGNoIDw9IENoYXJDb2RlLk5JTkUpKVxuICApIHtcbiAgICBzdGFydEluZGV4Kys7XG4gIH1cbiAgcmV0dXJuIHN0YXJ0SW5kZXg7XG59XG5cbi8qKlxuICogQ29uc3VtZXMgYWxsIHdoaXRlc3BhY2UgYW5kIHRoZSBzZXBhcmF0b3IgYDpgIGFmdGVyIHRoZSBzdHlsZSBrZXkuXG4gKlxuICogQHBhcmFtIHRleHQgVGV4dCB0byBzY2FuXG4gKiBAcGFyYW0gc3RhcnRJbmRleCBTdGFydGluZyBpbmRleCBvZiBjaGFyYWN0ZXIgd2hlcmUgdGhlIHNjYW4gc2hvdWxkIHN0YXJ0LlxuICogQHBhcmFtIGVuZEluZGV4IEVuZGluZyBpbmRleCBvZiBjaGFyYWN0ZXIgd2hlcmUgdGhlIHNjYW4gc2hvdWxkIGVuZC5cbiAqIEByZXR1cm5zIEluZGV4IGFmdGVyIHNlcGFyYXRvciBhbmQgc3Vycm91bmRpbmcgd2hpdGVzcGFjZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbnN1bWVTZXBhcmF0b3IoXG4gIHRleHQ6IHN0cmluZyxcbiAgc3RhcnRJbmRleDogbnVtYmVyLFxuICBlbmRJbmRleDogbnVtYmVyLFxuICBzZXBhcmF0b3I6IG51bWJlcixcbik6IG51bWJlciB7XG4gIHN0YXJ0SW5kZXggPSBjb25zdW1lV2hpdGVzcGFjZSh0ZXh0LCBzdGFydEluZGV4LCBlbmRJbmRleCk7XG4gIGlmIChzdGFydEluZGV4IDwgZW5kSW5kZXgpIHtcbiAgICBpZiAobmdEZXZNb2RlICYmIHRleHQuY2hhckNvZGVBdChzdGFydEluZGV4KSAhPT0gc2VwYXJhdG9yKSB7XG4gICAgICBtYWxmb3JtZWRTdHlsZUVycm9yKHRleHQsIFN0cmluZy5mcm9tQ2hhckNvZGUoc2VwYXJhdG9yKSwgc3RhcnRJbmRleCk7XG4gICAgfVxuICAgIHN0YXJ0SW5kZXgrKztcbiAgfVxuICByZXR1cm4gc3RhcnRJbmRleDtcbn1cblxuLyoqXG4gKiBDb25zdW1lcyBzdHlsZSB2YWx1ZSBob25vcmluZyBgdXJsKClgIGFuZCBgXCJcImAgdGV4dC5cbiAqXG4gKiBAcGFyYW0gdGV4dCBUZXh0IHRvIHNjYW5cbiAqIEBwYXJhbSBzdGFydEluZGV4IFN0YXJ0aW5nIGluZGV4IG9mIGNoYXJhY3RlciB3aGVyZSB0aGUgc2NhbiBzaG91bGQgc3RhcnQuXG4gKiBAcGFyYW0gZW5kSW5kZXggRW5kaW5nIGluZGV4IG9mIGNoYXJhY3RlciB3aGVyZSB0aGUgc2NhbiBzaG91bGQgZW5kLlxuICogQHJldHVybnMgSW5kZXggYWZ0ZXIgbGFzdCBzdHlsZSB2YWx1ZSBjaGFyYWN0ZXIuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb25zdW1lU3R5bGVWYWx1ZSh0ZXh0OiBzdHJpbmcsIHN0YXJ0SW5kZXg6IG51bWJlciwgZW5kSW5kZXg6IG51bWJlcik6IG51bWJlciB7XG4gIGxldCBjaDEgPSAtMTsgLy8gMXN0IHByZXZpb3VzIGNoYXJhY3RlclxuICBsZXQgY2gyID0gLTE7IC8vIDJuZCBwcmV2aW91cyBjaGFyYWN0ZXJcbiAgbGV0IGNoMyA9IC0xOyAvLyAzcmQgcHJldmlvdXMgY2hhcmFjdGVyXG4gIGxldCBpID0gc3RhcnRJbmRleDtcbiAgbGV0IGxhc3RDaEluZGV4ID0gaTtcbiAgd2hpbGUgKGkgPCBlbmRJbmRleCkge1xuICAgIGNvbnN0IGNoOiBudW1iZXIgPSB0ZXh0LmNoYXJDb2RlQXQoaSsrKTtcbiAgICBpZiAoY2ggPT09IENoYXJDb2RlLlNFTUlfQ09MT04pIHtcbiAgICAgIHJldHVybiBsYXN0Q2hJbmRleDtcbiAgICB9IGVsc2UgaWYgKGNoID09PSBDaGFyQ29kZS5ET1VCTEVfUVVPVEUgfHwgY2ggPT09IENoYXJDb2RlLlNJTkdMRV9RVU9URSkge1xuICAgICAgbGFzdENoSW5kZXggPSBpID0gY29uc3VtZVF1b3RlZFRleHQodGV4dCwgY2gsIGksIGVuZEluZGV4KTtcbiAgICB9IGVsc2UgaWYgKFxuICAgICAgc3RhcnRJbmRleCA9PT0gaSAtIDQgJiYgLy8gV2UgaGF2ZSBzZWVuIG9ubHkgNCBjaGFyYWN0ZXJzIHNvIGZhciBcIlVSTChcIiAoSWdub3JlIFwiZm9vX1VSTCgpXCIpXG4gICAgICBjaDMgPT09IENoYXJDb2RlLlUgJiZcbiAgICAgIGNoMiA9PT0gQ2hhckNvZGUuUiAmJlxuICAgICAgY2gxID09PSBDaGFyQ29kZS5MICYmXG4gICAgICBjaCA9PT0gQ2hhckNvZGUuT1BFTl9QQVJFTlxuICAgICkge1xuICAgICAgbGFzdENoSW5kZXggPSBpID0gY29uc3VtZVF1b3RlZFRleHQodGV4dCwgQ2hhckNvZGUuQ0xPU0VfUEFSRU4sIGksIGVuZEluZGV4KTtcbiAgICB9IGVsc2UgaWYgKGNoID4gQ2hhckNvZGUuU1BBQ0UpIHtcbiAgICAgIC8vIGlmIHdlIGhhdmUgYSBub24td2hpdGVzcGFjZSBjaGFyYWN0ZXIgdGhlbiBjYXB0dXJlIGl0cyBsb2NhdGlvblxuICAgICAgbGFzdENoSW5kZXggPSBpO1xuICAgIH1cbiAgICBjaDMgPSBjaDI7XG4gICAgY2gyID0gY2gxO1xuICAgIGNoMSA9IGNoICYgQ2hhckNvZGUuVVBQRVJfQ0FTRTtcbiAgfVxuICByZXR1cm4gbGFzdENoSW5kZXg7XG59XG5cbi8qKlxuICogQ29uc3VtZXMgYWxsIG9mIHRoZSBxdW90ZWQgY2hhcmFjdGVycy5cbiAqXG4gKiBAcGFyYW0gdGV4dCBUZXh0IHRvIHNjYW5cbiAqIEBwYXJhbSBxdW90ZUNoYXJDb2RlIENoYXJDb2RlIG9mIGVpdGhlciBgXCJgIG9yIGAnYCBxdW90ZSBvciBgKWAgZm9yIGB1cmwoLi4uKWAuXG4gKiBAcGFyYW0gc3RhcnRJbmRleCBTdGFydGluZyBpbmRleCBvZiBjaGFyYWN0ZXIgd2hlcmUgdGhlIHNjYW4gc2hvdWxkIHN0YXJ0LlxuICogQHBhcmFtIGVuZEluZGV4IEVuZGluZyBpbmRleCBvZiBjaGFyYWN0ZXIgd2hlcmUgdGhlIHNjYW4gc2hvdWxkIGVuZC5cbiAqIEByZXR1cm5zIEluZGV4IGFmdGVyIHF1b3RlZCBjaGFyYWN0ZXJzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY29uc3VtZVF1b3RlZFRleHQoXG4gIHRleHQ6IHN0cmluZyxcbiAgcXVvdGVDaGFyQ29kZTogbnVtYmVyLFxuICBzdGFydEluZGV4OiBudW1iZXIsXG4gIGVuZEluZGV4OiBudW1iZXIsXG4pOiBudW1iZXIge1xuICBsZXQgY2gxID0gLTE7IC8vIDFzdCBwcmV2aW91cyBjaGFyYWN0ZXJcbiAgbGV0IGluZGV4ID0gc3RhcnRJbmRleDtcbiAgd2hpbGUgKGluZGV4IDwgZW5kSW5kZXgpIHtcbiAgICBjb25zdCBjaCA9IHRleHQuY2hhckNvZGVBdChpbmRleCsrKTtcbiAgICBpZiAoY2ggPT0gcXVvdGVDaGFyQ29kZSAmJiBjaDEgIT09IENoYXJDb2RlLkJBQ0tfU0xBU0gpIHtcbiAgICAgIHJldHVybiBpbmRleDtcbiAgICB9XG4gICAgaWYgKGNoID09IENoYXJDb2RlLkJBQ0tfU0xBU0ggJiYgY2gxID09PSBDaGFyQ29kZS5CQUNLX1NMQVNIKSB7XG4gICAgICAvLyB0d28gYmFjayBzbGFzaGVzIGNhbmNlbCBlYWNoIG90aGVyIG91dC4gRm9yIGV4YW1wbGUgYFwiXFxcXFwiYCBzaG91bGQgcHJvcGVybHkgZW5kIHRoZVxuICAgICAgLy8gcXVvdGF0aW9uLiAoSXQgc2hvdWxkIG5vdCBhc3N1bWUgdGhhdCB0aGUgbGFzdCBgXCJgIGlzIGVzY2FwZWQuKVxuICAgICAgY2gxID0gMDtcbiAgICB9IGVsc2Uge1xuICAgICAgY2gxID0gY2g7XG4gICAgfVxuICB9XG4gIHRocm93IG5nRGV2TW9kZVxuICAgID8gbWFsZm9ybWVkU3R5bGVFcnJvcih0ZXh0LCBTdHJpbmcuZnJvbUNoYXJDb2RlKHF1b3RlQ2hhckNvZGUpLCBlbmRJbmRleClcbiAgICA6IG5ldyBFcnJvcigpO1xufVxuXG5mdW5jdGlvbiBtYWxmb3JtZWRTdHlsZUVycm9yKHRleHQ6IHN0cmluZywgZXhwZWN0aW5nOiBzdHJpbmcsIGluZGV4OiBudW1iZXIpOiBuZXZlciB7XG4gIG5nRGV2TW9kZSAmJiBhc3NlcnRFcXVhbCh0eXBlb2YgdGV4dCA9PT0gJ3N0cmluZycsIHRydWUsICdTdHJpbmcgZXhwZWN0ZWQgaGVyZScpO1xuICB0aHJvdyB0aHJvd0Vycm9yKFxuICAgIGBNYWxmb3JtZWQgc3R5bGUgYXQgbG9jYXRpb24gJHtpbmRleH0gaW4gc3RyaW5nICdgICtcbiAgICAgIHRleHQuc3Vic3RyaW5nKDAsIGluZGV4KSArXG4gICAgICAnWz4+JyArXG4gICAgICB0ZXh0LnN1YnN0cmluZyhpbmRleCwgaW5kZXggKyAxKSArXG4gICAgICAnPDxdJyArXG4gICAgICB0ZXh0LnNsaWNlKGluZGV4ICsgMSkgK1xuICAgICAgYCcuIEV4cGVjdGluZyAnJHtleHBlY3Rpbmd9Jy5gLFxuICApO1xufVxuIl19