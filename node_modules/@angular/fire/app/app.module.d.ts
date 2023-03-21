import { InjectionToken, Injector, ModuleWithProviders, NgZone } from '@angular/core';
import { FirebaseApp as IFirebaseApp } from 'firebase/app';
import { FirebaseApp } from './app';
import * as i0 from "@angular/core";
export declare function defaultFirebaseAppFactory(provided: FirebaseApp[] | undefined): FirebaseApp;
export declare const PROVIDED_FIREBASE_APPS: InjectionToken<FirebaseApp[]>;
export declare function firebaseAppFactory(fn: (injector: Injector) => IFirebaseApp): (zone: NgZone, injector: Injector) => FirebaseApp;
export declare class FirebaseAppModule {
    constructor(platformId: Object);
    static ɵfac: i0.ɵɵFactoryDeclaration<FirebaseAppModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<FirebaseAppModule, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<FirebaseAppModule>;
}
export declare function provideFirebaseApp(fn: (injector: Injector) => IFirebaseApp, ...deps: any[]): ModuleWithProviders<FirebaseAppModule>;
