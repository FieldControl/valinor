/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * Fake implementation of user agent history and navigation behavior. This is a
 * high-fidelity implementation of browser behavior that attempts to emulate
 * things like traversal delay.
 */
export class FakeNavigation {
    /** Equivalent to `navigation.currentEntry`. */
    get currentEntry() {
        return this.entriesArr[this.currentEntryIndex];
    }
    get canGoBack() {
        return this.currentEntryIndex > 0;
    }
    get canGoForward() {
        return this.currentEntryIndex < this.entriesArr.length - 1;
    }
    constructor(window, startURL) {
        this.window = window;
        /**
         * The fake implementation of an entries array. Only same-document entries
         * allowed.
         */
        this.entriesArr = [];
        /**
         * The current active entry index into `entriesArr`.
         */
        this.currentEntryIndex = 0;
        /**
         * The current navigate event.
         */
        this.navigateEvent = undefined;
        /**
         * A Map of pending traversals, so that traversals to the same entry can be
         * re-used.
         */
        this.traversalQueue = new Map();
        /**
         * A Promise that resolves when the previous traversals have finished. Used to
         * simulate the cross-process communication necessary for traversals.
         */
        this.nextTraversal = Promise.resolve();
        /**
         * A prospective current active entry index, which includes unresolved
         * traversals. Used by `go` to determine where navigations are intended to go.
         */
        this.prospectiveEntryIndex = 0;
        /**
         * A test-only option to make traversals synchronous, rather than emulate
         * cross-process communication.
         */
        this.synchronousTraversals = false;
        /** Whether to allow a call to setInitialEntryForTesting. */
        this.canSetInitialEntry = true;
        /** `EventTarget` to dispatch events. */
        this.eventTarget = this.window.document.createElement('div');
        /** The next unique id for created entries. Replace recreates this id. */
        this.nextId = 0;
        /** The next unique key for created entries. Replace inherits this id. */
        this.nextKey = 0;
        /** Whether this fake is disposed. */
        this.disposed = false;
        // First entry.
        this.setInitialEntryForTesting(startURL);
    }
    /**
     * Sets the initial entry.
     */
    setInitialEntryForTesting(url, options = { historyState: null }) {
        if (!this.canSetInitialEntry) {
            throw new Error('setInitialEntryForTesting can only be called before any ' + 'navigation has occurred');
        }
        const currentInitialEntry = this.entriesArr[0];
        this.entriesArr[0] = new FakeNavigationHistoryEntry(new URL(url).toString(), {
            index: 0,
            key: currentInitialEntry?.key ?? String(this.nextKey++),
            id: currentInitialEntry?.id ?? String(this.nextId++),
            sameDocument: true,
            historyState: options?.historyState,
            state: options.state,
        });
    }
    /** Returns whether the initial entry is still eligible to be set. */
    canSetInitialEntryForTesting() {
        return this.canSetInitialEntry;
    }
    /**
     * Sets whether to emulate traversals as synchronous rather than
     * asynchronous.
     */
    setSynchronousTraversalsForTesting(synchronousTraversals) {
        this.synchronousTraversals = synchronousTraversals;
    }
    /** Equivalent to `navigation.entries()`. */
    entries() {
        return this.entriesArr.slice();
    }
    /** Equivalent to `navigation.navigate()`. */
    navigate(url, options) {
        const fromUrl = new URL(this.currentEntry.url);
        const toUrl = new URL(url, this.currentEntry.url);
        let navigationType;
        if (!options?.history || options.history === 'auto') {
            // Auto defaults to push, but if the URLs are the same, is a replace.
            if (fromUrl.toString() === toUrl.toString()) {
                navigationType = 'replace';
            }
            else {
                navigationType = 'push';
            }
        }
        else {
            navigationType = options.history;
        }
        const hashChange = isHashChange(fromUrl, toUrl);
        const destination = new FakeNavigationDestination({
            url: toUrl.toString(),
            state: options?.state,
            sameDocument: hashChange,
            historyState: null,
        });
        const result = new InternalNavigationResult();
        this.userAgentNavigate(destination, result, {
            navigationType,
            cancelable: true,
            canIntercept: true,
            // Always false for navigate().
            userInitiated: false,
            hashChange,
            info: options?.info,
        });
        return {
            committed: result.committed,
            finished: result.finished,
        };
    }
    /** Equivalent to `history.pushState()`. */
    pushState(data, title, url) {
        this.pushOrReplaceState('push', data, title, url);
    }
    /** Equivalent to `history.replaceState()`. */
    replaceState(data, title, url) {
        this.pushOrReplaceState('replace', data, title, url);
    }
    pushOrReplaceState(navigationType, data, _title, url) {
        const fromUrl = new URL(this.currentEntry.url);
        const toUrl = url ? new URL(url, this.currentEntry.url) : fromUrl;
        const hashChange = isHashChange(fromUrl, toUrl);
        const destination = new FakeNavigationDestination({
            url: toUrl.toString(),
            sameDocument: true,
            historyState: data,
        });
        const result = new InternalNavigationResult();
        this.userAgentNavigate(destination, result, {
            navigationType,
            cancelable: true,
            canIntercept: true,
            // Always false for pushState() or replaceState().
            userInitiated: false,
            hashChange,
            skipPopState: true,
        });
    }
    /** Equivalent to `navigation.traverseTo()`. */
    traverseTo(key, options) {
        const fromUrl = new URL(this.currentEntry.url);
        const entry = this.findEntry(key);
        if (!entry) {
            const domException = new DOMException('Invalid key', 'InvalidStateError');
            const committed = Promise.reject(domException);
            const finished = Promise.reject(domException);
            committed.catch(() => { });
            finished.catch(() => { });
            return {
                committed,
                finished,
            };
        }
        if (entry === this.currentEntry) {
            return {
                committed: Promise.resolve(this.currentEntry),
                finished: Promise.resolve(this.currentEntry),
            };
        }
        if (this.traversalQueue.has(entry.key)) {
            const existingResult = this.traversalQueue.get(entry.key);
            return {
                committed: existingResult.committed,
                finished: existingResult.finished,
            };
        }
        const hashChange = isHashChange(fromUrl, new URL(entry.url, this.currentEntry.url));
        const destination = new FakeNavigationDestination({
            url: entry.url,
            state: entry.getState(),
            historyState: entry.getHistoryState(),
            key: entry.key,
            id: entry.id,
            index: entry.index,
            sameDocument: entry.sameDocument,
        });
        this.prospectiveEntryIndex = entry.index;
        const result = new InternalNavigationResult();
        this.traversalQueue.set(entry.key, result);
        this.runTraversal(() => {
            this.traversalQueue.delete(entry.key);
            this.userAgentNavigate(destination, result, {
                navigationType: 'traverse',
                cancelable: true,
                canIntercept: true,
                // Always false for traverseTo().
                userInitiated: false,
                hashChange,
                info: options?.info,
            });
        });
        return {
            committed: result.committed,
            finished: result.finished,
        };
    }
    /** Equivalent to `navigation.back()`. */
    back(options) {
        if (this.currentEntryIndex === 0) {
            const domException = new DOMException('Cannot go back', 'InvalidStateError');
            const committed = Promise.reject(domException);
            const finished = Promise.reject(domException);
            committed.catch(() => { });
            finished.catch(() => { });
            return {
                committed,
                finished,
            };
        }
        const entry = this.entriesArr[this.currentEntryIndex - 1];
        return this.traverseTo(entry.key, options);
    }
    /** Equivalent to `navigation.forward()`. */
    forward(options) {
        if (this.currentEntryIndex === this.entriesArr.length - 1) {
            const domException = new DOMException('Cannot go forward', 'InvalidStateError');
            const committed = Promise.reject(domException);
            const finished = Promise.reject(domException);
            committed.catch(() => { });
            finished.catch(() => { });
            return {
                committed,
                finished,
            };
        }
        const entry = this.entriesArr[this.currentEntryIndex + 1];
        return this.traverseTo(entry.key, options);
    }
    /**
     * Equivalent to `history.go()`.
     * Note that this method does not actually work precisely to how Chrome
     * does, instead choosing a simpler model with less unexpected behavior.
     * Chrome has a few edge case optimizations, for instance with repeated
     * `back(); forward()` chains it collapses certain traversals.
     */
    go(direction) {
        const targetIndex = this.prospectiveEntryIndex + direction;
        if (targetIndex >= this.entriesArr.length || targetIndex < 0) {
            return;
        }
        this.prospectiveEntryIndex = targetIndex;
        this.runTraversal(() => {
            // Check again that destination is in the entries array.
            if (targetIndex >= this.entriesArr.length || targetIndex < 0) {
                return;
            }
            const fromUrl = new URL(this.currentEntry.url);
            const entry = this.entriesArr[targetIndex];
            const hashChange = isHashChange(fromUrl, new URL(entry.url, this.currentEntry.url));
            const destination = new FakeNavigationDestination({
                url: entry.url,
                state: entry.getState(),
                historyState: entry.getHistoryState(),
                key: entry.key,
                id: entry.id,
                index: entry.index,
                sameDocument: entry.sameDocument,
            });
            const result = new InternalNavigationResult();
            this.userAgentNavigate(destination, result, {
                navigationType: 'traverse',
                cancelable: true,
                canIntercept: true,
                // Always false for go().
                userInitiated: false,
                hashChange,
            });
        });
    }
    /** Runs a traversal synchronously or asynchronously */
    runTraversal(traversal) {
        if (this.synchronousTraversals) {
            traversal();
            return;
        }
        // Each traversal occupies a single timeout resolution.
        // This means that Promises added to commit and finish should resolve
        // before the next traversal.
        this.nextTraversal = this.nextTraversal.then(() => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve();
                    traversal();
                });
            });
        });
    }
    /** Equivalent to `navigation.addEventListener()`. */
    addEventListener(type, callback, options) {
        this.eventTarget.addEventListener(type, callback, options);
    }
    /** Equivalent to `navigation.removeEventListener()`. */
    removeEventListener(type, callback, options) {
        this.eventTarget.removeEventListener(type, callback, options);
    }
    /** Equivalent to `navigation.dispatchEvent()` */
    dispatchEvent(event) {
        return this.eventTarget.dispatchEvent(event);
    }
    /** Cleans up resources. */
    dispose() {
        // Recreate eventTarget to release current listeners.
        // `document.createElement` because NodeJS `EventTarget` is incompatible with Domino's `Event`.
        this.eventTarget = this.window.document.createElement('div');
        this.disposed = true;
    }
    /** Returns whether this fake is disposed. */
    isDisposed() {
        return this.disposed;
    }
    /** Implementation for all navigations and traversals. */
    userAgentNavigate(destination, result, options) {
        // The first navigation should disallow any future calls to set the initial
        // entry.
        this.canSetInitialEntry = false;
        if (this.navigateEvent) {
            this.navigateEvent.cancel(new DOMException('Navigation was aborted', 'AbortError'));
            this.navigateEvent = undefined;
        }
        const navigateEvent = createFakeNavigateEvent({
            navigationType: options.navigationType,
            cancelable: options.cancelable,
            canIntercept: options.canIntercept,
            userInitiated: options.userInitiated,
            hashChange: options.hashChange,
            signal: result.signal,
            destination,
            info: options.info,
            sameDocument: destination.sameDocument,
            skipPopState: options.skipPopState,
            result,
            userAgentCommit: () => {
                this.userAgentCommit();
            },
        });
        this.navigateEvent = navigateEvent;
        this.eventTarget.dispatchEvent(navigateEvent);
        navigateEvent.dispatchedNavigateEvent();
        if (navigateEvent.commitOption === 'immediate') {
            navigateEvent.commit(/* internal= */ true);
        }
    }
    /** Implementation to commit a navigation. */
    userAgentCommit() {
        if (!this.navigateEvent) {
            return;
        }
        const from = this.currentEntry;
        if (!this.navigateEvent.sameDocument) {
            const error = new Error('Cannot navigate to a non-same-document URL.');
            this.navigateEvent.cancel(error);
            throw error;
        }
        if (this.navigateEvent.navigationType === 'push' ||
            this.navigateEvent.navigationType === 'replace') {
            this.userAgentPushOrReplace(this.navigateEvent.destination, {
                navigationType: this.navigateEvent.navigationType,
            });
        }
        else if (this.navigateEvent.navigationType === 'traverse') {
            this.userAgentTraverse(this.navigateEvent.destination);
        }
        this.navigateEvent.userAgentNavigated(this.currentEntry);
        const currentEntryChangeEvent = createFakeNavigationCurrentEntryChangeEvent({
            from,
            navigationType: this.navigateEvent.navigationType,
        });
        this.eventTarget.dispatchEvent(currentEntryChangeEvent);
        if (!this.navigateEvent.skipPopState) {
            const popStateEvent = createPopStateEvent({
                state: this.navigateEvent.destination.getHistoryState(),
            });
            this.window.dispatchEvent(popStateEvent);
        }
    }
    /** Implementation for a push or replace navigation. */
    userAgentPushOrReplace(destination, { navigationType }) {
        if (navigationType === 'push') {
            this.currentEntryIndex++;
            this.prospectiveEntryIndex = this.currentEntryIndex;
        }
        const index = this.currentEntryIndex;
        const key = navigationType === 'push' ? String(this.nextKey++) : this.currentEntry.key;
        const entry = new FakeNavigationHistoryEntry(destination.url, {
            id: String(this.nextId++),
            key,
            index,
            sameDocument: true,
            state: destination.getState(),
            historyState: destination.getHistoryState(),
        });
        if (navigationType === 'push') {
            this.entriesArr.splice(index, Infinity, entry);
        }
        else {
            this.entriesArr[index] = entry;
        }
    }
    /** Implementation for a traverse navigation. */
    userAgentTraverse(destination) {
        this.currentEntryIndex = destination.index;
    }
    /** Utility method for finding entries with the given `key`. */
    findEntry(key) {
        for (const entry of this.entriesArr) {
            if (entry.key === key)
                return entry;
        }
        return undefined;
    }
    set onnavigate(_handler) {
        throw new Error('unimplemented');
    }
    get onnavigate() {
        throw new Error('unimplemented');
    }
    set oncurrententrychange(_handler) {
        throw new Error('unimplemented');
    }
    get oncurrententrychange() {
        throw new Error('unimplemented');
    }
    set onnavigatesuccess(_handler) {
        throw new Error('unimplemented');
    }
    get onnavigatesuccess() {
        throw new Error('unimplemented');
    }
    set onnavigateerror(_handler) {
        throw new Error('unimplemented');
    }
    get onnavigateerror() {
        throw new Error('unimplemented');
    }
    get transition() {
        throw new Error('unimplemented');
    }
    updateCurrentEntry(_options) {
        throw new Error('unimplemented');
    }
    reload(_options) {
        throw new Error('unimplemented');
    }
}
/**
 * Fake equivalent of `NavigationHistoryEntry`.
 */
export class FakeNavigationHistoryEntry {
    constructor(url, { id, key, index, sameDocument, state, historyState, }) {
        this.url = url;
        // tslint:disable-next-line:no-any
        this.ondispose = null;
        this.id = id;
        this.key = key;
        this.index = index;
        this.sameDocument = sameDocument;
        this.state = state;
        this.historyState = historyState;
    }
    getState() {
        // Budget copy.
        return this.state ? JSON.parse(JSON.stringify(this.state)) : this.state;
    }
    getHistoryState() {
        // Budget copy.
        return this.historyState ? JSON.parse(JSON.stringify(this.historyState)) : this.historyState;
    }
    addEventListener(type, callback, options) {
        throw new Error('unimplemented');
    }
    removeEventListener(type, callback, options) {
        throw new Error('unimplemented');
    }
    dispatchEvent(event) {
        throw new Error('unimplemented');
    }
}
/**
 * Create a fake equivalent of `NavigateEvent`. This is not a class because ES5
 * transpiled JavaScript cannot extend native Event.
 */
function createFakeNavigateEvent({ cancelable, canIntercept, userInitiated, hashChange, navigationType, signal, destination, info, sameDocument, skipPopState, result, userAgentCommit, }) {
    const event = new Event('navigate', { bubbles: false, cancelable });
    event.canIntercept = canIntercept;
    event.userInitiated = userInitiated;
    event.hashChange = hashChange;
    event.navigationType = navigationType;
    event.signal = signal;
    event.destination = destination;
    event.info = info;
    event.downloadRequest = null;
    event.formData = null;
    event.sameDocument = sameDocument;
    event.skipPopState = skipPopState;
    event.commitOption = 'immediate';
    let handlerFinished = undefined;
    let interceptCalled = false;
    let dispatchedNavigateEvent = false;
    let commitCalled = false;
    event.intercept = function (options) {
        interceptCalled = true;
        event.sameDocument = true;
        const handler = options?.handler;
        if (handler) {
            handlerFinished = handler();
        }
        if (options?.commit) {
            event.commitOption = options.commit;
        }
        if (options?.focusReset !== undefined || options?.scroll !== undefined) {
            throw new Error('unimplemented');
        }
    };
    event.scroll = function () {
        throw new Error('unimplemented');
    };
    event.commit = function (internal = false) {
        if (!internal && !interceptCalled) {
            throw new DOMException(`Failed to execute 'commit' on 'NavigateEvent': intercept() must be ` +
                `called before commit().`, 'InvalidStateError');
        }
        if (!dispatchedNavigateEvent) {
            throw new DOMException(`Failed to execute 'commit' on 'NavigateEvent': commit() may not be ` +
                `called during event dispatch.`, 'InvalidStateError');
        }
        if (commitCalled) {
            throw new DOMException(`Failed to execute 'commit' on 'NavigateEvent': commit() already ` + `called.`, 'InvalidStateError');
        }
        commitCalled = true;
        userAgentCommit();
    };
    // Internal only.
    event.cancel = function (reason) {
        result.committedReject(reason);
        result.finishedReject(reason);
    };
    // Internal only.
    event.dispatchedNavigateEvent = function () {
        dispatchedNavigateEvent = true;
        if (event.commitOption === 'after-transition') {
            // If handler finishes before commit, call commit.
            handlerFinished?.then(() => {
                if (!commitCalled) {
                    event.commit(/* internal */ true);
                }
            }, () => { });
        }
        Promise.all([result.committed, handlerFinished]).then(([entry]) => {
            result.finishedResolve(entry);
        }, (reason) => {
            result.finishedReject(reason);
        });
    };
    // Internal only.
    event.userAgentNavigated = function (entry) {
        result.committedResolve(entry);
    };
    return event;
}
/**
 * Create a fake equivalent of `NavigationCurrentEntryChange`. This does not use
 * a class because ES5 transpiled JavaScript cannot extend native Event.
 */
function createFakeNavigationCurrentEntryChangeEvent({ from, navigationType, }) {
    const event = new Event('currententrychange', {
        bubbles: false,
        cancelable: false,
    });
    event.from = from;
    event.navigationType = navigationType;
    return event;
}
/**
 * Create a fake equivalent of `PopStateEvent`. This does not use a class
 * because ES5 transpiled JavaScript cannot extend native Event.
 */
function createPopStateEvent({ state }) {
    const event = new Event('popstate', {
        bubbles: false,
        cancelable: false,
    });
    event.state = state;
    return event;
}
/**
 * Fake equivalent of `NavigationDestination`.
 */
export class FakeNavigationDestination {
    constructor({ url, sameDocument, historyState, state, key = null, id = null, index = -1, }) {
        this.url = url;
        this.sameDocument = sameDocument;
        this.state = state;
        this.historyState = historyState;
        this.key = key;
        this.id = id;
        this.index = index;
    }
    getState() {
        return this.state;
    }
    getHistoryState() {
        return this.historyState;
    }
}
/** Utility function to determine whether two UrlLike have the same hash. */
function isHashChange(from, to) {
    return (to.hash !== from.hash &&
        to.hostname === from.hostname &&
        to.pathname === from.pathname &&
        to.search === from.search);
}
/** Internal utility class for representing the result of a navigation.  */
class InternalNavigationResult {
    get signal() {
        return this.abortController.signal;
    }
    constructor() {
        this.abortController = new AbortController();
        this.committed = new Promise((resolve, reject) => {
            this.committedResolve = resolve;
            this.committedReject = reject;
        });
        this.finished = new Promise(async (resolve, reject) => {
            this.finishedResolve = resolve;
            this.finishedReject = (reason) => {
                reject(reason);
                this.abortController.abort(reason);
            };
        });
        // All rejections are handled.
        this.committed.catch(() => { });
        this.finished.catch(() => { });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmFrZV9uYXZpZ2F0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3Rlc3Rpbmcvc3JjL25hdmlnYXRpb24vZmFrZV9uYXZpZ2F0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQWtCSDs7OztHQUlHO0FBQ0gsTUFBTSxPQUFPLGNBQWM7SUF3RHpCLCtDQUErQztJQUMvQyxJQUFJLFlBQVk7UUFDZCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDakQsQ0FBQztJQUVELElBQUksU0FBUztRQUNYLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixHQUFHLENBQUMsQ0FBQztJQUNwQyxDQUFDO0lBRUQsSUFBSSxZQUFZO1FBQ2QsT0FBTyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0lBQzdELENBQUM7SUFFRCxZQUNtQixNQUFjLEVBQy9CLFFBQXlCO1FBRFIsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQXJFakM7OztXQUdHO1FBQ2MsZUFBVSxHQUFpQyxFQUFFLENBQUM7UUFFL0Q7O1dBRUc7UUFDSyxzQkFBaUIsR0FBRyxDQUFDLENBQUM7UUFFOUI7O1dBRUc7UUFDSyxrQkFBYSxHQUEwQyxTQUFTLENBQUM7UUFFekU7OztXQUdHO1FBQ2MsbUJBQWMsR0FBRyxJQUFJLEdBQUcsRUFBb0MsQ0FBQztRQUU5RTs7O1dBR0c7UUFDSyxrQkFBYSxHQUFHLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUUxQzs7O1dBR0c7UUFDSywwQkFBcUIsR0FBRyxDQUFDLENBQUM7UUFFbEM7OztXQUdHO1FBQ0ssMEJBQXFCLEdBQUcsS0FBSyxDQUFDO1FBRXRDLDREQUE0RDtRQUNwRCx1QkFBa0IsR0FBRyxJQUFJLENBQUM7UUFFbEMsd0NBQXdDO1FB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QUFDO0lBQ2hDLENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgTmF2aWdhdGVFdmVudCxcbiAgTmF2aWdhdGlvbixcbiAgTmF2aWdhdGlvbkN1cnJlbnRFbnRyeUNoYW5nZUV2ZW50LFxuICBOYXZpZ2F0aW9uRGVzdGluYXRpb24sXG4gIE5hdmlnYXRpb25IaXN0b3J5RW50cnksXG4gIE5hdmlnYXRpb25JbnRlcmNlcHRPcHRpb25zLFxuICBOYXZpZ2F0aW9uTmF2aWdhdGVPcHRpb25zLFxuICBOYXZpZ2F0aW9uT3B0aW9ucyxcbiAgTmF2aWdhdGlvblJlbG9hZE9wdGlvbnMsXG4gIE5hdmlnYXRpb25SZXN1bHQsXG4gIE5hdmlnYXRpb25UcmFuc2l0aW9uLFxuICBOYXZpZ2F0aW9uVHlwZVN0cmluZyxcbiAgTmF2aWdhdGlvblVwZGF0ZUN1cnJlbnRFbnRyeU9wdGlvbnMsXG59IGZyb20gJy4vbmF2aWdhdGlvbl90eXBlcyc7XG5cbi8qKlxuICogRmFrZSBpbXBsZW1lbnRhdGlvbiBvZiB1c2VyIGFnZW50IGhpc3RvcnkgYW5kIG5hdmlnYXRpb24gYmVoYXZpb3IuIFRoaXMgaXMgYVxuICogaGlnaC1maWRlbGl0eSBpbXBsZW1lbnRhdGlvbiBvZiBicm93c2VyIGJlaGF2aW9yIHRoYXQgYXR0ZW1wdHMgdG8gZW11bGF0ZVxuICogdGhpbmdzIGxpa2UgdHJhdmVyc2FsIGRlbGF5LlxuICovXG5leHBvcnQgY2xhc3MgRmFrZU5hdmlnYXRpb24gaW1wbGVtZW50cyBOYXZpZ2F0aW9uIHtcbiAgLyoqXG4gICAqIFRoZSBmYWtlIGltcGxlbWVudGF0aW9uIG9mIGFuIGVudHJpZXMgYXJyYXkuIE9ubHkgc2FtZS1kb2N1bWVudCBlbnRyaWVzXG4gICAqIGFsbG93ZWQuXG4gICAqL1xuICBwcml2YXRlIHJlYWRvbmx5IGVudHJpZXNBcnI6IEZha2VOYXZpZ2F0aW9uSGlzdG9yeUVudHJ5W10gPSBbXTtcblxuICAvKipcbiAgICogVGhlIGN1cnJlbnQgYWN0aXZlIGVudHJ5IGluZGV4IGludG8gYGVudHJpZXNBcnJgLlxuICAgKi9cbiAgcHJpdmF0ZSBjdXJyZW50RW50cnlJbmRleCA9IDA7XG5cbiAgLyoqXG4gICAqIFRoZSBjdXJyZW50IG5hdmlnYXRlIGV2ZW50LlxuICAgKi9cbiAgcHJpdmF0ZSBuYXZpZ2F0ZUV2ZW50OiBJbnRlcm5hbEZha2VOYXZpZ2F0ZUV2ZW50IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuXG4gIC8qKlxuICAgKiBBIE1hcCBvZiBwZW5kaW5nIHRyYXZlcnNhbHMsIHNvIHRoYXQgdHJhdmVyc2FscyB0byB0aGUgc2FtZSBlbnRyeSBjYW4gYmVcbiAgICogcmUtdXNlZC5cbiAgICovXG4gIHByaXZhdGUgcmVhZG9ubHkgdHJhdmVyc2FsUXVldWUgPSBuZXcgTWFwPHN0cmluZywgSW50ZXJuYWxOYXZpZ2F0aW9uUmVzdWx0PigpO1xuXG4gIC8qKlxuICAgKiBBIFByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIHRoZSBwcmV2aW91cyB0cmF2ZXJzYWxzIGhhdmUgZmluaXNoZWQuIFVzZWQgdG9cbiAgICogc2ltdWxhdGUgdGhlIGNyb3NzLXByb2Nlc3MgY29tbXVuaWNhdGlvbiBuZWNlc3NhcnkgZm9yIHRyYXZlcnNhbHMuXG4gICAqL1xuICBwcml2YXRlIG5leHRUcmF2ZXJzYWwgPSBQcm9taXNlLnJlc29sdmUoKTtcblxuICAvKipcbiAgICogQSBwcm9zcGVjdGl2ZSBjdXJyZW50IGFjdGl2ZSBlbnRyeSBpbmRleCwgd2hpY2ggaW5jbHVkZXMgdW5yZXNvbHZlZFxuICAgKiB0cmF2ZXJzYWxzLiBVc2VkIGJ5IGBnb2AgdG8gZGV0ZXJtaW5lIHdoZXJlIG5hdmlnYXRpb25zIGFyZSBpbnRlbmRlZCB0byBnby5cbiAgICovXG4gIHByaXZhdGUgcHJvc3BlY3RpdmVFbnRyeUluZGV4ID0gMDtcblxuICAvKipcbiAgICogQSB0ZXN0LW9ubHkgb3B0aW9uIHRvIG1ha2UgdHJhdmVyc2FscyBzeW5jaHJvbm91cywgcmF0aGVyIHRoYW4gZW11bGF0ZVxuICAgKiBjcm9zcy1wcm9jZXNzIGNvbW11bmljYXRpb24uXG4gICAqL1xuICBwcml2YXRlIHN5bmNocm9ub3VzVHJhdmVyc2FscyA9IGZhbHNlO1xuXG4gIC8qKiBXaGV0aGVyIHRvIGFsbG93IGEgY2FsbCB0byBzZXRJbml0aWFsRW50cnlGb3JUZXN0aW5nLiAqL1xuICBwcml2YXRlIGNhblNldEluaXRpYWxFbnRyeSA9IHRydWU7XG5cbiAgLyoqIGBFdmVudFRhcmdldGAgdG8gZGlzcGF0Y2ggZXZlbnRzLiAqL1xuICBwcml2YXRlIGV2ZW50VGFyZ2V0OiBFdmVudFRhcmdldCA9IHRoaXMud2luZG93LmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXG4gIC8qKiBUaGUgbmV4dCB1bmlxdWUgaWQgZm9yIGNyZWF0ZWQgZW50cmllcy4gUmVwbGFjZSByZWNyZWF0ZXMgdGhpcyBpZC4gKi9cbiAgcHJpdmF0ZSBuZXh0SWQgPSAwO1xuXG4gIC8qKiBUaGUgbmV4dCB1bmlxdWUga2V5IGZvciBjcmVhdGVkIGVudHJpZXMuIFJlcGxhY2UgaW5oZXJpdHMgdGhpcyBpZC4gKi9cbiAgcHJpdmF0ZSBuZXh0S2V5ID0gMDtcblxuICAvKiogV2hldGhlciB0aGlzIGZha2UgaXMgZGlzcG9zZWQuICovXG4gIHByaXZhdGUgZGlzcG9zZWQgPSBmYWxzZTtcblxuICAvKiogRXF1aXZhbGVudCB0byBgbmF2aWdhdGlvbi5jdXJyZW50RW50cnlgLiAqL1xuICBnZXQgY3VycmVudEVudHJ5KCk6IEZha2VOYXZpZ2F0aW9uSGlzdG9yeUVudHJ5IHtcbiAgICByZXR1cm4gdGhpcy5lbnRyaWVzQXJyW3RoaXMuY3VycmVudEVudHJ5SW5kZXhdO1xuICB9XG5cbiAgZ2V0IGNhbkdvQmFjaygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5jdXJyZW50RW50cnlJbmRleCA+IDA7XG4gIH1cblxuICBnZXQgY2FuR29Gb3J3YXJkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmN1cnJlbnRFbnRyeUluZGV4IDwgdGhpcy5lbnRyaWVzQXJyLmxlbmd0aCAtIDE7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIHJlYWRvbmx5IHdpbmRvdzogV2luZG93LFxuICAgIHN0YXJ0VVJMOiBgaHR0cCR7c3RyaW5nfWAsXG4gICkge1xuICAgIC8vIEZpcnN0IGVudHJ5LlxuICAgIHRoaXMuc2V0SW5pdGlhbEVudHJ5Rm9yVGVzdGluZyhzdGFydFVSTCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgaW5pdGlhbCBlbnRyeS5cbiAgICovXG4gIHByaXZhdGUgc2V0SW5pdGlhbEVudHJ5Rm9yVGVzdGluZyhcbiAgICB1cmw6IGBodHRwJHtzdHJpbmd9YCxcbiAgICBvcHRpb25zOiB7aGlzdG9yeVN0YXRlOiB1bmtub3duOyBzdGF0ZT86IHVua25vd259ID0ge2hpc3RvcnlTdGF0ZTogbnVsbH0sXG4gICkge1xuICAgIGlmICghdGhpcy5jYW5TZXRJbml0aWFsRW50cnkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgJ3NldEluaXRpYWxFbnRyeUZvclRlc3RpbmcgY2FuIG9ubHkgYmUgY2FsbGVkIGJlZm9yZSBhbnkgJyArICduYXZpZ2F0aW9uIGhhcyBvY2N1cnJlZCcsXG4gICAgICApO1xuICAgIH1cbiAgICBjb25zdCBjdXJyZW50SW5pdGlhbEVudHJ5ID0gdGhpcy5lbnRyaWVzQXJyWzBdO1xuICAgIHRoaXMuZW50cmllc0FyclswXSA9IG5ldyBGYWtlTmF2aWdhdGlvbkhpc3RvcnlFbnRyeShuZXcgVVJMKHVybCkudG9TdHJpbmcoKSwge1xuICAgICAgaW5kZXg6IDAsXG4gICAgICBrZXk6IGN1cnJlbnRJbml0aWFsRW50cnk/LmtleSA/PyBTdHJpbmcodGhpcy5uZXh0S2V5KyspLFxuICAgICAgaWQ6IGN1cnJlbnRJbml0aWFsRW50cnk/LmlkID8/IFN0cmluZyh0aGlzLm5leHRJZCsrKSxcbiAgICAgIHNhbWVEb2N1bWVudDogdHJ1ZSxcbiAgICAgIGhpc3RvcnlTdGF0ZTogb3B0aW9ucz8uaGlzdG9yeVN0YXRlLFxuICAgICAgc3RhdGU6IG9wdGlvbnMuc3RhdGUsXG4gICAgfSk7XG4gIH1cblxuICAvKiogUmV0dXJucyB3aGV0aGVyIHRoZSBpbml0aWFsIGVudHJ5IGlzIHN0aWxsIGVsaWdpYmxlIHRvIGJlIHNldC4gKi9cbiAgY2FuU2V0SW5pdGlhbEVudHJ5Rm9yVGVzdGluZygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5jYW5TZXRJbml0aWFsRW50cnk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB3aGV0aGVyIHRvIGVtdWxhdGUgdHJhdmVyc2FscyBhcyBzeW5jaHJvbm91cyByYXRoZXIgdGhhblxuICAgKiBhc3luY2hyb25vdXMuXG4gICAqL1xuICBzZXRTeW5jaHJvbm91c1RyYXZlcnNhbHNGb3JUZXN0aW5nKHN5bmNocm9ub3VzVHJhdmVyc2FsczogYm9vbGVhbikge1xuICAgIHRoaXMuc3luY2hyb25vdXNUcmF2ZXJzYWxzID0gc3luY2hyb25vdXNUcmF2ZXJzYWxzO1xuICB9XG5cbiAgLyoqIEVxdWl2YWxlbnQgdG8gYG5hdmlnYXRpb24uZW50cmllcygpYC4gKi9cbiAgZW50cmllcygpOiBGYWtlTmF2aWdhdGlvbkhpc3RvcnlFbnRyeVtdIHtcbiAgICByZXR1cm4gdGhpcy5lbnRyaWVzQXJyLnNsaWNlKCk7XG4gIH1cblxuICAvKiogRXF1aXZhbGVudCB0byBgbmF2aWdhdGlvbi5uYXZpZ2F0ZSgpYC4gKi9cbiAgbmF2aWdhdGUodXJsOiBzdHJpbmcsIG9wdGlvbnM/OiBOYXZpZ2F0aW9uTmF2aWdhdGVPcHRpb25zKTogRmFrZU5hdmlnYXRpb25SZXN1bHQge1xuICAgIGNvbnN0IGZyb21VcmwgPSBuZXcgVVJMKHRoaXMuY3VycmVudEVudHJ5LnVybCEpO1xuICAgIGNvbnN0IHRvVXJsID0gbmV3IFVSTCh1cmwsIHRoaXMuY3VycmVudEVudHJ5LnVybCEpO1xuXG4gICAgbGV0IG5hdmlnYXRpb25UeXBlOiBOYXZpZ2F0aW9uVHlwZVN0cmluZztcbiAgICBpZiAoIW9wdGlvbnM/Lmhpc3RvcnkgfHwgb3B0aW9ucy5oaXN0b3J5ID09PSAnYXV0bycpIHtcbiAgICAgIC8vIEF1dG8gZGVmYXVsdHMgdG8gcHVzaCwgYnV0IGlmIHRoZSBVUkxzIGFyZSB0aGUgc2FtZSwgaXMgYSByZXBsYWNlLlxuICAgICAgaWYgKGZyb21VcmwudG9TdHJpbmcoKSA9PT0gdG9VcmwudG9TdHJpbmcoKSkge1xuICAgICAgICBuYXZpZ2F0aW9uVHlwZSA9ICdyZXBsYWNlJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5hdmlnYXRpb25UeXBlID0gJ3B1c2gnO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBuYXZpZ2F0aW9uVHlwZSA9IG9wdGlvbnMuaGlzdG9yeTtcbiAgICB9XG5cbiAgICBjb25zdCBoYXNoQ2hhbmdlID0gaXNIYXNoQ2hhbmdlKGZyb21VcmwsIHRvVXJsKTtcblxuICAgIGNvbnN0IGRlc3RpbmF0aW9uID0gbmV3IEZha2VOYXZpZ2F0aW9uRGVzdGluYXRpb24oe1xuICAgICAgdXJsOiB0b1VybC50b1N0cmluZygpLFxuICAgICAgc3RhdGU6IG9wdGlvbnM/LnN0YXRlLFxuICAgICAgc2FtZURvY3VtZW50OiBoYXNoQ2hhbmdlLFxuICAgICAgaGlzdG9yeVN0YXRlOiBudWxsLFxuICAgIH0pO1xuICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBJbnRlcm5hbE5hdmlnYXRpb25SZXN1bHQoKTtcblxuICAgIHRoaXMudXNlckFnZW50TmF2aWdhdGUoZGVzdGluYXRpb24sIHJlc3VsdCwge1xuICAgICAgbmF2aWdhdGlvblR5cGUsXG4gICAgICBjYW5jZWxhYmxlOiB0cnVlLFxuICAgICAgY2FuSW50ZXJjZXB0OiB0cnVlLFxuICAgICAgLy8gQWx3YXlzIGZhbHNlIGZvciBuYXZpZ2F0ZSgpLlxuICAgICAgdXNlckluaXRpYXRlZDogZmFsc2UsXG4gICAgICBoYXNoQ2hhbmdlLFxuICAgICAgaW5mbzogb3B0aW9ucz8uaW5mbyxcbiAgICB9KTtcblxuICAgIHJldHVybiB7XG4gICAgICBjb21taXR0ZWQ6IHJlc3VsdC5jb21taXR0ZWQsXG4gICAgICBmaW5pc2hlZDogcmVzdWx0LmZpbmlzaGVkLFxuICAgIH07XG4gIH1cblxuICAvKiogRXF1aXZhbGVudCB0byBgaGlzdG9yeS5wdXNoU3RhdGUoKWAuICovXG4gIHB1c2hTdGF0ZShkYXRhOiB1bmtub3duLCB0aXRsZTogc3RyaW5nLCB1cmw/OiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLnB1c2hPclJlcGxhY2VTdGF0ZSgncHVzaCcsIGRhdGEsIHRpdGxlLCB1cmwpO1xuICB9XG5cbiAgLyoqIEVxdWl2YWxlbnQgdG8gYGhpc3RvcnkucmVwbGFjZVN0YXRlKClgLiAqL1xuICByZXBsYWNlU3RhdGUoZGF0YTogdW5rbm93biwgdGl0bGU6IHN0cmluZywgdXJsPzogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5wdXNoT3JSZXBsYWNlU3RhdGUoJ3JlcGxhY2UnLCBkYXRhLCB0aXRsZSwgdXJsKTtcbiAgfVxuXG4gIHByaXZhdGUgcHVzaE9yUmVwbGFjZVN0YXRlKFxuICAgIG5hdmlnYXRpb25UeXBlOiBOYXZpZ2F0aW9uVHlwZVN0cmluZyxcbiAgICBkYXRhOiB1bmtub3duLFxuICAgIF90aXRsZTogc3RyaW5nLFxuICAgIHVybD86IHN0cmluZyxcbiAgKTogdm9pZCB7XG4gICAgY29uc3QgZnJvbVVybCA9IG5ldyBVUkwodGhpcy5jdXJyZW50RW50cnkudXJsISk7XG4gICAgY29uc3QgdG9VcmwgPSB1cmwgPyBuZXcgVVJMKHVybCwgdGhpcy5jdXJyZW50RW50cnkudXJsISkgOiBmcm9tVXJsO1xuXG4gICAgY29uc3QgaGFzaENoYW5nZSA9IGlzSGFzaENoYW5nZShmcm9tVXJsLCB0b1VybCk7XG5cbiAgICBjb25zdCBkZXN0aW5hdGlvbiA9IG5ldyBGYWtlTmF2aWdhdGlvbkRlc3RpbmF0aW9uKHtcbiAgICAgIHVybDogdG9VcmwudG9TdHJpbmcoKSxcbiAgICAgIHNhbWVEb2N1bWVudDogdHJ1ZSxcbiAgICAgIGhpc3RvcnlTdGF0ZTogZGF0YSxcbiAgICB9KTtcbiAgICBjb25zdCByZXN1bHQgPSBuZXcgSW50ZXJuYWxOYXZpZ2F0aW9uUmVzdWx0KCk7XG5cbiAgICB0aGlzLnVzZXJBZ2VudE5hdmlnYXRlKGRlc3RpbmF0aW9uLCByZXN1bHQsIHtcbiAgICAgIG5hdmlnYXRpb25UeXBlLFxuICAgICAgY2FuY2VsYWJsZTogdHJ1ZSxcbiAgICAgIGNhbkludGVyY2VwdDogdHJ1ZSxcbiAgICAgIC8vIEFsd2F5cyBmYWxzZSBmb3IgcHVzaFN0YXRlKCkgb3IgcmVwbGFjZVN0YXRlKCkuXG4gICAgICB1c2VySW5pdGlhdGVkOiBmYWxzZSxcbiAgICAgIGhhc2hDaGFuZ2UsXG4gICAgICBza2lwUG9wU3RhdGU6IHRydWUsXG4gICAgfSk7XG4gIH1cblxuICAvKiogRXF1aXZhbGVudCB0byBgbmF2aWdhdGlvbi50cmF2ZXJzZVRvKClgLiAqL1xuICB0cmF2ZXJzZVRvKGtleTogc3RyaW5nLCBvcHRpb25zPzogTmF2aWdhdGlvbk9wdGlvbnMpOiBGYWtlTmF2aWdhdGlvblJlc3VsdCB7XG4gICAgY29uc3QgZnJvbVVybCA9IG5ldyBVUkwodGhpcy5jdXJyZW50RW50cnkudXJsISk7XG4gICAgY29uc3QgZW50cnkgPSB0aGlzLmZpbmRFbnRyeShrZXkpO1xuICAgIGlmICghZW50cnkpIHtcbiAgICAgIGNvbnN0IGRvbUV4Y2VwdGlvbiA9IG5ldyBET01FeGNlcHRpb24oJ0ludmFsaWQga2V5JywgJ0ludmFsaWRTdGF0ZUVycm9yJyk7XG4gICAgICBjb25zdCBjb21taXR0ZWQgPSBQcm9taXNlLnJlamVjdChkb21FeGNlcHRpb24pO1xuICAgICAgY29uc3QgZmluaXNoZWQgPSBQcm9taXNlLnJlamVjdChkb21FeGNlcHRpb24pO1xuICAgICAgY29tbWl0dGVkLmNhdGNoKCgpID0+IHt9KTtcbiAgICAgIGZpbmlzaGVkLmNhdGNoKCgpID0+IHt9KTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNvbW1pdHRlZCxcbiAgICAgICAgZmluaXNoZWQsXG4gICAgICB9O1xuICAgIH1cbiAgICBpZiAoZW50cnkgPT09IHRoaXMuY3VycmVudEVudHJ5KSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjb21taXR0ZWQ6IFByb21pc2UucmVzb2x2ZSh0aGlzLmN1cnJlbnRFbnRyeSksXG4gICAgICAgIGZpbmlzaGVkOiBQcm9taXNlLnJlc29sdmUodGhpcy5jdXJyZW50RW50cnkpLFxuICAgICAgfTtcbiAgICB9XG4gICAgaWYgKHRoaXMudHJhdmVyc2FsUXVldWUuaGFzKGVudHJ5LmtleSkpIHtcbiAgICAgIGNvbnN0IGV4aXN0aW5nUmVzdWx0ID0gdGhpcy50cmF2ZXJzYWxRdWV1ZS5nZXQoZW50cnkua2V5KSE7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjb21taXR0ZWQ6IGV4aXN0aW5nUmVzdWx0LmNvbW1pdHRlZCxcbiAgICAgICAgZmluaXNoZWQ6IGV4aXN0aW5nUmVzdWx0LmZpbmlzaGVkLFxuICAgICAgfTtcbiAgICB9XG5cbiAgICBjb25zdCBoYXNoQ2hhbmdlID0gaXNIYXNoQ2hhbmdlKGZyb21VcmwsIG5ldyBVUkwoZW50cnkudXJsISwgdGhpcy5jdXJyZW50RW50cnkudXJsISkpO1xuICAgIGNvbnN0IGRlc3RpbmF0aW9uID0gbmV3IEZha2VOYXZpZ2F0aW9uRGVzdGluYXRpb24oe1xuICAgICAgdXJsOiBlbnRyeS51cmwhLFxuICAgICAgc3RhdGU6IGVudHJ5LmdldFN0YXRlKCksXG4gICAgICBoaXN0b3J5U3RhdGU6IGVudHJ5LmdldEhpc3RvcnlTdGF0ZSgpLFxuICAgICAga2V5OiBlbnRyeS5rZXksXG4gICAgICBpZDogZW50cnkuaWQsXG4gICAgICBpbmRleDogZW50cnkuaW5kZXgsXG4gICAgICBzYW1lRG9jdW1lbnQ6IGVudHJ5LnNhbWVEb2N1bWVudCxcbiAgICB9KTtcbiAgICB0aGlzLnByb3NwZWN0aXZlRW50cnlJbmRleCA9IGVudHJ5LmluZGV4O1xuICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBJbnRlcm5hbE5hdmlnYXRpb25SZXN1bHQoKTtcbiAgICB0aGlzLnRyYXZlcnNhbFF1ZXVlLnNldChlbnRyeS5rZXksIHJlc3VsdCk7XG4gICAgdGhpcy5ydW5UcmF2ZXJzYWwoKCkgPT4ge1xuICAgICAgdGhpcy50cmF2ZXJzYWxRdWV1ZS5kZWxldGUoZW50cnkua2V5KTtcbiAgICAgIHRoaXMudXNlckFnZW50TmF2aWdhdGUoZGVzdGluYXRpb24sIHJlc3VsdCwge1xuICAgICAgICBuYXZpZ2F0aW9uVHlwZTogJ3RyYXZlcnNlJyxcbiAgICAgICAgY2FuY2VsYWJsZTogdHJ1ZSxcbiAgICAgICAgY2FuSW50ZXJjZXB0OiB0cnVlLFxuICAgICAgICAvLyBBbHdheXMgZmFsc2UgZm9yIHRyYXZlcnNlVG8oKS5cbiAgICAgICAgdXNlckluaXRpYXRlZDogZmFsc2UsXG4gICAgICAgIGhhc2hDaGFuZ2UsXG4gICAgICAgIGluZm86IG9wdGlvbnM/LmluZm8sXG4gICAgICB9KTtcbiAgICB9KTtcbiAgICByZXR1cm4ge1xuICAgICAgY29tbWl0dGVkOiByZXN1bHQuY29tbWl0dGVkLFxuICAgICAgZmluaXNoZWQ6IHJlc3VsdC5maW5pc2hlZCxcbiAgICB9O1xuICB9XG5cbiAgLyoqIEVxdWl2YWxlbnQgdG8gYG5hdmlnYXRpb24uYmFjaygpYC4gKi9cbiAgYmFjayhvcHRpb25zPzogTmF2aWdhdGlvbk9wdGlvbnMpOiBGYWtlTmF2aWdhdGlvblJlc3VsdCB7XG4gICAgaWYgKHRoaXMuY3VycmVudEVudHJ5SW5kZXggPT09IDApIHtcbiAgICAgIGNvbnN0IGRvbUV4Y2VwdGlvbiA9IG5ldyBET01FeGNlcHRpb24oJ0Nhbm5vdCBnbyBiYWNrJywgJ0ludmFsaWRTdGF0ZUVycm9yJyk7XG4gICAgICBjb25zdCBjb21taXR0ZWQgPSBQcm9taXNlLnJlamVjdChkb21FeGNlcHRpb24pO1xuICAgICAgY29uc3QgZmluaXNoZWQgPSBQcm9taXNlLnJlamVjdChkb21FeGNlcHRpb24pO1xuICAgICAgY29tbWl0dGVkLmNhdGNoKCgpID0+IHt9KTtcbiAgICAgIGZpbmlzaGVkLmNhdGNoKCgpID0+IHt9KTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNvbW1pdHRlZCxcbiAgICAgICAgZmluaXNoZWQsXG4gICAgICB9O1xuICAgIH1cbiAgICBjb25zdCBlbnRyeSA9IHRoaXMuZW50cmllc0Fyclt0aGlzLmN1cnJlbnRFbnRyeUluZGV4IC0gMV07XG4gICAgcmV0dXJuIHRoaXMudHJhdmVyc2VUbyhlbnRyeS5rZXksIG9wdGlvbnMpO1xuICB9XG5cbiAgLyoqIEVxdWl2YWxlbnQgdG8gYG5hdmlnYXRpb24uZm9yd2FyZCgpYC4gKi9cbiAgZm9yd2FyZChvcHRpb25zPzogTmF2aWdhdGlvbk9wdGlvbnMpOiBGYWtlTmF2aWdhdGlvblJlc3VsdCB7XG4gICAgaWYgKHRoaXMuY3VycmVudEVudHJ5SW5kZXggPT09IHRoaXMuZW50cmllc0Fyci5sZW5ndGggLSAxKSB7XG4gICAgICBjb25zdCBkb21FeGNlcHRpb24gPSBuZXcgRE9NRXhjZXB0aW9uKCdDYW5ub3QgZ28gZm9yd2FyZCcsICdJbnZhbGlkU3RhdGVFcnJvcicpO1xuICAgICAgY29uc3QgY29tbWl0dGVkID0gUHJvbWlzZS5yZWplY3QoZG9tRXhjZXB0aW9uKTtcbiAgICAgIGNvbnN0IGZpbmlzaGVkID0gUHJvbWlzZS5yZWplY3QoZG9tRXhjZXB0aW9uKTtcbiAgICAgIGNvbW1pdHRlZC5jYXRjaCgoKSA9PiB7fSk7XG4gICAgICBmaW5pc2hlZC5jYXRjaCgoKSA9PiB7fSk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjb21taXR0ZWQsXG4gICAgICAgIGZpbmlzaGVkLFxuICAgICAgfTtcbiAgICB9XG4gICAgY29uc3QgZW50cnkgPSB0aGlzLmVudHJpZXNBcnJbdGhpcy5jdXJyZW50RW50cnlJbmRleCArIDFdO1xuICAgIHJldHVybiB0aGlzLnRyYXZlcnNlVG8oZW50cnkua2V5LCBvcHRpb25zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFcXVpdmFsZW50IHRvIGBoaXN0b3J5LmdvKClgLlxuICAgKiBOb3RlIHRoYXQgdGhpcyBtZXRob2QgZG9lcyBub3QgYWN0dWFsbHkgd29yayBwcmVjaXNlbHkgdG8gaG93IENocm9tZVxuICAgKiBkb2VzLCBpbnN0ZWFkIGNob29zaW5nIGEgc2ltcGxlciBtb2RlbCB3aXRoIGxlc3MgdW5leHBlY3RlZCBiZWhhdmlvci5cbiAgICogQ2hyb21lIGhhcyBhIGZldyBlZGdlIGNhc2Ugb3B0aW1pemF0aW9ucywgZm9yIGluc3RhbmNlIHdpdGggcmVwZWF0ZWRcbiAgICogYGJhY2soKTsgZm9yd2FyZCgpYCBjaGFpbnMgaXQgY29sbGFwc2VzIGNlcnRhaW4gdHJhdmVyc2Fscy5cbiAgICovXG4gIGdvKGRpcmVjdGlvbjogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3QgdGFyZ2V0SW5kZXggPSB0aGlzLnByb3NwZWN0aXZlRW50cnlJbmRleCArIGRpcmVjdGlvbjtcbiAgICBpZiAodGFyZ2V0SW5kZXggPj0gdGhpcy5lbnRyaWVzQXJyLmxlbmd0aCB8fCB0YXJnZXRJbmRleCA8IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5wcm9zcGVjdGl2ZUVudHJ5SW5kZXggPSB0YXJnZXRJbmRleDtcbiAgICB0aGlzLnJ1blRyYXZlcnNhbCgoKSA9PiB7XG4gICAgICAvLyBDaGVjayBhZ2FpbiB0aGF0IGRlc3RpbmF0aW9uIGlzIGluIHRoZSBlbnRyaWVzIGFycmF5LlxuICAgICAgaWYgKHRhcmdldEluZGV4ID49IHRoaXMuZW50cmllc0Fyci5sZW5ndGggfHwgdGFyZ2V0SW5kZXggPCAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGZyb21VcmwgPSBuZXcgVVJMKHRoaXMuY3VycmVudEVudHJ5LnVybCEpO1xuICAgICAgY29uc3QgZW50cnkgPSB0aGlzLmVudHJpZXNBcnJbdGFyZ2V0SW5kZXhdO1xuICAgICAgY29uc3QgaGFzaENoYW5nZSA9IGlzSGFzaENoYW5nZShmcm9tVXJsLCBuZXcgVVJMKGVudHJ5LnVybCEsIHRoaXMuY3VycmVudEVudHJ5LnVybCEpKTtcbiAgICAgIGNvbnN0IGRlc3RpbmF0aW9uID0gbmV3IEZha2VOYXZpZ2F0aW9uRGVzdGluYXRpb24oe1xuICAgICAgICB1cmw6IGVudHJ5LnVybCEsXG4gICAgICAgIHN0YXRlOiBlbnRyeS5nZXRTdGF0ZSgpLFxuICAgICAgICBoaXN0b3J5U3RhdGU6IGVudHJ5LmdldEhpc3RvcnlTdGF0ZSgpLFxuICAgICAgICBrZXk6IGVudHJ5LmtleSxcbiAgICAgICAgaWQ6IGVudHJ5LmlkLFxuICAgICAgICBpbmRleDogZW50cnkuaW5kZXgsXG4gICAgICAgIHNhbWVEb2N1bWVudDogZW50cnkuc2FtZURvY3VtZW50LFxuICAgICAgfSk7XG4gICAgICBjb25zdCByZXN1bHQgPSBuZXcgSW50ZXJuYWxOYXZpZ2F0aW9uUmVzdWx0KCk7XG4gICAgICB0aGlzLnVzZXJBZ2VudE5hdmlnYXRlKGRlc3RpbmF0aW9uLCByZXN1bHQsIHtcbiAgICAgICAgbmF2aWdhdGlvblR5cGU6ICd0cmF2ZXJzZScsXG4gICAgICAgIGNhbmNlbGFibGU6IHRydWUsXG4gICAgICAgIGNhbkludGVyY2VwdDogdHJ1ZSxcbiAgICAgICAgLy8gQWx3YXlzIGZhbHNlIGZvciBnbygpLlxuICAgICAgICB1c2VySW5pdGlhdGVkOiBmYWxzZSxcbiAgICAgICAgaGFzaENoYW5nZSxcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqIFJ1bnMgYSB0cmF2ZXJzYWwgc3luY2hyb25vdXNseSBvciBhc3luY2hyb25vdXNseSAqL1xuICBwcml2YXRlIHJ1blRyYXZlcnNhbCh0cmF2ZXJzYWw6ICgpID0+IHZvaWQpIHtcbiAgICBpZiAodGhpcy5zeW5jaHJvbm91c1RyYXZlcnNhbHMpIHtcbiAgICAgIHRyYXZlcnNhbCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIEVhY2ggdHJhdmVyc2FsIG9jY3VwaWVzIGEgc2luZ2xlIHRpbWVvdXQgcmVzb2x1dGlvbi5cbiAgICAvLyBUaGlzIG1lYW5zIHRoYXQgUHJvbWlzZXMgYWRkZWQgdG8gY29tbWl0IGFuZCBmaW5pc2ggc2hvdWxkIHJlc29sdmVcbiAgICAvLyBiZWZvcmUgdGhlIG5leHQgdHJhdmVyc2FsLlxuICAgIHRoaXMubmV4dFRyYXZlcnNhbCA9IHRoaXMubmV4dFRyYXZlcnNhbC50aGVuKCgpID0+IHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSkgPT4ge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgdHJhdmVyc2FsKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKiogRXF1aXZhbGVudCB0byBgbmF2aWdhdGlvbi5hZGRFdmVudExpc3RlbmVyKClgLiAqL1xuICBhZGRFdmVudExpc3RlbmVyKFxuICAgIHR5cGU6IHN0cmluZyxcbiAgICBjYWxsYmFjazogRXZlbnRMaXN0ZW5lck9yRXZlbnRMaXN0ZW5lck9iamVjdCxcbiAgICBvcHRpb25zPzogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMgfCBib29sZWFuLFxuICApIHtcbiAgICB0aGlzLmV2ZW50VGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgY2FsbGJhY2ssIG9wdGlvbnMpO1xuICB9XG5cbiAgLyoqIEVxdWl2YWxlbnQgdG8gYG5hdmlnYXRpb24ucmVtb3ZlRXZlbnRMaXN0ZW5lcigpYC4gKi9cbiAgcmVtb3ZlRXZlbnRMaXN0ZW5lcihcbiAgICB0eXBlOiBzdHJpbmcsXG4gICAgY2FsbGJhY2s6IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QsXG4gICAgb3B0aW9ucz86IEV2ZW50TGlzdGVuZXJPcHRpb25zIHwgYm9vbGVhbixcbiAgKSB7XG4gICAgdGhpcy5ldmVudFRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGNhbGxiYWNrLCBvcHRpb25zKTtcbiAgfVxuXG4gIC8qKiBFcXVpdmFsZW50IHRvIGBuYXZpZ2F0aW9uLmRpc3BhdGNoRXZlbnQoKWAgKi9cbiAgZGlzcGF0Y2hFdmVudChldmVudDogRXZlbnQpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5ldmVudFRhcmdldC5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgfVxuXG4gIC8qKiBDbGVhbnMgdXAgcmVzb3VyY2VzLiAqL1xuICBkaXNwb3NlKCkge1xuICAgIC8vIFJlY3JlYXRlIGV2ZW50VGFyZ2V0IHRvIHJlbGVhc2UgY3VycmVudCBsaXN0ZW5lcnMuXG4gICAgLy8gYGRvY3VtZW50LmNyZWF0ZUVsZW1lbnRgIGJlY2F1c2UgTm9kZUpTIGBFdmVudFRhcmdldGAgaXMgaW5jb21wYXRpYmxlIHdpdGggRG9taW5vJ3MgYEV2ZW50YC5cbiAgICB0aGlzLmV2ZW50VGFyZ2V0ID0gdGhpcy53aW5kb3cuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdGhpcy5kaXNwb3NlZCA9IHRydWU7XG4gIH1cblxuICAvKiogUmV0dXJucyB3aGV0aGVyIHRoaXMgZmFrZSBpcyBkaXNwb3NlZC4gKi9cbiAgaXNEaXNwb3NlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5kaXNwb3NlZDtcbiAgfVxuXG4gIC8qKiBJbXBsZW1lbnRhdGlvbiBmb3IgYWxsIG5hdmlnYXRpb25zIGFuZCB0cmF2ZXJzYWxzLiAqL1xuICBwcml2YXRlIHVzZXJBZ2VudE5hdmlnYXRlKFxuICAgIGRlc3RpbmF0aW9uOiBGYWtlTmF2aWdhdGlvbkRlc3RpbmF0aW9uLFxuICAgIHJlc3VsdDogSW50ZXJuYWxOYXZpZ2F0aW9uUmVzdWx0LFxuICAgIG9wdGlvbnM6IEludGVybmFsTmF2aWdhdGVPcHRpb25zLFxuICApIHtcbiAgICAvLyBUaGUgZmlyc3QgbmF2aWdhdGlvbiBzaG91bGQgZGlzYWxsb3cgYW55IGZ1dHVyZSBjYWxscyB0byBzZXQgdGhlIGluaXRpYWxcbiAgICAvLyBlbnRyeS5cbiAgICB0aGlzLmNhblNldEluaXRpYWxFbnRyeSA9IGZhbHNlO1xuICAgIGlmICh0aGlzLm5hdmlnYXRlRXZlbnQpIHtcbiAgICAgIHRoaXMubmF2aWdhdGVFdmVudC5jYW5jZWwobmV3IERPTUV4Y2VwdGlvbignTmF2aWdhdGlvbiB3YXMgYWJvcnRlZCcsICdBYm9ydEVycm9yJykpO1xuICAgICAgdGhpcy5uYXZpZ2F0ZUV2ZW50ID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGNvbnN0IG5hdmlnYXRlRXZlbnQgPSBjcmVhdGVGYWtlTmF2aWdhdGVFdmVudCh7XG4gICAgICBuYXZpZ2F0aW9uVHlwZTogb3B0aW9ucy5uYXZpZ2F0aW9uVHlwZSxcbiAgICAgIGNhbmNlbGFibGU6IG9wdGlvbnMuY2FuY2VsYWJsZSxcbiAgICAgIGNhbkludGVyY2VwdDogb3B0aW9ucy5jYW5JbnRlcmNlcHQsXG4gICAgICB1c2VySW5pdGlhdGVkOiBvcHRpb25zLnVzZXJJbml0aWF0ZWQsXG4gICAgICBoYXNoQ2hhbmdlOiBvcHRpb25zLmhhc2hDaGFuZ2UsXG4gICAgICBzaWduYWw6IHJlc3VsdC5zaWduYWwsXG4gICAgICBkZXN0aW5hdGlvbixcbiAgICAgIGluZm86IG9wdGlvbnMuaW5mbyxcbiAgICAgIHNhbWVEb2N1bWVudDogZGVzdGluYXRpb24uc2FtZURvY3VtZW50LFxuICAgICAgc2tpcFBvcFN0YXRlOiBvcHRpb25zLnNraXBQb3BTdGF0ZSxcbiAgICAgIHJlc3VsdCxcbiAgICAgIHVzZXJBZ2VudENvbW1pdDogKCkgPT4ge1xuICAgICAgICB0aGlzLnVzZXJBZ2VudENvbW1pdCgpO1xuICAgICAgfSxcbiAgICB9KTtcblxuICAgIHRoaXMubmF2aWdhdGVFdmVudCA9IG5hdmlnYXRlRXZlbnQ7XG4gICAgdGhpcy5ldmVudFRhcmdldC5kaXNwYXRjaEV2ZW50KG5hdmlnYXRlRXZlbnQpO1xuICAgIG5hdmlnYXRlRXZlbnQuZGlzcGF0Y2hlZE5hdmlnYXRlRXZlbnQoKTtcbiAgICBpZiAobmF2aWdhdGVFdmVudC5jb21taXRPcHRpb24gPT09ICdpbW1lZGlhdGUnKSB7XG4gICAgICBuYXZpZ2F0ZUV2ZW50LmNvbW1pdCgvKiBpbnRlcm5hbD0gKi8gdHJ1ZSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEltcGxlbWVudGF0aW9uIHRvIGNvbW1pdCBhIG5hdmlnYXRpb24uICovXG4gIHByaXZhdGUgdXNlckFnZW50Q29tbWl0KCkge1xuICAgIGlmICghdGhpcy5uYXZpZ2F0ZUV2ZW50KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGZyb20gPSB0aGlzLmN1cnJlbnRFbnRyeTtcbiAgICBpZiAoIXRoaXMubmF2aWdhdGVFdmVudC5zYW1lRG9jdW1lbnQpIHtcbiAgICAgIGNvbnN0IGVycm9yID0gbmV3IEVycm9yKCdDYW5ub3QgbmF2aWdhdGUgdG8gYSBub24tc2FtZS1kb2N1bWVudCBVUkwuJyk7XG4gICAgICB0aGlzLm5hdmlnYXRlRXZlbnQuY2FuY2VsKGVycm9yKTtcbiAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbiAgICBpZiAoXG4gICAgICB0aGlzLm5hdmlnYXRlRXZlbnQubmF2aWdhdGlvblR5cGUgPT09ICdwdXNoJyB8fFxuICAgICAgdGhpcy5uYXZpZ2F0ZUV2ZW50Lm5hdmlnYXRpb25UeXBlID09PSAncmVwbGFjZSdcbiAgICApIHtcbiAgICAgIHRoaXMudXNlckFnZW50UHVzaE9yUmVwbGFjZSh0aGlzLm5hdmlnYXRlRXZlbnQuZGVzdGluYXRpb24sIHtcbiAgICAgICAgbmF2aWdhdGlvblR5cGU6IHRoaXMubmF2aWdhdGVFdmVudC5uYXZpZ2F0aW9uVHlwZSxcbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodGhpcy5uYXZpZ2F0ZUV2ZW50Lm5hdmlnYXRpb25UeXBlID09PSAndHJhdmVyc2UnKSB7XG4gICAgICB0aGlzLnVzZXJBZ2VudFRyYXZlcnNlKHRoaXMubmF2aWdhdGVFdmVudC5kZXN0aW5hdGlvbik7XG4gICAgfVxuICAgIHRoaXMubmF2aWdhdGVFdmVudC51c2VyQWdlbnROYXZpZ2F0ZWQodGhpcy5jdXJyZW50RW50cnkpO1xuICAgIGNvbnN0IGN1cnJlbnRFbnRyeUNoYW5nZUV2ZW50ID0gY3JlYXRlRmFrZU5hdmlnYXRpb25DdXJyZW50RW50cnlDaGFuZ2VFdmVudCh7XG4gICAgICBmcm9tLFxuICAgICAgbmF2aWdhdGlvblR5cGU6IHRoaXMubmF2aWdhdGVFdmVudC5uYXZpZ2F0aW9uVHlwZSxcbiAgICB9KTtcbiAgICB0aGlzLmV2ZW50VGFyZ2V0LmRpc3BhdGNoRXZlbnQoY3VycmVudEVudHJ5Q2hhbmdlRXZlbnQpO1xuICAgIGlmICghdGhpcy5uYXZpZ2F0ZUV2ZW50LnNraXBQb3BTdGF0ZSkge1xuICAgICAgY29uc3QgcG9wU3RhdGVFdmVudCA9IGNyZWF0ZVBvcFN0YXRlRXZlbnQoe1xuICAgICAgICBzdGF0ZTogdGhpcy5uYXZpZ2F0ZUV2ZW50LmRlc3RpbmF0aW9uLmdldEhpc3RvcnlTdGF0ZSgpLFxuICAgICAgfSk7XG4gICAgICB0aGlzLndpbmRvdy5kaXNwYXRjaEV2ZW50KHBvcFN0YXRlRXZlbnQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBJbXBsZW1lbnRhdGlvbiBmb3IgYSBwdXNoIG9yIHJlcGxhY2UgbmF2aWdhdGlvbi4gKi9cbiAgcHJpdmF0ZSB1c2VyQWdlbnRQdXNoT3JSZXBsYWNlKFxuICAgIGRlc3RpbmF0aW9uOiBGYWtlTmF2aWdhdGlvbkRlc3RpbmF0aW9uLFxuICAgIHtuYXZpZ2F0aW9uVHlwZX06IHtuYXZpZ2F0aW9uVHlwZTogTmF2aWdhdGlvblR5cGVTdHJpbmd9LFxuICApIHtcbiAgICBpZiAobmF2aWdhdGlvblR5cGUgPT09ICdwdXNoJykge1xuICAgICAgdGhpcy5jdXJyZW50RW50cnlJbmRleCsrO1xuICAgICAgdGhpcy5wcm9zcGVjdGl2ZUVudHJ5SW5kZXggPSB0aGlzLmN1cnJlbnRFbnRyeUluZGV4O1xuICAgIH1cbiAgICBjb25zdCBpbmRleCA9IHRoaXMuY3VycmVudEVudHJ5SW5kZXg7XG4gICAgY29uc3Qga2V5ID0gbmF2aWdhdGlvblR5cGUgPT09ICdwdXNoJyA/IFN0cmluZyh0aGlzLm5leHRLZXkrKykgOiB0aGlzLmN1cnJlbnRFbnRyeS5rZXk7XG4gICAgY29uc3QgZW50cnkgPSBuZXcgRmFrZU5hdmlnYXRpb25IaXN0b3J5RW50cnkoZGVzdGluYXRpb24udXJsLCB7XG4gICAgICBpZDogU3RyaW5nKHRoaXMubmV4dElkKyspLFxuICAgICAga2V5LFxuICAgICAgaW5kZXgsXG4gICAgICBzYW1lRG9jdW1lbnQ6IHRydWUsXG4gICAgICBzdGF0ZTogZGVzdGluYXRpb24uZ2V0U3RhdGUoKSxcbiAgICAgIGhpc3RvcnlTdGF0ZTogZGVzdGluYXRpb24uZ2V0SGlzdG9yeVN0YXRlKCksXG4gICAgfSk7XG4gICAgaWYgKG5hdmlnYXRpb25UeXBlID09PSAncHVzaCcpIHtcbiAgICAgIHRoaXMuZW50cmllc0Fyci5zcGxpY2UoaW5kZXgsIEluZmluaXR5LCBlbnRyeSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZW50cmllc0FycltpbmRleF0gPSBlbnRyeTtcbiAgICB9XG4gIH1cblxuICAvKiogSW1wbGVtZW50YXRpb24gZm9yIGEgdHJhdmVyc2UgbmF2aWdhdGlvbi4gKi9cbiAgcHJpdmF0ZSB1c2VyQWdlbnRUcmF2ZXJzZShkZXN0aW5hdGlvbjogRmFrZU5hdmlnYXRpb25EZXN0aW5hdGlvbikge1xuICAgIHRoaXMuY3VycmVudEVudHJ5SW5kZXggPSBkZXN0aW5hdGlvbi5pbmRleDtcbiAgfVxuXG4gIC8qKiBVdGlsaXR5IG1ldGhvZCBmb3IgZmluZGluZyBlbnRyaWVzIHdpdGggdGhlIGdpdmVuIGBrZXlgLiAqL1xuICBwcml2YXRlIGZpbmRFbnRyeShrZXk6IHN0cmluZykge1xuICAgIGZvciAoY29uc3QgZW50cnkgb2YgdGhpcy5lbnRyaWVzQXJyKSB7XG4gICAgICBpZiAoZW50cnkua2V5ID09PSBrZXkpIHJldHVybiBlbnRyeTtcbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIHNldCBvbm5hdmlnYXRlKF9oYW5kbGVyOiAoKHRoaXM6IE5hdmlnYXRpb24sIGV2OiBOYXZpZ2F0ZUV2ZW50KSA9PiBhbnkpIHwgbnVsbCkge1xuICAgIHRocm93IG5ldyBFcnJvcigndW5pbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgZ2V0IG9ubmF2aWdhdGUoKTogKCh0aGlzOiBOYXZpZ2F0aW9uLCBldjogTmF2aWdhdGVFdmVudCkgPT4gYW55KSB8IG51bGwge1xuICAgIHRocm93IG5ldyBFcnJvcigndW5pbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgc2V0IG9uY3VycmVudGVudHJ5Y2hhbmdlKFxuICAgIF9oYW5kbGVyOiAoKHRoaXM6IE5hdmlnYXRpb24sIGV2OiBOYXZpZ2F0aW9uQ3VycmVudEVudHJ5Q2hhbmdlRXZlbnQpID0+IGFueSkgfCBudWxsLFxuICApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3VuaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIGdldCBvbmN1cnJlbnRlbnRyeWNoYW5nZSgpOlxuICAgIHwgKCh0aGlzOiBOYXZpZ2F0aW9uLCBldjogTmF2aWdhdGlvbkN1cnJlbnRFbnRyeUNoYW5nZUV2ZW50KSA9PiBhbnkpXG4gICAgfCBudWxsIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3VuaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIHNldCBvbm5hdmlnYXRlc3VjY2VzcyhfaGFuZGxlcjogKCh0aGlzOiBOYXZpZ2F0aW9uLCBldjogRXZlbnQpID0+IGFueSkgfCBudWxsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCd1bmltcGxlbWVudGVkJyk7XG4gIH1cblxuICBnZXQgb25uYXZpZ2F0ZXN1Y2Nlc3MoKTogKCh0aGlzOiBOYXZpZ2F0aW9uLCBldjogRXZlbnQpID0+IGFueSkgfCBudWxsIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3VuaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIHNldCBvbm5hdmlnYXRlZXJyb3IoX2hhbmRsZXI6ICgodGhpczogTmF2aWdhdGlvbiwgZXY6IEVycm9yRXZlbnQpID0+IGFueSkgfCBudWxsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCd1bmltcGxlbWVudGVkJyk7XG4gIH1cblxuICBnZXQgb25uYXZpZ2F0ZWVycm9yKCk6ICgodGhpczogTmF2aWdhdGlvbiwgZXY6IEVycm9yRXZlbnQpID0+IGFueSkgfCBudWxsIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3VuaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIGdldCB0cmFuc2l0aW9uKCk6IE5hdmlnYXRpb25UcmFuc2l0aW9uIHwgbnVsbCB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCd1bmltcGxlbWVudGVkJyk7XG4gIH1cblxuICB1cGRhdGVDdXJyZW50RW50cnkoX29wdGlvbnM6IE5hdmlnYXRpb25VcGRhdGVDdXJyZW50RW50cnlPcHRpb25zKTogdm9pZCB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCd1bmltcGxlbWVudGVkJyk7XG4gIH1cblxuICByZWxvYWQoX29wdGlvbnM/OiBOYXZpZ2F0aW9uUmVsb2FkT3B0aW9ucyk6IE5hdmlnYXRpb25SZXN1bHQge1xuICAgIHRocm93IG5ldyBFcnJvcigndW5pbXBsZW1lbnRlZCcpO1xuICB9XG59XG5cbi8qKlxuICogRmFrZSBlcXVpdmFsZW50IG9mIHRoZSBgTmF2aWdhdGlvblJlc3VsdGAgaW50ZXJmYWNlIHdpdGhcbiAqIGBGYWtlTmF2aWdhdGlvbkhpc3RvcnlFbnRyeWAuXG4gKi9cbmludGVyZmFjZSBGYWtlTmF2aWdhdGlvblJlc3VsdCBleHRlbmRzIE5hdmlnYXRpb25SZXN1bHQge1xuICByZWFkb25seSBjb21taXR0ZWQ6IFByb21pc2U8RmFrZU5hdmlnYXRpb25IaXN0b3J5RW50cnk+O1xuICByZWFkb25seSBmaW5pc2hlZDogUHJvbWlzZTxGYWtlTmF2aWdhdGlvbkhpc3RvcnlFbnRyeT47XG59XG5cbi8qKlxuICogRmFrZSBlcXVpdmFsZW50IG9mIGBOYXZpZ2F0aW9uSGlzdG9yeUVudHJ5YC5cbiAqL1xuZXhwb3J0IGNsYXNzIEZha2VOYXZpZ2F0aW9uSGlzdG9yeUVudHJ5IGltcGxlbWVudHMgTmF2aWdhdGlvbkhpc3RvcnlFbnRyeSB7XG4gIHJlYWRvbmx5IHNhbWVEb2N1bWVudDtcblxuICByZWFkb25seSBpZDogc3RyaW5nO1xuICByZWFkb25seSBrZXk6IHN0cmluZztcbiAgcmVhZG9ubHkgaW5kZXg6IG51bWJlcjtcbiAgcHJpdmF0ZSByZWFkb25seSBzdGF0ZTogdW5rbm93bjtcbiAgcHJpdmF0ZSByZWFkb25seSBoaXN0b3J5U3RhdGU6IHVua25vd247XG5cbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWFueVxuICBvbmRpc3Bvc2U6ICgodGhpczogTmF2aWdhdGlvbkhpc3RvcnlFbnRyeSwgZXY6IEV2ZW50KSA9PiBhbnkpIHwgbnVsbCA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcmVhZG9ubHkgdXJsOiBzdHJpbmcgfCBudWxsLFxuICAgIHtcbiAgICAgIGlkLFxuICAgICAga2V5LFxuICAgICAgaW5kZXgsXG4gICAgICBzYW1lRG9jdW1lbnQsXG4gICAgICBzdGF0ZSxcbiAgICAgIGhpc3RvcnlTdGF0ZSxcbiAgICB9OiB7XG4gICAgICBpZDogc3RyaW5nO1xuICAgICAga2V5OiBzdHJpbmc7XG4gICAgICBpbmRleDogbnVtYmVyO1xuICAgICAgc2FtZURvY3VtZW50OiBib29sZWFuO1xuICAgICAgaGlzdG9yeVN0YXRlOiB1bmtub3duO1xuICAgICAgc3RhdGU/OiB1bmtub3duO1xuICAgIH0sXG4gICkge1xuICAgIHRoaXMuaWQgPSBpZDtcbiAgICB0aGlzLmtleSA9IGtleTtcbiAgICB0aGlzLmluZGV4ID0gaW5kZXg7XG4gICAgdGhpcy5zYW1lRG9jdW1lbnQgPSBzYW1lRG9jdW1lbnQ7XG4gICAgdGhpcy5zdGF0ZSA9IHN0YXRlO1xuICAgIHRoaXMuaGlzdG9yeVN0YXRlID0gaGlzdG9yeVN0YXRlO1xuICB9XG5cbiAgZ2V0U3RhdGUoKTogdW5rbm93biB7XG4gICAgLy8gQnVkZ2V0IGNvcHkuXG4gICAgcmV0dXJuIHRoaXMuc3RhdGUgPyBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMuc3RhdGUpKSA6IHRoaXMuc3RhdGU7XG4gIH1cblxuICBnZXRIaXN0b3J5U3RhdGUoKTogdW5rbm93biB7XG4gICAgLy8gQnVkZ2V0IGNvcHkuXG4gICAgcmV0dXJuIHRoaXMuaGlzdG9yeVN0YXRlID8gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLmhpc3RvcnlTdGF0ZSkpIDogdGhpcy5oaXN0b3J5U3RhdGU7XG4gIH1cblxuICBhZGRFdmVudExpc3RlbmVyKFxuICAgIHR5cGU6IHN0cmluZyxcbiAgICBjYWxsYmFjazogRXZlbnRMaXN0ZW5lck9yRXZlbnRMaXN0ZW5lck9iamVjdCxcbiAgICBvcHRpb25zPzogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMgfCBib29sZWFuLFxuICApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3VuaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIHJlbW92ZUV2ZW50TGlzdGVuZXIoXG4gICAgdHlwZTogc3RyaW5nLFxuICAgIGNhbGxiYWNrOiBFdmVudExpc3RlbmVyT3JFdmVudExpc3RlbmVyT2JqZWN0LFxuICAgIG9wdGlvbnM/OiBFdmVudExpc3RlbmVyT3B0aW9ucyB8IGJvb2xlYW4sXG4gICkge1xuICAgIHRocm93IG5ldyBFcnJvcigndW5pbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgZGlzcGF0Y2hFdmVudChldmVudDogRXZlbnQpOiBib29sZWFuIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3VuaW1wbGVtZW50ZWQnKTtcbiAgfVxufVxuXG4vKiogYE5hdmlnYXRpb25JbnRlcmNlcHRPcHRpb25zYCB3aXRoIGV4cGVyaW1lbnRhbCBjb21taXQgb3B0aW9uLiAqL1xuZXhwb3J0IGludGVyZmFjZSBFeHBlcmltZW50YWxOYXZpZ2F0aW9uSW50ZXJjZXB0T3B0aW9ucyBleHRlbmRzIE5hdmlnYXRpb25JbnRlcmNlcHRPcHRpb25zIHtcbiAgY29tbWl0PzogJ2ltbWVkaWF0ZScgfCAnYWZ0ZXItdHJhbnNpdGlvbic7XG59XG5cbi8qKiBgTmF2aWdhdGVFdmVudGAgd2l0aCBleHBlcmltZW50YWwgY29tbWl0IGZ1bmN0aW9uLiAqL1xuZXhwb3J0IGludGVyZmFjZSBFeHBlcmltZW50YWxOYXZpZ2F0ZUV2ZW50IGV4dGVuZHMgTmF2aWdhdGVFdmVudCB7XG4gIGludGVyY2VwdChvcHRpb25zPzogRXhwZXJpbWVudGFsTmF2aWdhdGlvbkludGVyY2VwdE9wdGlvbnMpOiB2b2lkO1xuXG4gIGNvbW1pdCgpOiB2b2lkO1xufVxuXG4vKipcbiAqIEZha2UgZXF1aXZhbGVudCBvZiBgTmF2aWdhdGVFdmVudGAuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRmFrZU5hdmlnYXRlRXZlbnQgZXh0ZW5kcyBFeHBlcmltZW50YWxOYXZpZ2F0ZUV2ZW50IHtcbiAgcmVhZG9ubHkgZGVzdGluYXRpb246IEZha2VOYXZpZ2F0aW9uRGVzdGluYXRpb247XG59XG5cbmludGVyZmFjZSBJbnRlcm5hbEZha2VOYXZpZ2F0ZUV2ZW50IGV4dGVuZHMgRmFrZU5hdmlnYXRlRXZlbnQge1xuICByZWFkb25seSBzYW1lRG9jdW1lbnQ6IGJvb2xlYW47XG4gIHJlYWRvbmx5IHNraXBQb3BTdGF0ZT86IGJvb2xlYW47XG4gIHJlYWRvbmx5IGNvbW1pdE9wdGlvbjogJ2FmdGVyLXRyYW5zaXRpb24nIHwgJ2ltbWVkaWF0ZSc7XG4gIHJlYWRvbmx5IHJlc3VsdDogSW50ZXJuYWxOYXZpZ2F0aW9uUmVzdWx0O1xuXG4gIGNvbW1pdChpbnRlcm5hbD86IGJvb2xlYW4pOiB2b2lkO1xuICBjYW5jZWwocmVhc29uOiBFcnJvcik6IHZvaWQ7XG4gIGRpc3BhdGNoZWROYXZpZ2F0ZUV2ZW50KCk6IHZvaWQ7XG4gIHVzZXJBZ2VudE5hdmlnYXRlZChlbnRyeTogRmFrZU5hdmlnYXRpb25IaXN0b3J5RW50cnkpOiB2b2lkO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIGZha2UgZXF1aXZhbGVudCBvZiBgTmF2aWdhdGVFdmVudGAuIFRoaXMgaXMgbm90IGEgY2xhc3MgYmVjYXVzZSBFUzVcbiAqIHRyYW5zcGlsZWQgSmF2YVNjcmlwdCBjYW5ub3QgZXh0ZW5kIG5hdGl2ZSBFdmVudC5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlRmFrZU5hdmlnYXRlRXZlbnQoe1xuICBjYW5jZWxhYmxlLFxuICBjYW5JbnRlcmNlcHQsXG4gIHVzZXJJbml0aWF0ZWQsXG4gIGhhc2hDaGFuZ2UsXG4gIG5hdmlnYXRpb25UeXBlLFxuICBzaWduYWwsXG4gIGRlc3RpbmF0aW9uLFxuICBpbmZvLFxuICBzYW1lRG9jdW1lbnQsXG4gIHNraXBQb3BTdGF0ZSxcbiAgcmVzdWx0LFxuICB1c2VyQWdlbnRDb21taXQsXG59OiB7XG4gIGNhbmNlbGFibGU6IGJvb2xlYW47XG4gIGNhbkludGVyY2VwdDogYm9vbGVhbjtcbiAgdXNlckluaXRpYXRlZDogYm9vbGVhbjtcbiAgaGFzaENoYW5nZTogYm9vbGVhbjtcbiAgbmF2aWdhdGlvblR5cGU6IE5hdmlnYXRpb25UeXBlU3RyaW5nO1xuICBzaWduYWw6IEFib3J0U2lnbmFsO1xuICBkZXN0aW5hdGlvbjogRmFrZU5hdmlnYXRpb25EZXN0aW5hdGlvbjtcbiAgaW5mbzogdW5rbm93bjtcbiAgc2FtZURvY3VtZW50OiBib29sZWFuO1xuICBza2lwUG9wU3RhdGU/OiBib29sZWFuO1xuICByZXN1bHQ6IEludGVybmFsTmF2aWdhdGlvblJlc3VsdDtcbiAgdXNlckFnZW50Q29tbWl0OiAoKSA9PiB2b2lkO1xufSkge1xuICBjb25zdCBldmVudCA9IG5ldyBFdmVudCgnbmF2aWdhdGUnLCB7YnViYmxlczogZmFsc2UsIGNhbmNlbGFibGV9KSBhcyB7XG4gICAgLXJlYWRvbmx5IFtQIGluIGtleW9mIEludGVybmFsRmFrZU5hdmlnYXRlRXZlbnRdOiBJbnRlcm5hbEZha2VOYXZpZ2F0ZUV2ZW50W1BdO1xuICB9O1xuICBldmVudC5jYW5JbnRlcmNlcHQgPSBjYW5JbnRlcmNlcHQ7XG4gIGV2ZW50LnVzZXJJbml0aWF0ZWQgPSB1c2VySW5pdGlhdGVkO1xuICBldmVudC5oYXNoQ2hhbmdlID0gaGFzaENoYW5nZTtcbiAgZXZlbnQubmF2aWdhdGlvblR5cGUgPSBuYXZpZ2F0aW9uVHlwZTtcbiAgZXZlbnQuc2lnbmFsID0gc2lnbmFsO1xuICBldmVudC5kZXN0aW5hdGlvbiA9IGRlc3RpbmF0aW9uO1xuICBldmVudC5pbmZvID0gaW5mbztcbiAgZXZlbnQuZG93bmxvYWRSZXF1ZXN0ID0gbnVsbDtcbiAgZXZlbnQuZm9ybURhdGEgPSBudWxsO1xuXG4gIGV2ZW50LnNhbWVEb2N1bWVudCA9IHNhbWVEb2N1bWVudDtcbiAgZXZlbnQuc2tpcFBvcFN0YXRlID0gc2tpcFBvcFN0YXRlO1xuICBldmVudC5jb21taXRPcHRpb24gPSAnaW1tZWRpYXRlJztcblxuICBsZXQgaGFuZGxlckZpbmlzaGVkOiBQcm9taXNlPHZvaWQ+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICBsZXQgaW50ZXJjZXB0Q2FsbGVkID0gZmFsc2U7XG4gIGxldCBkaXNwYXRjaGVkTmF2aWdhdGVFdmVudCA9IGZhbHNlO1xuICBsZXQgY29tbWl0Q2FsbGVkID0gZmFsc2U7XG5cbiAgZXZlbnQuaW50ZXJjZXB0ID0gZnVuY3Rpb24gKFxuICAgIHRoaXM6IEludGVybmFsRmFrZU5hdmlnYXRlRXZlbnQsXG4gICAgb3B0aW9ucz86IEV4cGVyaW1lbnRhbE5hdmlnYXRpb25JbnRlcmNlcHRPcHRpb25zLFxuICApOiB2b2lkIHtcbiAgICBpbnRlcmNlcHRDYWxsZWQgPSB0cnVlO1xuICAgIGV2ZW50LnNhbWVEb2N1bWVudCA9IHRydWU7XG4gICAgY29uc3QgaGFuZGxlciA9IG9wdGlvbnM/LmhhbmRsZXI7XG4gICAgaWYgKGhhbmRsZXIpIHtcbiAgICAgIGhhbmRsZXJGaW5pc2hlZCA9IGhhbmRsZXIoKTtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnM/LmNvbW1pdCkge1xuICAgICAgZXZlbnQuY29tbWl0T3B0aW9uID0gb3B0aW9ucy5jb21taXQ7XG4gICAgfVxuICAgIGlmIChvcHRpb25zPy5mb2N1c1Jlc2V0ICE9PSB1bmRlZmluZWQgfHwgb3B0aW9ucz8uc2Nyb2xsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcigndW5pbXBsZW1lbnRlZCcpO1xuICAgIH1cbiAgfTtcblxuICBldmVudC5zY3JvbGwgPSBmdW5jdGlvbiAodGhpczogSW50ZXJuYWxGYWtlTmF2aWdhdGVFdmVudCk6IHZvaWQge1xuICAgIHRocm93IG5ldyBFcnJvcigndW5pbXBsZW1lbnRlZCcpO1xuICB9O1xuXG4gIGV2ZW50LmNvbW1pdCA9IGZ1bmN0aW9uICh0aGlzOiBJbnRlcm5hbEZha2VOYXZpZ2F0ZUV2ZW50LCBpbnRlcm5hbCA9IGZhbHNlKSB7XG4gICAgaWYgKCFpbnRlcm5hbCAmJiAhaW50ZXJjZXB0Q2FsbGVkKSB7XG4gICAgICB0aHJvdyBuZXcgRE9NRXhjZXB0aW9uKFxuICAgICAgICBgRmFpbGVkIHRvIGV4ZWN1dGUgJ2NvbW1pdCcgb24gJ05hdmlnYXRlRXZlbnQnOiBpbnRlcmNlcHQoKSBtdXN0IGJlIGAgK1xuICAgICAgICAgIGBjYWxsZWQgYmVmb3JlIGNvbW1pdCgpLmAsXG4gICAgICAgICdJbnZhbGlkU3RhdGVFcnJvcicsXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoIWRpc3BhdGNoZWROYXZpZ2F0ZUV2ZW50KSB7XG4gICAgICB0aHJvdyBuZXcgRE9NRXhjZXB0aW9uKFxuICAgICAgICBgRmFpbGVkIHRvIGV4ZWN1dGUgJ2NvbW1pdCcgb24gJ05hdmlnYXRlRXZlbnQnOiBjb21taXQoKSBtYXkgbm90IGJlIGAgK1xuICAgICAgICAgIGBjYWxsZWQgZHVyaW5nIGV2ZW50IGRpc3BhdGNoLmAsXG4gICAgICAgICdJbnZhbGlkU3RhdGVFcnJvcicsXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoY29tbWl0Q2FsbGVkKSB7XG4gICAgICB0aHJvdyBuZXcgRE9NRXhjZXB0aW9uKFxuICAgICAgICBgRmFpbGVkIHRvIGV4ZWN1dGUgJ2NvbW1pdCcgb24gJ05hdmlnYXRlRXZlbnQnOiBjb21taXQoKSBhbHJlYWR5IGAgKyBgY2FsbGVkLmAsXG4gICAgICAgICdJbnZhbGlkU3RhdGVFcnJvcicsXG4gICAgICApO1xuICAgIH1cbiAgICBjb21taXRDYWxsZWQgPSB0cnVlO1xuXG4gICAgdXNlckFnZW50Q29tbWl0KCk7XG4gIH07XG5cbiAgLy8gSW50ZXJuYWwgb25seS5cbiAgZXZlbnQuY2FuY2VsID0gZnVuY3Rpb24gKHRoaXM6IEludGVybmFsRmFrZU5hdmlnYXRlRXZlbnQsIHJlYXNvbjogRXJyb3IpIHtcbiAgICByZXN1bHQuY29tbWl0dGVkUmVqZWN0KHJlYXNvbik7XG4gICAgcmVzdWx0LmZpbmlzaGVkUmVqZWN0KHJlYXNvbik7XG4gIH07XG5cbiAgLy8gSW50ZXJuYWwgb25seS5cbiAgZXZlbnQuZGlzcGF0Y2hlZE5hdmlnYXRlRXZlbnQgPSBmdW5jdGlvbiAodGhpczogSW50ZXJuYWxGYWtlTmF2aWdhdGVFdmVudCkge1xuICAgIGRpc3BhdGNoZWROYXZpZ2F0ZUV2ZW50ID0gdHJ1ZTtcbiAgICBpZiAoZXZlbnQuY29tbWl0T3B0aW9uID09PSAnYWZ0ZXItdHJhbnNpdGlvbicpIHtcbiAgICAgIC8vIElmIGhhbmRsZXIgZmluaXNoZXMgYmVmb3JlIGNvbW1pdCwgY2FsbCBjb21taXQuXG4gICAgICBoYW5kbGVyRmluaXNoZWQ/LnRoZW4oXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICBpZiAoIWNvbW1pdENhbGxlZCkge1xuICAgICAgICAgICAgZXZlbnQuY29tbWl0KC8qIGludGVybmFsICovIHRydWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgKCkgPT4ge30sXG4gICAgICApO1xuICAgIH1cbiAgICBQcm9taXNlLmFsbChbcmVzdWx0LmNvbW1pdHRlZCwgaGFuZGxlckZpbmlzaGVkXSkudGhlbihcbiAgICAgIChbZW50cnldKSA9PiB7XG4gICAgICAgIHJlc3VsdC5maW5pc2hlZFJlc29sdmUoZW50cnkpO1xuICAgICAgfSxcbiAgICAgIChyZWFzb24pID0+IHtcbiAgICAgICAgcmVzdWx0LmZpbmlzaGVkUmVqZWN0KHJlYXNvbik7XG4gICAgICB9LFxuICAgICk7XG4gIH07XG5cbiAgLy8gSW50ZXJuYWwgb25seS5cbiAgZXZlbnQudXNlckFnZW50TmF2aWdhdGVkID0gZnVuY3Rpb24gKFxuICAgIHRoaXM6IEludGVybmFsRmFrZU5hdmlnYXRlRXZlbnQsXG4gICAgZW50cnk6IEZha2VOYXZpZ2F0aW9uSGlzdG9yeUVudHJ5LFxuICApIHtcbiAgICByZXN1bHQuY29tbWl0dGVkUmVzb2x2ZShlbnRyeSk7XG4gIH07XG5cbiAgcmV0dXJuIGV2ZW50IGFzIEludGVybmFsRmFrZU5hdmlnYXRlRXZlbnQ7XG59XG5cbi8qKiBGYWtlIGVxdWl2YWxlbnQgb2YgYE5hdmlnYXRpb25DdXJyZW50RW50cnlDaGFuZ2VFdmVudGAuICovXG5leHBvcnQgaW50ZXJmYWNlIEZha2VOYXZpZ2F0aW9uQ3VycmVudEVudHJ5Q2hhbmdlRXZlbnQgZXh0ZW5kcyBOYXZpZ2F0aW9uQ3VycmVudEVudHJ5Q2hhbmdlRXZlbnQge1xuICByZWFkb25seSBmcm9tOiBGYWtlTmF2aWdhdGlvbkhpc3RvcnlFbnRyeTtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBmYWtlIGVxdWl2YWxlbnQgb2YgYE5hdmlnYXRpb25DdXJyZW50RW50cnlDaGFuZ2VgLiBUaGlzIGRvZXMgbm90IHVzZVxuICogYSBjbGFzcyBiZWNhdXNlIEVTNSB0cmFuc3BpbGVkIEphdmFTY3JpcHQgY2Fubm90IGV4dGVuZCBuYXRpdmUgRXZlbnQuXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUZha2VOYXZpZ2F0aW9uQ3VycmVudEVudHJ5Q2hhbmdlRXZlbnQoe1xuICBmcm9tLFxuICBuYXZpZ2F0aW9uVHlwZSxcbn06IHtcbiAgZnJvbTogRmFrZU5hdmlnYXRpb25IaXN0b3J5RW50cnk7XG4gIG5hdmlnYXRpb25UeXBlOiBOYXZpZ2F0aW9uVHlwZVN0cmluZztcbn0pIHtcbiAgY29uc3QgZXZlbnQgPSBuZXcgRXZlbnQoJ2N1cnJlbnRlbnRyeWNoYW5nZScsIHtcbiAgICBidWJibGVzOiBmYWxzZSxcbiAgICBjYW5jZWxhYmxlOiBmYWxzZSxcbiAgfSkgYXMge1xuICAgIC1yZWFkb25seSBbUCBpbiBrZXlvZiBOYXZpZ2F0aW9uQ3VycmVudEVudHJ5Q2hhbmdlRXZlbnRdOiBOYXZpZ2F0aW9uQ3VycmVudEVudHJ5Q2hhbmdlRXZlbnRbUF07XG4gIH07XG4gIGV2ZW50LmZyb20gPSBmcm9tO1xuICBldmVudC5uYXZpZ2F0aW9uVHlwZSA9IG5hdmlnYXRpb25UeXBlO1xuICByZXR1cm4gZXZlbnQgYXMgRmFrZU5hdmlnYXRpb25DdXJyZW50RW50cnlDaGFuZ2VFdmVudDtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBmYWtlIGVxdWl2YWxlbnQgb2YgYFBvcFN0YXRlRXZlbnRgLiBUaGlzIGRvZXMgbm90IHVzZSBhIGNsYXNzXG4gKiBiZWNhdXNlIEVTNSB0cmFuc3BpbGVkIEphdmFTY3JpcHQgY2Fubm90IGV4dGVuZCBuYXRpdmUgRXZlbnQuXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVBvcFN0YXRlRXZlbnQoe3N0YXRlfToge3N0YXRlOiB1bmtub3dufSkge1xuICBjb25zdCBldmVudCA9IG5ldyBFdmVudCgncG9wc3RhdGUnLCB7XG4gICAgYnViYmxlczogZmFsc2UsXG4gICAgY2FuY2VsYWJsZTogZmFsc2UsXG4gIH0pIGFzIHstcmVhZG9ubHkgW1AgaW4ga2V5b2YgUG9wU3RhdGVFdmVudF06IFBvcFN0YXRlRXZlbnRbUF19O1xuICBldmVudC5zdGF0ZSA9IHN0YXRlO1xuICByZXR1cm4gZXZlbnQgYXMgUG9wU3RhdGVFdmVudDtcbn1cblxuLyoqXG4gKiBGYWtlIGVxdWl2YWxlbnQgb2YgYE5hdmlnYXRpb25EZXN0aW5hdGlvbmAuXG4gKi9cbmV4cG9ydCBjbGFzcyBGYWtlTmF2aWdhdGlvbkRlc3RpbmF0aW9uIGltcGxlbWVudHMgTmF2aWdhdGlvbkRlc3RpbmF0aW9uIHtcbiAgcmVhZG9ubHkgdXJsOiBzdHJpbmc7XG4gIHJlYWRvbmx5IHNhbWVEb2N1bWVudDogYm9vbGVhbjtcbiAgcmVhZG9ubHkga2V5OiBzdHJpbmcgfCBudWxsO1xuICByZWFkb25seSBpZDogc3RyaW5nIHwgbnVsbDtcbiAgcmVhZG9ubHkgaW5kZXg6IG51bWJlcjtcblxuICBwcml2YXRlIHJlYWRvbmx5IHN0YXRlPzogdW5rbm93bjtcbiAgcHJpdmF0ZSByZWFkb25seSBoaXN0b3J5U3RhdGU6IHVua25vd247XG5cbiAgY29uc3RydWN0b3Ioe1xuICAgIHVybCxcbiAgICBzYW1lRG9jdW1lbnQsXG4gICAgaGlzdG9yeVN0YXRlLFxuICAgIHN0YXRlLFxuICAgIGtleSA9IG51bGwsXG4gICAgaWQgPSBudWxsLFxuICAgIGluZGV4ID0gLTEsXG4gIH06IHtcbiAgICB1cmw6IHN0cmluZztcbiAgICBzYW1lRG9jdW1lbnQ6IGJvb2xlYW47XG4gICAgaGlzdG9yeVN0YXRlOiB1bmtub3duO1xuICAgIHN0YXRlPzogdW5rbm93bjtcbiAgICBrZXk/OiBzdHJpbmcgfCBudWxsO1xuICAgIGlkPzogc3RyaW5nIHwgbnVsbDtcbiAgICBpbmRleD86IG51bWJlcjtcbiAgfSkge1xuICAgIHRoaXMudXJsID0gdXJsO1xuICAgIHRoaXMuc2FtZURvY3VtZW50ID0gc2FtZURvY3VtZW50O1xuICAgIHRoaXMuc3RhdGUgPSBzdGF0ZTtcbiAgICB0aGlzLmhpc3RvcnlTdGF0ZSA9IGhpc3RvcnlTdGF0ZTtcbiAgICB0aGlzLmtleSA9IGtleTtcbiAgICB0aGlzLmlkID0gaWQ7XG4gICAgdGhpcy5pbmRleCA9IGluZGV4O1xuICB9XG5cbiAgZ2V0U3RhdGUoKTogdW5rbm93biB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGU7XG4gIH1cblxuICBnZXRIaXN0b3J5U3RhdGUoKTogdW5rbm93biB7XG4gICAgcmV0dXJuIHRoaXMuaGlzdG9yeVN0YXRlO1xuICB9XG59XG5cbi8qKiBVdGlsaXR5IGZ1bmN0aW9uIHRvIGRldGVybWluZSB3aGV0aGVyIHR3byBVcmxMaWtlIGhhdmUgdGhlIHNhbWUgaGFzaC4gKi9cbmZ1bmN0aW9uIGlzSGFzaENoYW5nZShmcm9tOiBVUkwsIHRvOiBVUkwpOiBib29sZWFuIHtcbiAgcmV0dXJuIChcbiAgICB0by5oYXNoICE9PSBmcm9tLmhhc2ggJiZcbiAgICB0by5ob3N0bmFtZSA9PT0gZnJvbS5ob3N0bmFtZSAmJlxuICAgIHRvLnBhdGhuYW1lID09PSBmcm9tLnBhdGhuYW1lICYmXG4gICAgdG8uc2VhcmNoID09PSBmcm9tLnNlYXJjaFxuICApO1xufVxuXG4vKiogSW50ZXJuYWwgdXRpbGl0eSBjbGFzcyBmb3IgcmVwcmVzZW50aW5nIHRoZSByZXN1bHQgb2YgYSBuYXZpZ2F0aW9uLiAgKi9cbmNsYXNzIEludGVybmFsTmF2aWdhdGlvblJlc3VsdCB7XG4gIGNvbW1pdHRlZFJlc29sdmUhOiAoZW50cnk6IEZha2VOYXZpZ2F0aW9uSGlzdG9yeUVudHJ5KSA9PiB2b2lkO1xuICBjb21taXR0ZWRSZWplY3QhOiAocmVhc29uOiBFcnJvcikgPT4gdm9pZDtcbiAgZmluaXNoZWRSZXNvbHZlITogKGVudHJ5OiBGYWtlTmF2aWdhdGlvbkhpc3RvcnlFbnRyeSkgPT4gdm9pZDtcbiAgZmluaXNoZWRSZWplY3QhOiAocmVhc29uOiBFcnJvcikgPT4gdm9pZDtcbiAgcmVhZG9ubHkgY29tbWl0dGVkOiBQcm9taXNlPEZha2VOYXZpZ2F0aW9uSGlzdG9yeUVudHJ5PjtcbiAgcmVhZG9ubHkgZmluaXNoZWQ6IFByb21pc2U8RmFrZU5hdmlnYXRpb25IaXN0b3J5RW50cnk+O1xuICBnZXQgc2lnbmFsKCk6IEFib3J0U2lnbmFsIHtcbiAgICByZXR1cm4gdGhpcy5hYm9ydENvbnRyb2xsZXIuc2lnbmFsO1xuICB9XG4gIHByaXZhdGUgcmVhZG9ubHkgYWJvcnRDb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuY29tbWl0dGVkID0gbmV3IFByb21pc2U8RmFrZU5hdmlnYXRpb25IaXN0b3J5RW50cnk+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMuY29tbWl0dGVkUmVzb2x2ZSA9IHJlc29sdmU7XG4gICAgICB0aGlzLmNvbW1pdHRlZFJlamVjdCA9IHJlamVjdDtcbiAgICB9KTtcblxuICAgIHRoaXMuZmluaXNoZWQgPSBuZXcgUHJvbWlzZTxGYWtlTmF2aWdhdGlvbkhpc3RvcnlFbnRyeT4oYXN5bmMgKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5maW5pc2hlZFJlc29sdmUgPSByZXNvbHZlO1xuICAgICAgdGhpcy5maW5pc2hlZFJlamVjdCA9IChyZWFzb246IEVycm9yKSA9PiB7XG4gICAgICAgIHJlamVjdChyZWFzb24pO1xuICAgICAgICB0aGlzLmFib3J0Q29udHJvbGxlci5hYm9ydChyZWFzb24pO1xuICAgICAgfTtcbiAgICB9KTtcbiAgICAvLyBBbGwgcmVqZWN0aW9ucyBhcmUgaGFuZGxlZC5cbiAgICB0aGlzLmNvbW1pdHRlZC5jYXRjaCgoKSA9PiB7fSk7XG4gICAgdGhpcy5maW5pc2hlZC5jYXRjaCgoKSA9PiB7fSk7XG4gIH1cbn1cblxuLyoqIEludGVybmFsIG9wdGlvbnMgZm9yIHBlcmZvcm1pbmcgYSBuYXZpZ2F0ZS4gKi9cbmludGVyZmFjZSBJbnRlcm5hbE5hdmlnYXRlT3B0aW9ucyB7XG4gIG5hdmlnYXRpb25UeXBlOiBOYXZpZ2F0aW9uVHlwZVN0cmluZztcbiAgY2FuY2VsYWJsZTogYm9vbGVhbjtcbiAgY2FuSW50ZXJjZXB0OiBib29sZWFuO1xuICB1c2VySW5pdGlhdGVkOiBib29sZWFuO1xuICBoYXNoQ2hhbmdlOiBib29sZWFuO1xuICBpbmZvPzogdW5rbm93bjtcbiAgc2tpcFBvcFN0YXRlPzogYm9vbGVhbjtcbn1cbiJdfQ==