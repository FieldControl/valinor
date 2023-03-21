import { InjectionToken, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { AssociatedReference, CollectionReference, DocumentReference, PersistenceSettings, QueryFn, QueryGroupFn, Settings } from './interfaces';
import { AngularFirestoreDocument } from './document/document';
import { AngularFirestoreCollection } from './collection/collection';
import { AngularFirestoreCollectionGroup } from './collection-group/collection-group';
import { ɵAngularFireSchedulers } from '@angular/fire';
import { FirebaseOptions } from 'firebase/app';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AppCheckInstances } from '@angular/fire/app-check';
import * as i0 from "@angular/core";
/**
 * The value of this token determines whether or not the firestore will have persistance enabled
 */
export declare const ENABLE_PERSISTENCE: InjectionToken<boolean>;
export declare const PERSISTENCE_SETTINGS: InjectionToken<firebase.firestore.PersistenceSettings>;
export declare const SETTINGS: InjectionToken<firebase.firestore.Settings>;
export declare const USE_EMULATOR: InjectionToken<[host: string, port: number, options?: {
    mockUserToken?: string | firebase.EmulatorMockTokenOptions;
}]>;
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
export declare function associateQuery<T>(collectionRef: CollectionReference<T>, queryFn?: (ref: any) => any): AssociatedReference<T>;
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
export declare class AngularFirestore {
    schedulers: ɵAngularFireSchedulers;
    readonly firestore: firebase.firestore.Firestore;
    readonly persistenceEnabled$: Observable<boolean>;
    /**
     * Each Feature of AngularFire has a FirebaseApp injected. This way we
     * don't rely on the main Firebase App instance and we can create named
     * apps and use multiple apps.
     */
    constructor(options: FirebaseOptions, name: string | null | undefined, shouldEnablePersistence: boolean | null, settings: Settings | null, platformId: Object, zone: NgZone, schedulers: ɵAngularFireSchedulers, persistenceSettings: PersistenceSettings | null, _useEmulator: any, auth: AngularFireAuth, useAuthEmulator: any, authSettings: any, // can't use firebase.auth.AuthSettings here
    tenantId: string | null, languageCode: string | null, useDeviceLanguage: boolean | null, persistence: string | null, _appCheckInstances: AppCheckInstances);
    /**
     * Create a reference to a Firestore Collection based on a path or
     * CollectionReference and an optional query function to narrow the result
     * set.
     */
    collection<T>(path: string, queryFn?: QueryFn): AngularFirestoreCollection<T>;
    collection<T>(ref: CollectionReference, queryFn?: QueryFn): AngularFirestoreCollection<T>;
    /**
     * Create a reference to a Firestore Collection Group based on a collectionId
     * and an optional query function to narrow the result
     * set.
     */
    collectionGroup<T>(collectionId: string, queryGroupFn?: QueryGroupFn<T>): AngularFirestoreCollectionGroup<T>;
    /**
     * Create a reference to a Firestore Document based on a path or
     * DocumentReference. Note that documents are not queryable because they are
     * simply objects. However, documents have sub-collections that return a
     * Collection reference and can be queried.
     */
    doc<T>(path: string): AngularFirestoreDocument<T>;
    doc<T>(ref: DocumentReference): AngularFirestoreDocument<T>;
    /**
     * Returns a generated Firestore Document Id.
     */
    createId(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<AngularFirestore, [null, { optional: true; }, { optional: true; }, { optional: true; }, null, null, null, { optional: true; }, { optional: true; }, { optional: true; }, { optional: true; }, { optional: true; }, { optional: true; }, { optional: true; }, { optional: true; }, { optional: true; }, { optional: true; }]>;
    static ɵprov: i0.ɵɵInjectableDeclaration<AngularFirestore>;
}
