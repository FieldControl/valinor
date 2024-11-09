/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CdkMenuGroup } from './menu-group';
import { ContentChildren, Directive, ElementRef, inject, Input, NgZone, QueryList, } from '@angular/core';
import { FocusKeyManager } from '@angular/cdk/a11y';
import { CdkMenuItem } from './menu-item';
import { merge, Subject } from 'rxjs';
import { Directionality } from '@angular/cdk/bidi';
import { mapTo, mergeAll, mergeMap, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { MENU_STACK } from './menu-stack';
import { PointerFocusTracker } from './pointer-focus-tracker';
import { MENU_AIM } from './menu-aim';
import * as i0 from "@angular/core";
/** Counter used to create unique IDs for menus. */
let nextId = 0;
/**
 * Abstract directive that implements shared logic common to all menus.
 * This class can be extended to create custom menu types.
 */
export class CdkMenuBase extends CdkMenuGroup {
    constructor() {
        super(...arguments);
        /** The menu's native DOM host element. */
        this.nativeElement = inject(ElementRef).nativeElement;
        /** The Angular zone. */
        this.ngZone = inject(NgZone);
        /** The stack of menus this menu belongs to. */
        this.menuStack = inject(MENU_STACK);
        /** The menu aim service used by this menu. */
        this.menuAim = inject(MENU_AIM, { optional: true, self: true });
        /** The directionality (text direction) of the current page. */
        this.dir = inject(Directionality, { optional: true });
        /** The id of the menu's host element. */
        this.id = `cdk-menu-${nextId++}`;
        /** The direction items in the menu flow. */
        this.orientation = 'vertical';
        /**
         * Whether the menu is displayed inline (i.e. always present vs a conditional popup that the
         * user triggers with a trigger element).
         */
        this.isInline = false;
        /** Emits when the MenuBar is destroyed. */
        this.destroyed = new Subject();
        /** Whether this menu's menu stack has focus. */
        this._menuStackHasFocus = false;
    }
    ngAfterContentInit() {
        if (!this.isInline) {
            this.menuStack.push(this);
        }
        this._setKeyManager();
        this._subscribeToMenuStackHasFocus();
        this._subscribeToMenuOpen();
        this._subscribeToMenuStackClosed();
        this._setUpPointerTracker();
    }
    ngOnDestroy() {
        this.keyManager?.destroy();
        this.destroyed.next();
        this.destroyed.complete();
        this.pointerTracker?.destroy();
    }
    /**
     * Place focus on the first MenuItem in the menu and set the focus origin.
     * @param focusOrigin The origin input mode of the focus event.
     */
    focusFirstItem(focusOrigin = 'program') {
        this.keyManager.setFocusOrigin(focusOrigin);
        this.keyManager.setFirstItemActive();
    }
    /**
     * Place focus on the last MenuItem in the menu and set the focus origin.
     * @param focusOrigin The origin input mode of the focus event.
     */
    focusLastItem(focusOrigin = 'program') {
        this.keyManager.setFocusOrigin(focusOrigin);
        this.keyManager.setLastItemActive();
    }
    /** Gets the tabindex for this menu. */
    _getTabIndex() {
        const tabindexIfInline = this._menuStackHasFocus ? -1 : 0;
        return this.isInline ? tabindexIfInline : null;
    }
    /**
     * Close the open menu if the current active item opened the requested MenuStackItem.
     * @param menu The menu requested to be closed.
     * @param options Options to configure the behavior on close.
     *   - `focusParentTrigger` Whether to focus the parent trigger after closing the menu.
     */
    closeOpenMenu(menu, options) {
        const { focusParentTrigger } = { ...options };
        const keyManager = this.keyManager;
        const trigger = this.triggerItem;
        if (menu === trigger?.getMenuTrigger()?.getMenu()) {
            trigger?.getMenuTrigger()?.close();
            // If the user has moused over a sibling item we want to focus the element under mouse focus
            // not the trigger which previously opened the now closed menu.
            if (focusParentTrigger) {
                if (trigger) {
                    keyManager.setActiveItem(trigger);
                }
                else {
                    keyManager.setFirstItemActive();
                }
            }
        }
    }
    /** Setup the FocusKeyManager with the correct orientation for the menu. */
    _setKeyManager() {
        this.keyManager = new FocusKeyManager(this.items).withWrap().withTypeAhead().withHomeAndEnd();
        if (this.orientation === 'horizontal') {
            this.keyManager.withHorizontalOrientation(this.dir?.value || 'ltr');
        }
        else {
            this.keyManager.withVerticalOrientation();
        }
    }
    /**
     * Subscribe to the menu trigger's open events in order to track the trigger which opened the menu
     * and stop tracking it when the menu is closed.
     */
    _subscribeToMenuOpen() {
        const exitCondition = merge(this.items.changes, this.destroyed);
        this.items.changes
            .pipe(startWith(this.items), mergeMap((list) => list
            .filter(item => item.hasMenu)
            .map(item => item.getMenuTrigger().opened.pipe(mapTo(item), takeUntil(exitCondition)))), mergeAll(), switchMap((item) => {
            this.triggerItem = item;
            return item.getMenuTrigger().closed;
        }), takeUntil(this.destroyed))
            .subscribe(() => (this.triggerItem = undefined));
    }
    /** Subscribe to the MenuStack close events. */
    _subscribeToMenuStackClosed() {
        this.menuStack.closed
            .pipe(takeUntil(this.destroyed))
            .subscribe(({ item, focusParentTrigger }) => this.closeOpenMenu(item, { focusParentTrigger }));
    }
    /** Subscribe to the MenuStack hasFocus events. */
    _subscribeToMenuStackHasFocus() {
        if (this.isInline) {
            this.menuStack.hasFocus.pipe(takeUntil(this.destroyed)).subscribe(hasFocus => {
                this._menuStackHasFocus = hasFocus;
            });
        }
    }
    /**
     * Set the PointerFocusTracker and ensure that when mouse focus changes the key manager is updated
     * with the latest menu item under mouse focus.
     */
    _setUpPointerTracker() {
        if (this.menuAim) {
            this.ngZone.runOutsideAngular(() => {
                this.pointerTracker = new PointerFocusTracker(this.items);
            });
            this.menuAim.initialize(this, this.pointerTracker);
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.2.0", ngImport: i0, type: CdkMenuBase, deps: null, target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "17.2.0", type: CdkMenuBase, isStandalone: true, inputs: { id: "id" }, host: { attributes: { "role": "menu" }, listeners: { "focus": "focusFirstItem()", "focusin": "menuStack.setHasFocus(true)", "focusout": "menuStack.setHasFocus(false)" }, properties: { "tabindex": "_getTabIndex()", "id": "id", "attr.aria-orientation": "orientation", "attr.data-cdk-menu-stack-id": "menuStack.id" } }, queries: [{ propertyName: "items", predicate: CdkMenuItem, descendants: true }], usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.2.0", ngImport: i0, type: CdkMenuBase, decorators: [{
            type: Directive,
            args: [{
                    host: {
                        'role': 'menu',
                        'class': '', // reset the css class added by the super-class
                        '[tabindex]': '_getTabIndex()',
                        '[id]': 'id',
                        '[attr.aria-orientation]': 'orientation',
                        '[attr.data-cdk-menu-stack-id]': 'menuStack.id',
                        '(focus)': 'focusFirstItem()',
                        '(focusin)': 'menuStack.setHasFocus(true)',
                        '(focusout)': 'menuStack.setHasFocus(false)',
                    },
                    standalone: true,
                }]
        }], propDecorators: { id: [{
                type: Input
            }], items: [{
                type: ContentChildren,
                args: [CdkMenuItem, { descendants: true }]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1iYXNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9tZW51L21lbnUtYmFzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBQzFDLE9BQU8sRUFFTCxlQUFlLEVBQ2YsU0FBUyxFQUNULFVBQVUsRUFDVixNQUFNLEVBQ04sS0FBSyxFQUNMLE1BQU0sRUFFTixTQUFTLEdBQ1YsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLGVBQWUsRUFBYyxNQUFNLG1CQUFtQixDQUFDO0FBQy9ELE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDeEMsT0FBTyxFQUFDLEtBQUssRUFBRSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDcEMsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ2pELE9BQU8sRUFBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQzFGLE9BQU8sRUFBQyxVQUFVLEVBQTJCLE1BQU0sY0FBYyxDQUFDO0FBRWxFLE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLHlCQUF5QixDQUFDO0FBQzVELE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxZQUFZLENBQUM7O0FBRXBDLG1EQUFtRDtBQUNuRCxJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFFZjs7O0dBR0c7QUFlSCxNQUFNLE9BQWdCLFdBQ3BCLFNBQVEsWUFBWTtJQWZ0Qjs7UUFrQkUsMENBQTBDO1FBQ2pDLGtCQUFhLEdBQWdCLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxhQUFhLENBQUM7UUFFdkUsd0JBQXdCO1FBQ2QsV0FBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FB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RUFBRTtnQkFDakMsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLG1CQUFtQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM1RCxDQUFDLENBQUMsQ0FBQztZQUNILElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsY0FBZSxDQUFDLENBQUM7UUFDdEQsQ0FBQztJQUNILENBQUM7OEdBbExtQixXQUFXO2tHQUFYLFdBQVcsdVpBdUJkLFdBQVc7OzJGQXZCUixXQUFXO2tCQWRoQyxTQUFTO21CQUFDO29CQUNULElBQUksRUFBRTt3QkFDSixNQUFNLEVBQUUsTUFBTTt3QkFDZCxPQUFPLEVBQUUsRUFBRSxFQUFFLCtDQUErQzt3QkFDNUQsWUFBWSxFQUFFLGdCQUFnQjt3QkFDOUIsTUFBTSxFQUFFLElBQUk7d0JBQ1oseUJBQXlCLEVBQUUsYUFBYTt3QkFDeEMsK0JBQStCLEVBQUUsY0FBYzt3QkFDL0MsU0FBUyxFQUFFLGtCQUFrQjt3QkFDN0IsV0FBVyxFQUFFLDZCQUE2Qjt3QkFDMUMsWUFBWSxFQUFFLDhCQUE4QjtxQkFDN0M7b0JBQ0QsVUFBVSxFQUFFLElBQUk7aUJBQ2pCOzhCQXFCVSxFQUFFO3NCQUFWLEtBQUs7Z0JBSUcsS0FBSztzQkFEYixlQUFlO3VCQUFDLFdBQVcsRUFBRSxFQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtDZGtNZW51R3JvdXB9IGZyb20gJy4vbWVudS1ncm91cCc7XG5pbXBvcnQge1xuICBBZnRlckNvbnRlbnRJbml0LFxuICBDb250ZW50Q2hpbGRyZW4sXG4gIERpcmVjdGl2ZSxcbiAgRWxlbWVudFJlZixcbiAgaW5qZWN0LFxuICBJbnB1dCxcbiAgTmdab25lLFxuICBPbkRlc3Ryb3ksXG4gIFF1ZXJ5TGlzdCxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0ZvY3VzS2V5TWFuYWdlciwgRm9jdXNPcmlnaW59IGZyb20gJ0Bhbmd1bGFyL2Nkay9hMTF5JztcbmltcG9ydCB7Q2RrTWVudUl0ZW19IGZyb20gJy4vbWVudS1pdGVtJztcbmltcG9ydCB7bWVyZ2UsIFN1YmplY3R9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtEaXJlY3Rpb25hbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHttYXBUbywgbWVyZ2VBbGwsIG1lcmdlTWFwLCBzdGFydFdpdGgsIHN3aXRjaE1hcCwgdGFrZVVudGlsfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQge01FTlVfU1RBQ0ssIE1lbnVTdGFjaywgTWVudVN0YWNrSXRlbX0gZnJvbSAnLi9tZW51LXN0YWNrJztcbmltcG9ydCB7TWVudX0gZnJvbSAnLi9tZW51LWludGVyZmFjZSc7XG5pbXBvcnQge1BvaW50ZXJGb2N1c1RyYWNrZXJ9IGZyb20gJy4vcG9pbnRlci1mb2N1cy10cmFja2VyJztcbmltcG9ydCB7TUVOVV9BSU19IGZyb20gJy4vbWVudS1haW0nO1xuXG4vKiogQ291bnRlciB1c2VkIHRvIGNyZWF0ZSB1bmlxdWUgSURzIGZvciBtZW51cy4gKi9cbmxldCBuZXh0SWQgPSAwO1xuXG4vKipcbiAqIEFic3RyYWN0IGRpcmVjdGl2ZSB0aGF0IGltcGxlbWVudHMgc2hhcmVkIGxvZ2ljIGNvbW1vbiB0byBhbGwgbWVudXMuXG4gKiBUaGlzIGNsYXNzIGNhbiBiZSBleHRlbmRlZCB0byBjcmVhdGUgY3VzdG9tIG1lbnUgdHlwZXMuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBob3N0OiB7XG4gICAgJ3JvbGUnOiAnbWVudScsXG4gICAgJ2NsYXNzJzogJycsIC8vIHJlc2V0IHRoZSBjc3MgY2xhc3MgYWRkZWQgYnkgdGhlIHN1cGVyLWNsYXNzXG4gICAgJ1t0YWJpbmRleF0nOiAnX2dldFRhYkluZGV4KCknLFxuICAgICdbaWRdJzogJ2lkJyxcbiAgICAnW2F0dHIuYXJpYS1vcmllbnRhdGlvbl0nOiAnb3JpZW50YXRpb24nLFxuICAgICdbYXR0ci5kYXRhLWNkay1tZW51LXN0YWNrLWlkXSc6ICdtZW51U3RhY2suaWQnLFxuICAgICcoZm9jdXMpJzogJ2ZvY3VzRmlyc3RJdGVtKCknLFxuICAgICcoZm9jdXNpbiknOiAnbWVudVN0YWNrLnNldEhhc0ZvY3VzKHRydWUpJyxcbiAgICAnKGZvY3Vzb3V0KSc6ICdtZW51U3RhY2suc2V0SGFzRm9jdXMoZmFsc2UpJyxcbiAgfSxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbn0pXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ2RrTWVudUJhc2VcbiAgZXh0ZW5kcyBDZGtNZW51R3JvdXBcbiAgaW1wbGVtZW50cyBNZW51LCBBZnRlckNvbnRlbnRJbml0LCBPbkRlc3Ryb3lcbntcbiAgLyoqIFRoZSBtZW51J3MgbmF0aXZlIERPTSBob3N0IGVsZW1lbnQuICovXG4gIHJlYWRvbmx5IG5hdGl2ZUVsZW1lbnQ6IEhUTUxFbGVtZW50ID0gaW5qZWN0KEVsZW1lbnRSZWYpLm5hdGl2ZUVsZW1lbnQ7XG5cbiAgLyoqIFRoZSBBbmd1bGFyIHpvbmUuICovXG4gIHByb3RlY3RlZCBuZ1pvbmUgPSBpbmplY3QoTmdab25lKTtcblxuICAvKiogVGhlIHN0YWNrIG9mIG1lbnVzIHRoaXMgbWVudSBiZWxvbmdzIHRvLiAqL1xuICByZWFkb25seSBtZW51U3RhY2s6IE1lbnVTdGFjayA9IGluamVjdChNRU5VX1NUQUNLKTtcblxuICAvKiogVGhlIG1lbnUgYWltIHNlcnZpY2UgdXNlZCBieSB0aGlzIG1lbnUuICovXG4gIHByb3RlY3RlZCByZWFkb25seSBtZW51QWltID0gaW5qZWN0KE1FTlVfQUlNLCB7b3B0aW9uYWw6IHRydWUsIHNlbGY6IHRydWV9KTtcblxuICAvKiogVGhlIGRpcmVjdGlvbmFsaXR5ICh0ZXh0IGRpcmVjdGlvbikgb2YgdGhlIGN1cnJlbnQgcGFnZS4gKi9cbiAgcHJvdGVjdGVkIHJlYWRvbmx5IGRpciA9IGluamVjdChEaXJlY3Rpb25hbGl0eSwge29wdGlvbmFsOiB0cnVlfSk7XG5cbiAgLyoqIFRoZSBpZCBvZiB0aGUgbWVudSdzIGhvc3QgZWxlbWVudC4gKi9cbiAgQElucHV0KCkgaWQgPSBgY2RrLW1lbnUtJHtuZXh0SWQrK31gO1xuXG4gIC8qKiBBbGwgY2hpbGQgTWVudUl0ZW0gZWxlbWVudHMgbmVzdGVkIGluIHRoaXMgTWVudS4gKi9cbiAgQENvbnRlbnRDaGlsZHJlbihDZGtNZW51SXRlbSwge2Rlc2NlbmRhbnRzOiB0cnVlfSlcbiAgcmVhZG9ubHkgaXRlbXM6IFF1ZXJ5TGlzdDxDZGtNZW51SXRlbT47XG5cbiAgLyoqIFRoZSBkaXJlY3Rpb24gaXRlbXMgaW4gdGhlIG1lbnUgZmxvdy4gKi9cbiAgb3JpZW50YXRpb246ICdob3Jpem9udGFsJyB8ICd2ZXJ0aWNhbCcgPSAndmVydGljYWwnO1xuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBtZW51IGlzIGRpc3BsYXllZCBpbmxpbmUgKGkuZS4gYWx3YXlzIHByZXNlbnQgdnMgYSBjb25kaXRpb25hbCBwb3B1cCB0aGF0IHRoZVxuICAgKiB1c2VyIHRyaWdnZXJzIHdpdGggYSB0cmlnZ2VyIGVsZW1lbnQpLlxuICAgKi9cbiAgaXNJbmxpbmUgPSBmYWxzZTtcblxuICAvKiogSGFuZGxlcyBrZXlib2FyZCBldmVudHMgZm9yIHRoZSBtZW51LiAqL1xuICBwcm90ZWN0ZWQga2V5TWFuYWdlcjogRm9jdXNLZXlNYW5hZ2VyPENka01lbnVJdGVtPjtcblxuICAvKiogRW1pdHMgd2hlbiB0aGUgTWVudUJhciBpcyBkZXN0cm95ZWQuICovXG4gIHByb3RlY3RlZCByZWFkb25seSBkZXN0cm95ZWQ6IFN1YmplY3Q8dm9pZD4gPSBuZXcgU3ViamVjdCgpO1xuXG4gIC8qKiBUaGUgTWVudSBJdGVtIHdoaWNoIHRyaWdnZXJlZCB0aGUgb3BlbiBzdWJtZW51LiAqL1xuICBwcm90ZWN0ZWQgdHJpZ2dlckl0ZW0/OiBDZGtNZW51SXRlbTtcblxuICAvKiogVHJhY2tzIHRoZSB1c2VycyBtb3VzZSBtb3ZlbWVudHMgb3ZlciB0aGUgbWVudS4gKi9cbiAgcHJvdGVjdGVkIHBvaW50ZXJUcmFja2VyPzogUG9pbnRlckZvY3VzVHJhY2tlcjxDZGtNZW51SXRlbT47XG5cbiAgLyoqIFdoZXRoZXIgdGhpcyBtZW51J3MgbWVudSBzdGFjayBoYXMgZm9jdXMuICovXG4gIHByaXZhdGUgX21lbnVTdGFja0hhc0ZvY3VzID0gZmFsc2U7XG5cbiAgbmdBZnRlckNvbnRlbnRJbml0KCkge1xuICAgIGlmICghdGhpcy5pc0lubGluZSkge1xuICAgICAgdGhpcy5tZW51U3RhY2sucHVzaCh0aGlzKTtcbiAgICB9XG4gICAgdGhpcy5fc2V0S2V5TWFuYWdlcigpO1xuICAgIHRoaXMuX3N1YnNjcmliZVRvTWVudVN0YWNrSGFzRm9jdXMoKTtcbiAgICB0aGlzLl9zdWJzY3JpYmVUb01lbnVPcGVuKCk7XG4gICAgdGhpcy5fc3Vic2NyaWJlVG9NZW51U3RhY2tDbG9zZWQoKTtcbiAgICB0aGlzLl9zZXRVcFBvaW50ZXJUcmFja2VyKCk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLmtleU1hbmFnZXI/LmRlc3Ryb3koKTtcbiAgICB0aGlzLmRlc3Ryb3llZC5uZXh0KCk7XG4gICAgdGhpcy5kZXN0cm95ZWQuY29tcGxldGUoKTtcbiAgICB0aGlzLnBvaW50ZXJUcmFja2VyPy5kZXN0cm95KCk7XG4gIH1cblxuICAvKipcbiAgICogUGxhY2UgZm9jdXMgb24gdGhlIGZpcnN0IE1lbnVJdGVtIGluIHRoZSBtZW51IGFuZCBzZXQgdGhlIGZvY3VzIG9yaWdpbi5cbiAgICogQHBhcmFtIGZvY3VzT3JpZ2luIFRoZSBvcmlnaW4gaW5wdXQgbW9kZSBvZiB0aGUgZm9jdXMgZXZlbnQuXG4gICAqL1xuICBmb2N1c0ZpcnN0SXRlbShmb2N1c09yaWdpbjogRm9jdXNPcmlnaW4gPSAncHJvZ3JhbScpIHtcbiAgICB0aGlzLmtleU1hbmFnZXIuc2V0Rm9jdXNPcmlnaW4oZm9jdXNPcmlnaW4pO1xuICAgIHRoaXMua2V5TWFuYWdlci5zZXRGaXJzdEl0ZW1BY3RpdmUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQbGFjZSBmb2N1cyBvbiB0aGUgbGFzdCBNZW51SXRlbSBpbiB0aGUgbWVudSBhbmQgc2V0IHRoZSBmb2N1cyBvcmlnaW4uXG4gICAqIEBwYXJhbSBmb2N1c09yaWdpbiBUaGUgb3JpZ2luIGlucHV0IG1vZGUgb2YgdGhlIGZvY3VzIGV2ZW50LlxuICAgKi9cbiAgZm9jdXNMYXN0SXRlbShmb2N1c09yaWdpbjogRm9jdXNPcmlnaW4gPSAncHJvZ3JhbScpIHtcbiAgICB0aGlzLmtleU1hbmFnZXIuc2V0Rm9jdXNPcmlnaW4oZm9jdXNPcmlnaW4pO1xuICAgIHRoaXMua2V5TWFuYWdlci5zZXRMYXN0SXRlbUFjdGl2ZSgpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIHRhYmluZGV4IGZvciB0aGlzIG1lbnUuICovXG4gIF9nZXRUYWJJbmRleCgpIHtcbiAgICBjb25zdCB0YWJpbmRleElmSW5saW5lID0gdGhpcy5fbWVudVN0YWNrSGFzRm9jdXMgPyAtMSA6IDA7XG4gICAgcmV0dXJuIHRoaXMuaXNJbmxpbmUgPyB0YWJpbmRleElmSW5saW5lIDogbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbG9zZSB0aGUgb3BlbiBtZW51IGlmIHRoZSBjdXJyZW50IGFjdGl2ZSBpdGVtIG9wZW5lZCB0aGUgcmVxdWVzdGVkIE1lbnVTdGFja0l0ZW0uXG4gICAqIEBwYXJhbSBtZW51IFRoZSBtZW51IHJlcXVlc3RlZCB0byBiZSBjbG9zZWQuXG4gICAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbnMgdG8gY29uZmlndXJlIHRoZSBiZWhhdmlvciBvbiBjbG9zZS5cbiAgICogICAtIGBmb2N1c1BhcmVudFRyaWdnZXJgIFdoZXRoZXIgdG8gZm9jdXMgdGhlIHBhcmVudCB0cmlnZ2VyIGFmdGVyIGNsb3NpbmcgdGhlIG1lbnUuXG4gICAqL1xuICBwcm90ZWN0ZWQgY2xvc2VPcGVuTWVudShtZW51OiBNZW51U3RhY2tJdGVtLCBvcHRpb25zPzoge2ZvY3VzUGFyZW50VHJpZ2dlcj86IGJvb2xlYW59KSB7XG4gICAgY29uc3Qge2ZvY3VzUGFyZW50VHJpZ2dlcn0gPSB7Li4ub3B0aW9uc307XG4gICAgY29uc3Qga2V5TWFuYWdlciA9IHRoaXMua2V5TWFuYWdlcjtcbiAgICBjb25zdCB0cmlnZ2VyID0gdGhpcy50cmlnZ2VySXRlbTtcbiAgICBpZiAobWVudSA9PT0gdHJpZ2dlcj8uZ2V0TWVudVRyaWdnZXIoKT8uZ2V0TWVudSgpKSB7XG4gICAgICB0cmlnZ2VyPy5nZXRNZW51VHJpZ2dlcigpPy5jbG9zZSgpO1xuICAgICAgLy8gSWYgdGhlIHVzZXIgaGFzIG1vdXNlZCBvdmVyIGEgc2libGluZyBpdGVtIHdlIHdhbnQgdG8gZm9jdXMgdGhlIGVsZW1lbnQgdW5kZXIgbW91c2UgZm9jdXNcbiAgICAgIC8vIG5vdCB0aGUgdHJpZ2dlciB3aGljaCBwcmV2aW91c2x5IG9wZW5lZCB0aGUgbm93IGNsb3NlZCBtZW51LlxuICAgICAgaWYgKGZvY3VzUGFyZW50VHJpZ2dlcikge1xuICAgICAgICBpZiAodHJpZ2dlcikge1xuICAgICAgICAgIGtleU1hbmFnZXIuc2V0QWN0aXZlSXRlbSh0cmlnZ2VyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBrZXlNYW5hZ2VyLnNldEZpcnN0SXRlbUFjdGl2ZSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqIFNldHVwIHRoZSBGb2N1c0tleU1hbmFnZXIgd2l0aCB0aGUgY29ycmVjdCBvcmllbnRhdGlvbiBmb3IgdGhlIG1lbnUuICovXG4gIHByaXZhdGUgX3NldEtleU1hbmFnZXIoKSB7XG4gICAgdGhpcy5rZXlNYW5hZ2VyID0gbmV3IEZvY3VzS2V5TWFuYWdlcih0aGlzLml0ZW1zKS53aXRoV3JhcCgpLndpdGhUeXBlQWhlYWQoKS53aXRoSG9tZUFuZEVuZCgpO1xuXG4gICAgaWYgKHRoaXMub3JpZW50YXRpb24gPT09ICdob3Jpem9udGFsJykge1xuICAgICAgdGhpcy5rZXlNYW5hZ2VyLndpdGhIb3Jpem9udGFsT3JpZW50YXRpb24odGhpcy5kaXI/LnZhbHVlIHx8ICdsdHInKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5rZXlNYW5hZ2VyLndpdGhWZXJ0aWNhbE9yaWVudGF0aW9uKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFN1YnNjcmliZSB0byB0aGUgbWVudSB0cmlnZ2VyJ3Mgb3BlbiBldmVudHMgaW4gb3JkZXIgdG8gdHJhY2sgdGhlIHRyaWdnZXIgd2hpY2ggb3BlbmVkIHRoZSBtZW51XG4gICAqIGFuZCBzdG9wIHRyYWNraW5nIGl0IHdoZW4gdGhlIG1lbnUgaXMgY2xvc2VkLlxuICAgKi9cbiAgcHJpdmF0ZSBfc3Vic2NyaWJlVG9NZW51T3BlbigpIHtcbiAgICBjb25zdCBleGl0Q29uZGl0aW9uID0gbWVyZ2UodGhpcy5pdGVtcy5jaGFuZ2VzLCB0aGlzLmRlc3Ryb3llZCk7XG4gICAgdGhpcy5pdGVtcy5jaGFuZ2VzXG4gICAgICAucGlwZShcbiAgICAgICAgc3RhcnRXaXRoKHRoaXMuaXRlbXMpLFxuICAgICAgICBtZXJnZU1hcCgobGlzdDogUXVlcnlMaXN0PENka01lbnVJdGVtPikgPT5cbiAgICAgICAgICBsaXN0XG4gICAgICAgICAgICAuZmlsdGVyKGl0ZW0gPT4gaXRlbS5oYXNNZW51KVxuICAgICAgICAgICAgLm1hcChpdGVtID0+IGl0ZW0uZ2V0TWVudVRyaWdnZXIoKSEub3BlbmVkLnBpcGUobWFwVG8oaXRlbSksIHRha2VVbnRpbChleGl0Q29uZGl0aW9uKSkpLFxuICAgICAgICApLFxuICAgICAgICBtZXJnZUFsbCgpLFxuICAgICAgICBzd2l0Y2hNYXAoKGl0ZW06IENka01lbnVJdGVtKSA9PiB7XG4gICAgICAgICAgdGhpcy50cmlnZ2VySXRlbSA9IGl0ZW07XG4gICAgICAgICAgcmV0dXJuIGl0ZW0uZ2V0TWVudVRyaWdnZXIoKSEuY2xvc2VkO1xuICAgICAgICB9KSxcbiAgICAgICAgdGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSxcbiAgICAgIClcbiAgICAgIC5zdWJzY3JpYmUoKCkgPT4gKHRoaXMudHJpZ2dlckl0ZW0gPSB1bmRlZmluZWQpKTtcbiAgfVxuXG4gIC8qKiBTdWJzY3JpYmUgdG8gdGhlIE1lbnVTdGFjayBjbG9zZSBldmVudHMuICovXG4gIHByaXZhdGUgX3N1YnNjcmliZVRvTWVudVN0YWNrQ2xvc2VkKCkge1xuICAgIHRoaXMubWVudVN0YWNrLmNsb3NlZFxuICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSlcbiAgICAgIC5zdWJzY3JpYmUoKHtpdGVtLCBmb2N1c1BhcmVudFRyaWdnZXJ9KSA9PiB0aGlzLmNsb3NlT3Blbk1lbnUoaXRlbSwge2ZvY3VzUGFyZW50VHJpZ2dlcn0pKTtcbiAgfVxuXG4gIC8qKiBTdWJzY3JpYmUgdG8gdGhlIE1lbnVTdGFjayBoYXNGb2N1cyBldmVudHMuICovXG4gIHByaXZhdGUgX3N1YnNjcmliZVRvTWVudVN0YWNrSGFzRm9jdXMoKSB7XG4gICAgaWYgKHRoaXMuaXNJbmxpbmUpIHtcbiAgICAgIHRoaXMubWVudVN0YWNrLmhhc0ZvY3VzLnBpcGUodGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSkuc3Vic2NyaWJlKGhhc0ZvY3VzID0+IHtcbiAgICAgICAgdGhpcy5fbWVudVN0YWNrSGFzRm9jdXMgPSBoYXNGb2N1cztcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIFBvaW50ZXJGb2N1c1RyYWNrZXIgYW5kIGVuc3VyZSB0aGF0IHdoZW4gbW91c2UgZm9jdXMgY2hhbmdlcyB0aGUga2V5IG1hbmFnZXIgaXMgdXBkYXRlZFxuICAgKiB3aXRoIHRoZSBsYXRlc3QgbWVudSBpdGVtIHVuZGVyIG1vdXNlIGZvY3VzLlxuICAgKi9cbiAgcHJpdmF0ZSBfc2V0VXBQb2ludGVyVHJhY2tlcigpIHtcbiAgICBpZiAodGhpcy5tZW51QWltKSB7XG4gICAgICB0aGlzLm5nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICAgIHRoaXMucG9pbnRlclRyYWNrZXIgPSBuZXcgUG9pbnRlckZvY3VzVHJhY2tlcih0aGlzLml0ZW1zKTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5tZW51QWltLmluaXRpYWxpemUodGhpcywgdGhpcy5wb2ludGVyVHJhY2tlciEpO1xuICAgIH1cbiAgfVxufVxuIl19