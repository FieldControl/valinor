/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { HttpErrorResponse, HttpHeaders, HttpResponse, HttpStatusCode, } from '@angular/common/http';
/**
 * A mock requests that was received and is ready to be answered.
 *
 * This interface allows access to the underlying `HttpRequest`, and allows
 * responding with `HttpEvent`s or `HttpErrorResponse`s.
 *
 * @publicApi
 */
export class TestRequest {
    /**
     * Whether the request was cancelled after it was sent.
     */
    get cancelled() {
        return this._cancelled;
    }
    constructor(request, observer) {
        this.request = request;
        this.observer = observer;
        /**
         * @internal set by `HttpClientTestingBackend`
         */
        this._cancelled = false;
    }
    /**
     * Resolve the request by returning a body plus additional HTTP information (such as response
     * headers) if provided.
     * If the request specifies an expected body type, the body is converted into the requested type.
     * Otherwise, the body is converted to `JSON` by default.
     *
     * Both successful and unsuccessful responses can be delivered via `flush()`.
     */
    flush(body, opts = {}) {
        if (this.cancelled) {
            throw new Error(`Cannot flush a cancelled request.`);
        }
        const url = this.request.urlWithParams;
        const headers = opts.headers instanceof HttpHeaders ? opts.headers : new HttpHeaders(opts.headers);
        body = _maybeConvertBody(this.request.responseType, body);
        let statusText = opts.statusText;
        let status = opts.status !== undefined ? opts.status : HttpStatusCode.Ok;
        if (opts.status === undefined) {
            if (body === null) {
                status = HttpStatusCode.NoContent;
                statusText ||= 'No Content';
            }
            else {
                statusText ||= 'OK';
            }
        }
        if (statusText === undefined) {
            throw new Error('statusText is required when setting a custom status.');
        }
        if (status >= 200 && status < 300) {
            this.observer.next(new HttpResponse({ body, headers, status, statusText, url }));
            this.observer.complete();
        }
        else {
            this.observer.error(new HttpErrorResponse({ error: body, headers, status, statusText, url }));
        }
    }
    error(error, opts = {}) {
        if (this.cancelled) {
            throw new Error(`Cannot return an error for a cancelled request.`);
        }
        if (opts.status && opts.status >= 200 && opts.status < 300) {
            throw new Error(`error() called with a successful status.`);
        }
        const headers = opts.headers instanceof HttpHeaders ? opts.headers : new HttpHeaders(opts.headers);
        this.observer.error(new HttpErrorResponse({
            error,
            headers,
            status: opts.status || 0,
            statusText: opts.statusText || '',
            url: this.request.urlWithParams,
        }));
    }
    /**
     * Deliver an arbitrary `HttpEvent` (such as a progress event) on the response stream for this
     * request.
     */
    event(event) {
        if (this.cancelled) {
            throw new Error(`Cannot send events to a cancelled request.`);
        }
        this.observer.next(event);
    }
}
/**
 * Helper function to convert a response body to an ArrayBuffer.
 */
function _toArrayBufferBody(body) {
    if (typeof ArrayBuffer === 'undefined') {
        throw new Error('ArrayBuffer responses are not supported on this platform.');
    }
    if (body instanceof ArrayBuffer) {
        return body;
    }
    throw new Error('Automatic conversion to ArrayBuffer is not supported for response type.');
}
/**
 * Helper function to convert a response body to a Blob.
 */
function _toBlob(body) {
    if (typeof Blob === 'undefined') {
        throw new Error('Blob responses are not supported on this platform.');
    }
    if (body instanceof Blob) {
        return body;
    }
    if (ArrayBuffer && body instanceof ArrayBuffer) {
        return new Blob([body]);
    }
    throw new Error('Automatic conversion to Blob is not supported for response type.');
}
/**
 * Helper function to convert a response body to JSON data.
 */
function _toJsonBody(body, format = 'JSON') {
    if (typeof ArrayBuffer !== 'undefined' && body instanceof ArrayBuffer) {
        throw new Error(`Automatic conversion to ${format} is not supported for ArrayBuffers.`);
    }
    if (typeof Blob !== 'undefined' && body instanceof Blob) {
        throw new Error(`Automatic conversion to ${format} is not supported for Blobs.`);
    }
    if (typeof body === 'string' ||
        typeof body === 'number' ||
        typeof body === 'object' ||
        typeof body === 'boolean' ||
        Array.isArray(body)) {
        return body;
    }
    throw new Error(`Automatic conversion to ${format} is not supported for response type.`);
}
/**
 * Helper function to convert a response body to a string.
 */
function _toTextBody(body) {
    if (typeof body === 'string') {
        return body;
    }
    if (typeof ArrayBuffer !== 'undefined' && body instanceof ArrayBuffer) {
        throw new Error('Automatic conversion to text is not supported for ArrayBuffers.');
    }
    if (typeof Blob !== 'undefined' && body instanceof Blob) {
        throw new Error('Automatic conversion to text is not supported for Blobs.');
    }
    return JSON.stringify(_toJsonBody(body, 'text'));
}
/**
 * Convert a response body to the requested type.
 */
function _maybeConvertBody(responseType, body) {
    if (body === null) {
        return null;
    }
    switch (responseType) {
        case 'arraybuffer':
            return _toArrayBufferBody(body);
        case 'blob':
            return _toBlob(body);
        case 'json':
            return _toJsonBody(body);
        case 'text':
            return _toTextBody(body);
        default:
            throw new Error(`Unsupported responseType: ${responseType}`);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVxdWVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9odHRwL3Rlc3Rpbmcvc3JjL3JlcXVlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLGlCQUFpQixFQUVqQixXQUFXLEVBRVgsWUFBWSxFQUNaLGNBQWMsR0FDZixNQUFNLHNCQUFzQixDQUFDO0FBYTlCOzs7Ozs7O0dBT0c7QUFDSCxNQUFNLE9BQU8sV0FBVztJQUN0Qjs7T0FFRztJQUNILElBQUksU0FBUztRQUNYLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQztJQUN6QixDQUFDO0lBT0QsWUFDUyxPQUF5QixFQUN4QixRQUFrQztRQURuQyxZQUFPLEdBQVAsT0FBTyxDQUFrQjtRQUN4QixhQUFRLEdBQVIsUUFBUSxDQUEwQjtRQVA1Qzs7V0FFRztRQUNILGVBQVUsR0FBRyxLQUFLLENBQUM7SUFLaEIsQ0FBQztJQUVKOzs7Ozs7O09BT0c7SUFDSCxLQUFLLENBQ0gsSUFRUSxFQUNSLE9BSUksRUFBRTtRQUVOLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ25CLE1BQU0sSUFBSSxLQUFLLENBQUMsbUNBQW1DLENBQUMsQ0FBQztRQUN2RCxDQUFDO1FBQ0QsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUM7UUFDdkMsTUFBTSxPQUFPLEdBQ1gsSUFBSSxDQUFDLE9BQU8sWUFBWSxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNyRixJQUFJLEdBQUcsaUJBQWlCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDMUQsSUFBSSxVQUFVLEdBQXVCLElBQUks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SUFBSSxLQUFLLENBQUMsNkJBQTZCLFlBQVksRUFBRSxDQUFDLENBQUM7SUFDakUsQ0FBQztBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIEh0dHBFcnJvclJlc3BvbnNlLFxuICBIdHRwRXZlbnQsXG4gIEh0dHBIZWFkZXJzLFxuICBIdHRwUmVxdWVzdCxcbiAgSHR0cFJlc3BvbnNlLFxuICBIdHRwU3RhdHVzQ29kZSxcbn0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uL2h0dHAnO1xuaW1wb3J0IHtPYnNlcnZlcn0gZnJvbSAncnhqcyc7XG5cbi8qKlxuICogVHlwZSB0aGF0IGRlc2NyaWJlcyBvcHRpb25zIHRoYXQgY2FuIGJlIHVzZWQgdG8gY3JlYXRlIGFuIGVycm9yXG4gKiBpbiBgVGVzdFJlcXVlc3RgLlxuICovXG50eXBlIFRlc3RSZXF1ZXN0RXJyb3JPcHRpb25zID0ge1xuICBoZWFkZXJzPzogSHR0cEhlYWRlcnMgfCB7W25hbWU6IHN0cmluZ106IHN0cmluZyB8IHN0cmluZ1tdfTtcbiAgc3RhdHVzPzogbnVtYmVyO1xuICBzdGF0dXNUZXh0Pzogc3RyaW5nO1xufTtcblxuLyoqXG4gKiBBIG1vY2sgcmVxdWVzdHMgdGhhdCB3YXMgcmVjZWl2ZWQgYW5kIGlzIHJlYWR5IHRvIGJlIGFuc3dlcmVkLlxuICpcbiAqIFRoaXMgaW50ZXJmYWNlIGFsbG93cyBhY2Nlc3MgdG8gdGhlIHVuZGVybHlpbmcgYEh0dHBSZXF1ZXN0YCwgYW5kIGFsbG93c1xuICogcmVzcG9uZGluZyB3aXRoIGBIdHRwRXZlbnRgcyBvciBgSHR0cEVycm9yUmVzcG9uc2Vgcy5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBUZXN0UmVxdWVzdCB7XG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSByZXF1ZXN0IHdhcyBjYW5jZWxsZWQgYWZ0ZXIgaXQgd2FzIHNlbnQuXG4gICAqL1xuICBnZXQgY2FuY2VsbGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9jYW5jZWxsZWQ7XG4gIH1cblxuICAvKipcbiAgICogQGludGVybmFsIHNldCBieSBgSHR0cENsaWVudFRlc3RpbmdCYWNrZW5kYFxuICAgKi9cbiAgX2NhbmNlbGxlZCA9IGZhbHNlO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyByZXF1ZXN0OiBIdHRwUmVxdWVzdDxhbnk+LFxuICAgIHByaXZhdGUgb2JzZXJ2ZXI6IE9ic2VydmVyPEh0dHBFdmVudDxhbnk+PixcbiAgKSB7fVxuXG4gIC8qKlxuICAgKiBSZXNvbHZlIHRoZSByZXF1ZXN0IGJ5IHJldHVybmluZyBhIGJvZHkgcGx1cyBhZGRpdGlvbmFsIEhUVFAgaW5mb3JtYXRpb24gKHN1Y2ggYXMgcmVzcG9uc2VcbiAgICogaGVhZGVycykgaWYgcHJvdmlkZWQuXG4gICAqIElmIHRoZSByZXF1ZXN0IHNwZWNpZmllcyBhbiBleHBlY3RlZCBib2R5IHR5cGUsIHRoZSBib2R5IGlzIGNvbnZlcnRlZCBpbnRvIHRoZSByZXF1ZXN0ZWQgdHlwZS5cbiAgICogT3RoZXJ3aXNlLCB0aGUgYm9keSBpcyBjb252ZXJ0ZWQgdG8gYEpTT05gIGJ5IGRlZmF1bHQuXG4gICAqXG4gICAqIEJvdGggc3VjY2Vzc2Z1bCBhbmQgdW5zdWNjZXNzZnVsIHJlc3BvbnNlcyBjYW4gYmUgZGVsaXZlcmVkIHZpYSBgZmx1c2goKWAuXG4gICAqL1xuICBmbHVzaChcbiAgICBib2R5OlxuICAgICAgfCBBcnJheUJ1ZmZlclxuICAgICAgfCBCbG9iXG4gICAgICB8IGJvb2xlYW5cbiAgICAgIHwgc3RyaW5nXG4gICAgICB8IG51bWJlclxuICAgICAgfCBPYmplY3RcbiAgICAgIHwgKGJvb2xlYW4gfCBzdHJpbmcgfCBudW1iZXIgfCBPYmplY3QgfCBudWxsKVtdXG4gICAgICB8IG51bGwsXG4gICAgb3B0czoge1xuICAgICAgaGVhZGVycz86IEh0dHBIZWFkZXJzIHwge1tuYW1lOiBzdHJpbmddOiBzdHJpbmcgfCBzdHJpbmdbXX07XG4gICAgICBzdGF0dXM/OiBudW1iZXI7XG4gICAgICBzdGF0dXNUZXh0Pzogc3RyaW5nO1xuICAgIH0gPSB7fSxcbiAgKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuY2FuY2VsbGVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbm5vdCBmbHVzaCBhIGNhbmNlbGxlZCByZXF1ZXN0LmApO1xuICAgIH1cbiAgICBjb25zdCB1cmwgPSB0aGlzLnJlcXVlc3QudXJsV2l0aFBhcmFtcztcbiAgICBjb25zdCBoZWFkZXJzID1cbiAgICAgIG9wdHMuaGVhZGVycyBpbnN0YW5jZW9mIEh0dHBIZWFkZXJzID8gb3B0cy5oZWFkZXJzIDogbmV3IEh0dHBIZWFkZXJzKG9wdHMuaGVhZGVycyk7XG4gICAgYm9keSA9IF9tYXliZUNvbnZlcnRCb2R5KHRoaXMucmVxdWVzdC5yZXNwb25zZVR5cGUsIGJvZHkpO1xuICAgIGxldCBzdGF0dXNUZXh0OiBzdHJpbmcgfCB1bmRlZmluZWQgPSBvcHRzLnN0YXR1c1RleHQ7XG4gICAgbGV0IHN0YXR1czogbnVtYmVyID0gb3B0cy5zdGF0dXMgIT09IHVuZGVmaW5lZCA/IG9wdHMuc3RhdHVzIDogSHR0cFN0YXR1c0NvZGUuT2s7XG4gICAgaWYgKG9wdHMuc3RhdHVzID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmIChib2R5ID09PSBudWxsKSB7XG4gICAgICAgIHN0YXR1cyA9IEh0dHBTdGF0dXNDb2RlLk5vQ29udGVudDtcbiAgICAgICAgc3RhdHVzVGV4dCB8fD0gJ05vIENvbnRlbnQnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RhdHVzVGV4dCB8fD0gJ09LJztcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHN0YXR1c1RleHQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdzdGF0dXNUZXh0IGlzIHJlcXVpcmVkIHdoZW4gc2V0dGluZyBhIGN1c3RvbSBzdGF0dXMuJyk7XG4gICAgfVxuICAgIGlmIChzdGF0dXMgPj0gMjAwICYmIHN0YXR1cyA8IDMwMCkge1xuICAgICAgdGhpcy5vYnNlcnZlci5uZXh0KG5ldyBIdHRwUmVzcG9uc2U8YW55Pih7Ym9keSwgaGVhZGVycywgc3RhdHVzLCBzdGF0dXNUZXh0LCB1cmx9KSk7XG4gICAgICB0aGlzLm9ic2VydmVyLmNvbXBsZXRlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMub2JzZXJ2ZXIuZXJyb3IobmV3IEh0dHBFcnJvclJlc3BvbnNlKHtlcnJvcjogYm9keSwgaGVhZGVycywgc3RhdHVzLCBzdGF0dXNUZXh0LCB1cmx9KSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlc29sdmUgdGhlIHJlcXVlc3QgYnkgcmV0dXJuaW5nIGFuIGBFcnJvckV2ZW50YCAoZS5nLiBzaW11bGF0aW5nIGEgbmV0d29yayBmYWlsdXJlKS5cbiAgICogQGRlcHJlY2F0ZWQgSHR0cCByZXF1ZXN0cyBuZXZlciBlbWl0IGFuIGBFcnJvckV2ZW50YC4gUGxlYXNlIHNwZWNpZnkgYSBgUHJvZ3Jlc3NFdmVudGAuXG4gICAqL1xuICBlcnJvcihlcnJvcjogRXJyb3JFdmVudCwgb3B0cz86IFRlc3RSZXF1ZXN0RXJyb3JPcHRpb25zKTogdm9pZDtcbiAgLyoqXG4gICAqIFJlc29sdmUgdGhlIHJlcXVlc3QgYnkgcmV0dXJuaW5nIGFuIGBQcm9ncmVzc0V2ZW50YCAoZS5nLiBzaW11bGF0aW5nIGEgbmV0d29yayBmYWlsdXJlKS5cbiAgICovXG4gIGVycm9yKGVycm9yOiBQcm9ncmVzc0V2ZW50LCBvcHRzPzogVGVzdFJlcXVlc3RFcnJvck9wdGlvbnMpOiB2b2lkO1xuICBlcnJvcihlcnJvcjogUHJvZ3Jlc3NFdmVudCB8IEVycm9yRXZlbnQsIG9wdHM6IFRlc3RSZXF1ZXN0RXJyb3JPcHRpb25zID0ge30pOiB2b2lkIHtcbiAgICBpZiAodGhpcy5jYW5jZWxsZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ2Fubm90IHJldHVybiBhbiBlcnJvciBmb3IgYSBjYW5jZWxsZWQgcmVxdWVzdC5gKTtcbiAgICB9XG4gICAgaWYgKG9wdHMuc3RhdHVzICYmIG9wdHMuc3RhdHVzID49IDIwMCAmJiBvcHRzLnN0YXR1cyA8IDMwMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBlcnJvcigpIGNhbGxlZCB3aXRoIGEgc3VjY2Vzc2Z1bCBzdGF0dXMuYCk7XG4gICAgfVxuICAgIGNvbnN0IGhlYWRlcnMgPVxuICAgICAgb3B0cy5oZWFkZXJzIGluc3RhbmNlb2YgSHR0cEhlYWRlcnMgPyBvcHRzLmhlYWRlcnMgOiBuZXcgSHR0cEhlYWRlcnMob3B0cy5oZWFkZXJzKTtcbiAgICB0aGlzLm9ic2VydmVyLmVycm9yKFxuICAgICAgbmV3IEh0dHBFcnJvclJlc3BvbnNlKHtcbiAgICAgICAgZXJyb3IsXG4gICAgICAgIGhlYWRlcnMsXG4gICAgICAgIHN0YXR1czogb3B0cy5zdGF0dXMgfHwgMCxcbiAgICAgICAgc3RhdHVzVGV4dDogb3B0cy5zdGF0dXNUZXh0IHx8ICcnLFxuICAgICAgICB1cmw6IHRoaXMucmVxdWVzdC51cmxXaXRoUGFyYW1zLFxuICAgICAgfSksXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWxpdmVyIGFuIGFyYml0cmFyeSBgSHR0cEV2ZW50YCAoc3VjaCBhcyBhIHByb2dyZXNzIGV2ZW50KSBvbiB0aGUgcmVzcG9uc2Ugc3RyZWFtIGZvciB0aGlzXG4gICAqIHJlcXVlc3QuXG4gICAqL1xuICBldmVudChldmVudDogSHR0cEV2ZW50PGFueT4pOiB2b2lkIHtcbiAgICBpZiAodGhpcy5jYW5jZWxsZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ2Fubm90IHNlbmQgZXZlbnRzIHRvIGEgY2FuY2VsbGVkIHJlcXVlc3QuYCk7XG4gICAgfVxuICAgIHRoaXMub2JzZXJ2ZXIubmV4dChldmVudCk7XG4gIH1cbn1cblxuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdG8gY29udmVydCBhIHJlc3BvbnNlIGJvZHkgdG8gYW4gQXJyYXlCdWZmZXIuXG4gKi9cbmZ1bmN0aW9uIF90b0FycmF5QnVmZmVyQm9keShcbiAgYm9keTogQXJyYXlCdWZmZXIgfCBCbG9iIHwgc3RyaW5nIHwgbnVtYmVyIHwgT2JqZWN0IHwgKHN0cmluZyB8IG51bWJlciB8IE9iamVjdCB8IG51bGwpW10sXG4pOiBBcnJheUJ1ZmZlciB7XG4gIGlmICh0eXBlb2YgQXJyYXlCdWZmZXIgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdBcnJheUJ1ZmZlciByZXNwb25zZXMgYXJlIG5vdCBzdXBwb3J0ZWQgb24gdGhpcyBwbGF0Zm9ybS4nKTtcbiAgfVxuICBpZiAoYm9keSBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKSB7XG4gICAgcmV0dXJuIGJvZHk7XG4gIH1cbiAgdGhyb3cgbmV3IEVycm9yKCdBdXRvbWF0aWMgY29udmVyc2lvbiB0byBBcnJheUJ1ZmZlciBpcyBub3Qgc3VwcG9ydGVkIGZvciByZXNwb25zZSB0eXBlLicpO1xufVxuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0byBjb252ZXJ0IGEgcmVzcG9uc2UgYm9keSB0byBhIEJsb2IuXG4gKi9cbmZ1bmN0aW9uIF90b0Jsb2IoXG4gIGJvZHk6IEFycmF5QnVmZmVyIHwgQmxvYiB8IHN0cmluZyB8IG51bWJlciB8IE9iamVjdCB8IChzdHJpbmcgfCBudW1iZXIgfCBPYmplY3QgfCBudWxsKVtdLFxuKTogQmxvYiB7XG4gIGlmICh0eXBlb2YgQmxvYiA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0Jsb2IgcmVzcG9uc2VzIGFyZSBub3Qgc3VwcG9ydGVkIG9uIHRoaXMgcGxhdGZvcm0uJyk7XG4gIH1cbiAgaWYgKGJvZHkgaW5zdGFuY2VvZiBCbG9iKSB7XG4gICAgcmV0dXJuIGJvZHk7XG4gIH1cbiAgaWYgKEFycmF5QnVmZmVyICYmIGJvZHkgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikge1xuICAgIHJldHVybiBuZXcgQmxvYihbYm9keV0pO1xuICB9XG4gIHRocm93IG5ldyBFcnJvcignQXV0b21hdGljIGNvbnZlcnNpb24gdG8gQmxvYiBpcyBub3Qgc3VwcG9ydGVkIGZvciByZXNwb25zZSB0eXBlLicpO1xufVxuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0byBjb252ZXJ0IGEgcmVzcG9uc2UgYm9keSB0byBKU09OIGRhdGEuXG4gKi9cbmZ1bmN0aW9uIF90b0pzb25Cb2R5KFxuICBib2R5OlxuICAgIHwgQXJyYXlCdWZmZXJcbiAgICB8IEJsb2JcbiAgICB8IGJvb2xlYW5cbiAgICB8IHN0cmluZ1xuICAgIHwgbnVtYmVyXG4gICAgfCBPYmplY3RcbiAgICB8IChib29sZWFuIHwgc3RyaW5nIHwgbnVtYmVyIHwgT2JqZWN0IHwgbnVsbClbXSxcbiAgZm9ybWF0OiBzdHJpbmcgPSAnSlNPTicsXG4pOiBPYmplY3QgfCBzdHJpbmcgfCBudW1iZXIgfCAoT2JqZWN0IHwgc3RyaW5nIHwgbnVtYmVyKVtdIHtcbiAgaWYgKHR5cGVvZiBBcnJheUJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcgJiYgYm9keSBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBBdXRvbWF0aWMgY29udmVyc2lvbiB0byAke2Zvcm1hdH0gaXMgbm90IHN1cHBvcnRlZCBmb3IgQXJyYXlCdWZmZXJzLmApO1xuICB9XG4gIGlmICh0eXBlb2YgQmxvYiAhPT0gJ3VuZGVmaW5lZCcgJiYgYm9keSBpbnN0YW5jZW9mIEJsb2IpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEF1dG9tYXRpYyBjb252ZXJzaW9uIHRvICR7Zm9ybWF0fSBpcyBub3Qgc3VwcG9ydGVkIGZvciBCbG9icy5gKTtcbiAgfVxuICBpZiAoXG4gICAgdHlwZW9mIGJvZHkgPT09ICdzdHJpbmcnIHx8XG4gICAgdHlwZW9mIGJvZHkgPT09ICdudW1iZXInIHx8XG4gICAgdHlwZW9mIGJvZHkgPT09ICdvYmplY3QnIHx8XG4gICAgdHlwZW9mIGJvZHkgPT09ICdib29sZWFuJyB8fFxuICAgIEFycmF5LmlzQXJyYXkoYm9keSlcbiAgKSB7XG4gICAgcmV0dXJuIGJvZHk7XG4gIH1cbiAgdGhyb3cgbmV3IEVycm9yKGBBdXRvbWF0aWMgY29udmVyc2lvbiB0byAke2Zvcm1hdH0gaXMgbm90IHN1cHBvcnRlZCBmb3IgcmVzcG9uc2UgdHlwZS5gKTtcbn1cblxuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdG8gY29udmVydCBhIHJlc3BvbnNlIGJvZHkgdG8gYSBzdHJpbmcuXG4gKi9cbmZ1bmN0aW9uIF90b1RleHRCb2R5KFxuICBib2R5OiBBcnJheUJ1ZmZlciB8IEJsb2IgfCBzdHJpbmcgfCBudW1iZXIgfCBPYmplY3QgfCAoc3RyaW5nIHwgbnVtYmVyIHwgT2JqZWN0IHwgbnVsbClbXSxcbik6IHN0cmluZyB7XG4gIGlmICh0eXBlb2YgYm9keSA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gYm9keTtcbiAgfVxuICBpZiAodHlwZW9mIEFycmF5QnVmZmVyICE9PSAndW5kZWZpbmVkJyAmJiBib2R5IGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0F1dG9tYXRpYyBjb252ZXJzaW9uIHRvIHRleHQgaXMgbm90IHN1cHBvcnRlZCBmb3IgQXJyYXlCdWZmZXJzLicpO1xuICB9XG4gIGlmICh0eXBlb2YgQmxvYiAhPT0gJ3VuZGVmaW5lZCcgJiYgYm9keSBpbnN0YW5jZW9mIEJsb2IpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0F1dG9tYXRpYyBjb252ZXJzaW9uIHRvIHRleHQgaXMgbm90IHN1cHBvcnRlZCBmb3IgQmxvYnMuJyk7XG4gIH1cbiAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KF90b0pzb25Cb2R5KGJvZHksICd0ZXh0JykpO1xufVxuXG4vKipcbiAqIENvbnZlcnQgYSByZXNwb25zZSBib2R5IHRvIHRoZSByZXF1ZXN0ZWQgdHlwZS5cbiAqL1xuZnVuY3Rpb24gX21heWJlQ29udmVydEJvZHkoXG4gIHJlc3BvbnNlVHlwZTogc3RyaW5nLFxuICBib2R5OiBBcnJheUJ1ZmZlciB8IEJsb2IgfCBzdHJpbmcgfCBudW1iZXIgfCBPYmplY3QgfCAoc3RyaW5nIHwgbnVtYmVyIHwgT2JqZWN0IHwgbnVsbClbXSB8IG51bGwsXG4pOiBBcnJheUJ1ZmZlciB8IEJsb2IgfCBzdHJpbmcgfCBudW1iZXIgfCBPYmplY3QgfCAoc3RyaW5nIHwgbnVtYmVyIHwgT2JqZWN0IHwgbnVsbClbXSB8IG51bGwge1xuICBpZiAoYm9keSA9PT0gbnVsbCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHN3aXRjaCAocmVzcG9uc2VUeXBlKSB7XG4gICAgY2FzZSAnYXJyYXlidWZmZXInOlxuICAgICAgcmV0dXJuIF90b0FycmF5QnVmZmVyQm9keShib2R5KTtcbiAgICBjYXNlICdibG9iJzpcbiAgICAgIHJldHVybiBfdG9CbG9iKGJvZHkpO1xuICAgIGNhc2UgJ2pzb24nOlxuICAgICAgcmV0dXJuIF90b0pzb25Cb2R5KGJvZHkpO1xuICAgIGNhc2UgJ3RleHQnOlxuICAgICAgcmV0dXJuIF90b1RleHRCb2R5KGJvZHkpO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuc3VwcG9ydGVkIHJlc3BvbnNlVHlwZTogJHtyZXNwb25zZVR5cGV9YCk7XG4gIH1cbn1cbiJdfQ==