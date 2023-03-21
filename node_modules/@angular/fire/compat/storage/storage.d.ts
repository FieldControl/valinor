import { InjectionToken, NgZone } from '@angular/core';
import { ɵAngularFireSchedulers } from '@angular/fire';
import { FirebaseOptions } from 'firebase/app';
import { UploadMetadata } from './interfaces';
import 'firebase/compat/storage';
import firebase from 'firebase/compat/app';
import { AppCheckInstances } from '@angular/fire/app-check';
import * as i0 from "@angular/core";
export declare const BUCKET: InjectionToken<string>;
export declare const MAX_UPLOAD_RETRY_TIME: InjectionToken<number>;
export declare const MAX_OPERATION_RETRY_TIME: InjectionToken<number>;
export declare const USE_EMULATOR: InjectionToken<[host: string, port: number, options?: {
    mockUserToken?: string | firebase.EmulatorMockTokenOptions;
}]>;
/**
 * AngularFireStorage Service
 *
 * This service is the main entry point for this feature module. It provides
 * an API for uploading and downloading binary files from Cloud Storage for
 * Firebase.
 */
export declare class AngularFireStorage {
    readonly storage: firebase.storage.Storage;
    constructor(options: FirebaseOptions, name: string | null | undefined, storageBucket: string | null, platformId: Object, zone: NgZone, schedulers: ɵAngularFireSchedulers, maxUploadRetryTime: number | any, maxOperationRetryTime: number | any, _useEmulator: any, _appCheckInstances: AppCheckInstances);
    ref(path: string): import("./ref").AngularFireStorageReference;
    refFromURL(path: string): import("./ref").AngularFireStorageReference;
    upload(path: string, data: any, metadata?: UploadMetadata): import("@angular/fire/compat/storage").AngularFireUploadTask;
    static ɵfac: i0.ɵɵFactoryDeclaration<AngularFireStorage, [null, { optional: true; }, { optional: true; }, null, null, null, { optional: true; }, { optional: true; }, { optional: true; }, { optional: true; }]>;
    static ɵprov: i0.ɵɵInjectableDeclaration<AngularFireStorage>;
}
