import { Observable, merge, from, of } from 'rxjs';
import { delay, map, switchMap, scan, distinctUntilChanged, withLatestFrom, skipWhile } from 'rxjs/operators';
import { onChildAdded, onChildRemoved, onChildChanged, onChildMoved, onValue, off, get as get$1 } from 'firebase/database';
import { __assign, __spreadArray } from 'tslib';

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
var _a;
var ListenEvent;
(function (ListenEvent) {
    ListenEvent["added"] = "child_added";
    ListenEvent["removed"] = "child_removed";
    ListenEvent["changed"] = "child_changed";
    ListenEvent["moved"] = "child_moved";
    ListenEvent["value"] = "value";
})(ListenEvent || (ListenEvent = {}));
var ListenerMethods = Object.freeze((_a = {},
    _a[ListenEvent.added] = onChildAdded,
    _a[ListenEvent.removed] = onChildRemoved,
    _a[ListenEvent.changed] = onChildChanged,
    _a[ListenEvent.moved] = onChildMoved,
    _a[ListenEvent.value] = onValue,
    _a));

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
/**
 * Create an observable from a Database Reference or Database Query.
 * @param ref Database Reference
 * @param event Listen event type ('value', 'added', 'changed', 'removed', 'moved')
 */
function fromRef(ref, event) {
    return new Observable(function (subscriber) {
        var fn = ListenerMethods[event](ref, function (snapshot, prevKey) {
            subscriber.next({ snapshot: snapshot, prevKey: prevKey, event: event });
        }, subscriber.error.bind(subscriber));
        return {
            unsubscribe: function () {
                off(ref, event, fn);
            }
        };
    }).pipe(
    // Ensures subscribe on observable is async. This handles
    // a quirk in the SDK where on/once callbacks can happen
    // synchronously.
    delay(0));
}

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
/**
 * Check the length of the provided array. If it is empty return an array
 * that is populated with all the Realtime Database child events.
 * @param events
 */
function validateEventsArray(events) {
    if (events == null || events.length === 0) {
        events = [
            ListenEvent.added,
            ListenEvent.removed,
            ListenEvent.changed,
            ListenEvent.moved
        ];
    }
    return events;
}

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
/**
 * Get the snapshot changes of an object
 * @param query
 */
function object(query) {
    return fromRef(query, ListenEvent.value);
}
/**
 * Get an array of object values, optionally with a mapped key
 * @param query object ref or query
 * @param keyField map the object key to a specific field
 */
function objectVal(query, options) {
    if (options === void 0) { options = {}; }
    return fromRef(query, ListenEvent.value).pipe(map(function (change) { return changeToData(change, options); }));
}
function changeToData(change, options) {
    var _a;
    if (options === void 0) { options = {}; }
    var val = change.snapshot.val();
    // match the behavior of the JS SDK when the snapshot doesn't exist
    if (!change.snapshot.exists()) {
        return val;
    }
    // val can be a primitive type
    if (typeof val !== 'object') {
        return val;
    }
    return __assign(__assign({}, val), (options.keyField ? (_a = {}, _a[options.keyField] = change.snapshot.key, _a) : null));
}

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
function stateChanges(query, options) {
    if (options === void 0) { options = {}; }
    var events = validateEventsArray(options.events);
    var childEvent$ = events.map(function (event) { return fromRef(query, event); });
    return merge.apply(void 0, childEvent$);
}
function get(query) {
    return from(get$1(query)).pipe(map(function (snapshot) {
        var event = ListenEvent.value;
        return { snapshot: snapshot, prevKey: null, event: event };
    }));
}
function list(query, options) {
    if (options === void 0) { options = {}; }
    var events = validateEventsArray(options.events);
    return get(query).pipe(switchMap(function (change) {
        if (!change.snapshot.exists()) {
            return of([]);
        }
        var childEvent$ = [of(change)];
        events.forEach(function (event) {
            childEvent$.push(fromRef(query, event));
        });
        return merge.apply(void 0, childEvent$).pipe(scan(buildView, []));
    }), distinctUntilChanged());
}
/**
 * Get an object mapped to its value, and optionally its key
 * @param query object ref or query
 * @param keyField map the object key to a specific field
 */
function listVal(query, options) {
    if (options === void 0) { options = {}; }
    return list(query).pipe(map(function (arr) {
        return arr.map(function (change) { return changeToData(change, options); });
    }));
}
function positionFor(changes, key) {
    var len = changes.length;
    for (var i = 0; i < len; i++) {
        if (changes[i].snapshot.key === key) {
            return i;
        }
    }
    return -1;
}
function positionAfter(changes, prevKey) {
    if (prevKey == null) {
        return 0;
    }
    else {
        var i = positionFor(changes, prevKey);
        if (i === -1) {
            return changes.length;
        }
        else {
            return i + 1;
        }
    }
}
function buildView(current, change) {
    var snapshot = change.snapshot, prevKey = change.prevKey, event = change.event;
    var key = snapshot.key;
    var currentKeyPosition = positionFor(current, key);
    var afterPreviousKeyPosition = positionAfter(current, prevKey || undefined);
    switch (event) {
        case ListenEvent.value:
            if (change.snapshot && change.snapshot.exists()) {
                var prevKey_1 = null;
                change.snapshot.forEach(function (snapshot) {
                    var action = {
                        snapshot: snapshot,
                        event: ListenEvent.value,
                        prevKey: prevKey_1
                    };
                    prevKey_1 = snapshot.key;
                    current = __spreadArray(__spreadArray([], current), [action]);
                    return false;
                });
            }
            return current;
        case ListenEvent.added:
            if (currentKeyPosition > -1) {
                // check that the previouskey is what we expect, else reorder
                var previous = current[currentKeyPosition - 1];
                if (((previous && previous.snapshot.key) || null) !== prevKey) {
                    current = current.filter(function (x) { return x.snapshot.key !== snapshot.key; });
                    current.splice(afterPreviousKeyPosition, 0, change);
                }
            }
            else if (prevKey == null) {
                return __spreadArray([change], current);
            }
            else {
                current = current.slice();
                current.splice(afterPreviousKeyPosition, 0, change);
            }
            return current;
        case ListenEvent.removed:
            return current.filter(function (x) { return x.snapshot.key !== snapshot.key; });
        case ListenEvent.changed:
            return current.map(function (x) { return (x.snapshot.key === key ? change : x); });
        case ListenEvent.moved:
            if (currentKeyPosition > -1) {
                var data = current.splice(currentKeyPosition, 1)[0];
                current = current.slice();
                current.splice(afterPreviousKeyPosition, 0, data);
                return current;
            }
            return current;
        // default will also remove null results
        default:
            return current;
    }
}

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
function auditTrail(query, options) {
    if (options === void 0) { options = {}; }
    var auditTrail$ = stateChanges(query, options).pipe(scan(function (current, changes) { return __spreadArray(__spreadArray([], current), [changes]); }, []));
    return waitForLoaded(query, auditTrail$);
}
function loadedData(query) {
    // Create an observable of loaded values to retrieve the
    // known dataset. This will allow us to know what key to
    // emit the "whole" array at when listening for child events.
    return fromRef(query, ListenEvent.value).pipe(map(function (data) {
        // Store the last key in the data set
        var lastKeyToLoad;
        // Loop through loaded dataset to find the last key
        data.snapshot.forEach(function (child) {
            lastKeyToLoad = child.key;
            return false;
        });
        // return data set and the current last key loaded
        return { data: data, lastKeyToLoad: lastKeyToLoad };
    }));
}
function waitForLoaded(query, snap$) {
    var loaded$ = loadedData(query);
    return loaded$.pipe(withLatestFrom(snap$), 
    // Get the latest values from the "loaded" and "child" datasets
    // We can use both datasets to form an array of the latest values.
    map(function (_a) {
        var loaded = _a[0], changes = _a[1];
        // Store the last key in the data set
        var lastKeyToLoad = loaded.lastKeyToLoad;
        // Store all child keys loaded at this point
        var loadedKeys = changes.map(function (change) { return change.snapshot.key; });
        return { changes: changes, lastKeyToLoad: lastKeyToLoad, loadedKeys: loadedKeys };
    }), 
    // This is the magical part, only emit when the last load key
    // in the dataset has been loaded by a child event. At this point
    // we can assume the dataset is "whole".
    skipWhile(function (meta) {
        return meta.loadedKeys.indexOf(meta.lastKeyToLoad) === -1;
    }), 
    // Pluck off the meta data because the user only cares
    // to iterate through the snapshots
    map(function (meta) { return meta.changes; }));
}

export { ListenEvent, ListenerMethods, auditTrail, changeToData, fromRef, list, listVal, object, objectVal, stateChanges };
//# sourceMappingURL=index.esm.js.map
