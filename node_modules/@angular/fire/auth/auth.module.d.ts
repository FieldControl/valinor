import { NgZone, InjectionToken, ModuleWithProviders, Injector } from '@angular/core';
import { Auth as FirebaseAuth } from 'firebase/auth';
import { Auth } from './auth';
import { FirebaseApp } from '@angular/fire/app';
import * as i0 from "@angular/core";
export declare const PROVIDED_AUTH_INSTANCES: InjectionToken<Auth[]>;
export declare function defaultAuthInstanceFactory(provided: FirebaseAuth[] | undefined, defaultApp: FirebaseApp): Auth;
export declare function authInstanceFactory(fn: (injector: Injector) => FirebaseAuth): (zone: NgZone, injector: Injector) => Auth;
export declare class AuthModule {
    constructor();
    static ɵfac: i0.ɵɵFactoryDeclaration<AuthModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<AuthModule, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<AuthModule>;
}
export declare function provideAuth(fn: (injector: Injector) => FirebaseAuth, ...deps: any[]): ModuleWithProviders<AuthModule>;
