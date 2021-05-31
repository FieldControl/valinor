/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { HttpContext } from './context';
import { HttpHeaders } from './headers';
import { HttpParams } from './params';
/**
 * Determine whether the given HTTP method may include a body.
 */
function mightHaveBody(method) {
    switch (method) {
        case 'DELETE':
        case 'GET':
        case 'HEAD':
        case 'OPTIONS':
        case 'JSONP':
            return false;
        default:
            return true;
    }
}
/**
 * Safely assert whether the given value is an ArrayBuffer.
 *
 * In some execution environments ArrayBuffer is not defined.
 */
function isArrayBuffer(value) {
    return typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer;
}
/**
 * Safely assert whether the given value is a Blob.
 *
 * In some execution environments Blob is not defined.
 */
function isBlob(value) {
    return typeof Blob !== 'undefined' && value instanceof Blob;
}
/**
 * Safely assert whether the given value is a FormData instance.
 *
 * In some execution environments FormData is not defined.
 */
function isFormData(value) {
    return typeof FormData !== 'undefined' && value instanceof FormData;
}
/**
 * An outgoing HTTP request with an optional typed body.
 *
 * `HttpRequest` represents an outgoing request, including URL, method,
 * headers, body, and other request configuration options. Instances should be
 * assumed to be immutable. To modify a `HttpRequest`, the `clone`
 * method should be used.
 *
 * @publicApi
 */
export class HttpRequest {
    constructor(method, url, third, fourth) {
        this.url = url;
        /**
         * The request body, or `null` if one isn't set.
         *
         * Bodies are not enforced to be immutable, as they can include a reference to any
         * user-defined data type. However, interceptors should take care to preserve
         * idempotence by treating them as such.
         */
        this.body = null;
        /**
         * Whether this request should be made in a way that exposes progress events.
         *
         * Progress events are expensive (change detection runs on each event) and so
         * they should only be requested if the consumer intends to monitor them.
         */
        this.reportProgress = false;
        /**
         * Whether this request should be sent with outgoing credentials (cookies).
         */
        this.withCredentials = false;
        /**
         * The expected response type of the server.
         *
         * This is used to parse the response appropriately before returning it to
         * the requestee.
         */
        this.responseType = 'json';
        this.method = method.toUpperCase();
        // Next, need to figure out which argument holds the HttpRequestInit
        // options, if any.
        let options;
        // Check whether a body argument is expected. The only valid way to omit
        // the body argument is to use a known no-body method like GET.
        if (mightHaveBody(this.method) || !!fourth) {
            // Body is the third argument, options are the fourth.
            this.body = (third !== undefined) ? third : null;
            options = fourth;
        }
        else {
            // No body required, options are the third argument. The body stays null.
            options = third;
        }
        // If options have been passed, interpret them.
        if (options) {
            // Normalize reportProgress and withCredentials.
            this.reportProgress = !!options.reportProgress;
            this.withCredentials = !!options.withCredentials;
            // Override default response type of 'json' if one is provided.
            if (!!options.responseType) {
                this.responseType = options.responseType;
            }
            // Override headers if they're provided.
            if (!!options.headers) {
                this.headers = options.headers;
            }
            if (!!options.context) {
                this.context = options.context;
            }
            if (!!options.params) {
                this.params = options.params;
            }
        }
        // If no headers have been passed in, construct a new HttpHeaders instance.
        if (!this.headers) {
            this.headers = new HttpHeaders();
        }
        // If no context have been passed in, construct a new HttpContext instance.
        if (!this.context) {
            this.context = new HttpContext();
        }
        // If no parameters have been passed in, construct a new HttpUrlEncodedParams instance.
        if (!this.params) {
            this.params = new HttpParams();
            this.urlWithParams = url;
        }
        else {
            // Encode the parameters to a string in preparation for inclusion in the URL.
            const params = this.params.toString();
            if (params.length === 0) {
                // No parameters, the visible URL is just the URL given at creation time.
                this.urlWithParams = url;
            }
            else {
                // Does the URL already have query parameters? Look for '?'.
                const qIdx = url.indexOf('?');
                // There are 3 cases to handle:
                // 1) No existing parameters -> append '?' followed by params.
                // 2) '?' exists and is followed by existing query string ->
                //    append '&' followed by params.
                // 3) '?' exists at the end of the url -> append params directly.
                // This basically amounts to determining the character, if any, with
                // which to join the URL and parameters.
                const sep = qIdx === -1 ? '?' : (qIdx < url.length - 1 ? '&' : '');
                this.urlWithParams = url + sep + params;
            }
        }
    }
    /**
     * Transform the free-form body into a serialized format suitable for
     * transmission to the server.
     */
    serializeBody() {
        // If no body is present, no need to serialize it.
        if (this.body === null) {
            return null;
        }
        // Check whether the body is already in a serialized form. If so,
        // it can just be returned directly.
        if (isArrayBuffer(this.body) || isBlob(this.body) || isFormData(this.body) ||
            typeof this.body === 'string') {
            return this.body;
        }
        // Check whether the body is an instance of HttpUrlEncodedParams.
        if (this.body instanceof HttpParams) {
            return this.body.toString();
        }
        // Check whether the body is an object or array, and serialize with JSON if so.
        if (typeof this.body === 'object' || typeof this.body === 'boolean' ||
            Array.isArray(this.body)) {
            return JSON.stringify(this.body);
        }
        // Fall back on toString() for everything else.
        return this.body.toString();
    }
    /**
     * Examine the body and attempt to infer an appropriate MIME type
     * for it.
     *
     * If no such type can be inferred, this method will return `null`.
     */
    detectContentTypeHeader() {
        // An empty body has no content type.
        if (this.body === null) {
            return null;
        }
        // FormData bodies rely on the browser's content type assignment.
        if (isFormData(this.body)) {
            return null;
        }
        // Blobs usually have their own content type. If it doesn't, then
        // no type can be inferred.
        if (isBlob(this.body)) {
            return this.body.type || null;
        }
        // Array buffers have unknown contents and thus no type can be inferred.
        if (isArrayBuffer(this.body)) {
            return null;
        }
        // Technically, strings could be a form of JSON data, but it's safe enough
        // to assume they're plain strings.
        if (typeof this.body === 'string') {
            return 'text/plain';
        }
        // `HttpUrlEncodedParams` has its own content-type.
        if (this.body instanceof HttpParams) {
            return 'application/x-www-form-urlencoded;charset=UTF-8';
        }
        // Arrays, objects, boolean and numbers will be encoded as JSON.
        if (typeof this.body === 'object' || typeof this.body === 'number' ||
            typeof this.body === 'boolean') {
            return 'application/json';
        }
        // No type could be inferred.
        return null;
    }
    clone(update = {}) {
        var _a;
        // For method, url, and responseType, take the current value unless
        // it is overridden in the update hash.
        const method = update.method || this.method;
        const url = update.url || this.url;
        const responseType = update.responseType || this.responseType;
        // The body is somewhat special - a `null` value in update.body means
        // whatever current body is present is being overridden with an empty
        // body, whereas an `undefined` value in update.body implies no
        // override.
        const body = (update.body !== undefined) ? update.body : this.body;
        // Carefully handle the boolean options to differentiate between
        // `false` and `undefined` in the update args.
        const withCredentials = (update.withCredentials !== undefined) ? update.withCredentials : this.withCredentials;
        const reportProgress = (update.reportProgress !== undefined) ? update.reportProgress : this.reportProgress;
        // Headers and params may be appended to if `setHeaders` or
        // `setParams` are used.
        let headers = update.headers || this.headers;
        let params = update.params || this.params;
        // Pass on context if needed
        const context = (_a = update.context) !== null && _a !== void 0 ? _a : this.context;
        // Check whether the caller has asked to add headers.
        if (update.setHeaders !== undefined) {
            // Set every requested header.
            headers =
                Object.keys(update.setHeaders)
                    .reduce((headers, name) => headers.set(name, update.setHeaders[name]), headers);
        }
        // Check whether the caller has asked to set params.
        if (update.setParams) {
            // Set every requested param.
            params = Object.keys(update.setParams)
                .reduce((params, param) => params.set(param, update.setParams[param]), params);
        }
        // Finally, construct the new HttpRequest using the pieces from above.
        return new HttpRequest(method, url, body, {
            params,
            headers,
            context,
            reportProgress,
            responseType,
            withCredentials,
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVxdWVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9odHRwL3NyYy9yZXF1ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxXQUFXLENBQUM7QUFDdEMsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUN0QyxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sVUFBVSxDQUFDO0FBaUJwQzs7R0FFRztBQUNILFNBQVMsYUFBYSxDQUFDLE1BQWM7SUFDbkMsUUFBUSxNQUFNLEVBQUU7UUFDZCxLQUFLLFFBQVEsQ0FBQztRQUNkLEtBQUssS0FBSyxDQUFDO1FBQ1gsS0FBSyxNQUFNLENBQUM7UUFDWixLQUFLLFNBQVMsQ0FBQztRQUNmLEtBQUssT0FBTztZQUNWLE9BQU8sS0FBSyxDQUFDO1FBQ2Y7WUFDRSxPQUFPLElBQUksQ0FBQztLQUNmO0FBQ0gsQ0FBQztBQUVEOzs7O0dBSUc7QUFDSCxTQUFTLGFBQWEsQ0FBQyxLQUFVO0lBQy9CLE9BQU8sT0FBTyxXQUFXLEtBQUssV0FBVyxJQUFJLEtBQUssWUFBWSxXQUFXLENBQUM7QUFDNUUsQ0FBQztBQUVEOzs7O0dBSUc7QUFDSCxTQUFTLE1BQU0sQ0FBQyxLQUFVO0lBQ3hCLE9BQU8sT0FBTyxJQUFJLEtBQUssV0FBVyxJQUFJLEtBQUssWUFBWSxJQUFJLENBQUM7QUFDOUQsQ0FBQztBQUVEOzs7O0dBSUc7QUFDSCxTQUFTLFVBQVUsQ0FBQyxLQUFVO0lBQzVCLE9BQU8sT0FBTyxRQUFRLEtBQUssV0FBVyxJQUFJLEtBQUssWUFBWSxRQUFRLENBQUM7QUFDdEUsQ0FBQztBQUVEOzs7Ozs7Ozs7R0FTRztBQUNILE1BQU0sT0FBTyxXQUFXO0lBeUZ0QixZQUNJLE1BQWMsRUFBVyxHQUFXLEVBQUUsS0FPaEMsRUFDTixNQU9DO1FBZndC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OUIsT0FBTztnQkFDSCxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUM7cUJBQ3pCLE1BQU0sQ0FBQyxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxVQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztTQUMxRjtRQUVELG9EQUFvRDtRQUNwRCxJQUFJLE1BQU0sQ0FBQyxTQUFTLEVBQUU7WUFDcEIsNkJBQTZCO1lBQzdCLE1BQU0sR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUM7aUJBQ3hCLE1BQU0sQ0FBQyxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxTQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztTQUM5RjtRQUVELHNFQUFzRTtRQUN0RSxPQUFPLElBQUksV0FBVyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFO1lBQ3hDLE1BQU07WUFDTixPQUFPO1lBQ1AsT0FBTztZQUNQLGNBQWM7WUFDZCxZQUFZO1lBQ1osZUFBZTtTQUNoQixDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtIdHRwQ29udGV4dH0gZnJvbSAnLi9jb250ZXh0JztcbmltcG9ydCB7SHR0cEhlYWRlcnN9IGZyb20gJy4vaGVhZGVycyc7XG5pbXBvcnQge0h0dHBQYXJhbXN9IGZyb20gJy4vcGFyYW1zJztcblxuXG4vKipcbiAqIENvbnN0cnVjdGlvbiBpbnRlcmZhY2UgZm9yIGBIdHRwUmVxdWVzdGBzLlxuICpcbiAqIEFsbCB2YWx1ZXMgYXJlIG9wdGlvbmFsIGFuZCB3aWxsIG92ZXJyaWRlIGRlZmF1bHQgdmFsdWVzIGlmIHByb3ZpZGVkLlxuICovXG5pbnRlcmZhY2UgSHR0cFJlcXVlc3RJbml0IHtcbiAgaGVhZGVycz86IEh0dHBIZWFkZXJzO1xuICBjb250ZXh0PzogSHR0cENvbnRleHQ7XG4gIHJlcG9ydFByb2dyZXNzPzogYm9vbGVhbjtcbiAgcGFyYW1zPzogSHR0cFBhcmFtcztcbiAgcmVzcG9uc2VUeXBlPzogJ2FycmF5YnVmZmVyJ3wnYmxvYid8J2pzb24nfCd0ZXh0JztcbiAgd2l0aENyZWRlbnRpYWxzPzogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgd2hldGhlciB0aGUgZ2l2ZW4gSFRUUCBtZXRob2QgbWF5IGluY2x1ZGUgYSBib2R5LlxuICovXG5mdW5jdGlvbiBtaWdodEhhdmVCb2R5KG1ldGhvZDogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHN3aXRjaCAobWV0aG9kKSB7XG4gICAgY2FzZSAnREVMRVRFJzpcbiAgICBjYXNlICdHRVQnOlxuICAgIGNhc2UgJ0hFQUQnOlxuICAgIGNhc2UgJ09QVElPTlMnOlxuICAgIGNhc2UgJ0pTT05QJzpcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIHRydWU7XG4gIH1cbn1cblxuLyoqXG4gKiBTYWZlbHkgYXNzZXJ0IHdoZXRoZXIgdGhlIGdpdmVuIHZhbHVlIGlzIGFuIEFycmF5QnVmZmVyLlxuICpcbiAqIEluIHNvbWUgZXhlY3V0aW9uIGVudmlyb25tZW50cyBBcnJheUJ1ZmZlciBpcyBub3QgZGVmaW5lZC5cbiAqL1xuZnVuY3Rpb24gaXNBcnJheUJ1ZmZlcih2YWx1ZTogYW55KTogdmFsdWUgaXMgQXJyYXlCdWZmZXIge1xuICByZXR1cm4gdHlwZW9mIEFycmF5QnVmZmVyICE9PSAndW5kZWZpbmVkJyAmJiB2YWx1ZSBpbnN0YW5jZW9mIEFycmF5QnVmZmVyO1xufVxuXG4vKipcbiAqIFNhZmVseSBhc3NlcnQgd2hldGhlciB0aGUgZ2l2ZW4gdmFsdWUgaXMgYSBCbG9iLlxuICpcbiAqIEluIHNvbWUgZXhlY3V0aW9uIGVudmlyb25tZW50cyBCbG9iIGlzIG5vdCBkZWZpbmVkLlxuICovXG5mdW5jdGlvbiBpc0Jsb2IodmFsdWU6IGFueSk6IHZhbHVlIGlzIEJsb2Ige1xuICByZXR1cm4gdHlwZW9mIEJsb2IgIT09ICd1bmRlZmluZWQnICYmIHZhbHVlIGluc3RhbmNlb2YgQmxvYjtcbn1cblxuLyoqXG4gKiBTYWZlbHkgYXNzZXJ0IHdoZXRoZXIgdGhlIGdpdmVuIHZhbHVlIGlzIGEgRm9ybURhdGEgaW5zdGFuY2UuXG4gKlxuICogSW4gc29tZSBleGVjdXRpb24gZW52aXJvbm1lbnRzIEZvcm1EYXRhIGlzIG5vdCBkZWZpbmVkLlxuICovXG5mdW5jdGlvbiBpc0Zvcm1EYXRhKHZhbHVlOiBhbnkpOiB2YWx1ZSBpcyBGb3JtRGF0YSB7XG4gIHJldHVybiB0eXBlb2YgRm9ybURhdGEgIT09ICd1bmRlZmluZWQnICYmIHZhbHVlIGluc3RhbmNlb2YgRm9ybURhdGE7XG59XG5cbi8qKlxuICogQW4gb3V0Z29pbmcgSFRUUCByZXF1ZXN0IHdpdGggYW4gb3B0aW9uYWwgdHlwZWQgYm9keS5cbiAqXG4gKiBgSHR0cFJlcXVlc3RgIHJlcHJlc2VudHMgYW4gb3V0Z29pbmcgcmVxdWVzdCwgaW5jbHVkaW5nIFVSTCwgbWV0aG9kLFxuICogaGVhZGVycywgYm9keSwgYW5kIG90aGVyIHJlcXVlc3QgY29uZmlndXJhdGlvbiBvcHRpb25zLiBJbnN0YW5jZXMgc2hvdWxkIGJlXG4gKiBhc3N1bWVkIHRvIGJlIGltbXV0YWJsZS4gVG8gbW9kaWZ5IGEgYEh0dHBSZXF1ZXN0YCwgdGhlIGBjbG9uZWBcbiAqIG1ldGhvZCBzaG91bGQgYmUgdXNlZC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBIdHRwUmVxdWVzdDxUPiB7XG4gIC8qKlxuICAgKiBUaGUgcmVxdWVzdCBib2R5LCBvciBgbnVsbGAgaWYgb25lIGlzbid0IHNldC5cbiAgICpcbiAgICogQm9kaWVzIGFyZSBub3QgZW5mb3JjZWQgdG8gYmUgaW1tdXRhYmxlLCBhcyB0aGV5IGNhbiBpbmNsdWRlIGEgcmVmZXJlbmNlIHRvIGFueVxuICAgKiB1c2VyLWRlZmluZWQgZGF0YSB0eXBlLiBIb3dldmVyLCBpbnRlcmNlcHRvcnMgc2hvdWxkIHRha2UgY2FyZSB0byBwcmVzZXJ2ZVxuICAgKiBpZGVtcG90ZW5jZSBieSB0cmVhdGluZyB0aGVtIGFzIHN1Y2guXG4gICAqL1xuICByZWFkb25seSBib2R5OiBUfG51bGwgPSBudWxsO1xuXG4gIC8qKlxuICAgKiBPdXRnb2luZyBoZWFkZXJzIGZvciB0aGlzIHJlcXVlc3QuXG4gICAqL1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcmVhZG9ubHkgaGVhZGVycyE6IEh0dHBIZWFkZXJzO1xuXG4gIC8qKlxuICAgKiBTaGFyZWQgYW5kIG11dGFibGUgY29udGV4dCB0aGF0IGNhbiBiZSB1c2VkIGJ5IGludGVyY2VwdG9yc1xuICAgKi9cbiAgcmVhZG9ubHkgY29udGV4dCE6IEh0dHBDb250ZXh0O1xuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoaXMgcmVxdWVzdCBzaG91bGQgYmUgbWFkZSBpbiBhIHdheSB0aGF0IGV4cG9zZXMgcHJvZ3Jlc3MgZXZlbnRzLlxuICAgKlxuICAgKiBQcm9ncmVzcyBldmVudHMgYXJlIGV4cGVuc2l2ZSAoY2hhbmdlIGRldGVjdGlvbiBydW5zIG9uIGVhY2ggZXZlbnQpIGFuZCBzb1xuICAgKiB0aGV5IHNob3VsZCBvbmx5IGJlIHJlcXVlc3RlZCBpZiB0aGUgY29uc3VtZXIgaW50ZW5kcyB0byBtb25pdG9yIHRoZW0uXG4gICAqL1xuICByZWFkb25seSByZXBvcnRQcm9ncmVzczogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoaXMgcmVxdWVzdCBzaG91bGQgYmUgc2VudCB3aXRoIG91dGdvaW5nIGNyZWRlbnRpYWxzIChjb29raWVzKS5cbiAgICovXG4gIHJlYWRvbmx5IHdpdGhDcmVkZW50aWFsczogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBUaGUgZXhwZWN0ZWQgcmVzcG9uc2UgdHlwZSBvZiB0aGUgc2VydmVyLlxuICAgKlxuICAgKiBUaGlzIGlzIHVzZWQgdG8gcGFyc2UgdGhlIHJlc3BvbnNlIGFwcHJvcHJpYXRlbHkgYmVmb3JlIHJldHVybmluZyBpdCB0b1xuICAgKiB0aGUgcmVxdWVzdGVlLlxuICAgKi9cbiAgcmVhZG9ubHkgcmVzcG9uc2VUeXBlOiAnYXJyYXlidWZmZXInfCdibG9iJ3wnanNvbid8J3RleHQnID0gJ2pzb24nO1xuXG4gIC8qKlxuICAgKiBUaGUgb3V0Z29pbmcgSFRUUCByZXF1ZXN0IG1ldGhvZC5cbiAgICovXG4gIHJlYWRvbmx5IG1ldGhvZDogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBPdXRnb2luZyBVUkwgcGFyYW1ldGVycy5cbiAgICpcbiAgICogVG8gcGFzcyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBIVFRQIHBhcmFtZXRlcnMgaW4gdGhlIFVSTC1xdWVyeS1zdHJpbmcgZm9ybWF0LFxuICAgKiB0aGUgYEh0dHBQYXJhbXNPcHRpb25zYCcgYGZyb21TdHJpbmdgIG1heSBiZSB1c2VkLiBGb3IgZXhhbXBsZTpcbiAgICpcbiAgICogYGBgXG4gICAqIG5ldyBIdHRwUGFyYW1zKHtmcm9tU3RyaW5nOiAnYW5ndWxhcj1hd2Vzb21lJ30pXG4gICAqIGBgYFxuICAgKi9cbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHJlYWRvbmx5IHBhcmFtcyE6IEh0dHBQYXJhbXM7XG5cbiAgLyoqXG4gICAqIFRoZSBvdXRnb2luZyBVUkwgd2l0aCBhbGwgVVJMIHBhcmFtZXRlcnMgc2V0LlxuICAgKi9cbiAgcmVhZG9ubHkgdXJsV2l0aFBhcmFtczogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKG1ldGhvZDogJ0RFTEVURSd8J0dFVCd8J0hFQUQnfCdKU09OUCd8J09QVElPTlMnLCB1cmw6IHN0cmluZywgaW5pdD86IHtcbiAgICBoZWFkZXJzPzogSHR0cEhlYWRlcnMsXG4gICAgY29udGV4dD86IEh0dHBDb250ZXh0LFxuICAgIHJlcG9ydFByb2dyZXNzPzogYm9vbGVhbixcbiAgICBwYXJhbXM/OiBIdHRwUGFyYW1zLFxuICAgIHJlc3BvbnNlVHlwZT86ICdhcnJheWJ1ZmZlcid8J2Jsb2InfCdqc29uJ3wndGV4dCcsXG4gICAgd2l0aENyZWRlbnRpYWxzPzogYm9vbGVhbixcbiAgfSk7XG4gIGNvbnN0cnVjdG9yKG1ldGhvZDogJ1BPU1QnfCdQVVQnfCdQQVRDSCcsIHVybDogc3RyaW5nLCBib2R5OiBUfG51bGwsIGluaXQ/OiB7XG4gICAgaGVhZGVycz86IEh0dHBIZWFkZXJzLFxuICAgIGNvbnRleHQ/OiBIdHRwQ29udGV4dCxcbiAgICByZXBvcnRQcm9ncmVzcz86IGJvb2xlYW4sXG4gICAgcGFyYW1zPzogSHR0cFBhcmFtcyxcbiAgICByZXNwb25zZVR5cGU/OiAnYXJyYXlidWZmZXInfCdibG9iJ3wnanNvbid8J3RleHQnLFxuICAgIHdpdGhDcmVkZW50aWFscz86IGJvb2xlYW4sXG4gIH0pO1xuICBjb25zdHJ1Y3RvcihtZXRob2Q6IHN0cmluZywgdXJsOiBzdHJpbmcsIGJvZHk6IFR8bnVsbCwgaW5pdD86IHtcbiAgICBoZWFkZXJzPzogSHR0cEhlYWRlcnMsXG4gICAgY29udGV4dD86IEh0dHBDb250ZXh0LFxuICAgIHJlcG9ydFByb2dyZXNzPzogYm9vbGVhbixcbiAgICBwYXJhbXM/OiBIdHRwUGFyYW1zLFxuICAgIHJlc3BvbnNlVHlwZT86ICdhcnJheWJ1ZmZlcid8J2Jsb2InfCdqc29uJ3wndGV4dCcsXG4gICAgd2l0aENyZWRlbnRpYWxzPzogYm9vbGVhbixcbiAgfSk7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgbWV0aG9kOiBzdHJpbmcsIHJlYWRvbmx5IHVybDogc3RyaW5nLCB0aGlyZD86IFR8e1xuICAgICAgICBoZWFkZXJzPzogSHR0cEhlYWRlcnMsXG4gICAgICAgIGNvbnRleHQ/OiBIdHRwQ29udGV4dCxcbiAgICAgICAgcmVwb3J0UHJvZ3Jlc3M/OiBib29sZWFuLFxuICAgICAgICBwYXJhbXM/OiBIdHRwUGFyYW1zLFxuICAgICAgICByZXNwb25zZVR5cGU/OiAnYXJyYXlidWZmZXInfCdibG9iJ3wnanNvbid8J3RleHQnLFxuICAgICAgICB3aXRoQ3JlZGVudGlhbHM/OiBib29sZWFuLFxuICAgICAgfXxudWxsLFxuICAgICAgZm91cnRoPzoge1xuICAgICAgICBoZWFkZXJzPzogSHR0cEhlYWRlcnMsXG4gICAgICAgIGNvbnRleHQ/OiBIdHRwQ29udGV4dCxcbiAgICAgICAgcmVwb3J0UHJvZ3Jlc3M/OiBib29sZWFuLFxuICAgICAgICBwYXJhbXM/OiBIdHRwUGFyYW1zLFxuICAgICAgICByZXNwb25zZVR5cGU/OiAnYXJyYXlidWZmZXInfCdibG9iJ3wnanNvbid8J3RleHQnLFxuICAgICAgICB3aXRoQ3JlZGVudGlhbHM/OiBib29sZWFuLFxuICAgICAgfSkge1xuICAgIHRoaXMubWV0aG9kID0gbWV0aG9kLnRvVXBwZXJDYXNlKCk7XG4gICAgLy8gTmV4dCwgbmVlZCB0byBmaWd1cmUgb3V0IHdoaWNoIGFyZ3VtZW50IGhvbGRzIHRoZSBIdHRwUmVxdWVzdEluaXRcbiAgICAvLyBvcHRpb25zLCBpZiBhbnkuXG4gICAgbGV0IG9wdGlvbnM6IEh0dHBSZXF1ZXN0SW5pdHx1bmRlZmluZWQ7XG5cbiAgICAvLyBDaGVjayB3aGV0aGVyIGEgYm9keSBhcmd1bWVudCBpcyBleHBlY3RlZC4gVGhlIG9ubHkgdmFsaWQgd2F5IHRvIG9taXRcbiAgICAvLyB0aGUgYm9keSBhcmd1bWVudCBpcyB0byB1c2UgYSBrbm93biBuby1ib2R5IG1ldGhvZCBsaWtlIEdFVC5cbiAgICBpZiAobWlnaHRIYXZlQm9keSh0aGlzLm1ldGhvZCkgfHwgISFmb3VydGgpIHtcbiAgICAgIC8vIEJvZHkgaXMgdGhlIHRoaXJkIGFyZ3VtZW50LCBvcHRpb25zIGFyZSB0aGUgZm91cnRoLlxuICAgICAgdGhpcy5ib2R5ID0gKHRoaXJkICE9PSB1bmRlZmluZWQpID8gdGhpcmQgYXMgVCA6IG51bGw7XG4gICAgICBvcHRpb25zID0gZm91cnRoO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBObyBib2R5IHJlcXVpcmVkLCBvcHRpb25zIGFyZSB0aGUgdGhpcmQgYXJndW1lbnQuIFRoZSBib2R5IHN0YXlzIG51bGwuXG4gICAgICBvcHRpb25zID0gdGhpcmQgYXMgSHR0cFJlcXVlc3RJbml0O1xuICAgIH1cblxuICAgIC8vIElmIG9wdGlvbnMgaGF2ZSBiZWVuIHBhc3NlZCwgaW50ZXJwcmV0IHRoZW0uXG4gICAgaWYgKG9wdGlvbnMpIHtcbiAgICAgIC8vIE5vcm1hbGl6ZSByZXBvcnRQcm9ncmVzcyBhbmQgd2l0aENyZWRlbnRpYWxzLlxuICAgICAgdGhpcy5yZXBvcnRQcm9ncmVzcyA9ICEhb3B0aW9ucy5yZXBvcnRQcm9ncmVzcztcbiAgICAgIHRoaXMud2l0aENyZWRlbnRpYWxzID0gISFvcHRpb25zLndpdGhDcmVkZW50aWFscztcblxuICAgICAgLy8gT3ZlcnJpZGUgZGVmYXVsdCByZXNwb25zZSB0eXBlIG9mICdqc29uJyBpZiBvbmUgaXMgcHJvdmlkZWQuXG4gICAgICBpZiAoISFvcHRpb25zLnJlc3BvbnNlVHlwZSkge1xuICAgICAgICB0aGlzLnJlc3BvbnNlVHlwZSA9IG9wdGlvbnMucmVzcG9uc2VUeXBlO1xuICAgICAgfVxuXG4gICAgICAvLyBPdmVycmlkZSBoZWFkZXJzIGlmIHRoZXkncmUgcHJvdmlkZWQuXG4gICAgICBpZiAoISFvcHRpb25zLmhlYWRlcnMpIHtcbiAgICAgICAgdGhpcy5oZWFkZXJzID0gb3B0aW9ucy5oZWFkZXJzO1xuICAgICAgfVxuXG4gICAgICBpZiAoISFvcHRpb25zLmNvbnRleHQpIHtcbiAgICAgICAgdGhpcy5jb250ZXh0ID0gb3B0aW9ucy5jb250ZXh0O1xuICAgICAgfVxuXG4gICAgICBpZiAoISFvcHRpb25zLnBhcmFtcykge1xuICAgICAgICB0aGlzLnBhcmFtcyA9IG9wdGlvbnMucGFyYW1zO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIElmIG5vIGhlYWRlcnMgaGF2ZSBiZWVuIHBhc3NlZCBpbiwgY29uc3RydWN0IGEgbmV3IEh0dHBIZWFkZXJzIGluc3RhbmNlLlxuICAgIGlmICghdGhpcy5oZWFkZXJzKSB7XG4gICAgICB0aGlzLmhlYWRlcnMgPSBuZXcgSHR0cEhlYWRlcnMoKTtcbiAgICB9XG5cbiAgICAvLyBJZiBubyBjb250ZXh0IGhhdmUgYmVlbiBwYXNzZWQgaW4sIGNvbnN0cnVjdCBhIG5ldyBIdHRwQ29udGV4dCBpbnN0YW5jZS5cbiAgICBpZiAoIXRoaXMuY29udGV4dCkge1xuICAgICAgdGhpcy5jb250ZXh0ID0gbmV3IEh0dHBDb250ZXh0KCk7XG4gICAgfVxuXG4gICAgLy8gSWYgbm8gcGFyYW1ldGVycyBoYXZlIGJlZW4gcGFzc2VkIGluLCBjb25zdHJ1Y3QgYSBuZXcgSHR0cFVybEVuY29kZWRQYXJhbXMgaW5zdGFuY2UuXG4gICAgaWYgKCF0aGlzLnBhcmFtcykge1xuICAgICAgdGhpcy5wYXJhbXMgPSBuZXcgSHR0cFBhcmFtcygpO1xuICAgICAgdGhpcy51cmxXaXRoUGFyYW1zID0gdXJsO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBFbmNvZGUgdGhlIHBhcmFtZXRlcnMgdG8gYSBzdHJpbmcgaW4gcHJlcGFyYXRpb24gZm9yIGluY2x1c2lvbiBpbiB0aGUgVVJMLlxuICAgICAgY29uc3QgcGFyYW1zID0gdGhpcy5wYXJhbXMudG9TdHJpbmcoKTtcbiAgICAgIGlmIChwYXJhbXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIC8vIE5vIHBhcmFtZXRlcnMsIHRoZSB2aXNpYmxlIFVSTCBpcyBqdXN0IHRoZSBVUkwgZ2l2ZW4gYXQgY3JlYXRpb24gdGltZS5cbiAgICAgICAgdGhpcy51cmxXaXRoUGFyYW1zID0gdXJsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gRG9lcyB0aGUgVVJMIGFscmVhZHkgaGF2ZSBxdWVyeSBwYXJhbWV0ZXJzPyBMb29rIGZvciAnPycuXG4gICAgICAgIGNvbnN0IHFJZHggPSB1cmwuaW5kZXhPZignPycpO1xuICAgICAgICAvLyBUaGVyZSBhcmUgMyBjYXNlcyB0byBoYW5kbGU6XG4gICAgICAgIC8vIDEpIE5vIGV4aXN0aW5nIHBhcmFtZXRlcnMgLT4gYXBwZW5kICc/JyBmb2xsb3dlZCBieSBwYXJhbXMuXG4gICAgICAgIC8vIDIpICc/JyBleGlzdHMgYW5kIGlzIGZvbGxvd2VkIGJ5IGV4aXN0aW5nIHF1ZXJ5IHN0cmluZyAtPlxuICAgICAgICAvLyAgICBhcHBlbmQgJyYnIGZvbGxvd2VkIGJ5IHBhcmFtcy5cbiAgICAgICAgLy8gMykgJz8nIGV4aXN0cyBhdCB0aGUgZW5kIG9mIHRoZSB1cmwgLT4gYXBwZW5kIHBhcmFtcyBkaXJlY3RseS5cbiAgICAgICAgLy8gVGhpcyBiYXNpY2FsbHkgYW1vdW50cyB0byBkZXRlcm1pbmluZyB0aGUgY2hhcmFjdGVyLCBpZiBhbnksIHdpdGhcbiAgICAgICAgLy8gd2hpY2ggdG8gam9pbiB0aGUgVVJMIGFuZCBwYXJhbWV0ZXJzLlxuICAgICAgICBjb25zdCBzZXA6IHN0cmluZyA9IHFJZHggPT09IC0xID8gJz8nIDogKHFJZHggPCB1cmwubGVuZ3RoIC0gMSA/ICcmJyA6ICcnKTtcbiAgICAgICAgdGhpcy51cmxXaXRoUGFyYW1zID0gdXJsICsgc2VwICsgcGFyYW1zO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUcmFuc2Zvcm0gdGhlIGZyZWUtZm9ybSBib2R5IGludG8gYSBzZXJpYWxpemVkIGZvcm1hdCBzdWl0YWJsZSBmb3JcbiAgICogdHJhbnNtaXNzaW9uIHRvIHRoZSBzZXJ2ZXIuXG4gICAqL1xuICBzZXJpYWxpemVCb2R5KCk6IEFycmF5QnVmZmVyfEJsb2J8Rm9ybURhdGF8c3RyaW5nfG51bGwge1xuICAgIC8vIElmIG5vIGJvZHkgaXMgcHJlc2VudCwgbm8gbmVlZCB0byBzZXJpYWxpemUgaXQuXG4gICAgaWYgKHRoaXMuYm9keSA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIC8vIENoZWNrIHdoZXRoZXIgdGhlIGJvZHkgaXMgYWxyZWFkeSBpbiBhIHNlcmlhbGl6ZWQgZm9ybS4gSWYgc28sXG4gICAgLy8gaXQgY2FuIGp1c3QgYmUgcmV0dXJuZWQgZGlyZWN0bHkuXG4gICAgaWYgKGlzQXJyYXlCdWZmZXIodGhpcy5ib2R5KSB8fCBpc0Jsb2IodGhpcy5ib2R5KSB8fCBpc0Zvcm1EYXRhKHRoaXMuYm9keSkgfHxcbiAgICAgICAgdHlwZW9mIHRoaXMuYm9keSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiB0aGlzLmJvZHk7XG4gICAgfVxuICAgIC8vIENoZWNrIHdoZXRoZXIgdGhlIGJvZHkgaXMgYW4gaW5zdGFuY2Ugb2YgSHR0cFVybEVuY29kZWRQYXJhbXMuXG4gICAgaWYgKHRoaXMuYm9keSBpbnN0YW5jZW9mIEh0dHBQYXJhbXMpIHtcbiAgICAgIHJldHVybiB0aGlzLmJvZHkudG9TdHJpbmcoKTtcbiAgICB9XG4gICAgLy8gQ2hlY2sgd2hldGhlciB0aGUgYm9keSBpcyBhbiBvYmplY3Qgb3IgYXJyYXksIGFuZCBzZXJpYWxpemUgd2l0aCBKU09OIGlmIHNvLlxuICAgIGlmICh0eXBlb2YgdGhpcy5ib2R5ID09PSAnb2JqZWN0JyB8fCB0eXBlb2YgdGhpcy5ib2R5ID09PSAnYm9vbGVhbicgfHxcbiAgICAgICAgQXJyYXkuaXNBcnJheSh0aGlzLmJvZHkpKSB7XG4gICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodGhpcy5ib2R5KTtcbiAgICB9XG4gICAgLy8gRmFsbCBiYWNrIG9uIHRvU3RyaW5nKCkgZm9yIGV2ZXJ5dGhpbmcgZWxzZS5cbiAgICByZXR1cm4gKHRoaXMuYm9keSBhcyBhbnkpLnRvU3RyaW5nKCk7XG4gIH1cblxuICAvKipcbiAgICogRXhhbWluZSB0aGUgYm9keSBhbmQgYXR0ZW1wdCB0byBpbmZlciBhbiBhcHByb3ByaWF0ZSBNSU1FIHR5cGVcbiAgICogZm9yIGl0LlxuICAgKlxuICAgKiBJZiBubyBzdWNoIHR5cGUgY2FuIGJlIGluZmVycmVkLCB0aGlzIG1ldGhvZCB3aWxsIHJldHVybiBgbnVsbGAuXG4gICAqL1xuICBkZXRlY3RDb250ZW50VHlwZUhlYWRlcigpOiBzdHJpbmd8bnVsbCB7XG4gICAgLy8gQW4gZW1wdHkgYm9keSBoYXMgbm8gY29udGVudCB0eXBlLlxuICAgIGlmICh0aGlzLmJvZHkgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICAvLyBGb3JtRGF0YSBib2RpZXMgcmVseSBvbiB0aGUgYnJvd3NlcidzIGNvbnRlbnQgdHlwZSBhc3NpZ25tZW50LlxuICAgIGlmIChpc0Zvcm1EYXRhKHRoaXMuYm9keSkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICAvLyBCbG9icyB1c3VhbGx5IGhhdmUgdGhlaXIgb3duIGNvbnRlbnQgdHlwZS4gSWYgaXQgZG9lc24ndCwgdGhlblxuICAgIC8vIG5vIHR5cGUgY2FuIGJlIGluZmVycmVkLlxuICAgIGlmIChpc0Jsb2IodGhpcy5ib2R5KSkge1xuICAgICAgcmV0dXJuIHRoaXMuYm9keS50eXBlIHx8IG51bGw7XG4gICAgfVxuICAgIC8vIEFycmF5IGJ1ZmZlcnMgaGF2ZSB1bmtub3duIGNvbnRlbnRzIGFuZCB0aHVzIG5vIHR5cGUgY2FuIGJlIGluZmVycmVkLlxuICAgIGlmIChpc0FycmF5QnVmZmVyKHRoaXMuYm9keSkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICAvLyBUZWNobmljYWxseSwgc3RyaW5ncyBjb3VsZCBiZSBhIGZvcm0gb2YgSlNPTiBkYXRhLCBidXQgaXQncyBzYWZlIGVub3VnaFxuICAgIC8vIHRvIGFzc3VtZSB0aGV5J3JlIHBsYWluIHN0cmluZ3MuXG4gICAgaWYgKHR5cGVvZiB0aGlzLmJvZHkgPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gJ3RleHQvcGxhaW4nO1xuICAgIH1cbiAgICAvLyBgSHR0cFVybEVuY29kZWRQYXJhbXNgIGhhcyBpdHMgb3duIGNvbnRlbnQtdHlwZS5cbiAgICBpZiAodGhpcy5ib2R5IGluc3RhbmNlb2YgSHR0cFBhcmFtcykge1xuICAgICAgcmV0dXJuICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQ7Y2hhcnNldD1VVEYtOCc7XG4gICAgfVxuICAgIC8vIEFycmF5cywgb2JqZWN0cywgYm9vbGVhbiBhbmQgbnVtYmVycyB3aWxsIGJlIGVuY29kZWQgYXMgSlNPTi5cbiAgICBpZiAodHlwZW9mIHRoaXMuYm9keSA9PT0gJ29iamVjdCcgfHwgdHlwZW9mIHRoaXMuYm9keSA9PT0gJ251bWJlcicgfHxcbiAgICAgICAgdHlwZW9mIHRoaXMuYm9keSA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICByZXR1cm4gJ2FwcGxpY2F0aW9uL2pzb24nO1xuICAgIH1cbiAgICAvLyBObyB0eXBlIGNvdWxkIGJlIGluZmVycmVkLlxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgY2xvbmUoKTogSHR0cFJlcXVlc3Q8VD47XG4gIGNsb25lKHVwZGF0ZToge1xuICAgIGhlYWRlcnM/OiBIdHRwSGVhZGVycyxcbiAgICBjb250ZXh0PzogSHR0cENvbnRleHQsXG4gICAgcmVwb3J0UHJvZ3Jlc3M/OiBib29sZWFuLFxuICAgIHBhcmFtcz86IEh0dHBQYXJhbXMsXG4gICAgcmVzcG9uc2VUeXBlPzogJ2FycmF5YnVmZmVyJ3wnYmxvYid8J2pzb24nfCd0ZXh0JyxcbiAgICB3aXRoQ3JlZGVudGlhbHM/OiBib29sZWFuLFxuICAgIGJvZHk/OiBUfG51bGwsXG4gICAgbWV0aG9kPzogc3RyaW5nLFxuICAgIHVybD86IHN0cmluZyxcbiAgICBzZXRIZWFkZXJzPzoge1tuYW1lOiBzdHJpbmddOiBzdHJpbmd8c3RyaW5nW119LFxuICAgIHNldFBhcmFtcz86IHtbcGFyYW06IHN0cmluZ106IHN0cmluZ30sXG4gIH0pOiBIdHRwUmVxdWVzdDxUPjtcbiAgY2xvbmU8Vj4odXBkYXRlOiB7XG4gICAgaGVhZGVycz86IEh0dHBIZWFkZXJzLFxuICAgIGNvbnRleHQ/OiBIdHRwQ29udGV4dCxcbiAgICByZXBvcnRQcm9ncmVzcz86IGJvb2xlYW4sXG4gICAgcGFyYW1zPzogSHR0cFBhcmFtcyxcbiAgICByZXNwb25zZVR5cGU/OiAnYXJyYXlidWZmZXInfCdibG9iJ3wnanNvbid8J3RleHQnLFxuICAgIHdpdGhDcmVkZW50aWFscz86IGJvb2xlYW4sXG4gICAgYm9keT86IFZ8bnVsbCxcbiAgICBtZXRob2Q/OiBzdHJpbmcsXG4gICAgdXJsPzogc3RyaW5nLFxuICAgIHNldEhlYWRlcnM/OiB7W25hbWU6IHN0cmluZ106IHN0cmluZ3xzdHJpbmdbXX0sXG4gICAgc2V0UGFyYW1zPzoge1twYXJhbTogc3RyaW5nXTogc3RyaW5nfSxcbiAgfSk6IEh0dHBSZXF1ZXN0PFY+O1xuICBjbG9uZSh1cGRhdGU6IHtcbiAgICBoZWFkZXJzPzogSHR0cEhlYWRlcnMsXG4gICAgY29udGV4dD86IEh0dHBDb250ZXh0LFxuICAgIHJlcG9ydFByb2dyZXNzPzogYm9vbGVhbixcbiAgICBwYXJhbXM/OiBIdHRwUGFyYW1zLFxuICAgIHJlc3BvbnNlVHlwZT86ICdhcnJheWJ1ZmZlcid8J2Jsb2InfCdqc29uJ3wndGV4dCcsXG4gICAgd2l0aENyZWRlbnRpYWxzPzogYm9vbGVhbixcbiAgICBib2R5PzogYW55fG51bGwsXG4gICAgbWV0aG9kPzogc3RyaW5nLFxuICAgIHVybD86IHN0cmluZyxcbiAgICBzZXRIZWFkZXJzPzoge1tuYW1lOiBzdHJpbmddOiBzdHJpbmd8c3RyaW5nW119LFxuICAgIHNldFBhcmFtcz86IHtbcGFyYW06IHN0cmluZ106IHN0cmluZ307XG4gIH0gPSB7fSk6IEh0dHBSZXF1ZXN0PGFueT4ge1xuICAgIC8vIEZvciBtZXRob2QsIHVybCwgYW5kIHJlc3BvbnNlVHlwZSwgdGFrZSB0aGUgY3VycmVudCB2YWx1ZSB1bmxlc3NcbiAgICAvLyBpdCBpcyBvdmVycmlkZGVuIGluIHRoZSB1cGRhdGUgaGFzaC5cbiAgICBjb25zdCBtZXRob2QgPSB1cGRhdGUubWV0aG9kIHx8IHRoaXMubWV0aG9kO1xuICAgIGNvbnN0IHVybCA9IHVwZGF0ZS51cmwgfHwgdGhpcy51cmw7XG4gICAgY29uc3QgcmVzcG9uc2VUeXBlID0gdXBkYXRlLnJlc3BvbnNlVHlwZSB8fCB0aGlzLnJlc3BvbnNlVHlwZTtcblxuICAgIC8vIFRoZSBib2R5IGlzIHNvbWV3aGF0IHNwZWNpYWwgLSBhIGBudWxsYCB2YWx1ZSBpbiB1cGRhdGUuYm9keSBtZWFuc1xuICAgIC8vIHdoYXRldmVyIGN1cnJlbnQgYm9keSBpcyBwcmVzZW50IGlzIGJlaW5nIG92ZXJyaWRkZW4gd2l0aCBhbiBlbXB0eVxuICAgIC8vIGJvZHksIHdoZXJlYXMgYW4gYHVuZGVmaW5lZGAgdmFsdWUgaW4gdXBkYXRlLmJvZHkgaW1wbGllcyBub1xuICAgIC8vIG92ZXJyaWRlLlxuICAgIGNvbnN0IGJvZHkgPSAodXBkYXRlLmJvZHkgIT09IHVuZGVmaW5lZCkgPyB1cGRhdGUuYm9keSA6IHRoaXMuYm9keTtcblxuICAgIC8vIENhcmVmdWxseSBoYW5kbGUgdGhlIGJvb2xlYW4gb3B0aW9ucyB0byBkaWZmZXJlbnRpYXRlIGJldHdlZW5cbiAgICAvLyBgZmFsc2VgIGFuZCBgdW5kZWZpbmVkYCBpbiB0aGUgdXBkYXRlIGFyZ3MuXG4gICAgY29uc3Qgd2l0aENyZWRlbnRpYWxzID1cbiAgICAgICAgKHVwZGF0ZS53aXRoQ3JlZGVudGlhbHMgIT09IHVuZGVmaW5lZCkgPyB1cGRhdGUud2l0aENyZWRlbnRpYWxzIDogdGhpcy53aXRoQ3JlZGVudGlhbHM7XG4gICAgY29uc3QgcmVwb3J0UHJvZ3Jlc3MgPVxuICAgICAgICAodXBkYXRlLnJlcG9ydFByb2dyZXNzICE9PSB1bmRlZmluZWQpID8gdXBkYXRlLnJlcG9ydFByb2dyZXNzIDogdGhpcy5yZXBvcnRQcm9ncmVzcztcblxuICAgIC8vIEhlYWRlcnMgYW5kIHBhcmFtcyBtYXkgYmUgYXBwZW5kZWQgdG8gaWYgYHNldEhlYWRlcnNgIG9yXG4gICAgLy8gYHNldFBhcmFtc2AgYXJlIHVzZWQuXG4gICAgbGV0IGhlYWRlcnMgPSB1cGRhdGUuaGVhZGVycyB8fCB0aGlzLmhlYWRlcnM7XG4gICAgbGV0IHBhcmFtcyA9IHVwZGF0ZS5wYXJhbXMgfHwgdGhpcy5wYXJhbXM7XG5cbiAgICAvLyBQYXNzIG9uIGNvbnRleHQgaWYgbmVlZGVkXG4gICAgY29uc3QgY29udGV4dCA9IHVwZGF0ZS5jb250ZXh0ID8/IHRoaXMuY29udGV4dDtcblxuICAgIC8vIENoZWNrIHdoZXRoZXIgdGhlIGNhbGxlciBoYXMgYXNrZWQgdG8gYWRkIGhlYWRlcnMuXG4gICAgaWYgKHVwZGF0ZS5zZXRIZWFkZXJzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIFNldCBldmVyeSByZXF1ZXN0ZWQgaGVhZGVyLlxuICAgICAgaGVhZGVycyA9XG4gICAgICAgICAgT2JqZWN0LmtleXModXBkYXRlLnNldEhlYWRlcnMpXG4gICAgICAgICAgICAgIC5yZWR1Y2UoKGhlYWRlcnMsIG5hbWUpID0+IGhlYWRlcnMuc2V0KG5hbWUsIHVwZGF0ZS5zZXRIZWFkZXJzIVtuYW1lXSksIGhlYWRlcnMpO1xuICAgIH1cblxuICAgIC8vIENoZWNrIHdoZXRoZXIgdGhlIGNhbGxlciBoYXMgYXNrZWQgdG8gc2V0IHBhcmFtcy5cbiAgICBpZiAodXBkYXRlLnNldFBhcmFtcykge1xuICAgICAgLy8gU2V0IGV2ZXJ5IHJlcXVlc3RlZCBwYXJhbS5cbiAgICAgIHBhcmFtcyA9IE9iamVjdC5rZXlzKHVwZGF0ZS5zZXRQYXJhbXMpXG4gICAgICAgICAgICAgICAgICAgLnJlZHVjZSgocGFyYW1zLCBwYXJhbSkgPT4gcGFyYW1zLnNldChwYXJhbSwgdXBkYXRlLnNldFBhcmFtcyFbcGFyYW1dKSwgcGFyYW1zKTtcbiAgICB9XG5cbiAgICAvLyBGaW5hbGx5LCBjb25zdHJ1Y3QgdGhlIG5ldyBIdHRwUmVxdWVzdCB1c2luZyB0aGUgcGllY2VzIGZyb20gYWJvdmUuXG4gICAgcmV0dXJuIG5ldyBIdHRwUmVxdWVzdChtZXRob2QsIHVybCwgYm9keSwge1xuICAgICAgcGFyYW1zLFxuICAgICAgaGVhZGVycyxcbiAgICAgIGNvbnRleHQsXG4gICAgICByZXBvcnRQcm9ncmVzcyxcbiAgICAgIHJlc3BvbnNlVHlwZSxcbiAgICAgIHdpdGhDcmVkZW50aWFscyxcbiAgICB9KTtcbiAgfVxufVxuIl19