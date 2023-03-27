/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { UniqueSelectionDispatcher } from '@angular/cdk/collections';
import { Directive, inject } from '@angular/core';
import { CdkMenuItemSelectable } from './menu-item-selectable';
import { CdkMenuItem } from './menu-item';
import * as i0 from "@angular/core";
/** Counter used to set a unique id and name for a selectable item */
let nextId = 0;
/**
 * A directive providing behavior for the "menuitemradio" ARIA role, which behaves similarly to
 * a conventional radio-button. Any sibling `CdkMenuItemRadio` instances within the same `CdkMenu`
 * or `CdkMenuGroup` comprise a radio group with unique selection enforced.
 */
export class CdkMenuItemRadio extends CdkMenuItemSelectable {
    constructor() {
        super();
        /** The unique selection dispatcher for this radio's `CdkMenuGroup`. */
        this._selectionDispatcher = inject(UniqueSelectionDispatcher);
        /** An ID to identify this radio item to the `UniqueSelectionDispatcher`. */
        this._id = `${nextId++}`;
        this._registerDispatcherListener();
    }
    ngOnDestroy() {
        super.ngOnDestroy();
        this._removeDispatcherListener();
    }
    /**
     * Toggles the checked state of the radio-button.
     * @param options Options the configure how the item is triggered
     *   - keepOpen: specifies that the menu should be kept open after triggering the item.
     */
    trigger(options) {
        super.trigger(options);
        if (!this.disabled) {
            this._selectionDispatcher.notify(this._id, '');
        }
    }
    /** Configure the unique selection dispatcher listener in order to toggle the checked state  */
    _registerDispatcherListener() {
        this._removeDispatcherListener = this._selectionDispatcher.listen((id) => {
            this.checked = this._id === id;
        });
    }
}
CdkMenuItemRadio.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: CdkMenuItemRadio, deps: [], target: i0.ɵɵFactoryTarget.Directive });
CdkMenuItemRadio.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "15.2.0-rc.0", type: CdkMenuItemRadio, isStandalone: true, selector: "[cdkMenuItemRadio]", host: { attributes: { "role": "menuitemradio" }, properties: { "class.cdk-menu-item-radio": "true" } }, providers: [
        { provide: CdkMenuItemSelectable, useExisting: CdkMenuItemRadio },
        { provide: CdkMenuItem, useExisting: CdkMenuItemSelectable },
    ], exportAs: ["cdkMenuItemRadio"], usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: CdkMenuItemRadio, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkMenuItemRadio]',
                    exportAs: 'cdkMenuItemRadio',
                    standalone: true,
                    host: {
                        'role': 'menuitemradio',
                        '[class.cdk-menu-item-radio]': 'true',
                    },
                    providers: [
                        { provide: CdkMenuItemSelectable, useExisting: CdkMenuItemRadio },
                        { provide: CdkMenuItem, useExisting: CdkMenuItemSelectable },
                    ],
                }]
        }], ctorParameters: function () { return []; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1pdGVtLXJhZGlvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9tZW51L21lbnUtaXRlbS1yYWRpby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMseUJBQXlCLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUNuRSxPQUFPLEVBQUMsU0FBUyxFQUFFLE1BQU0sRUFBWSxNQUFNLGVBQWUsQ0FBQztBQUMzRCxPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUM3RCxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sYUFBYSxDQUFDOztBQUV4QyxxRUFBcUU7QUFDckUsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBRWY7Ozs7R0FJRztBQWNILE1BQU0sT0FBTyxnQkFBaUIsU0FBUSxxQkFBcUI7SUFVekQ7UUFDRSxLQUFLLEVBQUUsQ0FBQztRQVZWLHVFQUF1RTtRQUN0RCx5QkFBb0IsR0FBRyxNQUFNLENBQUMseUJBQXlCLENBQUMsQ0FBQztRQUUxRSw0RUFBNEU7UUFDcEUsUUFBRyxHQUFHLEdBQUcsTUFBTSxFQUFFLEVBQUUsQ0FBQztRQU8xQixJQUFJLENBQUMsMkJBQTJCLEVBQUUsQ0FBQztJQUNyQyxDQUFDO0lBRVEsV0FBVztRQUNsQixLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7UUFFcEIsSUFBSSxDQUFDLHlCQUF5QixFQUFFLENBQUM7SUFDbkMsQ0FBQztJQUVEOzs7O09BSUc7SUFDTSxPQUFPLENBQUMsT0FBNkI7UUFDNUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUV2QixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNsQixJQUFJLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7U0FDaEQ7SUFDSCxDQUFDO0lBRUQsK0ZBQStGO0lBQ3ZGLDJCQUEyQjtRQUNqQyxJQUFJLENBQUMseUJBQXlCLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQVUsRUFBRSxFQUFFO1lBQy9FLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsS0FBSyxFQUFFLENBQUM7UUFDakMsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDOztrSEF2Q1UsZ0JBQWdCO3NHQUFoQixnQkFBZ0IseUtBTGhCO1FBQ1QsRUFBQyxPQUFPLEVBQUUscUJBQXFCLEVBQUUsV0FBVyxFQUFFLGdCQUFnQixFQUFDO1FBQy9ELEVBQUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUscUJBQXFCLEVBQUM7S0FDM0Q7Z0dBRVUsZ0JBQWdCO2tCQWI1QixTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSxvQkFBb0I7b0JBQzlCLFFBQVEsRUFBRSxrQkFBa0I7b0JBQzVCLFVBQVUsRUFBRSxJQUFJO29CQUNoQixJQUFJLEVBQUU7d0JBQ0osTUFBTSxFQUFFLGVBQWU7d0JBQ3ZCLDZCQUE2QixFQUFFLE1BQU07cUJBQ3RDO29CQUNELFNBQVMsRUFBRTt3QkFDVCxFQUFDLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxXQUFXLGtCQUFrQixFQUFDO3dCQUMvRCxFQUFDLE9BQU8sRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLHFCQUFxQixFQUFDO3FCQUMzRDtpQkFDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1VuaXF1ZVNlbGVjdGlvbkRpc3BhdGNoZXJ9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2xsZWN0aW9ucyc7XG5pbXBvcnQge0RpcmVjdGl2ZSwgaW5qZWN0LCBPbkRlc3Ryb3l9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtDZGtNZW51SXRlbVNlbGVjdGFibGV9IGZyb20gJy4vbWVudS1pdGVtLXNlbGVjdGFibGUnO1xuaW1wb3J0IHtDZGtNZW51SXRlbX0gZnJvbSAnLi9tZW51LWl0ZW0nO1xuXG4vKiogQ291bnRlciB1c2VkIHRvIHNldCBhIHVuaXF1ZSBpZCBhbmQgbmFtZSBmb3IgYSBzZWxlY3RhYmxlIGl0ZW0gKi9cbmxldCBuZXh0SWQgPSAwO1xuXG4vKipcbiAqIEEgZGlyZWN0aXZlIHByb3ZpZGluZyBiZWhhdmlvciBmb3IgdGhlIFwibWVudWl0ZW1yYWRpb1wiIEFSSUEgcm9sZSwgd2hpY2ggYmVoYXZlcyBzaW1pbGFybHkgdG9cbiAqIGEgY29udmVudGlvbmFsIHJhZGlvLWJ1dHRvbi4gQW55IHNpYmxpbmcgYENka01lbnVJdGVtUmFkaW9gIGluc3RhbmNlcyB3aXRoaW4gdGhlIHNhbWUgYENka01lbnVgXG4gKiBvciBgQ2RrTWVudUdyb3VwYCBjb21wcmlzZSBhIHJhZGlvIGdyb3VwIHdpdGggdW5pcXVlIHNlbGVjdGlvbiBlbmZvcmNlZC5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka01lbnVJdGVtUmFkaW9dJyxcbiAgZXhwb3J0QXM6ICdjZGtNZW51SXRlbVJhZGlvJyxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbiAgaG9zdDoge1xuICAgICdyb2xlJzogJ21lbnVpdGVtcmFkaW8nLFxuICAgICdbY2xhc3MuY2RrLW1lbnUtaXRlbS1yYWRpb10nOiAndHJ1ZScsXG4gIH0sXG4gIHByb3ZpZGVyczogW1xuICAgIHtwcm92aWRlOiBDZGtNZW51SXRlbVNlbGVjdGFibGUsIHVzZUV4aXN0aW5nOiBDZGtNZW51SXRlbVJhZGlvfSxcbiAgICB7cHJvdmlkZTogQ2RrTWVudUl0ZW0sIHVzZUV4aXN0aW5nOiBDZGtNZW51SXRlbVNlbGVjdGFibGV9LFxuICBdLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtNZW51SXRlbVJhZGlvIGV4dGVuZHMgQ2RrTWVudUl0ZW1TZWxlY3RhYmxlIGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgLyoqIFRoZSB1bmlxdWUgc2VsZWN0aW9uIGRpc3BhdGNoZXIgZm9yIHRoaXMgcmFkaW8ncyBgQ2RrTWVudUdyb3VwYC4gKi9cbiAgcHJpdmF0ZSByZWFkb25seSBfc2VsZWN0aW9uRGlzcGF0Y2hlciA9IGluamVjdChVbmlxdWVTZWxlY3Rpb25EaXNwYXRjaGVyKTtcblxuICAvKiogQW4gSUQgdG8gaWRlbnRpZnkgdGhpcyByYWRpbyBpdGVtIHRvIHRoZSBgVW5pcXVlU2VsZWN0aW9uRGlzcGF0Y2hlcmAuICovXG4gIHByaXZhdGUgX2lkID0gYCR7bmV4dElkKyt9YDtcblxuICAvKiogRnVuY3Rpb24gdG8gdW5yZWdpc3RlciB0aGUgc2VsZWN0aW9uIGRpc3BhdGNoZXIgKi9cbiAgcHJpdmF0ZSBfcmVtb3ZlRGlzcGF0Y2hlckxpc3RlbmVyOiAoKSA9PiB2b2lkO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5fcmVnaXN0ZXJEaXNwYXRjaGVyTGlzdGVuZXIoKTtcbiAgfVxuXG4gIG92ZXJyaWRlIG5nT25EZXN0cm95KCkge1xuICAgIHN1cGVyLm5nT25EZXN0cm95KCk7XG5cbiAgICB0aGlzLl9yZW1vdmVEaXNwYXRjaGVyTGlzdGVuZXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUb2dnbGVzIHRoZSBjaGVja2VkIHN0YXRlIG9mIHRoZSByYWRpby1idXR0b24uXG4gICAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbnMgdGhlIGNvbmZpZ3VyZSBob3cgdGhlIGl0ZW0gaXMgdHJpZ2dlcmVkXG4gICAqICAgLSBrZWVwT3Blbjogc3BlY2lmaWVzIHRoYXQgdGhlIG1lbnUgc2hvdWxkIGJlIGtlcHQgb3BlbiBhZnRlciB0cmlnZ2VyaW5nIHRoZSBpdGVtLlxuICAgKi9cbiAgb3ZlcnJpZGUgdHJpZ2dlcihvcHRpb25zPzoge2tlZXBPcGVuOiBib29sZWFufSkge1xuICAgIHN1cGVyLnRyaWdnZXIob3B0aW9ucyk7XG5cbiAgICBpZiAoIXRoaXMuZGlzYWJsZWQpIHtcbiAgICAgIHRoaXMuX3NlbGVjdGlvbkRpc3BhdGNoZXIubm90aWZ5KHRoaXMuX2lkLCAnJyk7XG4gICAgfVxuICB9XG5cbiAgLyoqIENvbmZpZ3VyZSB0aGUgdW5pcXVlIHNlbGVjdGlvbiBkaXNwYXRjaGVyIGxpc3RlbmVyIGluIG9yZGVyIHRvIHRvZ2dsZSB0aGUgY2hlY2tlZCBzdGF0ZSAgKi9cbiAgcHJpdmF0ZSBfcmVnaXN0ZXJEaXNwYXRjaGVyTGlzdGVuZXIoKSB7XG4gICAgdGhpcy5fcmVtb3ZlRGlzcGF0Y2hlckxpc3RlbmVyID0gdGhpcy5fc2VsZWN0aW9uRGlzcGF0Y2hlci5saXN0ZW4oKGlkOiBzdHJpbmcpID0+IHtcbiAgICAgIHRoaXMuY2hlY2tlZCA9IHRoaXMuX2lkID09PSBpZDtcbiAgICB9KTtcbiAgfVxufVxuIl19