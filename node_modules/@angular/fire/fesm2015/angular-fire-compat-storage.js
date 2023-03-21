import { Observable, of, from } from 'rxjs';
import { debounceTime, map, switchMap, tap } from 'rxjs/operators';
import * as i1 from '@angular/fire';
import { observeOutsideAngular, keepUnstableUntilFirst, VERSION } from '@angular/fire';
import * as i0 from '@angular/core';
import { InjectionToken, PLATFORM_ID, Injectable, Inject, Optional, Pipe, NgModule } from '@angular/core';
import { ɵfirebaseAppFactory, ɵcacheInstance, FIREBASE_OPTIONS, FIREBASE_APP_NAME } from '@angular/fire/compat';
import 'firebase/compat/storage';
import * as i2 from '@angular/fire/app-check';
import { AsyncPipe } from '@angular/common';
import * as i2$1 from '@angular/platform-browser';
import { makeStateKey } from '@angular/platform-browser';
import firebase from 'firebase/compat/app';

// Things aren't working great, I'm having to put in a lot of work-arounds for what
// appear to be Firebase JS SDK bugs https://github.com/firebase/firebase-js-sdk/issues/4158
function fromTask(task) {
    return new Observable(subscriber => {
        const progress = (snap) => subscriber.next(snap);
        const error = e => subscriber.error(e);
        const complete = () => subscriber.complete();
        // emit the current snapshot, so they don't have to wait for state_changes
        // to fire next... this is stale if the task is no longer running :(
        progress(task.snapshot);
        const unsub = task.on('state_changed', progress);
        // it turns out that neither task snapshot nor 'state_changed' fire the last
        // snapshot before completion, the one with status 'success" and 100% progress
        // so let's use the promise form of the task for that
        task.then(snapshot => {
            progress(snapshot);
            complete();
        }, e => {
            // TODO investigate, again this is stale, we never fire a canceled or error it seems
            progress(task.snapshot);
            error(e);
        });
        // on's type if Function, rather than () => void, need to wrap
        return function unsubscribe() {
            unsub();
        };
    }).pipe(
    // deal with sync emissions from first emitting `task.snapshot`, this makes sure
    // that if the task is already finished we don't emit the old running state
    debounceTime(0));
}

/**
 * Create an AngularFireUploadTask from a regular UploadTask from the Storage SDK.
 * This method creates an observable of the upload and returns on object that provides
 * multiple methods for controlling and monitoring the file upload.
 */
function createUploadTask(task) {
    const inner$ = fromTask(task);
    return {
        task,
        then: task.then.bind(task),
        catch: task.catch.bind(task),
        pause: task.pause.bind(task),
        cancel: task.cancel.bind(task),
        resume: task.resume.bind(task),
        snapshotChanges: () => inner$,
        percentageChanges: () => inner$.pipe(map(s => s.bytesTransferred / s.totalBytes * 100))
    };
}

/**
 * Create an AngularFire wrapped Storage Reference. This object
 * creates observable methods from promise based methods.
 */
function createStorageRef(ref) {
    return {
        getDownloadURL: () => of(undefined).pipe(observeOutsideAngular, switchMap(() => ref.getDownloadURL()), keepUnstableUntilFirst),
        getMetadata: () => of(undefined).pipe(observeOutsideAngular, switchMap(() => ref.getMetadata()), keepUnstableUntilFirst),
        delete: () => from(ref.delete()),
        child: (path) => createStorageRef(ref.child(path)),
        updateMetadata: (meta) => from(ref.updateMetadata(meta)),
        put: (data, metadata) => {
            const task = ref.put(data, metadata);
            return createUploadTask(task);
        },
        putString: (data, format, metadata) => {
            const task = ref.putString(data, format, metadata);
            return createUploadTask(task);
        },
        list: (options) => from(ref.list(options)),
        listAll: () => from(ref.listAll())
    };
}

const BUCKET = new InjectionToken('angularfire2.storageBucket');
const MAX_UPLOAD_RETRY_TIME = new InjectionToken('angularfire2.storage.maxUploadRetryTime');
const MAX_OPERATION_RETRY_TIME = new InjectionToken('angularfire2.storage.maxOperationRetryTime');
const USE_EMULATOR = new InjectionToken('angularfire2.storage.use-emulator');
/**
 * AngularFireStorage Service
 *
 * This service is the main entry point for this feature module. It provides
 * an API for uploading and downloading binary files from Cloud Storage for
 * Firebase.
 */
class AngularFireStorage {
    constructor(options, name, storageBucket, 
    // tslint:disable-next-line:ban-types
    platformId, zone, schedulers, maxUploadRetryTime, maxOperationRetryTime, _useEmulator, _appCheckInstances) {
        const app = ɵfirebaseAppFactory(options, zone, name);
        this.storage = ɵcacheInstance(`${app.name}.storage.${storageBucket}`, 'AngularFireStorage', app.name, () => {
            const storage = zone.runOutsideAngular(() => app.storage(storageBucket || undefined));
            const useEmulator = _useEmulator;
            if (useEmulator) {
                storage.useEmulator(...useEmulator);
            }
            if (maxUploadRetryTime) {
                storage.setMaxUploadRetryTime(maxUploadRetryTime);
            }
            if (maxOperationRetryTime) {
                storage.setMaxOperationRetryTime(maxOperationRetryTime);
            }
            return storage;
        }, [maxUploadRetryTime, maxOperationRetryTime]);
    }
    ref(path) {
        return createStorageRef(this.storage.ref(path));
    }
    refFromURL(path) {
        return createStorageRef(this.storage.refFromURL(path));
    }
    upload(path, data, metadata) {
        const storageRef = this.storage.ref(path);
        const ref = createStorageRef(storageRef);
        return ref.put(data, metadata);
    }
}
AngularFireStorage.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AngularFireStorage, deps: [{ token: FIREBASE_OPTIONS }, { token: FIREBASE_APP_NAME, optional: true }, { token: BUCKET, optional: true }, { token: PLATFORM_ID }, { token: i0.NgZone }, { token: i1.ɵAngularFireSchedulers }, { token: MAX_UPLOAD_RETRY_TIME, optional: true }, { token: MAX_OPERATION_RETRY_TIME, optional: true }, { token: USE_EMULATOR, optional: true }, { token: i2.AppCheckInstances, optional: true }], target: i0.ɵɵFactoryTarget.Injectable });
AngularFireStorage.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AngularFireStorage, providedIn: 'any' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AngularFireStorage, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'any'
                }]
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [FIREBASE_OPTIONS]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [FIREBASE_APP_NAME]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [BUCKET]
                }] }, { type: Object, decorators: [{
                    type: Inject,
                    args: [PLATFORM_ID]
                }] }, { type: i0.NgZone }, { type: i1.ɵAngularFireSchedulers }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [MAX_UPLOAD_RETRY_TIME]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [MAX_OPERATION_RETRY_TIME]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [USE_EMULATOR]
                }] }, { type: i2.AppCheckInstances, decorators: [{
                    type: Optional
                }] }]; } });

/** to be used with in combination with | async */
class GetDownloadURLPipe {
    constructor(storage, cdr, state) {
        this.storage = storage;
        this.state = state;
        this.asyncPipe = new AsyncPipe(cdr);
    }
    transform(path) {
        var _a;
        if (path !== this.path) {
            this.path = path;
            const key = makeStateKey(`|getDownloadURL|${path}`);
            const existing = (_a = this.state) === null || _a === void 0 ? void 0 : _a.get(key, undefined);
            this.downloadUrl$ = existing ? of(existing) : this.storage.ref(path).getDownloadURL().pipe(tap(it => { var _a; return (_a = this.state) === null || _a === void 0 ? void 0 : _a.set(key, it); }));
        }
        return this.asyncPipe.transform(this.downloadUrl$);
    }
    ngOnDestroy() {
        this.asyncPipe.ngOnDestroy();
    }
}
GetDownloadURLPipe.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: GetDownloadURLPipe, deps: [{ token: AngularFireStorage }, { token: i0.ChangeDetectorRef }, { token: i2$1.TransferState, optional: true }], target: i0.ɵɵFactoryTarget.Pipe });
GetDownloadURLPipe.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: GetDownloadURLPipe, name: "getDownloadURL", pure: false });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: GetDownloadURLPipe, decorators: [{
            type: Pipe,
            args: [{
                    name: 'getDownloadURL',
                    pure: false,
                }]
        }], ctorParameters: function () { return [{ type: AngularFireStorage }, { type: i0.ChangeDetectorRef }, { type: i2$1.TransferState, decorators: [{
                    type: Optional
                }] }]; } });
class GetDownloadURLPipeModule {
}
GetDownloadURLPipeModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: GetDownloadURLPipeModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
GetDownloadURLPipeModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: GetDownloadURLPipeModule, declarations: [GetDownloadURLPipe], exports: [GetDownloadURLPipe] });
GetDownloadURLPipeModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: GetDownloadURLPipeModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: GetDownloadURLPipeModule, decorators: [{
            type: NgModule,
            args: [{
                    declarations: [GetDownloadURLPipe],
                    exports: [GetDownloadURLPipe],
                }]
        }] });

class AngularFireStorageModule {
    constructor() {
        firebase.registerVersion('angularfire', VERSION.full, 'gcs-compat');
    }
}
AngularFireStorageModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AngularFireStorageModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
AngularFireStorageModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AngularFireStorageModule, exports: [GetDownloadURLPipeModule] });
AngularFireStorageModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AngularFireStorageModule, providers: [AngularFireStorage], imports: [GetDownloadURLPipeModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AngularFireStorageModule, decorators: [{
            type: NgModule,
            args: [{
                    exports: [GetDownloadURLPipeModule],
                    providers: [AngularFireStorage]
                }]
        }], ctorParameters: function () { return []; } });

/**
 * Generated bundle index. Do not edit.
 */

export { AngularFireStorage, AngularFireStorageModule, BUCKET, GetDownloadURLPipe, GetDownloadURLPipeModule, MAX_OPERATION_RETRY_TIME, MAX_UPLOAD_RETRY_TIME, USE_EMULATOR, createStorageRef, createUploadTask, fromTask };
//# sourceMappingURL=angular-fire-compat-storage.js.map
