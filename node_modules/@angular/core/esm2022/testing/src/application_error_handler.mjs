/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ErrorHandler, inject, NgZone, Injectable, InjectionToken } from '@angular/core';
import * as i0 from "@angular/core";
export const RETHROW_APPLICATION_ERRORS = new InjectionToken('rethrow application errors');
export class TestBedApplicationErrorHandler {
    constructor() {
        this.zone = inject(NgZone);
        this.userErrorHandler = inject(ErrorHandler);
        this.whenStableRejectFunctions = new Set();
    }
    handleError(e) {
        try {
            this.zone.runOutsideAngular(() => this.userErrorHandler.handleError(e));
        }
        catch (userError) {
            e = userError;
        }
        // Instead of throwing the error when there are outstanding `fixture.whenStable` promises,
        // reject those promises with the error. This allows developers to write
        // expectAsync(fix.whenStable()).toBeRejected();
        if (this.whenStableRejectFunctions.size > 0) {
            for (const fn of this.whenStableRejectFunctions.values()) {
                fn(e);
            }
            this.whenStableRejectFunctions.clear();
        }
        else {
            throw e;
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: TestBedApplicationErrorHandler, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: TestBedApplicationErrorHandler }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: TestBedApplicationErrorHandler, decorators: [{
            type: Injectable
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbGljYXRpb25fZXJyb3JfaGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvdGVzdGluZy9zcmMvYXBwbGljYXRpb25fZXJyb3JfaGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsWUFBWSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBQyxNQUFNLGVBQWUsQ0FBQzs7QUFFdkYsTUFBTSxDQUFDLE1BQU0sMEJBQTBCLEdBQUcsSUFBSSxjQUFjLENBQVUsNEJBQTRCLENBQUMsQ0FBQztBQUdwRyxNQUFNLE9BQU8sOEJBQThCO0lBRDNDO1FBRW1CLFNBQUksR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdEIscUJBQWdCLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ2hELDhCQUF5QixHQUE4QixJQUFJLEdBQUcsRUFBRSxDQUFDO0tBcUIzRTtJQW5CQyxXQUFXLENBQUMsQ0FBVTtRQUNwQixJQUFJLENBQUM7WUFDSCxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMxRSxDQUFDO1FBQUMsT0FBTyxTQUFrQixFQUFFLENBQUM7WUFDNUIsQ0FBQyxHQUFHLFNBQVMsQ0FBQztRQUNoQixDQUFDO1FBRUQsMEZBQTBGO1FBQzFGLHdFQUF3RTtRQUN4RSxnREFBZ0Q7UUFDaEQsSUFBSSxJQUFJLENBQUMseUJBQXlCLENBQUMsSUFBSSxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQzVDLEtBQUssTUFBTSxFQUFFLElBQUksSUFBSSxDQUFDLHlCQUF5QixDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUM7Z0JBQ3pELEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNSLENBQUM7WUFDRCxJQUFJLENBQUMseUJBQXlCLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDekMsQ0FBQzthQUFNLENBQUM7WUFDTixNQUFNLENBQUMsQ0FBQztRQUNWLENBQUM7SUFDSCxDQUFDO3lIQXZCVSw4QkFBOEI7NkhBQTlCLDhCQUE4Qjs7c0dBQTlCLDhCQUE4QjtrQkFEMUMsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtFcnJvckhhbmRsZXIsIGluamVjdCwgTmdab25lLCBJbmplY3RhYmxlLCBJbmplY3Rpb25Ub2tlbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmV4cG9ydCBjb25zdCBSRVRIUk9XX0FQUExJQ0FUSU9OX0VSUk9SUyA9IG5ldyBJbmplY3Rpb25Ub2tlbjxib29sZWFuPigncmV0aHJvdyBhcHBsaWNhdGlvbiBlcnJvcnMnKTtcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFRlc3RCZWRBcHBsaWNhdGlvbkVycm9ySGFuZGxlciB7XG4gIHByaXZhdGUgcmVhZG9ubHkgem9uZSA9IGluamVjdChOZ1pvbmUpO1xuICBwcml2YXRlIHJlYWRvbmx5IHVzZXJFcnJvckhhbmRsZXIgPSBpbmplY3QoRXJyb3JIYW5kbGVyKTtcbiAgcmVhZG9ubHkgd2hlblN0YWJsZVJlamVjdEZ1bmN0aW9uczogU2V0PChlOiB1bmtub3duKSA9PiB2b2lkPiA9IG5ldyBTZXQoKTtcblxuICBoYW5kbGVFcnJvcihlOiB1bmtub3duKSB7XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuem9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB0aGlzLnVzZXJFcnJvckhhbmRsZXIuaGFuZGxlRXJyb3IoZSkpO1xuICAgIH0gY2F0Y2ggKHVzZXJFcnJvcjogdW5rbm93bikge1xuICAgICAgZSA9IHVzZXJFcnJvcjtcbiAgICB9XG5cbiAgICAvLyBJbnN0ZWFkIG9mIHRocm93aW5nIHRoZSBlcnJvciB3aGVuIHRoZXJlIGFyZSBvdXRzdGFuZGluZyBgZml4dHVyZS53aGVuU3RhYmxlYCBwcm9taXNlcyxcbiAgICAvLyByZWplY3QgdGhvc2UgcHJvbWlzZXMgd2l0aCB0aGUgZXJyb3IuIFRoaXMgYWxsb3dzIGRldmVsb3BlcnMgdG8gd3JpdGVcbiAgICAvLyBleHBlY3RBc3luYyhmaXgud2hlblN0YWJsZSgpKS50b0JlUmVqZWN0ZWQoKTtcbiAgICBpZiAodGhpcy53aGVuU3RhYmxlUmVqZWN0RnVuY3Rpb25zLnNpemUgPiAwKSB7XG4gICAgICBmb3IgKGNvbnN0IGZuIG9mIHRoaXMud2hlblN0YWJsZVJlamVjdEZ1bmN0aW9ucy52YWx1ZXMoKSkge1xuICAgICAgICBmbihlKTtcbiAgICAgIH1cbiAgICAgIHRoaXMud2hlblN0YWJsZVJlamVjdEZ1bmN0aW9ucy5jbGVhcigpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBlO1xuICAgIH1cbiAgfVxufVxuIl19