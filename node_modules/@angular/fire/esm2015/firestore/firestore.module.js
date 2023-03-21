import { NgModule, Optional, NgZone, InjectionToken, Injector } from '@angular/core';
import { AuthInstances } from '@angular/fire/auth';
import { ɵgetDefaultInstanceOf, ɵAngularFireSchedulers, VERSION } from '@angular/fire';
import { Firestore, FirestoreInstances, FIRESTORE_PROVIDER_NAME } from './firestore';
import { FirebaseApps, FirebaseApp } from '@angular/fire/app';
import { registerVersion } from 'firebase/app';
import { AppCheckInstances } from '@angular/fire/app-check';
import * as i0 from "@angular/core";
export const PROVIDED_FIRESTORE_INSTANCES = new InjectionToken('angularfire2.firestore-instances');
export function defaultFirestoreInstanceFactory(provided, defaultApp) {
    const defaultFirestore = ɵgetDefaultInstanceOf(FIRESTORE_PROVIDER_NAME, provided, defaultApp);
    return defaultFirestore && new Firestore(defaultFirestore);
}
export function firestoreInstanceFactory(fn) {
    return (zone, injector) => {
        const firestore = zone.runOutsideAngular(() => fn(injector));
        return new Firestore(firestore);
    };
}
const FIRESTORE_INSTANCES_PROVIDER = {
    provide: FirestoreInstances,
    deps: [
        [new Optional(), PROVIDED_FIRESTORE_INSTANCES],
    ]
};
const DEFAULT_FIRESTORE_INSTANCE_PROVIDER = {
    provide: Firestore,
    useFactory: defaultFirestoreInstanceFactory,
    deps: [
        [new Optional(), PROVIDED_FIRESTORE_INSTANCES],
        FirebaseApp,
    ]
};
export class FirestoreModule {
    constructor() {
        registerVersion('angularfire', VERSION.full, 'fst');
    }
}
FirestoreModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: FirestoreModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
FirestoreModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: FirestoreModule });
FirestoreModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: FirestoreModule, providers: [
        DEFAULT_FIRESTORE_INSTANCE_PROVIDER,
        FIRESTORE_INSTANCES_PROVIDER,
    ] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: FirestoreModule, decorators: [{
            type: NgModule,
            args: [{
                    providers: [
                        DEFAULT_FIRESTORE_INSTANCE_PROVIDER,
                        FIRESTORE_INSTANCES_PROVIDER,
                    ]
                }]
        }], ctorParameters: function () { return []; } });
export function provideFirestore(fn, ...deps) {
    return {
        ngModule: FirestoreModule,
        providers: [{
                provide: PROVIDED_FIRESTORE_INSTANCES,
                useFactory: firestoreInstanceFactory(fn),
                multi: true,
                deps: [
                    NgZone,
                    Injector,
                    ɵAngularFireSchedulers,
                    FirebaseApps,
                    // Firestore+Auth work better if Auth is loaded first
                    [new Optional(), AuthInstances],
                    [new Optional(), AppCheckInstances],
                    ...deps,
                ]
            }]
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlyZXN0b3JlLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9maXJlc3RvcmUvZmlyZXN0b3JlLm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsY0FBYyxFQUF1QixRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFMUcsT0FBTyxFQUFFLGFBQWEsRUFBRyxNQUFNLG9CQUFvQixDQUFDO0FBQ3BELE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxzQkFBc0IsRUFBRSxPQUFPLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDdkYsT0FBTyxFQUFFLFNBQVMsRUFBRSxrQkFBa0IsRUFBRSx1QkFBdUIsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUNyRixPQUFPLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQzlELE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDL0MsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0seUJBQXlCLENBQUM7O0FBRTVELE1BQU0sQ0FBQyxNQUFNLDRCQUE0QixHQUFHLElBQUksY0FBYyxDQUFjLGtDQUFrQyxDQUFDLENBQUM7QUFFaEgsTUFBTSxVQUFVLCtCQUErQixDQUFDLFFBQXVDLEVBQUUsVUFBdUI7SUFDOUcsTUFBTSxnQkFBZ0IsR0FBRyxxQkFBcUIsQ0FBb0IsdUJBQXVCLEVBQUUsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQ2pILE9BQU8sZ0JBQWdCLElBQUksSUFBSSxTQUFTLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUM3RCxDQUFDO0FBRUQsTUFBTSxVQUFVLHdCQUF3QixDQUFDLEVBQTZDO0lBQ3BGLE9BQU8sQ0FBQyxJQUFZLEVBQUUsUUFBa0IsRUFBRSxFQUFFO1FBQzFDLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUM3RCxPQUFPLElBQUksU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ2xDLENBQUMsQ0FBQztBQUNKLENBQUM7QUFFRCxNQUFNLDRCQUE0QixHQUFHO0lBQ25DLE9BQU8sRUFBRSxrQkFBa0I7SUFDM0IsSUFBSSxFQUFFO1FBQ0osQ0FBQyxJQUFJLFFBQVEsRUFBRSxFQUFFLDRCQUE0QixDQUFFO0tBQ2hEO0NBQ0YsQ0FBQztBQUVGLE1BQU0sbUNBQW1DLEdBQUc7SUFDMUMsT0FBTyxFQUFFLFNBQVM7SUFDbEIsVUFBVSxFQUFFLCtCQUErQjtJQUMzQyxJQUFJLEVBQUU7UUFDSixDQUFDLElBQUksUUFBUSxFQUFFLEVBQUUsNEJBQTRCLENBQUU7UUFDL0MsV0FBVztLQUNaO0NBQ0YsQ0FBQztBQVFGLE1BQU0sT0FBTyxlQUFlO0lBQzFCO1FBQ0UsZUFBZSxDQUFDLGFBQWEsRUFBRSxPQUFPLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3RELENBQUM7OzRHQUhVLGVBQWU7NkdBQWYsZUFBZTs2R0FBZixlQUFlLGFBTGY7UUFDVCxtQ0FBbUM7UUFDbkMsNEJBQTRCO0tBQzdCOzJGQUVVLGVBQWU7a0JBTjNCLFFBQVE7bUJBQUM7b0JBQ1IsU0FBUyxFQUFFO3dCQUNULG1DQUFtQzt3QkFDbkMsNEJBQTRCO3FCQUM3QjtpQkFDRjs7QUFPRCxNQUFNLFVBQVUsZ0JBQWdCLENBQUMsRUFBNkMsRUFBRSxHQUFHLElBQVc7SUFDNUYsT0FBTztRQUNMLFFBQVEsRUFBRSxlQUFlO1FBQ3pCLFNBQVMsRUFBRSxDQUFDO2dCQUNWLE9BQU8sRUFBRSw0QkFBNEI7Z0JBQ3JDLFVBQVUsRUFBRSx3QkFBd0IsQ0FBQyxFQUFFLENBQUM7Z0JBQ3hDLEtBQUssRUFBRSxJQUFJO2dCQUNYLElBQUksRUFBRTtvQkFDSixNQUFNO29CQUNOLFFBQVE7b0JBQ1Isc0JBQXNCO29CQUN0QixZQUFZO29CQUNaLHFEQUFxRDtvQkFDckQsQ0FBQyxJQUFJLFFBQVEsRUFBRSxFQUFFLGFBQWEsQ0FBRTtvQkFDaEMsQ0FBQyxJQUFJLFFBQVEsRUFBRSxFQUFFLGlCQUFpQixDQUFFO29CQUNwQyxHQUFHLElBQUk7aUJBQ1I7YUFDRixDQUFDO0tBQ0gsQ0FBQztBQUNKLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZ01vZHVsZSwgT3B0aW9uYWwsIE5nWm9uZSwgSW5qZWN0aW9uVG9rZW4sIE1vZHVsZVdpdGhQcm92aWRlcnMsIEluamVjdG9yIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBGaXJlc3RvcmUgYXMgRmlyZWJhc2VGaXJlc3RvcmUgfSBmcm9tICdmaXJlYmFzZS9maXJlc3RvcmUnO1xuaW1wb3J0IHsgQXV0aEluc3RhbmNlcyAgfSBmcm9tICdAYW5ndWxhci9maXJlL2F1dGgnO1xuaW1wb3J0IHsgybVnZXREZWZhdWx0SW5zdGFuY2VPZiwgybVBbmd1bGFyRmlyZVNjaGVkdWxlcnMsIFZFUlNJT04gfSBmcm9tICdAYW5ndWxhci9maXJlJztcbmltcG9ydCB7IEZpcmVzdG9yZSwgRmlyZXN0b3JlSW5zdGFuY2VzLCBGSVJFU1RPUkVfUFJPVklERVJfTkFNRSB9IGZyb20gJy4vZmlyZXN0b3JlJztcbmltcG9ydCB7IEZpcmViYXNlQXBwcywgRmlyZWJhc2VBcHAgfSBmcm9tICdAYW5ndWxhci9maXJlL2FwcCc7XG5pbXBvcnQgeyByZWdpc3RlclZlcnNpb24gfSBmcm9tICdmaXJlYmFzZS9hcHAnO1xuaW1wb3J0IHsgQXBwQ2hlY2tJbnN0YW5jZXMgfSBmcm9tICdAYW5ndWxhci9maXJlL2FwcC1jaGVjayc7XG5cbmV4cG9ydCBjb25zdCBQUk9WSURFRF9GSVJFU1RPUkVfSU5TVEFOQ0VTID0gbmV3IEluamVjdGlvblRva2VuPEZpcmVzdG9yZVtdPignYW5ndWxhcmZpcmUyLmZpcmVzdG9yZS1pbnN0YW5jZXMnKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGRlZmF1bHRGaXJlc3RvcmVJbnN0YW5jZUZhY3RvcnkocHJvdmlkZWQ6IEZpcmViYXNlRmlyZXN0b3JlW118dW5kZWZpbmVkLCBkZWZhdWx0QXBwOiBGaXJlYmFzZUFwcCkge1xuICBjb25zdCBkZWZhdWx0RmlyZXN0b3JlID0gybVnZXREZWZhdWx0SW5zdGFuY2VPZjxGaXJlYmFzZUZpcmVzdG9yZT4oRklSRVNUT1JFX1BST1ZJREVSX05BTUUsIHByb3ZpZGVkLCBkZWZhdWx0QXBwKTtcbiAgcmV0dXJuIGRlZmF1bHRGaXJlc3RvcmUgJiYgbmV3IEZpcmVzdG9yZShkZWZhdWx0RmlyZXN0b3JlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpcmVzdG9yZUluc3RhbmNlRmFjdG9yeShmbjogKGluamVjdG9yOiBJbmplY3RvcikgPT4gRmlyZWJhc2VGaXJlc3RvcmUpIHtcbiAgcmV0dXJuICh6b25lOiBOZ1pvbmUsIGluamVjdG9yOiBJbmplY3RvcikgPT4ge1xuICAgIGNvbnN0IGZpcmVzdG9yZSA9IHpvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4gZm4oaW5qZWN0b3IpKTtcbiAgICByZXR1cm4gbmV3IEZpcmVzdG9yZShmaXJlc3RvcmUpO1xuICB9O1xufVxuXG5jb25zdCBGSVJFU1RPUkVfSU5TVEFOQ0VTX1BST1ZJREVSID0ge1xuICBwcm92aWRlOiBGaXJlc3RvcmVJbnN0YW5jZXMsXG4gIGRlcHM6IFtcbiAgICBbbmV3IE9wdGlvbmFsKCksIFBST1ZJREVEX0ZJUkVTVE9SRV9JTlNUQU5DRVMgXSxcbiAgXVxufTtcblxuY29uc3QgREVGQVVMVF9GSVJFU1RPUkVfSU5TVEFOQ0VfUFJPVklERVIgPSB7XG4gIHByb3ZpZGU6IEZpcmVzdG9yZSxcbiAgdXNlRmFjdG9yeTogZGVmYXVsdEZpcmVzdG9yZUluc3RhbmNlRmFjdG9yeSxcbiAgZGVwczogW1xuICAgIFtuZXcgT3B0aW9uYWwoKSwgUFJPVklERURfRklSRVNUT1JFX0lOU1RBTkNFUyBdLFxuICAgIEZpcmViYXNlQXBwLFxuICBdXG59O1xuXG5ATmdNb2R1bGUoe1xuICBwcm92aWRlcnM6IFtcbiAgICBERUZBVUxUX0ZJUkVTVE9SRV9JTlNUQU5DRV9QUk9WSURFUixcbiAgICBGSVJFU1RPUkVfSU5TVEFOQ0VTX1BST1ZJREVSLFxuICBdXG59KVxuZXhwb3J0IGNsYXNzIEZpcmVzdG9yZU1vZHVsZSB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHJlZ2lzdGVyVmVyc2lvbignYW5ndWxhcmZpcmUnLCBWRVJTSU9OLmZ1bGwsICdmc3QnKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZUZpcmVzdG9yZShmbjogKGluamVjdG9yOiBJbmplY3RvcikgPT4gRmlyZWJhc2VGaXJlc3RvcmUsIC4uLmRlcHM6IGFueVtdKTogTW9kdWxlV2l0aFByb3ZpZGVyczxGaXJlc3RvcmVNb2R1bGU+IHtcbiAgcmV0dXJuIHtcbiAgICBuZ01vZHVsZTogRmlyZXN0b3JlTW9kdWxlLFxuICAgIHByb3ZpZGVyczogW3tcbiAgICAgIHByb3ZpZGU6IFBST1ZJREVEX0ZJUkVTVE9SRV9JTlNUQU5DRVMsXG4gICAgICB1c2VGYWN0b3J5OiBmaXJlc3RvcmVJbnN0YW5jZUZhY3RvcnkoZm4pLFxuICAgICAgbXVsdGk6IHRydWUsXG4gICAgICBkZXBzOiBbXG4gICAgICAgIE5nWm9uZSxcbiAgICAgICAgSW5qZWN0b3IsXG4gICAgICAgIMm1QW5ndWxhckZpcmVTY2hlZHVsZXJzLFxuICAgICAgICBGaXJlYmFzZUFwcHMsXG4gICAgICAgIC8vIEZpcmVzdG9yZStBdXRoIHdvcmsgYmV0dGVyIGlmIEF1dGggaXMgbG9hZGVkIGZpcnN0XG4gICAgICAgIFtuZXcgT3B0aW9uYWwoKSwgQXV0aEluc3RhbmNlcyBdLFxuICAgICAgICBbbmV3IE9wdGlvbmFsKCksIEFwcENoZWNrSW5zdGFuY2VzIF0sXG4gICAgICAgIC4uLmRlcHMsXG4gICAgICBdXG4gICAgfV1cbiAgfTtcbn1cbiJdfQ==