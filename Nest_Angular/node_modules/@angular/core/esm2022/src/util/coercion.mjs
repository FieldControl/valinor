/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * Transforms a value (typically a string) to a boolean.
 * Intended to be used as a transform function of an input.
 *
 *  @usageNotes
 *  ```typescript
 *  @Input({ transform: booleanAttribute }) status!: boolean;
 *  ```
 * @param value Value to be transformed.
 *
 * @publicApi
 */
export function booleanAttribute(value) {
    return typeof value === 'boolean' ? value : value != null && value !== 'false';
}
/**
 * Transforms a value (typically a string) to a number.
 * Intended to be used as a transform function of an input.
 * @param value Value to be transformed.
 * @param fallbackValue Value to use if the provided value can't be parsed as a number.
 *
 *  @usageNotes
 *  ```typescript
 *  @Input({ transform: numberAttribute }) id!: number;
 *  ```
 *
 * @publicApi
 */
export function numberAttribute(value, fallbackValue = NaN) {
    // parseFloat(value) handles most of the cases we're interested in (it treats null, empty string,
    // and other non-number values as NaN, where Number just uses 0) but it considers the string
    // '123hello' to be a valid number. Therefore we also check if Number(value) is NaN.
    const isNumberValue = !isNaN(parseFloat(value)) && !isNaN(Number(value));
    return isNumberValue ? Number(value) : fallbackValue;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29lcmNpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy91dGlsL2NvZXJjaW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVIOzs7Ozs7Ozs7OztHQVdHO0FBQ0gsTUFBTSxVQUFVLGdCQUFnQixDQUFDLEtBQWM7SUFDN0MsT0FBTyxPQUFPLEtBQUssS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLElBQUksSUFBSSxLQUFLLEtBQUssT0FBTyxDQUFDO0FBQ2pGLENBQUM7QUFFRDs7Ozs7Ozs7Ozs7O0dBWUc7QUFDSCxNQUFNLFVBQVUsZUFBZSxDQUFDLEtBQWMsRUFBRSxhQUFhLEdBQUcsR0FBRztJQUNqRSxpR0FBaUc7SUFDakcsNEZBQTRGO0lBQzVGLG9GQUFvRjtJQUNwRixNQUFNLGFBQWEsR0FBRyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBWSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNoRixPQUFPLGFBQWEsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUM7QUFDdkQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuLyoqXG4gKiBUcmFuc2Zvcm1zIGEgdmFsdWUgKHR5cGljYWxseSBhIHN0cmluZykgdG8gYSBib29sZWFuLlxuICogSW50ZW5kZWQgdG8gYmUgdXNlZCBhcyBhIHRyYW5zZm9ybSBmdW5jdGlvbiBvZiBhbiBpbnB1dC5cbiAqXG4gKiAgQHVzYWdlTm90ZXNcbiAqICBgYGB0eXBlc2NyaXB0XG4gKiAgQElucHV0KHsgdHJhbnNmb3JtOiBib29sZWFuQXR0cmlidXRlIH0pIHN0YXR1cyE6IGJvb2xlYW47XG4gKiAgYGBgXG4gKiBAcGFyYW0gdmFsdWUgVmFsdWUgdG8gYmUgdHJhbnNmb3JtZWQuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gYm9vbGVhbkF0dHJpYnV0ZSh2YWx1ZTogdW5rbm93bik6IGJvb2xlYW4ge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnYm9vbGVhbicgPyB2YWx1ZSA6IHZhbHVlICE9IG51bGwgJiYgdmFsdWUgIT09ICdmYWxzZSc7XG59XG5cbi8qKlxuICogVHJhbnNmb3JtcyBhIHZhbHVlICh0eXBpY2FsbHkgYSBzdHJpbmcpIHRvIGEgbnVtYmVyLlxuICogSW50ZW5kZWQgdG8gYmUgdXNlZCBhcyBhIHRyYW5zZm9ybSBmdW5jdGlvbiBvZiBhbiBpbnB1dC5cbiAqIEBwYXJhbSB2YWx1ZSBWYWx1ZSB0byBiZSB0cmFuc2Zvcm1lZC5cbiAqIEBwYXJhbSBmYWxsYmFja1ZhbHVlIFZhbHVlIHRvIHVzZSBpZiB0aGUgcHJvdmlkZWQgdmFsdWUgY2FuJ3QgYmUgcGFyc2VkIGFzIGEgbnVtYmVyLlxuICpcbiAqICBAdXNhZ2VOb3Rlc1xuICogIGBgYHR5cGVzY3JpcHRcbiAqICBASW5wdXQoeyB0cmFuc2Zvcm06IG51bWJlckF0dHJpYnV0ZSB9KSBpZCE6IG51bWJlcjtcbiAqICBgYGBcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBudW1iZXJBdHRyaWJ1dGUodmFsdWU6IHVua25vd24sIGZhbGxiYWNrVmFsdWUgPSBOYU4pOiBudW1iZXIge1xuICAvLyBwYXJzZUZsb2F0KHZhbHVlKSBoYW5kbGVzIG1vc3Qgb2YgdGhlIGNhc2VzIHdlJ3JlIGludGVyZXN0ZWQgaW4gKGl0IHRyZWF0cyBudWxsLCBlbXB0eSBzdHJpbmcsXG4gIC8vIGFuZCBvdGhlciBub24tbnVtYmVyIHZhbHVlcyBhcyBOYU4sIHdoZXJlIE51bWJlciBqdXN0IHVzZXMgMCkgYnV0IGl0IGNvbnNpZGVycyB0aGUgc3RyaW5nXG4gIC8vICcxMjNoZWxsbycgdG8gYmUgYSB2YWxpZCBudW1iZXIuIFRoZXJlZm9yZSB3ZSBhbHNvIGNoZWNrIGlmIE51bWJlcih2YWx1ZSkgaXMgTmFOLlxuICBjb25zdCBpc051bWJlclZhbHVlID0gIWlzTmFOKHBhcnNlRmxvYXQodmFsdWUgYXMgYW55KSkgJiYgIWlzTmFOKE51bWJlcih2YWx1ZSkpO1xuICByZXR1cm4gaXNOdW1iZXJWYWx1ZSA/IE51bWJlcih2YWx1ZSkgOiBmYWxsYmFja1ZhbHVlO1xufVxuIl19