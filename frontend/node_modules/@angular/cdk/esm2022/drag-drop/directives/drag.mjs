/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directionality } from '@angular/cdk/bidi';
import { DOCUMENT } from '@angular/common';
import { Directive, ElementRef, EventEmitter, Inject, Input, NgZone, Optional, Output, SkipSelf, ViewContainerRef, ChangeDetectorRef, Self, InjectionToken, booleanAttribute, } from '@angular/core';
import { coerceElement, coerceNumberProperty } from '@angular/cdk/coercion';
import { BehaviorSubject, Observable, Subject, merge } from 'rxjs';
import { startWith, take, map, takeUntil, switchMap, tap } from 'rxjs/operators';
import { CDK_DRAG_HANDLE, CdkDragHandle } from './drag-handle';
import { CDK_DRAG_PARENT } from '../drag-parent';
import { DragDrop } from '../drag-drop';
import { CDK_DRAG_CONFIG } from './config';
import { assertElementNode } from './assertions';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/bidi";
import * as i2 from "../drag-drop";
import * as i3 from "./drag-handle";
const DRAG_HOST_CLASS = 'cdk-drag';
/**
 * Injection token that can be used to reference instances of `CdkDropList`. It serves as
 * alternative token to the actual `CdkDropList` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
export const CDK_DROP_LIST = new InjectionToken('CdkDropList');
/** Element that can be moved inside a CdkDropList container. */
export class CdkDrag {
    static { this._dragInstances = []; }
    /** Whether starting to drag this element is disabled. */
    get disabled() {
        return this._disabled || (this.dropContainer && this.dropContainer.disabled);
    }
    set disabled(value) {
        this._disabled = value;
        this._dragRef.disabled = this._disabled;
    }
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
        this._handles = new BehaviorSubject([]);
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
            const subscription = this._dragRef.moved
                .pipe(map(movedEvent => ({
                source: this,
                pointerPosition: movedEvent.pointerPosition,
                event: movedEvent.event,
                delta: movedEvent.delta,
                distance: movedEvent.distance,
            })))
                .subscribe(observer);
            return () => {
                subscription.unsubscribe();
            };
        });
        this._dragRef = dragDrop.createDrag(element, {
            dragStartThreshold: config && config.dragStartThreshold != null ? config.dragStartThreshold : 5,
            pointerDirectionChangeThreshold: config && config.pointerDirectionChangeThreshold != null
                ? config.pointerDirectionChangeThreshold
                : 5,
            zIndex: config?.zIndex,
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
    /**
     * Sets the current position in pixels the draggable outside of a drop container.
     * @param value New position to be set.
     */
    setFreeDragPosition(value) {
        this._dragRef.setFreeDragPosition(value);
    }
    ngAfterViewInit() {
        // Normally this isn't in the zone, but it can cause major performance regressions for apps
        // using `zone-patch-rxjs` because it'll trigger a change detection when it unsubscribes.
        this._ngZone.runOutsideAngular(() => {
            // We need to wait for the zone to stabilize, in order for the reference
            // element to be in the proper place in the DOM. This is mostly relevant
            // for draggable elements inside portals since they get stamped out in
            // their original DOM position and then they get transferred to the portal.
            this._ngZone.onStable.pipe(take(1), takeUntil(this._destroyed)).subscribe(() => {
                this._updateRootElement();
                this._setupHandlesListener();
                if (this.freeDragPosition) {
                    this._dragRef.setFreeDragPosition(this.freeDragPosition);
                }
            });
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
        // Unnecessary in most cases, but used to avoid extra change detections with `zone-paths-rxjs`.
        this._ngZone.runOutsideAngular(() => {
            this._handles.complete();
            this._destroyed.next();
            this._destroyed.complete();
            this._dragRef.dispose();
        });
    }
    _addHandle(handle) {
        const handles = this._handles.getValue();
        handles.push(handle);
        this._handles.next(handles);
    }
    _removeHandle(handle) {
        const handles = this._handles.getValue();
        const index = handles.indexOf(handle);
        if (index > -1) {
            handles.splice(index, 1);
            this._handles.next(handles);
        }
    }
    _setPreviewTemplate(preview) {
        this._previewTemplate = preview;
    }
    _resetPreviewTemplate(preview) {
        if (preview === this._previewTemplate) {
            this._previewTemplate = null;
        }
    }
    _setPlaceholderTemplate(placeholder) {
        this._placeholderTemplate = placeholder;
    }
    _resetPlaceholderTemplate(placeholder) {
        if (placeholder === this._placeholderTemplate) {
            this._placeholderTemplate = null;
        }
    }
    /** Syncs the root element with the `DragRef`. */
    _updateRootElement() {
        const element = this.element.nativeElement;
        let rootElement = element;
        if (this.rootElementSelector) {
            rootElement =
                element.closest !== undefined
                    ? element.closest(this.rootElementSelector)
                    : // Comment tag doesn't have closest method, so use parent's one.
                        element.parentElement?.closest(this.rootElementSelector);
        }
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
            return this.element.nativeElement.closest(boundary);
        }
        return coerceElement(boundary);
    }
    /** Syncs the inputs of the CdkDrag with the options of the underlying DragRef. */
    _syncInputs(ref) {
        ref.beforeStarted.subscribe(() => {
            if (!ref.isDragging()) {
                const dir = this._dir;
                const dragStartDelay = this.dragStartDelay;
                const placeholder = this._placeholderTemplate
                    ? {
                        template: this._placeholderTemplate.templateRef,
                        context: this._placeholderTemplate.data,
                        viewContainer: this._viewContainerRef,
                    }
                    : null;
                const preview = this._previewTemplate
                    ? {
                        template: this._previewTemplate.templateRef,
                        context: this._previewTemplate.data,
                        matchSize: this._previewTemplate.matchSize,
                        viewContainer: this._viewContainerRef,
                    }
                    : null;
                ref.disabled = this.disabled;
                ref.lockAxis = this.lockAxis;
                ref.dragStartDelay =
                    typeof dragStartDelay === 'object' && dragStartDelay
                        ? dragStartDelay
                        : coerceNumberProperty(dragStartDelay);
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
            // If we managed to resolve a parent through DI, use it.
            if (this._parentDrag) {
                ref.withParent(this._parentDrag._dragRef);
                return;
            }
            // Otherwise fall back to resolving the parent by looking up the DOM. This can happen if
            // the item was projected into another item by something like `ngTemplateOutlet`.
            let parent = this.element.nativeElement.parentElement;
            while (parent) {
                if (parent.classList.contains(DRAG_HOST_CLASS)) {
                    ref.withParent(CdkDrag._dragInstances.find(drag => {
                        return drag.element.nativeElement === parent;
                    })?._dragRef || null);
                    break;
                }
                parent = parent.parentElement;
            }
        });
    }
    /** Handles the events from the underlying `DragRef`. */
    _handleEvents(ref) {
        ref.started.subscribe(startEvent => {
            this.started.emit({ source: this, event: startEvent.event });
            // Since all of these events run outside of change detection,
            // we need to ensure that everything is marked correctly.
            this._changeDetectorRef.markForCheck();
        });
        ref.released.subscribe(releaseEvent => {
            this.released.emit({ source: this, event: releaseEvent.event });
        });
        ref.ended.subscribe(endEvent => {
            this.ended.emit({
                source: this,
                distance: endEvent.distance,
                dropPoint: endEvent.dropPoint,
                event: endEvent.event,
            });
            // Since all of these events run outside of change detection,
            // we need to ensure that everything is marked correctly.
            this._changeDetectorRef.markForCheck();
        });
        ref.entered.subscribe(enterEvent => {
            this.entered.emit({
                container: enterEvent.container.data,
                item: this,
                currentIndex: enterEvent.currentIndex,
            });
        });
        ref.exited.subscribe(exitEvent => {
            this.exited.emit({
                container: exitEvent.container.data,
                item: this,
            });
        });
        ref.dropped.subscribe(dropEvent => {
            this.dropped.emit({
                previousIndex: dropEvent.previousIndex,
                currentIndex: dropEvent.currentIndex,
                previousContainer: dropEvent.previousContainer.data,
                container: dropEvent.container.data,
                isPointerOverContainer: dropEvent.isPointerOverContainer,
                item: this,
                distance: dropEvent.distance,
                dropPoint: dropEvent.dropPoint,
                event: dropEvent.event,
            });
        });
    }
    /** Assigns the default input values based on a provided config object. */
    _assignDefaults(config) {
        const { lockAxis, dragStartDelay, constrainPosition, previewClass, boundaryElement, draggingDisabled, rootElementSelector, previewContainer, } = config;
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
    /** Sets up the listener that syncs the handles with the drag ref. */
    _setupHandlesListener() {
        // Listen for any newly-added handles.
        this._handles
            .pipe(
        // Sync the new handles with the DragRef.
        tap(handles => {
            const handleElements = handles.map(handle => handle.element);
            // Usually handles are only allowed to be a descendant of the drag element, but if
            // the consumer defined a different drag root, we should allow the drag element
            // itself to be a handle too.
            if (this._selfHandle && this.rootElementSelector) {
                handleElements.push(this.element);
            }
            this._dragRef.withHandles(handleElements);
        }), 
        // Listen if the state of any of the handles changes.
        switchMap((handles) => {
            return merge(...handles.map(item => item._stateChanges.pipe(startWith(item))));
        }), takeUntil(this._destroyed))
            .subscribe(handleInstance => {
            // Enabled/disable the handle that changed in the DragRef.
            const dragRef = this._dragRef;
            const handle = handleInstance.element.nativeElement;
            handleInstance.disabled ? dragRef.disableHandle(handle) : dragRef.enableHandle(handle);
        });
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.2.0", ngImport: i0, type: CdkDrag, deps: [{ token: i0.ElementRef }, { token: CDK_DROP_LIST, optional: true, skipSelf: true }, { token: DOCUMENT }, { token: i0.NgZone }, { token: i0.ViewContainerRef }, { token: CDK_DRAG_CONFIG, optional: true }, { token: i1.Directionality, optional: true }, { token: i2.DragDrop }, { token: i0.ChangeDetectorRef }, { token: CDK_DRAG_HANDLE, optional: true, self: true }, { token: CDK_DRAG_PARENT, optional: true, skipSelf: true }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "17.2.0", type: CdkDrag, isStandalone: true, selector: "[cdkDrag]", inputs: { data: ["cdkDragData", "data"], lockAxis: ["cdkDragLockAxis", "lockAxis"], rootElementSelector: ["cdkDragRootElement", "rootElementSelector"], boundaryElement: ["cdkDragBoundary", "boundaryElement"], dragStartDelay: ["cdkDragStartDelay", "dragStartDelay"], freeDragPosition: ["cdkDragFreeDragPosition", "freeDragPosition"], disabled: ["cdkDragDisabled", "disabled", booleanAttribute], constrainPosition: ["cdkDragConstrainPosition", "constrainPosition"], previewClass: ["cdkDragPreviewClass", "previewClass"], previewContainer: ["cdkDragPreviewContainer", "previewContainer"] }, outputs: { started: "cdkDragStarted", released: "cdkDragReleased", ended: "cdkDragEnded", entered: "cdkDragEntered", exited: "cdkDragExited", dropped: "cdkDragDropped", moved: "cdkDragMoved" }, host: { properties: { "class.cdk-drag-disabled": "disabled", "class.cdk-drag-dragging": "_dragRef.isDragging()" }, classAttribute: "cdk-drag" }, providers: [{ provide: CDK_DRAG_PARENT, useExisting: CdkDrag }], exportAs: ["cdkDrag"], usesOnChanges: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.2.0", ngImport: i0, type: CdkDrag, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkDrag]',
                    exportAs: 'cdkDrag',
                    standalone: true,
                    host: {
                        'class': DRAG_HOST_CLASS,
                        '[class.cdk-drag-disabled]': 'disabled',
                        '[class.cdk-drag-dragging]': '_dragRef.isDragging()',
                    },
                    providers: [{ provide: CDK_DRAG_PARENT, useExisting: CdkDrag }],
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [CDK_DROP_LIST]
                }, {
                    type: Optional
                }, {
                    type: SkipSelf
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }, { type: i0.NgZone }, { type: i0.ViewContainerRef }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [CDK_DRAG_CONFIG]
                }] }, { type: i1.Directionality, decorators: [{
                    type: Optional
                }] }, { type: i2.DragDrop }, { type: i0.ChangeDetectorRef }, { type: i3.CdkDragHandle, decorators: [{
                    type: Optional
                }, {
                    type: Self
                }, {
                    type: Inject,
                    args: [CDK_DRAG_HANDLE]
                }] }, { type: CdkDrag, decorators: [{
                    type: Optional
                }, {
                    type: SkipSelf
                }, {
                    type: Inject,
                    args: [CDK_DRAG_PARENT]
                }] }], propDecorators: { data: [{
                type: Input,
                args: ['cdkDragData']
            }], lockAxis: [{
                type: Input,
                args: ['cdkDragLockAxis']
            }], rootElementSelector: [{
                type: Input,
                args: ['cdkDragRootElement']
            }], boundaryElement: [{
                type: Input,
                args: ['cdkDragBoundary']
            }], dragStartDelay: [{
                type: Input,
                args: ['cdkDragStartDelay']
            }], freeDragPosition: [{
                type: Input,
                args: ['cdkDragFreeDragPosition']
            }], disabled: [{
                type: Input,
                args: [{ alias: 'cdkDragDisabled', transform: booleanAttribute }]
            }], constrainPosition: [{
                type: Input,
                args: ['cdkDragConstrainPosition']
            }], previewClass: [{
                type: Input,
                args: ['cdkDragPreviewClass']
            }], previewContainer: [{
                type: Input,
                args: ['cdkDragPreviewContainer']
            }], started: [{
                type: Output,
                args: ['cdkDragStarted']
            }], released: [{
                type: Output,
                args: ['cdkDragReleased']
            }], ended: [{
                type: Output,
                args: ['cdkDragEnded']
            }], entered: [{
                type: Output,
                args: ['cdkDragEntered']
            }], exited: [{
                type: Output,
                args: ['cdkDragExited']
            }], dropped: [{
                type: Output,
                args: ['cdkDragDropped']
            }], moved: [{
                type: Output,
                args: ['cdkDragMoved']
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJhZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvZHJhZy1kcm9wL2RpcmVjdGl2ZXMvZHJhZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDakQsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQ3pDLE9BQU8sRUFFTCxTQUFTLEVBQ1QsVUFBVSxFQUNWLFlBQVksRUFDWixNQUFNLEVBQ04sS0FBSyxFQUNMLE1BQU0sRUFFTixRQUFRLEVBQ1IsTUFBTSxFQUNOLFFBQVEsRUFDUixnQkFBZ0IsRUFHaEIsaUJBQWlCLEVBQ2pCLElBQUksRUFDSixjQUFjLEVBQ2QsZ0JBQWdCLEdBQ2pCLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBQyxhQUFhLEVBQUUsb0JBQW9CLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUMxRSxPQUFPLEVBQUMsZUFBZSxFQUFFLFVBQVUsRUFBWSxPQUFPLEVBQUUsS0FBSyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQzNFLE9BQU8sRUFBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBVS9FLE9BQU8sRUFBQyxlQUFlLEVBQUUsYUFBYSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRzdELE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUcvQyxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBQ3RDLE9BQU8sRUFBQyxlQUFlLEVBQTJDLE1BQU0sVUFBVSxDQUFDO0FBQ25GLE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLGNBQWMsQ0FBQzs7Ozs7QUFFL0MsTUFBTSxlQUFlLEdBQUcsVUFBVSxDQUFDO0FBRW5D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O2dCQVNmLEtBQUs7c0JBRGIsTUFBTTt1QkFBQyxjQUFjIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aW9uYWxpdHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcbmltcG9ydCB7RE9DVU1FTlR9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge1xuICBBZnRlclZpZXdJbml0LFxuICBEaXJlY3RpdmUsXG4gIEVsZW1lbnRSZWYsXG4gIEV2ZW50RW1pdHRlcixcbiAgSW5qZWN0LFxuICBJbnB1dCxcbiAgTmdab25lLFxuICBPbkRlc3Ryb3ksXG4gIE9wdGlvbmFsLFxuICBPdXRwdXQsXG4gIFNraXBTZWxmLFxuICBWaWV3Q29udGFpbmVyUmVmLFxuICBPbkNoYW5nZXMsXG4gIFNpbXBsZUNoYW5nZXMsXG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBTZWxmLFxuICBJbmplY3Rpb25Ub2tlbixcbiAgYm9vbGVhbkF0dHJpYnV0ZSxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge2NvZXJjZUVsZW1lbnQsIGNvZXJjZU51bWJlclByb3BlcnR5fSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xuaW1wb3J0IHtCZWhhdmlvclN1YmplY3QsIE9ic2VydmFibGUsIE9ic2VydmVyLCBTdWJqZWN0LCBtZXJnZX0gZnJvbSAncnhqcyc7XG5pbXBvcnQge3N0YXJ0V2l0aCwgdGFrZSwgbWFwLCB0YWtlVW50aWwsIHN3aXRjaE1hcCwgdGFwfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQgdHlwZSB7XG4gIENka0RyYWdEcm9wLFxuICBDZGtEcmFnRW5kLFxuICBDZGtEcmFnRW50ZXIsXG4gIENka0RyYWdFeGl0LFxuICBDZGtEcmFnTW92ZSxcbiAgQ2RrRHJhZ1N0YXJ0LFxuICBDZGtEcmFnUmVsZWFzZSxcbn0gZnJvbSAnLi4vZHJhZy1ldmVudHMnO1xuaW1wb3J0IHtDREtfRFJBR19IQU5ETEUsIENka0RyYWdIYW5kbGV9IGZyb20gJy4vZHJhZy1oYW5kbGUnO1xuaW1wb3J0IHtDZGtEcmFnUGxhY2Vob2xkZXJ9IGZyb20gJy4vZHJhZy1wbGFjZWhvbGRlcic7XG5pbXBvcnQge0Nka0RyYWdQcmV2aWV3fSBmcm9tICcuL2RyYWctcHJldmlldyc7XG5pbXBvcnQge0NES19EUkFHX1BBUkVOVH0gZnJvbSAnLi4vZHJhZy1wYXJlbnQnO1xuaW1wb3J0IHtEcmFnUmVmLCBQb2ludCwgUHJldmlld0NvbnRhaW5lcn0gZnJvbSAnLi4vZHJhZy1yZWYnO1xuaW1wb3J0IHR5cGUge0Nka0Ryb3BMaXN0fSBmcm9tICcuL2Ryb3AtbGlzdCc7XG5pbXBvcnQge0RyYWdEcm9wfSBmcm9tICcuLi9kcmFnLWRyb3AnO1xuaW1wb3J0IHtDREtfRFJBR19DT05GSUcsIERyYWdEcm9wQ29uZmlnLCBEcmFnU3RhcnREZWxheSwgRHJhZ0F4aXN9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7YXNzZXJ0RWxlbWVudE5vZGV9IGZyb20gJy4vYXNzZXJ0aW9ucyc7XG5cbmNvbnN0IERSQUdfSE9TVF9DTEFTUyA9ICdjZGstZHJhZyc7XG5cbi8qKlxuICogSW5qZWN0aW9uIHRva2VuIHRoYXQgY2FuIGJlIHVzZWQgdG8gcmVmZXJlbmNlIGluc3RhbmNlcyBvZiBgQ2RrRHJvcExpc3RgLiBJdCBzZXJ2ZXMgYXNcbiAqIGFsdGVybmF0aXZlIHRva2VuIHRvIHRoZSBhY3R1YWwgYENka0Ryb3BMaXN0YCBjbGFzcyB3aGljaCBjb3VsZCBjYXVzZSB1bm5lY2Vzc2FyeVxuICogcmV0ZW50aW9uIG9mIHRoZSBjbGFzcyBhbmQgaXRzIGRpcmVjdGl2ZSBtZXRhZGF0YS5cbiAqL1xuZXhwb3J0IGNvbnN0IENES19EUk9QX0xJU1QgPSBuZXcgSW5qZWN0aW9uVG9rZW48Q2RrRHJvcExpc3Q+KCdDZGtEcm9wTGlzdCcpO1xuXG4vKiogRWxlbWVudCB0aGF0IGNhbiBiZSBtb3ZlZCBpbnNpZGUgYSBDZGtEcm9wTGlzdCBjb250YWluZXIuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrRHJhZ10nLFxuICBleHBvcnRBczogJ2Nka0RyYWcnLFxuICBzdGFuZGFsb25lOiB0cnVlLFxuICBob3N0OiB7XG4gICAgJ2NsYXNzJzogRFJBR19IT1NUX0NMQVNTLFxuICAgICdbY2xhc3MuY2RrLWRyYWctZGlzYWJsZWRdJzogJ2Rpc2FibGVkJyxcbiAgICAnW2NsYXNzLmNkay1kcmFnLWRyYWdnaW5nXSc6ICdfZHJhZ1JlZi5pc0RyYWdnaW5nKCknLFxuICB9LFxuICBwcm92aWRlcnM6IFt7cHJvdmlkZTogQ0RLX0RSQUdfUEFSRU5ULCB1c2VFeGlzdGluZzogQ2RrRHJhZ31dLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtEcmFnPFQgPSBhbnk+IGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCwgT25DaGFuZ2VzLCBPbkRlc3Ryb3kge1xuICBwcml2YXRlIHJlYWRvbmx5IF9kZXN0cm95ZWQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuICBwcml2YXRlIHN0YXRpYyBfZHJhZ0luc3RhbmNlczogQ2RrRHJhZ1tdID0gW107XG4gIHByaXZhdGUgX2hhbmRsZXMgPSBuZXcgQmVoYXZpb3JTdWJqZWN0PENka0RyYWdIYW5kbGVbXT4oW10pO1xuICBwcml2YXRlIF9wcmV2aWV3VGVtcGxhdGU6IENka0RyYWdQcmV2aWV3IHwgbnVsbDtcbiAgcHJpdmF0ZSBfcGxhY2Vob2xkZXJUZW1wbGF0ZTogQ2RrRHJhZ1BsYWNlaG9sZGVyIHwgbnVsbDtcblxuICAvKiogUmVmZXJlbmNlIHRvIHRoZSB1bmRlcmx5aW5nIGRyYWcgaW5zdGFuY2UuICovXG4gIF9kcmFnUmVmOiBEcmFnUmVmPENka0RyYWc8VD4+O1xuXG4gIC8qKiBBcmJpdHJhcnkgZGF0YSB0byBhdHRhY2ggdG8gdGhpcyBkcmFnIGluc3RhbmNlLiAqL1xuICBASW5wdXQoJ2Nka0RyYWdEYXRhJykgZGF0YTogVDtcblxuICAvKiogTG9ja3MgdGhlIHBvc2l0aW9uIG9mIHRoZSBkcmFnZ2VkIGVsZW1lbnQgYWxvbmcgdGhlIHNwZWNpZmllZCBheGlzLiAqL1xuICBASW5wdXQoJ2Nka0RyYWdMb2NrQXhpcycpIGxvY2tBeGlzOiBEcmFnQXhpcztcblxuICAvKipcbiAgICogU2VsZWN0b3IgdGhhdCB3aWxsIGJlIHVzZWQgdG8gZGV0ZXJtaW5lIHRoZSByb290IGRyYWdnYWJsZSBlbGVtZW50LCBzdGFydGluZyBmcm9tXG4gICAqIHRoZSBgY2RrRHJhZ2AgZWxlbWVudCBhbmQgZ29pbmcgdXAgdGhlIERPTS4gUGFzc2luZyBhbiBhbHRlcm5hdGUgcm9vdCBlbGVtZW50IGlzIHVzZWZ1bFxuICAgKiB3aGVuIHRyeWluZyB0byBlbmFibGUgZHJhZ2dpbmcgb24gYW4gZWxlbWVudCB0aGF0IHlvdSBtaWdodCBub3QgaGF2ZSBhY2Nlc3MgdG8uXG4gICAqL1xuICBASW5wdXQoJ2Nka0RyYWdSb290RWxlbWVudCcpIHJvb3RFbGVtZW50U2VsZWN0b3I6IHN0cmluZztcblxuICAvKipcbiAgICogTm9kZSBvciBzZWxlY3RvciB0aGF0IHdpbGwgYmUgdXNlZCB0byBkZXRlcm1pbmUgdGhlIGVsZW1lbnQgdG8gd2hpY2ggdGhlIGRyYWdnYWJsZSdzXG4gICAqIHBvc2l0aW9uIHdpbGwgYmUgY29uc3RyYWluZWQuIElmIGEgc3RyaW5nIGlzIHBhc3NlZCBpbiwgaXQnbGwgYmUgdXNlZCBhcyBhIHNlbGVjdG9yIHRoYXRcbiAgICogd2lsbCBiZSBtYXRjaGVkIHN0YXJ0aW5nIGZyb20gdGhlIGVsZW1lbnQncyBwYXJlbnQgYW5kIGdvaW5nIHVwIHRoZSBET00gdW50aWwgYSBtYXRjaFxuICAgKiBoYXMgYmVlbiBmb3VuZC5cbiAgICovXG4gIEBJbnB1dCgnY2RrRHJhZ0JvdW5kYXJ5JykgYm91bmRhcnlFbGVtZW50OiBzdHJpbmcgfCBFbGVtZW50UmVmPEhUTUxFbGVtZW50PiB8IEhUTUxFbGVtZW50O1xuXG4gIC8qKlxuICAgKiBBbW91bnQgb2YgbWlsbGlzZWNvbmRzIHRvIHdhaXQgYWZ0ZXIgdGhlIHVzZXIgaGFzIHB1dCB0aGVpclxuICAgKiBwb2ludGVyIGRvd24gYmVmb3JlIHN0YXJ0aW5nIHRvIGRyYWcgdGhlIGVsZW1lbnQuXG4gICAqL1xuICBASW5wdXQoJ2Nka0RyYWdTdGFydERlbGF5JykgZHJhZ1N0YXJ0RGVsYXk6IERyYWdTdGFydERlbGF5O1xuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBwb3NpdGlvbiBvZiBhIGBDZGtEcmFnYCB0aGF0IGlzIG91dHNpZGUgb2YgYSBkcm9wIGNvbnRhaW5lci5cbiAgICogQ2FuIGJlIHVzZWQgdG8gcmVzdG9yZSB0aGUgZWxlbWVudCdzIHBvc2l0aW9uIGZvciBhIHJldHVybmluZyB1c2VyLlxuICAgKi9cbiAgQElucHV0KCdjZGtEcmFnRnJlZURyYWdQb3NpdGlvbicpIGZyZWVEcmFnUG9zaXRpb246IFBvaW50O1xuXG4gIC8qKiBXaGV0aGVyIHN0YXJ0aW5nIHRvIGRyYWcgdGhpcyBlbGVtZW50IGlzIGRpc2FibGVkLiAqL1xuICBASW5wdXQoe2FsaWFzOiAnY2RrRHJhZ0Rpc2FibGVkJywgdHJhbnNmb3JtOiBib29sZWFuQXR0cmlidXRlfSlcbiAgZ2V0IGRpc2FibGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9kaXNhYmxlZCB8fCAodGhpcy5kcm9wQ29udGFpbmVyICYmIHRoaXMuZHJvcENvbnRhaW5lci5kaXNhYmxlZCk7XG4gIH1cbiAgc2V0IGRpc2FibGVkKHZhbHVlOiBib29sZWFuKSB7XG4gICAgdGhpcy5fZGlzYWJsZWQgPSB2YWx1ZTtcbiAgICB0aGlzLl9kcmFnUmVmLmRpc2FibGVkID0gdGhpcy5fZGlzYWJsZWQ7XG4gIH1cbiAgcHJpdmF0ZSBfZGlzYWJsZWQ6IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIEZ1bmN0aW9uIHRoYXQgY2FuIGJlIHVzZWQgdG8gY3VzdG9taXplIHRoZSBsb2dpYyBvZiBob3cgdGhlIHBvc2l0aW9uIG9mIHRoZSBkcmFnIGl0ZW1cbiAgICogaXMgbGltaXRlZCB3aGlsZSBpdCdzIGJlaW5nIGRyYWdnZWQuIEdldHMgY2FsbGVkIHdpdGggYSBwb2ludCBjb250YWluaW5nIHRoZSBjdXJyZW50IHBvc2l0aW9uXG4gICAqIG9mIHRoZSB1c2VyJ3MgcG9pbnRlciBvbiB0aGUgcGFnZSwgYSByZWZlcmVuY2UgdG8gdGhlIGl0ZW0gYmVpbmcgZHJhZ2dlZCBhbmQgaXRzIGRpbWVuc2lvbnMuXG4gICAqIFNob3VsZCByZXR1cm4gYSBwb2ludCBkZXNjcmliaW5nIHdoZXJlIHRoZSBpdGVtIHNob3VsZCBiZSByZW5kZXJlZC5cbiAgICovXG4gIEBJbnB1dCgnY2RrRHJhZ0NvbnN0cmFpblBvc2l0aW9uJykgY29uc3RyYWluUG9zaXRpb24/OiAoXG4gICAgdXNlclBvaW50ZXJQb3NpdGlvbjogUG9pbnQsXG4gICAgZHJhZ1JlZjogRHJhZ1JlZixcbiAgICBkaW1lbnNpb25zOiBET01SZWN0LFxuICAgIHBpY2t1cFBvc2l0aW9uSW5FbGVtZW50OiBQb2ludCxcbiAgKSA9PiBQb2ludDtcblxuICAvKiogQ2xhc3MgdG8gYmUgYWRkZWQgdG8gdGhlIHByZXZpZXcgZWxlbWVudC4gKi9cbiAgQElucHV0KCdjZGtEcmFnUHJldmlld0NsYXNzJykgcHJldmlld0NsYXNzOiBzdHJpbmcgfCBzdHJpbmdbXTtcblxuICAvKipcbiAgICogQ29uZmlndXJlcyB0aGUgcGxhY2UgaW50byB3aGljaCB0aGUgcHJldmlldyBvZiB0aGUgaXRlbSB3aWxsIGJlIGluc2VydGVkLiBDYW4gYmUgY29uZmlndXJlZFxuICAgKiBnbG9iYWxseSB0aHJvdWdoIGBDREtfRFJPUF9MSVNUYC4gUG9zc2libGUgdmFsdWVzOlxuICAgKiAtIGBnbG9iYWxgIC0gUHJldmlldyB3aWxsIGJlIGluc2VydGVkIGF0IHRoZSBib3R0b20gb2YgdGhlIGA8Ym9keT5gLiBUaGUgYWR2YW50YWdlIGlzIHRoYXRcbiAgICogeW91IGRvbid0IGhhdmUgdG8gd29ycnkgYWJvdXQgYG92ZXJmbG93OiBoaWRkZW5gIG9yIGB6LWluZGV4YCwgYnV0IHRoZSBpdGVtIHdvbid0IHJldGFpblxuICAgKiBpdHMgaW5oZXJpdGVkIHN0eWxlcy5cbiAgICogLSBgcGFyZW50YCAtIFByZXZpZXcgd2lsbCBiZSBpbnNlcnRlZCBpbnRvIHRoZSBwYXJlbnQgb2YgdGhlIGRyYWcgaXRlbS4gVGhlIGFkdmFudGFnZSBpcyB0aGF0XG4gICAqIGluaGVyaXRlZCBzdHlsZXMgd2lsbCBiZSBwcmVzZXJ2ZWQsIGJ1dCBpdCBtYXkgYmUgY2xpcHBlZCBieSBgb3ZlcmZsb3c6IGhpZGRlbmAgb3Igbm90IGJlXG4gICAqIHZpc2libGUgZHVlIHRvIGB6LWluZGV4YC4gRnVydGhlcm1vcmUsIHRoZSBwcmV2aWV3IGlzIGdvaW5nIHRvIGhhdmUgYW4gZWZmZWN0IG92ZXIgc2VsZWN0b3JzXG4gICAqIGxpa2UgYDpudGgtY2hpbGRgIGFuZCBzb21lIGZsZXhib3ggY29uZmlndXJhdGlvbnMuXG4gICAqIC0gYEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+IHwgSFRNTEVsZW1lbnRgIC0gUHJldmlldyB3aWxsIGJlIGluc2VydGVkIGludG8gYSBzcGVjaWZpYyBlbGVtZW50LlxuICAgKiBTYW1lIGFkdmFudGFnZXMgYW5kIGRpc2FkdmFudGFnZXMgYXMgYHBhcmVudGAuXG4gICAqL1xuICBASW5wdXQoJ2Nka0RyYWdQcmV2aWV3Q29udGFpbmVyJykgcHJldmlld0NvbnRhaW5lcjogUHJldmlld0NvbnRhaW5lcjtcblxuICAvKiogRW1pdHMgd2hlbiB0aGUgdXNlciBzdGFydHMgZHJhZ2dpbmcgdGhlIGl0ZW0uICovXG4gIEBPdXRwdXQoJ2Nka0RyYWdTdGFydGVkJykgcmVhZG9ubHkgc3RhcnRlZDogRXZlbnRFbWl0dGVyPENka0RyYWdTdGFydD4gPVxuICAgIG5ldyBFdmVudEVtaXR0ZXI8Q2RrRHJhZ1N0YXJ0PigpO1xuXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSB1c2VyIGhhcyByZWxlYXNlZCBhIGRyYWcgaXRlbSwgYmVmb3JlIGFueSBhbmltYXRpb25zIGhhdmUgc3RhcnRlZC4gKi9cbiAgQE91dHB1dCgnY2RrRHJhZ1JlbGVhc2VkJykgcmVhZG9ubHkgcmVsZWFzZWQ6IEV2ZW50RW1pdHRlcjxDZGtEcmFnUmVsZWFzZT4gPVxuICAgIG5ldyBFdmVudEVtaXR0ZXI8Q2RrRHJhZ1JlbGVhc2U+KCk7XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhlIHVzZXIgc3RvcHMgZHJhZ2dpbmcgYW4gaXRlbSBpbiB0aGUgY29udGFpbmVyLiAqL1xuICBAT3V0cHV0KCdjZGtEcmFnRW5kZWQnKSByZWFkb25seSBlbmRlZDogRXZlbnRFbWl0dGVyPENka0RyYWdFbmQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZGtEcmFnRW5kPigpO1xuXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSB1c2VyIGhhcyBtb3ZlZCB0aGUgaXRlbSBpbnRvIGEgbmV3IGNvbnRhaW5lci4gKi9cbiAgQE91dHB1dCgnY2RrRHJhZ0VudGVyZWQnKSByZWFkb25seSBlbnRlcmVkOiBFdmVudEVtaXR0ZXI8Q2RrRHJhZ0VudGVyPGFueT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxcbiAgICBDZGtEcmFnRW50ZXI8YW55PlxuICA+KCk7XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhlIHVzZXIgcmVtb3ZlcyB0aGUgaXRlbSBpdHMgY29udGFpbmVyIGJ5IGRyYWdnaW5nIGl0IGludG8gYW5vdGhlciBjb250YWluZXIuICovXG4gIEBPdXRwdXQoJ2Nka0RyYWdFeGl0ZWQnKSByZWFkb25seSBleGl0ZWQ6IEV2ZW50RW1pdHRlcjxDZGtEcmFnRXhpdDxhbnk+PiA9IG5ldyBFdmVudEVtaXR0ZXI8XG4gICAgQ2RrRHJhZ0V4aXQ8YW55PlxuICA+KCk7XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhlIHVzZXIgZHJvcHMgdGhlIGl0ZW0gaW5zaWRlIGEgY29udGFpbmVyLiAqL1xuICBAT3V0cHV0KCdjZGtEcmFnRHJvcHBlZCcpIHJlYWRvbmx5IGRyb3BwZWQ6IEV2ZW50RW1pdHRlcjxDZGtEcmFnRHJvcDxhbnk+PiA9IG5ldyBFdmVudEVtaXR0ZXI8XG4gICAgQ2RrRHJhZ0Ryb3A8YW55PlxuICA+KCk7XG5cbiAgLyoqXG4gICAqIEVtaXRzIGFzIHRoZSB1c2VyIGlzIGRyYWdnaW5nIHRoZSBpdGVtLiBVc2Ugd2l0aCBjYXV0aW9uLFxuICAgKiBiZWNhdXNlIHRoaXMgZXZlbnQgd2lsbCBmaXJlIGZvciBldmVyeSBwaXhlbCB0aGF0IHRoZSB1c2VyIGhhcyBkcmFnZ2VkLlxuICAgKi9cbiAgQE91dHB1dCgnY2RrRHJhZ01vdmVkJylcbiAgcmVhZG9ubHkgbW92ZWQ6IE9ic2VydmFibGU8Q2RrRHJhZ01vdmU8VD4+ID0gbmV3IE9ic2VydmFibGUoXG4gICAgKG9ic2VydmVyOiBPYnNlcnZlcjxDZGtEcmFnTW92ZTxUPj4pID0+IHtcbiAgICAgIGNvbnN0IHN1YnNjcmlwdGlvbiA9IHRoaXMuX2RyYWdSZWYubW92ZWRcbiAgICAgICAgLnBpcGUoXG4gICAgICAgICAgbWFwKG1vdmVkRXZlbnQgPT4gKHtcbiAgICAgICAgICAgIHNvdXJjZTogdGhpcyxcbiAgICAgICAgICAgIHBvaW50ZXJQb3NpdGlvbjogbW92ZWRFdmVudC5wb2ludGVyUG9zaXRpb24sXG4gICAgICAgICAgICBldmVudDogbW92ZWRFdmVudC5ldmVudCxcbiAgICAgICAgICAgIGRlbHRhOiBtb3ZlZEV2ZW50LmRlbHRhLFxuICAgICAgICAgICAgZGlzdGFuY2U6IG1vdmVkRXZlbnQuZGlzdGFuY2UsXG4gICAgICAgICAgfSkpLFxuICAgICAgICApXG4gICAgICAgIC5zdWJzY3JpYmUob2JzZXJ2ZXIpO1xuXG4gICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICBzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICAgIH07XG4gICAgfSxcbiAgKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAvKiogRWxlbWVudCB0aGF0IHRoZSBkcmFnZ2FibGUgaXMgYXR0YWNoZWQgdG8uICovXG4gICAgcHVibGljIGVsZW1lbnQ6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+LFxuICAgIC8qKiBEcm9wcGFibGUgY29udGFpbmVyIHRoYXQgdGhlIGRyYWdnYWJsZSBpcyBhIHBhcnQgb2YuICovXG4gICAgQEluamVjdChDREtfRFJPUF9MSVNUKSBAT3B0aW9uYWwoKSBAU2tpcFNlbGYoKSBwdWJsaWMgZHJvcENvbnRhaW5lcjogQ2RrRHJvcExpc3QsXG4gICAgLyoqXG4gICAgICogQGRlcHJlY2F0ZWQgYF9kb2N1bWVudGAgcGFyYW1ldGVyIG5vIGxvbmdlciBiZWluZyB1c2VkIGFuZCB3aWxsIGJlIHJlbW92ZWQuXG4gICAgICogQGJyZWFraW5nLWNoYW5nZSAxMi4wLjBcbiAgICAgKi9cbiAgICBASW5qZWN0KERPQ1VNRU5UKSBfZG9jdW1lbnQ6IGFueSxcbiAgICBwcml2YXRlIF9uZ1pvbmU6IE5nWm9uZSxcbiAgICBwcml2YXRlIF92aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmLFxuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoQ0RLX0RSQUdfQ09ORklHKSBjb25maWc6IERyYWdEcm9wQ29uZmlnLFxuICAgIEBPcHRpb25hbCgpIHByaXZhdGUgX2RpcjogRGlyZWN0aW9uYWxpdHksXG4gICAgZHJhZ0Ryb3A6IERyYWdEcm9wLFxuICAgIHByaXZhdGUgX2NoYW5nZURldGVjdG9yUmVmOiBDaGFuZ2VEZXRlY3RvclJlZixcbiAgICBAT3B0aW9uYWwoKSBAU2VsZigpIEBJbmplY3QoQ0RLX0RSQUdfSEFORExFKSBwcml2YXRlIF9zZWxmSGFuZGxlPzogQ2RrRHJhZ0hhbmRsZSxcbiAgICBAT3B0aW9uYWwoKSBAU2tpcFNlbGYoKSBASW5qZWN0KENES19EUkFHX1BBUkVOVCkgcHJpdmF0ZSBfcGFyZW50RHJhZz86IENka0RyYWcsXG4gICkge1xuICAgIHRoaXMuX2RyYWdSZWYgPSBkcmFnRHJvcC5jcmVhdGVEcmFnKGVsZW1lbnQsIHtcbiAgICAgIGRyYWdTdGFydFRocmVzaG9sZDpcbiAgICAgICAgY29uZmlnICYmIGNvbmZpZy5kcmFnU3RhcnRUaHJlc2hvbGQgIT0gbnVsbCA/IGNvbmZpZy5kcmFnU3RhcnRUaHJlc2hvbGQgOiA1LFxuICAgICAgcG9pbnRlckRpcmVjdGlvbkNoYW5nZVRocmVzaG9sZDpcbiAgICAgICAgY29uZmlnICYmIGNvbmZpZy5wb2ludGVyRGlyZWN0aW9uQ2hhbmdlVGhyZXNob2xkICE9IG51bGxcbiAgICAgICAgICA/IGNvbmZpZy5wb2ludGVyRGlyZWN0aW9uQ2hhbmdlVGhyZXNob2xkXG4gICAgICAgICAgOiA1LFxuICAgICAgekluZGV4OiBjb25maWc/LnpJbmRleCxcbiAgICB9KTtcbiAgICB0aGlzLl9kcmFnUmVmLmRhdGEgPSB0aGlzO1xuXG4gICAgLy8gV2UgaGF2ZSB0byBrZWVwIHRyYWNrIG9mIHRoZSBkcmFnIGluc3RhbmNlcyBpbiBvcmRlciB0byBiZSBhYmxlIHRvIG1hdGNoIGFuIGVsZW1lbnQgdG9cbiAgICAvLyBhIGRyYWcgaW5zdGFuY2UuIFdlIGNhbid0IGdvIHRocm91Z2ggdGhlIGdsb2JhbCByZWdpc3RyeSBvZiBgRHJhZ1JlZmAsIGJlY2F1c2UgdGhlIHJvb3RcbiAgICAvLyBlbGVtZW50IGNvdWxkIGJlIGRpZmZlcmVudC5cbiAgICBDZGtEcmFnLl9kcmFnSW5zdGFuY2VzLnB1c2godGhpcyk7XG5cbiAgICBpZiAoY29uZmlnKSB7XG4gICAgICB0aGlzLl9hc3NpZ25EZWZhdWx0cyhjb25maWcpO1xuICAgIH1cblxuICAgIC8vIE5vdGUgdGhhdCB1c3VhbGx5IHRoZSBjb250YWluZXIgaXMgYXNzaWduZWQgd2hlbiB0aGUgZHJvcCBsaXN0IGlzIHBpY2tzIHVwIHRoZSBpdGVtLCBidXQgaW5cbiAgICAvLyBzb21lIGNhc2VzIChtYWlubHkgdHJhbnNwbGFudGVkIHZpZXdzIHdpdGggT25QdXNoLCBzZWUgIzE4MzQxKSB3ZSBtYXkgZW5kIHVwIGluIGEgc2l0dWF0aW9uXG4gICAgLy8gd2hlcmUgdGhlcmUgYXJlIG5vIGl0ZW1zIG9uIHRoZSBmaXJzdCBjaGFuZ2UgZGV0ZWN0aW9uIHBhc3MsIGJ1dCB0aGUgaXRlbXMgZ2V0IHBpY2tlZCB1cCBhc1xuICAgIC8vIHNvb24gYXMgdGhlIHVzZXIgdHJpZ2dlcnMgYW5vdGhlciBwYXNzIGJ5IGRyYWdnaW5nLiBUaGlzIGlzIGEgcHJvYmxlbSwgYmVjYXVzZSB0aGUgaXRlbSB3b3VsZFxuICAgIC8vIGhhdmUgdG8gc3dpdGNoIGZyb20gc3RhbmRhbG9uZSBtb2RlIHRvIGRyYWcgbW9kZSBpbiB0aGUgbWlkZGxlIG9mIHRoZSBkcmFnZ2luZyBzZXF1ZW5jZSB3aGljaFxuICAgIC8vIGlzIHRvbyBsYXRlIHNpbmNlIHRoZSB0d28gbW9kZXMgc2F2ZSBkaWZmZXJlbnQga2luZHMgb2YgaW5mb3JtYXRpb24uIFdlIHdvcmsgYXJvdW5kIGl0IGJ5XG4gICAgLy8gYXNzaWduaW5nIHRoZSBkcm9wIGNvbnRhaW5lciBib3RoIGZyb20gaGVyZSBhbmQgdGhlIGxpc3QuXG4gICAgaWYgKGRyb3BDb250YWluZXIpIHtcbiAgICAgIHRoaXMuX2RyYWdSZWYuX3dpdGhEcm9wQ29udGFpbmVyKGRyb3BDb250YWluZXIuX2Ryb3BMaXN0UmVmKTtcbiAgICAgIGRyb3BDb250YWluZXIuYWRkSXRlbSh0aGlzKTtcbiAgICB9XG5cbiAgICB0aGlzLl9zeW5jSW5wdXRzKHRoaXMuX2RyYWdSZWYpO1xuICAgIHRoaXMuX2hhbmRsZUV2ZW50cyh0aGlzLl9kcmFnUmVmKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBlbGVtZW50IHRoYXQgaXMgYmVpbmcgdXNlZCBhcyBhIHBsYWNlaG9sZGVyXG4gICAqIHdoaWxlIHRoZSBjdXJyZW50IGVsZW1lbnQgaXMgYmVpbmcgZHJhZ2dlZC5cbiAgICovXG4gIGdldFBsYWNlaG9sZGVyRWxlbWVudCgpOiBIVE1MRWxlbWVudCB7XG4gICAgcmV0dXJuIHRoaXMuX2RyYWdSZWYuZ2V0UGxhY2Vob2xkZXJFbGVtZW50KCk7XG4gIH1cblxuICAvKiogUmV0dXJucyB0aGUgcm9vdCBkcmFnZ2FibGUgZWxlbWVudC4gKi9cbiAgZ2V0Um9vdEVsZW1lbnQoKTogSFRNTEVsZW1lbnQge1xuICAgIHJldHVybiB0aGlzLl9kcmFnUmVmLmdldFJvb3RFbGVtZW50KCk7XG4gIH1cblxuICAvKiogUmVzZXRzIGEgc3RhbmRhbG9uZSBkcmFnIGl0ZW0gdG8gaXRzIGluaXRpYWwgcG9zaXRpb24uICovXG4gIHJlc2V0KCk6IHZvaWQge1xuICAgIHRoaXMuX2RyYWdSZWYucmVzZXQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBwaXhlbCBjb29yZGluYXRlcyBvZiB0aGUgZHJhZ2dhYmxlIG91dHNpZGUgb2YgYSBkcm9wIGNvbnRhaW5lci5cbiAgICovXG4gIGdldEZyZWVEcmFnUG9zaXRpb24oKTogUmVhZG9ubHk8UG9pbnQ+IHtcbiAgICByZXR1cm4gdGhpcy5fZHJhZ1JlZi5nZXRGcmVlRHJhZ1Bvc2l0aW9uKCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgY3VycmVudCBwb3NpdGlvbiBpbiBwaXhlbHMgdGhlIGRyYWdnYWJsZSBvdXRzaWRlIG9mIGEgZHJvcCBjb250YWluZXIuXG4gICAqIEBwYXJhbSB2YWx1ZSBOZXcgcG9zaXRpb24gdG8gYmUgc2V0LlxuICAgKi9cbiAgc2V0RnJlZURyYWdQb3NpdGlvbih2YWx1ZTogUG9pbnQpOiB2b2lkIHtcbiAgICB0aGlzLl9kcmFnUmVmLnNldEZyZWVEcmFnUG9zaXRpb24odmFsdWUpO1xuICB9XG5cbiAgbmdBZnRlclZpZXdJbml0KCkge1xuICAgIC8vIE5vcm1hbGx5IHRoaXMgaXNuJ3QgaW4gdGhlIHpvbmUsIGJ1dCBpdCBjYW4gY2F1c2UgbWFqb3IgcGVyZm9ybWFuY2UgcmVncmVzc2lvbnMgZm9yIGFwcHNcbiAgICAvLyB1c2luZyBgem9uZS1wYXRjaC1yeGpzYCBiZWNhdXNlIGl0J2xsIHRyaWdnZXIgYSBjaGFuZ2UgZGV0ZWN0aW9uIHdoZW4gaXQgdW5zdWJzY3JpYmVzLlxuICAgIHRoaXMuX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICAvLyBXZSBuZWVkIHRvIHdhaXQgZm9yIHRoZSB6b25lIHRvIHN0YWJpbGl6ZSwgaW4gb3JkZXIgZm9yIHRoZSByZWZlcmVuY2VcbiAgICAgIC8vIGVsZW1lbnQgdG8gYmUgaW4gdGhlIHByb3BlciBwbGFjZSBpbiB0aGUgRE9NLiBUaGlzIGlzIG1vc3RseSByZWxldmFudFxuICAgICAgLy8gZm9yIGRyYWdnYWJsZSBlbGVtZW50cyBpbnNpZGUgcG9ydGFscyBzaW5jZSB0aGV5IGdldCBzdGFtcGVkIG91dCBpblxuICAgICAgLy8gdGhlaXIgb3JpZ2luYWwgRE9NIHBvc2l0aW9uIGFuZCB0aGVuIHRoZXkgZ2V0IHRyYW5zZmVycmVkIHRvIHRoZSBwb3J0YWwuXG4gICAgICB0aGlzLl9uZ1pvbmUub25TdGFibGUucGlwZSh0YWtlKDEpLCB0YWtlVW50aWwodGhpcy5fZGVzdHJveWVkKSkuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgdGhpcy5fdXBkYXRlUm9vdEVsZW1lbnQoKTtcbiAgICAgICAgdGhpcy5fc2V0dXBIYW5kbGVzTGlzdGVuZXIoKTtcblxuICAgICAgICBpZiAodGhpcy5mcmVlRHJhZ1Bvc2l0aW9uKSB7XG4gICAgICAgICAgdGhpcy5fZHJhZ1JlZi5zZXRGcmVlRHJhZ1Bvc2l0aW9uKHRoaXMuZnJlZURyYWdQb3NpdGlvbik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykge1xuICAgIGNvbnN0IHJvb3RTZWxlY3RvckNoYW5nZSA9IGNoYW5nZXNbJ3Jvb3RFbGVtZW50U2VsZWN0b3InXTtcbiAgICBjb25zdCBwb3NpdGlvbkNoYW5nZSA9IGNoYW5nZXNbJ2ZyZWVEcmFnUG9zaXRpb24nXTtcblxuICAgIC8vIFdlIGRvbid0IGhhdmUgdG8gcmVhY3QgdG8gdGhlIGZpcnN0IGNoYW5nZSBzaW5jZSBpdCdzIGJlaW5nXG4gICAgLy8gaGFuZGxlZCBpbiBgbmdBZnRlclZpZXdJbml0YCB3aGVyZSBpdCBuZWVkcyB0byBiZSBkZWZlcnJlZC5cbiAgICBpZiAocm9vdFNlbGVjdG9yQ2hhbmdlICYmICFyb290U2VsZWN0b3JDaGFuZ2UuZmlyc3RDaGFuZ2UpIHtcbiAgICAgIHRoaXMuX3VwZGF0ZVJvb3RFbGVtZW50KCk7XG4gICAgfVxuXG4gICAgLy8gU2tpcCB0aGUgZmlyc3QgY2hhbmdlIHNpbmNlIGl0J3MgYmVpbmcgaGFuZGxlZCBpbiBgbmdBZnRlclZpZXdJbml0YC5cbiAgICBpZiAocG9zaXRpb25DaGFuZ2UgJiYgIXBvc2l0aW9uQ2hhbmdlLmZpcnN0Q2hhbmdlICYmIHRoaXMuZnJlZURyYWdQb3NpdGlvbikge1xuICAgICAgdGhpcy5fZHJhZ1JlZi5zZXRGcmVlRHJhZ1Bvc2l0aW9uKHRoaXMuZnJlZURyYWdQb3NpdGlvbik7XG4gICAgfVxuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgaWYgKHRoaXMuZHJvcENvbnRhaW5lcikge1xuICAgICAgdGhpcy5kcm9wQ29udGFpbmVyLnJlbW92ZUl0ZW0odGhpcyk7XG4gICAgfVxuXG4gICAgY29uc3QgaW5kZXggPSBDZGtEcmFnLl9kcmFnSW5zdGFuY2VzLmluZGV4T2YodGhpcyk7XG4gICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgIENka0RyYWcuX2RyYWdJbnN0YW5jZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9XG5cbiAgICAvLyBVbm5lY2Vzc2FyeSBpbiBtb3N0IGNhc2VzLCBidXQgdXNlZCB0byBhdm9pZCBleHRyYSBjaGFuZ2UgZGV0ZWN0aW9ucyB3aXRoIGB6b25lLXBhdGhzLXJ4anNgLlxuICAgIHRoaXMuX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICB0aGlzLl9oYW5kbGVzLmNvbXBsZXRlKCk7XG4gICAgICB0aGlzLl9kZXN0cm95ZWQubmV4dCgpO1xuICAgICAgdGhpcy5fZGVzdHJveWVkLmNvbXBsZXRlKCk7XG4gICAgICB0aGlzLl9kcmFnUmVmLmRpc3Bvc2UoKTtcbiAgICB9KTtcbiAgfVxuXG4gIF9hZGRIYW5kbGUoaGFuZGxlOiBDZGtEcmFnSGFuZGxlKSB7XG4gICAgY29uc3QgaGFuZGxlcyA9IHRoaXMuX2hhbmRsZXMuZ2V0VmFsdWUoKTtcbiAgICBoYW5kbGVzLnB1c2goaGFuZGxlKTtcbiAgICB0aGlzLl9oYW5kbGVzLm5leHQoaGFuZGxlcyk7XG4gIH1cblxuICBfcmVtb3ZlSGFuZGxlKGhhbmRsZTogQ2RrRHJhZ0hhbmRsZSkge1xuICAgIGNvbnN0IGhhbmRsZXMgPSB0aGlzLl9oYW5kbGVzLmdldFZhbHVlKCk7XG4gICAgY29uc3QgaW5kZXggPSBoYW5kbGVzLmluZGV4T2YoaGFuZGxlKTtcblxuICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICBoYW5kbGVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICB0aGlzLl9oYW5kbGVzLm5leHQoaGFuZGxlcyk7XG4gICAgfVxuICB9XG5cbiAgX3NldFByZXZpZXdUZW1wbGF0ZShwcmV2aWV3OiBDZGtEcmFnUHJldmlldykge1xuICAgIHRoaXMuX3ByZXZpZXdUZW1wbGF0ZSA9IHByZXZpZXc7XG4gIH1cblxuICBfcmVzZXRQcmV2aWV3VGVtcGxhdGUocHJldmlldzogQ2RrRHJhZ1ByZXZpZXcpIHtcbiAgICBpZiAocHJldmlldyA9PT0gdGhpcy5fcHJldmlld1RlbXBsYXRlKSB7XG4gICAgICB0aGlzLl9wcmV2aWV3VGVtcGxhdGUgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIF9zZXRQbGFjZWhvbGRlclRlbXBsYXRlKHBsYWNlaG9sZGVyOiBDZGtEcmFnUGxhY2Vob2xkZXIpIHtcbiAgICB0aGlzLl9wbGFjZWhvbGRlclRlbXBsYXRlID0gcGxhY2Vob2xkZXI7XG4gIH1cblxuICBfcmVzZXRQbGFjZWhvbGRlclRlbXBsYXRlKHBsYWNlaG9sZGVyOiBDZGtEcmFnUGxhY2Vob2xkZXIpIHtcbiAgICBpZiAocGxhY2Vob2xkZXIgPT09IHRoaXMuX3BsYWNlaG9sZGVyVGVtcGxhdGUpIHtcbiAgICAgIHRoaXMuX3BsYWNlaG9sZGVyVGVtcGxhdGUgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBTeW5jcyB0aGUgcm9vdCBlbGVtZW50IHdpdGggdGhlIGBEcmFnUmVmYC4gKi9cbiAgcHJpdmF0ZSBfdXBkYXRlUm9vdEVsZW1lbnQoKSB7XG4gICAgY29uc3QgZWxlbWVudCA9IHRoaXMuZWxlbWVudC5uYXRpdmVFbGVtZW50IGFzIEhUTUxFbGVtZW50O1xuICAgIGxldCByb290RWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgaWYgKHRoaXMucm9vdEVsZW1lbnRTZWxlY3Rvcikge1xuICAgICAgcm9vdEVsZW1lbnQgPVxuICAgICAgICBlbGVtZW50LmNsb3Nlc3QgIT09IHVuZGVmaW5lZFxuICAgICAgICAgID8gKGVsZW1lbnQuY2xvc2VzdCh0aGlzLnJvb3RFbGVtZW50U2VsZWN0b3IpIGFzIEhUTUxFbGVtZW50KVxuICAgICAgICAgIDogLy8gQ29tbWVudCB0YWcgZG9lc24ndCBoYXZlIGNsb3Nlc3QgbWV0aG9kLCBzbyB1c2UgcGFyZW50J3Mgb25lLlxuICAgICAgICAgICAgKGVsZW1lbnQucGFyZW50RWxlbWVudD8uY2xvc2VzdCh0aGlzLnJvb3RFbGVtZW50U2VsZWN0b3IpIGFzIEhUTUxFbGVtZW50KTtcbiAgICB9XG5cbiAgICBpZiAocm9vdEVsZW1lbnQgJiYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkpIHtcbiAgICAgIGFzc2VydEVsZW1lbnROb2RlKHJvb3RFbGVtZW50LCAnY2RrRHJhZycpO1xuICAgIH1cblxuICAgIHRoaXMuX2RyYWdSZWYud2l0aFJvb3RFbGVtZW50KHJvb3RFbGVtZW50IHx8IGVsZW1lbnQpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIGJvdW5kYXJ5IGVsZW1lbnQsIGJhc2VkIG9uIHRoZSBgYm91bmRhcnlFbGVtZW50YCB2YWx1ZS4gKi9cbiAgcHJpdmF0ZSBfZ2V0Qm91bmRhcnlFbGVtZW50KCkge1xuICAgIGNvbnN0IGJvdW5kYXJ5ID0gdGhpcy5ib3VuZGFyeUVsZW1lbnQ7XG5cbiAgICBpZiAoIWJvdW5kYXJ5KSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGJvdW5kYXJ5ID09PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudC5uYXRpdmVFbGVtZW50LmNsb3Nlc3Q8SFRNTEVsZW1lbnQ+KGJvdW5kYXJ5KTtcbiAgICB9XG5cbiAgICByZXR1cm4gY29lcmNlRWxlbWVudChib3VuZGFyeSk7XG4gIH1cblxuICAvKiogU3luY3MgdGhlIGlucHV0cyBvZiB0aGUgQ2RrRHJhZyB3aXRoIHRoZSBvcHRpb25zIG9mIHRoZSB1bmRlcmx5aW5nIERyYWdSZWYuICovXG4gIHByaXZhdGUgX3N5bmNJbnB1dHMocmVmOiBEcmFnUmVmPENka0RyYWc8VD4+KSB7XG4gICAgcmVmLmJlZm9yZVN0YXJ0ZWQuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgIGlmICghcmVmLmlzRHJhZ2dpbmcoKSkge1xuICAgICAgICBjb25zdCBkaXIgPSB0aGlzLl9kaXI7XG4gICAgICAgIGNvbnN0IGRyYWdTdGFydERlbGF5ID0gdGhpcy5kcmFnU3RhcnREZWxheTtcbiAgICAgICAgY29uc3QgcGxhY2Vob2xkZXIgPSB0aGlzLl9wbGFjZWhvbGRlclRlbXBsYXRlXG4gICAgICAgICAgPyB7XG4gICAgICAgICAgICAgIHRlbXBsYXRlOiB0aGlzLl9wbGFjZWhvbGRlclRlbXBsYXRlLnRlbXBsYXRlUmVmLFxuICAgICAgICAgICAgICBjb250ZXh0OiB0aGlzLl9wbGFjZWhvbGRlclRlbXBsYXRlLmRhdGEsXG4gICAgICAgICAgICAgIHZpZXdDb250YWluZXI6IHRoaXMuX3ZpZXdDb250YWluZXJSZWYsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgOiBudWxsO1xuICAgICAgICBjb25zdCBwcmV2aWV3ID0gdGhpcy5fcHJldmlld1RlbXBsYXRlXG4gICAgICAgICAgPyB7XG4gICAgICAgICAgICAgIHRlbXBsYXRlOiB0aGlzLl9wcmV2aWV3VGVtcGxhdGUudGVtcGxhdGVSZWYsXG4gICAgICAgICAgICAgIGNvbnRleHQ6IHRoaXMuX3ByZXZpZXdUZW1wbGF0ZS5kYXRhLFxuICAgICAgICAgICAgICBtYXRjaFNpemU6IHRoaXMuX3ByZXZpZXdUZW1wbGF0ZS5tYXRjaFNpemUsXG4gICAgICAgICAgICAgIHZpZXdDb250YWluZXI6IHRoaXMuX3ZpZXdDb250YWluZXJSZWYsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgOiBudWxsO1xuXG4gICAgICAgIHJlZi5kaXNhYmxlZCA9IHRoaXMuZGlzYWJsZWQ7XG4gICAgICAgIHJlZi5sb2NrQXhpcyA9IHRoaXMubG9ja0F4aXM7XG4gICAgICAgIHJlZi5kcmFnU3RhcnREZWxheSA9XG4gICAgICAgICAgdHlwZW9mIGRyYWdTdGFydERlbGF5ID09PSAnb2JqZWN0JyAmJiBkcmFnU3RhcnREZWxheVxuICAgICAgICAgICAgPyBkcmFnU3RhcnREZWxheVxuICAgICAgICAgICAgOiBjb2VyY2VOdW1iZXJQcm9wZXJ0eShkcmFnU3RhcnREZWxheSk7XG4gICAgICAgIHJlZi5jb25zdHJhaW5Qb3NpdGlvbiA9IHRoaXMuY29uc3RyYWluUG9zaXRpb247XG4gICAgICAgIHJlZi5wcmV2aWV3Q2xhc3MgPSB0aGlzLnByZXZpZXdDbGFzcztcbiAgICAgICAgcmVmXG4gICAgICAgICAgLndpdGhCb3VuZGFyeUVsZW1lbnQodGhpcy5fZ2V0Qm91bmRhcnlFbGVtZW50KCkpXG4gICAgICAgICAgLndpdGhQbGFjZWhvbGRlclRlbXBsYXRlKHBsYWNlaG9sZGVyKVxuICAgICAgICAgIC53aXRoUHJldmlld1RlbXBsYXRlKHByZXZpZXcpXG4gICAgICAgICAgLndpdGhQcmV2aWV3Q29udGFpbmVyKHRoaXMucHJldmlld0NvbnRhaW5lciB8fCAnZ2xvYmFsJyk7XG5cbiAgICAgICAgaWYgKGRpcikge1xuICAgICAgICAgIHJlZi53aXRoRGlyZWN0aW9uKGRpci52YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIFRoaXMgb25seSBuZWVkcyB0byBiZSByZXNvbHZlZCBvbmNlLlxuICAgIHJlZi5iZWZvcmVTdGFydGVkLnBpcGUodGFrZSgxKSkuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgIC8vIElmIHdlIG1hbmFnZWQgdG8gcmVzb2x2ZSBhIHBhcmVudCB0aHJvdWdoIERJLCB1c2UgaXQuXG4gICAgICBpZiAodGhpcy5fcGFyZW50RHJhZykge1xuICAgICAgICByZWYud2l0aFBhcmVudCh0aGlzLl9wYXJlbnREcmFnLl9kcmFnUmVmKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBPdGhlcndpc2UgZmFsbCBiYWNrIHRvIHJlc29sdmluZyB0aGUgcGFyZW50IGJ5IGxvb2tpbmcgdXAgdGhlIERPTS4gVGhpcyBjYW4gaGFwcGVuIGlmXG4gICAgICAvLyB0aGUgaXRlbSB3YXMgcHJvamVjdGVkIGludG8gYW5vdGhlciBpdGVtIGJ5IHNvbWV0aGluZyBsaWtlIGBuZ1RlbXBsYXRlT3V0bGV0YC5cbiAgICAgIGxldCBwYXJlbnQgPSB0aGlzLmVsZW1lbnQubmF0aXZlRWxlbWVudC5wYXJlbnRFbGVtZW50O1xuICAgICAgd2hpbGUgKHBhcmVudCkge1xuICAgICAgICBpZiAocGFyZW50LmNsYXNzTGlzdC5jb250YWlucyhEUkFHX0hPU1RfQ0xBU1MpKSB7XG4gICAgICAgICAgcmVmLndpdGhQYXJlbnQoXG4gICAgICAgICAgICBDZGtEcmFnLl9kcmFnSW5zdGFuY2VzLmZpbmQoZHJhZyA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiBkcmFnLmVsZW1lbnQubmF0aXZlRWxlbWVudCA9PT0gcGFyZW50O1xuICAgICAgICAgICAgfSk/Ll9kcmFnUmVmIHx8IG51bGwsXG4gICAgICAgICAgKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBwYXJlbnQgPSBwYXJlbnQucGFyZW50RWxlbWVudDtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBIYW5kbGVzIHRoZSBldmVudHMgZnJvbSB0aGUgdW5kZXJseWluZyBgRHJhZ1JlZmAuICovXG4gIHByaXZhdGUgX2hhbmRsZUV2ZW50cyhyZWY6IERyYWdSZWY8Q2RrRHJhZzxUPj4pIHtcbiAgICByZWYuc3RhcnRlZC5zdWJzY3JpYmUoc3RhcnRFdmVudCA9PiB7XG4gICAgICB0aGlzLnN0YXJ0ZWQuZW1pdCh7c291cmNlOiB0aGlzLCBldmVudDogc3RhcnRFdmVudC5ldmVudH0pO1xuXG4gICAgICAvLyBTaW5jZSBhbGwgb2YgdGhlc2UgZXZlbnRzIHJ1biBvdXRzaWRlIG9mIGNoYW5nZSBkZXRlY3Rpb24sXG4gICAgICAvLyB3ZSBuZWVkIHRvIGVuc3VyZSB0aGF0IGV2ZXJ5dGhpbmcgaXMgbWFya2VkIGNvcnJlY3RseS5cbiAgICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xuICAgIH0pO1xuXG4gICAgcmVmLnJlbGVhc2VkLnN1YnNjcmliZShyZWxlYXNlRXZlbnQgPT4ge1xuICAgICAgdGhpcy5yZWxlYXNlZC5lbWl0KHtzb3VyY2U6IHRoaXMsIGV2ZW50OiByZWxlYXNlRXZlbnQuZXZlbnR9KTtcbiAgICB9KTtcblxuICAgIHJlZi5lbmRlZC5zdWJzY3JpYmUoZW5kRXZlbnQgPT4ge1xuICAgICAgdGhpcy5lbmRlZC5lbWl0KHtcbiAgICAgICAgc291cmNlOiB0aGlzLFxuICAgICAgICBkaXN0YW5jZTogZW5kRXZlbnQuZGlzdGFuY2UsXG4gICAgICAgIGRyb3BQb2ludDogZW5kRXZlbnQuZHJvcFBvaW50LFxuICAgICAgICBldmVudDogZW5kRXZlbnQuZXZlbnQsXG4gICAgICB9KTtcblxuICAgICAgLy8gU2luY2UgYWxsIG9mIHRoZXNlIGV2ZW50cyBydW4gb3V0c2lkZSBvZiBjaGFuZ2UgZGV0ZWN0aW9uLFxuICAgICAgLy8gd2UgbmVlZCB0byBlbnN1cmUgdGhhdCBldmVyeXRoaW5nIGlzIG1hcmtlZCBjb3JyZWN0bHkuXG4gICAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKTtcbiAgICB9KTtcblxuICAgIHJlZi5lbnRlcmVkLnN1YnNjcmliZShlbnRlckV2ZW50ID0+IHtcbiAgICAgIHRoaXMuZW50ZXJlZC5lbWl0KHtcbiAgICAgICAgY29udGFpbmVyOiBlbnRlckV2ZW50LmNvbnRhaW5lci5kYXRhLFxuICAgICAgICBpdGVtOiB0aGlzLFxuICAgICAgICBjdXJyZW50SW5kZXg6IGVudGVyRXZlbnQuY3VycmVudEluZGV4LFxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICByZWYuZXhpdGVkLnN1YnNjcmliZShleGl0RXZlbnQgPT4ge1xuICAgICAgdGhpcy5leGl0ZWQuZW1pdCh7XG4gICAgICAgIGNvbnRhaW5lcjogZXhpdEV2ZW50LmNvbnRhaW5lci5kYXRhLFxuICAgICAgICBpdGVtOiB0aGlzLFxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICByZWYuZHJvcHBlZC5zdWJzY3JpYmUoZHJvcEV2ZW50ID0+IHtcbiAgICAgIHRoaXMuZHJvcHBlZC5lbWl0KHtcbiAgICAgICAgcHJldmlvdXNJbmRleDogZHJvcEV2ZW50LnByZXZpb3VzSW5kZXgsXG4gICAgICAgIGN1cnJlbnRJbmRleDogZHJvcEV2ZW50LmN1cnJlbnRJbmRleCxcbiAgICAgICAgcHJldmlvdXNDb250YWluZXI6IGRyb3BFdmVudC5wcmV2aW91c0NvbnRhaW5lci5kYXRhLFxuICAgICAgICBjb250YWluZXI6IGRyb3BFdmVudC5jb250YWluZXIuZGF0YSxcbiAgICAgICAgaXNQb2ludGVyT3ZlckNvbnRhaW5lcjogZHJvcEV2ZW50LmlzUG9pbnRlck92ZXJDb250YWluZXIsXG4gICAgICAgIGl0ZW06IHRoaXMsXG4gICAgICAgIGRpc3RhbmNlOiBkcm9wRXZlbnQuZGlzdGFuY2UsXG4gICAgICAgIGRyb3BQb2ludDogZHJvcEV2ZW50LmRyb3BQb2ludCxcbiAgICAgICAgZXZlbnQ6IGRyb3BFdmVudC5ldmVudCxcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqIEFzc2lnbnMgdGhlIGRlZmF1bHQgaW5wdXQgdmFsdWVzIGJhc2VkIG9uIGEgcHJvdmlkZWQgY29uZmlnIG9iamVjdC4gKi9cbiAgcHJpdmF0ZSBfYXNzaWduRGVmYXVsdHMoY29uZmlnOiBEcmFnRHJvcENvbmZpZykge1xuICAgIGNvbnN0IHtcbiAgICAgIGxvY2tBeGlzLFxuICAgICAgZHJhZ1N0YXJ0RGVsYXksXG4gICAgICBjb25zdHJhaW5Qb3NpdGlvbixcbiAgICAgIHByZXZpZXdDbGFzcyxcbiAgICAgIGJvdW5kYXJ5RWxlbWVudCxcbiAgICAgIGRyYWdnaW5nRGlzYWJsZWQsXG4gICAgICByb290RWxlbWVudFNlbGVjdG9yLFxuICAgICAgcHJldmlld0NvbnRhaW5lcixcbiAgICB9ID0gY29uZmlnO1xuXG4gICAgdGhpcy5kaXNhYmxlZCA9IGRyYWdnaW5nRGlzYWJsZWQgPT0gbnVsbCA/IGZhbHNlIDogZHJhZ2dpbmdEaXNhYmxlZDtcbiAgICB0aGlzLmRyYWdTdGFydERlbGF5ID0gZHJhZ1N0YXJ0RGVsYXkgfHwgMDtcblxuICAgIGlmIChsb2NrQXhpcykge1xuICAgICAgdGhpcy5sb2NrQXhpcyA9IGxvY2tBeGlzO1xuICAgIH1cblxuICAgIGlmIChjb25zdHJhaW5Qb3NpdGlvbikge1xuICAgICAgdGhpcy5jb25zdHJhaW5Qb3NpdGlvbiA9IGNvbnN0cmFpblBvc2l0aW9uO1xuICAgIH1cblxuICAgIGlmIChwcmV2aWV3Q2xhc3MpIHtcbiAgICAgIHRoaXMucHJldmlld0NsYXNzID0gcHJldmlld0NsYXNzO1xuICAgIH1cblxuICAgIGlmIChib3VuZGFyeUVsZW1lbnQpIHtcbiAgICAgIHRoaXMuYm91bmRhcnlFbGVtZW50ID0gYm91bmRhcnlFbGVtZW50O1xuICAgIH1cblxuICAgIGlmIChyb290RWxlbWVudFNlbGVjdG9yKSB7XG4gICAgICB0aGlzLnJvb3RFbGVtZW50U2VsZWN0b3IgPSByb290RWxlbWVudFNlbGVjdG9yO1xuICAgIH1cblxuICAgIGlmIChwcmV2aWV3Q29udGFpbmVyKSB7XG4gICAgICB0aGlzLnByZXZpZXdDb250YWluZXIgPSBwcmV2aWV3Q29udGFpbmVyO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBTZXRzIHVwIHRoZSBsaXN0ZW5lciB0aGF0IHN5bmNzIHRoZSBoYW5kbGVzIHdpdGggdGhlIGRyYWcgcmVmLiAqL1xuICBwcml2YXRlIF9zZXR1cEhhbmRsZXNMaXN0ZW5lcigpIHtcbiAgICAvLyBMaXN0ZW4gZm9yIGFueSBuZXdseS1hZGRlZCBoYW5kbGVzLlxuICAgIHRoaXMuX2hhbmRsZXNcbiAgICAgIC5waXBlKFxuICAgICAgICAvLyBTeW5jIHRoZSBuZXcgaGFuZGxlcyB3aXRoIHRoZSBEcmFnUmVmLlxuICAgICAgICB0YXAoaGFuZGxlcyA9PiB7XG4gICAgICAgICAgY29uc3QgaGFuZGxlRWxlbWVudHMgPSBoYW5kbGVzLm1hcChoYW5kbGUgPT4gaGFuZGxlLmVsZW1lbnQpO1xuXG4gICAgICAgICAgLy8gVXN1YWxseSBoYW5kbGVzIGFyZSBvbmx5IGFsbG93ZWQgdG8gYmUgYSBkZXNjZW5kYW50IG9mIHRoZSBkcmFnIGVsZW1lbnQsIGJ1dCBpZlxuICAgICAgICAgIC8vIHRoZSBjb25zdW1lciBkZWZpbmVkIGEgZGlmZmVyZW50IGRyYWcgcm9vdCwgd2Ugc2hvdWxkIGFsbG93IHRoZSBkcmFnIGVsZW1lbnRcbiAgICAgICAgICAvLyBpdHNlbGYgdG8gYmUgYSBoYW5kbGUgdG9vLlxuICAgICAgICAgIGlmICh0aGlzLl9zZWxmSGFuZGxlICYmIHRoaXMucm9vdEVsZW1lbnRTZWxlY3Rvcikge1xuICAgICAgICAgICAgaGFuZGxlRWxlbWVudHMucHVzaCh0aGlzLmVsZW1lbnQpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRoaXMuX2RyYWdSZWYud2l0aEhhbmRsZXMoaGFuZGxlRWxlbWVudHMpO1xuICAgICAgICB9KSxcbiAgICAgICAgLy8gTGlzdGVuIGlmIHRoZSBzdGF0ZSBvZiBhbnkgb2YgdGhlIGhhbmRsZXMgY2hhbmdlcy5cbiAgICAgICAgc3dpdGNoTWFwKChoYW5kbGVzOiBDZGtEcmFnSGFuZGxlW10pID0+IHtcbiAgICAgICAgICByZXR1cm4gbWVyZ2UoXG4gICAgICAgICAgICAuLi5oYW5kbGVzLm1hcChpdGVtID0+IGl0ZW0uX3N0YXRlQ2hhbmdlcy5waXBlKHN0YXJ0V2l0aChpdGVtKSkpLFxuICAgICAgICAgICkgYXMgT2JzZXJ2YWJsZTxDZGtEcmFnSGFuZGxlPjtcbiAgICAgICAgfSksXG4gICAgICAgIHRha2VVbnRpbCh0aGlzLl9kZXN0cm95ZWQpLFxuICAgICAgKVxuICAgICAgLnN1YnNjcmliZShoYW5kbGVJbnN0YW5jZSA9PiB7XG4gICAgICAgIC8vIEVuYWJsZWQvZGlzYWJsZSB0aGUgaGFuZGxlIHRoYXQgY2hhbmdlZCBpbiB0aGUgRHJhZ1JlZi5cbiAgICAgICAgY29uc3QgZHJhZ1JlZiA9IHRoaXMuX2RyYWdSZWY7XG4gICAgICAgIGNvbnN0IGhhbmRsZSA9IGhhbmRsZUluc3RhbmNlLmVsZW1lbnQubmF0aXZlRWxlbWVudDtcbiAgICAgICAgaGFuZGxlSW5zdGFuY2UuZGlzYWJsZWQgPyBkcmFnUmVmLmRpc2FibGVIYW5kbGUoaGFuZGxlKSA6IGRyYWdSZWYuZW5hYmxlSGFuZGxlKGhhbmRsZSk7XG4gICAgICB9KTtcbiAgfVxufVxuIl19