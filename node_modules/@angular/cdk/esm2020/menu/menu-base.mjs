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
}
CdkMenuBase.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: CdkMenuBase, deps: null, target: i0.ɵɵFactoryTarget.Directive });
CdkMenuBase.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "15.2.0-rc.0", type: CdkMenuBase, inputs: { id: "id" }, host: { attributes: { "role": "menu" }, listeners: { "focus": "focusFirstItem()", "focusin": "menuStack.setHasFocus(true)", "focusout": "menuStack.setHasFocus(false)" }, properties: { "tabindex": "_getTabIndex()", "id": "id", "attr.aria-orientation": "orientation", "attr.data-cdk-menu-stack-id": "menuStack.id" } }, queries: [{ propertyName: "items", predicate: CdkMenuItem, descendants: true }], usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: CdkMenuBase, decorators: [{
            type: Directive,
            args: [{
                    host: {
                        'role': 'menu',
                        'class': '',
                        '[tabindex]': '_getTabIndex()',
                        '[id]': 'id',
                        '[attr.aria-orientation]': 'orientation',
                        '[attr.data-cdk-menu-stack-id]': 'menuStack.id',
                        '(focus)': 'focusFirstItem()',
                        '(focusin)': 'menuStack.setHasFocus(true)',
                        '(focusout)': 'menuStack.setHasFocus(false)',
                    },
                }]
        }], propDecorators: { id: [{
                type: Input
            }], items: [{
                type: ContentChildren,
                args: [CdkMenuItem, { descendants: true }]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1iYXNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9tZW51L21lbnUtYmFzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBQzFDLE9BQU8sRUFFTCxlQUFlLEVBQ2YsU0FBUyxFQUNULFVBQVUsRUFDVixNQUFNLEVBQ04sS0FBSyxFQUNMLE1BQU0sRUFFTixTQUFTLEdBQ1YsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLGVBQWUsRUFBYyxNQUFNLG1CQUFtQixDQUFDO0FBQy9ELE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDeEMsT0FBTyxFQUFDLEtBQUssRUFBRSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDcEMsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ2pELE9BQU8sRUFBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQzFGLE9BQU8sRUFBQyxVQUFVLEVBQTJCLE1BQU0sY0FBYyxDQUFDO0FBRWxFLE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLHlCQUF5QixDQUFDO0FBQzVELE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxZQUFZLENBQUM7O0FBRXBDLG1EQUFtRDtBQUNuRCxJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFFZjs7O0dBR0c7QUFjSCxNQUFNLE9BQWdCLFdBQ3BCLFNBQVEsWUFBWTtJQWR0Qjs7UUFpQkUsMENBQTBDO1FBQ2pDLGtCQUFhLEdBQWdCLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxhQUFhLENBQUM7UUFFdkUsd0JBQXdCO1FBQ2QsV0FBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FB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Q0FBQyxDQUFDO1lBQ0gsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxjQUFlLENBQUMsQ0FBQztTQUNyRDtJQUNILENBQUM7OzZHQWxMbUIsV0FBVztpR0FBWCxXQUFXLG1ZQXVCZCxXQUFXO2dHQXZCUixXQUFXO2tCQWJoQyxTQUFTO21CQUFDO29CQUNULElBQUksRUFBRTt3QkFDSixNQUFNLEVBQUUsTUFBTTt3QkFDZCxPQUFPLEVBQUUsRUFBRTt3QkFDWCxZQUFZLEVBQUUsZ0JBQWdCO3dCQUM5QixNQUFNLEVBQUUsSUFBSTt3QkFDWix5QkFBeUIsRUFBRSxhQUFhO3dCQUN4QywrQkFBK0IsRUFBRSxjQUFjO3dCQUMvQyxTQUFTLEVBQUUsa0JBQWtCO3dCQUM3QixXQUFXLEVBQUUsNkJBQTZCO3dCQUMxQyxZQUFZLEVBQUUsOEJBQThCO3FCQUM3QztpQkFDRjs4QkFxQlUsRUFBRTtzQkFBVixLQUFLO2dCQUlHLEtBQUs7c0JBRGIsZUFBZTt1QkFBQyxXQUFXLEVBQUUsRUFBQyxXQUFXLEVBQUUsSUFBSSxFQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q2RrTWVudUdyb3VwfSBmcm9tICcuL21lbnUtZ3JvdXAnO1xuaW1wb3J0IHtcbiAgQWZ0ZXJDb250ZW50SW5pdCxcbiAgQ29udGVudENoaWxkcmVuLFxuICBEaXJlY3RpdmUsXG4gIEVsZW1lbnRSZWYsXG4gIGluamVjdCxcbiAgSW5wdXQsXG4gIE5nWm9uZSxcbiAgT25EZXN0cm95LFxuICBRdWVyeUxpc3QsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtGb2N1c0tleU1hbmFnZXIsIEZvY3VzT3JpZ2lufSBmcm9tICdAYW5ndWxhci9jZGsvYTExeSc7XG5pbXBvcnQge0Nka01lbnVJdGVtfSBmcm9tICcuL21lbnUtaXRlbSc7XG5pbXBvcnQge21lcmdlLCBTdWJqZWN0fSBmcm9tICdyeGpzJztcbmltcG9ydCB7RGlyZWN0aW9uYWxpdHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcbmltcG9ydCB7bWFwVG8sIG1lcmdlQWxsLCBtZXJnZU1hcCwgc3RhcnRXaXRoLCBzd2l0Y2hNYXAsIHRha2VVbnRpbH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHtNRU5VX1NUQUNLLCBNZW51U3RhY2ssIE1lbnVTdGFja0l0ZW19IGZyb20gJy4vbWVudS1zdGFjayc7XG5pbXBvcnQge01lbnV9IGZyb20gJy4vbWVudS1pbnRlcmZhY2UnO1xuaW1wb3J0IHtQb2ludGVyRm9jdXNUcmFja2VyfSBmcm9tICcuL3BvaW50ZXItZm9jdXMtdHJhY2tlcic7XG5pbXBvcnQge01FTlVfQUlNfSBmcm9tICcuL21lbnUtYWltJztcblxuLyoqIENvdW50ZXIgdXNlZCB0byBjcmVhdGUgdW5pcXVlIElEcyBmb3IgbWVudXMuICovXG5sZXQgbmV4dElkID0gMDtcblxuLyoqXG4gKiBBYnN0cmFjdCBkaXJlY3RpdmUgdGhhdCBpbXBsZW1lbnRzIHNoYXJlZCBsb2dpYyBjb21tb24gdG8gYWxsIG1lbnVzLlxuICogVGhpcyBjbGFzcyBjYW4gYmUgZXh0ZW5kZWQgdG8gY3JlYXRlIGN1c3RvbSBtZW51IHR5cGVzLlxuICovXG5ARGlyZWN0aXZlKHtcbiAgaG9zdDoge1xuICAgICdyb2xlJzogJ21lbnUnLFxuICAgICdjbGFzcyc6ICcnLCAvLyByZXNldCB0aGUgY3NzIGNsYXNzIGFkZGVkIGJ5IHRoZSBzdXBlci1jbGFzc1xuICAgICdbdGFiaW5kZXhdJzogJ19nZXRUYWJJbmRleCgpJyxcbiAgICAnW2lkXSc6ICdpZCcsXG4gICAgJ1thdHRyLmFyaWEtb3JpZW50YXRpb25dJzogJ29yaWVudGF0aW9uJyxcbiAgICAnW2F0dHIuZGF0YS1jZGstbWVudS1zdGFjay1pZF0nOiAnbWVudVN0YWNrLmlkJyxcbiAgICAnKGZvY3VzKSc6ICdmb2N1c0ZpcnN0SXRlbSgpJyxcbiAgICAnKGZvY3VzaW4pJzogJ21lbnVTdGFjay5zZXRIYXNGb2N1cyh0cnVlKScsXG4gICAgJyhmb2N1c291dCknOiAnbWVudVN0YWNrLnNldEhhc0ZvY3VzKGZhbHNlKScsXG4gIH0sXG59KVxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIENka01lbnVCYXNlXG4gIGV4dGVuZHMgQ2RrTWVudUdyb3VwXG4gIGltcGxlbWVudHMgTWVudSwgQWZ0ZXJDb250ZW50SW5pdCwgT25EZXN0cm95XG57XG4gIC8qKiBUaGUgbWVudSdzIG5hdGl2ZSBET00gaG9zdCBlbGVtZW50LiAqL1xuICByZWFkb25seSBuYXRpdmVFbGVtZW50OiBIVE1MRWxlbWVudCA9IGluamVjdChFbGVtZW50UmVmKS5uYXRpdmVFbGVtZW50O1xuXG4gIC8qKiBUaGUgQW5ndWxhciB6b25lLiAqL1xuICBwcm90ZWN0ZWQgbmdab25lID0gaW5qZWN0KE5nWm9uZSk7XG5cbiAgLyoqIFRoZSBzdGFjayBvZiBtZW51cyB0aGlzIG1lbnUgYmVsb25ncyB0by4gKi9cbiAgcmVhZG9ubHkgbWVudVN0YWNrOiBNZW51U3RhY2sgPSBpbmplY3QoTUVOVV9TVEFDSyk7XG5cbiAgLyoqIFRoZSBtZW51IGFpbSBzZXJ2aWNlIHVzZWQgYnkgdGhpcyBtZW51LiAqL1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgbWVudUFpbSA9IGluamVjdChNRU5VX0FJTSwge29wdGlvbmFsOiB0cnVlLCBzZWxmOiB0cnVlfSk7XG5cbiAgLyoqIFRoZSBkaXJlY3Rpb25hbGl0eSAodGV4dCBkaXJlY3Rpb24pIG9mIHRoZSBjdXJyZW50IHBhZ2UuICovXG4gIHByb3RlY3RlZCByZWFkb25seSBkaXIgPSBpbmplY3QoRGlyZWN0aW9uYWxpdHksIHtvcHRpb25hbDogdHJ1ZX0pO1xuXG4gIC8qKiBUaGUgaWQgb2YgdGhlIG1lbnUncyBob3N0IGVsZW1lbnQuICovXG4gIEBJbnB1dCgpIGlkID0gYGNkay1tZW51LSR7bmV4dElkKyt9YDtcblxuICAvKiogQWxsIGNoaWxkIE1lbnVJdGVtIGVsZW1lbnRzIG5lc3RlZCBpbiB0aGlzIE1lbnUuICovXG4gIEBDb250ZW50Q2hpbGRyZW4oQ2RrTWVudUl0ZW0sIHtkZXNjZW5kYW50czogdHJ1ZX0pXG4gIHJlYWRvbmx5IGl0ZW1zOiBRdWVyeUxpc3Q8Q2RrTWVudUl0ZW0+O1xuXG4gIC8qKiBUaGUgZGlyZWN0aW9uIGl0ZW1zIGluIHRoZSBtZW51IGZsb3cuICovXG4gIG9yaWVudGF0aW9uOiAnaG9yaXpvbnRhbCcgfCAndmVydGljYWwnID0gJ3ZlcnRpY2FsJztcblxuICAvKipcbiAgICogV2hldGhlciB0aGUgbWVudSBpcyBkaXNwbGF5ZWQgaW5saW5lIChpLmUuIGFsd2F5cyBwcmVzZW50IHZzIGEgY29uZGl0aW9uYWwgcG9wdXAgdGhhdCB0aGVcbiAgICogdXNlciB0cmlnZ2VycyB3aXRoIGEgdHJpZ2dlciBlbGVtZW50KS5cbiAgICovXG4gIGlzSW5saW5lID0gZmFsc2U7XG5cbiAgLyoqIEhhbmRsZXMga2V5Ym9hcmQgZXZlbnRzIGZvciB0aGUgbWVudS4gKi9cbiAgcHJvdGVjdGVkIGtleU1hbmFnZXI6IEZvY3VzS2V5TWFuYWdlcjxDZGtNZW51SXRlbT47XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhlIE1lbnVCYXIgaXMgZGVzdHJveWVkLiAqL1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgZGVzdHJveWVkOiBTdWJqZWN0PHZvaWQ+ID0gbmV3IFN1YmplY3QoKTtcblxuICAvKiogVGhlIE1lbnUgSXRlbSB3aGljaCB0cmlnZ2VyZWQgdGhlIG9wZW4gc3VibWVudS4gKi9cbiAgcHJvdGVjdGVkIHRyaWdnZXJJdGVtPzogQ2RrTWVudUl0ZW07XG5cbiAgLyoqIFRyYWNrcyB0aGUgdXNlcnMgbW91c2UgbW92ZW1lbnRzIG92ZXIgdGhlIG1lbnUuICovXG4gIHByb3RlY3RlZCBwb2ludGVyVHJhY2tlcj86IFBvaW50ZXJGb2N1c1RyYWNrZXI8Q2RrTWVudUl0ZW0+O1xuXG4gIC8qKiBXaGV0aGVyIHRoaXMgbWVudSdzIG1lbnUgc3RhY2sgaGFzIGZvY3VzLiAqL1xuICBwcml2YXRlIF9tZW51U3RhY2tIYXNGb2N1cyA9IGZhbHNlO1xuXG4gIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHtcbiAgICBpZiAoIXRoaXMuaXNJbmxpbmUpIHtcbiAgICAgIHRoaXMubWVudVN0YWNrLnB1c2godGhpcyk7XG4gICAgfVxuICAgIHRoaXMuX3NldEtleU1hbmFnZXIoKTtcbiAgICB0aGlzLl9zdWJzY3JpYmVUb01lbnVTdGFja0hhc0ZvY3VzKCk7XG4gICAgdGhpcy5fc3Vic2NyaWJlVG9NZW51T3BlbigpO1xuICAgIHRoaXMuX3N1YnNjcmliZVRvTWVudVN0YWNrQ2xvc2VkKCk7XG4gICAgdGhpcy5fc2V0VXBQb2ludGVyVHJhY2tlcigpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5rZXlNYW5hZ2VyPy5kZXN0cm95KCk7XG4gICAgdGhpcy5kZXN0cm95ZWQubmV4dCgpO1xuICAgIHRoaXMuZGVzdHJveWVkLmNvbXBsZXRlKCk7XG4gICAgdGhpcy5wb2ludGVyVHJhY2tlcj8uZGVzdHJveSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFBsYWNlIGZvY3VzIG9uIHRoZSBmaXJzdCBNZW51SXRlbSBpbiB0aGUgbWVudSBhbmQgc2V0IHRoZSBmb2N1cyBvcmlnaW4uXG4gICAqIEBwYXJhbSBmb2N1c09yaWdpbiBUaGUgb3JpZ2luIGlucHV0IG1vZGUgb2YgdGhlIGZvY3VzIGV2ZW50LlxuICAgKi9cbiAgZm9jdXNGaXJzdEl0ZW0oZm9jdXNPcmlnaW46IEZvY3VzT3JpZ2luID0gJ3Byb2dyYW0nKSB7XG4gICAgdGhpcy5rZXlNYW5hZ2VyLnNldEZvY3VzT3JpZ2luKGZvY3VzT3JpZ2luKTtcbiAgICB0aGlzLmtleU1hbmFnZXIuc2V0Rmlyc3RJdGVtQWN0aXZlKCk7XG4gIH1cblxuICAvKipcbiAgICogUGxhY2UgZm9jdXMgb24gdGhlIGxhc3QgTWVudUl0ZW0gaW4gdGhlIG1lbnUgYW5kIHNldCB0aGUgZm9jdXMgb3JpZ2luLlxuICAgKiBAcGFyYW0gZm9jdXNPcmlnaW4gVGhlIG9yaWdpbiBpbnB1dCBtb2RlIG9mIHRoZSBmb2N1cyBldmVudC5cbiAgICovXG4gIGZvY3VzTGFzdEl0ZW0oZm9jdXNPcmlnaW46IEZvY3VzT3JpZ2luID0gJ3Byb2dyYW0nKSB7XG4gICAgdGhpcy5rZXlNYW5hZ2VyLnNldEZvY3VzT3JpZ2luKGZvY3VzT3JpZ2luKTtcbiAgICB0aGlzLmtleU1hbmFnZXIuc2V0TGFzdEl0ZW1BY3RpdmUoKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSB0YWJpbmRleCBmb3IgdGhpcyBtZW51LiAqL1xuICBfZ2V0VGFiSW5kZXgoKSB7XG4gICAgY29uc3QgdGFiaW5kZXhJZklubGluZSA9IHRoaXMuX21lbnVTdGFja0hhc0ZvY3VzID8gLTEgOiAwO1xuICAgIHJldHVybiB0aGlzLmlzSW5saW5lID8gdGFiaW5kZXhJZklubGluZSA6IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogQ2xvc2UgdGhlIG9wZW4gbWVudSBpZiB0aGUgY3VycmVudCBhY3RpdmUgaXRlbSBvcGVuZWQgdGhlIHJlcXVlc3RlZCBNZW51U3RhY2tJdGVtLlxuICAgKiBAcGFyYW0gbWVudSBUaGUgbWVudSByZXF1ZXN0ZWQgdG8gYmUgY2xvc2VkLlxuICAgKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25zIHRvIGNvbmZpZ3VyZSB0aGUgYmVoYXZpb3Igb24gY2xvc2UuXG4gICAqICAgLSBgZm9jdXNQYXJlbnRUcmlnZ2VyYCBXaGV0aGVyIHRvIGZvY3VzIHRoZSBwYXJlbnQgdHJpZ2dlciBhZnRlciBjbG9zaW5nIHRoZSBtZW51LlxuICAgKi9cbiAgcHJvdGVjdGVkIGNsb3NlT3Blbk1lbnUobWVudTogTWVudVN0YWNrSXRlbSwgb3B0aW9ucz86IHtmb2N1c1BhcmVudFRyaWdnZXI/OiBib29sZWFufSkge1xuICAgIGNvbnN0IHtmb2N1c1BhcmVudFRyaWdnZXJ9ID0gey4uLm9wdGlvbnN9O1xuICAgIGNvbnN0IGtleU1hbmFnZXIgPSB0aGlzLmtleU1hbmFnZXI7XG4gICAgY29uc3QgdHJpZ2dlciA9IHRoaXMudHJpZ2dlckl0ZW07XG4gICAgaWYgKG1lbnUgPT09IHRyaWdnZXI/LmdldE1lbnVUcmlnZ2VyKCk/LmdldE1lbnUoKSkge1xuICAgICAgdHJpZ2dlcj8uZ2V0TWVudVRyaWdnZXIoKT8uY2xvc2UoKTtcbiAgICAgIC8vIElmIHRoZSB1c2VyIGhhcyBtb3VzZWQgb3ZlciBhIHNpYmxpbmcgaXRlbSB3ZSB3YW50IHRvIGZvY3VzIHRoZSBlbGVtZW50IHVuZGVyIG1vdXNlIGZvY3VzXG4gICAgICAvLyBub3QgdGhlIHRyaWdnZXIgd2hpY2ggcHJldmlvdXNseSBvcGVuZWQgdGhlIG5vdyBjbG9zZWQgbWVudS5cbiAgICAgIGlmIChmb2N1c1BhcmVudFRyaWdnZXIpIHtcbiAgICAgICAgaWYgKHRyaWdnZXIpIHtcbiAgICAgICAgICBrZXlNYW5hZ2VyLnNldEFjdGl2ZUl0ZW0odHJpZ2dlcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAga2V5TWFuYWdlci5zZXRGaXJzdEl0ZW1BY3RpdmUoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBTZXR1cCB0aGUgRm9jdXNLZXlNYW5hZ2VyIHdpdGggdGhlIGNvcnJlY3Qgb3JpZW50YXRpb24gZm9yIHRoZSBtZW51LiAqL1xuICBwcml2YXRlIF9zZXRLZXlNYW5hZ2VyKCkge1xuICAgIHRoaXMua2V5TWFuYWdlciA9IG5ldyBGb2N1c0tleU1hbmFnZXIodGhpcy5pdGVtcykud2l0aFdyYXAoKS53aXRoVHlwZUFoZWFkKCkud2l0aEhvbWVBbmRFbmQoKTtcblxuICAgIGlmICh0aGlzLm9yaWVudGF0aW9uID09PSAnaG9yaXpvbnRhbCcpIHtcbiAgICAgIHRoaXMua2V5TWFuYWdlci53aXRoSG9yaXpvbnRhbE9yaWVudGF0aW9uKHRoaXMuZGlyPy52YWx1ZSB8fCAnbHRyJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMua2V5TWFuYWdlci53aXRoVmVydGljYWxPcmllbnRhdGlvbigpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTdWJzY3JpYmUgdG8gdGhlIG1lbnUgdHJpZ2dlcidzIG9wZW4gZXZlbnRzIGluIG9yZGVyIHRvIHRyYWNrIHRoZSB0cmlnZ2VyIHdoaWNoIG9wZW5lZCB0aGUgbWVudVxuICAgKiBhbmQgc3RvcCB0cmFja2luZyBpdCB3aGVuIHRoZSBtZW51IGlzIGNsb3NlZC5cbiAgICovXG4gIHByaXZhdGUgX3N1YnNjcmliZVRvTWVudU9wZW4oKSB7XG4gICAgY29uc3QgZXhpdENvbmRpdGlvbiA9IG1lcmdlKHRoaXMuaXRlbXMuY2hhbmdlcywgdGhpcy5kZXN0cm95ZWQpO1xuICAgIHRoaXMuaXRlbXMuY2hhbmdlc1xuICAgICAgLnBpcGUoXG4gICAgICAgIHN0YXJ0V2l0aCh0aGlzLml0ZW1zKSxcbiAgICAgICAgbWVyZ2VNYXAoKGxpc3Q6IFF1ZXJ5TGlzdDxDZGtNZW51SXRlbT4pID0+XG4gICAgICAgICAgbGlzdFxuICAgICAgICAgICAgLmZpbHRlcihpdGVtID0+IGl0ZW0uaGFzTWVudSlcbiAgICAgICAgICAgIC5tYXAoaXRlbSA9PiBpdGVtLmdldE1lbnVUcmlnZ2VyKCkhLm9wZW5lZC5waXBlKG1hcFRvKGl0ZW0pLCB0YWtlVW50aWwoZXhpdENvbmRpdGlvbikpKSxcbiAgICAgICAgKSxcbiAgICAgICAgbWVyZ2VBbGwoKSxcbiAgICAgICAgc3dpdGNoTWFwKChpdGVtOiBDZGtNZW51SXRlbSkgPT4ge1xuICAgICAgICAgIHRoaXMudHJpZ2dlckl0ZW0gPSBpdGVtO1xuICAgICAgICAgIHJldHVybiBpdGVtLmdldE1lbnVUcmlnZ2VyKCkhLmNsb3NlZDtcbiAgICAgICAgfSksXG4gICAgICAgIHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCksXG4gICAgICApXG4gICAgICAuc3Vic2NyaWJlKCgpID0+ICh0aGlzLnRyaWdnZXJJdGVtID0gdW5kZWZpbmVkKSk7XG4gIH1cblxuICAvKiogU3Vic2NyaWJlIHRvIHRoZSBNZW51U3RhY2sgY2xvc2UgZXZlbnRzLiAqL1xuICBwcml2YXRlIF9zdWJzY3JpYmVUb01lbnVTdGFja0Nsb3NlZCgpIHtcbiAgICB0aGlzLm1lbnVTdGFjay5jbG9zZWRcbiAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCkpXG4gICAgICAuc3Vic2NyaWJlKCh7aXRlbSwgZm9jdXNQYXJlbnRUcmlnZ2VyfSkgPT4gdGhpcy5jbG9zZU9wZW5NZW51KGl0ZW0sIHtmb2N1c1BhcmVudFRyaWdnZXJ9KSk7XG4gIH1cblxuICAvKiogU3Vic2NyaWJlIHRvIHRoZSBNZW51U3RhY2sgaGFzRm9jdXMgZXZlbnRzLiAqL1xuICBwcml2YXRlIF9zdWJzY3JpYmVUb01lbnVTdGFja0hhc0ZvY3VzKCkge1xuICAgIGlmICh0aGlzLmlzSW5saW5lKSB7XG4gICAgICB0aGlzLm1lbnVTdGFjay5oYXNGb2N1cy5waXBlKHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCkpLnN1YnNjcmliZShoYXNGb2N1cyA9PiB7XG4gICAgICAgIHRoaXMuX21lbnVTdGFja0hhc0ZvY3VzID0gaGFzRm9jdXM7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSBQb2ludGVyRm9jdXNUcmFja2VyIGFuZCBlbnN1cmUgdGhhdCB3aGVuIG1vdXNlIGZvY3VzIGNoYW5nZXMgdGhlIGtleSBtYW5hZ2VyIGlzIHVwZGF0ZWRcbiAgICogd2l0aCB0aGUgbGF0ZXN0IG1lbnUgaXRlbSB1bmRlciBtb3VzZSBmb2N1cy5cbiAgICovXG4gIHByaXZhdGUgX3NldFVwUG9pbnRlclRyYWNrZXIoKSB7XG4gICAgaWYgKHRoaXMubWVudUFpbSkge1xuICAgICAgdGhpcy5uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgICB0aGlzLnBvaW50ZXJUcmFja2VyID0gbmV3IFBvaW50ZXJGb2N1c1RyYWNrZXIodGhpcy5pdGVtcyk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMubWVudUFpbS5pbml0aWFsaXplKHRoaXMsIHRoaXMucG9pbnRlclRyYWNrZXIhKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==