/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Optional, Self } from '@angular/core';
import { ControlContainer } from './control_container';
import { NgControl } from './ng_control';
export class AbstractControlStatus {
    constructor(cd) {
        this._cd = cd;
    }
    is(status) {
        var _a, _b;
        return !!((_b = (_a = this._cd) === null || _a === void 0 ? void 0 : _a.control) === null || _b === void 0 ? void 0 : _b[status]);
    }
}
export const ngControlStatusHost = {
    '[class.ng-untouched]': 'is("untouched")',
    '[class.ng-touched]': 'is("touched")',
    '[class.ng-pristine]': 'is("pristine")',
    '[class.ng-dirty]': 'is("dirty")',
    '[class.ng-valid]': 'is("valid")',
    '[class.ng-invalid]': 'is("invalid")',
    '[class.ng-pending]': 'is("pending")',
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
}
NgControlStatus.decorators = [
    { type: Directive, args: [{ selector: '[formControlName],[ngModel],[formControl]', host: ngControlStatusHost },] }
];
NgControlStatus.ctorParameters = () => [
    { type: NgControl, decorators: [{ type: Self }] }
];
/**
 * @description
 * Directive automatically applied to Angular form groups that sets CSS classes
 * based on control status (valid/invalid/dirty/etc).
 *
 * @see `NgControlStatus`
 *
 * @ngModule ReactiveFormsModule
 * @ngModule FormsModule
 * @publicApi
 */
export class NgControlStatusGroup extends AbstractControlStatus {
    constructor(cd) {
        super(cd);
    }
}
NgControlStatusGroup.decorators = [
    { type: Directive, args: [{
                selector: '[formGroupName],[formArrayName],[ngModelGroup],[formGroup],form:not([ngNoForm]),[ngForm]',
                host: ngControlStatusHost
            },] }
];
NgControlStatusGroup.ctorParameters = () => [
    { type: ControlContainer, decorators: [{ type: Optional }, { type: Self }] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfY29udHJvbF9zdGF0dXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9mb3Jtcy9zcmMvZGlyZWN0aXZlcy9uZ19jb250cm9sX3N0YXR1cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFHeEQsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDckQsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUl2QyxNQUFNLE9BQU8scUJBQXFCO0lBR2hDLFlBQVksRUFBaUM7UUFDM0MsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUM7SUFDaEIsQ0FBQztJQUVELEVBQUUsQ0FBQyxNQUF3Qjs7UUFDekIsT0FBTyxDQUFDLENBQUMsQ0FBQSxNQUFBLE1BQUEsSUFBSSxDQUFDLEdBQUcsMENBQUUsT0FBTywwQ0FBRyxNQUFNLENBQUMsQ0FBQSxDQUFDO0lBQ3ZDLENBQUM7Q0FDRjtBQUVELE1BQU0sQ0FBQyxNQUFNLG1CQUFtQixHQUFHO0lBQ2pDLHNCQUFzQixFQUFFLGlCQUFpQjtJQUN6QyxvQkFBb0IsRUFBRSxlQUFlO0lBQ3JDLHFCQUFxQixFQUFFLGdCQUFnQjtJQUN2QyxrQkFBa0IsRUFBRSxhQUFhO0lBQ2pDLGtCQUFrQixFQUFFLGFBQWE7SUFDakMsb0JBQW9CLEVBQUUsZUFBZTtJQUNyQyxvQkFBb0IsRUFBRSxlQUFlO0NBQ3RDLENBQUM7QUFFRjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXNCRztBQUVILE1BQU0sT0FBTyxlQUFnQixTQUFRLHFCQUFxQjtJQUN4RCxZQUFvQixFQUFhO1FBQy9CLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNaLENBQUM7OztZQUpGLFNBQVMsU0FBQyxFQUFDLFFBQVEsRUFBRSwyQ0FBMkMsRUFBRSxJQUFJLEVBQUUsbUJBQW1CLEVBQUM7OztZQWpEckYsU0FBUyx1QkFtREYsSUFBSTs7QUFLbkI7Ozs7Ozs7Ozs7R0FVRztBQU1ILE1BQU0sT0FBTyxvQkFBcUIsU0FBUSxxQkFBcUI7SUFDN0QsWUFBZ0MsRUFBb0I7UUFDbEQsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ1osQ0FBQzs7O1lBUkYsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFDSiwwRkFBMEY7Z0JBQzlGLElBQUksRUFBRSxtQkFBbUI7YUFDMUI7OztZQXhFTyxnQkFBZ0IsdUJBMEVULFFBQVEsWUFBSSxJQUFJIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aXZlLCBPcHRpb25hbCwgU2VsZn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7QWJzdHJhY3RDb250cm9sRGlyZWN0aXZlfSBmcm9tICcuL2Fic3RyYWN0X2NvbnRyb2xfZGlyZWN0aXZlJztcbmltcG9ydCB7Q29udHJvbENvbnRhaW5lcn0gZnJvbSAnLi9jb250cm9sX2NvbnRhaW5lcic7XG5pbXBvcnQge05nQ29udHJvbH0gZnJvbSAnLi9uZ19jb250cm9sJztcblxudHlwZSBBbnlDb250cm9sU3RhdHVzID0gJ3VudG91Y2hlZCd8J3RvdWNoZWQnfCdwcmlzdGluZSd8J2RpcnR5J3wndmFsaWQnfCdpbnZhbGlkJ3wncGVuZGluZyc7XG5cbmV4cG9ydCBjbGFzcyBBYnN0cmFjdENvbnRyb2xTdGF0dXMge1xuICBwcml2YXRlIF9jZDogQWJzdHJhY3RDb250cm9sRGlyZWN0aXZlfG51bGw7XG5cbiAgY29uc3RydWN0b3IoY2Q6IEFic3RyYWN0Q29udHJvbERpcmVjdGl2ZXxudWxsKSB7XG4gICAgdGhpcy5fY2QgPSBjZDtcbiAgfVxuXG4gIGlzKHN0YXR1czogQW55Q29udHJvbFN0YXR1cyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhIXRoaXMuX2NkPy5jb250cm9sPy5bc3RhdHVzXTtcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgbmdDb250cm9sU3RhdHVzSG9zdCA9IHtcbiAgJ1tjbGFzcy5uZy11bnRvdWNoZWRdJzogJ2lzKFwidW50b3VjaGVkXCIpJyxcbiAgJ1tjbGFzcy5uZy10b3VjaGVkXSc6ICdpcyhcInRvdWNoZWRcIiknLFxuICAnW2NsYXNzLm5nLXByaXN0aW5lXSc6ICdpcyhcInByaXN0aW5lXCIpJyxcbiAgJ1tjbGFzcy5uZy1kaXJ0eV0nOiAnaXMoXCJkaXJ0eVwiKScsXG4gICdbY2xhc3MubmctdmFsaWRdJzogJ2lzKFwidmFsaWRcIiknLFxuICAnW2NsYXNzLm5nLWludmFsaWRdJzogJ2lzKFwiaW52YWxpZFwiKScsXG4gICdbY2xhc3MubmctcGVuZGluZ10nOiAnaXMoXCJwZW5kaW5nXCIpJyxcbn07XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uXG4gKiBEaXJlY3RpdmUgYXV0b21hdGljYWxseSBhcHBsaWVkIHRvIEFuZ3VsYXIgZm9ybSBjb250cm9scyB0aGF0IHNldHMgQ1NTIGNsYXNzZXNcbiAqIGJhc2VkIG9uIGNvbnRyb2wgc3RhdHVzLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogIyMjIENTUyBjbGFzc2VzIGFwcGxpZWRcbiAqXG4gKiBUaGUgZm9sbG93aW5nIGNsYXNzZXMgYXJlIGFwcGxpZWQgYXMgdGhlIHByb3BlcnRpZXMgYmVjb21lIHRydWU6XG4gKlxuICogKiBuZy12YWxpZFxuICogKiBuZy1pbnZhbGlkXG4gKiAqIG5nLXBlbmRpbmdcbiAqICogbmctcHJpc3RpbmVcbiAqICogbmctZGlydHlcbiAqICogbmctdW50b3VjaGVkXG4gKiAqIG5nLXRvdWNoZWRcbiAqXG4gKiBAbmdNb2R1bGUgUmVhY3RpdmVGb3Jtc01vZHVsZVxuICogQG5nTW9kdWxlIEZvcm1zTW9kdWxlXG4gKiBAcHVibGljQXBpXG4gKi9cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnW2Zvcm1Db250cm9sTmFtZV0sW25nTW9kZWxdLFtmb3JtQ29udHJvbF0nLCBob3N0OiBuZ0NvbnRyb2xTdGF0dXNIb3N0fSlcbmV4cG9ydCBjbGFzcyBOZ0NvbnRyb2xTdGF0dXMgZXh0ZW5kcyBBYnN0cmFjdENvbnRyb2xTdGF0dXMge1xuICBjb25zdHJ1Y3RvcihAU2VsZigpIGNkOiBOZ0NvbnRyb2wpIHtcbiAgICBzdXBlcihjZCk7XG4gIH1cbn1cblxuLyoqXG4gKiBAZGVzY3JpcHRpb25cbiAqIERpcmVjdGl2ZSBhdXRvbWF0aWNhbGx5IGFwcGxpZWQgdG8gQW5ndWxhciBmb3JtIGdyb3VwcyB0aGF0IHNldHMgQ1NTIGNsYXNzZXNcbiAqIGJhc2VkIG9uIGNvbnRyb2wgc3RhdHVzICh2YWxpZC9pbnZhbGlkL2RpcnR5L2V0YykuXG4gKlxuICogQHNlZSBgTmdDb250cm9sU3RhdHVzYFxuICpcbiAqIEBuZ01vZHVsZSBSZWFjdGl2ZUZvcm1zTW9kdWxlXG4gKiBAbmdNb2R1bGUgRm9ybXNNb2R1bGVcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOlxuICAgICAgJ1tmb3JtR3JvdXBOYW1lXSxbZm9ybUFycmF5TmFtZV0sW25nTW9kZWxHcm91cF0sW2Zvcm1Hcm91cF0sZm9ybTpub3QoW25nTm9Gb3JtXSksW25nRm9ybV0nLFxuICBob3N0OiBuZ0NvbnRyb2xTdGF0dXNIb3N0XG59KVxuZXhwb3J0IGNsYXNzIE5nQ29udHJvbFN0YXR1c0dyb3VwIGV4dGVuZHMgQWJzdHJhY3RDb250cm9sU3RhdHVzIHtcbiAgY29uc3RydWN0b3IoQE9wdGlvbmFsKCkgQFNlbGYoKSBjZDogQ29udHJvbENvbnRhaW5lcikge1xuICAgIHN1cGVyKGNkKTtcbiAgfVxufVxuIl19