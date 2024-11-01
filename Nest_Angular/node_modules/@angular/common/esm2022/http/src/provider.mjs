/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { inject, InjectionToken, makeEnvironmentProviders, } from '@angular/core';
import { HttpBackend, HttpHandler } from './backend';
import { HttpClient } from './client';
import { FetchBackend } from './fetch';
import { HTTP_INTERCEPTOR_FNS, HttpInterceptorHandler, legacyInterceptorFnFactory, } from './interceptor';
import { jsonpCallbackContext, JsonpCallbackContext, JsonpClientBackend, jsonpInterceptorFn, } from './jsonp';
import { HttpXhrBackend } from './xhr';
import { HttpXsrfCookieExtractor, HttpXsrfTokenExtractor, XSRF_COOKIE_NAME, XSRF_ENABLED, XSRF_HEADER_NAME, xsrfInterceptorFn, } from './xsrf';
/**
 * Identifies a particular kind of `HttpFeature`.
 *
 * @publicApi
 */
export var HttpFeatureKind;
(function (HttpFeatureKind) {
    HttpFeatureKind[HttpFeatureKind["Interceptors"] = 0] = "Interceptors";
    HttpFeatureKind[HttpFeatureKind["LegacyInterceptors"] = 1] = "LegacyInterceptors";
    HttpFeatureKind[HttpFeatureKind["CustomXsrfConfiguration"] = 2] = "CustomXsrfConfiguration";
    HttpFeatureKind[HttpFeatureKind["NoXsrfProtection"] = 3] = "NoXsrfProtection";
    HttpFeatureKind[HttpFeatureKind["JsonpSupport"] = 4] = "JsonpSupport";
    HttpFeatureKind[HttpFeatureKind["RequestsMadeViaParent"] = 5] = "RequestsMadeViaParent";
    HttpFeatureKind[HttpFeatureKind["Fetch"] = 6] = "Fetch";
})(HttpFeatureKind || (HttpFeatureKind = {}));
function makeHttpFeature(kind, providers) {
    return {
        ɵkind: kind,
        ɵproviders: providers,
    };
}
/**
 * Configures Angular's `HttpClient` service to be available for injection.
 *
 * By default, `HttpClient` will be configured for injection with its default options for XSRF
 * protection of outgoing requests. Additional configuration options can be provided by passing
 * feature functions to `provideHttpClient`. For example, HTTP interceptors can be added using the
 * `withInterceptors(...)` feature.
 *
 * <div class="alert is-helpful">
 *
 * It's strongly recommended to enable
 * [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) for applications that use
 * Server-Side Rendering for better performance and compatibility. To enable `fetch`, add
 * `withFetch()` feature to the `provideHttpClient()` call at the root of the application:
 *
 * ```
 * provideHttpClient(withFetch());
 * ```
 *
 * </div>
 *
 * @see {@link withInterceptors}
 * @see {@link withInterceptorsFromDi}
 * @see {@link withXsrfConfiguration}
 * @see {@link withNoXsrfProtection}
 * @see {@link withJsonpSupport}
 * @see {@link withRequestsMadeViaParent}
 * @see {@link withFetch}
 */
export function provideHttpClient(...features) {
    if (ngDevMode) {
        const featureKinds = new Set(features.map((f) => f.ɵkind));
        if (featureKinds.has(HttpFeatureKind.NoXsrfProtection) &&
            featureKinds.has(HttpFeatureKind.CustomXsrfConfiguration)) {
            throw new Error(ngDevMode
                ? `Configuration error: found both withXsrfConfiguration() and withNoXsrfProtection() in the same call to provideHttpClient(), which is a contradiction.`
                : '');
        }
    }
    const providers = [
        HttpClient,
        HttpXhrBackend,
        HttpInterceptorHandler,
        { provide: HttpHandler, useExisting: HttpInterceptorHandler },
        {
            provide: HttpBackend,
            useFactory: () => {
                return inject(FetchBackend, { optional: true }) ?? inject(HttpXhrBackend);
            },
        },
        {
            provide: HTTP_INTERCEPTOR_FNS,
            useValue: xsrfInterceptorFn,
            multi: true,
        },
        { provide: XSRF_ENABLED, useValue: true },
        { provide: HttpXsrfTokenExtractor, useClass: HttpXsrfCookieExtractor },
    ];
    for (const feature of features) {
        providers.push(...feature.ɵproviders);
    }
    return makeEnvironmentProviders(providers);
}
/**
 * Adds one or more functional-style HTTP interceptors to the configuration of the `HttpClient`
 * instance.
 *
 * @see {@link HttpInterceptorFn}
 * @see {@link provideHttpClient}
 * @publicApi
 */
export function withInterceptors(interceptorFns) {
    return makeHttpFeature(HttpFeatureKind.Interceptors, interceptorFns.map((interceptorFn) => {
        return {
            provide: HTTP_INTERCEPTOR_FNS,
            useValue: interceptorFn,
            multi: true,
        };
    }));
}
const LEGACY_INTERCEPTOR_FN = new InjectionToken(ngDevMode ? 'LEGACY_INTERCEPTOR_FN' : '');
/**
 * Includes class-based interceptors configured using a multi-provider in the current injector into
 * the configured `HttpClient` instance.
 *
 * Prefer `withInterceptors` and functional interceptors instead, as support for DI-provided
 * interceptors may be phased out in a later release.
 *
 * @see {@link HttpInterceptor}
 * @see {@link HTTP_INTERCEPTORS}
 * @see {@link provideHttpClient}
 */
export function withInterceptorsFromDi() {
    // Note: the legacy interceptor function is provided here via an intermediate token
    // (`LEGACY_INTERCEPTOR_FN`), using a pattern which guarantees that if these providers are
    // included multiple times, all of the multi-provider entries will have the same instance of the
    // interceptor function. That way, the `HttpINterceptorHandler` will dedup them and legacy
    // interceptors will not run multiple times.
    return makeHttpFeature(HttpFeatureKind.LegacyInterceptors, [
        {
            provide: LEGACY_INTERCEPTOR_FN,
            useFactory: legacyInterceptorFnFactory,
        },
        {
            provide: HTTP_INTERCEPTOR_FNS,
            useExisting: LEGACY_INTERCEPTOR_FN,
            multi: true,
        },
    ]);
}
/**
 * Customizes the XSRF protection for the configuration of the current `HttpClient` instance.
 *
 * This feature is incompatible with the `withNoXsrfProtection` feature.
 *
 * @see {@link provideHttpClient}
 */
export function withXsrfConfiguration({ cookieName, headerName, }) {
    const providers = [];
    if (cookieName !== undefined) {
        providers.push({ provide: XSRF_COOKIE_NAME, useValue: cookieName });
    }
    if (headerName !== undefined) {
        providers.push({ provide: XSRF_HEADER_NAME, useValue: headerName });
    }
    return makeHttpFeature(HttpFeatureKind.CustomXsrfConfiguration, providers);
}
/**
 * Disables XSRF protection in the configuration of the current `HttpClient` instance.
 *
 * This feature is incompatible with the `withXsrfConfiguration` feature.
 *
 * @see {@link provideHttpClient}
 */
export function withNoXsrfProtection() {
    return makeHttpFeature(HttpFeatureKind.NoXsrfProtection, [
        {
            provide: XSRF_ENABLED,
            useValue: false,
        },
    ]);
}
/**
 * Add JSONP support to the configuration of the current `HttpClient` instance.
 *
 * @see {@link provideHttpClient}
 */
export function withJsonpSupport() {
    return makeHttpFeature(HttpFeatureKind.JsonpSupport, [
        JsonpClientBackend,
        { provide: JsonpCallbackContext, useFactory: jsonpCallbackContext },
        { provide: HTTP_INTERCEPTOR_FNS, useValue: jsonpInterceptorFn, multi: true },
    ]);
}
/**
 * Configures the current `HttpClient` instance to make requests via the parent injector's
 * `HttpClient` instead of directly.
 *
 * By default, `provideHttpClient` configures `HttpClient` in its injector to be an independent
 * instance. For example, even if `HttpClient` is configured in the parent injector with
 * one or more interceptors, they will not intercept requests made via this instance.
 *
 * With this option enabled, once the request has passed through the current injector's
 * interceptors, it will be delegated to the parent injector's `HttpClient` chain instead of
 * dispatched directly, and interceptors in the parent configuration will be applied to the request.
 *
 * If there are several `HttpClient` instances in the injector hierarchy, it's possible for
 * `withRequestsMadeViaParent` to be used at multiple levels, which will cause the request to
 * "bubble up" until either reaching the root level or an `HttpClient` which was not configured with
 * this option.
 *
 * @see {@link provideHttpClient}
 * @developerPreview
 */
export function withRequestsMadeViaParent() {
    return makeHttpFeature(HttpFeatureKind.RequestsMadeViaParent, [
        {
            provide: HttpBackend,
            useFactory: () => {
                const handlerFromParent = inject(HttpHandler, { skipSelf: true, optional: true });
                if (ngDevMode && handlerFromParent === null) {
                    throw new Error('withRequestsMadeViaParent() can only be used when the parent injector also configures HttpClient');
                }
                return handlerFromParent;
            },
        },
    ]);
}
/**
 * Configures the current `HttpClient` instance to make requests using the fetch API.
 *
 * Note: The Fetch API doesn't support progress report on uploads.
 *
 * @publicApi
 */
export function withFetch() {
    return makeHttpFeature(HttpFeatureKind.Fetch, [
        FetchBackend,
        { provide: HttpBackend, useExisting: FetchBackend },
    ]);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vaHR0cC9zcmMvcHJvdmlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUVMLE1BQU0sRUFDTixjQUFjLEVBQ2Qsd0JBQXdCLEdBRXpCLE1BQU0sZUFBZSxDQUFDO0FBRXZCLE9BQU8sRUFBQyxXQUFXLEVBQUUsV0FBVyxFQUFDLE1BQU0sV0FBVyxDQUFDO0FBQ25ELE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFDcEMsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLFNBQVMsQ0FBQztBQUNyQyxPQUFPLEVBQ0wsb0JBQW9CLEVBRXBCLHNCQUFzQixFQUN0QiwwQkFBMEIsR0FDM0IsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUNMLG9CQUFvQixFQUNwQixvQkFBb0IsRUFDcEIsa0JBQWtCLEVBQ2xCLGtCQUFrQixHQUNuQixNQUFNLFNBQVMsQ0FBQztBQUNqQixPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sT0FBTyxDQUFDO0FBQ3JDLE9BQU8sRUFDTCx1QkFBdUIsRUFDdkIsc0JBQXNCLEVBQ3RCLGdCQUFnQixFQUNoQixZQUFZLEVBQ1osZ0JBQWdCLEVBQ2hCLGlCQUFpQixHQUNsQixNQUFNLFFBQVEsQ0FBQztBQUVoQjs7OztHQUlHO0FBQ0gsTUFBTSxDQUFOLElBQVksZUFRWDtBQVJELFdBQVksZUFBZTtJQUN6QixxRUFBWSxDQUFBO0lBQ1osaUZBQWtCLENBQUE7SUFDbEIsMkZBQXVCLENBQUE7SUFDdkIsNkVBQWdCLENBQUE7SUFDaEIscUVBQVksQ0FBQTtJQUNaLHVGQUFxQixDQUFBO0lBQ3JCLHVEQUFLLENBQUE7QUFDUCxDQUFDLEVBUlcsZUFBZSxLQUFmLGVBQWUsUUFRMUI7QUFZRCxTQUFTLGVBQWUsQ0FDdEIsSUFBVyxFQUNYLFNB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RDtZQUNFLE9BQU8sRUFBRSxXQUFXO1lBQ3BCLFVBQVUsRUFBRSxHQUFHLEVBQUU7Z0JBQ2YsTUFBTSxpQkFBaUIsR0FBRyxNQUFNLENBQUMsV0FBVyxFQUFFLEVBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztnQkFDaEYsSUFBSSxTQUFTLElBQUksaUJBQWlCLEtBQUssSUFBSSxFQUFFLENBQUM7b0JBQzVDLE1BQU0sSUFBSSxLQUFLLENBQ2Isa0dBQWtHLENBQ25HLENBQUM7Z0JBQ0osQ0FBQztnQkFDRCxPQUFPLGlCQUFpQixDQUFDO1lBQzNCLENBQUM7U0FDRjtLQUNGLENBQUMsQ0FBQztBQUNMLENBQUM7QUFFRDs7Ozs7O0dBTUc7QUFDSCxNQUFNLFVBQVUsU0FBUztJQUN2QixPQUFPLGVBQWUsQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFO1FBQzVDLFlBQVk7UUFDWixFQUFDLE9BQU8sRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBQztLQUNsRCxDQUFDLENBQUM7QUFDTCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBFbnZpcm9ubWVudFByb3ZpZGVycyxcbiAgaW5qZWN0LFxuICBJbmplY3Rpb25Ub2tlbixcbiAgbWFrZUVudmlyb25tZW50UHJvdmlkZXJzLFxuICBQcm92aWRlcixcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7SHR0cEJhY2tlbmQsIEh0dHBIYW5kbGVyfSBmcm9tICcuL2JhY2tlbmQnO1xuaW1wb3J0IHtIdHRwQ2xpZW50fSBmcm9tICcuL2NsaWVudCc7XG5pbXBvcnQge0ZldGNoQmFja2VuZH0gZnJvbSAnLi9mZXRjaCc7XG5pbXBvcnQge1xuICBIVFRQX0lOVEVSQ0VQVE9SX0ZOUyxcbiAgSHR0cEludGVyY2VwdG9yRm4sXG4gIEh0dHBJbnRlcmNlcHRvckhhbmRsZXIsXG4gIGxlZ2FjeUludGVyY2VwdG9yRm5GYWN0b3J5LFxufSBmcm9tICcuL2ludGVyY2VwdG9yJztcbmltcG9ydCB7XG4gIGpzb25wQ2FsbGJhY2tDb250ZXh0LFxuICBKc29ucENhbGxiYWNrQ29udGV4dCxcbiAgSnNvbnBDbGllbnRCYWNrZW5kLFxuICBqc29ucEludGVyY2VwdG9yRm4sXG59IGZyb20gJy4vanNvbnAnO1xuaW1wb3J0IHtIdHRwWGhyQmFja2VuZH0gZnJvbSAnLi94aHInO1xuaW1wb3J0IHtcbiAgSHR0cFhzcmZDb29raWVFeHRyYWN0b3IsXG4gIEh0dHBYc3JmVG9rZW5FeHRyYWN0b3IsXG4gIFhTUkZfQ09PS0lFX05BTUUsXG4gIFhTUkZfRU5BQkxFRCxcbiAgWFNSRl9IRUFERVJfTkFNRSxcbiAgeHNyZkludGVyY2VwdG9yRm4sXG59IGZyb20gJy4veHNyZic7XG5cbi8qKlxuICogSWRlbnRpZmllcyBhIHBhcnRpY3VsYXIga2luZCBvZiBgSHR0cEZlYXR1cmVgLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGVudW0gSHR0cEZlYXR1cmVLaW5kIHtcbiAgSW50ZXJjZXB0b3JzLFxuICBMZWdhY3lJbnRlcmNlcHRvcnMsXG4gIEN1c3RvbVhzcmZDb25maWd1cmF0aW9uLFxuICBOb1hzcmZQcm90ZWN0aW9uLFxuICBKc29ucFN1cHBvcnQsXG4gIFJlcXVlc3RzTWFkZVZpYVBhcmVudCxcbiAgRmV0Y2gsXG59XG5cbi8qKlxuICogQSBmZWF0dXJlIGZvciB1c2Ugd2hlbiBjb25maWd1cmluZyBgcHJvdmlkZUh0dHBDbGllbnRgLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBIdHRwRmVhdHVyZTxLaW5kVCBleHRlbmRzIEh0dHBGZWF0dXJlS2luZD4ge1xuICDJtWtpbmQ6IEtpbmRUO1xuICDJtXByb3ZpZGVyczogUHJvdmlkZXJbXTtcbn1cblxuZnVuY3Rpb24gbWFrZUh0dHBGZWF0dXJlPEtpbmRUIGV4dGVuZHMgSHR0cEZlYXR1cmVLaW5kPihcbiAga2luZDogS2luZFQsXG4gIHByb3ZpZGVyczogUHJvdmlkZXJbXSxcbik6IEh0dHBGZWF0dXJlPEtpbmRUPiB7XG4gIHJldHVybiB7XG4gICAgybVraW5kOiBraW5kLFxuICAgIMm1cHJvdmlkZXJzOiBwcm92aWRlcnMsXG4gIH07XG59XG5cbi8qKlxuICogQ29uZmlndXJlcyBBbmd1bGFyJ3MgYEh0dHBDbGllbnRgIHNlcnZpY2UgdG8gYmUgYXZhaWxhYmxlIGZvciBpbmplY3Rpb24uXG4gKlxuICogQnkgZGVmYXVsdCwgYEh0dHBDbGllbnRgIHdpbGwgYmUgY29uZmlndXJlZCBmb3IgaW5qZWN0aW9uIHdpdGggaXRzIGRlZmF1bHQgb3B0aW9ucyBmb3IgWFNSRlxuICogcHJvdGVjdGlvbiBvZiBvdXRnb2luZyByZXF1ZXN0cy4gQWRkaXRpb25hbCBjb25maWd1cmF0aW9uIG9wdGlvbnMgY2FuIGJlIHByb3ZpZGVkIGJ5IHBhc3NpbmdcbiAqIGZlYXR1cmUgZnVuY3Rpb25zIHRvIGBwcm92aWRlSHR0cENsaWVudGAuIEZvciBleGFtcGxlLCBIVFRQIGludGVyY2VwdG9ycyBjYW4gYmUgYWRkZWQgdXNpbmcgdGhlXG4gKiBgd2l0aEludGVyY2VwdG9ycyguLi4pYCBmZWF0dXJlLlxuICpcbiAqIDxkaXYgY2xhc3M9XCJhbGVydCBpcy1oZWxwZnVsXCI+XG4gKlxuICogSXQncyBzdHJvbmdseSByZWNvbW1lbmRlZCB0byBlbmFibGVcbiAqIFtgZmV0Y2hgXShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvRmV0Y2hfQVBJKSBmb3IgYXBwbGljYXRpb25zIHRoYXQgdXNlXG4gKiBTZXJ2ZXItU2lkZSBSZW5kZXJpbmcgZm9yIGJldHRlciBwZXJmb3JtYW5jZSBhbmQgY29tcGF0aWJpbGl0eS4gVG8gZW5hYmxlIGBmZXRjaGAsIGFkZFxuICogYHdpdGhGZXRjaCgpYCBmZWF0dXJlIHRvIHRoZSBgcHJvdmlkZUh0dHBDbGllbnQoKWAgY2FsbCBhdCB0aGUgcm9vdCBvZiB0aGUgYXBwbGljYXRpb246XG4gKlxuICogYGBgXG4gKiBwcm92aWRlSHR0cENsaWVudCh3aXRoRmV0Y2goKSk7XG4gKiBgYGBcbiAqXG4gKiA8L2Rpdj5cbiAqXG4gKiBAc2VlIHtAbGluayB3aXRoSW50ZXJjZXB0b3JzfVxuICogQHNlZSB7QGxpbmsgd2l0aEludGVyY2VwdG9yc0Zyb21EaX1cbiAqIEBzZWUge0BsaW5rIHdpdGhYc3JmQ29uZmlndXJhdGlvbn1cbiAqIEBzZWUge0BsaW5rIHdpdGhOb1hzcmZQcm90ZWN0aW9ufVxuICogQHNlZSB7QGxpbmsgd2l0aEpzb25wU3VwcG9ydH1cbiAqIEBzZWUge0BsaW5rIHdpdGhSZXF1ZXN0c01hZGVWaWFQYXJlbnR9XG4gKiBAc2VlIHtAbGluayB3aXRoRmV0Y2h9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcm92aWRlSHR0cENsaWVudChcbiAgLi4uZmVhdHVyZXM6IEh0dHBGZWF0dXJlPEh0dHBGZWF0dXJlS2luZD5bXVxuKTogRW52aXJvbm1lbnRQcm92aWRlcnMge1xuICBpZiAobmdEZXZNb2RlKSB7XG4gICAgY29uc3QgZmVhdHVyZUtpbmRzID0gbmV3IFNldChmZWF0dXJlcy5tYXAoKGYpID0+IGYuybVraW5kKSk7XG4gICAgaWYgKFxuICAgICAgZmVhdHVyZUtpbmRzLmhhcyhIdHRwRmVhdHVyZUtpbmQuTm9Yc3JmUHJvdGVjdGlvbikgJiZcbiAgICAgIGZlYXR1cmVLaW5kcy5oYXMoSHR0cEZlYXR1cmVLaW5kLkN1c3RvbVhzcmZDb25maWd1cmF0aW9uKVxuICAgICkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBuZ0Rldk1vZGVcbiAgICAgICAgICA/IGBDb25maWd1cmF0aW9uIGVycm9yOiBmb3VuZCBib3RoIHdpdGhYc3JmQ29uZmlndXJhdGlvbigpIGFuZCB3aXRoTm9Yc3JmUHJvdGVjdGlvbigpIGluIHRoZSBzYW1lIGNhbGwgdG8gcHJvdmlkZUh0dHBDbGllbnQoKSwgd2hpY2ggaXMgYSBjb250cmFkaWN0aW9uLmBcbiAgICAgICAgICA6ICcnLFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBwcm92aWRlcnM6IFByb3ZpZGVyW10gPSBbXG4gICAgSHR0cENsaWVudCxcbiAgICBIdHRwWGhyQmFja2VuZCxcbiAgICBIdHRwSW50ZXJjZXB0b3JIYW5kbGVyLFxuICAgIHtwcm92aWRlOiBIdHRwSGFuZGxlciwgdXNlRXhpc3Rpbmc6IEh0dHBJbnRlcmNlcHRvckhhbmRsZXJ9LFxuICAgIHtcbiAgICAgIHByb3ZpZGU6IEh0dHBCYWNrZW5kLFxuICAgICAgdXNlRmFjdG9yeTogKCkgPT4ge1xuICAgICAgICByZXR1cm4gaW5qZWN0KEZldGNoQmFja2VuZCwge29wdGlvbmFsOiB0cnVlfSkgPz8gaW5qZWN0KEh0dHBYaHJCYWNrZW5kKTtcbiAgICAgIH0sXG4gICAgfSxcbiAgICB7XG4gICAgICBwcm92aWRlOiBIVFRQX0lOVEVSQ0VQVE9SX0ZOUyxcbiAgICAgIHVzZVZhbHVlOiB4c3JmSW50ZXJjZXB0b3JGbixcbiAgICAgIG11bHRpOiB0cnVlLFxuICAgIH0sXG4gICAge3Byb3ZpZGU6IFhTUkZfRU5BQkxFRCwgdXNlVmFsdWU6IHRydWV9LFxuICAgIHtwcm92aWRlOiBIdHRwWHNyZlRva2VuRXh0cmFjdG9yLCB1c2VDbGFzczogSHR0cFhzcmZDb29raWVFeHRyYWN0b3J9LFxuICBdO1xuXG4gIGZvciAoY29uc3QgZmVhdHVyZSBvZiBmZWF0dXJlcykge1xuICAgIHByb3ZpZGVycy5wdXNoKC4uLmZlYXR1cmUuybVwcm92aWRlcnMpO1xuICB9XG5cbiAgcmV0dXJuIG1ha2VFbnZpcm9ubWVudFByb3ZpZGVycyhwcm92aWRlcnMpO1xufVxuXG4vKipcbiAqIEFkZHMgb25lIG9yIG1vcmUgZnVuY3Rpb25hbC1zdHlsZSBIVFRQIGludGVyY2VwdG9ycyB0byB0aGUgY29uZmlndXJhdGlvbiBvZiB0aGUgYEh0dHBDbGllbnRgXG4gKiBpbnN0YW5jZS5cbiAqXG4gKiBAc2VlIHtAbGluayBIdHRwSW50ZXJjZXB0b3JGbn1cbiAqIEBzZWUge0BsaW5rIHByb3ZpZGVIdHRwQ2xpZW50fVxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gd2l0aEludGVyY2VwdG9ycyhcbiAgaW50ZXJjZXB0b3JGbnM6IEh0dHBJbnRlcmNlcHRvckZuW10sXG4pOiBIdHRwRmVhdHVyZTxIdHRwRmVhdHVyZUtpbmQuSW50ZXJjZXB0b3JzPiB7XG4gIHJldHVybiBtYWtlSHR0cEZlYXR1cmUoXG4gICAgSHR0cEZlYXR1cmVLaW5kLkludGVyY2VwdG9ycyxcbiAgICBpbnRlcmNlcHRvckZucy5tYXAoKGludGVyY2VwdG9yRm4pID0+IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHByb3ZpZGU6IEhUVFBfSU5URVJDRVBUT1JfRk5TLFxuICAgICAgICB1c2VWYWx1ZTogaW50ZXJjZXB0b3JGbixcbiAgICAgICAgbXVsdGk6IHRydWUsXG4gICAgICB9O1xuICAgIH0pLFxuICApO1xufVxuXG5jb25zdCBMRUdBQ1lfSU5URVJDRVBUT1JfRk4gPSBuZXcgSW5qZWN0aW9uVG9rZW48SHR0cEludGVyY2VwdG9yRm4+KFxuICBuZ0Rldk1vZGUgPyAnTEVHQUNZX0lOVEVSQ0VQVE9SX0ZOJyA6ICcnLFxuKTtcblxuLyoqXG4gKiBJbmNsdWRlcyBjbGFzcy1iYXNlZCBpbnRlcmNlcHRvcnMgY29uZmlndXJlZCB1c2luZyBhIG11bHRpLXByb3ZpZGVyIGluIHRoZSBjdXJyZW50IGluamVjdG9yIGludG9cbiAqIHRoZSBjb25maWd1cmVkIGBIdHRwQ2xpZW50YCBpbnN0YW5jZS5cbiAqXG4gKiBQcmVmZXIgYHdpdGhJbnRlcmNlcHRvcnNgIGFuZCBmdW5jdGlvbmFsIGludGVyY2VwdG9ycyBpbnN0ZWFkLCBhcyBzdXBwb3J0IGZvciBESS1wcm92aWRlZFxuICogaW50ZXJjZXB0b3JzIG1heSBiZSBwaGFzZWQgb3V0IGluIGEgbGF0ZXIgcmVsZWFzZS5cbiAqXG4gKiBAc2VlIHtAbGluayBIdHRwSW50ZXJjZXB0b3J9XG4gKiBAc2VlIHtAbGluayBIVFRQX0lOVEVSQ0VQVE9SU31cbiAqIEBzZWUge0BsaW5rIHByb3ZpZGVIdHRwQ2xpZW50fVxuICovXG5leHBvcnQgZnVuY3Rpb24gd2l0aEludGVyY2VwdG9yc0Zyb21EaSgpOiBIdHRwRmVhdHVyZTxIdHRwRmVhdHVyZUtpbmQuTGVnYWN5SW50ZXJjZXB0b3JzPiB7XG4gIC8vIE5vdGU6IHRoZSBsZWdhY3kgaW50ZXJjZXB0b3IgZnVuY3Rpb24gaXMgcHJvdmlkZWQgaGVyZSB2aWEgYW4gaW50ZXJtZWRpYXRlIHRva2VuXG4gIC8vIChgTEVHQUNZX0lOVEVSQ0VQVE9SX0ZOYCksIHVzaW5nIGEgcGF0dGVybiB3aGljaCBndWFyYW50ZWVzIHRoYXQgaWYgdGhlc2UgcHJvdmlkZXJzIGFyZVxuICAvLyBpbmNsdWRlZCBtdWx0aXBsZSB0aW1lcywgYWxsIG9mIHRoZSBtdWx0aS1wcm92aWRlciBlbnRyaWVzIHdpbGwgaGF2ZSB0aGUgc2FtZSBpbnN0YW5jZSBvZiB0aGVcbiAgLy8gaW50ZXJjZXB0b3IgZnVuY3Rpb24uIFRoYXQgd2F5LCB0aGUgYEh0dHBJTnRlcmNlcHRvckhhbmRsZXJgIHdpbGwgZGVkdXAgdGhlbSBhbmQgbGVnYWN5XG4gIC8vIGludGVyY2VwdG9ycyB3aWxsIG5vdCBydW4gbXVsdGlwbGUgdGltZXMuXG4gIHJldHVybiBtYWtlSHR0cEZlYXR1cmUoSHR0cEZlYXR1cmVLaW5kLkxlZ2FjeUludGVyY2VwdG9ycywgW1xuICAgIHtcbiAgICAgIHByb3ZpZGU6IExFR0FDWV9JTlRFUkNFUFRPUl9GTixcbiAgICAgIHVzZUZhY3Rvcnk6IGxlZ2FjeUludGVyY2VwdG9yRm5GYWN0b3J5LFxuICAgIH0sXG4gICAge1xuICAgICAgcHJvdmlkZTogSFRUUF9JTlRFUkNFUFRPUl9GTlMsXG4gICAgICB1c2VFeGlzdGluZzogTEVHQUNZX0lOVEVSQ0VQVE9SX0ZOLFxuICAgICAgbXVsdGk6IHRydWUsXG4gICAgfSxcbiAgXSk7XG59XG5cbi8qKlxuICogQ3VzdG9taXplcyB0aGUgWFNSRiBwcm90ZWN0aW9uIGZvciB0aGUgY29uZmlndXJhdGlvbiBvZiB0aGUgY3VycmVudCBgSHR0cENsaWVudGAgaW5zdGFuY2UuXG4gKlxuICogVGhpcyBmZWF0dXJlIGlzIGluY29tcGF0aWJsZSB3aXRoIHRoZSBgd2l0aE5vWHNyZlByb3RlY3Rpb25gIGZlYXR1cmUuXG4gKlxuICogQHNlZSB7QGxpbmsgcHJvdmlkZUh0dHBDbGllbnR9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3aXRoWHNyZkNvbmZpZ3VyYXRpb24oe1xuICBjb29raWVOYW1lLFxuICBoZWFkZXJOYW1lLFxufToge1xuICBjb29raWVOYW1lPzogc3RyaW5nO1xuICBoZWFkZXJOYW1lPzogc3RyaW5nO1xufSk6IEh0dHBGZWF0dXJlPEh0dHBGZWF0dXJlS2luZC5DdXN0b21Yc3JmQ29uZmlndXJhdGlvbj4ge1xuICBjb25zdCBwcm92aWRlcnM6IFByb3ZpZGVyW10gPSBbXTtcbiAgaWYgKGNvb2tpZU5hbWUgIT09IHVuZGVmaW5lZCkge1xuICAgIHByb3ZpZGVycy5wdXNoKHtwcm92aWRlOiBYU1JGX0NPT0tJRV9OQU1FLCB1c2VWYWx1ZTogY29va2llTmFtZX0pO1xuICB9XG4gIGlmIChoZWFkZXJOYW1lICE9PSB1bmRlZmluZWQpIHtcbiAgICBwcm92aWRlcnMucHVzaCh7cHJvdmlkZTogWFNSRl9IRUFERVJfTkFNRSwgdXNlVmFsdWU6IGhlYWRlck5hbWV9KTtcbiAgfVxuXG4gIHJldHVybiBtYWtlSHR0cEZlYXR1cmUoSHR0cEZlYXR1cmVLaW5kLkN1c3RvbVhzcmZDb25maWd1cmF0aW9uLCBwcm92aWRlcnMpO1xufVxuXG4vKipcbiAqIERpc2FibGVzIFhTUkYgcHJvdGVjdGlvbiBpbiB0aGUgY29uZmlndXJhdGlvbiBvZiB0aGUgY3VycmVudCBgSHR0cENsaWVudGAgaW5zdGFuY2UuXG4gKlxuICogVGhpcyBmZWF0dXJlIGlzIGluY29tcGF0aWJsZSB3aXRoIHRoZSBgd2l0aFhzcmZDb25maWd1cmF0aW9uYCBmZWF0dXJlLlxuICpcbiAqIEBzZWUge0BsaW5rIHByb3ZpZGVIdHRwQ2xpZW50fVxuICovXG5leHBvcnQgZnVuY3Rpb24gd2l0aE5vWHNyZlByb3RlY3Rpb24oKTogSHR0cEZlYXR1cmU8SHR0cEZlYXR1cmVLaW5kLk5vWHNyZlByb3RlY3Rpb24+IHtcbiAgcmV0dXJuIG1ha2VIdHRwRmVhdHVyZShIdHRwRmVhdHVyZUtpbmQuTm9Yc3JmUHJvdGVjdGlvbiwgW1xuICAgIHtcbiAgICAgIHByb3ZpZGU6IFhTUkZfRU5BQkxFRCxcbiAgICAgIHVzZVZhbHVlOiBmYWxzZSxcbiAgICB9LFxuICBdKTtcbn1cblxuLyoqXG4gKiBBZGQgSlNPTlAgc3VwcG9ydCB0byB0aGUgY29uZmlndXJhdGlvbiBvZiB0aGUgY3VycmVudCBgSHR0cENsaWVudGAgaW5zdGFuY2UuXG4gKlxuICogQHNlZSB7QGxpbmsgcHJvdmlkZUh0dHBDbGllbnR9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3aXRoSnNvbnBTdXBwb3J0KCk6IEh0dHBGZWF0dXJlPEh0dHBGZWF0dXJlS2luZC5Kc29ucFN1cHBvcnQ+IHtcbiAgcmV0dXJuIG1ha2VIdHRwRmVhdHVyZShIdHRwRmVhdHVyZUtpbmQuSnNvbnBTdXBwb3J0LCBbXG4gICAgSnNvbnBDbGllbnRCYWNrZW5kLFxuICAgIHtwcm92aWRlOiBKc29ucENhbGxiYWNrQ29udGV4dCwgdXNlRmFjdG9yeToganNvbnBDYWxsYmFja0NvbnRleHR9LFxuICAgIHtwcm92aWRlOiBIVFRQX0lOVEVSQ0VQVE9SX0ZOUywgdXNlVmFsdWU6IGpzb25wSW50ZXJjZXB0b3JGbiwgbXVsdGk6IHRydWV9LFxuICBdKTtcbn1cblxuLyoqXG4gKiBDb25maWd1cmVzIHRoZSBjdXJyZW50IGBIdHRwQ2xpZW50YCBpbnN0YW5jZSB0byBtYWtlIHJlcXVlc3RzIHZpYSB0aGUgcGFyZW50IGluamVjdG9yJ3NcbiAqIGBIdHRwQ2xpZW50YCBpbnN0ZWFkIG9mIGRpcmVjdGx5LlxuICpcbiAqIEJ5IGRlZmF1bHQsIGBwcm92aWRlSHR0cENsaWVudGAgY29uZmlndXJlcyBgSHR0cENsaWVudGAgaW4gaXRzIGluamVjdG9yIHRvIGJlIGFuIGluZGVwZW5kZW50XG4gKiBpbnN0YW5jZS4gRm9yIGV4YW1wbGUsIGV2ZW4gaWYgYEh0dHBDbGllbnRgIGlzIGNvbmZpZ3VyZWQgaW4gdGhlIHBhcmVudCBpbmplY3RvciB3aXRoXG4gKiBvbmUgb3IgbW9yZSBpbnRlcmNlcHRvcnMsIHRoZXkgd2lsbCBub3QgaW50ZXJjZXB0IHJlcXVlc3RzIG1hZGUgdmlhIHRoaXMgaW5zdGFuY2UuXG4gKlxuICogV2l0aCB0aGlzIG9wdGlvbiBlbmFibGVkLCBvbmNlIHRoZSByZXF1ZXN0IGhhcyBwYXNzZWQgdGhyb3VnaCB0aGUgY3VycmVudCBpbmplY3RvcidzXG4gKiBpbnRlcmNlcHRvcnMsIGl0IHdpbGwgYmUgZGVsZWdhdGVkIHRvIHRoZSBwYXJlbnQgaW5qZWN0b3IncyBgSHR0cENsaWVudGAgY2hhaW4gaW5zdGVhZCBvZlxuICogZGlzcGF0Y2hlZCBkaXJlY3RseSwgYW5kIGludGVyY2VwdG9ycyBpbiB0aGUgcGFyZW50IGNvbmZpZ3VyYXRpb24gd2lsbCBiZSBhcHBsaWVkIHRvIHRoZSByZXF1ZXN0LlxuICpcbiAqIElmIHRoZXJlIGFyZSBzZXZlcmFsIGBIdHRwQ2xpZW50YCBpbnN0YW5jZXMgaW4gdGhlIGluamVjdG9yIGhpZXJhcmNoeSwgaXQncyBwb3NzaWJsZSBmb3JcbiAqIGB3aXRoUmVxdWVzdHNNYWRlVmlhUGFyZW50YCB0byBiZSB1c2VkIGF0IG11bHRpcGxlIGxldmVscywgd2hpY2ggd2lsbCBjYXVzZSB0aGUgcmVxdWVzdCB0b1xuICogXCJidWJibGUgdXBcIiB1bnRpbCBlaXRoZXIgcmVhY2hpbmcgdGhlIHJvb3QgbGV2ZWwgb3IgYW4gYEh0dHBDbGllbnRgIHdoaWNoIHdhcyBub3QgY29uZmlndXJlZCB3aXRoXG4gKiB0aGlzIG9wdGlvbi5cbiAqXG4gKiBAc2VlIHtAbGluayBwcm92aWRlSHR0cENsaWVudH1cbiAqIEBkZXZlbG9wZXJQcmV2aWV3XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3aXRoUmVxdWVzdHNNYWRlVmlhUGFyZW50KCk6IEh0dHBGZWF0dXJlPEh0dHBGZWF0dXJlS2luZC5SZXF1ZXN0c01hZGVWaWFQYXJlbnQ+IHtcbiAgcmV0dXJuIG1ha2VIdHRwRmVhdHVyZShIdHRwRmVhdHVyZUtpbmQuUmVxdWVzdHNNYWRlVmlhUGFyZW50LCBbXG4gICAge1xuICAgICAgcHJvdmlkZTogSHR0cEJhY2tlbmQsXG4gICAgICB1c2VGYWN0b3J5OiAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGhhbmRsZXJGcm9tUGFyZW50ID0gaW5qZWN0KEh0dHBIYW5kbGVyLCB7c2tpcFNlbGY6IHRydWUsIG9wdGlvbmFsOiB0cnVlfSk7XG4gICAgICAgIGlmIChuZ0Rldk1vZGUgJiYgaGFuZGxlckZyb21QYXJlbnQgPT09IG51bGwpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAnd2l0aFJlcXVlc3RzTWFkZVZpYVBhcmVudCgpIGNhbiBvbmx5IGJlIHVzZWQgd2hlbiB0aGUgcGFyZW50IGluamVjdG9yIGFsc28gY29uZmlndXJlcyBIdHRwQ2xpZW50JyxcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBoYW5kbGVyRnJvbVBhcmVudDtcbiAgICAgIH0sXG4gICAgfSxcbiAgXSk7XG59XG5cbi8qKlxuICogQ29uZmlndXJlcyB0aGUgY3VycmVudCBgSHR0cENsaWVudGAgaW5zdGFuY2UgdG8gbWFrZSByZXF1ZXN0cyB1c2luZyB0aGUgZmV0Y2ggQVBJLlxuICpcbiAqIE5vdGU6IFRoZSBGZXRjaCBBUEkgZG9lc24ndCBzdXBwb3J0IHByb2dyZXNzIHJlcG9ydCBvbiB1cGxvYWRzLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdpdGhGZXRjaCgpOiBIdHRwRmVhdHVyZTxIdHRwRmVhdHVyZUtpbmQuRmV0Y2g+IHtcbiAgcmV0dXJuIG1ha2VIdHRwRmVhdHVyZShIdHRwRmVhdHVyZUtpbmQuRmV0Y2gsIFtcbiAgICBGZXRjaEJhY2tlbmQsXG4gICAge3Byb3ZpZGU6IEh0dHBCYWNrZW5kLCB1c2VFeGlzdGluZzogRmV0Y2hCYWNrZW5kfSxcbiAgXSk7XG59XG4iXX0=