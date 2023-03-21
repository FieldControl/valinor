import { Observable } from 'rxjs';
import firebase from 'firebase/compat/app';
import { DocumentChangeAction, DocumentChangeType, DocumentData, Query } from '../interfaces';
import { AngularFirestore } from '../firestore';
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
export declare class AngularFirestoreCollectionGroup<T = DocumentData> {
    private readonly query;
    private readonly afs;
    /**
     * The constructor takes in a CollectionGroupQuery to provide wrapper methods
     * for data operations and data streaming.
     */
    constructor(query: Query<T>, afs: AngularFirestore);
    /**
     * Listen to the latest change in the stream. This method returns changes
     * as they occur and they are not sorted by query order. This allows you to construct
     * your own data structure.
     */
    stateChanges(events?: DocumentChangeType[]): Observable<DocumentChangeAction<T>[]>;
    /**
     * Create a stream of changes as they occur it time. This method is similar to stateChanges()
     * but it collects each event in an array over time.
     */
    auditTrail(events?: DocumentChangeType[]): Observable<DocumentChangeAction<T>[]>;
    /**
     * Create a stream of synchronized changes. This method keeps the local array in sorted
     * query order.
     */
    snapshotChanges(events?: DocumentChangeType[]): Observable<DocumentChangeAction<T>[]>;
    /**
     * Listen to all documents in the collection and its possible query as an Observable.
     *
     * If the `idField` option is provided, document IDs are included and mapped to the
     * provided `idField` property name.
     */
    valueChanges(): Observable<T[]>;
    valueChanges({}: {}): Observable<T[]>;
    valueChanges<K extends string>(options: {
        idField: K;
    }): Observable<(T & {
        [T in K]: string;
    })[]>;
    /**
     * Retrieve the results of the query once.
     */
    get(options?: firebase.firestore.GetOptions): Observable<firebase.firestore.QuerySnapshot<T>>;
}
