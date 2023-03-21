import { NgZone, InjectionToken, ModuleWithProviders, Injector } from '@angular/core';
import { Firestore as FirebaseFirestore } from 'firebase/firestore/lite';
import { Firestore } from './lite';
import { FirebaseApp } from '@angular/fire/app';
import * as i0 from "@angular/core";
export declare const PROVIDED_FIRESTORE_INSTANCES: InjectionToken<Firestore[]>;
export declare function defaultFirestoreInstanceFactory(provided: FirebaseFirestore[] | undefined, defaultApp: FirebaseApp): Firestore;
export declare function firestoreInstanceFactory(fn: (injector: Injector) => FirebaseFirestore): (zone: NgZone, injector: Injector) => Firestore;
export declare class FirestoreModule {
    constructor();
    static ɵfac: i0.ɵɵFactoryDeclaration<FirestoreModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<FirestoreModule, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<FirestoreModule>;
}
export declare function provideFirestore(fn: (injector: Injector) => FirebaseFirestore, ...deps: any[]): ModuleWithProviders<FirestoreModule>;
