import { NgModule, Optional } from '@angular/core';
import { AngularFirePerformance } from './performance';
import { PerformanceMonitoringService } from './performance.service';
import firebase from 'firebase/compat/app';
import { VERSION } from '@angular/fire';
import * as i0 from "@angular/core";
import * as i1 from "./performance";
import * as i2 from "./performance.service";
export class AngularFirePerformanceModule {
    constructor(perf, _) {
        firebase.registerVersion('angularfire', VERSION.full, 'perf-compat');
        // call anything here to get perf loading
        // tslint:disable-next-line:no-unused-expression
        perf.dataCollectionEnabled.then(() => { });
    }
}
AngularFirePerformanceModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AngularFirePerformanceModule, deps: [{ token: i1.AngularFirePerformance }, { token: i2.PerformanceMonitoringService, optional: true }], target: i0.ɵɵFactoryTarget.NgModule });
AngularFirePerformanceModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AngularFirePerformanceModule });
AngularFirePerformanceModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AngularFirePerformanceModule, providers: [AngularFirePerformance] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AngularFirePerformanceModule, decorators: [{
            type: NgModule,
            args: [{
                    providers: [AngularFirePerformance]
                }]
        }], ctorParameters: function () { return [{ type: i1.AngularFirePerformance }, { type: i2.PerformanceMonitoringService, decorators: [{
                    type: Optional
                }] }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVyZm9ybWFuY2UubW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NvbXBhdC9wZXJmb3JtYW5jZS9wZXJmb3JtYW5jZS5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDbkQsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3ZELE9BQU8sRUFBRSw0QkFBNEIsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQ3JFLE9BQU8sUUFBUSxNQUFNLHFCQUFxQixDQUFDO0FBQzNDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxlQUFlLENBQUM7Ozs7QUFLeEMsTUFBTSxPQUFPLDRCQUE0QjtJQUN2QyxZQUNFLElBQTRCLEVBQ2hCLENBQStCO1FBRTNDLFFBQVEsQ0FBQyxlQUFlLENBQUMsYUFBYSxFQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFDckUseUNBQXlDO1FBQ3pDLGdEQUFnRDtRQUNoRCxJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzVDLENBQUM7O3lIQVRVLDRCQUE0QjswSEFBNUIsNEJBQTRCOzBIQUE1Qiw0QkFBNEIsYUFGNUIsQ0FBRSxzQkFBc0IsQ0FBRTsyRkFFMUIsNEJBQTRCO2tCQUh4QyxRQUFRO21CQUFDO29CQUNSLFNBQVMsRUFBRSxDQUFFLHNCQUFzQixDQUFFO2lCQUN0Qzs7MEJBSUksUUFBUSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5nTW9kdWxlLCBPcHRpb25hbCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQW5ndWxhckZpcmVQZXJmb3JtYW5jZSB9IGZyb20gJy4vcGVyZm9ybWFuY2UnO1xuaW1wb3J0IHsgUGVyZm9ybWFuY2VNb25pdG9yaW5nU2VydmljZSB9IGZyb20gJy4vcGVyZm9ybWFuY2Uuc2VydmljZSc7XG5pbXBvcnQgZmlyZWJhc2UgZnJvbSAnZmlyZWJhc2UvY29tcGF0L2FwcCc7XG5pbXBvcnQgeyBWRVJTSU9OIH0gZnJvbSAnQGFuZ3VsYXIvZmlyZSc7XG5cbkBOZ01vZHVsZSh7XG4gIHByb3ZpZGVyczogWyBBbmd1bGFyRmlyZVBlcmZvcm1hbmNlIF1cbn0pXG5leHBvcnQgY2xhc3MgQW5ndWxhckZpcmVQZXJmb3JtYW5jZU1vZHVsZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHBlcmY6IEFuZ3VsYXJGaXJlUGVyZm9ybWFuY2UsXG4gICAgQE9wdGlvbmFsKCkgXzogUGVyZm9ybWFuY2VNb25pdG9yaW5nU2VydmljZVxuICApIHtcbiAgICBmaXJlYmFzZS5yZWdpc3RlclZlcnNpb24oJ2FuZ3VsYXJmaXJlJywgVkVSU0lPTi5mdWxsLCAncGVyZi1jb21wYXQnKTtcbiAgICAvLyBjYWxsIGFueXRoaW5nIGhlcmUgdG8gZ2V0IHBlcmYgbG9hZGluZ1xuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby11bnVzZWQtZXhwcmVzc2lvblxuICAgIHBlcmYuZGF0YUNvbGxlY3Rpb25FbmFibGVkLnRoZW4oKCkgPT4ge30pO1xuICB9XG59XG4iXX0=