/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { coerceBooleanProperty, coerceNumberProperty } from '@angular/cdk/coercion';
import { Platform } from '@angular/cdk/platform';
import { ContentChildren, Directive, ElementRef, inject, Inject, Input, NgZone, Optional, QueryList, } from '@angular/core';
import { MAT_RIPPLE_GLOBAL_OPTIONS, RippleRenderer, } from '@angular/material/core';
import { ANIMATION_MODULE_TYPE } from '@angular/platform-browser/animations';
import { Subscription, merge } from 'rxjs';
import { MatListItemIcon, MatListItemAvatar, } from './list-item-sections';
import { MAT_LIST_CONFIG } from './tokens';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/platform";
/** @docs-private */
export class MatListBase {
    constructor() {
        this._isNonInteractive = true;
        this._disableRipple = false;
        this._disabled = false;
        this._defaultOptions = inject(MAT_LIST_CONFIG, { optional: true });
    }
    /** Whether ripples for all list items is disabled. */
    get disableRipple() {
        return this._disableRipple;
    }
    set disableRipple(value) {
        this._disableRipple = coerceBooleanProperty(value);
    }
    /**
     * Whether the entire list is disabled. When disabled, the list itself and each of its list items
     * are disabled.
     */
    get disabled() {
        return this._disabled;
    }
    set disabled(value) {
        this._disabled = coerceBooleanProperty(value);
    }
}
MatListBase.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: MatListBase, deps: [], target: i0.ɵɵFactoryTarget.Directive });
MatListBase.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "15.2.0-rc.0", type: MatListBase, inputs: { disableRipple: "disableRipple", disabled: "disabled" }, host: { properties: { "attr.aria-disabled": "disabled" } }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: MatListBase, decorators: [{
            type: Directive,
            args: [{
                    host: {
                        '[attr.aria-disabled]': 'disabled',
                    },
                }]
        }], propDecorators: { disableRipple: [{
                type: Input
            }], disabled: [{
                type: Input
            }] } });
/** @docs-private */
export class MatListItemBase {
    /**
     * The number of lines this list item should reserve space for. If not specified,
     * lines are inferred based on the projected content.
     *
     * Explicitly specifying the number of lines is useful if you want to acquire additional
     * space and enable the wrapping of text. The unscoped text content of a list item will
     * always be able to take up the remaining space of the item, unless it represents the title.
     *
     * A maximum of three lines is supported as per the Material Design specification.
     */
    set lines(lines) {
        this._explicitLines = coerceNumberProperty(lines, null);
        this._updateItemLines(false);
    }
    get disableRipple() {
        return (this.disabled ||
            this._disableRipple ||
            this._noopAnimations ||
            !!this._listBase?.disableRipple);
    }
    set disableRipple(value) {
        this._disableRipple = coerceBooleanProperty(value);
    }
    /** Whether the list-item is disabled. */
    get disabled() {
        return this._disabled || !!this._listBase?.disabled;
    }
    set disabled(value) {
        this._disabled = coerceBooleanProperty(value);
    }
    /**
     * Implemented as part of `RippleTarget`.
     * @docs-private
     */
    get rippleDisabled() {
        return this.disableRipple || !!this.rippleConfig.disabled;
    }
    constructor(_elementRef, _ngZone, _listBase, _platform, globalRippleOptions, animationMode) {
        this._elementRef = _elementRef;
        this._ngZone = _ngZone;
        this._listBase = _listBase;
        this._platform = _platform;
        this._explicitLines = null;
        this._disableRipple = false;
        this._disabled = false;
        this._subscriptions = new Subscription();
        this._rippleRenderer = null;
        /** Whether the list item has unscoped text content. */
        this._hasUnscopedTextContent = false;
        this.rippleConfig = globalRippleOptions || {};
        this._hostElement = this._elementRef.nativeElement;
        this._isButtonElement = this._hostElement.nodeName.toLowerCase() === 'button';
        this._noopAnimations = animationMode === 'NoopAnimations';
        if (_listBase && !_listBase._isNonInteractive) {
            this._initInteractiveListItem();
        }
        // If no type attribute is specified for a host `<button>` element, set it to `button`. If a
        // type attribute is already specified, we do nothing. We do this for backwards compatibility.
        // TODO: Determine if we intend to continue doing this for the MDC-based list.
        if (this._isButtonElement && !this._hostElement.hasAttribute('type')) {
            this._hostElement.setAttribute('type', 'button');
        }
    }
    ngAfterViewInit() {
        this._monitorProjectedLinesAndTitle();
        this._updateItemLines(true);
    }
    ngOnDestroy() {
        this._subscriptions.unsubscribe();
        if (this._rippleRenderer !== null) {
            this._rippleRenderer._removeTriggerEvents();
        }
    }
    /** Whether the list item has icons or avatars. */
    _hasIconOrAvatar() {
        return !!(this._avatars.length || this._icons.length);
    }
    _initInteractiveListItem() {
        this._hostElement.classList.add('mat-mdc-list-item-interactive');
        this._rippleRenderer = new RippleRenderer(this, this._ngZone, this._hostElement, this._platform);
        this._rippleRenderer.setupTriggerEvents(this._hostElement);
    }
    /**
     * Subscribes to changes in the projected title and lines. Triggers a
     * item lines update whenever a change occurs.
     */
    _monitorProjectedLinesAndTitle() {
        this._ngZone.runOutsideAngular(() => {
            this._subscriptions.add(merge(this._lines.changes, this._titles.changes).subscribe(() => this._updateItemLines(false)));
        });
    }
    /**
     * Updates the lines of the list item. Based on the projected user content and optional
     * explicit lines setting, the visual appearance of the list item is determined.
     *
     * This method should be invoked whenever the projected user content changes, or
     * when the explicit lines have been updated.
     *
     * @param recheckUnscopedContent Whether the projected unscoped content should be re-checked.
     *   The unscoped content is not re-checked for every update as it is a rather expensive check
     *   for content that is expected to not change very often.
     */
    _updateItemLines(recheckUnscopedContent) {
        // If the updated is triggered too early before the view and content is initialized,
        // we just skip the update. After view initialization the update is triggered again.
        if (!this._lines || !this._titles || !this._unscopedContent) {
            return;
        }
        // Re-check the DOM for unscoped text content if requested. This needs to
        // happen before any computation or sanity checks run as these rely on the
        // result of whether there is unscoped text content or not.
        if (recheckUnscopedContent) {
            this._checkDomForUnscopedTextContent();
        }
        // Sanity check the list item lines and title in the content. This is a dev-mode only
        // check that can be dead-code eliminated by Terser in production.
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
            sanityCheckListItemContent(this);
        }
        const numberOfLines = this._explicitLines ?? this._inferLinesFromContent();
        const unscopedContentEl = this._unscopedContent.nativeElement;
        // Update the list item element to reflect the number of lines.
        this._hostElement.classList.toggle('mat-mdc-list-item-single-line', numberOfLines <= 1);
        this._hostElement.classList.toggle('mdc-list-item--with-one-line', numberOfLines <= 1);
        this._hostElement.classList.toggle('mdc-list-item--with-two-lines', numberOfLines === 2);
        this._hostElement.classList.toggle('mdc-list-item--with-three-lines', numberOfLines === 3);
        // If there is no title and the unscoped content is the is the only line, the
        // unscoped text content will be treated as the title of the list-item.
        if (this._hasUnscopedTextContent) {
            const treatAsTitle = this._titles.length === 0 && numberOfLines === 1;
            unscopedContentEl.classList.toggle('mdc-list-item__primary-text', treatAsTitle);
            unscopedContentEl.classList.toggle('mdc-list-item__secondary-text', !treatAsTitle);
        }
        else {
            unscopedContentEl.classList.remove('mdc-list-item__primary-text');
            unscopedContentEl.classList.remove('mdc-list-item__secondary-text');
        }
    }
    /**
     * Infers the number of lines based on the projected user content. This is useful
     * if no explicit number of lines has been specified on the list item.
     *
     * The number of lines is inferred based on whether there is a title, the number of
     * additional lines (secondary/tertiary). An additional line is acquired if there is
     * unscoped text content.
     */
    _inferLinesFromContent() {
        let numOfLines = this._titles.length + this._lines.length;
        if (this._hasUnscopedTextContent) {
            numOfLines += 1;
        }
        return numOfLines;
    }
    /** Checks whether the list item has unscoped text content. */
    _checkDomForUnscopedTextContent() {
        this._hasUnscopedTextContent = Array.from(this._unscopedContent.nativeElement.childNodes)
            .filter(node => node.nodeType !== node.COMMENT_NODE)
            .some(node => !!(node.textContent && node.textContent.trim()));
    }
}
MatListItemBase.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: MatListItemBase, deps: [{ token: i0.ElementRef }, { token: i0.NgZone }, { token: MatListBase, optional: true }, { token: i1.Platform }, { token: MAT_RIPPLE_GLOBAL_OPTIONS, optional: true }, { token: ANIMATION_MODULE_TYPE, optional: true }], target: i0.ɵɵFactoryTarget.Directive });
MatListItemBase.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "15.2.0-rc.0", type: MatListItemBase, inputs: { lines: "lines", disableRipple: "disableRipple", disabled: "disabled" }, host: { properties: { "class.mdc-list-item--disabled": "disabled", "attr.aria-disabled": "disabled", "attr.disabled": "(_isButtonElement && disabled) || null" } }, queries: [{ propertyName: "_avatars", predicate: MatListItemAvatar }, { propertyName: "_icons", predicate: MatListItemIcon }], ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: MatListItemBase, decorators: [{
            type: Directive,
            args: [{
                    host: {
                        '[class.mdc-list-item--disabled]': 'disabled',
                        '[attr.aria-disabled]': 'disabled',
                        '[attr.disabled]': '(_isButtonElement && disabled) || null',
                    },
                }]
        }], ctorParameters: function () { return [{ type: i0.ElementRef }, { type: i0.NgZone }, { type: MatListBase, decorators: [{
                    type: Optional
                }] }, { type: i1.Platform }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [MAT_RIPPLE_GLOBAL_OPTIONS]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [ANIMATION_MODULE_TYPE]
                }] }]; }, propDecorators: { _avatars: [{
                type: ContentChildren,
                args: [MatListItemAvatar, { descendants: false }]
            }], _icons: [{
                type: ContentChildren,
                args: [MatListItemIcon, { descendants: false }]
            }], lines: [{
                type: Input
            }], disableRipple: [{
                type: Input
            }], disabled: [{
                type: Input
            }] } });
/**
 * Sanity checks the configuration of the list item with respect to the amount
 * of lines, whether there is a title, or if there is unscoped text content.
 *
 * The checks are extracted into a top-level function that can be dead-code
 * eliminated by Terser or other optimizers in production mode.
 */
function sanityCheckListItemContent(item) {
    const numTitles = item._titles.length;
    const numLines = item._titles.length;
    if (numTitles > 1) {
        throw Error('A list item cannot have multiple titles.');
    }
    if (numTitles === 0 && numLines > 0) {
        throw Error('A list item line can only be used if there is a list item title.');
    }
    if (numTitles === 0 &&
        item._hasUnscopedTextContent &&
        item._explicitLines !== null &&
        item._explicitLines > 1) {
        throw Error('A list item cannot have wrapping content without a title.');
    }
    if (numLines > 2 || (numLines === 2 && item._hasUnscopedTextContent)) {
        throw Error('A list item can have at maximum three lines.');
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdC1iYXNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL2xpc3QvbGlzdC1iYXNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBZSxxQkFBcUIsRUFBRSxvQkFBb0IsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQ2hHLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUMvQyxPQUFPLEVBRUwsZUFBZSxFQUNmLFNBQVMsRUFDVCxVQUFVLEVBQ1YsTUFBTSxFQUNOLE1BQU0sRUFDTixLQUFLLEVBQ0wsTUFBTSxFQUVOLFFBQVEsRUFDUixTQUFTLEdBQ1YsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUNMLHlCQUF5QixFQUd6QixjQUFjLEdBRWYsTUFBTSx3QkFBd0IsQ0FBQztBQUNoQyxPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSxzQ0FBc0MsQ0FBQztBQUMzRSxPQUFPLEVBQUMsWUFBWSxFQUFFLEtBQUssRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUN6QyxPQUFPLEVBR0wsZUFBZSxFQUNmLGlCQUFpQixHQUNsQixNQUFNLHNCQUFzQixDQUFDO0FBQzlCLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxVQUFVLENBQUM7OztBQU96QyxvQkFBb0I7QUFDcEIsTUFBTSxPQUFnQixXQUFXO0lBTmpDO1FBT0Usc0JBQWlCLEdBQVksSUFBSSxDQUFDO1FBVTFCLG1CQUFjLEdBQVksS0FBSyxDQUFDO1FBYWhDLGNBQVMsR0FBRyxLQUFLLENBQUM7UUFFaEIsb0JBQWUsR0FBRyxNQUFNLENBQUMsZUFBZSxFQUFFLEVBQUMsUUFBUSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7S0FDdkU7SUF4QkMsc0RBQXNEO0lBQ3RELElBQ0ksYUFBYTtRQUNmLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQztJQUM3QixDQUFDO0lBQ0QsSUFB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R0FBRyxDQUFDLEVBQUU7UUFDakIsTUFBTSxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQztLQUN6RDtJQUNELElBQUksU0FBUyxLQUFLLENBQUMsSUFBSSxRQUFRLEdBQUcsQ0FBQyxFQUFFO1FBQ25DLE1BQU0sS0FBSyxDQUFDLGtFQUFrRSxDQUFDLENBQUM7S0FDakY7SUFDRCxJQUNFLFNBQVMsS0FBSyxDQUFDO1FBQ2YsSUFBSSxDQUFDLHVCQUF1QjtRQUM1QixJQUFJLENBQUMsY0FBYyxLQUFLLElBQUk7UUFDNUIsSUFBSSxDQUFDLGNBQWMsR0FBRyxDQUFDLEVBQ3ZCO1FBQ0EsTUFBTSxLQUFLLENBQUMsMkRBQTJELENBQUMsQ0FBQztLQUMxRTtJQUNELElBQUksUUFBUSxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLHVCQUF1QixDQUFDLEVBQUU7UUFDcEUsTUFBTSxLQUFLLENBQUMsOENBQThDLENBQUMsQ0FBQztLQUM3RDtBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtCb29sZWFuSW5wdXQsIGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSwgY29lcmNlTnVtYmVyUHJvcGVydHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQge1BsYXRmb3JtfSBmcm9tICdAYW5ndWxhci9jZGsvcGxhdGZvcm0nO1xuaW1wb3J0IHtcbiAgQWZ0ZXJWaWV3SW5pdCxcbiAgQ29udGVudENoaWxkcmVuLFxuICBEaXJlY3RpdmUsXG4gIEVsZW1lbnRSZWYsXG4gIGluamVjdCxcbiAgSW5qZWN0LFxuICBJbnB1dCxcbiAgTmdab25lLFxuICBPbkRlc3Ryb3ksXG4gIE9wdGlvbmFsLFxuICBRdWVyeUxpc3QsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtcbiAgTUFUX1JJUFBMRV9HTE9CQUxfT1BUSU9OUyxcbiAgUmlwcGxlQ29uZmlnLFxuICBSaXBwbGVHbG9iYWxPcHRpb25zLFxuICBSaXBwbGVSZW5kZXJlcixcbiAgUmlwcGxlVGFyZ2V0LFxufSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9jb3JlJztcbmltcG9ydCB7QU5JTUFUSU9OX01PRFVMRV9UWVBFfSBmcm9tICdAYW5ndWxhci9wbGF0Zm9ybS1icm93c2VyL2FuaW1hdGlvbnMnO1xuaW1wb3J0IHtTdWJzY3JpcHRpb24sIG1lcmdlfSBmcm9tICdyeGpzJztcbmltcG9ydCB7XG4gIE1hdExpc3RJdGVtTGluZSxcbiAgTWF0TGlzdEl0ZW1UaXRsZSxcbiAgTWF0TGlzdEl0ZW1JY29uLFxuICBNYXRMaXN0SXRlbUF2YXRhcixcbn0gZnJvbSAnLi9saXN0LWl0ZW0tc2VjdGlvbnMnO1xuaW1wb3J0IHtNQVRfTElTVF9DT05GSUd9IGZyb20gJy4vdG9rZW5zJztcblxuQERpcmVjdGl2ZSh7XG4gIGhvc3Q6IHtcbiAgICAnW2F0dHIuYXJpYS1kaXNhYmxlZF0nOiAnZGlzYWJsZWQnLFxuICB9LFxufSlcbi8qKiBAZG9jcy1wcml2YXRlICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgTWF0TGlzdEJhc2Uge1xuICBfaXNOb25JbnRlcmFjdGl2ZTogYm9vbGVhbiA9IHRydWU7XG5cbiAgLyoqIFdoZXRoZXIgcmlwcGxlcyBmb3IgYWxsIGxpc3QgaXRlbXMgaXMgZGlzYWJsZWQuICovXG4gIEBJbnB1dCgpXG4gIGdldCBkaXNhYmxlUmlwcGxlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9kaXNhYmxlUmlwcGxlO1xuICB9XG4gIHNldCBkaXNhYmxlUmlwcGxlKHZhbHVlOiBCb29sZWFuSW5wdXQpIHtcbiAgICB0aGlzLl9kaXNhYmxlUmlwcGxlID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHZhbHVlKTtcbiAgfVxuICBwcml2YXRlIF9kaXNhYmxlUmlwcGxlOiBib29sZWFuID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIGVudGlyZSBsaXN0IGlzIGRpc2FibGVkLiBXaGVuIGRpc2FibGVkLCB0aGUgbGlzdCBpdHNlbGYgYW5kIGVhY2ggb2YgaXRzIGxpc3QgaXRlbXNcbiAgICogYXJlIGRpc2FibGVkLlxuICAgKi9cbiAgQElucHV0KClcbiAgZ2V0IGRpc2FibGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9kaXNhYmxlZDtcbiAgfVxuICBzZXQgZGlzYWJsZWQodmFsdWU6IEJvb2xlYW5JbnB1dCkge1xuICAgIHRoaXMuX2Rpc2FibGVkID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHZhbHVlKTtcbiAgfVxuICBwcml2YXRlIF9kaXNhYmxlZCA9IGZhbHNlO1xuXG4gIHByb3RlY3RlZCBfZGVmYXVsdE9wdGlvbnMgPSBpbmplY3QoTUFUX0xJU1RfQ09ORklHLCB7b3B0aW9uYWw6IHRydWV9KTtcbn1cblxuQERpcmVjdGl2ZSh7XG4gIGhvc3Q6IHtcbiAgICAnW2NsYXNzLm1kYy1saXN0LWl0ZW0tLWRpc2FibGVkXSc6ICdkaXNhYmxlZCcsXG4gICAgJ1thdHRyLmFyaWEtZGlzYWJsZWRdJzogJ2Rpc2FibGVkJyxcbiAgICAnW2F0dHIuZGlzYWJsZWRdJzogJyhfaXNCdXR0b25FbGVtZW50ICYmIGRpc2FibGVkKSB8fCBudWxsJyxcbiAgfSxcbn0pXG4vKiogQGRvY3MtcHJpdmF0ZSAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIE1hdExpc3RJdGVtQmFzZSBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSwgUmlwcGxlVGFyZ2V0IHtcbiAgLyoqIFF1ZXJ5IGxpc3QgbWF0Y2hpbmcgbGlzdC1pdGVtIGxpbmUgZWxlbWVudHMuICovXG4gIGFic3RyYWN0IF9saW5lczogUXVlcnlMaXN0PE1hdExpc3RJdGVtTGluZT4gfCB1bmRlZmluZWQ7XG5cbiAgLyoqIFF1ZXJ5IGxpc3QgbWF0Y2hpbmcgbGlzdC1pdGVtIHRpdGxlIGVsZW1lbnRzLiAqL1xuICBhYnN0cmFjdCBfdGl0bGVzOiBRdWVyeUxpc3Q8TWF0TGlzdEl0ZW1UaXRsZT4gfCB1bmRlZmluZWQ7XG5cbiAgLyoqXG4gICAqIEVsZW1lbnQgcmVmZXJlbmNlIHRvIHRoZSB1bnNjb3BlZCBjb250ZW50IGluIGEgbGlzdCBpdGVtLlxuICAgKlxuICAgKiBVbnNjb3BlZCBjb250ZW50IGlzIHVzZXItcHJvamVjdGVkIHRleHQgY29udGVudCBpbiBhIGxpc3QgaXRlbSB0aGF0IGlzXG4gICAqIG5vdCBwYXJ0IG9mIGFuIGV4cGxpY2l0IGxpbmUgb3IgdGl0bGUuXG4gICAqL1xuICBhYnN0cmFjdCBfdW5zY29wZWRDb250ZW50OiBFbGVtZW50UmVmPEhUTUxTcGFuRWxlbWVudD4gfCB1bmRlZmluZWQ7XG5cbiAgLyoqIEhvc3QgZWxlbWVudCBmb3IgdGhlIGxpc3QgaXRlbS4gKi9cbiAgX2hvc3RFbGVtZW50OiBIVE1MRWxlbWVudDtcblxuICAvKiogaW5kaWNhdGUgd2hldGhlciB0aGUgaG9zdCBlbGVtZW50IGlzIGEgYnV0dG9uIG9yIG5vdCAqL1xuICBfaXNCdXR0b25FbGVtZW50OiBib29sZWFuO1xuXG4gIC8qKiBXaGV0aGVyIGFuaW1hdGlvbnMgYXJlIGRpc2FibGVkLiAqL1xuICBfbm9vcEFuaW1hdGlvbnM6IGJvb2xlYW47XG5cbiAgQENvbnRlbnRDaGlsZHJlbihNYXRMaXN0SXRlbUF2YXRhciwge2Rlc2NlbmRhbnRzOiBmYWxzZX0pIF9hdmF0YXJzOiBRdWVyeUxpc3Q8bmV2ZXI+O1xuICBAQ29udGVudENoaWxkcmVuKE1hdExpc3RJdGVtSWNvbiwge2Rlc2NlbmRhbnRzOiBmYWxzZX0pIF9pY29uczogUXVlcnlMaXN0PG5ldmVyPjtcblxuICAvKipcbiAgICogVGhlIG51bWJlciBvZiBsaW5lcyB0aGlzIGxpc3QgaXRlbSBzaG91bGQgcmVzZXJ2ZSBzcGFjZSBmb3IuIElmIG5vdCBzcGVjaWZpZWQsXG4gICAqIGxpbmVzIGFyZSBpbmZlcnJlZCBiYXNlZCBvbiB0aGUgcHJvamVjdGVkIGNvbnRlbnQuXG4gICAqXG4gICAqIEV4cGxpY2l0bHkgc3BlY2lmeWluZyB0aGUgbnVtYmVyIG9mIGxpbmVzIGlzIHVzZWZ1bCBpZiB5b3Ugd2FudCB0byBhY3F1aXJlIGFkZGl0aW9uYWxcbiAgICogc3BhY2UgYW5kIGVuYWJsZSB0aGUgd3JhcHBpbmcgb2YgdGV4dC4gVGhlIHVuc2NvcGVkIHRleHQgY29udGVudCBvZiBhIGxpc3QgaXRlbSB3aWxsXG4gICAqIGFsd2F5cyBiZSBhYmxlIHRvIHRha2UgdXAgdGhlIHJlbWFpbmluZyBzcGFjZSBvZiB0aGUgaXRlbSwgdW5sZXNzIGl0IHJlcHJlc2VudHMgdGhlIHRpdGxlLlxuICAgKlxuICAgKiBBIG1heGltdW0gb2YgdGhyZWUgbGluZXMgaXMgc3VwcG9ydGVkIGFzIHBlciB0aGUgTWF0ZXJpYWwgRGVzaWduIHNwZWNpZmljYXRpb24uXG4gICAqL1xuICBASW5wdXQoKVxuICBzZXQgbGluZXMobGluZXM6IG51bWJlciB8IHN0cmluZyB8IG51bGwpIHtcbiAgICB0aGlzLl9leHBsaWNpdExpbmVzID0gY29lcmNlTnVtYmVyUHJvcGVydHkobGluZXMsIG51bGwpO1xuICAgIHRoaXMuX3VwZGF0ZUl0ZW1MaW5lcyhmYWxzZSk7XG4gIH1cbiAgX2V4cGxpY2l0TGluZXM6IG51bWJlciB8IG51bGwgPSBudWxsO1xuXG4gIEBJbnB1dCgpXG4gIGdldCBkaXNhYmxlUmlwcGxlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAoXG4gICAgICB0aGlzLmRpc2FibGVkIHx8XG4gICAgICB0aGlzLl9kaXNhYmxlUmlwcGxlIHx8XG4gICAgICB0aGlzLl9ub29wQW5pbWF0aW9ucyB8fFxuICAgICAgISF0aGlzLl9saXN0QmFzZT8uZGlzYWJsZVJpcHBsZVxuICAgICk7XG4gIH1cbiAgc2V0IGRpc2FibGVSaXBwbGUodmFsdWU6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9kaXNhYmxlUmlwcGxlID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHZhbHVlKTtcbiAgfVxuICBwcml2YXRlIF9kaXNhYmxlUmlwcGxlOiBib29sZWFuID0gZmFsc2U7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGxpc3QtaXRlbSBpcyBkaXNhYmxlZC4gKi9cbiAgQElucHV0KClcbiAgZ2V0IGRpc2FibGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9kaXNhYmxlZCB8fCAhIXRoaXMuX2xpc3RCYXNlPy5kaXNhYmxlZDtcbiAgfVxuICBzZXQgZGlzYWJsZWQodmFsdWU6IEJvb2xlYW5JbnB1dCkge1xuICAgIHRoaXMuX2Rpc2FibGVkID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHZhbHVlKTtcbiAgfVxuICBwcml2YXRlIF9kaXNhYmxlZCA9IGZhbHNlO1xuXG4gIHByaXZhdGUgX3N1YnNjcmlwdGlvbnMgPSBuZXcgU3Vic2NyaXB0aW9uKCk7XG4gIHByaXZhdGUgX3JpcHBsZVJlbmRlcmVyOiBSaXBwbGVSZW5kZXJlciB8IG51bGwgPSBudWxsO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBsaXN0IGl0ZW0gaGFzIHVuc2NvcGVkIHRleHQgY29udGVudC4gKi9cbiAgX2hhc1Vuc2NvcGVkVGV4dENvbnRlbnQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAvKipcbiAgICogSW1wbGVtZW50ZWQgYXMgcGFydCBvZiBgUmlwcGxlVGFyZ2V0YC5cbiAgICogQGRvY3MtcHJpdmF0ZVxuICAgKi9cbiAgcmlwcGxlQ29uZmlnOiBSaXBwbGVDb25maWcgJiBSaXBwbGVHbG9iYWxPcHRpb25zO1xuXG4gIC8qKlxuICAgKiBJbXBsZW1lbnRlZCBhcyBwYXJ0IG9mIGBSaXBwbGVUYXJnZXRgLlxuICAgKiBAZG9jcy1wcml2YXRlXG4gICAqL1xuICBnZXQgcmlwcGxlRGlzYWJsZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuZGlzYWJsZVJpcHBsZSB8fCAhIXRoaXMucmlwcGxlQ29uZmlnLmRpc2FibGVkO1xuICB9XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIF9lbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcbiAgICBwcm90ZWN0ZWQgX25nWm9uZTogTmdab25lLFxuICAgIEBPcHRpb25hbCgpIHByaXZhdGUgX2xpc3RCYXNlOiBNYXRMaXN0QmFzZSB8IG51bGwsXG4gICAgcHJpdmF0ZSBfcGxhdGZvcm06IFBsYXRmb3JtLFxuICAgIEBPcHRpb25hbCgpXG4gICAgQEluamVjdChNQVRfUklQUExFX0dMT0JBTF9PUFRJT05TKVxuICAgIGdsb2JhbFJpcHBsZU9wdGlvbnM/OiBSaXBwbGVHbG9iYWxPcHRpb25zLFxuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoQU5JTUFUSU9OX01PRFVMRV9UWVBFKSBhbmltYXRpb25Nb2RlPzogc3RyaW5nLFxuICApIHtcbiAgICB0aGlzLnJpcHBsZUNvbmZpZyA9IGdsb2JhbFJpcHBsZU9wdGlvbnMgfHwge307XG4gICAgdGhpcy5faG9zdEVsZW1lbnQgPSB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7XG4gICAgdGhpcy5faXNCdXR0b25FbGVtZW50ID0gdGhpcy5faG9zdEVsZW1lbnQubm9kZU5hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ2J1dHRvbic7XG4gICAgdGhpcy5fbm9vcEFuaW1hdGlvbnMgPSBhbmltYXRpb25Nb2RlID09PSAnTm9vcEFuaW1hdGlvbnMnO1xuXG4gICAgaWYgKF9saXN0QmFzZSAmJiAhX2xpc3RCYXNlLl9pc05vbkludGVyYWN0aXZlKSB7XG4gICAgICB0aGlzLl9pbml0SW50ZXJhY3RpdmVMaXN0SXRlbSgpO1xuICAgIH1cblxuICAgIC8vIElmIG5vIHR5cGUgYXR0cmlidXRlIGlzIHNwZWNpZmllZCBmb3IgYSBob3N0IGA8YnV0dG9uPmAgZWxlbWVudCwgc2V0IGl0IHRvIGBidXR0b25gLiBJZiBhXG4gICAgLy8gdHlwZSBhdHRyaWJ1dGUgaXMgYWxyZWFkeSBzcGVjaWZpZWQsIHdlIGRvIG5vdGhpbmcuIFdlIGRvIHRoaXMgZm9yIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5LlxuICAgIC8vIFRPRE86IERldGVybWluZSBpZiB3ZSBpbnRlbmQgdG8gY29udGludWUgZG9pbmcgdGhpcyBmb3IgdGhlIE1EQy1iYXNlZCBsaXN0LlxuICAgIGlmICh0aGlzLl9pc0J1dHRvbkVsZW1lbnQgJiYgIXRoaXMuX2hvc3RFbGVtZW50Lmhhc0F0dHJpYnV0ZSgndHlwZScpKSB7XG4gICAgICB0aGlzLl9ob3N0RWxlbWVudC5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAnYnV0dG9uJyk7XG4gICAgfVxuICB9XG5cbiAgbmdBZnRlclZpZXdJbml0KCkge1xuICAgIHRoaXMuX21vbml0b3JQcm9qZWN0ZWRMaW5lc0FuZFRpdGxlKCk7XG4gICAgdGhpcy5fdXBkYXRlSXRlbUxpbmVzKHRydWUpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy51bnN1YnNjcmliZSgpO1xuICAgIGlmICh0aGlzLl9yaXBwbGVSZW5kZXJlciAhPT0gbnVsbCkge1xuICAgICAgdGhpcy5fcmlwcGxlUmVuZGVyZXIuX3JlbW92ZVRyaWdnZXJFdmVudHMoKTtcbiAgICB9XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgbGlzdCBpdGVtIGhhcyBpY29ucyBvciBhdmF0YXJzLiAqL1xuICBfaGFzSWNvbk9yQXZhdGFyKCkge1xuICAgIHJldHVybiAhISh0aGlzLl9hdmF0YXJzLmxlbmd0aCB8fCB0aGlzLl9pY29ucy5sZW5ndGgpO1xuICB9XG5cbiAgcHJpdmF0ZSBfaW5pdEludGVyYWN0aXZlTGlzdEl0ZW0oKSB7XG4gICAgdGhpcy5faG9zdEVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnbWF0LW1kYy1saXN0LWl0ZW0taW50ZXJhY3RpdmUnKTtcbiAgICB0aGlzLl9yaXBwbGVSZW5kZXJlciA9IG5ldyBSaXBwbGVSZW5kZXJlcihcbiAgICAgIHRoaXMsXG4gICAgICB0aGlzLl9uZ1pvbmUsXG4gICAgICB0aGlzLl9ob3N0RWxlbWVudCxcbiAgICAgIHRoaXMuX3BsYXRmb3JtLFxuICAgICk7XG4gICAgdGhpcy5fcmlwcGxlUmVuZGVyZXIuc2V0dXBUcmlnZ2VyRXZlbnRzKHRoaXMuX2hvc3RFbGVtZW50KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdWJzY3JpYmVzIHRvIGNoYW5nZXMgaW4gdGhlIHByb2plY3RlZCB0aXRsZSBhbmQgbGluZXMuIFRyaWdnZXJzIGFcbiAgICogaXRlbSBsaW5lcyB1cGRhdGUgd2hlbmV2ZXIgYSBjaGFuZ2Ugb2NjdXJzLlxuICAgKi9cbiAgcHJpdmF0ZSBfbW9uaXRvclByb2plY3RlZExpbmVzQW5kVGl0bGUoKSB7XG4gICAgdGhpcy5fbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgICBtZXJnZSh0aGlzLl9saW5lcyEuY2hhbmdlcywgdGhpcy5fdGl0bGVzIS5jaGFuZ2VzKS5zdWJzY3JpYmUoKCkgPT5cbiAgICAgICAgICB0aGlzLl91cGRhdGVJdGVtTGluZXMoZmFsc2UpLFxuICAgICAgICApLFxuICAgICAgKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSBsaW5lcyBvZiB0aGUgbGlzdCBpdGVtLiBCYXNlZCBvbiB0aGUgcHJvamVjdGVkIHVzZXIgY29udGVudCBhbmQgb3B0aW9uYWxcbiAgICogZXhwbGljaXQgbGluZXMgc2V0dGluZywgdGhlIHZpc3VhbCBhcHBlYXJhbmNlIG9mIHRoZSBsaXN0IGl0ZW0gaXMgZGV0ZXJtaW5lZC5cbiAgICpcbiAgICogVGhpcyBtZXRob2Qgc2hvdWxkIGJlIGludm9rZWQgd2hlbmV2ZXIgdGhlIHByb2plY3RlZCB1c2VyIGNvbnRlbnQgY2hhbmdlcywgb3JcbiAgICogd2hlbiB0aGUgZXhwbGljaXQgbGluZXMgaGF2ZSBiZWVuIHVwZGF0ZWQuXG4gICAqXG4gICAqIEBwYXJhbSByZWNoZWNrVW5zY29wZWRDb250ZW50IFdoZXRoZXIgdGhlIHByb2plY3RlZCB1bnNjb3BlZCBjb250ZW50IHNob3VsZCBiZSByZS1jaGVja2VkLlxuICAgKiAgIFRoZSB1bnNjb3BlZCBjb250ZW50IGlzIG5vdCByZS1jaGVja2VkIGZvciBldmVyeSB1cGRhdGUgYXMgaXQgaXMgYSByYXRoZXIgZXhwZW5zaXZlIGNoZWNrXG4gICAqICAgZm9yIGNvbnRlbnQgdGhhdCBpcyBleHBlY3RlZCB0byBub3QgY2hhbmdlIHZlcnkgb2Z0ZW4uXG4gICAqL1xuICBfdXBkYXRlSXRlbUxpbmVzKHJlY2hlY2tVbnNjb3BlZENvbnRlbnQ6IGJvb2xlYW4pIHtcbiAgICAvLyBJZiB0aGUgdXBkYXRlZCBpcyB0cmlnZ2VyZWQgdG9vIGVhcmx5IGJlZm9yZSB0aGUgdmlldyBhbmQgY29udGVudCBpcyBpbml0aWFsaXplZCxcbiAgICAvLyB3ZSBqdXN0IHNraXAgdGhlIHVwZGF0ZS4gQWZ0ZXIgdmlldyBpbml0aWFsaXphdGlvbiB0aGUgdXBkYXRlIGlzIHRyaWdnZXJlZCBhZ2Fpbi5cbiAgICBpZiAoIXRoaXMuX2xpbmVzIHx8ICF0aGlzLl90aXRsZXMgfHwgIXRoaXMuX3Vuc2NvcGVkQ29udGVudCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFJlLWNoZWNrIHRoZSBET00gZm9yIHVuc2NvcGVkIHRleHQgY29udGVudCBpZiByZXF1ZXN0ZWQuIFRoaXMgbmVlZHMgdG9cbiAgICAvLyBoYXBwZW4gYmVmb3JlIGFueSBjb21wdXRhdGlvbiBvciBzYW5pdHkgY2hlY2tzIHJ1biBhcyB0aGVzZSByZWx5IG9uIHRoZVxuICAgIC8vIHJlc3VsdCBvZiB3aGV0aGVyIHRoZXJlIGlzIHVuc2NvcGVkIHRleHQgY29udGVudCBvciBub3QuXG4gICAgaWYgKHJlY2hlY2tVbnNjb3BlZENvbnRlbnQpIHtcbiAgICAgIHRoaXMuX2NoZWNrRG9tRm9yVW5zY29wZWRUZXh0Q29udGVudCgpO1xuICAgIH1cblxuICAgIC8vIFNhbml0eSBjaGVjayB0aGUgbGlzdCBpdGVtIGxpbmVzIGFuZCB0aXRsZSBpbiB0aGUgY29udGVudC4gVGhpcyBpcyBhIGRldi1tb2RlIG9ubHlcbiAgICAvLyBjaGVjayB0aGF0IGNhbiBiZSBkZWFkLWNvZGUgZWxpbWluYXRlZCBieSBUZXJzZXIgaW4gcHJvZHVjdGlvbi5cbiAgICBpZiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSB7XG4gICAgICBzYW5pdHlDaGVja0xpc3RJdGVtQ29udGVudCh0aGlzKTtcbiAgICB9XG5cbiAgICBjb25zdCBudW1iZXJPZkxpbmVzID0gdGhpcy5fZXhwbGljaXRMaW5lcyA/PyB0aGlzLl9pbmZlckxpbmVzRnJvbUNvbnRlbnQoKTtcbiAgICBjb25zdCB1bnNjb3BlZENvbnRlbnRFbCA9IHRoaXMuX3Vuc2NvcGVkQ29udGVudC5uYXRpdmVFbGVtZW50O1xuXG4gICAgLy8gVXBkYXRlIHRoZSBsaXN0IGl0ZW0gZWxlbWVudCB0byByZWZsZWN0IHRoZSBudW1iZXIgb2YgbGluZXMuXG4gICAgdGhpcy5faG9zdEVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZSgnbWF0LW1kYy1saXN0LWl0ZW0tc2luZ2xlLWxpbmUnLCBudW1iZXJPZkxpbmVzIDw9IDEpO1xuICAgIHRoaXMuX2hvc3RFbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoJ21kYy1saXN0LWl0ZW0tLXdpdGgtb25lLWxpbmUnLCBudW1iZXJPZkxpbmVzIDw9IDEpO1xuICAgIHRoaXMuX2hvc3RFbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoJ21kYy1saXN0LWl0ZW0tLXdpdGgtdHdvLWxpbmVzJywgbnVtYmVyT2ZMaW5lcyA9PT0gMik7XG4gICAgdGhpcy5faG9zdEVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZSgnbWRjLWxpc3QtaXRlbS0td2l0aC10aHJlZS1saW5lcycsIG51bWJlck9mTGluZXMgPT09IDMpO1xuXG4gICAgLy8gSWYgdGhlcmUgaXMgbm8gdGl0bGUgYW5kIHRoZSB1bnNjb3BlZCBjb250ZW50IGlzIHRoZSBpcyB0aGUgb25seSBsaW5lLCB0aGVcbiAgICAvLyB1bnNjb3BlZCB0ZXh0IGNvbnRlbnQgd2lsbCBiZSB0cmVhdGVkIGFzIHRoZSB0aXRsZSBvZiB0aGUgbGlzdC1pdGVtLlxuICAgIGlmICh0aGlzLl9oYXNVbnNjb3BlZFRleHRDb250ZW50KSB7XG4gICAgICBjb25zdCB0cmVhdEFzVGl0bGUgPSB0aGlzLl90aXRsZXMubGVuZ3RoID09PSAwICYmIG51bWJlck9mTGluZXMgPT09IDE7XG4gICAgICB1bnNjb3BlZENvbnRlbnRFbC5jbGFzc0xpc3QudG9nZ2xlKCdtZGMtbGlzdC1pdGVtX19wcmltYXJ5LXRleHQnLCB0cmVhdEFzVGl0bGUpO1xuICAgICAgdW5zY29wZWRDb250ZW50RWwuY2xhc3NMaXN0LnRvZ2dsZSgnbWRjLWxpc3QtaXRlbV9fc2Vjb25kYXJ5LXRleHQnLCAhdHJlYXRBc1RpdGxlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdW5zY29wZWRDb250ZW50RWwuY2xhc3NMaXN0LnJlbW92ZSgnbWRjLWxpc3QtaXRlbV9fcHJpbWFyeS10ZXh0Jyk7XG4gICAgICB1bnNjb3BlZENvbnRlbnRFbC5jbGFzc0xpc3QucmVtb3ZlKCdtZGMtbGlzdC1pdGVtX19zZWNvbmRhcnktdGV4dCcpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBJbmZlcnMgdGhlIG51bWJlciBvZiBsaW5lcyBiYXNlZCBvbiB0aGUgcHJvamVjdGVkIHVzZXIgY29udGVudC4gVGhpcyBpcyB1c2VmdWxcbiAgICogaWYgbm8gZXhwbGljaXQgbnVtYmVyIG9mIGxpbmVzIGhhcyBiZWVuIHNwZWNpZmllZCBvbiB0aGUgbGlzdCBpdGVtLlxuICAgKlxuICAgKiBUaGUgbnVtYmVyIG9mIGxpbmVzIGlzIGluZmVycmVkIGJhc2VkIG9uIHdoZXRoZXIgdGhlcmUgaXMgYSB0aXRsZSwgdGhlIG51bWJlciBvZlxuICAgKiBhZGRpdGlvbmFsIGxpbmVzIChzZWNvbmRhcnkvdGVydGlhcnkpLiBBbiBhZGRpdGlvbmFsIGxpbmUgaXMgYWNxdWlyZWQgaWYgdGhlcmUgaXNcbiAgICogdW5zY29wZWQgdGV4dCBjb250ZW50LlxuICAgKi9cbiAgcHJpdmF0ZSBfaW5mZXJMaW5lc0Zyb21Db250ZW50KCkge1xuICAgIGxldCBudW1PZkxpbmVzID0gdGhpcy5fdGl0bGVzIS5sZW5ndGggKyB0aGlzLl9saW5lcyEubGVuZ3RoO1xuICAgIGlmICh0aGlzLl9oYXNVbnNjb3BlZFRleHRDb250ZW50KSB7XG4gICAgICBudW1PZkxpbmVzICs9IDE7XG4gICAgfVxuICAgIHJldHVybiBudW1PZkxpbmVzO1xuICB9XG5cbiAgLyoqIENoZWNrcyB3aGV0aGVyIHRoZSBsaXN0IGl0ZW0gaGFzIHVuc2NvcGVkIHRleHQgY29udGVudC4gKi9cbiAgcHJpdmF0ZSBfY2hlY2tEb21Gb3JVbnNjb3BlZFRleHRDb250ZW50KCkge1xuICAgIHRoaXMuX2hhc1Vuc2NvcGVkVGV4dENvbnRlbnQgPSBBcnJheS5mcm9tPENoaWxkTm9kZT4oXG4gICAgICB0aGlzLl91bnNjb3BlZENvbnRlbnQhLm5hdGl2ZUVsZW1lbnQuY2hpbGROb2RlcyxcbiAgICApXG4gICAgICAuZmlsdGVyKG5vZGUgPT4gbm9kZS5ub2RlVHlwZSAhPT0gbm9kZS5DT01NRU5UX05PREUpXG4gICAgICAuc29tZShub2RlID0+ICEhKG5vZGUudGV4dENvbnRlbnQgJiYgbm9kZS50ZXh0Q29udGVudC50cmltKCkpKTtcbiAgfVxufVxuXG4vKipcbiAqIFNhbml0eSBjaGVja3MgdGhlIGNvbmZpZ3VyYXRpb24gb2YgdGhlIGxpc3QgaXRlbSB3aXRoIHJlc3BlY3QgdG8gdGhlIGFtb3VudFxuICogb2YgbGluZXMsIHdoZXRoZXIgdGhlcmUgaXMgYSB0aXRsZSwgb3IgaWYgdGhlcmUgaXMgdW5zY29wZWQgdGV4dCBjb250ZW50LlxuICpcbiAqIFRoZSBjaGVja3MgYXJlIGV4dHJhY3RlZCBpbnRvIGEgdG9wLWxldmVsIGZ1bmN0aW9uIHRoYXQgY2FuIGJlIGRlYWQtY29kZVxuICogZWxpbWluYXRlZCBieSBUZXJzZXIgb3Igb3RoZXIgb3B0aW1pemVycyBpbiBwcm9kdWN0aW9uIG1vZGUuXG4gKi9cbmZ1bmN0aW9uIHNhbml0eUNoZWNrTGlzdEl0ZW1Db250ZW50KGl0ZW06IE1hdExpc3RJdGVtQmFzZSkge1xuICBjb25zdCBudW1UaXRsZXMgPSBpdGVtLl90aXRsZXMhLmxlbmd0aDtcbiAgY29uc3QgbnVtTGluZXMgPSBpdGVtLl90aXRsZXMhLmxlbmd0aDtcblxuICBpZiAobnVtVGl0bGVzID4gMSkge1xuICAgIHRocm93IEVycm9yKCdBIGxpc3QgaXRlbSBjYW5ub3QgaGF2ZSBtdWx0aXBsZSB0aXRsZXMuJyk7XG4gIH1cbiAgaWYgKG51bVRpdGxlcyA9PT0gMCAmJiBudW1MaW5lcyA+IDApIHtcbiAgICB0aHJvdyBFcnJvcignQSBsaXN0IGl0ZW0gbGluZSBjYW4gb25seSBiZSB1c2VkIGlmIHRoZXJlIGlzIGEgbGlzdCBpdGVtIHRpdGxlLicpO1xuICB9XG4gIGlmIChcbiAgICBudW1UaXRsZXMgPT09IDAgJiZcbiAgICBpdGVtLl9oYXNVbnNjb3BlZFRleHRDb250ZW50ICYmXG4gICAgaXRlbS5fZXhwbGljaXRMaW5lcyAhPT0gbnVsbCAmJlxuICAgIGl0ZW0uX2V4cGxpY2l0TGluZXMgPiAxXG4gICkge1xuICAgIHRocm93IEVycm9yKCdBIGxpc3QgaXRlbSBjYW5ub3QgaGF2ZSB3cmFwcGluZyBjb250ZW50IHdpdGhvdXQgYSB0aXRsZS4nKTtcbiAgfVxuICBpZiAobnVtTGluZXMgPiAyIHx8IChudW1MaW5lcyA9PT0gMiAmJiBpdGVtLl9oYXNVbnNjb3BlZFRleHRDb250ZW50KSkge1xuICAgIHRocm93IEVycm9yKCdBIGxpc3QgaXRlbSBjYW4gaGF2ZSBhdCBtYXhpbXVtIHRocmVlIGxpbmVzLicpO1xuICB9XG59XG4iXX0=