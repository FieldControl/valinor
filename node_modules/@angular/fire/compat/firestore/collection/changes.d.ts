import { Observable, SchedulerLike } from 'rxjs';
import { DocumentChange, DocumentChangeAction, DocumentChangeType, Query } from '../interfaces';
/**
 * Return a stream of document changes on a query. These results are not in sort order but in
 * order of occurence.
 */
export declare function docChanges<T>(query: Query, scheduler?: SchedulerLike): Observable<DocumentChangeAction<T>[]>;
/**
 * Return a stream of document changes on a query. These results are in sort order.
 */
export declare function sortedChanges<T>(query: Query, events: DocumentChangeType[], scheduler?: SchedulerLike): Observable<DocumentChangeAction<T>[]>;
/**
 * Combines the total result set from the current set of changes from an incoming set
 * of changes.
 */
export declare function combineChanges<T>(current: DocumentChange<T>[], changes: DocumentChange<T>[], events: DocumentChangeType[]): DocumentChange<T>[];
/**
 * Creates a new sorted array from a new change.
 * Build our own because we allow filtering of action types ('added', 'removed', 'modified') before scanning
 * and so we have greater control over change detection (by breaking ===)
 */
export declare function combineChange<T>(combined: DocumentChange<T>[], change: DocumentChange<T>): DocumentChange<T>[];
