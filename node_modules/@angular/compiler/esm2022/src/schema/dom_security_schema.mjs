/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tX3NlY3VyaXR5X3NjaGVtYS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9zY2hlbWEvZG9tX3NlY3VyaXR5X3NjaGVtYS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sU0FBUyxDQUFDO0FBRXhDLG9HQUFvRztBQUNwRyxvR0FBb0c7QUFDcEcsb0dBQW9HO0FBQ3BHLG9HQUFvRztBQUNwRyxvR0FBb0c7QUFDcEcsRUFBRTtBQUNGLDJGQUEyRjtBQUMzRixrRUFBa0U7QUFDbEUsRUFBRTtBQUNGLG9HQUFvRztBQUVwRyxpR0FBaUc7QUFDakcsSUFBSSxnQkFBaUQsQ0FBQztBQUV0RCxNQUFNLFVBQVUsZUFBZTtJQUM3QixJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUN0QixnQkFBZ0IsR0FBRyxFQUFFLENBQUM7UUFDdEIsMkZBQTJGO1FBRTNGLGVBQWUsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLENBQUMsZUFBZSxFQUFFLGFBQWEsRUFBRSxhQUFhLENBQUMsQ0FBQyxDQUFDO1FBQ3ZGLGVBQWUsQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztRQUNwRCx3RkFBd0Y7UUFDeEYsZUFBZSxDQUFDLGVBQWUsQ0FBQyxHQUFHLEVBQUU7WUFDbkMsY0FBYztZQUNkLFdBQVc7WUFDWCxXQUFXO1lBQ1gsV0FBVztZQUNYLFFBQVE7WUFDUixRQUFRO1lBQ1IsaUJBQWlCO1lBQ2pCLGlCQUFpQjtZQUNqQixVQUFVO1lBQ1YsYUFBYTtZQUNiLFNBQVM7WUFDVCxXQUFXO1lBQ1gsVUFBVTtZQUNWLFFBQVE7WUFDUixZQUFZO1lBQ1osV0FBVztZQUNYLGNBQWM7WUFDZCxXQUFXO1NBQ1osQ0FBQyxDQUFDO1FBQ0gsZUFBZSxDQUFDLGVBQWUsQ0FBQyxZQUFZLEVBQUU7WUFDNUMsYUFBYTtZQUNiLGlCQUFpQjtZQUNqQixXQUFXO1lBQ1gsV0FBVztZQUNYLFdBQVc7WUFDWCxjQUFjO1lBQ2QsZUFBZTtZQUNmLFlBQVk7WUFDWixXQUFXO1lBQ1gsV0FBVztZQUNYLGlCQUFpQjtZQUNqQixhQUFhO1lBQ2IsWUFBWTtTQUNiLENBQUMsQ0FBQztJQUNMLENBQUM7SUFDRCxPQUFPLGdCQUFnQixDQUFDO0FBQzFCLENBQUM7QUFFRCxTQUFTLGVBQWUsQ0FBQyxHQUFvQixFQUFFLEtBQWU7SUFDNUQsS0FBSyxNQUFNLElBQUksSUFBSSxLQUFLO1FBQUUsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQ3ZFLENBQUM7QUFFRDs7Ozs7Ozs7R0FRRztBQUNILE1BQU0sQ0FBQyxNQUFNLCtCQUErQixHQUFHLElBQUksR0FBRyxDQUFDO0lBQ3JELFNBQVM7SUFDVCxPQUFPO0lBQ1AsaUJBQWlCO0lBQ2pCLGdCQUFnQjtJQUNoQixLQUFLO0lBQ0wsZUFBZTtDQUNoQixDQUFDLENBQUM7QUFFSDs7O0dBR0c7QUFDSCxNQUFNLFVBQVUsNkJBQTZCLENBQUMsUUFBZ0I7SUFDNUQsNEVBQTRFO0lBQzVFLG9FQUFvRTtJQUNwRSxPQUFPLCtCQUErQixDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztBQUNyRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1NlY3VyaXR5Q29udGV4dH0gZnJvbSAnLi4vY29yZSc7XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vID09PT09PT09PT09IFMgVCBPIFAgICAtICBTIFQgTyBQICAgLSAgUyBUIE8gUCAgIC0gIFMgVCBPIFAgICAtICBTIFQgTyBQICAgLSAgUyBUIE8gUCAgPT09PT09PT09PT1cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vXG4vLyAgICAgICAgRE8gTk9UIEVESVQgVEhJUyBMSVNUIE9GIFNFQ1VSSVRZIFNFTlNJVElWRSBQUk9QRVJUSUVTIFdJVEhPVVQgQSBTRUNVUklUWSBSRVZJRVchXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWFjaCBvdXQgdG8gbXByb2JzdCBmb3IgZGV0YWlscy5cbi8vXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbi8qKiBNYXAgZnJvbSB0YWdOYW1lfHByb3BlcnR5TmFtZSB0byBTZWN1cml0eUNvbnRleHQuIFByb3BlcnRpZXMgYXBwbHlpbmcgdG8gYWxsIHRhZ3MgdXNlICcqJy4gKi9cbmxldCBfU0VDVVJJVFlfU0NIRU1BIToge1trOiBzdHJpbmddOiBTZWN1cml0eUNvbnRleHR9O1xuXG5leHBvcnQgZnVuY3Rpb24gU0VDVVJJVFlfU0NIRU1BKCk6IHtbazogc3RyaW5nXTogU2VjdXJpdHlDb250ZXh0fSB7XG4gIGlmICghX1NFQ1VSSVRZX1NDSEVNQSkge1xuICAgIF9TRUNVUklUWV9TQ0hFTUEgPSB7fTtcbiAgICAvLyBDYXNlIGlzIGluc2lnbmlmaWNhbnQgYmVsb3csIGFsbCBlbGVtZW50IGFuZCBhdHRyaWJ1dGUgbmFtZXMgYXJlIGxvd2VyLWNhc2VkIGZvciBsb29rdXAuXG5cbiAgICByZWdpc3RlckNvbnRleHQoU2VjdXJpdHlDb250ZXh0LkhUTUwsIFsnaWZyYW1lfHNyY2RvYycsICcqfGlubmVySFRNTCcsICcqfG91dGVySFRNTCddKTtcbiAgICByZWdpc3RlckNvbnRleHQoU2VjdXJpdHlDb250ZXh0LlNUWUxFLCBbJyp8c3R5bGUnXSk7XG4gICAgLy8gTkI6IG5vIFNDUklQVCBjb250ZXh0cyBoZXJlLCB0aGV5IGFyZSBuZXZlciBhbGxvd2VkIGR1ZSB0byB0aGUgcGFyc2VyIHN0cmlwcGluZyB0aGVtLlxuICAgIHJlZ2lzdGVyQ29udGV4dChTZWN1cml0eUNvbnRleHQuVVJMLCBbXG4gICAgICAnKnxmb3JtQWN0aW9uJyxcbiAgICAgICdhcmVhfGhyZWYnLFxuICAgICAgJ2FyZWF8cGluZycsXG4gICAgICAnYXVkaW98c3JjJyxcbiAgICAgICdhfGhyZWYnLFxuICAgICAgJ2F8cGluZycsXG4gICAgICAnYmxvY2txdW90ZXxjaXRlJyxcbiAgICAgICdib2R5fGJhY2tncm91bmQnLFxuICAgICAgJ2RlbHxjaXRlJyxcbiAgICAgICdmb3JtfGFjdGlvbicsXG4gICAgICAnaW1nfHNyYycsXG4gICAgICAnaW5wdXR8c3JjJyxcbiAgICAgICdpbnN8Y2l0ZScsXG4gICAgICAncXxjaXRlJyxcbiAgICAgICdzb3VyY2V8c3JjJyxcbiAgICAgICd0cmFja3xzcmMnLFxuICAgICAgJ3ZpZGVvfHBvc3RlcicsXG4gICAgICAndmlkZW98c3JjJyxcbiAgICBdKTtcbiAgICByZWdpc3RlckNvbnRleHQoU2VjdXJpdHlDb250ZXh0LlJFU09VUkNFX1VSTCwgW1xuICAgICAgJ2FwcGxldHxjb2RlJyxcbiAgICAgICdhcHBsZXR8Y29kZWJhc2UnLFxuICAgICAgJ2Jhc2V8aHJlZicsXG4gICAgICAnZW1iZWR8c3JjJyxcbiAgICAgICdmcmFtZXxzcmMnLFxuICAgICAgJ2hlYWR8cHJvZmlsZScsXG4gICAgICAnaHRtbHxtYW5pZmVzdCcsXG4gICAgICAnaWZyYW1lfHNyYycsXG4gICAgICAnbGlua3xocmVmJyxcbiAgICAgICdtZWRpYXxzcmMnLFxuICAgICAgJ29iamVjdHxjb2RlYmFzZScsXG4gICAgICAnb2JqZWN0fGRhdGEnLFxuICAgICAgJ3NjcmlwdHxzcmMnLFxuICAgIF0pO1xuICB9XG4gIHJldHVybiBfU0VDVVJJVFlfU0NIRU1BO1xufVxuXG5mdW5jdGlvbiByZWdpc3RlckNvbnRleHQoY3R4OiBTZWN1cml0eUNvbnRleHQsIHNwZWNzOiBzdHJpbmdbXSkge1xuICBmb3IgKGNvbnN0IHNwZWMgb2Ygc3BlY3MpIF9TRUNVUklUWV9TQ0hFTUFbc3BlYy50b0xvd2VyQ2FzZSgpXSA9IGN0eDtcbn1cblxuLyoqXG4gKiBUaGUgc2V0IG9mIHNlY3VyaXR5LXNlbnNpdGl2ZSBhdHRyaWJ1dGVzIG9mIGFuIGA8aWZyYW1lPmAgdGhhdCAqbXVzdCogYmVcbiAqIGFwcGxpZWQgYXMgYSBzdGF0aWMgYXR0cmlidXRlIG9ubHkuIFRoaXMgZW5zdXJlcyB0aGF0IGFsbCBzZWN1cml0eS1zZW5zaXRpdmVcbiAqIGF0dHJpYnV0ZXMgYXJlIHRha2VuIGludG8gYWNjb3VudCB3aGlsZSBjcmVhdGluZyBhbiBpbnN0YW5jZSBvZiBhbiBgPGlmcmFtZT5gXG4gKiBhdCBydW50aW1lLlxuICpcbiAqIE5vdGU6IGF2b2lkIHVzaW5nIHRoaXMgc2V0IGRpcmVjdGx5LCB1c2UgdGhlIGBpc0lmcmFtZVNlY3VyaXR5U2Vuc2l0aXZlQXR0cmAgZnVuY3Rpb25cbiAqIGluIHRoZSBjb2RlIGluc3RlYWQuXG4gKi9cbmV4cG9ydCBjb25zdCBJRlJBTUVfU0VDVVJJVFlfU0VOU0lUSVZFX0FUVFJTID0gbmV3IFNldChbXG4gICdzYW5kYm94JyxcbiAgJ2FsbG93JyxcbiAgJ2FsbG93ZnVsbHNjcmVlbicsXG4gICdyZWZlcnJlcnBvbGljeScsXG4gICdjc3AnLFxuICAnZmV0Y2hwcmlvcml0eScsXG5dKTtcblxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciBhIGdpdmVuIGF0dHJpYnV0ZSBuYW1lIG1pZ2h0IHJlcHJlc2VudCBhIHNlY3VyaXR5LXNlbnNpdGl2ZVxuICogYXR0cmlidXRlIG9mIGFuIDxpZnJhbWU+LlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNJZnJhbWVTZWN1cml0eVNlbnNpdGl2ZUF0dHIoYXR0ck5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAvLyBUaGUgYHNldEF0dHJpYnV0ZWAgRE9NIEFQSSBpcyBjYXNlLWluc2Vuc2l0aXZlLCBzbyB3ZSBsb3dlcmNhc2UgdGhlIHZhbHVlXG4gIC8vIGJlZm9yZSBjaGVja2luZyBpdCBhZ2FpbnN0IGEga25vd24gc2VjdXJpdHktc2Vuc2l0aXZlIGF0dHJpYnV0ZXMuXG4gIHJldHVybiBJRlJBTUVfU0VDVVJJVFlfU0VOU0lUSVZFX0FUVFJTLmhhcyhhdHRyTmFtZS50b0xvd2VyQ2FzZSgpKTtcbn1cbiJdfQ==