/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { removeFromArray } from '../util/array_utils';
import { assertEqual } from '../util/assert';
import { collectNativeNodes } from './collect_native_nodes';
import { checkNoChangesInRootView, checkNoChangesInternal, detectChangesInRootView, detectChangesInternal, markViewDirty, storeCleanupWithContext } from './instructions/shared';
import { CONTAINER_HEADER_OFFSET, VIEW_REFS } from './interfaces/container';
import { isLContainer } from './interfaces/type_checks';
import { CONTEXT, FLAGS, PARENT, TVIEW } from './interfaces/view';
import { destroyLView, detachView, renderDetachView } from './node_manipulation';
export class ViewRef {
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
    _cdRefInjectingView) {
        this._lView = _lView;
        this._cdRefInjectingView = _cdRefInjectingView;
        this._appRef = null;
        this._attachedToViewContainer = false;
    }
    get rootNodes() {
        const lView = this._lView;
        const tView = lView[TVIEW];
        return collectNativeNodes(tView, lView, tView.firstChild, []);
    }
    get context() {
        return this._lView[CONTEXT];
    }
    set context(value) {
        this._lView[CONTEXT] = value;
    }
    get destroyed() {
        return (this._lView[FLAGS] & 256 /* Destroyed */) === 256 /* Destroyed */;
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
        storeCleanupWithContext(this._lView[TVIEW], this._lView, null, callback);
    }
    /**
     * Marks a view and all of its ancestors dirty.
     *
     * This can be used to ensure an {@link ChangeDetectionStrategy#OnPush OnPush} component is
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
        markViewDirty(this._cdRefInjectingView || this._lView);
    }
    /**
     * Detaches the view from the change detection tree.
     *
     * Detached views will not be checked during change detection runs until they are
     * re-attached, even if they are dirty. `detach` can be used in combination with
     * {@link ChangeDetectorRef#detectChanges detectChanges} to implement local change
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
        this._lView[FLAGS] &= ~128 /* Attached */;
    }
    /**
     * Re-attaches a view to the change detection tree.
     *
     * This can be used to re-attach views that were previously detached from the tree
     * using {@link ChangeDetectorRef#detach detach}. Views are attached to the tree by default.
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
        this._lView[FLAGS] |= 128 /* Attached */;
    }
    /**
     * Checks the view and its children.
     *
     * This can also be used in combination with {@link ChangeDetectorRef#detach detach} to implement
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
     * See {@link ChangeDetectorRef#detach detach} for more information.
     */
    detectChanges() {
        detectChangesInternal(this._lView[TVIEW], this._lView, this.context);
    }
    /**
     * Checks the change detector and its children, and throws if any changes are detected.
     *
     * This is used in development mode to verify that running change detection doesn't
     * introduce other changes.
     */
    checkNoChanges() {
        checkNoChangesInternal(this._lView[TVIEW], this._lView, this.context);
    }
    attachToViewContainerRef() {
        if (this._appRef) {
            throw new Error('This view is already attached directly to the ApplicationRef!');
        }
        this._attachedToViewContainer = true;
    }
    detachFromAppRef() {
        this._appRef = null;
        renderDetachView(this._lView[TVIEW], this._lView);
    }
    attachToAppRef(appRef) {
        if (this._attachedToViewContainer) {
            throw new Error('This view is already attached to a ViewContainer!');
        }
        this._appRef = appRef;
    }
}
/** @internal */
export class RootViewRef extends ViewRef {
    constructor(_view) {
        super(_view);
        this._view = _view;
    }
    detectChanges() {
        detectChangesInRootView(this._view);
    }
    checkNoChanges() {
        checkNoChangesInRootView(this._view);
    }
    get context() {
        return null;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld19yZWYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9yZW5kZXIzL3ZpZXdfcmVmLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUlILE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNwRCxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDM0MsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFDMUQsT0FBTyxFQUFDLHdCQUF3QixFQUFFLHNCQUFzQixFQUFFLHVCQUF1QixFQUFFLHFCQUFxQixFQUFFLGFBQWEsRUFBRSx1QkFBdUIsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQy9LLE9BQU8sRUFBQyx1QkFBdUIsRUFBRSxTQUFTLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUMxRSxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sMEJBQTBCLENBQUM7QUFDdEQsT0FBTyxFQUFDLE9BQU8sRUFBRSxLQUFLLEVBQXFCLE1BQU0sRUFBRSxLQUFLLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNuRixPQUFPLEVBQUMsWUFBWSxFQUFFLFVBQVUsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBUy9FLE1BQU0sT0FBTyxPQUFPO0lBV2xCO0lBQ0k7Ozs7Ozs7Ozs7T0FVRztJQUNJLE1BQWE7SUFFcEI7Ozs7O09BS0c7SUFDSyxtQkFBMkI7UUFSNUIsV0FBTSxHQUFOLE1BQU0sQ0FBTztRQVFaLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBUTtRQTdCL0IsWUFBTyxHQUF3QixJQUFJLENBQUM7UUFDcEMsNkJBQXdCLEdBQUcsS0FBSyxDQUFDO0lBNEJDLENBQUM7SUExQjNDLElBQUksU0FBUztRQUNYLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDMUIs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ICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q2hhbmdlRGV0ZWN0b3JSZWYgYXMgdmlld0VuZ2luZV9DaGFuZ2VEZXRlY3RvclJlZn0gZnJvbSAnLi4vY2hhbmdlX2RldGVjdGlvbi9jaGFuZ2VfZGV0ZWN0b3JfcmVmJztcbmltcG9ydCB7RW1iZWRkZWRWaWV3UmVmIGFzIHZpZXdFbmdpbmVfRW1iZWRkZWRWaWV3UmVmLCBJbnRlcm5hbFZpZXdSZWYgYXMgdmlld0VuZ2luZV9JbnRlcm5hbFZpZXdSZWYsIFZpZXdSZWZUcmFja2VyfSBmcm9tICcuLi9saW5rZXIvdmlld19yZWYnO1xuaW1wb3J0IHtyZW1vdmVGcm9tQXJyYXl9IGZyb20gJy4uL3V0aWwvYXJyYXlfdXRpbHMnO1xuaW1wb3J0IHthc3NlcnRFcXVhbH0gZnJvbSAnLi4vdXRpbC9hc3NlcnQnO1xuaW1wb3J0IHtjb2xsZWN0TmF0aXZlTm9kZXN9IGZyb20gJy4vY29sbGVjdF9uYXRpdmVfbm9kZXMnO1xuaW1wb3J0IHtjaGVja05vQ2hhbmdlc0luUm9vdFZpZXcsIGNoZWNrTm9DaGFuZ2VzSW50ZXJuYWwsIGRldGVjdENoYW5nZXNJblJvb3RWaWV3LCBkZXRlY3RDaGFuZ2VzSW50ZXJuYWwsIG1hcmtWaWV3RGlydHksIHN0b3JlQ2xlYW51cFdpdGhDb250ZXh0fSBmcm9tICcuL2luc3RydWN0aW9ucy9zaGFyZWQnO1xuaW1wb3J0IHtDT05UQUlORVJfSEVBREVSX09GRlNFVCwgVklFV19SRUZTfSBmcm9tICcuL2ludGVyZmFjZXMvY29udGFpbmVyJztcbmltcG9ydCB7aXNMQ29udGFpbmVyfSBmcm9tICcuL2ludGVyZmFjZXMvdHlwZV9jaGVja3MnO1xuaW1wb3J0IHtDT05URVhULCBGTEFHUywgTFZpZXcsIExWaWV3RmxhZ3MsIFBBUkVOVCwgVFZJRVd9IGZyb20gJy4vaW50ZXJmYWNlcy92aWV3JztcbmltcG9ydCB7ZGVzdHJveUxWaWV3LCBkZXRhY2hWaWV3LCByZW5kZXJEZXRhY2hWaWV3fSBmcm9tICcuL25vZGVfbWFuaXB1bGF0aW9uJztcblxuXG5cbi8vIE5lZWRlZCBkdWUgdG8gdHNpY2tsZSBkb3dubGV2ZWxpbmcgd2hlcmUgbXVsdGlwbGUgYGltcGxlbWVudHNgIHdpdGggY2xhc3NlcyBjcmVhdGVzXG4vLyBtdWx0aXBsZSBAZXh0ZW5kcyBpbiBDbG9zdXJlIGFubm90YXRpb25zLCB3aGljaCBpcyBpbGxlZ2FsLiBUaGlzIHdvcmthcm91bmQgZml4ZXNcbi8vIHRoZSBtdWx0aXBsZSBAZXh0ZW5kcyBieSBtYWtpbmcgdGhlIGFubm90YXRpb24gQGltcGxlbWVudHMgaW5zdGVhZFxuZXhwb3J0IGludGVyZmFjZSB2aWV3RW5naW5lX0NoYW5nZURldGVjdG9yUmVmX2ludGVyZmFjZSBleHRlbmRzIHZpZXdFbmdpbmVfQ2hhbmdlRGV0ZWN0b3JSZWYge31cblxuZXhwb3J0IGNsYXNzIFZpZXdSZWY8VD4gaW1wbGVtZW50cyB2aWV3RW5naW5lX0VtYmVkZGVkVmlld1JlZjxUPiwgdmlld0VuZ2luZV9JbnRlcm5hbFZpZXdSZWYsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpZXdFbmdpbmVfQ2hhbmdlRGV0ZWN0b3JSZWZfaW50ZXJmYWNlIHtcbiAgcHJpdmF0ZSBfYXBwUmVmOiBWaWV3UmVmVHJhY2tlcnxudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBfYXR0YWNoZWRUb1ZpZXdDb250YWluZXIgPSBmYWxzZTtcblxuICBnZXQgcm9vdE5vZGVzKCk6IGFueVtdIHtcbiAgICBjb25zdCBsVmlldyA9IHRoaXMuX2xWaWV3O1xuICAgIGNvbnN0IHRWaWV3ID0gbFZpZXdbVFZJRVddO1xuICAgIHJldHVybiBjb2xsZWN0TmF0aXZlTm9kZXModFZpZXcsIGxWaWV3LCB0Vmlldy5maXJzdENoaWxkLCBbXSk7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIC8qKlxuICAgICAgICogVGhpcyByZXByZXNlbnRzIGBMVmlld2AgYXNzb2NpYXRlZCB3aXRoIHRoZSBjb21wb25lbnQgd2hlbiBWaWV3UmVmIGlzIGEgQ2hhbmdlRGV0ZWN0b3JSZWYuXG4gICAgICAgKlxuICAgICAgICogV2hlbiBWaWV3UmVmIGlzIGNyZWF0ZWQgZm9yIGEgZHluYW1pYyBjb21wb25lbnQsIHRoaXMgYWxzbyByZXByZXNlbnRzIHRoZSBgTFZpZXdgIGZvciB0aGVcbiAgICAgICAqIGNvbXBvbmVudC5cbiAgICAgICAqXG4gICAgICAgKiBGb3IgYSBcInJlZ3VsYXJcIiBWaWV3UmVmIGNyZWF0ZWQgZm9yIGFuIGVtYmVkZGVkIHZpZXcsIHRoaXMgaXMgdGhlIGBMVmlld2AgZm9yIHRoZSBlbWJlZGRlZFxuICAgICAgICogdmlldy5cbiAgICAgICAqXG4gICAgICAgKiBAaW50ZXJuYWxcbiAgICAgICAqL1xuICAgICAgcHVibGljIF9sVmlldzogTFZpZXcsXG5cbiAgICAgIC8qKlxuICAgICAgICogVGhpcyByZXByZXNlbnRzIHRoZSBgTFZpZXdgIGFzc29jaWF0ZWQgd2l0aCB0aGUgcG9pbnQgd2hlcmUgYENoYW5nZURldGVjdG9yUmVmYCB3YXNcbiAgICAgICAqIHJlcXVlc3RlZC5cbiAgICAgICAqXG4gICAgICAgKiBUaGlzIG1heSBiZSBkaWZmZXJlbnQgZnJvbSBgX2xWaWV3YCBpZiB0aGUgYF9jZFJlZkluamVjdGluZ1ZpZXdgIGlzIGFuIGVtYmVkZGVkIHZpZXcuXG4gICAgICAgKi9cbiAgICAgIHByaXZhdGUgX2NkUmVmSW5qZWN0aW5nVmlldz86IExWaWV3KSB7fVxuXG4gIGdldCBjb250ZXh0KCk6IFQge1xuICAgIHJldHVybiB0aGlzLl9sVmlld1tDT05URVhUXSBhcyBUO1xuICB9XG5cbiAgc2V0IGNvbnRleHQodmFsdWU6IFQpIHtcbiAgICB0aGlzLl9sVmlld1tDT05URVhUXSA9IHZhbHVlO1xuICB9XG5cbiAgZ2V0IGRlc3Ryb3llZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gKHRoaXMuX2xWaWV3W0ZMQUdTXSAmIExWaWV3RmxhZ3MuRGVzdHJveWVkKSA9PT0gTFZpZXdGbGFncy5EZXN0cm95ZWQ7XG4gIH1cblxuICBkZXN0cm95KCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9hcHBSZWYpIHtcbiAgICAgIHRoaXMuX2FwcFJlZi5kZXRhY2hWaWV3KHRoaXMpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5fYXR0YWNoZWRUb1ZpZXdDb250YWluZXIpIHtcbiAgICAgIGNvbnN0IHBhcmVudCA9IHRoaXMuX2xWaWV3W1BBUkVOVF07XG4gICAgICBpZiAoaXNMQ29udGFpbmVyKHBhcmVudCkpIHtcbiAgICAgICAgY29uc3Qgdmlld1JlZnMgPSBwYXJlbnRbVklFV19SRUZTXSBhcyBWaWV3UmVmPHVua25vd24+W10gfCBudWxsO1xuICAgICAgICBjb25zdCBpbmRleCA9IHZpZXdSZWZzID8gdmlld1JlZnMuaW5kZXhPZih0aGlzKSA6IC0xO1xuICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICAgIG5nRGV2TW9kZSAmJlxuICAgICAgICAgICAgICBhc3NlcnRFcXVhbChcbiAgICAgICAgICAgICAgICAgIGluZGV4LCBwYXJlbnQuaW5kZXhPZih0aGlzLl9sVmlldykgLSBDT05UQUlORVJfSEVBREVSX09GRlNFVCxcbiAgICAgICAgICAgICAgICAgICdBbiBhdHRhY2hlZCB2aWV3IHNob3VsZCBiZSBpbiB0aGUgc2FtZSBwb3NpdGlvbiB3aXRoaW4gaXRzIGNvbnRhaW5lciBhcyBpdHMgVmlld1JlZiBpbiB0aGUgVklFV19SRUZTIGFycmF5LicpO1xuICAgICAgICAgIGRldGFjaFZpZXcocGFyZW50LCBpbmRleCk7XG4gICAgICAgICAgcmVtb3ZlRnJvbUFycmF5KHZpZXdSZWZzISwgaW5kZXgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLl9hdHRhY2hlZFRvVmlld0NvbnRhaW5lciA9IGZhbHNlO1xuICAgIH1cbiAgICBkZXN0cm95TFZpZXcodGhpcy5fbFZpZXdbVFZJRVddLCB0aGlzLl9sVmlldyk7XG4gIH1cblxuICBvbkRlc3Ryb3koY2FsbGJhY2s6IEZ1bmN0aW9uKSB7XG4gICAgc3RvcmVDbGVhbnVwV2l0aENvbnRleHQodGhpcy5fbFZpZXdbVFZJRVddLCB0aGlzLl9sVmlldywgbnVsbCwgY2FsbGJhY2spO1xuICB9XG5cbiAgLyoqXG4gICAqIE1hcmtzIGEgdmlldyBhbmQgYWxsIG9mIGl0cyBhbmNlc3RvcnMgZGlydHkuXG4gICAqXG4gICAqIFRoaXMgY2FuIGJlIHVzZWQgdG8gZW5zdXJlIGFuIHtAbGluayBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSNPblB1c2ggT25QdXNofSBjb21wb25lbnQgaXNcbiAgICogY2hlY2tlZCB3aGVuIGl0IG5lZWRzIHRvIGJlIHJlLXJlbmRlcmVkIGJ1dCB0aGUgdHdvIG5vcm1hbCB0cmlnZ2VycyBoYXZlbid0IG1hcmtlZCBpdFxuICAgKiBkaXJ0eSAoaS5lLiBpbnB1dHMgaGF2ZW4ndCBjaGFuZ2VkIGFuZCBldmVudHMgaGF2ZW4ndCBmaXJlZCBpbiB0aGUgdmlldykuXG4gICAqXG4gICAqIDwhLS0gVE9ETzogQWRkIGEgbGluayB0byBhIGNoYXB0ZXIgb24gT25QdXNoIGNvbXBvbmVudHMgLS0+XG4gICAqXG4gICAqIEB1c2FnZU5vdGVzXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogQENvbXBvbmVudCh7XG4gICAqICAgc2VsZWN0b3I6ICdhcHAtcm9vdCcsXG4gICAqICAgdGVtcGxhdGU6IGBOdW1iZXIgb2YgdGlja3M6IHt7bnVtYmVyT2ZUaWNrc319YFxuICAgKiAgIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxuICAgKiB9KVxuICAgKiBjbGFzcyBBcHBDb21wb25lbnQge1xuICAgKiAgIG51bWJlck9mVGlja3MgPSAwO1xuICAgKlxuICAgKiAgIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVmOiBDaGFuZ2VEZXRlY3RvclJlZikge1xuICAgKiAgICAgc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgKiAgICAgICB0aGlzLm51bWJlck9mVGlja3MrKztcbiAgICogICAgICAgLy8gdGhlIGZvbGxvd2luZyBpcyByZXF1aXJlZCwgb3RoZXJ3aXNlIHRoZSB2aWV3IHdpbGwgbm90IGJlIHVwZGF0ZWRcbiAgICogICAgICAgdGhpcy5yZWYubWFya0ZvckNoZWNrKCk7XG4gICAqICAgICB9LCAxMDAwKTtcbiAgICogICB9XG4gICAqIH1cbiAgICogYGBgXG4gICAqL1xuICBtYXJrRm9yQ2hlY2soKTogdm9pZCB7XG4gICAgbWFya1ZpZXdEaXJ0eSh0aGlzLl9jZFJlZkluamVjdGluZ1ZpZXcgfHwgdGhpcy5fbFZpZXcpO1xuICB9XG5cbiAgLyoqXG4gICAqIERldGFjaGVzIHRoZSB2aWV3IGZyb20gdGhlIGNoYW5nZSBkZXRlY3Rpb24gdHJlZS5cbiAgICpcbiAgICogRGV0YWNoZWQgdmlld3Mgd2lsbCBub3QgYmUgY2hlY2tlZCBkdXJpbmcgY2hhbmdlIGRldGVjdGlvbiBydW5zIHVudGlsIHRoZXkgYXJlXG4gICAqIHJlLWF0dGFjaGVkLCBldmVuIGlmIHRoZXkgYXJlIGRpcnR5LiBgZGV0YWNoYCBjYW4gYmUgdXNlZCBpbiBjb21iaW5hdGlvbiB3aXRoXG4gICAqIHtAbGluayBDaGFuZ2VEZXRlY3RvclJlZiNkZXRlY3RDaGFuZ2VzIGRldGVjdENoYW5nZXN9IHRvIGltcGxlbWVudCBsb2NhbCBjaGFuZ2VcbiAgICogZGV0ZWN0aW9uIGNoZWNrcy5cbiAgICpcbiAgICogPCEtLSBUT0RPOiBBZGQgYSBsaW5rIHRvIGEgY2hhcHRlciBvbiBkZXRhY2gvcmVhdHRhY2gvbG9jYWwgZGlnZXN0IC0tPlxuICAgKiA8IS0tIFRPRE86IEFkZCBhIGxpdmUgZGVtbyBvbmNlIHJlZi5kZXRlY3RDaGFuZ2VzIGlzIG1lcmdlZCBpbnRvIG1hc3RlciAtLT5cbiAgICpcbiAgICogQHVzYWdlTm90ZXNcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICogVGhlIGZvbGxvd2luZyBleGFtcGxlIGRlZmluZXMgYSBjb21wb25lbnQgd2l0aCBhIGxhcmdlIGxpc3Qgb2YgcmVhZG9ubHkgZGF0YS5cbiAgICogSW1hZ2luZSB0aGUgZGF0YSBjaGFuZ2VzIGNvbnN0YW50bHksIG1hbnkgdGltZXMgcGVyIHNlY29uZC4gRm9yIHBlcmZvcm1hbmNlIHJlYXNvbnMsXG4gICAqIHdlIHdhbnQgdG8gY2hlY2sgYW5kIHVwZGF0ZSB0aGUgbGlzdCBldmVyeSBmaXZlIHNlY29uZHMuIFdlIGNhbiBkbyB0aGF0IGJ5IGRldGFjaGluZ1xuICAgKiB0aGUgY29tcG9uZW50J3MgY2hhbmdlIGRldGVjdG9yIGFuZCBkb2luZyBhIGxvY2FsIGNoZWNrIGV2ZXJ5IGZpdmUgc2Vjb25kcy5cbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiBjbGFzcyBEYXRhUHJvdmlkZXIge1xuICAgKiAgIC8vIGluIGEgcmVhbCBhcHBsaWNhdGlvbiB0aGUgcmV0dXJuZWQgZGF0YSB3aWxsIGJlIGRpZmZlcmVudCBldmVyeSB0aW1lXG4gICAqICAgZ2V0IGRhdGEoKSB7XG4gICAqICAgICByZXR1cm4gWzEsMiwzLDQsNV07XG4gICAqICAgfVxuICAgKiB9XG4gICAqXG4gICAqIEBDb21wb25lbnQoe1xuICAgKiAgIHNlbGVjdG9yOiAnZ2lhbnQtbGlzdCcsXG4gICAqICAgdGVtcGxhdGU6IGBcbiAgICogICAgIDxsaSAqbmdGb3I9XCJsZXQgZCBvZiBkYXRhUHJvdmlkZXIuZGF0YVwiPkRhdGEge3tkfX08L2xpPlxuICAgKiAgIGAsXG4gICAqIH0pXG4gICAqIGNsYXNzIEdpYW50TGlzdCB7XG4gICAqICAgY29uc3RydWN0b3IocHJpdmF0ZSByZWY6IENoYW5nZURldGVjdG9yUmVmLCBwcml2YXRlIGRhdGFQcm92aWRlcjogRGF0YVByb3ZpZGVyKSB7XG4gICAqICAgICByZWYuZGV0YWNoKCk7XG4gICAqICAgICBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAqICAgICAgIHRoaXMucmVmLmRldGVjdENoYW5nZXMoKTtcbiAgICogICAgIH0sIDUwMDApO1xuICAgKiAgIH1cbiAgICogfVxuICAgKlxuICAgKiBAQ29tcG9uZW50KHtcbiAgICogICBzZWxlY3RvcjogJ2FwcCcsXG4gICAqICAgcHJvdmlkZXJzOiBbRGF0YVByb3ZpZGVyXSxcbiAgICogICB0ZW1wbGF0ZTogYFxuICAgKiAgICAgPGdpYW50LWxpc3Q+PGdpYW50LWxpc3Q+XG4gICAqICAgYCxcbiAgICogfSlcbiAgICogY2xhc3MgQXBwIHtcbiAgICogfVxuICAgKiBgYGBcbiAgICovXG4gIGRldGFjaCgpOiB2b2lkIHtcbiAgICB0aGlzLl9sVmlld1tGTEFHU10gJj0gfkxWaWV3RmxhZ3MuQXR0YWNoZWQ7XG4gIH1cblxuICAvKipcbiAgICogUmUtYXR0YWNoZXMgYSB2aWV3IHRvIHRoZSBjaGFuZ2UgZGV0ZWN0aW9uIHRyZWUuXG4gICAqXG4gICAqIFRoaXMgY2FuIGJlIHVzZWQgdG8gcmUtYXR0YWNoIHZpZXdzIHRoYXQgd2VyZSBwcmV2aW91c2x5IGRldGFjaGVkIGZyb20gdGhlIHRyZWVcbiAgICogdXNpbmcge0BsaW5rIENoYW5nZURldGVjdG9yUmVmI2RldGFjaCBkZXRhY2h9LiBWaWV3cyBhcmUgYXR0YWNoZWQgdG8gdGhlIHRyZWUgYnkgZGVmYXVsdC5cbiAgICpcbiAgICogPCEtLSBUT0RPOiBBZGQgYSBsaW5rIHRvIGEgY2hhcHRlciBvbiBkZXRhY2gvcmVhdHRhY2gvbG9jYWwgZGlnZXN0IC0tPlxuICAgKlxuICAgKiBAdXNhZ2VOb3Rlc1xuICAgKiAjIyMgRXhhbXBsZVxuICAgKlxuICAgKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgY3JlYXRlcyBhIGNvbXBvbmVudCBkaXNwbGF5aW5nIGBsaXZlYCBkYXRhLiBUaGUgY29tcG9uZW50IHdpbGwgZGV0YWNoXG4gICAqIGl0cyBjaGFuZ2UgZGV0ZWN0b3IgZnJvbSB0aGUgbWFpbiBjaGFuZ2UgZGV0ZWN0b3IgdHJlZSB3aGVuIHRoZSBjb21wb25lbnQncyBsaXZlIHByb3BlcnR5XG4gICAqIGlzIHNldCB0byBmYWxzZS5cbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiBjbGFzcyBEYXRhUHJvdmlkZXIge1xuICAgKiAgIGRhdGEgPSAxO1xuICAgKlxuICAgKiAgIGNvbnN0cnVjdG9yKCkge1xuICAgKiAgICAgc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgKiAgICAgICB0aGlzLmRhdGEgPSB0aGlzLmRhdGEgKiAyO1xuICAgKiAgICAgfSwgNTAwKTtcbiAgICogICB9XG4gICAqIH1cbiAgICpcbiAgICogQENvbXBvbmVudCh7XG4gICAqICAgc2VsZWN0b3I6ICdsaXZlLWRhdGEnLFxuICAgKiAgIGlucHV0czogWydsaXZlJ10sXG4gICAqICAgdGVtcGxhdGU6ICdEYXRhOiB7e2RhdGFQcm92aWRlci5kYXRhfX0nXG4gICAqIH0pXG4gICAqIGNsYXNzIExpdmVEYXRhIHtcbiAgICogICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYsIHByaXZhdGUgZGF0YVByb3ZpZGVyOiBEYXRhUHJvdmlkZXIpIHt9XG4gICAqXG4gICAqICAgc2V0IGxpdmUodmFsdWUpIHtcbiAgICogICAgIGlmICh2YWx1ZSkge1xuICAgKiAgICAgICB0aGlzLnJlZi5yZWF0dGFjaCgpO1xuICAgKiAgICAgfSBlbHNlIHtcbiAgICogICAgICAgdGhpcy5yZWYuZGV0YWNoKCk7XG4gICAqICAgICB9XG4gICAqICAgfVxuICAgKiB9XG4gICAqXG4gICAqIEBDb21wb25lbnQoe1xuICAgKiAgIHNlbGVjdG9yOiAnYXBwLXJvb3QnLFxuICAgKiAgIHByb3ZpZGVyczogW0RhdGFQcm92aWRlcl0sXG4gICAqICAgdGVtcGxhdGU6IGBcbiAgICogICAgIExpdmUgVXBkYXRlOiA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgWyhuZ01vZGVsKV09XCJsaXZlXCI+XG4gICAqICAgICA8bGl2ZS1kYXRhIFtsaXZlXT1cImxpdmVcIj48bGl2ZS1kYXRhPlxuICAgKiAgIGAsXG4gICAqIH0pXG4gICAqIGNsYXNzIEFwcENvbXBvbmVudCB7XG4gICAqICAgbGl2ZSA9IHRydWU7XG4gICAqIH1cbiAgICogYGBgXG4gICAqL1xuICByZWF0dGFjaCgpOiB2b2lkIHtcbiAgICB0aGlzLl9sVmlld1tGTEFHU10gfD0gTFZpZXdGbGFncy5BdHRhY2hlZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgdGhlIHZpZXcgYW5kIGl0cyBjaGlsZHJlbi5cbiAgICpcbiAgICogVGhpcyBjYW4gYWxzbyBiZSB1c2VkIGluIGNvbWJpbmF0aW9uIHdpdGgge0BsaW5rIENoYW5nZURldGVjdG9yUmVmI2RldGFjaCBkZXRhY2h9IHRvIGltcGxlbWVudFxuICAgKiBsb2NhbCBjaGFuZ2UgZGV0ZWN0aW9uIGNoZWNrcy5cbiAgICpcbiAgICogPCEtLSBUT0RPOiBBZGQgYSBsaW5rIHRvIGEgY2hhcHRlciBvbiBkZXRhY2gvcmVhdHRhY2gvbG9jYWwgZGlnZXN0IC0tPlxuICAgKiA8IS0tIFRPRE86IEFkZCBhIGxpdmUgZGVtbyBvbmNlIHJlZi5kZXRlY3RDaGFuZ2VzIGlzIG1lcmdlZCBpbnRvIG1hc3RlciAtLT5cbiAgICpcbiAgICogQHVzYWdlTm90ZXNcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICogVGhlIGZvbGxvd2luZyBleGFtcGxlIGRlZmluZXMgYSBjb21wb25lbnQgd2l0aCBhIGxhcmdlIGxpc3Qgb2YgcmVhZG9ubHkgZGF0YS5cbiAgICogSW1hZ2luZSwgdGhlIGRhdGEgY2hhbmdlcyBjb25zdGFudGx5LCBtYW55IHRpbWVzIHBlciBzZWNvbmQuIEZvciBwZXJmb3JtYW5jZSByZWFzb25zLFxuICAgKiB3ZSB3YW50IHRvIGNoZWNrIGFuZCB1cGRhdGUgdGhlIGxpc3QgZXZlcnkgZml2ZSBzZWNvbmRzLlxuICAgKlxuICAgKiBXZSBjYW4gZG8gdGhhdCBieSBkZXRhY2hpbmcgdGhlIGNvbXBvbmVudCdzIGNoYW5nZSBkZXRlY3RvciBhbmQgZG9pbmcgYSBsb2NhbCBjaGFuZ2UgZGV0ZWN0aW9uXG4gICAqIGNoZWNrIGV2ZXJ5IGZpdmUgc2Vjb25kcy5cbiAgICpcbiAgICogU2VlIHtAbGluayBDaGFuZ2VEZXRlY3RvclJlZiNkZXRhY2ggZGV0YWNofSBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAgICovXG4gIGRldGVjdENoYW5nZXMoKTogdm9pZCB7XG4gICAgZGV0ZWN0Q2hhbmdlc0ludGVybmFsKHRoaXMuX2xWaWV3W1RWSUVXXSwgdGhpcy5fbFZpZXcsIHRoaXMuY29udGV4dCk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIHRoZSBjaGFuZ2UgZGV0ZWN0b3IgYW5kIGl0cyBjaGlsZHJlbiwgYW5kIHRocm93cyBpZiBhbnkgY2hhbmdlcyBhcmUgZGV0ZWN0ZWQuXG4gICAqXG4gICAqIFRoaXMgaXMgdXNlZCBpbiBkZXZlbG9wbWVudCBtb2RlIHRvIHZlcmlmeSB0aGF0IHJ1bm5pbmcgY2hhbmdlIGRldGVjdGlvbiBkb2Vzbid0XG4gICAqIGludHJvZHVjZSBvdGhlciBjaGFuZ2VzLlxuICAgKi9cbiAgY2hlY2tOb0NoYW5nZXMoKTogdm9pZCB7XG4gICAgY2hlY2tOb0NoYW5nZXNJbnRlcm5hbCh0aGlzLl9sVmlld1tUVklFV10sIHRoaXMuX2xWaWV3LCB0aGlzLmNvbnRleHQpO1xuICB9XG5cbiAgYXR0YWNoVG9WaWV3Q29udGFpbmVyUmVmKCkge1xuICAgIGlmICh0aGlzLl9hcHBSZWYpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVGhpcyB2aWV3IGlzIGFscmVhZHkgYXR0YWNoZWQgZGlyZWN0bHkgdG8gdGhlIEFwcGxpY2F0aW9uUmVmIScpO1xuICAgIH1cbiAgICB0aGlzLl9hdHRhY2hlZFRvVmlld0NvbnRhaW5lciA9IHRydWU7XG4gIH1cblxuICBkZXRhY2hGcm9tQXBwUmVmKCkge1xuICAgIHRoaXMuX2FwcFJlZiA9IG51bGw7XG4gICAgcmVuZGVyRGV0YWNoVmlldyh0aGlzLl9sVmlld1tUVklFV10sIHRoaXMuX2xWaWV3KTtcbiAgfVxuXG4gIGF0dGFjaFRvQXBwUmVmKGFwcFJlZjogVmlld1JlZlRyYWNrZXIpIHtcbiAgICBpZiAodGhpcy5fYXR0YWNoZWRUb1ZpZXdDb250YWluZXIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVGhpcyB2aWV3IGlzIGFscmVhZHkgYXR0YWNoZWQgdG8gYSBWaWV3Q29udGFpbmVyIScpO1xuICAgIH1cbiAgICB0aGlzLl9hcHBSZWYgPSBhcHBSZWY7XG4gIH1cbn1cblxuLyoqIEBpbnRlcm5hbCAqL1xuZXhwb3J0IGNsYXNzIFJvb3RWaWV3UmVmPFQ+IGV4dGVuZHMgVmlld1JlZjxUPiB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBfdmlldzogTFZpZXcpIHtcbiAgICBzdXBlcihfdmlldyk7XG4gIH1cblxuICBkZXRlY3RDaGFuZ2VzKCk6IHZvaWQge1xuICAgIGRldGVjdENoYW5nZXNJblJvb3RWaWV3KHRoaXMuX3ZpZXcpO1xuICB9XG5cbiAgY2hlY2tOb0NoYW5nZXMoKTogdm9pZCB7XG4gICAgY2hlY2tOb0NoYW5nZXNJblJvb3RWaWV3KHRoaXMuX3ZpZXcpO1xuICB9XG5cbiAgZ2V0IGNvbnRleHQoKTogVCB7XG4gICAgcmV0dXJuIG51bGwhO1xuICB9XG59XG4iXX0=