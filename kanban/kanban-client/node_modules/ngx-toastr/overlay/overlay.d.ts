import { ToastContainerDirective } from '../toastr/toast.directive';
import { OverlayRef } from './overlay-ref';
import * as i0 from "@angular/core";
/**
 * Service to create Overlays. Overlays are dynamically added pieces of floating UI, meant to be
 * used as a low-level building building block for other components. Dialogs, tooltips, menus,
 * selects, etc. can all be built using overlays. The service should primarily be used by authors
 * of re-usable components rather than developers building end-user applications.
 *
 * An overlay *is* a PortalHost, so any kind of Portal can be loaded into one.
 */
export declare class Overlay {
    private _overlayContainer;
    private _componentFactoryResolver;
    private _appRef;
    private _document;
    private _paneElements;
    /**
     * Creates an overlay.
     * @returns A reference to the created overlay.
     */
    create(positionClass?: string, overlayContainer?: ToastContainerDirective): OverlayRef;
    getPaneElement(positionClass?: string, overlayContainer?: ToastContainerDirective): HTMLElement;
    /**
     * Creates the DOM element for an overlay and appends it to the overlay container.
     * @returns Newly-created pane element
     */
    private _createPaneElement;
    /**
     * Create a DomPortalHost into which the overlay content can be loaded.
     * @param pane The DOM element to turn into a portal host.
     * @returns A portal host for the given DOM element.
     */
    private _createPortalHost;
    /**
     * Creates an OverlayRef for an overlay in the given DOM element.
     * @param pane DOM element for the overlay
     */
    private _createOverlayRef;
    static ɵfac: i0.ɵɵFactoryDeclaration<Overlay, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<Overlay>;
}
