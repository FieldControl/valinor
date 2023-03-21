import { NgModule } from '@angular/core';
import { AngularFirestore, ENABLE_PERSISTENCE, PERSISTENCE_SETTINGS } from './firestore';
import firebase from 'firebase/compat/app';
import { VERSION } from '@angular/fire';
import * as i0 from "@angular/core";
export class AngularFirestoreModule {
    constructor() {
        firebase.registerVersion('angularfire', VERSION.full, 'fst-compat');
    }
    /**
     * Attempt to enable persistent storage, if possible
     */
    static enablePersistence(persistenceSettings) {
        return {
            ngModule: AngularFirestoreModule,
            providers: [
                { provide: ENABLE_PERSISTENCE, useValue: true },
                { provide: PERSISTENCE_SETTINGS, useValue: persistenceSettings },
            ]
        };
    }
}
AngularFirestoreModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AngularFirestoreModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
AngularFirestoreModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AngularFirestoreModule });
AngularFirestoreModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AngularFirestoreModule, providers: [AngularFirestore] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AngularFirestoreModule, decorators: [{
            type: NgModule,
            args: [{
                    providers: [AngularFirestore]
                }]
        }], ctorParameters: function () { return []; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlyZXN0b3JlLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb21wYXQvZmlyZXN0b3JlL2ZpcmVzdG9yZS5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUF1QixRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFOUQsT0FBTyxFQUFFLGdCQUFnQixFQUFFLGtCQUFrQixFQUFFLG9CQUFvQixFQUFFLE1BQU0sYUFBYSxDQUFDO0FBQ3pGLE9BQU8sUUFBUSxNQUFNLHFCQUFxQixDQUFDO0FBQzNDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxlQUFlLENBQUM7O0FBS3hDLE1BQU0sT0FBTyxzQkFBc0I7SUFDakM7UUFDRSxRQUFRLENBQUMsZUFBZSxDQUFDLGFBQWEsRUFBRSxPQUFPLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQyxDQUFDO0lBQ3RFLENBQUM7SUFDRDs7T0FFRztJQUNILE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxtQkFBeUM7UUFDaEUsT0FBTztZQUNMLFFBQVEsRUFBRSxzQkFBc0I7WUFDaEMsU0FBUyxFQUFFO2dCQUNULEVBQUUsT0FBTyxFQUFFLGtCQUFrQixFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUU7Z0JBQy9DLEVBQUUsT0FBTyxFQUFFLG9CQUFvQixFQUFFLFFBQVEsRUFBRSxtQkFBbUIsRUFBRTthQUNqRTtTQUNGLENBQUM7SUFDSixDQUFDOzttSEFmVSxzQkFBc0I7b0hBQXRCLHNCQUFzQjtvSEFBdEIsc0JBQXNCLGFBRnRCLENBQUUsZ0JBQWdCLENBQUU7MkZBRXBCLHNCQUFzQjtrQkFIbEMsUUFBUTttQkFBQztvQkFDUixTQUFTLEVBQUUsQ0FBRSxnQkFBZ0IsQ0FBRTtpQkFDaEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBNb2R1bGVXaXRoUHJvdmlkZXJzLCBOZ01vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgUGVyc2lzdGVuY2VTZXR0aW5ncyB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBBbmd1bGFyRmlyZXN0b3JlLCBFTkFCTEVfUEVSU0lTVEVOQ0UsIFBFUlNJU1RFTkNFX1NFVFRJTkdTIH0gZnJvbSAnLi9maXJlc3RvcmUnO1xuaW1wb3J0IGZpcmViYXNlIGZyb20gJ2ZpcmViYXNlL2NvbXBhdC9hcHAnO1xuaW1wb3J0IHsgVkVSU0lPTiB9IGZyb20gJ0Bhbmd1bGFyL2ZpcmUnO1xuXG5ATmdNb2R1bGUoe1xuICBwcm92aWRlcnM6IFsgQW5ndWxhckZpcmVzdG9yZSBdXG59KVxuZXhwb3J0IGNsYXNzIEFuZ3VsYXJGaXJlc3RvcmVNb2R1bGUge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBmaXJlYmFzZS5yZWdpc3RlclZlcnNpb24oJ2FuZ3VsYXJmaXJlJywgVkVSU0lPTi5mdWxsLCAnZnN0LWNvbXBhdCcpO1xuICB9XG4gIC8qKlxuICAgKiBBdHRlbXB0IHRvIGVuYWJsZSBwZXJzaXN0ZW50IHN0b3JhZ2UsIGlmIHBvc3NpYmxlXG4gICAqL1xuICBzdGF0aWMgZW5hYmxlUGVyc2lzdGVuY2UocGVyc2lzdGVuY2VTZXR0aW5ncz86IFBlcnNpc3RlbmNlU2V0dGluZ3MpOiBNb2R1bGVXaXRoUHJvdmlkZXJzPEFuZ3VsYXJGaXJlc3RvcmVNb2R1bGU+IHtcbiAgICByZXR1cm4ge1xuICAgICAgbmdNb2R1bGU6IEFuZ3VsYXJGaXJlc3RvcmVNb2R1bGUsXG4gICAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgeyBwcm92aWRlOiBFTkFCTEVfUEVSU0lTVEVOQ0UsIHVzZVZhbHVlOiB0cnVlIH0sXG4gICAgICAgIHsgcHJvdmlkZTogUEVSU0lTVEVOQ0VfU0VUVElOR1MsIHVzZVZhbHVlOiBwZXJzaXN0ZW5jZVNldHRpbmdzIH0sXG4gICAgICBdXG4gICAgfTtcbiAgfVxufVxuIl19