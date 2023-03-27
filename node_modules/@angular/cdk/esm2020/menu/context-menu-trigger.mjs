/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, inject, Injectable, Input } from '@angular/core';
import { Directionality } from '@angular/cdk/bidi';
import { Overlay, OverlayConfig, STANDARD_DROPDOWN_BELOW_POSITIONS, } from '@angular/cdk/overlay';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { _getEventTarget } from '@angular/cdk/platform';
import { merge, partition } from 'rxjs';
import { skip, takeUntil } from 'rxjs/operators';
import { MENU_STACK, MenuStack } from './menu-stack';
import { CdkMenuTriggerBase, MENU_TRIGGER } from './menu-trigger-base';
import * as i0 from "@angular/core";
/** The preferred menu positions for the context menu. */
const CONTEXT_MENU_POSITIONS = STANDARD_DROPDOWN_BELOW_POSITIONS.map(position => {
    // In cases where the first menu item in the context menu is a trigger the submenu opens on a
    // hover event. We offset the context menu 2px by default to prevent this from occurring.
    const offsetX = position.overlayX === 'start' ? 2 : -2;
    const offsetY = position.overlayY === 'top' ? 2 : -2;
    return { ...position, offsetX, offsetY };
});
/** Tracks the last open context menu trigger across the entire application. */
export class ContextMenuTracker {
    /**
     * Close the previous open context menu and set the given one as being open.
     * @param trigger The trigger for the currently open Context Menu.
     */
    update(trigger) {
        if (ContextMenuTracker._openContextMenuTrigger !== trigger) {
            ContextMenuTracker._openContextMenuTrigger?.close();
            ContextMenuTracker._openContextMenuTrigger = trigger;
        }
    }
}
ContextMenuTracker.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: ContextMenuTracker, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
ContextMenuTracker.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: ContextMenuTracker, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: ContextMenuTracker, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });
/**
 * A directive that opens a menu when a user right-clicks within its host element.
 * It is aware of nested context menus and will trigger only the lowest level non-disabled context menu.
 */
export class CdkContextMenuTrigger extends CdkMenuTriggerBase {
    /** Whether the context menu is disabled. */
    get disabled() {
        return this._disabled;
    }
    set disabled(value) {
        this._disabled = coerceBooleanProperty(value);
    }
    constructor() {
        super();
        /** The CDK overlay service. */
        this._overlay = inject(Overlay);
        /** The directionality of the page. */
        this._directionality = inject(Directionality, { optional: true });
        /** The app's context menu tracking registry */
        this._contextMenuTracker = inject(ContextMenuTracker);
        this._disabled = false;
        this._setMenuStackCloseListener();
    }
    /**
     * Open the attached menu at the specified location.
     * @param coordinates where to open the context menu
     */
    open(coordinates) {
        this._open(coordinates, false);
    }
    /** Close the currently opened context menu. */
    close() {
        this.menuStack.closeAll();
    }
    /**
     * Open the context menu and closes any previously open menus.
     * @param event the mouse event which opens the context menu.
     */
    _openOnContextMenu(event) {
        if (!this.disabled) {
            // Prevent the native context menu from opening because we're opening a custom one.
            event.preventDefault();
            // Stop event propagation to ensure that only the closest enabled context menu opens.
            // Otherwise, any context menus attached to containing elements would *also* open,
            // resulting in multiple stacked context menus being displayed.
            event.stopPropagation();
            this._contextMenuTracker.update(this);
            this._open({ x: event.clientX, y: event.clientY }, true);
            // A context menu can be triggered via a mouse right click or a keyboard shortcut.
            if (event.button === 2) {
                this.childMenu?.focusFirstItem('mouse');
            }
            else if (event.button === 0) {
                this.childMenu?.focusFirstItem('keyboard');
            }
            else {
                this.childMenu?.focusFirstItem('program');
            }
        }
    }
    /**
     * Get the configuration object used to create the overlay.
     * @param coordinates the location to place the opened menu
     */
    _getOverlayConfig(coordinates) {
        return new OverlayConfig({
            positionStrategy: this._getOverlayPositionStrategy(coordinates),
            scrollStrategy: this._overlay.scrollStrategies.reposition(),
            direction: this._directionality || undefined,
        });
    }
    /**
     * Get the position strategy for the overlay which specifies where to place the menu.
     * @param coordinates the location to place the opened menu
     */
    _getOverlayPositionStrategy(coordinates) {
        return this._overlay
            .position()
            .flexibleConnectedTo(coordinates)
            .withLockedPosition()
            .withGrowAfterOpen()
            .withPositions(this.menuPosition ?? CONTEXT_MENU_POSITIONS);
    }
    /** Subscribe to the menu stack close events and close this menu when requested. */
    _setMenuStackCloseListener() {
        this.menuStack.closed.pipe(takeUntil(this.destroyed)).subscribe(({ item }) => {
            if (item === this.childMenu && this.isOpen()) {
                this.closed.next();
                this.overlayRef.detach();
            }
        });
    }
    /**
     * Subscribe to the overlays outside pointer events stream and handle closing out the stack if a
     * click occurs outside the menus.
     * @param ignoreFirstAuxClick Whether to ignore the first auxclick event outside the menu.
     */
    _subscribeToOutsideClicks(ignoreFirstAuxClick) {
        if (this.overlayRef) {
            let outsideClicks = this.overlayRef.outsidePointerEvents();
            // If the menu was triggered by the `contextmenu` event, skip the first `auxclick` event
            // because it fires when the mouse is released on the same click that opened the menu.
            if (ignoreFirstAuxClick) {
                const [auxClicks, nonAuxClicks] = partition(outsideClicks, ({ type }) => type === 'auxclick');
                outsideClicks = merge(nonAuxClicks, auxClicks.pipe(skip(1)));
            }
            outsideClicks.pipe(takeUntil(this.stopOutsideClicksListener)).subscribe(event => {
                if (!this.isElementInsideMenuStack(_getEventTarget(event))) {
                    this.menuStack.closeAll();
                }
            });
        }
    }
    /**
     * Open the attached menu at the specified location.
     * @param coordinates where to open the context menu
     * @param ignoreFirstOutsideAuxClick Whether to ignore the first auxclick outside the menu after opening.
     */
    _open(coordinates, ignoreFirstOutsideAuxClick) {
        if (this.disabled) {
            return;
        }
        if (this.isOpen()) {
            // since we're moving this menu we need to close any submenus first otherwise they end up
            // disconnected from this one.
            this.menuStack.closeSubMenuOf(this.childMenu);
            this.overlayRef.getConfig().positionStrategy.setOrigin(coordinates);
            this.overlayRef.updatePosition();
        }
        else {
            this.opened.next();
            if (this.overlayRef) {
                this.overlayRef.getConfig().positionStrategy.setOrigin(coordinates);
                this.overlayRef.updatePosition();
            }
            else {
                this.overlayRef = this._overlay.create(this._getOverlayConfig(coordinates));
            }
            this.overlayRef.attach(this.getMenuContentPortal());
            this._subscribeToOutsideClicks(ignoreFirstOutsideAuxClick);
        }
    }
}
CdkContextMenuTrigger.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: CdkContextMenuTrigger, deps: [], target: i0.ɵɵFactoryTarget.Directive });
CdkContextMenuTrigger.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "15.2.0-rc.0", type: CdkContextMenuTrigger, isStandalone: true, selector: "[cdkContextMenuTriggerFor]", inputs: { menuTemplateRef: ["cdkContextMenuTriggerFor", "menuTemplateRef"], menuPosition: ["cdkContextMenuPosition", "menuPosition"], menuData: ["cdkContextMenuTriggerData", "menuData"], disabled: ["cdkContextMenuDisabled", "disabled"] }, outputs: { opened: "cdkContextMenuOpened", closed: "cdkContextMenuClosed" }, host: { listeners: { "contextmenu": "_openOnContextMenu($event)" }, properties: { "attr.data-cdk-menu-stack-id": "null" } }, providers: [
        { provide: MENU_TRIGGER, useExisting: CdkContextMenuTrigger },
        { provide: MENU_STACK, useClass: MenuStack },
    ], exportAs: ["cdkContextMenuTriggerFor"], usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: CdkContextMenuTrigger, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkContextMenuTriggerFor]',
                    exportAs: 'cdkContextMenuTriggerFor',
                    standalone: true,
                    host: {
                        '[attr.data-cdk-menu-stack-id]': 'null',
                        '(contextmenu)': '_openOnContextMenu($event)',
                    },
                    inputs: [
                        'menuTemplateRef: cdkContextMenuTriggerFor',
                        'menuPosition: cdkContextMenuPosition',
                        'menuData: cdkContextMenuTriggerData',
                    ],
                    outputs: ['opened: cdkContextMenuOpened', 'closed: cdkContextMenuClosed'],
                    providers: [
                        { provide: MENU_TRIGGER, useExisting: CdkContextMenuTrigger },
                        { provide: MENU_STACK, useClass: MenuStack },
                    ],
                }]
        }], ctorParameters: function () { return []; }, propDecorators: { disabled: [{
                type: Input,
                args: ['cdkContextMenuDisabled']
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dC1tZW51LXRyaWdnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL21lbnUvY29udGV4dC1tZW51LXRyaWdnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBWSxNQUFNLGVBQWUsQ0FBQztBQUM5RSxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDakQsT0FBTyxFQUVMLE9BQU8sRUFDUCxhQUFhLEVBQ2IsaUNBQWlDLEdBQ2xDLE1BQU0sc0JBQXNCLENBQUM7QUFDOUIsT0FBTyxFQUFlLHFCQUFxQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDMUUsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQ3RELE9BQU8sRUFBQyxLQUFLLEVBQUUsU0FBUyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQ3RDLE9BQU8sRUFBQyxJQUFJLEVBQUUsU0FBUyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDL0MsT0FBTyxFQUFDLFVBQVUsRUFBRSxTQUFTLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFDbkQsT0FBTyxFQUFDLGtCQUFrQixFQUFFLFlBQVksRUFBQyxNQUFNLHFCQUFxQixDQUFDOztBQUVyRSx5REFBeUQ7QUFDekQsTUFBTSxzQkFBc0IsR0FBRyxpQ0FBaUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUU7SUFDOUUsNkZBQTZGO0lBQzdGLHlGQUF5RjtJQUN6RixNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsUUFBUSxLQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN2RCxNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsUUFBUSxLQUFLLEtBQUssQ0FBQyxDQUFDLENB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c0JBRFgsS0FBSzt1QkFBQyx3QkFBd0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtEaXJlY3RpdmUsIGluamVjdCwgSW5qZWN0YWJsZSwgSW5wdXQsIE9uRGVzdHJveX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0RpcmVjdGlvbmFsaXR5fSBmcm9tICdAYW5ndWxhci9jZGsvYmlkaSc7XG5pbXBvcnQge1xuICBGbGV4aWJsZUNvbm5lY3RlZFBvc2l0aW9uU3RyYXRlZ3ksXG4gIE92ZXJsYXksXG4gIE92ZXJsYXlDb25maWcsXG4gIFNUQU5EQVJEX0RST1BET1dOX0JFTE9XX1BPU0lUSU9OUyxcbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL292ZXJsYXknO1xuaW1wb3J0IHtCb29sZWFuSW5wdXQsIGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcbmltcG9ydCB7X2dldEV2ZW50VGFyZ2V0fSBmcm9tICdAYW5ndWxhci9jZGsvcGxhdGZvcm0nO1xuaW1wb3J0IHttZXJnZSwgcGFydGl0aW9ufSBmcm9tICdyeGpzJztcbmltcG9ydCB7c2tpcCwgdGFrZVVudGlsfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQge01FTlVfU1RBQ0ssIE1lbnVTdGFja30gZnJvbSAnLi9tZW51LXN0YWNrJztcbmltcG9ydCB7Q2RrTWVudVRyaWdnZXJCYXNlLCBNRU5VX1RSSUdHRVJ9IGZyb20gJy4vbWVudS10cmlnZ2VyLWJhc2UnO1xuXG4vKiogVGhlIHByZWZlcnJlZCBtZW51IHBvc2l0aW9ucyBmb3IgdGhlIGNvbnRleHQgbWVudS4gKi9cbmNvbnN0IENPTlRFWFRfTUVOVV9QT1NJVElPTlMgPSBTVEFOREFSRF9EUk9QRE9XTl9CRUxPV19QT1NJVElPTlMubWFwKHBvc2l0aW9uID0+IHtcbiAgLy8gSW4gY2FzZXMgd2hlcmUgdGhlIGZpcnN0IG1lbnUgaXRlbSBpbiB0aGUgY29udGV4dCBtZW51IGlzIGEgdHJpZ2dlciB0aGUgc3VibWVudSBvcGVucyBvbiBhXG4gIC8vIGhvdmVyIGV2ZW50LiBXZSBvZmZzZXQgdGhlIGNvbnRleHQgbWVudSAycHggYnkgZGVmYXVsdCB0byBwcmV2ZW50IHRoaXMgZnJvbSBvY2N1cnJpbmcuXG4gIGNvbnN0IG9mZnNldFggPSBwb3NpdGlvbi5vdmVybGF5WCA9PT0gJ3N0YXJ0JyA/IDIgOiAtMjtcbiAgY29uc3Qgb2Zmc2V0WSA9IHBvc2l0aW9uLm92ZXJsYXlZID09PSAndG9wJyA/IDIgOiAtMjtcbiAgcmV0dXJuIHsuLi5wb3NpdGlvbiwgb2Zmc2V0WCwgb2Zmc2V0WX07XG59KTtcblxuLyoqIFRyYWNrcyB0aGUgbGFzdCBvcGVuIGNvbnRleHQgbWVudSB0cmlnZ2VyIGFjcm9zcyB0aGUgZW50aXJlIGFwcGxpY2F0aW9uLiAqL1xuQEluamVjdGFibGUoe3Byb3ZpZGVkSW46ICdyb290J30pXG5leHBvcnQgY2xhc3MgQ29udGV4dE1lbnVUcmFja2VyIHtcbiAgLyoqIFRoZSBsYXN0IG9wZW4gY29udGV4dCBtZW51IHRyaWdnZXIuICovXG4gIHByaXZhdGUgc3RhdGljIF9vcGVuQ29udGV4dE1lbnVUcmlnZ2VyPzogQ2RrQ29udGV4dE1lbnVUcmlnZ2VyO1xuXG4gIC8qKlxuICAgKiBDbG9zZSB0aGUgcHJldmlvdXMgb3BlbiBjb250ZXh0IG1lbnUgYW5kIHNldCB0aGUgZ2l2ZW4gb25lIGFzIGJlaW5nIG9wZW4uXG4gICAqIEBwYXJhbSB0cmlnZ2VyIFRoZSB0cmlnZ2VyIGZvciB0aGUgY3VycmVudGx5IG9wZW4gQ29udGV4dCBNZW51LlxuICAgKi9cbiAgdXBkYXRlKHRyaWdnZXI6IENka0NvbnRleHRNZW51VHJpZ2dlcikge1xuICAgIGlmIChDb250ZXh0TWVudVRyYWNrZXIuX29wZW5Db250ZXh0TWVudVRyaWdnZXIgIT09IHRyaWdnZXIpIHtcbiAgICAgIENvbnRleHRNZW51VHJhY2tlci5fb3BlbkNvbnRleHRNZW51VHJpZ2dlcj8uY2xvc2UoKTtcbiAgICAgIENvbnRleHRNZW51VHJhY2tlci5fb3BlbkNvbnRleHRNZW51VHJpZ2dlciA9IHRyaWdnZXI7XG4gICAgfVxuICB9XG59XG5cbi8qKiBUaGUgY29vcmRpbmF0ZXMgd2hlcmUgdGhlIGNvbnRleHQgbWVudSBzaG91bGQgb3Blbi4gKi9cbmV4cG9ydCB0eXBlIENvbnRleHRNZW51Q29vcmRpbmF0ZXMgPSB7eDogbnVtYmVyOyB5OiBudW1iZXJ9O1xuXG4vKipcbiAqIEEgZGlyZWN0aXZlIHRoYXQgb3BlbnMgYSBtZW51IHdoZW4gYSB1c2VyIHJpZ2h0LWNsaWNrcyB3aXRoaW4gaXRzIGhvc3QgZWxlbWVudC5cbiAqIEl0IGlzIGF3YXJlIG9mIG5lc3RlZCBjb250ZXh0IG1lbnVzIGFuZCB3aWxsIHRyaWdnZXIgb25seSB0aGUgbG93ZXN0IGxldmVsIG5vbi1kaXNhYmxlZCBjb250ZXh0IG1lbnUuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGtDb250ZXh0TWVudVRyaWdnZXJGb3JdJyxcbiAgZXhwb3J0QXM6ICdjZGtDb250ZXh0TWVudVRyaWdnZXJGb3InLFxuICBzdGFuZGFsb25lOiB0cnVlLFxuICBob3N0OiB7XG4gICAgJ1thdHRyLmRhdGEtY2RrLW1lbnUtc3RhY2staWRdJzogJ251bGwnLFxuICAgICcoY29udGV4dG1lbnUpJzogJ19vcGVuT25Db250ZXh0TWVudSgkZXZlbnQpJyxcbiAgfSxcbiAgaW5wdXRzOiBbXG4gICAgJ21lbnVUZW1wbGF0ZVJlZjogY2RrQ29udGV4dE1lbnVUcmlnZ2VyRm9yJyxcbiAgICAnbWVudVBvc2l0aW9uOiBjZGtDb250ZXh0TWVudVBvc2l0aW9uJyxcbiAgICAnbWVudURhdGE6IGNka0NvbnRleHRNZW51VHJpZ2dlckRhdGEnLFxuICBdLFxuICBvdXRwdXRzOiBbJ29wZW5lZDogY2RrQ29udGV4dE1lbnVPcGVuZWQnLCAnY2xvc2VkOiBjZGtDb250ZXh0TWVudUNsb3NlZCddLFxuICBwcm92aWRlcnM6IFtcbiAgICB7cHJvdmlkZTogTUVOVV9UUklHR0VSLCB1c2VFeGlzdGluZzogQ2RrQ29udGV4dE1lbnVUcmlnZ2VyfSxcbiAgICB7cHJvdmlkZTogTUVOVV9TVEFDSywgdXNlQ2xhc3M6IE1lbnVTdGFja30sXG4gIF0sXG59KVxuZXhwb3J0IGNsYXNzIENka0NvbnRleHRNZW51VHJpZ2dlciBleHRlbmRzIENka01lbnVUcmlnZ2VyQmFzZSBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gIC8qKiBUaGUgQ0RLIG92ZXJsYXkgc2VydmljZS4gKi9cbiAgcHJpdmF0ZSByZWFkb25seSBfb3ZlcmxheSA9IGluamVjdChPdmVybGF5KTtcblxuICAvKiogVGhlIGRpcmVjdGlvbmFsaXR5IG9mIHRoZSBwYWdlLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9kaXJlY3Rpb25hbGl0eSA9IGluamVjdChEaXJlY3Rpb25hbGl0eSwge29wdGlvbmFsOiB0cnVlfSk7XG5cbiAgLyoqIFRoZSBhcHAncyBjb250ZXh0IG1lbnUgdHJhY2tpbmcgcmVnaXN0cnkgKi9cbiAgcHJpdmF0ZSByZWFkb25seSBfY29udGV4dE1lbnVUcmFja2VyID0gaW5qZWN0KENvbnRleHRNZW51VHJhY2tlcik7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGNvbnRleHQgbWVudSBpcyBkaXNhYmxlZC4gKi9cbiAgQElucHV0KCdjZGtDb250ZXh0TWVudURpc2FibGVkJylcbiAgZ2V0IGRpc2FibGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9kaXNhYmxlZDtcbiAgfVxuICBzZXQgZGlzYWJsZWQodmFsdWU6IEJvb2xlYW5JbnB1dCkge1xuICAgIHRoaXMuX2Rpc2FibGVkID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHZhbHVlKTtcbiAgfVxuICBwcml2YXRlIF9kaXNhYmxlZCA9IGZhbHNlO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5fc2V0TWVudVN0YWNrQ2xvc2VMaXN0ZW5lcigpO1xuICB9XG5cbiAgLyoqXG4gICAqIE9wZW4gdGhlIGF0dGFjaGVkIG1lbnUgYXQgdGhlIHNwZWNpZmllZCBsb2NhdGlvbi5cbiAgICogQHBhcmFtIGNvb3JkaW5hdGVzIHdoZXJlIHRvIG9wZW4gdGhlIGNvbnRleHQgbWVudVxuICAgKi9cbiAgb3Blbihjb29yZGluYXRlczogQ29udGV4dE1lbnVDb29yZGluYXRlcykge1xuICAgIHRoaXMuX29wZW4oY29vcmRpbmF0ZXMsIGZhbHNlKTtcbiAgfVxuXG4gIC8qKiBDbG9zZSB0aGUgY3VycmVudGx5IG9wZW5lZCBjb250ZXh0IG1lbnUuICovXG4gIGNsb3NlKCkge1xuICAgIHRoaXMubWVudVN0YWNrLmNsb3NlQWxsKCk7XG4gIH1cblxuICAvKipcbiAgICogT3BlbiB0aGUgY29udGV4dCBtZW51IGFuZCBjbG9zZXMgYW55IHByZXZpb3VzbHkgb3BlbiBtZW51cy5cbiAgICogQHBhcmFtIGV2ZW50IHRoZSBtb3VzZSBldmVudCB3aGljaCBvcGVucyB0aGUgY29udGV4dCBtZW51LlxuICAgKi9cbiAgX29wZW5PbkNvbnRleHRNZW51KGV2ZW50OiBNb3VzZUV2ZW50KSB7XG4gICAgaWYgKCF0aGlzLmRpc2FibGVkKSB7XG4gICAgICAvLyBQcmV2ZW50IHRoZSBuYXRpdmUgY29udGV4dCBtZW51IGZyb20gb3BlbmluZyBiZWNhdXNlIHdlJ3JlIG9wZW5pbmcgYSBjdXN0b20gb25lLlxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgLy8gU3RvcCBldmVudCBwcm9wYWdhdGlvbiB0byBlbnN1cmUgdGhhdCBvbmx5IHRoZSBjbG9zZXN0IGVuYWJsZWQgY29udGV4dCBtZW51IG9wZW5zLlxuICAgICAgLy8gT3RoZXJ3aXNlLCBhbnkgY29udGV4dCBtZW51cyBhdHRhY2hlZCB0byBjb250YWluaW5nIGVsZW1lbnRzIHdvdWxkICphbHNvKiBvcGVuLFxuICAgICAgLy8gcmVzdWx0aW5nIGluIG11bHRpcGxlIHN0YWNrZWQgY29udGV4dCBtZW51cyBiZWluZyBkaXNwbGF5ZWQuXG4gICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgdGhpcy5fY29udGV4dE1lbnVUcmFja2VyLnVwZGF0ZSh0aGlzKTtcbiAgICAgIHRoaXMuX29wZW4oe3g6IGV2ZW50LmNsaWVudFgsIHk6IGV2ZW50LmNsaWVudFl9LCB0cnVlKTtcblxuICAgICAgLy8gQSBjb250ZXh0IG1lbnUgY2FuIGJlIHRyaWdnZXJlZCB2aWEgYSBtb3VzZSByaWdodCBjbGljayBvciBhIGtleWJvYXJkIHNob3J0Y3V0LlxuICAgICAgaWYgKGV2ZW50LmJ1dHRvbiA9PT0gMikge1xuICAgICAgICB0aGlzLmNoaWxkTWVudT8uZm9jdXNGaXJzdEl0ZW0oJ21vdXNlJyk7XG4gICAgICB9IGVsc2UgaWYgKGV2ZW50LmJ1dHRvbiA9PT0gMCkge1xuICAgICAgICB0aGlzLmNoaWxkTWVudT8uZm9jdXNGaXJzdEl0ZW0oJ2tleWJvYXJkJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmNoaWxkTWVudT8uZm9jdXNGaXJzdEl0ZW0oJ3Byb2dyYW0nKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBjb25maWd1cmF0aW9uIG9iamVjdCB1c2VkIHRvIGNyZWF0ZSB0aGUgb3ZlcmxheS5cbiAgICogQHBhcmFtIGNvb3JkaW5hdGVzIHRoZSBsb2NhdGlvbiB0byBwbGFjZSB0aGUgb3BlbmVkIG1lbnVcbiAgICovXG4gIHByaXZhdGUgX2dldE92ZXJsYXlDb25maWcoY29vcmRpbmF0ZXM6IENvbnRleHRNZW51Q29vcmRpbmF0ZXMpIHtcbiAgICByZXR1cm4gbmV3IE92ZXJsYXlDb25maWcoe1xuICAgICAgcG9zaXRpb25TdHJhdGVneTogdGhpcy5fZ2V0T3ZlcmxheVBvc2l0aW9uU3RyYXRlZ3koY29vcmRpbmF0ZXMpLFxuICAgICAgc2Nyb2xsU3RyYXRlZ3k6IHRoaXMuX292ZXJsYXkuc2Nyb2xsU3RyYXRlZ2llcy5yZXBvc2l0aW9uKCksXG4gICAgICBkaXJlY3Rpb246IHRoaXMuX2RpcmVjdGlvbmFsaXR5IHx8IHVuZGVmaW5lZCxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHBvc2l0aW9uIHN0cmF0ZWd5IGZvciB0aGUgb3ZlcmxheSB3aGljaCBzcGVjaWZpZXMgd2hlcmUgdG8gcGxhY2UgdGhlIG1lbnUuXG4gICAqIEBwYXJhbSBjb29yZGluYXRlcyB0aGUgbG9jYXRpb24gdG8gcGxhY2UgdGhlIG9wZW5lZCBtZW51XG4gICAqL1xuICBwcml2YXRlIF9nZXRPdmVybGF5UG9zaXRpb25TdHJhdGVneShcbiAgICBjb29yZGluYXRlczogQ29udGV4dE1lbnVDb29yZGluYXRlcyxcbiAgKTogRmxleGlibGVDb25uZWN0ZWRQb3NpdGlvblN0cmF0ZWd5IHtcbiAgICByZXR1cm4gdGhpcy5fb3ZlcmxheVxuICAgICAgLnBvc2l0aW9uKClcbiAgICAgIC5mbGV4aWJsZUNvbm5lY3RlZFRvKGNvb3JkaW5hdGVzKVxuICAgICAgLndpdGhMb2NrZWRQb3NpdGlvbigpXG4gICAgICAud2l0aEdyb3dBZnRlck9wZW4oKVxuICAgICAgLndpdGhQb3NpdGlvbnModGhpcy5tZW51UG9zaXRpb24gPz8gQ09OVEVYVF9NRU5VX1BPU0lUSU9OUyk7XG4gIH1cblxuICAvKiogU3Vic2NyaWJlIHRvIHRoZSBtZW51IHN0YWNrIGNsb3NlIGV2ZW50cyBhbmQgY2xvc2UgdGhpcyBtZW51IHdoZW4gcmVxdWVzdGVkLiAqL1xuICBwcml2YXRlIF9zZXRNZW51U3RhY2tDbG9zZUxpc3RlbmVyKCkge1xuICAgIHRoaXMubWVudVN0YWNrLmNsb3NlZC5waXBlKHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCkpLnN1YnNjcmliZSgoe2l0ZW19KSA9PiB7XG4gICAgICBpZiAoaXRlbSA9PT0gdGhpcy5jaGlsZE1lbnUgJiYgdGhpcy5pc09wZW4oKSkge1xuICAgICAgICB0aGlzLmNsb3NlZC5uZXh0KCk7XG4gICAgICAgIHRoaXMub3ZlcmxheVJlZiEuZGV0YWNoKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogU3Vic2NyaWJlIHRvIHRoZSBvdmVybGF5cyBvdXRzaWRlIHBvaW50ZXIgZXZlbnRzIHN0cmVhbSBhbmQgaGFuZGxlIGNsb3Npbmcgb3V0IHRoZSBzdGFjayBpZiBhXG4gICAqIGNsaWNrIG9jY3VycyBvdXRzaWRlIHRoZSBtZW51cy5cbiAgICogQHBhcmFtIGlnbm9yZUZpcnN0QXV4Q2xpY2sgV2hldGhlciB0byBpZ25vcmUgdGhlIGZpcnN0IGF1eGNsaWNrIGV2ZW50IG91dHNpZGUgdGhlIG1lbnUuXG4gICAqL1xuICBwcml2YXRlIF9zdWJzY3JpYmVUb091dHNpZGVDbGlja3MoaWdub3JlRmlyc3RBdXhDbGljazogYm9vbGVhbikge1xuICAgIGlmICh0aGlzLm92ZXJsYXlSZWYpIHtcbiAgICAgIGxldCBvdXRzaWRlQ2xpY2tzID0gdGhpcy5vdmVybGF5UmVmLm91dHNpZGVQb2ludGVyRXZlbnRzKCk7XG4gICAgICAvLyBJZiB0aGUgbWVudSB3YXMgdHJpZ2dlcmVkIGJ5IHRoZSBgY29udGV4dG1lbnVgIGV2ZW50LCBza2lwIHRoZSBmaXJzdCBgYXV4Y2xpY2tgIGV2ZW50XG4gICAgICAvLyBiZWNhdXNlIGl0IGZpcmVzIHdoZW4gdGhlIG1vdXNlIGlzIHJlbGVhc2VkIG9uIHRoZSBzYW1lIGNsaWNrIHRoYXQgb3BlbmVkIHRoZSBtZW51LlxuICAgICAgaWYgKGlnbm9yZUZpcnN0QXV4Q2xpY2spIHtcbiAgICAgICAgY29uc3QgW2F1eENsaWNrcywgbm9uQXV4Q2xpY2tzXSA9IHBhcnRpdGlvbihvdXRzaWRlQ2xpY2tzLCAoe3R5cGV9KSA9PiB0eXBlID09PSAnYXV4Y2xpY2snKTtcbiAgICAgICAgb3V0c2lkZUNsaWNrcyA9IG1lcmdlKG5vbkF1eENsaWNrcywgYXV4Q2xpY2tzLnBpcGUoc2tpcCgxKSkpO1xuICAgICAgfVxuICAgICAgb3V0c2lkZUNsaWNrcy5waXBlKHRha2VVbnRpbCh0aGlzLnN0b3BPdXRzaWRlQ2xpY2tzTGlzdGVuZXIpKS5zdWJzY3JpYmUoZXZlbnQgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuaXNFbGVtZW50SW5zaWRlTWVudVN0YWNrKF9nZXRFdmVudFRhcmdldChldmVudCkhKSkge1xuICAgICAgICAgIHRoaXMubWVudVN0YWNrLmNsb3NlQWxsKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBPcGVuIHRoZSBhdHRhY2hlZCBtZW51IGF0IHRoZSBzcGVjaWZpZWQgbG9jYXRpb24uXG4gICAqIEBwYXJhbSBjb29yZGluYXRlcyB3aGVyZSB0byBvcGVuIHRoZSBjb250ZXh0IG1lbnVcbiAgICogQHBhcmFtIGlnbm9yZUZpcnN0T3V0c2lkZUF1eENsaWNrIFdoZXRoZXIgdG8gaWdub3JlIHRoZSBmaXJzdCBhdXhjbGljayBvdXRzaWRlIHRoZSBtZW51IGFmdGVyIG9wZW5pbmcuXG4gICAqL1xuICBwcml2YXRlIF9vcGVuKGNvb3JkaW5hdGVzOiBDb250ZXh0TWVudUNvb3JkaW5hdGVzLCBpZ25vcmVGaXJzdE91dHNpZGVBdXhDbGljazogYm9vbGVhbikge1xuICAgIGlmICh0aGlzLmRpc2FibGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0aGlzLmlzT3BlbigpKSB7XG4gICAgICAvLyBzaW5jZSB3ZSdyZSBtb3ZpbmcgdGhpcyBtZW51IHdlIG5lZWQgdG8gY2xvc2UgYW55IHN1Ym1lbnVzIGZpcnN0IG90aGVyd2lzZSB0aGV5IGVuZCB1cFxuICAgICAgLy8gZGlzY29ubmVjdGVkIGZyb20gdGhpcyBvbmUuXG4gICAgICB0aGlzLm1lbnVTdGFjay5jbG9zZVN1Yk1lbnVPZih0aGlzLmNoaWxkTWVudSEpO1xuXG4gICAgICAoXG4gICAgICAgIHRoaXMub3ZlcmxheVJlZiEuZ2V0Q29uZmlnKCkucG9zaXRpb25TdHJhdGVneSBhcyBGbGV4aWJsZUNvbm5lY3RlZFBvc2l0aW9uU3RyYXRlZ3lcbiAgICAgICkuc2V0T3JpZ2luKGNvb3JkaW5hdGVzKTtcbiAgICAgIHRoaXMub3ZlcmxheVJlZiEudXBkYXRlUG9zaXRpb24oKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5vcGVuZWQubmV4dCgpO1xuXG4gICAgICBpZiAodGhpcy5vdmVybGF5UmVmKSB7XG4gICAgICAgIChcbiAgICAgICAgICB0aGlzLm92ZXJsYXlSZWYuZ2V0Q29uZmlnKCkucG9zaXRpb25TdHJhdGVneSBhcyBGbGV4aWJsZUNvbm5lY3RlZFBvc2l0aW9uU3RyYXRlZ3lcbiAgICAgICAgKS5zZXRPcmlnaW4oY29vcmRpbmF0ZXMpO1xuICAgICAgICB0aGlzLm92ZXJsYXlSZWYudXBkYXRlUG9zaXRpb24oKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMub3ZlcmxheVJlZiA9IHRoaXMuX292ZXJsYXkuY3JlYXRlKHRoaXMuX2dldE92ZXJsYXlDb25maWcoY29vcmRpbmF0ZXMpKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5vdmVybGF5UmVmLmF0dGFjaCh0aGlzLmdldE1lbnVDb250ZW50UG9ydGFsKCkpO1xuICAgICAgdGhpcy5fc3Vic2NyaWJlVG9PdXRzaWRlQ2xpY2tzKGlnbm9yZUZpcnN0T3V0c2lkZUF1eENsaWNrKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==