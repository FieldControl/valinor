/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { LocationStrategy } from '@angular/common';
import { Attribute, booleanAttribute, Directive, ElementRef, HostBinding, HostListener, Input, Renderer2, ɵRuntimeError as RuntimeError, ɵɵsanitizeUrlOrResourceUrl, } from '@angular/core';
import { Subject } from 'rxjs';
import { NavigationEnd } from '../events';
import { Router } from '../router';
import { ActivatedRoute } from '../router_state';
import { isUrlTree } from '../url_tree';
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
 * See {@link Router#createUrlTree} for more information.
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
 * `queryParams`, `fragment`, `queryParamsHandling`, `preserveFragment`, and `relativeTo`
 * cannot be used when the `routerLink` input is a `UrlTree`.
 *
 * See {@link UrlCreationOptions#queryParamsHandling}.
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
 * Use {@link Router#getCurrentNavigation} to retrieve a saved
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
        /**
         * Represents an `href` attribute value applied to a host element,
         * when a host element is `<a>`. For other tags, the value is `null`.
         */
        this.href = null;
        /** @internal */
        this.onChanges = new Subject();
        /**
         * Passed to {@link Router#createUrlTree} as part of the
         * `UrlCreationOptions`.
         * @see {@link UrlCreationOptions#preserveFragment}
         * @see {@link Router#createUrlTree}
         */
        this.preserveFragment = false;
        /**
         * Passed to {@link Router#navigateByUrl} as part of the
         * `NavigationBehaviorOptions`.
         * @see {@link NavigationBehaviorOptions#skipLocationChange}
         * @see {@link Router#navigateByUrl}
         */
        this.skipLocationChange = false;
        /**
         * Passed to {@link Router#navigateByUrl} as part of the
         * `NavigationBehaviorOptions`.
         * @see {@link NavigationBehaviorOptions#replaceUrl}
         * @see {@link Router#navigateByUrl}
         */
        this.replaceUrl = false;
        this.routerLinkInput = null;
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
    // TODO(atscott): Remove changes parameter in major version as a breaking change.
    ngOnChanges(changes) {
        if (ngDevMode &&
            isUrlTree(this.routerLinkInput) &&
            (this.fragment !== undefined ||
                this.queryParams ||
                this.queryParamsHandling ||
                this.preserveFragment ||
                this.relativeTo)) {
            throw new RuntimeError(4016 /* RuntimeErrorCode.INVALID_ROUTER_LINK_INPUTS */, 'Cannot configure queryParams or fragment when using a UrlTree as the routerLink input value.');
        }
        if (this.isAnchorElement) {
            this.updateHref();
        }
        // This is subscribed to by `RouterLinkActive` so that it knows to update when there are changes
        // to the RouterLinks it's tracking.
        this.onChanges.next(this);
    }
    /**
     * Commands to pass to {@link Router#createUrlTree} or a `UrlTree`.
     *   - **array**: commands to pass to {@link Router#createUrlTree}.
     *   - **string**: shorthand for array of commands with just the string, i.e. `['/route']`
     *   - **UrlTree**: a `UrlTree` for this link rather than creating one from the commands
     *     and other inputs that correspond to properties of `UrlCreationOptions`.
     *   - **null|undefined**: effectively disables the `routerLink`
     * @see {@link Router#createUrlTree}
     */
    set routerLink(commandsOrUrlTree) {
        if (commandsOrUrlTree == null) {
            this.routerLinkInput = null;
            this.setTabIndexIfNotOnNativeEl(null);
        }
        else {
            if (isUrlTree(commandsOrUrlTree)) {
                this.routerLinkInput = commandsOrUrlTree;
            }
            else {
                this.routerLinkInput = Array.isArray(commandsOrUrlTree)
                    ? commandsOrUrlTree
                    : [commandsOrUrlTree];
            }
            this.setTabIndexIfNotOnNativeEl('0');
        }
    }
    /** @nodoc */
    onClick(button, ctrlKey, shiftKey, altKey, metaKey) {
        const urlTree = this.urlTree;
        if (urlTree === null) {
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
            info: this.info,
        };
        this.router.navigateByUrl(urlTree, extras);
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
        const urlTree = this.urlTree;
        this.href =
            urlTree !== null && this.locationStrategy
                ? this.locationStrategy?.prepareExternalUrl(this.router.serializeUrl(urlTree))
                : null;
        const sanitizedValue = this.href === null
            ? null
            : // This class represents a directive that can be added to both `<a>` elements,
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
        if (this.routerLinkInput === null) {
            return null;
        }
        else if (isUrlTree(this.routerLinkInput)) {
            return this.routerLinkInput;
        }
        return this.router.createUrlTree(this.routerLinkInput, {
            // If the `relativeTo` input is not defined, we want to use `this.route` by default.
            // Otherwise, we should use the value provided by the user in the input.
            relativeTo: this.relativeTo !== undefined ? this.relativeTo : this.route,
            queryParams: this.queryParams,
            fragment: this.fragment,
            queryParamsHandling: this.queryParamsHandling,
            preserveFragment: this.preserveFragment,
        });
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: RouterLink, deps: [{ token: i1.Router }, { token: i2.ActivatedRoute }, { token: 'tabindex', attribute: true }, { token: i0.Renderer2 }, { token: i0.ElementRef }, { token: i3.LocationStrategy }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "18.2.7", type: RouterLink, isStandalone: true, selector: "[routerLink]", inputs: { target: "target", queryParams: "queryParams", fragment: "fragment", queryParamsHandling: "queryParamsHandling", state: "state", info: "info", relativeTo: "relativeTo", preserveFragment: ["preserveFragment", "preserveFragment", booleanAttribute], skipLocationChange: ["skipLocationChange", "skipLocationChange", booleanAttribute], replaceUrl: ["replaceUrl", "replaceUrl", booleanAttribute], routerLink: "routerLink" }, host: { listeners: { "click": "onClick($event.button,$event.ctrlKey,$event.shiftKey,$event.altKey,$event.metaKey)" }, properties: { "attr.target": "this.target" } }, usesOnChanges: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: RouterLink, decorators: [{
            type: Directive,
            args: [{
                    selector: '[routerLink]',
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i1.Router }, { type: i2.ActivatedRoute }, { type: undefined, decorators: [{
                    type: Attribute,
                    args: ['tabindex']
                }] }, { type: i0.Renderer2 }, { type: i0.ElementRef }, { type: i3.LocationStrategy }], propDecorators: { target: [{
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
            }], info: [{
                type: Input
            }], relativeTo: [{
                type: Input
            }], preserveFragment: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], skipLocationChange: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], replaceUrl: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], routerLink: [{
                type: Input
            }], onClick: [{
                type: HostListener,
                args: ['click', [
                        '$event.button',
                        '$event.ctrlKey',
                        '$event.shiftKey',
                        '$event.altKey',
                        '$event.metaKey',
                    ]]
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyX2xpbmsuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9yb3V0ZXIvc3JjL2RpcmVjdGl2ZXMvcm91dGVyX2xpbmsudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDakQsT0FBTyxFQUNMLFNBQVMsRUFDVCxnQkFBZ0IsRUFDaEIsU0FBUyxFQUNULFVBQVUsRUFDVixXQUFXLEVBQ1gsWUFBWSxFQUNaLEtBQUssRUFHTCxTQUFTLEVBQ1QsYUFBYSxJQUFJLFlBQVksRUFFN0IsMEJBQTBCLEdBQzNCLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBQyxPQUFPLEVBQWUsTUFBTSxNQUFNLENBQUM7QUFFM0MsT0FBTyxFQUFRLGFBQWEsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUUvQyxPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0sV0FBVyxDQUFDO0FBQ2pDLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUUvQyxPQUFPLEVBQUMsU0FBUyxFQUFVLE1BQU0sYUFBYSxDQUFDOzs7OztBQUcvQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBbUdHO0FBS0gsTUFBTSxPQUFPLFVBQVU7SUFtRXJCLFlBQ1UsTUFBYyxFQUNkLEtBQXFCLEVBQ1csaUJBQTRDLEVBQ25FLFFBQW1CLEVBQ25CLEVBQWMsRUFDdkIsZ0JBQW1DO1FBTG5DLFdBQU0sR0FBTixNQUFNLENBQVE7UUFDZCxVQUFLLEdBQUwsS0FBSyxDQUFnQjtRQUNXLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBMkI7UUFDbkUsYUFBUSxHQUFSLFFBQVEsQ0FBVztRQUNuQixPQUFFLEdBQUYsRUFBRSxDQUFZO1FBQ3ZCLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBbUI7UUF4RTdDOzs7V0FHRztRQUNILFNBQUksR0FBa0IsSUFBSSxDQUFDO1FBMkQzQixnQkFBZ0I7UUFDaEIsY0FBUyxHQUFHLElBQUksT0FBTyxFQUFjLENBQUM7UUF3QnRDOzs7OztXQUtHO1FBQ21DLHFCQUFnQixHQUFZLEtBQUssQ0FBQztRQUV4RTs7Ozs7V0FLRztRQUNtQyx1QkFBa0IsR0FBWSxLQUFLLENBQUM7UUFFMUU7Ozs7O1dBS0c7UUFDbUMsZUFBVSxHQUFZLEtBQUssQ0FBQztRQXNDMUQsb0JBQWUsR0FBMkIsSUFBSSxDQUFDO1FBMUVyRCxNQUFNLE9BQU8sR0FBRyxFQUFFLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxXQUFXLEVBQUUsQ0FBQztRQUN4RCxJQUFJLENBQUMsZUFBZSxHQUFHLE9BQU8sS0FBSyxHQUFHLElBQUksT0FBTyxLQUFLLE1BQU0sQ0FBQztRQUU3RCxJQUFJLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUN6QixJQUFJLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBUSxFQUFFLEVBQUU7Z0JBQ3ZELElBQUksQ0FBQyxZQUFZLGFBQWEsRUFBRSxDQUFDO29CQUMvQixJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7Z0JBQ3BCLENBQUM7WUFDSCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7YUFBTSxDQUFDO1lBQ04sSUFBSSxDQUFDLDBCQUEwQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3ZDLENBQUM7SUFDSCxDQUFDO0lBMEJEOzs7T0FHRztJQUNLLDBCQUEwQixDQUFDLFdBQTBCO1FBQzNELElBQUksSUFBSSxDQUFDLGlCQUFpQixJQUFJLElBQUksQ0FBQyxpQ0FBaUMsSUFBSSxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7WUFDN0YsT0FBTztRQUNULENBQUM7UUFDRCxJQUFJLENBQUMsbUJBQW1CLENBQUMsVUFBVSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQ3BELENBQUM7SUFFRCxhQUFhO0lBQ2IsaUZBQWlGO0lBQ2pGLFdBQVcsQ0FBQyxPQUF1QjtRQUNqQyxJQUNFLFNBQVM7WUFDVCxTQUFTLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQztZQUMvQixDQUFDLElBQUksQ0FBQyxRQUFRLEtBQUssU0FBUztnQkFDMUIsSUFBSSxDQUFDLFdBQVc7Z0JBQ2hCLElBQUksQ0FBQyxtQkFBbUI7Z0JBQ3hCLElBQUksQ0FBQyxnQkFBZ0I7Z0JBQ3JCLElBQUksQ0FBQyxVQUFVLENBQUMsRUFDbEIsQ0FBQztZQUNELE1BQU0sSUFBSSxZQUFZLHlEQUVwQiw4RkFBOEYsQ0FDL0YsQ0FBQztRQUNKLENBQUM7UUFDRCxJQUFJLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUN6QixJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDcEIsQ0FBQztRQUNELGdHQUFnRztRQUNoRyxvQ0FBb0M7UUFDcEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDNUIsQ0FBQztJQUlEOzs7Ozs7OztPQVFHO0lBQ0gsSUFDSSxVQUFVLENBQUMsaUJBQThEO1FBQzNFLElBQUksaUJBQWlCLElBQUksSUFBSSxFQUFFLENBQUM7WUFDOUIsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7WUFDNUIsSUFBSSxDQUFDLDBCQUEwQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3hDLENBQUM7YUFBTSxDQUFDO1lBQ04sSUFBSSxTQUFTLENBQUMsaUJBQWlCLENBQUMsRUFBRSxDQUFDO2dCQUNqQyxJQUFJLENBQUMsZUFBZSxHQUFHLGlCQUFpQixDQUFDO1lBQzNDLENBQUM7aUJBQU0sQ0FBQztnQkFDTixJQUFJLENBQUMsZUFBZSxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUM7b0JBQ3JELENBQUMsQ0FBQyxpQkFBaUI7b0JBQ25CLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDMUIsQ0FBQztZQUNELElBQUksQ0FBQywwQkFBMEIsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN2QyxDQUFDO0lBQ0gsQ0FBQztJQUVELGFBQWE7SUFRYixPQUFPLENBQ0wsTUFBYyxFQUNkLE9BQWdCLEVBQ2hCLFFBQWlCLEVBQ2pCLE1BQWUsRUFDZixPQUFnQjtRQUVoQixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBRTdCLElBQUksT0FBTyxLQUFLLElBQUksRUFBRSxDQUFDO1lBQ3JCLE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUVELElBQUksSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQ3pCLElBQUksTUFBTSxLQUFLLENBQUMsSUFBSSxPQUFPLElBQUksUUFBUSxJQUFJLE1BQU0sSUFBSSxPQUFPLEVBQUUsQ0FBQztnQkFDN0QsT0FBTyxJQUFJLENBQUM7WUFDZCxDQUFDO1lBRUQsSUFBSSxPQUFPLElBQUksQ0FBQyxNQUFNLEtBQUssUUFBUSxJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksT0FBTyxFQUFFLENBQUM7Z0JBQzlELE9BQU8sSUFBSSxDQUFDO1lBQ2QsQ0FBQztRQUNILENBQUM7UUFFRCxNQUFNLE1BQU0sR0FBRztZQUNiLGtCQUFrQixFQUFFLElBQUksQ0FBQyxrQkFBa0I7WUFDM0MsVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVO1lBQzNCLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSztZQUNqQixJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7U0FDaEIsQ0FBQztRQUNGLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztRQUUzQyw4REFBOEQ7UUFDOUQsa0VBQWtFO1FBQ2xFLGlCQUFpQjtRQUNqQixPQUFPLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQztJQUMvQixDQUFDO0lBRUQsYUFBYTtJQUNiLFdBQVc7UUFDVCxJQUFJLENBQUMsWUFBWSxFQUFFLFdBQVcsRUFBRSxDQUFDO0lBQ25DLENBQUM7SUFFTyxVQUFVO1FBQ2hCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDN0IsSUFBSSxDQUFDLElBQUk7WUFDUCxPQUFPLEtBQUssSUFBSSxJQUFJLElBQUksQ0FBQyxnQkFBZ0I7Z0JBQ3ZDLENBQUMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsa0JBQWtCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQzlFLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFFWCxNQUFNLGNBQWMsR0FDbEIsSUFBSSxDQUFDLElBQUksS0FBSyxJQUFJO1lBQ2hCLENBQUMsQ0FBQyxJQUFJO1lBQ04sQ0FBQyxDQUFDLDhFQUE4RTtnQkFDOUUsOEVBQThFO2dCQUM5RSxnRUFBZ0U7Z0JBQ2hFLDRFQUE0RTtnQkFDNUUscUVBQXFFO2dCQUNyRSx3RkFBd0Y7Z0JBQ3hGLEVBQUU7Z0JBQ0YseUZBQXlGO2dCQUN6Rix5RUFBeUU7Z0JBQ3pFLGtDQUFrQztnQkFDbEMsMEJBQTBCLENBQ3hCLElBQUksQ0FBQyxJQUFJLEVBQ1QsSUFBSSxDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxFQUMzQyxNQUFNLENBQ1AsQ0FBQztRQUNSLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFDbkQsQ0FBQztJQUVPLG1CQUFtQixDQUFDLFFBQWdCLEVBQUUsU0FBd0I7UUFDcEUsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUMvQixNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQztRQUM1QyxJQUFJLFNBQVMsS0FBSyxJQUFJLEVBQUUsQ0FBQztZQUN2QixRQUFRLENBQUMsWUFBWSxDQUFDLGFBQWEsRUFBRSxRQUFRLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDNUQsQ0FBQzthQUFNLENBQUM7WUFDTixRQUFRLENBQUMsZUFBZSxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUNwRCxDQUFDO0lBQ0gsQ0FBQztJQUVELElBQUksT0FBTztRQUNULElBQUksSUFBSSxDQUFDLGVBQWUsS0FBSyxJQUFJLEVBQUUsQ0FBQztZQUNsQyxPQUFPLElBQUksQ0FBQztRQUNkLENBQUM7YUFBTSxJQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQztZQUMzQyxPQUFPLElBQUksQ0FBQyxlQUFlLENBQUM7UUFDOUIsQ0FBQztRQUNELE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRTtZQUNyRCxvRkFBb0Y7WUFDcEYsd0VBQXdFO1lBQ3hFLFVBQVUsRUFBRSxJQUFJLENBQUMsVUFBVSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUs7WUFDeEUsV0FBVyxFQUFFLElBQUksQ0FBQyxXQUFXO1lBQzdCLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtZQUN2QixtQkFBbUIsRUFBRSxJQUFJLENBQUMsbUJBQW1CO1lBQzdDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxnQkFBZ0I7U0FDeEMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQzt5SEF4UlUsVUFBVSxzRUFzRVIsVUFBVTs2R0F0RVosVUFBVSw2UkErRkYsZ0JBQWdCLG9FQVFoQixnQkFBZ0IsNENBUWhCLGdCQUFnQjs7c0dBL0d4QixVQUFVO2tCQUp0QixTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSxjQUFjO29CQUN4QixVQUFVLEVBQUUsSUFBSTtpQkFDakI7OzBCQXVFSSxTQUFTOzJCQUFDLFVBQVU7eUhBM0RjLE1BQU07c0JBQTFDLFdBQVc7dUJBQUMsYUFBYTs7c0JBQUcsS0FBSztnQkFRekIsV0FBVztzQkFBbkIsS0FBSztnQkFPRyxRQUFRO3NCQUFoQixLQUFLO2dCQU9HLG1CQUFtQjtzQkFBM0IsS0FBSztnQkFPRyxLQUFLO3NCQUFiLEtBQUs7Z0JBT0csSUFBSTtzQkFBWixLQUFLO2dCQVVHLFVBQVU7c0JBQWxCLEtBQUs7Z0JBc0NnQyxnQkFBZ0I7c0JBQXJELEtBQUs7dUJBQUMsRUFBQyxTQUFTLEVBQUUsZ0JBQWdCLEVBQUM7Z0JBUUUsa0JBQWtCO3NCQUF2RCxLQUFLO3VCQUFDLEVBQUMsU0FBUyxFQUFFLGdCQUFnQixFQUFDO2dCQVFFLFVBQVU7c0JBQS9DLEtBQUs7dUJBQUMsRUFBQyxTQUFTLEVBQUUsZ0JBQWdCLEVBQUM7Z0JBa0RoQyxVQUFVO3NCQURiLEtBQUs7Z0JBeUJOLE9BQU87c0JBUE4sWUFBWTt1QkFBQyxPQUFPLEVBQUU7d0JBQ3JCLGVBQWU7d0JBQ2YsZ0JBQWdCO3dCQUNoQixpQkFBaUI7d0JBQ2pCLGVBQWU7d0JBQ2YsZ0JBQWdCO3FCQUNqQjs7QUFtR0g7Ozs7Ozs7R0FPRztBQUNILE9BQU8sRUFBQyxVQUFVLElBQUksa0JBQWtCLEVBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtMb2NhdGlvblN0cmF0ZWd5fSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtcbiAgQXR0cmlidXRlLFxuICBib29sZWFuQXR0cmlidXRlLFxuICBEaXJlY3RpdmUsXG4gIEVsZW1lbnRSZWYsXG4gIEhvc3RCaW5kaW5nLFxuICBIb3N0TGlzdGVuZXIsXG4gIElucHV0LFxuICBPbkNoYW5nZXMsXG4gIE9uRGVzdHJveSxcbiAgUmVuZGVyZXIyLFxuICDJtVJ1bnRpbWVFcnJvciBhcyBSdW50aW1lRXJyb3IsXG4gIFNpbXBsZUNoYW5nZXMsXG4gIMm1ybVzYW5pdGl6ZVVybE9yUmVzb3VyY2VVcmwsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtTdWJqZWN0LCBTdWJzY3JpcHRpb259IGZyb20gJ3J4anMnO1xuXG5pbXBvcnQge0V2ZW50LCBOYXZpZ2F0aW9uRW5kfSBmcm9tICcuLi9ldmVudHMnO1xuaW1wb3J0IHtRdWVyeVBhcmFtc0hhbmRsaW5nfSBmcm9tICcuLi9tb2RlbHMnO1xuaW1wb3J0IHtSb3V0ZXJ9IGZyb20gJy4uL3JvdXRlcic7XG5pbXBvcnQge0FjdGl2YXRlZFJvdXRlfSBmcm9tICcuLi9yb3V0ZXJfc3RhdGUnO1xuaW1wb3J0IHtQYXJhbXN9IGZyb20gJy4uL3NoYXJlZCc7XG5pbXBvcnQge2lzVXJsVHJlZSwgVXJsVHJlZX0gZnJvbSAnLi4vdXJsX3RyZWUnO1xuaW1wb3J0IHtSdW50aW1lRXJyb3JDb2RlfSBmcm9tICcuLi9lcnJvcnMnO1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIFdoZW4gYXBwbGllZCB0byBhbiBlbGVtZW50IGluIGEgdGVtcGxhdGUsIG1ha2VzIHRoYXQgZWxlbWVudCBhIGxpbmtcbiAqIHRoYXQgaW5pdGlhdGVzIG5hdmlnYXRpb24gdG8gYSByb3V0ZS4gTmF2aWdhdGlvbiBvcGVucyBvbmUgb3IgbW9yZSByb3V0ZWQgY29tcG9uZW50c1xuICogaW4gb25lIG9yIG1vcmUgYDxyb3V0ZXItb3V0bGV0PmAgbG9jYXRpb25zIG9uIHRoZSBwYWdlLlxuICpcbiAqIEdpdmVuIGEgcm91dGUgY29uZmlndXJhdGlvbiBgW3sgcGF0aDogJ3VzZXIvOm5hbWUnLCBjb21wb25lbnQ6IFVzZXJDbXAgfV1gLFxuICogdGhlIGZvbGxvd2luZyBjcmVhdGVzIGEgc3RhdGljIGxpbmsgdG8gdGhlIHJvdXRlOlxuICogYDxhIHJvdXRlckxpbms9XCIvdXNlci9ib2JcIj5saW5rIHRvIHVzZXIgY29tcG9uZW50PC9hPmBcbiAqXG4gKiBZb3UgY2FuIHVzZSBkeW5hbWljIHZhbHVlcyB0byBnZW5lcmF0ZSB0aGUgbGluay5cbiAqIEZvciBhIGR5bmFtaWMgbGluaywgcGFzcyBhbiBhcnJheSBvZiBwYXRoIHNlZ21lbnRzLFxuICogZm9sbG93ZWQgYnkgdGhlIHBhcmFtcyBmb3IgZWFjaCBzZWdtZW50LlxuICogRm9yIGV4YW1wbGUsIGBbJy90ZWFtJywgdGVhbUlkLCAndXNlcicsIHVzZXJOYW1lLCB7ZGV0YWlsczogdHJ1ZX1dYFxuICogZ2VuZXJhdGVzIGEgbGluayB0byBgL3RlYW0vMTEvdXNlci9ib2I7ZGV0YWlscz10cnVlYC5cbiAqXG4gKiBNdWx0aXBsZSBzdGF0aWMgc2VnbWVudHMgY2FuIGJlIG1lcmdlZCBpbnRvIG9uZSB0ZXJtIGFuZCBjb21iaW5lZCB3aXRoIGR5bmFtaWMgc2VnbWVudHMuXG4gKiBGb3IgZXhhbXBsZSwgYFsnL3RlYW0vMTEvdXNlcicsIHVzZXJOYW1lLCB7ZGV0YWlsczogdHJ1ZX1dYFxuICpcbiAqIFRoZSBpbnB1dCB0aGF0IHlvdSBwcm92aWRlIHRvIHRoZSBsaW5rIGlzIHRyZWF0ZWQgYXMgYSBkZWx0YSB0byB0aGUgY3VycmVudCBVUkwuXG4gKiBGb3IgaW5zdGFuY2UsIHN1cHBvc2UgdGhlIGN1cnJlbnQgVVJMIGlzIGAvdXNlci8oYm94Ly9hdXg6dGVhbSlgLlxuICogVGhlIGxpbmsgYDxhIFtyb3V0ZXJMaW5rXT1cIlsnL3VzZXIvamltJ11cIj5KaW08L2E+YCBjcmVhdGVzIHRoZSBVUkxcbiAqIGAvdXNlci8oamltLy9hdXg6dGVhbSlgLlxuICogU2VlIHtAbGluayBSb3V0ZXIjY3JlYXRlVXJsVHJlZX0gZm9yIG1vcmUgaW5mb3JtYXRpb24uXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiBZb3UgY2FuIHVzZSBhYnNvbHV0ZSBvciByZWxhdGl2ZSBwYXRocyBpbiBhIGxpbmssIHNldCBxdWVyeSBwYXJhbWV0ZXJzLFxuICogY29udHJvbCBob3cgcGFyYW1ldGVycyBhcmUgaGFuZGxlZCwgYW5kIGtlZXAgYSBoaXN0b3J5IG9mIG5hdmlnYXRpb24gc3RhdGVzLlxuICpcbiAqICMjIyBSZWxhdGl2ZSBsaW5rIHBhdGhzXG4gKlxuICogVGhlIGZpcnN0IHNlZ21lbnQgbmFtZSBjYW4gYmUgcHJlcGVuZGVkIHdpdGggYC9gLCBgLi9gLCBvciBgLi4vYC5cbiAqICogSWYgdGhlIGZpcnN0IHNlZ21lbnQgYmVnaW5zIHdpdGggYC9gLCB0aGUgcm91dGVyIGxvb2tzIHVwIHRoZSByb3V0ZSBmcm9tIHRoZSByb290IG9mIHRoZVxuICogICBhcHAuXG4gKiAqIElmIHRoZSBmaXJzdCBzZWdtZW50IGJlZ2lucyB3aXRoIGAuL2AsIG9yIGRvZXNuJ3QgYmVnaW4gd2l0aCBhIHNsYXNoLCB0aGUgcm91dGVyXG4gKiAgIGxvb2tzIGluIHRoZSBjaGlsZHJlbiBvZiB0aGUgY3VycmVudCBhY3RpdmF0ZWQgcm91dGUuXG4gKiAqIElmIHRoZSBmaXJzdCBzZWdtZW50IGJlZ2lucyB3aXRoIGAuLi9gLCB0aGUgcm91dGVyIGdvZXMgdXAgb25lIGxldmVsIGluIHRoZSByb3V0ZSB0cmVlLlxuICpcbiAqICMjIyBTZXR0aW5nIGFuZCBoYW5kbGluZyBxdWVyeSBwYXJhbXMgYW5kIGZyYWdtZW50c1xuICpcbiAqIFRoZSBmb2xsb3dpbmcgbGluayBhZGRzIGEgcXVlcnkgcGFyYW1ldGVyIGFuZCBhIGZyYWdtZW50IHRvIHRoZSBnZW5lcmF0ZWQgVVJMOlxuICpcbiAqIGBgYFxuICogPGEgW3JvdXRlckxpbmtdPVwiWycvdXNlci9ib2InXVwiIFtxdWVyeVBhcmFtc109XCJ7ZGVidWc6IHRydWV9XCIgZnJhZ21lbnQ9XCJlZHVjYXRpb25cIj5cbiAqICAgbGluayB0byB1c2VyIGNvbXBvbmVudFxuICogPC9hPlxuICogYGBgXG4gKiBCeSBkZWZhdWx0LCB0aGUgZGlyZWN0aXZlIGNvbnN0cnVjdHMgdGhlIG5ldyBVUkwgdXNpbmcgdGhlIGdpdmVuIHF1ZXJ5IHBhcmFtZXRlcnMuXG4gKiBUaGUgZXhhbXBsZSBnZW5lcmF0ZXMgdGhlIGxpbms6IGAvdXNlci9ib2I/ZGVidWc9dHJ1ZSNlZHVjYXRpb25gLlxuICpcbiAqIFlvdSBjYW4gaW5zdHJ1Y3QgdGhlIGRpcmVjdGl2ZSB0byBoYW5kbGUgcXVlcnkgcGFyYW1ldGVycyBkaWZmZXJlbnRseVxuICogYnkgc3BlY2lmeWluZyB0aGUgYHF1ZXJ5UGFyYW1zSGFuZGxpbmdgIG9wdGlvbiBpbiB0aGUgbGluay5cbiAqIEFsbG93ZWQgdmFsdWVzIGFyZTpcbiAqXG4gKiAgLSBgJ21lcmdlJ2A6IE1lcmdlIHRoZSBnaXZlbiBgcXVlcnlQYXJhbXNgIGludG8gdGhlIGN1cnJlbnQgcXVlcnkgcGFyYW1zLlxuICogIC0gYCdwcmVzZXJ2ZSdgOiBQcmVzZXJ2ZSB0aGUgY3VycmVudCBxdWVyeSBwYXJhbXMuXG4gKlxuICogRm9yIGV4YW1wbGU6XG4gKlxuICogYGBgXG4gKiA8YSBbcm91dGVyTGlua109XCJbJy91c2VyL2JvYiddXCIgW3F1ZXJ5UGFyYW1zXT1cIntkZWJ1ZzogdHJ1ZX1cIiBxdWVyeVBhcmFtc0hhbmRsaW5nPVwibWVyZ2VcIj5cbiAqICAgbGluayB0byB1c2VyIGNvbXBvbmVudFxuICogPC9hPlxuICogYGBgXG4gKlxuICogYHF1ZXJ5UGFyYW1zYCwgYGZyYWdtZW50YCwgYHF1ZXJ5UGFyYW1zSGFuZGxpbmdgLCBgcHJlc2VydmVGcmFnbWVudGAsIGFuZCBgcmVsYXRpdmVUb2BcbiAqIGNhbm5vdCBiZSB1c2VkIHdoZW4gdGhlIGByb3V0ZXJMaW5rYCBpbnB1dCBpcyBhIGBVcmxUcmVlYC5cbiAqXG4gKiBTZWUge0BsaW5rIFVybENyZWF0aW9uT3B0aW9ucyNxdWVyeVBhcmFtc0hhbmRsaW5nfS5cbiAqXG4gKiAjIyMgUHJlc2VydmluZyBuYXZpZ2F0aW9uIGhpc3RvcnlcbiAqXG4gKiBZb3UgY2FuIHByb3ZpZGUgYSBgc3RhdGVgIHZhbHVlIHRvIGJlIHBlcnNpc3RlZCB0byB0aGUgYnJvd3NlcidzXG4gKiBbYEhpc3Rvcnkuc3RhdGVgIHByb3BlcnR5XShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvSGlzdG9yeSNQcm9wZXJ0aWVzKS5cbiAqIEZvciBleGFtcGxlOlxuICpcbiAqIGBgYFxuICogPGEgW3JvdXRlckxpbmtdPVwiWycvdXNlci9ib2InXVwiIFtzdGF0ZV09XCJ7dHJhY2luZ0lkOiAxMjN9XCI+XG4gKiAgIGxpbmsgdG8gdXNlciBjb21wb25lbnRcbiAqIDwvYT5cbiAqIGBgYFxuICpcbiAqIFVzZSB7QGxpbmsgUm91dGVyI2dldEN1cnJlbnROYXZpZ2F0aW9ufSB0byByZXRyaWV2ZSBhIHNhdmVkXG4gKiBuYXZpZ2F0aW9uLXN0YXRlIHZhbHVlLiBGb3IgZXhhbXBsZSwgdG8gY2FwdHVyZSB0aGUgYHRyYWNpbmdJZGAgZHVyaW5nIHRoZSBgTmF2aWdhdGlvblN0YXJ0YFxuICogZXZlbnQ6XG4gKlxuICogYGBgXG4gKiAvLyBHZXQgTmF2aWdhdGlvblN0YXJ0IGV2ZW50c1xuICogcm91dGVyLmV2ZW50cy5waXBlKGZpbHRlcihlID0+IGUgaW5zdGFuY2VvZiBOYXZpZ2F0aW9uU3RhcnQpKS5zdWJzY3JpYmUoZSA9PiB7XG4gKiAgIGNvbnN0IG5hdmlnYXRpb24gPSByb3V0ZXIuZ2V0Q3VycmVudE5hdmlnYXRpb24oKTtcbiAqICAgdHJhY2luZ1NlcnZpY2UudHJhY2Uoe2lkOiBuYXZpZ2F0aW9uLmV4dHJhcy5zdGF0ZS50cmFjaW5nSWR9KTtcbiAqIH0pO1xuICogYGBgXG4gKlxuICogQG5nTW9kdWxlIFJvdXRlck1vZHVsZVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW3JvdXRlckxpbmtdJyxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbn0pXG5leHBvcnQgY2xhc3MgUm91dGVyTGluayBpbXBsZW1lbnRzIE9uQ2hhbmdlcywgT25EZXN0cm95IHtcbiAgLyoqXG4gICAqIFJlcHJlc2VudHMgYW4gYGhyZWZgIGF0dHJpYnV0ZSB2YWx1ZSBhcHBsaWVkIHRvIGEgaG9zdCBlbGVtZW50LFxuICAgKiB3aGVuIGEgaG9zdCBlbGVtZW50IGlzIGA8YT5gLiBGb3Igb3RoZXIgdGFncywgdGhlIHZhbHVlIGlzIGBudWxsYC5cbiAgICovXG4gIGhyZWY6IHN0cmluZyB8IG51bGwgPSBudWxsO1xuXG4gIC8qKlxuICAgKiBSZXByZXNlbnRzIHRoZSBgdGFyZ2V0YCBhdHRyaWJ1dGUgb24gYSBob3N0IGVsZW1lbnQuXG4gICAqIFRoaXMgaXMgb25seSB1c2VkIHdoZW4gdGhlIGhvc3QgZWxlbWVudCBpcyBhbiBgPGE+YCB0YWcuXG4gICAqL1xuICBASG9zdEJpbmRpbmcoJ2F0dHIudGFyZ2V0JykgQElucHV0KCkgdGFyZ2V0Pzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBQYXNzZWQgdG8ge0BsaW5rIFJvdXRlciNjcmVhdGVVcmxUcmVlfSBhcyBwYXJ0IG9mIHRoZVxuICAgKiBgVXJsQ3JlYXRpb25PcHRpb25zYC5cbiAgICogQHNlZSB7QGxpbmsgVXJsQ3JlYXRpb25PcHRpb25zI3F1ZXJ5UGFyYW1zfVxuICAgKiBAc2VlIHtAbGluayBSb3V0ZXIjY3JlYXRlVXJsVHJlZX1cbiAgICovXG4gIEBJbnB1dCgpIHF1ZXJ5UGFyYW1zPzogUGFyYW1zIHwgbnVsbDtcbiAgLyoqXG4gICAqIFBhc3NlZCB0byB7QGxpbmsgUm91dGVyI2NyZWF0ZVVybFRyZWV9IGFzIHBhcnQgb2YgdGhlXG4gICAqIGBVcmxDcmVhdGlvbk9wdGlvbnNgLlxuICAgKiBAc2VlIHtAbGluayBVcmxDcmVhdGlvbk9wdGlvbnMjZnJhZ21lbnR9XG4gICAqIEBzZWUge0BsaW5rIFJvdXRlciNjcmVhdGVVcmxUcmVlfVxuICAgKi9cbiAgQElucHV0KCkgZnJhZ21lbnQ/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiBQYXNzZWQgdG8ge0BsaW5rIFJvdXRlciNjcmVhdGVVcmxUcmVlfSBhcyBwYXJ0IG9mIHRoZVxuICAgKiBgVXJsQ3JlYXRpb25PcHRpb25zYC5cbiAgICogQHNlZSB7QGxpbmsgVXJsQ3JlYXRpb25PcHRpb25zI3F1ZXJ5UGFyYW1zSGFuZGxpbmd9XG4gICAqIEBzZWUge0BsaW5rIFJvdXRlciNjcmVhdGVVcmxUcmVlfVxuICAgKi9cbiAgQElucHV0KCkgcXVlcnlQYXJhbXNIYW5kbGluZz86IFF1ZXJ5UGFyYW1zSGFuZGxpbmcgfCBudWxsO1xuICAvKipcbiAgICogUGFzc2VkIHRvIHtAbGluayBSb3V0ZXIjbmF2aWdhdGVCeVVybH0gYXMgcGFydCBvZiB0aGVcbiAgICogYE5hdmlnYXRpb25CZWhhdmlvck9wdGlvbnNgLlxuICAgKiBAc2VlIHtAbGluayBOYXZpZ2F0aW9uQmVoYXZpb3JPcHRpb25zI3N0YXRlfVxuICAgKiBAc2VlIHtAbGluayBSb3V0ZXIjbmF2aWdhdGVCeVVybH1cbiAgICovXG4gIEBJbnB1dCgpIHN0YXRlPzoge1trOiBzdHJpbmddOiBhbnl9O1xuICAvKipcbiAgICogUGFzc2VkIHRvIHtAbGluayBSb3V0ZXIjbmF2aWdhdGVCeVVybH0gYXMgcGFydCBvZiB0aGVcbiAgICogYE5hdmlnYXRpb25CZWhhdmlvck9wdGlvbnNgLlxuICAgKiBAc2VlIHtAbGluayBOYXZpZ2F0aW9uQmVoYXZpb3JPcHRpb25zI2luZm99XG4gICAqIEBzZWUge0BsaW5rIFJvdXRlciNuYXZpZ2F0ZUJ5VXJsfVxuICAgKi9cbiAgQElucHV0KCkgaW5mbz86IHVua25vd247XG4gIC8qKlxuICAgKiBQYXNzZWQgdG8ge0BsaW5rIFJvdXRlciNjcmVhdGVVcmxUcmVlfSBhcyBwYXJ0IG9mIHRoZVxuICAgKiBgVXJsQ3JlYXRpb25PcHRpb25zYC5cbiAgICogU3BlY2lmeSBhIHZhbHVlIGhlcmUgd2hlbiB5b3UgZG8gbm90IHdhbnQgdG8gdXNlIHRoZSBkZWZhdWx0IHZhbHVlXG4gICAqIGZvciBgcm91dGVyTGlua2AsIHdoaWNoIGlzIHRoZSBjdXJyZW50IGFjdGl2YXRlZCByb3V0ZS5cbiAgICogTm90ZSB0aGF0IGEgdmFsdWUgb2YgYHVuZGVmaW5lZGAgaGVyZSB3aWxsIHVzZSB0aGUgYHJvdXRlckxpbmtgIGRlZmF1bHQuXG4gICAqIEBzZWUge0BsaW5rIFVybENyZWF0aW9uT3B0aW9ucyNyZWxhdGl2ZVRvfVxuICAgKiBAc2VlIHtAbGluayBSb3V0ZXIjY3JlYXRlVXJsVHJlZX1cbiAgICovXG4gIEBJbnB1dCgpIHJlbGF0aXZlVG8/OiBBY3RpdmF0ZWRSb3V0ZSB8IG51bGw7XG5cbiAgLyoqIFdoZXRoZXIgYSBob3N0IGVsZW1lbnQgaXMgYW4gYDxhPmAgdGFnLiAqL1xuICBwcml2YXRlIGlzQW5jaG9yRWxlbWVudDogYm9vbGVhbjtcblxuICBwcml2YXRlIHN1YnNjcmlwdGlvbj86IFN1YnNjcmlwdGlvbjtcblxuICAvKiogQGludGVybmFsICovXG4gIG9uQ2hhbmdlcyA9IG5ldyBTdWJqZWN0PFJvdXRlckxpbms+KCk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSByb3V0ZXI6IFJvdXRlcixcbiAgICBwcml2YXRlIHJvdXRlOiBBY3RpdmF0ZWRSb3V0ZSxcbiAgICBAQXR0cmlidXRlKCd0YWJpbmRleCcpIHByaXZhdGUgcmVhZG9ubHkgdGFiSW5kZXhBdHRyaWJ1dGU6IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQsXG4gICAgcHJpdmF0ZSByZWFkb25seSByZW5kZXJlcjogUmVuZGVyZXIyLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgZWw6IEVsZW1lbnRSZWYsXG4gICAgcHJpdmF0ZSBsb2NhdGlvblN0cmF0ZWd5PzogTG9jYXRpb25TdHJhdGVneSxcbiAgKSB7XG4gICAgY29uc3QgdGFnTmFtZSA9IGVsLm5hdGl2ZUVsZW1lbnQudGFnTmFtZT8udG9Mb3dlckNhc2UoKTtcbiAgICB0aGlzLmlzQW5jaG9yRWxlbWVudCA9IHRhZ05hbWUgPT09ICdhJyB8fCB0YWdOYW1lID09PSAnYXJlYSc7XG5cbiAgICBpZiAodGhpcy5pc0FuY2hvckVsZW1lbnQpIHtcbiAgICAgIHRoaXMuc3Vic2NyaXB0aW9uID0gcm91dGVyLmV2ZW50cy5zdWJzY3JpYmUoKHM6IEV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChzIGluc3RhbmNlb2YgTmF2aWdhdGlvbkVuZCkge1xuICAgICAgICAgIHRoaXMudXBkYXRlSHJlZigpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zZXRUYWJJbmRleElmTm90T25OYXRpdmVFbCgnMCcpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBQYXNzZWQgdG8ge0BsaW5rIFJvdXRlciNjcmVhdGVVcmxUcmVlfSBhcyBwYXJ0IG9mIHRoZVxuICAgKiBgVXJsQ3JlYXRpb25PcHRpb25zYC5cbiAgICogQHNlZSB7QGxpbmsgVXJsQ3JlYXRpb25PcHRpb25zI3ByZXNlcnZlRnJhZ21lbnR9XG4gICAqIEBzZWUge0BsaW5rIFJvdXRlciNjcmVhdGVVcmxUcmVlfVxuICAgKi9cbiAgQElucHV0KHt0cmFuc2Zvcm06IGJvb2xlYW5BdHRyaWJ1dGV9KSBwcmVzZXJ2ZUZyYWdtZW50OiBib29sZWFuID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIFBhc3NlZCB0byB7QGxpbmsgUm91dGVyI25hdmlnYXRlQnlVcmx9IGFzIHBhcnQgb2YgdGhlXG4gICAqIGBOYXZpZ2F0aW9uQmVoYXZpb3JPcHRpb25zYC5cbiAgICogQHNlZSB7QGxpbmsgTmF2aWdhdGlvbkJlaGF2aW9yT3B0aW9ucyNza2lwTG9jYXRpb25DaGFuZ2V9XG4gICAqIEBzZWUge0BsaW5rIFJvdXRlciNuYXZpZ2F0ZUJ5VXJsfVxuICAgKi9cbiAgQElucHV0KHt0cmFuc2Zvcm06IGJvb2xlYW5BdHRyaWJ1dGV9KSBza2lwTG9jYXRpb25DaGFuZ2U6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAvKipcbiAgICogUGFzc2VkIHRvIHtAbGluayBSb3V0ZXIjbmF2aWdhdGVCeVVybH0gYXMgcGFydCBvZiB0aGVcbiAgICogYE5hdmlnYXRpb25CZWhhdmlvck9wdGlvbnNgLlxuICAgKiBAc2VlIHtAbGluayBOYXZpZ2F0aW9uQmVoYXZpb3JPcHRpb25zI3JlcGxhY2VVcmx9XG4gICAqIEBzZWUge0BsaW5rIFJvdXRlciNuYXZpZ2F0ZUJ5VXJsfVxuICAgKi9cbiAgQElucHV0KHt0cmFuc2Zvcm06IGJvb2xlYW5BdHRyaWJ1dGV9KSByZXBsYWNlVXJsOiBib29sZWFuID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIE1vZGlmaWVzIHRoZSB0YWIgaW5kZXggaWYgdGhlcmUgd2FzIG5vdCBhIHRhYmluZGV4IGF0dHJpYnV0ZSBvbiB0aGUgZWxlbWVudCBkdXJpbmdcbiAgICogaW5zdGFudGlhdGlvbi5cbiAgICovXG4gIHByaXZhdGUgc2V0VGFiSW5kZXhJZk5vdE9uTmF0aXZlRWwobmV3VGFiSW5kZXg6IHN0cmluZyB8IG51bGwpIHtcbiAgICBpZiAodGhpcy50YWJJbmRleEF0dHJpYnV0ZSAhPSBudWxsIC8qIGJvdGggYG51bGxgIGFuZCBgdW5kZWZpbmVkYCAqLyB8fCB0aGlzLmlzQW5jaG9yRWxlbWVudCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmFwcGx5QXR0cmlidXRlVmFsdWUoJ3RhYmluZGV4JywgbmV3VGFiSW5kZXgpO1xuICB9XG5cbiAgLyoqIEBub2RvYyAqL1xuICAvLyBUT0RPKGF0c2NvdHQpOiBSZW1vdmUgY2hhbmdlcyBwYXJhbWV0ZXIgaW4gbWFqb3IgdmVyc2lvbiBhcyBhIGJyZWFraW5nIGNoYW5nZS5cbiAgbmdPbkNoYW5nZXMoY2hhbmdlcz86IFNpbXBsZUNoYW5nZXMpIHtcbiAgICBpZiAoXG4gICAgICBuZ0Rldk1vZGUgJiZcbiAgICAgIGlzVXJsVHJlZSh0aGlzLnJvdXRlckxpbmtJbnB1dCkgJiZcbiAgICAgICh0aGlzLmZyYWdtZW50ICE9PSB1bmRlZmluZWQgfHxcbiAgICAgICAgdGhpcy5xdWVyeVBhcmFtcyB8fFxuICAgICAgICB0aGlzLnF1ZXJ5UGFyYW1zSGFuZGxpbmcgfHxcbiAgICAgICAgdGhpcy5wcmVzZXJ2ZUZyYWdtZW50IHx8XG4gICAgICAgIHRoaXMucmVsYXRpdmVUbylcbiAgICApIHtcbiAgICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9ST1VURVJfTElOS19JTlBVVFMsXG4gICAgICAgICdDYW5ub3QgY29uZmlndXJlIHF1ZXJ5UGFyYW1zIG9yIGZyYWdtZW50IHdoZW4gdXNpbmcgYSBVcmxUcmVlIGFzIHRoZSByb3V0ZXJMaW5rIGlucHV0IHZhbHVlLicsXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc0FuY2hvckVsZW1lbnQpIHtcbiAgICAgIHRoaXMudXBkYXRlSHJlZigpO1xuICAgIH1cbiAgICAvLyBUaGlzIGlzIHN1YnNjcmliZWQgdG8gYnkgYFJvdXRlckxpbmtBY3RpdmVgIHNvIHRoYXQgaXQga25vd3MgdG8gdXBkYXRlIHdoZW4gdGhlcmUgYXJlIGNoYW5nZXNcbiAgICAvLyB0byB0aGUgUm91dGVyTGlua3MgaXQncyB0cmFja2luZy5cbiAgICB0aGlzLm9uQ2hhbmdlcy5uZXh0KHRoaXMpO1xuICB9XG5cbiAgcHJpdmF0ZSByb3V0ZXJMaW5rSW5wdXQ6IGFueVtdIHwgVXJsVHJlZSB8IG51bGwgPSBudWxsO1xuXG4gIC8qKlxuICAgKiBDb21tYW5kcyB0byBwYXNzIHRvIHtAbGluayBSb3V0ZXIjY3JlYXRlVXJsVHJlZX0gb3IgYSBgVXJsVHJlZWAuXG4gICAqICAgLSAqKmFycmF5Kio6IGNvbW1hbmRzIHRvIHBhc3MgdG8ge0BsaW5rIFJvdXRlciNjcmVhdGVVcmxUcmVlfS5cbiAgICogICAtICoqc3RyaW5nKio6IHNob3J0aGFuZCBmb3IgYXJyYXkgb2YgY29tbWFuZHMgd2l0aCBqdXN0IHRoZSBzdHJpbmcsIGkuZS4gYFsnL3JvdXRlJ11gXG4gICAqICAgLSAqKlVybFRyZWUqKjogYSBgVXJsVHJlZWAgZm9yIHRoaXMgbGluayByYXRoZXIgdGhhbiBjcmVhdGluZyBvbmUgZnJvbSB0aGUgY29tbWFuZHNcbiAgICogICAgIGFuZCBvdGhlciBpbnB1dHMgdGhhdCBjb3JyZXNwb25kIHRvIHByb3BlcnRpZXMgb2YgYFVybENyZWF0aW9uT3B0aW9uc2AuXG4gICAqICAgLSAqKm51bGx8dW5kZWZpbmVkKio6IGVmZmVjdGl2ZWx5IGRpc2FibGVzIHRoZSBgcm91dGVyTGlua2BcbiAgICogQHNlZSB7QGxpbmsgUm91dGVyI2NyZWF0ZVVybFRyZWV9XG4gICAqL1xuICBASW5wdXQoKVxuICBzZXQgcm91dGVyTGluayhjb21tYW5kc09yVXJsVHJlZTogYW55W10gfCBzdHJpbmcgfCBVcmxUcmVlIHwgbnVsbCB8IHVuZGVmaW5lZCkge1xuICAgIGlmIChjb21tYW5kc09yVXJsVHJlZSA9PSBudWxsKSB7XG4gICAgICB0aGlzLnJvdXRlckxpbmtJbnB1dCA9IG51bGw7XG4gICAgICB0aGlzLnNldFRhYkluZGV4SWZOb3RPbk5hdGl2ZUVsKG51bGwpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoaXNVcmxUcmVlKGNvbW1hbmRzT3JVcmxUcmVlKSkge1xuICAgICAgICB0aGlzLnJvdXRlckxpbmtJbnB1dCA9IGNvbW1hbmRzT3JVcmxUcmVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5yb3V0ZXJMaW5rSW5wdXQgPSBBcnJheS5pc0FycmF5KGNvbW1hbmRzT3JVcmxUcmVlKVxuICAgICAgICAgID8gY29tbWFuZHNPclVybFRyZWVcbiAgICAgICAgICA6IFtjb21tYW5kc09yVXJsVHJlZV07XG4gICAgICB9XG4gICAgICB0aGlzLnNldFRhYkluZGV4SWZOb3RPbk5hdGl2ZUVsKCcwJyk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBub2RvYyAqL1xuICBASG9zdExpc3RlbmVyKCdjbGljaycsIFtcbiAgICAnJGV2ZW50LmJ1dHRvbicsXG4gICAgJyRldmVudC5jdHJsS2V5JyxcbiAgICAnJGV2ZW50LnNoaWZ0S2V5JyxcbiAgICAnJGV2ZW50LmFsdEtleScsXG4gICAgJyRldmVudC5tZXRhS2V5JyxcbiAgXSlcbiAgb25DbGljayhcbiAgICBidXR0b246IG51bWJlcixcbiAgICBjdHJsS2V5OiBib29sZWFuLFxuICAgIHNoaWZ0S2V5OiBib29sZWFuLFxuICAgIGFsdEtleTogYm9vbGVhbixcbiAgICBtZXRhS2V5OiBib29sZWFuLFxuICApOiBib29sZWFuIHtcbiAgICBjb25zdCB1cmxUcmVlID0gdGhpcy51cmxUcmVlO1xuXG4gICAgaWYgKHVybFRyZWUgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmlzQW5jaG9yRWxlbWVudCkge1xuICAgICAgaWYgKGJ1dHRvbiAhPT0gMCB8fCBjdHJsS2V5IHx8IHNoaWZ0S2V5IHx8IGFsdEtleSB8fCBtZXRhS2V5KSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIHRoaXMudGFyZ2V0ID09PSAnc3RyaW5nJyAmJiB0aGlzLnRhcmdldCAhPSAnX3NlbGYnKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGV4dHJhcyA9IHtcbiAgICAgIHNraXBMb2NhdGlvbkNoYW5nZTogdGhpcy5za2lwTG9jYXRpb25DaGFuZ2UsXG4gICAgICByZXBsYWNlVXJsOiB0aGlzLnJlcGxhY2VVcmwsXG4gICAgICBzdGF0ZTogdGhpcy5zdGF0ZSxcbiAgICAgIGluZm86IHRoaXMuaW5mbyxcbiAgICB9O1xuICAgIHRoaXMucm91dGVyLm5hdmlnYXRlQnlVcmwodXJsVHJlZSwgZXh0cmFzKTtcblxuICAgIC8vIFJldHVybiBgZmFsc2VgIGZvciBgPGE+YCBlbGVtZW50cyB0byBwcmV2ZW50IGRlZmF1bHQgYWN0aW9uXG4gICAgLy8gYW5kIGNhbmNlbCB0aGUgbmF0aXZlIGJlaGF2aW9yLCBzaW5jZSB0aGUgbmF2aWdhdGlvbiBpcyBoYW5kbGVkXG4gICAgLy8gYnkgdGhlIFJvdXRlci5cbiAgICByZXR1cm4gIXRoaXMuaXNBbmNob3JFbGVtZW50O1xuICB9XG5cbiAgLyoqIEBub2RvYyAqL1xuICBuZ09uRGVzdHJveSgpOiBhbnkge1xuICAgIHRoaXMuc3Vic2NyaXB0aW9uPy51bnN1YnNjcmliZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSB1cGRhdGVIcmVmKCk6IHZvaWQge1xuICAgIGNvbnN0IHVybFRyZWUgPSB0aGlzLnVybFRyZWU7XG4gICAgdGhpcy5ocmVmID1cbiAgICAgIHVybFRyZWUgIT09IG51bGwgJiYgdGhpcy5sb2NhdGlvblN0cmF0ZWd5XG4gICAgICAgID8gdGhpcy5sb2NhdGlvblN0cmF0ZWd5Py5wcmVwYXJlRXh0ZXJuYWxVcmwodGhpcy5yb3V0ZXIuc2VyaWFsaXplVXJsKHVybFRyZWUpKVxuICAgICAgICA6IG51bGw7XG5cbiAgICBjb25zdCBzYW5pdGl6ZWRWYWx1ZSA9XG4gICAgICB0aGlzLmhyZWYgPT09IG51bGxcbiAgICAgICAgPyBudWxsXG4gICAgICAgIDogLy8gVGhpcyBjbGFzcyByZXByZXNlbnRzIGEgZGlyZWN0aXZlIHRoYXQgY2FuIGJlIGFkZGVkIHRvIGJvdGggYDxhPmAgZWxlbWVudHMsXG4gICAgICAgICAgLy8gYXMgd2VsbCBhcyBvdGhlciBlbGVtZW50cy4gQXMgYSByZXN1bHQsIHdlIGNhbid0IGRlZmluZSBzZWN1cml0eSBjb250ZXh0IGF0XG4gICAgICAgICAgLy8gY29tcGlsZSB0aW1lLiBTbyB0aGUgc2VjdXJpdHkgY29udGV4dCBpcyBkZWZlcnJlZCB0byBydW50aW1lLlxuICAgICAgICAgIC8vIFRoZSBgybXJtXNhbml0aXplVXJsT3JSZXNvdXJjZVVybGAgc2VsZWN0cyB0aGUgbmVjZXNzYXJ5IHNhbml0aXplciBmdW5jdGlvblxuICAgICAgICAgIC8vIGJhc2VkIG9uIHRoZSB0YWcgYW5kIHByb3BlcnR5IG5hbWVzLiBUaGUgbG9naWMgbWltaWNzIHRoZSBvbmUgZnJvbVxuICAgICAgICAgIC8vIGBwYWNrYWdlcy9jb21waWxlci9zcmMvc2NoZW1hL2RvbV9zZWN1cml0eV9zY2hlbWEudHNgLCB3aGljaCBpcyB1c2VkIGF0IGNvbXBpbGUgdGltZS5cbiAgICAgICAgICAvL1xuICAgICAgICAgIC8vIE5vdGU6IHdlIHNob3VsZCBpbnZlc3RpZ2F0ZSB3aGV0aGVyIHdlIGNhbiBzd2l0Y2ggdG8gdXNpbmcgYEBIb3N0QmluZGluZygnYXR0ci5ocmVmJylgXG4gICAgICAgICAgLy8gaW5zdGVhZCBvZiBhcHBseWluZyBhIHZhbHVlIHZpYSBhIHJlbmRlcmVyLCBhZnRlciBhIGZpbmFsIG1lcmdlIG9mIHRoZVxuICAgICAgICAgIC8vIGBSb3V0ZXJMaW5rV2l0aEhyZWZgIGRpcmVjdGl2ZS5cbiAgICAgICAgICDJtcm1c2FuaXRpemVVcmxPclJlc291cmNlVXJsKFxuICAgICAgICAgICAgdGhpcy5ocmVmLFxuICAgICAgICAgICAgdGhpcy5lbC5uYXRpdmVFbGVtZW50LnRhZ05hbWUudG9Mb3dlckNhc2UoKSxcbiAgICAgICAgICAgICdocmVmJyxcbiAgICAgICAgICApO1xuICAgIHRoaXMuYXBwbHlBdHRyaWJ1dGVWYWx1ZSgnaHJlZicsIHNhbml0aXplZFZhbHVlKTtcbiAgfVxuXG4gIHByaXZhdGUgYXBwbHlBdHRyaWJ1dGVWYWx1ZShhdHRyTmFtZTogc3RyaW5nLCBhdHRyVmFsdWU6IHN0cmluZyB8IG51bGwpIHtcbiAgICBjb25zdCByZW5kZXJlciA9IHRoaXMucmVuZGVyZXI7XG4gICAgY29uc3QgbmF0aXZlRWxlbWVudCA9IHRoaXMuZWwubmF0aXZlRWxlbWVudDtcbiAgICBpZiAoYXR0clZhbHVlICE9PSBudWxsKSB7XG4gICAgICByZW5kZXJlci5zZXRBdHRyaWJ1dGUobmF0aXZlRWxlbWVudCwgYXR0ck5hbWUsIGF0dHJWYWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlbmRlcmVyLnJlbW92ZUF0dHJpYnV0ZShuYXRpdmVFbGVtZW50LCBhdHRyTmFtZSk7XG4gICAgfVxuICB9XG5cbiAgZ2V0IHVybFRyZWUoKTogVXJsVHJlZSB8IG51bGwge1xuICAgIGlmICh0aGlzLnJvdXRlckxpbmtJbnB1dCA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSBlbHNlIGlmIChpc1VybFRyZWUodGhpcy5yb3V0ZXJMaW5rSW5wdXQpKSB7XG4gICAgICByZXR1cm4gdGhpcy5yb3V0ZXJMaW5rSW5wdXQ7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnJvdXRlci5jcmVhdGVVcmxUcmVlKHRoaXMucm91dGVyTGlua0lucHV0LCB7XG4gICAgICAvLyBJZiB0aGUgYHJlbGF0aXZlVG9gIGlucHV0IGlzIG5vdCBkZWZpbmVkLCB3ZSB3YW50IHRvIHVzZSBgdGhpcy5yb3V0ZWAgYnkgZGVmYXVsdC5cbiAgICAgIC8vIE90aGVyd2lzZSwgd2Ugc2hvdWxkIHVzZSB0aGUgdmFsdWUgcHJvdmlkZWQgYnkgdGhlIHVzZXIgaW4gdGhlIGlucHV0LlxuICAgICAgcmVsYXRpdmVUbzogdGhpcy5yZWxhdGl2ZVRvICE9PSB1bmRlZmluZWQgPyB0aGlzLnJlbGF0aXZlVG8gOiB0aGlzLnJvdXRlLFxuICAgICAgcXVlcnlQYXJhbXM6IHRoaXMucXVlcnlQYXJhbXMsXG4gICAgICBmcmFnbWVudDogdGhpcy5mcmFnbWVudCxcbiAgICAgIHF1ZXJ5UGFyYW1zSGFuZGxpbmc6IHRoaXMucXVlcnlQYXJhbXNIYW5kbGluZyxcbiAgICAgIHByZXNlcnZlRnJhZ21lbnQ6IHRoaXMucHJlc2VydmVGcmFnbWVudCxcbiAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICogQW4gYWxpYXMgZm9yIHRoZSBgUm91dGVyTGlua2AgZGlyZWN0aXZlLlxuICogRGVwcmVjYXRlZCBzaW5jZSB2MTUsIHVzZSBgUm91dGVyTGlua2AgZGlyZWN0aXZlIGluc3RlYWQuXG4gKlxuICogQGRlcHJlY2F0ZWQgdXNlIGBSb3V0ZXJMaW5rYCBkaXJlY3RpdmUgaW5zdGVhZC5cbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IHtSb3V0ZXJMaW5rIGFzIFJvdXRlckxpbmtXaXRoSHJlZn07XG4iXX0=