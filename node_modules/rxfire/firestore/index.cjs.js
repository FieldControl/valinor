'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var tslib = require('tslib');
var firestore = require('firebase/firestore');
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
var DEFAULT_OPTIONS = { includeMetadataChanges: false };
function fromRef(ref, options) {
    if (options === void 0) { options = DEFAULT_OPTIONS; }
    /* eslint-enable @typescript-eslint/no-explicit-any */
    return new rxjs.Observable(function (subscriber) {
        var unsubscribe = firestore.onSnapshot(ref, options, {
            next: subscriber.next.bind(subscriber),
            error: subscriber.error.bind(subscriber),
            complete: subscriber.complete.bind(subscriber),
        });
        return { unsubscribe: unsubscribe };
    });
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
function doc(ref) {
    return fromRef(ref, { includeMetadataChanges: true });
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
var ALL_EVENTS = ['added', 'modified', 'removed'];
/**
 * Create an operator that determines if a the stream of document changes
 * are specified by the event filter. If the document change type is not
 * in specified events array, it will not be emitted.
 */
var filterEvents = function (events) {
    return operators.filter(function (changes) {
        var hasChange = false;
        for (var i = 0; i < changes.length; i++) {
            var change = changes[i];
            if (events && events.indexOf(change.type) >= 0) {
                hasChange = true;
                break;
            }
        }
        return hasChange;
    });
};
/**
 * Splice arguments on top of a sliced array, to break top-level ===
 * this is useful for change-detection
 */
function sliceAndSplice(original, start, deleteCount) {
    var args = [];
    for (var _i = 3; _i < arguments.length; _i++) {
        args[_i - 3] = arguments[_i];
    }
    var returnArray = original.slice();
    returnArray.splice.apply(returnArray, tslib.__spreadArray([start, deleteCount], args));
    return returnArray;
}
/**
 * Creates a new sorted array from a new change.
 * @param combined
 * @param change
 */
function processIndividualChange(combined, change) {
    switch (change.type) {
        case 'added':
            if (combined[change.newIndex] &&
                firestore.refEqual(combined[change.newIndex].doc.ref, change.doc.ref)) ;
            else {
                return sliceAndSplice(combined, change.newIndex, 0, change);
            }
            break;
        case 'modified':
            if (combined[change.oldIndex] == null ||
                firestore.refEqual(combined[change.oldIndex].doc.ref, change.doc.ref)) {
                // When an item changes position we first remove it
                // and then add it's new position
                if (change.oldIndex !== change.newIndex) {
                    var copiedArray = combined.slice();
                    copiedArray.splice(change.oldIndex, 1);
                    copiedArray.splice(change.newIndex, 0, change);
                    return copiedArray;
                }
                else {
                    return sliceAndSplice(combined, change.newIndex, 1, change);
                }
            }
            break;
        case 'removed':
            if (combined[change.oldIndex] &&
                firestore.refEqual(combined[change.oldIndex].doc.ref, change.doc.ref)) {
                return sliceAndSplice(combined, change.oldIndex, 1);
            }
            break;
    }
    return combined;
}
/**
 * Combines the total result set from the current set of changes from an incoming set
 * of changes.
 * @param current
 * @param changes
 * @param events
 */
function processDocumentChanges(current, changes, events) {
    if (events === void 0) { events = ALL_EVENTS; }
    changes.forEach(function (change) {
        // skip unwanted change types
        if (events.indexOf(change.type) > -1) {
            current = processIndividualChange(current, change);
        }
    });
    return current;
}
/**
 * Create an operator that allows you to compare the current emission with
 * the prior, even on first emission (where prior is undefined).
 */
var windowwise = function () {
    return rxjs.pipe(operators.startWith(undefined), operators.pairwise());
};
/**
 * Given two snapshots does their metadata match?
 * @param a
 * @param b
 */
var metaDataEquals = function (a, b) { return JSON.stringify(a.metadata) === JSON.stringify(b.metadata); };
/**
 * Create an operator that filters out empty changes. We provide the
 * ability to filter on events, which means all changes can be filtered out.
 * This creates an empty array and would be incorrect to emit.
 */
var filterEmptyUnlessFirst = function () {
    return rxjs.pipe(windowwise(), operators.filter(function (_a) {
        var prior = _a[0], current = _a[1];
        return current.length > 0 || prior === undefined;
    }), operators.map(function (_a) {
        _a[0]; var current = _a[1];
        return current;
    }));
};
/**
 * Return a stream of document changes on a query. These results are not in sort order but in
 * order of occurence.
 * @param query
 */
function collectionChanges(query, options) {
    if (options === void 0) { options = {}; }
    return fromRef(query, { includeMetadataChanges: true }).pipe(windowwise(), operators.map(function (_a) {
        var priorSnapshot = _a[0], currentSnapshot = _a[1];
        var docChanges = currentSnapshot.docChanges();
        if (priorSnapshot && !metaDataEquals(priorSnapshot, currentSnapshot)) {
            // the metadata has changed, docChanges() doesn't return metadata events, so let's
            // do it ourselves by scanning over all the docs and seeing if the metadata has changed
            // since either this docChanges() emission or the prior snapshot
            currentSnapshot.docs.forEach(function (currentDocSnapshot, currentIndex) {
                var currentDocChange = docChanges.find(function (c) {
                    return firestore.refEqual(c.doc.ref, currentDocSnapshot.ref);
                });
                if (currentDocChange) {
                    // if the doc is in the current changes and the metadata hasn't changed this doc
                    if (metaDataEquals(currentDocChange.doc, currentDocSnapshot)) {
                        return;
                    }
                }
                else {
                    // if there is a prior doc and the metadata hasn't changed skip this doc
                    var priorDocSnapshot = priorSnapshot === null || priorSnapshot === void 0 ? void 0 : priorSnapshot.docs.find(function (d) {
                        return firestore.refEqual(d.ref, currentDocSnapshot.ref);
                    });
                    if (priorDocSnapshot &&
                        metaDataEquals(priorDocSnapshot, currentDocSnapshot)) {
                        return;
                    }
                }
                docChanges.push({
                    oldIndex: currentIndex,
                    newIndex: currentIndex,
                    type: 'modified',
                    doc: currentDocSnapshot
                });
            });
        }
        return docChanges;
    }), filterEvents(options.events || ALL_EVENTS), filterEmptyUnlessFirst());
}
/**
 * Return a stream of document snapshots on a query. These results are in sort order.
 * @param query
 */
function collection(query) {
    return fromRef(query, { includeMetadataChanges: true }).pipe(operators.map(function (changes) { return changes.docs; }));
}
/**
 * Return a stream of document changes on a query. These results are in sort order.
 * @param query
 */
function sortedChanges(query, options) {
    if (options === void 0) { options = {}; }
    return collectionChanges(query, options).pipe(operators.scan(function (current, changes) {
        return processDocumentChanges(current, changes, options.events);
    }, []), operators.distinctUntilChanged());
}
/**
 * Create a stream of changes as they occur it time. This method is similar
 * to docChanges() but it collects each event in an array over time.
 */
function auditTrail(query, options) {
    if (options === void 0) { options = {}; }
    return collectionChanges(query, options).pipe(operators.scan(function (current, action) { return tslib.__spreadArray(tslib.__spreadArray([], current), action); }, []));
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

exports.auditTrail = auditTrail;
exports.collection = collection;
exports.collectionChanges = collectionChanges;
exports.collectionData = collectionData;
exports.doc = doc;
exports.docData = docData;
exports.fromRef = fromRef;
exports.snapToData = snapToData;
exports.sortedChanges = sortedChanges;
//# sourceMappingURL=index.cjs.js.map
