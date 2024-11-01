/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * Disallowed strings in the comment.
 *
 * see: https://html.spec.whatwg.org/multipage/syntax.html#comments
 */
const COMMENT_DISALLOWED = /^>|^->|<!--|-->|--!>|<!-$/g;
/**
 * Delimiter in the disallowed strings which needs to be wrapped with zero with character.
 */
const COMMENT_DELIMITER = /(<|>)/g;
const COMMENT_DELIMITER_ESCAPED = '\u200B$1\u200B';
/**
 * Escape the content of comment strings so that it can be safely inserted into a comment node.
 *
 * The issue is that HTML does not specify any way to escape comment end text inside the comment.
 * Consider: `<!-- The way you close a comment is with ">", and "->" at the beginning or by "-->" or
 * "--!>" at the end. -->`. Above the `"-->"` is meant to be text not an end to the comment. This
 * can be created programmatically through DOM APIs. (`<!--` are also disallowed.)
 *
 * see: https://html.spec.whatwg.org/multipage/syntax.html#comments
 *
 * ```
 * div.innerHTML = div.innerHTML
 * ```
 *
 * One would expect that the above code would be safe to do, but it turns out that because comment
 * text is not escaped, the comment may contain text which will prematurely close the comment
 * opening up the application for XSS attack. (In SSR we programmatically create comment nodes which
 * may contain such text and expect them to be safe.)
 *
 * This function escapes the comment text by looking for comment delimiters (`<` and `>`) and
 * surrounding them with `_>_` where the `_` is a zero width space `\u200B`. The result is that if a
 * comment contains any of the comment start/end delimiters (such as `<!--`, `-->` or `--!>`) the
 * text it will render normally but it will not cause the HTML parser to close/open the comment.
 *
 * @param value text to make safe for comment node by escaping the comment open/close character
 *     sequence.
 */
export function escapeCommentText(value) {
    return value.replace(COMMENT_DISALLOWED, (text) => text.replace(COMMENT_DELIMITER, COMMENT_DELIMITER_ESCAPED));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvdXRpbC9kb20udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUg7Ozs7R0FJRztBQUNILE1BQU0sa0JBQWtCLEdBQUcsNEJBQTRCLENBQUM7QUFDeEQ7O0dBRUc7QUFDSCxNQUFNLGlCQUFpQixHQUFHLFFBQVEsQ0FBQztBQUNuQyxNQUFNLHlCQUF5QixHQUFHLGdCQUFnQixDQUFDO0FBRW5EOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTBCRztBQUNILE1BQU0sVUFBVSxpQkFBaUIsQ0FBQyxLQUFhO0lBQzdDLE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLENBQ2hELElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLEVBQUUseUJBQXlCLENBQUMsQ0FDM0QsQ0FBQztBQUNKLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbi8qKlxuICogRGlzYWxsb3dlZCBzdHJpbmdzIGluIHRoZSBjb21tZW50LlxuICpcbiAqIHNlZTogaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjY29tbWVudHNcbiAqL1xuY29uc3QgQ09NTUVOVF9ESVNBTExPV0VEID0gL14+fF4tPnw8IS0tfC0tPnwtLSE+fDwhLSQvZztcbi8qKlxuICogRGVsaW1pdGVyIGluIHRoZSBkaXNhbGxvd2VkIHN0cmluZ3Mgd2hpY2ggbmVlZHMgdG8gYmUgd3JhcHBlZCB3aXRoIHplcm8gd2l0aCBjaGFyYWN0ZXIuXG4gKi9cbmNvbnN0IENPTU1FTlRfREVMSU1JVEVSID0gLyg8fD4pL2c7XG5jb25zdCBDT01NRU5UX0RFTElNSVRFUl9FU0NBUEVEID0gJ1xcdTIwMEIkMVxcdTIwMEInO1xuXG4vKipcbiAqIEVzY2FwZSB0aGUgY29udGVudCBvZiBjb21tZW50IHN0cmluZ3Mgc28gdGhhdCBpdCBjYW4gYmUgc2FmZWx5IGluc2VydGVkIGludG8gYSBjb21tZW50IG5vZGUuXG4gKlxuICogVGhlIGlzc3VlIGlzIHRoYXQgSFRNTCBkb2VzIG5vdCBzcGVjaWZ5IGFueSB3YXkgdG8gZXNjYXBlIGNvbW1lbnQgZW5kIHRleHQgaW5zaWRlIHRoZSBjb21tZW50LlxuICogQ29uc2lkZXI6IGA8IS0tIFRoZSB3YXkgeW91IGNsb3NlIGEgY29tbWVudCBpcyB3aXRoIFwiPlwiLCBhbmQgXCItPlwiIGF0IHRoZSBiZWdpbm5pbmcgb3IgYnkgXCItLT5cIiBvclxuICogXCItLSE+XCIgYXQgdGhlIGVuZC4gLS0+YC4gQWJvdmUgdGhlIGBcIi0tPlwiYCBpcyBtZWFudCB0byBiZSB0ZXh0IG5vdCBhbiBlbmQgdG8gdGhlIGNvbW1lbnQuIFRoaXNcbiAqIGNhbiBiZSBjcmVhdGVkIHByb2dyYW1tYXRpY2FsbHkgdGhyb3VnaCBET00gQVBJcy4gKGA8IS0tYCBhcmUgYWxzbyBkaXNhbGxvd2VkLilcbiAqXG4gKiBzZWU6IGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3N5bnRheC5odG1sI2NvbW1lbnRzXG4gKlxuICogYGBgXG4gKiBkaXYuaW5uZXJIVE1MID0gZGl2LmlubmVySFRNTFxuICogYGBgXG4gKlxuICogT25lIHdvdWxkIGV4cGVjdCB0aGF0IHRoZSBhYm92ZSBjb2RlIHdvdWxkIGJlIHNhZmUgdG8gZG8sIGJ1dCBpdCB0dXJucyBvdXQgdGhhdCBiZWNhdXNlIGNvbW1lbnRcbiAqIHRleHQgaXMgbm90IGVzY2FwZWQsIHRoZSBjb21tZW50IG1heSBjb250YWluIHRleHQgd2hpY2ggd2lsbCBwcmVtYXR1cmVseSBjbG9zZSB0aGUgY29tbWVudFxuICogb3BlbmluZyB1cCB0aGUgYXBwbGljYXRpb24gZm9yIFhTUyBhdHRhY2suIChJbiBTU1Igd2UgcHJvZ3JhbW1hdGljYWxseSBjcmVhdGUgY29tbWVudCBub2RlcyB3aGljaFxuICogbWF5IGNvbnRhaW4gc3VjaCB0ZXh0IGFuZCBleHBlY3QgdGhlbSB0byBiZSBzYWZlLilcbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIGVzY2FwZXMgdGhlIGNvbW1lbnQgdGV4dCBieSBsb29raW5nIGZvciBjb21tZW50IGRlbGltaXRlcnMgKGA8YCBhbmQgYD5gKSBhbmRcbiAqIHN1cnJvdW5kaW5nIHRoZW0gd2l0aCBgXz5fYCB3aGVyZSB0aGUgYF9gIGlzIGEgemVybyB3aWR0aCBzcGFjZSBgXFx1MjAwQmAuIFRoZSByZXN1bHQgaXMgdGhhdCBpZiBhXG4gKiBjb21tZW50IGNvbnRhaW5zIGFueSBvZiB0aGUgY29tbWVudCBzdGFydC9lbmQgZGVsaW1pdGVycyAoc3VjaCBhcyBgPCEtLWAsIGAtLT5gIG9yIGAtLSE+YCkgdGhlXG4gKiB0ZXh0IGl0IHdpbGwgcmVuZGVyIG5vcm1hbGx5IGJ1dCBpdCB3aWxsIG5vdCBjYXVzZSB0aGUgSFRNTCBwYXJzZXIgdG8gY2xvc2Uvb3BlbiB0aGUgY29tbWVudC5cbiAqXG4gKiBAcGFyYW0gdmFsdWUgdGV4dCB0byBtYWtlIHNhZmUgZm9yIGNvbW1lbnQgbm9kZSBieSBlc2NhcGluZyB0aGUgY29tbWVudCBvcGVuL2Nsb3NlIGNoYXJhY3RlclxuICogICAgIHNlcXVlbmNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZXNjYXBlQ29tbWVudFRleHQodmFsdWU6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiB2YWx1ZS5yZXBsYWNlKENPTU1FTlRfRElTQUxMT1dFRCwgKHRleHQpID0+XG4gICAgdGV4dC5yZXBsYWNlKENPTU1FTlRfREVMSU1JVEVSLCBDT01NRU5UX0RFTElNSVRFUl9FU0NBUEVEKSxcbiAgKTtcbn1cbiJdfQ==