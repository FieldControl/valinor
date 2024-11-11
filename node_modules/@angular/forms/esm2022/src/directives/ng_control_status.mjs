/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Directive, Optional, Self } from '@angular/core';
import { ControlContainer } from './control_container';
import { NgControl } from './ng_control';
import * as i0 from "@angular/core";
import * as i1 from "./ng_control";
import * as i2 from "./control_container";
// DO NOT REFACTOR!
// Each status is represented by a separate function to make sure that
// advanced Closure Compiler optimizations related to property renaming
// can work correctly.
export class AbstractControlStatus {
    constructor(cd) {
        this._cd = cd;
    }
    get isTouched() {
        // track the touched signal
        this._cd?.control?._touched?.();
        return !!this._cd?.control?.touched;
    }
    get isUntouched() {
        return !!this._cd?.control?.untouched;
    }
    get isPristine() {
        // track the pristine signal
        this._cd?.control?._pristine?.();
        return !!this._cd?.control?.pristine;
    }
    get isDirty() {
        // pristine signal already tracked above
        return !!this._cd?.control?.dirty;
    }
    get isValid() {
        // track the status signal
        this._cd?.control?._status?.();
        return !!this._cd?.control?.valid;
    }
    get isInvalid() {
        // status signal already tracked above
        return !!this._cd?.control?.invalid;
    }
    get isPending() {
        // status signal already tracked above
        return !!this._cd?.control?.pending;
    }
    get isSubmitted() {
        // track the submitted signal
        this._cd?._submitted?.();
        // We check for the `submitted` field from `NgForm` and `FormGroupDirective` classes, but
        // we avoid instanceof checks to prevent non-tree-shakable references to those types.
        return !!this._cd?.submitted;
    }
}
export const ngControlStatusHost = {
    '[class.ng-untouched]': 'isUntouched',
    '[class.ng-touched]': 'isTouched',
    '[class.ng-pristine]': 'isPristine',
    '[class.ng-dirty]': 'isDirty',
    '[class.ng-valid]': 'isValid',
    '[class.ng-invalid]': 'isInvalid',
    '[class.ng-pending]': 'isPending',
};
export const ngGroupStatusHost = {
    ...ngControlStatusHost,
    '[class.ng-submitted]': 'isSubmitted',
};
/**
 * @description
 * Directive automatically applied to Angular form controls that sets CSS classes
 * based on control status.
 *
 * @usageNotes
 *
 * ### CSS classes applied
 *
 * The following classes are applied as the properties become true:
 *
 * * ng-valid
 * * ng-invalid
 * * ng-pending
 * * ng-pristine
 * * ng-dirty
 * * ng-untouched
 * * ng-touched
 *
 * @ngModule ReactiveFormsModule
 * @ngModule FormsModule
 * @publicApi
 */
export class NgControlStatus extends AbstractControlStatus {
    constructor(cd) {
        super(cd);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: NgControlStatus, deps: [{ token: i1.NgControl, self: true }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.7", type: NgControlStatus, selector: "[formControlName],[ngModel],[formControl]", host: { properties: { "class.ng-untouched": "isUntouched", "class.ng-touched": "isTouched", "class.ng-pristine": "isPristine", "class.ng-dirty": "isDirty", "class.ng-valid": "isValid", "class.ng-invalid": "isInvalid", "class.ng-pending": "isPending" } }, usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: NgControlStatus, decorators: [{
            type: Directive,
            args: [{ selector: '[formControlName],[ngModel],[formControl]', host: ngControlStatusHost }]
        }], ctorParameters: () => [{ type: i1.NgControl, decorators: [{
                    type: Self
                }] }] });
/**
 * @description
 * Directive automatically applied to Angular form groups that sets CSS classes
 * based on control status (valid/invalid/dirty/etc). On groups, this includes the additional
 * class ng-submitted.
 *
 * @see {@link NgControlStatus}
 *
 * @ngModule ReactiveFormsModule
 * @ngModule FormsModule
 * @publicApi
 */
export class NgControlStatusGroup extends AbstractControlStatus {
    constructor(cd) {
        super(cd);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: NgControlStatusGroup, deps: [{ token: i2.ControlContainer, optional: true, self: true }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.7", type: NgControlStatusGroup, selector: "[formGroupName],[formArrayName],[ngModelGroup],[formGroup],form:not([ngNoForm]),[ngForm]", host: { properties: { "class.ng-untouched": "isUntouched", "class.ng-touched": "isTouched", "class.ng-pristine": "isPristine", "class.ng-dirty": "isDirty", "class.ng-valid": "isValid", "class.ng-invalid": "isInvalid", "class.ng-pending": "isPending", "class.ng-submitted": "isSubmitted" } }, usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: NgControlStatusGroup, decorators: [{
            type: Directive,
            args: [{
                    selector: '[formGroupName],[formArrayName],[ngModelGroup],[formGroup],form:not([ngNoForm]),[ngForm]',
                    host: ngGroupStatusHost,
                }]
        }], ctorParameters: () => [{ type: i2.ControlContainer, decorators: [{
                    type: Optional
                }, {
                    type: Self
                }] }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfY29udHJvbF9zdGF0dXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9mb3Jtcy9zcmMvZGlyZWN0aXZlcy9uZ19jb250cm9sX3N0YXR1cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQXdCLE1BQU0sZUFBZSxDQUFDO0FBRy9FLE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ3JELE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxjQUFjLENBQUM7Ozs7QUFJdkMsbUJBQW1CO0FBQ25CLHNFQUFzRTtBQUN0RSx1RUFBdUU7QUFDdkUsc0JBQXNCO0FBQ3RCLE1BQU0sT0FBTyxxQkFBcUI7SUFHaEMsWUFBWSxFQUFtQztRQUM3QyxJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQztJQUNoQixDQUFDO0lBRUQsSUFBYyxTQUFTO1FBQ3JCLDJCQUEyQjtRQUMzQixJQUFJLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsRUFBRSxDQUFDO1FBQ2hDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQztJQUN0QyxDQUFDO0lBRUQsSUFBYyxXQUFXO1FBQ3ZCLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLFNBQVMsQ0FBQztJQUN4QyxDQUFDO0lBRUQsSUFBYyxVQUFVO1FBQ3RCLDRCQUE0QjtRQUM1QixJQUFJLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsRUFBRSxDQUFDO1FBQ2pDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQztJQUN2QyxDQUFDO0lBRUQsSUFBYyxPQUFPO1FBQ25CLHdDQUF3QztRQUN4QyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUM7SUFDcEMsQ0FBQztJQUVELElBQWMsT0FBTztRQUNuQiwwQkFBMEI7UUFDMUIsSUFBSSxDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLEVBQUUsQ0FBQztRQUMvQixPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUM7SUFDcEMsQ0FBQztJQUVELElBQWMsU0FBUztRQUNyQixzQ0FBc0M7UUFDdEMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDO0lBQ3RDLENBQUM7SUFFRCxJQUFjLFNBQVM7UUFDckIsc0NBQXNDO1FBQ3RDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQztJQUN0QyxDQUFDO0lBRUQsSUFBYyxXQUFXO1FBQ3ZCLDZCQUE2QjtRQUM1QixJQUFJLENBQUMsR0FBb0QsRUFBRSxVQUFVLEVBQUUsRUFBRSxDQUFDO1FBQzNFLHlGQUF5RjtRQUN6RixxRkFBcUY7UUFDckYsT0FBTyxDQUFDLENBQUUsSUFBSSxDQUFDLEdBQW9ELEVBQUUsU0FBUyxDQUFDO0lBQ2pGLENBQUM7Q0FDRjtBQUVELE1BQU0sQ0FBQyxNQUFNLG1CQUFtQixHQUFHO0lBQ2pDLHNCQUFzQixFQUFFLGFBQWE7SUFDckMsb0JBQW9CLEVBQUUsV0FBVztJQUNqQyxxQkFBcUIsRUFBRSxZQUFZO0lBQ25DLGtCQUFrQixFQUFFLFNBQVM7SUFDN0Isa0JBQWtCLEVBQUUsU0FBUztJQUM3QixvQkFBb0IsRUFBRSxXQUFXO0lBQ2pDLG9CQUFvQixFQUFFLFdBQVc7Q0FDbEMsQ0FBQztBQUVGLE1BQU0sQ0FBQyxNQUFNLGlCQUFpQixHQUFHO0lBQy9CLEdBQUcsbUJBQW1CO0lBQ3RCLHNCQUFzQixFQUFFLGFBQWE7Q0FDdEMsQ0FBQztBQUVGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0JHO0FBRUgsTUFBTSxPQUFPLGVBQWdCLFNBQVEscUJBQXFCO0lBQ3hELFlBQW9CLEVBQWE7UUFDL0IsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ1osQ0FBQzt5SEFIVSxlQUFlOzZHQUFmLGVBQWU7O3NHQUFmLGVBQWU7a0JBRDNCLFNBQVM7bUJBQUMsRUFBQyxRQUFRLEVBQUUsMkNBQTJDLEVBQUUsSUFBSSxFQUFFLG1CQUFtQixFQUFDOzswQkFFOUUsSUFBSTs7QUFLbkI7Ozs7Ozs7Ozs7O0dBV0c7QUFNSCxNQUFNLE9BQU8sb0JBQXFCLFNBQVEscUJBQXFCO0lBQzdELFlBQWdDLEVBQW9CO1FBQ2xELEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNaLENBQUM7eUhBSFUsb0JBQW9COzZHQUFwQixvQkFBb0I7O3NHQUFwQixvQkFBb0I7a0JBTGhDLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUNOLDBGQUEwRjtvQkFDNUYsSUFBSSxFQUFFLGlCQUFpQjtpQkFDeEI7OzBCQUVjLFFBQVE7OzBCQUFJLElBQUkiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aXZlLCBPcHRpb25hbCwgU2VsZiwgybVXcml0YWJsZSBhcyBXcml0YWJsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7QWJzdHJhY3RDb250cm9sRGlyZWN0aXZlfSBmcm9tICcuL2Fic3RyYWN0X2NvbnRyb2xfZGlyZWN0aXZlJztcbmltcG9ydCB7Q29udHJvbENvbnRhaW5lcn0gZnJvbSAnLi9jb250cm9sX2NvbnRhaW5lcic7XG5pbXBvcnQge05nQ29udHJvbH0gZnJvbSAnLi9uZ19jb250cm9sJztcbmltcG9ydCB7dHlwZSBOZ0Zvcm19IGZyb20gJy4vbmdfZm9ybSc7XG5pbXBvcnQge3R5cGUgRm9ybUdyb3VwRGlyZWN0aXZlfSBmcm9tICcuL3JlYWN0aXZlX2RpcmVjdGl2ZXMvZm9ybV9ncm91cF9kaXJlY3RpdmUnO1xuXG4vLyBETyBOT1QgUkVGQUNUT1IhXG4vLyBFYWNoIHN0YXR1cyBpcyByZXByZXNlbnRlZCBieSBhIHNlcGFyYXRlIGZ1bmN0aW9uIHRvIG1ha2Ugc3VyZSB0aGF0XG4vLyBhZHZhbmNlZCBDbG9zdXJlIENvbXBpbGVyIG9wdGltaXphdGlvbnMgcmVsYXRlZCB0byBwcm9wZXJ0eSByZW5hbWluZ1xuLy8gY2FuIHdvcmsgY29ycmVjdGx5LlxuZXhwb3J0IGNsYXNzIEFic3RyYWN0Q29udHJvbFN0YXR1cyB7XG4gIHByaXZhdGUgX2NkOiBBYnN0cmFjdENvbnRyb2xEaXJlY3RpdmUgfCBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKGNkOiBBYnN0cmFjdENvbnRyb2xEaXJlY3RpdmUgfCBudWxsKSB7XG4gICAgdGhpcy5fY2QgPSBjZDtcbiAgfVxuXG4gIHByb3RlY3RlZCBnZXQgaXNUb3VjaGVkKCkge1xuICAgIC8vIHRyYWNrIHRoZSB0b3VjaGVkIHNpZ25hbFxuICAgIHRoaXMuX2NkPy5jb250cm9sPy5fdG91Y2hlZD8uKCk7XG4gICAgcmV0dXJuICEhdGhpcy5fY2Q/LmNvbnRyb2w/LnRvdWNoZWQ7XG4gIH1cblxuICBwcm90ZWN0ZWQgZ2V0IGlzVW50b3VjaGVkKCkge1xuICAgIHJldHVybiAhIXRoaXMuX2NkPy5jb250cm9sPy51bnRvdWNoZWQ7XG4gIH1cblxuICBwcm90ZWN0ZWQgZ2V0IGlzUHJpc3RpbmUoKSB7XG4gICAgLy8gdHJhY2sgdGhlIHByaXN0aW5lIHNpZ25hbFxuICAgIHRoaXMuX2NkPy5jb250cm9sPy5fcHJpc3RpbmU/LigpO1xuICAgIHJldHVybiAhIXRoaXMuX2NkPy5jb250cm9sPy5wcmlzdGluZTtcbiAgfVxuXG4gIHByb3RlY3RlZCBnZXQgaXNEaXJ0eSgpIHtcbiAgICAvLyBwcmlzdGluZSBzaWduYWwgYWxyZWFkeSB0cmFja2VkIGFib3ZlXG4gICAgcmV0dXJuICEhdGhpcy5fY2Q/LmNvbnRyb2w/LmRpcnR5O1xuICB9XG5cbiAgcHJvdGVjdGVkIGdldCBpc1ZhbGlkKCkge1xuICAgIC8vIHRyYWNrIHRoZSBzdGF0dXMgc2lnbmFsXG4gICAgdGhpcy5fY2Q/LmNvbnRyb2w/Ll9zdGF0dXM/LigpO1xuICAgIHJldHVybiAhIXRoaXMuX2NkPy5jb250cm9sPy52YWxpZDtcbiAgfVxuXG4gIHByb3RlY3RlZCBnZXQgaXNJbnZhbGlkKCkge1xuICAgIC8vIHN0YXR1cyBzaWduYWwgYWxyZWFkeSB0cmFja2VkIGFib3ZlXG4gICAgcmV0dXJuICEhdGhpcy5fY2Q/LmNvbnRyb2w/LmludmFsaWQ7XG4gIH1cblxuICBwcm90ZWN0ZWQgZ2V0IGlzUGVuZGluZygpIHtcbiAgICAvLyBzdGF0dXMgc2lnbmFsIGFscmVhZHkgdHJhY2tlZCBhYm92ZVxuICAgIHJldHVybiAhIXRoaXMuX2NkPy5jb250cm9sPy5wZW5kaW5nO1xuICB9XG5cbiAgcHJvdGVjdGVkIGdldCBpc1N1Ym1pdHRlZCgpIHtcbiAgICAvLyB0cmFjayB0aGUgc3VibWl0dGVkIHNpZ25hbFxuICAgICh0aGlzLl9jZCBhcyBXcml0YWJsZTxOZ0Zvcm0gfCBGb3JtR3JvdXBEaXJlY3RpdmU+IHwgbnVsbCk/Ll9zdWJtaXR0ZWQ/LigpO1xuICAgIC8vIFdlIGNoZWNrIGZvciB0aGUgYHN1Ym1pdHRlZGAgZmllbGQgZnJvbSBgTmdGb3JtYCBhbmQgYEZvcm1Hcm91cERpcmVjdGl2ZWAgY2xhc3NlcywgYnV0XG4gICAgLy8gd2UgYXZvaWQgaW5zdGFuY2VvZiBjaGVja3MgdG8gcHJldmVudCBub24tdHJlZS1zaGFrYWJsZSByZWZlcmVuY2VzIHRvIHRob3NlIHR5cGVzLlxuICAgIHJldHVybiAhISh0aGlzLl9jZCBhcyBXcml0YWJsZTxOZ0Zvcm0gfCBGb3JtR3JvdXBEaXJlY3RpdmU+IHwgbnVsbCk/LnN1Ym1pdHRlZDtcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgbmdDb250cm9sU3RhdHVzSG9zdCA9IHtcbiAgJ1tjbGFzcy5uZy11bnRvdWNoZWRdJzogJ2lzVW50b3VjaGVkJyxcbiAgJ1tjbGFzcy5uZy10b3VjaGVkXSc6ICdpc1RvdWNoZWQnLFxuICAnW2NsYXNzLm5nLXByaXN0aW5lXSc6ICdpc1ByaXN0aW5lJyxcbiAgJ1tjbGFzcy5uZy1kaXJ0eV0nOiAnaXNEaXJ0eScsXG4gICdbY2xhc3MubmctdmFsaWRdJzogJ2lzVmFsaWQnLFxuICAnW2NsYXNzLm5nLWludmFsaWRdJzogJ2lzSW52YWxpZCcsXG4gICdbY2xhc3MubmctcGVuZGluZ10nOiAnaXNQZW5kaW5nJyxcbn07XG5cbmV4cG9ydCBjb25zdCBuZ0dyb3VwU3RhdHVzSG9zdCA9IHtcbiAgLi4ubmdDb250cm9sU3RhdHVzSG9zdCxcbiAgJ1tjbGFzcy5uZy1zdWJtaXR0ZWRdJzogJ2lzU3VibWl0dGVkJyxcbn07XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uXG4gKiBEaXJlY3RpdmUgYXV0b21hdGljYWxseSBhcHBsaWVkIHRvIEFuZ3VsYXIgZm9ybSBjb250cm9scyB0aGF0IHNldHMgQ1NTIGNsYXNzZXNcbiAqIGJhc2VkIG9uIGNvbnRyb2wgc3RhdHVzLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogIyMjIENTUyBjbGFzc2VzIGFwcGxpZWRcbiAqXG4gKiBUaGUgZm9sbG93aW5nIGNsYXNzZXMgYXJlIGFwcGxpZWQgYXMgdGhlIHByb3BlcnRpZXMgYmVjb21lIHRydWU6XG4gKlxuICogKiBuZy12YWxpZFxuICogKiBuZy1pbnZhbGlkXG4gKiAqIG5nLXBlbmRpbmdcbiAqICogbmctcHJpc3RpbmVcbiAqICogbmctZGlydHlcbiAqICogbmctdW50b3VjaGVkXG4gKiAqIG5nLXRvdWNoZWRcbiAqXG4gKiBAbmdNb2R1bGUgUmVhY3RpdmVGb3Jtc01vZHVsZVxuICogQG5nTW9kdWxlIEZvcm1zTW9kdWxlXG4gKiBAcHVibGljQXBpXG4gKi9cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnW2Zvcm1Db250cm9sTmFtZV0sW25nTW9kZWxdLFtmb3JtQ29udHJvbF0nLCBob3N0OiBuZ0NvbnRyb2xTdGF0dXNIb3N0fSlcbmV4cG9ydCBjbGFzcyBOZ0NvbnRyb2xTdGF0dXMgZXh0ZW5kcyBBYnN0cmFjdENvbnRyb2xTdGF0dXMge1xuICBjb25zdHJ1Y3RvcihAU2VsZigpIGNkOiBOZ0NvbnRyb2wpIHtcbiAgICBzdXBlcihjZCk7XG4gIH1cbn1cblxuLyoqXG4gKiBAZGVzY3JpcHRpb25cbiAqIERpcmVjdGl2ZSBhdXRvbWF0aWNhbGx5IGFwcGxpZWQgdG8gQW5ndWxhciBmb3JtIGdyb3VwcyB0aGF0IHNldHMgQ1NTIGNsYXNzZXNcbiAqIGJhc2VkIG9uIGNvbnRyb2wgc3RhdHVzICh2YWxpZC9pbnZhbGlkL2RpcnR5L2V0YykuIE9uIGdyb3VwcywgdGhpcyBpbmNsdWRlcyB0aGUgYWRkaXRpb25hbFxuICogY2xhc3Mgbmctc3VibWl0dGVkLlxuICpcbiAqIEBzZWUge0BsaW5rIE5nQ29udHJvbFN0YXR1c31cbiAqXG4gKiBAbmdNb2R1bGUgUmVhY3RpdmVGb3Jtc01vZHVsZVxuICogQG5nTW9kdWxlIEZvcm1zTW9kdWxlXG4gKiBAcHVibGljQXBpXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjpcbiAgICAnW2Zvcm1Hcm91cE5hbWVdLFtmb3JtQXJyYXlOYW1lXSxbbmdNb2RlbEdyb3VwXSxbZm9ybUdyb3VwXSxmb3JtOm5vdChbbmdOb0Zvcm1dKSxbbmdGb3JtXScsXG4gIGhvc3Q6IG5nR3JvdXBTdGF0dXNIb3N0LFxufSlcbmV4cG9ydCBjbGFzcyBOZ0NvbnRyb2xTdGF0dXNHcm91cCBleHRlbmRzIEFic3RyYWN0Q29udHJvbFN0YXR1cyB7XG4gIGNvbnN0cnVjdG9yKEBPcHRpb25hbCgpIEBTZWxmKCkgY2Q6IENvbnRyb2xDb250YWluZXIpIHtcbiAgICBzdXBlcihjZCk7XG4gIH1cbn1cbiJdfQ==