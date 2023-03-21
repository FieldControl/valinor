import { ModuleWithProviders } from '@angular/core';
import { PersistenceSettings } from './interfaces';
import * as i0 from "@angular/core";
export declare class AngularFirestoreModule {
    constructor();
    /**
     * Attempt to enable persistent storage, if possible
     */
    static enablePersistence(persistenceSettings?: PersistenceSettings): ModuleWithProviders<AngularFirestoreModule>;
    static ɵfac: i0.ɵɵFactoryDeclaration<AngularFirestoreModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<AngularFirestoreModule, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<AngularFirestoreModule>;
}
