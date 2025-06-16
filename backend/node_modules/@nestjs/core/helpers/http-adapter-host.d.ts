import { Observable } from 'rxjs';
import { AbstractHttpAdapter } from '../adapters/http-adapter';
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
export declare class HttpAdapterHost<T extends AbstractHttpAdapter = AbstractHttpAdapter> {
    private _httpAdapter?;
    private _listen$;
    private isListening;
    /**
     * Accessor for the underlying `HttpAdapter`
     *
     * @param httpAdapter reference to the `HttpAdapter` to be set
     */
    set httpAdapter(httpAdapter: T);
    /**
     * Accessor for the underlying `HttpAdapter`
     *
     * @example
     * `const httpAdapter = adapterHost.httpAdapter;`
     */
    get httpAdapter(): T;
    /**
     * Observable that allows to subscribe to the `listen` event.
     * This event is emitted when the HTTP application is listening for incoming requests.
     */
    get listen$(): Observable<void>;
    /**
     * Sets the listening state of the application.
     */
    set listening(listening: boolean);
    /**
     * Returns a boolean indicating whether the application is listening for incoming requests.
     */
    get listening(): boolean;
}
