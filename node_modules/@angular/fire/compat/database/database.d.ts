import { InjectionToken, NgZone } from '@angular/core';
import { AngularFireList, AngularFireObject, PathReference, QueryFn } from './interfaces';
import { ɵAngularFireSchedulers } from '@angular/fire';
import { FirebaseOptions } from 'firebase/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { AppCheckInstances } from '@angular/fire/app-check';
import * as i0 from "@angular/core";
export declare const URL: InjectionToken<string>;
export declare const USE_EMULATOR: InjectionToken<[host: string, port: number, options?: {
    mockUserToken?: string | firebase.EmulatorMockTokenOptions;
}]>;
export declare class AngularFireDatabase {
    schedulers: ɵAngularFireSchedulers;
    readonly database: firebase.database.Database;
    constructor(options: FirebaseOptions, name: string | null | undefined, databaseURL: string | null, platformId: Object, zone: NgZone, schedulers: ɵAngularFireSchedulers, _useEmulator: any, // tuple isn't working here
    auth: AngularFireAuth, useAuthEmulator: any, authSettings: any, // can't use firebase.auth.AuthSettings here
    tenantId: string | null, languageCode: string | null, useDeviceLanguage: boolean | null, persistence: string | null, _appCheckInstances: AppCheckInstances);
    list<T>(pathOrRef: PathReference, queryFn?: QueryFn): AngularFireList<T>;
    object<T>(pathOrRef: PathReference): AngularFireObject<T>;
    createPushId(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<AngularFireDatabase, [null, { optional: true; }, { optional: true; }, null, null, null, { optional: true; }, { optional: true; }, { optional: true; }, { optional: true; }, { optional: true; }, { optional: true; }, { optional: true; }, { optional: true; }, { optional: true; }]>;
    static ɵprov: i0.ɵɵInjectableDeclaration<AngularFireDatabase>;
}
export { PathReference, DatabaseSnapshot, ChildEvent, ListenEvent, QueryFn, AngularFireList, AngularFireObject, AngularFireAction, Action, SnapshotAction } from './interfaces';
