import { NgModule } from '@angular/core';
import { AuthGuard } from './auth-guard';
import { registerVersion } from 'firebase/app';
import { VERSION } from '@angular/fire';
import * as i0 from "@angular/core";
export class AuthGuardModule {
    constructor() {
        registerVersion('angularfire', VERSION.full, 'auth-guard');
    }
}
AuthGuardModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AuthGuardModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
AuthGuardModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AuthGuardModule });
AuthGuardModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AuthGuardModule, providers: [AuthGuard] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AuthGuardModule, decorators: [{
            type: NgModule,
            args: [{
                    providers: [AuthGuard]
                }]
        }], ctorParameters: function () { return []; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aC1ndWFyZC5tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvYXV0aC1ndWFyZC9hdXRoLWd1YXJkLm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDekMsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUMvQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sZUFBZSxDQUFDOztBQUt4QyxNQUFNLE9BQU8sZUFBZTtJQUMxQjtRQUNFLGVBQWUsQ0FBQyxhQUFhLEVBQUUsT0FBTyxDQUFDLElBQUksRUFBRSxZQUFZLENBQUMsQ0FBQztJQUM3RCxDQUFDOzs0R0FIVSxlQUFlOzZHQUFmLGVBQWU7NkdBQWYsZUFBZSxhQUZmLENBQUUsU0FBUyxDQUFFOzJGQUViLGVBQWU7a0JBSDNCLFFBQVE7bUJBQUM7b0JBQ1IsU0FBUyxFQUFFLENBQUUsU0FBUyxDQUFFO2lCQUN6QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5nTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBBdXRoR3VhcmQgfSBmcm9tICcuL2F1dGgtZ3VhcmQnO1xuaW1wb3J0IHsgcmVnaXN0ZXJWZXJzaW9uIH0gZnJvbSAnZmlyZWJhc2UvYXBwJztcbmltcG9ydCB7IFZFUlNJT04gfSBmcm9tICdAYW5ndWxhci9maXJlJztcblxuQE5nTW9kdWxlKHtcbiAgcHJvdmlkZXJzOiBbIEF1dGhHdWFyZCBdXG59KVxuZXhwb3J0IGNsYXNzIEF1dGhHdWFyZE1vZHVsZSB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHJlZ2lzdGVyVmVyc2lvbignYW5ndWxhcmZpcmUnLCBWRVJTSU9OLmZ1bGwsICdhdXRoLWd1YXJkJyk7XG4gIH1cbn1cbiJdfQ==