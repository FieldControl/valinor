/**
 * @license
 * Copyright 2021 Google LLC
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
import { QueryChange, Query } from '../interfaces';
import { Observable } from 'rxjs';
/**
 * Get the snapshot changes of an object
 * @param query
 */
export declare function object(query: Query): Observable<QueryChange>;
/**
 * Get an array of object values, optionally with a mapped key
 * @param query object ref or query
 * @param keyField map the object key to a specific field
 */
export declare function objectVal<T>(query: Query, options?: {
    keyField?: string;
}): Observable<T>;
export declare function changeToData(change: QueryChange, options?: {
    keyField?: string;
}): {};
