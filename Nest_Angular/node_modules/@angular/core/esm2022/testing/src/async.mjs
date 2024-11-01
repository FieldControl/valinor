/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * Wraps a test function in an asynchronous test zone. The test will automatically
 * complete when all asynchronous calls within this zone are done. Can be used
 * to wrap an {@link inject} call.
 *
 * Example:
 *
 * ```
 * it('...', waitForAsync(inject([AClass], (object) => {
 *   object.doSomething.then(() => {
 *     expect(...);
 *   })
 * })));
 * ```
 *
 * @publicApi
 */
export function waitForAsync(fn) {
    const _Zone = typeof Zone !== 'undefined' ? Zone : null;
    if (!_Zone) {
        return function () {
            return Promise.reject('Zone is needed for the waitForAsync() test helper but could not be found. ' +
                'Please make sure that your environment includes zone.js');
        };
    }
    const asyncTest = _Zone && _Zone[_Zone.__symbol__('asyncTest')];
    if (typeof asyncTest === 'function') {
        return asyncTest(fn);
    }
    return function () {
        return Promise.reject('zone-testing.js is needed for the async() test helper but could not be found. ' +
            'Please make sure that your environment includes zone.js/testing');
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXN5bmMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3Rlc3Rpbmcvc3JjL2FzeW5jLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUNIOzs7Ozs7Ozs7Ozs7Ozs7O0dBZ0JHO0FBQ0gsTUFBTSxVQUFVLFlBQVksQ0FBQyxFQUFZO0lBQ3ZDLE1BQU0sS0FBSyxHQUFRLE9BQU8sSUFBSSxLQUFLLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7SUFDN0QsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ1gsT0FBTztZQUNMLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FDbkIsNEVBQTRFO2dCQUMxRSx5REFBeUQsQ0FDNUQsQ0FBQztRQUNKLENBQUMsQ0FBQztJQUNKLENBQUM7SUFDRCxNQUFNLFNBQVMsR0FBRyxLQUFLLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztJQUNoRSxJQUFJLE9BQU8sU0FBUyxLQUFLLFVBQVUsRUFBRSxDQUFDO1FBQ3BDLE9BQU8sU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3ZCLENBQUM7SUFDRCxPQUFPO1FBQ0wsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUNuQixnRkFBZ0Y7WUFDOUUsaUVBQWlFLENBQ3BFLENBQUM7SUFDSixDQUFDLENBQUM7QUFDSixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuLyoqXG4gKiBXcmFwcyBhIHRlc3QgZnVuY3Rpb24gaW4gYW4gYXN5bmNocm9ub3VzIHRlc3Qgem9uZS4gVGhlIHRlc3Qgd2lsbCBhdXRvbWF0aWNhbGx5XG4gKiBjb21wbGV0ZSB3aGVuIGFsbCBhc3luY2hyb25vdXMgY2FsbHMgd2l0aGluIHRoaXMgem9uZSBhcmUgZG9uZS4gQ2FuIGJlIHVzZWRcbiAqIHRvIHdyYXAgYW4ge0BsaW5rIGluamVjdH0gY2FsbC5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqIGBgYFxuICogaXQoJy4uLicsIHdhaXRGb3JBc3luYyhpbmplY3QoW0FDbGFzc10sIChvYmplY3QpID0+IHtcbiAqICAgb2JqZWN0LmRvU29tZXRoaW5nLnRoZW4oKCkgPT4ge1xuICogICAgIGV4cGVjdCguLi4pO1xuICogICB9KVxuICogfSkpKTtcbiAqIGBgYFxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdhaXRGb3JBc3luYyhmbjogRnVuY3Rpb24pOiAoZG9uZTogYW55KSA9PiBhbnkge1xuICBjb25zdCBfWm9uZTogYW55ID0gdHlwZW9mIFpvbmUgIT09ICd1bmRlZmluZWQnID8gWm9uZSA6IG51bGw7XG4gIGlmICghX1pvbmUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KFxuICAgICAgICAnWm9uZSBpcyBuZWVkZWQgZm9yIHRoZSB3YWl0Rm9yQXN5bmMoKSB0ZXN0IGhlbHBlciBidXQgY291bGQgbm90IGJlIGZvdW5kLiAnICtcbiAgICAgICAgICAnUGxlYXNlIG1ha2Ugc3VyZSB0aGF0IHlvdXIgZW52aXJvbm1lbnQgaW5jbHVkZXMgem9uZS5qcycsXG4gICAgICApO1xuICAgIH07XG4gIH1cbiAgY29uc3QgYXN5bmNUZXN0ID0gX1pvbmUgJiYgX1pvbmVbX1pvbmUuX19zeW1ib2xfXygnYXN5bmNUZXN0JyldO1xuICBpZiAodHlwZW9mIGFzeW5jVGVzdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBhc3luY1Rlc3QoZm4pO1xuICB9XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVqZWN0KFxuICAgICAgJ3pvbmUtdGVzdGluZy5qcyBpcyBuZWVkZWQgZm9yIHRoZSBhc3luYygpIHRlc3QgaGVscGVyIGJ1dCBjb3VsZCBub3QgYmUgZm91bmQuICcgK1xuICAgICAgICAnUGxlYXNlIG1ha2Ugc3VyZSB0aGF0IHlvdXIgZW52aXJvbm1lbnQgaW5jbHVkZXMgem9uZS5qcy90ZXN0aW5nJyxcbiAgICApO1xuICB9O1xufVxuIl19