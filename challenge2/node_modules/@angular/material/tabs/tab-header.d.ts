/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directionality } from '@angular/cdk/bidi';
import { ViewportRuler } from '@angular/cdk/scrolling';
import { AfterContentChecked, AfterContentInit, ChangeDetectorRef, ElementRef, NgZone, OnDestroy, QueryList, AfterViewInit } from '@angular/core';
import { BooleanInput } from '@angular/cdk/coercion';
import { MatInkBar } from './ink-bar';
import { MatTabLabelWrapper } from './tab-label-wrapper';
import { Platform } from '@angular/cdk/platform';
import { MatPaginatedTabHeader } from './paginated-tab-header';
/**
 * Base class with all of the `MatTabHeader` functionality.
 * @docs-private
 */
export declare abstract class _MatTabHeaderBase extends MatPaginatedTabHeader implements AfterContentChecked, AfterContentInit, AfterViewInit, OnDestroy {
    /** Whether the ripple effect is disabled or not. */
    get disableRipple(): any;
    set disableRipple(value: any);
    private _disableRipple;
    constructor(elementRef: ElementRef, changeDetectorRef: ChangeDetectorRef, viewportRuler: ViewportRuler, dir: Directionality, ngZone: NgZone, platform: Platform, animationMode?: string);
    protected _itemSelected(event: KeyboardEvent): void;
}
/**
 * The header of the tab group which displays a list of all the tabs in the tab group. Includes
 * an ink bar that follows the currently selected tab. When the tabs list's width exceeds the
 * width of the header container, then arrows will be displayed to allow the user to scroll
 * left and right across the header.
 * @docs-private
 */
export declare class MatTabHeader extends _MatTabHeaderBase {
    _items: QueryList<MatTabLabelWrapper>;
    _inkBar: MatInkBar;
    _tabListContainer: ElementRef;
    _tabList: ElementRef;
    _nextPaginator: ElementRef<HTMLElement>;
    _previousPaginator: ElementRef<HTMLElement>;
    constructor(elementRef: ElementRef, changeDetectorRef: ChangeDetectorRef, viewportRuler: ViewportRuler, dir: Directionality, ngZone: NgZone, platform: Platform, animationMode?: string);
    static ngAcceptInputType_disableRipple: BooleanInput;
}
