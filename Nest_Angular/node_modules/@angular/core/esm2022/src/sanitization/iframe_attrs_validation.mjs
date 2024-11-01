/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { RuntimeError } from '../errors';
import { getTemplateLocationDetails } from '../render3/instructions/element_validation';
import { RENDERER } from '../render3/interfaces/view';
import { nativeRemoveNode } from '../render3/node_manipulation';
import { getLView, getSelectedTNode } from '../render3/state';
import { getNativeByTNode } from '../render3/util/view_utils';
import { trustedHTMLFromString } from '../util/security/trusted_types';
/**
 * Validation function invoked at runtime for each binding that might potentially
 * represent a security-sensitive attribute of an <iframe>.
 * See `IFRAME_SECURITY_SENSITIVE_ATTRS` in the
 * `packages/compiler/src/schema/dom_security_schema.ts` script for the full list
 * of such attributes.
 *
 * @codeGenApi
 */
export function ɵɵvalidateIframeAttribute(attrValue, tagName, attrName) {
    const lView = getLView();
    const tNode = getSelectedTNode();
    const element = getNativeByTNode(tNode, lView);
    // Restrict any dynamic bindings of security-sensitive attributes/properties
    // on an <iframe> for security reasons.
    if (tNode.type === 2 /* TNodeType.Element */ && tagName.toLowerCase() === 'iframe') {
        const iframe = element;
        // Unset previously applied `src` and `srcdoc` if we come across a situation when
        // a security-sensitive attribute is set later via an attribute/property binding.
        iframe.src = '';
        iframe.srcdoc = trustedHTMLFromString('');
        // Also remove the <iframe> from the document.
        nativeRemoveNode(lView[RENDERER], iframe);
        const errorMessage = ngDevMode &&
            `Angular has detected that the \`${attrName}\` was applied ` +
                `as a binding to an <iframe>${getTemplateLocationDetails(lView)}. ` +
                `For security reasons, the \`${attrName}\` can be set on an <iframe> ` +
                `as a static attribute only. \n` +
                `To fix this, switch the \`${attrName}\` binding to a static attribute ` +
                `in a template or in host bindings section.`;
        throw new RuntimeError(-910 /* RuntimeErrorCode.UNSAFE_IFRAME_ATTRS */, errorMessage);
    }
    return attrValue;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWZyYW1lX2F0dHJzX3ZhbGlkYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9zYW5pdGl6YXRpb24vaWZyYW1lX2F0dHJzX3ZhbGlkYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFlBQVksRUFBbUIsTUFBTSxXQUFXLENBQUM7QUFDekQsT0FBTyxFQUFDLDBCQUEwQixFQUFDLE1BQU0sNENBQTRDLENBQUM7QUFHdEYsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLDRCQUE0QixDQUFDO0FBQ3BELE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLDhCQUE4QixDQUFDO0FBQzlELE9BQU8sRUFBQyxRQUFRLEVBQUUsZ0JBQWdCLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUM1RCxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSw0QkFBNEIsQ0FBQztBQUM1RCxPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSxnQ0FBZ0MsQ0FBQztBQUVyRTs7Ozs7Ozs7R0FRRztBQUNILE1BQU0sVUFBVSx5QkFBeUIsQ0FBQyxTQUFjLEVBQUUsT0FBZSxFQUFFLFFBQWdCO0lBQ3pGLE1BQU0sS0FBSyxHQUFHLFFBQVEsRUFBRSxDQUFDO0lBQ3pCLE1BQU0sS0FBSyxHQUFHLGdCQUFnQixFQUFHLENBQUM7SUFDbEMsTUFBTSxPQUFPLEdBQUcsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBd0IsQ0FBQztJQUV0RSw0RUFBNEU7SUFDNUUsdUNBQXVDO0lBQ3ZDLElBQUksS0FBSyxDQUFDLElBQUksOEJBQXNCLElBQUksT0FBTyxDQUFDLFdBQVcsRUFBRSxLQUFLLFFBQVEsRUFBRSxDQUFDO1FBQzNFLE1BQU0sTUFBTSxHQUFHLE9BQTRCLENBQUM7UUFFNUMsaUZBQWlGO1FBQ2pGLGlGQUFpRjtRQUNqRixNQUFNLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQztRQUNoQixNQUFNLENBQUMsTUFBTSxHQUFHLHFCQUFxQixDQUFDLEVBQUUsQ0FBc0IsQ0FBQztRQUUvRCw4Q0FBOEM7UUFDOUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBRTFDLE1BQU0sWUFBWSxHQUNoQixTQUFTO1lBQ1QsbUNBQW1DLFFBQVEsaUJBQWlCO2dCQUMxRCw4QkFBOEIsMEJBQTBCLENBQUMsS0FBSyxDQUFDLElBQUk7Z0JBQ25FLCtCQUErQixRQUFRLCtCQUErQjtnQkFDdEUsZ0NBQWdDO2dCQUNoQyw2QkFBNkIsUUFBUSxtQ0FBbUM7Z0JBQ3hFLDRDQUE0QyxDQUFDO1FBQ2pELE1BQU0sSUFBSSxZQUFZLGtEQUF1QyxZQUFZLENBQUMsQ0FBQztJQUM3RSxDQUFDO0lBQ0QsT0FBTyxTQUFTLENBQUM7QUFDbkIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtSdW50aW1lRXJyb3IsIFJ1bnRpbWVFcnJvckNvZGV9IGZyb20gJy4uL2Vycm9ycyc7XG5pbXBvcnQge2dldFRlbXBsYXRlTG9jYXRpb25EZXRhaWxzfSBmcm9tICcuLi9yZW5kZXIzL2luc3RydWN0aW9ucy9lbGVtZW50X3ZhbGlkYXRpb24nO1xuaW1wb3J0IHtUTm9kZVR5cGV9IGZyb20gJy4uL3JlbmRlcjMvaW50ZXJmYWNlcy9ub2RlJztcbmltcG9ydCB7UkNvbW1lbnQsIFJFbGVtZW50fSBmcm9tICcuLi9yZW5kZXIzL2ludGVyZmFjZXMvcmVuZGVyZXJfZG9tJztcbmltcG9ydCB7UkVOREVSRVJ9IGZyb20gJy4uL3JlbmRlcjMvaW50ZXJmYWNlcy92aWV3JztcbmltcG9ydCB7bmF0aXZlUmVtb3ZlTm9kZX0gZnJvbSAnLi4vcmVuZGVyMy9ub2RlX21hbmlwdWxhdGlvbic7XG5pbXBvcnQge2dldExWaWV3LCBnZXRTZWxlY3RlZFROb2RlfSBmcm9tICcuLi9yZW5kZXIzL3N0YXRlJztcbmltcG9ydCB7Z2V0TmF0aXZlQnlUTm9kZX0gZnJvbSAnLi4vcmVuZGVyMy91dGlsL3ZpZXdfdXRpbHMnO1xuaW1wb3J0IHt0cnVzdGVkSFRNTEZyb21TdHJpbmd9IGZyb20gJy4uL3V0aWwvc2VjdXJpdHkvdHJ1c3RlZF90eXBlcyc7XG5cbi8qKlxuICogVmFsaWRhdGlvbiBmdW5jdGlvbiBpbnZva2VkIGF0IHJ1bnRpbWUgZm9yIGVhY2ggYmluZGluZyB0aGF0IG1pZ2h0IHBvdGVudGlhbGx5XG4gKiByZXByZXNlbnQgYSBzZWN1cml0eS1zZW5zaXRpdmUgYXR0cmlidXRlIG9mIGFuIDxpZnJhbWU+LlxuICogU2VlIGBJRlJBTUVfU0VDVVJJVFlfU0VOU0lUSVZFX0FUVFJTYCBpbiB0aGVcbiAqIGBwYWNrYWdlcy9jb21waWxlci9zcmMvc2NoZW1hL2RvbV9zZWN1cml0eV9zY2hlbWEudHNgIHNjcmlwdCBmb3IgdGhlIGZ1bGwgbGlzdFxuICogb2Ygc3VjaCBhdHRyaWJ1dGVzLlxuICpcbiAqIEBjb2RlR2VuQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiDJtcm1dmFsaWRhdGVJZnJhbWVBdHRyaWJ1dGUoYXR0clZhbHVlOiBhbnksIHRhZ05hbWU6IHN0cmluZywgYXR0ck5hbWU6IHN0cmluZykge1xuICBjb25zdCBsVmlldyA9IGdldExWaWV3KCk7XG4gIGNvbnN0IHROb2RlID0gZ2V0U2VsZWN0ZWRUTm9kZSgpITtcbiAgY29uc3QgZWxlbWVudCA9IGdldE5hdGl2ZUJ5VE5vZGUodE5vZGUsIGxWaWV3KSBhcyBSRWxlbWVudCB8IFJDb21tZW50O1xuXG4gIC8vIFJlc3RyaWN0IGFueSBkeW5hbWljIGJpbmRpbmdzIG9mIHNlY3VyaXR5LXNlbnNpdGl2ZSBhdHRyaWJ1dGVzL3Byb3BlcnRpZXNcbiAgLy8gb24gYW4gPGlmcmFtZT4gZm9yIHNlY3VyaXR5IHJlYXNvbnMuXG4gIGlmICh0Tm9kZS50eXBlID09PSBUTm9kZVR5cGUuRWxlbWVudCAmJiB0YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdpZnJhbWUnKSB7XG4gICAgY29uc3QgaWZyYW1lID0gZWxlbWVudCBhcyBIVE1MSUZyYW1lRWxlbWVudDtcblxuICAgIC8vIFVuc2V0IHByZXZpb3VzbHkgYXBwbGllZCBgc3JjYCBhbmQgYHNyY2RvY2AgaWYgd2UgY29tZSBhY3Jvc3MgYSBzaXR1YXRpb24gd2hlblxuICAgIC8vIGEgc2VjdXJpdHktc2Vuc2l0aXZlIGF0dHJpYnV0ZSBpcyBzZXQgbGF0ZXIgdmlhIGFuIGF0dHJpYnV0ZS9wcm9wZXJ0eSBiaW5kaW5nLlxuICAgIGlmcmFtZS5zcmMgPSAnJztcbiAgICBpZnJhbWUuc3JjZG9jID0gdHJ1c3RlZEhUTUxGcm9tU3RyaW5nKCcnKSBhcyB1bmtub3duIGFzIHN0cmluZztcblxuICAgIC8vIEFsc28gcmVtb3ZlIHRoZSA8aWZyYW1lPiBmcm9tIHRoZSBkb2N1bWVudC5cbiAgICBuYXRpdmVSZW1vdmVOb2RlKGxWaWV3W1JFTkRFUkVSXSwgaWZyYW1lKTtcblxuICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9XG4gICAgICBuZ0Rldk1vZGUgJiZcbiAgICAgIGBBbmd1bGFyIGhhcyBkZXRlY3RlZCB0aGF0IHRoZSBcXGAke2F0dHJOYW1lfVxcYCB3YXMgYXBwbGllZCBgICtcbiAgICAgICAgYGFzIGEgYmluZGluZyB0byBhbiA8aWZyYW1lPiR7Z2V0VGVtcGxhdGVMb2NhdGlvbkRldGFpbHMobFZpZXcpfS4gYCArXG4gICAgICAgIGBGb3Igc2VjdXJpdHkgcmVhc29ucywgdGhlIFxcYCR7YXR0ck5hbWV9XFxgIGNhbiBiZSBzZXQgb24gYW4gPGlmcmFtZT4gYCArXG4gICAgICAgIGBhcyBhIHN0YXRpYyBhdHRyaWJ1dGUgb25seS4gXFxuYCArXG4gICAgICAgIGBUbyBmaXggdGhpcywgc3dpdGNoIHRoZSBcXGAke2F0dHJOYW1lfVxcYCBiaW5kaW5nIHRvIGEgc3RhdGljIGF0dHJpYnV0ZSBgICtcbiAgICAgICAgYGluIGEgdGVtcGxhdGUgb3IgaW4gaG9zdCBiaW5kaW5ncyBzZWN0aW9uLmA7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihSdW50aW1lRXJyb3JDb2RlLlVOU0FGRV9JRlJBTUVfQVRUUlMsIGVycm9yTWVzc2FnZSk7XG4gIH1cbiAgcmV0dXJuIGF0dHJWYWx1ZTtcbn1cbiJdfQ==