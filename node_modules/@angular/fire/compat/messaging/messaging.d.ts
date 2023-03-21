import { InjectionToken, NgZone } from '@angular/core';
import firebase from 'firebase/compat/app';
import { Observable } from 'rxjs';
import { ɵAngularFireSchedulers } from '@angular/fire';
import { ɵPromiseProxy } from '@angular/fire/compat';
import { FirebaseOptions } from 'firebase/app';
import * as i0 from "@angular/core";
export declare const VAPID_KEY: InjectionToken<string>;
export declare const SERVICE_WORKER: InjectionToken<Promise<ServiceWorkerRegistration>>;
export interface AngularFireMessaging extends Omit<ɵPromiseProxy<firebase.messaging.Messaging>, 'deleteToken' | 'getToken' | 'requestPermission'> {
}
export declare class AngularFireMessaging {
    readonly requestPermission: Observable<NotificationPermission>;
    readonly getToken: Observable<string | null>;
    readonly tokenChanges: Observable<string | null>;
    readonly messages: Observable<firebase.messaging.MessagePayload>;
    readonly requestToken: Observable<string | null>;
    readonly deleteToken: (token: string) => Observable<boolean>;
    constructor(options: FirebaseOptions, name: string | null | undefined, platformId: Object, zone: NgZone, schedulers: ɵAngularFireSchedulers, vapidKey: string | null, _serviceWorker: any);
    static ɵfac: i0.ɵɵFactoryDeclaration<AngularFireMessaging, [null, { optional: true; }, null, null, null, { optional: true; }, { optional: true; }]>;
    static ɵprov: i0.ɵɵInjectableDeclaration<AngularFireMessaging>;
}
