/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { SecurityContext } from '../core';
// =================================================================================================
// =================================================================================================
// =========== S T O P   -  S T O P   -  S T O P   -  S T O P   -  S T O P   -  S T O P  ===========
// =================================================================================================
// =================================================================================================
//
//        DO NOT EDIT THIS LIST OF SECURITY SENSITIVE PROPERTIES WITHOUT A SECURITY REVIEW!
//                               Reach out to mprobst for details.
//
// =================================================================================================
/** Map from tagName|propertyName to SecurityContext. Properties applying to all tags use '*'. */
let _SECURITY_SCHEMA;
export function SECURITY_SCHEMA() {
    if (!_SECURITY_SCHEMA) {
        _SECURITY_SCHEMA = {};
        // Case is insignificant below, all element and attribute names are lower-cased for lookup.
        registerContext(SecurityContext.HTML, ['iframe|srcdoc', '*|innerHTML', '*|outerHTML']);
        registerContext(SecurityContext.STYLE, ['*|style']);
        // NB: no SCRIPT contexts here, they are never allowed due to the parser stripping them.
        registerContext(SecurityContext.URL, [
            '*|formAction',
            'area|href',
            'area|ping',
            'audio|src',
            'a|href',
            'a|ping',
            'blockquote|cite',
            'body|background',
            'del|cite',
            'form|action',
            'img|src',
            'input|src',
            'ins|cite',
            'q|cite',
            'source|src',
            'track|src',
            'video|poster',
            'video|src',
        ]);
        registerContext(SecurityContext.RESOURCE_URL, [
            'applet|code',
            'applet|codebase',
            'base|href',
            'embed|src',
            'frame|src',
            'head|profile',
            'html|manifest',
            'iframe|src',
            'link|href',
            'media|src',
            'object|codebase',
            'object|data',
            'script|src',
        ]);
    }
    return _SECURITY_SCHEMA;
}
function registerContext(ctx, specs) {
    for (const spec of specs)
        _SECURITY_SCHEMA[spec.toLowerCase()] = ctx;
}
/**
 * The set of security-sensitive attributes of an `<iframe>` that *must* be
 * applied as a static attribute only. This ensures that all security-sensitive
 * attributes are taken into account while creating an instance of an `<iframe>`
 * at runtime.
 *
 * Note: avoid using this set directly, use the `isIframeSecuritySensitiveAttr` function
 * in the code instead.
 */
export const IFRAME_SECURITY_SENSITIVE_ATTRS = new Set([
    'sandbox',
    'allow',
    'allowfullscreen',
    'referrerpolicy',
    'csp',
    'fetchpriority',
]);
/**
 * Checks whether a given attribute name might represent a security-sensitive
 * attribute of an <iframe>.
 */
export function isIframeSecuritySensitiveAttr(attrName) {
    // The `setAttribute` DOM API is case-insensitive, so we lowercase the value
    // before checking it against a known security-sensitive attributes.
    return IFRAME_SECURITY_SENSITIVE_ATTRS.has(attrName.toLowerCase());
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tX3NlY3VyaXR5X3NjaGVtYS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9zY2hlbWEvZG9tX3NlY3VyaXR5X3NjaGVtYS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sU0FBUyxDQUFDO0FBRXhDLG9HQUFvRztBQUNwRyxvR0FBb0c7QUFDcEcsb0dBQW9HO0FBQ3BHLG9HQUFvRztBQUNwRyxvR0FBb0c7QUFDcEcsRUFBRTtBQUNGLDJGQUEyRjtBQUMzRixrRUFBa0U7QUFDbEUsRUFBRTtBQUNGLG9HQUFvRztBQUVwRyxpR0FBaUc7QUFDakcsSUFBSSxnQkFBaUQsQ0FBQztBQUV0RCxNQUFNLFVBQVUsZUFBZTtJQUM3QixJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUN0QixnQkFBZ0IsR0FBRyxFQUFFLENBQUM7UUFDdEIsMkZBQTJGO1FBRTNGLGVBQWUsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLENBQUMsZUFBZSxFQUFFLGFBQWEsRUFBRSxhQUFhLENBQUMsQ0FBQyxDQUFDO1FBQ3ZGLGVBQWUsQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztRQUNwRCx3RkFBd0Y7UUFDeEYsZUFBZSxDQUFDLGVBQWUsQ0FBQyxHQUFHLEVBQUU7WUFDbkMsY0FBYztZQUNkLFdBQVc7WUFDWCxXQUFXO1lBQ1gsV0FBVztZQUNYLFFBQVE7WUFDUixRQUFRO1lBQ1IsaUJBQWlCO1lBQ2pCLGlCQUFpQjtZQUNqQixVQUFVO1lBQ1YsYUFBYTtZQUNiLFNBQVM7WUFDVCxXQUFXO1lBQ1gsVUFBVTtZQUNWLFFBQVE7WUFDUixZQUFZO1lBQ1osV0FBVztZQUNYLGNBQWM7WUFDZCxXQUFXO1NBQ1osQ0FBQyxDQUFDO1FBQ0gsZUFBZSxDQUFDLGVBQWUsQ0FBQyxZQUFZLEVBQUU7WUFDNUMsYUFBYTtZQUNiLGlCQUFpQjtZQUNqQixXQUFXO1lBQ1gsV0FBVztZQUNYLFdBQVc7WUFDWCxjQUFjO1lBQ2QsZUFBZTtZQUNmLFlBQVk7WUFDWixXQUFXO1lBQ1gsV0FBVztZQUNYLGlCQUFpQjtZQUNqQixhQUFhO1lBQ2IsWUFBWTtTQUNiLENBQUMsQ0FBQztJQUNMLENBQUM7SUFDRCxPQUFPLGdCQUFnQixDQUFDO0FBQzFCLENBQUM7QUFFRCxTQUFTLGVBQWUsQ0FBQyxHQUFvQixFQUFFLEtBQWU7SUFDNUQsS0FBSyxNQUFNLElBQUksSUFBSSxLQUFLO1FBQUUsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQ3ZFLENBQUM7QUFFRDs7Ozs7Ozs7R0FRRztBQUNILE1BQU0sQ0FBQyxNQUFNLCtCQUErQixHQUFHLElBQUksR0FBRyxDQUFDO0lBQ3JELFNBQVM7SUFDVCxPQUFPO0lBQ1AsaUJBQWlCO0lBQ2pCLGdCQUFnQjtJQUNoQixLQUFLO0lBQ0wsZUFBZTtDQUNoQixDQUFDLENBQUM7QUFFSDs7O0dBR0c7QUFDSCxNQUFNLFVBQVUsNkJBQTZCLENBQUMsUUFBZ0I7SUFDNUQsNEVBQTRFO0lBQzVFLG9FQUFvRTtJQUNwRSxPQUFPLCtCQUErQixDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztBQUNyRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7U2VjdXJpdHlDb250ZXh0fSBmcm9tICcuLi9jb3JlJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gPT09PT09PT09PT0gUyBUIE8gUCAgIC0gIFMgVCBPIFAgICAtICBTIFQgTyBQICAgLSAgUyBUIE8gUCAgIC0gIFMgVCBPIFAgICAtICBTIFQgTyBQICA9PT09PT09PT09PVxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy9cbi8vICAgICAgICBETyBOT1QgRURJVCBUSElTIExJU1QgT0YgU0VDVVJJVFkgU0VOU0lUSVZFIFBST1BFUlRJRVMgV0lUSE9VVCBBIFNFQ1VSSVRZIFJFVklFVyFcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlYWNoIG91dCB0byBtcHJvYnN0IGZvciBkZXRhaWxzLlxuLy9cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuLyoqIE1hcCBmcm9tIHRhZ05hbWV8cHJvcGVydHlOYW1lIHRvIFNlY3VyaXR5Q29udGV4dC4gUHJvcGVydGllcyBhcHBseWluZyB0byBhbGwgdGFncyB1c2UgJyonLiAqL1xubGV0IF9TRUNVUklUWV9TQ0hFTUEhOiB7W2s6IHN0cmluZ106IFNlY3VyaXR5Q29udGV4dH07XG5cbmV4cG9ydCBmdW5jdGlvbiBTRUNVUklUWV9TQ0hFTUEoKToge1trOiBzdHJpbmddOiBTZWN1cml0eUNvbnRleHR9IHtcbiAgaWYgKCFfU0VDVVJJVFlfU0NIRU1BKSB7XG4gICAgX1NFQ1VSSVRZX1NDSEVNQSA9IHt9O1xuICAgIC8vIENhc2UgaXMgaW5zaWduaWZpY2FudCBiZWxvdywgYWxsIGVsZW1lbnQgYW5kIGF0dHJpYnV0ZSBuYW1lcyBhcmUgbG93ZXItY2FzZWQgZm9yIGxvb2t1cC5cblxuICAgIHJlZ2lzdGVyQ29udGV4dChTZWN1cml0eUNvbnRleHQuSFRNTCwgWydpZnJhbWV8c3JjZG9jJywgJyp8aW5uZXJIVE1MJywgJyp8b3V0ZXJIVE1MJ10pO1xuICAgIHJlZ2lzdGVyQ29udGV4dChTZWN1cml0eUNvbnRleHQuU1RZTEUsIFsnKnxzdHlsZSddKTtcbiAgICAvLyBOQjogbm8gU0NSSVBUIGNvbnRleHRzIGhlcmUsIHRoZXkgYXJlIG5ldmVyIGFsbG93ZWQgZHVlIHRvIHRoZSBwYXJzZXIgc3RyaXBwaW5nIHRoZW0uXG4gICAgcmVnaXN0ZXJDb250ZXh0KFNlY3VyaXR5Q29udGV4dC5VUkwsIFtcbiAgICAgICcqfGZvcm1BY3Rpb24nLFxuICAgICAgJ2FyZWF8aHJlZicsXG4gICAgICAnYXJlYXxwaW5nJyxcbiAgICAgICdhdWRpb3xzcmMnLFxuICAgICAgJ2F8aHJlZicsXG4gICAgICAnYXxwaW5nJyxcbiAgICAgICdibG9ja3F1b3RlfGNpdGUnLFxuICAgICAgJ2JvZHl8YmFja2dyb3VuZCcsXG4gICAgICAnZGVsfGNpdGUnLFxuICAgICAgJ2Zvcm18YWN0aW9uJyxcbiAgICAgICdpbWd8c3JjJyxcbiAgICAgICdpbnB1dHxzcmMnLFxuICAgICAgJ2luc3xjaXRlJyxcbiAgICAgICdxfGNpdGUnLFxuICAgICAgJ3NvdXJjZXxzcmMnLFxuICAgICAgJ3RyYWNrfHNyYycsXG4gICAgICAndmlkZW98cG9zdGVyJyxcbiAgICAgICd2aWRlb3xzcmMnLFxuICAgIF0pO1xuICAgIHJlZ2lzdGVyQ29udGV4dChTZWN1cml0eUNvbnRleHQuUkVTT1VSQ0VfVVJMLCBbXG4gICAgICAnYXBwbGV0fGNvZGUnLFxuICAgICAgJ2FwcGxldHxjb2RlYmFzZScsXG4gICAgICAnYmFzZXxocmVmJyxcbiAgICAgICdlbWJlZHxzcmMnLFxuICAgICAgJ2ZyYW1lfHNyYycsXG4gICAgICAnaGVhZHxwcm9maWxlJyxcbiAgICAgICdodG1sfG1hbmlmZXN0JyxcbiAgICAgICdpZnJhbWV8c3JjJyxcbiAgICAgICdsaW5rfGhyZWYnLFxuICAgICAgJ21lZGlhfHNyYycsXG4gICAgICAnb2JqZWN0fGNvZGViYXNlJyxcbiAgICAgICdvYmplY3R8ZGF0YScsXG4gICAgICAnc2NyaXB0fHNyYycsXG4gICAgXSk7XG4gIH1cbiAgcmV0dXJuIF9TRUNVUklUWV9TQ0hFTUE7XG59XG5cbmZ1bmN0aW9uIHJlZ2lzdGVyQ29udGV4dChjdHg6IFNlY3VyaXR5Q29udGV4dCwgc3BlY3M6IHN0cmluZ1tdKSB7XG4gIGZvciAoY29uc3Qgc3BlYyBvZiBzcGVjcykgX1NFQ1VSSVRZX1NDSEVNQVtzcGVjLnRvTG93ZXJDYXNlKCldID0gY3R4O1xufVxuXG4vKipcbiAqIFRoZSBzZXQgb2Ygc2VjdXJpdHktc2Vuc2l0aXZlIGF0dHJpYnV0ZXMgb2YgYW4gYDxpZnJhbWU+YCB0aGF0ICptdXN0KiBiZVxuICogYXBwbGllZCBhcyBhIHN0YXRpYyBhdHRyaWJ1dGUgb25seS4gVGhpcyBlbnN1cmVzIHRoYXQgYWxsIHNlY3VyaXR5LXNlbnNpdGl2ZVxuICogYXR0cmlidXRlcyBhcmUgdGFrZW4gaW50byBhY2NvdW50IHdoaWxlIGNyZWF0aW5nIGFuIGluc3RhbmNlIG9mIGFuIGA8aWZyYW1lPmBcbiAqIGF0IHJ1bnRpbWUuXG4gKlxuICogTm90ZTogYXZvaWQgdXNpbmcgdGhpcyBzZXQgZGlyZWN0bHksIHVzZSB0aGUgYGlzSWZyYW1lU2VjdXJpdHlTZW5zaXRpdmVBdHRyYCBmdW5jdGlvblxuICogaW4gdGhlIGNvZGUgaW5zdGVhZC5cbiAqL1xuZXhwb3J0IGNvbnN0IElGUkFNRV9TRUNVUklUWV9TRU5TSVRJVkVfQVRUUlMgPSBuZXcgU2V0KFtcbiAgJ3NhbmRib3gnLFxuICAnYWxsb3cnLFxuICAnYWxsb3dmdWxsc2NyZWVuJyxcbiAgJ3JlZmVycmVycG9saWN5JyxcbiAgJ2NzcCcsXG4gICdmZXRjaHByaW9yaXR5Jyxcbl0pO1xuXG4vKipcbiAqIENoZWNrcyB3aGV0aGVyIGEgZ2l2ZW4gYXR0cmlidXRlIG5hbWUgbWlnaHQgcmVwcmVzZW50IGEgc2VjdXJpdHktc2Vuc2l0aXZlXG4gKiBhdHRyaWJ1dGUgb2YgYW4gPGlmcmFtZT4uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0lmcmFtZVNlY3VyaXR5U2Vuc2l0aXZlQXR0cihhdHRyTmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIC8vIFRoZSBgc2V0QXR0cmlidXRlYCBET00gQVBJIGlzIGNhc2UtaW5zZW5zaXRpdmUsIHNvIHdlIGxvd2VyY2FzZSB0aGUgdmFsdWVcbiAgLy8gYmVmb3JlIGNoZWNraW5nIGl0IGFnYWluc3QgYSBrbm93biBzZWN1cml0eS1zZW5zaXRpdmUgYXR0cmlidXRlcy5cbiAgcmV0dXJuIElGUkFNRV9TRUNVUklUWV9TRU5TSVRJVkVfQVRUUlMuaGFzKGF0dHJOYW1lLnRvTG93ZXJDYXNlKCkpO1xufVxuIl19