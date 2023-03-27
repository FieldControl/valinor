/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { LocationStrategy } from '@angular/common';
import { Attribute, Directive, ElementRef, HostBinding, HostListener, Input, Renderer2, ɵcoerceToBoolean as coerceToBoolean, ɵɵsanitizeUrlOrResourceUrl } from '@angular/core';
import { Subject } from 'rxjs';
import { NavigationEnd } from '../events';
import { Router } from '../router';
import { ActivatedRoute } from '../router_state';
import * as i0 from "@angular/core";
import * as i1 from "../router";
import * as i2 from "../router_state";
import * as i3 from "@angular/common";
/**
 * @description
 *
 * When applied to an element in a template, makes that element a link
 * that initiates navigation to a route. Navigation opens one or more routed components
 * in one or more `<router-outlet>` locations on the page.
 *
 * Given a route configuration `[{ path: 'user/:name', component: UserCmp }]`,
 * the following creates a static link to the route:
 * `<a routerLink="/user/bob">link to user component</a>`
 *
 * You can use dynamic values to generate the link.
 * For a dynamic link, pass an array of path segments,
 * followed by the params for each segment.
 * For example, `['/team', teamId, 'user', userName, {details: true}]`
 * generates a link to `/team/11/user/bob;details=true`.
 *
 * Multiple static segments can be merged into one term and combined with dynamic segments.
 * For example, `['/team/11/user', userName, {details: true}]`
 *
 * The input that you provide to the link is treated as a delta to the current URL.
 * For instance, suppose the current URL is `/user/(box//aux:team)`.
 * The link `<a [routerLink]="['/user/jim']">Jim</a>` creates the URL
 * `/user/(jim//aux:team)`.
 * See {@link Router#createUrlTree createUrlTree} for more information.
 *
 * @usageNotes
 *
 * You can use absolute or relative paths in a link, set query parameters,
 * control how parameters are handled, and keep a history of navigation states.
 *
 * ### Relative link paths
 *
 * The first segment name can be prepended with `/`, `./`, or `../`.
 * * If the first segment begins with `/`, the router looks up the route from the root of the
 *   app.
 * * If the first segment begins with `./`, or doesn't begin with a slash, the router
 *   looks in the children of the current activated route.
 * * If the first segment begins with `../`, the router goes up one level in the route tree.
 *
 * ### Setting and handling query params and fragments
 *
 * The following link adds a query parameter and a fragment to the generated URL:
 *
 * ```
 * <a [routerLink]="['/user/bob']" [queryParams]="{debug: true}" fragment="education">
 *   link to user component
 * </a>
 * ```
 * By default, the directive constructs the new URL using the given query parameters.
 * The example generates the link: `/user/bob?debug=true#education`.
 *
 * You can instruct the directive to handle query parameters differently
 * by specifying the `queryParamsHandling` option in the link.
 * Allowed values are:
 *
 *  - `'merge'`: Merge the given `queryParams` into the current query params.
 *  - `'preserve'`: Preserve the current query params.
 *
 * For example:
 *
 * ```
 * <a [routerLink]="['/user/bob']" [queryParams]="{debug: true}" queryParamsHandling="merge">
 *   link to user component
 * </a>
 * ```
 *
 * See {@link UrlCreationOptions.queryParamsHandling UrlCreationOptions#queryParamsHandling}.
 *
 * ### Preserving navigation history
 *
 * You can provide a `state` value to be persisted to the browser's
 * [`History.state` property](https://developer.mozilla.org/en-US/docs/Web/API/History#Properties).
 * For example:
 *
 * ```
 * <a [routerLink]="['/user/bob']" [state]="{tracingId: 123}">
 *   link to user component
 * </a>
 * ```
 *
 * Use {@link Router.getCurrentNavigation() Router#getCurrentNavigation} to retrieve a saved
 * navigation-state value. For example, to capture the `tracingId` during the `NavigationStart`
 * event:
 *
 * ```
 * // Get NavigationStart events
 * router.events.pipe(filter(e => e instanceof NavigationStart)).subscribe(e => {
 *   const navigation = router.getCurrentNavigation();
 *   tracingService.trace({id: navigation.extras.state.tracingId});
 * });
 * ```
 *
 * @ngModule RouterModule
 *
 * @publicApi
 */
export class RouterLink {
    constructor(router, route, tabIndexAttribute, renderer, el, locationStrategy) {
        this.router = router;
        this.route = route;
        this.tabIndexAttribute = tabIndexAttribute;
        this.renderer = renderer;
        this.el = el;
        this.locationStrategy = locationStrategy;
        this._preserveFragment = false;
        this._skipLocationChange = false;
        this._replaceUrl = false;
        /**
         * Represents an `href` attribute value applied to a host element,
         * when a host element is `<a>`. For other tags, the value is `null`.
         */
        this.href = null;
        this.commands = null;
        /** @internal */
        this.onChanges = new Subject();
        const tagName = el.nativeElement.tagName?.toLowerCase();
        this.isAnchorElement = tagName === 'a' || tagName === 'area';
        if (this.isAnchorElement) {
            this.subscription = router.events.subscribe((s) => {
                if (s instanceof NavigationEnd) {
                    this.updateHref();
                }
            });
        }
        else {
            this.setTabIndexIfNotOnNativeEl('0');
        }
    }
    /**
     * Passed to {@link Router#createUrlTree Router#createUrlTree} as part of the
     * `UrlCreationOptions`.
     * @see {@link UrlCreationOptions#preserveFragment UrlCreationOptions#preserveFragment}
     * @see {@link Router#createUrlTree Router#createUrlTree}
     */
    set preserveFragment(preserveFragment) {
        this._preserveFragment = coerceToBoolean(preserveFragment);
    }
    get preserveFragment() {
        return this._preserveFragment;
    }
    /**
     * Passed to {@link Router#navigateByUrl Router#navigateByUrl} as part of the
     * `NavigationBehaviorOptions`.
     * @see {@link NavigationBehaviorOptions#skipLocationChange NavigationBehaviorOptions#skipLocationChange}
     * @see {@link Router#navigateByUrl Router#navigateByUrl}
     */
    set skipLocationChange(skipLocationChange) {
        this._skipLocationChange = coerceToBoolean(skipLocationChange);
    }
    get skipLocationChange() {
        return this._skipLocationChange;
    }
    /**
     * Passed to {@link Router#navigateByUrl Router#navigateByUrl} as part of the
     * `NavigationBehaviorOptions`.
     * @see {@link NavigationBehaviorOptions#replaceUrl NavigationBehaviorOptions#replaceUrl}
     * @see {@link Router#navigateByUrl Router#navigateByUrl}
     */
    set replaceUrl(replaceUrl) {
        this._replaceUrl = coerceToBoolean(replaceUrl);
    }
    get replaceUrl() {
        return this._replaceUrl;
    }
    /**
     * Modifies the tab index if there was not a tabindex attribute on the element during
     * instantiation.
     */
    setTabIndexIfNotOnNativeEl(newTabIndex) {
        if (this.tabIndexAttribute != null /* both `null` and `undefined` */ || this.isAnchorElement) {
            return;
        }
        this.applyAttributeValue('tabindex', newTabIndex);
    }
    /** @nodoc */
    ngOnChanges(changes) {
        if (this.isAnchorElement) {
            this.updateHref();
        }
        // This is subscribed to by `RouterLinkActive` so that it knows to update when there are changes
        // to the RouterLinks it's tracking.
        this.onChanges.next(this);
    }
    /**
     * Commands to pass to {@link Router#createUrlTree Router#createUrlTree}.
     *   - **array**: commands to pass to {@link Router#createUrlTree Router#createUrlTree}.
     *   - **string**: shorthand for array of commands with just the string, i.e. `['/route']`
     *   - **null|undefined**: effectively disables the `routerLink`
     * @see {@link Router#createUrlTree Router#createUrlTree}
     */
    set routerLink(commands) {
        if (commands != null) {
            this.commands = Array.isArray(commands) ? commands : [commands];
            this.setTabIndexIfNotOnNativeEl('0');
        }
        else {
            this.commands = null;
            this.setTabIndexIfNotOnNativeEl(null);
        }
    }
    /** @nodoc */
    onClick(button, ctrlKey, shiftKey, altKey, metaKey) {
        if (this.urlTree === null) {
            return true;
        }
        if (this.isAnchorElement) {
            if (button !== 0 || ctrlKey || shiftKey || altKey || metaKey) {
                return true;
            }
            if (typeof this.target === 'string' && this.target != '_self') {
                return true;
            }
        }
        const extras = {
            skipLocationChange: this.skipLocationChange,
            replaceUrl: this.replaceUrl,
            state: this.state,
        };
        this.router.navigateByUrl(this.urlTree, extras);
        // Return `false` for `<a>` elements to prevent default action
        // and cancel the native behavior, since the navigation is handled
        // by the Router.
        return !this.isAnchorElement;
    }
    /** @nodoc */
    ngOnDestroy() {
        this.subscription?.unsubscribe();
    }
    updateHref() {
        this.href = this.urlTree !== null && this.locationStrategy ?
            this.locationStrategy?.prepareExternalUrl(this.router.serializeUrl(this.urlTree)) :
            null;
        const sanitizedValue = this.href === null ?
            null :
            // This class represents a directive that can be added to both `<a>` elements,
            // as well as other elements. As a result, we can't define security context at
            // compile time. So the security context is deferred to runtime.
            // The `ɵɵsanitizeUrlOrResourceUrl` selects the necessary sanitizer function
            // based on the tag and property names. The logic mimics the one from
            // `packages/compiler/src/schema/dom_security_schema.ts`, which is used at compile time.
            //
            // Note: we should investigate whether we can switch to using `@HostBinding('attr.href')`
            // instead of applying a value via a renderer, after a final merge of the
            // `RouterLinkWithHref` directive.
            ɵɵsanitizeUrlOrResourceUrl(this.href, this.el.nativeElement.tagName.toLowerCase(), 'href');
        this.applyAttributeValue('href', sanitizedValue);
    }
    applyAttributeValue(attrName, attrValue) {
        const renderer = this.renderer;
        const nativeElement = this.el.nativeElement;
        if (attrValue !== null) {
            renderer.setAttribute(nativeElement, attrName, attrValue);
        }
        else {
            renderer.removeAttribute(nativeElement, attrName);
        }
    }
    get urlTree() {
        if (this.commands === null) {
            return null;
        }
        return this.router.createUrlTree(this.commands, {
            // If the `relativeTo` input is not defined, we want to use `this.route` by default.
            // Otherwise, we should use the value provided by the user in the input.
            relativeTo: this.relativeTo !== undefined ? this.relativeTo : this.route,
            queryParams: this.queryParams,
            fragment: this.fragment,
            queryParamsHandling: this.queryParamsHandling,
            preserveFragment: this.preserveFragment,
        });
    }
}
RouterLink.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0", ngImport: i0, type: RouterLink, deps: [{ token: i1.Router }, { token: i2.ActivatedRoute }, { token: 'tabindex', attribute: true }, { token: i0.Renderer2 }, { token: i0.ElementRef }, { token: i3.LocationStrategy }], target: i0.ɵɵFactoryTarget.Directive });
RouterLink.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "15.2.0", type: RouterLink, isStandalone: true, selector: "[routerLink]", inputs: { target: "target", queryParams: "queryParams", fragment: "fragment", queryParamsHandling: "queryParamsHandling", state: "state", relativeTo: "relativeTo", preserveFragment: "preserveFragment", skipLocationChange: "skipLocationChange", replaceUrl: "replaceUrl", routerLink: "routerLink" }, host: { listeners: { "click": "onClick($event.button,$event.ctrlKey,$event.shiftKey,$event.altKey,$event.metaKey)" }, properties: { "attr.target": "this.target" } }, usesOnChanges: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0", ngImport: i0, type: RouterLink, decorators: [{
            type: Directive,
            args: [{
                    selector: '[routerLink]',
                    standalone: true,
                }]
        }], ctorParameters: function () { return [{ type: i1.Router }, { type: i2.ActivatedRoute }, { type: undefined, decorators: [{
                    type: Attribute,
                    args: ['tabindex']
                }] }, { type: i0.Renderer2 }, { type: i0.ElementRef }, { type: i3.LocationStrategy }]; }, propDecorators: { target: [{
                type: HostBinding,
                args: ['attr.target']
            }, {
                type: Input
            }], queryParams: [{
                type: Input
            }], fragment: [{
                type: Input
            }], queryParamsHandling: [{
                type: Input
            }], state: [{
                type: Input
            }], relativeTo: [{
                type: Input
            }], preserveFragment: [{
                type: Input
            }], skipLocationChange: [{
                type: Input
            }], replaceUrl: [{
                type: Input
            }], routerLink: [{
                type: Input
            }], onClick: [{
                type: HostListener,
                args: ['click',
                    ['$event.button', '$event.ctrlKey', '$event.shiftKey', '$event.altKey', '$event.metaKey']]
            }] } });
/**
 * @description
 * An alias for the `RouterLink` directive.
 * Deprecated since v15, use `RouterLink` directive instead.
 *
 * @deprecated use `RouterLink` directive instead.
 * @publicApi
 */
export { RouterLink as RouterLinkWithHref };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyX2xpbmsuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9yb3V0ZXIvc3JjL2RpcmVjdGl2ZXMvcm91dGVyX2xpbmsudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDakQsT0FBTyxFQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUF3QixTQUFTLEVBQWlCLGdCQUFnQixJQUFJLGVBQWUsRUFBRSwwQkFBMEIsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUNsTixPQUFPLEVBQUMsT0FBTyxFQUFlLE1BQU0sTUFBTSxDQUFDO0FBRTNDLE9BQU8sRUFBUSxhQUFhLEVBQUMsTUFBTSxXQUFXLENBQUM7QUFFL0MsT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUNqQyxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0saUJBQWlCLENBQUM7Ozs7O0FBSy9DOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FnR0c7QUFLSCxNQUFNLE9BQU8sVUFBVTtJQWtFckIsWUFDWSxNQUFjLEVBQVUsS0FBcUIsRUFDYixpQkFBd0MsRUFDL0QsUUFBbUIsRUFBbUIsRUFBYyxFQUM3RCxnQkFBbUM7UUFIbkMsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUFVLFVBQUssR0FBTCxLQUFLLENBQWdCO1FBQ2Isc0JBQWlCLEdBQWpCLGlCQUFpQixDQUF1QjtRQUMvRCxhQUFRLEdBQVIsUUFBUSxDQUFXO1FBQW1CLE9BQUUsR0FBRixFQUFFLENBQVk7UUFDN0QscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFtQjtRQXJFdkMs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QUFVLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSztZQUN4RSxXQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVc7WUFDN0IsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRO1lBQ3ZCLG1CQUFtQixFQUFFLElBQUksQ0FBQyxtQkFBbUI7WUFDN0MsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLGdCQUFnQjtTQUN4QyxDQUFDLENBQUM7SUFDTCxDQUFDOztrSEEzUFUsVUFBVSxzRUFvRU4sVUFBVTtzR0FwRWQsVUFBVTtzR0FBVixVQUFVO2tCQUp0QixTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSxjQUFjO29CQUN4QixVQUFVLEVBQUUsSUFBSTtpQkFDakI7OzBCQXFFTSxTQUFTOzJCQUFDLFVBQVU7NEhBckRZLE1BQU07c0JBQTFDLFdBQVc7dUJBQUMsYUFBYTs7c0JBQUcsS0FBSztnQkFRekIsV0FBVztzQkFBbkIsS0FBSztnQkFPRyxRQUFRO3NCQUFoQixLQUFLO2dCQU9HLG1CQUFtQjtzQkFBM0IsS0FBSztnQkFPRyxLQUFLO3NCQUFiLEtBQUs7Z0JBVUcsVUFBVTtzQkFBbEIsS0FBSztnQkFzQ0YsZ0JBQWdCO3NCQURuQixLQUFLO2dCQWdCRixrQkFBa0I7c0JBRHJCLEtBQUs7Z0JBZ0JGLFVBQVU7c0JBRGIsS0FBSztnQkFzQ0YsVUFBVTtzQkFEYixLQUFLO2dCQWVOLE9BQU87c0JBSE4sWUFBWTt1QkFDVCxPQUFPO29CQUNQLENBQUMsZUFBZSxFQUFFLGdCQUFnQixFQUFFLGlCQUFpQixFQUFFLGVBQWUsRUFBRSxnQkFBZ0IsQ0FBQzs7QUFrRi9GOzs7Ozs7O0dBT0c7QUFDSCxPQUFPLEVBQUMsVUFBVSxJQUFJLGtCQUFrQixFQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtMb2NhdGlvblN0cmF0ZWd5fSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtBdHRyaWJ1dGUsIERpcmVjdGl2ZSwgRWxlbWVudFJlZiwgSG9zdEJpbmRpbmcsIEhvc3RMaXN0ZW5lciwgSW5wdXQsIE9uQ2hhbmdlcywgT25EZXN0cm95LCBSZW5kZXJlcjIsIFNpbXBsZUNoYW5nZXMsIMm1Y29lcmNlVG9Cb29sZWFuIGFzIGNvZXJjZVRvQm9vbGVhbiwgybXJtXNhbml0aXplVXJsT3JSZXNvdXJjZVVybH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge1N1YmplY3QsIFN1YnNjcmlwdGlvbn0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7RXZlbnQsIE5hdmlnYXRpb25FbmR9IGZyb20gJy4uL2V2ZW50cyc7XG5pbXBvcnQge1F1ZXJ5UGFyYW1zSGFuZGxpbmd9IGZyb20gJy4uL21vZGVscyc7XG5pbXBvcnQge1JvdXRlcn0gZnJvbSAnLi4vcm91dGVyJztcbmltcG9ydCB7QWN0aXZhdGVkUm91dGV9IGZyb20gJy4uL3JvdXRlcl9zdGF0ZSc7XG5pbXBvcnQge1BhcmFtc30gZnJvbSAnLi4vc2hhcmVkJztcbmltcG9ydCB7VXJsVHJlZX0gZnJvbSAnLi4vdXJsX3RyZWUnO1xuXG5cbi8qKlxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogV2hlbiBhcHBsaWVkIHRvIGFuIGVsZW1lbnQgaW4gYSB0ZW1wbGF0ZSwgbWFrZXMgdGhhdCBlbGVtZW50IGEgbGlua1xuICogdGhhdCBpbml0aWF0ZXMgbmF2aWdhdGlvbiB0byBhIHJvdXRlLiBOYXZpZ2F0aW9uIG9wZW5zIG9uZSBvciBtb3JlIHJvdXRlZCBjb21wb25lbnRzXG4gKiBpbiBvbmUgb3IgbW9yZSBgPHJvdXRlci1vdXRsZXQ+YCBsb2NhdGlvbnMgb24gdGhlIHBhZ2UuXG4gKlxuICogR2l2ZW4gYSByb3V0ZSBjb25maWd1cmF0aW9uIGBbeyBwYXRoOiAndXNlci86bmFtZScsIGNvbXBvbmVudDogVXNlckNtcCB9XWAsXG4gKiB0aGUgZm9sbG93aW5nIGNyZWF0ZXMgYSBzdGF0aWMgbGluayB0byB0aGUgcm91dGU6XG4gKiBgPGEgcm91dGVyTGluaz1cIi91c2VyL2JvYlwiPmxpbmsgdG8gdXNlciBjb21wb25lbnQ8L2E+YFxuICpcbiAqIFlvdSBjYW4gdXNlIGR5bmFtaWMgdmFsdWVzIHRvIGdlbmVyYXRlIHRoZSBsaW5rLlxuICogRm9yIGEgZHluYW1pYyBsaW5rLCBwYXNzIGFuIGFycmF5IG9mIHBhdGggc2VnbWVudHMsXG4gKiBmb2xsb3dlZCBieSB0aGUgcGFyYW1zIGZvciBlYWNoIHNlZ21lbnQuXG4gKiBGb3IgZXhhbXBsZSwgYFsnL3RlYW0nLCB0ZWFtSWQsICd1c2VyJywgdXNlck5hbWUsIHtkZXRhaWxzOiB0cnVlfV1gXG4gKiBnZW5lcmF0ZXMgYSBsaW5rIHRvIGAvdGVhbS8xMS91c2VyL2JvYjtkZXRhaWxzPXRydWVgLlxuICpcbiAqIE11bHRpcGxlIHN0YXRpYyBzZWdtZW50cyBjYW4gYmUgbWVyZ2VkIGludG8gb25lIHRlcm0gYW5kIGNvbWJpbmVkIHdpdGggZHluYW1pYyBzZWdtZW50cy5cbiAqIEZvciBleGFtcGxlLCBgWycvdGVhbS8xMS91c2VyJywgdXNlck5hbWUsIHtkZXRhaWxzOiB0cnVlfV1gXG4gKlxuICogVGhlIGlucHV0IHRoYXQgeW91IHByb3ZpZGUgdG8gdGhlIGxpbmsgaXMgdHJlYXRlZCBhcyBhIGRlbHRhIHRvIHRoZSBjdXJyZW50IFVSTC5cbiAqIEZvciBpbnN0YW5jZSwgc3VwcG9zZSB0aGUgY3VycmVudCBVUkwgaXMgYC91c2VyLyhib3gvL2F1eDp0ZWFtKWAuXG4gKiBUaGUgbGluayBgPGEgW3JvdXRlckxpbmtdPVwiWycvdXNlci9qaW0nXVwiPkppbTwvYT5gIGNyZWF0ZXMgdGhlIFVSTFxuICogYC91c2VyLyhqaW0vL2F1eDp0ZWFtKWAuXG4gKiBTZWUge0BsaW5rIFJvdXRlciNjcmVhdGVVcmxUcmVlIGNyZWF0ZVVybFRyZWV9IGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogWW91IGNhbiB1c2UgYWJzb2x1dGUgb3IgcmVsYXRpdmUgcGF0aHMgaW4gYSBsaW5rLCBzZXQgcXVlcnkgcGFyYW1ldGVycyxcbiAqIGNvbnRyb2wgaG93IHBhcmFtZXRlcnMgYXJlIGhhbmRsZWQsIGFuZCBrZWVwIGEgaGlzdG9yeSBvZiBuYXZpZ2F0aW9uIHN0YXRlcy5cbiAqXG4gKiAjIyMgUmVsYXRpdmUgbGluayBwYXRoc1xuICpcbiAqIFRoZSBmaXJzdCBzZWdtZW50IG5hbWUgY2FuIGJlIHByZXBlbmRlZCB3aXRoIGAvYCwgYC4vYCwgb3IgYC4uL2AuXG4gKiAqIElmIHRoZSBmaXJzdCBzZWdtZW50IGJlZ2lucyB3aXRoIGAvYCwgdGhlIHJvdXRlciBsb29rcyB1cCB0aGUgcm91dGUgZnJvbSB0aGUgcm9vdCBvZiB0aGVcbiAqICAgYXBwLlxuICogKiBJZiB0aGUgZmlyc3Qgc2VnbWVudCBiZWdpbnMgd2l0aCBgLi9gLCBvciBkb2Vzbid0IGJlZ2luIHdpdGggYSBzbGFzaCwgdGhlIHJvdXRlclxuICogICBsb29rcyBpbiB0aGUgY2hpbGRyZW4gb2YgdGhlIGN1cnJlbnQgYWN0aXZhdGVkIHJvdXRlLlxuICogKiBJZiB0aGUgZmlyc3Qgc2VnbWVudCBiZWdpbnMgd2l0aCBgLi4vYCwgdGhlIHJvdXRlciBnb2VzIHVwIG9uZSBsZXZlbCBpbiB0aGUgcm91dGUgdHJlZS5cbiAqXG4gKiAjIyMgU2V0dGluZyBhbmQgaGFuZGxpbmcgcXVlcnkgcGFyYW1zIGFuZCBmcmFnbWVudHNcbiAqXG4gKiBUaGUgZm9sbG93aW5nIGxpbmsgYWRkcyBhIHF1ZXJ5IHBhcmFtZXRlciBhbmQgYSBmcmFnbWVudCB0byB0aGUgZ2VuZXJhdGVkIFVSTDpcbiAqXG4gKiBgYGBcbiAqIDxhIFtyb3V0ZXJMaW5rXT1cIlsnL3VzZXIvYm9iJ11cIiBbcXVlcnlQYXJhbXNdPVwie2RlYnVnOiB0cnVlfVwiIGZyYWdtZW50PVwiZWR1Y2F0aW9uXCI+XG4gKiAgIGxpbmsgdG8gdXNlciBjb21wb25lbnRcbiAqIDwvYT5cbiAqIGBgYFxuICogQnkgZGVmYXVsdCwgdGhlIGRpcmVjdGl2ZSBjb25zdHJ1Y3RzIHRoZSBuZXcgVVJMIHVzaW5nIHRoZSBnaXZlbiBxdWVyeSBwYXJhbWV0ZXJzLlxuICogVGhlIGV4YW1wbGUgZ2VuZXJhdGVzIHRoZSBsaW5rOiBgL3VzZXIvYm9iP2RlYnVnPXRydWUjZWR1Y2F0aW9uYC5cbiAqXG4gKiBZb3UgY2FuIGluc3RydWN0IHRoZSBkaXJlY3RpdmUgdG8gaGFuZGxlIHF1ZXJ5IHBhcmFtZXRlcnMgZGlmZmVyZW50bHlcbiAqIGJ5IHNwZWNpZnlpbmcgdGhlIGBxdWVyeVBhcmFtc0hhbmRsaW5nYCBvcHRpb24gaW4gdGhlIGxpbmsuXG4gKiBBbGxvd2VkIHZhbHVlcyBhcmU6XG4gKlxuICogIC0gYCdtZXJnZSdgOiBNZXJnZSB0aGUgZ2l2ZW4gYHF1ZXJ5UGFyYW1zYCBpbnRvIHRoZSBjdXJyZW50IHF1ZXJ5IHBhcmFtcy5cbiAqICAtIGAncHJlc2VydmUnYDogUHJlc2VydmUgdGhlIGN1cnJlbnQgcXVlcnkgcGFyYW1zLlxuICpcbiAqIEZvciBleGFtcGxlOlxuICpcbiAqIGBgYFxuICogPGEgW3JvdXRlckxpbmtdPVwiWycvdXNlci9ib2InXVwiIFtxdWVyeVBhcmFtc109XCJ7ZGVidWc6IHRydWV9XCIgcXVlcnlQYXJhbXNIYW5kbGluZz1cIm1lcmdlXCI+XG4gKiAgIGxpbmsgdG8gdXNlciBjb21wb25lbnRcbiAqIDwvYT5cbiAqIGBgYFxuICpcbiAqIFNlZSB7QGxpbmsgVXJsQ3JlYXRpb25PcHRpb25zLnF1ZXJ5UGFyYW1zSGFuZGxpbmcgVXJsQ3JlYXRpb25PcHRpb25zI3F1ZXJ5UGFyYW1zSGFuZGxpbmd9LlxuICpcbiAqICMjIyBQcmVzZXJ2aW5nIG5hdmlnYXRpb24gaGlzdG9yeVxuICpcbiAqIFlvdSBjYW4gcHJvdmlkZSBhIGBzdGF0ZWAgdmFsdWUgdG8gYmUgcGVyc2lzdGVkIHRvIHRoZSBicm93c2VyJ3NcbiAqIFtgSGlzdG9yeS5zdGF0ZWAgcHJvcGVydHldKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9IaXN0b3J5I1Byb3BlcnRpZXMpLlxuICogRm9yIGV4YW1wbGU6XG4gKlxuICogYGBgXG4gKiA8YSBbcm91dGVyTGlua109XCJbJy91c2VyL2JvYiddXCIgW3N0YXRlXT1cInt0cmFjaW5nSWQ6IDEyM31cIj5cbiAqICAgbGluayB0byB1c2VyIGNvbXBvbmVudFxuICogPC9hPlxuICogYGBgXG4gKlxuICogVXNlIHtAbGluayBSb3V0ZXIuZ2V0Q3VycmVudE5hdmlnYXRpb24oKSBSb3V0ZXIjZ2V0Q3VycmVudE5hdmlnYXRpb259IHRvIHJldHJpZXZlIGEgc2F2ZWRcbiAqIG5hdmlnYXRpb24tc3RhdGUgdmFsdWUuIEZvciBleGFtcGxlLCB0byBjYXB0dXJlIHRoZSBgdHJhY2luZ0lkYCBkdXJpbmcgdGhlIGBOYXZpZ2F0aW9uU3RhcnRgXG4gKiBldmVudDpcbiAqXG4gKiBgYGBcbiAqIC8vIEdldCBOYXZpZ2F0aW9uU3RhcnQgZXZlbnRzXG4gKiByb3V0ZXIuZXZlbnRzLnBpcGUoZmlsdGVyKGUgPT4gZSBpbnN0YW5jZW9mIE5hdmlnYXRpb25TdGFydCkpLnN1YnNjcmliZShlID0+IHtcbiAqICAgY29uc3QgbmF2aWdhdGlvbiA9IHJvdXRlci5nZXRDdXJyZW50TmF2aWdhdGlvbigpO1xuICogICB0cmFjaW5nU2VydmljZS50cmFjZSh7aWQ6IG5hdmlnYXRpb24uZXh0cmFzLnN0YXRlLnRyYWNpbmdJZH0pO1xuICogfSk7XG4gKiBgYGBcbiAqXG4gKiBAbmdNb2R1bGUgUm91dGVyTW9kdWxlXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbcm91dGVyTGlua10nLFxuICBzdGFuZGFsb25lOiB0cnVlLFxufSlcbmV4cG9ydCBjbGFzcyBSb3V0ZXJMaW5rIGltcGxlbWVudHMgT25DaGFuZ2VzLCBPbkRlc3Ryb3kge1xuICBwcml2YXRlIF9wcmVzZXJ2ZUZyYWdtZW50ID0gZmFsc2U7XG4gIHByaXZhdGUgX3NraXBMb2NhdGlvbkNoYW5nZSA9IGZhbHNlO1xuICBwcml2YXRlIF9yZXBsYWNlVXJsID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIFJlcHJlc2VudHMgYW4gYGhyZWZgIGF0dHJpYnV0ZSB2YWx1ZSBhcHBsaWVkIHRvIGEgaG9zdCBlbGVtZW50LFxuICAgKiB3aGVuIGEgaG9zdCBlbGVtZW50IGlzIGA8YT5gLiBGb3Igb3RoZXIgdGFncywgdGhlIHZhbHVlIGlzIGBudWxsYC5cbiAgICovXG4gIGhyZWY6IHN0cmluZ3xudWxsID0gbnVsbDtcblxuICAvKipcbiAgICogUmVwcmVzZW50cyB0aGUgYHRhcmdldGAgYXR0cmlidXRlIG9uIGEgaG9zdCBlbGVtZW50LlxuICAgKiBUaGlzIGlzIG9ubHkgdXNlZCB3aGVuIHRoZSBob3N0IGVsZW1lbnQgaXMgYW4gYDxhPmAgdGFnLlxuICAgKi9cbiAgQEhvc3RCaW5kaW5nKCdhdHRyLnRhcmdldCcpIEBJbnB1dCgpIHRhcmdldD86IHN0cmluZztcblxuICAvKipcbiAgICogUGFzc2VkIHRvIHtAbGluayBSb3V0ZXIjY3JlYXRlVXJsVHJlZSBSb3V0ZXIjY3JlYXRlVXJsVHJlZX0gYXMgcGFydCBvZiB0aGVcbiAgICogYFVybENyZWF0aW9uT3B0aW9uc2AuXG4gICAqIEBzZWUge0BsaW5rIFVybENyZWF0aW9uT3B0aW9ucyNxdWVyeVBhcmFtcyBVcmxDcmVhdGlvbk9wdGlvbnMjcXVlcnlQYXJhbXN9XG4gICAqIEBzZWUge0BsaW5rIFJvdXRlciNjcmVhdGVVcmxUcmVlIFJvdXRlciNjcmVhdGVVcmxUcmVlfVxuICAgKi9cbiAgQElucHV0KCkgcXVlcnlQYXJhbXM/OiBQYXJhbXN8bnVsbDtcbiAgLyoqXG4gICAqIFBhc3NlZCB0byB7QGxpbmsgUm91dGVyI2NyZWF0ZVVybFRyZWUgUm91dGVyI2NyZWF0ZVVybFRyZWV9IGFzIHBhcnQgb2YgdGhlXG4gICAqIGBVcmxDcmVhdGlvbk9wdGlvbnNgLlxuICAgKiBAc2VlIHtAbGluayBVcmxDcmVhdGlvbk9wdGlvbnMjZnJhZ21lbnQgVXJsQ3JlYXRpb25PcHRpb25zI2ZyYWdtZW50fVxuICAgKiBAc2VlIHtAbGluayBSb3V0ZXIjY3JlYXRlVXJsVHJlZSBSb3V0ZXIjY3JlYXRlVXJsVHJlZX1cbiAgICovXG4gIEBJbnB1dCgpIGZyYWdtZW50Pzogc3RyaW5nO1xuICAvKipcbiAgICogUGFzc2VkIHRvIHtAbGluayBSb3V0ZXIjY3JlYXRlVXJsVHJlZSBSb3V0ZXIjY3JlYXRlVXJsVHJlZX0gYXMgcGFydCBvZiB0aGVcbiAgICogYFVybENyZWF0aW9uT3B0aW9uc2AuXG4gICAqIEBzZWUge0BsaW5rIFVybENyZWF0aW9uT3B0aW9ucyNxdWVyeVBhcmFtc0hhbmRsaW5nIFVybENyZWF0aW9uT3B0aW9ucyNxdWVyeVBhcmFtc0hhbmRsaW5nfVxuICAgKiBAc2VlIHtAbGluayBSb3V0ZXIjY3JlYXRlVXJsVHJlZSBSb3V0ZXIjY3JlYXRlVXJsVHJlZX1cbiAgICovXG4gIEBJbnB1dCgpIHF1ZXJ5UGFyYW1zSGFuZGxpbmc/OiBRdWVyeVBhcmFtc0hhbmRsaW5nfG51bGw7XG4gIC8qKlxuICAgKiBQYXNzZWQgdG8ge0BsaW5rIFJvdXRlciNuYXZpZ2F0ZUJ5VXJsIFJvdXRlciNuYXZpZ2F0ZUJ5VXJsfSBhcyBwYXJ0IG9mIHRoZVxuICAgKiBgTmF2aWdhdGlvbkJlaGF2aW9yT3B0aW9uc2AuXG4gICAqIEBzZWUge0BsaW5rIE5hdmlnYXRpb25CZWhhdmlvck9wdGlvbnMjc3RhdGUgTmF2aWdhdGlvbkJlaGF2aW9yT3B0aW9ucyNzdGF0ZX1cbiAgICogQHNlZSB7QGxpbmsgUm91dGVyI25hdmlnYXRlQnlVcmwgUm91dGVyI25hdmlnYXRlQnlVcmx9XG4gICAqL1xuICBASW5wdXQoKSBzdGF0ZT86IHtbazogc3RyaW5nXTogYW55fTtcbiAgLyoqXG4gICAqIFBhc3NlZCB0byB7QGxpbmsgUm91dGVyI2NyZWF0ZVVybFRyZWUgUm91dGVyI2NyZWF0ZVVybFRyZWV9IGFzIHBhcnQgb2YgdGhlXG4gICAqIGBVcmxDcmVhdGlvbk9wdGlvbnNgLlxuICAgKiBTcGVjaWZ5IGEgdmFsdWUgaGVyZSB3aGVuIHlvdSBkbyBub3Qgd2FudCB0byB1c2UgdGhlIGRlZmF1bHQgdmFsdWVcbiAgICogZm9yIGByb3V0ZXJMaW5rYCwgd2hpY2ggaXMgdGhlIGN1cnJlbnQgYWN0aXZhdGVkIHJvdXRlLlxuICAgKiBOb3RlIHRoYXQgYSB2YWx1ZSBvZiBgdW5kZWZpbmVkYCBoZXJlIHdpbGwgdXNlIHRoZSBgcm91dGVyTGlua2AgZGVmYXVsdC5cbiAgICogQHNlZSB7QGxpbmsgVXJsQ3JlYXRpb25PcHRpb25zI3JlbGF0aXZlVG8gVXJsQ3JlYXRpb25PcHRpb25zI3JlbGF0aXZlVG99XG4gICAqIEBzZWUge0BsaW5rIFJvdXRlciNjcmVhdGVVcmxUcmVlIFJvdXRlciNjcmVhdGVVcmxUcmVlfVxuICAgKi9cbiAgQElucHV0KCkgcmVsYXRpdmVUbz86IEFjdGl2YXRlZFJvdXRlfG51bGw7XG5cbiAgcHJpdmF0ZSBjb21tYW5kczogYW55W118bnVsbCA9IG51bGw7XG5cbiAgLyoqIFdoZXRoZXIgYSBob3N0IGVsZW1lbnQgaXMgYW4gYDxhPmAgdGFnLiAqL1xuICBwcml2YXRlIGlzQW5jaG9yRWxlbWVudDogYm9vbGVhbjtcblxuICBwcml2YXRlIHN1YnNjcmlwdGlvbj86IFN1YnNjcmlwdGlvbjtcblxuICAvKiogQGludGVybmFsICovXG4gIG9uQ2hhbmdlcyA9IG5ldyBTdWJqZWN0PFJvdXRlckxpbms+KCk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIHJvdXRlcjogUm91dGVyLCBwcml2YXRlIHJvdXRlOiBBY3RpdmF0ZWRSb3V0ZSxcbiAgICAgIEBBdHRyaWJ1dGUoJ3RhYmluZGV4JykgcHJpdmF0ZSByZWFkb25seSB0YWJJbmRleEF0dHJpYnV0ZTogc3RyaW5nfG51bGx8dW5kZWZpbmVkLFxuICAgICAgcHJpdmF0ZSByZWFkb25seSByZW5kZXJlcjogUmVuZGVyZXIyLCBwcml2YXRlIHJlYWRvbmx5IGVsOiBFbGVtZW50UmVmLFxuICAgICAgcHJpdmF0ZSBsb2NhdGlvblN0cmF0ZWd5PzogTG9jYXRpb25TdHJhdGVneSkge1xuICAgIGNvbnN0IHRhZ05hbWUgPSBlbC5uYXRpdmVFbGVtZW50LnRhZ05hbWU/LnRvTG93ZXJDYXNlKCk7XG4gICAgdGhpcy5pc0FuY2hvckVsZW1lbnQgPSB0YWdOYW1lID09PSAnYScgfHwgdGFnTmFtZSA9PT0gJ2FyZWEnO1xuXG4gICAgaWYgKHRoaXMuaXNBbmNob3JFbGVtZW50KSB7XG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbiA9IHJvdXRlci5ldmVudHMuc3Vic2NyaWJlKChzOiBFdmVudCkgPT4ge1xuICAgICAgICBpZiAocyBpbnN0YW5jZW9mIE5hdmlnYXRpb25FbmQpIHtcbiAgICAgICAgICB0aGlzLnVwZGF0ZUhyZWYoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2V0VGFiSW5kZXhJZk5vdE9uTmF0aXZlRWwoJzAnKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUGFzc2VkIHRvIHtAbGluayBSb3V0ZXIjY3JlYXRlVXJsVHJlZSBSb3V0ZXIjY3JlYXRlVXJsVHJlZX0gYXMgcGFydCBvZiB0aGVcbiAgICogYFVybENyZWF0aW9uT3B0aW9uc2AuXG4gICAqIEBzZWUge0BsaW5rIFVybENyZWF0aW9uT3B0aW9ucyNwcmVzZXJ2ZUZyYWdtZW50IFVybENyZWF0aW9uT3B0aW9ucyNwcmVzZXJ2ZUZyYWdtZW50fVxuICAgKiBAc2VlIHtAbGluayBSb3V0ZXIjY3JlYXRlVXJsVHJlZSBSb3V0ZXIjY3JlYXRlVXJsVHJlZX1cbiAgICovXG4gIEBJbnB1dCgpXG4gIHNldCBwcmVzZXJ2ZUZyYWdtZW50KHByZXNlcnZlRnJhZ21lbnQ6IGJvb2xlYW58c3RyaW5nfG51bGx8dW5kZWZpbmVkKSB7XG4gICAgdGhpcy5fcHJlc2VydmVGcmFnbWVudCA9IGNvZXJjZVRvQm9vbGVhbihwcmVzZXJ2ZUZyYWdtZW50KTtcbiAgfVxuXG4gIGdldCBwcmVzZXJ2ZUZyYWdtZW50KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9wcmVzZXJ2ZUZyYWdtZW50O1xuICB9XG5cbiAgLyoqXG4gICAqIFBhc3NlZCB0byB7QGxpbmsgUm91dGVyI25hdmlnYXRlQnlVcmwgUm91dGVyI25hdmlnYXRlQnlVcmx9IGFzIHBhcnQgb2YgdGhlXG4gICAqIGBOYXZpZ2F0aW9uQmVoYXZpb3JPcHRpb25zYC5cbiAgICogQHNlZSB7QGxpbmsgTmF2aWdhdGlvbkJlaGF2aW9yT3B0aW9ucyNza2lwTG9jYXRpb25DaGFuZ2UgTmF2aWdhdGlvbkJlaGF2aW9yT3B0aW9ucyNza2lwTG9jYXRpb25DaGFuZ2V9XG4gICAqIEBzZWUge0BsaW5rIFJvdXRlciNuYXZpZ2F0ZUJ5VXJsIFJvdXRlciNuYXZpZ2F0ZUJ5VXJsfVxuICAgKi9cbiAgQElucHV0KClcbiAgc2V0IHNraXBMb2NhdGlvbkNoYW5nZShza2lwTG9jYXRpb25DaGFuZ2U6IGJvb2xlYW58c3RyaW5nfG51bGx8dW5kZWZpbmVkKSB7XG4gICAgdGhpcy5fc2tpcExvY2F0aW9uQ2hhbmdlID0gY29lcmNlVG9Cb29sZWFuKHNraXBMb2NhdGlvbkNoYW5nZSk7XG4gIH1cblxuICBnZXQgc2tpcExvY2F0aW9uQ2hhbmdlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9za2lwTG9jYXRpb25DaGFuZ2U7XG4gIH1cblxuICAvKipcbiAgICogUGFzc2VkIHRvIHtAbGluayBSb3V0ZXIjbmF2aWdhdGVCeVVybCBSb3V0ZXIjbmF2aWdhdGVCeVVybH0gYXMgcGFydCBvZiB0aGVcbiAgICogYE5hdmlnYXRpb25CZWhhdmlvck9wdGlvbnNgLlxuICAgKiBAc2VlIHtAbGluayBOYXZpZ2F0aW9uQmVoYXZpb3JPcHRpb25zI3JlcGxhY2VVcmwgTmF2aWdhdGlvbkJlaGF2aW9yT3B0aW9ucyNyZXBsYWNlVXJsfVxuICAgKiBAc2VlIHtAbGluayBSb3V0ZXIjbmF2aWdhdGVCeVVybCBSb3V0ZXIjbmF2aWdhdGVCeVVybH1cbiAgICovXG4gIEBJbnB1dCgpXG4gIHNldCByZXBsYWNlVXJsKHJlcGxhY2VVcmw6IGJvb2xlYW58c3RyaW5nfG51bGx8dW5kZWZpbmVkKSB7XG4gICAgdGhpcy5fcmVwbGFjZVVybCA9IGNvZXJjZVRvQm9vbGVhbihyZXBsYWNlVXJsKTtcbiAgfVxuXG4gIGdldCByZXBsYWNlVXJsKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9yZXBsYWNlVXJsO1xuICB9XG5cbiAgLyoqXG4gICAqIE1vZGlmaWVzIHRoZSB0YWIgaW5kZXggaWYgdGhlcmUgd2FzIG5vdCBhIHRhYmluZGV4IGF0dHJpYnV0ZSBvbiB0aGUgZWxlbWVudCBkdXJpbmdcbiAgICogaW5zdGFudGlhdGlvbi5cbiAgICovXG4gIHByaXZhdGUgc2V0VGFiSW5kZXhJZk5vdE9uTmF0aXZlRWwobmV3VGFiSW5kZXg6IHN0cmluZ3xudWxsKSB7XG4gICAgaWYgKHRoaXMudGFiSW5kZXhBdHRyaWJ1dGUgIT0gbnVsbCAvKiBib3RoIGBudWxsYCBhbmQgYHVuZGVmaW5lZGAgKi8gfHwgdGhpcy5pc0FuY2hvckVsZW1lbnQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5hcHBseUF0dHJpYnV0ZVZhbHVlKCd0YWJpbmRleCcsIG5ld1RhYkluZGV4KTtcbiAgfVxuXG4gIC8qKiBAbm9kb2MgKi9cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykge1xuICAgIGlmICh0aGlzLmlzQW5jaG9yRWxlbWVudCkge1xuICAgICAgdGhpcy51cGRhdGVIcmVmKCk7XG4gICAgfVxuICAgIC8vIFRoaXMgaXMgc3Vic2NyaWJlZCB0byBieSBgUm91dGVyTGlua0FjdGl2ZWAgc28gdGhhdCBpdCBrbm93cyB0byB1cGRhdGUgd2hlbiB0aGVyZSBhcmUgY2hhbmdlc1xuICAgIC8vIHRvIHRoZSBSb3V0ZXJMaW5rcyBpdCdzIHRyYWNraW5nLlxuICAgIHRoaXMub25DaGFuZ2VzLm5leHQodGhpcyk7XG4gIH1cblxuICAvKipcbiAgICogQ29tbWFuZHMgdG8gcGFzcyB0byB7QGxpbmsgUm91dGVyI2NyZWF0ZVVybFRyZWUgUm91dGVyI2NyZWF0ZVVybFRyZWV9LlxuICAgKiAgIC0gKiphcnJheSoqOiBjb21tYW5kcyB0byBwYXNzIHRvIHtAbGluayBSb3V0ZXIjY3JlYXRlVXJsVHJlZSBSb3V0ZXIjY3JlYXRlVXJsVHJlZX0uXG4gICAqICAgLSAqKnN0cmluZyoqOiBzaG9ydGhhbmQgZm9yIGFycmF5IG9mIGNvbW1hbmRzIHdpdGgganVzdCB0aGUgc3RyaW5nLCBpLmUuIGBbJy9yb3V0ZSddYFxuICAgKiAgIC0gKipudWxsfHVuZGVmaW5lZCoqOiBlZmZlY3RpdmVseSBkaXNhYmxlcyB0aGUgYHJvdXRlckxpbmtgXG4gICAqIEBzZWUge0BsaW5rIFJvdXRlciNjcmVhdGVVcmxUcmVlIFJvdXRlciNjcmVhdGVVcmxUcmVlfVxuICAgKi9cbiAgQElucHV0KClcbiAgc2V0IHJvdXRlckxpbmsoY29tbWFuZHM6IGFueVtdfHN0cmluZ3xudWxsfHVuZGVmaW5lZCkge1xuICAgIGlmIChjb21tYW5kcyAhPSBudWxsKSB7XG4gICAgICB0aGlzLmNvbW1hbmRzID0gQXJyYXkuaXNBcnJheShjb21tYW5kcykgPyBjb21tYW5kcyA6IFtjb21tYW5kc107XG4gICAgICB0aGlzLnNldFRhYkluZGV4SWZOb3RPbk5hdGl2ZUVsKCcwJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY29tbWFuZHMgPSBudWxsO1xuICAgICAgdGhpcy5zZXRUYWJJbmRleElmTm90T25OYXRpdmVFbChudWxsKTtcbiAgICB9XG4gIH1cblxuICAvKiogQG5vZG9jICovXG4gIEBIb3N0TGlzdGVuZXIoXG4gICAgICAnY2xpY2snLFxuICAgICAgWyckZXZlbnQuYnV0dG9uJywgJyRldmVudC5jdHJsS2V5JywgJyRldmVudC5zaGlmdEtleScsICckZXZlbnQuYWx0S2V5JywgJyRldmVudC5tZXRhS2V5J10pXG4gIG9uQ2xpY2soYnV0dG9uOiBudW1iZXIsIGN0cmxLZXk6IGJvb2xlYW4sIHNoaWZ0S2V5OiBib29sZWFuLCBhbHRLZXk6IGJvb2xlYW4sIG1ldGFLZXk6IGJvb2xlYW4pOlxuICAgICAgYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMudXJsVHJlZSA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuaXNBbmNob3JFbGVtZW50KSB7XG4gICAgICBpZiAoYnV0dG9uICE9PSAwIHx8IGN0cmxLZXkgfHwgc2hpZnRLZXkgfHwgYWx0S2V5IHx8IG1ldGFLZXkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgdGhpcy50YXJnZXQgPT09ICdzdHJpbmcnICYmIHRoaXMudGFyZ2V0ICE9ICdfc2VsZicpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgZXh0cmFzID0ge1xuICAgICAgc2tpcExvY2F0aW9uQ2hhbmdlOiB0aGlzLnNraXBMb2NhdGlvbkNoYW5nZSxcbiAgICAgIHJlcGxhY2VVcmw6IHRoaXMucmVwbGFjZVVybCxcbiAgICAgIHN0YXRlOiB0aGlzLnN0YXRlLFxuICAgIH07XG4gICAgdGhpcy5yb3V0ZXIubmF2aWdhdGVCeVVybCh0aGlzLnVybFRyZWUsIGV4dHJhcyk7XG5cbiAgICAvLyBSZXR1cm4gYGZhbHNlYCBmb3IgYDxhPmAgZWxlbWVudHMgdG8gcHJldmVudCBkZWZhdWx0IGFjdGlvblxuICAgIC8vIGFuZCBjYW5jZWwgdGhlIG5hdGl2ZSBiZWhhdmlvciwgc2luY2UgdGhlIG5hdmlnYXRpb24gaXMgaGFuZGxlZFxuICAgIC8vIGJ5IHRoZSBSb3V0ZXIuXG4gICAgcmV0dXJuICF0aGlzLmlzQW5jaG9yRWxlbWVudDtcbiAgfVxuXG4gIC8qKiBAbm9kb2MgKi9cbiAgbmdPbkRlc3Ryb3koKTogYW55IHtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbj8udW5zdWJzY3JpYmUoKTtcbiAgfVxuXG4gIHByaXZhdGUgdXBkYXRlSHJlZigpOiB2b2lkIHtcbiAgICB0aGlzLmhyZWYgPSB0aGlzLnVybFRyZWUgIT09IG51bGwgJiYgdGhpcy5sb2NhdGlvblN0cmF0ZWd5ID9cbiAgICAgICAgdGhpcy5sb2NhdGlvblN0cmF0ZWd5Py5wcmVwYXJlRXh0ZXJuYWxVcmwodGhpcy5yb3V0ZXIuc2VyaWFsaXplVXJsKHRoaXMudXJsVHJlZSkpIDpcbiAgICAgICAgbnVsbDtcblxuICAgIGNvbnN0IHNhbml0aXplZFZhbHVlID0gdGhpcy5ocmVmID09PSBudWxsID9cbiAgICAgICAgbnVsbCA6XG4gICAgICAgIC8vIFRoaXMgY2xhc3MgcmVwcmVzZW50cyBhIGRpcmVjdGl2ZSB0aGF0IGNhbiBiZSBhZGRlZCB0byBib3RoIGA8YT5gIGVsZW1lbnRzLFxuICAgICAgICAvLyBhcyB3ZWxsIGFzIG90aGVyIGVsZW1lbnRzLiBBcyBhIHJlc3VsdCwgd2UgY2FuJ3QgZGVmaW5lIHNlY3VyaXR5IGNvbnRleHQgYXRcbiAgICAgICAgLy8gY29tcGlsZSB0aW1lLiBTbyB0aGUgc2VjdXJpdHkgY29udGV4dCBpcyBkZWZlcnJlZCB0byBydW50aW1lLlxuICAgICAgICAvLyBUaGUgYMm1ybVzYW5pdGl6ZVVybE9yUmVzb3VyY2VVcmxgIHNlbGVjdHMgdGhlIG5lY2Vzc2FyeSBzYW5pdGl6ZXIgZnVuY3Rpb25cbiAgICAgICAgLy8gYmFzZWQgb24gdGhlIHRhZyBhbmQgcHJvcGVydHkgbmFtZXMuIFRoZSBsb2dpYyBtaW1pY3MgdGhlIG9uZSBmcm9tXG4gICAgICAgIC8vIGBwYWNrYWdlcy9jb21waWxlci9zcmMvc2NoZW1hL2RvbV9zZWN1cml0eV9zY2hlbWEudHNgLCB3aGljaCBpcyB1c2VkIGF0IGNvbXBpbGUgdGltZS5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gTm90ZTogd2Ugc2hvdWxkIGludmVzdGlnYXRlIHdoZXRoZXIgd2UgY2FuIHN3aXRjaCB0byB1c2luZyBgQEhvc3RCaW5kaW5nKCdhdHRyLmhyZWYnKWBcbiAgICAgICAgLy8gaW5zdGVhZCBvZiBhcHBseWluZyBhIHZhbHVlIHZpYSBhIHJlbmRlcmVyLCBhZnRlciBhIGZpbmFsIG1lcmdlIG9mIHRoZVxuICAgICAgICAvLyBgUm91dGVyTGlua1dpdGhIcmVmYCBkaXJlY3RpdmUuXG4gICAgICAgIMm1ybVzYW5pdGl6ZVVybE9yUmVzb3VyY2VVcmwodGhpcy5ocmVmLCB0aGlzLmVsLm5hdGl2ZUVsZW1lbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpLCAnaHJlZicpO1xuICAgIHRoaXMuYXBwbHlBdHRyaWJ1dGVWYWx1ZSgnaHJlZicsIHNhbml0aXplZFZhbHVlKTtcbiAgfVxuXG4gIHByaXZhdGUgYXBwbHlBdHRyaWJ1dGVWYWx1ZShhdHRyTmFtZTogc3RyaW5nLCBhdHRyVmFsdWU6IHN0cmluZ3xudWxsKSB7XG4gICAgY29uc3QgcmVuZGVyZXIgPSB0aGlzLnJlbmRlcmVyO1xuICAgIGNvbnN0IG5hdGl2ZUVsZW1lbnQgPSB0aGlzLmVsLm5hdGl2ZUVsZW1lbnQ7XG4gICAgaWYgKGF0dHJWYWx1ZSAhPT0gbnVsbCkge1xuICAgICAgcmVuZGVyZXIuc2V0QXR0cmlidXRlKG5hdGl2ZUVsZW1lbnQsIGF0dHJOYW1lLCBhdHRyVmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZW5kZXJlci5yZW1vdmVBdHRyaWJ1dGUobmF0aXZlRWxlbWVudCwgYXR0ck5hbWUpO1xuICAgIH1cbiAgfVxuXG4gIGdldCB1cmxUcmVlKCk6IFVybFRyZWV8bnVsbCB7XG4gICAgaWYgKHRoaXMuY29tbWFuZHMgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5yb3V0ZXIuY3JlYXRlVXJsVHJlZSh0aGlzLmNvbW1hbmRzLCB7XG4gICAgICAvLyBJZiB0aGUgYHJlbGF0aXZlVG9gIGlucHV0IGlzIG5vdCBkZWZpbmVkLCB3ZSB3YW50IHRvIHVzZSBgdGhpcy5yb3V0ZWAgYnkgZGVmYXVsdC5cbiAgICAgIC8vIE90aGVyd2lzZSwgd2Ugc2hvdWxkIHVzZSB0aGUgdmFsdWUgcHJvdmlkZWQgYnkgdGhlIHVzZXIgaW4gdGhlIGlucHV0LlxuICAgICAgcmVsYXRpdmVUbzogdGhpcy5yZWxhdGl2ZVRvICE9PSB1bmRlZmluZWQgPyB0aGlzLnJlbGF0aXZlVG8gOiB0aGlzLnJvdXRlLFxuICAgICAgcXVlcnlQYXJhbXM6IHRoaXMucXVlcnlQYXJhbXMsXG4gICAgICBmcmFnbWVudDogdGhpcy5mcmFnbWVudCxcbiAgICAgIHF1ZXJ5UGFyYW1zSGFuZGxpbmc6IHRoaXMucXVlcnlQYXJhbXNIYW5kbGluZyxcbiAgICAgIHByZXNlcnZlRnJhZ21lbnQ6IHRoaXMucHJlc2VydmVGcmFnbWVudCxcbiAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICogQW4gYWxpYXMgZm9yIHRoZSBgUm91dGVyTGlua2AgZGlyZWN0aXZlLlxuICogRGVwcmVjYXRlZCBzaW5jZSB2MTUsIHVzZSBgUm91dGVyTGlua2AgZGlyZWN0aXZlIGluc3RlYWQuXG4gKlxuICogQGRlcHJlY2F0ZWQgdXNlIGBSb3V0ZXJMaW5rYCBkaXJlY3RpdmUgaW5zdGVhZC5cbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IHtSb3V0ZXJMaW5rIGFzIFJvdXRlckxpbmtXaXRoSHJlZn07XG4iXX0=