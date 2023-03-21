import { NgModule } from '@angular/core';
import { AngularFireDatabase } from './database';
import firebase from 'firebase/compat/app';
import { VERSION } from '@angular/fire';
import * as i0 from "@angular/core";
export class AngularFireDatabaseModule {
    constructor() {
        firebase.registerVersion('angularfire', VERSION.full, 'rtdb-compat');
    }
}
AngularFireDatabaseModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AngularFireDatabaseModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
AngularFireDatabaseModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AngularFireDatabaseModule });
AngularFireDatabaseModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AngularFireDatabaseModule, providers: [AngularFireDatabase] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AngularFireDatabaseModule, decorators: [{
            type: NgModule,
            args: [{
                    providers: [AngularFireDatabase]
                }]
        }], ctorParameters: function () { return []; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YWJhc2UubW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NvbXBhdC9kYXRhYmFzZS9kYXRhYmFzZS5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDakQsT0FBTyxRQUFRLE1BQU0scUJBQXFCLENBQUM7QUFDM0MsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLGVBQWUsQ0FBQzs7QUFLeEMsTUFBTSxPQUFPLHlCQUF5QjtJQUNwQztRQUNFLFFBQVEsQ0FBQyxlQUFlLENBQUMsYUFBYSxFQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQUUsYUFBYSxDQUFDLENBQUM7SUFDdkUsQ0FBQzs7c0hBSFUseUJBQXlCO3VIQUF6Qix5QkFBeUI7dUhBQXpCLHlCQUF5QixhQUZ6QixDQUFFLG1CQUFtQixDQUFFOzJGQUV2Qix5QkFBeUI7a0JBSHJDLFFBQVE7bUJBQUM7b0JBQ1IsU0FBUyxFQUFFLENBQUUsbUJBQW1CLENBQUU7aUJBQ25DIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmdNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEFuZ3VsYXJGaXJlRGF0YWJhc2UgfSBmcm9tICcuL2RhdGFiYXNlJztcbmltcG9ydCBmaXJlYmFzZSBmcm9tICdmaXJlYmFzZS9jb21wYXQvYXBwJztcbmltcG9ydCB7IFZFUlNJT04gfSBmcm9tICdAYW5ndWxhci9maXJlJztcblxuQE5nTW9kdWxlKHtcbiAgcHJvdmlkZXJzOiBbIEFuZ3VsYXJGaXJlRGF0YWJhc2UgXVxufSlcbmV4cG9ydCBjbGFzcyBBbmd1bGFyRmlyZURhdGFiYXNlTW9kdWxlIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgZmlyZWJhc2UucmVnaXN0ZXJWZXJzaW9uKCdhbmd1bGFyZmlyZScsIFZFUlNJT04uZnVsbCwgJ3J0ZGItY29tcGF0Jyk7XG4gIH1cbn1cbiJdfQ==