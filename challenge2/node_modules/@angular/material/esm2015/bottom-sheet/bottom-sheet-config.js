/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { InjectionToken } from '@angular/core';
/** Injection token that can be used to access the data that was passed in to a bottom sheet. */
export const MAT_BOTTOM_SHEET_DATA = new InjectionToken('MatBottomSheetData');
/**
 * Configuration used when opening a bottom sheet.
 */
export class MatBottomSheetConfig {
    constructor() {
        /** Data being injected into the child component. */
        this.data = null;
        /** Whether the bottom sheet has a backdrop. */
        this.hasBackdrop = true;
        /** Whether the user can use escape or clicking outside to close the bottom sheet. */
        this.disableClose = false;
        /** Aria label to assign to the bottom sheet element. */
        this.ariaLabel = null;
        /**
         * Whether the bottom sheet should close when the user goes backwards/forwards in history.
         * Note that this usually doesn't include clicking on links (unless the user is using
         * the `HashLocationStrategy`).
         */
        this.closeOnNavigation = true;
        // Note that this is disabled by default, because while the a11y recommendations are to focus
        // the first focusable element, doing so prevents screen readers from reading out the
        // rest of the bottom sheet content.
        /** Whether the bottom sheet should focus the first focusable element on open. */
        this.autoFocus = false;
        /**
         * Whether the bottom sheet should restore focus to the
         * previously-focused element, after it's closed.
         */
        this.restoreFocus = true;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm90dG9tLXNoZWV0LWNvbmZpZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9ib3R0b20tc2hlZXQvYm90dG9tLXNoZWV0LWNvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFJSCxPQUFPLEVBQUMsY0FBYyxFQUFtQixNQUFNLGVBQWUsQ0FBQztBQUUvRCxnR0FBZ0c7QUFDaEcsTUFBTSxDQUFDLE1BQU0scUJBQXFCLEdBQUcsSUFBSSxjQUFjLENBQU0sb0JBQW9CLENBQUMsQ0FBQztBQUVuRjs7R0FFRztBQUNILE1BQU0sT0FBTyxvQkFBb0I7SUFBakM7UUFVRSxvREFBb0Q7UUFDcEQsU0FBSSxHQUFjLElBQUksQ0FBQztRQUV2QiwrQ0FBK0M7UUFDL0MsZ0JBQVcsR0FBYSxJQUFJLENBQUM7UUFLN0IscUZBQXFGO1FBQ3JGLGlCQUFZLEdBQWEsS0FBSyxDQUFDO1FBRS9CLHdEQUF3RDtRQUN4RCxjQUFTLEdBQW1CLElBQUksQ0FBQztRQUVqQzs7OztXQUlHO1FBQ0gsc0JBQWlCLEdBQWEsSUFBSSxDQUFDO1FBRW5DLDZGQUE2RjtRQUM3RixxRkFBcUY7UUFDckYsb0NBQW9DO1FBQ3BDLGlGQUFpRjtRQUNqRixjQUFTLEdBQWEsS0FBSyxDQUFDO1FBRTVCOzs7V0FHRztRQUNILGlCQUFZLEdBQWEsSUFBSSxDQUFDO0lBSWhDLENBQUM7Q0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RpcmVjdGlvbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHtTY3JvbGxTdHJhdGVneX0gZnJvbSAnQGFuZ3VsYXIvY2RrL292ZXJsYXknO1xuaW1wb3J0IHtJbmplY3Rpb25Ub2tlbiwgVmlld0NvbnRhaW5lclJlZn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbi8qKiBJbmplY3Rpb24gdG9rZW4gdGhhdCBjYW4gYmUgdXNlZCB0byBhY2Nlc3MgdGhlIGRhdGEgdGhhdCB3YXMgcGFzc2VkIGluIHRvIGEgYm90dG9tIHNoZWV0LiAqL1xuZXhwb3J0IGNvbnN0IE1BVF9CT1RUT01fU0hFRVRfREFUQSA9IG5ldyBJbmplY3Rpb25Ub2tlbjxhbnk+KCdNYXRCb3R0b21TaGVldERhdGEnKTtcblxuLyoqXG4gKiBDb25maWd1cmF0aW9uIHVzZWQgd2hlbiBvcGVuaW5nIGEgYm90dG9tIHNoZWV0LlxuICovXG5leHBvcnQgY2xhc3MgTWF0Qm90dG9tU2hlZXRDb25maWc8RCA9IGFueT4ge1xuICAvKiogVGhlIHZpZXcgY29udGFpbmVyIHRvIHBsYWNlIHRoZSBvdmVybGF5IGZvciB0aGUgYm90dG9tIHNoZWV0IGludG8uICovXG4gIHZpZXdDb250YWluZXJSZWY/OiBWaWV3Q29udGFpbmVyUmVmO1xuXG4gIC8qKiBFeHRyYSBDU1MgY2xhc3NlcyB0byBiZSBhZGRlZCB0byB0aGUgYm90dG9tIHNoZWV0IGNvbnRhaW5lci4gKi9cbiAgcGFuZWxDbGFzcz86IHN0cmluZyB8IHN0cmluZ1tdO1xuXG4gIC8qKiBUZXh0IGxheW91dCBkaXJlY3Rpb24gZm9yIHRoZSBib3R0b20gc2hlZXQuICovXG4gIGRpcmVjdGlvbj86IERpcmVjdGlvbjtcblxuICAvKiogRGF0YSBiZWluZyBpbmplY3RlZCBpbnRvIHRoZSBjaGlsZCBjb21wb25lbnQuICovXG4gIGRhdGE/OiBEIHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGJvdHRvbSBzaGVldCBoYXMgYSBiYWNrZHJvcC4gKi9cbiAgaGFzQmFja2Ryb3A/OiBib29sZWFuID0gdHJ1ZTtcblxuICAvKiogQ3VzdG9tIGNsYXNzIGZvciB0aGUgYmFja2Ryb3AuICovXG4gIGJhY2tkcm9wQ2xhc3M/OiBzdHJpbmc7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIHVzZXIgY2FuIHVzZSBlc2NhcGUgb3IgY2xpY2tpbmcgb3V0c2lkZSB0byBjbG9zZSB0aGUgYm90dG9tIHNoZWV0LiAqL1xuICBkaXNhYmxlQ2xvc2U/OiBib29sZWFuID0gZmFsc2U7XG5cbiAgLyoqIEFyaWEgbGFiZWwgdG8gYXNzaWduIHRvIHRoZSBib3R0b20gc2hlZXQgZWxlbWVudC4gKi9cbiAgYXJpYUxhYmVsPzogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIGJvdHRvbSBzaGVldCBzaG91bGQgY2xvc2Ugd2hlbiB0aGUgdXNlciBnb2VzIGJhY2t3YXJkcy9mb3J3YXJkcyBpbiBoaXN0b3J5LlxuICAgKiBOb3RlIHRoYXQgdGhpcyB1c3VhbGx5IGRvZXNuJ3QgaW5jbHVkZSBjbGlja2luZyBvbiBsaW5rcyAodW5sZXNzIHRoZSB1c2VyIGlzIHVzaW5nXG4gICAqIHRoZSBgSGFzaExvY2F0aW9uU3RyYXRlZ3lgKS5cbiAgICovXG4gIGNsb3NlT25OYXZpZ2F0aW9uPzogYm9vbGVhbiA9IHRydWU7XG5cbiAgLy8gTm90ZSB0aGF0IHRoaXMgaXMgZGlzYWJsZWQgYnkgZGVmYXVsdCwgYmVjYXVzZSB3aGlsZSB0aGUgYTExeSByZWNvbW1lbmRhdGlvbnMgYXJlIHRvIGZvY3VzXG4gIC8vIHRoZSBmaXJzdCBmb2N1c2FibGUgZWxlbWVudCwgZG9pbmcgc28gcHJldmVudHMgc2NyZWVuIHJlYWRlcnMgZnJvbSByZWFkaW5nIG91dCB0aGVcbiAgLy8gcmVzdCBvZiB0aGUgYm90dG9tIHNoZWV0IGNvbnRlbnQuXG4gIC8qKiBXaGV0aGVyIHRoZSBib3R0b20gc2hlZXQgc2hvdWxkIGZvY3VzIHRoZSBmaXJzdCBmb2N1c2FibGUgZWxlbWVudCBvbiBvcGVuLiAqL1xuICBhdXRvRm9jdXM/OiBib29sZWFuID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIGJvdHRvbSBzaGVldCBzaG91bGQgcmVzdG9yZSBmb2N1cyB0byB0aGVcbiAgICogcHJldmlvdXNseS1mb2N1c2VkIGVsZW1lbnQsIGFmdGVyIGl0J3MgY2xvc2VkLlxuICAgKi9cbiAgcmVzdG9yZUZvY3VzPzogYm9vbGVhbiA9IHRydWU7XG5cbiAgLyoqIFNjcm9sbCBzdHJhdGVneSB0byBiZSB1c2VkIGZvciB0aGUgYm90dG9tIHNoZWV0LiAqL1xuICBzY3JvbGxTdHJhdGVneT86IFNjcm9sbFN0cmF0ZWd5O1xufVxuIl19