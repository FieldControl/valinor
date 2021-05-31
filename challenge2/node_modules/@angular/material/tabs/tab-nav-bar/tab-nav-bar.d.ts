/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { FocusableOption, FocusMonitor } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { Platform } from '@angular/cdk/platform';
import { ViewportRuler } from '@angular/cdk/scrolling';
import { AfterContentChecked, AfterContentInit, AfterViewInit, ChangeDetectorRef, ElementRef, NgZone, OnDestroy, QueryList } from '@angular/core';
import { CanDisable, CanDisableCtor, CanDisableRipple, CanDisableRippleCtor, HasTabIndex, HasTabIndexCtor, RippleConfig, RippleGlobalOptions, RippleTarget, ThemePalette } from '@angular/material/core';
import { MatInkBar } from '../ink-bar';
import { MatPaginatedTabHeader, MatPaginatedTabHeaderItem } from '../paginated-tab-header';
/**
 * Base class with all of the `MatTabNav` functionality.
 * @docs-private
 */
export declare abstract class _MatTabNavBase extends MatPaginatedTabHeader implements AfterContentChecked, AfterContentInit, OnDestroy {
    /** Query list of all tab links of the tab navigation. */
    abstract _items: QueryList<MatPaginatedTabHeaderItem & {
        active: boolean;
    }>;
    /** Background color of the tab nav. */
    get backgroundColor(): ThemePalette;
    set backgroundColor(value: ThemePalette);
    private _backgroundColor;
    /** Whether the ripple effect is disabled or not. */
    get disableRipple(): any;
    set disableRipple(value: any);
    private _disableRipple;
    /** Theme color of the nav bar. */
    color: ThemePalette;
    constructor(elementRef: ElementRef, dir: Directionality, ngZone: NgZone, changeDetectorRef: ChangeDetectorRef, viewportRuler: ViewportRuler, platform: Platform, animationMode?: string);
    protected _itemSelected(): void;
    ngAfterContentInit(): void;
    /** Notifies the component that the active link has been changed. */
    updateActiveLink(): void;
}
/**
 * Navigation component matching the styles of the tab group header.
 * Provides anchored navigation with animated ink bar.
 */
export declare class MatTabNav extends _MatTabNavBase {
    _items: QueryList<MatTabLink>;
    _inkBar: MatInkBar;
    _tabListContainer: ElementRef;
    _tabList: ElementRef;
    _nextPaginator: ElementRef<HTMLElement>;
    _previousPaginator: ElementRef<HTMLElement>;
    constructor(elementRef: ElementRef, dir: Directionality, ngZone: NgZone, changeDetectorRef: ChangeDetectorRef, viewportRuler: ViewportRuler, platform: Platform, animationMode?: string);
    static ngAcceptInputType_disableRipple: BooleanInput;
}
declare class MatTabLinkMixinBase {
}
declare const _MatTabLinkMixinBase: HasTabIndexCtor & CanDisableRippleCtor & CanDisableCtor & typeof MatTabLinkMixinBase;
/** Base class with all of the `MatTabLink` functionality. */
export declare class _MatTabLinkBase extends _MatTabLinkMixinBase implements AfterViewInit, OnDestroy, CanDisable, CanDisableRipple, HasTabIndex, RippleTarget, FocusableOption {
    private _tabNavBar;
    /** @docs-private */ elementRef: ElementRef;
    private _focusMonitor;
    /** Whether the tab link is active or not. */
    protected _isActive: boolean;
    /** Whether the link is active. */
    get active(): boolean;
    set active(value: boolean);
    /**
     * Ripple configuration for ripples that are launched on pointer down. The ripple config
     * is set to the global ripple options since we don't have any configurable options for
     * the tab link ripples.
     * @docs-private
     */
    rippleConfig: RippleConfig & RippleGlobalOptions;
    /**
     * Whether ripples are disabled on interaction.
     * @docs-private
     */
    get rippleDisabled(): boolean;
    constructor(_tabNavBar: _MatTabNavBase, 
    /** @docs-private */ elementRef: ElementRef, globalRippleOptions: RippleGlobalOptions | null, tabIndex: string, _focusMonitor: FocusMonitor, animationMode?: string);
    /** Focuses the tab link. */
    focus(): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    static ngAcceptInputType_active: BooleanInput;
    static ngAcceptInputType_disabled: BooleanInput;
    static ngAcceptInputType_disableRipple: BooleanInput;
    static ngAcceptInputType_tabIndex: NumberInput;
}
/**
 * Link inside of a `mat-tab-nav-bar`.
 */
export declare class MatTabLink extends _MatTabLinkBase implements OnDestroy {
    /** Reference to the RippleRenderer for the tab-link. */
    private _tabLinkRipple;
    constructor(tabNavBar: MatTabNav, elementRef: ElementRef, ngZone: NgZone, platform: Platform, globalRippleOptions: RippleGlobalOptions | null, tabIndex: string, focusMonitor: FocusMonitor, animationMode?: string);
    ngOnDestroy(): void;
}
export {};
