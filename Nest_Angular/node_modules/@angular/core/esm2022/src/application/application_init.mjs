import { inject, Injectable, InjectionToken } from '../di';
import { RuntimeError } from '../errors';
import { isPromise, isSubscribable } from '../util/lang';
import * as i0 from "../r3_symbols";
/**
 * A DI token that you can use to provide
 * one or more initialization functions.
 *
 * The provided functions are injected at application startup and executed during
 * app initialization. If any of these functions returns a Promise or an Observable, initialization
 * does not complete until the Promise is resolved or the Observable is completed.
 *
 * You can, for example, create a factory function that loads language data
 * or an external configuration, and provide that function to the `APP_INITIALIZER` token.
 * The function is executed during the application bootstrap process,
 * and the needed data is available on startup.
 *
 * @see {@link ApplicationInitStatus}
 *
 * @usageNotes
 *
 * The following example illustrates how to configure a multi-provider using `APP_INITIALIZER` token
 * and a function returning a promise.
 * ### Example with NgModule-based application
 * ```
 *  function initializeApp(): Promise<any> {
 *    return new Promise((resolve, reject) => {
 *      // Do some asynchronous stuff
 *      resolve();
 *    });
 *  }
 *
 *  @NgModule({
 *   imports: [BrowserModule],
 *   declarations: [AppComponent],
 *   bootstrap: [AppComponent],
 *   providers: [{
 *     provide: APP_INITIALIZER,
 *     useFactory: () => initializeApp,
 *     multi: true
 *    }]
 *   })
 *  export class AppModule {}
 * ```
 *
 * ### Example with standalone application
 * ```
 * export function initializeApp(http: HttpClient) {
 *   return (): Promise<any> =>
 *     firstValueFrom(
 *       http
 *         .get("https://someUrl.com/api/user")
 *         .pipe(tap(user => { ... }))
 *     );
 * }
 *
 * bootstrapApplication(App, {
 *   providers: [
 *     provideHttpClient(),
 *     {
 *       provide: APP_INITIALIZER,
 *       useFactory: initializeApp,
 *       multi: true,
 *       deps: [HttpClient],
 *     },
 *   ],
 * });

 * ```
 *
 *
 * It's also possible to configure a multi-provider using `APP_INITIALIZER` token and a function
 * returning an observable, see an example below. Note: the `HttpClient` in this example is used for
 * demo purposes to illustrate how the factory function can work with other providers available
 * through DI.
 *
 * ### Example with NgModule-based application
 * ```
 *  function initializeAppFactory(httpClient: HttpClient): () => Observable<any> {
 *   return () => httpClient.get("https://someUrl.com/api/user")
 *     .pipe(
 *        tap(user => { ... })
 *     );
 *  }
 *
 *  @NgModule({
 *    imports: [BrowserModule, HttpClientModule],
 *    declarations: [AppComponent],
 *    bootstrap: [AppComponent],
 *    providers: [{
 *      provide: APP_INITIALIZER,
 *      useFactory: initializeAppFactory,
 *      deps: [HttpClient],
 *      multi: true
 *    }]
 *  })
 *  export class AppModule {}
 * ```
 *
 * ### Example with standalone application
 * ```
 *  function initializeAppFactory(httpClient: HttpClient): () => Observable<any> {
 *   return () => httpClient.get("https://someUrl.com/api/user")
 *     .pipe(
 *        tap(user => { ... })
 *     );
 *  }
 *
 * bootstrapApplication(App, {
 *   providers: [
 *     provideHttpClient(),
 *     {
 *       provide: APP_INITIALIZER,
 *       useFactory: initializeAppFactory,
 *       multi: true,
 *       deps: [HttpClient],
 *     },
 *   ],
 * });
 * ```
 *
 * @publicApi
 */
export const APP_INITIALIZER = new InjectionToken(ngDevMode ? 'Application Initializer' : '');
/**
 * A class that reflects the state of running {@link APP_INITIALIZER} functions.
 *
 * @publicApi
 */
export class ApplicationInitStatus {
    constructor() {
        this.initialized = false;
        this.done = false;
        this.donePromise = new Promise((res, rej) => {
            this.resolve = res;
            this.reject = rej;
        });
        this.appInits = inject(APP_INITIALIZER, { optional: true }) ?? [];
        if ((typeof ngDevMode === 'undefined' || ngDevMode) && !Array.isArray(this.appInits)) {
            throw new RuntimeError(-209 /* RuntimeErrorCode.INVALID_MULTI_PROVIDER */, 'Unexpected type of the `APP_INITIALIZER` token value ' +
                `(expected an array, but got ${typeof this.appInits}). ` +
                'Please check that the `APP_INITIALIZER` token is configured as a ' +
                '`multi: true` provider.');
        }
    }
    /** @internal */
    runInitializers() {
        if (this.initialized) {
            return;
        }
        const asyncInitPromises = [];
        for (const appInits of this.appInits) {
            const initResult = appInits();
            if (isPromise(initResult)) {
                asyncInitPromises.push(initResult);
            }
            else if (isSubscribable(initResult)) {
                const observableAsPromise = new Promise((resolve, reject) => {
                    initResult.subscribe({ complete: resolve, error: reject });
                });
                asyncInitPromises.push(observableAsPromise);
            }
        }
        const complete = () => {
            // @ts-expect-error overwriting a readonly
            this.done = true;
            this.resolve();
        };
        Promise.all(asyncInitPromises)
            .then(() => {
            complete();
        })
            .catch((e) => {
            this.reject(e);
        });
        if (asyncInitPromises.length === 0) {
            complete();
        }
        this.initialized = true;
    }
    static { this.ɵfac = function ApplicationInitStatus_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ApplicationInitStatus)(); }; }
    static { this.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: ApplicationInitStatus, factory: ApplicationInitStatus.ɵfac, providedIn: 'root' }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.setClassMetadata(ApplicationInitStatus, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], () => [], null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbGljYXRpb25faW5pdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL2FwcGxpY2F0aW9uL2FwcGxpY2F0aW9uX2luaXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBVUEsT0FBTyxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsY0FBYyxFQUFDLE1BQU0sT0FBTyxDQUFDO0FBQ3pELE9BQU8sRUFBQyxZQUFZLEVBQW1CLE1BQU0sV0FBVyxDQUFDO0FBQ3pELE9BQU8sRUFBQyxTQUFTLEVBQUUsY0FBYyxFQUFDLE1BQU0sY0FBYyxDQUFDOztBQUV2RDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXNIRztBQUNILE1BQU0sQ0FBQyxNQUFNLGVBQWUsR0FBRyxJQUFJLGNBQWMsQ0FFL0MsU0FBUyxDQUFDLENBQUMsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFFOUM7Ozs7R0FJRztBQUVILE1BQU0sT0FBTyxxQkFBcUI7SUFlaEM7UUFUUSxnQkFBVyxHQUFHLEtBQUssQ0FBQztRQUNaLFNBQUksR0FBRyxLQUFLLENBQUM7UUFDYixnQkFBVyxHQUFpQixJQUFJLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRTtZQUNuRSxJQUFJLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQztZQUNuQixJQUFJLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQztRQUNwQixDQUFDLENBQUMsQ0FBQztRQUVjLGFBQVEsR0FBRyxNQUFNLENBQUMsZUFBZSxFQUFFLEVBQUMsUUFBUSxFQUFFLElBQUksRUFBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBRzFFLElBQUksQ0FBQyxPQUFPLFNBQVMsS0FBSyxXQUFXLElBQUksU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO1lBQ3JGLE1BQU0sSUFBSSxZQUFZLHFEQUVwQix1REFBdUQ7Z0JBQ3JELCtCQUErQixPQUFPLElBQUksQ0FBQyxRQUFRLEtBQUs7Z0JBQ3hELG1FQUFtRTtnQkFDbkUseUJBQXlCLENBQzVCLENBQUM7UUFDSixDQUFDO0lBQ0gsQ0FBQztJQUVELGdCQUFnQjtJQUNoQixlQUFlO1FBQ2IsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDckIsT0FBTztRQUNULENBQUM7UUFFRCxNQUFNLGlCQUFpQixHQUFHLEVBQUUsQ0FBQztRQUM3QixLQUFLLE1BQU0sUUFBUSxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNyQyxNQUFNLFVBQVUsR0FBRyxRQUFRLEVBQUUsQ0FBQztZQUM5QixJQUFJLFNBQVMsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDO2dCQUMxQixpQkFBaUIsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDckMsQ0FBQztpQkFBTSxJQUFJLGNBQWMsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDO2dCQUN0QyxNQUFNLG1CQUFtQixHQUFHLElBQUksT0FBTyxDQUFPLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO29CQUNoRSxVQUFVLENBQUMsU0FBUyxDQUFDLEVBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFDLENBQUMsQ0FBQztnQkFDM0QsQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsaUJBQWlCLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7WUFDOUMsQ0FBQztRQUNILENBQUM7UUFFRCxNQUFNLFFBQVEsR0FBRyxHQUFHLEVBQUU7WUFDcEIsMENBQTBDO1lBQzFDLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1lBQ2pCLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNqQixDQUFDLENBQUM7UUFFRixPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDO2FBQzNCLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDVCxRQUFRLEVBQUUsQ0FBQztRQUNiLENBQUMsQ0FBQzthQUNELEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO1lBQ1gsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqQixDQUFDLENBQUMsQ0FBQztRQUVMLElBQUksaUJBQWlCLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQ25DLFFBQVEsRUFBRSxDQUFDO1FBQ2IsQ0FBQztRQUNELElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO0lBQzFCLENBQUM7c0hBaEVVLHFCQUFxQjt1RUFBckIscUJBQXFCLFdBQXJCLHFCQUFxQixtQkFEVCxNQUFNOztnRkFDbEIscUJBQXFCO2NBRGpDLFVBQVU7ZUFBQyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCB7T2JzZXJ2YWJsZX0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7aW5qZWN0LCBJbmplY3RhYmxlLCBJbmplY3Rpb25Ub2tlbn0gZnJvbSAnLi4vZGknO1xuaW1wb3J0IHtSdW50aW1lRXJyb3IsIFJ1bnRpbWVFcnJvckNvZGV9IGZyb20gJy4uL2Vycm9ycyc7XG5pbXBvcnQge2lzUHJvbWlzZSwgaXNTdWJzY3JpYmFibGV9IGZyb20gJy4uL3V0aWwvbGFuZyc7XG5cbi8qKlxuICogQSBESSB0b2tlbiB0aGF0IHlvdSBjYW4gdXNlIHRvIHByb3ZpZGVcbiAqIG9uZSBvciBtb3JlIGluaXRpYWxpemF0aW9uIGZ1bmN0aW9ucy5cbiAqXG4gKiBUaGUgcHJvdmlkZWQgZnVuY3Rpb25zIGFyZSBpbmplY3RlZCBhdCBhcHBsaWNhdGlvbiBzdGFydHVwIGFuZCBleGVjdXRlZCBkdXJpbmdcbiAqIGFwcCBpbml0aWFsaXphdGlvbi4gSWYgYW55IG9mIHRoZXNlIGZ1bmN0aW9ucyByZXR1cm5zIGEgUHJvbWlzZSBvciBhbiBPYnNlcnZhYmxlLCBpbml0aWFsaXphdGlvblxuICogZG9lcyBub3QgY29tcGxldGUgdW50aWwgdGhlIFByb21pc2UgaXMgcmVzb2x2ZWQgb3IgdGhlIE9ic2VydmFibGUgaXMgY29tcGxldGVkLlxuICpcbiAqIFlvdSBjYW4sIGZvciBleGFtcGxlLCBjcmVhdGUgYSBmYWN0b3J5IGZ1bmN0aW9uIHRoYXQgbG9hZHMgbGFuZ3VhZ2UgZGF0YVxuICogb3IgYW4gZXh0ZXJuYWwgY29uZmlndXJhdGlvbiwgYW5kIHByb3ZpZGUgdGhhdCBmdW5jdGlvbiB0byB0aGUgYEFQUF9JTklUSUFMSVpFUmAgdG9rZW4uXG4gKiBUaGUgZnVuY3Rpb24gaXMgZXhlY3V0ZWQgZHVyaW5nIHRoZSBhcHBsaWNhdGlvbiBib290c3RyYXAgcHJvY2VzcyxcbiAqIGFuZCB0aGUgbmVlZGVkIGRhdGEgaXMgYXZhaWxhYmxlIG9uIHN0YXJ0dXAuXG4gKlxuICogQHNlZSB7QGxpbmsgQXBwbGljYXRpb25Jbml0U3RhdHVzfVxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogVGhlIGZvbGxvd2luZyBleGFtcGxlIGlsbHVzdHJhdGVzIGhvdyB0byBjb25maWd1cmUgYSBtdWx0aS1wcm92aWRlciB1c2luZyBgQVBQX0lOSVRJQUxJWkVSYCB0b2tlblxuICogYW5kIGEgZnVuY3Rpb24gcmV0dXJuaW5nIGEgcHJvbWlzZS5cbiAqICMjIyBFeGFtcGxlIHdpdGggTmdNb2R1bGUtYmFzZWQgYXBwbGljYXRpb25cbiAqIGBgYFxuICogIGZ1bmN0aW9uIGluaXRpYWxpemVBcHAoKTogUHJvbWlzZTxhbnk+IHtcbiAqICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gKiAgICAgIC8vIERvIHNvbWUgYXN5bmNocm9ub3VzIHN0dWZmXG4gKiAgICAgIHJlc29sdmUoKTtcbiAqICAgIH0pO1xuICogIH1cbiAqXG4gKiAgQE5nTW9kdWxlKHtcbiAqICAgaW1wb3J0czogW0Jyb3dzZXJNb2R1bGVdLFxuICogICBkZWNsYXJhdGlvbnM6IFtBcHBDb21wb25lbnRdLFxuICogICBib290c3RyYXA6IFtBcHBDb21wb25lbnRdLFxuICogICBwcm92aWRlcnM6IFt7XG4gKiAgICAgcHJvdmlkZTogQVBQX0lOSVRJQUxJWkVSLFxuICogICAgIHVzZUZhY3Rvcnk6ICgpID0+IGluaXRpYWxpemVBcHAsXG4gKiAgICAgbXVsdGk6IHRydWVcbiAqICAgIH1dXG4gKiAgIH0pXG4gKiAgZXhwb3J0IGNsYXNzIEFwcE1vZHVsZSB7fVxuICogYGBgXG4gKlxuICogIyMjIEV4YW1wbGUgd2l0aCBzdGFuZGFsb25lIGFwcGxpY2F0aW9uXG4gKiBgYGBcbiAqIGV4cG9ydCBmdW5jdGlvbiBpbml0aWFsaXplQXBwKGh0dHA6IEh0dHBDbGllbnQpIHtcbiAqICAgcmV0dXJuICgpOiBQcm9taXNlPGFueT4gPT5cbiAqICAgICBmaXJzdFZhbHVlRnJvbShcbiAqICAgICAgIGh0dHBcbiAqICAgICAgICAgLmdldChcImh0dHBzOi8vc29tZVVybC5jb20vYXBpL3VzZXJcIilcbiAqICAgICAgICAgLnBpcGUodGFwKHVzZXIgPT4geyAuLi4gfSkpXG4gKiAgICAgKTtcbiAqIH1cbiAqXG4gKiBib290c3RyYXBBcHBsaWNhdGlvbihBcHAsIHtcbiAqICAgcHJvdmlkZXJzOiBbXG4gKiAgICAgcHJvdmlkZUh0dHBDbGllbnQoKSxcbiAqICAgICB7XG4gKiAgICAgICBwcm92aWRlOiBBUFBfSU5JVElBTElaRVIsXG4gKiAgICAgICB1c2VGYWN0b3J5OiBpbml0aWFsaXplQXBwLFxuICogICAgICAgbXVsdGk6IHRydWUsXG4gKiAgICAgICBkZXBzOiBbSHR0cENsaWVudF0sXG4gKiAgICAgfSxcbiAqICAgXSxcbiAqIH0pO1xuXG4gKiBgYGBcbiAqXG4gKlxuICogSXQncyBhbHNvIHBvc3NpYmxlIHRvIGNvbmZpZ3VyZSBhIG11bHRpLXByb3ZpZGVyIHVzaW5nIGBBUFBfSU5JVElBTElaRVJgIHRva2VuIGFuZCBhIGZ1bmN0aW9uXG4gKiByZXR1cm5pbmcgYW4gb2JzZXJ2YWJsZSwgc2VlIGFuIGV4YW1wbGUgYmVsb3cuIE5vdGU6IHRoZSBgSHR0cENsaWVudGAgaW4gdGhpcyBleGFtcGxlIGlzIHVzZWQgZm9yXG4gKiBkZW1vIHB1cnBvc2VzIHRvIGlsbHVzdHJhdGUgaG93IHRoZSBmYWN0b3J5IGZ1bmN0aW9uIGNhbiB3b3JrIHdpdGggb3RoZXIgcHJvdmlkZXJzIGF2YWlsYWJsZVxuICogdGhyb3VnaCBESS5cbiAqXG4gKiAjIyMgRXhhbXBsZSB3aXRoIE5nTW9kdWxlLWJhc2VkIGFwcGxpY2F0aW9uXG4gKiBgYGBcbiAqICBmdW5jdGlvbiBpbml0aWFsaXplQXBwRmFjdG9yeShodHRwQ2xpZW50OiBIdHRwQ2xpZW50KTogKCkgPT4gT2JzZXJ2YWJsZTxhbnk+IHtcbiAqICAgcmV0dXJuICgpID0+IGh0dHBDbGllbnQuZ2V0KFwiaHR0cHM6Ly9zb21lVXJsLmNvbS9hcGkvdXNlclwiKVxuICogICAgIC5waXBlKFxuICogICAgICAgIHRhcCh1c2VyID0+IHsgLi4uIH0pXG4gKiAgICAgKTtcbiAqICB9XG4gKlxuICogIEBOZ01vZHVsZSh7XG4gKiAgICBpbXBvcnRzOiBbQnJvd3Nlck1vZHVsZSwgSHR0cENsaWVudE1vZHVsZV0sXG4gKiAgICBkZWNsYXJhdGlvbnM6IFtBcHBDb21wb25lbnRdLFxuICogICAgYm9vdHN0cmFwOiBbQXBwQ29tcG9uZW50XSxcbiAqICAgIHByb3ZpZGVyczogW3tcbiAqICAgICAgcHJvdmlkZTogQVBQX0lOSVRJQUxJWkVSLFxuICogICAgICB1c2VGYWN0b3J5OiBpbml0aWFsaXplQXBwRmFjdG9yeSxcbiAqICAgICAgZGVwczogW0h0dHBDbGllbnRdLFxuICogICAgICBtdWx0aTogdHJ1ZVxuICogICAgfV1cbiAqICB9KVxuICogIGV4cG9ydCBjbGFzcyBBcHBNb2R1bGUge31cbiAqIGBgYFxuICpcbiAqICMjIyBFeGFtcGxlIHdpdGggc3RhbmRhbG9uZSBhcHBsaWNhdGlvblxuICogYGBgXG4gKiAgZnVuY3Rpb24gaW5pdGlhbGl6ZUFwcEZhY3RvcnkoaHR0cENsaWVudDogSHR0cENsaWVudCk6ICgpID0+IE9ic2VydmFibGU8YW55PiB7XG4gKiAgIHJldHVybiAoKSA9PiBodHRwQ2xpZW50LmdldChcImh0dHBzOi8vc29tZVVybC5jb20vYXBpL3VzZXJcIilcbiAqICAgICAucGlwZShcbiAqICAgICAgICB0YXAodXNlciA9PiB7IC4uLiB9KVxuICogICAgICk7XG4gKiAgfVxuICpcbiAqIGJvb3RzdHJhcEFwcGxpY2F0aW9uKEFwcCwge1xuICogICBwcm92aWRlcnM6IFtcbiAqICAgICBwcm92aWRlSHR0cENsaWVudCgpLFxuICogICAgIHtcbiAqICAgICAgIHByb3ZpZGU6IEFQUF9JTklUSUFMSVpFUixcbiAqICAgICAgIHVzZUZhY3Rvcnk6IGluaXRpYWxpemVBcHBGYWN0b3J5LFxuICogICAgICAgbXVsdGk6IHRydWUsXG4gKiAgICAgICBkZXBzOiBbSHR0cENsaWVudF0sXG4gKiAgICAgfSxcbiAqICAgXSxcbiAqIH0pO1xuICogYGBgXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY29uc3QgQVBQX0lOSVRJQUxJWkVSID0gbmV3IEluamVjdGlvblRva2VuPFxuICBSZWFkb25seUFycmF5PCgpID0+IE9ic2VydmFibGU8dW5rbm93bj4gfCBQcm9taXNlPHVua25vd24+IHwgdm9pZD5cbj4obmdEZXZNb2RlID8gJ0FwcGxpY2F0aW9uIEluaXRpYWxpemVyJyA6ICcnKTtcblxuLyoqXG4gKiBBIGNsYXNzIHRoYXQgcmVmbGVjdHMgdGhlIHN0YXRlIG9mIHJ1bm5pbmcge0BsaW5rIEFQUF9JTklUSUFMSVpFUn0gZnVuY3Rpb25zLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQEluamVjdGFibGUoe3Byb3ZpZGVkSW46ICdyb290J30pXG5leHBvcnQgY2xhc3MgQXBwbGljYXRpb25Jbml0U3RhdHVzIHtcbiAgLy8gVXNpbmcgbm9uIG51bGwgYXNzZXJ0aW9uLCB0aGVzZSBmaWVsZHMgYXJlIGRlZmluZWQgYmVsb3dcbiAgLy8gd2l0aGluIHRoZSBgbmV3IFByb21pc2VgIGNhbGxiYWNrIChzeW5jaHJvbm91c2x5KS5cbiAgcHJpdmF0ZSByZXNvbHZlITogKC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkO1xuICBwcml2YXRlIHJlamVjdCE6ICguLi5hcmdzOiBhbnlbXSkgPT4gdm9pZDtcblxuICBwcml2YXRlIGluaXRpYWxpemVkID0gZmFsc2U7XG4gIHB1YmxpYyByZWFkb25seSBkb25lID0gZmFsc2U7XG4gIHB1YmxpYyByZWFkb25seSBkb25lUHJvbWlzZTogUHJvbWlzZTxhbnk+ID0gbmV3IFByb21pc2UoKHJlcywgcmVqKSA9PiB7XG4gICAgdGhpcy5yZXNvbHZlID0gcmVzO1xuICAgIHRoaXMucmVqZWN0ID0gcmVqO1xuICB9KTtcblxuICBwcml2YXRlIHJlYWRvbmx5IGFwcEluaXRzID0gaW5qZWN0KEFQUF9JTklUSUFMSVpFUiwge29wdGlvbmFsOiB0cnVlfSkgPz8gW107XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgaWYgKCh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpICYmICFBcnJheS5pc0FycmF5KHRoaXMuYXBwSW5pdHMpKSB7XG4gICAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfTVVMVElfUFJPVklERVIsXG4gICAgICAgICdVbmV4cGVjdGVkIHR5cGUgb2YgdGhlIGBBUFBfSU5JVElBTElaRVJgIHRva2VuIHZhbHVlICcgK1xuICAgICAgICAgIGAoZXhwZWN0ZWQgYW4gYXJyYXksIGJ1dCBnb3QgJHt0eXBlb2YgdGhpcy5hcHBJbml0c30pLiBgICtcbiAgICAgICAgICAnUGxlYXNlIGNoZWNrIHRoYXQgdGhlIGBBUFBfSU5JVElBTElaRVJgIHRva2VuIGlzIGNvbmZpZ3VyZWQgYXMgYSAnICtcbiAgICAgICAgICAnYG11bHRpOiB0cnVlYCBwcm92aWRlci4nLFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIHJ1bkluaXRpYWxpemVycygpIHtcbiAgICBpZiAodGhpcy5pbml0aWFsaXplZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGFzeW5jSW5pdFByb21pc2VzID0gW107XG4gICAgZm9yIChjb25zdCBhcHBJbml0cyBvZiB0aGlzLmFwcEluaXRzKSB7XG4gICAgICBjb25zdCBpbml0UmVzdWx0ID0gYXBwSW5pdHMoKTtcbiAgICAgIGlmIChpc1Byb21pc2UoaW5pdFJlc3VsdCkpIHtcbiAgICAgICAgYXN5bmNJbml0UHJvbWlzZXMucHVzaChpbml0UmVzdWx0KTtcbiAgICAgIH0gZWxzZSBpZiAoaXNTdWJzY3JpYmFibGUoaW5pdFJlc3VsdCkpIHtcbiAgICAgICAgY29uc3Qgb2JzZXJ2YWJsZUFzUHJvbWlzZSA9IG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICBpbml0UmVzdWx0LnN1YnNjcmliZSh7Y29tcGxldGU6IHJlc29sdmUsIGVycm9yOiByZWplY3R9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGFzeW5jSW5pdFByb21pc2VzLnB1c2gob2JzZXJ2YWJsZUFzUHJvbWlzZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgY29tcGxldGUgPSAoKSA9PiB7XG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIG92ZXJ3cml0aW5nIGEgcmVhZG9ubHlcbiAgICAgIHRoaXMuZG9uZSA9IHRydWU7XG4gICAgICB0aGlzLnJlc29sdmUoKTtcbiAgICB9O1xuXG4gICAgUHJvbWlzZS5hbGwoYXN5bmNJbml0UHJvbWlzZXMpXG4gICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIGNvbXBsZXRlKCk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKChlKSA9PiB7XG4gICAgICAgIHRoaXMucmVqZWN0KGUpO1xuICAgICAgfSk7XG5cbiAgICBpZiAoYXN5bmNJbml0UHJvbWlzZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICBjb21wbGV0ZSgpO1xuICAgIH1cbiAgICB0aGlzLmluaXRpYWxpemVkID0gdHJ1ZTtcbiAgfVxufVxuIl19