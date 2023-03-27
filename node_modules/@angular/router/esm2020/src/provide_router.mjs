/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { HashLocationStrategy, LOCATION_INITIALIZED, LocationStrategy, ViewportScroller } from '@angular/common';
import { APP_BOOTSTRAP_LISTENER, APP_INITIALIZER, ApplicationRef, ENVIRONMENT_INITIALIZER, EnvironmentInjector, inject, InjectFlags, InjectionToken, Injector, makeEnvironmentProviders, NgZone } from '@angular/core';
import { of, Subject } from 'rxjs';
import { NavigationError, stringifyEvent } from './events';
import { NavigationTransitions } from './navigation_transition';
import { Router } from './router';
import { ROUTER_CONFIGURATION } from './router_config';
import { ROUTES } from './router_config_loader';
import { PreloadingStrategy, RouterPreloader } from './router_preloader';
import { ROUTER_SCROLLER, RouterScroller } from './router_scroller';
import { ActivatedRoute } from './router_state';
import { UrlSerializer } from './url_tree';
import { afterNextNavigation } from './utils/navigations';
const NG_DEV_MODE = typeof ngDevMode === 'undefined' || ngDevMode;
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
 * @see `RouterFeatures`
 *
 * @publicApi
 * @param routes A set of `Route`s to use for the application routing table.
 * @param features Optional features to configure additional router behaviors.
 * @returns A set of providers to setup a Router.
 */
export function provideRouter(routes, ...features) {
    return makeEnvironmentProviders([
        { provide: ROUTES, multi: true, useValue: routes },
        NG_DEV_MODE ? { provide: ROUTER_IS_PROVIDED, useValue: true } : [],
        { provide: ActivatedRoute, useFactory: rootRoute, deps: [Router] },
        { provide: APP_BOOTSTRAP_LISTENER, multi: true, useFactory: getBootstrapListener },
        features.map(feature => feature.ɵproviders),
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
export const ROUTER_IS_PROVIDED = new InjectionToken('', { providedIn: 'root', factory: () => false });
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
    }
};
/**
 * Registers a [DI provider](guide/glossary#provider) for a set of routes.
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
 * @see `ROUTES`
 * @publicApi
 */
export function provideRoutes(routes) {
    return [
        { provide: ROUTES, multi: true, useValue: routes },
        NG_DEV_MODE ? routerIsProvidedDevModeCheck : [],
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
 * @see `provideRouter`
 * @see `ViewportScroller`
 *
 * @publicApi
 * @param options Set of configuration parameters to customize scrolling behavior, see
 *     `InMemoryScrollingOptions` for additional information.
 * @returns A set of providers for use with `provideRouter`.
 */
export function withInMemoryScrolling(options = {}) {
    const providers = [{
            provide: ROUTER_SCROLLER,
            useFactory: () => {
                const viewportScroller = inject(ViewportScroller);
                const zone = inject(NgZone);
                const transitions = inject(NavigationTransitions);
                const urlSerializer = inject(UrlSerializer);
                return new RouterScroller(urlSerializer, transitions, viewportScroller, zone, options);
            },
        }];
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
            bootstrapDone.unsubscribe();
        }
    };
}
/**
 * A subject used to indicate that the bootstrapping phase is done. When initial navigation is
 * `enabledBlocking`, the first navigation waits until bootstrapping is finished before continuing
 * to the activation phase.
 */
const BOOTSTRAP_DONE = new InjectionToken(NG_DEV_MODE ? 'bootstrap done indicator' : '', {
    factory: () => {
        return new Subject();
    }
});
const INITIAL_NAVIGATION = new InjectionToken(NG_DEV_MODE ? 'initial navigation' : '', { providedIn: 'root', factory: () => 1 /* InitialNavigation.EnabledNonBlocking */ });
/**
 * Configures initial navigation to start before the root component is created.
 *
 * The bootstrap is blocked until the initial navigation is complete. This value is required for
 * [server-side rendering](guide/universal) to work.
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
 * @see `provideRouter`
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
                        return new Promise(resolve => {
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
            }
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
 * @see `provideRouter`
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
            }
        },
        { provide: INITIAL_NAVIGATION, useValue: 2 /* InitialNavigation.Disabled */ }
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
 * @see `provideRouter`
 *
 * @returns A set of providers for use with `provideRouter`.
 *
 * @publicApi
 */
export function withDebugTracing() {
    let providers = [];
    if (NG_DEV_MODE) {
        providers = [{
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
                }
            }];
    }
    else {
        providers = [];
    }
    return routerFeature(1 /* RouterFeatureKind.DebugTracingFeature */, providers);
}
const ROUTER_PRELOADER = new InjectionToken(NG_DEV_MODE ? 'router preloader' : '');
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
 * @see `provideRouter`
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
 * @see `provideRouter`
 *
 * @param options A set of parameters to configure Router, see `RouterConfigOptions` for
 *     additional information.
 * @returns A set of providers for use with `provideRouter`.
 *
 * @publicApi
 */
export function withRouterConfig(options) {
    const providers = [
        { provide: ROUTER_CONFIGURATION, useValue: options },
    ];
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
 * @see `provideRouter`
 * @see `HashLocationStrategy`
 *
 * @returns A set of providers for use with `provideRouter`.
 *
 * @publicApi
 */
export function withHashLocation() {
    const providers = [
        { provide: LocationStrategy, useClass: HashLocationStrategy },
    ];
    return routerFeature(5 /* RouterFeatureKind.RouterConfigurationFeature */, providers);
}
/**
 * Subscribes to the Router's navigation events and calls the given function when a
 * `NavigationError` happens.
 *
 * This function is run inside application's injection context so you can use the `inject` function.
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
 * @see `NavigationError`
 * @see `inject`
 * @see `EnvironmentInjector#runInContext`
 *
 * @returns A set of providers for use with `provideRouter`.
 *
 * @publicApi
 */
export function withNavigationErrorHandler(fn) {
    const providers = [{
            provide: ENVIRONMENT_INITIALIZER,
            multi: true,
            useValue: () => {
                const injector = inject(EnvironmentInjector);
                inject(Router).events.subscribe((e) => {
                    if (e instanceof NavigationError) {
                        injector.runInContext(() => fn(e));
                    }
                });
            }
        }];
    return routerFeature(7 /* RouterFeatureKind.NavigationErrorHandlerFeature */, providers);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvdmlkZV9yb3V0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9yb3V0ZXIvc3JjL3Byb3ZpZGVfcm91dGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxvQkFBb0IsRUFBRSxvQkFBb0IsRUFBRSxnQkFBZ0IsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQy9HLE9BQU8sRUFBQyxzQkFBc0IsRUFBRSxlQUFlLEVBQUUsY0FBYyxFQUFnQix1QkFBdUIsRUFBRSxtQkFBbUIsRUFBd0IsTUFBTSxFQUFFLFdBQVcsRUFBRSxjQUFjLEVBQUUsUUFBUSxFQUFFLHdCQUF3QixFQUFFLE1BQU0sRUFBaUIsTUFBTSxlQUFlLENBQUM7QUFDelEsT0FBTyxFQUFDLEVBQUUsRUFBRSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFHakMsT0FBTyxFQUFxRSxlQUFlLEVBQUUsY0FBYyxFQUFDLE1BQU0sVUFBVSxDQUFDO0FBRTdILE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLHlCQUF5QixDQUFDO0FBQzlELE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFDaEMsT0FBTyxFQUEyQixvQkFBb0IsRUFBc0IsTUFBTSxpQkFBaUIsQ0FBQztBQUNwRyxPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFDOUMsT0FBTyxFQUFDLGtCQUFrQixFQUFFLGVBQWUsRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBQ3ZFLE9BQU8sRUFBQyxlQUFlLEVBQUUsY0FBYyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDbEUsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQzlDLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxZQUFZLENBQUM7QUFDekMsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0s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RSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO3FCQUNwQztnQkFDSCxDQUFDLENBQUMsQ0FBQztZQUNMLENBQUM7U0FDRixDQUFDLENBQUM7SUFDSCxPQUFPLGFBQWEsMERBQWtELFNBQVMsQ0FBQyxDQUFDO0FBQ25GLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtIYXNoTG9jYXRpb25TdHJhdGVneSwgTE9DQVRJT05fSU5JVElBTElaRUQsIExvY2F0aW9uU3RyYXRlZ3ksIFZpZXdwb3J0U2Nyb2xsZXJ9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge0FQUF9CT09UU1RSQVBfTElTVEVORVIsIEFQUF9JTklUSUFMSVpFUiwgQXBwbGljYXRpb25SZWYsIENvbXBvbmVudFJlZiwgRU5WSVJPTk1FTlRfSU5JVElBTElaRVIsIEVudmlyb25tZW50SW5qZWN0b3IsIEVudmlyb25tZW50UHJvdmlkZXJzLCBpbmplY3QsIEluamVjdEZsYWdzLCBJbmplY3Rpb25Ub2tlbiwgSW5qZWN0b3IsIG1ha2VFbnZpcm9ubWVudFByb3ZpZGVycywgTmdab25lLCBQcm92aWRlciwgVHlwZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge29mLCBTdWJqZWN0fSBmcm9tICdyeGpzJztcbmltcG9ydCB7ZmlsdGVyLCBtYXAsIHRha2V9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHtFdmVudCwgTmF2aWdhdGlvbkNhbmNlbCwgTmF2aWdhdGlvbkNhbmNlbGxhdGlvbkNvZGUsIE5hdmlnYXRpb25FbmQsIE5hdmlnYXRpb25FcnJvciwgc3RyaW5naWZ5RXZlbnR9IGZyb20gJy4vZXZlbnRzJztcbmltcG9ydCB7Um91dGVzfSBmcm9tICcuL21vZGVscyc7XG5pbXBvcnQge05hdmlnYXRpb25UcmFuc2l0aW9uc30gZnJvbSAnLi9uYXZpZ2F0aW9uX3RyYW5zaXRpb24nO1xuaW1wb3J0IHtSb3V0ZXJ9IGZyb20gJy4vcm91dGVyJztcbmltcG9ydCB7SW5NZW1vcnlTY3JvbGxpbmdPcHRpb25zLCBST1VURVJfQ09ORklHVVJBVElPTiwgUm91dGVyQ29uZmlnT3B0aW9uc30gZnJvbSAnLi9yb3V0ZXJfY29uZmlnJztcbmltcG9ydCB7Uk9VVEVTfSBmcm9tICcuL3JvdXRlcl9jb25maWdfbG9hZGVyJztcbmltcG9ydCB7UHJlbG9hZGluZ1N0cmF0ZWd5LCBSb3V0ZXJQcmVsb2FkZXJ9IGZyb20gJy4vcm91dGVyX3ByZWxvYWRlcic7XG5pbXBvcnQge1JPVVRFUl9TQ1JPTExFUiwgUm91dGVyU2Nyb2xsZXJ9IGZyb20gJy4vcm91dGVyX3Njcm9sbGVyJztcbmltcG9ydCB7QWN0aXZhdGVkUm91dGV9IGZyb20gJy4vcm91dGVyX3N0YXRlJztcbmltcG9ydCB7VXJsU2VyaWFsaXplcn0gZnJvbSAnLi91cmxfdHJlZSc7XG5pbXBvcnQge2FmdGVyTmV4dE5hdmlnYXRpb259IGZyb20gJy4vdXRpbHMvbmF2aWdhdGlvbnMnO1xuXG5jb25zdCBOR19ERVZfTU9ERSA9IHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZTtcblxuLyoqXG4gKiBTZXRzIHVwIHByb3ZpZGVycyBuZWNlc3NhcnkgdG8gZW5hYmxlIGBSb3V0ZXJgIGZ1bmN0aW9uYWxpdHkgZm9yIHRoZSBhcHBsaWNhdGlvbi5cbiAqIEFsbG93cyB0byBjb25maWd1cmUgYSBzZXQgb2Ygcm91dGVzIGFzIHdlbGwgYXMgZXh0cmEgZmVhdHVyZXMgdGhhdCBzaG91bGQgYmUgZW5hYmxlZC5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqIEJhc2ljIGV4YW1wbGUgb2YgaG93IHlvdSBjYW4gYWRkIGEgUm91dGVyIHRvIHlvdXIgYXBwbGljYXRpb246XG4gKiBgYGBcbiAqIGNvbnN0IGFwcFJvdXRlczogUm91dGVzID0gW107XG4gKiBib290c3RyYXBBcHBsaWNhdGlvbihBcHBDb21wb25lbnQsIHtcbiAqICAgcHJvdmlkZXJzOiBbcHJvdmlkZVJvdXRlcihhcHBSb3V0ZXMpXVxuICogfSk7XG4gKiBgYGBcbiAqXG4gKiBZb3UgY2FuIGFsc28gZW5hYmxlIG9wdGlvbmFsIGZlYXR1cmVzIGluIHRoZSBSb3V0ZXIgYnkgYWRkaW5nIGZ1bmN0aW9ucyBmcm9tIHRoZSBgUm91dGVyRmVhdHVyZXNgXG4gKiB0eXBlOlxuICogYGBgXG4gKiBjb25zdCBhcHBSb3V0ZXM6IFJvdXRlcyA9IFtdO1xuICogYm9vdHN0cmFwQXBwbGljYXRpb24oQXBwQ29tcG9uZW50LFxuICogICB7XG4gKiAgICAgcHJvdmlkZXJzOiBbXG4gKiAgICAgICBwcm92aWRlUm91dGVyKGFwcFJvdXRlcyxcbiAqICAgICAgICAgd2l0aERlYnVnVHJhY2luZygpLFxuICogICAgICAgICB3aXRoUm91dGVyQ29uZmlnKHtwYXJhbXNJbmhlcml0YW5jZVN0cmF0ZWd5OiAnYWx3YXlzJ30pKVxuICogICAgIF1cbiAqICAgfVxuICogKTtcbiAqIGBgYFxuICpcbiAqIEBzZWUgYFJvdXRlckZlYXR1cmVzYFxuICpcbiAqIEBwdWJsaWNBcGlcbiAqIEBwYXJhbSByb3V0ZXMgQSBzZXQgb2YgYFJvdXRlYHMgdG8gdXNlIGZvciB0aGUgYXBwbGljYXRpb24gcm91dGluZyB0YWJsZS5cbiAqIEBwYXJhbSBmZWF0dXJlcyBPcHRpb25hbCBmZWF0dXJlcyB0byBjb25maWd1cmUgYWRkaXRpb25hbCByb3V0ZXIgYmVoYXZpb3JzLlxuICogQHJldHVybnMgQSBzZXQgb2YgcHJvdmlkZXJzIHRvIHNldHVwIGEgUm91dGVyLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZVJvdXRlcihyb3V0ZXM6IFJvdXRlcywgLi4uZmVhdHVyZXM6IFJvdXRlckZlYXR1cmVzW10pOiBFbnZpcm9ubWVudFByb3ZpZGVycyB7XG4gIHJldHVybiBtYWtlRW52aXJvbm1lbnRQcm92aWRlcnMoW1xuICAgIHtwcm92aWRlOiBST1VURVMsIG11bHRpOiB0cnVlLCB1c2VWYWx1ZTogcm91dGVzfSxcbiAgICBOR19ERVZfTU9ERSA/IHtwcm92aWRlOiBST1VURVJfSVNfUFJPVklERUQsIHVzZVZhbHVlOiB0cnVlfSA6IFtdLFxuICAgIHtwcm92aWRlOiBBY3RpdmF0ZWRSb3V0ZSwgdXNlRmFjdG9yeTogcm9vdFJvdXRlLCBkZXBzOiBbUm91dGVyXX0sXG4gICAge3Byb3ZpZGU6IEFQUF9CT09UU1RSQVBfTElTVEVORVIsIG11bHRpOiB0cnVlLCB1c2VGYWN0b3J5OiBnZXRCb290c3RyYXBMaXN0ZW5lcn0sXG4gICAgZmVhdHVyZXMubWFwKGZlYXR1cmUgPT4gZmVhdHVyZS7JtXByb3ZpZGVycyksXG4gIF0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcm9vdFJvdXRlKHJvdXRlcjogUm91dGVyKTogQWN0aXZhdGVkUm91dGUge1xuICByZXR1cm4gcm91dGVyLnJvdXRlclN0YXRlLnJvb3Q7XG59XG5cbi8qKlxuICogSGVscGVyIHR5cGUgdG8gcmVwcmVzZW50IGEgUm91dGVyIGZlYXR1cmUuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgaW50ZXJmYWNlIFJvdXRlckZlYXR1cmU8RmVhdHVyZUtpbmQgZXh0ZW5kcyBSb3V0ZXJGZWF0dXJlS2luZD4ge1xuICDJtWtpbmQ6IEZlYXR1cmVLaW5kO1xuICDJtXByb3ZpZGVyczogUHJvdmlkZXJbXTtcbn1cblxuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdG8gY3JlYXRlIGFuIG9iamVjdCB0aGF0IHJlcHJlc2VudHMgYSBSb3V0ZXIgZmVhdHVyZS5cbiAqL1xuZnVuY3Rpb24gcm91dGVyRmVhdHVyZTxGZWF0dXJlS2luZCBleHRlbmRzIFJvdXRlckZlYXR1cmVLaW5kPihcbiAgICBraW5kOiBGZWF0dXJlS2luZCwgcHJvdmlkZXJzOiBQcm92aWRlcltdKTogUm91dGVyRmVhdHVyZTxGZWF0dXJlS2luZD4ge1xuICByZXR1cm4ge8m1a2luZDoga2luZCwgybVwcm92aWRlcnM6IHByb3ZpZGVyc307XG59XG5cblxuLyoqXG4gKiBBbiBJbmplY3Rpb24gdG9rZW4gdXNlZCB0byBpbmRpY2F0ZSB3aGV0aGVyIGBwcm92aWRlUm91dGVyYCBvciBgUm91dGVyTW9kdWxlLmZvclJvb3RgIHdhcyBldmVyXG4gKiBjYWxsZWQuXG4gKi9cbmV4cG9ydCBjb25zdCBST1VURVJfSVNfUFJPVklERUQgPVxuICAgIG5ldyBJbmplY3Rpb25Ub2tlbjxib29sZWFuPignJywge3Byb3ZpZGVkSW46ICdyb290JywgZmFjdG9yeTogKCkgPT4gZmFsc2V9KTtcblxuY29uc3Qgcm91dGVySXNQcm92aWRlZERldk1vZGVDaGVjayA9IHtcbiAgcHJvdmlkZTogRU5WSVJPTk1FTlRfSU5JVElBTElaRVIsXG4gIG11bHRpOiB0cnVlLFxuICB1c2VGYWN0b3J5KCkge1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBpZiAoIWluamVjdChST1VURVJfSVNfUFJPVklERUQpKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICAgICdgcHJvdmlkZVJvdXRlc2Agd2FzIGNhbGxlZCB3aXRob3V0IGBwcm92aWRlUm91dGVyYCBvciBgUm91dGVyTW9kdWxlLmZvclJvb3RgLiAnICtcbiAgICAgICAgICAgICdUaGlzIGlzIGxpa2VseSBhIG1pc3Rha2UuJyk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxufTtcblxuLyoqXG4gKiBSZWdpc3RlcnMgYSBbREkgcHJvdmlkZXJdKGd1aWRlL2dsb3NzYXJ5I3Byb3ZpZGVyKSBmb3IgYSBzZXQgb2Ygcm91dGVzLlxuICogQHBhcmFtIHJvdXRlcyBUaGUgcm91dGUgY29uZmlndXJhdGlvbiB0byBwcm92aWRlLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogYGBgXG4gKiBATmdNb2R1bGUoe1xuICogICBwcm92aWRlcnM6IFtwcm92aWRlUm91dGVzKFJPVVRFUyldXG4gKiB9KVxuICogY2xhc3MgTGF6eUxvYWRlZENoaWxkTW9kdWxlIHt9XG4gKiBgYGBcbiAqXG4gKiBAZGVwcmVjYXRlZCBJZiBuZWNlc3NhcnksIHByb3ZpZGUgcm91dGVzIHVzaW5nIHRoZSBgUk9VVEVTYCBgSW5qZWN0aW9uVG9rZW5gLlxuICogQHNlZSBgUk9VVEVTYFxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZVJvdXRlcyhyb3V0ZXM6IFJvdXRlcyk6IFByb3ZpZGVyW10ge1xuICByZXR1cm4gW1xuICAgIHtwcm92aWRlOiBST1VURVMsIG11bHRpOiB0cnVlLCB1c2VWYWx1ZTogcm91dGVzfSxcbiAgICBOR19ERVZfTU9ERSA/IHJvdXRlcklzUHJvdmlkZWREZXZNb2RlQ2hlY2sgOiBbXSxcbiAgXTtcbn1cblxuLyoqXG4gKiBBIHR5cGUgYWxpYXMgZm9yIHByb3ZpZGVycyByZXR1cm5lZCBieSBgd2l0aEluTWVtb3J5U2Nyb2xsaW5nYCBmb3IgdXNlIHdpdGggYHByb3ZpZGVSb3V0ZXJgLlxuICpcbiAqIEBzZWUgYHdpdGhJbk1lbW9yeVNjcm9sbGluZ2BcbiAqIEBzZWUgYHByb3ZpZGVSb3V0ZXJgXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgdHlwZSBJbk1lbW9yeVNjcm9sbGluZ0ZlYXR1cmUgPSBSb3V0ZXJGZWF0dXJlPFJvdXRlckZlYXR1cmVLaW5kLkluTWVtb3J5U2Nyb2xsaW5nRmVhdHVyZT47XG5cbi8qKlxuICogRW5hYmxlcyBjdXN0b21pemFibGUgc2Nyb2xsaW5nIGJlaGF2aW9yIGZvciByb3V0ZXIgbmF2aWdhdGlvbnMuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiBCYXNpYyBleGFtcGxlIG9mIGhvdyB5b3UgY2FuIGVuYWJsZSBzY3JvbGxpbmcgZmVhdHVyZTpcbiAqIGBgYFxuICogY29uc3QgYXBwUm91dGVzOiBSb3V0ZXMgPSBbXTtcbiAqIGJvb3RzdHJhcEFwcGxpY2F0aW9uKEFwcENvbXBvbmVudCxcbiAqICAge1xuICogICAgIHByb3ZpZGVyczogW1xuICogICAgICAgcHJvdmlkZVJvdXRlcihhcHBSb3V0ZXMsIHdpdGhJbk1lbW9yeVNjcm9sbGluZygpKVxuICogICAgIF1cbiAqICAgfVxuICogKTtcbiAqIGBgYFxuICpcbiAqIEBzZWUgYHByb3ZpZGVSb3V0ZXJgXG4gKiBAc2VlIGBWaWV3cG9ydFNjcm9sbGVyYFxuICpcbiAqIEBwdWJsaWNBcGlcbiAqIEBwYXJhbSBvcHRpb25zIFNldCBvZiBjb25maWd1cmF0aW9uIHBhcmFtZXRlcnMgdG8gY3VzdG9taXplIHNjcm9sbGluZyBiZWhhdmlvciwgc2VlXG4gKiAgICAgYEluTWVtb3J5U2Nyb2xsaW5nT3B0aW9uc2AgZm9yIGFkZGl0aW9uYWwgaW5mb3JtYXRpb24uXG4gKiBAcmV0dXJucyBBIHNldCBvZiBwcm92aWRlcnMgZm9yIHVzZSB3aXRoIGBwcm92aWRlUm91dGVyYC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdpdGhJbk1lbW9yeVNjcm9sbGluZyhvcHRpb25zOiBJbk1lbW9yeVNjcm9sbGluZ09wdGlvbnMgPSB7fSk6XG4gICAgSW5NZW1vcnlTY3JvbGxpbmdGZWF0dXJlIHtcbiAgY29uc3QgcHJvdmlkZXJzID0gW3tcbiAgICBwcm92aWRlOiBST1VURVJfU0NST0xMRVIsXG4gICAgdXNlRmFjdG9yeTogKCkgPT4ge1xuICAgICAgY29uc3Qgdmlld3BvcnRTY3JvbGxlciA9IGluamVjdChWaWV3cG9ydFNjcm9sbGVyKTtcbiAgICAgIGNvbnN0IHpvbmUgPSBpbmplY3QoTmdab25lKTtcbiAgICAgIGNvbnN0IHRyYW5zaXRpb25zID0gaW5qZWN0KE5hdmlnYXRpb25UcmFuc2l0aW9ucyk7XG4gICAgICBjb25zdCB1cmxTZXJpYWxpemVyID0gaW5qZWN0KFVybFNlcmlhbGl6ZXIpO1xuICAgICAgcmV0dXJuIG5ldyBSb3V0ZXJTY3JvbGxlcih1cmxTZXJpYWxpemVyLCB0cmFuc2l0aW9ucywgdmlld3BvcnRTY3JvbGxlciwgem9uZSwgb3B0aW9ucyk7XG4gICAgfSxcbiAgfV07XG4gIHJldHVybiByb3V0ZXJGZWF0dXJlKFJvdXRlckZlYXR1cmVLaW5kLkluTWVtb3J5U2Nyb2xsaW5nRmVhdHVyZSwgcHJvdmlkZXJzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEJvb3RzdHJhcExpc3RlbmVyKCkge1xuICBjb25zdCBpbmplY3RvciA9IGluamVjdChJbmplY3Rvcik7XG4gIHJldHVybiAoYm9vdHN0cmFwcGVkQ29tcG9uZW50UmVmOiBDb21wb25lbnRSZWY8dW5rbm93bj4pID0+IHtcbiAgICBjb25zdCByZWYgPSBpbmplY3Rvci5nZXQoQXBwbGljYXRpb25SZWYpO1xuXG4gICAgaWYgKGJvb3RzdHJhcHBlZENvbXBvbmVudFJlZiAhPT0gcmVmLmNvbXBvbmVudHNbMF0pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCByb3V0ZXIgPSBpbmplY3Rvci5nZXQoUm91dGVyKTtcbiAgICBjb25zdCBib290c3RyYXBEb25lID0gaW5qZWN0b3IuZ2V0KEJPT1RTVFJBUF9ET05FKTtcblxuICAgIGlmIChpbmplY3Rvci5nZXQoSU5JVElBTF9OQVZJR0FUSU9OKSA9PT0gSW5pdGlhbE5hdmlnYXRpb24uRW5hYmxlZE5vbkJsb2NraW5nKSB7XG4gICAgICByb3V0ZXIuaW5pdGlhbE5hdmlnYXRpb24oKTtcbiAgICB9XG5cbiAgICBpbmplY3Rvci5nZXQoUk9VVEVSX1BSRUxPQURFUiwgbnVsbCwgSW5qZWN0RmxhZ3MuT3B0aW9uYWwpPy5zZXRVcFByZWxvYWRpbmcoKTtcbiAgICBpbmplY3Rvci5nZXQoUk9VVEVSX1NDUk9MTEVSLCBudWxsLCBJbmplY3RGbGFncy5PcHRpb25hbCk/LmluaXQoKTtcbiAgICByb3V0ZXIucmVzZXRSb290Q29tcG9uZW50VHlwZShyZWYuY29tcG9uZW50VHlwZXNbMF0pO1xuICAgIGlmICghYm9vdHN0cmFwRG9uZS5jbG9zZWQpIHtcbiAgICAgIGJvb3RzdHJhcERvbmUubmV4dCgpO1xuICAgICAgYm9vdHN0cmFwRG9uZS51bnN1YnNjcmliZSgpO1xuICAgIH1cbiAgfTtcbn1cblxuLyoqXG4gKiBBIHN1YmplY3QgdXNlZCB0byBpbmRpY2F0ZSB0aGF0IHRoZSBib290c3RyYXBwaW5nIHBoYXNlIGlzIGRvbmUuIFdoZW4gaW5pdGlhbCBuYXZpZ2F0aW9uIGlzXG4gKiBgZW5hYmxlZEJsb2NraW5nYCwgdGhlIGZpcnN0IG5hdmlnYXRpb24gd2FpdHMgdW50aWwgYm9vdHN0cmFwcGluZyBpcyBmaW5pc2hlZCBiZWZvcmUgY29udGludWluZ1xuICogdG8gdGhlIGFjdGl2YXRpb24gcGhhc2UuXG4gKi9cbmNvbnN0IEJPT1RTVFJBUF9ET05FID1cbiAgICBuZXcgSW5qZWN0aW9uVG9rZW48U3ViamVjdDx2b2lkPj4oTkdfREVWX01PREUgPyAnYm9vdHN0cmFwIGRvbmUgaW5kaWNhdG9yJyA6ICcnLCB7XG4gICAgICBmYWN0b3J5OiAoKSA9PiB7XG4gICAgICAgIHJldHVybiBuZXcgU3ViamVjdDx2b2lkPigpO1xuICAgICAgfVxuICAgIH0pO1xuXG4vKipcbiAqIFRoaXMgYW5kIHRoZSBJTklUSUFMX05BVklHQVRJT04gdG9rZW4gYXJlIHVzZWQgaW50ZXJuYWxseSBvbmx5LiBUaGUgcHVibGljIEFQSSBzaWRlIG9mIHRoaXMgaXNcbiAqIGNvbmZpZ3VyZWQgdGhyb3VnaCB0aGUgYEV4dHJhT3B0aW9uc2AuXG4gKlxuICogV2hlbiBzZXQgdG8gYEVuYWJsZWRCbG9ja2luZ2AsIHRoZSBpbml0aWFsIG5hdmlnYXRpb24gc3RhcnRzIGJlZm9yZSB0aGUgcm9vdFxuICogY29tcG9uZW50IGlzIGNyZWF0ZWQuIFRoZSBib290c3RyYXAgaXMgYmxvY2tlZCB1bnRpbCB0aGUgaW5pdGlhbCBuYXZpZ2F0aW9uIGlzIGNvbXBsZXRlLiBUaGlzXG4gKiB2YWx1ZSBpcyByZXF1aXJlZCBmb3IgW3NlcnZlci1zaWRlIHJlbmRlcmluZ10oZ3VpZGUvdW5pdmVyc2FsKSB0byB3b3JrLlxuICpcbiAqIFdoZW4gc2V0IHRvIGBFbmFibGVkTm9uQmxvY2tpbmdgLCB0aGUgaW5pdGlhbCBuYXZpZ2F0aW9uIHN0YXJ0cyBhZnRlciB0aGUgcm9vdCBjb21wb25lbnQgaGFzIGJlZW5cbiAqIGNyZWF0ZWQuIFRoZSBib290c3RyYXAgaXMgbm90IGJsb2NrZWQgb24gdGhlIGNvbXBsZXRpb24gb2YgdGhlIGluaXRpYWwgbmF2aWdhdGlvbi5cbiAqXG4gKiBXaGVuIHNldCB0byBgRGlzYWJsZWRgLCB0aGUgaW5pdGlhbCBuYXZpZ2F0aW9uIGlzIG5vdCBwZXJmb3JtZWQuIFRoZSBsb2NhdGlvbiBsaXN0ZW5lciBpcyBzZXQgdXBcbiAqIGJlZm9yZSB0aGUgcm9vdCBjb21wb25lbnQgZ2V0cyBjcmVhdGVkLiBVc2UgaWYgdGhlcmUgaXMgYSByZWFzb24gdG8gaGF2ZSBtb3JlIGNvbnRyb2wgb3ZlciB3aGVuXG4gKiB0aGUgcm91dGVyIHN0YXJ0cyBpdHMgaW5pdGlhbCBuYXZpZ2F0aW9uIGR1ZSB0byBzb21lIGNvbXBsZXggaW5pdGlhbGl6YXRpb24gbG9naWMuXG4gKlxuICogQHNlZSBgRXh0cmFPcHRpb25zYFxuICovXG5jb25zdCBlbnVtIEluaXRpYWxOYXZpZ2F0aW9uIHtcbiAgRW5hYmxlZEJsb2NraW5nLFxuICBFbmFibGVkTm9uQmxvY2tpbmcsXG4gIERpc2FibGVkLFxufVxuXG5jb25zdCBJTklUSUFMX05BVklHQVRJT04gPSBuZXcgSW5qZWN0aW9uVG9rZW48SW5pdGlhbE5hdmlnYXRpb24+KFxuICAgIE5HX0RFVl9NT0RFID8gJ2luaXRpYWwgbmF2aWdhdGlvbicgOiAnJyxcbiAgICB7cHJvdmlkZWRJbjogJ3Jvb3QnLCBmYWN0b3J5OiAoKSA9PiBJbml0aWFsTmF2aWdhdGlvbi5FbmFibGVkTm9uQmxvY2tpbmd9KTtcblxuLyoqXG4gKiBBIHR5cGUgYWxpYXMgZm9yIHByb3ZpZGVycyByZXR1cm5lZCBieSBgd2l0aEVuYWJsZWRCbG9ja2luZ0luaXRpYWxOYXZpZ2F0aW9uYCBmb3IgdXNlIHdpdGhcbiAqIGBwcm92aWRlUm91dGVyYC5cbiAqXG4gKiBAc2VlIGB3aXRoRW5hYmxlZEJsb2NraW5nSW5pdGlhbE5hdmlnYXRpb25gXG4gKiBAc2VlIGBwcm92aWRlUm91dGVyYFxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IHR5cGUgRW5hYmxlZEJsb2NraW5nSW5pdGlhbE5hdmlnYXRpb25GZWF0dXJlID1cbiAgICBSb3V0ZXJGZWF0dXJlPFJvdXRlckZlYXR1cmVLaW5kLkVuYWJsZWRCbG9ja2luZ0luaXRpYWxOYXZpZ2F0aW9uRmVhdHVyZT47XG5cbi8qKlxuICogQSB0eXBlIGFsaWFzIGZvciBwcm92aWRlcnMgcmV0dXJuZWQgYnkgYHdpdGhFbmFibGVkQmxvY2tpbmdJbml0aWFsTmF2aWdhdGlvbmAgb3JcbiAqIGB3aXRoRGlzYWJsZWRJbml0aWFsTmF2aWdhdGlvbmAgZnVuY3Rpb25zIGZvciB1c2Ugd2l0aCBgcHJvdmlkZVJvdXRlcmAuXG4gKlxuICogQHNlZSBgd2l0aEVuYWJsZWRCbG9ja2luZ0luaXRpYWxOYXZpZ2F0aW9uYFxuICogQHNlZSBgd2l0aERpc2FibGVkSW5pdGlhbE5hdmlnYXRpb25gXG4gKiBAc2VlIGBwcm92aWRlUm91dGVyYFxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IHR5cGUgSW5pdGlhbE5hdmlnYXRpb25GZWF0dXJlID1cbiAgICBFbmFibGVkQmxvY2tpbmdJbml0aWFsTmF2aWdhdGlvbkZlYXR1cmV8RGlzYWJsZWRJbml0aWFsTmF2aWdhdGlvbkZlYXR1cmU7XG5cbi8qKlxuICogQ29uZmlndXJlcyBpbml0aWFsIG5hdmlnYXRpb24gdG8gc3RhcnQgYmVmb3JlIHRoZSByb290IGNvbXBvbmVudCBpcyBjcmVhdGVkLlxuICpcbiAqIFRoZSBib290c3RyYXAgaXMgYmxvY2tlZCB1bnRpbCB0aGUgaW5pdGlhbCBuYXZpZ2F0aW9uIGlzIGNvbXBsZXRlLiBUaGlzIHZhbHVlIGlzIHJlcXVpcmVkIGZvclxuICogW3NlcnZlci1zaWRlIHJlbmRlcmluZ10oZ3VpZGUvdW5pdmVyc2FsKSB0byB3b3JrLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogQmFzaWMgZXhhbXBsZSBvZiBob3cgeW91IGNhbiBlbmFibGUgdGhpcyBuYXZpZ2F0aW9uIGJlaGF2aW9yOlxuICogYGBgXG4gKiBjb25zdCBhcHBSb3V0ZXM6IFJvdXRlcyA9IFtdO1xuICogYm9vdHN0cmFwQXBwbGljYXRpb24oQXBwQ29tcG9uZW50LFxuICogICB7XG4gKiAgICAgcHJvdmlkZXJzOiBbXG4gKiAgICAgICBwcm92aWRlUm91dGVyKGFwcFJvdXRlcywgd2l0aEVuYWJsZWRCbG9ja2luZ0luaXRpYWxOYXZpZ2F0aW9uKCkpXG4gKiAgICAgXVxuICogICB9XG4gKiApO1xuICogYGBgXG4gKlxuICogQHNlZSBgcHJvdmlkZVJvdXRlcmBcbiAqXG4gKiBAcHVibGljQXBpXG4gKiBAcmV0dXJucyBBIHNldCBvZiBwcm92aWRlcnMgZm9yIHVzZSB3aXRoIGBwcm92aWRlUm91dGVyYC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdpdGhFbmFibGVkQmxvY2tpbmdJbml0aWFsTmF2aWdhdGlvbigpOiBFbmFibGVkQmxvY2tpbmdJbml0aWFsTmF2aWdhdGlvbkZlYXR1cmUge1xuICBjb25zdCBwcm92aWRlcnMgPSBbXG4gICAge3Byb3ZpZGU6IElOSVRJQUxfTkFWSUdBVElPTiwgdXNlVmFsdWU6IEluaXRpYWxOYXZpZ2F0aW9uLkVuYWJsZWRCbG9ja2luZ30sXG4gICAge1xuICAgICAgcHJvdmlkZTogQVBQX0lOSVRJQUxJWkVSLFxuICAgICAgbXVsdGk6IHRydWUsXG4gICAgICBkZXBzOiBbSW5qZWN0b3JdLFxuICAgICAgdXNlRmFjdG9yeTogKGluamVjdG9yOiBJbmplY3RvcikgPT4ge1xuICAgICAgICBjb25zdCBsb2NhdGlvbkluaXRpYWxpemVkOiBQcm9taXNlPGFueT4gPVxuICAgICAgICAgICAgaW5qZWN0b3IuZ2V0KExPQ0FUSU9OX0lOSVRJQUxJWkVELCBQcm9taXNlLnJlc29sdmUoKSk7XG5cbiAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gbG9jYXRpb25Jbml0aWFsaXplZC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgICAgICAgICAgY29uc3Qgcm91dGVyID0gaW5qZWN0b3IuZ2V0KFJvdXRlcik7XG4gICAgICAgICAgICAgIGNvbnN0IGJvb3RzdHJhcERvbmUgPSBpbmplY3Rvci5nZXQoQk9PVFNUUkFQX0RPTkUpO1xuICAgICAgICAgICAgICBhZnRlck5leHROYXZpZ2F0aW9uKHJvdXRlciwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIFVuYmxvY2sgQVBQX0lOSVRJQUxJWkVSIGluIGNhc2UgdGhlIGluaXRpYWwgbmF2aWdhdGlvbiB3YXMgY2FuY2VsZWQgb3IgZXJyb3JlZFxuICAgICAgICAgICAgICAgIC8vIHdpdGhvdXQgYSByZWRpcmVjdC5cbiAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICBpbmplY3Rvci5nZXQoTmF2aWdhdGlvblRyYW5zaXRpb25zKS5hZnRlclByZWFjdGl2YXRpb24gPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gVW5ibG9jayBBUFBfSU5JVElBTElaRVIgb25jZSB3ZSBnZXQgdG8gYGFmdGVyUHJlYWN0aXZhdGlvbmAuIEF0IHRoaXMgcG9pbnQsIHdlXG4gICAgICAgICAgICAgICAgLy8gYXNzdW1lIGFjdGl2YXRpb24gd2lsbCBjb21wbGV0ZSBzdWNjZXNzZnVsbHkgKGV2ZW4gdGhvdWdoIHRoaXMgaXMgbm90XG4gICAgICAgICAgICAgICAgLy8gZ3VhcmFudGVlZCkuXG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYm9vdHN0cmFwRG9uZS5jbG9zZWQgPyBvZih2b2lkIDApIDogYm9vdHN0cmFwRG9uZTtcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgcm91dGVyLmluaXRpYWxOYXZpZ2F0aW9uKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9LFxuICBdO1xuICByZXR1cm4gcm91dGVyRmVhdHVyZShSb3V0ZXJGZWF0dXJlS2luZC5FbmFibGVkQmxvY2tpbmdJbml0aWFsTmF2aWdhdGlvbkZlYXR1cmUsIHByb3ZpZGVycyk7XG59XG5cbi8qKlxuICogQSB0eXBlIGFsaWFzIGZvciBwcm92aWRlcnMgcmV0dXJuZWQgYnkgYHdpdGhEaXNhYmxlZEluaXRpYWxOYXZpZ2F0aW9uYCBmb3IgdXNlIHdpdGhcbiAqIGBwcm92aWRlUm91dGVyYC5cbiAqXG4gKiBAc2VlIGB3aXRoRGlzYWJsZWRJbml0aWFsTmF2aWdhdGlvbmBcbiAqIEBzZWUgYHByb3ZpZGVSb3V0ZXJgXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgdHlwZSBEaXNhYmxlZEluaXRpYWxOYXZpZ2F0aW9uRmVhdHVyZSA9XG4gICAgUm91dGVyRmVhdHVyZTxSb3V0ZXJGZWF0dXJlS2luZC5EaXNhYmxlZEluaXRpYWxOYXZpZ2F0aW9uRmVhdHVyZT47XG5cbi8qKlxuICogRGlzYWJsZXMgaW5pdGlhbCBuYXZpZ2F0aW9uLlxuICpcbiAqIFVzZSBpZiB0aGVyZSBpcyBhIHJlYXNvbiB0byBoYXZlIG1vcmUgY29udHJvbCBvdmVyIHdoZW4gdGhlIHJvdXRlciBzdGFydHMgaXRzIGluaXRpYWwgbmF2aWdhdGlvblxuICogZHVlIHRvIHNvbWUgY29tcGxleCBpbml0aWFsaXphdGlvbiBsb2dpYy5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqIEJhc2ljIGV4YW1wbGUgb2YgaG93IHlvdSBjYW4gZGlzYWJsZSBpbml0aWFsIG5hdmlnYXRpb246XG4gKiBgYGBcbiAqIGNvbnN0IGFwcFJvdXRlczogUm91dGVzID0gW107XG4gKiBib290c3RyYXBBcHBsaWNhdGlvbihBcHBDb21wb25lbnQsXG4gKiAgIHtcbiAqICAgICBwcm92aWRlcnM6IFtcbiAqICAgICAgIHByb3ZpZGVSb3V0ZXIoYXBwUm91dGVzLCB3aXRoRGlzYWJsZWRJbml0aWFsTmF2aWdhdGlvbigpKVxuICogICAgIF1cbiAqICAgfVxuICogKTtcbiAqIGBgYFxuICpcbiAqIEBzZWUgYHByb3ZpZGVSb3V0ZXJgXG4gKlxuICogQHJldHVybnMgQSBzZXQgb2YgcHJvdmlkZXJzIGZvciB1c2Ugd2l0aCBgcHJvdmlkZVJvdXRlcmAuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gd2l0aERpc2FibGVkSW5pdGlhbE5hdmlnYXRpb24oKTogRGlzYWJsZWRJbml0aWFsTmF2aWdhdGlvbkZlYXR1cmUge1xuICBjb25zdCBwcm92aWRlcnMgPSBbXG4gICAge1xuICAgICAgcHJvdmlkZTogQVBQX0lOSVRJQUxJWkVSLFxuICAgICAgbXVsdGk6IHRydWUsXG4gICAgICB1c2VGYWN0b3J5OiAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHJvdXRlciA9IGluamVjdChSb3V0ZXIpO1xuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgIHJvdXRlci5zZXRVcExvY2F0aW9uQ2hhbmdlTGlzdGVuZXIoKTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHtwcm92aWRlOiBJTklUSUFMX05BVklHQVRJT04sIHVzZVZhbHVlOiBJbml0aWFsTmF2aWdhdGlvbi5EaXNhYmxlZH1cbiAgXTtcbiAgcmV0dXJuIHJvdXRlckZlYXR1cmUoUm91dGVyRmVhdHVyZUtpbmQuRGlzYWJsZWRJbml0aWFsTmF2aWdhdGlvbkZlYXR1cmUsIHByb3ZpZGVycyk7XG59XG5cbi8qKlxuICogQSB0eXBlIGFsaWFzIGZvciBwcm92aWRlcnMgcmV0dXJuZWQgYnkgYHdpdGhEZWJ1Z1RyYWNpbmdgIGZvciB1c2Ugd2l0aCBgcHJvdmlkZVJvdXRlcmAuXG4gKlxuICogQHNlZSBgd2l0aERlYnVnVHJhY2luZ2BcbiAqIEBzZWUgYHByb3ZpZGVSb3V0ZXJgXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgdHlwZSBEZWJ1Z1RyYWNpbmdGZWF0dXJlID0gUm91dGVyRmVhdHVyZTxSb3V0ZXJGZWF0dXJlS2luZC5EZWJ1Z1RyYWNpbmdGZWF0dXJlPjtcblxuLyoqXG4gKiBFbmFibGVzIGxvZ2dpbmcgb2YgYWxsIGludGVybmFsIG5hdmlnYXRpb24gZXZlbnRzIHRvIHRoZSBjb25zb2xlLlxuICogRXh0cmEgbG9nZ2luZyBtaWdodCBiZSB1c2VmdWwgZm9yIGRlYnVnZ2luZyBwdXJwb3NlcyB0byBpbnNwZWN0IFJvdXRlciBldmVudCBzZXF1ZW5jZS5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqIEJhc2ljIGV4YW1wbGUgb2YgaG93IHlvdSBjYW4gZW5hYmxlIGRlYnVnIHRyYWNpbmc6XG4gKiBgYGBcbiAqIGNvbnN0IGFwcFJvdXRlczogUm91dGVzID0gW107XG4gKiBib290c3RyYXBBcHBsaWNhdGlvbihBcHBDb21wb25lbnQsXG4gKiAgIHtcbiAqICAgICBwcm92aWRlcnM6IFtcbiAqICAgICAgIHByb3ZpZGVSb3V0ZXIoYXBwUm91dGVzLCB3aXRoRGVidWdUcmFjaW5nKCkpXG4gKiAgICAgXVxuICogICB9XG4gKiApO1xuICogYGBgXG4gKlxuICogQHNlZSBgcHJvdmlkZVJvdXRlcmBcbiAqXG4gKiBAcmV0dXJucyBBIHNldCBvZiBwcm92aWRlcnMgZm9yIHVzZSB3aXRoIGBwcm92aWRlUm91dGVyYC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3aXRoRGVidWdUcmFjaW5nKCk6IERlYnVnVHJhY2luZ0ZlYXR1cmUge1xuICBsZXQgcHJvdmlkZXJzOiBQcm92aWRlcltdID0gW107XG4gIGlmIChOR19ERVZfTU9ERSkge1xuICAgIHByb3ZpZGVycyA9IFt7XG4gICAgICBwcm92aWRlOiBFTlZJUk9OTUVOVF9JTklUSUFMSVpFUixcbiAgICAgIG11bHRpOiB0cnVlLFxuICAgICAgdXNlRmFjdG9yeTogKCkgPT4ge1xuICAgICAgICBjb25zdCByb3V0ZXIgPSBpbmplY3QoUm91dGVyKTtcbiAgICAgICAgcmV0dXJuICgpID0+IHJvdXRlci5ldmVudHMuc3Vic2NyaWJlKChlOiBFdmVudCkgPT4ge1xuICAgICAgICAgIC8vIHRzbGludDpkaXNhYmxlOm5vLWNvbnNvbGVcbiAgICAgICAgICBjb25zb2xlLmdyb3VwPy4oYFJvdXRlciBFdmVudDogJHsoPGFueT5lLmNvbnN0cnVjdG9yKS5uYW1lfWApO1xuICAgICAgICAgIGNvbnNvbGUubG9nKHN0cmluZ2lmeUV2ZW50KGUpKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcbiAgICAgICAgICBjb25zb2xlLmdyb3VwRW5kPy4oKTtcbiAgICAgICAgICAvLyB0c2xpbnQ6ZW5hYmxlOm5vLWNvbnNvbGVcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfV07XG4gIH0gZWxzZSB7XG4gICAgcHJvdmlkZXJzID0gW107XG4gIH1cbiAgcmV0dXJuIHJvdXRlckZlYXR1cmUoUm91dGVyRmVhdHVyZUtpbmQuRGVidWdUcmFjaW5nRmVhdHVyZSwgcHJvdmlkZXJzKTtcbn1cblxuY29uc3QgUk9VVEVSX1BSRUxPQURFUiA9IG5ldyBJbmplY3Rpb25Ub2tlbjxSb3V0ZXJQcmVsb2FkZXI+KE5HX0RFVl9NT0RFID8gJ3JvdXRlciBwcmVsb2FkZXInIDogJycpO1xuXG4vKipcbiAqIEEgdHlwZSBhbGlhcyB0aGF0IHJlcHJlc2VudHMgYSBmZWF0dXJlIHdoaWNoIGVuYWJsZXMgcHJlbG9hZGluZyBpbiBSb3V0ZXIuXG4gKiBUaGUgdHlwZSBpcyB1c2VkIHRvIGRlc2NyaWJlIHRoZSByZXR1cm4gdmFsdWUgb2YgdGhlIGB3aXRoUHJlbG9hZGluZ2AgZnVuY3Rpb24uXG4gKlxuICogQHNlZSBgd2l0aFByZWxvYWRpbmdgXG4gKiBAc2VlIGBwcm92aWRlUm91dGVyYFxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IHR5cGUgUHJlbG9hZGluZ0ZlYXR1cmUgPSBSb3V0ZXJGZWF0dXJlPFJvdXRlckZlYXR1cmVLaW5kLlByZWxvYWRpbmdGZWF0dXJlPjtcblxuLyoqXG4gKiBBbGxvd3MgdG8gY29uZmlndXJlIGEgcHJlbG9hZGluZyBzdHJhdGVneSB0byB1c2UuIFRoZSBzdHJhdGVneSBpcyBjb25maWd1cmVkIGJ5IHByb3ZpZGluZyBhXG4gKiByZWZlcmVuY2UgdG8gYSBjbGFzcyB0aGF0IGltcGxlbWVudHMgYSBgUHJlbG9hZGluZ1N0cmF0ZWd5YC5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqIEJhc2ljIGV4YW1wbGUgb2YgaG93IHlvdSBjYW4gY29uZmlndXJlIHByZWxvYWRpbmc6XG4gKiBgYGBcbiAqIGNvbnN0IGFwcFJvdXRlczogUm91dGVzID0gW107XG4gKiBib290c3RyYXBBcHBsaWNhdGlvbihBcHBDb21wb25lbnQsXG4gKiAgIHtcbiAqICAgICBwcm92aWRlcnM6IFtcbiAqICAgICAgIHByb3ZpZGVSb3V0ZXIoYXBwUm91dGVzLCB3aXRoUHJlbG9hZGluZyhQcmVsb2FkQWxsTW9kdWxlcykpXG4gKiAgICAgXVxuICogICB9XG4gKiApO1xuICogYGBgXG4gKlxuICogQHNlZSBgcHJvdmlkZVJvdXRlcmBcbiAqXG4gKiBAcGFyYW0gcHJlbG9hZGluZ1N0cmF0ZWd5IEEgcmVmZXJlbmNlIHRvIGEgY2xhc3MgdGhhdCBpbXBsZW1lbnRzIGEgYFByZWxvYWRpbmdTdHJhdGVneWAgdGhhdFxuICogICAgIHNob3VsZCBiZSB1c2VkLlxuICogQHJldHVybnMgQSBzZXQgb2YgcHJvdmlkZXJzIGZvciB1c2Ugd2l0aCBgcHJvdmlkZVJvdXRlcmAuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gd2l0aFByZWxvYWRpbmcocHJlbG9hZGluZ1N0cmF0ZWd5OiBUeXBlPFByZWxvYWRpbmdTdHJhdGVneT4pOiBQcmVsb2FkaW5nRmVhdHVyZSB7XG4gIGNvbnN0IHByb3ZpZGVycyA9IFtcbiAgICB7cHJvdmlkZTogUk9VVEVSX1BSRUxPQURFUiwgdXNlRXhpc3Rpbmc6IFJvdXRlclByZWxvYWRlcn0sXG4gICAge3Byb3ZpZGU6IFByZWxvYWRpbmdTdHJhdGVneSwgdXNlRXhpc3Rpbmc6IHByZWxvYWRpbmdTdHJhdGVneX0sXG4gIF07XG4gIHJldHVybiByb3V0ZXJGZWF0dXJlKFJvdXRlckZlYXR1cmVLaW5kLlByZWxvYWRpbmdGZWF0dXJlLCBwcm92aWRlcnMpO1xufVxuXG4vKipcbiAqIEEgdHlwZSBhbGlhcyBmb3IgcHJvdmlkZXJzIHJldHVybmVkIGJ5IGB3aXRoUm91dGVyQ29uZmlnYCBmb3IgdXNlIHdpdGggYHByb3ZpZGVSb3V0ZXJgLlxuICpcbiAqIEBzZWUgYHdpdGhSb3V0ZXJDb25maWdgXG4gKiBAc2VlIGBwcm92aWRlUm91dGVyYFxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IHR5cGUgUm91dGVyQ29uZmlndXJhdGlvbkZlYXR1cmUgPVxuICAgIFJvdXRlckZlYXR1cmU8Um91dGVyRmVhdHVyZUtpbmQuUm91dGVyQ29uZmlndXJhdGlvbkZlYXR1cmU+O1xuXG4vKipcbiAqIEFsbG93cyB0byBwcm92aWRlIGV4dHJhIHBhcmFtZXRlcnMgdG8gY29uZmlndXJlIFJvdXRlci5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqIEJhc2ljIGV4YW1wbGUgb2YgaG93IHlvdSBjYW4gcHJvdmlkZSBleHRyYSBjb25maWd1cmF0aW9uIG9wdGlvbnM6XG4gKiBgYGBcbiAqIGNvbnN0IGFwcFJvdXRlczogUm91dGVzID0gW107XG4gKiBib290c3RyYXBBcHBsaWNhdGlvbihBcHBDb21wb25lbnQsXG4gKiAgIHtcbiAqICAgICBwcm92aWRlcnM6IFtcbiAqICAgICAgIHByb3ZpZGVSb3V0ZXIoYXBwUm91dGVzLCB3aXRoUm91dGVyQ29uZmlnKHtcbiAqICAgICAgICAgIG9uU2FtZVVybE5hdmlnYXRpb246ICdyZWxvYWQnXG4gKiAgICAgICB9KSlcbiAqICAgICBdXG4gKiAgIH1cbiAqICk7XG4gKiBgYGBcbiAqXG4gKiBAc2VlIGBwcm92aWRlUm91dGVyYFxuICpcbiAqIEBwYXJhbSBvcHRpb25zIEEgc2V0IG9mIHBhcmFtZXRlcnMgdG8gY29uZmlndXJlIFJvdXRlciwgc2VlIGBSb3V0ZXJDb25maWdPcHRpb25zYCBmb3JcbiAqICAgICBhZGRpdGlvbmFsIGluZm9ybWF0aW9uLlxuICogQHJldHVybnMgQSBzZXQgb2YgcHJvdmlkZXJzIGZvciB1c2Ugd2l0aCBgcHJvdmlkZVJvdXRlcmAuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gd2l0aFJvdXRlckNvbmZpZyhvcHRpb25zOiBSb3V0ZXJDb25maWdPcHRpb25zKTogUm91dGVyQ29uZmlndXJhdGlvbkZlYXR1cmUge1xuICBjb25zdCBwcm92aWRlcnMgPSBbXG4gICAge3Byb3ZpZGU6IFJPVVRFUl9DT05GSUdVUkFUSU9OLCB1c2VWYWx1ZTogb3B0aW9uc30sXG4gIF07XG4gIHJldHVybiByb3V0ZXJGZWF0dXJlKFJvdXRlckZlYXR1cmVLaW5kLlJvdXRlckNvbmZpZ3VyYXRpb25GZWF0dXJlLCBwcm92aWRlcnMpO1xufVxuXG4vKipcbiAqIEEgdHlwZSBhbGlhcyBmb3IgcHJvdmlkZXJzIHJldHVybmVkIGJ5IGB3aXRoSGFzaExvY2F0aW9uYCBmb3IgdXNlIHdpdGggYHByb3ZpZGVSb3V0ZXJgLlxuICpcbiAqIEBzZWUgYHdpdGhIYXNoTG9jYXRpb25gXG4gKiBAc2VlIGBwcm92aWRlUm91dGVyYFxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IHR5cGUgUm91dGVySGFzaExvY2F0aW9uRmVhdHVyZSA9IFJvdXRlckZlYXR1cmU8Um91dGVyRmVhdHVyZUtpbmQuUm91dGVySGFzaExvY2F0aW9uRmVhdHVyZT47XG5cbi8qKlxuICogUHJvdmlkZXMgdGhlIGxvY2F0aW9uIHN0cmF0ZWd5IHRoYXQgdXNlcyB0aGUgVVJMIGZyYWdtZW50IGluc3RlYWQgb2YgdGhlIGhpc3RvcnkgQVBJLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogQmFzaWMgZXhhbXBsZSBvZiBob3cgeW91IGNhbiB1c2UgdGhlIGhhc2ggbG9jYXRpb24gb3B0aW9uOlxuICogYGBgXG4gKiBjb25zdCBhcHBSb3V0ZXM6IFJvdXRlcyA9IFtdO1xuICogYm9vdHN0cmFwQXBwbGljYXRpb24oQXBwQ29tcG9uZW50LFxuICogICB7XG4gKiAgICAgcHJvdmlkZXJzOiBbXG4gKiAgICAgICBwcm92aWRlUm91dGVyKGFwcFJvdXRlcywgd2l0aEhhc2hMb2NhdGlvbigpKVxuICogICAgIF1cbiAqICAgfVxuICogKTtcbiAqIGBgYFxuICpcbiAqIEBzZWUgYHByb3ZpZGVSb3V0ZXJgXG4gKiBAc2VlIGBIYXNoTG9jYXRpb25TdHJhdGVneWBcbiAqXG4gKiBAcmV0dXJucyBBIHNldCBvZiBwcm92aWRlcnMgZm9yIHVzZSB3aXRoIGBwcm92aWRlUm91dGVyYC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3aXRoSGFzaExvY2F0aW9uKCk6IFJvdXRlckNvbmZpZ3VyYXRpb25GZWF0dXJlIHtcbiAgY29uc3QgcHJvdmlkZXJzID0gW1xuICAgIHtwcm92aWRlOiBMb2NhdGlvblN0cmF0ZWd5LCB1c2VDbGFzczogSGFzaExvY2F0aW9uU3RyYXRlZ3l9LFxuICBdO1xuICByZXR1cm4gcm91dGVyRmVhdHVyZShSb3V0ZXJGZWF0dXJlS2luZC5Sb3V0ZXJDb25maWd1cmF0aW9uRmVhdHVyZSwgcHJvdmlkZXJzKTtcbn1cblxuLyoqXG4gKiBBIHR5cGUgYWxpYXMgZm9yIHByb3ZpZGVycyByZXR1cm5lZCBieSBgd2l0aE5hdmlnYXRpb25FcnJvckhhbmRsZXJgIGZvciB1c2Ugd2l0aCBgcHJvdmlkZVJvdXRlcmAuXG4gKlxuICogQHNlZSBgd2l0aE5hdmlnYXRpb25FcnJvckhhbmRsZXJgXG4gKiBAc2VlIGBwcm92aWRlUm91dGVyYFxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IHR5cGUgTmF2aWdhdGlvbkVycm9ySGFuZGxlckZlYXR1cmUgPVxuICAgIFJvdXRlckZlYXR1cmU8Um91dGVyRmVhdHVyZUtpbmQuTmF2aWdhdGlvbkVycm9ySGFuZGxlckZlYXR1cmU+O1xuXG4vKipcbiAqIFN1YnNjcmliZXMgdG8gdGhlIFJvdXRlcidzIG5hdmlnYXRpb24gZXZlbnRzIGFuZCBjYWxscyB0aGUgZ2l2ZW4gZnVuY3Rpb24gd2hlbiBhXG4gKiBgTmF2aWdhdGlvbkVycm9yYCBoYXBwZW5zLlxuICpcbiAqIFRoaXMgZnVuY3Rpb24gaXMgcnVuIGluc2lkZSBhcHBsaWNhdGlvbidzIGluamVjdGlvbiBjb250ZXh0IHNvIHlvdSBjYW4gdXNlIHRoZSBgaW5qZWN0YCBmdW5jdGlvbi5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqIEJhc2ljIGV4YW1wbGUgb2YgaG93IHlvdSBjYW4gdXNlIHRoZSBlcnJvciBoYW5kbGVyIG9wdGlvbjpcbiAqIGBgYFxuICogY29uc3QgYXBwUm91dGVzOiBSb3V0ZXMgPSBbXTtcbiAqIGJvb3RzdHJhcEFwcGxpY2F0aW9uKEFwcENvbXBvbmVudCxcbiAqICAge1xuICogICAgIHByb3ZpZGVyczogW1xuICogICAgICAgcHJvdmlkZVJvdXRlcihhcHBSb3V0ZXMsIHdpdGhOYXZpZ2F0aW9uRXJyb3JIYW5kbGVyKChlOiBOYXZpZ2F0aW9uRXJyb3IpID0+XG4gKiBpbmplY3QoTXlFcnJvclRyYWNrZXIpLnRyYWNrRXJyb3IoZSkpKVxuICogICAgIF1cbiAqICAgfVxuICogKTtcbiAqIGBgYFxuICpcbiAqIEBzZWUgYE5hdmlnYXRpb25FcnJvcmBcbiAqIEBzZWUgYGluamVjdGBcbiAqIEBzZWUgYEVudmlyb25tZW50SW5qZWN0b3IjcnVuSW5Db250ZXh0YFxuICpcbiAqIEByZXR1cm5zIEEgc2V0IG9mIHByb3ZpZGVycyBmb3IgdXNlIHdpdGggYHByb3ZpZGVSb3V0ZXJgLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdpdGhOYXZpZ2F0aW9uRXJyb3JIYW5kbGVyKGZuOiAoZXJyb3I6IE5hdmlnYXRpb25FcnJvcikgPT4gdm9pZCk6XG4gICAgTmF2aWdhdGlvbkVycm9ySGFuZGxlckZlYXR1cmUge1xuICBjb25zdCBwcm92aWRlcnMgPSBbe1xuICAgIHByb3ZpZGU6IEVOVklST05NRU5UX0lOSVRJQUxJWkVSLFxuICAgIG11bHRpOiB0cnVlLFxuICAgIHVzZVZhbHVlOiAoKSA9PiB7XG4gICAgICBjb25zdCBpbmplY3RvciA9IGluamVjdChFbnZpcm9ubWVudEluamVjdG9yKTtcbiAgICAgIGluamVjdChSb3V0ZXIpLmV2ZW50cy5zdWJzY3JpYmUoKGUpID0+IHtcbiAgICAgICAgaWYgKGUgaW5zdGFuY2VvZiBOYXZpZ2F0aW9uRXJyb3IpIHtcbiAgICAgICAgICBpbmplY3Rvci5ydW5JbkNvbnRleHQoKCkgPT4gZm4oZSkpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1dO1xuICByZXR1cm4gcm91dGVyRmVhdHVyZShSb3V0ZXJGZWF0dXJlS2luZC5OYXZpZ2F0aW9uRXJyb3JIYW5kbGVyRmVhdHVyZSwgcHJvdmlkZXJzKTtcbn1cblxuLyoqXG4gKiBBIHR5cGUgYWxpYXMgdGhhdCByZXByZXNlbnRzIGFsbCBSb3V0ZXIgZmVhdHVyZXMgYXZhaWxhYmxlIGZvciB1c2Ugd2l0aCBgcHJvdmlkZVJvdXRlcmAuXG4gKiBGZWF0dXJlcyBjYW4gYmUgZW5hYmxlZCBieSBhZGRpbmcgc3BlY2lhbCBmdW5jdGlvbnMgdG8gdGhlIGBwcm92aWRlUm91dGVyYCBjYWxsLlxuICogU2VlIGRvY3VtZW50YXRpb24gZm9yIGVhY2ggc3ltYm9sIHRvIGZpbmQgY29ycmVzcG9uZGluZyBmdW5jdGlvbiBuYW1lLiBTZWUgYWxzbyBgcHJvdmlkZVJvdXRlcmBcbiAqIGRvY3VtZW50YXRpb24gb24gaG93IHRvIHVzZSB0aG9zZSBmdW5jdGlvbnMuXG4gKlxuICogQHNlZSBgcHJvdmlkZVJvdXRlcmBcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCB0eXBlIFJvdXRlckZlYXR1cmVzID0gUHJlbG9hZGluZ0ZlYXR1cmV8RGVidWdUcmFjaW5nRmVhdHVyZXxJbml0aWFsTmF2aWdhdGlvbkZlYXR1cmV8XG4gICAgSW5NZW1vcnlTY3JvbGxpbmdGZWF0dXJlfFJvdXRlckNvbmZpZ3VyYXRpb25GZWF0dXJlfE5hdmlnYXRpb25FcnJvckhhbmRsZXJGZWF0dXJlO1xuXG4vKipcbiAqIFRoZSBsaXN0IG9mIGZlYXR1cmVzIGFzIGFuIGVudW0gdG8gdW5pcXVlbHkgdHlwZSBlYWNoIGZlYXR1cmUuXG4gKi9cbmV4cG9ydCBjb25zdCBlbnVtIFJvdXRlckZlYXR1cmVLaW5kIHtcbiAgUHJlbG9hZGluZ0ZlYXR1cmUsXG4gIERlYnVnVHJhY2luZ0ZlYXR1cmUsXG4gIEVuYWJsZWRCbG9ja2luZ0luaXRpYWxOYXZpZ2F0aW9uRmVhdHVyZSxcbiAgRGlzYWJsZWRJbml0aWFsTmF2aWdhdGlvbkZlYXR1cmUsXG4gIEluTWVtb3J5U2Nyb2xsaW5nRmVhdHVyZSxcbiAgUm91dGVyQ29uZmlndXJhdGlvbkZlYXR1cmUsXG4gIFJvdXRlckhhc2hMb2NhdGlvbkZlYXR1cmUsXG4gIE5hdmlnYXRpb25FcnJvckhhbmRsZXJGZWF0dXJlLFxufVxuIl19