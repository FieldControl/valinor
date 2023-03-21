import { NgZone, InjectionToken, ModuleWithProviders, Injector } from '@angular/core';
import { FirebasePerformance } from 'firebase/performance';
import { Performance } from './performance';
import { FirebaseApp } from '@angular/fire/app';
import * as i0 from "@angular/core";
export declare const PROVIDED_PERFORMANCE_INSTANCES: InjectionToken<Performance[]>;
export declare function defaultPerformanceInstanceFactory(provided: FirebasePerformance[] | undefined, defaultApp: FirebaseApp, platform: Object): Performance;
export declare function performanceInstanceFactory(fn: (injector: Injector) => FirebasePerformance): (zone: NgZone, platform: Object, injector: Injector) => Performance;
export declare class PerformanceModule {
    constructor();
    static ɵfac: i0.ɵɵFactoryDeclaration<PerformanceModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<PerformanceModule, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<PerformanceModule>;
}
export declare function providePerformance(fn: (injector: Injector) => FirebasePerformance, ...deps: any[]): ModuleWithProviders<PerformanceModule>;
