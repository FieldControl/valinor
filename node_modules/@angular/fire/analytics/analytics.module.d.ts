import { NgZone, InjectionToken, ModuleWithProviders, Injector } from '@angular/core';
import { Analytics as FirebaseAnalytics } from 'firebase/analytics';
import { Analytics } from './analytics';
import { FirebaseApp } from '@angular/fire/app';
import { ScreenTrackingService } from './screen-tracking.service';
import { UserTrackingService } from './user-tracking.service';
import * as i0 from "@angular/core";
export declare const PROVIDED_ANALYTICS_INSTANCES: InjectionToken<Analytics[]>;
export declare function defaultAnalyticsInstanceFactory(provided: FirebaseAnalytics[] | undefined, defaultApp: FirebaseApp): Analytics;
export declare function analyticsInstanceFactory(fn: (injector: Injector) => FirebaseAnalytics): (zone: NgZone, injector: Injector) => Analytics;
export declare class AnalyticsModule {
    constructor(_screenTrackingService: ScreenTrackingService, _userTrackingService: UserTrackingService);
    static ɵfac: i0.ɵɵFactoryDeclaration<AnalyticsModule, [{ optional: true; }, { optional: true; }]>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<AnalyticsModule, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<AnalyticsModule>;
}
export declare function provideAnalytics(fn: (injector: Injector) => FirebaseAnalytics, ...deps: any[]): ModuleWithProviders<AnalyticsModule>;
