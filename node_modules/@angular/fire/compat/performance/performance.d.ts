import { InjectionToken, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import firebase from 'firebase/compat/app';
import { ɵPromiseProxy } from '@angular/fire/compat';
import { FirebaseApp } from '@angular/fire/compat';
import * as i0 from "@angular/core";
export declare const INSTRUMENTATION_ENABLED: InjectionToken<boolean>;
export declare const DATA_COLLECTION_ENABLED: InjectionToken<boolean>;
export interface AngularFirePerformance extends ɵPromiseProxy<firebase.performance.Performance> {
}
export declare class AngularFirePerformance {
    private zone;
    private readonly performance;
    constructor(app: FirebaseApp, instrumentationEnabled: boolean | null, dataCollectionEnabled: boolean | null, zone: NgZone, platformId: Object);
    static ɵfac: i0.ɵɵFactoryDeclaration<AngularFirePerformance, [null, { optional: true; }, { optional: true; }, null, null]>;
    static ɵprov: i0.ɵɵInjectableDeclaration<AngularFirePerformance>;
}
export declare const traceUntil: <T = any>(name: string, test: (a: T) => boolean, options?: {
    orComplete?: boolean;
}) => (source$: Observable<T>) => Observable<T>;
export declare const traceWhile: <T = any>(name: string, test: (a: T) => boolean, options?: {
    orComplete?: boolean;
}) => (source$: Observable<T>) => Observable<T>;
export declare const traceUntilComplete: <T = any>(name: string) => (source$: Observable<T>) => Observable<T>;
export declare const traceUntilFirst: <T = any>(name: string) => (source$: Observable<T>) => Observable<T>;
export declare const trace: <T = any>(name: string) => (source$: Observable<T>) => Observable<T>;
