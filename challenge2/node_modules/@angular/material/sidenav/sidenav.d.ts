/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ChangeDetectorRef, QueryList, ElementRef, NgZone } from '@angular/core';
import { MatDrawer, MatDrawerContainer, MatDrawerContent } from './drawer';
import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { ScrollDispatcher } from '@angular/cdk/scrolling';
import * as ɵngcc0 from '@angular/core';
export declare class MatSidenavContent extends MatDrawerContent {
    constructor(changeDetectorRef: ChangeDetectorRef, container: MatSidenavContainer, elementRef: ElementRef<HTMLElement>, scrollDispatcher: ScrollDispatcher, ngZone: NgZone);
    static ɵfac: ɵngcc0.ɵɵFactoryDeclaration<MatSidenavContent, never>;
    static ɵcmp: ɵngcc0.ɵɵComponentDeclaration<MatSidenavContent, "mat-sidenav-content", never, {}, {}, never, ["*"]>;
}
export declare class MatSidenav extends MatDrawer {
    /** Whether the sidenav is fixed in the viewport. */
    get fixedInViewport(): boolean;
    set fixedInViewport(value: boolean);
    private _fixedInViewport;
    /**
     * The gap between the top of the sidenav and the top of the viewport when the sidenav is in fixed
     * mode.
     */
    get fixedTopGap(): number;
    set fixedTopGap(value: number);
    private _fixedTopGap;
    /**
     * The gap between the bottom of the sidenav and the bottom of the viewport when the sidenav is in
     * fixed mode.
     */
    get fixedBottomGap(): number;
    set fixedBottomGap(value: number);
    private _fixedBottomGap;
    static ngAcceptInputType_fixedInViewport: BooleanInput;
    static ngAcceptInputType_fixedTopGap: NumberInput;
    static ngAcceptInputType_fixedBottomGap: NumberInput;
    static ɵfac: ɵngcc0.ɵɵFactoryDeclaration<MatSidenav, never>;
    static ɵcmp: ɵngcc0.ɵɵComponentDeclaration<MatSidenav, "mat-sidenav", ["matSidenav"], { "fixedInViewport": "fixedInViewport"; "fixedTopGap": "fixedTopGap"; "fixedBottomGap": "fixedBottomGap"; }, {}, never, ["*"]>;
}
export declare class MatSidenavContainer extends MatDrawerContainer {
    _allDrawers: QueryList<MatSidenav>;
    _content: MatSidenavContent;
    static ngAcceptInputType_hasBackdrop: BooleanInput;
    static ɵfac: ɵngcc0.ɵɵFactoryDeclaration<MatSidenavContainer, never>;
    static ɵcmp: ɵngcc0.ɵɵComponentDeclaration<MatSidenavContainer, "mat-sidenav-container", ["matSidenavContainer"], {}, {}, ["_content", "_allDrawers"], ["mat-sidenav", "mat-sidenav-content", "*"]>;
}

//# sourceMappingURL=sidenav.d.ts.map