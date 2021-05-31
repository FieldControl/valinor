/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { OnDestroy } from '@angular/core';
import { Platform } from '@angular/cdk/platform';
/** Container inside which all overlays will render. */
import * as ɵngcc0 from '@angular/core';
export declare class OverlayContainer implements OnDestroy {
    protected _platform: Platform;
    protected _containerElement: HTMLElement;
    protected _document: Document;
    constructor(document: any, _platform: Platform);
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
     * with the 'cdk-overlay-container' class on the document body.
     */
    protected _createContainer(): void;
    static ɵfac: ɵngcc0.ɵɵFactoryDeclaration<OverlayContainer, never>;
}

//# sourceMappingURL=overlay-container.d.ts.map