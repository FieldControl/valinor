/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { SecurityContext } from '../../../../core';
import * as o from '../../../../output/output_ast';
import { Identifiers } from '../../../../render3/r3_identifiers';
import { isIframeSecuritySensitiveAttr } from '../../../../schema/dom_security_schema';
import * as ir from '../../ir';
import { CompilationJobKind } from '../compilation';
import { createOpXrefMap } from '../util/elements';
/**
 * Map of security contexts to their sanitizer function.
 */
const sanitizerFns = new Map([
    [SecurityContext.HTML, Identifiers.sanitizeHtml],
    [SecurityContext.RESOURCE_URL, Identifiers.sanitizeResourceUrl],
    [SecurityContext.SCRIPT, Identifiers.sanitizeScript],
    [SecurityContext.STYLE, Identifiers.sanitizeStyle], [SecurityContext.URL, Identifiers.sanitizeUrl]
]);
/**
 * Map of security contexts to their trusted value function.
 */
const trustedValueFns = new Map([
    [SecurityContext.HTML, Identifiers.trustConstantHtml],
    [SecurityContext.RESOURCE_URL, Identifiers.trustConstantResourceUrl],
]);
/**
 * Resolves sanitization functions for ops that need them.
 */
export function resolveSanitizers(job) {
    for (const unit of job.units) {
        const elements = createOpXrefMap(unit);
        // For normal element bindings we create trusted values for security sensitive constant
        // attributes. However, for host bindings we skip this step (this matches what
        // TemplateDefinitionBuilder does).
        // TODO: Is the TDB behavior correct here?
        if (job.kind !== CompilationJobKind.Host) {
            for (const op of unit.create) {
                if (op.kind === ir.OpKind.ExtractedAttribute) {
                    const trustedValueFn = trustedValueFns.get(getOnlySecurityContext(op.securityContext)) ?? null;
                    op.trustedValueFn = trustedValueFn !== null ? o.importExpr(trustedValueFn) : null;
                }
            }
        }
        for (const op of unit.update) {
            switch (op.kind) {
                case ir.OpKind.Property:
                case ir.OpKind.Attribute:
                case ir.OpKind.HostProperty:
                    let sanitizerFn = null;
                    if (Array.isArray(op.securityContext) && op.securityContext.length === 2 &&
                        op.securityContext.indexOf(SecurityContext.URL) > -1 &&
                        op.securityContext.indexOf(SecurityContext.RESOURCE_URL) > -1) {
                        // When the host element isn't known, some URL attributes (such as "src" and "href") may
                        // be part of multiple different security contexts. In this case we use special
                        // sanitization function and select the actual sanitizer at runtime based on a tag name
                        // that is provided while invoking sanitization function.
                        sanitizerFn = Identifiers.sanitizeUrlOrResourceUrl;
                    }
                    else {
                        sanitizerFn = sanitizerFns.get(getOnlySecurityContext(op.securityContext)) ?? null;
                    }
                    op.sanitizer = sanitizerFn !== null ? o.importExpr(sanitizerFn) : null;
                    // If there was no sanitization function found based on the security context of an
                    // attribute/property, check whether this attribute/property is one of the
                    // security-sensitive <iframe> attributes (and that the current element is actually an
                    // <iframe>).
                    if (op.sanitizer === null) {
                        let isIframe = false;
                        if (job.kind === CompilationJobKind.Host || op.kind === ir.OpKind.HostProperty) {
                            // Note: for host bindings defined on a directive, we do not try to find all
                            // possible places where it can be matched, so we can not determine whether
                            // the host element is an <iframe>. In this case, we just assume it is and append a
                            // validation function, which is invoked at runtime and would have access to the
                            // underlying DOM element to check if it's an <iframe> and if so - run extra checks.
                            isIframe = true;
                        }
                        else {
                            // For a normal binding we can just check if the element its on is an iframe.
                            const ownerOp = elements.get(op.target);
                            if (ownerOp === undefined || !ir.isElementOrContainerOp(ownerOp)) {
                                throw Error('Property should have an element-like owner');
                            }
                            isIframe = isIframeElement(ownerOp);
                        }
                        if (isIframe && isIframeSecuritySensitiveAttr(op.name)) {
                            op.sanitizer = o.importExpr(Identifiers.validateIframeAttribute);
                        }
                    }
                    break;
            }
        }
    }
}
/**
 * Checks whether the given op represents an iframe element.
 */
function isIframeElement(op) {
    return op.kind === ir.OpKind.ElementStart && op.tag?.toLowerCase() === 'iframe';
}
/**
 * Asserts that there is only a single security context and returns it.
 */
function getOnlySecurityContext(securityContext) {
    if (Array.isArray(securityContext)) {
        if (securityContext.length > 1) {
            // TODO: What should we do here? TDB just took the first one, but this feels like something we
            // would want to know about and create a special case for like we did for Url/ResourceUrl. My
            // guess is that, outside of the Url/ResourceUrl case, this never actually happens. If there
            // do turn out to be other cases, throwing an error until we can address it feels safer.
            throw Error(`AssertionError: Ambiguous security context`);
        }
        return securityContext[0] || SecurityContext.NONE;
    }
    return securityContext;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb2x2ZV9zYW5pdGl6ZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3RlbXBsYXRlL3BpcGVsaW5lL3NyYy9waGFzZXMvcmVzb2x2ZV9zYW5pdGl6ZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUNqRCxPQUFPLEtBQUssQ0FBQyxNQUFNLCtCQUErQixDQUFDO0FBQ25ELE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxvQ0FBb0MsQ0FBQztBQUMvRCxPQUFPLEVBQUMsNkJBQTZCLEVBQUMsTUFBTSx3Q0FBd0MsQ0FBQztBQUNyRixPQUFPLEtBQUssRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUMvQixPQUFPLEVBQWlCLGtCQUFrQixFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDbEUsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBRWpEOztHQUVHO0FBQ0gsTUFBTSxZQUFZLEdBQUcsSUFBSSxHQUFHLENBQXVDO0lBQ2pFLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsWUFBWSxDQUFDO0lBQ2hELENBQUMsZUFBZSxDQUFDLFlBQVksRUFBRSxXQUFXLENBQUMsbUJBQW1CLENBQUM7SUFDL0QsQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxjQUFjLENBQUM7SUFDcEQsQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFLFdBQVcsQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLGVBQWUsQ0FBQyxHQUFHLEVBQUUsV0FBVyxDQUFDLFdBQVcsQ0FBQztDQUNuRyxDQUFDLENBQUM7QUFFSDs7R0FFRztBQUNILE1BQU0sZUFBZSxHQUFHLElBQUksR0FBRyxDQUF1QztJQUNwRSxDQUFDLGVBQWUsQ0FBQyxJQUFJ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QUN4RixNQUFNLEtBQUssQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDO1FBQzVELENBQUM7UUFDRCxPQUFPLGVBQWUsQ0FBQyxDQUFDLENBQUMsSUFBSSxlQUFlLENBQUMsSUFBSSxDQUFDO0lBQ3BELENBQUM7SUFDRCxPQUFPLGVBQWUsQ0FBQztBQUN6QixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7U2VjdXJpdHlDb250ZXh0fSBmcm9tICcuLi8uLi8uLi8uLi9jb3JlJztcbmltcG9ydCAqIGFzIG8gZnJvbSAnLi4vLi4vLi4vLi4vb3V0cHV0L291dHB1dF9hc3QnO1xuaW1wb3J0IHtJZGVudGlmaWVyc30gZnJvbSAnLi4vLi4vLi4vLi4vcmVuZGVyMy9yM19pZGVudGlmaWVycyc7XG5pbXBvcnQge2lzSWZyYW1lU2VjdXJpdHlTZW5zaXRpdmVBdHRyfSBmcm9tICcuLi8uLi8uLi8uLi9zY2hlbWEvZG9tX3NlY3VyaXR5X3NjaGVtYSc7XG5pbXBvcnQgKiBhcyBpciBmcm9tICcuLi8uLi9pcic7XG5pbXBvcnQge0NvbXBpbGF0aW9uSm9iLCBDb21waWxhdGlvbkpvYktpbmR9IGZyb20gJy4uL2NvbXBpbGF0aW9uJztcbmltcG9ydCB7Y3JlYXRlT3BYcmVmTWFwfSBmcm9tICcuLi91dGlsL2VsZW1lbnRzJztcblxuLyoqXG4gKiBNYXAgb2Ygc2VjdXJpdHkgY29udGV4dHMgdG8gdGhlaXIgc2FuaXRpemVyIGZ1bmN0aW9uLlxuICovXG5jb25zdCBzYW5pdGl6ZXJGbnMgPSBuZXcgTWFwPFNlY3VyaXR5Q29udGV4dCwgby5FeHRlcm5hbFJlZmVyZW5jZT4oW1xuICBbU2VjdXJpdHlDb250ZXh0LkhUTUwsIElkZW50aWZpZXJzLnNhbml0aXplSHRtbF0sXG4gIFtTZWN1cml0eUNvbnRleHQuUkVTT1VSQ0VfVVJMLCBJZGVudGlmaWVycy5zYW5pdGl6ZVJlc291cmNlVXJsXSxcbiAgW1NlY3VyaXR5Q29udGV4dC5TQ1JJUFQsIElkZW50aWZpZXJzLnNhbml0aXplU2NyaXB0XSxcbiAgW1NlY3VyaXR5Q29udGV4dC5TVFlMRSwgSWRlbnRpZmllcnMuc2FuaXRpemVTdHlsZV0sIFtTZWN1cml0eUNvbnRleHQuVVJMLCBJZGVudGlmaWVycy5zYW5pdGl6ZVVybF1cbl0pO1xuXG4vKipcbiAqIE1hcCBvZiBzZWN1cml0eSBjb250ZXh0cyB0byB0aGVpciB0cnVzdGVkIHZhbHVlIGZ1bmN0aW9uLlxuICovXG5jb25zdCB0cnVzdGVkVmFsdWVGbnMgPSBuZXcgTWFwPFNlY3VyaXR5Q29udGV4dCwgby5FeHRlcm5hbFJlZmVyZW5jZT4oW1xuICBbU2VjdXJpdHlDb250ZXh0LkhUTUwsIElkZW50aWZpZXJzLnRydXN0Q29uc3RhbnRIdG1sXSxcbiAgW1NlY3VyaXR5Q29udGV4dC5SRVNPVVJDRV9VUkwsIElkZW50aWZpZXJzLnRydXN0Q29uc3RhbnRSZXNvdXJjZVVybF0sXG5dKTtcblxuLyoqXG4gKiBSZXNvbHZlcyBzYW5pdGl6YXRpb24gZnVuY3Rpb25zIGZvciBvcHMgdGhhdCBuZWVkIHRoZW0uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlU2FuaXRpemVycyhqb2I6IENvbXBpbGF0aW9uSm9iKTogdm9pZCB7XG4gIGZvciAoY29uc3QgdW5pdCBvZiBqb2IudW5pdHMpIHtcbiAgICBjb25zdCBlbGVtZW50cyA9IGNyZWF0ZU9wWHJlZk1hcCh1bml0KTtcblxuICAgIC8vIEZvciBub3JtYWwgZWxlbWVudCBiaW5kaW5ncyB3ZSBjcmVhdGUgdHJ1c3RlZCB2YWx1ZXMgZm9yIHNlY3VyaXR5IHNlbnNpdGl2ZSBjb25zdGFudFxuICAgIC8vIGF0dHJpYnV0ZXMuIEhvd2V2ZXIsIGZvciBob3N0IGJpbmRpbmdzIHdlIHNraXAgdGhpcyBzdGVwICh0aGlzIG1hdGNoZXMgd2hhdFxuICAgIC8vIFRlbXBsYXRlRGVmaW5pdGlvbkJ1aWxkZXIgZG9lcykuXG4gICAgLy8gVE9ETzogSXMgdGhlIFREQiBiZWhhdmlvciBjb3JyZWN0IGhlcmU/XG4gICAgaWYgKGpvYi5raW5kICE9PSBDb21waWxhdGlvbkpvYktpbmQuSG9zdCkge1xuICAgICAgZm9yIChjb25zdCBvcCBvZiB1bml0LmNyZWF0ZSkge1xuICAgICAgICBpZiAob3Aua2luZCA9PT0gaXIuT3BLaW5kLkV4dHJhY3RlZEF0dHJpYnV0ZSkge1xuICAgICAgICAgIGNvbnN0IHRydXN0ZWRWYWx1ZUZuID1cbiAgICAgICAgICAgICAgdHJ1c3RlZFZhbHVlRm5zLmdldChnZXRPbmx5U2VjdXJpdHlDb250ZXh0KG9wLnNlY3VyaXR5Q29udGV4dCkpID8/IG51bGw7XG4gICAgICAgICAgb3AudHJ1c3RlZFZhbHVlRm4gPSB0cnVzdGVkVmFsdWVGbiAhPT0gbnVsbCA/IG8uaW1wb3J0RXhwcih0cnVzdGVkVmFsdWVGbikgOiBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBvcCBvZiB1bml0LnVwZGF0ZSkge1xuICAgICAgc3dpdGNoIChvcC5raW5kKSB7XG4gICAgICAgIGNhc2UgaXIuT3BLaW5kLlByb3BlcnR5OlxuICAgICAgICBjYXNlIGlyLk9wS2luZC5BdHRyaWJ1dGU6XG4gICAgICAgIGNhc2UgaXIuT3BLaW5kLkhvc3RQcm9wZXJ0eTpcbiAgICAgICAgICBsZXQgc2FuaXRpemVyRm46IG8uRXh0ZXJuYWxSZWZlcmVuY2V8bnVsbCA9IG51bGw7XG4gICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkob3Auc2VjdXJpdHlDb250ZXh0KSAmJiBvcC5zZWN1cml0eUNvbnRleHQubGVuZ3RoID09PSAyICYmXG4gICAgICAgICAgICAgIG9wLnNlY3VyaXR5Q29udGV4dC5pbmRleE9mKFNlY3VyaXR5Q29udGV4dC5VUkwpID4gLTEgJiZcbiAgICAgICAgICAgICAgb3Auc2VjdXJpdHlDb250ZXh0LmluZGV4T2YoU2VjdXJpdHlDb250ZXh0LlJFU09VUkNFX1VSTCkgPiAtMSkge1xuICAgICAgICAgICAgLy8gV2hlbiB0aGUgaG9zdCBlbGVtZW50IGlzbid0IGtub3duLCBzb21lIFVSTCBhdHRyaWJ1dGVzIChzdWNoIGFzIFwic3JjXCIgYW5kIFwiaHJlZlwiKSBtYXlcbiAgICAgICAgICAgIC8vIGJlIHBhcnQgb2YgbXVsdGlwbGUgZGlmZmVyZW50IHNlY3VyaXR5IGNvbnRleHRzLiBJbiB0aGlzIGNhc2Ugd2UgdXNlIHNwZWNpYWxcbiAgICAgICAgICAgIC8vIHNhbml0aXphdGlvbiBmdW5jdGlvbiBhbmQgc2VsZWN0IHRoZSBhY3R1YWwgc2FuaXRpemVyIGF0IHJ1bnRpbWUgYmFzZWQgb24gYSB0YWcgbmFtZVxuICAgICAgICAgICAgLy8gdGhhdCBpcyBwcm92aWRlZCB3aGlsZSBpbnZva2luZyBzYW5pdGl6YXRpb24gZnVuY3Rpb24uXG4gICAgICAgICAgICBzYW5pdGl6ZXJGbiA9IElkZW50aWZpZXJzLnNhbml0aXplVXJsT3JSZXNvdXJjZVVybDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2FuaXRpemVyRm4gPSBzYW5pdGl6ZXJGbnMuZ2V0KGdldE9ubHlTZWN1cml0eUNvbnRleHQob3Auc2VjdXJpdHlDb250ZXh0KSkgPz8gbnVsbDtcbiAgICAgICAgICB9XG4gICAgICAgICAgb3Auc2FuaXRpemVyID0gc2FuaXRpemVyRm4gIT09IG51bGwgPyBvLmltcG9ydEV4cHIoc2FuaXRpemVyRm4pIDogbnVsbDtcblxuICAgICAgICAgIC8vIElmIHRoZXJlIHdhcyBubyBzYW5pdGl6YXRpb24gZnVuY3Rpb24gZm91bmQgYmFzZWQgb24gdGhlIHNlY3VyaXR5IGNvbnRleHQgb2YgYW5cbiAgICAgICAgICAvLyBhdHRyaWJ1dGUvcHJvcGVydHksIGNoZWNrIHdoZXRoZXIgdGhpcyBhdHRyaWJ1dGUvcHJvcGVydHkgaXMgb25lIG9mIHRoZVxuICAgICAgICAgIC8vIHNlY3VyaXR5LXNlbnNpdGl2ZSA8aWZyYW1lPiBhdHRyaWJ1dGVzIChhbmQgdGhhdCB0aGUgY3VycmVudCBlbGVtZW50IGlzIGFjdHVhbGx5IGFuXG4gICAgICAgICAgLy8gPGlmcmFtZT4pLlxuICAgICAgICAgIGlmIChvcC5zYW5pdGl6ZXIgPT09IG51bGwpIHtcbiAgICAgICAgICAgIGxldCBpc0lmcmFtZSA9IGZhbHNlO1xuICAgICAgICAgICAgaWYgKGpvYi5raW5kID09PSBDb21waWxhdGlvbkpvYktpbmQuSG9zdCB8fCBvcC5raW5kID09PSBpci5PcEtpbmQuSG9zdFByb3BlcnR5KSB7XG4gICAgICAgICAgICAgIC8vIE5vdGU6IGZvciBob3N0IGJpbmRpbmdzIGRlZmluZWQgb24gYSBkaXJlY3RpdmUsIHdlIGRvIG5vdCB0cnkgdG8gZmluZCBhbGxcbiAgICAgICAgICAgICAgLy8gcG9zc2libGUgcGxhY2VzIHdoZXJlIGl0IGNhbiBiZSBtYXRjaGVkLCBzbyB3ZSBjYW4gbm90IGRldGVybWluZSB3aGV0aGVyXG4gICAgICAgICAgICAgIC8vIHRoZSBob3N0IGVsZW1lbnQgaXMgYW4gPGlmcmFtZT4uIEluIHRoaXMgY2FzZSwgd2UganVzdCBhc3N1bWUgaXQgaXMgYW5kIGFwcGVuZCBhXG4gICAgICAgICAgICAgIC8vIHZhbGlkYXRpb24gZnVuY3Rpb24sIHdoaWNoIGlzIGludm9rZWQgYXQgcnVudGltZSBhbmQgd291bGQgaGF2ZSBhY2Nlc3MgdG8gdGhlXG4gICAgICAgICAgICAgIC8vIHVuZGVybHlpbmcgRE9NIGVsZW1lbnQgdG8gY2hlY2sgaWYgaXQncyBhbiA8aWZyYW1lPiBhbmQgaWYgc28gLSBydW4gZXh0cmEgY2hlY2tzLlxuICAgICAgICAgICAgICBpc0lmcmFtZSA9IHRydWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBGb3IgYSBub3JtYWwgYmluZGluZyB3ZSBjYW4ganVzdCBjaGVjayBpZiB0aGUgZWxlbWVudCBpdHMgb24gaXMgYW4gaWZyYW1lLlxuICAgICAgICAgICAgICBjb25zdCBvd25lck9wID0gZWxlbWVudHMuZ2V0KG9wLnRhcmdldCk7XG4gICAgICAgICAgICAgIGlmIChvd25lck9wID09PSB1bmRlZmluZWQgfHwgIWlyLmlzRWxlbWVudE9yQ29udGFpbmVyT3Aob3duZXJPcCkpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBFcnJvcignUHJvcGVydHkgc2hvdWxkIGhhdmUgYW4gZWxlbWVudC1saWtlIG93bmVyJyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaXNJZnJhbWUgPSBpc0lmcmFtZUVsZW1lbnQob3duZXJPcCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaXNJZnJhbWUgJiYgaXNJZnJhbWVTZWN1cml0eVNlbnNpdGl2ZUF0dHIob3AubmFtZSkpIHtcbiAgICAgICAgICAgICAgb3Auc2FuaXRpemVyID0gby5pbXBvcnRFeHByKElkZW50aWZpZXJzLnZhbGlkYXRlSWZyYW1lQXR0cmlidXRlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgdGhlIGdpdmVuIG9wIHJlcHJlc2VudHMgYW4gaWZyYW1lIGVsZW1lbnQuXG4gKi9cbmZ1bmN0aW9uIGlzSWZyYW1lRWxlbWVudChvcDogaXIuRWxlbWVudE9yQ29udGFpbmVyT3BzKTogYm9vbGVhbiB7XG4gIHJldHVybiBvcC5raW5kID09PSBpci5PcEtpbmQuRWxlbWVudFN0YXJ0ICYmIG9wLnRhZz8udG9Mb3dlckNhc2UoKSA9PT0gJ2lmcmFtZSc7XG59XG5cbi8qKlxuICogQXNzZXJ0cyB0aGF0IHRoZXJlIGlzIG9ubHkgYSBzaW5nbGUgc2VjdXJpdHkgY29udGV4dCBhbmQgcmV0dXJucyBpdC5cbiAqL1xuZnVuY3Rpb24gZ2V0T25seVNlY3VyaXR5Q29udGV4dChzZWN1cml0eUNvbnRleHQ6IFNlY3VyaXR5Q29udGV4dHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2VjdXJpdHlDb250ZXh0W10pOiBTZWN1cml0eUNvbnRleHQge1xuICBpZiAoQXJyYXkuaXNBcnJheShzZWN1cml0eUNvbnRleHQpKSB7XG4gICAgaWYgKHNlY3VyaXR5Q29udGV4dC5sZW5ndGggPiAxKSB7XG4gICAgICAvLyBUT0RPOiBXaGF0IHNob3VsZCB3ZSBkbyBoZXJlPyBUREIganVzdCB0b29rIHRoZSBmaXJzdCBvbmUsIGJ1dCB0aGlzIGZlZWxzIGxpa2Ugc29tZXRoaW5nIHdlXG4gICAgICAvLyB3b3VsZCB3YW50IHRvIGtub3cgYWJvdXQgYW5kIGNyZWF0ZSBhIHNwZWNpYWwgY2FzZSBmb3IgbGlrZSB3ZSBkaWQgZm9yIFVybC9SZXNvdXJjZVVybC4gTXlcbiAgICAgIC8vIGd1ZXNzIGlzIHRoYXQsIG91dHNpZGUgb2YgdGhlIFVybC9SZXNvdXJjZVVybCBjYXNlLCB0aGlzIG5ldmVyIGFjdHVhbGx5IGhhcHBlbnMuIElmIHRoZXJlXG4gICAgICAvLyBkbyB0dXJuIG91dCB0byBiZSBvdGhlciBjYXNlcywgdGhyb3dpbmcgYW4gZXJyb3IgdW50aWwgd2UgY2FuIGFkZHJlc3MgaXQgZmVlbHMgc2FmZXIuXG4gICAgICB0aHJvdyBFcnJvcihgQXNzZXJ0aW9uRXJyb3I6IEFtYmlndW91cyBzZWN1cml0eSBjb250ZXh0YCk7XG4gICAgfVxuICAgIHJldHVybiBzZWN1cml0eUNvbnRleHRbMF0gfHwgU2VjdXJpdHlDb250ZXh0Lk5PTkU7XG4gIH1cbiAgcmV0dXJuIHNlY3VyaXR5Q29udGV4dDtcbn1cbiJdfQ==