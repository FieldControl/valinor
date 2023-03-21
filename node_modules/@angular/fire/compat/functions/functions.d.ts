import { InjectionToken, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { ɵAngularFireSchedulers } from '@angular/fire';
import { ɵPromiseProxy } from '@angular/fire/compat';
import { FirebaseOptions } from 'firebase/app';
import firebase from 'firebase/compat/app';
import { HttpsCallableOptions } from '@firebase/functions-types';
import { AppCheckInstances } from '@angular/fire/app-check';
import * as i0 from "@angular/core";
export declare const ORIGIN: InjectionToken<string>;
export declare const REGION: InjectionToken<string>;
export declare const USE_EMULATOR: InjectionToken<[host: string, port: number]>;
export interface AngularFireFunctions extends Omit<ɵPromiseProxy<firebase.functions.Functions>, 'httpsCallable'> {
}
export declare class AngularFireFunctions {
    readonly httpsCallable: <T = any, R = any>(name: string, options?: HttpsCallableOptions) => (data: T) => Observable<R>;
    constructor(options: FirebaseOptions, name: string | null | undefined, zone: NgZone, schedulers: ɵAngularFireSchedulers, region: string | null, origin: string | null, _useEmulator: any, // can't use the tuple here
    _appCheckInstances: AppCheckInstances);
    static ɵfac: i0.ɵɵFactoryDeclaration<AngularFireFunctions, [null, { optional: true; }, null, null, { optional: true; }, { optional: true; }, { optional: true; }, { optional: true; }]>;
    static ɵprov: i0.ɵɵInjectableDeclaration<AngularFireFunctions>;
}
