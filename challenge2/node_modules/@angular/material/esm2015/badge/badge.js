/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AriaDescriber } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Directive, ElementRef, Inject, Input, NgZone, Optional, Renderer2, } from '@angular/core';
import { mixinDisabled } from '@angular/material/core';
import { ANIMATION_MODULE_TYPE } from '@angular/platform-browser/animations';
let nextId = 0;
// Boilerplate for applying mixins to MatBadge.
/** @docs-private */
class MatBadgeBase {
}
const _MatBadgeMixinBase = mixinDisabled(MatBadgeBase);
/** Directive to display a text badge. */
export class MatBadge extends _MatBadgeMixinBase {
    constructor(_ngZone, _elementRef, _ariaDescriber, _renderer, _animationMode) {
        super();
        this._ngZone = _ngZone;
        this._elementRef = _elementRef;
        this._ariaDescriber = _ariaDescriber;
        this._renderer = _renderer;
        this._animationMode = _animationMode;
        /** Whether the badge has any content. */
        this._hasContent = false;
        this._color = 'primary';
        this._overlap = true;
        /**
         * Position the badge should reside.
         * Accepts any combination of 'above'|'below' and 'before'|'after'
         */
        this.position = 'above after';
        /** Size of the badge. Can be 'small', 'medium', or 'large'. */
        this.size = 'medium';
        /** Unique id for the badge */
        this._id = nextId++;
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
            const nativeElement = _elementRef.nativeElement;
            if (nativeElement.nodeType !== nativeElement.ELEMENT_NODE) {
                throw Error('matBadge must be attached to an element node.');
            }
        }
    }
    /** The color of the badge. Can be `primary`, `accent`, or `warn`. */
    get color() { return this._color; }
    set color(value) {
        this._setColor(value);
        this._color = value;
    }
    /** Whether the badge should overlap its contents or not */
    get overlap() { return this._overlap; }
    set overlap(val) {
        this._overlap = coerceBooleanProperty(val);
    }
    /** Message used to describe the decorated element via aria-describedby */
    get description() { return this._description; }
    set description(newDescription) {
        if (newDescription !== this._description) {
            const badgeElement = this._badgeElement;
            this._updateHostAriaDescription(newDescription, this._description);
            this._description = newDescription;
            if (badgeElement) {
                newDescription ? badgeElement.setAttribute('aria-label', newDescription) :
                    badgeElement.removeAttribute('aria-label');
            }
        }
    }
    /** Whether the badge is hidden. */
    get hidden() { return this._hidden; }
    set hidden(val) {
        this._hidden = coerceBooleanProperty(val);
    }
    /** Whether the badge is above the host or not */
    isAbove() {
        return this.position.indexOf('below') === -1;
    }
    /** Whether the badge is after the host or not */
    isAfter() {
        return this.position.indexOf('before') === -1;
    }
    ngOnChanges(changes) {
        const contentChange = changes['content'];
        if (contentChange) {
            const value = contentChange.currentValue;
            this._hasContent = value != null && `${value}`.trim().length > 0;
            this._updateTextContent();
        }
    }
    ngOnDestroy() {
        const badgeElement = this._badgeElement;
        if (badgeElement) {
            if (this.description) {
                this._ariaDescriber.removeDescription(badgeElement, this.description);
            }
            // When creating a badge through the Renderer, Angular will keep it in an index.
            // We have to destroy it ourselves, otherwise it'll be retained in memory.
            if (this._renderer.destroyNode) {
                this._renderer.destroyNode(badgeElement);
            }
        }
    }
    /**
     * Gets the element into which the badge's content is being rendered.
     * Undefined if the element hasn't been created (e.g. if the badge doesn't have content).
     */
    getBadgeElement() {
        return this._badgeElement;
    }
    /** Injects a span element into the DOM with the content. */
    _updateTextContent() {
        if (!this._badgeElement) {
            this._badgeElement = this._createBadgeElement();
        }
        else {
            this._badgeElement.textContent = this._stringifyContent();
        }
        return this._badgeElement;
    }
    /** Creates the badge element */
    _createBadgeElement() {
        const badgeElement = this._renderer.createElement('span');
        const activeClass = 'mat-badge-active';
        const contentClass = 'mat-badge-content';
        // Clear any existing badges which may have persisted from a server-side render.
        this._clearExistingBadges(contentClass);
        badgeElement.setAttribute('id', `mat-badge-content-${this._id}`);
        badgeElement.classList.add(contentClass);
        badgeElement.textContent = this._stringifyContent();
        if (this._animationMode === 'NoopAnimations') {
            badgeElement.classList.add('_mat-animation-noopable');
        }
        if (this.description) {
            badgeElement.setAttribute('aria-label', this.description);
        }
        this._elementRef.nativeElement.appendChild(badgeElement);
        // animate in after insertion
        if (typeof requestAnimationFrame === 'function' && this._animationMode !== 'NoopAnimations') {
            this._ngZone.runOutsideAngular(() => {
                requestAnimationFrame(() => {
                    badgeElement.classList.add(activeClass);
                });
            });
        }
        else {
            badgeElement.classList.add(activeClass);
        }
        return badgeElement;
    }
    /** Sets the aria-label property on the element */
    _updateHostAriaDescription(newDescription, oldDescription) {
        // ensure content available before setting label
        const content = this._updateTextContent();
        if (oldDescription) {
            this._ariaDescriber.removeDescription(content, oldDescription);
        }
        if (newDescription) {
            this._ariaDescriber.describe(content, newDescription);
        }
    }
    /** Adds css theme class given the color to the component host */
    _setColor(colorPalette) {
        if (colorPalette !== this._color) {
            const classList = this._elementRef.nativeElement.classList;
            if (this._color) {
                classList.remove(`mat-badge-${this._color}`);
            }
            if (colorPalette) {
                classList.add(`mat-badge-${colorPalette}`);
            }
        }
    }
    /** Clears any existing badges that might be left over from server-side rendering. */
    _clearExistingBadges(cssClass) {
        const element = this._elementRef.nativeElement;
        let childCount = element.children.length;
        // Use a reverse while, because we'll be removing elements from the list as we're iterating.
        while (childCount--) {
            const currentChild = element.children[childCount];
            if (currentChild.classList.contains(cssClass)) {
                element.removeChild(currentChild);
            }
        }
    }
    /** Gets the string representation of the badge content. */
    _stringifyContent() {
        // Convert null and undefined to an empty string which is consistent
        // with how Angular handles them in inside template interpolations.
        const content = this.content;
        return content == null ? '' : `${content}`;
    }
}
MatBadge.decorators = [
    { type: Directive, args: [{
                selector: '[matBadge]',
                inputs: ['disabled: matBadgeDisabled'],
                host: {
                    'class': 'mat-badge',
                    '[class.mat-badge-overlap]': 'overlap',
                    '[class.mat-badge-above]': 'isAbove()',
                    '[class.mat-badge-below]': '!isAbove()',
                    '[class.mat-badge-before]': '!isAfter()',
                    '[class.mat-badge-after]': 'isAfter()',
                    '[class.mat-badge-small]': 'size === "small"',
                    '[class.mat-badge-medium]': 'size === "medium"',
                    '[class.mat-badge-large]': 'size === "large"',
                    '[class.mat-badge-hidden]': 'hidden || !_hasContent',
                    '[class.mat-badge-disabled]': 'disabled',
                },
            },] }
];
MatBadge.ctorParameters = () => [
    { type: NgZone },
    { type: ElementRef },
    { type: AriaDescriber },
    { type: Renderer2 },
    { type: String, decorators: [{ type: Optional }, { type: Inject, args: [ANIMATION_MODULE_TYPE,] }] }
];
MatBadge.propDecorators = {
    color: [{ type: Input, args: ['matBadgeColor',] }],
    overlap: [{ type: Input, args: ['matBadgeOverlap',] }],
    position: [{ type: Input, args: ['matBadgePosition',] }],
    content: [{ type: Input, args: ['matBadge',] }],
    description: [{ type: Input, args: ['matBadgeDescription',] }],
    size: [{ type: Input, args: ['matBadgeSize',] }],
    hidden: [{ type: Input, args: ['matBadgeHidden',] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFkZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvYmFkZ2UvYmFkZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ2hELE9BQU8sRUFBZSxxQkFBcUIsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQzFFLE9BQU8sRUFDTCxTQUFTLEVBQ1QsVUFBVSxFQUNWLE1BQU0sRUFDTixLQUFLLEVBQ0wsTUFBTSxFQUdOLFFBQVEsRUFDUixTQUFTLEdBRVYsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUE2QixhQUFhLEVBQWUsTUFBTSx3QkFBd0IsQ0FBQztBQUMvRixPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSxzQ0FBc0MsQ0FBQztBQUczRSxJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFFZiwrQ0FBK0M7QUFDL0Msb0JBQW9CO0FBQ3BCLE1BQU0sWUFBWTtDQUFHO0FBRXJCLE1BQU0sa0JBQWtCLEdBQ21CLGFBQWEsQ0FBQyxZQUFZLENBQUMsQ0FBQztBQVV2RSx5Q0FBeUM7QUFrQnpDLE1BQU0sT0FBTyxRQUFTLFNBQVEsa0JBQWtCO0lBK0Q5QyxZQUNZLE9BQWUsRUFDZixXQUFvQyxFQUNwQyxjQUE2QixFQUM3QixTQUFvQixFQUN1QixjQUF1QjtRQUMxRSxLQUFLLEVBQUUsQ0FBQztRQUxBLFlBQU8sR0FBUCxPQUFPLENBQVE7UUFDZixnQkFBVyxHQUFYLFdBQVcsQ0FBeUI7UUFDcEMsbUJBQWMsR0FBZCxjQUFjLENBQWU7UUFDN0IsY0FBUyxHQUFULFNBQVMsQ0FBVztRQUN1QixtQkFBYyxHQUFkLGNBQWMsQ0FBUztRQW5FOUUseUNBQXlDO1FBQ3pDLGdCQUFXLEdBQUcsS0FBSyxDQUFDO1FBU1osV0FBTSxHQUFpQixTQUFTLENBQUM7UUFRakMsYUFBUSxHQUFZLElBQUks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QUFHLE9BQU8sRUFBRSxDQUFDO0lBQzdDLENBQUM7OztZQTFPRixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLFlBQVk7Z0JBQ3RCLE1BQU0sRUFBRSxDQUFDLDRCQUE0QixDQUFDO2dCQUN0QyxJQUFJLEVBQUU7b0JBQ0osT0FBTyxFQUFFLFdBQVc7b0JBQ3BCLDJCQUEyQixFQUFFLFNBQVM7b0JBQ3RDLHlCQUF5QixFQUFFLFdBQVc7b0JBQ3RDLHlCQUF5QixFQUFFLFlBQVk7b0JBQ3ZDLDBCQUEwQixFQUFFLFlBQVk7b0JBQ3hDLHlCQUF5QixFQUFFLFdBQVc7b0JBQ3RDLHlCQUF5QixFQUFFLGtCQUFrQjtvQkFDN0MsMEJBQTBCLEVBQUUsbUJBQW1CO29CQUMvQyx5QkFBeUIsRUFBRSxrQkFBa0I7b0JBQzdDLDBCQUEwQixFQUFFLHdCQUF3QjtvQkFDcEQsNEJBQTRCLEVBQUUsVUFBVTtpQkFDekM7YUFDRjs7O1lBN0NDLE1BQU07WUFITixVQUFVO1lBSkosYUFBYTtZQVduQixTQUFTO3lDQThHSixRQUFRLFlBQUksTUFBTSxTQUFDLHFCQUFxQjs7O29CQS9ENUMsS0FBSyxTQUFDLGVBQWU7c0JBU3JCLEtBQUssU0FBQyxpQkFBaUI7dUJBV3ZCLEtBQUssU0FBQyxrQkFBa0I7c0JBR3hCLEtBQUssU0FBQyxVQUFVOzBCQUdoQixLQUFLLFNBQUMscUJBQXFCO21CQWlCM0IsS0FBSyxTQUFDLGNBQWM7cUJBR3BCLEtBQUssU0FBQyxnQkFBZ0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtBcmlhRGVzY3JpYmVyfSBmcm9tICdAYW5ndWxhci9jZGsvYTExeSc7XG5pbXBvcnQge0Jvb2xlYW5JbnB1dCwgY29lcmNlQm9vbGVhblByb3BlcnR5fSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xuaW1wb3J0IHtcbiAgRGlyZWN0aXZlLFxuICBFbGVtZW50UmVmLFxuICBJbmplY3QsXG4gIElucHV0LFxuICBOZ1pvbmUsXG4gIE9uQ2hhbmdlcyxcbiAgT25EZXN0cm95LFxuICBPcHRpb25hbCxcbiAgUmVuZGVyZXIyLFxuICBTaW1wbGVDaGFuZ2VzLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Q2FuRGlzYWJsZSwgQ2FuRGlzYWJsZUN0b3IsIG1peGluRGlzYWJsZWQsIFRoZW1lUGFsZXR0ZX0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvY29yZSc7XG5pbXBvcnQge0FOSU1BVElPTl9NT0RVTEVfVFlQRX0gZnJvbSAnQGFuZ3VsYXIvcGxhdGZvcm0tYnJvd3Nlci9hbmltYXRpb25zJztcblxuXG5sZXQgbmV4dElkID0gMDtcblxuLy8gQm9pbGVycGxhdGUgZm9yIGFwcGx5aW5nIG1peGlucyB0byBNYXRCYWRnZS5cbi8qKiBAZG9jcy1wcml2YXRlICovXG5jbGFzcyBNYXRCYWRnZUJhc2Uge31cblxuY29uc3QgX01hdEJhZGdlTWl4aW5CYXNlOlxuICAgIENhbkRpc2FibGVDdG9yICYgdHlwZW9mIE1hdEJhZGdlQmFzZSA9IG1peGluRGlzYWJsZWQoTWF0QmFkZ2VCYXNlKTtcblxuLyoqIEFsbG93ZWQgcG9zaXRpb24gb3B0aW9ucyBmb3IgbWF0QmFkZ2VQb3NpdGlvbiAqL1xuZXhwb3J0IHR5cGUgTWF0QmFkZ2VQb3NpdGlvbiA9XG4gICAgJ2Fib3ZlIGFmdGVyJyB8ICdhYm92ZSBiZWZvcmUnIHwgJ2JlbG93IGJlZm9yZScgfCAnYmVsb3cgYWZ0ZXInIHxcbiAgICAnYmVmb3JlJyB8ICdhZnRlcicgfCAnYWJvdmUnIHwgJ2JlbG93JztcblxuLyoqIEFsbG93ZWQgc2l6ZSBvcHRpb25zIGZvciBtYXRCYWRnZVNpemUgKi9cbmV4cG9ydCB0eXBlIE1hdEJhZGdlU2l6ZSA9ICdzbWFsbCcgfCAnbWVkaXVtJyB8ICdsYXJnZSc7XG5cbi8qKiBEaXJlY3RpdmUgdG8gZGlzcGxheSBhIHRleHQgYmFkZ2UuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbbWF0QmFkZ2VdJyxcbiAgaW5wdXRzOiBbJ2Rpc2FibGVkOiBtYXRCYWRnZURpc2FibGVkJ10sXG4gIGhvc3Q6IHtcbiAgICAnY2xhc3MnOiAnbWF0LWJhZGdlJyxcbiAgICAnW2NsYXNzLm1hdC1iYWRnZS1vdmVybGFwXSc6ICdvdmVybGFwJyxcbiAgICAnW2NsYXNzLm1hdC1iYWRnZS1hYm92ZV0nOiAnaXNBYm92ZSgpJyxcbiAgICAnW2NsYXNzLm1hdC1iYWRnZS1iZWxvd10nOiAnIWlzQWJvdmUoKScsXG4gICAgJ1tjbGFzcy5tYXQtYmFkZ2UtYmVmb3JlXSc6ICchaXNBZnRlcigpJyxcbiAgICAnW2NsYXNzLm1hdC1iYWRnZS1hZnRlcl0nOiAnaXNBZnRlcigpJyxcbiAgICAnW2NsYXNzLm1hdC1iYWRnZS1zbWFsbF0nOiAnc2l6ZSA9PT0gXCJzbWFsbFwiJyxcbiAgICAnW2NsYXNzLm1hdC1iYWRnZS1tZWRpdW1dJzogJ3NpemUgPT09IFwibWVkaXVtXCInLFxuICAgICdbY2xhc3MubWF0LWJhZGdlLWxhcmdlXSc6ICdzaXplID09PSBcImxhcmdlXCInLFxuICAgICdbY2xhc3MubWF0LWJhZGdlLWhpZGRlbl0nOiAnaGlkZGVuIHx8ICFfaGFzQ29udGVudCcsXG4gICAgJ1tjbGFzcy5tYXQtYmFkZ2UtZGlzYWJsZWRdJzogJ2Rpc2FibGVkJyxcbiAgfSxcbn0pXG5leHBvcnQgY2xhc3MgTWF0QmFkZ2UgZXh0ZW5kcyBfTWF0QmFkZ2VNaXhpbkJhc2UgaW1wbGVtZW50cyBPbkRlc3Ryb3ksIE9uQ2hhbmdlcywgQ2FuRGlzYWJsZSB7XG4gIC8qKiBXaGV0aGVyIHRoZSBiYWRnZSBoYXMgYW55IGNvbnRlbnQuICovXG4gIF9oYXNDb250ZW50ID0gZmFsc2U7XG5cbiAgLyoqIFRoZSBjb2xvciBvZiB0aGUgYmFkZ2UuIENhbiBiZSBgcHJpbWFyeWAsIGBhY2NlbnRgLCBvciBgd2FybmAuICovXG4gIEBJbnB1dCgnbWF0QmFkZ2VDb2xvcicpXG4gIGdldCBjb2xvcigpOiBUaGVtZVBhbGV0dGUgeyByZXR1cm4gdGhpcy5fY29sb3I7IH1cbiAgc2V0IGNvbG9yKHZhbHVlOiBUaGVtZVBhbGV0dGUpIHtcbiAgICB0aGlzLl9zZXRDb2xvcih2YWx1ZSk7XG4gICAgdGhpcy5fY29sb3IgPSB2YWx1ZTtcbiAgfVxuICBwcml2YXRlIF9jb2xvcjogVGhlbWVQYWxldHRlID0gJ3ByaW1hcnknO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBiYWRnZSBzaG91bGQgb3ZlcmxhcCBpdHMgY29udGVudHMgb3Igbm90ICovXG4gIEBJbnB1dCgnbWF0QmFkZ2VPdmVybGFwJylcbiAgZ2V0IG92ZXJsYXAoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLl9vdmVybGFwOyB9XG4gIHNldCBvdmVybGFwKHZhbDogYm9vbGVhbikge1xuICAgIHRoaXMuX292ZXJsYXAgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodmFsKTtcbiAgfVxuICBwcml2YXRlIF9vdmVybGFwOiBib29sZWFuID0gdHJ1ZTtcblxuICAvKipcbiAgICogUG9zaXRpb24gdGhlIGJhZGdlIHNob3VsZCByZXNpZGUuXG4gICAqIEFjY2VwdHMgYW55IGNvbWJpbmF0aW9uIG9mICdhYm92ZSd8J2JlbG93JyBhbmQgJ2JlZm9yZSd8J2FmdGVyJ1xuICAgKi9cbiAgQElucHV0KCdtYXRCYWRnZVBvc2l0aW9uJykgcG9zaXRpb246IE1hdEJhZGdlUG9zaXRpb24gPSAnYWJvdmUgYWZ0ZXInO1xuXG4gIC8qKiBUaGUgY29udGVudCBmb3IgdGhlIGJhZGdlICovXG4gIEBJbnB1dCgnbWF0QmFkZ2UnKSBjb250ZW50OiBzdHJpbmcgfCBudW1iZXIgfCB1bmRlZmluZWQgfCBudWxsO1xuXG4gIC8qKiBNZXNzYWdlIHVzZWQgdG8gZGVzY3JpYmUgdGhlIGRlY29yYXRlZCBlbGVtZW50IHZpYSBhcmlhLWRlc2NyaWJlZGJ5ICovXG4gIEBJbnB1dCgnbWF0QmFkZ2VEZXNjcmlwdGlvbicpXG4gIGdldCBkZXNjcmlwdGlvbigpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5fZGVzY3JpcHRpb247IH1cbiAgc2V0IGRlc2NyaXB0aW9uKG5ld0Rlc2NyaXB0aW9uOiBzdHJpbmcpIHtcbiAgICBpZiAobmV3RGVzY3JpcHRpb24gIT09IHRoaXMuX2Rlc2NyaXB0aW9uKSB7XG4gICAgICBjb25zdCBiYWRnZUVsZW1lbnQgPSB0aGlzLl9iYWRnZUVsZW1lbnQ7XG4gICAgICB0aGlzLl91cGRhdGVIb3N0QXJpYURlc2NyaXB0aW9uKG5ld0Rlc2NyaXB0aW9uLCB0aGlzLl9kZXNjcmlwdGlvbik7XG4gICAgICB0aGlzLl9kZXNjcmlwdGlvbiA9IG5ld0Rlc2NyaXB0aW9uO1xuXG4gICAgICBpZiAoYmFkZ2VFbGVtZW50KSB7XG4gICAgICAgIG5ld0Rlc2NyaXB0aW9uID8gYmFkZ2VFbGVtZW50LnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcsIG5ld0Rlc2NyaXB0aW9uKSA6XG4gICAgICAgICAgICBiYWRnZUVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKCdhcmlhLWxhYmVsJyk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHByaXZhdGUgX2Rlc2NyaXB0aW9uOiBzdHJpbmc7XG5cbiAgLyoqIFNpemUgb2YgdGhlIGJhZGdlLiBDYW4gYmUgJ3NtYWxsJywgJ21lZGl1bScsIG9yICdsYXJnZScuICovXG4gIEBJbnB1dCgnbWF0QmFkZ2VTaXplJykgc2l6ZTogTWF0QmFkZ2VTaXplID0gJ21lZGl1bSc7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGJhZGdlIGlzIGhpZGRlbi4gKi9cbiAgQElucHV0KCdtYXRCYWRnZUhpZGRlbicpXG4gIGdldCBoaWRkZW4oKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLl9oaWRkZW47IH1cbiAgc2V0IGhpZGRlbih2YWw6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9oaWRkZW4gPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodmFsKTtcbiAgfVxuICBwcml2YXRlIF9oaWRkZW46IGJvb2xlYW47XG5cbiAgLyoqIFVuaXF1ZSBpZCBmb3IgdGhlIGJhZGdlICovXG4gIF9pZDogbnVtYmVyID0gbmV4dElkKys7XG5cbiAgcHJpdmF0ZSBfYmFkZ2VFbGVtZW50OiBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgX25nWm9uZTogTmdab25lLFxuICAgICAgcHJpdmF0ZSBfZWxlbWVudFJlZjogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sXG4gICAgICBwcml2YXRlIF9hcmlhRGVzY3JpYmVyOiBBcmlhRGVzY3JpYmVyLFxuICAgICAgcHJpdmF0ZSBfcmVuZGVyZXI6IFJlbmRlcmVyMixcbiAgICAgIEBPcHRpb25hbCgpIEBJbmplY3QoQU5JTUFUSU9OX01PRFVMRV9UWVBFKSBwcml2YXRlIF9hbmltYXRpb25Nb2RlPzogc3RyaW5nKSB7XG4gICAgICBzdXBlcigpO1xuXG4gICAgICBpZiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSB7XG4gICAgICAgIGNvbnN0IG5hdGl2ZUVsZW1lbnQgPSBfZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xuICAgICAgICBpZiAobmF0aXZlRWxlbWVudC5ub2RlVHlwZSAhPT0gbmF0aXZlRWxlbWVudC5FTEVNRU5UX05PREUpIHtcbiAgICAgICAgICB0aHJvdyBFcnJvcignbWF0QmFkZ2UgbXVzdCBiZSBhdHRhY2hlZCB0byBhbiBlbGVtZW50IG5vZGUuJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGJhZGdlIGlzIGFib3ZlIHRoZSBob3N0IG9yIG5vdCAqL1xuICBpc0Fib3ZlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnBvc2l0aW9uLmluZGV4T2YoJ2JlbG93JykgPT09IC0xO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGJhZGdlIGlzIGFmdGVyIHRoZSBob3N0IG9yIG5vdCAqL1xuICBpc0FmdGVyKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnBvc2l0aW9uLmluZGV4T2YoJ2JlZm9yZScpID09PSAtMTtcbiAgfVxuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpIHtcbiAgICBjb25zdCBjb250ZW50Q2hhbmdlID0gY2hhbmdlc1snY29udGVudCddO1xuXG4gICAgaWYgKGNvbnRlbnRDaGFuZ2UpIHtcbiAgICAgIGNvbnN0IHZhbHVlID0gY29udGVudENoYW5nZS5jdXJyZW50VmFsdWU7XG4gICAgICB0aGlzLl9oYXNDb250ZW50ID0gdmFsdWUgIT0gbnVsbCAmJiBgJHt2YWx1ZX1gLnRyaW0oKS5sZW5ndGggPiAwO1xuICAgICAgdGhpcy5fdXBkYXRlVGV4dENvbnRlbnQoKTtcbiAgICB9XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICBjb25zdCBiYWRnZUVsZW1lbnQgPSB0aGlzLl9iYWRnZUVsZW1lbnQ7XG5cbiAgICBpZiAoYmFkZ2VFbGVtZW50KSB7XG4gICAgICBpZiAodGhpcy5kZXNjcmlwdGlvbikge1xuICAgICAgICB0aGlzLl9hcmlhRGVzY3JpYmVyLnJlbW92ZURlc2NyaXB0aW9uKGJhZGdlRWxlbWVudCwgdGhpcy5kZXNjcmlwdGlvbik7XG4gICAgICB9XG5cbiAgICAgIC8vIFdoZW4gY3JlYXRpbmcgYSBiYWRnZSB0aHJvdWdoIHRoZSBSZW5kZXJlciwgQW5ndWxhciB3aWxsIGtlZXAgaXQgaW4gYW4gaW5kZXguXG4gICAgICAvLyBXZSBoYXZlIHRvIGRlc3Ryb3kgaXQgb3Vyc2VsdmVzLCBvdGhlcndpc2UgaXQnbGwgYmUgcmV0YWluZWQgaW4gbWVtb3J5LlxuICAgICAgaWYgKHRoaXMuX3JlbmRlcmVyLmRlc3Ryb3lOb2RlKSB7XG4gICAgICAgIHRoaXMuX3JlbmRlcmVyLmRlc3Ryb3lOb2RlKGJhZGdlRWxlbWVudCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIGVsZW1lbnQgaW50byB3aGljaCB0aGUgYmFkZ2UncyBjb250ZW50IGlzIGJlaW5nIHJlbmRlcmVkLlxuICAgKiBVbmRlZmluZWQgaWYgdGhlIGVsZW1lbnQgaGFzbid0IGJlZW4gY3JlYXRlZCAoZS5nLiBpZiB0aGUgYmFkZ2UgZG9lc24ndCBoYXZlIGNvbnRlbnQpLlxuICAgKi9cbiAgZ2V0QmFkZ2VFbGVtZW50KCk6IEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5fYmFkZ2VFbGVtZW50O1xuICB9XG5cbiAgLyoqIEluamVjdHMgYSBzcGFuIGVsZW1lbnQgaW50byB0aGUgRE9NIHdpdGggdGhlIGNvbnRlbnQuICovXG4gIHByaXZhdGUgX3VwZGF0ZVRleHRDb250ZW50KCk6IEhUTUxTcGFuRWxlbWVudCB7XG4gICAgaWYgKCF0aGlzLl9iYWRnZUVsZW1lbnQpIHtcbiAgICAgIHRoaXMuX2JhZGdlRWxlbWVudCA9IHRoaXMuX2NyZWF0ZUJhZGdlRWxlbWVudCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9iYWRnZUVsZW1lbnQudGV4dENvbnRlbnQgPSB0aGlzLl9zdHJpbmdpZnlDb250ZW50KCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9iYWRnZUVsZW1lbnQ7XG4gIH1cblxuICAvKiogQ3JlYXRlcyB0aGUgYmFkZ2UgZWxlbWVudCAqL1xuICBwcml2YXRlIF9jcmVhdGVCYWRnZUVsZW1lbnQoKTogSFRNTEVsZW1lbnQge1xuICAgIGNvbnN0IGJhZGdlRWxlbWVudCA9IHRoaXMuX3JlbmRlcmVyLmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICBjb25zdCBhY3RpdmVDbGFzcyA9ICdtYXQtYmFkZ2UtYWN0aXZlJztcbiAgICBjb25zdCBjb250ZW50Q2xhc3MgPSAnbWF0LWJhZGdlLWNvbnRlbnQnO1xuXG4gICAgLy8gQ2xlYXIgYW55IGV4aXN0aW5nIGJhZGdlcyB3aGljaCBtYXkgaGF2ZSBwZXJzaXN0ZWQgZnJvbSBhIHNlcnZlci1zaWRlIHJlbmRlci5cbiAgICB0aGlzLl9jbGVhckV4aXN0aW5nQmFkZ2VzKGNvbnRlbnRDbGFzcyk7XG4gICAgYmFkZ2VFbGVtZW50LnNldEF0dHJpYnV0ZSgnaWQnLCBgbWF0LWJhZGdlLWNvbnRlbnQtJHt0aGlzLl9pZH1gKTtcbiAgICBiYWRnZUVsZW1lbnQuY2xhc3NMaXN0LmFkZChjb250ZW50Q2xhc3MpO1xuICAgIGJhZGdlRWxlbWVudC50ZXh0Q29udGVudCA9IHRoaXMuX3N0cmluZ2lmeUNvbnRlbnQoKTtcblxuICAgIGlmICh0aGlzLl9hbmltYXRpb25Nb2RlID09PSAnTm9vcEFuaW1hdGlvbnMnKSB7XG4gICAgICBiYWRnZUVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnX21hdC1hbmltYXRpb24tbm9vcGFibGUnKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5kZXNjcmlwdGlvbikge1xuICAgICAgYmFkZ2VFbGVtZW50LnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcsIHRoaXMuZGVzY3JpcHRpb24pO1xuICAgIH1cblxuICAgIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5hcHBlbmRDaGlsZChiYWRnZUVsZW1lbnQpO1xuXG4gICAgLy8gYW5pbWF0ZSBpbiBhZnRlciBpbnNlcnRpb25cbiAgICBpZiAodHlwZW9mIHJlcXVlc3RBbmltYXRpb25GcmFtZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0aGlzLl9hbmltYXRpb25Nb2RlICE9PSAnTm9vcEFuaW1hdGlvbnMnKSB7XG4gICAgICB0aGlzLl9uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgICAgIGJhZGdlRWxlbWVudC5jbGFzc0xpc3QuYWRkKGFjdGl2ZUNsYXNzKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgYmFkZ2VFbGVtZW50LmNsYXNzTGlzdC5hZGQoYWN0aXZlQ2xhc3MpO1xuICAgIH1cblxuICAgIHJldHVybiBiYWRnZUVsZW1lbnQ7XG4gIH1cblxuICAvKiogU2V0cyB0aGUgYXJpYS1sYWJlbCBwcm9wZXJ0eSBvbiB0aGUgZWxlbWVudCAqL1xuICBwcml2YXRlIF91cGRhdGVIb3N0QXJpYURlc2NyaXB0aW9uKG5ld0Rlc2NyaXB0aW9uOiBzdHJpbmcsIG9sZERlc2NyaXB0aW9uOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAvLyBlbnN1cmUgY29udGVudCBhdmFpbGFibGUgYmVmb3JlIHNldHRpbmcgbGFiZWxcbiAgICBjb25zdCBjb250ZW50ID0gdGhpcy5fdXBkYXRlVGV4dENvbnRlbnQoKTtcblxuICAgIGlmIChvbGREZXNjcmlwdGlvbikge1xuICAgICAgdGhpcy5fYXJpYURlc2NyaWJlci5yZW1vdmVEZXNjcmlwdGlvbihjb250ZW50LCBvbGREZXNjcmlwdGlvbik7XG4gICAgfVxuXG4gICAgaWYgKG5ld0Rlc2NyaXB0aW9uKSB7XG4gICAgICB0aGlzLl9hcmlhRGVzY3JpYmVyLmRlc2NyaWJlKGNvbnRlbnQsIG5ld0Rlc2NyaXB0aW9uKTtcbiAgICB9XG4gIH1cblxuICAvKiogQWRkcyBjc3MgdGhlbWUgY2xhc3MgZ2l2ZW4gdGhlIGNvbG9yIHRvIHRoZSBjb21wb25lbnQgaG9zdCAqL1xuICBwcml2YXRlIF9zZXRDb2xvcihjb2xvclBhbGV0dGU6IFRoZW1lUGFsZXR0ZSkge1xuICAgIGlmIChjb2xvclBhbGV0dGUgIT09IHRoaXMuX2NvbG9yKSB7XG4gICAgICBjb25zdCBjbGFzc0xpc3QgPSB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuY2xhc3NMaXN0O1xuICAgICAgaWYgKHRoaXMuX2NvbG9yKSB7XG4gICAgICAgIGNsYXNzTGlzdC5yZW1vdmUoYG1hdC1iYWRnZS0ke3RoaXMuX2NvbG9yfWApO1xuICAgICAgfVxuICAgICAgaWYgKGNvbG9yUGFsZXR0ZSkge1xuICAgICAgICBjbGFzc0xpc3QuYWRkKGBtYXQtYmFkZ2UtJHtjb2xvclBhbGV0dGV9YCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqIENsZWFycyBhbnkgZXhpc3RpbmcgYmFkZ2VzIHRoYXQgbWlnaHQgYmUgbGVmdCBvdmVyIGZyb20gc2VydmVyLXNpZGUgcmVuZGVyaW5nLiAqL1xuICBwcml2YXRlIF9jbGVhckV4aXN0aW5nQmFkZ2VzKGNzc0NsYXNzOiBzdHJpbmcpIHtcbiAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xuICAgIGxldCBjaGlsZENvdW50ID0gZWxlbWVudC5jaGlsZHJlbi5sZW5ndGg7XG5cbiAgICAvLyBVc2UgYSByZXZlcnNlIHdoaWxlLCBiZWNhdXNlIHdlJ2xsIGJlIHJlbW92aW5nIGVsZW1lbnRzIGZyb20gdGhlIGxpc3QgYXMgd2UncmUgaXRlcmF0aW5nLlxuICAgIHdoaWxlIChjaGlsZENvdW50LS0pIHtcbiAgICAgIGNvbnN0IGN1cnJlbnRDaGlsZCA9IGVsZW1lbnQuY2hpbGRyZW5bY2hpbGRDb3VudF07XG5cbiAgICAgIGlmIChjdXJyZW50Q2hpbGQuY2xhc3NMaXN0LmNvbnRhaW5zKGNzc0NsYXNzKSkge1xuICAgICAgICBlbGVtZW50LnJlbW92ZUNoaWxkKGN1cnJlbnRDaGlsZCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqIEdldHMgdGhlIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgYmFkZ2UgY29udGVudC4gKi9cbiAgcHJpdmF0ZSBfc3RyaW5naWZ5Q29udGVudCgpOiBzdHJpbmcge1xuICAgIC8vIENvbnZlcnQgbnVsbCBhbmQgdW5kZWZpbmVkIHRvIGFuIGVtcHR5IHN0cmluZyB3aGljaCBpcyBjb25zaXN0ZW50XG4gICAgLy8gd2l0aCBob3cgQW5ndWxhciBoYW5kbGVzIHRoZW0gaW4gaW5zaWRlIHRlbXBsYXRlIGludGVycG9sYXRpb25zLlxuICAgIGNvbnN0IGNvbnRlbnQgPSB0aGlzLmNvbnRlbnQ7XG4gICAgcmV0dXJuIGNvbnRlbnQgPT0gbnVsbCA/ICcnIDogYCR7Y29udGVudH1gO1xuICB9XG5cbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2Rpc2FibGVkOiBCb29sZWFuSW5wdXQ7XG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9oaWRkZW46IEJvb2xlYW5JbnB1dDtcbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX292ZXJsYXA6IEJvb2xlYW5JbnB1dDtcbn1cbiJdfQ==