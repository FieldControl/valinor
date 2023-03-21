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
import { Auth } from 'firebase/auth';
import { Observable } from 'rxjs';
declare type User = import('firebase/auth').User;
/**
 * Create an observable of authentication state. The observer is only
 * triggered on sign-in or sign-out.
 * @param auth firebase.auth.Auth
 */
export declare function authState(auth: Auth): Observable<User | null>;
/**
 * Create an observable of user state. The observer is triggered for sign-in,
 * sign-out, and token refresh events
 * @param auth firebase.auth.Auth
 */
export declare function user(auth: Auth): Observable<User | null>;
/**
 * Create an observable of idToken state. The observer is triggered for sign-in,
 * sign-out, and token refresh events
 * @param auth firebase.auth.Auth
 */
export declare function idToken(auth: Auth): Observable<string | null>;
export {};
