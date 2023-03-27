/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { isFakeMousedownFromScreenReader, isFakeTouchstartFromScreenReader, } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { ENTER, LEFT_ARROW, RIGHT_ARROW, SPACE } from '@angular/cdk/keycodes';
import { Overlay, OverlayConfig, } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { ChangeDetectorRef, Directive, ElementRef, EventEmitter, inject, Inject, InjectionToken, Input, NgZone, Optional, Output, Self, ViewContainerRef, } from '@angular/core';
import { normalizePassiveListenerOptions } from '@angular/cdk/platform';
import { asapScheduler, merge, of as observableOf, Subscription } from 'rxjs';
import { delay, filter, take, takeUntil } from 'rxjs/operators';
import { _MatMenuBase } from './menu';
import { throwMatMenuRecursiveError } from './menu-errors';
import { MatMenuItem } from './menu-item';
import { MAT_MENU_PANEL } from './menu-panel';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/overlay";
import * as i2 from "./menu-item";
import * as i3 from "@angular/cdk/bidi";
import * as i4 from "@angular/cdk/a11y";
/** Injection token that determines the scroll handling while the menu is open. */
export const MAT_MENU_SCROLL_STRATEGY = new InjectionToken('mat-menu-scroll-strategy');
/** @docs-private */
export function MAT_MENU_SCROLL_STRATEGY_FACTORY(overlay) {
    return () => overlay.scrollStrategies.reposition();
}
/** @docs-private */
export const MAT_MENU_SCROLL_STRATEGY_FACTORY_PROVIDER = {
    provide: MAT_MENU_SCROLL_STRATEGY,
    deps: [Overlay],
    useFactory: MAT_MENU_SCROLL_STRATEGY_FACTORY,
};
/** Options for binding a passive event listener. */
const passiveEventListenerOptions = normalizePassiveListenerOptions({ passive: true });
/**
 * Default top padding of the menu panel.
 * @deprecated No longer being used. Will be removed.
 * @breaking-change 15.0.0
 */
export const MENU_PANEL_TOP_PADDING = 8;
export class _MatMenuTriggerBase {
    /**
     * @deprecated
     * @breaking-change 8.0.0
     */
    get _deprecatedMatMenuTriggerFor() {
        return this.menu;
    }
    set _deprecatedMatMenuTriggerFor(v) {
        this.menu = v;
    }
    /** References the menu instance that the trigger is associated with. */
    get menu() {
        return this._menu;
    }
    set menu(menu) {
        if (menu === this._menu) {
            return;
        }
        this._menu = menu;
        this._menuCloseSubscription.unsubscribe();
        if (menu) {
            if (menu === this._parentMaterialMenu && (typeof ngDevMode === 'undefined' || ngDevMode)) {
                throwMatMenuRecursiveError();
            }
            this._menuCloseSubscription = menu.close.subscribe((reason) => {
                this._destroyMenu(reason);
                // If a click closed the menu, we should close the entire chain of nested menus.
                if ((reason === 'click' || reason === 'tab') && this._parentMaterialMenu) {
                    this._parentMaterialMenu.closed.emit(reason);
                }
            });
        }
        this._menuItemInstance?._setTriggersSubmenu(this.triggersSubmenu());
    }
    constructor(_overlay, _element, _viewContainerRef, scrollStrategy, parentMenu, 
    // `MatMenuTrigger` is commonly used in combination with a `MatMenuItem`.
    // tslint:disable-next-line: lightweight-tokens
    _menuItemInstance, _dir, _focusMonitor, _ngZone) {
        this._overlay = _overlay;
        this._element = _element;
        this._viewContainerRef = _viewContainerRef;
        this._menuItemInstance = _menuItemInstance;
        this._dir = _dir;
        this._focusMonitor = _focusMonitor;
        this._ngZone = _ngZone;
        this._overlayRef = null;
        this._menuOpen = false;
        this._closingActionsSubscription = Subscription.EMPTY;
        this._hoverSubscription = Subscription.EMPTY;
        this._menuCloseSubscription = Subscription.EMPTY;
        this._changeDetectorRef = inject(ChangeDetectorRef);
        /**
         * Handles touch start events on the trigger.
         * Needs to be an arrow function so we can easily use addEventListener and removeEventListener.
         */
        this._handleTouchStart = (event) => {
            if (!isFakeTouchstartFromScreenReader(event)) {
                this._openedBy = 'touch';
            }
        };
        // Tracking input type is necessary so it's possible to only auto-focus
        // the first item of the list when the menu is opened via the keyboard
        this._openedBy = undefined;
        /**
         * Whether focus should be restored when the menu is closed.
         * Note that disabling this option can have accessibility implications
         * and it's up to you to manage focus, if you decide to turn it off.
         */
        this.restoreFocus = true;
        /** Event emitted when the associated menu is opened. */
        this.menuOpened = new EventEmitter();
        /**
         * Event emitted when the associated menu is opened.
         * @deprecated Switch to `menuOpened` instead
         * @breaking-change 8.0.0
         */
        // tslint:disable-next-line:no-output-on-prefix
        this.onMenuOpen = this.menuOpened;
        /** Event emitted when the associated menu is closed. */
        this.menuClosed = new EventEmitter();
        /**
         * Event emitted when the associated menu is closed.
         * @deprecated Switch to `menuClosed` instead
         * @breaking-change 8.0.0
         */
        // tslint:disable-next-line:no-output-on-prefix
        this.onMenuClose = this.menuClosed;
        this._scrollStrategy = scrollStrategy;
        this._parentMaterialMenu = parentMenu instanceof _MatMenuBase ? parentMenu : undefined;
        _element.nativeElement.addEventListener('touchstart', this._handleTouchStart, passiveEventListenerOptions);
    }
    ngAfterContentInit() {
        this._handleHover();
    }
    ngOnDestroy() {
        if (this._overlayRef) {
            this._overlayRef.dispose();
            this._overlayRef = null;
        }
        this._element.nativeElement.removeEventListener('touchstart', this._handleTouchStart, passiveEventListenerOptions);
        this._menuCloseSubscription.unsubscribe();
        this._closingActionsSubscription.unsubscribe();
        this._hoverSubscription.unsubscribe();
    }
    /** Whether the menu is open. */
    get menuOpen() {
        return this._menuOpen;
    }
    /** The text direction of the containing app. */
    get dir() {
        return this._dir && this._dir.value === 'rtl' ? 'rtl' : 'ltr';
    }
    /** Whether the menu triggers a sub-menu or a top-level one. */
    triggersSubmenu() {
        return !!(this._menuItemInstance && this._parentMaterialMenu && this.menu);
    }
    /** Toggles the menu between the open and closed states. */
    toggleMenu() {
        return this._menuOpen ? this.closeMenu() : this.openMenu();
    }
    /** Opens the menu. */
    openMenu() {
        const menu = this.menu;
        if (this._menuOpen || !menu) {
            return;
        }
        const overlayRef = this._createOverlay(menu);
        const overlayConfig = overlayRef.getConfig();
        const positionStrategy = overlayConfig.positionStrategy;
        this._setPosition(menu, positionStrategy);
        overlayConfig.hasBackdrop =
            menu.hasBackdrop == null ? !this.triggersSubmenu() : menu.hasBackdrop;
        overlayRef.attach(this._getPortal(menu));
        if (menu.lazyContent) {
            menu.lazyContent.attach(this.menuData);
        }
        this._closingActionsSubscription = this._menuClosingActions().subscribe(() => this.closeMenu());
        this._initMenu(menu);
        if (menu instanceof _MatMenuBase) {
            menu._startAnimation();
            menu._directDescendantItems.changes.pipe(takeUntil(menu.close)).subscribe(() => {
                // Re-adjust the position without locking when the amount of items
                // changes so that the overlay is allowed to pick a new optimal position.
                positionStrategy.withLockedPosition(false).reapplyLastPosition();
                positionStrategy.withLockedPosition(true);
            });
        }
    }
    /** Closes the menu. */
    closeMenu() {
        this.menu?.close.emit();
    }
    /**
     * Focuses the menu trigger.
     * @param origin Source of the menu trigger's focus.
     */
    focus(origin, options) {
        if (this._focusMonitor && origin) {
            this._focusMonitor.focusVia(this._element, origin, options);
        }
        else {
            this._element.nativeElement.focus(options);
        }
    }
    /**
     * Updates the position of the menu to ensure that it fits all options within the viewport.
     */
    updatePosition() {
        this._overlayRef?.updatePosition();
    }
    /** Closes the menu and does the necessary cleanup. */
    _destroyMenu(reason) {
        if (!this._overlayRef || !this.menuOpen) {
            return;
        }
        const menu = this.menu;
        this._closingActionsSubscription.unsubscribe();
        this._overlayRef.detach();
        // Always restore focus if the user is navigating using the keyboard or the menu was opened
        // programmatically. We don't restore for non-root triggers, because it can prevent focus
        // from making it back to the root trigger when closing a long chain of menus by clicking
        // on the backdrop.
        if (this.restoreFocus && (reason === 'keydown' || !this._openedBy || !this.triggersSubmenu())) {
            this.focus(this._openedBy);
        }
        this._openedBy = undefined;
        if (menu instanceof _MatMenuBase) {
            menu._resetAnimation();
            if (menu.lazyContent) {
                // Wait for the exit animation to finish before detaching the content.
                menu._animationDone
                    .pipe(filter(event => event.toState === 'void'), take(1), 
                // Interrupt if the content got re-attached.
                takeUntil(menu.lazyContent._attached))
                    .subscribe({
                    next: () => menu.lazyContent.detach(),
                    // No matter whether the content got re-attached, reset the menu.
                    complete: () => this._setIsMenuOpen(false),
                });
            }
            else {
                this._setIsMenuOpen(false);
            }
        }
        else {
            this._setIsMenuOpen(false);
            menu?.lazyContent?.detach();
        }
    }
    /**
     * This method sets the menu state to open and focuses the first item if
     * the menu was opened via the keyboard.
     */
    _initMenu(menu) {
        menu.parentMenu = this.triggersSubmenu() ? this._parentMaterialMenu : undefined;
        menu.direction = this.dir;
        this._setMenuElevation(menu);
        menu.focusFirstItem(this._openedBy || 'program');
        this._setIsMenuOpen(true);
    }
    /** Updates the menu elevation based on the amount of parent menus that it has. */
    _setMenuElevation(menu) {
        if (menu.setElevation) {
            let depth = 0;
            let parentMenu = menu.parentMenu;
            while (parentMenu) {
                depth++;
                parentMenu = parentMenu.parentMenu;
            }
            menu.setElevation(depth);
        }
    }
    // set state rather than toggle to support triggers sharing a menu
    _setIsMenuOpen(isOpen) {
        if (isOpen !== this._menuOpen) {
            this._menuOpen = isOpen;
            this._menuOpen ? this.menuOpened.emit() : this.menuClosed.emit();
            if (this.triggersSubmenu()) {
                this._menuItemInstance._setHighlighted(isOpen);
            }
            this._changeDetectorRef.markForCheck();
        }
    }
    /**
     * This method creates the overlay from the provided menu's template and saves its
     * OverlayRef so that it can be attached to the DOM when openMenu is called.
     */
    _createOverlay(menu) {
        if (!this._overlayRef) {
            const config = this._getOverlayConfig(menu);
            this._subscribeToPositions(menu, config.positionStrategy);
            this._overlayRef = this._overlay.create(config);
            // Consume the `keydownEvents` in order to prevent them from going to another overlay.
            // Ideally we'd also have our keyboard event logic in here, however doing so will
            // break anybody that may have implemented the `MatMenuPanel` themselves.
            this._overlayRef.keydownEvents().subscribe();
        }
        return this._overlayRef;
    }
    /**
     * This method builds the configuration object needed to create the overlay, the OverlayState.
     * @returns OverlayConfig
     */
    _getOverlayConfig(menu) {
        return new OverlayConfig({
            positionStrategy: this._overlay
                .position()
                .flexibleConnectedTo(this._element)
                .withLockedPosition()
                .withGrowAfterOpen()
                .withTransformOriginOn('.mat-menu-panel, .mat-mdc-menu-panel'),
            backdropClass: menu.backdropClass || 'cdk-overlay-transparent-backdrop',
            panelClass: menu.overlayPanelClass,
            scrollStrategy: this._scrollStrategy(),
            direction: this._dir,
        });
    }
    /**
     * Listens to changes in the position of the overlay and sets the correct classes
     * on the menu based on the new position. This ensures the animation origin is always
     * correct, even if a fallback position is used for the overlay.
     */
    _subscribeToPositions(menu, position) {
        if (menu.setPositionClasses) {
            position.positionChanges.subscribe(change => {
                const posX = change.connectionPair.overlayX === 'start' ? 'after' : 'before';
                const posY = change.connectionPair.overlayY === 'top' ? 'below' : 'above';
                // @breaking-change 15.0.0 Remove null check for `ngZone`.
                // `positionChanges` fires outside of the `ngZone` and `setPositionClasses` might be
                // updating something in the view so we need to bring it back in.
                if (this._ngZone) {
                    this._ngZone.run(() => menu.setPositionClasses(posX, posY));
                }
                else {
                    menu.setPositionClasses(posX, posY);
                }
            });
        }
    }
    /**
     * Sets the appropriate positions on a position strategy
     * so the overlay connects with the trigger correctly.
     * @param positionStrategy Strategy whose position to update.
     */
    _setPosition(menu, positionStrategy) {
        let [originX, originFallbackX] = menu.xPosition === 'before' ? ['end', 'start'] : ['start', 'end'];
        let [overlayY, overlayFallbackY] = menu.yPosition === 'above' ? ['bottom', 'top'] : ['top', 'bottom'];
        let [originY, originFallbackY] = [overlayY, overlayFallbackY];
        let [overlayX, overlayFallbackX] = [originX, originFallbackX];
        let offsetY = 0;
        if (this.triggersSubmenu()) {
            // When the menu is a sub-menu, it should always align itself
            // to the edges of the trigger, instead of overlapping it.
            overlayFallbackX = originX = menu.xPosition === 'before' ? 'start' : 'end';
            originFallbackX = overlayX = originX === 'end' ? 'start' : 'end';
            if (this._parentMaterialMenu) {
                if (this._parentInnerPadding == null) {
                    const firstItem = this._parentMaterialMenu.items.first;
                    this._parentInnerPadding = firstItem ? firstItem._getHostElement().offsetTop : 0;
                }
                offsetY = overlayY === 'bottom' ? this._parentInnerPadding : -this._parentInnerPadding;
            }
        }
        else if (!menu.overlapTrigger) {
            originY = overlayY === 'top' ? 'bottom' : 'top';
            originFallbackY = overlayFallbackY === 'top' ? 'bottom' : 'top';
        }
        positionStrategy.withPositions([
            { originX, originY, overlayX, overlayY, offsetY },
            { originX: originFallbackX, originY, overlayX: overlayFallbackX, overlayY, offsetY },
            {
                originX,
                originY: originFallbackY,
                overlayX,
                overlayY: overlayFallbackY,
                offsetY: -offsetY,
            },
            {
                originX: originFallbackX,
                originY: originFallbackY,
                overlayX: overlayFallbackX,
                overlayY: overlayFallbackY,
                offsetY: -offsetY,
            },
        ]);
    }
    /** Returns a stream that emits whenever an action that should close the menu occurs. */
    _menuClosingActions() {
        const backdrop = this._overlayRef.backdropClick();
        const detachments = this._overlayRef.detachments();
        const parentClose = this._parentMaterialMenu ? this._parentMaterialMenu.closed : observableOf();
        const hover = this._parentMaterialMenu
            ? this._parentMaterialMenu._hovered().pipe(filter(active => active !== this._menuItemInstance), filter(() => this._menuOpen))
            : observableOf();
        return merge(backdrop, parentClose, hover, detachments);
    }
    /** Handles mouse presses on the trigger. */
    _handleMousedown(event) {
        if (!isFakeMousedownFromScreenReader(event)) {
            // Since right or middle button clicks won't trigger the `click` event,
            // we shouldn't consider the menu as opened by mouse in those cases.
            this._openedBy = event.button === 0 ? 'mouse' : undefined;
            // Since clicking on the trigger won't close the menu if it opens a sub-menu,
            // we should prevent focus from moving onto it via click to avoid the
            // highlight from lingering on the menu item.
            if (this.triggersSubmenu()) {
                event.preventDefault();
            }
        }
    }
    /** Handles key presses on the trigger. */
    _handleKeydown(event) {
        const keyCode = event.keyCode;
        // Pressing enter on the trigger will trigger the click handler later.
        if (keyCode === ENTER || keyCode === SPACE) {
            this._openedBy = 'keyboard';
        }
        if (this.triggersSubmenu() &&
            ((keyCode === RIGHT_ARROW && this.dir === 'ltr') ||
                (keyCode === LEFT_ARROW && this.dir === 'rtl'))) {
            this._openedBy = 'keyboard';
            this.openMenu();
        }
    }
    /** Handles click events on the trigger. */
    _handleClick(event) {
        if (this.triggersSubmenu()) {
            // Stop event propagation to avoid closing the parent menu.
            event.stopPropagation();
            this.openMenu();
        }
        else {
            this.toggleMenu();
        }
    }
    /** Handles the cases where the user hovers over the trigger. */
    _handleHover() {
        // Subscribe to changes in the hovered item in order to toggle the panel.
        if (!this.triggersSubmenu() || !this._parentMaterialMenu) {
            return;
        }
        this._hoverSubscription = this._parentMaterialMenu
            ._hovered()
            // Since we might have multiple competing triggers for the same menu (e.g. a sub-menu
            // with different data and triggers), we have to delay it by a tick to ensure that
            // it won't be closed immediately after it is opened.
            .pipe(filter(active => active === this._menuItemInstance && !active.disabled), delay(0, asapScheduler))
            .subscribe(() => {
            this._openedBy = 'mouse';
            // If the same menu is used between multiple triggers, it might still be animating
            // while the new trigger tries to re-open it. Wait for the animation to finish
            // before doing so. Also interrupt if the user moves to another item.
            if (this.menu instanceof _MatMenuBase && this.menu._isAnimating) {
                // We need the `delay(0)` here in order to avoid
                // 'changed after checked' errors in some cases. See #12194.
                this.menu._animationDone
                    .pipe(take(1), delay(0, asapScheduler), takeUntil(this._parentMaterialMenu._hovered()))
                    .subscribe(() => this.openMenu());
            }
            else {
                this.openMenu();
            }
        });
    }
    /** Gets the portal that should be attached to the overlay. */
    _getPortal(menu) {
        // Note that we can avoid this check by keeping the portal on the menu panel.
        // While it would be cleaner, we'd have to introduce another required method on
        // `MatMenuPanel`, making it harder to consume.
        if (!this._portal || this._portal.templateRef !== menu.templateRef) {
            this._portal = new TemplatePortal(menu.templateRef, this._viewContainerRef);
        }
        return this._portal;
    }
}
_MatMenuTriggerBase.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: _MatMenuTriggerBase, deps: [{ token: i1.Overlay }, { token: i0.ElementRef }, { token: i0.ViewContainerRef }, { token: MAT_MENU_SCROLL_STRATEGY }, { token: MAT_MENU_PANEL, optional: true }, { token: i2.MatMenuItem, optional: true, self: true }, { token: i3.Directionality, optional: true }, { token: i4.FocusMonitor }, { token: i0.NgZone }], target: i0.ɵɵFactoryTarget.Directive });
_MatMenuTriggerBase.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "15.2.0-rc.0", type: _MatMenuTriggerBase, inputs: { _deprecatedMatMenuTriggerFor: ["mat-menu-trigger-for", "_deprecatedMatMenuTriggerFor"], menu: ["matMenuTriggerFor", "menu"], menuData: ["matMenuTriggerData", "menuData"], restoreFocus: ["matMenuTriggerRestoreFocus", "restoreFocus"] }, outputs: { menuOpened: "menuOpened", onMenuOpen: "onMenuOpen", menuClosed: "menuClosed", onMenuClose: "onMenuClose" }, host: { listeners: { "click": "_handleClick($event)", "mousedown": "_handleMousedown($event)", "keydown": "_handleKeydown($event)" }, properties: { "attr.aria-haspopup": "menu ? \"menu\" : null", "attr.aria-expanded": "menuOpen", "attr.aria-controls": "menuOpen ? menu.panelId : null" } }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: _MatMenuTriggerBase, decorators: [{
            type: Directive,
            args: [{
                    host: {
                        '[attr.aria-haspopup]': 'menu ? "menu" : null',
                        '[attr.aria-expanded]': 'menuOpen',
                        '[attr.aria-controls]': 'menuOpen ? menu.panelId : null',
                        '(click)': '_handleClick($event)',
                        '(mousedown)': '_handleMousedown($event)',
                        '(keydown)': '_handleKeydown($event)',
                    },
                }]
        }], ctorParameters: function () { return [{ type: i1.Overlay }, { type: i0.ElementRef }, { type: i0.ViewContainerRef }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [MAT_MENU_SCROLL_STRATEGY]
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [MAT_MENU_PANEL]
                }, {
                    type: Optional
                }] }, { type: i2.MatMenuItem, decorators: [{
                    type: Optional
                }, {
                    type: Self
                }] }, { type: i3.Directionality, decorators: [{
                    type: Optional
                }] }, { type: i4.FocusMonitor }, { type: i0.NgZone }]; }, propDecorators: { _deprecatedMatMenuTriggerFor: [{
                type: Input,
                args: ['mat-menu-trigger-for']
            }], menu: [{
                type: Input,
                args: ['matMenuTriggerFor']
            }], menuData: [{
                type: Input,
                args: ['matMenuTriggerData']
            }], restoreFocus: [{
                type: Input,
                args: ['matMenuTriggerRestoreFocus']
            }], menuOpened: [{
                type: Output
            }], onMenuOpen: [{
                type: Output
            }], menuClosed: [{
                type: Output
            }], onMenuClose: [{
                type: Output
            }] } });
/** Directive applied to an element that should trigger a `mat-menu`. */
export class MatMenuTrigger extends _MatMenuTriggerBase {
}
MatMenuTrigger.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: MatMenuTrigger, deps: null, target: i0.ɵɵFactoryTarget.Directive });
MatMenuTrigger.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "15.2.0-rc.0", type: MatMenuTrigger, selector: "[mat-menu-trigger-for], [matMenuTriggerFor]", host: { classAttribute: "mat-mdc-menu-trigger" }, exportAs: ["matMenuTrigger"], usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: MatMenuTrigger, decorators: [{
            type: Directive,
            args: [{
                    selector: `[mat-menu-trigger-for], [matMenuTriggerFor]`,
                    host: {
                        'class': 'mat-mdc-menu-trigger',
                    },
                    exportAs: 'matMenuTrigger',
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS10cmlnZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL21lbnUvbWVudS10cmlnZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFHTCwrQkFBK0IsRUFDL0IsZ0NBQWdDLEdBQ2pDLE1BQU0sbUJBQW1CLENBQUM7QUFDM0IsT0FBTyxFQUFZLGNBQWMsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQzVELE9BQU8sRUFBQyxLQUFLLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUM1RSxPQUFPLEVBR0wsT0FBTyxFQUNQLGFBQWEsR0FJZCxNQUFNLHNCQUFzQixDQUFDO0FBQzlCLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNuRCxPQUFPLEVBRUwsaUJBQWlCLEVBQ2pCLFNBQVMsRUFDVCxVQUFVLEVBQ1YsWUFBWSxFQUNaLE1BQU0sRUFDTixNQUFNLEVBQ04sY0FBYyxFQUNkLEtBQUssRUFDTCxNQUFNLEVBRU4sUUFBUSxFQUNSLE1BQU0sRUFDTixJQUFJLEVBQ0osZ0JBQWdCLEdBQ2pCLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBQywrQkFBK0IsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQ3RFLE9BQU8sRUFBQyxhQUFhLEVBQUUsS0FBSyxFQUFjLEVBQUUsSUFBSSxZQUFZLEVBQUUsWUFBWSxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQ3hGLE9BQU8sRUFBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUM5RCxPQUFPLEVBQUMsWUFBWSxFQUFrQixNQUFNLFFBQVEsQ0FBQztBQUNyRCxPQUFPLEVBQUMsMEJBQTBCLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDekQsT0FBTyxFQUFDLFdBQVcs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OzRGQTFIUCw0QkFBNEI7c0JBRC9CLEtBQUs7dUJBQUMsc0JBQXNCO2dCQVV6QixJQUFJO3NCQURQLEtBQUs7dUJBQUMsbUJBQW1CO2dCQWdDRyxRQUFRO3NCQUFwQyxLQUFLO3VCQUFDLG9CQUFvQjtnQkFPVSxZQUFZO3NCQUFoRCxLQUFLO3VCQUFDLDRCQUE0QjtnQkFHaEIsVUFBVTtzQkFBNUIsTUFBTTtnQkFRWSxVQUFVO3NCQUE1QixNQUFNO2dCQUdZLFVBQVU7c0JBQTVCLE1BQU07Z0JBUVksV0FBVztzQkFBN0IsTUFBTTs7QUFpZVQsd0VBQXdFO0FBUXhFLE1BQU0sT0FBTyxjQUFlLFNBQVEsbUJBQW1COztnSEFBMUMsY0FBYztvR0FBZCxjQUFjO2dHQUFkLGNBQWM7a0JBUDFCLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLDZDQUE2QztvQkFDdkQsSUFBSSxFQUFFO3dCQUNKLE9BQU8sRUFBRSxzQkFBc0I7cUJBQ2hDO29CQUNELFFBQVEsRUFBRSxnQkFBZ0I7aUJBQzNCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIEZvY3VzTW9uaXRvcixcbiAgRm9jdXNPcmlnaW4sXG4gIGlzRmFrZU1vdXNlZG93bkZyb21TY3JlZW5SZWFkZXIsXG4gIGlzRmFrZVRvdWNoc3RhcnRGcm9tU2NyZWVuUmVhZGVyLFxufSBmcm9tICdAYW5ndWxhci9jZGsvYTExeSc7XG5pbXBvcnQge0RpcmVjdGlvbiwgRGlyZWN0aW9uYWxpdHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcbmltcG9ydCB7RU5URVIsIExFRlRfQVJST1csIFJJR0hUX0FSUk9XLCBTUEFDRX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2tleWNvZGVzJztcbmltcG9ydCB7XG4gIEZsZXhpYmxlQ29ubmVjdGVkUG9zaXRpb25TdHJhdGVneSxcbiAgSG9yaXpvbnRhbENvbm5lY3Rpb25Qb3MsXG4gIE92ZXJsYXksXG4gIE92ZXJsYXlDb25maWcsXG4gIE92ZXJsYXlSZWYsXG4gIFNjcm9sbFN0cmF0ZWd5LFxuICBWZXJ0aWNhbENvbm5lY3Rpb25Qb3MsXG59IGZyb20gJ0Bhbmd1bGFyL2Nkay9vdmVybGF5JztcbmltcG9ydCB7VGVtcGxhdGVQb3J0YWx9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wb3J0YWwnO1xuaW1wb3J0IHtcbiAgQWZ0ZXJDb250ZW50SW5pdCxcbiAgQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gIERpcmVjdGl2ZSxcbiAgRWxlbWVudFJlZixcbiAgRXZlbnRFbWl0dGVyLFxuICBpbmplY3QsXG4gIEluamVjdCxcbiAgSW5qZWN0aW9uVG9rZW4sXG4gIElucHV0LFxuICBOZ1pvbmUsXG4gIE9uRGVzdHJveSxcbiAgT3B0aW9uYWwsXG4gIE91dHB1dCxcbiAgU2VsZixcbiAgVmlld0NvbnRhaW5lclJlZixcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge25vcm1hbGl6ZVBhc3NpdmVMaXN0ZW5lck9wdGlvbnN9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wbGF0Zm9ybSc7XG5pbXBvcnQge2FzYXBTY2hlZHVsZXIsIG1lcmdlLCBPYnNlcnZhYmxlLCBvZiBhcyBvYnNlcnZhYmxlT2YsIFN1YnNjcmlwdGlvbn0gZnJvbSAncnhqcyc7XG5pbXBvcnQge2RlbGF5LCBmaWx0ZXIsIHRha2UsIHRha2VVbnRpbH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHtfTWF0TWVudUJhc2UsIE1lbnVDbG9zZVJlYXNvbn0gZnJvbSAnLi9tZW51JztcbmltcG9ydCB7dGhyb3dNYXRNZW51UmVjdXJzaXZlRXJyb3J9IGZyb20gJy4vbWVudS1lcnJvcnMnO1xuaW1wb3J0IHtNYXRNZW51SXRlbX0gZnJvbSAnLi9tZW51LWl0ZW0nO1xuaW1wb3J0IHtNQVRfTUVOVV9QQU5FTCwgTWF0TWVudVBhbmVsfSBmcm9tICcuL21lbnUtcGFuZWwnO1xuaW1wb3J0IHtNZW51UG9zaXRpb25YLCBNZW51UG9zaXRpb25ZfSBmcm9tICcuL21lbnUtcG9zaXRpb25zJztcblxuLyoqIEluamVjdGlvbiB0b2tlbiB0aGF0IGRldGVybWluZXMgdGhlIHNjcm9sbCBoYW5kbGluZyB3aGlsZSB0aGUgbWVudSBpcyBvcGVuLiAqL1xuZXhwb3J0IGNvbnN0IE1BVF9NRU5VX1NDUk9MTF9TVFJBVEVHWSA9IG5ldyBJbmplY3Rpb25Ub2tlbjwoKSA9PiBTY3JvbGxTdHJhdGVneT4oXG4gICdtYXQtbWVudS1zY3JvbGwtc3RyYXRlZ3knLFxuKTtcblxuLyoqIEBkb2NzLXByaXZhdGUgKi9cbmV4cG9ydCBmdW5jdGlvbiBNQVRfTUVOVV9TQ1JPTExfU1RSQVRFR1lfRkFDVE9SWShvdmVybGF5OiBPdmVybGF5KTogKCkgPT4gU2Nyb2xsU3RyYXRlZ3kge1xuICByZXR1cm4gKCkgPT4gb3ZlcmxheS5zY3JvbGxTdHJhdGVnaWVzLnJlcG9zaXRpb24oKTtcbn1cblxuLyoqIEBkb2NzLXByaXZhdGUgKi9cbmV4cG9ydCBjb25zdCBNQVRfTUVOVV9TQ1JPTExfU1RSQVRFR1lfRkFDVE9SWV9QUk9WSURFUiA9IHtcbiAgcHJvdmlkZTogTUFUX01FTlVfU0NST0xMX1NUUkFURUdZLFxuICBkZXBzOiBbT3ZlcmxheV0sXG4gIHVzZUZhY3Rvcnk6IE1BVF9NRU5VX1NDUk9MTF9TVFJBVEVHWV9GQUNUT1JZLFxufTtcblxuLyoqIE9wdGlvbnMgZm9yIGJpbmRpbmcgYSBwYXNzaXZlIGV2ZW50IGxpc3RlbmVyLiAqL1xuY29uc3QgcGFzc2l2ZUV2ZW50TGlzdGVuZXJPcHRpb25zID0gbm9ybWFsaXplUGFzc2l2ZUxpc3RlbmVyT3B0aW9ucyh7cGFzc2l2ZTogdHJ1ZX0pO1xuXG4vKipcbiAqIERlZmF1bHQgdG9wIHBhZGRpbmcgb2YgdGhlIG1lbnUgcGFuZWwuXG4gKiBAZGVwcmVjYXRlZCBObyBsb25nZXIgYmVpbmcgdXNlZC4gV2lsbCBiZSByZW1vdmVkLlxuICogQGJyZWFraW5nLWNoYW5nZSAxNS4wLjBcbiAqL1xuZXhwb3J0IGNvbnN0IE1FTlVfUEFORUxfVE9QX1BBRERJTkcgPSA4O1xuXG5ARGlyZWN0aXZlKHtcbiAgaG9zdDoge1xuICAgICdbYXR0ci5hcmlhLWhhc3BvcHVwXSc6ICdtZW51ID8gXCJtZW51XCIgOiBudWxsJyxcbiAgICAnW2F0dHIuYXJpYS1leHBhbmRlZF0nOiAnbWVudU9wZW4nLFxuICAgICdbYXR0ci5hcmlhLWNvbnRyb2xzXSc6ICdtZW51T3BlbiA/IG1lbnUucGFuZWxJZCA6IG51bGwnLFxuICAgICcoY2xpY2spJzogJ19oYW5kbGVDbGljaygkZXZlbnQpJyxcbiAgICAnKG1vdXNlZG93biknOiAnX2hhbmRsZU1vdXNlZG93bigkZXZlbnQpJyxcbiAgICAnKGtleWRvd24pJzogJ19oYW5kbGVLZXlkb3duKCRldmVudCknLFxuICB9LFxufSlcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBfTWF0TWVudVRyaWdnZXJCYXNlIGltcGxlbWVudHMgQWZ0ZXJDb250ZW50SW5pdCwgT25EZXN0cm95IHtcbiAgcHJpdmF0ZSBfcG9ydGFsOiBUZW1wbGF0ZVBvcnRhbDtcbiAgcHJpdmF0ZSBfb3ZlcmxheVJlZjogT3ZlcmxheVJlZiB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIF9tZW51T3BlbjogYm9vbGVhbiA9IGZhbHNlO1xuICBwcml2YXRlIF9jbG9zaW5nQWN0aW9uc1N1YnNjcmlwdGlvbiA9IFN1YnNjcmlwdGlvbi5FTVBUWTtcbiAgcHJpdmF0ZSBfaG92ZXJTdWJzY3JpcHRpb24gPSBTdWJzY3JpcHRpb24uRU1QVFk7XG4gIHByaXZhdGUgX21lbnVDbG9zZVN1YnNjcmlwdGlvbiA9IFN1YnNjcmlwdGlvbi5FTVBUWTtcbiAgcHJpdmF0ZSBfc2Nyb2xsU3RyYXRlZ3k6ICgpID0+IFNjcm9sbFN0cmF0ZWd5O1xuICBwcml2YXRlIF9jaGFuZ2VEZXRlY3RvclJlZiA9IGluamVjdChDaGFuZ2VEZXRlY3RvclJlZik7XG5cbiAgLyoqXG4gICAqIFdlJ3JlIHNwZWNpZmljYWxseSBsb29raW5nIGZvciBhIGBNYXRNZW51YCBoZXJlIHNpbmNlIHRoZSBnZW5lcmljIGBNYXRNZW51UGFuZWxgXG4gICAqIGludGVyZmFjZSBsYWNrcyBzb21lIGZ1bmN0aW9uYWxpdHkgYXJvdW5kIG5lc3RlZCBtZW51cyBhbmQgYW5pbWF0aW9ucy5cbiAgICovXG4gIHByaXZhdGUgX3BhcmVudE1hdGVyaWFsTWVudTogX01hdE1lbnVCYXNlIHwgdW5kZWZpbmVkO1xuXG4gIC8qKlxuICAgKiBDYWNoZWQgdmFsdWUgb2YgdGhlIHBhZGRpbmcgb2YgdGhlIHBhcmVudCBtZW51IHBhbmVsLlxuICAgKiBVc2VkIHRvIG9mZnNldCBzdWItbWVudXMgdG8gY29tcGVuc2F0ZSBmb3IgdGhlIHBhZGRpbmcuXG4gICAqL1xuICBwcml2YXRlIF9wYXJlbnRJbm5lclBhZGRpbmc6IG51bWJlciB8IHVuZGVmaW5lZDtcblxuICAvKipcbiAgICogSGFuZGxlcyB0b3VjaCBzdGFydCBldmVudHMgb24gdGhlIHRyaWdnZXIuXG4gICAqIE5lZWRzIHRvIGJlIGFuIGFycm93IGZ1bmN0aW9uIHNvIHdlIGNhbiBlYXNpbHkgdXNlIGFkZEV2ZW50TGlzdGVuZXIgYW5kIHJlbW92ZUV2ZW50TGlzdGVuZXIuXG4gICAqL1xuICBwcml2YXRlIF9oYW5kbGVUb3VjaFN0YXJ0ID0gKGV2ZW50OiBUb3VjaEV2ZW50KSA9PiB7XG4gICAgaWYgKCFpc0Zha2VUb3VjaHN0YXJ0RnJvbVNjcmVlblJlYWRlcihldmVudCkpIHtcbiAgICAgIHRoaXMuX29wZW5lZEJ5ID0gJ3RvdWNoJztcbiAgICB9XG4gIH07XG5cbiAgLy8gVHJhY2tpbmcgaW5wdXQgdHlwZSBpcyBuZWNlc3Nhcnkgc28gaXQncyBwb3NzaWJsZSB0byBvbmx5IGF1dG8tZm9jdXNcbiAgLy8gdGhlIGZpcnN0IGl0ZW0gb2YgdGhlIGxpc3Qgd2hlbiB0aGUgbWVudSBpcyBvcGVuZWQgdmlhIHRoZSBrZXlib2FyZFxuICBfb3BlbmVkQnk6IEV4Y2x1ZGU8Rm9jdXNPcmlnaW4sICdwcm9ncmFtJyB8IG51bGw+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuXG4gIC8qKlxuICAgKiBAZGVwcmVjYXRlZFxuICAgKiBAYnJlYWtpbmctY2hhbmdlIDguMC4wXG4gICAqL1xuICBASW5wdXQoJ21hdC1tZW51LXRyaWdnZXItZm9yJylcbiAgZ2V0IF9kZXByZWNhdGVkTWF0TWVudVRyaWdnZXJGb3IoKTogTWF0TWVudVBhbmVsIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMubWVudTtcbiAgfVxuICBzZXQgX2RlcHJlY2F0ZWRNYXRNZW51VHJpZ2dlckZvcih2OiBNYXRNZW51UGFuZWwgfCBudWxsKSB7XG4gICAgdGhpcy5tZW51ID0gdjtcbiAgfVxuXG4gIC8qKiBSZWZlcmVuY2VzIHRoZSBtZW51IGluc3RhbmNlIHRoYXQgdGhlIHRyaWdnZXIgaXMgYXNzb2NpYXRlZCB3aXRoLiAqL1xuICBASW5wdXQoJ21hdE1lbnVUcmlnZ2VyRm9yJylcbiAgZ2V0IG1lbnUoKTogTWF0TWVudVBhbmVsIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX21lbnU7XG4gIH1cbiAgc2V0IG1lbnUobWVudTogTWF0TWVudVBhbmVsIHwgbnVsbCkge1xuICAgIGlmIChtZW51ID09PSB0aGlzLl9tZW51KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fbWVudSA9IG1lbnU7XG4gICAgdGhpcy5fbWVudUNsb3NlU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG5cbiAgICBpZiAobWVudSkge1xuICAgICAgaWYgKG1lbnUgPT09IHRoaXMuX3BhcmVudE1hdGVyaWFsTWVudSAmJiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSkge1xuICAgICAgICB0aHJvd01hdE1lbnVSZWN1cnNpdmVFcnJvcigpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9tZW51Q2xvc2VTdWJzY3JpcHRpb24gPSBtZW51LmNsb3NlLnN1YnNjcmliZSgocmVhc29uOiBNZW51Q2xvc2VSZWFzb24pID0+IHtcbiAgICAgICAgdGhpcy5fZGVzdHJveU1lbnUocmVhc29uKTtcblxuICAgICAgICAvLyBJZiBhIGNsaWNrIGNsb3NlZCB0aGUgbWVudSwgd2Ugc2hvdWxkIGNsb3NlIHRoZSBlbnRpcmUgY2hhaW4gb2YgbmVzdGVkIG1lbnVzLlxuICAgICAgICBpZiAoKHJlYXNvbiA9PT0gJ2NsaWNrJyB8fCByZWFzb24gPT09ICd0YWInKSAmJiB0aGlzLl9wYXJlbnRNYXRlcmlhbE1lbnUpIHtcbiAgICAgICAgICB0aGlzLl9wYXJlbnRNYXRlcmlhbE1lbnUuY2xvc2VkLmVtaXQocmVhc29uKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdGhpcy5fbWVudUl0ZW1JbnN0YW5jZT8uX3NldFRyaWdnZXJzU3VibWVudSh0aGlzLnRyaWdnZXJzU3VibWVudSgpKTtcbiAgfVxuICBwcml2YXRlIF9tZW51OiBNYXRNZW51UGFuZWwgfCBudWxsO1xuXG4gIC8qKiBEYXRhIHRvIGJlIHBhc3NlZCBhbG9uZyB0byBhbnkgbGF6aWx5LXJlbmRlcmVkIGNvbnRlbnQuICovXG4gIEBJbnB1dCgnbWF0TWVudVRyaWdnZXJEYXRhJykgbWVudURhdGE6IGFueTtcblxuICAvKipcbiAgICogV2hldGhlciBmb2N1cyBzaG91bGQgYmUgcmVzdG9yZWQgd2hlbiB0aGUgbWVudSBpcyBjbG9zZWQuXG4gICAqIE5vdGUgdGhhdCBkaXNhYmxpbmcgdGhpcyBvcHRpb24gY2FuIGhhdmUgYWNjZXNzaWJpbGl0eSBpbXBsaWNhdGlvbnNcbiAgICogYW5kIGl0J3MgdXAgdG8geW91IHRvIG1hbmFnZSBmb2N1cywgaWYgeW91IGRlY2lkZSB0byB0dXJuIGl0IG9mZi5cbiAgICovXG4gIEBJbnB1dCgnbWF0TWVudVRyaWdnZXJSZXN0b3JlRm9jdXMnKSByZXN0b3JlRm9jdXM6IGJvb2xlYW4gPSB0cnVlO1xuXG4gIC8qKiBFdmVudCBlbWl0dGVkIHdoZW4gdGhlIGFzc29jaWF0ZWQgbWVudSBpcyBvcGVuZWQuICovXG4gIEBPdXRwdXQoKSByZWFkb25seSBtZW51T3BlbmVkOiBFdmVudEVtaXR0ZXI8dm9pZD4gPSBuZXcgRXZlbnRFbWl0dGVyPHZvaWQ+KCk7XG5cbiAgLyoqXG4gICAqIEV2ZW50IGVtaXR0ZWQgd2hlbiB0aGUgYXNzb2NpYXRlZCBtZW51IGlzIG9wZW5lZC5cbiAgICogQGRlcHJlY2F0ZWQgU3dpdGNoIHRvIGBtZW51T3BlbmVkYCBpbnN0ZWFkXG4gICAqIEBicmVha2luZy1jaGFuZ2UgOC4wLjBcbiAgICovXG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1vdXRwdXQtb24tcHJlZml4XG4gIEBPdXRwdXQoKSByZWFkb25seSBvbk1lbnVPcGVuOiBFdmVudEVtaXR0ZXI8dm9pZD4gPSB0aGlzLm1lbnVPcGVuZWQ7XG5cbiAgLyoqIEV2ZW50IGVtaXR0ZWQgd2hlbiB0aGUgYXNzb2NpYXRlZCBtZW51IGlzIGNsb3NlZC4gKi9cbiAgQE91dHB1dCgpIHJlYWRvbmx5IG1lbnVDbG9zZWQ6IEV2ZW50RW1pdHRlcjx2b2lkPiA9IG5ldyBFdmVudEVtaXR0ZXI8dm9pZD4oKTtcblxuICAvKipcbiAgICogRXZlbnQgZW1pdHRlZCB3aGVuIHRoZSBhc3NvY2lhdGVkIG1lbnUgaXMgY2xvc2VkLlxuICAgKiBAZGVwcmVjYXRlZCBTd2l0Y2ggdG8gYG1lbnVDbG9zZWRgIGluc3RlYWRcbiAgICogQGJyZWFraW5nLWNoYW5nZSA4LjAuMFxuICAgKi9cbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLW91dHB1dC1vbi1wcmVmaXhcbiAgQE91dHB1dCgpIHJlYWRvbmx5IG9uTWVudUNsb3NlOiBFdmVudEVtaXR0ZXI8dm9pZD4gPSB0aGlzLm1lbnVDbG9zZWQ7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgb3ZlcmxheTogT3ZlcmxheSxcbiAgICBlbGVtZW50OiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcbiAgICB2aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmLFxuICAgIHNjcm9sbFN0cmF0ZWd5OiBhbnksXG4gICAgcGFyZW50TWVudTogTWF0TWVudVBhbmVsLFxuICAgIG1lbnVJdGVtSW5zdGFuY2U6IE1hdE1lbnVJdGVtLFxuICAgIGRpcjogRGlyZWN0aW9uYWxpdHksXG4gICAgZm9jdXNNb25pdG9yOiBGb2N1c01vbml0b3IsXG4gICAgbmdab25lOiBOZ1pvbmUsXG4gICk7XG5cbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkIGBmb2N1c01vbml0b3JgIHdpbGwgYmVjb21lIGEgcmVxdWlyZWQgcGFyYW1ldGVyLlxuICAgKiBAYnJlYWtpbmctY2hhbmdlIDguMC4wXG4gICAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICBvdmVybGF5OiBPdmVybGF5LFxuICAgIGVsZW1lbnQ6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+LFxuICAgIHZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYsXG4gICAgc2Nyb2xsU3RyYXRlZ3k6IGFueSxcbiAgICBwYXJlbnRNZW51OiBNYXRNZW51UGFuZWwsXG4gICAgbWVudUl0ZW1JbnN0YW5jZTogTWF0TWVudUl0ZW0sXG4gICAgZGlyOiBEaXJlY3Rpb25hbGl0eSxcbiAgICBmb2N1c01vbml0b3I/OiBGb2N1c01vbml0b3IgfCBudWxsLFxuICApO1xuXG4gIC8qKlxuICAgKiBAZGVwcmVjYXRlZCBgbmdab25lYCB3aWxsIGJlY29tZSBhIHJlcXVpcmVkIHBhcmFtZXRlci5cbiAgICogQGJyZWFraW5nLWNoYW5nZSAxNS4wLjBcbiAgICovXG4gIGNvbnN0cnVjdG9yKFxuICAgIG92ZXJsYXk6IE92ZXJsYXksXG4gICAgZWxlbWVudDogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sXG4gICAgdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZixcbiAgICBzY3JvbGxTdHJhdGVneTogYW55LFxuICAgIHBhcmVudE1lbnU6IE1hdE1lbnVQYW5lbCxcbiAgICBtZW51SXRlbUluc3RhbmNlOiBNYXRNZW51SXRlbSxcbiAgICBkaXI6IERpcmVjdGlvbmFsaXR5LFxuICAgIGZvY3VzTW9uaXRvcjogRm9jdXNNb25pdG9yLFxuICApO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgX292ZXJsYXk6IE92ZXJsYXksXG4gICAgcHJpdmF0ZSBfZWxlbWVudDogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sXG4gICAgcHJpdmF0ZSBfdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZixcbiAgICBASW5qZWN0KE1BVF9NRU5VX1NDUk9MTF9TVFJBVEVHWSkgc2Nyb2xsU3RyYXRlZ3k6IGFueSxcbiAgICBASW5qZWN0KE1BVF9NRU5VX1BBTkVMKSBAT3B0aW9uYWwoKSBwYXJlbnRNZW51OiBNYXRNZW51UGFuZWwsXG4gICAgLy8gYE1hdE1lbnVUcmlnZ2VyYCBpcyBjb21tb25seSB1c2VkIGluIGNvbWJpbmF0aW9uIHdpdGggYSBgTWF0TWVudUl0ZW1gLlxuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTogbGlnaHR3ZWlnaHQtdG9rZW5zXG4gICAgQE9wdGlvbmFsKCkgQFNlbGYoKSBwcml2YXRlIF9tZW51SXRlbUluc3RhbmNlOiBNYXRNZW51SXRlbSxcbiAgICBAT3B0aW9uYWwoKSBwcml2YXRlIF9kaXI6IERpcmVjdGlvbmFsaXR5LFxuICAgIHByaXZhdGUgX2ZvY3VzTW9uaXRvcjogRm9jdXNNb25pdG9yIHwgbnVsbCxcbiAgICBwcml2YXRlIF9uZ1pvbmU/OiBOZ1pvbmUsXG4gICkge1xuICAgIHRoaXMuX3Njcm9sbFN0cmF0ZWd5ID0gc2Nyb2xsU3RyYXRlZ3k7XG4gICAgdGhpcy5fcGFyZW50TWF0ZXJpYWxNZW51ID0gcGFyZW50TWVudSBpbnN0YW5jZW9mIF9NYXRNZW51QmFzZSA/IHBhcmVudE1lbnUgOiB1bmRlZmluZWQ7XG5cbiAgICBfZWxlbWVudC5uYXRpdmVFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAndG91Y2hzdGFydCcsXG4gICAgICB0aGlzLl9oYW5kbGVUb3VjaFN0YXJ0LFxuICAgICAgcGFzc2l2ZUV2ZW50TGlzdGVuZXJPcHRpb25zLFxuICAgICk7XG4gIH1cblxuICBuZ0FmdGVyQ29udGVudEluaXQoKSB7XG4gICAgdGhpcy5faGFuZGxlSG92ZXIoKTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIGlmICh0aGlzLl9vdmVybGF5UmVmKSB7XG4gICAgICB0aGlzLl9vdmVybGF5UmVmLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX292ZXJsYXlSZWYgPSBudWxsO1xuICAgIH1cblxuICAgIHRoaXMuX2VsZW1lbnQubmF0aXZlRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFxuICAgICAgJ3RvdWNoc3RhcnQnLFxuICAgICAgdGhpcy5faGFuZGxlVG91Y2hTdGFydCxcbiAgICAgIHBhc3NpdmVFdmVudExpc3RlbmVyT3B0aW9ucyxcbiAgICApO1xuXG4gICAgdGhpcy5fbWVudUNsb3NlU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgdGhpcy5fY2xvc2luZ0FjdGlvbnNTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICB0aGlzLl9ob3ZlclN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIG1lbnUgaXMgb3Blbi4gKi9cbiAgZ2V0IG1lbnVPcGVuKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9tZW51T3BlbjtcbiAgfVxuXG4gIC8qKiBUaGUgdGV4dCBkaXJlY3Rpb24gb2YgdGhlIGNvbnRhaW5pbmcgYXBwLiAqL1xuICBnZXQgZGlyKCk6IERpcmVjdGlvbiB7XG4gICAgcmV0dXJuIHRoaXMuX2RpciAmJiB0aGlzLl9kaXIudmFsdWUgPT09ICdydGwnID8gJ3J0bCcgOiAnbHRyJztcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBtZW51IHRyaWdnZXJzIGEgc3ViLW1lbnUgb3IgYSB0b3AtbGV2ZWwgb25lLiAqL1xuICB0cmlnZ2Vyc1N1Ym1lbnUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICEhKHRoaXMuX21lbnVJdGVtSW5zdGFuY2UgJiYgdGhpcy5fcGFyZW50TWF0ZXJpYWxNZW51ICYmIHRoaXMubWVudSk7XG4gIH1cblxuICAvKiogVG9nZ2xlcyB0aGUgbWVudSBiZXR3ZWVuIHRoZSBvcGVuIGFuZCBjbG9zZWQgc3RhdGVzLiAqL1xuICB0b2dnbGVNZW51KCk6IHZvaWQge1xuICAgIHJldHVybiB0aGlzLl9tZW51T3BlbiA/IHRoaXMuY2xvc2VNZW51KCkgOiB0aGlzLm9wZW5NZW51KCk7XG4gIH1cblxuICAvKiogT3BlbnMgdGhlIG1lbnUuICovXG4gIG9wZW5NZW51KCk6IHZvaWQge1xuICAgIGNvbnN0IG1lbnUgPSB0aGlzLm1lbnU7XG5cbiAgICBpZiAodGhpcy5fbWVudU9wZW4gfHwgIW1lbnUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBvdmVybGF5UmVmID0gdGhpcy5fY3JlYXRlT3ZlcmxheShtZW51KTtcbiAgICBjb25zdCBvdmVybGF5Q29uZmlnID0gb3ZlcmxheVJlZi5nZXRDb25maWcoKTtcbiAgICBjb25zdCBwb3NpdGlvblN0cmF0ZWd5ID0gb3ZlcmxheUNvbmZpZy5wb3NpdGlvblN0cmF0ZWd5IGFzIEZsZXhpYmxlQ29ubmVjdGVkUG9zaXRpb25TdHJhdGVneTtcblxuICAgIHRoaXMuX3NldFBvc2l0aW9uKG1lbnUsIHBvc2l0aW9uU3RyYXRlZ3kpO1xuICAgIG92ZXJsYXlDb25maWcuaGFzQmFja2Ryb3AgPVxuICAgICAgbWVudS5oYXNCYWNrZHJvcCA9PSBudWxsID8gIXRoaXMudHJpZ2dlcnNTdWJtZW51KCkgOiBtZW51Lmhhc0JhY2tkcm9wO1xuICAgIG92ZXJsYXlSZWYuYXR0YWNoKHRoaXMuX2dldFBvcnRhbChtZW51KSk7XG5cbiAgICBpZiAobWVudS5sYXp5Q29udGVudCkge1xuICAgICAgbWVudS5sYXp5Q29udGVudC5hdHRhY2godGhpcy5tZW51RGF0YSk7XG4gICAgfVxuXG4gICAgdGhpcy5fY2xvc2luZ0FjdGlvbnNTdWJzY3JpcHRpb24gPSB0aGlzLl9tZW51Q2xvc2luZ0FjdGlvbnMoKS5zdWJzY3JpYmUoKCkgPT4gdGhpcy5jbG9zZU1lbnUoKSk7XG4gICAgdGhpcy5faW5pdE1lbnUobWVudSk7XG5cbiAgICBpZiAobWVudSBpbnN0YW5jZW9mIF9NYXRNZW51QmFzZSkge1xuICAgICAgbWVudS5fc3RhcnRBbmltYXRpb24oKTtcbiAgICAgIG1lbnUuX2RpcmVjdERlc2NlbmRhbnRJdGVtcy5jaGFuZ2VzLnBpcGUodGFrZVVudGlsKG1lbnUuY2xvc2UpKS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICAvLyBSZS1hZGp1c3QgdGhlIHBvc2l0aW9uIHdpdGhvdXQgbG9ja2luZyB3aGVuIHRoZSBhbW91bnQgb2YgaXRlbXNcbiAgICAgICAgLy8gY2hhbmdlcyBzbyB0aGF0IHRoZSBvdmVybGF5IGlzIGFsbG93ZWQgdG8gcGljayBhIG5ldyBvcHRpbWFsIHBvc2l0aW9uLlxuICAgICAgICBwb3NpdGlvblN0cmF0ZWd5LndpdGhMb2NrZWRQb3NpdGlvbihmYWxzZSkucmVhcHBseUxhc3RQb3NpdGlvbigpO1xuICAgICAgICBwb3NpdGlvblN0cmF0ZWd5LndpdGhMb2NrZWRQb3NpdGlvbih0cnVlKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBDbG9zZXMgdGhlIG1lbnUuICovXG4gIGNsb3NlTWVudSgpOiB2b2lkIHtcbiAgICB0aGlzLm1lbnU/LmNsb3NlLmVtaXQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGb2N1c2VzIHRoZSBtZW51IHRyaWdnZXIuXG4gICAqIEBwYXJhbSBvcmlnaW4gU291cmNlIG9mIHRoZSBtZW51IHRyaWdnZXIncyBmb2N1cy5cbiAgICovXG4gIGZvY3VzKG9yaWdpbj86IEZvY3VzT3JpZ2luLCBvcHRpb25zPzogRm9jdXNPcHRpb25zKSB7XG4gICAgaWYgKHRoaXMuX2ZvY3VzTW9uaXRvciAmJiBvcmlnaW4pIHtcbiAgICAgIHRoaXMuX2ZvY3VzTW9uaXRvci5mb2N1c1ZpYSh0aGlzLl9lbGVtZW50LCBvcmlnaW4sIG9wdGlvbnMpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9lbGVtZW50Lm5hdGl2ZUVsZW1lbnQuZm9jdXMob3B0aW9ucyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIHBvc2l0aW9uIG9mIHRoZSBtZW51IHRvIGVuc3VyZSB0aGF0IGl0IGZpdHMgYWxsIG9wdGlvbnMgd2l0aGluIHRoZSB2aWV3cG9ydC5cbiAgICovXG4gIHVwZGF0ZVBvc2l0aW9uKCk6IHZvaWQge1xuICAgIHRoaXMuX292ZXJsYXlSZWY/LnVwZGF0ZVBvc2l0aW9uKCk7XG4gIH1cblxuICAvKiogQ2xvc2VzIHRoZSBtZW51IGFuZCBkb2VzIHRoZSBuZWNlc3NhcnkgY2xlYW51cC4gKi9cbiAgcHJpdmF0ZSBfZGVzdHJveU1lbnUocmVhc29uOiBNZW51Q2xvc2VSZWFzb24pIHtcbiAgICBpZiAoIXRoaXMuX292ZXJsYXlSZWYgfHwgIXRoaXMubWVudU9wZW4pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBtZW51ID0gdGhpcy5tZW51O1xuICAgIHRoaXMuX2Nsb3NpbmdBY3Rpb25zU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgdGhpcy5fb3ZlcmxheVJlZi5kZXRhY2goKTtcblxuICAgIC8vIEFsd2F5cyByZXN0b3JlIGZvY3VzIGlmIHRoZSB1c2VyIGlzIG5hdmlnYXRpbmcgdXNpbmcgdGhlIGtleWJvYXJkIG9yIHRoZSBtZW51IHdhcyBvcGVuZWRcbiAgICAvLyBwcm9ncmFtbWF0aWNhbGx5LiBXZSBkb24ndCByZXN0b3JlIGZvciBub24tcm9vdCB0cmlnZ2VycywgYmVjYXVzZSBpdCBjYW4gcHJldmVudCBmb2N1c1xuICAgIC8vIGZyb20gbWFraW5nIGl0IGJhY2sgdG8gdGhlIHJvb3QgdHJpZ2dlciB3aGVuIGNsb3NpbmcgYSBsb25nIGNoYWluIG9mIG1lbnVzIGJ5IGNsaWNraW5nXG4gICAgLy8gb24gdGhlIGJhY2tkcm9wLlxuICAgIGlmICh0aGlzLnJlc3RvcmVGb2N1cyAmJiAocmVhc29uID09PSAna2V5ZG93bicgfHwgIXRoaXMuX29wZW5lZEJ5IHx8ICF0aGlzLnRyaWdnZXJzU3VibWVudSgpKSkge1xuICAgICAgdGhpcy5mb2N1cyh0aGlzLl9vcGVuZWRCeSk7XG4gICAgfVxuXG4gICAgdGhpcy5fb3BlbmVkQnkgPSB1bmRlZmluZWQ7XG5cbiAgICBpZiAobWVudSBpbnN0YW5jZW9mIF9NYXRNZW51QmFzZSkge1xuICAgICAgbWVudS5fcmVzZXRBbmltYXRpb24oKTtcblxuICAgICAgaWYgKG1lbnUubGF6eUNvbnRlbnQpIHtcbiAgICAgICAgLy8gV2FpdCBmb3IgdGhlIGV4aXQgYW5pbWF0aW9uIHRvIGZpbmlzaCBiZWZvcmUgZGV0YWNoaW5nIHRoZSBjb250ZW50LlxuICAgICAgICBtZW51Ll9hbmltYXRpb25Eb25lXG4gICAgICAgICAgLnBpcGUoXG4gICAgICAgICAgICBmaWx0ZXIoZXZlbnQgPT4gZXZlbnQudG9TdGF0ZSA9PT0gJ3ZvaWQnKSxcbiAgICAgICAgICAgIHRha2UoMSksXG4gICAgICAgICAgICAvLyBJbnRlcnJ1cHQgaWYgdGhlIGNvbnRlbnQgZ290IHJlLWF0dGFjaGVkLlxuICAgICAgICAgICAgdGFrZVVudGlsKG1lbnUubGF6eUNvbnRlbnQuX2F0dGFjaGVkKSxcbiAgICAgICAgICApXG4gICAgICAgICAgLnN1YnNjcmliZSh7XG4gICAgICAgICAgICBuZXh0OiAoKSA9PiBtZW51LmxhenlDb250ZW50IS5kZXRhY2goKSxcbiAgICAgICAgICAgIC8vIE5vIG1hdHRlciB3aGV0aGVyIHRoZSBjb250ZW50IGdvdCByZS1hdHRhY2hlZCwgcmVzZXQgdGhlIG1lbnUuXG4gICAgICAgICAgICBjb21wbGV0ZTogKCkgPT4gdGhpcy5fc2V0SXNNZW51T3BlbihmYWxzZSksXG4gICAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9zZXRJc01lbnVPcGVuKGZhbHNlKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fc2V0SXNNZW51T3BlbihmYWxzZSk7XG4gICAgICBtZW51Py5sYXp5Q29udGVudD8uZGV0YWNoKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgbWV0aG9kIHNldHMgdGhlIG1lbnUgc3RhdGUgdG8gb3BlbiBhbmQgZm9jdXNlcyB0aGUgZmlyc3QgaXRlbSBpZlxuICAgKiB0aGUgbWVudSB3YXMgb3BlbmVkIHZpYSB0aGUga2V5Ym9hcmQuXG4gICAqL1xuICBwcml2YXRlIF9pbml0TWVudShtZW51OiBNYXRNZW51UGFuZWwpOiB2b2lkIHtcbiAgICBtZW51LnBhcmVudE1lbnUgPSB0aGlzLnRyaWdnZXJzU3VibWVudSgpID8gdGhpcy5fcGFyZW50TWF0ZXJpYWxNZW51IDogdW5kZWZpbmVkO1xuICAgIG1lbnUuZGlyZWN0aW9uID0gdGhpcy5kaXI7XG4gICAgdGhpcy5fc2V0TWVudUVsZXZhdGlvbihtZW51KTtcbiAgICBtZW51LmZvY3VzRmlyc3RJdGVtKHRoaXMuX29wZW5lZEJ5IHx8ICdwcm9ncmFtJyk7XG4gICAgdGhpcy5fc2V0SXNNZW51T3Blbih0cnVlKTtcbiAgfVxuXG4gIC8qKiBVcGRhdGVzIHRoZSBtZW51IGVsZXZhdGlvbiBiYXNlZCBvbiB0aGUgYW1vdW50IG9mIHBhcmVudCBtZW51cyB0aGF0IGl0IGhhcy4gKi9cbiAgcHJpdmF0ZSBfc2V0TWVudUVsZXZhdGlvbihtZW51OiBNYXRNZW51UGFuZWwpOiB2b2lkIHtcbiAgICBpZiAobWVudS5zZXRFbGV2YXRpb24pIHtcbiAgICAgIGxldCBkZXB0aCA9IDA7XG4gICAgICBsZXQgcGFyZW50TWVudSA9IG1lbnUucGFyZW50TWVudTtcblxuICAgICAgd2hpbGUgKHBhcmVudE1lbnUpIHtcbiAgICAgICAgZGVwdGgrKztcbiAgICAgICAgcGFyZW50TWVudSA9IHBhcmVudE1lbnUucGFyZW50TWVudTtcbiAgICAgIH1cblxuICAgICAgbWVudS5zZXRFbGV2YXRpb24oZGVwdGgpO1xuICAgIH1cbiAgfVxuXG4gIC8vIHNldCBzdGF0ZSByYXRoZXIgdGhhbiB0b2dnbGUgdG8gc3VwcG9ydCB0cmlnZ2VycyBzaGFyaW5nIGEgbWVudVxuICBwcml2YXRlIF9zZXRJc01lbnVPcGVuKGlzT3BlbjogYm9vbGVhbik6IHZvaWQge1xuICAgIGlmIChpc09wZW4gIT09IHRoaXMuX21lbnVPcGVuKSB7XG4gICAgICB0aGlzLl9tZW51T3BlbiA9IGlzT3BlbjtcbiAgICAgIHRoaXMuX21lbnVPcGVuID8gdGhpcy5tZW51T3BlbmVkLmVtaXQoKSA6IHRoaXMubWVudUNsb3NlZC5lbWl0KCk7XG5cbiAgICAgIGlmICh0aGlzLnRyaWdnZXJzU3VibWVudSgpKSB7XG4gICAgICAgIHRoaXMuX21lbnVJdGVtSW5zdGFuY2UuX3NldEhpZ2hsaWdodGVkKGlzT3Blbik7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIG1ldGhvZCBjcmVhdGVzIHRoZSBvdmVybGF5IGZyb20gdGhlIHByb3ZpZGVkIG1lbnUncyB0ZW1wbGF0ZSBhbmQgc2F2ZXMgaXRzXG4gICAqIE92ZXJsYXlSZWYgc28gdGhhdCBpdCBjYW4gYmUgYXR0YWNoZWQgdG8gdGhlIERPTSB3aGVuIG9wZW5NZW51IGlzIGNhbGxlZC5cbiAgICovXG4gIHByaXZhdGUgX2NyZWF0ZU92ZXJsYXkobWVudTogTWF0TWVudVBhbmVsKTogT3ZlcmxheVJlZiB7XG4gICAgaWYgKCF0aGlzLl9vdmVybGF5UmVmKSB7XG4gICAgICBjb25zdCBjb25maWcgPSB0aGlzLl9nZXRPdmVybGF5Q29uZmlnKG1lbnUpO1xuICAgICAgdGhpcy5fc3Vic2NyaWJlVG9Qb3NpdGlvbnMoXG4gICAgICAgIG1lbnUsXG4gICAgICAgIGNvbmZpZy5wb3NpdGlvblN0cmF0ZWd5IGFzIEZsZXhpYmxlQ29ubmVjdGVkUG9zaXRpb25TdHJhdGVneSxcbiAgICAgICk7XG4gICAgICB0aGlzLl9vdmVybGF5UmVmID0gdGhpcy5fb3ZlcmxheS5jcmVhdGUoY29uZmlnKTtcblxuICAgICAgLy8gQ29uc3VtZSB0aGUgYGtleWRvd25FdmVudHNgIGluIG9yZGVyIHRvIHByZXZlbnQgdGhlbSBmcm9tIGdvaW5nIHRvIGFub3RoZXIgb3ZlcmxheS5cbiAgICAgIC8vIElkZWFsbHkgd2UnZCBhbHNvIGhhdmUgb3VyIGtleWJvYXJkIGV2ZW50IGxvZ2ljIGluIGhlcmUsIGhvd2V2ZXIgZG9pbmcgc28gd2lsbFxuICAgICAgLy8gYnJlYWsgYW55Ym9keSB0aGF0IG1heSBoYXZlIGltcGxlbWVudGVkIHRoZSBgTWF0TWVudVBhbmVsYCB0aGVtc2VsdmVzLlxuICAgICAgdGhpcy5fb3ZlcmxheVJlZi5rZXlkb3duRXZlbnRzKCkuc3Vic2NyaWJlKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX292ZXJsYXlSZWY7XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBtZXRob2QgYnVpbGRzIHRoZSBjb25maWd1cmF0aW9uIG9iamVjdCBuZWVkZWQgdG8gY3JlYXRlIHRoZSBvdmVybGF5LCB0aGUgT3ZlcmxheVN0YXRlLlxuICAgKiBAcmV0dXJucyBPdmVybGF5Q29uZmlnXG4gICAqL1xuICBwcml2YXRlIF9nZXRPdmVybGF5Q29uZmlnKG1lbnU6IE1hdE1lbnVQYW5lbCk6IE92ZXJsYXlDb25maWcge1xuICAgIHJldHVybiBuZXcgT3ZlcmxheUNvbmZpZyh7XG4gICAgICBwb3NpdGlvblN0cmF0ZWd5OiB0aGlzLl9vdmVybGF5XG4gICAgICAgIC5wb3NpdGlvbigpXG4gICAgICAgIC5mbGV4aWJsZUNvbm5lY3RlZFRvKHRoaXMuX2VsZW1lbnQpXG4gICAgICAgIC53aXRoTG9ja2VkUG9zaXRpb24oKVxuICAgICAgICAud2l0aEdyb3dBZnRlck9wZW4oKVxuICAgICAgICAud2l0aFRyYW5zZm9ybU9yaWdpbk9uKCcubWF0LW1lbnUtcGFuZWwsIC5tYXQtbWRjLW1lbnUtcGFuZWwnKSxcbiAgICAgIGJhY2tkcm9wQ2xhc3M6IG1lbnUuYmFja2Ryb3BDbGFzcyB8fCAnY2RrLW92ZXJsYXktdHJhbnNwYXJlbnQtYmFja2Ryb3AnLFxuICAgICAgcGFuZWxDbGFzczogbWVudS5vdmVybGF5UGFuZWxDbGFzcyxcbiAgICAgIHNjcm9sbFN0cmF0ZWd5OiB0aGlzLl9zY3JvbGxTdHJhdGVneSgpLFxuICAgICAgZGlyZWN0aW9uOiB0aGlzLl9kaXIsXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogTGlzdGVucyB0byBjaGFuZ2VzIGluIHRoZSBwb3NpdGlvbiBvZiB0aGUgb3ZlcmxheSBhbmQgc2V0cyB0aGUgY29ycmVjdCBjbGFzc2VzXG4gICAqIG9uIHRoZSBtZW51IGJhc2VkIG9uIHRoZSBuZXcgcG9zaXRpb24uIFRoaXMgZW5zdXJlcyB0aGUgYW5pbWF0aW9uIG9yaWdpbiBpcyBhbHdheXNcbiAgICogY29ycmVjdCwgZXZlbiBpZiBhIGZhbGxiYWNrIHBvc2l0aW9uIGlzIHVzZWQgZm9yIHRoZSBvdmVybGF5LlxuICAgKi9cbiAgcHJpdmF0ZSBfc3Vic2NyaWJlVG9Qb3NpdGlvbnMobWVudTogTWF0TWVudVBhbmVsLCBwb3NpdGlvbjogRmxleGlibGVDb25uZWN0ZWRQb3NpdGlvblN0cmF0ZWd5KSB7XG4gICAgaWYgKG1lbnUuc2V0UG9zaXRpb25DbGFzc2VzKSB7XG4gICAgICBwb3NpdGlvbi5wb3NpdGlvbkNoYW5nZXMuc3Vic2NyaWJlKGNoYW5nZSA9PiB7XG4gICAgICAgIGNvbnN0IHBvc1g6IE1lbnVQb3NpdGlvblggPSBjaGFuZ2UuY29ubmVjdGlvblBhaXIub3ZlcmxheVggPT09ICdzdGFydCcgPyAnYWZ0ZXInIDogJ2JlZm9yZSc7XG4gICAgICAgIGNvbnN0IHBvc1k6IE1lbnVQb3NpdGlvblkgPSBjaGFuZ2UuY29ubmVjdGlvblBhaXIub3ZlcmxheVkgPT09ICd0b3AnID8gJ2JlbG93JyA6ICdhYm92ZSc7XG5cbiAgICAgICAgLy8gQGJyZWFraW5nLWNoYW5nZSAxNS4wLjAgUmVtb3ZlIG51bGwgY2hlY2sgZm9yIGBuZ1pvbmVgLlxuICAgICAgICAvLyBgcG9zaXRpb25DaGFuZ2VzYCBmaXJlcyBvdXRzaWRlIG9mIHRoZSBgbmdab25lYCBhbmQgYHNldFBvc2l0aW9uQ2xhc3Nlc2AgbWlnaHQgYmVcbiAgICAgICAgLy8gdXBkYXRpbmcgc29tZXRoaW5nIGluIHRoZSB2aWV3IHNvIHdlIG5lZWQgdG8gYnJpbmcgaXQgYmFjayBpbi5cbiAgICAgICAgaWYgKHRoaXMuX25nWm9uZSkge1xuICAgICAgICAgIHRoaXMuX25nWm9uZS5ydW4oKCkgPT4gbWVudS5zZXRQb3NpdGlvbkNsYXNzZXMhKHBvc1gsIHBvc1kpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBtZW51LnNldFBvc2l0aW9uQ2xhc3NlcyEocG9zWCwgcG9zWSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBhcHByb3ByaWF0ZSBwb3NpdGlvbnMgb24gYSBwb3NpdGlvbiBzdHJhdGVneVxuICAgKiBzbyB0aGUgb3ZlcmxheSBjb25uZWN0cyB3aXRoIHRoZSB0cmlnZ2VyIGNvcnJlY3RseS5cbiAgICogQHBhcmFtIHBvc2l0aW9uU3RyYXRlZ3kgU3RyYXRlZ3kgd2hvc2UgcG9zaXRpb24gdG8gdXBkYXRlLlxuICAgKi9cbiAgcHJpdmF0ZSBfc2V0UG9zaXRpb24obWVudTogTWF0TWVudVBhbmVsLCBwb3NpdGlvblN0cmF0ZWd5OiBGbGV4aWJsZUNvbm5lY3RlZFBvc2l0aW9uU3RyYXRlZ3kpIHtcbiAgICBsZXQgW29yaWdpblgsIG9yaWdpbkZhbGxiYWNrWF06IEhvcml6b250YWxDb25uZWN0aW9uUG9zW10gPVxuICAgICAgbWVudS54UG9zaXRpb24gPT09ICdiZWZvcmUnID8gWydlbmQnLCAnc3RhcnQnXSA6IFsnc3RhcnQnLCAnZW5kJ107XG5cbiAgICBsZXQgW292ZXJsYXlZLCBvdmVybGF5RmFsbGJhY2tZXTogVmVydGljYWxDb25uZWN0aW9uUG9zW10gPVxuICAgICAgbWVudS55UG9zaXRpb24gPT09ICdhYm92ZScgPyBbJ2JvdHRvbScsICd0b3AnXSA6IFsndG9wJywgJ2JvdHRvbSddO1xuXG4gICAgbGV0IFtvcmlnaW5ZLCBvcmlnaW5GYWxsYmFja1ldID0gW292ZXJsYXlZLCBvdmVybGF5RmFsbGJhY2tZXTtcbiAgICBsZXQgW292ZXJsYXlYLCBvdmVybGF5RmFsbGJhY2tYXSA9IFtvcmlnaW5YLCBvcmlnaW5GYWxsYmFja1hdO1xuICAgIGxldCBvZmZzZXRZID0gMDtcblxuICAgIGlmICh0aGlzLnRyaWdnZXJzU3VibWVudSgpKSB7XG4gICAgICAvLyBXaGVuIHRoZSBtZW51IGlzIGEgc3ViLW1lbnUsIGl0IHNob3VsZCBhbHdheXMgYWxpZ24gaXRzZWxmXG4gICAgICAvLyB0byB0aGUgZWRnZXMgb2YgdGhlIHRyaWdnZXIsIGluc3RlYWQgb2Ygb3ZlcmxhcHBpbmcgaXQuXG4gICAgICBvdmVybGF5RmFsbGJhY2tYID0gb3JpZ2luWCA9IG1lbnUueFBvc2l0aW9uID09PSAnYmVmb3JlJyA/ICdzdGFydCcgOiAnZW5kJztcbiAgICAgIG9yaWdpbkZhbGxiYWNrWCA9IG92ZXJsYXlYID0gb3JpZ2luWCA9PT0gJ2VuZCcgPyAnc3RhcnQnIDogJ2VuZCc7XG5cbiAgICAgIGlmICh0aGlzLl9wYXJlbnRNYXRlcmlhbE1lbnUpIHtcbiAgICAgICAgaWYgKHRoaXMuX3BhcmVudElubmVyUGFkZGluZyA9PSBudWxsKSB7XG4gICAgICAgICAgY29uc3QgZmlyc3RJdGVtID0gdGhpcy5fcGFyZW50TWF0ZXJpYWxNZW51Lml0ZW1zLmZpcnN0O1xuICAgICAgICAgIHRoaXMuX3BhcmVudElubmVyUGFkZGluZyA9IGZpcnN0SXRlbSA/IGZpcnN0SXRlbS5fZ2V0SG9zdEVsZW1lbnQoKS5vZmZzZXRUb3AgOiAwO1xuICAgICAgICB9XG5cbiAgICAgICAgb2Zmc2V0WSA9IG92ZXJsYXlZID09PSAnYm90dG9tJyA/IHRoaXMuX3BhcmVudElubmVyUGFkZGluZyA6IC10aGlzLl9wYXJlbnRJbm5lclBhZGRpbmc7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICghbWVudS5vdmVybGFwVHJpZ2dlcikge1xuICAgICAgb3JpZ2luWSA9IG92ZXJsYXlZID09PSAndG9wJyA/ICdib3R0b20nIDogJ3RvcCc7XG4gICAgICBvcmlnaW5GYWxsYmFja1kgPSBvdmVybGF5RmFsbGJhY2tZID09PSAndG9wJyA/ICdib3R0b20nIDogJ3RvcCc7XG4gICAgfVxuXG4gICAgcG9zaXRpb25TdHJhdGVneS53aXRoUG9zaXRpb25zKFtcbiAgICAgIHtvcmlnaW5YLCBvcmlnaW5ZLCBvdmVybGF5WCwgb3ZlcmxheVksIG9mZnNldFl9LFxuICAgICAge29yaWdpblg6IG9yaWdpbkZhbGxiYWNrWCwgb3JpZ2luWSwgb3ZlcmxheVg6IG92ZXJsYXlGYWxsYmFja1gsIG92ZXJsYXlZLCBvZmZzZXRZfSxcbiAgICAgIHtcbiAgICAgICAgb3JpZ2luWCxcbiAgICAgICAgb3JpZ2luWTogb3JpZ2luRmFsbGJhY2tZLFxuICAgICAgICBvdmVybGF5WCxcbiAgICAgICAgb3ZlcmxheVk6IG92ZXJsYXlGYWxsYmFja1ksXG4gICAgICAgIG9mZnNldFk6IC1vZmZzZXRZLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgb3JpZ2luWDogb3JpZ2luRmFsbGJhY2tYLFxuICAgICAgICBvcmlnaW5ZOiBvcmlnaW5GYWxsYmFja1ksXG4gICAgICAgIG92ZXJsYXlYOiBvdmVybGF5RmFsbGJhY2tYLFxuICAgICAgICBvdmVybGF5WTogb3ZlcmxheUZhbGxiYWNrWSxcbiAgICAgICAgb2Zmc2V0WTogLW9mZnNldFksXG4gICAgICB9LFxuICAgIF0pO1xuICB9XG5cbiAgLyoqIFJldHVybnMgYSBzdHJlYW0gdGhhdCBlbWl0cyB3aGVuZXZlciBhbiBhY3Rpb24gdGhhdCBzaG91bGQgY2xvc2UgdGhlIG1lbnUgb2NjdXJzLiAqL1xuICBwcml2YXRlIF9tZW51Q2xvc2luZ0FjdGlvbnMoKSB7XG4gICAgY29uc3QgYmFja2Ryb3AgPSB0aGlzLl9vdmVybGF5UmVmIS5iYWNrZHJvcENsaWNrKCk7XG4gICAgY29uc3QgZGV0YWNobWVudHMgPSB0aGlzLl9vdmVybGF5UmVmIS5kZXRhY2htZW50cygpO1xuICAgIGNvbnN0IHBhcmVudENsb3NlID0gdGhpcy5fcGFyZW50TWF0ZXJpYWxNZW51ID8gdGhpcy5fcGFyZW50TWF0ZXJpYWxNZW51LmNsb3NlZCA6IG9ic2VydmFibGVPZigpO1xuICAgIGNvbnN0IGhvdmVyID0gdGhpcy5fcGFyZW50TWF0ZXJpYWxNZW51XG4gICAgICA/IHRoaXMuX3BhcmVudE1hdGVyaWFsTWVudS5faG92ZXJlZCgpLnBpcGUoXG4gICAgICAgICAgZmlsdGVyKGFjdGl2ZSA9PiBhY3RpdmUgIT09IHRoaXMuX21lbnVJdGVtSW5zdGFuY2UpLFxuICAgICAgICAgIGZpbHRlcigoKSA9PiB0aGlzLl9tZW51T3BlbiksXG4gICAgICAgIClcbiAgICAgIDogb2JzZXJ2YWJsZU9mKCk7XG5cbiAgICByZXR1cm4gbWVyZ2UoYmFja2Ryb3AsIHBhcmVudENsb3NlIGFzIE9ic2VydmFibGU8TWVudUNsb3NlUmVhc29uPiwgaG92ZXIsIGRldGFjaG1lbnRzKTtcbiAgfVxuXG4gIC8qKiBIYW5kbGVzIG1vdXNlIHByZXNzZXMgb24gdGhlIHRyaWdnZXIuICovXG4gIF9oYW5kbGVNb3VzZWRvd24oZXZlbnQ6IE1vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICBpZiAoIWlzRmFrZU1vdXNlZG93bkZyb21TY3JlZW5SZWFkZXIoZXZlbnQpKSB7XG4gICAgICAvLyBTaW5jZSByaWdodCBvciBtaWRkbGUgYnV0dG9uIGNsaWNrcyB3b24ndCB0cmlnZ2VyIHRoZSBgY2xpY2tgIGV2ZW50LFxuICAgICAgLy8gd2Ugc2hvdWxkbid0IGNvbnNpZGVyIHRoZSBtZW51IGFzIG9wZW5lZCBieSBtb3VzZSBpbiB0aG9zZSBjYXNlcy5cbiAgICAgIHRoaXMuX29wZW5lZEJ5ID0gZXZlbnQuYnV0dG9uID09PSAwID8gJ21vdXNlJyA6IHVuZGVmaW5lZDtcblxuICAgICAgLy8gU2luY2UgY2xpY2tpbmcgb24gdGhlIHRyaWdnZXIgd29uJ3QgY2xvc2UgdGhlIG1lbnUgaWYgaXQgb3BlbnMgYSBzdWItbWVudSxcbiAgICAgIC8vIHdlIHNob3VsZCBwcmV2ZW50IGZvY3VzIGZyb20gbW92aW5nIG9udG8gaXQgdmlhIGNsaWNrIHRvIGF2b2lkIHRoZVxuICAgICAgLy8gaGlnaGxpZ2h0IGZyb20gbGluZ2VyaW5nIG9uIHRoZSBtZW51IGl0ZW0uXG4gICAgICBpZiAodGhpcy50cmlnZ2Vyc1N1Ym1lbnUoKSkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBIYW5kbGVzIGtleSBwcmVzc2VzIG9uIHRoZSB0cmlnZ2VyLiAqL1xuICBfaGFuZGxlS2V5ZG93bihldmVudDogS2V5Ym9hcmRFdmVudCk6IHZvaWQge1xuICAgIGNvbnN0IGtleUNvZGUgPSBldmVudC5rZXlDb2RlO1xuXG4gICAgLy8gUHJlc3NpbmcgZW50ZXIgb24gdGhlIHRyaWdnZXIgd2lsbCB0cmlnZ2VyIHRoZSBjbGljayBoYW5kbGVyIGxhdGVyLlxuICAgIGlmIChrZXlDb2RlID09PSBFTlRFUiB8fCBrZXlDb2RlID09PSBTUEFDRSkge1xuICAgICAgdGhpcy5fb3BlbmVkQnkgPSAna2V5Ym9hcmQnO1xuICAgIH1cblxuICAgIGlmIChcbiAgICAgIHRoaXMudHJpZ2dlcnNTdWJtZW51KCkgJiZcbiAgICAgICgoa2V5Q29kZSA9PT0gUklHSFRfQVJST1cgJiYgdGhpcy5kaXIgPT09ICdsdHInKSB8fFxuICAgICAgICAoa2V5Q29kZSA9PT0gTEVGVF9BUlJPVyAmJiB0aGlzLmRpciA9PT0gJ3J0bCcpKVxuICAgICkge1xuICAgICAgdGhpcy5fb3BlbmVkQnkgPSAna2V5Ym9hcmQnO1xuICAgICAgdGhpcy5vcGVuTWVudSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBIYW5kbGVzIGNsaWNrIGV2ZW50cyBvbiB0aGUgdHJpZ2dlci4gKi9cbiAgX2hhbmRsZUNsaWNrKGV2ZW50OiBNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgaWYgKHRoaXMudHJpZ2dlcnNTdWJtZW51KCkpIHtcbiAgICAgIC8vIFN0b3AgZXZlbnQgcHJvcGFnYXRpb24gdG8gYXZvaWQgY2xvc2luZyB0aGUgcGFyZW50IG1lbnUuXG4gICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgIHRoaXMub3Blbk1lbnUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy50b2dnbGVNZW51KCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEhhbmRsZXMgdGhlIGNhc2VzIHdoZXJlIHRoZSB1c2VyIGhvdmVycyBvdmVyIHRoZSB0cmlnZ2VyLiAqL1xuICBwcml2YXRlIF9oYW5kbGVIb3ZlcigpIHtcbiAgICAvLyBTdWJzY3JpYmUgdG8gY2hhbmdlcyBpbiB0aGUgaG92ZXJlZCBpdGVtIGluIG9yZGVyIHRvIHRvZ2dsZSB0aGUgcGFuZWwuXG4gICAgaWYgKCF0aGlzLnRyaWdnZXJzU3VibWVudSgpIHx8ICF0aGlzLl9wYXJlbnRNYXRlcmlhbE1lbnUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9ob3ZlclN1YnNjcmlwdGlvbiA9IHRoaXMuX3BhcmVudE1hdGVyaWFsTWVudVxuICAgICAgLl9ob3ZlcmVkKClcbiAgICAgIC8vIFNpbmNlIHdlIG1pZ2h0IGhhdmUgbXVsdGlwbGUgY29tcGV0aW5nIHRyaWdnZXJzIGZvciB0aGUgc2FtZSBtZW51IChlLmcuIGEgc3ViLW1lbnVcbiAgICAgIC8vIHdpdGggZGlmZmVyZW50IGRhdGEgYW5kIHRyaWdnZXJzKSwgd2UgaGF2ZSB0byBkZWxheSBpdCBieSBhIHRpY2sgdG8gZW5zdXJlIHRoYXRcbiAgICAgIC8vIGl0IHdvbid0IGJlIGNsb3NlZCBpbW1lZGlhdGVseSBhZnRlciBpdCBpcyBvcGVuZWQuXG4gICAgICAucGlwZShcbiAgICAgICAgZmlsdGVyKGFjdGl2ZSA9PiBhY3RpdmUgPT09IHRoaXMuX21lbnVJdGVtSW5zdGFuY2UgJiYgIWFjdGl2ZS5kaXNhYmxlZCksXG4gICAgICAgIGRlbGF5KDAsIGFzYXBTY2hlZHVsZXIpLFxuICAgICAgKVxuICAgICAgLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgIHRoaXMuX29wZW5lZEJ5ID0gJ21vdXNlJztcblxuICAgICAgICAvLyBJZiB0aGUgc2FtZSBtZW51IGlzIHVzZWQgYmV0d2VlbiBtdWx0aXBsZSB0cmlnZ2VycywgaXQgbWlnaHQgc3RpbGwgYmUgYW5pbWF0aW5nXG4gICAgICAgIC8vIHdoaWxlIHRoZSBuZXcgdHJpZ2dlciB0cmllcyB0byByZS1vcGVuIGl0LiBXYWl0IGZvciB0aGUgYW5pbWF0aW9uIHRvIGZpbmlzaFxuICAgICAgICAvLyBiZWZvcmUgZG9pbmcgc28uIEFsc28gaW50ZXJydXB0IGlmIHRoZSB1c2VyIG1vdmVzIHRvIGFub3RoZXIgaXRlbS5cbiAgICAgICAgaWYgKHRoaXMubWVudSBpbnN0YW5jZW9mIF9NYXRNZW51QmFzZSAmJiB0aGlzLm1lbnUuX2lzQW5pbWF0aW5nKSB7XG4gICAgICAgICAgLy8gV2UgbmVlZCB0aGUgYGRlbGF5KDApYCBoZXJlIGluIG9yZGVyIHRvIGF2b2lkXG4gICAgICAgICAgLy8gJ2NoYW5nZWQgYWZ0ZXIgY2hlY2tlZCcgZXJyb3JzIGluIHNvbWUgY2FzZXMuIFNlZSAjMTIxOTQuXG4gICAgICAgICAgdGhpcy5tZW51Ll9hbmltYXRpb25Eb25lXG4gICAgICAgICAgICAucGlwZSh0YWtlKDEpLCBkZWxheSgwLCBhc2FwU2NoZWR1bGVyKSwgdGFrZVVudGlsKHRoaXMuX3BhcmVudE1hdGVyaWFsTWVudSEuX2hvdmVyZWQoKSkpXG4gICAgICAgICAgICAuc3Vic2NyaWJlKCgpID0+IHRoaXMub3Blbk1lbnUoKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5vcGVuTWVudSgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBwb3J0YWwgdGhhdCBzaG91bGQgYmUgYXR0YWNoZWQgdG8gdGhlIG92ZXJsYXkuICovXG4gIHByaXZhdGUgX2dldFBvcnRhbChtZW51OiBNYXRNZW51UGFuZWwpOiBUZW1wbGF0ZVBvcnRhbCB7XG4gICAgLy8gTm90ZSB0aGF0IHdlIGNhbiBhdm9pZCB0aGlzIGNoZWNrIGJ5IGtlZXBpbmcgdGhlIHBvcnRhbCBvbiB0aGUgbWVudSBwYW5lbC5cbiAgICAvLyBXaGlsZSBpdCB3b3VsZCBiZSBjbGVhbmVyLCB3ZSdkIGhhdmUgdG8gaW50cm9kdWNlIGFub3RoZXIgcmVxdWlyZWQgbWV0aG9kIG9uXG4gICAgLy8gYE1hdE1lbnVQYW5lbGAsIG1ha2luZyBpdCBoYXJkZXIgdG8gY29uc3VtZS5cbiAgICBpZiAoIXRoaXMuX3BvcnRhbCB8fCB0aGlzLl9wb3J0YWwudGVtcGxhdGVSZWYgIT09IG1lbnUudGVtcGxhdGVSZWYpIHtcbiAgICAgIHRoaXMuX3BvcnRhbCA9IG5ldyBUZW1wbGF0ZVBvcnRhbChtZW51LnRlbXBsYXRlUmVmLCB0aGlzLl92aWV3Q29udGFpbmVyUmVmKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fcG9ydGFsO1xuICB9XG59XG5cbi8qKiBEaXJlY3RpdmUgYXBwbGllZCB0byBhbiBlbGVtZW50IHRoYXQgc2hvdWxkIHRyaWdnZXIgYSBgbWF0LW1lbnVgLiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiBgW21hdC1tZW51LXRyaWdnZXItZm9yXSwgW21hdE1lbnVUcmlnZ2VyRm9yXWAsXG4gIGhvc3Q6IHtcbiAgICAnY2xhc3MnOiAnbWF0LW1kYy1tZW51LXRyaWdnZXInLFxuICB9LFxuICBleHBvcnRBczogJ21hdE1lbnVUcmlnZ2VyJyxcbn0pXG5leHBvcnQgY2xhc3MgTWF0TWVudVRyaWdnZXIgZXh0ZW5kcyBfTWF0TWVudVRyaWdnZXJCYXNlIHt9XG4iXX0=