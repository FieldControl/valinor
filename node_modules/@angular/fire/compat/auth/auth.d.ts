import { NgZone, InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { ɵAngularFireSchedulers } from '@angular/fire';
import { ɵPromiseProxy } from '@angular/fire/compat';
import { FirebaseApp } from '@angular/fire/compat';
import { FirebaseOptions } from 'firebase/app';
import firebase from 'firebase/compat/app';
import { AppCheckInstances } from '@angular/fire/app-check';
import * as i0 from "@angular/core";
export interface AngularFireAuth extends ɵPromiseProxy<firebase.auth.Auth> {
}
declare type UseEmulatorArguments = Parameters<firebase.auth.Auth['useEmulator']>;
export declare const USE_EMULATOR: InjectionToken<[url: string]>;
export declare const SETTINGS: InjectionToken<firebase.auth.AuthSettings>;
export declare const TENANT_ID: InjectionToken<string>;
export declare const LANGUAGE_CODE: InjectionToken<string>;
export declare const USE_DEVICE_LANGUAGE: InjectionToken<boolean>;
export declare const PERSISTENCE: InjectionToken<string>;
export declare const ɵauthFactory: (app: FirebaseApp, zone: NgZone, useEmulator: UseEmulatorArguments | null, tenantId: string, languageCode: string | null, useDeviceLanguage: boolean | null, settings: firebase.auth.AuthSettings | null, persistence: string | null) => firebase.auth.Auth;
export declare class AngularFireAuth {
    /**
     * Observable of authentication state; as of Firebase 4.0 this is only triggered via sign-in/out
     */
    readonly authState: Observable<firebase.User | null>;
    /**
     * Observable of the currently signed-in user's JWT token used to identify the user to a Firebase service (or null).
     */
    readonly idToken: Observable<string | null>;
    /**
     * Observable of the currently signed-in user (or null).
     */
    readonly user: Observable<firebase.User | null>;
    /**
     * Observable of the currently signed-in user's IdTokenResult object which contains the ID token JWT string and other
     * helper properties for getting different data associated with the token as well as all the decoded payload claims
     * (or null).
     */
    readonly idTokenResult: Observable<firebase.auth.IdTokenResult | null>;
    /**
     * Observable of the currently signed-in user's credential, or null
     */
    readonly credential: Observable<Required<firebase.auth.UserCredential> | null>;
    constructor(options: FirebaseOptions, name: string | null | undefined, platformId: Object, zone: NgZone, schedulers: ɵAngularFireSchedulers, useEmulator: any, // can't use the tuple here
    settings: any, // can't use firebase.auth.AuthSettings here
    tenantId: string | null, languageCode: string | null, useDeviceLanguage: boolean | null, persistence: string | null, _appCheckInstances: AppCheckInstances);
    static ɵfac: i0.ɵɵFactoryDeclaration<AngularFireAuth, [null, { optional: true; }, null, null, null, { optional: true; }, { optional: true; }, { optional: true; }, { optional: true; }, { optional: true; }, { optional: true; }, { optional: true; }]>;
    static ɵprov: i0.ɵɵInjectableDeclaration<AngularFireAuth>;
}
export {};
