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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb2x2ZV9zYW5pdGl6ZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3RlbXBsYXRlL3BpcGVsaW5lL3NyYy9waGFzZXMvcmVzb2x2ZV9zYW5pdGl6ZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUNqRCxPQUFPLEtBQUssQ0FBQyxNQUFNLCtCQUErQixDQUFDO0FBQ25ELE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxvQ0FBb0MsQ0FBQztBQUMvRCxPQUFPLEVBQUMsNkJBQTZCLEVBQUMsTUFBTSx3Q0FBd0MsQ0FBQztBQUNyRixPQUFPLEtBQUssRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUMvQixPQUFPLEVBQWlCLGtCQUFrQixFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDbEUsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBRWpEOztHQUVHO0FBQ0gsTUFBTSxZQUFZLEdBQUcsSUFBSSxHQUFHLENBQXVDO0lBQ2pFLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsWUFBWSxDQUFDO0lBQ2hELENBQUMsZUFBZSxDQUFDLFlBQVksRUFBRSxXQUFXLENBQUMsbUJBQW1CLENBQUM7SUFDL0QsQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxjQUFjLENBQUM7SUFDcEQsQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFLFdBQVcsQ0FBQyxhQUFhLENBQUM7SUFDbEQsQ0FBQyxlQUFlLENBQUMsR0FBRyxFQUFFLFdBQVcsQ0FBQyxXQUFXLENBQUM7Q0FDL0MsQ0FBQyxDQUFDO0FBRUg7O0dBRUc7QUFDSCxNQUFNLGVBQWUsR0FBRyxJQUFJLEdBQUcsQ0FBdUM7SUFDcEUsQ0FBQyxlQUFlLENBQUMsSUFB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d0Y7WUFDeEYsTUFBTSxLQUFLLENBQUMsNENBQTRDLENBQUMsQ0FBQztRQUM1RCxDQUFDO1FBQ0QsT0FBTyxlQUFlLENBQUMsQ0FBQyxDQUFDLElBQUksZUFBZSxDQUFDLElBQUksQ0FBQztJQUNwRCxDQUFDO0lBQ0QsT0FBTyxlQUFlLENBQUM7QUFDekIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1NlY3VyaXR5Q29udGV4dH0gZnJvbSAnLi4vLi4vLi4vLi4vY29yZSc7XG5pbXBvcnQgKiBhcyBvIGZyb20gJy4uLy4uLy4uLy4uL291dHB1dC9vdXRwdXRfYXN0JztcbmltcG9ydCB7SWRlbnRpZmllcnN9IGZyb20gJy4uLy4uLy4uLy4uL3JlbmRlcjMvcjNfaWRlbnRpZmllcnMnO1xuaW1wb3J0IHtpc0lmcmFtZVNlY3VyaXR5U2Vuc2l0aXZlQXR0cn0gZnJvbSAnLi4vLi4vLi4vLi4vc2NoZW1hL2RvbV9zZWN1cml0eV9zY2hlbWEnO1xuaW1wb3J0ICogYXMgaXIgZnJvbSAnLi4vLi4vaXInO1xuaW1wb3J0IHtDb21waWxhdGlvbkpvYiwgQ29tcGlsYXRpb25Kb2JLaW5kfSBmcm9tICcuLi9jb21waWxhdGlvbic7XG5pbXBvcnQge2NyZWF0ZU9wWHJlZk1hcH0gZnJvbSAnLi4vdXRpbC9lbGVtZW50cyc7XG5cbi8qKlxuICogTWFwIG9mIHNlY3VyaXR5IGNvbnRleHRzIHRvIHRoZWlyIHNhbml0aXplciBmdW5jdGlvbi5cbiAqL1xuY29uc3Qgc2FuaXRpemVyRm5zID0gbmV3IE1hcDxTZWN1cml0eUNvbnRleHQsIG8uRXh0ZXJuYWxSZWZlcmVuY2U+KFtcbiAgW1NlY3VyaXR5Q29udGV4dC5IVE1MLCBJZGVudGlmaWVycy5zYW5pdGl6ZUh0bWxdLFxuICBbU2VjdXJpdHlDb250ZXh0LlJFU09VUkNFX1VSTCwgSWRlbnRpZmllcnMuc2FuaXRpemVSZXNvdXJjZVVybF0sXG4gIFtTZWN1cml0eUNvbnRleHQuU0NSSVBULCBJZGVudGlmaWVycy5zYW5pdGl6ZVNjcmlwdF0sXG4gIFtTZWN1cml0eUNvbnRleHQuU1RZTEUsIElkZW50aWZpZXJzLnNhbml0aXplU3R5bGVdLFxuICBbU2VjdXJpdHlDb250ZXh0LlVSTCwgSWRlbnRpZmllcnMuc2FuaXRpemVVcmxdLFxuXSk7XG5cbi8qKlxuICogTWFwIG9mIHNlY3VyaXR5IGNvbnRleHRzIHRvIHRoZWlyIHRydXN0ZWQgdmFsdWUgZnVuY3Rpb24uXG4gKi9cbmNvbnN0IHRydXN0ZWRWYWx1ZUZucyA9IG5ldyBNYXA8U2VjdXJpdHlDb250ZXh0LCBvLkV4dGVybmFsUmVmZXJlbmNlPihbXG4gIFtTZWN1cml0eUNvbnRleHQuSFRNTCwgSWRlbnRpZmllcnMudHJ1c3RDb25zdGFudEh0bWxdLFxuICBbU2VjdXJpdHlDb250ZXh0LlJFU09VUkNFX1VSTCwgSWRlbnRpZmllcnMudHJ1c3RDb25zdGFudFJlc291cmNlVXJsXSxcbl0pO1xuXG4vKipcbiAqIFJlc29sdmVzIHNhbml0aXphdGlvbiBmdW5jdGlvbnMgZm9yIG9wcyB0aGF0IG5lZWQgdGhlbS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVTYW5pdGl6ZXJzKGpvYjogQ29tcGlsYXRpb25Kb2IpOiB2b2lkIHtcbiAgZm9yIChjb25zdCB1bml0IG9mIGpvYi51bml0cykge1xuICAgIGNvbnN0IGVsZW1lbnRzID0gY3JlYXRlT3BYcmVmTWFwKHVuaXQpO1xuXG4gICAgLy8gRm9yIG5vcm1hbCBlbGVtZW50IGJpbmRpbmdzIHdlIGNyZWF0ZSB0cnVzdGVkIHZhbHVlcyBmb3Igc2VjdXJpdHkgc2Vuc2l0aXZlIGNvbnN0YW50XG4gICAgLy8gYXR0cmlidXRlcy4gSG93ZXZlciwgZm9yIGhvc3QgYmluZGluZ3Mgd2Ugc2tpcCB0aGlzIHN0ZXAgKHRoaXMgbWF0Y2hlcyB3aGF0XG4gICAgLy8gVGVtcGxhdGVEZWZpbml0aW9uQnVpbGRlciBkb2VzKS5cbiAgICAvLyBUT0RPOiBJcyB0aGUgVERCIGJlaGF2aW9yIGNvcnJlY3QgaGVyZT9cbiAgICBpZiAoam9iLmtpbmQgIT09IENvbXBpbGF0aW9uSm9iS2luZC5Ib3N0KSB7XG4gICAgICBmb3IgKGNvbnN0IG9wIG9mIHVuaXQuY3JlYXRlKSB7XG4gICAgICAgIGlmIChvcC5raW5kID09PSBpci5PcEtpbmQuRXh0cmFjdGVkQXR0cmlidXRlKSB7XG4gICAgICAgICAgY29uc3QgdHJ1c3RlZFZhbHVlRm4gPVxuICAgICAgICAgICAgdHJ1c3RlZFZhbHVlRm5zLmdldChnZXRPbmx5U2VjdXJpdHlDb250ZXh0KG9wLnNlY3VyaXR5Q29udGV4dCkpID8/IG51bGw7XG4gICAgICAgICAgb3AudHJ1c3RlZFZhbHVlRm4gPSB0cnVzdGVkVmFsdWVGbiAhPT0gbnVsbCA/IG8uaW1wb3J0RXhwcih0cnVzdGVkVmFsdWVGbikgOiBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBvcCBvZiB1bml0LnVwZGF0ZSkge1xuICAgICAgc3dpdGNoIChvcC5raW5kKSB7XG4gICAgICAgIGNhc2UgaXIuT3BLaW5kLlByb3BlcnR5OlxuICAgICAgICBjYXNlIGlyLk9wS2luZC5BdHRyaWJ1dGU6XG4gICAgICAgIGNhc2UgaXIuT3BLaW5kLkhvc3RQcm9wZXJ0eTpcbiAgICAgICAgICBsZXQgc2FuaXRpemVyRm46IG8uRXh0ZXJuYWxSZWZlcmVuY2UgfCBudWxsID0gbnVsbDtcbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICBBcnJheS5pc0FycmF5KG9wLnNlY3VyaXR5Q29udGV4dCkgJiZcbiAgICAgICAgICAgIG9wLnNlY3VyaXR5Q29udGV4dC5sZW5ndGggPT09IDIgJiZcbiAgICAgICAgICAgIG9wLnNlY3VyaXR5Q29udGV4dC5pbmRleE9mKFNlY3VyaXR5Q29udGV4dC5VUkwpID4gLTEgJiZcbiAgICAgICAgICAgIG9wLnNlY3VyaXR5Q29udGV4dC5pbmRleE9mKFNlY3VyaXR5Q29udGV4dC5SRVNPVVJDRV9VUkwpID4gLTFcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIC8vIFdoZW4gdGhlIGhvc3QgZWxlbWVudCBpc24ndCBrbm93biwgc29tZSBVUkwgYXR0cmlidXRlcyAoc3VjaCBhcyBcInNyY1wiIGFuZCBcImhyZWZcIikgbWF5XG4gICAgICAgICAgICAvLyBiZSBwYXJ0IG9mIG11bHRpcGxlIGRpZmZlcmVudCBzZWN1cml0eSBjb250ZXh0cy4gSW4gdGhpcyBjYXNlIHdlIHVzZSBzcGVjaWFsXG4gICAgICAgICAgICAvLyBzYW5pdGl6YXRpb24gZnVuY3Rpb24gYW5kIHNlbGVjdCB0aGUgYWN0dWFsIHNhbml0aXplciBhdCBydW50aW1lIGJhc2VkIG9uIGEgdGFnIG5hbWVcbiAgICAgICAgICAgIC8vIHRoYXQgaXMgcHJvdmlkZWQgd2hpbGUgaW52b2tpbmcgc2FuaXRpemF0aW9uIGZ1bmN0aW9uLlxuICAgICAgICAgICAgc2FuaXRpemVyRm4gPSBJZGVudGlmaWVycy5zYW5pdGl6ZVVybE9yUmVzb3VyY2VVcmw7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNhbml0aXplckZuID0gc2FuaXRpemVyRm5zLmdldChnZXRPbmx5U2VjdXJpdHlDb250ZXh0KG9wLnNlY3VyaXR5Q29udGV4dCkpID8/IG51bGw7XG4gICAgICAgICAgfVxuICAgICAgICAgIG9wLnNhbml0aXplciA9IHNhbml0aXplckZuICE9PSBudWxsID8gby5pbXBvcnRFeHByKHNhbml0aXplckZuKSA6IG51bGw7XG5cbiAgICAgICAgICAvLyBJZiB0aGVyZSB3YXMgbm8gc2FuaXRpemF0aW9uIGZ1bmN0aW9uIGZvdW5kIGJhc2VkIG9uIHRoZSBzZWN1cml0eSBjb250ZXh0IG9mIGFuXG4gICAgICAgICAgLy8gYXR0cmlidXRlL3Byb3BlcnR5LCBjaGVjayB3aGV0aGVyIHRoaXMgYXR0cmlidXRlL3Byb3BlcnR5IGlzIG9uZSBvZiB0aGVcbiAgICAgICAgICAvLyBzZWN1cml0eS1zZW5zaXRpdmUgPGlmcmFtZT4gYXR0cmlidXRlcyAoYW5kIHRoYXQgdGhlIGN1cnJlbnQgZWxlbWVudCBpcyBhY3R1YWxseSBhblxuICAgICAgICAgIC8vIDxpZnJhbWU+KS5cbiAgICAgICAgICBpZiAob3Auc2FuaXRpemVyID09PSBudWxsKSB7XG4gICAgICAgICAgICBsZXQgaXNJZnJhbWUgPSBmYWxzZTtcbiAgICAgICAgICAgIGlmIChqb2Iua2luZCA9PT0gQ29tcGlsYXRpb25Kb2JLaW5kLkhvc3QgfHwgb3Aua2luZCA9PT0gaXIuT3BLaW5kLkhvc3RQcm9wZXJ0eSkge1xuICAgICAgICAgICAgICAvLyBOb3RlOiBmb3IgaG9zdCBiaW5kaW5ncyBkZWZpbmVkIG9uIGEgZGlyZWN0aXZlLCB3ZSBkbyBub3QgdHJ5IHRvIGZpbmQgYWxsXG4gICAgICAgICAgICAgIC8vIHBvc3NpYmxlIHBsYWNlcyB3aGVyZSBpdCBjYW4gYmUgbWF0Y2hlZCwgc28gd2UgY2FuIG5vdCBkZXRlcm1pbmUgd2hldGhlclxuICAgICAgICAgICAgICAvLyB0aGUgaG9zdCBlbGVtZW50IGlzIGFuIDxpZnJhbWU+LiBJbiB0aGlzIGNhc2UsIHdlIGp1c3QgYXNzdW1lIGl0IGlzIGFuZCBhcHBlbmQgYVxuICAgICAgICAgICAgICAvLyB2YWxpZGF0aW9uIGZ1bmN0aW9uLCB3aGljaCBpcyBpbnZva2VkIGF0IHJ1bnRpbWUgYW5kIHdvdWxkIGhhdmUgYWNjZXNzIHRvIHRoZVxuICAgICAgICAgICAgICAvLyB1bmRlcmx5aW5nIERPTSBlbGVtZW50IHRvIGNoZWNrIGlmIGl0J3MgYW4gPGlmcmFtZT4gYW5kIGlmIHNvIC0gcnVuIGV4dHJhIGNoZWNrcy5cbiAgICAgICAgICAgICAgaXNJZnJhbWUgPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gRm9yIGEgbm9ybWFsIGJpbmRpbmcgd2UgY2FuIGp1c3QgY2hlY2sgaWYgdGhlIGVsZW1lbnQgaXRzIG9uIGlzIGFuIGlmcmFtZS5cbiAgICAgICAgICAgICAgY29uc3Qgb3duZXJPcCA9IGVsZW1lbnRzLmdldChvcC50YXJnZXQpO1xuICAgICAgICAgICAgICBpZiAob3duZXJPcCA9PT0gdW5kZWZpbmVkIHx8ICFpci5pc0VsZW1lbnRPckNvbnRhaW5lck9wKG93bmVyT3ApKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgRXJyb3IoJ1Byb3BlcnR5IHNob3VsZCBoYXZlIGFuIGVsZW1lbnQtbGlrZSBvd25lcicpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlzSWZyYW1lID0gaXNJZnJhbWVFbGVtZW50KG93bmVyT3ApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlzSWZyYW1lICYmIGlzSWZyYW1lU2VjdXJpdHlTZW5zaXRpdmVBdHRyKG9wLm5hbWUpKSB7XG4gICAgICAgICAgICAgIG9wLnNhbml0aXplciA9IG8uaW1wb3J0RXhwcihJZGVudGlmaWVycy52YWxpZGF0ZUlmcmFtZUF0dHJpYnV0ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIENoZWNrcyB3aGV0aGVyIHRoZSBnaXZlbiBvcCByZXByZXNlbnRzIGFuIGlmcmFtZSBlbGVtZW50LlxuICovXG5mdW5jdGlvbiBpc0lmcmFtZUVsZW1lbnQob3A6IGlyLkVsZW1lbnRPckNvbnRhaW5lck9wcyk6IGJvb2xlYW4ge1xuICByZXR1cm4gb3Aua2luZCA9PT0gaXIuT3BLaW5kLkVsZW1lbnRTdGFydCAmJiBvcC50YWc/LnRvTG93ZXJDYXNlKCkgPT09ICdpZnJhbWUnO1xufVxuXG4vKipcbiAqIEFzc2VydHMgdGhhdCB0aGVyZSBpcyBvbmx5IGEgc2luZ2xlIHNlY3VyaXR5IGNvbnRleHQgYW5kIHJldHVybnMgaXQuXG4gKi9cbmZ1bmN0aW9uIGdldE9ubHlTZWN1cml0eUNvbnRleHQoXG4gIHNlY3VyaXR5Q29udGV4dDogU2VjdXJpdHlDb250ZXh0IHwgU2VjdXJpdHlDb250ZXh0W10sXG4pOiBTZWN1cml0eUNvbnRleHQge1xuICBpZiAoQXJyYXkuaXNBcnJheShzZWN1cml0eUNvbnRleHQpKSB7XG4gICAgaWYgKHNlY3VyaXR5Q29udGV4dC5sZW5ndGggPiAxKSB7XG4gICAgICAvLyBUT0RPOiBXaGF0IHNob3VsZCB3ZSBkbyBoZXJlPyBUREIganVzdCB0b29rIHRoZSBmaXJzdCBvbmUsIGJ1dCB0aGlzIGZlZWxzIGxpa2Ugc29tZXRoaW5nIHdlXG4gICAgICAvLyB3b3VsZCB3YW50IHRvIGtub3cgYWJvdXQgYW5kIGNyZWF0ZSBhIHNwZWNpYWwgY2FzZSBmb3IgbGlrZSB3ZSBkaWQgZm9yIFVybC9SZXNvdXJjZVVybC4gTXlcbiAgICAgIC8vIGd1ZXNzIGlzIHRoYXQsIG91dHNpZGUgb2YgdGhlIFVybC9SZXNvdXJjZVVybCBjYXNlLCB0aGlzIG5ldmVyIGFjdHVhbGx5IGhhcHBlbnMuIElmIHRoZXJlXG4gICAgICAvLyBkbyB0dXJuIG91dCB0byBiZSBvdGhlciBjYXNlcywgdGhyb3dpbmcgYW4gZXJyb3IgdW50aWwgd2UgY2FuIGFkZHJlc3MgaXQgZmVlbHMgc2FmZXIuXG4gICAgICB0aHJvdyBFcnJvcihgQXNzZXJ0aW9uRXJyb3I6IEFtYmlndW91cyBzZWN1cml0eSBjb250ZXh0YCk7XG4gICAgfVxuICAgIHJldHVybiBzZWN1cml0eUNvbnRleHRbMF0gfHwgU2VjdXJpdHlDb250ZXh0Lk5PTkU7XG4gIH1cbiAgcmV0dXJuIHNlY3VyaXR5Q29udGV4dDtcbn1cbiJdfQ==