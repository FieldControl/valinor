import * as i0 from '@angular/core';
import { InjectionToken, PLATFORM_ID, Injectable, Inject, Optional, NgModule } from '@angular/core';
import { asyncScheduler, Observable, from, of } from 'rxjs';
import * as i1 from '@angular/fire';
import { keepUnstableUntilFirst, VERSION } from '@angular/fire';
import { startWith, pairwise, map, scan, distinctUntilChanged, filter } from 'rxjs/operators';
import { ɵfirebaseAppFactory, ɵcacheInstance, FIREBASE_OPTIONS, FIREBASE_APP_NAME } from '@angular/fire/compat';
import { isPlatformServer } from '@angular/common';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import * as i2 from '@angular/fire/compat/auth';
import { ɵauthFactory, USE_EMULATOR as USE_EMULATOR$1, SETTINGS as SETTINGS$1, TENANT_ID, LANGUAGE_CODE, USE_DEVICE_LANGUAGE, PERSISTENCE } from '@angular/fire/compat/auth';
import * as i3 from '@angular/fire/app-check';
import firebase from 'firebase/compat/app';

function _fromRef(ref, scheduler = asyncScheduler) {
    return new Observable(subscriber => {
        let unsubscribe;
        if (scheduler != null) {
            scheduler.schedule(() => {
                unsubscribe = ref.onSnapshot({ includeMetadataChanges: true }, subscriber);
            });
        }
        else {
            unsubscribe = ref.onSnapshot({ includeMetadataChanges: true }, subscriber);
        }
        return () => {
            if (unsubscribe != null) {
                unsubscribe();
            }
        };
    });
}
function fromRef(ref, scheduler) {
    return _fromRef(ref, scheduler);
}
function fromDocRef(ref, scheduler) {
    return fromRef(ref, scheduler)
        .pipe(startWith(undefined), pairwise(), map(([priorPayload, payload]) => {
        if (!payload.exists) {
            return { payload, type: 'removed' };
        }
        if (!(priorPayload === null || priorPayload === void 0 ? void 0 : priorPayload.exists)) {
            return { payload, type: 'added' };
        }
        return { payload, type: 'modified' };
    }));
}
function fromCollectionRef(ref, scheduler) {
    return fromRef(ref, scheduler).pipe(map(payload => ({ payload, type: 'query' })));
}

/**
 * Return a stream of document changes on a query. These results are not in sort order but in
 * order of occurence.
 */
function docChanges(query, scheduler) {
    return fromCollectionRef(query, scheduler)
        .pipe(startWith(undefined), pairwise(), map(([priorAction, action]) => {
        const docChanges = action.payload.docChanges();
        const actions = docChanges.map(change => ({ type: change.type, payload: change }));
        // the metadata has changed from the prior emission
        if (priorAction && JSON.stringify(priorAction.payload.metadata) !== JSON.stringify(action.payload.metadata)) {
            // go through all the docs in payload and figure out which ones changed
            action.payload.docs.forEach((currentDoc, currentIndex) => {
                const docChange = docChanges.find(d => d.doc.ref.isEqual(currentDoc.ref));
                const priorDoc = priorAction === null || priorAction === void 0 ? void 0 : priorAction.payload.docs.find(d => d.ref.isEqual(currentDoc.ref));
                if (docChange && JSON.stringify(docChange.doc.metadata) === JSON.stringify(currentDoc.metadata) ||
                    !docChange && priorDoc && JSON.stringify(priorDoc.metadata) === JSON.stringify(currentDoc.metadata)) {
                    // document doesn't appear to have changed, don't log another action
                }
                else {
                    // since the actions are processed in order just push onto the array
                    actions.push({
                        type: 'modified',
                        payload: {
                            oldIndex: currentIndex,
                            newIndex: currentIndex,
                            type: 'modified',
                            doc: currentDoc
                        }
                    });
                }
            });
        }
        return actions;
    }));
}
/**
 * Return a stream of document changes on a query. These results are in sort order.
 */
function sortedChanges(query, events, scheduler) {
    return docChanges(query, scheduler)
        .pipe(scan((current, changes) => combineChanges(current, changes.map(it => it.payload), events), []), distinctUntilChanged(), // cut down on unneed change cycles
    map(changes => changes.map(c => ({ type: c.type, payload: c }))));
}
/**
 * Combines the total result set from the current set of changes from an incoming set
 * of changes.
 */
function combineChanges(current, changes, events) {
    changes.forEach(change => {
        // skip unwanted change types
        if (events.indexOf(change.type) > -1) {
            current = combineChange(current, change);
        }
    });
    return current;
}
/**
 * Splice arguments on top of a sliced array, to break top-level ===
 * this is useful for change-detection
 */
function sliceAndSplice(original, start, deleteCount, ...args) {
    const returnArray = original.slice();
    returnArray.splice(start, deleteCount, ...args);
    return returnArray;
}
/**
 * Creates a new sorted array from a new change.
 * Build our own because we allow filtering of action types ('added', 'removed', 'modified') before scanning
 * and so we have greater control over change detection (by breaking ===)
 */
function combineChange(combined, change) {
    switch (change.type) {
        case 'added':
            if (combined[change.newIndex] && combined[change.newIndex].doc.ref.isEqual(change.doc.ref)) {
                // Not sure why the duplicates are getting fired
            }
            else {
                return sliceAndSplice(combined, change.newIndex, 0, change);
            }
            break;
        case 'modified':
            if (combined[change.oldIndex] == null || combined[change.oldIndex].doc.ref.isEqual(change.doc.ref)) {
                // When an item changes position we first remove it
                // and then add it's new position
                if (change.oldIndex !== change.newIndex) {
                    const copiedArray = combined.slice();
                    copiedArray.splice(change.oldIndex, 1);
                    copiedArray.splice(change.newIndex, 0, change);
                    return copiedArray;
                }
                else {
                    return sliceAndSplice(combined, change.newIndex, 1, change);
                }
            }
            break;
        case 'removed':
            if (combined[change.oldIndex] && combined[change.oldIndex].doc.ref.isEqual(change.doc.ref)) {
                return sliceAndSplice(combined, change.oldIndex, 1);
            }
            break;
    }
    return combined;
}

function validateEventsArray(events) {
    if (!events || events.length === 0) {
        events = ['added', 'removed', 'modified'];
    }
    return events;
}
/**
 * AngularFirestoreCollection service
 *
 * This class creates a reference to a Firestore Collection. A reference and a query are provided in
 * in the constructor. The query can be the unqueried reference if no query is desired.The class
 * is generic which gives you type safety for data update methods and data streaming.
 *
 * This class uses Symbol.observable to transform into Observable using Observable.from().
 *
 * This class is rarely used directly and should be created from the AngularFirestore service.
 *
 * Example:
 *
 * const collectionRef = firebase.firestore.collection('stocks');
 * const query = collectionRef.where('price', '>', '0.01');
 * const fakeStock = new AngularFirestoreCollection<Stock>(collectionRef, query);
 *
 * // NOTE!: the updates are performed on the reference not the query
 * await fakeStock.add({ name: 'FAKE', price: 0.01 });
 *
 * // Subscribe to changes as snapshots. This provides you data updates as well as delta updates.
 * fakeStock.valueChanges().subscribe(value => console.log(value));
 */
class AngularFirestoreCollection {
    /**
     * The constructor takes in a CollectionReference and Query to provide wrapper methods
     * for data operations and data streaming.
     *
     * Note: Data operation methods are done on the reference not the query. This means
     * when you update data it is not updating data to the window of your query unless
     * the data fits the criteria of the query. See the AssociatedRefence type for details
     * on this implication.
     */
    constructor(ref, query, afs) {
        this.ref = ref;
        this.query = query;
        this.afs = afs;
    }
    /**
     * Listen to the latest change in the stream. This method returns changes
     * as they occur and they are not sorted by query order. This allows you to construct
     * your own data structure.
     */
    stateChanges(events) {
        let source = docChanges(this.query, this.afs.schedulers.outsideAngular);
        if (events && events.length > 0) {
            source = source.pipe(map(actions => actions.filter(change => events.indexOf(change.type) > -1)));
        }
        return source.pipe(
        // We want to filter out empty arrays, but always emit at first, so the developer knows
        // that the collection has been resolve; even if it's empty
        startWith(undefined), pairwise(), filter(([prior, current]) => current.length > 0 || !prior), map(([prior, current]) => current), keepUnstableUntilFirst);
    }
    /**
     * Create a stream of changes as they occur it time. This method is similar to stateChanges()
     * but it collects each event in an array over time.
     */
    auditTrail(events) {
        return this.stateChanges(events).pipe(scan((current, action) => [...current, ...action], []));
    }
    /**
     * Create a stream of synchronized changes. This method keeps the local array in sorted
     * query order.
     */
    snapshotChanges(events) {
        const validatedEvents = validateEventsArray(events);
        const scheduledSortedChanges$ = sortedChanges(this.query, validatedEvents, this.afs.schedulers.outsideAngular);
        return scheduledSortedChanges$.pipe(keepUnstableUntilFirst);
    }
    valueChanges(options = {}) {
        return fromCollectionRef(this.query, this.afs.schedulers.outsideAngular)
            .pipe(map(actions => actions.payload.docs.map(a => {
            if (options.idField) {
                return Object.assign(Object.assign({}, a.data()), { [options.idField]: a.id });
            }
            else {
                return a.data();
            }
        })), keepUnstableUntilFirst);
    }
    /**
     * Retrieve the results of the query once.
     */
    get(options) {
        return from(this.query.get(options)).pipe(keepUnstableUntilFirst);
    }
    /**
     * Add data to a collection reference.
     *
     * Note: Data operation methods are done on the reference not the query. This means
     * when you update data it is not updating data to the window of your query unless
     * the data fits the criteria of the query.
     */
    add(data) {
        return this.ref.add(data);
    }
    /**
     * Create a reference to a single document in a collection.
     */
    doc(path) {
        // TODO is there a better way to solve this type issue
        return new AngularFirestoreDocument(this.ref.doc(path), this.afs);
    }
}

/**
 * AngularFirestoreDocument service
 *
 * This class creates a reference to a Firestore Document. A reference is provided in
 * in the constructor. The class is generic which gives you type safety for data update
 * methods and data streaming.
 *
 * This class uses Symbol.observable to transform into Observable using Observable.from().
 *
 * This class is rarely used directly and should be created from the AngularFirestore service.
 *
 * Example:
 *
 * const fakeStock = new AngularFirestoreDocument<Stock>(doc('stocks/FAKE'));
 * await fakeStock.set({ name: 'FAKE', price: 0.01 });
 * fakeStock.valueChanges().map(snap => {
 *   if(snap.exists) return snap.data();
 *   return null;
 * }).subscribe(value => console.log(value));
 * // OR! Transform using Observable.from() and the data is unwrapped for you
 * Observable.from(fakeStock).subscribe(value => console.log(value));
 */
class AngularFirestoreDocument {
    /**
     * The constructor takes in a DocumentReference to provide wrapper methods
     * for data operations, data streaming, and Symbol.observable.
     */
    constructor(ref, afs) {
        this.ref = ref;
        this.afs = afs;
    }
    /**
     * Create or overwrite a single document.
     */
    set(data, options) {
        return this.ref.set(data, options);
    }
    /**
     * Update some fields of a document without overwriting the entire document.
     */
    update(data) {
        return this.ref.update(data);
    }
    /**
     * Delete a document.
     */
    delete() {
        return this.ref.delete();
    }
    /**
     * Create a reference to a sub-collection given a path and an optional query
     * function.
     */
    collection(path, queryFn) {
        const collectionRef = this.ref.collection(path);
        const { ref, query } = associateQuery(collectionRef, queryFn);
        return new AngularFirestoreCollection(ref, query, this.afs);
    }
    /**
     * Listen to snapshot updates from the document.
     */
    snapshotChanges() {
        const scheduledFromDocRef$ = fromDocRef(this.ref, this.afs.schedulers.outsideAngular);
        return scheduledFromDocRef$.pipe(keepUnstableUntilFirst);
    }
    valueChanges(options = {}) {
        return this.snapshotChanges().pipe(map(({ payload }) => options.idField ? Object.assign(Object.assign({}, payload.data()), { [options.idField]: payload.id }) : payload.data()));
    }
    /**
     * Retrieve the document once.
     */
    get(options) {
        return from(this.ref.get(options)).pipe(keepUnstableUntilFirst);
    }
}

/**
 * AngularFirestoreCollectionGroup service
 *
 * This class holds a reference to a Firestore Collection Group Query.
 *
 * This class uses Symbol.observable to transform into Observable using Observable.from().
 *
 * This class is rarely used directly and should be created from the AngularFirestore service.
 *
 * Example:
 *
 * const collectionGroup = firebase.firestore.collectionGroup('stocks');
 * const query = collectionRef.where('price', '>', '0.01');
 * const fakeStock = new AngularFirestoreCollectionGroup<Stock>(query, afs);
 *
 * // Subscribe to changes as snapshots. This provides you data updates as well as delta updates.
 * fakeStock.valueChanges().subscribe(value => console.log(value));
 */
class AngularFirestoreCollectionGroup {
    /**
     * The constructor takes in a CollectionGroupQuery to provide wrapper methods
     * for data operations and data streaming.
     */
    constructor(query, afs) {
        this.query = query;
        this.afs = afs;
    }
    /**
     * Listen to the latest change in the stream. This method returns changes
     * as they occur and they are not sorted by query order. This allows you to construct
     * your own data structure.
     */
    stateChanges(events) {
        if (!events || events.length === 0) {
            return docChanges(this.query, this.afs.schedulers.outsideAngular).pipe(keepUnstableUntilFirst);
        }
        return docChanges(this.query, this.afs.schedulers.outsideAngular)
            .pipe(map(actions => actions.filter(change => events.indexOf(change.type) > -1)), filter(changes => changes.length > 0), keepUnstableUntilFirst);
    }
    /**
     * Create a stream of changes as they occur it time. This method is similar to stateChanges()
     * but it collects each event in an array over time.
     */
    auditTrail(events) {
        return this.stateChanges(events).pipe(scan((current, action) => [...current, ...action], []));
    }
    /**
     * Create a stream of synchronized changes. This method keeps the local array in sorted
     * query order.
     */
    snapshotChanges(events) {
        const validatedEvents = validateEventsArray(events);
        const scheduledSortedChanges$ = sortedChanges(this.query, validatedEvents, this.afs.schedulers.outsideAngular);
        return scheduledSortedChanges$.pipe(keepUnstableUntilFirst);
    }
    valueChanges(options = {}) {
        const fromCollectionRefScheduled$ = fromCollectionRef(this.query, this.afs.schedulers.outsideAngular);
        return fromCollectionRefScheduled$
            .pipe(map(actions => actions.payload.docs.map(a => {
            if (options.idField) {
                return Object.assign({ [options.idField]: a.id }, a.data());
            }
            else {
                return a.data();
            }
        })), keepUnstableUntilFirst);
    }
    /**
     * Retrieve the results of the query once.
     */
    get(options) {
        return from(this.query.get(options)).pipe(keepUnstableUntilFirst);
    }
}

/**
 * The value of this token determines whether or not the firestore will have persistance enabled
 */
const ENABLE_PERSISTENCE = new InjectionToken('angularfire2.enableFirestorePersistence');
const PERSISTENCE_SETTINGS = new InjectionToken('angularfire2.firestore.persistenceSettings');
const SETTINGS = new InjectionToken('angularfire2.firestore.settings');
const USE_EMULATOR = new InjectionToken('angularfire2.firestore.use-emulator');
/**
 * A utility methods for associating a collection reference with
 * a query.
 *
 * @param collectionRef - A collection reference to query
 * @param queryFn - The callback to create a query
 *
 * Example:
 * const { query, ref } = associateQuery(docRef.collection('items'), ref => {
 *  return ref.where('age', '<', 200);
 * });
 */
function associateQuery(collectionRef, queryFn = ref => ref) {
    const query = queryFn(collectionRef);
    const ref = collectionRef;
    return { query, ref };
}
/**
 * AngularFirestore Service
 *
 * This service is the main entry point for this feature module. It provides
 * an API for creating Collection and Reference services. These services can
 * then be used to do data updates and observable streams of the data.
 *
 * Example:
 *
 * import { Component } from '@angular/core';
 * import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
 * import { Observable } from 'rxjs/Observable';
 * import { from } from 'rxjs/observable';
 *
 * @Component({
 *   selector: 'app-my-component',
 *   template: `
 *    <h2>Items for {{ (profile | async)?.name }}
 *    <ul>
 *       <li *ngFor="let item of items | async">{{ item.name }}</li>
 *    </ul>
 *    <div class="control-input">
 *       <input type="text" #itemname />
 *       <button (click)="addItem(itemname.value)">Add Item</button>
 *    </div>
 *   `
 * })
 * export class MyComponent implements OnInit {
 *
 *   // services for data operations and data streaming
 *   private readonly itemsRef: AngularFirestoreCollection<Item>;
 *   private readonly profileRef: AngularFirestoreDocument<Profile>;
 *
 *   // observables for template
 *   items: Observable<Item[]>;
 *   profile: Observable<Profile>;
 *
 *   // inject main service
 *   constructor(private readonly afs: AngularFirestore) {}
 *
 *   ngOnInit() {
 *     this.itemsRef = afs.collection('items', ref => ref.where('user', '==', 'davideast').limit(10));
 *     this.items = this.itemsRef.valueChanges().map(snap => snap.docs.map(data => doc.data()));
 *     // this.items = from(this.itemsRef); // you can also do this with no mapping
 *
 *     this.profileRef = afs.doc('users/davideast');
 *     this.profile = this.profileRef.valueChanges();
 *   }
 *
 *   addItem(name: string) {
 *     const user = 'davideast';
 *     this.itemsRef.add({ name, user });
 *   }
 * }
 */
class AngularFirestore {
    /**
     * Each Feature of AngularFire has a FirebaseApp injected. This way we
     * don't rely on the main Firebase App instance and we can create named
     * apps and use multiple apps.
     */
    constructor(options, name, shouldEnablePersistence, settings, 
    // tslint:disable-next-line:ban-types
    platformId, zone, schedulers, persistenceSettings, _useEmulator, auth, useAuthEmulator, authSettings, // can't use firebase.auth.AuthSettings here
    tenantId, languageCode, useDeviceLanguage, persistence, _appCheckInstances) {
        this.schedulers = schedulers;
        const app = ɵfirebaseAppFactory(options, zone, name);
        const useEmulator = _useEmulator;
        if (auth) {
            ɵauthFactory(app, zone, useAuthEmulator, tenantId, languageCode, useDeviceLanguage, authSettings, persistence);
        }
        [this.firestore, this.persistenceEnabled$] = ɵcacheInstance(`${app.name}.firestore`, 'AngularFirestore', app.name, () => {
            const firestore = zone.runOutsideAngular(() => app.firestore());
            if (settings) {
                firestore.settings(settings);
            }
            if (useEmulator) {
                firestore.useEmulator(...useEmulator);
            }
            if (shouldEnablePersistence && !isPlatformServer(platformId)) {
                // We need to try/catch here because not all enablePersistence() failures are caught
                // https://github.com/firebase/firebase-js-sdk/issues/608
                const enablePersistence = () => {
                    try {
                        return from(firestore.enablePersistence(persistenceSettings || undefined).then(() => true, () => false));
                    }
                    catch (e) {
                        if (typeof console !== 'undefined') {
                            console.warn(e);
                        }
                        return of(false);
                    }
                };
                return [firestore, zone.runOutsideAngular(enablePersistence)];
            }
            else {
                return [firestore, of(false)];
            }
        }, [settings, useEmulator, shouldEnablePersistence]);
    }
    collection(pathOrRef, queryFn) {
        let collectionRef;
        if (typeof pathOrRef === 'string') {
            collectionRef = this.firestore.collection(pathOrRef);
        }
        else {
            collectionRef = pathOrRef;
        }
        const { ref, query } = associateQuery(collectionRef, queryFn);
        const refInZone = this.schedulers.ngZone.run(() => ref);
        return new AngularFirestoreCollection(refInZone, query, this);
    }
    /**
     * Create a reference to a Firestore Collection Group based on a collectionId
     * and an optional query function to narrow the result
     * set.
     */
    collectionGroup(collectionId, queryGroupFn) {
        const queryFn = queryGroupFn || (ref => ref);
        const collectionGroup = this.firestore.collectionGroup(collectionId);
        return new AngularFirestoreCollectionGroup(queryFn(collectionGroup), this);
    }
    doc(pathOrRef) {
        let ref;
        if (typeof pathOrRef === 'string') {
            ref = this.firestore.doc(pathOrRef);
        }
        else {
            ref = pathOrRef;
        }
        const refInZone = this.schedulers.ngZone.run(() => ref);
        return new AngularFirestoreDocument(refInZone, this);
    }
    /**
     * Returns a generated Firestore Document Id.
     */
    createId() {
        return this.firestore.collection('_').doc().id;
    }
}
AngularFirestore.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AngularFirestore, deps: [{ token: FIREBASE_OPTIONS }, { token: FIREBASE_APP_NAME, optional: true }, { token: ENABLE_PERSISTENCE, optional: true }, { token: SETTINGS, optional: true }, { token: PLATFORM_ID }, { token: i0.NgZone }, { token: i1.ɵAngularFireSchedulers }, { token: PERSISTENCE_SETTINGS, optional: true }, { token: USE_EMULATOR, optional: true }, { token: i2.AngularFireAuth, optional: true }, { token: USE_EMULATOR$1, optional: true }, { token: SETTINGS$1, optional: true }, { token: TENANT_ID, optional: true }, { token: LANGUAGE_CODE, optional: true }, { token: USE_DEVICE_LANGUAGE, optional: true }, { token: PERSISTENCE, optional: true }, { token: i3.AppCheckInstances, optional: true }], target: i0.ɵɵFactoryTarget.Injectable });
AngularFirestore.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AngularFirestore, providedIn: 'any' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AngularFirestore, decorators: [{
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
                    args: [ENABLE_PERSISTENCE]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [SETTINGS]
                }] }, { type: Object, decorators: [{
                    type: Inject,
                    args: [PLATFORM_ID]
                }] }, { type: i0.NgZone }, { type: i1.ɵAngularFireSchedulers }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [PERSISTENCE_SETTINGS]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [USE_EMULATOR]
                }] }, { type: i2.AngularFireAuth, decorators: [{
                    type: Optional
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [USE_EMULATOR$1]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [SETTINGS$1]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [TENANT_ID]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [LANGUAGE_CODE]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [USE_DEVICE_LANGUAGE]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [PERSISTENCE]
                }] }, { type: i3.AppCheckInstances, decorators: [{
                    type: Optional
                }] }]; } });

class AngularFirestoreModule {
    constructor() {
        firebase.registerVersion('angularfire', VERSION.full, 'fst-compat');
    }
    /**
     * Attempt to enable persistent storage, if possible
     */
    static enablePersistence(persistenceSettings) {
        return {
            ngModule: AngularFirestoreModule,
            providers: [
                { provide: ENABLE_PERSISTENCE, useValue: true },
                { provide: PERSISTENCE_SETTINGS, useValue: persistenceSettings },
            ]
        };
    }
}
AngularFirestoreModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AngularFirestoreModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
AngularFirestoreModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AngularFirestoreModule });
AngularFirestoreModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AngularFirestoreModule, providers: [AngularFirestore] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AngularFirestoreModule, decorators: [{
            type: NgModule,
            args: [{
                    providers: [AngularFirestore]
                }]
        }], ctorParameters: function () { return []; } });

/**
 * Generated bundle index. Do not edit.
 */

export { AngularFirestore, AngularFirestoreCollection, AngularFirestoreCollectionGroup, AngularFirestoreDocument, AngularFirestoreModule, ENABLE_PERSISTENCE, PERSISTENCE_SETTINGS, SETTINGS, USE_EMULATOR, associateQuery, combineChange, combineChanges, docChanges, fromCollectionRef, fromDocRef, fromRef, sortedChanges, validateEventsArray };
//# sourceMappingURL=angular-fire-compat-firestore.js.map
