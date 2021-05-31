/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injectable, SkipSelf, Optional } from '@angular/core';
import { Subject } from 'rxjs';
import * as i0 from "@angular/core";
/**
 * To modify the labels and text displayed, create a new instance of MatSortHeaderIntl and
 * include it in a custom provider.
 * @deprecated No longer being used. To be removed.
 * @breaking-change 13.0.0
 */
export class MatSortHeaderIntl {
    constructor() {
        /**
         * Stream that emits whenever the labels here are changed. Use this to notify
         * components if the labels have changed after initialization.
         */
        this.changes = new Subject();
    }
}
MatSortHeaderIntl.ɵprov = i0.ɵɵdefineInjectable({ factory: function MatSortHeaderIntl_Factory() { return new MatSortHeaderIntl(); }, token: MatSortHeaderIntl, providedIn: "root" });
MatSortHeaderIntl.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
/** @docs-private */
export function MAT_SORT_HEADER_INTL_PROVIDER_FACTORY(parentIntl) {
    return parentIntl || new MatSortHeaderIntl();
}
/** @docs-private */
export const MAT_SORT_HEADER_INTL_PROVIDER = {
    // If there is already an MatSortHeaderIntl available, use that. Otherwise, provide a new one.
    provide: MatSortHeaderIntl,
    deps: [[new Optional(), new SkipSelf(), MatSortHeaderIntl]],
    useFactory: MAT_SORT_HEADER_INTL_PROVIDER_FACTORY
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29ydC1oZWFkZXItaW50bC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9zb3J0L3NvcnQtaGVhZGVyLWludGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFVBQVUsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQzdELE9BQU8sRUFBQyxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7O0FBRTdCOzs7OztHQUtHO0FBRUgsTUFBTSxPQUFPLGlCQUFpQjtJQUQ5QjtRQUVFOzs7V0FHRztRQUNNLFlBQU8sR0FBa0IsSUFBSSxPQUFPLEVBQVEsQ0FBQztLQUN2RDs7OztZQVBBLFVBQVUsU0FBQyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUM7O0FBU2hDLG9CQUFvQjtBQUNwQixNQUFNLFVBQVUscUNBQXFDLENBQUMsVUFBNkI7SUFDakYsT0FBTyxVQUFVLElBQUksSUFBSSxpQkFBaUIsRUFBRSxDQUFDO0FBQy9DLENBQUM7QUFFRCxvQkFBb0I7QUFDcEIsTUFBTSxDQUFDLE1BQU0sNkJBQTZCLEdBQUc7SUFDM0MsOEZBQThGO0lBQzlGLE9BQU8sRUFBRSxpQkFBaUI7SUFDMUIsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLFFBQVEsRUFBRSxFQUFFLElBQUksUUFBUSxFQUFFLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztJQUMzRCxVQUFVLEVBQUUscUNBQXFDO0NBQ2xELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3RhYmxlLCBTa2lwU2VsZiwgT3B0aW9uYWx9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtTdWJqZWN0fSBmcm9tICdyeGpzJztcblxuLyoqXG4gKiBUbyBtb2RpZnkgdGhlIGxhYmVscyBhbmQgdGV4dCBkaXNwbGF5ZWQsIGNyZWF0ZSBhIG5ldyBpbnN0YW5jZSBvZiBNYXRTb3J0SGVhZGVySW50bCBhbmRcbiAqIGluY2x1ZGUgaXQgaW4gYSBjdXN0b20gcHJvdmlkZXIuXG4gKiBAZGVwcmVjYXRlZCBObyBsb25nZXIgYmVpbmcgdXNlZC4gVG8gYmUgcmVtb3ZlZC5cbiAqIEBicmVha2luZy1jaGFuZ2UgMTMuMC4wXG4gKi9cbkBJbmplY3RhYmxlKHtwcm92aWRlZEluOiAncm9vdCd9KVxuZXhwb3J0IGNsYXNzIE1hdFNvcnRIZWFkZXJJbnRsIHtcbiAgLyoqXG4gICAqIFN0cmVhbSB0aGF0IGVtaXRzIHdoZW5ldmVyIHRoZSBsYWJlbHMgaGVyZSBhcmUgY2hhbmdlZC4gVXNlIHRoaXMgdG8gbm90aWZ5XG4gICAqIGNvbXBvbmVudHMgaWYgdGhlIGxhYmVscyBoYXZlIGNoYW5nZWQgYWZ0ZXIgaW5pdGlhbGl6YXRpb24uXG4gICAqL1xuICByZWFkb25seSBjaGFuZ2VzOiBTdWJqZWN0PHZvaWQ+ID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcbn1cblxuLyoqIEBkb2NzLXByaXZhdGUgKi9cbmV4cG9ydCBmdW5jdGlvbiBNQVRfU09SVF9IRUFERVJfSU5UTF9QUk9WSURFUl9GQUNUT1JZKHBhcmVudEludGw6IE1hdFNvcnRIZWFkZXJJbnRsKSB7XG4gIHJldHVybiBwYXJlbnRJbnRsIHx8IG5ldyBNYXRTb3J0SGVhZGVySW50bCgpO1xufVxuXG4vKiogQGRvY3MtcHJpdmF0ZSAqL1xuZXhwb3J0IGNvbnN0IE1BVF9TT1JUX0hFQURFUl9JTlRMX1BST1ZJREVSID0ge1xuICAvLyBJZiB0aGVyZSBpcyBhbHJlYWR5IGFuIE1hdFNvcnRIZWFkZXJJbnRsIGF2YWlsYWJsZSwgdXNlIHRoYXQuIE90aGVyd2lzZSwgcHJvdmlkZSBhIG5ldyBvbmUuXG4gIHByb3ZpZGU6IE1hdFNvcnRIZWFkZXJJbnRsLFxuICBkZXBzOiBbW25ldyBPcHRpb25hbCgpLCBuZXcgU2tpcFNlbGYoKSwgTWF0U29ydEhlYWRlckludGxdXSxcbiAgdXNlRmFjdG9yeTogTUFUX1NPUlRfSEVBREVSX0lOVExfUFJPVklERVJfRkFDVE9SWVxufTtcblxuIl19