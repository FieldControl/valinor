/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { DOCUMENT, ɵgetDOM as getDOM } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import * as i0 from "@angular/core";
/**
 * A service for managing HTML `<meta>` tags.
 *
 * Properties of the `MetaDefinition` object match the attributes of the
 * HTML `<meta>` tag. These tags define document metadata that is important for
 * things like configuring a Content Security Policy, defining browser compatibility
 * and security settings, setting HTTP Headers, defining rich content for social sharing,
 * and Search Engine Optimization (SEO).
 *
 * To identify specific `<meta>` tags in a document, use an attribute selection
 * string in the format `"tag_attribute='value string'"`.
 * For example, an `attrSelector` value of `"name='description'"` matches a tag
 * whose `name` attribute has the value `"description"`.
 * Selectors are used with the `querySelector()` Document method,
 * in the format `meta[{attrSelector}]`.
 *
 * @see [HTML meta tag](https://developer.mozilla.org/docs/Web/HTML/Element/meta)
 * @see [Document.querySelector()](https://developer.mozilla.org/docs/Web/API/Document/querySelector)
 *
 *
 * @publicApi
 */
export class Meta {
    constructor(_doc) {
        this._doc = _doc;
        this._dom = getDOM();
    }
    /**
     * Retrieves or creates a specific `<meta>` tag element in the current HTML document.
     * In searching for an existing tag, Angular attempts to match the `name` or `property` attribute
     * values in the provided tag definition, and verifies that all other attribute values are equal.
     * If an existing element is found, it is returned and is not modified in any way.
     * @param tag The definition of a `<meta>` element to match or create.
     * @param forceCreation True to create a new element without checking whether one already exists.
     * @returns The existing element with the same attributes and values if found,
     * the new element if no match is found, or `null` if the tag parameter is not defined.
     */
    addTag(tag, forceCreation = false) {
        if (!tag)
            return null;
        return this._getOrCreateElement(tag, forceCreation);
    }
    /**
     * Retrieves or creates a set of `<meta>` tag elements in the current HTML document.
     * In searching for an existing tag, Angular attempts to match the `name` or `property` attribute
     * values in the provided tag definition, and verifies that all other attribute values are equal.
     * @param tags An array of tag definitions to match or create.
     * @param forceCreation True to create new elements without checking whether they already exist.
     * @returns The matching elements if found, or the new elements.
     */
    addTags(tags, forceCreation = false) {
        if (!tags)
            return [];
        return tags.reduce((result, tag) => {
            if (tag) {
                result.push(this._getOrCreateElement(tag, forceCreation));
            }
            return result;
        }, []);
    }
    /**
     * Retrieves a `<meta>` tag element in the current HTML document.
     * @param attrSelector The tag attribute and value to match against, in the format
     * `"tag_attribute='value string'"`.
     * @returns The matching element, if any.
     */
    getTag(attrSelector) {
        if (!attrSelector)
            return null;
        return this._doc.querySelector(`meta[${attrSelector}]`) || null;
    }
    /**
     * Retrieves a set of `<meta>` tag elements in the current HTML document.
     * @param attrSelector The tag attribute and value to match against, in the format
     * `"tag_attribute='value string'"`.
     * @returns The matching elements, if any.
     */
    getTags(attrSelector) {
        if (!attrSelector)
            return [];
        const list /*NodeList*/ = this._doc.querySelectorAll(`meta[${attrSelector}]`);
        return list ? [].slice.call(list) : [];
    }
    /**
     * Modifies an existing `<meta>` tag element in the current HTML document.
     * @param tag The tag description with which to replace the existing tag content.
     * @param selector A tag attribute and value to match against, to identify
     * an existing tag. A string in the format `"tag_attribute=`value string`"`.
     * If not supplied, matches a tag with the same `name` or `property` attribute value as the
     * replacement tag.
     * @return The modified element.
     */
    updateTag(tag, selector) {
        if (!tag)
            return null;
        selector = selector || this._parseSelector(tag);
        const meta = this.getTag(selector);
        if (meta) {
            return this._setMetaElementAttributes(tag, meta);
        }
        return this._getOrCreateElement(tag, true);
    }
    /**
     * Removes an existing `<meta>` tag element from the current HTML document.
     * @param attrSelector A tag attribute and value to match against, to identify
     * an existing tag. A string in the format `"tag_attribute=`value string`"`.
     */
    removeTag(attrSelector) {
        this.removeTagElement(this.getTag(attrSelector));
    }
    /**
     * Removes an existing `<meta>` tag element from the current HTML document.
     * @param meta The tag definition to match against to identify an existing tag.
     */
    removeTagElement(meta) {
        if (meta) {
            this._dom.remove(meta);
        }
    }
    _getOrCreateElement(meta, forceCreation = false) {
        if (!forceCreation) {
            const selector = this._parseSelector(meta);
            // It's allowed to have multiple elements with the same name so it's not enough to
            // just check that element with the same name already present on the page. We also need to
            // check if element has tag attributes
            const elem = this.getTags(selector).filter((elem) => this._containsAttributes(meta, elem))[0];
            if (elem !== undefined)
                return elem;
        }
        const element = this._dom.createElement('meta');
        this._setMetaElementAttributes(meta, element);
        const head = this._doc.getElementsByTagName('head')[0];
        head.appendChild(element);
        return element;
    }
    _setMetaElementAttributes(tag, el) {
        Object.keys(tag).forEach((prop) => el.setAttribute(this._getMetaKeyMap(prop), tag[prop]));
        return el;
    }
    _parseSelector(tag) {
        const attr = tag.name ? 'name' : 'property';
        return `${attr}="${tag[attr]}"`;
    }
    _containsAttributes(tag, elem) {
        return Object.keys(tag).every((key) => elem.getAttribute(this._getMetaKeyMap(key)) === tag[key]);
    }
    _getMetaKeyMap(prop) {
        return META_KEYS_MAP[prop] || prop;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: Meta, deps: [{ token: DOCUMENT }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: Meta, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: Meta, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }] });
/**
 * Mapping for MetaDefinition properties with their correct meta attribute names
 */
const META_KEYS_MAP = {
    httpEquiv: 'http-equiv',
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3BsYXRmb3JtLWJyb3dzZXIvc3JjL2Jyb3dzZXIvbWV0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsUUFBUSxFQUE2QixPQUFPLElBQUksTUFBTSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDdkYsT0FBTyxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUMsTUFBTSxlQUFlLENBQUM7O0FBMEJqRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBcUJHO0FBRUgsTUFBTSxPQUFPLElBQUk7SUFFZixZQUFzQyxJQUFTO1FBQVQsU0FBSSxHQUFKLElBQUksQ0FBSztRQUM3QyxJQUFJLENBQUMsSUFBSSxHQUFHLE1BQU0sRUFBRSxDQUFDO0lBQ3ZCLENBQUM7SUFDRDs7Ozs7Ozs7O09BU0c7SUFDSCxNQUFNLENBQUMsR0FBbUIsRUFBRSxnQkFBeUIsS0FBSztRQUN4RCxJQUFJLENBQUMsR0FBRztZQUFFLE9BQU8sSUFBSSxDQUFDO1FBQ3RCLE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsRUFBRSxhQUFhLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNILE9BQU8sQ0FBQyxJQUFzQixFQUFFLGdCQUF5QixLQUFLO1FBQzVELElBQUksQ0FBQyxJQUFJO1lBQUUsT0FBTyxFQUFFLENBQUM7UUFDckIsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBeUIsRUFBRSxHQUFtQixFQUFFLEVBQUU7WUFDcEUsSUFBSSxHQUFHLEVBQUUsQ0FBQztnQkFDUixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQztZQUM1RCxDQUFDO1lBQ0QsT0FBTyxNQUFNLENBQUM7UUFDaEIsQ0FBQyxFQUFF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Q0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQVksRUFBRSxFQUFFLENBQ3hDLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FDdEQsQ0FBQztRQUNGLE9BQU8sRUFBRSxDQUFDO0lBQ1osQ0FBQztJQUVPLGNBQWMsQ0FBQyxHQUFtQjtRQUN4QyxNQUFNLElBQUksR0FBVyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQztRQUNwRCxPQUFPLEdBQUcsSUFBSSxLQUFLLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO0lBQ2xDLENBQUM7SUFFTyxtQkFBbUIsQ0FBQyxHQUFtQixFQUFFLElBQXFCO1FBQ3BFLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQzNCLENBQUMsR0FBVyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQzFFLENBQUM7SUFDSixDQUFDO0lBRU8sY0FBYyxDQUFDLElBQVk7UUFDakMsT0FBTyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDO0lBQ3JDLENBQUM7eUhBMUlVLElBQUksa0JBRUssUUFBUTs2SEFGakIsSUFBSSxjQURRLE1BQU07O3NHQUNsQixJQUFJO2tCQURoQixVQUFVO21CQUFDLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQzs7MEJBR2pCLE1BQU07MkJBQUMsUUFBUTs7QUEySTlCOztHQUVHO0FBQ0gsTUFBTSxhQUFhLEdBQTZCO0lBQzlDLFNBQVMsRUFBRSxZQUFZO0NBQ3hCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCB7RE9DVU1FTlQsIMm1RG9tQWRhcHRlciBhcyBEb21BZGFwdGVyLCDJtWdldERPTSBhcyBnZXRET019IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge0luamVjdCwgSW5qZWN0YWJsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbi8qKlxuICogUmVwcmVzZW50cyB0aGUgYXR0cmlidXRlcyBvZiBhbiBIVE1MIGA8bWV0YT5gIGVsZW1lbnQuIFRoZSBlbGVtZW50IGl0c2VsZiBpc1xuICogcmVwcmVzZW50ZWQgYnkgdGhlIGludGVybmFsIGBIVE1MTWV0YUVsZW1lbnRgLlxuICpcbiAqIEBzZWUgW0hUTUwgbWV0YSB0YWddKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2RvY3MvV2ViL0hUTUwvRWxlbWVudC9tZXRhKVxuICogQHNlZSB7QGxpbmsgTWV0YX1cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCB0eXBlIE1ldGFEZWZpbml0aW9uID0ge1xuICBjaGFyc2V0Pzogc3RyaW5nO1xuICBjb250ZW50Pzogc3RyaW5nO1xuICBodHRwRXF1aXY/OiBzdHJpbmc7XG4gIGlkPzogc3RyaW5nO1xuICBpdGVtcHJvcD86IHN0cmluZztcbiAgbmFtZT86IHN0cmluZztcbiAgcHJvcGVydHk/OiBzdHJpbmc7XG4gIHNjaGVtZT86IHN0cmluZztcbiAgdXJsPzogc3RyaW5nO1xufSAmIHtcbiAgLy8gVE9ETyhJZ29yTWluYXIpOiB0aGlzIHR5cGUgbG9va3Mgd3JvbmdcbiAgW3Byb3A6IHN0cmluZ106IHN0cmluZztcbn07XG5cbi8qKlxuICogQSBzZXJ2aWNlIGZvciBtYW5hZ2luZyBIVE1MIGA8bWV0YT5gIHRhZ3MuXG4gKlxuICogUHJvcGVydGllcyBvZiB0aGUgYE1ldGFEZWZpbml0aW9uYCBvYmplY3QgbWF0Y2ggdGhlIGF0dHJpYnV0ZXMgb2YgdGhlXG4gKiBIVE1MIGA8bWV0YT5gIHRhZy4gVGhlc2UgdGFncyBkZWZpbmUgZG9jdW1lbnQgbWV0YWRhdGEgdGhhdCBpcyBpbXBvcnRhbnQgZm9yXG4gKiB0aGluZ3MgbGlrZSBjb25maWd1cmluZyBhIENvbnRlbnQgU2VjdXJpdHkgUG9saWN5LCBkZWZpbmluZyBicm93c2VyIGNvbXBhdGliaWxpdHlcbiAqIGFuZCBzZWN1cml0eSBzZXR0aW5ncywgc2V0dGluZyBIVFRQIEhlYWRlcnMsIGRlZmluaW5nIHJpY2ggY29udGVudCBmb3Igc29jaWFsIHNoYXJpbmcsXG4gKiBhbmQgU2VhcmNoIEVuZ2luZSBPcHRpbWl6YXRpb24gKFNFTykuXG4gKlxuICogVG8gaWRlbnRpZnkgc3BlY2lmaWMgYDxtZXRhPmAgdGFncyBpbiBhIGRvY3VtZW50LCB1c2UgYW4gYXR0cmlidXRlIHNlbGVjdGlvblxuICogc3RyaW5nIGluIHRoZSBmb3JtYXQgYFwidGFnX2F0dHJpYnV0ZT0ndmFsdWUgc3RyaW5nJ1wiYC5cbiAqIEZvciBleGFtcGxlLCBhbiBgYXR0clNlbGVjdG9yYCB2YWx1ZSBvZiBgXCJuYW1lPSdkZXNjcmlwdGlvbidcImAgbWF0Y2hlcyBhIHRhZ1xuICogd2hvc2UgYG5hbWVgIGF0dHJpYnV0ZSBoYXMgdGhlIHZhbHVlIGBcImRlc2NyaXB0aW9uXCJgLlxuICogU2VsZWN0b3JzIGFyZSB1c2VkIHdpdGggdGhlIGBxdWVyeVNlbGVjdG9yKClgIERvY3VtZW50IG1ldGhvZCxcbiAqIGluIHRoZSBmb3JtYXQgYG1ldGFbe2F0dHJTZWxlY3Rvcn1dYC5cbiAqXG4gKiBAc2VlIFtIVE1MIG1ldGEgdGFnXShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9kb2NzL1dlYi9IVE1ML0VsZW1lbnQvbWV0YSlcbiAqIEBzZWUgW0RvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoKV0oaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZG9jcy9XZWIvQVBJL0RvY3VtZW50L3F1ZXJ5U2VsZWN0b3IpXG4gKlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQEluamVjdGFibGUoe3Byb3ZpZGVkSW46ICdyb290J30pXG5leHBvcnQgY2xhc3MgTWV0YSB7XG4gIHByaXZhdGUgX2RvbTogRG9tQWRhcHRlcjtcbiAgY29uc3RydWN0b3IoQEluamVjdChET0NVTUVOVCkgcHJpdmF0ZSBfZG9jOiBhbnkpIHtcbiAgICB0aGlzLl9kb20gPSBnZXRET00oKTtcbiAgfVxuICAvKipcbiAgICogUmV0cmlldmVzIG9yIGNyZWF0ZXMgYSBzcGVjaWZpYyBgPG1ldGE+YCB0YWcgZWxlbWVudCBpbiB0aGUgY3VycmVudCBIVE1MIGRvY3VtZW50LlxuICAgKiBJbiBzZWFyY2hpbmcgZm9yIGFuIGV4aXN0aW5nIHRhZywgQW5ndWxhciBhdHRlbXB0cyB0byBtYXRjaCB0aGUgYG5hbWVgIG9yIGBwcm9wZXJ0eWAgYXR0cmlidXRlXG4gICAqIHZhbHVlcyBpbiB0aGUgcHJvdmlkZWQgdGFnIGRlZmluaXRpb24sIGFuZCB2ZXJpZmllcyB0aGF0IGFsbCBvdGhlciBhdHRyaWJ1dGUgdmFsdWVzIGFyZSBlcXVhbC5cbiAgICogSWYgYW4gZXhpc3RpbmcgZWxlbWVudCBpcyBmb3VuZCwgaXQgaXMgcmV0dXJuZWQgYW5kIGlzIG5vdCBtb2RpZmllZCBpbiBhbnkgd2F5LlxuICAgKiBAcGFyYW0gdGFnIFRoZSBkZWZpbml0aW9uIG9mIGEgYDxtZXRhPmAgZWxlbWVudCB0byBtYXRjaCBvciBjcmVhdGUuXG4gICAqIEBwYXJhbSBmb3JjZUNyZWF0aW9uIFRydWUgdG8gY3JlYXRlIGEgbmV3IGVsZW1lbnQgd2l0aG91dCBjaGVja2luZyB3aGV0aGVyIG9uZSBhbHJlYWR5IGV4aXN0cy5cbiAgICogQHJldHVybnMgVGhlIGV4aXN0aW5nIGVsZW1lbnQgd2l0aCB0aGUgc2FtZSBhdHRyaWJ1dGVzIGFuZCB2YWx1ZXMgaWYgZm91bmQsXG4gICAqIHRoZSBuZXcgZWxlbWVudCBpZiBubyBtYXRjaCBpcyBmb3VuZCwgb3IgYG51bGxgIGlmIHRoZSB0YWcgcGFyYW1ldGVyIGlzIG5vdCBkZWZpbmVkLlxuICAgKi9cbiAgYWRkVGFnKHRhZzogTWV0YURlZmluaXRpb24sIGZvcmNlQ3JlYXRpb246IGJvb2xlYW4gPSBmYWxzZSk6IEhUTUxNZXRhRWxlbWVudCB8IG51bGwge1xuICAgIGlmICghdGFnKSByZXR1cm4gbnVsbDtcbiAgICByZXR1cm4gdGhpcy5fZ2V0T3JDcmVhdGVFbGVtZW50KHRhZywgZm9yY2VDcmVhdGlvbik7XG4gIH1cblxuICAvKipcbiAgICogUmV0cmlldmVzIG9yIGNyZWF0ZXMgYSBzZXQgb2YgYDxtZXRhPmAgdGFnIGVsZW1lbnRzIGluIHRoZSBjdXJyZW50IEhUTUwgZG9jdW1lbnQuXG4gICAqIEluIHNlYXJjaGluZyBmb3IgYW4gZXhpc3RpbmcgdGFnLCBBbmd1bGFyIGF0dGVtcHRzIHRvIG1hdGNoIHRoZSBgbmFtZWAgb3IgYHByb3BlcnR5YCBhdHRyaWJ1dGVcbiAgICogdmFsdWVzIGluIHRoZSBwcm92aWRlZCB0YWcgZGVmaW5pdGlvbiwgYW5kIHZlcmlmaWVzIHRoYXQgYWxsIG90aGVyIGF0dHJpYnV0ZSB2YWx1ZXMgYXJlIGVxdWFsLlxuICAgKiBAcGFyYW0gdGFncyBBbiBhcnJheSBvZiB0YWcgZGVmaW5pdGlvbnMgdG8gbWF0Y2ggb3IgY3JlYXRlLlxuICAgKiBAcGFyYW0gZm9yY2VDcmVhdGlvbiBUcnVlIHRvIGNyZWF0ZSBuZXcgZWxlbWVudHMgd2l0aG91dCBjaGVja2luZyB3aGV0aGVyIHRoZXkgYWxyZWFkeSBleGlzdC5cbiAgICogQHJldHVybnMgVGhlIG1hdGNoaW5nIGVsZW1lbnRzIGlmIGZvdW5kLCBvciB0aGUgbmV3IGVsZW1lbnRzLlxuICAgKi9cbiAgYWRkVGFncyh0YWdzOiBNZXRhRGVmaW5pdGlvbltdLCBmb3JjZUNyZWF0aW9uOiBib29sZWFuID0gZmFsc2UpOiBIVE1MTWV0YUVsZW1lbnRbXSB7XG4gICAgaWYgKCF0YWdzKSByZXR1cm4gW107XG4gICAgcmV0dXJuIHRhZ3MucmVkdWNlKChyZXN1bHQ6IEhUTUxNZXRhRWxlbWVudFtdLCB0YWc6IE1ldGFEZWZpbml0aW9uKSA9PiB7XG4gICAgICBpZiAodGFnKSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKHRoaXMuX2dldE9yQ3JlYXRlRWxlbWVudCh0YWcsIGZvcmNlQ3JlYXRpb24pKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSwgW10pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlcyBhIGA8bWV0YT5gIHRhZyBlbGVtZW50IGluIHRoZSBjdXJyZW50IEhUTUwgZG9jdW1lbnQuXG4gICAqIEBwYXJhbSBhdHRyU2VsZWN0b3IgVGhlIHRhZyBhdHRyaWJ1dGUgYW5kIHZhbHVlIHRvIG1hdGNoIGFnYWluc3QsIGluIHRoZSBmb3JtYXRcbiAgICogYFwidGFnX2F0dHJpYnV0ZT0ndmFsdWUgc3RyaW5nJ1wiYC5cbiAgICogQHJldHVybnMgVGhlIG1hdGNoaW5nIGVsZW1lbnQsIGlmIGFueS5cbiAgICovXG4gIGdldFRhZyhhdHRyU2VsZWN0b3I6IHN0cmluZyk6IEhUTUxNZXRhRWxlbWVudCB8IG51bGwge1xuICAgIGlmICghYXR0clNlbGVjdG9yKSByZXR1cm4gbnVsbDtcbiAgICByZXR1cm4gdGhpcy5fZG9jLnF1ZXJ5U2VsZWN0b3IoYG1ldGFbJHthdHRyU2VsZWN0b3J9XWApIHx8IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogUmV0cmlldmVzIGEgc2V0IG9mIGA8bWV0YT5gIHRhZyBlbGVtZW50cyBpbiB0aGUgY3VycmVudCBIVE1MIGRvY3VtZW50LlxuICAgKiBAcGFyYW0gYXR0clNlbGVjdG9yIFRoZSB0YWcgYXR0cmlidXRlIGFuZCB2YWx1ZSB0byBtYXRjaCBhZ2FpbnN0LCBpbiB0aGUgZm9ybWF0XG4gICAqIGBcInRhZ19hdHRyaWJ1dGU9J3ZhbHVlIHN0cmluZydcImAuXG4gICAqIEByZXR1cm5zIFRoZSBtYXRjaGluZyBlbGVtZW50cywgaWYgYW55LlxuICAgKi9cbiAgZ2V0VGFncyhhdHRyU2VsZWN0b3I6IHN0cmluZyk6IEhUTUxNZXRhRWxlbWVudFtdIHtcbiAgICBpZiAoIWF0dHJTZWxlY3RvcikgcmV0dXJuIFtdO1xuICAgIGNvbnN0IGxpc3QgLypOb2RlTGlzdCovID0gdGhpcy5fZG9jLnF1ZXJ5U2VsZWN0b3JBbGwoYG1ldGFbJHthdHRyU2VsZWN0b3J9XWApO1xuICAgIHJldHVybiBsaXN0ID8gW10uc2xpY2UuY2FsbChsaXN0KSA6IFtdO1xuICB9XG5cbiAgLyoqXG4gICAqIE1vZGlmaWVzIGFuIGV4aXN0aW5nIGA8bWV0YT5gIHRhZyBlbGVtZW50IGluIHRoZSBjdXJyZW50IEhUTUwgZG9jdW1lbnQuXG4gICAqIEBwYXJhbSB0YWcgVGhlIHRhZyBkZXNjcmlwdGlvbiB3aXRoIHdoaWNoIHRvIHJlcGxhY2UgdGhlIGV4aXN0aW5nIHRhZyBjb250ZW50LlxuICAgKiBAcGFyYW0gc2VsZWN0b3IgQSB0YWcgYXR0cmlidXRlIGFuZCB2YWx1ZSB0byBtYXRjaCBhZ2FpbnN0LCB0byBpZGVudGlmeVxuICAgKiBhbiBleGlzdGluZyB0YWcuIEEgc3RyaW5nIGluIHRoZSBmb3JtYXQgYFwidGFnX2F0dHJpYnV0ZT1gdmFsdWUgc3RyaW5nYFwiYC5cbiAgICogSWYgbm90IHN1cHBsaWVkLCBtYXRjaGVzIGEgdGFnIHdpdGggdGhlIHNhbWUgYG5hbWVgIG9yIGBwcm9wZXJ0eWAgYXR0cmlidXRlIHZhbHVlIGFzIHRoZVxuICAgKiByZXBsYWNlbWVudCB0YWcuXG4gICAqIEByZXR1cm4gVGhlIG1vZGlmaWVkIGVsZW1lbnQuXG4gICAqL1xuICB1cGRhdGVUYWcodGFnOiBNZXRhRGVmaW5pdGlvbiwgc2VsZWN0b3I/OiBzdHJpbmcpOiBIVE1MTWV0YUVsZW1lbnQgfCBudWxsIHtcbiAgICBpZiAoIXRhZykgcmV0dXJuIG51bGw7XG4gICAgc2VsZWN0b3IgPSBzZWxlY3RvciB8fCB0aGlzLl9wYXJzZVNlbGVjdG9yKHRhZyk7XG4gICAgY29uc3QgbWV0YTogSFRNTE1ldGFFbGVtZW50ID0gdGhpcy5nZXRUYWcoc2VsZWN0b3IpITtcbiAgICBpZiAobWV0YSkge1xuICAgICAgcmV0dXJuIHRoaXMuX3NldE1ldGFFbGVtZW50QXR0cmlidXRlcyh0YWcsIG1ldGEpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fZ2V0T3JDcmVhdGVFbGVtZW50KHRhZywgdHJ1ZSk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyBhbiBleGlzdGluZyBgPG1ldGE+YCB0YWcgZWxlbWVudCBmcm9tIHRoZSBjdXJyZW50IEhUTUwgZG9jdW1lbnQuXG4gICAqIEBwYXJhbSBhdHRyU2VsZWN0b3IgQSB0YWcgYXR0cmlidXRlIGFuZCB2YWx1ZSB0byBtYXRjaCBhZ2FpbnN0LCB0byBpZGVudGlmeVxuICAgKiBhbiBleGlzdGluZyB0YWcuIEEgc3RyaW5nIGluIHRoZSBmb3JtYXQgYFwidGFnX2F0dHJpYnV0ZT1gdmFsdWUgc3RyaW5nYFwiYC5cbiAgICovXG4gIHJlbW92ZVRhZyhhdHRyU2VsZWN0b3I6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMucmVtb3ZlVGFnRWxlbWVudCh0aGlzLmdldFRhZyhhdHRyU2VsZWN0b3IpISk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyBhbiBleGlzdGluZyBgPG1ldGE+YCB0YWcgZWxlbWVudCBmcm9tIHRoZSBjdXJyZW50IEhUTUwgZG9jdW1lbnQuXG4gICAqIEBwYXJhbSBtZXRhIFRoZSB0YWcgZGVmaW5pdGlvbiB0byBtYXRjaCBhZ2FpbnN0IHRvIGlkZW50aWZ5IGFuIGV4aXN0aW5nIHRhZy5cbiAgICovXG4gIHJlbW92ZVRhZ0VsZW1lbnQobWV0YTogSFRNTE1ldGFFbGVtZW50KTogdm9pZCB7XG4gICAgaWYgKG1ldGEpIHtcbiAgICAgIHRoaXMuX2RvbS5yZW1vdmUobWV0YSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0T3JDcmVhdGVFbGVtZW50KFxuICAgIG1ldGE6IE1ldGFEZWZpbml0aW9uLFxuICAgIGZvcmNlQ3JlYXRpb246IGJvb2xlYW4gPSBmYWxzZSxcbiAgKTogSFRNTE1ldGFFbGVtZW50IHtcbiAgICBpZiAoIWZvcmNlQ3JlYXRpb24pIHtcbiAgICAgIGNvbnN0IHNlbGVjdG9yOiBzdHJpbmcgPSB0aGlzLl9wYXJzZVNlbGVjdG9yKG1ldGEpO1xuICAgICAgLy8gSXQncyBhbGxvd2VkIHRvIGhhdmUgbXVsdGlwbGUgZWxlbWVudHMgd2l0aCB0aGUgc2FtZSBuYW1lIHNvIGl0J3Mgbm90IGVub3VnaCB0b1xuICAgICAgLy8ganVzdCBjaGVjayB0aGF0IGVsZW1lbnQgd2l0aCB0aGUgc2FtZSBuYW1lIGFscmVhZHkgcHJlc2VudCBvbiB0aGUgcGFnZS4gV2UgYWxzbyBuZWVkIHRvXG4gICAgICAvLyBjaGVjayBpZiBlbGVtZW50IGhhcyB0YWcgYXR0cmlidXRlc1xuICAgICAgY29uc3QgZWxlbSA9IHRoaXMuZ2V0VGFncyhzZWxlY3RvcikuZmlsdGVyKChlbGVtKSA9PiB0aGlzLl9jb250YWluc0F0dHJpYnV0ZXMobWV0YSwgZWxlbSkpWzBdO1xuICAgICAgaWYgKGVsZW0gIT09IHVuZGVmaW5lZCkgcmV0dXJuIGVsZW07XG4gICAgfVxuICAgIGNvbnN0IGVsZW1lbnQ6IEhUTUxNZXRhRWxlbWVudCA9IHRoaXMuX2RvbS5jcmVhdGVFbGVtZW50KCdtZXRhJykgYXMgSFRNTE1ldGFFbGVtZW50O1xuICAgIHRoaXMuX3NldE1ldGFFbGVtZW50QXR0cmlidXRlcyhtZXRhLCBlbGVtZW50KTtcbiAgICBjb25zdCBoZWFkID0gdGhpcy5fZG9jLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF07XG4gICAgaGVhZC5hcHBlbmRDaGlsZChlbGVtZW50KTtcbiAgICByZXR1cm4gZWxlbWVudDtcbiAgfVxuXG4gIHByaXZhdGUgX3NldE1ldGFFbGVtZW50QXR0cmlidXRlcyh0YWc6IE1ldGFEZWZpbml0aW9uLCBlbDogSFRNTE1ldGFFbGVtZW50KTogSFRNTE1ldGFFbGVtZW50IHtcbiAgICBPYmplY3Qua2V5cyh0YWcpLmZvckVhY2goKHByb3A6IHN0cmluZykgPT5cbiAgICAgIGVsLnNldEF0dHJpYnV0ZSh0aGlzLl9nZXRNZXRhS2V5TWFwKHByb3ApLCB0YWdbcHJvcF0pLFxuICAgICk7XG4gICAgcmV0dXJuIGVsO1xuICB9XG5cbiAgcHJpdmF0ZSBfcGFyc2VTZWxlY3Rvcih0YWc6IE1ldGFEZWZpbml0aW9uKTogc3RyaW5nIHtcbiAgICBjb25zdCBhdHRyOiBzdHJpbmcgPSB0YWcubmFtZSA/ICduYW1lJyA6ICdwcm9wZXJ0eSc7XG4gICAgcmV0dXJuIGAke2F0dHJ9PVwiJHt0YWdbYXR0cl19XCJgO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29udGFpbnNBdHRyaWJ1dGVzKHRhZzogTWV0YURlZmluaXRpb24sIGVsZW06IEhUTUxNZXRhRWxlbWVudCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyh0YWcpLmV2ZXJ5KFxuICAgICAgKGtleTogc3RyaW5nKSA9PiBlbGVtLmdldEF0dHJpYnV0ZSh0aGlzLl9nZXRNZXRhS2V5TWFwKGtleSkpID09PSB0YWdba2V5XSxcbiAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0TWV0YUtleU1hcChwcm9wOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBNRVRBX0tFWVNfTUFQW3Byb3BdIHx8IHByb3A7XG4gIH1cbn1cblxuLyoqXG4gKiBNYXBwaW5nIGZvciBNZXRhRGVmaW5pdGlvbiBwcm9wZXJ0aWVzIHdpdGggdGhlaXIgY29ycmVjdCBtZXRhIGF0dHJpYnV0ZSBuYW1lc1xuICovXG5jb25zdCBNRVRBX0tFWVNfTUFQOiB7W3Byb3A6IHN0cmluZ106IHN0cmluZ30gPSB7XG4gIGh0dHBFcXVpdjogJ2h0dHAtZXF1aXYnLFxufTtcbiJdfQ==