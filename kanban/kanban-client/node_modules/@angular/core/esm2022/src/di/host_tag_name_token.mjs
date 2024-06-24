/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { RuntimeError } from '../errors';
import { getCurrentTNode } from '../render3/state';
import { InjectionToken } from './injection_token';
import { InjectFlags } from './interface/injector';
/**
 * A token that can be used to inject the tag name of the host node.
 *
 * @usageNotes
 * ### Injecting a tag name that is known to exist
 * ```typescript
 * @Directive()
 * class MyDir {
 *   tagName: string = inject(HOST_TAG_NAME);
 * }
 * ```
 *
 * ### Optionally injecting a tag name
 * ```typescript
 * @Directive()
 * class MyDir {
 *   tagName: string | null = inject(HOST_TAG_NAME, {optional: true});
 * }
 * ```
 * @publicApi
 */
export const HOST_TAG_NAME = new InjectionToken(ngDevMode ? 'HOST_TAG_NAME' : '');
// HOST_TAG_NAME should be resolved at the current node, similar to e.g. ElementRef,
// so we manually specify __NG_ELEMENT_ID__ here, instead of using a factory.
// tslint:disable-next-line:no-toplevel-property-access
HOST_TAG_NAME.__NG_ELEMENT_ID__ = (flags) => {
    const tNode = getCurrentTNode();
    if (tNode === null) {
        throw new RuntimeError(204 /* RuntimeErrorCode.INVALID_INJECTION_TOKEN */, ngDevMode &&
            'HOST_TAG_NAME can only be injected in directives and components ' +
                'during construction time (in a class constructor or as a class field initializer)');
    }
    if (tNode.type & 2 /* TNodeType.Element */) {
        return tNode.value;
    }
    if (flags & InjectFlags.Optional) {
        return null;
    }
    throw new RuntimeError(204 /* RuntimeErrorCode.INVALID_INJECTION_TOKEN */, ngDevMode &&
        `HOST_TAG_NAME was used on ${getDevModeNodeName(tNode)} which doesn't have an underlying element in the DOM. ` +
            `This is invalid, and so the dependency should be marked as optional.`);
};
function getDevModeNodeName(tNode) {
    if (tNode.type & 8 /* TNodeType.ElementContainer */) {
        return 'an <ng-container>';
    }
    else if (tNode.type & 4 /* TNodeType.Container */) {
        return 'an <ng-template>';
    }
    else {
        return 'a node';
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG9zdF90YWdfbmFtZV90b2tlbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL2RpL2hvc3RfdGFnX25hbWVfdG9rZW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFlBQVksRUFBbUIsTUFBTSxXQUFXLENBQUM7QUFFekQsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBRWpELE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNqRCxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFFakQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBb0JHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sYUFBYSxHQUFHLElBQUksY0FBYyxDQUFTLFNBQVMsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUUxRixvRkFBb0Y7QUFDcEYsNkVBQTZFO0FBQzdFLHVEQUF1RDtBQUN0RCxhQUFxQixDQUFDLGlCQUFpQixHQUFHLENBQUMsS0FBa0IsRUFBRSxFQUFFO0lBQ2hFLE1BQU0sS0FBSyxHQUFHLGVBQWUsRUFBRSxDQUFDO0lBQ2hDLElBQUksS0FBSyxLQUFLLElBQUksRUFBRSxDQUFDO1FBQ25CLE1BQU0sSUFBSSxZQUFZLHFEQUVwQixTQUFTO1lBQ1Asa0VBQWtFO2dCQUNoRSxtRkFBbUYsQ0FDeEYsQ0FBQztJQUNKLENBQUM7SUFDRCxJQUFJLEtBQUssQ0FBQyxJQUFJLDRCQUFvQixFQUFFLENBQUM7UUFDbkMsT0FBTyxLQUFLLENBQUMsS0FBSyxDQUFDO0lBQ3JCLENBQUM7SUFDRCxJQUFJLEtBQUssR0FBRyxXQUFXLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDakMsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBQ0QsTUFBTSxJQUFJLFlBQVkscURBRXBCLFNBQVM7UUFDUCw2QkFBNkIsa0JBQWtCLENBQzdDLEtBQUssQ0FDTix3REFBd0Q7WUFDdkQsc0VBQXNFLENBQzNFLENBQUM7QUFDSixDQUFDLENBQUM7QUFFRixTQUFTLGtCQUFrQixDQUFDLEtBQVk7SUFDdEMsSUFBSSxLQUFLLENBQUMsSUFBSSxxQ0FBNkIsRUFBRSxDQUFDO1FBQzVDLE9BQU8sbUJBQW1CLENBQUM7SUFDN0IsQ0FBQztTQUFNLElBQUksS0FBSyxDQUFDLElBQUksOEJBQXNCLEVBQUUsQ0FBQztRQUM1QyxPQUFPLGtCQUFrQixDQUFDO0lBQzVCLENBQUM7U0FBTSxDQUFDO1FBQ04sT0FBTyxRQUFRLENBQUM7SUFDbEIsQ0FBQztBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtSdW50aW1lRXJyb3IsIFJ1bnRpbWVFcnJvckNvZGV9IGZyb20gJy4uL2Vycm9ycyc7XG5pbXBvcnQge1ROb2RlLCBUTm9kZVR5cGV9IGZyb20gJy4uL3JlbmRlcjMvaW50ZXJmYWNlcy9ub2RlJztcbmltcG9ydCB7Z2V0Q3VycmVudFROb2RlfSBmcm9tICcuLi9yZW5kZXIzL3N0YXRlJztcblxuaW1wb3J0IHtJbmplY3Rpb25Ub2tlbn0gZnJvbSAnLi9pbmplY3Rpb25fdG9rZW4nO1xuaW1wb3J0IHtJbmplY3RGbGFnc30gZnJvbSAnLi9pbnRlcmZhY2UvaW5qZWN0b3InO1xuXG4vKipcbiAqIEEgdG9rZW4gdGhhdCBjYW4gYmUgdXNlZCB0byBpbmplY3QgdGhlIHRhZyBuYW1lIG9mIHRoZSBob3N0IG5vZGUuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqICMjIyBJbmplY3RpbmcgYSB0YWcgbmFtZSB0aGF0IGlzIGtub3duIHRvIGV4aXN0XG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBARGlyZWN0aXZlKClcbiAqIGNsYXNzIE15RGlyIHtcbiAqICAgdGFnTmFtZTogc3RyaW5nID0gaW5qZWN0KEhPU1RfVEFHX05BTUUpO1xuICogfVxuICogYGBgXG4gKlxuICogIyMjIE9wdGlvbmFsbHkgaW5qZWN0aW5nIGEgdGFnIG5hbWVcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIEBEaXJlY3RpdmUoKVxuICogY2xhc3MgTXlEaXIge1xuICogICB0YWdOYW1lOiBzdHJpbmcgfCBudWxsID0gaW5qZWN0KEhPU1RfVEFHX05BTUUsIHtvcHRpb25hbDogdHJ1ZX0pO1xuICogfVxuICogYGBgXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjb25zdCBIT1NUX1RBR19OQU1FID0gbmV3IEluamVjdGlvblRva2VuPHN0cmluZz4obmdEZXZNb2RlID8gJ0hPU1RfVEFHX05BTUUnIDogJycpO1xuXG4vLyBIT1NUX1RBR19OQU1FIHNob3VsZCBiZSByZXNvbHZlZCBhdCB0aGUgY3VycmVudCBub2RlLCBzaW1pbGFyIHRvIGUuZy4gRWxlbWVudFJlZixcbi8vIHNvIHdlIG1hbnVhbGx5IHNwZWNpZnkgX19OR19FTEVNRU5UX0lEX18gaGVyZSwgaW5zdGVhZCBvZiB1c2luZyBhIGZhY3RvcnkuXG4vLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tdG9wbGV2ZWwtcHJvcGVydHktYWNjZXNzXG4oSE9TVF9UQUdfTkFNRSBhcyBhbnkpLl9fTkdfRUxFTUVOVF9JRF9fID0gKGZsYWdzOiBJbmplY3RGbGFncykgPT4ge1xuICBjb25zdCB0Tm9kZSA9IGdldEN1cnJlbnRUTm9kZSgpO1xuICBpZiAodE5vZGUgPT09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOSkVDVElPTl9UT0tFTixcbiAgICAgIG5nRGV2TW9kZSAmJlxuICAgICAgICAnSE9TVF9UQUdfTkFNRSBjYW4gb25seSBiZSBpbmplY3RlZCBpbiBkaXJlY3RpdmVzIGFuZCBjb21wb25lbnRzICcgK1xuICAgICAgICAgICdkdXJpbmcgY29uc3RydWN0aW9uIHRpbWUgKGluIGEgY2xhc3MgY29uc3RydWN0b3Igb3IgYXMgYSBjbGFzcyBmaWVsZCBpbml0aWFsaXplciknLFxuICAgICk7XG4gIH1cbiAgaWYgKHROb2RlLnR5cGUgJiBUTm9kZVR5cGUuRWxlbWVudCkge1xuICAgIHJldHVybiB0Tm9kZS52YWx1ZTtcbiAgfVxuICBpZiAoZmxhZ3MgJiBJbmplY3RGbGFncy5PcHRpb25hbCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOSkVDVElPTl9UT0tFTixcbiAgICBuZ0Rldk1vZGUgJiZcbiAgICAgIGBIT1NUX1RBR19OQU1FIHdhcyB1c2VkIG9uICR7Z2V0RGV2TW9kZU5vZGVOYW1lKFxuICAgICAgICB0Tm9kZSxcbiAgICAgICl9IHdoaWNoIGRvZXNuJ3QgaGF2ZSBhbiB1bmRlcmx5aW5nIGVsZW1lbnQgaW4gdGhlIERPTS4gYCArXG4gICAgICAgIGBUaGlzIGlzIGludmFsaWQsIGFuZCBzbyB0aGUgZGVwZW5kZW5jeSBzaG91bGQgYmUgbWFya2VkIGFzIG9wdGlvbmFsLmAsXG4gICk7XG59O1xuXG5mdW5jdGlvbiBnZXREZXZNb2RlTm9kZU5hbWUodE5vZGU6IFROb2RlKSB7XG4gIGlmICh0Tm9kZS50eXBlICYgVE5vZGVUeXBlLkVsZW1lbnRDb250YWluZXIpIHtcbiAgICByZXR1cm4gJ2FuIDxuZy1jb250YWluZXI+JztcbiAgfSBlbHNlIGlmICh0Tm9kZS50eXBlICYgVE5vZGVUeXBlLkNvbnRhaW5lcikge1xuICAgIHJldHVybiAnYW4gPG5nLXRlbXBsYXRlPic7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuICdhIG5vZGUnO1xuICB9XG59XG4iXX0=