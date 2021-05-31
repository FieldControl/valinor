/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { OverlayReference } from '../overlay-reference';
import { BaseOverlayDispatcher } from './base-overlay-dispatcher';
/**
 * Service for dispatching keyboard events that land on the body to appropriate overlay ref,
 * if any. It maintains a list of attached overlays to determine best suited overlay based
 * on event target and order of overlay opens.
 */
import * as ɵngcc0 from '@angular/core';
export declare class OverlayKeyboardDispatcher extends BaseOverlayDispatcher {
    constructor(document: any);
    /** Add a new overlay to the list of attached overlay refs. */
    add(overlayRef: OverlayReference): void;
    /** Detaches the global keyboard event listener. */
    protected detach(): void;
    /** Keyboard event listener that will be attached to the body. */
    private _keydownListener;
    static ɵfac: ɵngcc0.ɵɵFactoryDeclaration<OverlayKeyboardDispatcher, never>;
}

//# sourceMappingURL=overlay-keyboard-dispatcher.d.ts.map