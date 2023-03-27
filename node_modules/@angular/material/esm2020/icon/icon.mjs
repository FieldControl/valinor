/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { DOCUMENT } from '@angular/common';
import { Attribute, ChangeDetectionStrategy, Component, ElementRef, ErrorHandler, inject, Inject, InjectionToken, Input, Optional, ViewEncapsulation, } from '@angular/core';
import { mixinColor } from '@angular/material/core';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { MatIconRegistry } from './icon-registry';
import * as i0 from "@angular/core";
import * as i1 from "./icon-registry";
// Boilerplate for applying mixins to MatIcon.
/** @docs-private */
const _MatIconBase = mixinColor(class {
    constructor(_elementRef) {
        this._elementRef = _elementRef;
    }
});
/** Injection token to be used to override the default options for `mat-icon`. */
export const MAT_ICON_DEFAULT_OPTIONS = new InjectionToken('MAT_ICON_DEFAULT_OPTIONS');
/**
 * Injection token used to provide the current location to `MatIcon`.
 * Used to handle server-side rendering and to stub out during unit tests.
 * @docs-private
 */
export const MAT_ICON_LOCATION = new InjectionToken('mat-icon-location', {
    providedIn: 'root',
    factory: MAT_ICON_LOCATION_FACTORY,
});
/** @docs-private */
export function MAT_ICON_LOCATION_FACTORY() {
    const _document = inject(DOCUMENT);
    const _location = _document ? _document.location : null;
    return {
        // Note that this needs to be a function, rather than a property, because Angular
        // will only resolve it once, but we want the current path on each call.
        getPathname: () => (_location ? _location.pathname + _location.search : ''),
    };
}
/** SVG attributes that accept a FuncIRI (e.g. `url(<something>)`). */
const funcIriAttributes = [
    'clip-path',
    'color-profile',
    'src',
    'cursor',
    'fill',
    'filter',
    'marker',
    'marker-start',
    'marker-mid',
    'marker-end',
    'mask',
    'stroke',
];
/** Selector that can be used to find all elements that are using a `FuncIRI`. */
const funcIriAttributeSelector = funcIriAttributes.map(attr => `[${attr}]`).join(', ');
/** Regex that can be used to extract the id out of a FuncIRI. */
const funcIriPattern = /^url\(['"]?#(.*?)['"]?\)$/;
/**
 * Component to display an icon. It can be used in the following ways:
 *
 * - Specify the svgIcon input to load an SVG icon from a URL previously registered with the
 *   addSvgIcon, addSvgIconInNamespace, addSvgIconSet, or addSvgIconSetInNamespace methods of
 *   MatIconRegistry. If the svgIcon value contains a colon it is assumed to be in the format
 *   "[namespace]:[name]", if not the value will be the name of an icon in the default namespace.
 *   Examples:
 *     `<mat-icon svgIcon="left-arrow"></mat-icon>
 *     <mat-icon svgIcon="animals:cat"></mat-icon>`
 *
 * - Use a font ligature as an icon by putting the ligature text in the `fontIcon` attribute or the
 *   content of the `<mat-icon>` component. If you register a custom font class, don't forget to also
 *   include the special class `mat-ligature-font`. It is recommended to use the attribute alternative
 *   to prevent the ligature text to be selectable and to appear in search engine results.
 *   By default, the Material icons font is used as described at
 *   http://google.github.io/material-design-icons/#icon-font-for-the-web. You can specify an
 *   alternate font by setting the fontSet input to either the CSS class to apply to use the
 *   desired font, or to an alias previously registered with MatIconRegistry.registerFontClassAlias.
 *   Examples:
 *     `<mat-icon fontIcon="home"></mat-icon>
 *     <mat-icon>home</mat-icon>
 *     <mat-icon fontSet="myfont" fontIcon="sun"></mat-icon>
 *     <mat-icon fontSet="myfont">sun</mat-icon>`
 *
 * - Specify a font glyph to be included via CSS rules by setting the fontSet input to specify the
 *   font, and the fontIcon input to specify the icon. Typically the fontIcon will specify a
 *   CSS class which causes the glyph to be displayed via a :before selector, as in
 *   https://fortawesome.github.io/Font-Awesome/examples/
 *   Example:
 *     `<mat-icon fontSet="fa" fontIcon="alarm"></mat-icon>`
 */
export class MatIcon extends _MatIconBase {
    /**
     * Whether the icon should be inlined, automatically sizing the icon to match the font size of
     * the element the icon is contained in.
     */
    get inline() {
        return this._inline;
    }
    set inline(inline) {
        this._inline = coerceBooleanProperty(inline);
    }
    /** Name of the icon in the SVG icon set. */
    get svgIcon() {
        return this._svgIcon;
    }
    set svgIcon(value) {
        if (value !== this._svgIcon) {
            if (value) {
                this._updateSvgIcon(value);
            }
            else if (this._svgIcon) {
                this._clearSvgElement();
            }
            this._svgIcon = value;
        }
    }
    /** Font set that the icon is a part of. */
    get fontSet() {
        return this._fontSet;
    }
    set fontSet(value) {
        const newValue = this._cleanupFontValue(value);
        if (newValue !== this._fontSet) {
            this._fontSet = newValue;
            this._updateFontIconClasses();
        }
    }
    /** Name of an icon within a font set. */
    get fontIcon() {
        return this._fontIcon;
    }
    set fontIcon(value) {
        const newValue = this._cleanupFontValue(value);
        if (newValue !== this._fontIcon) {
            this._fontIcon = newValue;
            this._updateFontIconClasses();
        }
    }
    constructor(elementRef, _iconRegistry, ariaHidden, _location, _errorHandler, defaults) {
        super(elementRef);
        this._iconRegistry = _iconRegistry;
        this._location = _location;
        this._errorHandler = _errorHandler;
        this._inline = false;
        this._previousFontSetClass = [];
        /** Subscription to the current in-progress SVG icon request. */
        this._currentIconFetch = Subscription.EMPTY;
        if (defaults) {
            if (defaults.color) {
                this.color = this.defaultColor = defaults.color;
            }
            if (defaults.fontSet) {
                this.fontSet = defaults.fontSet;
            }
        }
        // If the user has not explicitly set aria-hidden, mark the icon as hidden, as this is
        // the right thing to do for the majority of icon use-cases.
        if (!ariaHidden) {
            elementRef.nativeElement.setAttribute('aria-hidden', 'true');
        }
    }
    /**
     * Splits an svgIcon binding value into its icon set and icon name components.
     * Returns a 2-element array of [(icon set), (icon name)].
     * The separator for the two fields is ':'. If there is no separator, an empty
     * string is returned for the icon set and the entire value is returned for
     * the icon name. If the argument is falsy, returns an array of two empty strings.
     * Throws an error if the name contains two or more ':' separators.
     * Examples:
     *   `'social:cake' -> ['social', 'cake']
     *   'penguin' -> ['', 'penguin']
     *   null -> ['', '']
     *   'a:b:c' -> (throws Error)`
     */
    _splitIconName(iconName) {
        if (!iconName) {
            return ['', ''];
        }
        const parts = iconName.split(':');
        switch (parts.length) {
            case 1:
                return ['', parts[0]]; // Use default namespace.
            case 2:
                return parts;
            default:
                throw Error(`Invalid icon name: "${iconName}"`); // TODO: add an ngDevMode check
        }
    }
    ngOnInit() {
        // Update font classes because ngOnChanges won't be called if none of the inputs are present,
        // e.g. <mat-icon>arrow</mat-icon> In this case we need to add a CSS class for the default font.
        this._updateFontIconClasses();
    }
    ngAfterViewChecked() {
        const cachedElements = this._elementsWithExternalReferences;
        if (cachedElements && cachedElements.size) {
            const newPath = this._location.getPathname();
            // We need to check whether the URL has changed on each change detection since
            // the browser doesn't have an API that will let us react on link clicks and
            // we can't depend on the Angular router. The references need to be updated,
            // because while most browsers don't care whether the URL is correct after
            // the first render, Safari will break if the user navigates to a different
            // page and the SVG isn't re-rendered.
            if (newPath !== this._previousPath) {
                this._previousPath = newPath;
                this._prependPathToReferences(newPath);
            }
        }
    }
    ngOnDestroy() {
        this._currentIconFetch.unsubscribe();
        if (this._elementsWithExternalReferences) {
            this._elementsWithExternalReferences.clear();
        }
    }
    _usingFontIcon() {
        return !this.svgIcon;
    }
    _setSvgElement(svg) {
        this._clearSvgElement();
        // Note: we do this fix here, rather than the icon registry, because the
        // references have to point to the URL at the time that the icon was created.
        const path = this._location.getPathname();
        this._previousPath = path;
        this._cacheChildrenWithExternalReferences(svg);
        this._prependPathToReferences(path);
        this._elementRef.nativeElement.appendChild(svg);
    }
    _clearSvgElement() {
        const layoutElement = this._elementRef.nativeElement;
        let childCount = layoutElement.childNodes.length;
        if (this._elementsWithExternalReferences) {
            this._elementsWithExternalReferences.clear();
        }
        // Remove existing non-element child nodes and SVGs, and add the new SVG element. Note that
        // we can't use innerHTML, because IE will throw if the element has a data binding.
        while (childCount--) {
            const child = layoutElement.childNodes[childCount];
            // 1 corresponds to Node.ELEMENT_NODE. We remove all non-element nodes in order to get rid
            // of any loose text nodes, as well as any SVG elements in order to remove any old icons.
            if (child.nodeType !== 1 || child.nodeName.toLowerCase() === 'svg') {
                child.remove();
            }
        }
    }
    _updateFontIconClasses() {
        if (!this._usingFontIcon()) {
            return;
        }
        const elem = this._elementRef.nativeElement;
        const fontSetClasses = (this.fontSet
            ? this._iconRegistry.classNameForFontAlias(this.fontSet).split(/ +/)
            : this._iconRegistry.getDefaultFontSetClass()).filter(className => className.length > 0);
        this._previousFontSetClass.forEach(className => elem.classList.remove(className));
        fontSetClasses.forEach(className => elem.classList.add(className));
        this._previousFontSetClass = fontSetClasses;
        if (this.fontIcon !== this._previousFontIconClass &&
            !fontSetClasses.includes('mat-ligature-font')) {
            if (this._previousFontIconClass) {
                elem.classList.remove(this._previousFontIconClass);
            }
            if (this.fontIcon) {
                elem.classList.add(this.fontIcon);
            }
            this._previousFontIconClass = this.fontIcon;
        }
    }
    /**
     * Cleans up a value to be used as a fontIcon or fontSet.
     * Since the value ends up being assigned as a CSS class, we
     * have to trim the value and omit space-separated values.
     */
    _cleanupFontValue(value) {
        return typeof value === 'string' ? value.trim().split(' ')[0] : value;
    }
    /**
     * Prepends the current path to all elements that have an attribute pointing to a `FuncIRI`
     * reference. This is required because WebKit browsers require references to be prefixed with
     * the current path, if the page has a `base` tag.
     */
    _prependPathToReferences(path) {
        const elements = this._elementsWithExternalReferences;
        if (elements) {
            elements.forEach((attrs, element) => {
                attrs.forEach(attr => {
                    element.setAttribute(attr.name, `url('${path}#${attr.value}')`);
                });
            });
        }
    }
    /**
     * Caches the children of an SVG element that have `url()`
     * references that we need to prefix with the current path.
     */
    _cacheChildrenWithExternalReferences(element) {
        const elementsWithFuncIri = element.querySelectorAll(funcIriAttributeSelector);
        const elements = (this._elementsWithExternalReferences =
            this._elementsWithExternalReferences || new Map());
        for (let i = 0; i < elementsWithFuncIri.length; i++) {
            funcIriAttributes.forEach(attr => {
                const elementWithReference = elementsWithFuncIri[i];
                const value = elementWithReference.getAttribute(attr);
                const match = value ? value.match(funcIriPattern) : null;
                if (match) {
                    let attributes = elements.get(elementWithReference);
                    if (!attributes) {
                        attributes = [];
                        elements.set(elementWithReference, attributes);
                    }
                    attributes.push({ name: attr, value: match[1] });
                }
            });
        }
    }
    /** Sets a new SVG icon with a particular name. */
    _updateSvgIcon(rawName) {
        this._svgNamespace = null;
        this._svgName = null;
        this._currentIconFetch.unsubscribe();
        if (rawName) {
            const [namespace, iconName] = this._splitIconName(rawName);
            if (namespace) {
                this._svgNamespace = namespace;
            }
            if (iconName) {
                this._svgName = iconName;
            }
            this._currentIconFetch = this._iconRegistry
                .getNamedSvgIcon(iconName, namespace)
                .pipe(take(1))
                .subscribe(svg => this._setSvgElement(svg), (err) => {
                const errorMessage = `Error retrieving icon ${namespace}:${iconName}! ${err.message}`;
                this._errorHandler.handleError(new Error(errorMessage));
            });
        }
    }
}
MatIcon.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: MatIcon, deps: [{ token: i0.ElementRef }, { token: i1.MatIconRegistry }, { token: 'aria-hidden', attribute: true }, { token: MAT_ICON_LOCATION }, { token: i0.ErrorHandler }, { token: MAT_ICON_DEFAULT_OPTIONS, optional: true }], target: i0.ɵɵFactoryTarget.Component });
MatIcon.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "15.2.0-rc.0", type: MatIcon, selector: "mat-icon", inputs: { color: "color", inline: "inline", svgIcon: "svgIcon", fontSet: "fontSet", fontIcon: "fontIcon" }, host: { attributes: { "role": "img" }, properties: { "attr.data-mat-icon-type": "_usingFontIcon() ? \"font\" : \"svg\"", "attr.data-mat-icon-name": "_svgName || fontIcon", "attr.data-mat-icon-namespace": "_svgNamespace || fontSet", "attr.fontIcon": "_usingFontIcon() ? fontIcon : null", "class.mat-icon-inline": "inline", "class.mat-icon-no-color": "color !== \"primary\" && color !== \"accent\" && color !== \"warn\"" }, classAttribute: "mat-icon notranslate" }, exportAs: ["matIcon"], usesInheritance: true, ngImport: i0, template: '<ng-content></ng-content>', isInline: true, styles: [".mat-icon{-webkit-user-select:none;user-select:none;background-repeat:no-repeat;display:inline-block;fill:currentColor;height:24px;width:24px;overflow:hidden}.mat-icon.mat-icon-inline{font-size:inherit;height:inherit;line-height:inherit;width:inherit}.mat-icon.mat-ligature-font[fontIcon]::before{content:attr(fontIcon)}[dir=rtl] .mat-icon-rtl-mirror{transform:scale(-1, 1)}.mat-form-field:not(.mat-form-field-appearance-legacy) .mat-form-field-prefix .mat-icon,.mat-form-field:not(.mat-form-field-appearance-legacy) .mat-form-field-suffix .mat-icon{display:block}.mat-form-field:not(.mat-form-field-appearance-legacy) .mat-form-field-prefix .mat-icon-button .mat-icon,.mat-form-field:not(.mat-form-field-appearance-legacy) .mat-form-field-suffix .mat-icon-button .mat-icon{margin:auto}"], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: MatIcon, decorators: [{
            type: Component,
            args: [{ template: '<ng-content></ng-content>', selector: 'mat-icon', exportAs: 'matIcon', inputs: ['color'], host: {
                        'role': 'img',
                        'class': 'mat-icon notranslate',
                        '[attr.data-mat-icon-type]': '_usingFontIcon() ? "font" : "svg"',
                        '[attr.data-mat-icon-name]': '_svgName || fontIcon',
                        '[attr.data-mat-icon-namespace]': '_svgNamespace || fontSet',
                        '[attr.fontIcon]': '_usingFontIcon() ? fontIcon : null',
                        '[class.mat-icon-inline]': 'inline',
                        '[class.mat-icon-no-color]': 'color !== "primary" && color !== "accent" && color !== "warn"',
                    }, encapsulation: ViewEncapsulation.None, changeDetection: ChangeDetectionStrategy.OnPush, styles: [".mat-icon{-webkit-user-select:none;user-select:none;background-repeat:no-repeat;display:inline-block;fill:currentColor;height:24px;width:24px;overflow:hidden}.mat-icon.mat-icon-inline{font-size:inherit;height:inherit;line-height:inherit;width:inherit}.mat-icon.mat-ligature-font[fontIcon]::before{content:attr(fontIcon)}[dir=rtl] .mat-icon-rtl-mirror{transform:scale(-1, 1)}.mat-form-field:not(.mat-form-field-appearance-legacy) .mat-form-field-prefix .mat-icon,.mat-form-field:not(.mat-form-field-appearance-legacy) .mat-form-field-suffix .mat-icon{display:block}.mat-form-field:not(.mat-form-field-appearance-legacy) .mat-form-field-prefix .mat-icon-button .mat-icon,.mat-form-field:not(.mat-form-field-appearance-legacy) .mat-form-field-suffix .mat-icon-button .mat-icon{margin:auto}"] }]
        }], ctorParameters: function () { return [{ type: i0.ElementRef }, { type: i1.MatIconRegistry }, { type: undefined, decorators: [{
                    type: Attribute,
                    args: ['aria-hidden']
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [MAT_ICON_LOCATION]
                }] }, { type: i0.ErrorHandler }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [MAT_ICON_DEFAULT_OPTIONS]
                }] }]; }, propDecorators: { inline: [{
                type: Input
            }], svgIcon: [{
                type: Input
            }], fontSet: [{
                type: Input
            }], fontIcon: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWNvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9pY29uL2ljb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFlLHFCQUFxQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDMUUsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQ3pDLE9BQU8sRUFFTCxTQUFTLEVBQ1QsdUJBQXVCLEVBQ3ZCLFNBQVMsRUFDVCxVQUFVLEVBQ1YsWUFBWSxFQUNaLE1BQU0sRUFDTixNQUFNLEVBQ04sY0FBYyxFQUNkLEtBQUssRUFHTCxRQUFRLEVBQ1IsaUJBQWlCLEdBQ2xCLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBeUIsVUFBVSxFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFDMUUsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUNsQyxPQUFPLEVBQUMsSUFBSSxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFFcEMsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLGlCQUFpQixDQUFDOzs7QUFFaEQsOENBQThDO0FBQzlDLG9CQUFvQjtBQUNwQixNQUFNLFlBQVksR0FBRyxVQUFVLENBQzdCO0lBQ0UsWUFBbUIsV0FBdUI7UUFBdkIsZ0JBQVcsR0FBWCxXQUFXLENBQVk7SUFBRyxDQUFDO0NBQy9DLENBQ0YsQ0FBQztBQVVGLGlGQUFpRjtBQUNqRixNQUFNLENBQUMsTUFBTSx3QkFBd0IsR0FBRyxJQUFJLGNBQWMsQ0FDeEQsMEJBQTBCLENBQzNCLENBQUM7QUFFRjs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxjQUFjLENBQWtCLG1CQUFtQixFQUFFO0lBQ3hGLFVBQVUsRUFBRSxNQUFNO0lBQ2xCLE9BQU8sRUFBRSx5QkFBeUI7Q0FDbkMsQ0FBQyxDQUFDO0FBVUgsb0JBQW9C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RUFBRTtnQkFDYixNQUFNLFlBQVksR0FBRyx5QkFBeUIsU0FBUyxJQUFJLFFBQVEsS0FBSyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ3RGLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLElBQUksS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7WUFDMUQsQ0FBQyxDQUNGLENBQUM7U0FDTDtJQUNILENBQUM7O3lHQTVUVSxPQUFPLDJFQStFTCxhQUFhLDhCQUNoQixpQkFBaUIseUNBR2pCLHdCQUF3Qjs2RkFuRnZCLE9BQU8sMHBCQWxCUiwyQkFBMkI7Z0dBa0IxQixPQUFPO2tCQW5CbkIsU0FBUzsrQkFDRSwyQkFBMkIsWUFDM0IsVUFBVSxZQUNWLFNBQVMsVUFFWCxDQUFDLE9BQU8sQ0FBQyxRQUNYO3dCQUNKLE1BQU0sRUFBRSxLQUFLO3dCQUNiLE9BQU8sRUFBRSxzQkFBc0I7d0JBQy9CLDJCQUEyQixFQUFFLG1DQUFtQzt3QkFDaEUsMkJBQTJCLEVBQUUsc0JBQXNCO3dCQUNuRCxnQ0FBZ0MsRUFBRSwwQkFBMEI7d0JBQzVELGlCQUFpQixFQUFFLG9DQUFvQzt3QkFDdkQseUJBQXlCLEVBQUUsUUFBUTt3QkFDbkMsMkJBQTJCLEVBQUUsK0RBQStEO3FCQUM3RixpQkFDYyxpQkFBaUIsQ0FBQyxJQUFJLG1CQUNwQix1QkFBdUIsQ0FBQyxNQUFNOzswQkFpRjVDLFNBQVM7MkJBQUMsYUFBYTs7MEJBQ3ZCLE1BQU07MkJBQUMsaUJBQWlCOzswQkFFeEIsUUFBUTs7MEJBQ1IsTUFBTTsyQkFBQyx3QkFBd0I7NENBN0U5QixNQUFNO3NCQURULEtBQUs7Z0JBV0YsT0FBTztzQkFEVixLQUFLO2dCQWtCRixPQUFPO3NCQURWLEtBQUs7Z0JBZ0JGLFFBQVE7c0JBRFgsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0Jvb2xlYW5JbnB1dCwgY29lcmNlQm9vbGVhblByb3BlcnR5fSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7XG4gIEFmdGVyVmlld0NoZWNrZWQsXG4gIEF0dHJpYnV0ZSxcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIENvbXBvbmVudCxcbiAgRWxlbWVudFJlZixcbiAgRXJyb3JIYW5kbGVyLFxuICBpbmplY3QsXG4gIEluamVjdCxcbiAgSW5qZWN0aW9uVG9rZW4sXG4gIElucHV0LFxuICBPbkRlc3Ryb3ksXG4gIE9uSW5pdCxcbiAgT3B0aW9uYWwsXG4gIFZpZXdFbmNhcHN1bGF0aW9uLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Q2FuQ29sb3IsIFRoZW1lUGFsZXR0ZSwgbWl4aW5Db2xvcn0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvY29yZSc7XG5pbXBvcnQge1N1YnNjcmlwdGlvbn0gZnJvbSAncnhqcyc7XG5pbXBvcnQge3Rha2V9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHtNYXRJY29uUmVnaXN0cnl9IGZyb20gJy4vaWNvbi1yZWdpc3RyeSc7XG5cbi8vIEJvaWxlcnBsYXRlIGZvciBhcHBseWluZyBtaXhpbnMgdG8gTWF0SWNvbi5cbi8qKiBAZG9jcy1wcml2YXRlICovXG5jb25zdCBfTWF0SWNvbkJhc2UgPSBtaXhpbkNvbG9yKFxuICBjbGFzcyB7XG4gICAgY29uc3RydWN0b3IocHVibGljIF9lbGVtZW50UmVmOiBFbGVtZW50UmVmKSB7fVxuICB9LFxuKTtcblxuLyoqIERlZmF1bHQgb3B0aW9ucyBmb3IgYG1hdC1pY29uYC4gICovXG5leHBvcnQgaW50ZXJmYWNlIE1hdEljb25EZWZhdWx0T3B0aW9ucyB7XG4gIC8qKiBEZWZhdWx0IGNvbG9yIG9mIHRoZSBpY29uLiAqL1xuICBjb2xvcj86IFRoZW1lUGFsZXR0ZTtcbiAgLyoqIEZvbnQgc2V0IHRoYXQgdGhlIGljb24gaXMgYSBwYXJ0IG9mLiAqL1xuICBmb250U2V0Pzogc3RyaW5nO1xufVxuXG4vKiogSW5qZWN0aW9uIHRva2VuIHRvIGJlIHVzZWQgdG8gb3ZlcnJpZGUgdGhlIGRlZmF1bHQgb3B0aW9ucyBmb3IgYG1hdC1pY29uYC4gKi9cbmV4cG9ydCBjb25zdCBNQVRfSUNPTl9ERUZBVUxUX09QVElPTlMgPSBuZXcgSW5qZWN0aW9uVG9rZW48TWF0SWNvbkRlZmF1bHRPcHRpb25zPihcbiAgJ01BVF9JQ09OX0RFRkFVTFRfT1BUSU9OUycsXG4pO1xuXG4vKipcbiAqIEluamVjdGlvbiB0b2tlbiB1c2VkIHRvIHByb3ZpZGUgdGhlIGN1cnJlbnQgbG9jYXRpb24gdG8gYE1hdEljb25gLlxuICogVXNlZCB0byBoYW5kbGUgc2VydmVyLXNpZGUgcmVuZGVyaW5nIGFuZCB0byBzdHViIG91dCBkdXJpbmcgdW5pdCB0ZXN0cy5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuZXhwb3J0IGNvbnN0IE1BVF9JQ09OX0xPQ0FUSU9OID0gbmV3IEluamVjdGlvblRva2VuPE1hdEljb25Mb2NhdGlvbj4oJ21hdC1pY29uLWxvY2F0aW9uJywge1xuICBwcm92aWRlZEluOiAncm9vdCcsXG4gIGZhY3Rvcnk6IE1BVF9JQ09OX0xPQ0FUSU9OX0ZBQ1RPUlksXG59KTtcblxuLyoqXG4gKiBTdHViYmVkIG91dCBsb2NhdGlvbiBmb3IgYE1hdEljb25gLlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5leHBvcnQgaW50ZXJmYWNlIE1hdEljb25Mb2NhdGlvbiB7XG4gIGdldFBhdGhuYW1lOiAoKSA9PiBzdHJpbmc7XG59XG5cbi8qKiBAZG9jcy1wcml2YXRlICovXG5leHBvcnQgZnVuY3Rpb24gTUFUX0lDT05fTE9DQVRJT05fRkFDVE9SWSgpOiBNYXRJY29uTG9jYXRpb24ge1xuICBjb25zdCBfZG9jdW1lbnQgPSBpbmplY3QoRE9DVU1FTlQpO1xuICBjb25zdCBfbG9jYXRpb24gPSBfZG9jdW1lbnQgPyBfZG9jdW1lbnQubG9jYXRpb24gOiBudWxsO1xuXG4gIHJldHVybiB7XG4gICAgLy8gTm90ZSB0aGF0IHRoaXMgbmVlZHMgdG8gYmUgYSBmdW5jdGlvbiwgcmF0aGVyIHRoYW4gYSBwcm9wZXJ0eSwgYmVjYXVzZSBBbmd1bGFyXG4gICAgLy8gd2lsbCBvbmx5IHJlc29sdmUgaXQgb25jZSwgYnV0IHdlIHdhbnQgdGhlIGN1cnJlbnQgcGF0aCBvbiBlYWNoIGNhbGwuXG4gICAgZ2V0UGF0aG5hbWU6ICgpID0+IChfbG9jYXRpb24gPyBfbG9jYXRpb24ucGF0aG5hbWUgKyBfbG9jYXRpb24uc2VhcmNoIDogJycpLFxuICB9O1xufVxuXG4vKiogU1ZHIGF0dHJpYnV0ZXMgdGhhdCBhY2NlcHQgYSBGdW5jSVJJIChlLmcuIGB1cmwoPHNvbWV0aGluZz4pYCkuICovXG5jb25zdCBmdW5jSXJpQXR0cmlidXRlcyA9IFtcbiAgJ2NsaXAtcGF0aCcsXG4gICdjb2xvci1wcm9maWxlJyxcbiAgJ3NyYycsXG4gICdjdXJzb3InLFxuICAnZmlsbCcsXG4gICdmaWx0ZXInLFxuICAnbWFya2VyJyxcbiAgJ21hcmtlci1zdGFydCcsXG4gICdtYXJrZXItbWlkJyxcbiAgJ21hcmtlci1lbmQnLFxuICAnbWFzaycsXG4gICdzdHJva2UnLFxuXTtcblxuLyoqIFNlbGVjdG9yIHRoYXQgY2FuIGJlIHVzZWQgdG8gZmluZCBhbGwgZWxlbWVudHMgdGhhdCBhcmUgdXNpbmcgYSBgRnVuY0lSSWAuICovXG5jb25zdCBmdW5jSXJpQXR0cmlidXRlU2VsZWN0b3IgPSBmdW5jSXJpQXR0cmlidXRlcy5tYXAoYXR0ciA9PiBgWyR7YXR0cn1dYCkuam9pbignLCAnKTtcblxuLyoqIFJlZ2V4IHRoYXQgY2FuIGJlIHVzZWQgdG8gZXh0cmFjdCB0aGUgaWQgb3V0IG9mIGEgRnVuY0lSSS4gKi9cbmNvbnN0IGZ1bmNJcmlQYXR0ZXJuID0gL151cmxcXChbJ1wiXT8jKC4qPylbJ1wiXT9cXCkkLztcblxuLyoqXG4gKiBDb21wb25lbnQgdG8gZGlzcGxheSBhbiBpY29uLiBJdCBjYW4gYmUgdXNlZCBpbiB0aGUgZm9sbG93aW5nIHdheXM6XG4gKlxuICogLSBTcGVjaWZ5IHRoZSBzdmdJY29uIGlucHV0IHRvIGxvYWQgYW4gU1ZHIGljb24gZnJvbSBhIFVSTCBwcmV2aW91c2x5IHJlZ2lzdGVyZWQgd2l0aCB0aGVcbiAqICAgYWRkU3ZnSWNvbiwgYWRkU3ZnSWNvbkluTmFtZXNwYWNlLCBhZGRTdmdJY29uU2V0LCBvciBhZGRTdmdJY29uU2V0SW5OYW1lc3BhY2UgbWV0aG9kcyBvZlxuICogICBNYXRJY29uUmVnaXN0cnkuIElmIHRoZSBzdmdJY29uIHZhbHVlIGNvbnRhaW5zIGEgY29sb24gaXQgaXMgYXNzdW1lZCB0byBiZSBpbiB0aGUgZm9ybWF0XG4gKiAgIFwiW25hbWVzcGFjZV06W25hbWVdXCIsIGlmIG5vdCB0aGUgdmFsdWUgd2lsbCBiZSB0aGUgbmFtZSBvZiBhbiBpY29uIGluIHRoZSBkZWZhdWx0IG5hbWVzcGFjZS5cbiAqICAgRXhhbXBsZXM6XG4gKiAgICAgYDxtYXQtaWNvbiBzdmdJY29uPVwibGVmdC1hcnJvd1wiPjwvbWF0LWljb24+XG4gKiAgICAgPG1hdC1pY29uIHN2Z0ljb249XCJhbmltYWxzOmNhdFwiPjwvbWF0LWljb24+YFxuICpcbiAqIC0gVXNlIGEgZm9udCBsaWdhdHVyZSBhcyBhbiBpY29uIGJ5IHB1dHRpbmcgdGhlIGxpZ2F0dXJlIHRleHQgaW4gdGhlIGBmb250SWNvbmAgYXR0cmlidXRlIG9yIHRoZVxuICogICBjb250ZW50IG9mIHRoZSBgPG1hdC1pY29uPmAgY29tcG9uZW50LiBJZiB5b3UgcmVnaXN0ZXIgYSBjdXN0b20gZm9udCBjbGFzcywgZG9uJ3QgZm9yZ2V0IHRvIGFsc29cbiAqICAgaW5jbHVkZSB0aGUgc3BlY2lhbCBjbGFzcyBgbWF0LWxpZ2F0dXJlLWZvbnRgLiBJdCBpcyByZWNvbW1lbmRlZCB0byB1c2UgdGhlIGF0dHJpYnV0ZSBhbHRlcm5hdGl2ZVxuICogICB0byBwcmV2ZW50IHRoZSBsaWdhdHVyZSB0ZXh0IHRvIGJlIHNlbGVjdGFibGUgYW5kIHRvIGFwcGVhciBpbiBzZWFyY2ggZW5naW5lIHJlc3VsdHMuXG4gKiAgIEJ5IGRlZmF1bHQsIHRoZSBNYXRlcmlhbCBpY29ucyBmb250IGlzIHVzZWQgYXMgZGVzY3JpYmVkIGF0XG4gKiAgIGh0dHA6Ly9nb29nbGUuZ2l0aHViLmlvL21hdGVyaWFsLWRlc2lnbi1pY29ucy8jaWNvbi1mb250LWZvci10aGUtd2ViLiBZb3UgY2FuIHNwZWNpZnkgYW5cbiAqICAgYWx0ZXJuYXRlIGZvbnQgYnkgc2V0dGluZyB0aGUgZm9udFNldCBpbnB1dCB0byBlaXRoZXIgdGhlIENTUyBjbGFzcyB0byBhcHBseSB0byB1c2UgdGhlXG4gKiAgIGRlc2lyZWQgZm9udCwgb3IgdG8gYW4gYWxpYXMgcHJldmlvdXNseSByZWdpc3RlcmVkIHdpdGggTWF0SWNvblJlZ2lzdHJ5LnJlZ2lzdGVyRm9udENsYXNzQWxpYXMuXG4gKiAgIEV4YW1wbGVzOlxuICogICAgIGA8bWF0LWljb24gZm9udEljb249XCJob21lXCI+PC9tYXQtaWNvbj5cbiAqICAgICA8bWF0LWljb24+aG9tZTwvbWF0LWljb24+XG4gKiAgICAgPG1hdC1pY29uIGZvbnRTZXQ9XCJteWZvbnRcIiBmb250SWNvbj1cInN1blwiPjwvbWF0LWljb24+XG4gKiAgICAgPG1hdC1pY29uIGZvbnRTZXQ9XCJteWZvbnRcIj5zdW48L21hdC1pY29uPmBcbiAqXG4gKiAtIFNwZWNpZnkgYSBmb250IGdseXBoIHRvIGJlIGluY2x1ZGVkIHZpYSBDU1MgcnVsZXMgYnkgc2V0dGluZyB0aGUgZm9udFNldCBpbnB1dCB0byBzcGVjaWZ5IHRoZVxuICogICBmb250LCBhbmQgdGhlIGZvbnRJY29uIGlucHV0IHRvIHNwZWNpZnkgdGhlIGljb24uIFR5cGljYWxseSB0aGUgZm9udEljb24gd2lsbCBzcGVjaWZ5IGFcbiAqICAgQ1NTIGNsYXNzIHdoaWNoIGNhdXNlcyB0aGUgZ2x5cGggdG8gYmUgZGlzcGxheWVkIHZpYSBhIDpiZWZvcmUgc2VsZWN0b3IsIGFzIGluXG4gKiAgIGh0dHBzOi8vZm9ydGF3ZXNvbWUuZ2l0aHViLmlvL0ZvbnQtQXdlc29tZS9leGFtcGxlcy9cbiAqICAgRXhhbXBsZTpcbiAqICAgICBgPG1hdC1pY29uIGZvbnRTZXQ9XCJmYVwiIGZvbnRJY29uPVwiYWxhcm1cIj48L21hdC1pY29uPmBcbiAqL1xuQENvbXBvbmVudCh7XG4gIHRlbXBsYXRlOiAnPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PicsXG4gIHNlbGVjdG9yOiAnbWF0LWljb24nLFxuICBleHBvcnRBczogJ21hdEljb24nLFxuICBzdHlsZVVybHM6IFsnaWNvbi5jc3MnXSxcbiAgaW5wdXRzOiBbJ2NvbG9yJ10sXG4gIGhvc3Q6IHtcbiAgICAncm9sZSc6ICdpbWcnLFxuICAgICdjbGFzcyc6ICdtYXQtaWNvbiBub3RyYW5zbGF0ZScsXG4gICAgJ1thdHRyLmRhdGEtbWF0LWljb24tdHlwZV0nOiAnX3VzaW5nRm9udEljb24oKSA/IFwiZm9udFwiIDogXCJzdmdcIicsXG4gICAgJ1thdHRyLmRhdGEtbWF0LWljb24tbmFtZV0nOiAnX3N2Z05hbWUgfHwgZm9udEljb24nLFxuICAgICdbYXR0ci5kYXRhLW1hdC1pY29uLW5hbWVzcGFjZV0nOiAnX3N2Z05hbWVzcGFjZSB8fCBmb250U2V0JyxcbiAgICAnW2F0dHIuZm9udEljb25dJzogJ191c2luZ0ZvbnRJY29uKCkgPyBmb250SWNvbiA6IG51bGwnLFxuICAgICdbY2xhc3MubWF0LWljb24taW5saW5lXSc6ICdpbmxpbmUnLFxuICAgICdbY2xhc3MubWF0LWljb24tbm8tY29sb3JdJzogJ2NvbG9yICE9PSBcInByaW1hcnlcIiAmJiBjb2xvciAhPT0gXCJhY2NlbnRcIiAmJiBjb2xvciAhPT0gXCJ3YXJuXCInLFxuICB9LFxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaCxcbn0pXG5leHBvcnQgY2xhc3MgTWF0SWNvbiBleHRlbmRzIF9NYXRJY29uQmFzZSBpbXBsZW1lbnRzIE9uSW5pdCwgQWZ0ZXJWaWV3Q2hlY2tlZCwgQ2FuQ29sb3IsIE9uRGVzdHJveSB7XG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBpY29uIHNob3VsZCBiZSBpbmxpbmVkLCBhdXRvbWF0aWNhbGx5IHNpemluZyB0aGUgaWNvbiB0byBtYXRjaCB0aGUgZm9udCBzaXplIG9mXG4gICAqIHRoZSBlbGVtZW50IHRoZSBpY29uIGlzIGNvbnRhaW5lZCBpbi5cbiAgICovXG4gIEBJbnB1dCgpXG4gIGdldCBpbmxpbmUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2lubGluZTtcbiAgfVxuICBzZXQgaW5saW5lKGlubGluZTogQm9vbGVhbklucHV0KSB7XG4gICAgdGhpcy5faW5saW5lID0gY29lcmNlQm9vbGVhblByb3BlcnR5KGlubGluZSk7XG4gIH1cbiAgcHJpdmF0ZSBfaW5saW5lOiBib29sZWFuID0gZmFsc2U7XG5cbiAgLyoqIE5hbWUgb2YgdGhlIGljb24gaW4gdGhlIFNWRyBpY29uIHNldC4gKi9cbiAgQElucHV0KClcbiAgZ2V0IHN2Z0ljb24oKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fc3ZnSWNvbjtcbiAgfVxuICBzZXQgc3ZnSWNvbih2YWx1ZTogc3RyaW5nKSB7XG4gICAgaWYgKHZhbHVlICE9PSB0aGlzLl9zdmdJY29uKSB7XG4gICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgdGhpcy5fdXBkYXRlU3ZnSWNvbih2YWx1ZSk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX3N2Z0ljb24pIHtcbiAgICAgICAgdGhpcy5fY2xlYXJTdmdFbGVtZW50KCk7XG4gICAgICB9XG4gICAgICB0aGlzLl9zdmdJY29uID0gdmFsdWU7XG4gICAgfVxuICB9XG4gIHByaXZhdGUgX3N2Z0ljb246IHN0cmluZztcblxuICAvKiogRm9udCBzZXQgdGhhdCB0aGUgaWNvbiBpcyBhIHBhcnQgb2YuICovXG4gIEBJbnB1dCgpXG4gIGdldCBmb250U2V0KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2ZvbnRTZXQ7XG4gIH1cbiAgc2V0IGZvbnRTZXQodmFsdWU6IHN0cmluZykge1xuICAgIGNvbnN0IG5ld1ZhbHVlID0gdGhpcy5fY2xlYW51cEZvbnRWYWx1ZSh2YWx1ZSk7XG5cbiAgICBpZiAobmV3VmFsdWUgIT09IHRoaXMuX2ZvbnRTZXQpIHtcbiAgICAgIHRoaXMuX2ZvbnRTZXQgPSBuZXdWYWx1ZTtcbiAgICAgIHRoaXMuX3VwZGF0ZUZvbnRJY29uQ2xhc3NlcygpO1xuICAgIH1cbiAgfVxuICBwcml2YXRlIF9mb250U2V0OiBzdHJpbmc7XG5cbiAgLyoqIE5hbWUgb2YgYW4gaWNvbiB3aXRoaW4gYSBmb250IHNldC4gKi9cbiAgQElucHV0KClcbiAgZ2V0IGZvbnRJY29uKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2ZvbnRJY29uO1xuICB9XG4gIHNldCBmb250SWNvbih2YWx1ZTogc3RyaW5nKSB7XG4gICAgY29uc3QgbmV3VmFsdWUgPSB0aGlzLl9jbGVhbnVwRm9udFZhbHVlKHZhbHVlKTtcblxuICAgIGlmIChuZXdWYWx1ZSAhPT0gdGhpcy5fZm9udEljb24pIHtcbiAgICAgIHRoaXMuX2ZvbnRJY29uID0gbmV3VmFsdWU7XG4gICAgICB0aGlzLl91cGRhdGVGb250SWNvbkNsYXNzZXMoKTtcbiAgICB9XG4gIH1cbiAgcHJpdmF0ZSBfZm9udEljb246IHN0cmluZztcblxuICBwcml2YXRlIF9wcmV2aW91c0ZvbnRTZXRDbGFzczogc3RyaW5nW10gPSBbXTtcbiAgcHJpdmF0ZSBfcHJldmlvdXNGb250SWNvbkNsYXNzOiBzdHJpbmc7XG5cbiAgX3N2Z05hbWU6IHN0cmluZyB8IG51bGw7XG4gIF9zdmdOYW1lc3BhY2U6IHN0cmluZyB8IG51bGw7XG5cbiAgLyoqIEtlZXBzIHRyYWNrIG9mIHRoZSBjdXJyZW50IHBhZ2UgcGF0aC4gKi9cbiAgcHJpdmF0ZSBfcHJldmlvdXNQYXRoPzogc3RyaW5nO1xuXG4gIC8qKiBLZWVwcyB0cmFjayBvZiB0aGUgZWxlbWVudHMgYW5kIGF0dHJpYnV0ZXMgdGhhdCB3ZSd2ZSBwcmVmaXhlZCB3aXRoIHRoZSBjdXJyZW50IHBhdGguICovXG4gIHByaXZhdGUgX2VsZW1lbnRzV2l0aEV4dGVybmFsUmVmZXJlbmNlcz86IE1hcDxFbGVtZW50LCB7bmFtZTogc3RyaW5nOyB2YWx1ZTogc3RyaW5nfVtdPjtcblxuICAvKiogU3Vic2NyaXB0aW9uIHRvIHRoZSBjdXJyZW50IGluLXByb2dyZXNzIFNWRyBpY29uIHJlcXVlc3QuICovXG4gIHByaXZhdGUgX2N1cnJlbnRJY29uRmV0Y2ggPSBTdWJzY3JpcHRpb24uRU1QVFk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgZWxlbWVudFJlZjogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sXG4gICAgcHJpdmF0ZSBfaWNvblJlZ2lzdHJ5OiBNYXRJY29uUmVnaXN0cnksXG4gICAgQEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nKSBhcmlhSGlkZGVuOiBzdHJpbmcsXG4gICAgQEluamVjdChNQVRfSUNPTl9MT0NBVElPTikgcHJpdmF0ZSBfbG9jYXRpb246IE1hdEljb25Mb2NhdGlvbixcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9lcnJvckhhbmRsZXI6IEVycm9ySGFuZGxlcixcbiAgICBAT3B0aW9uYWwoKVxuICAgIEBJbmplY3QoTUFUX0lDT05fREVGQVVMVF9PUFRJT05TKVxuICAgIGRlZmF1bHRzPzogTWF0SWNvbkRlZmF1bHRPcHRpb25zLFxuICApIHtcbiAgICBzdXBlcihlbGVtZW50UmVmKTtcblxuICAgIGlmIChkZWZhdWx0cykge1xuICAgICAgaWYgKGRlZmF1bHRzLmNvbG9yKSB7XG4gICAgICAgIHRoaXMuY29sb3IgPSB0aGlzLmRlZmF1bHRDb2xvciA9IGRlZmF1bHRzLmNvbG9yO1xuICAgICAgfVxuXG4gICAgICBpZiAoZGVmYXVsdHMuZm9udFNldCkge1xuICAgICAgICB0aGlzLmZvbnRTZXQgPSBkZWZhdWx0cy5mb250U2V0O1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIElmIHRoZSB1c2VyIGhhcyBub3QgZXhwbGljaXRseSBzZXQgYXJpYS1oaWRkZW4sIG1hcmsgdGhlIGljb24gYXMgaGlkZGVuLCBhcyB0aGlzIGlzXG4gICAgLy8gdGhlIHJpZ2h0IHRoaW5nIHRvIGRvIGZvciB0aGUgbWFqb3JpdHkgb2YgaWNvbiB1c2UtY2FzZXMuXG4gICAgaWYgKCFhcmlhSGlkZGVuKSB7XG4gICAgICBlbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsICd0cnVlJyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNwbGl0cyBhbiBzdmdJY29uIGJpbmRpbmcgdmFsdWUgaW50byBpdHMgaWNvbiBzZXQgYW5kIGljb24gbmFtZSBjb21wb25lbnRzLlxuICAgKiBSZXR1cm5zIGEgMi1lbGVtZW50IGFycmF5IG9mIFsoaWNvbiBzZXQpLCAoaWNvbiBuYW1lKV0uXG4gICAqIFRoZSBzZXBhcmF0b3IgZm9yIHRoZSB0d28gZmllbGRzIGlzICc6Jy4gSWYgdGhlcmUgaXMgbm8gc2VwYXJhdG9yLCBhbiBlbXB0eVxuICAgKiBzdHJpbmcgaXMgcmV0dXJuZWQgZm9yIHRoZSBpY29uIHNldCBhbmQgdGhlIGVudGlyZSB2YWx1ZSBpcyByZXR1cm5lZCBmb3JcbiAgICogdGhlIGljb24gbmFtZS4gSWYgdGhlIGFyZ3VtZW50IGlzIGZhbHN5LCByZXR1cm5zIGFuIGFycmF5IG9mIHR3byBlbXB0eSBzdHJpbmdzLlxuICAgKiBUaHJvd3MgYW4gZXJyb3IgaWYgdGhlIG5hbWUgY29udGFpbnMgdHdvIG9yIG1vcmUgJzonIHNlcGFyYXRvcnMuXG4gICAqIEV4YW1wbGVzOlxuICAgKiAgIGAnc29jaWFsOmNha2UnIC0+IFsnc29jaWFsJywgJ2Nha2UnXVxuICAgKiAgICdwZW5ndWluJyAtPiBbJycsICdwZW5ndWluJ11cbiAgICogICBudWxsIC0+IFsnJywgJyddXG4gICAqICAgJ2E6YjpjJyAtPiAodGhyb3dzIEVycm9yKWBcbiAgICovXG4gIHByaXZhdGUgX3NwbGl0SWNvbk5hbWUoaWNvbk5hbWU6IHN0cmluZyk6IFtzdHJpbmcsIHN0cmluZ10ge1xuICAgIGlmICghaWNvbk5hbWUpIHtcbiAgICAgIHJldHVybiBbJycsICcnXTtcbiAgICB9XG4gICAgY29uc3QgcGFydHMgPSBpY29uTmFtZS5zcGxpdCgnOicpO1xuICAgIHN3aXRjaCAocGFydHMubGVuZ3RoKSB7XG4gICAgICBjYXNlIDE6XG4gICAgICAgIHJldHVybiBbJycsIHBhcnRzWzBdXTsgLy8gVXNlIGRlZmF1bHQgbmFtZXNwYWNlLlxuICAgICAgY2FzZSAyOlxuICAgICAgICByZXR1cm4gPFtzdHJpbmcsIHN0cmluZ10+cGFydHM7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBFcnJvcihgSW52YWxpZCBpY29uIG5hbWU6IFwiJHtpY29uTmFtZX1cImApOyAvLyBUT0RPOiBhZGQgYW4gbmdEZXZNb2RlIGNoZWNrXG4gICAgfVxuICB9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgLy8gVXBkYXRlIGZvbnQgY2xhc3NlcyBiZWNhdXNlIG5nT25DaGFuZ2VzIHdvbid0IGJlIGNhbGxlZCBpZiBub25lIG9mIHRoZSBpbnB1dHMgYXJlIHByZXNlbnQsXG4gICAgLy8gZS5nLiA8bWF0LWljb24+YXJyb3c8L21hdC1pY29uPiBJbiB0aGlzIGNhc2Ugd2UgbmVlZCB0byBhZGQgYSBDU1MgY2xhc3MgZm9yIHRoZSBkZWZhdWx0IGZvbnQuXG4gICAgdGhpcy5fdXBkYXRlRm9udEljb25DbGFzc2VzKCk7XG4gIH1cblxuICBuZ0FmdGVyVmlld0NoZWNrZWQoKSB7XG4gICAgY29uc3QgY2FjaGVkRWxlbWVudHMgPSB0aGlzLl9lbGVtZW50c1dpdGhFeHRlcm5hbFJlZmVyZW5jZXM7XG5cbiAgICBpZiAoY2FjaGVkRWxlbWVudHMgJiYgY2FjaGVkRWxlbWVudHMuc2l6ZSkge1xuICAgICAgY29uc3QgbmV3UGF0aCA9IHRoaXMuX2xvY2F0aW9uLmdldFBhdGhuYW1lKCk7XG5cbiAgICAgIC8vIFdlIG5lZWQgdG8gY2hlY2sgd2hldGhlciB0aGUgVVJMIGhhcyBjaGFuZ2VkIG9uIGVhY2ggY2hhbmdlIGRldGVjdGlvbiBzaW5jZVxuICAgICAgLy8gdGhlIGJyb3dzZXIgZG9lc24ndCBoYXZlIGFuIEFQSSB0aGF0IHdpbGwgbGV0IHVzIHJlYWN0IG9uIGxpbmsgY2xpY2tzIGFuZFxuICAgICAgLy8gd2UgY2FuJ3QgZGVwZW5kIG9uIHRoZSBBbmd1bGFyIHJvdXRlci4gVGhlIHJlZmVyZW5jZXMgbmVlZCB0byBiZSB1cGRhdGVkLFxuICAgICAgLy8gYmVjYXVzZSB3aGlsZSBtb3N0IGJyb3dzZXJzIGRvbid0IGNhcmUgd2hldGhlciB0aGUgVVJMIGlzIGNvcnJlY3QgYWZ0ZXJcbiAgICAgIC8vIHRoZSBmaXJzdCByZW5kZXIsIFNhZmFyaSB3aWxsIGJyZWFrIGlmIHRoZSB1c2VyIG5hdmlnYXRlcyB0byBhIGRpZmZlcmVudFxuICAgICAgLy8gcGFnZSBhbmQgdGhlIFNWRyBpc24ndCByZS1yZW5kZXJlZC5cbiAgICAgIGlmIChuZXdQYXRoICE9PSB0aGlzLl9wcmV2aW91c1BhdGgpIHtcbiAgICAgICAgdGhpcy5fcHJldmlvdXNQYXRoID0gbmV3UGF0aDtcbiAgICAgICAgdGhpcy5fcHJlcGVuZFBhdGhUb1JlZmVyZW5jZXMobmV3UGF0aCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5fY3VycmVudEljb25GZXRjaC51bnN1YnNjcmliZSgpO1xuXG4gICAgaWYgKHRoaXMuX2VsZW1lbnRzV2l0aEV4dGVybmFsUmVmZXJlbmNlcykge1xuICAgICAgdGhpcy5fZWxlbWVudHNXaXRoRXh0ZXJuYWxSZWZlcmVuY2VzLmNsZWFyKCk7XG4gICAgfVxuICB9XG5cbiAgX3VzaW5nRm9udEljb24oKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICF0aGlzLnN2Z0ljb247XG4gIH1cblxuICBwcml2YXRlIF9zZXRTdmdFbGVtZW50KHN2ZzogU1ZHRWxlbWVudCkge1xuICAgIHRoaXMuX2NsZWFyU3ZnRWxlbWVudCgpO1xuXG4gICAgLy8gTm90ZTogd2UgZG8gdGhpcyBmaXggaGVyZSwgcmF0aGVyIHRoYW4gdGhlIGljb24gcmVnaXN0cnksIGJlY2F1c2UgdGhlXG4gICAgLy8gcmVmZXJlbmNlcyBoYXZlIHRvIHBvaW50IHRvIHRoZSBVUkwgYXQgdGhlIHRpbWUgdGhhdCB0aGUgaWNvbiB3YXMgY3JlYXRlZC5cbiAgICBjb25zdCBwYXRoID0gdGhpcy5fbG9jYXRpb24uZ2V0UGF0aG5hbWUoKTtcbiAgICB0aGlzLl9wcmV2aW91c1BhdGggPSBwYXRoO1xuICAgIHRoaXMuX2NhY2hlQ2hpbGRyZW5XaXRoRXh0ZXJuYWxSZWZlcmVuY2VzKHN2Zyk7XG4gICAgdGhpcy5fcHJlcGVuZFBhdGhUb1JlZmVyZW5jZXMocGF0aCk7XG4gICAgdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmFwcGVuZENoaWxkKHN2Zyk7XG4gIH1cblxuICBwcml2YXRlIF9jbGVhclN2Z0VsZW1lbnQoKSB7XG4gICAgY29uc3QgbGF5b3V0RWxlbWVudDogSFRNTEVsZW1lbnQgPSB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7XG4gICAgbGV0IGNoaWxkQ291bnQgPSBsYXlvdXRFbGVtZW50LmNoaWxkTm9kZXMubGVuZ3RoO1xuXG4gICAgaWYgKHRoaXMuX2VsZW1lbnRzV2l0aEV4dGVybmFsUmVmZXJlbmNlcykge1xuICAgICAgdGhpcy5fZWxlbWVudHNXaXRoRXh0ZXJuYWxSZWZlcmVuY2VzLmNsZWFyKCk7XG4gICAgfVxuXG4gICAgLy8gUmVtb3ZlIGV4aXN0aW5nIG5vbi1lbGVtZW50IGNoaWxkIG5vZGVzIGFuZCBTVkdzLCBhbmQgYWRkIHRoZSBuZXcgU1ZHIGVsZW1lbnQuIE5vdGUgdGhhdFxuICAgIC8vIHdlIGNhbid0IHVzZSBpbm5lckhUTUwsIGJlY2F1c2UgSUUgd2lsbCB0aHJvdyBpZiB0aGUgZWxlbWVudCBoYXMgYSBkYXRhIGJpbmRpbmcuXG4gICAgd2hpbGUgKGNoaWxkQ291bnQtLSkge1xuICAgICAgY29uc3QgY2hpbGQgPSBsYXlvdXRFbGVtZW50LmNoaWxkTm9kZXNbY2hpbGRDb3VudF07XG5cbiAgICAgIC8vIDEgY29ycmVzcG9uZHMgdG8gTm9kZS5FTEVNRU5UX05PREUuIFdlIHJlbW92ZSBhbGwgbm9uLWVsZW1lbnQgbm9kZXMgaW4gb3JkZXIgdG8gZ2V0IHJpZFxuICAgICAgLy8gb2YgYW55IGxvb3NlIHRleHQgbm9kZXMsIGFzIHdlbGwgYXMgYW55IFNWRyBlbGVtZW50cyBpbiBvcmRlciB0byByZW1vdmUgYW55IG9sZCBpY29ucy5cbiAgICAgIGlmIChjaGlsZC5ub2RlVHlwZSAhPT0gMSB8fCBjaGlsZC5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpID09PSAnc3ZnJykge1xuICAgICAgICBjaGlsZC5yZW1vdmUoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF91cGRhdGVGb250SWNvbkNsYXNzZXMoKSB7XG4gICAgaWYgKCF0aGlzLl91c2luZ0ZvbnRJY29uKCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBlbGVtOiBIVE1MRWxlbWVudCA9IHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudDtcbiAgICBjb25zdCBmb250U2V0Q2xhc3NlcyA9IChcbiAgICAgIHRoaXMuZm9udFNldFxuICAgICAgICA/IHRoaXMuX2ljb25SZWdpc3RyeS5jbGFzc05hbWVGb3JGb250QWxpYXModGhpcy5mb250U2V0KS5zcGxpdCgvICsvKVxuICAgICAgICA6IHRoaXMuX2ljb25SZWdpc3RyeS5nZXREZWZhdWx0Rm9udFNldENsYXNzKClcbiAgICApLmZpbHRlcihjbGFzc05hbWUgPT4gY2xhc3NOYW1lLmxlbmd0aCA+IDApO1xuXG4gICAgdGhpcy5fcHJldmlvdXNGb250U2V0Q2xhc3MuZm9yRWFjaChjbGFzc05hbWUgPT4gZWxlbS5jbGFzc0xpc3QucmVtb3ZlKGNsYXNzTmFtZSkpO1xuICAgIGZvbnRTZXRDbGFzc2VzLmZvckVhY2goY2xhc3NOYW1lID0+IGVsZW0uY2xhc3NMaXN0LmFkZChjbGFzc05hbWUpKTtcbiAgICB0aGlzLl9wcmV2aW91c0ZvbnRTZXRDbGFzcyA9IGZvbnRTZXRDbGFzc2VzO1xuXG4gICAgaWYgKFxuICAgICAgdGhpcy5mb250SWNvbiAhPT0gdGhpcy5fcHJldmlvdXNGb250SWNvbkNsYXNzICYmXG4gICAgICAhZm9udFNldENsYXNzZXMuaW5jbHVkZXMoJ21hdC1saWdhdHVyZS1mb250JylcbiAgICApIHtcbiAgICAgIGlmICh0aGlzLl9wcmV2aW91c0ZvbnRJY29uQ2xhc3MpIHtcbiAgICAgICAgZWxlbS5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuX3ByZXZpb3VzRm9udEljb25DbGFzcyk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5mb250SWNvbikge1xuICAgICAgICBlbGVtLmNsYXNzTGlzdC5hZGQodGhpcy5mb250SWNvbik7XG4gICAgICB9XG4gICAgICB0aGlzLl9wcmV2aW91c0ZvbnRJY29uQ2xhc3MgPSB0aGlzLmZvbnRJY29uO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhbnMgdXAgYSB2YWx1ZSB0byBiZSB1c2VkIGFzIGEgZm9udEljb24gb3IgZm9udFNldC5cbiAgICogU2luY2UgdGhlIHZhbHVlIGVuZHMgdXAgYmVpbmcgYXNzaWduZWQgYXMgYSBDU1MgY2xhc3MsIHdlXG4gICAqIGhhdmUgdG8gdHJpbSB0aGUgdmFsdWUgYW5kIG9taXQgc3BhY2Utc2VwYXJhdGVkIHZhbHVlcy5cbiAgICovXG4gIHByaXZhdGUgX2NsZWFudXBGb250VmFsdWUodmFsdWU6IHN0cmluZykge1xuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnID8gdmFsdWUudHJpbSgpLnNwbGl0KCcgJylbMF0gOiB2YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQcmVwZW5kcyB0aGUgY3VycmVudCBwYXRoIHRvIGFsbCBlbGVtZW50cyB0aGF0IGhhdmUgYW4gYXR0cmlidXRlIHBvaW50aW5nIHRvIGEgYEZ1bmNJUklgXG4gICAqIHJlZmVyZW5jZS4gVGhpcyBpcyByZXF1aXJlZCBiZWNhdXNlIFdlYktpdCBicm93c2VycyByZXF1aXJlIHJlZmVyZW5jZXMgdG8gYmUgcHJlZml4ZWQgd2l0aFxuICAgKiB0aGUgY3VycmVudCBwYXRoLCBpZiB0aGUgcGFnZSBoYXMgYSBgYmFzZWAgdGFnLlxuICAgKi9cbiAgcHJpdmF0ZSBfcHJlcGVuZFBhdGhUb1JlZmVyZW5jZXMocGF0aDogc3RyaW5nKSB7XG4gICAgY29uc3QgZWxlbWVudHMgPSB0aGlzLl9lbGVtZW50c1dpdGhFeHRlcm5hbFJlZmVyZW5jZXM7XG5cbiAgICBpZiAoZWxlbWVudHMpIHtcbiAgICAgIGVsZW1lbnRzLmZvckVhY2goKGF0dHJzLCBlbGVtZW50KSA9PiB7XG4gICAgICAgIGF0dHJzLmZvckVhY2goYXR0ciA9PiB7XG4gICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoYXR0ci5uYW1lLCBgdXJsKCcke3BhdGh9IyR7YXR0ci52YWx1ZX0nKWApO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDYWNoZXMgdGhlIGNoaWxkcmVuIG9mIGFuIFNWRyBlbGVtZW50IHRoYXQgaGF2ZSBgdXJsKClgXG4gICAqIHJlZmVyZW5jZXMgdGhhdCB3ZSBuZWVkIHRvIHByZWZpeCB3aXRoIHRoZSBjdXJyZW50IHBhdGguXG4gICAqL1xuICBwcml2YXRlIF9jYWNoZUNoaWxkcmVuV2l0aEV4dGVybmFsUmVmZXJlbmNlcyhlbGVtZW50OiBTVkdFbGVtZW50KSB7XG4gICAgY29uc3QgZWxlbWVudHNXaXRoRnVuY0lyaSA9IGVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChmdW5jSXJpQXR0cmlidXRlU2VsZWN0b3IpO1xuICAgIGNvbnN0IGVsZW1lbnRzID0gKHRoaXMuX2VsZW1lbnRzV2l0aEV4dGVybmFsUmVmZXJlbmNlcyA9XG4gICAgICB0aGlzLl9lbGVtZW50c1dpdGhFeHRlcm5hbFJlZmVyZW5jZXMgfHwgbmV3IE1hcCgpKTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZWxlbWVudHNXaXRoRnVuY0lyaS5sZW5ndGg7IGkrKykge1xuICAgICAgZnVuY0lyaUF0dHJpYnV0ZXMuZm9yRWFjaChhdHRyID0+IHtcbiAgICAgICAgY29uc3QgZWxlbWVudFdpdGhSZWZlcmVuY2UgPSBlbGVtZW50c1dpdGhGdW5jSXJpW2ldO1xuICAgICAgICBjb25zdCB2YWx1ZSA9IGVsZW1lbnRXaXRoUmVmZXJlbmNlLmdldEF0dHJpYnV0ZShhdHRyKTtcbiAgICAgICAgY29uc3QgbWF0Y2ggPSB2YWx1ZSA/IHZhbHVlLm1hdGNoKGZ1bmNJcmlQYXR0ZXJuKSA6IG51bGw7XG5cbiAgICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgICAgbGV0IGF0dHJpYnV0ZXMgPSBlbGVtZW50cy5nZXQoZWxlbWVudFdpdGhSZWZlcmVuY2UpO1xuXG4gICAgICAgICAgaWYgKCFhdHRyaWJ1dGVzKSB7XG4gICAgICAgICAgICBhdHRyaWJ1dGVzID0gW107XG4gICAgICAgICAgICBlbGVtZW50cy5zZXQoZWxlbWVudFdpdGhSZWZlcmVuY2UsIGF0dHJpYnV0ZXMpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGF0dHJpYnV0ZXMhLnB1c2goe25hbWU6IGF0dHIsIHZhbHVlOiBtYXRjaFsxXX0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKiogU2V0cyBhIG5ldyBTVkcgaWNvbiB3aXRoIGEgcGFydGljdWxhciBuYW1lLiAqL1xuICBwcml2YXRlIF91cGRhdGVTdmdJY29uKHJhd05hbWU6IHN0cmluZyB8IHVuZGVmaW5lZCkge1xuICAgIHRoaXMuX3N2Z05hbWVzcGFjZSA9IG51bGw7XG4gICAgdGhpcy5fc3ZnTmFtZSA9IG51bGw7XG4gICAgdGhpcy5fY3VycmVudEljb25GZXRjaC51bnN1YnNjcmliZSgpO1xuXG4gICAgaWYgKHJhd05hbWUpIHtcbiAgICAgIGNvbnN0IFtuYW1lc3BhY2UsIGljb25OYW1lXSA9IHRoaXMuX3NwbGl0SWNvbk5hbWUocmF3TmFtZSk7XG5cbiAgICAgIGlmIChuYW1lc3BhY2UpIHtcbiAgICAgICAgdGhpcy5fc3ZnTmFtZXNwYWNlID0gbmFtZXNwYWNlO1xuICAgICAgfVxuXG4gICAgICBpZiAoaWNvbk5hbWUpIHtcbiAgICAgICAgdGhpcy5fc3ZnTmFtZSA9IGljb25OYW1lO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9jdXJyZW50SWNvbkZldGNoID0gdGhpcy5faWNvblJlZ2lzdHJ5XG4gICAgICAgIC5nZXROYW1lZFN2Z0ljb24oaWNvbk5hbWUsIG5hbWVzcGFjZSlcbiAgICAgICAgLnBpcGUodGFrZSgxKSlcbiAgICAgICAgLnN1YnNjcmliZShcbiAgICAgICAgICBzdmcgPT4gdGhpcy5fc2V0U3ZnRWxlbWVudChzdmcpLFxuICAgICAgICAgIChlcnI6IEVycm9yKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgRXJyb3IgcmV0cmlldmluZyBpY29uICR7bmFtZXNwYWNlfToke2ljb25OYW1lfSEgJHtlcnIubWVzc2FnZX1gO1xuICAgICAgICAgICAgdGhpcy5fZXJyb3JIYW5kbGVyLmhhbmRsZUVycm9yKG5ldyBFcnJvcihlcnJvck1lc3NhZ2UpKTtcbiAgICAgICAgICB9LFxuICAgICAgICApO1xuICAgIH1cbiAgfVxufVxuIl19