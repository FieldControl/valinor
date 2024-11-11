/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ChangeDetectorRef } from '../change_detection/change_detector_ref';
/**
 * Represents an Angular view.
 *
 * @see [Change detection usage](/api/core/ChangeDetectorRef?tab=usage-notes)
 *
 * @publicApi
 */
export class ViewRef extends ChangeDetectorRef {
}
/**
 * Represents an Angular view in a view container.
 * An embedded view can be referenced from a component
 * other than the hosting component whose template defines it, or it can be defined
 * independently by a `TemplateRef`.
 *
 * Properties of elements in a view can change, but the structure (number and order) of elements in
 * a view cannot. Change the structure of elements by inserting, moving, or
 * removing nested views in a view container.
 *
 * @see {@link ViewContainerRef}
 *
 * @usageNotes
 *
 * The following template breaks down into two separate `TemplateRef` instances,
 * an outer one and an inner one.
 *
 * ```
 * Count: {{items.length}}
 * <ul>
 *   <li *ngFor="let  item of items">{{item}}</li>
 * </ul>
 * ```
 *
 * This is the outer `TemplateRef`:
 *
 * ```
 * Count: {{items.length}}
 * <ul>
 *   <ng-template ngFor let-item [ngForOf]="items"></ng-template>
 * </ul>
 * ```
 *
 * This is the inner `TemplateRef`:
 *
 * ```
 *   <li>{{item}}</li>
 * ```
 *
 * The outer and inner `TemplateRef` instances are assembled into views as follows:
 *
 * ```
 * <!-- ViewRef: outer-0 -->
 * Count: 2
 * <ul>
 *   <ng-template view-container-ref></ng-template>
 *   <!-- ViewRef: inner-1 --><li>first</li><!-- /ViewRef: inner-1 -->
 *   <!-- ViewRef: inner-2 --><li>second</li><!-- /ViewRef: inner-2 -->
 * </ul>
 * <!-- /ViewRef: outer-0 -->
 * ```
 * @publicApi
 */
export class EmbeddedViewRef extends ViewRef {
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld19yZWYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9saW5rZXIvdmlld19yZWYudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0seUNBQXlDLENBQUM7QUFFMUU7Ozs7OztHQU1HO0FBQ0gsTUFBTSxPQUFnQixPQUFRLFNBQVEsaUJBQWlCO0NBbUJ0RDtBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBb0RHO0FBQ0gsTUFBTSxPQUFnQixlQUFtQixTQUFRLE9BQU87Q0FVdkQiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q2hhbmdlRGV0ZWN0b3JSZWZ9IGZyb20gJy4uL2NoYW5nZV9kZXRlY3Rpb24vY2hhbmdlX2RldGVjdG9yX3JlZic7XG5cbi8qKlxuICogUmVwcmVzZW50cyBhbiBBbmd1bGFyIHZpZXcuXG4gKlxuICogQHNlZSBbQ2hhbmdlIGRldGVjdGlvbiB1c2FnZV0oL2FwaS9jb3JlL0NoYW5nZURldGVjdG9yUmVmP3RhYj11c2FnZS1ub3RlcylcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBWaWV3UmVmIGV4dGVuZHMgQ2hhbmdlRGV0ZWN0b3JSZWYge1xuICAvKipcbiAgICogRGVzdHJveXMgdGhpcyB2aWV3IGFuZCBhbGwgb2YgdGhlIGRhdGEgc3RydWN0dXJlcyBhc3NvY2lhdGVkIHdpdGggaXQuXG4gICAqL1xuICBhYnN0cmFjdCBkZXN0cm95KCk6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIFJlcG9ydHMgd2hldGhlciB0aGlzIHZpZXcgaGFzIGJlZW4gZGVzdHJveWVkLlxuICAgKiBAcmV0dXJucyBUcnVlIGFmdGVyIHRoZSBgZGVzdHJveSgpYCBtZXRob2QgaGFzIGJlZW4gY2FsbGVkLCBmYWxzZSBvdGhlcndpc2UuXG4gICAqL1xuICBhYnN0cmFjdCBnZXQgZGVzdHJveWVkKCk6IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIEEgbGlmZWN5Y2xlIGhvb2sgdGhhdCBwcm92aWRlcyBhZGRpdGlvbmFsIGRldmVsb3Blci1kZWZpbmVkIGNsZWFudXBcbiAgICogZnVuY3Rpb25hbGl0eSBmb3Igdmlld3MuXG4gICAqIEBwYXJhbSBjYWxsYmFjayBBIGhhbmRsZXIgZnVuY3Rpb24gdGhhdCBjbGVhbnMgdXAgZGV2ZWxvcGVyLWRlZmluZWQgZGF0YVxuICAgKiBhc3NvY2lhdGVkIHdpdGggYSB2aWV3LiBDYWxsZWQgd2hlbiB0aGUgYGRlc3Ryb3koKWAgbWV0aG9kIGlzIGludm9rZWQuXG4gICAqL1xuICBhYnN0cmFjdCBvbkRlc3Ryb3koY2FsbGJhY2s6IEZ1bmN0aW9uKTogdm9pZDtcbn1cblxuLyoqXG4gKiBSZXByZXNlbnRzIGFuIEFuZ3VsYXIgdmlldyBpbiBhIHZpZXcgY29udGFpbmVyLlxuICogQW4gZW1iZWRkZWQgdmlldyBjYW4gYmUgcmVmZXJlbmNlZCBmcm9tIGEgY29tcG9uZW50XG4gKiBvdGhlciB0aGFuIHRoZSBob3N0aW5nIGNvbXBvbmVudCB3aG9zZSB0ZW1wbGF0ZSBkZWZpbmVzIGl0LCBvciBpdCBjYW4gYmUgZGVmaW5lZFxuICogaW5kZXBlbmRlbnRseSBieSBhIGBUZW1wbGF0ZVJlZmAuXG4gKlxuICogUHJvcGVydGllcyBvZiBlbGVtZW50cyBpbiBhIHZpZXcgY2FuIGNoYW5nZSwgYnV0IHRoZSBzdHJ1Y3R1cmUgKG51bWJlciBhbmQgb3JkZXIpIG9mIGVsZW1lbnRzIGluXG4gKiBhIHZpZXcgY2Fubm90LiBDaGFuZ2UgdGhlIHN0cnVjdHVyZSBvZiBlbGVtZW50cyBieSBpbnNlcnRpbmcsIG1vdmluZywgb3JcbiAqIHJlbW92aW5nIG5lc3RlZCB2aWV3cyBpbiBhIHZpZXcgY29udGFpbmVyLlxuICpcbiAqIEBzZWUge0BsaW5rIFZpZXdDb250YWluZXJSZWZ9XG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiBUaGUgZm9sbG93aW5nIHRlbXBsYXRlIGJyZWFrcyBkb3duIGludG8gdHdvIHNlcGFyYXRlIGBUZW1wbGF0ZVJlZmAgaW5zdGFuY2VzLFxuICogYW4gb3V0ZXIgb25lIGFuZCBhbiBpbm5lciBvbmUuXG4gKlxuICogYGBgXG4gKiBDb3VudDoge3tpdGVtcy5sZW5ndGh9fVxuICogPHVsPlxuICogICA8bGkgKm5nRm9yPVwibGV0ICBpdGVtIG9mIGl0ZW1zXCI+e3tpdGVtfX08L2xpPlxuICogPC91bD5cbiAqIGBgYFxuICpcbiAqIFRoaXMgaXMgdGhlIG91dGVyIGBUZW1wbGF0ZVJlZmA6XG4gKlxuICogYGBgXG4gKiBDb3VudDoge3tpdGVtcy5sZW5ndGh9fVxuICogPHVsPlxuICogICA8bmctdGVtcGxhdGUgbmdGb3IgbGV0LWl0ZW0gW25nRm9yT2ZdPVwiaXRlbXNcIj48L25nLXRlbXBsYXRlPlxuICogPC91bD5cbiAqIGBgYFxuICpcbiAqIFRoaXMgaXMgdGhlIGlubmVyIGBUZW1wbGF0ZVJlZmA6XG4gKlxuICogYGBgXG4gKiAgIDxsaT57e2l0ZW19fTwvbGk+XG4gKiBgYGBcbiAqXG4gKiBUaGUgb3V0ZXIgYW5kIGlubmVyIGBUZW1wbGF0ZVJlZmAgaW5zdGFuY2VzIGFyZSBhc3NlbWJsZWQgaW50byB2aWV3cyBhcyBmb2xsb3dzOlxuICpcbiAqIGBgYFxuICogPCEtLSBWaWV3UmVmOiBvdXRlci0wIC0tPlxuICogQ291bnQ6IDJcbiAqIDx1bD5cbiAqICAgPG5nLXRlbXBsYXRlIHZpZXctY29udGFpbmVyLXJlZj48L25nLXRlbXBsYXRlPlxuICogICA8IS0tIFZpZXdSZWY6IGlubmVyLTEgLS0+PGxpPmZpcnN0PC9saT48IS0tIC9WaWV3UmVmOiBpbm5lci0xIC0tPlxuICogICA8IS0tIFZpZXdSZWY6IGlubmVyLTIgLS0+PGxpPnNlY29uZDwvbGk+PCEtLSAvVmlld1JlZjogaW5uZXItMiAtLT5cbiAqIDwvdWw+XG4gKiA8IS0tIC9WaWV3UmVmOiBvdXRlci0wIC0tPlxuICogYGBgXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBFbWJlZGRlZFZpZXdSZWY8Qz4gZXh0ZW5kcyBWaWV3UmVmIHtcbiAgLyoqXG4gICAqIFRoZSBjb250ZXh0IGZvciB0aGlzIHZpZXcsIGluaGVyaXRlZCBmcm9tIHRoZSBhbmNob3IgZWxlbWVudC5cbiAgICovXG4gIGFic3RyYWN0IGNvbnRleHQ6IEM7XG5cbiAgLyoqXG4gICAqIFRoZSByb290IG5vZGVzIGZvciB0aGlzIGVtYmVkZGVkIHZpZXcuXG4gICAqL1xuICBhYnN0cmFjdCBnZXQgcm9vdE5vZGVzKCk6IGFueVtdO1xufVxuXG4vKipcbiAqIEludGVyZmFjZSBmb3IgdHJhY2tpbmcgcm9vdCBgVmlld1JlZmBzIGluIGBBcHBsaWNhdGlvblJlZmAuXG4gKlxuICogTk9URTogSW1wb3J0aW5nIGBBcHBsaWNhdGlvblJlZmAgaGVyZSBkaXJlY3RseSBjcmVhdGVzIGNpcmN1bGFyIGRlcGVuZGVuY3ksIHdoaWNoIGlzIHdoeSB3ZSBoYXZlXG4gKiBhIHN1YnNldCBvZiB0aGUgYEFwcGxpY2F0aW9uUmVmYCBpbnRlcmZhY2UgYFZpZXdSZWZUcmFja2VyYCBoZXJlLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFZpZXdSZWZUcmFja2VyIHtcbiAgZGV0YWNoVmlldyh2aWV3UmVmOiBWaWV3UmVmKTogdm9pZDtcbn1cbiJdfQ==