/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { getClosureSafeProperty } from '../util/property';
import { stringify } from '../util/stringify';
const __forward_ref__ = getClosureSafeProperty({ __forward_ref__: getClosureSafeProperty });
/**
 * Allows to refer to references which are not yet defined.
 *
 * For instance, `forwardRef` is used when the `token` which we need to refer to for the purposes of
 * DI is declared, but not yet defined. It is also used when the `token` which we use when creating
 * a query is not yet defined.
 *
 * `forwardRef` is also used to break circularities in standalone components imports.
 *
 * @usageNotes
 * ### Circular dependency example
 * {@example core/di/ts/forward_ref/forward_ref_spec.ts region='forward_ref'}
 *
 * ### Circular standalone reference import example
 * ```ts
 * @Component({
 *   standalone: true,
 *   imports: [ChildComponent],
 *   selector: 'app-parent',
 *   template: `<app-child [hideParent]="hideParent"></app-child>`,
 * })
 * export class ParentComponent {
 *   @Input() hideParent: boolean;
 * }
 *
 *
 * @Component({
 *   standalone: true,
 *   imports: [CommonModule, forwardRef(() => ParentComponent)],
 *   selector: 'app-child',
 *   template: `<app-parent *ngIf="!hideParent"></app-parent>`,
 * })
 * export class ChildComponent {
 *   @Input() hideParent: boolean;
 * }
 * ```
 *
 * @publicApi
 */
export function forwardRef(forwardRefFn) {
    forwardRefFn.__forward_ref__ = forwardRef;
    forwardRefFn.toString = function () {
        return stringify(this());
    };
    return forwardRefFn;
}
/**
 * Lazily retrieves the reference value from a forwardRef.
 *
 * Acts as the identity function when given a non-forward-ref value.
 *
 * @usageNotes
 * ### Example
 *
 * {@example core/di/ts/forward_ref/forward_ref_spec.ts region='resolve_forward_ref'}
 *
 * @see {@link forwardRef}
 * @publicApi
 */
export function resolveForwardRef(type) {
    return isForwardRef(type) ? type() : type;
}
/** Checks whether a function is wrapped by a `forwardRef`. */
export function isForwardRef(fn) {
    return (typeof fn === 'function' &&
        fn.hasOwnProperty(__forward_ref__) &&
        fn.__forward_ref__ === forwardRef);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9yd2FyZF9yZWYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9kaS9mb3J3YXJkX3JlZi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFHSCxPQUFPLEVBQUMsc0JBQXNCLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUN4RCxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFlNUMsTUFBTSxlQUFlLEdBQUcsc0JBQXNCLENBQUMsRUFBQyxlQUFlLEVBQUUsc0JBQXNCLEVBQUMsQ0FBQyxDQUFDO0FBRTFGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXNDRztBQUNILE1BQU0sVUFBVSxVQUFVLENBQUMsWUFBMEI7SUFDN0MsWUFBYSxDQUFDLGVBQWUsR0FBRyxVQUFVLENBQUM7SUFDM0MsWUFBYSxDQUFDLFFBQVEsR0FBRztRQUM3QixPQUFPLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQzNCLENBQUMsQ0FBQztJQUNGLE9BQXdCLFlBQWEsQ0FBQztBQUN4QyxDQUFDO0FBRUQ7Ozs7Ozs7Ozs7OztHQVlHO0FBQ0gsTUFBTSxVQUFVLGlCQUFpQixDQUFJLElBQU87SUFDMUMsT0FBTyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7QUFDNUMsQ0FBQztBQUVELDhEQUE4RDtBQUM5RCxNQUFNLFVBQVUsWUFBWSxDQUFDLEVBQU87SUFDbEMsT0FBTyxDQUNMLE9BQU8sRUFBRSxLQUFLLFVBQVU7UUFDeEIsRUFBRSxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQUM7UUFDbEMsRUFBRSxDQUFDLGVBQWUsS0FBSyxVQUFVLENBQ2xDLENBQUM7QUFDSixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1R5cGV9IGZyb20gJy4uL2ludGVyZmFjZS90eXBlJztcbmltcG9ydCB7Z2V0Q2xvc3VyZVNhZmVQcm9wZXJ0eX0gZnJvbSAnLi4vdXRpbC9wcm9wZXJ0eSc7XG5pbXBvcnQge3N0cmluZ2lmeX0gZnJvbSAnLi4vdXRpbC9zdHJpbmdpZnknO1xuXG4vKipcbiAqIEFuIGludGVyZmFjZSB0aGF0IGEgZnVuY3Rpb24gcGFzc2VkIGludG8gYGZvcndhcmRSZWZgIGhhcyB0byBpbXBsZW1lbnQuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqICMjIyBFeGFtcGxlXG4gKlxuICoge0BleGFtcGxlIGNvcmUvZGkvdHMvZm9yd2FyZF9yZWYvZm9yd2FyZF9yZWZfc3BlYy50cyByZWdpb249J2ZvcndhcmRfcmVmX2ZuJ31cbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBGb3J3YXJkUmVmRm4ge1xuICAoKTogYW55O1xufVxuXG5jb25zdCBfX2ZvcndhcmRfcmVmX18gPSBnZXRDbG9zdXJlU2FmZVByb3BlcnR5KHtfX2ZvcndhcmRfcmVmX186IGdldENsb3N1cmVTYWZlUHJvcGVydHl9KTtcblxuLyoqXG4gKiBBbGxvd3MgdG8gcmVmZXIgdG8gcmVmZXJlbmNlcyB3aGljaCBhcmUgbm90IHlldCBkZWZpbmVkLlxuICpcbiAqIEZvciBpbnN0YW5jZSwgYGZvcndhcmRSZWZgIGlzIHVzZWQgd2hlbiB0aGUgYHRva2VuYCB3aGljaCB3ZSBuZWVkIHRvIHJlZmVyIHRvIGZvciB0aGUgcHVycG9zZXMgb2ZcbiAqIERJIGlzIGRlY2xhcmVkLCBidXQgbm90IHlldCBkZWZpbmVkLiBJdCBpcyBhbHNvIHVzZWQgd2hlbiB0aGUgYHRva2VuYCB3aGljaCB3ZSB1c2Ugd2hlbiBjcmVhdGluZ1xuICogYSBxdWVyeSBpcyBub3QgeWV0IGRlZmluZWQuXG4gKlxuICogYGZvcndhcmRSZWZgIGlzIGFsc28gdXNlZCB0byBicmVhayBjaXJjdWxhcml0aWVzIGluIHN0YW5kYWxvbmUgY29tcG9uZW50cyBpbXBvcnRzLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiAjIyMgQ2lyY3VsYXIgZGVwZW5kZW5jeSBleGFtcGxlXG4gKiB7QGV4YW1wbGUgY29yZS9kaS90cy9mb3J3YXJkX3JlZi9mb3J3YXJkX3JlZl9zcGVjLnRzIHJlZ2lvbj0nZm9yd2FyZF9yZWYnfVxuICpcbiAqICMjIyBDaXJjdWxhciBzdGFuZGFsb25lIHJlZmVyZW5jZSBpbXBvcnQgZXhhbXBsZVxuICogYGBgdHNcbiAqIEBDb21wb25lbnQoe1xuICogICBzdGFuZGFsb25lOiB0cnVlLFxuICogICBpbXBvcnRzOiBbQ2hpbGRDb21wb25lbnRdLFxuICogICBzZWxlY3RvcjogJ2FwcC1wYXJlbnQnLFxuICogICB0ZW1wbGF0ZTogYDxhcHAtY2hpbGQgW2hpZGVQYXJlbnRdPVwiaGlkZVBhcmVudFwiPjwvYXBwLWNoaWxkPmAsXG4gKiB9KVxuICogZXhwb3J0IGNsYXNzIFBhcmVudENvbXBvbmVudCB7XG4gKiAgIEBJbnB1dCgpIGhpZGVQYXJlbnQ6IGJvb2xlYW47XG4gKiB9XG4gKlxuICpcbiAqIEBDb21wb25lbnQoe1xuICogICBzdGFuZGFsb25lOiB0cnVlLFxuICogICBpbXBvcnRzOiBbQ29tbW9uTW9kdWxlLCBmb3J3YXJkUmVmKCgpID0+IFBhcmVudENvbXBvbmVudCldLFxuICogICBzZWxlY3RvcjogJ2FwcC1jaGlsZCcsXG4gKiAgIHRlbXBsYXRlOiBgPGFwcC1wYXJlbnQgKm5nSWY9XCIhaGlkZVBhcmVudFwiPjwvYXBwLXBhcmVudD5gLFxuICogfSlcbiAqIGV4cG9ydCBjbGFzcyBDaGlsZENvbXBvbmVudCB7XG4gKiAgIEBJbnB1dCgpIGhpZGVQYXJlbnQ6IGJvb2xlYW47XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmb3J3YXJkUmVmKGZvcndhcmRSZWZGbjogRm9yd2FyZFJlZkZuKTogVHlwZTxhbnk+IHtcbiAgKDxhbnk+Zm9yd2FyZFJlZkZuKS5fX2ZvcndhcmRfcmVmX18gPSBmb3J3YXJkUmVmO1xuICAoPGFueT5mb3J3YXJkUmVmRm4pLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBzdHJpbmdpZnkodGhpcygpKTtcbiAgfTtcbiAgcmV0dXJuIDxUeXBlPGFueT4+KDxhbnk+Zm9yd2FyZFJlZkZuKTtcbn1cblxuLyoqXG4gKiBMYXppbHkgcmV0cmlldmVzIHRoZSByZWZlcmVuY2UgdmFsdWUgZnJvbSBhIGZvcndhcmRSZWYuXG4gKlxuICogQWN0cyBhcyB0aGUgaWRlbnRpdHkgZnVuY3Rpb24gd2hlbiBnaXZlbiBhIG5vbi1mb3J3YXJkLXJlZiB2YWx1ZS5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogIyMjIEV4YW1wbGVcbiAqXG4gKiB7QGV4YW1wbGUgY29yZS9kaS90cy9mb3J3YXJkX3JlZi9mb3J3YXJkX3JlZl9zcGVjLnRzIHJlZ2lvbj0ncmVzb2x2ZV9mb3J3YXJkX3JlZid9XG4gKlxuICogQHNlZSB7QGxpbmsgZm9yd2FyZFJlZn1cbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVGb3J3YXJkUmVmPFQ+KHR5cGU6IFQpOiBUIHtcbiAgcmV0dXJuIGlzRm9yd2FyZFJlZih0eXBlKSA/IHR5cGUoKSA6IHR5cGU7XG59XG5cbi8qKiBDaGVja3Mgd2hldGhlciBhIGZ1bmN0aW9uIGlzIHdyYXBwZWQgYnkgYSBgZm9yd2FyZFJlZmAuICovXG5leHBvcnQgZnVuY3Rpb24gaXNGb3J3YXJkUmVmKGZuOiBhbnkpOiBmbiBpcyAoKSA9PiBhbnkge1xuICByZXR1cm4gKFxuICAgIHR5cGVvZiBmbiA9PT0gJ2Z1bmN0aW9uJyAmJlxuICAgIGZuLmhhc093blByb3BlcnR5KF9fZm9yd2FyZF9yZWZfXykgJiZcbiAgICBmbi5fX2ZvcndhcmRfcmVmX18gPT09IGZvcndhcmRSZWZcbiAgKTtcbn1cbiJdfQ==