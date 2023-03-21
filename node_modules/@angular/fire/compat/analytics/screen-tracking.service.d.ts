import { ComponentFactoryResolver, NgZone, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAnalytics } from './analytics';
import { Title } from '@angular/platform-browser';
import { UserTrackingService } from './user-tracking.service';
import * as i0 from "@angular/core";
export declare class ScreenTrackingService implements OnDestroy {
    private disposable;
    constructor(analytics: AngularFireAnalytics, router: Router, title: Title, componentFactoryResolver: ComponentFactoryResolver, zone: NgZone, userTrackingService: UserTrackingService);
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<ScreenTrackingService, [null, { optional: true; }, { optional: true; }, null, null, { optional: true; }]>;
    static ɵprov: i0.ɵɵInjectableDeclaration<ScreenTrackingService>;
}
