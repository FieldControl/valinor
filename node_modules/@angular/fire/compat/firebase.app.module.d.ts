import { InjectionToken, ModuleWithProviders, NgZone } from '@angular/core';
import { FirebaseOptions, FirebaseAppSettings } from 'firebase/app';
import { FirebaseApp } from './firebase.app';
import * as i0 from "@angular/core";
export declare const FIREBASE_OPTIONS: InjectionToken<FirebaseOptions>;
export declare const FIREBASE_APP_NAME: InjectionToken<string>;
export declare function ɵfirebaseAppFactory(options: FirebaseOptions, zone: NgZone, nameOrConfig?: string | FirebaseAppSettings | null): FirebaseApp;
export declare class AngularFireModule {
    static initializeApp(options: FirebaseOptions, nameOrConfig?: string | FirebaseAppSettings): ModuleWithProviders<AngularFireModule>;
    constructor(platformId: Object);
    static ɵfac: i0.ɵɵFactoryDeclaration<AngularFireModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<AngularFireModule, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<AngularFireModule>;
}
