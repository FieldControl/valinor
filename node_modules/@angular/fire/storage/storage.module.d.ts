import { NgZone, InjectionToken, ModuleWithProviders, Injector } from '@angular/core';
import { FirebaseStorage } from 'firebase/storage';
import { Storage } from './storage';
import { FirebaseApp } from '@angular/fire/app';
import * as i0 from "@angular/core";
export declare const PROVIDED_STORAGE_INSTANCES: InjectionToken<Storage[]>;
export declare function defaultStorageInstanceFactory(provided: FirebaseStorage[] | undefined, defaultApp: FirebaseApp): Storage;
export declare function storageInstanceFactory(fn: (injector: Injector) => FirebaseStorage): (zone: NgZone, injector: Injector) => Storage;
export declare class StorageModule {
    constructor();
    static ɵfac: i0.ɵɵFactoryDeclaration<StorageModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<StorageModule, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<StorageModule>;
}
export declare function provideStorage(fn: (injector: Injector) => FirebaseStorage, ...deps: any[]): ModuleWithProviders<StorageModule>;
