/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { FocusMonitor } from '@angular/cdk/a11y';
import { ENTER, SPACE } from '@angular/cdk/keycodes';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, Input, Optional, ViewEncapsulation, booleanAttribute, } from '@angular/core';
import { merge } from 'rxjs';
import { MAT_SORT_DEFAULT_OPTIONS, MatSort, } from './sort';
import { matSortAnimations } from './sort-animations';
import { getSortHeaderNotContainedWithinSortError } from './sort-errors';
import { MatSortHeaderIntl } from './sort-header-intl';
import * as i0 from "@angular/core";
import * as i1 from "./sort-header-intl";
import * as i2 from "./sort";
import * as i3 from "@angular/cdk/a11y";
/**
 * Applies sorting behavior (click to change sort) and styles to an element, including an
 * arrow to display the current sort direction.
 *
 * Must be provided with an id and contained within a parent MatSort directive.
 *
 * If used on header cells in a CdkTable, it will automatically default its id from its containing
 * column definition.
 */
export class MatSortHeader {
    /**
     * Description applied to MatSortHeader's button element with aria-describedby. This text should
     * describe the action that will occur when the user clicks the sort header.
     */
    get sortActionDescription() {
        return this._sortActionDescription;
    }
    set sortActionDescription(value) {
        this._updateSortActionDescription(value);
    }
    constructor(
    /**
     * @deprecated `_intl` parameter isn't being used anymore and it'll be removed.
     * @breaking-change 13.0.0
     */
    _intl, _changeDetectorRef, 
    // `MatSort` is not optionally injected, but just asserted manually w/ better error.
    // tslint:disable-next-line: lightweight-tokens
    _sort, _columnDef, _focusMonitor, _elementRef, 
    /** @breaking-change 14.0.0 _ariaDescriber will be required. */
    _ariaDescriber, defaultOptions) {
        this._intl = _intl;
        this._changeDetectorRef = _changeDetectorRef;
        this._sort = _sort;
        this._columnDef = _columnDef;
        this._focusMonitor = _focusMonitor;
        this._elementRef = _elementRef;
        this._ariaDescriber = _ariaDescriber;
        /**
         * Flag set to true when the indicator should be displayed while the sort is not active. Used to
         * provide an affordance that the header is sortable by showing on focus and hover.
         */
        this._showIndicatorHint = false;
        /**
         * The view transition state of the arrow (translation/ opacity) - indicates its `from` and `to`
         * position through the animation. If animations are currently disabled, the fromState is removed
         * so that there is no animation displayed.
         */
        this._viewState = {};
        /** The direction the arrow should be facing according to the current state. */
        this._arrowDirection = '';
        /**
         * Whether the view state animation should show the transition between the `from` and `to` states.
         */
        this._disableViewStateAnimation = false;
        /** Sets the position of the arrow that displays when sorted. */
        this.arrowPosition = 'after';
        /** whether the sort header is disabled. */
        this.disabled = false;
        // Default the action description to "Sort" because it's better than nothing.
        // Without a description, the button's label comes from the sort header text content,
        // which doesn't give any indication that it performs a sorting operation.
        this._sortActionDescription = 'Sort';
        // Note that we use a string token for the `_columnDef`, because the value is provided both by
        // `material/table` and `cdk/table` and we can't have the CDK depending on Material,
        // and we want to avoid having the sort header depending on the CDK table because
        // of this single reference.
        if (!_sort && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw getSortHeaderNotContainedWithinSortError();
        }
        if (defaultOptions?.arrowPosition) {
            this.arrowPosition = defaultOptions?.arrowPosition;
        }
        this._handleStateChanges();
    }
    ngOnInit() {
        if (!this.id && this._columnDef) {
            this.id = this._columnDef.name;
        }
        // Initialize the direction of the arrow and set the view state to be immediately that state.
        this._updateArrowDirection();
        this._setAnimationTransitionState({
            toState: this._isSorted() ? 'active' : this._arrowDirection,
        });
        this._sort.register(this);
        this._sortButton = this._elementRef.nativeElement.querySelector('.mat-sort-header-container');
        this._updateSortActionDescription(this._sortActionDescription);
    }
    ngAfterViewInit() {
        // We use the focus monitor because we also want to style
        // things differently based on the focus origin.
        this._focusMonitor.monitor(this._elementRef, true).subscribe(origin => {
            const newState = !!origin;
            if (newState !== this._showIndicatorHint) {
                this._setIndicatorHintVisible(newState);
                this._changeDetectorRef.markForCheck();
            }
        });
    }
    ngOnDestroy() {
        this._focusMonitor.stopMonitoring(this._elementRef);
        this._sort.deregister(this);
        this._rerenderSubscription.unsubscribe();
    }
    /**
     * Sets the "hint" state such that the arrow will be semi-transparently displayed as a hint to the
     * user showing what the active sort will become. If set to false, the arrow will fade away.
     */
    _setIndicatorHintVisible(visible) {
        // No-op if the sort header is disabled - should not make the hint visible.
        if (this._isDisabled() && visible) {
            return;
        }
        this._showIndicatorHint = visible;
        if (!this._isSorted()) {
            this._updateArrowDirection();
            if (this._showIndicatorHint) {
                this._setAnimationTransitionState({ fromState: this._arrowDirection, toState: 'hint' });
            }
            else {
                this._setAnimationTransitionState({ fromState: 'hint', toState: this._arrowDirection });
            }
        }
    }
    /**
     * Sets the animation transition view state for the arrow's position and opacity. If the
     * `disableViewStateAnimation` flag is set to true, the `fromState` will be ignored so that
     * no animation appears.
     */
    _setAnimationTransitionState(viewState) {
        this._viewState = viewState || {};
        // If the animation for arrow position state (opacity/translation) should be disabled,
        // remove the fromState so that it jumps right to the toState.
        if (this._disableViewStateAnimation) {
            this._viewState = { toState: viewState.toState };
        }
    }
    /** Triggers the sort on this sort header and removes the indicator hint. */
    _toggleOnInteraction() {
        this._sort.sort(this);
        // Do not show the animation if the header was already shown in the right position.
        if (this._viewState.toState === 'hint' || this._viewState.toState === 'active') {
            this._disableViewStateAnimation = true;
        }
    }
    _handleClick() {
        if (!this._isDisabled()) {
            this._sort.sort(this);
        }
    }
    _handleKeydown(event) {
        if (!this._isDisabled() && (event.keyCode === SPACE || event.keyCode === ENTER)) {
            event.preventDefault();
            this._toggleOnInteraction();
        }
    }
    /** Whether this MatSortHeader is currently sorted in either ascending or descending order. */
    _isSorted() {
        return (this._sort.active == this.id &&
            (this._sort.direction === 'asc' || this._sort.direction === 'desc'));
    }
    /** Returns the animation state for the arrow direction (indicator and pointers). */
    _getArrowDirectionState() {
        return `${this._isSorted() ? 'active-' : ''}${this._arrowDirection}`;
    }
    /** Returns the arrow position state (opacity, translation). */
    _getArrowViewState() {
        const fromState = this._viewState.fromState;
        return (fromState ? `${fromState}-to-` : '') + this._viewState.toState;
    }
    /**
     * Updates the direction the arrow should be pointing. If it is not sorted, the arrow should be
     * facing the start direction. Otherwise if it is sorted, the arrow should point in the currently
     * active sorted direction. The reason this is updated through a function is because the direction
     * should only be changed at specific times - when deactivated but the hint is displayed and when
     * the sort is active and the direction changes. Otherwise the arrow's direction should linger
     * in cases such as the sort becoming deactivated but we want to animate the arrow away while
     * preserving its direction, even though the next sort direction is actually different and should
     * only be changed once the arrow displays again (hint or activation).
     */
    _updateArrowDirection() {
        this._arrowDirection = this._isSorted() ? this._sort.direction : this.start || this._sort.start;
    }
    _isDisabled() {
        return this._sort.disabled || this.disabled;
    }
    /**
     * Gets the aria-sort attribute that should be applied to this sort header. If this header
     * is not sorted, returns null so that the attribute is removed from the host element. Aria spec
     * says that the aria-sort property should only be present on one header at a time, so removing
     * ensures this is true.
     */
    _getAriaSortAttribute() {
        if (!this._isSorted()) {
            return 'none';
        }
        return this._sort.direction == 'asc' ? 'ascending' : 'descending';
    }
    /** Whether the arrow inside the sort header should be rendered. */
    _renderArrow() {
        return !this._isDisabled() || this._isSorted();
    }
    _updateSortActionDescription(newDescription) {
        // We use AriaDescriber for the sort button instead of setting an `aria-label` because some
        // screen readers (notably VoiceOver) will read both the column header *and* the button's label
        // for every *cell* in the table, creating a lot of unnecessary noise.
        // If _sortButton is undefined, the component hasn't been initialized yet so there's
        // nothing to update in the DOM.
        if (this._sortButton) {
            // removeDescription will no-op if there is no existing message.
            // TODO(jelbourn): remove optional chaining when AriaDescriber is required.
            this._ariaDescriber?.removeDescription(this._sortButton, this._sortActionDescription);
            this._ariaDescriber?.describe(this._sortButton, newDescription);
        }
        this._sortActionDescription = newDescription;
    }
    /** Handles changes in the sorting state. */
    _handleStateChanges() {
        this._rerenderSubscription = merge(this._sort.sortChange, this._sort._stateChanges, this._intl.changes).subscribe(() => {
            if (this._isSorted()) {
                this._updateArrowDirection();
                // Do not show the animation if the header was already shown in the right position.
                if (this._viewState.toState === 'hint' || this._viewState.toState === 'active') {
                    this._disableViewStateAnimation = true;
                }
                this._setAnimationTransitionState({ fromState: this._arrowDirection, toState: 'active' });
                this._showIndicatorHint = false;
            }
            // If this header was recently active and now no longer sorted, animate away the arrow.
            if (!this._isSorted() && this._viewState && this._viewState.toState === 'active') {
                this._disableViewStateAnimation = false;
                this._setAnimationTransitionState({ fromState: 'active', toState: this._arrowDirection });
            }
            this._changeDetectorRef.markForCheck();
        });
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.2.0", ngImport: i0, type: MatSortHeader, deps: [{ token: i1.MatSortHeaderIntl }, { token: i0.ChangeDetectorRef }, { token: i2.MatSort, optional: true }, { token: 'MAT_SORT_HEADER_COLUMN_DEF', optional: true }, { token: i3.FocusMonitor }, { token: i0.ElementRef }, { token: i3.AriaDescriber, optional: true }, { token: MAT_SORT_DEFAULT_OPTIONS, optional: true }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "17.2.0", type: MatSortHeader, isStandalone: true, selector: "[mat-sort-header]", inputs: { id: ["mat-sort-header", "id"], arrowPosition: "arrowPosition", start: "start", disabled: ["disabled", "disabled", booleanAttribute], sortActionDescription: "sortActionDescription", disableClear: ["disableClear", "disableClear", booleanAttribute] }, host: { listeners: { "click": "_handleClick()", "keydown": "_handleKeydown($event)", "mouseenter": "_setIndicatorHintVisible(true)", "mouseleave": "_setIndicatorHintVisible(false)" }, properties: { "attr.aria-sort": "_getAriaSortAttribute()", "class.mat-sort-header-disabled": "_isDisabled()" }, classAttribute: "mat-sort-header" }, exportAs: ["matSortHeader"], ngImport: i0, template: "<!--\n  We set the `tabindex` on an element inside the table header, rather than the header itself,\n  because of a bug in NVDA where having a `tabindex` on a `th` breaks keyboard navigation in the\n  table (see https://github.com/nvaccess/nvda/issues/7718). This allows for the header to both\n  be focusable, and have screen readers read out its `aria-sort` state. We prefer this approach\n  over having a button with an `aria-label` inside the header, because the button's `aria-label`\n  will be read out as the user is navigating the table's cell (see #13012).\n\n  The approach is based off of: https://dequeuniversity.com/library/aria/tables/sf-sortable-grid\n-->\n<div class=\"mat-sort-header-container mat-focus-indicator\"\n     [class.mat-sort-header-sorted]=\"_isSorted()\"\n     [class.mat-sort-header-position-before]=\"arrowPosition === 'before'\"\n     [attr.tabindex]=\"_isDisabled() ? null : 0\"\n     [attr.role]=\"_isDisabled() ? null : 'button'\">\n\n  <!--\n    TODO(crisbeto): this div isn't strictly necessary, but we have to keep it due to a large\n    number of screenshot diff failures. It should be removed eventually. Note that the difference\n    isn't visible with a shorter header, but once it breaks up into multiple lines, this element\n    causes it to be center-aligned, whereas removing it will keep the text to the left.\n  -->\n  <div class=\"mat-sort-header-content\">\n    <ng-content></ng-content>\n  </div>\n\n  <!-- Disable animations while a current animation is running -->\n  @if (_renderArrow()) {\n    <div class=\"mat-sort-header-arrow\"\n        [@arrowOpacity]=\"_getArrowViewState()\"\n        [@arrowPosition]=\"_getArrowViewState()\"\n        [@allowChildren]=\"_getArrowDirectionState()\"\n        (@arrowPosition.start)=\"_disableViewStateAnimation = true\"\n        (@arrowPosition.done)=\"_disableViewStateAnimation = false\">\n      <div class=\"mat-sort-header-stem\"></div>\n      <div class=\"mat-sort-header-indicator\" [@indicator]=\"_getArrowDirectionState()\">\n        <div class=\"mat-sort-header-pointer-left\" [@leftPointer]=\"_getArrowDirectionState()\"></div>\n        <div class=\"mat-sort-header-pointer-right\" [@rightPointer]=\"_getArrowDirectionState()\"></div>\n        <div class=\"mat-sort-header-pointer-middle\"></div>\n      </div>\n    </div>\n  }\n</div>\n", styles: [".mat-sort-header-container{display:flex;cursor:pointer;align-items:center;letter-spacing:normal;outline:0}[mat-sort-header].cdk-keyboard-focused .mat-sort-header-container,[mat-sort-header].cdk-program-focused .mat-sort-header-container{border-bottom:solid 1px currentColor}.mat-sort-header-disabled .mat-sort-header-container{cursor:default}.mat-sort-header-container::before{margin:calc(calc(var(--mat-focus-indicator-border-width, 3px) + 2px)*-1)}.mat-sort-header-content{text-align:center;display:flex;align-items:center}.mat-sort-header-position-before{flex-direction:row-reverse}.mat-sort-header-arrow{height:12px;width:12px;min-width:12px;position:relative;display:flex;color:var(--mat-sort-arrow-color);opacity:0}.mat-sort-header-arrow,[dir=rtl] .mat-sort-header-position-before .mat-sort-header-arrow{margin:0 0 0 6px}.mat-sort-header-position-before .mat-sort-header-arrow,[dir=rtl] .mat-sort-header-arrow{margin:0 6px 0 0}.mat-sort-header-stem{background:currentColor;height:10px;width:2px;margin:auto;display:flex;align-items:center}.cdk-high-contrast-active .mat-sort-header-stem{width:0;border-left:solid 2px}.mat-sort-header-indicator{width:100%;height:2px;display:flex;align-items:center;position:absolute;top:0;left:0}.mat-sort-header-pointer-middle{margin:auto;height:2px;width:2px;background:currentColor;transform:rotate(45deg)}.cdk-high-contrast-active .mat-sort-header-pointer-middle{width:0;height:0;border-top:solid 2px;border-left:solid 2px}.mat-sort-header-pointer-left,.mat-sort-header-pointer-right{background:currentColor;width:6px;height:2px;position:absolute;top:0}.cdk-high-contrast-active .mat-sort-header-pointer-left,.cdk-high-contrast-active .mat-sort-header-pointer-right{width:0;height:0;border-left:solid 6px;border-top:solid 2px}.mat-sort-header-pointer-left{transform-origin:right;left:0}.mat-sort-header-pointer-right{transform-origin:left;right:0}"], animations: [
            matSortAnimations.indicator,
            matSortAnimations.leftPointer,
            matSortAnimations.rightPointer,
            matSortAnimations.arrowOpacity,
            matSortAnimations.arrowPosition,
            matSortAnimations.allowChildren,
        ], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.2.0", ngImport: i0, type: MatSortHeader, decorators: [{
            type: Component,
            args: [{ selector: '[mat-sort-header]', exportAs: 'matSortHeader', host: {
                        'class': 'mat-sort-header',
                        '(click)': '_handleClick()',
                        '(keydown)': '_handleKeydown($event)',
                        '(mouseenter)': '_setIndicatorHintVisible(true)',
                        '(mouseleave)': '_setIndicatorHintVisible(false)',
                        '[attr.aria-sort]': '_getAriaSortAttribute()',
                        '[class.mat-sort-header-disabled]': '_isDisabled()',
                    }, encapsulation: ViewEncapsulation.None, changeDetection: ChangeDetectionStrategy.OnPush, animations: [
                        matSortAnimations.indicator,
                        matSortAnimations.leftPointer,
                        matSortAnimations.rightPointer,
                        matSortAnimations.arrowOpacity,
                        matSortAnimations.arrowPosition,
                        matSortAnimations.allowChildren,
                    ], standalone: true, template: "<!--\n  We set the `tabindex` on an element inside the table header, rather than the header itself,\n  because of a bug in NVDA where having a `tabindex` on a `th` breaks keyboard navigation in the\n  table (see https://github.com/nvaccess/nvda/issues/7718). This allows for the header to both\n  be focusable, and have screen readers read out its `aria-sort` state. We prefer this approach\n  over having a button with an `aria-label` inside the header, because the button's `aria-label`\n  will be read out as the user is navigating the table's cell (see #13012).\n\n  The approach is based off of: https://dequeuniversity.com/library/aria/tables/sf-sortable-grid\n-->\n<div class=\"mat-sort-header-container mat-focus-indicator\"\n     [class.mat-sort-header-sorted]=\"_isSorted()\"\n     [class.mat-sort-header-position-before]=\"arrowPosition === 'before'\"\n     [attr.tabindex]=\"_isDisabled() ? null : 0\"\n     [attr.role]=\"_isDisabled() ? null : 'button'\">\n\n  <!--\n    TODO(crisbeto): this div isn't strictly necessary, but we have to keep it due to a large\n    number of screenshot diff failures. It should be removed eventually. Note that the difference\n    isn't visible with a shorter header, but once it breaks up into multiple lines, this element\n    causes it to be center-aligned, whereas removing it will keep the text to the left.\n  -->\n  <div class=\"mat-sort-header-content\">\n    <ng-content></ng-content>\n  </div>\n\n  <!-- Disable animations while a current animation is running -->\n  @if (_renderArrow()) {\n    <div class=\"mat-sort-header-arrow\"\n        [@arrowOpacity]=\"_getArrowViewState()\"\n        [@arrowPosition]=\"_getArrowViewState()\"\n        [@allowChildren]=\"_getArrowDirectionState()\"\n        (@arrowPosition.start)=\"_disableViewStateAnimation = true\"\n        (@arrowPosition.done)=\"_disableViewStateAnimation = false\">\n      <div class=\"mat-sort-header-stem\"></div>\n      <div class=\"mat-sort-header-indicator\" [@indicator]=\"_getArrowDirectionState()\">\n        <div class=\"mat-sort-header-pointer-left\" [@leftPointer]=\"_getArrowDirectionState()\"></div>\n        <div class=\"mat-sort-header-pointer-right\" [@rightPointer]=\"_getArrowDirectionState()\"></div>\n        <div class=\"mat-sort-header-pointer-middle\"></div>\n      </div>\n    </div>\n  }\n</div>\n", styles: [".mat-sort-header-container{display:flex;cursor:pointer;align-items:center;letter-spacing:normal;outline:0}[mat-sort-header].cdk-keyboard-focused .mat-sort-header-container,[mat-sort-header].cdk-program-focused .mat-sort-header-container{border-bottom:solid 1px currentColor}.mat-sort-header-disabled .mat-sort-header-container{cursor:default}.mat-sort-header-container::before{margin:calc(calc(var(--mat-focus-indicator-border-width, 3px) + 2px)*-1)}.mat-sort-header-content{text-align:center;display:flex;align-items:center}.mat-sort-header-position-before{flex-direction:row-reverse}.mat-sort-header-arrow{height:12px;width:12px;min-width:12px;position:relative;display:flex;color:var(--mat-sort-arrow-color);opacity:0}.mat-sort-header-arrow,[dir=rtl] .mat-sort-header-position-before .mat-sort-header-arrow{margin:0 0 0 6px}.mat-sort-header-position-before .mat-sort-header-arrow,[dir=rtl] .mat-sort-header-arrow{margin:0 6px 0 0}.mat-sort-header-stem{background:currentColor;height:10px;width:2px;margin:auto;display:flex;align-items:center}.cdk-high-contrast-active .mat-sort-header-stem{width:0;border-left:solid 2px}.mat-sort-header-indicator{width:100%;height:2px;display:flex;align-items:center;position:absolute;top:0;left:0}.mat-sort-header-pointer-middle{margin:auto;height:2px;width:2px;background:currentColor;transform:rotate(45deg)}.cdk-high-contrast-active .mat-sort-header-pointer-middle{width:0;height:0;border-top:solid 2px;border-left:solid 2px}.mat-sort-header-pointer-left,.mat-sort-header-pointer-right{background:currentColor;width:6px;height:2px;position:absolute;top:0}.cdk-high-contrast-active .mat-sort-header-pointer-left,.cdk-high-contrast-active .mat-sort-header-pointer-right{width:0;height:0;border-left:solid 6px;border-top:solid 2px}.mat-sort-header-pointer-left{transform-origin:right;left:0}.mat-sort-header-pointer-right{transform-origin:left;right:0}"] }]
        }], ctorParameters: () => [{ type: i1.MatSortHeaderIntl }, { type: i0.ChangeDetectorRef }, { type: i2.MatSort, decorators: [{
                    type: Optional
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: ['MAT_SORT_HEADER_COLUMN_DEF']
                }, {
                    type: Optional
                }] }, { type: i3.FocusMonitor }, { type: i0.ElementRef }, { type: i3.AriaDescriber, decorators: [{
                    type: Optional
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [MAT_SORT_DEFAULT_OPTIONS]
                }] }], propDecorators: { id: [{
                type: Input,
                args: ['mat-sort-header']
            }], arrowPosition: [{
                type: Input
            }], start: [{
                type: Input
            }], disabled: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], sortActionDescription: [{
                type: Input
            }], disableClear: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29ydC1oZWFkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvc29ydC9zb3J0LWhlYWRlci50cyIsIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9zb3J0L3NvcnQtaGVhZGVyLmh0bWwiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFnQixZQUFZLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUM5RCxPQUFPLEVBQUMsS0FBSyxFQUFFLEtBQUssRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQ25ELE9BQU8sRUFFTCx1QkFBdUIsRUFDdkIsaUJBQWlCLEVBQ2pCLFNBQVMsRUFDVCxVQUFVLEVBQ1YsTUFBTSxFQUNOLEtBQUssRUFHTCxRQUFRLEVBQ1IsaUJBQWlCLEVBQ2pCLGdCQUFnQixHQUNqQixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUMsS0FBSyxFQUFlLE1BQU0sTUFBTSxDQUFDO0FBQ3pDLE9BQU8sRUFDTCx3QkFBd0IsRUFDeEIsT0FBTyxHQUlSLE1BQU0sUUFBUSxDQUFDO0FBQ2hCLE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBRXBELE9BQU8sRUFBQyx3Q0FBd0MsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN2RSxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQzs7Ozs7QUEyQnJEOzs7Ozs7OztHQVFHO0FBMkJILE1BQU0sT0FBTyxhQUFhO0lBOEN4Qjs7O09BR0c7SUFDSCxJQUNJLHFCQUFxQjtRQUN2QixPQUFPLElBQUksQ0FBQyxzQkFBc0IsQ0FBQztJQUNyQyxDQUFDO0lBQ0QsSUFBSSxxQkFBcUIsQ0FBQyxLQUFhO1FBQ3JDLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMzQyxDQUFDO0lBVUQ7SUFDRTs7O09BR0c7SUFDSSxLQUF3QixFQUN2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O3dCQUM5QixpQkFBaUIsQ0FBQyxhQUFhO3dCQUMvQixpQkFBaUIsQ0FBQyxhQUFhO3FCQUNoQyxjQUNXLElBQUk7OzBCQTZFYixRQUFROzswQkFDUixNQUFNOzJCQUFDLDRCQUE0Qjs7MEJBQ25DLFFBQVE7OzBCQUtSLFFBQVE7OzBCQUNSLFFBQVE7OzBCQUNSLE1BQU07MkJBQUMsd0JBQXdCO3lDQWxEUixFQUFFO3NCQUEzQixLQUFLO3VCQUFDLGlCQUFpQjtnQkFHZixhQUFhO3NCQUFyQixLQUFLO2dCQUdHLEtBQUs7c0JBQWIsS0FBSztnQkFJTixRQUFRO3NCQURQLEtBQUs7dUJBQUMsRUFBQyxTQUFTLEVBQUUsZ0JBQWdCLEVBQUM7Z0JBUWhDLHFCQUFxQjtzQkFEeEIsS0FBSztnQkFjTixZQUFZO3NCQURYLEtBQUs7dUJBQUMsRUFBQyxTQUFTLEVBQUUsZ0JBQWdCLEVBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtBcmlhRGVzY3JpYmVyLCBGb2N1c01vbml0b3J9IGZyb20gJ0Bhbmd1bGFyL2Nkay9hMTF5JztcbmltcG9ydCB7RU5URVIsIFNQQUNFfSBmcm9tICdAYW5ndWxhci9jZGsva2V5Y29kZXMnO1xuaW1wb3J0IHtcbiAgQWZ0ZXJWaWV3SW5pdCxcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBDb21wb25lbnQsXG4gIEVsZW1lbnRSZWYsXG4gIEluamVjdCxcbiAgSW5wdXQsXG4gIE9uRGVzdHJveSxcbiAgT25Jbml0LFxuICBPcHRpb25hbCxcbiAgVmlld0VuY2Fwc3VsYXRpb24sXG4gIGJvb2xlYW5BdHRyaWJ1dGUsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHttZXJnZSwgU3Vic2NyaXB0aW9ufSBmcm9tICdyeGpzJztcbmltcG9ydCB7XG4gIE1BVF9TT1JUX0RFRkFVTFRfT1BUSU9OUyxcbiAgTWF0U29ydCxcbiAgTWF0U29ydGFibGUsXG4gIE1hdFNvcnREZWZhdWx0T3B0aW9ucyxcbiAgU29ydEhlYWRlckFycm93UG9zaXRpb24sXG59IGZyb20gJy4vc29ydCc7XG5pbXBvcnQge21hdFNvcnRBbmltYXRpb25zfSBmcm9tICcuL3NvcnQtYW5pbWF0aW9ucyc7XG5pbXBvcnQge1NvcnREaXJlY3Rpb259IGZyb20gJy4vc29ydC1kaXJlY3Rpb24nO1xuaW1wb3J0IHtnZXRTb3J0SGVhZGVyTm90Q29udGFpbmVkV2l0aGluU29ydEVycm9yfSBmcm9tICcuL3NvcnQtZXJyb3JzJztcbmltcG9ydCB7TWF0U29ydEhlYWRlckludGx9IGZyb20gJy4vc29ydC1oZWFkZXItaW50bCc7XG5cbi8qKlxuICogVmFsaWQgcG9zaXRpb25zIGZvciB0aGUgYXJyb3cgdG8gYmUgaW4gZm9yIGl0cyBvcGFjaXR5IGFuZCB0cmFuc2xhdGlvbi4gSWYgdGhlIHN0YXRlIGlzIGFcbiAqIHNvcnQgZGlyZWN0aW9uLCB0aGUgcG9zaXRpb24gb2YgdGhlIGFycm93IHdpbGwgYmUgYWJvdmUvYmVsb3cgYW5kIG9wYWNpdHkgMC4gSWYgdGhlIHN0YXRlIGlzXG4gKiBoaW50LCB0aGUgYXJyb3cgd2lsbCBiZSBpbiB0aGUgY2VudGVyIHdpdGggYSBzbGlnaHQgb3BhY2l0eS4gQWN0aXZlIHN0YXRlIG1lYW5zIHRoZSBhcnJvdyB3aWxsXG4gKiBiZSBmdWxseSBvcGFxdWUgaW4gdGhlIGNlbnRlci5cbiAqXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbmV4cG9ydCB0eXBlIEFycm93Vmlld1N0YXRlID0gU29ydERpcmVjdGlvbiB8ICdoaW50JyB8ICdhY3RpdmUnO1xuXG4vKipcbiAqIFN0YXRlcyBkZXNjcmliaW5nIHRoZSBhcnJvdydzIGFuaW1hdGVkIHBvc2l0aW9uIChhbmltYXRpbmcgZnJvbVN0YXRlIHRvIHRvU3RhdGUpLlxuICogSWYgdGhlIGZyb21TdGF0ZSBpcyBub3QgZGVmaW5lZCwgdGhlcmUgd2lsbCBiZSBubyBhbmltYXRlZCB0cmFuc2l0aW9uIHRvIHRoZSB0b1N0YXRlLlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFycm93Vmlld1N0YXRlVHJhbnNpdGlvbiB7XG4gIGZyb21TdGF0ZT86IEFycm93Vmlld1N0YXRlO1xuICB0b1N0YXRlPzogQXJyb3dWaWV3U3RhdGU7XG59XG5cbi8qKiBDb2x1bW4gZGVmaW5pdGlvbiBhc3NvY2lhdGVkIHdpdGggYSBgTWF0U29ydEhlYWRlcmAuICovXG5pbnRlcmZhY2UgTWF0U29ydEhlYWRlckNvbHVtbkRlZiB7XG4gIG5hbWU6IHN0cmluZztcbn1cblxuLyoqXG4gKiBBcHBsaWVzIHNvcnRpbmcgYmVoYXZpb3IgKGNsaWNrIHRvIGNoYW5nZSBzb3J0KSBhbmQgc3R5bGVzIHRvIGFuIGVsZW1lbnQsIGluY2x1ZGluZyBhblxuICogYXJyb3cgdG8gZGlzcGxheSB0aGUgY3VycmVudCBzb3J0IGRpcmVjdGlvbi5cbiAqXG4gKiBNdXN0IGJlIHByb3ZpZGVkIHdpdGggYW4gaWQgYW5kIGNvbnRhaW5lZCB3aXRoaW4gYSBwYXJlbnQgTWF0U29ydCBkaXJlY3RpdmUuXG4gKlxuICogSWYgdXNlZCBvbiBoZWFkZXIgY2VsbHMgaW4gYSBDZGtUYWJsZSwgaXQgd2lsbCBhdXRvbWF0aWNhbGx5IGRlZmF1bHQgaXRzIGlkIGZyb20gaXRzIGNvbnRhaW5pbmdcbiAqIGNvbHVtbiBkZWZpbml0aW9uLlxuICovXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdbbWF0LXNvcnQtaGVhZGVyXScsXG4gIGV4cG9ydEFzOiAnbWF0U29ydEhlYWRlcicsXG4gIHRlbXBsYXRlVXJsOiAnc29ydC1oZWFkZXIuaHRtbCcsXG4gIHN0eWxlVXJsOiAnc29ydC1oZWFkZXIuY3NzJyxcbiAgaG9zdDoge1xuICAgICdjbGFzcyc6ICdtYXQtc29ydC1oZWFkZXInLFxuICAgICcoY2xpY2spJzogJ19oYW5kbGVDbGljaygpJyxcbiAgICAnKGtleWRvd24pJzogJ19oYW5kbGVLZXlkb3duKCRldmVudCknLFxuICAgICcobW91c2VlbnRlciknOiAnX3NldEluZGljYXRvckhpbnRWaXNpYmxlKHRydWUpJyxcbiAgICAnKG1vdXNlbGVhdmUpJzogJ19zZXRJbmRpY2F0b3JIaW50VmlzaWJsZShmYWxzZSknLFxuICAgICdbYXR0ci5hcmlhLXNvcnRdJzogJ19nZXRBcmlhU29ydEF0dHJpYnV0ZSgpJyxcbiAgICAnW2NsYXNzLm1hdC1zb3J0LWhlYWRlci1kaXNhYmxlZF0nOiAnX2lzRGlzYWJsZWQoKScsXG4gIH0sXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxuICBhbmltYXRpb25zOiBbXG4gICAgbWF0U29ydEFuaW1hdGlvbnMuaW5kaWNhdG9yLFxuICAgIG1hdFNvcnRBbmltYXRpb25zLmxlZnRQb2ludGVyLFxuICAgIG1hdFNvcnRBbmltYXRpb25zLnJpZ2h0UG9pbnRlcixcbiAgICBtYXRTb3J0QW5pbWF0aW9ucy5hcnJvd09wYWNpdHksXG4gICAgbWF0U29ydEFuaW1hdGlvbnMuYXJyb3dQb3NpdGlvbixcbiAgICBtYXRTb3J0QW5pbWF0aW9ucy5hbGxvd0NoaWxkcmVuLFxuICBdLFxuICBzdGFuZGFsb25lOiB0cnVlLFxufSlcbmV4cG9ydCBjbGFzcyBNYXRTb3J0SGVhZGVyIGltcGxlbWVudHMgTWF0U29ydGFibGUsIE9uRGVzdHJveSwgT25Jbml0LCBBZnRlclZpZXdJbml0IHtcbiAgcHJpdmF0ZSBfcmVyZW5kZXJTdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbjtcblxuICAvKipcbiAgICogVGhlIGVsZW1lbnQgd2l0aCByb2xlPVwiYnV0dG9uXCIgaW5zaWRlIHRoaXMgY29tcG9uZW50J3Mgdmlldy4gV2UgbmVlZCB0aGlzXG4gICAqIGluIG9yZGVyIHRvIGFwcGx5IGEgZGVzY3JpcHRpb24gd2l0aCBBcmlhRGVzY3JpYmVyLlxuICAgKi9cbiAgcHJpdmF0ZSBfc29ydEJ1dHRvbjogSFRNTEVsZW1lbnQ7XG5cbiAgLyoqXG4gICAqIEZsYWcgc2V0IHRvIHRydWUgd2hlbiB0aGUgaW5kaWNhdG9yIHNob3VsZCBiZSBkaXNwbGF5ZWQgd2hpbGUgdGhlIHNvcnQgaXMgbm90IGFjdGl2ZS4gVXNlZCB0b1xuICAgKiBwcm92aWRlIGFuIGFmZm9yZGFuY2UgdGhhdCB0aGUgaGVhZGVyIGlzIHNvcnRhYmxlIGJ5IHNob3dpbmcgb24gZm9jdXMgYW5kIGhvdmVyLlxuICAgKi9cbiAgX3Nob3dJbmRpY2F0b3JIaW50OiBib29sZWFuID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIFRoZSB2aWV3IHRyYW5zaXRpb24gc3RhdGUgb2YgdGhlIGFycm93ICh0cmFuc2xhdGlvbi8gb3BhY2l0eSkgLSBpbmRpY2F0ZXMgaXRzIGBmcm9tYCBhbmQgYHRvYFxuICAgKiBwb3NpdGlvbiB0aHJvdWdoIHRoZSBhbmltYXRpb24uIElmIGFuaW1hdGlvbnMgYXJlIGN1cnJlbnRseSBkaXNhYmxlZCwgdGhlIGZyb21TdGF0ZSBpcyByZW1vdmVkXG4gICAqIHNvIHRoYXQgdGhlcmUgaXMgbm8gYW5pbWF0aW9uIGRpc3BsYXllZC5cbiAgICovXG4gIF92aWV3U3RhdGU6IEFycm93Vmlld1N0YXRlVHJhbnNpdGlvbiA9IHt9O1xuXG4gIC8qKiBUaGUgZGlyZWN0aW9uIHRoZSBhcnJvdyBzaG91bGQgYmUgZmFjaW5nIGFjY29yZGluZyB0byB0aGUgY3VycmVudCBzdGF0ZS4gKi9cbiAgX2Fycm93RGlyZWN0aW9uOiBTb3J0RGlyZWN0aW9uID0gJyc7XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIHZpZXcgc3RhdGUgYW5pbWF0aW9uIHNob3VsZCBzaG93IHRoZSB0cmFuc2l0aW9uIGJldHdlZW4gdGhlIGBmcm9tYCBhbmQgYHRvYCBzdGF0ZXMuXG4gICAqL1xuICBfZGlzYWJsZVZpZXdTdGF0ZUFuaW1hdGlvbiA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBJRCBvZiB0aGlzIHNvcnQgaGVhZGVyLiBJZiB1c2VkIHdpdGhpbiB0aGUgY29udGV4dCBvZiBhIENka0NvbHVtbkRlZiwgdGhpcyB3aWxsIGRlZmF1bHQgdG9cbiAgICogdGhlIGNvbHVtbidzIG5hbWUuXG4gICAqL1xuICBASW5wdXQoJ21hdC1zb3J0LWhlYWRlcicpIGlkOiBzdHJpbmc7XG5cbiAgLyoqIFNldHMgdGhlIHBvc2l0aW9uIG9mIHRoZSBhcnJvdyB0aGF0IGRpc3BsYXlzIHdoZW4gc29ydGVkLiAqL1xuICBASW5wdXQoKSBhcnJvd1Bvc2l0aW9uOiBTb3J0SGVhZGVyQXJyb3dQb3NpdGlvbiA9ICdhZnRlcic7XG5cbiAgLyoqIE92ZXJyaWRlcyB0aGUgc29ydCBzdGFydCB2YWx1ZSBvZiB0aGUgY29udGFpbmluZyBNYXRTb3J0IGZvciB0aGlzIE1hdFNvcnRhYmxlLiAqL1xuICBASW5wdXQoKSBzdGFydDogU29ydERpcmVjdGlvbjtcblxuICAvKiogd2hldGhlciB0aGUgc29ydCBoZWFkZXIgaXMgZGlzYWJsZWQuICovXG4gIEBJbnB1dCh7dHJhbnNmb3JtOiBib29sZWFuQXR0cmlidXRlfSlcbiAgZGlzYWJsZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAvKipcbiAgICogRGVzY3JpcHRpb24gYXBwbGllZCB0byBNYXRTb3J0SGVhZGVyJ3MgYnV0dG9uIGVsZW1lbnQgd2l0aCBhcmlhLWRlc2NyaWJlZGJ5LiBUaGlzIHRleHQgc2hvdWxkXG4gICAqIGRlc2NyaWJlIHRoZSBhY3Rpb24gdGhhdCB3aWxsIG9jY3VyIHdoZW4gdGhlIHVzZXIgY2xpY2tzIHRoZSBzb3J0IGhlYWRlci5cbiAgICovXG4gIEBJbnB1dCgpXG4gIGdldCBzb3J0QWN0aW9uRGVzY3JpcHRpb24oKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fc29ydEFjdGlvbkRlc2NyaXB0aW9uO1xuICB9XG4gIHNldCBzb3J0QWN0aW9uRGVzY3JpcHRpb24odmFsdWU6IHN0cmluZykge1xuICAgIHRoaXMuX3VwZGF0ZVNvcnRBY3Rpb25EZXNjcmlwdGlvbih2YWx1ZSk7XG4gIH1cbiAgLy8gRGVmYXVsdCB0aGUgYWN0aW9uIGRlc2NyaXB0aW9uIHRvIFwiU29ydFwiIGJlY2F1c2UgaXQncyBiZXR0ZXIgdGhhbiBub3RoaW5nLlxuICAvLyBXaXRob3V0IGEgZGVzY3JpcHRpb24sIHRoZSBidXR0b24ncyBsYWJlbCBjb21lcyBmcm9tIHRoZSBzb3J0IGhlYWRlciB0ZXh0IGNvbnRlbnQsXG4gIC8vIHdoaWNoIGRvZXNuJ3QgZ2l2ZSBhbnkgaW5kaWNhdGlvbiB0aGF0IGl0IHBlcmZvcm1zIGEgc29ydGluZyBvcGVyYXRpb24uXG4gIHByaXZhdGUgX3NvcnRBY3Rpb25EZXNjcmlwdGlvbjogc3RyaW5nID0gJ1NvcnQnO1xuXG4gIC8qKiBPdmVycmlkZXMgdGhlIGRpc2FibGUgY2xlYXIgdmFsdWUgb2YgdGhlIGNvbnRhaW5pbmcgTWF0U29ydCBmb3IgdGhpcyBNYXRTb3J0YWJsZS4gKi9cbiAgQElucHV0KHt0cmFuc2Zvcm06IGJvb2xlYW5BdHRyaWJ1dGV9KVxuICBkaXNhYmxlQ2xlYXI6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IoXG4gICAgLyoqXG4gICAgICogQGRlcHJlY2F0ZWQgYF9pbnRsYCBwYXJhbWV0ZXIgaXNuJ3QgYmVpbmcgdXNlZCBhbnltb3JlIGFuZCBpdCdsbCBiZSByZW1vdmVkLlxuICAgICAqIEBicmVha2luZy1jaGFuZ2UgMTMuMC4wXG4gICAgICovXG4gICAgcHVibGljIF9pbnRsOiBNYXRTb3J0SGVhZGVySW50bCxcbiAgICBwcml2YXRlIF9jaGFuZ2VEZXRlY3RvclJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gICAgLy8gYE1hdFNvcnRgIGlzIG5vdCBvcHRpb25hbGx5IGluamVjdGVkLCBidXQganVzdCBhc3NlcnRlZCBtYW51YWxseSB3LyBiZXR0ZXIgZXJyb3IuXG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOiBsaWdodHdlaWdodC10b2tlbnNcbiAgICBAT3B0aW9uYWwoKSBwdWJsaWMgX3NvcnQ6IE1hdFNvcnQsXG4gICAgQEluamVjdCgnTUFUX1NPUlRfSEVBREVSX0NPTFVNTl9ERUYnKVxuICAgIEBPcHRpb25hbCgpXG4gICAgcHVibGljIF9jb2x1bW5EZWY6IE1hdFNvcnRIZWFkZXJDb2x1bW5EZWYsXG4gICAgcHJpdmF0ZSBfZm9jdXNNb25pdG9yOiBGb2N1c01vbml0b3IsXG4gICAgcHJpdmF0ZSBfZWxlbWVudFJlZjogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sXG4gICAgLyoqIEBicmVha2luZy1jaGFuZ2UgMTQuMC4wIF9hcmlhRGVzY3JpYmVyIHdpbGwgYmUgcmVxdWlyZWQuICovXG4gICAgQE9wdGlvbmFsKCkgcHJpdmF0ZSBfYXJpYURlc2NyaWJlcj86IEFyaWFEZXNjcmliZXIgfCBudWxsLFxuICAgIEBPcHRpb25hbCgpXG4gICAgQEluamVjdChNQVRfU09SVF9ERUZBVUxUX09QVElPTlMpXG4gICAgZGVmYXVsdE9wdGlvbnM/OiBNYXRTb3J0RGVmYXVsdE9wdGlvbnMsXG4gICkge1xuICAgIC8vIE5vdGUgdGhhdCB3ZSB1c2UgYSBzdHJpbmcgdG9rZW4gZm9yIHRoZSBgX2NvbHVtbkRlZmAsIGJlY2F1c2UgdGhlIHZhbHVlIGlzIHByb3ZpZGVkIGJvdGggYnlcbiAgICAvLyBgbWF0ZXJpYWwvdGFibGVgIGFuZCBgY2RrL3RhYmxlYCBhbmQgd2UgY2FuJ3QgaGF2ZSB0aGUgQ0RLIGRlcGVuZGluZyBvbiBNYXRlcmlhbCxcbiAgICAvLyBhbmQgd2Ugd2FudCB0byBhdm9pZCBoYXZpbmcgdGhlIHNvcnQgaGVhZGVyIGRlcGVuZGluZyBvbiB0aGUgQ0RLIHRhYmxlIGJlY2F1c2VcbiAgICAvLyBvZiB0aGlzIHNpbmdsZSByZWZlcmVuY2UuXG4gICAgaWYgKCFfc29ydCAmJiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSkge1xuICAgICAgdGhyb3cgZ2V0U29ydEhlYWRlck5vdENvbnRhaW5lZFdpdGhpblNvcnRFcnJvcigpO1xuICAgIH1cblxuICAgIGlmIChkZWZhdWx0T3B0aW9ucz8uYXJyb3dQb3NpdGlvbikge1xuICAgICAgdGhpcy5hcnJvd1Bvc2l0aW9uID0gZGVmYXVsdE9wdGlvbnM/LmFycm93UG9zaXRpb247XG4gICAgfVxuXG4gICAgdGhpcy5faGFuZGxlU3RhdGVDaGFuZ2VzKCk7XG4gIH1cblxuICBuZ09uSW5pdCgpIHtcbiAgICBpZiAoIXRoaXMuaWQgJiYgdGhpcy5fY29sdW1uRGVmKSB7XG4gICAgICB0aGlzLmlkID0gdGhpcy5fY29sdW1uRGVmLm5hbWU7XG4gICAgfVxuXG4gICAgLy8gSW5pdGlhbGl6ZSB0aGUgZGlyZWN0aW9uIG9mIHRoZSBhcnJvdyBhbmQgc2V0IHRoZSB2aWV3IHN0YXRlIHRvIGJlIGltbWVkaWF0ZWx5IHRoYXQgc3RhdGUuXG4gICAgdGhpcy5fdXBkYXRlQXJyb3dEaXJlY3Rpb24oKTtcbiAgICB0aGlzLl9zZXRBbmltYXRpb25UcmFuc2l0aW9uU3RhdGUoe1xuICAgICAgdG9TdGF0ZTogdGhpcy5faXNTb3J0ZWQoKSA/ICdhY3RpdmUnIDogdGhpcy5fYXJyb3dEaXJlY3Rpb24sXG4gICAgfSk7XG5cbiAgICB0aGlzLl9zb3J0LnJlZ2lzdGVyKHRoaXMpO1xuXG4gICAgdGhpcy5fc29ydEJ1dHRvbiA9IHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcubWF0LXNvcnQtaGVhZGVyLWNvbnRhaW5lcicpITtcbiAgICB0aGlzLl91cGRhdGVTb3J0QWN0aW9uRGVzY3JpcHRpb24odGhpcy5fc29ydEFjdGlvbkRlc2NyaXB0aW9uKTtcbiAgfVxuXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAgICAvLyBXZSB1c2UgdGhlIGZvY3VzIG1vbml0b3IgYmVjYXVzZSB3ZSBhbHNvIHdhbnQgdG8gc3R5bGVcbiAgICAvLyB0aGluZ3MgZGlmZmVyZW50bHkgYmFzZWQgb24gdGhlIGZvY3VzIG9yaWdpbi5cbiAgICB0aGlzLl9mb2N1c01vbml0b3IubW9uaXRvcih0aGlzLl9lbGVtZW50UmVmLCB0cnVlKS5zdWJzY3JpYmUob3JpZ2luID0+IHtcbiAgICAgIGNvbnN0IG5ld1N0YXRlID0gISFvcmlnaW47XG4gICAgICBpZiAobmV3U3RhdGUgIT09IHRoaXMuX3Nob3dJbmRpY2F0b3JIaW50KSB7XG4gICAgICAgIHRoaXMuX3NldEluZGljYXRvckhpbnRWaXNpYmxlKG5ld1N0YXRlKTtcbiAgICAgICAgdGhpcy5fY2hhbmdlRGV0ZWN0b3JSZWYubWFya0ZvckNoZWNrKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLl9mb2N1c01vbml0b3Iuc3RvcE1vbml0b3JpbmcodGhpcy5fZWxlbWVudFJlZik7XG4gICAgdGhpcy5fc29ydC5kZXJlZ2lzdGVyKHRoaXMpO1xuICAgIHRoaXMuX3JlcmVuZGVyU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgXCJoaW50XCIgc3RhdGUgc3VjaCB0aGF0IHRoZSBhcnJvdyB3aWxsIGJlIHNlbWktdHJhbnNwYXJlbnRseSBkaXNwbGF5ZWQgYXMgYSBoaW50IHRvIHRoZVxuICAgKiB1c2VyIHNob3dpbmcgd2hhdCB0aGUgYWN0aXZlIHNvcnQgd2lsbCBiZWNvbWUuIElmIHNldCB0byBmYWxzZSwgdGhlIGFycm93IHdpbGwgZmFkZSBhd2F5LlxuICAgKi9cbiAgX3NldEluZGljYXRvckhpbnRWaXNpYmxlKHZpc2libGU6IGJvb2xlYW4pIHtcbiAgICAvLyBOby1vcCBpZiB0aGUgc29ydCBoZWFkZXIgaXMgZGlzYWJsZWQgLSBzaG91bGQgbm90IG1ha2UgdGhlIGhpbnQgdmlzaWJsZS5cbiAgICBpZiAodGhpcy5faXNEaXNhYmxlZCgpICYmIHZpc2libGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9zaG93SW5kaWNhdG9ySGludCA9IHZpc2libGU7XG5cbiAgICBpZiAoIXRoaXMuX2lzU29ydGVkKCkpIHtcbiAgICAgIHRoaXMuX3VwZGF0ZUFycm93RGlyZWN0aW9uKCk7XG4gICAgICBpZiAodGhpcy5fc2hvd0luZGljYXRvckhpbnQpIHtcbiAgICAgICAgdGhpcy5fc2V0QW5pbWF0aW9uVHJhbnNpdGlvblN0YXRlKHtmcm9tU3RhdGU6IHRoaXMuX2Fycm93RGlyZWN0aW9uLCB0b1N0YXRlOiAnaGludCd9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3NldEFuaW1hdGlvblRyYW5zaXRpb25TdGF0ZSh7ZnJvbVN0YXRlOiAnaGludCcsIHRvU3RhdGU6IHRoaXMuX2Fycm93RGlyZWN0aW9ufSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGFuaW1hdGlvbiB0cmFuc2l0aW9uIHZpZXcgc3RhdGUgZm9yIHRoZSBhcnJvdydzIHBvc2l0aW9uIGFuZCBvcGFjaXR5LiBJZiB0aGVcbiAgICogYGRpc2FibGVWaWV3U3RhdGVBbmltYXRpb25gIGZsYWcgaXMgc2V0IHRvIHRydWUsIHRoZSBgZnJvbVN0YXRlYCB3aWxsIGJlIGlnbm9yZWQgc28gdGhhdFxuICAgKiBubyBhbmltYXRpb24gYXBwZWFycy5cbiAgICovXG4gIF9zZXRBbmltYXRpb25UcmFuc2l0aW9uU3RhdGUodmlld1N0YXRlOiBBcnJvd1ZpZXdTdGF0ZVRyYW5zaXRpb24pIHtcbiAgICB0aGlzLl92aWV3U3RhdGUgPSB2aWV3U3RhdGUgfHwge307XG5cbiAgICAvLyBJZiB0aGUgYW5pbWF0aW9uIGZvciBhcnJvdyBwb3NpdGlvbiBzdGF0ZSAob3BhY2l0eS90cmFuc2xhdGlvbikgc2hvdWxkIGJlIGRpc2FibGVkLFxuICAgIC8vIHJlbW92ZSB0aGUgZnJvbVN0YXRlIHNvIHRoYXQgaXQganVtcHMgcmlnaHQgdG8gdGhlIHRvU3RhdGUuXG4gICAgaWYgKHRoaXMuX2Rpc2FibGVWaWV3U3RhdGVBbmltYXRpb24pIHtcbiAgICAgIHRoaXMuX3ZpZXdTdGF0ZSA9IHt0b1N0YXRlOiB2aWV3U3RhdGUudG9TdGF0ZX07XG4gICAgfVxuICB9XG5cbiAgLyoqIFRyaWdnZXJzIHRoZSBzb3J0IG9uIHRoaXMgc29ydCBoZWFkZXIgYW5kIHJlbW92ZXMgdGhlIGluZGljYXRvciBoaW50LiAqL1xuICBfdG9nZ2xlT25JbnRlcmFjdGlvbigpIHtcbiAgICB0aGlzLl9zb3J0LnNvcnQodGhpcyk7XG5cbiAgICAvLyBEbyBub3Qgc2hvdyB0aGUgYW5pbWF0aW9uIGlmIHRoZSBoZWFkZXIgd2FzIGFscmVhZHkgc2hvd24gaW4gdGhlIHJpZ2h0IHBvc2l0aW9uLlxuICAgIGlmICh0aGlzLl92aWV3U3RhdGUudG9TdGF0ZSA9PT0gJ2hpbnQnIHx8IHRoaXMuX3ZpZXdTdGF0ZS50b1N0YXRlID09PSAnYWN0aXZlJykge1xuICAgICAgdGhpcy5fZGlzYWJsZVZpZXdTdGF0ZUFuaW1hdGlvbiA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgX2hhbmRsZUNsaWNrKCkge1xuICAgIGlmICghdGhpcy5faXNEaXNhYmxlZCgpKSB7XG4gICAgICB0aGlzLl9zb3J0LnNvcnQodGhpcyk7XG4gICAgfVxuICB9XG5cbiAgX2hhbmRsZUtleWRvd24oZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcbiAgICBpZiAoIXRoaXMuX2lzRGlzYWJsZWQoKSAmJiAoZXZlbnQua2V5Q29kZSA9PT0gU1BBQ0UgfHwgZXZlbnQua2V5Q29kZSA9PT0gRU5URVIpKSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgdGhpcy5fdG9nZ2xlT25JbnRlcmFjdGlvbigpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoaXMgTWF0U29ydEhlYWRlciBpcyBjdXJyZW50bHkgc29ydGVkIGluIGVpdGhlciBhc2NlbmRpbmcgb3IgZGVzY2VuZGluZyBvcmRlci4gKi9cbiAgX2lzU29ydGVkKCkge1xuICAgIHJldHVybiAoXG4gICAgICB0aGlzLl9zb3J0LmFjdGl2ZSA9PSB0aGlzLmlkICYmXG4gICAgICAodGhpcy5fc29ydC5kaXJlY3Rpb24gPT09ICdhc2MnIHx8IHRoaXMuX3NvcnQuZGlyZWN0aW9uID09PSAnZGVzYycpXG4gICAgKTtcbiAgfVxuXG4gIC8qKiBSZXR1cm5zIHRoZSBhbmltYXRpb24gc3RhdGUgZm9yIHRoZSBhcnJvdyBkaXJlY3Rpb24gKGluZGljYXRvciBhbmQgcG9pbnRlcnMpLiAqL1xuICBfZ2V0QXJyb3dEaXJlY3Rpb25TdGF0ZSgpIHtcbiAgICByZXR1cm4gYCR7dGhpcy5faXNTb3J0ZWQoKSA/ICdhY3RpdmUtJyA6ICcnfSR7dGhpcy5fYXJyb3dEaXJlY3Rpb259YDtcbiAgfVxuXG4gIC8qKiBSZXR1cm5zIHRoZSBhcnJvdyBwb3NpdGlvbiBzdGF0ZSAob3BhY2l0eSwgdHJhbnNsYXRpb24pLiAqL1xuICBfZ2V0QXJyb3dWaWV3U3RhdGUoKSB7XG4gICAgY29uc3QgZnJvbVN0YXRlID0gdGhpcy5fdmlld1N0YXRlLmZyb21TdGF0ZTtcbiAgICByZXR1cm4gKGZyb21TdGF0ZSA/IGAke2Zyb21TdGF0ZX0tdG8tYCA6ICcnKSArIHRoaXMuX3ZpZXdTdGF0ZS50b1N0YXRlO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIGRpcmVjdGlvbiB0aGUgYXJyb3cgc2hvdWxkIGJlIHBvaW50aW5nLiBJZiBpdCBpcyBub3Qgc29ydGVkLCB0aGUgYXJyb3cgc2hvdWxkIGJlXG4gICAqIGZhY2luZyB0aGUgc3RhcnQgZGlyZWN0aW9uLiBPdGhlcndpc2UgaWYgaXQgaXMgc29ydGVkLCB0aGUgYXJyb3cgc2hvdWxkIHBvaW50IGluIHRoZSBjdXJyZW50bHlcbiAgICogYWN0aXZlIHNvcnRlZCBkaXJlY3Rpb24uIFRoZSByZWFzb24gdGhpcyBpcyB1cGRhdGVkIHRocm91Z2ggYSBmdW5jdGlvbiBpcyBiZWNhdXNlIHRoZSBkaXJlY3Rpb25cbiAgICogc2hvdWxkIG9ubHkgYmUgY2hhbmdlZCBhdCBzcGVjaWZpYyB0aW1lcyAtIHdoZW4gZGVhY3RpdmF0ZWQgYnV0IHRoZSBoaW50IGlzIGRpc3BsYXllZCBhbmQgd2hlblxuICAgKiB0aGUgc29ydCBpcyBhY3RpdmUgYW5kIHRoZSBkaXJlY3Rpb24gY2hhbmdlcy4gT3RoZXJ3aXNlIHRoZSBhcnJvdydzIGRpcmVjdGlvbiBzaG91bGQgbGluZ2VyXG4gICAqIGluIGNhc2VzIHN1Y2ggYXMgdGhlIHNvcnQgYmVjb21pbmcgZGVhY3RpdmF0ZWQgYnV0IHdlIHdhbnQgdG8gYW5pbWF0ZSB0aGUgYXJyb3cgYXdheSB3aGlsZVxuICAgKiBwcmVzZXJ2aW5nIGl0cyBkaXJlY3Rpb24sIGV2ZW4gdGhvdWdoIHRoZSBuZXh0IHNvcnQgZGlyZWN0aW9uIGlzIGFjdHVhbGx5IGRpZmZlcmVudCBhbmQgc2hvdWxkXG4gICAqIG9ubHkgYmUgY2hhbmdlZCBvbmNlIHRoZSBhcnJvdyBkaXNwbGF5cyBhZ2FpbiAoaGludCBvciBhY3RpdmF0aW9uKS5cbiAgICovXG4gIF91cGRhdGVBcnJvd0RpcmVjdGlvbigpIHtcbiAgICB0aGlzLl9hcnJvd0RpcmVjdGlvbiA9IHRoaXMuX2lzU29ydGVkKCkgPyB0aGlzLl9zb3J0LmRpcmVjdGlvbiA6IHRoaXMuc3RhcnQgfHwgdGhpcy5fc29ydC5zdGFydDtcbiAgfVxuXG4gIF9pc0Rpc2FibGVkKCkge1xuICAgIHJldHVybiB0aGlzLl9zb3J0LmRpc2FibGVkIHx8IHRoaXMuZGlzYWJsZWQ7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgYXJpYS1zb3J0IGF0dHJpYnV0ZSB0aGF0IHNob3VsZCBiZSBhcHBsaWVkIHRvIHRoaXMgc29ydCBoZWFkZXIuIElmIHRoaXMgaGVhZGVyXG4gICAqIGlzIG5vdCBzb3J0ZWQsIHJldHVybnMgbnVsbCBzbyB0aGF0IHRoZSBhdHRyaWJ1dGUgaXMgcmVtb3ZlZCBmcm9tIHRoZSBob3N0IGVsZW1lbnQuIEFyaWEgc3BlY1xuICAgKiBzYXlzIHRoYXQgdGhlIGFyaWEtc29ydCBwcm9wZXJ0eSBzaG91bGQgb25seSBiZSBwcmVzZW50IG9uIG9uZSBoZWFkZXIgYXQgYSB0aW1lLCBzbyByZW1vdmluZ1xuICAgKiBlbnN1cmVzIHRoaXMgaXMgdHJ1ZS5cbiAgICovXG4gIF9nZXRBcmlhU29ydEF0dHJpYnV0ZSgpIHtcbiAgICBpZiAoIXRoaXMuX2lzU29ydGVkKCkpIHtcbiAgICAgIHJldHVybiAnbm9uZSc7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX3NvcnQuZGlyZWN0aW9uID09ICdhc2MnID8gJ2FzY2VuZGluZycgOiAnZGVzY2VuZGluZyc7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgYXJyb3cgaW5zaWRlIHRoZSBzb3J0IGhlYWRlciBzaG91bGQgYmUgcmVuZGVyZWQuICovXG4gIF9yZW5kZXJBcnJvdygpIHtcbiAgICByZXR1cm4gIXRoaXMuX2lzRGlzYWJsZWQoKSB8fCB0aGlzLl9pc1NvcnRlZCgpO1xuICB9XG5cbiAgcHJpdmF0ZSBfdXBkYXRlU29ydEFjdGlvbkRlc2NyaXB0aW9uKG5ld0Rlc2NyaXB0aW9uOiBzdHJpbmcpIHtcbiAgICAvLyBXZSB1c2UgQXJpYURlc2NyaWJlciBmb3IgdGhlIHNvcnQgYnV0dG9uIGluc3RlYWQgb2Ygc2V0dGluZyBhbiBgYXJpYS1sYWJlbGAgYmVjYXVzZSBzb21lXG4gICAgLy8gc2NyZWVuIHJlYWRlcnMgKG5vdGFibHkgVm9pY2VPdmVyKSB3aWxsIHJlYWQgYm90aCB0aGUgY29sdW1uIGhlYWRlciAqYW5kKiB0aGUgYnV0dG9uJ3MgbGFiZWxcbiAgICAvLyBmb3IgZXZlcnkgKmNlbGwqIGluIHRoZSB0YWJsZSwgY3JlYXRpbmcgYSBsb3Qgb2YgdW5uZWNlc3Nhcnkgbm9pc2UuXG5cbiAgICAvLyBJZiBfc29ydEJ1dHRvbiBpcyB1bmRlZmluZWQsIHRoZSBjb21wb25lbnQgaGFzbid0IGJlZW4gaW5pdGlhbGl6ZWQgeWV0IHNvIHRoZXJlJ3NcbiAgICAvLyBub3RoaW5nIHRvIHVwZGF0ZSBpbiB0aGUgRE9NLlxuICAgIGlmICh0aGlzLl9zb3J0QnV0dG9uKSB7XG4gICAgICAvLyByZW1vdmVEZXNjcmlwdGlvbiB3aWxsIG5vLW9wIGlmIHRoZXJlIGlzIG5vIGV4aXN0aW5nIG1lc3NhZ2UuXG4gICAgICAvLyBUT0RPKGplbGJvdXJuKTogcmVtb3ZlIG9wdGlvbmFsIGNoYWluaW5nIHdoZW4gQXJpYURlc2NyaWJlciBpcyByZXF1aXJlZC5cbiAgICAgIHRoaXMuX2FyaWFEZXNjcmliZXI/LnJlbW92ZURlc2NyaXB0aW9uKHRoaXMuX3NvcnRCdXR0b24sIHRoaXMuX3NvcnRBY3Rpb25EZXNjcmlwdGlvbik7XG4gICAgICB0aGlzLl9hcmlhRGVzY3JpYmVyPy5kZXNjcmliZSh0aGlzLl9zb3J0QnV0dG9uLCBuZXdEZXNjcmlwdGlvbik7XG4gICAgfVxuXG4gICAgdGhpcy5fc29ydEFjdGlvbkRlc2NyaXB0aW9uID0gbmV3RGVzY3JpcHRpb247XG4gIH1cblxuICAvKiogSGFuZGxlcyBjaGFuZ2VzIGluIHRoZSBzb3J0aW5nIHN0YXRlLiAqL1xuICBwcml2YXRlIF9oYW5kbGVTdGF0ZUNoYW5nZXMoKSB7XG4gICAgdGhpcy5fcmVyZW5kZXJTdWJzY3JpcHRpb24gPSBtZXJnZShcbiAgICAgIHRoaXMuX3NvcnQuc29ydENoYW5nZSxcbiAgICAgIHRoaXMuX3NvcnQuX3N0YXRlQ2hhbmdlcyxcbiAgICAgIHRoaXMuX2ludGwuY2hhbmdlcyxcbiAgICApLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICBpZiAodGhpcy5faXNTb3J0ZWQoKSkge1xuICAgICAgICB0aGlzLl91cGRhdGVBcnJvd0RpcmVjdGlvbigpO1xuXG4gICAgICAgIC8vIERvIG5vdCBzaG93IHRoZSBhbmltYXRpb24gaWYgdGhlIGhlYWRlciB3YXMgYWxyZWFkeSBzaG93biBpbiB0aGUgcmlnaHQgcG9zaXRpb24uXG4gICAgICAgIGlmICh0aGlzLl92aWV3U3RhdGUudG9TdGF0ZSA9PT0gJ2hpbnQnIHx8IHRoaXMuX3ZpZXdTdGF0ZS50b1N0YXRlID09PSAnYWN0aXZlJykge1xuICAgICAgICAgIHRoaXMuX2Rpc2FibGVWaWV3U3RhdGVBbmltYXRpb24gPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fc2V0QW5pbWF0aW9uVHJhbnNpdGlvblN0YXRlKHtmcm9tU3RhdGU6IHRoaXMuX2Fycm93RGlyZWN0aW9uLCB0b1N0YXRlOiAnYWN0aXZlJ30pO1xuICAgICAgICB0aGlzLl9zaG93SW5kaWNhdG9ySGludCA9IGZhbHNlO1xuICAgICAgfVxuXG4gICAgICAvLyBJZiB0aGlzIGhlYWRlciB3YXMgcmVjZW50bHkgYWN0aXZlIGFuZCBub3cgbm8gbG9uZ2VyIHNvcnRlZCwgYW5pbWF0ZSBhd2F5IHRoZSBhcnJvdy5cbiAgICAgIGlmICghdGhpcy5faXNTb3J0ZWQoKSAmJiB0aGlzLl92aWV3U3RhdGUgJiYgdGhpcy5fdmlld1N0YXRlLnRvU3RhdGUgPT09ICdhY3RpdmUnKSB7XG4gICAgICAgIHRoaXMuX2Rpc2FibGVWaWV3U3RhdGVBbmltYXRpb24gPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fc2V0QW5pbWF0aW9uVHJhbnNpdGlvblN0YXRlKHtmcm9tU3RhdGU6ICdhY3RpdmUnLCB0b1N0YXRlOiB0aGlzLl9hcnJvd0RpcmVjdGlvbn0pO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKTtcbiAgICB9KTtcbiAgfVxufVxuIiwiPCEtLVxuICBXZSBzZXQgdGhlIGB0YWJpbmRleGAgb24gYW4gZWxlbWVudCBpbnNpZGUgdGhlIHRhYmxlIGhlYWRlciwgcmF0aGVyIHRoYW4gdGhlIGhlYWRlciBpdHNlbGYsXG4gIGJlY2F1c2Ugb2YgYSBidWcgaW4gTlZEQSB3aGVyZSBoYXZpbmcgYSBgdGFiaW5kZXhgIG9uIGEgYHRoYCBicmVha3Mga2V5Ym9hcmQgbmF2aWdhdGlvbiBpbiB0aGVcbiAgdGFibGUgKHNlZSBodHRwczovL2dpdGh1Yi5jb20vbnZhY2Nlc3MvbnZkYS9pc3N1ZXMvNzcxOCkuIFRoaXMgYWxsb3dzIGZvciB0aGUgaGVhZGVyIHRvIGJvdGhcbiAgYmUgZm9jdXNhYmxlLCBhbmQgaGF2ZSBzY3JlZW4gcmVhZGVycyByZWFkIG91dCBpdHMgYGFyaWEtc29ydGAgc3RhdGUuIFdlIHByZWZlciB0aGlzIGFwcHJvYWNoXG4gIG92ZXIgaGF2aW5nIGEgYnV0dG9uIHdpdGggYW4gYGFyaWEtbGFiZWxgIGluc2lkZSB0aGUgaGVhZGVyLCBiZWNhdXNlIHRoZSBidXR0b24ncyBgYXJpYS1sYWJlbGBcbiAgd2lsbCBiZSByZWFkIG91dCBhcyB0aGUgdXNlciBpcyBuYXZpZ2F0aW5nIHRoZSB0YWJsZSdzIGNlbGwgKHNlZSAjMTMwMTIpLlxuXG4gIFRoZSBhcHByb2FjaCBpcyBiYXNlZCBvZmYgb2Y6IGh0dHBzOi8vZGVxdWV1bml2ZXJzaXR5LmNvbS9saWJyYXJ5L2FyaWEvdGFibGVzL3NmLXNvcnRhYmxlLWdyaWRcbi0tPlxuPGRpdiBjbGFzcz1cIm1hdC1zb3J0LWhlYWRlci1jb250YWluZXIgbWF0LWZvY3VzLWluZGljYXRvclwiXG4gICAgIFtjbGFzcy5tYXQtc29ydC1oZWFkZXItc29ydGVkXT1cIl9pc1NvcnRlZCgpXCJcbiAgICAgW2NsYXNzLm1hdC1zb3J0LWhlYWRlci1wb3NpdGlvbi1iZWZvcmVdPVwiYXJyb3dQb3NpdGlvbiA9PT0gJ2JlZm9yZSdcIlxuICAgICBbYXR0ci50YWJpbmRleF09XCJfaXNEaXNhYmxlZCgpID8gbnVsbCA6IDBcIlxuICAgICBbYXR0ci5yb2xlXT1cIl9pc0Rpc2FibGVkKCkgPyBudWxsIDogJ2J1dHRvbidcIj5cblxuICA8IS0tXG4gICAgVE9ETyhjcmlzYmV0byk6IHRoaXMgZGl2IGlzbid0IHN0cmljdGx5IG5lY2Vzc2FyeSwgYnV0IHdlIGhhdmUgdG8ga2VlcCBpdCBkdWUgdG8gYSBsYXJnZVxuICAgIG51bWJlciBvZiBzY3JlZW5zaG90IGRpZmYgZmFpbHVyZXMuIEl0IHNob3VsZCBiZSByZW1vdmVkIGV2ZW50dWFsbHkuIE5vdGUgdGhhdCB0aGUgZGlmZmVyZW5jZVxuICAgIGlzbid0IHZpc2libGUgd2l0aCBhIHNob3J0ZXIgaGVhZGVyLCBidXQgb25jZSBpdCBicmVha3MgdXAgaW50byBtdWx0aXBsZSBsaW5lcywgdGhpcyBlbGVtZW50XG4gICAgY2F1c2VzIGl0IHRvIGJlIGNlbnRlci1hbGlnbmVkLCB3aGVyZWFzIHJlbW92aW5nIGl0IHdpbGwga2VlcCB0aGUgdGV4dCB0byB0aGUgbGVmdC5cbiAgLS0+XG4gIDxkaXYgY2xhc3M9XCJtYXQtc29ydC1oZWFkZXItY29udGVudFwiPlxuICAgIDxuZy1jb250ZW50PjwvbmctY29udGVudD5cbiAgPC9kaXY+XG5cbiAgPCEtLSBEaXNhYmxlIGFuaW1hdGlvbnMgd2hpbGUgYSBjdXJyZW50IGFuaW1hdGlvbiBpcyBydW5uaW5nIC0tPlxuICBAaWYgKF9yZW5kZXJBcnJvdygpKSB7XG4gICAgPGRpdiBjbGFzcz1cIm1hdC1zb3J0LWhlYWRlci1hcnJvd1wiXG4gICAgICAgIFtAYXJyb3dPcGFjaXR5XT1cIl9nZXRBcnJvd1ZpZXdTdGF0ZSgpXCJcbiAgICAgICAgW0BhcnJvd1Bvc2l0aW9uXT1cIl9nZXRBcnJvd1ZpZXdTdGF0ZSgpXCJcbiAgICAgICAgW0BhbGxvd0NoaWxkcmVuXT1cIl9nZXRBcnJvd0RpcmVjdGlvblN0YXRlKClcIlxuICAgICAgICAoQGFycm93UG9zaXRpb24uc3RhcnQpPVwiX2Rpc2FibGVWaWV3U3RhdGVBbmltYXRpb24gPSB0cnVlXCJcbiAgICAgICAgKEBhcnJvd1Bvc2l0aW9uLmRvbmUpPVwiX2Rpc2FibGVWaWV3U3RhdGVBbmltYXRpb24gPSBmYWxzZVwiPlxuICAgICAgPGRpdiBjbGFzcz1cIm1hdC1zb3J0LWhlYWRlci1zdGVtXCI+PC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwibWF0LXNvcnQtaGVhZGVyLWluZGljYXRvclwiIFtAaW5kaWNhdG9yXT1cIl9nZXRBcnJvd0RpcmVjdGlvblN0YXRlKClcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIm1hdC1zb3J0LWhlYWRlci1wb2ludGVyLWxlZnRcIiBbQGxlZnRQb2ludGVyXT1cIl9nZXRBcnJvd0RpcmVjdGlvblN0YXRlKClcIj48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIm1hdC1zb3J0LWhlYWRlci1wb2ludGVyLXJpZ2h0XCIgW0ByaWdodFBvaW50ZXJdPVwiX2dldEFycm93RGlyZWN0aW9uU3RhdGUoKVwiPjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwibWF0LXNvcnQtaGVhZGVyLXBvaW50ZXItbWlkZGxlXCI+PC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgfVxuPC9kaXY+XG4iXX0=