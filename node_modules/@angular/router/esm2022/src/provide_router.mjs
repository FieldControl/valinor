/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { HashLocationStrategy, LOCATION_INITIALIZED, LocationStrategy, ViewportScroller, } from '@angular/common';
import { APP_BOOTSTRAP_LISTENER, APP_INITIALIZER, ApplicationRef, ENVIRONMENT_INITIALIZER, inject, InjectFlags, InjectionToken, Injector, makeEnvironmentProviders, NgZone, } from '@angular/core';
import { of, Subject } from 'rxjs';
import { INPUT_BINDER, RoutedComponentInputBinder } from './directives/router_outlet';
import { stringifyEvent } from './events';
import { NAVIGATION_ERROR_HANDLER, NavigationTransitions } from './navigation_transition';
import { Router } from './router';
import { ROUTER_CONFIGURATION } from './router_config';
import { ROUTES } from './router_config_loader';
import { PreloadingStrategy, RouterPreloader } from './router_preloader';
import { ROUTER_SCROLLER, RouterScroller } from './router_scroller';
import { ActivatedRoute } from './router_state';
import { UrlSerializer } from './url_tree';
import { afterNextNavigation } from './utils/navigations';
import { CREATE_VIEW_TRANSITION, createViewTransition, VIEW_TRANSITION_OPTIONS, } from './utils/view_transition';
/**
 * Sets up providers necessary to enable `Router` functionality for the application.
 * Allows to configure a set of routes as well as extra features that should be enabled.
 *
 * @usageNotes
 *
 * Basic example of how you can add a Router to your application:
 * ```
 * const appRoutes: Routes = [];
 * bootstrapApplication(AppComponent, {
 *   providers: [provideRouter(appRoutes)]
 * });
 * ```
 *
 * You can also enable optional features in the Router by adding functions from the `RouterFeatures`
 * type:
 * ```
 * const appRoutes: Routes = [];
 * bootstrapApplication(AppComponent,
 *   {
 *     providers: [
 *       provideRouter(appRoutes,
 *         withDebugTracing(),
 *         withRouterConfig({paramsInheritanceStrategy: 'always'}))
 *     ]
 *   }
 * );
 * ```
 *
 * @see {@link RouterFeatures}
 *
 * @publicApi
 * @param routes A set of `Route`s to use for the application routing table.
 * @param features Optional features to configure additional router behaviors.
 * @returns A set of providers to setup a Router.
 */
export function provideRouter(routes, ...features) {
    return makeEnvironmentProviders([
        { provide: ROUTES, multi: true, useValue: routes },
        typeof ngDevMode === 'undefined' || ngDevMode
            ? { provide: ROUTER_IS_PROVIDED, useValue: true }
            : [],
        { provide: ActivatedRoute, useFactory: rootRoute, deps: [Router] },
        { provide: APP_BOOTSTRAP_LISTENER, multi: true, useFactory: getBootstrapListener },
        features.map((feature) => feature.ɵproviders),
    ]);
}
export function rootRoute(router) {
    return router.routerState.root;
}
/**
 * Helper function to create an object that represents a Router feature.
 */
function routerFeature(kind, providers) {
    return { ɵkind: kind, ɵproviders: providers };
}
/**
 * An Injection token used to indicate whether `provideRouter` or `RouterModule.forRoot` was ever
 * called.
 */
export const ROUTER_IS_PROVIDED = new InjectionToken('', {
    providedIn: 'root',
    factory: () => false,
});
const routerIsProvidedDevModeCheck = {
    provide: ENVIRONMENT_INITIALIZER,
    multi: true,
    useFactory() {
        return () => {
            if (!inject(ROUTER_IS_PROVIDED)) {
                console.warn('`provideRoutes` was called without `provideRouter` or `RouterModule.forRoot`. ' +
                    'This is likely a mistake.');
            }
        };
    },
};
/**
 * Registers a DI provider for a set of routes.
 * @param routes The route configuration to provide.
 *
 * @usageNotes
 *
 * ```
 * @NgModule({
 *   providers: [provideRoutes(ROUTES)]
 * })
 * class LazyLoadedChildModule {}
 * ```
 *
 * @deprecated If necessary, provide routes using the `ROUTES` `InjectionToken`.
 * @see {@link ROUTES}
 * @publicApi
 */
export function provideRoutes(routes) {
    return [
        { provide: ROUTES, multi: true, useValue: routes },
        typeof ngDevMode === 'undefined' || ngDevMode ? routerIsProvidedDevModeCheck : [],
    ];
}
/**
 * Enables customizable scrolling behavior for router navigations.
 *
 * @usageNotes
 *
 * Basic example of how you can enable scrolling feature:
 * ```
 * const appRoutes: Routes = [];
 * bootstrapApplication(AppComponent,
 *   {
 *     providers: [
 *       provideRouter(appRoutes, withInMemoryScrolling())
 *     ]
 *   }
 * );
 * ```
 *
 * @see {@link provideRouter}
 * @see {@link ViewportScroller}
 *
 * @publicApi
 * @param options Set of configuration parameters to customize scrolling behavior, see
 *     `InMemoryScrollingOptions` for additional information.
 * @returns A set of providers for use with `provideRouter`.
 */
export function withInMemoryScrolling(options = {}) {
    const providers = [
        {
            provide: ROUTER_SCROLLER,
            useFactory: () => {
                const viewportScroller = inject(ViewportScroller);
                const zone = inject(NgZone);
                const transitions = inject(NavigationTransitions);
                const urlSerializer = inject(UrlSerializer);
                return new RouterScroller(urlSerializer, transitions, viewportScroller, zone, options);
            },
        },
    ];
    return routerFeature(4 /* RouterFeatureKind.InMemoryScrollingFeature */, providers);
}
export function getBootstrapListener() {
    const injector = inject(Injector);
    return (bootstrappedComponentRef) => {
        const ref = injector.get(ApplicationRef);
        if (bootstrappedComponentRef !== ref.components[0]) {
            return;
        }
        const router = injector.get(Router);
        const bootstrapDone = injector.get(BOOTSTRAP_DONE);
        if (injector.get(INITIAL_NAVIGATION) === 1 /* InitialNavigation.EnabledNonBlocking */) {
            router.initialNavigation();
        }
        injector.get(ROUTER_PRELOADER, null, InjectFlags.Optional)?.setUpPreloading();
        injector.get(ROUTER_SCROLLER, null, InjectFlags.Optional)?.init();
        router.resetRootComponentType(ref.componentTypes[0]);
        if (!bootstrapDone.closed) {
            bootstrapDone.next();
            bootstrapDone.complete();
            bootstrapDone.unsubscribe();
        }
    };
}
/**
 * A subject used to indicate that the bootstrapping phase is done. When initial navigation is
 * `enabledBlocking`, the first navigation waits until bootstrapping is finished before continuing
 * to the activation phase.
 */
const BOOTSTRAP_DONE = new InjectionToken(typeof ngDevMode === 'undefined' || ngDevMode ? 'bootstrap done indicator' : '', {
    factory: () => {
        return new Subject();
    },
});
const INITIAL_NAVIGATION = new InjectionToken(typeof ngDevMode === 'undefined' || ngDevMode ? 'initial navigation' : '', { providedIn: 'root', factory: () => 1 /* InitialNavigation.EnabledNonBlocking */ });
/**
 * Configures initial navigation to start before the root component is created.
 *
 * The bootstrap is blocked until the initial navigation is complete. This should be set in case
 * you use [server-side rendering](guide/ssr), but do not enable [hydration](guide/hydration) for
 * your application.
 *
 * @usageNotes
 *
 * Basic example of how you can enable this navigation behavior:
 * ```
 * const appRoutes: Routes = [];
 * bootstrapApplication(AppComponent,
 *   {
 *     providers: [
 *       provideRouter(appRoutes, withEnabledBlockingInitialNavigation())
 *     ]
 *   }
 * );
 * ```
 *
 * @see {@link provideRouter}
 *
 * @publicApi
 * @returns A set of providers for use with `provideRouter`.
 */
export function withEnabledBlockingInitialNavigation() {
    const providers = [
        { provide: INITIAL_NAVIGATION, useValue: 0 /* InitialNavigation.EnabledBlocking */ },
        {
            provide: APP_INITIALIZER,
            multi: true,
            deps: [Injector],
            useFactory: (injector) => {
                const locationInitialized = injector.get(LOCATION_INITIALIZED, Promise.resolve());
                return () => {
                    return locationInitialized.then(() => {
                        return new Promise((resolve) => {
                            const router = injector.get(Router);
                            const bootstrapDone = injector.get(BOOTSTRAP_DONE);
                            afterNextNavigation(router, () => {
                                // Unblock APP_INITIALIZER in case the initial navigation was canceled or errored
                                // without a redirect.
                                resolve(true);
                            });
                            injector.get(NavigationTransitions).afterPreactivation = () => {
                                // Unblock APP_INITIALIZER once we get to `afterPreactivation`. At this point, we
                                // assume activation will complete successfully (even though this is not
                                // guaranteed).
                                resolve(true);
                                return bootstrapDone.closed ? of(void 0) : bootstrapDone;
                            };
                            router.initialNavigation();
                        });
                    });
                };
            },
        },
    ];
    return routerFeature(2 /* RouterFeatureKind.EnabledBlockingInitialNavigationFeature */, providers);
}
/**
 * Disables initial navigation.
 *
 * Use if there is a reason to have more control over when the router starts its initial navigation
 * due to some complex initialization logic.
 *
 * @usageNotes
 *
 * Basic example of how you can disable initial navigation:
 * ```
 * const appRoutes: Routes = [];
 * bootstrapApplication(AppComponent,
 *   {
 *     providers: [
 *       provideRouter(appRoutes, withDisabledInitialNavigation())
 *     ]
 *   }
 * );
 * ```
 *
 * @see {@link provideRouter}
 *
 * @returns A set of providers for use with `provideRouter`.
 *
 * @publicApi
 */
export function withDisabledInitialNavigation() {
    const providers = [
        {
            provide: APP_INITIALIZER,
            multi: true,
            useFactory: () => {
                const router = inject(Router);
                return () => {
                    router.setUpLocationChangeListener();
                };
            },
        },
        { provide: INITIAL_NAVIGATION, useValue: 2 /* InitialNavigation.Disabled */ },
    ];
    return routerFeature(3 /* RouterFeatureKind.DisabledInitialNavigationFeature */, providers);
}
/**
 * Enables logging of all internal navigation events to the console.
 * Extra logging might be useful for debugging purposes to inspect Router event sequence.
 *
 * @usageNotes
 *
 * Basic example of how you can enable debug tracing:
 * ```
 * const appRoutes: Routes = [];
 * bootstrapApplication(AppComponent,
 *   {
 *     providers: [
 *       provideRouter(appRoutes, withDebugTracing())
 *     ]
 *   }
 * );
 * ```
 *
 * @see {@link provideRouter}
 *
 * @returns A set of providers for use with `provideRouter`.
 *
 * @publicApi
 */
export function withDebugTracing() {
    let providers = [];
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
        providers = [
            {
                provide: ENVIRONMENT_INITIALIZER,
                multi: true,
                useFactory: () => {
                    const router = inject(Router);
                    return () => router.events.subscribe((e) => {
                        // tslint:disable:no-console
                        console.group?.(`Router Event: ${e.constructor.name}`);
                        console.log(stringifyEvent(e));
                        console.log(e);
                        console.groupEnd?.();
                        // tslint:enable:no-console
                    });
                },
            },
        ];
    }
    else {
        providers = [];
    }
    return routerFeature(1 /* RouterFeatureKind.DebugTracingFeature */, providers);
}
const ROUTER_PRELOADER = new InjectionToken(typeof ngDevMode === 'undefined' || ngDevMode ? 'router preloader' : '');
/**
 * Allows to configure a preloading strategy to use. The strategy is configured by providing a
 * reference to a class that implements a `PreloadingStrategy`.
 *
 * @usageNotes
 *
 * Basic example of how you can configure preloading:
 * ```
 * const appRoutes: Routes = [];
 * bootstrapApplication(AppComponent,
 *   {
 *     providers: [
 *       provideRouter(appRoutes, withPreloading(PreloadAllModules))
 *     ]
 *   }
 * );
 * ```
 *
 * @see {@link provideRouter}
 *
 * @param preloadingStrategy A reference to a class that implements a `PreloadingStrategy` that
 *     should be used.
 * @returns A set of providers for use with `provideRouter`.
 *
 * @publicApi
 */
export function withPreloading(preloadingStrategy) {
    const providers = [
        { provide: ROUTER_PRELOADER, useExisting: RouterPreloader },
        { provide: PreloadingStrategy, useExisting: preloadingStrategy },
    ];
    return routerFeature(0 /* RouterFeatureKind.PreloadingFeature */, providers);
}
/**
 * Allows to provide extra parameters to configure Router.
 *
 * @usageNotes
 *
 * Basic example of how you can provide extra configuration options:
 * ```
 * const appRoutes: Routes = [];
 * bootstrapApplication(AppComponent,
 *   {
 *     providers: [
 *       provideRouter(appRoutes, withRouterConfig({
 *          onSameUrlNavigation: 'reload'
 *       }))
 *     ]
 *   }
 * );
 * ```
 *
 * @see {@link provideRouter}
 *
 * @param options A set of parameters to configure Router, see `RouterConfigOptions` for
 *     additional information.
 * @returns A set of providers for use with `provideRouter`.
 *
 * @publicApi
 */
export function withRouterConfig(options) {
    const providers = [{ provide: ROUTER_CONFIGURATION, useValue: options }];
    return routerFeature(5 /* RouterFeatureKind.RouterConfigurationFeature */, providers);
}
/**
 * Provides the location strategy that uses the URL fragment instead of the history API.
 *
 * @usageNotes
 *
 * Basic example of how you can use the hash location option:
 * ```
 * const appRoutes: Routes = [];
 * bootstrapApplication(AppComponent,
 *   {
 *     providers: [
 *       provideRouter(appRoutes, withHashLocation())
 *     ]
 *   }
 * );
 * ```
 *
 * @see {@link provideRouter}
 * @see {@link HashLocationStrategy}
 *
 * @returns A set of providers for use with `provideRouter`.
 *
 * @publicApi
 */
export function withHashLocation() {
    const providers = [{ provide: LocationStrategy, useClass: HashLocationStrategy }];
    return routerFeature(6 /* RouterFeatureKind.RouterHashLocationFeature */, providers);
}
/**
 * Provides a function which is called when a navigation error occurs.
 *
 * This function is run inside application's [injection context](guide/di/dependency-injection-context)
 * so you can use the [`inject`](api/core/inject) function.
 *
 * This function can return a `RedirectCommand` to convert the error to a redirect, similar to returning
 * a `UrlTree` or `RedirectCommand` from a guard. This will also prevent the `Router` from emitting
 * `NavigationError`; it will instead emit `NavigationCancel` with code NavigationCancellationCode.Redirect.
 * Return values other than `RedirectCommand` are ignored and do not change any behavior with respect to
 * how the `Router` handles the error.
 *
 * @usageNotes
 *
 * Basic example of how you can use the error handler option:
 * ```
 * const appRoutes: Routes = [];
 * bootstrapApplication(AppComponent,
 *   {
 *     providers: [
 *       provideRouter(appRoutes, withNavigationErrorHandler((e: NavigationError) =>
 * inject(MyErrorTracker).trackError(e)))
 *     ]
 *   }
 * );
 * ```
 *
 * @see {@link NavigationError}
 * @see {@link core/inject}
 * @see {@link runInInjectionContext}
 *
 * @returns A set of providers for use with `provideRouter`.
 *
 * @publicApi
 */
export function withNavigationErrorHandler(handler) {
    const providers = [
        {
            provide: NAVIGATION_ERROR_HANDLER,
            useValue: handler,
        },
    ];
    return routerFeature(7 /* RouterFeatureKind.NavigationErrorHandlerFeature */, providers);
}
/**
 * Enables binding information from the `Router` state directly to the inputs of the component in
 * `Route` configurations.
 *
 * @usageNotes
 *
 * Basic example of how you can enable the feature:
 * ```
 * const appRoutes: Routes = [];
 * bootstrapApplication(AppComponent,
 *   {
 *     providers: [
 *       provideRouter(appRoutes, withComponentInputBinding())
 *     ]
 *   }
 * );
 * ```
 *
 * The router bindings information from any of the following sources:
 *
 *  - query parameters
 *  - path and matrix parameters
 *  - static route data
 *  - data from resolvers
 *
 * Duplicate keys are resolved in the same order from above, from least to greatest,
 * meaning that resolvers have the highest precedence and override any of the other information
 * from the route.
 *
 * Importantly, when an input does not have an item in the route data with a matching key, this
 * input is set to `undefined`. This prevents previous information from being
 * retained if the data got removed from the route (i.e. if a query parameter is removed).
 * Default values can be provided with a resolver on the route to ensure the value is always present
 * or an input and use an input transform in the component.
 *
 * @see {@link guide/components/inputs#input-transforms input transforms}
 * @returns A set of providers for use with `provideRouter`.
 */
export function withComponentInputBinding() {
    const providers = [
        RoutedComponentInputBinder,
        { provide: INPUT_BINDER, useExisting: RoutedComponentInputBinder },
    ];
    return routerFeature(8 /* RouterFeatureKind.ComponentInputBindingFeature */, providers);
}
/**
 * Enables view transitions in the Router by running the route activation and deactivation inside of
 * `document.startViewTransition`.
 *
 * Note: The View Transitions API is not available in all browsers. If the browser does not support
 * view transitions, the Router will not attempt to start a view transition and continue processing
 * the navigation as usual.
 *
 * @usageNotes
 *
 * Basic example of how you can enable the feature:
 * ```
 * const appRoutes: Routes = [];
 * bootstrapApplication(AppComponent,
 *   {
 *     providers: [
 *       provideRouter(appRoutes, withViewTransitions())
 *     ]
 *   }
 * );
 * ```
 *
 * @returns A set of providers for use with `provideRouter`.
 * @see https://developer.chrome.com/docs/web-platform/view-transitions/
 * @see https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API
 * @developerPreview
 */
export function withViewTransitions(options) {
    const providers = [
        { provide: CREATE_VIEW_TRANSITION, useValue: createViewTransition },
        {
            provide: VIEW_TRANSITION_OPTIONS,
            useValue: { skipNextTransition: !!options?.skipInitialTransition, ...options },
        },
    ];
    return routerFeature(9 /* RouterFeatureKind.ViewTransitionsFeature */, providers);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvdmlkZV9yb3V0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9yb3V0ZXIvc3JjL3Byb3ZpZGVfcm91dGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFDTCxvQkFBb0IsRUFDcEIsb0JBQW9CLEVBQ3BCLGdCQUFnQixFQUNoQixnQkFBZ0IsR0FDakIsTUFBTSxpQkFBaUIsQ0FBQztBQUN6QixPQUFPLEVBQ0wsc0JBQXNCLEVBQ3RCLGVBQWUsRUFDZixjQUFjLEVBRWQsdUJBQXVCLEVBRXZCLE1BQU0sRUFDTixXQUFXLEVBQ1gsY0FBYyxFQUNkLFFBQVEsRUFDUix3QkFBd0IsRUFDeEIsTUFBTSxHQUlQLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBQyxFQUFFLEVBQUUsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBRWpDLE9BQU8sRUFBQyxZQUFZLEVBQUUsMEJBQTBCLEVBQUMsTUFBTSw0QkFBNEIsQ0FBQztBQUNwRixPQUFPLEVBQXlCLGNBQWMsRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUVoRSxPQUFPLEVBQUMsd0JBQXdCLEVBQUUscUJBQXFCLEVBQUMsTUFBTSx5QkFBeUIsQ0FBQztBQUN4RixPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0sVUFBVSxDQUFDO0FBQ2hDLE9BQU8sRUFBMkIsb0JBQW9CLEVBQXNCLE1BQU0saUJBQWlCLENBQUM7QUFDcEcsT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQzlDLE9BQU8sRUFBQyxrQkFBa0IsRUFBRSxlQUFlLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUN2RSxPQUFPLEVBQUMsZUFBZSxFQUFFLGNBQWMsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ2xFLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUM5QyxPQUFPLEVBQUMsYUFBYSxFQUFD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Ozs7Ozs7R0FrQ0c7QUFDSCxNQUFNLFVBQVUsMEJBQTBCLENBQ3hDLE9BQThEO0lBRTlELE1BQU0sU0FBUyxHQUFHO1FBQ2hCO1lBQ0UsT0FBTyxFQUFFLHdCQUF3QjtZQUNqQyxRQUFRLEVBQUUsT0FBTztTQUNsQjtLQUNGLENBQUM7SUFDRixPQUFPLGFBQWEsMERBQWtELFNBQVMsQ0FBQyxDQUFDO0FBQ25GLENBQUM7QUF1QkQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FxQ0c7QUFDSCxNQUFNLFVBQVUseUJBQXlCO0lBQ3ZDLE1BQU0sU0FBUyxHQUFHO1FBQ2hCLDBCQUEwQjtRQUMxQixFQUFDLE9BQU8sRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFLDBCQUEwQixFQUFDO0tBQ2pFLENBQUM7SUFFRixPQUFPLGFBQWEseURBQWlELFNBQVMsQ0FBQyxDQUFDO0FBQ2xGLENBQUM7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0EwQkc7QUFDSCxNQUFNLFVBQVUsbUJBQW1CLENBQ2pDLE9BQXVDO0lBRXZDLE1BQU0sU0FBUyxHQUFHO1FBQ2hCLEVBQUMsT0FBTyxFQUFFLHNCQUFzQixFQUFFLFFBQVEsRUFBRSxvQkFBb0IsRUFBQztRQUNqRTtZQUNFLE9BQU8sRUFBRSx1QkFBdUI7WUFDaEMsUUFBUSxFQUFFLEVBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxHQUFHLE9BQU8sRUFBQztTQUM3RTtLQUNGLENBQUM7SUFDRixPQUFPLGFBQWEsbURBQTJDLFNBQVMsQ0FBQyxDQUFDO0FBQzVFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIEhhc2hMb2NhdGlvblN0cmF0ZWd5LFxuICBMT0NBVElPTl9JTklUSUFMSVpFRCxcbiAgTG9jYXRpb25TdHJhdGVneSxcbiAgVmlld3BvcnRTY3JvbGxlcixcbn0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7XG4gIEFQUF9CT09UU1RSQVBfTElTVEVORVIsXG4gIEFQUF9JTklUSUFMSVpFUixcbiAgQXBwbGljYXRpb25SZWYsXG4gIENvbXBvbmVudFJlZixcbiAgRU5WSVJPTk1FTlRfSU5JVElBTElaRVIsXG4gIEVudmlyb25tZW50UHJvdmlkZXJzLFxuICBpbmplY3QsXG4gIEluamVjdEZsYWdzLFxuICBJbmplY3Rpb25Ub2tlbixcbiAgSW5qZWN0b3IsXG4gIG1ha2VFbnZpcm9ubWVudFByb3ZpZGVycyxcbiAgTmdab25lLFxuICBQcm92aWRlcixcbiAgcnVuSW5JbmplY3Rpb25Db250ZXh0LFxuICBUeXBlLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7b2YsIFN1YmplY3R9IGZyb20gJ3J4anMnO1xuXG5pbXBvcnQge0lOUFVUX0JJTkRFUiwgUm91dGVkQ29tcG9uZW50SW5wdXRCaW5kZXJ9IGZyb20gJy4vZGlyZWN0aXZlcy9yb3V0ZXJfb3V0bGV0JztcbmltcG9ydCB7RXZlbnQsIE5hdmlnYXRpb25FcnJvciwgc3RyaW5naWZ5RXZlbnR9IGZyb20gJy4vZXZlbnRzJztcbmltcG9ydCB7UmVkaXJlY3RDb21tYW5kLCBSb3V0ZXN9IGZyb20gJy4vbW9kZWxzJztcbmltcG9ydCB7TkFWSUdBVElPTl9FUlJPUl9IQU5ETEVSLCBOYXZpZ2F0aW9uVHJhbnNpdGlvbnN9IGZyb20gJy4vbmF2aWdhdGlvbl90cmFuc2l0aW9uJztcbmltcG9ydCB7Um91dGVyfSBmcm9tICcuL3JvdXRlcic7XG5pbXBvcnQge0luTWVtb3J5U2Nyb2xsaW5nT3B0aW9ucywgUk9VVEVSX0NPTkZJR1VSQVRJT04sIFJvdXRlckNvbmZpZ09wdGlvbnN9IGZyb20gJy4vcm91dGVyX2NvbmZpZyc7XG5pbXBvcnQge1JPVVRFU30gZnJvbSAnLi9yb3V0ZXJfY29uZmlnX2xvYWRlcic7XG5pbXBvcnQge1ByZWxvYWRpbmdTdHJhdGVneSwgUm91dGVyUHJlbG9hZGVyfSBmcm9tICcuL3JvdXRlcl9wcmVsb2FkZXInO1xuaW1wb3J0IHtST1VURVJfU0NST0xMRVIsIFJvdXRlclNjcm9sbGVyfSBmcm9tICcuL3JvdXRlcl9zY3JvbGxlcic7XG5pbXBvcnQge0FjdGl2YXRlZFJvdXRlfSBmcm9tICcuL3JvdXRlcl9zdGF0ZSc7XG5pbXBvcnQge1VybFNlcmlhbGl6ZXJ9IGZyb20gJy4vdXJsX3RyZWUnO1xuaW1wb3J0IHthZnRlck5leHROYXZpZ2F0aW9ufSBmcm9tICcuL3V0aWxzL25hdmlnYXRpb25zJztcbmltcG9ydCB7XG4gIENSRUFURV9WSUVXX1RSQU5TSVRJT04sXG4gIGNyZWF0ZVZpZXdUcmFuc2l0aW9uLFxuICBWSUVXX1RSQU5TSVRJT05fT1BUSU9OUyxcbiAgVmlld1RyYW5zaXRpb25zRmVhdHVyZU9wdGlvbnMsXG59IGZyb20gJy4vdXRpbHMvdmlld190cmFuc2l0aW9uJztcblxuLyoqXG4gKiBTZXRzIHVwIHByb3ZpZGVycyBuZWNlc3NhcnkgdG8gZW5hYmxlIGBSb3V0ZXJgIGZ1bmN0aW9uYWxpdHkgZm9yIHRoZSBhcHBsaWNhdGlvbi5cbiAqIEFsbG93cyB0byBjb25maWd1cmUgYSBzZXQgb2Ygcm91dGVzIGFzIHdlbGwgYXMgZXh0cmEgZmVhdHVyZXMgdGhhdCBzaG91bGQgYmUgZW5hYmxlZC5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqIEJhc2ljIGV4YW1wbGUgb2YgaG93IHlvdSBjYW4gYWRkIGEgUm91dGVyIHRvIHlvdXIgYXBwbGljYXRpb246XG4gKiBgYGBcbiAqIGNvbnN0IGFwcFJvdXRlczogUm91dGVzID0gW107XG4gKiBib290c3RyYXBBcHBsaWNhdGlvbihBcHBDb21wb25lbnQsIHtcbiAqICAgcHJvdmlkZXJzOiBbcHJvdmlkZVJvdXRlcihhcHBSb3V0ZXMpXVxuICogfSk7XG4gKiBgYGBcbiAqXG4gKiBZb3UgY2FuIGFsc28gZW5hYmxlIG9wdGlvbmFsIGZlYXR1cmVzIGluIHRoZSBSb3V0ZXIgYnkgYWRkaW5nIGZ1bmN0aW9ucyBmcm9tIHRoZSBgUm91dGVyRmVhdHVyZXNgXG4gKiB0eXBlOlxuICogYGBgXG4gKiBjb25zdCBhcHBSb3V0ZXM6IFJvdXRlcyA9IFtdO1xuICogYm9vdHN0cmFwQXBwbGljYXRpb24oQXBwQ29tcG9uZW50LFxuICogICB7XG4gKiAgICAgcHJvdmlkZXJzOiBbXG4gKiAgICAgICBwcm92aWRlUm91dGVyKGFwcFJvdXRlcyxcbiAqICAgICAgICAgd2l0aERlYnVnVHJhY2luZygpLFxuICogICAgICAgICB3aXRoUm91dGVyQ29uZmlnKHtwYXJhbXNJbmhlcml0YW5jZVN0cmF0ZWd5OiAnYWx3YXlzJ30pKVxuICogICAgIF1cbiAqICAgfVxuICogKTtcbiAqIGBgYFxuICpcbiAqIEBzZWUge0BsaW5rIFJvdXRlckZlYXR1cmVzfVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqIEBwYXJhbSByb3V0ZXMgQSBzZXQgb2YgYFJvdXRlYHMgdG8gdXNlIGZvciB0aGUgYXBwbGljYXRpb24gcm91dGluZyB0YWJsZS5cbiAqIEBwYXJhbSBmZWF0dXJlcyBPcHRpb25hbCBmZWF0dXJlcyB0byBjb25maWd1cmUgYWRkaXRpb25hbCByb3V0ZXIgYmVoYXZpb3JzLlxuICogQHJldHVybnMgQSBzZXQgb2YgcHJvdmlkZXJzIHRvIHNldHVwIGEgUm91dGVyLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZVJvdXRlcihyb3V0ZXM6IFJvdXRlcywgLi4uZmVhdHVyZXM6IFJvdXRlckZlYXR1cmVzW10pOiBFbnZpcm9ubWVudFByb3ZpZGVycyB7XG4gIHJldHVybiBtYWtlRW52aXJvbm1lbnRQcm92aWRlcnMoW1xuICAgIHtwcm92aWRlOiBST1VURVMsIG11bHRpOiB0cnVlLCB1c2VWYWx1ZTogcm91dGVzfSxcbiAgICB0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGVcbiAgICAgID8ge3Byb3ZpZGU6IFJPVVRFUl9JU19QUk9WSURFRCwgdXNlVmFsdWU6IHRydWV9XG4gICAgICA6IFtdLFxuICAgIHtwcm92aWRlOiBBY3RpdmF0ZWRSb3V0ZSwgdXNlRmFjdG9yeTogcm9vdFJvdXRlLCBkZXBzOiBbUm91dGVyXX0sXG4gICAge3Byb3ZpZGU6IEFQUF9CT09UU1RSQVBfTElTVEVORVIsIG11bHRpOiB0cnVlLCB1c2VGYWN0b3J5OiBnZXRCb290c3RyYXBMaXN0ZW5lcn0sXG4gICAgZmVhdHVyZXMubWFwKChmZWF0dXJlKSA9PiBmZWF0dXJlLsm1cHJvdmlkZXJzKSxcbiAgXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByb290Um91dGUocm91dGVyOiBSb3V0ZXIpOiBBY3RpdmF0ZWRSb3V0ZSB7XG4gIHJldHVybiByb3V0ZXIucm91dGVyU3RhdGUucm9vdDtcbn1cblxuLyoqXG4gKiBIZWxwZXIgdHlwZSB0byByZXByZXNlbnQgYSBSb3V0ZXIgZmVhdHVyZS5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUm91dGVyRmVhdHVyZTxGZWF0dXJlS2luZCBleHRlbmRzIFJvdXRlckZlYXR1cmVLaW5kPiB7XG4gIMm1a2luZDogRmVhdHVyZUtpbmQ7XG4gIMm1cHJvdmlkZXJzOiBQcm92aWRlcltdO1xufVxuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0byBjcmVhdGUgYW4gb2JqZWN0IHRoYXQgcmVwcmVzZW50cyBhIFJvdXRlciBmZWF0dXJlLlxuICovXG5mdW5jdGlvbiByb3V0ZXJGZWF0dXJlPEZlYXR1cmVLaW5kIGV4dGVuZHMgUm91dGVyRmVhdHVyZUtpbmQ+KFxuICBraW5kOiBGZWF0dXJlS2luZCxcbiAgcHJvdmlkZXJzOiBQcm92aWRlcltdLFxuKTogUm91dGVyRmVhdHVyZTxGZWF0dXJlS2luZD4ge1xuICByZXR1cm4ge8m1a2luZDoga2luZCwgybVwcm92aWRlcnM6IHByb3ZpZGVyc307XG59XG5cbi8qKlxuICogQW4gSW5qZWN0aW9uIHRva2VuIHVzZWQgdG8gaW5kaWNhdGUgd2hldGhlciBgcHJvdmlkZVJvdXRlcmAgb3IgYFJvdXRlck1vZHVsZS5mb3JSb290YCB3YXMgZXZlclxuICogY2FsbGVkLlxuICovXG5leHBvcnQgY29uc3QgUk9VVEVSX0lTX1BST1ZJREVEID0gbmV3IEluamVjdGlvblRva2VuPGJvb2xlYW4+KCcnLCB7XG4gIHByb3ZpZGVkSW46ICdyb290JyxcbiAgZmFjdG9yeTogKCkgPT4gZmFsc2UsXG59KTtcblxuY29uc3Qgcm91dGVySXNQcm92aWRlZERldk1vZGVDaGVjayA9IHtcbiAgcHJvdmlkZTogRU5WSVJPTk1FTlRfSU5JVElBTElaRVIsXG4gIG11bHRpOiB0cnVlLFxuICB1c2VGYWN0b3J5KCkge1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBpZiAoIWluamVjdChST1VURVJfSVNfUFJPVklERUQpKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICAnYHByb3ZpZGVSb3V0ZXNgIHdhcyBjYWxsZWQgd2l0aG91dCBgcHJvdmlkZVJvdXRlcmAgb3IgYFJvdXRlck1vZHVsZS5mb3JSb290YC4gJyArXG4gICAgICAgICAgICAnVGhpcyBpcyBsaWtlbHkgYSBtaXN0YWtlLicsXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfTtcbiAgfSxcbn07XG5cbi8qKlxuICogUmVnaXN0ZXJzIGEgREkgcHJvdmlkZXIgZm9yIGEgc2V0IG9mIHJvdXRlcy5cbiAqIEBwYXJhbSByb3V0ZXMgVGhlIHJvdXRlIGNvbmZpZ3VyYXRpb24gdG8gcHJvdmlkZS5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqIGBgYFxuICogQE5nTW9kdWxlKHtcbiAqICAgcHJvdmlkZXJzOiBbcHJvdmlkZVJvdXRlcyhST1VURVMpXVxuICogfSlcbiAqIGNsYXNzIExhenlMb2FkZWRDaGlsZE1vZHVsZSB7fVxuICogYGBgXG4gKlxuICogQGRlcHJlY2F0ZWQgSWYgbmVjZXNzYXJ5LCBwcm92aWRlIHJvdXRlcyB1c2luZyB0aGUgYFJPVVRFU2AgYEluamVjdGlvblRva2VuYC5cbiAqIEBzZWUge0BsaW5rIFJPVVRFU31cbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByb3ZpZGVSb3V0ZXMocm91dGVzOiBSb3V0ZXMpOiBQcm92aWRlcltdIHtcbiAgcmV0dXJuIFtcbiAgICB7cHJvdmlkZTogUk9VVEVTLCBtdWx0aTogdHJ1ZSwgdXNlVmFsdWU6IHJvdXRlc30sXG4gICAgdHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlID8gcm91dGVySXNQcm92aWRlZERldk1vZGVDaGVjayA6IFtdLFxuICBdO1xufVxuXG4vKipcbiAqIEEgdHlwZSBhbGlhcyBmb3IgcHJvdmlkZXJzIHJldHVybmVkIGJ5IGB3aXRoSW5NZW1vcnlTY3JvbGxpbmdgIGZvciB1c2Ugd2l0aCBgcHJvdmlkZVJvdXRlcmAuXG4gKlxuICogQHNlZSB7QGxpbmsgd2l0aEluTWVtb3J5U2Nyb2xsaW5nfVxuICogQHNlZSB7QGxpbmsgcHJvdmlkZVJvdXRlcn1cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCB0eXBlIEluTWVtb3J5U2Nyb2xsaW5nRmVhdHVyZSA9IFJvdXRlckZlYXR1cmU8Um91dGVyRmVhdHVyZUtpbmQuSW5NZW1vcnlTY3JvbGxpbmdGZWF0dXJlPjtcblxuLyoqXG4gKiBFbmFibGVzIGN1c3RvbWl6YWJsZSBzY3JvbGxpbmcgYmVoYXZpb3IgZm9yIHJvdXRlciBuYXZpZ2F0aW9ucy5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqIEJhc2ljIGV4YW1wbGUgb2YgaG93IHlvdSBjYW4gZW5hYmxlIHNjcm9sbGluZyBmZWF0dXJlOlxuICogYGBgXG4gKiBjb25zdCBhcHBSb3V0ZXM6IFJvdXRlcyA9IFtdO1xuICogYm9vdHN0cmFwQXBwbGljYXRpb24oQXBwQ29tcG9uZW50LFxuICogICB7XG4gKiAgICAgcHJvdmlkZXJzOiBbXG4gKiAgICAgICBwcm92aWRlUm91dGVyKGFwcFJvdXRlcywgd2l0aEluTWVtb3J5U2Nyb2xsaW5nKCkpXG4gKiAgICAgXVxuICogICB9XG4gKiApO1xuICogYGBgXG4gKlxuICogQHNlZSB7QGxpbmsgcHJvdmlkZVJvdXRlcn1cbiAqIEBzZWUge0BsaW5rIFZpZXdwb3J0U2Nyb2xsZXJ9XG4gKlxuICogQHB1YmxpY0FwaVxuICogQHBhcmFtIG9wdGlvbnMgU2V0IG9mIGNvbmZpZ3VyYXRpb24gcGFyYW1ldGVycyB0byBjdXN0b21pemUgc2Nyb2xsaW5nIGJlaGF2aW9yLCBzZWVcbiAqICAgICBgSW5NZW1vcnlTY3JvbGxpbmdPcHRpb25zYCBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvbi5cbiAqIEByZXR1cm5zIEEgc2V0IG9mIHByb3ZpZGVycyBmb3IgdXNlIHdpdGggYHByb3ZpZGVSb3V0ZXJgLlxuICovXG5leHBvcnQgZnVuY3Rpb24gd2l0aEluTWVtb3J5U2Nyb2xsaW5nKFxuICBvcHRpb25zOiBJbk1lbW9yeVNjcm9sbGluZ09wdGlvbnMgPSB7fSxcbik6IEluTWVtb3J5U2Nyb2xsaW5nRmVhdHVyZSB7XG4gIGNvbnN0IHByb3ZpZGVycyA9IFtcbiAgICB7XG4gICAgICBwcm92aWRlOiBST1VURVJfU0NST0xMRVIsXG4gICAgICB1c2VGYWN0b3J5OiAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHZpZXdwb3J0U2Nyb2xsZXIgPSBpbmplY3QoVmlld3BvcnRTY3JvbGxlcik7XG4gICAgICAgIGNvbnN0IHpvbmUgPSBpbmplY3QoTmdab25lKTtcbiAgICAgICAgY29uc3QgdHJhbnNpdGlvbnMgPSBpbmplY3QoTmF2aWdhdGlvblRyYW5zaXRpb25zKTtcbiAgICAgICAgY29uc3QgdXJsU2VyaWFsaXplciA9IGluamVjdChVcmxTZXJpYWxpemVyKTtcbiAgICAgICAgcmV0dXJuIG5ldyBSb3V0ZXJTY3JvbGxlcih1cmxTZXJpYWxpemVyLCB0cmFuc2l0aW9ucywgdmlld3BvcnRTY3JvbGxlciwgem9uZSwgb3B0aW9ucyk7XG4gICAgICB9LFxuICAgIH0sXG4gIF07XG4gIHJldHVybiByb3V0ZXJGZWF0dXJlKFJvdXRlckZlYXR1cmVLaW5kLkluTWVtb3J5U2Nyb2xsaW5nRmVhdHVyZSwgcHJvdmlkZXJzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEJvb3RzdHJhcExpc3RlbmVyKCkge1xuICBjb25zdCBpbmplY3RvciA9IGluamVjdChJbmplY3Rvcik7XG4gIHJldHVybiAoYm9vdHN0cmFwcGVkQ29tcG9uZW50UmVmOiBDb21wb25lbnRSZWY8dW5rbm93bj4pID0+IHtcbiAgICBjb25zdCByZWYgPSBpbmplY3Rvci5nZXQoQXBwbGljYXRpb25SZWYpO1xuXG4gICAgaWYgKGJvb3RzdHJhcHBlZENvbXBvbmVudFJlZiAhPT0gcmVmLmNvbXBvbmVudHNbMF0pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCByb3V0ZXIgPSBpbmplY3Rvci5nZXQoUm91dGVyKTtcbiAgICBjb25zdCBib290c3RyYXBEb25lID0gaW5qZWN0b3IuZ2V0KEJPT1RTVFJBUF9ET05FKTtcblxuICAgIGlmIChpbmplY3Rvci5nZXQoSU5JVElBTF9OQVZJR0FUSU9OKSA9PT0gSW5pdGlhbE5hdmlnYXRpb24uRW5hYmxlZE5vbkJsb2NraW5nKSB7XG4gICAgICByb3V0ZXIuaW5pdGlhbE5hdmlnYXRpb24oKTtcbiAgICB9XG5cbiAgICBpbmplY3Rvci5nZXQoUk9VVEVSX1BSRUxPQURFUiwgbnVsbCwgSW5qZWN0RmxhZ3MuT3B0aW9uYWwpPy5zZXRVcFByZWxvYWRpbmcoKTtcbiAgICBpbmplY3Rvci5nZXQoUk9VVEVSX1NDUk9MTEVSLCBudWxsLCBJbmplY3RGbGFncy5PcHRpb25hbCk/LmluaXQoKTtcbiAgICByb3V0ZXIucmVzZXRSb290Q29tcG9uZW50VHlwZShyZWYuY29tcG9uZW50VHlwZXNbMF0pO1xuICAgIGlmICghYm9vdHN0cmFwRG9uZS5jbG9zZWQpIHtcbiAgICAgIGJvb3RzdHJhcERvbmUubmV4dCgpO1xuICAgICAgYm9vdHN0cmFwRG9uZS5jb21wbGV0ZSgpO1xuICAgICAgYm9vdHN0cmFwRG9uZS51bnN1YnNjcmliZSgpO1xuICAgIH1cbiAgfTtcbn1cblxuLyoqXG4gKiBBIHN1YmplY3QgdXNlZCB0byBpbmRpY2F0ZSB0aGF0IHRoZSBib290c3RyYXBwaW5nIHBoYXNlIGlzIGRvbmUuIFdoZW4gaW5pdGlhbCBuYXZpZ2F0aW9uIGlzXG4gKiBgZW5hYmxlZEJsb2NraW5nYCwgdGhlIGZpcnN0IG5hdmlnYXRpb24gd2FpdHMgdW50aWwgYm9vdHN0cmFwcGluZyBpcyBmaW5pc2hlZCBiZWZvcmUgY29udGludWluZ1xuICogdG8gdGhlIGFjdGl2YXRpb24gcGhhc2UuXG4gKi9cbmNvbnN0IEJPT1RTVFJBUF9ET05FID0gbmV3IEluamVjdGlvblRva2VuPFN1YmplY3Q8dm9pZD4+KFxuICB0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUgPyAnYm9vdHN0cmFwIGRvbmUgaW5kaWNhdG9yJyA6ICcnLFxuICB7XG4gICAgZmFjdG9yeTogKCkgPT4ge1xuICAgICAgcmV0dXJuIG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG4gICAgfSxcbiAgfSxcbik7XG5cbi8qKlxuICogVGhpcyBhbmQgdGhlIElOSVRJQUxfTkFWSUdBVElPTiB0b2tlbiBhcmUgdXNlZCBpbnRlcm5hbGx5IG9ubHkuIFRoZSBwdWJsaWMgQVBJIHNpZGUgb2YgdGhpcyBpc1xuICogY29uZmlndXJlZCB0aHJvdWdoIHRoZSBgRXh0cmFPcHRpb25zYC5cbiAqXG4gKiBXaGVuIHNldCB0byBgRW5hYmxlZEJsb2NraW5nYCwgdGhlIGluaXRpYWwgbmF2aWdhdGlvbiBzdGFydHMgYmVmb3JlIHRoZSByb290XG4gKiBjb21wb25lbnQgaXMgY3JlYXRlZC4gVGhlIGJvb3RzdHJhcCBpcyBibG9ja2VkIHVudGlsIHRoZSBpbml0aWFsIG5hdmlnYXRpb24gaXMgY29tcGxldGUuIFRoaXNcbiAqIHZhbHVlIHNob3VsZCBiZSBzZXQgaW4gY2FzZSB5b3UgdXNlIFtzZXJ2ZXItc2lkZSByZW5kZXJpbmddKGd1aWRlL3NzciksIGJ1dCBkbyBub3QgZW5hYmxlXG4gKiBbaHlkcmF0aW9uXShndWlkZS9oeWRyYXRpb24pIGZvciB5b3VyIGFwcGxpY2F0aW9uLlxuICpcbiAqIFdoZW4gc2V0IHRvIGBFbmFibGVkTm9uQmxvY2tpbmdgLCB0aGUgaW5pdGlhbCBuYXZpZ2F0aW9uIHN0YXJ0cyBhZnRlciB0aGUgcm9vdCBjb21wb25lbnQgaGFzIGJlZW5cbiAqIGNyZWF0ZWQuIFRoZSBib290c3RyYXAgaXMgbm90IGJsb2NrZWQgb24gdGhlIGNvbXBsZXRpb24gb2YgdGhlIGluaXRpYWwgbmF2aWdhdGlvbi5cbiAqXG4gKiBXaGVuIHNldCB0byBgRGlzYWJsZWRgLCB0aGUgaW5pdGlhbCBuYXZpZ2F0aW9uIGlzIG5vdCBwZXJmb3JtZWQuIFRoZSBsb2NhdGlvbiBsaXN0ZW5lciBpcyBzZXQgdXBcbiAqIGJlZm9yZSB0aGUgcm9vdCBjb21wb25lbnQgZ2V0cyBjcmVhdGVkLiBVc2UgaWYgdGhlcmUgaXMgYSByZWFzb24gdG8gaGF2ZSBtb3JlIGNvbnRyb2wgb3ZlciB3aGVuXG4gKiB0aGUgcm91dGVyIHN0YXJ0cyBpdHMgaW5pdGlhbCBuYXZpZ2F0aW9uIGR1ZSB0byBzb21lIGNvbXBsZXggaW5pdGlhbGl6YXRpb24gbG9naWMuXG4gKlxuICogQHNlZSB7QGxpbmsgRXh0cmFPcHRpb25zfVxuICovXG5jb25zdCBlbnVtIEluaXRpYWxOYXZpZ2F0aW9uIHtcbiAgRW5hYmxlZEJsb2NraW5nLFxuICBFbmFibGVkTm9uQmxvY2tpbmcsXG4gIERpc2FibGVkLFxufVxuXG5jb25zdCBJTklUSUFMX05BVklHQVRJT04gPSBuZXcgSW5qZWN0aW9uVG9rZW48SW5pdGlhbE5hdmlnYXRpb24+KFxuICB0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUgPyAnaW5pdGlhbCBuYXZpZ2F0aW9uJyA6ICcnLFxuICB7cHJvdmlkZWRJbjogJ3Jvb3QnLCBmYWN0b3J5OiAoKSA9PiBJbml0aWFsTmF2aWdhdGlvbi5FbmFibGVkTm9uQmxvY2tpbmd9LFxuKTtcblxuLyoqXG4gKiBBIHR5cGUgYWxpYXMgZm9yIHByb3ZpZGVycyByZXR1cm5lZCBieSBgd2l0aEVuYWJsZWRCbG9ja2luZ0luaXRpYWxOYXZpZ2F0aW9uYCBmb3IgdXNlIHdpdGhcbiAqIGBwcm92aWRlUm91dGVyYC5cbiAqXG4gKiBAc2VlIHtAbGluayB3aXRoRW5hYmxlZEJsb2NraW5nSW5pdGlhbE5hdmlnYXRpb259XG4gKiBAc2VlIHtAbGluayBwcm92aWRlUm91dGVyfVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IHR5cGUgRW5hYmxlZEJsb2NraW5nSW5pdGlhbE5hdmlnYXRpb25GZWF0dXJlID1cbiAgUm91dGVyRmVhdHVyZTxSb3V0ZXJGZWF0dXJlS2luZC5FbmFibGVkQmxvY2tpbmdJbml0aWFsTmF2aWdhdGlvbkZlYXR1cmU+O1xuXG4vKipcbiAqIEEgdHlwZSBhbGlhcyBmb3IgcHJvdmlkZXJzIHJldHVybmVkIGJ5IGB3aXRoRW5hYmxlZEJsb2NraW5nSW5pdGlhbE5hdmlnYXRpb25gIG9yXG4gKiBgd2l0aERpc2FibGVkSW5pdGlhbE5hdmlnYXRpb25gIGZ1bmN0aW9ucyBmb3IgdXNlIHdpdGggYHByb3ZpZGVSb3V0ZXJgLlxuICpcbiAqIEBzZWUge0BsaW5rIHdpdGhFbmFibGVkQmxvY2tpbmdJbml0aWFsTmF2aWdhdGlvbn1cbiAqIEBzZWUge0BsaW5rIHdpdGhEaXNhYmxlZEluaXRpYWxOYXZpZ2F0aW9ufVxuICogQHNlZSB7QGxpbmsgcHJvdmlkZVJvdXRlcn1cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCB0eXBlIEluaXRpYWxOYXZpZ2F0aW9uRmVhdHVyZSA9XG4gIHwgRW5hYmxlZEJsb2NraW5nSW5pdGlhbE5hdmlnYXRpb25GZWF0dXJlXG4gIHwgRGlzYWJsZWRJbml0aWFsTmF2aWdhdGlvbkZlYXR1cmU7XG5cbi8qKlxuICogQ29uZmlndXJlcyBpbml0aWFsIG5hdmlnYXRpb24gdG8gc3RhcnQgYmVmb3JlIHRoZSByb290IGNvbXBvbmVudCBpcyBjcmVhdGVkLlxuICpcbiAqIFRoZSBib290c3RyYXAgaXMgYmxvY2tlZCB1bnRpbCB0aGUgaW5pdGlhbCBuYXZpZ2F0aW9uIGlzIGNvbXBsZXRlLiBUaGlzIHNob3VsZCBiZSBzZXQgaW4gY2FzZVxuICogeW91IHVzZSBbc2VydmVyLXNpZGUgcmVuZGVyaW5nXShndWlkZS9zc3IpLCBidXQgZG8gbm90IGVuYWJsZSBbaHlkcmF0aW9uXShndWlkZS9oeWRyYXRpb24pIGZvclxuICogeW91ciBhcHBsaWNhdGlvbi5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqIEJhc2ljIGV4YW1wbGUgb2YgaG93IHlvdSBjYW4gZW5hYmxlIHRoaXMgbmF2aWdhdGlvbiBiZWhhdmlvcjpcbiAqIGBgYFxuICogY29uc3QgYXBwUm91dGVzOiBSb3V0ZXMgPSBbXTtcbiAqIGJvb3RzdHJhcEFwcGxpY2F0aW9uKEFwcENvbXBvbmVudCxcbiAqICAge1xuICogICAgIHByb3ZpZGVyczogW1xuICogICAgICAgcHJvdmlkZVJvdXRlcihhcHBSb3V0ZXMsIHdpdGhFbmFibGVkQmxvY2tpbmdJbml0aWFsTmF2aWdhdGlvbigpKVxuICogICAgIF1cbiAqICAgfVxuICogKTtcbiAqIGBgYFxuICpcbiAqIEBzZWUge0BsaW5rIHByb3ZpZGVSb3V0ZXJ9XG4gKlxuICogQHB1YmxpY0FwaVxuICogQHJldHVybnMgQSBzZXQgb2YgcHJvdmlkZXJzIGZvciB1c2Ugd2l0aCBgcHJvdmlkZVJvdXRlcmAuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3aXRoRW5hYmxlZEJsb2NraW5nSW5pdGlhbE5hdmlnYXRpb24oKTogRW5hYmxlZEJsb2NraW5nSW5pdGlhbE5hdmlnYXRpb25GZWF0dXJlIHtcbiAgY29uc3QgcHJvdmlkZXJzID0gW1xuICAgIHtwcm92aWRlOiBJTklUSUFMX05BVklHQVRJT04sIHVzZVZhbHVlOiBJbml0aWFsTmF2aWdhdGlvbi5FbmFibGVkQmxvY2tpbmd9LFxuICAgIHtcbiAgICAgIHByb3ZpZGU6IEFQUF9JTklUSUFMSVpFUixcbiAgICAgIG11bHRpOiB0cnVlLFxuICAgICAgZGVwczogW0luamVjdG9yXSxcbiAgICAgIHVzZUZhY3Rvcnk6IChpbmplY3RvcjogSW5qZWN0b3IpID0+IHtcbiAgICAgICAgY29uc3QgbG9jYXRpb25Jbml0aWFsaXplZDogUHJvbWlzZTxhbnk+ID0gaW5qZWN0b3IuZ2V0KFxuICAgICAgICAgIExPQ0FUSU9OX0lOSVRJQUxJWkVELFxuICAgICAgICAgIFByb21pc2UucmVzb2x2ZSgpLFxuICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIGxvY2F0aW9uSW5pdGlhbGl6ZWQudGhlbigoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgICAgY29uc3Qgcm91dGVyID0gaW5qZWN0b3IuZ2V0KFJvdXRlcik7XG4gICAgICAgICAgICAgIGNvbnN0IGJvb3RzdHJhcERvbmUgPSBpbmplY3Rvci5nZXQoQk9PVFNUUkFQX0RPTkUpO1xuICAgICAgICAgICAgICBhZnRlck5leHROYXZpZ2F0aW9uKHJvdXRlciwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIFVuYmxvY2sgQVBQX0lOSVRJQUxJWkVSIGluIGNhc2UgdGhlIGluaXRpYWwgbmF2aWdhdGlvbiB3YXMgY2FuY2VsZWQgb3IgZXJyb3JlZFxuICAgICAgICAgICAgICAgIC8vIHdpdGhvdXQgYSByZWRpcmVjdC5cbiAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICBpbmplY3Rvci5nZXQoTmF2aWdhdGlvblRyYW5zaXRpb25zKS5hZnRlclByZWFjdGl2YXRpb24gPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gVW5ibG9jayBBUFBfSU5JVElBTElaRVIgb25jZSB3ZSBnZXQgdG8gYGFmdGVyUHJlYWN0aXZhdGlvbmAuIEF0IHRoaXMgcG9pbnQsIHdlXG4gICAgICAgICAgICAgICAgLy8gYXNzdW1lIGFjdGl2YXRpb24gd2lsbCBjb21wbGV0ZSBzdWNjZXNzZnVsbHkgKGV2ZW4gdGhvdWdoIHRoaXMgaXMgbm90XG4gICAgICAgICAgICAgICAgLy8gZ3VhcmFudGVlZCkuXG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYm9vdHN0cmFwRG9uZS5jbG9zZWQgPyBvZih2b2lkIDApIDogYm9vdHN0cmFwRG9uZTtcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgcm91dGVyLmluaXRpYWxOYXZpZ2F0aW9uKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgIH0sXG4gICAgfSxcbiAgXTtcbiAgcmV0dXJuIHJvdXRlckZlYXR1cmUoUm91dGVyRmVhdHVyZUtpbmQuRW5hYmxlZEJsb2NraW5nSW5pdGlhbE5hdmlnYXRpb25GZWF0dXJlLCBwcm92aWRlcnMpO1xufVxuXG4vKipcbiAqIEEgdHlwZSBhbGlhcyBmb3IgcHJvdmlkZXJzIHJldHVybmVkIGJ5IGB3aXRoRGlzYWJsZWRJbml0aWFsTmF2aWdhdGlvbmAgZm9yIHVzZSB3aXRoXG4gKiBgcHJvdmlkZVJvdXRlcmAuXG4gKlxuICogQHNlZSB7QGxpbmsgd2l0aERpc2FibGVkSW5pdGlhbE5hdmlnYXRpb259XG4gKiBAc2VlIHtAbGluayBwcm92aWRlUm91dGVyfVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IHR5cGUgRGlzYWJsZWRJbml0aWFsTmF2aWdhdGlvbkZlYXR1cmUgPVxuICBSb3V0ZXJGZWF0dXJlPFJvdXRlckZlYXR1cmVLaW5kLkRpc2FibGVkSW5pdGlhbE5hdmlnYXRpb25GZWF0dXJlPjtcblxuLyoqXG4gKiBEaXNhYmxlcyBpbml0aWFsIG5hdmlnYXRpb24uXG4gKlxuICogVXNlIGlmIHRoZXJlIGlzIGEgcmVhc29uIHRvIGhhdmUgbW9yZSBjb250cm9sIG92ZXIgd2hlbiB0aGUgcm91dGVyIHN0YXJ0cyBpdHMgaW5pdGlhbCBuYXZpZ2F0aW9uXG4gKiBkdWUgdG8gc29tZSBjb21wbGV4IGluaXRpYWxpemF0aW9uIGxvZ2ljLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogQmFzaWMgZXhhbXBsZSBvZiBob3cgeW91IGNhbiBkaXNhYmxlIGluaXRpYWwgbmF2aWdhdGlvbjpcbiAqIGBgYFxuICogY29uc3QgYXBwUm91dGVzOiBSb3V0ZXMgPSBbXTtcbiAqIGJvb3RzdHJhcEFwcGxpY2F0aW9uKEFwcENvbXBvbmVudCxcbiAqICAge1xuICogICAgIHByb3ZpZGVyczogW1xuICogICAgICAgcHJvdmlkZVJvdXRlcihhcHBSb3V0ZXMsIHdpdGhEaXNhYmxlZEluaXRpYWxOYXZpZ2F0aW9uKCkpXG4gKiAgICAgXVxuICogICB9XG4gKiApO1xuICogYGBgXG4gKlxuICogQHNlZSB7QGxpbmsgcHJvdmlkZVJvdXRlcn1cbiAqXG4gKiBAcmV0dXJucyBBIHNldCBvZiBwcm92aWRlcnMgZm9yIHVzZSB3aXRoIGBwcm92aWRlUm91dGVyYC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3aXRoRGlzYWJsZWRJbml0aWFsTmF2aWdhdGlvbigpOiBEaXNhYmxlZEluaXRpYWxOYXZpZ2F0aW9uRmVhdHVyZSB7XG4gIGNvbnN0IHByb3ZpZGVycyA9IFtcbiAgICB7XG4gICAgICBwcm92aWRlOiBBUFBfSU5JVElBTElaRVIsXG4gICAgICBtdWx0aTogdHJ1ZSxcbiAgICAgIHVzZUZhY3Rvcnk6ICgpID0+IHtcbiAgICAgICAgY29uc3Qgcm91dGVyID0gaW5qZWN0KFJvdXRlcik7XG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgcm91dGVyLnNldFVwTG9jYXRpb25DaGFuZ2VMaXN0ZW5lcigpO1xuICAgICAgICB9O1xuICAgICAgfSxcbiAgICB9LFxuICAgIHtwcm92aWRlOiBJTklUSUFMX05BVklHQVRJT04sIHVzZVZhbHVlOiBJbml0aWFsTmF2aWdhdGlvbi5EaXNhYmxlZH0sXG4gIF07XG4gIHJldHVybiByb3V0ZXJGZWF0dXJlKFJvdXRlckZlYXR1cmVLaW5kLkRpc2FibGVkSW5pdGlhbE5hdmlnYXRpb25GZWF0dXJlLCBwcm92aWRlcnMpO1xufVxuXG4vKipcbiAqIEEgdHlwZSBhbGlhcyBmb3IgcHJvdmlkZXJzIHJldHVybmVkIGJ5IGB3aXRoRGVidWdUcmFjaW5nYCBmb3IgdXNlIHdpdGggYHByb3ZpZGVSb3V0ZXJgLlxuICpcbiAqIEBzZWUge0BsaW5rIHdpdGhEZWJ1Z1RyYWNpbmd9XG4gKiBAc2VlIHtAbGluayBwcm92aWRlUm91dGVyfVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IHR5cGUgRGVidWdUcmFjaW5nRmVhdHVyZSA9IFJvdXRlckZlYXR1cmU8Um91dGVyRmVhdHVyZUtpbmQuRGVidWdUcmFjaW5nRmVhdHVyZT47XG5cbi8qKlxuICogRW5hYmxlcyBsb2dnaW5nIG9mIGFsbCBpbnRlcm5hbCBuYXZpZ2F0aW9uIGV2ZW50cyB0byB0aGUgY29uc29sZS5cbiAqIEV4dHJhIGxvZ2dpbmcgbWlnaHQgYmUgdXNlZnVsIGZvciBkZWJ1Z2dpbmcgcHVycG9zZXMgdG8gaW5zcGVjdCBSb3V0ZXIgZXZlbnQgc2VxdWVuY2UuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiBCYXNpYyBleGFtcGxlIG9mIGhvdyB5b3UgY2FuIGVuYWJsZSBkZWJ1ZyB0cmFjaW5nOlxuICogYGBgXG4gKiBjb25zdCBhcHBSb3V0ZXM6IFJvdXRlcyA9IFtdO1xuICogYm9vdHN0cmFwQXBwbGljYXRpb24oQXBwQ29tcG9uZW50LFxuICogICB7XG4gKiAgICAgcHJvdmlkZXJzOiBbXG4gKiAgICAgICBwcm92aWRlUm91dGVyKGFwcFJvdXRlcywgd2l0aERlYnVnVHJhY2luZygpKVxuICogICAgIF1cbiAqICAgfVxuICogKTtcbiAqIGBgYFxuICpcbiAqIEBzZWUge0BsaW5rIHByb3ZpZGVSb3V0ZXJ9XG4gKlxuICogQHJldHVybnMgQSBzZXQgb2YgcHJvdmlkZXJzIGZvciB1c2Ugd2l0aCBgcHJvdmlkZVJvdXRlcmAuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gd2l0aERlYnVnVHJhY2luZygpOiBEZWJ1Z1RyYWNpbmdGZWF0dXJlIHtcbiAgbGV0IHByb3ZpZGVyczogUHJvdmlkZXJbXSA9IFtdO1xuICBpZiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSB7XG4gICAgcHJvdmlkZXJzID0gW1xuICAgICAge1xuICAgICAgICBwcm92aWRlOiBFTlZJUk9OTUVOVF9JTklUSUFMSVpFUixcbiAgICAgICAgbXVsdGk6IHRydWUsXG4gICAgICAgIHVzZUZhY3Rvcnk6ICgpID0+IHtcbiAgICAgICAgICBjb25zdCByb3V0ZXIgPSBpbmplY3QoUm91dGVyKTtcbiAgICAgICAgICByZXR1cm4gKCkgPT5cbiAgICAgICAgICAgIHJvdXRlci5ldmVudHMuc3Vic2NyaWJlKChlOiBFdmVudCkgPT4ge1xuICAgICAgICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZTpuby1jb25zb2xlXG4gICAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXA/LihgUm91dGVyIEV2ZW50OiAkeyg8YW55PmUuY29uc3RydWN0b3IpLm5hbWV9YCk7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKHN0cmluZ2lmeUV2ZW50KGUpKTtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XG4gICAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQ/LigpO1xuICAgICAgICAgICAgICAvLyB0c2xpbnQ6ZW5hYmxlOm5vLWNvbnNvbGVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgfSxcbiAgICBdO1xuICB9IGVsc2Uge1xuICAgIHByb3ZpZGVycyA9IFtdO1xuICB9XG4gIHJldHVybiByb3V0ZXJGZWF0dXJlKFJvdXRlckZlYXR1cmVLaW5kLkRlYnVnVHJhY2luZ0ZlYXR1cmUsIHByb3ZpZGVycyk7XG59XG5cbmNvbnN0IFJPVVRFUl9QUkVMT0FERVIgPSBuZXcgSW5qZWN0aW9uVG9rZW48Um91dGVyUHJlbG9hZGVyPihcbiAgdHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlID8gJ3JvdXRlciBwcmVsb2FkZXInIDogJycsXG4pO1xuXG4vKipcbiAqIEEgdHlwZSBhbGlhcyB0aGF0IHJlcHJlc2VudHMgYSBmZWF0dXJlIHdoaWNoIGVuYWJsZXMgcHJlbG9hZGluZyBpbiBSb3V0ZXIuXG4gKiBUaGUgdHlwZSBpcyB1c2VkIHRvIGRlc2NyaWJlIHRoZSByZXR1cm4gdmFsdWUgb2YgdGhlIGB3aXRoUHJlbG9hZGluZ2AgZnVuY3Rpb24uXG4gKlxuICogQHNlZSB7QGxpbmsgd2l0aFByZWxvYWRpbmd9XG4gKiBAc2VlIHtAbGluayBwcm92aWRlUm91dGVyfVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IHR5cGUgUHJlbG9hZGluZ0ZlYXR1cmUgPSBSb3V0ZXJGZWF0dXJlPFJvdXRlckZlYXR1cmVLaW5kLlByZWxvYWRpbmdGZWF0dXJlPjtcblxuLyoqXG4gKiBBbGxvd3MgdG8gY29uZmlndXJlIGEgcHJlbG9hZGluZyBzdHJhdGVneSB0byB1c2UuIFRoZSBzdHJhdGVneSBpcyBjb25maWd1cmVkIGJ5IHByb3ZpZGluZyBhXG4gKiByZWZlcmVuY2UgdG8gYSBjbGFzcyB0aGF0IGltcGxlbWVudHMgYSBgUHJlbG9hZGluZ1N0cmF0ZWd5YC5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqIEJhc2ljIGV4YW1wbGUgb2YgaG93IHlvdSBjYW4gY29uZmlndXJlIHByZWxvYWRpbmc6XG4gKiBgYGBcbiAqIGNvbnN0IGFwcFJvdXRlczogUm91dGVzID0gW107XG4gKiBib290c3RyYXBBcHBsaWNhdGlvbihBcHBDb21wb25lbnQsXG4gKiAgIHtcbiAqICAgICBwcm92aWRlcnM6IFtcbiAqICAgICAgIHByb3ZpZGVSb3V0ZXIoYXBwUm91dGVzLCB3aXRoUHJlbG9hZGluZyhQcmVsb2FkQWxsTW9kdWxlcykpXG4gKiAgICAgXVxuICogICB9XG4gKiApO1xuICogYGBgXG4gKlxuICogQHNlZSB7QGxpbmsgcHJvdmlkZVJvdXRlcn1cbiAqXG4gKiBAcGFyYW0gcHJlbG9hZGluZ1N0cmF0ZWd5IEEgcmVmZXJlbmNlIHRvIGEgY2xhc3MgdGhhdCBpbXBsZW1lbnRzIGEgYFByZWxvYWRpbmdTdHJhdGVneWAgdGhhdFxuICogICAgIHNob3VsZCBiZSB1c2VkLlxuICogQHJldHVybnMgQSBzZXQgb2YgcHJvdmlkZXJzIGZvciB1c2Ugd2l0aCBgcHJvdmlkZVJvdXRlcmAuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gd2l0aFByZWxvYWRpbmcocHJlbG9hZGluZ1N0cmF0ZWd5OiBUeXBlPFByZWxvYWRpbmdTdHJhdGVneT4pOiBQcmVsb2FkaW5nRmVhdHVyZSB7XG4gIGNvbnN0IHByb3ZpZGVycyA9IFtcbiAgICB7cHJvdmlkZTogUk9VVEVSX1BSRUxPQURFUiwgdXNlRXhpc3Rpbmc6IFJvdXRlclByZWxvYWRlcn0sXG4gICAge3Byb3ZpZGU6IFByZWxvYWRpbmdTdHJhdGVneSwgdXNlRXhpc3Rpbmc6IHByZWxvYWRpbmdTdHJhdGVneX0sXG4gIF07XG4gIHJldHVybiByb3V0ZXJGZWF0dXJlKFJvdXRlckZlYXR1cmVLaW5kLlByZWxvYWRpbmdGZWF0dXJlLCBwcm92aWRlcnMpO1xufVxuXG4vKipcbiAqIEEgdHlwZSBhbGlhcyBmb3IgcHJvdmlkZXJzIHJldHVybmVkIGJ5IGB3aXRoUm91dGVyQ29uZmlnYCBmb3IgdXNlIHdpdGggYHByb3ZpZGVSb3V0ZXJgLlxuICpcbiAqIEBzZWUge0BsaW5rIHdpdGhSb3V0ZXJDb25maWd9XG4gKiBAc2VlIHtAbGluayBwcm92aWRlUm91dGVyfVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IHR5cGUgUm91dGVyQ29uZmlndXJhdGlvbkZlYXR1cmUgPVxuICBSb3V0ZXJGZWF0dXJlPFJvdXRlckZlYXR1cmVLaW5kLlJvdXRlckNvbmZpZ3VyYXRpb25GZWF0dXJlPjtcblxuLyoqXG4gKiBBbGxvd3MgdG8gcHJvdmlkZSBleHRyYSBwYXJhbWV0ZXJzIHRvIGNvbmZpZ3VyZSBSb3V0ZXIuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiBCYXNpYyBleGFtcGxlIG9mIGhvdyB5b3UgY2FuIHByb3ZpZGUgZXh0cmEgY29uZmlndXJhdGlvbiBvcHRpb25zOlxuICogYGBgXG4gKiBjb25zdCBhcHBSb3V0ZXM6IFJvdXRlcyA9IFtdO1xuICogYm9vdHN0cmFwQXBwbGljYXRpb24oQXBwQ29tcG9uZW50LFxuICogICB7XG4gKiAgICAgcHJvdmlkZXJzOiBbXG4gKiAgICAgICBwcm92aWRlUm91dGVyKGFwcFJvdXRlcywgd2l0aFJvdXRlckNvbmZpZyh7XG4gKiAgICAgICAgICBvblNhbWVVcmxOYXZpZ2F0aW9uOiAncmVsb2FkJ1xuICogICAgICAgfSkpXG4gKiAgICAgXVxuICogICB9XG4gKiApO1xuICogYGBgXG4gKlxuICogQHNlZSB7QGxpbmsgcHJvdmlkZVJvdXRlcn1cbiAqXG4gKiBAcGFyYW0gb3B0aW9ucyBBIHNldCBvZiBwYXJhbWV0ZXJzIHRvIGNvbmZpZ3VyZSBSb3V0ZXIsIHNlZSBgUm91dGVyQ29uZmlnT3B0aW9uc2AgZm9yXG4gKiAgICAgYWRkaXRpb25hbCBpbmZvcm1hdGlvbi5cbiAqIEByZXR1cm5zIEEgc2V0IG9mIHByb3ZpZGVycyBmb3IgdXNlIHdpdGggYHByb3ZpZGVSb3V0ZXJgLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdpdGhSb3V0ZXJDb25maWcob3B0aW9uczogUm91dGVyQ29uZmlnT3B0aW9ucyk6IFJvdXRlckNvbmZpZ3VyYXRpb25GZWF0dXJlIHtcbiAgY29uc3QgcHJvdmlkZXJzID0gW3twcm92aWRlOiBST1VURVJfQ09ORklHVVJBVElPTiwgdXNlVmFsdWU6IG9wdGlvbnN9XTtcbiAgcmV0dXJuIHJvdXRlckZlYXR1cmUoUm91dGVyRmVhdHVyZUtpbmQuUm91dGVyQ29uZmlndXJhdGlvbkZlYXR1cmUsIHByb3ZpZGVycyk7XG59XG5cbi8qKlxuICogQSB0eXBlIGFsaWFzIGZvciBwcm92aWRlcnMgcmV0dXJuZWQgYnkgYHdpdGhIYXNoTG9jYXRpb25gIGZvciB1c2Ugd2l0aCBgcHJvdmlkZVJvdXRlcmAuXG4gKlxuICogQHNlZSB7QGxpbmsgd2l0aEhhc2hMb2NhdGlvbn1cbiAqIEBzZWUge0BsaW5rIHByb3ZpZGVSb3V0ZXJ9XG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgdHlwZSBSb3V0ZXJIYXNoTG9jYXRpb25GZWF0dXJlID0gUm91dGVyRmVhdHVyZTxSb3V0ZXJGZWF0dXJlS2luZC5Sb3V0ZXJIYXNoTG9jYXRpb25GZWF0dXJlPjtcblxuLyoqXG4gKiBQcm92aWRlcyB0aGUgbG9jYXRpb24gc3RyYXRlZ3kgdGhhdCB1c2VzIHRoZSBVUkwgZnJhZ21lbnQgaW5zdGVhZCBvZiB0aGUgaGlzdG9yeSBBUEkuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiBCYXNpYyBleGFtcGxlIG9mIGhvdyB5b3UgY2FuIHVzZSB0aGUgaGFzaCBsb2NhdGlvbiBvcHRpb246XG4gKiBgYGBcbiAqIGNvbnN0IGFwcFJvdXRlczogUm91dGVzID0gW107XG4gKiBib290c3RyYXBBcHBsaWNhdGlvbihBcHBDb21wb25lbnQsXG4gKiAgIHtcbiAqICAgICBwcm92aWRlcnM6IFtcbiAqICAgICAgIHByb3ZpZGVSb3V0ZXIoYXBwUm91dGVzLCB3aXRoSGFzaExvY2F0aW9uKCkpXG4gKiAgICAgXVxuICogICB9XG4gKiApO1xuICogYGBgXG4gKlxuICogQHNlZSB7QGxpbmsgcHJvdmlkZVJvdXRlcn1cbiAqIEBzZWUge0BsaW5rIEhhc2hMb2NhdGlvblN0cmF0ZWd5fVxuICpcbiAqIEByZXR1cm5zIEEgc2V0IG9mIHByb3ZpZGVycyBmb3IgdXNlIHdpdGggYHByb3ZpZGVSb3V0ZXJgLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdpdGhIYXNoTG9jYXRpb24oKTogUm91dGVySGFzaExvY2F0aW9uRmVhdHVyZSB7XG4gIGNvbnN0IHByb3ZpZGVycyA9IFt7cHJvdmlkZTogTG9jYXRpb25TdHJhdGVneSwgdXNlQ2xhc3M6IEhhc2hMb2NhdGlvblN0cmF0ZWd5fV07XG4gIHJldHVybiByb3V0ZXJGZWF0dXJlKFJvdXRlckZlYXR1cmVLaW5kLlJvdXRlckhhc2hMb2NhdGlvbkZlYXR1cmUsIHByb3ZpZGVycyk7XG59XG5cbi8qKlxuICogQSB0eXBlIGFsaWFzIGZvciBwcm92aWRlcnMgcmV0dXJuZWQgYnkgYHdpdGhOYXZpZ2F0aW9uRXJyb3JIYW5kbGVyYCBmb3IgdXNlIHdpdGggYHByb3ZpZGVSb3V0ZXJgLlxuICpcbiAqIEBzZWUge0BsaW5rIHdpdGhOYXZpZ2F0aW9uRXJyb3JIYW5kbGVyfVxuICogQHNlZSB7QGxpbmsgcHJvdmlkZVJvdXRlcn1cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCB0eXBlIE5hdmlnYXRpb25FcnJvckhhbmRsZXJGZWF0dXJlID1cbiAgUm91dGVyRmVhdHVyZTxSb3V0ZXJGZWF0dXJlS2luZC5OYXZpZ2F0aW9uRXJyb3JIYW5kbGVyRmVhdHVyZT47XG5cbi8qKlxuICogUHJvdmlkZXMgYSBmdW5jdGlvbiB3aGljaCBpcyBjYWxsZWQgd2hlbiBhIG5hdmlnYXRpb24gZXJyb3Igb2NjdXJzLlxuICpcbiAqIFRoaXMgZnVuY3Rpb24gaXMgcnVuIGluc2lkZSBhcHBsaWNhdGlvbidzIFtpbmplY3Rpb24gY29udGV4dF0oZ3VpZGUvZGkvZGVwZW5kZW5jeS1pbmplY3Rpb24tY29udGV4dClcbiAqIHNvIHlvdSBjYW4gdXNlIHRoZSBbYGluamVjdGBdKGFwaS9jb3JlL2luamVjdCkgZnVuY3Rpb24uXG4gKlxuICogVGhpcyBmdW5jdGlvbiBjYW4gcmV0dXJuIGEgYFJlZGlyZWN0Q29tbWFuZGAgdG8gY29udmVydCB0aGUgZXJyb3IgdG8gYSByZWRpcmVjdCwgc2ltaWxhciB0byByZXR1cm5pbmdcbiAqIGEgYFVybFRyZWVgIG9yIGBSZWRpcmVjdENvbW1hbmRgIGZyb20gYSBndWFyZC4gVGhpcyB3aWxsIGFsc28gcHJldmVudCB0aGUgYFJvdXRlcmAgZnJvbSBlbWl0dGluZ1xuICogYE5hdmlnYXRpb25FcnJvcmA7IGl0IHdpbGwgaW5zdGVhZCBlbWl0IGBOYXZpZ2F0aW9uQ2FuY2VsYCB3aXRoIGNvZGUgTmF2aWdhdGlvbkNhbmNlbGxhdGlvbkNvZGUuUmVkaXJlY3QuXG4gKiBSZXR1cm4gdmFsdWVzIG90aGVyIHRoYW4gYFJlZGlyZWN0Q29tbWFuZGAgYXJlIGlnbm9yZWQgYW5kIGRvIG5vdCBjaGFuZ2UgYW55IGJlaGF2aW9yIHdpdGggcmVzcGVjdCB0b1xuICogaG93IHRoZSBgUm91dGVyYCBoYW5kbGVzIHRoZSBlcnJvci5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqIEJhc2ljIGV4YW1wbGUgb2YgaG93IHlvdSBjYW4gdXNlIHRoZSBlcnJvciBoYW5kbGVyIG9wdGlvbjpcbiAqIGBgYFxuICogY29uc3QgYXBwUm91dGVzOiBSb3V0ZXMgPSBbXTtcbiAqIGJvb3RzdHJhcEFwcGxpY2F0aW9uKEFwcENvbXBvbmVudCxcbiAqICAge1xuICogICAgIHByb3ZpZGVyczogW1xuICogICAgICAgcHJvdmlkZVJvdXRlcihhcHBSb3V0ZXMsIHdpdGhOYXZpZ2F0aW9uRXJyb3JIYW5kbGVyKChlOiBOYXZpZ2F0aW9uRXJyb3IpID0+XG4gKiBpbmplY3QoTXlFcnJvclRyYWNrZXIpLnRyYWNrRXJyb3IoZSkpKVxuICogICAgIF1cbiAqICAgfVxuICogKTtcbiAqIGBgYFxuICpcbiAqIEBzZWUge0BsaW5rIE5hdmlnYXRpb25FcnJvcn1cbiAqIEBzZWUge0BsaW5rIGNvcmUvaW5qZWN0fVxuICogQHNlZSB7QGxpbmsgcnVuSW5JbmplY3Rpb25Db250ZXh0fVxuICpcbiAqIEByZXR1cm5zIEEgc2V0IG9mIHByb3ZpZGVycyBmb3IgdXNlIHdpdGggYHByb3ZpZGVSb3V0ZXJgLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdpdGhOYXZpZ2F0aW9uRXJyb3JIYW5kbGVyKFxuICBoYW5kbGVyOiAoZXJyb3I6IE5hdmlnYXRpb25FcnJvcikgPT4gdW5rbm93biB8IFJlZGlyZWN0Q29tbWFuZCxcbik6IE5hdmlnYXRpb25FcnJvckhhbmRsZXJGZWF0dXJlIHtcbiAgY29uc3QgcHJvdmlkZXJzID0gW1xuICAgIHtcbiAgICAgIHByb3ZpZGU6IE5BVklHQVRJT05fRVJST1JfSEFORExFUixcbiAgICAgIHVzZVZhbHVlOiBoYW5kbGVyLFxuICAgIH0sXG4gIF07XG4gIHJldHVybiByb3V0ZXJGZWF0dXJlKFJvdXRlckZlYXR1cmVLaW5kLk5hdmlnYXRpb25FcnJvckhhbmRsZXJGZWF0dXJlLCBwcm92aWRlcnMpO1xufVxuXG4vKipcbiAqIEEgdHlwZSBhbGlhcyBmb3IgcHJvdmlkZXJzIHJldHVybmVkIGJ5IGB3aXRoQ29tcG9uZW50SW5wdXRCaW5kaW5nYCBmb3IgdXNlIHdpdGggYHByb3ZpZGVSb3V0ZXJgLlxuICpcbiAqIEBzZWUge0BsaW5rIHdpdGhDb21wb25lbnRJbnB1dEJpbmRpbmd9XG4gKiBAc2VlIHtAbGluayBwcm92aWRlUm91dGVyfVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IHR5cGUgQ29tcG9uZW50SW5wdXRCaW5kaW5nRmVhdHVyZSA9XG4gIFJvdXRlckZlYXR1cmU8Um91dGVyRmVhdHVyZUtpbmQuQ29tcG9uZW50SW5wdXRCaW5kaW5nRmVhdHVyZT47XG5cbi8qKlxuICogQSB0eXBlIGFsaWFzIGZvciBwcm92aWRlcnMgcmV0dXJuZWQgYnkgYHdpdGhWaWV3VHJhbnNpdGlvbnNgIGZvciB1c2Ugd2l0aCBgcHJvdmlkZVJvdXRlcmAuXG4gKlxuICogQHNlZSB7QGxpbmsgd2l0aFZpZXdUcmFuc2l0aW9uc31cbiAqIEBzZWUge0BsaW5rIHByb3ZpZGVSb3V0ZXJ9XG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgdHlwZSBWaWV3VHJhbnNpdGlvbnNGZWF0dXJlID0gUm91dGVyRmVhdHVyZTxSb3V0ZXJGZWF0dXJlS2luZC5WaWV3VHJhbnNpdGlvbnNGZWF0dXJlPjtcblxuLyoqXG4gKiBFbmFibGVzIGJpbmRpbmcgaW5mb3JtYXRpb24gZnJvbSB0aGUgYFJvdXRlcmAgc3RhdGUgZGlyZWN0bHkgdG8gdGhlIGlucHV0cyBvZiB0aGUgY29tcG9uZW50IGluXG4gKiBgUm91dGVgIGNvbmZpZ3VyYXRpb25zLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogQmFzaWMgZXhhbXBsZSBvZiBob3cgeW91IGNhbiBlbmFibGUgdGhlIGZlYXR1cmU6XG4gKiBgYGBcbiAqIGNvbnN0IGFwcFJvdXRlczogUm91dGVzID0gW107XG4gKiBib290c3RyYXBBcHBsaWNhdGlvbihBcHBDb21wb25lbnQsXG4gKiAgIHtcbiAqICAgICBwcm92aWRlcnM6IFtcbiAqICAgICAgIHByb3ZpZGVSb3V0ZXIoYXBwUm91dGVzLCB3aXRoQ29tcG9uZW50SW5wdXRCaW5kaW5nKCkpXG4gKiAgICAgXVxuICogICB9XG4gKiApO1xuICogYGBgXG4gKlxuICogVGhlIHJvdXRlciBiaW5kaW5ncyBpbmZvcm1hdGlvbiBmcm9tIGFueSBvZiB0aGUgZm9sbG93aW5nIHNvdXJjZXM6XG4gKlxuICogIC0gcXVlcnkgcGFyYW1ldGVyc1xuICogIC0gcGF0aCBhbmQgbWF0cml4IHBhcmFtZXRlcnNcbiAqICAtIHN0YXRpYyByb3V0ZSBkYXRhXG4gKiAgLSBkYXRhIGZyb20gcmVzb2x2ZXJzXG4gKlxuICogRHVwbGljYXRlIGtleXMgYXJlIHJlc29sdmVkIGluIHRoZSBzYW1lIG9yZGVyIGZyb20gYWJvdmUsIGZyb20gbGVhc3QgdG8gZ3JlYXRlc3QsXG4gKiBtZWFuaW5nIHRoYXQgcmVzb2x2ZXJzIGhhdmUgdGhlIGhpZ2hlc3QgcHJlY2VkZW5jZSBhbmQgb3ZlcnJpZGUgYW55IG9mIHRoZSBvdGhlciBpbmZvcm1hdGlvblxuICogZnJvbSB0aGUgcm91dGUuXG4gKlxuICogSW1wb3J0YW50bHksIHdoZW4gYW4gaW5wdXQgZG9lcyBub3QgaGF2ZSBhbiBpdGVtIGluIHRoZSByb3V0ZSBkYXRhIHdpdGggYSBtYXRjaGluZyBrZXksIHRoaXNcbiAqIGlucHV0IGlzIHNldCB0byBgdW5kZWZpbmVkYC4gVGhpcyBwcmV2ZW50cyBwcmV2aW91cyBpbmZvcm1hdGlvbiBmcm9tIGJlaW5nXG4gKiByZXRhaW5lZCBpZiB0aGUgZGF0YSBnb3QgcmVtb3ZlZCBmcm9tIHRoZSByb3V0ZSAoaS5lLiBpZiBhIHF1ZXJ5IHBhcmFtZXRlciBpcyByZW1vdmVkKS5cbiAqIERlZmF1bHQgdmFsdWVzIGNhbiBiZSBwcm92aWRlZCB3aXRoIGEgcmVzb2x2ZXIgb24gdGhlIHJvdXRlIHRvIGVuc3VyZSB0aGUgdmFsdWUgaXMgYWx3YXlzIHByZXNlbnRcbiAqIG9yIGFuIGlucHV0IGFuZCB1c2UgYW4gaW5wdXQgdHJhbnNmb3JtIGluIHRoZSBjb21wb25lbnQuXG4gKlxuICogQHNlZSB7QGxpbmsgZ3VpZGUvY29tcG9uZW50cy9pbnB1dHMjaW5wdXQtdHJhbnNmb3JtcyBpbnB1dCB0cmFuc2Zvcm1zfVxuICogQHJldHVybnMgQSBzZXQgb2YgcHJvdmlkZXJzIGZvciB1c2Ugd2l0aCBgcHJvdmlkZVJvdXRlcmAuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3aXRoQ29tcG9uZW50SW5wdXRCaW5kaW5nKCk6IENvbXBvbmVudElucHV0QmluZGluZ0ZlYXR1cmUge1xuICBjb25zdCBwcm92aWRlcnMgPSBbXG4gICAgUm91dGVkQ29tcG9uZW50SW5wdXRCaW5kZXIsXG4gICAge3Byb3ZpZGU6IElOUFVUX0JJTkRFUiwgdXNlRXhpc3Rpbmc6IFJvdXRlZENvbXBvbmVudElucHV0QmluZGVyfSxcbiAgXTtcblxuICByZXR1cm4gcm91dGVyRmVhdHVyZShSb3V0ZXJGZWF0dXJlS2luZC5Db21wb25lbnRJbnB1dEJpbmRpbmdGZWF0dXJlLCBwcm92aWRlcnMpO1xufVxuXG4vKipcbiAqIEVuYWJsZXMgdmlldyB0cmFuc2l0aW9ucyBpbiB0aGUgUm91dGVyIGJ5IHJ1bm5pbmcgdGhlIHJvdXRlIGFjdGl2YXRpb24gYW5kIGRlYWN0aXZhdGlvbiBpbnNpZGUgb2ZcbiAqIGBkb2N1bWVudC5zdGFydFZpZXdUcmFuc2l0aW9uYC5cbiAqXG4gKiBOb3RlOiBUaGUgVmlldyBUcmFuc2l0aW9ucyBBUEkgaXMgbm90IGF2YWlsYWJsZSBpbiBhbGwgYnJvd3NlcnMuIElmIHRoZSBicm93c2VyIGRvZXMgbm90IHN1cHBvcnRcbiAqIHZpZXcgdHJhbnNpdGlvbnMsIHRoZSBSb3V0ZXIgd2lsbCBub3QgYXR0ZW1wdCB0byBzdGFydCBhIHZpZXcgdHJhbnNpdGlvbiBhbmQgY29udGludWUgcHJvY2Vzc2luZ1xuICogdGhlIG5hdmlnYXRpb24gYXMgdXN1YWwuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiBCYXNpYyBleGFtcGxlIG9mIGhvdyB5b3UgY2FuIGVuYWJsZSB0aGUgZmVhdHVyZTpcbiAqIGBgYFxuICogY29uc3QgYXBwUm91dGVzOiBSb3V0ZXMgPSBbXTtcbiAqIGJvb3RzdHJhcEFwcGxpY2F0aW9uKEFwcENvbXBvbmVudCxcbiAqICAge1xuICogICAgIHByb3ZpZGVyczogW1xuICogICAgICAgcHJvdmlkZVJvdXRlcihhcHBSb3V0ZXMsIHdpdGhWaWV3VHJhbnNpdGlvbnMoKSlcbiAqICAgICBdXG4gKiAgIH1cbiAqICk7XG4gKiBgYGBcbiAqXG4gKiBAcmV0dXJucyBBIHNldCBvZiBwcm92aWRlcnMgZm9yIHVzZSB3aXRoIGBwcm92aWRlUm91dGVyYC5cbiAqIEBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIuY2hyb21lLmNvbS9kb2NzL3dlYi1wbGF0Zm9ybS92aWV3LXRyYW5zaXRpb25zL1xuICogQHNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvVmlld19UcmFuc2l0aW9uc19BUElcbiAqIEBkZXZlbG9wZXJQcmV2aWV3XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3aXRoVmlld1RyYW5zaXRpb25zKFxuICBvcHRpb25zPzogVmlld1RyYW5zaXRpb25zRmVhdHVyZU9wdGlvbnMsXG4pOiBWaWV3VHJhbnNpdGlvbnNGZWF0dXJlIHtcbiAgY29uc3QgcHJvdmlkZXJzID0gW1xuICAgIHtwcm92aWRlOiBDUkVBVEVfVklFV19UUkFOU0lUSU9OLCB1c2VWYWx1ZTogY3JlYXRlVmlld1RyYW5zaXRpb259LFxuICAgIHtcbiAgICAgIHByb3ZpZGU6IFZJRVdfVFJBTlNJVElPTl9PUFRJT05TLFxuICAgICAgdXNlVmFsdWU6IHtza2lwTmV4dFRyYW5zaXRpb246ICEhb3B0aW9ucz8uc2tpcEluaXRpYWxUcmFuc2l0aW9uLCAuLi5vcHRpb25zfSxcbiAgICB9LFxuICBdO1xuICByZXR1cm4gcm91dGVyRmVhdHVyZShSb3V0ZXJGZWF0dXJlS2luZC5WaWV3VHJhbnNpdGlvbnNGZWF0dXJlLCBwcm92aWRlcnMpO1xufVxuXG4vKipcbiAqIEEgdHlwZSBhbGlhcyB0aGF0IHJlcHJlc2VudHMgYWxsIFJvdXRlciBmZWF0dXJlcyBhdmFpbGFibGUgZm9yIHVzZSB3aXRoIGBwcm92aWRlUm91dGVyYC5cbiAqIEZlYXR1cmVzIGNhbiBiZSBlbmFibGVkIGJ5IGFkZGluZyBzcGVjaWFsIGZ1bmN0aW9ucyB0byB0aGUgYHByb3ZpZGVSb3V0ZXJgIGNhbGwuXG4gKiBTZWUgZG9jdW1lbnRhdGlvbiBmb3IgZWFjaCBzeW1ib2wgdG8gZmluZCBjb3JyZXNwb25kaW5nIGZ1bmN0aW9uIG5hbWUuIFNlZSBhbHNvIGBwcm92aWRlUm91dGVyYFxuICogZG9jdW1lbnRhdGlvbiBvbiBob3cgdG8gdXNlIHRob3NlIGZ1bmN0aW9ucy5cbiAqXG4gKiBAc2VlIHtAbGluayBwcm92aWRlUm91dGVyfVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IHR5cGUgUm91dGVyRmVhdHVyZXMgPVxuICB8IFByZWxvYWRpbmdGZWF0dXJlXG4gIHwgRGVidWdUcmFjaW5nRmVhdHVyZVxuICB8IEluaXRpYWxOYXZpZ2F0aW9uRmVhdHVyZVxuICB8IEluTWVtb3J5U2Nyb2xsaW5nRmVhdHVyZVxuICB8IFJvdXRlckNvbmZpZ3VyYXRpb25GZWF0dXJlXG4gIHwgTmF2aWdhdGlvbkVycm9ySGFuZGxlckZlYXR1cmVcbiAgfCBDb21wb25lbnRJbnB1dEJpbmRpbmdGZWF0dXJlXG4gIHwgVmlld1RyYW5zaXRpb25zRmVhdHVyZVxuICB8IFJvdXRlckhhc2hMb2NhdGlvbkZlYXR1cmU7XG5cbi8qKlxuICogVGhlIGxpc3Qgb2YgZmVhdHVyZXMgYXMgYW4gZW51bSB0byB1bmlxdWVseSB0eXBlIGVhY2ggZmVhdHVyZS5cbiAqL1xuZXhwb3J0IGNvbnN0IGVudW0gUm91dGVyRmVhdHVyZUtpbmQge1xuICBQcmVsb2FkaW5nRmVhdHVyZSxcbiAgRGVidWdUcmFjaW5nRmVhdHVyZSxcbiAgRW5hYmxlZEJsb2NraW5nSW5pdGlhbE5hdmlnYXRpb25GZWF0dXJlLFxuICBEaXNhYmxlZEluaXRpYWxOYXZpZ2F0aW9uRmVhdHVyZSxcbiAgSW5NZW1vcnlTY3JvbGxpbmdGZWF0dXJlLFxuICBSb3V0ZXJDb25maWd1cmF0aW9uRmVhdHVyZSxcbiAgUm91dGVySGFzaExvY2F0aW9uRmVhdHVyZSxcbiAgTmF2aWdhdGlvbkVycm9ySGFuZGxlckZlYXR1cmUsXG4gIENvbXBvbmVudElucHV0QmluZGluZ0ZlYXR1cmUsXG4gIFZpZXdUcmFuc2l0aW9uc0ZlYXR1cmUsXG59XG4iXX0=