import { ComponentRef } from '@angular/core';
import { BasePortalHost, ComponentPortal } from '../portal/portal';
/**
 * Reference to an overlay that has been created with the Overlay service.
 * Used to manipulate or dispose of said overlay.
 */
export declare class OverlayRef {
    private _portalHost;
    constructor(_portalHost: BasePortalHost);
    attach(portal: ComponentPortal<any>, newestOnTop?: boolean): ComponentRef<any>;
    /**
     * Detaches an overlay from a portal.
     * @returns Resolves when the overlay has been detached.
     */
    detach(): void;
}
