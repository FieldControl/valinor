/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { extendStyles, getTransform, matchElementSize, toggleNativeDragInteractions, } from './dom/styling';
import { deepCloneNode } from './dom/clone-node';
import { getRootNode } from './dom/root-node';
import { getTransformTransitionDurationInMs } from './dom/transition-duration';
/** Inline styles to be set as `!important` while dragging. */
const importantProperties = new Set([
    // Needs to be important, because some `mat-table` sets `position: sticky !important`. See #22781.
    'position',
]);
export class PreviewRef {
    constructor(_document, _rootElement, _direction, _initialDomRect, _previewTemplate, _previewClass, _pickupPositionOnPage, _initialTransform, _zIndex) {
        this._document = _document;
        this._rootElement = _rootElement;
        this._direction = _direction;
        this._initialDomRect = _initialDomRect;
        this._previewTemplate = _previewTemplate;
        this._previewClass = _previewClass;
        this._pickupPositionOnPage = _pickupPositionOnPage;
        this._initialTransform = _initialTransform;
        this._zIndex = _zIndex;
    }
    attach(parent) {
        this._preview = this._createPreview();
        parent.appendChild(this._preview);
        // The null check is necessary for browsers that don't support the popover API.
        // Note that we use a string access for compatibility with Closure.
        if ('showPopover' in this._preview) {
            this._preview['showPopover']();
        }
    }
    destroy() {
        this._preview.remove();
        this._previewEmbeddedView?.destroy();
        this._preview = this._previewEmbeddedView = null;
    }
    setTransform(value) {
        this._preview.style.transform = value;
    }
    getBoundingClientRect() {
        return this._preview.getBoundingClientRect();
    }
    addClass(className) {
        this._preview.classList.add(className);
    }
    getTransitionDuration() {
        return getTransformTransitionDurationInMs(this._preview);
    }
    addEventListener(name, handler) {
        this._preview.addEventListener(name, handler);
    }
    removeEventListener(name, handler) {
        this._preview.removeEventListener(name, handler);
    }
    _createPreview() {
        const previewConfig = this._previewTemplate;
        const previewClass = this._previewClass;
        const previewTemplate = previewConfig ? previewConfig.template : null;
        let preview;
        if (previewTemplate && previewConfig) {
            // Measure the element before we've inserted the preview
            // since the insertion could throw off the measurement.
            const rootRect = previewConfig.matchSize ? this._initialDomRect : null;
            const viewRef = previewConfig.viewContainer.createEmbeddedView(previewTemplate, previewConfig.context);
            viewRef.detectChanges();
            preview = getRootNode(viewRef, this._document);
            this._previewEmbeddedView = viewRef;
            if (previewConfig.matchSize) {
                matchElementSize(preview, rootRect);
            }
            else {
                preview.style.transform = getTransform(this._pickupPositionOnPage.x, this._pickupPositionOnPage.y);
            }
        }
        else {
            preview = deepCloneNode(this._rootElement);
            matchElementSize(preview, this._initialDomRect);
            if (this._initialTransform) {
                preview.style.transform = this._initialTransform;
            }
        }
        extendStyles(preview.style, {
            // It's important that we disable the pointer events on the preview, because
            // it can throw off the `document.elementFromPoint` calls in the `CdkDropList`.
            'pointer-events': 'none',
            // We have to reset the margin, because it can throw off positioning relative to the viewport.
            'margin': '0',
            'position': 'fixed',
            'top': '0',
            'left': '0',
            'z-index': this._zIndex + '',
        }, importantProperties);
        toggleNativeDragInteractions(preview, false);
        preview.classList.add('cdk-drag-preview');
        preview.setAttribute('popover', 'manual');
        preview.setAttribute('dir', this._direction);
        if (previewClass) {
            if (Array.isArray(previewClass)) {
                previewClass.forEach(className => preview.classList.add(className));
            }
            else {
                preview.classList.add(previewClass);
            }
        }
        return preview;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJldmlldy1yZWYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL2RyYWctZHJvcC9wcmV2aWV3LXJlZi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFJSCxPQUFPLEVBQ0wsWUFBWSxFQUNaLFlBQVksRUFDWixnQkFBZ0IsRUFDaEIsNEJBQTRCLEdBQzdCLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUMvQyxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDNUMsT0FBTyxFQUFDLGtDQUFrQyxFQUFDLE1BQU0sMkJBQTJCLENBQUM7QUFVN0UsOERBQThEO0FBQzlELE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxHQUFHLENBQUM7SUFDbEMsa0dBQWtHO0lBQ2xHLFVBQVU7Q0FDWCxDQUFDLENBQUM7QUFFSCxNQUFNLE9BQU8sVUFBVTtJQU9yQixZQUNVLFNBQW1CLEVBQ25CLFlBQXlCLEVBQ3pCLFVBQXFCLEVBQ3JCLGVBQXdCLEVBQ3hCLGdCQUE0QyxFQUM1QyxhQUF1QyxFQUN2QyxxQkFHUCxFQUNPLGlCQUFnQyxFQUNoQyxPQUFlO1FBWGYsY0FBUyxHQUFULFNBQVMsQ0FBVTtRQUNuQixpQkFBWSxHQUFaLFlBQVksQ0FBYTtRQUN6QixlQUFVLEdBQVYsVUFBVSxDQUFXO1FBQ3JCLG9CQUFlLEdBQWYsZUFBZSxDQUFTO1FBQ3hCLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBNEI7UUFDNUMsa0JBQWEsR0FBYixhQUFhLENBQTBCO1FBQ3ZDLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FHNUI7UUFDTyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQWU7UUFDaEMsWUFBTyxHQUFQLE9BQU8sQ0FBUTtJQUN0QixDQUFDO0lBRUosTUFBTSxDQUFDLE1BQW1CO1FBQ3hCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFB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QUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtFbWJlZGRlZFZpZXdSZWYsIFRlbXBsYXRlUmVmLCBWaWV3Q29udGFpbmVyUmVmfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7RGlyZWN0aW9ufSBmcm9tICdAYW5ndWxhci9jZGsvYmlkaSc7XG5pbXBvcnQge1xuICBleHRlbmRTdHlsZXMsXG4gIGdldFRyYW5zZm9ybSxcbiAgbWF0Y2hFbGVtZW50U2l6ZSxcbiAgdG9nZ2xlTmF0aXZlRHJhZ0ludGVyYWN0aW9ucyxcbn0gZnJvbSAnLi9kb20vc3R5bGluZyc7XG5pbXBvcnQge2RlZXBDbG9uZU5vZGV9IGZyb20gJy4vZG9tL2Nsb25lLW5vZGUnO1xuaW1wb3J0IHtnZXRSb290Tm9kZX0gZnJvbSAnLi9kb20vcm9vdC1ub2RlJztcbmltcG9ydCB7Z2V0VHJhbnNmb3JtVHJhbnNpdGlvbkR1cmF0aW9uSW5Nc30gZnJvbSAnLi9kb20vdHJhbnNpdGlvbi1kdXJhdGlvbic7XG5cbi8qKiBUZW1wbGF0ZSB0aGF0IGNhbiBiZSB1c2VkIHRvIGNyZWF0ZSBhIGRyYWcgcHJldmlldyBlbGVtZW50LiAqL1xuZXhwb3J0IGludGVyZmFjZSBEcmFnUHJldmlld1RlbXBsYXRlPFQgPSBhbnk+IHtcbiAgbWF0Y2hTaXplPzogYm9vbGVhbjtcbiAgdGVtcGxhdGU6IFRlbXBsYXRlUmVmPFQ+IHwgbnVsbDtcbiAgdmlld0NvbnRhaW5lcjogVmlld0NvbnRhaW5lclJlZjtcbiAgY29udGV4dDogVDtcbn1cblxuLyoqIElubGluZSBzdHlsZXMgdG8gYmUgc2V0IGFzIGAhaW1wb3J0YW50YCB3aGlsZSBkcmFnZ2luZy4gKi9cbmNvbnN0IGltcG9ydGFudFByb3BlcnRpZXMgPSBuZXcgU2V0KFtcbiAgLy8gTmVlZHMgdG8gYmUgaW1wb3J0YW50LCBiZWNhdXNlIHNvbWUgYG1hdC10YWJsZWAgc2V0cyBgcG9zaXRpb246IHN0aWNreSAhaW1wb3J0YW50YC4gU2VlICMyMjc4MS5cbiAgJ3Bvc2l0aW9uJyxcbl0pO1xuXG5leHBvcnQgY2xhc3MgUHJldmlld1JlZiB7XG4gIC8qKiBSZWZlcmVuY2UgdG8gdGhlIHZpZXcgb2YgdGhlIHByZXZpZXcgZWxlbWVudC4gKi9cbiAgcHJpdmF0ZSBfcHJldmlld0VtYmVkZGVkVmlldzogRW1iZWRkZWRWaWV3UmVmPGFueT4gfCBudWxsO1xuXG4gIC8qKiBSZWZlcmVuY2UgdG8gdGhlIHByZXZpZXcgZWxlbWVudC4gKi9cbiAgcHJpdmF0ZSBfcHJldmlldzogSFRNTEVsZW1lbnQ7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBfZG9jdW1lbnQ6IERvY3VtZW50LFxuICAgIHByaXZhdGUgX3Jvb3RFbGVtZW50OiBIVE1MRWxlbWVudCxcbiAgICBwcml2YXRlIF9kaXJlY3Rpb246IERpcmVjdGlvbixcbiAgICBwcml2YXRlIF9pbml0aWFsRG9tUmVjdDogRE9NUmVjdCxcbiAgICBwcml2YXRlIF9wcmV2aWV3VGVtcGxhdGU6IERyYWdQcmV2aWV3VGVtcGxhdGUgfCBudWxsLFxuICAgIHByaXZhdGUgX3ByZXZpZXdDbGFzczogc3RyaW5nIHwgc3RyaW5nW10gfCBudWxsLFxuICAgIHByaXZhdGUgX3BpY2t1cFBvc2l0aW9uT25QYWdlOiB7XG4gICAgICB4OiBudW1iZXI7XG4gICAgICB5OiBudW1iZXI7XG4gICAgfSxcbiAgICBwcml2YXRlIF9pbml0aWFsVHJhbnNmb3JtOiBzdHJpbmcgfCBudWxsLFxuICAgIHByaXZhdGUgX3pJbmRleDogbnVtYmVyLFxuICApIHt9XG5cbiAgYXR0YWNoKHBhcmVudDogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgICB0aGlzLl9wcmV2aWV3ID0gdGhpcy5fY3JlYXRlUHJldmlldygpO1xuICAgIHBhcmVudC5hcHBlbmRDaGlsZCh0aGlzLl9wcmV2aWV3KTtcblxuICAgIC8vIFRoZSBudWxsIGNoZWNrIGlzIG5lY2Vzc2FyeSBmb3IgYnJvd3NlcnMgdGhhdCBkb24ndCBzdXBwb3J0IHRoZSBwb3BvdmVyIEFQSS5cbiAgICAvLyBOb3RlIHRoYXQgd2UgdXNlIGEgc3RyaW5nIGFjY2VzcyBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIENsb3N1cmUuXG4gICAgaWYgKCdzaG93UG9wb3ZlcicgaW4gdGhpcy5fcHJldmlldykge1xuICAgICAgdGhpcy5fcHJldmlld1snc2hvd1BvcG92ZXInXSgpO1xuICAgIH1cbiAgfVxuXG4gIGRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5fcHJldmlldy5yZW1vdmUoKTtcbiAgICB0aGlzLl9wcmV2aWV3RW1iZWRkZWRWaWV3Py5kZXN0cm95KCk7XG4gICAgdGhpcy5fcHJldmlldyA9IHRoaXMuX3ByZXZpZXdFbWJlZGRlZFZpZXcgPSBudWxsITtcbiAgfVxuXG4gIHNldFRyYW5zZm9ybSh2YWx1ZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fcHJldmlldy5zdHlsZS50cmFuc2Zvcm0gPSB2YWx1ZTtcbiAgfVxuXG4gIGdldEJvdW5kaW5nQ2xpZW50UmVjdCgpOiBET01SZWN0IHtcbiAgICByZXR1cm4gdGhpcy5fcHJldmlldy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgfVxuXG4gIGFkZENsYXNzKGNsYXNzTmFtZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fcHJldmlldy5jbGFzc0xpc3QuYWRkKGNsYXNzTmFtZSk7XG4gIH1cblxuICBnZXRUcmFuc2l0aW9uRHVyYXRpb24oKTogbnVtYmVyIHtcbiAgICByZXR1cm4gZ2V0VHJhbnNmb3JtVHJhbnNpdGlvbkR1cmF0aW9uSW5Ncyh0aGlzLl9wcmV2aWV3KTtcbiAgfVxuXG4gIGFkZEV2ZW50TGlzdGVuZXIobmFtZTogc3RyaW5nLCBoYW5kbGVyOiBFdmVudExpc3RlbmVyT3JFdmVudExpc3RlbmVyT2JqZWN0KSB7XG4gICAgdGhpcy5fcHJldmlldy5hZGRFdmVudExpc3RlbmVyKG5hbWUsIGhhbmRsZXIpO1xuICB9XG5cbiAgcmVtb3ZlRXZlbnRMaXN0ZW5lcihuYW1lOiBzdHJpbmcsIGhhbmRsZXI6IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QpIHtcbiAgICB0aGlzLl9wcmV2aWV3LnJlbW92ZUV2ZW50TGlzdGVuZXIobmFtZSwgaGFuZGxlcik7XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVQcmV2aWV3KCk6IEhUTUxFbGVtZW50IHtcbiAgICBjb25zdCBwcmV2aWV3Q29uZmlnID0gdGhpcy5fcHJldmlld1RlbXBsYXRlO1xuICAgIGNvbnN0IHByZXZpZXdDbGFzcyA9IHRoaXMuX3ByZXZpZXdDbGFzcztcbiAgICBjb25zdCBwcmV2aWV3VGVtcGxhdGUgPSBwcmV2aWV3Q29uZmlnID8gcHJldmlld0NvbmZpZy50ZW1wbGF0ZSA6IG51bGw7XG4gICAgbGV0IHByZXZpZXc6IEhUTUxFbGVtZW50O1xuXG4gICAgaWYgKHByZXZpZXdUZW1wbGF0ZSAmJiBwcmV2aWV3Q29uZmlnKSB7XG4gICAgICAvLyBNZWFzdXJlIHRoZSBlbGVtZW50IGJlZm9yZSB3ZSd2ZSBpbnNlcnRlZCB0aGUgcHJldmlld1xuICAgICAgLy8gc2luY2UgdGhlIGluc2VydGlvbiBjb3VsZCB0aHJvdyBvZmYgdGhlIG1lYXN1cmVtZW50LlxuICAgICAgY29uc3Qgcm9vdFJlY3QgPSBwcmV2aWV3Q29uZmlnLm1hdGNoU2l6ZSA/IHRoaXMuX2luaXRpYWxEb21SZWN0IDogbnVsbDtcbiAgICAgIGNvbnN0IHZpZXdSZWYgPSBwcmV2aWV3Q29uZmlnLnZpZXdDb250YWluZXIuY3JlYXRlRW1iZWRkZWRWaWV3KFxuICAgICAgICBwcmV2aWV3VGVtcGxhdGUsXG4gICAgICAgIHByZXZpZXdDb25maWcuY29udGV4dCxcbiAgICAgICk7XG4gICAgICB2aWV3UmVmLmRldGVjdENoYW5nZXMoKTtcbiAgICAgIHByZXZpZXcgPSBnZXRSb290Tm9kZSh2aWV3UmVmLCB0aGlzLl9kb2N1bWVudCk7XG4gICAgICB0aGlzLl9wcmV2aWV3RW1iZWRkZWRWaWV3ID0gdmlld1JlZjtcbiAgICAgIGlmIChwcmV2aWV3Q29uZmlnLm1hdGNoU2l6ZSkge1xuICAgICAgICBtYXRjaEVsZW1lbnRTaXplKHByZXZpZXcsIHJvb3RSZWN0ISk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwcmV2aWV3LnN0eWxlLnRyYW5zZm9ybSA9IGdldFRyYW5zZm9ybShcbiAgICAgICAgICB0aGlzLl9waWNrdXBQb3NpdGlvbk9uUGFnZS54LFxuICAgICAgICAgIHRoaXMuX3BpY2t1cFBvc2l0aW9uT25QYWdlLnksXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHByZXZpZXcgPSBkZWVwQ2xvbmVOb2RlKHRoaXMuX3Jvb3RFbGVtZW50KTtcbiAgICAgIG1hdGNoRWxlbWVudFNpemUocHJldmlldywgdGhpcy5faW5pdGlhbERvbVJlY3QhKTtcblxuICAgICAgaWYgKHRoaXMuX2luaXRpYWxUcmFuc2Zvcm0pIHtcbiAgICAgICAgcHJldmlldy5zdHlsZS50cmFuc2Zvcm0gPSB0aGlzLl9pbml0aWFsVHJhbnNmb3JtO1xuICAgICAgfVxuICAgIH1cblxuICAgIGV4dGVuZFN0eWxlcyhcbiAgICAgIHByZXZpZXcuc3R5bGUsXG4gICAgICB7XG4gICAgICAgIC8vIEl0J3MgaW1wb3J0YW50IHRoYXQgd2UgZGlzYWJsZSB0aGUgcG9pbnRlciBldmVudHMgb24gdGhlIHByZXZpZXcsIGJlY2F1c2VcbiAgICAgICAgLy8gaXQgY2FuIHRocm93IG9mZiB0aGUgYGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnRgIGNhbGxzIGluIHRoZSBgQ2RrRHJvcExpc3RgLlxuICAgICAgICAncG9pbnRlci1ldmVudHMnOiAnbm9uZScsXG4gICAgICAgIC8vIFdlIGhhdmUgdG8gcmVzZXQgdGhlIG1hcmdpbiwgYmVjYXVzZSBpdCBjYW4gdGhyb3cgb2ZmIHBvc2l0aW9uaW5nIHJlbGF0aXZlIHRvIHRoZSB2aWV3cG9ydC5cbiAgICAgICAgJ21hcmdpbic6ICcwJyxcbiAgICAgICAgJ3Bvc2l0aW9uJzogJ2ZpeGVkJyxcbiAgICAgICAgJ3RvcCc6ICcwJyxcbiAgICAgICAgJ2xlZnQnOiAnMCcsXG4gICAgICAgICd6LWluZGV4JzogdGhpcy5fekluZGV4ICsgJycsXG4gICAgICB9LFxuICAgICAgaW1wb3J0YW50UHJvcGVydGllcyxcbiAgICApO1xuXG4gICAgdG9nZ2xlTmF0aXZlRHJhZ0ludGVyYWN0aW9ucyhwcmV2aWV3LCBmYWxzZSk7XG4gICAgcHJldmlldy5jbGFzc0xpc3QuYWRkKCdjZGstZHJhZy1wcmV2aWV3Jyk7XG4gICAgcHJldmlldy5zZXRBdHRyaWJ1dGUoJ3BvcG92ZXInLCAnbWFudWFsJyk7XG4gICAgcHJldmlldy5zZXRBdHRyaWJ1dGUoJ2RpcicsIHRoaXMuX2RpcmVjdGlvbik7XG5cbiAgICBpZiAocHJldmlld0NsYXNzKSB7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShwcmV2aWV3Q2xhc3MpKSB7XG4gICAgICAgIHByZXZpZXdDbGFzcy5mb3JFYWNoKGNsYXNzTmFtZSA9PiBwcmV2aWV3LmNsYXNzTGlzdC5hZGQoY2xhc3NOYW1lKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwcmV2aWV3LmNsYXNzTGlzdC5hZGQocHJldmlld0NsYXNzKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcHJldmlldztcbiAgfVxufVxuIl19