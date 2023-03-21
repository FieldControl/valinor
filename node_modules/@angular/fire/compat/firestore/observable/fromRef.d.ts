import { Observable, SchedulerLike } from 'rxjs';
import { Action, DocumentReference, DocumentSnapshot, Query, QuerySnapshot } from '../interfaces';
export declare function fromRef<R, T>(ref: DocumentReference<T> | Query<T>, scheduler?: SchedulerLike): Observable<R>;
export declare function fromDocRef<T>(ref: DocumentReference<T>, scheduler?: SchedulerLike): Observable<Action<DocumentSnapshot<T>>>;
export declare function fromCollectionRef<T>(ref: Query<T>, scheduler?: SchedulerLike): Observable<Action<QuerySnapshot<T>>>;
