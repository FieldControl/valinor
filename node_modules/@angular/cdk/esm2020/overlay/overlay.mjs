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
import { ApplicationRef, ComponentFactoryResolver, Inject, Injectable, Injector, NgZone, ANIMATION_MODULE_TYPE, Optional, } from '@angular/core';
import { OverlayKeyboardDispatcher } from './dispatchers/overlay-keyboard-dispatcher';
import { OverlayOutsideClickDispatcher } from './dispatchers/overlay-outside-click-dispatcher';
import { OverlayConfig } from './overlay-config';
import { OverlayContainer } from './overlay-container';
import { OverlayRef } from './overlay-ref';
import { OverlayPositionBuilder } from './position/overlay-position-builder';
import { ScrollStrategyOptions } from './scroll/index';
import * as i0 from "@angular/core";
import * as i1 from "./scroll/index";
import * as i2 from "./overlay-container";
import * as i3 from "./position/overlay-position-builder";
import * as i4 from "./dispatchers/overlay-keyboard-dispatcher";
import * as i5 from "@angular/cdk/bidi";
import * as i6 from "@angular/common";
import * as i7 from "./dispatchers/overlay-outside-click-dispatcher";
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
    scrollStrategies, _overlayContainer, _componentFactoryResolver, _positionBuilder, _keyboardDispatcher, _injector, _ngZone, _document, _directionality, _location, _outsideClickDispatcher, _animationsModuleType) {
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
        this._animationsModuleType = _animationsModuleType;
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
        return new OverlayRef(portalOutlet, host, pane, overlayConfig, this._ngZone, this._keyboardDispatcher, this._document, this._location, this._outsideClickDispatcher, this._animationsModuleType === 'NoopAnimations');
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
Overlay.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: Overlay, deps: [{ token: i1.ScrollStrategyOptions }, { token: i2.OverlayContainer }, { token: i0.ComponentFactoryResolver }, { token: i3.OverlayPositionBuilder }, { token: i4.OverlayKeyboardDispatcher }, { token: i0.Injector }, { token: i0.NgZone }, { token: DOCUMENT }, { token: i5.Directionality }, { token: i6.Location }, { token: i7.OverlayOutsideClickDispatcher }, { token: ANIMATION_MODULE_TYPE, optional: true }], target: i0.ɵɵFactoryTarget.Injectable });
Overlay.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: Overlay, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: Overlay, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: function () { return [{ type: i1.ScrollStrategyOptions }, { type: i2.OverlayContainer }, { type: i0.ComponentFactoryResolver }, { type: i3.OverlayPositionBuilder }, { type: i4.OverlayKeyboardDispatcher }, { type: i0.Injector }, { type: i0.NgZone }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }, { type: i5.Directionality }, { type: i6.Location }, { type: i7.OverlayOutsideClickDispatcher }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [ANIMATION_MODULE_TYPE]
                }, {
                    type: Optional
                }] }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3ZlcmxheS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvb3ZlcmxheS9vdmVybGF5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNqRCxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDcEQsT0FBTyxFQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUNuRCxPQUFPLEVBQ0wsY0FBYyxFQUNkLHdCQUF3QixFQUN4QixNQUFNLEVBQ04sVUFBVSxFQUNWLFFBQVEsRUFDUixNQUFNLEVBQ04scUJBQXFCLEVBQ3JCLFFBQVEsR0FDVCxNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUMseUJBQXlCLEVBQUMsTUFBTSwyQ0FBMkMsQ0FBQztBQUNwRixPQUFPLEVBQUMsNkJBQTZCLEVBQUMsTUFBTSxnREFBZ0QsQ0FBQztBQUM3RixPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFDL0MsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDckQsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEVBQUMsc0JBQXNCLEVBQUMsTUFBTSxxQ0FBcUMsQ0FBQztBQUMzRSxPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQzs7Ozs7Ozs7O0FBRXJELDhCQUE4QjtBQUM5QixJQUFJLFlBQVksR0FBRyxDQUFDLENBQUM7QUFFckIsNEZBQTRGO0FBQzVGLDRFQUE0RTtBQUU1RTs7Ozs7OztHQU9HO0FBRUgsTUFBTSxPQUFPLE9BQU87SUFHbEI7SUFDRSxzRUFBc0U7SUFDL0QsZ0JBQXVDLEVBQ3RDLGlCQUFtQyxFQUNuQyx5QkFBbUQsRUFDbkQsZ0JBQXdDLEVBQ3hD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QyxTQUFTLEVBQ2QsSUFBSSxDQUFDLFNBQVMsQ0FDZixDQUFDO0lBQ0osQ0FBQzs7eUdBbkdVLE9BQU8sNFBBWVIsUUFBUSxnSEFJUixxQkFBcUI7NkdBaEJwQixPQUFPLGNBREssTUFBTTtnR0FDbEIsT0FBTztrQkFEbkIsVUFBVTttQkFBQyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUM7OzBCQWEzQixNQUFNOzJCQUFDLFFBQVE7OzBCQUlmLE1BQU07MkJBQUMscUJBQXFCOzswQkFBRyxRQUFRIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aW9uYWxpdHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcbmltcG9ydCB7RG9tUG9ydGFsT3V0bGV0fSBmcm9tICdAYW5ndWxhci9jZGsvcG9ydGFsJztcbmltcG9ydCB7RE9DVU1FTlQsIExvY2F0aW9ufSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtcbiAgQXBwbGljYXRpb25SZWYsXG4gIENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcixcbiAgSW5qZWN0LFxuICBJbmplY3RhYmxlLFxuICBJbmplY3RvcixcbiAgTmdab25lLFxuICBBTklNQVRJT05fTU9EVUxFX1RZUEUsXG4gIE9wdGlvbmFsLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7T3ZlcmxheUtleWJvYXJkRGlzcGF0Y2hlcn0gZnJvbSAnLi9kaXNwYXRjaGVycy9vdmVybGF5LWtleWJvYXJkLWRpc3BhdGNoZXInO1xuaW1wb3J0IHtPdmVybGF5T3V0c2lkZUNsaWNrRGlzcGF0Y2hlcn0gZnJvbSAnLi9kaXNwYXRjaGVycy9vdmVybGF5LW91dHNpZGUtY2xpY2stZGlzcGF0Y2hlcic7XG5pbXBvcnQge092ZXJsYXlDb25maWd9IGZyb20gJy4vb3ZlcmxheS1jb25maWcnO1xuaW1wb3J0IHtPdmVybGF5Q29udGFpbmVyfSBmcm9tICcuL292ZXJsYXktY29udGFpbmVyJztcbmltcG9ydCB7T3ZlcmxheVJlZn0gZnJvbSAnLi9vdmVybGF5LXJlZic7XG5pbXBvcnQge092ZXJsYXlQb3NpdGlvbkJ1aWxkZXJ9IGZyb20gJy4vcG9zaXRpb24vb3ZlcmxheS1wb3NpdGlvbi1idWlsZGVyJztcbmltcG9ydCB7U2Nyb2xsU3RyYXRlZ3lPcHRpb25zfSBmcm9tICcuL3Njcm9sbC9pbmRleCc7XG5cbi8qKiBOZXh0IG92ZXJsYXkgdW5pcXVlIElELiAqL1xubGV0IG5leHRVbmlxdWVJZCA9IDA7XG5cbi8vIE5vdGUgdGhhdCBPdmVybGF5IGlzICpub3QqIHNjb3BlZCB0byB0aGUgYXBwIHJvb3QgYmVjYXVzZSBvZiB0aGUgQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyXG4vLyB3aGljaCBuZWVkcyB0byBiZSBkaWZmZXJlbnQgZGVwZW5kaW5nIG9uIHdoZXJlIE92ZXJsYXlNb2R1bGUgaXMgaW1wb3J0ZWQuXG5cbi8qKlxuICogU2VydmljZSB0byBjcmVhdGUgT3ZlcmxheXMuIE92ZXJsYXlzIGFyZSBkeW5hbWljYWxseSBhZGRlZCBwaWVjZXMgb2YgZmxvYXRpbmcgVUksIG1lYW50IHRvIGJlXG4gKiB1c2VkIGFzIGEgbG93LWxldmVsIGJ1aWxkaW5nIGJsb2NrIGZvciBvdGhlciBjb21wb25lbnRzLiBEaWFsb2dzLCB0b29sdGlwcywgbWVudXMsXG4gKiBzZWxlY3RzLCBldGMuIGNhbiBhbGwgYmUgYnVpbHQgdXNpbmcgb3ZlcmxheXMuIFRoZSBzZXJ2aWNlIHNob3VsZCBwcmltYXJpbHkgYmUgdXNlZCBieSBhdXRob3JzXG4gKiBvZiByZS11c2FibGUgY29tcG9uZW50cyByYXRoZXIgdGhhbiBkZXZlbG9wZXJzIGJ1aWxkaW5nIGVuZC11c2VyIGFwcGxpY2F0aW9ucy5cbiAqXG4gKiBBbiBvdmVybGF5ICppcyogYSBQb3J0YWxPdXRsZXQsIHNvIGFueSBraW5kIG9mIFBvcnRhbCBjYW4gYmUgbG9hZGVkIGludG8gb25lLlxuICovXG5ASW5qZWN0YWJsZSh7cHJvdmlkZWRJbjogJ3Jvb3QnfSlcbmV4cG9ydCBjbGFzcyBPdmVybGF5IHtcbiAgcHJpdmF0ZSBfYXBwUmVmOiBBcHBsaWNhdGlvblJlZjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAvKiogU2Nyb2xsaW5nIHN0cmF0ZWdpZXMgdGhhdCBjYW4gYmUgdXNlZCB3aGVuIGNyZWF0aW5nIGFuIG92ZXJsYXkuICovXG4gICAgcHVibGljIHNjcm9sbFN0cmF0ZWdpZXM6IFNjcm9sbFN0cmF0ZWd5T3B0aW9ucyxcbiAgICBwcml2YXRlIF9vdmVybGF5Q29udGFpbmVyOiBPdmVybGF5Q29udGFpbmVyLFxuICAgIHByaXZhdGUgX2NvbXBvbmVudEZhY3RvcnlSZXNvbHZlcjogQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyLFxuICAgIHByaXZhdGUgX3Bvc2l0aW9uQnVpbGRlcjogT3ZlcmxheVBvc2l0aW9uQnVpbGRlcixcbiAgICBwcml2YXRlIF9rZXlib2FyZERpc3BhdGNoZXI6IE92ZXJsYXlLZXlib2FyZERpc3BhdGNoZXIsXG4gICAgcHJpdmF0ZSBfaW5qZWN0b3I6IEluamVjdG9yLFxuICAgIHByaXZhdGUgX25nWm9uZTogTmdab25lLFxuICAgIEBJbmplY3QoRE9DVU1FTlQpIHByaXZhdGUgX2RvY3VtZW50OiBhbnksXG4gICAgcHJpdmF0ZSBfZGlyZWN0aW9uYWxpdHk6IERpcmVjdGlvbmFsaXR5LFxuICAgIHByaXZhdGUgX2xvY2F0aW9uOiBMb2NhdGlvbixcbiAgICBwcml2YXRlIF9vdXRzaWRlQ2xpY2tEaXNwYXRjaGVyOiBPdmVybGF5T3V0c2lkZUNsaWNrRGlzcGF0Y2hlcixcbiAgICBASW5qZWN0KEFOSU1BVElPTl9NT0RVTEVfVFlQRSkgQE9wdGlvbmFsKCkgcHJpdmF0ZSBfYW5pbWF0aW9uc01vZHVsZVR5cGU/OiBzdHJpbmcsXG4gICkge31cblxuICAvKipcbiAgICogQ3JlYXRlcyBhbiBvdmVybGF5LlxuICAgKiBAcGFyYW0gY29uZmlnIENvbmZpZ3VyYXRpb24gYXBwbGllZCB0byB0aGUgb3ZlcmxheS5cbiAgICogQHJldHVybnMgUmVmZXJlbmNlIHRvIHRoZSBjcmVhdGVkIG92ZXJsYXkuXG4gICAqL1xuICBjcmVhdGUoY29uZmlnPzogT3ZlcmxheUNvbmZpZyk6IE92ZXJsYXlSZWYge1xuICAgIGNvbnN0IGhvc3QgPSB0aGlzLl9jcmVhdGVIb3N0RWxlbWVudCgpO1xuICAgIGNvbnN0IHBhbmUgPSB0aGlzLl9jcmVhdGVQYW5lRWxlbWVudChob3N0KTtcbiAgICBjb25zdCBwb3J0YWxPdXRsZXQgPSB0aGlzLl9jcmVhdGVQb3J0YWxPdXRsZXQocGFuZSk7XG4gICAgY29uc3Qgb3ZlcmxheUNvbmZpZyA9IG5ldyBPdmVybGF5Q29uZmlnKGNvbmZpZyk7XG5cbiAgICBvdmVybGF5Q29uZmlnLmRpcmVjdGlvbiA9IG92ZXJsYXlDb25maWcuZGlyZWN0aW9uIHx8IHRoaXMuX2RpcmVjdGlvbmFsaXR5LnZhbHVlO1xuXG4gICAgcmV0dXJuIG5ldyBPdmVybGF5UmVmKFxuICAgICAgcG9ydGFsT3V0bGV0LFxuICAgICAgaG9zdCxcbiAgICAgIHBhbmUsXG4gICAgICBvdmVybGF5Q29uZmlnLFxuICAgICAgdGhpcy5fbmdab25lLFxuICAgICAgdGhpcy5fa2V5Ym9hcmREaXNwYXRjaGVyLFxuICAgICAgdGhpcy5fZG9jdW1lbnQsXG4gICAgICB0aGlzLl9sb2NhdGlvbixcbiAgICAgIHRoaXMuX291dHNpZGVDbGlja0Rpc3BhdGNoZXIsXG4gICAgICB0aGlzLl9hbmltYXRpb25zTW9kdWxlVHlwZSA9PT0gJ05vb3BBbmltYXRpb25zJyxcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYSBwb3NpdGlvbiBidWlsZGVyIHRoYXQgY2FuIGJlIHVzZWQsIHZpYSBmbHVlbnQgQVBJLFxuICAgKiB0byBjb25zdHJ1Y3QgYW5kIGNvbmZpZ3VyZSBhIHBvc2l0aW9uIHN0cmF0ZWd5LlxuICAgKiBAcmV0dXJucyBBbiBvdmVybGF5IHBvc2l0aW9uIGJ1aWxkZXIuXG4gICAqL1xuICBwb3NpdGlvbigpOiBPdmVybGF5UG9zaXRpb25CdWlsZGVyIHtcbiAgICByZXR1cm4gdGhpcy5fcG9zaXRpb25CdWlsZGVyO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgdGhlIERPTSBlbGVtZW50IGZvciBhbiBvdmVybGF5IGFuZCBhcHBlbmRzIGl0IHRvIHRoZSBvdmVybGF5IGNvbnRhaW5lci5cbiAgICogQHJldHVybnMgTmV3bHktY3JlYXRlZCBwYW5lIGVsZW1lbnRcbiAgICovXG4gIHByaXZhdGUgX2NyZWF0ZVBhbmVFbGVtZW50KGhvc3Q6IEhUTUxFbGVtZW50KTogSFRNTEVsZW1lbnQge1xuICAgIGNvbnN0IHBhbmUgPSB0aGlzLl9kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblxuICAgIHBhbmUuaWQgPSBgY2RrLW92ZXJsYXktJHtuZXh0VW5pcXVlSWQrK31gO1xuICAgIHBhbmUuY2xhc3NMaXN0LmFkZCgnY2RrLW92ZXJsYXktcGFuZScpO1xuICAgIGhvc3QuYXBwZW5kQ2hpbGQocGFuZSk7XG5cbiAgICByZXR1cm4gcGFuZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIHRoZSBob3N0IGVsZW1lbnQgdGhhdCB3cmFwcyBhcm91bmQgYW4gb3ZlcmxheVxuICAgKiBhbmQgY2FuIGJlIHVzZWQgZm9yIGFkdmFuY2VkIHBvc2l0aW9uaW5nLlxuICAgKiBAcmV0dXJucyBOZXdseS1jcmVhdGUgaG9zdCBlbGVtZW50LlxuICAgKi9cbiAgcHJpdmF0ZSBfY3JlYXRlSG9zdEVsZW1lbnQoKTogSFRNTEVsZW1lbnQge1xuICAgIGNvbnN0IGhvc3QgPSB0aGlzLl9kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB0aGlzLl9vdmVybGF5Q29udGFpbmVyLmdldENvbnRhaW5lckVsZW1lbnQoKS5hcHBlbmRDaGlsZChob3N0KTtcbiAgICByZXR1cm4gaG9zdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBEb21Qb3J0YWxPdXRsZXQgaW50byB3aGljaCB0aGUgb3ZlcmxheSBjb250ZW50IGNhbiBiZSBsb2FkZWQuXG4gICAqIEBwYXJhbSBwYW5lIFRoZSBET00gZWxlbWVudCB0byB0dXJuIGludG8gYSBwb3J0YWwgb3V0bGV0LlxuICAgKiBAcmV0dXJucyBBIHBvcnRhbCBvdXRsZXQgZm9yIHRoZSBnaXZlbiBET00gZWxlbWVudC5cbiAgICovXG4gIHByaXZhdGUgX2NyZWF0ZVBvcnRhbE91dGxldChwYW5lOiBIVE1MRWxlbWVudCk6IERvbVBvcnRhbE91dGxldCB7XG4gICAgLy8gV2UgaGF2ZSB0byByZXNvbHZlIHRoZSBBcHBsaWNhdGlvblJlZiBsYXRlciBpbiBvcmRlciB0byBhbGxvdyBwZW9wbGVcbiAgICAvLyB0byB1c2Ugb3ZlcmxheS1iYXNlZCBwcm92aWRlcnMgZHVyaW5nIGFwcCBpbml0aWFsaXphdGlvbi5cbiAgICBpZiAoIXRoaXMuX2FwcFJlZikge1xuICAgICAgdGhpcy5fYXBwUmVmID0gdGhpcy5faW5qZWN0b3IuZ2V0PEFwcGxpY2F0aW9uUmVmPihBcHBsaWNhdGlvblJlZik7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBEb21Qb3J0YWxPdXRsZXQoXG4gICAgICBwYW5lLFxuICAgICAgdGhpcy5fY29tcG9uZW50RmFjdG9yeVJlc29sdmVyLFxuICAgICAgdGhpcy5fYXBwUmVmLFxuICAgICAgdGhpcy5faW5qZWN0b3IsXG4gICAgICB0aGlzLl9kb2N1bWVudCxcbiAgICApO1xuICB9XG59XG4iXX0=