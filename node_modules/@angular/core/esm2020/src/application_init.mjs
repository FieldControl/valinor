import { Inject, Injectable, InjectionToken, Optional } from './di';
import { isObservable, isPromise } from './util/lang';
import { noop } from './util/noop';
import * as i0 from "./r3_symbols";
/**
 * A [DI token](guide/glossary#di-token "DI token definition") that you can use to provide
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
 * @see `ApplicationInitStatus`
 *
 * @usageNotes
 *
 * The following example illustrates how to configure a multi-provider using `APP_INITIALIZER` token
 * and a function returning a promise.
 *
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
 * It's also possible to configure a multi-provider using `APP_INITIALIZER` token and a function
 * returning an observable, see an example below. Note: the `HttpClient` in this example is used for
 * demo purposes to illustrate how the factory function can work with other providers available
 * through DI.
 *
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
 * @publicApi
 */
export const APP_INITIALIZER = new InjectionToken('Application Initializer');
/**
 * A class that reflects the state of running {@link APP_INITIALIZER} functions.
 *
 * @publicApi
 */
export class ApplicationInitStatus {
    constructor(appInits) {
        this.appInits = appInits;
        this.resolve = noop;
        this.reject = noop;
        this.initialized = false;
        this.done = false;
        // TODO: Throw RuntimeErrorCode.INVALID_MULTI_PROVIDER if appInits is not an array
        this.donePromise = new Promise((res, rej) => {
            this.resolve = res;
            this.reject = rej;
        });
    }
    /** @internal */
    runInitializers() {
        if (this.initialized) {
            return;
        }
        const asyncInitPromises = [];
        const complete = () => {
            this.done = true;
            this.resolve();
        };
        if (this.appInits) {
            for (let i = 0; i < this.appInits.length; i++) {
                const initResult = this.appInits[i]();
                if (isPromise(initResult)) {
                    asyncInitPromises.push(initResult);
                }
                else if (isObservable(initResult)) {
                    const observableAsPromise = new Promise((resolve, reject) => {
                        initResult.subscribe({ complete: resolve, error: reject });
                    });
                    asyncInitPromises.push(observableAsPromise);
                }
            }
        }
        Promise.all(asyncInitPromises)
            .then(() => {
            complete();
        })
            .catch(e => {
            this.reject(e);
        });
        if (asyncInitPromises.length === 0) {
            complete();
        }
        this.initialized = true;
    }
}
ApplicationInitStatus.ɵfac = function ApplicationInitStatus_Factory(t) { return new (t || ApplicationInitStatus)(i0.ɵɵinject(APP_INITIALIZER, 8)); };
ApplicationInitStatus.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: ApplicationInitStatus, factory: ApplicationInitStatus.ɵfac, providedIn: 'root' });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.setClassMetadata(ApplicationInitStatus, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], function () { return [{ type: undefined, decorators: [{
                type: Inject,
                args: [APP_INITIALIZER]
            }, {
                type: Optional
            }] }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbGljYXRpb25faW5pdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL2FwcGxpY2F0aW9uX2luaXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBVUEsT0FBTyxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsY0FBYyxFQUFFLFFBQVEsRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUNsRSxPQUFPLEVBQUMsWUFBWSxFQUFFLFNBQVMsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUNwRCxPQUFPLEVBQUMsSUFBSSxFQUFDLE1BQU0sYUFBYSxDQUFDOztBQUdqQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBcUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sZUFBZSxHQUN4QixJQUFJLGNBQWMsQ0FDZCx5QkFBeUIsQ0FBQyxDQUFDO0FBRW5DOzs7O0dBSUc7QUFFSCxNQUFNLE9BQU8scUJBQXFCO0lBT2hDLFlBQWtFLFFBQ2M7UUFEZCxhQUFRLEdBQVIsUUFBUSxDQUNNO1FBUHhFLFlBQU8sR0FBRyxJQUFJLENBQUM7UUFDZixXQUFNLEdBQUcsSUFBSSxDQUFDO1FBQ2QsZ0JBQVcsR0FBRyxLQUFLLENBQUM7UUFFWixTQUFJLEdBQUcsS0FBSyxDQUFDO1FBSTNCLGtGQUFrRjtRQUNsRixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO1lBQzFDLElBQUksQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDO1lBQ25CLElBQUksQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDO1FBQ3BCLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELGdCQUFnQjtJQUNoQixlQUFlO1FBQ2IsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ3BCLE9BQU87U0FDUjtRQUVELE1BQU0saUJBQWlCLEdBQW1CLEVBQUUsQ0FBQztRQUU3QyxNQUFNLFFBQVEsR0FBRyxHQUFHLEVBQUU7WUFDbkIsSUFBd0IsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1lBQ3RDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNqQixDQUFDLENBQUM7UUFFRixJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDakIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUM3QyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7Z0JBQ3RDLElBQUksU0FBUyxDQUFDLFVBQVUsQ0FBQyxFQUFFO29CQUN6QixpQkFBaUIsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7aUJBQ3BDO3FCQUFNLElBQUksWUFBWSxDQUFDLFVBQVUsQ0FBQyxFQUFFO29CQUNuQyxNQUFNLG1CQUFtQixHQUFHLElBQUksT0FBTyxDQUFPLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO3dCQUNoRSxVQUFVLENBQUMsU0FBUyxDQUFDLEVBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFDLENBQUMsQ0FBQztvQkFDM0QsQ0FBQyxDQUFDLENBQUM7b0JBQ0gsaUJBQWlCLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7aUJBQzdDO2FBQ0Y7U0FDRjtRQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUM7YUFDekIsSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUNULFFBQVEsRUFBRSxDQUFDO1FBQ2IsQ0FBQyxDQUFDO2FBQ0QsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ1QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqQixDQUFDLENBQUMsQ0FBQztRQUVQLElBQUksaUJBQWlCLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUNsQyxRQUFRLEVBQUUsQ0FBQztTQUNaO1FBQ0QsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7SUFDMUIsQ0FBQzs7MEZBdkRVLHFCQUFxQixjQU9aLGVBQWU7MkVBUHhCLHFCQUFxQixXQUFyQixxQkFBcUIsbUJBRFQsTUFBTTtzRkFDbEIscUJBQXFCO2NBRGpDLFVBQVU7ZUFBQyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUM7O3NCQVFqQixNQUFNO3VCQUFDLGVBQWU7O3NCQUFHLFFBQVEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtPYnNlcnZhYmxlfSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHtJbmplY3QsIEluamVjdGFibGUsIEluamVjdGlvblRva2VuLCBPcHRpb25hbH0gZnJvbSAnLi9kaSc7XG5pbXBvcnQge2lzT2JzZXJ2YWJsZSwgaXNQcm9taXNlfSBmcm9tICcuL3V0aWwvbGFuZyc7XG5pbXBvcnQge25vb3B9IGZyb20gJy4vdXRpbC9ub29wJztcblxuXG4vKipcbiAqIEEgW0RJIHRva2VuXShndWlkZS9nbG9zc2FyeSNkaS10b2tlbiBcIkRJIHRva2VuIGRlZmluaXRpb25cIikgdGhhdCB5b3UgY2FuIHVzZSB0byBwcm92aWRlXG4gKiBvbmUgb3IgbW9yZSBpbml0aWFsaXphdGlvbiBmdW5jdGlvbnMuXG4gKlxuICogVGhlIHByb3ZpZGVkIGZ1bmN0aW9ucyBhcmUgaW5qZWN0ZWQgYXQgYXBwbGljYXRpb24gc3RhcnR1cCBhbmQgZXhlY3V0ZWQgZHVyaW5nXG4gKiBhcHAgaW5pdGlhbGl6YXRpb24uIElmIGFueSBvZiB0aGVzZSBmdW5jdGlvbnMgcmV0dXJucyBhIFByb21pc2Ugb3IgYW4gT2JzZXJ2YWJsZSwgaW5pdGlhbGl6YXRpb25cbiAqIGRvZXMgbm90IGNvbXBsZXRlIHVudGlsIHRoZSBQcm9taXNlIGlzIHJlc29sdmVkIG9yIHRoZSBPYnNlcnZhYmxlIGlzIGNvbXBsZXRlZC5cbiAqXG4gKiBZb3UgY2FuLCBmb3IgZXhhbXBsZSwgY3JlYXRlIGEgZmFjdG9yeSBmdW5jdGlvbiB0aGF0IGxvYWRzIGxhbmd1YWdlIGRhdGFcbiAqIG9yIGFuIGV4dGVybmFsIGNvbmZpZ3VyYXRpb24sIGFuZCBwcm92aWRlIHRoYXQgZnVuY3Rpb24gdG8gdGhlIGBBUFBfSU5JVElBTElaRVJgIHRva2VuLlxuICogVGhlIGZ1bmN0aW9uIGlzIGV4ZWN1dGVkIGR1cmluZyB0aGUgYXBwbGljYXRpb24gYm9vdHN0cmFwIHByb2Nlc3MsXG4gKiBhbmQgdGhlIG5lZWRlZCBkYXRhIGlzIGF2YWlsYWJsZSBvbiBzdGFydHVwLlxuICpcbiAqIEBzZWUgYEFwcGxpY2F0aW9uSW5pdFN0YXR1c2BcbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBpbGx1c3RyYXRlcyBob3cgdG8gY29uZmlndXJlIGEgbXVsdGktcHJvdmlkZXIgdXNpbmcgYEFQUF9JTklUSUFMSVpFUmAgdG9rZW5cbiAqIGFuZCBhIGZ1bmN0aW9uIHJldHVybmluZyBhIHByb21pc2UuXG4gKlxuICogYGBgXG4gKiAgZnVuY3Rpb24gaW5pdGlhbGl6ZUFwcCgpOiBQcm9taXNlPGFueT4ge1xuICogICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAqICAgICAgLy8gRG8gc29tZSBhc3luY2hyb25vdXMgc3R1ZmZcbiAqICAgICAgcmVzb2x2ZSgpO1xuICogICAgfSk7XG4gKiAgfVxuICpcbiAqICBATmdNb2R1bGUoe1xuICogICBpbXBvcnRzOiBbQnJvd3Nlck1vZHVsZV0sXG4gKiAgIGRlY2xhcmF0aW9uczogW0FwcENvbXBvbmVudF0sXG4gKiAgIGJvb3RzdHJhcDogW0FwcENvbXBvbmVudF0sXG4gKiAgIHByb3ZpZGVyczogW3tcbiAqICAgICBwcm92aWRlOiBBUFBfSU5JVElBTElaRVIsXG4gKiAgICAgdXNlRmFjdG9yeTogKCkgPT4gaW5pdGlhbGl6ZUFwcCxcbiAqICAgICBtdWx0aTogdHJ1ZVxuICogICAgfV1cbiAqICAgfSlcbiAqICBleHBvcnQgY2xhc3MgQXBwTW9kdWxlIHt9XG4gKiBgYGBcbiAqXG4gKiBJdCdzIGFsc28gcG9zc2libGUgdG8gY29uZmlndXJlIGEgbXVsdGktcHJvdmlkZXIgdXNpbmcgYEFQUF9JTklUSUFMSVpFUmAgdG9rZW4gYW5kIGEgZnVuY3Rpb25cbiAqIHJldHVybmluZyBhbiBvYnNlcnZhYmxlLCBzZWUgYW4gZXhhbXBsZSBiZWxvdy4gTm90ZTogdGhlIGBIdHRwQ2xpZW50YCBpbiB0aGlzIGV4YW1wbGUgaXMgdXNlZCBmb3JcbiAqIGRlbW8gcHVycG9zZXMgdG8gaWxsdXN0cmF0ZSBob3cgdGhlIGZhY3RvcnkgZnVuY3Rpb24gY2FuIHdvcmsgd2l0aCBvdGhlciBwcm92aWRlcnMgYXZhaWxhYmxlXG4gKiB0aHJvdWdoIERJLlxuICpcbiAqIGBgYFxuICogIGZ1bmN0aW9uIGluaXRpYWxpemVBcHBGYWN0b3J5KGh0dHBDbGllbnQ6IEh0dHBDbGllbnQpOiAoKSA9PiBPYnNlcnZhYmxlPGFueT4ge1xuICogICByZXR1cm4gKCkgPT4gaHR0cENsaWVudC5nZXQoXCJodHRwczovL3NvbWVVcmwuY29tL2FwaS91c2VyXCIpXG4gKiAgICAgLnBpcGUoXG4gKiAgICAgICAgdGFwKHVzZXIgPT4geyAuLi4gfSlcbiAqICAgICApO1xuICogIH1cbiAqXG4gKiAgQE5nTW9kdWxlKHtcbiAqICAgIGltcG9ydHM6IFtCcm93c2VyTW9kdWxlLCBIdHRwQ2xpZW50TW9kdWxlXSxcbiAqICAgIGRlY2xhcmF0aW9uczogW0FwcENvbXBvbmVudF0sXG4gKiAgICBib290c3RyYXA6IFtBcHBDb21wb25lbnRdLFxuICogICAgcHJvdmlkZXJzOiBbe1xuICogICAgICBwcm92aWRlOiBBUFBfSU5JVElBTElaRVIsXG4gKiAgICAgIHVzZUZhY3Rvcnk6IGluaXRpYWxpemVBcHBGYWN0b3J5LFxuICogICAgICBkZXBzOiBbSHR0cENsaWVudF0sXG4gKiAgICAgIG11bHRpOiB0cnVlXG4gKiAgICB9XVxuICogIH0pXG4gKiAgZXhwb3J0IGNsYXNzIEFwcE1vZHVsZSB7fVxuICogYGBgXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY29uc3QgQVBQX0lOSVRJQUxJWkVSID1cbiAgICBuZXcgSW5qZWN0aW9uVG9rZW48UmVhZG9ubHlBcnJheTwoKSA9PiBPYnNlcnZhYmxlPHVua25vd24+fCBQcm9taXNlPHVua25vd24+fCB2b2lkPj4oXG4gICAgICAgICdBcHBsaWNhdGlvbiBJbml0aWFsaXplcicpO1xuXG4vKipcbiAqIEEgY2xhc3MgdGhhdCByZWZsZWN0cyB0aGUgc3RhdGUgb2YgcnVubmluZyB7QGxpbmsgQVBQX0lOSVRJQUxJWkVSfSBmdW5jdGlvbnMuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ASW5qZWN0YWJsZSh7cHJvdmlkZWRJbjogJ3Jvb3QnfSlcbmV4cG9ydCBjbGFzcyBBcHBsaWNhdGlvbkluaXRTdGF0dXMge1xuICBwcml2YXRlIHJlc29sdmUgPSBub29wO1xuICBwcml2YXRlIHJlamVjdCA9IG5vb3A7XG4gIHByaXZhdGUgaW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgcHVibGljIHJlYWRvbmx5IGRvbmVQcm9taXNlOiBQcm9taXNlPGFueT47XG4gIHB1YmxpYyByZWFkb25seSBkb25lID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IoQEluamVjdChBUFBfSU5JVElBTElaRVIpIEBPcHRpb25hbCgpIHByaXZhdGUgcmVhZG9ubHkgYXBwSW5pdHM6XG4gICAgICAgICAgICAgICAgICBSZWFkb25seUFycmF5PCgpID0+IE9ic2VydmFibGU8dW5rbm93bj58IFByb21pc2U8dW5rbm93bj58IHZvaWQ+KSB7XG4gICAgLy8gVE9ETzogVGhyb3cgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX01VTFRJX1BST1ZJREVSIGlmIGFwcEluaXRzIGlzIG5vdCBhbiBhcnJheVxuICAgIHRoaXMuZG9uZVByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzLCByZWopID0+IHtcbiAgICAgIHRoaXMucmVzb2x2ZSA9IHJlcztcbiAgICAgIHRoaXMucmVqZWN0ID0gcmVqO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBydW5Jbml0aWFsaXplcnMoKSB7XG4gICAgaWYgKHRoaXMuaW5pdGlhbGl6ZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBhc3luY0luaXRQcm9taXNlczogUHJvbWlzZTxhbnk+W10gPSBbXTtcblxuICAgIGNvbnN0IGNvbXBsZXRlID0gKCkgPT4ge1xuICAgICAgKHRoaXMgYXMge2RvbmU6IGJvb2xlYW59KS5kb25lID0gdHJ1ZTtcbiAgICAgIHRoaXMucmVzb2x2ZSgpO1xuICAgIH07XG5cbiAgICBpZiAodGhpcy5hcHBJbml0cykge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmFwcEluaXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGluaXRSZXN1bHQgPSB0aGlzLmFwcEluaXRzW2ldKCk7XG4gICAgICAgIGlmIChpc1Byb21pc2UoaW5pdFJlc3VsdCkpIHtcbiAgICAgICAgICBhc3luY0luaXRQcm9taXNlcy5wdXNoKGluaXRSZXN1bHQpO1xuICAgICAgICB9IGVsc2UgaWYgKGlzT2JzZXJ2YWJsZShpbml0UmVzdWx0KSkge1xuICAgICAgICAgIGNvbnN0IG9ic2VydmFibGVBc1Byb21pc2UgPSBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBpbml0UmVzdWx0LnN1YnNjcmliZSh7Y29tcGxldGU6IHJlc29sdmUsIGVycm9yOiByZWplY3R9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBhc3luY0luaXRQcm9taXNlcy5wdXNoKG9ic2VydmFibGVBc1Byb21pc2UpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgUHJvbWlzZS5hbGwoYXN5bmNJbml0UHJvbWlzZXMpXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICBjb21wbGV0ZSgpO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goZSA9PiB7XG4gICAgICAgICAgdGhpcy5yZWplY3QoZSk7XG4gICAgICAgIH0pO1xuXG4gICAgaWYgKGFzeW5jSW5pdFByb21pc2VzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgY29tcGxldGUoKTtcbiAgICB9XG4gICAgdGhpcy5pbml0aWFsaXplZCA9IHRydWU7XG4gIH1cbn1cbiJdfQ==