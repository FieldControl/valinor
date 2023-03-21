import { NgZone, InjectionToken, ModuleWithProviders, Injector } from '@angular/core';
import { AppCheck as FirebaseAppCheck } from 'firebase/app-check';
import { AppCheck } from './app-check';
import { FirebaseApp } from '@angular/fire/app';
import * as i0 from "@angular/core";
export declare const PROVIDED_APP_CHECK_INSTANCES: InjectionToken<AppCheck[]>;
export declare const APP_CHECK_NAMESPACE_SYMBOL: unique symbol;
export declare function defaultAppCheckInstanceFactory(provided: FirebaseAppCheck[] | undefined, defaultApp: FirebaseApp): AppCheck;
export declare function appCheckInstanceFactory(fn: (injector: Injector) => FirebaseAppCheck): (zone: NgZone, injector: Injector, platformId: Object) => AppCheck;
export declare class AppCheckModule {
    constructor();
    static ɵfac: i0.ɵɵFactoryDeclaration<AppCheckModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<AppCheckModule, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<AppCheckModule>;
}
export declare function provideAppCheck(fn: (injector: Injector) => FirebaseAppCheck, ...deps: any[]): ModuleWithProviders<AppCheckModule>;
