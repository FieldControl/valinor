/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChildren, Directive, ElementRef, EventEmitter, Inject, Input, Optional, Output, QueryList, ViewChild, ViewEncapsulation, } from '@angular/core';
import { ANIMATION_MODULE_TYPE } from '@angular/platform-browser/animations';
import { MAT_TAB_GROUP, MatTab } from './tab';
import { MatTabHeader } from './tab-header';
import { coerceBooleanProperty, coerceNumberProperty, } from '@angular/cdk/coercion';
import { mixinColor, mixinDisableRipple, } from '@angular/material/core';
import { merge, Subscription } from 'rxjs';
import { MAT_TABS_CONFIG } from './tab-config';
import { startWith } from 'rxjs/operators';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
import * as i2 from "@angular/cdk/portal";
import * as i3 from "@angular/material/core";
import * as i4 from "@angular/cdk/a11y";
import * as i5 from "./tab-body";
import * as i6 from "./tab-label-wrapper";
import * as i7 from "./tab-header";
/** Used to generate unique ID's for each tab component */
let nextId = 0;
// Boilerplate for applying mixins to MatTabGroup.
/** @docs-private */
const _MatTabGroupMixinBase = mixinColor(mixinDisableRipple(class {
    constructor(_elementRef) {
        this._elementRef = _elementRef;
    }
}), 'primary');
/**
 * Base class with all of the `MatTabGroupBase` functionality.
 * @docs-private
 */
export class _MatTabGroupBase extends _MatTabGroupMixinBase {
    /** Whether the tab group should grow to the size of the active tab. */
    get dynamicHeight() {
        return this._dynamicHeight;
    }
    set dynamicHeight(value) {
        this._dynamicHeight = coerceBooleanProperty(value);
    }
    /** The index of the active tab. */
    get selectedIndex() {
        return this._selectedIndex;
    }
    set selectedIndex(value) {
        this._indexToSelect = coerceNumberProperty(value, null);
    }
    /** Duration for the tab animation. Will be normalized to milliseconds if no units are set. */
    get animationDuration() {
        return this._animationDuration;
    }
    set animationDuration(value) {
        this._animationDuration = /^\d+$/.test(value + '') ? value + 'ms' : value;
    }
    /**
     * `tabindex` to be set on the inner element that wraps the tab content. Can be used for improved
     * accessibility when the tab does not have focusable elements or if it has scrollable content.
     * The `tabindex` will be removed automatically for inactive tabs.
     * Read more at https://www.w3.org/TR/wai-aria-practices/examples/tabs/tabs-2/tabs.html
     */
    get contentTabIndex() {
        return this._contentTabIndex;
    }
    set contentTabIndex(value) {
        this._contentTabIndex = coerceNumberProperty(value, null);
    }
    /**
     * Whether pagination should be disabled. This can be used to avoid unnecessary
     * layout recalculations if it's known that pagination won't be required.
     */
    get disablePagination() {
        return this._disablePagination;
    }
    set disablePagination(value) {
        this._disablePagination = coerceBooleanProperty(value);
    }
    /**
     * By default tabs remove their content from the DOM while it's off-screen.
     * Setting this to `true` will keep it in the DOM which will prevent elements
     * like iframes and videos from reloading next time it comes back into the view.
     */
    get preserveContent() {
        return this._preserveContent;
    }
    set preserveContent(value) {
        this._preserveContent = coerceBooleanProperty(value);
    }
    /** Background color of the tab group. */
    get backgroundColor() {
        return this._backgroundColor;
    }
    set backgroundColor(value) {
        const classList = this._elementRef.nativeElement.classList;
        classList.remove('mat-tabs-with-background', `mat-background-${this.backgroundColor}`);
        if (value) {
            classList.add('mat-tabs-with-background', `mat-background-${value}`);
        }
        this._backgroundColor = value;
    }
    constructor(elementRef, _changeDetectorRef, defaultConfig, _animationMode) {
        super(elementRef);
        this._changeDetectorRef = _changeDetectorRef;
        this._animationMode = _animationMode;
        /** All of the tabs that belong to the group. */
        this._tabs = new QueryList();
        /** The tab index that should be selected after the content has been checked. */
        this._indexToSelect = 0;
        /** Index of the tab that was focused last. */
        this._lastFocusedTabIndex = null;
        /** Snapshot of the height of the tab body wrapper before another tab is activated. */
        this._tabBodyWrapperHeight = 0;
        /** Subscription to tabs being added/removed. */
        this._tabsSubscription = Subscription.EMPTY;
        /** Subscription to changes in the tab labels. */
        this._tabLabelSubscription = Subscription.EMPTY;
        this._dynamicHeight = false;
        this._selectedIndex = null;
        /** Position of the tab header. */
        this.headerPosition = 'above';
        this._disablePagination = false;
        this._preserveContent = false;
        /** Output to enable support for two-way binding on `[(selectedIndex)]` */
        this.selectedIndexChange = new EventEmitter();
        /** Event emitted when focus has changed within a tab group. */
        this.focusChange = new EventEmitter();
        /** Event emitted when the body animation has completed */
        this.animationDone = new EventEmitter();
        /** Event emitted when the tab selection has changed. */
        this.selectedTabChange = new EventEmitter(true);
        this._groupId = nextId++;
        this.animationDuration =
            defaultConfig && defaultConfig.animationDuration ? defaultConfig.animationDuration : '500ms';
        this.disablePagination =
            defaultConfig && defaultConfig.disablePagination != null
                ? defaultConfig.disablePagination
                : false;
        this.dynamicHeight =
            defaultConfig && defaultConfig.dynamicHeight != null ? defaultConfig.dynamicHeight : false;
        this.contentTabIndex = defaultConfig?.contentTabIndex ?? null;
        this.preserveContent = !!defaultConfig?.preserveContent;
    }
    /**
     * After the content is checked, this component knows what tabs have been defined
     * and what the selected index should be. This is where we can know exactly what position
     * each tab should be in according to the new selected index, and additionally we know how
     * a new selected tab should transition in (from the left or right).
     */
    ngAfterContentChecked() {
        // Don't clamp the `indexToSelect` immediately in the setter because it can happen that
        // the amount of tabs changes before the actual change detection runs.
        const indexToSelect = (this._indexToSelect = this._clampTabIndex(this._indexToSelect));
        // If there is a change in selected index, emit a change event. Should not trigger if
        // the selected index has not yet been initialized.
        if (this._selectedIndex != indexToSelect) {
            const isFirstRun = this._selectedIndex == null;
            if (!isFirstRun) {
                this.selectedTabChange.emit(this._createChangeEvent(indexToSelect));
                // Preserve the height so page doesn't scroll up during tab change.
                // Fixes https://stackblitz.com/edit/mat-tabs-scroll-page-top-on-tab-change
                const wrapper = this._tabBodyWrapper.nativeElement;
                wrapper.style.minHeight = wrapper.clientHeight + 'px';
            }
            // Changing these values after change detection has run
            // since the checked content may contain references to them.
            Promise.resolve().then(() => {
                this._tabs.forEach((tab, index) => (tab.isActive = index === indexToSelect));
                if (!isFirstRun) {
                    this.selectedIndexChange.emit(indexToSelect);
                    // Clear the min-height, this was needed during tab change to avoid
                    // unnecessary scrolling.
                    this._tabBodyWrapper.nativeElement.style.minHeight = '';
                }
            });
        }
        // Setup the position for each tab and optionally setup an origin on the next selected tab.
        this._tabs.forEach((tab, index) => {
            tab.position = index - indexToSelect;
            // If there is already a selected tab, then set up an origin for the next selected tab
            // if it doesn't have one already.
            if (this._selectedIndex != null && tab.position == 0 && !tab.origin) {
                tab.origin = indexToSelect - this._selectedIndex;
            }
        });
        if (this._selectedIndex !== indexToSelect) {
            this._selectedIndex = indexToSelect;
            this._lastFocusedTabIndex = null;
            this._changeDetectorRef.markForCheck();
        }
    }
    ngAfterContentInit() {
        this._subscribeToAllTabChanges();
        this._subscribeToTabLabels();
        // Subscribe to changes in the amount of tabs, in order to be
        // able to re-render the content as new tabs are added or removed.
        this._tabsSubscription = this._tabs.changes.subscribe(() => {
            const indexToSelect = this._clampTabIndex(this._indexToSelect);
            // Maintain the previously-selected tab if a new tab is added or removed and there is no
            // explicit change that selects a different tab.
            if (indexToSelect === this._selectedIndex) {
                const tabs = this._tabs.toArray();
                let selectedTab;
                for (let i = 0; i < tabs.length; i++) {
                    if (tabs[i].isActive) {
                        // Assign both to the `_indexToSelect` and `_selectedIndex` so we don't fire a changed
                        // event, otherwise the consumer may end up in an infinite loop in some edge cases like
                        // adding a tab within the `selectedIndexChange` event.
                        this._indexToSelect = this._selectedIndex = i;
                        this._lastFocusedTabIndex = null;
                        selectedTab = tabs[i];
                        break;
                    }
                }
                // If we haven't found an active tab and a tab exists at the selected index, it means
                // that the active tab was swapped out. Since this won't be picked up by the rendering
                // loop in `ngAfterContentChecked`, we need to sync it up manually.
                if (!selectedTab && tabs[indexToSelect]) {
                    Promise.resolve().then(() => {
                        tabs[indexToSelect].isActive = true;
                        this.selectedTabChange.emit(this._createChangeEvent(indexToSelect));
                    });
                }
            }
            this._changeDetectorRef.markForCheck();
        });
    }
    /** Listens to changes in all of the tabs. */
    _subscribeToAllTabChanges() {
        // Since we use a query with `descendants: true` to pick up the tabs, we may end up catching
        // some that are inside of nested tab groups. We filter them out manually by checking that
        // the closest group to the tab is the current one.
        this._allTabs.changes.pipe(startWith(this._allTabs)).subscribe((tabs) => {
            this._tabs.reset(tabs.filter(tab => {
                return tab._closestTabGroup === this || !tab._closestTabGroup;
            }));
            this._tabs.notifyOnChanges();
        });
    }
    ngOnDestroy() {
        this._tabs.destroy();
        this._tabsSubscription.unsubscribe();
        this._tabLabelSubscription.unsubscribe();
    }
    /** Re-aligns the ink bar to the selected tab element. */
    realignInkBar() {
        if (this._tabHeader) {
            this._tabHeader._alignInkBarToSelectedTab();
        }
    }
    /**
     * Recalculates the tab group's pagination dimensions.
     *
     * WARNING: Calling this method can be very costly in terms of performance. It should be called
     * as infrequently as possible from outside of the Tabs component as it causes a reflow of the
     * page.
     */
    updatePagination() {
        if (this._tabHeader) {
            this._tabHeader.updatePagination();
        }
    }
    /**
     * Sets focus to a particular tab.
     * @param index Index of the tab to be focused.
     */
    focusTab(index) {
        const header = this._tabHeader;
        if (header) {
            header.focusIndex = index;
        }
    }
    _focusChanged(index) {
        this._lastFocusedTabIndex = index;
        this.focusChange.emit(this._createChangeEvent(index));
    }
    _createChangeEvent(index) {
        const event = new MatTabChangeEvent();
        event.index = index;
        if (this._tabs && this._tabs.length) {
            event.tab = this._tabs.toArray()[index];
        }
        return event;
    }
    /**
     * Subscribes to changes in the tab labels. This is needed, because the @Input for the label is
     * on the MatTab component, whereas the data binding is inside the MatTabGroup. In order for the
     * binding to be updated, we need to subscribe to changes in it and trigger change detection
     * manually.
     */
    _subscribeToTabLabels() {
        if (this._tabLabelSubscription) {
            this._tabLabelSubscription.unsubscribe();
        }
        this._tabLabelSubscription = merge(...this._tabs.map(tab => tab._stateChanges)).subscribe(() => this._changeDetectorRef.markForCheck());
    }
    /** Clamps the given index to the bounds of 0 and the tabs length. */
    _clampTabIndex(index) {
        // Note the `|| 0`, which ensures that values like NaN can't get through
        // and which would otherwise throw the component into an infinite loop
        // (since Math.max(NaN, 0) === NaN).
        return Math.min(this._tabs.length - 1, Math.max(index || 0, 0));
    }
    /** Returns a unique id for each tab label element */
    _getTabLabelId(i) {
        return `mat-tab-label-${this._groupId}-${i}`;
    }
    /** Returns a unique id for each tab content element */
    _getTabContentId(i) {
        return `mat-tab-content-${this._groupId}-${i}`;
    }
    /**
     * Sets the height of the body wrapper to the height of the activating tab if dynamic
     * height property is true.
     */
    _setTabBodyWrapperHeight(tabHeight) {
        if (!this._dynamicHeight || !this._tabBodyWrapperHeight) {
            return;
        }
        const wrapper = this._tabBodyWrapper.nativeElement;
        wrapper.style.height = this._tabBodyWrapperHeight + 'px';
        // This conditional forces the browser to paint the height so that
        // the animation to the new height can have an origin.
        if (this._tabBodyWrapper.nativeElement.offsetHeight) {
            wrapper.style.height = tabHeight + 'px';
        }
    }
    /** Removes the height of the tab body wrapper. */
    _removeTabBodyWrapperHeight() {
        const wrapper = this._tabBodyWrapper.nativeElement;
        this._tabBodyWrapperHeight = wrapper.clientHeight;
        wrapper.style.height = '';
        this.animationDone.emit();
    }
    /** Handle click events, setting new selected index if appropriate. */
    _handleClick(tab, tabHeader, index) {
        tabHeader.focusIndex = index;
        if (!tab.disabled) {
            this.selectedIndex = index;
        }
    }
    /** Retrieves the tabindex for the tab. */
    _getTabIndex(index) {
        const targetIndex = this._lastFocusedTabIndex ?? this.selectedIndex;
        return index === targetIndex ? 0 : -1;
    }
    /** Callback for when the focused state of a tab has changed. */
    _tabFocusChanged(focusOrigin, index) {
        // Mouse/touch focus happens during the `mousedown`/`touchstart` phase which
        // can cause the tab to be moved out from under the pointer, interrupting the
        // click sequence (see #21898). We don't need to scroll the tab into view for
        // such cases anyway, because it will be done when the tab becomes selected.
        if (focusOrigin && focusOrigin !== 'mouse' && focusOrigin !== 'touch') {
            this._tabHeader.focusIndex = index;
        }
    }
}
_MatTabGroupBase.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: _MatTabGroupBase, deps: [{ token: i0.ElementRef }, { token: i0.ChangeDetectorRef }, { token: MAT_TABS_CONFIG, optional: true }, { token: ANIMATION_MODULE_TYPE, optional: true }], target: i0.ɵɵFactoryTarget.Directive });
_MatTabGroupBase.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "15.2.0-rc.0", type: _MatTabGroupBase, inputs: { dynamicHeight: "dynamicHeight", selectedIndex: "selectedIndex", headerPosition: "headerPosition", animationDuration: "animationDuration", contentTabIndex: "contentTabIndex", disablePagination: "disablePagination", preserveContent: "preserveContent", backgroundColor: "backgroundColor" }, outputs: { selectedIndexChange: "selectedIndexChange", focusChange: "focusChange", animationDone: "animationDone", selectedTabChange: "selectedTabChange" }, usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: _MatTabGroupBase, decorators: [{
            type: Directive
        }], ctorParameters: function () { return [{ type: i0.ElementRef }, { type: i0.ChangeDetectorRef }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [MAT_TABS_CONFIG]
                }, {
                    type: Optional
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [ANIMATION_MODULE_TYPE]
                }] }]; }, propDecorators: { dynamicHeight: [{
                type: Input
            }], selectedIndex: [{
                type: Input
            }], headerPosition: [{
                type: Input
            }], animationDuration: [{
                type: Input
            }], contentTabIndex: [{
                type: Input
            }], disablePagination: [{
                type: Input
            }], preserveContent: [{
                type: Input
            }], backgroundColor: [{
                type: Input
            }], selectedIndexChange: [{
                type: Output
            }], focusChange: [{
                type: Output
            }], animationDone: [{
                type: Output
            }], selectedTabChange: [{
                type: Output
            }] } });
/**
 * Material design tab-group component. Supports basic tab pairs (label + content) and includes
 * animated ink-bar, keyboard navigation, and screen reader.
 * See: https://material.io/design/components/tabs.html
 */
export class MatTabGroup extends _MatTabGroupBase {
    /** Whether the ink bar should fit its width to the size of the tab label content. */
    get fitInkBarToContent() {
        return this._fitInkBarToContent;
    }
    set fitInkBarToContent(v) {
        this._fitInkBarToContent = coerceBooleanProperty(v);
        this._changeDetectorRef.markForCheck();
    }
    /** Whether tabs should be stretched to fill the header. */
    get stretchTabs() {
        return this._stretchTabs;
    }
    set stretchTabs(v) {
        this._stretchTabs = coerceBooleanProperty(v);
    }
    constructor(elementRef, changeDetectorRef, defaultConfig, animationMode) {
        super(elementRef, changeDetectorRef, defaultConfig, animationMode);
        this._fitInkBarToContent = false;
        this._stretchTabs = true;
        this.fitInkBarToContent =
            defaultConfig && defaultConfig.fitInkBarToContent != null
                ? defaultConfig.fitInkBarToContent
                : false;
    }
}
MatTabGroup.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: MatTabGroup, deps: [{ token: i0.ElementRef }, { token: i0.ChangeDetectorRef }, { token: MAT_TABS_CONFIG, optional: true }, { token: ANIMATION_MODULE_TYPE, optional: true }], target: i0.ɵɵFactoryTarget.Component });
MatTabGroup.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "15.2.0-rc.0", type: MatTabGroup, selector: "mat-tab-group", inputs: { color: "color", disableRipple: "disableRipple", fitInkBarToContent: "fitInkBarToContent", stretchTabs: ["mat-stretch-tabs", "stretchTabs"] }, host: { properties: { "class.mat-mdc-tab-group-dynamic-height": "dynamicHeight", "class.mat-mdc-tab-group-inverted-header": "headerPosition === \"below\"", "class.mat-mdc-tab-group-stretch-tabs": "stretchTabs" }, classAttribute: "mat-mdc-tab-group" }, providers: [
        {
            provide: MAT_TAB_GROUP,
            useExisting: MatTabGroup,
        },
    ], queries: [{ propertyName: "_allTabs", predicate: MatTab, descendants: true }], viewQueries: [{ propertyName: "_tabBodyWrapper", first: true, predicate: ["tabBodyWrapper"], descendants: true }, { propertyName: "_tabHeader", first: true, predicate: ["tabHeader"], descendants: true }], exportAs: ["matTabGroup"], usesInheritance: true, ngImport: i0, template: "<mat-tab-header #tabHeader\n                [selectedIndex]=\"selectedIndex || 0\"\n                [disableRipple]=\"disableRipple\"\n                [disablePagination]=\"disablePagination\"\n                (indexFocused)=\"_focusChanged($event)\"\n                (selectFocusedIndex)=\"selectedIndex = $event\">\n\n  <div class=\"mdc-tab mat-mdc-tab mat-mdc-focus-indicator\"\n       #tabNode\n       role=\"tab\"\n       matTabLabelWrapper\n       cdkMonitorElementFocus\n       *ngFor=\"let tab of _tabs; let i = index\"\n       [id]=\"_getTabLabelId(i)\"\n       [attr.tabIndex]=\"_getTabIndex(i)\"\n       [attr.aria-posinset]=\"i + 1\"\n       [attr.aria-setsize]=\"_tabs.length\"\n       [attr.aria-controls]=\"_getTabContentId(i)\"\n       [attr.aria-selected]=\"selectedIndex === i\"\n       [attr.aria-label]=\"tab.ariaLabel || null\"\n       [attr.aria-labelledby]=\"(!tab.ariaLabel && tab.ariaLabelledby) ? tab.ariaLabelledby : null\"\n       [class.mdc-tab--active]=\"selectedIndex === i\"\n       [ngClass]=\"tab.labelClass\"\n       [disabled]=\"tab.disabled\"\n       [fitInkBarToContent]=\"fitInkBarToContent\"\n       (click)=\"_handleClick(tab, tabHeader, i)\"\n       (cdkFocusChange)=\"_tabFocusChanged($event, i)\">\n    <span class=\"mdc-tab__ripple\"></span>\n\n    <!-- Needs to be a separate element, because we can't put\n         `overflow: hidden` on tab due to the ink bar. -->\n    <div\n      class=\"mat-mdc-tab-ripple\"\n      mat-ripple\n      [matRippleTrigger]=\"tabNode\"\n      [matRippleDisabled]=\"tab.disabled || disableRipple\"></div>\n\n    <span class=\"mdc-tab__content\">\n      <span class=\"mdc-tab__text-label\">\n        <!-- If there is a label template, use it. -->\n        <ng-template [ngIf]=\"tab.templateLabel\" [ngIfElse]=\"tabTextLabel\">\n          <ng-template [cdkPortalOutlet]=\"tab.templateLabel\"></ng-template>\n        </ng-template>\n\n        <!-- If there is not a label template, fall back to the text label. -->\n        <ng-template #tabTextLabel>{{tab.textLabel}}</ng-template>\n      </span>\n    </span>\n  </div>\n</mat-tab-header>\n\n<div\n  class=\"mat-mdc-tab-body-wrapper\"\n  [class._mat-animation-noopable]=\"_animationMode === 'NoopAnimations'\"\n  #tabBodyWrapper>\n  <mat-tab-body role=\"tabpanel\"\n               *ngFor=\"let tab of _tabs; let i = index\"\n               [id]=\"_getTabContentId(i)\"\n               [attr.tabindex]=\"(contentTabIndex != null && selectedIndex === i) ? contentTabIndex : null\"\n               [attr.aria-labelledby]=\"_getTabLabelId(i)\"\n               [class.mat-mdc-tab-body-active]=\"selectedIndex === i\"\n               [ngClass]=\"tab.bodyClass\"\n               [content]=\"tab.content!\"\n               [position]=\"tab.position!\"\n               [origin]=\"tab.origin\"\n               [animationDuration]=\"animationDuration\"\n               [preserveContent]=\"preserveContent\"\n               (_onCentered)=\"_removeTabBodyWrapperHeight()\"\n               (_onCentering)=\"_setTabBodyWrapperHeight($event)\">\n  </mat-tab-body>\n</div>\n", styles: [".mdc-tab{min-width:90px;padding-right:24px;padding-left:24px;display:flex;flex:1 0 auto;justify-content:center;box-sizing:border-box;margin:0;padding-top:0;padding-bottom:0;border:none;outline:none;text-align:center;white-space:nowrap;cursor:pointer;-webkit-appearance:none;z-index:1}.mdc-tab::-moz-focus-inner{padding:0;border:0}.mdc-tab[hidden]{display:none}.mdc-tab--min-width{flex:0 1 auto}.mdc-tab__content{display:flex;align-items:center;justify-content:center;height:inherit;pointer-events:none}.mdc-tab__text-label{transition:150ms color linear;display:inline-block;line-height:1;z-index:2}.mdc-tab__icon{transition:150ms color linear;z-index:2}.mdc-tab--stacked .mdc-tab__content{flex-direction:column;align-items:center;justify-content:center}.mdc-tab--stacked .mdc-tab__text-label{padding-top:6px;padding-bottom:4px}.mdc-tab--active .mdc-tab__text-label,.mdc-tab--active .mdc-tab__icon{transition-delay:100ms}.mdc-tab:not(.mdc-tab--stacked) .mdc-tab__icon+.mdc-tab__text-label{padding-left:8px;padding-right:0}[dir=rtl] .mdc-tab:not(.mdc-tab--stacked) .mdc-tab__icon+.mdc-tab__text-label,.mdc-tab:not(.mdc-tab--stacked) .mdc-tab__icon+.mdc-tab__text-label[dir=rtl]{padding-left:0;padding-right:8px}.mdc-tab-indicator .mdc-tab-indicator__content--underline{border-top-width:2px}.mdc-tab-indicator .mdc-tab-indicator__content--icon{height:34px;font-size:34px}.mdc-tab-indicator{display:flex;position:absolute;top:0;left:0;justify-content:center;width:100%;height:100%;pointer-events:none;z-index:1}.mdc-tab-indicator__content{transform-origin:left;opacity:0}.mdc-tab-indicator__content--underline{align-self:flex-end;box-sizing:border-box;width:100%;border-top-style:solid}.mdc-tab-indicator__content--icon{align-self:center;margin:0 auto}.mdc-tab-indicator--active .mdc-tab-indicator__content{opacity:1}.mdc-tab-indicator .mdc-tab-indicator__content{transition:250ms transform cubic-bezier(0.4, 0, 0.2, 1)}.mdc-tab-indicator--no-transition .mdc-tab-indicator__content{transition:none}.mdc-tab-indicator--fade .mdc-tab-indicator__content{transition:150ms opacity linear}.mdc-tab-indicator--active.mdc-tab-indicator--fade .mdc-tab-indicator__content{transition-delay:100ms}.mat-mdc-tab-ripple{position:absolute;top:0;left:0;bottom:0;right:0;pointer-events:none}.mat-mdc-tab{-webkit-tap-highlight-color:rgba(0,0,0,0)}.mat-mdc-tab.mdc-tab{height:48px;flex-grow:0}.mat-mdc-tab .mdc-tab__ripple::before{content:\"\";display:block;position:absolute;top:0;left:0;right:0;bottom:0;opacity:0;pointer-events:none}.mat-mdc-tab .mdc-tab__text-label{display:inline-flex;align-items:center}.mat-mdc-tab .mdc-tab__content{position:relative;pointer-events:auto}.mat-mdc-tab:hover .mdc-tab__ripple::before{opacity:.04}.mat-mdc-tab.cdk-program-focused .mdc-tab__ripple::before,.mat-mdc-tab.cdk-keyboard-focused .mdc-tab__ripple::before{opacity:.12}.mat-mdc-tab .mat-ripple-element{opacity:.12}.mat-mdc-tab-group.mat-mdc-tab-group-stretch-tabs>.mat-mdc-tab-header .mat-mdc-tab{flex-grow:1}.mat-mdc-tab-disabled{opacity:.4}.mat-mdc-tab-group{display:flex;flex-direction:column;max-width:100%}.mat-mdc-tab-group.mat-tabs-with-background>.mat-mdc-tab-header,.mat-mdc-tab-group.mat-tabs-with-background>.mat-mdc-tab-header-pagination{background-color:var(--mat-mdc-tab-header-with-background-background-color, transparent)}.mat-mdc-tab-group.mat-tabs-with-background>.mat-mdc-tab-header .mat-mdc-tab .mdc-tab__text-label,.mat-mdc-tab-group.mat-tabs-with-background>.mat-mdc-tab-header .mat-mdc-tab-link .mdc-tab__text-label{color:var(--mat-mdc-tab-header-with-background-foreground-color, inherit)}.mat-mdc-tab-group.mat-tabs-with-background>.mat-mdc-tab-header .mdc-tab-indicator__content--underline,.mat-mdc-tab-group.mat-tabs-with-background>.mat-mdc-tab-header .mat-mdc-tab-header-pagination-chevron,.mat-mdc-tab-group.mat-tabs-with-background>.mat-mdc-tab-header .mat-mdc-focus-indicator::before{border-color:var(--mat-mdc-tab-header-with-background-foreground-color, inherit)}.mat-mdc-tab-group.mat-tabs-with-background>.mat-mdc-tab-header .mat-ripple-element,.mat-mdc-tab-group.mat-tabs-with-background>.mat-mdc-tab-header .mdc-tab__ripple::before,.mat-mdc-tab-group.mat-tabs-with-background>.mat-mdc-tab-header-pagination .mat-ripple-element,.mat-mdc-tab-group.mat-tabs-with-background>.mat-mdc-tab-header-pagination .mdc-tab__ripple::before{background-color:var(--mat-mdc-tab-header-with-background-foreground-color, inherit)}.mat-mdc-tab-group.mat-tabs-with-background>.mat-mdc-tab-header .mat-mdc-tab-header-pagination-chevron,.mat-mdc-tab-group.mat-tabs-with-background>.mat-mdc-tab-header-pagination .mat-mdc-tab-header-pagination-chevron{border-color:var(--mat-mdc-tab-header-with-background-foreground-color, inherit)}.mat-mdc-tab-group.mat-mdc-tab-group-inverted-header{flex-direction:column-reverse}.mat-mdc-tab-group.mat-mdc-tab-group-inverted-header .mdc-tab-indicator__content--underline{align-self:flex-start}.mat-mdc-tab-body-wrapper{position:relative;overflow:hidden;display:flex;transition:height 500ms cubic-bezier(0.35, 0, 0.25, 1)}.mat-mdc-tab-body-wrapper._mat-animation-noopable{transition:none !important;animation:none !important}"], dependencies: [{ kind: "directive", type: i1.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: i1.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: i2.CdkPortalOutlet, selector: "[cdkPortalOutlet]", inputs: ["cdkPortalOutlet"], outputs: ["attached"], exportAs: ["cdkPortalOutlet"] }, { kind: "directive", type: i3.MatRipple, selector: "[mat-ripple], [matRipple]", inputs: ["matRippleColor", "matRippleUnbounded", "matRippleCentered", "matRippleRadius", "matRippleAnimation", "matRippleDisabled", "matRippleTrigger"], exportAs: ["matRipple"] }, { kind: "directive", type: i4.CdkMonitorFocus, selector: "[cdkMonitorElementFocus], [cdkMonitorSubtreeFocus]", outputs: ["cdkFocusChange"], exportAs: ["cdkMonitorFocus"] }, { kind: "component", type: i5.MatTabBody, selector: "mat-tab-body" }, { kind: "directive", type: i6.MatTabLabelWrapper, selector: "[matTabLabelWrapper]", inputs: ["disabled", "fitInkBarToContent"] }, { kind: "component", type: i7.MatTabHeader, selector: "mat-tab-header", inputs: ["selectedIndex"], outputs: ["selectFocusedIndex", "indexFocused"] }], changeDetection: i0.ChangeDetectionStrategy.Default, encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: MatTabGroup, decorators: [{
            type: Component,
            args: [{ selector: 'mat-tab-group', exportAs: 'matTabGroup', encapsulation: ViewEncapsulation.None, changeDetection: ChangeDetectionStrategy.Default, inputs: ['color', 'disableRipple'], providers: [
                        {
                            provide: MAT_TAB_GROUP,
                            useExisting: MatTabGroup,
                        },
                    ], host: {
                        'class': 'mat-mdc-tab-group',
                        '[class.mat-mdc-tab-group-dynamic-height]': 'dynamicHeight',
                        '[class.mat-mdc-tab-group-inverted-header]': 'headerPosition === "below"',
                        '[class.mat-mdc-tab-group-stretch-tabs]': 'stretchTabs',
                    }, template: "<mat-tab-header #tabHeader\n                [selectedIndex]=\"selectedIndex || 0\"\n                [disableRipple]=\"disableRipple\"\n                [disablePagination]=\"disablePagination\"\n                (indexFocused)=\"_focusChanged($event)\"\n                (selectFocusedIndex)=\"selectedIndex = $event\">\n\n  <div class=\"mdc-tab mat-mdc-tab mat-mdc-focus-indicator\"\n       #tabNode\n       role=\"tab\"\n       matTabLabelWrapper\n       cdkMonitorElementFocus\n       *ngFor=\"let tab of _tabs; let i = index\"\n       [id]=\"_getTabLabelId(i)\"\n       [attr.tabIndex]=\"_getTabIndex(i)\"\n       [attr.aria-posinset]=\"i + 1\"\n       [attr.aria-setsize]=\"_tabs.length\"\n       [attr.aria-controls]=\"_getTabContentId(i)\"\n       [attr.aria-selected]=\"selectedIndex === i\"\n       [attr.aria-label]=\"tab.ariaLabel || null\"\n       [attr.aria-labelledby]=\"(!tab.ariaLabel && tab.ariaLabelledby) ? tab.ariaLabelledby : null\"\n       [class.mdc-tab--active]=\"selectedIndex === i\"\n       [ngClass]=\"tab.labelClass\"\n       [disabled]=\"tab.disabled\"\n       [fitInkBarToContent]=\"fitInkBarToContent\"\n       (click)=\"_handleClick(tab, tabHeader, i)\"\n       (cdkFocusChange)=\"_tabFocusChanged($event, i)\">\n    <span class=\"mdc-tab__ripple\"></span>\n\n    <!-- Needs to be a separate element, because we can't put\n         `overflow: hidden` on tab due to the ink bar. -->\n    <div\n      class=\"mat-mdc-tab-ripple\"\n      mat-ripple\n      [matRippleTrigger]=\"tabNode\"\n      [matRippleDisabled]=\"tab.disabled || disableRipple\"></div>\n\n    <span class=\"mdc-tab__content\">\n      <span class=\"mdc-tab__text-label\">\n        <!-- If there is a label template, use it. -->\n        <ng-template [ngIf]=\"tab.templateLabel\" [ngIfElse]=\"tabTextLabel\">\n          <ng-template [cdkPortalOutlet]=\"tab.templateLabel\"></ng-template>\n        </ng-template>\n\n        <!-- If there is not a label template, fall back to the text label. -->\n        <ng-template #tabTextLabel>{{tab.textLabel}}</ng-template>\n      </span>\n    </span>\n  </div>\n</mat-tab-header>\n\n<div\n  class=\"mat-mdc-tab-body-wrapper\"\n  [class._mat-animation-noopable]=\"_animationMode === 'NoopAnimations'\"\n  #tabBodyWrapper>\n  <mat-tab-body role=\"tabpanel\"\n               *ngFor=\"let tab of _tabs; let i = index\"\n               [id]=\"_getTabContentId(i)\"\n               [attr.tabindex]=\"(contentTabIndex != null && selectedIndex === i) ? contentTabIndex : null\"\n               [attr.aria-labelledby]=\"_getTabLabelId(i)\"\n               [class.mat-mdc-tab-body-active]=\"selectedIndex === i\"\n               [ngClass]=\"tab.bodyClass\"\n               [content]=\"tab.content!\"\n               [position]=\"tab.position!\"\n               [origin]=\"tab.origin\"\n               [animationDuration]=\"animationDuration\"\n               [preserveContent]=\"preserveContent\"\n               (_onCentered)=\"_removeTabBodyWrapperHeight()\"\n               (_onCentering)=\"_setTabBodyWrapperHeight($event)\">\n  </mat-tab-body>\n</div>\n", styles: [".mdc-tab{min-width:90px;padding-right:24px;padding-left:24px;display:flex;flex:1 0 auto;justify-content:center;box-sizing:border-box;margin:0;padding-top:0;padding-bottom:0;border:none;outline:none;text-align:center;white-space:nowrap;cursor:pointer;-webkit-appearance:none;z-index:1}.mdc-tab::-moz-focus-inner{padding:0;border:0}.mdc-tab[hidden]{display:none}.mdc-tab--min-width{flex:0 1 auto}.mdc-tab__content{display:flex;align-items:center;justify-content:center;height:inherit;pointer-events:none}.mdc-tab__text-label{transition:150ms color linear;display:inline-block;line-height:1;z-index:2}.mdc-tab__icon{transition:150ms color linear;z-index:2}.mdc-tab--stacked .mdc-tab__content{flex-direction:column;align-items:center;justify-content:center}.mdc-tab--stacked .mdc-tab__text-label{padding-top:6px;padding-bottom:4px}.mdc-tab--active .mdc-tab__text-label,.mdc-tab--active .mdc-tab__icon{transition-delay:100ms}.mdc-tab:not(.mdc-tab--stacked) .mdc-tab__icon+.mdc-tab__text-label{padding-left:8px;padding-right:0}[dir=rtl] .mdc-tab:not(.mdc-tab--stacked) .mdc-tab__icon+.mdc-tab__text-label,.mdc-tab:not(.mdc-tab--stacked) .mdc-tab__icon+.mdc-tab__text-label[dir=rtl]{padding-left:0;padding-right:8px}.mdc-tab-indicator .mdc-tab-indicator__content--underline{border-top-width:2px}.mdc-tab-indicator .mdc-tab-indicator__content--icon{height:34px;font-size:34px}.mdc-tab-indicator{display:flex;position:absolute;top:0;left:0;justify-content:center;width:100%;height:100%;pointer-events:none;z-index:1}.mdc-tab-indicator__content{transform-origin:left;opacity:0}.mdc-tab-indicator__content--underline{align-self:flex-end;box-sizing:border-box;width:100%;border-top-style:solid}.mdc-tab-indicator__content--icon{align-self:center;margin:0 auto}.mdc-tab-indicator--active .mdc-tab-indicator__content{opacity:1}.mdc-tab-indicator .mdc-tab-indicator__content{transition:250ms transform cubic-bezier(0.4, 0, 0.2, 1)}.mdc-tab-indicator--no-transition .mdc-tab-indicator__content{transition:none}.mdc-tab-indicator--fade .mdc-tab-indicator__content{transition:150ms opacity linear}.mdc-tab-indicator--active.mdc-tab-indicator--fade .mdc-tab-indicator__content{transition-delay:100ms}.mat-mdc-tab-ripple{position:absolute;top:0;left:0;bottom:0;right:0;pointer-events:none}.mat-mdc-tab{-webkit-tap-highlight-color:rgba(0,0,0,0)}.mat-mdc-tab.mdc-tab{height:48px;flex-grow:0}.mat-mdc-tab .mdc-tab__ripple::before{content:\"\";display:block;position:absolute;top:0;left:0;right:0;bottom:0;opacity:0;pointer-events:none}.mat-mdc-tab .mdc-tab__text-label{display:inline-flex;align-items:center}.mat-mdc-tab .mdc-tab__content{position:relative;pointer-events:auto}.mat-mdc-tab:hover .mdc-tab__ripple::before{opacity:.04}.mat-mdc-tab.cdk-program-focused .mdc-tab__ripple::before,.mat-mdc-tab.cdk-keyboard-focused .mdc-tab__ripple::before{opacity:.12}.mat-mdc-tab .mat-ripple-element{opacity:.12}.mat-mdc-tab-group.mat-mdc-tab-group-stretch-tabs>.mat-mdc-tab-header .mat-mdc-tab{flex-grow:1}.mat-mdc-tab-disabled{opacity:.4}.mat-mdc-tab-group{display:flex;flex-direction:column;max-width:100%}.mat-mdc-tab-group.mat-tabs-with-background>.mat-mdc-tab-header,.mat-mdc-tab-group.mat-tabs-with-background>.mat-mdc-tab-header-pagination{background-color:var(--mat-mdc-tab-header-with-background-background-color, transparent)}.mat-mdc-tab-group.mat-tabs-with-background>.mat-mdc-tab-header .mat-mdc-tab .mdc-tab__text-label,.mat-mdc-tab-group.mat-tabs-with-background>.mat-mdc-tab-header .mat-mdc-tab-link .mdc-tab__text-label{color:var(--mat-mdc-tab-header-with-background-foreground-color, inherit)}.mat-mdc-tab-group.mat-tabs-with-background>.mat-mdc-tab-header .mdc-tab-indicator__content--underline,.mat-mdc-tab-group.mat-tabs-with-background>.mat-mdc-tab-header .mat-mdc-tab-header-pagination-chevron,.mat-mdc-tab-group.mat-tabs-with-background>.mat-mdc-tab-header .mat-mdc-focus-indicator::before{border-color:var(--mat-mdc-tab-header-with-background-foreground-color, inherit)}.mat-mdc-tab-group.mat-tabs-with-background>.mat-mdc-tab-header .mat-ripple-element,.mat-mdc-tab-group.mat-tabs-with-background>.mat-mdc-tab-header .mdc-tab__ripple::before,.mat-mdc-tab-group.mat-tabs-with-background>.mat-mdc-tab-header-pagination .mat-ripple-element,.mat-mdc-tab-group.mat-tabs-with-background>.mat-mdc-tab-header-pagination .mdc-tab__ripple::before{background-color:var(--mat-mdc-tab-header-with-background-foreground-color, inherit)}.mat-mdc-tab-group.mat-tabs-with-background>.mat-mdc-tab-header .mat-mdc-tab-header-pagination-chevron,.mat-mdc-tab-group.mat-tabs-with-background>.mat-mdc-tab-header-pagination .mat-mdc-tab-header-pagination-chevron{border-color:var(--mat-mdc-tab-header-with-background-foreground-color, inherit)}.mat-mdc-tab-group.mat-mdc-tab-group-inverted-header{flex-direction:column-reverse}.mat-mdc-tab-group.mat-mdc-tab-group-inverted-header .mdc-tab-indicator__content--underline{align-self:flex-start}.mat-mdc-tab-body-wrapper{position:relative;overflow:hidden;display:flex;transition:height 500ms cubic-bezier(0.35, 0, 0.25, 1)}.mat-mdc-tab-body-wrapper._mat-animation-noopable{transition:none !important;animation:none !important}"] }]
        }], ctorParameters: function () { return [{ type: i0.ElementRef }, { type: i0.ChangeDetectorRef }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [MAT_TABS_CONFIG]
                }, {
                    type: Optional
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [ANIMATION_MODULE_TYPE]
                }] }]; }, propDecorators: { _allTabs: [{
                type: ContentChildren,
                args: [MatTab, { descendants: true }]
            }], _tabBodyWrapper: [{
                type: ViewChild,
                args: ['tabBodyWrapper']
            }], _tabHeader: [{
                type: ViewChild,
                args: ['tabHeader']
            }], fitInkBarToContent: [{
                type: Input
            }], stretchTabs: [{
                type: Input,
                args: ['mat-stretch-tabs']
            }] } });
/** A simple change event emitted on focus or selection changes. */
export class MatTabChangeEvent {
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFiLWdyb3VwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL3RhYnMvdGFiLWdyb3VwLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL3RhYnMvdGFiLWdyb3VwLmh0bWwiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUdMLHVCQUF1QixFQUN2QixpQkFBaUIsRUFDakIsU0FBUyxFQUNULGVBQWUsRUFDZixTQUFTLEVBQ1QsVUFBVSxFQUNWLFlBQVksRUFDWixNQUFNLEVBQ04sS0FBSyxFQUVMLFFBQVEsRUFDUixNQUFNLEVBQ04sU0FBUyxFQUNULFNBQVMsRUFDVCxpQkFBaUIsR0FDbEIsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLHFCQUFxQixFQUFDLE1BQU0sc0NBQXNDLENBQUM7QUFDM0UsT0FBTyxFQUFDLGFBQWEsRUFBRSxNQUFNLEVBQUMsTUFBTSxPQUFPLENBQUM7QUFDNUMsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUMxQyxPQUFPLEVBRUwscUJBQXFCLEVBQ3JCLG9CQUFvQixHQUVyQixNQUFNLHVCQUF1QixDQUFDO0FBQy9CLE9BQU8sRUFHTCxVQUFVLEVBQ1Ysa0JBQWtCLEdBRW5CLE1BQU0sd0JBQXdCLENBQUM7QUFDaEMsT0FBTyxFQUFDLEtBQUssRUFBRSxZQUFZLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDekMsT0FBTyxFQUFDLGVBQWUsRUFBZ0IsTUFBTSxjQUFjLENBQUM7QUFDNUQsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLGdCQUFnQixDQUFDOzs7Ozs7Ozs7QUFHekMsMERBQTBEO0FBQzFELElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQztBQUVmLGtEQUFrRDtBQUNsRCxvQkFBb0I7QUFDcEIsTUFBTSxxQkFBcUIsR0FBRyxVQUFVLENBQ3RDLGtCQUFrQixDQUNoQjtJQUNF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QUNILHFCQUFxQjtpR0E5QmhDLFdBQVcsNGJBYlg7UUFDVDtZQUNFLE9BQU8sRUFBRSxhQUFhO1lBQ3RCLFdBQVcsRUFBRSxXQUFXO1NBQ3pCO0tBQ0YsbURBU2dCLE1BQU0sK1NDcGhCekIsNGdHQXVFQTtnR0Q0Y2EsV0FBVztrQkF0QnZCLFNBQVM7K0JBQ0UsZUFBZSxZQUNmLGFBQWEsaUJBR1IsaUJBQWlCLENBQUMsSUFBSSxtQkFFcEIsdUJBQXVCLENBQUMsT0FBTyxVQUN4QyxDQUFDLE9BQU8sRUFBRSxlQUFlLENBQUMsYUFDdkI7d0JBQ1Q7NEJBQ0UsT0FBTyxFQUFFLGFBQWE7NEJBQ3RCLFdBQVcsYUFBYTt5QkFDekI7cUJBQ0YsUUFDSzt3QkFDSixPQUFPLEVBQUUsbUJBQW1CO3dCQUM1QiwwQ0FBMEMsRUFBRSxlQUFlO3dCQUMzRCwyQ0FBMkMsRUFBRSw0QkFBNEI7d0JBQ3pFLHdDQUF3QyxFQUFFLGFBQWE7cUJBQ3hEOzswQkErQkUsTUFBTTsyQkFBQyxlQUFlOzswQkFBRyxRQUFROzswQkFDakMsUUFBUTs7MEJBQUksTUFBTTsyQkFBQyxxQkFBcUI7NENBN0JHLFFBQVE7c0JBQXJELGVBQWU7dUJBQUMsTUFBTSxFQUFFLEVBQUMsV0FBVyxFQUFFLElBQUksRUFBQztnQkFDZixlQUFlO3NCQUEzQyxTQUFTO3VCQUFDLGdCQUFnQjtnQkFDSCxVQUFVO3NCQUFqQyxTQUFTO3VCQUFDLFdBQVc7Z0JBSWxCLGtCQUFrQjtzQkFEckIsS0FBSztnQkFZRixXQUFXO3NCQURkLEtBQUs7dUJBQUMsa0JBQWtCOztBQXVCM0IsbUVBQW1FO0FBQ25FLE1BQU0sT0FBTyxpQkFBaUI7Q0FLN0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgQWZ0ZXJDb250ZW50Q2hlY2tlZCxcbiAgQWZ0ZXJDb250ZW50SW5pdCxcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBDb21wb25lbnQsXG4gIENvbnRlbnRDaGlsZHJlbixcbiAgRGlyZWN0aXZlLFxuICBFbGVtZW50UmVmLFxuICBFdmVudEVtaXR0ZXIsXG4gIEluamVjdCxcbiAgSW5wdXQsXG4gIE9uRGVzdHJveSxcbiAgT3B0aW9uYWwsXG4gIE91dHB1dCxcbiAgUXVlcnlMaXN0LFxuICBWaWV3Q2hpbGQsXG4gIFZpZXdFbmNhcHN1bGF0aW9uLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7QU5JTUFUSU9OX01PRFVMRV9UWVBFfSBmcm9tICdAYW5ndWxhci9wbGF0Zm9ybS1icm93c2VyL2FuaW1hdGlvbnMnO1xuaW1wb3J0IHtNQVRfVEFCX0dST1VQLCBNYXRUYWJ9IGZyb20gJy4vdGFiJztcbmltcG9ydCB7TWF0VGFiSGVhZGVyfSBmcm9tICcuL3RhYi1oZWFkZXInO1xuaW1wb3J0IHtcbiAgQm9vbGVhbklucHV0LFxuICBjb2VyY2VCb29sZWFuUHJvcGVydHksXG4gIGNvZXJjZU51bWJlclByb3BlcnR5LFxuICBOdW1iZXJJbnB1dCxcbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcbmltcG9ydCB7XG4gIENhbkNvbG9yLFxuICBDYW5EaXNhYmxlUmlwcGxlLFxuICBtaXhpbkNvbG9yLFxuICBtaXhpbkRpc2FibGVSaXBwbGUsXG4gIFRoZW1lUGFsZXR0ZSxcbn0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvY29yZSc7XG5pbXBvcnQge21lcmdlLCBTdWJzY3JpcHRpb259IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtNQVRfVEFCU19DT05GSUcsIE1hdFRhYnNDb25maWd9IGZyb20gJy4vdGFiLWNvbmZpZyc7XG5pbXBvcnQge3N0YXJ0V2l0aH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHtGb2N1c09yaWdpbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL2ExMXknO1xuXG4vKiogVXNlZCB0byBnZW5lcmF0ZSB1bmlxdWUgSUQncyBmb3IgZWFjaCB0YWIgY29tcG9uZW50ICovXG5sZXQgbmV4dElkID0gMDtcblxuLy8gQm9pbGVycGxhdGUgZm9yIGFwcGx5aW5nIG1peGlucyB0byBNYXRUYWJHcm91cC5cbi8qKiBAZG9jcy1wcml2YXRlICovXG5jb25zdCBfTWF0VGFiR3JvdXBNaXhpbkJhc2UgPSBtaXhpbkNvbG9yKFxuICBtaXhpbkRpc2FibGVSaXBwbGUoXG4gICAgY2xhc3Mge1xuICAgICAgY29uc3RydWN0b3IocHVibGljIF9lbGVtZW50UmVmOiBFbGVtZW50UmVmKSB7fVxuICAgIH0sXG4gICksXG4gICdwcmltYXJ5Jyxcbik7XG5cbi8qKiBAZG9jcy1wcml2YXRlICovXG5leHBvcnQgaW50ZXJmYWNlIE1hdFRhYkdyb3VwQmFzZUhlYWRlciB7XG4gIF9hbGlnbklua0JhclRvU2VsZWN0ZWRUYWIoKTogdm9pZDtcbiAgdXBkYXRlUGFnaW5hdGlvbigpOiB2b2lkO1xuICBmb2N1c0luZGV4OiBudW1iZXI7XG59XG5cbi8qKiBQb3NzaWJsZSBwb3NpdGlvbnMgZm9yIHRoZSB0YWIgaGVhZGVyLiAqL1xuZXhwb3J0IHR5cGUgTWF0VGFiSGVhZGVyUG9zaXRpb24gPSAnYWJvdmUnIHwgJ2JlbG93JztcblxuLyoqXG4gKiBCYXNlIGNsYXNzIHdpdGggYWxsIG9mIHRoZSBgTWF0VGFiR3JvdXBCYXNlYCBmdW5jdGlvbmFsaXR5LlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5ARGlyZWN0aXZlKClcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBfTWF0VGFiR3JvdXBCYXNlXG4gIGV4dGVuZHMgX01hdFRhYkdyb3VwTWl4aW5CYXNlXG4gIGltcGxlbWVudHMgQWZ0ZXJDb250ZW50SW5pdCwgQWZ0ZXJDb250ZW50Q2hlY2tlZCwgT25EZXN0cm95LCBDYW5Db2xvciwgQ2FuRGlzYWJsZVJpcHBsZVxue1xuICAvKipcbiAgICogQWxsIHRhYnMgaW5zaWRlIHRoZSB0YWIgZ3JvdXAuIFRoaXMgaW5jbHVkZXMgdGFicyB0aGF0IGJlbG9uZyB0byBncm91cHMgdGhhdCBhcmUgbmVzdGVkXG4gICAqIGluc2lkZSB0aGUgY3VycmVudCBvbmUuIFdlIGZpbHRlciBvdXQgb25seSB0aGUgdGFicyB0aGF0IGJlbG9uZyB0byB0aGlzIGdyb3VwIGluIGBfdGFic2AuXG4gICAqL1xuICBhYnN0cmFjdCBfYWxsVGFiczogUXVlcnlMaXN0PE1hdFRhYj47XG4gIGFic3RyYWN0IF90YWJCb2R5V3JhcHBlcjogRWxlbWVudFJlZjtcbiAgYWJzdHJhY3QgX3RhYkhlYWRlcjogTWF0VGFiR3JvdXBCYXNlSGVhZGVyO1xuXG4gIC8qKiBBbGwgb2YgdGhlIHRhYnMgdGhhdCBiZWxvbmcgdG8gdGhlIGdyb3VwLiAqL1xuICBfdGFiczogUXVlcnlMaXN0PE1hdFRhYj4gPSBuZXcgUXVlcnlMaXN0PE1hdFRhYj4oKTtcblxuICAvKiogVGhlIHRhYiBpbmRleCB0aGF0IHNob3VsZCBiZSBzZWxlY3RlZCBhZnRlciB0aGUgY29udGVudCBoYXMgYmVlbiBjaGVja2VkLiAqL1xuICBwcml2YXRlIF9pbmRleFRvU2VsZWN0OiBudW1iZXIgfCBudWxsID0gMDtcblxuICAvKiogSW5kZXggb2YgdGhlIHRhYiB0aGF0IHdhcyBmb2N1c2VkIGxhc3QuICovXG4gIHByaXZhdGUgX2xhc3RGb2N1c2VkVGFiSW5kZXg6IG51bWJlciB8IG51bGwgPSBudWxsO1xuXG4gIC8qKiBTbmFwc2hvdCBvZiB0aGUgaGVpZ2h0IG9mIHRoZSB0YWIgYm9keSB3cmFwcGVyIGJlZm9yZSBhbm90aGVyIHRhYiBpcyBhY3RpdmF0ZWQuICovXG4gIHByaXZhdGUgX3RhYkJvZHlXcmFwcGVySGVpZ2h0OiBudW1iZXIgPSAwO1xuXG4gIC8qKiBTdWJzY3JpcHRpb24gdG8gdGFicyBiZWluZyBhZGRlZC9yZW1vdmVkLiAqL1xuICBwcml2YXRlIF90YWJzU3Vic2NyaXB0aW9uID0gU3Vic2NyaXB0aW9uLkVNUFRZO1xuXG4gIC8qKiBTdWJzY3JpcHRpb24gdG8gY2hhbmdlcyBpbiB0aGUgdGFiIGxhYmVscy4gKi9cbiAgcHJpdmF0ZSBfdGFiTGFiZWxTdWJzY3JpcHRpb24gPSBTdWJzY3JpcHRpb24uRU1QVFk7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIHRhYiBncm91cCBzaG91bGQgZ3JvdyB0byB0aGUgc2l6ZSBvZiB0aGUgYWN0aXZlIHRhYi4gKi9cbiAgQElucHV0KClcbiAgZ2V0IGR5bmFtaWNIZWlnaHQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2R5bmFtaWNIZWlnaHQ7XG4gIH1cblxuICBzZXQgZHluYW1pY0hlaWdodCh2YWx1ZTogQm9vbGVhbklucHV0KSB7XG4gICAgdGhpcy5fZHluYW1pY0hlaWdodCA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSh2YWx1ZSk7XG4gIH1cblxuICBwcml2YXRlIF9keW5hbWljSGVpZ2h0OiBib29sZWFuID0gZmFsc2U7XG5cbiAgLyoqIFRoZSBpbmRleCBvZiB0aGUgYWN0aXZlIHRhYi4gKi9cbiAgQElucHV0KClcbiAgZ2V0IHNlbGVjdGVkSW5kZXgoKTogbnVtYmVyIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX3NlbGVjdGVkSW5kZXg7XG4gIH1cblxuICBzZXQgc2VsZWN0ZWRJbmRleCh2YWx1ZTogTnVtYmVySW5wdXQpIHtcbiAgICB0aGlzLl9pbmRleFRvU2VsZWN0ID0gY29lcmNlTnVtYmVyUHJvcGVydHkodmFsdWUsIG51bGwpO1xuICB9XG5cbiAgcHJpdmF0ZSBfc2VsZWN0ZWRJbmRleDogbnVtYmVyIHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqIFBvc2l0aW9uIG9mIHRoZSB0YWIgaGVhZGVyLiAqL1xuICBASW5wdXQoKSBoZWFkZXJQb3NpdGlvbjogTWF0VGFiSGVhZGVyUG9zaXRpb24gPSAnYWJvdmUnO1xuXG4gIC8qKiBEdXJhdGlvbiBmb3IgdGhlIHRhYiBhbmltYXRpb24uIFdpbGwgYmUgbm9ybWFsaXplZCB0byBtaWxsaXNlY29uZHMgaWYgbm8gdW5pdHMgYXJlIHNldC4gKi9cbiAgQElucHV0KClcbiAgZ2V0IGFuaW1hdGlvbkR1cmF0aW9uKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2FuaW1hdGlvbkR1cmF0aW9uO1xuICB9XG5cbiAgc2V0IGFuaW1hdGlvbkR1cmF0aW9uKHZhbHVlOiBOdW1iZXJJbnB1dCkge1xuICAgIHRoaXMuX2FuaW1hdGlvbkR1cmF0aW9uID0gL15cXGQrJC8udGVzdCh2YWx1ZSArICcnKSA/IHZhbHVlICsgJ21zJyA6ICh2YWx1ZSBhcyBzdHJpbmcpO1xuICB9XG5cbiAgcHJpdmF0ZSBfYW5pbWF0aW9uRHVyYXRpb246IHN0cmluZztcblxuICAvKipcbiAgICogYHRhYmluZGV4YCB0byBiZSBzZXQgb24gdGhlIGlubmVyIGVsZW1lbnQgdGhhdCB3cmFwcyB0aGUgdGFiIGNvbnRlbnQuIENhbiBiZSB1c2VkIGZvciBpbXByb3ZlZFxuICAgKiBhY2Nlc3NpYmlsaXR5IHdoZW4gdGhlIHRhYiBkb2VzIG5vdCBoYXZlIGZvY3VzYWJsZSBlbGVtZW50cyBvciBpZiBpdCBoYXMgc2Nyb2xsYWJsZSBjb250ZW50LlxuICAgKiBUaGUgYHRhYmluZGV4YCB3aWxsIGJlIHJlbW92ZWQgYXV0b21hdGljYWxseSBmb3IgaW5hY3RpdmUgdGFicy5cbiAgICogUmVhZCBtb3JlIGF0IGh0dHBzOi8vd3d3LnczLm9yZy9UUi93YWktYXJpYS1wcmFjdGljZXMvZXhhbXBsZXMvdGFicy90YWJzLTIvdGFicy5odG1sXG4gICAqL1xuICBASW5wdXQoKVxuICBnZXQgY29udGVudFRhYkluZGV4KCk6IG51bWJlciB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLl9jb250ZW50VGFiSW5kZXg7XG4gIH1cblxuICBzZXQgY29udGVudFRhYkluZGV4KHZhbHVlOiBOdW1iZXJJbnB1dCkge1xuICAgIHRoaXMuX2NvbnRlbnRUYWJJbmRleCA9IGNvZXJjZU51bWJlclByb3BlcnR5KHZhbHVlLCBudWxsKTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbnRlbnRUYWJJbmRleDogbnVtYmVyIHwgbnVsbDtcblxuICAvKipcbiAgICogV2hldGhlciBwYWdpbmF0aW9uIHNob3VsZCBiZSBkaXNhYmxlZC4gVGhpcyBjYW4gYmUgdXNlZCB0byBhdm9pZCB1bm5lY2Vzc2FyeVxuICAgKiBsYXlvdXQgcmVjYWxjdWxhdGlvbnMgaWYgaXQncyBrbm93biB0aGF0IHBhZ2luYXRpb24gd29uJ3QgYmUgcmVxdWlyZWQuXG4gICAqL1xuICBASW5wdXQoKVxuICBnZXQgZGlzYWJsZVBhZ2luYXRpb24oKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2Rpc2FibGVQYWdpbmF0aW9uO1xuICB9XG5cbiAgc2V0IGRpc2FibGVQYWdpbmF0aW9uKHZhbHVlOiBCb29sZWFuSW5wdXQpIHtcbiAgICB0aGlzLl9kaXNhYmxlUGFnaW5hdGlvbiA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSh2YWx1ZSk7XG4gIH1cblxuICBwcml2YXRlIF9kaXNhYmxlUGFnaW5hdGlvbjogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBCeSBkZWZhdWx0IHRhYnMgcmVtb3ZlIHRoZWlyIGNvbnRlbnQgZnJvbSB0aGUgRE9NIHdoaWxlIGl0J3Mgb2ZmLXNjcmVlbi5cbiAgICogU2V0dGluZyB0aGlzIHRvIGB0cnVlYCB3aWxsIGtlZXAgaXQgaW4gdGhlIERPTSB3aGljaCB3aWxsIHByZXZlbnQgZWxlbWVudHNcbiAgICogbGlrZSBpZnJhbWVzIGFuZCB2aWRlb3MgZnJvbSByZWxvYWRpbmcgbmV4dCB0aW1lIGl0IGNvbWVzIGJhY2sgaW50byB0aGUgdmlldy5cbiAgICovXG4gIEBJbnB1dCgpXG4gIGdldCBwcmVzZXJ2ZUNvbnRlbnQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX3ByZXNlcnZlQ29udGVudDtcbiAgfVxuXG4gIHNldCBwcmVzZXJ2ZUNvbnRlbnQodmFsdWU6IEJvb2xlYW5JbnB1dCkge1xuICAgIHRoaXMuX3ByZXNlcnZlQ29udGVudCA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSh2YWx1ZSk7XG4gIH1cblxuICBwcml2YXRlIF9wcmVzZXJ2ZUNvbnRlbnQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAvKiogQmFja2dyb3VuZCBjb2xvciBvZiB0aGUgdGFiIGdyb3VwLiAqL1xuICBASW5wdXQoKVxuICBnZXQgYmFja2dyb3VuZENvbG9yKCk6IFRoZW1lUGFsZXR0ZSB7XG4gICAgcmV0dXJuIHRoaXMuX2JhY2tncm91bmRDb2xvcjtcbiAgfVxuXG4gIHNldCBiYWNrZ3JvdW5kQ29sb3IodmFsdWU6IFRoZW1lUGFsZXR0ZSkge1xuICAgIGNvbnN0IGNsYXNzTGlzdDogRE9NVG9rZW5MaXN0ID0gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmNsYXNzTGlzdDtcblxuICAgIGNsYXNzTGlzdC5yZW1vdmUoJ21hdC10YWJzLXdpdGgtYmFja2dyb3VuZCcsIGBtYXQtYmFja2dyb3VuZC0ke3RoaXMuYmFja2dyb3VuZENvbG9yfWApO1xuXG4gICAgaWYgKHZhbHVlKSB7XG4gICAgICBjbGFzc0xpc3QuYWRkKCdtYXQtdGFicy13aXRoLWJhY2tncm91bmQnLCBgbWF0LWJhY2tncm91bmQtJHt2YWx1ZX1gKTtcbiAgICB9XG5cbiAgICB0aGlzLl9iYWNrZ3JvdW5kQ29sb3IgPSB2YWx1ZTtcbiAgfVxuXG4gIHByaXZhdGUgX2JhY2tncm91bmRDb2xvcjogVGhlbWVQYWxldHRlO1xuXG4gIC8qKiBPdXRwdXQgdG8gZW5hYmxlIHN1cHBvcnQgZm9yIHR3by13YXkgYmluZGluZyBvbiBgWyhzZWxlY3RlZEluZGV4KV1gICovXG4gIEBPdXRwdXQoKSByZWFkb25seSBzZWxlY3RlZEluZGV4Q2hhbmdlOiBFdmVudEVtaXR0ZXI8bnVtYmVyPiA9IG5ldyBFdmVudEVtaXR0ZXI8bnVtYmVyPigpO1xuXG4gIC8qKiBFdmVudCBlbWl0dGVkIHdoZW4gZm9jdXMgaGFzIGNoYW5nZWQgd2l0aGluIGEgdGFiIGdyb3VwLiAqL1xuICBAT3V0cHV0KCkgcmVhZG9ubHkgZm9jdXNDaGFuZ2U6IEV2ZW50RW1pdHRlcjxNYXRUYWJDaGFuZ2VFdmVudD4gPVxuICAgIG5ldyBFdmVudEVtaXR0ZXI8TWF0VGFiQ2hhbmdlRXZlbnQ+KCk7XG5cbiAgLyoqIEV2ZW50IGVtaXR0ZWQgd2hlbiB0aGUgYm9keSBhbmltYXRpb24gaGFzIGNvbXBsZXRlZCAqL1xuICBAT3V0cHV0KCkgcmVhZG9ubHkgYW5pbWF0aW9uRG9uZTogRXZlbnRFbWl0dGVyPHZvaWQ+ID0gbmV3IEV2ZW50RW1pdHRlcjx2b2lkPigpO1xuXG4gIC8qKiBFdmVudCBlbWl0dGVkIHdoZW4gdGhlIHRhYiBzZWxlY3Rpb24gaGFzIGNoYW5nZWQuICovXG4gIEBPdXRwdXQoKSByZWFkb25seSBzZWxlY3RlZFRhYkNoYW5nZTogRXZlbnRFbWl0dGVyPE1hdFRhYkNoYW5nZUV2ZW50PiA9XG4gICAgbmV3IEV2ZW50RW1pdHRlcjxNYXRUYWJDaGFuZ2VFdmVudD4odHJ1ZSk7XG5cbiAgcHJpdmF0ZSBfZ3JvdXBJZDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYsXG4gICAgcHJvdGVjdGVkIF9jaGFuZ2VEZXRlY3RvclJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gICAgQEluamVjdChNQVRfVEFCU19DT05GSUcpIEBPcHRpb25hbCgpIGRlZmF1bHRDb25maWc/OiBNYXRUYWJzQ29uZmlnLFxuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoQU5JTUFUSU9OX01PRFVMRV9UWVBFKSBwdWJsaWMgX2FuaW1hdGlvbk1vZGU/OiBzdHJpbmcsXG4gICkge1xuICAgIHN1cGVyKGVsZW1lbnRSZWYpO1xuICAgIHRoaXMuX2dyb3VwSWQgPSBuZXh0SWQrKztcbiAgICB0aGlzLmFuaW1hdGlvbkR1cmF0aW9uID1cbiAgICAgIGRlZmF1bHRDb25maWcgJiYgZGVmYXVsdENvbmZpZy5hbmltYXRpb25EdXJhdGlvbiA/IGRlZmF1bHRDb25maWcuYW5pbWF0aW9uRHVyYXRpb24gOiAnNTAwbXMnO1xuICAgIHRoaXMuZGlzYWJsZVBhZ2luYXRpb24gPVxuICAgICAgZGVmYXVsdENvbmZpZyAmJiBkZWZhdWx0Q29uZmlnLmRpc2FibGVQYWdpbmF0aW9uICE9IG51bGxcbiAgICAgICAgPyBkZWZhdWx0Q29uZmlnLmRpc2FibGVQYWdpbmF0aW9uXG4gICAgICAgIDogZmFsc2U7XG4gICAgdGhpcy5keW5hbWljSGVpZ2h0ID1cbiAgICAgIGRlZmF1bHRDb25maWcgJiYgZGVmYXVsdENvbmZpZy5keW5hbWljSGVpZ2h0ICE9IG51bGwgPyBkZWZhdWx0Q29uZmlnLmR5bmFtaWNIZWlnaHQgOiBmYWxzZTtcbiAgICB0aGlzLmNvbnRlbnRUYWJJbmRleCA9IGRlZmF1bHRDb25maWc/LmNvbnRlbnRUYWJJbmRleCA/PyBudWxsO1xuICAgIHRoaXMucHJlc2VydmVDb250ZW50ID0gISFkZWZhdWx0Q29uZmlnPy5wcmVzZXJ2ZUNvbnRlbnQ7XG4gIH1cblxuICAvKipcbiAgICogQWZ0ZXIgdGhlIGNvbnRlbnQgaXMgY2hlY2tlZCwgdGhpcyBjb21wb25lbnQga25vd3Mgd2hhdCB0YWJzIGhhdmUgYmVlbiBkZWZpbmVkXG4gICAqIGFuZCB3aGF0IHRoZSBzZWxlY3RlZCBpbmRleCBzaG91bGQgYmUuIFRoaXMgaXMgd2hlcmUgd2UgY2FuIGtub3cgZXhhY3RseSB3aGF0IHBvc2l0aW9uXG4gICAqIGVhY2ggdGFiIHNob3VsZCBiZSBpbiBhY2NvcmRpbmcgdG8gdGhlIG5ldyBzZWxlY3RlZCBpbmRleCwgYW5kIGFkZGl0aW9uYWxseSB3ZSBrbm93IGhvd1xuICAgKiBhIG5ldyBzZWxlY3RlZCB0YWIgc2hvdWxkIHRyYW5zaXRpb24gaW4gKGZyb20gdGhlIGxlZnQgb3IgcmlnaHQpLlxuICAgKi9cbiAgbmdBZnRlckNvbnRlbnRDaGVja2VkKCkge1xuICAgIC8vIERvbid0IGNsYW1wIHRoZSBgaW5kZXhUb1NlbGVjdGAgaW1tZWRpYXRlbHkgaW4gdGhlIHNldHRlciBiZWNhdXNlIGl0IGNhbiBoYXBwZW4gdGhhdFxuICAgIC8vIHRoZSBhbW91bnQgb2YgdGFicyBjaGFuZ2VzIGJlZm9yZSB0aGUgYWN0dWFsIGNoYW5nZSBkZXRlY3Rpb24gcnVucy5cbiAgICBjb25zdCBpbmRleFRvU2VsZWN0ID0gKHRoaXMuX2luZGV4VG9TZWxlY3QgPSB0aGlzLl9jbGFtcFRhYkluZGV4KHRoaXMuX2luZGV4VG9TZWxlY3QpKTtcblxuICAgIC8vIElmIHRoZXJlIGlzIGEgY2hhbmdlIGluIHNlbGVjdGVkIGluZGV4LCBlbWl0IGEgY2hhbmdlIGV2ZW50LiBTaG91bGQgbm90IHRyaWdnZXIgaWZcbiAgICAvLyB0aGUgc2VsZWN0ZWQgaW5kZXggaGFzIG5vdCB5ZXQgYmVlbiBpbml0aWFsaXplZC5cbiAgICBpZiAodGhpcy5fc2VsZWN0ZWRJbmRleCAhPSBpbmRleFRvU2VsZWN0KSB7XG4gICAgICBjb25zdCBpc0ZpcnN0UnVuID0gdGhpcy5fc2VsZWN0ZWRJbmRleCA9PSBudWxsO1xuXG4gICAgICBpZiAoIWlzRmlyc3RSdW4pIHtcbiAgICAgICAgdGhpcy5zZWxlY3RlZFRhYkNoYW5nZS5lbWl0KHRoaXMuX2NyZWF0ZUNoYW5nZUV2ZW50KGluZGV4VG9TZWxlY3QpKTtcbiAgICAgICAgLy8gUHJlc2VydmUgdGhlIGhlaWdodCBzbyBwYWdlIGRvZXNuJ3Qgc2Nyb2xsIHVwIGR1cmluZyB0YWIgY2hhbmdlLlxuICAgICAgICAvLyBGaXhlcyBodHRwczovL3N0YWNrYmxpdHouY29tL2VkaXQvbWF0LXRhYnMtc2Nyb2xsLXBhZ2UtdG9wLW9uLXRhYi1jaGFuZ2VcbiAgICAgICAgY29uc3Qgd3JhcHBlciA9IHRoaXMuX3RhYkJvZHlXcmFwcGVyLm5hdGl2ZUVsZW1lbnQ7XG4gICAgICAgIHdyYXBwZXIuc3R5bGUubWluSGVpZ2h0ID0gd3JhcHBlci5jbGllbnRIZWlnaHQgKyAncHgnO1xuICAgICAgfVxuXG4gICAgICAvLyBDaGFuZ2luZyB0aGVzZSB2YWx1ZXMgYWZ0ZXIgY2hhbmdlIGRldGVjdGlvbiBoYXMgcnVuXG4gICAgICAvLyBzaW5jZSB0aGUgY2hlY2tlZCBjb250ZW50IG1heSBjb250YWluIHJlZmVyZW5jZXMgdG8gdGhlbS5cbiAgICAgIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oKCkgPT4ge1xuICAgICAgICB0aGlzLl90YWJzLmZvckVhY2goKHRhYiwgaW5kZXgpID0+ICh0YWIuaXNBY3RpdmUgPSBpbmRleCA9PT0gaW5kZXhUb1NlbGVjdCkpO1xuXG4gICAgICAgIGlmICghaXNGaXJzdFJ1bikge1xuICAgICAgICAgIHRoaXMuc2VsZWN0ZWRJbmRleENoYW5nZS5lbWl0KGluZGV4VG9TZWxlY3QpO1xuICAgICAgICAgIC8vIENsZWFyIHRoZSBtaW4taGVpZ2h0LCB0aGlzIHdhcyBuZWVkZWQgZHVyaW5nIHRhYiBjaGFuZ2UgdG8gYXZvaWRcbiAgICAgICAgICAvLyB1bm5lY2Vzc2FyeSBzY3JvbGxpbmcuXG4gICAgICAgICAgdGhpcy5fdGFiQm9keVdyYXBwZXIubmF0aXZlRWxlbWVudC5zdHlsZS5taW5IZWlnaHQgPSAnJztcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gU2V0dXAgdGhlIHBvc2l0aW9uIGZvciBlYWNoIHRhYiBhbmQgb3B0aW9uYWxseSBzZXR1cCBhbiBvcmlnaW4gb24gdGhlIG5leHQgc2VsZWN0ZWQgdGFiLlxuICAgIHRoaXMuX3RhYnMuZm9yRWFjaCgodGFiOiBNYXRUYWIsIGluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgIHRhYi5wb3NpdGlvbiA9IGluZGV4IC0gaW5kZXhUb1NlbGVjdDtcblxuICAgICAgLy8gSWYgdGhlcmUgaXMgYWxyZWFkeSBhIHNlbGVjdGVkIHRhYiwgdGhlbiBzZXQgdXAgYW4gb3JpZ2luIGZvciB0aGUgbmV4dCBzZWxlY3RlZCB0YWJcbiAgICAgIC8vIGlmIGl0IGRvZXNuJ3QgaGF2ZSBvbmUgYWxyZWFkeS5cbiAgICAgIGlmICh0aGlzLl9zZWxlY3RlZEluZGV4ICE9IG51bGwgJiYgdGFiLnBvc2l0aW9uID09IDAgJiYgIXRhYi5vcmlnaW4pIHtcbiAgICAgICAgdGFiLm9yaWdpbiA9IGluZGV4VG9TZWxlY3QgLSB0aGlzLl9zZWxlY3RlZEluZGV4O1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKHRoaXMuX3NlbGVjdGVkSW5kZXggIT09IGluZGV4VG9TZWxlY3QpIHtcbiAgICAgIHRoaXMuX3NlbGVjdGVkSW5kZXggPSBpbmRleFRvU2VsZWN0O1xuICAgICAgdGhpcy5fbGFzdEZvY3VzZWRUYWJJbmRleCA9IG51bGw7XG4gICAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKTtcbiAgICB9XG4gIH1cblxuICBuZ0FmdGVyQ29udGVudEluaXQoKSB7XG4gICAgdGhpcy5fc3Vic2NyaWJlVG9BbGxUYWJDaGFuZ2VzKCk7XG4gICAgdGhpcy5fc3Vic2NyaWJlVG9UYWJMYWJlbHMoKTtcblxuICAgIC8vIFN1YnNjcmliZSB0byBjaGFuZ2VzIGluIHRoZSBhbW91bnQgb2YgdGFicywgaW4gb3JkZXIgdG8gYmVcbiAgICAvLyBhYmxlIHRvIHJlLXJlbmRlciB0aGUgY29udGVudCBhcyBuZXcgdGFicyBhcmUgYWRkZWQgb3IgcmVtb3ZlZC5cbiAgICB0aGlzLl90YWJzU3Vic2NyaXB0aW9uID0gdGhpcy5fdGFicy5jaGFuZ2VzLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICBjb25zdCBpbmRleFRvU2VsZWN0ID0gdGhpcy5fY2xhbXBUYWJJbmRleCh0aGlzLl9pbmRleFRvU2VsZWN0KTtcblxuICAgICAgLy8gTWFpbnRhaW4gdGhlIHByZXZpb3VzbHktc2VsZWN0ZWQgdGFiIGlmIGEgbmV3IHRhYiBpcyBhZGRlZCBvciByZW1vdmVkIGFuZCB0aGVyZSBpcyBub1xuICAgICAgLy8gZXhwbGljaXQgY2hhbmdlIHRoYXQgc2VsZWN0cyBhIGRpZmZlcmVudCB0YWIuXG4gICAgICBpZiAoaW5kZXhUb1NlbGVjdCA9PT0gdGhpcy5fc2VsZWN0ZWRJbmRleCkge1xuICAgICAgICBjb25zdCB0YWJzID0gdGhpcy5fdGFicy50b0FycmF5KCk7XG4gICAgICAgIGxldCBzZWxlY3RlZFRhYjogTWF0VGFiIHwgdW5kZWZpbmVkO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGFicy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGlmICh0YWJzW2ldLmlzQWN0aXZlKSB7XG4gICAgICAgICAgICAvLyBBc3NpZ24gYm90aCB0byB0aGUgYF9pbmRleFRvU2VsZWN0YCBhbmQgYF9zZWxlY3RlZEluZGV4YCBzbyB3ZSBkb24ndCBmaXJlIGEgY2hhbmdlZFxuICAgICAgICAgICAgLy8gZXZlbnQsIG90aGVyd2lzZSB0aGUgY29uc3VtZXIgbWF5IGVuZCB1cCBpbiBhbiBpbmZpbml0ZSBsb29wIGluIHNvbWUgZWRnZSBjYXNlcyBsaWtlXG4gICAgICAgICAgICAvLyBhZGRpbmcgYSB0YWIgd2l0aGluIHRoZSBgc2VsZWN0ZWRJbmRleENoYW5nZWAgZXZlbnQuXG4gICAgICAgICAgICB0aGlzLl9pbmRleFRvU2VsZWN0ID0gdGhpcy5fc2VsZWN0ZWRJbmRleCA9IGk7XG4gICAgICAgICAgICB0aGlzLl9sYXN0Rm9jdXNlZFRhYkluZGV4ID0gbnVsbDtcbiAgICAgICAgICAgIHNlbGVjdGVkVGFiID0gdGFic1tpXTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIHdlIGhhdmVuJ3QgZm91bmQgYW4gYWN0aXZlIHRhYiBhbmQgYSB0YWIgZXhpc3RzIGF0IHRoZSBzZWxlY3RlZCBpbmRleCwgaXQgbWVhbnNcbiAgICAgICAgLy8gdGhhdCB0aGUgYWN0aXZlIHRhYiB3YXMgc3dhcHBlZCBvdXQuIFNpbmNlIHRoaXMgd29uJ3QgYmUgcGlja2VkIHVwIGJ5IHRoZSByZW5kZXJpbmdcbiAgICAgICAgLy8gbG9vcCBpbiBgbmdBZnRlckNvbnRlbnRDaGVja2VkYCwgd2UgbmVlZCB0byBzeW5jIGl0IHVwIG1hbnVhbGx5LlxuICAgICAgICBpZiAoIXNlbGVjdGVkVGFiICYmIHRhYnNbaW5kZXhUb1NlbGVjdF0pIHtcbiAgICAgICAgICBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHRhYnNbaW5kZXhUb1NlbGVjdF0uaXNBY3RpdmUgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZFRhYkNoYW5nZS5lbWl0KHRoaXMuX2NyZWF0ZUNoYW5nZUV2ZW50KGluZGV4VG9TZWxlY3QpKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBMaXN0ZW5zIHRvIGNoYW5nZXMgaW4gYWxsIG9mIHRoZSB0YWJzLiAqL1xuICBwcml2YXRlIF9zdWJzY3JpYmVUb0FsbFRhYkNoYW5nZXMoKSB7XG4gICAgLy8gU2luY2Ugd2UgdXNlIGEgcXVlcnkgd2l0aCBgZGVzY2VuZGFudHM6IHRydWVgIHRvIHBpY2sgdXAgdGhlIHRhYnMsIHdlIG1heSBlbmQgdXAgY2F0Y2hpbmdcbiAgICAvLyBzb21lIHRoYXQgYXJlIGluc2lkZSBvZiBuZXN0ZWQgdGFiIGdyb3Vwcy4gV2UgZmlsdGVyIHRoZW0gb3V0IG1hbnVhbGx5IGJ5IGNoZWNraW5nIHRoYXRcbiAgICAvLyB0aGUgY2xvc2VzdCBncm91cCB0byB0aGUgdGFiIGlzIHRoZSBjdXJyZW50IG9uZS5cbiAgICB0aGlzLl9hbGxUYWJzLmNoYW5nZXMucGlwZShzdGFydFdpdGgodGhpcy5fYWxsVGFicykpLnN1YnNjcmliZSgodGFiczogUXVlcnlMaXN0PE1hdFRhYj4pID0+IHtcbiAgICAgIHRoaXMuX3RhYnMucmVzZXQoXG4gICAgICAgIHRhYnMuZmlsdGVyKHRhYiA9PiB7XG4gICAgICAgICAgcmV0dXJuIHRhYi5fY2xvc2VzdFRhYkdyb3VwID09PSB0aGlzIHx8ICF0YWIuX2Nsb3Nlc3RUYWJHcm91cDtcbiAgICAgICAgfSksXG4gICAgICApO1xuICAgICAgdGhpcy5fdGFicy5ub3RpZnlPbkNoYW5nZXMoKTtcbiAgICB9KTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuX3RhYnMuZGVzdHJveSgpO1xuICAgIHRoaXMuX3RhYnNTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICB0aGlzLl90YWJMYWJlbFN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICB9XG5cbiAgLyoqIFJlLWFsaWducyB0aGUgaW5rIGJhciB0byB0aGUgc2VsZWN0ZWQgdGFiIGVsZW1lbnQuICovXG4gIHJlYWxpZ25JbmtCYXIoKSB7XG4gICAgaWYgKHRoaXMuX3RhYkhlYWRlcikge1xuICAgICAgdGhpcy5fdGFiSGVhZGVyLl9hbGlnbklua0JhclRvU2VsZWN0ZWRUYWIoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVjYWxjdWxhdGVzIHRoZSB0YWIgZ3JvdXAncyBwYWdpbmF0aW9uIGRpbWVuc2lvbnMuXG4gICAqXG4gICAqIFdBUk5JTkc6IENhbGxpbmcgdGhpcyBtZXRob2QgY2FuIGJlIHZlcnkgY29zdGx5IGluIHRlcm1zIG9mIHBlcmZvcm1hbmNlLiBJdCBzaG91bGQgYmUgY2FsbGVkXG4gICAqIGFzIGluZnJlcXVlbnRseSBhcyBwb3NzaWJsZSBmcm9tIG91dHNpZGUgb2YgdGhlIFRhYnMgY29tcG9uZW50IGFzIGl0IGNhdXNlcyBhIHJlZmxvdyBvZiB0aGVcbiAgICogcGFnZS5cbiAgICovXG4gIHVwZGF0ZVBhZ2luYXRpb24oKSB7XG4gICAgaWYgKHRoaXMuX3RhYkhlYWRlcikge1xuICAgICAgdGhpcy5fdGFiSGVhZGVyLnVwZGF0ZVBhZ2luYXRpb24oKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0cyBmb2N1cyB0byBhIHBhcnRpY3VsYXIgdGFiLlxuICAgKiBAcGFyYW0gaW5kZXggSW5kZXggb2YgdGhlIHRhYiB0byBiZSBmb2N1c2VkLlxuICAgKi9cbiAgZm9jdXNUYWIoaW5kZXg6IG51bWJlcikge1xuICAgIGNvbnN0IGhlYWRlciA9IHRoaXMuX3RhYkhlYWRlcjtcblxuICAgIGlmIChoZWFkZXIpIHtcbiAgICAgIGhlYWRlci5mb2N1c0luZGV4ID0gaW5kZXg7XG4gICAgfVxuICB9XG5cbiAgX2ZvY3VzQ2hhbmdlZChpbmRleDogbnVtYmVyKSB7XG4gICAgdGhpcy5fbGFzdEZvY3VzZWRUYWJJbmRleCA9IGluZGV4O1xuICAgIHRoaXMuZm9jdXNDaGFuZ2UuZW1pdCh0aGlzLl9jcmVhdGVDaGFuZ2VFdmVudChpbmRleCkpO1xuICB9XG5cbiAgcHJpdmF0ZSBfY3JlYXRlQ2hhbmdlRXZlbnQoaW5kZXg6IG51bWJlcik6IE1hdFRhYkNoYW5nZUV2ZW50IHtcbiAgICBjb25zdCBldmVudCA9IG5ldyBNYXRUYWJDaGFuZ2VFdmVudCgpO1xuICAgIGV2ZW50LmluZGV4ID0gaW5kZXg7XG4gICAgaWYgKHRoaXMuX3RhYnMgJiYgdGhpcy5fdGFicy5sZW5ndGgpIHtcbiAgICAgIGV2ZW50LnRhYiA9IHRoaXMuX3RhYnMudG9BcnJheSgpW2luZGV4XTtcbiAgICB9XG4gICAgcmV0dXJuIGV2ZW50O1xuICB9XG5cbiAgLyoqXG4gICAqIFN1YnNjcmliZXMgdG8gY2hhbmdlcyBpbiB0aGUgdGFiIGxhYmVscy4gVGhpcyBpcyBuZWVkZWQsIGJlY2F1c2UgdGhlIEBJbnB1dCBmb3IgdGhlIGxhYmVsIGlzXG4gICAqIG9uIHRoZSBNYXRUYWIgY29tcG9uZW50LCB3aGVyZWFzIHRoZSBkYXRhIGJpbmRpbmcgaXMgaW5zaWRlIHRoZSBNYXRUYWJHcm91cC4gSW4gb3JkZXIgZm9yIHRoZVxuICAgKiBiaW5kaW5nIHRvIGJlIHVwZGF0ZWQsIHdlIG5lZWQgdG8gc3Vic2NyaWJlIHRvIGNoYW5nZXMgaW4gaXQgYW5kIHRyaWdnZXIgY2hhbmdlIGRldGVjdGlvblxuICAgKiBtYW51YWxseS5cbiAgICovXG4gIHByaXZhdGUgX3N1YnNjcmliZVRvVGFiTGFiZWxzKCkge1xuICAgIGlmICh0aGlzLl90YWJMYWJlbFN1YnNjcmlwdGlvbikge1xuICAgICAgdGhpcy5fdGFiTGFiZWxTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICB9XG5cbiAgICB0aGlzLl90YWJMYWJlbFN1YnNjcmlwdGlvbiA9IG1lcmdlKC4uLnRoaXMuX3RhYnMubWFwKHRhYiA9PiB0YWIuX3N0YXRlQ2hhbmdlcykpLnN1YnNjcmliZSgoKSA9PlxuICAgICAgdGhpcy5fY2hhbmdlRGV0ZWN0b3JSZWYubWFya0ZvckNoZWNrKCksXG4gICAgKTtcbiAgfVxuXG4gIC8qKiBDbGFtcHMgdGhlIGdpdmVuIGluZGV4IHRvIHRoZSBib3VuZHMgb2YgMCBhbmQgdGhlIHRhYnMgbGVuZ3RoLiAqL1xuICBwcml2YXRlIF9jbGFtcFRhYkluZGV4KGluZGV4OiBudW1iZXIgfCBudWxsKTogbnVtYmVyIHtcbiAgICAvLyBOb3RlIHRoZSBgfHwgMGAsIHdoaWNoIGVuc3VyZXMgdGhhdCB2YWx1ZXMgbGlrZSBOYU4gY2FuJ3QgZ2V0IHRocm91Z2hcbiAgICAvLyBhbmQgd2hpY2ggd291bGQgb3RoZXJ3aXNlIHRocm93IHRoZSBjb21wb25lbnQgaW50byBhbiBpbmZpbml0ZSBsb29wXG4gICAgLy8gKHNpbmNlIE1hdGgubWF4KE5hTiwgMCkgPT09IE5hTikuXG4gICAgcmV0dXJuIE1hdGgubWluKHRoaXMuX3RhYnMubGVuZ3RoIC0gMSwgTWF0aC5tYXgoaW5kZXggfHwgMCwgMCkpO1xuICB9XG5cbiAgLyoqIFJldHVybnMgYSB1bmlxdWUgaWQgZm9yIGVhY2ggdGFiIGxhYmVsIGVsZW1lbnQgKi9cbiAgX2dldFRhYkxhYmVsSWQoaTogbnVtYmVyKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYG1hdC10YWItbGFiZWwtJHt0aGlzLl9ncm91cElkfS0ke2l9YDtcbiAgfVxuXG4gIC8qKiBSZXR1cm5zIGEgdW5pcXVlIGlkIGZvciBlYWNoIHRhYiBjb250ZW50IGVsZW1lbnQgKi9cbiAgX2dldFRhYkNvbnRlbnRJZChpOiBudW1iZXIpOiBzdHJpbmcge1xuICAgIHJldHVybiBgbWF0LXRhYi1jb250ZW50LSR7dGhpcy5fZ3JvdXBJZH0tJHtpfWA7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgaGVpZ2h0IG9mIHRoZSBib2R5IHdyYXBwZXIgdG8gdGhlIGhlaWdodCBvZiB0aGUgYWN0aXZhdGluZyB0YWIgaWYgZHluYW1pY1xuICAgKiBoZWlnaHQgcHJvcGVydHkgaXMgdHJ1ZS5cbiAgICovXG4gIF9zZXRUYWJCb2R5V3JhcHBlckhlaWdodCh0YWJIZWlnaHQ6IG51bWJlcik6IHZvaWQge1xuICAgIGlmICghdGhpcy5fZHluYW1pY0hlaWdodCB8fCAhdGhpcy5fdGFiQm9keVdyYXBwZXJIZWlnaHQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB3cmFwcGVyOiBIVE1MRWxlbWVudCA9IHRoaXMuX3RhYkJvZHlXcmFwcGVyLm5hdGl2ZUVsZW1lbnQ7XG5cbiAgICB3cmFwcGVyLnN0eWxlLmhlaWdodCA9IHRoaXMuX3RhYkJvZHlXcmFwcGVySGVpZ2h0ICsgJ3B4JztcblxuICAgIC8vIFRoaXMgY29uZGl0aW9uYWwgZm9yY2VzIHRoZSBicm93c2VyIHRvIHBhaW50IHRoZSBoZWlnaHQgc28gdGhhdFxuICAgIC8vIHRoZSBhbmltYXRpb24gdG8gdGhlIG5ldyBoZWlnaHQgY2FuIGhhdmUgYW4gb3JpZ2luLlxuICAgIGlmICh0aGlzLl90YWJCb2R5V3JhcHBlci5uYXRpdmVFbGVtZW50Lm9mZnNldEhlaWdodCkge1xuICAgICAgd3JhcHBlci5zdHlsZS5oZWlnaHQgPSB0YWJIZWlnaHQgKyAncHgnO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBSZW1vdmVzIHRoZSBoZWlnaHQgb2YgdGhlIHRhYiBib2R5IHdyYXBwZXIuICovXG4gIF9yZW1vdmVUYWJCb2R5V3JhcHBlckhlaWdodCgpOiB2b2lkIHtcbiAgICBjb25zdCB3cmFwcGVyID0gdGhpcy5fdGFiQm9keVdyYXBwZXIubmF0aXZlRWxlbWVudDtcbiAgICB0aGlzLl90YWJCb2R5V3JhcHBlckhlaWdodCA9IHdyYXBwZXIuY2xpZW50SGVpZ2h0O1xuICAgIHdyYXBwZXIuc3R5bGUuaGVpZ2h0ID0gJyc7XG4gICAgdGhpcy5hbmltYXRpb25Eb25lLmVtaXQoKTtcbiAgfVxuXG4gIC8qKiBIYW5kbGUgY2xpY2sgZXZlbnRzLCBzZXR0aW5nIG5ldyBzZWxlY3RlZCBpbmRleCBpZiBhcHByb3ByaWF0ZS4gKi9cbiAgX2hhbmRsZUNsaWNrKHRhYjogTWF0VGFiLCB0YWJIZWFkZXI6IE1hdFRhYkdyb3VwQmFzZUhlYWRlciwgaW5kZXg6IG51bWJlcikge1xuICAgIHRhYkhlYWRlci5mb2N1c0luZGV4ID0gaW5kZXg7XG5cbiAgICBpZiAoIXRhYi5kaXNhYmxlZCkge1xuICAgICAgdGhpcy5zZWxlY3RlZEluZGV4ID0gaW5kZXg7XG4gICAgfVxuICB9XG5cbiAgLyoqIFJldHJpZXZlcyB0aGUgdGFiaW5kZXggZm9yIHRoZSB0YWIuICovXG4gIF9nZXRUYWJJbmRleChpbmRleDogbnVtYmVyKTogbnVtYmVyIHtcbiAgICBjb25zdCB0YXJnZXRJbmRleCA9IHRoaXMuX2xhc3RGb2N1c2VkVGFiSW5kZXggPz8gdGhpcy5zZWxlY3RlZEluZGV4O1xuICAgIHJldHVybiBpbmRleCA9PT0gdGFyZ2V0SW5kZXggPyAwIDogLTE7XG4gIH1cblxuICAvKiogQ2FsbGJhY2sgZm9yIHdoZW4gdGhlIGZvY3VzZWQgc3RhdGUgb2YgYSB0YWIgaGFzIGNoYW5nZWQuICovXG4gIF90YWJGb2N1c0NoYW5nZWQoZm9jdXNPcmlnaW46IEZvY3VzT3JpZ2luLCBpbmRleDogbnVtYmVyKSB7XG4gICAgLy8gTW91c2UvdG91Y2ggZm9jdXMgaGFwcGVucyBkdXJpbmcgdGhlIGBtb3VzZWRvd25gL2B0b3VjaHN0YXJ0YCBwaGFzZSB3aGljaFxuICAgIC8vIGNhbiBjYXVzZSB0aGUgdGFiIHRvIGJlIG1vdmVkIG91dCBmcm9tIHVuZGVyIHRoZSBwb2ludGVyLCBpbnRlcnJ1cHRpbmcgdGhlXG4gICAgLy8gY2xpY2sgc2VxdWVuY2UgKHNlZSAjMjE4OTgpLiBXZSBkb24ndCBuZWVkIHRvIHNjcm9sbCB0aGUgdGFiIGludG8gdmlldyBmb3JcbiAgICAvLyBzdWNoIGNhc2VzIGFueXdheSwgYmVjYXVzZSBpdCB3aWxsIGJlIGRvbmUgd2hlbiB0aGUgdGFiIGJlY29tZXMgc2VsZWN0ZWQuXG4gICAgaWYgKGZvY3VzT3JpZ2luICYmIGZvY3VzT3JpZ2luICE9PSAnbW91c2UnICYmIGZvY3VzT3JpZ2luICE9PSAndG91Y2gnKSB7XG4gICAgICB0aGlzLl90YWJIZWFkZXIuZm9jdXNJbmRleCA9IGluZGV4O1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIE1hdGVyaWFsIGRlc2lnbiB0YWItZ3JvdXAgY29tcG9uZW50LiBTdXBwb3J0cyBiYXNpYyB0YWIgcGFpcnMgKGxhYmVsICsgY29udGVudCkgYW5kIGluY2x1ZGVzXG4gKiBhbmltYXRlZCBpbmstYmFyLCBrZXlib2FyZCBuYXZpZ2F0aW9uLCBhbmQgc2NyZWVuIHJlYWRlci5cbiAqIFNlZTogaHR0cHM6Ly9tYXRlcmlhbC5pby9kZXNpZ24vY29tcG9uZW50cy90YWJzLmh0bWxcbiAqL1xuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbWF0LXRhYi1ncm91cCcsXG4gIGV4cG9ydEFzOiAnbWF0VGFiR3JvdXAnLFxuICB0ZW1wbGF0ZVVybDogJ3RhYi1ncm91cC5odG1sJyxcbiAgc3R5bGVVcmxzOiBbJ3RhYi1ncm91cC5jc3MnXSxcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOnZhbGlkYXRlLWRlY29yYXRvcnNcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5EZWZhdWx0LFxuICBpbnB1dHM6IFsnY29sb3InLCAnZGlzYWJsZVJpcHBsZSddLFxuICBwcm92aWRlcnM6IFtcbiAgICB7XG4gICAgICBwcm92aWRlOiBNQVRfVEFCX0dST1VQLFxuICAgICAgdXNlRXhpc3Rpbmc6IE1hdFRhYkdyb3VwLFxuICAgIH0sXG4gIF0sXG4gIGhvc3Q6IHtcbiAgICAnY2xhc3MnOiAnbWF0LW1kYy10YWItZ3JvdXAnLFxuICAgICdbY2xhc3MubWF0LW1kYy10YWItZ3JvdXAtZHluYW1pYy1oZWlnaHRdJzogJ2R5bmFtaWNIZWlnaHQnLFxuICAgICdbY2xhc3MubWF0LW1kYy10YWItZ3JvdXAtaW52ZXJ0ZWQtaGVhZGVyXSc6ICdoZWFkZXJQb3NpdGlvbiA9PT0gXCJiZWxvd1wiJyxcbiAgICAnW2NsYXNzLm1hdC1tZGMtdGFiLWdyb3VwLXN0cmV0Y2gtdGFic10nOiAnc3RyZXRjaFRhYnMnLFxuICB9LFxufSlcbmV4cG9ydCBjbGFzcyBNYXRUYWJHcm91cCBleHRlbmRzIF9NYXRUYWJHcm91cEJhc2Uge1xuICBAQ29udGVudENoaWxkcmVuKE1hdFRhYiwge2Rlc2NlbmRhbnRzOiB0cnVlfSkgX2FsbFRhYnM6IFF1ZXJ5TGlzdDxNYXRUYWI+O1xuICBAVmlld0NoaWxkKCd0YWJCb2R5V3JhcHBlcicpIF90YWJCb2R5V3JhcHBlcjogRWxlbWVudFJlZjtcbiAgQFZpZXdDaGlsZCgndGFiSGVhZGVyJykgX3RhYkhlYWRlcjogTWF0VGFiSGVhZGVyO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBpbmsgYmFyIHNob3VsZCBmaXQgaXRzIHdpZHRoIHRvIHRoZSBzaXplIG9mIHRoZSB0YWIgbGFiZWwgY29udGVudC4gKi9cbiAgQElucHV0KClcbiAgZ2V0IGZpdElua0JhclRvQ29udGVudCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fZml0SW5rQmFyVG9Db250ZW50O1xuICB9XG4gIHNldCBmaXRJbmtCYXJUb0NvbnRlbnQodjogQm9vbGVhbklucHV0KSB7XG4gICAgdGhpcy5fZml0SW5rQmFyVG9Db250ZW50ID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHYpO1xuICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xuICB9XG4gIHByaXZhdGUgX2ZpdElua0JhclRvQ29udGVudCA9IGZhbHNlO1xuXG4gIC8qKiBXaGV0aGVyIHRhYnMgc2hvdWxkIGJlIHN0cmV0Y2hlZCB0byBmaWxsIHRoZSBoZWFkZXIuICovXG4gIEBJbnB1dCgnbWF0LXN0cmV0Y2gtdGFicycpXG4gIGdldCBzdHJldGNoVGFicygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fc3RyZXRjaFRhYnM7XG4gIH1cbiAgc2V0IHN0cmV0Y2hUYWJzKHY6IEJvb2xlYW5JbnB1dCkge1xuICAgIHRoaXMuX3N0cmV0Y2hUYWJzID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHYpO1xuICB9XG4gIHByaXZhdGUgX3N0cmV0Y2hUYWJzID0gdHJ1ZTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBlbGVtZW50UmVmOiBFbGVtZW50UmVmLFxuICAgIGNoYW5nZURldGVjdG9yUmVmOiBDaGFuZ2VEZXRlY3RvclJlZixcbiAgICBASW5qZWN0KE1BVF9UQUJTX0NPTkZJRykgQE9wdGlvbmFsKCkgZGVmYXVsdENvbmZpZz86IE1hdFRhYnNDb25maWcsXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChBTklNQVRJT05fTU9EVUxFX1RZUEUpIGFuaW1hdGlvbk1vZGU/OiBzdHJpbmcsXG4gICkge1xuICAgIHN1cGVyKGVsZW1lbnRSZWYsIGNoYW5nZURldGVjdG9yUmVmLCBkZWZhdWx0Q29uZmlnLCBhbmltYXRpb25Nb2RlKTtcbiAgICB0aGlzLmZpdElua0JhclRvQ29udGVudCA9XG4gICAgICBkZWZhdWx0Q29uZmlnICYmIGRlZmF1bHRDb25maWcuZml0SW5rQmFyVG9Db250ZW50ICE9IG51bGxcbiAgICAgICAgPyBkZWZhdWx0Q29uZmlnLmZpdElua0JhclRvQ29udGVudFxuICAgICAgICA6IGZhbHNlO1xuICB9XG59XG5cbi8qKiBBIHNpbXBsZSBjaGFuZ2UgZXZlbnQgZW1pdHRlZCBvbiBmb2N1cyBvciBzZWxlY3Rpb24gY2hhbmdlcy4gKi9cbmV4cG9ydCBjbGFzcyBNYXRUYWJDaGFuZ2VFdmVudCB7XG4gIC8qKiBJbmRleCBvZiB0aGUgY3VycmVudGx5LXNlbGVjdGVkIHRhYi4gKi9cbiAgaW5kZXg6IG51bWJlcjtcbiAgLyoqIFJlZmVyZW5jZSB0byB0aGUgY3VycmVudGx5LXNlbGVjdGVkIHRhYi4gKi9cbiAgdGFiOiBNYXRUYWI7XG59XG4iLCI8bWF0LXRhYi1oZWFkZXIgI3RhYkhlYWRlclxuICAgICAgICAgICAgICAgIFtzZWxlY3RlZEluZGV4XT1cInNlbGVjdGVkSW5kZXggfHwgMFwiXG4gICAgICAgICAgICAgICAgW2Rpc2FibGVSaXBwbGVdPVwiZGlzYWJsZVJpcHBsZVwiXG4gICAgICAgICAgICAgICAgW2Rpc2FibGVQYWdpbmF0aW9uXT1cImRpc2FibGVQYWdpbmF0aW9uXCJcbiAgICAgICAgICAgICAgICAoaW5kZXhGb2N1c2VkKT1cIl9mb2N1c0NoYW5nZWQoJGV2ZW50KVwiXG4gICAgICAgICAgICAgICAgKHNlbGVjdEZvY3VzZWRJbmRleCk9XCJzZWxlY3RlZEluZGV4ID0gJGV2ZW50XCI+XG5cbiAgPGRpdiBjbGFzcz1cIm1kYy10YWIgbWF0LW1kYy10YWIgbWF0LW1kYy1mb2N1cy1pbmRpY2F0b3JcIlxuICAgICAgICN0YWJOb2RlXG4gICAgICAgcm9sZT1cInRhYlwiXG4gICAgICAgbWF0VGFiTGFiZWxXcmFwcGVyXG4gICAgICAgY2RrTW9uaXRvckVsZW1lbnRGb2N1c1xuICAgICAgICpuZ0Zvcj1cImxldCB0YWIgb2YgX3RhYnM7IGxldCBpID0gaW5kZXhcIlxuICAgICAgIFtpZF09XCJfZ2V0VGFiTGFiZWxJZChpKVwiXG4gICAgICAgW2F0dHIudGFiSW5kZXhdPVwiX2dldFRhYkluZGV4KGkpXCJcbiAgICAgICBbYXR0ci5hcmlhLXBvc2luc2V0XT1cImkgKyAxXCJcbiAgICAgICBbYXR0ci5hcmlhLXNldHNpemVdPVwiX3RhYnMubGVuZ3RoXCJcbiAgICAgICBbYXR0ci5hcmlhLWNvbnRyb2xzXT1cIl9nZXRUYWJDb250ZW50SWQoaSlcIlxuICAgICAgIFthdHRyLmFyaWEtc2VsZWN0ZWRdPVwic2VsZWN0ZWRJbmRleCA9PT0gaVwiXG4gICAgICAgW2F0dHIuYXJpYS1sYWJlbF09XCJ0YWIuYXJpYUxhYmVsIHx8IG51bGxcIlxuICAgICAgIFthdHRyLmFyaWEtbGFiZWxsZWRieV09XCIoIXRhYi5hcmlhTGFiZWwgJiYgdGFiLmFyaWFMYWJlbGxlZGJ5KSA/IHRhYi5hcmlhTGFiZWxsZWRieSA6IG51bGxcIlxuICAgICAgIFtjbGFzcy5tZGMtdGFiLS1hY3RpdmVdPVwic2VsZWN0ZWRJbmRleCA9PT0gaVwiXG4gICAgICAgW25nQ2xhc3NdPVwidGFiLmxhYmVsQ2xhc3NcIlxuICAgICAgIFtkaXNhYmxlZF09XCJ0YWIuZGlzYWJsZWRcIlxuICAgICAgIFtmaXRJbmtCYXJUb0NvbnRlbnRdPVwiZml0SW5rQmFyVG9Db250ZW50XCJcbiAgICAgICAoY2xpY2spPVwiX2hhbmRsZUNsaWNrKHRhYiwgdGFiSGVhZGVyLCBpKVwiXG4gICAgICAgKGNka0ZvY3VzQ2hhbmdlKT1cIl90YWJGb2N1c0NoYW5nZWQoJGV2ZW50LCBpKVwiPlxuICAgIDxzcGFuIGNsYXNzPVwibWRjLXRhYl9fcmlwcGxlXCI+PC9zcGFuPlxuXG4gICAgPCEtLSBOZWVkcyB0byBiZSBhIHNlcGFyYXRlIGVsZW1lbnQsIGJlY2F1c2Ugd2UgY2FuJ3QgcHV0XG4gICAgICAgICBgb3ZlcmZsb3c6IGhpZGRlbmAgb24gdGFiIGR1ZSB0byB0aGUgaW5rIGJhci4gLS0+XG4gICAgPGRpdlxuICAgICAgY2xhc3M9XCJtYXQtbWRjLXRhYi1yaXBwbGVcIlxuICAgICAgbWF0LXJpcHBsZVxuICAgICAgW21hdFJpcHBsZVRyaWdnZXJdPVwidGFiTm9kZVwiXG4gICAgICBbbWF0UmlwcGxlRGlzYWJsZWRdPVwidGFiLmRpc2FibGVkIHx8IGRpc2FibGVSaXBwbGVcIj48L2Rpdj5cblxuICAgIDxzcGFuIGNsYXNzPVwibWRjLXRhYl9fY29udGVudFwiPlxuICAgICAgPHNwYW4gY2xhc3M9XCJtZGMtdGFiX190ZXh0LWxhYmVsXCI+XG4gICAgICAgIDwhLS0gSWYgdGhlcmUgaXMgYSBsYWJlbCB0ZW1wbGF0ZSwgdXNlIGl0LiAtLT5cbiAgICAgICAgPG5nLXRlbXBsYXRlIFtuZ0lmXT1cInRhYi50ZW1wbGF0ZUxhYmVsXCIgW25nSWZFbHNlXT1cInRhYlRleHRMYWJlbFwiPlxuICAgICAgICAgIDxuZy10ZW1wbGF0ZSBbY2RrUG9ydGFsT3V0bGV0XT1cInRhYi50ZW1wbGF0ZUxhYmVsXCI+PC9uZy10ZW1wbGF0ZT5cbiAgICAgICAgPC9uZy10ZW1wbGF0ZT5cblxuICAgICAgICA8IS0tIElmIHRoZXJlIGlzIG5vdCBhIGxhYmVsIHRlbXBsYXRlLCBmYWxsIGJhY2sgdG8gdGhlIHRleHQgbGFiZWwuIC0tPlxuICAgICAgICA8bmctdGVtcGxhdGUgI3RhYlRleHRMYWJlbD57e3RhYi50ZXh0TGFiZWx9fTwvbmctdGVtcGxhdGU+XG4gICAgICA8L3NwYW4+XG4gICAgPC9zcGFuPlxuICA8L2Rpdj5cbjwvbWF0LXRhYi1oZWFkZXI+XG5cbjxkaXZcbiAgY2xhc3M9XCJtYXQtbWRjLXRhYi1ib2R5LXdyYXBwZXJcIlxuICBbY2xhc3MuX21hdC1hbmltYXRpb24tbm9vcGFibGVdPVwiX2FuaW1hdGlvbk1vZGUgPT09ICdOb29wQW5pbWF0aW9ucydcIlxuICAjdGFiQm9keVdyYXBwZXI+XG4gIDxtYXQtdGFiLWJvZHkgcm9sZT1cInRhYnBhbmVsXCJcbiAgICAgICAgICAgICAgICpuZ0Zvcj1cImxldCB0YWIgb2YgX3RhYnM7IGxldCBpID0gaW5kZXhcIlxuICAgICAgICAgICAgICAgW2lkXT1cIl9nZXRUYWJDb250ZW50SWQoaSlcIlxuICAgICAgICAgICAgICAgW2F0dHIudGFiaW5kZXhdPVwiKGNvbnRlbnRUYWJJbmRleCAhPSBudWxsICYmIHNlbGVjdGVkSW5kZXggPT09IGkpID8gY29udGVudFRhYkluZGV4IDogbnVsbFwiXG4gICAgICAgICAgICAgICBbYXR0ci5hcmlhLWxhYmVsbGVkYnldPVwiX2dldFRhYkxhYmVsSWQoaSlcIlxuICAgICAgICAgICAgICAgW2NsYXNzLm1hdC1tZGMtdGFiLWJvZHktYWN0aXZlXT1cInNlbGVjdGVkSW5kZXggPT09IGlcIlxuICAgICAgICAgICAgICAgW25nQ2xhc3NdPVwidGFiLmJvZHlDbGFzc1wiXG4gICAgICAgICAgICAgICBbY29udGVudF09XCJ0YWIuY29udGVudCFcIlxuICAgICAgICAgICAgICAgW3Bvc2l0aW9uXT1cInRhYi5wb3NpdGlvbiFcIlxuICAgICAgICAgICAgICAgW29yaWdpbl09XCJ0YWIub3JpZ2luXCJcbiAgICAgICAgICAgICAgIFthbmltYXRpb25EdXJhdGlvbl09XCJhbmltYXRpb25EdXJhdGlvblwiXG4gICAgICAgICAgICAgICBbcHJlc2VydmVDb250ZW50XT1cInByZXNlcnZlQ29udGVudFwiXG4gICAgICAgICAgICAgICAoX29uQ2VudGVyZWQpPVwiX3JlbW92ZVRhYkJvZHlXcmFwcGVySGVpZ2h0KClcIlxuICAgICAgICAgICAgICAgKF9vbkNlbnRlcmluZyk9XCJfc2V0VGFiQm9keVdyYXBwZXJIZWlnaHQoJGV2ZW50KVwiPlxuICA8L21hdC10YWItYm9keT5cbjwvZGl2PlxuIl19