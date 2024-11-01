/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * The phase to run an `afterRender` or `afterNextRender` callback in.
 *
 * Callbacks in the same phase run in the order they are registered. Phases run in the
 * following order after each render:
 *
 *   1. `AfterRenderPhase.EarlyRead`
 *   2. `AfterRenderPhase.Write`
 *   3. `AfterRenderPhase.MixedReadWrite`
 *   4. `AfterRenderPhase.Read`
 *
 * Angular is unable to verify or enforce that phases are used correctly, and instead
 * relies on each developer to follow the guidelines documented for each value and
 * carefully choose the appropriate one, refactoring their code if necessary. By doing
 * so, Angular is better able to minimize the performance degradation associated with
 * manual DOM access, ensuring the best experience for the end users of your application
 * or library.
 *
 * @deprecated Specify the phase for your callback to run in by passing a spec-object as the first
 *   parameter to `afterRender` or `afterNextRender` instead of a function.
 */
export var AfterRenderPhase;
(function (AfterRenderPhase) {
    /**
     * Use `AfterRenderPhase.EarlyRead` for callbacks that only need to **read** from the
     * DOM before a subsequent `AfterRenderPhase.Write` callback, for example to perform
     * custom layout that the browser doesn't natively support. Prefer the
     * `AfterRenderPhase.EarlyRead` phase if reading can wait until after the write phase.
     * **Never** write to the DOM in this phase.
     *
     * <div class="alert is-important">
     *
     * Using this value can degrade performance.
     * Instead, prefer using built-in browser functionality when possible.
     *
     * </div>
     */
    AfterRenderPhase[AfterRenderPhase["EarlyRead"] = 0] = "EarlyRead";
    /**
     * Use `AfterRenderPhase.Write` for callbacks that only **write** to the DOM. **Never**
     * read from the DOM in this phase.
     */
    AfterRenderPhase[AfterRenderPhase["Write"] = 1] = "Write";
    /**
     * Use `AfterRenderPhase.MixedReadWrite` for callbacks that read from or write to the
     * DOM, that haven't been refactored to use a different phase. **Never** use this phase if
     * it is possible to divide the work among the other phases instead.
     *
     * <div class="alert is-critical">
     *
     * Using this value can **significantly** degrade performance.
     * Instead, prefer dividing work into the appropriate phase callbacks.
     *
     * </div>
     */
    AfterRenderPhase[AfterRenderPhase["MixedReadWrite"] = 2] = "MixedReadWrite";
    /**
     * Use `AfterRenderPhase.Read` for callbacks that only **read** from the DOM. **Never**
     * write to the DOM in this phase.
     */
    AfterRenderPhase[AfterRenderPhase["Read"] = 3] = "Read";
})(AfterRenderPhase || (AfterRenderPhase = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvcmVuZGVyMy9hZnRlcl9yZW5kZXIvYXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVIOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQW9CRztBQUNILE1BQU0sQ0FBTixJQUFZLGdCQTBDWDtBQTFDRCxXQUFZLGdCQUFnQjtJQUMxQjs7Ozs7Ozs7Ozs7OztPQWFHO0lBQ0gsaUVBQVMsQ0FBQTtJQUVUOzs7T0FHRztJQUNILHlEQUFLLENBQUE7SUFFTDs7Ozs7Ozs7Ozs7T0FXRztJQUNILDJFQUFjLENBQUE7SUFFZDs7O09BR0c7SUFDSCx1REFBSSxDQUFBO0FBQ04sQ0FBQyxFQTFDVyxnQkFBZ0IsS0FBaEIsZ0JBQWdCLFFBMEMzQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuLyoqXG4gKiBUaGUgcGhhc2UgdG8gcnVuIGFuIGBhZnRlclJlbmRlcmAgb3IgYGFmdGVyTmV4dFJlbmRlcmAgY2FsbGJhY2sgaW4uXG4gKlxuICogQ2FsbGJhY2tzIGluIHRoZSBzYW1lIHBoYXNlIHJ1biBpbiB0aGUgb3JkZXIgdGhleSBhcmUgcmVnaXN0ZXJlZC4gUGhhc2VzIHJ1biBpbiB0aGVcbiAqIGZvbGxvd2luZyBvcmRlciBhZnRlciBlYWNoIHJlbmRlcjpcbiAqXG4gKiAgIDEuIGBBZnRlclJlbmRlclBoYXNlLkVhcmx5UmVhZGBcbiAqICAgMi4gYEFmdGVyUmVuZGVyUGhhc2UuV3JpdGVgXG4gKiAgIDMuIGBBZnRlclJlbmRlclBoYXNlLk1peGVkUmVhZFdyaXRlYFxuICogICA0LiBgQWZ0ZXJSZW5kZXJQaGFzZS5SZWFkYFxuICpcbiAqIEFuZ3VsYXIgaXMgdW5hYmxlIHRvIHZlcmlmeSBvciBlbmZvcmNlIHRoYXQgcGhhc2VzIGFyZSB1c2VkIGNvcnJlY3RseSwgYW5kIGluc3RlYWRcbiAqIHJlbGllcyBvbiBlYWNoIGRldmVsb3BlciB0byBmb2xsb3cgdGhlIGd1aWRlbGluZXMgZG9jdW1lbnRlZCBmb3IgZWFjaCB2YWx1ZSBhbmRcbiAqIGNhcmVmdWxseSBjaG9vc2UgdGhlIGFwcHJvcHJpYXRlIG9uZSwgcmVmYWN0b3JpbmcgdGhlaXIgY29kZSBpZiBuZWNlc3NhcnkuIEJ5IGRvaW5nXG4gKiBzbywgQW5ndWxhciBpcyBiZXR0ZXIgYWJsZSB0byBtaW5pbWl6ZSB0aGUgcGVyZm9ybWFuY2UgZGVncmFkYXRpb24gYXNzb2NpYXRlZCB3aXRoXG4gKiBtYW51YWwgRE9NIGFjY2VzcywgZW5zdXJpbmcgdGhlIGJlc3QgZXhwZXJpZW5jZSBmb3IgdGhlIGVuZCB1c2VycyBvZiB5b3VyIGFwcGxpY2F0aW9uXG4gKiBvciBsaWJyYXJ5LlxuICpcbiAqIEBkZXByZWNhdGVkIFNwZWNpZnkgdGhlIHBoYXNlIGZvciB5b3VyIGNhbGxiYWNrIHRvIHJ1biBpbiBieSBwYXNzaW5nIGEgc3BlYy1vYmplY3QgYXMgdGhlIGZpcnN0XG4gKiAgIHBhcmFtZXRlciB0byBgYWZ0ZXJSZW5kZXJgIG9yIGBhZnRlck5leHRSZW5kZXJgIGluc3RlYWQgb2YgYSBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0IGVudW0gQWZ0ZXJSZW5kZXJQaGFzZSB7XG4gIC8qKlxuICAgKiBVc2UgYEFmdGVyUmVuZGVyUGhhc2UuRWFybHlSZWFkYCBmb3IgY2FsbGJhY2tzIHRoYXQgb25seSBuZWVkIHRvICoqcmVhZCoqIGZyb20gdGhlXG4gICAqIERPTSBiZWZvcmUgYSBzdWJzZXF1ZW50IGBBZnRlclJlbmRlclBoYXNlLldyaXRlYCBjYWxsYmFjaywgZm9yIGV4YW1wbGUgdG8gcGVyZm9ybVxuICAgKiBjdXN0b20gbGF5b3V0IHRoYXQgdGhlIGJyb3dzZXIgZG9lc24ndCBuYXRpdmVseSBzdXBwb3J0LiBQcmVmZXIgdGhlXG4gICAqIGBBZnRlclJlbmRlclBoYXNlLkVhcmx5UmVhZGAgcGhhc2UgaWYgcmVhZGluZyBjYW4gd2FpdCB1bnRpbCBhZnRlciB0aGUgd3JpdGUgcGhhc2UuXG4gICAqICoqTmV2ZXIqKiB3cml0ZSB0byB0aGUgRE9NIGluIHRoaXMgcGhhc2UuXG4gICAqXG4gICAqIDxkaXYgY2xhc3M9XCJhbGVydCBpcy1pbXBvcnRhbnRcIj5cbiAgICpcbiAgICogVXNpbmcgdGhpcyB2YWx1ZSBjYW4gZGVncmFkZSBwZXJmb3JtYW5jZS5cbiAgICogSW5zdGVhZCwgcHJlZmVyIHVzaW5nIGJ1aWx0LWluIGJyb3dzZXIgZnVuY3Rpb25hbGl0eSB3aGVuIHBvc3NpYmxlLlxuICAgKlxuICAgKiA8L2Rpdj5cbiAgICovXG4gIEVhcmx5UmVhZCxcblxuICAvKipcbiAgICogVXNlIGBBZnRlclJlbmRlclBoYXNlLldyaXRlYCBmb3IgY2FsbGJhY2tzIHRoYXQgb25seSAqKndyaXRlKiogdG8gdGhlIERPTS4gKipOZXZlcioqXG4gICAqIHJlYWQgZnJvbSB0aGUgRE9NIGluIHRoaXMgcGhhc2UuXG4gICAqL1xuICBXcml0ZSxcblxuICAvKipcbiAgICogVXNlIGBBZnRlclJlbmRlclBoYXNlLk1peGVkUmVhZFdyaXRlYCBmb3IgY2FsbGJhY2tzIHRoYXQgcmVhZCBmcm9tIG9yIHdyaXRlIHRvIHRoZVxuICAgKiBET00sIHRoYXQgaGF2ZW4ndCBiZWVuIHJlZmFjdG9yZWQgdG8gdXNlIGEgZGlmZmVyZW50IHBoYXNlLiAqKk5ldmVyKiogdXNlIHRoaXMgcGhhc2UgaWZcbiAgICogaXQgaXMgcG9zc2libGUgdG8gZGl2aWRlIHRoZSB3b3JrIGFtb25nIHRoZSBvdGhlciBwaGFzZXMgaW5zdGVhZC5cbiAgICpcbiAgICogPGRpdiBjbGFzcz1cImFsZXJ0IGlzLWNyaXRpY2FsXCI+XG4gICAqXG4gICAqIFVzaW5nIHRoaXMgdmFsdWUgY2FuICoqc2lnbmlmaWNhbnRseSoqIGRlZ3JhZGUgcGVyZm9ybWFuY2UuXG4gICAqIEluc3RlYWQsIHByZWZlciBkaXZpZGluZyB3b3JrIGludG8gdGhlIGFwcHJvcHJpYXRlIHBoYXNlIGNhbGxiYWNrcy5cbiAgICpcbiAgICogPC9kaXY+XG4gICAqL1xuICBNaXhlZFJlYWRXcml0ZSxcblxuICAvKipcbiAgICogVXNlIGBBZnRlclJlbmRlclBoYXNlLlJlYWRgIGZvciBjYWxsYmFja3MgdGhhdCBvbmx5ICoqcmVhZCoqIGZyb20gdGhlIERPTS4gKipOZXZlcioqXG4gICAqIHdyaXRlIHRvIHRoZSBET00gaW4gdGhpcyBwaGFzZS5cbiAgICovXG4gIFJlYWQsXG59XG5cbi8qKlxuICogQSBjYWxsYmFjayB0aGF0IHJ1bnMgYWZ0ZXIgcmVuZGVyLlxuICpcbiAqIEBkZXZlbG9wZXJQcmV2aWV3XG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQWZ0ZXJSZW5kZXJSZWYge1xuICAvKipcbiAgICogU2h1dCBkb3duIHRoZSBjYWxsYmFjaywgcHJldmVudGluZyBpdCBmcm9tIGJlaW5nIGNhbGxlZCBhZ2Fpbi5cbiAgICovXG4gIGRlc3Ryb3koKTogdm9pZDtcbn1cbiJdfQ==