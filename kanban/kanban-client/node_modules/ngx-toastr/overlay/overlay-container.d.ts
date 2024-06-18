import { OnDestroy } from '@angular/core';
import * as i0 from "@angular/core";
/** Container inside which all toasts will render. */
export declare class OverlayContainer implements OnDestroy {
    protected _document: Document;
    protected _containerElement: HTMLElement;
    ngOnDestroy(): void;
    /**
     * This method returns the overlay container element. It will lazily
     * create the element the first time  it is called to facilitate using
     * the container in non-browser environments.
     * @returns the container element
     */
    getContainerElement(): HTMLElement;
    /**
     * Create the overlay container element, which is simply a div
     * with the 'cdk-overlay-container' class on the document body
     * and 'aria-live="polite"'
     */
    protected _createContainer(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<OverlayContainer, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<OverlayContainer>;
}
