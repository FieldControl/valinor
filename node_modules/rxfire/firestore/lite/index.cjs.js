'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var rxjs = require('rxjs');
var operators = require('rxjs/operators');
var lite = require('firebase/firestore/lite');

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
function doc(ref) {
    return rxjs.from(lite.getDoc(ref));
}
/**
 * Returns a stream of a document, mapped to its data payload and optionally the document ID
 * @param query
 */
function docData(ref, options) {
    if (options === void 0) { options = {}; }
    return doc(ref).pipe(operators.map(function (snap) { return snapToData(snap, options); }));
}
function snapToData(snapshot, options) {
    if (options === void 0) { options = {}; }
    // TODO clean up the typings
    var data = snapshot.data();
    // match the behavior of the JS SDK when the snapshot doesn't exist
    // it's possible with data converters too that the user didn't return an object
    if (!snapshot.exists() || typeof data !== 'object' || data === null) {
        return data;
    }
    if (options.idField) {
        data[options.idField] = snapshot.id;
    }
    return data;
}

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
 * Return a stream of document snapshots on a query. These results are in sort order.
 * @param query
 */
function collection(query) {
    return rxjs.from(lite.getDocs(query)).pipe(operators.map(function (changes) { return changes.docs; }));
}
/**
 * Returns a stream of documents mapped to their data payload, and optionally the document ID
 * @param query
 */
function collectionData(query, options) {
    if (options === void 0) { options = {}; }
    return collection(query).pipe(operators.map(function (arr) {
        return arr.map(function (snap) { return snapToData(snap, options); });
    }));
}

function fromRef(ref) {
    if (ref.type === 'document') {
        return rxjs.from(lite.getDoc(ref));
    }
    else {
        return rxjs.from(lite.getDocs(ref));
    }
}

exports.collection = collection;
exports.collectionData = collectionData;
exports.doc = doc;
exports.docData = docData;
exports.fromRef = fromRef;
exports.snapToData = snapToData;
//# sourceMappingURL=index.cjs.js.map
