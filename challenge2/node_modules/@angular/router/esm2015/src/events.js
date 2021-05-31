/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Base for events the router goes through, as opposed to events tied to a specific
 * route. Fired one time for any given navigation.
 *
 * The following code shows how a class subscribes to router events.
 *
 * ```ts
 * class MyService {
 *   constructor(public router: Router, logger: Logger) {
 *     router.events.pipe(
 *        filter((e: Event): e is RouterEvent => e instanceof RouterEvent)
 *     ).subscribe((e: RouterEvent) => {
 *       logger.log(e.id, e.url);
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
    /** @docsNotRequired */
    reason) {
        super(id, url);
        this.reason = reason;
    }
    /** @docsNotRequired */
    toString() {
        return `NavigationCancel(id: ${this.id}, url: '${this.url}')`;
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
    error) {
        super(id, url);
        this.error = error;
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
    }
    toString() {
        const pos = this.position ? `${this.position[0]}, ${this.position[1]}` : null;
        return `Scroll(anchor: '${this.anchor}', position: '${pos}')`;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvcm91dGVyL3NyYy9ldmVudHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBZ0JIOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FxQkc7QUFDSCxNQUFNLE9BQU8sV0FBVztJQUN0QjtJQUNJLHNFQUFzRTtJQUMvRCxFQUFVO0lBQ2pCLDJEQUEyRDtJQUNwRCxHQUFXO1FBRlgsT0FBRSxHQUFGLEVBQUUsQ0FBUTtRQUVWLFFBQUcsR0FBSCxHQUFHLENBQVE7SUFBRyxDQUFDO0NBQzNCO0FBRUQ7Ozs7R0FJRztBQUNILE1BQU0sT0FBTyxlQUFnQixTQUFRLFdBQVc7SUE4QjlDO0lBQ0ksdUJBQXVCO0lBQ3ZCLEVBQVU7SUFDVix1QkFBdUI7SUFDdkIsR0FBVztJQUNYLHVCQUF1QjtJQUN2QixvQkFBMEQsWUFBWTtJQUN0RSx1QkFBdUI7SUFDdkIsZ0JBQStELElBQUk7UUFDckUsS0FBSyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNmLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxpQkFBaUIsQ0FBQztRQUMzQyxJQUFJLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQztJQUNyQyxDQUFDO0lBRUQsdUJBQXVCO0lBQ3ZCLFFBQVE7UUFDTixPQUFPLHVCQUF1QixJQUFJLENBQUMsRUFBRSxXQUFXLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQztJQUMvRCxDQUFDO0NBQ0Y7QUFFRDs7Ozs7Ozs7R0FRRztBQUNILE1BQU0sT0FBTyxhQUFjLFNBQVEsV0FBVztJQUM1QztJQUNJLHVCQUF1QjtJQUN2QixFQUFVO0lBQ1YsdUJBQXVCO0lBQ3ZCLEdBQVc7SUFDWCx1QkFBdUI7SUFDaEIsaUJBQXlCO1FBQ2xDLEtBQUssQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFETixzQkFBaUIsR0FBakIsaUJBQWlCLENBQVE7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QUMsS0FBSyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUM5RSxPQUFPLG1CQUFtQixJQUFJLENBQUMsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUM7SUFDaEUsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Um91dGV9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7QWN0aXZhdGVkUm91dGVTbmFwc2hvdCwgUm91dGVyU3RhdGVTbmFwc2hvdH0gZnJvbSAnLi9yb3V0ZXJfc3RhdGUnO1xuXG4vKipcbiAqIElkZW50aWZpZXMgdGhlIGNhbGwgb3IgZXZlbnQgdGhhdCB0cmlnZ2VyZWQgYSBuYXZpZ2F0aW9uLlxuICpcbiAqICogJ2ltcGVyYXRpdmUnOiBUcmlnZ2VyZWQgYnkgYHJvdXRlci5uYXZpZ2F0ZUJ5VXJsKClgIG9yIGByb3V0ZXIubmF2aWdhdGUoKWAuXG4gKiAqICdwb3BzdGF0ZScgOiBUcmlnZ2VyZWQgYnkgYSBgcG9wc3RhdGVgIGV2ZW50LlxuICogKiAnaGFzaGNoYW5nZSctOiBUcmlnZ2VyZWQgYnkgYSBgaGFzaGNoYW5nZWAgZXZlbnQuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgdHlwZSBOYXZpZ2F0aW9uVHJpZ2dlciA9ICdpbXBlcmF0aXZlJ3wncG9wc3RhdGUnfCdoYXNoY2hhbmdlJztcblxuLyoqXG4gKiBCYXNlIGZvciBldmVudHMgdGhlIHJvdXRlciBnb2VzIHRocm91Z2gsIGFzIG9wcG9zZWQgdG8gZXZlbnRzIHRpZWQgdG8gYSBzcGVjaWZpY1xuICogcm91dGUuIEZpcmVkIG9uZSB0aW1lIGZvciBhbnkgZ2l2ZW4gbmF2aWdhdGlvbi5cbiAqXG4gKiBUaGUgZm9sbG93aW5nIGNvZGUgc2hvd3MgaG93IGEgY2xhc3Mgc3Vic2NyaWJlcyB0byByb3V0ZXIgZXZlbnRzLlxuICpcbiAqIGBgYHRzXG4gKiBjbGFzcyBNeVNlcnZpY2Uge1xuICogICBjb25zdHJ1Y3RvcihwdWJsaWMgcm91dGVyOiBSb3V0ZXIsIGxvZ2dlcjogTG9nZ2VyKSB7XG4gKiAgICAgcm91dGVyLmV2ZW50cy5waXBlKFxuICogICAgICAgIGZpbHRlcigoZTogRXZlbnQpOiBlIGlzIFJvdXRlckV2ZW50ID0+IGUgaW5zdGFuY2VvZiBSb3V0ZXJFdmVudClcbiAqICAgICApLnN1YnNjcmliZSgoZTogUm91dGVyRXZlbnQpID0+IHtcbiAqICAgICAgIGxvZ2dlci5sb2coZS5pZCwgZS51cmwpO1xuICogICAgIH0pO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBAc2VlIGBFdmVudGBcbiAqIEBzZWUgW1JvdXRlciBldmVudHMgc3VtbWFyeV0oZ3VpZGUvcm91dGVyLXJlZmVyZW5jZSNyb3V0ZXItZXZlbnRzKVxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgUm91dGVyRXZlbnQge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIC8qKiBBIHVuaXF1ZSBJRCB0aGF0IHRoZSByb3V0ZXIgYXNzaWducyB0byBldmVyeSByb3V0ZXIgbmF2aWdhdGlvbi4gKi9cbiAgICAgIHB1YmxpYyBpZDogbnVtYmVyLFxuICAgICAgLyoqIFRoZSBVUkwgdGhhdCBpcyB0aGUgZGVzdGluYXRpb24gZm9yIHRoaXMgbmF2aWdhdGlvbi4gKi9cbiAgICAgIHB1YmxpYyB1cmw6IHN0cmluZykge31cbn1cblxuLyoqXG4gKiBBbiBldmVudCB0cmlnZ2VyZWQgd2hlbiBhIG5hdmlnYXRpb24gc3RhcnRzLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIE5hdmlnYXRpb25TdGFydCBleHRlbmRzIFJvdXRlckV2ZW50IHtcbiAgLyoqXG4gICAqIElkZW50aWZpZXMgdGhlIGNhbGwgb3IgZXZlbnQgdGhhdCB0cmlnZ2VyZWQgdGhlIG5hdmlnYXRpb24uXG4gICAqIEFuIGBpbXBlcmF0aXZlYCB0cmlnZ2VyIGlzIGEgY2FsbCB0byBgcm91dGVyLm5hdmlnYXRlQnlVcmwoKWAgb3IgYHJvdXRlci5uYXZpZ2F0ZSgpYC5cbiAgICpcbiAgICogQHNlZSBgTmF2aWdhdGlvbkVuZGBcbiAgICogQHNlZSBgTmF2aWdhdGlvbkNhbmNlbGBcbiAgICogQHNlZSBgTmF2aWdhdGlvbkVycm9yYFxuICAgKi9cbiAgbmF2aWdhdGlvblRyaWdnZXI/OiAnaW1wZXJhdGl2ZSd8J3BvcHN0YXRlJ3wnaGFzaGNoYW5nZSc7XG5cbiAgLyoqXG4gICAqIFRoZSBuYXZpZ2F0aW9uIHN0YXRlIHRoYXQgd2FzIHByZXZpb3VzbHkgc3VwcGxpZWQgdG8gdGhlIGBwdXNoU3RhdGVgIGNhbGwsXG4gICAqIHdoZW4gdGhlIG5hdmlnYXRpb24gaXMgdHJpZ2dlcmVkIGJ5IGEgYHBvcHN0YXRlYCBldmVudC4gT3RoZXJ3aXNlIG51bGwuXG4gICAqXG4gICAqIFRoZSBzdGF0ZSBvYmplY3QgaXMgZGVmaW5lZCBieSBgTmF2aWdhdGlvbkV4dHJhc2AsIGFuZCBjb250YWlucyBhbnlcbiAgICogZGV2ZWxvcGVyLWRlZmluZWQgc3RhdGUgdmFsdWUsIGFzIHdlbGwgYXMgYSB1bmlxdWUgSUQgdGhhdFxuICAgKiB0aGUgcm91dGVyIGFzc2lnbnMgdG8gZXZlcnkgcm91dGVyIHRyYW5zaXRpb24vbmF2aWdhdGlvbi5cbiAgICpcbiAgICogRnJvbSB0aGUgcGVyc3BlY3RpdmUgb2YgdGhlIHJvdXRlciwgdGhlIHJvdXRlciBuZXZlciBcImdvZXMgYmFja1wiLlxuICAgKiBXaGVuIHRoZSB1c2VyIGNsaWNrcyBvbiB0aGUgYmFjayBidXR0b24gaW4gdGhlIGJyb3dzZXIsXG4gICAqIGEgbmV3IG5hdmlnYXRpb24gSUQgaXMgY3JlYXRlZC5cbiAgICpcbiAgICogVXNlIHRoZSBJRCBpbiB0aGlzIHByZXZpb3VzLXN0YXRlIG9iamVjdCB0byBkaWZmZXJlbnRpYXRlIGJldHdlZW4gYSBuZXdseSBjcmVhdGVkXG4gICAqIHN0YXRlIGFuZCBvbmUgcmV0dXJuZWQgdG8gYnkgYSBgcG9wc3RhdGVgIGV2ZW50LCBzbyB0aGF0IHlvdSBjYW4gcmVzdG9yZSBzb21lXG4gICAqIHJlbWVtYmVyZWQgc3RhdGUsIHN1Y2ggYXMgc2Nyb2xsIHBvc2l0aW9uLlxuICAgKlxuICAgKi9cbiAgcmVzdG9yZWRTdGF0ZT86IHtbazogc3RyaW5nXTogYW55LCBuYXZpZ2F0aW9uSWQ6IG51bWJlcn18bnVsbDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIC8qKiBAZG9jc05vdFJlcXVpcmVkICovXG4gICAgICBpZDogbnVtYmVyLFxuICAgICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICAgIHVybDogc3RyaW5nLFxuICAgICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICAgIG5hdmlnYXRpb25UcmlnZ2VyOiAnaW1wZXJhdGl2ZSd8J3BvcHN0YXRlJ3wnaGFzaGNoYW5nZScgPSAnaW1wZXJhdGl2ZScsXG4gICAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgICAgcmVzdG9yZWRTdGF0ZToge1trOiBzdHJpbmddOiBhbnksIG5hdmlnYXRpb25JZDogbnVtYmVyfXxudWxsID0gbnVsbCkge1xuICAgIHN1cGVyKGlkLCB1cmwpO1xuICAgIHRoaXMubmF2aWdhdGlvblRyaWdnZXIgPSBuYXZpZ2F0aW9uVHJpZ2dlcjtcbiAgICB0aGlzLnJlc3RvcmVkU3RhdGUgPSByZXN0b3JlZFN0YXRlO1xuICB9XG5cbiAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYE5hdmlnYXRpb25TdGFydChpZDogJHt0aGlzLmlkfSwgdXJsOiAnJHt0aGlzLnVybH0nKWA7XG4gIH1cbn1cblxuLyoqXG4gKiBBbiBldmVudCB0cmlnZ2VyZWQgd2hlbiBhIG5hdmlnYXRpb24gZW5kcyBzdWNjZXNzZnVsbHkuXG4gKlxuICogQHNlZSBgTmF2aWdhdGlvblN0YXJ0YFxuICogQHNlZSBgTmF2aWdhdGlvbkNhbmNlbGBcbiAqIEBzZWUgYE5hdmlnYXRpb25FcnJvcmBcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBOYXZpZ2F0aW9uRW5kIGV4dGVuZHMgUm91dGVyRXZlbnQge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIC8qKiBAZG9jc05vdFJlcXVpcmVkICovXG4gICAgICBpZDogbnVtYmVyLFxuICAgICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICAgIHVybDogc3RyaW5nLFxuICAgICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICAgIHB1YmxpYyB1cmxBZnRlclJlZGlyZWN0czogc3RyaW5nKSB7XG4gICAgc3VwZXIoaWQsIHVybCk7XG4gIH1cblxuICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiBgTmF2aWdhdGlvbkVuZChpZDogJHt0aGlzLmlkfSwgdXJsOiAnJHt0aGlzLnVybH0nLCB1cmxBZnRlclJlZGlyZWN0czogJyR7XG4gICAgICAgIHRoaXMudXJsQWZ0ZXJSZWRpcmVjdHN9JylgO1xuICB9XG59XG5cbi8qKlxuICogQW4gZXZlbnQgdHJpZ2dlcmVkIHdoZW4gYSBuYXZpZ2F0aW9uIGlzIGNhbmNlbGVkLCBkaXJlY3RseSBvciBpbmRpcmVjdGx5LlxuICogVGhpcyBjYW4gaGFwcGVuIGZvciBzZXZlcmFsIHJlYXNvbnMgaW5jbHVkaW5nIHdoZW4gYSByb3V0ZSBndWFyZFxuICogcmV0dXJucyBgZmFsc2VgIG9yIGluaXRpYXRlcyBhIHJlZGlyZWN0IGJ5IHJldHVybmluZyBhIGBVcmxUcmVlYC5cbiAqXG4gKiBAc2VlIGBOYXZpZ2F0aW9uU3RhcnRgXG4gKiBAc2VlIGBOYXZpZ2F0aW9uRW5kYFxuICogQHNlZSBgTmF2aWdhdGlvbkVycm9yYFxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIE5hdmlnYXRpb25DYW5jZWwgZXh0ZW5kcyBSb3V0ZXJFdmVudCB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICAgIGlkOiBudW1iZXIsXG4gICAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgICAgdXJsOiBzdHJpbmcsXG4gICAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgICAgcHVibGljIHJlYXNvbjogc3RyaW5nKSB7XG4gICAgc3VwZXIoaWQsIHVybCk7XG4gIH1cblxuICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiBgTmF2aWdhdGlvbkNhbmNlbChpZDogJHt0aGlzLmlkfSwgdXJsOiAnJHt0aGlzLnVybH0nKWA7XG4gIH1cbn1cblxuLyoqXG4gKiBBbiBldmVudCB0cmlnZ2VyZWQgd2hlbiBhIG5hdmlnYXRpb24gZmFpbHMgZHVlIHRvIGFuIHVuZXhwZWN0ZWQgZXJyb3IuXG4gKlxuICogQHNlZSBgTmF2aWdhdGlvblN0YXJ0YFxuICogQHNlZSBgTmF2aWdhdGlvbkVuZGBcbiAqIEBzZWUgYE5hdmlnYXRpb25DYW5jZWxgXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgTmF2aWdhdGlvbkVycm9yIGV4dGVuZHMgUm91dGVyRXZlbnQge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIC8qKiBAZG9jc05vdFJlcXVpcmVkICovXG4gICAgICBpZDogbnVtYmVyLFxuICAgICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICAgIHVybDogc3RyaW5nLFxuICAgICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICAgIHB1YmxpYyBlcnJvcjogYW55KSB7XG4gICAgc3VwZXIoaWQsIHVybCk7XG4gIH1cblxuICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiBgTmF2aWdhdGlvbkVycm9yKGlkOiAke3RoaXMuaWR9LCB1cmw6ICcke3RoaXMudXJsfScsIGVycm9yOiAke3RoaXMuZXJyb3J9KWA7XG4gIH1cbn1cblxuLyoqXG4gKiBBbiBldmVudCB0cmlnZ2VyZWQgd2hlbiByb3V0ZXMgYXJlIHJlY29nbml6ZWQuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgUm91dGVzUmVjb2duaXplZCBleHRlbmRzIFJvdXRlckV2ZW50IHtcbiAgY29uc3RydWN0b3IoXG4gICAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgICAgaWQ6IG51bWJlcixcbiAgICAgIC8qKiBAZG9jc05vdFJlcXVpcmVkICovXG4gICAgICB1cmw6IHN0cmluZyxcbiAgICAgIC8qKiBAZG9jc05vdFJlcXVpcmVkICovXG4gICAgICBwdWJsaWMgdXJsQWZ0ZXJSZWRpcmVjdHM6IHN0cmluZyxcbiAgICAgIC8qKiBAZG9jc05vdFJlcXVpcmVkICovXG4gICAgICBwdWJsaWMgc3RhdGU6IFJvdXRlclN0YXRlU25hcHNob3QpIHtcbiAgICBzdXBlcihpZCwgdXJsKTtcbiAgfVxuXG4gIC8qKiBAZG9jc05vdFJlcXVpcmVkICovXG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBSb3V0ZXNSZWNvZ25pemVkKGlkOiAke3RoaXMuaWR9LCB1cmw6ICcke3RoaXMudXJsfScsIHVybEFmdGVyUmVkaXJlY3RzOiAnJHtcbiAgICAgICAgdGhpcy51cmxBZnRlclJlZGlyZWN0c30nLCBzdGF0ZTogJHt0aGlzLnN0YXRlfSlgO1xuICB9XG59XG5cbi8qKlxuICogQW4gZXZlbnQgdHJpZ2dlcmVkIGF0IHRoZSBzdGFydCBvZiB0aGUgR3VhcmQgcGhhc2Ugb2Ygcm91dGluZy5cbiAqXG4gKiBAc2VlIGBHdWFyZHNDaGVja0VuZGBcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBHdWFyZHNDaGVja1N0YXJ0IGV4dGVuZHMgUm91dGVyRXZlbnQge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIC8qKiBAZG9jc05vdFJlcXVpcmVkICovXG4gICAgICBpZDogbnVtYmVyLFxuICAgICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICAgIHVybDogc3RyaW5nLFxuICAgICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICAgIHB1YmxpYyB1cmxBZnRlclJlZGlyZWN0czogc3RyaW5nLFxuICAgICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICAgIHB1YmxpYyBzdGF0ZTogUm91dGVyU3RhdGVTbmFwc2hvdCkge1xuICAgIHN1cGVyKGlkLCB1cmwpO1xuICB9XG5cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYEd1YXJkc0NoZWNrU3RhcnQoaWQ6ICR7dGhpcy5pZH0sIHVybDogJyR7dGhpcy51cmx9JywgdXJsQWZ0ZXJSZWRpcmVjdHM6ICcke1xuICAgICAgICB0aGlzLnVybEFmdGVyUmVkaXJlY3RzfScsIHN0YXRlOiAke3RoaXMuc3RhdGV9KWA7XG4gIH1cbn1cblxuLyoqXG4gKiBBbiBldmVudCB0cmlnZ2VyZWQgYXQgdGhlIGVuZCBvZiB0aGUgR3VhcmQgcGhhc2Ugb2Ygcm91dGluZy5cbiAqXG4gKiBAc2VlIGBHdWFyZHNDaGVja1N0YXJ0YFxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIEd1YXJkc0NoZWNrRW5kIGV4dGVuZHMgUm91dGVyRXZlbnQge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIC8qKiBAZG9jc05vdFJlcXVpcmVkICovXG4gICAgICBpZDogbnVtYmVyLFxuICAgICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICAgIHVybDogc3RyaW5nLFxuICAgICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICAgIHB1YmxpYyB1cmxBZnRlclJlZGlyZWN0czogc3RyaW5nLFxuICAgICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICAgIHB1YmxpYyBzdGF0ZTogUm91dGVyU3RhdGVTbmFwc2hvdCxcbiAgICAgIC8qKiBAZG9jc05vdFJlcXVpcmVkICovXG4gICAgICBwdWJsaWMgc2hvdWxkQWN0aXZhdGU6IGJvb2xlYW4pIHtcbiAgICBzdXBlcihpZCwgdXJsKTtcbiAgfVxuXG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBHdWFyZHNDaGVja0VuZChpZDogJHt0aGlzLmlkfSwgdXJsOiAnJHt0aGlzLnVybH0nLCB1cmxBZnRlclJlZGlyZWN0czogJyR7XG4gICAgICAgIHRoaXMudXJsQWZ0ZXJSZWRpcmVjdHN9Jywgc3RhdGU6ICR7dGhpcy5zdGF0ZX0sIHNob3VsZEFjdGl2YXRlOiAke3RoaXMuc2hvdWxkQWN0aXZhdGV9KWA7XG4gIH1cbn1cblxuLyoqXG4gKiBBbiBldmVudCB0cmlnZ2VyZWQgYXQgdGhlIHN0YXJ0IG9mIHRoZSBSZXNvbHZlIHBoYXNlIG9mIHJvdXRpbmcuXG4gKlxuICogUnVucyBpbiB0aGUgXCJyZXNvbHZlXCIgcGhhc2Ugd2hldGhlciBvciBub3QgdGhlcmUgaXMgYW55dGhpbmcgdG8gcmVzb2x2ZS5cbiAqIEluIGZ1dHVyZSwgbWF5IGNoYW5nZSB0byBvbmx5IHJ1biB3aGVuIHRoZXJlIGFyZSB0aGluZ3MgdG8gYmUgcmVzb2x2ZWQuXG4gKlxuICogQHNlZSBgUmVzb2x2ZUVuZGBcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBSZXNvbHZlU3RhcnQgZXh0ZW5kcyBSb3V0ZXJFdmVudCB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICAgIGlkOiBudW1iZXIsXG4gICAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgICAgdXJsOiBzdHJpbmcsXG4gICAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgICAgcHVibGljIHVybEFmdGVyUmVkaXJlY3RzOiBzdHJpbmcsXG4gICAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgICAgcHVibGljIHN0YXRlOiBSb3V0ZXJTdGF0ZVNuYXBzaG90KSB7XG4gICAgc3VwZXIoaWQsIHVybCk7XG4gIH1cblxuICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiBgUmVzb2x2ZVN0YXJ0KGlkOiAke3RoaXMuaWR9LCB1cmw6ICcke3RoaXMudXJsfScsIHVybEFmdGVyUmVkaXJlY3RzOiAnJHtcbiAgICAgICAgdGhpcy51cmxBZnRlclJlZGlyZWN0c30nLCBzdGF0ZTogJHt0aGlzLnN0YXRlfSlgO1xuICB9XG59XG5cbi8qKlxuICogQW4gZXZlbnQgdHJpZ2dlcmVkIGF0IHRoZSBlbmQgb2YgdGhlIFJlc29sdmUgcGhhc2Ugb2Ygcm91dGluZy5cbiAqIEBzZWUgYFJlc29sdmVTdGFydGAuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgUmVzb2x2ZUVuZCBleHRlbmRzIFJvdXRlckV2ZW50IHtcbiAgY29uc3RydWN0b3IoXG4gICAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgICAgaWQ6IG51bWJlcixcbiAgICAgIC8qKiBAZG9jc05vdFJlcXVpcmVkICovXG4gICAgICB1cmw6IHN0cmluZyxcbiAgICAgIC8qKiBAZG9jc05vdFJlcXVpcmVkICovXG4gICAgICBwdWJsaWMgdXJsQWZ0ZXJSZWRpcmVjdHM6IHN0cmluZyxcbiAgICAgIC8qKiBAZG9jc05vdFJlcXVpcmVkICovXG4gICAgICBwdWJsaWMgc3RhdGU6IFJvdXRlclN0YXRlU25hcHNob3QpIHtcbiAgICBzdXBlcihpZCwgdXJsKTtcbiAgfVxuXG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBSZXNvbHZlRW5kKGlkOiAke3RoaXMuaWR9LCB1cmw6ICcke3RoaXMudXJsfScsIHVybEFmdGVyUmVkaXJlY3RzOiAnJHtcbiAgICAgICAgdGhpcy51cmxBZnRlclJlZGlyZWN0c30nLCBzdGF0ZTogJHt0aGlzLnN0YXRlfSlgO1xuICB9XG59XG5cbi8qKlxuICogQW4gZXZlbnQgdHJpZ2dlcmVkIGJlZm9yZSBsYXp5IGxvYWRpbmcgYSByb3V0ZSBjb25maWd1cmF0aW9uLlxuICpcbiAqIEBzZWUgYFJvdXRlQ29uZmlnTG9hZEVuZGBcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBSb3V0ZUNvbmZpZ0xvYWRTdGFydCB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICAgIHB1YmxpYyByb3V0ZTogUm91dGUpIHt9XG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBSb3V0ZUNvbmZpZ0xvYWRTdGFydChwYXRoOiAke3RoaXMucm91dGUucGF0aH0pYDtcbiAgfVxufVxuXG4vKipcbiAqIEFuIGV2ZW50IHRyaWdnZXJlZCB3aGVuIGEgcm91dGUgaGFzIGJlZW4gbGF6eSBsb2FkZWQuXG4gKlxuICogQHNlZSBgUm91dGVDb25maWdMb2FkU3RhcnRgXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgUm91dGVDb25maWdMb2FkRW5kIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgICAgcHVibGljIHJvdXRlOiBSb3V0ZSkge31cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYFJvdXRlQ29uZmlnTG9hZEVuZChwYXRoOiAke3RoaXMucm91dGUucGF0aH0pYDtcbiAgfVxufVxuXG4vKipcbiAqIEFuIGV2ZW50IHRyaWdnZXJlZCBhdCB0aGUgc3RhcnQgb2YgdGhlIGNoaWxkLWFjdGl2YXRpb25cbiAqIHBhcnQgb2YgdGhlIFJlc29sdmUgcGhhc2Ugb2Ygcm91dGluZy5cbiAqIEBzZWUgIGBDaGlsZEFjdGl2YXRpb25FbmRgXG4gKiBAc2VlIGBSZXNvbHZlU3RhcnRgXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgQ2hpbGRBY3RpdmF0aW9uU3RhcnQge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIC8qKiBAZG9jc05vdFJlcXVpcmVkICovXG4gICAgICBwdWJsaWMgc25hcHNob3Q6IEFjdGl2YXRlZFJvdXRlU25hcHNob3QpIHt9XG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMuc25hcHNob3Qucm91dGVDb25maWcgJiYgdGhpcy5zbmFwc2hvdC5yb3V0ZUNvbmZpZy5wYXRoIHx8ICcnO1xuICAgIHJldHVybiBgQ2hpbGRBY3RpdmF0aW9uU3RhcnQocGF0aDogJyR7cGF0aH0nKWA7XG4gIH1cbn1cblxuLyoqXG4gKiBBbiBldmVudCB0cmlnZ2VyZWQgYXQgdGhlIGVuZCBvZiB0aGUgY2hpbGQtYWN0aXZhdGlvbiBwYXJ0XG4gKiBvZiB0aGUgUmVzb2x2ZSBwaGFzZSBvZiByb3V0aW5nLlxuICogQHNlZSBgQ2hpbGRBY3RpdmF0aW9uU3RhcnRgXG4gKiBAc2VlIGBSZXNvbHZlU3RhcnRgXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBDaGlsZEFjdGl2YXRpb25FbmQge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIC8qKiBAZG9jc05vdFJlcXVpcmVkICovXG4gICAgICBwdWJsaWMgc25hcHNob3Q6IEFjdGl2YXRlZFJvdXRlU25hcHNob3QpIHt9XG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMuc25hcHNob3Qucm91dGVDb25maWcgJiYgdGhpcy5zbmFwc2hvdC5yb3V0ZUNvbmZpZy5wYXRoIHx8ICcnO1xuICAgIHJldHVybiBgQ2hpbGRBY3RpdmF0aW9uRW5kKHBhdGg6ICcke3BhdGh9JylgO1xuICB9XG59XG5cbi8qKlxuICogQW4gZXZlbnQgdHJpZ2dlcmVkIGF0IHRoZSBzdGFydCBvZiB0aGUgYWN0aXZhdGlvbiBwYXJ0XG4gKiBvZiB0aGUgUmVzb2x2ZSBwaGFzZSBvZiByb3V0aW5nLlxuICogQHNlZSBgQWN0aXZhdGlvbkVuZGBcbiAqIEBzZWUgYFJlc29sdmVTdGFydGBcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBBY3RpdmF0aW9uU3RhcnQge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIC8qKiBAZG9jc05vdFJlcXVpcmVkICovXG4gICAgICBwdWJsaWMgc25hcHNob3Q6IEFjdGl2YXRlZFJvdXRlU25hcHNob3QpIHt9XG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMuc25hcHNob3Qucm91dGVDb25maWcgJiYgdGhpcy5zbmFwc2hvdC5yb3V0ZUNvbmZpZy5wYXRoIHx8ICcnO1xuICAgIHJldHVybiBgQWN0aXZhdGlvblN0YXJ0KHBhdGg6ICcke3BhdGh9JylgO1xuICB9XG59XG5cbi8qKlxuICogQW4gZXZlbnQgdHJpZ2dlcmVkIGF0IHRoZSBlbmQgb2YgdGhlIGFjdGl2YXRpb24gcGFydFxuICogb2YgdGhlIFJlc29sdmUgcGhhc2Ugb2Ygcm91dGluZy5cbiAqIEBzZWUgYEFjdGl2YXRpb25TdGFydGBcbiAqIEBzZWUgYFJlc29sdmVTdGFydGBcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBBY3RpdmF0aW9uRW5kIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgICAgcHVibGljIHNuYXBzaG90OiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90KSB7fVxuICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLnNuYXBzaG90LnJvdXRlQ29uZmlnICYmIHRoaXMuc25hcHNob3Qucm91dGVDb25maWcucGF0aCB8fCAnJztcbiAgICByZXR1cm4gYEFjdGl2YXRpb25FbmQocGF0aDogJyR7cGF0aH0nKWA7XG4gIH1cbn1cblxuLyoqXG4gKiBBbiBldmVudCB0cmlnZ2VyZWQgYnkgc2Nyb2xsaW5nLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIFNjcm9sbCB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICAgIHJlYWRvbmx5IHJvdXRlckV2ZW50OiBOYXZpZ2F0aW9uRW5kLFxuXG4gICAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgICAgcmVhZG9ubHkgcG9zaXRpb246IFtudW1iZXIsIG51bWJlcl18bnVsbCxcblxuICAgICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICAgIHJlYWRvbmx5IGFuY2hvcjogc3RyaW5nfG51bGwpIHt9XG5cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICBjb25zdCBwb3MgPSB0aGlzLnBvc2l0aW9uID8gYCR7dGhpcy5wb3NpdGlvblswXX0sICR7dGhpcy5wb3NpdGlvblsxXX1gIDogbnVsbDtcbiAgICByZXR1cm4gYFNjcm9sbChhbmNob3I6ICcke3RoaXMuYW5jaG9yfScsIHBvc2l0aW9uOiAnJHtwb3N9JylgO1xuICB9XG59XG5cbi8qKlxuICogUm91dGVyIGV2ZW50cyB0aGF0IGFsbG93IHlvdSB0byB0cmFjayB0aGUgbGlmZWN5Y2xlIG9mIHRoZSByb3V0ZXIuXG4gKlxuICogVGhlIGV2ZW50cyBvY2N1ciBpbiB0aGUgZm9sbG93aW5nIHNlcXVlbmNlOlxuICpcbiAqICogW05hdmlnYXRpb25TdGFydF0oYXBpL3JvdXRlci9OYXZpZ2F0aW9uU3RhcnQpOiBOYXZpZ2F0aW9uIHN0YXJ0cy5cbiAqICogW1JvdXRlQ29uZmlnTG9hZFN0YXJ0XShhcGkvcm91dGVyL1JvdXRlQ29uZmlnTG9hZFN0YXJ0KTogQmVmb3JlXG4gKiB0aGUgcm91dGVyIFtsYXp5IGxvYWRzXSgvZ3VpZGUvcm91dGVyI2xhenktbG9hZGluZykgYSByb3V0ZSBjb25maWd1cmF0aW9uLlxuICogKiBbUm91dGVDb25maWdMb2FkRW5kXShhcGkvcm91dGVyL1JvdXRlQ29uZmlnTG9hZEVuZCk6IEFmdGVyIGEgcm91dGUgaGFzIGJlZW4gbGF6eSBsb2FkZWQuXG4gKiAqIFtSb3V0ZXNSZWNvZ25pemVkXShhcGkvcm91dGVyL1JvdXRlc1JlY29nbml6ZWQpOiBXaGVuIHRoZSByb3V0ZXIgcGFyc2VzIHRoZSBVUkxcbiAqIGFuZCB0aGUgcm91dGVzIGFyZSByZWNvZ25pemVkLlxuICogKiBbR3VhcmRzQ2hlY2tTdGFydF0oYXBpL3JvdXRlci9HdWFyZHNDaGVja1N0YXJ0KTogV2hlbiB0aGUgcm91dGVyIGJlZ2lucyB0aGUgKmd1YXJkcypcbiAqIHBoYXNlIG9mIHJvdXRpbmcuXG4gKiAqIFtDaGlsZEFjdGl2YXRpb25TdGFydF0oYXBpL3JvdXRlci9DaGlsZEFjdGl2YXRpb25TdGFydCk6IFdoZW4gdGhlIHJvdXRlclxuICogYmVnaW5zIGFjdGl2YXRpbmcgYSByb3V0ZSdzIGNoaWxkcmVuLlxuICogKiBbQWN0aXZhdGlvblN0YXJ0XShhcGkvcm91dGVyL0FjdGl2YXRpb25TdGFydCk6IFdoZW4gdGhlIHJvdXRlciBiZWdpbnMgYWN0aXZhdGluZyBhIHJvdXRlLlxuICogKiBbR3VhcmRzQ2hlY2tFbmRdKGFwaS9yb3V0ZXIvR3VhcmRzQ2hlY2tFbmQpOiBXaGVuIHRoZSByb3V0ZXIgZmluaXNoZXMgdGhlICpndWFyZHMqXG4gKiBwaGFzZSBvZiByb3V0aW5nIHN1Y2Nlc3NmdWxseS5cbiAqICogW1Jlc29sdmVTdGFydF0oYXBpL3JvdXRlci9SZXNvbHZlU3RhcnQpOiBXaGVuIHRoZSByb3V0ZXIgYmVnaW5zIHRoZSAqcmVzb2x2ZSpcbiAqIHBoYXNlIG9mIHJvdXRpbmcuXG4gKiAqIFtSZXNvbHZlRW5kXShhcGkvcm91dGVyL1Jlc29sdmVFbmQpOiBXaGVuIHRoZSByb3V0ZXIgZmluaXNoZXMgdGhlICpyZXNvbHZlKlxuICogcGhhc2Ugb2Ygcm91dGluZyBzdWNjZXNzZnVseS5cbiAqICogW0NoaWxkQWN0aXZhdGlvbkVuZF0oYXBpL3JvdXRlci9DaGlsZEFjdGl2YXRpb25FbmQpOiBXaGVuIHRoZSByb3V0ZXIgZmluaXNoZXNcbiAqIGFjdGl2YXRpbmcgYSByb3V0ZSdzIGNoaWxkcmVuLlxuICogKiBbQWN0aXZhdGlvbkVuZF0oYXBpL3JvdXRlci9BY3RpdmF0aW9uRW5kKTogV2hlbiB0aGUgcm91dGVyIGZpbmlzaGVzIGFjdGl2YXRpbmcgYSByb3V0ZS5cbiAqICogW05hdmlnYXRpb25FbmRdKGFwaS9yb3V0ZXIvTmF2aWdhdGlvbkVuZCk6IFdoZW4gbmF2aWdhdGlvbiBlbmRzIHN1Y2Nlc3NmdWxseS5cbiAqICogW05hdmlnYXRpb25DYW5jZWxdKGFwaS9yb3V0ZXIvTmF2aWdhdGlvbkNhbmNlbCk6IFdoZW4gbmF2aWdhdGlvbiBpcyBjYW5jZWxlZC5cbiAqICogW05hdmlnYXRpb25FcnJvcl0oYXBpL3JvdXRlci9OYXZpZ2F0aW9uRXJyb3IpOiBXaGVuIG5hdmlnYXRpb24gZmFpbHNcbiAqIGR1ZSB0byBhbiB1bmV4cGVjdGVkIGVycm9yLlxuICogKiBbU2Nyb2xsXShhcGkvcm91dGVyL1Njcm9sbCk6IFdoZW4gdGhlIHVzZXIgc2Nyb2xscy5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCB0eXBlIEV2ZW50ID0gUm91dGVyRXZlbnR8Um91dGVDb25maWdMb2FkU3RhcnR8Um91dGVDb25maWdMb2FkRW5kfENoaWxkQWN0aXZhdGlvblN0YXJ0fFxuICAgIENoaWxkQWN0aXZhdGlvbkVuZHxBY3RpdmF0aW9uU3RhcnR8QWN0aXZhdGlvbkVuZHxTY3JvbGw7XG4iXX0=