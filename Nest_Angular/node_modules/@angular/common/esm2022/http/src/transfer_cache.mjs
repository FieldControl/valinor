/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { APP_BOOTSTRAP_LISTENER, ApplicationRef, inject, InjectionToken, makeStateKey, PLATFORM_ID, TransferState, ɵformatRuntimeError as formatRuntimeError, ɵperformanceMarkFeature as performanceMarkFeature, ɵtruncateMiddle as truncateMiddle, ɵwhenStable as whenStable, ɵRuntimeError as RuntimeError, } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HttpHeaders } from './headers';
import { HTTP_ROOT_INTERCEPTOR_FNS } from './interceptor';
import { HttpResponse } from './response';
/**
 * If your application uses different HTTP origins to make API calls (via `HttpClient`) on the server and
 * on the client, the `HTTP_TRANSFER_CACHE_ORIGIN_MAP` token allows you to establish a mapping
 * between those origins, so that `HttpTransferCache` feature can recognize those requests as the same
 * ones and reuse the data cached on the server during hydration on the client.
 *
 * **Important note**: the `HTTP_TRANSFER_CACHE_ORIGIN_MAP` token should *only* be provided in
 * the *server* code of your application (typically in the `app.server.config.ts` script). Angular throws an
 * error if it detects that the token is defined while running on the client.
 *
 * @usageNotes
 *
 * When the same API endpoint is accessed via `http://internal-domain.com:8080` on the server and
 * via `https://external-domain.com` on the client, you can use the following configuration:
 * ```typescript
 * // in app.server.config.ts
 * {
 *     provide: HTTP_TRANSFER_CACHE_ORIGIN_MAP,
 *     useValue: {
 *         'http://internal-domain.com:8080': 'https://external-domain.com'
 *     }
 * }
 * ```
 *
 * @publicApi
 */
export const HTTP_TRANSFER_CACHE_ORIGIN_MAP = new InjectionToken(ngDevMode ? 'HTTP_TRANSFER_CACHE_ORIGIN_MAP' : '');
/**
 * Keys within cached response data structure.
 */
export const BODY = 'b';
export const HEADERS = 'h';
export const STATUS = 's';
export const STATUS_TEXT = 'st';
export const REQ_URL = 'u';
export const RESPONSE_TYPE = 'rt';
const CACHE_OPTIONS = new InjectionToken(ngDevMode ? 'HTTP_TRANSFER_STATE_CACHE_OPTIONS' : '');
/**
 * A list of allowed HTTP methods to cache.
 */
const ALLOWED_METHODS = ['GET', 'HEAD'];
export function transferCacheInterceptorFn(req, next) {
    const { isCacheActive, ...globalOptions } = inject(CACHE_OPTIONS);
    const { transferCache: requestOptions, method: requestMethod } = req;
    // In the following situations we do not want to cache the request
    if (!isCacheActive ||
        requestOptions === false ||
        // POST requests are allowed either globally or at request level
        (requestMethod === 'POST' && !globalOptions.includePostRequests && !requestOptions) ||
        (requestMethod !== 'POST' && !ALLOWED_METHODS.includes(requestMethod)) ||
        // Do not cache request that require authorization when includeRequestsWithAuthHeaders is falsey
        (!globalOptions.includeRequestsWithAuthHeaders && hasAuthHeaders(req)) ||
        globalOptions.filter?.(req) === false) {
        return next(req);
    }
    const transferState = inject(TransferState);
    const originMap = inject(HTTP_TRANSFER_CACHE_ORIGIN_MAP, {
        optional: true,
    });
    const isServer = isPlatformServer(inject(PLATFORM_ID));
    if (originMap && !isServer) {
        throw new RuntimeError(2803 /* RuntimeErrorCode.HTTP_ORIGIN_MAP_USED_IN_CLIENT */, ngDevMode &&
            'Angular detected that the `HTTP_TRANSFER_CACHE_ORIGIN_MAP` token is configured and ' +
                'present in the client side code. Please ensure that this token is only provided in the ' +
                'server code of the application.');
    }
    const requestUrl = isServer && originMap ? mapRequestOriginUrl(req.url, originMap) : req.url;
    const storeKey = makeCacheKey(req, requestUrl);
    const response = transferState.get(storeKey, null);
    let headersToInclude = globalOptions.includeHeaders;
    if (typeof requestOptions === 'object' && requestOptions.includeHeaders) {
        // Request-specific config takes precedence over the global config.
        headersToInclude = requestOptions.includeHeaders;
    }
    if (response) {
        const { [BODY]: undecodedBody, [RESPONSE_TYPE]: responseType, [HEADERS]: httpHeaders, [STATUS]: status, [STATUS_TEXT]: statusText, [REQ_URL]: url, } = response;
        // Request found in cache. Respond using it.
        let body = undecodedBody;
        switch (responseType) {
            case 'arraybuffer':
                body = new TextEncoder().encode(undecodedBody).buffer;
                break;
            case 'blob':
                body = new Blob([undecodedBody]);
                break;
        }
        // We want to warn users accessing a header provided from the cache
        // That HttpTransferCache alters the headers
        // The warning will be logged a single time by HttpHeaders instance
        let headers = new HttpHeaders(httpHeaders);
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
            // Append extra logic in dev mode to produce a warning when a header
            // that was not transferred to the client is accessed in the code via `get`
            // and `has` calls.
            headers = appendMissingHeadersDetection(req.url, headers, headersToInclude ?? []);
        }
        return of(new HttpResponse({
            body,
            headers,
            status,
            statusText,
            url,
        }));
    }
    // Request not found in cache. Make the request and cache it if on the server.
    return next(req).pipe(tap((event) => {
        if (event instanceof HttpResponse && isServer) {
            transferState.set(storeKey, {
                [BODY]: event.body,
                [HEADERS]: getFilteredHeaders(event.headers, headersToInclude),
                [STATUS]: event.status,
                [STATUS_TEXT]: event.statusText,
                [REQ_URL]: requestUrl,
                [RESPONSE_TYPE]: req.responseType,
            });
        }
    }));
}
/** @returns true when the requests contains autorization related headers. */
function hasAuthHeaders(req) {
    return req.headers.has('authorization') || req.headers.has('proxy-authorization');
}
function getFilteredHeaders(headers, includeHeaders) {
    if (!includeHeaders) {
        return {};
    }
    const headersMap = {};
    for (const key of includeHeaders) {
        const values = headers.getAll(key);
        if (values !== null) {
            headersMap[key] = values;
        }
    }
    return headersMap;
}
function sortAndConcatParams(params) {
    return [...params.keys()]
        .sort()
        .map((k) => `${k}=${params.getAll(k)}`)
        .join('&');
}
function makeCacheKey(request, mappedRequestUrl) {
    // make the params encoded same as a url so it's easy to identify
    const { params, method, responseType } = request;
    const encodedParams = sortAndConcatParams(params);
    let serializedBody = request.serializeBody();
    if (serializedBody instanceof URLSearchParams) {
        serializedBody = sortAndConcatParams(serializedBody);
    }
    else if (typeof serializedBody !== 'string') {
        serializedBody = '';
    }
    const key = [method, responseType, mappedRequestUrl, serializedBody, encodedParams].join('|');
    const hash = generateHash(key);
    return makeStateKey(hash);
}
/**
 * A method that returns a hash representation of a string using a variant of DJB2 hash
 * algorithm.
 *
 * This is the same hashing logic that is used to generate component ids.
 */
function generateHash(value) {
    let hash = 0;
    for (const char of value) {
        hash = (Math.imul(31, hash) + char.charCodeAt(0)) << 0;
    }
    // Force positive number hash.
    // 2147483647 = equivalent of Integer.MAX_VALUE.
    hash += 2147483647 + 1;
    return hash.toString();
}
/**
 * Returns the DI providers needed to enable HTTP transfer cache.
 *
 * By default, when using server rendering, requests are performed twice: once on the server and
 * other one on the browser.
 *
 * When these providers are added, requests performed on the server are cached and reused during the
 * bootstrapping of the application in the browser thus avoiding duplicate requests and reducing
 * load time.
 *
 */
export function withHttpTransferCache(cacheOptions) {
    return [
        {
            provide: CACHE_OPTIONS,
            useFactory: () => {
                performanceMarkFeature('NgHttpTransferCache');
                return { isCacheActive: true, ...cacheOptions };
            },
        },
        {
            provide: HTTP_ROOT_INTERCEPTOR_FNS,
            useValue: transferCacheInterceptorFn,
            multi: true,
            deps: [TransferState, CACHE_OPTIONS],
        },
        {
            provide: APP_BOOTSTRAP_LISTENER,
            multi: true,
            useFactory: () => {
                const appRef = inject(ApplicationRef);
                const cacheState = inject(CACHE_OPTIONS);
                return () => {
                    whenStable(appRef).then(() => {
                        cacheState.isCacheActive = false;
                    });
                };
            },
        },
    ];
}
/**
 * This function will add a proxy to an HttpHeader to intercept calls to get/has
 * and log a warning if the header entry requested has been removed
 */
function appendMissingHeadersDetection(url, headers, headersToInclude) {
    const warningProduced = new Set();
    return new Proxy(headers, {
        get(target, prop) {
            const value = Reflect.get(target, prop);
            const methods = new Set(['get', 'has', 'getAll']);
            if (typeof value !== 'function' || !methods.has(prop)) {
                return value;
            }
            return (headerName) => {
                // We log when the key has been removed and a warning hasn't been produced for the header
                const key = (prop + ':' + headerName).toLowerCase(); // e.g. `get:cache-control`
                if (!headersToInclude.includes(headerName) && !warningProduced.has(key)) {
                    warningProduced.add(key);
                    const truncatedUrl = truncateMiddle(url);
                    // TODO: create Error guide for this warning
                    console.warn(formatRuntimeError(2802 /* RuntimeErrorCode.HEADERS_ALTERED_BY_TRANSFER_CACHE */, `Angular detected that the \`${headerName}\` header is accessed, but the value of the header ` +
                        `was not transferred from the server to the client by the HttpTransferCache. ` +
                        `To include the value of the \`${headerName}\` header for the \`${truncatedUrl}\` request, ` +
                        `use the \`includeHeaders\` list. The \`includeHeaders\` can be defined either ` +
                        `on a request level by adding the \`transferCache\` parameter, or on an application ` +
                        `level by adding the \`httpCacheTransfer.includeHeaders\` argument to the ` +
                        `\`provideClientHydration()\` call. `));
                }
                // invoking the original method
                return value.apply(target, [headerName]);
            };
        },
    });
}
function mapRequestOriginUrl(url, originMap) {
    const origin = new URL(url, 'resolve://').origin;
    const mappedOrigin = originMap[origin];
    if (!mappedOrigin) {
        return url;
    }
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
        verifyMappedOrigin(mappedOrigin);
    }
    return url.replace(origin, mappedOrigin);
}
function verifyMappedOrigin(url) {
    if (new URL(url, 'resolve://').pathname !== '/') {
        throw new RuntimeError(2804 /* RuntimeErrorCode.HTTP_ORIGIN_MAP_CONTAINS_PATH */, 'Angular detected a URL with a path segment in the value provided for the ' +
            `\`HTTP_TRANSFER_CACHE_ORIGIN_MAP\` token: ${url}. The map should only contain origins ` +
            'without any other segments.');
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmZXJfY2FjaGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vaHR0cC9zcmMvdHJhbnNmZXJfY2FjaGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLHNCQUFzQixFQUN0QixjQUFjLEVBQ2QsTUFBTSxFQUNOLGNBQWMsRUFDZCxZQUFZLEVBQ1osV0FBVyxFQUdYLGFBQWEsRUFDYixtQkFBbUIsSUFBSSxrQkFBa0IsRUFDekMsdUJBQXVCLElBQUksc0JBQXNCLEVBQ2pELGVBQWUsSUFBSSxjQUFjLEVBQ2pDLFdBQVcsSUFBSSxVQUFVLEVBQ3pCLGFBQWEsSUFBSSxZQUFZLEdBQzlCLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQ2pELE9BQU8sRUFBYSxFQUFFLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDcEMsT0FBTyxFQUFDLEdBQUcsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBR25DLE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxXQUFXLENBQUM7QUFDdEMsT0FBTyxFQUFDLHlCQUF5QixFQUFnQixNQUFNLGVBQWUsQ0FBQztBQUV2RSxPQUFPLEVBQVksWUFBWSxFQUFDLE1BQU0sWUFBWSxDQUFDO0FBeUJuRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXlCRztBQUNILE1BQU0sQ0FBQyxNQUFNLDhCQUE4QixHQUFHLElBQUksY0FBYyxDQUM5RCxTQUFTLENBQUMsQ0FBQyxDQUFDLGdDQUFnQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQ2xELENBQUM7QUFFRjs7R0FFRztBQUVILE1BQU0sQ0FBQyxNQUFNLElBQUksR0FBRyxHQUFHLENBQUM7QUFDeEIsTUFBTSxDQUFDLE1BQU0sT0FBTyxHQUFHLEdBQUcsQ0FBQztBQUMzQixNQUFNLENBQUMsTUFBTSxN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QXFDLENBQ3hDLENBQ0YsQ0FBQztnQkFDSixDQUFDO2dCQUVELCtCQUErQjtnQkFDL0IsT0FBUSxLQUFrQixDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQ3pELENBQUMsQ0FBQztRQUNKLENBQUM7S0FDRixDQUFDLENBQUM7QUFDTCxDQUFDO0FBRUQsU0FBUyxtQkFBbUIsQ0FBQyxHQUFXLEVBQUUsU0FBaUM7SUFDekUsTUFBTSxNQUFNLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFLFlBQVksQ0FBQyxDQUFDLE1BQU0sQ0FBQztJQUNqRCxNQUFNLFlBQVksR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDdkMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ2xCLE9BQU8sR0FBRyxDQUFDO0lBQ2IsQ0FBQztJQUVELElBQUksT0FBTyxTQUFTLEtBQUssV0FBVyxJQUFJLFNBQVMsRUFBRSxDQUFDO1FBQ2xELGtCQUFrQixDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFFRCxPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLFlBQVksQ0FBQyxDQUFDO0FBQzNDLENBQUM7QUFFRCxTQUFTLGtCQUFrQixDQUFDLEdBQVc7SUFDckMsSUFBSSxJQUFJLEdBQUcsQ0FBQyxHQUFHLEVBQUUsWUFBWSxDQUFDLENBQUMsUUFBUSxLQUFLLEdBQUcsRUFBRSxDQUFDO1FBQ2hELE1BQU0sSUFBSSxZQUFZLDREQUVwQiwyRUFBMkU7WUFDekUsNkNBQTZDLEdBQUcsd0NBQXdDO1lBQ3hGLDZCQUE2QixDQUNoQyxDQUFDO0lBQ0osQ0FBQztBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIEFQUF9CT09UU1RSQVBfTElTVEVORVIsXG4gIEFwcGxpY2F0aW9uUmVmLFxuICBpbmplY3QsXG4gIEluamVjdGlvblRva2VuLFxuICBtYWtlU3RhdGVLZXksXG4gIFBMQVRGT1JNX0lELFxuICBQcm92aWRlcixcbiAgU3RhdGVLZXksXG4gIFRyYW5zZmVyU3RhdGUsXG4gIMm1Zm9ybWF0UnVudGltZUVycm9yIGFzIGZvcm1hdFJ1bnRpbWVFcnJvcixcbiAgybVwZXJmb3JtYW5jZU1hcmtGZWF0dXJlIGFzIHBlcmZvcm1hbmNlTWFya0ZlYXR1cmUsXG4gIMm1dHJ1bmNhdGVNaWRkbGUgYXMgdHJ1bmNhdGVNaWRkbGUsXG4gIMm1d2hlblN0YWJsZSBhcyB3aGVuU3RhYmxlLFxuICDJtVJ1bnRpbWVFcnJvciBhcyBSdW50aW1lRXJyb3IsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtpc1BsYXRmb3JtU2VydmVyfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtPYnNlcnZhYmxlLCBvZn0gZnJvbSAncnhqcyc7XG5pbXBvcnQge3RhcH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5pbXBvcnQge1J1bnRpbWVFcnJvckNvZGV9IGZyb20gJy4vZXJyb3JzJztcbmltcG9ydCB7SHR0cEhlYWRlcnN9IGZyb20gJy4vaGVhZGVycyc7XG5pbXBvcnQge0hUVFBfUk9PVF9JTlRFUkNFUFRPUl9GTlMsIEh0dHBIYW5kbGVyRm59IGZyb20gJy4vaW50ZXJjZXB0b3InO1xuaW1wb3J0IHtIdHRwUmVxdWVzdH0gZnJvbSAnLi9yZXF1ZXN0JztcbmltcG9ydCB7SHR0cEV2ZW50LCBIdHRwUmVzcG9uc2V9IGZyb20gJy4vcmVzcG9uc2UnO1xuaW1wb3J0IHtIdHRwUGFyYW1zfSBmcm9tICcuL3BhcmFtcyc7XG5cbi8qKlxuICogT3B0aW9ucyB0byBjb25maWd1cmUgaG93IFRyYW5zZmVyQ2FjaGUgc2hvdWxkIGJlIHVzZWQgdG8gY2FjaGUgcmVxdWVzdHMgbWFkZSB2aWEgSHR0cENsaWVudC5cbiAqXG4gKiBAcGFyYW0gaW5jbHVkZUhlYWRlcnMgU3BlY2lmaWVzIHdoaWNoIGhlYWRlcnMgc2hvdWxkIGJlIGluY2x1ZGVkIGludG8gY2FjaGVkIHJlc3BvbnNlcy4gTm9cbiAqICAgICBoZWFkZXJzIGFyZSBpbmNsdWRlZCBieSBkZWZhdWx0LlxuICogQHBhcmFtIGZpbHRlciBBIGZ1bmN0aW9uIHRoYXQgcmVjZWl2ZXMgYSByZXF1ZXN0IGFzIGFuIGFyZ3VtZW50IGFuZCByZXR1cm5zIGEgYm9vbGVhbiB0byBpbmRpY2F0ZVxuICogICAgIHdoZXRoZXIgYSByZXF1ZXN0IHNob3VsZCBiZSBpbmNsdWRlZCBpbnRvIHRoZSBjYWNoZS5cbiAqIEBwYXJhbSBpbmNsdWRlUG9zdFJlcXVlc3RzIEVuYWJsZXMgY2FjaGluZyBmb3IgUE9TVCByZXF1ZXN0cy4gQnkgZGVmYXVsdCwgb25seSBHRVQgYW5kIEhFQURcbiAqICAgICByZXF1ZXN0cyBhcmUgY2FjaGVkLiBUaGlzIG9wdGlvbiBjYW4gYmUgZW5hYmxlZCBpZiBQT1NUIHJlcXVlc3RzIGFyZSB1c2VkIHRvIHJldHJpZXZlIGRhdGFcbiAqICAgICAoZm9yIGV4YW1wbGUgdXNpbmcgR3JhcGhRTCkuXG4gKiBAcGFyYW0gaW5jbHVkZVJlcXVlc3RzV2l0aEF1dGhIZWFkZXJzIEVuYWJsZXMgY2FjaGluZyBvZiByZXF1ZXN0cyBjb250YWluaW5nIGVpdGhlciBgQXV0aG9yaXphdGlvbmBcbiAqICAgICBvciBgUHJveHktQXV0aG9yaXphdGlvbmAgaGVhZGVycy4gQnkgZGVmYXVsdCwgdGhlc2UgcmVxdWVzdHMgYXJlIGV4Y2x1ZGVkIGZyb20gY2FjaGluZy5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCB0eXBlIEh0dHBUcmFuc2ZlckNhY2hlT3B0aW9ucyA9IHtcbiAgaW5jbHVkZUhlYWRlcnM/OiBzdHJpbmdbXTtcbiAgZmlsdGVyPzogKHJlcTogSHR0cFJlcXVlc3Q8dW5rbm93bj4pID0+IGJvb2xlYW47XG4gIGluY2x1ZGVQb3N0UmVxdWVzdHM/OiBib29sZWFuO1xuICBpbmNsdWRlUmVxdWVzdHNXaXRoQXV0aEhlYWRlcnM/OiBib29sZWFuO1xufTtcblxuLyoqXG4gKiBJZiB5b3VyIGFwcGxpY2F0aW9uIHVzZXMgZGlmZmVyZW50IEhUVFAgb3JpZ2lucyB0byBtYWtlIEFQSSBjYWxscyAodmlhIGBIdHRwQ2xpZW50YCkgb24gdGhlIHNlcnZlciBhbmRcbiAqIG9uIHRoZSBjbGllbnQsIHRoZSBgSFRUUF9UUkFOU0ZFUl9DQUNIRV9PUklHSU5fTUFQYCB0b2tlbiBhbGxvd3MgeW91IHRvIGVzdGFibGlzaCBhIG1hcHBpbmdcbiAqIGJldHdlZW4gdGhvc2Ugb3JpZ2lucywgc28gdGhhdCBgSHR0cFRyYW5zZmVyQ2FjaGVgIGZlYXR1cmUgY2FuIHJlY29nbml6ZSB0aG9zZSByZXF1ZXN0cyBhcyB0aGUgc2FtZVxuICogb25lcyBhbmQgcmV1c2UgdGhlIGRhdGEgY2FjaGVkIG9uIHRoZSBzZXJ2ZXIgZHVyaW5nIGh5ZHJhdGlvbiBvbiB0aGUgY2xpZW50LlxuICpcbiAqICoqSW1wb3J0YW50IG5vdGUqKjogdGhlIGBIVFRQX1RSQU5TRkVSX0NBQ0hFX09SSUdJTl9NQVBgIHRva2VuIHNob3VsZCAqb25seSogYmUgcHJvdmlkZWQgaW5cbiAqIHRoZSAqc2VydmVyKiBjb2RlIG9mIHlvdXIgYXBwbGljYXRpb24gKHR5cGljYWxseSBpbiB0aGUgYGFwcC5zZXJ2ZXIuY29uZmlnLnRzYCBzY3JpcHQpLiBBbmd1bGFyIHRocm93cyBhblxuICogZXJyb3IgaWYgaXQgZGV0ZWN0cyB0aGF0IHRoZSB0b2tlbiBpcyBkZWZpbmVkIHdoaWxlIHJ1bm5pbmcgb24gdGhlIGNsaWVudC5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqIFdoZW4gdGhlIHNhbWUgQVBJIGVuZHBvaW50IGlzIGFjY2Vzc2VkIHZpYSBgaHR0cDovL2ludGVybmFsLWRvbWFpbi5jb206ODA4MGAgb24gdGhlIHNlcnZlciBhbmRcbiAqIHZpYSBgaHR0cHM6Ly9leHRlcm5hbC1kb21haW4uY29tYCBvbiB0aGUgY2xpZW50LCB5b3UgY2FuIHVzZSB0aGUgZm9sbG93aW5nIGNvbmZpZ3VyYXRpb246XG4gKiBgYGB0eXBlc2NyaXB0XG4gKiAvLyBpbiBhcHAuc2VydmVyLmNvbmZpZy50c1xuICoge1xuICogICAgIHByb3ZpZGU6IEhUVFBfVFJBTlNGRVJfQ0FDSEVfT1JJR0lOX01BUCxcbiAqICAgICB1c2VWYWx1ZToge1xuICogICAgICAgICAnaHR0cDovL2ludGVybmFsLWRvbWFpbi5jb206ODA4MCc6ICdodHRwczovL2V4dGVybmFsLWRvbWFpbi5jb20nXG4gKiAgICAgfVxuICogfVxuICogYGBgXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY29uc3QgSFRUUF9UUkFOU0ZFUl9DQUNIRV9PUklHSU5fTUFQID0gbmV3IEluamVjdGlvblRva2VuPFJlY29yZDxzdHJpbmcsIHN0cmluZz4+KFxuICBuZ0Rldk1vZGUgPyAnSFRUUF9UUkFOU0ZFUl9DQUNIRV9PUklHSU5fTUFQJyA6ICcnLFxuKTtcblxuLyoqXG4gKiBLZXlzIHdpdGhpbiBjYWNoZWQgcmVzcG9uc2UgZGF0YSBzdHJ1Y3R1cmUuXG4gKi9cblxuZXhwb3J0IGNvbnN0IEJPRFkgPSAnYic7XG5leHBvcnQgY29uc3QgSEVBREVSUyA9ICdoJztcbmV4cG9ydCBjb25zdCBTVEFUVVMgPSAncyc7XG5leHBvcnQgY29uc3QgU1RBVFVTX1RFWFQgPSAnc3QnO1xuZXhwb3J0IGNvbnN0IFJFUV9VUkwgPSAndSc7XG5leHBvcnQgY29uc3QgUkVTUE9OU0VfVFlQRSA9ICdydCc7XG5cbmludGVyZmFjZSBUcmFuc2Zlckh0dHBSZXNwb25zZSB7XG4gIC8qKiBib2R5ICovXG4gIFtCT0RZXTogYW55O1xuICAvKiogaGVhZGVycyAqL1xuICBbSEVBREVSU106IFJlY29yZDxzdHJpbmcsIHN0cmluZ1tdPjtcbiAgLyoqIHN0YXR1cyAqL1xuICBbU1RBVFVTXT86IG51bWJlcjtcbiAgLyoqIHN0YXR1c1RleHQgKi9cbiAgW1NUQVRVU19URVhUXT86IHN0cmluZztcbiAgLyoqIHVybCAqL1xuICBbUkVRX1VSTF0/OiBzdHJpbmc7XG4gIC8qKiByZXNwb25zZVR5cGUgKi9cbiAgW1JFU1BPTlNFX1RZUEVdPzogSHR0cFJlcXVlc3Q8dW5rbm93bj5bJ3Jlc3BvbnNlVHlwZSddO1xufVxuXG5pbnRlcmZhY2UgQ2FjaGVPcHRpb25zIGV4dGVuZHMgSHR0cFRyYW5zZmVyQ2FjaGVPcHRpb25zIHtcbiAgaXNDYWNoZUFjdGl2ZTogYm9vbGVhbjtcbn1cblxuY29uc3QgQ0FDSEVfT1BUSU9OUyA9IG5ldyBJbmplY3Rpb25Ub2tlbjxDYWNoZU9wdGlvbnM+KFxuICBuZ0Rldk1vZGUgPyAnSFRUUF9UUkFOU0ZFUl9TVEFURV9DQUNIRV9PUFRJT05TJyA6ICcnLFxuKTtcblxuLyoqXG4gKiBBIGxpc3Qgb2YgYWxsb3dlZCBIVFRQIG1ldGhvZHMgdG8gY2FjaGUuXG4gKi9cbmNvbnN0IEFMTE9XRURfTUVUSE9EUyA9IFsnR0VUJywgJ0hFQUQnXTtcblxuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zZmVyQ2FjaGVJbnRlcmNlcHRvckZuKFxuICByZXE6IEh0dHBSZXF1ZXN0PHVua25vd24+LFxuICBuZXh0OiBIdHRwSGFuZGxlckZuLFxuKTogT2JzZXJ2YWJsZTxIdHRwRXZlbnQ8dW5rbm93bj4+IHtcbiAgY29uc3Qge2lzQ2FjaGVBY3RpdmUsIC4uLmdsb2JhbE9wdGlvbnN9ID0gaW5qZWN0KENBQ0hFX09QVElPTlMpO1xuICBjb25zdCB7dHJhbnNmZXJDYWNoZTogcmVxdWVzdE9wdGlvbnMsIG1ldGhvZDogcmVxdWVzdE1ldGhvZH0gPSByZXE7XG5cbiAgLy8gSW4gdGhlIGZvbGxvd2luZyBzaXR1YXRpb25zIHdlIGRvIG5vdCB3YW50IHRvIGNhY2hlIHRoZSByZXF1ZXN0XG4gIGlmIChcbiAgICAhaXNDYWNoZUFjdGl2ZSB8fFxuICAgIHJlcXVlc3RPcHRpb25zID09PSBmYWxzZSB8fFxuICAgIC8vIFBPU1QgcmVxdWVzdHMgYXJlIGFsbG93ZWQgZWl0aGVyIGdsb2JhbGx5IG9yIGF0IHJlcXVlc3QgbGV2ZWxcbiAgICAocmVxdWVzdE1ldGhvZCA9PT0gJ1BPU1QnICYmICFnbG9iYWxPcHRpb25zLmluY2x1ZGVQb3N0UmVxdWVzdHMgJiYgIXJlcXVlc3RPcHRpb25zKSB8fFxuICAgIChyZXF1ZXN0TWV0aG9kICE9PSAnUE9TVCcgJiYgIUFMTE9XRURfTUVUSE9EUy5pbmNsdWRlcyhyZXF1ZXN0TWV0aG9kKSkgfHxcbiAgICAvLyBEbyBub3QgY2FjaGUgcmVxdWVzdCB0aGF0IHJlcXVpcmUgYXV0aG9yaXphdGlvbiB3aGVuIGluY2x1ZGVSZXF1ZXN0c1dpdGhBdXRoSGVhZGVycyBpcyBmYWxzZXlcbiAgICAoIWdsb2JhbE9wdGlvbnMuaW5jbHVkZVJlcXVlc3RzV2l0aEF1dGhIZWFkZXJzICYmIGhhc0F1dGhIZWFkZXJzKHJlcSkpIHx8XG4gICAgZ2xvYmFsT3B0aW9ucy5maWx0ZXI/LihyZXEpID09PSBmYWxzZVxuICApIHtcbiAgICByZXR1cm4gbmV4dChyZXEpO1xuICB9XG5cbiAgY29uc3QgdHJhbnNmZXJTdGF0ZSA9IGluamVjdChUcmFuc2ZlclN0YXRlKTtcblxuICBjb25zdCBvcmlnaW5NYXA6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gfCBudWxsID0gaW5qZWN0KEhUVFBfVFJBTlNGRVJfQ0FDSEVfT1JJR0lOX01BUCwge1xuICAgIG9wdGlvbmFsOiB0cnVlLFxuICB9KTtcbiAgY29uc3QgaXNTZXJ2ZXIgPSBpc1BsYXRmb3JtU2VydmVyKGluamVjdChQTEFURk9STV9JRCkpO1xuICBpZiAob3JpZ2luTWFwICYmICFpc1NlcnZlcikge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICBSdW50aW1lRXJyb3JDb2RlLkhUVFBfT1JJR0lOX01BUF9VU0VEX0lOX0NMSUVOVCxcbiAgICAgIG5nRGV2TW9kZSAmJlxuICAgICAgICAnQW5ndWxhciBkZXRlY3RlZCB0aGF0IHRoZSBgSFRUUF9UUkFOU0ZFUl9DQUNIRV9PUklHSU5fTUFQYCB0b2tlbiBpcyBjb25maWd1cmVkIGFuZCAnICtcbiAgICAgICAgICAncHJlc2VudCBpbiB0aGUgY2xpZW50IHNpZGUgY29kZS4gUGxlYXNlIGVuc3VyZSB0aGF0IHRoaXMgdG9rZW4gaXMgb25seSBwcm92aWRlZCBpbiB0aGUgJyArXG4gICAgICAgICAgJ3NlcnZlciBjb2RlIG9mIHRoZSBhcHBsaWNhdGlvbi4nLFxuICAgICk7XG4gIH1cblxuICBjb25zdCByZXF1ZXN0VXJsID0gaXNTZXJ2ZXIgJiYgb3JpZ2luTWFwID8gbWFwUmVxdWVzdE9yaWdpblVybChyZXEudXJsLCBvcmlnaW5NYXApIDogcmVxLnVybDtcblxuICBjb25zdCBzdG9yZUtleSA9IG1ha2VDYWNoZUtleShyZXEsIHJlcXVlc3RVcmwpO1xuICBjb25zdCByZXNwb25zZSA9IHRyYW5zZmVyU3RhdGUuZ2V0KHN0b3JlS2V5LCBudWxsKTtcblxuICBsZXQgaGVhZGVyc1RvSW5jbHVkZSA9IGdsb2JhbE9wdGlvbnMuaW5jbHVkZUhlYWRlcnM7XG4gIGlmICh0eXBlb2YgcmVxdWVzdE9wdGlvbnMgPT09ICdvYmplY3QnICYmIHJlcXVlc3RPcHRpb25zLmluY2x1ZGVIZWFkZXJzKSB7XG4gICAgLy8gUmVxdWVzdC1zcGVjaWZpYyBjb25maWcgdGFrZXMgcHJlY2VkZW5jZSBvdmVyIHRoZSBnbG9iYWwgY29uZmlnLlxuICAgIGhlYWRlcnNUb0luY2x1ZGUgPSByZXF1ZXN0T3B0aW9ucy5pbmNsdWRlSGVhZGVycztcbiAgfVxuXG4gIGlmIChyZXNwb25zZSkge1xuICAgIGNvbnN0IHtcbiAgICAgIFtCT0RZXTogdW5kZWNvZGVkQm9keSxcbiAgICAgIFtSRVNQT05TRV9UWVBFXTogcmVzcG9uc2VUeXBlLFxuICAgICAgW0hFQURFUlNdOiBodHRwSGVhZGVycyxcbiAgICAgIFtTVEFUVVNdOiBzdGF0dXMsXG4gICAgICBbU1RBVFVTX1RFWFRdOiBzdGF0dXNUZXh0LFxuICAgICAgW1JFUV9VUkxdOiB1cmwsXG4gICAgfSA9IHJlc3BvbnNlO1xuICAgIC8vIFJlcXVlc3QgZm91bmQgaW4gY2FjaGUuIFJlc3BvbmQgdXNpbmcgaXQuXG4gICAgbGV0IGJvZHk6IEFycmF5QnVmZmVyIHwgQmxvYiB8IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVjb2RlZEJvZHk7XG5cbiAgICBzd2l0Y2ggKHJlc3BvbnNlVHlwZSkge1xuICAgICAgY2FzZSAnYXJyYXlidWZmZXInOlxuICAgICAgICBib2R5ID0gbmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKHVuZGVjb2RlZEJvZHkpLmJ1ZmZlcjtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdibG9iJzpcbiAgICAgICAgYm9keSA9IG5ldyBCbG9iKFt1bmRlY29kZWRCb2R5XSk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIC8vIFdlIHdhbnQgdG8gd2FybiB1c2VycyBhY2Nlc3NpbmcgYSBoZWFkZXIgcHJvdmlkZWQgZnJvbSB0aGUgY2FjaGVcbiAgICAvLyBUaGF0IEh0dHBUcmFuc2ZlckNhY2hlIGFsdGVycyB0aGUgaGVhZGVyc1xuICAgIC8vIFRoZSB3YXJuaW5nIHdpbGwgYmUgbG9nZ2VkIGEgc2luZ2xlIHRpbWUgYnkgSHR0cEhlYWRlcnMgaW5zdGFuY2VcbiAgICBsZXQgaGVhZGVycyA9IG5ldyBIdHRwSGVhZGVycyhodHRwSGVhZGVycyk7XG4gICAgaWYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkge1xuICAgICAgLy8gQXBwZW5kIGV4dHJhIGxvZ2ljIGluIGRldiBtb2RlIHRvIHByb2R1Y2UgYSB3YXJuaW5nIHdoZW4gYSBoZWFkZXJcbiAgICAgIC8vIHRoYXQgd2FzIG5vdCB0cmFuc2ZlcnJlZCB0byB0aGUgY2xpZW50IGlzIGFjY2Vzc2VkIGluIHRoZSBjb2RlIHZpYSBgZ2V0YFxuICAgICAgLy8gYW5kIGBoYXNgIGNhbGxzLlxuICAgICAgaGVhZGVycyA9IGFwcGVuZE1pc3NpbmdIZWFkZXJzRGV0ZWN0aW9uKHJlcS51cmwsIGhlYWRlcnMsIGhlYWRlcnNUb0luY2x1ZGUgPz8gW10pO1xuICAgIH1cblxuICAgIHJldHVybiBvZihcbiAgICAgIG5ldyBIdHRwUmVzcG9uc2Uoe1xuICAgICAgICBib2R5LFxuICAgICAgICBoZWFkZXJzLFxuICAgICAgICBzdGF0dXMsXG4gICAgICAgIHN0YXR1c1RleHQsXG4gICAgICAgIHVybCxcbiAgICAgIH0pLFxuICAgICk7XG4gIH1cblxuICAvLyBSZXF1ZXN0IG5vdCBmb3VuZCBpbiBjYWNoZS4gTWFrZSB0aGUgcmVxdWVzdCBhbmQgY2FjaGUgaXQgaWYgb24gdGhlIHNlcnZlci5cbiAgcmV0dXJuIG5leHQocmVxKS5waXBlKFxuICAgIHRhcCgoZXZlbnQ6IEh0dHBFdmVudDx1bmtub3duPikgPT4ge1xuICAgICAgaWYgKGV2ZW50IGluc3RhbmNlb2YgSHR0cFJlc3BvbnNlICYmIGlzU2VydmVyKSB7XG4gICAgICAgIHRyYW5zZmVyU3RhdGUuc2V0PFRyYW5zZmVySHR0cFJlc3BvbnNlPihzdG9yZUtleSwge1xuICAgICAgICAgIFtCT0RZXTogZXZlbnQuYm9keSxcbiAgICAgICAgICBbSEVBREVSU106IGdldEZpbHRlcmVkSGVhZGVycyhldmVudC5oZWFkZXJzLCBoZWFkZXJzVG9JbmNsdWRlKSxcbiAgICAgICAgICBbU1RBVFVTXTogZXZlbnQuc3RhdHVzLFxuICAgICAgICAgIFtTVEFUVVNfVEVYVF06IGV2ZW50LnN0YXR1c1RleHQsXG4gICAgICAgICAgW1JFUV9VUkxdOiByZXF1ZXN0VXJsLFxuICAgICAgICAgIFtSRVNQT05TRV9UWVBFXTogcmVxLnJlc3BvbnNlVHlwZSxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSksXG4gICk7XG59XG5cbi8qKiBAcmV0dXJucyB0cnVlIHdoZW4gdGhlIHJlcXVlc3RzIGNvbnRhaW5zIGF1dG9yaXphdGlvbiByZWxhdGVkIGhlYWRlcnMuICovXG5mdW5jdGlvbiBoYXNBdXRoSGVhZGVycyhyZXE6IEh0dHBSZXF1ZXN0PHVua25vd24+KTogYm9vbGVhbiB7XG4gIHJldHVybiByZXEuaGVhZGVycy5oYXMoJ2F1dGhvcml6YXRpb24nKSB8fCByZXEuaGVhZGVycy5oYXMoJ3Byb3h5LWF1dGhvcml6YXRpb24nKTtcbn1cblxuZnVuY3Rpb24gZ2V0RmlsdGVyZWRIZWFkZXJzKFxuICBoZWFkZXJzOiBIdHRwSGVhZGVycyxcbiAgaW5jbHVkZUhlYWRlcnM6IHN0cmluZ1tdIHwgdW5kZWZpbmVkLFxuKTogUmVjb3JkPHN0cmluZywgc3RyaW5nW10+IHtcbiAgaWYgKCFpbmNsdWRlSGVhZGVycykge1xuICAgIHJldHVybiB7fTtcbiAgfVxuXG4gIGNvbnN0IGhlYWRlcnNNYXA6IFJlY29yZDxzdHJpbmcsIHN0cmluZ1tdPiA9IHt9O1xuICBmb3IgKGNvbnN0IGtleSBvZiBpbmNsdWRlSGVhZGVycykge1xuICAgIGNvbnN0IHZhbHVlcyA9IGhlYWRlcnMuZ2V0QWxsKGtleSk7XG4gICAgaWYgKHZhbHVlcyAhPT0gbnVsbCkge1xuICAgICAgaGVhZGVyc01hcFtrZXldID0gdmFsdWVzO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBoZWFkZXJzTWFwO1xufVxuXG5mdW5jdGlvbiBzb3J0QW5kQ29uY2F0UGFyYW1zKHBhcmFtczogSHR0cFBhcmFtcyB8IFVSTFNlYXJjaFBhcmFtcyk6IHN0cmluZyB7XG4gIHJldHVybiBbLi4ucGFyYW1zLmtleXMoKV1cbiAgICAuc29ydCgpXG4gICAgLm1hcCgoaykgPT4gYCR7a309JHtwYXJhbXMuZ2V0QWxsKGspfWApXG4gICAgLmpvaW4oJyYnKTtcbn1cblxuZnVuY3Rpb24gbWFrZUNhY2hlS2V5KFxuICByZXF1ZXN0OiBIdHRwUmVxdWVzdDxhbnk+LFxuICBtYXBwZWRSZXF1ZXN0VXJsOiBzdHJpbmcsXG4pOiBTdGF0ZUtleTxUcmFuc2Zlckh0dHBSZXNwb25zZT4ge1xuICAvLyBtYWtlIHRoZSBwYXJhbXMgZW5jb2RlZCBzYW1lIGFzIGEgdXJsIHNvIGl0J3MgZWFzeSB0byBpZGVudGlmeVxuICBjb25zdCB7cGFyYW1zLCBtZXRob2QsIHJlc3BvbnNlVHlwZX0gPSByZXF1ZXN0O1xuICBjb25zdCBlbmNvZGVkUGFyYW1zID0gc29ydEFuZENvbmNhdFBhcmFtcyhwYXJhbXMpO1xuXG4gIGxldCBzZXJpYWxpemVkQm9keSA9IHJlcXVlc3Quc2VyaWFsaXplQm9keSgpO1xuICBpZiAoc2VyaWFsaXplZEJvZHkgaW5zdGFuY2VvZiBVUkxTZWFyY2hQYXJhbXMpIHtcbiAgICBzZXJpYWxpemVkQm9keSA9IHNvcnRBbmRDb25jYXRQYXJhbXMoc2VyaWFsaXplZEJvZHkpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBzZXJpYWxpemVkQm9keSAhPT0gJ3N0cmluZycpIHtcbiAgICBzZXJpYWxpemVkQm9keSA9ICcnO1xuICB9XG5cbiAgY29uc3Qga2V5ID0gW21ldGhvZCwgcmVzcG9uc2VUeXBlLCBtYXBwZWRSZXF1ZXN0VXJsLCBzZXJpYWxpemVkQm9keSwgZW5jb2RlZFBhcmFtc10uam9pbignfCcpO1xuICBjb25zdCBoYXNoID0gZ2VuZXJhdGVIYXNoKGtleSk7XG5cbiAgcmV0dXJuIG1ha2VTdGF0ZUtleShoYXNoKTtcbn1cblxuLyoqXG4gKiBBIG1ldGhvZCB0aGF0IHJldHVybnMgYSBoYXNoIHJlcHJlc2VudGF0aW9uIG9mIGEgc3RyaW5nIHVzaW5nIGEgdmFyaWFudCBvZiBESkIyIGhhc2hcbiAqIGFsZ29yaXRobS5cbiAqXG4gKiBUaGlzIGlzIHRoZSBzYW1lIGhhc2hpbmcgbG9naWMgdGhhdCBpcyB1c2VkIHRvIGdlbmVyYXRlIGNvbXBvbmVudCBpZHMuXG4gKi9cbmZ1bmN0aW9uIGdlbmVyYXRlSGFzaCh2YWx1ZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgbGV0IGhhc2ggPSAwO1xuXG4gIGZvciAoY29uc3QgY2hhciBvZiB2YWx1ZSkge1xuICAgIGhhc2ggPSAoTWF0aC5pbXVsKDMxLCBoYXNoKSArIGNoYXIuY2hhckNvZGVBdCgwKSkgPDwgMDtcbiAgfVxuXG4gIC8vIEZvcmNlIHBvc2l0aXZlIG51bWJlciBoYXNoLlxuICAvLyAyMTQ3NDgzNjQ3ID0gZXF1aXZhbGVudCBvZiBJbnRlZ2VyLk1BWF9WQUxVRS5cbiAgaGFzaCArPSAyMTQ3NDgzNjQ3ICsgMTtcblxuICByZXR1cm4gaGFzaC50b1N0cmluZygpO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIERJIHByb3ZpZGVycyBuZWVkZWQgdG8gZW5hYmxlIEhUVFAgdHJhbnNmZXIgY2FjaGUuXG4gKlxuICogQnkgZGVmYXVsdCwgd2hlbiB1c2luZyBzZXJ2ZXIgcmVuZGVyaW5nLCByZXF1ZXN0cyBhcmUgcGVyZm9ybWVkIHR3aWNlOiBvbmNlIG9uIHRoZSBzZXJ2ZXIgYW5kXG4gKiBvdGhlciBvbmUgb24gdGhlIGJyb3dzZXIuXG4gKlxuICogV2hlbiB0aGVzZSBwcm92aWRlcnMgYXJlIGFkZGVkLCByZXF1ZXN0cyBwZXJmb3JtZWQgb24gdGhlIHNlcnZlciBhcmUgY2FjaGVkIGFuZCByZXVzZWQgZHVyaW5nIHRoZVxuICogYm9vdHN0cmFwcGluZyBvZiB0aGUgYXBwbGljYXRpb24gaW4gdGhlIGJyb3dzZXIgdGh1cyBhdm9pZGluZyBkdXBsaWNhdGUgcmVxdWVzdHMgYW5kIHJlZHVjaW5nXG4gKiBsb2FkIHRpbWUuXG4gKlxuICovXG5leHBvcnQgZnVuY3Rpb24gd2l0aEh0dHBUcmFuc2ZlckNhY2hlKGNhY2hlT3B0aW9uczogSHR0cFRyYW5zZmVyQ2FjaGVPcHRpb25zKTogUHJvdmlkZXJbXSB7XG4gIHJldHVybiBbXG4gICAge1xuICAgICAgcHJvdmlkZTogQ0FDSEVfT1BUSU9OUyxcbiAgICAgIHVzZUZhY3Rvcnk6ICgpOiBDYWNoZU9wdGlvbnMgPT4ge1xuICAgICAgICBwZXJmb3JtYW5jZU1hcmtGZWF0dXJlKCdOZ0h0dHBUcmFuc2ZlckNhY2hlJyk7XG4gICAgICAgIHJldHVybiB7aXNDYWNoZUFjdGl2ZTogdHJ1ZSwgLi4uY2FjaGVPcHRpb25zfTtcbiAgICAgIH0sXG4gICAgfSxcbiAgICB7XG4gICAgICBwcm92aWRlOiBIVFRQX1JPT1RfSU5URVJDRVBUT1JfRk5TLFxuICAgICAgdXNlVmFsdWU6IHRyYW5zZmVyQ2FjaGVJbnRlcmNlcHRvckZuLFxuICAgICAgbXVsdGk6IHRydWUsXG4gICAgICBkZXBzOiBbVHJhbnNmZXJTdGF0ZSwgQ0FDSEVfT1BUSU9OU10sXG4gICAgfSxcbiAgICB7XG4gICAgICBwcm92aWRlOiBBUFBfQk9PVFNUUkFQX0xJU1RFTkVSLFxuICAgICAgbXVsdGk6IHRydWUsXG4gICAgICB1c2VGYWN0b3J5OiAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGFwcFJlZiA9IGluamVjdChBcHBsaWNhdGlvblJlZik7XG4gICAgICAgIGNvbnN0IGNhY2hlU3RhdGUgPSBpbmplY3QoQ0FDSEVfT1BUSU9OUyk7XG5cbiAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICB3aGVuU3RhYmxlKGFwcFJlZikudGhlbigoKSA9PiB7XG4gICAgICAgICAgICBjYWNoZVN0YXRlLmlzQ2FjaGVBY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgIH0sXG4gICAgfSxcbiAgXTtcbn1cblxuLyoqXG4gKiBUaGlzIGZ1bmN0aW9uIHdpbGwgYWRkIGEgcHJveHkgdG8gYW4gSHR0cEhlYWRlciB0byBpbnRlcmNlcHQgY2FsbHMgdG8gZ2V0L2hhc1xuICogYW5kIGxvZyBhIHdhcm5pbmcgaWYgdGhlIGhlYWRlciBlbnRyeSByZXF1ZXN0ZWQgaGFzIGJlZW4gcmVtb3ZlZFxuICovXG5mdW5jdGlvbiBhcHBlbmRNaXNzaW5nSGVhZGVyc0RldGVjdGlvbihcbiAgdXJsOiBzdHJpbmcsXG4gIGhlYWRlcnM6IEh0dHBIZWFkZXJzLFxuICBoZWFkZXJzVG9JbmNsdWRlOiBzdHJpbmdbXSxcbik6IEh0dHBIZWFkZXJzIHtcbiAgY29uc3Qgd2FybmluZ1Byb2R1Y2VkID0gbmV3IFNldCgpO1xuICByZXR1cm4gbmV3IFByb3h5PEh0dHBIZWFkZXJzPihoZWFkZXJzLCB7XG4gICAgZ2V0KHRhcmdldDogSHR0cEhlYWRlcnMsIHByb3A6IGtleW9mIEh0dHBIZWFkZXJzKTogdW5rbm93biB7XG4gICAgICBjb25zdCB2YWx1ZSA9IFJlZmxlY3QuZ2V0KHRhcmdldCwgcHJvcCk7XG4gICAgICBjb25zdCBtZXRob2RzOiBTZXQ8a2V5b2YgSHR0cEhlYWRlcnM+ID0gbmV3IFNldChbJ2dldCcsICdoYXMnLCAnZ2V0QWxsJ10pO1xuXG4gICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnZnVuY3Rpb24nIHx8ICFtZXRob2RzLmhhcyhwcm9wKSkge1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiAoaGVhZGVyTmFtZTogc3RyaW5nKSA9PiB7XG4gICAgICAgIC8vIFdlIGxvZyB3aGVuIHRoZSBrZXkgaGFzIGJlZW4gcmVtb3ZlZCBhbmQgYSB3YXJuaW5nIGhhc24ndCBiZWVuIHByb2R1Y2VkIGZvciB0aGUgaGVhZGVyXG4gICAgICAgIGNvbnN0IGtleSA9IChwcm9wICsgJzonICsgaGVhZGVyTmFtZSkudG9Mb3dlckNhc2UoKTsgLy8gZS5nLiBgZ2V0OmNhY2hlLWNvbnRyb2xgXG4gICAgICAgIGlmICghaGVhZGVyc1RvSW5jbHVkZS5pbmNsdWRlcyhoZWFkZXJOYW1lKSAmJiAhd2FybmluZ1Byb2R1Y2VkLmhhcyhrZXkpKSB7XG4gICAgICAgICAgd2FybmluZ1Byb2R1Y2VkLmFkZChrZXkpO1xuICAgICAgICAgIGNvbnN0IHRydW5jYXRlZFVybCA9IHRydW5jYXRlTWlkZGxlKHVybCk7XG5cbiAgICAgICAgICAvLyBUT0RPOiBjcmVhdGUgRXJyb3IgZ3VpZGUgZm9yIHRoaXMgd2FybmluZ1xuICAgICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICAgIGZvcm1hdFJ1bnRpbWVFcnJvcihcbiAgICAgICAgICAgICAgUnVudGltZUVycm9yQ29kZS5IRUFERVJTX0FMVEVSRURfQllfVFJBTlNGRVJfQ0FDSEUsXG4gICAgICAgICAgICAgIGBBbmd1bGFyIGRldGVjdGVkIHRoYXQgdGhlIFxcYCR7aGVhZGVyTmFtZX1cXGAgaGVhZGVyIGlzIGFjY2Vzc2VkLCBidXQgdGhlIHZhbHVlIG9mIHRoZSBoZWFkZXIgYCArXG4gICAgICAgICAgICAgICAgYHdhcyBub3QgdHJhbnNmZXJyZWQgZnJvbSB0aGUgc2VydmVyIHRvIHRoZSBjbGllbnQgYnkgdGhlIEh0dHBUcmFuc2ZlckNhY2hlLiBgICtcbiAgICAgICAgICAgICAgICBgVG8gaW5jbHVkZSB0aGUgdmFsdWUgb2YgdGhlIFxcYCR7aGVhZGVyTmFtZX1cXGAgaGVhZGVyIGZvciB0aGUgXFxgJHt0cnVuY2F0ZWRVcmx9XFxgIHJlcXVlc3QsIGAgK1xuICAgICAgICAgICAgICAgIGB1c2UgdGhlIFxcYGluY2x1ZGVIZWFkZXJzXFxgIGxpc3QuIFRoZSBcXGBpbmNsdWRlSGVhZGVyc1xcYCBjYW4gYmUgZGVmaW5lZCBlaXRoZXIgYCArXG4gICAgICAgICAgICAgICAgYG9uIGEgcmVxdWVzdCBsZXZlbCBieSBhZGRpbmcgdGhlIFxcYHRyYW5zZmVyQ2FjaGVcXGAgcGFyYW1ldGVyLCBvciBvbiBhbiBhcHBsaWNhdGlvbiBgICtcbiAgICAgICAgICAgICAgICBgbGV2ZWwgYnkgYWRkaW5nIHRoZSBcXGBodHRwQ2FjaGVUcmFuc2Zlci5pbmNsdWRlSGVhZGVyc1xcYCBhcmd1bWVudCB0byB0aGUgYCArXG4gICAgICAgICAgICAgICAgYFxcYHByb3ZpZGVDbGllbnRIeWRyYXRpb24oKVxcYCBjYWxsLiBgLFxuICAgICAgICAgICAgKSxcbiAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaW52b2tpbmcgdGhlIG9yaWdpbmFsIG1ldGhvZFxuICAgICAgICByZXR1cm4gKHZhbHVlIGFzIEZ1bmN0aW9uKS5hcHBseSh0YXJnZXQsIFtoZWFkZXJOYW1lXSk7XG4gICAgICB9O1xuICAgIH0sXG4gIH0pO1xufVxuXG5mdW5jdGlvbiBtYXBSZXF1ZXN0T3JpZ2luVXJsKHVybDogc3RyaW5nLCBvcmlnaW5NYXA6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4pOiBzdHJpbmcge1xuICBjb25zdCBvcmlnaW4gPSBuZXcgVVJMKHVybCwgJ3Jlc29sdmU6Ly8nKS5vcmlnaW47XG4gIGNvbnN0IG1hcHBlZE9yaWdpbiA9IG9yaWdpbk1hcFtvcmlnaW5dO1xuICBpZiAoIW1hcHBlZE9yaWdpbikge1xuICAgIHJldHVybiB1cmw7XG4gIH1cblxuICBpZiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSB7XG4gICAgdmVyaWZ5TWFwcGVkT3JpZ2luKG1hcHBlZE9yaWdpbik7XG4gIH1cblxuICByZXR1cm4gdXJsLnJlcGxhY2Uob3JpZ2luLCBtYXBwZWRPcmlnaW4pO1xufVxuXG5mdW5jdGlvbiB2ZXJpZnlNYXBwZWRPcmlnaW4odXJsOiBzdHJpbmcpOiB2b2lkIHtcbiAgaWYgKG5ldyBVUkwodXJsLCAncmVzb2x2ZTovLycpLnBhdGhuYW1lICE9PSAnLycpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgUnVudGltZUVycm9yQ29kZS5IVFRQX09SSUdJTl9NQVBfQ09OVEFJTlNfUEFUSCxcbiAgICAgICdBbmd1bGFyIGRldGVjdGVkIGEgVVJMIHdpdGggYSBwYXRoIHNlZ21lbnQgaW4gdGhlIHZhbHVlIHByb3ZpZGVkIGZvciB0aGUgJyArXG4gICAgICAgIGBcXGBIVFRQX1RSQU5TRkVSX0NBQ0hFX09SSUdJTl9NQVBcXGAgdG9rZW46ICR7dXJsfS4gVGhlIG1hcCBzaG91bGQgb25seSBjb250YWluIG9yaWdpbnMgYCArXG4gICAgICAgICd3aXRob3V0IGFueSBvdGhlciBzZWdtZW50cy4nLFxuICAgICk7XG4gIH1cbn1cbiJdfQ==