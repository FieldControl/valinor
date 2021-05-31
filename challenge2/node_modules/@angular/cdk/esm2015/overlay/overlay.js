/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directionality } from '@angular/cdk/bidi';
import { DomPortalOutlet } from '@angular/cdk/portal';
import { DOCUMENT, Location } from '@angular/common';
import { ApplicationRef, ComponentFactoryResolver, Inject, Injectable, Injector, NgZone, } from '@angular/core';
import { OverlayKeyboardDispatcher } from './dispatchers/overlay-keyboard-dispatcher';
import { OverlayOutsideClickDispatcher } from './dispatchers/overlay-outside-click-dispatcher';
import { OverlayConfig } from './overlay-config';
import { OverlayContainer } from './overlay-container';
import { OverlayRef } from './overlay-ref';
import { OverlayPositionBuilder } from './position/overlay-position-builder';
import { ScrollStrategyOptions } from './scroll/index';
/** Next overlay unique ID. */
let nextUniqueId = 0;
// Note that Overlay is *not* scoped to the app root because of the ComponentFactoryResolver
// which needs to be different depending on where OverlayModule is imported.
/**
 * Service to create Overlays. Overlays are dynamically added pieces of floating UI, meant to be
 * used as a low-level building block for other components. Dialogs, tooltips, menus,
 * selects, etc. can all be built using overlays. The service should primarily be used by authors
 * of re-usable components rather than developers building end-user applications.
 *
 * An overlay *is* a PortalOutlet, so any kind of Portal can be loaded into one.
 */
export class Overlay {
    constructor(
    /** Scrolling strategies that can be used when creating an overlay. */
    scrollStrategies, _overlayContainer, _componentFactoryResolver, _positionBuilder, _keyboardDispatcher, _injector, _ngZone, _document, _directionality, _location, _outsideClickDispatcher) {
        this.scrollStrategies = scrollStrategies;
        this._overlayContainer = _overlayContainer;
        this._componentFactoryResolver = _componentFactoryResolver;
        this._positionBuilder = _positionBuilder;
        this._keyboardDispatcher = _keyboardDispatcher;
        this._injector = _injector;
        this._ngZone = _ngZone;
        this._document = _document;
        this._directionality = _directionality;
        this._location = _location;
        this._outsideClickDispatcher = _outsideClickDispatcher;
    }
    /**
     * Creates an overlay.
     * @param config Configuration applied to the overlay.
     * @returns Reference to the created overlay.
     */
    create(config) {
        const host = this._createHostElement();
        const pane = this._createPaneElement(host);
        const portalOutlet = this._createPortalOutlet(pane);
        const overlayConfig = new OverlayConfig(config);
        overlayConfig.direction = overlayConfig.direction || this._directionality.value;
        return new OverlayRef(portalOutlet, host, pane, overlayConfig, this._ngZone, this._keyboardDispatcher, this._document, this._location, this._outsideClickDispatcher);
    }
    /**
     * Gets a position builder that can be used, via fluent API,
     * to construct and configure a position strategy.
     * @returns An overlay position builder.
     */
    position() {
        return this._positionBuilder;
    }
    /**
     * Creates the DOM element for an overlay and appends it to the overlay container.
     * @returns Newly-created pane element
     */
    _createPaneElement(host) {
        const pane = this._document.createElement('div');
        pane.id = `cdk-overlay-${nextUniqueId++}`;
        pane.classList.add('cdk-overlay-pane');
        host.appendChild(pane);
        return pane;
    }
    /**
     * Creates the host element that wraps around an overlay
     * and can be used for advanced positioning.
     * @returns Newly-create host element.
     */
    _createHostElement() {
        const host = this._document.createElement('div');
        this._overlayContainer.getContainerElement().appendChild(host);
        return host;
    }
    /**
     * Create a DomPortalOutlet into which the overlay content can be loaded.
     * @param pane The DOM element to turn into a portal outlet.
     * @returns A portal outlet for the given DOM element.
     */
    _createPortalOutlet(pane) {
        // We have to resolve the ApplicationRef later in order to allow people
        // to use overlay-based providers during app initialization.
        if (!this._appRef) {
            this._appRef = this._injector.get(ApplicationRef);
        }
        return new DomPortalOutlet(pane, this._componentFactoryResolver, this._appRef, this._injector, this._document);
    }
}
Overlay.decorators = [
    { type: Injectable }
];
Overlay.ctorParameters = () => [
    { type: ScrollStrategyOptions },
    { type: OverlayContainer },
    { type: ComponentFactoryResolver },
    { type: OverlayPositionBuilder },
    { type: OverlayKeyboardDispatcher },
    { type: Injector },
    { type: NgZone },
    { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] },
    { type: Directionality },
    { type: Location },
    { type: OverlayOutsideClickDispatcher }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3ZlcmxheS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvb3ZlcmxheS9vdmVybGF5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNqRCxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDcEQsT0FBTyxFQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUNuRCxPQUFPLEVBQ0wsY0FBYyxFQUNkLHdCQUF3QixFQUN4QixNQUFNLEVBQ04sVUFBVSxFQUNWLFFBQVEsRUFDUixNQUFNLEdBQ1AsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLHlCQUF5QixFQUFDLE1BQU0sMkNBQTJDLENBQUM7QUFDcEYsT0FBTyxFQUFDLDZCQUE2QixFQUFDLE1BQU0sZ0RBQWdELENBQUM7QUFDN0YsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBQy9DLE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ3JELE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDekMsT0FBTyxFQUFDLHNCQUFzQixFQUFDLE1BQU0scUNBQXFDLENBQUM7QUFDM0UsT0FBTyxFQUFDLHFCQUFxQixFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFHckQsOEJBQThCO0FBQzlCLElBQUksWUFBWSxHQUFHLENBQUMsQ0FBQztBQUVyQiw0RkFBNEY7QUFDNUYsNEVBQTRFO0FBRTVFOzs7Ozs7O0dBT0c7QUFFSCxNQUFNLE9BQU8sT0FBTztJQUdsQjtJQUNZLHNFQUFzRTtJQUMvRCxnQkFBdUMsRUFDdEMsaUJBQW1DLEVBQ25DLHlCQUFtRCxFQUNuRCxnQkFBd0MsRUFDeEMsbUJBQThDLEVBQzlDLFNBQW1CLEVBQ25CLE9BQWUs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QUFzQjtZQUx0Qix5QkFBeUI7WUFIL0IsUUFBUTtZQUNSLE1BQU07NENBc0NPLE1BQU0sU0FBQyxRQUFRO1lBL0N0QixjQUFjO1lBRUosUUFBUTtZQVVsQiw2QkFBNkIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtEaXJlY3Rpb25hbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHtEb21Qb3J0YWxPdXRsZXR9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wb3J0YWwnO1xuaW1wb3J0IHtET0NVTUVOVCwgTG9jYXRpb259IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge1xuICBBcHBsaWNhdGlvblJlZixcbiAgQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyLFxuICBJbmplY3QsXG4gIEluamVjdGFibGUsXG4gIEluamVjdG9yLFxuICBOZ1pvbmUsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtPdmVybGF5S2V5Ym9hcmREaXNwYXRjaGVyfSBmcm9tICcuL2Rpc3BhdGNoZXJzL292ZXJsYXkta2V5Ym9hcmQtZGlzcGF0Y2hlcic7XG5pbXBvcnQge092ZXJsYXlPdXRzaWRlQ2xpY2tEaXNwYXRjaGVyfSBmcm9tICcuL2Rpc3BhdGNoZXJzL292ZXJsYXktb3V0c2lkZS1jbGljay1kaXNwYXRjaGVyJztcbmltcG9ydCB7T3ZlcmxheUNvbmZpZ30gZnJvbSAnLi9vdmVybGF5LWNvbmZpZyc7XG5pbXBvcnQge092ZXJsYXlDb250YWluZXJ9IGZyb20gJy4vb3ZlcmxheS1jb250YWluZXInO1xuaW1wb3J0IHtPdmVybGF5UmVmfSBmcm9tICcuL292ZXJsYXktcmVmJztcbmltcG9ydCB7T3ZlcmxheVBvc2l0aW9uQnVpbGRlcn0gZnJvbSAnLi9wb3NpdGlvbi9vdmVybGF5LXBvc2l0aW9uLWJ1aWxkZXInO1xuaW1wb3J0IHtTY3JvbGxTdHJhdGVneU9wdGlvbnN9IGZyb20gJy4vc2Nyb2xsL2luZGV4JztcblxuXG4vKiogTmV4dCBvdmVybGF5IHVuaXF1ZSBJRC4gKi9cbmxldCBuZXh0VW5pcXVlSWQgPSAwO1xuXG4vLyBOb3RlIHRoYXQgT3ZlcmxheSBpcyAqbm90KiBzY29wZWQgdG8gdGhlIGFwcCByb290IGJlY2F1c2Ugb2YgdGhlIENvbXBvbmVudEZhY3RvcnlSZXNvbHZlclxuLy8gd2hpY2ggbmVlZHMgdG8gYmUgZGlmZmVyZW50IGRlcGVuZGluZyBvbiB3aGVyZSBPdmVybGF5TW9kdWxlIGlzIGltcG9ydGVkLlxuXG4vKipcbiAqIFNlcnZpY2UgdG8gY3JlYXRlIE92ZXJsYXlzLiBPdmVybGF5cyBhcmUgZHluYW1pY2FsbHkgYWRkZWQgcGllY2VzIG9mIGZsb2F0aW5nIFVJLCBtZWFudCB0byBiZVxuICogdXNlZCBhcyBhIGxvdy1sZXZlbCBidWlsZGluZyBibG9jayBmb3Igb3RoZXIgY29tcG9uZW50cy4gRGlhbG9ncywgdG9vbHRpcHMsIG1lbnVzLFxuICogc2VsZWN0cywgZXRjLiBjYW4gYWxsIGJlIGJ1aWx0IHVzaW5nIG92ZXJsYXlzLiBUaGUgc2VydmljZSBzaG91bGQgcHJpbWFyaWx5IGJlIHVzZWQgYnkgYXV0aG9yc1xuICogb2YgcmUtdXNhYmxlIGNvbXBvbmVudHMgcmF0aGVyIHRoYW4gZGV2ZWxvcGVycyBidWlsZGluZyBlbmQtdXNlciBhcHBsaWNhdGlvbnMuXG4gKlxuICogQW4gb3ZlcmxheSAqaXMqIGEgUG9ydGFsT3V0bGV0LCBzbyBhbnkga2luZCBvZiBQb3J0YWwgY2FuIGJlIGxvYWRlZCBpbnRvIG9uZS5cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE92ZXJsYXkge1xuICBwcml2YXRlIF9hcHBSZWY6IEFwcGxpY2F0aW9uUmVmO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgICAgICAgICAvKiogU2Nyb2xsaW5nIHN0cmF0ZWdpZXMgdGhhdCBjYW4gYmUgdXNlZCB3aGVuIGNyZWF0aW5nIGFuIG92ZXJsYXkuICovXG4gICAgICAgICAgICAgIHB1YmxpYyBzY3JvbGxTdHJhdGVnaWVzOiBTY3JvbGxTdHJhdGVneU9wdGlvbnMsXG4gICAgICAgICAgICAgIHByaXZhdGUgX292ZXJsYXlDb250YWluZXI6IE92ZXJsYXlDb250YWluZXIsXG4gICAgICAgICAgICAgIHByaXZhdGUgX2NvbXBvbmVudEZhY3RvcnlSZXNvbHZlcjogQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyLFxuICAgICAgICAgICAgICBwcml2YXRlIF9wb3NpdGlvbkJ1aWxkZXI6IE92ZXJsYXlQb3NpdGlvbkJ1aWxkZXIsXG4gICAgICAgICAgICAgIHByaXZhdGUgX2tleWJvYXJkRGlzcGF0Y2hlcjogT3ZlcmxheUtleWJvYXJkRGlzcGF0Y2hlcixcbiAgICAgICAgICAgICAgcHJpdmF0ZSBfaW5qZWN0b3I6IEluamVjdG9yLFxuICAgICAgICAgICAgICBwcml2YXRlIF9uZ1pvbmU6IE5nWm9uZSxcbiAgICAgICAgICAgICAgQEluamVjdChET0NVTUVOVCkgcHJpdmF0ZSBfZG9jdW1lbnQ6IGFueSxcbiAgICAgICAgICAgICAgcHJpdmF0ZSBfZGlyZWN0aW9uYWxpdHk6IERpcmVjdGlvbmFsaXR5LFxuICAgICAgICAgICAgICBwcml2YXRlIF9sb2NhdGlvbjogTG9jYXRpb24sXG4gICAgICAgICAgICAgIHByaXZhdGUgX291dHNpZGVDbGlja0Rpc3BhdGNoZXI6IE92ZXJsYXlPdXRzaWRlQ2xpY2tEaXNwYXRjaGVyKSB7IH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhbiBvdmVybGF5LlxuICAgKiBAcGFyYW0gY29uZmlnIENvbmZpZ3VyYXRpb24gYXBwbGllZCB0byB0aGUgb3ZlcmxheS5cbiAgICogQHJldHVybnMgUmVmZXJlbmNlIHRvIHRoZSBjcmVhdGVkIG92ZXJsYXkuXG4gICAqL1xuICBjcmVhdGUoY29uZmlnPzogT3ZlcmxheUNvbmZpZyk6IE92ZXJsYXlSZWYge1xuICAgIGNvbnN0IGhvc3QgPSB0aGlzLl9jcmVhdGVIb3N0RWxlbWVudCgpO1xuICAgIGNvbnN0IHBhbmUgPSB0aGlzLl9jcmVhdGVQYW5lRWxlbWVudChob3N0KTtcbiAgICBjb25zdCBwb3J0YWxPdXRsZXQgPSB0aGlzLl9jcmVhdGVQb3J0YWxPdXRsZXQocGFuZSk7XG4gICAgY29uc3Qgb3ZlcmxheUNvbmZpZyA9IG5ldyBPdmVybGF5Q29uZmlnKGNvbmZpZyk7XG5cbiAgICBvdmVybGF5Q29uZmlnLmRpcmVjdGlvbiA9IG92ZXJsYXlDb25maWcuZGlyZWN0aW9uIHx8IHRoaXMuX2RpcmVjdGlvbmFsaXR5LnZhbHVlO1xuXG4gICAgcmV0dXJuIG5ldyBPdmVybGF5UmVmKHBvcnRhbE91dGxldCwgaG9zdCwgcGFuZSwgb3ZlcmxheUNvbmZpZywgdGhpcy5fbmdab25lLFxuICAgICAgdGhpcy5fa2V5Ym9hcmREaXNwYXRjaGVyLCB0aGlzLl9kb2N1bWVudCwgdGhpcy5fbG9jYXRpb24sIHRoaXMuX291dHNpZGVDbGlja0Rpc3BhdGNoZXIpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYSBwb3NpdGlvbiBidWlsZGVyIHRoYXQgY2FuIGJlIHVzZWQsIHZpYSBmbHVlbnQgQVBJLFxuICAgKiB0byBjb25zdHJ1Y3QgYW5kIGNvbmZpZ3VyZSBhIHBvc2l0aW9uIHN0cmF0ZWd5LlxuICAgKiBAcmV0dXJucyBBbiBvdmVybGF5IHBvc2l0aW9uIGJ1aWxkZXIuXG4gICAqL1xuICBwb3NpdGlvbigpOiBPdmVybGF5UG9zaXRpb25CdWlsZGVyIHtcbiAgICByZXR1cm4gdGhpcy5fcG9zaXRpb25CdWlsZGVyO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgdGhlIERPTSBlbGVtZW50IGZvciBhbiBvdmVybGF5IGFuZCBhcHBlbmRzIGl0IHRvIHRoZSBvdmVybGF5IGNvbnRhaW5lci5cbiAgICogQHJldHVybnMgTmV3bHktY3JlYXRlZCBwYW5lIGVsZW1lbnRcbiAgICovXG4gIHByaXZhdGUgX2NyZWF0ZVBhbmVFbGVtZW50KGhvc3Q6IEhUTUxFbGVtZW50KTogSFRNTEVsZW1lbnQge1xuICAgIGNvbnN0IHBhbmUgPSB0aGlzLl9kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblxuICAgIHBhbmUuaWQgPSBgY2RrLW92ZXJsYXktJHtuZXh0VW5pcXVlSWQrK31gO1xuICAgIHBhbmUuY2xhc3NMaXN0LmFkZCgnY2RrLW92ZXJsYXktcGFuZScpO1xuICAgIGhvc3QuYXBwZW5kQ2hpbGQocGFuZSk7XG5cbiAgICByZXR1cm4gcGFuZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIHRoZSBob3N0IGVsZW1lbnQgdGhhdCB3cmFwcyBhcm91bmQgYW4gb3ZlcmxheVxuICAgKiBhbmQgY2FuIGJlIHVzZWQgZm9yIGFkdmFuY2VkIHBvc2l0aW9uaW5nLlxuICAgKiBAcmV0dXJucyBOZXdseS1jcmVhdGUgaG9zdCBlbGVtZW50LlxuICAgKi9cbiAgcHJpdmF0ZSBfY3JlYXRlSG9zdEVsZW1lbnQoKTogSFRNTEVsZW1lbnQge1xuICAgIGNvbnN0IGhvc3QgPSB0aGlzLl9kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB0aGlzLl9vdmVybGF5Q29udGFpbmVyLmdldENvbnRhaW5lckVsZW1lbnQoKS5hcHBlbmRDaGlsZChob3N0KTtcbiAgICByZXR1cm4gaG9zdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBEb21Qb3J0YWxPdXRsZXQgaW50byB3aGljaCB0aGUgb3ZlcmxheSBjb250ZW50IGNhbiBiZSBsb2FkZWQuXG4gICAqIEBwYXJhbSBwYW5lIFRoZSBET00gZWxlbWVudCB0byB0dXJuIGludG8gYSBwb3J0YWwgb3V0bGV0LlxuICAgKiBAcmV0dXJucyBBIHBvcnRhbCBvdXRsZXQgZm9yIHRoZSBnaXZlbiBET00gZWxlbWVudC5cbiAgICovXG4gIHByaXZhdGUgX2NyZWF0ZVBvcnRhbE91dGxldChwYW5lOiBIVE1MRWxlbWVudCk6IERvbVBvcnRhbE91dGxldCB7XG4gICAgLy8gV2UgaGF2ZSB0byByZXNvbHZlIHRoZSBBcHBsaWNhdGlvblJlZiBsYXRlciBpbiBvcmRlciB0byBhbGxvdyBwZW9wbGVcbiAgICAvLyB0byB1c2Ugb3ZlcmxheS1iYXNlZCBwcm92aWRlcnMgZHVyaW5nIGFwcCBpbml0aWFsaXphdGlvbi5cbiAgICBpZiAoIXRoaXMuX2FwcFJlZikge1xuICAgICAgdGhpcy5fYXBwUmVmID0gdGhpcy5faW5qZWN0b3IuZ2V0PEFwcGxpY2F0aW9uUmVmPihBcHBsaWNhdGlvblJlZik7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBEb21Qb3J0YWxPdXRsZXQocGFuZSwgdGhpcy5fY29tcG9uZW50RmFjdG9yeVJlc29sdmVyLCB0aGlzLl9hcHBSZWYsIHRoaXMuX2luamVjdG9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2RvY3VtZW50KTtcbiAgfVxufVxuIl19