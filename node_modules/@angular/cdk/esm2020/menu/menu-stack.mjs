/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Inject, Injectable, InjectionToken, Optional, SkipSelf } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs/operators';
import * as i0 from "@angular/core";
/** Injection token used for an implementation of MenuStack. */
export const MENU_STACK = new InjectionToken('cdk-menu-stack');
/** Provider that provides the parent menu stack, or a new menu stack if there is no parent one. */
export const PARENT_OR_NEW_MENU_STACK_PROVIDER = {
    provide: MENU_STACK,
    deps: [[new Optional(), new SkipSelf(), new Inject(MENU_STACK)]],
    useFactory: (parentMenuStack) => parentMenuStack || new MenuStack(),
};
/** Provider that provides the parent menu stack, or a new inline menu stack if there is no parent one. */
export const PARENT_OR_NEW_INLINE_MENU_STACK_PROVIDER = (orientation) => ({
    provide: MENU_STACK,
    deps: [[new Optional(), new SkipSelf(), new Inject(MENU_STACK)]],
    useFactory: (parentMenuStack) => parentMenuStack || MenuStack.inline(orientation),
});
/** The next available menu stack ID. */
let nextId = 0;
/**
 * MenuStack allows subscribers to listen for close events (when a MenuStackItem is popped off
 * of the stack) in order to perform closing actions. Upon the MenuStack being empty it emits
 * from the `empty` observable specifying the next focus action which the listener should perform
 * as requested by the closer.
 */
export class MenuStack {
    constructor() {
        /** The ID of this menu stack. */
        this.id = `${nextId++}`;
        /** All MenuStackItems tracked by this MenuStack. */
        this._elements = [];
        /** Emits the element which was popped off of the stack when requested by a closer. */
        this._close = new Subject();
        /** Emits once the MenuStack has become empty after popping off elements. */
        this._empty = new Subject();
        /** Emits whether any menu in the menu stack has focus. */
        this._hasFocus = new Subject();
        /** Observable which emits the MenuStackItem which has been requested to close. */
        this.closed = this._close;
        /** Observable which emits whether any menu in the menu stack has focus. */
        this.hasFocus = this._hasFocus.pipe(startWith(false), debounceTime(0), distinctUntilChanged());
        /**
         * Observable which emits when the MenuStack is empty after popping off the last element. It
         * emits a FocusNext event which specifies the action the closer has requested the listener
         * perform.
         */
        this.emptied = this._empty;
        /**
         * Whether the inline menu associated with this menu stack is vertical or horizontal.
         * `null` indicates there is no inline menu associated with this menu stack.
         */
        this._inlineMenuOrientation = null;
    }
    /** Creates a menu stack that originates from an inline menu. */
    static inline(orientation) {
        const stack = new MenuStack();
        stack._inlineMenuOrientation = orientation;
        return stack;
    }
    /**
     * Adds an item to the menu stack.
     * @param menu the MenuStackItem to put on the stack.
     */
    push(menu) {
        this._elements.push(menu);
    }
    /**
     * Pop items off of the stack up to and including `lastItem` and emit each on the close
     * observable. If the stack is empty or `lastItem` is not on the stack it does nothing.
     * @param lastItem the last item to pop off the stack.
     * @param options Options that configure behavior on close.
     */
    close(lastItem, options) {
        const { focusNextOnEmpty, focusParentTrigger } = { ...options };
        if (this._elements.indexOf(lastItem) >= 0) {
            let poppedElement;
            do {
                poppedElement = this._elements.pop();
                this._close.next({ item: poppedElement, focusParentTrigger });
            } while (poppedElement !== lastItem);
            if (this.isEmpty()) {
                this._empty.next(focusNextOnEmpty);
            }
        }
    }
    /**
     * Pop items off of the stack up to but excluding `lastItem` and emit each on the close
     * observable. If the stack is empty or `lastItem` is not on the stack it does nothing.
     * @param lastItem the element which should be left on the stack
     * @return whether or not an item was removed from the stack
     */
    closeSubMenuOf(lastItem) {
        let removed = false;
        if (this._elements.indexOf(lastItem) >= 0) {
            removed = this.peek() !== lastItem;
            while (this.peek() !== lastItem) {
                this._close.next({ item: this._elements.pop() });
            }
        }
        return removed;
    }
    /**
     * Pop off all MenuStackItems and emit each one on the `close` observable one by one.
     * @param options Options that configure behavior on close.
     */
    closeAll(options) {
        const { focusNextOnEmpty, focusParentTrigger } = { ...options };
        if (!this.isEmpty()) {
            while (!this.isEmpty()) {
                const menuStackItem = this._elements.pop();
                if (menuStackItem) {
                    this._close.next({ item: menuStackItem, focusParentTrigger });
                }
            }
            this._empty.next(focusNextOnEmpty);
        }
    }
    /** Return true if this stack is empty. */
    isEmpty() {
        return !this._elements.length;
    }
    /** Return the length of the stack. */
    length() {
        return this._elements.length;
    }
    /** Get the top most element on the stack. */
    peek() {
        return this._elements[this._elements.length - 1];
    }
    /** Whether the menu stack is associated with an inline menu. */
    hasInlineMenu() {
        return this._inlineMenuOrientation != null;
    }
    /** The orientation of the associated inline menu. */
    inlineMenuOrientation() {
        return this._inlineMenuOrientation;
    }
    /** Sets whether the menu stack contains the focused element. */
    setHasFocus(hasFocus) {
        this._hasFocus.next(hasFocus);
    }
}
MenuStack.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: MenuStack, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
MenuStack.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: MenuStack });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: MenuStack, decorators: [{
            type: Injectable
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvbWVudS9tZW51LXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3JGLE9BQU8sRUFBYSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDekMsT0FBTyxFQUFDLFlBQVksRUFBRSxvQkFBb0IsRUFBRSxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQzs7QUFlN0UsK0RBQStEO0FBQy9ELE1BQU0sQ0FBQyxNQUFNLFVBQVUsR0FBRyxJQUFJLGNBQWMsQ0FBWSxnQkFBZ0IsQ0FBQyxDQUFDO0FBRTFFLG1HQUFtRztBQUNuRyxNQUFNLENBQUMsTUFBTSxpQ0FBaUMsR0FBRztJQUMvQyxPQUFPLEVBQUUsVUFBVTtJQUNuQixJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksUUFBUSxFQUFFLEVBQUUsSUFBSSxRQUFRLEVBQUUsRUFBRSxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO0lBQ2hFLFVBQVUsRUFBRSxDQUFDLGVBQTJCLEVBQUUsRUFBRSxDQUFDLGVBQWUsSUFBSSxJQUFJLFNBQVMsRUFBRTtDQUNoRixDQUFDO0FBRUYsMEdBQTBHO0FBQzFHLE1BQU0sQ0FBQyxNQUFNLHdDQUF3QyxHQUFHLENBQ3RELFdBQXNDLEVBQ3RDLEVBQUUsQ0FBQyxDQUFDO0lBQ0osT0FBTyxFQUFFLFVBQVU7SUFDbkIsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLFFBQVEsRUFBRSxFQUFFLElBQUksUUFBUSxFQUFFLEVBQUUsSUFBSSxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztJQUNoRSxVQUFVLEVBQUUsQ0FBQyxlQUEyQixFQUFFLEVBQUUsQ0FBQyxl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QUM7OzJHQXpJVSxTQUFTOytHQUFULFNBQVM7Z0dBQVQsU0FBUztrQkFEckIsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdCwgSW5qZWN0YWJsZSwgSW5qZWN0aW9uVG9rZW4sIE9wdGlvbmFsLCBTa2lwU2VsZn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge09ic2VydmFibGUsIFN1YmplY3R9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtkZWJvdW5jZVRpbWUsIGRpc3RpbmN0VW50aWxDaGFuZ2VkLCBzdGFydFdpdGh9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuLyoqIFRoZSByZWxhdGl2ZSBpdGVtIGluIHRoZSBpbmxpbmUgbWVudSB0byBmb2N1cyBhZnRlciBjbG9zaW5nIGFsbCBwb3B1cCBtZW51cy4gKi9cbmV4cG9ydCBjb25zdCBlbnVtIEZvY3VzTmV4dCB7XG4gIG5leHRJdGVtLFxuICBwcmV2aW91c0l0ZW0sXG4gIGN1cnJlbnRJdGVtLFxufVxuXG4vKiogQSBzaW5nbGUgaXRlbSAobWVudSkgaW4gdGhlIG1lbnUgc3RhY2suICovXG5leHBvcnQgaW50ZXJmYWNlIE1lbnVTdGFja0l0ZW0ge1xuICAvKiogQSByZWZlcmVuY2UgdG8gdGhlIG1lbnUgc3RhY2sgdGhpcyBtZW51IHN0YWNrIGl0ZW0gYmVsb25ncyB0by4gKi9cbiAgbWVudVN0YWNrPzogTWVudVN0YWNrO1xufVxuXG4vKiogSW5qZWN0aW9uIHRva2VuIHVzZWQgZm9yIGFuIGltcGxlbWVudGF0aW9uIG9mIE1lbnVTdGFjay4gKi9cbmV4cG9ydCBjb25zdCBNRU5VX1NUQUNLID0gbmV3IEluamVjdGlvblRva2VuPE1lbnVTdGFjaz4oJ2Nkay1tZW51LXN0YWNrJyk7XG5cbi8qKiBQcm92aWRlciB0aGF0IHByb3ZpZGVzIHRoZSBwYXJlbnQgbWVudSBzdGFjaywgb3IgYSBuZXcgbWVudSBzdGFjayBpZiB0aGVyZSBpcyBubyBwYXJlbnQgb25lLiAqL1xuZXhwb3J0IGNvbnN0IFBBUkVOVF9PUl9ORVdfTUVOVV9TVEFDS19QUk9WSURFUiA9IHtcbiAgcHJvdmlkZTogTUVOVV9TVEFDSyxcbiAgZGVwczogW1tuZXcgT3B0aW9uYWwoKSwgbmV3IFNraXBTZWxmKCksIG5ldyBJbmplY3QoTUVOVV9TVEFDSyldXSxcbiAgdXNlRmFjdG9yeTogKHBhcmVudE1lbnVTdGFjaz86IE1lbnVTdGFjaykgPT4gcGFyZW50TWVudVN0YWNrIHx8IG5ldyBNZW51U3RhY2soKSxcbn07XG5cbi8qKiBQcm92aWRlciB0aGF0IHByb3ZpZGVzIHRoZSBwYXJlbnQgbWVudSBzdGFjaywgb3IgYSBuZXcgaW5saW5lIG1lbnUgc3RhY2sgaWYgdGhlcmUgaXMgbm8gcGFyZW50IG9uZS4gKi9cbmV4cG9ydCBjb25zdCBQQVJFTlRfT1JfTkVXX0lOTElORV9NRU5VX1NUQUNLX1BST1ZJREVSID0gKFxuICBvcmllbnRhdGlvbjogJ3ZlcnRpY2FsJyB8ICdob3Jpem9udGFsJyxcbikgPT4gKHtcbiAgcHJvdmlkZTogTUVOVV9TVEFDSyxcbiAgZGVwczogW1tuZXcgT3B0aW9uYWwoKSwgbmV3IFNraXBTZWxmKCksIG5ldyBJbmplY3QoTUVOVV9TVEFDSyldXSxcbiAgdXNlRmFjdG9yeTogKHBhcmVudE1lbnVTdGFjaz86IE1lbnVTdGFjaykgPT4gcGFyZW50TWVudVN0YWNrIHx8IE1lbnVTdGFjay5pbmxpbmUob3JpZW50YXRpb24pLFxufSk7XG5cbi8qKiBPcHRpb25zIHRoYXQgY2FuIGJlIHByb3ZpZGVkIHRvIHRoZSBjbG9zZSBvciBjbG9zZUFsbCBtZXRob2RzLiAqL1xuZXhwb3J0IGludGVyZmFjZSBDbG9zZU9wdGlvbnMge1xuICAvKiogVGhlIGVsZW1lbnQgdG8gZm9jdXMgbmV4dCBpZiB0aGUgY2xvc2Ugb3BlcmF0aW9uIGNhdXNlcyB0aGUgbWVudSBzdGFjayB0byBiZWNvbWUgZW1wdHkuICovXG4gIGZvY3VzTmV4dE9uRW1wdHk/OiBGb2N1c05leHQ7XG4gIC8qKiBXaGV0aGVyIHRvIGZvY3VzIHRoZSBwYXJlbnQgdHJpZ2dlciBhZnRlciBjbG9zaW5nIHRoZSBtZW51LiAqL1xuICBmb2N1c1BhcmVudFRyaWdnZXI/OiBib29sZWFuO1xufVxuXG4vKiogRXZlbnQgZGlzcGF0Y2hlZCB3aGVuIGEgbWVudSBpcyBjbG9zZWQuICovXG5leHBvcnQgaW50ZXJmYWNlIE1lbnVTdGFja0Nsb3NlRXZlbnQge1xuICAvKiogVGhlIG1lbnUgYmVpbmcgY2xvc2VkLiAqL1xuICBpdGVtOiBNZW51U3RhY2tJdGVtO1xuICAvKiogV2hldGhlciB0byBmb2N1cyB0aGUgcGFyZW50IHRyaWdnZXIgYWZ0ZXIgY2xvc2luZyB0aGUgbWVudS4gKi9cbiAgZm9jdXNQYXJlbnRUcmlnZ2VyPzogYm9vbGVhbjtcbn1cblxuLyoqIFRoZSBuZXh0IGF2YWlsYWJsZSBtZW51IHN0YWNrIElELiAqL1xubGV0IG5leHRJZCA9IDA7XG5cbi8qKlxuICogTWVudVN0YWNrIGFsbG93cyBzdWJzY3JpYmVycyB0byBsaXN0ZW4gZm9yIGNsb3NlIGV2ZW50cyAod2hlbiBhIE1lbnVTdGFja0l0ZW0gaXMgcG9wcGVkIG9mZlxuICogb2YgdGhlIHN0YWNrKSBpbiBvcmRlciB0byBwZXJmb3JtIGNsb3NpbmcgYWN0aW9ucy4gVXBvbiB0aGUgTWVudVN0YWNrIGJlaW5nIGVtcHR5IGl0IGVtaXRzXG4gKiBmcm9tIHRoZSBgZW1wdHlgIG9ic2VydmFibGUgc3BlY2lmeWluZyB0aGUgbmV4dCBmb2N1cyBhY3Rpb24gd2hpY2ggdGhlIGxpc3RlbmVyIHNob3VsZCBwZXJmb3JtXG4gKiBhcyByZXF1ZXN0ZWQgYnkgdGhlIGNsb3Nlci5cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE1lbnVTdGFjayB7XG4gIC8qKiBUaGUgSUQgb2YgdGhpcyBtZW51IHN0YWNrLiAqL1xuICByZWFkb25seSBpZCA9IGAke25leHRJZCsrfWA7XG5cbiAgLyoqIEFsbCBNZW51U3RhY2tJdGVtcyB0cmFja2VkIGJ5IHRoaXMgTWVudVN0YWNrLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9lbGVtZW50czogTWVudVN0YWNrSXRlbVtdID0gW107XG5cbiAgLyoqIEVtaXRzIHRoZSBlbGVtZW50IHdoaWNoIHdhcyBwb3BwZWQgb2ZmIG9mIHRoZSBzdGFjayB3aGVuIHJlcXVlc3RlZCBieSBhIGNsb3Nlci4gKi9cbiAgcHJpdmF0ZSByZWFkb25seSBfY2xvc2UgPSBuZXcgU3ViamVjdDxNZW51U3RhY2tDbG9zZUV2ZW50PigpO1xuXG4gIC8qKiBFbWl0cyBvbmNlIHRoZSBNZW51U3RhY2sgaGFzIGJlY29tZSBlbXB0eSBhZnRlciBwb3BwaW5nIG9mZiBlbGVtZW50cy4gKi9cbiAgcHJpdmF0ZSByZWFkb25seSBfZW1wdHkgPSBuZXcgU3ViamVjdDxGb2N1c05leHQgfCB1bmRlZmluZWQ+KCk7XG5cbiAgLyoqIEVtaXRzIHdoZXRoZXIgYW55IG1lbnUgaW4gdGhlIG1lbnUgc3RhY2sgaGFzIGZvY3VzLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9oYXNGb2N1cyA9IG5ldyBTdWJqZWN0PGJvb2xlYW4+KCk7XG5cbiAgLyoqIE9ic2VydmFibGUgd2hpY2ggZW1pdHMgdGhlIE1lbnVTdGFja0l0ZW0gd2hpY2ggaGFzIGJlZW4gcmVxdWVzdGVkIHRvIGNsb3NlLiAqL1xuICByZWFkb25seSBjbG9zZWQ6IE9ic2VydmFibGU8TWVudVN0YWNrQ2xvc2VFdmVudD4gPSB0aGlzLl9jbG9zZTtcblxuICAvKiogT2JzZXJ2YWJsZSB3aGljaCBlbWl0cyB3aGV0aGVyIGFueSBtZW51IGluIHRoZSBtZW51IHN0YWNrIGhhcyBmb2N1cy4gKi9cbiAgcmVhZG9ubHkgaGFzRm9jdXM6IE9ic2VydmFibGU8Ym9vbGVhbj4gPSB0aGlzLl9oYXNGb2N1cy5waXBlKFxuICAgIHN0YXJ0V2l0aChmYWxzZSksXG4gICAgZGVib3VuY2VUaW1lKDApLFxuICAgIGRpc3RpbmN0VW50aWxDaGFuZ2VkKCksXG4gICk7XG5cbiAgLyoqXG4gICAqIE9ic2VydmFibGUgd2hpY2ggZW1pdHMgd2hlbiB0aGUgTWVudVN0YWNrIGlzIGVtcHR5IGFmdGVyIHBvcHBpbmcgb2ZmIHRoZSBsYXN0IGVsZW1lbnQuIEl0XG4gICAqIGVtaXRzIGEgRm9jdXNOZXh0IGV2ZW50IHdoaWNoIHNwZWNpZmllcyB0aGUgYWN0aW9uIHRoZSBjbG9zZXIgaGFzIHJlcXVlc3RlZCB0aGUgbGlzdGVuZXJcbiAgICogcGVyZm9ybS5cbiAgICovXG4gIHJlYWRvbmx5IGVtcHRpZWQ6IE9ic2VydmFibGU8Rm9jdXNOZXh0IHwgdW5kZWZpbmVkPiA9IHRoaXMuX2VtcHR5O1xuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBpbmxpbmUgbWVudSBhc3NvY2lhdGVkIHdpdGggdGhpcyBtZW51IHN0YWNrIGlzIHZlcnRpY2FsIG9yIGhvcml6b250YWwuXG4gICAqIGBudWxsYCBpbmRpY2F0ZXMgdGhlcmUgaXMgbm8gaW5saW5lIG1lbnUgYXNzb2NpYXRlZCB3aXRoIHRoaXMgbWVudSBzdGFjay5cbiAgICovXG4gIHByaXZhdGUgX2lubGluZU1lbnVPcmllbnRhdGlvbjogJ3ZlcnRpY2FsJyB8ICdob3Jpem9udGFsJyB8IG51bGwgPSBudWxsO1xuXG4gIC8qKiBDcmVhdGVzIGEgbWVudSBzdGFjayB0aGF0IG9yaWdpbmF0ZXMgZnJvbSBhbiBpbmxpbmUgbWVudS4gKi9cbiAgc3RhdGljIGlubGluZShvcmllbnRhdGlvbjogJ3ZlcnRpY2FsJyB8ICdob3Jpem9udGFsJykge1xuICAgIGNvbnN0IHN0YWNrID0gbmV3IE1lbnVTdGFjaygpO1xuICAgIHN0YWNrLl9pbmxpbmVNZW51T3JpZW50YXRpb24gPSBvcmllbnRhdGlvbjtcbiAgICByZXR1cm4gc3RhY2s7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhbiBpdGVtIHRvIHRoZSBtZW51IHN0YWNrLlxuICAgKiBAcGFyYW0gbWVudSB0aGUgTWVudVN0YWNrSXRlbSB0byBwdXQgb24gdGhlIHN0YWNrLlxuICAgKi9cbiAgcHVzaChtZW51OiBNZW51U3RhY2tJdGVtKSB7XG4gICAgdGhpcy5fZWxlbWVudHMucHVzaChtZW51KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQb3AgaXRlbXMgb2ZmIG9mIHRoZSBzdGFjayB1cCB0byBhbmQgaW5jbHVkaW5nIGBsYXN0SXRlbWAgYW5kIGVtaXQgZWFjaCBvbiB0aGUgY2xvc2VcbiAgICogb2JzZXJ2YWJsZS4gSWYgdGhlIHN0YWNrIGlzIGVtcHR5IG9yIGBsYXN0SXRlbWAgaXMgbm90IG9uIHRoZSBzdGFjayBpdCBkb2VzIG5vdGhpbmcuXG4gICAqIEBwYXJhbSBsYXN0SXRlbSB0aGUgbGFzdCBpdGVtIHRvIHBvcCBvZmYgdGhlIHN0YWNrLlxuICAgKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25zIHRoYXQgY29uZmlndXJlIGJlaGF2aW9yIG9uIGNsb3NlLlxuICAgKi9cbiAgY2xvc2UobGFzdEl0ZW06IE1lbnVTdGFja0l0ZW0sIG9wdGlvbnM/OiBDbG9zZU9wdGlvbnMpIHtcbiAgICBjb25zdCB7Zm9jdXNOZXh0T25FbXB0eSwgZm9jdXNQYXJlbnRUcmlnZ2VyfSA9IHsuLi5vcHRpb25zfTtcbiAgICBpZiAodGhpcy5fZWxlbWVudHMuaW5kZXhPZihsYXN0SXRlbSkgPj0gMCkge1xuICAgICAgbGV0IHBvcHBlZEVsZW1lbnQ7XG4gICAgICBkbyB7XG4gICAgICAgIHBvcHBlZEVsZW1lbnQgPSB0aGlzLl9lbGVtZW50cy5wb3AoKSE7XG4gICAgICAgIHRoaXMuX2Nsb3NlLm5leHQoe2l0ZW06IHBvcHBlZEVsZW1lbnQsIGZvY3VzUGFyZW50VHJpZ2dlcn0pO1xuICAgICAgfSB3aGlsZSAocG9wcGVkRWxlbWVudCAhPT0gbGFzdEl0ZW0pO1xuXG4gICAgICBpZiAodGhpcy5pc0VtcHR5KCkpIHtcbiAgICAgICAgdGhpcy5fZW1wdHkubmV4dChmb2N1c05leHRPbkVtcHR5KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUG9wIGl0ZW1zIG9mZiBvZiB0aGUgc3RhY2sgdXAgdG8gYnV0IGV4Y2x1ZGluZyBgbGFzdEl0ZW1gIGFuZCBlbWl0IGVhY2ggb24gdGhlIGNsb3NlXG4gICAqIG9ic2VydmFibGUuIElmIHRoZSBzdGFjayBpcyBlbXB0eSBvciBgbGFzdEl0ZW1gIGlzIG5vdCBvbiB0aGUgc3RhY2sgaXQgZG9lcyBub3RoaW5nLlxuICAgKiBAcGFyYW0gbGFzdEl0ZW0gdGhlIGVsZW1lbnQgd2hpY2ggc2hvdWxkIGJlIGxlZnQgb24gdGhlIHN0YWNrXG4gICAqIEByZXR1cm4gd2hldGhlciBvciBub3QgYW4gaXRlbSB3YXMgcmVtb3ZlZCBmcm9tIHRoZSBzdGFja1xuICAgKi9cbiAgY2xvc2VTdWJNZW51T2YobGFzdEl0ZW06IE1lbnVTdGFja0l0ZW0pIHtcbiAgICBsZXQgcmVtb3ZlZCA9IGZhbHNlO1xuICAgIGlmICh0aGlzLl9lbGVtZW50cy5pbmRleE9mKGxhc3RJdGVtKSA+PSAwKSB7XG4gICAgICByZW1vdmVkID0gdGhpcy5wZWVrKCkgIT09IGxhc3RJdGVtO1xuICAgICAgd2hpbGUgKHRoaXMucGVlaygpICE9PSBsYXN0SXRlbSkge1xuICAgICAgICB0aGlzLl9jbG9zZS5uZXh0KHtpdGVtOiB0aGlzLl9lbGVtZW50cy5wb3AoKSF9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlbW92ZWQ7XG4gIH1cblxuICAvKipcbiAgICogUG9wIG9mZiBhbGwgTWVudVN0YWNrSXRlbXMgYW5kIGVtaXQgZWFjaCBvbmUgb24gdGhlIGBjbG9zZWAgb2JzZXJ2YWJsZSBvbmUgYnkgb25lLlxuICAgKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25zIHRoYXQgY29uZmlndXJlIGJlaGF2aW9yIG9uIGNsb3NlLlxuICAgKi9cbiAgY2xvc2VBbGwob3B0aW9ucz86IENsb3NlT3B0aW9ucykge1xuICAgIGNvbnN0IHtmb2N1c05leHRPbkVtcHR5LCBmb2N1c1BhcmVudFRyaWdnZXJ9ID0gey4uLm9wdGlvbnN9O1xuICAgIGlmICghdGhpcy5pc0VtcHR5KCkpIHtcbiAgICAgIHdoaWxlICghdGhpcy5pc0VtcHR5KCkpIHtcbiAgICAgICAgY29uc3QgbWVudVN0YWNrSXRlbSA9IHRoaXMuX2VsZW1lbnRzLnBvcCgpO1xuICAgICAgICBpZiAobWVudVN0YWNrSXRlbSkge1xuICAgICAgICAgIHRoaXMuX2Nsb3NlLm5leHQoe2l0ZW06IG1lbnVTdGFja0l0ZW0sIGZvY3VzUGFyZW50VHJpZ2dlcn0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLl9lbXB0eS5uZXh0KGZvY3VzTmV4dE9uRW1wdHkpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBSZXR1cm4gdHJ1ZSBpZiB0aGlzIHN0YWNrIGlzIGVtcHR5LiAqL1xuICBpc0VtcHR5KCkge1xuICAgIHJldHVybiAhdGhpcy5fZWxlbWVudHMubGVuZ3RoO1xuICB9XG5cbiAgLyoqIFJldHVybiB0aGUgbGVuZ3RoIG9mIHRoZSBzdGFjay4gKi9cbiAgbGVuZ3RoKCkge1xuICAgIHJldHVybiB0aGlzLl9lbGVtZW50cy5sZW5ndGg7XG4gIH1cblxuICAvKiogR2V0IHRoZSB0b3AgbW9zdCBlbGVtZW50IG9uIHRoZSBzdGFjay4gKi9cbiAgcGVlaygpOiBNZW51U3RhY2tJdGVtIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5fZWxlbWVudHNbdGhpcy5fZWxlbWVudHMubGVuZ3RoIC0gMV07XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgbWVudSBzdGFjayBpcyBhc3NvY2lhdGVkIHdpdGggYW4gaW5saW5lIG1lbnUuICovXG4gIGhhc0lubGluZU1lbnUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2lubGluZU1lbnVPcmllbnRhdGlvbiAhPSBudWxsO1xuICB9XG5cbiAgLyoqIFRoZSBvcmllbnRhdGlvbiBvZiB0aGUgYXNzb2NpYXRlZCBpbmxpbmUgbWVudS4gKi9cbiAgaW5saW5lTWVudU9yaWVudGF0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9pbmxpbmVNZW51T3JpZW50YXRpb247XG4gIH1cblxuICAvKiogU2V0cyB3aGV0aGVyIHRoZSBtZW51IHN0YWNrIGNvbnRhaW5zIHRoZSBmb2N1c2VkIGVsZW1lbnQuICovXG4gIHNldEhhc0ZvY3VzKGhhc0ZvY3VzOiBib29sZWFuKSB7XG4gICAgdGhpcy5faGFzRm9jdXMubmV4dChoYXNGb2N1cyk7XG4gIH1cbn1cbiJdfQ==