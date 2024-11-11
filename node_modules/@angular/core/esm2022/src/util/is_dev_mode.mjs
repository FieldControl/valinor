/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { global } from './global';
/**
 * Returns whether Angular is in development mode.
 *
 * By default, this is true, unless `enableProdMode` is invoked prior to calling this method or the
 * application is built using the Angular CLI with the `optimization` option.
 * @see {@link cli/build ng build}
 *
 * @publicApi
 */
export function isDevMode() {
    return typeof ngDevMode === 'undefined' || !!ngDevMode;
}
/**
 * Disable Angular's development mode, which turns off assertions and other
 * checks within the framework.
 *
 * One important assertion this disables verifies that a change detection pass
 * does not result in additional changes to any bindings (also known as
 * unidirectional data flow).
 *
 * Using this method is discouraged as the Angular CLI will set production mode when using the
 * `optimization` option.
 * @see {@link cli/build ng build}
 *
 * @publicApi
 */
export function enableProdMode() {
    // The below check is there so when ngDevMode is set via terser
    // `global['ngDevMode'] = false;` is also dropped.
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
        global['ngDevMode'] = false;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXNfZGV2X21vZGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy91dGlsL2lzX2Rldl9tb2RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFFaEM7Ozs7Ozs7O0dBUUc7QUFDSCxNQUFNLFVBQVUsU0FBUztJQUN2QixPQUFPLE9BQU8sU0FBUyxLQUFLLFdBQVcsSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFDO0FBQ3pELENBQUM7QUFFRDs7Ozs7Ozs7Ozs7OztHQWFHO0FBQ0gsTUFBTSxVQUFVLGNBQWM7SUFDNUIsK0RBQStEO0lBQy9ELGtEQUFrRDtJQUNsRCxJQUFJLE9BQU8sU0FBUyxLQUFLLFdBQVcsSUFBSSxTQUFTLEVBQUUsQ0FBQztRQUNsRCxNQUFNLENBQUMsV0FBVyxDQUFDLEdBQUcsS0FBSyxDQUFDO0lBQzlCLENBQUM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2dsb2JhbH0gZnJvbSAnLi9nbG9iYWwnO1xuXG4vKipcbiAqIFJldHVybnMgd2hldGhlciBBbmd1bGFyIGlzIGluIGRldmVsb3BtZW50IG1vZGUuXG4gKlxuICogQnkgZGVmYXVsdCwgdGhpcyBpcyB0cnVlLCB1bmxlc3MgYGVuYWJsZVByb2RNb2RlYCBpcyBpbnZva2VkIHByaW9yIHRvIGNhbGxpbmcgdGhpcyBtZXRob2Qgb3IgdGhlXG4gKiBhcHBsaWNhdGlvbiBpcyBidWlsdCB1c2luZyB0aGUgQW5ndWxhciBDTEkgd2l0aCB0aGUgYG9wdGltaXphdGlvbmAgb3B0aW9uLlxuICogQHNlZSB7QGxpbmsgY2xpL2J1aWxkIG5nIGJ1aWxkfVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRGV2TW9kZSgpOiBib29sZWFuIHtcbiAgcmV0dXJuIHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8ICEhbmdEZXZNb2RlO1xufVxuXG4vKipcbiAqIERpc2FibGUgQW5ndWxhcidzIGRldmVsb3BtZW50IG1vZGUsIHdoaWNoIHR1cm5zIG9mZiBhc3NlcnRpb25zIGFuZCBvdGhlclxuICogY2hlY2tzIHdpdGhpbiB0aGUgZnJhbWV3b3JrLlxuICpcbiAqIE9uZSBpbXBvcnRhbnQgYXNzZXJ0aW9uIHRoaXMgZGlzYWJsZXMgdmVyaWZpZXMgdGhhdCBhIGNoYW5nZSBkZXRlY3Rpb24gcGFzc1xuICogZG9lcyBub3QgcmVzdWx0IGluIGFkZGl0aW9uYWwgY2hhbmdlcyB0byBhbnkgYmluZGluZ3MgKGFsc28ga25vd24gYXNcbiAqIHVuaWRpcmVjdGlvbmFsIGRhdGEgZmxvdykuXG4gKlxuICogVXNpbmcgdGhpcyBtZXRob2QgaXMgZGlzY291cmFnZWQgYXMgdGhlIEFuZ3VsYXIgQ0xJIHdpbGwgc2V0IHByb2R1Y3Rpb24gbW9kZSB3aGVuIHVzaW5nIHRoZVxuICogYG9wdGltaXphdGlvbmAgb3B0aW9uLlxuICogQHNlZSB7QGxpbmsgY2xpL2J1aWxkIG5nIGJ1aWxkfVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVuYWJsZVByb2RNb2RlKCk6IHZvaWQge1xuICAvLyBUaGUgYmVsb3cgY2hlY2sgaXMgdGhlcmUgc28gd2hlbiBuZ0Rldk1vZGUgaXMgc2V0IHZpYSB0ZXJzZXJcbiAgLy8gYGdsb2JhbFsnbmdEZXZNb2RlJ10gPSBmYWxzZTtgIGlzIGFsc28gZHJvcHBlZC5cbiAgaWYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkge1xuICAgIGdsb2JhbFsnbmdEZXZNb2RlJ10gPSBmYWxzZTtcbiAgfVxufVxuIl19