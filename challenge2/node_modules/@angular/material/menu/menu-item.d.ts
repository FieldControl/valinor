/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { FocusableOption, FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { BooleanInput } from '@angular/cdk/coercion';
import { ElementRef, OnDestroy, AfterViewInit } from '@angular/core';
import { CanDisable, CanDisableCtor, CanDisableRipple, CanDisableRippleCtor } from '@angular/material/core';
import { Subject } from 'rxjs';
import { MatMenuPanel } from './menu-panel';
/** @docs-private */
declare class MatMenuItemBase {
}
declare const _MatMenuItemMixinBase: CanDisableRippleCtor & CanDisableCtor & typeof MatMenuItemBase;
/**
 * Single item inside of a `mat-menu`. Provides the menu item styling and accessibility treatment.
 */
export declare class MatMenuItem extends _MatMenuItemMixinBase implements FocusableOption, CanDisable, CanDisableRipple, AfterViewInit, OnDestroy {
    private _elementRef;
    private _focusMonitor?;
    _parentMenu?: MatMenuPanel<MatMenuItem> | undefined;
    /** ARIA role for the menu item. */
    role: 'menuitem' | 'menuitemradio' | 'menuitemcheckbox';
    /** Stream that emits when the menu item is hovered. */
    readonly _hovered: Subject<MatMenuItem>;
    /** Stream that emits when the menu item is focused. */
    readonly _focused: Subject<MatMenuItem>;
    /** Whether the menu item is highlighted. */
    _highlighted: boolean;
    /** Whether the menu item acts as a trigger for a sub-menu. */
    _triggersSubmenu: boolean;
    constructor(_elementRef: ElementRef<HTMLElement>, 
    /**
     * @deprecated `_document` parameter is no longer being used and will be removed.
     * @breaking-change 12.0.0
     */
    _document?: any, _focusMonitor?: FocusMonitor | undefined, _parentMenu?: MatMenuPanel<MatMenuItem> | undefined);
    /** Focuses the menu item. */
    focus(origin?: FocusOrigin, options?: FocusOptions): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    /** Used to set the `tabindex`. */
    _getTabIndex(): string;
    /** Returns the host DOM element. */
    _getHostElement(): HTMLElement;
    /** Prevents the default element actions if it is disabled. */
    _checkDisabled(event: Event): void;
    /** Emits to the hover stream. */
    _handleMouseEnter(): void;
    /** Gets the label to be used when determining whether the option should be focused. */
    getLabel(): string;
    static ngAcceptInputType_disabled: BooleanInput;
    static ngAcceptInputType_disableRipple: BooleanInput;
}
export {};
