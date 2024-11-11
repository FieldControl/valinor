/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { formatRuntimeError, RuntimeError } from '../../errors';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '../../metadata/schema';
import { throwError } from '../../util/assert';
import { getComponentDef } from '../definition';
import { CONTEXT, DECLARATION_COMPONENT_VIEW } from '../interfaces/view';
import { isAnimationProp } from '../util/attrs_utils';
let shouldThrowErrorOnUnknownElement = false;
/**
 * Sets a strict mode for JIT-compiled components to throw an error on unknown elements,
 * instead of just logging the error.
 * (for AOT-compiled ones this check happens at build time).
 */
export function ɵsetUnknownElementStrictMode(shouldThrow) {
    shouldThrowErrorOnUnknownElement = shouldThrow;
}
/**
 * Gets the current value of the strict mode.
 */
export function ɵgetUnknownElementStrictMode() {
    return shouldThrowErrorOnUnknownElement;
}
let shouldThrowErrorOnUnknownProperty = false;
/**
 * Sets a strict mode for JIT-compiled components to throw an error on unknown properties,
 * instead of just logging the error.
 * (for AOT-compiled ones this check happens at build time).
 */
export function ɵsetUnknownPropertyStrictMode(shouldThrow) {
    shouldThrowErrorOnUnknownProperty = shouldThrow;
}
/**
 * Gets the current value of the strict mode.
 */
export function ɵgetUnknownPropertyStrictMode() {
    return shouldThrowErrorOnUnknownProperty;
}
/**
 * Validates that the element is known at runtime and produces
 * an error if it's not the case.
 * This check is relevant for JIT-compiled components (for AOT-compiled
 * ones this check happens at build time).
 *
 * The element is considered known if either:
 * - it's a known HTML element
 * - it's a known custom element
 * - the element matches any directive
 * - the element is allowed by one of the schemas
 *
 * @param element Element to validate
 * @param lView An `LView` that represents a current component that is being rendered
 * @param tagName Name of the tag to check
 * @param schemas Array of schemas
 * @param hasDirectives Boolean indicating that the element matches any directive
 */
export function validateElementIsKnown(element, lView, tagName, schemas, hasDirectives) {
    // If `schemas` is set to `null`, that's an indication that this Component was compiled in AOT
    // mode where this check happens at compile time. In JIT mode, `schemas` is always present and
    // defined as an array (as an empty array in case `schemas` field is not defined) and we should
    // execute the check below.
    if (schemas === null)
        return;
    // If the element matches any directive, it's considered as valid.
    if (!hasDirectives && tagName !== null) {
        // The element is unknown if it's an instance of HTMLUnknownElement, or it isn't registered
        // as a custom element. Note that unknown elements with a dash in their name won't be instances
        // of HTMLUnknownElement in browsers that support web components.
        const isUnknown = 
        // Note that we can't check for `typeof HTMLUnknownElement === 'function'` because
        // Domino doesn't expose HTMLUnknownElement globally.
        (typeof HTMLUnknownElement !== 'undefined' &&
            HTMLUnknownElement &&
            element instanceof HTMLUnknownElement) ||
            (typeof customElements !== 'undefined' &&
                tagName.indexOf('-') > -1 &&
                !customElements.get(tagName));
        if (isUnknown && !matchingSchemas(schemas, tagName)) {
            const isHostStandalone = isHostComponentStandalone(lView);
            const templateLocation = getTemplateLocationDetails(lView);
            const schemas = `'${isHostStandalone ? '@Component' : '@NgModule'}.schemas'`;
            let message = `'${tagName}' is not a known element${templateLocation}:\n`;
            message += `1. If '${tagName}' is an Angular component, then verify that it is ${isHostStandalone
                ? "included in the '@Component.imports' of this component"
                : 'a part of an @NgModule where this component is declared'}.\n`;
            if (tagName && tagName.indexOf('-') > -1) {
                message += `2. If '${tagName}' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the ${schemas} of this component to suppress this message.`;
            }
            else {
                message += `2. To allow any element add 'NO_ERRORS_SCHEMA' to the ${schemas} of this component.`;
            }
            if (shouldThrowErrorOnUnknownElement) {
                throw new RuntimeError(304 /* RuntimeErrorCode.UNKNOWN_ELEMENT */, message);
            }
            else {
                console.error(formatRuntimeError(304 /* RuntimeErrorCode.UNKNOWN_ELEMENT */, message));
            }
        }
    }
}
/**
 * Validates that the property of the element is known at runtime and returns
 * false if it's not the case.
 * This check is relevant for JIT-compiled components (for AOT-compiled
 * ones this check happens at build time).
 *
 * The property is considered known if either:
 * - it's a known property of the element
 * - the element is allowed by one of the schemas
 * - the property is used for animations
 *
 * @param element Element to validate
 * @param propName Name of the property to check
 * @param tagName Name of the tag hosting the property
 * @param schemas Array of schemas
 */
export function isPropertyValid(element, propName, tagName, schemas) {
    // If `schemas` is set to `null`, that's an indication that this Component was compiled in AOT
    // mode where this check happens at compile time. In JIT mode, `schemas` is always present and
    // defined as an array (as an empty array in case `schemas` field is not defined) and we should
    // execute the check below.
    if (schemas === null)
        return true;
    // The property is considered valid if the element matches the schema, it exists on the element,
    // or it is synthetic.
    if (matchingSchemas(schemas, tagName) || propName in element || isAnimationProp(propName)) {
        return true;
    }
    // Note: `typeof Node` returns 'function' in most browsers, but is undefined with domino.
    return typeof Node === 'undefined' || Node === null || !(element instanceof Node);
}
/**
 * Logs or throws an error that a property is not supported on an element.
 *
 * @param propName Name of the invalid property
 * @param tagName Name of the tag hosting the property
 * @param nodeType Type of the node hosting the property
 * @param lView An `LView` that represents a current component
 */
export function handleUnknownPropertyError(propName, tagName, nodeType, lView) {
    // Special-case a situation when a structural directive is applied to
    // an `<ng-template>` element, for example: `<ng-template *ngIf="true">`.
    // In this case the compiler generates the `ɵɵtemplate` instruction with
    // the `null` as the tagName. The directive matching logic at runtime relies
    // on this effect (see `isInlineTemplate`), thus using the 'ng-template' as
    // a default value of the `tNode.value` is not feasible at this moment.
    if (!tagName && nodeType === 4 /* TNodeType.Container */) {
        tagName = 'ng-template';
    }
    const isHostStandalone = isHostComponentStandalone(lView);
    const templateLocation = getTemplateLocationDetails(lView);
    let message = `Can't bind to '${propName}' since it isn't a known property of '${tagName}'${templateLocation}.`;
    const schemas = `'${isHostStandalone ? '@Component' : '@NgModule'}.schemas'`;
    const importLocation = isHostStandalone
        ? "included in the '@Component.imports' of this component"
        : 'a part of an @NgModule where this component is declared';
    if (KNOWN_CONTROL_FLOW_DIRECTIVES.has(propName)) {
        // Most likely this is a control flow directive (such as `*ngIf`) used in
        // a template, but the directive or the `CommonModule` is not imported.
        const correspondingImport = KNOWN_CONTROL_FLOW_DIRECTIVES.get(propName);
        message +=
            `\nIf the '${propName}' is an Angular control flow directive, ` +
                `please make sure that either the '${correspondingImport}' directive or the 'CommonModule' is ${importLocation}.`;
    }
    else {
        // May be an Angular component, which is not imported/declared?
        message +=
            `\n1. If '${tagName}' is an Angular component and it has the ` +
                `'${propName}' input, then verify that it is ${importLocation}.`;
        // May be a Web Component?
        if (tagName && tagName.indexOf('-') > -1) {
            message +=
                `\n2. If '${tagName}' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' ` +
                    `to the ${schemas} of this component to suppress this message.`;
            message +=
                `\n3. To allow any property add 'NO_ERRORS_SCHEMA' to ` +
                    `the ${schemas} of this component.`;
        }
        else {
            // If it's expected, the error can be suppressed by the `NO_ERRORS_SCHEMA` schema.
            message +=
                `\n2. To allow any property add 'NO_ERRORS_SCHEMA' to ` +
                    `the ${schemas} of this component.`;
        }
    }
    reportUnknownPropertyError(message);
}
export function reportUnknownPropertyError(message) {
    if (shouldThrowErrorOnUnknownProperty) {
        throw new RuntimeError(303 /* RuntimeErrorCode.UNKNOWN_BINDING */, message);
    }
    else {
        console.error(formatRuntimeError(303 /* RuntimeErrorCode.UNKNOWN_BINDING */, message));
    }
}
/**
 * WARNING: this is a **dev-mode only** function (thus should always be guarded by the `ngDevMode`)
 * and must **not** be used in production bundles. The function makes megamorphic reads, which might
 * be too slow for production mode and also it relies on the constructor function being available.
 *
 * Gets a reference to the host component def (where a current component is declared).
 *
 * @param lView An `LView` that represents a current component that is being rendered.
 */
export function getDeclarationComponentDef(lView) {
    !ngDevMode && throwError('Must never be called in production mode');
    const declarationLView = lView[DECLARATION_COMPONENT_VIEW];
    const context = declarationLView[CONTEXT];
    // Unable to obtain a context.
    if (!context)
        return null;
    return context.constructor ? getComponentDef(context.constructor) : null;
}
/**
 * WARNING: this is a **dev-mode only** function (thus should always be guarded by the `ngDevMode`)
 * and must **not** be used in production bundles. The function makes megamorphic reads, which might
 * be too slow for production mode.
 *
 * Checks if the current component is declared inside of a standalone component template.
 *
 * @param lView An `LView` that represents a current component that is being rendered.
 */
export function isHostComponentStandalone(lView) {
    !ngDevMode && throwError('Must never be called in production mode');
    const componentDef = getDeclarationComponentDef(lView);
    // Treat host component as non-standalone if we can't obtain the def.
    return !!componentDef?.standalone;
}
/**
 * WARNING: this is a **dev-mode only** function (thus should always be guarded by the `ngDevMode`)
 * and must **not** be used in production bundles. The function makes megamorphic reads, which might
 * be too slow for production mode.
 *
 * Constructs a string describing the location of the host component template. The function is used
 * in dev mode to produce error messages.
 *
 * @param lView An `LView` that represents a current component that is being rendered.
 */
export function getTemplateLocationDetails(lView) {
    !ngDevMode && throwError('Must never be called in production mode');
    const hostComponentDef = getDeclarationComponentDef(lView);
    const componentClassName = hostComponentDef?.type?.name;
    return componentClassName ? ` (used in the '${componentClassName}' component template)` : '';
}
/**
 * The set of known control flow directives and their corresponding imports.
 * We use this set to produce a more precises error message with a note
 * that the `CommonModule` should also be included.
 */
export const KNOWN_CONTROL_FLOW_DIRECTIVES = new Map([
    ['ngIf', 'NgIf'],
    ['ngFor', 'NgFor'],
    ['ngSwitchCase', 'NgSwitchCase'],
    ['ngSwitchDefault', 'NgSwitchDefault'],
]);
/**
 * Returns true if the tag name is allowed by specified schemas.
 * @param schemas Array of schemas
 * @param tagName Name of the tag
 */
export function matchingSchemas(schemas, tagName) {
    if (schemas !== null) {
        for (let i = 0; i < schemas.length; i++) {
            const schema = schemas[i];
            if (schema === NO_ERRORS_SCHEMA ||
                (schema === CUSTOM_ELEMENTS_SCHEMA && tagName && tagName.indexOf('-') > -1)) {
                return true;
            }
        }
    }
    return false;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxlbWVudF92YWxpZGF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvcmVuZGVyMy9pbnN0cnVjdGlvbnMvZWxlbWVudF92YWxpZGF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxrQkFBa0IsRUFBRSxZQUFZLEVBQW1CLE1BQU0sY0FBYyxDQUFDO0FBRWhGLE9BQU8sRUFBQyxzQkFBc0IsRUFBRSxnQkFBZ0IsRUFBaUIsTUFBTSx1QkFBdUIsQ0FBQztBQUMvRixPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDN0MsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUk5QyxPQUFPLEVBQUMsT0FBTyxFQUFFLDBCQUEwQixFQUFRLE1BQU0sb0JBQW9CLENBQUM7QUFDOUUsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBRXBELElBQUksZ0NBQWdDLEdBQUcsS0FBSyxDQUFDO0FBRTdDOzs7O0dBSUc7QUFDSCxNQUFNLFVBQVUsNEJBQTRCLENBQUMsV0FBb0I7SUFDL0QsZ0NBQWdDLEdBQUcsV0FBVyxDQUFDO0FBQ2pELENBQUM7QUFFRDs7R0FFRztBQUNILE1BQU0sVUFBVSw0QkFBNEI7SUFDMUMsT0FBTyxnQ0FBZ0MsQ0FBQztBQUMxQyxDQUFDO0FBRUQsSUFBSSxpQ0FBaUMsR0FBRyxLQUFLLENBQUM7QUFFOUM7Ozs7R0FJRztBQUNILE1BQU0sVUFBVSw2QkFBNkIsQ0FBQyxXQUFvQjtJQUNoRSxpQ0FBaUMsR0FBRyxXQUFXLENBQUM7QUFDbEQsQ0FBQztBQUVEOztHQUVHO0FBQ0gsTUFBTSxVQUFVLDZCQUE2QjtJQUMzQyxPQUFPLGlDQUFpQyxDQUFDO0FBQzNDLENBQUM7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FpQkc7QUFDSCxNQUFNLFVB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WUFDMUIsSUFDRSxNQUFNLEtBQUssZ0JBQWdCO2dCQUMzQixDQUFDLE1BQU0sS0FBSyxzQkFBc0IsSUFBSSxPQUFPLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUMzRSxDQUFDO2dCQUNELE9BQU8sSUFBSSxDQUFDO1lBQ2QsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0lBRUQsT0FBTyxLQUFLLENBQUM7QUFDZixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2Zvcm1hdFJ1bnRpbWVFcnJvciwgUnVudGltZUVycm9yLCBSdW50aW1lRXJyb3JDb2RlfSBmcm9tICcuLi8uLi9lcnJvcnMnO1xuaW1wb3J0IHtUeXBlfSBmcm9tICcuLi8uLi9pbnRlcmZhY2UvdHlwZSc7XG5pbXBvcnQge0NVU1RPTV9FTEVNRU5UU19TQ0hFTUEsIE5PX0VSUk9SU19TQ0hFTUEsIFNjaGVtYU1ldGFkYXRhfSBmcm9tICcuLi8uLi9tZXRhZGF0YS9zY2hlbWEnO1xuaW1wb3J0IHt0aHJvd0Vycm9yfSBmcm9tICcuLi8uLi91dGlsL2Fzc2VydCc7XG5pbXBvcnQge2dldENvbXBvbmVudERlZn0gZnJvbSAnLi4vZGVmaW5pdGlvbic7XG5pbXBvcnQge0NvbXBvbmVudERlZn0gZnJvbSAnLi4vaW50ZXJmYWNlcy9kZWZpbml0aW9uJztcbmltcG9ydCB7VE5vZGVUeXBlfSBmcm9tICcuLi9pbnRlcmZhY2VzL25vZGUnO1xuaW1wb3J0IHtSQ29tbWVudCwgUkVsZW1lbnR9IGZyb20gJy4uL2ludGVyZmFjZXMvcmVuZGVyZXJfZG9tJztcbmltcG9ydCB7Q09OVEVYVCwgREVDTEFSQVRJT05fQ09NUE9ORU5UX1ZJRVcsIExWaWV3fSBmcm9tICcuLi9pbnRlcmZhY2VzL3ZpZXcnO1xuaW1wb3J0IHtpc0FuaW1hdGlvblByb3B9IGZyb20gJy4uL3V0aWwvYXR0cnNfdXRpbHMnO1xuXG5sZXQgc2hvdWxkVGhyb3dFcnJvck9uVW5rbm93bkVsZW1lbnQgPSBmYWxzZTtcblxuLyoqXG4gKiBTZXRzIGEgc3RyaWN0IG1vZGUgZm9yIEpJVC1jb21waWxlZCBjb21wb25lbnRzIHRvIHRocm93IGFuIGVycm9yIG9uIHVua25vd24gZWxlbWVudHMsXG4gKiBpbnN0ZWFkIG9mIGp1c3QgbG9nZ2luZyB0aGUgZXJyb3IuXG4gKiAoZm9yIEFPVC1jb21waWxlZCBvbmVzIHRoaXMgY2hlY2sgaGFwcGVucyBhdCBidWlsZCB0aW1lKS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIMm1c2V0VW5rbm93bkVsZW1lbnRTdHJpY3RNb2RlKHNob3VsZFRocm93OiBib29sZWFuKSB7XG4gIHNob3VsZFRocm93RXJyb3JPblVua25vd25FbGVtZW50ID0gc2hvdWxkVGhyb3c7XG59XG5cbi8qKlxuICogR2V0cyB0aGUgY3VycmVudCB2YWx1ZSBvZiB0aGUgc3RyaWN0IG1vZGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiDJtWdldFVua25vd25FbGVtZW50U3RyaWN0TW9kZSgpIHtcbiAgcmV0dXJuIHNob3VsZFRocm93RXJyb3JPblVua25vd25FbGVtZW50O1xufVxuXG5sZXQgc2hvdWxkVGhyb3dFcnJvck9uVW5rbm93blByb3BlcnR5ID0gZmFsc2U7XG5cbi8qKlxuICogU2V0cyBhIHN0cmljdCBtb2RlIGZvciBKSVQtY29tcGlsZWQgY29tcG9uZW50cyB0byB0aHJvdyBhbiBlcnJvciBvbiB1bmtub3duIHByb3BlcnRpZXMsXG4gKiBpbnN0ZWFkIG9mIGp1c3QgbG9nZ2luZyB0aGUgZXJyb3IuXG4gKiAoZm9yIEFPVC1jb21waWxlZCBvbmVzIHRoaXMgY2hlY2sgaGFwcGVucyBhdCBidWlsZCB0aW1lKS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIMm1c2V0VW5rbm93blByb3BlcnR5U3RyaWN0TW9kZShzaG91bGRUaHJvdzogYm9vbGVhbikge1xuICBzaG91bGRUaHJvd0Vycm9yT25Vbmtub3duUHJvcGVydHkgPSBzaG91bGRUaHJvdztcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBjdXJyZW50IHZhbHVlIG9mIHRoZSBzdHJpY3QgbW9kZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIMm1Z2V0VW5rbm93blByb3BlcnR5U3RyaWN0TW9kZSgpIHtcbiAgcmV0dXJuIHNob3VsZFRocm93RXJyb3JPblVua25vd25Qcm9wZXJ0eTtcbn1cblxuLyoqXG4gKiBWYWxpZGF0ZXMgdGhhdCB0aGUgZWxlbWVudCBpcyBrbm93biBhdCBydW50aW1lIGFuZCBwcm9kdWNlc1xuICogYW4gZXJyb3IgaWYgaXQncyBub3QgdGhlIGNhc2UuXG4gKiBUaGlzIGNoZWNrIGlzIHJlbGV2YW50IGZvciBKSVQtY29tcGlsZWQgY29tcG9uZW50cyAoZm9yIEFPVC1jb21waWxlZFxuICogb25lcyB0aGlzIGNoZWNrIGhhcHBlbnMgYXQgYnVpbGQgdGltZSkuXG4gKlxuICogVGhlIGVsZW1lbnQgaXMgY29uc2lkZXJlZCBrbm93biBpZiBlaXRoZXI6XG4gKiAtIGl0J3MgYSBrbm93biBIVE1MIGVsZW1lbnRcbiAqIC0gaXQncyBhIGtub3duIGN1c3RvbSBlbGVtZW50XG4gKiAtIHRoZSBlbGVtZW50IG1hdGNoZXMgYW55IGRpcmVjdGl2ZVxuICogLSB0aGUgZWxlbWVudCBpcyBhbGxvd2VkIGJ5IG9uZSBvZiB0aGUgc2NoZW1hc1xuICpcbiAqIEBwYXJhbSBlbGVtZW50IEVsZW1lbnQgdG8gdmFsaWRhdGVcbiAqIEBwYXJhbSBsVmlldyBBbiBgTFZpZXdgIHRoYXQgcmVwcmVzZW50cyBhIGN1cnJlbnQgY29tcG9uZW50IHRoYXQgaXMgYmVpbmcgcmVuZGVyZWRcbiAqIEBwYXJhbSB0YWdOYW1lIE5hbWUgb2YgdGhlIHRhZyB0byBjaGVja1xuICogQHBhcmFtIHNjaGVtYXMgQXJyYXkgb2Ygc2NoZW1hc1xuICogQHBhcmFtIGhhc0RpcmVjdGl2ZXMgQm9vbGVhbiBpbmRpY2F0aW5nIHRoYXQgdGhlIGVsZW1lbnQgbWF0Y2hlcyBhbnkgZGlyZWN0aXZlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUVsZW1lbnRJc0tub3duKFxuICBlbGVtZW50OiBSRWxlbWVudCxcbiAgbFZpZXc6IExWaWV3LFxuICB0YWdOYW1lOiBzdHJpbmcgfCBudWxsLFxuICBzY2hlbWFzOiBTY2hlbWFNZXRhZGF0YVtdIHwgbnVsbCxcbiAgaGFzRGlyZWN0aXZlczogYm9vbGVhbixcbik6IHZvaWQge1xuICAvLyBJZiBgc2NoZW1hc2AgaXMgc2V0IHRvIGBudWxsYCwgdGhhdCdzIGFuIGluZGljYXRpb24gdGhhdCB0aGlzIENvbXBvbmVudCB3YXMgY29tcGlsZWQgaW4gQU9UXG4gIC8vIG1vZGUgd2hlcmUgdGhpcyBjaGVjayBoYXBwZW5zIGF0IGNvbXBpbGUgdGltZS4gSW4gSklUIG1vZGUsIGBzY2hlbWFzYCBpcyBhbHdheXMgcHJlc2VudCBhbmRcbiAgLy8gZGVmaW5lZCBhcyBhbiBhcnJheSAoYXMgYW4gZW1wdHkgYXJyYXkgaW4gY2FzZSBgc2NoZW1hc2AgZmllbGQgaXMgbm90IGRlZmluZWQpIGFuZCB3ZSBzaG91bGRcbiAgLy8gZXhlY3V0ZSB0aGUgY2hlY2sgYmVsb3cuXG4gIGlmIChzY2hlbWFzID09PSBudWxsKSByZXR1cm47XG5cbiAgLy8gSWYgdGhlIGVsZW1lbnQgbWF0Y2hlcyBhbnkgZGlyZWN0aXZlLCBpdCdzIGNvbnNpZGVyZWQgYXMgdmFsaWQuXG4gIGlmICghaGFzRGlyZWN0aXZlcyAmJiB0YWdOYW1lICE9PSBudWxsKSB7XG4gICAgLy8gVGhlIGVsZW1lbnQgaXMgdW5rbm93biBpZiBpdCdzIGFuIGluc3RhbmNlIG9mIEhUTUxVbmtub3duRWxlbWVudCwgb3IgaXQgaXNuJ3QgcmVnaXN0ZXJlZFxuICAgIC8vIGFzIGEgY3VzdG9tIGVsZW1lbnQuIE5vdGUgdGhhdCB1bmtub3duIGVsZW1lbnRzIHdpdGggYSBkYXNoIGluIHRoZWlyIG5hbWUgd29uJ3QgYmUgaW5zdGFuY2VzXG4gICAgLy8gb2YgSFRNTFVua25vd25FbGVtZW50IGluIGJyb3dzZXJzIHRoYXQgc3VwcG9ydCB3ZWIgY29tcG9uZW50cy5cbiAgICBjb25zdCBpc1Vua25vd24gPVxuICAgICAgLy8gTm90ZSB0aGF0IHdlIGNhbid0IGNoZWNrIGZvciBgdHlwZW9mIEhUTUxVbmtub3duRWxlbWVudCA9PT0gJ2Z1bmN0aW9uJ2AgYmVjYXVzZVxuICAgICAgLy8gRG9taW5vIGRvZXNuJ3QgZXhwb3NlIEhUTUxVbmtub3duRWxlbWVudCBnbG9iYWxseS5cbiAgICAgICh0eXBlb2YgSFRNTFVua25vd25FbGVtZW50ICE9PSAndW5kZWZpbmVkJyAmJlxuICAgICAgICBIVE1MVW5rbm93bkVsZW1lbnQgJiZcbiAgICAgICAgZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxVbmtub3duRWxlbWVudCkgfHxcbiAgICAgICh0eXBlb2YgY3VzdG9tRWxlbWVudHMgIT09ICd1bmRlZmluZWQnICYmXG4gICAgICAgIHRhZ05hbWUuaW5kZXhPZignLScpID4gLTEgJiZcbiAgICAgICAgIWN1c3RvbUVsZW1lbnRzLmdldCh0YWdOYW1lKSk7XG5cbiAgICBpZiAoaXNVbmtub3duICYmICFtYXRjaGluZ1NjaGVtYXMoc2NoZW1hcywgdGFnTmFtZSkpIHtcbiAgICAgIGNvbnN0IGlzSG9zdFN0YW5kYWxvbmUgPSBpc0hvc3RDb21wb25lbnRTdGFuZGFsb25lKGxWaWV3KTtcbiAgICAgIGNvbnN0IHRlbXBsYXRlTG9jYXRpb24gPSBnZXRUZW1wbGF0ZUxvY2F0aW9uRGV0YWlscyhsVmlldyk7XG4gICAgICBjb25zdCBzY2hlbWFzID0gYCcke2lzSG9zdFN0YW5kYWxvbmUgPyAnQENvbXBvbmVudCcgOiAnQE5nTW9kdWxlJ30uc2NoZW1hcydgO1xuXG4gICAgICBsZXQgbWVzc2FnZSA9IGAnJHt0YWdOYW1lfScgaXMgbm90IGEga25vd24gZWxlbWVudCR7dGVtcGxhdGVMb2NhdGlvbn06XFxuYDtcbiAgICAgIG1lc3NhZ2UgKz0gYDEuIElmICcke3RhZ05hbWV9JyBpcyBhbiBBbmd1bGFyIGNvbXBvbmVudCwgdGhlbiB2ZXJpZnkgdGhhdCBpdCBpcyAke1xuICAgICAgICBpc0hvc3RTdGFuZGFsb25lXG4gICAgICAgICAgPyBcImluY2x1ZGVkIGluIHRoZSAnQENvbXBvbmVudC5pbXBvcnRzJyBvZiB0aGlzIGNvbXBvbmVudFwiXG4gICAgICAgICAgOiAnYSBwYXJ0IG9mIGFuIEBOZ01vZHVsZSB3aGVyZSB0aGlzIGNvbXBvbmVudCBpcyBkZWNsYXJlZCdcbiAgICAgIH0uXFxuYDtcbiAgICAgIGlmICh0YWdOYW1lICYmIHRhZ05hbWUuaW5kZXhPZignLScpID4gLTEpIHtcbiAgICAgICAgbWVzc2FnZSArPSBgMi4gSWYgJyR7dGFnTmFtZX0nIGlzIGEgV2ViIENvbXBvbmVudCB0aGVuIGFkZCAnQ1VTVE9NX0VMRU1FTlRTX1NDSEVNQScgdG8gdGhlICR7c2NoZW1hc30gb2YgdGhpcyBjb21wb25lbnQgdG8gc3VwcHJlc3MgdGhpcyBtZXNzYWdlLmA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtZXNzYWdlICs9IGAyLiBUbyBhbGxvdyBhbnkgZWxlbWVudCBhZGQgJ05PX0VSUk9SU19TQ0hFTUEnIHRvIHRoZSAke3NjaGVtYXN9IG9mIHRoaXMgY29tcG9uZW50LmA7XG4gICAgICB9XG4gICAgICBpZiAoc2hvdWxkVGhyb3dFcnJvck9uVW5rbm93bkVsZW1lbnQpIHtcbiAgICAgICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihSdW50aW1lRXJyb3JDb2RlLlVOS05PV05fRUxFTUVOVCwgbWVzc2FnZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKGZvcm1hdFJ1bnRpbWVFcnJvcihSdW50aW1lRXJyb3JDb2RlLlVOS05PV05fRUxFTUVOVCwgbWVzc2FnZSkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFZhbGlkYXRlcyB0aGF0IHRoZSBwcm9wZXJ0eSBvZiB0aGUgZWxlbWVudCBpcyBrbm93biBhdCBydW50aW1lIGFuZCByZXR1cm5zXG4gKiBmYWxzZSBpZiBpdCdzIG5vdCB0aGUgY2FzZS5cbiAqIFRoaXMgY2hlY2sgaXMgcmVsZXZhbnQgZm9yIEpJVC1jb21waWxlZCBjb21wb25lbnRzIChmb3IgQU9ULWNvbXBpbGVkXG4gKiBvbmVzIHRoaXMgY2hlY2sgaGFwcGVucyBhdCBidWlsZCB0aW1lKS5cbiAqXG4gKiBUaGUgcHJvcGVydHkgaXMgY29uc2lkZXJlZCBrbm93biBpZiBlaXRoZXI6XG4gKiAtIGl0J3MgYSBrbm93biBwcm9wZXJ0eSBvZiB0aGUgZWxlbWVudFxuICogLSB0aGUgZWxlbWVudCBpcyBhbGxvd2VkIGJ5IG9uZSBvZiB0aGUgc2NoZW1hc1xuICogLSB0aGUgcHJvcGVydHkgaXMgdXNlZCBmb3IgYW5pbWF0aW9uc1xuICpcbiAqIEBwYXJhbSBlbGVtZW50IEVsZW1lbnQgdG8gdmFsaWRhdGVcbiAqIEBwYXJhbSBwcm9wTmFtZSBOYW1lIG9mIHRoZSBwcm9wZXJ0eSB0byBjaGVja1xuICogQHBhcmFtIHRhZ05hbWUgTmFtZSBvZiB0aGUgdGFnIGhvc3RpbmcgdGhlIHByb3BlcnR5XG4gKiBAcGFyYW0gc2NoZW1hcyBBcnJheSBvZiBzY2hlbWFzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1Byb3BlcnR5VmFsaWQoXG4gIGVsZW1lbnQ6IFJFbGVtZW50IHwgUkNvbW1lbnQsXG4gIHByb3BOYW1lOiBzdHJpbmcsXG4gIHRhZ05hbWU6IHN0cmluZyB8IG51bGwsXG4gIHNjaGVtYXM6IFNjaGVtYU1ldGFkYXRhW10gfCBudWxsLFxuKTogYm9vbGVhbiB7XG4gIC8vIElmIGBzY2hlbWFzYCBpcyBzZXQgdG8gYG51bGxgLCB0aGF0J3MgYW4gaW5kaWNhdGlvbiB0aGF0IHRoaXMgQ29tcG9uZW50IHdhcyBjb21waWxlZCBpbiBBT1RcbiAgLy8gbW9kZSB3aGVyZSB0aGlzIGNoZWNrIGhhcHBlbnMgYXQgY29tcGlsZSB0aW1lLiBJbiBKSVQgbW9kZSwgYHNjaGVtYXNgIGlzIGFsd2F5cyBwcmVzZW50IGFuZFxuICAvLyBkZWZpbmVkIGFzIGFuIGFycmF5IChhcyBhbiBlbXB0eSBhcnJheSBpbiBjYXNlIGBzY2hlbWFzYCBmaWVsZCBpcyBub3QgZGVmaW5lZCkgYW5kIHdlIHNob3VsZFxuICAvLyBleGVjdXRlIHRoZSBjaGVjayBiZWxvdy5cbiAgaWYgKHNjaGVtYXMgPT09IG51bGwpIHJldHVybiB0cnVlO1xuXG4gIC8vIFRoZSBwcm9wZXJ0eSBpcyBjb25zaWRlcmVkIHZhbGlkIGlmIHRoZSBlbGVtZW50IG1hdGNoZXMgdGhlIHNjaGVtYSwgaXQgZXhpc3RzIG9uIHRoZSBlbGVtZW50LFxuICAvLyBvciBpdCBpcyBzeW50aGV0aWMuXG4gIGlmIChtYXRjaGluZ1NjaGVtYXMoc2NoZW1hcywgdGFnTmFtZSkgfHwgcHJvcE5hbWUgaW4gZWxlbWVudCB8fCBpc0FuaW1hdGlvblByb3AocHJvcE5hbWUpKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvLyBOb3RlOiBgdHlwZW9mIE5vZGVgIHJldHVybnMgJ2Z1bmN0aW9uJyBpbiBtb3N0IGJyb3dzZXJzLCBidXQgaXMgdW5kZWZpbmVkIHdpdGggZG9taW5vLlxuICByZXR1cm4gdHlwZW9mIE5vZGUgPT09ICd1bmRlZmluZWQnIHx8IE5vZGUgPT09IG51bGwgfHwgIShlbGVtZW50IGluc3RhbmNlb2YgTm9kZSk7XG59XG5cbi8qKlxuICogTG9ncyBvciB0aHJvd3MgYW4gZXJyb3IgdGhhdCBhIHByb3BlcnR5IGlzIG5vdCBzdXBwb3J0ZWQgb24gYW4gZWxlbWVudC5cbiAqXG4gKiBAcGFyYW0gcHJvcE5hbWUgTmFtZSBvZiB0aGUgaW52YWxpZCBwcm9wZXJ0eVxuICogQHBhcmFtIHRhZ05hbWUgTmFtZSBvZiB0aGUgdGFnIGhvc3RpbmcgdGhlIHByb3BlcnR5XG4gKiBAcGFyYW0gbm9kZVR5cGUgVHlwZSBvZiB0aGUgbm9kZSBob3N0aW5nIHRoZSBwcm9wZXJ0eVxuICogQHBhcmFtIGxWaWV3IEFuIGBMVmlld2AgdGhhdCByZXByZXNlbnRzIGEgY3VycmVudCBjb21wb25lbnRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhhbmRsZVVua25vd25Qcm9wZXJ0eUVycm9yKFxuICBwcm9wTmFtZTogc3RyaW5nLFxuICB0YWdOYW1lOiBzdHJpbmcgfCBudWxsLFxuICBub2RlVHlwZTogVE5vZGVUeXBlLFxuICBsVmlldzogTFZpZXcsXG4pOiB2b2lkIHtcbiAgLy8gU3BlY2lhbC1jYXNlIGEgc2l0dWF0aW9uIHdoZW4gYSBzdHJ1Y3R1cmFsIGRpcmVjdGl2ZSBpcyBhcHBsaWVkIHRvXG4gIC8vIGFuIGA8bmctdGVtcGxhdGU+YCBlbGVtZW50LCBmb3IgZXhhbXBsZTogYDxuZy10ZW1wbGF0ZSAqbmdJZj1cInRydWVcIj5gLlxuICAvLyBJbiB0aGlzIGNhc2UgdGhlIGNvbXBpbGVyIGdlbmVyYXRlcyB0aGUgYMm1ybV0ZW1wbGF0ZWAgaW5zdHJ1Y3Rpb24gd2l0aFxuICAvLyB0aGUgYG51bGxgIGFzIHRoZSB0YWdOYW1lLiBUaGUgZGlyZWN0aXZlIG1hdGNoaW5nIGxvZ2ljIGF0IHJ1bnRpbWUgcmVsaWVzXG4gIC8vIG9uIHRoaXMgZWZmZWN0IChzZWUgYGlzSW5saW5lVGVtcGxhdGVgKSwgdGh1cyB1c2luZyB0aGUgJ25nLXRlbXBsYXRlJyBhc1xuICAvLyBhIGRlZmF1bHQgdmFsdWUgb2YgdGhlIGB0Tm9kZS52YWx1ZWAgaXMgbm90IGZlYXNpYmxlIGF0IHRoaXMgbW9tZW50LlxuICBpZiAoIXRhZ05hbWUgJiYgbm9kZVR5cGUgPT09IFROb2RlVHlwZS5Db250YWluZXIpIHtcbiAgICB0YWdOYW1lID0gJ25nLXRlbXBsYXRlJztcbiAgfVxuXG4gIGNvbnN0IGlzSG9zdFN0YW5kYWxvbmUgPSBpc0hvc3RDb21wb25lbnRTdGFuZGFsb25lKGxWaWV3KTtcbiAgY29uc3QgdGVtcGxhdGVMb2NhdGlvbiA9IGdldFRlbXBsYXRlTG9jYXRpb25EZXRhaWxzKGxWaWV3KTtcblxuICBsZXQgbWVzc2FnZSA9IGBDYW4ndCBiaW5kIHRvICcke3Byb3BOYW1lfScgc2luY2UgaXQgaXNuJ3QgYSBrbm93biBwcm9wZXJ0eSBvZiAnJHt0YWdOYW1lfScke3RlbXBsYXRlTG9jYXRpb259LmA7XG5cbiAgY29uc3Qgc2NoZW1hcyA9IGAnJHtpc0hvc3RTdGFuZGFsb25lID8gJ0BDb21wb25lbnQnIDogJ0BOZ01vZHVsZSd9LnNjaGVtYXMnYDtcbiAgY29uc3QgaW1wb3J0TG9jYXRpb24gPSBpc0hvc3RTdGFuZGFsb25lXG4gICAgPyBcImluY2x1ZGVkIGluIHRoZSAnQENvbXBvbmVudC5pbXBvcnRzJyBvZiB0aGlzIGNvbXBvbmVudFwiXG4gICAgOiAnYSBwYXJ0IG9mIGFuIEBOZ01vZHVsZSB3aGVyZSB0aGlzIGNvbXBvbmVudCBpcyBkZWNsYXJlZCc7XG4gIGlmIChLTk9XTl9DT05UUk9MX0ZMT1dfRElSRUNUSVZFUy5oYXMocHJvcE5hbWUpKSB7XG4gICAgLy8gTW9zdCBsaWtlbHkgdGhpcyBpcyBhIGNvbnRyb2wgZmxvdyBkaXJlY3RpdmUgKHN1Y2ggYXMgYCpuZ0lmYCkgdXNlZCBpblxuICAgIC8vIGEgdGVtcGxhdGUsIGJ1dCB0aGUgZGlyZWN0aXZlIG9yIHRoZSBgQ29tbW9uTW9kdWxlYCBpcyBub3QgaW1wb3J0ZWQuXG4gICAgY29uc3QgY29ycmVzcG9uZGluZ0ltcG9ydCA9IEtOT1dOX0NPTlRST0xfRkxPV19ESVJFQ1RJVkVTLmdldChwcm9wTmFtZSk7XG4gICAgbWVzc2FnZSArPVxuICAgICAgYFxcbklmIHRoZSAnJHtwcm9wTmFtZX0nIGlzIGFuIEFuZ3VsYXIgY29udHJvbCBmbG93IGRpcmVjdGl2ZSwgYCArXG4gICAgICBgcGxlYXNlIG1ha2Ugc3VyZSB0aGF0IGVpdGhlciB0aGUgJyR7Y29ycmVzcG9uZGluZ0ltcG9ydH0nIGRpcmVjdGl2ZSBvciB0aGUgJ0NvbW1vbk1vZHVsZScgaXMgJHtpbXBvcnRMb2NhdGlvbn0uYDtcbiAgfSBlbHNlIHtcbiAgICAvLyBNYXkgYmUgYW4gQW5ndWxhciBjb21wb25lbnQsIHdoaWNoIGlzIG5vdCBpbXBvcnRlZC9kZWNsYXJlZD9cbiAgICBtZXNzYWdlICs9XG4gICAgICBgXFxuMS4gSWYgJyR7dGFnTmFtZX0nIGlzIGFuIEFuZ3VsYXIgY29tcG9uZW50IGFuZCBpdCBoYXMgdGhlIGAgK1xuICAgICAgYCcke3Byb3BOYW1lfScgaW5wdXQsIHRoZW4gdmVyaWZ5IHRoYXQgaXQgaXMgJHtpbXBvcnRMb2NhdGlvbn0uYDtcbiAgICAvLyBNYXkgYmUgYSBXZWIgQ29tcG9uZW50P1xuICAgIGlmICh0YWdOYW1lICYmIHRhZ05hbWUuaW5kZXhPZignLScpID4gLTEpIHtcbiAgICAgIG1lc3NhZ2UgKz1cbiAgICAgICAgYFxcbjIuIElmICcke3RhZ05hbWV9JyBpcyBhIFdlYiBDb21wb25lbnQgdGhlbiBhZGQgJ0NVU1RPTV9FTEVNRU5UU19TQ0hFTUEnIGAgK1xuICAgICAgICBgdG8gdGhlICR7c2NoZW1hc30gb2YgdGhpcyBjb21wb25lbnQgdG8gc3VwcHJlc3MgdGhpcyBtZXNzYWdlLmA7XG4gICAgICBtZXNzYWdlICs9XG4gICAgICAgIGBcXG4zLiBUbyBhbGxvdyBhbnkgcHJvcGVydHkgYWRkICdOT19FUlJPUlNfU0NIRU1BJyB0byBgICtcbiAgICAgICAgYHRoZSAke3NjaGVtYXN9IG9mIHRoaXMgY29tcG9uZW50LmA7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIElmIGl0J3MgZXhwZWN0ZWQsIHRoZSBlcnJvciBjYW4gYmUgc3VwcHJlc3NlZCBieSB0aGUgYE5PX0VSUk9SU19TQ0hFTUFgIHNjaGVtYS5cbiAgICAgIG1lc3NhZ2UgKz1cbiAgICAgICAgYFxcbjIuIFRvIGFsbG93IGFueSBwcm9wZXJ0eSBhZGQgJ05PX0VSUk9SU19TQ0hFTUEnIHRvIGAgK1xuICAgICAgICBgdGhlICR7c2NoZW1hc30gb2YgdGhpcyBjb21wb25lbnQuYDtcbiAgICB9XG4gIH1cblxuICByZXBvcnRVbmtub3duUHJvcGVydHlFcnJvcihtZXNzYWdlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlcG9ydFVua25vd25Qcm9wZXJ0eUVycm9yKG1lc3NhZ2U6IHN0cmluZykge1xuICBpZiAoc2hvdWxkVGhyb3dFcnJvck9uVW5rbm93blByb3BlcnR5KSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihSdW50aW1lRXJyb3JDb2RlLlVOS05PV05fQklORElORywgbWVzc2FnZSk7XG4gIH0gZWxzZSB7XG4gICAgY29uc29sZS5lcnJvcihmb3JtYXRSdW50aW1lRXJyb3IoUnVudGltZUVycm9yQ29kZS5VTktOT1dOX0JJTkRJTkcsIG1lc3NhZ2UpKTtcbiAgfVxufVxuXG4vKipcbiAqIFdBUk5JTkc6IHRoaXMgaXMgYSAqKmRldi1tb2RlIG9ubHkqKiBmdW5jdGlvbiAodGh1cyBzaG91bGQgYWx3YXlzIGJlIGd1YXJkZWQgYnkgdGhlIGBuZ0Rldk1vZGVgKVxuICogYW5kIG11c3QgKipub3QqKiBiZSB1c2VkIGluIHByb2R1Y3Rpb24gYnVuZGxlcy4gVGhlIGZ1bmN0aW9uIG1ha2VzIG1lZ2Ftb3JwaGljIHJlYWRzLCB3aGljaCBtaWdodFxuICogYmUgdG9vIHNsb3cgZm9yIHByb2R1Y3Rpb24gbW9kZSBhbmQgYWxzbyBpdCByZWxpZXMgb24gdGhlIGNvbnN0cnVjdG9yIGZ1bmN0aW9uIGJlaW5nIGF2YWlsYWJsZS5cbiAqXG4gKiBHZXRzIGEgcmVmZXJlbmNlIHRvIHRoZSBob3N0IGNvbXBvbmVudCBkZWYgKHdoZXJlIGEgY3VycmVudCBjb21wb25lbnQgaXMgZGVjbGFyZWQpLlxuICpcbiAqIEBwYXJhbSBsVmlldyBBbiBgTFZpZXdgIHRoYXQgcmVwcmVzZW50cyBhIGN1cnJlbnQgY29tcG9uZW50IHRoYXQgaXMgYmVpbmcgcmVuZGVyZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXREZWNsYXJhdGlvbkNvbXBvbmVudERlZihsVmlldzogTFZpZXcpOiBDb21wb25lbnREZWY8dW5rbm93bj4gfCBudWxsIHtcbiAgIW5nRGV2TW9kZSAmJiB0aHJvd0Vycm9yKCdNdXN0IG5ldmVyIGJlIGNhbGxlZCBpbiBwcm9kdWN0aW9uIG1vZGUnKTtcblxuICBjb25zdCBkZWNsYXJhdGlvbkxWaWV3ID0gbFZpZXdbREVDTEFSQVRJT05fQ09NUE9ORU5UX1ZJRVddIGFzIExWaWV3PFR5cGU8dW5rbm93bj4+O1xuICBjb25zdCBjb250ZXh0ID0gZGVjbGFyYXRpb25MVmlld1tDT05URVhUXTtcblxuICAvLyBVbmFibGUgdG8gb2J0YWluIGEgY29udGV4dC5cbiAgaWYgKCFjb250ZXh0KSByZXR1cm4gbnVsbDtcblxuICByZXR1cm4gY29udGV4dC5jb25zdHJ1Y3RvciA/IGdldENvbXBvbmVudERlZihjb250ZXh0LmNvbnN0cnVjdG9yKSA6IG51bGw7XG59XG5cbi8qKlxuICogV0FSTklORzogdGhpcyBpcyBhICoqZGV2LW1vZGUgb25seSoqIGZ1bmN0aW9uICh0aHVzIHNob3VsZCBhbHdheXMgYmUgZ3VhcmRlZCBieSB0aGUgYG5nRGV2TW9kZWApXG4gKiBhbmQgbXVzdCAqKm5vdCoqIGJlIHVzZWQgaW4gcHJvZHVjdGlvbiBidW5kbGVzLiBUaGUgZnVuY3Rpb24gbWFrZXMgbWVnYW1vcnBoaWMgcmVhZHMsIHdoaWNoIG1pZ2h0XG4gKiBiZSB0b28gc2xvdyBmb3IgcHJvZHVjdGlvbiBtb2RlLlxuICpcbiAqIENoZWNrcyBpZiB0aGUgY3VycmVudCBjb21wb25lbnQgaXMgZGVjbGFyZWQgaW5zaWRlIG9mIGEgc3RhbmRhbG9uZSBjb21wb25lbnQgdGVtcGxhdGUuXG4gKlxuICogQHBhcmFtIGxWaWV3IEFuIGBMVmlld2AgdGhhdCByZXByZXNlbnRzIGEgY3VycmVudCBjb21wb25lbnQgdGhhdCBpcyBiZWluZyByZW5kZXJlZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzSG9zdENvbXBvbmVudFN0YW5kYWxvbmUobFZpZXc6IExWaWV3KTogYm9vbGVhbiB7XG4gICFuZ0Rldk1vZGUgJiYgdGhyb3dFcnJvcignTXVzdCBuZXZlciBiZSBjYWxsZWQgaW4gcHJvZHVjdGlvbiBtb2RlJyk7XG5cbiAgY29uc3QgY29tcG9uZW50RGVmID0gZ2V0RGVjbGFyYXRpb25Db21wb25lbnREZWYobFZpZXcpO1xuICAvLyBUcmVhdCBob3N0IGNvbXBvbmVudCBhcyBub24tc3RhbmRhbG9uZSBpZiB3ZSBjYW4ndCBvYnRhaW4gdGhlIGRlZi5cbiAgcmV0dXJuICEhY29tcG9uZW50RGVmPy5zdGFuZGFsb25lO1xufVxuXG4vKipcbiAqIFdBUk5JTkc6IHRoaXMgaXMgYSAqKmRldi1tb2RlIG9ubHkqKiBmdW5jdGlvbiAodGh1cyBzaG91bGQgYWx3YXlzIGJlIGd1YXJkZWQgYnkgdGhlIGBuZ0Rldk1vZGVgKVxuICogYW5kIG11c3QgKipub3QqKiBiZSB1c2VkIGluIHByb2R1Y3Rpb24gYnVuZGxlcy4gVGhlIGZ1bmN0aW9uIG1ha2VzIG1lZ2Ftb3JwaGljIHJlYWRzLCB3aGljaCBtaWdodFxuICogYmUgdG9vIHNsb3cgZm9yIHByb2R1Y3Rpb24gbW9kZS5cbiAqXG4gKiBDb25zdHJ1Y3RzIGEgc3RyaW5nIGRlc2NyaWJpbmcgdGhlIGxvY2F0aW9uIG9mIHRoZSBob3N0IGNvbXBvbmVudCB0ZW1wbGF0ZS4gVGhlIGZ1bmN0aW9uIGlzIHVzZWRcbiAqIGluIGRldiBtb2RlIHRvIHByb2R1Y2UgZXJyb3IgbWVzc2FnZXMuXG4gKlxuICogQHBhcmFtIGxWaWV3IEFuIGBMVmlld2AgdGhhdCByZXByZXNlbnRzIGEgY3VycmVudCBjb21wb25lbnQgdGhhdCBpcyBiZWluZyByZW5kZXJlZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFRlbXBsYXRlTG9jYXRpb25EZXRhaWxzKGxWaWV3OiBMVmlldyk6IHN0cmluZyB7XG4gICFuZ0Rldk1vZGUgJiYgdGhyb3dFcnJvcignTXVzdCBuZXZlciBiZSBjYWxsZWQgaW4gcHJvZHVjdGlvbiBtb2RlJyk7XG5cbiAgY29uc3QgaG9zdENvbXBvbmVudERlZiA9IGdldERlY2xhcmF0aW9uQ29tcG9uZW50RGVmKGxWaWV3KTtcbiAgY29uc3QgY29tcG9uZW50Q2xhc3NOYW1lID0gaG9zdENvbXBvbmVudERlZj8udHlwZT8ubmFtZTtcbiAgcmV0dXJuIGNvbXBvbmVudENsYXNzTmFtZSA/IGAgKHVzZWQgaW4gdGhlICcke2NvbXBvbmVudENsYXNzTmFtZX0nIGNvbXBvbmVudCB0ZW1wbGF0ZSlgIDogJyc7XG59XG5cbi8qKlxuICogVGhlIHNldCBvZiBrbm93biBjb250cm9sIGZsb3cgZGlyZWN0aXZlcyBhbmQgdGhlaXIgY29ycmVzcG9uZGluZyBpbXBvcnRzLlxuICogV2UgdXNlIHRoaXMgc2V0IHRvIHByb2R1Y2UgYSBtb3JlIHByZWNpc2VzIGVycm9yIG1lc3NhZ2Ugd2l0aCBhIG5vdGVcbiAqIHRoYXQgdGhlIGBDb21tb25Nb2R1bGVgIHNob3VsZCBhbHNvIGJlIGluY2x1ZGVkLlxuICovXG5leHBvcnQgY29uc3QgS05PV05fQ09OVFJPTF9GTE9XX0RJUkVDVElWRVMgPSBuZXcgTWFwKFtcbiAgWyduZ0lmJywgJ05nSWYnXSxcbiAgWyduZ0ZvcicsICdOZ0ZvciddLFxuICBbJ25nU3dpdGNoQ2FzZScsICdOZ1N3aXRjaENhc2UnXSxcbiAgWyduZ1N3aXRjaERlZmF1bHQnLCAnTmdTd2l0Y2hEZWZhdWx0J10sXG5dKTtcbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSB0YWcgbmFtZSBpcyBhbGxvd2VkIGJ5IHNwZWNpZmllZCBzY2hlbWFzLlxuICogQHBhcmFtIHNjaGVtYXMgQXJyYXkgb2Ygc2NoZW1hc1xuICogQHBhcmFtIHRhZ05hbWUgTmFtZSBvZiB0aGUgdGFnXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYXRjaGluZ1NjaGVtYXMoc2NoZW1hczogU2NoZW1hTWV0YWRhdGFbXSB8IG51bGwsIHRhZ05hbWU6IHN0cmluZyB8IG51bGwpOiBib29sZWFuIHtcbiAgaWYgKHNjaGVtYXMgIT09IG51bGwpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNjaGVtYXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHNjaGVtYSA9IHNjaGVtYXNbaV07XG4gICAgICBpZiAoXG4gICAgICAgIHNjaGVtYSA9PT0gTk9fRVJST1JTX1NDSEVNQSB8fFxuICAgICAgICAoc2NoZW1hID09PSBDVVNUT01fRUxFTUVOVFNfU0NIRU1BICYmIHRhZ05hbWUgJiYgdGFnTmFtZS5pbmRleE9mKCctJykgPiAtMSlcbiAgICAgICkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG4iXX0=