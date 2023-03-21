/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export const IMPERATIVE_NAVIGATION = 'imperative';
/**
 * Base for events the router goes through, as opposed to events tied to a specific
 * route. Fired one time for any given navigation.
 *
 * The following code shows how a class subscribes to router events.
 *
 * ```ts
 * import {Event, RouterEvent, Router} from '@angular/router';
 *
 * class MyService {
 *   constructor(public router: Router) {
 *     router.events.pipe(
 *        filter((e: Event): e is RouterEvent => e instanceof RouterEvent)
 *     ).subscribe((e: RouterEvent) => {
 *       // Do something
 *     });
 *   }
 * }
 * ```
 *
 * @see `Event`
 * @see [Router events summary](guide/router-reference#router-events)
 * @publicApi
 */
export class RouterEvent {
    constructor(
    /** A unique ID that the router assigns to every router navigation. */
    id, 
    /** The URL that is the destination for this navigation. */
    url) {
        this.id = id;
        this.url = url;
    }
}
/**
 * An event triggered when a navigation starts.
 *
 * @publicApi
 */
export class NavigationStart extends RouterEvent {
    constructor(
    /** @docsNotRequired */
    id, 
    /** @docsNotRequired */
    url, 
    /** @docsNotRequired */
    navigationTrigger = 'imperative', 
    /** @docsNotRequired */
    restoredState = null) {
        super(id, url);
        this.type = 0 /* EventType.NavigationStart */;
        this.navigationTrigger = navigationTrigger;
        this.restoredState = restoredState;
    }
    /** @docsNotRequired */
    toString() {
        return `NavigationStart(id: ${this.id}, url: '${this.url}')`;
    }
}
/**
 * An event triggered when a navigation ends successfully.
 *
 * @see `NavigationStart`
 * @see `NavigationCancel`
 * @see `NavigationError`
 *
 * @publicApi
 */
export class NavigationEnd extends RouterEvent {
    constructor(
    /** @docsNotRequired */
    id, 
    /** @docsNotRequired */
    url, 
    /** @docsNotRequired */
    urlAfterRedirects) {
        super(id, url);
        this.urlAfterRedirects = urlAfterRedirects;
        this.type = 1 /* EventType.NavigationEnd */;
    }
    /** @docsNotRequired */
    toString() {
        return `NavigationEnd(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}')`;
    }
}
/**
 * An event triggered when a navigation is canceled, directly or indirectly.
 * This can happen for several reasons including when a route guard
 * returns `false` or initiates a redirect by returning a `UrlTree`.
 *
 * @see `NavigationStart`
 * @see `NavigationEnd`
 * @see `NavigationError`
 *
 * @publicApi
 */
export class NavigationCancel extends RouterEvent {
    constructor(
    /** @docsNotRequired */
    id, 
    /** @docsNotRequired */
    url, 
    /**
     * A description of why the navigation was cancelled. For debug purposes only. Use `code`
     * instead for a stable cancellation reason that can be used in production.
     */
    reason, 
    /**
     * A code to indicate why the navigation was canceled. This cancellation code is stable for
     * the reason and can be relied on whereas the `reason` string could change and should not be
     * used in production.
     */
    code) {
        super(id, url);
        this.reason = reason;
        this.code = code;
        this.type = 2 /* EventType.NavigationCancel */;
    }
    /** @docsNotRequired */
    toString() {
        return `NavigationCancel(id: ${this.id}, url: '${this.url}')`;
    }
}
/**
 * An event triggered when a navigation is skipped.
 * This can happen for a couple reasons including onSameUrlHandling
 * is set to `ignore` and the navigation URL is not different than the
 * current state.
 *
 * @publicApi
 */
export class NavigationSkipped extends RouterEvent {
    constructor(
    /** @docsNotRequired */
    id, 
    /** @docsNotRequired */
    url, 
    /**
     * A description of why the navigation was skipped. For debug purposes only. Use `code`
     * instead for a stable skipped reason that can be used in production.
     */
    reason, 
    /**
     * A code to indicate why the navigation was skipped. This code is stable for
     * the reason and can be relied on whereas the `reason` string could change and should not be
     * used in production.
     */
    code) {
        super(id, url);
        this.reason = reason;
        this.code = code;
        this.type = 16 /* EventType.NavigationSkipped */;
    }
}
/**
 * An event triggered when a navigation fails due to an unexpected error.
 *
 * @see `NavigationStart`
 * @see `NavigationEnd`
 * @see `NavigationCancel`
 *
 * @publicApi
 */
export class NavigationError extends RouterEvent {
    constructor(
    /** @docsNotRequired */
    id, 
    /** @docsNotRequired */
    url, 
    /** @docsNotRequired */
    error, 
    /**
     * The target of the navigation when the error occurred.
     *
     * Note that this can be `undefined` because an error could have occurred before the
     * `RouterStateSnapshot` was created for the navigation.
     */
    target) {
        super(id, url);
        this.error = error;
        this.target = target;
        this.type = 3 /* EventType.NavigationError */;
    }
    /** @docsNotRequired */
    toString() {
        return `NavigationError(id: ${this.id}, url: '${this.url}', error: ${this.error})`;
    }
}
/**
 * An event triggered when routes are recognized.
 *
 * @publicApi
 */
export class RoutesRecognized extends RouterEvent {
    constructor(
    /** @docsNotRequired */
    id, 
    /** @docsNotRequired */
    url, 
    /** @docsNotRequired */
    urlAfterRedirects, 
    /** @docsNotRequired */
    state) {
        super(id, url);
        this.urlAfterRedirects = urlAfterRedirects;
        this.state = state;
        this.type = 4 /* EventType.RoutesRecognized */;
    }
    /** @docsNotRequired */
    toString() {
        return `RoutesRecognized(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}', state: ${this.state})`;
    }
}
/**
 * An event triggered at the start of the Guard phase of routing.
 *
 * @see `GuardsCheckEnd`
 *
 * @publicApi
 */
export class GuardsCheckStart extends RouterEvent {
    constructor(
    /** @docsNotRequired */
    id, 
    /** @docsNotRequired */
    url, 
    /** @docsNotRequired */
    urlAfterRedirects, 
    /** @docsNotRequired */
    state) {
        super(id, url);
        this.urlAfterRedirects = urlAfterRedirects;
        this.state = state;
        this.type = 7 /* EventType.GuardsCheckStart */;
    }
    toString() {
        return `GuardsCheckStart(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}', state: ${this.state})`;
    }
}
/**
 * An event triggered at the end of the Guard phase of routing.
 *
 * @see `GuardsCheckStart`
 *
 * @publicApi
 */
export class GuardsCheckEnd extends RouterEvent {
    constructor(
    /** @docsNotRequired */
    id, 
    /** @docsNotRequired */
    url, 
    /** @docsNotRequired */
    urlAfterRedirects, 
    /** @docsNotRequired */
    state, 
    /** @docsNotRequired */
    shouldActivate) {
        super(id, url);
        this.urlAfterRedirects = urlAfterRedirects;
        this.state = state;
        this.shouldActivate = shouldActivate;
        this.type = 8 /* EventType.GuardsCheckEnd */;
    }
    toString() {
        return `GuardsCheckEnd(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}', state: ${this.state}, shouldActivate: ${this.shouldActivate})`;
    }
}
/**
 * An event triggered at the start of the Resolve phase of routing.
 *
 * Runs in the "resolve" phase whether or not there is anything to resolve.
 * In future, may change to only run when there are things to be resolved.
 *
 * @see `ResolveEnd`
 *
 * @publicApi
 */
export class ResolveStart extends RouterEvent {
    constructor(
    /** @docsNotRequired */
    id, 
    /** @docsNotRequired */
    url, 
    /** @docsNotRequired */
    urlAfterRedirects, 
    /** @docsNotRequired */
    state) {
        super(id, url);
        this.urlAfterRedirects = urlAfterRedirects;
        this.state = state;
        this.type = 5 /* EventType.ResolveStart */;
    }
    toString() {
        return `ResolveStart(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}', state: ${this.state})`;
    }
}
/**
 * An event triggered at the end of the Resolve phase of routing.
 * @see `ResolveStart`.
 *
 * @publicApi
 */
export class ResolveEnd extends RouterEvent {
    constructor(
    /** @docsNotRequired */
    id, 
    /** @docsNotRequired */
    url, 
    /** @docsNotRequired */
    urlAfterRedirects, 
    /** @docsNotRequired */
    state) {
        super(id, url);
        this.urlAfterRedirects = urlAfterRedirects;
        this.state = state;
        this.type = 6 /* EventType.ResolveEnd */;
    }
    toString() {
        return `ResolveEnd(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}', state: ${this.state})`;
    }
}
/**
 * An event triggered before lazy loading a route configuration.
 *
 * @see `RouteConfigLoadEnd`
 *
 * @publicApi
 */
export class RouteConfigLoadStart {
    constructor(
    /** @docsNotRequired */
    route) {
        this.route = route;
        this.type = 9 /* EventType.RouteConfigLoadStart */;
    }
    toString() {
        return `RouteConfigLoadStart(path: ${this.route.path})`;
    }
}
/**
 * An event triggered when a route has been lazy loaded.
 *
 * @see `RouteConfigLoadStart`
 *
 * @publicApi
 */
export class RouteConfigLoadEnd {
    constructor(
    /** @docsNotRequired */
    route) {
        this.route = route;
        this.type = 10 /* EventType.RouteConfigLoadEnd */;
    }
    toString() {
        return `RouteConfigLoadEnd(path: ${this.route.path})`;
    }
}
/**
 * An event triggered at the start of the child-activation
 * part of the Resolve phase of routing.
 * @see  `ChildActivationEnd`
 * @see `ResolveStart`
 *
 * @publicApi
 */
export class ChildActivationStart {
    constructor(
    /** @docsNotRequired */
    snapshot) {
        this.snapshot = snapshot;
        this.type = 11 /* EventType.ChildActivationStart */;
    }
    toString() {
        const path = this.snapshot.routeConfig && this.snapshot.routeConfig.path || '';
        return `ChildActivationStart(path: '${path}')`;
    }
}
/**
 * An event triggered at the end of the child-activation part
 * of the Resolve phase of routing.
 * @see `ChildActivationStart`
 * @see `ResolveStart`
 * @publicApi
 */
export class ChildActivationEnd {
    constructor(
    /** @docsNotRequired */
    snapshot) {
        this.snapshot = snapshot;
        this.type = 12 /* EventType.ChildActivationEnd */;
    }
    toString() {
        const path = this.snapshot.routeConfig && this.snapshot.routeConfig.path || '';
        return `ChildActivationEnd(path: '${path}')`;
    }
}
/**
 * An event triggered at the start of the activation part
 * of the Resolve phase of routing.
 * @see `ActivationEnd`
 * @see `ResolveStart`
 *
 * @publicApi
 */
export class ActivationStart {
    constructor(
    /** @docsNotRequired */
    snapshot) {
        this.snapshot = snapshot;
        this.type = 13 /* EventType.ActivationStart */;
    }
    toString() {
        const path = this.snapshot.routeConfig && this.snapshot.routeConfig.path || '';
        return `ActivationStart(path: '${path}')`;
    }
}
/**
 * An event triggered at the end of the activation part
 * of the Resolve phase of routing.
 * @see `ActivationStart`
 * @see `ResolveStart`
 *
 * @publicApi
 */
export class ActivationEnd {
    constructor(
    /** @docsNotRequired */
    snapshot) {
        this.snapshot = snapshot;
        this.type = 14 /* EventType.ActivationEnd */;
    }
    toString() {
        const path = this.snapshot.routeConfig && this.snapshot.routeConfig.path || '';
        return `ActivationEnd(path: '${path}')`;
    }
}
/**
 * An event triggered by scrolling.
 *
 * @publicApi
 */
export class Scroll {
    constructor(
    /** @docsNotRequired */
    routerEvent, 
    /** @docsNotRequired */
    position, 
    /** @docsNotRequired */
    anchor) {
        this.routerEvent = routerEvent;
        this.position = position;
        this.anchor = anchor;
        this.type = 15 /* EventType.Scroll */;
    }
    toString() {
        const pos = this.position ? `${this.position[0]}, ${this.position[1]}` : null;
        return `Scroll(anchor: '${this.anchor}', position: '${pos}')`;
    }
}
export function stringifyEvent(routerEvent) {
    if (!('type' in routerEvent)) {
        return `Unknown Router Event: ${routerEvent.constructor.name}`;
    }
    switch (routerEvent.type) {
        case 14 /* EventType.ActivationEnd */:
            return `ActivationEnd(path: '${routerEvent.snapshot.routeConfig?.path || ''}')`;
        case 13 /* EventType.ActivationStart */:
            return `ActivationStart(path: '${routerEvent.snapshot.routeConfig?.path || ''}')`;
        case 12 /* EventType.ChildActivationEnd */:
            return `ChildActivationEnd(path: '${routerEvent.snapshot.routeConfig?.path || ''}')`;
        case 11 /* EventType.ChildActivationStart */:
            return `ChildActivationStart(path: '${routerEvent.snapshot.routeConfig?.path || ''}')`;
        case 8 /* EventType.GuardsCheckEnd */:
            return `GuardsCheckEnd(id: ${routerEvent.id}, url: '${routerEvent.url}', urlAfterRedirects: '${routerEvent.urlAfterRedirects}', state: ${routerEvent.state}, shouldActivate: ${routerEvent.shouldActivate})`;
        case 7 /* EventType.GuardsCheckStart */:
            return `GuardsCheckStart(id: ${routerEvent.id}, url: '${routerEvent.url}', urlAfterRedirects: '${routerEvent.urlAfterRedirects}', state: ${routerEvent.state})`;
        case 2 /* EventType.NavigationCancel */:
            return `NavigationCancel(id: ${routerEvent.id}, url: '${routerEvent.url}')`;
        case 16 /* EventType.NavigationSkipped */:
            return `NavigationSkipped(id: ${routerEvent.id}, url: '${routerEvent.url}')`;
        case 1 /* EventType.NavigationEnd */:
            return `NavigationEnd(id: ${routerEvent.id}, url: '${routerEvent.url}', urlAfterRedirects: '${routerEvent.urlAfterRedirects}')`;
        case 3 /* EventType.NavigationError */:
            return `NavigationError(id: ${routerEvent.id}, url: '${routerEvent.url}', error: ${routerEvent.error})`;
        case 0 /* EventType.NavigationStart */:
            return `NavigationStart(id: ${routerEvent.id}, url: '${routerEvent.url}')`;
        case 6 /* EventType.ResolveEnd */:
            return `ResolveEnd(id: ${routerEvent.id}, url: '${routerEvent.url}', urlAfterRedirects: '${routerEvent.urlAfterRedirects}', state: ${routerEvent.state})`;
        case 5 /* EventType.ResolveStart */:
            return `ResolveStart(id: ${routerEvent.id}, url: '${routerEvent.url}', urlAfterRedirects: '${routerEvent.urlAfterRedirects}', state: ${routerEvent.state})`;
        case 10 /* EventType.RouteConfigLoadEnd */:
            return `RouteConfigLoadEnd(path: ${routerEvent.route.path})`;
        case 9 /* EventType.RouteConfigLoadStart */:
            return `RouteConfigLoadStart(path: ${routerEvent.route.path})`;
        case 4 /* EventType.RoutesRecognized */:
            return `RoutesRecognized(id: ${routerEvent.id}, url: '${routerEvent.url}', urlAfterRedirects: '${routerEvent.urlAfterRedirects}', state: ${routerEvent.state})`;
        case 15 /* EventType.Scroll */:
            const pos = routerEvent.position ? `${routerEvent.position[0]}, ${routerEvent.position[1]}` : null;
            return `Scroll(anchor: '${routerEvent.anchor}', position: '${pos}')`;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvcm91dGVyL3NyYy9ldmVudHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBZUgsTUFBTSxDQUFDLE1BQU0scUJBQXFCLEdBQUcsWUFBWSxDQUFDO0FBMkJsRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F1Qkc7QUFDSCxNQUFNLE9BQU8sV0FBVztJQUN0QjtJQUNJLHNFQUFzRTtJQUMvRCxFQUFVO0lBQ2pCLDJEQUEyRDtJQUNwRCxHQUFXO1FBRlgsT0FBRSxHQUFGLEVBQUUsQ0FBUTtRQUVWLFFBQUcsR0FBSCxHQUFHLENBQVE7SUFBRyxDQUFDO0NBQzNCO0FBRUQ7Ozs7R0FJRztBQUNILE1BQU0sT0FBTyxlQUFnQixTQUFRLFdBQVc7SUFnQzlDO0lBQ0ksdUJBQXVCO0lBQ3ZCLEVBQVU7SUFDVix1QkFBdUI7SUFDdkIsR0FBVztJQUNYLHVCQUF1QjtJQUN2QixvQkFBdUMsWUFBWTtJQUNuRCx1QkFBdUI7SUFDdkIsZ0JBQStELElBQUk7UUFDckUsS0FBSyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztRQXhDUixTQUFJLHFDQUE2QjtRQXlDeEMsSUFBSSxDQUFDLGlCQUFpQixHQUFHLGlCQUFpQixDQUFDO1FBQzNDLElBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO0lBQ3JDLENBQUM7SUFFRCx1QkFBdUI7SUFDZCxRQUFRO1FBQ2YsT0FBTyx1QkFBdUIsSUFBSSxDQUFDLEVBQUUsV0FBVyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUM7SUFDL0QsQ0FBQztDQUNGO0FBRUQ7Ozs7Ozs7O0dBUUc7QUFDSCxNQUFNLE9BQU8sYUFBYyxTQUFRLFdBQVc7SUFHNUM7SUFDSSx1QkFBdUI7SUFDdkIsRUFBVTtJQUNWLHVCQUF1QjtJQUN2QixHQUFXO0lBQ1gsdUJBQXVCO0lBQ2hCLGlCQUF5QjtRQUNsQyxL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bGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1JvdXRlfSBmcm9tICcuL21vZGVscyc7XG5pbXBvcnQge0FjdGl2YXRlZFJvdXRlU25hcHNob3QsIFJvdXRlclN0YXRlU25hcHNob3R9IGZyb20gJy4vcm91dGVyX3N0YXRlJztcblxuLyoqXG4gKiBJZGVudGlmaWVzIHRoZSBjYWxsIG9yIGV2ZW50IHRoYXQgdHJpZ2dlcmVkIGEgbmF2aWdhdGlvbi5cbiAqXG4gKiAqICdpbXBlcmF0aXZlJzogVHJpZ2dlcmVkIGJ5IGByb3V0ZXIubmF2aWdhdGVCeVVybCgpYCBvciBgcm91dGVyLm5hdmlnYXRlKClgLlxuICogKiAncG9wc3RhdGUnIDogVHJpZ2dlcmVkIGJ5IGEgYHBvcHN0YXRlYCBldmVudC5cbiAqICogJ2hhc2hjaGFuZ2UnLTogVHJpZ2dlcmVkIGJ5IGEgYGhhc2hjaGFuZ2VgIGV2ZW50LlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IHR5cGUgTmF2aWdhdGlvblRyaWdnZXIgPSAnaW1wZXJhdGl2ZSd8J3BvcHN0YXRlJ3wnaGFzaGNoYW5nZSc7XG5leHBvcnQgY29uc3QgSU1QRVJBVElWRV9OQVZJR0FUSU9OID0gJ2ltcGVyYXRpdmUnO1xuXG4vKipcbiAqIElkZW50aWZpZXMgdGhlIHR5cGUgb2YgYSByb3V0ZXIgZXZlbnQuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY29uc3QgZW51bSBFdmVudFR5cGUge1xuICBOYXZpZ2F0aW9uU3RhcnQsXG4gIE5hdmlnYXRpb25FbmQsXG4gIE5hdmlnYXRpb25DYW5jZWwsXG4gIE5hdmlnYXRpb25FcnJvcixcbiAgUm91dGVzUmVjb2duaXplZCxcbiAgUmVzb2x2ZVN0YXJ0LFxuICBSZXNvbHZlRW5kLFxuICBHdWFyZHNDaGVja1N0YXJ0LFxuICBHdWFyZHNDaGVja0VuZCxcbiAgUm91dGVDb25maWdMb2FkU3RhcnQsXG4gIFJvdXRlQ29uZmlnTG9hZEVuZCxcbiAgQ2hpbGRBY3RpdmF0aW9uU3RhcnQsXG4gIENoaWxkQWN0aXZhdGlvbkVuZCxcbiAgQWN0aXZhdGlvblN0YXJ0LFxuICBBY3RpdmF0aW9uRW5kLFxuICBTY3JvbGwsXG4gIE5hdmlnYXRpb25Ta2lwcGVkLFxufVxuXG4vKipcbiAqIEJhc2UgZm9yIGV2ZW50cyB0aGUgcm91dGVyIGdvZXMgdGhyb3VnaCwgYXMgb3Bwb3NlZCB0byBldmVudHMgdGllZCB0byBhIHNwZWNpZmljXG4gKiByb3V0ZS4gRmlyZWQgb25lIHRpbWUgZm9yIGFueSBnaXZlbiBuYXZpZ2F0aW9uLlxuICpcbiAqIFRoZSBmb2xsb3dpbmcgY29kZSBzaG93cyBob3cgYSBjbGFzcyBzdWJzY3JpYmVzIHRvIHJvdXRlciBldmVudHMuXG4gKlxuICogYGBgdHNcbiAqIGltcG9ydCB7RXZlbnQsIFJvdXRlckV2ZW50LCBSb3V0ZXJ9IGZyb20gJ0Bhbmd1bGFyL3JvdXRlcic7XG4gKlxuICogY2xhc3MgTXlTZXJ2aWNlIHtcbiAqICAgY29uc3RydWN0b3IocHVibGljIHJvdXRlcjogUm91dGVyKSB7XG4gKiAgICAgcm91dGVyLmV2ZW50cy5waXBlKFxuICogICAgICAgIGZpbHRlcigoZTogRXZlbnQpOiBlIGlzIFJvdXRlckV2ZW50ID0+IGUgaW5zdGFuY2VvZiBSb3V0ZXJFdmVudClcbiAqICAgICApLnN1YnNjcmliZSgoZTogUm91dGVyRXZlbnQpID0+IHtcbiAqICAgICAgIC8vIERvIHNvbWV0aGluZ1xuICogICAgIH0pO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBAc2VlIGBFdmVudGBcbiAqIEBzZWUgW1JvdXRlciBldmVudHMgc3VtbWFyeV0oZ3VpZGUvcm91dGVyLXJlZmVyZW5jZSNyb3V0ZXItZXZlbnRzKVxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgUm91dGVyRXZlbnQge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIC8qKiBBIHVuaXF1ZSBJRCB0aGF0IHRoZSByb3V0ZXIgYXNzaWducyB0byBldmVyeSByb3V0ZXIgbmF2aWdhdGlvbi4gKi9cbiAgICAgIHB1YmxpYyBpZDogbnVtYmVyLFxuICAgICAgLyoqIFRoZSBVUkwgdGhhdCBpcyB0aGUgZGVzdGluYXRpb24gZm9yIHRoaXMgbmF2aWdhdGlvbi4gKi9cbiAgICAgIHB1YmxpYyB1cmw6IHN0cmluZykge31cbn1cblxuLyoqXG4gKiBBbiBldmVudCB0cmlnZ2VyZWQgd2hlbiBhIG5hdmlnYXRpb24gc3RhcnRzLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIE5hdmlnYXRpb25TdGFydCBleHRlbmRzIFJvdXRlckV2ZW50IHtcbiAgcmVhZG9ubHkgdHlwZSA9IEV2ZW50VHlwZS5OYXZpZ2F0aW9uU3RhcnQ7XG5cbiAgLyoqXG4gICAqIElkZW50aWZpZXMgdGhlIGNhbGwgb3IgZXZlbnQgdGhhdCB0cmlnZ2VyZWQgdGhlIG5hdmlnYXRpb24uXG4gICAqIEFuIGBpbXBlcmF0aXZlYCB0cmlnZ2VyIGlzIGEgY2FsbCB0byBgcm91dGVyLm5hdmlnYXRlQnlVcmwoKWAgb3IgYHJvdXRlci5uYXZpZ2F0ZSgpYC5cbiAgICpcbiAgICogQHNlZSBgTmF2aWdhdGlvbkVuZGBcbiAgICogQHNlZSBgTmF2aWdhdGlvbkNhbmNlbGBcbiAgICogQHNlZSBgTmF2aWdhdGlvbkVycm9yYFxuICAgKi9cbiAgbmF2aWdhdGlvblRyaWdnZXI/OiBOYXZpZ2F0aW9uVHJpZ2dlcjtcblxuICAvKipcbiAgICogVGhlIG5hdmlnYXRpb24gc3RhdGUgdGhhdCB3YXMgcHJldmlvdXNseSBzdXBwbGllZCB0byB0aGUgYHB1c2hTdGF0ZWAgY2FsbCxcbiAgICogd2hlbiB0aGUgbmF2aWdhdGlvbiBpcyB0cmlnZ2VyZWQgYnkgYSBgcG9wc3RhdGVgIGV2ZW50LiBPdGhlcndpc2UgbnVsbC5cbiAgICpcbiAgICogVGhlIHN0YXRlIG9iamVjdCBpcyBkZWZpbmVkIGJ5IGBOYXZpZ2F0aW9uRXh0cmFzYCwgYW5kIGNvbnRhaW5zIGFueVxuICAgKiBkZXZlbG9wZXItZGVmaW5lZCBzdGF0ZSB2YWx1ZSwgYXMgd2VsbCBhcyBhIHVuaXF1ZSBJRCB0aGF0XG4gICAqIHRoZSByb3V0ZXIgYXNzaWducyB0byBldmVyeSByb3V0ZXIgdHJhbnNpdGlvbi9uYXZpZ2F0aW9uLlxuICAgKlxuICAgKiBGcm9tIHRoZSBwZXJzcGVjdGl2ZSBvZiB0aGUgcm91dGVyLCB0aGUgcm91dGVyIG5ldmVyIFwiZ29lcyBiYWNrXCIuXG4gICAqIFdoZW4gdGhlIHVzZXIgY2xpY2tzIG9uIHRoZSBiYWNrIGJ1dHRvbiBpbiB0aGUgYnJvd3NlcixcbiAgICogYSBuZXcgbmF2aWdhdGlvbiBJRCBpcyBjcmVhdGVkLlxuICAgKlxuICAgKiBVc2UgdGhlIElEIGluIHRoaXMgcHJldmlvdXMtc3RhdGUgb2JqZWN0IHRvIGRpZmZlcmVudGlhdGUgYmV0d2VlbiBhIG5ld2x5IGNyZWF0ZWRcbiAgICogc3RhdGUgYW5kIG9uZSByZXR1cm5lZCB0byBieSBhIGBwb3BzdGF0ZWAgZXZlbnQsIHNvIHRoYXQgeW91IGNhbiByZXN0b3JlIHNvbWVcbiAgICogcmVtZW1iZXJlZCBzdGF0ZSwgc3VjaCBhcyBzY3JvbGwgcG9zaXRpb24uXG4gICAqXG4gICAqL1xuICByZXN0b3JlZFN0YXRlPzoge1trOiBzdHJpbmddOiBhbnksIG5hdmlnYXRpb25JZDogbnVtYmVyfXxudWxsO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICAgIGlkOiBudW1iZXIsXG4gICAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgICAgdXJsOiBzdHJpbmcsXG4gICAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgICAgbmF2aWdhdGlvblRyaWdnZXI6IE5hdmlnYXRpb25UcmlnZ2VyID0gJ2ltcGVyYXRpdmUnLFxuICAgICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICAgIHJlc3RvcmVkU3RhdGU6IHtbazogc3RyaW5nXTogYW55LCBuYXZpZ2F0aW9uSWQ6IG51bWJlcn18bnVsbCA9IG51bGwpIHtcbiAgICBzdXBlcihpZCwgdXJsKTtcbiAgICB0aGlzLm5hdmlnYXRpb25UcmlnZ2VyID0gbmF2aWdhdGlvblRyaWdnZXI7XG4gICAgdGhpcy5yZXN0b3JlZFN0YXRlID0gcmVzdG9yZWRTdGF0ZTtcbiAgfVxuXG4gIC8qKiBAZG9jc05vdFJlcXVpcmVkICovXG4gIG92ZXJyaWRlIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBOYXZpZ2F0aW9uU3RhcnQoaWQ6ICR7dGhpcy5pZH0sIHVybDogJyR7dGhpcy51cmx9JylgO1xuICB9XG59XG5cbi8qKlxuICogQW4gZXZlbnQgdHJpZ2dlcmVkIHdoZW4gYSBuYXZpZ2F0aW9uIGVuZHMgc3VjY2Vzc2Z1bGx5LlxuICpcbiAqIEBzZWUgYE5hdmlnYXRpb25TdGFydGBcbiAqIEBzZWUgYE5hdmlnYXRpb25DYW5jZWxgXG4gKiBAc2VlIGBOYXZpZ2F0aW9uRXJyb3JgXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgTmF2aWdhdGlvbkVuZCBleHRlbmRzIFJvdXRlckV2ZW50IHtcbiAgcmVhZG9ubHkgdHlwZSA9IEV2ZW50VHlwZS5OYXZpZ2F0aW9uRW5kO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICAgIGlkOiBudW1iZXIsXG4gICAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgICAgdXJsOiBzdHJpbmcsXG4gICAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgICAgcHVibGljIHVybEFmdGVyUmVkaXJlY3RzOiBzdHJpbmcpIHtcbiAgICBzdXBlcihpZCwgdXJsKTtcbiAgfVxuXG4gIC8qKiBAZG9jc05vdFJlcXVpcmVkICovXG4gIG92ZXJyaWRlIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBOYXZpZ2F0aW9uRW5kKGlkOiAke3RoaXMuaWR9LCB1cmw6ICcke3RoaXMudXJsfScsIHVybEFmdGVyUmVkaXJlY3RzOiAnJHtcbiAgICAgICAgdGhpcy51cmxBZnRlclJlZGlyZWN0c30nKWA7XG4gIH1cbn1cblxuLyoqXG4gKiBBIGNvZGUgZm9yIHRoZSBgTmF2aWdhdGlvbkNhbmNlbGAgZXZlbnQgb2YgdGhlIGBSb3V0ZXJgIHRvIGluZGljYXRlIHRoZVxuICogcmVhc29uIGEgbmF2aWdhdGlvbiBmYWlsZWQuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY29uc3QgZW51bSBOYXZpZ2F0aW9uQ2FuY2VsbGF0aW9uQ29kZSB7XG4gIC8qKlxuICAgKiBBIG5hdmlnYXRpb24gZmFpbGVkIGJlY2F1c2UgYSBndWFyZCByZXR1cm5lZCBhIGBVcmxUcmVlYCB0byByZWRpcmVjdC5cbiAgICovXG4gIFJlZGlyZWN0LFxuICAvKipcbiAgICogQSBuYXZpZ2F0aW9uIGZhaWxlZCBiZWNhdXNlIGEgbW9yZSByZWNlbnQgbmF2aWdhdGlvbiBzdGFydGVkLlxuICAgKi9cbiAgU3VwZXJzZWRlZEJ5TmV3TmF2aWdhdGlvbixcbiAgLyoqXG4gICAqIEEgbmF2aWdhdGlvbiBmYWlsZWQgYmVjYXVzZSBvbmUgb2YgdGhlIHJlc29sdmVycyBjb21wbGV0ZWQgd2l0aG91dCBlbWl0aW5nIGEgdmFsdWUuXG4gICAqL1xuICBOb0RhdGFGcm9tUmVzb2x2ZXIsXG4gIC8qKlxuICAgKiBBIG5hdmlnYXRpb24gZmFpbGVkIGJlY2F1c2UgYSBndWFyZCByZXR1cm5lZCBgZmFsc2VgLlxuICAgKi9cbiAgR3VhcmRSZWplY3RlZCxcbn1cblxuLyoqXG4gKiBBIGNvZGUgZm9yIHRoZSBgTmF2aWdhdGlvblNraXBwZWRgIGV2ZW50IG9mIHRoZSBgUm91dGVyYCB0byBpbmRpY2F0ZSB0aGVcbiAqIHJlYXNvbiBhIG5hdmlnYXRpb24gd2FzIHNraXBwZWQuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY29uc3QgZW51bSBOYXZpZ2F0aW9uU2tpcHBlZENvZGUge1xuICAvKipcbiAgICogQSBuYXZpZ2F0aW9uIHdhcyBza2lwcGVkIGJlY2F1c2UgdGhlIG5hdmlnYXRpb24gVVJMIHdhcyB0aGUgc2FtZSBhcyB0aGUgY3VycmVudCBSb3V0ZXIgVVJMLlxuICAgKi9cbiAgSWdub3JlZFNhbWVVcmxOYXZpZ2F0aW9uLFxuICAvKipcbiAgICogQSBuYXZpZ2F0aW9uIHdhcyBza2lwcGVkIGJlY2F1c2UgdGhlIGNvbmZpZ3VyZWQgYFVybEhhbmRsaW5nU3RyYXRlZ3lgIHJldHVybiBgZmFsc2VgIGZvciBib3RoXG4gICAqIHRoZSBjdXJyZW50IFJvdXRlciBVUkwgYW5kIHRoZSB0YXJnZXQgb2YgdGhlIG5hdmlnYXRpb24uXG4gICAqXG4gICAqIEBzZWUgVXJsSGFuZGxpbmdTdHJhdGVneVxuICAgKi9cbiAgSWdub3JlZEJ5VXJsSGFuZGxpbmdTdHJhdGVneSxcbn1cblxuLyoqXG4gKiBBbiBldmVudCB0cmlnZ2VyZWQgd2hlbiBhIG5hdmlnYXRpb24gaXMgY2FuY2VsZWQsIGRpcmVjdGx5IG9yIGluZGlyZWN0bHkuXG4gKiBUaGlzIGNhbiBoYXBwZW4gZm9yIHNldmVyYWwgcmVhc29ucyBpbmNsdWRpbmcgd2hlbiBhIHJvdXRlIGd1YXJkXG4gKiByZXR1cm5zIGBmYWxzZWAgb3IgaW5pdGlhdGVzIGEgcmVkaXJlY3QgYnkgcmV0dXJuaW5nIGEgYFVybFRyZWVgLlxuICpcbiAqIEBzZWUgYE5hdmlnYXRpb25TdGFydGBcbiAqIEBzZWUgYE5hdmlnYXRpb25FbmRgXG4gKiBAc2VlIGBOYXZpZ2F0aW9uRXJyb3JgXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgTmF2aWdhdGlvbkNhbmNlbCBleHRlbmRzIFJvdXRlckV2ZW50IHtcbiAgcmVhZG9ubHkgdHlwZSA9IEV2ZW50VHlwZS5OYXZpZ2F0aW9uQ2FuY2VsO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICAgIGlkOiBudW1iZXIsXG4gICAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgICAgdXJsOiBzdHJpbmcsXG4gICAgICAvKipcbiAgICAgICAqIEEgZGVzY3JpcHRpb24gb2Ygd2h5IHRoZSBuYXZpZ2F0aW9uIHdhcyBjYW5jZWxsZWQuIEZvciBkZWJ1ZyBwdXJwb3NlcyBvbmx5LiBVc2UgYGNvZGVgXG4gICAgICAgKiBpbnN0ZWFkIGZvciBhIHN0YWJsZSBjYW5jZWxsYXRpb24gcmVhc29uIHRoYXQgY2FuIGJlIHVzZWQgaW4gcHJvZHVjdGlvbi5cbiAgICAgICAqL1xuICAgICAgcHVibGljIHJlYXNvbjogc3RyaW5nLFxuICAgICAgLyoqXG4gICAgICAgKiBBIGNvZGUgdG8gaW5kaWNhdGUgd2h5IHRoZSBuYXZpZ2F0aW9uIHdhcyBjYW5jZWxlZC4gVGhpcyBjYW5jZWxsYXRpb24gY29kZSBpcyBzdGFibGUgZm9yXG4gICAgICAgKiB0aGUgcmVhc29uIGFuZCBjYW4gYmUgcmVsaWVkIG9uIHdoZXJlYXMgdGhlIGByZWFzb25gIHN0cmluZyBjb3VsZCBjaGFuZ2UgYW5kIHNob3VsZCBub3QgYmVcbiAgICAgICAqIHVzZWQgaW4gcHJvZHVjdGlvbi5cbiAgICAgICAqL1xuICAgICAgcmVhZG9ubHkgY29kZT86IE5hdmlnYXRpb25DYW5jZWxsYXRpb25Db2RlKSB7XG4gICAgc3VwZXIoaWQsIHVybCk7XG4gIH1cblxuICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICBvdmVycmlkZSB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiBgTmF2aWdhdGlvbkNhbmNlbChpZDogJHt0aGlzLmlkfSwgdXJsOiAnJHt0aGlzLnVybH0nKWA7XG4gIH1cbn1cblxuLyoqXG4gKiBBbiBldmVudCB0cmlnZ2VyZWQgd2hlbiBhIG5hdmlnYXRpb24gaXMgc2tpcHBlZC5cbiAqIFRoaXMgY2FuIGhhcHBlbiBmb3IgYSBjb3VwbGUgcmVhc29ucyBpbmNsdWRpbmcgb25TYW1lVXJsSGFuZGxpbmdcbiAqIGlzIHNldCB0byBgaWdub3JlYCBhbmQgdGhlIG5hdmlnYXRpb24gVVJMIGlzIG5vdCBkaWZmZXJlbnQgdGhhbiB0aGVcbiAqIGN1cnJlbnQgc3RhdGUuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgTmF2aWdhdGlvblNraXBwZWQgZXh0ZW5kcyBSb3V0ZXJFdmVudCB7XG4gIHJlYWRvbmx5IHR5cGUgPSBFdmVudFR5cGUuTmF2aWdhdGlvblNraXBwZWQ7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgICAgaWQ6IG51bWJlcixcbiAgICAgIC8qKiBAZG9jc05vdFJlcXVpcmVkICovXG4gICAgICB1cmw6IHN0cmluZyxcbiAgICAgIC8qKlxuICAgICAgICogQSBkZXNjcmlwdGlvbiBvZiB3aHkgdGhlIG5hdmlnYXRpb24gd2FzIHNraXBwZWQuIEZvciBkZWJ1ZyBwdXJwb3NlcyBvbmx5LiBVc2UgYGNvZGVgXG4gICAgICAgKiBpbnN0ZWFkIGZvciBhIHN0YWJsZSBza2lwcGVkIHJlYXNvbiB0aGF0IGNhbiBiZSB1c2VkIGluIHByb2R1Y3Rpb24uXG4gICAgICAgKi9cbiAgICAgIHB1YmxpYyByZWFzb246IHN0cmluZyxcbiAgICAgIC8qKlxuICAgICAgICogQSBjb2RlIHRvIGluZGljYXRlIHdoeSB0aGUgbmF2aWdhdGlvbiB3YXMgc2tpcHBlZC4gVGhpcyBjb2RlIGlzIHN0YWJsZSBmb3JcbiAgICAgICAqIHRoZSByZWFzb24gYW5kIGNhbiBiZSByZWxpZWQgb24gd2hlcmVhcyB0aGUgYHJlYXNvbmAgc3RyaW5nIGNvdWxkIGNoYW5nZSBhbmQgc2hvdWxkIG5vdCBiZVxuICAgICAgICogdXNlZCBpbiBwcm9kdWN0aW9uLlxuICAgICAgICovXG4gICAgICByZWFkb25seSBjb2RlPzogTmF2aWdhdGlvblNraXBwZWRDb2RlKSB7XG4gICAgc3VwZXIoaWQsIHVybCk7XG4gIH1cbn1cblxuLyoqXG4gKiBBbiBldmVudCB0cmlnZ2VyZWQgd2hlbiBhIG5hdmlnYXRpb24gZmFpbHMgZHVlIHRvIGFuIHVuZXhwZWN0ZWQgZXJyb3IuXG4gKlxuICogQHNlZSBgTmF2aWdhdGlvblN0YXJ0YFxuICogQHNlZSBgTmF2aWdhdGlvbkVuZGBcbiAqIEBzZWUgYE5hdmlnYXRpb25DYW5jZWxgXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgTmF2aWdhdGlvbkVycm9yIGV4dGVuZHMgUm91dGVyRXZlbnQge1xuICByZWFkb25seSB0eXBlID0gRXZlbnRUeXBlLk5hdmlnYXRpb25FcnJvcjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIC8qKiBAZG9jc05vdFJlcXVpcmVkICovXG4gICAgICBpZDogbnVtYmVyLFxuICAgICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICAgIHVybDogc3RyaW5nLFxuICAgICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICAgIHB1YmxpYyBlcnJvcjogYW55LFxuICAgICAgLyoqXG4gICAgICAgKiBUaGUgdGFyZ2V0IG9mIHRoZSBuYXZpZ2F0aW9uIHdoZW4gdGhlIGVycm9yIG9jY3VycmVkLlxuICAgICAgICpcbiAgICAgICAqIE5vdGUgdGhhdCB0aGlzIGNhbiBiZSBgdW5kZWZpbmVkYCBiZWNhdXNlIGFuIGVycm9yIGNvdWxkIGhhdmUgb2NjdXJyZWQgYmVmb3JlIHRoZVxuICAgICAgICogYFJvdXRlclN0YXRlU25hcHNob3RgIHdhcyBjcmVhdGVkIGZvciB0aGUgbmF2aWdhdGlvbi5cbiAgICAgICAqL1xuICAgICAgcmVhZG9ubHkgdGFyZ2V0PzogUm91dGVyU3RhdGVTbmFwc2hvdCkge1xuICAgIHN1cGVyKGlkLCB1cmwpO1xuICB9XG5cbiAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgb3ZlcnJpZGUgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYE5hdmlnYXRpb25FcnJvcihpZDogJHt0aGlzLmlkfSwgdXJsOiAnJHt0aGlzLnVybH0nLCBlcnJvcjogJHt0aGlzLmVycm9yfSlgO1xuICB9XG59XG5cbi8qKlxuICogQW4gZXZlbnQgdHJpZ2dlcmVkIHdoZW4gcm91dGVzIGFyZSByZWNvZ25pemVkLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIFJvdXRlc1JlY29nbml6ZWQgZXh0ZW5kcyBSb3V0ZXJFdmVudCB7XG4gIHJlYWRvbmx5IHR5cGUgPSBFdmVudFR5cGUuUm91dGVzUmVjb2duaXplZDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIC8qKiBAZG9jc05vdFJlcXVpcmVkICovXG4gICAgICBpZDogbnVtYmVyLFxuICAgICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICAgIHVybDogc3RyaW5nLFxuICAgICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICAgIHB1YmxpYyB1cmxBZnRlclJlZGlyZWN0czogc3RyaW5nLFxuICAgICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICAgIHB1YmxpYyBzdGF0ZTogUm91dGVyU3RhdGVTbmFwc2hvdCkge1xuICAgIHN1cGVyKGlkLCB1cmwpO1xuICB9XG5cbiAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgb3ZlcnJpZGUgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYFJvdXRlc1JlY29nbml6ZWQoaWQ6ICR7dGhpcy5pZH0sIHVybDogJyR7dGhpcy51cmx9JywgdXJsQWZ0ZXJSZWRpcmVjdHM6ICcke1xuICAgICAgICB0aGlzLnVybEFmdGVyUmVkaXJlY3RzfScsIHN0YXRlOiAke3RoaXMuc3RhdGV9KWA7XG4gIH1cbn1cblxuLyoqXG4gKiBBbiBldmVudCB0cmlnZ2VyZWQgYXQgdGhlIHN0YXJ0IG9mIHRoZSBHdWFyZCBwaGFzZSBvZiByb3V0aW5nLlxuICpcbiAqIEBzZWUgYEd1YXJkc0NoZWNrRW5kYFxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIEd1YXJkc0NoZWNrU3RhcnQgZXh0ZW5kcyBSb3V0ZXJFdmVudCB7XG4gIHJlYWRvbmx5IHR5cGUgPSBFdmVudFR5cGUuR3VhcmRzQ2hlY2tTdGFydDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIC8qKiBAZG9jc05vdFJlcXVpcmVkICovXG4gICAgICBpZDogbnVtYmVyLFxuICAgICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICAgIHVybDogc3RyaW5nLFxuICAgICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICAgIHB1YmxpYyB1cmxBZnRlclJlZGlyZWN0czogc3RyaW5nLFxuICAgICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICAgIHB1YmxpYyBzdGF0ZTogUm91dGVyU3RhdGVTbmFwc2hvdCkge1xuICAgIHN1cGVyKGlkLCB1cmwpO1xuICB9XG5cbiAgb3ZlcnJpZGUgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYEd1YXJkc0NoZWNrU3RhcnQoaWQ6ICR7dGhpcy5pZH0sIHVybDogJyR7dGhpcy51cmx9JywgdXJsQWZ0ZXJSZWRpcmVjdHM6ICcke1xuICAgICAgICB0aGlzLnVybEFmdGVyUmVkaXJlY3RzfScsIHN0YXRlOiAke3RoaXMuc3RhdGV9KWA7XG4gIH1cbn1cblxuLyoqXG4gKiBBbiBldmVudCB0cmlnZ2VyZWQgYXQgdGhlIGVuZCBvZiB0aGUgR3VhcmQgcGhhc2Ugb2Ygcm91dGluZy5cbiAqXG4gKiBAc2VlIGBHdWFyZHNDaGVja1N0YXJ0YFxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIEd1YXJkc0NoZWNrRW5kIGV4dGVuZHMgUm91dGVyRXZlbnQge1xuICByZWFkb25seSB0eXBlID0gRXZlbnRUeXBlLkd1YXJkc0NoZWNrRW5kO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICAgIGlkOiBudW1iZXIsXG4gICAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgICAgdXJsOiBzdHJpbmcsXG4gICAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgICAgcHVibGljIHVybEFmdGVyUmVkaXJlY3RzOiBzdHJpbmcsXG4gICAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgICAgcHVibGljIHN0YXRlOiBSb3V0ZXJTdGF0ZVNuYXBzaG90LFxuICAgICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICAgIHB1YmxpYyBzaG91bGRBY3RpdmF0ZTogYm9vbGVhbikge1xuICAgIHN1cGVyKGlkLCB1cmwpO1xuICB9XG5cbiAgb3ZlcnJpZGUgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYEd1YXJkc0NoZWNrRW5kKGlkOiAke3RoaXMuaWR9LCB1cmw6ICcke3RoaXMudXJsfScsIHVybEFmdGVyUmVkaXJlY3RzOiAnJHtcbiAgICAgICAgdGhpcy51cmxBZnRlclJlZGlyZWN0c30nLCBzdGF0ZTogJHt0aGlzLnN0YXRlfSwgc2hvdWxkQWN0aXZhdGU6ICR7dGhpcy5zaG91bGRBY3RpdmF0ZX0pYDtcbiAgfVxufVxuXG4vKipcbiAqIEFuIGV2ZW50IHRyaWdnZXJlZCBhdCB0aGUgc3RhcnQgb2YgdGhlIFJlc29sdmUgcGhhc2Ugb2Ygcm91dGluZy5cbiAqXG4gKiBSdW5zIGluIHRoZSBcInJlc29sdmVcIiBwaGFzZSB3aGV0aGVyIG9yIG5vdCB0aGVyZSBpcyBhbnl0aGluZyB0byByZXNvbHZlLlxuICogSW4gZnV0dXJlLCBtYXkgY2hhbmdlIHRvIG9ubHkgcnVuIHdoZW4gdGhlcmUgYXJlIHRoaW5ncyB0byBiZSByZXNvbHZlZC5cbiAqXG4gKiBAc2VlIGBSZXNvbHZlRW5kYFxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIFJlc29sdmVTdGFydCBleHRlbmRzIFJvdXRlckV2ZW50IHtcbiAgcmVhZG9ubHkgdHlwZSA9IEV2ZW50VHlwZS5SZXNvbHZlU3RhcnQ7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgICAgaWQ6IG51bWJlcixcbiAgICAgIC8qKiBAZG9jc05vdFJlcXVpcmVkICovXG4gICAgICB1cmw6IHN0cmluZyxcbiAgICAgIC8qKiBAZG9jc05vdFJlcXVpcmVkICovXG4gICAgICBwdWJsaWMgdXJsQWZ0ZXJSZWRpcmVjdHM6IHN0cmluZyxcbiAgICAgIC8qKiBAZG9jc05vdFJlcXVpcmVkICovXG4gICAgICBwdWJsaWMgc3RhdGU6IFJvdXRlclN0YXRlU25hcHNob3QpIHtcbiAgICBzdXBlcihpZCwgdXJsKTtcbiAgfVxuXG4gIG92ZXJyaWRlIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBSZXNvbHZlU3RhcnQoaWQ6ICR7dGhpcy5pZH0sIHVybDogJyR7dGhpcy51cmx9JywgdXJsQWZ0ZXJSZWRpcmVjdHM6ICcke1xuICAgICAgICB0aGlzLnVybEFmdGVyUmVkaXJlY3RzfScsIHN0YXRlOiAke3RoaXMuc3RhdGV9KWA7XG4gIH1cbn1cblxuLyoqXG4gKiBBbiBldmVudCB0cmlnZ2VyZWQgYXQgdGhlIGVuZCBvZiB0aGUgUmVzb2x2ZSBwaGFzZSBvZiByb3V0aW5nLlxuICogQHNlZSBgUmVzb2x2ZVN0YXJ0YC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBSZXNvbHZlRW5kIGV4dGVuZHMgUm91dGVyRXZlbnQge1xuICByZWFkb25seSB0eXBlID0gRXZlbnRUeXBlLlJlc29sdmVFbmQ7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgICAgaWQ6IG51bWJlcixcbiAgICAgIC8qKiBAZG9jc05vdFJlcXVpcmVkICovXG4gICAgICB1cmw6IHN0cmluZyxcbiAgICAgIC8qKiBAZG9jc05vdFJlcXVpcmVkICovXG4gICAgICBwdWJsaWMgdXJsQWZ0ZXJSZWRpcmVjdHM6IHN0cmluZyxcbiAgICAgIC8qKiBAZG9jc05vdFJlcXVpcmVkICovXG4gICAgICBwdWJsaWMgc3RhdGU6IFJvdXRlclN0YXRlU25hcHNob3QpIHtcbiAgICBzdXBlcihpZCwgdXJsKTtcbiAgfVxuXG4gIG92ZXJyaWRlIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBSZXNvbHZlRW5kKGlkOiAke3RoaXMuaWR9LCB1cmw6ICcke3RoaXMudXJsfScsIHVybEFmdGVyUmVkaXJlY3RzOiAnJHtcbiAgICAgICAgdGhpcy51cmxBZnRlclJlZGlyZWN0c30nLCBzdGF0ZTogJHt0aGlzLnN0YXRlfSlgO1xuICB9XG59XG5cbi8qKlxuICogQW4gZXZlbnQgdHJpZ2dlcmVkIGJlZm9yZSBsYXp5IGxvYWRpbmcgYSByb3V0ZSBjb25maWd1cmF0aW9uLlxuICpcbiAqIEBzZWUgYFJvdXRlQ29uZmlnTG9hZEVuZGBcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBSb3V0ZUNvbmZpZ0xvYWRTdGFydCB7XG4gIHJlYWRvbmx5IHR5cGUgPSBFdmVudFR5cGUuUm91dGVDb25maWdMb2FkU3RhcnQ7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgICAgcHVibGljIHJvdXRlOiBSb3V0ZSkge31cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYFJvdXRlQ29uZmlnTG9hZFN0YXJ0KHBhdGg6ICR7dGhpcy5yb3V0ZS5wYXRofSlgO1xuICB9XG59XG5cbi8qKlxuICogQW4gZXZlbnQgdHJpZ2dlcmVkIHdoZW4gYSByb3V0ZSBoYXMgYmVlbiBsYXp5IGxvYWRlZC5cbiAqXG4gKiBAc2VlIGBSb3V0ZUNvbmZpZ0xvYWRTdGFydGBcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBSb3V0ZUNvbmZpZ0xvYWRFbmQge1xuICByZWFkb25seSB0eXBlID0gRXZlbnRUeXBlLlJvdXRlQ29uZmlnTG9hZEVuZDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIC8qKiBAZG9jc05vdFJlcXVpcmVkICovXG4gICAgICBwdWJsaWMgcm91dGU6IFJvdXRlKSB7fVxuICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiBgUm91dGVDb25maWdMb2FkRW5kKHBhdGg6ICR7dGhpcy5yb3V0ZS5wYXRofSlgO1xuICB9XG59XG5cbi8qKlxuICogQW4gZXZlbnQgdHJpZ2dlcmVkIGF0IHRoZSBzdGFydCBvZiB0aGUgY2hpbGQtYWN0aXZhdGlvblxuICogcGFydCBvZiB0aGUgUmVzb2x2ZSBwaGFzZSBvZiByb3V0aW5nLlxuICogQHNlZSAgYENoaWxkQWN0aXZhdGlvbkVuZGBcbiAqIEBzZWUgYFJlc29sdmVTdGFydGBcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBDaGlsZEFjdGl2YXRpb25TdGFydCB7XG4gIHJlYWRvbmx5IHR5cGUgPSBFdmVudFR5cGUuQ2hpbGRBY3RpdmF0aW9uU3RhcnQ7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgICAgcHVibGljIHNuYXBzaG90OiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90KSB7fVxuICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLnNuYXBzaG90LnJvdXRlQ29uZmlnICYmIHRoaXMuc25hcHNob3Qucm91dGVDb25maWcucGF0aCB8fCAnJztcbiAgICByZXR1cm4gYENoaWxkQWN0aXZhdGlvblN0YXJ0KHBhdGg6ICcke3BhdGh9JylgO1xuICB9XG59XG5cbi8qKlxuICogQW4gZXZlbnQgdHJpZ2dlcmVkIGF0IHRoZSBlbmQgb2YgdGhlIGNoaWxkLWFjdGl2YXRpb24gcGFydFxuICogb2YgdGhlIFJlc29sdmUgcGhhc2Ugb2Ygcm91dGluZy5cbiAqIEBzZWUgYENoaWxkQWN0aXZhdGlvblN0YXJ0YFxuICogQHNlZSBgUmVzb2x2ZVN0YXJ0YFxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgQ2hpbGRBY3RpdmF0aW9uRW5kIHtcbiAgcmVhZG9ubHkgdHlwZSA9IEV2ZW50VHlwZS5DaGlsZEFjdGl2YXRpb25FbmQ7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgICAgcHVibGljIHNuYXBzaG90OiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90KSB7fVxuICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLnNuYXBzaG90LnJvdXRlQ29uZmlnICYmIHRoaXMuc25hcHNob3Qucm91dGVDb25maWcucGF0aCB8fCAnJztcbiAgICByZXR1cm4gYENoaWxkQWN0aXZhdGlvbkVuZChwYXRoOiAnJHtwYXRofScpYDtcbiAgfVxufVxuXG4vKipcbiAqIEFuIGV2ZW50IHRyaWdnZXJlZCBhdCB0aGUgc3RhcnQgb2YgdGhlIGFjdGl2YXRpb24gcGFydFxuICogb2YgdGhlIFJlc29sdmUgcGhhc2Ugb2Ygcm91dGluZy5cbiAqIEBzZWUgYEFjdGl2YXRpb25FbmRgXG4gKiBAc2VlIGBSZXNvbHZlU3RhcnRgXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgQWN0aXZhdGlvblN0YXJ0IHtcbiAgcmVhZG9ubHkgdHlwZSA9IEV2ZW50VHlwZS5BY3RpdmF0aW9uU3RhcnQ7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgICAgcHVibGljIHNuYXBzaG90OiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90KSB7fVxuICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLnNuYXBzaG90LnJvdXRlQ29uZmlnICYmIHRoaXMuc25hcHNob3Qucm91dGVDb25maWcucGF0aCB8fCAnJztcbiAgICByZXR1cm4gYEFjdGl2YXRpb25TdGFydChwYXRoOiAnJHtwYXRofScpYDtcbiAgfVxufVxuXG4vKipcbiAqIEFuIGV2ZW50IHRyaWdnZXJlZCBhdCB0aGUgZW5kIG9mIHRoZSBhY3RpdmF0aW9uIHBhcnRcbiAqIG9mIHRoZSBSZXNvbHZlIHBoYXNlIG9mIHJvdXRpbmcuXG4gKiBAc2VlIGBBY3RpdmF0aW9uU3RhcnRgXG4gKiBAc2VlIGBSZXNvbHZlU3RhcnRgXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgQWN0aXZhdGlvbkVuZCB7XG4gIHJlYWRvbmx5IHR5cGUgPSBFdmVudFR5cGUuQWN0aXZhdGlvbkVuZDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIC8qKiBAZG9jc05vdFJlcXVpcmVkICovXG4gICAgICBwdWJsaWMgc25hcHNob3Q6IEFjdGl2YXRlZFJvdXRlU25hcHNob3QpIHt9XG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMuc25hcHNob3Qucm91dGVDb25maWcgJiYgdGhpcy5zbmFwc2hvdC5yb3V0ZUNvbmZpZy5wYXRoIHx8ICcnO1xuICAgIHJldHVybiBgQWN0aXZhdGlvbkVuZChwYXRoOiAnJHtwYXRofScpYDtcbiAgfVxufVxuXG4vKipcbiAqIEFuIGV2ZW50IHRyaWdnZXJlZCBieSBzY3JvbGxpbmcuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgU2Nyb2xsIHtcbiAgcmVhZG9ubHkgdHlwZSA9IEV2ZW50VHlwZS5TY3JvbGw7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgICAgcmVhZG9ubHkgcm91dGVyRXZlbnQ6IE5hdmlnYXRpb25FbmQsXG5cbiAgICAgIC8qKiBAZG9jc05vdFJlcXVpcmVkICovXG4gICAgICByZWFkb25seSBwb3NpdGlvbjogW251bWJlciwgbnVtYmVyXXxudWxsLFxuXG4gICAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgICAgcmVhZG9ubHkgYW5jaG9yOiBzdHJpbmd8bnVsbCkge31cblxuICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIGNvbnN0IHBvcyA9IHRoaXMucG9zaXRpb24gPyBgJHt0aGlzLnBvc2l0aW9uWzBdfSwgJHt0aGlzLnBvc2l0aW9uWzFdfWAgOiBudWxsO1xuICAgIHJldHVybiBgU2Nyb2xsKGFuY2hvcjogJyR7dGhpcy5hbmNob3J9JywgcG9zaXRpb246ICcke3Bvc30nKWA7XG4gIH1cbn1cblxuLyoqXG4gKiBSb3V0ZXIgZXZlbnRzIHRoYXQgYWxsb3cgeW91IHRvIHRyYWNrIHRoZSBsaWZlY3ljbGUgb2YgdGhlIHJvdXRlci5cbiAqXG4gKiBUaGUgZXZlbnRzIG9jY3VyIGluIHRoZSBmb2xsb3dpbmcgc2VxdWVuY2U6XG4gKlxuICogKiBbTmF2aWdhdGlvblN0YXJ0XShhcGkvcm91dGVyL05hdmlnYXRpb25TdGFydCk6IE5hdmlnYXRpb24gc3RhcnRzLlxuICogKiBbUm91dGVDb25maWdMb2FkU3RhcnRdKGFwaS9yb3V0ZXIvUm91dGVDb25maWdMb2FkU3RhcnQpOiBCZWZvcmVcbiAqIHRoZSByb3V0ZXIgW2xhenkgbG9hZHNdKC9ndWlkZS9yb3V0ZXIjbGF6eS1sb2FkaW5nKSBhIHJvdXRlIGNvbmZpZ3VyYXRpb24uXG4gKiAqIFtSb3V0ZUNvbmZpZ0xvYWRFbmRdKGFwaS9yb3V0ZXIvUm91dGVDb25maWdMb2FkRW5kKTogQWZ0ZXIgYSByb3V0ZSBoYXMgYmVlbiBsYXp5IGxvYWRlZC5cbiAqICogW1JvdXRlc1JlY29nbml6ZWRdKGFwaS9yb3V0ZXIvUm91dGVzUmVjb2duaXplZCk6IFdoZW4gdGhlIHJvdXRlciBwYXJzZXMgdGhlIFVSTFxuICogYW5kIHRoZSByb3V0ZXMgYXJlIHJlY29nbml6ZWQuXG4gKiAqIFtHdWFyZHNDaGVja1N0YXJ0XShhcGkvcm91dGVyL0d1YXJkc0NoZWNrU3RhcnQpOiBXaGVuIHRoZSByb3V0ZXIgYmVnaW5zIHRoZSAqZ3VhcmRzKlxuICogcGhhc2Ugb2Ygcm91dGluZy5cbiAqICogW0NoaWxkQWN0aXZhdGlvblN0YXJ0XShhcGkvcm91dGVyL0NoaWxkQWN0aXZhdGlvblN0YXJ0KTogV2hlbiB0aGUgcm91dGVyXG4gKiBiZWdpbnMgYWN0aXZhdGluZyBhIHJvdXRlJ3MgY2hpbGRyZW4uXG4gKiAqIFtBY3RpdmF0aW9uU3RhcnRdKGFwaS9yb3V0ZXIvQWN0aXZhdGlvblN0YXJ0KTogV2hlbiB0aGUgcm91dGVyIGJlZ2lucyBhY3RpdmF0aW5nIGEgcm91dGUuXG4gKiAqIFtHdWFyZHNDaGVja0VuZF0oYXBpL3JvdXRlci9HdWFyZHNDaGVja0VuZCk6IFdoZW4gdGhlIHJvdXRlciBmaW5pc2hlcyB0aGUgKmd1YXJkcypcbiAqIHBoYXNlIG9mIHJvdXRpbmcgc3VjY2Vzc2Z1bGx5LlxuICogKiBbUmVzb2x2ZVN0YXJ0XShhcGkvcm91dGVyL1Jlc29sdmVTdGFydCk6IFdoZW4gdGhlIHJvdXRlciBiZWdpbnMgdGhlICpyZXNvbHZlKlxuICogcGhhc2Ugb2Ygcm91dGluZy5cbiAqICogW1Jlc29sdmVFbmRdKGFwaS9yb3V0ZXIvUmVzb2x2ZUVuZCk6IFdoZW4gdGhlIHJvdXRlciBmaW5pc2hlcyB0aGUgKnJlc29sdmUqXG4gKiBwaGFzZSBvZiByb3V0aW5nIHN1Y2Nlc3NmdWxseS5cbiAqICogW0NoaWxkQWN0aXZhdGlvbkVuZF0oYXBpL3JvdXRlci9DaGlsZEFjdGl2YXRpb25FbmQpOiBXaGVuIHRoZSByb3V0ZXIgZmluaXNoZXNcbiAqIGFjdGl2YXRpbmcgYSByb3V0ZSdzIGNoaWxkcmVuLlxuICogKiBbQWN0aXZhdGlvbkVuZF0oYXBpL3JvdXRlci9BY3RpdmF0aW9uRW5kKTogV2hlbiB0aGUgcm91dGVyIGZpbmlzaGVzIGFjdGl2YXRpbmcgYSByb3V0ZS5cbiAqICogW05hdmlnYXRpb25FbmRdKGFwaS9yb3V0ZXIvTmF2aWdhdGlvbkVuZCk6IFdoZW4gbmF2aWdhdGlvbiBlbmRzIHN1Y2Nlc3NmdWxseS5cbiAqICogW05hdmlnYXRpb25DYW5jZWxdKGFwaS9yb3V0ZXIvTmF2aWdhdGlvbkNhbmNlbCk6IFdoZW4gbmF2aWdhdGlvbiBpcyBjYW5jZWxlZC5cbiAqICogW05hdmlnYXRpb25FcnJvcl0oYXBpL3JvdXRlci9OYXZpZ2F0aW9uRXJyb3IpOiBXaGVuIG5hdmlnYXRpb24gZmFpbHNcbiAqIGR1ZSB0byBhbiB1bmV4cGVjdGVkIGVycm9yLlxuICogKiBbU2Nyb2xsXShhcGkvcm91dGVyL1Njcm9sbCk6IFdoZW4gdGhlIHVzZXIgc2Nyb2xscy5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCB0eXBlIEV2ZW50ID0gUm91dGVyRXZlbnR8TmF2aWdhdGlvblN0YXJ0fE5hdmlnYXRpb25FbmR8TmF2aWdhdGlvbkNhbmNlbHxOYXZpZ2F0aW9uRXJyb3J8XG4gICAgUm91dGVzUmVjb2duaXplZHxHdWFyZHNDaGVja1N0YXJ0fEd1YXJkc0NoZWNrRW5kfFJvdXRlQ29uZmlnTG9hZFN0YXJ0fFJvdXRlQ29uZmlnTG9hZEVuZHxcbiAgICBDaGlsZEFjdGl2YXRpb25TdGFydHxDaGlsZEFjdGl2YXRpb25FbmR8QWN0aXZhdGlvblN0YXJ0fEFjdGl2YXRpb25FbmR8U2Nyb2xsfFJlc29sdmVTdGFydHxcbiAgICBSZXNvbHZlRW5kfE5hdmlnYXRpb25Ta2lwcGVkO1xuXG5cbmV4cG9ydCBmdW5jdGlvbiBzdHJpbmdpZnlFdmVudChyb3V0ZXJFdmVudDogRXZlbnQpOiBzdHJpbmcge1xuICBpZiAoISgndHlwZScgaW4gcm91dGVyRXZlbnQpKSB7XG4gICAgcmV0dXJuIGBVbmtub3duIFJvdXRlciBFdmVudDogJHtyb3V0ZXJFdmVudC5jb25zdHJ1Y3Rvci5uYW1lfWA7XG4gIH1cbiAgc3dpdGNoIChyb3V0ZXJFdmVudC50eXBlKSB7XG4gICAgY2FzZSBFdmVudFR5cGUuQWN0aXZhdGlvbkVuZDpcbiAgICAgIHJldHVybiBgQWN0aXZhdGlvbkVuZChwYXRoOiAnJHtyb3V0ZXJFdmVudC5zbmFwc2hvdC5yb3V0ZUNvbmZpZz8ucGF0aCB8fCAnJ30nKWA7XG4gICAgY2FzZSBFdmVudFR5cGUuQWN0aXZhdGlvblN0YXJ0OlxuICAgICAgcmV0dXJuIGBBY3RpdmF0aW9uU3RhcnQocGF0aDogJyR7cm91dGVyRXZlbnQuc25hcHNob3Qucm91dGVDb25maWc/LnBhdGggfHwgJyd9JylgO1xuICAgIGNhc2UgRXZlbnRUeXBlLkNoaWxkQWN0aXZhdGlvbkVuZDpcbiAgICAgIHJldHVybiBgQ2hpbGRBY3RpdmF0aW9uRW5kKHBhdGg6ICcke3JvdXRlckV2ZW50LnNuYXBzaG90LnJvdXRlQ29uZmlnPy5wYXRoIHx8ICcnfScpYDtcbiAgICBjYXNlIEV2ZW50VHlwZS5DaGlsZEFjdGl2YXRpb25TdGFydDpcbiAgICAgIHJldHVybiBgQ2hpbGRBY3RpdmF0aW9uU3RhcnQocGF0aDogJyR7cm91dGVyRXZlbnQuc25hcHNob3Qucm91dGVDb25maWc/LnBhdGggfHwgJyd9JylgO1xuICAgIGNhc2UgRXZlbnRUeXBlLkd1YXJkc0NoZWNrRW5kOlxuICAgICAgcmV0dXJuIGBHdWFyZHNDaGVja0VuZChpZDogJHtyb3V0ZXJFdmVudC5pZH0sIHVybDogJyR7XG4gICAgICAgICAgcm91dGVyRXZlbnQudXJsfScsIHVybEFmdGVyUmVkaXJlY3RzOiAnJHtyb3V0ZXJFdmVudC51cmxBZnRlclJlZGlyZWN0c30nLCBzdGF0ZTogJHtcbiAgICAgICAgICByb3V0ZXJFdmVudC5zdGF0ZX0sIHNob3VsZEFjdGl2YXRlOiAke3JvdXRlckV2ZW50LnNob3VsZEFjdGl2YXRlfSlgO1xuICAgIGNhc2UgRXZlbnRUeXBlLkd1YXJkc0NoZWNrU3RhcnQ6XG4gICAgICByZXR1cm4gYEd1YXJkc0NoZWNrU3RhcnQoaWQ6ICR7cm91dGVyRXZlbnQuaWR9LCB1cmw6ICcke1xuICAgICAgICAgIHJvdXRlckV2ZW50LnVybH0nLCB1cmxBZnRlclJlZGlyZWN0czogJyR7cm91dGVyRXZlbnQudXJsQWZ0ZXJSZWRpcmVjdHN9Jywgc3RhdGU6ICR7XG4gICAgICAgICAgcm91dGVyRXZlbnQuc3RhdGV9KWA7XG4gICAgY2FzZSBFdmVudFR5cGUuTmF2aWdhdGlvbkNhbmNlbDpcbiAgICAgIHJldHVybiBgTmF2aWdhdGlvbkNhbmNlbChpZDogJHtyb3V0ZXJFdmVudC5pZH0sIHVybDogJyR7cm91dGVyRXZlbnQudXJsfScpYDtcbiAgICBjYXNlIEV2ZW50VHlwZS5OYXZpZ2F0aW9uU2tpcHBlZDpcbiAgICAgIHJldHVybiBgTmF2aWdhdGlvblNraXBwZWQoaWQ6ICR7cm91dGVyRXZlbnQuaWR9LCB1cmw6ICcke3JvdXRlckV2ZW50LnVybH0nKWA7XG4gICAgY2FzZSBFdmVudFR5cGUuTmF2aWdhdGlvbkVuZDpcbiAgICAgIHJldHVybiBgTmF2aWdhdGlvbkVuZChpZDogJHtyb3V0ZXJFdmVudC5pZH0sIHVybDogJyR7cm91dGVyRXZlbnQudXJsfScsIHVybEFmdGVyUmVkaXJlY3RzOiAnJHtcbiAgICAgICAgICByb3V0ZXJFdmVudC51cmxBZnRlclJlZGlyZWN0c30nKWA7XG4gICAgY2FzZSBFdmVudFR5cGUuTmF2aWdhdGlvbkVycm9yOlxuICAgICAgcmV0dXJuIGBOYXZpZ2F0aW9uRXJyb3IoaWQ6ICR7cm91dGVyRXZlbnQuaWR9LCB1cmw6ICcke3JvdXRlckV2ZW50LnVybH0nLCBlcnJvcjogJHtcbiAgICAgICAgICByb3V0ZXJFdmVudC5lcnJvcn0pYDtcbiAgICBjYXNlIEV2ZW50VHlwZS5OYXZpZ2F0aW9uU3RhcnQ6XG4gICAgICByZXR1cm4gYE5hdmlnYXRpb25TdGFydChpZDogJHtyb3V0ZXJFdmVudC5pZH0sIHVybDogJyR7cm91dGVyRXZlbnQudXJsfScpYDtcbiAgICBjYXNlIEV2ZW50VHlwZS5SZXNvbHZlRW5kOlxuICAgICAgcmV0dXJuIGBSZXNvbHZlRW5kKGlkOiAke3JvdXRlckV2ZW50LmlkfSwgdXJsOiAnJHtyb3V0ZXJFdmVudC51cmx9JywgdXJsQWZ0ZXJSZWRpcmVjdHM6ICcke1xuICAgICAgICAgIHJvdXRlckV2ZW50LnVybEFmdGVyUmVkaXJlY3RzfScsIHN0YXRlOiAke3JvdXRlckV2ZW50LnN0YXRlfSlgO1xuICAgIGNhc2UgRXZlbnRUeXBlLlJlc29sdmVTdGFydDpcbiAgICAgIHJldHVybiBgUmVzb2x2ZVN0YXJ0KGlkOiAke3JvdXRlckV2ZW50LmlkfSwgdXJsOiAnJHtyb3V0ZXJFdmVudC51cmx9JywgdXJsQWZ0ZXJSZWRpcmVjdHM6ICcke1xuICAgICAgICAgIHJvdXRlckV2ZW50LnVybEFmdGVyUmVkaXJlY3RzfScsIHN0YXRlOiAke3JvdXRlckV2ZW50LnN0YXRlfSlgO1xuICAgIGNhc2UgRXZlbnRUeXBlLlJvdXRlQ29uZmlnTG9hZEVuZDpcbiAgICAgIHJldHVybiBgUm91dGVDb25maWdMb2FkRW5kKHBhdGg6ICR7cm91dGVyRXZlbnQucm91dGUucGF0aH0pYDtcbiAgICBjYXNlIEV2ZW50VHlwZS5Sb3V0ZUNvbmZpZ0xvYWRTdGFydDpcbiAgICAgIHJldHVybiBgUm91dGVDb25maWdMb2FkU3RhcnQocGF0aDogJHtyb3V0ZXJFdmVudC5yb3V0ZS5wYXRofSlgO1xuICAgIGNhc2UgRXZlbnRUeXBlLlJvdXRlc1JlY29nbml6ZWQ6XG4gICAgICByZXR1cm4gYFJvdXRlc1JlY29nbml6ZWQoaWQ6ICR7cm91dGVyRXZlbnQuaWR9LCB1cmw6ICcke1xuICAgICAgICAgIHJvdXRlckV2ZW50LnVybH0nLCB1cmxBZnRlclJlZGlyZWN0czogJyR7cm91dGVyRXZlbnQudXJsQWZ0ZXJSZWRpcmVjdHN9Jywgc3RhdGU6ICR7XG4gICAgICAgICAgcm91dGVyRXZlbnQuc3RhdGV9KWA7XG4gICAgY2FzZSBFdmVudFR5cGUuU2Nyb2xsOlxuICAgICAgY29uc3QgcG9zID1cbiAgICAgICAgICByb3V0ZXJFdmVudC5wb3NpdGlvbiA/IGAke3JvdXRlckV2ZW50LnBvc2l0aW9uWzBdfSwgJHtyb3V0ZXJFdmVudC5wb3NpdGlvblsxXX1gIDogbnVsbDtcbiAgICAgIHJldHVybiBgU2Nyb2xsKGFuY2hvcjogJyR7cm91dGVyRXZlbnQuYW5jaG9yfScsIHBvc2l0aW9uOiAnJHtwb3N9JylgO1xuICB9XG59XG4iXX0=