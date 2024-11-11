/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * @fileoverview
 * A module to facilitate use of a Trusted Types policy internally within
 * Angular. It lazily constructs the Trusted Types policy, providing helper
 * utilities for promoting strings to Trusted Types. When Trusted Types are not
 * available, strings are used as a fallback.
 * @security All use of this module is security-sensitive and should go through
 * security review.
 */
import { global } from '../global';
/**
 * The Trusted Types policy, or null if Trusted Types are not
 * enabled/supported, or undefined if the policy has not been created yet.
 */
let policy;
/**
 * Returns the Trusted Types policy, or null if Trusted Types are not
 * enabled/supported. The first call to this function will create the policy.
 */
function getPolicy() {
    if (policy === undefined) {
        policy = null;
        if (global.trustedTypes) {
            try {
                policy = global.trustedTypes.createPolicy('angular', {
                    createHTML: (s) => s,
                    createScript: (s) => s,
                    createScriptURL: (s) => s,
                });
            }
            catch {
                // trustedTypes.createPolicy throws if called with a name that is
                // already registered, even in report-only mode. Until the API changes,
                // catch the error not to break the applications functionally. In such
                // cases, the code will fall back to using strings.
            }
        }
    }
    return policy;
}
/**
 * Unsafely promote a string to a TrustedHTML, falling back to strings when
 * Trusted Types are not available.
 * @security This is a security-sensitive function; any use of this function
 * must go through security review. In particular, it must be assured that the
 * provided string will never cause an XSS vulnerability if used in a context
 * that will be interpreted as HTML by a browser, e.g. when assigning to
 * element.innerHTML.
 */
export function trustedHTMLFromString(html) {
    return getPolicy()?.createHTML(html) || html;
}
/**
 * Unsafely promote a string to a TrustedScript, falling back to strings when
 * Trusted Types are not available.
 * @security In particular, it must be assured that the provided string will
 * never cause an XSS vulnerability if used in a context that will be
 * interpreted and executed as a script by a browser, e.g. when calling eval.
 */
export function trustedScriptFromString(script) {
    return getPolicy()?.createScript(script) || script;
}
/**
 * Unsafely promote a string to a TrustedScriptURL, falling back to strings
 * when Trusted Types are not available.
 * @security This is a security-sensitive function; any use of this function
 * must go through security review. In particular, it must be assured that the
 * provided string will never cause an XSS vulnerability if used in a context
 * that will cause a browser to load and execute a resource, e.g. when
 * assigning to script.src.
 */
export function trustedScriptURLFromString(url) {
    return getPolicy()?.createScriptURL(url) || url;
}
/**
 * Unsafely call the Function constructor with the given string arguments. It
 * is only available in development mode, and should be stripped out of
 * production code.
 * @security This is a security-sensitive function; any use of this function
 * must go through security review. In particular, it must be assured that it
 * is only called from development code, as use in production code can lead to
 * XSS vulnerabilities.
 */
export function newTrustedFunctionForDev(...args) {
    if (typeof ngDevMode === 'undefined') {
        throw new Error('newTrustedFunctionForDev should never be called in production');
    }
    if (!global.trustedTypes) {
        // In environments that don't support Trusted Types, fall back to the most
        // straightforward implementation:
        return new Function(...args);
    }
    // Chrome currently does not support passing TrustedScript to the Function
    // constructor. The following implements the workaround proposed on the page
    // below, where the Chromium bug is also referenced:
    // https://github.com/w3c/webappsec-trusted-types/wiki/Trusted-Types-for-function-constructor
    const fnArgs = args.slice(0, -1).join(',');
    const fnBody = args[args.length - 1];
    const body = `(function anonymous(${fnArgs}
) { ${fnBody}
})`;
    // Using eval directly confuses the compiler and prevents this module from
    // being stripped out of JS binaries even if not used. The global['eval']
    // indirection fixes that.
    const fn = global['eval'](trustedScriptFromString(body));
    if (fn.bind === undefined) {
        // Workaround for a browser bug that only exists in Chrome 83, where passing
        // a TrustedScript to eval just returns the TrustedScript back without
        // evaluating it. In that case, fall back to the most straightforward
        // implementation:
        return new Function(...args);
    }
    // To completely mimic the behavior of calling "new Function", two more
    // things need to happen:
    // 1. Stringifying the resulting function should return its source code
    fn.toString = () => body;
    // 2. When calling the resulting function, `this` should refer to `global`
    return fn.bind(global);
    // When Trusted Types support in Function constructors is widely available,
    // the implementation of this function can be simplified to:
    // return new Function(...args.map(a => trustedScriptFromString(a)));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJ1c3RlZF90eXBlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL3V0aWwvc2VjdXJpdHkvdHJ1c3RlZF90eXBlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSDs7Ozs7Ozs7R0FRRztBQUVILE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSxXQUFXLENBQUM7QUFVakM7OztHQUdHO0FBQ0gsSUFBSSxNQUE0QyxDQUFDO0FBRWpEOzs7R0FHRztBQUNILFNBQVMsU0FBUztJQUNoQixJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUUsQ0FBQztRQUN6QixNQUFNLEdBQUcsSUFBSSxDQUFDO1FBQ2QsSUFBSSxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDeEIsSUFBSSxDQUFDO2dCQUNILE1BQU0sR0FBSSxNQUFNLENBQUMsWUFBeUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxFQUFFO29CQUNqRixVQUFVLEVBQUUsQ0FBQyxDQUFTLEVBQUUsRUFBRSxDQUFDLENBQUM7b0JBQzVCLFlBQVksRUFBRSxDQUFDLENBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQztvQkFDOUIsZUFBZSxFQUFFLENBQUMsQ0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2lCQUNsQyxDQUFDLENBQUM7WUFDTCxDQUFDO1lBQUMsTUFBTSxDQUFDO2dCQUNQLGlFQUFpRTtnQkFDakUsdUVBQXVFO2dCQUN2RSxzRUFBc0U7Z0JBQ3RFLG1EQUFtRDtZQUNyRCxDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7SUFDRCxPQUFPLE1BQU0sQ0FBQztBQUNoQixDQUFDO0FBRUQ7Ozs7Ozs7O0dBUUc7QUFDSCxNQUFNLFVBQVUscUJBQXFCLENBQUMsSUFBWTtJQUNoRCxPQUFPLFNBQVMsRUFBRSxFQUFFLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUM7QUFDL0MsQ0FBQztBQUVEOzs7Ozs7R0FNRztBQUNILE1BQU0sVUFBVSx1QkFBdUIsQ0FBQyxNQUFjO0lBQ3BELE9BQU8sU0FBUyxFQUFFLEVBQUUsWUFBWSxDQUFDLE1BQU0sQ0FBQyxJQUFJLE1BQU0sQ0FBQztBQUNyRCxDQUFDO0FBRUQ7Ozs7Ozs7O0dBUUc7QUFDSCxNQUFNLFVBQVUsMEJBQTBCLENBQUMsR0FBVztJQUNwRCxPQUFPLFNBQVMsRUFBRSxFQUFFLGVBQWUsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUM7QUFDbEQsQ0FBQztBQUVEOzs7Ozs7OztHQVFHO0FBQ0gsTUFBTSxVQUFVLHdCQUF3QixDQUFDLEdBQUcsSUFBYztJQUN4RCxJQUFJLE9BQU8sU0FBUyxLQUFLLFdBQVcsRUFBRSxDQUFDO1FBQ3JDLE1BQU0sSUFBSSxLQUFLLENBQUMsK0RBQStELENBQUMsQ0FBQztJQUNuRixDQUFDO0lBQ0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUN6QiwwRUFBMEU7UUFDMUUsa0NBQWtDO1FBQ2xDLE9BQU8sSUFBSSxRQUFRLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRUQsMEVBQTBFO0lBQzFFLDRFQUE0RTtJQUM1RSxvREFBb0Q7SUFDcEQsNkZBQTZGO0lBQzdGLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzNDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ3JDLE1BQU0sSUFBSSxHQUFHLHVCQUF1QixNQUFNO01BQ3RDLE1BQU07R0FDVCxDQUFDO0lBRUYsMEVBQTBFO0lBQzFFLHlFQUF5RTtJQUN6RSwwQkFBMEI7SUFDMUIsTUFBTSxFQUFFLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxDQUFhLENBQUM7SUFDckUsSUFBSSxFQUFFLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFBRSxDQUFDO1FBQzFCLDRFQUE0RTtRQUM1RSxzRUFBc0U7UUFDdEUscUVBQXFFO1FBQ3JFLGtCQUFrQjtRQUNsQixPQUFPLElBQUksUUFBUSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDL0IsQ0FBQztJQUVELHVFQUF1RTtJQUN2RSx5QkFBeUI7SUFDekIsdUVBQXVFO0lBQ3ZFLEVBQUUsQ0FBQyxRQUFRLEdBQUcsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDO0lBQ3pCLDBFQUEwRTtJQUMxRSxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFFdkIsMkVBQTJFO0lBQzNFLDREQUE0RDtJQUM1RCxxRUFBcUU7QUFDdkUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3XG4gKiBBIG1vZHVsZSB0byBmYWNpbGl0YXRlIHVzZSBvZiBhIFRydXN0ZWQgVHlwZXMgcG9saWN5IGludGVybmFsbHkgd2l0aGluXG4gKiBBbmd1bGFyLiBJdCBsYXppbHkgY29uc3RydWN0cyB0aGUgVHJ1c3RlZCBUeXBlcyBwb2xpY3ksIHByb3ZpZGluZyBoZWxwZXJcbiAqIHV0aWxpdGllcyBmb3IgcHJvbW90aW5nIHN0cmluZ3MgdG8gVHJ1c3RlZCBUeXBlcy4gV2hlbiBUcnVzdGVkIFR5cGVzIGFyZSBub3RcbiAqIGF2YWlsYWJsZSwgc3RyaW5ncyBhcmUgdXNlZCBhcyBhIGZhbGxiYWNrLlxuICogQHNlY3VyaXR5IEFsbCB1c2Ugb2YgdGhpcyBtb2R1bGUgaXMgc2VjdXJpdHktc2Vuc2l0aXZlIGFuZCBzaG91bGQgZ28gdGhyb3VnaFxuICogc2VjdXJpdHkgcmV2aWV3LlxuICovXG5cbmltcG9ydCB7Z2xvYmFsfSBmcm9tICcuLi9nbG9iYWwnO1xuXG5pbXBvcnQge1xuICBUcnVzdGVkSFRNTCxcbiAgVHJ1c3RlZFNjcmlwdCxcbiAgVHJ1c3RlZFNjcmlwdFVSTCxcbiAgVHJ1c3RlZFR5cGVQb2xpY3ksXG4gIFRydXN0ZWRUeXBlUG9saWN5RmFjdG9yeSxcbn0gZnJvbSAnLi90cnVzdGVkX3R5cGVfZGVmcyc7XG5cbi8qKlxuICogVGhlIFRydXN0ZWQgVHlwZXMgcG9saWN5LCBvciBudWxsIGlmIFRydXN0ZWQgVHlwZXMgYXJlIG5vdFxuICogZW5hYmxlZC9zdXBwb3J0ZWQsIG9yIHVuZGVmaW5lZCBpZiB0aGUgcG9saWN5IGhhcyBub3QgYmVlbiBjcmVhdGVkIHlldC5cbiAqL1xubGV0IHBvbGljeTogVHJ1c3RlZFR5cGVQb2xpY3kgfCBudWxsIHwgdW5kZWZpbmVkO1xuXG4vKipcbiAqIFJldHVybnMgdGhlIFRydXN0ZWQgVHlwZXMgcG9saWN5LCBvciBudWxsIGlmIFRydXN0ZWQgVHlwZXMgYXJlIG5vdFxuICogZW5hYmxlZC9zdXBwb3J0ZWQuIFRoZSBmaXJzdCBjYWxsIHRvIHRoaXMgZnVuY3Rpb24gd2lsbCBjcmVhdGUgdGhlIHBvbGljeS5cbiAqL1xuZnVuY3Rpb24gZ2V0UG9saWN5KCk6IFRydXN0ZWRUeXBlUG9saWN5IHwgbnVsbCB7XG4gIGlmIChwb2xpY3kgPT09IHVuZGVmaW5lZCkge1xuICAgIHBvbGljeSA9IG51bGw7XG4gICAgaWYgKGdsb2JhbC50cnVzdGVkVHlwZXMpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHBvbGljeSA9IChnbG9iYWwudHJ1c3RlZFR5cGVzIGFzIFRydXN0ZWRUeXBlUG9saWN5RmFjdG9yeSkuY3JlYXRlUG9saWN5KCdhbmd1bGFyJywge1xuICAgICAgICAgIGNyZWF0ZUhUTUw6IChzOiBzdHJpbmcpID0+IHMsXG4gICAgICAgICAgY3JlYXRlU2NyaXB0OiAoczogc3RyaW5nKSA9PiBzLFxuICAgICAgICAgIGNyZWF0ZVNjcmlwdFVSTDogKHM6IHN0cmluZykgPT4gcyxcbiAgICAgICAgfSk7XG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgLy8gdHJ1c3RlZFR5cGVzLmNyZWF0ZVBvbGljeSB0aHJvd3MgaWYgY2FsbGVkIHdpdGggYSBuYW1lIHRoYXQgaXNcbiAgICAgICAgLy8gYWxyZWFkeSByZWdpc3RlcmVkLCBldmVuIGluIHJlcG9ydC1vbmx5IG1vZGUuIFVudGlsIHRoZSBBUEkgY2hhbmdlcyxcbiAgICAgICAgLy8gY2F0Y2ggdGhlIGVycm9yIG5vdCB0byBicmVhayB0aGUgYXBwbGljYXRpb25zIGZ1bmN0aW9uYWxseS4gSW4gc3VjaFxuICAgICAgICAvLyBjYXNlcywgdGhlIGNvZGUgd2lsbCBmYWxsIGJhY2sgdG8gdXNpbmcgc3RyaW5ncy5cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHBvbGljeTtcbn1cblxuLyoqXG4gKiBVbnNhZmVseSBwcm9tb3RlIGEgc3RyaW5nIHRvIGEgVHJ1c3RlZEhUTUwsIGZhbGxpbmcgYmFjayB0byBzdHJpbmdzIHdoZW5cbiAqIFRydXN0ZWQgVHlwZXMgYXJlIG5vdCBhdmFpbGFibGUuXG4gKiBAc2VjdXJpdHkgVGhpcyBpcyBhIHNlY3VyaXR5LXNlbnNpdGl2ZSBmdW5jdGlvbjsgYW55IHVzZSBvZiB0aGlzIGZ1bmN0aW9uXG4gKiBtdXN0IGdvIHRocm91Z2ggc2VjdXJpdHkgcmV2aWV3LiBJbiBwYXJ0aWN1bGFyLCBpdCBtdXN0IGJlIGFzc3VyZWQgdGhhdCB0aGVcbiAqIHByb3ZpZGVkIHN0cmluZyB3aWxsIG5ldmVyIGNhdXNlIGFuIFhTUyB2dWxuZXJhYmlsaXR5IGlmIHVzZWQgaW4gYSBjb250ZXh0XG4gKiB0aGF0IHdpbGwgYmUgaW50ZXJwcmV0ZWQgYXMgSFRNTCBieSBhIGJyb3dzZXIsIGUuZy4gd2hlbiBhc3NpZ25pbmcgdG9cbiAqIGVsZW1lbnQuaW5uZXJIVE1MLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJ1c3RlZEhUTUxGcm9tU3RyaW5nKGh0bWw6IHN0cmluZyk6IFRydXN0ZWRIVE1MIHwgc3RyaW5nIHtcbiAgcmV0dXJuIGdldFBvbGljeSgpPy5jcmVhdGVIVE1MKGh0bWwpIHx8IGh0bWw7XG59XG5cbi8qKlxuICogVW5zYWZlbHkgcHJvbW90ZSBhIHN0cmluZyB0byBhIFRydXN0ZWRTY3JpcHQsIGZhbGxpbmcgYmFjayB0byBzdHJpbmdzIHdoZW5cbiAqIFRydXN0ZWQgVHlwZXMgYXJlIG5vdCBhdmFpbGFibGUuXG4gKiBAc2VjdXJpdHkgSW4gcGFydGljdWxhciwgaXQgbXVzdCBiZSBhc3N1cmVkIHRoYXQgdGhlIHByb3ZpZGVkIHN0cmluZyB3aWxsXG4gKiBuZXZlciBjYXVzZSBhbiBYU1MgdnVsbmVyYWJpbGl0eSBpZiB1c2VkIGluIGEgY29udGV4dCB0aGF0IHdpbGwgYmVcbiAqIGludGVycHJldGVkIGFuZCBleGVjdXRlZCBhcyBhIHNjcmlwdCBieSBhIGJyb3dzZXIsIGUuZy4gd2hlbiBjYWxsaW5nIGV2YWwuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cnVzdGVkU2NyaXB0RnJvbVN0cmluZyhzY3JpcHQ6IHN0cmluZyk6IFRydXN0ZWRTY3JpcHQgfCBzdHJpbmcge1xuICByZXR1cm4gZ2V0UG9saWN5KCk/LmNyZWF0ZVNjcmlwdChzY3JpcHQpIHx8IHNjcmlwdDtcbn1cblxuLyoqXG4gKiBVbnNhZmVseSBwcm9tb3RlIGEgc3RyaW5nIHRvIGEgVHJ1c3RlZFNjcmlwdFVSTCwgZmFsbGluZyBiYWNrIHRvIHN0cmluZ3NcbiAqIHdoZW4gVHJ1c3RlZCBUeXBlcyBhcmUgbm90IGF2YWlsYWJsZS5cbiAqIEBzZWN1cml0eSBUaGlzIGlzIGEgc2VjdXJpdHktc2Vuc2l0aXZlIGZ1bmN0aW9uOyBhbnkgdXNlIG9mIHRoaXMgZnVuY3Rpb25cbiAqIG11c3QgZ28gdGhyb3VnaCBzZWN1cml0eSByZXZpZXcuIEluIHBhcnRpY3VsYXIsIGl0IG11c3QgYmUgYXNzdXJlZCB0aGF0IHRoZVxuICogcHJvdmlkZWQgc3RyaW5nIHdpbGwgbmV2ZXIgY2F1c2UgYW4gWFNTIHZ1bG5lcmFiaWxpdHkgaWYgdXNlZCBpbiBhIGNvbnRleHRcbiAqIHRoYXQgd2lsbCBjYXVzZSBhIGJyb3dzZXIgdG8gbG9hZCBhbmQgZXhlY3V0ZSBhIHJlc291cmNlLCBlLmcuIHdoZW5cbiAqIGFzc2lnbmluZyB0byBzY3JpcHQuc3JjLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJ1c3RlZFNjcmlwdFVSTEZyb21TdHJpbmcodXJsOiBzdHJpbmcpOiBUcnVzdGVkU2NyaXB0VVJMIHwgc3RyaW5nIHtcbiAgcmV0dXJuIGdldFBvbGljeSgpPy5jcmVhdGVTY3JpcHRVUkwodXJsKSB8fCB1cmw7XG59XG5cbi8qKlxuICogVW5zYWZlbHkgY2FsbCB0aGUgRnVuY3Rpb24gY29uc3RydWN0b3Igd2l0aCB0aGUgZ2l2ZW4gc3RyaW5nIGFyZ3VtZW50cy4gSXRcbiAqIGlzIG9ubHkgYXZhaWxhYmxlIGluIGRldmVsb3BtZW50IG1vZGUsIGFuZCBzaG91bGQgYmUgc3RyaXBwZWQgb3V0IG9mXG4gKiBwcm9kdWN0aW9uIGNvZGUuXG4gKiBAc2VjdXJpdHkgVGhpcyBpcyBhIHNlY3VyaXR5LXNlbnNpdGl2ZSBmdW5jdGlvbjsgYW55IHVzZSBvZiB0aGlzIGZ1bmN0aW9uXG4gKiBtdXN0IGdvIHRocm91Z2ggc2VjdXJpdHkgcmV2aWV3LiBJbiBwYXJ0aWN1bGFyLCBpdCBtdXN0IGJlIGFzc3VyZWQgdGhhdCBpdFxuICogaXMgb25seSBjYWxsZWQgZnJvbSBkZXZlbG9wbWVudCBjb2RlLCBhcyB1c2UgaW4gcHJvZHVjdGlvbiBjb2RlIGNhbiBsZWFkIHRvXG4gKiBYU1MgdnVsbmVyYWJpbGl0aWVzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbmV3VHJ1c3RlZEZ1bmN0aW9uRm9yRGV2KC4uLmFyZ3M6IHN0cmluZ1tdKTogRnVuY3Rpb24ge1xuICBpZiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ25ld1RydXN0ZWRGdW5jdGlvbkZvckRldiBzaG91bGQgbmV2ZXIgYmUgY2FsbGVkIGluIHByb2R1Y3Rpb24nKTtcbiAgfVxuICBpZiAoIWdsb2JhbC50cnVzdGVkVHlwZXMpIHtcbiAgICAvLyBJbiBlbnZpcm9ubWVudHMgdGhhdCBkb24ndCBzdXBwb3J0IFRydXN0ZWQgVHlwZXMsIGZhbGwgYmFjayB0byB0aGUgbW9zdFxuICAgIC8vIHN0cmFpZ2h0Zm9yd2FyZCBpbXBsZW1lbnRhdGlvbjpcbiAgICByZXR1cm4gbmV3IEZ1bmN0aW9uKC4uLmFyZ3MpO1xuICB9XG5cbiAgLy8gQ2hyb21lIGN1cnJlbnRseSBkb2VzIG5vdCBzdXBwb3J0IHBhc3NpbmcgVHJ1c3RlZFNjcmlwdCB0byB0aGUgRnVuY3Rpb25cbiAgLy8gY29uc3RydWN0b3IuIFRoZSBmb2xsb3dpbmcgaW1wbGVtZW50cyB0aGUgd29ya2Fyb3VuZCBwcm9wb3NlZCBvbiB0aGUgcGFnZVxuICAvLyBiZWxvdywgd2hlcmUgdGhlIENocm9taXVtIGJ1ZyBpcyBhbHNvIHJlZmVyZW5jZWQ6XG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS93M2Mvd2ViYXBwc2VjLXRydXN0ZWQtdHlwZXMvd2lraS9UcnVzdGVkLVR5cGVzLWZvci1mdW5jdGlvbi1jb25zdHJ1Y3RvclxuICBjb25zdCBmbkFyZ3MgPSBhcmdzLnNsaWNlKDAsIC0xKS5qb2luKCcsJyk7XG4gIGNvbnN0IGZuQm9keSA9IGFyZ3NbYXJncy5sZW5ndGggLSAxXTtcbiAgY29uc3QgYm9keSA9IGAoZnVuY3Rpb24gYW5vbnltb3VzKCR7Zm5BcmdzfVxuKSB7ICR7Zm5Cb2R5fVxufSlgO1xuXG4gIC8vIFVzaW5nIGV2YWwgZGlyZWN0bHkgY29uZnVzZXMgdGhlIGNvbXBpbGVyIGFuZCBwcmV2ZW50cyB0aGlzIG1vZHVsZSBmcm9tXG4gIC8vIGJlaW5nIHN0cmlwcGVkIG91dCBvZiBKUyBiaW5hcmllcyBldmVuIGlmIG5vdCB1c2VkLiBUaGUgZ2xvYmFsWydldmFsJ11cbiAgLy8gaW5kaXJlY3Rpb24gZml4ZXMgdGhhdC5cbiAgY29uc3QgZm4gPSBnbG9iYWxbJ2V2YWwnXSh0cnVzdGVkU2NyaXB0RnJvbVN0cmluZyhib2R5KSkgYXMgRnVuY3Rpb247XG4gIGlmIChmbi5iaW5kID09PSB1bmRlZmluZWQpIHtcbiAgICAvLyBXb3JrYXJvdW5kIGZvciBhIGJyb3dzZXIgYnVnIHRoYXQgb25seSBleGlzdHMgaW4gQ2hyb21lIDgzLCB3aGVyZSBwYXNzaW5nXG4gICAgLy8gYSBUcnVzdGVkU2NyaXB0IHRvIGV2YWwganVzdCByZXR1cm5zIHRoZSBUcnVzdGVkU2NyaXB0IGJhY2sgd2l0aG91dFxuICAgIC8vIGV2YWx1YXRpbmcgaXQuIEluIHRoYXQgY2FzZSwgZmFsbCBiYWNrIHRvIHRoZSBtb3N0IHN0cmFpZ2h0Zm9yd2FyZFxuICAgIC8vIGltcGxlbWVudGF0aW9uOlxuICAgIHJldHVybiBuZXcgRnVuY3Rpb24oLi4uYXJncyk7XG4gIH1cblxuICAvLyBUbyBjb21wbGV0ZWx5IG1pbWljIHRoZSBiZWhhdmlvciBvZiBjYWxsaW5nIFwibmV3IEZ1bmN0aW9uXCIsIHR3byBtb3JlXG4gIC8vIHRoaW5ncyBuZWVkIHRvIGhhcHBlbjpcbiAgLy8gMS4gU3RyaW5naWZ5aW5nIHRoZSByZXN1bHRpbmcgZnVuY3Rpb24gc2hvdWxkIHJldHVybiBpdHMgc291cmNlIGNvZGVcbiAgZm4udG9TdHJpbmcgPSAoKSA9PiBib2R5O1xuICAvLyAyLiBXaGVuIGNhbGxpbmcgdGhlIHJlc3VsdGluZyBmdW5jdGlvbiwgYHRoaXNgIHNob3VsZCByZWZlciB0byBgZ2xvYmFsYFxuICByZXR1cm4gZm4uYmluZChnbG9iYWwpO1xuXG4gIC8vIFdoZW4gVHJ1c3RlZCBUeXBlcyBzdXBwb3J0IGluIEZ1bmN0aW9uIGNvbnN0cnVjdG9ycyBpcyB3aWRlbHkgYXZhaWxhYmxlLFxuICAvLyB0aGUgaW1wbGVtZW50YXRpb24gb2YgdGhpcyBmdW5jdGlvbiBjYW4gYmUgc2ltcGxpZmllZCB0bzpcbiAgLy8gcmV0dXJuIG5ldyBGdW5jdGlvbiguLi5hcmdzLm1hcChhID0+IHRydXN0ZWRTY3JpcHRGcm9tU3RyaW5nKGEpKSk7XG59XG4iXX0=