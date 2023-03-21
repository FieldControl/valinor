import { Inject, Injectable, InjectionToken, NgZone, Optional, PLATFORM_ID } from '@angular/core';
import { from, of } from 'rxjs';
import { AngularFirestoreDocument } from './document/document';
import { AngularFirestoreCollection } from './collection/collection';
import { AngularFirestoreCollectionGroup } from './collection-group/collection-group';
import { ɵAngularFireSchedulers } from '@angular/fire';
import { ɵfirebaseAppFactory, FIREBASE_APP_NAME, FIREBASE_OPTIONS, ɵcacheInstance } from '@angular/fire/compat';
import { isPlatformServer } from '@angular/common';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { AngularFireAuth, USE_EMULATOR as USE_AUTH_EMULATOR, SETTINGS as AUTH_SETTINGS, TENANT_ID, LANGUAGE_CODE, USE_DEVICE_LANGUAGE, PERSISTENCE, ɵauthFactory, } from '@angular/fire/compat/auth';
import { AppCheckInstances } from '@angular/fire/app-check';
import * as i0 from "@angular/core";
import * as i1 from "@angular/fire";
import * as i2 from "@angular/fire/compat/auth";
import * as i3 from "@angular/fire/app-check";
/**
 * The value of this token determines whether or not the firestore will have persistance enabled
 */
export const ENABLE_PERSISTENCE = new InjectionToken('angularfire2.enableFirestorePersistence');
export const PERSISTENCE_SETTINGS = new InjectionToken('angularfire2.firestore.persistenceSettings');
export const SETTINGS = new InjectionToken('angularfire2.firestore.settings');
export const USE_EMULATOR = new InjectionToken('angularfire2.firestore.use-emulator');
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
export function associateQuery(collectionRef, queryFn = ref => ref) {
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
export class AngularFirestore {
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
AngularFirestore.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.3", ngImport: i0, type: AngularFirestore, deps: [{ token: FIREBASE_OPTIONS }, { token: FIREBASE_APP_NAME, optional: true }, { token: ENABLE_PERSISTENCE, optional: true }, { token: SETTINGS, optional: true }, { token: PLATFORM_ID }, { token: i0.NgZone }, { token: i1.ɵAngularFireSchedulers }, { token: PERSISTENCE_SETTINGS, optional: true }, { token: USE_EMULATOR, optional: true }, { token: i2.AngularFireAuth, optional: true }, { token: USE_AUTH_EMULATOR, optional: true }, { token: AUTH_SETTINGS, optional: true }, { token: TENANT_ID, optional: true }, { token: LANGUAGE_CODE, optional: true }, { token: USE_DEVICE_LANGUAGE, optional: true }, { token: PERSISTENCE, optional: true }, { token: i3.AppCheckInstances, optional: true }], target: i0.ɵɵFactoryTarget.Injectable });
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
                    args: [USE_AUTH_EMULATOR]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [AUTH_SETTINGS]
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlyZXN0b3JlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NvbXBhdC9maXJlc3RvcmUvZmlyZXN0b3JlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNsRyxPQUFPLEVBQUUsSUFBSSxFQUFjLEVBQUUsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQVc1QyxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUMvRCxPQUFPLEVBQUUsMEJBQTBCLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUNyRSxPQUFPLEVBQUUsK0JBQStCLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUN0RixPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDdkQsT0FBTyxFQUFlLG1CQUFtQixFQUFFLGlCQUFpQixFQUFFLGdCQUFnQixFQUFFLGNBQWMsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBRTdILE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBRW5ELE9BQU8sc0JBQXNCLENBQUM7QUFDOUIsT0FBTywyQkFBMkIsQ0FBQztBQUNuQyxPQUFPLEVBQ0wsZUFBZSxFQUNmLFlBQVksSUFBSSxpQkFBaUIsRUFDakMsUUFBUSxJQUFJLGFBQWEsRUFDekIsU0FBUyxFQUNULGFBQWEsRUFDYixtQkFBbUIsRUFDbkIsV0FBVyxFQUNYLFlBQVksR0FDYixNQUFNLDJCQUEyQixDQUFDO0FBQ25DLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHlCQUF5QixDQUFDOzs7OztBQUU1RDs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLGtCQUFrQixHQUFHLElBQUksY0FBYyxDQUFVLHlDQUF5QyxDQUFDLENBQUM7QUFDekcsTUFB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LFFBQVE7OzBCQUFJLE1BQU07MkJBQUMsb0JBQW9COzswQkFDdkMsUUFBUTs7MEJBQUksTUFBTTsyQkFBQyxZQUFZOzswQkFDL0IsUUFBUTs7MEJBQ1IsUUFBUTs7MEJBQUksTUFBTTsyQkFBQyxpQkFBaUI7OzBCQUNwQyxRQUFROzswQkFBSSxNQUFNOzJCQUFDLGFBQWE7OzBCQUNoQyxRQUFROzswQkFBSSxNQUFNOzJCQUFDLFNBQVM7OzBCQUM1QixRQUFROzswQkFBSSxNQUFNOzJCQUFDLGFBQWE7OzBCQUNoQyxRQUFROzswQkFBSSxNQUFNOzJCQUFDLG1CQUFtQjs7MEJBQ3RDLFFBQVE7OzBCQUFJLE1BQU07MkJBQUMsV0FBVzs7MEJBQzlCLFFBQVEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3QsIEluamVjdGFibGUsIEluamVjdGlvblRva2VuLCBOZ1pvbmUsIE9wdGlvbmFsLCBQTEFURk9STV9JRCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgZnJvbSwgT2JzZXJ2YWJsZSwgb2YgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7XG4gIEFzc29jaWF0ZWRSZWZlcmVuY2UsXG4gIENvbGxlY3Rpb25SZWZlcmVuY2UsXG4gIERvY3VtZW50UmVmZXJlbmNlLFxuICBQZXJzaXN0ZW5jZVNldHRpbmdzLFxuICBRdWVyeSxcbiAgUXVlcnlGbixcbiAgUXVlcnlHcm91cEZuLFxuICBTZXR0aW5nc1xufSBmcm9tICcuL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgQW5ndWxhckZpcmVzdG9yZURvY3VtZW50IH0gZnJvbSAnLi9kb2N1bWVudC9kb2N1bWVudCc7XG5pbXBvcnQgeyBBbmd1bGFyRmlyZXN0b3JlQ29sbGVjdGlvbiB9IGZyb20gJy4vY29sbGVjdGlvbi9jb2xsZWN0aW9uJztcbmltcG9ydCB7IEFuZ3VsYXJGaXJlc3RvcmVDb2xsZWN0aW9uR3JvdXAgfSBmcm9tICcuL2NvbGxlY3Rpb24tZ3JvdXAvY29sbGVjdGlvbi1ncm91cCc7XG5pbXBvcnQgeyDJtUFuZ3VsYXJGaXJlU2NoZWR1bGVycyB9IGZyb20gJ0Bhbmd1bGFyL2ZpcmUnO1xuaW1wb3J0IHsgRmlyZWJhc2VBcHAsIMm1ZmlyZWJhc2VBcHBGYWN0b3J5LCBGSVJFQkFTRV9BUFBfTkFNRSwgRklSRUJBU0VfT1BUSU9OUywgybVjYWNoZUluc3RhbmNlIH0gZnJvbSAnQGFuZ3VsYXIvZmlyZS9jb21wYXQnO1xuaW1wb3J0IHsgRmlyZWJhc2VPcHRpb25zIH0gZnJvbSAnZmlyZWJhc2UvYXBwJztcbmltcG9ydCB7IGlzUGxhdGZvcm1TZXJ2ZXIgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IGZpcmViYXNlIGZyb20gJ2ZpcmViYXNlL2NvbXBhdC9hcHAnO1xuaW1wb3J0ICdmaXJlYmFzZS9jb21wYXQvYXV0aCc7XG5pbXBvcnQgJ2ZpcmViYXNlL2NvbXBhdC9maXJlc3RvcmUnO1xuaW1wb3J0IHtcbiAgQW5ndWxhckZpcmVBdXRoLFxuICBVU0VfRU1VTEFUT1IgYXMgVVNFX0FVVEhfRU1VTEFUT1IsXG4gIFNFVFRJTkdTIGFzIEFVVEhfU0VUVElOR1MsXG4gIFRFTkFOVF9JRCxcbiAgTEFOR1VBR0VfQ09ERSxcbiAgVVNFX0RFVklDRV9MQU5HVUFHRSxcbiAgUEVSU0lTVEVOQ0UsXG4gIMm1YXV0aEZhY3RvcnksXG59IGZyb20gJ0Bhbmd1bGFyL2ZpcmUvY29tcGF0L2F1dGgnO1xuaW1wb3J0IHsgQXBwQ2hlY2tJbnN0YW5jZXMgfSBmcm9tICdAYW5ndWxhci9maXJlL2FwcC1jaGVjayc7XG5cbi8qKlxuICogVGhlIHZhbHVlIG9mIHRoaXMgdG9rZW4gZGV0ZXJtaW5lcyB3aGV0aGVyIG9yIG5vdCB0aGUgZmlyZXN0b3JlIHdpbGwgaGF2ZSBwZXJzaXN0YW5jZSBlbmFibGVkXG4gKi9cbmV4cG9ydCBjb25zdCBFTkFCTEVfUEVSU0lTVEVOQ0UgPSBuZXcgSW5qZWN0aW9uVG9rZW48Ym9vbGVhbj4oJ2FuZ3VsYXJmaXJlMi5lbmFibGVGaXJlc3RvcmVQZXJzaXN0ZW5jZScpO1xuZXhwb3J0IGNvbnN0IFBFUlNJU1RFTkNFX1NFVFRJTkdTID0gbmV3IEluamVjdGlvblRva2VuPFBlcnNpc3RlbmNlU2V0dGluZ3MgfCB1bmRlZmluZWQ+KCdhbmd1bGFyZmlyZTIuZmlyZXN0b3JlLnBlcnNpc3RlbmNlU2V0dGluZ3MnKTtcbmV4cG9ydCBjb25zdCBTRVRUSU5HUyA9IG5ldyBJbmplY3Rpb25Ub2tlbjxTZXR0aW5ncz4oJ2FuZ3VsYXJmaXJlMi5maXJlc3RvcmUuc2V0dGluZ3MnKTtcblxudHlwZSBVc2VFbXVsYXRvckFyZ3VtZW50cyA9IFBhcmFtZXRlcnM8ZmlyZWJhc2UuZmlyZXN0b3JlLkZpcmVzdG9yZVsndXNlRW11bGF0b3InXT47XG5leHBvcnQgY29uc3QgVVNFX0VNVUxBVE9SID0gbmV3IEluamVjdGlvblRva2VuPFVzZUVtdWxhdG9yQXJndW1lbnRzPignYW5ndWxhcmZpcmUyLmZpcmVzdG9yZS51c2UtZW11bGF0b3InKTtcblxuLyoqXG4gKiBBIHV0aWxpdHkgbWV0aG9kcyBmb3IgYXNzb2NpYXRpbmcgYSBjb2xsZWN0aW9uIHJlZmVyZW5jZSB3aXRoXG4gKiBhIHF1ZXJ5LlxuICpcbiAqIEBwYXJhbSBjb2xsZWN0aW9uUmVmIC0gQSBjb2xsZWN0aW9uIHJlZmVyZW5jZSB0byBxdWVyeVxuICogQHBhcmFtIHF1ZXJ5Rm4gLSBUaGUgY2FsbGJhY2sgdG8gY3JlYXRlIGEgcXVlcnlcbiAqXG4gKiBFeGFtcGxlOlxuICogY29uc3QgeyBxdWVyeSwgcmVmIH0gPSBhc3NvY2lhdGVRdWVyeShkb2NSZWYuY29sbGVjdGlvbignaXRlbXMnKSwgcmVmID0+IHtcbiAqICByZXR1cm4gcmVmLndoZXJlKCdhZ2UnLCAnPCcsIDIwMCk7XG4gKiB9KTtcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFzc29jaWF0ZVF1ZXJ5PFQ+KGNvbGxlY3Rpb25SZWY6IENvbGxlY3Rpb25SZWZlcmVuY2U8VD4sIHF1ZXJ5Rm4gPSByZWYgPT4gcmVmKTogQXNzb2NpYXRlZFJlZmVyZW5jZTxUPiB7XG4gIGNvbnN0IHF1ZXJ5ID0gcXVlcnlGbihjb2xsZWN0aW9uUmVmKTtcbiAgY29uc3QgcmVmID0gY29sbGVjdGlvblJlZjtcbiAgcmV0dXJuIHsgcXVlcnksIHJlZiB9O1xufVxuXG50eXBlIEluc3RhbmNlQ2FjaGUgPSBNYXA8RmlyZWJhc2VBcHAsIFtcbiAgZmlyZWJhc2UuZmlyZXN0b3JlLkZpcmVzdG9yZSxcbiAgZmlyZWJhc2UuZmlyZXN0b3JlLlNldHRpbmdzIHwgbnVsbCxcbiAgVXNlRW11bGF0b3JBcmd1bWVudHMgfCBudWxsLFxuICBib29sZWFuIHwgbnVsbF1cbj47XG5cbi8qKlxuICogQW5ndWxhckZpcmVzdG9yZSBTZXJ2aWNlXG4gKlxuICogVGhpcyBzZXJ2aWNlIGlzIHRoZSBtYWluIGVudHJ5IHBvaW50IGZvciB0aGlzIGZlYXR1cmUgbW9kdWxlLiBJdCBwcm92aWRlc1xuICogYW4gQVBJIGZvciBjcmVhdGluZyBDb2xsZWN0aW9uIGFuZCBSZWZlcmVuY2Ugc2VydmljZXMuIFRoZXNlIHNlcnZpY2VzIGNhblxuICogdGhlbiBiZSB1c2VkIHRvIGRvIGRhdGEgdXBkYXRlcyBhbmQgb2JzZXJ2YWJsZSBzdHJlYW1zIG9mIHRoZSBkYXRhLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogaW1wb3J0IHsgQ29tcG9uZW50IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG4gKiBpbXBvcnQgeyBBbmd1bGFyRmlyZXN0b3JlLCBBbmd1bGFyRmlyZXN0b3JlQ29sbGVjdGlvbiwgQW5ndWxhckZpcmVzdG9yZURvY3VtZW50IH0gZnJvbSAnQGFuZ3VsYXIvZmlyZS9maXJlc3RvcmUnO1xuICogaW1wb3J0IHsgT2JzZXJ2YWJsZSB9IGZyb20gJ3J4anMvT2JzZXJ2YWJsZSc7XG4gKiBpbXBvcnQgeyBmcm9tIH0gZnJvbSAncnhqcy9vYnNlcnZhYmxlJztcbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdhcHAtbXktY29tcG9uZW50JyxcbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgIDxoMj5JdGVtcyBmb3Ige3sgKHByb2ZpbGUgfCBhc3luYyk/Lm5hbWUgfX1cbiAqICAgIDx1bD5cbiAqICAgICAgIDxsaSAqbmdGb3I9XCJsZXQgaXRlbSBvZiBpdGVtcyB8IGFzeW5jXCI+e3sgaXRlbS5uYW1lIH19PC9saT5cbiAqICAgIDwvdWw+XG4gKiAgICA8ZGl2IGNsYXNzPVwiY29udHJvbC1pbnB1dFwiPlxuICogICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgI2l0ZW1uYW1lIC8+XG4gKiAgICAgICA8YnV0dG9uIChjbGljayk9XCJhZGRJdGVtKGl0ZW1uYW1lLnZhbHVlKVwiPkFkZCBJdGVtPC9idXR0b24+XG4gKiAgICA8L2Rpdj5cbiAqICAgYFxuICogfSlcbiAqIGV4cG9ydCBjbGFzcyBNeUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCB7XG4gKlxuICogICAvLyBzZXJ2aWNlcyBmb3IgZGF0YSBvcGVyYXRpb25zIGFuZCBkYXRhIHN0cmVhbWluZ1xuICogICBwcml2YXRlIHJlYWRvbmx5IGl0ZW1zUmVmOiBBbmd1bGFyRmlyZXN0b3JlQ29sbGVjdGlvbjxJdGVtPjtcbiAqICAgcHJpdmF0ZSByZWFkb25seSBwcm9maWxlUmVmOiBBbmd1bGFyRmlyZXN0b3JlRG9jdW1lbnQ8UHJvZmlsZT47XG4gKlxuICogICAvLyBvYnNlcnZhYmxlcyBmb3IgdGVtcGxhdGVcbiAqICAgaXRlbXM6IE9ic2VydmFibGU8SXRlbVtdPjtcbiAqICAgcHJvZmlsZTogT2JzZXJ2YWJsZTxQcm9maWxlPjtcbiAqXG4gKiAgIC8vIGluamVjdCBtYWluIHNlcnZpY2VcbiAqICAgY29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBhZnM6IEFuZ3VsYXJGaXJlc3RvcmUpIHt9XG4gKlxuICogICBuZ09uSW5pdCgpIHtcbiAqICAgICB0aGlzLml0ZW1zUmVmID0gYWZzLmNvbGxlY3Rpb24oJ2l0ZW1zJywgcmVmID0+IHJlZi53aGVyZSgndXNlcicsICc9PScsICdkYXZpZGVhc3QnKS5saW1pdCgxMCkpO1xuICogICAgIHRoaXMuaXRlbXMgPSB0aGlzLml0ZW1zUmVmLnZhbHVlQ2hhbmdlcygpLm1hcChzbmFwID0+IHNuYXAuZG9jcy5tYXAoZGF0YSA9PiBkb2MuZGF0YSgpKSk7XG4gKiAgICAgLy8gdGhpcy5pdGVtcyA9IGZyb20odGhpcy5pdGVtc1JlZik7IC8vIHlvdSBjYW4gYWxzbyBkbyB0aGlzIHdpdGggbm8gbWFwcGluZ1xuICpcbiAqICAgICB0aGlzLnByb2ZpbGVSZWYgPSBhZnMuZG9jKCd1c2Vycy9kYXZpZGVhc3QnKTtcbiAqICAgICB0aGlzLnByb2ZpbGUgPSB0aGlzLnByb2ZpbGVSZWYudmFsdWVDaGFuZ2VzKCk7XG4gKiAgIH1cbiAqXG4gKiAgIGFkZEl0ZW0obmFtZTogc3RyaW5nKSB7XG4gKiAgICAgY29uc3QgdXNlciA9ICdkYXZpZGVhc3QnO1xuICogICAgIHRoaXMuaXRlbXNSZWYuYWRkKHsgbmFtZSwgdXNlciB9KTtcbiAqICAgfVxuICogfVxuICovXG5ASW5qZWN0YWJsZSh7XG4gIHByb3ZpZGVkSW46ICdhbnknXG59KVxuZXhwb3J0IGNsYXNzIEFuZ3VsYXJGaXJlc3RvcmUge1xuICBwdWJsaWMgcmVhZG9ubHkgZmlyZXN0b3JlOiBmaXJlYmFzZS5maXJlc3RvcmUuRmlyZXN0b3JlO1xuICBwdWJsaWMgcmVhZG9ubHkgcGVyc2lzdGVuY2VFbmFibGVkJDogT2JzZXJ2YWJsZTxib29sZWFuPjtcblxuICAvKipcbiAgICogRWFjaCBGZWF0dXJlIG9mIEFuZ3VsYXJGaXJlIGhhcyBhIEZpcmViYXNlQXBwIGluamVjdGVkLiBUaGlzIHdheSB3ZVxuICAgKiBkb24ndCByZWx5IG9uIHRoZSBtYWluIEZpcmViYXNlIEFwcCBpbnN0YW5jZSBhbmQgd2UgY2FuIGNyZWF0ZSBuYW1lZFxuICAgKiBhcHBzIGFuZCB1c2UgbXVsdGlwbGUgYXBwcy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKFxuICAgIEBJbmplY3QoRklSRUJBU0VfT1BUSU9OUykgb3B0aW9uczogRmlyZWJhc2VPcHRpb25zLFxuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoRklSRUJBU0VfQVBQX05BTUUpIG5hbWU6IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQsXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChFTkFCTEVfUEVSU0lTVEVOQ0UpIHNob3VsZEVuYWJsZVBlcnNpc3RlbmNlOiBib29sZWFuIHwgbnVsbCxcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KFNFVFRJTkdTKSBzZXR0aW5nczogU2V0dGluZ3MgfCBudWxsLFxuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpiYW4tdHlwZXNcbiAgICBASW5qZWN0KFBMQVRGT1JNX0lEKSBwbGF0Zm9ybUlkOiBPYmplY3QsXG4gICAgem9uZTogTmdab25lLFxuICAgIHB1YmxpYyBzY2hlZHVsZXJzOiDJtUFuZ3VsYXJGaXJlU2NoZWR1bGVycyxcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KFBFUlNJU1RFTkNFX1NFVFRJTkdTKSBwZXJzaXN0ZW5jZVNldHRpbmdzOiBQZXJzaXN0ZW5jZVNldHRpbmdzIHwgbnVsbCxcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KFVTRV9FTVVMQVRPUikgX3VzZUVtdWxhdG9yOiBhbnksXG4gICAgQE9wdGlvbmFsKCkgYXV0aDogQW5ndWxhckZpcmVBdXRoLFxuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoVVNFX0FVVEhfRU1VTEFUT1IpIHVzZUF1dGhFbXVsYXRvcjogYW55LFxuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoQVVUSF9TRVRUSU5HUykgYXV0aFNldHRpbmdzOiBhbnksIC8vIGNhbid0IHVzZSBmaXJlYmFzZS5hdXRoLkF1dGhTZXR0aW5ncyBoZXJlXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChURU5BTlRfSUQpIHRlbmFudElkOiBzdHJpbmcgfCBudWxsLFxuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoTEFOR1VBR0VfQ09ERSkgbGFuZ3VhZ2VDb2RlOiBzdHJpbmcgfCBudWxsLFxuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoVVNFX0RFVklDRV9MQU5HVUFHRSkgdXNlRGV2aWNlTGFuZ3VhZ2U6IGJvb2xlYW4gfCBudWxsLFxuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoUEVSU0lTVEVOQ0UpIHBlcnNpc3RlbmNlOiBzdHJpbmcgfCBudWxsLFxuICAgIEBPcHRpb25hbCgpIF9hcHBDaGVja0luc3RhbmNlczogQXBwQ2hlY2tJbnN0YW5jZXMsXG4gICkge1xuICAgIGNvbnN0IGFwcCA9IMm1ZmlyZWJhc2VBcHBGYWN0b3J5KG9wdGlvbnMsIHpvbmUsIG5hbWUpO1xuICAgIGNvbnN0IHVzZUVtdWxhdG9yOiBVc2VFbXVsYXRvckFyZ3VtZW50cyB8IG51bGwgPSBfdXNlRW11bGF0b3I7XG5cbiAgICBpZiAoYXV0aCkge1xuICAgICAgybVhdXRoRmFjdG9yeShhcHAsIHpvbmUsIHVzZUF1dGhFbXVsYXRvciwgdGVuYW50SWQsIGxhbmd1YWdlQ29kZSwgdXNlRGV2aWNlTGFuZ3VhZ2UsIGF1dGhTZXR0aW5ncywgcGVyc2lzdGVuY2UpO1xuICAgIH1cblxuICAgIFt0aGlzLmZpcmVzdG9yZSwgdGhpcy5wZXJzaXN0ZW5jZUVuYWJsZWQkXSA9IMm1Y2FjaGVJbnN0YW5jZShgJHthcHAubmFtZX0uZmlyZXN0b3JlYCwgJ0FuZ3VsYXJGaXJlc3RvcmUnLCBhcHAubmFtZSwgKCkgPT4ge1xuICAgICAgY29uc3QgZmlyZXN0b3JlID0gem9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiBhcHAuZmlyZXN0b3JlKCkpO1xuICAgICAgaWYgKHNldHRpbmdzKSB7XG4gICAgICAgIGZpcmVzdG9yZS5zZXR0aW5ncyhzZXR0aW5ncyk7XG4gICAgICB9XG4gICAgICBpZiAodXNlRW11bGF0b3IpIHtcbiAgICAgICAgZmlyZXN0b3JlLnVzZUVtdWxhdG9yKC4uLnVzZUVtdWxhdG9yKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHNob3VsZEVuYWJsZVBlcnNpc3RlbmNlICYmICFpc1BsYXRmb3JtU2VydmVyKHBsYXRmb3JtSWQpKSB7XG4gICAgICAgIC8vIFdlIG5lZWQgdG8gdHJ5L2NhdGNoIGhlcmUgYmVjYXVzZSBub3QgYWxsIGVuYWJsZVBlcnNpc3RlbmNlKCkgZmFpbHVyZXMgYXJlIGNhdWdodFxuICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vZmlyZWJhc2UvZmlyZWJhc2UtanMtc2RrL2lzc3Vlcy82MDhcbiAgICAgICAgY29uc3QgZW5hYmxlUGVyc2lzdGVuY2UgPSAoKSA9PiB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJldHVybiBmcm9tKGZpcmVzdG9yZS5lbmFibGVQZXJzaXN0ZW5jZShwZXJzaXN0ZW5jZVNldHRpbmdzIHx8IHVuZGVmaW5lZCkudGhlbigoKSA9PiB0cnVlLCAoKSA9PiBmYWxzZSkpO1xuICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCcpIHsgY29uc29sZS53YXJuKGUpOyB9XG4gICAgICAgICAgICByZXR1cm4gb2YoZmFsc2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIFtmaXJlc3RvcmUsIHpvbmUucnVuT3V0c2lkZUFuZ3VsYXIoZW5hYmxlUGVyc2lzdGVuY2UpXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBbZmlyZXN0b3JlLCBvZihmYWxzZSldO1xuICAgICAgfVxuXG4gICAgfSwgW3NldHRpbmdzLCB1c2VFbXVsYXRvciwgc2hvdWxkRW5hYmxlUGVyc2lzdGVuY2VdKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSByZWZlcmVuY2UgdG8gYSBGaXJlc3RvcmUgQ29sbGVjdGlvbiBiYXNlZCBvbiBhIHBhdGggb3JcbiAgICogQ29sbGVjdGlvblJlZmVyZW5jZSBhbmQgYW4gb3B0aW9uYWwgcXVlcnkgZnVuY3Rpb24gdG8gbmFycm93IHRoZSByZXN1bHRcbiAgICogc2V0LlxuICAgKi9cbiAgY29sbGVjdGlvbjxUPihwYXRoOiBzdHJpbmcsIHF1ZXJ5Rm4/OiBRdWVyeUZuKTogQW5ndWxhckZpcmVzdG9yZUNvbGxlY3Rpb248VD47XG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTp1bmlmaWVkLXNpZ25hdHVyZXNcbiAgY29sbGVjdGlvbjxUPihyZWY6IENvbGxlY3Rpb25SZWZlcmVuY2UsIHF1ZXJ5Rm4/OiBRdWVyeUZuKTogQW5ndWxhckZpcmVzdG9yZUNvbGxlY3Rpb248VD47XG4gIGNvbGxlY3Rpb248VD4ocGF0aE9yUmVmOiBzdHJpbmcgfCBDb2xsZWN0aW9uUmVmZXJlbmNlPFQ+LCBxdWVyeUZuPzogUXVlcnlGbik6IEFuZ3VsYXJGaXJlc3RvcmVDb2xsZWN0aW9uPFQ+IHtcbiAgICBsZXQgY29sbGVjdGlvblJlZjogQ29sbGVjdGlvblJlZmVyZW5jZTxUPjtcbiAgICBpZiAodHlwZW9mIHBhdGhPclJlZiA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGNvbGxlY3Rpb25SZWYgPSB0aGlzLmZpcmVzdG9yZS5jb2xsZWN0aW9uKHBhdGhPclJlZikgYXMgZmlyZWJhc2UuZmlyZXN0b3JlLkNvbGxlY3Rpb25SZWZlcmVuY2U8VD47XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbGxlY3Rpb25SZWYgPSBwYXRoT3JSZWY7XG4gICAgfVxuICAgIGNvbnN0IHsgcmVmLCBxdWVyeSB9ID0gYXNzb2NpYXRlUXVlcnk8VD4oY29sbGVjdGlvblJlZiwgcXVlcnlGbik7XG4gICAgY29uc3QgcmVmSW5ab25lID0gdGhpcy5zY2hlZHVsZXJzLm5nWm9uZS5ydW4oKCkgPT4gcmVmKTtcbiAgICByZXR1cm4gbmV3IEFuZ3VsYXJGaXJlc3RvcmVDb2xsZWN0aW9uPFQ+KHJlZkluWm9uZSwgcXVlcnksIHRoaXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIHJlZmVyZW5jZSB0byBhIEZpcmVzdG9yZSBDb2xsZWN0aW9uIEdyb3VwIGJhc2VkIG9uIGEgY29sbGVjdGlvbklkXG4gICAqIGFuZCBhbiBvcHRpb25hbCBxdWVyeSBmdW5jdGlvbiB0byBuYXJyb3cgdGhlIHJlc3VsdFxuICAgKiBzZXQuXG4gICAqL1xuICBjb2xsZWN0aW9uR3JvdXA8VD4oY29sbGVjdGlvbklkOiBzdHJpbmcsIHF1ZXJ5R3JvdXBGbj86IFF1ZXJ5R3JvdXBGbjxUPik6IEFuZ3VsYXJGaXJlc3RvcmVDb2xsZWN0aW9uR3JvdXA8VD4ge1xuICAgIGNvbnN0IHF1ZXJ5Rm4gPSBxdWVyeUdyb3VwRm4gfHwgKHJlZiA9PiByZWYpO1xuICAgIGNvbnN0IGNvbGxlY3Rpb25Hcm91cDogUXVlcnk8VD4gPSB0aGlzLmZpcmVzdG9yZS5jb2xsZWN0aW9uR3JvdXAoY29sbGVjdGlvbklkKSBhcyBmaXJlYmFzZS5maXJlc3RvcmUuUXVlcnk8VD47XG4gICAgcmV0dXJuIG5ldyBBbmd1bGFyRmlyZXN0b3JlQ29sbGVjdGlvbkdyb3VwPFQ+KHF1ZXJ5Rm4oY29sbGVjdGlvbkdyb3VwKSwgdGhpcyk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgcmVmZXJlbmNlIHRvIGEgRmlyZXN0b3JlIERvY3VtZW50IGJhc2VkIG9uIGEgcGF0aCBvclxuICAgKiBEb2N1bWVudFJlZmVyZW5jZS4gTm90ZSB0aGF0IGRvY3VtZW50cyBhcmUgbm90IHF1ZXJ5YWJsZSBiZWNhdXNlIHRoZXkgYXJlXG4gICAqIHNpbXBseSBvYmplY3RzLiBIb3dldmVyLCBkb2N1bWVudHMgaGF2ZSBzdWItY29sbGVjdGlvbnMgdGhhdCByZXR1cm4gYVxuICAgKiBDb2xsZWN0aW9uIHJlZmVyZW5jZSBhbmQgY2FuIGJlIHF1ZXJpZWQuXG4gICAqL1xuICBkb2M8VD4ocGF0aDogc3RyaW5nKTogQW5ndWxhckZpcmVzdG9yZURvY3VtZW50PFQ+O1xuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6dW5pZmllZC1zaWduYXR1cmVzXG4gIGRvYzxUPihyZWY6IERvY3VtZW50UmVmZXJlbmNlKTogQW5ndWxhckZpcmVzdG9yZURvY3VtZW50PFQ+O1xuICBkb2M8VD4ocGF0aE9yUmVmOiBzdHJpbmcgfCBEb2N1bWVudFJlZmVyZW5jZTxUPik6IEFuZ3VsYXJGaXJlc3RvcmVEb2N1bWVudDxUPiB7XG4gICAgbGV0IHJlZjogRG9jdW1lbnRSZWZlcmVuY2U8VD47XG4gICAgaWYgKHR5cGVvZiBwYXRoT3JSZWYgPT09ICdzdHJpbmcnKSB7XG4gICAgICByZWYgPSB0aGlzLmZpcmVzdG9yZS5kb2MocGF0aE9yUmVmKSBhcyBmaXJlYmFzZS5maXJlc3RvcmUuRG9jdW1lbnRSZWZlcmVuY2U8VD47XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlZiA9IHBhdGhPclJlZjtcbiAgICB9XG4gICAgY29uc3QgcmVmSW5ab25lID0gdGhpcy5zY2hlZHVsZXJzLm5nWm9uZS5ydW4oKCkgPT4gcmVmKTtcbiAgICByZXR1cm4gbmV3IEFuZ3VsYXJGaXJlc3RvcmVEb2N1bWVudDxUPihyZWZJblpvbmUsIHRoaXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBnZW5lcmF0ZWQgRmlyZXN0b3JlIERvY3VtZW50IElkLlxuICAgKi9cbiAgY3JlYXRlSWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZmlyZXN0b3JlLmNvbGxlY3Rpb24oJ18nKS5kb2MoKS5pZDtcbiAgfVxufVxuIl19