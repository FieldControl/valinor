/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { DEHYDRATED_VIEWS } from '../render3/interfaces/container';
import { removeDehydratedViews } from './cleanup';
import { MULTIPLIER, NUM_ROOT_NODES, TEMPLATE_ID, } from './interfaces';
import { siblingAfter } from './node_lookup_utils';
/**
 * Given a current DOM node and a serialized information about the views
 * in a container, walks over the DOM structure, collecting the list of
 * dehydrated views.
 */
export function locateDehydratedViewsInContainer(currentRNode, serializedViews) {
    const dehydratedViews = [];
    for (const serializedView of serializedViews) {
        // Repeats a view multiple times as needed, based on the serialized information
        // (for example, for *ngFor-produced views).
        for (let i = 0; i < (serializedView[MULTIPLIER] ?? 1); i++) {
            const view = {
                data: serializedView,
                firstChild: null,
            };
            if (serializedView[NUM_ROOT_NODES] > 0) {
                // Keep reference to the first node in this view,
                // so it can be accessed while invoking template instructions.
                view.firstChild = currentRNode;
                // Move over to the next node after this view, which can
                // either be a first node of the next view or an anchor comment
                // node after the last view in a container.
                currentRNode = siblingAfter(serializedView[NUM_ROOT_NODES], currentRNode);
            }
            dehydratedViews.push(view);
        }
    }
    return [currentRNode, dehydratedViews];
}
/**
 * Reference to a function that searches for a matching dehydrated views
 * stored on a given lContainer.
 * Returns `null` by default, when hydration is not enabled.
 */
let _findMatchingDehydratedViewImpl = () => null;
/**
 * Retrieves the next dehydrated view from the LContainer and verifies that
 * it matches a given template id (from the TView that was used to create this
 * instance of a view). If the id doesn't match, that means that we are in an
 * unexpected state and can not complete the reconciliation process. Thus,
 * all dehydrated views from this LContainer are removed (including corresponding
 * DOM nodes) and the rendering is performed as if there were no dehydrated views
 * in this container.
 */
function findMatchingDehydratedViewImpl(lContainer, template) {
    const views = lContainer[DEHYDRATED_VIEWS];
    if (!template || views === null || views.length === 0) {
        return null;
    }
    const view = views[0];
    // Verify whether the first dehydrated view in the container matches
    // the template id passed to this function (that originated from a TView
    // that was used to create an instance of an embedded or component views.
    if (view.data[TEMPLATE_ID] === template) {
        // If the template id matches - extract the first view and return it.
        return views.shift();
    }
    else {
        // Otherwise, we are at the state when reconciliation can not be completed,
        // thus we remove all dehydrated views within this container (remove them
        // from internal data structures as well as delete associated elements from
        // the DOM tree).
        removeDehydratedViews(lContainer);
        return null;
    }
}
export function enableFindMatchingDehydratedViewImpl() {
    _findMatchingDehydratedViewImpl = findMatchingDehydratedViewImpl;
}
export function findMatchingDehydratedView(lContainer, template) {
    return _findMatchingDehydratedViewImpl(lContainer, template);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9oeWRyYXRpb24vdmlld3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGdCQUFnQixFQUFhLE1BQU0saUNBQWlDLENBQUM7QUFHN0UsT0FBTyxFQUFDLHFCQUFxQixFQUFDLE1BQU0sV0FBVyxDQUFDO0FBQ2hELE9BQU8sRUFFTCxVQUFVLEVBQ1YsY0FBYyxFQUVkLFdBQVcsR0FDWixNQUFNLGNBQWMsQ0FBQztBQUN0QixPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFFakQ7Ozs7R0FJRztBQUNILE1BQU0sVUFBVSxnQ0FBZ0MsQ0FDOUMsWUFBbUIsRUFDbkIsZUFBMEM7SUFFMUMsTUFBTSxlQUFlLEdBQThCLEVBQUUsQ0FBQztJQUN0RCxLQUFLLE1BQU0sY0FBYyxJQUFJLGVBQWUsRUFBRSxDQUFDO1FBQzdDLCtFQUErRTtRQUMvRSw0Q0FBNEM7UUFDNUMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDM0QsTUFBTSxJQUFJLEdBQTRCO2dCQUNwQyxJQUFJLEVBQUUsY0FBYztnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakIsQ0FBQztZQUNGLElBQUksY0FBYyxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUN2QyxpREFBaUQ7Z0JBQ2pELDhEQUE4RDtnQkFDOUQsSUFBSSxDQUFDLFVBQVUsR0FBRyxZQUEyQixDQUFDO2dCQUU5Qyx3REFBd0Q7Z0JBQ3hELCtEQUErRDtnQkFDL0QsMkNBQTJDO2dCQUMzQyxZQUFZLEdBQUcsWUFBWSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsRUFBRSxZQUFZLENBQUUsQ0FBQztZQUM3RSxDQUFDO1lBQ0QsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM3QixDQUFDO0lBQ0gsQ0FBQztJQUVELE9BQU8sQ0FBQyxZQUFZLEVBQUUsZUFBZSxDQUFDLENBQUM7QUFDekMsQ0FBQztBQUVEOzs7O0dBSUc7QUFDSCxJQUFJLCtCQUErQixHQUEwQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUM7QUFFeEY7Ozs7Ozs7O0dBUUc7QUFDSCxTQUFTLDhCQUE4QixDQUNyQyxVQUFzQixFQUN0QixRQUF1QjtJQUV2QixNQUFNLEtBQUssR0FBRyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUMzQyxJQUFJLENBQUMsUUFBUSxJQUFJLEtBQUssS0FBSyxJQUFJLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUN0RCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFDRCxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdEIsb0VBQW9FO0lBQ3BFLHdFQUF3RTtJQUN4RSx5RUFBeUU7SUFDekUsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLFFBQVEsRUFBRSxDQUFDO1FBQ3hDLHFFQUFxRTtRQUNyRSxPQUFPLEtBQUssQ0FBQyxLQUFLLEVBQUcsQ0FBQztJQUN4QixDQUFDO1NBQU0sQ0FBQztRQUNOLDJFQUEyRTtRQUMzRSx5RUFBeUU7UUFDekUsMkVBQTJFO1FBQzNFLGlCQUFpQjtRQUNqQixxQkFBcUIsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNsQyxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7QUFDSCxDQUFDO0FBRUQsTUFBTSxVQUFVLG9DQUFvQztJQUNsRCwrQkFBK0IsR0FBRyw4QkFBOEIsQ0FBQztBQUNuRSxDQUFDO0FBRUQsTUFBTSxVQUFVLDBCQUEwQixDQUN4QyxVQUFzQixFQUN0QixRQUF1QjtJQUV2QixPQUFPLCtCQUErQixDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUMvRCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RFSFlEUkFURURfVklFV1MsIExDb250YWluZXJ9IGZyb20gJy4uL3JlbmRlcjMvaW50ZXJmYWNlcy9jb250YWluZXInO1xuaW1wb3J0IHtSTm9kZX0gZnJvbSAnLi4vcmVuZGVyMy9pbnRlcmZhY2VzL3JlbmRlcmVyX2RvbSc7XG5cbmltcG9ydCB7cmVtb3ZlRGVoeWRyYXRlZFZpZXdzfSBmcm9tICcuL2NsZWFudXAnO1xuaW1wb3J0IHtcbiAgRGVoeWRyYXRlZENvbnRhaW5lclZpZXcsXG4gIE1VTFRJUExJRVIsXG4gIE5VTV9ST09UX05PREVTLFxuICBTZXJpYWxpemVkQ29udGFpbmVyVmlldyxcbiAgVEVNUExBVEVfSUQsXG59IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5pbXBvcnQge3NpYmxpbmdBZnRlcn0gZnJvbSAnLi9ub2RlX2xvb2t1cF91dGlscyc7XG5cbi8qKlxuICogR2l2ZW4gYSBjdXJyZW50IERPTSBub2RlIGFuZCBhIHNlcmlhbGl6ZWQgaW5mb3JtYXRpb24gYWJvdXQgdGhlIHZpZXdzXG4gKiBpbiBhIGNvbnRhaW5lciwgd2Fsa3Mgb3ZlciB0aGUgRE9NIHN0cnVjdHVyZSwgY29sbGVjdGluZyB0aGUgbGlzdCBvZlxuICogZGVoeWRyYXRlZCB2aWV3cy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxvY2F0ZURlaHlkcmF0ZWRWaWV3c0luQ29udGFpbmVyKFxuICBjdXJyZW50Uk5vZGU6IFJOb2RlLFxuICBzZXJpYWxpemVkVmlld3M6IFNlcmlhbGl6ZWRDb250YWluZXJWaWV3W10sXG4pOiBbUk5vZGUsIERlaHlkcmF0ZWRDb250YWluZXJWaWV3W11dIHtcbiAgY29uc3QgZGVoeWRyYXRlZFZpZXdzOiBEZWh5ZHJhdGVkQ29udGFpbmVyVmlld1tdID0gW107XG4gIGZvciAoY29uc3Qgc2VyaWFsaXplZFZpZXcgb2Ygc2VyaWFsaXplZFZpZXdzKSB7XG4gICAgLy8gUmVwZWF0cyBhIHZpZXcgbXVsdGlwbGUgdGltZXMgYXMgbmVlZGVkLCBiYXNlZCBvbiB0aGUgc2VyaWFsaXplZCBpbmZvcm1hdGlvblxuICAgIC8vIChmb3IgZXhhbXBsZSwgZm9yICpuZ0Zvci1wcm9kdWNlZCB2aWV3cykuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAoc2VyaWFsaXplZFZpZXdbTVVMVElQTElFUl0gPz8gMSk7IGkrKykge1xuICAgICAgY29uc3QgdmlldzogRGVoeWRyYXRlZENvbnRhaW5lclZpZXcgPSB7XG4gICAgICAgIGRhdGE6IHNlcmlhbGl6ZWRWaWV3LFxuICAgICAgICBmaXJzdENoaWxkOiBudWxsLFxuICAgICAgfTtcbiAgICAgIGlmIChzZXJpYWxpemVkVmlld1tOVU1fUk9PVF9OT0RFU10gPiAwKSB7XG4gICAgICAgIC8vIEtlZXAgcmVmZXJlbmNlIHRvIHRoZSBmaXJzdCBub2RlIGluIHRoaXMgdmlldyxcbiAgICAgICAgLy8gc28gaXQgY2FuIGJlIGFjY2Vzc2VkIHdoaWxlIGludm9raW5nIHRlbXBsYXRlIGluc3RydWN0aW9ucy5cbiAgICAgICAgdmlldy5maXJzdENoaWxkID0gY3VycmVudFJOb2RlIGFzIEhUTUxFbGVtZW50O1xuXG4gICAgICAgIC8vIE1vdmUgb3ZlciB0byB0aGUgbmV4dCBub2RlIGFmdGVyIHRoaXMgdmlldywgd2hpY2ggY2FuXG4gICAgICAgIC8vIGVpdGhlciBiZSBhIGZpcnN0IG5vZGUgb2YgdGhlIG5leHQgdmlldyBvciBhbiBhbmNob3IgY29tbWVudFxuICAgICAgICAvLyBub2RlIGFmdGVyIHRoZSBsYXN0IHZpZXcgaW4gYSBjb250YWluZXIuXG4gICAgICAgIGN1cnJlbnRSTm9kZSA9IHNpYmxpbmdBZnRlcihzZXJpYWxpemVkVmlld1tOVU1fUk9PVF9OT0RFU10sIGN1cnJlbnRSTm9kZSkhO1xuICAgICAgfVxuICAgICAgZGVoeWRyYXRlZFZpZXdzLnB1c2godmlldyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIFtjdXJyZW50Uk5vZGUsIGRlaHlkcmF0ZWRWaWV3c107XG59XG5cbi8qKlxuICogUmVmZXJlbmNlIHRvIGEgZnVuY3Rpb24gdGhhdCBzZWFyY2hlcyBmb3IgYSBtYXRjaGluZyBkZWh5ZHJhdGVkIHZpZXdzXG4gKiBzdG9yZWQgb24gYSBnaXZlbiBsQ29udGFpbmVyLlxuICogUmV0dXJucyBgbnVsbGAgYnkgZGVmYXVsdCwgd2hlbiBoeWRyYXRpb24gaXMgbm90IGVuYWJsZWQuXG4gKi9cbmxldCBfZmluZE1hdGNoaW5nRGVoeWRyYXRlZFZpZXdJbXBsOiB0eXBlb2YgZmluZE1hdGNoaW5nRGVoeWRyYXRlZFZpZXdJbXBsID0gKCkgPT4gbnVsbDtcblxuLyoqXG4gKiBSZXRyaWV2ZXMgdGhlIG5leHQgZGVoeWRyYXRlZCB2aWV3IGZyb20gdGhlIExDb250YWluZXIgYW5kIHZlcmlmaWVzIHRoYXRcbiAqIGl0IG1hdGNoZXMgYSBnaXZlbiB0ZW1wbGF0ZSBpZCAoZnJvbSB0aGUgVFZpZXcgdGhhdCB3YXMgdXNlZCB0byBjcmVhdGUgdGhpc1xuICogaW5zdGFuY2Ugb2YgYSB2aWV3KS4gSWYgdGhlIGlkIGRvZXNuJ3QgbWF0Y2gsIHRoYXQgbWVhbnMgdGhhdCB3ZSBhcmUgaW4gYW5cbiAqIHVuZXhwZWN0ZWQgc3RhdGUgYW5kIGNhbiBub3QgY29tcGxldGUgdGhlIHJlY29uY2lsaWF0aW9uIHByb2Nlc3MuIFRodXMsXG4gKiBhbGwgZGVoeWRyYXRlZCB2aWV3cyBmcm9tIHRoaXMgTENvbnRhaW5lciBhcmUgcmVtb3ZlZCAoaW5jbHVkaW5nIGNvcnJlc3BvbmRpbmdcbiAqIERPTSBub2RlcykgYW5kIHRoZSByZW5kZXJpbmcgaXMgcGVyZm9ybWVkIGFzIGlmIHRoZXJlIHdlcmUgbm8gZGVoeWRyYXRlZCB2aWV3c1xuICogaW4gdGhpcyBjb250YWluZXIuXG4gKi9cbmZ1bmN0aW9uIGZpbmRNYXRjaGluZ0RlaHlkcmF0ZWRWaWV3SW1wbChcbiAgbENvbnRhaW5lcjogTENvbnRhaW5lcixcbiAgdGVtcGxhdGU6IHN0cmluZyB8IG51bGwsXG4pOiBEZWh5ZHJhdGVkQ29udGFpbmVyVmlldyB8IG51bGwge1xuICBjb25zdCB2aWV3cyA9IGxDb250YWluZXJbREVIWURSQVRFRF9WSUVXU107XG4gIGlmICghdGVtcGxhdGUgfHwgdmlld3MgPT09IG51bGwgfHwgdmlld3MubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgY29uc3QgdmlldyA9IHZpZXdzWzBdO1xuICAvLyBWZXJpZnkgd2hldGhlciB0aGUgZmlyc3QgZGVoeWRyYXRlZCB2aWV3IGluIHRoZSBjb250YWluZXIgbWF0Y2hlc1xuICAvLyB0aGUgdGVtcGxhdGUgaWQgcGFzc2VkIHRvIHRoaXMgZnVuY3Rpb24gKHRoYXQgb3JpZ2luYXRlZCBmcm9tIGEgVFZpZXdcbiAgLy8gdGhhdCB3YXMgdXNlZCB0byBjcmVhdGUgYW4gaW5zdGFuY2Ugb2YgYW4gZW1iZWRkZWQgb3IgY29tcG9uZW50IHZpZXdzLlxuICBpZiAodmlldy5kYXRhW1RFTVBMQVRFX0lEXSA9PT0gdGVtcGxhdGUpIHtcbiAgICAvLyBJZiB0aGUgdGVtcGxhdGUgaWQgbWF0Y2hlcyAtIGV4dHJhY3QgdGhlIGZpcnN0IHZpZXcgYW5kIHJldHVybiBpdC5cbiAgICByZXR1cm4gdmlld3Muc2hpZnQoKSE7XG4gIH0gZWxzZSB7XG4gICAgLy8gT3RoZXJ3aXNlLCB3ZSBhcmUgYXQgdGhlIHN0YXRlIHdoZW4gcmVjb25jaWxpYXRpb24gY2FuIG5vdCBiZSBjb21wbGV0ZWQsXG4gICAgLy8gdGh1cyB3ZSByZW1vdmUgYWxsIGRlaHlkcmF0ZWQgdmlld3Mgd2l0aGluIHRoaXMgY29udGFpbmVyIChyZW1vdmUgdGhlbVxuICAgIC8vIGZyb20gaW50ZXJuYWwgZGF0YSBzdHJ1Y3R1cmVzIGFzIHdlbGwgYXMgZGVsZXRlIGFzc29jaWF0ZWQgZWxlbWVudHMgZnJvbVxuICAgIC8vIHRoZSBET00gdHJlZSkuXG4gICAgcmVtb3ZlRGVoeWRyYXRlZFZpZXdzKGxDb250YWluZXIpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlbmFibGVGaW5kTWF0Y2hpbmdEZWh5ZHJhdGVkVmlld0ltcGwoKSB7XG4gIF9maW5kTWF0Y2hpbmdEZWh5ZHJhdGVkVmlld0ltcGwgPSBmaW5kTWF0Y2hpbmdEZWh5ZHJhdGVkVmlld0ltcGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaW5kTWF0Y2hpbmdEZWh5ZHJhdGVkVmlldyhcbiAgbENvbnRhaW5lcjogTENvbnRhaW5lcixcbiAgdGVtcGxhdGU6IHN0cmluZyB8IG51bGwsXG4pOiBEZWh5ZHJhdGVkQ29udGFpbmVyVmlldyB8IG51bGwge1xuICByZXR1cm4gX2ZpbmRNYXRjaGluZ0RlaHlkcmF0ZWRWaWV3SW1wbChsQ29udGFpbmVyLCB0ZW1wbGF0ZSk7XG59XG4iXX0=