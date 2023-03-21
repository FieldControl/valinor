import { Observable } from 'rxjs';
import { DocumentReference, DocumentData, Query, DocumentSnapshot, QuerySnapshot } from './interfaces';
export declare function fromRef<T = DocumentData>(ref: DocumentReference<T>): Observable<DocumentSnapshot<T>>;
export declare function fromRef<T = DocumentData>(ref: Query<T>): Observable<QuerySnapshot<T>>;
