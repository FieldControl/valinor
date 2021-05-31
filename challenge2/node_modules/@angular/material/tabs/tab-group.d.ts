/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { AfterContentChecked, AfterContentInit, ChangeDetectorRef, ElementRef, EventEmitter, OnDestroy, QueryList } from '@angular/core';
import { FocusOrigin } from '@angular/cdk/a11y';
import { CanColor, CanColorCtor, CanDisableRipple, CanDisableRippleCtor, ThemePalette } from '@angular/material/core';
import { MatTab } from './tab';
import { MatTabsConfig } from './tab-config';
/** A simple change event emitted on focus or selection changes. */
export declare class MatTabChangeEvent {
    /** Index of the currently-selected tab. */
    index: number;
    /** Reference to the currently-selected tab. */
    tab: MatTab;
}
/** Possible positions for the tab header. */
export declare type MatTabHeaderPosition = 'above' | 'below';
/** @docs-private */
declare class MatTabGroupMixinBase {
    _elementRef: ElementRef;
    constructor(_elementRef: ElementRef);
}
declare const _MatTabGroupMixinBase: CanColorCtor & CanDisableRippleCtor & typeof MatTabGroupMixinBase;
interface MatTabGroupBaseHeader {
    _alignInkBarToSelectedTab: () => void;
    focusIndex: number;
}
/**
 * Base class with all of the `MatTabGroupBase` functionality.
 * @docs-private
 */
export declare abstract class _MatTabGroupBase extends _MatTabGroupMixinBase implements AfterContentInit, AfterContentChecked, OnDestroy, CanColor, CanDisableRipple {
    protected _changeDetectorRef: ChangeDetectorRef;
    _animationMode?: string | undefined;
    /**
     * All tabs inside the tab group. This includes tabs that belong to groups that are nested
     * inside the current one. We filter out only the tabs that belong to this group in `_tabs`.
     */
    abstract _allTabs: QueryList<MatTab>;
    abstract _tabBodyWrapper: ElementRef;
    abstract _tabHeader: MatTabGroupBaseHeader;
    /** All of the tabs that belong to the group. */
    _tabs: QueryList<MatTab>;
    /** The tab index that should be selected after the content has been checked. */
    private _indexToSelect;
    /** Snapshot of the height of the tab body wrapper before another tab is activated. */
    private _tabBodyWrapperHeight;
    /** Subscription to tabs being added/removed. */
    private _tabsSubscription;
    /** Subscription to changes in the tab labels. */
    private _tabLabelSubscription;
    /** Whether the tab group should grow to the size of the active tab. */
    get dynamicHeight(): boolean;
    set dynamicHeight(value: boolean);
    private _dynamicHeight;
    /** The index of the active tab. */
    get selectedIndex(): number | null;
    set selectedIndex(value: number | null);
    private _selectedIndex;
    /** Position of the tab header. */
    headerPosition: MatTabHeaderPosition;
    /** Duration for the tab animation. Will be normalized to milliseconds if no units are set. */
    get animationDuration(): string;
    set animationDuration(value: string);
    private _animationDuration;
    /**
     * Whether pagination should be disabled. This can be used to avoid unnecessary
     * layout recalculations if it's known that pagination won't be required.
     */
    disablePagination: boolean;
    /** Background color of the tab group. */
    get backgroundColor(): ThemePalette;
    set backgroundColor(value: ThemePalette);
    private _backgroundColor;
    /** Output to enable support for two-way binding on `[(selectedIndex)]` */
    readonly selectedIndexChange: EventEmitter<number>;
    /** Event emitted when focus has changed within a tab group. */
    readonly focusChange: EventEmitter<MatTabChangeEvent>;
    /** Event emitted when the body animation has completed */
    readonly animationDone: EventEmitter<void>;
    /** Event emitted when the tab selection has changed. */
    readonly selectedTabChange: EventEmitter<MatTabChangeEvent>;
    private _groupId;
    constructor(elementRef: ElementRef, _changeDetectorRef: ChangeDetectorRef, defaultConfig?: MatTabsConfig, _animationMode?: string | undefined);
    /**
     * After the content is checked, this component knows what tabs have been defined
     * and what the selected index should be. This is where we can know exactly what position
     * each tab should be in according to the new selected index, and additionally we know how
     * a new selected tab should transition in (from the left or right).
     */
    ngAfterContentChecked(): void;
    ngAfterContentInit(): void;
    /** Listens to changes in all of the tabs. */
    private _subscribeToAllTabChanges;
    ngOnDestroy(): void;
    /** Re-aligns the ink bar to the selected tab element. */
    realignInkBar(): void;
    /**
     * Sets focus to a particular tab.
     * @param index Index of the tab to be focused.
     */
    focusTab(index: number): void;
    _focusChanged(index: number): void;
    private _createChangeEvent;
    /**
     * Subscribes to changes in the tab labels. This is needed, because the @Input for the label is
     * on the MatTab component, whereas the data binding is inside the MatTabGroup. In order for the
     * binding to be updated, we need to subscribe to changes in it and trigger change detection
     * manually.
     */
    private _subscribeToTabLabels;
    /** Clamps the given index to the bounds of 0 and the tabs length. */
    private _clampTabIndex;
    /** Returns a unique id for each tab label element */
    _getTabLabelId(i: number): string;
    /** Returns a unique id for each tab content element */
    _getTabContentId(i: number): string;
    /**
     * Sets the height of the body wrapper to the height of the activating tab if dynamic
     * height property is true.
     */
    _setTabBodyWrapperHeight(tabHeight: number): void;
    /** Removes the height of the tab body wrapper. */
    _removeTabBodyWrapperHeight(): void;
    /** Handle click events, setting new selected index if appropriate. */
    _handleClick(tab: MatTab, tabHeader: MatTabGroupBaseHeader, index: number): void;
    /** Retrieves the tabindex for the tab. */
    _getTabIndex(tab: MatTab, idx: number): number | null;
    /** Callback for when the focused state of a tab has changed. */
    _tabFocusChanged(focusOrigin: FocusOrigin, index: number): void;
    static ngAcceptInputType_dynamicHeight: BooleanInput;
    static ngAcceptInputType_animationDuration: NumberInput;
    static ngAcceptInputType_selectedIndex: NumberInput;
    static ngAcceptInputType_disableRipple: BooleanInput;
}
/**
 * Material design tab-group component. Supports basic tab pairs (label + content) and includes
 * animated ink-bar, keyboard navigation, and screen reader.
 * See: https://material.io/design/components/tabs.html
 */
export declare class MatTabGroup extends _MatTabGroupBase {
    _allTabs: QueryList<MatTab>;
    _tabBodyWrapper: ElementRef;
    _tabHeader: MatTabGroupBaseHeader;
    constructor(elementRef: ElementRef, changeDetectorRef: ChangeDetectorRef, defaultConfig?: MatTabsConfig, animationMode?: string);
}
export {};
