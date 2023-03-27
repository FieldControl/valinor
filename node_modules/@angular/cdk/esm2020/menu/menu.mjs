/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, EventEmitter, inject, Output } from '@angular/core';
import { ESCAPE, hasModifierKey, LEFT_ARROW, RIGHT_ARROW, TAB } from '@angular/cdk/keycodes';
import { takeUntil } from 'rxjs/operators';
import { CdkMenuGroup } from './menu-group';
import { CDK_MENU } from './menu-interface';
import { PARENT_OR_NEW_INLINE_MENU_STACK_PROVIDER } from './menu-stack';
import { MENU_TRIGGER } from './menu-trigger-base';
import { CdkMenuBase } from './menu-base';
import * as i0 from "@angular/core";
/**
 * Directive which configures the element as a Menu which should contain child elements marked as
 * CdkMenuItem or CdkMenuGroup. Sets the appropriate role and aria-attributes for a menu and
 * contains accessible keyboard and mouse handling logic.
 *
 * It also acts as a RadioGroup for elements marked with role `menuitemradio`.
 */
export class CdkMenu extends CdkMenuBase {
    constructor() {
        super();
        this._parentTrigger = inject(MENU_TRIGGER, { optional: true });
        /** Event emitted when the menu is closed. */
        this.closed = new EventEmitter();
        /** The direction items in the menu flow. */
        this.orientation = 'vertical';
        /** Whether the menu is displayed inline (i.e. always present vs a conditional popup that the user triggers with a trigger element). */
        this.isInline = !this._parentTrigger;
        this.destroyed.subscribe(this.closed);
        this._parentTrigger?.registerChildMenu(this);
    }
    ngAfterContentInit() {
        super.ngAfterContentInit();
        this._subscribeToMenuStackEmptied();
    }
    ngOnDestroy() {
        super.ngOnDestroy();
        this.closed.complete();
    }
    /**
     * Handle keyboard events for the Menu.
     * @param event The keyboard event to be handled.
     */
    _handleKeyEvent(event) {
        const keyManager = this.keyManager;
        switch (event.keyCode) {
            case LEFT_ARROW:
            case RIGHT_ARROW:
                if (!hasModifierKey(event)) {
                    event.preventDefault();
                    keyManager.setFocusOrigin('keyboard');
                    keyManager.onKeydown(event);
                }
                break;
            case ESCAPE:
                if (!hasModifierKey(event)) {
                    event.preventDefault();
                    this.menuStack.close(this, {
                        focusNextOnEmpty: 2 /* FocusNext.currentItem */,
                        focusParentTrigger: true,
                    });
                }
                break;
            case TAB:
                if (!hasModifierKey(event, 'altKey', 'metaKey', 'ctrlKey')) {
                    this.menuStack.closeAll({ focusParentTrigger: true });
                }
                break;
            default:
                keyManager.onKeydown(event);
        }
    }
    /**
     * Set focus the either the current, previous or next item based on the FocusNext event.
     * @param focusNext The element to focus.
     */
    _toggleMenuFocus(focusNext) {
        const keyManager = this.keyManager;
        switch (focusNext) {
            case 0 /* FocusNext.nextItem */:
                keyManager.setFocusOrigin('keyboard');
                keyManager.setNextItemActive();
                break;
            case 1 /* FocusNext.previousItem */:
                keyManager.setFocusOrigin('keyboard');
                keyManager.setPreviousItemActive();
                break;
            case 2 /* FocusNext.currentItem */:
                if (keyManager.activeItem) {
                    keyManager.setFocusOrigin('keyboard');
                    keyManager.setActiveItem(keyManager.activeItem);
                }
                break;
        }
    }
    /** Subscribe to the MenuStack emptied events. */
    _subscribeToMenuStackEmptied() {
        this.menuStack.emptied
            .pipe(takeUntil(this.destroyed))
            .subscribe(event => this._toggleMenuFocus(event));
    }
}
CdkMenu.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: CdkMenu, deps: [], target: i0.ɵɵFactoryTarget.Directive });
CdkMenu.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "15.2.0-rc.0", type: CdkMenu, isStandalone: true, selector: "[cdkMenu]", outputs: { closed: "closed" }, host: { attributes: { "role": "menu" }, listeners: { "keydown": "_handleKeyEvent($event)" }, properties: { "class.cdk-menu-inline": "isInline" }, classAttribute: "cdk-menu" }, providers: [
        { provide: CdkMenuGroup, useExisting: CdkMenu },
        { provide: CDK_MENU, useExisting: CdkMenu },
        PARENT_OR_NEW_INLINE_MENU_STACK_PROVIDER('vertical'),
    ], exportAs: ["cdkMenu"], usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: CdkMenu, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkMenu]',
                    exportAs: 'cdkMenu',
                    standalone: true,
                    host: {
                        'role': 'menu',
                        'class': 'cdk-menu',
                        '[class.cdk-menu-inline]': 'isInline',
                        '(keydown)': '_handleKeyEvent($event)',
                    },
                    providers: [
                        { provide: CdkMenuGroup, useExisting: CdkMenu },
                        { provide: CDK_MENU, useExisting: CdkMenu },
                        PARENT_OR_NEW_INLINE_MENU_STACK_PROVIDER('vertical'),
                    ],
                }]
        }], ctorParameters: function () { return []; }, propDecorators: { closed: [{
                type: Output
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvbWVudS9tZW51LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBbUIsU0FBUyxFQUFFLFlBQVksRUFBRSxNQUFNLEVBQWEsTUFBTSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ25HLE9BQU8sRUFBQyxNQUFNLEVBQUUsY0FBYyxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsR0FBRyxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDM0YsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQ3pDLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFDMUMsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBQzFDLE9BQU8sRUFBWSx3Q0FBd0MsRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUNqRixPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDakQsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLGFBQWEsQ0FBQzs7QUFFeEM7Ozs7OztHQU1HO0FBaUJILE1BQU0sT0FBTyxPQUFRLFNBQVEsV0FBVztJQVl0QztRQUNFLEtBQUssRUFBRSxDQUFDO1FBWkYsbUJBQWMsR0FBRyxNQUFNLENBQUMsWUFBWSxFQUFFLEVBQUMsUUFBUSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7UUFFaEUsNkNBQTZDO1FBQzFCLFdBQU0sR0FBdUIsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUVuRSw0Q0FBNEM7UUFDMUIsZ0JBQVcsR0FBRyxVQUFVLENBQUM7UUFFM0MsdUlBQXVJO1FBQ3JILGFBQVEsR0FBRyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUM7UUFJaEQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3RD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QyxVQUFVLENBQUM7S0FDckQ7Z0dBRVUsT0FBTztrQkFoQm5CLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLFdBQVc7b0JBQ3JCLFFBQVEsRUFBRSxTQUFTO29CQUNuQixVQUFVLEVBQUUsSUFBSTtvQkFDaEIsSUFBSSxFQUFFO3dCQUNKLE1BQU0sRUFBRSxNQUFNO3dCQUNkLE9BQU8sRUFBRSxVQUFVO3dCQUNuQix5QkFBeUIsRUFBRSxVQUFVO3dCQUNyQyxXQUFXLEVBQUUseUJBQXlCO3FCQUN2QztvQkFDRCxTQUFTLEVBQUU7d0JBQ1QsRUFBQyxPQUFPLEVBQUUsWUFBWSxFQUFFLFdBQVcsU0FBUyxFQUFDO3dCQUM3QyxFQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsV0FBVyxTQUFTLEVBQUM7d0JBQ3pDLHdDQUF3QyxDQUFDLFVBQVUsQ0FBQztxQkFDckQ7aUJBQ0Y7MEVBS29CLE1BQU07c0JBQXhCLE1BQU0iLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtBZnRlckNvbnRlbnRJbml0LCBEaXJlY3RpdmUsIEV2ZW50RW1pdHRlciwgaW5qZWN0LCBPbkRlc3Ryb3ksIE91dHB1dH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0VTQ0FQRSwgaGFzTW9kaWZpZXJLZXksIExFRlRfQVJST1csIFJJR0hUX0FSUk9XLCBUQUJ9IGZyb20gJ0Bhbmd1bGFyL2Nkay9rZXljb2Rlcyc7XG5pbXBvcnQge3Rha2VVbnRpbH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHtDZGtNZW51R3JvdXB9IGZyb20gJy4vbWVudS1ncm91cCc7XG5pbXBvcnQge0NES19NRU5VfSBmcm9tICcuL21lbnUtaW50ZXJmYWNlJztcbmltcG9ydCB7Rm9jdXNOZXh0LCBQQVJFTlRfT1JfTkVXX0lOTElORV9NRU5VX1NUQUNLX1BST1ZJREVSfSBmcm9tICcuL21lbnUtc3RhY2snO1xuaW1wb3J0IHtNRU5VX1RSSUdHRVJ9IGZyb20gJy4vbWVudS10cmlnZ2VyLWJhc2UnO1xuaW1wb3J0IHtDZGtNZW51QmFzZX0gZnJvbSAnLi9tZW51LWJhc2UnO1xuXG4vKipcbiAqIERpcmVjdGl2ZSB3aGljaCBjb25maWd1cmVzIHRoZSBlbGVtZW50IGFzIGEgTWVudSB3aGljaCBzaG91bGQgY29udGFpbiBjaGlsZCBlbGVtZW50cyBtYXJrZWQgYXNcbiAqIENka01lbnVJdGVtIG9yIENka01lbnVHcm91cC4gU2V0cyB0aGUgYXBwcm9wcmlhdGUgcm9sZSBhbmQgYXJpYS1hdHRyaWJ1dGVzIGZvciBhIG1lbnUgYW5kXG4gKiBjb250YWlucyBhY2Nlc3NpYmxlIGtleWJvYXJkIGFuZCBtb3VzZSBoYW5kbGluZyBsb2dpYy5cbiAqXG4gKiBJdCBhbHNvIGFjdHMgYXMgYSBSYWRpb0dyb3VwIGZvciBlbGVtZW50cyBtYXJrZWQgd2l0aCByb2xlIGBtZW51aXRlbXJhZGlvYC5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka01lbnVdJyxcbiAgZXhwb3J0QXM6ICdjZGtNZW51JyxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbiAgaG9zdDoge1xuICAgICdyb2xlJzogJ21lbnUnLFxuICAgICdjbGFzcyc6ICdjZGstbWVudScsXG4gICAgJ1tjbGFzcy5jZGstbWVudS1pbmxpbmVdJzogJ2lzSW5saW5lJyxcbiAgICAnKGtleWRvd24pJzogJ19oYW5kbGVLZXlFdmVudCgkZXZlbnQpJyxcbiAgfSxcbiAgcHJvdmlkZXJzOiBbXG4gICAge3Byb3ZpZGU6IENka01lbnVHcm91cCwgdXNlRXhpc3Rpbmc6IENka01lbnV9LFxuICAgIHtwcm92aWRlOiBDREtfTUVOVSwgdXNlRXhpc3Rpbmc6IENka01lbnV9LFxuICAgIFBBUkVOVF9PUl9ORVdfSU5MSU5FX01FTlVfU1RBQ0tfUFJPVklERVIoJ3ZlcnRpY2FsJyksXG4gIF0sXG59KVxuZXhwb3J0IGNsYXNzIENka01lbnUgZXh0ZW5kcyBDZGtNZW51QmFzZSBpbXBsZW1lbnRzIEFmdGVyQ29udGVudEluaXQsIE9uRGVzdHJveSB7XG4gIHByaXZhdGUgX3BhcmVudFRyaWdnZXIgPSBpbmplY3QoTUVOVV9UUklHR0VSLCB7b3B0aW9uYWw6IHRydWV9KTtcblxuICAvKiogRXZlbnQgZW1pdHRlZCB3aGVuIHRoZSBtZW51IGlzIGNsb3NlZC4gKi9cbiAgQE91dHB1dCgpIHJlYWRvbmx5IGNsb3NlZDogRXZlbnRFbWl0dGVyPHZvaWQ+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gIC8qKiBUaGUgZGlyZWN0aW9uIGl0ZW1zIGluIHRoZSBtZW51IGZsb3cuICovXG4gIG92ZXJyaWRlIHJlYWRvbmx5IG9yaWVudGF0aW9uID0gJ3ZlcnRpY2FsJztcblxuICAvKiogV2hldGhlciB0aGUgbWVudSBpcyBkaXNwbGF5ZWQgaW5saW5lIChpLmUuIGFsd2F5cyBwcmVzZW50IHZzIGEgY29uZGl0aW9uYWwgcG9wdXAgdGhhdCB0aGUgdXNlciB0cmlnZ2VycyB3aXRoIGEgdHJpZ2dlciBlbGVtZW50KS4gKi9cbiAgb3ZlcnJpZGUgcmVhZG9ubHkgaXNJbmxpbmUgPSAhdGhpcy5fcGFyZW50VHJpZ2dlcjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuZGVzdHJveWVkLnN1YnNjcmliZSh0aGlzLmNsb3NlZCk7XG4gICAgdGhpcy5fcGFyZW50VHJpZ2dlcj8ucmVnaXN0ZXJDaGlsZE1lbnUodGhpcyk7XG4gIH1cblxuICBvdmVycmlkZSBuZ0FmdGVyQ29udGVudEluaXQoKSB7XG4gICAgc3VwZXIubmdBZnRlckNvbnRlbnRJbml0KCk7XG4gICAgdGhpcy5fc3Vic2NyaWJlVG9NZW51U3RhY2tFbXB0aWVkKCk7XG4gIH1cblxuICBvdmVycmlkZSBuZ09uRGVzdHJveSgpIHtcbiAgICBzdXBlci5uZ09uRGVzdHJveSgpO1xuICAgIHRoaXMuY2xvc2VkLmNvbXBsZXRlKCk7XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlIGtleWJvYXJkIGV2ZW50cyBmb3IgdGhlIE1lbnUuXG4gICAqIEBwYXJhbSBldmVudCBUaGUga2V5Ym9hcmQgZXZlbnQgdG8gYmUgaGFuZGxlZC5cbiAgICovXG4gIF9oYW5kbGVLZXlFdmVudChldmVudDogS2V5Ym9hcmRFdmVudCkge1xuICAgIGNvbnN0IGtleU1hbmFnZXIgPSB0aGlzLmtleU1hbmFnZXI7XG4gICAgc3dpdGNoIChldmVudC5rZXlDb2RlKSB7XG4gICAgICBjYXNlIExFRlRfQVJST1c6XG4gICAgICBjYXNlIFJJR0hUX0FSUk9XOlxuICAgICAgICBpZiAoIWhhc01vZGlmaWVyS2V5KGV2ZW50KSkge1xuICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAga2V5TWFuYWdlci5zZXRGb2N1c09yaWdpbigna2V5Ym9hcmQnKTtcbiAgICAgICAgICBrZXlNYW5hZ2VyLm9uS2V5ZG93bihldmVudCk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgRVNDQVBFOlxuICAgICAgICBpZiAoIWhhc01vZGlmaWVyS2V5KGV2ZW50KSkge1xuICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgdGhpcy5tZW51U3RhY2suY2xvc2UodGhpcywge1xuICAgICAgICAgICAgZm9jdXNOZXh0T25FbXB0eTogRm9jdXNOZXh0LmN1cnJlbnRJdGVtLFxuICAgICAgICAgICAgZm9jdXNQYXJlbnRUcmlnZ2VyOiB0cnVlLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFRBQjpcbiAgICAgICAgaWYgKCFoYXNNb2RpZmllcktleShldmVudCwgJ2FsdEtleScsICdtZXRhS2V5JywgJ2N0cmxLZXknKSkge1xuICAgICAgICAgIHRoaXMubWVudVN0YWNrLmNsb3NlQWxsKHtmb2N1c1BhcmVudFRyaWdnZXI6IHRydWV9KTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAga2V5TWFuYWdlci5vbktleWRvd24oZXZlbnQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgZm9jdXMgdGhlIGVpdGhlciB0aGUgY3VycmVudCwgcHJldmlvdXMgb3IgbmV4dCBpdGVtIGJhc2VkIG9uIHRoZSBGb2N1c05leHQgZXZlbnQuXG4gICAqIEBwYXJhbSBmb2N1c05leHQgVGhlIGVsZW1lbnQgdG8gZm9jdXMuXG4gICAqL1xuICBwcml2YXRlIF90b2dnbGVNZW51Rm9jdXMoZm9jdXNOZXh0OiBGb2N1c05leHQgfCB1bmRlZmluZWQpIHtcbiAgICBjb25zdCBrZXlNYW5hZ2VyID0gdGhpcy5rZXlNYW5hZ2VyO1xuICAgIHN3aXRjaCAoZm9jdXNOZXh0KSB7XG4gICAgICBjYXNlIEZvY3VzTmV4dC5uZXh0SXRlbTpcbiAgICAgICAga2V5TWFuYWdlci5zZXRGb2N1c09yaWdpbigna2V5Ym9hcmQnKTtcbiAgICAgICAga2V5TWFuYWdlci5zZXROZXh0SXRlbUFjdGl2ZSgpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBGb2N1c05leHQucHJldmlvdXNJdGVtOlxuICAgICAgICBrZXlNYW5hZ2VyLnNldEZvY3VzT3JpZ2luKCdrZXlib2FyZCcpO1xuICAgICAgICBrZXlNYW5hZ2VyLnNldFByZXZpb3VzSXRlbUFjdGl2ZSgpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBGb2N1c05leHQuY3VycmVudEl0ZW06XG4gICAgICAgIGlmIChrZXlNYW5hZ2VyLmFjdGl2ZUl0ZW0pIHtcbiAgICAgICAgICBrZXlNYW5hZ2VyLnNldEZvY3VzT3JpZ2luKCdrZXlib2FyZCcpO1xuICAgICAgICAgIGtleU1hbmFnZXIuc2V0QWN0aXZlSXRlbShrZXlNYW5hZ2VyLmFjdGl2ZUl0ZW0pO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBTdWJzY3JpYmUgdG8gdGhlIE1lbnVTdGFjayBlbXB0aWVkIGV2ZW50cy4gKi9cbiAgcHJpdmF0ZSBfc3Vic2NyaWJlVG9NZW51U3RhY2tFbXB0aWVkKCkge1xuICAgIHRoaXMubWVudVN0YWNrLmVtcHRpZWRcbiAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCkpXG4gICAgICAuc3Vic2NyaWJlKGV2ZW50ID0+IHRoaXMuX3RvZ2dsZU1lbnVGb2N1cyhldmVudCkpO1xuICB9XG59XG4iXX0=