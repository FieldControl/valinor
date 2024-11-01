/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ɵɵinjectAttribute } from '../render3/instructions/di_attr';
/**
 * Creates a token that can be used to inject static attributes of the host node.
 *
 * @usageNotes
 * ### Injecting an attribute that is known to exist
 * ```typescript
 * @Directive()
 * class MyDir {
 *   attr: string = inject(new HostAttributeToken('some-attr'));
 * }
 * ```
 *
 * ### Optionally injecting an attribute
 * ```typescript
 * @Directive()
 * class MyDir {
 *   attr: string | null = inject(new HostAttributeToken('some-attr'), {optional: true});
 * }
 * ```
 * @publicApi
 */
export class HostAttributeToken {
    constructor(attributeName) {
        this.attributeName = attributeName;
        /** @internal */
        this.__NG_ELEMENT_ID__ = () => ɵɵinjectAttribute(this.attributeName);
    }
    toString() {
        return `HostAttributeToken ${this.attributeName}`;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG9zdF9hdHRyaWJ1dGVfdG9rZW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9kaS9ob3N0X2F0dHJpYnV0ZV90b2tlbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxpQ0FBaUMsQ0FBQztBQUVsRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FvQkc7QUFDSCxNQUFNLE9BQU8sa0JBQWtCO0lBQzdCLFlBQW9CLGFBQXFCO1FBQXJCLGtCQUFhLEdBQWIsYUFBYSxDQUFRO1FBRXpDLGdCQUFnQjtRQUNoQixzQkFBaUIsR0FBRyxHQUFHLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7SUFIcEIsQ0FBQztJQUs3QyxRQUFRO1FBQ04sT0FBTyxzQkFBc0IsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQ3BELENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qIVxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHvJtcm1aW5qZWN0QXR0cmlidXRlfSBmcm9tICcuLi9yZW5kZXIzL2luc3RydWN0aW9ucy9kaV9hdHRyJztcblxuLyoqXG4gKiBDcmVhdGVzIGEgdG9rZW4gdGhhdCBjYW4gYmUgdXNlZCB0byBpbmplY3Qgc3RhdGljIGF0dHJpYnV0ZXMgb2YgdGhlIGhvc3Qgbm9kZS5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogIyMjIEluamVjdGluZyBhbiBhdHRyaWJ1dGUgdGhhdCBpcyBrbm93biB0byBleGlzdFxuICogYGBgdHlwZXNjcmlwdFxuICogQERpcmVjdGl2ZSgpXG4gKiBjbGFzcyBNeURpciB7XG4gKiAgIGF0dHI6IHN0cmluZyA9IGluamVjdChuZXcgSG9zdEF0dHJpYnV0ZVRva2VuKCdzb21lLWF0dHInKSk7XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiAjIyMgT3B0aW9uYWxseSBpbmplY3RpbmcgYW4gYXR0cmlidXRlXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBARGlyZWN0aXZlKClcbiAqIGNsYXNzIE15RGlyIHtcbiAqICAgYXR0cjogc3RyaW5nIHwgbnVsbCA9IGluamVjdChuZXcgSG9zdEF0dHJpYnV0ZVRva2VuKCdzb21lLWF0dHInKSwge29wdGlvbmFsOiB0cnVlfSk7XG4gKiB9XG4gKiBgYGBcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIEhvc3RBdHRyaWJ1dGVUb2tlbiB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgYXR0cmlidXRlTmFtZTogc3RyaW5nKSB7fVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX19OR19FTEVNRU5UX0lEX18gPSAoKSA9PiDJtcm1aW5qZWN0QXR0cmlidXRlKHRoaXMuYXR0cmlidXRlTmFtZSk7XG5cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYEhvc3RBdHRyaWJ1dGVUb2tlbiAke3RoaXMuYXR0cmlidXRlTmFtZX1gO1xuICB9XG59XG4iXX0=