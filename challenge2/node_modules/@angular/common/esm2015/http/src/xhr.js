/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { XhrFactory } from '@angular/common';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders } from './headers';
import { HttpErrorResponse, HttpEventType, HttpHeaderResponse, HttpResponse } from './response';
const XSSI_PREFIX = /^\)\]\}',?\n/;
/**
 * Determine an appropriate URL for the response, by checking either
 * XMLHttpRequest.responseURL or the X-Request-URL header.
 */
function getResponseUrl(xhr) {
    if ('responseURL' in xhr && xhr.responseURL) {
        return xhr.responseURL;
    }
    if (/^X-Request-URL:/m.test(xhr.getAllResponseHeaders())) {
        return xhr.getResponseHeader('X-Request-URL');
    }
    return null;
}
/**
 * Uses `XMLHttpRequest` to send requests to a backend server.
 * @see `HttpHandler`
 * @see `JsonpClientBackend`
 *
 * @publicApi
 */
export class HttpXhrBackend {
    constructor(xhrFactory) {
        this.xhrFactory = xhrFactory;
    }
    /**
     * Processes a request and returns a stream of response events.
     * @param req The request object.
     * @returns An observable of the response events.
     */
    handle(req) {
        // Quick check to give a better error message when a user attempts to use
        // HttpClient.jsonp() without installing the HttpClientJsonpModule
        if (req.method === 'JSONP') {
            throw new Error(`Attempted to construct Jsonp request without HttpClientJsonpModule installed.`);
        }
        // Everything happens on Observable subscription.
        return new Observable((observer) => {
            // Start by setting up the XHR object with request method, URL, and withCredentials flag.
            const xhr = this.xhrFactory.build();
            xhr.open(req.method, req.urlWithParams);
            if (!!req.withCredentials) {
                xhr.withCredentials = true;
            }
            // Add all the requested headers.
            req.headers.forEach((name, values) => xhr.setRequestHeader(name, values.join(',')));
            // Add an Accept header if one isn't present already.
            if (!req.headers.has('Accept')) {
                xhr.setRequestHeader('Accept', 'application/json, text/plain, */*');
            }
            // Auto-detect the Content-Type header if one isn't present already.
            if (!req.headers.has('Content-Type')) {
                const detectedType = req.detectContentTypeHeader();
                // Sometimes Content-Type detection fails.
                if (detectedType !== null) {
                    xhr.setRequestHeader('Content-Type', detectedType);
                }
            }
            // Set the responseType if one was requested.
            if (req.responseType) {
                const responseType = req.responseType.toLowerCase();
                // JSON responses need to be processed as text. This is because if the server
                // returns an XSSI-prefixed JSON response, the browser will fail to parse it,
                // xhr.response will be null, and xhr.responseText cannot be accessed to
                // retrieve the prefixed JSON data in order to strip the prefix. Thus, all JSON
                // is parsed by first requesting text and then applying JSON.parse.
                xhr.responseType = ((responseType !== 'json') ? responseType : 'text');
            }
            // Serialize the request body if one is present. If not, this will be set to null.
            const reqBody = req.serializeBody();
            // If progress events are enabled, response headers will be delivered
            // in two events - the HttpHeaderResponse event and the full HttpResponse
            // event. However, since response headers don't change in between these
            // two events, it doesn't make sense to parse them twice. So headerResponse
            // caches the data extracted from the response whenever it's first parsed,
            // to ensure parsing isn't duplicated.
            let headerResponse = null;
            // partialFromXhr extracts the HttpHeaderResponse from the current XMLHttpRequest
            // state, and memoizes it into headerResponse.
            const partialFromXhr = () => {
                if (headerResponse !== null) {
                    return headerResponse;
                }
                // Read status and normalize an IE9 bug (https://bugs.jquery.com/ticket/1450).
                const status = xhr.status === 1223 ? 204 /* NoContent */ : xhr.status;
                const statusText = xhr.statusText || 'OK';
                // Parse headers from XMLHttpRequest - this step is lazy.
                const headers = new HttpHeaders(xhr.getAllResponseHeaders());
                // Read the response URL from the XMLHttpResponse instance and fall back on the
                // request URL.
                const url = getResponseUrl(xhr) || req.url;
                // Construct the HttpHeaderResponse and memoize it.
                headerResponse = new HttpHeaderResponse({ headers, status, statusText, url });
                return headerResponse;
            };
            // Next, a few closures are defined for the various events which XMLHttpRequest can
            // emit. This allows them to be unregistered as event listeners later.
            // First up is the load event, which represents a response being fully available.
            const onLoad = () => {
                // Read response state from the memoized partial data.
                let { headers, status, statusText, url } = partialFromXhr();
                // The body will be read out if present.
                let body = null;
                if (status !== 204 /* NoContent */) {
                    // Use XMLHttpRequest.response if set, responseText otherwise.
                    body = (typeof xhr.response === 'undefined') ? xhr.responseText : xhr.response;
                }
                // Normalize another potential bug (this one comes from CORS).
                if (status === 0) {
                    status = !!body ? 200 /* Ok */ : 0;
                }
                // ok determines whether the response will be transmitted on the event or
                // error channel. Unsuccessful status codes (not 2xx) will always be errors,
                // but a successful status code can still result in an error if the user
                // asked for JSON data and the body cannot be parsed as such.
                let ok = status >= 200 && status < 300;
                // Check whether the body needs to be parsed as JSON (in many cases the browser
                // will have done that already).
                if (req.responseType === 'json' && typeof body === 'string') {
                    // Save the original body, before attempting XSSI prefix stripping.
                    const originalBody = body;
                    body = body.replace(XSSI_PREFIX, '');
                    try {
                        // Attempt the parse. If it fails, a parse error should be delivered to the user.
                        body = body !== '' ? JSON.parse(body) : null;
                    }
                    catch (error) {
                        // Since the JSON.parse failed, it's reasonable to assume this might not have been a
                        // JSON response. Restore the original body (including any XSSI prefix) to deliver
                        // a better error response.
                        body = originalBody;
                        // If this was an error request to begin with, leave it as a string, it probably
                        // just isn't JSON. Otherwise, deliver the parsing error to the user.
                        if (ok) {
                            // Even though the response status was 2xx, this is still an error.
                            ok = false;
                            // The parse error contains the text of the body that failed to parse.
                            body = { error, text: body };
                        }
                    }
                }
                if (ok) {
                    // A successful response is delivered on the event stream.
                    observer.next(new HttpResponse({
                        body,
                        headers,
                        status,
                        statusText,
                        url: url || undefined,
                    }));
                    // The full body has been received and delivered, no further events
                    // are possible. This request is complete.
                    observer.complete();
                }
                else {
                    // An unsuccessful request is delivered on the error channel.
                    observer.error(new HttpErrorResponse({
                        // The error in this case is the response body (error from the server).
                        error: body,
                        headers,
                        status,
                        statusText,
                        url: url || undefined,
                    }));
                }
            };
            // The onError callback is called when something goes wrong at the network level.
            // Connection timeout, DNS error, offline, etc. These are actual errors, and are
            // transmitted on the error channel.
            const onError = (error) => {
                const { url } = partialFromXhr();
                const res = new HttpErrorResponse({
                    error,
                    status: xhr.status || 0,
                    statusText: xhr.statusText || 'Unknown Error',
                    url: url || undefined,
                });
                observer.error(res);
            };
            // The sentHeaders flag tracks whether the HttpResponseHeaders event
            // has been sent on the stream. This is necessary to track if progress
            // is enabled since the event will be sent on only the first download
            // progerss event.
            let sentHeaders = false;
            // The download progress event handler, which is only registered if
            // progress events are enabled.
            const onDownProgress = (event) => {
                // Send the HttpResponseHeaders event if it hasn't been sent already.
                if (!sentHeaders) {
                    observer.next(partialFromXhr());
                    sentHeaders = true;
                }
                // Start building the download progress event to deliver on the response
                // event stream.
                let progressEvent = {
                    type: HttpEventType.DownloadProgress,
                    loaded: event.loaded,
                };
                // Set the total number of bytes in the event if it's available.
                if (event.lengthComputable) {
                    progressEvent.total = event.total;
                }
                // If the request was for text content and a partial response is
                // available on XMLHttpRequest, include it in the progress event
                // to allow for streaming reads.
                if (req.responseType === 'text' && !!xhr.responseText) {
                    progressEvent.partialText = xhr.responseText;
                }
                // Finally, fire the event.
                observer.next(progressEvent);
            };
            // The upload progress event handler, which is only registered if
            // progress events are enabled.
            const onUpProgress = (event) => {
                // Upload progress events are simpler. Begin building the progress
                // event.
                let progress = {
                    type: HttpEventType.UploadProgress,
                    loaded: event.loaded,
                };
                // If the total number of bytes being uploaded is available, include
                // it.
                if (event.lengthComputable) {
                    progress.total = event.total;
                }
                // Send the event.
                observer.next(progress);
            };
            // By default, register for load and error events.
            xhr.addEventListener('load', onLoad);
            xhr.addEventListener('error', onError);
            xhr.addEventListener('timeout', onError);
            xhr.addEventListener('abort', onError);
            // Progress events are only enabled if requested.
            if (req.reportProgress) {
                // Download progress is always enabled if requested.
                xhr.addEventListener('progress', onDownProgress);
                // Upload progress depends on whether there is a body to upload.
                if (reqBody !== null && xhr.upload) {
                    xhr.upload.addEventListener('progress', onUpProgress);
                }
            }
            // Fire the request, and notify the event stream that it was fired.
            xhr.send(reqBody);
            observer.next({ type: HttpEventType.Sent });
            // This is the return from the Observable function, which is the
            // request cancellation handler.
            return () => {
                // On a cancellation, remove all registered event listeners.
                xhr.removeEventListener('error', onError);
                xhr.removeEventListener('abort', onError);
                xhr.removeEventListener('load', onLoad);
                xhr.removeEventListener('timeout', onError);
                if (req.reportProgress) {
                    xhr.removeEventListener('progress', onDownProgress);
                    if (reqBody !== null && xhr.upload) {
                        xhr.upload.removeEventListener('progress', onUpProgress);
                    }
                }
                // Finally, abort the in-flight request.
                if (xhr.readyState !== xhr.DONE) {
                    xhr.abort();
                }
            };
        });
    }
}
HttpXhrBackend.decorators = [
    { type: Injectable }
];
HttpXhrBackend.ctorParameters = () => [
    { type: XhrFactory }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieGhyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL2h0dHAvc3JjL3hoci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDM0MsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEVBQUMsVUFBVSxFQUFXLE1BQU0sTUFBTSxDQUFDO0FBRzFDLE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxXQUFXLENBQUM7QUFFdEMsT0FBTyxFQUE0QixpQkFBaUIsRUFBYSxhQUFhLEVBQUUsa0JBQWtCLEVBQXNCLFlBQVksRUFBMEMsTUFBTSxZQUFZLENBQUM7QUFHak0sTUFBTSxXQUFXLEdBQUcsY0FBYyxDQUFDO0FBRW5DOzs7R0FHRztBQUNILFNBQVMsY0FBYyxDQUFDLEdBQVE7SUFDOUIsSUFBSSxhQUFhLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxXQUFXLEVBQUU7UUFDM0MsT0FBTyxHQUFHLENBQUMsV0FBVyxDQUFDO0tBQ3hCO0lBQ0QsSUFBSSxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLHFCQUFxQixFQUFFLENBQUMsRUFBRTtRQUN4RCxPQUFPLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxlQUFlLENBQUMsQ0FBQztLQUMvQztJQUNELE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQztBQUVEOzs7Ozs7R0FNRztBQUVILE1BQU0sT0FBTyxjQUFjO0lBQ3pCLFlBQW9CLFVBQXNCO1FBQXRCLGVBQVUsR0FBVixVQUFVLENBQVk7SUFBRyxDQUFDO0lBRTlDOzs7O09BSUc7SUFDSCxNQUFNLENBQUMsR0FBcUI7UUFDMUIseUVBQXlFO1FBQ3pFLGtFQUFrRTtRQUNsRSxJQUFJLEdBQUcsQ0FBQyxNQUFNLEtBQUssT0FBTyxFQUFFO1lBQzFCLE1BQU0s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QWpDSCxVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7WGhyRmFjdG9yeX0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge09ic2VydmFibGUsIE9ic2VydmVyfSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHtIdHRwQmFja2VuZH0gZnJvbSAnLi9iYWNrZW5kJztcbmltcG9ydCB7SHR0cEhlYWRlcnN9IGZyb20gJy4vaGVhZGVycyc7XG5pbXBvcnQge0h0dHBSZXF1ZXN0fSBmcm9tICcuL3JlcXVlc3QnO1xuaW1wb3J0IHtIdHRwRG93bmxvYWRQcm9ncmVzc0V2ZW50LCBIdHRwRXJyb3JSZXNwb25zZSwgSHR0cEV2ZW50LCBIdHRwRXZlbnRUeXBlLCBIdHRwSGVhZGVyUmVzcG9uc2UsIEh0dHBKc29uUGFyc2VFcnJvciwgSHR0cFJlc3BvbnNlLCBIdHRwU3RhdHVzQ29kZSwgSHR0cFVwbG9hZFByb2dyZXNzRXZlbnR9IGZyb20gJy4vcmVzcG9uc2UnO1xuXG5cbmNvbnN0IFhTU0lfUFJFRklYID0gL15cXClcXF1cXH0nLD9cXG4vO1xuXG4vKipcbiAqIERldGVybWluZSBhbiBhcHByb3ByaWF0ZSBVUkwgZm9yIHRoZSByZXNwb25zZSwgYnkgY2hlY2tpbmcgZWl0aGVyXG4gKiBYTUxIdHRwUmVxdWVzdC5yZXNwb25zZVVSTCBvciB0aGUgWC1SZXF1ZXN0LVVSTCBoZWFkZXIuXG4gKi9cbmZ1bmN0aW9uIGdldFJlc3BvbnNlVXJsKHhocjogYW55KTogc3RyaW5nfG51bGwge1xuICBpZiAoJ3Jlc3BvbnNlVVJMJyBpbiB4aHIgJiYgeGhyLnJlc3BvbnNlVVJMKSB7XG4gICAgcmV0dXJuIHhoci5yZXNwb25zZVVSTDtcbiAgfVxuICBpZiAoL15YLVJlcXVlc3QtVVJMOi9tLnRlc3QoeGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpKSkge1xuICAgIHJldHVybiB4aHIuZ2V0UmVzcG9uc2VIZWFkZXIoJ1gtUmVxdWVzdC1VUkwnKTtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuLyoqXG4gKiBVc2VzIGBYTUxIdHRwUmVxdWVzdGAgdG8gc2VuZCByZXF1ZXN0cyB0byBhIGJhY2tlbmQgc2VydmVyLlxuICogQHNlZSBgSHR0cEhhbmRsZXJgXG4gKiBAc2VlIGBKc29ucENsaWVudEJhY2tlbmRgXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgSHR0cFhockJhY2tlbmQgaW1wbGVtZW50cyBIdHRwQmFja2VuZCB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgeGhyRmFjdG9yeTogWGhyRmFjdG9yeSkge31cblxuICAvKipcbiAgICogUHJvY2Vzc2VzIGEgcmVxdWVzdCBhbmQgcmV0dXJucyBhIHN0cmVhbSBvZiByZXNwb25zZSBldmVudHMuXG4gICAqIEBwYXJhbSByZXEgVGhlIHJlcXVlc3Qgb2JqZWN0LlxuICAgKiBAcmV0dXJucyBBbiBvYnNlcnZhYmxlIG9mIHRoZSByZXNwb25zZSBldmVudHMuXG4gICAqL1xuICBoYW5kbGUocmVxOiBIdHRwUmVxdWVzdDxhbnk+KTogT2JzZXJ2YWJsZTxIdHRwRXZlbnQ8YW55Pj4ge1xuICAgIC8vIFF1aWNrIGNoZWNrIHRvIGdpdmUgYSBiZXR0ZXIgZXJyb3IgbWVzc2FnZSB3aGVuIGEgdXNlciBhdHRlbXB0cyB0byB1c2VcbiAgICAvLyBIdHRwQ2xpZW50Lmpzb25wKCkgd2l0aG91dCBpbnN0YWxsaW5nIHRoZSBIdHRwQ2xpZW50SnNvbnBNb2R1bGVcbiAgICBpZiAocmVxLm1ldGhvZCA9PT0gJ0pTT05QJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBBdHRlbXB0ZWQgdG8gY29uc3RydWN0IEpzb25wIHJlcXVlc3Qgd2l0aG91dCBIdHRwQ2xpZW50SnNvbnBNb2R1bGUgaW5zdGFsbGVkLmApO1xuICAgIH1cblxuICAgIC8vIEV2ZXJ5dGhpbmcgaGFwcGVucyBvbiBPYnNlcnZhYmxlIHN1YnNjcmlwdGlvbi5cbiAgICByZXR1cm4gbmV3IE9ic2VydmFibGUoKG9ic2VydmVyOiBPYnNlcnZlcjxIdHRwRXZlbnQ8YW55Pj4pID0+IHtcbiAgICAgIC8vIFN0YXJ0IGJ5IHNldHRpbmcgdXAgdGhlIFhIUiBvYmplY3Qgd2l0aCByZXF1ZXN0IG1ldGhvZCwgVVJMLCBhbmQgd2l0aENyZWRlbnRpYWxzIGZsYWcuXG4gICAgICBjb25zdCB4aHIgPSB0aGlzLnhockZhY3RvcnkuYnVpbGQoKTtcbiAgICAgIHhoci5vcGVuKHJlcS5tZXRob2QsIHJlcS51cmxXaXRoUGFyYW1zKTtcbiAgICAgIGlmICghIXJlcS53aXRoQ3JlZGVudGlhbHMpIHtcbiAgICAgICAgeGhyLndpdGhDcmVkZW50aWFscyA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIC8vIEFkZCBhbGwgdGhlIHJlcXVlc3RlZCBoZWFkZXJzLlxuICAgICAgcmVxLmhlYWRlcnMuZm9yRWFjaCgobmFtZSwgdmFsdWVzKSA9PiB4aHIuc2V0UmVxdWVzdEhlYWRlcihuYW1lLCB2YWx1ZXMuam9pbignLCcpKSk7XG5cbiAgICAgIC8vIEFkZCBhbiBBY2NlcHQgaGVhZGVyIGlmIG9uZSBpc24ndCBwcmVzZW50IGFscmVhZHkuXG4gICAgICBpZiAoIXJlcS5oZWFkZXJzLmhhcygnQWNjZXB0JykpIHtcbiAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0FjY2VwdCcsICdhcHBsaWNhdGlvbi9qc29uLCB0ZXh0L3BsYWluLCAqLyonKTtcbiAgICAgIH1cblxuICAgICAgLy8gQXV0by1kZXRlY3QgdGhlIENvbnRlbnQtVHlwZSBoZWFkZXIgaWYgb25lIGlzbid0IHByZXNlbnQgYWxyZWFkeS5cbiAgICAgIGlmICghcmVxLmhlYWRlcnMuaGFzKCdDb250ZW50LVR5cGUnKSkge1xuICAgICAgICBjb25zdCBkZXRlY3RlZFR5cGUgPSByZXEuZGV0ZWN0Q29udGVudFR5cGVIZWFkZXIoKTtcbiAgICAgICAgLy8gU29tZXRpbWVzIENvbnRlbnQtVHlwZSBkZXRlY3Rpb24gZmFpbHMuXG4gICAgICAgIGlmIChkZXRlY3RlZFR5cGUgIT09IG51bGwpIHtcbiAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC1UeXBlJywgZGV0ZWN0ZWRUeXBlKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBTZXQgdGhlIHJlc3BvbnNlVHlwZSBpZiBvbmUgd2FzIHJlcXVlc3RlZC5cbiAgICAgIGlmIChyZXEucmVzcG9uc2VUeXBlKSB7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlVHlwZSA9IHJlcS5yZXNwb25zZVR5cGUudG9Mb3dlckNhc2UoKTtcblxuICAgICAgICAvLyBKU09OIHJlc3BvbnNlcyBuZWVkIHRvIGJlIHByb2Nlc3NlZCBhcyB0ZXh0LiBUaGlzIGlzIGJlY2F1c2UgaWYgdGhlIHNlcnZlclxuICAgICAgICAvLyByZXR1cm5zIGFuIFhTU0ktcHJlZml4ZWQgSlNPTiByZXNwb25zZSwgdGhlIGJyb3dzZXIgd2lsbCBmYWlsIHRvIHBhcnNlIGl0LFxuICAgICAgICAvLyB4aHIucmVzcG9uc2Ugd2lsbCBiZSBudWxsLCBhbmQgeGhyLnJlc3BvbnNlVGV4dCBjYW5ub3QgYmUgYWNjZXNzZWQgdG9cbiAgICAgICAgLy8gcmV0cmlldmUgdGhlIHByZWZpeGVkIEpTT04gZGF0YSBpbiBvcmRlciB0byBzdHJpcCB0aGUgcHJlZml4LiBUaHVzLCBhbGwgSlNPTlxuICAgICAgICAvLyBpcyBwYXJzZWQgYnkgZmlyc3QgcmVxdWVzdGluZyB0ZXh0IGFuZCB0aGVuIGFwcGx5aW5nIEpTT04ucGFyc2UuXG4gICAgICAgIHhoci5yZXNwb25zZVR5cGUgPSAoKHJlc3BvbnNlVHlwZSAhPT0gJ2pzb24nKSA/IHJlc3BvbnNlVHlwZSA6ICd0ZXh0JykgYXMgYW55O1xuICAgICAgfVxuXG4gICAgICAvLyBTZXJpYWxpemUgdGhlIHJlcXVlc3QgYm9keSBpZiBvbmUgaXMgcHJlc2VudC4gSWYgbm90LCB0aGlzIHdpbGwgYmUgc2V0IHRvIG51bGwuXG4gICAgICBjb25zdCByZXFCb2R5ID0gcmVxLnNlcmlhbGl6ZUJvZHkoKTtcblxuICAgICAgLy8gSWYgcHJvZ3Jlc3MgZXZlbnRzIGFyZSBlbmFibGVkLCByZXNwb25zZSBoZWFkZXJzIHdpbGwgYmUgZGVsaXZlcmVkXG4gICAgICAvLyBpbiB0d28gZXZlbnRzIC0gdGhlIEh0dHBIZWFkZXJSZXNwb25zZSBldmVudCBhbmQgdGhlIGZ1bGwgSHR0cFJlc3BvbnNlXG4gICAgICAvLyBldmVudC4gSG93ZXZlciwgc2luY2UgcmVzcG9uc2UgaGVhZGVycyBkb24ndCBjaGFuZ2UgaW4gYmV0d2VlbiB0aGVzZVxuICAgICAgLy8gdHdvIGV2ZW50cywgaXQgZG9lc24ndCBtYWtlIHNlbnNlIHRvIHBhcnNlIHRoZW0gdHdpY2UuIFNvIGhlYWRlclJlc3BvbnNlXG4gICAgICAvLyBjYWNoZXMgdGhlIGRhdGEgZXh0cmFjdGVkIGZyb20gdGhlIHJlc3BvbnNlIHdoZW5ldmVyIGl0J3MgZmlyc3QgcGFyc2VkLFxuICAgICAgLy8gdG8gZW5zdXJlIHBhcnNpbmcgaXNuJ3QgZHVwbGljYXRlZC5cbiAgICAgIGxldCBoZWFkZXJSZXNwb25zZTogSHR0cEhlYWRlclJlc3BvbnNlfG51bGwgPSBudWxsO1xuXG4gICAgICAvLyBwYXJ0aWFsRnJvbVhociBleHRyYWN0cyB0aGUgSHR0cEhlYWRlclJlc3BvbnNlIGZyb20gdGhlIGN1cnJlbnQgWE1MSHR0cFJlcXVlc3RcbiAgICAgIC8vIHN0YXRlLCBhbmQgbWVtb2l6ZXMgaXQgaW50byBoZWFkZXJSZXNwb25zZS5cbiAgICAgIGNvbnN0IHBhcnRpYWxGcm9tWGhyID0gKCk6IEh0dHBIZWFkZXJSZXNwb25zZSA9PiB7XG4gICAgICAgIGlmIChoZWFkZXJSZXNwb25zZSAhPT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybiBoZWFkZXJSZXNwb25zZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlYWQgc3RhdHVzIGFuZCBub3JtYWxpemUgYW4gSUU5IGJ1ZyAoaHR0cHM6Ly9idWdzLmpxdWVyeS5jb20vdGlja2V0LzE0NTApLlxuICAgICAgICBjb25zdCBzdGF0dXM6IG51bWJlciA9IHhoci5zdGF0dXMgPT09IDEyMjMgPyBIdHRwU3RhdHVzQ29kZS5Ob0NvbnRlbnQgOiB4aHIuc3RhdHVzO1xuICAgICAgICBjb25zdCBzdGF0dXNUZXh0ID0geGhyLnN0YXR1c1RleHQgfHwgJ09LJztcblxuICAgICAgICAvLyBQYXJzZSBoZWFkZXJzIGZyb20gWE1MSHR0cFJlcXVlc3QgLSB0aGlzIHN0ZXAgaXMgbGF6eS5cbiAgICAgICAgY29uc3QgaGVhZGVycyA9IG5ldyBIdHRwSGVhZGVycyh4aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkpO1xuXG4gICAgICAgIC8vIFJlYWQgdGhlIHJlc3BvbnNlIFVSTCBmcm9tIHRoZSBYTUxIdHRwUmVzcG9uc2UgaW5zdGFuY2UgYW5kIGZhbGwgYmFjayBvbiB0aGVcbiAgICAgICAgLy8gcmVxdWVzdCBVUkwuXG4gICAgICAgIGNvbnN0IHVybCA9IGdldFJlc3BvbnNlVXJsKHhocikgfHwgcmVxLnVybDtcblxuICAgICAgICAvLyBDb25zdHJ1Y3QgdGhlIEh0dHBIZWFkZXJSZXNwb25zZSBhbmQgbWVtb2l6ZSBpdC5cbiAgICAgICAgaGVhZGVyUmVzcG9uc2UgPSBuZXcgSHR0cEhlYWRlclJlc3BvbnNlKHtoZWFkZXJzLCBzdGF0dXMsIHN0YXR1c1RleHQsIHVybH0pO1xuICAgICAgICByZXR1cm4gaGVhZGVyUmVzcG9uc2U7XG4gICAgICB9O1xuXG4gICAgICAvLyBOZXh0LCBhIGZldyBjbG9zdXJlcyBhcmUgZGVmaW5lZCBmb3IgdGhlIHZhcmlvdXMgZXZlbnRzIHdoaWNoIFhNTEh0dHBSZXF1ZXN0IGNhblxuICAgICAgLy8gZW1pdC4gVGhpcyBhbGxvd3MgdGhlbSB0byBiZSB1bnJlZ2lzdGVyZWQgYXMgZXZlbnQgbGlzdGVuZXJzIGxhdGVyLlxuXG4gICAgICAvLyBGaXJzdCB1cCBpcyB0aGUgbG9hZCBldmVudCwgd2hpY2ggcmVwcmVzZW50cyBhIHJlc3BvbnNlIGJlaW5nIGZ1bGx5IGF2YWlsYWJsZS5cbiAgICAgIGNvbnN0IG9uTG9hZCA9ICgpID0+IHtcbiAgICAgICAgLy8gUmVhZCByZXNwb25zZSBzdGF0ZSBmcm9tIHRoZSBtZW1vaXplZCBwYXJ0aWFsIGRhdGEuXG4gICAgICAgIGxldCB7aGVhZGVycywgc3RhdHVzLCBzdGF0dXNUZXh0LCB1cmx9ID0gcGFydGlhbEZyb21YaHIoKTtcblxuICAgICAgICAvLyBUaGUgYm9keSB3aWxsIGJlIHJlYWQgb3V0IGlmIHByZXNlbnQuXG4gICAgICAgIGxldCBib2R5OiBhbnl8bnVsbCA9IG51bGw7XG5cbiAgICAgICAgaWYgKHN0YXR1cyAhPT0gSHR0cFN0YXR1c0NvZGUuTm9Db250ZW50KSB7XG4gICAgICAgICAgLy8gVXNlIFhNTEh0dHBSZXF1ZXN0LnJlc3BvbnNlIGlmIHNldCwgcmVzcG9uc2VUZXh0IG90aGVyd2lzZS5cbiAgICAgICAgICBib2R5ID0gKHR5cGVvZiB4aHIucmVzcG9uc2UgPT09ICd1bmRlZmluZWQnKSA/IHhoci5yZXNwb25zZVRleHQgOiB4aHIucmVzcG9uc2U7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBOb3JtYWxpemUgYW5vdGhlciBwb3RlbnRpYWwgYnVnICh0aGlzIG9uZSBjb21lcyBmcm9tIENPUlMpLlxuICAgICAgICBpZiAoc3RhdHVzID09PSAwKSB7XG4gICAgICAgICAgc3RhdHVzID0gISFib2R5ID8gSHR0cFN0YXR1c0NvZGUuT2sgOiAwO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gb2sgZGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSByZXNwb25zZSB3aWxsIGJlIHRyYW5zbWl0dGVkIG9uIHRoZSBldmVudCBvclxuICAgICAgICAvLyBlcnJvciBjaGFubmVsLiBVbnN1Y2Nlc3NmdWwgc3RhdHVzIGNvZGVzIChub3QgMnh4KSB3aWxsIGFsd2F5cyBiZSBlcnJvcnMsXG4gICAgICAgIC8vIGJ1dCBhIHN1Y2Nlc3NmdWwgc3RhdHVzIGNvZGUgY2FuIHN0aWxsIHJlc3VsdCBpbiBhbiBlcnJvciBpZiB0aGUgdXNlclxuICAgICAgICAvLyBhc2tlZCBmb3IgSlNPTiBkYXRhIGFuZCB0aGUgYm9keSBjYW5ub3QgYmUgcGFyc2VkIGFzIHN1Y2guXG4gICAgICAgIGxldCBvayA9IHN0YXR1cyA+PSAyMDAgJiYgc3RhdHVzIDwgMzAwO1xuXG4gICAgICAgIC8vIENoZWNrIHdoZXRoZXIgdGhlIGJvZHkgbmVlZHMgdG8gYmUgcGFyc2VkIGFzIEpTT04gKGluIG1hbnkgY2FzZXMgdGhlIGJyb3dzZXJcbiAgICAgICAgLy8gd2lsbCBoYXZlIGRvbmUgdGhhdCBhbHJlYWR5KS5cbiAgICAgICAgaWYgKHJlcS5yZXNwb25zZVR5cGUgPT09ICdqc29uJyAmJiB0eXBlb2YgYm9keSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAvLyBTYXZlIHRoZSBvcmlnaW5hbCBib2R5LCBiZWZvcmUgYXR0ZW1wdGluZyBYU1NJIHByZWZpeCBzdHJpcHBpbmcuXG4gICAgICAgICAgY29uc3Qgb3JpZ2luYWxCb2R5ID0gYm9keTtcbiAgICAgICAgICBib2R5ID0gYm9keS5yZXBsYWNlKFhTU0lfUFJFRklYLCAnJyk7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIEF0dGVtcHQgdGhlIHBhcnNlLiBJZiBpdCBmYWlscywgYSBwYXJzZSBlcnJvciBzaG91bGQgYmUgZGVsaXZlcmVkIHRvIHRoZSB1c2VyLlxuICAgICAgICAgICAgYm9keSA9IGJvZHkgIT09ICcnID8gSlNPTi5wYXJzZShib2R5KSA6IG51bGw7XG4gICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIC8vIFNpbmNlIHRoZSBKU09OLnBhcnNlIGZhaWxlZCwgaXQncyByZWFzb25hYmxlIHRvIGFzc3VtZSB0aGlzIG1pZ2h0IG5vdCBoYXZlIGJlZW4gYVxuICAgICAgICAgICAgLy8gSlNPTiByZXNwb25zZS4gUmVzdG9yZSB0aGUgb3JpZ2luYWwgYm9keSAoaW5jbHVkaW5nIGFueSBYU1NJIHByZWZpeCkgdG8gZGVsaXZlclxuICAgICAgICAgICAgLy8gYSBiZXR0ZXIgZXJyb3IgcmVzcG9uc2UuXG4gICAgICAgICAgICBib2R5ID0gb3JpZ2luYWxCb2R5O1xuXG4gICAgICAgICAgICAvLyBJZiB0aGlzIHdhcyBhbiBlcnJvciByZXF1ZXN0IHRvIGJlZ2luIHdpdGgsIGxlYXZlIGl0IGFzIGEgc3RyaW5nLCBpdCBwcm9iYWJseVxuICAgICAgICAgICAgLy8ganVzdCBpc24ndCBKU09OLiBPdGhlcndpc2UsIGRlbGl2ZXIgdGhlIHBhcnNpbmcgZXJyb3IgdG8gdGhlIHVzZXIuXG4gICAgICAgICAgICBpZiAob2spIHtcbiAgICAgICAgICAgICAgLy8gRXZlbiB0aG91Z2ggdGhlIHJlc3BvbnNlIHN0YXR1cyB3YXMgMnh4LCB0aGlzIGlzIHN0aWxsIGFuIGVycm9yLlxuICAgICAgICAgICAgICBvayA9IGZhbHNlO1xuICAgICAgICAgICAgICAvLyBUaGUgcGFyc2UgZXJyb3IgY29udGFpbnMgdGhlIHRleHQgb2YgdGhlIGJvZHkgdGhhdCBmYWlsZWQgdG8gcGFyc2UuXG4gICAgICAgICAgICAgIGJvZHkgPSB7ZXJyb3IsIHRleHQ6IGJvZHl9IGFzIEh0dHBKc29uUGFyc2VFcnJvcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAob2spIHtcbiAgICAgICAgICAvLyBBIHN1Y2Nlc3NmdWwgcmVzcG9uc2UgaXMgZGVsaXZlcmVkIG9uIHRoZSBldmVudCBzdHJlYW0uXG4gICAgICAgICAgb2JzZXJ2ZXIubmV4dChuZXcgSHR0cFJlc3BvbnNlKHtcbiAgICAgICAgICAgIGJvZHksXG4gICAgICAgICAgICBoZWFkZXJzLFxuICAgICAgICAgICAgc3RhdHVzLFxuICAgICAgICAgICAgc3RhdHVzVGV4dCxcbiAgICAgICAgICAgIHVybDogdXJsIHx8IHVuZGVmaW5lZCxcbiAgICAgICAgICB9KSk7XG4gICAgICAgICAgLy8gVGhlIGZ1bGwgYm9keSBoYXMgYmVlbiByZWNlaXZlZCBhbmQgZGVsaXZlcmVkLCBubyBmdXJ0aGVyIGV2ZW50c1xuICAgICAgICAgIC8vIGFyZSBwb3NzaWJsZS4gVGhpcyByZXF1ZXN0IGlzIGNvbXBsZXRlLlxuICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gQW4gdW5zdWNjZXNzZnVsIHJlcXVlc3QgaXMgZGVsaXZlcmVkIG9uIHRoZSBlcnJvciBjaGFubmVsLlxuICAgICAgICAgIG9ic2VydmVyLmVycm9yKG5ldyBIdHRwRXJyb3JSZXNwb25zZSh7XG4gICAgICAgICAgICAvLyBUaGUgZXJyb3IgaW4gdGhpcyBjYXNlIGlzIHRoZSByZXNwb25zZSBib2R5IChlcnJvciBmcm9tIHRoZSBzZXJ2ZXIpLlxuICAgICAgICAgICAgZXJyb3I6IGJvZHksXG4gICAgICAgICAgICBoZWFkZXJzLFxuICAgICAgICAgICAgc3RhdHVzLFxuICAgICAgICAgICAgc3RhdHVzVGV4dCxcbiAgICAgICAgICAgIHVybDogdXJsIHx8IHVuZGVmaW5lZCxcbiAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIC8vIFRoZSBvbkVycm9yIGNhbGxiYWNrIGlzIGNhbGxlZCB3aGVuIHNvbWV0aGluZyBnb2VzIHdyb25nIGF0IHRoZSBuZXR3b3JrIGxldmVsLlxuICAgICAgLy8gQ29ubmVjdGlvbiB0aW1lb3V0LCBETlMgZXJyb3IsIG9mZmxpbmUsIGV0Yy4gVGhlc2UgYXJlIGFjdHVhbCBlcnJvcnMsIGFuZCBhcmVcbiAgICAgIC8vIHRyYW5zbWl0dGVkIG9uIHRoZSBlcnJvciBjaGFubmVsLlxuICAgICAgY29uc3Qgb25FcnJvciA9IChlcnJvcjogUHJvZ3Jlc3NFdmVudCkgPT4ge1xuICAgICAgICBjb25zdCB7dXJsfSA9IHBhcnRpYWxGcm9tWGhyKCk7XG4gICAgICAgIGNvbnN0IHJlcyA9IG5ldyBIdHRwRXJyb3JSZXNwb25zZSh7XG4gICAgICAgICAgZXJyb3IsXG4gICAgICAgICAgc3RhdHVzOiB4aHIuc3RhdHVzIHx8IDAsXG4gICAgICAgICAgc3RhdHVzVGV4dDogeGhyLnN0YXR1c1RleHQgfHwgJ1Vua25vd24gRXJyb3InLFxuICAgICAgICAgIHVybDogdXJsIHx8IHVuZGVmaW5lZCxcbiAgICAgICAgfSk7XG4gICAgICAgIG9ic2VydmVyLmVycm9yKHJlcyk7XG4gICAgICB9O1xuXG4gICAgICAvLyBUaGUgc2VudEhlYWRlcnMgZmxhZyB0cmFja3Mgd2hldGhlciB0aGUgSHR0cFJlc3BvbnNlSGVhZGVycyBldmVudFxuICAgICAgLy8gaGFzIGJlZW4gc2VudCBvbiB0aGUgc3RyZWFtLiBUaGlzIGlzIG5lY2Vzc2FyeSB0byB0cmFjayBpZiBwcm9ncmVzc1xuICAgICAgLy8gaXMgZW5hYmxlZCBzaW5jZSB0aGUgZXZlbnQgd2lsbCBiZSBzZW50IG9uIG9ubHkgdGhlIGZpcnN0IGRvd25sb2FkXG4gICAgICAvLyBwcm9nZXJzcyBldmVudC5cbiAgICAgIGxldCBzZW50SGVhZGVycyA9IGZhbHNlO1xuXG4gICAgICAvLyBUaGUgZG93bmxvYWQgcHJvZ3Jlc3MgZXZlbnQgaGFuZGxlciwgd2hpY2ggaXMgb25seSByZWdpc3RlcmVkIGlmXG4gICAgICAvLyBwcm9ncmVzcyBldmVudHMgYXJlIGVuYWJsZWQuXG4gICAgICBjb25zdCBvbkRvd25Qcm9ncmVzcyA9IChldmVudDogUHJvZ3Jlc3NFdmVudCkgPT4ge1xuICAgICAgICAvLyBTZW5kIHRoZSBIdHRwUmVzcG9uc2VIZWFkZXJzIGV2ZW50IGlmIGl0IGhhc24ndCBiZWVuIHNlbnQgYWxyZWFkeS5cbiAgICAgICAgaWYgKCFzZW50SGVhZGVycykge1xuICAgICAgICAgIG9ic2VydmVyLm5leHQocGFydGlhbEZyb21YaHIoKSk7XG4gICAgICAgICAgc2VudEhlYWRlcnMgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU3RhcnQgYnVpbGRpbmcgdGhlIGRvd25sb2FkIHByb2dyZXNzIGV2ZW50IHRvIGRlbGl2ZXIgb24gdGhlIHJlc3BvbnNlXG4gICAgICAgIC8vIGV2ZW50IHN0cmVhbS5cbiAgICAgICAgbGV0IHByb2dyZXNzRXZlbnQ6IEh0dHBEb3dubG9hZFByb2dyZXNzRXZlbnQgPSB7XG4gICAgICAgICAgdHlwZTogSHR0cEV2ZW50VHlwZS5Eb3dubG9hZFByb2dyZXNzLFxuICAgICAgICAgIGxvYWRlZDogZXZlbnQubG9hZGVkLFxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFNldCB0aGUgdG90YWwgbnVtYmVyIG9mIGJ5dGVzIGluIHRoZSBldmVudCBpZiBpdCdzIGF2YWlsYWJsZS5cbiAgICAgICAgaWYgKGV2ZW50Lmxlbmd0aENvbXB1dGFibGUpIHtcbiAgICAgICAgICBwcm9ncmVzc0V2ZW50LnRvdGFsID0gZXZlbnQudG90YWw7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiB0aGUgcmVxdWVzdCB3YXMgZm9yIHRleHQgY29udGVudCBhbmQgYSBwYXJ0aWFsIHJlc3BvbnNlIGlzXG4gICAgICAgIC8vIGF2YWlsYWJsZSBvbiBYTUxIdHRwUmVxdWVzdCwgaW5jbHVkZSBpdCBpbiB0aGUgcHJvZ3Jlc3MgZXZlbnRcbiAgICAgICAgLy8gdG8gYWxsb3cgZm9yIHN0cmVhbWluZyByZWFkcy5cbiAgICAgICAgaWYgKHJlcS5yZXNwb25zZVR5cGUgPT09ICd0ZXh0JyAmJiAhIXhoci5yZXNwb25zZVRleHQpIHtcbiAgICAgICAgICBwcm9ncmVzc0V2ZW50LnBhcnRpYWxUZXh0ID0geGhyLnJlc3BvbnNlVGV4dDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEZpbmFsbHksIGZpcmUgdGhlIGV2ZW50LlxuICAgICAgICBvYnNlcnZlci5uZXh0KHByb2dyZXNzRXZlbnQpO1xuICAgICAgfTtcblxuICAgICAgLy8gVGhlIHVwbG9hZCBwcm9ncmVzcyBldmVudCBoYW5kbGVyLCB3aGljaCBpcyBvbmx5IHJlZ2lzdGVyZWQgaWZcbiAgICAgIC8vIHByb2dyZXNzIGV2ZW50cyBhcmUgZW5hYmxlZC5cbiAgICAgIGNvbnN0IG9uVXBQcm9ncmVzcyA9IChldmVudDogUHJvZ3Jlc3NFdmVudCkgPT4ge1xuICAgICAgICAvLyBVcGxvYWQgcHJvZ3Jlc3MgZXZlbnRzIGFyZSBzaW1wbGVyLiBCZWdpbiBidWlsZGluZyB0aGUgcHJvZ3Jlc3NcbiAgICAgICAgLy8gZXZlbnQuXG4gICAgICAgIGxldCBwcm9ncmVzczogSHR0cFVwbG9hZFByb2dyZXNzRXZlbnQgPSB7XG4gICAgICAgICAgdHlwZTogSHR0cEV2ZW50VHlwZS5VcGxvYWRQcm9ncmVzcyxcbiAgICAgICAgICBsb2FkZWQ6IGV2ZW50LmxvYWRlZCxcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBJZiB0aGUgdG90YWwgbnVtYmVyIG9mIGJ5dGVzIGJlaW5nIHVwbG9hZGVkIGlzIGF2YWlsYWJsZSwgaW5jbHVkZVxuICAgICAgICAvLyBpdC5cbiAgICAgICAgaWYgKGV2ZW50Lmxlbmd0aENvbXB1dGFibGUpIHtcbiAgICAgICAgICBwcm9ncmVzcy50b3RhbCA9IGV2ZW50LnRvdGFsO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2VuZCB0aGUgZXZlbnQuXG4gICAgICAgIG9ic2VydmVyLm5leHQocHJvZ3Jlc3MpO1xuICAgICAgfTtcblxuICAgICAgLy8gQnkgZGVmYXVsdCwgcmVnaXN0ZXIgZm9yIGxvYWQgYW5kIGVycm9yIGV2ZW50cy5cbiAgICAgIHhoci5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgb25Mb2FkKTtcbiAgICAgIHhoci5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIG9uRXJyb3IpO1xuICAgICAgeGhyLmFkZEV2ZW50TGlzdGVuZXIoJ3RpbWVvdXQnLCBvbkVycm9yKTtcbiAgICAgIHhoci5hZGRFdmVudExpc3RlbmVyKCdhYm9ydCcsIG9uRXJyb3IpO1xuXG4gICAgICAvLyBQcm9ncmVzcyBldmVudHMgYXJlIG9ubHkgZW5hYmxlZCBpZiByZXF1ZXN0ZWQuXG4gICAgICBpZiAocmVxLnJlcG9ydFByb2dyZXNzKSB7XG4gICAgICAgIC8vIERvd25sb2FkIHByb2dyZXNzIGlzIGFsd2F5cyBlbmFibGVkIGlmIHJlcXVlc3RlZC5cbiAgICAgICAgeGhyLmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgb25Eb3duUHJvZ3Jlc3MpO1xuXG4gICAgICAgIC8vIFVwbG9hZCBwcm9ncmVzcyBkZXBlbmRzIG9uIHdoZXRoZXIgdGhlcmUgaXMgYSBib2R5IHRvIHVwbG9hZC5cbiAgICAgICAgaWYgKHJlcUJvZHkgIT09IG51bGwgJiYgeGhyLnVwbG9hZCkge1xuICAgICAgICAgIHhoci51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBvblVwUHJvZ3Jlc3MpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIEZpcmUgdGhlIHJlcXVlc3QsIGFuZCBub3RpZnkgdGhlIGV2ZW50IHN0cmVhbSB0aGF0IGl0IHdhcyBmaXJlZC5cbiAgICAgIHhoci5zZW5kKHJlcUJvZHkhKTtcbiAgICAgIG9ic2VydmVyLm5leHQoe3R5cGU6IEh0dHBFdmVudFR5cGUuU2VudH0pO1xuXG4gICAgICAvLyBUaGlzIGlzIHRoZSByZXR1cm4gZnJvbSB0aGUgT2JzZXJ2YWJsZSBmdW5jdGlvbiwgd2hpY2ggaXMgdGhlXG4gICAgICAvLyByZXF1ZXN0IGNhbmNlbGxhdGlvbiBoYW5kbGVyLlxuICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgLy8gT24gYSBjYW5jZWxsYXRpb24sIHJlbW92ZSBhbGwgcmVnaXN0ZXJlZCBldmVudCBsaXN0ZW5lcnMuXG4gICAgICAgIHhoci5yZW1vdmVFdmVudExpc3RlbmVyKCdlcnJvcicsIG9uRXJyb3IpO1xuICAgICAgICB4aHIucmVtb3ZlRXZlbnRMaXN0ZW5lcignYWJvcnQnLCBvbkVycm9yKTtcbiAgICAgICAgeGhyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBvbkxvYWQpO1xuICAgICAgICB4aHIucmVtb3ZlRXZlbnRMaXN0ZW5lcigndGltZW91dCcsIG9uRXJyb3IpO1xuICAgICAgICBpZiAocmVxLnJlcG9ydFByb2dyZXNzKSB7XG4gICAgICAgICAgeGhyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgb25Eb3duUHJvZ3Jlc3MpO1xuICAgICAgICAgIGlmIChyZXFCb2R5ICE9PSBudWxsICYmIHhoci51cGxvYWQpIHtcbiAgICAgICAgICAgIHhoci51cGxvYWQucmVtb3ZlRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBvblVwUHJvZ3Jlc3MpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEZpbmFsbHksIGFib3J0IHRoZSBpbi1mbGlnaHQgcmVxdWVzdC5cbiAgICAgICAgaWYgKHhoci5yZWFkeVN0YXRlICE9PSB4aHIuRE9ORSkge1xuICAgICAgICAgIHhoci5hYm9ydCgpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG59XG4iXX0=