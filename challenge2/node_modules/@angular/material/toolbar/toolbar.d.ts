/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Platform } from '@angular/cdk/platform';
import { AfterViewInit, ElementRef, QueryList } from '@angular/core';
import { CanColor, CanColorCtor } from '@angular/material/core';
/** @docs-private */
import * as ɵngcc0 from '@angular/core';
declare class MatToolbarBase {
    _elementRef: ElementRef;
    constructor(_elementRef: ElementRef);
}
declare const _MatToolbarMixinBase: CanColorCtor & typeof MatToolbarBase;
export declare class MatToolbarRow {
    static ɵfac: ɵngcc0.ɵɵFactoryDeclaration<MatToolbarRow, never>;
    static ɵdir: ɵngcc0.ɵɵDirectiveDeclaration<MatToolbarRow, "mat-toolbar-row", ["matToolbarRow"], {}, {}, never>;
}
export declare class MatToolbar extends _MatToolbarMixinBase implements CanColor, AfterViewInit {
    private _platform;
    private _document;
    /** Reference to all toolbar row elements that have been projected. */
    _toolbarRows: QueryList<MatToolbarRow>;
    constructor(elementRef: ElementRef, _platform: Platform, document?: any);
    ngAfterViewInit(): void;
    /**
     * Throws an exception when developers are attempting to combine the different toolbar row modes.
     */
    private _checkToolbarMixedModes;
    static ɵfac: ɵngcc0.ɵɵFactoryDeclaration<MatToolbar, never>;
    static ɵcmp: ɵngcc0.ɵɵComponentDeclaration<MatToolbar, "mat-toolbar", ["matToolbar"], { "color": "color"; }, {}, ["_toolbarRows"], ["*", "mat-toolbar-row"]>;
}
/**
 * Throws an exception when attempting to combine the different toolbar row modes.
 * @docs-private
 */
export declare function throwToolbarMixedModesError(): void;
export {};

//# sourceMappingURL=toolbar.d.ts.map