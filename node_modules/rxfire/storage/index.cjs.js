'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var storage = require('firebase/storage');
var rxjs = require('rxjs');
var operators = require('rxjs/operators');

function fromTask(task) {
    return new rxjs.Observable(function (subscriber) {
        var progress = function (snap) { return subscriber.next(snap); };
        var error = function (e) { return subscriber.error(e); };
        var complete = function () { return subscriber.complete(); };
        // emit the current state of the task
        progress(task.snapshot);
        // emit progression of the task
        var unsubscribeFromOnStateChanged = task.on('state_changed', progress);
        // use the promise form of task, to get the last success snapshot
        task.then(function (snapshot) {
            progress(snapshot);
            setTimeout(function () { return complete(); }, 0);
        }, function (e) {
            progress(task.snapshot);
            setTimeout(function () { return error(e); }, 0);
        });
        // the unsubscribe method returns by storage isn't typed in the
        // way rxjs expects, Function vs () => void, so wrap it
        return function unsubscribe() {
            unsubscribeFromOnStateChanged();
        };
    }).pipe(
    // since we're emitting first the current snapshot and then progression
    // it's possible that we could double fire synchronously; namely when in
    // a terminal state (success, error, canceled). Debounce to address.
    operators.debounceTime(0));
}
function getDownloadURL(ref) {
    return rxjs.from(storage.getDownloadURL(ref));
}
// TODO: fix storage typing in firebase, then apply the same fix here
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getMetadata(ref) {
    return rxjs.from(storage.getMetadata(ref));
}
// MARK: Breaking change (renaming put to uploadBytesResumable)
function uploadBytesResumable(ref, data, metadata) {
    return new rxjs.Observable(function (subscriber) {
        var task = storage.uploadBytesResumable(ref, data, metadata);
        var subscription = fromTask(task).subscribe(subscriber);
        return function unsubscribe() {
            subscription.unsubscribe();
            task.cancel();
        };
    }).pipe(operators.shareReplay({ bufferSize: 1, refCount: true }));
}
// MARK: Breaking change (renaming put to uploadString)
function uploadString(ref, data, format, metadata) {
    return rxjs.from(storage.uploadString(ref, data, format, metadata));
}
function percentage(task) {
    return fromTask(task).pipe(operators.map(function (snapshot) { return ({
        progress: (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
        snapshot: snapshot
    }); }));
}

exports.fromTask = fromTask;
exports.getDownloadURL = getDownloadURL;
exports.getMetadata = getMetadata;
exports.percentage = percentage;
exports.uploadBytesResumable = uploadBytesResumable;
exports.uploadString = uploadString;
//# sourceMappingURL=index.cjs.js.map
