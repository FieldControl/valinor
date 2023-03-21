/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { Observable } from 'rxjs';
import { DocumentChangeType, DocumentChange, Query, QueryDocumentSnapshot, DocumentData } from '../interfaces';
/**
 * Return a stream of document changes on a query. These results are not in sort order but in
 * order of occurence.
 * @param query
 */
export declare function collectionChanges<T = DocumentData>(query: Query<T>, options?: {
    events?: DocumentChangeType[];
}): Observable<DocumentChange<T>[]>;
/**
 * Return a stream of document snapshots on a query. These results are in sort order.
 * @param query
 */
export declare function collection<T = DocumentData>(query: Query<T>): Observable<QueryDocumentSnapshot<T>[]>;
/**
 * Return a stream of document changes on a query. These results are in sort order.
 * @param query
 */
export declare function sortedChanges<T = DocumentData>(query: Query<T>, options?: {
    events?: DocumentChangeType[];
}): Observable<DocumentChange<T>[]>;
/**
 * Create a stream of changes as they occur it time. This method is similar
 * to docChanges() but it collects each event in an array over time.
 */
export declare function auditTrail<T = DocumentData>(query: Query<T>, options?: {
    events?: DocumentChangeType[];
}): Observable<DocumentChange<T>[]>;
/**
 * Returns a stream of documents mapped to their data payload, and optionally the document ID
 * @param query
 */
export declare function collectionData<T = DocumentData>(query: Query<T>, options?: {
    idField?: string;
}): Observable<T[]>;
