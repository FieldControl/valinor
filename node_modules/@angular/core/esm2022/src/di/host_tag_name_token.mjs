/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
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
    else if (tNode.type & 128 /* TNodeType.LetDeclaration */) {
        return 'an @let declaration';
    }
    else {
        return 'a node';
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG9zdF90YWdfbmFtZV90b2tlbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL2RpL2hvc3RfdGFnX25hbWVfdG9rZW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFlBQVksRUFBbUIsTUFBTSxXQUFXLENBQUM7QUFFekQsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBRWpELE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNqRCxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFFakQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBb0JHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sYUFBYSxHQUFHLElBQUksY0FBYyxDQUFTLFNBQVMsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUUxRixvRkFBb0Y7QUFDcEYsNkVBQTZFO0FBQzdFLHVEQUF1RDtBQUN0RCxhQUFxQixDQUFDLGlCQUFpQixHQUFHLENBQUMsS0FBa0IsRUFBRSxFQUFFO0lBQ2hFLE1BQU0sS0FBSyxHQUFHLGVBQWUsRUFBRSxDQUFDO0lBQ2hDLElBQUksS0FBSyxLQUFLLElBQUksRUFBRSxDQUFDO1FBQ25CLE1BQU0sSUFBSSxZQUFZLHFEQUVwQixTQUFTO1lBQ1Asa0VBQWtFO2dCQUNoRSxtRkFBbUYsQ0FDeEYsQ0FBQztJQUNKLENBQUM7SUFDRCxJQUFJLEtBQUssQ0FBQyxJQUFJLDRCQUFvQixFQUFFLENBQUM7UUFDbkMsT0FBTyxLQUFLLENBQUMsS0FBSyxDQUFDO0lBQ3JCLENBQUM7SUFDRCxJQUFJLEtBQUssR0FBRyxXQUFXLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDakMsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBQ0QsTUFBTSxJQUFJLFlBQVkscURBRXBCLFNBQVM7UUFDUCw2QkFBNkIsa0JBQWtCLENBQzdDLEtBQUssQ0FDTix3REFBd0Q7WUFDdkQsc0VBQXNFLENBQzNFLENBQUM7QUFDSixDQUFDLENBQUM7QUFFRixTQUFTLGtCQUFrQixDQUFDLEtBQVk7SUFDdEMsSUFBSSxLQUFLLENBQUMsSUFBSSxxQ0FBNkIsRUFBRSxDQUFDO1FBQzVDLE9BQU8sbUJBQW1CLENBQUM7SUFDN0IsQ0FBQztTQUFNLElBQUksS0FBSyxDQUFDLElBQUksOEJBQXNCLEVBQUUsQ0FBQztRQUM1QyxPQUFPLGtCQUFrQixDQUFDO0lBQzVCLENBQUM7U0FBTSxJQUFJLEtBQUssQ0FBQyxJQUFJLHFDQUEyQixFQUFFLENBQUM7UUFDakQsT0FBTyxxQkFBcUIsQ0FBQztJQUMvQixDQUFDO1NBQU0sQ0FBQztRQUNOLE9BQU8sUUFBUSxDQUFDO0lBQ2xCLENBQUM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1J1bnRpbWVFcnJvciwgUnVudGltZUVycm9yQ29kZX0gZnJvbSAnLi4vZXJyb3JzJztcbmltcG9ydCB7VE5vZGUsIFROb2RlVHlwZX0gZnJvbSAnLi4vcmVuZGVyMy9pbnRlcmZhY2VzL25vZGUnO1xuaW1wb3J0IHtnZXRDdXJyZW50VE5vZGV9IGZyb20gJy4uL3JlbmRlcjMvc3RhdGUnO1xuXG5pbXBvcnQge0luamVjdGlvblRva2VufSBmcm9tICcuL2luamVjdGlvbl90b2tlbic7XG5pbXBvcnQge0luamVjdEZsYWdzfSBmcm9tICcuL2ludGVyZmFjZS9pbmplY3Rvcic7XG5cbi8qKlxuICogQSB0b2tlbiB0aGF0IGNhbiBiZSB1c2VkIHRvIGluamVjdCB0aGUgdGFnIG5hbWUgb2YgdGhlIGhvc3Qgbm9kZS5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogIyMjIEluamVjdGluZyBhIHRhZyBuYW1lIHRoYXQgaXMga25vd24gdG8gZXhpc3RcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIEBEaXJlY3RpdmUoKVxuICogY2xhc3MgTXlEaXIge1xuICogICB0YWdOYW1lOiBzdHJpbmcgPSBpbmplY3QoSE9TVF9UQUdfTkFNRSk7XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiAjIyMgT3B0aW9uYWxseSBpbmplY3RpbmcgYSB0YWcgbmFtZVxuICogYGBgdHlwZXNjcmlwdFxuICogQERpcmVjdGl2ZSgpXG4gKiBjbGFzcyBNeURpciB7XG4gKiAgIHRhZ05hbWU6IHN0cmluZyB8IG51bGwgPSBpbmplY3QoSE9TVF9UQUdfTkFNRSwge29wdGlvbmFsOiB0cnVlfSk7XG4gKiB9XG4gKiBgYGBcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNvbnN0IEhPU1RfVEFHX05BTUUgPSBuZXcgSW5qZWN0aW9uVG9rZW48c3RyaW5nPihuZ0Rldk1vZGUgPyAnSE9TVF9UQUdfTkFNRScgOiAnJyk7XG5cbi8vIEhPU1RfVEFHX05BTUUgc2hvdWxkIGJlIHJlc29sdmVkIGF0IHRoZSBjdXJyZW50IG5vZGUsIHNpbWlsYXIgdG8gZS5nLiBFbGVtZW50UmVmLFxuLy8gc28gd2UgbWFudWFsbHkgc3BlY2lmeSBfX05HX0VMRU1FTlRfSURfXyBoZXJlLCBpbnN0ZWFkIG9mIHVzaW5nIGEgZmFjdG9yeS5cbi8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby10b3BsZXZlbC1wcm9wZXJ0eS1hY2Nlc3NcbihIT1NUX1RBR19OQU1FIGFzIGFueSkuX19OR19FTEVNRU5UX0lEX18gPSAoZmxhZ3M6IEluamVjdEZsYWdzKSA9PiB7XG4gIGNvbnN0IHROb2RlID0gZ2V0Q3VycmVudFROb2RlKCk7XG4gIGlmICh0Tm9kZSA9PT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5KRUNUSU9OX1RPS0VOLFxuICAgICAgbmdEZXZNb2RlICYmXG4gICAgICAgICdIT1NUX1RBR19OQU1FIGNhbiBvbmx5IGJlIGluamVjdGVkIGluIGRpcmVjdGl2ZXMgYW5kIGNvbXBvbmVudHMgJyArXG4gICAgICAgICAgJ2R1cmluZyBjb25zdHJ1Y3Rpb24gdGltZSAoaW4gYSBjbGFzcyBjb25zdHJ1Y3RvciBvciBhcyBhIGNsYXNzIGZpZWxkIGluaXRpYWxpemVyKScsXG4gICAgKTtcbiAgfVxuICBpZiAodE5vZGUudHlwZSAmIFROb2RlVHlwZS5FbGVtZW50KSB7XG4gICAgcmV0dXJuIHROb2RlLnZhbHVlO1xuICB9XG4gIGlmIChmbGFncyAmIEluamVjdEZsYWdzLk9wdGlvbmFsKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5KRUNUSU9OX1RPS0VOLFxuICAgIG5nRGV2TW9kZSAmJlxuICAgICAgYEhPU1RfVEFHX05BTUUgd2FzIHVzZWQgb24gJHtnZXREZXZNb2RlTm9kZU5hbWUoXG4gICAgICAgIHROb2RlLFxuICAgICAgKX0gd2hpY2ggZG9lc24ndCBoYXZlIGFuIHVuZGVybHlpbmcgZWxlbWVudCBpbiB0aGUgRE9NLiBgICtcbiAgICAgICAgYFRoaXMgaXMgaW52YWxpZCwgYW5kIHNvIHRoZSBkZXBlbmRlbmN5IHNob3VsZCBiZSBtYXJrZWQgYXMgb3B0aW9uYWwuYCxcbiAgKTtcbn07XG5cbmZ1bmN0aW9uIGdldERldk1vZGVOb2RlTmFtZSh0Tm9kZTogVE5vZGUpIHtcbiAgaWYgKHROb2RlLnR5cGUgJiBUTm9kZVR5cGUuRWxlbWVudENvbnRhaW5lcikge1xuICAgIHJldHVybiAnYW4gPG5nLWNvbnRhaW5lcj4nO1xuICB9IGVsc2UgaWYgKHROb2RlLnR5cGUgJiBUTm9kZVR5cGUuQ29udGFpbmVyKSB7XG4gICAgcmV0dXJuICdhbiA8bmctdGVtcGxhdGU+JztcbiAgfSBlbHNlIGlmICh0Tm9kZS50eXBlICYgVE5vZGVUeXBlLkxldERlY2xhcmF0aW9uKSB7XG4gICAgcmV0dXJuICdhbiBAbGV0IGRlY2xhcmF0aW9uJztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gJ2Egbm9kZSc7XG4gIH1cbn1cbiJdfQ==