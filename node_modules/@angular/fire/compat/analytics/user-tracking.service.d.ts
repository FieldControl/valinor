import { NgZone, OnDestroy } from '@angular/core';
import { AngularFireAnalytics } from './analytics';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import * as i0 from "@angular/core";
export declare class UserTrackingService implements OnDestroy {
    initialized: Promise<void>;
    private disposables;
    constructor(analytics: AngularFireAnalytics, platformId: Object, auth: AngularFireAuth, zone: NgZone);
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<UserTrackingService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<UserTrackingService>;
}
