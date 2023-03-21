import { NgModule } from '@angular/core';
import { AngularFireMessaging } from './messaging';
import firebase from 'firebase/compat/app';
import { VERSION } from '@angular/fire';
import * as i0 from "@angular/core";
export class AngularFireMessagingModule {
    constructor() {
        firebase.registerVersion('angularfire', VERSION.full, 'fcm-compat');
    }
}
AngularFireMessagingModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AngularFireMessagingModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
AngularFireMessagingModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AngularFireMessagingModule });
AngularFireMessagingModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AngularFireMessagingModule, providers: [AngularFireMessaging] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AngularFireMessagingModule, decorators: [{
            type: NgModule,
            args: [{
                    providers: [AngularFireMessaging]
                }]
        }], ctorParameters: function () { return []; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVzc2FnaW5nLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb21wYXQvbWVzc2FnaW5nL21lc3NhZ2luZy5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFDbkQsT0FBTyxRQUFRLE1BQU0scUJBQXFCLENBQUM7QUFDM0MsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLGVBQWUsQ0FBQzs7QUFLeEMsTUFBTSxPQUFPLDBCQUEwQjtJQUNyQztRQUNFLFFBQVEsQ0FBQyxlQUFlLENBQUMsYUFBYSxFQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFDdEUsQ0FBQzs7dUhBSFUsMEJBQTBCO3dIQUExQiwwQkFBMEI7d0hBQTFCLDBCQUEwQixhQUYxQixDQUFFLG9CQUFvQixDQUFFOzJGQUV4QiwwQkFBMEI7a0JBSHRDLFFBQVE7bUJBQUM7b0JBQ1IsU0FBUyxFQUFFLENBQUUsb0JBQW9CLENBQUU7aUJBQ3BDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmdNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEFuZ3VsYXJGaXJlTWVzc2FnaW5nIH0gZnJvbSAnLi9tZXNzYWdpbmcnO1xuaW1wb3J0IGZpcmViYXNlIGZyb20gJ2ZpcmViYXNlL2NvbXBhdC9hcHAnO1xuaW1wb3J0IHsgVkVSU0lPTiB9IGZyb20gJ0Bhbmd1bGFyL2ZpcmUnO1xuXG5ATmdNb2R1bGUoe1xuICBwcm92aWRlcnM6IFsgQW5ndWxhckZpcmVNZXNzYWdpbmcgXVxufSlcbmV4cG9ydCBjbGFzcyBBbmd1bGFyRmlyZU1lc3NhZ2luZ01vZHVsZSB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIGZpcmViYXNlLnJlZ2lzdGVyVmVyc2lvbignYW5ndWxhcmZpcmUnLCBWRVJTSU9OLmZ1bGwsICdmY20tY29tcGF0Jyk7XG4gIH1cbn1cbiJdfQ==