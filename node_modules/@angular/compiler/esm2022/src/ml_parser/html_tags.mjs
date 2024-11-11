/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { DomElementSchemaRegistry } from '../schema/dom_element_schema_registry';
import { getNsPrefix, TagContentType } from './tags';
export class HtmlTagDefinition {
    constructor({ closedByChildren, implicitNamespacePrefix, contentType = TagContentType.PARSABLE_DATA, closedByParent = false, isVoid = false, ignoreFirstLf = false, preventNamespaceInheritance = false, canSelfClose = false, } = {}) {
        this.closedByChildren = {};
        this.closedByParent = false;
        if (closedByChildren && closedByChildren.length > 0) {
            closedByChildren.forEach((tagName) => (this.closedByChildren[tagName] = true));
        }
        this.isVoid = isVoid;
        this.closedByParent = closedByParent || isVoid;
        this.implicitNamespacePrefix = implicitNamespacePrefix || null;
        this.contentType = contentType;
        this.ignoreFirstLf = ignoreFirstLf;
        this.preventNamespaceInheritance = preventNamespaceInheritance;
        this.canSelfClose = canSelfClose ?? isVoid;
    }
    isClosedByChild(name) {
        return this.isVoid || name.toLowerCase() in this.closedByChildren;
    }
    getContentType(prefix) {
        if (typeof this.contentType === 'object') {
            const overrideType = prefix === undefined ? undefined : this.contentType[prefix];
            return overrideType ?? this.contentType.default;
        }
        return this.contentType;
    }
}
let DEFAULT_TAG_DEFINITION;
// see https://www.w3.org/TR/html51/syntax.html#optional-tags
// This implementation does not fully conform to the HTML5 spec.
let TAG_DEFINITIONS;
export function getHtmlTagDefinition(tagName) {
    if (!TAG_DEFINITIONS) {
        DEFAULT_TAG_DEFINITION = new HtmlTagDefinition({ canSelfClose: true });
        TAG_DEFINITIONS = Object.assign(Object.create(null), {
            'base': new HtmlTagDefinition({ isVoid: true }),
            'meta': new HtmlTagDefinition({ isVoid: true }),
            'area': new HtmlTagDefinition({ isVoid: true }),
            'embed': new HtmlTagDefinition({ isVoid: true }),
            'link': new HtmlTagDefinition({ isVoid: true }),
            'img': new HtmlTagDefinition({ isVoid: true }),
            'input': new HtmlTagDefinition({ isVoid: true }),
            'param': new HtmlTagDefinition({ isVoid: true }),
            'hr': new HtmlTagDefinition({ isVoid: true }),
            'br': new HtmlTagDefinition({ isVoid: true }),
            'source': new HtmlTagDefinition({ isVoid: true }),
            'track': new HtmlTagDefinition({ isVoid: true }),
            'wbr': new HtmlTagDefinition({ isVoid: true }),
            'p': new HtmlTagDefinition({
                closedByChildren: [
                    'address',
                    'article',
                    'aside',
                    'blockquote',
                    'div',
                    'dl',
                    'fieldset',
                    'footer',
                    'form',
                    'h1',
                    'h2',
                    'h3',
                    'h4',
                    'h5',
                    'h6',
                    'header',
                    'hgroup',
                    'hr',
                    'main',
                    'nav',
                    'ol',
                    'p',
                    'pre',
                    'section',
                    'table',
                    'ul',
                ],
                closedByParent: true,
            }),
            'thead': new HtmlTagDefinition({ closedByChildren: ['tbody', 'tfoot'] }),
            'tbody': new HtmlTagDefinition({ closedByChildren: ['tbody', 'tfoot'], closedByParent: true }),
            'tfoot': new HtmlTagDefinition({ closedByChildren: ['tbody'], closedByParent: true }),
            'tr': new HtmlTagDefinition({ closedByChildren: ['tr'], closedByParent: true }),
            'td': new HtmlTagDefinition({ closedByChildren: ['td', 'th'], closedByParent: true }),
            'th': new HtmlTagDefinition({ closedByChildren: ['td', 'th'], closedByParent: true }),
            'col': new HtmlTagDefinition({ isVoid: true }),
            'svg': new HtmlTagDefinition({ implicitNamespacePrefix: 'svg' }),
            'foreignObject': new HtmlTagDefinition({
                // Usually the implicit namespace here would be redundant since it will be inherited from
                // the parent `svg`, but we have to do it for `foreignObject`, because the way the parser
                // works is that the parent node of an end tag is its own start tag which means that
                // the `preventNamespaceInheritance` on `foreignObject` would have it default to the
                // implicit namespace which is `html`, unless specified otherwise.
                implicitNamespacePrefix: 'svg',
                // We want to prevent children of foreignObject from inheriting its namespace, because
                // the point of the element is to allow nodes from other namespaces to be inserted.
                preventNamespaceInheritance: true,
            }),
            'math': new HtmlTagDefinition({ implicitNamespacePrefix: 'math' }),
            'li': new HtmlTagDefinition({ closedByChildren: ['li'], closedByParent: true }),
            'dt': new HtmlTagDefinition({ closedByChildren: ['dt', 'dd'] }),
            'dd': new HtmlTagDefinition({ closedByChildren: ['dt', 'dd'], closedByParent: true }),
            'rb': new HtmlTagDefinition({
                closedByChildren: ['rb', 'rt', 'rtc', 'rp'],
                closedByParent: true,
            }),
            'rt': new HtmlTagDefinition({
                closedByChildren: ['rb', 'rt', 'rtc', 'rp'],
                closedByParent: true,
            }),
            'rtc': new HtmlTagDefinition({ closedByChildren: ['rb', 'rtc', 'rp'], closedByParent: true }),
            'rp': new HtmlTagDefinition({
                closedByChildren: ['rb', 'rt', 'rtc', 'rp'],
                closedByParent: true,
            }),
            'optgroup': new HtmlTagDefinition({ closedByChildren: ['optgroup'], closedByParent: true }),
            'option': new HtmlTagDefinition({
                closedByChildren: ['option', 'optgroup'],
                closedByParent: true,
            }),
            'pre': new HtmlTagDefinition({ ignoreFirstLf: true }),
            'listing': new HtmlTagDefinition({ ignoreFirstLf: true }),
            'style': new HtmlTagDefinition({ contentType: TagContentType.RAW_TEXT }),
            'script': new HtmlTagDefinition({ contentType: TagContentType.RAW_TEXT }),
            'title': new HtmlTagDefinition({
                // The browser supports two separate `title` tags which have to use
                // a different content type: `HTMLTitleElement` and `SVGTitleElement`
                contentType: {
                    default: TagContentType.ESCAPABLE_RAW_TEXT,
                    svg: TagContentType.PARSABLE_DATA,
                },
            }),
            'textarea': new HtmlTagDefinition({
                contentType: TagContentType.ESCAPABLE_RAW_TEXT,
                ignoreFirstLf: true,
            }),
        });
        new DomElementSchemaRegistry().allKnownElementNames().forEach((knownTagName) => {
            if (!TAG_DEFINITIONS[knownTagName] && getNsPrefix(knownTagName) === null) {
                TAG_DEFINITIONS[knownTagName] = new HtmlTagDefinition({ canSelfClose: false });
            }
        });
    }
    // We have to make both a case-sensitive and a case-insensitive lookup, because
    // HTML tag names are case insensitive, whereas some SVG tags are case sensitive.
    return (TAG_DEFINITIONS[tagName] ?? TAG_DEFINITIONS[tagName.toLowerCase()] ?? DEFAULT_TAG_DEFINITION);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHRtbF90YWdzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL21sX3BhcnNlci9odG1sX3RhZ3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLHdCQUF3QixFQUFDLE1BQU0sdUNBQXVDLENBQUM7QUFFL0UsT0FBTyxFQUFDLFdBQVcsRUFBRSxjQUFjLEVBQWdCLE1BQU0sUUFBUSxDQUFDO0FBRWxFLE1BQU0sT0FBTyxpQkFBaUI7SUFhNUIsWUFBWSxFQUNWLGdCQUFnQixFQUNoQix1QkFBdUIsRUFDdkIsV0FBVyxHQUFHLGNBQWMsQ0FBQyxhQUFhLEVBQzFDLGNBQWMsR0FBRyxLQUFLLEVBQ3RCLE1BQU0sR0FBRyxLQUFLLEVBQ2QsYUFBYSxHQUFHLEtBQUssRUFDckIsMkJBQTJCLEdBQUcsS0FBSyxFQUNuQyxZQUFZLEdBQUcsS0FBSyxNQVVsQixFQUFFO1FBOUJFLHFCQUFnQixHQUE2QixFQUFFLENBQUM7UUFLeEQsbUJBQWMsR0FBRyxLQUFLLENBQUM7UUEwQnJCLElBQUksZ0JBQWdCLElBQUksZ0JBQWdCLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQ3BELGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNqRixDQUFDO1FBQ0QsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxDQUFDLGNBQWMsR0FBRyxjQUFjLElBQUksTUFBTSxDQUFDO1FBQy9DLElBQUksQ0FBQyx1QkFBdUIsR0FBRyx1QkFBdUIsSUFBSSxJQUFJLENBQUM7UUFDL0QsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7UUFDL0IsSUFBSSxDQUFDLGFB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QUF3QixFQUFFLENBQUMsb0JBQW9CLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxZQUFZLEVBQUUsRUFBRTtZQUM3RSxJQUFJLENBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQyxJQUFJLFdBQVcsQ0FBQyxZQUFZLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQztnQkFDekUsZUFBZSxDQUFDLFlBQVksQ0FBQyxHQUFHLElBQUksaUJBQWlCLENBQUMsRUFBQyxZQUFZLEVBQUUsS0FBSyxFQUFDLENBQUMsQ0FBQztZQUMvRSxDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBQ0QsK0VBQStFO0lBQy9FLGlGQUFpRjtJQUNqRixPQUFPLENBQ0wsZUFBZSxDQUFDLE9BQU8sQ0FBQyxJQUFJLGVBQWUsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLENBQUMsSUFBSSxzQkFBc0IsQ0FDN0YsQ0FBQztBQUNKLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCB7RG9tRWxlbWVudFNjaGVtYVJlZ2lzdHJ5fSBmcm9tICcuLi9zY2hlbWEvZG9tX2VsZW1lbnRfc2NoZW1hX3JlZ2lzdHJ5JztcblxuaW1wb3J0IHtnZXROc1ByZWZpeCwgVGFnQ29udGVudFR5cGUsIFRhZ0RlZmluaXRpb259IGZyb20gJy4vdGFncyc7XG5cbmV4cG9ydCBjbGFzcyBIdG1sVGFnRGVmaW5pdGlvbiBpbXBsZW1lbnRzIFRhZ0RlZmluaXRpb24ge1xuICBwcml2YXRlIGNsb3NlZEJ5Q2hpbGRyZW46IHtba2V5OiBzdHJpbmddOiBib29sZWFufSA9IHt9O1xuICBwcml2YXRlIGNvbnRlbnRUeXBlOlxuICAgIHwgVGFnQ29udGVudFR5cGVcbiAgICB8IHtkZWZhdWx0OiBUYWdDb250ZW50VHlwZTsgW25hbWVzcGFjZTogc3RyaW5nXTogVGFnQ29udGVudFR5cGV9O1xuXG4gIGNsb3NlZEJ5UGFyZW50ID0gZmFsc2U7XG4gIGltcGxpY2l0TmFtZXNwYWNlUHJlZml4OiBzdHJpbmcgfCBudWxsO1xuICBpc1ZvaWQ6IGJvb2xlYW47XG4gIGlnbm9yZUZpcnN0TGY6IGJvb2xlYW47XG4gIGNhblNlbGZDbG9zZTogYm9vbGVhbjtcbiAgcHJldmVudE5hbWVzcGFjZUluaGVyaXRhbmNlOiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKHtcbiAgICBjbG9zZWRCeUNoaWxkcmVuLFxuICAgIGltcGxpY2l0TmFtZXNwYWNlUHJlZml4LFxuICAgIGNvbnRlbnRUeXBlID0gVGFnQ29udGVudFR5cGUuUEFSU0FCTEVfREFUQSxcbiAgICBjbG9zZWRCeVBhcmVudCA9IGZhbHNlLFxuICAgIGlzVm9pZCA9IGZhbHNlLFxuICAgIGlnbm9yZUZpcnN0TGYgPSBmYWxzZSxcbiAgICBwcmV2ZW50TmFtZXNwYWNlSW5oZXJpdGFuY2UgPSBmYWxzZSxcbiAgICBjYW5TZWxmQ2xvc2UgPSBmYWxzZSxcbiAgfToge1xuICAgIGNsb3NlZEJ5Q2hpbGRyZW4/OiBzdHJpbmdbXTtcbiAgICBjbG9zZWRCeVBhcmVudD86IGJvb2xlYW47XG4gICAgaW1wbGljaXROYW1lc3BhY2VQcmVmaXg/OiBzdHJpbmc7XG4gICAgY29udGVudFR5cGU/OiBUYWdDb250ZW50VHlwZSB8IHtkZWZhdWx0OiBUYWdDb250ZW50VHlwZTsgW25hbWVzcGFjZTogc3RyaW5nXTogVGFnQ29udGVudFR5cGV9O1xuICAgIGlzVm9pZD86IGJvb2xlYW47XG4gICAgaWdub3JlRmlyc3RMZj86IGJvb2xlYW47XG4gICAgcHJldmVudE5hbWVzcGFjZUluaGVyaXRhbmNlPzogYm9vbGVhbjtcbiAgICBjYW5TZWxmQ2xvc2U/OiBib29sZWFuO1xuICB9ID0ge30pIHtcbiAgICBpZiAoY2xvc2VkQnlDaGlsZHJlbiAmJiBjbG9zZWRCeUNoaWxkcmVuLmxlbmd0aCA+IDApIHtcbiAgICAgIGNsb3NlZEJ5Q2hpbGRyZW4uZm9yRWFjaCgodGFnTmFtZSkgPT4gKHRoaXMuY2xvc2VkQnlDaGlsZHJlblt0YWdOYW1lXSA9IHRydWUpKTtcbiAgICB9XG4gICAgdGhpcy5pc1ZvaWQgPSBpc1ZvaWQ7XG4gICAgdGhpcy5jbG9zZWRCeVBhcmVudCA9IGNsb3NlZEJ5UGFyZW50IHx8IGlzVm9pZDtcbiAgICB0aGlzLmltcGxpY2l0TmFtZXNwYWNlUHJlZml4ID0gaW1wbGljaXROYW1lc3BhY2VQcmVmaXggfHwgbnVsbDtcbiAgICB0aGlzLmNvbnRlbnRUeXBlID0gY29udGVudFR5cGU7XG4gICAgdGhpcy5pZ25vcmVGaXJzdExmID0gaWdub3JlRmlyc3RMZjtcbiAgICB0aGlzLnByZXZlbnROYW1lc3BhY2VJbmhlcml0YW5jZSA9IHByZXZlbnROYW1lc3BhY2VJbmhlcml0YW5jZTtcbiAgICB0aGlzLmNhblNlbGZDbG9zZSA9IGNhblNlbGZDbG9zZSA/PyBpc1ZvaWQ7XG4gIH1cblxuICBpc0Nsb3NlZEJ5Q2hpbGQobmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuaXNWb2lkIHx8IG5hbWUudG9Mb3dlckNhc2UoKSBpbiB0aGlzLmNsb3NlZEJ5Q2hpbGRyZW47XG4gIH1cblxuICBnZXRDb250ZW50VHlwZShwcmVmaXg/OiBzdHJpbmcpOiBUYWdDb250ZW50VHlwZSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLmNvbnRlbnRUeXBlID09PSAnb2JqZWN0Jykge1xuICAgICAgY29uc3Qgb3ZlcnJpZGVUeXBlID0gcHJlZml4ID09PSB1bmRlZmluZWQgPyB1bmRlZmluZWQgOiB0aGlzLmNvbnRlbnRUeXBlW3ByZWZpeF07XG4gICAgICByZXR1cm4gb3ZlcnJpZGVUeXBlID8/IHRoaXMuY29udGVudFR5cGUuZGVmYXVsdDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY29udGVudFR5cGU7XG4gIH1cbn1cblxubGV0IERFRkFVTFRfVEFHX0RFRklOSVRJT04hOiBIdG1sVGFnRGVmaW5pdGlvbjtcblxuLy8gc2VlIGh0dHBzOi8vd3d3LnczLm9yZy9UUi9odG1sNTEvc3ludGF4Lmh0bWwjb3B0aW9uYWwtdGFnc1xuLy8gVGhpcyBpbXBsZW1lbnRhdGlvbiBkb2VzIG5vdCBmdWxseSBjb25mb3JtIHRvIHRoZSBIVE1MNSBzcGVjLlxubGV0IFRBR19ERUZJTklUSU9OUyE6IHtba2V5OiBzdHJpbmddOiBIdG1sVGFnRGVmaW5pdGlvbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRIdG1sVGFnRGVmaW5pdGlvbih0YWdOYW1lOiBzdHJpbmcpOiBIdG1sVGFnRGVmaW5pdGlvbiB7XG4gIGlmICghVEFHX0RFRklOSVRJT05TKSB7XG4gICAgREVGQVVMVF9UQUdfREVGSU5JVElPTiA9IG5ldyBIdG1sVGFnRGVmaW5pdGlvbih7Y2FuU2VsZkNsb3NlOiB0cnVlfSk7XG4gICAgVEFHX0RFRklOSVRJT05TID0gT2JqZWN0LmFzc2lnbihPYmplY3QuY3JlYXRlKG51bGwpLCB7XG4gICAgICAnYmFzZSc6IG5ldyBIdG1sVGFnRGVmaW5pdGlvbih7aXNWb2lkOiB0cnVlfSksXG4gICAgICAnbWV0YSc6IG5ldyBIdG1sVGFnRGVmaW5pdGlvbih7aXNWb2lkOiB0cnVlfSksXG4gICAgICAnYXJlYSc6IG5ldyBIdG1sVGFnRGVmaW5pdGlvbih7aXNWb2lkOiB0cnVlfSksXG4gICAgICAnZW1iZWQnOiBuZXcgSHRtbFRhZ0RlZmluaXRpb24oe2lzVm9pZDogdHJ1ZX0pLFxuICAgICAgJ2xpbmsnOiBuZXcgSHRtbFRhZ0RlZmluaXRpb24oe2lzVm9pZDogdHJ1ZX0pLFxuICAgICAgJ2ltZyc6IG5ldyBIdG1sVGFnRGVmaW5pdGlvbih7aXNWb2lkOiB0cnVlfSksXG4gICAgICAnaW5wdXQnOiBuZXcgSHRtbFRhZ0RlZmluaXRpb24oe2lzVm9pZDogdHJ1ZX0pLFxuICAgICAgJ3BhcmFtJzogbmV3IEh0bWxUYWdEZWZpbml0aW9uKHtpc1ZvaWQ6IHRydWV9KSxcbiAgICAgICdocic6IG5ldyBIdG1sVGFnRGVmaW5pdGlvbih7aXNWb2lkOiB0cnVlfSksXG4gICAgICAnYnInOiBuZXcgSHRtbFRhZ0RlZmluaXRpb24oe2lzVm9pZDogdHJ1ZX0pLFxuICAgICAgJ3NvdXJjZSc6IG5ldyBIdG1sVGFnRGVmaW5pdGlvbih7aXNWb2lkOiB0cnVlfSksXG4gICAgICAndHJhY2snOiBuZXcgSHRtbFRhZ0RlZmluaXRpb24oe2lzVm9pZDogdHJ1ZX0pLFxuICAgICAgJ3dicic6IG5ldyBIdG1sVGFnRGVmaW5pdGlvbih7aXNWb2lkOiB0cnVlfSksXG4gICAgICAncCc6IG5ldyBIdG1sVGFnRGVmaW5pdGlvbih7XG4gICAgICAgIGNsb3NlZEJ5Q2hpbGRyZW46IFtcbiAgICAgICAgICAnYWRkcmVzcycsXG4gICAgICAgICAgJ2FydGljbGUnLFxuICAgICAgICAgICdhc2lkZScsXG4gICAgICAgICAgJ2Jsb2NrcXVvdGUnLFxuICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICdkbCcsXG4gICAgICAgICAgJ2ZpZWxkc2V0JyxcbiAgICAgICAgICAnZm9vdGVyJyxcbiAgICAgICAgICAnZm9ybScsXG4gICAgICAgICAgJ2gxJyxcbiAgICAgICAgICAnaDInLFxuICAgICAgICAgICdoMycsXG4gICAgICAgICAgJ2g0JyxcbiAgICAgICAgICAnaDUnLFxuICAgICAgICAgICdoNicsXG4gICAgICAgICAgJ2hlYWRlcicsXG4gICAgICAgICAgJ2hncm91cCcsXG4gICAgICAgICAgJ2hyJyxcbiAgICAgICAgICAnbWFpbicsXG4gICAgICAgICAgJ25hdicsXG4gICAgICAgICAgJ29sJyxcbiAgICAgICAgICAncCcsXG4gICAgICAgICAgJ3ByZScsXG4gICAgICAgICAgJ3NlY3Rpb24nLFxuICAgICAgICAgICd0YWJsZScsXG4gICAgICAgICAgJ3VsJyxcbiAgICAgICAgXSxcbiAgICAgICAgY2xvc2VkQnlQYXJlbnQ6IHRydWUsXG4gICAgICB9KSxcbiAgICAgICd0aGVhZCc6IG5ldyBIdG1sVGFnRGVmaW5pdGlvbih7Y2xvc2VkQnlDaGlsZHJlbjogWyd0Ym9keScsICd0Zm9vdCddfSksXG4gICAgICAndGJvZHknOiBuZXcgSHRtbFRhZ0RlZmluaXRpb24oe2Nsb3NlZEJ5Q2hpbGRyZW46IFsndGJvZHknLCAndGZvb3QnXSwgY2xvc2VkQnlQYXJlbnQ6IHRydWV9KSxcbiAgICAgICd0Zm9vdCc6IG5ldyBIdG1sVGFnRGVmaW5pdGlvbih7Y2xvc2VkQnlDaGlsZHJlbjogWyd0Ym9keSddLCBjbG9zZWRCeVBhcmVudDogdHJ1ZX0pLFxuICAgICAgJ3RyJzogbmV3IEh0bWxUYWdEZWZpbml0aW9uKHtjbG9zZWRCeUNoaWxkcmVuOiBbJ3RyJ10sIGNsb3NlZEJ5UGFyZW50OiB0cnVlfSksXG4gICAgICAndGQnOiBuZXcgSHRtbFRhZ0RlZmluaXRpb24oe2Nsb3NlZEJ5Q2hpbGRyZW46IFsndGQnLCAndGgnXSwgY2xvc2VkQnlQYXJlbnQ6IHRydWV9KSxcbiAgICAgICd0aCc6IG5ldyBIdG1sVGFnRGVmaW5pdGlvbih7Y2xvc2VkQnlDaGlsZHJlbjogWyd0ZCcsICd0aCddLCBjbG9zZWRCeVBhcmVudDogdHJ1ZX0pLFxuICAgICAgJ2NvbCc6IG5ldyBIdG1sVGFnRGVmaW5pdGlvbih7aXNWb2lkOiB0cnVlfSksXG4gICAgICAnc3ZnJzogbmV3IEh0bWxUYWdEZWZpbml0aW9uKHtpbXBsaWNpdE5hbWVzcGFjZVByZWZpeDogJ3N2Zyd9KSxcbiAgICAgICdmb3JlaWduT2JqZWN0JzogbmV3IEh0bWxUYWdEZWZpbml0aW9uKHtcbiAgICAgICAgLy8gVXN1YWxseSB0aGUgaW1wbGljaXQgbmFtZXNwYWNlIGhlcmUgd291bGQgYmUgcmVkdW5kYW50IHNpbmNlIGl0IHdpbGwgYmUgaW5oZXJpdGVkIGZyb21cbiAgICAgICAgLy8gdGhlIHBhcmVudCBgc3ZnYCwgYnV0IHdlIGhhdmUgdG8gZG8gaXQgZm9yIGBmb3JlaWduT2JqZWN0YCwgYmVjYXVzZSB0aGUgd2F5IHRoZSBwYXJzZXJcbiAgICAgICAgLy8gd29ya3MgaXMgdGhhdCB0aGUgcGFyZW50IG5vZGUgb2YgYW4gZW5kIHRhZyBpcyBpdHMgb3duIHN0YXJ0IHRhZyB3aGljaCBtZWFucyB0aGF0XG4gICAgICAgIC8vIHRoZSBgcHJldmVudE5hbWVzcGFjZUluaGVyaXRhbmNlYCBvbiBgZm9yZWlnbk9iamVjdGAgd291bGQgaGF2ZSBpdCBkZWZhdWx0IHRvIHRoZVxuICAgICAgICAvLyBpbXBsaWNpdCBuYW1lc3BhY2Ugd2hpY2ggaXMgYGh0bWxgLCB1bmxlc3Mgc3BlY2lmaWVkIG90aGVyd2lzZS5cbiAgICAgICAgaW1wbGljaXROYW1lc3BhY2VQcmVmaXg6ICdzdmcnLFxuICAgICAgICAvLyBXZSB3YW50IHRvIHByZXZlbnQgY2hpbGRyZW4gb2YgZm9yZWlnbk9iamVjdCBmcm9tIGluaGVyaXRpbmcgaXRzIG5hbWVzcGFjZSwgYmVjYXVzZVxuICAgICAgICAvLyB0aGUgcG9pbnQgb2YgdGhlIGVsZW1lbnQgaXMgdG8gYWxsb3cgbm9kZXMgZnJvbSBvdGhlciBuYW1lc3BhY2VzIHRvIGJlIGluc2VydGVkLlxuICAgICAgICBwcmV2ZW50TmFtZXNwYWNlSW5oZXJpdGFuY2U6IHRydWUsXG4gICAgICB9KSxcbiAgICAgICdtYXRoJzogbmV3IEh0bWxUYWdEZWZpbml0aW9uKHtpbXBsaWNpdE5hbWVzcGFjZVByZWZpeDogJ21hdGgnfSksXG4gICAgICAnbGknOiBuZXcgSHRtbFRhZ0RlZmluaXRpb24oe2Nsb3NlZEJ5Q2hpbGRyZW46IFsnbGknXSwgY2xvc2VkQnlQYXJlbnQ6IHRydWV9KSxcbiAgICAgICdkdCc6IG5ldyBIdG1sVGFnRGVmaW5pdGlvbih7Y2xvc2VkQnlDaGlsZHJlbjogWydkdCcsICdkZCddfSksXG4gICAgICAnZGQnOiBuZXcgSHRtbFRhZ0RlZmluaXRpb24oe2Nsb3NlZEJ5Q2hpbGRyZW46IFsnZHQnLCAnZGQnXSwgY2xvc2VkQnlQYXJlbnQ6IHRydWV9KSxcbiAgICAgICdyYic6IG5ldyBIdG1sVGFnRGVmaW5pdGlvbih7XG4gICAgICAgIGNsb3NlZEJ5Q2hpbGRyZW46IFsncmInLCAncnQnLCAncnRjJywgJ3JwJ10sXG4gICAgICAgIGNsb3NlZEJ5UGFyZW50OiB0cnVlLFxuICAgICAgfSksXG4gICAgICAncnQnOiBuZXcgSHRtbFRhZ0RlZmluaXRpb24oe1xuICAgICAgICBjbG9zZWRCeUNoaWxkcmVuOiBbJ3JiJywgJ3J0JywgJ3J0YycsICdycCddLFxuICAgICAgICBjbG9zZWRCeVBhcmVudDogdHJ1ZSxcbiAgICAgIH0pLFxuICAgICAgJ3J0Yyc6IG5ldyBIdG1sVGFnRGVmaW5pdGlvbih7Y2xvc2VkQnlDaGlsZHJlbjogWydyYicsICdydGMnLCAncnAnXSwgY2xvc2VkQnlQYXJlbnQ6IHRydWV9KSxcbiAgICAgICdycCc6IG5ldyBIdG1sVGFnRGVmaW5pdGlvbih7XG4gICAgICAgIGNsb3NlZEJ5Q2hpbGRyZW46IFsncmInLCAncnQnLCAncnRjJywgJ3JwJ10sXG4gICAgICAgIGNsb3NlZEJ5UGFyZW50OiB0cnVlLFxuICAgICAgfSksXG4gICAgICAnb3B0Z3JvdXAnOiBuZXcgSHRtbFRhZ0RlZmluaXRpb24oe2Nsb3NlZEJ5Q2hpbGRyZW46IFsnb3B0Z3JvdXAnXSwgY2xvc2VkQnlQYXJlbnQ6IHRydWV9KSxcbiAgICAgICdvcHRpb24nOiBuZXcgSHRtbFRhZ0RlZmluaXRpb24oe1xuICAgICAgICBjbG9zZWRCeUNoaWxkcmVuOiBbJ29wdGlvbicsICdvcHRncm91cCddLFxuICAgICAgICBjbG9zZWRCeVBhcmVudDogdHJ1ZSxcbiAgICAgIH0pLFxuICAgICAgJ3ByZSc6IG5ldyBIdG1sVGFnRGVmaW5pdGlvbih7aWdub3JlRmlyc3RMZjogdHJ1ZX0pLFxuICAgICAgJ2xpc3RpbmcnOiBuZXcgSHRtbFRhZ0RlZmluaXRpb24oe2lnbm9yZUZpcnN0TGY6IHRydWV9KSxcbiAgICAgICdzdHlsZSc6IG5ldyBIdG1sVGFnRGVmaW5pdGlvbih7Y29udGVudFR5cGU6IFRhZ0NvbnRlbnRUeXBlLlJBV19URVhUfSksXG4gICAgICAnc2NyaXB0JzogbmV3IEh0bWxUYWdEZWZpbml0aW9uKHtjb250ZW50VHlwZTogVGFnQ29udGVudFR5cGUuUkFXX1RFWFR9KSxcbiAgICAgICd0aXRsZSc6IG5ldyBIdG1sVGFnRGVmaW5pdGlvbih7XG4gICAgICAgIC8vIFRoZSBicm93c2VyIHN1cHBvcnRzIHR3byBzZXBhcmF0ZSBgdGl0bGVgIHRhZ3Mgd2hpY2ggaGF2ZSB0byB1c2VcbiAgICAgICAgLy8gYSBkaWZmZXJlbnQgY29udGVudCB0eXBlOiBgSFRNTFRpdGxlRWxlbWVudGAgYW5kIGBTVkdUaXRsZUVsZW1lbnRgXG4gICAgICAgIGNvbnRlbnRUeXBlOiB7XG4gICAgICAgICAgZGVmYXVsdDogVGFnQ29udGVudFR5cGUuRVNDQVBBQkxFX1JBV19URVhULFxuICAgICAgICAgIHN2ZzogVGFnQ29udGVudFR5cGUuUEFSU0FCTEVfREFUQSxcbiAgICAgICAgfSxcbiAgICAgIH0pLFxuICAgICAgJ3RleHRhcmVhJzogbmV3IEh0bWxUYWdEZWZpbml0aW9uKHtcbiAgICAgICAgY29udGVudFR5cGU6IFRhZ0NvbnRlbnRUeXBlLkVTQ0FQQUJMRV9SQVdfVEVYVCxcbiAgICAgICAgaWdub3JlRmlyc3RMZjogdHJ1ZSxcbiAgICAgIH0pLFxuICAgIH0pO1xuXG4gICAgbmV3IERvbUVsZW1lbnRTY2hlbWFSZWdpc3RyeSgpLmFsbEtub3duRWxlbWVudE5hbWVzKCkuZm9yRWFjaCgoa25vd25UYWdOYW1lKSA9PiB7XG4gICAgICBpZiAoIVRBR19ERUZJTklUSU9OU1trbm93blRhZ05hbWVdICYmIGdldE5zUHJlZml4KGtub3duVGFnTmFtZSkgPT09IG51bGwpIHtcbiAgICAgICAgVEFHX0RFRklOSVRJT05TW2tub3duVGFnTmFtZV0gPSBuZXcgSHRtbFRhZ0RlZmluaXRpb24oe2NhblNlbGZDbG9zZTogZmFsc2V9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuICAvLyBXZSBoYXZlIHRvIG1ha2UgYm90aCBhIGNhc2Utc2Vuc2l0aXZlIGFuZCBhIGNhc2UtaW5zZW5zaXRpdmUgbG9va3VwLCBiZWNhdXNlXG4gIC8vIEhUTUwgdGFnIG5hbWVzIGFyZSBjYXNlIGluc2Vuc2l0aXZlLCB3aGVyZWFzIHNvbWUgU1ZHIHRhZ3MgYXJlIGNhc2Ugc2Vuc2l0aXZlLlxuICByZXR1cm4gKFxuICAgIFRBR19ERUZJTklUSU9OU1t0YWdOYW1lXSA/PyBUQUdfREVGSU5JVElPTlNbdGFnTmFtZS50b0xvd2VyQ2FzZSgpXSA/PyBERUZBVUxUX1RBR19ERUZJTklUSU9OXG4gICk7XG59XG4iXX0=