/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ɵwithHttpTransferCache } from '@angular/common/http';
import { ENVIRONMENT_INITIALIZER, inject, makeEnvironmentProviders, NgZone, ɵConsole as Console, ɵformatRuntimeError as formatRuntimeError, ɵwithDomHydration as withDomHydration, ɵwithEventReplay, ɵwithI18nSupport, ɵZONELESS_ENABLED as ZONELESS_ENABLED, } from '@angular/core';
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
 * The function accepts an object, which allows to configure cache parameters,
 * such as which headers should be included (no headers are included by default),
 * whether POST requests should be cached or a callback function to determine if a
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
                const isZoneless = inject(ZONELESS_ENABLED);
                // Checking `ngZone instanceof NgZone` would be insufficient here,
                // because custom implementations might use NgZone as a base class.
                if (!isZoneless && ngZone.constructor !== NgZone) {
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
 * These functions allow you to disable some of the default features or enable new ones:
 *
 * * {@link withNoHttpTransferCache} to disable HTTP transfer cache
 * * {@link withHttpTransferCacheOptions} to configure some HTTP transfer cache options
 * * {@link withI18nSupport} to enable hydration support for i18n blocks
 * * {@link withEventReplay} to enable support for replaying user events
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
 * @see {@link withI18nSupport}
 * @see {@link withEventReplay}
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHlkcmF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvcGxhdGZvcm0tYnJvd3Nlci9zcmMvaHlkcmF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBMkIsc0JBQXNCLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUN0RixPQUFPLEVBQ0wsdUJBQXVCLEVBRXZCLE1BQU0sRUFDTix3QkFBd0IsRUFDeEIsTUFBTSxFQUVOLFFBQVEsSUFBSSxPQUFPLEVBQ25CLG1CQUFtQixJQUFJLGtCQUFrQixFQUN6QyxpQkFBaUIsSUFBSSxnQkFBZ0IsRUFDckMsZ0JBQWdCLEVBQ2hCLGdCQUFnQixFQUNoQixpQkFBaUIsSUFBSSxnQkFBZ0IsR0FDdEMsTUFBTSxlQUFlLENBQUM7QUFJdkI7Ozs7O0dBS0c7QUFDSCxNQUFNLENBQU4sSUFBWSxvQkFLWDtBQUxELFdBQVksb0JBQW9CO0lBQzlCLDZGQUFtQixDQUFBO0lBQ25CLHVHQUF3QixDQUFBO0lBQ3hCLDZFQUFXLENBQUE7SUFDWCw2RUFBVyxDQUFBO0FBQ2IsQ0FBQyxFQUxXLG9CQUFvQixLQUFwQixvQkFBb0IsUUFLL0I7QUFZRDs7R0FFRztBQUNILFNBQVMsZ0JBQWdCLENBQ3ZCLEtBQWtCLEVBQ2xCLGFBQXlCLEVBQUUsRUFDM0IsV0FBb0IsRUFBRTtJQUV0QixPQUFPLEVBQUMsS0FBSyxFQUFFLFVBQVUsRUFBQyxDQUFDO0FBQzdCLENBQUM7QUFFRDs7Ozs7R0FLRztBQUNILE1BQU0sVUFBVSx1QkFBdUI7SUFDckMsa0VBQWtFO0lBQ2xFLGlFQUFpRTtJQUNqRSxPQUFPLGdCQUFnQixDQUFDLG9CQUFvQixDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFDcEUsQ0FBQztBQUVEOzs7Ozs7O0dBT0c7QUFDSCxNQUFNLFVBQVUsNEJBQTRCLENBQzFDLE9BQWlDO0lBRWpDLCtGQUErRjtJQUMvRixPQUFP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dCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtIdHRwVHJhbnNmZXJDYWNoZU9wdGlvbnMsIMm1d2l0aEh0dHBUcmFuc2ZlckNhY2hlfSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XG5pbXBvcnQge1xuICBFTlZJUk9OTUVOVF9JTklUSUFMSVpFUixcbiAgRW52aXJvbm1lbnRQcm92aWRlcnMsXG4gIGluamVjdCxcbiAgbWFrZUVudmlyb25tZW50UHJvdmlkZXJzLFxuICBOZ1pvbmUsXG4gIFByb3ZpZGVyLFxuICDJtUNvbnNvbGUgYXMgQ29uc29sZSxcbiAgybVmb3JtYXRSdW50aW1lRXJyb3IgYXMgZm9ybWF0UnVudGltZUVycm9yLFxuICDJtXdpdGhEb21IeWRyYXRpb24gYXMgd2l0aERvbUh5ZHJhdGlvbixcbiAgybV3aXRoRXZlbnRSZXBsYXksXG4gIMm1d2l0aEkxOG5TdXBwb3J0LFxuICDJtVpPTkVMRVNTX0VOQUJMRUQgYXMgWk9ORUxFU1NfRU5BQkxFRCxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7UnVudGltZUVycm9yQ29kZX0gZnJvbSAnLi9lcnJvcnMnO1xuXG4vKipcbiAqIFRoZSBsaXN0IG9mIGZlYXR1cmVzIGFzIGFuIGVudW0gdG8gdW5pcXVlbHkgdHlwZSBlYWNoIGBIeWRyYXRpb25GZWF0dXJlYC5cbiAqIEBzZWUge0BsaW5rIEh5ZHJhdGlvbkZlYXR1cmV9XG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZW51bSBIeWRyYXRpb25GZWF0dXJlS2luZCB7XG4gIE5vSHR0cFRyYW5zZmVyQ2FjaGUsXG4gIEh0dHBUcmFuc2ZlckNhY2hlT3B0aW9ucyxcbiAgSTE4blN1cHBvcnQsXG4gIEV2ZW50UmVwbGF5LFxufVxuXG4vKipcbiAqIEhlbHBlciB0eXBlIHRvIHJlcHJlc2VudCBhIEh5ZHJhdGlvbiBmZWF0dXJlLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBIeWRyYXRpb25GZWF0dXJlPEZlYXR1cmVLaW5kIGV4dGVuZHMgSHlkcmF0aW9uRmVhdHVyZUtpbmQ+IHtcbiAgybVraW5kOiBGZWF0dXJlS2luZDtcbiAgybVwcm92aWRlcnM6IFByb3ZpZGVyW107XG59XG5cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9uIHRvIGNyZWF0ZSBhbiBvYmplY3QgdGhhdCByZXByZXNlbnRzIGEgSHlkcmF0aW9uIGZlYXR1cmUuXG4gKi9cbmZ1bmN0aW9uIGh5ZHJhdGlvbkZlYXR1cmU8RmVhdHVyZUtpbmQgZXh0ZW5kcyBIeWRyYXRpb25GZWF0dXJlS2luZD4oXG4gIMm1a2luZDogRmVhdHVyZUtpbmQsXG4gIMm1cHJvdmlkZXJzOiBQcm92aWRlcltdID0gW10sXG4gIMm1b3B0aW9uczogdW5rbm93biA9IHt9LFxuKTogSHlkcmF0aW9uRmVhdHVyZTxGZWF0dXJlS2luZD4ge1xuICByZXR1cm4ge8m1a2luZCwgybVwcm92aWRlcnN9O1xufVxuXG4vKipcbiAqIERpc2FibGVzIEhUVFAgdHJhbnNmZXIgY2FjaGUuIEVmZmVjdGl2ZWx5IGNhdXNlcyBIVFRQIHJlcXVlc3RzIHRvIGJlIHBlcmZvcm1lZCB0d2ljZTogb25jZSBvbiB0aGVcbiAqIHNlcnZlciBhbmQgb3RoZXIgb25lIG9uIHRoZSBicm93c2VyLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdpdGhOb0h0dHBUcmFuc2ZlckNhY2hlKCk6IEh5ZHJhdGlvbkZlYXR1cmU8SHlkcmF0aW9uRmVhdHVyZUtpbmQuTm9IdHRwVHJhbnNmZXJDYWNoZT4ge1xuICAvLyBUaGlzIGZlYXR1cmUgaGFzIG5vIHByb3ZpZGVycyBhbmQgYWN0cyBhcyBhIGZsYWcgdGhhdCB0dXJucyBvZmZcbiAgLy8gSFRUUCB0cmFuc2ZlciBjYWNoZSAod2hpY2ggb3RoZXJ3aXNlIGlzIHR1cm5lZCBvbiBieSBkZWZhdWx0KS5cbiAgcmV0dXJuIGh5ZHJhdGlvbkZlYXR1cmUoSHlkcmF0aW9uRmVhdHVyZUtpbmQuTm9IdHRwVHJhbnNmZXJDYWNoZSk7XG59XG5cbi8qKlxuICogVGhlIGZ1bmN0aW9uIGFjY2VwdHMgYW4gb2JqZWN0LCB3aGljaCBhbGxvd3MgdG8gY29uZmlndXJlIGNhY2hlIHBhcmFtZXRlcnMsXG4gKiBzdWNoIGFzIHdoaWNoIGhlYWRlcnMgc2hvdWxkIGJlIGluY2x1ZGVkIChubyBoZWFkZXJzIGFyZSBpbmNsdWRlZCBieSBkZWZhdWx0KSxcbiAqIHdoZXRoZXIgUE9TVCByZXF1ZXN0cyBzaG91bGQgYmUgY2FjaGVkIG9yIGEgY2FsbGJhY2sgZnVuY3Rpb24gdG8gZGV0ZXJtaW5lIGlmIGFcbiAqIHBhcnRpY3VsYXIgcmVxdWVzdCBzaG91bGQgYmUgY2FjaGVkLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdpdGhIdHRwVHJhbnNmZXJDYWNoZU9wdGlvbnMoXG4gIG9wdGlvbnM6IEh0dHBUcmFuc2ZlckNhY2hlT3B0aW9ucyxcbik6IEh5ZHJhdGlvbkZlYXR1cmU8SHlkcmF0aW9uRmVhdHVyZUtpbmQuSHR0cFRyYW5zZmVyQ2FjaGVPcHRpb25zPiB7XG4gIC8vIFRoaXMgZmVhdHVyZSBoYXMgbm8gcHJvdmlkZXJzIGFuZCBhY3RzIGFzIGEgZmxhZyB0byBwYXNzIG9wdGlvbnMgdG8gdGhlIEhUVFAgdHJhbnNmZXIgY2FjaGUuXG4gIHJldHVybiBoeWRyYXRpb25GZWF0dXJlKFxuICAgIEh5ZHJhdGlvbkZlYXR1cmVLaW5kLkh0dHBUcmFuc2ZlckNhY2hlT3B0aW9ucyxcbiAgICDJtXdpdGhIdHRwVHJhbnNmZXJDYWNoZShvcHRpb25zKSxcbiAgKTtcbn1cblxuLyoqXG4gKiBFbmFibGVzIHN1cHBvcnQgZm9yIGh5ZHJhdGluZyBpMThuIGJsb2Nrcy5cbiAqXG4gKiBAZGV2ZWxvcGVyUHJldmlld1xuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gd2l0aEkxOG5TdXBwb3J0KCk6IEh5ZHJhdGlvbkZlYXR1cmU8SHlkcmF0aW9uRmVhdHVyZUtpbmQuSTE4blN1cHBvcnQ+IHtcbiAgcmV0dXJuIGh5ZHJhdGlvbkZlYXR1cmUoSHlkcmF0aW9uRmVhdHVyZUtpbmQuSTE4blN1cHBvcnQsIMm1d2l0aEkxOG5TdXBwb3J0KCkpO1xufVxuXG4vKipcbiAqIEVuYWJsZXMgc3VwcG9ydCBmb3IgcmVwbGF5aW5nIHVzZXIgZXZlbnRzIChlLmcuIGBjbGlja2BzKSB0aGF0IGhhcHBlbmVkIG9uIGEgcGFnZVxuICogYmVmb3JlIGh5ZHJhdGlvbiBsb2dpYyBoYXMgY29tcGxldGVkLiBPbmNlIGFuIGFwcGxpY2F0aW9uIGlzIGh5ZHJhdGVkLCBhbGwgY2FwdHVyZWRcbiAqIGV2ZW50cyBhcmUgcmVwbGF5ZWQgYW5kIHJlbGV2YW50IGV2ZW50IGxpc3RlbmVycyBhcmUgZXhlY3V0ZWQuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiBCYXNpYyBleGFtcGxlIG9mIGhvdyB5b3UgY2FuIGVuYWJsZSBldmVudCByZXBsYXkgaW4geW91ciBhcHBsaWNhdGlvbiB3aGVuXG4gKiBgYm9vdHN0cmFwQXBwbGljYXRpb25gIGZ1bmN0aW9uIGlzIHVzZWQ6XG4gKiBgYGBcbiAqIGJvb3RzdHJhcEFwcGxpY2F0aW9uKEFwcENvbXBvbmVudCwge1xuICogICBwcm92aWRlcnM6IFtwcm92aWRlQ2xpZW50SHlkcmF0aW9uKHdpdGhFdmVudFJlcGxheSgpKV1cbiAqIH0pO1xuICogYGBgXG4gKiBAZGV2ZWxvcGVyUHJldmlld1xuICogQHB1YmxpY0FwaVxuICogQHNlZSB7QGxpbmsgcHJvdmlkZUNsaWVudEh5ZHJhdGlvbn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdpdGhFdmVudFJlcGxheSgpOiBIeWRyYXRpb25GZWF0dXJlPEh5ZHJhdGlvbkZlYXR1cmVLaW5kLkV2ZW50UmVwbGF5PiB7XG4gIHJldHVybiBoeWRyYXRpb25GZWF0dXJlKEh5ZHJhdGlvbkZlYXR1cmVLaW5kLkV2ZW50UmVwbGF5LCDJtXdpdGhFdmVudFJlcGxheSgpKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGFuIGBFTlZJUk9OTUVOVF9JTklUSUFMSVpFUmAgdG9rZW4gc2V0dXAgd2l0aCBhIGZ1bmN0aW9uXG4gKiB0aGF0IHZlcmlmaWVzIHdoZXRoZXIgY29tcGF0aWJsZSBab25lSlMgd2FzIHVzZWQgaW4gYW4gYXBwbGljYXRpb25cbiAqIGFuZCBsb2dzIGEgd2FybmluZyBpbiBhIGNvbnNvbGUgaWYgaXQncyBub3QgdGhlIGNhc2UuXG4gKi9cbmZ1bmN0aW9uIHByb3ZpZGVab25lSnNDb21wYXRpYmlsaXR5RGV0ZWN0b3IoKTogUHJvdmlkZXJbXSB7XG4gIHJldHVybiBbXG4gICAge1xuICAgICAgcHJvdmlkZTogRU5WSVJPTk1FTlRfSU5JVElBTElaRVIsXG4gICAgICB1c2VWYWx1ZTogKCkgPT4ge1xuICAgICAgICBjb25zdCBuZ1pvbmUgPSBpbmplY3QoTmdab25lKTtcbiAgICAgICAgY29uc3QgaXNab25lbGVzcyA9IGluamVjdChaT05FTEVTU19FTkFCTEVEKTtcbiAgICAgICAgLy8gQ2hlY2tpbmcgYG5nWm9uZSBpbnN0YW5jZW9mIE5nWm9uZWAgd291bGQgYmUgaW5zdWZmaWNpZW50IGhlcmUsXG4gICAgICAgIC8vIGJlY2F1c2UgY3VzdG9tIGltcGxlbWVudGF0aW9ucyBtaWdodCB1c2UgTmdab25lIGFzIGEgYmFzZSBjbGFzcy5cbiAgICAgICAgaWYgKCFpc1pvbmVsZXNzICYmIG5nWm9uZS5jb25zdHJ1Y3RvciAhPT0gTmdab25lKSB7XG4gICAgICAgICAgY29uc3QgY29uc29sZSA9IGluamVjdChDb25zb2xlKTtcbiAgICAgICAgICBjb25zdCBtZXNzYWdlID0gZm9ybWF0UnVudGltZUVycm9yKFxuICAgICAgICAgICAgUnVudGltZUVycm9yQ29kZS5VTlNVUFBPUlRFRF9aT05FSlNfSU5TVEFOQ0UsXG4gICAgICAgICAgICAnQW5ndWxhciBkZXRlY3RlZCB0aGF0IGh5ZHJhdGlvbiB3YXMgZW5hYmxlZCBmb3IgYW4gYXBwbGljYXRpb24gJyArXG4gICAgICAgICAgICAgICd0aGF0IHVzZXMgYSBjdXN0b20gb3IgYSBub29wIFpvbmUuanMgaW1wbGVtZW50YXRpb24uICcgK1xuICAgICAgICAgICAgICAnVGhpcyBpcyBub3QgeWV0IGEgZnVsbHkgc3VwcG9ydGVkIGNvbmZpZ3VyYXRpb24uJyxcbiAgICAgICAgICApO1xuICAgICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1jb25zb2xlXG4gICAgICAgICAgY29uc29sZS53YXJuKG1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgbXVsdGk6IHRydWUsXG4gICAgfSxcbiAgXTtcbn1cblxuLyoqXG4gKiBTZXRzIHVwIHByb3ZpZGVycyBuZWNlc3NhcnkgdG8gZW5hYmxlIGh5ZHJhdGlvbiBmdW5jdGlvbmFsaXR5IGZvciB0aGUgYXBwbGljYXRpb24uXG4gKlxuICogQnkgZGVmYXVsdCwgdGhlIGZ1bmN0aW9uIGVuYWJsZXMgdGhlIHJlY29tbWVuZGVkIHNldCBvZiBmZWF0dXJlcyBmb3IgdGhlIG9wdGltYWxcbiAqIHBlcmZvcm1hbmNlIGZvciBtb3N0IG9mIHRoZSBhcHBsaWNhdGlvbnMuIEl0IGluY2x1ZGVzIHRoZSBmb2xsb3dpbmcgZmVhdHVyZXM6XG4gKlxuICogKiBSZWNvbmNpbGluZyBET00gaHlkcmF0aW9uLiBMZWFybiBtb3JlIGFib3V0IGl0IFtoZXJlXShndWlkZS9oeWRyYXRpb24pLlxuICogKiBbYEh0dHBDbGllbnRgXShhcGkvY29tbW9uL2h0dHAvSHR0cENsaWVudCkgcmVzcG9uc2UgY2FjaGluZyB3aGlsZSBydW5uaW5nIG9uIHRoZSBzZXJ2ZXIgYW5kXG4gKiB0cmFuc2ZlcnJpbmcgdGhpcyBjYWNoZSB0byB0aGUgY2xpZW50IHRvIGF2b2lkIGV4dHJhIEhUVFAgcmVxdWVzdHMuIExlYXJuIG1vcmUgYWJvdXQgZGF0YSBjYWNoaW5nXG4gKiBbaGVyZV0oZ3VpZGUvc3NyI2NhY2hpbmctZGF0YS13aGVuLXVzaW5nLWh0dHBjbGllbnQpLlxuICpcbiAqIFRoZXNlIGZ1bmN0aW9ucyBhbGxvdyB5b3UgdG8gZGlzYWJsZSBzb21lIG9mIHRoZSBkZWZhdWx0IGZlYXR1cmVzIG9yIGVuYWJsZSBuZXcgb25lczpcbiAqXG4gKiAqIHtAbGluayB3aXRoTm9IdHRwVHJhbnNmZXJDYWNoZX0gdG8gZGlzYWJsZSBIVFRQIHRyYW5zZmVyIGNhY2hlXG4gKiAqIHtAbGluayB3aXRoSHR0cFRyYW5zZmVyQ2FjaGVPcHRpb25zfSB0byBjb25maWd1cmUgc29tZSBIVFRQIHRyYW5zZmVyIGNhY2hlIG9wdGlvbnNcbiAqICoge0BsaW5rIHdpdGhJMThuU3VwcG9ydH0gdG8gZW5hYmxlIGh5ZHJhdGlvbiBzdXBwb3J0IGZvciBpMThuIGJsb2Nrc1xuICogKiB7QGxpbmsgd2l0aEV2ZW50UmVwbGF5fSB0byBlbmFibGUgc3VwcG9ydCBmb3IgcmVwbGF5aW5nIHVzZXIgZXZlbnRzXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiBCYXNpYyBleGFtcGxlIG9mIGhvdyB5b3UgY2FuIGVuYWJsZSBoeWRyYXRpb24gaW4geW91ciBhcHBsaWNhdGlvbiB3aGVuXG4gKiBgYm9vdHN0cmFwQXBwbGljYXRpb25gIGZ1bmN0aW9uIGlzIHVzZWQ6XG4gKiBgYGBcbiAqIGJvb3RzdHJhcEFwcGxpY2F0aW9uKEFwcENvbXBvbmVudCwge1xuICogICBwcm92aWRlcnM6IFtwcm92aWRlQ2xpZW50SHlkcmF0aW9uKCldXG4gKiB9KTtcbiAqIGBgYFxuICpcbiAqIEFsdGVybmF0aXZlbHkgaWYgeW91IGFyZSB1c2luZyBOZ01vZHVsZXMsIHlvdSB3b3VsZCBhZGQgYHByb3ZpZGVDbGllbnRIeWRyYXRpb25gXG4gKiB0byB5b3VyIHJvb3QgYXBwIG1vZHVsZSdzIHByb3ZpZGVyIGxpc3QuXG4gKiBgYGBcbiAqIEBOZ01vZHVsZSh7XG4gKiAgIGRlY2xhcmF0aW9uczogW1Jvb3RDbXBdLFxuICogICBib290c3RyYXA6IFtSb290Q21wXSxcbiAqICAgcHJvdmlkZXJzOiBbcHJvdmlkZUNsaWVudEh5ZHJhdGlvbigpXSxcbiAqIH0pXG4gKiBleHBvcnQgY2xhc3MgQXBwTW9kdWxlIHt9XG4gKiBgYGBcbiAqXG4gKiBAc2VlIHtAbGluayB3aXRoTm9IdHRwVHJhbnNmZXJDYWNoZX1cbiAqIEBzZWUge0BsaW5rIHdpdGhIdHRwVHJhbnNmZXJDYWNoZU9wdGlvbnN9XG4gKiBAc2VlIHtAbGluayB3aXRoSTE4blN1cHBvcnR9XG4gKiBAc2VlIHtAbGluayB3aXRoRXZlbnRSZXBsYXl9XG4gKlxuICogQHBhcmFtIGZlYXR1cmVzIE9wdGlvbmFsIGZlYXR1cmVzIHRvIGNvbmZpZ3VyZSBhZGRpdGlvbmFsIHJvdXRlciBiZWhhdmlvcnMuXG4gKiBAcmV0dXJucyBBIHNldCBvZiBwcm92aWRlcnMgdG8gZW5hYmxlIGh5ZHJhdGlvbi5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcm92aWRlQ2xpZW50SHlkcmF0aW9uKFxuICAuLi5mZWF0dXJlczogSHlkcmF0aW9uRmVhdHVyZTxIeWRyYXRpb25GZWF0dXJlS2luZD5bXVxuKTogRW52aXJvbm1lbnRQcm92aWRlcnMge1xuICBjb25zdCBwcm92aWRlcnM6IFByb3ZpZGVyW10gPSBbXTtcbiAgY29uc3QgZmVhdHVyZXNLaW5kID0gbmV3IFNldDxIeWRyYXRpb25GZWF0dXJlS2luZD4oKTtcbiAgY29uc3QgaGFzSHR0cFRyYW5zZmVyQ2FjaGVPcHRpb25zID0gZmVhdHVyZXNLaW5kLmhhcyhcbiAgICBIeWRyYXRpb25GZWF0dXJlS2luZC5IdHRwVHJhbnNmZXJDYWNoZU9wdGlvbnMsXG4gICk7XG5cbiAgZm9yIChjb25zdCB7ybVwcm92aWRlcnMsIMm1a2luZH0gb2YgZmVhdHVyZXMpIHtcbiAgICBmZWF0dXJlc0tpbmQuYWRkKMm1a2luZCk7XG5cbiAgICBpZiAoybVwcm92aWRlcnMubGVuZ3RoKSB7XG4gICAgICBwcm92aWRlcnMucHVzaCjJtXByb3ZpZGVycyk7XG4gICAgfVxuICB9XG5cbiAgaWYgKFxuICAgIHR5cGVvZiBuZ0Rldk1vZGUgIT09ICd1bmRlZmluZWQnICYmXG4gICAgbmdEZXZNb2RlICYmXG4gICAgZmVhdHVyZXNLaW5kLmhhcyhIeWRyYXRpb25GZWF0dXJlS2luZC5Ob0h0dHBUcmFuc2ZlckNhY2hlKSAmJlxuICAgIGhhc0h0dHBUcmFuc2ZlckNhY2hlT3B0aW9uc1xuICApIHtcbiAgICAvLyBUT0RPOiBNYWtlIHRoaXMgYSBydW50aW1lIGVycm9yXG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgJ0NvbmZpZ3VyYXRpb24gZXJyb3I6IGZvdW5kIGJvdGggd2l0aEh0dHBUcmFuc2ZlckNhY2hlT3B0aW9ucygpIGFuZCB3aXRoTm9IdHRwVHJhbnNmZXJDYWNoZSgpIGluIHRoZSBzYW1lIGNhbGwgdG8gcHJvdmlkZUNsaWVudEh5ZHJhdGlvbigpLCB3aGljaCBpcyBhIGNvbnRyYWRpY3Rpb24uJyxcbiAgICApO1xuICB9XG5cbiAgcmV0dXJuIG1ha2VFbnZpcm9ubWVudFByb3ZpZGVycyhbXG4gICAgdHlwZW9mIG5nRGV2TW9kZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbmdEZXZNb2RlID8gcHJvdmlkZVpvbmVKc0NvbXBhdGliaWxpdHlEZXRlY3RvcigpIDogW10sXG4gICAgd2l0aERvbUh5ZHJhdGlvbigpLFxuICAgIGZlYXR1cmVzS2luZC5oYXMoSHlkcmF0aW9uRmVhdHVyZUtpbmQuTm9IdHRwVHJhbnNmZXJDYWNoZSkgfHwgaGFzSHR0cFRyYW5zZmVyQ2FjaGVPcHRpb25zXG4gICAgICA/IFtdXG4gICAgICA6IMm1d2l0aEh0dHBUcmFuc2ZlckNhY2hlKHt9KSxcbiAgICBwcm92aWRlcnMsXG4gIF0pO1xufVxuIl19