"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpAdapterHost = void 0;
const rxjs_1 = require("rxjs");
/**
 * Defines the `HttpAdapterHost` object.
 *
 * `HttpAdapterHost` wraps the underlying
 * platform-specific `HttpAdapter`.  The `HttpAdapter` is a wrapper around the underlying
 * native HTTP server library (e.g., Express).  The `HttpAdapterHost` object
 * provides methods to `get` and `set` the underlying HttpAdapter.
 *
 * @see [Http adapter](https://docs.nestjs.com/faq/http-adapter)
 *
 * @publicApi
 */
class HttpAdapterHost {
    constructor() {
        this._listen$ = new rxjs_1.Subject();
        this.isListening = false;
    }
    /**
     * Accessor for the underlying `HttpAdapter`
     *
     * @param httpAdapter reference to the `HttpAdapter` to be set
     */
    set httpAdapter(httpAdapter) {
        this._httpAdapter = httpAdapter;
    }
    /**
     * Accessor for the underlying `HttpAdapter`
     *
     * @example
     * `const httpAdapter = adapterHost.httpAdapter;`
     */
    get httpAdapter() {
        return this._httpAdapter;
    }
    /**
     * Observable that allows to subscribe to the `listen` event.
     * This event is emitted when the HTTP application is listening for incoming requests.
     */
    get listen$() {
        return this._listen$.asObservable();
    }
    /**
     * Sets the listening state of the application.
     */
    set listening(listening) {
        this.isListening = listening;
        if (listening) {
            this._listen$.next();
            this._listen$.complete();
        }
    }
    /**
     * Returns a boolean indicating whether the application is listening for incoming requests.
     */
    get listening() {
        return this.isListening;
    }
}
exports.HttpAdapterHost = HttpAdapterHost;
