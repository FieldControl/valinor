/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { booleanAttribute, Directive, inject, Injectable, Input } from '@angular/core';
import { Directionality } from '@angular/cdk/bidi';
import { Overlay, OverlayConfig, STANDARD_DROPDOWN_BELOW_POSITIONS, } from '@angular/cdk/overlay';
import { _getEventTarget } from '@angular/cdk/platform';
import { merge, partition } from 'rxjs';
import { skip, takeUntil, skipWhile } from 'rxjs/operators';
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.2.0", ngImport: i0, type: ContextMenuTracker, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "17.2.0", ngImport: i0, type: ContextMenuTracker, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.2.0", ngImport: i0, type: ContextMenuTracker, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });
/**
 * A directive that opens a menu when a user right-clicks within its host element.
 * It is aware of nested context menus and will trigger only the lowest level non-disabled context menu.
 */
export class CdkContextMenuTrigger extends CdkMenuTriggerBase {
    constructor() {
        super();
        /** The CDK overlay service. */
        this._overlay = inject(Overlay);
        /** The directionality of the page. */
        this._directionality = inject(Directionality, { optional: true });
        /** The app's context menu tracking registry */
        this._contextMenuTracker = inject(ContextMenuTracker);
        /** Whether the context menu is disabled. */
        this.disabled = false;
        this._setMenuStackCloseListener();
    }
    /**
     * Open the attached menu at the specified location.
     * @param coordinates where to open the context menu
     */
    open(coordinates) {
        this._open(null, coordinates);
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
            this._open(event, { x: event.clientX, y: event.clientY });
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
     * @param userEvent User-generated event that opened the menu.
     */
    _subscribeToOutsideClicks(userEvent) {
        if (this.overlayRef) {
            let outsideClicks = this.overlayRef.outsidePointerEvents();
            if (userEvent) {
                const [auxClicks, nonAuxClicks] = partition(outsideClicks, ({ type }) => type === 'auxclick');
                outsideClicks = merge(
                // Using a mouse, the `contextmenu` event can fire either when pressing the right button
                // or left button + control. Most browsers won't dispatch a `click` event right after
                // a `contextmenu` event triggered by left button + control, but Safari will (see #27832).
                // This closes the menu immediately. To work around it, we check that both the triggering
                // event and the current outside click event both had the control key pressed, and that
                // that this is the first outside click event.
                nonAuxClicks.pipe(skipWhile((event, index) => userEvent.ctrlKey && index === 0 && event.ctrlKey)), 
                // If the menu was triggered by the `contextmenu` event, skip the first `auxclick` event
                // because it fires when the mouse is released on the same click that opened the menu.
                auxClicks.pipe(skip(1)));
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
     * @param userEvent User-generated event that opened the menu
     * @param coordinates where to open the context menu
     */
    _open(userEvent, coordinates) {
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
            this._subscribeToOutsideClicks(userEvent);
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.2.0", ngImport: i0, type: CdkContextMenuTrigger, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "17.2.0", type: CdkContextMenuTrigger, isStandalone: true, selector: "[cdkContextMenuTriggerFor]", inputs: { menuTemplateRef: ["cdkContextMenuTriggerFor", "menuTemplateRef"], menuPosition: ["cdkContextMenuPosition", "menuPosition"], menuData: ["cdkContextMenuTriggerData", "menuData"], disabled: ["cdkContextMenuDisabled", "disabled", booleanAttribute] }, outputs: { opened: "cdkContextMenuOpened", closed: "cdkContextMenuClosed" }, host: { listeners: { "contextmenu": "_openOnContextMenu($event)" }, properties: { "attr.data-cdk-menu-stack-id": "null" } }, providers: [
            { provide: MENU_TRIGGER, useExisting: CdkContextMenuTrigger },
            { provide: MENU_STACK, useClass: MenuStack },
        ], exportAs: ["cdkContextMenuTriggerFor"], usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.2.0", ngImport: i0, type: CdkContextMenuTrigger, decorators: [{
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
                        { name: 'menuTemplateRef', alias: 'cdkContextMenuTriggerFor' },
                        { name: 'menuPosition', alias: 'cdkContextMenuPosition' },
                        { name: 'menuData', alias: 'cdkContextMenuTriggerData' },
                    ],
                    outputs: ['opened: cdkContextMenuOpened', 'closed: cdkContextMenuClosed'],
                    providers: [
                        { provide: MENU_TRIGGER, useExisting: CdkContextMenuTrigger },
                        { provide: MENU_STACK, useClass: MenuStack },
                    ],
                }]
        }], ctorParameters: () => [], propDecorators: { disabled: [{
                type: Input,
                args: [{ alias: 'cdkContextMenuDisabled', transform: booleanAttribute }]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dC1tZW51LXRyaWdnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL21lbnUvY29udGV4dC1tZW51LXRyaWdnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGdCQUFnQixFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBWSxNQUFNLGVBQWUsQ0FBQztBQUNoRyxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDakQsT0FBTyxFQUVMLE9BQU8sRUFDUCxhQUFhLEVBQ2IsaUNBQWlDLEdBQ2xDLE1BQU0sc0JBQXNCLENBQUM7QUFDOUIsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQ3RELE9BQU8sRUFBQyxLQUFLLEVBQUUsU0FBUyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQ3RDLE9BQU8sRUFBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQzFELE9BQU8sRUFBQyxVQUFVLEVBQUUsU0FBUyxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBQ25ELE9BQU8sRUFBQyxrQkFBa0IsRUFBRSxZQUFZLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQzs7QUFFckUseURBQXlEO0FBQ3pELE1BQU0sc0JBQXNCLEdBQUcsaUNBQWlDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFO0lBQzlFLDZGQUE2RjtJQUM3Rix5RkFBeUY7SUFDekYsTUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLFFBQVEsS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdkQsTUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLFFBQVEsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMs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LDBCQUEwQixFQUFDO3dCQUM1RCxFQUFDLElBQUksRUFBRSxjQUFjLEVBQUUsS0FBSyxFQUFFLHdCQUF3QixFQUFDO3dCQUN2RCxFQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLDJCQUEyQixFQUFDO3FCQUN2RDtvQkFDRCxPQUFPLEVBQUUsQ0FBQyw4QkFBOEIsRUFBRSw4QkFBOEIsQ0FBQztvQkFDekUsU0FBUyxFQUFFO3dCQUNULEVBQUMsT0FBTyxFQUFFLFlBQVksRUFBRSxXQUFXLHVCQUF1QixFQUFDO3dCQUMzRCxFQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBQztxQkFDM0M7aUJBQ0Y7d0RBWXdFLFFBQVE7c0JBQTlFLEtBQUs7dUJBQUMsRUFBQyxLQUFLLEVBQUUsd0JBQXdCLEVBQUUsU0FBUyxFQUFFLGdCQUFnQixFQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Ym9vbGVhbkF0dHJpYnV0ZSwgRGlyZWN0aXZlLCBpbmplY3QsIEluamVjdGFibGUsIElucHV0LCBPbkRlc3Ryb3l9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtEaXJlY3Rpb25hbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHtcbiAgRmxleGlibGVDb25uZWN0ZWRQb3NpdGlvblN0cmF0ZWd5LFxuICBPdmVybGF5LFxuICBPdmVybGF5Q29uZmlnLFxuICBTVEFOREFSRF9EUk9QRE9XTl9CRUxPV19QT1NJVElPTlMsXG59IGZyb20gJ0Bhbmd1bGFyL2Nkay9vdmVybGF5JztcbmltcG9ydCB7X2dldEV2ZW50VGFyZ2V0fSBmcm9tICdAYW5ndWxhci9jZGsvcGxhdGZvcm0nO1xuaW1wb3J0IHttZXJnZSwgcGFydGl0aW9ufSBmcm9tICdyeGpzJztcbmltcG9ydCB7c2tpcCwgdGFrZVVudGlsLCBza2lwV2hpbGV9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7TUVOVV9TVEFDSywgTWVudVN0YWNrfSBmcm9tICcuL21lbnUtc3RhY2snO1xuaW1wb3J0IHtDZGtNZW51VHJpZ2dlckJhc2UsIE1FTlVfVFJJR0dFUn0gZnJvbSAnLi9tZW51LXRyaWdnZXItYmFzZSc7XG5cbi8qKiBUaGUgcHJlZmVycmVkIG1lbnUgcG9zaXRpb25zIGZvciB0aGUgY29udGV4dCBtZW51LiAqL1xuY29uc3QgQ09OVEVYVF9NRU5VX1BPU0lUSU9OUyA9IFNUQU5EQVJEX0RST1BET1dOX0JFTE9XX1BPU0lUSU9OUy5tYXAocG9zaXRpb24gPT4ge1xuICAvLyBJbiBjYXNlcyB3aGVyZSB0aGUgZmlyc3QgbWVudSBpdGVtIGluIHRoZSBjb250ZXh0IG1lbnUgaXMgYSB0cmlnZ2VyIHRoZSBzdWJtZW51IG9wZW5zIG9uIGFcbiAgLy8gaG92ZXIgZXZlbnQuIFdlIG9mZnNldCB0aGUgY29udGV4dCBtZW51IDJweCBieSBkZWZhdWx0IHRvIHByZXZlbnQgdGhpcyBmcm9tIG9jY3VycmluZy5cbiAgY29uc3Qgb2Zmc2V0WCA9IHBvc2l0aW9uLm92ZXJsYXlYID09PSAnc3RhcnQnID8gMiA6IC0yO1xuICBjb25zdCBvZmZzZXRZID0gcG9zaXRpb24ub3ZlcmxheVkgPT09ICd0b3AnID8gMiA6IC0yO1xuICByZXR1cm4gey4uLnBvc2l0aW9uLCBvZmZzZXRYLCBvZmZzZXRZfTtcbn0pO1xuXG4vKiogVHJhY2tzIHRoZSBsYXN0IG9wZW4gY29udGV4dCBtZW51IHRyaWdnZXIgYWNyb3NzIHRoZSBlbnRpcmUgYXBwbGljYXRpb24uICovXG5ASW5qZWN0YWJsZSh7cHJvdmlkZWRJbjogJ3Jvb3QnfSlcbmV4cG9ydCBjbGFzcyBDb250ZXh0TWVudVRyYWNrZXIge1xuICAvKiogVGhlIGxhc3Qgb3BlbiBjb250ZXh0IG1lbnUgdHJpZ2dlci4gKi9cbiAgcHJpdmF0ZSBzdGF0aWMgX29wZW5Db250ZXh0TWVudVRyaWdnZXI/OiBDZGtDb250ZXh0TWVudVRyaWdnZXI7XG5cbiAgLyoqXG4gICAqIENsb3NlIHRoZSBwcmV2aW91cyBvcGVuIGNvbnRleHQgbWVudSBhbmQgc2V0IHRoZSBnaXZlbiBvbmUgYXMgYmVpbmcgb3Blbi5cbiAgICogQHBhcmFtIHRyaWdnZXIgVGhlIHRyaWdnZXIgZm9yIHRoZSBjdXJyZW50bHkgb3BlbiBDb250ZXh0IE1lbnUuXG4gICAqL1xuICB1cGRhdGUodHJpZ2dlcjogQ2RrQ29udGV4dE1lbnVUcmlnZ2VyKSB7XG4gICAgaWYgKENvbnRleHRNZW51VHJhY2tlci5fb3BlbkNvbnRleHRNZW51VHJpZ2dlciAhPT0gdHJpZ2dlcikge1xuICAgICAgQ29udGV4dE1lbnVUcmFja2VyLl9vcGVuQ29udGV4dE1lbnVUcmlnZ2VyPy5jbG9zZSgpO1xuICAgICAgQ29udGV4dE1lbnVUcmFja2VyLl9vcGVuQ29udGV4dE1lbnVUcmlnZ2VyID0gdHJpZ2dlcjtcbiAgICB9XG4gIH1cbn1cblxuLyoqIFRoZSBjb29yZGluYXRlcyB3aGVyZSB0aGUgY29udGV4dCBtZW51IHNob3VsZCBvcGVuLiAqL1xuZXhwb3J0IHR5cGUgQ29udGV4dE1lbnVDb29yZGluYXRlcyA9IHt4OiBudW1iZXI7IHk6IG51bWJlcn07XG5cbi8qKlxuICogQSBkaXJlY3RpdmUgdGhhdCBvcGVucyBhIG1lbnUgd2hlbiBhIHVzZXIgcmlnaHQtY2xpY2tzIHdpdGhpbiBpdHMgaG9zdCBlbGVtZW50LlxuICogSXQgaXMgYXdhcmUgb2YgbmVzdGVkIGNvbnRleHQgbWVudXMgYW5kIHdpbGwgdHJpZ2dlciBvbmx5IHRoZSBsb3dlc3QgbGV2ZWwgbm9uLWRpc2FibGVkIGNvbnRleHQgbWVudS5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka0NvbnRleHRNZW51VHJpZ2dlckZvcl0nLFxuICBleHBvcnRBczogJ2Nka0NvbnRleHRNZW51VHJpZ2dlckZvcicsXG4gIHN0YW5kYWxvbmU6IHRydWUsXG4gIGhvc3Q6IHtcbiAgICAnW2F0dHIuZGF0YS1jZGstbWVudS1zdGFjay1pZF0nOiAnbnVsbCcsXG4gICAgJyhjb250ZXh0bWVudSknOiAnX29wZW5PbkNvbnRleHRNZW51KCRldmVudCknLFxuICB9LFxuICBpbnB1dHM6IFtcbiAgICB7bmFtZTogJ21lbnVUZW1wbGF0ZVJlZicsIGFsaWFzOiAnY2RrQ29udGV4dE1lbnVUcmlnZ2VyRm9yJ30sXG4gICAge25hbWU6ICdtZW51UG9zaXRpb24nLCBhbGlhczogJ2Nka0NvbnRleHRNZW51UG9zaXRpb24nfSxcbiAgICB7bmFtZTogJ21lbnVEYXRhJywgYWxpYXM6ICdjZGtDb250ZXh0TWVudVRyaWdnZXJEYXRhJ30sXG4gIF0sXG4gIG91dHB1dHM6IFsnb3BlbmVkOiBjZGtDb250ZXh0TWVudU9wZW5lZCcsICdjbG9zZWQ6IGNka0NvbnRleHRNZW51Q2xvc2VkJ10sXG4gIHByb3ZpZGVyczogW1xuICAgIHtwcm92aWRlOiBNRU5VX1RSSUdHRVIsIHVzZUV4aXN0aW5nOiBDZGtDb250ZXh0TWVudVRyaWdnZXJ9LFxuICAgIHtwcm92aWRlOiBNRU5VX1NUQUNLLCB1c2VDbGFzczogTWVudVN0YWNrfSxcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrQ29udGV4dE1lbnVUcmlnZ2VyIGV4dGVuZHMgQ2RrTWVudVRyaWdnZXJCYXNlIGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgLyoqIFRoZSBDREsgb3ZlcmxheSBzZXJ2aWNlLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9vdmVybGF5ID0gaW5qZWN0KE92ZXJsYXkpO1xuXG4gIC8qKiBUaGUgZGlyZWN0aW9uYWxpdHkgb2YgdGhlIHBhZ2UuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX2RpcmVjdGlvbmFsaXR5ID0gaW5qZWN0KERpcmVjdGlvbmFsaXR5LCB7b3B0aW9uYWw6IHRydWV9KTtcblxuICAvKiogVGhlIGFwcCdzIGNvbnRleHQgbWVudSB0cmFja2luZyByZWdpc3RyeSAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9jb250ZXh0TWVudVRyYWNrZXIgPSBpbmplY3QoQ29udGV4dE1lbnVUcmFja2VyKTtcblxuICAvKiogV2hldGhlciB0aGUgY29udGV4dCBtZW51IGlzIGRpc2FibGVkLiAqL1xuICBASW5wdXQoe2FsaWFzOiAnY2RrQ29udGV4dE1lbnVEaXNhYmxlZCcsIHRyYW5zZm9ybTogYm9vbGVhbkF0dHJpYnV0ZX0pIGRpc2FibGVkOiBib29sZWFuID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLl9zZXRNZW51U3RhY2tDbG9zZUxpc3RlbmVyKCk7XG4gIH1cblxuICAvKipcbiAgICogT3BlbiB0aGUgYXR0YWNoZWQgbWVudSBhdCB0aGUgc3BlY2lmaWVkIGxvY2F0aW9uLlxuICAgKiBAcGFyYW0gY29vcmRpbmF0ZXMgd2hlcmUgdG8gb3BlbiB0aGUgY29udGV4dCBtZW51XG4gICAqL1xuICBvcGVuKGNvb3JkaW5hdGVzOiBDb250ZXh0TWVudUNvb3JkaW5hdGVzKSB7XG4gICAgdGhpcy5fb3BlbihudWxsLCBjb29yZGluYXRlcyk7XG4gIH1cblxuICAvKiogQ2xvc2UgdGhlIGN1cnJlbnRseSBvcGVuZWQgY29udGV4dCBtZW51LiAqL1xuICBjbG9zZSgpIHtcbiAgICB0aGlzLm1lbnVTdGFjay5jbG9zZUFsbCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIE9wZW4gdGhlIGNvbnRleHQgbWVudSBhbmQgY2xvc2VzIGFueSBwcmV2aW91c2x5IG9wZW4gbWVudXMuXG4gICAqIEBwYXJhbSBldmVudCB0aGUgbW91c2UgZXZlbnQgd2hpY2ggb3BlbnMgdGhlIGNvbnRleHQgbWVudS5cbiAgICovXG4gIF9vcGVuT25Db250ZXh0TWVudShldmVudDogTW91c2VFdmVudCkge1xuICAgIGlmICghdGhpcy5kaXNhYmxlZCkge1xuICAgICAgLy8gUHJldmVudCB0aGUgbmF0aXZlIGNvbnRleHQgbWVudSBmcm9tIG9wZW5pbmcgYmVjYXVzZSB3ZSdyZSBvcGVuaW5nIGEgY3VzdG9tIG9uZS5cbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgIC8vIFN0b3AgZXZlbnQgcHJvcGFnYXRpb24gdG8gZW5zdXJlIHRoYXQgb25seSB0aGUgY2xvc2VzdCBlbmFibGVkIGNvbnRleHQgbWVudSBvcGVucy5cbiAgICAgIC8vIE90aGVyd2lzZSwgYW55IGNvbnRleHQgbWVudXMgYXR0YWNoZWQgdG8gY29udGFpbmluZyBlbGVtZW50cyB3b3VsZCAqYWxzbyogb3BlbixcbiAgICAgIC8vIHJlc3VsdGluZyBpbiBtdWx0aXBsZSBzdGFja2VkIGNvbnRleHQgbWVudXMgYmVpbmcgZGlzcGxheWVkLlxuICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgIHRoaXMuX2NvbnRleHRNZW51VHJhY2tlci51cGRhdGUodGhpcyk7XG4gICAgICB0aGlzLl9vcGVuKGV2ZW50LCB7eDogZXZlbnQuY2xpZW50WCwgeTogZXZlbnQuY2xpZW50WX0pO1xuXG4gICAgICAvLyBBIGNvbnRleHQgbWVudSBjYW4gYmUgdHJpZ2dlcmVkIHZpYSBhIG1vdXNlIHJpZ2h0IGNsaWNrIG9yIGEga2V5Ym9hcmQgc2hvcnRjdXQuXG4gICAgICBpZiAoZXZlbnQuYnV0dG9uID09PSAyKSB7XG4gICAgICAgIHRoaXMuY2hpbGRNZW51Py5mb2N1c0ZpcnN0SXRlbSgnbW91c2UnKTtcbiAgICAgIH0gZWxzZSBpZiAoZXZlbnQuYnV0dG9uID09PSAwKSB7XG4gICAgICAgIHRoaXMuY2hpbGRNZW51Py5mb2N1c0ZpcnN0SXRlbSgna2V5Ym9hcmQnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuY2hpbGRNZW51Py5mb2N1c0ZpcnN0SXRlbSgncHJvZ3JhbScpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGNvbmZpZ3VyYXRpb24gb2JqZWN0IHVzZWQgdG8gY3JlYXRlIHRoZSBvdmVybGF5LlxuICAgKiBAcGFyYW0gY29vcmRpbmF0ZXMgdGhlIGxvY2F0aW9uIHRvIHBsYWNlIHRoZSBvcGVuZWQgbWVudVxuICAgKi9cbiAgcHJpdmF0ZSBfZ2V0T3ZlcmxheUNvbmZpZyhjb29yZGluYXRlczogQ29udGV4dE1lbnVDb29yZGluYXRlcykge1xuICAgIHJldHVybiBuZXcgT3ZlcmxheUNvbmZpZyh7XG4gICAgICBwb3NpdGlvblN0cmF0ZWd5OiB0aGlzLl9nZXRPdmVybGF5UG9zaXRpb25TdHJhdGVneShjb29yZGluYXRlcyksXG4gICAgICBzY3JvbGxTdHJhdGVneTogdGhpcy5fb3ZlcmxheS5zY3JvbGxTdHJhdGVnaWVzLnJlcG9zaXRpb24oKSxcbiAgICAgIGRpcmVjdGlvbjogdGhpcy5fZGlyZWN0aW9uYWxpdHkgfHwgdW5kZWZpbmVkLFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgcG9zaXRpb24gc3RyYXRlZ3kgZm9yIHRoZSBvdmVybGF5IHdoaWNoIHNwZWNpZmllcyB3aGVyZSB0byBwbGFjZSB0aGUgbWVudS5cbiAgICogQHBhcmFtIGNvb3JkaW5hdGVzIHRoZSBsb2NhdGlvbiB0byBwbGFjZSB0aGUgb3BlbmVkIG1lbnVcbiAgICovXG4gIHByaXZhdGUgX2dldE92ZXJsYXlQb3NpdGlvblN0cmF0ZWd5KFxuICAgIGNvb3JkaW5hdGVzOiBDb250ZXh0TWVudUNvb3JkaW5hdGVzLFxuICApOiBGbGV4aWJsZUNvbm5lY3RlZFBvc2l0aW9uU3RyYXRlZ3kge1xuICAgIHJldHVybiB0aGlzLl9vdmVybGF5XG4gICAgICAucG9zaXRpb24oKVxuICAgICAgLmZsZXhpYmxlQ29ubmVjdGVkVG8oY29vcmRpbmF0ZXMpXG4gICAgICAud2l0aExvY2tlZFBvc2l0aW9uKClcbiAgICAgIC53aXRoR3Jvd0FmdGVyT3BlbigpXG4gICAgICAud2l0aFBvc2l0aW9ucyh0aGlzLm1lbnVQb3NpdGlvbiA/PyBDT05URVhUX01FTlVfUE9TSVRJT05TKTtcbiAgfVxuXG4gIC8qKiBTdWJzY3JpYmUgdG8gdGhlIG1lbnUgc3RhY2sgY2xvc2UgZXZlbnRzIGFuZCBjbG9zZSB0aGlzIG1lbnUgd2hlbiByZXF1ZXN0ZWQuICovXG4gIHByaXZhdGUgX3NldE1lbnVTdGFja0Nsb3NlTGlzdGVuZXIoKSB7XG4gICAgdGhpcy5tZW51U3RhY2suY2xvc2VkLnBpcGUodGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSkuc3Vic2NyaWJlKCh7aXRlbX0pID0+IHtcbiAgICAgIGlmIChpdGVtID09PSB0aGlzLmNoaWxkTWVudSAmJiB0aGlzLmlzT3BlbigpKSB7XG4gICAgICAgIHRoaXMuY2xvc2VkLm5leHQoKTtcbiAgICAgICAgdGhpcy5vdmVybGF5UmVmIS5kZXRhY2goKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdWJzY3JpYmUgdG8gdGhlIG92ZXJsYXlzIG91dHNpZGUgcG9pbnRlciBldmVudHMgc3RyZWFtIGFuZCBoYW5kbGUgY2xvc2luZyBvdXQgdGhlIHN0YWNrIGlmIGFcbiAgICogY2xpY2sgb2NjdXJzIG91dHNpZGUgdGhlIG1lbnVzLlxuICAgKiBAcGFyYW0gdXNlckV2ZW50IFVzZXItZ2VuZXJhdGVkIGV2ZW50IHRoYXQgb3BlbmVkIHRoZSBtZW51LlxuICAgKi9cbiAgcHJpdmF0ZSBfc3Vic2NyaWJlVG9PdXRzaWRlQ2xpY2tzKHVzZXJFdmVudDogTW91c2VFdmVudCB8IG51bGwpIHtcbiAgICBpZiAodGhpcy5vdmVybGF5UmVmKSB7XG4gICAgICBsZXQgb3V0c2lkZUNsaWNrcyA9IHRoaXMub3ZlcmxheVJlZi5vdXRzaWRlUG9pbnRlckV2ZW50cygpO1xuXG4gICAgICBpZiAodXNlckV2ZW50KSB7XG4gICAgICAgIGNvbnN0IFthdXhDbGlja3MsIG5vbkF1eENsaWNrc10gPSBwYXJ0aXRpb24ob3V0c2lkZUNsaWNrcywgKHt0eXBlfSkgPT4gdHlwZSA9PT0gJ2F1eGNsaWNrJyk7XG4gICAgICAgIG91dHNpZGVDbGlja3MgPSBtZXJnZShcbiAgICAgICAgICAvLyBVc2luZyBhIG1vdXNlLCB0aGUgYGNvbnRleHRtZW51YCBldmVudCBjYW4gZmlyZSBlaXRoZXIgd2hlbiBwcmVzc2luZyB0aGUgcmlnaHQgYnV0dG9uXG4gICAgICAgICAgLy8gb3IgbGVmdCBidXR0b24gKyBjb250cm9sLiBNb3N0IGJyb3dzZXJzIHdvbid0IGRpc3BhdGNoIGEgYGNsaWNrYCBldmVudCByaWdodCBhZnRlclxuICAgICAgICAgIC8vIGEgYGNvbnRleHRtZW51YCBldmVudCB0cmlnZ2VyZWQgYnkgbGVmdCBidXR0b24gKyBjb250cm9sLCBidXQgU2FmYXJpIHdpbGwgKHNlZSAjMjc4MzIpLlxuICAgICAgICAgIC8vIFRoaXMgY2xvc2VzIHRoZSBtZW51IGltbWVkaWF0ZWx5LiBUbyB3b3JrIGFyb3VuZCBpdCwgd2UgY2hlY2sgdGhhdCBib3RoIHRoZSB0cmlnZ2VyaW5nXG4gICAgICAgICAgLy8gZXZlbnQgYW5kIHRoZSBjdXJyZW50IG91dHNpZGUgY2xpY2sgZXZlbnQgYm90aCBoYWQgdGhlIGNvbnRyb2wga2V5IHByZXNzZWQsIGFuZCB0aGF0XG4gICAgICAgICAgLy8gdGhhdCB0aGlzIGlzIHRoZSBmaXJzdCBvdXRzaWRlIGNsaWNrIGV2ZW50LlxuICAgICAgICAgIG5vbkF1eENsaWNrcy5waXBlKFxuICAgICAgICAgICAgc2tpcFdoaWxlKChldmVudCwgaW5kZXgpID0+IHVzZXJFdmVudC5jdHJsS2V5ICYmIGluZGV4ID09PSAwICYmIGV2ZW50LmN0cmxLZXkpLFxuICAgICAgICAgICksXG5cbiAgICAgICAgICAvLyBJZiB0aGUgbWVudSB3YXMgdHJpZ2dlcmVkIGJ5IHRoZSBgY29udGV4dG1lbnVgIGV2ZW50LCBza2lwIHRoZSBmaXJzdCBgYXV4Y2xpY2tgIGV2ZW50XG4gICAgICAgICAgLy8gYmVjYXVzZSBpdCBmaXJlcyB3aGVuIHRoZSBtb3VzZSBpcyByZWxlYXNlZCBvbiB0aGUgc2FtZSBjbGljayB0aGF0IG9wZW5lZCB0aGUgbWVudS5cbiAgICAgICAgICBhdXhDbGlja3MucGlwZShza2lwKDEpKSxcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgb3V0c2lkZUNsaWNrcy5waXBlKHRha2VVbnRpbCh0aGlzLnN0b3BPdXRzaWRlQ2xpY2tzTGlzdGVuZXIpKS5zdWJzY3JpYmUoZXZlbnQgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuaXNFbGVtZW50SW5zaWRlTWVudVN0YWNrKF9nZXRFdmVudFRhcmdldChldmVudCkhKSkge1xuICAgICAgICAgIHRoaXMubWVudVN0YWNrLmNsb3NlQWxsKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBPcGVuIHRoZSBhdHRhY2hlZCBtZW51IGF0IHRoZSBzcGVjaWZpZWQgbG9jYXRpb24uXG4gICAqIEBwYXJhbSB1c2VyRXZlbnQgVXNlci1nZW5lcmF0ZWQgZXZlbnQgdGhhdCBvcGVuZWQgdGhlIG1lbnVcbiAgICogQHBhcmFtIGNvb3JkaW5hdGVzIHdoZXJlIHRvIG9wZW4gdGhlIGNvbnRleHQgbWVudVxuICAgKi9cbiAgcHJpdmF0ZSBfb3Blbih1c2VyRXZlbnQ6IE1vdXNlRXZlbnQgfCBudWxsLCBjb29yZGluYXRlczogQ29udGV4dE1lbnVDb29yZGluYXRlcykge1xuICAgIGlmICh0aGlzLmRpc2FibGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0aGlzLmlzT3BlbigpKSB7XG4gICAgICAvLyBzaW5jZSB3ZSdyZSBtb3ZpbmcgdGhpcyBtZW51IHdlIG5lZWQgdG8gY2xvc2UgYW55IHN1Ym1lbnVzIGZpcnN0IG90aGVyd2lzZSB0aGV5IGVuZCB1cFxuICAgICAgLy8gZGlzY29ubmVjdGVkIGZyb20gdGhpcyBvbmUuXG4gICAgICB0aGlzLm1lbnVTdGFjay5jbG9zZVN1Yk1lbnVPZih0aGlzLmNoaWxkTWVudSEpO1xuXG4gICAgICAoXG4gICAgICAgIHRoaXMub3ZlcmxheVJlZiEuZ2V0Q29uZmlnKCkucG9zaXRpb25TdHJhdGVneSBhcyBGbGV4aWJsZUNvbm5lY3RlZFBvc2l0aW9uU3RyYXRlZ3lcbiAgICAgICkuc2V0T3JpZ2luKGNvb3JkaW5hdGVzKTtcbiAgICAgIHRoaXMub3ZlcmxheVJlZiEudXBkYXRlUG9zaXRpb24oKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5vcGVuZWQubmV4dCgpO1xuXG4gICAgICBpZiAodGhpcy5vdmVybGF5UmVmKSB7XG4gICAgICAgIChcbiAgICAgICAgICB0aGlzLm92ZXJsYXlSZWYuZ2V0Q29uZmlnKCkucG9zaXRpb25TdHJhdGVneSBhcyBGbGV4aWJsZUNvbm5lY3RlZFBvc2l0aW9uU3RyYXRlZ3lcbiAgICAgICAgKS5zZXRPcmlnaW4oY29vcmRpbmF0ZXMpO1xuICAgICAgICB0aGlzLm92ZXJsYXlSZWYudXBkYXRlUG9zaXRpb24oKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMub3ZlcmxheVJlZiA9IHRoaXMuX292ZXJsYXkuY3JlYXRlKHRoaXMuX2dldE92ZXJsYXlDb25maWcoY29vcmRpbmF0ZXMpKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5vdmVybGF5UmVmLmF0dGFjaCh0aGlzLmdldE1lbnVDb250ZW50UG9ydGFsKCkpO1xuICAgICAgdGhpcy5fc3Vic2NyaWJlVG9PdXRzaWRlQ2xpY2tzKHVzZXJFdmVudCk7XG4gICAgfVxuICB9XG59XG4iXX0=