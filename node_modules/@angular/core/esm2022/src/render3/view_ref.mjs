/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { RuntimeError } from '../errors';
import { removeFromArray } from '../util/array_utils';
import { assertEqual } from '../util/assert';
import { collectNativeNodes } from './collect_native_nodes';
import { checkNoChangesInternal, detectChangesInternal } from './instructions/change_detection';
import { markViewDirty } from './instructions/mark_view_dirty';
import { CONTAINER_HEADER_OFFSET, VIEW_REFS } from './interfaces/container';
import { isLContainer, isRootView } from './interfaces/type_checks';
import { CONTEXT, DECLARATION_LCONTAINER, FLAGS, PARENT, TVIEW, } from './interfaces/view';
import { destroyLView, detachMovedView, detachView, detachViewFromDOM, trackMovedView, } from './node_manipulation';
import { CheckNoChangesMode } from './state';
import { storeLViewOnDestroy, updateAncestorTraversalFlagsOnAttach } from './util/view_utils';
export class ViewRef {
    get rootNodes() {
        const lView = this._lView;
        const tView = lView[TVIEW];
        return collectNativeNodes(tView, lView, tView.firstChild, []);
    }
    constructor(
    /**
     * This represents `LView` associated with the component when ViewRef is a ChangeDetectorRef.
     *
     * When ViewRef is created for a dynamic component, this also represents the `LView` for the
     * component.
     *
     * For a "regular" ViewRef created for an embedded view, this is the `LView` for the embedded
     * view.
     *
     * @internal
     */
    _lView, 
    /**
     * This represents the `LView` associated with the point where `ChangeDetectorRef` was
     * requested.
     *
     * This may be different from `_lView` if the `_cdRefInjectingView` is an embedded view.
     */
    _cdRefInjectingView, notifyErrorHandler = true) {
        this._lView = _lView;
        this._cdRefInjectingView = _cdRefInjectingView;
        this.notifyErrorHandler = notifyErrorHandler;
        this._appRef = null;
        this._attachedToViewContainer = false;
    }
    get context() {
        return this._lView[CONTEXT];
    }
    /**
     * @deprecated Replacing the full context object is not supported. Modify the context
     *   directly, or consider using a `Proxy` if you need to replace the full object.
     * // TODO(devversion): Remove this.
     */
    set context(value) {
        if (ngDevMode) {
            // Note: We have a warning message here because the `@deprecated` JSDoc will not be picked
            // up for assignments on the setter. We want to let users know about the deprecated usage.
            console.warn('Angular: Replacing the `context` object of an `EmbeddedViewRef` is deprecated.');
        }
        this._lView[CONTEXT] = value;
    }
    get destroyed() {
        return (this._lView[FLAGS] & 256 /* LViewFlags.Destroyed */) === 256 /* LViewFlags.Destroyed */;
    }
    destroy() {
        if (this._appRef) {
            this._appRef.detachView(this);
        }
        else if (this._attachedToViewContainer) {
            const parent = this._lView[PARENT];
            if (isLContainer(parent)) {
                const viewRefs = parent[VIEW_REFS];
                const index = viewRefs ? viewRefs.indexOf(this) : -1;
                if (index > -1) {
                    ngDevMode &&
                        assertEqual(index, parent.indexOf(this._lView) - CONTAINER_HEADER_OFFSET, 'An attached view should be in the same position within its container as its ViewRef in the VIEW_REFS array.');
                    detachView(parent, index);
                    removeFromArray(viewRefs, index);
                }
            }
            this._attachedToViewContainer = false;
        }
        destroyLView(this._lView[TVIEW], this._lView);
    }
    onDestroy(callback) {
        storeLViewOnDestroy(this._lView, callback);
    }
    /**
     * Marks a view and all of its ancestors dirty.
     *
     * This can be used to ensure an {@link ChangeDetectionStrategy#OnPush} component is
     * checked when it needs to be re-rendered but the two normal triggers haven't marked it
     * dirty (i.e. inputs haven't changed and events haven't fired in the view).
     *
     * <!-- TODO: Add a link to a chapter on OnPush components -->
     *
     * @usageNotes
     * ### Example
     *
     * ```typescript
     * @Component({
     *   selector: 'app-root',
     *   template: `Number of ticks: {{numberOfTicks}}`
     *   changeDetection: ChangeDetectionStrategy.OnPush,
     * })
     * class AppComponent {
     *   numberOfTicks = 0;
     *
     *   constructor(private ref: ChangeDetectorRef) {
     *     setInterval(() => {
     *       this.numberOfTicks++;
     *       // the following is required, otherwise the view will not be updated
     *       this.ref.markForCheck();
     *     }, 1000);
     *   }
     * }
     * ```
     */
    markForCheck() {
        markViewDirty(this._cdRefInjectingView || this._lView, 4 /* NotificationSource.MarkForCheck */);
    }
    /**
     * Detaches the view from the change detection tree.
     *
     * Detached views will not be checked during change detection runs until they are
     * re-attached, even if they are dirty. `detach` can be used in combination with
     * {@link ChangeDetectorRef#detectChanges} to implement local change
     * detection checks.
     *
     * <!-- TODO: Add a link to a chapter on detach/reattach/local digest -->
     * <!-- TODO: Add a live demo once ref.detectChanges is merged into master -->
     *
     * @usageNotes
     * ### Example
     *
     * The following example defines a component with a large list of readonly data.
     * Imagine the data changes constantly, many times per second. For performance reasons,
     * we want to check and update the list every five seconds. We can do that by detaching
     * the component's change detector and doing a local check every five seconds.
     *
     * ```typescript
     * class DataProvider {
     *   // in a real application the returned data will be different every time
     *   get data() {
     *     return [1,2,3,4,5];
     *   }
     * }
     *
     * @Component({
     *   selector: 'giant-list',
     *   template: `
     *     <li *ngFor="let d of dataProvider.data">Data {{d}}</li>
     *   `,
     * })
     * class GiantList {
     *   constructor(private ref: ChangeDetectorRef, private dataProvider: DataProvider) {
     *     ref.detach();
     *     setInterval(() => {
     *       this.ref.detectChanges();
     *     }, 5000);
     *   }
     * }
     *
     * @Component({
     *   selector: 'app',
     *   providers: [DataProvider],
     *   template: `
     *     <giant-list><giant-list>
     *   `,
     * })
     * class App {
     * }
     * ```
     */
    detach() {
        this._lView[FLAGS] &= ~128 /* LViewFlags.Attached */;
    }
    /**
     * Re-attaches a view to the change detection tree.
     *
     * This can be used to re-attach views that were previously detached from the tree
     * using {@link ChangeDetectorRef#detach}. Views are attached to the tree by default.
     *
     * <!-- TODO: Add a link to a chapter on detach/reattach/local digest -->
     *
     * @usageNotes
     * ### Example
     *
     * The following example creates a component displaying `live` data. The component will detach
     * its change detector from the main change detector tree when the component's live property
     * is set to false.
     *
     * ```typescript
     * class DataProvider {
     *   data = 1;
     *
     *   constructor() {
     *     setInterval(() => {
     *       this.data = this.data * 2;
     *     }, 500);
     *   }
     * }
     *
     * @Component({
     *   selector: 'live-data',
     *   inputs: ['live'],
     *   template: 'Data: {{dataProvider.data}}'
     * })
     * class LiveData {
     *   constructor(private ref: ChangeDetectorRef, private dataProvider: DataProvider) {}
     *
     *   set live(value) {
     *     if (value) {
     *       this.ref.reattach();
     *     } else {
     *       this.ref.detach();
     *     }
     *   }
     * }
     *
     * @Component({
     *   selector: 'app-root',
     *   providers: [DataProvider],
     *   template: `
     *     Live Update: <input type="checkbox" [(ngModel)]="live">
     *     <live-data [live]="live"><live-data>
     *   `,
     * })
     * class AppComponent {
     *   live = true;
     * }
     * ```
     */
    reattach() {
        updateAncestorTraversalFlagsOnAttach(this._lView);
        this._lView[FLAGS] |= 128 /* LViewFlags.Attached */;
    }
    /**
     * Checks the view and its children.
     *
     * This can also be used in combination with {@link ChangeDetectorRef#detach} to implement
     * local change detection checks.
     *
     * <!-- TODO: Add a link to a chapter on detach/reattach/local digest -->
     * <!-- TODO: Add a live demo once ref.detectChanges is merged into master -->
     *
     * @usageNotes
     * ### Example
     *
     * The following example defines a component with a large list of readonly data.
     * Imagine, the data changes constantly, many times per second. For performance reasons,
     * we want to check and update the list every five seconds.
     *
     * We can do that by detaching the component's change detector and doing a local change detection
     * check every five seconds.
     *
     * See {@link ChangeDetectorRef#detach} for more information.
     */
    detectChanges() {
        // Add `RefreshView` flag to ensure this view is refreshed if not already dirty.
        // `RefreshView` flag is used intentionally over `Dirty` because it gets cleared before
        // executing any of the actual refresh code while the `Dirty` flag doesn't get cleared
        // until the end of the refresh. Using `RefreshView` prevents creating a potential difference
        // in the state of the LViewFlags during template execution.
        this._lView[FLAGS] |= 1024 /* LViewFlags.RefreshView */;
        detectChangesInternal(this._lView, this.notifyErrorHandler);
    }
    /**
     * Checks the change detector and its children, and throws if any changes are detected.
     *
     * This is used in development mode to verify that running change detection doesn't
     * introduce other changes.
     */
    checkNoChanges() {
        if (ngDevMode) {
            checkNoChangesInternal(this._lView, CheckNoChangesMode.OnlyDirtyViews, this.notifyErrorHandler);
        }
    }
    attachToViewContainerRef() {
        if (this._appRef) {
            throw new RuntimeError(902 /* RuntimeErrorCode.VIEW_ALREADY_ATTACHED */, ngDevMode && 'This view is already attached directly to the ApplicationRef!');
        }
        this._attachedToViewContainer = true;
    }
    detachFromAppRef() {
        this._appRef = null;
        const isRoot = isRootView(this._lView);
        const declarationContainer = this._lView[DECLARATION_LCONTAINER];
        if (declarationContainer !== null && !isRoot) {
            detachMovedView(declarationContainer, this._lView);
        }
        detachViewFromDOM(this._lView[TVIEW], this._lView);
    }
    attachToAppRef(appRef) {
        if (this._attachedToViewContainer) {
            throw new RuntimeError(902 /* RuntimeErrorCode.VIEW_ALREADY_ATTACHED */, ngDevMode && 'This view is already attached to a ViewContainer!');
        }
        this._appRef = appRef;
        const isRoot = isRootView(this._lView);
        const declarationContainer = this._lView[DECLARATION_LCONTAINER];
        if (declarationContainer !== null && !isRoot) {
            trackMovedView(declarationContainer, this._lView);
        }
        updateAncestorTraversalFlagsOnAttach(this._lView);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld19yZWYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9yZW5kZXIzL3ZpZXdfcmVmLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUlILE9BQU8sRUFBQyxZQUFZLEVBQW1CLE1BQU0sV0FBVyxDQUFDO0FBRXpELE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNwRCxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFFM0MsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFDMUQsT0FBTyxFQUFDLHNCQUFzQixFQUFFLHFCQUFxQixFQUFDLE1BQU0saUNBQWlDLENBQUM7QUFDOUYsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLGdDQUFnQyxDQUFDO0FBQzdELE9BQU8sRUFBQyx1QkFBdUIsRUFBRSxTQUFTLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUMxRSxPQUFPLEVBQUMsWUFBWSxFQUFFLFVBQVUsRUFBQyxNQUFNLDBCQUEwQixDQUFDO0FBQ2xFLE9BQU8sRUFDTCxPQUFPLEVBQ1Asc0JBQXNCLEVBQ3RCLEtBQUssRUFHTCxNQUFNLEVBQ04sS0FBSyxHQUNOLE1BQU0sbUJBQW1CLENBQUM7QUFDM0IsT0FBTyxFQUNMLFlBQVksRUFDWixlQUFlLEVBQ2YsVUFBVSxFQUNWLGlCQUFpQixFQUNqQixjQUFjLEdBQ2YsTUFBTSxxQkFBcUIsQ0FBQztBQUM3QixPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFDM0MsT0FBTyxFQUFDLG1CQUFtQixFQUFFLG9DQUFvQyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFPNUYsTUFBTSxPQUFPLE9BQU87SUFJbEIsSUFBSSxTQUFTO1FBQ1gsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUMxQixNQUFN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b0JBQW9CLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1FBQ2pFLElBQUksb0JBQW9CLEtBQUssSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDN0MsZUFBZSxDQUFDLG9CQUFvQixFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNyRCxDQUFDO1FBQ0QsaUJBQWlCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDckQsQ0FBQztJQUVELGNBQWMsQ0FBQyxNQUFzQjtRQUNuQyxJQUFJLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO1lBQ2xDLE1BQU0sSUFBSSxZQUFZLG1EQUVwQixTQUFTLElBQUksbURBQW1ELENBQ2pFLENBQUM7UUFDSixDQUFDO1FBQ0QsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7UUFDdEIsTUFBTSxNQUFNLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN2QyxNQUFNLG9CQUFvQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsc0JBQXNCLENBQUMsQ0FBQztRQUNqRSxJQUFJLG9CQUFvQixLQUFLLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQzdDLGNBQWMsQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDcEQsQ0FBQztRQUNELG9DQUFvQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNwRCxDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q2hhbmdlRGV0ZWN0b3JSZWZ9IGZyb20gJy4uL2NoYW5nZV9kZXRlY3Rpb24vY2hhbmdlX2RldGVjdG9yX3JlZic7XG5pbXBvcnQge05vdGlmaWNhdGlvblNvdXJjZX0gZnJvbSAnLi4vY2hhbmdlX2RldGVjdGlvbi9zY2hlZHVsaW5nL3pvbmVsZXNzX3NjaGVkdWxpbmcnO1xuaW1wb3J0IHtSdW50aW1lRXJyb3IsIFJ1bnRpbWVFcnJvckNvZGV9IGZyb20gJy4uL2Vycm9ycyc7XG5pbXBvcnQge0VtYmVkZGVkVmlld1JlZiwgVmlld1JlZlRyYWNrZXJ9IGZyb20gJy4uL2xpbmtlci92aWV3X3JlZic7XG5pbXBvcnQge3JlbW92ZUZyb21BcnJheX0gZnJvbSAnLi4vdXRpbC9hcnJheV91dGlscyc7XG5pbXBvcnQge2Fzc2VydEVxdWFsfSBmcm9tICcuLi91dGlsL2Fzc2VydCc7XG5cbmltcG9ydCB7Y29sbGVjdE5hdGl2ZU5vZGVzfSBmcm9tICcuL2NvbGxlY3RfbmF0aXZlX25vZGVzJztcbmltcG9ydCB7Y2hlY2tOb0NoYW5nZXNJbnRlcm5hbCwgZGV0ZWN0Q2hhbmdlc0ludGVybmFsfSBmcm9tICcuL2luc3RydWN0aW9ucy9jaGFuZ2VfZGV0ZWN0aW9uJztcbmltcG9ydCB7bWFya1ZpZXdEaXJ0eX0gZnJvbSAnLi9pbnN0cnVjdGlvbnMvbWFya192aWV3X2RpcnR5JztcbmltcG9ydCB7Q09OVEFJTkVSX0hFQURFUl9PRkZTRVQsIFZJRVdfUkVGU30gZnJvbSAnLi9pbnRlcmZhY2VzL2NvbnRhaW5lcic7XG5pbXBvcnQge2lzTENvbnRhaW5lciwgaXNSb290Vmlld30gZnJvbSAnLi9pbnRlcmZhY2VzL3R5cGVfY2hlY2tzJztcbmltcG9ydCB7XG4gIENPTlRFWFQsXG4gIERFQ0xBUkFUSU9OX0xDT05UQUlORVIsXG4gIEZMQUdTLFxuICBMVmlldyxcbiAgTFZpZXdGbGFncyxcbiAgUEFSRU5ULFxuICBUVklFVyxcbn0gZnJvbSAnLi9pbnRlcmZhY2VzL3ZpZXcnO1xuaW1wb3J0IHtcbiAgZGVzdHJveUxWaWV3LFxuICBkZXRhY2hNb3ZlZFZpZXcsXG4gIGRldGFjaFZpZXcsXG4gIGRldGFjaFZpZXdGcm9tRE9NLFxuICB0cmFja01vdmVkVmlldyxcbn0gZnJvbSAnLi9ub2RlX21hbmlwdWxhdGlvbic7XG5pbXBvcnQge0NoZWNrTm9DaGFuZ2VzTW9kZX0gZnJvbSAnLi9zdGF0ZSc7XG5pbXBvcnQge3N0b3JlTFZpZXdPbkRlc3Ryb3ksIHVwZGF0ZUFuY2VzdG9yVHJhdmVyc2FsRmxhZ3NPbkF0dGFjaH0gZnJvbSAnLi91dGlsL3ZpZXdfdXRpbHMnO1xuXG4vLyBOZWVkZWQgZHVlIHRvIHRzaWNrbGUgZG93bmxldmVsaW5nIHdoZXJlIG11bHRpcGxlIGBpbXBsZW1lbnRzYCB3aXRoIGNsYXNzZXMgY3JlYXRlc1xuLy8gbXVsdGlwbGUgQGV4dGVuZHMgaW4gQ2xvc3VyZSBhbm5vdGF0aW9ucywgd2hpY2ggaXMgaWxsZWdhbC4gVGhpcyB3b3JrYXJvdW5kIGZpeGVzXG4vLyB0aGUgbXVsdGlwbGUgQGV4dGVuZHMgYnkgbWFraW5nIHRoZSBhbm5vdGF0aW9uIEBpbXBsZW1lbnRzIGluc3RlYWRcbmludGVyZmFjZSBDaGFuZ2VEZXRlY3RvclJlZkludGVyZmFjZSBleHRlbmRzIENoYW5nZURldGVjdG9yUmVmIHt9XG5cbmV4cG9ydCBjbGFzcyBWaWV3UmVmPFQ+IGltcGxlbWVudHMgRW1iZWRkZWRWaWV3UmVmPFQ+LCBDaGFuZ2VEZXRlY3RvclJlZkludGVyZmFjZSB7XG4gIHByaXZhdGUgX2FwcFJlZjogVmlld1JlZlRyYWNrZXIgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBfYXR0YWNoZWRUb1ZpZXdDb250YWluZXIgPSBmYWxzZTtcblxuICBnZXQgcm9vdE5vZGVzKCk6IGFueVtdIHtcbiAgICBjb25zdCBsVmlldyA9IHRoaXMuX2xWaWV3O1xuICAgIGNvbnN0IHRWaWV3ID0gbFZpZXdbVFZJRVddO1xuICAgIHJldHVybiBjb2xsZWN0TmF0aXZlTm9kZXModFZpZXcsIGxWaWV3LCB0Vmlldy5maXJzdENoaWxkLCBbXSk7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihcbiAgICAvKipcbiAgICAgKiBUaGlzIHJlcHJlc2VudHMgYExWaWV3YCBhc3NvY2lhdGVkIHdpdGggdGhlIGNvbXBvbmVudCB3aGVuIFZpZXdSZWYgaXMgYSBDaGFuZ2VEZXRlY3RvclJlZi5cbiAgICAgKlxuICAgICAqIFdoZW4gVmlld1JlZiBpcyBjcmVhdGVkIGZvciBhIGR5bmFtaWMgY29tcG9uZW50LCB0aGlzIGFsc28gcmVwcmVzZW50cyB0aGUgYExWaWV3YCBmb3IgdGhlXG4gICAgICogY29tcG9uZW50LlxuICAgICAqXG4gICAgICogRm9yIGEgXCJyZWd1bGFyXCIgVmlld1JlZiBjcmVhdGVkIGZvciBhbiBlbWJlZGRlZCB2aWV3LCB0aGlzIGlzIHRoZSBgTFZpZXdgIGZvciB0aGUgZW1iZWRkZWRcbiAgICAgKiB2aWV3LlxuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICovXG4gICAgcHVibGljIF9sVmlldzogTFZpZXcsXG5cbiAgICAvKipcbiAgICAgKiBUaGlzIHJlcHJlc2VudHMgdGhlIGBMVmlld2AgYXNzb2NpYXRlZCB3aXRoIHRoZSBwb2ludCB3aGVyZSBgQ2hhbmdlRGV0ZWN0b3JSZWZgIHdhc1xuICAgICAqIHJlcXVlc3RlZC5cbiAgICAgKlxuICAgICAqIFRoaXMgbWF5IGJlIGRpZmZlcmVudCBmcm9tIGBfbFZpZXdgIGlmIHRoZSBgX2NkUmVmSW5qZWN0aW5nVmlld2AgaXMgYW4gZW1iZWRkZWQgdmlldy5cbiAgICAgKi9cbiAgICBwcml2YXRlIF9jZFJlZkluamVjdGluZ1ZpZXc/OiBMVmlldyxcbiAgICByZWFkb25seSBub3RpZnlFcnJvckhhbmRsZXIgPSB0cnVlLFxuICApIHt9XG5cbiAgZ2V0IGNvbnRleHQoKTogVCB7XG4gICAgcmV0dXJuIHRoaXMuX2xWaWV3W0NPTlRFWFRdIGFzIHVua25vd24gYXMgVDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVwcmVjYXRlZCBSZXBsYWNpbmcgdGhlIGZ1bGwgY29udGV4dCBvYmplY3QgaXMgbm90IHN1cHBvcnRlZC4gTW9kaWZ5IHRoZSBjb250ZXh0XG4gICAqICAgZGlyZWN0bHksIG9yIGNvbnNpZGVyIHVzaW5nIGEgYFByb3h5YCBpZiB5b3UgbmVlZCB0byByZXBsYWNlIHRoZSBmdWxsIG9iamVjdC5cbiAgICogLy8gVE9ETyhkZXZ2ZXJzaW9uKTogUmVtb3ZlIHRoaXMuXG4gICAqL1xuICBzZXQgY29udGV4dCh2YWx1ZTogVCkge1xuICAgIGlmIChuZ0Rldk1vZGUpIHtcbiAgICAgIC8vIE5vdGU6IFdlIGhhdmUgYSB3YXJuaW5nIG1lc3NhZ2UgaGVyZSBiZWNhdXNlIHRoZSBgQGRlcHJlY2F0ZWRgIEpTRG9jIHdpbGwgbm90IGJlIHBpY2tlZFxuICAgICAgLy8gdXAgZm9yIGFzc2lnbm1lbnRzIG9uIHRoZSBzZXR0ZXIuIFdlIHdhbnQgdG8gbGV0IHVzZXJzIGtub3cgYWJvdXQgdGhlIGRlcHJlY2F0ZWQgdXNhZ2UuXG4gICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICdBbmd1bGFyOiBSZXBsYWNpbmcgdGhlIGBjb250ZXh0YCBvYmplY3Qgb2YgYW4gYEVtYmVkZGVkVmlld1JlZmAgaXMgZGVwcmVjYXRlZC4nLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICB0aGlzLl9sVmlld1tDT05URVhUXSA9IHZhbHVlIGFzIHVua25vd24gYXMge307XG4gIH1cblxuICBnZXQgZGVzdHJveWVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAodGhpcy5fbFZpZXdbRkxBR1NdICYgTFZpZXdGbGFncy5EZXN0cm95ZWQpID09PSBMVmlld0ZsYWdzLkRlc3Ryb3llZDtcbiAgfVxuXG4gIGRlc3Ryb3koKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2FwcFJlZikge1xuICAgICAgdGhpcy5fYXBwUmVmLmRldGFjaFZpZXcodGhpcyk7XG4gICAgfSBlbHNlIGlmICh0aGlzLl9hdHRhY2hlZFRvVmlld0NvbnRhaW5lcikge1xuICAgICAgY29uc3QgcGFyZW50ID0gdGhpcy5fbFZpZXdbUEFSRU5UXTtcbiAgICAgIGlmIChpc0xDb250YWluZXIocGFyZW50KSkge1xuICAgICAgICBjb25zdCB2aWV3UmVmcyA9IHBhcmVudFtWSUVXX1JFRlNdIGFzIFZpZXdSZWY8dW5rbm93bj5bXSB8IG51bGw7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gdmlld1JlZnMgPyB2aWV3UmVmcy5pbmRleE9mKHRoaXMpIDogLTE7XG4gICAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgICAgbmdEZXZNb2RlICYmXG4gICAgICAgICAgICBhc3NlcnRFcXVhbChcbiAgICAgICAgICAgICAgaW5kZXgsXG4gICAgICAgICAgICAgIHBhcmVudC5pbmRleE9mKHRoaXMuX2xWaWV3KSAtIENPTlRBSU5FUl9IRUFERVJfT0ZGU0VULFxuICAgICAgICAgICAgICAnQW4gYXR0YWNoZWQgdmlldyBzaG91bGQgYmUgaW4gdGhlIHNhbWUgcG9zaXRpb24gd2l0aGluIGl0cyBjb250YWluZXIgYXMgaXRzIFZpZXdSZWYgaW4gdGhlIFZJRVdfUkVGUyBhcnJheS4nLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICBkZXRhY2hWaWV3KHBhcmVudCwgaW5kZXgpO1xuICAgICAgICAgIHJlbW92ZUZyb21BcnJheSh2aWV3UmVmcyEsIGluZGV4KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5fYXR0YWNoZWRUb1ZpZXdDb250YWluZXIgPSBmYWxzZTtcbiAgICB9XG4gICAgZGVzdHJveUxWaWV3KHRoaXMuX2xWaWV3W1RWSUVXXSwgdGhpcy5fbFZpZXcpO1xuICB9XG5cbiAgb25EZXN0cm95KGNhbGxiYWNrOiBGdW5jdGlvbikge1xuICAgIHN0b3JlTFZpZXdPbkRlc3Ryb3kodGhpcy5fbFZpZXcsIGNhbGxiYWNrIGFzICgpID0+IHZvaWQpO1xuICB9XG5cbiAgLyoqXG4gICAqIE1hcmtzIGEgdmlldyBhbmQgYWxsIG9mIGl0cyBhbmNlc3RvcnMgZGlydHkuXG4gICAqXG4gICAqIFRoaXMgY2FuIGJlIHVzZWQgdG8gZW5zdXJlIGFuIHtAbGluayBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSNPblB1c2h9IGNvbXBvbmVudCBpc1xuICAgKiBjaGVja2VkIHdoZW4gaXQgbmVlZHMgdG8gYmUgcmUtcmVuZGVyZWQgYnV0IHRoZSB0d28gbm9ybWFsIHRyaWdnZXJzIGhhdmVuJ3QgbWFya2VkIGl0XG4gICAqIGRpcnR5IChpLmUuIGlucHV0cyBoYXZlbid0IGNoYW5nZWQgYW5kIGV2ZW50cyBoYXZlbid0IGZpcmVkIGluIHRoZSB2aWV3KS5cbiAgICpcbiAgICogPCEtLSBUT0RPOiBBZGQgYSBsaW5rIHRvIGEgY2hhcHRlciBvbiBPblB1c2ggY29tcG9uZW50cyAtLT5cbiAgICpcbiAgICogQHVzYWdlTm90ZXNcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiBAQ29tcG9uZW50KHtcbiAgICogICBzZWxlY3RvcjogJ2FwcC1yb290JyxcbiAgICogICB0ZW1wbGF0ZTogYE51bWJlciBvZiB0aWNrczoge3tudW1iZXJPZlRpY2tzfX1gXG4gICAqICAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG4gICAqIH0pXG4gICAqIGNsYXNzIEFwcENvbXBvbmVudCB7XG4gICAqICAgbnVtYmVyT2ZUaWNrcyA9IDA7XG4gICAqXG4gICAqICAgY29uc3RydWN0b3IocHJpdmF0ZSByZWY6IENoYW5nZURldGVjdG9yUmVmKSB7XG4gICAqICAgICBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAqICAgICAgIHRoaXMubnVtYmVyT2ZUaWNrcysrO1xuICAgKiAgICAgICAvLyB0aGUgZm9sbG93aW5nIGlzIHJlcXVpcmVkLCBvdGhlcndpc2UgdGhlIHZpZXcgd2lsbCBub3QgYmUgdXBkYXRlZFxuICAgKiAgICAgICB0aGlzLnJlZi5tYXJrRm9yQ2hlY2soKTtcbiAgICogICAgIH0sIDEwMDApO1xuICAgKiAgIH1cbiAgICogfVxuICAgKiBgYGBcbiAgICovXG4gIG1hcmtGb3JDaGVjaygpOiB2b2lkIHtcbiAgICBtYXJrVmlld0RpcnR5KHRoaXMuX2NkUmVmSW5qZWN0aW5nVmlldyB8fCB0aGlzLl9sVmlldywgTm90aWZpY2F0aW9uU291cmNlLk1hcmtGb3JDaGVjayk7XG4gIH1cblxuICAvKipcbiAgICogRGV0YWNoZXMgdGhlIHZpZXcgZnJvbSB0aGUgY2hhbmdlIGRldGVjdGlvbiB0cmVlLlxuICAgKlxuICAgKiBEZXRhY2hlZCB2aWV3cyB3aWxsIG5vdCBiZSBjaGVja2VkIGR1cmluZyBjaGFuZ2UgZGV0ZWN0aW9uIHJ1bnMgdW50aWwgdGhleSBhcmVcbiAgICogcmUtYXR0YWNoZWQsIGV2ZW4gaWYgdGhleSBhcmUgZGlydHkuIGBkZXRhY2hgIGNhbiBiZSB1c2VkIGluIGNvbWJpbmF0aW9uIHdpdGhcbiAgICoge0BsaW5rIENoYW5nZURldGVjdG9yUmVmI2RldGVjdENoYW5nZXN9IHRvIGltcGxlbWVudCBsb2NhbCBjaGFuZ2VcbiAgICogZGV0ZWN0aW9uIGNoZWNrcy5cbiAgICpcbiAgICogPCEtLSBUT0RPOiBBZGQgYSBsaW5rIHRvIGEgY2hhcHRlciBvbiBkZXRhY2gvcmVhdHRhY2gvbG9jYWwgZGlnZXN0IC0tPlxuICAgKiA8IS0tIFRPRE86IEFkZCBhIGxpdmUgZGVtbyBvbmNlIHJlZi5kZXRlY3RDaGFuZ2VzIGlzIG1lcmdlZCBpbnRvIG1hc3RlciAtLT5cbiAgICpcbiAgICogQHVzYWdlTm90ZXNcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICogVGhlIGZvbGxvd2luZyBleGFtcGxlIGRlZmluZXMgYSBjb21wb25lbnQgd2l0aCBhIGxhcmdlIGxpc3Qgb2YgcmVhZG9ubHkgZGF0YS5cbiAgICogSW1hZ2luZSB0aGUgZGF0YSBjaGFuZ2VzIGNvbnN0YW50bHksIG1hbnkgdGltZXMgcGVyIHNlY29uZC4gRm9yIHBlcmZvcm1hbmNlIHJlYXNvbnMsXG4gICAqIHdlIHdhbnQgdG8gY2hlY2sgYW5kIHVwZGF0ZSB0aGUgbGlzdCBldmVyeSBmaXZlIHNlY29uZHMuIFdlIGNhbiBkbyB0aGF0IGJ5IGRldGFjaGluZ1xuICAgKiB0aGUgY29tcG9uZW50J3MgY2hhbmdlIGRldGVjdG9yIGFuZCBkb2luZyBhIGxvY2FsIGNoZWNrIGV2ZXJ5IGZpdmUgc2Vjb25kcy5cbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiBjbGFzcyBEYXRhUHJvdmlkZXIge1xuICAgKiAgIC8vIGluIGEgcmVhbCBhcHBsaWNhdGlvbiB0aGUgcmV0dXJuZWQgZGF0YSB3aWxsIGJlIGRpZmZlcmVudCBldmVyeSB0aW1lXG4gICAqICAgZ2V0IGRhdGEoKSB7XG4gICAqICAgICByZXR1cm4gWzEsMiwzLDQsNV07XG4gICAqICAgfVxuICAgKiB9XG4gICAqXG4gICAqIEBDb21wb25lbnQoe1xuICAgKiAgIHNlbGVjdG9yOiAnZ2lhbnQtbGlzdCcsXG4gICAqICAgdGVtcGxhdGU6IGBcbiAgICogICAgIDxsaSAqbmdGb3I9XCJsZXQgZCBvZiBkYXRhUHJvdmlkZXIuZGF0YVwiPkRhdGEge3tkfX08L2xpPlxuICAgKiAgIGAsXG4gICAqIH0pXG4gICAqIGNsYXNzIEdpYW50TGlzdCB7XG4gICAqICAgY29uc3RydWN0b3IocHJpdmF0ZSByZWY6IENoYW5nZURldGVjdG9yUmVmLCBwcml2YXRlIGRhdGFQcm92aWRlcjogRGF0YVByb3ZpZGVyKSB7XG4gICAqICAgICByZWYuZGV0YWNoKCk7XG4gICAqICAgICBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAqICAgICAgIHRoaXMucmVmLmRldGVjdENoYW5nZXMoKTtcbiAgICogICAgIH0sIDUwMDApO1xuICAgKiAgIH1cbiAgICogfVxuICAgKlxuICAgKiBAQ29tcG9uZW50KHtcbiAgICogICBzZWxlY3RvcjogJ2FwcCcsXG4gICAqICAgcHJvdmlkZXJzOiBbRGF0YVByb3ZpZGVyXSxcbiAgICogICB0ZW1wbGF0ZTogYFxuICAgKiAgICAgPGdpYW50LWxpc3Q+PGdpYW50LWxpc3Q+XG4gICAqICAgYCxcbiAgICogfSlcbiAgICogY2xhc3MgQXBwIHtcbiAgICogfVxuICAgKiBgYGBcbiAgICovXG4gIGRldGFjaCgpOiB2b2lkIHtcbiAgICB0aGlzLl9sVmlld1tGTEFHU10gJj0gfkxWaWV3RmxhZ3MuQXR0YWNoZWQ7XG4gIH1cblxuICAvKipcbiAgICogUmUtYXR0YWNoZXMgYSB2aWV3IHRvIHRoZSBjaGFuZ2UgZGV0ZWN0aW9uIHRyZWUuXG4gICAqXG4gICAqIFRoaXMgY2FuIGJlIHVzZWQgdG8gcmUtYXR0YWNoIHZpZXdzIHRoYXQgd2VyZSBwcmV2aW91c2x5IGRldGFjaGVkIGZyb20gdGhlIHRyZWVcbiAgICogdXNpbmcge0BsaW5rIENoYW5nZURldGVjdG9yUmVmI2RldGFjaH0uIFZpZXdzIGFyZSBhdHRhY2hlZCB0byB0aGUgdHJlZSBieSBkZWZhdWx0LlxuICAgKlxuICAgKiA8IS0tIFRPRE86IEFkZCBhIGxpbmsgdG8gYSBjaGFwdGVyIG9uIGRldGFjaC9yZWF0dGFjaC9sb2NhbCBkaWdlc3QgLS0+XG4gICAqXG4gICAqIEB1c2FnZU5vdGVzXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBjcmVhdGVzIGEgY29tcG9uZW50IGRpc3BsYXlpbmcgYGxpdmVgIGRhdGEuIFRoZSBjb21wb25lbnQgd2lsbCBkZXRhY2hcbiAgICogaXRzIGNoYW5nZSBkZXRlY3RvciBmcm9tIHRoZSBtYWluIGNoYW5nZSBkZXRlY3RvciB0cmVlIHdoZW4gdGhlIGNvbXBvbmVudCdzIGxpdmUgcHJvcGVydHlcbiAgICogaXMgc2V0IHRvIGZhbHNlLlxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIGNsYXNzIERhdGFQcm92aWRlciB7XG4gICAqICAgZGF0YSA9IDE7XG4gICAqXG4gICAqICAgY29uc3RydWN0b3IoKSB7XG4gICAqICAgICBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAqICAgICAgIHRoaXMuZGF0YSA9IHRoaXMuZGF0YSAqIDI7XG4gICAqICAgICB9LCA1MDApO1xuICAgKiAgIH1cbiAgICogfVxuICAgKlxuICAgKiBAQ29tcG9uZW50KHtcbiAgICogICBzZWxlY3RvcjogJ2xpdmUtZGF0YScsXG4gICAqICAgaW5wdXRzOiBbJ2xpdmUnXSxcbiAgICogICB0ZW1wbGF0ZTogJ0RhdGE6IHt7ZGF0YVByb3ZpZGVyLmRhdGF9fSdcbiAgICogfSlcbiAgICogY2xhc3MgTGl2ZURhdGEge1xuICAgKiAgIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVmOiBDaGFuZ2VEZXRlY3RvclJlZiwgcHJpdmF0ZSBkYXRhUHJvdmlkZXI6IERhdGFQcm92aWRlcikge31cbiAgICpcbiAgICogICBzZXQgbGl2ZSh2YWx1ZSkge1xuICAgKiAgICAgaWYgKHZhbHVlKSB7XG4gICAqICAgICAgIHRoaXMucmVmLnJlYXR0YWNoKCk7XG4gICAqICAgICB9IGVsc2Uge1xuICAgKiAgICAgICB0aGlzLnJlZi5kZXRhY2goKTtcbiAgICogICAgIH1cbiAgICogICB9XG4gICAqIH1cbiAgICpcbiAgICogQENvbXBvbmVudCh7XG4gICAqICAgc2VsZWN0b3I6ICdhcHAtcm9vdCcsXG4gICAqICAgcHJvdmlkZXJzOiBbRGF0YVByb3ZpZGVyXSxcbiAgICogICB0ZW1wbGF0ZTogYFxuICAgKiAgICAgTGl2ZSBVcGRhdGU6IDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBbKG5nTW9kZWwpXT1cImxpdmVcIj5cbiAgICogICAgIDxsaXZlLWRhdGEgW2xpdmVdPVwibGl2ZVwiPjxsaXZlLWRhdGE+XG4gICAqICAgYCxcbiAgICogfSlcbiAgICogY2xhc3MgQXBwQ29tcG9uZW50IHtcbiAgICogICBsaXZlID0gdHJ1ZTtcbiAgICogfVxuICAgKiBgYGBcbiAgICovXG4gIHJlYXR0YWNoKCk6IHZvaWQge1xuICAgIHVwZGF0ZUFuY2VzdG9yVHJhdmVyc2FsRmxhZ3NPbkF0dGFjaCh0aGlzLl9sVmlldyk7XG4gICAgdGhpcy5fbFZpZXdbRkxBR1NdIHw9IExWaWV3RmxhZ3MuQXR0YWNoZWQ7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIHRoZSB2aWV3IGFuZCBpdHMgY2hpbGRyZW4uXG4gICAqXG4gICAqIFRoaXMgY2FuIGFsc28gYmUgdXNlZCBpbiBjb21iaW5hdGlvbiB3aXRoIHtAbGluayBDaGFuZ2VEZXRlY3RvclJlZiNkZXRhY2h9IHRvIGltcGxlbWVudFxuICAgKiBsb2NhbCBjaGFuZ2UgZGV0ZWN0aW9uIGNoZWNrcy5cbiAgICpcbiAgICogPCEtLSBUT0RPOiBBZGQgYSBsaW5rIHRvIGEgY2hhcHRlciBvbiBkZXRhY2gvcmVhdHRhY2gvbG9jYWwgZGlnZXN0IC0tPlxuICAgKiA8IS0tIFRPRE86IEFkZCBhIGxpdmUgZGVtbyBvbmNlIHJlZi5kZXRlY3RDaGFuZ2VzIGlzIG1lcmdlZCBpbnRvIG1hc3RlciAtLT5cbiAgICpcbiAgICogQHVzYWdlTm90ZXNcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICogVGhlIGZvbGxvd2luZyBleGFtcGxlIGRlZmluZXMgYSBjb21wb25lbnQgd2l0aCBhIGxhcmdlIGxpc3Qgb2YgcmVhZG9ubHkgZGF0YS5cbiAgICogSW1hZ2luZSwgdGhlIGRhdGEgY2hhbmdlcyBjb25zdGFudGx5LCBtYW55IHRpbWVzIHBlciBzZWNvbmQuIEZvciBwZXJmb3JtYW5jZSByZWFzb25zLFxuICAgKiB3ZSB3YW50IHRvIGNoZWNrIGFuZCB1cGRhdGUgdGhlIGxpc3QgZXZlcnkgZml2ZSBzZWNvbmRzLlxuICAgKlxuICAgKiBXZSBjYW4gZG8gdGhhdCBieSBkZXRhY2hpbmcgdGhlIGNvbXBvbmVudCdzIGNoYW5nZSBkZXRlY3RvciBhbmQgZG9pbmcgYSBsb2NhbCBjaGFuZ2UgZGV0ZWN0aW9uXG4gICAqIGNoZWNrIGV2ZXJ5IGZpdmUgc2Vjb25kcy5cbiAgICpcbiAgICogU2VlIHtAbGluayBDaGFuZ2VEZXRlY3RvclJlZiNkZXRhY2h9IGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICAgKi9cbiAgZGV0ZWN0Q2hhbmdlcygpOiB2b2lkIHtcbiAgICAvLyBBZGQgYFJlZnJlc2hWaWV3YCBmbGFnIHRvIGVuc3VyZSB0aGlzIHZpZXcgaXMgcmVmcmVzaGVkIGlmIG5vdCBhbHJlYWR5IGRpcnR5LlxuICAgIC8vIGBSZWZyZXNoVmlld2AgZmxhZyBpcyB1c2VkIGludGVudGlvbmFsbHkgb3ZlciBgRGlydHlgIGJlY2F1c2UgaXQgZ2V0cyBjbGVhcmVkIGJlZm9yZVxuICAgIC8vIGV4ZWN1dGluZyBhbnkgb2YgdGhlIGFjdHVhbCByZWZyZXNoIGNvZGUgd2hpbGUgdGhlIGBEaXJ0eWAgZmxhZyBkb2Vzbid0IGdldCBjbGVhcmVkXG4gICAgLy8gdW50aWwgdGhlIGVuZCBvZiB0aGUgcmVmcmVzaC4gVXNpbmcgYFJlZnJlc2hWaWV3YCBwcmV2ZW50cyBjcmVhdGluZyBhIHBvdGVudGlhbCBkaWZmZXJlbmNlXG4gICAgLy8gaW4gdGhlIHN0YXRlIG9mIHRoZSBMVmlld0ZsYWdzIGR1cmluZyB0ZW1wbGF0ZSBleGVjdXRpb24uXG4gICAgdGhpcy5fbFZpZXdbRkxBR1NdIHw9IExWaWV3RmxhZ3MuUmVmcmVzaFZpZXc7XG4gICAgZGV0ZWN0Q2hhbmdlc0ludGVybmFsKHRoaXMuX2xWaWV3LCB0aGlzLm5vdGlmeUVycm9ySGFuZGxlcik7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIHRoZSBjaGFuZ2UgZGV0ZWN0b3IgYW5kIGl0cyBjaGlsZHJlbiwgYW5kIHRocm93cyBpZiBhbnkgY2hhbmdlcyBhcmUgZGV0ZWN0ZWQuXG4gICAqXG4gICAqIFRoaXMgaXMgdXNlZCBpbiBkZXZlbG9wbWVudCBtb2RlIHRvIHZlcmlmeSB0aGF0IHJ1bm5pbmcgY2hhbmdlIGRldGVjdGlvbiBkb2Vzbid0XG4gICAqIGludHJvZHVjZSBvdGhlciBjaGFuZ2VzLlxuICAgKi9cbiAgY2hlY2tOb0NoYW5nZXMoKTogdm9pZCB7XG4gICAgaWYgKG5nRGV2TW9kZSkge1xuICAgICAgY2hlY2tOb0NoYW5nZXNJbnRlcm5hbChcbiAgICAgICAgdGhpcy5fbFZpZXcsXG4gICAgICAgIENoZWNrTm9DaGFuZ2VzTW9kZS5Pbmx5RGlydHlWaWV3cyxcbiAgICAgICAgdGhpcy5ub3RpZnlFcnJvckhhbmRsZXIsXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIGF0dGFjaFRvVmlld0NvbnRhaW5lclJlZigpIHtcbiAgICBpZiAodGhpcy5fYXBwUmVmKSB7XG4gICAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLlZJRVdfQUxSRUFEWV9BVFRBQ0hFRCxcbiAgICAgICAgbmdEZXZNb2RlICYmICdUaGlzIHZpZXcgaXMgYWxyZWFkeSBhdHRhY2hlZCBkaXJlY3RseSB0byB0aGUgQXBwbGljYXRpb25SZWYhJyxcbiAgICAgICk7XG4gICAgfVxuICAgIHRoaXMuX2F0dGFjaGVkVG9WaWV3Q29udGFpbmVyID0gdHJ1ZTtcbiAgfVxuXG4gIGRldGFjaEZyb21BcHBSZWYoKSB7XG4gICAgdGhpcy5fYXBwUmVmID0gbnVsbDtcbiAgICBjb25zdCBpc1Jvb3QgPSBpc1Jvb3RWaWV3KHRoaXMuX2xWaWV3KTtcbiAgICBjb25zdCBkZWNsYXJhdGlvbkNvbnRhaW5lciA9IHRoaXMuX2xWaWV3W0RFQ0xBUkFUSU9OX0xDT05UQUlORVJdO1xuICAgIGlmIChkZWNsYXJhdGlvbkNvbnRhaW5lciAhPT0gbnVsbCAmJiAhaXNSb290KSB7XG4gICAgICBkZXRhY2hNb3ZlZFZpZXcoZGVjbGFyYXRpb25Db250YWluZXIsIHRoaXMuX2xWaWV3KTtcbiAgICB9XG4gICAgZGV0YWNoVmlld0Zyb21ET00odGhpcy5fbFZpZXdbVFZJRVddLCB0aGlzLl9sVmlldyk7XG4gIH1cblxuICBhdHRhY2hUb0FwcFJlZihhcHBSZWY6IFZpZXdSZWZUcmFja2VyKSB7XG4gICAgaWYgKHRoaXMuX2F0dGFjaGVkVG9WaWV3Q29udGFpbmVyKSB7XG4gICAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLlZJRVdfQUxSRUFEWV9BVFRBQ0hFRCxcbiAgICAgICAgbmdEZXZNb2RlICYmICdUaGlzIHZpZXcgaXMgYWxyZWFkeSBhdHRhY2hlZCB0byBhIFZpZXdDb250YWluZXIhJyxcbiAgICAgICk7XG4gICAgfVxuICAgIHRoaXMuX2FwcFJlZiA9IGFwcFJlZjtcbiAgICBjb25zdCBpc1Jvb3QgPSBpc1Jvb3RWaWV3KHRoaXMuX2xWaWV3KTtcbiAgICBjb25zdCBkZWNsYXJhdGlvbkNvbnRhaW5lciA9IHRoaXMuX2xWaWV3W0RFQ0xBUkFUSU9OX0xDT05UQUlORVJdO1xuICAgIGlmIChkZWNsYXJhdGlvbkNvbnRhaW5lciAhPT0gbnVsbCAmJiAhaXNSb290KSB7XG4gICAgICB0cmFja01vdmVkVmlldyhkZWNsYXJhdGlvbkNvbnRhaW5lciwgdGhpcy5fbFZpZXcpO1xuICAgIH1cbiAgICB1cGRhdGVBbmNlc3RvclRyYXZlcnNhbEZsYWdzT25BdHRhY2godGhpcy5fbFZpZXcpO1xuICB9XG59XG4iXX0=