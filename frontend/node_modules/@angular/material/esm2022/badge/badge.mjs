/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AriaDescriber, InteractivityChecker } from '@angular/cdk/a11y';
import { DOCUMENT } from '@angular/common';
import { ApplicationRef, booleanAttribute, ChangeDetectionStrategy, Component, createComponent, Directive, ElementRef, EnvironmentInjector, inject, Inject, Input, NgZone, Optional, Renderer2, ViewEncapsulation, ANIMATION_MODULE_TYPE, } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/a11y";
let nextId = 0;
const BADGE_CONTENT_CLASS = 'mat-badge-content';
/** Keeps track of the apps currently containing badges. */
const badgeApps = new Set();
/**
 * Component used to load the structural styles of the badge.
 * @docs-private
 */
export class _MatBadgeStyleLoader {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.2.0", ngImport: i0, type: _MatBadgeStyleLoader, deps: [], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "17.2.0", type: _MatBadgeStyleLoader, isStandalone: true, selector: "ng-component", ngImport: i0, template: '', isInline: true, styles: [".mat-badge{position:relative}.mat-badge.mat-badge{overflow:visible}.mat-badge-content{position:absolute;text-align:center;display:inline-block;transition:transform 200ms ease-in-out;transform:scale(0.6);overflow:hidden;white-space:nowrap;text-overflow:ellipsis;box-sizing:border-box;pointer-events:none;background-color:var(--mat-badge-background-color);color:var(--mat-badge-text-color);font-family:var(--mat-badge-text-font);font-weight:var(--mat-badge-text-weight);border-radius:var(--mat-badge-container-shape)}.cdk-high-contrast-active .mat-badge-content{outline:solid 1px;border-radius:0}.mat-badge-above .mat-badge-content{bottom:100%}.mat-badge-below .mat-badge-content{top:100%}.mat-badge-before .mat-badge-content{right:100%}[dir=rtl] .mat-badge-before .mat-badge-content{right:auto;left:100%}.mat-badge-after .mat-badge-content{left:100%}[dir=rtl] .mat-badge-after .mat-badge-content{left:auto;right:100%}.mat-badge-disabled .mat-badge-content{background-color:var(--mat-badge-disabled-state-background-color);color:var(--mat-badge-disabled-state-text-color)}.mat-badge-hidden .mat-badge-content{display:none}.ng-animate-disabled .mat-badge-content,.mat-badge-content._mat-animation-noopable{transition:none}.mat-badge-content.mat-badge-active{transform:none}.mat-badge-small .mat-badge-content{width:var(--mat-badge-legacy-small-size-container-size, unset);height:var(--mat-badge-legacy-small-size-container-size, unset);min-width:var(--mat-badge-small-size-container-size, unset);min-height:var(--mat-badge-small-size-container-size, unset);line-height:var(--mat-badge-legacy-small-size-container-size, var(--mat-badge-small-size-container-size));padding:var(--mat-badge-small-size-container-padding);font-size:var(--mat-badge-small-size-text-size);margin:var(--mat-badge-small-size-container-offset)}.mat-badge-small.mat-badge-overlap .mat-badge-content{margin:var(--mat-badge-small-size-container-overlap-offset)}.mat-badge-medium .mat-badge-content{width:var(--mat-badge-legacy-container-size, unset);height:var(--mat-badge-legacy-container-size, unset);min-width:var(--mat-badge-container-size, unset);min-height:var(--mat-badge-container-size, unset);line-height:var(--mat-badge-legacy-container-size, var(--mat-badge-container-size));padding:var(--mat-badge-container-padding);font-size:var(--mat-badge-text-size);margin:var(--mat-badge-container-offset)}.mat-badge-medium.mat-badge-overlap .mat-badge-content{margin:var(--mat-badge-container-overlap-offset)}.mat-badge-large .mat-badge-content{width:var(--mat-badge-legacy-large-size-container-size, unset);height:var(--mat-badge-legacy-large-size-container-size, unset);min-width:var(--mat-badge-large-size-container-size, unset);min-height:var(--mat-badge-large-size-container-size, unset);line-height:var(--mat-badge-legacy-large-size-container-size, var(--mat-badge-large-size-container-size));padding:var(--mat-badge-large-size-container-padding);font-size:var(--mat-badge-large-size-text-size);margin:var(--mat-badge-large-size-container-offset)}.mat-badge-large.mat-badge-overlap .mat-badge-content{margin:var(--mat-badge-large-size-container-overlap-offset)}"], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.2.0", ngImport: i0, type: _MatBadgeStyleLoader, decorators: [{
            type: Component,
            args: [{ standalone: true, encapsulation: ViewEncapsulation.None, template: '', changeDetection: ChangeDetectionStrategy.OnPush, styles: [".mat-badge{position:relative}.mat-badge.mat-badge{overflow:visible}.mat-badge-content{position:absolute;text-align:center;display:inline-block;transition:transform 200ms ease-in-out;transform:scale(0.6);overflow:hidden;white-space:nowrap;text-overflow:ellipsis;box-sizing:border-box;pointer-events:none;background-color:var(--mat-badge-background-color);color:var(--mat-badge-text-color);font-family:var(--mat-badge-text-font);font-weight:var(--mat-badge-text-weight);border-radius:var(--mat-badge-container-shape)}.cdk-high-contrast-active .mat-badge-content{outline:solid 1px;border-radius:0}.mat-badge-above .mat-badge-content{bottom:100%}.mat-badge-below .mat-badge-content{top:100%}.mat-badge-before .mat-badge-content{right:100%}[dir=rtl] .mat-badge-before .mat-badge-content{right:auto;left:100%}.mat-badge-after .mat-badge-content{left:100%}[dir=rtl] .mat-badge-after .mat-badge-content{left:auto;right:100%}.mat-badge-disabled .mat-badge-content{background-color:var(--mat-badge-disabled-state-background-color);color:var(--mat-badge-disabled-state-text-color)}.mat-badge-hidden .mat-badge-content{display:none}.ng-animate-disabled .mat-badge-content,.mat-badge-content._mat-animation-noopable{transition:none}.mat-badge-content.mat-badge-active{transform:none}.mat-badge-small .mat-badge-content{width:var(--mat-badge-legacy-small-size-container-size, unset);height:var(--mat-badge-legacy-small-size-container-size, unset);min-width:var(--mat-badge-small-size-container-size, unset);min-height:var(--mat-badge-small-size-container-size, unset);line-height:var(--mat-badge-legacy-small-size-container-size, var(--mat-badge-small-size-container-size));padding:var(--mat-badge-small-size-container-padding);font-size:var(--mat-badge-small-size-text-size);margin:var(--mat-badge-small-size-container-offset)}.mat-badge-small.mat-badge-overlap .mat-badge-content{margin:var(--mat-badge-small-size-container-overlap-offset)}.mat-badge-medium .mat-badge-content{width:var(--mat-badge-legacy-container-size, unset);height:var(--mat-badge-legacy-container-size, unset);min-width:var(--mat-badge-container-size, unset);min-height:var(--mat-badge-container-size, unset);line-height:var(--mat-badge-legacy-container-size, var(--mat-badge-container-size));padding:var(--mat-badge-container-padding);font-size:var(--mat-badge-text-size);margin:var(--mat-badge-container-offset)}.mat-badge-medium.mat-badge-overlap .mat-badge-content{margin:var(--mat-badge-container-overlap-offset)}.mat-badge-large .mat-badge-content{width:var(--mat-badge-legacy-large-size-container-size, unset);height:var(--mat-badge-legacy-large-size-container-size, unset);min-width:var(--mat-badge-large-size-container-size, unset);min-height:var(--mat-badge-large-size-container-size, unset);line-height:var(--mat-badge-legacy-large-size-container-size, var(--mat-badge-large-size-container-size));padding:var(--mat-badge-large-size-container-padding);font-size:var(--mat-badge-large-size-text-size);margin:var(--mat-badge-large-size-container-offset)}.mat-badge-large.mat-badge-overlap .mat-badge-content{margin:var(--mat-badge-large-size-container-overlap-offset)}"] }]
        }] });
/** Directive to display a text badge. */
export class MatBadge {
    /** The color of the badge. Can be `primary`, `accent`, or `warn`. */
    get color() {
        return this._color;
    }
    set color(value) {
        this._setColor(value);
        this._color = value;
    }
    /** The content for the badge */
    get content() {
        return this._content;
    }
    set content(newContent) {
        this._updateRenderedContent(newContent);
    }
    /** Message used to describe the decorated element via aria-describedby */
    get description() {
        return this._description;
    }
    set description(newDescription) {
        this._updateDescription(newDescription);
    }
    constructor(_ngZone, _elementRef, _ariaDescriber, _renderer, _animationMode) {
        this._ngZone = _ngZone;
        this._elementRef = _elementRef;
        this._ariaDescriber = _ariaDescriber;
        this._renderer = _renderer;
        this._animationMode = _animationMode;
        this._color = 'primary';
        /** Whether the badge should overlap its contents or not */
        this.overlap = true;
        /**
         * Position the badge should reside.
         * Accepts any combination of 'above'|'below' and 'before'|'after'
         */
        this.position = 'above after';
        /** Size of the badge. Can be 'small', 'medium', or 'large'. */
        this.size = 'medium';
        /** Unique id for the badge */
        this._id = nextId++;
        /** Whether the OnInit lifecycle hook has run yet */
        this._isInitialized = false;
        /** InteractivityChecker to determine if the badge host is focusable. */
        this._interactivityChecker = inject(InteractivityChecker);
        this._document = inject(DOCUMENT);
        const appRef = inject(ApplicationRef);
        if (!badgeApps.has(appRef)) {
            badgeApps.add(appRef);
            const componentRef = createComponent(_MatBadgeStyleLoader, {
                environmentInjector: inject(EnvironmentInjector),
            });
            appRef.onDestroy(() => {
                badgeApps.delete(appRef);
                if (badgeApps.size === 0) {
                    componentRef.destroy();
                }
            });
        }
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
            const nativeElement = _elementRef.nativeElement;
            if (nativeElement.nodeType !== nativeElement.ELEMENT_NODE) {
                throw Error('matBadge must be attached to an element node.');
            }
            const matIconTagName = 'mat-icon';
            // Heads-up for developers to avoid putting matBadge on <mat-icon>
            // as it is aria-hidden by default docs mention this at:
            // https://material.angular.io/components/badge/overview#accessibility
            if (nativeElement.tagName.toLowerCase() === matIconTagName &&
                nativeElement.getAttribute('aria-hidden') === 'true') {
                console.warn(`Detected a matBadge on an "aria-hidden" "<mat-icon>". ` +
                    `Consider setting aria-hidden="false" in order to surface the information assistive technology.` +
                    `\n${nativeElement.outerHTML}`);
            }
        }
    }
    /** Whether the badge is above the host or not */
    isAbove() {
        return this.position.indexOf('below') === -1;
    }
    /** Whether the badge is after the host or not */
    isAfter() {
        return this.position.indexOf('before') === -1;
    }
    /**
     * Gets the element into which the badge's content is being rendered. Undefined if the element
     * hasn't been created (e.g. if the badge doesn't have content).
     */
    getBadgeElement() {
        return this._badgeElement;
    }
    ngOnInit() {
        // We may have server-side rendered badge that we need to clear.
        // We need to do this in ngOnInit because the full content of the component
        // on which the badge is attached won't necessarily be in the DOM until this point.
        this._clearExistingBadges();
        if (this.content && !this._badgeElement) {
            this._badgeElement = this._createBadgeElement();
            this._updateRenderedContent(this.content);
        }
        this._isInitialized = true;
    }
    ngOnDestroy() {
        // ViewEngine only: when creating a badge through the Renderer, Angular remembers its index.
        // We have to destroy it ourselves, otherwise it'll be retained in memory.
        if (this._renderer.destroyNode) {
            this._renderer.destroyNode(this._badgeElement);
            this._inlineBadgeDescription?.remove();
        }
        this._ariaDescriber.removeDescription(this._elementRef.nativeElement, this.description);
    }
    /** Gets whether the badge's host element is interactive. */
    _isHostInteractive() {
        // Ignore visibility since it requires an expensive style caluclation.
        return this._interactivityChecker.isFocusable(this._elementRef.nativeElement, {
            ignoreVisibility: true,
        });
    }
    /** Creates the badge element */
    _createBadgeElement() {
        const badgeElement = this._renderer.createElement('span');
        const activeClass = 'mat-badge-active';
        badgeElement.setAttribute('id', `mat-badge-content-${this._id}`);
        // The badge is aria-hidden because we don't want it to appear in the page's navigation
        // flow. Instead, we use the badge to describe the decorated element with aria-describedby.
        badgeElement.setAttribute('aria-hidden', 'true');
        badgeElement.classList.add(BADGE_CONTENT_CLASS);
        if (this._animationMode === 'NoopAnimations') {
            badgeElement.classList.add('_mat-animation-noopable');
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
    /** Update the text content of the badge element in the DOM, creating the element if necessary. */
    _updateRenderedContent(newContent) {
        const newContentNormalized = `${newContent ?? ''}`.trim();
        // Don't create the badge element if the directive isn't initialized because we want to
        // append the badge element to the *end* of the host element's content for backwards
        // compatibility.
        if (this._isInitialized && newContentNormalized && !this._badgeElement) {
            this._badgeElement = this._createBadgeElement();
        }
        if (this._badgeElement) {
            this._badgeElement.textContent = newContentNormalized;
        }
        this._content = newContentNormalized;
    }
    /** Updates the host element's aria description via AriaDescriber. */
    _updateDescription(newDescription) {
        // Always start by removing the aria-describedby; we will add a new one if necessary.
        this._ariaDescriber.removeDescription(this._elementRef.nativeElement, this.description);
        // NOTE: We only check whether the host is interactive here, which happens during
        // when then badge content changes. It is possible that the host changes
        // interactivity status separate from one of these. However, watching the interactivity
        // status of the host would require a `MutationObserver`, which is likely more code + overhead
        // than it's worth; from usages inside Google, we see that the vats majority of badges either
        // never change interactivity, or also set `matBadgeHidden` based on the same condition.
        if (!newDescription || this._isHostInteractive()) {
            this._removeInlineDescription();
        }
        this._description = newDescription;
        // We don't add `aria-describedby` for non-interactive hosts elements because we
        // instead insert the description inline.
        if (this._isHostInteractive()) {
            this._ariaDescriber.describe(this._elementRef.nativeElement, newDescription);
        }
        else {
            this._updateInlineDescription();
        }
    }
    _updateInlineDescription() {
        // Create the inline description element if it doesn't exist
        if (!this._inlineBadgeDescription) {
            this._inlineBadgeDescription = this._document.createElement('span');
            this._inlineBadgeDescription.classList.add('cdk-visually-hidden');
        }
        this._inlineBadgeDescription.textContent = this.description;
        this._badgeElement?.appendChild(this._inlineBadgeDescription);
    }
    _removeInlineDescription() {
        this._inlineBadgeDescription?.remove();
        this._inlineBadgeDescription = undefined;
    }
    /** Adds css theme class given the color to the component host */
    _setColor(colorPalette) {
        const classList = this._elementRef.nativeElement.classList;
        classList.remove(`mat-badge-${this._color}`);
        if (colorPalette) {
            classList.add(`mat-badge-${colorPalette}`);
        }
    }
    /** Clears any existing badges that might be left over from server-side rendering. */
    _clearExistingBadges() {
        // Only check direct children of this host element in order to avoid deleting
        // any badges that might exist in descendant elements.
        const badges = this._elementRef.nativeElement.querySelectorAll(`:scope > .${BADGE_CONTENT_CLASS}`);
        for (const badgeElement of Array.from(badges)) {
            if (badgeElement !== this._badgeElement) {
                badgeElement.remove();
            }
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.2.0", ngImport: i0, type: MatBadge, deps: [{ token: i0.NgZone }, { token: i0.ElementRef }, { token: i1.AriaDescriber }, { token: i0.Renderer2 }, { token: ANIMATION_MODULE_TYPE, optional: true }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "17.2.0", type: MatBadge, isStandalone: true, selector: "[matBadge]", inputs: { color: ["matBadgeColor", "color"], overlap: ["matBadgeOverlap", "overlap", booleanAttribute], disabled: ["matBadgeDisabled", "disabled", booleanAttribute], position: ["matBadgePosition", "position"], content: ["matBadge", "content"], description: ["matBadgeDescription", "description"], size: ["matBadgeSize", "size"], hidden: ["matBadgeHidden", "hidden", booleanAttribute] }, host: { properties: { "class.mat-badge-overlap": "overlap", "class.mat-badge-above": "isAbove()", "class.mat-badge-below": "!isAbove()", "class.mat-badge-before": "!isAfter()", "class.mat-badge-after": "isAfter()", "class.mat-badge-small": "size === \"small\"", "class.mat-badge-medium": "size === \"medium\"", "class.mat-badge-large": "size === \"large\"", "class.mat-badge-hidden": "hidden || !content", "class.mat-badge-disabled": "disabled" }, classAttribute: "mat-badge" }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.2.0", ngImport: i0, type: MatBadge, decorators: [{
            type: Directive,
            args: [{
                    selector: '[matBadge]',
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
                        '[class.mat-badge-hidden]': 'hidden || !content',
                        '[class.mat-badge-disabled]': 'disabled',
                    },
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.NgZone }, { type: i0.ElementRef }, { type: i1.AriaDescriber }, { type: i0.Renderer2 }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [ANIMATION_MODULE_TYPE]
                }] }], propDecorators: { color: [{
                type: Input,
                args: ['matBadgeColor']
            }], overlap: [{
                type: Input,
                args: [{ alias: 'matBadgeOverlap', transform: booleanAttribute }]
            }], disabled: [{
                type: Input,
                args: [{ alias: 'matBadgeDisabled', transform: booleanAttribute }]
            }], position: [{
                type: Input,
                args: ['matBadgePosition']
            }], content: [{
                type: Input,
                args: ['matBadge']
            }], description: [{
                type: Input,
                args: ['matBadgeDescription']
            }], size: [{
                type: Input,
                args: ['matBadgeSize']
            }], hidden: [{
                type: Input,
                args: [{ alias: 'matBadgeHidden', transform: booleanAttribute }]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFkZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvYmFkZ2UvYmFkZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGFBQWEsRUFBRSxvQkFBb0IsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ3RFLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUN6QyxPQUFPLEVBQ0wsY0FBYyxFQUNkLGdCQUFnQixFQUNoQix1QkFBdUIsRUFDdkIsU0FBUyxFQUNULGVBQWUsRUFDZixTQUFTLEVBQ1QsVUFBVSxFQUNWLG1CQUFtQixFQUNuQixNQUFNLEVBQ04sTUFBTSxFQUNOLEtBQUssRUFDTCxNQUFNLEVBR04sUUFBUSxFQUNSLFNBQVMsRUFDVCxpQkFBaUIsRUFDakIscUJBQXFCLEdBQ3RCLE1BQU0sZUFBZSxDQUFDOzs7QUFHdkIsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBZ0JmLE1BQU0sbUJBQW1CLEdBQUcsbUJBQW1CLENBQUM7QUFFaEQsMkRBQTJEO0FBQzNELE1BQU0sU0FBUyxHQUFHLElBQUksR0FBRyxFQUFrQixDQUFDO0FBRTVDOzs7R0FHRztBQVFILE1BQU0sT0FBTyxvQkFBb0I7OEdBQXBCLG9CQUFvQjtrR0FBcEIsb0JBQW9CLHdFQUhyQixFQUFFOzsyRkFHRCxvQkFBb0I7a0JBUGhDLFNBQVM7aUNBQ0ksSUFBSSxpQkFFRCxpQkFBaUIsQ0FBQyxJQUFJLFlBQzNCLEVBQUUsbUJBQ0ssdUJBQXVCLENBQUMsTUFBTTs7QUFJakQseUNBQXlDO0FBa0J6QyxNQUFNLE9BQU8sUUFBUTtJQUNuQixxRUFBcUU7SUFDckUsSUFDSSxLQUFLO1FBQ1AsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDO0lBQ3JCLENBQUM7SUFDRCxJQUFJLEtBQUssQ0FBQyxLQUFtQjtRQUMzQixJQUFJLENBQUMsU0FBUyxDQUFDLEtB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QUFLO3VCQUFDLEVBQUMsS0FBSyxFQUFFLGlCQUFpQixFQUFFLFNBQVMsRUFBRSxnQkFBZ0IsRUFBQztnQkFHRyxRQUFRO3NCQUF4RSxLQUFLO3VCQUFDLEVBQUMsS0FBSyxFQUFFLGtCQUFrQixFQUFFLFNBQVMsRUFBRSxnQkFBZ0IsRUFBQztnQkFNcEMsUUFBUTtzQkFBbEMsS0FBSzt1QkFBQyxrQkFBa0I7Z0JBSXJCLE9BQU87c0JBRFYsS0FBSzt1QkFBQyxVQUFVO2dCQVdiLFdBQVc7c0JBRGQsS0FBSzt1QkFBQyxxQkFBcUI7Z0JBVUwsSUFBSTtzQkFBMUIsS0FBSzt1QkFBQyxjQUFjO2dCQUcwQyxNQUFNO3NCQUFwRSxLQUFLO3VCQUFDLEVBQUMsS0FBSyxFQUFFLGdCQUFnQixFQUFFLFNBQVMsRUFBRSxnQkFBZ0IsRUFBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FyaWFEZXNjcmliZXIsIEludGVyYWN0aXZpdHlDaGVja2VyfSBmcm9tICdAYW5ndWxhci9jZGsvYTExeSc7XG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtcbiAgQXBwbGljYXRpb25SZWYsXG4gIGJvb2xlYW5BdHRyaWJ1dGUsXG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICBDb21wb25lbnQsXG4gIGNyZWF0ZUNvbXBvbmVudCxcbiAgRGlyZWN0aXZlLFxuICBFbGVtZW50UmVmLFxuICBFbnZpcm9ubWVudEluamVjdG9yLFxuICBpbmplY3QsXG4gIEluamVjdCxcbiAgSW5wdXQsXG4gIE5nWm9uZSxcbiAgT25EZXN0cm95LFxuICBPbkluaXQsXG4gIE9wdGlvbmFsLFxuICBSZW5kZXJlcjIsXG4gIFZpZXdFbmNhcHN1bGF0aW9uLFxuICBBTklNQVRJT05fTU9EVUxFX1RZUEUsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtUaGVtZVBhbGV0dGV9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2NvcmUnO1xuXG5sZXQgbmV4dElkID0gMDtcblxuLyoqIEFsbG93ZWQgcG9zaXRpb24gb3B0aW9ucyBmb3IgbWF0QmFkZ2VQb3NpdGlvbiAqL1xuZXhwb3J0IHR5cGUgTWF0QmFkZ2VQb3NpdGlvbiA9XG4gIHwgJ2Fib3ZlIGFmdGVyJ1xuICB8ICdhYm92ZSBiZWZvcmUnXG4gIHwgJ2JlbG93IGJlZm9yZSdcbiAgfCAnYmVsb3cgYWZ0ZXInXG4gIHwgJ2JlZm9yZSdcbiAgfCAnYWZ0ZXInXG4gIHwgJ2Fib3ZlJ1xuICB8ICdiZWxvdyc7XG5cbi8qKiBBbGxvd2VkIHNpemUgb3B0aW9ucyBmb3IgbWF0QmFkZ2VTaXplICovXG5leHBvcnQgdHlwZSBNYXRCYWRnZVNpemUgPSAnc21hbGwnIHwgJ21lZGl1bScgfCAnbGFyZ2UnO1xuXG5jb25zdCBCQURHRV9DT05URU5UX0NMQVNTID0gJ21hdC1iYWRnZS1jb250ZW50JztcblxuLyoqIEtlZXBzIHRyYWNrIG9mIHRoZSBhcHBzIGN1cnJlbnRseSBjb250YWluaW5nIGJhZGdlcy4gKi9cbmNvbnN0IGJhZGdlQXBwcyA9IG5ldyBTZXQ8QXBwbGljYXRpb25SZWY+KCk7XG5cbi8qKlxuICogQ29tcG9uZW50IHVzZWQgdG8gbG9hZCB0aGUgc3RydWN0dXJhbCBzdHlsZXMgb2YgdGhlIGJhZGdlLlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5AQ29tcG9uZW50KHtcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbiAgc3R5bGVVcmw6ICdiYWRnZS5jc3MnLFxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxuICB0ZW1wbGF0ZTogJycsXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxufSlcbmV4cG9ydCBjbGFzcyBfTWF0QmFkZ2VTdHlsZUxvYWRlciB7fVxuXG4vKiogRGlyZWN0aXZlIHRvIGRpc3BsYXkgYSB0ZXh0IGJhZGdlLiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW21hdEJhZGdlXScsXG4gIGhvc3Q6IHtcbiAgICAnY2xhc3MnOiAnbWF0LWJhZGdlJyxcbiAgICAnW2NsYXNzLm1hdC1iYWRnZS1vdmVybGFwXSc6ICdvdmVybGFwJyxcbiAgICAnW2NsYXNzLm1hdC1iYWRnZS1hYm92ZV0nOiAnaXNBYm92ZSgpJyxcbiAgICAnW2NsYXNzLm1hdC1iYWRnZS1iZWxvd10nOiAnIWlzQWJvdmUoKScsXG4gICAgJ1tjbGFzcy5tYXQtYmFkZ2UtYmVmb3JlXSc6ICchaXNBZnRlcigpJyxcbiAgICAnW2NsYXNzLm1hdC1iYWRnZS1hZnRlcl0nOiAnaXNBZnRlcigpJyxcbiAgICAnW2NsYXNzLm1hdC1iYWRnZS1zbWFsbF0nOiAnc2l6ZSA9PT0gXCJzbWFsbFwiJyxcbiAgICAnW2NsYXNzLm1hdC1iYWRnZS1tZWRpdW1dJzogJ3NpemUgPT09IFwibWVkaXVtXCInLFxuICAgICdbY2xhc3MubWF0LWJhZGdlLWxhcmdlXSc6ICdzaXplID09PSBcImxhcmdlXCInLFxuICAgICdbY2xhc3MubWF0LWJhZGdlLWhpZGRlbl0nOiAnaGlkZGVuIHx8ICFjb250ZW50JyxcbiAgICAnW2NsYXNzLm1hdC1iYWRnZS1kaXNhYmxlZF0nOiAnZGlzYWJsZWQnLFxuICB9LFxuICBzdGFuZGFsb25lOiB0cnVlLFxufSlcbmV4cG9ydCBjbGFzcyBNYXRCYWRnZSBpbXBsZW1lbnRzIE9uSW5pdCwgT25EZXN0cm95IHtcbiAgLyoqIFRoZSBjb2xvciBvZiB0aGUgYmFkZ2UuIENhbiBiZSBgcHJpbWFyeWAsIGBhY2NlbnRgLCBvciBgd2FybmAuICovXG4gIEBJbnB1dCgnbWF0QmFkZ2VDb2xvcicpXG4gIGdldCBjb2xvcigpOiBUaGVtZVBhbGV0dGUge1xuICAgIHJldHVybiB0aGlzLl9jb2xvcjtcbiAgfVxuICBzZXQgY29sb3IodmFsdWU6IFRoZW1lUGFsZXR0ZSkge1xuICAgIHRoaXMuX3NldENvbG9yKHZhbHVlKTtcbiAgICB0aGlzLl9jb2xvciA9IHZhbHVlO1xuICB9XG4gIHByaXZhdGUgX2NvbG9yOiBUaGVtZVBhbGV0dGUgPSAncHJpbWFyeSc7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGJhZGdlIHNob3VsZCBvdmVybGFwIGl0cyBjb250ZW50cyBvciBub3QgKi9cbiAgQElucHV0KHthbGlhczogJ21hdEJhZGdlT3ZlcmxhcCcsIHRyYW5zZm9ybTogYm9vbGVhbkF0dHJpYnV0ZX0pIG92ZXJsYXA6IGJvb2xlYW4gPSB0cnVlO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBiYWRnZSBpcyBkaXNhYmxlZC4gKi9cbiAgQElucHV0KHthbGlhczogJ21hdEJhZGdlRGlzYWJsZWQnLCB0cmFuc2Zvcm06IGJvb2xlYW5BdHRyaWJ1dGV9KSBkaXNhYmxlZDogYm9vbGVhbjtcblxuICAvKipcbiAgICogUG9zaXRpb24gdGhlIGJhZGdlIHNob3VsZCByZXNpZGUuXG4gICAqIEFjY2VwdHMgYW55IGNvbWJpbmF0aW9uIG9mICdhYm92ZSd8J2JlbG93JyBhbmQgJ2JlZm9yZSd8J2FmdGVyJ1xuICAgKi9cbiAgQElucHV0KCdtYXRCYWRnZVBvc2l0aW9uJykgcG9zaXRpb246IE1hdEJhZGdlUG9zaXRpb24gPSAnYWJvdmUgYWZ0ZXInO1xuXG4gIC8qKiBUaGUgY29udGVudCBmb3IgdGhlIGJhZGdlICovXG4gIEBJbnB1dCgnbWF0QmFkZ2UnKVxuICBnZXQgY29udGVudCgpOiBzdHJpbmcgfCBudW1iZXIgfCB1bmRlZmluZWQgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fY29udGVudDtcbiAgfVxuICBzZXQgY29udGVudChuZXdDb250ZW50OiBzdHJpbmcgfCBudW1iZXIgfCB1bmRlZmluZWQgfCBudWxsKSB7XG4gICAgdGhpcy5fdXBkYXRlUmVuZGVyZWRDb250ZW50KG5ld0NvbnRlbnQpO1xuICB9XG4gIHByaXZhdGUgX2NvbnRlbnQ6IHN0cmluZyB8IG51bWJlciB8IHVuZGVmaW5lZCB8IG51bGw7XG5cbiAgLyoqIE1lc3NhZ2UgdXNlZCB0byBkZXNjcmliZSB0aGUgZGVjb3JhdGVkIGVsZW1lbnQgdmlhIGFyaWEtZGVzY3JpYmVkYnkgKi9cbiAgQElucHV0KCdtYXRCYWRnZURlc2NyaXB0aW9uJylcbiAgZ2V0IGRlc2NyaXB0aW9uKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2Rlc2NyaXB0aW9uO1xuICB9XG4gIHNldCBkZXNjcmlwdGlvbihuZXdEZXNjcmlwdGlvbjogc3RyaW5nKSB7XG4gICAgdGhpcy5fdXBkYXRlRGVzY3JpcHRpb24obmV3RGVzY3JpcHRpb24pO1xuICB9XG4gIHByaXZhdGUgX2Rlc2NyaXB0aW9uOiBzdHJpbmc7XG5cbiAgLyoqIFNpemUgb2YgdGhlIGJhZGdlLiBDYW4gYmUgJ3NtYWxsJywgJ21lZGl1bScsIG9yICdsYXJnZScuICovXG4gIEBJbnB1dCgnbWF0QmFkZ2VTaXplJykgc2l6ZTogTWF0QmFkZ2VTaXplID0gJ21lZGl1bSc7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGJhZGdlIGlzIGhpZGRlbi4gKi9cbiAgQElucHV0KHthbGlhczogJ21hdEJhZGdlSGlkZGVuJywgdHJhbnNmb3JtOiBib29sZWFuQXR0cmlidXRlfSkgaGlkZGVuOiBib29sZWFuO1xuXG4gIC8qKiBVbmlxdWUgaWQgZm9yIHRoZSBiYWRnZSAqL1xuICBfaWQ6IG51bWJlciA9IG5leHRJZCsrO1xuXG4gIC8qKiBWaXNpYmxlIGJhZGdlIGVsZW1lbnQuICovXG4gIHByaXZhdGUgX2JhZGdlRWxlbWVudDogSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG5cbiAgLyoqIElubGluZSBiYWRnZSBkZXNjcmlwdGlvbi4gVXNlZCB3aGVuIHRoZSBiYWRnZSBpcyBhcHBsaWVkIHRvIG5vbi1pbnRlcmFjdGl2ZSBob3N0IGVsZW1lbnRzLiAqL1xuICBwcml2YXRlIF9pbmxpbmVCYWRnZURlc2NyaXB0aW9uOiBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZDtcblxuICAvKiogV2hldGhlciB0aGUgT25Jbml0IGxpZmVjeWNsZSBob29rIGhhcyBydW4geWV0ICovXG4gIHByaXZhdGUgX2lzSW5pdGlhbGl6ZWQgPSBmYWxzZTtcblxuICAvKiogSW50ZXJhY3Rpdml0eUNoZWNrZXIgdG8gZGV0ZXJtaW5lIGlmIHRoZSBiYWRnZSBob3N0IGlzIGZvY3VzYWJsZS4gKi9cbiAgcHJpdmF0ZSBfaW50ZXJhY3Rpdml0eUNoZWNrZXIgPSBpbmplY3QoSW50ZXJhY3Rpdml0eUNoZWNrZXIpO1xuXG4gIHByaXZhdGUgX2RvY3VtZW50ID0gaW5qZWN0KERPQ1VNRU5UKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIF9uZ1pvbmU6IE5nWm9uZSxcbiAgICBwcml2YXRlIF9lbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcbiAgICBwcml2YXRlIF9hcmlhRGVzY3JpYmVyOiBBcmlhRGVzY3JpYmVyLFxuICAgIHByaXZhdGUgX3JlbmRlcmVyOiBSZW5kZXJlcjIsXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChBTklNQVRJT05fTU9EVUxFX1RZUEUpIHByaXZhdGUgX2FuaW1hdGlvbk1vZGU/OiBzdHJpbmcsXG4gICkge1xuICAgIGNvbnN0IGFwcFJlZiA9IGluamVjdChBcHBsaWNhdGlvblJlZik7XG5cbiAgICBpZiAoIWJhZGdlQXBwcy5oYXMoYXBwUmVmKSkge1xuICAgICAgYmFkZ2VBcHBzLmFkZChhcHBSZWYpO1xuXG4gICAgICBjb25zdCBjb21wb25lbnRSZWYgPSBjcmVhdGVDb21wb25lbnQoX01hdEJhZGdlU3R5bGVMb2FkZXIsIHtcbiAgICAgICAgZW52aXJvbm1lbnRJbmplY3RvcjogaW5qZWN0KEVudmlyb25tZW50SW5qZWN0b3IpLFxuICAgICAgfSk7XG5cbiAgICAgIGFwcFJlZi5vbkRlc3Ryb3koKCkgPT4ge1xuICAgICAgICBiYWRnZUFwcHMuZGVsZXRlKGFwcFJlZik7XG4gICAgICAgIGlmIChiYWRnZUFwcHMuc2l6ZSA9PT0gMCkge1xuICAgICAgICAgIGNvbXBvbmVudFJlZi5kZXN0cm95KCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpIHtcbiAgICAgIGNvbnN0IG5hdGl2ZUVsZW1lbnQgPSBfZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xuICAgICAgaWYgKG5hdGl2ZUVsZW1lbnQubm9kZVR5cGUgIT09IG5hdGl2ZUVsZW1lbnQuRUxFTUVOVF9OT0RFKSB7XG4gICAgICAgIHRocm93IEVycm9yKCdtYXRCYWRnZSBtdXN0IGJlIGF0dGFjaGVkIHRvIGFuIGVsZW1lbnQgbm9kZS4nKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgbWF0SWNvblRhZ05hbWU6IHN0cmluZyA9ICdtYXQtaWNvbic7XG5cbiAgICAgIC8vIEhlYWRzLXVwIGZvciBkZXZlbG9wZXJzIHRvIGF2b2lkIHB1dHRpbmcgbWF0QmFkZ2Ugb24gPG1hdC1pY29uPlxuICAgICAgLy8gYXMgaXQgaXMgYXJpYS1oaWRkZW4gYnkgZGVmYXVsdCBkb2NzIG1lbnRpb24gdGhpcyBhdDpcbiAgICAgIC8vIGh0dHBzOi8vbWF0ZXJpYWwuYW5ndWxhci5pby9jb21wb25lbnRzL2JhZGdlL292ZXJ2aWV3I2FjY2Vzc2liaWxpdHlcbiAgICAgIGlmIChcbiAgICAgICAgbmF0aXZlRWxlbWVudC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09IG1hdEljb25UYWdOYW1lICYmXG4gICAgICAgIG5hdGl2ZUVsZW1lbnQuZ2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicpID09PSAndHJ1ZSdcbiAgICAgICkge1xuICAgICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICAgYERldGVjdGVkIGEgbWF0QmFkZ2Ugb24gYW4gXCJhcmlhLWhpZGRlblwiIFwiPG1hdC1pY29uPlwiLiBgICtcbiAgICAgICAgICAgIGBDb25zaWRlciBzZXR0aW5nIGFyaWEtaGlkZGVuPVwiZmFsc2VcIiBpbiBvcmRlciB0byBzdXJmYWNlIHRoZSBpbmZvcm1hdGlvbiBhc3Npc3RpdmUgdGVjaG5vbG9neS5gICtcbiAgICAgICAgICAgIGBcXG4ke25hdGl2ZUVsZW1lbnQub3V0ZXJIVE1MfWAsXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGJhZGdlIGlzIGFib3ZlIHRoZSBob3N0IG9yIG5vdCAqL1xuICBpc0Fib3ZlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnBvc2l0aW9uLmluZGV4T2YoJ2JlbG93JykgPT09IC0xO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGJhZGdlIGlzIGFmdGVyIHRoZSBob3N0IG9yIG5vdCAqL1xuICBpc0FmdGVyKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnBvc2l0aW9uLmluZGV4T2YoJ2JlZm9yZScpID09PSAtMTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBlbGVtZW50IGludG8gd2hpY2ggdGhlIGJhZGdlJ3MgY29udGVudCBpcyBiZWluZyByZW5kZXJlZC4gVW5kZWZpbmVkIGlmIHRoZSBlbGVtZW50XG4gICAqIGhhc24ndCBiZWVuIGNyZWF0ZWQgKGUuZy4gaWYgdGhlIGJhZGdlIGRvZXNuJ3QgaGF2ZSBjb250ZW50KS5cbiAgICovXG4gIGdldEJhZGdlRWxlbWVudCgpOiBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMuX2JhZGdlRWxlbWVudDtcbiAgfVxuXG4gIG5nT25Jbml0KCkge1xuICAgIC8vIFdlIG1heSBoYXZlIHNlcnZlci1zaWRlIHJlbmRlcmVkIGJhZGdlIHRoYXQgd2UgbmVlZCB0byBjbGVhci5cbiAgICAvLyBXZSBuZWVkIHRvIGRvIHRoaXMgaW4gbmdPbkluaXQgYmVjYXVzZSB0aGUgZnVsbCBjb250ZW50IG9mIHRoZSBjb21wb25lbnRcbiAgICAvLyBvbiB3aGljaCB0aGUgYmFkZ2UgaXMgYXR0YWNoZWQgd29uJ3QgbmVjZXNzYXJpbHkgYmUgaW4gdGhlIERPTSB1bnRpbCB0aGlzIHBvaW50LlxuICAgIHRoaXMuX2NsZWFyRXhpc3RpbmdCYWRnZXMoKTtcblxuICAgIGlmICh0aGlzLmNvbnRlbnQgJiYgIXRoaXMuX2JhZGdlRWxlbWVudCkge1xuICAgICAgdGhpcy5fYmFkZ2VFbGVtZW50ID0gdGhpcy5fY3JlYXRlQmFkZ2VFbGVtZW50KCk7XG4gICAgICB0aGlzLl91cGRhdGVSZW5kZXJlZENvbnRlbnQodGhpcy5jb250ZW50KTtcbiAgICB9XG5cbiAgICB0aGlzLl9pc0luaXRpYWxpemVkID0gdHJ1ZTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIC8vIFZpZXdFbmdpbmUgb25seTogd2hlbiBjcmVhdGluZyBhIGJhZGdlIHRocm91Z2ggdGhlIFJlbmRlcmVyLCBBbmd1bGFyIHJlbWVtYmVycyBpdHMgaW5kZXguXG4gICAgLy8gV2UgaGF2ZSB0byBkZXN0cm95IGl0IG91cnNlbHZlcywgb3RoZXJ3aXNlIGl0J2xsIGJlIHJldGFpbmVkIGluIG1lbW9yeS5cbiAgICBpZiAodGhpcy5fcmVuZGVyZXIuZGVzdHJveU5vZGUpIHtcbiAgICAgIHRoaXMuX3JlbmRlcmVyLmRlc3Ryb3lOb2RlKHRoaXMuX2JhZGdlRWxlbWVudCk7XG4gICAgICB0aGlzLl9pbmxpbmVCYWRnZURlc2NyaXB0aW9uPy5yZW1vdmUoKTtcbiAgICB9XG5cbiAgICB0aGlzLl9hcmlhRGVzY3JpYmVyLnJlbW92ZURlc2NyaXB0aW9uKHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudCwgdGhpcy5kZXNjcmlwdGlvbik7XG4gIH1cblxuICAvKiogR2V0cyB3aGV0aGVyIHRoZSBiYWRnZSdzIGhvc3QgZWxlbWVudCBpcyBpbnRlcmFjdGl2ZS4gKi9cbiAgcHJpdmF0ZSBfaXNIb3N0SW50ZXJhY3RpdmUoKTogYm9vbGVhbiB7XG4gICAgLy8gSWdub3JlIHZpc2liaWxpdHkgc2luY2UgaXQgcmVxdWlyZXMgYW4gZXhwZW5zaXZlIHN0eWxlIGNhbHVjbGF0aW9uLlxuICAgIHJldHVybiB0aGlzLl9pbnRlcmFjdGl2aXR5Q2hlY2tlci5pc0ZvY3VzYWJsZSh0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQsIHtcbiAgICAgIGlnbm9yZVZpc2liaWxpdHk6IHRydWUsXG4gICAgfSk7XG4gIH1cblxuICAvKiogQ3JlYXRlcyB0aGUgYmFkZ2UgZWxlbWVudCAqL1xuICBwcml2YXRlIF9jcmVhdGVCYWRnZUVsZW1lbnQoKTogSFRNTEVsZW1lbnQge1xuICAgIGNvbnN0IGJhZGdlRWxlbWVudCA9IHRoaXMuX3JlbmRlcmVyLmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICBjb25zdCBhY3RpdmVDbGFzcyA9ICdtYXQtYmFkZ2UtYWN0aXZlJztcblxuICAgIGJhZGdlRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2lkJywgYG1hdC1iYWRnZS1jb250ZW50LSR7dGhpcy5faWR9YCk7XG5cbiAgICAvLyBUaGUgYmFkZ2UgaXMgYXJpYS1oaWRkZW4gYmVjYXVzZSB3ZSBkb24ndCB3YW50IGl0IHRvIGFwcGVhciBpbiB0aGUgcGFnZSdzIG5hdmlnYXRpb25cbiAgICAvLyBmbG93LiBJbnN0ZWFkLCB3ZSB1c2UgdGhlIGJhZGdlIHRvIGRlc2NyaWJlIHRoZSBkZWNvcmF0ZWQgZWxlbWVudCB3aXRoIGFyaWEtZGVzY3JpYmVkYnkuXG4gICAgYmFkZ2VFbGVtZW50LnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCAndHJ1ZScpO1xuICAgIGJhZGdlRWxlbWVudC5jbGFzc0xpc3QuYWRkKEJBREdFX0NPTlRFTlRfQ0xBU1MpO1xuXG4gICAgaWYgKHRoaXMuX2FuaW1hdGlvbk1vZGUgPT09ICdOb29wQW5pbWF0aW9ucycpIHtcbiAgICAgIGJhZGdlRWxlbWVudC5jbGFzc0xpc3QuYWRkKCdfbWF0LWFuaW1hdGlvbi1ub29wYWJsZScpO1xuICAgIH1cblxuICAgIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5hcHBlbmRDaGlsZChiYWRnZUVsZW1lbnQpO1xuXG4gICAgLy8gYW5pbWF0ZSBpbiBhZnRlciBpbnNlcnRpb25cbiAgICBpZiAodHlwZW9mIHJlcXVlc3RBbmltYXRpb25GcmFtZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0aGlzLl9hbmltYXRpb25Nb2RlICE9PSAnTm9vcEFuaW1hdGlvbnMnKSB7XG4gICAgICB0aGlzLl9uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgICAgIGJhZGdlRWxlbWVudC5jbGFzc0xpc3QuYWRkKGFjdGl2ZUNsYXNzKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgYmFkZ2VFbGVtZW50LmNsYXNzTGlzdC5hZGQoYWN0aXZlQ2xhc3MpO1xuICAgIH1cblxuICAgIHJldHVybiBiYWRnZUVsZW1lbnQ7XG4gIH1cblxuICAvKiogVXBkYXRlIHRoZSB0ZXh0IGNvbnRlbnQgb2YgdGhlIGJhZGdlIGVsZW1lbnQgaW4gdGhlIERPTSwgY3JlYXRpbmcgdGhlIGVsZW1lbnQgaWYgbmVjZXNzYXJ5LiAqL1xuICBwcml2YXRlIF91cGRhdGVSZW5kZXJlZENvbnRlbnQobmV3Q29udGVudDogc3RyaW5nIHwgbnVtYmVyIHwgdW5kZWZpbmVkIHwgbnVsbCk6IHZvaWQge1xuICAgIGNvbnN0IG5ld0NvbnRlbnROb3JtYWxpemVkOiBzdHJpbmcgPSBgJHtuZXdDb250ZW50ID8/ICcnfWAudHJpbSgpO1xuXG4gICAgLy8gRG9uJ3QgY3JlYXRlIHRoZSBiYWRnZSBlbGVtZW50IGlmIHRoZSBkaXJlY3RpdmUgaXNuJ3QgaW5pdGlhbGl6ZWQgYmVjYXVzZSB3ZSB3YW50IHRvXG4gICAgLy8gYXBwZW5kIHRoZSBiYWRnZSBlbGVtZW50IHRvIHRoZSAqZW5kKiBvZiB0aGUgaG9zdCBlbGVtZW50J3MgY29udGVudCBmb3IgYmFja3dhcmRzXG4gICAgLy8gY29tcGF0aWJpbGl0eS5cbiAgICBpZiAodGhpcy5faXNJbml0aWFsaXplZCAmJiBuZXdDb250ZW50Tm9ybWFsaXplZCAmJiAhdGhpcy5fYmFkZ2VFbGVtZW50KSB7XG4gICAgICB0aGlzLl9iYWRnZUVsZW1lbnQgPSB0aGlzLl9jcmVhdGVCYWRnZUVsZW1lbnQoKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fYmFkZ2VFbGVtZW50KSB7XG4gICAgICB0aGlzLl9iYWRnZUVsZW1lbnQudGV4dENvbnRlbnQgPSBuZXdDb250ZW50Tm9ybWFsaXplZDtcbiAgICB9XG5cbiAgICB0aGlzLl9jb250ZW50ID0gbmV3Q29udGVudE5vcm1hbGl6ZWQ7XG4gIH1cblxuICAvKiogVXBkYXRlcyB0aGUgaG9zdCBlbGVtZW50J3MgYXJpYSBkZXNjcmlwdGlvbiB2aWEgQXJpYURlc2NyaWJlci4gKi9cbiAgcHJpdmF0ZSBfdXBkYXRlRGVzY3JpcHRpb24obmV3RGVzY3JpcHRpb246IHN0cmluZyk6IHZvaWQge1xuICAgIC8vIEFsd2F5cyBzdGFydCBieSByZW1vdmluZyB0aGUgYXJpYS1kZXNjcmliZWRieTsgd2Ugd2lsbCBhZGQgYSBuZXcgb25lIGlmIG5lY2Vzc2FyeS5cbiAgICB0aGlzLl9hcmlhRGVzY3JpYmVyLnJlbW92ZURlc2NyaXB0aW9uKHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudCwgdGhpcy5kZXNjcmlwdGlvbik7XG5cbiAgICAvLyBOT1RFOiBXZSBvbmx5IGNoZWNrIHdoZXRoZXIgdGhlIGhvc3QgaXMgaW50ZXJhY3RpdmUgaGVyZSwgd2hpY2ggaGFwcGVucyBkdXJpbmdcbiAgICAvLyB3aGVuIHRoZW4gYmFkZ2UgY29udGVudCBjaGFuZ2VzLiBJdCBpcyBwb3NzaWJsZSB0aGF0IHRoZSBob3N0IGNoYW5nZXNcbiAgICAvLyBpbnRlcmFjdGl2aXR5IHN0YXR1cyBzZXBhcmF0ZSBmcm9tIG9uZSBvZiB0aGVzZS4gSG93ZXZlciwgd2F0Y2hpbmcgdGhlIGludGVyYWN0aXZpdHlcbiAgICAvLyBzdGF0dXMgb2YgdGhlIGhvc3Qgd291bGQgcmVxdWlyZSBhIGBNdXRhdGlvbk9ic2VydmVyYCwgd2hpY2ggaXMgbGlrZWx5IG1vcmUgY29kZSArIG92ZXJoZWFkXG4gICAgLy8gdGhhbiBpdCdzIHdvcnRoOyBmcm9tIHVzYWdlcyBpbnNpZGUgR29vZ2xlLCB3ZSBzZWUgdGhhdCB0aGUgdmF0cyBtYWpvcml0eSBvZiBiYWRnZXMgZWl0aGVyXG4gICAgLy8gbmV2ZXIgY2hhbmdlIGludGVyYWN0aXZpdHksIG9yIGFsc28gc2V0IGBtYXRCYWRnZUhpZGRlbmAgYmFzZWQgb24gdGhlIHNhbWUgY29uZGl0aW9uLlxuXG4gICAgaWYgKCFuZXdEZXNjcmlwdGlvbiB8fCB0aGlzLl9pc0hvc3RJbnRlcmFjdGl2ZSgpKSB7XG4gICAgICB0aGlzLl9yZW1vdmVJbmxpbmVEZXNjcmlwdGlvbigpO1xuICAgIH1cblxuICAgIHRoaXMuX2Rlc2NyaXB0aW9uID0gbmV3RGVzY3JpcHRpb247XG5cbiAgICAvLyBXZSBkb24ndCBhZGQgYGFyaWEtZGVzY3JpYmVkYnlgIGZvciBub24taW50ZXJhY3RpdmUgaG9zdHMgZWxlbWVudHMgYmVjYXVzZSB3ZVxuICAgIC8vIGluc3RlYWQgaW5zZXJ0IHRoZSBkZXNjcmlwdGlvbiBpbmxpbmUuXG4gICAgaWYgKHRoaXMuX2lzSG9zdEludGVyYWN0aXZlKCkpIHtcbiAgICAgIHRoaXMuX2FyaWFEZXNjcmliZXIuZGVzY3JpYmUodGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LCBuZXdEZXNjcmlwdGlvbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3VwZGF0ZUlubGluZURlc2NyaXB0aW9uKCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfdXBkYXRlSW5saW5lRGVzY3JpcHRpb24oKSB7XG4gICAgLy8gQ3JlYXRlIHRoZSBpbmxpbmUgZGVzY3JpcHRpb24gZWxlbWVudCBpZiBpdCBkb2Vzbid0IGV4aXN0XG4gICAgaWYgKCF0aGlzLl9pbmxpbmVCYWRnZURlc2NyaXB0aW9uKSB7XG4gICAgICB0aGlzLl9pbmxpbmVCYWRnZURlc2NyaXB0aW9uID0gdGhpcy5fZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgdGhpcy5faW5saW5lQmFkZ2VEZXNjcmlwdGlvbi5jbGFzc0xpc3QuYWRkKCdjZGstdmlzdWFsbHktaGlkZGVuJyk7XG4gICAgfVxuXG4gICAgdGhpcy5faW5saW5lQmFkZ2VEZXNjcmlwdGlvbi50ZXh0Q29udGVudCA9IHRoaXMuZGVzY3JpcHRpb247XG4gICAgdGhpcy5fYmFkZ2VFbGVtZW50Py5hcHBlbmRDaGlsZCh0aGlzLl9pbmxpbmVCYWRnZURlc2NyaXB0aW9uKTtcbiAgfVxuXG4gIHByaXZhdGUgX3JlbW92ZUlubGluZURlc2NyaXB0aW9uKCkge1xuICAgIHRoaXMuX2lubGluZUJhZGdlRGVzY3JpcHRpb24/LnJlbW92ZSgpO1xuICAgIHRoaXMuX2lubGluZUJhZGdlRGVzY3JpcHRpb24gPSB1bmRlZmluZWQ7XG4gIH1cblxuICAvKiogQWRkcyBjc3MgdGhlbWUgY2xhc3MgZ2l2ZW4gdGhlIGNvbG9yIHRvIHRoZSBjb21wb25lbnQgaG9zdCAqL1xuICBwcml2YXRlIF9zZXRDb2xvcihjb2xvclBhbGV0dGU6IFRoZW1lUGFsZXR0ZSkge1xuICAgIGNvbnN0IGNsYXNzTGlzdCA9IHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5jbGFzc0xpc3Q7XG4gICAgY2xhc3NMaXN0LnJlbW92ZShgbWF0LWJhZGdlLSR7dGhpcy5fY29sb3J9YCk7XG4gICAgaWYgKGNvbG9yUGFsZXR0ZSkge1xuICAgICAgY2xhc3NMaXN0LmFkZChgbWF0LWJhZGdlLSR7Y29sb3JQYWxldHRlfWApO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBDbGVhcnMgYW55IGV4aXN0aW5nIGJhZGdlcyB0aGF0IG1pZ2h0IGJlIGxlZnQgb3ZlciBmcm9tIHNlcnZlci1zaWRlIHJlbmRlcmluZy4gKi9cbiAgcHJpdmF0ZSBfY2xlYXJFeGlzdGluZ0JhZGdlcygpIHtcbiAgICAvLyBPbmx5IGNoZWNrIGRpcmVjdCBjaGlsZHJlbiBvZiB0aGlzIGhvc3QgZWxlbWVudCBpbiBvcmRlciB0byBhdm9pZCBkZWxldGluZ1xuICAgIC8vIGFueSBiYWRnZXMgdGhhdCBtaWdodCBleGlzdCBpbiBkZXNjZW5kYW50IGVsZW1lbnRzLlxuICAgIGNvbnN0IGJhZGdlcyA9IHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgYDpzY29wZSA+IC4ke0JBREdFX0NPTlRFTlRfQ0xBU1N9YCxcbiAgICApO1xuICAgIGZvciAoY29uc3QgYmFkZ2VFbGVtZW50IG9mIEFycmF5LmZyb20oYmFkZ2VzKSkge1xuICAgICAgaWYgKGJhZGdlRWxlbWVudCAhPT0gdGhpcy5fYmFkZ2VFbGVtZW50KSB7XG4gICAgICAgIGJhZGdlRWxlbWVudC5yZW1vdmUoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==