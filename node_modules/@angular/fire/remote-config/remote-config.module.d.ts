import { NgZone, InjectionToken, ModuleWithProviders, Injector } from '@angular/core';
import { RemoteConfig as FirebaseRemoteConfig } from 'firebase/remote-config';
import { RemoteConfig } from './remote-config';
import { FirebaseApp } from '@angular/fire/app';
import * as i0 from "@angular/core";
export declare const PROVIDED_REMOTE_CONFIG_INSTANCES: InjectionToken<RemoteConfig[]>;
export declare function defaultRemoteConfigInstanceFactory(provided: FirebaseRemoteConfig[] | undefined, defaultApp: FirebaseApp): RemoteConfig;
export declare function remoteConfigInstanceFactory(fn: (injector: Injector) => FirebaseRemoteConfig): (zone: NgZone, injector: Injector) => RemoteConfig;
export declare class RemoteConfigModule {
    constructor();
    static ɵfac: i0.ɵɵFactoryDeclaration<RemoteConfigModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<RemoteConfigModule, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<RemoteConfigModule>;
}
export declare function provideRemoteConfig(fn: (injector: Injector) => FirebaseRemoteConfig, ...deps: any[]): ModuleWithProviders<RemoteConfigModule>;
