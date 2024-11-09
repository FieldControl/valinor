/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Output, Directive, EventEmitter, Input, Optional, ChangeDetectorRef, SkipSelf, Inject, booleanAttribute, } from '@angular/core';
import { UniqueSelectionDispatcher } from '@angular/cdk/collections';
import { CDK_ACCORDION, CdkAccordion } from './accordion';
import { Subscription } from 'rxjs';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/collections";
import * as i2 from "./accordion";
/** Used to generate unique ID for each accordion item. */
let nextId = 0;
/**
 * An basic directive expected to be extended and decorated as a component.  Sets up all
 * events and attributes needed to be managed by a CdkAccordion parent.
 */
export class CdkAccordionItem {
    /** Whether the AccordionItem is expanded. */
    get expanded() {
        return this._expanded;
    }
    set expanded(expanded) {
        // Only emit events and update the internal value if the value changes.
        if (this._expanded !== expanded) {
            this._expanded = expanded;
            this.expandedChange.emit(expanded);
            if (expanded) {
                this.opened.emit();
                /**
                 * In the unique selection dispatcher, the id parameter is the id of the CdkAccordionItem,
                 * the name value is the id of the accordion.
                 */
                const accordionId = this.accordion ? this.accordion.id : this.id;
                this._expansionDispatcher.notify(this.id, accordionId);
            }
            else {
                this.closed.emit();
            }
            // Ensures that the animation will run when the value is set outside of an `@Input`.
            // This includes cases like the open, close and toggle methods.
            this._changeDetectorRef.markForCheck();
        }
    }
    constructor(accordion, _changeDetectorRef, _expansionDispatcher) {
        this.accordion = accordion;
        this._changeDetectorRef = _changeDetectorRef;
        this._expansionDispatcher = _expansionDispatcher;
        /** Subscription to openAll/closeAll events. */
        this._openCloseAllSubscription = Subscription.EMPTY;
        /** Event emitted every time the AccordionItem is closed. */
        this.closed = new EventEmitter();
        /** Event emitted every time the AccordionItem is opened. */
        this.opened = new EventEmitter();
        /** Event emitted when the AccordionItem is destroyed. */
        this.destroyed = new EventEmitter();
        /**
         * Emits whenever the expanded state of the accordion changes.
         * Primarily used to facilitate two-way binding.
         * @docs-private
         */
        this.expandedChange = new EventEmitter();
        /** The unique AccordionItem id. */
        this.id = `cdk-accordion-child-${nextId++}`;
        this._expanded = false;
        /** Whether the AccordionItem is disabled. */
        this.disabled = false;
        /** Unregister function for _expansionDispatcher. */
        this._removeUniqueSelectionListener = () => { };
        this._removeUniqueSelectionListener = _expansionDispatcher.listen((id, accordionId) => {
            if (this.accordion &&
                !this.accordion.multi &&
                this.accordion.id === accordionId &&
                this.id !== id) {
                this.expanded = false;
            }
        });
        // When an accordion item is hosted in an accordion, subscribe to open/close events.
        if (this.accordion) {
            this._openCloseAllSubscription = this._subscribeToOpenCloseAllActions();
        }
    }
    /** Emits an event for the accordion item being destroyed. */
    ngOnDestroy() {
        this.opened.complete();
        this.closed.complete();
        this.destroyed.emit();
        this.destroyed.complete();
        this._removeUniqueSelectionListener();
        this._openCloseAllSubscription.unsubscribe();
    }
    /** Toggles the expanded state of the accordion item. */
    toggle() {
        if (!this.disabled) {
            this.expanded = !this.expanded;
        }
    }
    /** Sets the expanded state of the accordion item to false. */
    close() {
        if (!this.disabled) {
            this.expanded = false;
        }
    }
    /** Sets the expanded state of the accordion item to true. */
    open() {
        if (!this.disabled) {
            this.expanded = true;
        }
    }
    _subscribeToOpenCloseAllActions() {
        return this.accordion._openCloseAllActions.subscribe(expanded => {
            // Only change expanded state if item is enabled
            if (!this.disabled) {
                this.expanded = expanded;
            }
        });
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.2.0", ngImport: i0, type: CdkAccordionItem, deps: [{ token: CDK_ACCORDION, optional: true, skipSelf: true }, { token: i0.ChangeDetectorRef }, { token: i1.UniqueSelectionDispatcher }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "17.2.0", type: CdkAccordionItem, isStandalone: true, selector: "cdk-accordion-item, [cdkAccordionItem]", inputs: { expanded: ["expanded", "expanded", booleanAttribute], disabled: ["disabled", "disabled", booleanAttribute] }, outputs: { closed: "closed", opened: "opened", destroyed: "destroyed", expandedChange: "expandedChange" }, providers: [
            // Provide `CDK_ACCORDION` as undefined to prevent nested accordion items from
            // registering to the same accordion.
            { provide: CDK_ACCORDION, useValue: undefined },
        ], exportAs: ["cdkAccordionItem"], ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.2.0", ngImport: i0, type: CdkAccordionItem, decorators: [{
            type: Directive,
            args: [{
                    selector: 'cdk-accordion-item, [cdkAccordionItem]',
                    exportAs: 'cdkAccordionItem',
                    providers: [
                        // Provide `CDK_ACCORDION` as undefined to prevent nested accordion items from
                        // registering to the same accordion.
                        { provide: CDK_ACCORDION, useValue: undefined },
                    ],
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i2.CdkAccordion, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [CDK_ACCORDION]
                }, {
                    type: SkipSelf
                }] }, { type: i0.ChangeDetectorRef }, { type: i1.UniqueSelectionDispatcher }], propDecorators: { closed: [{
                type: Output
            }], opened: [{
                type: Output
            }], destroyed: [{
                type: Output
            }], expandedChange: [{
                type: Output
            }], expanded: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], disabled: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjb3JkaW9uLWl0ZW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL2FjY29yZGlvbi9hY2NvcmRpb24taXRlbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQ0wsTUFBTSxFQUNOLFNBQVMsRUFDVCxZQUFZLEVBQ1osS0FBSyxFQUVMLFFBQVEsRUFDUixpQkFBaUIsRUFDakIsUUFBUSxFQUNSLE1BQU0sRUFDTixnQkFBZ0IsR0FDakIsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLHlCQUF5QixFQUFDLE1BQU0sMEJBQTBCLENBQUM7QUFDbkUsT0FBTyxFQUFDLGFBQWEsRUFBRSxZQUFZLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDeEQsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLE1BQU0sQ0FBQzs7OztBQUVsQywwREFBMEQ7QUFDMUQsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBRWY7OztHQUdHO0FBV0gsTUFBTSxPQUFPLGdCQUFnQjtJQW9CM0IsNkNBQTZDO0lBQzdDLElBQ0ksUUFBUTtRQUNWLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUN4QixDQUFDO0lBQ0QsSUFBSSxRQUFRLENBQUMsUUFBaUI7UUFDNUIsdUVBQXVFO1FBQ3ZFLElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxRQUFRLEVBQUUsQ0FBQztZQUNoQyxJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztZQUMxQixJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUVuQyxJQUFJLFFBQVEsRUFBRSxDQUFDO2dCQUNiLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ25COzs7bUJBR0c7Z0JBQ0gsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FB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c0JBQTdDLEtBQUs7dUJBQUMsRUFBQyxTQUFTLEVBQUUsZ0JBQWdCLEVBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgT3V0cHV0LFxuICBEaXJlY3RpdmUsXG4gIEV2ZW50RW1pdHRlcixcbiAgSW5wdXQsXG4gIE9uRGVzdHJveSxcbiAgT3B0aW9uYWwsXG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBTa2lwU2VsZixcbiAgSW5qZWN0LFxuICBib29sZWFuQXR0cmlidXRlLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7VW5pcXVlU2VsZWN0aW9uRGlzcGF0Y2hlcn0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvbGxlY3Rpb25zJztcbmltcG9ydCB7Q0RLX0FDQ09SRElPTiwgQ2RrQWNjb3JkaW9ufSBmcm9tICcuL2FjY29yZGlvbic7XG5pbXBvcnQge1N1YnNjcmlwdGlvbn0gZnJvbSAncnhqcyc7XG5cbi8qKiBVc2VkIHRvIGdlbmVyYXRlIHVuaXF1ZSBJRCBmb3IgZWFjaCBhY2NvcmRpb24gaXRlbS4gKi9cbmxldCBuZXh0SWQgPSAwO1xuXG4vKipcbiAqIEFuIGJhc2ljIGRpcmVjdGl2ZSBleHBlY3RlZCB0byBiZSBleHRlbmRlZCBhbmQgZGVjb3JhdGVkIGFzIGEgY29tcG9uZW50LiAgU2V0cyB1cCBhbGxcbiAqIGV2ZW50cyBhbmQgYXR0cmlidXRlcyBuZWVkZWQgdG8gYmUgbWFuYWdlZCBieSBhIENka0FjY29yZGlvbiBwYXJlbnQuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ2Nkay1hY2NvcmRpb24taXRlbSwgW2Nka0FjY29yZGlvbkl0ZW1dJyxcbiAgZXhwb3J0QXM6ICdjZGtBY2NvcmRpb25JdGVtJyxcbiAgcHJvdmlkZXJzOiBbXG4gICAgLy8gUHJvdmlkZSBgQ0RLX0FDQ09SRElPTmAgYXMgdW5kZWZpbmVkIHRvIHByZXZlbnQgbmVzdGVkIGFjY29yZGlvbiBpdGVtcyBmcm9tXG4gICAgLy8gcmVnaXN0ZXJpbmcgdG8gdGhlIHNhbWUgYWNjb3JkaW9uLlxuICAgIHtwcm92aWRlOiBDREtfQUNDT1JESU9OLCB1c2VWYWx1ZTogdW5kZWZpbmVkfSxcbiAgXSxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrQWNjb3JkaW9uSXRlbSBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gIC8qKiBTdWJzY3JpcHRpb24gdG8gb3BlbkFsbC9jbG9zZUFsbCBldmVudHMuICovXG4gIHByaXZhdGUgX29wZW5DbG9zZUFsbFN1YnNjcmlwdGlvbiA9IFN1YnNjcmlwdGlvbi5FTVBUWTtcbiAgLyoqIEV2ZW50IGVtaXR0ZWQgZXZlcnkgdGltZSB0aGUgQWNjb3JkaW9uSXRlbSBpcyBjbG9zZWQuICovXG4gIEBPdXRwdXQoKSByZWFkb25seSBjbG9zZWQ6IEV2ZW50RW1pdHRlcjx2b2lkPiA9IG5ldyBFdmVudEVtaXR0ZXI8dm9pZD4oKTtcbiAgLyoqIEV2ZW50IGVtaXR0ZWQgZXZlcnkgdGltZSB0aGUgQWNjb3JkaW9uSXRlbSBpcyBvcGVuZWQuICovXG4gIEBPdXRwdXQoKSByZWFkb25seSBvcGVuZWQ6IEV2ZW50RW1pdHRlcjx2b2lkPiA9IG5ldyBFdmVudEVtaXR0ZXI8dm9pZD4oKTtcbiAgLyoqIEV2ZW50IGVtaXR0ZWQgd2hlbiB0aGUgQWNjb3JkaW9uSXRlbSBpcyBkZXN0cm95ZWQuICovXG4gIEBPdXRwdXQoKSByZWFkb25seSBkZXN0cm95ZWQ6IEV2ZW50RW1pdHRlcjx2b2lkPiA9IG5ldyBFdmVudEVtaXR0ZXI8dm9pZD4oKTtcblxuICAvKipcbiAgICogRW1pdHMgd2hlbmV2ZXIgdGhlIGV4cGFuZGVkIHN0YXRlIG9mIHRoZSBhY2NvcmRpb24gY2hhbmdlcy5cbiAgICogUHJpbWFyaWx5IHVzZWQgdG8gZmFjaWxpdGF0ZSB0d28td2F5IGJpbmRpbmcuXG4gICAqIEBkb2NzLXByaXZhdGVcbiAgICovXG4gIEBPdXRwdXQoKSByZWFkb25seSBleHBhbmRlZENoYW5nZTogRXZlbnRFbWl0dGVyPGJvb2xlYW4+ID0gbmV3IEV2ZW50RW1pdHRlcjxib29sZWFuPigpO1xuXG4gIC8qKiBUaGUgdW5pcXVlIEFjY29yZGlvbkl0ZW0gaWQuICovXG4gIHJlYWRvbmx5IGlkOiBzdHJpbmcgPSBgY2RrLWFjY29yZGlvbi1jaGlsZC0ke25leHRJZCsrfWA7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIEFjY29yZGlvbkl0ZW0gaXMgZXhwYW5kZWQuICovXG4gIEBJbnB1dCh7dHJhbnNmb3JtOiBib29sZWFuQXR0cmlidXRlfSlcbiAgZ2V0IGV4cGFuZGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9leHBhbmRlZDtcbiAgfVxuICBzZXQgZXhwYW5kZWQoZXhwYW5kZWQ6IGJvb2xlYW4pIHtcbiAgICAvLyBPbmx5IGVtaXQgZXZlbnRzIGFuZCB1cGRhdGUgdGhlIGludGVybmFsIHZhbHVlIGlmIHRoZSB2YWx1ZSBjaGFuZ2VzLlxuICAgIGlmICh0aGlzLl9leHBhbmRlZCAhPT0gZXhwYW5kZWQpIHtcbiAgICAgIHRoaXMuX2V4cGFuZGVkID0gZXhwYW5kZWQ7XG4gICAgICB0aGlzLmV4cGFuZGVkQ2hhbmdlLmVtaXQoZXhwYW5kZWQpO1xuXG4gICAgICBpZiAoZXhwYW5kZWQpIHtcbiAgICAgICAgdGhpcy5vcGVuZWQuZW1pdCgpO1xuICAgICAgICAvKipcbiAgICAgICAgICogSW4gdGhlIHVuaXF1ZSBzZWxlY3Rpb24gZGlzcGF0Y2hlciwgdGhlIGlkIHBhcmFtZXRlciBpcyB0aGUgaWQgb2YgdGhlIENka0FjY29yZGlvbkl0ZW0sXG4gICAgICAgICAqIHRoZSBuYW1lIHZhbHVlIGlzIHRoZSBpZCBvZiB0aGUgYWNjb3JkaW9uLlxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3QgYWNjb3JkaW9uSWQgPSB0aGlzLmFjY29yZGlvbiA/IHRoaXMuYWNjb3JkaW9uLmlkIDogdGhpcy5pZDtcbiAgICAgICAgdGhpcy5fZXhwYW5zaW9uRGlzcGF0Y2hlci5ub3RpZnkodGhpcy5pZCwgYWNjb3JkaW9uSWQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5jbG9zZWQuZW1pdCgpO1xuICAgICAgfVxuXG4gICAgICAvLyBFbnN1cmVzIHRoYXQgdGhlIGFuaW1hdGlvbiB3aWxsIHJ1biB3aGVuIHRoZSB2YWx1ZSBpcyBzZXQgb3V0c2lkZSBvZiBhbiBgQElucHV0YC5cbiAgICAgIC8vIFRoaXMgaW5jbHVkZXMgY2FzZXMgbGlrZSB0aGUgb3BlbiwgY2xvc2UgYW5kIHRvZ2dsZSBtZXRob2RzLlxuICAgICAgdGhpcy5fY2hhbmdlRGV0ZWN0b3JSZWYubWFya0ZvckNoZWNrKCk7XG4gICAgfVxuICB9XG4gIHByaXZhdGUgX2V4cGFuZGVkID0gZmFsc2U7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIEFjY29yZGlvbkl0ZW0gaXMgZGlzYWJsZWQuICovXG4gIEBJbnB1dCh7dHJhbnNmb3JtOiBib29sZWFuQXR0cmlidXRlfSkgZGlzYWJsZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAvKiogVW5yZWdpc3RlciBmdW5jdGlvbiBmb3IgX2V4cGFuc2lvbkRpc3BhdGNoZXIuICovXG4gIHByaXZhdGUgX3JlbW92ZVVuaXF1ZVNlbGVjdGlvbkxpc3RlbmVyOiAoKSA9PiB2b2lkID0gKCkgPT4ge307XG5cbiAgY29uc3RydWN0b3IoXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChDREtfQUNDT1JESU9OKSBAU2tpcFNlbGYoKSBwdWJsaWMgYWNjb3JkaW9uOiBDZGtBY2NvcmRpb24sXG4gICAgcHJpdmF0ZSBfY2hhbmdlRGV0ZWN0b3JSZWY6IENoYW5nZURldGVjdG9yUmVmLFxuICAgIHByb3RlY3RlZCBfZXhwYW5zaW9uRGlzcGF0Y2hlcjogVW5pcXVlU2VsZWN0aW9uRGlzcGF0Y2hlcixcbiAgKSB7XG4gICAgdGhpcy5fcmVtb3ZlVW5pcXVlU2VsZWN0aW9uTGlzdGVuZXIgPSBfZXhwYW5zaW9uRGlzcGF0Y2hlci5saXN0ZW4oXG4gICAgICAoaWQ6IHN0cmluZywgYWNjb3JkaW9uSWQ6IHN0cmluZykgPT4ge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgdGhpcy5hY2NvcmRpb24gJiZcbiAgICAgICAgICAhdGhpcy5hY2NvcmRpb24ubXVsdGkgJiZcbiAgICAgICAgICB0aGlzLmFjY29yZGlvbi5pZCA9PT0gYWNjb3JkaW9uSWQgJiZcbiAgICAgICAgICB0aGlzLmlkICE9PSBpZFxuICAgICAgICApIHtcbiAgICAgICAgICB0aGlzLmV4cGFuZGVkID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgKTtcblxuICAgIC8vIFdoZW4gYW4gYWNjb3JkaW9uIGl0ZW0gaXMgaG9zdGVkIGluIGFuIGFjY29yZGlvbiwgc3Vic2NyaWJlIHRvIG9wZW4vY2xvc2UgZXZlbnRzLlxuICAgIGlmICh0aGlzLmFjY29yZGlvbikge1xuICAgICAgdGhpcy5fb3BlbkNsb3NlQWxsU3Vic2NyaXB0aW9uID0gdGhpcy5fc3Vic2NyaWJlVG9PcGVuQ2xvc2VBbGxBY3Rpb25zKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEVtaXRzIGFuIGV2ZW50IGZvciB0aGUgYWNjb3JkaW9uIGl0ZW0gYmVpbmcgZGVzdHJveWVkLiAqL1xuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLm9wZW5lZC5jb21wbGV0ZSgpO1xuICAgIHRoaXMuY2xvc2VkLmNvbXBsZXRlKCk7XG4gICAgdGhpcy5kZXN0cm95ZWQuZW1pdCgpO1xuICAgIHRoaXMuZGVzdHJveWVkLmNvbXBsZXRlKCk7XG4gICAgdGhpcy5fcmVtb3ZlVW5pcXVlU2VsZWN0aW9uTGlzdGVuZXIoKTtcbiAgICB0aGlzLl9vcGVuQ2xvc2VBbGxTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgfVxuXG4gIC8qKiBUb2dnbGVzIHRoZSBleHBhbmRlZCBzdGF0ZSBvZiB0aGUgYWNjb3JkaW9uIGl0ZW0uICovXG4gIHRvZ2dsZSgpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuZGlzYWJsZWQpIHtcbiAgICAgIHRoaXMuZXhwYW5kZWQgPSAhdGhpcy5leHBhbmRlZDtcbiAgICB9XG4gIH1cblxuICAvKiogU2V0cyB0aGUgZXhwYW5kZWQgc3RhdGUgb2YgdGhlIGFjY29yZGlvbiBpdGVtIHRvIGZhbHNlLiAqL1xuICBjbG9zZSgpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuZGlzYWJsZWQpIHtcbiAgICAgIHRoaXMuZXhwYW5kZWQgPSBmYWxzZTtcbiAgICB9XG4gIH1cblxuICAvKiogU2V0cyB0aGUgZXhwYW5kZWQgc3RhdGUgb2YgdGhlIGFjY29yZGlvbiBpdGVtIHRvIHRydWUuICovXG4gIG9wZW4oKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmRpc2FibGVkKSB7XG4gICAgICB0aGlzLmV4cGFuZGVkID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9zdWJzY3JpYmVUb09wZW5DbG9zZUFsbEFjdGlvbnMoKTogU3Vic2NyaXB0aW9uIHtcbiAgICByZXR1cm4gdGhpcy5hY2NvcmRpb24uX29wZW5DbG9zZUFsbEFjdGlvbnMuc3Vic2NyaWJlKGV4cGFuZGVkID0+IHtcbiAgICAgIC8vIE9ubHkgY2hhbmdlIGV4cGFuZGVkIHN0YXRlIGlmIGl0ZW0gaXMgZW5hYmxlZFxuICAgICAgaWYgKCF0aGlzLmRpc2FibGVkKSB7XG4gICAgICAgIHRoaXMuZXhwYW5kZWQgPSBleHBhbmRlZDtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuIl19