import { Apollo } from 'apollo-angular';
import { ApolloCache } from '@apollo/client/core';
import { InjectionToken } from '@angular/core';
import { ApolloTestingBackend } from './backend';
import * as i0 from "@angular/core";
import * as i1 from "apollo-angular";
export declare type NamedCaches = Record<string, ApolloCache<any> | undefined | null>;
export declare const APOLLO_TESTING_CACHE: InjectionToken<ApolloCache<any>>;
export declare const APOLLO_TESTING_NAMED_CACHE: InjectionToken<NamedCaches>;
export declare const APOLLO_TESTING_CLIENTS: InjectionToken<string[]>;
export declare class ApolloTestingModuleCore {
    constructor(apollo: Apollo, backend: ApolloTestingBackend, namedClients?: string[], cache?: ApolloCache<any>, namedCaches?: any);
    static ɵfac: i0.ɵɵFactoryDeclaration<ApolloTestingModuleCore, [null, null, { optional: true; }, { optional: true; }, { optional: true; }]>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<ApolloTestingModuleCore, never, [typeof i1.ApolloModule], never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<ApolloTestingModuleCore>;
}
export declare class ApolloTestingModule {
    static withClients(names: string[]): {
        ngModule: typeof ApolloTestingModuleCore;
        providers: {
            provide: InjectionToken<string[]>;
            useValue: string[];
        }[];
    };
    static ɵfac: i0.ɵɵFactoryDeclaration<ApolloTestingModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<ApolloTestingModule, never, [typeof ApolloTestingModuleCore], never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<ApolloTestingModule>;
}
