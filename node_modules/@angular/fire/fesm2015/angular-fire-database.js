import { ɵgetAllInstancesOf, ɵgetDefaultInstanceOf, VERSION, ɵAngularFireSchedulers, ɵzoneWrap } from '@angular/fire';
import { timer, from } from 'rxjs';
import { concatMap, distinct } from 'rxjs/operators';
import * as i0 from '@angular/core';
import { InjectionToken, Optional, NgModule, NgZone, Injector } from '@angular/core';
import { AuthInstances } from '@angular/fire/auth';
import { FirebaseApp, FirebaseApps } from '@angular/fire/app';
import { registerVersion } from 'firebase/app';
import { AppCheckInstances } from '@angular/fire/app-check';
import { fromRef as fromRef$1, stateChanges as stateChanges$1, list as list$1, listVal as listVal$1, auditTrail as auditTrail$1, object as object$1, objectVal as objectVal$1, changeToData as changeToData$1 } from 'rxfire/database';
export { ListenEvent, ListenerMethods } from 'rxfire/database';
import { child as child$1, connectDatabaseEmulator as connectDatabaseEmulator$1, enableLogging as enableLogging$1, endAt as endAt$1, endBefore as endBefore$1, equalTo as equalTo$1, forceLongPolling as forceLongPolling$1, forceWebSockets as forceWebSockets$1, get as get$1, getDatabase as getDatabase$1, goOffline as goOffline$1, goOnline as goOnline$1, increment as increment$1, limitToFirst as limitToFirst$1, limitToLast as limitToLast$1, off as off$1, onChildAdded as onChildAdded$1, onChildChanged as onChildChanged$1, onChildMoved as onChildMoved$1, onChildRemoved as onChildRemoved$1, onDisconnect as onDisconnect$1, onValue as onValue$1, orderByChild as orderByChild$1, orderByKey as orderByKey$1, orderByPriority as orderByPriority$1, orderByValue as orderByValue$1, push as push$1, query as query$1, ref as ref$1, refFromURL as refFromURL$1, remove as remove$1, runTransaction as runTransaction$1, serverTimestamp as serverTimestamp$1, set as set$1, setPriority as setPriority$1, setWithPriority as setWithPriority$1, startAfter as startAfter$1, startAt as startAt$1, update as update$1 } from 'firebase/database';
export * from 'firebase/database';

class Database {
    constructor(database) {
        return database;
    }
}
const DATABASE_PROVIDER_NAME = 'database';
class DatabaseInstances {
    constructor() {
        return ɵgetAllInstancesOf(DATABASE_PROVIDER_NAME);
    }
}
const databaseInstance$ = timer(0, 300).pipe(concatMap(() => from(ɵgetAllInstancesOf(DATABASE_PROVIDER_NAME))), distinct());

const PROVIDED_DATABASE_INSTANCES = new InjectionToken('angularfire2.database-instances');
function defaultDatabaseInstanceFactory(provided, defaultApp) {
    const defaultDatabase = ɵgetDefaultInstanceOf(DATABASE_PROVIDER_NAME, provided, defaultApp);
    return defaultDatabase && new Database(defaultDatabase);
}
function databaseInstanceFactory(fn) {
    return (zone, injector) => {
        const database = zone.runOutsideAngular(() => fn(injector));
        return new Database(database);
    };
}
const DATABASE_INSTANCES_PROVIDER = {
    provide: DatabaseInstances,
    deps: [
        [new Optional(), PROVIDED_DATABASE_INSTANCES],
    ]
};
const DEFAULT_DATABASE_INSTANCE_PROVIDER = {
    provide: Database,
    useFactory: defaultDatabaseInstanceFactory,
    deps: [
        [new Optional(), PROVIDED_DATABASE_INSTANCES],
        FirebaseApp,
    ]
};
class DatabaseModule {
    constructor() {
        registerVersion('angularfire', VERSION.full, 'rtdb');
    }
}
DatabaseModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: DatabaseModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
DatabaseModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: DatabaseModule });
DatabaseModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: DatabaseModule, providers: [
        DEFAULT_DATABASE_INSTANCE_PROVIDER,
        DATABASE_INSTANCES_PROVIDER,
    ] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: DatabaseModule, decorators: [{
            type: NgModule,
            args: [{
                    providers: [
                        DEFAULT_DATABASE_INSTANCE_PROVIDER,
                        DATABASE_INSTANCES_PROVIDER,
                    ]
                }]
        }], ctorParameters: function () { return []; } });
function provideDatabase(fn, ...deps) {
    return {
        ngModule: DatabaseModule,
        providers: [{
                provide: PROVIDED_DATABASE_INSTANCES,
                useFactory: databaseInstanceFactory(fn),
                multi: true,
                deps: [
                    NgZone,
                    Injector,
                    ɵAngularFireSchedulers,
                    FirebaseApps,
                    // Database+Auth work better if Auth is loaded first
                    [new Optional(), AuthInstances],
                    [new Optional(), AppCheckInstances],
                    ...deps,
                ]
            }]
    };
}

// DO NOT MODIFY, this file is autogenerated by tools/build.ts
const fromRef = ɵzoneWrap(fromRef$1, true);
const stateChanges = ɵzoneWrap(stateChanges$1, true);
const list = ɵzoneWrap(list$1, true);
const listVal = ɵzoneWrap(listVal$1, true);
const auditTrail = ɵzoneWrap(auditTrail$1, true);
const object = ɵzoneWrap(object$1, true);
const objectVal = ɵzoneWrap(objectVal$1, true);
const changeToData = ɵzoneWrap(changeToData$1, true);

// DO NOT MODIFY, this file is autogenerated by tools/build.ts
const child = ɵzoneWrap(child$1, true);
const connectDatabaseEmulator = ɵzoneWrap(connectDatabaseEmulator$1, true);
const enableLogging = ɵzoneWrap(enableLogging$1, true);
const endAt = ɵzoneWrap(endAt$1, true);
const endBefore = ɵzoneWrap(endBefore$1, true);
const equalTo = ɵzoneWrap(equalTo$1, true);
const forceLongPolling = ɵzoneWrap(forceLongPolling$1, true);
const forceWebSockets = ɵzoneWrap(forceWebSockets$1, true);
const get = ɵzoneWrap(get$1, true);
const getDatabase = ɵzoneWrap(getDatabase$1, true);
const goOffline = ɵzoneWrap(goOffline$1, true);
const goOnline = ɵzoneWrap(goOnline$1, true);
const increment = ɵzoneWrap(increment$1, true);
const limitToFirst = ɵzoneWrap(limitToFirst$1, true);
const limitToLast = ɵzoneWrap(limitToLast$1, true);
const off = ɵzoneWrap(off$1, true);
const onChildAdded = ɵzoneWrap(onChildAdded$1, true);
const onChildChanged = ɵzoneWrap(onChildChanged$1, true);
const onChildMoved = ɵzoneWrap(onChildMoved$1, true);
const onChildRemoved = ɵzoneWrap(onChildRemoved$1, true);
const onDisconnect = ɵzoneWrap(onDisconnect$1, true);
const onValue = ɵzoneWrap(onValue$1, true);
const orderByChild = ɵzoneWrap(orderByChild$1, true);
const orderByKey = ɵzoneWrap(orderByKey$1, true);
const orderByPriority = ɵzoneWrap(orderByPriority$1, true);
const orderByValue = ɵzoneWrap(orderByValue$1, true);
const push = ɵzoneWrap(push$1, true);
const query = ɵzoneWrap(query$1, true);
const ref = ɵzoneWrap(ref$1, true);
const refFromURL = ɵzoneWrap(refFromURL$1, true);
const remove = ɵzoneWrap(remove$1, true);
const runTransaction = ɵzoneWrap(runTransaction$1, true);
const serverTimestamp = ɵzoneWrap(serverTimestamp$1, true);
const set = ɵzoneWrap(set$1, true);
const setPriority = ɵzoneWrap(setPriority$1, true);
const setWithPriority = ɵzoneWrap(setWithPriority$1, true);
const startAfter = ɵzoneWrap(startAfter$1, true);
const startAt = ɵzoneWrap(startAt$1, true);
const update = ɵzoneWrap(update$1, true);

/**
 * Generated bundle index. Do not edit.
 */

export { Database, DatabaseInstances, DatabaseModule, auditTrail, changeToData, child, connectDatabaseEmulator, databaseInstance$, enableLogging, endAt, endBefore, equalTo, forceLongPolling, forceWebSockets, fromRef, get, getDatabase, goOffline, goOnline, increment, limitToFirst, limitToLast, list, listVal, object, objectVal, off, onChildAdded, onChildChanged, onChildMoved, onChildRemoved, onDisconnect, onValue, orderByChild, orderByKey, orderByPriority, orderByValue, provideDatabase, push, query, ref, refFromURL, remove, runTransaction, serverTimestamp, set, setPriority, setWithPriority, startAfter, startAt, stateChanges, update };
//# sourceMappingURL=angular-fire-database.js.map
