/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ɵwithHttpTransferCache } from '@angular/common/http';
import { ENVIRONMENT_INITIALIZER, inject, makeEnvironmentProviders, NgZone, ɵConsole as Console, ɵformatRuntimeError as formatRuntimeError, ɵwithDomHydration as withDomHydration, ɵwithEventReplay, ɵwithI18nSupport, } from '@angular/core';
/**
 * The list of features as an enum to uniquely type each `HydrationFeature`.
 * @see {@link HydrationFeature}
 *
 * @publicApi
 */
export var HydrationFeatureKind;
(function (HydrationFeatureKind) {
    HydrationFeatureKind[HydrationFeatureKind["NoHttpTransferCache"] = 0] = "NoHttpTransferCache";
    HydrationFeatureKind[HydrationFeatureKind["HttpTransferCacheOptions"] = 1] = "HttpTransferCacheOptions";
    HydrationFeatureKind[HydrationFeatureKind["I18nSupport"] = 2] = "I18nSupport";
    HydrationFeatureKind[HydrationFeatureKind["EventReplay"] = 3] = "EventReplay";
})(HydrationFeatureKind || (HydrationFeatureKind = {}));
/**
 * Helper function to create an object that represents a Hydration feature.
 */
function hydrationFeature(ɵkind, ɵproviders = [], ɵoptions = {}) {
    return { ɵkind, ɵproviders };
}
/**
 * Disables HTTP transfer cache. Effectively causes HTTP requests to be performed twice: once on the
 * server and other one on the browser.
 *
 * @publicApi
 */
export function withNoHttpTransferCache() {
    // This feature has no providers and acts as a flag that turns off
    // HTTP transfer cache (which otherwise is turned on by default).
    return hydrationFeature(HydrationFeatureKind.NoHttpTransferCache);
}
/**
 * The function accepts a an object, which allows to configure cache parameters,
 * such as which headers should be included (no headers are included by default),
 * wether POST requests should be cached or a callback function to determine if a
 * particular request should be cached.
 *
 * @publicApi
 */
export function withHttpTransferCacheOptions(options) {
    // This feature has no providers and acts as a flag to pass options to the HTTP transfer cache.
    return hydrationFeature(HydrationFeatureKind.HttpTransferCacheOptions, ɵwithHttpTransferCache(options));
}
/**
 * Enables support for hydrating i18n blocks.
 *
 * @developerPreview
 * @publicApi
 */
export function withI18nSupport() {
    return hydrationFeature(HydrationFeatureKind.I18nSupport, ɵwithI18nSupport());
}
/**
 * Enables support for replaying user events (e.g. `click`s) that happened on a page
 * before hydration logic has completed. Once an application is hydrated, all captured
 * events are replayed and relevant event listeners are executed.
 *
 * @usageNotes
 *
 * Basic example of how you can enable event replay in your application when
 * `bootstrapApplication` function is used:
 * ```
 * bootstrapApplication(AppComponent, {
 *   providers: [provideClientHydration(withEventReplay())]
 * });
 * ```
 * @developerPreview
 * @publicApi
 * @see {@link provideClientHydration}
 */
export function withEventReplay() {
    return hydrationFeature(HydrationFeatureKind.EventReplay, ɵwithEventReplay());
}
/**
 * Returns an `ENVIRONMENT_INITIALIZER` token setup with a function
 * that verifies whether compatible ZoneJS was used in an application
 * and logs a warning in a console if it's not the case.
 */
function provideZoneJsCompatibilityDetector() {
    return [
        {
            provide: ENVIRONMENT_INITIALIZER,
            useValue: () => {
                const ngZone = inject(NgZone);
                // Checking `ngZone instanceof NgZone` would be insufficient here,
                // because custom implementations might use NgZone as a base class.
                if (ngZone.constructor !== NgZone) {
                    const console = inject(Console);
                    const message = formatRuntimeError(-5000 /* RuntimeErrorCode.UNSUPPORTED_ZONEJS_INSTANCE */, 'Angular detected that hydration was enabled for an application ' +
                        'that uses a custom or a noop Zone.js implementation. ' +
                        'This is not yet a fully supported configuration.');
                    // tslint:disable-next-line:no-console
                    console.warn(message);
                }
            },
            multi: true,
        },
    ];
}
/**
 * Sets up providers necessary to enable hydration functionality for the application.
 *
 * By default, the function enables the recommended set of features for the optimal
 * performance for most of the applications. It includes the following features:
 *
 * * Reconciling DOM hydration. Learn more about it [here](guide/hydration).
 * * [`HttpClient`](api/common/http/HttpClient) response caching while running on the server and
 * transferring this cache to the client to avoid extra HTTP requests. Learn more about data caching
 * [here](guide/ssr#caching-data-when-using-httpclient).
 *
 * These functions allow you to disable some of the default features or configure features
 * * {@link withNoHttpTransferCache} to disable HTTP transfer cache
 * * {@link withHttpTransferCacheOptions} to configure some HTTP transfer cache options
 *
 * @usageNotes
 *
 * Basic example of how you can enable hydration in your application when
 * `bootstrapApplication` function is used:
 * ```
 * bootstrapApplication(AppComponent, {
 *   providers: [provideClientHydration()]
 * });
 * ```
 *
 * Alternatively if you are using NgModules, you would add `provideClientHydration`
 * to your root app module's provider list.
 * ```
 * @NgModule({
 *   declarations: [RootCmp],
 *   bootstrap: [RootCmp],
 *   providers: [provideClientHydration()],
 * })
 * export class AppModule {}
 * ```
 *
 * @see {@link withNoHttpTransferCache}
 * @see {@link withHttpTransferCacheOptions}
 *
 * @param features Optional features to configure additional router behaviors.
 * @returns A set of providers to enable hydration.
 *
 * @publicApi
 */
export function provideClientHydration(...features) {
    const providers = [];
    const featuresKind = new Set();
    const hasHttpTransferCacheOptions = featuresKind.has(HydrationFeatureKind.HttpTransferCacheOptions);
    for (const { ɵproviders, ɵkind } of features) {
        featuresKind.add(ɵkind);
        if (ɵproviders.length) {
            providers.push(ɵproviders);
        }
    }
    if (typeof ngDevMode !== 'undefined' &&
        ngDevMode &&
        featuresKind.has(HydrationFeatureKind.NoHttpTransferCache) &&
        hasHttpTransferCacheOptions) {
        // TODO: Make this a runtime error
        throw new Error('Configuration error: found both withHttpTransferCacheOptions() and withNoHttpTransferCache() in the same call to provideClientHydration(), which is a contradiction.');
    }
    return makeEnvironmentProviders([
        typeof ngDevMode !== 'undefined' && ngDevMode ? provideZoneJsCompatibilityDetector() : [],
        withDomHydration(),
        featuresKind.has(HydrationFeatureKind.NoHttpTransferCache) || hasHttpTransferCacheOptions
            ? []
            : ɵwithHttpTransferCache({}),
        providers,
    ]);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHlkcmF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvcGxhdGZvcm0tYnJvd3Nlci9zcmMvaHlkcmF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBMkIsc0JBQXNCLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUN0RixPQUFPLEVBQ0wsdUJBQXVCLEVBRXZCLE1BQU0sRUFDTix3QkFBd0IsRUFDeEIsTUFBTSxFQUVOLFFBQVEsSUFBSSxPQUFPLEVBQ25CLG1CQUFtQixJQUFJLGtCQUFrQixFQUN6QyxpQkFBaUIsSUFBSSxnQkFBZ0IsRUFDckMsZ0JBQWdCLEVBQ2hCLGdCQUFnQixHQUNqQixNQUFNLGVBQWUsQ0FBQztBQUl2Qjs7Ozs7R0FLRztBQUNILE1BQU0sQ0FBTixJQUFZLG9CQUtYO0FBTEQsV0FBWSxvQkFBb0I7SUFDOUIsNkZBQW1CLENBQUE7SUFDbkIsdUdBQXdCLENBQUE7SUFDeEIsNkVBQVcsQ0FBQTtJQUNYLDZFQUFXLENBQUE7QUFDYixDQUFDLEVBTFcsb0JBQW9CLEtBQXBCLG9CQUFvQixRQUsvQjtBQVlEOztHQUVHO0FBQ0gsU0FBUyxnQkFBZ0IsQ0FDdkIsS0FBa0IsRUFDbEIsYUFBeUIsRUFBRSxFQUMzQixXQUFvQixFQUFFO0lBRXRCLE9BQU8sRUFBQyxLQUFLLEVBQUUsVUFBVSxFQUFDLENBQUM7QUFDN0IsQ0FBQztBQUVEOzs7OztHQUtHO0FBQ0gsTUFBTSxVQUFVLHVCQUF1QjtJQUNyQyxrRUFBa0U7SUFDbEUsaUVBQWlFO0lBQ2pFLE9BQU8sZ0JBQWdCLENBQUMsb0JBQW9CLENBQUMsbUJBQW1CLENBQUMsQ0FBQztBQUNwRSxDQUFDO0FBRUQ7Ozs7Ozs7R0FPRztBQUNILE1BQU0sVUFBVSw0QkFBNEIsQ0FDMUMsT0FBaUM7SUFFakMsK0ZBQStGO0lBQy9GLE9BQU8sZ0JBQWdCLENBQ3JCLG9CQUFvQixDQUFDLHdCQUF3QixFQUM3QyxzQkFBc0IsQ0FBQyxPQUFPLENBQUMsQ0FDaEMsQ0FBQztBQUNKLENBQUM7QUFFRDs7Ozs7R0FLRztBQUNILE1BQU0sVUFBVSxlQUFlO0lBQzdCLE9BQU8sZ0JBQWdCLENBQUMsb0JBQW9CLENBQUMsV0FBVyxFQUFFLGdCQUFnQixFQUFFLENBQUMsQ0FBQztBQUNoRixDQUFDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBaUJHO0FBQ0gsTUFBTSxVQUFVLGVBQWU7SUFDN0IsT0FBTyxnQkFBZ0IsQ0FBQyxvQkFBb0IsQ0FBQyxXQUFXLEVBQUUsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDO0FBQ2hGLENBQUM7QUFFRDs7OztHQUlHO0FBQ0gsU0FBUyxrQ0FBa0M7SUFDekMsT0FBTztRQUNMO1lBQ0UsT0FBTyxFQUFFLHVCQUF1QjtZQUNoQyxRQUFRLEVBQUUsR0FBRyxFQUFFO2dCQUNiLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDOUIsa0VBQWtFO2dCQUNsRSxtRUFBbUU7Z0JBQ25FLElBQUksTUFBTSxDQUFDLFdBQVcsS0FBSyxNQUFNLEVBQUUsQ0FBQztvQkFDbEMsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUNoQyxNQUFNLE9BQU8sR0FBRyxrQkFBa0IsMkRBRWhDLGlFQUFpRTt3QkFDL0QsdURBQXVEO3dCQUN2RCxrREFBa0QsQ0FDckQsQ0FBQztvQkFDRixzQ0FBc0M7b0JBQ3RDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3hCLENBQUM7WUFDSCxDQUFDO1lBQ0QsS0FBSyxFQUFFLElBQUk7U0FDWjtLQUNGLENBQUM7QUFDSixDQUFDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0EyQ0c7QUFDSCxNQUFNLFVBQVUsc0JBQXNCLENBQ3BDLEdBQUcsUUFBa0Q7SUFFckQsTUFBTSxTQUFTLEdBQWUsRUFBRSxDQUFDO0lBQ2pDLE1BQU0sWUFBWSxHQUFHLElBQUksR0FBRyxFQUF3QixDQUFDO0lBQ3JELE1BQU0sMkJBQTJCLEdBQUcsWUFBWSxDQUFDLEdBQUcsQ0FDbEQsb0JBQW9CLENBQUMsd0JBQXdCLENBQzlDLENBQUM7SUFFRixLQUFLLE1BQU0sRUFBQyxVQUFVLEVBQUUsS0FBSyxFQUFDLElBQUksUUFBUSxFQUFFLENBQUM7UUFDM0MsWUFBWSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUV4QixJQUFJLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUN0QixTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzdCLENBQUM7SUFDSCxDQUFDO0lBRUQsSUFDRSxPQUFPLFNBQVMsS0FBSyxXQUFXO1FBQ2hDLFNBQVM7UUFDVCxZQUFZLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDLG1CQUFtQixDQUFDO1FBQzFELDJCQUEyQixFQUMzQixDQUFDO1FBQ0Qsa0NBQWtDO1FBQ2xDLE1BQU0sSUFBSSxLQUFLLENBQ2Isc0tBQXNLLENBQ3ZLLENBQUM7SUFDSixDQUFDO0lBRUQsT0FBTyx3QkFBd0IsQ0FBQztRQUM5QixPQUFPLFNBQVMsS0FBSyxXQUFXLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxrQ0FBa0MsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFO1FBQ3pGLGdCQUFnQixFQUFFO1FBQ2xCLFlBQVksQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsbUJBQW1CLENBQUMsSUFBSSwyQkFBMkI7WUFDdkYsQ0FBQyxDQUFDLEVBQUU7WUFDSixDQUFDLENBQUMsc0JBQXNCLENBQUMsRUFBRSxDQUFDO1FBQzlCLFNBQVM7S0FDVixDQUFDLENBQUM7QUFDTCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SHR0cFRyYW5zZmVyQ2FjaGVPcHRpb25zLCDJtXdpdGhIdHRwVHJhbnNmZXJDYWNoZX0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uL2h0dHAnO1xuaW1wb3J0IHtcbiAgRU5WSVJPTk1FTlRfSU5JVElBTElaRVIsXG4gIEVudmlyb25tZW50UHJvdmlkZXJzLFxuICBpbmplY3QsXG4gIG1ha2VFbnZpcm9ubWVudFByb3ZpZGVycyxcbiAgTmdab25lLFxuICBQcm92aWRlcixcbiAgybVDb25zb2xlIGFzIENvbnNvbGUsXG4gIMm1Zm9ybWF0UnVudGltZUVycm9yIGFzIGZvcm1hdFJ1bnRpbWVFcnJvcixcbiAgybV3aXRoRG9tSHlkcmF0aW9uIGFzIHdpdGhEb21IeWRyYXRpb24sXG4gIMm1d2l0aEV2ZW50UmVwbGF5LFxuICDJtXdpdGhJMThuU3VwcG9ydCxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7UnVudGltZUVycm9yQ29kZX0gZnJvbSAnLi9lcnJvcnMnO1xuXG4vKipcbiAqIFRoZSBsaXN0IG9mIGZlYXR1cmVzIGFzIGFuIGVudW0gdG8gdW5pcXVlbHkgdHlwZSBlYWNoIGBIeWRyYXRpb25GZWF0dXJlYC5cbiAqIEBzZWUge0BsaW5rIEh5ZHJhdGlvbkZlYXR1cmV9XG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZW51bSBIeWRyYXRpb25GZWF0dXJlS2luZCB7XG4gIE5vSHR0cFRyYW5zZmVyQ2FjaGUsXG4gIEh0dHBUcmFuc2ZlckNhY2hlT3B0aW9ucyxcbiAgSTE4blN1cHBvcnQsXG4gIEV2ZW50UmVwbGF5LFxufVxuXG4vKipcbiAqIEhlbHBlciB0eXBlIHRvIHJlcHJlc2VudCBhIEh5ZHJhdGlvbiBmZWF0dXJlLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBIeWRyYXRpb25GZWF0dXJlPEZlYXR1cmVLaW5kIGV4dGVuZHMgSHlkcmF0aW9uRmVhdHVyZUtpbmQ+IHtcbiAgybVraW5kOiBGZWF0dXJlS2luZDtcbiAgybVwcm92aWRlcnM6IFByb3ZpZGVyW107XG59XG5cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9uIHRvIGNyZWF0ZSBhbiBvYmplY3QgdGhhdCByZXByZXNlbnRzIGEgSHlkcmF0aW9uIGZlYXR1cmUuXG4gKi9cbmZ1bmN0aW9uIGh5ZHJhdGlvbkZlYXR1cmU8RmVhdHVyZUtpbmQgZXh0ZW5kcyBIeWRyYXRpb25GZWF0dXJlS2luZD4oXG4gIMm1a2luZDogRmVhdHVyZUtpbmQsXG4gIMm1cHJvdmlkZXJzOiBQcm92aWRlcltdID0gW10sXG4gIMm1b3B0aW9uczogdW5rbm93biA9IHt9LFxuKTogSHlkcmF0aW9uRmVhdHVyZTxGZWF0dXJlS2luZD4ge1xuICByZXR1cm4ge8m1a2luZCwgybVwcm92aWRlcnN9O1xufVxuXG4vKipcbiAqIERpc2FibGVzIEhUVFAgdHJhbnNmZXIgY2FjaGUuIEVmZmVjdGl2ZWx5IGNhdXNlcyBIVFRQIHJlcXVlc3RzIHRvIGJlIHBlcmZvcm1lZCB0d2ljZTogb25jZSBvbiB0aGVcbiAqIHNlcnZlciBhbmQgb3RoZXIgb25lIG9uIHRoZSBicm93c2VyLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdpdGhOb0h0dHBUcmFuc2ZlckNhY2hlKCk6IEh5ZHJhdGlvbkZlYXR1cmU8SHlkcmF0aW9uRmVhdHVyZUtpbmQuTm9IdHRwVHJhbnNmZXJDYWNoZT4ge1xuICAvLyBUaGlzIGZlYXR1cmUgaGFzIG5vIHByb3ZpZGVycyBhbmQgYWN0cyBhcyBhIGZsYWcgdGhhdCB0dXJucyBvZmZcbiAgLy8gSFRUUCB0cmFuc2ZlciBjYWNoZSAod2hpY2ggb3RoZXJ3aXNlIGlzIHR1cm5lZCBvbiBieSBkZWZhdWx0KS5cbiAgcmV0dXJuIGh5ZHJhdGlvbkZlYXR1cmUoSHlkcmF0aW9uRmVhdHVyZUtpbmQuTm9IdHRwVHJhbnNmZXJDYWNoZSk7XG59XG5cbi8qKlxuICogVGhlIGZ1bmN0aW9uIGFjY2VwdHMgYSBhbiBvYmplY3QsIHdoaWNoIGFsbG93cyB0byBjb25maWd1cmUgY2FjaGUgcGFyYW1ldGVycyxcbiAqIHN1Y2ggYXMgd2hpY2ggaGVhZGVycyBzaG91bGQgYmUgaW5jbHVkZWQgKG5vIGhlYWRlcnMgYXJlIGluY2x1ZGVkIGJ5IGRlZmF1bHQpLFxuICogd2V0aGVyIFBPU1QgcmVxdWVzdHMgc2hvdWxkIGJlIGNhY2hlZCBvciBhIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGRldGVybWluZSBpZiBhXG4gKiBwYXJ0aWN1bGFyIHJlcXVlc3Qgc2hvdWxkIGJlIGNhY2hlZC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3aXRoSHR0cFRyYW5zZmVyQ2FjaGVPcHRpb25zKFxuICBvcHRpb25zOiBIdHRwVHJhbnNmZXJDYWNoZU9wdGlvbnMsXG4pOiBIeWRyYXRpb25GZWF0dXJlPEh5ZHJhdGlvbkZlYXR1cmVLaW5kLkh0dHBUcmFuc2ZlckNhY2hlT3B0aW9ucz4ge1xuICAvLyBUaGlzIGZlYXR1cmUgaGFzIG5vIHByb3ZpZGVycyBhbmQgYWN0cyBhcyBhIGZsYWcgdG8gcGFzcyBvcHRpb25zIHRvIHRoZSBIVFRQIHRyYW5zZmVyIGNhY2hlLlxuICByZXR1cm4gaHlkcmF0aW9uRmVhdHVyZShcbiAgICBIeWRyYXRpb25GZWF0dXJlS2luZC5IdHRwVHJhbnNmZXJDYWNoZU9wdGlvbnMsXG4gICAgybV3aXRoSHR0cFRyYW5zZmVyQ2FjaGUob3B0aW9ucyksXG4gICk7XG59XG5cbi8qKlxuICogRW5hYmxlcyBzdXBwb3J0IGZvciBoeWRyYXRpbmcgaTE4biBibG9ja3MuXG4gKlxuICogQGRldmVsb3BlclByZXZpZXdcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdpdGhJMThuU3VwcG9ydCgpOiBIeWRyYXRpb25GZWF0dXJlPEh5ZHJhdGlvbkZlYXR1cmVLaW5kLkkxOG5TdXBwb3J0PiB7XG4gIHJldHVybiBoeWRyYXRpb25GZWF0dXJlKEh5ZHJhdGlvbkZlYXR1cmVLaW5kLkkxOG5TdXBwb3J0LCDJtXdpdGhJMThuU3VwcG9ydCgpKTtcbn1cblxuLyoqXG4gKiBFbmFibGVzIHN1cHBvcnQgZm9yIHJlcGxheWluZyB1c2VyIGV2ZW50cyAoZS5nLiBgY2xpY2tgcykgdGhhdCBoYXBwZW5lZCBvbiBhIHBhZ2VcbiAqIGJlZm9yZSBoeWRyYXRpb24gbG9naWMgaGFzIGNvbXBsZXRlZC4gT25jZSBhbiBhcHBsaWNhdGlvbiBpcyBoeWRyYXRlZCwgYWxsIGNhcHR1cmVkXG4gKiBldmVudHMgYXJlIHJlcGxheWVkIGFuZCByZWxldmFudCBldmVudCBsaXN0ZW5lcnMgYXJlIGV4ZWN1dGVkLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogQmFzaWMgZXhhbXBsZSBvZiBob3cgeW91IGNhbiBlbmFibGUgZXZlbnQgcmVwbGF5IGluIHlvdXIgYXBwbGljYXRpb24gd2hlblxuICogYGJvb3RzdHJhcEFwcGxpY2F0aW9uYCBmdW5jdGlvbiBpcyB1c2VkOlxuICogYGBgXG4gKiBib290c3RyYXBBcHBsaWNhdGlvbihBcHBDb21wb25lbnQsIHtcbiAqICAgcHJvdmlkZXJzOiBbcHJvdmlkZUNsaWVudEh5ZHJhdGlvbih3aXRoRXZlbnRSZXBsYXkoKSldXG4gKiB9KTtcbiAqIGBgYFxuICogQGRldmVsb3BlclByZXZpZXdcbiAqIEBwdWJsaWNBcGlcbiAqIEBzZWUge0BsaW5rIHByb3ZpZGVDbGllbnRIeWRyYXRpb259XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3aXRoRXZlbnRSZXBsYXkoKTogSHlkcmF0aW9uRmVhdHVyZTxIeWRyYXRpb25GZWF0dXJlS2luZC5FdmVudFJlcGxheT4ge1xuICByZXR1cm4gaHlkcmF0aW9uRmVhdHVyZShIeWRyYXRpb25GZWF0dXJlS2luZC5FdmVudFJlcGxheSwgybV3aXRoRXZlbnRSZXBsYXkoKSk7XG59XG5cbi8qKlxuICogUmV0dXJucyBhbiBgRU5WSVJPTk1FTlRfSU5JVElBTElaRVJgIHRva2VuIHNldHVwIHdpdGggYSBmdW5jdGlvblxuICogdGhhdCB2ZXJpZmllcyB3aGV0aGVyIGNvbXBhdGlibGUgWm9uZUpTIHdhcyB1c2VkIGluIGFuIGFwcGxpY2F0aW9uXG4gKiBhbmQgbG9ncyBhIHdhcm5pbmcgaW4gYSBjb25zb2xlIGlmIGl0J3Mgbm90IHRoZSBjYXNlLlxuICovXG5mdW5jdGlvbiBwcm92aWRlWm9uZUpzQ29tcGF0aWJpbGl0eURldGVjdG9yKCk6IFByb3ZpZGVyW10ge1xuICByZXR1cm4gW1xuICAgIHtcbiAgICAgIHByb3ZpZGU6IEVOVklST05NRU5UX0lOSVRJQUxJWkVSLFxuICAgICAgdXNlVmFsdWU6ICgpID0+IHtcbiAgICAgICAgY29uc3Qgbmdab25lID0gaW5qZWN0KE5nWm9uZSk7XG4gICAgICAgIC8vIENoZWNraW5nIGBuZ1pvbmUgaW5zdGFuY2VvZiBOZ1pvbmVgIHdvdWxkIGJlIGluc3VmZmljaWVudCBoZXJlLFxuICAgICAgICAvLyBiZWNhdXNlIGN1c3RvbSBpbXBsZW1lbnRhdGlvbnMgbWlnaHQgdXNlIE5nWm9uZSBhcyBhIGJhc2UgY2xhc3MuXG4gICAgICAgIGlmIChuZ1pvbmUuY29uc3RydWN0b3IgIT09IE5nWm9uZSkge1xuICAgICAgICAgIGNvbnN0IGNvbnNvbGUgPSBpbmplY3QoQ29uc29sZSk7XG4gICAgICAgICAgY29uc3QgbWVzc2FnZSA9IGZvcm1hdFJ1bnRpbWVFcnJvcihcbiAgICAgICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuVU5TVVBQT1JURURfWk9ORUpTX0lOU1RBTkNFLFxuICAgICAgICAgICAgJ0FuZ3VsYXIgZGV0ZWN0ZWQgdGhhdCBoeWRyYXRpb24gd2FzIGVuYWJsZWQgZm9yIGFuIGFwcGxpY2F0aW9uICcgK1xuICAgICAgICAgICAgICAndGhhdCB1c2VzIGEgY3VzdG9tIG9yIGEgbm9vcCBab25lLmpzIGltcGxlbWVudGF0aW9uLiAnICtcbiAgICAgICAgICAgICAgJ1RoaXMgaXMgbm90IHlldCBhIGZ1bGx5IHN1cHBvcnRlZCBjb25maWd1cmF0aW9uLicsXG4gICAgICAgICAgKTtcbiAgICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tY29uc29sZVxuICAgICAgICAgIGNvbnNvbGUud2FybihtZXNzYWdlKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIG11bHRpOiB0cnVlLFxuICAgIH0sXG4gIF07XG59XG5cbi8qKlxuICogU2V0cyB1cCBwcm92aWRlcnMgbmVjZXNzYXJ5IHRvIGVuYWJsZSBoeWRyYXRpb24gZnVuY3Rpb25hbGl0eSBmb3IgdGhlIGFwcGxpY2F0aW9uLlxuICpcbiAqIEJ5IGRlZmF1bHQsIHRoZSBmdW5jdGlvbiBlbmFibGVzIHRoZSByZWNvbW1lbmRlZCBzZXQgb2YgZmVhdHVyZXMgZm9yIHRoZSBvcHRpbWFsXG4gKiBwZXJmb3JtYW5jZSBmb3IgbW9zdCBvZiB0aGUgYXBwbGljYXRpb25zLiBJdCBpbmNsdWRlcyB0aGUgZm9sbG93aW5nIGZlYXR1cmVzOlxuICpcbiAqICogUmVjb25jaWxpbmcgRE9NIGh5ZHJhdGlvbi4gTGVhcm4gbW9yZSBhYm91dCBpdCBbaGVyZV0oZ3VpZGUvaHlkcmF0aW9uKS5cbiAqICogW2BIdHRwQ2xpZW50YF0oYXBpL2NvbW1vbi9odHRwL0h0dHBDbGllbnQpIHJlc3BvbnNlIGNhY2hpbmcgd2hpbGUgcnVubmluZyBvbiB0aGUgc2VydmVyIGFuZFxuICogdHJhbnNmZXJyaW5nIHRoaXMgY2FjaGUgdG8gdGhlIGNsaWVudCB0byBhdm9pZCBleHRyYSBIVFRQIHJlcXVlc3RzLiBMZWFybiBtb3JlIGFib3V0IGRhdGEgY2FjaGluZ1xuICogW2hlcmVdKGd1aWRlL3NzciNjYWNoaW5nLWRhdGEtd2hlbi11c2luZy1odHRwY2xpZW50KS5cbiAqXG4gKiBUaGVzZSBmdW5jdGlvbnMgYWxsb3cgeW91IHRvIGRpc2FibGUgc29tZSBvZiB0aGUgZGVmYXVsdCBmZWF0dXJlcyBvciBjb25maWd1cmUgZmVhdHVyZXNcbiAqICoge0BsaW5rIHdpdGhOb0h0dHBUcmFuc2ZlckNhY2hlfSB0byBkaXNhYmxlIEhUVFAgdHJhbnNmZXIgY2FjaGVcbiAqICoge0BsaW5rIHdpdGhIdHRwVHJhbnNmZXJDYWNoZU9wdGlvbnN9IHRvIGNvbmZpZ3VyZSBzb21lIEhUVFAgdHJhbnNmZXIgY2FjaGUgb3B0aW9uc1xuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogQmFzaWMgZXhhbXBsZSBvZiBob3cgeW91IGNhbiBlbmFibGUgaHlkcmF0aW9uIGluIHlvdXIgYXBwbGljYXRpb24gd2hlblxuICogYGJvb3RzdHJhcEFwcGxpY2F0aW9uYCBmdW5jdGlvbiBpcyB1c2VkOlxuICogYGBgXG4gKiBib290c3RyYXBBcHBsaWNhdGlvbihBcHBDb21wb25lbnQsIHtcbiAqICAgcHJvdmlkZXJzOiBbcHJvdmlkZUNsaWVudEh5ZHJhdGlvbigpXVxuICogfSk7XG4gKiBgYGBcbiAqXG4gKiBBbHRlcm5hdGl2ZWx5IGlmIHlvdSBhcmUgdXNpbmcgTmdNb2R1bGVzLCB5b3Ugd291bGQgYWRkIGBwcm92aWRlQ2xpZW50SHlkcmF0aW9uYFxuICogdG8geW91ciByb290IGFwcCBtb2R1bGUncyBwcm92aWRlciBsaXN0LlxuICogYGBgXG4gKiBATmdNb2R1bGUoe1xuICogICBkZWNsYXJhdGlvbnM6IFtSb290Q21wXSxcbiAqICAgYm9vdHN0cmFwOiBbUm9vdENtcF0sXG4gKiAgIHByb3ZpZGVyczogW3Byb3ZpZGVDbGllbnRIeWRyYXRpb24oKV0sXG4gKiB9KVxuICogZXhwb3J0IGNsYXNzIEFwcE1vZHVsZSB7fVxuICogYGBgXG4gKlxuICogQHNlZSB7QGxpbmsgd2l0aE5vSHR0cFRyYW5zZmVyQ2FjaGV9XG4gKiBAc2VlIHtAbGluayB3aXRoSHR0cFRyYW5zZmVyQ2FjaGVPcHRpb25zfVxuICpcbiAqIEBwYXJhbSBmZWF0dXJlcyBPcHRpb25hbCBmZWF0dXJlcyB0byBjb25maWd1cmUgYWRkaXRpb25hbCByb3V0ZXIgYmVoYXZpb3JzLlxuICogQHJldHVybnMgQSBzZXQgb2YgcHJvdmlkZXJzIHRvIGVuYWJsZSBoeWRyYXRpb24uXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZUNsaWVudEh5ZHJhdGlvbihcbiAgLi4uZmVhdHVyZXM6IEh5ZHJhdGlvbkZlYXR1cmU8SHlkcmF0aW9uRmVhdHVyZUtpbmQ+W11cbik6IEVudmlyb25tZW50UHJvdmlkZXJzIHtcbiAgY29uc3QgcHJvdmlkZXJzOiBQcm92aWRlcltdID0gW107XG4gIGNvbnN0IGZlYXR1cmVzS2luZCA9IG5ldyBTZXQ8SHlkcmF0aW9uRmVhdHVyZUtpbmQ+KCk7XG4gIGNvbnN0IGhhc0h0dHBUcmFuc2ZlckNhY2hlT3B0aW9ucyA9IGZlYXR1cmVzS2luZC5oYXMoXG4gICAgSHlkcmF0aW9uRmVhdHVyZUtpbmQuSHR0cFRyYW5zZmVyQ2FjaGVPcHRpb25zLFxuICApO1xuXG4gIGZvciAoY29uc3Qge8m1cHJvdmlkZXJzLCDJtWtpbmR9IG9mIGZlYXR1cmVzKSB7XG4gICAgZmVhdHVyZXNLaW5kLmFkZCjJtWtpbmQpO1xuXG4gICAgaWYgKMm1cHJvdmlkZXJzLmxlbmd0aCkge1xuICAgICAgcHJvdmlkZXJzLnB1c2goybVwcm92aWRlcnMpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChcbiAgICB0eXBlb2YgbmdEZXZNb2RlICE9PSAndW5kZWZpbmVkJyAmJlxuICAgIG5nRGV2TW9kZSAmJlxuICAgIGZlYXR1cmVzS2luZC5oYXMoSHlkcmF0aW9uRmVhdHVyZUtpbmQuTm9IdHRwVHJhbnNmZXJDYWNoZSkgJiZcbiAgICBoYXNIdHRwVHJhbnNmZXJDYWNoZU9wdGlvbnNcbiAgKSB7XG4gICAgLy8gVE9ETzogTWFrZSB0aGlzIGEgcnVudGltZSBlcnJvclxuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICdDb25maWd1cmF0aW9uIGVycm9yOiBmb3VuZCBib3RoIHdpdGhIdHRwVHJhbnNmZXJDYWNoZU9wdGlvbnMoKSBhbmQgd2l0aE5vSHR0cFRyYW5zZmVyQ2FjaGUoKSBpbiB0aGUgc2FtZSBjYWxsIHRvIHByb3ZpZGVDbGllbnRIeWRyYXRpb24oKSwgd2hpY2ggaXMgYSBjb250cmFkaWN0aW9uLicsXG4gICAgKTtcbiAgfVxuXG4gIHJldHVybiBtYWtlRW52aXJvbm1lbnRQcm92aWRlcnMoW1xuICAgIHR5cGVvZiBuZ0Rldk1vZGUgIT09ICd1bmRlZmluZWQnICYmIG5nRGV2TW9kZSA/IHByb3ZpZGVab25lSnNDb21wYXRpYmlsaXR5RGV0ZWN0b3IoKSA6IFtdLFxuICAgIHdpdGhEb21IeWRyYXRpb24oKSxcbiAgICBmZWF0dXJlc0tpbmQuaGFzKEh5ZHJhdGlvbkZlYXR1cmVLaW5kLk5vSHR0cFRyYW5zZmVyQ2FjaGUpIHx8IGhhc0h0dHBUcmFuc2ZlckNhY2hlT3B0aW9uc1xuICAgICAgPyBbXVxuICAgICAgOiDJtXdpdGhIdHRwVHJhbnNmZXJDYWNoZSh7fSksXG4gICAgcHJvdmlkZXJzLFxuICBdKTtcbn1cbiJdfQ==