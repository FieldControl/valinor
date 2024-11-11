/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Location } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { BeforeActivateRoutes, NavigationCancel, NavigationCancellationCode, NavigationEnd, NavigationError, NavigationSkipped, NavigationStart, RoutesRecognized, } from '../events';
import { ROUTER_CONFIGURATION } from '../router_config';
import { createEmptyState } from '../router_state';
import { UrlHandlingStrategy } from '../url_handling_strategy';
import { UrlSerializer, UrlTree } from '../url_tree';
import * as i0 from "@angular/core";
export class StateManager {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: StateManager, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: StateManager, providedIn: 'root', useFactory: () => inject(HistoryStateManager) }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: StateManager, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root', useFactory: () => inject(HistoryStateManager) }]
        }] });
export class HistoryStateManager extends StateManager {
    constructor() {
        super(...arguments);
        this.location = inject(Location);
        this.urlSerializer = inject(UrlSerializer);
        this.options = inject(ROUTER_CONFIGURATION, { optional: true }) || {};
        this.canceledNavigationResolution = this.options.canceledNavigationResolution || 'replace';
        this.urlHandlingStrategy = inject(UrlHandlingStrategy);
        this.urlUpdateStrategy = this.options.urlUpdateStrategy || 'deferred';
        this.currentUrlTree = new UrlTree();
        this.rawUrlTree = this.currentUrlTree;
        /**
         * The id of the currently active page in the router.
         * Updated to the transition's target id on a successful navigation.
         *
         * This is used to track what page the router last activated. When an attempted navigation fails,
         * the router can then use this to compute how to restore the state back to the previously active
         * page.
         */
        this.currentPageId = 0;
        this.lastSuccessfulId = -1;
        this.routerState = createEmptyState(null);
        this.stateMemento = this.createStateMemento();
    }
    getCurrentUrlTree() {
        return this.currentUrlTree;
    }
    getRawUrlTree() {
        return this.rawUrlTree;
    }
    restoredState() {
        return this.location.getState();
    }
    /**
     * The ɵrouterPageId of whatever page is currently active in the browser history. This is
     * important for computing the target page id for new navigations because we need to ensure each
     * page id in the browser history is 1 more than the previous entry.
     */
    get browserPageId() {
        if (this.canceledNavigationResolution !== 'computed') {
            return this.currentPageId;
        }
        return this.restoredState()?.ɵrouterPageId ?? this.currentPageId;
    }
    getRouterState() {
        return this.routerState;
    }
    createStateMemento() {
        return {
            rawUrlTree: this.rawUrlTree,
            currentUrlTree: this.currentUrlTree,
            routerState: this.routerState,
        };
    }
    registerNonRouterCurrentEntryChangeListener(listener) {
        return this.location.subscribe((event) => {
            if (event['type'] === 'popstate') {
                listener(event['url'], event.state);
            }
        });
    }
    handleRouterEvent(e, currentTransition) {
        if (e instanceof NavigationStart) {
            this.stateMemento = this.createStateMemento();
        }
        else if (e instanceof NavigationSkipped) {
            this.rawUrlTree = currentTransition.initialUrl;
        }
        else if (e instanceof RoutesRecognized) {
            if (this.urlUpdateStrategy === 'eager') {
                if (!currentTransition.extras.skipLocationChange) {
                    const rawUrl = this.urlHandlingStrategy.merge(currentTransition.finalUrl, currentTransition.initialUrl);
                    this.setBrowserUrl(currentTransition.targetBrowserUrl ?? rawUrl, currentTransition);
                }
            }
        }
        else if (e instanceof BeforeActivateRoutes) {
            this.currentUrlTree = currentTransition.finalUrl;
            this.rawUrlTree = this.urlHandlingStrategy.merge(currentTransition.finalUrl, currentTransition.initialUrl);
            this.routerState = currentTransition.targetRouterState;
            if (this.urlUpdateStrategy === 'deferred' && !currentTransition.extras.skipLocationChange) {
                this.setBrowserUrl(currentTransition.targetBrowserUrl ?? this.rawUrlTree, currentTransition);
            }
        }
        else if (e instanceof NavigationCancel &&
            (e.code === NavigationCancellationCode.GuardRejected ||
                e.code === NavigationCancellationCode.NoDataFromResolver)) {
            this.restoreHistory(currentTransition);
        }
        else if (e instanceof NavigationError) {
            this.restoreHistory(currentTransition, true);
        }
        else if (e instanceof NavigationEnd) {
            this.lastSuccessfulId = e.id;
            this.currentPageId = this.browserPageId;
        }
    }
    setBrowserUrl(url, transition) {
        const path = url instanceof UrlTree ? this.urlSerializer.serialize(url) : url;
        if (this.location.isCurrentPathEqualTo(path) || !!transition.extras.replaceUrl) {
            // replacements do not update the target page
            const currentBrowserPageId = this.browserPageId;
            const state = {
                ...transition.extras.state,
                ...this.generateNgRouterState(transition.id, currentBrowserPageId),
            };
            this.location.replaceState(path, '', state);
        }
        else {
            const state = {
                ...transition.extras.state,
                ...this.generateNgRouterState(transition.id, this.browserPageId + 1),
            };
            this.location.go(path, '', state);
        }
    }
    /**
     * Performs the necessary rollback action to restore the browser URL to the
     * state before the transition.
     */
    restoreHistory(navigation, restoringFromCaughtError = false) {
        if (this.canceledNavigationResolution === 'computed') {
            const currentBrowserPageId = this.browserPageId;
            const targetPagePosition = this.currentPageId - currentBrowserPageId;
            if (targetPagePosition !== 0) {
                this.location.historyGo(targetPagePosition);
            }
            else if (this.currentUrlTree === navigation.finalUrl && targetPagePosition === 0) {
                // We got to the activation stage (where currentUrlTree is set to the navigation's
                // finalUrl), but we weren't moving anywhere in history (skipLocationChange or replaceUrl).
                // We still need to reset the router state back to what it was when the navigation started.
                this.resetState(navigation);
                this.resetUrlToCurrentUrlTree();
            }
            else {
                // The browser URL and router state was not updated before the navigation cancelled so
                // there's no restoration needed.
            }
        }
        else if (this.canceledNavigationResolution === 'replace') {
            // TODO(atscott): It seems like we should _always_ reset the state here. It would be a no-op
            // for `deferred` navigations that haven't change the internal state yet because guards
            // reject. For 'eager' navigations, it seems like we also really should reset the state
            // because the navigation was cancelled. Investigate if this can be done by running TGP.
            if (restoringFromCaughtError) {
                this.resetState(navigation);
            }
            this.resetUrlToCurrentUrlTree();
        }
    }
    resetState(navigation) {
        this.routerState = this.stateMemento.routerState;
        this.currentUrlTree = this.stateMemento.currentUrlTree;
        // Note here that we use the urlHandlingStrategy to get the reset `rawUrlTree` because it may be
        // configured to handle only part of the navigation URL. This means we would only want to reset
        // the part of the navigation handled by the Angular router rather than the whole URL. In
        // addition, the URLHandlingStrategy may be configured to specifically preserve parts of the URL
        // when merging, such as the query params so they are not lost on a refresh.
        this.rawUrlTree = this.urlHandlingStrategy.merge(this.currentUrlTree, navigation.finalUrl ?? this.rawUrlTree);
    }
    resetUrlToCurrentUrlTree() {
        this.location.replaceState(this.urlSerializer.serialize(this.rawUrlTree), '', this.generateNgRouterState(this.lastSuccessfulId, this.currentPageId));
    }
    generateNgRouterState(navigationId, routerPageId) {
        if (this.canceledNavigationResolution === 'computed') {
            return { navigationId, ɵrouterPageId: routerPageId };
        }
        return { navigationId };
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: HistoryStateManager, deps: null, target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: HistoryStateManager, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: HistoryStateManager, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGVfbWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3JvdXRlci9zcmMvc3RhdGVtYW5hZ2VyL3N0YXRlX21hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQ3pDLE9BQU8sRUFBQyxNQUFNLEVBQUUsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBR2pELE9BQU8sRUFDTCxvQkFBb0IsRUFFcEIsZ0JBQWdCLEVBQ2hCLDBCQUEwQixFQUMxQixhQUFhLEVBQ2IsZUFBZSxFQUNmLGlCQUFpQixFQUNqQixlQUFlLEVBRWYsZ0JBQWdCLEdBQ2pCLE1BQU0sV0FBVyxDQUFDO0FBRW5CLE9BQU8sRUFBQyxvQkFBb0IsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBQ3RELE9BQU8sRUFBQyxnQkFBZ0IsRUFBYyxNQUFNLGlCQUFpQixDQUFDO0FBQzlELE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLDBCQUEwQixDQUFDO0FBQzdELE9BQU8sRUFBQyxhQUFhLEVBQUUsT0FBTyxFQUFDLE1BQU0sYUFBYSxDQUFDOztBQUduRCxNQUFNLE9BQWdCLFlBQVk7eUhBQVosWUFBWTs2SEFBWixZQUFZLGNBRFQsTUFBTSxjQUFjLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQzs7c0dBQ3hELFlBQVk7a0JBRGpDLFVBQVU7bUJBQUMsRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsbUJBQW1CLENBQUMsRUFBQzs7QUErRC9FLE1BQU0sT0FBTyxtQkFBb0IsU0FBUSxZQUFZO0lBRHJEOztRQUVtQixhQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzVCLGtCQUFhLEdBQUcsTUFBTSxDQUFDLGFB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UUFDaEcsK0ZBQStGO1FBQy9GLHlGQUF5RjtRQUN6RixnR0FBZ0c7UUFDaEcsNEVBQTRFO1FBQzVFLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FDOUMsSUFBSSxDQUFDLGNBQWMsRUFDbkIsVUFBVSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUN2QyxDQUFDO0lBQ0osQ0FBQztJQUVPLHdCQUF3QjtRQUM5QixJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FDeEIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUM3QyxFQUFFLEVBQ0YsSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQ3RFLENBQUM7SUFDSixDQUFDO0lBRU8scUJBQXFCLENBQUMsWUFBb0IsRUFBRSxZQUFvQjtRQUN0RSxJQUFJLElBQUksQ0FBQyw0QkFBNEIsS0FBSyxVQUFVLEVBQUUsQ0FBQztZQUNyRCxPQUFPLEVBQUMsWUFBWSxFQUFFLGFBQWEsRUFBRSxZQUFZLEVBQUMsQ0FBQztRQUNyRCxDQUFDO1FBQ0QsT0FBTyxFQUFDLFlBQVksRUFBQyxDQUFDO0lBQ3hCLENBQUM7eUhBbk1VLG1CQUFtQjs2SEFBbkIsbUJBQW1CLGNBRFAsTUFBTTs7c0dBQ2xCLG1CQUFtQjtrQkFEL0IsVUFBVTttQkFBQyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCB7TG9jYXRpb259IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge2luamVjdCwgSW5qZWN0YWJsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge1N1YnNjcmlwdGlvbkxpa2V9IGZyb20gJ3J4anMnO1xuXG5pbXBvcnQge1xuICBCZWZvcmVBY3RpdmF0ZVJvdXRlcyxcbiAgRXZlbnQsXG4gIE5hdmlnYXRpb25DYW5jZWwsXG4gIE5hdmlnYXRpb25DYW5jZWxsYXRpb25Db2RlLFxuICBOYXZpZ2F0aW9uRW5kLFxuICBOYXZpZ2F0aW9uRXJyb3IsXG4gIE5hdmlnYXRpb25Ta2lwcGVkLFxuICBOYXZpZ2F0aW9uU3RhcnQsXG4gIFByaXZhdGVSb3V0ZXJFdmVudHMsXG4gIFJvdXRlc1JlY29nbml6ZWQsXG59IGZyb20gJy4uL2V2ZW50cyc7XG5pbXBvcnQge05hdmlnYXRpb24sIFJlc3RvcmVkU3RhdGV9IGZyb20gJy4uL25hdmlnYXRpb25fdHJhbnNpdGlvbic7XG5pbXBvcnQge1JPVVRFUl9DT05GSUdVUkFUSU9OfSBmcm9tICcuLi9yb3V0ZXJfY29uZmlnJztcbmltcG9ydCB7Y3JlYXRlRW1wdHlTdGF0ZSwgUm91dGVyU3RhdGV9IGZyb20gJy4uL3JvdXRlcl9zdGF0ZSc7XG5pbXBvcnQge1VybEhhbmRsaW5nU3RyYXRlZ3l9IGZyb20gJy4uL3VybF9oYW5kbGluZ19zdHJhdGVneSc7XG5pbXBvcnQge1VybFNlcmlhbGl6ZXIsIFVybFRyZWV9IGZyb20gJy4uL3VybF90cmVlJztcblxuQEluamVjdGFibGUoe3Byb3ZpZGVkSW46ICdyb290JywgdXNlRmFjdG9yeTogKCkgPT4gaW5qZWN0KEhpc3RvcnlTdGF0ZU1hbmFnZXIpfSlcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBTdGF0ZU1hbmFnZXIge1xuICAvKipcbiAgICogUmV0dXJucyB0aGUgY3VycmVudGx5IGFjdGl2YXRlZCBgVXJsVHJlZWAuXG4gICAqXG4gICAqIFRoaXMgYFVybFRyZWVgIHNob3dzIG9ubHkgVVJMcyB0aGF0IHRoZSBgUm91dGVyYCBpcyBjb25maWd1cmVkIHRvIGhhbmRsZSAodGhyb3VnaFxuICAgKiBgVXJsSGFuZGxpbmdTdHJhdGVneWApLlxuICAgKlxuICAgKiBUaGUgdmFsdWUgaXMgc2V0IGFmdGVyIGZpbmRpbmcgdGhlIHJvdXRlIGNvbmZpZyB0cmVlIHRvIGFjdGl2YXRlIGJ1dCBiZWZvcmUgYWN0aXZhdGluZyB0aGVcbiAgICogcm91dGUuXG4gICAqL1xuICBhYnN0cmFjdCBnZXRDdXJyZW50VXJsVHJlZSgpOiBVcmxUcmVlO1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgYFVybFRyZWVgIHRoYXQgaXMgcmVwcmVzZW50cyB3aGF0IHRoZSBicm93c2VyIGlzIGFjdHVhbGx5IHNob3dpbmcuXG4gICAqXG4gICAqIEluIHRoZSBsaWZlIG9mIGEgbmF2aWdhdGlvbiB0cmFuc2l0aW9uOlxuICAgKiAxLiBXaGVuIGEgbmF2aWdhdGlvbiBiZWdpbnMsIHRoZSByYXcgYFVybFRyZWVgIGlzIHVwZGF0ZWQgdG8gdGhlIGZ1bGwgVVJMIHRoYXQncyBiZWluZ1xuICAgKiBuYXZpZ2F0ZWQgdG8uXG4gICAqIDIuIER1cmluZyBhIG5hdmlnYXRpb24sIHJlZGlyZWN0cyBhcmUgYXBwbGllZCwgd2hpY2ggbWlnaHQgb25seSBhcHBseSB0byBfcGFydF8gb2YgdGhlIFVSTCAoZHVlXG4gICAqIHRvIGBVcmxIYW5kbGluZ1N0cmF0ZWd5YCkuXG4gICAqIDMuIEp1c3QgYmVmb3JlIGFjdGl2YXRpb24sIHRoZSByYXcgYFVybFRyZWVgIGlzIHVwZGF0ZWQgdG8gaW5jbHVkZSB0aGUgcmVkaXJlY3RzIG9uIHRvcCBvZiB0aGVcbiAgICogb3JpZ2luYWwgcmF3IFVSTC5cbiAgICpcbiAgICogTm90ZSB0aGF0IHRoaXMgaXMgX29ubHlfIGhlcmUgdG8gc3VwcG9ydCBgVXJsSGFuZGxpbmdTdHJhdGVneS5leHRyYWN0YCBhbmRcbiAgICogYFVybEhhbmRsaW5nU3RyYXRlZ3kuc2hvdWxkUHJvY2Vzc1VybGAuIFdpdGhvdXQgdGhvc2UgQVBJcywgdGhlIGN1cnJlbnQgYFVybFRyZWVgIHdvdWxkIG5vdFxuICAgKiBkZXZpYXRlZCBmcm9tIHRoZSByYXcgYFVybFRyZWVgLlxuICAgKlxuICAgKiBGb3IgYGV4dHJhY3RgLCBhIHJhdyBgVXJsVHJlZWAgaXMgbmVlZGVkIGJlY2F1c2UgYGV4dHJhY3RgIG1heSBvbmx5IHJldHVybiBwYXJ0XG4gICAqIG9mIHRoZSBuYXZpZ2F0aW9uIFVSTC4gVGh1cywgdGhlIGN1cnJlbnQgYFVybFRyZWVgIG1heSBvbmx5IHJlcHJlc2VudCBfcGFydF8gb2YgdGhlIGJyb3dzZXJcbiAgICogVVJMLiBXaGVuIGEgbmF2aWdhdGlvbiBnZXRzIGNhbmNlbGxlZCBhbmQgdGhlIHJvdXRlciBuZWVkcyB0byByZXNldCB0aGUgVVJMIG9yIGEgbmV3IG5hdmlnYXRpb25cbiAgICogb2NjdXJzLCBpdCBuZWVkcyB0byBrbm93IHRoZSBfd2hvbGVfIGJyb3dzZXIgVVJMLCBub3QganVzdCB0aGUgcGFydCBoYW5kbGVkIGJ5XG4gICAqIGBVcmxIYW5kbGluZ1N0cmF0ZWd5YC5cbiAgICogRm9yIGBzaG91bGRQcm9jZXNzVXJsYCwgd2hlbiB0aGUgcmV0dXJuIGlzIGBmYWxzZWAsIHRoZSByb3V0ZXIgaWdub3JlcyB0aGUgbmF2aWdhdGlvbiBidXRcbiAgICogc3RpbGwgdXBkYXRlcyB0aGUgcmF3IGBVcmxUcmVlYCB3aXRoIHRoZSBhc3N1bXB0aW9uIHRoYXQgdGhlIG5hdmlnYXRpb24gd2FzIGNhdXNlZCBieSB0aGVcbiAgICogbG9jYXRpb24gY2hhbmdlIGxpc3RlbmVyIGR1ZSB0byBhIFVSTCB1cGRhdGUgYnkgdGhlIEFuZ3VsYXJKUyByb3V0ZXIuIEluIHRoaXMgY2FzZSwgdGhlIHJvdXRlclxuICAgKiBzdGlsbCBuZWVkIHRvIGtub3cgd2hhdCB0aGUgYnJvd3NlcidzIFVSTCBpcyBmb3IgZnV0dXJlIG5hdmlnYXRpb25zLlxuICAgKi9cbiAgYWJzdHJhY3QgZ2V0UmF3VXJsVHJlZSgpOiBVcmxUcmVlO1xuXG4gIC8qKiBSZXR1cm5zIHRoZSBjdXJyZW50IHN0YXRlIHN0b3JlZCBieSB0aGUgYnJvd3NlciBmb3IgdGhlIGN1cnJlbnQgaGlzdG9yeSBlbnRyeS4gKi9cbiAgYWJzdHJhY3QgcmVzdG9yZWRTdGF0ZSgpOiBSZXN0b3JlZFN0YXRlIHwgbnVsbCB8IHVuZGVmaW5lZDtcblxuICAvKiogUmV0dXJucyB0aGUgY3VycmVudCBSb3V0ZXJTdGF0ZS4gKi9cbiAgYWJzdHJhY3QgZ2V0Um91dGVyU3RhdGUoKTogUm91dGVyU3RhdGU7XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyBhIGxpc3RlbmVyIHRoYXQgaXMgY2FsbGVkIHdoZW5ldmVyIHRoZSBjdXJyZW50IGhpc3RvcnkgZW50cnkgY2hhbmdlcyBieSBzb21lIEFQSVxuICAgKiBvdXRzaWRlIHRoZSBSb3V0ZXIuIFRoaXMgaW5jbHVkZXMgdXNlci1hY3RpdmF0ZWQgY2hhbmdlcyBsaWtlIGJhY2sgYnV0dG9ucyBhbmQgbGluayBjbGlja3MsIGJ1dFxuICAgKiBhbHNvIGluY2x1ZGVzIHByb2dyYW1tYXRpYyBBUElzIGNhbGxlZCBieSBub24tUm91dGVyIEphdmFTY3JpcHQuXG4gICAqL1xuICBhYnN0cmFjdCByZWdpc3Rlck5vblJvdXRlckN1cnJlbnRFbnRyeUNoYW5nZUxpc3RlbmVyKFxuICAgIGxpc3RlbmVyOiAodXJsOiBzdHJpbmcsIHN0YXRlOiBSZXN0b3JlZFN0YXRlIHwgbnVsbCB8IHVuZGVmaW5lZCkgPT4gdm9pZCxcbiAgKTogU3Vic2NyaXB0aW9uTGlrZTtcblxuICAvKipcbiAgICogSGFuZGxlcyBhIG5hdmlnYXRpb24gZXZlbnQgc2VudCBmcm9tIHRoZSBSb3V0ZXIuIFRoZXNlIGFyZSB0eXBpY2FsbHkgZXZlbnRzIHRoYXQgaW5kaWNhdGUgYVxuICAgKiBuYXZpZ2F0aW9uIGhhcyBzdGFydGVkLCBwcm9ncmVzc2VkLCBiZWVuIGNhbmNlbGxlZCwgb3IgZmluaXNoZWQuXG4gICAqL1xuICBhYnN0cmFjdCBoYW5kbGVSb3V0ZXJFdmVudChlOiBFdmVudCB8IFByaXZhdGVSb3V0ZXJFdmVudHMsIGN1cnJlbnRUcmFuc2l0aW9uOiBOYXZpZ2F0aW9uKTogdm9pZDtcbn1cblxuQEluamVjdGFibGUoe3Byb3ZpZGVkSW46ICdyb290J30pXG5leHBvcnQgY2xhc3MgSGlzdG9yeVN0YXRlTWFuYWdlciBleHRlbmRzIFN0YXRlTWFuYWdlciB7XG4gIHByaXZhdGUgcmVhZG9ubHkgbG9jYXRpb24gPSBpbmplY3QoTG9jYXRpb24pO1xuICBwcml2YXRlIHJlYWRvbmx5IHVybFNlcmlhbGl6ZXIgPSBpbmplY3QoVXJsU2VyaWFsaXplcik7XG4gIHByaXZhdGUgcmVhZG9ubHkgb3B0aW9ucyA9IGluamVjdChST1VURVJfQ09ORklHVVJBVElPTiwge29wdGlvbmFsOiB0cnVlfSkgfHwge307XG4gIHByaXZhdGUgcmVhZG9ubHkgY2FuY2VsZWROYXZpZ2F0aW9uUmVzb2x1dGlvbiA9XG4gICAgdGhpcy5vcHRpb25zLmNhbmNlbGVkTmF2aWdhdGlvblJlc29sdXRpb24gfHwgJ3JlcGxhY2UnO1xuXG4gIHByaXZhdGUgdXJsSGFuZGxpbmdTdHJhdGVneSA9IGluamVjdChVcmxIYW5kbGluZ1N0cmF0ZWd5KTtcbiAgcHJpdmF0ZSB1cmxVcGRhdGVTdHJhdGVneSA9IHRoaXMub3B0aW9ucy51cmxVcGRhdGVTdHJhdGVneSB8fCAnZGVmZXJyZWQnO1xuXG4gIHByaXZhdGUgY3VycmVudFVybFRyZWUgPSBuZXcgVXJsVHJlZSgpO1xuXG4gIG92ZXJyaWRlIGdldEN1cnJlbnRVcmxUcmVlKCkge1xuICAgIHJldHVybiB0aGlzLmN1cnJlbnRVcmxUcmVlO1xuICB9XG5cbiAgcHJpdmF0ZSByYXdVcmxUcmVlID0gdGhpcy5jdXJyZW50VXJsVHJlZTtcblxuICBvdmVycmlkZSBnZXRSYXdVcmxUcmVlKCkge1xuICAgIHJldHVybiB0aGlzLnJhd1VybFRyZWU7XG4gIH1cblxuICAvKipcbiAgICogVGhlIGlkIG9mIHRoZSBjdXJyZW50bHkgYWN0aXZlIHBhZ2UgaW4gdGhlIHJvdXRlci5cbiAgICogVXBkYXRlZCB0byB0aGUgdHJhbnNpdGlvbidzIHRhcmdldCBpZCBvbiBhIHN1Y2Nlc3NmdWwgbmF2aWdhdGlvbi5cbiAgICpcbiAgICogVGhpcyBpcyB1c2VkIHRvIHRyYWNrIHdoYXQgcGFnZSB0aGUgcm91dGVyIGxhc3QgYWN0aXZhdGVkLiBXaGVuIGFuIGF0dGVtcHRlZCBuYXZpZ2F0aW9uIGZhaWxzLFxuICAgKiB0aGUgcm91dGVyIGNhbiB0aGVuIHVzZSB0aGlzIHRvIGNvbXB1dGUgaG93IHRvIHJlc3RvcmUgdGhlIHN0YXRlIGJhY2sgdG8gdGhlIHByZXZpb3VzbHkgYWN0aXZlXG4gICAqIHBhZ2UuXG4gICAqL1xuICBwcml2YXRlIGN1cnJlbnRQYWdlSWQ6IG51bWJlciA9IDA7XG4gIHByaXZhdGUgbGFzdFN1Y2Nlc3NmdWxJZDogbnVtYmVyID0gLTE7XG5cbiAgb3ZlcnJpZGUgcmVzdG9yZWRTdGF0ZSgpOiBSZXN0b3JlZFN0YXRlIHwgbnVsbCB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMubG9jYXRpb24uZ2V0U3RhdGUoKSBhcyBSZXN0b3JlZFN0YXRlIHwgbnVsbCB8IHVuZGVmaW5lZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgybVyb3V0ZXJQYWdlSWQgb2Ygd2hhdGV2ZXIgcGFnZSBpcyBjdXJyZW50bHkgYWN0aXZlIGluIHRoZSBicm93c2VyIGhpc3RvcnkuIFRoaXMgaXNcbiAgICogaW1wb3J0YW50IGZvciBjb21wdXRpbmcgdGhlIHRhcmdldCBwYWdlIGlkIGZvciBuZXcgbmF2aWdhdGlvbnMgYmVjYXVzZSB3ZSBuZWVkIHRvIGVuc3VyZSBlYWNoXG4gICAqIHBhZ2UgaWQgaW4gdGhlIGJyb3dzZXIgaGlzdG9yeSBpcyAxIG1vcmUgdGhhbiB0aGUgcHJldmlvdXMgZW50cnkuXG4gICAqL1xuICBwcml2YXRlIGdldCBicm93c2VyUGFnZUlkKCk6IG51bWJlciB7XG4gICAgaWYgKHRoaXMuY2FuY2VsZWROYXZpZ2F0aW9uUmVzb2x1dGlvbiAhPT0gJ2NvbXB1dGVkJykge1xuICAgICAgcmV0dXJuIHRoaXMuY3VycmVudFBhZ2VJZDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucmVzdG9yZWRTdGF0ZSgpPy7JtXJvdXRlclBhZ2VJZCA/PyB0aGlzLmN1cnJlbnRQYWdlSWQ7XG4gIH1cblxuICBwcml2YXRlIHJvdXRlclN0YXRlID0gY3JlYXRlRW1wdHlTdGF0ZShudWxsKTtcblxuICBvdmVycmlkZSBnZXRSb3V0ZXJTdGF0ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5yb3V0ZXJTdGF0ZTtcbiAgfVxuXG4gIHByaXZhdGUgc3RhdGVNZW1lbnRvID0gdGhpcy5jcmVhdGVTdGF0ZU1lbWVudG8oKTtcblxuICBwcml2YXRlIGNyZWF0ZVN0YXRlTWVtZW50bygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcmF3VXJsVHJlZTogdGhpcy5yYXdVcmxUcmVlLFxuICAgICAgY3VycmVudFVybFRyZWU6IHRoaXMuY3VycmVudFVybFRyZWUsXG4gICAgICByb3V0ZXJTdGF0ZTogdGhpcy5yb3V0ZXJTdGF0ZSxcbiAgICB9O1xuICB9XG5cbiAgb3ZlcnJpZGUgcmVnaXN0ZXJOb25Sb3V0ZXJDdXJyZW50RW50cnlDaGFuZ2VMaXN0ZW5lcihcbiAgICBsaXN0ZW5lcjogKHVybDogc3RyaW5nLCBzdGF0ZTogUmVzdG9yZWRTdGF0ZSB8IG51bGwgfCB1bmRlZmluZWQpID0+IHZvaWQsXG4gICk6IFN1YnNjcmlwdGlvbkxpa2Uge1xuICAgIHJldHVybiB0aGlzLmxvY2F0aW9uLnN1YnNjcmliZSgoZXZlbnQpID0+IHtcbiAgICAgIGlmIChldmVudFsndHlwZSddID09PSAncG9wc3RhdGUnKSB7XG4gICAgICAgIGxpc3RlbmVyKGV2ZW50Wyd1cmwnXSEsIGV2ZW50LnN0YXRlIGFzIFJlc3RvcmVkU3RhdGUgfCBudWxsIHwgdW5kZWZpbmVkKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIG92ZXJyaWRlIGhhbmRsZVJvdXRlckV2ZW50KGU6IEV2ZW50IHwgUHJpdmF0ZVJvdXRlckV2ZW50cywgY3VycmVudFRyYW5zaXRpb246IE5hdmlnYXRpb24pIHtcbiAgICBpZiAoZSBpbnN0YW5jZW9mIE5hdmlnYXRpb25TdGFydCkge1xuICAgICAgdGhpcy5zdGF0ZU1lbWVudG8gPSB0aGlzLmNyZWF0ZVN0YXRlTWVtZW50bygpO1xuICAgIH0gZWxzZSBpZiAoZSBpbnN0YW5jZW9mIE5hdmlnYXRpb25Ta2lwcGVkKSB7XG4gICAgICB0aGlzLnJhd1VybFRyZWUgPSBjdXJyZW50VHJhbnNpdGlvbi5pbml0aWFsVXJsO1xuICAgIH0gZWxzZSBpZiAoZSBpbnN0YW5jZW9mIFJvdXRlc1JlY29nbml6ZWQpIHtcbiAgICAgIGlmICh0aGlzLnVybFVwZGF0ZVN0cmF0ZWd5ID09PSAnZWFnZXInKSB7XG4gICAgICAgIGlmICghY3VycmVudFRyYW5zaXRpb24uZXh0cmFzLnNraXBMb2NhdGlvbkNoYW5nZSkge1xuICAgICAgICAgIGNvbnN0IHJhd1VybCA9IHRoaXMudXJsSGFuZGxpbmdTdHJhdGVneS5tZXJnZShcbiAgICAgICAgICAgIGN1cnJlbnRUcmFuc2l0aW9uLmZpbmFsVXJsISxcbiAgICAgICAgICAgIGN1cnJlbnRUcmFuc2l0aW9uLmluaXRpYWxVcmwsXG4gICAgICAgICAgKTtcbiAgICAgICAgICB0aGlzLnNldEJyb3dzZXJVcmwoY3VycmVudFRyYW5zaXRpb24udGFyZ2V0QnJvd3NlclVybCA/PyByYXdVcmwsIGN1cnJlbnRUcmFuc2l0aW9uKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoZSBpbnN0YW5jZW9mIEJlZm9yZUFjdGl2YXRlUm91dGVzKSB7XG4gICAgICB0aGlzLmN1cnJlbnRVcmxUcmVlID0gY3VycmVudFRyYW5zaXRpb24uZmluYWxVcmwhO1xuICAgICAgdGhpcy5yYXdVcmxUcmVlID0gdGhpcy51cmxIYW5kbGluZ1N0cmF0ZWd5Lm1lcmdlKFxuICAgICAgICBjdXJyZW50VHJhbnNpdGlvbi5maW5hbFVybCEsXG4gICAgICAgIGN1cnJlbnRUcmFuc2l0aW9uLmluaXRpYWxVcmwsXG4gICAgICApO1xuICAgICAgdGhpcy5yb3V0ZXJTdGF0ZSA9IGN1cnJlbnRUcmFuc2l0aW9uLnRhcmdldFJvdXRlclN0YXRlITtcbiAgICAgIGlmICh0aGlzLnVybFVwZGF0ZVN0cmF0ZWd5ID09PSAnZGVmZXJyZWQnICYmICFjdXJyZW50VHJhbnNpdGlvbi5leHRyYXMuc2tpcExvY2F0aW9uQ2hhbmdlKSB7XG4gICAgICAgIHRoaXMuc2V0QnJvd3NlclVybChcbiAgICAgICAgICBjdXJyZW50VHJhbnNpdGlvbi50YXJnZXRCcm93c2VyVXJsID8/IHRoaXMucmF3VXJsVHJlZSxcbiAgICAgICAgICBjdXJyZW50VHJhbnNpdGlvbixcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKFxuICAgICAgZSBpbnN0YW5jZW9mIE5hdmlnYXRpb25DYW5jZWwgJiZcbiAgICAgIChlLmNvZGUgPT09IE5hdmlnYXRpb25DYW5jZWxsYXRpb25Db2RlLkd1YXJkUmVqZWN0ZWQgfHxcbiAgICAgICAgZS5jb2RlID09PSBOYXZpZ2F0aW9uQ2FuY2VsbGF0aW9uQ29kZS5Ob0RhdGFGcm9tUmVzb2x2ZXIpXG4gICAgKSB7XG4gICAgICB0aGlzLnJlc3RvcmVIaXN0b3J5KGN1cnJlbnRUcmFuc2l0aW9uKTtcbiAgICB9IGVsc2UgaWYgKGUgaW5zdGFuY2VvZiBOYXZpZ2F0aW9uRXJyb3IpIHtcbiAgICAgIHRoaXMucmVzdG9yZUhpc3RvcnkoY3VycmVudFRyYW5zaXRpb24sIHRydWUpO1xuICAgIH0gZWxzZSBpZiAoZSBpbnN0YW5jZW9mIE5hdmlnYXRpb25FbmQpIHtcbiAgICAgIHRoaXMubGFzdFN1Y2Nlc3NmdWxJZCA9IGUuaWQ7XG4gICAgICB0aGlzLmN1cnJlbnRQYWdlSWQgPSB0aGlzLmJyb3dzZXJQYWdlSWQ7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBzZXRCcm93c2VyVXJsKHVybDogVXJsVHJlZSB8IHN0cmluZywgdHJhbnNpdGlvbjogTmF2aWdhdGlvbikge1xuICAgIGNvbnN0IHBhdGggPSB1cmwgaW5zdGFuY2VvZiBVcmxUcmVlID8gdGhpcy51cmxTZXJpYWxpemVyLnNlcmlhbGl6ZSh1cmwpIDogdXJsO1xuICAgIGlmICh0aGlzLmxvY2F0aW9uLmlzQ3VycmVudFBhdGhFcXVhbFRvKHBhdGgpIHx8ICEhdHJhbnNpdGlvbi5leHRyYXMucmVwbGFjZVVybCkge1xuICAgICAgLy8gcmVwbGFjZW1lbnRzIGRvIG5vdCB1cGRhdGUgdGhlIHRhcmdldCBwYWdlXG4gICAgICBjb25zdCBjdXJyZW50QnJvd3NlclBhZ2VJZCA9IHRoaXMuYnJvd3NlclBhZ2VJZDtcbiAgICAgIGNvbnN0IHN0YXRlID0ge1xuICAgICAgICAuLi50cmFuc2l0aW9uLmV4dHJhcy5zdGF0ZSxcbiAgICAgICAgLi4udGhpcy5nZW5lcmF0ZU5nUm91dGVyU3RhdGUodHJhbnNpdGlvbi5pZCwgY3VycmVudEJyb3dzZXJQYWdlSWQpLFxuICAgICAgfTtcbiAgICAgIHRoaXMubG9jYXRpb24ucmVwbGFjZVN0YXRlKHBhdGgsICcnLCBzdGF0ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHN0YXRlID0ge1xuICAgICAgICAuLi50cmFuc2l0aW9uLmV4dHJhcy5zdGF0ZSxcbiAgICAgICAgLi4udGhpcy5nZW5lcmF0ZU5nUm91dGVyU3RhdGUodHJhbnNpdGlvbi5pZCwgdGhpcy5icm93c2VyUGFnZUlkICsgMSksXG4gICAgICB9O1xuICAgICAgdGhpcy5sb2NhdGlvbi5nbyhwYXRoLCAnJywgc3RhdGUpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBQZXJmb3JtcyB0aGUgbmVjZXNzYXJ5IHJvbGxiYWNrIGFjdGlvbiB0byByZXN0b3JlIHRoZSBicm93c2VyIFVSTCB0byB0aGVcbiAgICogc3RhdGUgYmVmb3JlIHRoZSB0cmFuc2l0aW9uLlxuICAgKi9cbiAgcHJpdmF0ZSByZXN0b3JlSGlzdG9yeShuYXZpZ2F0aW9uOiBOYXZpZ2F0aW9uLCByZXN0b3JpbmdGcm9tQ2F1Z2h0RXJyb3IgPSBmYWxzZSkge1xuICAgIGlmICh0aGlzLmNhbmNlbGVkTmF2aWdhdGlvblJlc29sdXRpb24gPT09ICdjb21wdXRlZCcpIHtcbiAgICAgIGNvbnN0IGN1cnJlbnRCcm93c2VyUGFnZUlkID0gdGhpcy5icm93c2VyUGFnZUlkO1xuICAgICAgY29uc3QgdGFyZ2V0UGFnZVBvc2l0aW9uID0gdGhpcy5jdXJyZW50UGFnZUlkIC0gY3VycmVudEJyb3dzZXJQYWdlSWQ7XG4gICAgICBpZiAodGFyZ2V0UGFnZVBvc2l0aW9uICE9PSAwKSB7XG4gICAgICAgIHRoaXMubG9jYXRpb24uaGlzdG9yeUdvKHRhcmdldFBhZ2VQb3NpdGlvbik7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuY3VycmVudFVybFRyZWUgPT09IG5hdmlnYXRpb24uZmluYWxVcmwgJiYgdGFyZ2V0UGFnZVBvc2l0aW9uID09PSAwKSB7XG4gICAgICAgIC8vIFdlIGdvdCB0byB0aGUgYWN0aXZhdGlvbiBzdGFnZSAod2hlcmUgY3VycmVudFVybFRyZWUgaXMgc2V0IHRvIHRoZSBuYXZpZ2F0aW9uJ3NcbiAgICAgICAgLy8gZmluYWxVcmwpLCBidXQgd2Ugd2VyZW4ndCBtb3ZpbmcgYW55d2hlcmUgaW4gaGlzdG9yeSAoc2tpcExvY2F0aW9uQ2hhbmdlIG9yIHJlcGxhY2VVcmwpLlxuICAgICAgICAvLyBXZSBzdGlsbCBuZWVkIHRvIHJlc2V0IHRoZSByb3V0ZXIgc3RhdGUgYmFjayB0byB3aGF0IGl0IHdhcyB3aGVuIHRoZSBuYXZpZ2F0aW9uIHN0YXJ0ZWQuXG4gICAgICAgIHRoaXMucmVzZXRTdGF0ZShuYXZpZ2F0aW9uKTtcbiAgICAgICAgdGhpcy5yZXNldFVybFRvQ3VycmVudFVybFRyZWUoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFRoZSBicm93c2VyIFVSTCBhbmQgcm91dGVyIHN0YXRlIHdhcyBub3QgdXBkYXRlZCBiZWZvcmUgdGhlIG5hdmlnYXRpb24gY2FuY2VsbGVkIHNvXG4gICAgICAgIC8vIHRoZXJlJ3Mgbm8gcmVzdG9yYXRpb24gbmVlZGVkLlxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodGhpcy5jYW5jZWxlZE5hdmlnYXRpb25SZXNvbHV0aW9uID09PSAncmVwbGFjZScpIHtcbiAgICAgIC8vIFRPRE8oYXRzY290dCk6IEl0IHNlZW1zIGxpa2Ugd2Ugc2hvdWxkIF9hbHdheXNfIHJlc2V0IHRoZSBzdGF0ZSBoZXJlLiBJdCB3b3VsZCBiZSBhIG5vLW9wXG4gICAgICAvLyBmb3IgYGRlZmVycmVkYCBuYXZpZ2F0aW9ucyB0aGF0IGhhdmVuJ3QgY2hhbmdlIHRoZSBpbnRlcm5hbCBzdGF0ZSB5ZXQgYmVjYXVzZSBndWFyZHNcbiAgICAgIC8vIHJlamVjdC4gRm9yICdlYWdlcicgbmF2aWdhdGlvbnMsIGl0IHNlZW1zIGxpa2Ugd2UgYWxzbyByZWFsbHkgc2hvdWxkIHJlc2V0IHRoZSBzdGF0ZVxuICAgICAgLy8gYmVjYXVzZSB0aGUgbmF2aWdhdGlvbiB3YXMgY2FuY2VsbGVkLiBJbnZlc3RpZ2F0ZSBpZiB0aGlzIGNhbiBiZSBkb25lIGJ5IHJ1bm5pbmcgVEdQLlxuICAgICAgaWYgKHJlc3RvcmluZ0Zyb21DYXVnaHRFcnJvcikge1xuICAgICAgICB0aGlzLnJlc2V0U3RhdGUobmF2aWdhdGlvbik7XG4gICAgICB9XG4gICAgICB0aGlzLnJlc2V0VXJsVG9DdXJyZW50VXJsVHJlZSgpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcmVzZXRTdGF0ZShuYXZpZ2F0aW9uOiBOYXZpZ2F0aW9uKTogdm9pZCB7XG4gICAgdGhpcy5yb3V0ZXJTdGF0ZSA9IHRoaXMuc3RhdGVNZW1lbnRvLnJvdXRlclN0YXRlO1xuICAgIHRoaXMuY3VycmVudFVybFRyZWUgPSB0aGlzLnN0YXRlTWVtZW50by5jdXJyZW50VXJsVHJlZTtcbiAgICAvLyBOb3RlIGhlcmUgdGhhdCB3ZSB1c2UgdGhlIHVybEhhbmRsaW5nU3RyYXRlZ3kgdG8gZ2V0IHRoZSByZXNldCBgcmF3VXJsVHJlZWAgYmVjYXVzZSBpdCBtYXkgYmVcbiAgICAvLyBjb25maWd1cmVkIHRvIGhhbmRsZSBvbmx5IHBhcnQgb2YgdGhlIG5hdmlnYXRpb24gVVJMLiBUaGlzIG1lYW5zIHdlIHdvdWxkIG9ubHkgd2FudCB0byByZXNldFxuICAgIC8vIHRoZSBwYXJ0IG9mIHRoZSBuYXZpZ2F0aW9uIGhhbmRsZWQgYnkgdGhlIEFuZ3VsYXIgcm91dGVyIHJhdGhlciB0aGFuIHRoZSB3aG9sZSBVUkwuIEluXG4gICAgLy8gYWRkaXRpb24sIHRoZSBVUkxIYW5kbGluZ1N0cmF0ZWd5IG1heSBiZSBjb25maWd1cmVkIHRvIHNwZWNpZmljYWxseSBwcmVzZXJ2ZSBwYXJ0cyBvZiB0aGUgVVJMXG4gICAgLy8gd2hlbiBtZXJnaW5nLCBzdWNoIGFzIHRoZSBxdWVyeSBwYXJhbXMgc28gdGhleSBhcmUgbm90IGxvc3Qgb24gYSByZWZyZXNoLlxuICAgIHRoaXMucmF3VXJsVHJlZSA9IHRoaXMudXJsSGFuZGxpbmdTdHJhdGVneS5tZXJnZShcbiAgICAgIHRoaXMuY3VycmVudFVybFRyZWUsXG4gICAgICBuYXZpZ2F0aW9uLmZpbmFsVXJsID8/IHRoaXMucmF3VXJsVHJlZSxcbiAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSByZXNldFVybFRvQ3VycmVudFVybFRyZWUoKTogdm9pZCB7XG4gICAgdGhpcy5sb2NhdGlvbi5yZXBsYWNlU3RhdGUoXG4gICAgICB0aGlzLnVybFNlcmlhbGl6ZXIuc2VyaWFsaXplKHRoaXMucmF3VXJsVHJlZSksXG4gICAgICAnJyxcbiAgICAgIHRoaXMuZ2VuZXJhdGVOZ1JvdXRlclN0YXRlKHRoaXMubGFzdFN1Y2Nlc3NmdWxJZCwgdGhpcy5jdXJyZW50UGFnZUlkKSxcbiAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSBnZW5lcmF0ZU5nUm91dGVyU3RhdGUobmF2aWdhdGlvbklkOiBudW1iZXIsIHJvdXRlclBhZ2VJZDogbnVtYmVyKSB7XG4gICAgaWYgKHRoaXMuY2FuY2VsZWROYXZpZ2F0aW9uUmVzb2x1dGlvbiA9PT0gJ2NvbXB1dGVkJykge1xuICAgICAgcmV0dXJuIHtuYXZpZ2F0aW9uSWQsIMm1cm91dGVyUGFnZUlkOiByb3V0ZXJQYWdlSWR9O1xuICAgIH1cbiAgICByZXR1cm4ge25hdmlnYXRpb25JZH07XG4gIH1cbn1cbiJdfQ==