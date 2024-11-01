/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export const IMPERATIVE_NAVIGATION = 'imperative';
/**
 * Identifies the type of a router event.
 *
 * @publicApi
 */
export var EventType;
(function (EventType) {
    EventType[EventType["NavigationStart"] = 0] = "NavigationStart";
    EventType[EventType["NavigationEnd"] = 1] = "NavigationEnd";
    EventType[EventType["NavigationCancel"] = 2] = "NavigationCancel";
    EventType[EventType["NavigationError"] = 3] = "NavigationError";
    EventType[EventType["RoutesRecognized"] = 4] = "RoutesRecognized";
    EventType[EventType["ResolveStart"] = 5] = "ResolveStart";
    EventType[EventType["ResolveEnd"] = 6] = "ResolveEnd";
    EventType[EventType["GuardsCheckStart"] = 7] = "GuardsCheckStart";
    EventType[EventType["GuardsCheckEnd"] = 8] = "GuardsCheckEnd";
    EventType[EventType["RouteConfigLoadStart"] = 9] = "RouteConfigLoadStart";
    EventType[EventType["RouteConfigLoadEnd"] = 10] = "RouteConfigLoadEnd";
    EventType[EventType["ChildActivationStart"] = 11] = "ChildActivationStart";
    EventType[EventType["ChildActivationEnd"] = 12] = "ChildActivationEnd";
    EventType[EventType["ActivationStart"] = 13] = "ActivationStart";
    EventType[EventType["ActivationEnd"] = 14] = "ActivationEnd";
    EventType[EventType["Scroll"] = 15] = "Scroll";
    EventType[EventType["NavigationSkipped"] = 16] = "NavigationSkipped";
})(EventType || (EventType = {}));
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
 *        filter((e: Event | RouterEvent): e is RouterEvent => e instanceof RouterEvent)
 *     ).subscribe((e: RouterEvent) => {
 *       // Do something
 *     });
 *   }
 * }
 * ```
 *
 * @see {@link Event}
 * @see [Router events summary](guide/routing/router-reference#router-events)
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
        this.type = EventType.NavigationStart;
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
 * @see {@link NavigationStart}
 * @see {@link NavigationCancel}
 * @see {@link NavigationError}
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
        this.type = EventType.NavigationEnd;
    }
    /** @docsNotRequired */
    toString() {
        return `NavigationEnd(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}')`;
    }
}
/**
 * A code for the `NavigationCancel` event of the `Router` to indicate the
 * reason a navigation failed.
 *
 * @publicApi
 */
export var NavigationCancellationCode;
(function (NavigationCancellationCode) {
    /**
     * A navigation failed because a guard returned a `UrlTree` to redirect.
     */
    NavigationCancellationCode[NavigationCancellationCode["Redirect"] = 0] = "Redirect";
    /**
     * A navigation failed because a more recent navigation started.
     */
    NavigationCancellationCode[NavigationCancellationCode["SupersededByNewNavigation"] = 1] = "SupersededByNewNavigation";
    /**
     * A navigation failed because one of the resolvers completed without emitting a value.
     */
    NavigationCancellationCode[NavigationCancellationCode["NoDataFromResolver"] = 2] = "NoDataFromResolver";
    /**
     * A navigation failed because a guard returned `false`.
     */
    NavigationCancellationCode[NavigationCancellationCode["GuardRejected"] = 3] = "GuardRejected";
})(NavigationCancellationCode || (NavigationCancellationCode = {}));
/**
 * A code for the `NavigationSkipped` event of the `Router` to indicate the
 * reason a navigation was skipped.
 *
 * @publicApi
 */
export var NavigationSkippedCode;
(function (NavigationSkippedCode) {
    /**
     * A navigation was skipped because the navigation URL was the same as the current Router URL.
     */
    NavigationSkippedCode[NavigationSkippedCode["IgnoredSameUrlNavigation"] = 0] = "IgnoredSameUrlNavigation";
    /**
     * A navigation was skipped because the configured `UrlHandlingStrategy` return `false` for both
     * the current Router URL and the target of the navigation.
     *
     * @see {@link UrlHandlingStrategy}
     */
    NavigationSkippedCode[NavigationSkippedCode["IgnoredByUrlHandlingStrategy"] = 1] = "IgnoredByUrlHandlingStrategy";
})(NavigationSkippedCode || (NavigationSkippedCode = {}));
/**
 * An event triggered when a navigation is canceled, directly or indirectly.
 * This can happen for several reasons including when a route guard
 * returns `false` or initiates a redirect by returning a `UrlTree`.
 *
 * @see {@link NavigationStart}
 * @see {@link NavigationEnd}
 * @see {@link NavigationError}
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
        this.type = EventType.NavigationCancel;
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
        this.type = EventType.NavigationSkipped;
    }
}
/**
 * An event triggered when a navigation fails due to an unexpected error.
 *
 * @see {@link NavigationStart}
 * @see {@link NavigationEnd}
 * @see {@link NavigationCancel}
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
        this.type = EventType.NavigationError;
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
        this.type = EventType.RoutesRecognized;
    }
    /** @docsNotRequired */
    toString() {
        return `RoutesRecognized(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}', state: ${this.state})`;
    }
}
/**
 * An event triggered at the start of the Guard phase of routing.
 *
 * @see {@link GuardsCheckEnd}
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
        this.type = EventType.GuardsCheckStart;
    }
    toString() {
        return `GuardsCheckStart(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}', state: ${this.state})`;
    }
}
/**
 * An event triggered at the end of the Guard phase of routing.
 *
 * @see {@link GuardsCheckStart}
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
        this.type = EventType.GuardsCheckEnd;
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
 * @see {@link ResolveEnd}
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
        this.type = EventType.ResolveStart;
    }
    toString() {
        return `ResolveStart(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}', state: ${this.state})`;
    }
}
/**
 * An event triggered at the end of the Resolve phase of routing.
 * @see {@link ResolveStart}
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
        this.type = EventType.ResolveEnd;
    }
    toString() {
        return `ResolveEnd(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}', state: ${this.state})`;
    }
}
/**
 * An event triggered before lazy loading a route configuration.
 *
 * @see {@link RouteConfigLoadEnd}
 *
 * @publicApi
 */
export class RouteConfigLoadStart {
    constructor(
    /** @docsNotRequired */
    route) {
        this.route = route;
        this.type = EventType.RouteConfigLoadStart;
    }
    toString() {
        return `RouteConfigLoadStart(path: ${this.route.path})`;
    }
}
/**
 * An event triggered when a route has been lazy loaded.
 *
 * @see {@link RouteConfigLoadStart}
 *
 * @publicApi
 */
export class RouteConfigLoadEnd {
    constructor(
    /** @docsNotRequired */
    route) {
        this.route = route;
        this.type = EventType.RouteConfigLoadEnd;
    }
    toString() {
        return `RouteConfigLoadEnd(path: ${this.route.path})`;
    }
}
/**
 * An event triggered at the start of the child-activation
 * part of the Resolve phase of routing.
 * @see {@link ChildActivationEnd}
 * @see {@link ResolveStart}
 *
 * @publicApi
 */
export class ChildActivationStart {
    constructor(
    /** @docsNotRequired */
    snapshot) {
        this.snapshot = snapshot;
        this.type = EventType.ChildActivationStart;
    }
    toString() {
        const path = (this.snapshot.routeConfig && this.snapshot.routeConfig.path) || '';
        return `ChildActivationStart(path: '${path}')`;
    }
}
/**
 * An event triggered at the end of the child-activation part
 * of the Resolve phase of routing.
 * @see {@link ChildActivationStart}
 * @see {@link ResolveStart}
 * @publicApi
 */
export class ChildActivationEnd {
    constructor(
    /** @docsNotRequired */
    snapshot) {
        this.snapshot = snapshot;
        this.type = EventType.ChildActivationEnd;
    }
    toString() {
        const path = (this.snapshot.routeConfig && this.snapshot.routeConfig.path) || '';
        return `ChildActivationEnd(path: '${path}')`;
    }
}
/**
 * An event triggered at the start of the activation part
 * of the Resolve phase of routing.
 * @see {@link ActivationEnd}
 * @see {@link ResolveStart}
 *
 * @publicApi
 */
export class ActivationStart {
    constructor(
    /** @docsNotRequired */
    snapshot) {
        this.snapshot = snapshot;
        this.type = EventType.ActivationStart;
    }
    toString() {
        const path = (this.snapshot.routeConfig && this.snapshot.routeConfig.path) || '';
        return `ActivationStart(path: '${path}')`;
    }
}
/**
 * An event triggered at the end of the activation part
 * of the Resolve phase of routing.
 * @see {@link ActivationStart}
 * @see {@link ResolveStart}
 *
 * @publicApi
 */
export class ActivationEnd {
    constructor(
    /** @docsNotRequired */
    snapshot) {
        this.snapshot = snapshot;
        this.type = EventType.ActivationEnd;
    }
    toString() {
        const path = (this.snapshot.routeConfig && this.snapshot.routeConfig.path) || '';
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
        this.type = EventType.Scroll;
    }
    toString() {
        const pos = this.position ? `${this.position[0]}, ${this.position[1]}` : null;
        return `Scroll(anchor: '${this.anchor}', position: '${pos}')`;
    }
}
export class BeforeActivateRoutes {
}
export class RedirectRequest {
    constructor(url, navigationBehaviorOptions) {
        this.url = url;
        this.navigationBehaviorOptions = navigationBehaviorOptions;
    }
}
export function stringifyEvent(routerEvent) {
    switch (routerEvent.type) {
        case EventType.ActivationEnd:
            return `ActivationEnd(path: '${routerEvent.snapshot.routeConfig?.path || ''}')`;
        case EventType.ActivationStart:
            return `ActivationStart(path: '${routerEvent.snapshot.routeConfig?.path || ''}')`;
        case EventType.ChildActivationEnd:
            return `ChildActivationEnd(path: '${routerEvent.snapshot.routeConfig?.path || ''}')`;
        case EventType.ChildActivationStart:
            return `ChildActivationStart(path: '${routerEvent.snapshot.routeConfig?.path || ''}')`;
        case EventType.GuardsCheckEnd:
            return `GuardsCheckEnd(id: ${routerEvent.id}, url: '${routerEvent.url}', urlAfterRedirects: '${routerEvent.urlAfterRedirects}', state: ${routerEvent.state}, shouldActivate: ${routerEvent.shouldActivate})`;
        case EventType.GuardsCheckStart:
            return `GuardsCheckStart(id: ${routerEvent.id}, url: '${routerEvent.url}', urlAfterRedirects: '${routerEvent.urlAfterRedirects}', state: ${routerEvent.state})`;
        case EventType.NavigationCancel:
            return `NavigationCancel(id: ${routerEvent.id}, url: '${routerEvent.url}')`;
        case EventType.NavigationSkipped:
            return `NavigationSkipped(id: ${routerEvent.id}, url: '${routerEvent.url}')`;
        case EventType.NavigationEnd:
            return `NavigationEnd(id: ${routerEvent.id}, url: '${routerEvent.url}', urlAfterRedirects: '${routerEvent.urlAfterRedirects}')`;
        case EventType.NavigationError:
            return `NavigationError(id: ${routerEvent.id}, url: '${routerEvent.url}', error: ${routerEvent.error})`;
        case EventType.NavigationStart:
            return `NavigationStart(id: ${routerEvent.id}, url: '${routerEvent.url}')`;
        case EventType.ResolveEnd:
            return `ResolveEnd(id: ${routerEvent.id}, url: '${routerEvent.url}', urlAfterRedirects: '${routerEvent.urlAfterRedirects}', state: ${routerEvent.state})`;
        case EventType.ResolveStart:
            return `ResolveStart(id: ${routerEvent.id}, url: '${routerEvent.url}', urlAfterRedirects: '${routerEvent.urlAfterRedirects}', state: ${routerEvent.state})`;
        case EventType.RouteConfigLoadEnd:
            return `RouteConfigLoadEnd(path: ${routerEvent.route.path})`;
        case EventType.RouteConfigLoadStart:
            return `RouteConfigLoadStart(path: ${routerEvent.route.path})`;
        case EventType.RoutesRecognized:
            return `RoutesRecognized(id: ${routerEvent.id}, url: '${routerEvent.url}', urlAfterRedirects: '${routerEvent.urlAfterRedirects}', state: ${routerEvent.state})`;
        case EventType.Scroll:
            const pos = routerEvent.position
                ? `${routerEvent.position[0]}, ${routerEvent.position[1]}`
                : null;
            return `Scroll(anchor: '${routerEvent.anchor}', position: '${pos}')`;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvcm91dGVyL3NyYy9ldmVudHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBZ0JILE1BQU0sQ0FBQyxNQUFNLHFCQUFxQixHQUFHLFlBQVksQ0FBQztBQUVsRDs7OztHQUlHO0FBQ0gsTUFBTSxDQUFOLElBQVksU0FrQlg7QUFsQkQsV0FBWSxTQUFTO0lBQ25CLCtEQUFlLENBQUE7SUFDZiwyREFBYSxDQUFBO0lBQ2IsaUVBQWdCLENBQUE7SUFDaEIsK0RBQWUsQ0FBQTtJQUNmLGlFQUFnQixDQUFBO0lBQ2hCLHlEQUFZLENBQUE7SUFDWixxREFBVSxDQUFBO0lBQ1YsaUVBQWdCLENBQUE7SUFDaEIsNkRBQWMsQ0FBQTtJQUNkLHlFQUFvQixDQUFBO0lBQ3BCLHNFQUFrQixDQUFBO0lBQ2xCLDBFQUFvQixDQUFBO0lBQ3BCLHNFQUFrQixDQUFBO0lBQ2xCLGdFQUFlLENBQUE7SUFDZiw0REFBYSxDQUFBO0lBQ2IsOENBQU0sQ0FBQTtJQUNOLG9FQUFpQixDQUFBO0FBQ25CLENBQUMsRUFsQlcsU0FBUyxLQUFULFNBQVMsUUFrQnBCO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBdUJHO0FBQ0gsTUFBTSxPQUFPLFdBQVc7SUFDdEI7SUFDRSxzRUFBc0U7SUFDL0QsRUFBVTtJQUNqQiwyREFBMkQ7SUFDcEQsR0FBVztRQUZYLE9BQUUsR0FBRixFQUFFLENBQVE7UUFFVixRQUFHLEdBQUgsR0FBRyxDQUFRO0lBQ2pCLENBQUM7Q0FDTDtBQUVEOzs7O0dBSUc7QUFDSCxNQUFNLE9BQU8sZUFBZ0IsU0FBUSxXQUFXO0lBZ0M5QztJQUNFLHVCQUF1QjtJQUN2QixFQUFVO0lBQ1YsdUJBQXVCO0lBQ3ZCLEdBQVc7SUFDWCx1QkFBdUI7SUFDdkIsb0JBQXVDLFlBQVk7SUFDbkQsdUJBQXVCO0lBQ3ZCLGdCQUFpRSxJ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aUIsYUFBYSxXQUFXLENBQUMsS0FBSyxHQUFHLENBQUM7UUFDOUosS0FBSyxTQUFTLENBQUMsa0JBQWtCO1lBQy9CLE9BQU8sNEJBQTRCLFdBQVcsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLENBQUM7UUFDL0QsS0FBSyxTQUFTLENBQUMsb0JBQW9CO1lBQ2pDLE9BQU8sOEJBQThCLFdBQVcsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLENBQUM7UUFDakUsS0FBSyxTQUFTLENBQUMsZ0JBQWdCO1lBQzdCLE9BQU8sd0JBQXdCLFdBQVcsQ0FBQyxFQUFFLFdBQVcsV0FBVyxDQUFDLEdBQUcsMEJBQTBCLFdBQVcsQ0FBQyxpQkFBaUIsYUFBYSxXQUFXLENBQUMsS0FBSyxHQUFHLENBQUM7UUFDbEssS0FBSyxTQUFTLENBQUMsTUFBTTtZQUNuQixNQUFNLEdBQUcsR0FBRyxXQUFXLENBQUMsUUFBUTtnQkFDOUIsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUMxRCxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQ1QsT0FBTyxtQkFBbUIsV0FBVyxDQUFDLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDO0lBQ3pFLENBQUM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge05hdmlnYXRpb25CZWhhdmlvck9wdGlvbnMsIFJvdXRlfSBmcm9tICcuL21vZGVscyc7XG5pbXBvcnQge0FjdGl2YXRlZFJvdXRlU25hcHNob3QsIFJvdXRlclN0YXRlU25hcHNob3R9IGZyb20gJy4vcm91dGVyX3N0YXRlJztcbmltcG9ydCB7VXJsVHJlZX0gZnJvbSAnLi91cmxfdHJlZSc7XG5cbi8qKlxuICogSWRlbnRpZmllcyB0aGUgY2FsbCBvciBldmVudCB0aGF0IHRyaWdnZXJlZCBhIG5hdmlnYXRpb24uXG4gKlxuICogKiAnaW1wZXJhdGl2ZSc6IFRyaWdnZXJlZCBieSBgcm91dGVyLm5hdmlnYXRlQnlVcmwoKWAgb3IgYHJvdXRlci5uYXZpZ2F0ZSgpYC5cbiAqICogJ3BvcHN0YXRlJyA6IFRyaWdnZXJlZCBieSBhIGBwb3BzdGF0ZWAgZXZlbnQuXG4gKiAqICdoYXNoY2hhbmdlJy06IFRyaWdnZXJlZCBieSBhIGBoYXNoY2hhbmdlYCBldmVudC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCB0eXBlIE5hdmlnYXRpb25UcmlnZ2VyID0gJ2ltcGVyYXRpdmUnIHwgJ3BvcHN0YXRlJyB8ICdoYXNoY2hhbmdlJztcbmV4cG9ydCBjb25zdCBJTVBFUkFUSVZFX05BVklHQVRJT04gPSAnaW1wZXJhdGl2ZSc7XG5cbi8qKlxuICogSWRlbnRpZmllcyB0aGUgdHlwZSBvZiBhIHJvdXRlciBldmVudC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBlbnVtIEV2ZW50VHlwZSB7XG4gIE5hdmlnYXRpb25TdGFydCxcbiAgTmF2aWdhdGlvbkVuZCxcbiAgTmF2aWdhdGlvbkNhbmNlbCxcbiAgTmF2aWdhdGlvbkVycm9yLFxuICBSb3V0ZXNSZWNvZ25pemVkLFxuICBSZXNvbHZlU3RhcnQsXG4gIFJlc29sdmVFbmQsXG4gIEd1YXJkc0NoZWNrU3RhcnQsXG4gIEd1YXJkc0NoZWNrRW5kLFxuICBSb3V0ZUNvbmZpZ0xvYWRTdGFydCxcbiAgUm91dGVDb25maWdMb2FkRW5kLFxuICBDaGlsZEFjdGl2YXRpb25TdGFydCxcbiAgQ2hpbGRBY3RpdmF0aW9uRW5kLFxuICBBY3RpdmF0aW9uU3RhcnQsXG4gIEFjdGl2YXRpb25FbmQsXG4gIFNjcm9sbCxcbiAgTmF2aWdhdGlvblNraXBwZWQsXG59XG5cbi8qKlxuICogQmFzZSBmb3IgZXZlbnRzIHRoZSByb3V0ZXIgZ29lcyB0aHJvdWdoLCBhcyBvcHBvc2VkIHRvIGV2ZW50cyB0aWVkIHRvIGEgc3BlY2lmaWNcbiAqIHJvdXRlLiBGaXJlZCBvbmUgdGltZSBmb3IgYW55IGdpdmVuIG5hdmlnYXRpb24uXG4gKlxuICogVGhlIGZvbGxvd2luZyBjb2RlIHNob3dzIGhvdyBhIGNsYXNzIHN1YnNjcmliZXMgdG8gcm91dGVyIGV2ZW50cy5cbiAqXG4gKiBgYGB0c1xuICogaW1wb3J0IHtFdmVudCwgUm91dGVyRXZlbnQsIFJvdXRlcn0gZnJvbSAnQGFuZ3VsYXIvcm91dGVyJztcbiAqXG4gKiBjbGFzcyBNeVNlcnZpY2Uge1xuICogICBjb25zdHJ1Y3RvcihwdWJsaWMgcm91dGVyOiBSb3V0ZXIpIHtcbiAqICAgICByb3V0ZXIuZXZlbnRzLnBpcGUoXG4gKiAgICAgICAgZmlsdGVyKChlOiBFdmVudCB8IFJvdXRlckV2ZW50KTogZSBpcyBSb3V0ZXJFdmVudCA9PiBlIGluc3RhbmNlb2YgUm91dGVyRXZlbnQpXG4gKiAgICAgKS5zdWJzY3JpYmUoKGU6IFJvdXRlckV2ZW50KSA9PiB7XG4gKiAgICAgICAvLyBEbyBzb21ldGhpbmdcbiAqICAgICB9KTtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogQHNlZSB7QGxpbmsgRXZlbnR9XG4gKiBAc2VlIFtSb3V0ZXIgZXZlbnRzIHN1bW1hcnldKGd1aWRlL3JvdXRpbmcvcm91dGVyLXJlZmVyZW5jZSNyb3V0ZXItZXZlbnRzKVxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgUm91dGVyRXZlbnQge1xuICBjb25zdHJ1Y3RvcihcbiAgICAvKiogQSB1bmlxdWUgSUQgdGhhdCB0aGUgcm91dGVyIGFzc2lnbnMgdG8gZXZlcnkgcm91dGVyIG5hdmlnYXRpb24uICovXG4gICAgcHVibGljIGlkOiBudW1iZXIsXG4gICAgLyoqIFRoZSBVUkwgdGhhdCBpcyB0aGUgZGVzdGluYXRpb24gZm9yIHRoaXMgbmF2aWdhdGlvbi4gKi9cbiAgICBwdWJsaWMgdXJsOiBzdHJpbmcsXG4gICkge31cbn1cblxuLyoqXG4gKiBBbiBldmVudCB0cmlnZ2VyZWQgd2hlbiBhIG5hdmlnYXRpb24gc3RhcnRzLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIE5hdmlnYXRpb25TdGFydCBleHRlbmRzIFJvdXRlckV2ZW50IHtcbiAgcmVhZG9ubHkgdHlwZSA9IEV2ZW50VHlwZS5OYXZpZ2F0aW9uU3RhcnQ7XG5cbiAgLyoqXG4gICAqIElkZW50aWZpZXMgdGhlIGNhbGwgb3IgZXZlbnQgdGhhdCB0cmlnZ2VyZWQgdGhlIG5hdmlnYXRpb24uXG4gICAqIEFuIGBpbXBlcmF0aXZlYCB0cmlnZ2VyIGlzIGEgY2FsbCB0byBgcm91dGVyLm5hdmlnYXRlQnlVcmwoKWAgb3IgYHJvdXRlci5uYXZpZ2F0ZSgpYC5cbiAgICpcbiAgICogQHNlZSB7QGxpbmsgTmF2aWdhdGlvbkVuZH1cbiAgICogQHNlZSB7QGxpbmsgTmF2aWdhdGlvbkNhbmNlbH1cbiAgICogQHNlZSB7QGxpbmsgTmF2aWdhdGlvbkVycm9yfVxuICAgKi9cbiAgbmF2aWdhdGlvblRyaWdnZXI/OiBOYXZpZ2F0aW9uVHJpZ2dlcjtcblxuICAvKipcbiAgICogVGhlIG5hdmlnYXRpb24gc3RhdGUgdGhhdCB3YXMgcHJldmlvdXNseSBzdXBwbGllZCB0byB0aGUgYHB1c2hTdGF0ZWAgY2FsbCxcbiAgICogd2hlbiB0aGUgbmF2aWdhdGlvbiBpcyB0cmlnZ2VyZWQgYnkgYSBgcG9wc3RhdGVgIGV2ZW50LiBPdGhlcndpc2UgbnVsbC5cbiAgICpcbiAgICogVGhlIHN0YXRlIG9iamVjdCBpcyBkZWZpbmVkIGJ5IGBOYXZpZ2F0aW9uRXh0cmFzYCwgYW5kIGNvbnRhaW5zIGFueVxuICAgKiBkZXZlbG9wZXItZGVmaW5lZCBzdGF0ZSB2YWx1ZSwgYXMgd2VsbCBhcyBhIHVuaXF1ZSBJRCB0aGF0XG4gICAqIHRoZSByb3V0ZXIgYXNzaWducyB0byBldmVyeSByb3V0ZXIgdHJhbnNpdGlvbi9uYXZpZ2F0aW9uLlxuICAgKlxuICAgKiBGcm9tIHRoZSBwZXJzcGVjdGl2ZSBvZiB0aGUgcm91dGVyLCB0aGUgcm91dGVyIG5ldmVyIFwiZ29lcyBiYWNrXCIuXG4gICAqIFdoZW4gdGhlIHVzZXIgY2xpY2tzIG9uIHRoZSBiYWNrIGJ1dHRvbiBpbiB0aGUgYnJvd3NlcixcbiAgICogYSBuZXcgbmF2aWdhdGlvbiBJRCBpcyBjcmVhdGVkLlxuICAgKlxuICAgKiBVc2UgdGhlIElEIGluIHRoaXMgcHJldmlvdXMtc3RhdGUgb2JqZWN0IHRvIGRpZmZlcmVudGlhdGUgYmV0d2VlbiBhIG5ld2x5IGNyZWF0ZWRcbiAgICogc3RhdGUgYW5kIG9uZSByZXR1cm5lZCB0byBieSBhIGBwb3BzdGF0ZWAgZXZlbnQsIHNvIHRoYXQgeW91IGNhbiByZXN0b3JlIHNvbWVcbiAgICogcmVtZW1iZXJlZCBzdGF0ZSwgc3VjaCBhcyBzY3JvbGwgcG9zaXRpb24uXG4gICAqXG4gICAqL1xuICByZXN0b3JlZFN0YXRlPzoge1trOiBzdHJpbmddOiBhbnk7IG5hdmlnYXRpb25JZDogbnVtYmVyfSB8IG51bGw7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICBpZDogbnVtYmVyLFxuICAgIC8qKiBAZG9jc05vdFJlcXVpcmVkICovXG4gICAgdXJsOiBzdHJpbmcsXG4gICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICBuYXZpZ2F0aW9uVHJpZ2dlcjogTmF2aWdhdGlvblRyaWdnZXIgPSAnaW1wZXJhdGl2ZScsXG4gICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICByZXN0b3JlZFN0YXRlOiB7W2s6IHN0cmluZ106IGFueTsgbmF2aWdhdGlvbklkOiBudW1iZXJ9IHwgbnVsbCA9IG51bGwsXG4gICkge1xuICAgIHN1cGVyKGlkLCB1cmwpO1xuICAgIHRoaXMubmF2aWdhdGlvblRyaWdnZXIgPSBuYXZpZ2F0aW9uVHJpZ2dlcjtcbiAgICB0aGlzLnJlc3RvcmVkU3RhdGUgPSByZXN0b3JlZFN0YXRlO1xuICB9XG5cbiAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgb3ZlcnJpZGUgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYE5hdmlnYXRpb25TdGFydChpZDogJHt0aGlzLmlkfSwgdXJsOiAnJHt0aGlzLnVybH0nKWA7XG4gIH1cbn1cblxuLyoqXG4gKiBBbiBldmVudCB0cmlnZ2VyZWQgd2hlbiBhIG5hdmlnYXRpb24gZW5kcyBzdWNjZXNzZnVsbHkuXG4gKlxuICogQHNlZSB7QGxpbmsgTmF2aWdhdGlvblN0YXJ0fVxuICogQHNlZSB7QGxpbmsgTmF2aWdhdGlvbkNhbmNlbH1cbiAqIEBzZWUge0BsaW5rIE5hdmlnYXRpb25FcnJvcn1cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBOYXZpZ2F0aW9uRW5kIGV4dGVuZHMgUm91dGVyRXZlbnQge1xuICByZWFkb25seSB0eXBlID0gRXZlbnRUeXBlLk5hdmlnYXRpb25FbmQ7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICBpZDogbnVtYmVyLFxuICAgIC8qKiBAZG9jc05vdFJlcXVpcmVkICovXG4gICAgdXJsOiBzdHJpbmcsXG4gICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICBwdWJsaWMgdXJsQWZ0ZXJSZWRpcmVjdHM6IHN0cmluZyxcbiAgKSB7XG4gICAgc3VwZXIoaWQsIHVybCk7XG4gIH1cblxuICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICBvdmVycmlkZSB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiBgTmF2aWdhdGlvbkVuZChpZDogJHt0aGlzLmlkfSwgdXJsOiAnJHt0aGlzLnVybH0nLCB1cmxBZnRlclJlZGlyZWN0czogJyR7dGhpcy51cmxBZnRlclJlZGlyZWN0c30nKWA7XG4gIH1cbn1cblxuLyoqXG4gKiBBIGNvZGUgZm9yIHRoZSBgTmF2aWdhdGlvbkNhbmNlbGAgZXZlbnQgb2YgdGhlIGBSb3V0ZXJgIHRvIGluZGljYXRlIHRoZVxuICogcmVhc29uIGEgbmF2aWdhdGlvbiBmYWlsZWQuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZW51bSBOYXZpZ2F0aW9uQ2FuY2VsbGF0aW9uQ29kZSB7XG4gIC8qKlxuICAgKiBBIG5hdmlnYXRpb24gZmFpbGVkIGJlY2F1c2UgYSBndWFyZCByZXR1cm5lZCBhIGBVcmxUcmVlYCB0byByZWRpcmVjdC5cbiAgICovXG4gIFJlZGlyZWN0LFxuICAvKipcbiAgICogQSBuYXZpZ2F0aW9uIGZhaWxlZCBiZWNhdXNlIGEgbW9yZSByZWNlbnQgbmF2aWdhdGlvbiBzdGFydGVkLlxuICAgKi9cbiAgU3VwZXJzZWRlZEJ5TmV3TmF2aWdhdGlvbixcbiAgLyoqXG4gICAqIEEgbmF2aWdhdGlvbiBmYWlsZWQgYmVjYXVzZSBvbmUgb2YgdGhlIHJlc29sdmVycyBjb21wbGV0ZWQgd2l0aG91dCBlbWl0dGluZyBhIHZhbHVlLlxuICAgKi9cbiAgTm9EYXRhRnJvbVJlc29sdmVyLFxuICAvKipcbiAgICogQSBuYXZpZ2F0aW9uIGZhaWxlZCBiZWNhdXNlIGEgZ3VhcmQgcmV0dXJuZWQgYGZhbHNlYC5cbiAgICovXG4gIEd1YXJkUmVqZWN0ZWQsXG59XG5cbi8qKlxuICogQSBjb2RlIGZvciB0aGUgYE5hdmlnYXRpb25Ta2lwcGVkYCBldmVudCBvZiB0aGUgYFJvdXRlcmAgdG8gaW5kaWNhdGUgdGhlXG4gKiByZWFzb24gYSBuYXZpZ2F0aW9uIHdhcyBza2lwcGVkLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGVudW0gTmF2aWdhdGlvblNraXBwZWRDb2RlIHtcbiAgLyoqXG4gICAqIEEgbmF2aWdhdGlvbiB3YXMgc2tpcHBlZCBiZWNhdXNlIHRoZSBuYXZpZ2F0aW9uIFVSTCB3YXMgdGhlIHNhbWUgYXMgdGhlIGN1cnJlbnQgUm91dGVyIFVSTC5cbiAgICovXG4gIElnbm9yZWRTYW1lVXJsTmF2aWdhdGlvbixcbiAgLyoqXG4gICAqIEEgbmF2aWdhdGlvbiB3YXMgc2tpcHBlZCBiZWNhdXNlIHRoZSBjb25maWd1cmVkIGBVcmxIYW5kbGluZ1N0cmF0ZWd5YCByZXR1cm4gYGZhbHNlYCBmb3IgYm90aFxuICAgKiB0aGUgY3VycmVudCBSb3V0ZXIgVVJMIGFuZCB0aGUgdGFyZ2V0IG9mIHRoZSBuYXZpZ2F0aW9uLlxuICAgKlxuICAgKiBAc2VlIHtAbGluayBVcmxIYW5kbGluZ1N0cmF0ZWd5fVxuICAgKi9cbiAgSWdub3JlZEJ5VXJsSGFuZGxpbmdTdHJhdGVneSxcbn1cblxuLyoqXG4gKiBBbiBldmVudCB0cmlnZ2VyZWQgd2hlbiBhIG5hdmlnYXRpb24gaXMgY2FuY2VsZWQsIGRpcmVjdGx5IG9yIGluZGlyZWN0bHkuXG4gKiBUaGlzIGNhbiBoYXBwZW4gZm9yIHNldmVyYWwgcmVhc29ucyBpbmNsdWRpbmcgd2hlbiBhIHJvdXRlIGd1YXJkXG4gKiByZXR1cm5zIGBmYWxzZWAgb3IgaW5pdGlhdGVzIGEgcmVkaXJlY3QgYnkgcmV0dXJuaW5nIGEgYFVybFRyZWVgLlxuICpcbiAqIEBzZWUge0BsaW5rIE5hdmlnYXRpb25TdGFydH1cbiAqIEBzZWUge0BsaW5rIE5hdmlnYXRpb25FbmR9XG4gKiBAc2VlIHtAbGluayBOYXZpZ2F0aW9uRXJyb3J9XG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgTmF2aWdhdGlvbkNhbmNlbCBleHRlbmRzIFJvdXRlckV2ZW50IHtcbiAgcmVhZG9ubHkgdHlwZSA9IEV2ZW50VHlwZS5OYXZpZ2F0aW9uQ2FuY2VsO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIC8qKiBAZG9jc05vdFJlcXVpcmVkICovXG4gICAgaWQ6IG51bWJlcixcbiAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgIHVybDogc3RyaW5nLFxuICAgIC8qKlxuICAgICAqIEEgZGVzY3JpcHRpb24gb2Ygd2h5IHRoZSBuYXZpZ2F0aW9uIHdhcyBjYW5jZWxsZWQuIEZvciBkZWJ1ZyBwdXJwb3NlcyBvbmx5LiBVc2UgYGNvZGVgXG4gICAgICogaW5zdGVhZCBmb3IgYSBzdGFibGUgY2FuY2VsbGF0aW9uIHJlYXNvbiB0aGF0IGNhbiBiZSB1c2VkIGluIHByb2R1Y3Rpb24uXG4gICAgICovXG4gICAgcHVibGljIHJlYXNvbjogc3RyaW5nLFxuICAgIC8qKlxuICAgICAqIEEgY29kZSB0byBpbmRpY2F0ZSB3aHkgdGhlIG5hdmlnYXRpb24gd2FzIGNhbmNlbGVkLiBUaGlzIGNhbmNlbGxhdGlvbiBjb2RlIGlzIHN0YWJsZSBmb3JcbiAgICAgKiB0aGUgcmVhc29uIGFuZCBjYW4gYmUgcmVsaWVkIG9uIHdoZXJlYXMgdGhlIGByZWFzb25gIHN0cmluZyBjb3VsZCBjaGFuZ2UgYW5kIHNob3VsZCBub3QgYmVcbiAgICAgKiB1c2VkIGluIHByb2R1Y3Rpb24uXG4gICAgICovXG4gICAgcmVhZG9ubHkgY29kZT86IE5hdmlnYXRpb25DYW5jZWxsYXRpb25Db2RlLFxuICApIHtcbiAgICBzdXBlcihpZCwgdXJsKTtcbiAgfVxuXG4gIC8qKiBAZG9jc05vdFJlcXVpcmVkICovXG4gIG92ZXJyaWRlIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBOYXZpZ2F0aW9uQ2FuY2VsKGlkOiAke3RoaXMuaWR9LCB1cmw6ICcke3RoaXMudXJsfScpYDtcbiAgfVxufVxuXG4vKipcbiAqIEFuIGV2ZW50IHRyaWdnZXJlZCB3aGVuIGEgbmF2aWdhdGlvbiBpcyBza2lwcGVkLlxuICogVGhpcyBjYW4gaGFwcGVuIGZvciBhIGNvdXBsZSByZWFzb25zIGluY2x1ZGluZyBvblNhbWVVcmxIYW5kbGluZ1xuICogaXMgc2V0IHRvIGBpZ25vcmVgIGFuZCB0aGUgbmF2aWdhdGlvbiBVUkwgaXMgbm90IGRpZmZlcmVudCB0aGFuIHRoZVxuICogY3VycmVudCBzdGF0ZS5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBOYXZpZ2F0aW9uU2tpcHBlZCBleHRlbmRzIFJvdXRlckV2ZW50IHtcbiAgcmVhZG9ubHkgdHlwZSA9IEV2ZW50VHlwZS5OYXZpZ2F0aW9uU2tpcHBlZDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgIGlkOiBudW1iZXIsXG4gICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICB1cmw6IHN0cmluZyxcbiAgICAvKipcbiAgICAgKiBBIGRlc2NyaXB0aW9uIG9mIHdoeSB0aGUgbmF2aWdhdGlvbiB3YXMgc2tpcHBlZC4gRm9yIGRlYnVnIHB1cnBvc2VzIG9ubHkuIFVzZSBgY29kZWBcbiAgICAgKiBpbnN0ZWFkIGZvciBhIHN0YWJsZSBza2lwcGVkIHJlYXNvbiB0aGF0IGNhbiBiZSB1c2VkIGluIHByb2R1Y3Rpb24uXG4gICAgICovXG4gICAgcHVibGljIHJlYXNvbjogc3RyaW5nLFxuICAgIC8qKlxuICAgICAqIEEgY29kZSB0byBpbmRpY2F0ZSB3aHkgdGhlIG5hdmlnYXRpb24gd2FzIHNraXBwZWQuIFRoaXMgY29kZSBpcyBzdGFibGUgZm9yXG4gICAgICogdGhlIHJlYXNvbiBhbmQgY2FuIGJlIHJlbGllZCBvbiB3aGVyZWFzIHRoZSBgcmVhc29uYCBzdHJpbmcgY291bGQgY2hhbmdlIGFuZCBzaG91bGQgbm90IGJlXG4gICAgICogdXNlZCBpbiBwcm9kdWN0aW9uLlxuICAgICAqL1xuICAgIHJlYWRvbmx5IGNvZGU/OiBOYXZpZ2F0aW9uU2tpcHBlZENvZGUsXG4gICkge1xuICAgIHN1cGVyKGlkLCB1cmwpO1xuICB9XG59XG5cbi8qKlxuICogQW4gZXZlbnQgdHJpZ2dlcmVkIHdoZW4gYSBuYXZpZ2F0aW9uIGZhaWxzIGR1ZSB0byBhbiB1bmV4cGVjdGVkIGVycm9yLlxuICpcbiAqIEBzZWUge0BsaW5rIE5hdmlnYXRpb25TdGFydH1cbiAqIEBzZWUge0BsaW5rIE5hdmlnYXRpb25FbmR9XG4gKiBAc2VlIHtAbGluayBOYXZpZ2F0aW9uQ2FuY2VsfVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIE5hdmlnYXRpb25FcnJvciBleHRlbmRzIFJvdXRlckV2ZW50IHtcbiAgcmVhZG9ubHkgdHlwZSA9IEV2ZW50VHlwZS5OYXZpZ2F0aW9uRXJyb3I7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICBpZDogbnVtYmVyLFxuICAgIC8qKiBAZG9jc05vdFJlcXVpcmVkICovXG4gICAgdXJsOiBzdHJpbmcsXG4gICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICBwdWJsaWMgZXJyb3I6IGFueSxcbiAgICAvKipcbiAgICAgKiBUaGUgdGFyZ2V0IG9mIHRoZSBuYXZpZ2F0aW9uIHdoZW4gdGhlIGVycm9yIG9jY3VycmVkLlxuICAgICAqXG4gICAgICogTm90ZSB0aGF0IHRoaXMgY2FuIGJlIGB1bmRlZmluZWRgIGJlY2F1c2UgYW4gZXJyb3IgY291bGQgaGF2ZSBvY2N1cnJlZCBiZWZvcmUgdGhlXG4gICAgICogYFJvdXRlclN0YXRlU25hcHNob3RgIHdhcyBjcmVhdGVkIGZvciB0aGUgbmF2aWdhdGlvbi5cbiAgICAgKi9cbiAgICByZWFkb25seSB0YXJnZXQ/OiBSb3V0ZXJTdGF0ZVNuYXBzaG90LFxuICApIHtcbiAgICBzdXBlcihpZCwgdXJsKTtcbiAgfVxuXG4gIC8qKiBAZG9jc05vdFJlcXVpcmVkICovXG4gIG92ZXJyaWRlIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBOYXZpZ2F0aW9uRXJyb3IoaWQ6ICR7dGhpcy5pZH0sIHVybDogJyR7dGhpcy51cmx9JywgZXJyb3I6ICR7dGhpcy5lcnJvcn0pYDtcbiAgfVxufVxuXG4vKipcbiAqIEFuIGV2ZW50IHRyaWdnZXJlZCB3aGVuIHJvdXRlcyBhcmUgcmVjb2duaXplZC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBSb3V0ZXNSZWNvZ25pemVkIGV4dGVuZHMgUm91dGVyRXZlbnQge1xuICByZWFkb25seSB0eXBlID0gRXZlbnRUeXBlLlJvdXRlc1JlY29nbml6ZWQ7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICBpZDogbnVtYmVyLFxuICAgIC8qKiBAZG9jc05vdFJlcXVpcmVkICovXG4gICAgdXJsOiBzdHJpbmcsXG4gICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICBwdWJsaWMgdXJsQWZ0ZXJSZWRpcmVjdHM6IHN0cmluZyxcbiAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgIHB1YmxpYyBzdGF0ZTogUm91dGVyU3RhdGVTbmFwc2hvdCxcbiAgKSB7XG4gICAgc3VwZXIoaWQsIHVybCk7XG4gIH1cblxuICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICBvdmVycmlkZSB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiBgUm91dGVzUmVjb2duaXplZChpZDogJHt0aGlzLmlkfSwgdXJsOiAnJHt0aGlzLnVybH0nLCB1cmxBZnRlclJlZGlyZWN0czogJyR7dGhpcy51cmxBZnRlclJlZGlyZWN0c30nLCBzdGF0ZTogJHt0aGlzLnN0YXRlfSlgO1xuICB9XG59XG5cbi8qKlxuICogQW4gZXZlbnQgdHJpZ2dlcmVkIGF0IHRoZSBzdGFydCBvZiB0aGUgR3VhcmQgcGhhc2Ugb2Ygcm91dGluZy5cbiAqXG4gKiBAc2VlIHtAbGluayBHdWFyZHNDaGVja0VuZH1cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBHdWFyZHNDaGVja1N0YXJ0IGV4dGVuZHMgUm91dGVyRXZlbnQge1xuICByZWFkb25seSB0eXBlID0gRXZlbnRUeXBlLkd1YXJkc0NoZWNrU3RhcnQ7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICBpZDogbnVtYmVyLFxuICAgIC8qKiBAZG9jc05vdFJlcXVpcmVkICovXG4gICAgdXJsOiBzdHJpbmcsXG4gICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICBwdWJsaWMgdXJsQWZ0ZXJSZWRpcmVjdHM6IHN0cmluZyxcbiAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgIHB1YmxpYyBzdGF0ZTogUm91dGVyU3RhdGVTbmFwc2hvdCxcbiAgKSB7XG4gICAgc3VwZXIoaWQsIHVybCk7XG4gIH1cblxuICBvdmVycmlkZSB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiBgR3VhcmRzQ2hlY2tTdGFydChpZDogJHt0aGlzLmlkfSwgdXJsOiAnJHt0aGlzLnVybH0nLCB1cmxBZnRlclJlZGlyZWN0czogJyR7dGhpcy51cmxBZnRlclJlZGlyZWN0c30nLCBzdGF0ZTogJHt0aGlzLnN0YXRlfSlgO1xuICB9XG59XG5cbi8qKlxuICogQW4gZXZlbnQgdHJpZ2dlcmVkIGF0IHRoZSBlbmQgb2YgdGhlIEd1YXJkIHBoYXNlIG9mIHJvdXRpbmcuXG4gKlxuICogQHNlZSB7QGxpbmsgR3VhcmRzQ2hlY2tTdGFydH1cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBHdWFyZHNDaGVja0VuZCBleHRlbmRzIFJvdXRlckV2ZW50IHtcbiAgcmVhZG9ubHkgdHlwZSA9IEV2ZW50VHlwZS5HdWFyZHNDaGVja0VuZDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgIGlkOiBudW1iZXIsXG4gICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICB1cmw6IHN0cmluZyxcbiAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgIHB1YmxpYyB1cmxBZnRlclJlZGlyZWN0czogc3RyaW5nLFxuICAgIC8qKiBAZG9jc05vdFJlcXVpcmVkICovXG4gICAgcHVibGljIHN0YXRlOiBSb3V0ZXJTdGF0ZVNuYXBzaG90LFxuICAgIC8qKiBAZG9jc05vdFJlcXVpcmVkICovXG4gICAgcHVibGljIHNob3VsZEFjdGl2YXRlOiBib29sZWFuLFxuICApIHtcbiAgICBzdXBlcihpZCwgdXJsKTtcbiAgfVxuXG4gIG92ZXJyaWRlIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBHdWFyZHNDaGVja0VuZChpZDogJHt0aGlzLmlkfSwgdXJsOiAnJHt0aGlzLnVybH0nLCB1cmxBZnRlclJlZGlyZWN0czogJyR7dGhpcy51cmxBZnRlclJlZGlyZWN0c30nLCBzdGF0ZTogJHt0aGlzLnN0YXRlfSwgc2hvdWxkQWN0aXZhdGU6ICR7dGhpcy5zaG91bGRBY3RpdmF0ZX0pYDtcbiAgfVxufVxuXG4vKipcbiAqIEFuIGV2ZW50IHRyaWdnZXJlZCBhdCB0aGUgc3RhcnQgb2YgdGhlIFJlc29sdmUgcGhhc2Ugb2Ygcm91dGluZy5cbiAqXG4gKiBSdW5zIGluIHRoZSBcInJlc29sdmVcIiBwaGFzZSB3aGV0aGVyIG9yIG5vdCB0aGVyZSBpcyBhbnl0aGluZyB0byByZXNvbHZlLlxuICogSW4gZnV0dXJlLCBtYXkgY2hhbmdlIHRvIG9ubHkgcnVuIHdoZW4gdGhlcmUgYXJlIHRoaW5ncyB0byBiZSByZXNvbHZlZC5cbiAqXG4gKiBAc2VlIHtAbGluayBSZXNvbHZlRW5kfVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIFJlc29sdmVTdGFydCBleHRlbmRzIFJvdXRlckV2ZW50IHtcbiAgcmVhZG9ubHkgdHlwZSA9IEV2ZW50VHlwZS5SZXNvbHZlU3RhcnQ7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICBpZDogbnVtYmVyLFxuICAgIC8qKiBAZG9jc05vdFJlcXVpcmVkICovXG4gICAgdXJsOiBzdHJpbmcsXG4gICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICBwdWJsaWMgdXJsQWZ0ZXJSZWRpcmVjdHM6IHN0cmluZyxcbiAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgIHB1YmxpYyBzdGF0ZTogUm91dGVyU3RhdGVTbmFwc2hvdCxcbiAgKSB7XG4gICAgc3VwZXIoaWQsIHVybCk7XG4gIH1cblxuICBvdmVycmlkZSB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiBgUmVzb2x2ZVN0YXJ0KGlkOiAke3RoaXMuaWR9LCB1cmw6ICcke3RoaXMudXJsfScsIHVybEFmdGVyUmVkaXJlY3RzOiAnJHt0aGlzLnVybEFmdGVyUmVkaXJlY3RzfScsIHN0YXRlOiAke3RoaXMuc3RhdGV9KWA7XG4gIH1cbn1cblxuLyoqXG4gKiBBbiBldmVudCB0cmlnZ2VyZWQgYXQgdGhlIGVuZCBvZiB0aGUgUmVzb2x2ZSBwaGFzZSBvZiByb3V0aW5nLlxuICogQHNlZSB7QGxpbmsgUmVzb2x2ZVN0YXJ0fVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIFJlc29sdmVFbmQgZXh0ZW5kcyBSb3V0ZXJFdmVudCB7XG4gIHJlYWRvbmx5IHR5cGUgPSBFdmVudFR5cGUuUmVzb2x2ZUVuZDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgIGlkOiBudW1iZXIsXG4gICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICB1cmw6IHN0cmluZyxcbiAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgIHB1YmxpYyB1cmxBZnRlclJlZGlyZWN0czogc3RyaW5nLFxuICAgIC8qKiBAZG9jc05vdFJlcXVpcmVkICovXG4gICAgcHVibGljIHN0YXRlOiBSb3V0ZXJTdGF0ZVNuYXBzaG90LFxuICApIHtcbiAgICBzdXBlcihpZCwgdXJsKTtcbiAgfVxuXG4gIG92ZXJyaWRlIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBSZXNvbHZlRW5kKGlkOiAke3RoaXMuaWR9LCB1cmw6ICcke3RoaXMudXJsfScsIHVybEFmdGVyUmVkaXJlY3RzOiAnJHt0aGlzLnVybEFmdGVyUmVkaXJlY3RzfScsIHN0YXRlOiAke3RoaXMuc3RhdGV9KWA7XG4gIH1cbn1cblxuLyoqXG4gKiBBbiBldmVudCB0cmlnZ2VyZWQgYmVmb3JlIGxhenkgbG9hZGluZyBhIHJvdXRlIGNvbmZpZ3VyYXRpb24uXG4gKlxuICogQHNlZSB7QGxpbmsgUm91dGVDb25maWdMb2FkRW5kfVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIFJvdXRlQ29uZmlnTG9hZFN0YXJ0IHtcbiAgcmVhZG9ubHkgdHlwZSA9IEV2ZW50VHlwZS5Sb3V0ZUNvbmZpZ0xvYWRTdGFydDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgIHB1YmxpYyByb3V0ZTogUm91dGUsXG4gICkge31cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYFJvdXRlQ29uZmlnTG9hZFN0YXJ0KHBhdGg6ICR7dGhpcy5yb3V0ZS5wYXRofSlgO1xuICB9XG59XG5cbi8qKlxuICogQW4gZXZlbnQgdHJpZ2dlcmVkIHdoZW4gYSByb3V0ZSBoYXMgYmVlbiBsYXp5IGxvYWRlZC5cbiAqXG4gKiBAc2VlIHtAbGluayBSb3V0ZUNvbmZpZ0xvYWRTdGFydH1cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBSb3V0ZUNvbmZpZ0xvYWRFbmQge1xuICByZWFkb25seSB0eXBlID0gRXZlbnRUeXBlLlJvdXRlQ29uZmlnTG9hZEVuZDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgIHB1YmxpYyByb3V0ZTogUm91dGUsXG4gICkge31cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYFJvdXRlQ29uZmlnTG9hZEVuZChwYXRoOiAke3RoaXMucm91dGUucGF0aH0pYDtcbiAgfVxufVxuXG4vKipcbiAqIEFuIGV2ZW50IHRyaWdnZXJlZCBhdCB0aGUgc3RhcnQgb2YgdGhlIGNoaWxkLWFjdGl2YXRpb25cbiAqIHBhcnQgb2YgdGhlIFJlc29sdmUgcGhhc2Ugb2Ygcm91dGluZy5cbiAqIEBzZWUge0BsaW5rIENoaWxkQWN0aXZhdGlvbkVuZH1cbiAqIEBzZWUge0BsaW5rIFJlc29sdmVTdGFydH1cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBDaGlsZEFjdGl2YXRpb25TdGFydCB7XG4gIHJlYWRvbmx5IHR5cGUgPSBFdmVudFR5cGUuQ2hpbGRBY3RpdmF0aW9uU3RhcnQ7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICBwdWJsaWMgc25hcHNob3Q6IEFjdGl2YXRlZFJvdXRlU25hcHNob3QsXG4gICkge31cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICBjb25zdCBwYXRoID0gKHRoaXMuc25hcHNob3Qucm91dGVDb25maWcgJiYgdGhpcy5zbmFwc2hvdC5yb3V0ZUNvbmZpZy5wYXRoKSB8fCAnJztcbiAgICByZXR1cm4gYENoaWxkQWN0aXZhdGlvblN0YXJ0KHBhdGg6ICcke3BhdGh9JylgO1xuICB9XG59XG5cbi8qKlxuICogQW4gZXZlbnQgdHJpZ2dlcmVkIGF0IHRoZSBlbmQgb2YgdGhlIGNoaWxkLWFjdGl2YXRpb24gcGFydFxuICogb2YgdGhlIFJlc29sdmUgcGhhc2Ugb2Ygcm91dGluZy5cbiAqIEBzZWUge0BsaW5rIENoaWxkQWN0aXZhdGlvblN0YXJ0fVxuICogQHNlZSB7QGxpbmsgUmVzb2x2ZVN0YXJ0fVxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgQ2hpbGRBY3RpdmF0aW9uRW5kIHtcbiAgcmVhZG9ubHkgdHlwZSA9IEV2ZW50VHlwZS5DaGlsZEFjdGl2YXRpb25FbmQ7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICBwdWJsaWMgc25hcHNob3Q6IEFjdGl2YXRlZFJvdXRlU25hcHNob3QsXG4gICkge31cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICBjb25zdCBwYXRoID0gKHRoaXMuc25hcHNob3Qucm91dGVDb25maWcgJiYgdGhpcy5zbmFwc2hvdC5yb3V0ZUNvbmZpZy5wYXRoKSB8fCAnJztcbiAgICByZXR1cm4gYENoaWxkQWN0aXZhdGlvbkVuZChwYXRoOiAnJHtwYXRofScpYDtcbiAgfVxufVxuXG4vKipcbiAqIEFuIGV2ZW50IHRyaWdnZXJlZCBhdCB0aGUgc3RhcnQgb2YgdGhlIGFjdGl2YXRpb24gcGFydFxuICogb2YgdGhlIFJlc29sdmUgcGhhc2Ugb2Ygcm91dGluZy5cbiAqIEBzZWUge0BsaW5rIEFjdGl2YXRpb25FbmR9XG4gKiBAc2VlIHtAbGluayBSZXNvbHZlU3RhcnR9XG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgQWN0aXZhdGlvblN0YXJ0IHtcbiAgcmVhZG9ubHkgdHlwZSA9IEV2ZW50VHlwZS5BY3RpdmF0aW9uU3RhcnQ7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICBwdWJsaWMgc25hcHNob3Q6IEFjdGl2YXRlZFJvdXRlU25hcHNob3QsXG4gICkge31cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICBjb25zdCBwYXRoID0gKHRoaXMuc25hcHNob3Qucm91dGVDb25maWcgJiYgdGhpcy5zbmFwc2hvdC5yb3V0ZUNvbmZpZy5wYXRoKSB8fCAnJztcbiAgICByZXR1cm4gYEFjdGl2YXRpb25TdGFydChwYXRoOiAnJHtwYXRofScpYDtcbiAgfVxufVxuXG4vKipcbiAqIEFuIGV2ZW50IHRyaWdnZXJlZCBhdCB0aGUgZW5kIG9mIHRoZSBhY3RpdmF0aW9uIHBhcnRcbiAqIG9mIHRoZSBSZXNvbHZlIHBoYXNlIG9mIHJvdXRpbmcuXG4gKiBAc2VlIHtAbGluayBBY3RpdmF0aW9uU3RhcnR9XG4gKiBAc2VlIHtAbGluayBSZXNvbHZlU3RhcnR9XG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgQWN0aXZhdGlvbkVuZCB7XG4gIHJlYWRvbmx5IHR5cGUgPSBFdmVudFR5cGUuQWN0aXZhdGlvbkVuZDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgIHB1YmxpYyBzbmFwc2hvdDogQWN0aXZhdGVkUm91dGVTbmFwc2hvdCxcbiAgKSB7fVxuICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIGNvbnN0IHBhdGggPSAodGhpcy5zbmFwc2hvdC5yb3V0ZUNvbmZpZyAmJiB0aGlzLnNuYXBzaG90LnJvdXRlQ29uZmlnLnBhdGgpIHx8ICcnO1xuICAgIHJldHVybiBgQWN0aXZhdGlvbkVuZChwYXRoOiAnJHtwYXRofScpYDtcbiAgfVxufVxuXG4vKipcbiAqIEFuIGV2ZW50IHRyaWdnZXJlZCBieSBzY3JvbGxpbmcuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgU2Nyb2xsIHtcbiAgcmVhZG9ubHkgdHlwZSA9IEV2ZW50VHlwZS5TY3JvbGw7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICByZWFkb25seSByb3V0ZXJFdmVudDogTmF2aWdhdGlvbkVuZCB8IE5hdmlnYXRpb25Ta2lwcGVkLFxuXG4gICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICByZWFkb25seSBwb3NpdGlvbjogW251bWJlciwgbnVtYmVyXSB8IG51bGwsXG5cbiAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgIHJlYWRvbmx5IGFuY2hvcjogc3RyaW5nIHwgbnVsbCxcbiAgKSB7fVxuXG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgY29uc3QgcG9zID0gdGhpcy5wb3NpdGlvbiA/IGAke3RoaXMucG9zaXRpb25bMF19LCAke3RoaXMucG9zaXRpb25bMV19YCA6IG51bGw7XG4gICAgcmV0dXJuIGBTY3JvbGwoYW5jaG9yOiAnJHt0aGlzLmFuY2hvcn0nLCBwb3NpdGlvbjogJyR7cG9zfScpYDtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQmVmb3JlQWN0aXZhdGVSb3V0ZXMge31cbmV4cG9ydCBjbGFzcyBSZWRpcmVjdFJlcXVlc3Qge1xuICBjb25zdHJ1Y3RvcihcbiAgICByZWFkb25seSB1cmw6IFVybFRyZWUsXG4gICAgcmVhZG9ubHkgbmF2aWdhdGlvbkJlaGF2aW9yT3B0aW9uczogTmF2aWdhdGlvbkJlaGF2aW9yT3B0aW9ucyB8IHVuZGVmaW5lZCxcbiAgKSB7fVxufVxuZXhwb3J0IHR5cGUgUHJpdmF0ZVJvdXRlckV2ZW50cyA9IEJlZm9yZUFjdGl2YXRlUm91dGVzIHwgUmVkaXJlY3RSZXF1ZXN0O1xuXG4vKipcbiAqIFJvdXRlciBldmVudHMgdGhhdCBhbGxvdyB5b3UgdG8gdHJhY2sgdGhlIGxpZmVjeWNsZSBvZiB0aGUgcm91dGVyLlxuICpcbiAqIFRoZSBldmVudHMgb2NjdXIgaW4gdGhlIGZvbGxvd2luZyBzZXF1ZW5jZTpcbiAqXG4gKiAqIFtOYXZpZ2F0aW9uU3RhcnRdKGFwaS9yb3V0ZXIvTmF2aWdhdGlvblN0YXJ0KTogTmF2aWdhdGlvbiBzdGFydHMuXG4gKiAqIFtSb3V0ZUNvbmZpZ0xvYWRTdGFydF0oYXBpL3JvdXRlci9Sb3V0ZUNvbmZpZ0xvYWRTdGFydCk6IEJlZm9yZVxuICogdGhlIHJvdXRlciBbbGF6eSBsb2Fkc10oZ3VpZGUvcm91dGluZy9jb21tb24tcm91dGVyLXRhc2tzI2xhenktbG9hZGluZykgYSByb3V0ZSBjb25maWd1cmF0aW9uLlxuICogKiBbUm91dGVDb25maWdMb2FkRW5kXShhcGkvcm91dGVyL1JvdXRlQ29uZmlnTG9hZEVuZCk6IEFmdGVyIGEgcm91dGUgaGFzIGJlZW4gbGF6eSBsb2FkZWQuXG4gKiAqIFtSb3V0ZXNSZWNvZ25pemVkXShhcGkvcm91dGVyL1JvdXRlc1JlY29nbml6ZWQpOiBXaGVuIHRoZSByb3V0ZXIgcGFyc2VzIHRoZSBVUkxcbiAqIGFuZCB0aGUgcm91dGVzIGFyZSByZWNvZ25pemVkLlxuICogKiBbR3VhcmRzQ2hlY2tTdGFydF0oYXBpL3JvdXRlci9HdWFyZHNDaGVja1N0YXJ0KTogV2hlbiB0aGUgcm91dGVyIGJlZ2lucyB0aGUgKmd1YXJkcypcbiAqIHBoYXNlIG9mIHJvdXRpbmcuXG4gKiAqIFtDaGlsZEFjdGl2YXRpb25TdGFydF0oYXBpL3JvdXRlci9DaGlsZEFjdGl2YXRpb25TdGFydCk6IFdoZW4gdGhlIHJvdXRlclxuICogYmVnaW5zIGFjdGl2YXRpbmcgYSByb3V0ZSdzIGNoaWxkcmVuLlxuICogKiBbQWN0aXZhdGlvblN0YXJ0XShhcGkvcm91dGVyL0FjdGl2YXRpb25TdGFydCk6IFdoZW4gdGhlIHJvdXRlciBiZWdpbnMgYWN0aXZhdGluZyBhIHJvdXRlLlxuICogKiBbR3VhcmRzQ2hlY2tFbmRdKGFwaS9yb3V0ZXIvR3VhcmRzQ2hlY2tFbmQpOiBXaGVuIHRoZSByb3V0ZXIgZmluaXNoZXMgdGhlICpndWFyZHMqXG4gKiBwaGFzZSBvZiByb3V0aW5nIHN1Y2Nlc3NmdWxseS5cbiAqICogW1Jlc29sdmVTdGFydF0oYXBpL3JvdXRlci9SZXNvbHZlU3RhcnQpOiBXaGVuIHRoZSByb3V0ZXIgYmVnaW5zIHRoZSAqcmVzb2x2ZSpcbiAqIHBoYXNlIG9mIHJvdXRpbmcuXG4gKiAqIFtSZXNvbHZlRW5kXShhcGkvcm91dGVyL1Jlc29sdmVFbmQpOiBXaGVuIHRoZSByb3V0ZXIgZmluaXNoZXMgdGhlICpyZXNvbHZlKlxuICogcGhhc2Ugb2Ygcm91dGluZyBzdWNjZXNzZnVsbHkuXG4gKiAqIFtDaGlsZEFjdGl2YXRpb25FbmRdKGFwaS9yb3V0ZXIvQ2hpbGRBY3RpdmF0aW9uRW5kKTogV2hlbiB0aGUgcm91dGVyIGZpbmlzaGVzXG4gKiBhY3RpdmF0aW5nIGEgcm91dGUncyBjaGlsZHJlbi5cbiAqICogW0FjdGl2YXRpb25FbmRdKGFwaS9yb3V0ZXIvQWN0aXZhdGlvbkVuZCk6IFdoZW4gdGhlIHJvdXRlciBmaW5pc2hlcyBhY3RpdmF0aW5nIGEgcm91dGUuXG4gKiAqIFtOYXZpZ2F0aW9uRW5kXShhcGkvcm91dGVyL05hdmlnYXRpb25FbmQpOiBXaGVuIG5hdmlnYXRpb24gZW5kcyBzdWNjZXNzZnVsbHkuXG4gKiAqIFtOYXZpZ2F0aW9uQ2FuY2VsXShhcGkvcm91dGVyL05hdmlnYXRpb25DYW5jZWwpOiBXaGVuIG5hdmlnYXRpb24gaXMgY2FuY2VsZWQuXG4gKiAqIFtOYXZpZ2F0aW9uRXJyb3JdKGFwaS9yb3V0ZXIvTmF2aWdhdGlvbkVycm9yKTogV2hlbiBuYXZpZ2F0aW9uIGZhaWxzXG4gKiBkdWUgdG8gYW4gdW5leHBlY3RlZCBlcnJvci5cbiAqICogW1Njcm9sbF0oYXBpL3JvdXRlci9TY3JvbGwpOiBXaGVuIHRoZSB1c2VyIHNjcm9sbHMuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgdHlwZSBFdmVudCA9XG4gIHwgTmF2aWdhdGlvblN0YXJ0XG4gIHwgTmF2aWdhdGlvbkVuZFxuICB8IE5hdmlnYXRpb25DYW5jZWxcbiAgfCBOYXZpZ2F0aW9uRXJyb3JcbiAgfCBSb3V0ZXNSZWNvZ25pemVkXG4gIHwgR3VhcmRzQ2hlY2tTdGFydFxuICB8IEd1YXJkc0NoZWNrRW5kXG4gIHwgUm91dGVDb25maWdMb2FkU3RhcnRcbiAgfCBSb3V0ZUNvbmZpZ0xvYWRFbmRcbiAgfCBDaGlsZEFjdGl2YXRpb25TdGFydFxuICB8IENoaWxkQWN0aXZhdGlvbkVuZFxuICB8IEFjdGl2YXRpb25TdGFydFxuICB8IEFjdGl2YXRpb25FbmRcbiAgfCBTY3JvbGxcbiAgfCBSZXNvbHZlU3RhcnRcbiAgfCBSZXNvbHZlRW5kXG4gIHwgTmF2aWdhdGlvblNraXBwZWQ7XG5cbmV4cG9ydCBmdW5jdGlvbiBzdHJpbmdpZnlFdmVudChyb3V0ZXJFdmVudDogRXZlbnQpOiBzdHJpbmcge1xuICBzd2l0Y2ggKHJvdXRlckV2ZW50LnR5cGUpIHtcbiAgICBjYXNlIEV2ZW50VHlwZS5BY3RpdmF0aW9uRW5kOlxuICAgICAgcmV0dXJuIGBBY3RpdmF0aW9uRW5kKHBhdGg6ICcke3JvdXRlckV2ZW50LnNuYXBzaG90LnJvdXRlQ29uZmlnPy5wYXRoIHx8ICcnfScpYDtcbiAgICBjYXNlIEV2ZW50VHlwZS5BY3RpdmF0aW9uU3RhcnQ6XG4gICAgICByZXR1cm4gYEFjdGl2YXRpb25TdGFydChwYXRoOiAnJHtyb3V0ZXJFdmVudC5zbmFwc2hvdC5yb3V0ZUNvbmZpZz8ucGF0aCB8fCAnJ30nKWA7XG4gICAgY2FzZSBFdmVudFR5cGUuQ2hpbGRBY3RpdmF0aW9uRW5kOlxuICAgICAgcmV0dXJuIGBDaGlsZEFjdGl2YXRpb25FbmQocGF0aDogJyR7cm91dGVyRXZlbnQuc25hcHNob3Qucm91dGVDb25maWc/LnBhdGggfHwgJyd9JylgO1xuICAgIGNhc2UgRXZlbnRUeXBlLkNoaWxkQWN0aXZhdGlvblN0YXJ0OlxuICAgICAgcmV0dXJuIGBDaGlsZEFjdGl2YXRpb25TdGFydChwYXRoOiAnJHtyb3V0ZXJFdmVudC5zbmFwc2hvdC5yb3V0ZUNvbmZpZz8ucGF0aCB8fCAnJ30nKWA7XG4gICAgY2FzZSBFdmVudFR5cGUuR3VhcmRzQ2hlY2tFbmQ6XG4gICAgICByZXR1cm4gYEd1YXJkc0NoZWNrRW5kKGlkOiAke3JvdXRlckV2ZW50LmlkfSwgdXJsOiAnJHtyb3V0ZXJFdmVudC51cmx9JywgdXJsQWZ0ZXJSZWRpcmVjdHM6ICcke3JvdXRlckV2ZW50LnVybEFmdGVyUmVkaXJlY3RzfScsIHN0YXRlOiAke3JvdXRlckV2ZW50LnN0YXRlfSwgc2hvdWxkQWN0aXZhdGU6ICR7cm91dGVyRXZlbnQuc2hvdWxkQWN0aXZhdGV9KWA7XG4gICAgY2FzZSBFdmVudFR5cGUuR3VhcmRzQ2hlY2tTdGFydDpcbiAgICAgIHJldHVybiBgR3VhcmRzQ2hlY2tTdGFydChpZDogJHtyb3V0ZXJFdmVudC5pZH0sIHVybDogJyR7cm91dGVyRXZlbnQudXJsfScsIHVybEFmdGVyUmVkaXJlY3RzOiAnJHtyb3V0ZXJFdmVudC51cmxBZnRlclJlZGlyZWN0c30nLCBzdGF0ZTogJHtyb3V0ZXJFdmVudC5zdGF0ZX0pYDtcbiAgICBjYXNlIEV2ZW50VHlwZS5OYXZpZ2F0aW9uQ2FuY2VsOlxuICAgICAgcmV0dXJuIGBOYXZpZ2F0aW9uQ2FuY2VsKGlkOiAke3JvdXRlckV2ZW50LmlkfSwgdXJsOiAnJHtyb3V0ZXJFdmVudC51cmx9JylgO1xuICAgIGNhc2UgRXZlbnRUeXBlLk5hdmlnYXRpb25Ta2lwcGVkOlxuICAgICAgcmV0dXJuIGBOYXZpZ2F0aW9uU2tpcHBlZChpZDogJHtyb3V0ZXJFdmVudC5pZH0sIHVybDogJyR7cm91dGVyRXZlbnQudXJsfScpYDtcbiAgICBjYXNlIEV2ZW50VHlwZS5OYXZpZ2F0aW9uRW5kOlxuICAgICAgcmV0dXJuIGBOYXZpZ2F0aW9uRW5kKGlkOiAke3JvdXRlckV2ZW50LmlkfSwgdXJsOiAnJHtyb3V0ZXJFdmVudC51cmx9JywgdXJsQWZ0ZXJSZWRpcmVjdHM6ICcke3JvdXRlckV2ZW50LnVybEFmdGVyUmVkaXJlY3RzfScpYDtcbiAgICBjYXNlIEV2ZW50VHlwZS5OYXZpZ2F0aW9uRXJyb3I6XG4gICAgICByZXR1cm4gYE5hdmlnYXRpb25FcnJvcihpZDogJHtyb3V0ZXJFdmVudC5pZH0sIHVybDogJyR7cm91dGVyRXZlbnQudXJsfScsIGVycm9yOiAke3JvdXRlckV2ZW50LmVycm9yfSlgO1xuICAgIGNhc2UgRXZlbnRUeXBlLk5hdmlnYXRpb25TdGFydDpcbiAgICAgIHJldHVybiBgTmF2aWdhdGlvblN0YXJ0KGlkOiAke3JvdXRlckV2ZW50LmlkfSwgdXJsOiAnJHtyb3V0ZXJFdmVudC51cmx9JylgO1xuICAgIGNhc2UgRXZlbnRUeXBlLlJlc29sdmVFbmQ6XG4gICAgICByZXR1cm4gYFJlc29sdmVFbmQoaWQ6ICR7cm91dGVyRXZlbnQuaWR9LCB1cmw6ICcke3JvdXRlckV2ZW50LnVybH0nLCB1cmxBZnRlclJlZGlyZWN0czogJyR7cm91dGVyRXZlbnQudXJsQWZ0ZXJSZWRpcmVjdHN9Jywgc3RhdGU6ICR7cm91dGVyRXZlbnQuc3RhdGV9KWA7XG4gICAgY2FzZSBFdmVudFR5cGUuUmVzb2x2ZVN0YXJ0OlxuICAgICAgcmV0dXJuIGBSZXNvbHZlU3RhcnQoaWQ6ICR7cm91dGVyRXZlbnQuaWR9LCB1cmw6ICcke3JvdXRlckV2ZW50LnVybH0nLCB1cmxBZnRlclJlZGlyZWN0czogJyR7cm91dGVyRXZlbnQudXJsQWZ0ZXJSZWRpcmVjdHN9Jywgc3RhdGU6ICR7cm91dGVyRXZlbnQuc3RhdGV9KWA7XG4gICAgY2FzZSBFdmVudFR5cGUuUm91dGVDb25maWdMb2FkRW5kOlxuICAgICAgcmV0dXJuIGBSb3V0ZUNvbmZpZ0xvYWRFbmQocGF0aDogJHtyb3V0ZXJFdmVudC5yb3V0ZS5wYXRofSlgO1xuICAgIGNhc2UgRXZlbnRUeXBlLlJvdXRlQ29uZmlnTG9hZFN0YXJ0OlxuICAgICAgcmV0dXJuIGBSb3V0ZUNvbmZpZ0xvYWRTdGFydChwYXRoOiAke3JvdXRlckV2ZW50LnJvdXRlLnBhdGh9KWA7XG4gICAgY2FzZSBFdmVudFR5cGUuUm91dGVzUmVjb2duaXplZDpcbiAgICAgIHJldHVybiBgUm91dGVzUmVjb2duaXplZChpZDogJHtyb3V0ZXJFdmVudC5pZH0sIHVybDogJyR7cm91dGVyRXZlbnQudXJsfScsIHVybEFmdGVyUmVkaXJlY3RzOiAnJHtyb3V0ZXJFdmVudC51cmxBZnRlclJlZGlyZWN0c30nLCBzdGF0ZTogJHtyb3V0ZXJFdmVudC5zdGF0ZX0pYDtcbiAgICBjYXNlIEV2ZW50VHlwZS5TY3JvbGw6XG4gICAgICBjb25zdCBwb3MgPSByb3V0ZXJFdmVudC5wb3NpdGlvblxuICAgICAgICA/IGAke3JvdXRlckV2ZW50LnBvc2l0aW9uWzBdfSwgJHtyb3V0ZXJFdmVudC5wb3NpdGlvblsxXX1gXG4gICAgICAgIDogbnVsbDtcbiAgICAgIHJldHVybiBgU2Nyb2xsKGFuY2hvcjogJyR7cm91dGVyRXZlbnQuYW5jaG9yfScsIHBvc2l0aW9uOiAnJHtwb3N9JylgO1xuICB9XG59XG4iXX0=