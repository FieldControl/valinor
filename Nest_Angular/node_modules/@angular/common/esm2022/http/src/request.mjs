/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
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
 * Safely assert whether the given value is a URLSearchParams instance.
 *
 * In some execution environments URLSearchParams is not defined.
 */
function isUrlSearchParams(value) {
    return typeof URLSearchParams !== 'undefined' && value instanceof URLSearchParams;
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
         *
         * Note: The `FetchBackend` doesn't support progress report on uploads.
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
            this.body = third !== undefined ? third : null;
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
            // We do want to assign transferCache even if it's falsy (false is valid value)
            this.transferCache = options.transferCache;
        }
        // If no headers have been passed in, construct a new HttpHeaders instance.
        this.headers ??= new HttpHeaders();
        // If no context have been passed in, construct a new HttpContext instance.
        this.context ??= new HttpContext();
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
                const sep = qIdx === -1 ? '?' : qIdx < url.length - 1 ? '&' : '';
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
        if (typeof this.body === 'string' ||
            isArrayBuffer(this.body) ||
            isBlob(this.body) ||
            isFormData(this.body) ||
            isUrlSearchParams(this.body)) {
            return this.body;
        }
        // Check whether the body is an instance of HttpUrlEncodedParams.
        if (this.body instanceof HttpParams) {
            return this.body.toString();
        }
        // Check whether the body is an object or array, and serialize with JSON if so.
        if (typeof this.body === 'object' ||
            typeof this.body === 'boolean' ||
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
        if (typeof this.body === 'object' ||
            typeof this.body === 'number' ||
            typeof this.body === 'boolean') {
            return 'application/json';
        }
        // No type could be inferred.
        return null;
    }
    clone(update = {}) {
        // For method, url, and responseType, take the current value unless
        // it is overridden in the update hash.
        const method = update.method || this.method;
        const url = update.url || this.url;
        const responseType = update.responseType || this.responseType;
        // Carefully handle the transferCache to differentiate between
        // `false` and `undefined` in the update args.
        const transferCache = update.transferCache ?? this.transferCache;
        // The body is somewhat special - a `null` value in update.body means
        // whatever current body is present is being overridden with an empty
        // body, whereas an `undefined` value in update.body implies no
        // override.
        const body = update.body !== undefined ? update.body : this.body;
        // Carefully handle the boolean options to differentiate between
        // `false` and `undefined` in the update args.
        const withCredentials = update.withCredentials ?? this.withCredentials;
        const reportProgress = update.reportProgress ?? this.reportProgress;
        // Headers and params may be appended to if `setHeaders` or
        // `setParams` are used.
        let headers = update.headers || this.headers;
        let params = update.params || this.params;
        // Pass on context if needed
        const context = update.context ?? this.context;
        // Check whether the caller has asked to add headers.
        if (update.setHeaders !== undefined) {
            // Set every requested header.
            headers = Object.keys(update.setHeaders).reduce((headers, name) => headers.set(name, update.setHeaders[name]), headers);
        }
        // Check whether the caller has asked to set params.
        if (update.setParams) {
            // Set every requested param.
            params = Object.keys(update.setParams).reduce((params, param) => params.set(param, update.setParams[param]), params);
        }
        // Finally, construct the new HttpRequest using the pieces from above.
        return new HttpRequest(method, url, body, {
            params,
            headers,
            context,
            reportProgress,
            responseType,
            withCredentials,
            transferCache,
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVxdWVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9odHRwL3NyYy9yZXF1ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxXQUFXLENBQUM7QUFDdEMsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUN0QyxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sVUFBVSxDQUFDO0FBaUJwQzs7R0FFRztBQUNILFNBQVMsYUFBYSxDQUFDLE1BQWM7SUFDbkMsUUFBUSxNQUFNLEVBQUUsQ0FBQztRQUNmLEtBQUssUUFBUSxDQUFDO1FBQ2QsS0FBSyxLQUFLLENBQUM7UUFDWCxLQUFLLE1BQU0sQ0FBQztRQUNaLEtBQUssU0FBUyxDQUFDO1FBQ2YsS0FBSyxPQUFPO1lBQ1YsT0FBTyxLQUFLLENBQUM7UUFDZjtZQUNFLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7QUFDSCxDQUFDO0FBRUQ7Ozs7R0FJRztBQUNILFNBQVMsYUFBYSxDQUFDLEtBQVU7SUFDL0IsT0FBTyxPQUFPLFdBQVcsS0FBSyxXQUFXLElBQUksS0FBSyxZQUFZLFdBQVcsQ0FBQztBQUM1RSxDQUFDO0FBRUQ7Ozs7R0FJRztBQUNILFNBQVMsTUFBTSxDQUFDLEtBQVU7SUFDeEIsT0FBTyxPQUFPLElBQUksS0FBSyxXQUFXLElBQUksS0FBSyxZQUFZLElBQUksQ0FBQztBQUM5RCxDQUFDO0FBRUQ7Ozs7R0FJRztBQUNILFNBQVMsVUFBVSxDQUFDLEtBQVU7SUFDNUIsT0FBTyxPQUFPLFFBQVEsS0FBSyxXQUFXLElBQUksS0FBSyxZQUFZLFFBQVEsQ0FBQztBQUN0RSxDQUFDO0FBRUQ7Ozs7R0FJRztBQUNILFNBQVMsaUJBQWlCLENBQUMsS0FBVTtJQUNuQyxPQUFPLE9BQU8sZUFBZSxLQUFLLFdBQVcsSUFBSSxLQUFL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Q0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0h0dHBDb250ZXh0fSBmcm9tICcuL2NvbnRleHQnO1xuaW1wb3J0IHtIdHRwSGVhZGVyc30gZnJvbSAnLi9oZWFkZXJzJztcbmltcG9ydCB7SHR0cFBhcmFtc30gZnJvbSAnLi9wYXJhbXMnO1xuXG4vKipcbiAqIENvbnN0cnVjdGlvbiBpbnRlcmZhY2UgZm9yIGBIdHRwUmVxdWVzdGBzLlxuICpcbiAqIEFsbCB2YWx1ZXMgYXJlIG9wdGlvbmFsIGFuZCB3aWxsIG92ZXJyaWRlIGRlZmF1bHQgdmFsdWVzIGlmIHByb3ZpZGVkLlxuICovXG5pbnRlcmZhY2UgSHR0cFJlcXVlc3RJbml0IHtcbiAgaGVhZGVycz86IEh0dHBIZWFkZXJzO1xuICBjb250ZXh0PzogSHR0cENvbnRleHQ7XG4gIHJlcG9ydFByb2dyZXNzPzogYm9vbGVhbjtcbiAgcGFyYW1zPzogSHR0cFBhcmFtcztcbiAgcmVzcG9uc2VUeXBlPzogJ2FycmF5YnVmZmVyJyB8ICdibG9iJyB8ICdqc29uJyB8ICd0ZXh0JztcbiAgd2l0aENyZWRlbnRpYWxzPzogYm9vbGVhbjtcbiAgdHJhbnNmZXJDYWNoZT86IHtpbmNsdWRlSGVhZGVycz86IHN0cmluZ1tdfSB8IGJvb2xlYW47XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIHdoZXRoZXIgdGhlIGdpdmVuIEhUVFAgbWV0aG9kIG1heSBpbmNsdWRlIGEgYm9keS5cbiAqL1xuZnVuY3Rpb24gbWlnaHRIYXZlQm9keShtZXRob2Q6IHN0cmluZyk6IGJvb2xlYW4ge1xuICBzd2l0Y2ggKG1ldGhvZCkge1xuICAgIGNhc2UgJ0RFTEVURSc6XG4gICAgY2FzZSAnR0VUJzpcbiAgICBjYXNlICdIRUFEJzpcbiAgICBjYXNlICdPUFRJT05TJzpcbiAgICBjYXNlICdKU09OUCc6XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiB0cnVlO1xuICB9XG59XG5cbi8qKlxuICogU2FmZWx5IGFzc2VydCB3aGV0aGVyIHRoZSBnaXZlbiB2YWx1ZSBpcyBhbiBBcnJheUJ1ZmZlci5cbiAqXG4gKiBJbiBzb21lIGV4ZWN1dGlvbiBlbnZpcm9ubWVudHMgQXJyYXlCdWZmZXIgaXMgbm90IGRlZmluZWQuXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlCdWZmZXIodmFsdWU6IGFueSk6IHZhbHVlIGlzIEFycmF5QnVmZmVyIHtcbiAgcmV0dXJuIHR5cGVvZiBBcnJheUJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcgJiYgdmFsdWUgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcjtcbn1cblxuLyoqXG4gKiBTYWZlbHkgYXNzZXJ0IHdoZXRoZXIgdGhlIGdpdmVuIHZhbHVlIGlzIGEgQmxvYi5cbiAqXG4gKiBJbiBzb21lIGV4ZWN1dGlvbiBlbnZpcm9ubWVudHMgQmxvYiBpcyBub3QgZGVmaW5lZC5cbiAqL1xuZnVuY3Rpb24gaXNCbG9iKHZhbHVlOiBhbnkpOiB2YWx1ZSBpcyBCbG9iIHtcbiAgcmV0dXJuIHR5cGVvZiBCbG9iICE9PSAndW5kZWZpbmVkJyAmJiB2YWx1ZSBpbnN0YW5jZW9mIEJsb2I7XG59XG5cbi8qKlxuICogU2FmZWx5IGFzc2VydCB3aGV0aGVyIHRoZSBnaXZlbiB2YWx1ZSBpcyBhIEZvcm1EYXRhIGluc3RhbmNlLlxuICpcbiAqIEluIHNvbWUgZXhlY3V0aW9uIGVudmlyb25tZW50cyBGb3JtRGF0YSBpcyBub3QgZGVmaW5lZC5cbiAqL1xuZnVuY3Rpb24gaXNGb3JtRGF0YSh2YWx1ZTogYW55KTogdmFsdWUgaXMgRm9ybURhdGEge1xuICByZXR1cm4gdHlwZW9mIEZvcm1EYXRhICE9PSAndW5kZWZpbmVkJyAmJiB2YWx1ZSBpbnN0YW5jZW9mIEZvcm1EYXRhO1xufVxuXG4vKipcbiAqIFNhZmVseSBhc3NlcnQgd2hldGhlciB0aGUgZ2l2ZW4gdmFsdWUgaXMgYSBVUkxTZWFyY2hQYXJhbXMgaW5zdGFuY2UuXG4gKlxuICogSW4gc29tZSBleGVjdXRpb24gZW52aXJvbm1lbnRzIFVSTFNlYXJjaFBhcmFtcyBpcyBub3QgZGVmaW5lZC5cbiAqL1xuZnVuY3Rpb24gaXNVcmxTZWFyY2hQYXJhbXModmFsdWU6IGFueSk6IHZhbHVlIGlzIFVSTFNlYXJjaFBhcmFtcyB7XG4gIHJldHVybiB0eXBlb2YgVVJMU2VhcmNoUGFyYW1zICE9PSAndW5kZWZpbmVkJyAmJiB2YWx1ZSBpbnN0YW5jZW9mIFVSTFNlYXJjaFBhcmFtcztcbn1cblxuLyoqXG4gKiBBbiBvdXRnb2luZyBIVFRQIHJlcXVlc3Qgd2l0aCBhbiBvcHRpb25hbCB0eXBlZCBib2R5LlxuICpcbiAqIGBIdHRwUmVxdWVzdGAgcmVwcmVzZW50cyBhbiBvdXRnb2luZyByZXF1ZXN0LCBpbmNsdWRpbmcgVVJMLCBtZXRob2QsXG4gKiBoZWFkZXJzLCBib2R5LCBhbmQgb3RoZXIgcmVxdWVzdCBjb25maWd1cmF0aW9uIG9wdGlvbnMuIEluc3RhbmNlcyBzaG91bGQgYmVcbiAqIGFzc3VtZWQgdG8gYmUgaW1tdXRhYmxlLiBUbyBtb2RpZnkgYSBgSHR0cFJlcXVlc3RgLCB0aGUgYGNsb25lYFxuICogbWV0aG9kIHNob3VsZCBiZSB1c2VkLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIEh0dHBSZXF1ZXN0PFQ+IHtcbiAgLyoqXG4gICAqIFRoZSByZXF1ZXN0IGJvZHksIG9yIGBudWxsYCBpZiBvbmUgaXNuJ3Qgc2V0LlxuICAgKlxuICAgKiBCb2RpZXMgYXJlIG5vdCBlbmZvcmNlZCB0byBiZSBpbW11dGFibGUsIGFzIHRoZXkgY2FuIGluY2x1ZGUgYSByZWZlcmVuY2UgdG8gYW55XG4gICAqIHVzZXItZGVmaW5lZCBkYXRhIHR5cGUuIEhvd2V2ZXIsIGludGVyY2VwdG9ycyBzaG91bGQgdGFrZSBjYXJlIHRvIHByZXNlcnZlXG4gICAqIGlkZW1wb3RlbmNlIGJ5IHRyZWF0aW5nIHRoZW0gYXMgc3VjaC5cbiAgICovXG4gIHJlYWRvbmx5IGJvZHk6IFQgfCBudWxsID0gbnVsbDtcblxuICAvKipcbiAgICogT3V0Z29pbmcgaGVhZGVycyBmb3IgdGhpcyByZXF1ZXN0LlxuICAgKi9cbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHJlYWRvbmx5IGhlYWRlcnMhOiBIdHRwSGVhZGVycztcblxuICAvKipcbiAgICogU2hhcmVkIGFuZCBtdXRhYmxlIGNvbnRleHQgdGhhdCBjYW4gYmUgdXNlZCBieSBpbnRlcmNlcHRvcnNcbiAgICovXG4gIHJlYWRvbmx5IGNvbnRleHQhOiBIdHRwQ29udGV4dDtcblxuICAvKipcbiAgICogV2hldGhlciB0aGlzIHJlcXVlc3Qgc2hvdWxkIGJlIG1hZGUgaW4gYSB3YXkgdGhhdCBleHBvc2VzIHByb2dyZXNzIGV2ZW50cy5cbiAgICpcbiAgICogUHJvZ3Jlc3MgZXZlbnRzIGFyZSBleHBlbnNpdmUgKGNoYW5nZSBkZXRlY3Rpb24gcnVucyBvbiBlYWNoIGV2ZW50KSBhbmQgc29cbiAgICogdGhleSBzaG91bGQgb25seSBiZSByZXF1ZXN0ZWQgaWYgdGhlIGNvbnN1bWVyIGludGVuZHMgdG8gbW9uaXRvciB0aGVtLlxuICAgKlxuICAgKiBOb3RlOiBUaGUgYEZldGNoQmFja2VuZGAgZG9lc24ndCBzdXBwb3J0IHByb2dyZXNzIHJlcG9ydCBvbiB1cGxvYWRzLlxuICAgKi9cbiAgcmVhZG9ubHkgcmVwb3J0UHJvZ3Jlc3M6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAvKipcbiAgICogV2hldGhlciB0aGlzIHJlcXVlc3Qgc2hvdWxkIGJlIHNlbnQgd2l0aCBvdXRnb2luZyBjcmVkZW50aWFscyAoY29va2llcykuXG4gICAqL1xuICByZWFkb25seSB3aXRoQ3JlZGVudGlhbHM6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAvKipcbiAgICogVGhlIGV4cGVjdGVkIHJlc3BvbnNlIHR5cGUgb2YgdGhlIHNlcnZlci5cbiAgICpcbiAgICogVGhpcyBpcyB1c2VkIHRvIHBhcnNlIHRoZSByZXNwb25zZSBhcHByb3ByaWF0ZWx5IGJlZm9yZSByZXR1cm5pbmcgaXQgdG9cbiAgICogdGhlIHJlcXVlc3RlZS5cbiAgICovXG4gIHJlYWRvbmx5IHJlc3BvbnNlVHlwZTogJ2FycmF5YnVmZmVyJyB8ICdibG9iJyB8ICdqc29uJyB8ICd0ZXh0JyA9ICdqc29uJztcblxuICAvKipcbiAgICogVGhlIG91dGdvaW5nIEhUVFAgcmVxdWVzdCBtZXRob2QuXG4gICAqL1xuICByZWFkb25seSBtZXRob2Q6IHN0cmluZztcblxuICAvKipcbiAgICogT3V0Z29pbmcgVVJMIHBhcmFtZXRlcnMuXG4gICAqXG4gICAqIFRvIHBhc3MgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgSFRUUCBwYXJhbWV0ZXJzIGluIHRoZSBVUkwtcXVlcnktc3RyaW5nIGZvcm1hdCxcbiAgICogdGhlIGBIdHRwUGFyYW1zT3B0aW9uc2AnIGBmcm9tU3RyaW5nYCBtYXkgYmUgdXNlZC4gRm9yIGV4YW1wbGU6XG4gICAqXG4gICAqIGBgYFxuICAgKiBuZXcgSHR0cFBhcmFtcyh7ZnJvbVN0cmluZzogJ2FuZ3VsYXI9YXdlc29tZSd9KVxuICAgKiBgYGBcbiAgICovXG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICByZWFkb25seSBwYXJhbXMhOiBIdHRwUGFyYW1zO1xuXG4gIC8qKlxuICAgKiBUaGUgb3V0Z29pbmcgVVJMIHdpdGggYWxsIFVSTCBwYXJhbWV0ZXJzIHNldC5cbiAgICovXG4gIHJlYWRvbmx5IHVybFdpdGhQYXJhbXM6IHN0cmluZztcblxuICAvKipcbiAgICogVGhlIEh0dHBUcmFuc2ZlckNhY2hlIG9wdGlvbiBmb3IgdGhlIHJlcXVlc3RcbiAgICovXG4gIHJlYWRvbmx5IHRyYW5zZmVyQ2FjaGU/OiB7aW5jbHVkZUhlYWRlcnM/OiBzdHJpbmdbXX0gfCBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIG1ldGhvZDogJ0dFVCcgfCAnSEVBRCcsXG4gICAgdXJsOiBzdHJpbmcsXG4gICAgaW5pdD86IHtcbiAgICAgIGhlYWRlcnM/OiBIdHRwSGVhZGVycztcbiAgICAgIGNvbnRleHQ/OiBIdHRwQ29udGV4dDtcbiAgICAgIHJlcG9ydFByb2dyZXNzPzogYm9vbGVhbjtcbiAgICAgIHBhcmFtcz86IEh0dHBQYXJhbXM7XG4gICAgICByZXNwb25zZVR5cGU/OiAnYXJyYXlidWZmZXInIHwgJ2Jsb2InIHwgJ2pzb24nIHwgJ3RleHQnO1xuICAgICAgd2l0aENyZWRlbnRpYWxzPzogYm9vbGVhbjtcbiAgICAgIC8qKlxuICAgICAgICogVGhpcyBwcm9wZXJ0eSBhY2NlcHRzIGVpdGhlciBhIGJvb2xlYW4gdG8gZW5hYmxlL2Rpc2FibGUgdHJhbnNmZXJyaW5nIGNhY2hlIGZvciBlbGlnaWJsZVxuICAgICAgICogcmVxdWVzdHMgcGVyZm9ybWVkIHVzaW5nIGBIdHRwQ2xpZW50YCwgb3IgYW4gb2JqZWN0LCB3aGljaCBhbGxvd3MgdG8gY29uZmlndXJlIGNhY2hlXG4gICAgICAgKiBwYXJhbWV0ZXJzLCBzdWNoIGFzIHdoaWNoIGhlYWRlcnMgc2hvdWxkIGJlIGluY2x1ZGVkIChubyBoZWFkZXJzIGFyZSBpbmNsdWRlZCBieSBkZWZhdWx0KS5cbiAgICAgICAqXG4gICAgICAgKiBTZXR0aW5nIHRoaXMgcHJvcGVydHkgd2lsbCBvdmVycmlkZSB0aGUgb3B0aW9ucyBwYXNzZWQgdG8gYHByb3ZpZGVDbGllbnRIeWRyYXRpb24oKWAgZm9yIHRoaXNcbiAgICAgICAqIHBhcnRpY3VsYXIgcmVxdWVzdFxuICAgICAgICovXG4gICAgICB0cmFuc2ZlckNhY2hlPzoge2luY2x1ZGVIZWFkZXJzPzogc3RyaW5nW119IHwgYm9vbGVhbjtcbiAgICB9LFxuICApO1xuICBjb25zdHJ1Y3RvcihcbiAgICBtZXRob2Q6ICdERUxFVEUnIHwgJ0pTT05QJyB8ICdPUFRJT05TJyxcbiAgICB1cmw6IHN0cmluZyxcbiAgICBpbml0Pzoge1xuICAgICAgaGVhZGVycz86IEh0dHBIZWFkZXJzO1xuICAgICAgY29udGV4dD86IEh0dHBDb250ZXh0O1xuICAgICAgcmVwb3J0UHJvZ3Jlc3M/OiBib29sZWFuO1xuICAgICAgcGFyYW1zPzogSHR0cFBhcmFtcztcbiAgICAgIHJlc3BvbnNlVHlwZT86ICdhcnJheWJ1ZmZlcicgfCAnYmxvYicgfCAnanNvbicgfCAndGV4dCc7XG4gICAgICB3aXRoQ3JlZGVudGlhbHM/OiBib29sZWFuO1xuICAgIH0sXG4gICk7XG4gIGNvbnN0cnVjdG9yKFxuICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIHVybDogc3RyaW5nLFxuICAgIGJvZHk6IFQgfCBudWxsLFxuICAgIGluaXQ/OiB7XG4gICAgICBoZWFkZXJzPzogSHR0cEhlYWRlcnM7XG4gICAgICBjb250ZXh0PzogSHR0cENvbnRleHQ7XG4gICAgICByZXBvcnRQcm9ncmVzcz86IGJvb2xlYW47XG4gICAgICBwYXJhbXM/OiBIdHRwUGFyYW1zO1xuICAgICAgcmVzcG9uc2VUeXBlPzogJ2FycmF5YnVmZmVyJyB8ICdibG9iJyB8ICdqc29uJyB8ICd0ZXh0JztcbiAgICAgIHdpdGhDcmVkZW50aWFscz86IGJvb2xlYW47XG4gICAgICAvKipcbiAgICAgICAqIFRoaXMgcHJvcGVydHkgYWNjZXB0cyBlaXRoZXIgYSBib29sZWFuIHRvIGVuYWJsZS9kaXNhYmxlIHRyYW5zZmVycmluZyBjYWNoZSBmb3IgZWxpZ2libGVcbiAgICAgICAqIHJlcXVlc3RzIHBlcmZvcm1lZCB1c2luZyBgSHR0cENsaWVudGAsIG9yIGFuIG9iamVjdCwgd2hpY2ggYWxsb3dzIHRvIGNvbmZpZ3VyZSBjYWNoZVxuICAgICAgICogcGFyYW1ldGVycywgc3VjaCBhcyB3aGljaCBoZWFkZXJzIHNob3VsZCBiZSBpbmNsdWRlZCAobm8gaGVhZGVycyBhcmUgaW5jbHVkZWQgYnkgZGVmYXVsdCkuXG4gICAgICAgKlxuICAgICAgICogU2V0dGluZyB0aGlzIHByb3BlcnR5IHdpbGwgb3ZlcnJpZGUgdGhlIG9wdGlvbnMgcGFzc2VkIHRvIGBwcm92aWRlQ2xpZW50SHlkcmF0aW9uKClgIGZvciB0aGlzXG4gICAgICAgKiBwYXJ0aWN1bGFyIHJlcXVlc3RcbiAgICAgICAqL1xuICAgICAgdHJhbnNmZXJDYWNoZT86IHtpbmNsdWRlSGVhZGVycz86IHN0cmluZ1tdfSB8IGJvb2xlYW47XG4gICAgfSxcbiAgKTtcbiAgY29uc3RydWN0b3IoXG4gICAgbWV0aG9kOiAnUFVUJyB8ICdQQVRDSCcsXG4gICAgdXJsOiBzdHJpbmcsXG4gICAgYm9keTogVCB8IG51bGwsXG4gICAgaW5pdD86IHtcbiAgICAgIGhlYWRlcnM/OiBIdHRwSGVhZGVycztcbiAgICAgIGNvbnRleHQ/OiBIdHRwQ29udGV4dDtcbiAgICAgIHJlcG9ydFByb2dyZXNzPzogYm9vbGVhbjtcbiAgICAgIHBhcmFtcz86IEh0dHBQYXJhbXM7XG4gICAgICByZXNwb25zZVR5cGU/OiAnYXJyYXlidWZmZXInIHwgJ2Jsb2InIHwgJ2pzb24nIHwgJ3RleHQnO1xuICAgICAgd2l0aENyZWRlbnRpYWxzPzogYm9vbGVhbjtcbiAgICB9LFxuICApO1xuICBjb25zdHJ1Y3RvcihcbiAgICBtZXRob2Q6IHN0cmluZyxcbiAgICB1cmw6IHN0cmluZyxcbiAgICBib2R5OiBUIHwgbnVsbCxcbiAgICBpbml0Pzoge1xuICAgICAgaGVhZGVycz86IEh0dHBIZWFkZXJzO1xuICAgICAgY29udGV4dD86IEh0dHBDb250ZXh0O1xuICAgICAgcmVwb3J0UHJvZ3Jlc3M/OiBib29sZWFuO1xuICAgICAgcGFyYW1zPzogSHR0cFBhcmFtcztcbiAgICAgIHJlc3BvbnNlVHlwZT86ICdhcnJheWJ1ZmZlcicgfCAnYmxvYicgfCAnanNvbicgfCAndGV4dCc7XG4gICAgICB3aXRoQ3JlZGVudGlhbHM/OiBib29sZWFuO1xuICAgICAgLyoqXG4gICAgICAgKiBUaGlzIHByb3BlcnR5IGFjY2VwdHMgZWl0aGVyIGEgYm9vbGVhbiB0byBlbmFibGUvZGlzYWJsZSB0cmFuc2ZlcnJpbmcgY2FjaGUgZm9yIGVsaWdpYmxlXG4gICAgICAgKiByZXF1ZXN0cyBwZXJmb3JtZWQgdXNpbmcgYEh0dHBDbGllbnRgLCBvciBhbiBvYmplY3QsIHdoaWNoIGFsbG93cyB0byBjb25maWd1cmUgY2FjaGVcbiAgICAgICAqIHBhcmFtZXRlcnMsIHN1Y2ggYXMgd2hpY2ggaGVhZGVycyBzaG91bGQgYmUgaW5jbHVkZWQgKG5vIGhlYWRlcnMgYXJlIGluY2x1ZGVkIGJ5IGRlZmF1bHQpLlxuICAgICAgICpcbiAgICAgICAqIFNldHRpbmcgdGhpcyBwcm9wZXJ0eSB3aWxsIG92ZXJyaWRlIHRoZSBvcHRpb25zIHBhc3NlZCB0byBgcHJvdmlkZUNsaWVudEh5ZHJhdGlvbigpYCBmb3IgdGhpc1xuICAgICAgICogcGFydGljdWxhciByZXF1ZXN0XG4gICAgICAgKi9cbiAgICAgIHRyYW5zZmVyQ2FjaGU/OiB7aW5jbHVkZUhlYWRlcnM/OiBzdHJpbmdbXX0gfCBib29sZWFuO1xuICAgIH0sXG4gICk7XG4gIGNvbnN0cnVjdG9yKFxuICAgIG1ldGhvZDogc3RyaW5nLFxuICAgIHJlYWRvbmx5IHVybDogc3RyaW5nLFxuICAgIHRoaXJkPzpcbiAgICAgIHwgVFxuICAgICAgfCB7XG4gICAgICAgICAgaGVhZGVycz86IEh0dHBIZWFkZXJzO1xuICAgICAgICAgIGNvbnRleHQ/OiBIdHRwQ29udGV4dDtcbiAgICAgICAgICByZXBvcnRQcm9ncmVzcz86IGJvb2xlYW47XG4gICAgICAgICAgcGFyYW1zPzogSHR0cFBhcmFtcztcbiAgICAgICAgICByZXNwb25zZVR5cGU/OiAnYXJyYXlidWZmZXInIHwgJ2Jsb2InIHwgJ2pzb24nIHwgJ3RleHQnO1xuICAgICAgICAgIHdpdGhDcmVkZW50aWFscz86IGJvb2xlYW47XG4gICAgICAgICAgdHJhbnNmZXJDYWNoZT86IHtpbmNsdWRlSGVhZGVycz86IHN0cmluZ1tdfSB8IGJvb2xlYW47XG4gICAgICAgIH1cbiAgICAgIHwgbnVsbCxcbiAgICBmb3VydGg/OiB7XG4gICAgICBoZWFkZXJzPzogSHR0cEhlYWRlcnM7XG4gICAgICBjb250ZXh0PzogSHR0cENvbnRleHQ7XG4gICAgICByZXBvcnRQcm9ncmVzcz86IGJvb2xlYW47XG4gICAgICBwYXJhbXM/OiBIdHRwUGFyYW1zO1xuICAgICAgcmVzcG9uc2VUeXBlPzogJ2FycmF5YnVmZmVyJyB8ICdibG9iJyB8ICdqc29uJyB8ICd0ZXh0JztcbiAgICAgIHdpdGhDcmVkZW50aWFscz86IGJvb2xlYW47XG4gICAgICB0cmFuc2ZlckNhY2hlPzoge2luY2x1ZGVIZWFkZXJzPzogc3RyaW5nW119IHwgYm9vbGVhbjtcbiAgICB9LFxuICApIHtcbiAgICB0aGlzLm1ldGhvZCA9IG1ldGhvZC50b1VwcGVyQ2FzZSgpO1xuICAgIC8vIE5leHQsIG5lZWQgdG8gZmlndXJlIG91dCB3aGljaCBhcmd1bWVudCBob2xkcyB0aGUgSHR0cFJlcXVlc3RJbml0XG4gICAgLy8gb3B0aW9ucywgaWYgYW55LlxuICAgIGxldCBvcHRpb25zOiBIdHRwUmVxdWVzdEluaXQgfCB1bmRlZmluZWQ7XG5cbiAgICAvLyBDaGVjayB3aGV0aGVyIGEgYm9keSBhcmd1bWVudCBpcyBleHBlY3RlZC4gVGhlIG9ubHkgdmFsaWQgd2F5IHRvIG9taXRcbiAgICAvLyB0aGUgYm9keSBhcmd1bWVudCBpcyB0byB1c2UgYSBrbm93biBuby1ib2R5IG1ldGhvZCBsaWtlIEdFVC5cbiAgICBpZiAobWlnaHRIYXZlQm9keSh0aGlzLm1ldGhvZCkgfHwgISFmb3VydGgpIHtcbiAgICAgIC8vIEJvZHkgaXMgdGhlIHRoaXJkIGFyZ3VtZW50LCBvcHRpb25zIGFyZSB0aGUgZm91cnRoLlxuICAgICAgdGhpcy5ib2R5ID0gdGhpcmQgIT09IHVuZGVmaW5lZCA/ICh0aGlyZCBhcyBUKSA6IG51bGw7XG4gICAgICBvcHRpb25zID0gZm91cnRoO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBObyBib2R5IHJlcXVpcmVkLCBvcHRpb25zIGFyZSB0aGUgdGhpcmQgYXJndW1lbnQuIFRoZSBib2R5IHN0YXlzIG51bGwuXG4gICAgICBvcHRpb25zID0gdGhpcmQgYXMgSHR0cFJlcXVlc3RJbml0O1xuICAgIH1cblxuICAgIC8vIElmIG9wdGlvbnMgaGF2ZSBiZWVuIHBhc3NlZCwgaW50ZXJwcmV0IHRoZW0uXG4gICAgaWYgKG9wdGlvbnMpIHtcbiAgICAgIC8vIE5vcm1hbGl6ZSByZXBvcnRQcm9ncmVzcyBhbmQgd2l0aENyZWRlbnRpYWxzLlxuICAgICAgdGhpcy5yZXBvcnRQcm9ncmVzcyA9ICEhb3B0aW9ucy5yZXBvcnRQcm9ncmVzcztcbiAgICAgIHRoaXMud2l0aENyZWRlbnRpYWxzID0gISFvcHRpb25zLndpdGhDcmVkZW50aWFscztcblxuICAgICAgLy8gT3ZlcnJpZGUgZGVmYXVsdCByZXNwb25zZSB0eXBlIG9mICdqc29uJyBpZiBvbmUgaXMgcHJvdmlkZWQuXG4gICAgICBpZiAoISFvcHRpb25zLnJlc3BvbnNlVHlwZSkge1xuICAgICAgICB0aGlzLnJlc3BvbnNlVHlwZSA9IG9wdGlvbnMucmVzcG9uc2VUeXBlO1xuICAgICAgfVxuXG4gICAgICAvLyBPdmVycmlkZSBoZWFkZXJzIGlmIHRoZXkncmUgcHJvdmlkZWQuXG4gICAgICBpZiAoISFvcHRpb25zLmhlYWRlcnMpIHtcbiAgICAgICAgdGhpcy5oZWFkZXJzID0gb3B0aW9ucy5oZWFkZXJzO1xuICAgICAgfVxuXG4gICAgICBpZiAoISFvcHRpb25zLmNvbnRleHQpIHtcbiAgICAgICAgdGhpcy5jb250ZXh0ID0gb3B0aW9ucy5jb250ZXh0O1xuICAgICAgfVxuXG4gICAgICBpZiAoISFvcHRpb25zLnBhcmFtcykge1xuICAgICAgICB0aGlzLnBhcmFtcyA9IG9wdGlvbnMucGFyYW1zO1xuICAgICAgfVxuXG4gICAgICAvLyBXZSBkbyB3YW50IHRvIGFzc2lnbiB0cmFuc2ZlckNhY2hlIGV2ZW4gaWYgaXQncyBmYWxzeSAoZmFsc2UgaXMgdmFsaWQgdmFsdWUpXG4gICAgICB0aGlzLnRyYW5zZmVyQ2FjaGUgPSBvcHRpb25zLnRyYW5zZmVyQ2FjaGU7XG4gICAgfVxuXG4gICAgLy8gSWYgbm8gaGVhZGVycyBoYXZlIGJlZW4gcGFzc2VkIGluLCBjb25zdHJ1Y3QgYSBuZXcgSHR0cEhlYWRlcnMgaW5zdGFuY2UuXG4gICAgdGhpcy5oZWFkZXJzID8/PSBuZXcgSHR0cEhlYWRlcnMoKTtcblxuICAgIC8vIElmIG5vIGNvbnRleHQgaGF2ZSBiZWVuIHBhc3NlZCBpbiwgY29uc3RydWN0IGEgbmV3IEh0dHBDb250ZXh0IGluc3RhbmNlLlxuICAgIHRoaXMuY29udGV4dCA/Pz0gbmV3IEh0dHBDb250ZXh0KCk7XG5cbiAgICAvLyBJZiBubyBwYXJhbWV0ZXJzIGhhdmUgYmVlbiBwYXNzZWQgaW4sIGNvbnN0cnVjdCBhIG5ldyBIdHRwVXJsRW5jb2RlZFBhcmFtcyBpbnN0YW5jZS5cbiAgICBpZiAoIXRoaXMucGFyYW1zKSB7XG4gICAgICB0aGlzLnBhcmFtcyA9IG5ldyBIdHRwUGFyYW1zKCk7XG4gICAgICB0aGlzLnVybFdpdGhQYXJhbXMgPSB1cmw7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEVuY29kZSB0aGUgcGFyYW1ldGVycyB0byBhIHN0cmluZyBpbiBwcmVwYXJhdGlvbiBmb3IgaW5jbHVzaW9uIGluIHRoZSBVUkwuXG4gICAgICBjb25zdCBwYXJhbXMgPSB0aGlzLnBhcmFtcy50b1N0cmluZygpO1xuICAgICAgaWYgKHBhcmFtcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgLy8gTm8gcGFyYW1ldGVycywgdGhlIHZpc2libGUgVVJMIGlzIGp1c3QgdGhlIFVSTCBnaXZlbiBhdCBjcmVhdGlvbiB0aW1lLlxuICAgICAgICB0aGlzLnVybFdpdGhQYXJhbXMgPSB1cmw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBEb2VzIHRoZSBVUkwgYWxyZWFkeSBoYXZlIHF1ZXJ5IHBhcmFtZXRlcnM/IExvb2sgZm9yICc/Jy5cbiAgICAgICAgY29uc3QgcUlkeCA9IHVybC5pbmRleE9mKCc/Jyk7XG4gICAgICAgIC8vIFRoZXJlIGFyZSAzIGNhc2VzIHRvIGhhbmRsZTpcbiAgICAgICAgLy8gMSkgTm8gZXhpc3RpbmcgcGFyYW1ldGVycyAtPiBhcHBlbmQgJz8nIGZvbGxvd2VkIGJ5IHBhcmFtcy5cbiAgICAgICAgLy8gMikgJz8nIGV4aXN0cyBhbmQgaXMgZm9sbG93ZWQgYnkgZXhpc3RpbmcgcXVlcnkgc3RyaW5nIC0+XG4gICAgICAgIC8vICAgIGFwcGVuZCAnJicgZm9sbG93ZWQgYnkgcGFyYW1zLlxuICAgICAgICAvLyAzKSAnPycgZXhpc3RzIGF0IHRoZSBlbmQgb2YgdGhlIHVybCAtPiBhcHBlbmQgcGFyYW1zIGRpcmVjdGx5LlxuICAgICAgICAvLyBUaGlzIGJhc2ljYWxseSBhbW91bnRzIHRvIGRldGVybWluaW5nIHRoZSBjaGFyYWN0ZXIsIGlmIGFueSwgd2l0aFxuICAgICAgICAvLyB3aGljaCB0byBqb2luIHRoZSBVUkwgYW5kIHBhcmFtZXRlcnMuXG4gICAgICAgIGNvbnN0IHNlcDogc3RyaW5nID0gcUlkeCA9PT0gLTEgPyAnPycgOiBxSWR4IDwgdXJsLmxlbmd0aCAtIDEgPyAnJicgOiAnJztcbiAgICAgICAgdGhpcy51cmxXaXRoUGFyYW1zID0gdXJsICsgc2VwICsgcGFyYW1zO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUcmFuc2Zvcm0gdGhlIGZyZWUtZm9ybSBib2R5IGludG8gYSBzZXJpYWxpemVkIGZvcm1hdCBzdWl0YWJsZSBmb3JcbiAgICogdHJhbnNtaXNzaW9uIHRvIHRoZSBzZXJ2ZXIuXG4gICAqL1xuICBzZXJpYWxpemVCb2R5KCk6IEFycmF5QnVmZmVyIHwgQmxvYiB8IEZvcm1EYXRhIHwgVVJMU2VhcmNoUGFyYW1zIHwgc3RyaW5nIHwgbnVsbCB7XG4gICAgLy8gSWYgbm8gYm9keSBpcyBwcmVzZW50LCBubyBuZWVkIHRvIHNlcmlhbGl6ZSBpdC5cbiAgICBpZiAodGhpcy5ib2R5ID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgLy8gQ2hlY2sgd2hldGhlciB0aGUgYm9keSBpcyBhbHJlYWR5IGluIGEgc2VyaWFsaXplZCBmb3JtLiBJZiBzbyxcbiAgICAvLyBpdCBjYW4ganVzdCBiZSByZXR1cm5lZCBkaXJlY3RseS5cbiAgICBpZiAoXG4gICAgICB0eXBlb2YgdGhpcy5ib2R5ID09PSAnc3RyaW5nJyB8fFxuICAgICAgaXNBcnJheUJ1ZmZlcih0aGlzLmJvZHkpIHx8XG4gICAgICBpc0Jsb2IodGhpcy5ib2R5KSB8fFxuICAgICAgaXNGb3JtRGF0YSh0aGlzLmJvZHkpIHx8XG4gICAgICBpc1VybFNlYXJjaFBhcmFtcyh0aGlzLmJvZHkpXG4gICAgKSB7XG4gICAgICByZXR1cm4gdGhpcy5ib2R5O1xuICAgIH1cbiAgICAvLyBDaGVjayB3aGV0aGVyIHRoZSBib2R5IGlzIGFuIGluc3RhbmNlIG9mIEh0dHBVcmxFbmNvZGVkUGFyYW1zLlxuICAgIGlmICh0aGlzLmJvZHkgaW5zdGFuY2VvZiBIdHRwUGFyYW1zKSB7XG4gICAgICByZXR1cm4gdGhpcy5ib2R5LnRvU3RyaW5nKCk7XG4gICAgfVxuICAgIC8vIENoZWNrIHdoZXRoZXIgdGhlIGJvZHkgaXMgYW4gb2JqZWN0IG9yIGFycmF5LCBhbmQgc2VyaWFsaXplIHdpdGggSlNPTiBpZiBzby5cbiAgICBpZiAoXG4gICAgICB0eXBlb2YgdGhpcy5ib2R5ID09PSAnb2JqZWN0JyB8fFxuICAgICAgdHlwZW9mIHRoaXMuYm9keSA9PT0gJ2Jvb2xlYW4nIHx8XG4gICAgICBBcnJheS5pc0FycmF5KHRoaXMuYm9keSlcbiAgICApIHtcbiAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh0aGlzLmJvZHkpO1xuICAgIH1cbiAgICAvLyBGYWxsIGJhY2sgb24gdG9TdHJpbmcoKSBmb3IgZXZlcnl0aGluZyBlbHNlLlxuICAgIHJldHVybiAodGhpcy5ib2R5IGFzIGFueSkudG9TdHJpbmcoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFeGFtaW5lIHRoZSBib2R5IGFuZCBhdHRlbXB0IHRvIGluZmVyIGFuIGFwcHJvcHJpYXRlIE1JTUUgdHlwZVxuICAgKiBmb3IgaXQuXG4gICAqXG4gICAqIElmIG5vIHN1Y2ggdHlwZSBjYW4gYmUgaW5mZXJyZWQsIHRoaXMgbWV0aG9kIHdpbGwgcmV0dXJuIGBudWxsYC5cbiAgICovXG4gIGRldGVjdENvbnRlbnRUeXBlSGVhZGVyKCk6IHN0cmluZyB8IG51bGwge1xuICAgIC8vIEFuIGVtcHR5IGJvZHkgaGFzIG5vIGNvbnRlbnQgdHlwZS5cbiAgICBpZiAodGhpcy5ib2R5ID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgLy8gRm9ybURhdGEgYm9kaWVzIHJlbHkgb24gdGhlIGJyb3dzZXIncyBjb250ZW50IHR5cGUgYXNzaWdubWVudC5cbiAgICBpZiAoaXNGb3JtRGF0YSh0aGlzLmJvZHkpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgLy8gQmxvYnMgdXN1YWxseSBoYXZlIHRoZWlyIG93biBjb250ZW50IHR5cGUuIElmIGl0IGRvZXNuJ3QsIHRoZW5cbiAgICAvLyBubyB0eXBlIGNhbiBiZSBpbmZlcnJlZC5cbiAgICBpZiAoaXNCbG9iKHRoaXMuYm9keSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmJvZHkudHlwZSB8fCBudWxsO1xuICAgIH1cbiAgICAvLyBBcnJheSBidWZmZXJzIGhhdmUgdW5rbm93biBjb250ZW50cyBhbmQgdGh1cyBubyB0eXBlIGNhbiBiZSBpbmZlcnJlZC5cbiAgICBpZiAoaXNBcnJheUJ1ZmZlcih0aGlzLmJvZHkpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgLy8gVGVjaG5pY2FsbHksIHN0cmluZ3MgY291bGQgYmUgYSBmb3JtIG9mIEpTT04gZGF0YSwgYnV0IGl0J3Mgc2FmZSBlbm91Z2hcbiAgICAvLyB0byBhc3N1bWUgdGhleSdyZSBwbGFpbiBzdHJpbmdzLlxuICAgIGlmICh0eXBlb2YgdGhpcy5ib2R5ID09PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuICd0ZXh0L3BsYWluJztcbiAgICB9XG4gICAgLy8gYEh0dHBVcmxFbmNvZGVkUGFyYW1zYCBoYXMgaXRzIG93biBjb250ZW50LXR5cGUuXG4gICAgaWYgKHRoaXMuYm9keSBpbnN0YW5jZW9mIEh0dHBQYXJhbXMpIHtcbiAgICAgIHJldHVybiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkO2NoYXJzZXQ9VVRGLTgnO1xuICAgIH1cbiAgICAvLyBBcnJheXMsIG9iamVjdHMsIGJvb2xlYW4gYW5kIG51bWJlcnMgd2lsbCBiZSBlbmNvZGVkIGFzIEpTT04uXG4gICAgaWYgKFxuICAgICAgdHlwZW9mIHRoaXMuYm9keSA9PT0gJ29iamVjdCcgfHxcbiAgICAgIHR5cGVvZiB0aGlzLmJvZHkgPT09ICdudW1iZXInIHx8XG4gICAgICB0eXBlb2YgdGhpcy5ib2R5ID09PSAnYm9vbGVhbidcbiAgICApIHtcbiAgICAgIHJldHVybiAnYXBwbGljYXRpb24vanNvbic7XG4gICAgfVxuICAgIC8vIE5vIHR5cGUgY291bGQgYmUgaW5mZXJyZWQuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBjbG9uZSgpOiBIdHRwUmVxdWVzdDxUPjtcbiAgY2xvbmUodXBkYXRlOiB7XG4gICAgaGVhZGVycz86IEh0dHBIZWFkZXJzO1xuICAgIGNvbnRleHQ/OiBIdHRwQ29udGV4dDtcbiAgICByZXBvcnRQcm9ncmVzcz86IGJvb2xlYW47XG4gICAgcGFyYW1zPzogSHR0cFBhcmFtcztcbiAgICByZXNwb25zZVR5cGU/OiAnYXJyYXlidWZmZXInIHwgJ2Jsb2InIHwgJ2pzb24nIHwgJ3RleHQnO1xuICAgIHdpdGhDcmVkZW50aWFscz86IGJvb2xlYW47XG4gICAgdHJhbnNmZXJDYWNoZT86IHtpbmNsdWRlSGVhZGVycz86IHN0cmluZ1tdfSB8IGJvb2xlYW47XG4gICAgYm9keT86IFQgfCBudWxsO1xuICAgIG1ldGhvZD86IHN0cmluZztcbiAgICB1cmw/OiBzdHJpbmc7XG4gICAgc2V0SGVhZGVycz86IHtbbmFtZTogc3RyaW5nXTogc3RyaW5nIHwgc3RyaW5nW119O1xuICAgIHNldFBhcmFtcz86IHtbcGFyYW06IHN0cmluZ106IHN0cmluZ307XG4gIH0pOiBIdHRwUmVxdWVzdDxUPjtcbiAgY2xvbmU8Vj4odXBkYXRlOiB7XG4gICAgaGVhZGVycz86IEh0dHBIZWFkZXJzO1xuICAgIGNvbnRleHQ/OiBIdHRwQ29udGV4dDtcbiAgICByZXBvcnRQcm9ncmVzcz86IGJvb2xlYW47XG4gICAgcGFyYW1zPzogSHR0cFBhcmFtcztcbiAgICByZXNwb25zZVR5cGU/OiAnYXJyYXlidWZmZXInIHwgJ2Jsb2InIHwgJ2pzb24nIHwgJ3RleHQnO1xuICAgIHdpdGhDcmVkZW50aWFscz86IGJvb2xlYW47XG4gICAgdHJhbnNmZXJDYWNoZT86IHtpbmNsdWRlSGVhZGVycz86IHN0cmluZ1tdfSB8IGJvb2xlYW47XG4gICAgYm9keT86IFYgfCBudWxsO1xuICAgIG1ldGhvZD86IHN0cmluZztcbiAgICB1cmw/OiBzdHJpbmc7XG4gICAgc2V0SGVhZGVycz86IHtbbmFtZTogc3RyaW5nXTogc3RyaW5nIHwgc3RyaW5nW119O1xuICAgIHNldFBhcmFtcz86IHtbcGFyYW06IHN0cmluZ106IHN0cmluZ307XG4gIH0pOiBIdHRwUmVxdWVzdDxWPjtcbiAgY2xvbmUoXG4gICAgdXBkYXRlOiB7XG4gICAgICBoZWFkZXJzPzogSHR0cEhlYWRlcnM7XG4gICAgICBjb250ZXh0PzogSHR0cENvbnRleHQ7XG4gICAgICByZXBvcnRQcm9ncmVzcz86IGJvb2xlYW47XG4gICAgICBwYXJhbXM/OiBIdHRwUGFyYW1zO1xuICAgICAgcmVzcG9uc2VUeXBlPzogJ2FycmF5YnVmZmVyJyB8ICdibG9iJyB8ICdqc29uJyB8ICd0ZXh0JztcbiAgICAgIHdpdGhDcmVkZW50aWFscz86IGJvb2xlYW47XG4gICAgICB0cmFuc2ZlckNhY2hlPzoge2luY2x1ZGVIZWFkZXJzPzogc3RyaW5nW119IHwgYm9vbGVhbjtcbiAgICAgIGJvZHk/OiBhbnkgfCBudWxsO1xuICAgICAgbWV0aG9kPzogc3RyaW5nO1xuICAgICAgdXJsPzogc3RyaW5nO1xuICAgICAgc2V0SGVhZGVycz86IHtbbmFtZTogc3RyaW5nXTogc3RyaW5nIHwgc3RyaW5nW119O1xuICAgICAgc2V0UGFyYW1zPzoge1twYXJhbTogc3RyaW5nXTogc3RyaW5nfTtcbiAgICB9ID0ge30sXG4gICk6IEh0dHBSZXF1ZXN0PGFueT4ge1xuICAgIC8vIEZvciBtZXRob2QsIHVybCwgYW5kIHJlc3BvbnNlVHlwZSwgdGFrZSB0aGUgY3VycmVudCB2YWx1ZSB1bmxlc3NcbiAgICAvLyBpdCBpcyBvdmVycmlkZGVuIGluIHRoZSB1cGRhdGUgaGFzaC5cbiAgICBjb25zdCBtZXRob2QgPSB1cGRhdGUubWV0aG9kIHx8IHRoaXMubWV0aG9kO1xuICAgIGNvbnN0IHVybCA9IHVwZGF0ZS51cmwgfHwgdGhpcy51cmw7XG4gICAgY29uc3QgcmVzcG9uc2VUeXBlID0gdXBkYXRlLnJlc3BvbnNlVHlwZSB8fCB0aGlzLnJlc3BvbnNlVHlwZTtcblxuICAgIC8vIENhcmVmdWxseSBoYW5kbGUgdGhlIHRyYW5zZmVyQ2FjaGUgdG8gZGlmZmVyZW50aWF0ZSBiZXR3ZWVuXG4gICAgLy8gYGZhbHNlYCBhbmQgYHVuZGVmaW5lZGAgaW4gdGhlIHVwZGF0ZSBhcmdzLlxuICAgIGNvbnN0IHRyYW5zZmVyQ2FjaGUgPSB1cGRhdGUudHJhbnNmZXJDYWNoZSA/PyB0aGlzLnRyYW5zZmVyQ2FjaGU7XG5cbiAgICAvLyBUaGUgYm9keSBpcyBzb21ld2hhdCBzcGVjaWFsIC0gYSBgbnVsbGAgdmFsdWUgaW4gdXBkYXRlLmJvZHkgbWVhbnNcbiAgICAvLyB3aGF0ZXZlciBjdXJyZW50IGJvZHkgaXMgcHJlc2VudCBpcyBiZWluZyBvdmVycmlkZGVuIHdpdGggYW4gZW1wdHlcbiAgICAvLyBib2R5LCB3aGVyZWFzIGFuIGB1bmRlZmluZWRgIHZhbHVlIGluIHVwZGF0ZS5ib2R5IGltcGxpZXMgbm9cbiAgICAvLyBvdmVycmlkZS5cbiAgICBjb25zdCBib2R5ID0gdXBkYXRlLmJvZHkgIT09IHVuZGVmaW5lZCA/IHVwZGF0ZS5ib2R5IDogdGhpcy5ib2R5O1xuXG4gICAgLy8gQ2FyZWZ1bGx5IGhhbmRsZSB0aGUgYm9vbGVhbiBvcHRpb25zIHRvIGRpZmZlcmVudGlhdGUgYmV0d2VlblxuICAgIC8vIGBmYWxzZWAgYW5kIGB1bmRlZmluZWRgIGluIHRoZSB1cGRhdGUgYXJncy5cbiAgICBjb25zdCB3aXRoQ3JlZGVudGlhbHMgPSB1cGRhdGUud2l0aENyZWRlbnRpYWxzID8/IHRoaXMud2l0aENyZWRlbnRpYWxzO1xuICAgIGNvbnN0IHJlcG9ydFByb2dyZXNzID0gdXBkYXRlLnJlcG9ydFByb2dyZXNzID8/IHRoaXMucmVwb3J0UHJvZ3Jlc3M7XG5cbiAgICAvLyBIZWFkZXJzIGFuZCBwYXJhbXMgbWF5IGJlIGFwcGVuZGVkIHRvIGlmIGBzZXRIZWFkZXJzYCBvclxuICAgIC8vIGBzZXRQYXJhbXNgIGFyZSB1c2VkLlxuICAgIGxldCBoZWFkZXJzID0gdXBkYXRlLmhlYWRlcnMgfHwgdGhpcy5oZWFkZXJzO1xuICAgIGxldCBwYXJhbXMgPSB1cGRhdGUucGFyYW1zIHx8IHRoaXMucGFyYW1zO1xuXG4gICAgLy8gUGFzcyBvbiBjb250ZXh0IGlmIG5lZWRlZFxuICAgIGNvbnN0IGNvbnRleHQgPSB1cGRhdGUuY29udGV4dCA/PyB0aGlzLmNvbnRleHQ7XG5cbiAgICAvLyBDaGVjayB3aGV0aGVyIHRoZSBjYWxsZXIgaGFzIGFza2VkIHRvIGFkZCBoZWFkZXJzLlxuICAgIGlmICh1cGRhdGUuc2V0SGVhZGVycyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAvLyBTZXQgZXZlcnkgcmVxdWVzdGVkIGhlYWRlci5cbiAgICAgIGhlYWRlcnMgPSBPYmplY3Qua2V5cyh1cGRhdGUuc2V0SGVhZGVycykucmVkdWNlKFxuICAgICAgICAoaGVhZGVycywgbmFtZSkgPT4gaGVhZGVycy5zZXQobmFtZSwgdXBkYXRlLnNldEhlYWRlcnMhW25hbWVdKSxcbiAgICAgICAgaGVhZGVycyxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgd2hldGhlciB0aGUgY2FsbGVyIGhhcyBhc2tlZCB0byBzZXQgcGFyYW1zLlxuICAgIGlmICh1cGRhdGUuc2V0UGFyYW1zKSB7XG4gICAgICAvLyBTZXQgZXZlcnkgcmVxdWVzdGVkIHBhcmFtLlxuICAgICAgcGFyYW1zID0gT2JqZWN0LmtleXModXBkYXRlLnNldFBhcmFtcykucmVkdWNlKFxuICAgICAgICAocGFyYW1zLCBwYXJhbSkgPT4gcGFyYW1zLnNldChwYXJhbSwgdXBkYXRlLnNldFBhcmFtcyFbcGFyYW1dKSxcbiAgICAgICAgcGFyYW1zLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBGaW5hbGx5LCBjb25zdHJ1Y3QgdGhlIG5ldyBIdHRwUmVxdWVzdCB1c2luZyB0aGUgcGllY2VzIGZyb20gYWJvdmUuXG4gICAgcmV0dXJuIG5ldyBIdHRwUmVxdWVzdChtZXRob2QsIHVybCwgYm9keSwge1xuICAgICAgcGFyYW1zLFxuICAgICAgaGVhZGVycyxcbiAgICAgIGNvbnRleHQsXG4gICAgICByZXBvcnRQcm9ncmVzcyxcbiAgICAgIHJlc3BvbnNlVHlwZSxcbiAgICAgIHdpdGhDcmVkZW50aWFscyxcbiAgICAgIHRyYW5zZmVyQ2FjaGUsXG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==