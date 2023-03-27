/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ChangeDetectorRef, ContentChildren, Directive, ElementRef, EventEmitter, Input, Optional, Output, QueryList, Renderer2 } from '@angular/core';
import { from, of } from 'rxjs';
import { mergeAll } from 'rxjs/operators';
import { NavigationEnd } from '../events';
import { Router } from '../router';
import { RouterLink } from './router_link';
import * as i0 from "@angular/core";
import * as i1 from "../router";
import * as i2 from "./router_link";
/**
 *
 * @description
 *
 * Tracks whether the linked route of an element is currently active, and allows you
 * to specify one or more CSS classes to add to the element when the linked route
 * is active.
 *
 * Use this directive to create a visual distinction for elements associated with an active route.
 * For example, the following code highlights the word "Bob" when the router
 * activates the associated route:
 *
 * ```
 * <a routerLink="/user/bob" routerLinkActive="active-link">Bob</a>
 * ```
 *
 * Whenever the URL is either '/user' or '/user/bob', the "active-link" class is
 * added to the anchor tag. If the URL changes, the class is removed.
 *
 * You can set more than one class using a space-separated string or an array.
 * For example:
 *
 * ```
 * <a routerLink="/user/bob" routerLinkActive="class1 class2">Bob</a>
 * <a routerLink="/user/bob" [routerLinkActive]="['class1', 'class2']">Bob</a>
 * ```
 *
 * To add the classes only when the URL matches the link exactly, add the option `exact: true`:
 *
 * ```
 * <a routerLink="/user/bob" routerLinkActive="active-link" [routerLinkActiveOptions]="{exact:
 * true}">Bob</a>
 * ```
 *
 * To directly check the `isActive` status of the link, assign the `RouterLinkActive`
 * instance to a template variable.
 * For example, the following checks the status without assigning any CSS classes:
 *
 * ```
 * <a routerLink="/user/bob" routerLinkActive #rla="routerLinkActive">
 *   Bob {{ rla.isActive ? '(already open)' : ''}}
 * </a>
 * ```
 *
 * You can apply the `RouterLinkActive` directive to an ancestor of linked elements.
 * For example, the following sets the active-link class on the `<div>`  parent tag
 * when the URL is either '/user/jim' or '/user/bob'.
 *
 * ```
 * <div routerLinkActive="active-link" [routerLinkActiveOptions]="{exact: true}">
 *   <a routerLink="/user/jim">Jim</a>
 *   <a routerLink="/user/bob">Bob</a>
 * </div>
 * ```
 *
 * The `RouterLinkActive` directive can also be used to set the aria-current attribute
 * to provide an alternative distinction for active elements to visually impaired users.
 *
 * For example, the following code adds the 'active' class to the Home Page link when it is
 * indeed active and in such case also sets its aria-current attribute to 'page':
 *
 * ```
 * <a routerLink="/" routerLinkActive="active" ariaCurrentWhenActive="page">Home Page</a>
 * ```
 *
 * @ngModule RouterModule
 *
 * @publicApi
 */
export class RouterLinkActive {
    get isActive() {
        return this._isActive;
    }
    constructor(router, element, renderer, cdr, link) {
        this.router = router;
        this.element = element;
        this.renderer = renderer;
        this.cdr = cdr;
        this.link = link;
        this.classes = [];
        this._isActive = false;
        /**
         * Options to configure how to determine if the router link is active.
         *
         * These options are passed to the `Router.isActive()` function.
         *
         * @see Router.isActive
         */
        this.routerLinkActiveOptions = { exact: false };
        /**
         *
         * You can use the output `isActiveChange` to get notified each time the link becomes
         * active or inactive.
         *
         * Emits:
         * true  -> Route is active
         * false -> Route is inactive
         *
         * ```
         * <a
         *  routerLink="/user/bob"
         *  routerLinkActive="active-link"
         *  (isActiveChange)="this.onRouterLinkActive($event)">Bob</a>
         * ```
         */
        this.isActiveChange = new EventEmitter();
        this.routerEventsSubscription = router.events.subscribe((s) => {
            if (s instanceof NavigationEnd) {
                this.update();
            }
        });
    }
    /** @nodoc */
    ngAfterContentInit() {
        // `of(null)` is used to force subscribe body to execute once immediately (like `startWith`).
        of(this.links.changes, of(null)).pipe(mergeAll()).subscribe(_ => {
            this.update();
            this.subscribeToEachLinkOnChanges();
        });
    }
    subscribeToEachLinkOnChanges() {
        this.linkInputChangesSubscription?.unsubscribe();
        const allLinkChanges = [...this.links.toArray(), this.link]
            .filter((link) => !!link)
            .map(link => link.onChanges);
        this.linkInputChangesSubscription = from(allLinkChanges).pipe(mergeAll()).subscribe(link => {
            if (this._isActive !== this.isLinkActive(this.router)(link)) {
                this.update();
            }
        });
    }
    set routerLinkActive(data) {
        const classes = Array.isArray(data) ? data : data.split(' ');
        this.classes = classes.filter(c => !!c);
    }
    /** @nodoc */
    ngOnChanges(changes) {
        this.update();
    }
    /** @nodoc */
    ngOnDestroy() {
        this.routerEventsSubscription.unsubscribe();
        this.linkInputChangesSubscription?.unsubscribe();
    }
    update() {
        if (!this.links || !this.router.navigated)
            return;
        Promise.resolve().then(() => {
            const hasActiveLinks = this.hasActiveLinks();
            if (this._isActive !== hasActiveLinks) {
                this._isActive = hasActiveLinks;
                this.cdr.markForCheck();
                this.classes.forEach((c) => {
                    if (hasActiveLinks) {
                        this.renderer.addClass(this.element.nativeElement, c);
                    }
                    else {
                        this.renderer.removeClass(this.element.nativeElement, c);
                    }
                });
                if (hasActiveLinks && this.ariaCurrentWhenActive !== undefined) {
                    this.renderer.setAttribute(this.element.nativeElement, 'aria-current', this.ariaCurrentWhenActive.toString());
                }
                else {
                    this.renderer.removeAttribute(this.element.nativeElement, 'aria-current');
                }
                // Emit on isActiveChange after classes are updated
                this.isActiveChange.emit(hasActiveLinks);
            }
        });
    }
    isLinkActive(router) {
        const options = isActiveMatchOptions(this.routerLinkActiveOptions) ?
            this.routerLinkActiveOptions :
            // While the types should disallow `undefined` here, it's possible without strict inputs
            (this.routerLinkActiveOptions.exact || false);
        return (link) => link.urlTree ? router.isActive(link.urlTree, options) : false;
    }
    hasActiveLinks() {
        const isActiveCheckFn = this.isLinkActive(this.router);
        return this.link && isActiveCheckFn(this.link) || this.links.some(isActiveCheckFn);
    }
}
RouterLinkActive.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0", ngImport: i0, type: RouterLinkActive, deps: [{ token: i1.Router }, { token: i0.ElementRef }, { token: i0.Renderer2 }, { token: i0.ChangeDetectorRef }, { token: i2.RouterLink, optional: true }], target: i0.ɵɵFactoryTarget.Directive });
RouterLinkActive.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "15.2.0", type: RouterLinkActive, isStandalone: true, selector: "[routerLinkActive]", inputs: { routerLinkActiveOptions: "routerLinkActiveOptions", ariaCurrentWhenActive: "ariaCurrentWhenActive", routerLinkActive: "routerLinkActive" }, outputs: { isActiveChange: "isActiveChange" }, queries: [{ propertyName: "links", predicate: RouterLink, descendants: true }], exportAs: ["routerLinkActive"], usesOnChanges: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0", ngImport: i0, type: RouterLinkActive, decorators: [{
            type: Directive,
            args: [{
                    selector: '[routerLinkActive]',
                    exportAs: 'routerLinkActive',
                    standalone: true,
                }]
        }], ctorParameters: function () { return [{ type: i1.Router }, { type: i0.ElementRef }, { type: i0.Renderer2 }, { type: i0.ChangeDetectorRef }, { type: i2.RouterLink, decorators: [{
                    type: Optional
                }] }]; }, propDecorators: { links: [{
                type: ContentChildren,
                args: [RouterLink, { descendants: true }]
            }], routerLinkActiveOptions: [{
                type: Input
            }], ariaCurrentWhenActive: [{
                type: Input
            }], isActiveChange: [{
                type: Output
            }], routerLinkActive: [{
                type: Input
            }] } });
/**
 * Use instead of `'paths' in options` to be compatible with property renaming
 */
function isActiveMatchOptions(options) {
    return !!options.paths;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyX2xpbmtfYWN0aXZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvcm91dGVyL3NyYy9kaXJlY3RpdmVzL3JvdXRlcl9saW5rX2FjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQW1CLGlCQUFpQixFQUFFLGVBQWUsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQXdCLFFBQVEsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBZ0IsTUFBTSxlQUFlLENBQUM7QUFDNU0sT0FBTyxFQUFDLElBQUksRUFBRSxFQUFFLEVBQWUsTUFBTSxNQUFNLENBQUM7QUFDNUMsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBRXhDLE9BQU8sRUFBUSxhQUFhLEVBQUMsTUFBTSxXQUFXLENBQUM7QUFDL0MsT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUdqQyxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDOzs7O0FBR3pDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQW9FRztBQU1ILE1BQU0sT0FBTyxnQkFBZ0I7SUFRM0IsSUFBSSxRQUFRO1FBQ1YsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQ3hCLENBQUM7SUF1Q0QsWUFDWSxNQUFjLEVBQVUsT0FBbUIsRUFBVSxRQUFtQixFQUMvRCxHQUFzQixFQUFzQixJQUFpQjtRQUR0RSxXQUFNLEdBQU4sTUFBTSxDQUFRO1FBQVUsWUFBTyxHQUFQLE9BQU8sQ0FBWTtRQUFVLGFBQVEsR0FBUixRQUFRLENBQVc7UUFDL0QsUUFBRyxHQUFILEdBQUcsQ0FBbUI7UUFBc0IsU0FBSSxHQUFKLElBQUksQ0FBYTtRQWhEMUUsWUFB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S0FBSyxJQUFJLEtBQUssQ0FBQyxDQUFDO1FBQ2xELE9BQU8sQ0FBQyxJQUFnQixFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztJQUM3RixDQUFDO0lBRU8sY0FBYztRQUNwQixNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN2RCxPQUFPLElBQUksQ0FBQyxJQUFJLElBQUksZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUNyRixDQUFDOzt3SEF2SVUsZ0JBQWdCOzRHQUFoQixnQkFBZ0IseVNBQ1YsVUFBVTtzR0FEaEIsZ0JBQWdCO2tCQUw1QixTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSxvQkFBb0I7b0JBQzlCLFFBQVEsRUFBRSxrQkFBa0I7b0JBQzVCLFVBQVUsRUFBRSxJQUFJO2lCQUNqQjs7MEJBb0QrQyxRQUFROzRDQWxESixLQUFLO3NCQUF0RCxlQUFlO3VCQUFDLFVBQVUsRUFBRSxFQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUM7Z0JBa0J2Qyx1QkFBdUI7c0JBQS9CLEtBQUs7Z0JBVUcscUJBQXFCO3NCQUE3QixLQUFLO2dCQWtCYSxjQUFjO3NCQUFoQyxNQUFNO2dCQWtDSCxnQkFBZ0I7c0JBRG5CLEtBQUs7O0FBMERSOztHQUVHO0FBQ0gsU0FBUyxvQkFBb0IsQ0FBQyxPQUNvQjtJQUNoRCxPQUFPLENBQUMsQ0FBRSxPQUFnQyxDQUFDLEtBQUssQ0FBQztBQUNuRCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QWZ0ZXJDb250ZW50SW5pdCwgQ2hhbmdlRGV0ZWN0b3JSZWYsIENvbnRlbnRDaGlsZHJlbiwgRGlyZWN0aXZlLCBFbGVtZW50UmVmLCBFdmVudEVtaXR0ZXIsIElucHV0LCBPbkNoYW5nZXMsIE9uRGVzdHJveSwgT3B0aW9uYWwsIE91dHB1dCwgUXVlcnlMaXN0LCBSZW5kZXJlcjIsIFNpbXBsZUNoYW5nZXN9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtmcm9tLCBvZiwgU3Vic2NyaXB0aW9ufSBmcm9tICdyeGpzJztcbmltcG9ydCB7bWVyZ2VBbGx9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHtFdmVudCwgTmF2aWdhdGlvbkVuZH0gZnJvbSAnLi4vZXZlbnRzJztcbmltcG9ydCB7Um91dGVyfSBmcm9tICcuLi9yb3V0ZXInO1xuaW1wb3J0IHtJc0FjdGl2ZU1hdGNoT3B0aW9uc30gZnJvbSAnLi4vdXJsX3RyZWUnO1xuXG5pbXBvcnQge1JvdXRlckxpbmt9IGZyb20gJy4vcm91dGVyX2xpbmsnO1xuXG5cbi8qKlxuICpcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIFRyYWNrcyB3aGV0aGVyIHRoZSBsaW5rZWQgcm91dGUgb2YgYW4gZWxlbWVudCBpcyBjdXJyZW50bHkgYWN0aXZlLCBhbmQgYWxsb3dzIHlvdVxuICogdG8gc3BlY2lmeSBvbmUgb3IgbW9yZSBDU1MgY2xhc3NlcyB0byBhZGQgdG8gdGhlIGVsZW1lbnQgd2hlbiB0aGUgbGlua2VkIHJvdXRlXG4gKiBpcyBhY3RpdmUuXG4gKlxuICogVXNlIHRoaXMgZGlyZWN0aXZlIHRvIGNyZWF0ZSBhIHZpc3VhbCBkaXN0aW5jdGlvbiBmb3IgZWxlbWVudHMgYXNzb2NpYXRlZCB3aXRoIGFuIGFjdGl2ZSByb3V0ZS5cbiAqIEZvciBleGFtcGxlLCB0aGUgZm9sbG93aW5nIGNvZGUgaGlnaGxpZ2h0cyB0aGUgd29yZCBcIkJvYlwiIHdoZW4gdGhlIHJvdXRlclxuICogYWN0aXZhdGVzIHRoZSBhc3NvY2lhdGVkIHJvdXRlOlxuICpcbiAqIGBgYFxuICogPGEgcm91dGVyTGluaz1cIi91c2VyL2JvYlwiIHJvdXRlckxpbmtBY3RpdmU9XCJhY3RpdmUtbGlua1wiPkJvYjwvYT5cbiAqIGBgYFxuICpcbiAqIFdoZW5ldmVyIHRoZSBVUkwgaXMgZWl0aGVyICcvdXNlcicgb3IgJy91c2VyL2JvYicsIHRoZSBcImFjdGl2ZS1saW5rXCIgY2xhc3MgaXNcbiAqIGFkZGVkIHRvIHRoZSBhbmNob3IgdGFnLiBJZiB0aGUgVVJMIGNoYW5nZXMsIHRoZSBjbGFzcyBpcyByZW1vdmVkLlxuICpcbiAqIFlvdSBjYW4gc2V0IG1vcmUgdGhhbiBvbmUgY2xhc3MgdXNpbmcgYSBzcGFjZS1zZXBhcmF0ZWQgc3RyaW5nIG9yIGFuIGFycmF5LlxuICogRm9yIGV4YW1wbGU6XG4gKlxuICogYGBgXG4gKiA8YSByb3V0ZXJMaW5rPVwiL3VzZXIvYm9iXCIgcm91dGVyTGlua0FjdGl2ZT1cImNsYXNzMSBjbGFzczJcIj5Cb2I8L2E+XG4gKiA8YSByb3V0ZXJMaW5rPVwiL3VzZXIvYm9iXCIgW3JvdXRlckxpbmtBY3RpdmVdPVwiWydjbGFzczEnLCAnY2xhc3MyJ11cIj5Cb2I8L2E+XG4gKiBgYGBcbiAqXG4gKiBUbyBhZGQgdGhlIGNsYXNzZXMgb25seSB3aGVuIHRoZSBVUkwgbWF0Y2hlcyB0aGUgbGluayBleGFjdGx5LCBhZGQgdGhlIG9wdGlvbiBgZXhhY3Q6IHRydWVgOlxuICpcbiAqIGBgYFxuICogPGEgcm91dGVyTGluaz1cIi91c2VyL2JvYlwiIHJvdXRlckxpbmtBY3RpdmU9XCJhY3RpdmUtbGlua1wiIFtyb3V0ZXJMaW5rQWN0aXZlT3B0aW9uc109XCJ7ZXhhY3Q6XG4gKiB0cnVlfVwiPkJvYjwvYT5cbiAqIGBgYFxuICpcbiAqIFRvIGRpcmVjdGx5IGNoZWNrIHRoZSBgaXNBY3RpdmVgIHN0YXR1cyBvZiB0aGUgbGluaywgYXNzaWduIHRoZSBgUm91dGVyTGlua0FjdGl2ZWBcbiAqIGluc3RhbmNlIHRvIGEgdGVtcGxhdGUgdmFyaWFibGUuXG4gKiBGb3IgZXhhbXBsZSwgdGhlIGZvbGxvd2luZyBjaGVja3MgdGhlIHN0YXR1cyB3aXRob3V0IGFzc2lnbmluZyBhbnkgQ1NTIGNsYXNzZXM6XG4gKlxuICogYGBgXG4gKiA8YSByb3V0ZXJMaW5rPVwiL3VzZXIvYm9iXCIgcm91dGVyTGlua0FjdGl2ZSAjcmxhPVwicm91dGVyTGlua0FjdGl2ZVwiPlxuICogICBCb2Ige3sgcmxhLmlzQWN0aXZlID8gJyhhbHJlYWR5IG9wZW4pJyA6ICcnfX1cbiAqIDwvYT5cbiAqIGBgYFxuICpcbiAqIFlvdSBjYW4gYXBwbHkgdGhlIGBSb3V0ZXJMaW5rQWN0aXZlYCBkaXJlY3RpdmUgdG8gYW4gYW5jZXN0b3Igb2YgbGlua2VkIGVsZW1lbnRzLlxuICogRm9yIGV4YW1wbGUsIHRoZSBmb2xsb3dpbmcgc2V0cyB0aGUgYWN0aXZlLWxpbmsgY2xhc3Mgb24gdGhlIGA8ZGl2PmAgIHBhcmVudCB0YWdcbiAqIHdoZW4gdGhlIFVSTCBpcyBlaXRoZXIgJy91c2VyL2ppbScgb3IgJy91c2VyL2JvYicuXG4gKlxuICogYGBgXG4gKiA8ZGl2IHJvdXRlckxpbmtBY3RpdmU9XCJhY3RpdmUtbGlua1wiIFtyb3V0ZXJMaW5rQWN0aXZlT3B0aW9uc109XCJ7ZXhhY3Q6IHRydWV9XCI+XG4gKiAgIDxhIHJvdXRlckxpbms9XCIvdXNlci9qaW1cIj5KaW08L2E+XG4gKiAgIDxhIHJvdXRlckxpbms9XCIvdXNlci9ib2JcIj5Cb2I8L2E+XG4gKiA8L2Rpdj5cbiAqIGBgYFxuICpcbiAqIFRoZSBgUm91dGVyTGlua0FjdGl2ZWAgZGlyZWN0aXZlIGNhbiBhbHNvIGJlIHVzZWQgdG8gc2V0IHRoZSBhcmlhLWN1cnJlbnQgYXR0cmlidXRlXG4gKiB0byBwcm92aWRlIGFuIGFsdGVybmF0aXZlIGRpc3RpbmN0aW9uIGZvciBhY3RpdmUgZWxlbWVudHMgdG8gdmlzdWFsbHkgaW1wYWlyZWQgdXNlcnMuXG4gKlxuICogRm9yIGV4YW1wbGUsIHRoZSBmb2xsb3dpbmcgY29kZSBhZGRzIHRoZSAnYWN0aXZlJyBjbGFzcyB0byB0aGUgSG9tZSBQYWdlIGxpbmsgd2hlbiBpdCBpc1xuICogaW5kZWVkIGFjdGl2ZSBhbmQgaW4gc3VjaCBjYXNlIGFsc28gc2V0cyBpdHMgYXJpYS1jdXJyZW50IGF0dHJpYnV0ZSB0byAncGFnZSc6XG4gKlxuICogYGBgXG4gKiA8YSByb3V0ZXJMaW5rPVwiL1wiIHJvdXRlckxpbmtBY3RpdmU9XCJhY3RpdmVcIiBhcmlhQ3VycmVudFdoZW5BY3RpdmU9XCJwYWdlXCI+SG9tZSBQYWdlPC9hPlxuICogYGBgXG4gKlxuICogQG5nTW9kdWxlIFJvdXRlck1vZHVsZVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW3JvdXRlckxpbmtBY3RpdmVdJyxcbiAgZXhwb3J0QXM6ICdyb3V0ZXJMaW5rQWN0aXZlJyxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbn0pXG5leHBvcnQgY2xhc3MgUm91dGVyTGlua0FjdGl2ZSBpbXBsZW1lbnRzIE9uQ2hhbmdlcywgT25EZXN0cm95LCBBZnRlckNvbnRlbnRJbml0IHtcbiAgQENvbnRlbnRDaGlsZHJlbihSb3V0ZXJMaW5rLCB7ZGVzY2VuZGFudHM6IHRydWV9KSBsaW5rcyE6IFF1ZXJ5TGlzdDxSb3V0ZXJMaW5rPjtcblxuICBwcml2YXRlIGNsYXNzZXM6IHN0cmluZ1tdID0gW107XG4gIHByaXZhdGUgcm91dGVyRXZlbnRzU3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb247XG4gIHByaXZhdGUgbGlua0lucHV0Q2hhbmdlc1N1YnNjcmlwdGlvbj86IFN1YnNjcmlwdGlvbjtcbiAgcHJpdmF0ZSBfaXNBY3RpdmUgPSBmYWxzZTtcblxuICBnZXQgaXNBY3RpdmUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2lzQWN0aXZlO1xuICB9XG5cbiAgLyoqXG4gICAqIE9wdGlvbnMgdG8gY29uZmlndXJlIGhvdyB0byBkZXRlcm1pbmUgaWYgdGhlIHJvdXRlciBsaW5rIGlzIGFjdGl2ZS5cbiAgICpcbiAgICogVGhlc2Ugb3B0aW9ucyBhcmUgcGFzc2VkIHRvIHRoZSBgUm91dGVyLmlzQWN0aXZlKClgIGZ1bmN0aW9uLlxuICAgKlxuICAgKiBAc2VlIFJvdXRlci5pc0FjdGl2ZVxuICAgKi9cbiAgQElucHV0KCkgcm91dGVyTGlua0FjdGl2ZU9wdGlvbnM6IHtleGFjdDogYm9vbGVhbn18SXNBY3RpdmVNYXRjaE9wdGlvbnMgPSB7ZXhhY3Q6IGZhbHNlfTtcblxuXG4gIC8qKlxuICAgKiBBcmlhLWN1cnJlbnQgYXR0cmlidXRlIHRvIGFwcGx5IHdoZW4gdGhlIHJvdXRlciBsaW5rIGlzIGFjdGl2ZS5cbiAgICpcbiAgICogUG9zc2libGUgdmFsdWVzOiBgJ3BhZ2UnYCB8IGAnc3RlcCdgIHwgYCdsb2NhdGlvbidgIHwgYCdkYXRlJ2AgfCBgJ3RpbWUnYCB8IGB0cnVlYCB8IGBmYWxzZWAuXG4gICAqXG4gICAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FjY2Vzc2liaWxpdHkvQVJJQS9BdHRyaWJ1dGVzL2FyaWEtY3VycmVudH1cbiAgICovXG4gIEBJbnB1dCgpIGFyaWFDdXJyZW50V2hlbkFjdGl2ZT86ICdwYWdlJ3wnc3RlcCd8J2xvY2F0aW9uJ3wnZGF0ZSd8J3RpbWUnfHRydWV8ZmFsc2U7XG5cbiAgLyoqXG4gICAqXG4gICAqIFlvdSBjYW4gdXNlIHRoZSBvdXRwdXQgYGlzQWN0aXZlQ2hhbmdlYCB0byBnZXQgbm90aWZpZWQgZWFjaCB0aW1lIHRoZSBsaW5rIGJlY29tZXNcbiAgICogYWN0aXZlIG9yIGluYWN0aXZlLlxuICAgKlxuICAgKiBFbWl0czpcbiAgICogdHJ1ZSAgLT4gUm91dGUgaXMgYWN0aXZlXG4gICAqIGZhbHNlIC0+IFJvdXRlIGlzIGluYWN0aXZlXG4gICAqXG4gICAqIGBgYFxuICAgKiA8YVxuICAgKiAgcm91dGVyTGluaz1cIi91c2VyL2JvYlwiXG4gICAqICByb3V0ZXJMaW5rQWN0aXZlPVwiYWN0aXZlLWxpbmtcIlxuICAgKiAgKGlzQWN0aXZlQ2hhbmdlKT1cInRoaXMub25Sb3V0ZXJMaW5rQWN0aXZlKCRldmVudClcIj5Cb2I8L2E+XG4gICAqIGBgYFxuICAgKi9cbiAgQE91dHB1dCgpIHJlYWRvbmx5IGlzQWN0aXZlQ2hhbmdlOiBFdmVudEVtaXR0ZXI8Ym9vbGVhbj4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIHJvdXRlcjogUm91dGVyLCBwcml2YXRlIGVsZW1lbnQ6IEVsZW1lbnRSZWYsIHByaXZhdGUgcmVuZGVyZXI6IFJlbmRlcmVyMixcbiAgICAgIHByaXZhdGUgcmVhZG9ubHkgY2RyOiBDaGFuZ2VEZXRlY3RvclJlZiwgQE9wdGlvbmFsKCkgcHJpdmF0ZSBsaW5rPzogUm91dGVyTGluaykge1xuICAgIHRoaXMucm91dGVyRXZlbnRzU3Vic2NyaXB0aW9uID0gcm91dGVyLmV2ZW50cy5zdWJzY3JpYmUoKHM6IEV2ZW50KSA9PiB7XG4gICAgICBpZiAocyBpbnN0YW5jZW9mIE5hdmlnYXRpb25FbmQpIHtcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBAbm9kb2MgKi9cbiAgbmdBZnRlckNvbnRlbnRJbml0KCk6IHZvaWQge1xuICAgIC8vIGBvZihudWxsKWAgaXMgdXNlZCB0byBmb3JjZSBzdWJzY3JpYmUgYm9keSB0byBleGVjdXRlIG9uY2UgaW1tZWRpYXRlbHkgKGxpa2UgYHN0YXJ0V2l0aGApLlxuICAgIG9mKHRoaXMubGlua3MuY2hhbmdlcywgb2YobnVsbCkpLnBpcGUobWVyZ2VBbGwoKSkuc3Vic2NyaWJlKF8gPT4ge1xuICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICAgIHRoaXMuc3Vic2NyaWJlVG9FYWNoTGlua09uQ2hhbmdlcygpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBzdWJzY3JpYmVUb0VhY2hMaW5rT25DaGFuZ2VzKCkge1xuICAgIHRoaXMubGlua0lucHV0Q2hhbmdlc1N1YnNjcmlwdGlvbj8udW5zdWJzY3JpYmUoKTtcbiAgICBjb25zdCBhbGxMaW5rQ2hhbmdlcyA9IFsuLi50aGlzLmxpbmtzLnRvQXJyYXkoKSwgdGhpcy5saW5rXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5maWx0ZXIoKGxpbmspOiBsaW5rIGlzIFJvdXRlckxpbmsgPT4gISFsaW5rKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAobGluayA9PiBsaW5rLm9uQ2hhbmdlcyk7XG4gICAgdGhpcy5saW5rSW5wdXRDaGFuZ2VzU3Vic2NyaXB0aW9uID0gZnJvbShhbGxMaW5rQ2hhbmdlcykucGlwZShtZXJnZUFsbCgpKS5zdWJzY3JpYmUobGluayA9PiB7XG4gICAgICBpZiAodGhpcy5faXNBY3RpdmUgIT09IHRoaXMuaXNMaW5rQWN0aXZlKHRoaXMucm91dGVyKShsaW5rKSkge1xuICAgICAgICB0aGlzLnVwZGF0ZSgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgQElucHV0KClcbiAgc2V0IHJvdXRlckxpbmtBY3RpdmUoZGF0YTogc3RyaW5nW118c3RyaW5nKSB7XG4gICAgY29uc3QgY2xhc3NlcyA9IEFycmF5LmlzQXJyYXkoZGF0YSkgPyBkYXRhIDogZGF0YS5zcGxpdCgnICcpO1xuICAgIHRoaXMuY2xhc3NlcyA9IGNsYXNzZXMuZmlsdGVyKGMgPT4gISFjKTtcbiAgfVxuXG4gIC8qKiBAbm9kb2MgKi9cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcyk6IHZvaWQge1xuICAgIHRoaXMudXBkYXRlKCk7XG4gIH1cbiAgLyoqIEBub2RvYyAqL1xuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLnJvdXRlckV2ZW50c1N1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgIHRoaXMubGlua0lucHV0Q2hhbmdlc1N1YnNjcmlwdGlvbj8udW5zdWJzY3JpYmUoKTtcbiAgfVxuXG4gIHByaXZhdGUgdXBkYXRlKCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5saW5rcyB8fCAhdGhpcy5yb3V0ZXIubmF2aWdhdGVkKSByZXR1cm47XG4gICAgUHJvbWlzZS5yZXNvbHZlKCkudGhlbigoKSA9PiB7XG4gICAgICBjb25zdCBoYXNBY3RpdmVMaW5rcyA9IHRoaXMuaGFzQWN0aXZlTGlua3MoKTtcbiAgICAgIGlmICh0aGlzLl9pc0FjdGl2ZSAhPT0gaGFzQWN0aXZlTGlua3MpIHtcbiAgICAgICAgdGhpcy5faXNBY3RpdmUgPSBoYXNBY3RpdmVMaW5rcztcbiAgICAgICAgdGhpcy5jZHIubWFya0ZvckNoZWNrKCk7XG4gICAgICAgIHRoaXMuY2xhc3Nlcy5mb3JFYWNoKChjKSA9PiB7XG4gICAgICAgICAgaWYgKGhhc0FjdGl2ZUxpbmtzKSB7XG4gICAgICAgICAgICB0aGlzLnJlbmRlcmVyLmFkZENsYXNzKHRoaXMuZWxlbWVudC5uYXRpdmVFbGVtZW50LCBjKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5yZW5kZXJlci5yZW1vdmVDbGFzcyh0aGlzLmVsZW1lbnQubmF0aXZlRWxlbWVudCwgYyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKGhhc0FjdGl2ZUxpbmtzICYmIHRoaXMuYXJpYUN1cnJlbnRXaGVuQWN0aXZlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICB0aGlzLnJlbmRlcmVyLnNldEF0dHJpYnV0ZShcbiAgICAgICAgICAgICAgdGhpcy5lbGVtZW50Lm5hdGl2ZUVsZW1lbnQsICdhcmlhLWN1cnJlbnQnLCB0aGlzLmFyaWFDdXJyZW50V2hlbkFjdGl2ZS50b1N0cmluZygpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnJlbmRlcmVyLnJlbW92ZUF0dHJpYnV0ZSh0aGlzLmVsZW1lbnQubmF0aXZlRWxlbWVudCwgJ2FyaWEtY3VycmVudCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRW1pdCBvbiBpc0FjdGl2ZUNoYW5nZSBhZnRlciBjbGFzc2VzIGFyZSB1cGRhdGVkXG4gICAgICAgIHRoaXMuaXNBY3RpdmVDaGFuZ2UuZW1pdChoYXNBY3RpdmVMaW5rcyk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGlzTGlua0FjdGl2ZShyb3V0ZXI6IFJvdXRlcik6IChsaW5rOiBSb3V0ZXJMaW5rKSA9PiBib29sZWFuIHtcbiAgICBjb25zdCBvcHRpb25zOiBib29sZWFufElzQWN0aXZlTWF0Y2hPcHRpb25zID1cbiAgICAgICAgaXNBY3RpdmVNYXRjaE9wdGlvbnModGhpcy5yb3V0ZXJMaW5rQWN0aXZlT3B0aW9ucykgP1xuICAgICAgICB0aGlzLnJvdXRlckxpbmtBY3RpdmVPcHRpb25zIDpcbiAgICAgICAgLy8gV2hpbGUgdGhlIHR5cGVzIHNob3VsZCBkaXNhbGxvdyBgdW5kZWZpbmVkYCBoZXJlLCBpdCdzIHBvc3NpYmxlIHdpdGhvdXQgc3RyaWN0IGlucHV0c1xuICAgICAgICAodGhpcy5yb3V0ZXJMaW5rQWN0aXZlT3B0aW9ucy5leGFjdCB8fCBmYWxzZSk7XG4gICAgcmV0dXJuIChsaW5rOiBSb3V0ZXJMaW5rKSA9PiBsaW5rLnVybFRyZWUgPyByb3V0ZXIuaXNBY3RpdmUobGluay51cmxUcmVlLCBvcHRpb25zKSA6IGZhbHNlO1xuICB9XG5cbiAgcHJpdmF0ZSBoYXNBY3RpdmVMaW5rcygpOiBib29sZWFuIHtcbiAgICBjb25zdCBpc0FjdGl2ZUNoZWNrRm4gPSB0aGlzLmlzTGlua0FjdGl2ZSh0aGlzLnJvdXRlcik7XG4gICAgcmV0dXJuIHRoaXMubGluayAmJiBpc0FjdGl2ZUNoZWNrRm4odGhpcy5saW5rKSB8fCB0aGlzLmxpbmtzLnNvbWUoaXNBY3RpdmVDaGVja0ZuKTtcbiAgfVxufVxuXG4vKipcbiAqIFVzZSBpbnN0ZWFkIG9mIGAncGF0aHMnIGluIG9wdGlvbnNgIHRvIGJlIGNvbXBhdGlibGUgd2l0aCBwcm9wZXJ0eSByZW5hbWluZ1xuICovXG5mdW5jdGlvbiBpc0FjdGl2ZU1hdGNoT3B0aW9ucyhvcHRpb25zOiB7ZXhhY3Q6IGJvb2xlYW59fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgSXNBY3RpdmVNYXRjaE9wdGlvbnMpOiBvcHRpb25zIGlzIElzQWN0aXZlTWF0Y2hPcHRpb25zIHtcbiAgcmV0dXJuICEhKG9wdGlvbnMgYXMgSXNBY3RpdmVNYXRjaE9wdGlvbnMpLnBhdGhzO1xufVxuIl19