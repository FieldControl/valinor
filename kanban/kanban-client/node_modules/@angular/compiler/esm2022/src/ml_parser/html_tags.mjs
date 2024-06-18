/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHRtbF90YWdzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL21sX3BhcnNlci9odG1sX3RhZ3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLHdCQUF3QixFQUFDLE1BQU0sdUNBQXVDLENBQUM7QUFFL0UsT0FBTyxFQUFDLFdBQVcsRUFBRSxjQUFjLEVBQWdCLE1BQU0sUUFBUSxDQUFDO0FBRWxFLE1BQU0sT0FBTyxpQkFBaUI7SUFhNUIsWUFBWSxFQUNWLGdCQUFnQixFQUNoQix1QkFBdUIsRUFDdkIsV0FBVyxHQUFHLGNBQWMsQ0FBQyxhQUFhLEVBQzFDLGNBQWMsR0FBRyxLQUFLLEVBQ3RCLE1BQU0sR0FBRyxLQUFLLEVBQ2QsYUFBYSxHQUFHLEtBQUssRUFDckIsMkJBQTJCLEdBQUcsS0FBSyxFQUNuQyxZQUFZLEdBQUcsS0FBSyxNQVVsQixFQUFFO1FBOUJFLHFCQUFnQixHQUE2QixFQUFFLENBQUM7UUFLeEQsbUJBQWMsR0FBRyxLQUFLLENBQUM7UUEwQnJCLElBQUksZ0JBQWdCLElBQUksZ0JBQWdCLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQ3BELGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNqRixDQUFDO1FBQ0QsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxDQUFDLGNBQWMsR0FBRyxjQUFjLElBQUksTUFBTSxDQUFDO1FBQy9DLElBQUksQ0FBQyx1QkFBdUIsR0FBRyx1QkFBdUIsSUFBSSxJQUFJLENBQUM7UUFDL0QsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7UUFDL0IsSUFBSSxDQUFDLGFB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QUF3QixFQUFFLENBQUMsb0JBQW9CLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxZQUFZLEVBQUUsRUFBRTtZQUM3RSxJQUFJLENBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQyxJQUFJLFdBQVcsQ0FBQyxZQUFZLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQztnQkFDekUsZUFBZSxDQUFDLFlBQVksQ0FBQyxHQUFHLElBQUksaUJBQWlCLENBQUMsRUFBQyxZQUFZLEVBQUUsS0FBSyxFQUFDLENBQUMsQ0FBQztZQUMvRSxDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBQ0QsK0VBQStFO0lBQy9FLGlGQUFpRjtJQUNqRixPQUFPLENBQ0wsZUFBZSxDQUFDLE9BQU8sQ0FBQyxJQUFJLGVBQWUsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLENBQUMsSUFBSSxzQkFBc0IsQ0FDN0YsQ0FBQztBQUNKLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtEb21FbGVtZW50U2NoZW1hUmVnaXN0cnl9IGZyb20gJy4uL3NjaGVtYS9kb21fZWxlbWVudF9zY2hlbWFfcmVnaXN0cnknO1xuXG5pbXBvcnQge2dldE5zUHJlZml4LCBUYWdDb250ZW50VHlwZSwgVGFnRGVmaW5pdGlvbn0gZnJvbSAnLi90YWdzJztcblxuZXhwb3J0IGNsYXNzIEh0bWxUYWdEZWZpbml0aW9uIGltcGxlbWVudHMgVGFnRGVmaW5pdGlvbiB7XG4gIHByaXZhdGUgY2xvc2VkQnlDaGlsZHJlbjoge1trZXk6IHN0cmluZ106IGJvb2xlYW59ID0ge307XG4gIHByaXZhdGUgY29udGVudFR5cGU6XG4gICAgfCBUYWdDb250ZW50VHlwZVxuICAgIHwge2RlZmF1bHQ6IFRhZ0NvbnRlbnRUeXBlOyBbbmFtZXNwYWNlOiBzdHJpbmddOiBUYWdDb250ZW50VHlwZX07XG5cbiAgY2xvc2VkQnlQYXJlbnQgPSBmYWxzZTtcbiAgaW1wbGljaXROYW1lc3BhY2VQcmVmaXg6IHN0cmluZyB8IG51bGw7XG4gIGlzVm9pZDogYm9vbGVhbjtcbiAgaWdub3JlRmlyc3RMZjogYm9vbGVhbjtcbiAgY2FuU2VsZkNsb3NlOiBib29sZWFuO1xuICBwcmV2ZW50TmFtZXNwYWNlSW5oZXJpdGFuY2U6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3Ioe1xuICAgIGNsb3NlZEJ5Q2hpbGRyZW4sXG4gICAgaW1wbGljaXROYW1lc3BhY2VQcmVmaXgsXG4gICAgY29udGVudFR5cGUgPSBUYWdDb250ZW50VHlwZS5QQVJTQUJMRV9EQVRBLFxuICAgIGNsb3NlZEJ5UGFyZW50ID0gZmFsc2UsXG4gICAgaXNWb2lkID0gZmFsc2UsXG4gICAgaWdub3JlRmlyc3RMZiA9IGZhbHNlLFxuICAgIHByZXZlbnROYW1lc3BhY2VJbmhlcml0YW5jZSA9IGZhbHNlLFxuICAgIGNhblNlbGZDbG9zZSA9IGZhbHNlLFxuICB9OiB7XG4gICAgY2xvc2VkQnlDaGlsZHJlbj86IHN0cmluZ1tdO1xuICAgIGNsb3NlZEJ5UGFyZW50PzogYm9vbGVhbjtcbiAgICBpbXBsaWNpdE5hbWVzcGFjZVByZWZpeD86IHN0cmluZztcbiAgICBjb250ZW50VHlwZT86IFRhZ0NvbnRlbnRUeXBlIHwge2RlZmF1bHQ6IFRhZ0NvbnRlbnRUeXBlOyBbbmFtZXNwYWNlOiBzdHJpbmddOiBUYWdDb250ZW50VHlwZX07XG4gICAgaXNWb2lkPzogYm9vbGVhbjtcbiAgICBpZ25vcmVGaXJzdExmPzogYm9vbGVhbjtcbiAgICBwcmV2ZW50TmFtZXNwYWNlSW5oZXJpdGFuY2U/OiBib29sZWFuO1xuICAgIGNhblNlbGZDbG9zZT86IGJvb2xlYW47XG4gIH0gPSB7fSkge1xuICAgIGlmIChjbG9zZWRCeUNoaWxkcmVuICYmIGNsb3NlZEJ5Q2hpbGRyZW4ubGVuZ3RoID4gMCkge1xuICAgICAgY2xvc2VkQnlDaGlsZHJlbi5mb3JFYWNoKCh0YWdOYW1lKSA9PiAodGhpcy5jbG9zZWRCeUNoaWxkcmVuW3RhZ05hbWVdID0gdHJ1ZSkpO1xuICAgIH1cbiAgICB0aGlzLmlzVm9pZCA9IGlzVm9pZDtcbiAgICB0aGlzLmNsb3NlZEJ5UGFyZW50ID0gY2xvc2VkQnlQYXJlbnQgfHwgaXNWb2lkO1xuICAgIHRoaXMuaW1wbGljaXROYW1lc3BhY2VQcmVmaXggPSBpbXBsaWNpdE5hbWVzcGFjZVByZWZpeCB8fCBudWxsO1xuICAgIHRoaXMuY29udGVudFR5cGUgPSBjb250ZW50VHlwZTtcbiAgICB0aGlzLmlnbm9yZUZpcnN0TGYgPSBpZ25vcmVGaXJzdExmO1xuICAgIHRoaXMucHJldmVudE5hbWVzcGFjZUluaGVyaXRhbmNlID0gcHJldmVudE5hbWVzcGFjZUluaGVyaXRhbmNlO1xuICAgIHRoaXMuY2FuU2VsZkNsb3NlID0gY2FuU2VsZkNsb3NlID8/IGlzVm9pZDtcbiAgfVxuXG4gIGlzQ2xvc2VkQnlDaGlsZChuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5pc1ZvaWQgfHwgbmFtZS50b0xvd2VyQ2FzZSgpIGluIHRoaXMuY2xvc2VkQnlDaGlsZHJlbjtcbiAgfVxuXG4gIGdldENvbnRlbnRUeXBlKHByZWZpeD86IHN0cmluZyk6IFRhZ0NvbnRlbnRUeXBlIHtcbiAgICBpZiAodHlwZW9mIHRoaXMuY29udGVudFR5cGUgPT09ICdvYmplY3QnKSB7XG4gICAgICBjb25zdCBvdmVycmlkZVR5cGUgPSBwcmVmaXggPT09IHVuZGVmaW5lZCA/IHVuZGVmaW5lZCA6IHRoaXMuY29udGVudFR5cGVbcHJlZml4XTtcbiAgICAgIHJldHVybiBvdmVycmlkZVR5cGUgPz8gdGhpcy5jb250ZW50VHlwZS5kZWZhdWx0O1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5jb250ZW50VHlwZTtcbiAgfVxufVxuXG5sZXQgREVGQVVMVF9UQUdfREVGSU5JVElPTiE6IEh0bWxUYWdEZWZpbml0aW9uO1xuXG4vLyBzZWUgaHR0cHM6Ly93d3cudzMub3JnL1RSL2h0bWw1MS9zeW50YXguaHRtbCNvcHRpb25hbC10YWdzXG4vLyBUaGlzIGltcGxlbWVudGF0aW9uIGRvZXMgbm90IGZ1bGx5IGNvbmZvcm0gdG8gdGhlIEhUTUw1IHNwZWMuXG5sZXQgVEFHX0RFRklOSVRJT05TIToge1trZXk6IHN0cmluZ106IEh0bWxUYWdEZWZpbml0aW9ufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldEh0bWxUYWdEZWZpbml0aW9uKHRhZ05hbWU6IHN0cmluZyk6IEh0bWxUYWdEZWZpbml0aW9uIHtcbiAgaWYgKCFUQUdfREVGSU5JVElPTlMpIHtcbiAgICBERUZBVUxUX1RBR19ERUZJTklUSU9OID0gbmV3IEh0bWxUYWdEZWZpbml0aW9uKHtjYW5TZWxmQ2xvc2U6IHRydWV9KTtcbiAgICBUQUdfREVGSU5JVElPTlMgPSBPYmplY3QuYXNzaWduKE9iamVjdC5jcmVhdGUobnVsbCksIHtcbiAgICAgICdiYXNlJzogbmV3IEh0bWxUYWdEZWZpbml0aW9uKHtpc1ZvaWQ6IHRydWV9KSxcbiAgICAgICdtZXRhJzogbmV3IEh0bWxUYWdEZWZpbml0aW9uKHtpc1ZvaWQ6IHRydWV9KSxcbiAgICAgICdhcmVhJzogbmV3IEh0bWxUYWdEZWZpbml0aW9uKHtpc1ZvaWQ6IHRydWV9KSxcbiAgICAgICdlbWJlZCc6IG5ldyBIdG1sVGFnRGVmaW5pdGlvbih7aXNWb2lkOiB0cnVlfSksXG4gICAgICAnbGluayc6IG5ldyBIdG1sVGFnRGVmaW5pdGlvbih7aXNWb2lkOiB0cnVlfSksXG4gICAgICAnaW1nJzogbmV3IEh0bWxUYWdEZWZpbml0aW9uKHtpc1ZvaWQ6IHRydWV9KSxcbiAgICAgICdpbnB1dCc6IG5ldyBIdG1sVGFnRGVmaW5pdGlvbih7aXNWb2lkOiB0cnVlfSksXG4gICAgICAncGFyYW0nOiBuZXcgSHRtbFRhZ0RlZmluaXRpb24oe2lzVm9pZDogdHJ1ZX0pLFxuICAgICAgJ2hyJzogbmV3IEh0bWxUYWdEZWZpbml0aW9uKHtpc1ZvaWQ6IHRydWV9KSxcbiAgICAgICdicic6IG5ldyBIdG1sVGFnRGVmaW5pdGlvbih7aXNWb2lkOiB0cnVlfSksXG4gICAgICAnc291cmNlJzogbmV3IEh0bWxUYWdEZWZpbml0aW9uKHtpc1ZvaWQ6IHRydWV9KSxcbiAgICAgICd0cmFjayc6IG5ldyBIdG1sVGFnRGVmaW5pdGlvbih7aXNWb2lkOiB0cnVlfSksXG4gICAgICAnd2JyJzogbmV3IEh0bWxUYWdEZWZpbml0aW9uKHtpc1ZvaWQ6IHRydWV9KSxcbiAgICAgICdwJzogbmV3IEh0bWxUYWdEZWZpbml0aW9uKHtcbiAgICAgICAgY2xvc2VkQnlDaGlsZHJlbjogW1xuICAgICAgICAgICdhZGRyZXNzJyxcbiAgICAgICAgICAnYXJ0aWNsZScsXG4gICAgICAgICAgJ2FzaWRlJyxcbiAgICAgICAgICAnYmxvY2txdW90ZScsXG4gICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgJ2RsJyxcbiAgICAgICAgICAnZmllbGRzZXQnLFxuICAgICAgICAgICdmb290ZXInLFxuICAgICAgICAgICdmb3JtJyxcbiAgICAgICAgICAnaDEnLFxuICAgICAgICAgICdoMicsXG4gICAgICAgICAgJ2gzJyxcbiAgICAgICAgICAnaDQnLFxuICAgICAgICAgICdoNScsXG4gICAgICAgICAgJ2g2JyxcbiAgICAgICAgICAnaGVhZGVyJyxcbiAgICAgICAgICAnaGdyb3VwJyxcbiAgICAgICAgICAnaHInLFxuICAgICAgICAgICdtYWluJyxcbiAgICAgICAgICAnbmF2JyxcbiAgICAgICAgICAnb2wnLFxuICAgICAgICAgICdwJyxcbiAgICAgICAgICAncHJlJyxcbiAgICAgICAgICAnc2VjdGlvbicsXG4gICAgICAgICAgJ3RhYmxlJyxcbiAgICAgICAgICAndWwnLFxuICAgICAgICBdLFxuICAgICAgICBjbG9zZWRCeVBhcmVudDogdHJ1ZSxcbiAgICAgIH0pLFxuICAgICAgJ3RoZWFkJzogbmV3IEh0bWxUYWdEZWZpbml0aW9uKHtjbG9zZWRCeUNoaWxkcmVuOiBbJ3Rib2R5JywgJ3Rmb290J119KSxcbiAgICAgICd0Ym9keSc6IG5ldyBIdG1sVGFnRGVmaW5pdGlvbih7Y2xvc2VkQnlDaGlsZHJlbjogWyd0Ym9keScsICd0Zm9vdCddLCBjbG9zZWRCeVBhcmVudDogdHJ1ZX0pLFxuICAgICAgJ3Rmb290JzogbmV3IEh0bWxUYWdEZWZpbml0aW9uKHtjbG9zZWRCeUNoaWxkcmVuOiBbJ3Rib2R5J10sIGNsb3NlZEJ5UGFyZW50OiB0cnVlfSksXG4gICAgICAndHInOiBuZXcgSHRtbFRhZ0RlZmluaXRpb24oe2Nsb3NlZEJ5Q2hpbGRyZW46IFsndHInXSwgY2xvc2VkQnlQYXJlbnQ6IHRydWV9KSxcbiAgICAgICd0ZCc6IG5ldyBIdG1sVGFnRGVmaW5pdGlvbih7Y2xvc2VkQnlDaGlsZHJlbjogWyd0ZCcsICd0aCddLCBjbG9zZWRCeVBhcmVudDogdHJ1ZX0pLFxuICAgICAgJ3RoJzogbmV3IEh0bWxUYWdEZWZpbml0aW9uKHtjbG9zZWRCeUNoaWxkcmVuOiBbJ3RkJywgJ3RoJ10sIGNsb3NlZEJ5UGFyZW50OiB0cnVlfSksXG4gICAgICAnY29sJzogbmV3IEh0bWxUYWdEZWZpbml0aW9uKHtpc1ZvaWQ6IHRydWV9KSxcbiAgICAgICdzdmcnOiBuZXcgSHRtbFRhZ0RlZmluaXRpb24oe2ltcGxpY2l0TmFtZXNwYWNlUHJlZml4OiAnc3ZnJ30pLFxuICAgICAgJ2ZvcmVpZ25PYmplY3QnOiBuZXcgSHRtbFRhZ0RlZmluaXRpb24oe1xuICAgICAgICAvLyBVc3VhbGx5IHRoZSBpbXBsaWNpdCBuYW1lc3BhY2UgaGVyZSB3b3VsZCBiZSByZWR1bmRhbnQgc2luY2UgaXQgd2lsbCBiZSBpbmhlcml0ZWQgZnJvbVxuICAgICAgICAvLyB0aGUgcGFyZW50IGBzdmdgLCBidXQgd2UgaGF2ZSB0byBkbyBpdCBmb3IgYGZvcmVpZ25PYmplY3RgLCBiZWNhdXNlIHRoZSB3YXkgdGhlIHBhcnNlclxuICAgICAgICAvLyB3b3JrcyBpcyB0aGF0IHRoZSBwYXJlbnQgbm9kZSBvZiBhbiBlbmQgdGFnIGlzIGl0cyBvd24gc3RhcnQgdGFnIHdoaWNoIG1lYW5zIHRoYXRcbiAgICAgICAgLy8gdGhlIGBwcmV2ZW50TmFtZXNwYWNlSW5oZXJpdGFuY2VgIG9uIGBmb3JlaWduT2JqZWN0YCB3b3VsZCBoYXZlIGl0IGRlZmF1bHQgdG8gdGhlXG4gICAgICAgIC8vIGltcGxpY2l0IG5hbWVzcGFjZSB3aGljaCBpcyBgaHRtbGAsIHVubGVzcyBzcGVjaWZpZWQgb3RoZXJ3aXNlLlxuICAgICAgICBpbXBsaWNpdE5hbWVzcGFjZVByZWZpeDogJ3N2ZycsXG4gICAgICAgIC8vIFdlIHdhbnQgdG8gcHJldmVudCBjaGlsZHJlbiBvZiBmb3JlaWduT2JqZWN0IGZyb20gaW5oZXJpdGluZyBpdHMgbmFtZXNwYWNlLCBiZWNhdXNlXG4gICAgICAgIC8vIHRoZSBwb2ludCBvZiB0aGUgZWxlbWVudCBpcyB0byBhbGxvdyBub2RlcyBmcm9tIG90aGVyIG5hbWVzcGFjZXMgdG8gYmUgaW5zZXJ0ZWQuXG4gICAgICAgIHByZXZlbnROYW1lc3BhY2VJbmhlcml0YW5jZTogdHJ1ZSxcbiAgICAgIH0pLFxuICAgICAgJ21hdGgnOiBuZXcgSHRtbFRhZ0RlZmluaXRpb24oe2ltcGxpY2l0TmFtZXNwYWNlUHJlZml4OiAnbWF0aCd9KSxcbiAgICAgICdsaSc6IG5ldyBIdG1sVGFnRGVmaW5pdGlvbih7Y2xvc2VkQnlDaGlsZHJlbjogWydsaSddLCBjbG9zZWRCeVBhcmVudDogdHJ1ZX0pLFxuICAgICAgJ2R0JzogbmV3IEh0bWxUYWdEZWZpbml0aW9uKHtjbG9zZWRCeUNoaWxkcmVuOiBbJ2R0JywgJ2RkJ119KSxcbiAgICAgICdkZCc6IG5ldyBIdG1sVGFnRGVmaW5pdGlvbih7Y2xvc2VkQnlDaGlsZHJlbjogWydkdCcsICdkZCddLCBjbG9zZWRCeVBhcmVudDogdHJ1ZX0pLFxuICAgICAgJ3JiJzogbmV3IEh0bWxUYWdEZWZpbml0aW9uKHtcbiAgICAgICAgY2xvc2VkQnlDaGlsZHJlbjogWydyYicsICdydCcsICdydGMnLCAncnAnXSxcbiAgICAgICAgY2xvc2VkQnlQYXJlbnQ6IHRydWUsXG4gICAgICB9KSxcbiAgICAgICdydCc6IG5ldyBIdG1sVGFnRGVmaW5pdGlvbih7XG4gICAgICAgIGNsb3NlZEJ5Q2hpbGRyZW46IFsncmInLCAncnQnLCAncnRjJywgJ3JwJ10sXG4gICAgICAgIGNsb3NlZEJ5UGFyZW50OiB0cnVlLFxuICAgICAgfSksXG4gICAgICAncnRjJzogbmV3IEh0bWxUYWdEZWZpbml0aW9uKHtjbG9zZWRCeUNoaWxkcmVuOiBbJ3JiJywgJ3J0YycsICdycCddLCBjbG9zZWRCeVBhcmVudDogdHJ1ZX0pLFxuICAgICAgJ3JwJzogbmV3IEh0bWxUYWdEZWZpbml0aW9uKHtcbiAgICAgICAgY2xvc2VkQnlDaGlsZHJlbjogWydyYicsICdydCcsICdydGMnLCAncnAnXSxcbiAgICAgICAgY2xvc2VkQnlQYXJlbnQ6IHRydWUsXG4gICAgICB9KSxcbiAgICAgICdvcHRncm91cCc6IG5ldyBIdG1sVGFnRGVmaW5pdGlvbih7Y2xvc2VkQnlDaGlsZHJlbjogWydvcHRncm91cCddLCBjbG9zZWRCeVBhcmVudDogdHJ1ZX0pLFxuICAgICAgJ29wdGlvbic6IG5ldyBIdG1sVGFnRGVmaW5pdGlvbih7XG4gICAgICAgIGNsb3NlZEJ5Q2hpbGRyZW46IFsnb3B0aW9uJywgJ29wdGdyb3VwJ10sXG4gICAgICAgIGNsb3NlZEJ5UGFyZW50OiB0cnVlLFxuICAgICAgfSksXG4gICAgICAncHJlJzogbmV3IEh0bWxUYWdEZWZpbml0aW9uKHtpZ25vcmVGaXJzdExmOiB0cnVlfSksXG4gICAgICAnbGlzdGluZyc6IG5ldyBIdG1sVGFnRGVmaW5pdGlvbih7aWdub3JlRmlyc3RMZjogdHJ1ZX0pLFxuICAgICAgJ3N0eWxlJzogbmV3IEh0bWxUYWdEZWZpbml0aW9uKHtjb250ZW50VHlwZTogVGFnQ29udGVudFR5cGUuUkFXX1RFWFR9KSxcbiAgICAgICdzY3JpcHQnOiBuZXcgSHRtbFRhZ0RlZmluaXRpb24oe2NvbnRlbnRUeXBlOiBUYWdDb250ZW50VHlwZS5SQVdfVEVYVH0pLFxuICAgICAgJ3RpdGxlJzogbmV3IEh0bWxUYWdEZWZpbml0aW9uKHtcbiAgICAgICAgLy8gVGhlIGJyb3dzZXIgc3VwcG9ydHMgdHdvIHNlcGFyYXRlIGB0aXRsZWAgdGFncyB3aGljaCBoYXZlIHRvIHVzZVxuICAgICAgICAvLyBhIGRpZmZlcmVudCBjb250ZW50IHR5cGU6IGBIVE1MVGl0bGVFbGVtZW50YCBhbmQgYFNWR1RpdGxlRWxlbWVudGBcbiAgICAgICAgY29udGVudFR5cGU6IHtcbiAgICAgICAgICBkZWZhdWx0OiBUYWdDb250ZW50VHlwZS5FU0NBUEFCTEVfUkFXX1RFWFQsXG4gICAgICAgICAgc3ZnOiBUYWdDb250ZW50VHlwZS5QQVJTQUJMRV9EQVRBLFxuICAgICAgICB9LFxuICAgICAgfSksXG4gICAgICAndGV4dGFyZWEnOiBuZXcgSHRtbFRhZ0RlZmluaXRpb24oe1xuICAgICAgICBjb250ZW50VHlwZTogVGFnQ29udGVudFR5cGUuRVNDQVBBQkxFX1JBV19URVhULFxuICAgICAgICBpZ25vcmVGaXJzdExmOiB0cnVlLFxuICAgICAgfSksXG4gICAgfSk7XG5cbiAgICBuZXcgRG9tRWxlbWVudFNjaGVtYVJlZ2lzdHJ5KCkuYWxsS25vd25FbGVtZW50TmFtZXMoKS5mb3JFYWNoKChrbm93blRhZ05hbWUpID0+IHtcbiAgICAgIGlmICghVEFHX0RFRklOSVRJT05TW2tub3duVGFnTmFtZV0gJiYgZ2V0TnNQcmVmaXgoa25vd25UYWdOYW1lKSA9PT0gbnVsbCkge1xuICAgICAgICBUQUdfREVGSU5JVElPTlNba25vd25UYWdOYW1lXSA9IG5ldyBIdG1sVGFnRGVmaW5pdGlvbih7Y2FuU2VsZkNsb3NlOiBmYWxzZX0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIC8vIFdlIGhhdmUgdG8gbWFrZSBib3RoIGEgY2FzZS1zZW5zaXRpdmUgYW5kIGEgY2FzZS1pbnNlbnNpdGl2ZSBsb29rdXAsIGJlY2F1c2VcbiAgLy8gSFRNTCB0YWcgbmFtZXMgYXJlIGNhc2UgaW5zZW5zaXRpdmUsIHdoZXJlYXMgc29tZSBTVkcgdGFncyBhcmUgY2FzZSBzZW5zaXRpdmUuXG4gIHJldHVybiAoXG4gICAgVEFHX0RFRklOSVRJT05TW3RhZ05hbWVdID8/IFRBR19ERUZJTklUSU9OU1t0YWdOYW1lLnRvTG93ZXJDYXNlKCldID8/IERFRkFVTFRfVEFHX0RFRklOSVRJT05cbiAgKTtcbn1cbiJdfQ==