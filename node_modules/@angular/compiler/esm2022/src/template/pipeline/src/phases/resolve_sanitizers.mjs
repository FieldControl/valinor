/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
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
    [SecurityContext.STYLE, Identifiers.sanitizeStyle],
    [SecurityContext.URL, Identifiers.sanitizeUrl],
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
                    if (Array.isArray(op.securityContext) &&
                        op.securityContext.length === 2 &&
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb2x2ZV9zYW5pdGl6ZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3RlbXBsYXRlL3BpcGVsaW5lL3NyYy9waGFzZXMvcmVzb2x2ZV9zYW5pdGl6ZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUNqRCxPQUFPLEtBQUssQ0FBQyxNQUFNLCtCQUErQixDQUFDO0FBQ25ELE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxvQ0FBb0MsQ0FBQztBQUMvRCxPQUFPLEVBQUMsNkJBQTZCLEVBQUMsTUFBTSx3Q0FBd0MsQ0FBQztBQUNyRixPQUFPLEtBQUssRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUMvQixPQUFPLEVBQWlCLGtCQUFrQixFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDbEUsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBRWpEOztHQUVHO0FBQ0gsTUFBTSxZQUFZLEdBQUcsSUFBSSxHQUFHLENBQXVDO0lBQ2pFLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsWUFBWSxDQUFDO0lBQ2hELENBQUMsZUFBZSxDQUFDLFlBQVksRUFBRSxXQUFXLENBQUMsbUJBQW1CLENBQUM7SUFDL0QsQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxjQUFjLENBQUM7SUFDcEQsQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFLFdBQVcsQ0FBQyxhQUFhLENBQUM7SUFDbEQsQ0FBQyxlQUFlLENBQUMsR0FBRyxFQUFFLFdBQVcsQ0FBQyxXQUFXLENBQUM7Q0FDL0MsQ0FBQyxDQUFDO0FBRUg7O0dBRUc7QUFDSCxNQUFNLGVBQWUsR0FBRyxJQUFJLEdBQUcsQ0FBdUM7SUFDcEUsQ0FBQyxlQUFlLENBQUMsSUFB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d0Y7WUFDeEYsTUFBTSxLQUFLLENBQUMsNENBQTRDLENBQUMsQ0FBQztRQUM1RCxDQUFDO1FBQ0QsT0FBTyxlQUFlLENBQUMsQ0FBQyxDQUFDLElBQUksZUFBZSxDQUFDLElBQUksQ0FBQztJQUNwRCxDQUFDO0lBQ0QsT0FBTyxlQUFlLENBQUM7QUFDekIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtTZWN1cml0eUNvbnRleHR9IGZyb20gJy4uLy4uLy4uLy4uL2NvcmUnO1xuaW1wb3J0ICogYXMgbyBmcm9tICcuLi8uLi8uLi8uLi9vdXRwdXQvb3V0cHV0X2FzdCc7XG5pbXBvcnQge0lkZW50aWZpZXJzfSBmcm9tICcuLi8uLi8uLi8uLi9yZW5kZXIzL3IzX2lkZW50aWZpZXJzJztcbmltcG9ydCB7aXNJZnJhbWVTZWN1cml0eVNlbnNpdGl2ZUF0dHJ9IGZyb20gJy4uLy4uLy4uLy4uL3NjaGVtYS9kb21fc2VjdXJpdHlfc2NoZW1hJztcbmltcG9ydCAqIGFzIGlyIGZyb20gJy4uLy4uL2lyJztcbmltcG9ydCB7Q29tcGlsYXRpb25Kb2IsIENvbXBpbGF0aW9uSm9iS2luZH0gZnJvbSAnLi4vY29tcGlsYXRpb24nO1xuaW1wb3J0IHtjcmVhdGVPcFhyZWZNYXB9IGZyb20gJy4uL3V0aWwvZWxlbWVudHMnO1xuXG4vKipcbiAqIE1hcCBvZiBzZWN1cml0eSBjb250ZXh0cyB0byB0aGVpciBzYW5pdGl6ZXIgZnVuY3Rpb24uXG4gKi9cbmNvbnN0IHNhbml0aXplckZucyA9IG5ldyBNYXA8U2VjdXJpdHlDb250ZXh0LCBvLkV4dGVybmFsUmVmZXJlbmNlPihbXG4gIFtTZWN1cml0eUNvbnRleHQuSFRNTCwgSWRlbnRpZmllcnMuc2FuaXRpemVIdG1sXSxcbiAgW1NlY3VyaXR5Q29udGV4dC5SRVNPVVJDRV9VUkwsIElkZW50aWZpZXJzLnNhbml0aXplUmVzb3VyY2VVcmxdLFxuICBbU2VjdXJpdHlDb250ZXh0LlNDUklQVCwgSWRlbnRpZmllcnMuc2FuaXRpemVTY3JpcHRdLFxuICBbU2VjdXJpdHlDb250ZXh0LlNUWUxFLCBJZGVudGlmaWVycy5zYW5pdGl6ZVN0eWxlXSxcbiAgW1NlY3VyaXR5Q29udGV4dC5VUkwsIElkZW50aWZpZXJzLnNhbml0aXplVXJsXSxcbl0pO1xuXG4vKipcbiAqIE1hcCBvZiBzZWN1cml0eSBjb250ZXh0cyB0byB0aGVpciB0cnVzdGVkIHZhbHVlIGZ1bmN0aW9uLlxuICovXG5jb25zdCB0cnVzdGVkVmFsdWVGbnMgPSBuZXcgTWFwPFNlY3VyaXR5Q29udGV4dCwgby5FeHRlcm5hbFJlZmVyZW5jZT4oW1xuICBbU2VjdXJpdHlDb250ZXh0LkhUTUwsIElkZW50aWZpZXJzLnRydXN0Q29uc3RhbnRIdG1sXSxcbiAgW1NlY3VyaXR5Q29udGV4dC5SRVNPVVJDRV9VUkwsIElkZW50aWZpZXJzLnRydXN0Q29uc3RhbnRSZXNvdXJjZVVybF0sXG5dKTtcblxuLyoqXG4gKiBSZXNvbHZlcyBzYW5pdGl6YXRpb24gZnVuY3Rpb25zIGZvciBvcHMgdGhhdCBuZWVkIHRoZW0uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlU2FuaXRpemVycyhqb2I6IENvbXBpbGF0aW9uSm9iKTogdm9pZCB7XG4gIGZvciAoY29uc3QgdW5pdCBvZiBqb2IudW5pdHMpIHtcbiAgICBjb25zdCBlbGVtZW50cyA9IGNyZWF0ZU9wWHJlZk1hcCh1bml0KTtcblxuICAgIC8vIEZvciBub3JtYWwgZWxlbWVudCBiaW5kaW5ncyB3ZSBjcmVhdGUgdHJ1c3RlZCB2YWx1ZXMgZm9yIHNlY3VyaXR5IHNlbnNpdGl2ZSBjb25zdGFudFxuICAgIC8vIGF0dHJpYnV0ZXMuIEhvd2V2ZXIsIGZvciBob3N0IGJpbmRpbmdzIHdlIHNraXAgdGhpcyBzdGVwICh0aGlzIG1hdGNoZXMgd2hhdFxuICAgIC8vIFRlbXBsYXRlRGVmaW5pdGlvbkJ1aWxkZXIgZG9lcykuXG4gICAgLy8gVE9ETzogSXMgdGhlIFREQiBiZWhhdmlvciBjb3JyZWN0IGhlcmU/XG4gICAgaWYgKGpvYi5raW5kICE9PSBDb21waWxhdGlvbkpvYktpbmQuSG9zdCkge1xuICAgICAgZm9yIChjb25zdCBvcCBvZiB1bml0LmNyZWF0ZSkge1xuICAgICAgICBpZiAob3Aua2luZCA9PT0gaXIuT3BLaW5kLkV4dHJhY3RlZEF0dHJpYnV0ZSkge1xuICAgICAgICAgIGNvbnN0IHRydXN0ZWRWYWx1ZUZuID1cbiAgICAgICAgICAgIHRydXN0ZWRWYWx1ZUZucy5nZXQoZ2V0T25seVNlY3VyaXR5Q29udGV4dChvcC5zZWN1cml0eUNvbnRleHQpKSA/PyBudWxsO1xuICAgICAgICAgIG9wLnRydXN0ZWRWYWx1ZUZuID0gdHJ1c3RlZFZhbHVlRm4gIT09IG51bGwgPyBvLmltcG9ydEV4cHIodHJ1c3RlZFZhbHVlRm4pIDogbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAoY29uc3Qgb3Agb2YgdW5pdC51cGRhdGUpIHtcbiAgICAgIHN3aXRjaCAob3Aua2luZCkge1xuICAgICAgICBjYXNlIGlyLk9wS2luZC5Qcm9wZXJ0eTpcbiAgICAgICAgY2FzZSBpci5PcEtpbmQuQXR0cmlidXRlOlxuICAgICAgICBjYXNlIGlyLk9wS2luZC5Ib3N0UHJvcGVydHk6XG4gICAgICAgICAgbGV0IHNhbml0aXplckZuOiBvLkV4dGVybmFsUmVmZXJlbmNlIHwgbnVsbCA9IG51bGw7XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgQXJyYXkuaXNBcnJheShvcC5zZWN1cml0eUNvbnRleHQpICYmXG4gICAgICAgICAgICBvcC5zZWN1cml0eUNvbnRleHQubGVuZ3RoID09PSAyICYmXG4gICAgICAgICAgICBvcC5zZWN1cml0eUNvbnRleHQuaW5kZXhPZihTZWN1cml0eUNvbnRleHQuVVJMKSA+IC0xICYmXG4gICAgICAgICAgICBvcC5zZWN1cml0eUNvbnRleHQuaW5kZXhPZihTZWN1cml0eUNvbnRleHQuUkVTT1VSQ0VfVVJMKSA+IC0xXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICAvLyBXaGVuIHRoZSBob3N0IGVsZW1lbnQgaXNuJ3Qga25vd24sIHNvbWUgVVJMIGF0dHJpYnV0ZXMgKHN1Y2ggYXMgXCJzcmNcIiBhbmQgXCJocmVmXCIpIG1heVxuICAgICAgICAgICAgLy8gYmUgcGFydCBvZiBtdWx0aXBsZSBkaWZmZXJlbnQgc2VjdXJpdHkgY29udGV4dHMuIEluIHRoaXMgY2FzZSB3ZSB1c2Ugc3BlY2lhbFxuICAgICAgICAgICAgLy8gc2FuaXRpemF0aW9uIGZ1bmN0aW9uIGFuZCBzZWxlY3QgdGhlIGFjdHVhbCBzYW5pdGl6ZXIgYXQgcnVudGltZSBiYXNlZCBvbiBhIHRhZyBuYW1lXG4gICAgICAgICAgICAvLyB0aGF0IGlzIHByb3ZpZGVkIHdoaWxlIGludm9raW5nIHNhbml0aXphdGlvbiBmdW5jdGlvbi5cbiAgICAgICAgICAgIHNhbml0aXplckZuID0gSWRlbnRpZmllcnMuc2FuaXRpemVVcmxPclJlc291cmNlVXJsO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzYW5pdGl6ZXJGbiA9IHNhbml0aXplckZucy5nZXQoZ2V0T25seVNlY3VyaXR5Q29udGV4dChvcC5zZWN1cml0eUNvbnRleHQpKSA/PyBudWxsO1xuICAgICAgICAgIH1cbiAgICAgICAgICBvcC5zYW5pdGl6ZXIgPSBzYW5pdGl6ZXJGbiAhPT0gbnVsbCA/IG8uaW1wb3J0RXhwcihzYW5pdGl6ZXJGbikgOiBudWxsO1xuXG4gICAgICAgICAgLy8gSWYgdGhlcmUgd2FzIG5vIHNhbml0aXphdGlvbiBmdW5jdGlvbiBmb3VuZCBiYXNlZCBvbiB0aGUgc2VjdXJpdHkgY29udGV4dCBvZiBhblxuICAgICAgICAgIC8vIGF0dHJpYnV0ZS9wcm9wZXJ0eSwgY2hlY2sgd2hldGhlciB0aGlzIGF0dHJpYnV0ZS9wcm9wZXJ0eSBpcyBvbmUgb2YgdGhlXG4gICAgICAgICAgLy8gc2VjdXJpdHktc2Vuc2l0aXZlIDxpZnJhbWU+IGF0dHJpYnV0ZXMgKGFuZCB0aGF0IHRoZSBjdXJyZW50IGVsZW1lbnQgaXMgYWN0dWFsbHkgYW5cbiAgICAgICAgICAvLyA8aWZyYW1lPikuXG4gICAgICAgICAgaWYgKG9wLnNhbml0aXplciA9PT0gbnVsbCkge1xuICAgICAgICAgICAgbGV0IGlzSWZyYW1lID0gZmFsc2U7XG4gICAgICAgICAgICBpZiAoam9iLmtpbmQgPT09IENvbXBpbGF0aW9uSm9iS2luZC5Ib3N0IHx8IG9wLmtpbmQgPT09IGlyLk9wS2luZC5Ib3N0UHJvcGVydHkpIHtcbiAgICAgICAgICAgICAgLy8gTm90ZTogZm9yIGhvc3QgYmluZGluZ3MgZGVmaW5lZCBvbiBhIGRpcmVjdGl2ZSwgd2UgZG8gbm90IHRyeSB0byBmaW5kIGFsbFxuICAgICAgICAgICAgICAvLyBwb3NzaWJsZSBwbGFjZXMgd2hlcmUgaXQgY2FuIGJlIG1hdGNoZWQsIHNvIHdlIGNhbiBub3QgZGV0ZXJtaW5lIHdoZXRoZXJcbiAgICAgICAgICAgICAgLy8gdGhlIGhvc3QgZWxlbWVudCBpcyBhbiA8aWZyYW1lPi4gSW4gdGhpcyBjYXNlLCB3ZSBqdXN0IGFzc3VtZSBpdCBpcyBhbmQgYXBwZW5kIGFcbiAgICAgICAgICAgICAgLy8gdmFsaWRhdGlvbiBmdW5jdGlvbiwgd2hpY2ggaXMgaW52b2tlZCBhdCBydW50aW1lIGFuZCB3b3VsZCBoYXZlIGFjY2VzcyB0byB0aGVcbiAgICAgICAgICAgICAgLy8gdW5kZXJseWluZyBET00gZWxlbWVudCB0byBjaGVjayBpZiBpdCdzIGFuIDxpZnJhbWU+IGFuZCBpZiBzbyAtIHJ1biBleHRyYSBjaGVja3MuXG4gICAgICAgICAgICAgIGlzSWZyYW1lID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIEZvciBhIG5vcm1hbCBiaW5kaW5nIHdlIGNhbiBqdXN0IGNoZWNrIGlmIHRoZSBlbGVtZW50IGl0cyBvbiBpcyBhbiBpZnJhbWUuXG4gICAgICAgICAgICAgIGNvbnN0IG93bmVyT3AgPSBlbGVtZW50cy5nZXQob3AudGFyZ2V0KTtcbiAgICAgICAgICAgICAgaWYgKG93bmVyT3AgPT09IHVuZGVmaW5lZCB8fCAhaXIuaXNFbGVtZW50T3JDb250YWluZXJPcChvd25lck9wKSkge1xuICAgICAgICAgICAgICAgIHRocm93IEVycm9yKCdQcm9wZXJ0eSBzaG91bGQgaGF2ZSBhbiBlbGVtZW50LWxpa2Ugb3duZXInKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpc0lmcmFtZSA9IGlzSWZyYW1lRWxlbWVudChvd25lck9wKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpc0lmcmFtZSAmJiBpc0lmcmFtZVNlY3VyaXR5U2Vuc2l0aXZlQXR0cihvcC5uYW1lKSkge1xuICAgICAgICAgICAgICBvcC5zYW5pdGl6ZXIgPSBvLmltcG9ydEV4cHIoSWRlbnRpZmllcnMudmFsaWRhdGVJZnJhbWVBdHRyaWJ1dGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciB0aGUgZ2l2ZW4gb3AgcmVwcmVzZW50cyBhbiBpZnJhbWUgZWxlbWVudC5cbiAqL1xuZnVuY3Rpb24gaXNJZnJhbWVFbGVtZW50KG9wOiBpci5FbGVtZW50T3JDb250YWluZXJPcHMpOiBib29sZWFuIHtcbiAgcmV0dXJuIG9wLmtpbmQgPT09IGlyLk9wS2luZC5FbGVtZW50U3RhcnQgJiYgb3AudGFnPy50b0xvd2VyQ2FzZSgpID09PSAnaWZyYW1lJztcbn1cblxuLyoqXG4gKiBBc3NlcnRzIHRoYXQgdGhlcmUgaXMgb25seSBhIHNpbmdsZSBzZWN1cml0eSBjb250ZXh0IGFuZCByZXR1cm5zIGl0LlxuICovXG5mdW5jdGlvbiBnZXRPbmx5U2VjdXJpdHlDb250ZXh0KFxuICBzZWN1cml0eUNvbnRleHQ6IFNlY3VyaXR5Q29udGV4dCB8IFNlY3VyaXR5Q29udGV4dFtdLFxuKTogU2VjdXJpdHlDb250ZXh0IHtcbiAgaWYgKEFycmF5LmlzQXJyYXkoc2VjdXJpdHlDb250ZXh0KSkge1xuICAgIGlmIChzZWN1cml0eUNvbnRleHQubGVuZ3RoID4gMSkge1xuICAgICAgLy8gVE9ETzogV2hhdCBzaG91bGQgd2UgZG8gaGVyZT8gVERCIGp1c3QgdG9vayB0aGUgZmlyc3Qgb25lLCBidXQgdGhpcyBmZWVscyBsaWtlIHNvbWV0aGluZyB3ZVxuICAgICAgLy8gd291bGQgd2FudCB0byBrbm93IGFib3V0IGFuZCBjcmVhdGUgYSBzcGVjaWFsIGNhc2UgZm9yIGxpa2Ugd2UgZGlkIGZvciBVcmwvUmVzb3VyY2VVcmwuIE15XG4gICAgICAvLyBndWVzcyBpcyB0aGF0LCBvdXRzaWRlIG9mIHRoZSBVcmwvUmVzb3VyY2VVcmwgY2FzZSwgdGhpcyBuZXZlciBhY3R1YWxseSBoYXBwZW5zLiBJZiB0aGVyZVxuICAgICAgLy8gZG8gdHVybiBvdXQgdG8gYmUgb3RoZXIgY2FzZXMsIHRocm93aW5nIGFuIGVycm9yIHVudGlsIHdlIGNhbiBhZGRyZXNzIGl0IGZlZWxzIHNhZmVyLlxuICAgICAgdGhyb3cgRXJyb3IoYEFzc2VydGlvbkVycm9yOiBBbWJpZ3VvdXMgc2VjdXJpdHkgY29udGV4dGApO1xuICAgIH1cbiAgICByZXR1cm4gc2VjdXJpdHlDb250ZXh0WzBdIHx8IFNlY3VyaXR5Q29udGV4dC5OT05FO1xuICB9XG4gIHJldHVybiBzZWN1cml0eUNvbnRleHQ7XG59XG4iXX0=