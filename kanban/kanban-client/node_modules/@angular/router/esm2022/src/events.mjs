/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvcm91dGVyL3NyYy9ldmVudHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBZ0JILE1BQU0sQ0FBQyxNQUFNLHFCQUFxQixHQUFHLFlBQVksQ0FBQztBQUVsRDs7OztHQUlHO0FBQ0gsTUFBTSxDQUFOLElBQVksU0FrQlg7QUFsQkQsV0FBWSxTQUFTO0lBQ25CLCtEQUFlLENBQUE7SUFDZiwyREFBYSxDQUFBO0lBQ2IsaUVBQWdCLENBQUE7SUFDaEIsK0RBQWUsQ0FBQTtJQUNmLGlFQUFnQixDQUFBO0lBQ2hCLHlEQUFZLENBQUE7SUFDWixxREFBVSxDQUFBO0lBQ1YsaUVBQWdCLENBQUE7SUFDaEIsNkRBQWMsQ0FBQTtJQUNkLHlFQUFvQixDQUFBO0lBQ3BCLHNFQUFrQixDQUFBO0lBQ2xCLDBFQUFvQixDQUFBO0lBQ3BCLHNFQUFrQixDQUFBO0lBQ2xCLGdFQUFlLENBQUE7SUFDZiw0REFBYSxDQUFBO0lBQ2IsOENBQU0sQ0FBQTtJQUNOLG9FQUFpQixDQUFBO0FBQ25CLENBQUMsRUFsQlcsU0FBUyxLQUFULFNBQVMsUUFrQnBCO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBdUJHO0FBQ0gsTUFBTSxPQUFPLFdBQVc7SUFDdEI7SUFDRSxzRUFBc0U7SUFDL0QsRUFBVTtJQUNqQiwyREFBMkQ7SUFDcEQsR0FBVztRQUZYLE9BQUUsR0FBRixFQUFFLENBQVE7UUFFVixRQUFHLEdBQUgsR0FBRyxDQUFRO0lBQ2pCLENBQUM7Q0FDTDtBQUVEOzs7O0dBSUc7QUFDSCxNQUFNLE9BQU8sZUFBZ0IsU0FBUSxXQUFXO0lBZ0M5QztJQUNFLHVCQUF1QjtJQUN2QixFQUFVO0lBQ1YsdUJBQXVCO0lBQ3ZCLEdBQVc7SUFDWCx1QkFBdUI7SUFDdkIsb0JBQXVDLFlBQVk7SUFDbkQsdUJBQXVCO0lBQ3ZCLGdCQUFpRSxJ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aUIsYUFBYSxXQUFXLENBQUMsS0FBSyxHQUFHLENBQUM7UUFDOUosS0FBSyxTQUFTLENBQUMsa0JBQWtCO1lBQy9CLE9BQU8sNEJBQTRCLFdBQVcsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLENBQUM7UUFDL0QsS0FBSyxTQUFTLENBQUMsb0JBQW9CO1lBQ2pDLE9BQU8sOEJBQThCLFdBQVcsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLENBQUM7UUFDakUsS0FBSyxTQUFTLENBQUMsZ0JBQWdCO1lBQzdCLE9BQU8sd0JBQXdCLFdBQVcsQ0FBQyxFQUFFLFdBQVcsV0FBVyxDQUFDLEdBQUcsMEJBQTBCLFdBQVcsQ0FBQyxpQkFBaUIsYUFBYSxXQUFXLENBQUMsS0FBSyxHQUFHLENBQUM7UUFDbEssS0FBSyxTQUFTLENBQUMsTUFBTTtZQUNuQixNQUFNLEdBQUcsR0FBRyxXQUFXLENBQUMsUUFBUTtnQkFDOUIsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUMxRCxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQ1QsT0FBTyxtQkFBbUIsV0FBVyxDQUFDLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDO0lBQ3pFLENBQUM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7TmF2aWdhdGlvbkJlaGF2aW9yT3B0aW9ucywgUm91dGV9IGZyb20gJy4vbW9kZWxzJztcbmltcG9ydCB7QWN0aXZhdGVkUm91dGVTbmFwc2hvdCwgUm91dGVyU3RhdGVTbmFwc2hvdH0gZnJvbSAnLi9yb3V0ZXJfc3RhdGUnO1xuaW1wb3J0IHtVcmxUcmVlfSBmcm9tICcuL3VybF90cmVlJztcblxuLyoqXG4gKiBJZGVudGlmaWVzIHRoZSBjYWxsIG9yIGV2ZW50IHRoYXQgdHJpZ2dlcmVkIGEgbmF2aWdhdGlvbi5cbiAqXG4gKiAqICdpbXBlcmF0aXZlJzogVHJpZ2dlcmVkIGJ5IGByb3V0ZXIubmF2aWdhdGVCeVVybCgpYCBvciBgcm91dGVyLm5hdmlnYXRlKClgLlxuICogKiAncG9wc3RhdGUnIDogVHJpZ2dlcmVkIGJ5IGEgYHBvcHN0YXRlYCBldmVudC5cbiAqICogJ2hhc2hjaGFuZ2UnLTogVHJpZ2dlcmVkIGJ5IGEgYGhhc2hjaGFuZ2VgIGV2ZW50LlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IHR5cGUgTmF2aWdhdGlvblRyaWdnZXIgPSAnaW1wZXJhdGl2ZScgfCAncG9wc3RhdGUnIHwgJ2hhc2hjaGFuZ2UnO1xuZXhwb3J0IGNvbnN0IElNUEVSQVRJVkVfTkFWSUdBVElPTiA9ICdpbXBlcmF0aXZlJztcblxuLyoqXG4gKiBJZGVudGlmaWVzIHRoZSB0eXBlIG9mIGEgcm91dGVyIGV2ZW50LlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGVudW0gRXZlbnRUeXBlIHtcbiAgTmF2aWdhdGlvblN0YXJ0LFxuICBOYXZpZ2F0aW9uRW5kLFxuICBOYXZpZ2F0aW9uQ2FuY2VsLFxuICBOYXZpZ2F0aW9uRXJyb3IsXG4gIFJvdXRlc1JlY29nbml6ZWQsXG4gIFJlc29sdmVTdGFydCxcbiAgUmVzb2x2ZUVuZCxcbiAgR3VhcmRzQ2hlY2tTdGFydCxcbiAgR3VhcmRzQ2hlY2tFbmQsXG4gIFJvdXRlQ29uZmlnTG9hZFN0YXJ0LFxuICBSb3V0ZUNvbmZpZ0xvYWRFbmQsXG4gIENoaWxkQWN0aXZhdGlvblN0YXJ0LFxuICBDaGlsZEFjdGl2YXRpb25FbmQsXG4gIEFjdGl2YXRpb25TdGFydCxcbiAgQWN0aXZhdGlvbkVuZCxcbiAgU2Nyb2xsLFxuICBOYXZpZ2F0aW9uU2tpcHBlZCxcbn1cblxuLyoqXG4gKiBCYXNlIGZvciBldmVudHMgdGhlIHJvdXRlciBnb2VzIHRocm91Z2gsIGFzIG9wcG9zZWQgdG8gZXZlbnRzIHRpZWQgdG8gYSBzcGVjaWZpY1xuICogcm91dGUuIEZpcmVkIG9uZSB0aW1lIGZvciBhbnkgZ2l2ZW4gbmF2aWdhdGlvbi5cbiAqXG4gKiBUaGUgZm9sbG93aW5nIGNvZGUgc2hvd3MgaG93IGEgY2xhc3Mgc3Vic2NyaWJlcyB0byByb3V0ZXIgZXZlbnRzLlxuICpcbiAqIGBgYHRzXG4gKiBpbXBvcnQge0V2ZW50LCBSb3V0ZXJFdmVudCwgUm91dGVyfSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xuICpcbiAqIGNsYXNzIE15U2VydmljZSB7XG4gKiAgIGNvbnN0cnVjdG9yKHB1YmxpYyByb3V0ZXI6IFJvdXRlcikge1xuICogICAgIHJvdXRlci5ldmVudHMucGlwZShcbiAqICAgICAgICBmaWx0ZXIoKGU6IEV2ZW50IHwgUm91dGVyRXZlbnQpOiBlIGlzIFJvdXRlckV2ZW50ID0+IGUgaW5zdGFuY2VvZiBSb3V0ZXJFdmVudClcbiAqICAgICApLnN1YnNjcmliZSgoZTogUm91dGVyRXZlbnQpID0+IHtcbiAqICAgICAgIC8vIERvIHNvbWV0aGluZ1xuICogICAgIH0pO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBAc2VlIHtAbGluayBFdmVudH1cbiAqIEBzZWUgW1JvdXRlciBldmVudHMgc3VtbWFyeV0oZ3VpZGUvcm91dGluZy9yb3V0ZXItcmVmZXJlbmNlI3JvdXRlci1ldmVudHMpXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBSb3V0ZXJFdmVudCB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIC8qKiBBIHVuaXF1ZSBJRCB0aGF0IHRoZSByb3V0ZXIgYXNzaWducyB0byBldmVyeSByb3V0ZXIgbmF2aWdhdGlvbi4gKi9cbiAgICBwdWJsaWMgaWQ6IG51bWJlcixcbiAgICAvKiogVGhlIFVSTCB0aGF0IGlzIHRoZSBkZXN0aW5hdGlvbiBmb3IgdGhpcyBuYXZpZ2F0aW9uLiAqL1xuICAgIHB1YmxpYyB1cmw6IHN0cmluZyxcbiAgKSB7fVxufVxuXG4vKipcbiAqIEFuIGV2ZW50IHRyaWdnZXJlZCB3aGVuIGEgbmF2aWdhdGlvbiBzdGFydHMuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgTmF2aWdhdGlvblN0YXJ0IGV4dGVuZHMgUm91dGVyRXZlbnQge1xuICByZWFkb25seSB0eXBlID0gRXZlbnRUeXBlLk5hdmlnYXRpb25TdGFydDtcblxuICAvKipcbiAgICogSWRlbnRpZmllcyB0aGUgY2FsbCBvciBldmVudCB0aGF0IHRyaWdnZXJlZCB0aGUgbmF2aWdhdGlvbi5cbiAgICogQW4gYGltcGVyYXRpdmVgIHRyaWdnZXIgaXMgYSBjYWxsIHRvIGByb3V0ZXIubmF2aWdhdGVCeVVybCgpYCBvciBgcm91dGVyLm5hdmlnYXRlKClgLlxuICAgKlxuICAgKiBAc2VlIHtAbGluayBOYXZpZ2F0aW9uRW5kfVxuICAgKiBAc2VlIHtAbGluayBOYXZpZ2F0aW9uQ2FuY2VsfVxuICAgKiBAc2VlIHtAbGluayBOYXZpZ2F0aW9uRXJyb3J9XG4gICAqL1xuICBuYXZpZ2F0aW9uVHJpZ2dlcj86IE5hdmlnYXRpb25UcmlnZ2VyO1xuXG4gIC8qKlxuICAgKiBUaGUgbmF2aWdhdGlvbiBzdGF0ZSB0aGF0IHdhcyBwcmV2aW91c2x5IHN1cHBsaWVkIHRvIHRoZSBgcHVzaFN0YXRlYCBjYWxsLFxuICAgKiB3aGVuIHRoZSBuYXZpZ2F0aW9uIGlzIHRyaWdnZXJlZCBieSBhIGBwb3BzdGF0ZWAgZXZlbnQuIE90aGVyd2lzZSBudWxsLlxuICAgKlxuICAgKiBUaGUgc3RhdGUgb2JqZWN0IGlzIGRlZmluZWQgYnkgYE5hdmlnYXRpb25FeHRyYXNgLCBhbmQgY29udGFpbnMgYW55XG4gICAqIGRldmVsb3Blci1kZWZpbmVkIHN0YXRlIHZhbHVlLCBhcyB3ZWxsIGFzIGEgdW5pcXVlIElEIHRoYXRcbiAgICogdGhlIHJvdXRlciBhc3NpZ25zIHRvIGV2ZXJ5IHJvdXRlciB0cmFuc2l0aW9uL25hdmlnYXRpb24uXG4gICAqXG4gICAqIEZyb20gdGhlIHBlcnNwZWN0aXZlIG9mIHRoZSByb3V0ZXIsIHRoZSByb3V0ZXIgbmV2ZXIgXCJnb2VzIGJhY2tcIi5cbiAgICogV2hlbiB0aGUgdXNlciBjbGlja3Mgb24gdGhlIGJhY2sgYnV0dG9uIGluIHRoZSBicm93c2VyLFxuICAgKiBhIG5ldyBuYXZpZ2F0aW9uIElEIGlzIGNyZWF0ZWQuXG4gICAqXG4gICAqIFVzZSB0aGUgSUQgaW4gdGhpcyBwcmV2aW91cy1zdGF0ZSBvYmplY3QgdG8gZGlmZmVyZW50aWF0ZSBiZXR3ZWVuIGEgbmV3bHkgY3JlYXRlZFxuICAgKiBzdGF0ZSBhbmQgb25lIHJldHVybmVkIHRvIGJ5IGEgYHBvcHN0YXRlYCBldmVudCwgc28gdGhhdCB5b3UgY2FuIHJlc3RvcmUgc29tZVxuICAgKiByZW1lbWJlcmVkIHN0YXRlLCBzdWNoIGFzIHNjcm9sbCBwb3NpdGlvbi5cbiAgICpcbiAgICovXG4gIHJlc3RvcmVkU3RhdGU/OiB7W2s6IHN0cmluZ106IGFueTsgbmF2aWdhdGlvbklkOiBudW1iZXJ9IHwgbnVsbDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgIGlkOiBudW1iZXIsXG4gICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICB1cmw6IHN0cmluZyxcbiAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgIG5hdmlnYXRpb25UcmlnZ2VyOiBOYXZpZ2F0aW9uVHJpZ2dlciA9ICdpbXBlcmF0aXZlJyxcbiAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgIHJlc3RvcmVkU3RhdGU6IHtbazogc3RyaW5nXTogYW55OyBuYXZpZ2F0aW9uSWQ6IG51bWJlcn0gfCBudWxsID0gbnVsbCxcbiAgKSB7XG4gICAgc3VwZXIoaWQsIHVybCk7XG4gICAgdGhpcy5uYXZpZ2F0aW9uVHJpZ2dlciA9IG5hdmlnYXRpb25UcmlnZ2VyO1xuICAgIHRoaXMucmVzdG9yZWRTdGF0ZSA9IHJlc3RvcmVkU3RhdGU7XG4gIH1cblxuICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICBvdmVycmlkZSB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiBgTmF2aWdhdGlvblN0YXJ0KGlkOiAke3RoaXMuaWR9LCB1cmw6ICcke3RoaXMudXJsfScpYDtcbiAgfVxufVxuXG4vKipcbiAqIEFuIGV2ZW50IHRyaWdnZXJlZCB3aGVuIGEgbmF2aWdhdGlvbiBlbmRzIHN1Y2Nlc3NmdWxseS5cbiAqXG4gKiBAc2VlIHtAbGluayBOYXZpZ2F0aW9uU3RhcnR9XG4gKiBAc2VlIHtAbGluayBOYXZpZ2F0aW9uQ2FuY2VsfVxuICogQHNlZSB7QGxpbmsgTmF2aWdhdGlvbkVycm9yfVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIE5hdmlnYXRpb25FbmQgZXh0ZW5kcyBSb3V0ZXJFdmVudCB7XG4gIHJlYWRvbmx5IHR5cGUgPSBFdmVudFR5cGUuTmF2aWdhdGlvbkVuZDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgIGlkOiBudW1iZXIsXG4gICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICB1cmw6IHN0cmluZyxcbiAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgIHB1YmxpYyB1cmxBZnRlclJlZGlyZWN0czogc3RyaW5nLFxuICApIHtcbiAgICBzdXBlcihpZCwgdXJsKTtcbiAgfVxuXG4gIC8qKiBAZG9jc05vdFJlcXVpcmVkICovXG4gIG92ZXJyaWRlIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBOYXZpZ2F0aW9uRW5kKGlkOiAke3RoaXMuaWR9LCB1cmw6ICcke3RoaXMudXJsfScsIHVybEFmdGVyUmVkaXJlY3RzOiAnJHt0aGlzLnVybEFmdGVyUmVkaXJlY3RzfScpYDtcbiAgfVxufVxuXG4vKipcbiAqIEEgY29kZSBmb3IgdGhlIGBOYXZpZ2F0aW9uQ2FuY2VsYCBldmVudCBvZiB0aGUgYFJvdXRlcmAgdG8gaW5kaWNhdGUgdGhlXG4gKiByZWFzb24gYSBuYXZpZ2F0aW9uIGZhaWxlZC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBlbnVtIE5hdmlnYXRpb25DYW5jZWxsYXRpb25Db2RlIHtcbiAgLyoqXG4gICAqIEEgbmF2aWdhdGlvbiBmYWlsZWQgYmVjYXVzZSBhIGd1YXJkIHJldHVybmVkIGEgYFVybFRyZWVgIHRvIHJlZGlyZWN0LlxuICAgKi9cbiAgUmVkaXJlY3QsXG4gIC8qKlxuICAgKiBBIG5hdmlnYXRpb24gZmFpbGVkIGJlY2F1c2UgYSBtb3JlIHJlY2VudCBuYXZpZ2F0aW9uIHN0YXJ0ZWQuXG4gICAqL1xuICBTdXBlcnNlZGVkQnlOZXdOYXZpZ2F0aW9uLFxuICAvKipcbiAgICogQSBuYXZpZ2F0aW9uIGZhaWxlZCBiZWNhdXNlIG9uZSBvZiB0aGUgcmVzb2x2ZXJzIGNvbXBsZXRlZCB3aXRob3V0IGVtaXR0aW5nIGEgdmFsdWUuXG4gICAqL1xuICBOb0RhdGFGcm9tUmVzb2x2ZXIsXG4gIC8qKlxuICAgKiBBIG5hdmlnYXRpb24gZmFpbGVkIGJlY2F1c2UgYSBndWFyZCByZXR1cm5lZCBgZmFsc2VgLlxuICAgKi9cbiAgR3VhcmRSZWplY3RlZCxcbn1cblxuLyoqXG4gKiBBIGNvZGUgZm9yIHRoZSBgTmF2aWdhdGlvblNraXBwZWRgIGV2ZW50IG9mIHRoZSBgUm91dGVyYCB0byBpbmRpY2F0ZSB0aGVcbiAqIHJlYXNvbiBhIG5hdmlnYXRpb24gd2FzIHNraXBwZWQuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZW51bSBOYXZpZ2F0aW9uU2tpcHBlZENvZGUge1xuICAvKipcbiAgICogQSBuYXZpZ2F0aW9uIHdhcyBza2lwcGVkIGJlY2F1c2UgdGhlIG5hdmlnYXRpb24gVVJMIHdhcyB0aGUgc2FtZSBhcyB0aGUgY3VycmVudCBSb3V0ZXIgVVJMLlxuICAgKi9cbiAgSWdub3JlZFNhbWVVcmxOYXZpZ2F0aW9uLFxuICAvKipcbiAgICogQSBuYXZpZ2F0aW9uIHdhcyBza2lwcGVkIGJlY2F1c2UgdGhlIGNvbmZpZ3VyZWQgYFVybEhhbmRsaW5nU3RyYXRlZ3lgIHJldHVybiBgZmFsc2VgIGZvciBib3RoXG4gICAqIHRoZSBjdXJyZW50IFJvdXRlciBVUkwgYW5kIHRoZSB0YXJnZXQgb2YgdGhlIG5hdmlnYXRpb24uXG4gICAqXG4gICAqIEBzZWUge0BsaW5rIFVybEhhbmRsaW5nU3RyYXRlZ3l9XG4gICAqL1xuICBJZ25vcmVkQnlVcmxIYW5kbGluZ1N0cmF0ZWd5LFxufVxuXG4vKipcbiAqIEFuIGV2ZW50IHRyaWdnZXJlZCB3aGVuIGEgbmF2aWdhdGlvbiBpcyBjYW5jZWxlZCwgZGlyZWN0bHkgb3IgaW5kaXJlY3RseS5cbiAqIFRoaXMgY2FuIGhhcHBlbiBmb3Igc2V2ZXJhbCByZWFzb25zIGluY2x1ZGluZyB3aGVuIGEgcm91dGUgZ3VhcmRcbiAqIHJldHVybnMgYGZhbHNlYCBvciBpbml0aWF0ZXMgYSByZWRpcmVjdCBieSByZXR1cm5pbmcgYSBgVXJsVHJlZWAuXG4gKlxuICogQHNlZSB7QGxpbmsgTmF2aWdhdGlvblN0YXJ0fVxuICogQHNlZSB7QGxpbmsgTmF2aWdhdGlvbkVuZH1cbiAqIEBzZWUge0BsaW5rIE5hdmlnYXRpb25FcnJvcn1cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBOYXZpZ2F0aW9uQ2FuY2VsIGV4dGVuZHMgUm91dGVyRXZlbnQge1xuICByZWFkb25seSB0eXBlID0gRXZlbnRUeXBlLk5hdmlnYXRpb25DYW5jZWw7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICBpZDogbnVtYmVyLFxuICAgIC8qKiBAZG9jc05vdFJlcXVpcmVkICovXG4gICAgdXJsOiBzdHJpbmcsXG4gICAgLyoqXG4gICAgICogQSBkZXNjcmlwdGlvbiBvZiB3aHkgdGhlIG5hdmlnYXRpb24gd2FzIGNhbmNlbGxlZC4gRm9yIGRlYnVnIHB1cnBvc2VzIG9ubHkuIFVzZSBgY29kZWBcbiAgICAgKiBpbnN0ZWFkIGZvciBhIHN0YWJsZSBjYW5jZWxsYXRpb24gcmVhc29uIHRoYXQgY2FuIGJlIHVzZWQgaW4gcHJvZHVjdGlvbi5cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVhc29uOiBzdHJpbmcsXG4gICAgLyoqXG4gICAgICogQSBjb2RlIHRvIGluZGljYXRlIHdoeSB0aGUgbmF2aWdhdGlvbiB3YXMgY2FuY2VsZWQuIFRoaXMgY2FuY2VsbGF0aW9uIGNvZGUgaXMgc3RhYmxlIGZvclxuICAgICAqIHRoZSByZWFzb24gYW5kIGNhbiBiZSByZWxpZWQgb24gd2hlcmVhcyB0aGUgYHJlYXNvbmAgc3RyaW5nIGNvdWxkIGNoYW5nZSBhbmQgc2hvdWxkIG5vdCBiZVxuICAgICAqIHVzZWQgaW4gcHJvZHVjdGlvbi5cbiAgICAgKi9cbiAgICByZWFkb25seSBjb2RlPzogTmF2aWdhdGlvbkNhbmNlbGxhdGlvbkNvZGUsXG4gICkge1xuICAgIHN1cGVyKGlkLCB1cmwpO1xuICB9XG5cbiAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgb3ZlcnJpZGUgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYE5hdmlnYXRpb25DYW5jZWwoaWQ6ICR7dGhpcy5pZH0sIHVybDogJyR7dGhpcy51cmx9JylgO1xuICB9XG59XG5cbi8qKlxuICogQW4gZXZlbnQgdHJpZ2dlcmVkIHdoZW4gYSBuYXZpZ2F0aW9uIGlzIHNraXBwZWQuXG4gKiBUaGlzIGNhbiBoYXBwZW4gZm9yIGEgY291cGxlIHJlYXNvbnMgaW5jbHVkaW5nIG9uU2FtZVVybEhhbmRsaW5nXG4gKiBpcyBzZXQgdG8gYGlnbm9yZWAgYW5kIHRoZSBuYXZpZ2F0aW9uIFVSTCBpcyBub3QgZGlmZmVyZW50IHRoYW4gdGhlXG4gKiBjdXJyZW50IHN0YXRlLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIE5hdmlnYXRpb25Ta2lwcGVkIGV4dGVuZHMgUm91dGVyRXZlbnQge1xuICByZWFkb25seSB0eXBlID0gRXZlbnRUeXBlLk5hdmlnYXRpb25Ta2lwcGVkO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIC8qKiBAZG9jc05vdFJlcXVpcmVkICovXG4gICAgaWQ6IG51bWJlcixcbiAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgIHVybDogc3RyaW5nLFxuICAgIC8qKlxuICAgICAqIEEgZGVzY3JpcHRpb24gb2Ygd2h5IHRoZSBuYXZpZ2F0aW9uIHdhcyBza2lwcGVkLiBGb3IgZGVidWcgcHVycG9zZXMgb25seS4gVXNlIGBjb2RlYFxuICAgICAqIGluc3RlYWQgZm9yIGEgc3RhYmxlIHNraXBwZWQgcmVhc29uIHRoYXQgY2FuIGJlIHVzZWQgaW4gcHJvZHVjdGlvbi5cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVhc29uOiBzdHJpbmcsXG4gICAgLyoqXG4gICAgICogQSBjb2RlIHRvIGluZGljYXRlIHdoeSB0aGUgbmF2aWdhdGlvbiB3YXMgc2tpcHBlZC4gVGhpcyBjb2RlIGlzIHN0YWJsZSBmb3JcbiAgICAgKiB0aGUgcmVhc29uIGFuZCBjYW4gYmUgcmVsaWVkIG9uIHdoZXJlYXMgdGhlIGByZWFzb25gIHN0cmluZyBjb3VsZCBjaGFuZ2UgYW5kIHNob3VsZCBub3QgYmVcbiAgICAgKiB1c2VkIGluIHByb2R1Y3Rpb24uXG4gICAgICovXG4gICAgcmVhZG9ubHkgY29kZT86IE5hdmlnYXRpb25Ta2lwcGVkQ29kZSxcbiAgKSB7XG4gICAgc3VwZXIoaWQsIHVybCk7XG4gIH1cbn1cblxuLyoqXG4gKiBBbiBldmVudCB0cmlnZ2VyZWQgd2hlbiBhIG5hdmlnYXRpb24gZmFpbHMgZHVlIHRvIGFuIHVuZXhwZWN0ZWQgZXJyb3IuXG4gKlxuICogQHNlZSB7QGxpbmsgTmF2aWdhdGlvblN0YXJ0fVxuICogQHNlZSB7QGxpbmsgTmF2aWdhdGlvbkVuZH1cbiAqIEBzZWUge0BsaW5rIE5hdmlnYXRpb25DYW5jZWx9XG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgTmF2aWdhdGlvbkVycm9yIGV4dGVuZHMgUm91dGVyRXZlbnQge1xuICByZWFkb25seSB0eXBlID0gRXZlbnRUeXBlLk5hdmlnYXRpb25FcnJvcjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgIGlkOiBudW1iZXIsXG4gICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICB1cmw6IHN0cmluZyxcbiAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgIHB1YmxpYyBlcnJvcjogYW55LFxuICAgIC8qKlxuICAgICAqIFRoZSB0YXJnZXQgb2YgdGhlIG5hdmlnYXRpb24gd2hlbiB0aGUgZXJyb3Igb2NjdXJyZWQuXG4gICAgICpcbiAgICAgKiBOb3RlIHRoYXQgdGhpcyBjYW4gYmUgYHVuZGVmaW5lZGAgYmVjYXVzZSBhbiBlcnJvciBjb3VsZCBoYXZlIG9jY3VycmVkIGJlZm9yZSB0aGVcbiAgICAgKiBgUm91dGVyU3RhdGVTbmFwc2hvdGAgd2FzIGNyZWF0ZWQgZm9yIHRoZSBuYXZpZ2F0aW9uLlxuICAgICAqL1xuICAgIHJlYWRvbmx5IHRhcmdldD86IFJvdXRlclN0YXRlU25hcHNob3QsXG4gICkge1xuICAgIHN1cGVyKGlkLCB1cmwpO1xuICB9XG5cbiAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgb3ZlcnJpZGUgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYE5hdmlnYXRpb25FcnJvcihpZDogJHt0aGlzLmlkfSwgdXJsOiAnJHt0aGlzLnVybH0nLCBlcnJvcjogJHt0aGlzLmVycm9yfSlgO1xuICB9XG59XG5cbi8qKlxuICogQW4gZXZlbnQgdHJpZ2dlcmVkIHdoZW4gcm91dGVzIGFyZSByZWNvZ25pemVkLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIFJvdXRlc1JlY29nbml6ZWQgZXh0ZW5kcyBSb3V0ZXJFdmVudCB7XG4gIHJlYWRvbmx5IHR5cGUgPSBFdmVudFR5cGUuUm91dGVzUmVjb2duaXplZDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgIGlkOiBudW1iZXIsXG4gICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICB1cmw6IHN0cmluZyxcbiAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgIHB1YmxpYyB1cmxBZnRlclJlZGlyZWN0czogc3RyaW5nLFxuICAgIC8qKiBAZG9jc05vdFJlcXVpcmVkICovXG4gICAgcHVibGljIHN0YXRlOiBSb3V0ZXJTdGF0ZVNuYXBzaG90LFxuICApIHtcbiAgICBzdXBlcihpZCwgdXJsKTtcbiAgfVxuXG4gIC8qKiBAZG9jc05vdFJlcXVpcmVkICovXG4gIG92ZXJyaWRlIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBSb3V0ZXNSZWNvZ25pemVkKGlkOiAke3RoaXMuaWR9LCB1cmw6ICcke3RoaXMudXJsfScsIHVybEFmdGVyUmVkaXJlY3RzOiAnJHt0aGlzLnVybEFmdGVyUmVkaXJlY3RzfScsIHN0YXRlOiAke3RoaXMuc3RhdGV9KWA7XG4gIH1cbn1cblxuLyoqXG4gKiBBbiBldmVudCB0cmlnZ2VyZWQgYXQgdGhlIHN0YXJ0IG9mIHRoZSBHdWFyZCBwaGFzZSBvZiByb3V0aW5nLlxuICpcbiAqIEBzZWUge0BsaW5rIEd1YXJkc0NoZWNrRW5kfVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIEd1YXJkc0NoZWNrU3RhcnQgZXh0ZW5kcyBSb3V0ZXJFdmVudCB7XG4gIHJlYWRvbmx5IHR5cGUgPSBFdmVudFR5cGUuR3VhcmRzQ2hlY2tTdGFydDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgIGlkOiBudW1iZXIsXG4gICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICB1cmw6IHN0cmluZyxcbiAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgIHB1YmxpYyB1cmxBZnRlclJlZGlyZWN0czogc3RyaW5nLFxuICAgIC8qKiBAZG9jc05vdFJlcXVpcmVkICovXG4gICAgcHVibGljIHN0YXRlOiBSb3V0ZXJTdGF0ZVNuYXBzaG90LFxuICApIHtcbiAgICBzdXBlcihpZCwgdXJsKTtcbiAgfVxuXG4gIG92ZXJyaWRlIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBHdWFyZHNDaGVja1N0YXJ0KGlkOiAke3RoaXMuaWR9LCB1cmw6ICcke3RoaXMudXJsfScsIHVybEFmdGVyUmVkaXJlY3RzOiAnJHt0aGlzLnVybEFmdGVyUmVkaXJlY3RzfScsIHN0YXRlOiAke3RoaXMuc3RhdGV9KWA7XG4gIH1cbn1cblxuLyoqXG4gKiBBbiBldmVudCB0cmlnZ2VyZWQgYXQgdGhlIGVuZCBvZiB0aGUgR3VhcmQgcGhhc2Ugb2Ygcm91dGluZy5cbiAqXG4gKiBAc2VlIHtAbGluayBHdWFyZHNDaGVja1N0YXJ0fVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIEd1YXJkc0NoZWNrRW5kIGV4dGVuZHMgUm91dGVyRXZlbnQge1xuICByZWFkb25seSB0eXBlID0gRXZlbnRUeXBlLkd1YXJkc0NoZWNrRW5kO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIC8qKiBAZG9jc05vdFJlcXVpcmVkICovXG4gICAgaWQ6IG51bWJlcixcbiAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgIHVybDogc3RyaW5nLFxuICAgIC8qKiBAZG9jc05vdFJlcXVpcmVkICovXG4gICAgcHVibGljIHVybEFmdGVyUmVkaXJlY3RzOiBzdHJpbmcsXG4gICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICBwdWJsaWMgc3RhdGU6IFJvdXRlclN0YXRlU25hcHNob3QsXG4gICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICBwdWJsaWMgc2hvdWxkQWN0aXZhdGU6IGJvb2xlYW4sXG4gICkge1xuICAgIHN1cGVyKGlkLCB1cmwpO1xuICB9XG5cbiAgb3ZlcnJpZGUgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYEd1YXJkc0NoZWNrRW5kKGlkOiAke3RoaXMuaWR9LCB1cmw6ICcke3RoaXMudXJsfScsIHVybEFmdGVyUmVkaXJlY3RzOiAnJHt0aGlzLnVybEFmdGVyUmVkaXJlY3RzfScsIHN0YXRlOiAke3RoaXMuc3RhdGV9LCBzaG91bGRBY3RpdmF0ZTogJHt0aGlzLnNob3VsZEFjdGl2YXRlfSlgO1xuICB9XG59XG5cbi8qKlxuICogQW4gZXZlbnQgdHJpZ2dlcmVkIGF0IHRoZSBzdGFydCBvZiB0aGUgUmVzb2x2ZSBwaGFzZSBvZiByb3V0aW5nLlxuICpcbiAqIFJ1bnMgaW4gdGhlIFwicmVzb2x2ZVwiIHBoYXNlIHdoZXRoZXIgb3Igbm90IHRoZXJlIGlzIGFueXRoaW5nIHRvIHJlc29sdmUuXG4gKiBJbiBmdXR1cmUsIG1heSBjaGFuZ2UgdG8gb25seSBydW4gd2hlbiB0aGVyZSBhcmUgdGhpbmdzIHRvIGJlIHJlc29sdmVkLlxuICpcbiAqIEBzZWUge0BsaW5rIFJlc29sdmVFbmR9XG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgUmVzb2x2ZVN0YXJ0IGV4dGVuZHMgUm91dGVyRXZlbnQge1xuICByZWFkb25seSB0eXBlID0gRXZlbnRUeXBlLlJlc29sdmVTdGFydDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgIGlkOiBudW1iZXIsXG4gICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICB1cmw6IHN0cmluZyxcbiAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgIHB1YmxpYyB1cmxBZnRlclJlZGlyZWN0czogc3RyaW5nLFxuICAgIC8qKiBAZG9jc05vdFJlcXVpcmVkICovXG4gICAgcHVibGljIHN0YXRlOiBSb3V0ZXJTdGF0ZVNuYXBzaG90LFxuICApIHtcbiAgICBzdXBlcihpZCwgdXJsKTtcbiAgfVxuXG4gIG92ZXJyaWRlIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBSZXNvbHZlU3RhcnQoaWQ6ICR7dGhpcy5pZH0sIHVybDogJyR7dGhpcy51cmx9JywgdXJsQWZ0ZXJSZWRpcmVjdHM6ICcke3RoaXMudXJsQWZ0ZXJSZWRpcmVjdHN9Jywgc3RhdGU6ICR7dGhpcy5zdGF0ZX0pYDtcbiAgfVxufVxuXG4vKipcbiAqIEFuIGV2ZW50IHRyaWdnZXJlZCBhdCB0aGUgZW5kIG9mIHRoZSBSZXNvbHZlIHBoYXNlIG9mIHJvdXRpbmcuXG4gKiBAc2VlIHtAbGluayBSZXNvbHZlU3RhcnR9XG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgUmVzb2x2ZUVuZCBleHRlbmRzIFJvdXRlckV2ZW50IHtcbiAgcmVhZG9ubHkgdHlwZSA9IEV2ZW50VHlwZS5SZXNvbHZlRW5kO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIC8qKiBAZG9jc05vdFJlcXVpcmVkICovXG4gICAgaWQ6IG51bWJlcixcbiAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgIHVybDogc3RyaW5nLFxuICAgIC8qKiBAZG9jc05vdFJlcXVpcmVkICovXG4gICAgcHVibGljIHVybEFmdGVyUmVkaXJlY3RzOiBzdHJpbmcsXG4gICAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgICBwdWJsaWMgc3RhdGU6IFJvdXRlclN0YXRlU25hcHNob3QsXG4gICkge1xuICAgIHN1cGVyKGlkLCB1cmwpO1xuICB9XG5cbiAgb3ZlcnJpZGUgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYFJlc29sdmVFbmQoaWQ6ICR7dGhpcy5pZH0sIHVybDogJyR7dGhpcy51cmx9JywgdXJsQWZ0ZXJSZWRpcmVjdHM6ICcke3RoaXMudXJsQWZ0ZXJSZWRpcmVjdHN9Jywgc3RhdGU6ICR7dGhpcy5zdGF0ZX0pYDtcbiAgfVxufVxuXG4vKipcbiAqIEFuIGV2ZW50IHRyaWdnZXJlZCBiZWZvcmUgbGF6eSBsb2FkaW5nIGEgcm91dGUgY29uZmlndXJhdGlvbi5cbiAqXG4gKiBAc2VlIHtAbGluayBSb3V0ZUNvbmZpZ0xvYWRFbmR9XG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgUm91dGVDb25maWdMb2FkU3RhcnQge1xuICByZWFkb25seSB0eXBlID0gRXZlbnRUeXBlLlJvdXRlQ29uZmlnTG9hZFN0YXJ0O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIC8qKiBAZG9jc05vdFJlcXVpcmVkICovXG4gICAgcHVibGljIHJvdXRlOiBSb3V0ZSxcbiAgKSB7fVxuICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiBgUm91dGVDb25maWdMb2FkU3RhcnQocGF0aDogJHt0aGlzLnJvdXRlLnBhdGh9KWA7XG4gIH1cbn1cblxuLyoqXG4gKiBBbiBldmVudCB0cmlnZ2VyZWQgd2hlbiBhIHJvdXRlIGhhcyBiZWVuIGxhenkgbG9hZGVkLlxuICpcbiAqIEBzZWUge0BsaW5rIFJvdXRlQ29uZmlnTG9hZFN0YXJ0fVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIFJvdXRlQ29uZmlnTG9hZEVuZCB7XG4gIHJlYWRvbmx5IHR5cGUgPSBFdmVudFR5cGUuUm91dGVDb25maWdMb2FkRW5kO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIC8qKiBAZG9jc05vdFJlcXVpcmVkICovXG4gICAgcHVibGljIHJvdXRlOiBSb3V0ZSxcbiAgKSB7fVxuICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiBgUm91dGVDb25maWdMb2FkRW5kKHBhdGg6ICR7dGhpcy5yb3V0ZS5wYXRofSlgO1xuICB9XG59XG5cbi8qKlxuICogQW4gZXZlbnQgdHJpZ2dlcmVkIGF0IHRoZSBzdGFydCBvZiB0aGUgY2hpbGQtYWN0aXZhdGlvblxuICogcGFydCBvZiB0aGUgUmVzb2x2ZSBwaGFzZSBvZiByb3V0aW5nLlxuICogQHNlZSB7QGxpbmsgQ2hpbGRBY3RpdmF0aW9uRW5kfVxuICogQHNlZSB7QGxpbmsgUmVzb2x2ZVN0YXJ0fVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIENoaWxkQWN0aXZhdGlvblN0YXJ0IHtcbiAgcmVhZG9ubHkgdHlwZSA9IEV2ZW50VHlwZS5DaGlsZEFjdGl2YXRpb25TdGFydDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgIHB1YmxpYyBzbmFwc2hvdDogQWN0aXZhdGVkUm91dGVTbmFwc2hvdCxcbiAgKSB7fVxuICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIGNvbnN0IHBhdGggPSAodGhpcy5zbmFwc2hvdC5yb3V0ZUNvbmZpZyAmJiB0aGlzLnNuYXBzaG90LnJvdXRlQ29uZmlnLnBhdGgpIHx8ICcnO1xuICAgIHJldHVybiBgQ2hpbGRBY3RpdmF0aW9uU3RhcnQocGF0aDogJyR7cGF0aH0nKWA7XG4gIH1cbn1cblxuLyoqXG4gKiBBbiBldmVudCB0cmlnZ2VyZWQgYXQgdGhlIGVuZCBvZiB0aGUgY2hpbGQtYWN0aXZhdGlvbiBwYXJ0XG4gKiBvZiB0aGUgUmVzb2x2ZSBwaGFzZSBvZiByb3V0aW5nLlxuICogQHNlZSB7QGxpbmsgQ2hpbGRBY3RpdmF0aW9uU3RhcnR9XG4gKiBAc2VlIHtAbGluayBSZXNvbHZlU3RhcnR9XG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBDaGlsZEFjdGl2YXRpb25FbmQge1xuICByZWFkb25seSB0eXBlID0gRXZlbnRUeXBlLkNoaWxkQWN0aXZhdGlvbkVuZDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgIHB1YmxpYyBzbmFwc2hvdDogQWN0aXZhdGVkUm91dGVTbmFwc2hvdCxcbiAgKSB7fVxuICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIGNvbnN0IHBhdGggPSAodGhpcy5zbmFwc2hvdC5yb3V0ZUNvbmZpZyAmJiB0aGlzLnNuYXBzaG90LnJvdXRlQ29uZmlnLnBhdGgpIHx8ICcnO1xuICAgIHJldHVybiBgQ2hpbGRBY3RpdmF0aW9uRW5kKHBhdGg6ICcke3BhdGh9JylgO1xuICB9XG59XG5cbi8qKlxuICogQW4gZXZlbnQgdHJpZ2dlcmVkIGF0IHRoZSBzdGFydCBvZiB0aGUgYWN0aXZhdGlvbiBwYXJ0XG4gKiBvZiB0aGUgUmVzb2x2ZSBwaGFzZSBvZiByb3V0aW5nLlxuICogQHNlZSB7QGxpbmsgQWN0aXZhdGlvbkVuZH1cbiAqIEBzZWUge0BsaW5rIFJlc29sdmVTdGFydH1cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBBY3RpdmF0aW9uU3RhcnQge1xuICByZWFkb25seSB0eXBlID0gRXZlbnRUeXBlLkFjdGl2YXRpb25TdGFydDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgIHB1YmxpYyBzbmFwc2hvdDogQWN0aXZhdGVkUm91dGVTbmFwc2hvdCxcbiAgKSB7fVxuICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIGNvbnN0IHBhdGggPSAodGhpcy5zbmFwc2hvdC5yb3V0ZUNvbmZpZyAmJiB0aGlzLnNuYXBzaG90LnJvdXRlQ29uZmlnLnBhdGgpIHx8ICcnO1xuICAgIHJldHVybiBgQWN0aXZhdGlvblN0YXJ0KHBhdGg6ICcke3BhdGh9JylgO1xuICB9XG59XG5cbi8qKlxuICogQW4gZXZlbnQgdHJpZ2dlcmVkIGF0IHRoZSBlbmQgb2YgdGhlIGFjdGl2YXRpb24gcGFydFxuICogb2YgdGhlIFJlc29sdmUgcGhhc2Ugb2Ygcm91dGluZy5cbiAqIEBzZWUge0BsaW5rIEFjdGl2YXRpb25TdGFydH1cbiAqIEBzZWUge0BsaW5rIFJlc29sdmVTdGFydH1cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBBY3RpdmF0aW9uRW5kIHtcbiAgcmVhZG9ubHkgdHlwZSA9IEV2ZW50VHlwZS5BY3RpdmF0aW9uRW5kO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIC8qKiBAZG9jc05vdFJlcXVpcmVkICovXG4gICAgcHVibGljIHNuYXBzaG90OiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90LFxuICApIHt9XG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgY29uc3QgcGF0aCA9ICh0aGlzLnNuYXBzaG90LnJvdXRlQ29uZmlnICYmIHRoaXMuc25hcHNob3Qucm91dGVDb25maWcucGF0aCkgfHwgJyc7XG4gICAgcmV0dXJuIGBBY3RpdmF0aW9uRW5kKHBhdGg6ICcke3BhdGh9JylgO1xuICB9XG59XG5cbi8qKlxuICogQW4gZXZlbnQgdHJpZ2dlcmVkIGJ5IHNjcm9sbGluZy5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBTY3JvbGwge1xuICByZWFkb25seSB0eXBlID0gRXZlbnRUeXBlLlNjcm9sbDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgIHJlYWRvbmx5IHJvdXRlckV2ZW50OiBOYXZpZ2F0aW9uRW5kIHwgTmF2aWdhdGlvblNraXBwZWQsXG5cbiAgICAvKiogQGRvY3NOb3RSZXF1aXJlZCAqL1xuICAgIHJlYWRvbmx5IHBvc2l0aW9uOiBbbnVtYmVyLCBudW1iZXJdIHwgbnVsbCxcblxuICAgIC8qKiBAZG9jc05vdFJlcXVpcmVkICovXG4gICAgcmVhZG9ubHkgYW5jaG9yOiBzdHJpbmcgfCBudWxsLFxuICApIHt9XG5cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICBjb25zdCBwb3MgPSB0aGlzLnBvc2l0aW9uID8gYCR7dGhpcy5wb3NpdGlvblswXX0sICR7dGhpcy5wb3NpdGlvblsxXX1gIDogbnVsbDtcbiAgICByZXR1cm4gYFNjcm9sbChhbmNob3I6ICcke3RoaXMuYW5jaG9yfScsIHBvc2l0aW9uOiAnJHtwb3N9JylgO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBCZWZvcmVBY3RpdmF0ZVJvdXRlcyB7fVxuZXhwb3J0IGNsYXNzIFJlZGlyZWN0UmVxdWVzdCB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHJlYWRvbmx5IHVybDogVXJsVHJlZSxcbiAgICByZWFkb25seSBuYXZpZ2F0aW9uQmVoYXZpb3JPcHRpb25zOiBOYXZpZ2F0aW9uQmVoYXZpb3JPcHRpb25zIHwgdW5kZWZpbmVkLFxuICApIHt9XG59XG5leHBvcnQgdHlwZSBQcml2YXRlUm91dGVyRXZlbnRzID0gQmVmb3JlQWN0aXZhdGVSb3V0ZXMgfCBSZWRpcmVjdFJlcXVlc3Q7XG5cbi8qKlxuICogUm91dGVyIGV2ZW50cyB0aGF0IGFsbG93IHlvdSB0byB0cmFjayB0aGUgbGlmZWN5Y2xlIG9mIHRoZSByb3V0ZXIuXG4gKlxuICogVGhlIGV2ZW50cyBvY2N1ciBpbiB0aGUgZm9sbG93aW5nIHNlcXVlbmNlOlxuICpcbiAqICogW05hdmlnYXRpb25TdGFydF0oYXBpL3JvdXRlci9OYXZpZ2F0aW9uU3RhcnQpOiBOYXZpZ2F0aW9uIHN0YXJ0cy5cbiAqICogW1JvdXRlQ29uZmlnTG9hZFN0YXJ0XShhcGkvcm91dGVyL1JvdXRlQ29uZmlnTG9hZFN0YXJ0KTogQmVmb3JlXG4gKiB0aGUgcm91dGVyIFtsYXp5IGxvYWRzXShndWlkZS9yb3V0aW5nL2NvbW1vbi1yb3V0ZXItdGFza3MjbGF6eS1sb2FkaW5nKSBhIHJvdXRlIGNvbmZpZ3VyYXRpb24uXG4gKiAqIFtSb3V0ZUNvbmZpZ0xvYWRFbmRdKGFwaS9yb3V0ZXIvUm91dGVDb25maWdMb2FkRW5kKTogQWZ0ZXIgYSByb3V0ZSBoYXMgYmVlbiBsYXp5IGxvYWRlZC5cbiAqICogW1JvdXRlc1JlY29nbml6ZWRdKGFwaS9yb3V0ZXIvUm91dGVzUmVjb2duaXplZCk6IFdoZW4gdGhlIHJvdXRlciBwYXJzZXMgdGhlIFVSTFxuICogYW5kIHRoZSByb3V0ZXMgYXJlIHJlY29nbml6ZWQuXG4gKiAqIFtHdWFyZHNDaGVja1N0YXJ0XShhcGkvcm91dGVyL0d1YXJkc0NoZWNrU3RhcnQpOiBXaGVuIHRoZSByb3V0ZXIgYmVnaW5zIHRoZSAqZ3VhcmRzKlxuICogcGhhc2Ugb2Ygcm91dGluZy5cbiAqICogW0NoaWxkQWN0aXZhdGlvblN0YXJ0XShhcGkvcm91dGVyL0NoaWxkQWN0aXZhdGlvblN0YXJ0KTogV2hlbiB0aGUgcm91dGVyXG4gKiBiZWdpbnMgYWN0aXZhdGluZyBhIHJvdXRlJ3MgY2hpbGRyZW4uXG4gKiAqIFtBY3RpdmF0aW9uU3RhcnRdKGFwaS9yb3V0ZXIvQWN0aXZhdGlvblN0YXJ0KTogV2hlbiB0aGUgcm91dGVyIGJlZ2lucyBhY3RpdmF0aW5nIGEgcm91dGUuXG4gKiAqIFtHdWFyZHNDaGVja0VuZF0oYXBpL3JvdXRlci9HdWFyZHNDaGVja0VuZCk6IFdoZW4gdGhlIHJvdXRlciBmaW5pc2hlcyB0aGUgKmd1YXJkcypcbiAqIHBoYXNlIG9mIHJvdXRpbmcgc3VjY2Vzc2Z1bGx5LlxuICogKiBbUmVzb2x2ZVN0YXJ0XShhcGkvcm91dGVyL1Jlc29sdmVTdGFydCk6IFdoZW4gdGhlIHJvdXRlciBiZWdpbnMgdGhlICpyZXNvbHZlKlxuICogcGhhc2Ugb2Ygcm91dGluZy5cbiAqICogW1Jlc29sdmVFbmRdKGFwaS9yb3V0ZXIvUmVzb2x2ZUVuZCk6IFdoZW4gdGhlIHJvdXRlciBmaW5pc2hlcyB0aGUgKnJlc29sdmUqXG4gKiBwaGFzZSBvZiByb3V0aW5nIHN1Y2Nlc3NmdWxseS5cbiAqICogW0NoaWxkQWN0aXZhdGlvbkVuZF0oYXBpL3JvdXRlci9DaGlsZEFjdGl2YXRpb25FbmQpOiBXaGVuIHRoZSByb3V0ZXIgZmluaXNoZXNcbiAqIGFjdGl2YXRpbmcgYSByb3V0ZSdzIGNoaWxkcmVuLlxuICogKiBbQWN0aXZhdGlvbkVuZF0oYXBpL3JvdXRlci9BY3RpdmF0aW9uRW5kKTogV2hlbiB0aGUgcm91dGVyIGZpbmlzaGVzIGFjdGl2YXRpbmcgYSByb3V0ZS5cbiAqICogW05hdmlnYXRpb25FbmRdKGFwaS9yb3V0ZXIvTmF2aWdhdGlvbkVuZCk6IFdoZW4gbmF2aWdhdGlvbiBlbmRzIHN1Y2Nlc3NmdWxseS5cbiAqICogW05hdmlnYXRpb25DYW5jZWxdKGFwaS9yb3V0ZXIvTmF2aWdhdGlvbkNhbmNlbCk6IFdoZW4gbmF2aWdhdGlvbiBpcyBjYW5jZWxlZC5cbiAqICogW05hdmlnYXRpb25FcnJvcl0oYXBpL3JvdXRlci9OYXZpZ2F0aW9uRXJyb3IpOiBXaGVuIG5hdmlnYXRpb24gZmFpbHNcbiAqIGR1ZSB0byBhbiB1bmV4cGVjdGVkIGVycm9yLlxuICogKiBbU2Nyb2xsXShhcGkvcm91dGVyL1Njcm9sbCk6IFdoZW4gdGhlIHVzZXIgc2Nyb2xscy5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCB0eXBlIEV2ZW50ID1cbiAgfCBOYXZpZ2F0aW9uU3RhcnRcbiAgfCBOYXZpZ2F0aW9uRW5kXG4gIHwgTmF2aWdhdGlvbkNhbmNlbFxuICB8IE5hdmlnYXRpb25FcnJvclxuICB8IFJvdXRlc1JlY29nbml6ZWRcbiAgfCBHdWFyZHNDaGVja1N0YXJ0XG4gIHwgR3VhcmRzQ2hlY2tFbmRcbiAgfCBSb3V0ZUNvbmZpZ0xvYWRTdGFydFxuICB8IFJvdXRlQ29uZmlnTG9hZEVuZFxuICB8IENoaWxkQWN0aXZhdGlvblN0YXJ0XG4gIHwgQ2hpbGRBY3RpdmF0aW9uRW5kXG4gIHwgQWN0aXZhdGlvblN0YXJ0XG4gIHwgQWN0aXZhdGlvbkVuZFxuICB8IFNjcm9sbFxuICB8IFJlc29sdmVTdGFydFxuICB8IFJlc29sdmVFbmRcbiAgfCBOYXZpZ2F0aW9uU2tpcHBlZDtcblxuZXhwb3J0IGZ1bmN0aW9uIHN0cmluZ2lmeUV2ZW50KHJvdXRlckV2ZW50OiBFdmVudCk6IHN0cmluZyB7XG4gIHN3aXRjaCAocm91dGVyRXZlbnQudHlwZSkge1xuICAgIGNhc2UgRXZlbnRUeXBlLkFjdGl2YXRpb25FbmQ6XG4gICAgICByZXR1cm4gYEFjdGl2YXRpb25FbmQocGF0aDogJyR7cm91dGVyRXZlbnQuc25hcHNob3Qucm91dGVDb25maWc/LnBhdGggfHwgJyd9JylgO1xuICAgIGNhc2UgRXZlbnRUeXBlLkFjdGl2YXRpb25TdGFydDpcbiAgICAgIHJldHVybiBgQWN0aXZhdGlvblN0YXJ0KHBhdGg6ICcke3JvdXRlckV2ZW50LnNuYXBzaG90LnJvdXRlQ29uZmlnPy5wYXRoIHx8ICcnfScpYDtcbiAgICBjYXNlIEV2ZW50VHlwZS5DaGlsZEFjdGl2YXRpb25FbmQ6XG4gICAgICByZXR1cm4gYENoaWxkQWN0aXZhdGlvbkVuZChwYXRoOiAnJHtyb3V0ZXJFdmVudC5zbmFwc2hvdC5yb3V0ZUNvbmZpZz8ucGF0aCB8fCAnJ30nKWA7XG4gICAgY2FzZSBFdmVudFR5cGUuQ2hpbGRBY3RpdmF0aW9uU3RhcnQ6XG4gICAgICByZXR1cm4gYENoaWxkQWN0aXZhdGlvblN0YXJ0KHBhdGg6ICcke3JvdXRlckV2ZW50LnNuYXBzaG90LnJvdXRlQ29uZmlnPy5wYXRoIHx8ICcnfScpYDtcbiAgICBjYXNlIEV2ZW50VHlwZS5HdWFyZHNDaGVja0VuZDpcbiAgICAgIHJldHVybiBgR3VhcmRzQ2hlY2tFbmQoaWQ6ICR7cm91dGVyRXZlbnQuaWR9LCB1cmw6ICcke3JvdXRlckV2ZW50LnVybH0nLCB1cmxBZnRlclJlZGlyZWN0czogJyR7cm91dGVyRXZlbnQudXJsQWZ0ZXJSZWRpcmVjdHN9Jywgc3RhdGU6ICR7cm91dGVyRXZlbnQuc3RhdGV9LCBzaG91bGRBY3RpdmF0ZTogJHtyb3V0ZXJFdmVudC5zaG91bGRBY3RpdmF0ZX0pYDtcbiAgICBjYXNlIEV2ZW50VHlwZS5HdWFyZHNDaGVja1N0YXJ0OlxuICAgICAgcmV0dXJuIGBHdWFyZHNDaGVja1N0YXJ0KGlkOiAke3JvdXRlckV2ZW50LmlkfSwgdXJsOiAnJHtyb3V0ZXJFdmVudC51cmx9JywgdXJsQWZ0ZXJSZWRpcmVjdHM6ICcke3JvdXRlckV2ZW50LnVybEFmdGVyUmVkaXJlY3RzfScsIHN0YXRlOiAke3JvdXRlckV2ZW50LnN0YXRlfSlgO1xuICAgIGNhc2UgRXZlbnRUeXBlLk5hdmlnYXRpb25DYW5jZWw6XG4gICAgICByZXR1cm4gYE5hdmlnYXRpb25DYW5jZWwoaWQ6ICR7cm91dGVyRXZlbnQuaWR9LCB1cmw6ICcke3JvdXRlckV2ZW50LnVybH0nKWA7XG4gICAgY2FzZSBFdmVudFR5cGUuTmF2aWdhdGlvblNraXBwZWQ6XG4gICAgICByZXR1cm4gYE5hdmlnYXRpb25Ta2lwcGVkKGlkOiAke3JvdXRlckV2ZW50LmlkfSwgdXJsOiAnJHtyb3V0ZXJFdmVudC51cmx9JylgO1xuICAgIGNhc2UgRXZlbnRUeXBlLk5hdmlnYXRpb25FbmQ6XG4gICAgICByZXR1cm4gYE5hdmlnYXRpb25FbmQoaWQ6ICR7cm91dGVyRXZlbnQuaWR9LCB1cmw6ICcke3JvdXRlckV2ZW50LnVybH0nLCB1cmxBZnRlclJlZGlyZWN0czogJyR7cm91dGVyRXZlbnQudXJsQWZ0ZXJSZWRpcmVjdHN9JylgO1xuICAgIGNhc2UgRXZlbnRUeXBlLk5hdmlnYXRpb25FcnJvcjpcbiAgICAgIHJldHVybiBgTmF2aWdhdGlvbkVycm9yKGlkOiAke3JvdXRlckV2ZW50LmlkfSwgdXJsOiAnJHtyb3V0ZXJFdmVudC51cmx9JywgZXJyb3I6ICR7cm91dGVyRXZlbnQuZXJyb3J9KWA7XG4gICAgY2FzZSBFdmVudFR5cGUuTmF2aWdhdGlvblN0YXJ0OlxuICAgICAgcmV0dXJuIGBOYXZpZ2F0aW9uU3RhcnQoaWQ6ICR7cm91dGVyRXZlbnQuaWR9LCB1cmw6ICcke3JvdXRlckV2ZW50LnVybH0nKWA7XG4gICAgY2FzZSBFdmVudFR5cGUuUmVzb2x2ZUVuZDpcbiAgICAgIHJldHVybiBgUmVzb2x2ZUVuZChpZDogJHtyb3V0ZXJFdmVudC5pZH0sIHVybDogJyR7cm91dGVyRXZlbnQudXJsfScsIHVybEFmdGVyUmVkaXJlY3RzOiAnJHtyb3V0ZXJFdmVudC51cmxBZnRlclJlZGlyZWN0c30nLCBzdGF0ZTogJHtyb3V0ZXJFdmVudC5zdGF0ZX0pYDtcbiAgICBjYXNlIEV2ZW50VHlwZS5SZXNvbHZlU3RhcnQ6XG4gICAgICByZXR1cm4gYFJlc29sdmVTdGFydChpZDogJHtyb3V0ZXJFdmVudC5pZH0sIHVybDogJyR7cm91dGVyRXZlbnQudXJsfScsIHVybEFmdGVyUmVkaXJlY3RzOiAnJHtyb3V0ZXJFdmVudC51cmxBZnRlclJlZGlyZWN0c30nLCBzdGF0ZTogJHtyb3V0ZXJFdmVudC5zdGF0ZX0pYDtcbiAgICBjYXNlIEV2ZW50VHlwZS5Sb3V0ZUNvbmZpZ0xvYWRFbmQ6XG4gICAgICByZXR1cm4gYFJvdXRlQ29uZmlnTG9hZEVuZChwYXRoOiAke3JvdXRlckV2ZW50LnJvdXRlLnBhdGh9KWA7XG4gICAgY2FzZSBFdmVudFR5cGUuUm91dGVDb25maWdMb2FkU3RhcnQ6XG4gICAgICByZXR1cm4gYFJvdXRlQ29uZmlnTG9hZFN0YXJ0KHBhdGg6ICR7cm91dGVyRXZlbnQucm91dGUucGF0aH0pYDtcbiAgICBjYXNlIEV2ZW50VHlwZS5Sb3V0ZXNSZWNvZ25pemVkOlxuICAgICAgcmV0dXJuIGBSb3V0ZXNSZWNvZ25pemVkKGlkOiAke3JvdXRlckV2ZW50LmlkfSwgdXJsOiAnJHtyb3V0ZXJFdmVudC51cmx9JywgdXJsQWZ0ZXJSZWRpcmVjdHM6ICcke3JvdXRlckV2ZW50LnVybEFmdGVyUmVkaXJlY3RzfScsIHN0YXRlOiAke3JvdXRlckV2ZW50LnN0YXRlfSlgO1xuICAgIGNhc2UgRXZlbnRUeXBlLlNjcm9sbDpcbiAgICAgIGNvbnN0IHBvcyA9IHJvdXRlckV2ZW50LnBvc2l0aW9uXG4gICAgICAgID8gYCR7cm91dGVyRXZlbnQucG9zaXRpb25bMF19LCAke3JvdXRlckV2ZW50LnBvc2l0aW9uWzFdfWBcbiAgICAgICAgOiBudWxsO1xuICAgICAgcmV0dXJuIGBTY3JvbGwoYW5jaG9yOiAnJHtyb3V0ZXJFdmVudC5hbmNob3J9JywgcG9zaXRpb246ICcke3Bvc30nKWA7XG4gIH1cbn1cbiJdfQ==