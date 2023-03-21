import { Observable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
// Things aren't working great, I'm having to put in a lot of work-arounds for what
// appear to be Firebase JS SDK bugs https://github.com/firebase/firebase-js-sdk/issues/4158
export function fromTask(task) {
    return new Observable(subscriber => {
        const progress = (snap) => subscriber.next(snap);
        const error = e => subscriber.error(e);
        const complete = () => subscriber.complete();
        // emit the current snapshot, so they don't have to wait for state_changes
        // to fire next... this is stale if the task is no longer running :(
        progress(task.snapshot);
        const unsub = task.on('state_changed', progress);
        // it turns out that neither task snapshot nor 'state_changed' fire the last
        // snapshot before completion, the one with status 'success" and 100% progress
        // so let's use the promise form of the task for that
        task.then(snapshot => {
            progress(snapshot);
            complete();
        }, e => {
            // TODO investigate, again this is stale, we never fire a canceled or error it seems
            progress(task.snapshot);
            error(e);
        });
        // on's type if Function, rather than () => void, need to wrap
        return function unsubscribe() {
            unsub();
        };
    }).pipe(
    // deal with sync emissions from first emitting `task.snapshot`, this makes sure
    // that if the task is already finished we don't emit the old running state
    debounceTime(0));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnJvbVRhc2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY29tcGF0L3N0b3JhZ2Uvb2JzZXJ2YWJsZS9mcm9tVGFzay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQ2xDLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQU85QyxtRkFBbUY7QUFDbkYsNEZBQTRGO0FBQzVGLE1BQU0sVUFBVSxRQUFRLENBQUMsSUFBZ0I7SUFDdkMsT0FBTyxJQUFJLFVBQVUsQ0FBcUIsVUFBVSxDQUFDLEVBQUU7UUFDckQsTUFBTSxRQUFRLEdBQUcsQ0FBQyxJQUF3QixFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3JFLE1BQU0sS0FBSyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2QyxNQUFNLFFBQVEsR0FBRyxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDN0MsMEVBQTBFO1FBQzFFLG9FQUFvRTtRQUNwRSxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3hCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsZUFBZSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ2pELDRFQUE0RTtRQUM1RSw4RUFBOEU7UUFDOUUscURBQXFEO1FBQ3JELElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDbkIsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ25CLFFBQVEsRUFBRSxDQUFDO1FBQ2IsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFO1lBQ0wsb0ZBQW9GO1lBQ3BGLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDeEIsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ1gsQ0FBQyxDQUFDLENBQUM7UUFDSCw4REFBOEQ7UUFDOUQsT0FBTyxTQUFTLFdBQVc7WUFDekIsS0FBSyxFQUFFLENBQUM7UUFDVixDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQyxJQUFJO0lBQ0wsZ0ZBQWdGO0lBQ2hGLDJFQUEyRTtJQUMzRSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQ2hCLENBQUM7QUFDSixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgT2JzZXJ2YWJsZSB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgZGVib3VuY2VUaW1lIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHsgVXBsb2FkVGFzaywgVXBsb2FkVGFza1NuYXBzaG90IH0gZnJvbSAnLi4vaW50ZXJmYWNlcyc7XG5cbi8vIG5lZWQgdG8gaW1wb3J0LCBlbHNlIHRoZSB0eXBlcyBiZWNvbWUgaW1wb3J0KCdmaXJlYmFzZS9jb21wYXQvYXBwJykuZGVmYXVsdC5zdG9yYWdlLlVwbG9hZFRhc2tcbi8vIGFuZCBpdCBubyBsb25nZXIgd29ya3Mgdy9GaXJlYmFzZSB2N1xuaW1wb3J0IGZpcmViYXNlIGZyb20gJ2ZpcmViYXNlL2NvbXBhdC9hcHAnO1xuXG4vLyBUaGluZ3MgYXJlbid0IHdvcmtpbmcgZ3JlYXQsIEknbSBoYXZpbmcgdG8gcHV0IGluIGEgbG90IG9mIHdvcmstYXJvdW5kcyBmb3Igd2hhdFxuLy8gYXBwZWFyIHRvIGJlIEZpcmViYXNlIEpTIFNESyBidWdzIGh0dHBzOi8vZ2l0aHViLmNvbS9maXJlYmFzZS9maXJlYmFzZS1qcy1zZGsvaXNzdWVzLzQxNThcbmV4cG9ydCBmdW5jdGlvbiBmcm9tVGFzayh0YXNrOiBVcGxvYWRUYXNrKSB7XG4gIHJldHVybiBuZXcgT2JzZXJ2YWJsZTxVcGxvYWRUYXNrU25hcHNob3Q+KHN1YnNjcmliZXIgPT4ge1xuICAgIGNvbnN0IHByb2dyZXNzID0gKHNuYXA6IFVwbG9hZFRhc2tTbmFwc2hvdCkgPT4gc3Vic2NyaWJlci5uZXh0KHNuYXApO1xuICAgIGNvbnN0IGVycm9yID0gZSA9PiBzdWJzY3JpYmVyLmVycm9yKGUpO1xuICAgIGNvbnN0IGNvbXBsZXRlID0gKCkgPT4gc3Vic2NyaWJlci5jb21wbGV0ZSgpO1xuICAgIC8vIGVtaXQgdGhlIGN1cnJlbnQgc25hcHNob3QsIHNvIHRoZXkgZG9uJ3QgaGF2ZSB0byB3YWl0IGZvciBzdGF0ZV9jaGFuZ2VzXG4gICAgLy8gdG8gZmlyZSBuZXh0Li4uIHRoaXMgaXMgc3RhbGUgaWYgdGhlIHRhc2sgaXMgbm8gbG9uZ2VyIHJ1bm5pbmcgOihcbiAgICBwcm9ncmVzcyh0YXNrLnNuYXBzaG90KTtcbiAgICBjb25zdCB1bnN1YiA9IHRhc2sub24oJ3N0YXRlX2NoYW5nZWQnLCBwcm9ncmVzcyk7XG4gICAgLy8gaXQgdHVybnMgb3V0IHRoYXQgbmVpdGhlciB0YXNrIHNuYXBzaG90IG5vciAnc3RhdGVfY2hhbmdlZCcgZmlyZSB0aGUgbGFzdFxuICAgIC8vIHNuYXBzaG90IGJlZm9yZSBjb21wbGV0aW9uLCB0aGUgb25lIHdpdGggc3RhdHVzICdzdWNjZXNzXCIgYW5kIDEwMCUgcHJvZ3Jlc3NcbiAgICAvLyBzbyBsZXQncyB1c2UgdGhlIHByb21pc2UgZm9ybSBvZiB0aGUgdGFzayBmb3IgdGhhdFxuICAgIHRhc2sudGhlbihzbmFwc2hvdCA9PiB7XG4gICAgICBwcm9ncmVzcyhzbmFwc2hvdCk7XG4gICAgICBjb21wbGV0ZSgpO1xuICAgIH0sIGUgPT4ge1xuICAgICAgLy8gVE9ETyBpbnZlc3RpZ2F0ZSwgYWdhaW4gdGhpcyBpcyBzdGFsZSwgd2UgbmV2ZXIgZmlyZSBhIGNhbmNlbGVkIG9yIGVycm9yIGl0IHNlZW1zXG4gICAgICBwcm9ncmVzcyh0YXNrLnNuYXBzaG90KTtcbiAgICAgIGVycm9yKGUpO1xuICAgIH0pO1xuICAgIC8vIG9uJ3MgdHlwZSBpZiBGdW5jdGlvbiwgcmF0aGVyIHRoYW4gKCkgPT4gdm9pZCwgbmVlZCB0byB3cmFwXG4gICAgcmV0dXJuIGZ1bmN0aW9uIHVuc3Vic2NyaWJlKCkge1xuICAgICAgdW5zdWIoKTtcbiAgICB9O1xuICB9KS5waXBlKFxuICAgIC8vIGRlYWwgd2l0aCBzeW5jIGVtaXNzaW9ucyBmcm9tIGZpcnN0IGVtaXR0aW5nIGB0YXNrLnNuYXBzaG90YCwgdGhpcyBtYWtlcyBzdXJlXG4gICAgLy8gdGhhdCBpZiB0aGUgdGFzayBpcyBhbHJlYWR5IGZpbmlzaGVkIHdlIGRvbid0IGVtaXQgdGhlIG9sZCBydW5uaW5nIHN0YXRlXG4gICAgZGVib3VuY2VUaW1lKDApXG4gICk7XG59XG4iXX0=