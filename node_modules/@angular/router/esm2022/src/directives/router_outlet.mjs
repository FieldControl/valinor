/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ChangeDetectorRef, Directive, EventEmitter, inject, Injectable, InjectionToken, Input, Output, reflectComponentType, ViewContainerRef, ɵRuntimeError as RuntimeError, } from '@angular/core';
import { combineLatest, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ChildrenOutletContexts } from '../router_outlet_context';
import { ActivatedRoute } from '../router_state';
import { PRIMARY_OUTLET } from '../shared';
import * as i0 from "@angular/core";
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
 * @see {@link RouterLink}
 * @see {@link Route}
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
        this.inputBinder = inject(INPUT_BINDER, { optional: true });
        /** @nodoc */
        this.supportsBindingToComponentInputs = true;
    }
    /** @internal */
    get activatedComponentRef() {
        return this.activated;
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
        this.inputBinder?.unsubscribeFromRouteData(this);
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
            throw new RuntimeError(4012 /* RuntimeErrorCode.OUTLET_NOT_ACTIVATED */, (typeof ngDevMode === 'undefined' || ngDevMode) && 'Outlet is not activated');
        return this.activated.instance;
    }
    get activatedRoute() {
        if (!this.activated)
            throw new RuntimeError(4012 /* RuntimeErrorCode.OUTLET_NOT_ACTIVATED */, (typeof ngDevMode === 'undefined' || ngDevMode) && 'Outlet is not activated');
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
            throw new RuntimeError(4012 /* RuntimeErrorCode.OUTLET_NOT_ACTIVATED */, (typeof ngDevMode === 'undefined' || ngDevMode) && 'Outlet is not activated');
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
        this.inputBinder?.bindActivatedRouteToOutletComponent(this);
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
    activateWith(activatedRoute, environmentInjector) {
        if (this.isActivated) {
            throw new RuntimeError(4013 /* RuntimeErrorCode.OUTLET_ALREADY_ACTIVATED */, (typeof ngDevMode === 'undefined' || ngDevMode) &&
                'Cannot activate an already activated outlet');
        }
        this._activatedRoute = activatedRoute;
        const location = this.location;
        const snapshot = activatedRoute.snapshot;
        const component = snapshot.component;
        const childContexts = this.parentContexts.getOrCreateContext(this.name).children;
        const injector = new OutletInjector(activatedRoute, childContexts, location.injector);
        this.activated = location.createComponent(component, {
            index: location.length,
            injector,
            environmentInjector: environmentInjector,
        });
        // Calling `markForCheck` to make sure we will run the change detection when the
        // `RouterOutlet` is inside a `ChangeDetectionStrategy.OnPush` component.
        this.changeDetector.markForCheck();
        this.inputBinder?.bindActivatedRouteToOutletComponent(this);
        this.activateEvents.emit(this.activated.instance);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: RouterOutlet, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.7", type: RouterOutlet, isStandalone: true, selector: "router-outlet", inputs: { name: "name" }, outputs: { activateEvents: "activate", deactivateEvents: "deactivate", attachEvents: "attach", detachEvents: "detach" }, exportAs: ["outlet"], usesOnChanges: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: RouterOutlet, decorators: [{
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
    /**
     * This injector has a special handing for the `ActivatedRoute` and
     * `ChildrenOutletContexts` tokens: it returns corresponding values for those
     * tokens dynamically. This behavior is different from the regular injector logic,
     * when we initialize and store a value, which is later returned for all inject
     * requests.
     *
     * In some cases (e.g. when using `@defer`), this dynamic behavior requires special
     * handling. This function allows to identify an instance of the `OutletInjector` and
     * create an instance of it without referring to the class itself (so this logic can
     * be invoked from the `core` package). This helps to retain dynamic behavior for the
     * mentioned tokens.
     *
     * Note: it's a temporary solution and we should explore how to support this case better.
     */
    __ngOutletInjector(parentInjector) {
        return new OutletInjector(this.route, this.childContexts, parentInjector);
    }
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
export const INPUT_BINDER = new InjectionToken('');
/**
 * Injectable used as a tree-shakable provider for opting in to binding router data to component
 * inputs.
 *
 * The RouterOutlet registers itself with this service when an `ActivatedRoute` is attached or
 * activated. When this happens, the service subscribes to the `ActivatedRoute` observables (params,
 * queryParams, data) and sets the inputs of the component using `ComponentRef.setInput`.
 * Importantly, when an input does not have an item in the route data with a matching key, this
 * input is set to `undefined`. If it were not done this way, the previous information would be
 * retained if the data got removed from the route (i.e. if a query parameter is removed).
 *
 * The `RouterOutlet` should unregister itself when destroyed via `unsubscribeFromRouteData` so that
 * the subscriptions are cleaned up.
 */
export class RoutedComponentInputBinder {
    constructor() {
        this.outletDataSubscriptions = new Map();
    }
    bindActivatedRouteToOutletComponent(outlet) {
        this.unsubscribeFromRouteData(outlet);
        this.subscribeToRouteData(outlet);
    }
    unsubscribeFromRouteData(outlet) {
        this.outletDataSubscriptions.get(outlet)?.unsubscribe();
        this.outletDataSubscriptions.delete(outlet);
    }
    subscribeToRouteData(outlet) {
        const { activatedRoute } = outlet;
        const dataSubscription = combineLatest([
            activatedRoute.queryParams,
            activatedRoute.params,
            activatedRoute.data,
        ])
            .pipe(switchMap(([queryParams, params, data], index) => {
            data = { ...queryParams, ...params, ...data };
            // Get the first result from the data subscription synchronously so it's available to
            // the component as soon as possible (and doesn't require a second change detection).
            if (index === 0) {
                return of(data);
            }
            // Promise.resolve is used to avoid synchronously writing the wrong data when
            // two of the Observables in the `combineLatest` stream emit one after
            // another.
            return Promise.resolve(data);
        }))
            .subscribe((data) => {
            // Outlet may have been deactivated or changed names to be associated with a different
            // route
            if (!outlet.isActivated ||
                !outlet.activatedComponentRef ||
                outlet.activatedRoute !== activatedRoute ||
                activatedRoute.component === null) {
                this.unsubscribeFromRouteData(outlet);
                return;
            }
            const mirror = reflectComponentType(activatedRoute.component);
            if (!mirror) {
                this.unsubscribeFromRouteData(outlet);
                return;
            }
            for (const { templateName } of mirror.inputs) {
                outlet.activatedComponentRef.setInput(templateName, data[templateName]);
            }
        });
        this.outletDataSubscriptions.set(outlet, dataSubscription);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: RoutedComponentInputBinder, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: RoutedComponentInputBinder }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: RoutedComponentInputBinder, decorators: [{
            type: Injectable
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyX291dGxldC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3JvdXRlci9zcmMvZGlyZWN0aXZlcy9yb3V0ZXJfb3V0bGV0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFDTCxpQkFBaUIsRUFFakIsU0FBUyxFQUVULFlBQVksRUFDWixNQUFNLEVBQ04sVUFBVSxFQUNWLGNBQWMsRUFFZCxLQUFLLEVBR0wsTUFBTSxFQUNOLG9CQUFvQixFQUVwQixnQkFBZ0IsRUFDaEIsYUFBYSxJQUFJLFlBQVksR0FDOUIsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLGFBQWEsRUFBRSxFQUFFLEVBQWUsTUFBTSxNQUFNLENBQUM7QUFDckQsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBSXpDLE9BQU8sRUFBQyxzQkFBc0IsRUFBQyxNQUFNLDBCQUEwQixDQUFDO0FBQ2hFLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUMvQyxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sV0FBVyxDQUFDOztBQStGekM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQWdERztBQU1ILE1BQU0sT0FBTyxZQUFZO0lBTHpCO1FBTVUsY0FBUyxHQUE2QixJQUFJLENBQUM7UUFLM0Msb0JBQWUsR0FBMEIsSUFBSSxDQUFDO1FBQ3REOzs7V0FHRztRQUNNLFNBQUksR0FBRyxjQUFjLENBQUM7UUFFWCxtQkFBYyxHQUFHLElBQUksWUFBWSxFQUFPLENBQUM7UUFDdkMscUJBQWdCLEdBQUcsSUFBSSxZQUFZLEVBQU8sQ0FBQztRQUNqRTs7O1lBR0k7UUFDYyxpQkFBWSxHQUFHLElBQUksWUFBWSxFQUFXLENBQUM7UUFDN0Q7OztXQUdHO1FBQ2UsaUJBQVksR0FBRyxJQUFJLFlBQVks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Q0FBQyxDQUFDO2dCQUN0QyxPQUFPO1lBQ1QsQ0FBQztZQUVELEtBQUssTUFBTSxFQUFDLFlBQVksRUFBQyxJQUFJLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDM0MsTUFBTSxDQUFDLHFCQUFxQixDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7WUFDMUUsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO1FBRUwsSUFBSSxDQUFDLHVCQUF1QixDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztJQUM3RCxDQUFDO3lIQTNEVSwwQkFBMEI7NkhBQTFCLDBCQUEwQjs7c0dBQTFCLDBCQUEwQjtrQkFEdEMsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gIENvbXBvbmVudFJlZixcbiAgRGlyZWN0aXZlLFxuICBFbnZpcm9ubWVudEluamVjdG9yLFxuICBFdmVudEVtaXR0ZXIsXG4gIGluamVjdCxcbiAgSW5qZWN0YWJsZSxcbiAgSW5qZWN0aW9uVG9rZW4sXG4gIEluamVjdG9yLFxuICBJbnB1dCxcbiAgT25EZXN0cm95LFxuICBPbkluaXQsXG4gIE91dHB1dCxcbiAgcmVmbGVjdENvbXBvbmVudFR5cGUsXG4gIFNpbXBsZUNoYW5nZXMsXG4gIFZpZXdDb250YWluZXJSZWYsXG4gIMm1UnVudGltZUVycm9yIGFzIFJ1bnRpbWVFcnJvcixcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge2NvbWJpbmVMYXRlc3QsIG9mLCBTdWJzY3JpcHRpb259IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtzd2l0Y2hNYXB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHtSdW50aW1lRXJyb3JDb2RlfSBmcm9tICcuLi9lcnJvcnMnO1xuaW1wb3J0IHtEYXRhfSBmcm9tICcuLi9tb2RlbHMnO1xuaW1wb3J0IHtDaGlsZHJlbk91dGxldENvbnRleHRzfSBmcm9tICcuLi9yb3V0ZXJfb3V0bGV0X2NvbnRleHQnO1xuaW1wb3J0IHtBY3RpdmF0ZWRSb3V0ZX0gZnJvbSAnLi4vcm91dGVyX3N0YXRlJztcbmltcG9ydCB7UFJJTUFSWV9PVVRMRVR9IGZyb20gJy4uL3NoYXJlZCc7XG5cbi8qKlxuICogQW4gaW50ZXJmYWNlIHRoYXQgZGVmaW5lcyB0aGUgY29udHJhY3QgZm9yIGRldmVsb3BpbmcgYSBjb21wb25lbnQgb3V0bGV0IGZvciB0aGUgYFJvdXRlcmAuXG4gKlxuICogQW4gb3V0bGV0IGFjdHMgYXMgYSBwbGFjZWhvbGRlciB0aGF0IEFuZ3VsYXIgZHluYW1pY2FsbHkgZmlsbHMgYmFzZWQgb24gdGhlIGN1cnJlbnQgcm91dGVyIHN0YXRlLlxuICpcbiAqIEEgcm91dGVyIG91dGxldCBzaG91bGQgcmVnaXN0ZXIgaXRzZWxmIHdpdGggdGhlIGBSb3V0ZXJgIHZpYVxuICogYENoaWxkcmVuT3V0bGV0Q29udGV4dHMjb25DaGlsZE91dGxldENyZWF0ZWRgIGFuZCB1bnJlZ2lzdGVyIHdpdGhcbiAqIGBDaGlsZHJlbk91dGxldENvbnRleHRzI29uQ2hpbGRPdXRsZXREZXN0cm95ZWRgLiBXaGVuIHRoZSBgUm91dGVyYCBpZGVudGlmaWVzIGEgbWF0Y2hlZCBgUm91dGVgLFxuICogaXQgbG9va3MgZm9yIGEgcmVnaXN0ZXJlZCBvdXRsZXQgaW4gdGhlIGBDaGlsZHJlbk91dGxldENvbnRleHRzYCBhbmQgYWN0aXZhdGVzIGl0LlxuICpcbiAqIEBzZWUge0BsaW5rIENoaWxkcmVuT3V0bGV0Q29udGV4dHN9XG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUm91dGVyT3V0bGV0Q29udHJhY3Qge1xuICAvKipcbiAgICogV2hldGhlciB0aGUgZ2l2ZW4gb3V0bGV0IGlzIGFjdGl2YXRlZC5cbiAgICpcbiAgICogQW4gb3V0bGV0IGlzIGNvbnNpZGVyZWQgXCJhY3RpdmF0ZWRcIiBpZiBpdCBoYXMgYW4gYWN0aXZlIGNvbXBvbmVudC5cbiAgICovXG4gIGlzQWN0aXZhdGVkOiBib29sZWFuO1xuXG4gIC8qKiBUaGUgaW5zdGFuY2Ugb2YgdGhlIGFjdGl2YXRlZCBjb21wb25lbnQgb3IgYG51bGxgIGlmIHRoZSBvdXRsZXQgaXMgbm90IGFjdGl2YXRlZC4gKi9cbiAgY29tcG9uZW50OiBPYmplY3QgfCBudWxsO1xuXG4gIC8qKlxuICAgKiBUaGUgYERhdGFgIG9mIHRoZSBgQWN0aXZhdGVkUm91dGVgIHNuYXBzaG90LlxuICAgKi9cbiAgYWN0aXZhdGVkUm91dGVEYXRhOiBEYXRhO1xuXG4gIC8qKlxuICAgKiBUaGUgYEFjdGl2YXRlZFJvdXRlYCBmb3IgdGhlIG91dGxldCBvciBgbnVsbGAgaWYgdGhlIG91dGxldCBpcyBub3QgYWN0aXZhdGVkLlxuICAgKi9cbiAgYWN0aXZhdGVkUm91dGU6IEFjdGl2YXRlZFJvdXRlIHwgbnVsbDtcblxuICAvKipcbiAgICogQ2FsbGVkIGJ5IHRoZSBgUm91dGVyYCB3aGVuIHRoZSBvdXRsZXQgc2hvdWxkIGFjdGl2YXRlIChjcmVhdGUgYSBjb21wb25lbnQpLlxuICAgKi9cbiAgYWN0aXZhdGVXaXRoKGFjdGl2YXRlZFJvdXRlOiBBY3RpdmF0ZWRSb3V0ZSwgZW52aXJvbm1lbnRJbmplY3RvcjogRW52aXJvbm1lbnRJbmplY3Rvcik6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIEEgcmVxdWVzdCB0byBkZXN0cm95IHRoZSBjdXJyZW50bHkgYWN0aXZhdGVkIGNvbXBvbmVudC5cbiAgICpcbiAgICogV2hlbiBhIGBSb3V0ZVJldXNlU3RyYXRlZ3lgIGluZGljYXRlcyB0aGF0IGFuIGBBY3RpdmF0ZWRSb3V0ZWAgc2hvdWxkIGJlIHJlbW92ZWQgYnV0IHN0b3JlZCBmb3JcbiAgICogbGF0ZXIgcmUtdXNlIHJhdGhlciB0aGFuIGRlc3Ryb3llZCwgdGhlIGBSb3V0ZXJgIHdpbGwgY2FsbCBgZGV0YWNoYCBpbnN0ZWFkLlxuICAgKi9cbiAgZGVhY3RpdmF0ZSgpOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiB0aGUgYFJvdXRlUmV1c2VTdHJhdGVneWAgaW5zdHJ1Y3RzIHRvIGRldGFjaCB0aGUgc3VidHJlZS5cbiAgICpcbiAgICogVGhpcyBpcyBzaW1pbGFyIHRvIGBkZWFjdGl2YXRlYCwgYnV0IHRoZSBhY3RpdmF0ZWQgY29tcG9uZW50IHNob3VsZCBfbm90XyBiZSBkZXN0cm95ZWQuXG4gICAqIEluc3RlYWQsIGl0IGlzIHJldHVybmVkIHNvIHRoYXQgaXQgY2FuIGJlIHJlYXR0YWNoZWQgbGF0ZXIgdmlhIHRoZSBgYXR0YWNoYCBtZXRob2QuXG4gICAqL1xuICBkZXRhY2goKTogQ29tcG9uZW50UmVmPHVua25vd24+O1xuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiB0aGUgYFJvdXRlUmV1c2VTdHJhdGVneWAgaW5zdHJ1Y3RzIHRvIHJlLWF0dGFjaCBhIHByZXZpb3VzbHkgZGV0YWNoZWQgc3VidHJlZS5cbiAgICovXG4gIGF0dGFjaChyZWY6IENvbXBvbmVudFJlZjx1bmtub3duPiwgYWN0aXZhdGVkUm91dGU6IEFjdGl2YXRlZFJvdXRlKTogdm9pZDtcblxuICAvKipcbiAgICogRW1pdHMgYW4gYWN0aXZhdGUgZXZlbnQgd2hlbiBhIG5ldyBjb21wb25lbnQgaXMgaW5zdGFudGlhdGVkXG4gICAqKi9cbiAgYWN0aXZhdGVFdmVudHM/OiBFdmVudEVtaXR0ZXI8dW5rbm93bj47XG5cbiAgLyoqXG4gICAqIEVtaXRzIGEgZGVhY3RpdmF0ZSBldmVudCB3aGVuIGEgY29tcG9uZW50IGlzIGRlc3Ryb3llZC5cbiAgICovXG4gIGRlYWN0aXZhdGVFdmVudHM/OiBFdmVudEVtaXR0ZXI8dW5rbm93bj47XG5cbiAgLyoqXG4gICAqIEVtaXRzIGFuIGF0dGFjaGVkIGNvbXBvbmVudCBpbnN0YW5jZSB3aGVuIHRoZSBgUm91dGVSZXVzZVN0cmF0ZWd5YCBpbnN0cnVjdHMgdG8gcmUtYXR0YWNoIGFcbiAgICogcHJldmlvdXNseSBkZXRhY2hlZCBzdWJ0cmVlLlxuICAgKiovXG4gIGF0dGFjaEV2ZW50cz86IEV2ZW50RW1pdHRlcjx1bmtub3duPjtcblxuICAvKipcbiAgICogRW1pdHMgYSBkZXRhY2hlZCBjb21wb25lbnQgaW5zdGFuY2Ugd2hlbiB0aGUgYFJvdXRlUmV1c2VTdHJhdGVneWAgaW5zdHJ1Y3RzIHRvIGRldGFjaCB0aGVcbiAgICogc3VidHJlZS5cbiAgICovXG4gIGRldGFjaEV2ZW50cz86IEV2ZW50RW1pdHRlcjx1bmtub3duPjtcblxuICAvKipcbiAgICogVXNlZCB0byBpbmRpY2F0ZSB0aGF0IHRoZSBvdXRsZXQgaXMgYWJsZSB0byBiaW5kIGRhdGEgZnJvbSB0aGUgYFJvdXRlcmAgdG8gdGhlIG91dGxldFxuICAgKiBjb21wb25lbnQncyBpbnB1dHMuXG4gICAqXG4gICAqIFdoZW4gdGhpcyBpcyBgdW5kZWZpbmVkYCBvciBgZmFsc2VgIGFuZCB0aGUgZGV2ZWxvcGVyIGhhcyBvcHRlZCBpbiB0byB0aGVcbiAgICogZmVhdHVyZSB1c2luZyBgd2l0aENvbXBvbmVudElucHV0QmluZGluZ2AsIGEgd2FybmluZyB3aWxsIGJlIGxvZ2dlZCBpbiBkZXYgbW9kZSBpZiB0aGlzIG91dGxldFxuICAgKiBpcyB1c2VkIGluIHRoZSBhcHBsaWNhdGlvbi5cbiAgICovXG4gIHJlYWRvbmx5IHN1cHBvcnRzQmluZGluZ1RvQ29tcG9uZW50SW5wdXRzPzogdHJ1ZTtcbn1cblxuLyoqXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBBY3RzIGFzIGEgcGxhY2Vob2xkZXIgdGhhdCBBbmd1bGFyIGR5bmFtaWNhbGx5IGZpbGxzIGJhc2VkIG9uIHRoZSBjdXJyZW50IHJvdXRlciBzdGF0ZS5cbiAqXG4gKiBFYWNoIG91dGxldCBjYW4gaGF2ZSBhIHVuaXF1ZSBuYW1lLCBkZXRlcm1pbmVkIGJ5IHRoZSBvcHRpb25hbCBgbmFtZWAgYXR0cmlidXRlLlxuICogVGhlIG5hbWUgY2Fubm90IGJlIHNldCBvciBjaGFuZ2VkIGR5bmFtaWNhbGx5LiBJZiBub3Qgc2V0LCBkZWZhdWx0IHZhbHVlIGlzIFwicHJpbWFyeVwiLlxuICpcbiAqIGBgYFxuICogPHJvdXRlci1vdXRsZXQ+PC9yb3V0ZXItb3V0bGV0PlxuICogPHJvdXRlci1vdXRsZXQgbmFtZT0nbGVmdCc+PC9yb3V0ZXItb3V0bGV0PlxuICogPHJvdXRlci1vdXRsZXQgbmFtZT0ncmlnaHQnPjwvcm91dGVyLW91dGxldD5cbiAqIGBgYFxuICpcbiAqIE5hbWVkIG91dGxldHMgY2FuIGJlIHRoZSB0YXJnZXRzIG9mIHNlY29uZGFyeSByb3V0ZXMuXG4gKiBUaGUgYFJvdXRlYCBvYmplY3QgZm9yIGEgc2Vjb25kYXJ5IHJvdXRlIGhhcyBhbiBgb3V0bGV0YCBwcm9wZXJ0eSB0byBpZGVudGlmeSB0aGUgdGFyZ2V0IG91dGxldDpcbiAqXG4gKiBge3BhdGg6IDxiYXNlLXBhdGg+LCBjb21wb25lbnQ6IDxjb21wb25lbnQ+LCBvdXRsZXQ6IDx0YXJnZXRfb3V0bGV0X25hbWU+fWBcbiAqXG4gKiBVc2luZyBuYW1lZCBvdXRsZXRzIGFuZCBzZWNvbmRhcnkgcm91dGVzLCB5b3UgY2FuIHRhcmdldCBtdWx0aXBsZSBvdXRsZXRzIGluXG4gKiB0aGUgc2FtZSBgUm91dGVyTGlua2AgZGlyZWN0aXZlLlxuICpcbiAqIFRoZSByb3V0ZXIga2VlcHMgdHJhY2sgb2Ygc2VwYXJhdGUgYnJhbmNoZXMgaW4gYSBuYXZpZ2F0aW9uIHRyZWUgZm9yIGVhY2ggbmFtZWQgb3V0bGV0IGFuZFxuICogZ2VuZXJhdGVzIGEgcmVwcmVzZW50YXRpb24gb2YgdGhhdCB0cmVlIGluIHRoZSBVUkwuXG4gKiBUaGUgVVJMIGZvciBhIHNlY29uZGFyeSByb3V0ZSB1c2VzIHRoZSBmb2xsb3dpbmcgc3ludGF4IHRvIHNwZWNpZnkgYm90aCB0aGUgcHJpbWFyeSBhbmQgc2Vjb25kYXJ5XG4gKiByb3V0ZXMgYXQgdGhlIHNhbWUgdGltZTpcbiAqXG4gKiBgaHR0cDovL2Jhc2UtcGF0aC9wcmltYXJ5LXJvdXRlLXBhdGgob3V0bGV0LW5hbWU6cm91dGUtcGF0aClgXG4gKlxuICogQSByb3V0ZXIgb3V0bGV0IGVtaXRzIGFuIGFjdGl2YXRlIGV2ZW50IHdoZW4gYSBuZXcgY29tcG9uZW50IGlzIGluc3RhbnRpYXRlZCxcbiAqIGRlYWN0aXZhdGUgZXZlbnQgd2hlbiBhIGNvbXBvbmVudCBpcyBkZXN0cm95ZWQuXG4gKiBBbiBhdHRhY2hlZCBldmVudCBlbWl0cyB3aGVuIHRoZSBgUm91dGVSZXVzZVN0cmF0ZWd5YCBpbnN0cnVjdHMgdGhlIG91dGxldCB0byByZWF0dGFjaCB0aGVcbiAqIHN1YnRyZWUsIGFuZCB0aGUgZGV0YWNoZWQgZXZlbnQgZW1pdHMgd2hlbiB0aGUgYFJvdXRlUmV1c2VTdHJhdGVneWAgaW5zdHJ1Y3RzIHRoZSBvdXRsZXQgdG9cbiAqIGRldGFjaCB0aGUgc3VidHJlZS5cbiAqXG4gKiBgYGBcbiAqIDxyb3V0ZXItb3V0bGV0XG4gKiAgIChhY3RpdmF0ZSk9J29uQWN0aXZhdGUoJGV2ZW50KSdcbiAqICAgKGRlYWN0aXZhdGUpPSdvbkRlYWN0aXZhdGUoJGV2ZW50KSdcbiAqICAgKGF0dGFjaCk9J29uQXR0YWNoKCRldmVudCknXG4gKiAgIChkZXRhY2gpPSdvbkRldGFjaCgkZXZlbnQpJz48L3JvdXRlci1vdXRsZXQ+XG4gKiBgYGBcbiAqXG4gKiBAc2VlIHtAbGluayBSb3V0ZXJMaW5rfVxuICogQHNlZSB7QGxpbmsgUm91dGV9XG4gKiBAbmdNb2R1bGUgUm91dGVyTW9kdWxlXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdyb3V0ZXItb3V0bGV0JyxcbiAgZXhwb3J0QXM6ICdvdXRsZXQnLFxuICBzdGFuZGFsb25lOiB0cnVlLFxufSlcbmV4cG9ydCBjbGFzcyBSb3V0ZXJPdXRsZXQgaW1wbGVtZW50cyBPbkRlc3Ryb3ksIE9uSW5pdCwgUm91dGVyT3V0bGV0Q29udHJhY3Qge1xuICBwcml2YXRlIGFjdGl2YXRlZDogQ29tcG9uZW50UmVmPGFueT4gfCBudWxsID0gbnVsbDtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBnZXQgYWN0aXZhdGVkQ29tcG9uZW50UmVmKCk6IENvbXBvbmVudFJlZjxhbnk+IHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuYWN0aXZhdGVkO1xuICB9XG4gIHByaXZhdGUgX2FjdGl2YXRlZFJvdXRlOiBBY3RpdmF0ZWRSb3V0ZSB8IG51bGwgPSBudWxsO1xuICAvKipcbiAgICogVGhlIG5hbWUgb2YgdGhlIG91dGxldFxuICAgKlxuICAgKi9cbiAgQElucHV0KCkgbmFtZSA9IFBSSU1BUllfT1VUTEVUO1xuXG4gIEBPdXRwdXQoJ2FjdGl2YXRlJykgYWN0aXZhdGVFdmVudHMgPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgQE91dHB1dCgnZGVhY3RpdmF0ZScpIGRlYWN0aXZhdGVFdmVudHMgPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgLyoqXG4gICAqIEVtaXRzIGFuIGF0dGFjaGVkIGNvbXBvbmVudCBpbnN0YW5jZSB3aGVuIHRoZSBgUm91dGVSZXVzZVN0cmF0ZWd5YCBpbnN0cnVjdHMgdG8gcmUtYXR0YWNoIGFcbiAgICogcHJldmlvdXNseSBkZXRhY2hlZCBzdWJ0cmVlLlxuICAgKiovXG4gIEBPdXRwdXQoJ2F0dGFjaCcpIGF0dGFjaEV2ZW50cyA9IG5ldyBFdmVudEVtaXR0ZXI8dW5rbm93bj4oKTtcbiAgLyoqXG4gICAqIEVtaXRzIGEgZGV0YWNoZWQgY29tcG9uZW50IGluc3RhbmNlIHdoZW4gdGhlIGBSb3V0ZVJldXNlU3RyYXRlZ3lgIGluc3RydWN0cyB0byBkZXRhY2ggdGhlXG4gICAqIHN1YnRyZWUuXG4gICAqL1xuICBAT3V0cHV0KCdkZXRhY2gnKSBkZXRhY2hFdmVudHMgPSBuZXcgRXZlbnRFbWl0dGVyPHVua25vd24+KCk7XG5cbiAgcHJpdmF0ZSBwYXJlbnRDb250ZXh0cyA9IGluamVjdChDaGlsZHJlbk91dGxldENvbnRleHRzKTtcbiAgcHJpdmF0ZSBsb2NhdGlvbiA9IGluamVjdChWaWV3Q29udGFpbmVyUmVmKTtcbiAgcHJpdmF0ZSBjaGFuZ2VEZXRlY3RvciA9IGluamVjdChDaGFuZ2VEZXRlY3RvclJlZik7XG4gIHByaXZhdGUgaW5wdXRCaW5kZXIgPSBpbmplY3QoSU5QVVRfQklOREVSLCB7b3B0aW9uYWw6IHRydWV9KTtcbiAgLyoqIEBub2RvYyAqL1xuICByZWFkb25seSBzdXBwb3J0c0JpbmRpbmdUb0NvbXBvbmVudElucHV0cyA9IHRydWU7XG5cbiAgLyoqIEBub2RvYyAqL1xuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XG4gICAgaWYgKGNoYW5nZXNbJ25hbWUnXSkge1xuICAgICAgY29uc3Qge2ZpcnN0Q2hhbmdlLCBwcmV2aW91c1ZhbHVlfSA9IGNoYW5nZXNbJ25hbWUnXTtcbiAgICAgIGlmIChmaXJzdENoYW5nZSkge1xuICAgICAgICAvLyBUaGUgZmlyc3QgY2hhbmdlIGlzIGhhbmRsZWQgYnkgbmdPbkluaXQuIEJlY2F1c2UgbmdPbkNoYW5nZXMgZG9lc24ndCBnZXQgY2FsbGVkIHdoZW4gbm9cbiAgICAgICAgLy8gaW5wdXQgaXMgc2V0IGF0IGFsbCwgd2UgbmVlZCB0byBjZW50cmFsbHkgaGFuZGxlIHRoZSBmaXJzdCBjaGFuZ2UgdGhlcmUuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gdW5yZWdpc3RlciB3aXRoIHRoZSBvbGQgbmFtZVxuICAgICAgaWYgKHRoaXMuaXNUcmFja2VkSW5QYXJlbnRDb250ZXh0cyhwcmV2aW91c1ZhbHVlKSkge1xuICAgICAgICB0aGlzLmRlYWN0aXZhdGUoKTtcbiAgICAgICAgdGhpcy5wYXJlbnRDb250ZXh0cy5vbkNoaWxkT3V0bGV0RGVzdHJveWVkKHByZXZpb3VzVmFsdWUpO1xuICAgICAgfVxuICAgICAgLy8gcmVnaXN0ZXIgdGhlIG5ldyBuYW1lXG4gICAgICB0aGlzLmluaXRpYWxpemVPdXRsZXRXaXRoTmFtZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAbm9kb2MgKi9cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgLy8gRW5zdXJlIHRoYXQgdGhlIHJlZ2lzdGVyZWQgb3V0bGV0IGlzIHRoaXMgb25lIGJlZm9yZSByZW1vdmluZyBpdCBvbiB0aGUgY29udGV4dC5cbiAgICBpZiAodGhpcy5pc1RyYWNrZWRJblBhcmVudENvbnRleHRzKHRoaXMubmFtZSkpIHtcbiAgICAgIHRoaXMucGFyZW50Q29udGV4dHMub25DaGlsZE91dGxldERlc3Ryb3llZCh0aGlzLm5hbWUpO1xuICAgIH1cbiAgICB0aGlzLmlucHV0QmluZGVyPy51bnN1YnNjcmliZUZyb21Sb3V0ZURhdGEodGhpcyk7XG4gIH1cblxuICBwcml2YXRlIGlzVHJhY2tlZEluUGFyZW50Q29udGV4dHMob3V0bGV0TmFtZTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMucGFyZW50Q29udGV4dHMuZ2V0Q29udGV4dChvdXRsZXROYW1lKT8ub3V0bGV0ID09PSB0aGlzO1xuICB9XG5cbiAgLyoqIEBub2RvYyAqL1xuICBuZ09uSW5pdCgpOiB2b2lkIHtcbiAgICB0aGlzLmluaXRpYWxpemVPdXRsZXRXaXRoTmFtZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBpbml0aWFsaXplT3V0bGV0V2l0aE5hbWUoKSB7XG4gICAgdGhpcy5wYXJlbnRDb250ZXh0cy5vbkNoaWxkT3V0bGV0Q3JlYXRlZCh0aGlzLm5hbWUsIHRoaXMpO1xuICAgIGlmICh0aGlzLmFjdGl2YXRlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIElmIHRoZSBvdXRsZXQgd2FzIG5vdCBpbnN0YW50aWF0ZWQgYXQgdGhlIHRpbWUgdGhlIHJvdXRlIGdvdCBhY3RpdmF0ZWQgd2UgbmVlZCB0byBwb3B1bGF0ZVxuICAgIC8vIHRoZSBvdXRsZXQgd2hlbiBpdCBpcyBpbml0aWFsaXplZCAoaWUgaW5zaWRlIGEgTmdJZilcbiAgICBjb25zdCBjb250ZXh0ID0gdGhpcy5wYXJlbnRDb250ZXh0cy5nZXRDb250ZXh0KHRoaXMubmFtZSk7XG4gICAgaWYgKGNvbnRleHQ/LnJvdXRlKSB7XG4gICAgICBpZiAoY29udGV4dC5hdHRhY2hSZWYpIHtcbiAgICAgICAgLy8gYGF0dGFjaFJlZmAgaXMgcG9wdWxhdGVkIHdoZW4gdGhlcmUgaXMgYW4gZXhpc3RpbmcgY29tcG9uZW50IHRvIG1vdW50XG4gICAgICAgIHRoaXMuYXR0YWNoKGNvbnRleHQuYXR0YWNoUmVmLCBjb250ZXh0LnJvdXRlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIG90aGVyd2lzZSB0aGUgY29tcG9uZW50IGRlZmluZWQgaW4gdGhlIGNvbmZpZ3VyYXRpb24gaXMgY3JlYXRlZFxuICAgICAgICB0aGlzLmFjdGl2YXRlV2l0aChjb250ZXh0LnJvdXRlLCBjb250ZXh0LmluamVjdG9yKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBnZXQgaXNBY3RpdmF0ZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICEhdGhpcy5hY3RpdmF0ZWQ7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybnMgVGhlIGN1cnJlbnRseSBhY3RpdmF0ZWQgY29tcG9uZW50IGluc3RhbmNlLlxuICAgKiBAdGhyb3dzIEFuIGVycm9yIGlmIHRoZSBvdXRsZXQgaXMgbm90IGFjdGl2YXRlZC5cbiAgICovXG4gIGdldCBjb21wb25lbnQoKTogT2JqZWN0IHtcbiAgICBpZiAoIXRoaXMuYWN0aXZhdGVkKVxuICAgICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5PVVRMRVRfTk9UX0FDVElWQVRFRCxcbiAgICAgICAgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkgJiYgJ091dGxldCBpcyBub3QgYWN0aXZhdGVkJyxcbiAgICAgICk7XG4gICAgcmV0dXJuIHRoaXMuYWN0aXZhdGVkLmluc3RhbmNlO1xuICB9XG5cbiAgZ2V0IGFjdGl2YXRlZFJvdXRlKCk6IEFjdGl2YXRlZFJvdXRlIHtcbiAgICBpZiAoIXRoaXMuYWN0aXZhdGVkKVxuICAgICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5PVVRMRVRfTk9UX0FDVElWQVRFRCxcbiAgICAgICAgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkgJiYgJ091dGxldCBpcyBub3QgYWN0aXZhdGVkJyxcbiAgICAgICk7XG4gICAgcmV0dXJuIHRoaXMuX2FjdGl2YXRlZFJvdXRlIGFzIEFjdGl2YXRlZFJvdXRlO1xuICB9XG5cbiAgZ2V0IGFjdGl2YXRlZFJvdXRlRGF0YSgpOiBEYXRhIHtcbiAgICBpZiAodGhpcy5fYWN0aXZhdGVkUm91dGUpIHtcbiAgICAgIHJldHVybiB0aGlzLl9hY3RpdmF0ZWRSb3V0ZS5zbmFwc2hvdC5kYXRhO1xuICAgIH1cbiAgICByZXR1cm4ge307XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gdGhlIGBSb3V0ZVJldXNlU3RyYXRlZ3lgIGluc3RydWN0cyB0byBkZXRhY2ggdGhlIHN1YnRyZWVcbiAgICovXG4gIGRldGFjaCgpOiBDb21wb25lbnRSZWY8YW55PiB7XG4gICAgaWYgKCF0aGlzLmFjdGl2YXRlZClcbiAgICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuT1VUTEVUX05PVF9BQ1RJVkFURUQsXG4gICAgICAgICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpICYmICdPdXRsZXQgaXMgbm90IGFjdGl2YXRlZCcsXG4gICAgICApO1xuICAgIHRoaXMubG9jYXRpb24uZGV0YWNoKCk7XG4gICAgY29uc3QgY21wID0gdGhpcy5hY3RpdmF0ZWQ7XG4gICAgdGhpcy5hY3RpdmF0ZWQgPSBudWxsO1xuICAgIHRoaXMuX2FjdGl2YXRlZFJvdXRlID0gbnVsbDtcbiAgICB0aGlzLmRldGFjaEV2ZW50cy5lbWl0KGNtcC5pbnN0YW5jZSk7XG4gICAgcmV0dXJuIGNtcDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiB0aGUgYFJvdXRlUmV1c2VTdHJhdGVneWAgaW5zdHJ1Y3RzIHRvIHJlLWF0dGFjaCBhIHByZXZpb3VzbHkgZGV0YWNoZWQgc3VidHJlZVxuICAgKi9cbiAgYXR0YWNoKHJlZjogQ29tcG9uZW50UmVmPGFueT4sIGFjdGl2YXRlZFJvdXRlOiBBY3RpdmF0ZWRSb3V0ZSkge1xuICAgIHRoaXMuYWN0aXZhdGVkID0gcmVmO1xuICAgIHRoaXMuX2FjdGl2YXRlZFJvdXRlID0gYWN0aXZhdGVkUm91dGU7XG4gICAgdGhpcy5sb2NhdGlvbi5pbnNlcnQocmVmLmhvc3RWaWV3KTtcbiAgICB0aGlzLmlucHV0QmluZGVyPy5iaW5kQWN0aXZhdGVkUm91dGVUb091dGxldENvbXBvbmVudCh0aGlzKTtcbiAgICB0aGlzLmF0dGFjaEV2ZW50cy5lbWl0KHJlZi5pbnN0YW5jZSk7XG4gIH1cblxuICBkZWFjdGl2YXRlKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmFjdGl2YXRlZCkge1xuICAgICAgY29uc3QgYyA9IHRoaXMuY29tcG9uZW50O1xuICAgICAgdGhpcy5hY3RpdmF0ZWQuZGVzdHJveSgpO1xuICAgICAgdGhpcy5hY3RpdmF0ZWQgPSBudWxsO1xuICAgICAgdGhpcy5fYWN0aXZhdGVkUm91dGUgPSBudWxsO1xuICAgICAgdGhpcy5kZWFjdGl2YXRlRXZlbnRzLmVtaXQoYyk7XG4gICAgfVxuICB9XG5cbiAgYWN0aXZhdGVXaXRoKGFjdGl2YXRlZFJvdXRlOiBBY3RpdmF0ZWRSb3V0ZSwgZW52aXJvbm1lbnRJbmplY3RvcjogRW52aXJvbm1lbnRJbmplY3Rvcikge1xuICAgIGlmICh0aGlzLmlzQWN0aXZhdGVkKSB7XG4gICAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLk9VVExFVF9BTFJFQURZX0FDVElWQVRFRCxcbiAgICAgICAgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkgJiZcbiAgICAgICAgICAnQ2Fubm90IGFjdGl2YXRlIGFuIGFscmVhZHkgYWN0aXZhdGVkIG91dGxldCcsXG4gICAgICApO1xuICAgIH1cbiAgICB0aGlzLl9hY3RpdmF0ZWRSb3V0ZSA9IGFjdGl2YXRlZFJvdXRlO1xuICAgIGNvbnN0IGxvY2F0aW9uID0gdGhpcy5sb2NhdGlvbjtcbiAgICBjb25zdCBzbmFwc2hvdCA9IGFjdGl2YXRlZFJvdXRlLnNuYXBzaG90O1xuICAgIGNvbnN0IGNvbXBvbmVudCA9IHNuYXBzaG90LmNvbXBvbmVudCE7XG4gICAgY29uc3QgY2hpbGRDb250ZXh0cyA9IHRoaXMucGFyZW50Q29udGV4dHMuZ2V0T3JDcmVhdGVDb250ZXh0KHRoaXMubmFtZSkuY2hpbGRyZW47XG4gICAgY29uc3QgaW5qZWN0b3IgPSBuZXcgT3V0bGV0SW5qZWN0b3IoYWN0aXZhdGVkUm91dGUsIGNoaWxkQ29udGV4dHMsIGxvY2F0aW9uLmluamVjdG9yKTtcblxuICAgIHRoaXMuYWN0aXZhdGVkID0gbG9jYXRpb24uY3JlYXRlQ29tcG9uZW50KGNvbXBvbmVudCwge1xuICAgICAgaW5kZXg6IGxvY2F0aW9uLmxlbmd0aCxcbiAgICAgIGluamVjdG9yLFxuICAgICAgZW52aXJvbm1lbnRJbmplY3RvcjogZW52aXJvbm1lbnRJbmplY3RvcixcbiAgICB9KTtcbiAgICAvLyBDYWxsaW5nIGBtYXJrRm9yQ2hlY2tgIHRvIG1ha2Ugc3VyZSB3ZSB3aWxsIHJ1biB0aGUgY2hhbmdlIGRldGVjdGlvbiB3aGVuIHRoZVxuICAgIC8vIGBSb3V0ZXJPdXRsZXRgIGlzIGluc2lkZSBhIGBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2hgIGNvbXBvbmVudC5cbiAgICB0aGlzLmNoYW5nZURldGVjdG9yLm1hcmtGb3JDaGVjaygpO1xuICAgIHRoaXMuaW5wdXRCaW5kZXI/LmJpbmRBY3RpdmF0ZWRSb3V0ZVRvT3V0bGV0Q29tcG9uZW50KHRoaXMpO1xuICAgIHRoaXMuYWN0aXZhdGVFdmVudHMuZW1pdCh0aGlzLmFjdGl2YXRlZC5pbnN0YW5jZSk7XG4gIH1cbn1cblxuY2xhc3MgT3V0bGV0SW5qZWN0b3IgaW1wbGVtZW50cyBJbmplY3RvciB7XG4gIC8qKlxuICAgKiBUaGlzIGluamVjdG9yIGhhcyBhIHNwZWNpYWwgaGFuZGluZyBmb3IgdGhlIGBBY3RpdmF0ZWRSb3V0ZWAgYW5kXG4gICAqIGBDaGlsZHJlbk91dGxldENvbnRleHRzYCB0b2tlbnM6IGl0IHJldHVybnMgY29ycmVzcG9uZGluZyB2YWx1ZXMgZm9yIHRob3NlXG4gICAqIHRva2VucyBkeW5hbWljYWxseS4gVGhpcyBiZWhhdmlvciBpcyBkaWZmZXJlbnQgZnJvbSB0aGUgcmVndWxhciBpbmplY3RvciBsb2dpYyxcbiAgICogd2hlbiB3ZSBpbml0aWFsaXplIGFuZCBzdG9yZSBhIHZhbHVlLCB3aGljaCBpcyBsYXRlciByZXR1cm5lZCBmb3IgYWxsIGluamVjdFxuICAgKiByZXF1ZXN0cy5cbiAgICpcbiAgICogSW4gc29tZSBjYXNlcyAoZS5nLiB3aGVuIHVzaW5nIGBAZGVmZXJgKSwgdGhpcyBkeW5hbWljIGJlaGF2aW9yIHJlcXVpcmVzIHNwZWNpYWxcbiAgICogaGFuZGxpbmcuIFRoaXMgZnVuY3Rpb24gYWxsb3dzIHRvIGlkZW50aWZ5IGFuIGluc3RhbmNlIG9mIHRoZSBgT3V0bGV0SW5qZWN0b3JgIGFuZFxuICAgKiBjcmVhdGUgYW4gaW5zdGFuY2Ugb2YgaXQgd2l0aG91dCByZWZlcnJpbmcgdG8gdGhlIGNsYXNzIGl0c2VsZiAoc28gdGhpcyBsb2dpYyBjYW5cbiAgICogYmUgaW52b2tlZCBmcm9tIHRoZSBgY29yZWAgcGFja2FnZSkuIFRoaXMgaGVscHMgdG8gcmV0YWluIGR5bmFtaWMgYmVoYXZpb3IgZm9yIHRoZVxuICAgKiBtZW50aW9uZWQgdG9rZW5zLlxuICAgKlxuICAgKiBOb3RlOiBpdCdzIGEgdGVtcG9yYXJ5IHNvbHV0aW9uIGFuZCB3ZSBzaG91bGQgZXhwbG9yZSBob3cgdG8gc3VwcG9ydCB0aGlzIGNhc2UgYmV0dGVyLlxuICAgKi9cbiAgcHJpdmF0ZSBfX25nT3V0bGV0SW5qZWN0b3IocGFyZW50SW5qZWN0b3I6IEluamVjdG9yKSB7XG4gICAgcmV0dXJuIG5ldyBPdXRsZXRJbmplY3Rvcih0aGlzLnJvdXRlLCB0aGlzLmNoaWxkQ29udGV4dHMsIHBhcmVudEluamVjdG9yKTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgcm91dGU6IEFjdGl2YXRlZFJvdXRlLFxuICAgIHByaXZhdGUgY2hpbGRDb250ZXh0czogQ2hpbGRyZW5PdXRsZXRDb250ZXh0cyxcbiAgICBwcml2YXRlIHBhcmVudDogSW5qZWN0b3IsXG4gICkge31cblxuICBnZXQodG9rZW46IGFueSwgbm90Rm91bmRWYWx1ZT86IGFueSk6IGFueSB7XG4gICAgaWYgKHRva2VuID09PSBBY3RpdmF0ZWRSb3V0ZSkge1xuICAgICAgcmV0dXJuIHRoaXMucm91dGU7XG4gICAgfVxuXG4gICAgaWYgKHRva2VuID09PSBDaGlsZHJlbk91dGxldENvbnRleHRzKSB7XG4gICAgICByZXR1cm4gdGhpcy5jaGlsZENvbnRleHRzO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnBhcmVudC5nZXQodG9rZW4sIG5vdEZvdW5kVmFsdWUpO1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBJTlBVVF9CSU5ERVIgPSBuZXcgSW5qZWN0aW9uVG9rZW48Um91dGVkQ29tcG9uZW50SW5wdXRCaW5kZXI+KCcnKTtcblxuLyoqXG4gKiBJbmplY3RhYmxlIHVzZWQgYXMgYSB0cmVlLXNoYWthYmxlIHByb3ZpZGVyIGZvciBvcHRpbmcgaW4gdG8gYmluZGluZyByb3V0ZXIgZGF0YSB0byBjb21wb25lbnRcbiAqIGlucHV0cy5cbiAqXG4gKiBUaGUgUm91dGVyT3V0bGV0IHJlZ2lzdGVycyBpdHNlbGYgd2l0aCB0aGlzIHNlcnZpY2Ugd2hlbiBhbiBgQWN0aXZhdGVkUm91dGVgIGlzIGF0dGFjaGVkIG9yXG4gKiBhY3RpdmF0ZWQuIFdoZW4gdGhpcyBoYXBwZW5zLCB0aGUgc2VydmljZSBzdWJzY3JpYmVzIHRvIHRoZSBgQWN0aXZhdGVkUm91dGVgIG9ic2VydmFibGVzIChwYXJhbXMsXG4gKiBxdWVyeVBhcmFtcywgZGF0YSkgYW5kIHNldHMgdGhlIGlucHV0cyBvZiB0aGUgY29tcG9uZW50IHVzaW5nIGBDb21wb25lbnRSZWYuc2V0SW5wdXRgLlxuICogSW1wb3J0YW50bHksIHdoZW4gYW4gaW5wdXQgZG9lcyBub3QgaGF2ZSBhbiBpdGVtIGluIHRoZSByb3V0ZSBkYXRhIHdpdGggYSBtYXRjaGluZyBrZXksIHRoaXNcbiAqIGlucHV0IGlzIHNldCB0byBgdW5kZWZpbmVkYC4gSWYgaXQgd2VyZSBub3QgZG9uZSB0aGlzIHdheSwgdGhlIHByZXZpb3VzIGluZm9ybWF0aW9uIHdvdWxkIGJlXG4gKiByZXRhaW5lZCBpZiB0aGUgZGF0YSBnb3QgcmVtb3ZlZCBmcm9tIHRoZSByb3V0ZSAoaS5lLiBpZiBhIHF1ZXJ5IHBhcmFtZXRlciBpcyByZW1vdmVkKS5cbiAqXG4gKiBUaGUgYFJvdXRlck91dGxldGAgc2hvdWxkIHVucmVnaXN0ZXIgaXRzZWxmIHdoZW4gZGVzdHJveWVkIHZpYSBgdW5zdWJzY3JpYmVGcm9tUm91dGVEYXRhYCBzbyB0aGF0XG4gKiB0aGUgc3Vic2NyaXB0aW9ucyBhcmUgY2xlYW5lZCB1cC5cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFJvdXRlZENvbXBvbmVudElucHV0QmluZGVyIHtcbiAgcHJpdmF0ZSBvdXRsZXREYXRhU3Vic2NyaXB0aW9ucyA9IG5ldyBNYXA8Um91dGVyT3V0bGV0LCBTdWJzY3JpcHRpb24+KCk7XG5cbiAgYmluZEFjdGl2YXRlZFJvdXRlVG9PdXRsZXRDb21wb25lbnQob3V0bGV0OiBSb3V0ZXJPdXRsZXQpIHtcbiAgICB0aGlzLnVuc3Vic2NyaWJlRnJvbVJvdXRlRGF0YShvdXRsZXQpO1xuICAgIHRoaXMuc3Vic2NyaWJlVG9Sb3V0ZURhdGEob3V0bGV0KTtcbiAgfVxuXG4gIHVuc3Vic2NyaWJlRnJvbVJvdXRlRGF0YShvdXRsZXQ6IFJvdXRlck91dGxldCkge1xuICAgIHRoaXMub3V0bGV0RGF0YVN1YnNjcmlwdGlvbnMuZ2V0KG91dGxldCk/LnVuc3Vic2NyaWJlKCk7XG4gICAgdGhpcy5vdXRsZXREYXRhU3Vic2NyaXB0aW9ucy5kZWxldGUob3V0bGV0KTtcbiAgfVxuXG4gIHByaXZhdGUgc3Vic2NyaWJlVG9Sb3V0ZURhdGEob3V0bGV0OiBSb3V0ZXJPdXRsZXQpIHtcbiAgICBjb25zdCB7YWN0aXZhdGVkUm91dGV9ID0gb3V0bGV0O1xuICAgIGNvbnN0IGRhdGFTdWJzY3JpcHRpb24gPSBjb21iaW5lTGF0ZXN0KFtcbiAgICAgIGFjdGl2YXRlZFJvdXRlLnF1ZXJ5UGFyYW1zLFxuICAgICAgYWN0aXZhdGVkUm91dGUucGFyYW1zLFxuICAgICAgYWN0aXZhdGVkUm91dGUuZGF0YSxcbiAgICBdKVxuICAgICAgLnBpcGUoXG4gICAgICAgIHN3aXRjaE1hcCgoW3F1ZXJ5UGFyYW1zLCBwYXJhbXMsIGRhdGFdLCBpbmRleCkgPT4ge1xuICAgICAgICAgIGRhdGEgPSB7Li4ucXVlcnlQYXJhbXMsIC4uLnBhcmFtcywgLi4uZGF0YX07XG4gICAgICAgICAgLy8gR2V0IHRoZSBmaXJzdCByZXN1bHQgZnJvbSB0aGUgZGF0YSBzdWJzY3JpcHRpb24gc3luY2hyb25vdXNseSBzbyBpdCdzIGF2YWlsYWJsZSB0b1xuICAgICAgICAgIC8vIHRoZSBjb21wb25lbnQgYXMgc29vbiBhcyBwb3NzaWJsZSAoYW5kIGRvZXNuJ3QgcmVxdWlyZSBhIHNlY29uZCBjaGFuZ2UgZGV0ZWN0aW9uKS5cbiAgICAgICAgICBpZiAoaW5kZXggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBvZihkYXRhKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gUHJvbWlzZS5yZXNvbHZlIGlzIHVzZWQgdG8gYXZvaWQgc3luY2hyb25vdXNseSB3cml0aW5nIHRoZSB3cm9uZyBkYXRhIHdoZW5cbiAgICAgICAgICAvLyB0d28gb2YgdGhlIE9ic2VydmFibGVzIGluIHRoZSBgY29tYmluZUxhdGVzdGAgc3RyZWFtIGVtaXQgb25lIGFmdGVyXG4gICAgICAgICAgLy8gYW5vdGhlci5cbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGRhdGEpO1xuICAgICAgICB9KSxcbiAgICAgIClcbiAgICAgIC5zdWJzY3JpYmUoKGRhdGEpID0+IHtcbiAgICAgICAgLy8gT3V0bGV0IG1heSBoYXZlIGJlZW4gZGVhY3RpdmF0ZWQgb3IgY2hhbmdlZCBuYW1lcyB0byBiZSBhc3NvY2lhdGVkIHdpdGggYSBkaWZmZXJlbnRcbiAgICAgICAgLy8gcm91dGVcbiAgICAgICAgaWYgKFxuICAgICAgICAgICFvdXRsZXQuaXNBY3RpdmF0ZWQgfHxcbiAgICAgICAgICAhb3V0bGV0LmFjdGl2YXRlZENvbXBvbmVudFJlZiB8fFxuICAgICAgICAgIG91dGxldC5hY3RpdmF0ZWRSb3V0ZSAhPT0gYWN0aXZhdGVkUm91dGUgfHxcbiAgICAgICAgICBhY3RpdmF0ZWRSb3V0ZS5jb21wb25lbnQgPT09IG51bGxcbiAgICAgICAgKSB7XG4gICAgICAgICAgdGhpcy51bnN1YnNjcmliZUZyb21Sb3V0ZURhdGEob3V0bGV0KTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBtaXJyb3IgPSByZWZsZWN0Q29tcG9uZW50VHlwZShhY3RpdmF0ZWRSb3V0ZS5jb21wb25lbnQpO1xuICAgICAgICBpZiAoIW1pcnJvcikge1xuICAgICAgICAgIHRoaXMudW5zdWJzY3JpYmVGcm9tUm91dGVEYXRhKG91dGxldCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChjb25zdCB7dGVtcGxhdGVOYW1lfSBvZiBtaXJyb3IuaW5wdXRzKSB7XG4gICAgICAgICAgb3V0bGV0LmFjdGl2YXRlZENvbXBvbmVudFJlZi5zZXRJbnB1dCh0ZW1wbGF0ZU5hbWUsIGRhdGFbdGVtcGxhdGVOYW1lXSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgdGhpcy5vdXRsZXREYXRhU3Vic2NyaXB0aW9ucy5zZXQob3V0bGV0LCBkYXRhU3Vic2NyaXB0aW9uKTtcbiAgfVxufVxuIl19