/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Directive, Input } from '@angular/core';
import { CdkMenuItem } from './menu-item';
import * as i0 from "@angular/core";
/** Base class providing checked state for selectable MenuItems. */
export class CdkMenuItemSelectable extends CdkMenuItem {
    constructor() {
        super(...arguments);
        this._checked = false;
        /** Whether the item should close the menu if triggered by the spacebar. */
        this.closeOnSpacebarTrigger = false;
    }
    /** Whether the element is checked */
    get checked() {
        return this._checked;
    }
    set checked(value) {
        this._checked = coerceBooleanProperty(value);
    }
}
CdkMenuItemSelectable.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: CdkMenuItemSelectable, deps: null, target: i0.ɵɵFactoryTarget.Directive });
CdkMenuItemSelectable.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "15.2.0-rc.0", type: CdkMenuItemSelectable, inputs: { checked: ["cdkMenuItemChecked", "checked"] }, host: { properties: { "attr.aria-checked": "!!checked", "attr.aria-disabled": "disabled || null" } }, usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: CdkMenuItemSelectable, decorators: [{
            type: Directive,
            args: [{
                    host: {
                        '[attr.aria-checked]': '!!checked',
                        '[attr.aria-disabled]': 'disabled || null',
                    },
                }]
        }], propDecorators: { checked: [{
                type: Input,
                args: ['cdkMenuItemChecked']
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1pdGVtLXNlbGVjdGFibGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL21lbnUvbWVudS1pdGVtLXNlbGVjdGFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFlLHFCQUFxQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDMUUsT0FBTyxFQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDL0MsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLGFBQWEsQ0FBQzs7QUFFeEMsbUVBQW1FO0FBT25FLE1BQU0sT0FBZ0IscUJBQXNCLFNBQVEsV0FBVztJQU4vRDs7UUFlVSxhQUFRLEdBQUcsS0FBSyxDQUFDO1FBRXpCLDJFQUEyRTtRQUN4RCwyQkFBc0IsR0FBRyxLQUFLLENBQUM7S0FDbkQ7SUFaQyxxQ0FBcUM7SUFDckMsSUFDSSxPQUFPO1FBQ1QsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0lBQ3ZCLENBQUM7SUFDRCxJQUFJLE9BQU8sQ0FBQyxLQUFtQjtRQUM3QixJQUFJLENBQUMsUUFBUSxHQUFHLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQy9DLENBQUM7O3VIQVJtQixxQkFBcUI7MkdBQXJCLHFCQUFxQjtnR0FBckIscUJBQXFCO2tCQU4xQyxTQUFTO21CQUFDO29CQUNULElBQUksRUFBRTt3QkFDSixxQkFBcUIsRUFBRSxXQUFXO3dCQUNsQyxzQkFBc0IsRUFBRSxrQkFBa0I7cUJBQzNDO2lCQUNGOzhCQUlLLE9BQU87c0JBRFYsS0FBSzt1QkFBQyxvQkFBb0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtCb29sZWFuSW5wdXQsIGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcbmltcG9ydCB7RGlyZWN0aXZlLCBJbnB1dH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0Nka01lbnVJdGVtfSBmcm9tICcuL21lbnUtaXRlbSc7XG5cbi8qKiBCYXNlIGNsYXNzIHByb3ZpZGluZyBjaGVja2VkIHN0YXRlIGZvciBzZWxlY3RhYmxlIE1lbnVJdGVtcy4gKi9cbkBEaXJlY3RpdmUoe1xuICBob3N0OiB7XG4gICAgJ1thdHRyLmFyaWEtY2hlY2tlZF0nOiAnISFjaGVja2VkJyxcbiAgICAnW2F0dHIuYXJpYS1kaXNhYmxlZF0nOiAnZGlzYWJsZWQgfHwgbnVsbCcsXG4gIH0sXG59KVxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIENka01lbnVJdGVtU2VsZWN0YWJsZSBleHRlbmRzIENka01lbnVJdGVtIHtcbiAgLyoqIFdoZXRoZXIgdGhlIGVsZW1lbnQgaXMgY2hlY2tlZCAqL1xuICBASW5wdXQoJ2Nka01lbnVJdGVtQ2hlY2tlZCcpXG4gIGdldCBjaGVja2VkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9jaGVja2VkO1xuICB9XG4gIHNldCBjaGVja2VkKHZhbHVlOiBCb29sZWFuSW5wdXQpIHtcbiAgICB0aGlzLl9jaGVja2VkID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHZhbHVlKTtcbiAgfVxuICBwcml2YXRlIF9jaGVja2VkID0gZmFsc2U7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGl0ZW0gc2hvdWxkIGNsb3NlIHRoZSBtZW51IGlmIHRyaWdnZXJlZCBieSB0aGUgc3BhY2ViYXIuICovXG4gIHByb3RlY3RlZCBvdmVycmlkZSBjbG9zZU9uU3BhY2ViYXJUcmlnZ2VyID0gZmFsc2U7XG59XG4iXX0=