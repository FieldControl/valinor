/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directionality } from '@angular/cdk/bidi';
import { DOCUMENT } from '@angular/common';
import { ContentChild, ContentChildren, Directive, ElementRef, EventEmitter, Inject, Input, NgZone, Optional, Output, QueryList, SkipSelf, ViewContainerRef, ChangeDetectorRef, Self, } from '@angular/core';
import { coerceBooleanProperty, coerceNumberProperty, coerceElement } from '@angular/cdk/coercion';
import { Observable, Subject, merge } from 'rxjs';
import { startWith, take, map, takeUntil, switchMap, tap } from 'rxjs/operators';
import { CDK_DRAG_HANDLE, CdkDragHandle } from './drag-handle';
import { CDK_DRAG_PLACEHOLDER, CdkDragPlaceholder } from './drag-placeholder';
import { CDK_DRAG_PREVIEW, CdkDragPreview } from './drag-preview';
import { CDK_DRAG_PARENT } from '../drag-parent';
import { CDK_DROP_LIST } from './drop-list';
import { DragDrop } from '../drag-drop';
import { CDK_DRAG_CONFIG } from './config';
import { assertElementNode } from './assertions';
const DRAG_HOST_CLASS = 'cdk-drag';
/** Element that can be moved inside a CdkDropList container. */
export class CdkDrag {
    constructor(
    /** Element that the draggable is attached to. */
    element, 
    /** Droppable container that the draggable is a part of. */
    dropContainer, 
    /**
     * @deprecated `_document` parameter no longer being used and will be removed.
     * @breaking-change 12.0.0
     */
    _document, _ngZone, _viewContainerRef, config, _dir, dragDrop, _changeDetectorRef, _selfHandle, _parentDrag) {
        this.element = element;
        this.dropContainer = dropContainer;
        this._ngZone = _ngZone;
        this._viewContainerRef = _viewContainerRef;
        this._dir = _dir;
        this._changeDetectorRef = _changeDetectorRef;
        this._selfHandle = _selfHandle;
        this._parentDrag = _parentDrag;
        this._destroyed = new Subject();
        /** Emits when the user starts dragging the item. */
        this.started = new EventEmitter();
        /** Emits when the user has released a drag item, before any animations have started. */
        this.released = new EventEmitter();
        /** Emits when the user stops dragging an item in the container. */
        this.ended = new EventEmitter();
        /** Emits when the user has moved the item into a new container. */
        this.entered = new EventEmitter();
        /** Emits when the user removes the item its container by dragging it into another container. */
        this.exited = new EventEmitter();
        /** Emits when the user drops the item inside a container. */
        this.dropped = new EventEmitter();
        /**
         * Emits as the user is dragging the item. Use with caution,
         * because this event will fire for every pixel that the user has dragged.
         */
        this.moved = new Observable((observer) => {
            const subscription = this._dragRef.moved.pipe(map(movedEvent => ({
                source: this,
                pointerPosition: movedEvent.pointerPosition,
                event: movedEvent.event,
                delta: movedEvent.delta,
                distance: movedEvent.distance
            }))).subscribe(observer);
            return () => {
                subscription.unsubscribe();
            };
        });
        this._dragRef = dragDrop.createDrag(element, {
            dragStartThreshold: config && config.dragStartThreshold != null ?
                config.dragStartThreshold : 5,
            pointerDirectionChangeThreshold: config && config.pointerDirectionChangeThreshold != null ?
                config.pointerDirectionChangeThreshold : 5,
            zIndex: config === null || config === void 0 ? void 0 : config.zIndex,
        });
        this._dragRef.data = this;
        // We have to keep track of the drag instances in order to be able to match an element to
        // a drag instance. We can't go through the global registry of `DragRef`, because the root
        // element could be different.
        CdkDrag._dragInstances.push(this);
        if (config) {
            this._assignDefaults(config);
        }
        // Note that usually the container is assigned when the drop list is picks up the item, but in
        // some cases (mainly transplanted views with OnPush, see #18341) we may end up in a situation
        // where there are no items on the first change detection pass, but the items get picked up as
        // soon as the user triggers another pass by dragging. This is a problem, because the item would
        // have to switch from standalone mode to drag mode in the middle of the dragging sequence which
        // is too late since the two modes save different kinds of information. We work around it by
        // assigning the drop container both from here and the list.
        if (dropContainer) {
            this._dragRef._withDropContainer(dropContainer._dropListRef);
            dropContainer.addItem(this);
        }
        this._syncInputs(this._dragRef);
        this._handleEvents(this._dragRef);
    }
    /** Whether starting to drag this element is disabled. */
    get disabled() {
        return this._disabled || (this.dropContainer && this.dropContainer.disabled);
    }
    set disabled(value) {
        this._disabled = coerceBooleanProperty(value);
        this._dragRef.disabled = this._disabled;
    }
    /**
     * Returns the element that is being used as a placeholder
     * while the current element is being dragged.
     */
    getPlaceholderElement() {
        return this._dragRef.getPlaceholderElement();
    }
    /** Returns the root draggable element. */
    getRootElement() {
        return this._dragRef.getRootElement();
    }
    /** Resets a standalone drag item to its initial position. */
    reset() {
        this._dragRef.reset();
    }
    /**
     * Gets the pixel coordinates of the draggable outside of a drop container.
     */
    getFreeDragPosition() {
        return this._dragRef.getFreeDragPosition();
    }
    ngAfterViewInit() {
        // We need to wait for the zone to stabilize, in order for the reference
        // element to be in the proper place in the DOM. This is mostly relevant
        // for draggable elements inside portals since they get stamped out in
        // their original DOM position and then they get transferred to the portal.
        this._ngZone.onStable
            .pipe(take(1), takeUntil(this._destroyed))
            .subscribe(() => {
            this._updateRootElement();
            // Listen for any newly-added handles.
            this._handles.changes.pipe(startWith(this._handles), 
            // Sync the new handles with the DragRef.
            tap((handles) => {
                const childHandleElements = handles
                    .filter(handle => handle._parentDrag === this)
                    .map(handle => handle.element);
                // Usually handles are only allowed to be a descendant of the drag element, but if
                // the consumer defined a different drag root, we should allow the drag element
                // itself to be a handle too.
                if (this._selfHandle && this.rootElementSelector) {
                    childHandleElements.push(this.element);
                }
                this._dragRef.withHandles(childHandleElements);
            }), 
            // Listen if the state of any of the handles changes.
            switchMap((handles) => {
                return merge(...handles.map(item => {
                    return item._stateChanges.pipe(startWith(item));
                }));
            }), takeUntil(this._destroyed)).subscribe(handleInstance => {
                // Enabled/disable the handle that changed in the DragRef.
                const dragRef = this._dragRef;
                const handle = handleInstance.element.nativeElement;
                handleInstance.disabled ? dragRef.disableHandle(handle) : dragRef.enableHandle(handle);
            });
            if (this.freeDragPosition) {
                this._dragRef.setFreeDragPosition(this.freeDragPosition);
            }
        });
    }
    ngOnChanges(changes) {
        const rootSelectorChange = changes['rootElementSelector'];
        const positionChange = changes['freeDragPosition'];
        // We don't have to react to the first change since it's being
        // handled in `ngAfterViewInit` where it needs to be deferred.
        if (rootSelectorChange && !rootSelectorChange.firstChange) {
            this._updateRootElement();
        }
        // Skip the first change since it's being handled in `ngAfterViewInit`.
        if (positionChange && !positionChange.firstChange && this.freeDragPosition) {
            this._dragRef.setFreeDragPosition(this.freeDragPosition);
        }
    }
    ngOnDestroy() {
        if (this.dropContainer) {
            this.dropContainer.removeItem(this);
        }
        const index = CdkDrag._dragInstances.indexOf(this);
        if (index > -1) {
            CdkDrag._dragInstances.splice(index, 1);
        }
        this._destroyed.next();
        this._destroyed.complete();
        this._dragRef.dispose();
    }
    /** Syncs the root element with the `DragRef`. */
    _updateRootElement() {
        const element = this.element.nativeElement;
        const rootElement = this.rootElementSelector ?
            getClosestMatchingAncestor(element, this.rootElementSelector) : element;
        if (rootElement && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            assertElementNode(rootElement, 'cdkDrag');
        }
        this._dragRef.withRootElement(rootElement || element);
    }
    /** Gets the boundary element, based on the `boundaryElement` value. */
    _getBoundaryElement() {
        const boundary = this.boundaryElement;
        if (!boundary) {
            return null;
        }
        if (typeof boundary === 'string') {
            return getClosestMatchingAncestor(this.element.nativeElement, boundary);
        }
        const element = coerceElement(boundary);
        if ((typeof ngDevMode === 'undefined' || ngDevMode) &&
            !element.contains(this.element.nativeElement)) {
            throw Error('Draggable element is not inside of the node passed into cdkDragBoundary.');
        }
        return element;
    }
    /** Syncs the inputs of the CdkDrag with the options of the underlying DragRef. */
    _syncInputs(ref) {
        ref.beforeStarted.subscribe(() => {
            if (!ref.isDragging()) {
                const dir = this._dir;
                const dragStartDelay = this.dragStartDelay;
                const placeholder = this._placeholderTemplate ? {
                    template: this._placeholderTemplate.templateRef,
                    context: this._placeholderTemplate.data,
                    viewContainer: this._viewContainerRef
                } : null;
                const preview = this._previewTemplate ? {
                    template: this._previewTemplate.templateRef,
                    context: this._previewTemplate.data,
                    matchSize: this._previewTemplate.matchSize,
                    viewContainer: this._viewContainerRef
                } : null;
                ref.disabled = this.disabled;
                ref.lockAxis = this.lockAxis;
                ref.dragStartDelay = (typeof dragStartDelay === 'object' && dragStartDelay) ?
                    dragStartDelay : coerceNumberProperty(dragStartDelay);
                ref.constrainPosition = this.constrainPosition;
                ref.previewClass = this.previewClass;
                ref
                    .withBoundaryElement(this._getBoundaryElement())
                    .withPlaceholderTemplate(placeholder)
                    .withPreviewTemplate(preview)
                    .withPreviewContainer(this.previewContainer || 'global');
                if (dir) {
                    ref.withDirection(dir.value);
                }
            }
        });
        // This only needs to be resolved once.
        ref.beforeStarted.pipe(take(1)).subscribe(() => {
            var _a, _b;
            // If we managed to resolve a parent through DI, use it.
            if (this._parentDrag) {
                ref.withParent(this._parentDrag._dragRef);
                return;
            }
            // Otherwise fall back to resolving the parent by looking up the DOM. This can happen if
            // the item was projected into another item by something like `ngTemplateOutlet`.
            let parent = this.element.nativeElement.parentElement;
            while (parent) {
                // `classList` needs to be null checked, because IE doesn't have it on some elements.
                if ((_a = parent.classList) === null || _a === void 0 ? void 0 : _a.contains(DRAG_HOST_CLASS)) {
                    ref.withParent(((_b = CdkDrag._dragInstances.find(drag => {
                        return drag.element.nativeElement === parent;
                    })) === null || _b === void 0 ? void 0 : _b._dragRef) || null);
                    break;
                }
                parent = parent.parentElement;
            }
        });
    }
    /** Handles the events from the underlying `DragRef`. */
    _handleEvents(ref) {
        ref.started.subscribe(() => {
            this.started.emit({ source: this });
            // Since all of these events run outside of change detection,
            // we need to ensure that everything is marked correctly.
            this._changeDetectorRef.markForCheck();
        });
        ref.released.subscribe(() => {
            this.released.emit({ source: this });
        });
        ref.ended.subscribe(event => {
            this.ended.emit({
                source: this,
                distance: event.distance,
                dropPoint: event.dropPoint
            });
            // Since all of these events run outside of change detection,
            // we need to ensure that everything is marked correctly.
            this._changeDetectorRef.markForCheck();
        });
        ref.entered.subscribe(event => {
            this.entered.emit({
                container: event.container.data,
                item: this,
                currentIndex: event.currentIndex
            });
        });
        ref.exited.subscribe(event => {
            this.exited.emit({
                container: event.container.data,
                item: this
            });
        });
        ref.dropped.subscribe(event => {
            this.dropped.emit({
                previousIndex: event.previousIndex,
                currentIndex: event.currentIndex,
                previousContainer: event.previousContainer.data,
                container: event.container.data,
                isPointerOverContainer: event.isPointerOverContainer,
                item: this,
                distance: event.distance,
                dropPoint: event.dropPoint
            });
        });
    }
    /** Assigns the default input values based on a provided config object. */
    _assignDefaults(config) {
        const { lockAxis, dragStartDelay, constrainPosition, previewClass, boundaryElement, draggingDisabled, rootElementSelector, previewContainer } = config;
        this.disabled = draggingDisabled == null ? false : draggingDisabled;
        this.dragStartDelay = dragStartDelay || 0;
        if (lockAxis) {
            this.lockAxis = lockAxis;
        }
        if (constrainPosition) {
            this.constrainPosition = constrainPosition;
        }
        if (previewClass) {
            this.previewClass = previewClass;
        }
        if (boundaryElement) {
            this.boundaryElement = boundaryElement;
        }
        if (rootElementSelector) {
            this.rootElementSelector = rootElementSelector;
        }
        if (previewContainer) {
            this.previewContainer = previewContainer;
        }
    }
}
CdkDrag._dragInstances = [];
CdkDrag.decorators = [
    { type: Directive, args: [{
                selector: '[cdkDrag]',
                exportAs: 'cdkDrag',
                host: {
                    'class': DRAG_HOST_CLASS,
                    '[class.cdk-drag-disabled]': 'disabled',
                    '[class.cdk-drag-dragging]': '_dragRef.isDragging()',
                },
                providers: [{ provide: CDK_DRAG_PARENT, useExisting: CdkDrag }]
            },] }
];
CdkDrag.ctorParameters = () => [
    { type: ElementRef },
    { type: undefined, decorators: [{ type: Inject, args: [CDK_DROP_LIST,] }, { type: Optional }, { type: SkipSelf }] },
    { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] },
    { type: NgZone },
    { type: ViewContainerRef },
    { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [CDK_DRAG_CONFIG,] }] },
    { type: Directionality, decorators: [{ type: Optional }] },
    { type: DragDrop },
    { type: ChangeDetectorRef },
    { type: CdkDragHandle, decorators: [{ type: Optional }, { type: Self }, { type: Inject, args: [CDK_DRAG_HANDLE,] }] },
    { type: CdkDrag, decorators: [{ type: Optional }, { type: SkipSelf }, { type: Inject, args: [CDK_DRAG_PARENT,] }] }
];
CdkDrag.propDecorators = {
    _handles: [{ type: ContentChildren, args: [CDK_DRAG_HANDLE, { descendants: true },] }],
    _previewTemplate: [{ type: ContentChild, args: [CDK_DRAG_PREVIEW,] }],
    _placeholderTemplate: [{ type: ContentChild, args: [CDK_DRAG_PLACEHOLDER,] }],
    data: [{ type: Input, args: ['cdkDragData',] }],
    lockAxis: [{ type: Input, args: ['cdkDragLockAxis',] }],
    rootElementSelector: [{ type: Input, args: ['cdkDragRootElement',] }],
    boundaryElement: [{ type: Input, args: ['cdkDragBoundary',] }],
    dragStartDelay: [{ type: Input, args: ['cdkDragStartDelay',] }],
    freeDragPosition: [{ type: Input, args: ['cdkDragFreeDragPosition',] }],
    disabled: [{ type: Input, args: ['cdkDragDisabled',] }],
    constrainPosition: [{ type: Input, args: ['cdkDragConstrainPosition',] }],
    previewClass: [{ type: Input, args: ['cdkDragPreviewClass',] }],
    previewContainer: [{ type: Input, args: ['cdkDragPreviewContainer',] }],
    started: [{ type: Output, args: ['cdkDragStarted',] }],
    released: [{ type: Output, args: ['cdkDragReleased',] }],
    ended: [{ type: Output, args: ['cdkDragEnded',] }],
    entered: [{ type: Output, args: ['cdkDragEntered',] }],
    exited: [{ type: Output, args: ['cdkDragExited',] }],
    dropped: [{ type: Output, args: ['cdkDragDropped',] }],
    moved: [{ type: Output, args: ['cdkDragMoved',] }]
};
/** Gets the closest ancestor of an element that matches a selector. */
function getClosestMatchingAncestor(element, selector) {
    let currentElement = element.parentElement;
    while (currentElement) {
        // IE doesn't support `matches` so we have to fall back to `msMatchesSelector`.
        if (currentElement.matches ? currentElement.matches(selector) :
            currentElement.msMatchesSelector(selector)) {
            return currentElement;
        }
        currentElement = currentElement.parentElement;
    }
    return null;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJhZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvZHJhZy1kcm9wL2RpcmVjdGl2ZXMvZHJhZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDakQsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQ3pDLE9BQU8sRUFFTCxZQUFZLEVBQ1osZUFBZSxFQUNmLFNBQVMsRUFDVCxVQUFVLEVBQ1YsWUFBWSxFQUNaLE1BQU0sRUFDTixLQUFLLEVBQ0wsTUFBTSxFQUVOLFFBQVEsRUFDUixNQUFNLEVBQ04sU0FBUyxFQUNULFFBQVEsRUFDUixnQkFBZ0IsRUFHaEIsaUJBQWlCLEVBQ2pCLElBQUksR0FDTCxNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQ0wscUJBQXFCLEVBQ3JCLG9CQUFvQixFQUNwQixhQUFhLEVBRWQsTUFBTSx1QkFBdUIsQ0FBQztBQUMvQixPQUFPLEVBQUMsVUFBVSxFQUFZLE9BQU8sRUFBRSxLQUFLLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDMUQsT0FBTyxFQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsR0FBRyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFVL0UsT0FBTyxFQUFDLGVBQWUsRUFBRSxhQUFhLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDN0QsT0FBTyxFQUFDLG9CQUFvQixFQUFFLGtCQUFrQixFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFDNUUsT0FBTyxFQUFDLGdCQUFnQixFQUFFLGNBQWMsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQ2hFLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUUvQyxPQUFPLEVBQUMsYUFBYSxFQUFxQyxNQUFNLGFBQWEsQ0FBQztB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L0IsS0FBSyxTQUFDLGlCQUFpQjtnQ0FnQnZCLEtBQUssU0FBQywwQkFBMEI7MkJBR2hDLEtBQUssU0FBQyxxQkFBcUI7K0JBZTNCLEtBQUssU0FBQyx5QkFBeUI7c0JBRy9CLE1BQU0sU0FBQyxnQkFBZ0I7dUJBSXZCLE1BQU0sU0FBQyxpQkFBaUI7b0JBSXhCLE1BQU0sU0FBQyxjQUFjO3NCQUdyQixNQUFNLFNBQUMsZ0JBQWdCO3FCQUl2QixNQUFNLFNBQUMsZUFBZTtzQkFJdEIsTUFBTSxTQUFDLGdCQUFnQjtvQkFPdkIsTUFBTSxTQUFDLGNBQWM7O0FBcVd4Qix1RUFBdUU7QUFDdkUsU0FBUywwQkFBMEIsQ0FBQyxPQUFvQixFQUFFLFFBQWdCO0lBQ3hFLElBQUksY0FBYyxHQUFHLE9BQU8sQ0FBQyxhQUFtQyxDQUFDO0lBRWpFLE9BQU8sY0FBYyxFQUFFO1FBQ3JCLCtFQUErRTtRQUMvRSxJQUFJLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUMxRCxjQUFzQixDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQ3ZELE9BQU8sY0FBYyxDQUFDO1NBQ3ZCO1FBRUQsY0FBYyxHQUFHLGNBQWMsQ0FBQyxhQUFhLENBQUM7S0FDL0M7SUFFRCxPQUFPLElBQUksQ0FBQztBQUNkLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtEaXJlY3Rpb25hbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7XG4gIEFmdGVyVmlld0luaXQsXG4gIENvbnRlbnRDaGlsZCxcbiAgQ29udGVudENoaWxkcmVuLFxuICBEaXJlY3RpdmUsXG4gIEVsZW1lbnRSZWYsXG4gIEV2ZW50RW1pdHRlcixcbiAgSW5qZWN0LFxuICBJbnB1dCxcbiAgTmdab25lLFxuICBPbkRlc3Ryb3ksXG4gIE9wdGlvbmFsLFxuICBPdXRwdXQsXG4gIFF1ZXJ5TGlzdCxcbiAgU2tpcFNlbGYsXG4gIFZpZXdDb250YWluZXJSZWYsXG4gIE9uQ2hhbmdlcyxcbiAgU2ltcGxlQ2hhbmdlcyxcbiAgQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gIFNlbGYsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtcbiAgY29lcmNlQm9vbGVhblByb3BlcnR5LFxuICBjb2VyY2VOdW1iZXJQcm9wZXJ0eSxcbiAgY29lcmNlRWxlbWVudCxcbiAgQm9vbGVhbklucHV0XG59IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQge09ic2VydmFibGUsIE9ic2VydmVyLCBTdWJqZWN0LCBtZXJnZX0gZnJvbSAncnhqcyc7XG5pbXBvcnQge3N0YXJ0V2l0aCwgdGFrZSwgbWFwLCB0YWtlVW50aWwsIHN3aXRjaE1hcCwgdGFwfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQge1xuICBDZGtEcmFnRHJvcCxcbiAgQ2RrRHJhZ0VuZCxcbiAgQ2RrRHJhZ0VudGVyLFxuICBDZGtEcmFnRXhpdCxcbiAgQ2RrRHJhZ01vdmUsXG4gIENka0RyYWdTdGFydCxcbiAgQ2RrRHJhZ1JlbGVhc2UsXG59IGZyb20gJy4uL2RyYWctZXZlbnRzJztcbmltcG9ydCB7Q0RLX0RSQUdfSEFORExFLCBDZGtEcmFnSGFuZGxlfSBmcm9tICcuL2RyYWctaGFuZGxlJztcbmltcG9ydCB7Q0RLX0RSQUdfUExBQ0VIT0xERVIsIENka0RyYWdQbGFjZWhvbGRlcn0gZnJvbSAnLi9kcmFnLXBsYWNlaG9sZGVyJztcbmltcG9ydCB7Q0RLX0RSQUdfUFJFVklFVywgQ2RrRHJhZ1ByZXZpZXd9IGZyb20gJy4vZHJhZy1wcmV2aWV3JztcbmltcG9ydCB7Q0RLX0RSQUdfUEFSRU5UfSBmcm9tICcuLi9kcmFnLXBhcmVudCc7XG5pbXBvcnQge0RyYWdSZWYsIFBvaW50LCBQcmV2aWV3Q29udGFpbmVyfSBmcm9tICcuLi9kcmFnLXJlZic7XG5pbXBvcnQge0NES19EUk9QX0xJU1QsIENka0Ryb3BMaXN0SW50ZXJuYWwgYXMgQ2RrRHJvcExpc3R9IGZyb20gJy4vZHJvcC1saXN0JztcbmltcG9ydCB7RHJhZ0Ryb3B9IGZyb20gJy4uL2RyYWctZHJvcCc7XG5pbXBvcnQge0NES19EUkFHX0NPTkZJRywgRHJhZ0Ryb3BDb25maWcsIERyYWdTdGFydERlbGF5LCBEcmFnQXhpc30gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHthc3NlcnRFbGVtZW50Tm9kZX0gZnJvbSAnLi9hc3NlcnRpb25zJztcblxuY29uc3QgRFJBR19IT1NUX0NMQVNTID0gJ2Nkay1kcmFnJztcblxuLyoqIEVsZW1lbnQgdGhhdCBjYW4gYmUgbW92ZWQgaW5zaWRlIGEgQ2RrRHJvcExpc3QgY29udGFpbmVyLiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka0RyYWddJyxcbiAgZXhwb3J0QXM6ICdjZGtEcmFnJyxcbiAgaG9zdDoge1xuICAgICdjbGFzcyc6IERSQUdfSE9TVF9DTEFTUyxcbiAgICAnW2NsYXNzLmNkay1kcmFnLWRpc2FibGVkXSc6ICdkaXNhYmxlZCcsXG4gICAgJ1tjbGFzcy5jZGstZHJhZy1kcmFnZ2luZ10nOiAnX2RyYWdSZWYuaXNEcmFnZ2luZygpJyxcbiAgfSxcbiAgcHJvdmlkZXJzOiBbe3Byb3ZpZGU6IENES19EUkFHX1BBUkVOVCwgdXNlRXhpc3Rpbmc6IENka0RyYWd9XVxufSlcbmV4cG9ydCBjbGFzcyBDZGtEcmFnPFQgPSBhbnk+IGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCwgT25DaGFuZ2VzLCBPbkRlc3Ryb3kge1xuICBwcml2YXRlIHJlYWRvbmx5IF9kZXN0cm95ZWQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuICBwcml2YXRlIHN0YXRpYyBfZHJhZ0luc3RhbmNlczogQ2RrRHJhZ1tdID0gW107XG5cbiAgLyoqIFJlZmVyZW5jZSB0byB0aGUgdW5kZXJseWluZyBkcmFnIGluc3RhbmNlLiAqL1xuICBfZHJhZ1JlZjogRHJhZ1JlZjxDZGtEcmFnPFQ+PjtcblxuICAvKiogRWxlbWVudHMgdGhhdCBjYW4gYmUgdXNlZCB0byBkcmFnIHRoZSBkcmFnZ2FibGUgaXRlbS4gKi9cbiAgQENvbnRlbnRDaGlsZHJlbihDREtfRFJBR19IQU5ETEUsIHtkZXNjZW5kYW50czogdHJ1ZX0pIF9oYW5kbGVzOiBRdWVyeUxpc3Q8Q2RrRHJhZ0hhbmRsZT47XG5cbiAgLyoqIEVsZW1lbnQgdGhhdCB3aWxsIGJlIHVzZWQgYXMgYSB0ZW1wbGF0ZSB0byBjcmVhdGUgdGhlIGRyYWdnYWJsZSBpdGVtJ3MgcHJldmlldy4gKi9cbiAgQENvbnRlbnRDaGlsZChDREtfRFJBR19QUkVWSUVXKSBfcHJldmlld1RlbXBsYXRlOiBDZGtEcmFnUHJldmlldztcblxuICAvKiogVGVtcGxhdGUgZm9yIHBsYWNlaG9sZGVyIGVsZW1lbnQgcmVuZGVyZWQgdG8gc2hvdyB3aGVyZSBhIGRyYWdnYWJsZSB3b3VsZCBiZSBkcm9wcGVkLiAqL1xuICBAQ29udGVudENoaWxkKENES19EUkFHX1BMQUNFSE9MREVSKSBfcGxhY2Vob2xkZXJUZW1wbGF0ZTogQ2RrRHJhZ1BsYWNlaG9sZGVyO1xuXG4gIC8qKiBBcmJpdHJhcnkgZGF0YSB0byBhdHRhY2ggdG8gdGhpcyBkcmFnIGluc3RhbmNlLiAqL1xuICBASW5wdXQoJ2Nka0RyYWdEYXRhJykgZGF0YTogVDtcblxuICAvKiogTG9ja3MgdGhlIHBvc2l0aW9uIG9mIHRoZSBkcmFnZ2VkIGVsZW1lbnQgYWxvbmcgdGhlIHNwZWNpZmllZCBheGlzLiAqL1xuICBASW5wdXQoJ2Nka0RyYWdMb2NrQXhpcycpIGxvY2tBeGlzOiBEcmFnQXhpcztcblxuICAvKipcbiAgICogU2VsZWN0b3IgdGhhdCB3aWxsIGJlIHVzZWQgdG8gZGV0ZXJtaW5lIHRoZSByb290IGRyYWdnYWJsZSBlbGVtZW50LCBzdGFydGluZyBmcm9tXG4gICAqIHRoZSBgY2RrRHJhZ2AgZWxlbWVudCBhbmQgZ29pbmcgdXAgdGhlIERPTS4gUGFzc2luZyBhbiBhbHRlcm5hdGUgcm9vdCBlbGVtZW50IGlzIHVzZWZ1bFxuICAgKiB3aGVuIHRyeWluZyB0byBlbmFibGUgZHJhZ2dpbmcgb24gYW4gZWxlbWVudCB0aGF0IHlvdSBtaWdodCBub3QgaGF2ZSBhY2Nlc3MgdG8uXG4gICAqL1xuICBASW5wdXQoJ2Nka0RyYWdSb290RWxlbWVudCcpIHJvb3RFbGVtZW50U2VsZWN0b3I6IHN0cmluZztcblxuICAvKipcbiAgICogTm9kZSBvciBzZWxlY3RvciB0aGF0IHdpbGwgYmUgdXNlZCB0byBkZXRlcm1pbmUgdGhlIGVsZW1lbnQgdG8gd2hpY2ggdGhlIGRyYWdnYWJsZSdzXG4gICAqIHBvc2l0aW9uIHdpbGwgYmUgY29uc3RyYWluZWQuIElmIGEgc3RyaW5nIGlzIHBhc3NlZCBpbiwgaXQnbGwgYmUgdXNlZCBhcyBhIHNlbGVjdG9yIHRoYXRcbiAgICogd2lsbCBiZSBtYXRjaGVkIHN0YXJ0aW5nIGZyb20gdGhlIGVsZW1lbnQncyBwYXJlbnQgYW5kIGdvaW5nIHVwIHRoZSBET00gdW50aWwgYSBtYXRjaFxuICAgKiBoYXMgYmVlbiBmb3VuZC5cbiAgICovXG4gIEBJbnB1dCgnY2RrRHJhZ0JvdW5kYXJ5JykgYm91bmRhcnlFbGVtZW50OiBzdHJpbmcgfCBFbGVtZW50UmVmPEhUTUxFbGVtZW50PiB8IEhUTUxFbGVtZW50O1xuXG4gIC8qKlxuICAgKiBBbW91bnQgb2YgbWlsbGlzZWNvbmRzIHRvIHdhaXQgYWZ0ZXIgdGhlIHVzZXIgaGFzIHB1dCB0aGVpclxuICAgKiBwb2ludGVyIGRvd24gYmVmb3JlIHN0YXJ0aW5nIHRvIGRyYWcgdGhlIGVsZW1lbnQuXG4gICAqL1xuICBASW5wdXQoJ2Nka0RyYWdTdGFydERlbGF5JykgZHJhZ1N0YXJ0RGVsYXk6IERyYWdTdGFydERlbGF5O1xuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBwb3NpdGlvbiBvZiBhIGBDZGtEcmFnYCB0aGF0IGlzIG91dHNpZGUgb2YgYSBkcm9wIGNvbnRhaW5lci5cbiAgICogQ2FuIGJlIHVzZWQgdG8gcmVzdG9yZSB0aGUgZWxlbWVudCdzIHBvc2l0aW9uIGZvciBhIHJldHVybmluZyB1c2VyLlxuICAgKi9cbiAgQElucHV0KCdjZGtEcmFnRnJlZURyYWdQb3NpdGlvbicpIGZyZWVEcmFnUG9zaXRpb246IHt4OiBudW1iZXIsIHk6IG51bWJlcn07XG5cbiAgLyoqIFdoZXRoZXIgc3RhcnRpbmcgdG8gZHJhZyB0aGlzIGVsZW1lbnQgaXMgZGlzYWJsZWQuICovXG4gIEBJbnB1dCgnY2RrRHJhZ0Rpc2FibGVkJylcbiAgZ2V0IGRpc2FibGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9kaXNhYmxlZCB8fCAodGhpcy5kcm9wQ29udGFpbmVyICYmIHRoaXMuZHJvcENvbnRhaW5lci5kaXNhYmxlZCk7XG4gIH1cbiAgc2V0IGRpc2FibGVkKHZhbHVlOiBib29sZWFuKSB7XG4gICAgdGhpcy5fZGlzYWJsZWQgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodmFsdWUpO1xuICAgIHRoaXMuX2RyYWdSZWYuZGlzYWJsZWQgPSB0aGlzLl9kaXNhYmxlZDtcbiAgfVxuICBwcml2YXRlIF9kaXNhYmxlZDogYm9vbGVhbjtcblxuICAvKipcbiAgICogRnVuY3Rpb24gdGhhdCBjYW4gYmUgdXNlZCB0byBjdXN0b21pemUgdGhlIGxvZ2ljIG9mIGhvdyB0aGUgcG9zaXRpb24gb2YgdGhlIGRyYWcgaXRlbVxuICAgKiBpcyBsaW1pdGVkIHdoaWxlIGl0J3MgYmVpbmcgZHJhZ2dlZC4gR2V0cyBjYWxsZWQgd2l0aCBhIHBvaW50IGNvbnRhaW5pbmcgdGhlIGN1cnJlbnQgcG9zaXRpb25cbiAgICogb2YgdGhlIHVzZXIncyBwb2ludGVyIG9uIHRoZSBwYWdlIGFuZCBzaG91bGQgcmV0dXJuIGEgcG9pbnQgZGVzY3JpYmluZyB3aGVyZSB0aGUgaXRlbSBzaG91bGRcbiAgICogYmUgcmVuZGVyZWQuXG4gICAqL1xuICBASW5wdXQoJ2Nka0RyYWdDb25zdHJhaW5Qb3NpdGlvbicpIGNvbnN0cmFpblBvc2l0aW9uPzogKHBvaW50OiBQb2ludCwgZHJhZ1JlZjogRHJhZ1JlZikgPT4gUG9pbnQ7XG5cbiAgLyoqIENsYXNzIHRvIGJlIGFkZGVkIHRvIHRoZSBwcmV2aWV3IGVsZW1lbnQuICovXG4gIEBJbnB1dCgnY2RrRHJhZ1ByZXZpZXdDbGFzcycpIHByZXZpZXdDbGFzczogc3RyaW5nIHwgc3RyaW5nW107XG5cbiAgLyoqXG4gICAqIENvbmZpZ3VyZXMgdGhlIHBsYWNlIGludG8gd2hpY2ggdGhlIHByZXZpZXcgb2YgdGhlIGl0ZW0gd2lsbCBiZSBpbnNlcnRlZC4gQ2FuIGJlIGNvbmZpZ3VyZWRcbiAgICogZ2xvYmFsbHkgdGhyb3VnaCBgQ0RLX0RST1BfTElTVGAuIFBvc3NpYmxlIHZhbHVlczpcbiAgICogLSBgZ2xvYmFsYCAtIFByZXZpZXcgd2lsbCBiZSBpbnNlcnRlZCBhdCB0aGUgYm90dG9tIG9mIHRoZSBgPGJvZHk+YC4gVGhlIGFkdmFudGFnZSBpcyB0aGF0XG4gICAqIHlvdSBkb24ndCBoYXZlIHRvIHdvcnJ5IGFib3V0IGBvdmVyZmxvdzogaGlkZGVuYCBvciBgei1pbmRleGAsIGJ1dCB0aGUgaXRlbSB3b24ndCByZXRhaW5cbiAgICogaXRzIGluaGVyaXRlZCBzdHlsZXMuXG4gICAqIC0gYHBhcmVudGAgLSBQcmV2aWV3IHdpbGwgYmUgaW5zZXJ0ZWQgaW50byB0aGUgcGFyZW50IG9mIHRoZSBkcmFnIGl0ZW0uIFRoZSBhZHZhbnRhZ2UgaXMgdGhhdFxuICAgKiBpbmhlcml0ZWQgc3R5bGVzIHdpbGwgYmUgcHJlc2VydmVkLCBidXQgaXQgbWF5IGJlIGNsaXBwZWQgYnkgYG92ZXJmbG93OiBoaWRkZW5gIG9yIG5vdCBiZVxuICAgKiB2aXNpYmxlIGR1ZSB0byBgei1pbmRleGAuIEZ1cnRoZXJtb3JlLCB0aGUgcHJldmlldyBpcyBnb2luZyB0byBoYXZlIGFuIGVmZmVjdCBvdmVyIHNlbGVjdG9yc1xuICAgKiBsaWtlIGA6bnRoLWNoaWxkYCBhbmQgc29tZSBmbGV4Ym94IGNvbmZpZ3VyYXRpb25zLlxuICAgKiAtIGBFbGVtZW50UmVmPEhUTUxFbGVtZW50PiB8IEhUTUxFbGVtZW50YCAtIFByZXZpZXcgd2lsbCBiZSBpbnNlcnRlZCBpbnRvIGEgc3BlY2lmaWMgZWxlbWVudC5cbiAgICogU2FtZSBhZHZhbnRhZ2VzIGFuZCBkaXNhZHZhbnRhZ2VzIGFzIGBwYXJlbnRgLlxuICAgKi9cbiAgQElucHV0KCdjZGtEcmFnUHJldmlld0NvbnRhaW5lcicpIHByZXZpZXdDb250YWluZXI6IFByZXZpZXdDb250YWluZXI7XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhlIHVzZXIgc3RhcnRzIGRyYWdnaW5nIHRoZSBpdGVtLiAqL1xuICBAT3V0cHV0KCdjZGtEcmFnU3RhcnRlZCcpIHJlYWRvbmx5IHN0YXJ0ZWQ6IEV2ZW50RW1pdHRlcjxDZGtEcmFnU3RhcnQ+ID1cbiAgICAgIG5ldyBFdmVudEVtaXR0ZXI8Q2RrRHJhZ1N0YXJ0PigpO1xuXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSB1c2VyIGhhcyByZWxlYXNlZCBhIGRyYWcgaXRlbSwgYmVmb3JlIGFueSBhbmltYXRpb25zIGhhdmUgc3RhcnRlZC4gKi9cbiAgQE91dHB1dCgnY2RrRHJhZ1JlbGVhc2VkJykgcmVhZG9ubHkgcmVsZWFzZWQ6IEV2ZW50RW1pdHRlcjxDZGtEcmFnUmVsZWFzZT4gPVxuICAgICAgbmV3IEV2ZW50RW1pdHRlcjxDZGtEcmFnUmVsZWFzZT4oKTtcblxuICAvKiogRW1pdHMgd2hlbiB0aGUgdXNlciBzdG9wcyBkcmFnZ2luZyBhbiBpdGVtIGluIHRoZSBjb250YWluZXIuICovXG4gIEBPdXRwdXQoJ2Nka0RyYWdFbmRlZCcpIHJlYWRvbmx5IGVuZGVkOiBFdmVudEVtaXR0ZXI8Q2RrRHJhZ0VuZD4gPSBuZXcgRXZlbnRFbWl0dGVyPENka0RyYWdFbmQ+KCk7XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhlIHVzZXIgaGFzIG1vdmVkIHRoZSBpdGVtIGludG8gYSBuZXcgY29udGFpbmVyLiAqL1xuICBAT3V0cHV0KCdjZGtEcmFnRW50ZXJlZCcpIHJlYWRvbmx5IGVudGVyZWQ6IEV2ZW50RW1pdHRlcjxDZGtEcmFnRW50ZXI8YW55Pj4gPVxuICAgICAgbmV3IEV2ZW50RW1pdHRlcjxDZGtEcmFnRW50ZXI8YW55Pj4oKTtcblxuICAvKiogRW1pdHMgd2hlbiB0aGUgdXNlciByZW1vdmVzIHRoZSBpdGVtIGl0cyBjb250YWluZXIgYnkgZHJhZ2dpbmcgaXQgaW50byBhbm90aGVyIGNvbnRhaW5lci4gKi9cbiAgQE91dHB1dCgnY2RrRHJhZ0V4aXRlZCcpIHJlYWRvbmx5IGV4aXRlZDogRXZlbnRFbWl0dGVyPENka0RyYWdFeGl0PGFueT4+ID1cbiAgICAgIG5ldyBFdmVudEVtaXR0ZXI8Q2RrRHJhZ0V4aXQ8YW55Pj4oKTtcblxuICAvKiogRW1pdHMgd2hlbiB0aGUgdXNlciBkcm9wcyB0aGUgaXRlbSBpbnNpZGUgYSBjb250YWluZXIuICovXG4gIEBPdXRwdXQoJ2Nka0RyYWdEcm9wcGVkJykgcmVhZG9ubHkgZHJvcHBlZDogRXZlbnRFbWl0dGVyPENka0RyYWdEcm9wPGFueT4+ID1cbiAgICAgIG5ldyBFdmVudEVtaXR0ZXI8Q2RrRHJhZ0Ryb3A8YW55Pj4oKTtcblxuICAvKipcbiAgICogRW1pdHMgYXMgdGhlIHVzZXIgaXMgZHJhZ2dpbmcgdGhlIGl0ZW0uIFVzZSB3aXRoIGNhdXRpb24sXG4gICAqIGJlY2F1c2UgdGhpcyBldmVudCB3aWxsIGZpcmUgZm9yIGV2ZXJ5IHBpeGVsIHRoYXQgdGhlIHVzZXIgaGFzIGRyYWdnZWQuXG4gICAqL1xuICBAT3V0cHV0KCdjZGtEcmFnTW92ZWQnKVxuICByZWFkb25seSBtb3ZlZDogIE9ic2VydmFibGU8Q2RrRHJhZ01vdmU8VD4+ID1cbiAgICAgIG5ldyBPYnNlcnZhYmxlKChvYnNlcnZlcjogT2JzZXJ2ZXI8Q2RrRHJhZ01vdmU8VD4+KSA9PiB7XG4gICAgICAgIGNvbnN0IHN1YnNjcmlwdGlvbiA9IHRoaXMuX2RyYWdSZWYubW92ZWQucGlwZShtYXAobW92ZWRFdmVudCA9PiAoe1xuICAgICAgICAgIHNvdXJjZTogdGhpcyxcbiAgICAgICAgICBwb2ludGVyUG9zaXRpb246IG1vdmVkRXZlbnQucG9pbnRlclBvc2l0aW9uLFxuICAgICAgICAgIGV2ZW50OiBtb3ZlZEV2ZW50LmV2ZW50LFxuICAgICAgICAgIGRlbHRhOiBtb3ZlZEV2ZW50LmRlbHRhLFxuICAgICAgICAgIGRpc3RhbmNlOiBtb3ZlZEV2ZW50LmRpc3RhbmNlXG4gICAgICAgIH0pKSkuc3Vic2NyaWJlKG9ic2VydmVyKTtcblxuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgIHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgICAgICB9O1xuICAgICAgfSk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICAvKiogRWxlbWVudCB0aGF0IHRoZSBkcmFnZ2FibGUgaXMgYXR0YWNoZWQgdG8uICovXG4gICAgICBwdWJsaWMgZWxlbWVudDogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sXG4gICAgICAvKiogRHJvcHBhYmxlIGNvbnRhaW5lciB0aGF0IHRoZSBkcmFnZ2FibGUgaXMgYSBwYXJ0IG9mLiAqL1xuICAgICAgQEluamVjdChDREtfRFJPUF9MSVNUKSBAT3B0aW9uYWwoKSBAU2tpcFNlbGYoKSBwdWJsaWMgZHJvcENvbnRhaW5lcjogQ2RrRHJvcExpc3QsXG4gICAgICAvKipcbiAgICAgICAqIEBkZXByZWNhdGVkIGBfZG9jdW1lbnRgIHBhcmFtZXRlciBubyBsb25nZXIgYmVpbmcgdXNlZCBhbmQgd2lsbCBiZSByZW1vdmVkLlxuICAgICAgICogQGJyZWFraW5nLWNoYW5nZSAxMi4wLjBcbiAgICAgICAqL1xuICAgICAgQEluamVjdChET0NVTUVOVCkgX2RvY3VtZW50OiBhbnksIHByaXZhdGUgX25nWm9uZTogTmdab25lLFxuICAgICAgcHJpdmF0ZSBfdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZixcbiAgICAgIEBPcHRpb25hbCgpIEBJbmplY3QoQ0RLX0RSQUdfQ09ORklHKSBjb25maWc6IERyYWdEcm9wQ29uZmlnLFxuICAgICAgQE9wdGlvbmFsKCkgcHJpdmF0ZSBfZGlyOiBEaXJlY3Rpb25hbGl0eSwgZHJhZ0Ryb3A6IERyYWdEcm9wLFxuICAgICAgcHJpdmF0ZSBfY2hhbmdlRGV0ZWN0b3JSZWY6IENoYW5nZURldGVjdG9yUmVmLFxuICAgICAgQE9wdGlvbmFsKCkgQFNlbGYoKSBASW5qZWN0KENES19EUkFHX0hBTkRMRSkgcHJpdmF0ZSBfc2VsZkhhbmRsZT86IENka0RyYWdIYW5kbGUsXG4gICAgICBAT3B0aW9uYWwoKSBAU2tpcFNlbGYoKSBASW5qZWN0KENES19EUkFHX1BBUkVOVCkgcHJpdmF0ZSBfcGFyZW50RHJhZz86IENka0RyYWcpIHtcbiAgICB0aGlzLl9kcmFnUmVmID0gZHJhZ0Ryb3AuY3JlYXRlRHJhZyhlbGVtZW50LCB7XG4gICAgICBkcmFnU3RhcnRUaHJlc2hvbGQ6IGNvbmZpZyAmJiBjb25maWcuZHJhZ1N0YXJ0VGhyZXNob2xkICE9IG51bGwgP1xuICAgICAgICAgIGNvbmZpZy5kcmFnU3RhcnRUaHJlc2hvbGQgOiA1LFxuICAgICAgcG9pbnRlckRpcmVjdGlvbkNoYW5nZVRocmVzaG9sZDogY29uZmlnICYmIGNvbmZpZy5wb2ludGVyRGlyZWN0aW9uQ2hhbmdlVGhyZXNob2xkICE9IG51bGwgP1xuICAgICAgICAgIGNvbmZpZy5wb2ludGVyRGlyZWN0aW9uQ2hhbmdlVGhyZXNob2xkIDogNSxcbiAgICAgIHpJbmRleDogY29uZmlnPy56SW5kZXgsXG4gICAgfSk7XG4gICAgdGhpcy5fZHJhZ1JlZi5kYXRhID0gdGhpcztcblxuICAgIC8vIFdlIGhhdmUgdG8ga2VlcCB0cmFjayBvZiB0aGUgZHJhZyBpbnN0YW5jZXMgaW4gb3JkZXIgdG8gYmUgYWJsZSB0byBtYXRjaCBhbiBlbGVtZW50IHRvXG4gICAgLy8gYSBkcmFnIGluc3RhbmNlLiBXZSBjYW4ndCBnbyB0aHJvdWdoIHRoZSBnbG9iYWwgcmVnaXN0cnkgb2YgYERyYWdSZWZgLCBiZWNhdXNlIHRoZSByb290XG4gICAgLy8gZWxlbWVudCBjb3VsZCBiZSBkaWZmZXJlbnQuXG4gICAgQ2RrRHJhZy5fZHJhZ0luc3RhbmNlcy5wdXNoKHRoaXMpO1xuXG4gICAgaWYgKGNvbmZpZykge1xuICAgICAgdGhpcy5fYXNzaWduRGVmYXVsdHMoY29uZmlnKTtcbiAgICB9XG5cbiAgICAvLyBOb3RlIHRoYXQgdXN1YWxseSB0aGUgY29udGFpbmVyIGlzIGFzc2lnbmVkIHdoZW4gdGhlIGRyb3AgbGlzdCBpcyBwaWNrcyB1cCB0aGUgaXRlbSwgYnV0IGluXG4gICAgLy8gc29tZSBjYXNlcyAobWFpbmx5IHRyYW5zcGxhbnRlZCB2aWV3cyB3aXRoIE9uUHVzaCwgc2VlICMxODM0MSkgd2UgbWF5IGVuZCB1cCBpbiBhIHNpdHVhdGlvblxuICAgIC8vIHdoZXJlIHRoZXJlIGFyZSBubyBpdGVtcyBvbiB0aGUgZmlyc3QgY2hhbmdlIGRldGVjdGlvbiBwYXNzLCBidXQgdGhlIGl0ZW1zIGdldCBwaWNrZWQgdXAgYXNcbiAgICAvLyBzb29uIGFzIHRoZSB1c2VyIHRyaWdnZXJzIGFub3RoZXIgcGFzcyBieSBkcmFnZ2luZy4gVGhpcyBpcyBhIHByb2JsZW0sIGJlY2F1c2UgdGhlIGl0ZW0gd291bGRcbiAgICAvLyBoYXZlIHRvIHN3aXRjaCBmcm9tIHN0YW5kYWxvbmUgbW9kZSB0byBkcmFnIG1vZGUgaW4gdGhlIG1pZGRsZSBvZiB0aGUgZHJhZ2dpbmcgc2VxdWVuY2Ugd2hpY2hcbiAgICAvLyBpcyB0b28gbGF0ZSBzaW5jZSB0aGUgdHdvIG1vZGVzIHNhdmUgZGlmZmVyZW50IGtpbmRzIG9mIGluZm9ybWF0aW9uLiBXZSB3b3JrIGFyb3VuZCBpdCBieVxuICAgIC8vIGFzc2lnbmluZyB0aGUgZHJvcCBjb250YWluZXIgYm90aCBmcm9tIGhlcmUgYW5kIHRoZSBsaXN0LlxuICAgIGlmIChkcm9wQ29udGFpbmVyKSB7XG4gICAgICB0aGlzLl9kcmFnUmVmLl93aXRoRHJvcENvbnRhaW5lcihkcm9wQ29udGFpbmVyLl9kcm9wTGlzdFJlZik7XG4gICAgICBkcm9wQ29udGFpbmVyLmFkZEl0ZW0odGhpcyk7XG4gICAgfVxuXG4gICAgdGhpcy5fc3luY0lucHV0cyh0aGlzLl9kcmFnUmVmKTtcbiAgICB0aGlzLl9oYW5kbGVFdmVudHModGhpcy5fZHJhZ1JlZik7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgZWxlbWVudCB0aGF0IGlzIGJlaW5nIHVzZWQgYXMgYSBwbGFjZWhvbGRlclxuICAgKiB3aGlsZSB0aGUgY3VycmVudCBlbGVtZW50IGlzIGJlaW5nIGRyYWdnZWQuXG4gICAqL1xuICBnZXRQbGFjZWhvbGRlckVsZW1lbnQoKTogSFRNTEVsZW1lbnQge1xuICAgIHJldHVybiB0aGlzLl9kcmFnUmVmLmdldFBsYWNlaG9sZGVyRWxlbWVudCgpO1xuICB9XG5cbiAgLyoqIFJldHVybnMgdGhlIHJvb3QgZHJhZ2dhYmxlIGVsZW1lbnQuICovXG4gIGdldFJvb3RFbGVtZW50KCk6IEhUTUxFbGVtZW50IHtcbiAgICByZXR1cm4gdGhpcy5fZHJhZ1JlZi5nZXRSb290RWxlbWVudCgpO1xuICB9XG5cbiAgLyoqIFJlc2V0cyBhIHN0YW5kYWxvbmUgZHJhZyBpdGVtIHRvIGl0cyBpbml0aWFsIHBvc2l0aW9uLiAqL1xuICByZXNldCgpOiB2b2lkIHtcbiAgICB0aGlzLl9kcmFnUmVmLnJlc2V0KCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgcGl4ZWwgY29vcmRpbmF0ZXMgb2YgdGhlIGRyYWdnYWJsZSBvdXRzaWRlIG9mIGEgZHJvcCBjb250YWluZXIuXG4gICAqL1xuICBnZXRGcmVlRHJhZ1Bvc2l0aW9uKCk6IHtyZWFkb25seSB4OiBudW1iZXIsIHJlYWRvbmx5IHk6IG51bWJlcn0ge1xuICAgIHJldHVybiB0aGlzLl9kcmFnUmVmLmdldEZyZWVEcmFnUG9zaXRpb24oKTtcbiAgfVxuXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAgICAvLyBXZSBuZWVkIHRvIHdhaXQgZm9yIHRoZSB6b25lIHRvIHN0YWJpbGl6ZSwgaW4gb3JkZXIgZm9yIHRoZSByZWZlcmVuY2VcbiAgICAvLyBlbGVtZW50IHRvIGJlIGluIHRoZSBwcm9wZXIgcGxhY2UgaW4gdGhlIERPTS4gVGhpcyBpcyBtb3N0bHkgcmVsZXZhbnRcbiAgICAvLyBmb3IgZHJhZ2dhYmxlIGVsZW1lbnRzIGluc2lkZSBwb3J0YWxzIHNpbmNlIHRoZXkgZ2V0IHN0YW1wZWQgb3V0IGluXG4gICAgLy8gdGhlaXIgb3JpZ2luYWwgRE9NIHBvc2l0aW9uIGFuZCB0aGVuIHRoZXkgZ2V0IHRyYW5zZmVycmVkIHRvIHRoZSBwb3J0YWwuXG4gICAgdGhpcy5fbmdab25lLm9uU3RhYmxlXG4gICAgICAucGlwZSh0YWtlKDEpLCB0YWtlVW50aWwodGhpcy5fZGVzdHJveWVkKSlcbiAgICAgIC5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICB0aGlzLl91cGRhdGVSb290RWxlbWVudCgpO1xuXG4gICAgICAgIC8vIExpc3RlbiBmb3IgYW55IG5ld2x5LWFkZGVkIGhhbmRsZXMuXG4gICAgICAgIHRoaXMuX2hhbmRsZXMuY2hhbmdlcy5waXBlKFxuICAgICAgICAgIHN0YXJ0V2l0aCh0aGlzLl9oYW5kbGVzKSxcbiAgICAgICAgICAvLyBTeW5jIHRoZSBuZXcgaGFuZGxlcyB3aXRoIHRoZSBEcmFnUmVmLlxuICAgICAgICAgIHRhcCgoaGFuZGxlczogUXVlcnlMaXN0PENka0RyYWdIYW5kbGU+KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjaGlsZEhhbmRsZUVsZW1lbnRzID0gaGFuZGxlc1xuICAgICAgICAgICAgICAuZmlsdGVyKGhhbmRsZSA9PiBoYW5kbGUuX3BhcmVudERyYWcgPT09IHRoaXMpXG4gICAgICAgICAgICAgIC5tYXAoaGFuZGxlID0+IGhhbmRsZS5lbGVtZW50KTtcblxuICAgICAgICAgICAgLy8gVXN1YWxseSBoYW5kbGVzIGFyZSBvbmx5IGFsbG93ZWQgdG8gYmUgYSBkZXNjZW5kYW50IG9mIHRoZSBkcmFnIGVsZW1lbnQsIGJ1dCBpZlxuICAgICAgICAgICAgLy8gdGhlIGNvbnN1bWVyIGRlZmluZWQgYSBkaWZmZXJlbnQgZHJhZyByb290LCB3ZSBzaG91bGQgYWxsb3cgdGhlIGRyYWcgZWxlbWVudFxuICAgICAgICAgICAgLy8gaXRzZWxmIHRvIGJlIGEgaGFuZGxlIHRvby5cbiAgICAgICAgICAgIGlmICh0aGlzLl9zZWxmSGFuZGxlICYmIHRoaXMucm9vdEVsZW1lbnRTZWxlY3Rvcikge1xuICAgICAgICAgICAgICBjaGlsZEhhbmRsZUVsZW1lbnRzLnB1c2godGhpcy5lbGVtZW50KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5fZHJhZ1JlZi53aXRoSGFuZGxlcyhjaGlsZEhhbmRsZUVsZW1lbnRzKTtcbiAgICAgICAgICB9KSxcbiAgICAgICAgICAvLyBMaXN0ZW4gaWYgdGhlIHN0YXRlIG9mIGFueSBvZiB0aGUgaGFuZGxlcyBjaGFuZ2VzLlxuICAgICAgICAgIHN3aXRjaE1hcCgoaGFuZGxlczogUXVlcnlMaXN0PENka0RyYWdIYW5kbGU+KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbWVyZ2UoLi4uaGFuZGxlcy5tYXAoaXRlbSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiBpdGVtLl9zdGF0ZUNoYW5nZXMucGlwZShzdGFydFdpdGgoaXRlbSkpO1xuICAgICAgICAgICAgfSkpIGFzIE9ic2VydmFibGU8Q2RrRHJhZ0hhbmRsZT47XG4gICAgICAgICAgfSksXG4gICAgICAgICAgdGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3llZClcbiAgICAgICAgKS5zdWJzY3JpYmUoaGFuZGxlSW5zdGFuY2UgPT4ge1xuICAgICAgICAgIC8vIEVuYWJsZWQvZGlzYWJsZSB0aGUgaGFuZGxlIHRoYXQgY2hhbmdlZCBpbiB0aGUgRHJhZ1JlZi5cbiAgICAgICAgICBjb25zdCBkcmFnUmVmID0gdGhpcy5fZHJhZ1JlZjtcbiAgICAgICAgICBjb25zdCBoYW5kbGUgPSBoYW5kbGVJbnN0YW5jZS5lbGVtZW50Lm5hdGl2ZUVsZW1lbnQ7XG4gICAgICAgICAgaGFuZGxlSW5zdGFuY2UuZGlzYWJsZWQgPyBkcmFnUmVmLmRpc2FibGVIYW5kbGUoaGFuZGxlKSA6IGRyYWdSZWYuZW5hYmxlSGFuZGxlKGhhbmRsZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmICh0aGlzLmZyZWVEcmFnUG9zaXRpb24pIHtcbiAgICAgICAgICB0aGlzLl9kcmFnUmVmLnNldEZyZWVEcmFnUG9zaXRpb24odGhpcy5mcmVlRHJhZ1Bvc2l0aW9uKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIH1cblxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XG4gICAgY29uc3Qgcm9vdFNlbGVjdG9yQ2hhbmdlID0gY2hhbmdlc1sncm9vdEVsZW1lbnRTZWxlY3RvciddO1xuICAgIGNvbnN0IHBvc2l0aW9uQ2hhbmdlID0gY2hhbmdlc1snZnJlZURyYWdQb3NpdGlvbiddO1xuXG4gICAgLy8gV2UgZG9uJ3QgaGF2ZSB0byByZWFjdCB0byB0aGUgZmlyc3QgY2hhbmdlIHNpbmNlIGl0J3MgYmVpbmdcbiAgICAvLyBoYW5kbGVkIGluIGBuZ0FmdGVyVmlld0luaXRgIHdoZXJlIGl0IG5lZWRzIHRvIGJlIGRlZmVycmVkLlxuICAgIGlmIChyb290U2VsZWN0b3JDaGFuZ2UgJiYgIXJvb3RTZWxlY3RvckNoYW5nZS5maXJzdENoYW5nZSkge1xuICAgICAgdGhpcy5fdXBkYXRlUm9vdEVsZW1lbnQoKTtcbiAgICB9XG5cbiAgICAvLyBTa2lwIHRoZSBmaXJzdCBjaGFuZ2Ugc2luY2UgaXQncyBiZWluZyBoYW5kbGVkIGluIGBuZ0FmdGVyVmlld0luaXRgLlxuICAgIGlmIChwb3NpdGlvbkNoYW5nZSAmJiAhcG9zaXRpb25DaGFuZ2UuZmlyc3RDaGFuZ2UgJiYgdGhpcy5mcmVlRHJhZ1Bvc2l0aW9uKSB7XG4gICAgICB0aGlzLl9kcmFnUmVmLnNldEZyZWVEcmFnUG9zaXRpb24odGhpcy5mcmVlRHJhZ1Bvc2l0aW9uKTtcbiAgICB9XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICBpZiAodGhpcy5kcm9wQ29udGFpbmVyKSB7XG4gICAgICB0aGlzLmRyb3BDb250YWluZXIucmVtb3ZlSXRlbSh0aGlzKTtcbiAgICB9XG5cbiAgICBjb25zdCBpbmRleCA9IENka0RyYWcuX2RyYWdJbnN0YW5jZXMuaW5kZXhPZih0aGlzKTtcbiAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgQ2RrRHJhZy5fZHJhZ0luc3RhbmNlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbiAgICB0aGlzLl9kZXN0cm95ZWQubmV4dCgpO1xuICAgIHRoaXMuX2Rlc3Ryb3llZC5jb21wbGV0ZSgpO1xuICAgIHRoaXMuX2RyYWdSZWYuZGlzcG9zZSgpO1xuICB9XG5cbiAgLyoqIFN5bmNzIHRoZSByb290IGVsZW1lbnQgd2l0aCB0aGUgYERyYWdSZWZgLiAqL1xuICBwcml2YXRlIF91cGRhdGVSb290RWxlbWVudCgpIHtcbiAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5lbGVtZW50Lm5hdGl2ZUVsZW1lbnQ7XG4gICAgY29uc3Qgcm9vdEVsZW1lbnQgPSB0aGlzLnJvb3RFbGVtZW50U2VsZWN0b3IgP1xuICAgICAgICBnZXRDbG9zZXN0TWF0Y2hpbmdBbmNlc3RvcihlbGVtZW50LCB0aGlzLnJvb3RFbGVtZW50U2VsZWN0b3IpIDogZWxlbWVudDtcblxuICAgIGlmIChyb290RWxlbWVudCAmJiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSkge1xuICAgICAgYXNzZXJ0RWxlbWVudE5vZGUocm9vdEVsZW1lbnQsICdjZGtEcmFnJyk7XG4gICAgfVxuXG4gICAgdGhpcy5fZHJhZ1JlZi53aXRoUm9vdEVsZW1lbnQocm9vdEVsZW1lbnQgfHwgZWxlbWVudCk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgYm91bmRhcnkgZWxlbWVudCwgYmFzZWQgb24gdGhlIGBib3VuZGFyeUVsZW1lbnRgIHZhbHVlLiAqL1xuICBwcml2YXRlIF9nZXRCb3VuZGFyeUVsZW1lbnQoKSB7XG4gICAgY29uc3QgYm91bmRhcnkgPSB0aGlzLmJvdW5kYXJ5RWxlbWVudDtcblxuICAgIGlmICghYm91bmRhcnkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgYm91bmRhcnkgPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gZ2V0Q2xvc2VzdE1hdGNoaW5nQW5jZXN0b3IodGhpcy5lbGVtZW50Lm5hdGl2ZUVsZW1lbnQsIGJvdW5kYXJ5KTtcbiAgICB9XG5cbiAgICBjb25zdCBlbGVtZW50ID0gY29lcmNlRWxlbWVudChib3VuZGFyeSk7XG5cbiAgICBpZiAoKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkgJiZcbiAgICAgICFlbGVtZW50LmNvbnRhaW5zKHRoaXMuZWxlbWVudC5uYXRpdmVFbGVtZW50KSkge1xuICAgICAgdGhyb3cgRXJyb3IoJ0RyYWdnYWJsZSBlbGVtZW50IGlzIG5vdCBpbnNpZGUgb2YgdGhlIG5vZGUgcGFzc2VkIGludG8gY2RrRHJhZ0JvdW5kYXJ5LicpO1xuICAgIH1cblxuICAgIHJldHVybiBlbGVtZW50O1xuICB9XG5cbiAgLyoqIFN5bmNzIHRoZSBpbnB1dHMgb2YgdGhlIENka0RyYWcgd2l0aCB0aGUgb3B0aW9ucyBvZiB0aGUgdW5kZXJseWluZyBEcmFnUmVmLiAqL1xuICBwcml2YXRlIF9zeW5jSW5wdXRzKHJlZjogRHJhZ1JlZjxDZGtEcmFnPFQ+Pikge1xuICAgIHJlZi5iZWZvcmVTdGFydGVkLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICBpZiAoIXJlZi5pc0RyYWdnaW5nKCkpIHtcbiAgICAgICAgY29uc3QgZGlyID0gdGhpcy5fZGlyO1xuICAgICAgICBjb25zdCBkcmFnU3RhcnREZWxheSA9IHRoaXMuZHJhZ1N0YXJ0RGVsYXk7XG4gICAgICAgIGNvbnN0IHBsYWNlaG9sZGVyID0gdGhpcy5fcGxhY2Vob2xkZXJUZW1wbGF0ZSA/IHtcbiAgICAgICAgICB0ZW1wbGF0ZTogdGhpcy5fcGxhY2Vob2xkZXJUZW1wbGF0ZS50ZW1wbGF0ZVJlZixcbiAgICAgICAgICBjb250ZXh0OiB0aGlzLl9wbGFjZWhvbGRlclRlbXBsYXRlLmRhdGEsXG4gICAgICAgICAgdmlld0NvbnRhaW5lcjogdGhpcy5fdmlld0NvbnRhaW5lclJlZlxuICAgICAgICB9IDogbnVsbDtcbiAgICAgICAgY29uc3QgcHJldmlldyA9IHRoaXMuX3ByZXZpZXdUZW1wbGF0ZSA/IHtcbiAgICAgICAgICB0ZW1wbGF0ZTogdGhpcy5fcHJldmlld1RlbXBsYXRlLnRlbXBsYXRlUmVmLFxuICAgICAgICAgIGNvbnRleHQ6IHRoaXMuX3ByZXZpZXdUZW1wbGF0ZS5kYXRhLFxuICAgICAgICAgIG1hdGNoU2l6ZTogdGhpcy5fcHJldmlld1RlbXBsYXRlLm1hdGNoU2l6ZSxcbiAgICAgICAgICB2aWV3Q29udGFpbmVyOiB0aGlzLl92aWV3Q29udGFpbmVyUmVmXG4gICAgICAgIH0gOiBudWxsO1xuXG4gICAgICAgIHJlZi5kaXNhYmxlZCA9IHRoaXMuZGlzYWJsZWQ7XG4gICAgICAgIHJlZi5sb2NrQXhpcyA9IHRoaXMubG9ja0F4aXM7XG4gICAgICAgIHJlZi5kcmFnU3RhcnREZWxheSA9ICh0eXBlb2YgZHJhZ1N0YXJ0RGVsYXkgPT09ICdvYmplY3QnICYmIGRyYWdTdGFydERlbGF5KSA/XG4gICAgICAgICAgICBkcmFnU3RhcnREZWxheSA6IGNvZXJjZU51bWJlclByb3BlcnR5KGRyYWdTdGFydERlbGF5KTtcbiAgICAgICAgcmVmLmNvbnN0cmFpblBvc2l0aW9uID0gdGhpcy5jb25zdHJhaW5Qb3NpdGlvbjtcbiAgICAgICAgcmVmLnByZXZpZXdDbGFzcyA9IHRoaXMucHJldmlld0NsYXNzO1xuICAgICAgICByZWZcbiAgICAgICAgICAud2l0aEJvdW5kYXJ5RWxlbWVudCh0aGlzLl9nZXRCb3VuZGFyeUVsZW1lbnQoKSlcbiAgICAgICAgICAud2l0aFBsYWNlaG9sZGVyVGVtcGxhdGUocGxhY2Vob2xkZXIpXG4gICAgICAgICAgLndpdGhQcmV2aWV3VGVtcGxhdGUocHJldmlldylcbiAgICAgICAgICAud2l0aFByZXZpZXdDb250YWluZXIodGhpcy5wcmV2aWV3Q29udGFpbmVyIHx8ICdnbG9iYWwnKTtcblxuICAgICAgICBpZiAoZGlyKSB7XG4gICAgICAgICAgcmVmLndpdGhEaXJlY3Rpb24oZGlyLnZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gVGhpcyBvbmx5IG5lZWRzIHRvIGJlIHJlc29sdmVkIG9uY2UuXG4gICAgcmVmLmJlZm9yZVN0YXJ0ZWQucGlwZSh0YWtlKDEpKS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgLy8gSWYgd2UgbWFuYWdlZCB0byByZXNvbHZlIGEgcGFyZW50IHRocm91Z2ggREksIHVzZSBpdC5cbiAgICAgIGlmICh0aGlzLl9wYXJlbnREcmFnKSB7XG4gICAgICAgIHJlZi53aXRoUGFyZW50KHRoaXMuX3BhcmVudERyYWcuX2RyYWdSZWYpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIE90aGVyd2lzZSBmYWxsIGJhY2sgdG8gcmVzb2x2aW5nIHRoZSBwYXJlbnQgYnkgbG9va2luZyB1cCB0aGUgRE9NLiBUaGlzIGNhbiBoYXBwZW4gaWZcbiAgICAgIC8vIHRoZSBpdGVtIHdhcyBwcm9qZWN0ZWQgaW50byBhbm90aGVyIGl0ZW0gYnkgc29tZXRoaW5nIGxpa2UgYG5nVGVtcGxhdGVPdXRsZXRgLlxuICAgICAgbGV0IHBhcmVudCA9IHRoaXMuZWxlbWVudC5uYXRpdmVFbGVtZW50LnBhcmVudEVsZW1lbnQ7XG4gICAgICB3aGlsZSAocGFyZW50KSB7XG4gICAgICAgIC8vIGBjbGFzc0xpc3RgIG5lZWRzIHRvIGJlIG51bGwgY2hlY2tlZCwgYmVjYXVzZSBJRSBkb2Vzbid0IGhhdmUgaXQgb24gc29tZSBlbGVtZW50cy5cbiAgICAgICAgaWYgKHBhcmVudC5jbGFzc0xpc3Q/LmNvbnRhaW5zKERSQUdfSE9TVF9DTEFTUykpIHtcbiAgICAgICAgICByZWYud2l0aFBhcmVudChDZGtEcmFnLl9kcmFnSW5zdGFuY2VzLmZpbmQoZHJhZyA9PiB7XG4gICAgICAgICAgICByZXR1cm4gZHJhZy5lbGVtZW50Lm5hdGl2ZUVsZW1lbnQgPT09IHBhcmVudDtcbiAgICAgICAgICB9KT8uX2RyYWdSZWYgfHwgbnVsbCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgcGFyZW50ID0gcGFyZW50LnBhcmVudEVsZW1lbnQ7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKiogSGFuZGxlcyB0aGUgZXZlbnRzIGZyb20gdGhlIHVuZGVybHlpbmcgYERyYWdSZWZgLiAqL1xuICBwcml2YXRlIF9oYW5kbGVFdmVudHMocmVmOiBEcmFnUmVmPENka0RyYWc8VD4+KSB7XG4gICAgcmVmLnN0YXJ0ZWQuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgIHRoaXMuc3RhcnRlZC5lbWl0KHtzb3VyY2U6IHRoaXN9KTtcblxuICAgICAgLy8gU2luY2UgYWxsIG9mIHRoZXNlIGV2ZW50cyBydW4gb3V0c2lkZSBvZiBjaGFuZ2UgZGV0ZWN0aW9uLFxuICAgICAgLy8gd2UgbmVlZCB0byBlbnN1cmUgdGhhdCBldmVyeXRoaW5nIGlzIG1hcmtlZCBjb3JyZWN0bHkuXG4gICAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKTtcbiAgICB9KTtcblxuICAgIHJlZi5yZWxlYXNlZC5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgdGhpcy5yZWxlYXNlZC5lbWl0KHtzb3VyY2U6IHRoaXN9KTtcbiAgICB9KTtcblxuICAgIHJlZi5lbmRlZC5zdWJzY3JpYmUoZXZlbnQgPT4ge1xuICAgICAgdGhpcy5lbmRlZC5lbWl0KHtcbiAgICAgICAgc291cmNlOiB0aGlzLFxuICAgICAgICBkaXN0YW5jZTogZXZlbnQuZGlzdGFuY2UsXG4gICAgICAgIGRyb3BQb2ludDogZXZlbnQuZHJvcFBvaW50XG4gICAgICB9KTtcblxuICAgICAgLy8gU2luY2UgYWxsIG9mIHRoZXNlIGV2ZW50cyBydW4gb3V0c2lkZSBvZiBjaGFuZ2UgZGV0ZWN0aW9uLFxuICAgICAgLy8gd2UgbmVlZCB0byBlbnN1cmUgdGhhdCBldmVyeXRoaW5nIGlzIG1hcmtlZCBjb3JyZWN0bHkuXG4gICAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKTtcbiAgICB9KTtcblxuICAgIHJlZi5lbnRlcmVkLnN1YnNjcmliZShldmVudCA9PiB7XG4gICAgICB0aGlzLmVudGVyZWQuZW1pdCh7XG4gICAgICAgIGNvbnRhaW5lcjogZXZlbnQuY29udGFpbmVyLmRhdGEsXG4gICAgICAgIGl0ZW06IHRoaXMsXG4gICAgICAgIGN1cnJlbnRJbmRleDogZXZlbnQuY3VycmVudEluZGV4XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHJlZi5leGl0ZWQuc3Vic2NyaWJlKGV2ZW50ID0+IHtcbiAgICAgIHRoaXMuZXhpdGVkLmVtaXQoe1xuICAgICAgICBjb250YWluZXI6IGV2ZW50LmNvbnRhaW5lci5kYXRhLFxuICAgICAgICBpdGVtOiB0aGlzXG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHJlZi5kcm9wcGVkLnN1YnNjcmliZShldmVudCA9PiB7XG4gICAgICB0aGlzLmRyb3BwZWQuZW1pdCh7XG4gICAgICAgIHByZXZpb3VzSW5kZXg6IGV2ZW50LnByZXZpb3VzSW5kZXgsXG4gICAgICAgIGN1cnJlbnRJbmRleDogZXZlbnQuY3VycmVudEluZGV4LFxuICAgICAgICBwcmV2aW91c0NvbnRhaW5lcjogZXZlbnQucHJldmlvdXNDb250YWluZXIuZGF0YSxcbiAgICAgICAgY29udGFpbmVyOiBldmVudC5jb250YWluZXIuZGF0YSxcbiAgICAgICAgaXNQb2ludGVyT3ZlckNvbnRhaW5lcjogZXZlbnQuaXNQb2ludGVyT3ZlckNvbnRhaW5lcixcbiAgICAgICAgaXRlbTogdGhpcyxcbiAgICAgICAgZGlzdGFuY2U6IGV2ZW50LmRpc3RhbmNlLFxuICAgICAgICBkcm9wUG9pbnQ6IGV2ZW50LmRyb3BQb2ludFxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKiogQXNzaWducyB0aGUgZGVmYXVsdCBpbnB1dCB2YWx1ZXMgYmFzZWQgb24gYSBwcm92aWRlZCBjb25maWcgb2JqZWN0LiAqL1xuICBwcml2YXRlIF9hc3NpZ25EZWZhdWx0cyhjb25maWc6IERyYWdEcm9wQ29uZmlnKSB7XG4gICAgY29uc3Qge1xuICAgICAgbG9ja0F4aXMsIGRyYWdTdGFydERlbGF5LCBjb25zdHJhaW5Qb3NpdGlvbiwgcHJldmlld0NsYXNzLCBib3VuZGFyeUVsZW1lbnQsIGRyYWdnaW5nRGlzYWJsZWQsXG4gICAgICByb290RWxlbWVudFNlbGVjdG9yLCBwcmV2aWV3Q29udGFpbmVyXG4gICAgfSA9IGNvbmZpZztcblxuICAgIHRoaXMuZGlzYWJsZWQgPSBkcmFnZ2luZ0Rpc2FibGVkID09IG51bGwgPyBmYWxzZSA6IGRyYWdnaW5nRGlzYWJsZWQ7XG4gICAgdGhpcy5kcmFnU3RhcnREZWxheSA9IGRyYWdTdGFydERlbGF5IHx8IDA7XG5cbiAgICBpZiAobG9ja0F4aXMpIHtcbiAgICAgIHRoaXMubG9ja0F4aXMgPSBsb2NrQXhpcztcbiAgICB9XG5cbiAgICBpZiAoY29uc3RyYWluUG9zaXRpb24pIHtcbiAgICAgIHRoaXMuY29uc3RyYWluUG9zaXRpb24gPSBjb25zdHJhaW5Qb3NpdGlvbjtcbiAgICB9XG5cbiAgICBpZiAocHJldmlld0NsYXNzKSB7XG4gICAgICB0aGlzLnByZXZpZXdDbGFzcyA9IHByZXZpZXdDbGFzcztcbiAgICB9XG5cbiAgICBpZiAoYm91bmRhcnlFbGVtZW50KSB7XG4gICAgICB0aGlzLmJvdW5kYXJ5RWxlbWVudCA9IGJvdW5kYXJ5RWxlbWVudDtcbiAgICB9XG5cbiAgICBpZiAocm9vdEVsZW1lbnRTZWxlY3Rvcikge1xuICAgICAgdGhpcy5yb290RWxlbWVudFNlbGVjdG9yID0gcm9vdEVsZW1lbnRTZWxlY3RvcjtcbiAgICB9XG5cbiAgICBpZiAocHJldmlld0NvbnRhaW5lcikge1xuICAgICAgdGhpcy5wcmV2aWV3Q29udGFpbmVyID0gcHJldmlld0NvbnRhaW5lcjtcbiAgICB9XG4gIH1cblxuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZGlzYWJsZWQ6IEJvb2xlYW5JbnB1dDtcbn1cblxuLyoqIEdldHMgdGhlIGNsb3Nlc3QgYW5jZXN0b3Igb2YgYW4gZWxlbWVudCB0aGF0IG1hdGNoZXMgYSBzZWxlY3Rvci4gKi9cbmZ1bmN0aW9uIGdldENsb3Nlc3RNYXRjaGluZ0FuY2VzdG9yKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBzZWxlY3Rvcjogc3RyaW5nKSB7XG4gIGxldCBjdXJyZW50RWxlbWVudCA9IGVsZW1lbnQucGFyZW50RWxlbWVudCBhcyBIVE1MRWxlbWVudCB8IG51bGw7XG5cbiAgd2hpbGUgKGN1cnJlbnRFbGVtZW50KSB7XG4gICAgLy8gSUUgZG9lc24ndCBzdXBwb3J0IGBtYXRjaGVzYCBzbyB3ZSBoYXZlIHRvIGZhbGwgYmFjayB0byBgbXNNYXRjaGVzU2VsZWN0b3JgLlxuICAgIGlmIChjdXJyZW50RWxlbWVudC5tYXRjaGVzID8gY3VycmVudEVsZW1lbnQubWF0Y2hlcyhzZWxlY3RvcikgOlxuICAgICAgICAoY3VycmVudEVsZW1lbnQgYXMgYW55KS5tc01hdGNoZXNTZWxlY3RvcihzZWxlY3RvcikpIHtcbiAgICAgIHJldHVybiBjdXJyZW50RWxlbWVudDtcbiAgICB9XG5cbiAgICBjdXJyZW50RWxlbWVudCA9IGN1cnJlbnRFbGVtZW50LnBhcmVudEVsZW1lbnQ7XG4gIH1cblxuICByZXR1cm4gbnVsbDtcbn1cblxuIl19