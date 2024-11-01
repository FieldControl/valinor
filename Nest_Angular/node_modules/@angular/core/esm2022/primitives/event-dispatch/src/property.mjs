/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/** All properties that are used by jsaction. */
export const Property = {
    /**
     * The parsed value of the jsaction attribute is stored in this
     * property on the DOM node. The parsed value is an Object. The
     * property names of the object are the events; the values are the
     * names of the actions. This property is attached even on nodes
     * that don't have a jsaction attribute as an optimization, because
     * property lookup is faster than attribute access.
     */
    JSACTION: '__jsaction',
    /**
     * The owner property references an a logical owner for a DOM node. JSAction
     * will follow this reference instead of parentNode when traversing the DOM
     * to find jsaction attributes. This allows overlaying a logical structure
     * over a document where the DOM structure can't reflect that structure.
     */
    OWNER: '__owner',
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvcGVydHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3ByaW1pdGl2ZXMvZXZlbnQtZGlzcGF0Y2gvc3JjL3Byb3BlcnR5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILGdEQUFnRDtBQUNoRCxNQUFNLENBQUMsTUFBTSxRQUFRLEdBQUc7SUFDdEI7Ozs7Ozs7T0FPRztJQUNILFFBQVEsRUFBRSxZQUFxQjtJQUMvQjs7Ozs7T0FLRztJQUNILEtBQUssRUFBRSxTQUFrQjtDQUMxQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG4vKiogQWxsIHByb3BlcnRpZXMgdGhhdCBhcmUgdXNlZCBieSBqc2FjdGlvbi4gKi9cbmV4cG9ydCBjb25zdCBQcm9wZXJ0eSA9IHtcbiAgLyoqXG4gICAqIFRoZSBwYXJzZWQgdmFsdWUgb2YgdGhlIGpzYWN0aW9uIGF0dHJpYnV0ZSBpcyBzdG9yZWQgaW4gdGhpc1xuICAgKiBwcm9wZXJ0eSBvbiB0aGUgRE9NIG5vZGUuIFRoZSBwYXJzZWQgdmFsdWUgaXMgYW4gT2JqZWN0LiBUaGVcbiAgICogcHJvcGVydHkgbmFtZXMgb2YgdGhlIG9iamVjdCBhcmUgdGhlIGV2ZW50czsgdGhlIHZhbHVlcyBhcmUgdGhlXG4gICAqIG5hbWVzIG9mIHRoZSBhY3Rpb25zLiBUaGlzIHByb3BlcnR5IGlzIGF0dGFjaGVkIGV2ZW4gb24gbm9kZXNcbiAgICogdGhhdCBkb24ndCBoYXZlIGEganNhY3Rpb24gYXR0cmlidXRlIGFzIGFuIG9wdGltaXphdGlvbiwgYmVjYXVzZVxuICAgKiBwcm9wZXJ0eSBsb29rdXAgaXMgZmFzdGVyIHRoYW4gYXR0cmlidXRlIGFjY2Vzcy5cbiAgICovXG4gIEpTQUNUSU9OOiAnX19qc2FjdGlvbicgYXMgY29uc3QsXG4gIC8qKlxuICAgKiBUaGUgb3duZXIgcHJvcGVydHkgcmVmZXJlbmNlcyBhbiBhIGxvZ2ljYWwgb3duZXIgZm9yIGEgRE9NIG5vZGUuIEpTQWN0aW9uXG4gICAqIHdpbGwgZm9sbG93IHRoaXMgcmVmZXJlbmNlIGluc3RlYWQgb2YgcGFyZW50Tm9kZSB3aGVuIHRyYXZlcnNpbmcgdGhlIERPTVxuICAgKiB0byBmaW5kIGpzYWN0aW9uIGF0dHJpYnV0ZXMuIFRoaXMgYWxsb3dzIG92ZXJsYXlpbmcgYSBsb2dpY2FsIHN0cnVjdHVyZVxuICAgKiBvdmVyIGEgZG9jdW1lbnQgd2hlcmUgdGhlIERPTSBzdHJ1Y3R1cmUgY2FuJ3QgcmVmbGVjdCB0aGF0IHN0cnVjdHVyZS5cbiAgICovXG4gIE9XTkVSOiAnX19vd25lcicgYXMgY29uc3QsXG59O1xuXG5kZWNsYXJlIGdsb2JhbCB7XG4gIGludGVyZmFjZSBOb2RlIHtcbiAgICBbUHJvcGVydHkuSlNBQ1RJT05dPzoge1trZXk6IHN0cmluZ106IHN0cmluZyB8IHVuZGVmaW5lZH07XG4gICAgW1Byb3BlcnR5Lk9XTkVSXT86IFBhcmVudE5vZGU7XG4gIH1cbn1cbiJdfQ==