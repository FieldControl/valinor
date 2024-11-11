/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { NoopAnimationPlayer } from '@angular/animations';
import { Injectable } from '@angular/core';
import { containsElement, getParentElement, invokeQuery, validateStyleProperty } from './shared';
import * as i0 from "@angular/core";
/**
 * @publicApi
 *
 * `AnimationDriver` implentation for Noop animations
 */
export class NoopAnimationDriver {
    /**
     * @returns Whether `prop` is a valid CSS property
     */
    validateStyleProperty(prop) {
        return validateStyleProperty(prop);
    }
    /**
     *
     * @returns Whether elm1 contains elm2.
     */
    containsElement(elm1, elm2) {
        return containsElement(elm1, elm2);
    }
    /**
     * @returns Rhe parent of the given element or `null` if the element is the `document`
     */
    getParentElement(element) {
        return getParentElement(element);
    }
    /**
     * @returns The result of the query selector on the element. The array will contain up to 1 item
     *     if `multi` is  `false`.
     */
    query(element, selector, multi) {
        return invokeQuery(element, selector, multi);
    }
    /**
     * @returns The `defaultValue` or empty string
     */
    computeStyle(element, prop, defaultValue) {
        return defaultValue || '';
    }
    /**
     * @returns An `NoopAnimationPlayer`
     */
    animate(element, keyframes, duration, delay, easing, previousPlayers = [], scrubberAccessRequested) {
        return new NoopAnimationPlayer(duration, delay);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: NoopAnimationDriver, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: NoopAnimationDriver }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: NoopAnimationDriver, decorators: [{
            type: Injectable
        }] });
/**
 * @publicApi
 */
export class AnimationDriver {
    /**
     * @deprecated Use the NoopAnimationDriver class.
     */
    static { this.NOOP = new NoopAnimationDriver(); }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX2RyaXZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuaW1hdGlvbnMvYnJvd3Nlci9zcmMvcmVuZGVyL2FuaW1hdGlvbl9kcml2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBQ0gsT0FBTyxFQUFrQixtQkFBbUIsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ3pFLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFekMsT0FBTyxFQUFDLGVBQWUsRUFBRSxnQkFBZ0IsRUFBRSxXQUFXLEVBQUUscUJBQXFCLEVBQUMsTUFBTSxVQUFVLENBQUM7O0FBRS9GOzs7O0dBSUc7QUFFSCxNQUFNLE9BQU8sbUJBQW1CO0lBQzlCOztPQUVHO0lBQ0gscUJBQXFCLENBQUMsSUFBWTtRQUNoQyxPQUFPLHFCQUFxQixDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFFRDs7O09BR0c7SUFDSCxlQUFlLENBQUMsSUFBUyxFQUFFLElBQVM7UUFDbEMsT0FBTyxlQUFlLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFFRDs7T0FFRztJQUNILGdCQUFnQixDQUFDLE9BQWdCO1FBQy9CLE9BQU8sZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDbkMsQ0FBQztJQUVEOzs7T0FHRztJQUNILEtBQUssQ0FBQyxPQUFZLEVBQUUsUUFBZ0IsRUFBRSxLQUFjO1FBQ2xELE9BQU8sV0FBVyxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDL0MsQ0FBQztJQUVEOztPQUVHO0lBQ0gsWUFBWSxDQUFDLE9BQVksRUFBRSxJQUFZLEVBQUUsWUFBcUI7UUFDNUQsT0FBTyxZQUFZLElBQUksRUFBRSxDQUFDO0lBQzVCLENBQUM7SUFFRDs7T0FFRztJQUNILE9BQU8sQ0FDTCxPQUFZLEVBQ1osU0FBOEMsRUFDOUMsUUFBZ0IsRUFDaEIsS0FBYSxFQUNiLE1BQWMsRUFDZCxrQkFBeUIsRUFBRSxFQUMzQix1QkFBaUM7UUFFakMsT0FBTyxJQUFJLG1CQUFtQixDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNsRCxDQUFDO3lIQW5EVSxtQkFBbUI7NkhBQW5CLG1CQUFtQjs7c0dBQW5CLG1CQUFtQjtrQkFEL0IsVUFBVTs7QUF1RFg7O0dBRUc7QUFDSCxNQUFNLE9BQWdCLGVBQWU7SUFDbkM7O09BRUc7YUFDSSxTQUFJLEdBQW9DLElBQUksbUJBQW1CLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cbmltcG9ydCB7QW5pbWF0aW9uUGxheWVyLCBOb29wQW5pbWF0aW9uUGxheWVyfSBmcm9tICdAYW5ndWxhci9hbmltYXRpb25zJztcbmltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7Y29udGFpbnNFbGVtZW50LCBnZXRQYXJlbnRFbGVtZW50LCBpbnZva2VRdWVyeSwgdmFsaWRhdGVTdHlsZVByb3BlcnR5fSBmcm9tICcuL3NoYXJlZCc7XG5cbi8qKlxuICogQHB1YmxpY0FwaVxuICpcbiAqIGBBbmltYXRpb25Ecml2ZXJgIGltcGxlbnRhdGlvbiBmb3IgTm9vcCBhbmltYXRpb25zXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBOb29wQW5pbWF0aW9uRHJpdmVyIGltcGxlbWVudHMgQW5pbWF0aW9uRHJpdmVyIHtcbiAgLyoqXG4gICAqIEByZXR1cm5zIFdoZXRoZXIgYHByb3BgIGlzIGEgdmFsaWQgQ1NTIHByb3BlcnR5XG4gICAqL1xuICB2YWxpZGF0ZVN0eWxlUHJvcGVydHkocHJvcDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHZhbGlkYXRlU3R5bGVQcm9wZXJ0eShwcm9wKTtcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKiBAcmV0dXJucyBXaGV0aGVyIGVsbTEgY29udGFpbnMgZWxtMi5cbiAgICovXG4gIGNvbnRhaW5zRWxlbWVudChlbG0xOiBhbnksIGVsbTI6IGFueSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBjb250YWluc0VsZW1lbnQoZWxtMSwgZWxtMik7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybnMgUmhlIHBhcmVudCBvZiB0aGUgZ2l2ZW4gZWxlbWVudCBvciBgbnVsbGAgaWYgdGhlIGVsZW1lbnQgaXMgdGhlIGBkb2N1bWVudGBcbiAgICovXG4gIGdldFBhcmVudEVsZW1lbnQoZWxlbWVudDogdW5rbm93bik6IHVua25vd24ge1xuICAgIHJldHVybiBnZXRQYXJlbnRFbGVtZW50KGVsZW1lbnQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm5zIFRoZSByZXN1bHQgb2YgdGhlIHF1ZXJ5IHNlbGVjdG9yIG9uIHRoZSBlbGVtZW50LiBUaGUgYXJyYXkgd2lsbCBjb250YWluIHVwIHRvIDEgaXRlbVxuICAgKiAgICAgaWYgYG11bHRpYCBpcyAgYGZhbHNlYC5cbiAgICovXG4gIHF1ZXJ5KGVsZW1lbnQ6IGFueSwgc2VsZWN0b3I6IHN0cmluZywgbXVsdGk6IGJvb2xlYW4pOiBhbnlbXSB7XG4gICAgcmV0dXJuIGludm9rZVF1ZXJ5KGVsZW1lbnQsIHNlbGVjdG9yLCBtdWx0aSk7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybnMgVGhlIGBkZWZhdWx0VmFsdWVgIG9yIGVtcHR5IHN0cmluZ1xuICAgKi9cbiAgY29tcHV0ZVN0eWxlKGVsZW1lbnQ6IGFueSwgcHJvcDogc3RyaW5nLCBkZWZhdWx0VmFsdWU/OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBkZWZhdWx0VmFsdWUgfHwgJyc7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybnMgQW4gYE5vb3BBbmltYXRpb25QbGF5ZXJgXG4gICAqL1xuICBhbmltYXRlKFxuICAgIGVsZW1lbnQ6IGFueSxcbiAgICBrZXlmcmFtZXM6IEFycmF5PE1hcDxzdHJpbmcsIHN0cmluZyB8IG51bWJlcj4+LFxuICAgIGR1cmF0aW9uOiBudW1iZXIsXG4gICAgZGVsYXk6IG51bWJlcixcbiAgICBlYXNpbmc6IHN0cmluZyxcbiAgICBwcmV2aW91c1BsYXllcnM6IGFueVtdID0gW10sXG4gICAgc2NydWJiZXJBY2Nlc3NSZXF1ZXN0ZWQ/OiBib29sZWFuLFxuICApOiBBbmltYXRpb25QbGF5ZXIge1xuICAgIHJldHVybiBuZXcgTm9vcEFuaW1hdGlvblBsYXllcihkdXJhdGlvbiwgZGVsYXkpO1xuICB9XG59XG5cbi8qKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQW5pbWF0aW9uRHJpdmVyIHtcbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkIFVzZSB0aGUgTm9vcEFuaW1hdGlvbkRyaXZlciBjbGFzcy5cbiAgICovXG4gIHN0YXRpYyBOT09QOiBBbmltYXRpb25Ecml2ZXIgPSAvKiBAX19QVVJFX18gKi8gbmV3IE5vb3BBbmltYXRpb25Ecml2ZXIoKTtcblxuICBhYnN0cmFjdCB2YWxpZGF0ZVN0eWxlUHJvcGVydHkocHJvcDogc3RyaW5nKTogYm9vbGVhbjtcblxuICBhYnN0cmFjdCB2YWxpZGF0ZUFuaW1hdGFibGVTdHlsZVByb3BlcnR5PzogKHByb3A6IHN0cmluZykgPT4gYm9vbGVhbjtcblxuICBhYnN0cmFjdCBjb250YWluc0VsZW1lbnQoZWxtMTogYW55LCBlbG0yOiBhbnkpOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBPYnRhaW5zIHRoZSBwYXJlbnQgZWxlbWVudCwgaWYgYW55LiBgbnVsbGAgaXMgcmV0dXJuZWQgaWYgdGhlIGVsZW1lbnQgZG9lcyBub3QgaGF2ZSBhIHBhcmVudC5cbiAgICovXG4gIGFic3RyYWN0IGdldFBhcmVudEVsZW1lbnQoZWxlbWVudDogdW5rbm93bik6IHVua25vd247XG5cbiAgYWJzdHJhY3QgcXVlcnkoZWxlbWVudDogYW55LCBzZWxlY3Rvcjogc3RyaW5nLCBtdWx0aTogYm9vbGVhbik6IGFueVtdO1xuXG4gIGFic3RyYWN0IGNvbXB1dGVTdHlsZShlbGVtZW50OiBhbnksIHByb3A6IHN0cmluZywgZGVmYXVsdFZhbHVlPzogc3RyaW5nKTogc3RyaW5nO1xuXG4gIGFic3RyYWN0IGFuaW1hdGUoXG4gICAgZWxlbWVudDogYW55LFxuICAgIGtleWZyYW1lczogQXJyYXk8TWFwPHN0cmluZywgc3RyaW5nIHwgbnVtYmVyPj4sXG4gICAgZHVyYXRpb246IG51bWJlcixcbiAgICBkZWxheTogbnVtYmVyLFxuICAgIGVhc2luZz86IHN0cmluZyB8IG51bGwsXG4gICAgcHJldmlvdXNQbGF5ZXJzPzogYW55W10sXG4gICAgc2NydWJiZXJBY2Nlc3NSZXF1ZXN0ZWQ/OiBib29sZWFuLFxuICApOiBhbnk7XG59XG4iXX0=