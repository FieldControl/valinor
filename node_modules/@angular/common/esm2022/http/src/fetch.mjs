/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { inject, Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders } from './headers';
import { HTTP_STATUS_CODE_OK, HttpErrorResponse, HttpEventType, HttpHeaderResponse, HttpResponse, } from './response';
import * as i0 from "@angular/core";
const XSSI_PREFIX = /^\)\]\}',?\n/;
const REQUEST_URL_HEADER = `X-Request-URL`;
/**
 * Determine an appropriate URL for the response, by checking either
 * response url or the X-Request-URL header.
 */
function getResponseUrl(response) {
    if (response.url) {
        return response.url;
    }
    // stored as lowercase in the map
    const xRequestUrl = REQUEST_URL_HEADER.toLocaleLowerCase();
    return response.headers.get(xRequestUrl);
}
/**
 * Uses `fetch` to send requests to a backend server.
 *
 * This `FetchBackend` requires the support of the
 * [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) which is available on all
 * supported browsers and on Node.js v18 or later.
 *
 * @see {@link HttpHandler}
 *
 * @publicApi
 */
export class FetchBackend {
    constructor() {
        // We use an arrow function to always reference the current global implementation of `fetch`.
        // This is helpful for cases when the global `fetch` implementation is modified by external code,
        // see https://github.com/angular/angular/issues/57527.
        this.fetchImpl = inject(FetchFactory, { optional: true })?.fetch ?? ((...args) => globalThis.fetch(...args));
        this.ngZone = inject(NgZone);
    }
    handle(request) {
        return new Observable((observer) => {
            const aborter = new AbortController();
            this.doRequest(request, aborter.signal, observer).then(noop, (error) => observer.error(new HttpErrorResponse({ error })));
            return () => aborter.abort();
        });
    }
    async doRequest(request, signal, observer) {
        const init = this.createRequestInit(request);
        let response;
        try {
            // Run fetch outside of Angular zone.
            // This is due to Node.js fetch implementation (Undici) which uses a number of setTimeouts to check if
            // the response should eventually timeout which causes extra CD cycles every 500ms
            const fetchPromise = this.ngZone.runOutsideAngular(() => this.fetchImpl(request.urlWithParams, { signal, ...init }));
            // Make sure Zone.js doesn't trigger false-positive unhandled promise
            // error in case the Promise is rejected synchronously. See function
            // description for additional information.
            silenceSuperfluousUnhandledPromiseRejection(fetchPromise);
            // Send the `Sent` event before awaiting the response.
            observer.next({ type: HttpEventType.Sent });
            response = await fetchPromise;
        }
        catch (error) {
            observer.error(new HttpErrorResponse({
                error,
                status: error.status ?? 0,
                statusText: error.statusText,
                url: request.urlWithParams,
                headers: error.headers,
            }));
            return;
        }
        const headers = new HttpHeaders(response.headers);
        const statusText = response.statusText;
        const url = getResponseUrl(response) ?? request.urlWithParams;
        let status = response.status;
        let body = null;
        if (request.reportProgress) {
            observer.next(new HttpHeaderResponse({ headers, status, statusText, url }));
        }
        if (response.body) {
            // Read Progress
            const contentLength = response.headers.get('content-length');
            const chunks = [];
            const reader = response.body.getReader();
            let receivedLength = 0;
            let decoder;
            let partialText;
            // We have to check whether the Zone is defined in the global scope because this may be called
            // when the zone is nooped.
            const reqZone = typeof Zone !== 'undefined' && Zone.current;
            // Perform response processing outside of Angular zone to
            // ensure no excessive change detection runs are executed
            // Here calling the async ReadableStreamDefaultReader.read() is responsible for triggering CD
            await this.ngZone.runOutsideAngular(async () => {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        break;
                    }
                    chunks.push(value);
                    receivedLength += value.length;
                    if (request.reportProgress) {
                        partialText =
                            request.responseType === 'text'
                                ? (partialText ?? '') +
                                    (decoder ??= new TextDecoder()).decode(value, { stream: true })
                                : undefined;
                        const reportProgress = () => observer.next({
                            type: HttpEventType.DownloadProgress,
                            total: contentLength ? +contentLength : undefined,
                            loaded: receivedLength,
                            partialText,
                        });
                        reqZone ? reqZone.run(reportProgress) : reportProgress();
                    }
                }
            });
            // Combine all chunks.
            const chunksAll = this.concatChunks(chunks, receivedLength);
            try {
                const contentType = response.headers.get('Content-Type') ?? '';
                body = this.parseBody(request, chunksAll, contentType);
            }
            catch (error) {
                // Body loading or parsing failed
                observer.error(new HttpErrorResponse({
                    error,
                    headers: new HttpHeaders(response.headers),
                    status: response.status,
                    statusText: response.statusText,
                    url: getResponseUrl(response) ?? request.urlWithParams,
                }));
                return;
            }
        }
        // Same behavior as the XhrBackend
        if (status === 0) {
            status = body ? HTTP_STATUS_CODE_OK : 0;
        }
        // ok determines whether the response will be transmitted on the event or
        // error channel. Unsuccessful status codes (not 2xx) will always be errors,
        // but a successful status code can still result in an error if the user
        // asked for JSON data and the body cannot be parsed as such.
        const ok = status >= 200 && status < 300;
        if (ok) {
            observer.next(new HttpResponse({
                body,
                headers,
                status,
                statusText,
                url,
            }));
            // The full body has been received and delivered, no further events
            // are possible. This request is complete.
            observer.complete();
        }
        else {
            observer.error(new HttpErrorResponse({
                error: body,
                headers,
                status,
                statusText,
                url,
            }));
        }
    }
    parseBody(request, binContent, contentType) {
        switch (request.responseType) {
            case 'json':
                // stripping the XSSI when present
                const text = new TextDecoder().decode(binContent).replace(XSSI_PREFIX, '');
                return text === '' ? null : JSON.parse(text);
            case 'text':
                return new TextDecoder().decode(binContent);
            case 'blob':
                return new Blob([binContent], { type: contentType });
            case 'arraybuffer':
                return binContent.buffer;
        }
    }
    createRequestInit(req) {
        // We could share some of this logic with the XhrBackend
        const headers = {};
        const credentials = req.withCredentials ? 'include' : undefined;
        // Setting all the requested headers.
        req.headers.forEach((name, values) => (headers[name] = values.join(',')));
        // Add an Accept header if one isn't present already.
        if (!req.headers.has('Accept')) {
            headers['Accept'] = 'application/json, text/plain, */*';
        }
        // Auto-detect the Content-Type header if one isn't present already.
        if (!req.headers.has('Content-Type')) {
            const detectedType = req.detectContentTypeHeader();
            // Sometimes Content-Type detection fails.
            if (detectedType !== null) {
                headers['Content-Type'] = detectedType;
            }
        }
        return {
            body: req.serializeBody(),
            method: req.method,
            headers,
            credentials,
        };
    }
    concatChunks(chunks, totalLength) {
        const chunksAll = new Uint8Array(totalLength);
        let position = 0;
        for (const chunk of chunks) {
            chunksAll.set(chunk, position);
            position += chunk.length;
        }
        return chunksAll;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: FetchBackend, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: FetchBackend }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: FetchBackend, decorators: [{
            type: Injectable
        }] });
/**
 * Abstract class to provide a mocked implementation of `fetch()`
 */
export class FetchFactory {
}
function noop() { }
/**
 * Zone.js treats a rejected promise that has not yet been awaited
 * as an unhandled error. This function adds a noop `.then` to make
 * sure that Zone.js doesn't throw an error if the Promise is rejected
 * synchronously.
 */
function silenceSuperfluousUnhandledPromiseRejection(promise) {
    promise.then(noop, noop);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmV0Y2guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vaHR0cC9zcmMvZmV0Y2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3pELE9BQU8sRUFBQyxVQUFVLEVBQVcsTUFBTSxNQUFNLENBQUM7QUFHMUMsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUV0QyxPQUFPLEVBQ0wsbUJBQW1CLEVBRW5CLGlCQUFpQixFQUVqQixhQUFhLEVBQ2Isa0JBQWtCLEVBQ2xCLFlBQVksR0FDYixNQUFNLFlBQVksQ0FBQzs7QUFFcEIsTUFBTSxXQUFXLEdBQUcsY0FBYyxDQUFDO0FBRW5DLE1BQU0sa0JBQWtCLEdBQUcsZUFBZSxDQUFDO0FBRTNDOzs7R0FHRztBQUNILFNBQVMsY0FBYyxDQUFDLFFBQWtCO0lBQ3hDLElBQUksUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ2pCLE9BQU8sUUFBUSxDQUFDLEdBQUcsQ0FBQztJQUN0QixDQUFDO0lBQ0QsaUNBQWlDO0lBQ2pDLE1BQU0sV0FBVyxHQUFHLGtCQUFrQixDQUFDLGlCQUFpQixFQUFFLENBQUM7SUFDM0QsT0FBTyxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUMzQyxDQUFDO0FBRUQ7Ozs7Ozs7Ozs7R0FVRztBQUVILE1BQU0sT0FBTyxZQUFZO0lBRHpCO1FBRUUsNkZBQTZGO1FBQzdGLGlHQUFpRztRQUNqRyx1REFBdUQ7UUFDdEMsY0FBUyxHQUN4QixNQUFNLENBQUMsWUFBWSxFQUFFLEVBQUMsUUFBUSxFQUFFLElBQUksRUFBQyxDQUFDLEVBQUUsS0FBSyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksRUFBRSxFQUFFLENBQUMsVUFB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LEdBQUcsQ0FBQyxNQUFNO1lBQ2xCLE9BQU87WUFDUCxXQUFXO1NBQ1osQ0FBQztJQUNKLENBQUM7SUFFTyxZQUFZLENBQUMsTUFBb0IsRUFBRSxXQUFtQjtRQUM1RCxNQUFNLFNBQVMsR0FBRyxJQUFJLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUM5QyxJQUFJLFFBQVEsR0FBRyxDQUFDLENBQUM7UUFDakIsS0FBSyxNQUFNLEtBQUssSUFBSSxNQUFNLEVBQUUsQ0FBQztZQUMzQixTQUFTLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztZQUMvQixRQUFRLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQztRQUMzQixDQUFDO1FBRUQsT0FBTyxTQUFTLENBQUM7SUFDbkIsQ0FBQzt5SEF2T1UsWUFBWTs2SEFBWixZQUFZOztzR0FBWixZQUFZO2tCQUR4QixVQUFVOztBQTJPWDs7R0FFRztBQUNILE1BQU0sT0FBZ0IsWUFBWTtDQUVqQztBQUVELFNBQVMsSUFBSSxLQUFVLENBQUM7QUFFeEI7Ozs7O0dBS0c7QUFDSCxTQUFTLDJDQUEyQyxDQUFDLE9BQXlCO0lBQzVFLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzNCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCB7aW5qZWN0LCBJbmplY3RhYmxlLCBOZ1pvbmV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtPYnNlcnZhYmxlLCBPYnNlcnZlcn0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7SHR0cEJhY2tlbmR9IGZyb20gJy4vYmFja2VuZCc7XG5pbXBvcnQge0h0dHBIZWFkZXJzfSBmcm9tICcuL2hlYWRlcnMnO1xuaW1wb3J0IHtIdHRwUmVxdWVzdH0gZnJvbSAnLi9yZXF1ZXN0JztcbmltcG9ydCB7XG4gIEhUVFBfU1RBVFVTX0NPREVfT0ssXG4gIEh0dHBEb3dubG9hZFByb2dyZXNzRXZlbnQsXG4gIEh0dHBFcnJvclJlc3BvbnNlLFxuICBIdHRwRXZlbnQsXG4gIEh0dHBFdmVudFR5cGUsXG4gIEh0dHBIZWFkZXJSZXNwb25zZSxcbiAgSHR0cFJlc3BvbnNlLFxufSBmcm9tICcuL3Jlc3BvbnNlJztcblxuY29uc3QgWFNTSV9QUkVGSVggPSAvXlxcKVxcXVxcfScsP1xcbi87XG5cbmNvbnN0IFJFUVVFU1RfVVJMX0hFQURFUiA9IGBYLVJlcXVlc3QtVVJMYDtcblxuLyoqXG4gKiBEZXRlcm1pbmUgYW4gYXBwcm9wcmlhdGUgVVJMIGZvciB0aGUgcmVzcG9uc2UsIGJ5IGNoZWNraW5nIGVpdGhlclxuICogcmVzcG9uc2UgdXJsIG9yIHRoZSBYLVJlcXVlc3QtVVJMIGhlYWRlci5cbiAqL1xuZnVuY3Rpb24gZ2V0UmVzcG9uc2VVcmwocmVzcG9uc2U6IFJlc3BvbnNlKTogc3RyaW5nIHwgbnVsbCB7XG4gIGlmIChyZXNwb25zZS51cmwpIHtcbiAgICByZXR1cm4gcmVzcG9uc2UudXJsO1xuICB9XG4gIC8vIHN0b3JlZCBhcyBsb3dlcmNhc2UgaW4gdGhlIG1hcFxuICBjb25zdCB4UmVxdWVzdFVybCA9IFJFUVVFU1RfVVJMX0hFQURFUi50b0xvY2FsZUxvd2VyQ2FzZSgpO1xuICByZXR1cm4gcmVzcG9uc2UuaGVhZGVycy5nZXQoeFJlcXVlc3RVcmwpO1xufVxuXG4vKipcbiAqIFVzZXMgYGZldGNoYCB0byBzZW5kIHJlcXVlc3RzIHRvIGEgYmFja2VuZCBzZXJ2ZXIuXG4gKlxuICogVGhpcyBgRmV0Y2hCYWNrZW5kYCByZXF1aXJlcyB0aGUgc3VwcG9ydCBvZiB0aGVcbiAqIFtGZXRjaCBBUEldKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9GZXRjaF9BUEkpIHdoaWNoIGlzIGF2YWlsYWJsZSBvbiBhbGxcbiAqIHN1cHBvcnRlZCBicm93c2VycyBhbmQgb24gTm9kZS5qcyB2MTggb3IgbGF0ZXIuXG4gKlxuICogQHNlZSB7QGxpbmsgSHR0cEhhbmRsZXJ9XG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgRmV0Y2hCYWNrZW5kIGltcGxlbWVudHMgSHR0cEJhY2tlbmQge1xuICAvLyBXZSB1c2UgYW4gYXJyb3cgZnVuY3Rpb24gdG8gYWx3YXlzIHJlZmVyZW5jZSB0aGUgY3VycmVudCBnbG9iYWwgaW1wbGVtZW50YXRpb24gb2YgYGZldGNoYC5cbiAgLy8gVGhpcyBpcyBoZWxwZnVsIGZvciBjYXNlcyB3aGVuIHRoZSBnbG9iYWwgYGZldGNoYCBpbXBsZW1lbnRhdGlvbiBpcyBtb2RpZmllZCBieSBleHRlcm5hbCBjb2RlLFxuICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9pc3N1ZXMvNTc1MjcuXG4gIHByaXZhdGUgcmVhZG9ubHkgZmV0Y2hJbXBsID1cbiAgICBpbmplY3QoRmV0Y2hGYWN0b3J5LCB7b3B0aW9uYWw6IHRydWV9KT8uZmV0Y2ggPz8gKCguLi5hcmdzKSA9PiBnbG9iYWxUaGlzLmZldGNoKC4uLmFyZ3MpKTtcbiAgcHJpdmF0ZSByZWFkb25seSBuZ1pvbmUgPSBpbmplY3QoTmdab25lKTtcblxuICBoYW5kbGUocmVxdWVzdDogSHR0cFJlcXVlc3Q8YW55Pik6IE9ic2VydmFibGU8SHR0cEV2ZW50PGFueT4+IHtcbiAgICByZXR1cm4gbmV3IE9ic2VydmFibGUoKG9ic2VydmVyKSA9PiB7XG4gICAgICBjb25zdCBhYm9ydGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgICAgdGhpcy5kb1JlcXVlc3QocmVxdWVzdCwgYWJvcnRlci5zaWduYWwsIG9ic2VydmVyKS50aGVuKG5vb3AsIChlcnJvcikgPT5cbiAgICAgICAgb2JzZXJ2ZXIuZXJyb3IobmV3IEh0dHBFcnJvclJlc3BvbnNlKHtlcnJvcn0pKSxcbiAgICAgICk7XG4gICAgICByZXR1cm4gKCkgPT4gYWJvcnRlci5hYm9ydCgpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBkb1JlcXVlc3QoXG4gICAgcmVxdWVzdDogSHR0cFJlcXVlc3Q8YW55PixcbiAgICBzaWduYWw6IEFib3J0U2lnbmFsLFxuICAgIG9ic2VydmVyOiBPYnNlcnZlcjxIdHRwRXZlbnQ8YW55Pj4sXG4gICk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGluaXQgPSB0aGlzLmNyZWF0ZVJlcXVlc3RJbml0KHJlcXVlc3QpO1xuICAgIGxldCByZXNwb25zZTtcblxuICAgIHRyeSB7XG4gICAgICAvLyBSdW4gZmV0Y2ggb3V0c2lkZSBvZiBBbmd1bGFyIHpvbmUuXG4gICAgICAvLyBUaGlzIGlzIGR1ZSB0byBOb2RlLmpzIGZldGNoIGltcGxlbWVudGF0aW9uIChVbmRpY2kpIHdoaWNoIHVzZXMgYSBudW1iZXIgb2Ygc2V0VGltZW91dHMgdG8gY2hlY2sgaWZcbiAgICAgIC8vIHRoZSByZXNwb25zZSBzaG91bGQgZXZlbnR1YWxseSB0aW1lb3V0IHdoaWNoIGNhdXNlcyBleHRyYSBDRCBjeWNsZXMgZXZlcnkgNTAwbXNcbiAgICAgIGNvbnN0IGZldGNoUHJvbWlzZSA9IHRoaXMubmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+XG4gICAgICAgIHRoaXMuZmV0Y2hJbXBsKHJlcXVlc3QudXJsV2l0aFBhcmFtcywge3NpZ25hbCwgLi4uaW5pdH0pLFxuICAgICAgKTtcblxuICAgICAgLy8gTWFrZSBzdXJlIFpvbmUuanMgZG9lc24ndCB0cmlnZ2VyIGZhbHNlLXBvc2l0aXZlIHVuaGFuZGxlZCBwcm9taXNlXG4gICAgICAvLyBlcnJvciBpbiBjYXNlIHRoZSBQcm9taXNlIGlzIHJlamVjdGVkIHN5bmNocm9ub3VzbHkuIFNlZSBmdW5jdGlvblxuICAgICAgLy8gZGVzY3JpcHRpb24gZm9yIGFkZGl0aW9uYWwgaW5mb3JtYXRpb24uXG4gICAgICBzaWxlbmNlU3VwZXJmbHVvdXNVbmhhbmRsZWRQcm9taXNlUmVqZWN0aW9uKGZldGNoUHJvbWlzZSk7XG5cbiAgICAgIC8vIFNlbmQgdGhlIGBTZW50YCBldmVudCBiZWZvcmUgYXdhaXRpbmcgdGhlIHJlc3BvbnNlLlxuICAgICAgb2JzZXJ2ZXIubmV4dCh7dHlwZTogSHR0cEV2ZW50VHlwZS5TZW50fSk7XG5cbiAgICAgIHJlc3BvbnNlID0gYXdhaXQgZmV0Y2hQcm9taXNlO1xuICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgIG9ic2VydmVyLmVycm9yKFxuICAgICAgICBuZXcgSHR0cEVycm9yUmVzcG9uc2Uoe1xuICAgICAgICAgIGVycm9yLFxuICAgICAgICAgIHN0YXR1czogZXJyb3Iuc3RhdHVzID8/IDAsXG4gICAgICAgICAgc3RhdHVzVGV4dDogZXJyb3Iuc3RhdHVzVGV4dCxcbiAgICAgICAgICB1cmw6IHJlcXVlc3QudXJsV2l0aFBhcmFtcyxcbiAgICAgICAgICBoZWFkZXJzOiBlcnJvci5oZWFkZXJzLFxuICAgICAgICB9KSxcbiAgICAgICk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgaGVhZGVycyA9IG5ldyBIdHRwSGVhZGVycyhyZXNwb25zZS5oZWFkZXJzKTtcbiAgICBjb25zdCBzdGF0dXNUZXh0ID0gcmVzcG9uc2Uuc3RhdHVzVGV4dDtcbiAgICBjb25zdCB1cmwgPSBnZXRSZXNwb25zZVVybChyZXNwb25zZSkgPz8gcmVxdWVzdC51cmxXaXRoUGFyYW1zO1xuXG4gICAgbGV0IHN0YXR1cyA9IHJlc3BvbnNlLnN0YXR1cztcbiAgICBsZXQgYm9keTogc3RyaW5nIHwgQXJyYXlCdWZmZXIgfCBCbG9iIHwgb2JqZWN0IHwgbnVsbCA9IG51bGw7XG5cbiAgICBpZiAocmVxdWVzdC5yZXBvcnRQcm9ncmVzcykge1xuICAgICAgb2JzZXJ2ZXIubmV4dChuZXcgSHR0cEhlYWRlclJlc3BvbnNlKHtoZWFkZXJzLCBzdGF0dXMsIHN0YXR1c1RleHQsIHVybH0pKTtcbiAgICB9XG5cbiAgICBpZiAocmVzcG9uc2UuYm9keSkge1xuICAgICAgLy8gUmVhZCBQcm9ncmVzc1xuICAgICAgY29uc3QgY29udGVudExlbmd0aCA9IHJlc3BvbnNlLmhlYWRlcnMuZ2V0KCdjb250ZW50LWxlbmd0aCcpO1xuICAgICAgY29uc3QgY2h1bmtzOiBVaW50OEFycmF5W10gPSBbXTtcbiAgICAgIGNvbnN0IHJlYWRlciA9IHJlc3BvbnNlLmJvZHkuZ2V0UmVhZGVyKCk7XG4gICAgICBsZXQgcmVjZWl2ZWRMZW5ndGggPSAwO1xuXG4gICAgICBsZXQgZGVjb2RlcjogVGV4dERlY29kZXI7XG4gICAgICBsZXQgcGFydGlhbFRleHQ6IHN0cmluZyB8IHVuZGVmaW5lZDtcblxuICAgICAgLy8gV2UgaGF2ZSB0byBjaGVjayB3aGV0aGVyIHRoZSBab25lIGlzIGRlZmluZWQgaW4gdGhlIGdsb2JhbCBzY29wZSBiZWNhdXNlIHRoaXMgbWF5IGJlIGNhbGxlZFxuICAgICAgLy8gd2hlbiB0aGUgem9uZSBpcyBub29wZWQuXG4gICAgICBjb25zdCByZXFab25lID0gdHlwZW9mIFpvbmUgIT09ICd1bmRlZmluZWQnICYmIFpvbmUuY3VycmVudDtcblxuICAgICAgLy8gUGVyZm9ybSByZXNwb25zZSBwcm9jZXNzaW5nIG91dHNpZGUgb2YgQW5ndWxhciB6b25lIHRvXG4gICAgICAvLyBlbnN1cmUgbm8gZXhjZXNzaXZlIGNoYW5nZSBkZXRlY3Rpb24gcnVucyBhcmUgZXhlY3V0ZWRcbiAgICAgIC8vIEhlcmUgY2FsbGluZyB0aGUgYXN5bmMgUmVhZGFibGVTdHJlYW1EZWZhdWx0UmVhZGVyLnJlYWQoKSBpcyByZXNwb25zaWJsZSBmb3IgdHJpZ2dlcmluZyBDRFxuICAgICAgYXdhaXQgdGhpcy5uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoYXN5bmMgKCkgPT4ge1xuICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgIGNvbnN0IHtkb25lLCB2YWx1ZX0gPSBhd2FpdCByZWFkZXIucmVhZCgpO1xuXG4gICAgICAgICAgaWYgKGRvbmUpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNodW5rcy5wdXNoKHZhbHVlKTtcbiAgICAgICAgICByZWNlaXZlZExlbmd0aCArPSB2YWx1ZS5sZW5ndGg7XG5cbiAgICAgICAgICBpZiAocmVxdWVzdC5yZXBvcnRQcm9ncmVzcykge1xuICAgICAgICAgICAgcGFydGlhbFRleHQgPVxuICAgICAgICAgICAgICByZXF1ZXN0LnJlc3BvbnNlVHlwZSA9PT0gJ3RleHQnXG4gICAgICAgICAgICAgICAgPyAocGFydGlhbFRleHQgPz8gJycpICtcbiAgICAgICAgICAgICAgICAgIChkZWNvZGVyID8/PSBuZXcgVGV4dERlY29kZXIoKSkuZGVjb2RlKHZhbHVlLCB7c3RyZWFtOiB0cnVlfSlcbiAgICAgICAgICAgICAgICA6IHVuZGVmaW5lZDtcblxuICAgICAgICAgICAgY29uc3QgcmVwb3J0UHJvZ3Jlc3MgPSAoKSA9PlxuICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0KHtcbiAgICAgICAgICAgICAgICB0eXBlOiBIdHRwRXZlbnRUeXBlLkRvd25sb2FkUHJvZ3Jlc3MsXG4gICAgICAgICAgICAgICAgdG90YWw6IGNvbnRlbnRMZW5ndGggPyArY29udGVudExlbmd0aCA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICBsb2FkZWQ6IHJlY2VpdmVkTGVuZ3RoLFxuICAgICAgICAgICAgICAgIHBhcnRpYWxUZXh0LFxuICAgICAgICAgICAgICB9IGFzIEh0dHBEb3dubG9hZFByb2dyZXNzRXZlbnQpO1xuICAgICAgICAgICAgcmVxWm9uZSA/IHJlcVpvbmUucnVuKHJlcG9ydFByb2dyZXNzKSA6IHJlcG9ydFByb2dyZXNzKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8gQ29tYmluZSBhbGwgY2h1bmtzLlxuICAgICAgY29uc3QgY2h1bmtzQWxsID0gdGhpcy5jb25jYXRDaHVua3MoY2h1bmtzLCByZWNlaXZlZExlbmd0aCk7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBjb250ZW50VHlwZSA9IHJlc3BvbnNlLmhlYWRlcnMuZ2V0KCdDb250ZW50LVR5cGUnKSA/PyAnJztcbiAgICAgICAgYm9keSA9IHRoaXMucGFyc2VCb2R5KHJlcXVlc3QsIGNodW5rc0FsbCwgY29udGVudFR5cGUpO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgLy8gQm9keSBsb2FkaW5nIG9yIHBhcnNpbmcgZmFpbGVkXG4gICAgICAgIG9ic2VydmVyLmVycm9yKFxuICAgICAgICAgIG5ldyBIdHRwRXJyb3JSZXNwb25zZSh7XG4gICAgICAgICAgICBlcnJvcixcbiAgICAgICAgICAgIGhlYWRlcnM6IG5ldyBIdHRwSGVhZGVycyhyZXNwb25zZS5oZWFkZXJzKSxcbiAgICAgICAgICAgIHN0YXR1czogcmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgICAgICAgc3RhdHVzVGV4dDogcmVzcG9uc2Uuc3RhdHVzVGV4dCxcbiAgICAgICAgICAgIHVybDogZ2V0UmVzcG9uc2VVcmwocmVzcG9uc2UpID8/IHJlcXVlc3QudXJsV2l0aFBhcmFtcyxcbiAgICAgICAgICB9KSxcbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFNhbWUgYmVoYXZpb3IgYXMgdGhlIFhockJhY2tlbmRcbiAgICBpZiAoc3RhdHVzID09PSAwKSB7XG4gICAgICBzdGF0dXMgPSBib2R5ID8gSFRUUF9TVEFUVVNfQ09ERV9PSyA6IDA7XG4gICAgfVxuXG4gICAgLy8gb2sgZGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSByZXNwb25zZSB3aWxsIGJlIHRyYW5zbWl0dGVkIG9uIHRoZSBldmVudCBvclxuICAgIC8vIGVycm9yIGNoYW5uZWwuIFVuc3VjY2Vzc2Z1bCBzdGF0dXMgY29kZXMgKG5vdCAyeHgpIHdpbGwgYWx3YXlzIGJlIGVycm9ycyxcbiAgICAvLyBidXQgYSBzdWNjZXNzZnVsIHN0YXR1cyBjb2RlIGNhbiBzdGlsbCByZXN1bHQgaW4gYW4gZXJyb3IgaWYgdGhlIHVzZXJcbiAgICAvLyBhc2tlZCBmb3IgSlNPTiBkYXRhIGFuZCB0aGUgYm9keSBjYW5ub3QgYmUgcGFyc2VkIGFzIHN1Y2guXG4gICAgY29uc3Qgb2sgPSBzdGF0dXMgPj0gMjAwICYmIHN0YXR1cyA8IDMwMDtcblxuICAgIGlmIChvaykge1xuICAgICAgb2JzZXJ2ZXIubmV4dChcbiAgICAgICAgbmV3IEh0dHBSZXNwb25zZSh7XG4gICAgICAgICAgYm9keSxcbiAgICAgICAgICBoZWFkZXJzLFxuICAgICAgICAgIHN0YXR1cyxcbiAgICAgICAgICBzdGF0dXNUZXh0LFxuICAgICAgICAgIHVybCxcbiAgICAgICAgfSksXG4gICAgICApO1xuXG4gICAgICAvLyBUaGUgZnVsbCBib2R5IGhhcyBiZWVuIHJlY2VpdmVkIGFuZCBkZWxpdmVyZWQsIG5vIGZ1cnRoZXIgZXZlbnRzXG4gICAgICAvLyBhcmUgcG9zc2libGUuIFRoaXMgcmVxdWVzdCBpcyBjb21wbGV0ZS5cbiAgICAgIG9ic2VydmVyLmNvbXBsZXRlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG9ic2VydmVyLmVycm9yKFxuICAgICAgICBuZXcgSHR0cEVycm9yUmVzcG9uc2Uoe1xuICAgICAgICAgIGVycm9yOiBib2R5LFxuICAgICAgICAgIGhlYWRlcnMsXG4gICAgICAgICAgc3RhdHVzLFxuICAgICAgICAgIHN0YXR1c1RleHQsXG4gICAgICAgICAgdXJsLFxuICAgICAgICB9KSxcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBwYXJzZUJvZHkoXG4gICAgcmVxdWVzdDogSHR0cFJlcXVlc3Q8YW55PixcbiAgICBiaW5Db250ZW50OiBVaW50OEFycmF5LFxuICAgIGNvbnRlbnRUeXBlOiBzdHJpbmcsXG4gICk6IHN0cmluZyB8IEFycmF5QnVmZmVyIHwgQmxvYiB8IG9iamVjdCB8IG51bGwge1xuICAgIHN3aXRjaCAocmVxdWVzdC5yZXNwb25zZVR5cGUpIHtcbiAgICAgIGNhc2UgJ2pzb24nOlxuICAgICAgICAvLyBzdHJpcHBpbmcgdGhlIFhTU0kgd2hlbiBwcmVzZW50XG4gICAgICAgIGNvbnN0IHRleHQgPSBuZXcgVGV4dERlY29kZXIoKS5kZWNvZGUoYmluQ29udGVudCkucmVwbGFjZShYU1NJX1BSRUZJWCwgJycpO1xuICAgICAgICByZXR1cm4gdGV4dCA9PT0gJycgPyBudWxsIDogKEpTT04ucGFyc2UodGV4dCkgYXMgb2JqZWN0KTtcbiAgICAgIGNhc2UgJ3RleHQnOlxuICAgICAgICByZXR1cm4gbmV3IFRleHREZWNvZGVyKCkuZGVjb2RlKGJpbkNvbnRlbnQpO1xuICAgICAgY2FzZSAnYmxvYic6XG4gICAgICAgIHJldHVybiBuZXcgQmxvYihbYmluQ29udGVudF0sIHt0eXBlOiBjb250ZW50VHlwZX0pO1xuICAgICAgY2FzZSAnYXJyYXlidWZmZXInOlxuICAgICAgICByZXR1cm4gYmluQ29udGVudC5idWZmZXI7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVSZXF1ZXN0SW5pdChyZXE6IEh0dHBSZXF1ZXN0PGFueT4pOiBSZXF1ZXN0SW5pdCB7XG4gICAgLy8gV2UgY291bGQgc2hhcmUgc29tZSBvZiB0aGlzIGxvZ2ljIHdpdGggdGhlIFhockJhY2tlbmRcblxuICAgIGNvbnN0IGhlYWRlcnM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fTtcbiAgICBjb25zdCBjcmVkZW50aWFsczogUmVxdWVzdENyZWRlbnRpYWxzIHwgdW5kZWZpbmVkID0gcmVxLndpdGhDcmVkZW50aWFscyA/ICdpbmNsdWRlJyA6IHVuZGVmaW5lZDtcblxuICAgIC8vIFNldHRpbmcgYWxsIHRoZSByZXF1ZXN0ZWQgaGVhZGVycy5cbiAgICByZXEuaGVhZGVycy5mb3JFYWNoKChuYW1lLCB2YWx1ZXMpID0+IChoZWFkZXJzW25hbWVdID0gdmFsdWVzLmpvaW4oJywnKSkpO1xuXG4gICAgLy8gQWRkIGFuIEFjY2VwdCBoZWFkZXIgaWYgb25lIGlzbid0IHByZXNlbnQgYWxyZWFkeS5cbiAgICBpZiAoIXJlcS5oZWFkZXJzLmhhcygnQWNjZXB0JykpIHtcbiAgICAgIGhlYWRlcnNbJ0FjY2VwdCddID0gJ2FwcGxpY2F0aW9uL2pzb24sIHRleHQvcGxhaW4sICovKic7XG4gICAgfVxuXG4gICAgLy8gQXV0by1kZXRlY3QgdGhlIENvbnRlbnQtVHlwZSBoZWFkZXIgaWYgb25lIGlzbid0IHByZXNlbnQgYWxyZWFkeS5cbiAgICBpZiAoIXJlcS5oZWFkZXJzLmhhcygnQ29udGVudC1UeXBlJykpIHtcbiAgICAgIGNvbnN0IGRldGVjdGVkVHlwZSA9IHJlcS5kZXRlY3RDb250ZW50VHlwZUhlYWRlcigpO1xuICAgICAgLy8gU29tZXRpbWVzIENvbnRlbnQtVHlwZSBkZXRlY3Rpb24gZmFpbHMuXG4gICAgICBpZiAoZGV0ZWN0ZWRUeXBlICE9PSBudWxsKSB7XG4gICAgICAgIGhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddID0gZGV0ZWN0ZWRUeXBlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBib2R5OiByZXEuc2VyaWFsaXplQm9keSgpLFxuICAgICAgbWV0aG9kOiByZXEubWV0aG9kLFxuICAgICAgaGVhZGVycyxcbiAgICAgIGNyZWRlbnRpYWxzLFxuICAgIH07XG4gIH1cblxuICBwcml2YXRlIGNvbmNhdENodW5rcyhjaHVua3M6IFVpbnQ4QXJyYXlbXSwgdG90YWxMZW5ndGg6IG51bWJlcik6IFVpbnQ4QXJyYXkge1xuICAgIGNvbnN0IGNodW5rc0FsbCA9IG5ldyBVaW50OEFycmF5KHRvdGFsTGVuZ3RoKTtcbiAgICBsZXQgcG9zaXRpb24gPSAwO1xuICAgIGZvciAoY29uc3QgY2h1bmsgb2YgY2h1bmtzKSB7XG4gICAgICBjaHVua3NBbGwuc2V0KGNodW5rLCBwb3NpdGlvbik7XG4gICAgICBwb3NpdGlvbiArPSBjaHVuay5sZW5ndGg7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNodW5rc0FsbDtcbiAgfVxufVxuXG4vKipcbiAqIEFic3RyYWN0IGNsYXNzIHRvIHByb3ZpZGUgYSBtb2NrZWQgaW1wbGVtZW50YXRpb24gb2YgYGZldGNoKClgXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBGZXRjaEZhY3Rvcnkge1xuICBhYnN0cmFjdCBmZXRjaDogdHlwZW9mIGZldGNoO1xufVxuXG5mdW5jdGlvbiBub29wKCk6IHZvaWQge31cblxuLyoqXG4gKiBab25lLmpzIHRyZWF0cyBhIHJlamVjdGVkIHByb21pc2UgdGhhdCBoYXMgbm90IHlldCBiZWVuIGF3YWl0ZWRcbiAqIGFzIGFuIHVuaGFuZGxlZCBlcnJvci4gVGhpcyBmdW5jdGlvbiBhZGRzIGEgbm9vcCBgLnRoZW5gIHRvIG1ha2VcbiAqIHN1cmUgdGhhdCBab25lLmpzIGRvZXNuJ3QgdGhyb3cgYW4gZXJyb3IgaWYgdGhlIFByb21pc2UgaXMgcmVqZWN0ZWRcbiAqIHN5bmNocm9ub3VzbHkuXG4gKi9cbmZ1bmN0aW9uIHNpbGVuY2VTdXBlcmZsdW91c1VuaGFuZGxlZFByb21pc2VSZWplY3Rpb24ocHJvbWlzZTogUHJvbWlzZTx1bmtub3duPikge1xuICBwcm9taXNlLnRoZW4obm9vcCwgbm9vcCk7XG59XG4iXX0=