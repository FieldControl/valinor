import { NgZone, InjectionToken, ModuleWithProviders, Injector } from '@angular/core';
import { Database as FirebaseDatabase } from 'firebase/database';
import { Database } from './database';
import { FirebaseApp } from '@angular/fire/app';
import * as i0 from "@angular/core";
export declare const PROVIDED_DATABASE_INSTANCES: InjectionToken<Database[]>;
export declare function defaultDatabaseInstanceFactory(provided: FirebaseDatabase[] | undefined, defaultApp: FirebaseApp): Database;
export declare function databaseInstanceFactory(fn: (injector: Injector) => FirebaseDatabase): (zone: NgZone, injector: Injector) => Database;
export declare class DatabaseModule {
    constructor();
    static ɵfac: i0.ɵɵFactoryDeclaration<DatabaseModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<DatabaseModule, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<DatabaseModule>;
}
export declare function provideDatabase(fn: (injector: Injector) => FirebaseDatabase, ...deps: any[]): ModuleWithProviders<DatabaseModule>;
