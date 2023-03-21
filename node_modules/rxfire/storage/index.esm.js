import { getDownloadURL as getDownloadURL$1, getMetadata as getMetadata$1, uploadBytesResumable as uploadBytesResumable$1, uploadString as uploadString$1 } from 'firebase/storage';
import { Observable, from } from 'rxjs';
import { debounceTime, shareReplay, map } from 'rxjs/operators';

function fromTask(task) {
    return new Observable(function (subscriber) {
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
    debounceTime(0));
}
function getDownloadURL(ref) {
    return from(getDownloadURL$1(ref));
}
// TODO: fix storage typing in firebase, then apply the same fix here
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getMetadata(ref) {
    return from(getMetadata$1(ref));
}
// MARK: Breaking change (renaming put to uploadBytesResumable)
function uploadBytesResumable(ref, data, metadata) {
    return new Observable(function (subscriber) {
        var task = uploadBytesResumable$1(ref, data, metadata);
        var subscription = fromTask(task).subscribe(subscriber);
        return function unsubscribe() {
            subscription.unsubscribe();
            task.cancel();
        };
    }).pipe(shareReplay({ bufferSize: 1, refCount: true }));
}
// MARK: Breaking change (renaming put to uploadString)
function uploadString(ref, data, format, metadata) {
    return from(uploadString$1(ref, data, format, metadata));
}
function percentage(task) {
    return fromTask(task).pipe(map(function (snapshot) { return ({
        progress: (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
        snapshot: snapshot
    }); }));
}

export { fromTask, getDownloadURL, getMetadata, percentage, uploadBytesResumable, uploadString };
//# sourceMappingURL=index.esm.js.map
