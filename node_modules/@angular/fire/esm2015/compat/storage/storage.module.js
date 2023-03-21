import { NgModule } from '@angular/core';
import { GetDownloadURLPipeModule } from './pipes/storageUrl.pipe';
import { AngularFireStorage } from './storage';
import firebase from 'firebase/compat/app';
import { VERSION } from '@angular/fire';
import * as i0 from "@angular/core";
export class AngularFireStorageModule {
    constructor() {
        firebase.registerVersion('angularfire', VERSION.full, 'gcs-compat');
    }
}
AngularFireStorageModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AngularFireStorageModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
AngularFireStorageModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AngularFireStorageModule, exports: [GetDownloadURLPipeModule] });
AngularFireStorageModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AngularFireStorageModule, providers: [AngularFireStorage], imports: [GetDownloadURLPipeModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AngularFireStorageModule, decorators: [{
            type: NgModule,
            args: [{
                    exports: [GetDownloadURLPipeModule],
                    providers: [AngularFireStorage]
                }]
        }], ctorParameters: function () { return []; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmFnZS5tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY29tcGF0L3N0b3JhZ2Uvc3RvcmFnZS5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUNuRSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFDL0MsT0FBTyxRQUFRLE1BQU0scUJBQXFCLENBQUM7QUFDM0MsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLGVBQWUsQ0FBQzs7QUFNeEMsTUFBTSxPQUFPLHdCQUF3QjtJQUNuQztRQUNFLFFBQVEsQ0FBQyxlQUFlLENBQUMsYUFBYSxFQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFDdEUsQ0FBQzs7cUhBSFUsd0JBQXdCO3NIQUF4Qix3QkFBd0IsWUFIeEIsd0JBQXdCO3NIQUd4Qix3QkFBd0IsYUFGeEIsQ0FBRSxrQkFBa0IsQ0FBRSxZQUR0Qix3QkFBd0I7MkZBR3hCLHdCQUF3QjtrQkFKcEMsUUFBUTttQkFBQztvQkFDUixPQUFPLEVBQUUsQ0FBRSx3QkFBd0IsQ0FBRTtvQkFDckMsU0FBUyxFQUFFLENBQUUsa0JBQWtCLENBQUU7aUJBQ2xDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmdNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEdldERvd25sb2FkVVJMUGlwZU1vZHVsZSB9IGZyb20gJy4vcGlwZXMvc3RvcmFnZVVybC5waXBlJztcbmltcG9ydCB7IEFuZ3VsYXJGaXJlU3RvcmFnZSB9IGZyb20gJy4vc3RvcmFnZSc7XG5pbXBvcnQgZmlyZWJhc2UgZnJvbSAnZmlyZWJhc2UvY29tcGF0L2FwcCc7XG5pbXBvcnQgeyBWRVJTSU9OIH0gZnJvbSAnQGFuZ3VsYXIvZmlyZSc7XG5cbkBOZ01vZHVsZSh7XG4gIGV4cG9ydHM6IFsgR2V0RG93bmxvYWRVUkxQaXBlTW9kdWxlIF0sXG4gIHByb3ZpZGVyczogWyBBbmd1bGFyRmlyZVN0b3JhZ2UgXVxufSlcbmV4cG9ydCBjbGFzcyBBbmd1bGFyRmlyZVN0b3JhZ2VNb2R1bGUge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBmaXJlYmFzZS5yZWdpc3RlclZlcnNpb24oJ2FuZ3VsYXJmaXJlJywgVkVSU0lPTi5mdWxsLCAnZ2NzLWNvbXBhdCcpO1xuICB9XG59XG4iXX0=