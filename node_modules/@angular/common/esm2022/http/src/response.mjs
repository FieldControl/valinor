/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { HttpHeaders } from './headers';
/**
 * Type enumeration for the different kinds of `HttpEvent`.
 *
 * @publicApi
 */
export var HttpEventType;
(function (HttpEventType) {
    /**
     * The request was sent out over the wire.
     */
    HttpEventType[HttpEventType["Sent"] = 0] = "Sent";
    /**
     * An upload progress event was received.
     *
     * Note: The `FetchBackend` doesn't support progress report on uploads.
     */
    HttpEventType[HttpEventType["UploadProgress"] = 1] = "UploadProgress";
    /**
     * The response status code and headers were received.
     */
    HttpEventType[HttpEventType["ResponseHeader"] = 2] = "ResponseHeader";
    /**
     * A download progress event was received.
     */
    HttpEventType[HttpEventType["DownloadProgress"] = 3] = "DownloadProgress";
    /**
     * The full response including the body was received.
     */
    HttpEventType[HttpEventType["Response"] = 4] = "Response";
    /**
     * A custom event from an interceptor or a backend.
     */
    HttpEventType[HttpEventType["User"] = 5] = "User";
})(HttpEventType || (HttpEventType = {}));
/**
 * Base class for both `HttpResponse` and `HttpHeaderResponse`.
 *
 * @publicApi
 */
export class HttpResponseBase {
    /**
     * Super-constructor for all responses.
     *
     * The single parameter accepted is an initialization hash. Any properties
     * of the response passed there will override the default values.
     */
    constructor(init, defaultStatus = 200, defaultStatusText = 'OK') {
        // If the hash has values passed, use them to initialize the response.
        // Otherwise use the default values.
        this.headers = init.headers || new HttpHeaders();
        this.status = init.status !== undefined ? init.status : defaultStatus;
        this.statusText = init.statusText || defaultStatusText;
        this.url = init.url || null;
        // Cache the ok value to avoid defining a getter.
        this.ok = this.status >= 200 && this.status < 300;
    }
}
/**
 * A partial HTTP response which only includes the status and header data,
 * but no response body.
 *
 * `HttpHeaderResponse` is a `HttpEvent` available on the response
 * event stream, only when progress events are requested.
 *
 * @publicApi
 */
export class HttpHeaderResponse extends HttpResponseBase {
    /**
     * Create a new `HttpHeaderResponse` with the given parameters.
     */
    constructor(init = {}) {
        super(init);
        this.type = HttpEventType.ResponseHeader;
    }
    /**
     * Copy this `HttpHeaderResponse`, overriding its contents with the
     * given parameter hash.
     */
    clone(update = {}) {
        // Perform a straightforward initialization of the new HttpHeaderResponse,
        // overriding the current parameters with new ones if given.
        return new HttpHeaderResponse({
            headers: update.headers || this.headers,
            status: update.status !== undefined ? update.status : this.status,
            statusText: update.statusText || this.statusText,
            url: update.url || this.url || undefined,
        });
    }
}
/**
 * A full HTTP response, including a typed response body (which may be `null`
 * if one was not returned).
 *
 * `HttpResponse` is a `HttpEvent` available on the response event
 * stream.
 *
 * @publicApi
 */
export class HttpResponse extends HttpResponseBase {
    /**
     * Construct a new `HttpResponse`.
     */
    constructor(init = {}) {
        super(init);
        this.type = HttpEventType.Response;
        this.body = init.body !== undefined ? init.body : null;
    }
    clone(update = {}) {
        return new HttpResponse({
            body: update.body !== undefined ? update.body : this.body,
            headers: update.headers || this.headers,
            status: update.status !== undefined ? update.status : this.status,
            statusText: update.statusText || this.statusText,
            url: update.url || this.url || undefined,
        });
    }
}
/**
 * A response that represents an error or failure, either from a
 * non-successful HTTP status, an error while executing the request,
 * or some other failure which occurred during the parsing of the response.
 *
 * Any error returned on the `Observable` response stream will be
 * wrapped in an `HttpErrorResponse` to provide additional context about
 * the state of the HTTP layer when the error occurred. The error property
 * will contain either a wrapped Error object or the error response returned
 * from the server.
 *
 * @publicApi
 */
export class HttpErrorResponse extends HttpResponseBase {
    constructor(init) {
        // Initialize with a default status of 0 / Unknown Error.
        super(init, 0, 'Unknown Error');
        this.name = 'HttpErrorResponse';
        /**
         * Errors are never okay, even when the status code is in the 2xx success range.
         */
        this.ok = false;
        // If the response was successful, then this was a parse error. Otherwise, it was
        // a protocol-level failure of some sort. Either the request failed in transit
        // or the server returned an unsuccessful status code.
        if (this.status >= 200 && this.status < 300) {
            this.message = `Http failure during parsing for ${init.url || '(unknown url)'}`;
        }
        else {
            this.message = `Http failure response for ${init.url || '(unknown url)'}: ${init.status} ${init.statusText}`;
        }
        this.error = init.error || null;
    }
}
/**
 * We use these constant to prevent pulling the whole HttpStatusCode enum
 * Those are the only ones referenced directly by the framework
 */
export const HTTP_STATUS_CODE_OK = 200;
export const HTTP_STATUS_CODE_NO_CONTENT = 204;
/**
 * Http status codes.
 * As per https://www.iana.org/assignments/http-status-codes/http-status-codes.xhtml
 * @publicApi
 */
export var HttpStatusCode;
(function (HttpStatusCode) {
    HttpStatusCode[HttpStatusCode["Continue"] = 100] = "Continue";
    HttpStatusCode[HttpStatusCode["SwitchingProtocols"] = 101] = "SwitchingProtocols";
    HttpStatusCode[HttpStatusCode["Processing"] = 102] = "Processing";
    HttpStatusCode[HttpStatusCode["EarlyHints"] = 103] = "EarlyHints";
    HttpStatusCode[HttpStatusCode["Ok"] = 200] = "Ok";
    HttpStatusCode[HttpStatusCode["Created"] = 201] = "Created";
    HttpStatusCode[HttpStatusCode["Accepted"] = 202] = "Accepted";
    HttpStatusCode[HttpStatusCode["NonAuthoritativeInformation"] = 203] = "NonAuthoritativeInformation";
    HttpStatusCode[HttpStatusCode["NoContent"] = 204] = "NoContent";
    HttpStatusCode[HttpStatusCode["ResetContent"] = 205] = "ResetContent";
    HttpStatusCode[HttpStatusCode["PartialContent"] = 206] = "PartialContent";
    HttpStatusCode[HttpStatusCode["MultiStatus"] = 207] = "MultiStatus";
    HttpStatusCode[HttpStatusCode["AlreadyReported"] = 208] = "AlreadyReported";
    HttpStatusCode[HttpStatusCode["ImUsed"] = 226] = "ImUsed";
    HttpStatusCode[HttpStatusCode["MultipleChoices"] = 300] = "MultipleChoices";
    HttpStatusCode[HttpStatusCode["MovedPermanently"] = 301] = "MovedPermanently";
    HttpStatusCode[HttpStatusCode["Found"] = 302] = "Found";
    HttpStatusCode[HttpStatusCode["SeeOther"] = 303] = "SeeOther";
    HttpStatusCode[HttpStatusCode["NotModified"] = 304] = "NotModified";
    HttpStatusCode[HttpStatusCode["UseProxy"] = 305] = "UseProxy";
    HttpStatusCode[HttpStatusCode["Unused"] = 306] = "Unused";
    HttpStatusCode[HttpStatusCode["TemporaryRedirect"] = 307] = "TemporaryRedirect";
    HttpStatusCode[HttpStatusCode["PermanentRedirect"] = 308] = "PermanentRedirect";
    HttpStatusCode[HttpStatusCode["BadRequest"] = 400] = "BadRequest";
    HttpStatusCode[HttpStatusCode["Unauthorized"] = 401] = "Unauthorized";
    HttpStatusCode[HttpStatusCode["PaymentRequired"] = 402] = "PaymentRequired";
    HttpStatusCode[HttpStatusCode["Forbidden"] = 403] = "Forbidden";
    HttpStatusCode[HttpStatusCode["NotFound"] = 404] = "NotFound";
    HttpStatusCode[HttpStatusCode["MethodNotAllowed"] = 405] = "MethodNotAllowed";
    HttpStatusCode[HttpStatusCode["NotAcceptable"] = 406] = "NotAcceptable";
    HttpStatusCode[HttpStatusCode["ProxyAuthenticationRequired"] = 407] = "ProxyAuthenticationRequired";
    HttpStatusCode[HttpStatusCode["RequestTimeout"] = 408] = "RequestTimeout";
    HttpStatusCode[HttpStatusCode["Conflict"] = 409] = "Conflict";
    HttpStatusCode[HttpStatusCode["Gone"] = 410] = "Gone";
    HttpStatusCode[HttpStatusCode["LengthRequired"] = 411] = "LengthRequired";
    HttpStatusCode[HttpStatusCode["PreconditionFailed"] = 412] = "PreconditionFailed";
    HttpStatusCode[HttpStatusCode["PayloadTooLarge"] = 413] = "PayloadTooLarge";
    HttpStatusCode[HttpStatusCode["UriTooLong"] = 414] = "UriTooLong";
    HttpStatusCode[HttpStatusCode["UnsupportedMediaType"] = 415] = "UnsupportedMediaType";
    HttpStatusCode[HttpStatusCode["RangeNotSatisfiable"] = 416] = "RangeNotSatisfiable";
    HttpStatusCode[HttpStatusCode["ExpectationFailed"] = 417] = "ExpectationFailed";
    HttpStatusCode[HttpStatusCode["ImATeapot"] = 418] = "ImATeapot";
    HttpStatusCode[HttpStatusCode["MisdirectedRequest"] = 421] = "MisdirectedRequest";
    HttpStatusCode[HttpStatusCode["UnprocessableEntity"] = 422] = "UnprocessableEntity";
    HttpStatusCode[HttpStatusCode["Locked"] = 423] = "Locked";
    HttpStatusCode[HttpStatusCode["FailedDependency"] = 424] = "FailedDependency";
    HttpStatusCode[HttpStatusCode["TooEarly"] = 425] = "TooEarly";
    HttpStatusCode[HttpStatusCode["UpgradeRequired"] = 426] = "UpgradeRequired";
    HttpStatusCode[HttpStatusCode["PreconditionRequired"] = 428] = "PreconditionRequired";
    HttpStatusCode[HttpStatusCode["TooManyRequests"] = 429] = "TooManyRequests";
    HttpStatusCode[HttpStatusCode["RequestHeaderFieldsTooLarge"] = 431] = "RequestHeaderFieldsTooLarge";
    HttpStatusCode[HttpStatusCode["UnavailableForLegalReasons"] = 451] = "UnavailableForLegalReasons";
    HttpStatusCode[HttpStatusCode["InternalServerError"] = 500] = "InternalServerError";
    HttpStatusCode[HttpStatusCode["NotImplemented"] = 501] = "NotImplemented";
    HttpStatusCode[HttpStatusCode["BadGateway"] = 502] = "BadGateway";
    HttpStatusCode[HttpStatusCode["ServiceUnavailable"] = 503] = "ServiceUnavailable";
    HttpStatusCode[HttpStatusCode["GatewayTimeout"] = 504] = "GatewayTimeout";
    HttpStatusCode[HttpStatusCode["HttpVersionNotSupported"] = 505] = "HttpVersionNotSupported";
    HttpStatusCode[HttpStatusCode["VariantAlsoNegotiates"] = 506] = "VariantAlsoNegotiates";
    HttpStatusCode[HttpStatusCode["InsufficientStorage"] = 507] = "InsufficientStorage";
    HttpStatusCode[HttpStatusCode["LoopDetected"] = 508] = "LoopDetected";
    HttpStatusCode[HttpStatusCode["NotExtended"] = 510] = "NotExtended";
    HttpStatusCode[HttpStatusCode["NetworkAuthenticationRequired"] = 511] = "NetworkAuthenticationRequired";
})(HttpStatusCode || (HttpStatusCode = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzcG9uc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vaHR0cC9zcmMvcmVzcG9uc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUV0Qzs7OztHQUlHO0FBQ0gsTUFBTSxDQUFOLElBQVksYUFnQ1g7QUFoQ0QsV0FBWSxhQUFhO0lBQ3ZCOztPQUVHO0lBQ0gsaURBQUksQ0FBQTtJQUVKOzs7O09BSUc7SUFDSCxxRUFBYyxDQUFBO0lBRWQ7O09BRUc7SUFDSCxxRUFBYyxDQUFBO0lBRWQ7O09BRUc7SUFDSCx5RUFBZ0IsQ0FBQTtJQUVoQjs7T0FFRztJQUNILHlEQUFRLENBQUE7SUFFUjs7T0FFRztJQUNILGlEQUFJLENBQUE7QUFDTixDQUFDLEVBaENXLGFBQWEsS0FBYixhQUFhLFFBZ0N4QjtBQXNHRDs7OztHQUlHO0FBQ0gsTUFBTSxPQUFnQixnQkFBZ0I7SUFrQ3BDOzs7OztPQUtHO0lBQ0gsWUFDRSxJQUtDLEVBQ0QsZ0JBQXdCLEdBQUcsRUFDM0Isb0JBQTRCLElBQUk7UUFFaEMsc0VBQXNFO1FBQ3RFLG9DQUFvQztRQUNwQyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxXQUFXLEVBQUUsQ0FBQztRQUNqRCxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUM7UUFDdEUsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxJQUFJLGlCQUFpQixDQUFDO1FBQ3ZELElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUM7UUFFNUIsaURBQWlEO1FBQ2pELElBQUks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QTtJQUNwQixpRkFBd0IsQ0FBQTtJQUN4QiwyRUFBcUIsQ0FBQTtJQUNyQixpRUFBZ0IsQ0FBQTtJQUNoQixxRkFBMEIsQ0FBQTtJQUMxQixtRkFBeUIsQ0FBQTtJQUN6QiwrRUFBdUIsQ0FBQTtJQUN2QiwrREFBZSxDQUFBO0lBQ2YsaUZBQXdCLENBQUE7SUFDeEIsbUZBQXlCLENBQUE7SUFDekIseURBQVksQ0FBQTtJQUNaLDZFQUFzQixDQUFBO0lBQ3RCLDZEQUFjLENBQUE7SUFDZCwyRUFBcUIsQ0FBQTtJQUNyQixxRkFBMEIsQ0FBQTtJQUMxQiwyRUFBcUIsQ0FBQTtJQUNyQixtR0FBaUMsQ0FBQTtJQUNqQyxpR0FBZ0MsQ0FBQTtJQUVoQyxtRkFBeUIsQ0FBQTtJQUN6Qix5RUFBb0IsQ0FBQTtJQUNwQixpRUFBZ0IsQ0FBQTtJQUNoQixpRkFBd0IsQ0FBQTtJQUN4Qix5RUFBb0IsQ0FBQTtJQUNwQiwyRkFBNkIsQ0FBQTtJQUM3Qix1RkFBMkIsQ0FBQTtJQUMzQixtRkFBeUIsQ0FBQTtJQUN6QixxRUFBa0IsQ0FBQTtJQUNsQixtRUFBaUIsQ0FBQTtJQUNqQix1R0FBbUMsQ0FBQTtBQUNyQyxDQUFDLEVBcEVXLGNBQWMsS0FBZCxjQUFjLFFBb0V6QiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtIdHRwSGVhZGVyc30gZnJvbSAnLi9oZWFkZXJzJztcblxuLyoqXG4gKiBUeXBlIGVudW1lcmF0aW9uIGZvciB0aGUgZGlmZmVyZW50IGtpbmRzIG9mIGBIdHRwRXZlbnRgLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGVudW0gSHR0cEV2ZW50VHlwZSB7XG4gIC8qKlxuICAgKiBUaGUgcmVxdWVzdCB3YXMgc2VudCBvdXQgb3ZlciB0aGUgd2lyZS5cbiAgICovXG4gIFNlbnQsXG5cbiAgLyoqXG4gICAqIEFuIHVwbG9hZCBwcm9ncmVzcyBldmVudCB3YXMgcmVjZWl2ZWQuXG4gICAqXG4gICAqIE5vdGU6IFRoZSBgRmV0Y2hCYWNrZW5kYCBkb2Vzbid0IHN1cHBvcnQgcHJvZ3Jlc3MgcmVwb3J0IG9uIHVwbG9hZHMuXG4gICAqL1xuICBVcGxvYWRQcm9ncmVzcyxcblxuICAvKipcbiAgICogVGhlIHJlc3BvbnNlIHN0YXR1cyBjb2RlIGFuZCBoZWFkZXJzIHdlcmUgcmVjZWl2ZWQuXG4gICAqL1xuICBSZXNwb25zZUhlYWRlcixcblxuICAvKipcbiAgICogQSBkb3dubG9hZCBwcm9ncmVzcyBldmVudCB3YXMgcmVjZWl2ZWQuXG4gICAqL1xuICBEb3dubG9hZFByb2dyZXNzLFxuXG4gIC8qKlxuICAgKiBUaGUgZnVsbCByZXNwb25zZSBpbmNsdWRpbmcgdGhlIGJvZHkgd2FzIHJlY2VpdmVkLlxuICAgKi9cbiAgUmVzcG9uc2UsXG5cbiAgLyoqXG4gICAqIEEgY3VzdG9tIGV2ZW50IGZyb20gYW4gaW50ZXJjZXB0b3Igb3IgYSBiYWNrZW5kLlxuICAgKi9cbiAgVXNlcixcbn1cblxuLyoqXG4gKiBCYXNlIGludGVyZmFjZSBmb3IgcHJvZ3Jlc3MgZXZlbnRzLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBIdHRwUHJvZ3Jlc3NFdmVudCB7XG4gIC8qKlxuICAgKiBQcm9ncmVzcyBldmVudCB0eXBlIGlzIGVpdGhlciB1cGxvYWQgb3IgZG93bmxvYWQuXG4gICAqL1xuICB0eXBlOiBIdHRwRXZlbnRUeXBlLkRvd25sb2FkUHJvZ3Jlc3MgfCBIdHRwRXZlbnRUeXBlLlVwbG9hZFByb2dyZXNzO1xuXG4gIC8qKlxuICAgKiBOdW1iZXIgb2YgYnl0ZXMgdXBsb2FkZWQgb3IgZG93bmxvYWRlZC5cbiAgICovXG4gIGxvYWRlZDogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBUb3RhbCBudW1iZXIgb2YgYnl0ZXMgdG8gdXBsb2FkIG9yIGRvd25sb2FkLiBEZXBlbmRpbmcgb24gdGhlIHJlcXVlc3Qgb3JcbiAgICogcmVzcG9uc2UsIHRoaXMgbWF5IG5vdCBiZSBjb21wdXRhYmxlIGFuZCB0aHVzIG1heSBub3QgYmUgcHJlc2VudC5cbiAgICovXG4gIHRvdGFsPzogbnVtYmVyO1xufVxuXG4vKipcbiAqIEEgZG93bmxvYWQgcHJvZ3Jlc3MgZXZlbnQuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgaW50ZXJmYWNlIEh0dHBEb3dubG9hZFByb2dyZXNzRXZlbnQgZXh0ZW5kcyBIdHRwUHJvZ3Jlc3NFdmVudCB7XG4gIHR5cGU6IEh0dHBFdmVudFR5cGUuRG93bmxvYWRQcm9ncmVzcztcblxuICAvKipcbiAgICogVGhlIHBhcnRpYWwgcmVzcG9uc2UgYm9keSBhcyBkb3dubG9hZGVkIHNvIGZhci5cbiAgICpcbiAgICogT25seSBwcmVzZW50IGlmIHRoZSByZXNwb25zZVR5cGUgd2FzIGB0ZXh0YC5cbiAgICovXG4gIHBhcnRpYWxUZXh0Pzogc3RyaW5nO1xufVxuXG4vKipcbiAqIEFuIHVwbG9hZCBwcm9ncmVzcyBldmVudC5cbiAqXG4gKiBOb3RlOiBUaGUgYEZldGNoQmFja2VuZGAgZG9lc24ndCBzdXBwb3J0IHByb2dyZXNzIHJlcG9ydCBvbiB1cGxvYWRzLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBIdHRwVXBsb2FkUHJvZ3Jlc3NFdmVudCBleHRlbmRzIEh0dHBQcm9ncmVzc0V2ZW50IHtcbiAgdHlwZTogSHR0cEV2ZW50VHlwZS5VcGxvYWRQcm9ncmVzcztcbn1cblxuLyoqXG4gKiBBbiBldmVudCBpbmRpY2F0aW5nIHRoYXQgdGhlIHJlcXVlc3Qgd2FzIHNlbnQgdG8gdGhlIHNlcnZlci4gVXNlZnVsXG4gKiB3aGVuIGEgcmVxdWVzdCBtYXkgYmUgcmV0cmllZCBtdWx0aXBsZSB0aW1lcywgdG8gZGlzdGluZ3Vpc2ggYmV0d2VlblxuICogcmV0cmllcyBvbiB0aGUgZmluYWwgZXZlbnQgc3RyZWFtLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBIdHRwU2VudEV2ZW50IHtcbiAgdHlwZTogSHR0cEV2ZW50VHlwZS5TZW50O1xufVxuXG4vKipcbiAqIEEgdXNlci1kZWZpbmVkIGV2ZW50LlxuICpcbiAqIEdyb3VwaW5nIGFsbCBjdXN0b20gZXZlbnRzIHVuZGVyIHRoaXMgdHlwZSBlbnN1cmVzIHRoZXkgd2lsbCBiZSBoYW5kbGVkXG4gKiBhbmQgZm9yd2FyZGVkIGJ5IGFsbCBpbXBsZW1lbnRhdGlvbnMgb2YgaW50ZXJjZXB0b3JzLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBIdHRwVXNlckV2ZW50PFQ+IHtcbiAgdHlwZTogSHR0cEV2ZW50VHlwZS5Vc2VyO1xufVxuXG4vKipcbiAqIEFuIGVycm9yIHRoYXQgcmVwcmVzZW50cyBhIGZhaWxlZCBhdHRlbXB0IHRvIEpTT04ucGFyc2UgdGV4dCBjb21pbmcgYmFja1xuICogZnJvbSB0aGUgc2VydmVyLlxuICpcbiAqIEl0IGJ1bmRsZXMgdGhlIEVycm9yIG9iamVjdCB3aXRoIHRoZSBhY3R1YWwgcmVzcG9uc2UgYm9keSB0aGF0IGZhaWxlZCB0byBwYXJzZS5cbiAqXG4gKlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEh0dHBKc29uUGFyc2VFcnJvciB7XG4gIGVycm9yOiBFcnJvcjtcbiAgdGV4dDogc3RyaW5nO1xufVxuXG4vKipcbiAqIFVuaW9uIHR5cGUgZm9yIGFsbCBwb3NzaWJsZSBldmVudHMgb24gdGhlIHJlc3BvbnNlIHN0cmVhbS5cbiAqXG4gKiBUeXBlZCBhY2NvcmRpbmcgdG8gdGhlIGV4cGVjdGVkIHR5cGUgb2YgdGhlIHJlc3BvbnNlLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IHR5cGUgSHR0cEV2ZW50PFQ+ID1cbiAgfCBIdHRwU2VudEV2ZW50XG4gIHwgSHR0cEhlYWRlclJlc3BvbnNlXG4gIHwgSHR0cFJlc3BvbnNlPFQ+XG4gIHwgSHR0cFByb2dyZXNzRXZlbnRcbiAgfCBIdHRwVXNlckV2ZW50PFQ+O1xuXG4vKipcbiAqIEJhc2UgY2xhc3MgZm9yIGJvdGggYEh0dHBSZXNwb25zZWAgYW5kIGBIdHRwSGVhZGVyUmVzcG9uc2VgLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEh0dHBSZXNwb25zZUJhc2Uge1xuICAvKipcbiAgICogQWxsIHJlc3BvbnNlIGhlYWRlcnMuXG4gICAqL1xuICByZWFkb25seSBoZWFkZXJzOiBIdHRwSGVhZGVycztcblxuICAvKipcbiAgICogUmVzcG9uc2Ugc3RhdHVzIGNvZGUuXG4gICAqL1xuICByZWFkb25seSBzdGF0dXM6IG51bWJlcjtcblxuICAvKipcbiAgICogVGV4dHVhbCBkZXNjcmlwdGlvbiBvZiByZXNwb25zZSBzdGF0dXMgY29kZSwgZGVmYXVsdHMgdG8gT0suXG4gICAqXG4gICAqIERvIG5vdCBkZXBlbmQgb24gdGhpcy5cbiAgICovXG4gIHJlYWRvbmx5IHN0YXR1c1RleHQ6IHN0cmluZztcblxuICAvKipcbiAgICogVVJMIG9mIHRoZSByZXNvdXJjZSByZXRyaWV2ZWQsIG9yIG51bGwgaWYgbm90IGF2YWlsYWJsZS5cbiAgICovXG4gIHJlYWRvbmx5IHVybDogc3RyaW5nIHwgbnVsbDtcblxuICAvKipcbiAgICogV2hldGhlciB0aGUgc3RhdHVzIGNvZGUgZmFsbHMgaW4gdGhlIDJ4eCByYW5nZS5cbiAgICovXG4gIHJlYWRvbmx5IG9rOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBUeXBlIG9mIHRoZSByZXNwb25zZSwgbmFycm93ZWQgdG8gZWl0aGVyIHRoZSBmdWxsIHJlc3BvbnNlIG9yIHRoZSBoZWFkZXIuXG4gICAqL1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcmVhZG9ubHkgdHlwZSE6IEh0dHBFdmVudFR5cGUuUmVzcG9uc2UgfCBIdHRwRXZlbnRUeXBlLlJlc3BvbnNlSGVhZGVyO1xuXG4gIC8qKlxuICAgKiBTdXBlci1jb25zdHJ1Y3RvciBmb3IgYWxsIHJlc3BvbnNlcy5cbiAgICpcbiAgICogVGhlIHNpbmdsZSBwYXJhbWV0ZXIgYWNjZXB0ZWQgaXMgYW4gaW5pdGlhbGl6YXRpb24gaGFzaC4gQW55IHByb3BlcnRpZXNcbiAgICogb2YgdGhlIHJlc3BvbnNlIHBhc3NlZCB0aGVyZSB3aWxsIG92ZXJyaWRlIHRoZSBkZWZhdWx0IHZhbHVlcy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKFxuICAgIGluaXQ6IHtcbiAgICAgIGhlYWRlcnM/OiBIdHRwSGVhZGVycztcbiAgICAgIHN0YXR1cz86IG51bWJlcjtcbiAgICAgIHN0YXR1c1RleHQ/OiBzdHJpbmc7XG4gICAgICB1cmw/OiBzdHJpbmc7XG4gICAgfSxcbiAgICBkZWZhdWx0U3RhdHVzOiBudW1iZXIgPSAyMDAsXG4gICAgZGVmYXVsdFN0YXR1c1RleHQ6IHN0cmluZyA9ICdPSycsXG4gICkge1xuICAgIC8vIElmIHRoZSBoYXNoIGhhcyB2YWx1ZXMgcGFzc2VkLCB1c2UgdGhlbSB0byBpbml0aWFsaXplIHRoZSByZXNwb25zZS5cbiAgICAvLyBPdGhlcndpc2UgdXNlIHRoZSBkZWZhdWx0IHZhbHVlcy5cbiAgICB0aGlzLmhlYWRlcnMgPSBpbml0LmhlYWRlcnMgfHwgbmV3IEh0dHBIZWFkZXJzKCk7XG4gICAgdGhpcy5zdGF0dXMgPSBpbml0LnN0YXR1cyAhPT0gdW5kZWZpbmVkID8gaW5pdC5zdGF0dXMgOiBkZWZhdWx0U3RhdHVzO1xuICAgIHRoaXMuc3RhdHVzVGV4dCA9IGluaXQuc3RhdHVzVGV4dCB8fCBkZWZhdWx0U3RhdHVzVGV4dDtcbiAgICB0aGlzLnVybCA9IGluaXQudXJsIHx8IG51bGw7XG5cbiAgICAvLyBDYWNoZSB0aGUgb2sgdmFsdWUgdG8gYXZvaWQgZGVmaW5pbmcgYSBnZXR0ZXIuXG4gICAgdGhpcy5vayA9IHRoaXMuc3RhdHVzID49IDIwMCAmJiB0aGlzLnN0YXR1cyA8IDMwMDtcbiAgfVxufVxuXG4vKipcbiAqIEEgcGFydGlhbCBIVFRQIHJlc3BvbnNlIHdoaWNoIG9ubHkgaW5jbHVkZXMgdGhlIHN0YXR1cyBhbmQgaGVhZGVyIGRhdGEsXG4gKiBidXQgbm8gcmVzcG9uc2UgYm9keS5cbiAqXG4gKiBgSHR0cEhlYWRlclJlc3BvbnNlYCBpcyBhIGBIdHRwRXZlbnRgIGF2YWlsYWJsZSBvbiB0aGUgcmVzcG9uc2VcbiAqIGV2ZW50IHN0cmVhbSwgb25seSB3aGVuIHByb2dyZXNzIGV2ZW50cyBhcmUgcmVxdWVzdGVkLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIEh0dHBIZWFkZXJSZXNwb25zZSBleHRlbmRzIEh0dHBSZXNwb25zZUJhc2Uge1xuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IGBIdHRwSGVhZGVyUmVzcG9uc2VgIHdpdGggdGhlIGdpdmVuIHBhcmFtZXRlcnMuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICBpbml0OiB7XG4gICAgICBoZWFkZXJzPzogSHR0cEhlYWRlcnM7XG4gICAgICBzdGF0dXM/OiBudW1iZXI7XG4gICAgICBzdGF0dXNUZXh0Pzogc3RyaW5nO1xuICAgICAgdXJsPzogc3RyaW5nO1xuICAgIH0gPSB7fSxcbiAgKSB7XG4gICAgc3VwZXIoaW5pdCk7XG4gIH1cblxuICBvdmVycmlkZSByZWFkb25seSB0eXBlOiBIdHRwRXZlbnRUeXBlLlJlc3BvbnNlSGVhZGVyID0gSHR0cEV2ZW50VHlwZS5SZXNwb25zZUhlYWRlcjtcblxuICAvKipcbiAgICogQ29weSB0aGlzIGBIdHRwSGVhZGVyUmVzcG9uc2VgLCBvdmVycmlkaW5nIGl0cyBjb250ZW50cyB3aXRoIHRoZVxuICAgKiBnaXZlbiBwYXJhbWV0ZXIgaGFzaC5cbiAgICovXG4gIGNsb25lKFxuICAgIHVwZGF0ZToge2hlYWRlcnM/OiBIdHRwSGVhZGVyczsgc3RhdHVzPzogbnVtYmVyOyBzdGF0dXNUZXh0Pzogc3RyaW5nOyB1cmw/OiBzdHJpbmd9ID0ge30sXG4gICk6IEh0dHBIZWFkZXJSZXNwb25zZSB7XG4gICAgLy8gUGVyZm9ybSBhIHN0cmFpZ2h0Zm9yd2FyZCBpbml0aWFsaXphdGlvbiBvZiB0aGUgbmV3IEh0dHBIZWFkZXJSZXNwb25zZSxcbiAgICAvLyBvdmVycmlkaW5nIHRoZSBjdXJyZW50IHBhcmFtZXRlcnMgd2l0aCBuZXcgb25lcyBpZiBnaXZlbi5cbiAgICByZXR1cm4gbmV3IEh0dHBIZWFkZXJSZXNwb25zZSh7XG4gICAgICBoZWFkZXJzOiB1cGRhdGUuaGVhZGVycyB8fCB0aGlzLmhlYWRlcnMsXG4gICAgICBzdGF0dXM6IHVwZGF0ZS5zdGF0dXMgIT09IHVuZGVmaW5lZCA/IHVwZGF0ZS5zdGF0dXMgOiB0aGlzLnN0YXR1cyxcbiAgICAgIHN0YXR1c1RleHQ6IHVwZGF0ZS5zdGF0dXNUZXh0IHx8IHRoaXMuc3RhdHVzVGV4dCxcbiAgICAgIHVybDogdXBkYXRlLnVybCB8fCB0aGlzLnVybCB8fCB1bmRlZmluZWQsXG4gICAgfSk7XG4gIH1cbn1cblxuLyoqXG4gKiBBIGZ1bGwgSFRUUCByZXNwb25zZSwgaW5jbHVkaW5nIGEgdHlwZWQgcmVzcG9uc2UgYm9keSAod2hpY2ggbWF5IGJlIGBudWxsYFxuICogaWYgb25lIHdhcyBub3QgcmV0dXJuZWQpLlxuICpcbiAqIGBIdHRwUmVzcG9uc2VgIGlzIGEgYEh0dHBFdmVudGAgYXZhaWxhYmxlIG9uIHRoZSByZXNwb25zZSBldmVudFxuICogc3RyZWFtLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIEh0dHBSZXNwb25zZTxUPiBleHRlbmRzIEh0dHBSZXNwb25zZUJhc2Uge1xuICAvKipcbiAgICogVGhlIHJlc3BvbnNlIGJvZHksIG9yIGBudWxsYCBpZiBvbmUgd2FzIG5vdCByZXR1cm5lZC5cbiAgICovXG4gIHJlYWRvbmx5IGJvZHk6IFQgfCBudWxsO1xuXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3QgYSBuZXcgYEh0dHBSZXNwb25zZWAuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICBpbml0OiB7XG4gICAgICBib2R5PzogVCB8IG51bGw7XG4gICAgICBoZWFkZXJzPzogSHR0cEhlYWRlcnM7XG4gICAgICBzdGF0dXM/OiBudW1iZXI7XG4gICAgICBzdGF0dXNUZXh0Pzogc3RyaW5nO1xuICAgICAgdXJsPzogc3RyaW5nO1xuICAgIH0gPSB7fSxcbiAgKSB7XG4gICAgc3VwZXIoaW5pdCk7XG4gICAgdGhpcy5ib2R5ID0gaW5pdC5ib2R5ICE9PSB1bmRlZmluZWQgPyBpbml0LmJvZHkgOiBudWxsO1xuICB9XG5cbiAgb3ZlcnJpZGUgcmVhZG9ubHkgdHlwZTogSHR0cEV2ZW50VHlwZS5SZXNwb25zZSA9IEh0dHBFdmVudFR5cGUuUmVzcG9uc2U7XG5cbiAgY2xvbmUoKTogSHR0cFJlc3BvbnNlPFQ+O1xuICBjbG9uZSh1cGRhdGU6IHtcbiAgICBoZWFkZXJzPzogSHR0cEhlYWRlcnM7XG4gICAgc3RhdHVzPzogbnVtYmVyO1xuICAgIHN0YXR1c1RleHQ/OiBzdHJpbmc7XG4gICAgdXJsPzogc3RyaW5nO1xuICB9KTogSHR0cFJlc3BvbnNlPFQ+O1xuICBjbG9uZTxWPih1cGRhdGU6IHtcbiAgICBib2R5PzogViB8IG51bGw7XG4gICAgaGVhZGVycz86IEh0dHBIZWFkZXJzO1xuICAgIHN0YXR1cz86IG51bWJlcjtcbiAgICBzdGF0dXNUZXh0Pzogc3RyaW5nO1xuICAgIHVybD86IHN0cmluZztcbiAgfSk6IEh0dHBSZXNwb25zZTxWPjtcbiAgY2xvbmUoXG4gICAgdXBkYXRlOiB7XG4gICAgICBib2R5PzogYW55IHwgbnVsbDtcbiAgICAgIGhlYWRlcnM/OiBIdHRwSGVhZGVycztcbiAgICAgIHN0YXR1cz86IG51bWJlcjtcbiAgICAgIHN0YXR1c1RleHQ/OiBzdHJpbmc7XG4gICAgICB1cmw/OiBzdHJpbmc7XG4gICAgfSA9IHt9LFxuICApOiBIdHRwUmVzcG9uc2U8YW55PiB7XG4gICAgcmV0dXJuIG5ldyBIdHRwUmVzcG9uc2U8YW55Pih7XG4gICAgICBib2R5OiB1cGRhdGUuYm9keSAhPT0gdW5kZWZpbmVkID8gdXBkYXRlLmJvZHkgOiB0aGlzLmJvZHksXG4gICAgICBoZWFkZXJzOiB1cGRhdGUuaGVhZGVycyB8fCB0aGlzLmhlYWRlcnMsXG4gICAgICBzdGF0dXM6IHVwZGF0ZS5zdGF0dXMgIT09IHVuZGVmaW5lZCA/IHVwZGF0ZS5zdGF0dXMgOiB0aGlzLnN0YXR1cyxcbiAgICAgIHN0YXR1c1RleHQ6IHVwZGF0ZS5zdGF0dXNUZXh0IHx8IHRoaXMuc3RhdHVzVGV4dCxcbiAgICAgIHVybDogdXBkYXRlLnVybCB8fCB0aGlzLnVybCB8fCB1bmRlZmluZWQsXG4gICAgfSk7XG4gIH1cbn1cblxuLyoqXG4gKiBBIHJlc3BvbnNlIHRoYXQgcmVwcmVzZW50cyBhbiBlcnJvciBvciBmYWlsdXJlLCBlaXRoZXIgZnJvbSBhXG4gKiBub24tc3VjY2Vzc2Z1bCBIVFRQIHN0YXR1cywgYW4gZXJyb3Igd2hpbGUgZXhlY3V0aW5nIHRoZSByZXF1ZXN0LFxuICogb3Igc29tZSBvdGhlciBmYWlsdXJlIHdoaWNoIG9jY3VycmVkIGR1cmluZyB0aGUgcGFyc2luZyBvZiB0aGUgcmVzcG9uc2UuXG4gKlxuICogQW55IGVycm9yIHJldHVybmVkIG9uIHRoZSBgT2JzZXJ2YWJsZWAgcmVzcG9uc2Ugc3RyZWFtIHdpbGwgYmVcbiAqIHdyYXBwZWQgaW4gYW4gYEh0dHBFcnJvclJlc3BvbnNlYCB0byBwcm92aWRlIGFkZGl0aW9uYWwgY29udGV4dCBhYm91dFxuICogdGhlIHN0YXRlIG9mIHRoZSBIVFRQIGxheWVyIHdoZW4gdGhlIGVycm9yIG9jY3VycmVkLiBUaGUgZXJyb3IgcHJvcGVydHlcbiAqIHdpbGwgY29udGFpbiBlaXRoZXIgYSB3cmFwcGVkIEVycm9yIG9iamVjdCBvciB0aGUgZXJyb3IgcmVzcG9uc2UgcmV0dXJuZWRcbiAqIGZyb20gdGhlIHNlcnZlci5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBIdHRwRXJyb3JSZXNwb25zZSBleHRlbmRzIEh0dHBSZXNwb25zZUJhc2UgaW1wbGVtZW50cyBFcnJvciB7XG4gIHJlYWRvbmx5IG5hbWUgPSAnSHR0cEVycm9yUmVzcG9uc2UnO1xuICByZWFkb25seSBtZXNzYWdlOiBzdHJpbmc7XG4gIHJlYWRvbmx5IGVycm9yOiBhbnkgfCBudWxsO1xuXG4gIC8qKlxuICAgKiBFcnJvcnMgYXJlIG5ldmVyIG9rYXksIGV2ZW4gd2hlbiB0aGUgc3RhdHVzIGNvZGUgaXMgaW4gdGhlIDJ4eCBzdWNjZXNzIHJhbmdlLlxuICAgKi9cbiAgb3ZlcnJpZGUgcmVhZG9ubHkgb2sgPSBmYWxzZTtcblxuICBjb25zdHJ1Y3Rvcihpbml0OiB7XG4gICAgZXJyb3I/OiBhbnk7XG4gICAgaGVhZGVycz86IEh0dHBIZWFkZXJzO1xuICAgIHN0YXR1cz86IG51bWJlcjtcbiAgICBzdGF0dXNUZXh0Pzogc3RyaW5nO1xuICAgIHVybD86IHN0cmluZztcbiAgfSkge1xuICAgIC8vIEluaXRpYWxpemUgd2l0aCBhIGRlZmF1bHQgc3RhdHVzIG9mIDAgLyBVbmtub3duIEVycm9yLlxuICAgIHN1cGVyKGluaXQsIDAsICdVbmtub3duIEVycm9yJyk7XG5cbiAgICAvLyBJZiB0aGUgcmVzcG9uc2Ugd2FzIHN1Y2Nlc3NmdWwsIHRoZW4gdGhpcyB3YXMgYSBwYXJzZSBlcnJvci4gT3RoZXJ3aXNlLCBpdCB3YXNcbiAgICAvLyBhIHByb3RvY29sLWxldmVsIGZhaWx1cmUgb2Ygc29tZSBzb3J0LiBFaXRoZXIgdGhlIHJlcXVlc3QgZmFpbGVkIGluIHRyYW5zaXRcbiAgICAvLyBvciB0aGUgc2VydmVyIHJldHVybmVkIGFuIHVuc3VjY2Vzc2Z1bCBzdGF0dXMgY29kZS5cbiAgICBpZiAodGhpcy5zdGF0dXMgPj0gMjAwICYmIHRoaXMuc3RhdHVzIDwgMzAwKSB7XG4gICAgICB0aGlzLm1lc3NhZ2UgPSBgSHR0cCBmYWlsdXJlIGR1cmluZyBwYXJzaW5nIGZvciAke2luaXQudXJsIHx8ICcodW5rbm93biB1cmwpJ31gO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm1lc3NhZ2UgPSBgSHR0cCBmYWlsdXJlIHJlc3BvbnNlIGZvciAke2luaXQudXJsIHx8ICcodW5rbm93biB1cmwpJ306ICR7aW5pdC5zdGF0dXN9ICR7XG4gICAgICAgIGluaXQuc3RhdHVzVGV4dFxuICAgICAgfWA7XG4gICAgfVxuICAgIHRoaXMuZXJyb3IgPSBpbml0LmVycm9yIHx8IG51bGw7XG4gIH1cbn1cblxuLyoqXG4gKiBXZSB1c2UgdGhlc2UgY29uc3RhbnQgdG8gcHJldmVudCBwdWxsaW5nIHRoZSB3aG9sZSBIdHRwU3RhdHVzQ29kZSBlbnVtXG4gKiBUaG9zZSBhcmUgdGhlIG9ubHkgb25lcyByZWZlcmVuY2VkIGRpcmVjdGx5IGJ5IHRoZSBmcmFtZXdvcmtcbiAqL1xuZXhwb3J0IGNvbnN0IEhUVFBfU1RBVFVTX0NPREVfT0sgPSAyMDA7XG5leHBvcnQgY29uc3QgSFRUUF9TVEFUVVNfQ09ERV9OT19DT05URU5UID0gMjA0O1xuXG4vKipcbiAqIEh0dHAgc3RhdHVzIGNvZGVzLlxuICogQXMgcGVyIGh0dHBzOi8vd3d3LmlhbmEub3JnL2Fzc2lnbm1lbnRzL2h0dHAtc3RhdHVzLWNvZGVzL2h0dHAtc3RhdHVzLWNvZGVzLnhodG1sXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBlbnVtIEh0dHBTdGF0dXNDb2RlIHtcbiAgQ29udGludWUgPSAxMDAsXG4gIFN3aXRjaGluZ1Byb3RvY29scyA9IDEwMSxcbiAgUHJvY2Vzc2luZyA9IDEwMixcbiAgRWFybHlIaW50cyA9IDEwMyxcblxuICBPayA9IEhUVFBfU1RBVFVTX0NPREVfT0ssXG4gIENyZWF0ZWQgPSAyMDEsXG4gIEFjY2VwdGVkID0gMjAyLFxuICBOb25BdXRob3JpdGF0aXZlSW5mb3JtYXRpb24gPSAyMDMsXG4gIE5vQ29udGVudCA9IEhUVFBfU1RBVFVTX0NPREVfTk9fQ09OVEVOVCxcbiAgUmVzZXRDb250ZW50ID0gMjA1LFxuICBQYXJ0aWFsQ29udGVudCA9IDIwNixcbiAgTXVsdGlTdGF0dXMgPSAyMDcsXG4gIEFscmVhZHlSZXBvcnRlZCA9IDIwOCxcbiAgSW1Vc2VkID0gMjI2LFxuXG4gIE11bHRpcGxlQ2hvaWNlcyA9IDMwMCxcbiAgTW92ZWRQZXJtYW5lbnRseSA9IDMwMSxcbiAgRm91bmQgPSAzMDIsXG4gIFNlZU90aGVyID0gMzAzLFxuICBOb3RNb2RpZmllZCA9IDMwNCxcbiAgVXNlUHJveHkgPSAzMDUsXG4gIFVudXNlZCA9IDMwNixcbiAgVGVtcG9yYXJ5UmVkaXJlY3QgPSAzMDcsXG4gIFBlcm1hbmVudFJlZGlyZWN0ID0gMzA4LFxuXG4gIEJhZFJlcXVlc3QgPSA0MDAsXG4gIFVuYXV0aG9yaXplZCA9IDQwMSxcbiAgUGF5bWVudFJlcXVpcmVkID0gNDAyLFxuICBGb3JiaWRkZW4gPSA0MDMsXG4gIE5vdEZvdW5kID0gNDA0LFxuICBNZXRob2ROb3RBbGxvd2VkID0gNDA1LFxuICBOb3RBY2NlcHRhYmxlID0gNDA2LFxuICBQcm94eUF1dGhlbnRpY2F0aW9uUmVxdWlyZWQgPSA0MDcsXG4gIFJlcXVlc3RUaW1lb3V0ID0gNDA4LFxuICBDb25mbGljdCA9IDQwOSxcbiAgR29uZSA9IDQxMCxcbiAgTGVuZ3RoUmVxdWlyZWQgPSA0MTEsXG4gIFByZWNvbmRpdGlvbkZhaWxlZCA9IDQxMixcbiAgUGF5bG9hZFRvb0xhcmdlID0gNDEzLFxuICBVcmlUb29Mb25nID0gNDE0LFxuICBVbnN1cHBvcnRlZE1lZGlhVHlwZSA9IDQxNSxcbiAgUmFuZ2VOb3RTYXRpc2ZpYWJsZSA9IDQxNixcbiAgRXhwZWN0YXRpb25GYWlsZWQgPSA0MTcsXG4gIEltQVRlYXBvdCA9IDQxOCxcbiAgTWlzZGlyZWN0ZWRSZXF1ZXN0ID0gNDIxLFxuICBVbnByb2Nlc3NhYmxlRW50aXR5ID0gNDIyLFxuICBMb2NrZWQgPSA0MjMsXG4gIEZhaWxlZERlcGVuZGVuY3kgPSA0MjQsXG4gIFRvb0Vhcmx5ID0gNDI1LFxuICBVcGdyYWRlUmVxdWlyZWQgPSA0MjYsXG4gIFByZWNvbmRpdGlvblJlcXVpcmVkID0gNDI4LFxuICBUb29NYW55UmVxdWVzdHMgPSA0MjksXG4gIFJlcXVlc3RIZWFkZXJGaWVsZHNUb29MYXJnZSA9IDQzMSxcbiAgVW5hdmFpbGFibGVGb3JMZWdhbFJlYXNvbnMgPSA0NTEsXG5cbiAgSW50ZXJuYWxTZXJ2ZXJFcnJvciA9IDUwMCxcbiAgTm90SW1wbGVtZW50ZWQgPSA1MDEsXG4gIEJhZEdhdGV3YXkgPSA1MDIsXG4gIFNlcnZpY2VVbmF2YWlsYWJsZSA9IDUwMyxcbiAgR2F0ZXdheVRpbWVvdXQgPSA1MDQsXG4gIEh0dHBWZXJzaW9uTm90U3VwcG9ydGVkID0gNTA1LFxuICBWYXJpYW50QWxzb05lZ290aWF0ZXMgPSA1MDYsXG4gIEluc3VmZmljaWVudFN0b3JhZ2UgPSA1MDcsXG4gIExvb3BEZXRlY3RlZCA9IDUwOCxcbiAgTm90RXh0ZW5kZWQgPSA1MTAsXG4gIE5ldHdvcmtBdXRoZW50aWNhdGlvblJlcXVpcmVkID0gNTExLFxufVxuIl19