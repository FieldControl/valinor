import { NgZone, InjectionToken, ModuleWithProviders, Injector } from '@angular/core';
import { Functions as FirebaseFunctions } from 'firebase/functions';
import { Functions } from './functions';
import { FirebaseApp } from '@angular/fire/app';
import * as i0 from "@angular/core";
export declare const PROVIDED_FUNCTIONS_INSTANCES: InjectionToken<Functions[]>;
export declare function defaultFunctionsInstanceFactory(provided: FirebaseFunctions[] | undefined, defaultApp: FirebaseApp): Functions;
export declare function functionsInstanceFactory(fn: (injector: Injector) => FirebaseFunctions): (zone: NgZone, injector: Injector) => Functions;
export declare class FunctionsModule {
    constructor();
    static ɵfac: i0.ɵɵFactoryDeclaration<FunctionsModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<FunctionsModule, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<FunctionsModule>;
}
export declare function provideFunctions(fn: (injector: Injector) => FirebaseFunctions, ...deps: any[]): ModuleWithProviders<FunctionsModule>;
