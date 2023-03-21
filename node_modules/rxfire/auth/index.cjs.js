'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var auth = require('firebase/auth');
var rxjs = require('rxjs');
var operators = require('rxjs/operators');

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
/**
 * Create an observable of authentication state. The observer is only
 * triggered on sign-in or sign-out.
 * @param auth firebase.auth.Auth
 */
function authState(auth$1) {
    return new rxjs.Observable(function (subscriber) {
        var unsubscribe = auth.onAuthStateChanged(auth$1, subscriber.next.bind(subscriber), subscriber.error.bind(subscriber), subscriber.complete.bind(subscriber));
        return { unsubscribe: unsubscribe };
    });
}
/**
 * Create an observable of user state. The observer is triggered for sign-in,
 * sign-out, and token refresh events
 * @param auth firebase.auth.Auth
 */
function user(auth$1) {
    return new rxjs.Observable(function (subscriber) {
        var unsubscribe = auth.onIdTokenChanged(auth$1, subscriber.next.bind(subscriber), subscriber.error.bind(subscriber), subscriber.complete.bind(subscriber));
        return { unsubscribe: unsubscribe };
    });
}
/**
 * Create an observable of idToken state. The observer is triggered for sign-in,
 * sign-out, and token refresh events
 * @param auth firebase.auth.Auth
 */
function idToken(auth$1) {
    return user(auth$1).pipe(operators.switchMap(function (user) { return (user ? rxjs.from(auth.getIdToken(user)) : rxjs.of(null)); }));
}

exports.authState = authState;
exports.idToken = idToken;
exports.user = user;
//# sourceMappingURL=index.cjs.js.map
