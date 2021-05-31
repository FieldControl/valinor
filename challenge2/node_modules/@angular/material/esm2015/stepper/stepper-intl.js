/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injectable, Optional, SkipSelf } from '@angular/core';
import { Subject } from 'rxjs';
import * as i0 from "@angular/core";
/** Stepper data that is required for internationalization. */
export class MatStepperIntl {
    constructor() {
        /**
         * Stream that emits whenever the labels here are changed. Use this to notify
         * components if the labels have changed after initialization.
         */
        this.changes = new Subject();
        /** Label that is rendered below optional steps. */
        this.optionalLabel = 'Optional';
    }
}
MatStepperIntl.ɵprov = i0.ɵɵdefineInjectable({ factory: function MatStepperIntl_Factory() { return new MatStepperIntl(); }, token: MatStepperIntl, providedIn: "root" });
MatStepperIntl.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
/** @docs-private */
export function MAT_STEPPER_INTL_PROVIDER_FACTORY(parentIntl) {
    return parentIntl || new MatStepperIntl();
}
/** @docs-private */
export const MAT_STEPPER_INTL_PROVIDER = {
    provide: MatStepperIntl,
    deps: [[new Optional(), new SkipSelf(), MatStepperIntl]],
    useFactory: MAT_STEPPER_INTL_PROVIDER_FACTORY
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RlcHBlci1pbnRsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL3N0ZXBwZXIvc3RlcHBlci1pbnRsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxVQUFVLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUM3RCxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDOztBQUc3Qiw4REFBOEQ7QUFFOUQsTUFBTSxPQUFPLGNBQWM7SUFEM0I7UUFFRTs7O1dBR0c7UUFDTSxZQUFPLEdBQWtCLElBQUksT0FBTyxFQUFRLENBQUM7UUFFdEQsbURBQW1EO1FBQ25ELGtCQUFhLEdBQVcsVUFBVSxDQUFDO0tBQ3BDOzs7O1lBVkEsVUFBVSxTQUFDLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQzs7QUFhaEMsb0JBQW9CO0FBQ3BCLE1BQU0sVUFBVSxpQ0FBaUMsQ0FBQyxVQUEwQjtJQUMxRSxPQUFPLFVBQVUsSUFBSSxJQUFJLGNBQWMsRUFBRSxDQUFDO0FBQzVDLENBQUM7QUFFRCxvQkFBb0I7QUFDcEIsTUFBTSxDQUFDLE1BQU0seUJBQXlCLEdBQUc7SUFDdkMsT0FBTyxFQUFFLGNBQWM7SUFDdkIsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLFFBQVEsRUFBRSxFQUFFLElBQUksUUFBUSxFQUFFLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFDeEQsVUFBVSxFQUFFLGlDQUFpQztDQUM5QyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0YWJsZSwgT3B0aW9uYWwsIFNraXBTZWxmfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7U3ViamVjdH0gZnJvbSAncnhqcyc7XG5cblxuLyoqIFN0ZXBwZXIgZGF0YSB0aGF0IGlzIHJlcXVpcmVkIGZvciBpbnRlcm5hdGlvbmFsaXphdGlvbi4gKi9cbkBJbmplY3RhYmxlKHtwcm92aWRlZEluOiAncm9vdCd9KVxuZXhwb3J0IGNsYXNzIE1hdFN0ZXBwZXJJbnRsIHtcbiAgLyoqXG4gICAqIFN0cmVhbSB0aGF0IGVtaXRzIHdoZW5ldmVyIHRoZSBsYWJlbHMgaGVyZSBhcmUgY2hhbmdlZC4gVXNlIHRoaXMgdG8gbm90aWZ5XG4gICAqIGNvbXBvbmVudHMgaWYgdGhlIGxhYmVscyBoYXZlIGNoYW5nZWQgYWZ0ZXIgaW5pdGlhbGl6YXRpb24uXG4gICAqL1xuICByZWFkb25seSBjaGFuZ2VzOiBTdWJqZWN0PHZvaWQ+ID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcblxuICAvKiogTGFiZWwgdGhhdCBpcyByZW5kZXJlZCBiZWxvdyBvcHRpb25hbCBzdGVwcy4gKi9cbiAgb3B0aW9uYWxMYWJlbDogc3RyaW5nID0gJ09wdGlvbmFsJztcbn1cblxuXG4vKiogQGRvY3MtcHJpdmF0ZSAqL1xuZXhwb3J0IGZ1bmN0aW9uIE1BVF9TVEVQUEVSX0lOVExfUFJPVklERVJfRkFDVE9SWShwYXJlbnRJbnRsOiBNYXRTdGVwcGVySW50bCkge1xuICByZXR1cm4gcGFyZW50SW50bCB8fCBuZXcgTWF0U3RlcHBlckludGwoKTtcbn1cblxuLyoqIEBkb2NzLXByaXZhdGUgKi9cbmV4cG9ydCBjb25zdCBNQVRfU1RFUFBFUl9JTlRMX1BST1ZJREVSID0ge1xuICBwcm92aWRlOiBNYXRTdGVwcGVySW50bCxcbiAgZGVwczogW1tuZXcgT3B0aW9uYWwoKSwgbmV3IFNraXBTZWxmKCksIE1hdFN0ZXBwZXJJbnRsXV0sXG4gIHVzZUZhY3Rvcnk6IE1BVF9TVEVQUEVSX0lOVExfUFJPVklERVJfRkFDVE9SWVxufTtcbiJdfQ==