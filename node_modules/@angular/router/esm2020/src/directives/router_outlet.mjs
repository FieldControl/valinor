/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ChangeDetectorRef, Directive, EnvironmentInjector, EventEmitter, inject, Input, Output, ViewContainerRef, ɵRuntimeError as RuntimeError, } from '@angular/core';
import { ChildrenOutletContexts } from '../router_outlet_context';
import { ActivatedRoute } from '../router_state';
import { PRIMARY_OUTLET } from '../shared';
import * as i0 from "@angular/core";
const NG_DEV_MODE = typeof ngDevMode === 'undefined' || ngDevMode;
/**
 * @description
 *
 * Acts as a placeholder that Angular dynamically fills based on the current router state.
 *
 * Each outlet can have a unique name, determined by the optional `name` attribute.
 * The name cannot be set or changed dynamically. If not set, default value is "primary".
 *
 * ```
 * <router-outlet></router-outlet>
 * <router-outlet name='left'></router-outlet>
 * <router-outlet name='right'></router-outlet>
 * ```
 *
 * Named outlets can be the targets of secondary routes.
 * The `Route` object for a secondary route has an `outlet` property to identify the target outlet:
 *
 * `{path: <base-path>, component: <component>, outlet: <target_outlet_name>}`
 *
 * Using named outlets and secondary routes, you can target multiple outlets in
 * the same `RouterLink` directive.
 *
 * The router keeps track of separate branches in a navigation tree for each named outlet and
 * generates a representation of that tree in the URL.
 * The URL for a secondary route uses the following syntax to specify both the primary and secondary
 * routes at the same time:
 *
 * `http://base-path/primary-route-path(outlet-name:route-path)`
 *
 * A router outlet emits an activate event when a new component is instantiated,
 * deactivate event when a component is destroyed.
 * An attached event emits when the `RouteReuseStrategy` instructs the outlet to reattach the
 * subtree, and the detached event emits when the `RouteReuseStrategy` instructs the outlet to
 * detach the subtree.
 *
 * ```
 * <router-outlet
 *   (activate)='onActivate($event)'
 *   (deactivate)='onDeactivate($event)'
 *   (attach)='onAttach($event)'
 *   (detach)='onDetach($event)'></router-outlet>
 * ```
 *
 * @see [Routing tutorial](guide/router-tutorial-toh#named-outlets "Example of a named
 * outlet and secondary route configuration").
 * @see `RouterLink`
 * @see `Route`
 * @ngModule RouterModule
 *
 * @publicApi
 */
export class RouterOutlet {
    constructor() {
        this.activated = null;
        this._activatedRoute = null;
        /**
         * The name of the outlet
         *
         * @see [named outlets](guide/router-tutorial-toh#displaying-multiple-routes-in-named-outlets)
         */
        this.name = PRIMARY_OUTLET;
        this.activateEvents = new EventEmitter();
        this.deactivateEvents = new EventEmitter();
        /**
         * Emits an attached component instance when the `RouteReuseStrategy` instructs to re-attach a
         * previously detached subtree.
         **/
        this.attachEvents = new EventEmitter();
        /**
         * Emits a detached component instance when the `RouteReuseStrategy` instructs to detach the
         * subtree.
         */
        this.detachEvents = new EventEmitter();
        this.parentContexts = inject(ChildrenOutletContexts);
        this.location = inject(ViewContainerRef);
        this.changeDetector = inject(ChangeDetectorRef);
        this.environmentInjector = inject(EnvironmentInjector);
    }
    /** @nodoc */
    ngOnChanges(changes) {
        if (changes['name']) {
            const { firstChange, previousValue } = changes['name'];
            if (firstChange) {
                // The first change is handled by ngOnInit. Because ngOnChanges doesn't get called when no
                // input is set at all, we need to centrally handle the first change there.
                return;
            }
            // unregister with the old name
            if (this.isTrackedInParentContexts(previousValue)) {
                this.deactivate();
                this.parentContexts.onChildOutletDestroyed(previousValue);
            }
            // register the new name
            this.initializeOutletWithName();
        }
    }
    /** @nodoc */
    ngOnDestroy() {
        // Ensure that the registered outlet is this one before removing it on the context.
        if (this.isTrackedInParentContexts(this.name)) {
            this.parentContexts.onChildOutletDestroyed(this.name);
        }
    }
    isTrackedInParentContexts(outletName) {
        return this.parentContexts.getContext(outletName)?.outlet === this;
    }
    /** @nodoc */
    ngOnInit() {
        this.initializeOutletWithName();
    }
    initializeOutletWithName() {
        this.parentContexts.onChildOutletCreated(this.name, this);
        if (this.activated) {
            return;
        }
        // If the outlet was not instantiated at the time the route got activated we need to populate
        // the outlet when it is initialized (ie inside a NgIf)
        const context = this.parentContexts.getContext(this.name);
        if (context?.route) {
            if (context.attachRef) {
                // `attachRef` is populated when there is an existing component to mount
                this.attach(context.attachRef, context.route);
            }
            else {
                // otherwise the component defined in the configuration is created
                this.activateWith(context.route, context.injector);
            }
        }
    }
    get isActivated() {
        return !!this.activated;
    }
    /**
     * @returns The currently activated component instance.
     * @throws An error if the outlet is not activated.
     */
    get component() {
        if (!this.activated)
            throw new RuntimeError(4012 /* RuntimeErrorCode.OUTLET_NOT_ACTIVATED */, NG_DEV_MODE && 'Outlet is not activated');
        return this.activated.instance;
    }
    get activatedRoute() {
        if (!this.activated)
            throw new RuntimeError(4012 /* RuntimeErrorCode.OUTLET_NOT_ACTIVATED */, NG_DEV_MODE && 'Outlet is not activated');
        return this._activatedRoute;
    }
    get activatedRouteData() {
        if (this._activatedRoute) {
            return this._activatedRoute.snapshot.data;
        }
        return {};
    }
    /**
     * Called when the `RouteReuseStrategy` instructs to detach the subtree
     */
    detach() {
        if (!this.activated)
            throw new RuntimeError(4012 /* RuntimeErrorCode.OUTLET_NOT_ACTIVATED */, NG_DEV_MODE && 'Outlet is not activated');
        this.location.detach();
        const cmp = this.activated;
        this.activated = null;
        this._activatedRoute = null;
        this.detachEvents.emit(cmp.instance);
        return cmp;
    }
    /**
     * Called when the `RouteReuseStrategy` instructs to re-attach a previously detached subtree
     */
    attach(ref, activatedRoute) {
        this.activated = ref;
        this._activatedRoute = activatedRoute;
        this.location.insert(ref.hostView);
        this.attachEvents.emit(ref.instance);
    }
    deactivate() {
        if (this.activated) {
            const c = this.component;
            this.activated.destroy();
            this.activated = null;
            this._activatedRoute = null;
            this.deactivateEvents.emit(c);
        }
    }
    activateWith(activatedRoute, resolverOrInjector) {
        if (this.isActivated) {
            throw new RuntimeError(4013 /* RuntimeErrorCode.OUTLET_ALREADY_ACTIVATED */, NG_DEV_MODE && 'Cannot activate an already activated outlet');
        }
        this._activatedRoute = activatedRoute;
        const location = this.location;
        const snapshot = activatedRoute.snapshot;
        const component = snapshot.component;
        const childContexts = this.parentContexts.getOrCreateContext(this.name).children;
        const injector = new OutletInjector(activatedRoute, childContexts, location.injector);
        if (resolverOrInjector && isComponentFactoryResolver(resolverOrInjector)) {
            const factory = resolverOrInjector.resolveComponentFactory(component);
            this.activated = location.createComponent(factory, location.length, injector);
        }
        else {
            const environmentInjector = resolverOrInjector ?? this.environmentInjector;
            this.activated = location.createComponent(component, { index: location.length, injector, environmentInjector });
        }
        // Calling `markForCheck` to make sure we will run the change detection when the
        // `RouterOutlet` is inside a `ChangeDetectionStrategy.OnPush` component.
        this.changeDetector.markForCheck();
        this.activateEvents.emit(this.activated.instance);
    }
}
RouterOutlet.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.1", ngImport: i0, type: RouterOutlet, deps: [], target: i0.ɵɵFactoryTarget.Directive });
RouterOutlet.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "15.2.1", type: RouterOutlet, isStandalone: true, selector: "router-outlet", inputs: { name: "name" }, outputs: { activateEvents: "activate", deactivateEvents: "deactivate", attachEvents: "attach", detachEvents: "detach" }, exportAs: ["outlet"], usesOnChanges: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.1", ngImport: i0, type: RouterOutlet, decorators: [{
            type: Directive,
            args: [{
                    selector: 'router-outlet',
                    exportAs: 'outlet',
                    standalone: true,
                }]
        }], propDecorators: { name: [{
                type: Input
            }], activateEvents: [{
                type: Output,
                args: ['activate']
            }], deactivateEvents: [{
                type: Output,
                args: ['deactivate']
            }], attachEvents: [{
                type: Output,
                args: ['attach']
            }], detachEvents: [{
                type: Output,
                args: ['detach']
            }] } });
class OutletInjector {
    constructor(route, childContexts, parent) {
        this.route = route;
        this.childContexts = childContexts;
        this.parent = parent;
    }
    get(token, notFoundValue) {
        if (token === ActivatedRoute) {
            return this.route;
        }
        if (token === ChildrenOutletContexts) {
            return this.childContexts;
        }
        return this.parent.get(token, notFoundValue);
    }
}
function isComponentFactoryResolver(item) {
    return !!item.resolveComponentFactory;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyX291dGxldC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3JvdXRlci9zcmMvZGlyZWN0aXZlcy9yb3V0ZXJfb3V0bGV0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxpQkFBaUIsRUFBMEMsU0FBUyxFQUFFLG1CQUFtQixFQUFFLFlBQVksRUFBRSxNQUFNLEVBQVksS0FBSyxFQUFxQixNQUFNLEVBQWlCLGdCQUFnQixFQUFFLGFBQWEsSUFBSSxZQUFZLEdBQUUsTUFBTSxlQUFlLENBQUM7QUFJM1AsT0FBTyxFQUFDLHNCQUFzQixFQUFDLE1BQU0sMEJBQTBCLENBQUM7QUFDaEUsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQy9DLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxXQUFXLENBQUM7O0FBRXpDLE1BQU0sV0FBVyxHQUFHLE9BQU8sU0FBUyxLQUFLLFdBQVcsSUFBSSxTQUFTLENBQUM7QUE0RmxFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQWtERztBQU1ILE1BQU0sT0FBTyxZQUFZO0lBTHpCO1FBTVUsY0FBUyxHQUEyQixJQUFJLENBQUM7UUFDekMsb0JBQWUsR0FBd0IsSUFBSSxDQUFDO1FBQ3BEOzs7O1dBSUc7UUFDTSxTQUFJLEdBQUcsY0FBYyxDQUFDO1FBRVgsbUJBQWMsR0FBRyxJQUFJLFlBQVksRUFBTyxDQUFDO1FBQ3ZDLHFCQUFnQixHQUFHLElBQUksWUFBWSxFQUFPLENBQUM7UUFDakU7OztZQUdJO1FBQ2MsaUJBQVksR0FBRyxJQUFJLFlBQVksRUFBVyxDQUFDO1FBQzdEOzs7V0FHRztRQUNlLGlCQUFZLEdBQUcsSUFBSSxZQUFZLEVBQVcsQ0FBQztRQUVyRCxtQkFBYyxHQUFHLE1BQU0sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1FB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QUFDLHVCQUF1QixDQUFDO0FBQ3hDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtDaGFuZ2VEZXRlY3RvclJlZiwgQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyLCBDb21wb25lbnRSZWYsIERpcmVjdGl2ZSwgRW52aXJvbm1lbnRJbmplY3RvciwgRXZlbnRFbWl0dGVyLCBpbmplY3QsIEluamVjdG9yLCBJbnB1dCwgT25EZXN0cm95LCBPbkluaXQsIE91dHB1dCwgU2ltcGxlQ2hhbmdlcywgVmlld0NvbnRhaW5lclJlZiwgybVSdW50aW1lRXJyb3IgYXMgUnVudGltZUVycm9yLH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7UnVudGltZUVycm9yQ29kZX0gZnJvbSAnLi4vZXJyb3JzJztcbmltcG9ydCB7RGF0YX0gZnJvbSAnLi4vbW9kZWxzJztcbmltcG9ydCB7Q2hpbGRyZW5PdXRsZXRDb250ZXh0c30gZnJvbSAnLi4vcm91dGVyX291dGxldF9jb250ZXh0JztcbmltcG9ydCB7QWN0aXZhdGVkUm91dGV9IGZyb20gJy4uL3JvdXRlcl9zdGF0ZSc7XG5pbXBvcnQge1BSSU1BUllfT1VUTEVUfSBmcm9tICcuLi9zaGFyZWQnO1xuXG5jb25zdCBOR19ERVZfTU9ERSA9IHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZTtcblxuLyoqXG4gKiBBbiBpbnRlcmZhY2UgdGhhdCBkZWZpbmVzIHRoZSBjb250cmFjdCBmb3IgZGV2ZWxvcGluZyBhIGNvbXBvbmVudCBvdXRsZXQgZm9yIHRoZSBgUm91dGVyYC5cbiAqXG4gKiBBbiBvdXRsZXQgYWN0cyBhcyBhIHBsYWNlaG9sZGVyIHRoYXQgQW5ndWxhciBkeW5hbWljYWxseSBmaWxscyBiYXNlZCBvbiB0aGUgY3VycmVudCByb3V0ZXIgc3RhdGUuXG4gKlxuICogQSByb3V0ZXIgb3V0bGV0IHNob3VsZCByZWdpc3RlciBpdHNlbGYgd2l0aCB0aGUgYFJvdXRlcmAgdmlhXG4gKiBgQ2hpbGRyZW5PdXRsZXRDb250ZXh0cyNvbkNoaWxkT3V0bGV0Q3JlYXRlZGAgYW5kIHVucmVnaXN0ZXIgd2l0aFxuICogYENoaWxkcmVuT3V0bGV0Q29udGV4dHMjb25DaGlsZE91dGxldERlc3Ryb3llZGAuIFdoZW4gdGhlIGBSb3V0ZXJgIGlkZW50aWZpZXMgYSBtYXRjaGVkIGBSb3V0ZWAsXG4gKiBpdCBsb29rcyBmb3IgYSByZWdpc3RlcmVkIG91dGxldCBpbiB0aGUgYENoaWxkcmVuT3V0bGV0Q29udGV4dHNgIGFuZCBhY3RpdmF0ZXMgaXQuXG4gKlxuICogQHNlZSBgQ2hpbGRyZW5PdXRsZXRDb250ZXh0c2BcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBSb3V0ZXJPdXRsZXRDb250cmFjdCB7XG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBnaXZlbiBvdXRsZXQgaXMgYWN0aXZhdGVkLlxuICAgKlxuICAgKiBBbiBvdXRsZXQgaXMgY29uc2lkZXJlZCBcImFjdGl2YXRlZFwiIGlmIGl0IGhhcyBhbiBhY3RpdmUgY29tcG9uZW50LlxuICAgKi9cbiAgaXNBY3RpdmF0ZWQ6IGJvb2xlYW47XG5cbiAgLyoqIFRoZSBpbnN0YW5jZSBvZiB0aGUgYWN0aXZhdGVkIGNvbXBvbmVudCBvciBgbnVsbGAgaWYgdGhlIG91dGxldCBpcyBub3QgYWN0aXZhdGVkLiAqL1xuICBjb21wb25lbnQ6IE9iamVjdHxudWxsO1xuXG4gIC8qKlxuICAgKiBUaGUgYERhdGFgIG9mIHRoZSBgQWN0aXZhdGVkUm91dGVgIHNuYXBzaG90LlxuICAgKi9cbiAgYWN0aXZhdGVkUm91dGVEYXRhOiBEYXRhO1xuXG4gIC8qKlxuICAgKiBUaGUgYEFjdGl2YXRlZFJvdXRlYCBmb3IgdGhlIG91dGxldCBvciBgbnVsbGAgaWYgdGhlIG91dGxldCBpcyBub3QgYWN0aXZhdGVkLlxuICAgKi9cbiAgYWN0aXZhdGVkUm91dGU6IEFjdGl2YXRlZFJvdXRlfG51bGw7XG5cbiAgLyoqXG4gICAqIENhbGxlZCBieSB0aGUgYFJvdXRlcmAgd2hlbiB0aGUgb3V0bGV0IHNob3VsZCBhY3RpdmF0ZSAoY3JlYXRlIGEgY29tcG9uZW50KS5cbiAgICovXG4gIGFjdGl2YXRlV2l0aChhY3RpdmF0ZWRSb3V0ZTogQWN0aXZhdGVkUm91dGUsIGVudmlyb25tZW50SW5qZWN0b3I6IEVudmlyb25tZW50SW5qZWN0b3J8bnVsbCk6IHZvaWQ7XG4gIC8qKlxuICAgKiBDYWxsZWQgYnkgdGhlIGBSb3V0ZXJgIHdoZW4gdGhlIG91dGxldCBzaG91bGQgYWN0aXZhdGUgKGNyZWF0ZSBhIGNvbXBvbmVudCkuXG4gICAqXG4gICAqIEBkZXByZWNhdGVkIFBhc3NpbmcgYSByZXNvbHZlciB0byByZXRyaWV2ZSBhIGNvbXBvbmVudCBmYWN0b3J5IGlzIG5vdCByZXF1aXJlZCBhbmQgaXNcbiAgICogICAgIGRlcHJlY2F0ZWQgc2luY2UgdjE0LlxuICAgKi9cbiAgYWN0aXZhdGVXaXRoKGFjdGl2YXRlZFJvdXRlOiBBY3RpdmF0ZWRSb3V0ZSwgcmVzb2x2ZXI6IENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcnxudWxsKTogdm9pZDtcblxuICAvKipcbiAgICogQSByZXF1ZXN0IHRvIGRlc3Ryb3kgdGhlIGN1cnJlbnRseSBhY3RpdmF0ZWQgY29tcG9uZW50LlxuICAgKlxuICAgKiBXaGVuIGEgYFJvdXRlUmV1c2VTdHJhdGVneWAgaW5kaWNhdGVzIHRoYXQgYW4gYEFjdGl2YXRlZFJvdXRlYCBzaG91bGQgYmUgcmVtb3ZlZCBidXQgc3RvcmVkIGZvclxuICAgKiBsYXRlciByZS11c2UgcmF0aGVyIHRoYW4gZGVzdHJveWVkLCB0aGUgYFJvdXRlcmAgd2lsbCBjYWxsIGBkZXRhY2hgIGluc3RlYWQuXG4gICAqL1xuICBkZWFjdGl2YXRlKCk6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIHRoZSBgUm91dGVSZXVzZVN0cmF0ZWd5YCBpbnN0cnVjdHMgdG8gZGV0YWNoIHRoZSBzdWJ0cmVlLlxuICAgKlxuICAgKiBUaGlzIGlzIHNpbWlsYXIgdG8gYGRlYWN0aXZhdGVgLCBidXQgdGhlIGFjdGl2YXRlZCBjb21wb25lbnQgc2hvdWxkIF9ub3RfIGJlIGRlc3Ryb3llZC5cbiAgICogSW5zdGVhZCwgaXQgaXMgcmV0dXJuZWQgc28gdGhhdCBpdCBjYW4gYmUgcmVhdHRhY2hlZCBsYXRlciB2aWEgdGhlIGBhdHRhY2hgIG1ldGhvZC5cbiAgICovXG4gIGRldGFjaCgpOiBDb21wb25lbnRSZWY8dW5rbm93bj47XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIHRoZSBgUm91dGVSZXVzZVN0cmF0ZWd5YCBpbnN0cnVjdHMgdG8gcmUtYXR0YWNoIGEgcHJldmlvdXNseSBkZXRhY2hlZCBzdWJ0cmVlLlxuICAgKi9cbiAgYXR0YWNoKHJlZjogQ29tcG9uZW50UmVmPHVua25vd24+LCBhY3RpdmF0ZWRSb3V0ZTogQWN0aXZhdGVkUm91dGUpOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBFbWl0cyBhbiBhY3RpdmF0ZSBldmVudCB3aGVuIGEgbmV3IGNvbXBvbmVudCBpcyBpbnN0YW50aWF0ZWRcbiAgICoqL1xuICBhY3RpdmF0ZUV2ZW50cz86IEV2ZW50RW1pdHRlcjx1bmtub3duPjtcblxuICAvKipcbiAgICogRW1pdHMgYSBkZWFjdGl2YXRlIGV2ZW50IHdoZW4gYSBjb21wb25lbnQgaXMgZGVzdHJveWVkLlxuICAgKi9cbiAgZGVhY3RpdmF0ZUV2ZW50cz86IEV2ZW50RW1pdHRlcjx1bmtub3duPjtcblxuICAvKipcbiAgICogRW1pdHMgYW4gYXR0YWNoZWQgY29tcG9uZW50IGluc3RhbmNlIHdoZW4gdGhlIGBSb3V0ZVJldXNlU3RyYXRlZ3lgIGluc3RydWN0cyB0byByZS1hdHRhY2ggYVxuICAgKiBwcmV2aW91c2x5IGRldGFjaGVkIHN1YnRyZWUuXG4gICAqKi9cbiAgYXR0YWNoRXZlbnRzPzogRXZlbnRFbWl0dGVyPHVua25vd24+O1xuXG4gIC8qKlxuICAgKiBFbWl0cyBhIGRldGFjaGVkIGNvbXBvbmVudCBpbnN0YW5jZSB3aGVuIHRoZSBgUm91dGVSZXVzZVN0cmF0ZWd5YCBpbnN0cnVjdHMgdG8gZGV0YWNoIHRoZVxuICAgKiBzdWJ0cmVlLlxuICAgKi9cbiAgZGV0YWNoRXZlbnRzPzogRXZlbnRFbWl0dGVyPHVua25vd24+O1xufVxuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIEFjdHMgYXMgYSBwbGFjZWhvbGRlciB0aGF0IEFuZ3VsYXIgZHluYW1pY2FsbHkgZmlsbHMgYmFzZWQgb24gdGhlIGN1cnJlbnQgcm91dGVyIHN0YXRlLlxuICpcbiAqIEVhY2ggb3V0bGV0IGNhbiBoYXZlIGEgdW5pcXVlIG5hbWUsIGRldGVybWluZWQgYnkgdGhlIG9wdGlvbmFsIGBuYW1lYCBhdHRyaWJ1dGUuXG4gKiBUaGUgbmFtZSBjYW5ub3QgYmUgc2V0IG9yIGNoYW5nZWQgZHluYW1pY2FsbHkuIElmIG5vdCBzZXQsIGRlZmF1bHQgdmFsdWUgaXMgXCJwcmltYXJ5XCIuXG4gKlxuICogYGBgXG4gKiA8cm91dGVyLW91dGxldD48L3JvdXRlci1vdXRsZXQ+XG4gKiA8cm91dGVyLW91dGxldCBuYW1lPSdsZWZ0Jz48L3JvdXRlci1vdXRsZXQ+XG4gKiA8cm91dGVyLW91dGxldCBuYW1lPSdyaWdodCc+PC9yb3V0ZXItb3V0bGV0PlxuICogYGBgXG4gKlxuICogTmFtZWQgb3V0bGV0cyBjYW4gYmUgdGhlIHRhcmdldHMgb2Ygc2Vjb25kYXJ5IHJvdXRlcy5cbiAqIFRoZSBgUm91dGVgIG9iamVjdCBmb3IgYSBzZWNvbmRhcnkgcm91dGUgaGFzIGFuIGBvdXRsZXRgIHByb3BlcnR5IHRvIGlkZW50aWZ5IHRoZSB0YXJnZXQgb3V0bGV0OlxuICpcbiAqIGB7cGF0aDogPGJhc2UtcGF0aD4sIGNvbXBvbmVudDogPGNvbXBvbmVudD4sIG91dGxldDogPHRhcmdldF9vdXRsZXRfbmFtZT59YFxuICpcbiAqIFVzaW5nIG5hbWVkIG91dGxldHMgYW5kIHNlY29uZGFyeSByb3V0ZXMsIHlvdSBjYW4gdGFyZ2V0IG11bHRpcGxlIG91dGxldHMgaW5cbiAqIHRoZSBzYW1lIGBSb3V0ZXJMaW5rYCBkaXJlY3RpdmUuXG4gKlxuICogVGhlIHJvdXRlciBrZWVwcyB0cmFjayBvZiBzZXBhcmF0ZSBicmFuY2hlcyBpbiBhIG5hdmlnYXRpb24gdHJlZSBmb3IgZWFjaCBuYW1lZCBvdXRsZXQgYW5kXG4gKiBnZW5lcmF0ZXMgYSByZXByZXNlbnRhdGlvbiBvZiB0aGF0IHRyZWUgaW4gdGhlIFVSTC5cbiAqIFRoZSBVUkwgZm9yIGEgc2Vjb25kYXJ5IHJvdXRlIHVzZXMgdGhlIGZvbGxvd2luZyBzeW50YXggdG8gc3BlY2lmeSBib3RoIHRoZSBwcmltYXJ5IGFuZCBzZWNvbmRhcnlcbiAqIHJvdXRlcyBhdCB0aGUgc2FtZSB0aW1lOlxuICpcbiAqIGBodHRwOi8vYmFzZS1wYXRoL3ByaW1hcnktcm91dGUtcGF0aChvdXRsZXQtbmFtZTpyb3V0ZS1wYXRoKWBcbiAqXG4gKiBBIHJvdXRlciBvdXRsZXQgZW1pdHMgYW4gYWN0aXZhdGUgZXZlbnQgd2hlbiBhIG5ldyBjb21wb25lbnQgaXMgaW5zdGFudGlhdGVkLFxuICogZGVhY3RpdmF0ZSBldmVudCB3aGVuIGEgY29tcG9uZW50IGlzIGRlc3Ryb3llZC5cbiAqIEFuIGF0dGFjaGVkIGV2ZW50IGVtaXRzIHdoZW4gdGhlIGBSb3V0ZVJldXNlU3RyYXRlZ3lgIGluc3RydWN0cyB0aGUgb3V0bGV0IHRvIHJlYXR0YWNoIHRoZVxuICogc3VidHJlZSwgYW5kIHRoZSBkZXRhY2hlZCBldmVudCBlbWl0cyB3aGVuIHRoZSBgUm91dGVSZXVzZVN0cmF0ZWd5YCBpbnN0cnVjdHMgdGhlIG91dGxldCB0b1xuICogZGV0YWNoIHRoZSBzdWJ0cmVlLlxuICpcbiAqIGBgYFxuICogPHJvdXRlci1vdXRsZXRcbiAqICAgKGFjdGl2YXRlKT0nb25BY3RpdmF0ZSgkZXZlbnQpJ1xuICogICAoZGVhY3RpdmF0ZSk9J29uRGVhY3RpdmF0ZSgkZXZlbnQpJ1xuICogICAoYXR0YWNoKT0nb25BdHRhY2goJGV2ZW50KSdcbiAqICAgKGRldGFjaCk9J29uRGV0YWNoKCRldmVudCknPjwvcm91dGVyLW91dGxldD5cbiAqIGBgYFxuICpcbiAqIEBzZWUgW1JvdXRpbmcgdHV0b3JpYWxdKGd1aWRlL3JvdXRlci10dXRvcmlhbC10b2gjbmFtZWQtb3V0bGV0cyBcIkV4YW1wbGUgb2YgYSBuYW1lZFxuICogb3V0bGV0IGFuZCBzZWNvbmRhcnkgcm91dGUgY29uZmlndXJhdGlvblwiKS5cbiAqIEBzZWUgYFJvdXRlckxpbmtgXG4gKiBAc2VlIGBSb3V0ZWBcbiAqIEBuZ01vZHVsZSBSb3V0ZXJNb2R1bGVcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ3JvdXRlci1vdXRsZXQnLFxuICBleHBvcnRBczogJ291dGxldCcsXG4gIHN0YW5kYWxvbmU6IHRydWUsXG59KVxuZXhwb3J0IGNsYXNzIFJvdXRlck91dGxldCBpbXBsZW1lbnRzIE9uRGVzdHJveSwgT25Jbml0LCBSb3V0ZXJPdXRsZXRDb250cmFjdCB7XG4gIHByaXZhdGUgYWN0aXZhdGVkOiBDb21wb25lbnRSZWY8YW55PnxudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBfYWN0aXZhdGVkUm91dGU6IEFjdGl2YXRlZFJvdXRlfG51bGwgPSBudWxsO1xuICAvKipcbiAgICogVGhlIG5hbWUgb2YgdGhlIG91dGxldFxuICAgKlxuICAgKiBAc2VlIFtuYW1lZCBvdXRsZXRzXShndWlkZS9yb3V0ZXItdHV0b3JpYWwtdG9oI2Rpc3BsYXlpbmctbXVsdGlwbGUtcm91dGVzLWluLW5hbWVkLW91dGxldHMpXG4gICAqL1xuICBASW5wdXQoKSBuYW1lID0gUFJJTUFSWV9PVVRMRVQ7XG5cbiAgQE91dHB1dCgnYWN0aXZhdGUnKSBhY3RpdmF0ZUV2ZW50cyA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICBAT3V0cHV0KCdkZWFjdGl2YXRlJykgZGVhY3RpdmF0ZUV2ZW50cyA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAvKipcbiAgICogRW1pdHMgYW4gYXR0YWNoZWQgY29tcG9uZW50IGluc3RhbmNlIHdoZW4gdGhlIGBSb3V0ZVJldXNlU3RyYXRlZ3lgIGluc3RydWN0cyB0byByZS1hdHRhY2ggYVxuICAgKiBwcmV2aW91c2x5IGRldGFjaGVkIHN1YnRyZWUuXG4gICAqKi9cbiAgQE91dHB1dCgnYXR0YWNoJykgYXR0YWNoRXZlbnRzID0gbmV3IEV2ZW50RW1pdHRlcjx1bmtub3duPigpO1xuICAvKipcbiAgICogRW1pdHMgYSBkZXRhY2hlZCBjb21wb25lbnQgaW5zdGFuY2Ugd2hlbiB0aGUgYFJvdXRlUmV1c2VTdHJhdGVneWAgaW5zdHJ1Y3RzIHRvIGRldGFjaCB0aGVcbiAgICogc3VidHJlZS5cbiAgICovXG4gIEBPdXRwdXQoJ2RldGFjaCcpIGRldGFjaEV2ZW50cyA9IG5ldyBFdmVudEVtaXR0ZXI8dW5rbm93bj4oKTtcblxuICBwcml2YXRlIHBhcmVudENvbnRleHRzID0gaW5qZWN0KENoaWxkcmVuT3V0bGV0Q29udGV4dHMpO1xuICBwcml2YXRlIGxvY2F0aW9uID0gaW5qZWN0KFZpZXdDb250YWluZXJSZWYpO1xuICBwcml2YXRlIGNoYW5nZURldGVjdG9yID0gaW5qZWN0KENoYW5nZURldGVjdG9yUmVmKTtcbiAgcHJpdmF0ZSBlbnZpcm9ubWVudEluamVjdG9yID0gaW5qZWN0KEVudmlyb25tZW50SW5qZWN0b3IpO1xuXG4gIC8qKiBAbm9kb2MgKi9cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykge1xuICAgIGlmIChjaGFuZ2VzWyduYW1lJ10pIHtcbiAgICAgIGNvbnN0IHtmaXJzdENoYW5nZSwgcHJldmlvdXNWYWx1ZX0gPSBjaGFuZ2VzWyduYW1lJ107XG4gICAgICBpZiAoZmlyc3RDaGFuZ2UpIHtcbiAgICAgICAgLy8gVGhlIGZpcnN0IGNoYW5nZSBpcyBoYW5kbGVkIGJ5IG5nT25Jbml0LiBCZWNhdXNlIG5nT25DaGFuZ2VzIGRvZXNuJ3QgZ2V0IGNhbGxlZCB3aGVuIG5vXG4gICAgICAgIC8vIGlucHV0IGlzIHNldCBhdCBhbGwsIHdlIG5lZWQgdG8gY2VudHJhbGx5IGhhbmRsZSB0aGUgZmlyc3QgY2hhbmdlIHRoZXJlLlxuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIHVucmVnaXN0ZXIgd2l0aCB0aGUgb2xkIG5hbWVcbiAgICAgIGlmICh0aGlzLmlzVHJhY2tlZEluUGFyZW50Q29udGV4dHMocHJldmlvdXNWYWx1ZSkpIHtcbiAgICAgICAgdGhpcy5kZWFjdGl2YXRlKCk7XG4gICAgICAgIHRoaXMucGFyZW50Q29udGV4dHMub25DaGlsZE91dGxldERlc3Ryb3llZChwcmV2aW91c1ZhbHVlKTtcbiAgICAgIH1cbiAgICAgIC8vIHJlZ2lzdGVyIHRoZSBuZXcgbmFtZVxuICAgICAgdGhpcy5pbml0aWFsaXplT3V0bGV0V2l0aE5hbWUoKTtcbiAgICB9XG4gIH1cblxuICAvKiogQG5vZG9jICovXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgIC8vIEVuc3VyZSB0aGF0IHRoZSByZWdpc3RlcmVkIG91dGxldCBpcyB0aGlzIG9uZSBiZWZvcmUgcmVtb3ZpbmcgaXQgb24gdGhlIGNvbnRleHQuXG4gICAgaWYgKHRoaXMuaXNUcmFja2VkSW5QYXJlbnRDb250ZXh0cyh0aGlzLm5hbWUpKSB7XG4gICAgICB0aGlzLnBhcmVudENvbnRleHRzLm9uQ2hpbGRPdXRsZXREZXN0cm95ZWQodGhpcy5uYW1lKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGlzVHJhY2tlZEluUGFyZW50Q29udGV4dHMob3V0bGV0TmFtZTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMucGFyZW50Q29udGV4dHMuZ2V0Q29udGV4dChvdXRsZXROYW1lKT8ub3V0bGV0ID09PSB0aGlzO1xuICB9XG5cbiAgLyoqIEBub2RvYyAqL1xuICBuZ09uSW5pdCgpOiB2b2lkIHtcbiAgICB0aGlzLmluaXRpYWxpemVPdXRsZXRXaXRoTmFtZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBpbml0aWFsaXplT3V0bGV0V2l0aE5hbWUoKSB7XG4gICAgdGhpcy5wYXJlbnRDb250ZXh0cy5vbkNoaWxkT3V0bGV0Q3JlYXRlZCh0aGlzLm5hbWUsIHRoaXMpO1xuICAgIGlmICh0aGlzLmFjdGl2YXRlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIElmIHRoZSBvdXRsZXQgd2FzIG5vdCBpbnN0YW50aWF0ZWQgYXQgdGhlIHRpbWUgdGhlIHJvdXRlIGdvdCBhY3RpdmF0ZWQgd2UgbmVlZCB0byBwb3B1bGF0ZVxuICAgIC8vIHRoZSBvdXRsZXQgd2hlbiBpdCBpcyBpbml0aWFsaXplZCAoaWUgaW5zaWRlIGEgTmdJZilcbiAgICBjb25zdCBjb250ZXh0ID0gdGhpcy5wYXJlbnRDb250ZXh0cy5nZXRDb250ZXh0KHRoaXMubmFtZSk7XG4gICAgaWYgKGNvbnRleHQ/LnJvdXRlKSB7XG4gICAgICBpZiAoY29udGV4dC5hdHRhY2hSZWYpIHtcbiAgICAgICAgLy8gYGF0dGFjaFJlZmAgaXMgcG9wdWxhdGVkIHdoZW4gdGhlcmUgaXMgYW4gZXhpc3RpbmcgY29tcG9uZW50IHRvIG1vdW50XG4gICAgICAgIHRoaXMuYXR0YWNoKGNvbnRleHQuYXR0YWNoUmVmLCBjb250ZXh0LnJvdXRlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIG90aGVyd2lzZSB0aGUgY29tcG9uZW50IGRlZmluZWQgaW4gdGhlIGNvbmZpZ3VyYXRpb24gaXMgY3JlYXRlZFxuICAgICAgICB0aGlzLmFjdGl2YXRlV2l0aChjb250ZXh0LnJvdXRlLCBjb250ZXh0LmluamVjdG9yKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBnZXQgaXNBY3RpdmF0ZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICEhdGhpcy5hY3RpdmF0ZWQ7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybnMgVGhlIGN1cnJlbnRseSBhY3RpdmF0ZWQgY29tcG9uZW50IGluc3RhbmNlLlxuICAgKiBAdGhyb3dzIEFuIGVycm9yIGlmIHRoZSBvdXRsZXQgaXMgbm90IGFjdGl2YXRlZC5cbiAgICovXG4gIGdldCBjb21wb25lbnQoKTogT2JqZWN0IHtcbiAgICBpZiAoIXRoaXMuYWN0aXZhdGVkKVxuICAgICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgICBSdW50aW1lRXJyb3JDb2RlLk9VVExFVF9OT1RfQUNUSVZBVEVELCBOR19ERVZfTU9ERSAmJiAnT3V0bGV0IGlzIG5vdCBhY3RpdmF0ZWQnKTtcbiAgICByZXR1cm4gdGhpcy5hY3RpdmF0ZWQuaW5zdGFuY2U7XG4gIH1cblxuICBnZXQgYWN0aXZhdGVkUm91dGUoKTogQWN0aXZhdGVkUm91dGUge1xuICAgIGlmICghdGhpcy5hY3RpdmF0ZWQpXG4gICAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuT1VUTEVUX05PVF9BQ1RJVkFURUQsIE5HX0RFVl9NT0RFICYmICdPdXRsZXQgaXMgbm90IGFjdGl2YXRlZCcpO1xuICAgIHJldHVybiB0aGlzLl9hY3RpdmF0ZWRSb3V0ZSBhcyBBY3RpdmF0ZWRSb3V0ZTtcbiAgfVxuXG4gIGdldCBhY3RpdmF0ZWRSb3V0ZURhdGEoKTogRGF0YSB7XG4gICAgaWYgKHRoaXMuX2FjdGl2YXRlZFJvdXRlKSB7XG4gICAgICByZXR1cm4gdGhpcy5fYWN0aXZhdGVkUm91dGUuc25hcHNob3QuZGF0YTtcbiAgICB9XG4gICAgcmV0dXJuIHt9O1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIHRoZSBgUm91dGVSZXVzZVN0cmF0ZWd5YCBpbnN0cnVjdHMgdG8gZGV0YWNoIHRoZSBzdWJ0cmVlXG4gICAqL1xuICBkZXRhY2goKTogQ29tcG9uZW50UmVmPGFueT4ge1xuICAgIGlmICghdGhpcy5hY3RpdmF0ZWQpXG4gICAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuT1VUTEVUX05PVF9BQ1RJVkFURUQsIE5HX0RFVl9NT0RFICYmICdPdXRsZXQgaXMgbm90IGFjdGl2YXRlZCcpO1xuICAgIHRoaXMubG9jYXRpb24uZGV0YWNoKCk7XG4gICAgY29uc3QgY21wID0gdGhpcy5hY3RpdmF0ZWQ7XG4gICAgdGhpcy5hY3RpdmF0ZWQgPSBudWxsO1xuICAgIHRoaXMuX2FjdGl2YXRlZFJvdXRlID0gbnVsbDtcbiAgICB0aGlzLmRldGFjaEV2ZW50cy5lbWl0KGNtcC5pbnN0YW5jZSk7XG4gICAgcmV0dXJuIGNtcDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiB0aGUgYFJvdXRlUmV1c2VTdHJhdGVneWAgaW5zdHJ1Y3RzIHRvIHJlLWF0dGFjaCBhIHByZXZpb3VzbHkgZGV0YWNoZWQgc3VidHJlZVxuICAgKi9cbiAgYXR0YWNoKHJlZjogQ29tcG9uZW50UmVmPGFueT4sIGFjdGl2YXRlZFJvdXRlOiBBY3RpdmF0ZWRSb3V0ZSkge1xuICAgIHRoaXMuYWN0aXZhdGVkID0gcmVmO1xuICAgIHRoaXMuX2FjdGl2YXRlZFJvdXRlID0gYWN0aXZhdGVkUm91dGU7XG4gICAgdGhpcy5sb2NhdGlvbi5pbnNlcnQocmVmLmhvc3RWaWV3KTtcbiAgICB0aGlzLmF0dGFjaEV2ZW50cy5lbWl0KHJlZi5pbnN0YW5jZSk7XG4gIH1cblxuICBkZWFjdGl2YXRlKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmFjdGl2YXRlZCkge1xuICAgICAgY29uc3QgYyA9IHRoaXMuY29tcG9uZW50O1xuICAgICAgdGhpcy5hY3RpdmF0ZWQuZGVzdHJveSgpO1xuICAgICAgdGhpcy5hY3RpdmF0ZWQgPSBudWxsO1xuICAgICAgdGhpcy5fYWN0aXZhdGVkUm91dGUgPSBudWxsO1xuICAgICAgdGhpcy5kZWFjdGl2YXRlRXZlbnRzLmVtaXQoYyk7XG4gICAgfVxuICB9XG5cbiAgYWN0aXZhdGVXaXRoKFxuICAgICAgYWN0aXZhdGVkUm91dGU6IEFjdGl2YXRlZFJvdXRlLFxuICAgICAgcmVzb2x2ZXJPckluamVjdG9yPzogQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyfEVudmlyb25tZW50SW5qZWN0b3J8bnVsbCkge1xuICAgIGlmICh0aGlzLmlzQWN0aXZhdGVkKSB7XG4gICAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuT1VUTEVUX0FMUkVBRFlfQUNUSVZBVEVELFxuICAgICAgICAgIE5HX0RFVl9NT0RFICYmICdDYW5ub3QgYWN0aXZhdGUgYW4gYWxyZWFkeSBhY3RpdmF0ZWQgb3V0bGV0Jyk7XG4gICAgfVxuICAgIHRoaXMuX2FjdGl2YXRlZFJvdXRlID0gYWN0aXZhdGVkUm91dGU7XG4gICAgY29uc3QgbG9jYXRpb24gPSB0aGlzLmxvY2F0aW9uO1xuICAgIGNvbnN0IHNuYXBzaG90ID0gYWN0aXZhdGVkUm91dGUuc25hcHNob3Q7XG4gICAgY29uc3QgY29tcG9uZW50ID0gc25hcHNob3QuY29tcG9uZW50ITtcbiAgICBjb25zdCBjaGlsZENvbnRleHRzID0gdGhpcy5wYXJlbnRDb250ZXh0cy5nZXRPckNyZWF0ZUNvbnRleHQodGhpcy5uYW1lKS5jaGlsZHJlbjtcbiAgICBjb25zdCBpbmplY3RvciA9IG5ldyBPdXRsZXRJbmplY3RvcihhY3RpdmF0ZWRSb3V0ZSwgY2hpbGRDb250ZXh0cywgbG9jYXRpb24uaW5qZWN0b3IpO1xuXG4gICAgaWYgKHJlc29sdmVyT3JJbmplY3RvciAmJiBpc0NvbXBvbmVudEZhY3RvcnlSZXNvbHZlcihyZXNvbHZlck9ySW5qZWN0b3IpKSB7XG4gICAgICBjb25zdCBmYWN0b3J5ID0gcmVzb2x2ZXJPckluamVjdG9yLnJlc29sdmVDb21wb25lbnRGYWN0b3J5KGNvbXBvbmVudCk7XG4gICAgICB0aGlzLmFjdGl2YXRlZCA9IGxvY2F0aW9uLmNyZWF0ZUNvbXBvbmVudChmYWN0b3J5LCBsb2NhdGlvbi5sZW5ndGgsIGluamVjdG9yKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgZW52aXJvbm1lbnRJbmplY3RvciA9IHJlc29sdmVyT3JJbmplY3RvciA/PyB0aGlzLmVudmlyb25tZW50SW5qZWN0b3I7XG4gICAgICB0aGlzLmFjdGl2YXRlZCA9IGxvY2F0aW9uLmNyZWF0ZUNvbXBvbmVudChcbiAgICAgICAgICBjb21wb25lbnQsIHtpbmRleDogbG9jYXRpb24ubGVuZ3RoLCBpbmplY3RvciwgZW52aXJvbm1lbnRJbmplY3Rvcn0pO1xuICAgIH1cbiAgICAvLyBDYWxsaW5nIGBtYXJrRm9yQ2hlY2tgIHRvIG1ha2Ugc3VyZSB3ZSB3aWxsIHJ1biB0aGUgY2hhbmdlIGRldGVjdGlvbiB3aGVuIHRoZVxuICAgIC8vIGBSb3V0ZXJPdXRsZXRgIGlzIGluc2lkZSBhIGBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2hgIGNvbXBvbmVudC5cbiAgICB0aGlzLmNoYW5nZURldGVjdG9yLm1hcmtGb3JDaGVjaygpO1xuICAgIHRoaXMuYWN0aXZhdGVFdmVudHMuZW1pdCh0aGlzLmFjdGl2YXRlZC5pbnN0YW5jZSk7XG4gIH1cbn1cblxuY2xhc3MgT3V0bGV0SW5qZWN0b3IgaW1wbGVtZW50cyBJbmplY3RvciB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSByb3V0ZTogQWN0aXZhdGVkUm91dGUsIHByaXZhdGUgY2hpbGRDb250ZXh0czogQ2hpbGRyZW5PdXRsZXRDb250ZXh0cyxcbiAgICAgIHByaXZhdGUgcGFyZW50OiBJbmplY3Rvcikge31cblxuICBnZXQodG9rZW46IGFueSwgbm90Rm91bmRWYWx1ZT86IGFueSk6IGFueSB7XG4gICAgaWYgKHRva2VuID09PSBBY3RpdmF0ZWRSb3V0ZSkge1xuICAgICAgcmV0dXJuIHRoaXMucm91dGU7XG4gICAgfVxuXG4gICAgaWYgKHRva2VuID09PSBDaGlsZHJlbk91dGxldENvbnRleHRzKSB7XG4gICAgICByZXR1cm4gdGhpcy5jaGlsZENvbnRleHRzO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnBhcmVudC5nZXQodG9rZW4sIG5vdEZvdW5kVmFsdWUpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyKGl0ZW06IGFueSk6IGl0ZW0gaXMgQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyIHtcbiAgcmV0dXJuICEhaXRlbS5yZXNvbHZlQ29tcG9uZW50RmFjdG9yeTtcbn1cbiJdfQ==