/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { CONTAINER_HEADER_OFFSET } from '../render3/interfaces/container';
import { isLContainer, isLView } from '../render3/interfaces/type_checks';
import { HEADER_OFFSET, TVIEW } from '../render3/interfaces/view';
import { getTDeferBlockDetails, isTDeferBlockDetails } from './utils';
/**
 * Retrieves all defer blocks in a given LView.
 *
 * @param lView lView with defer blocks
 * @param deferBlocks defer block aggregator array
 */
export function getDeferBlocks(lView, deferBlocks) {
    const tView = lView[TVIEW];
    for (let i = HEADER_OFFSET; i < tView.bindingStartIndex; i++) {
        if (isLContainer(lView[i])) {
            const lContainer = lView[i];
            // An LContainer may represent an instance of a defer block, in which case
            // we store it as a result. Otherwise, keep iterating over LContainer views and
            // look for defer blocks.
            const isLast = i === tView.bindingStartIndex - 1;
            if (!isLast) {
                const tNode = tView.data[i];
                const tDetails = getTDeferBlockDetails(tView, tNode);
                if (isTDeferBlockDetails(tDetails)) {
                    deferBlocks.push({ lContainer, lView, tNode, tDetails });
                    // This LContainer represents a defer block, so we exit
                    // this iteration and don't inspect views in this LContainer.
                    continue;
                }
            }
            for (let i = CONTAINER_HEADER_OFFSET; i < lContainer.length; i++) {
                getDeferBlocks(lContainer[i], deferBlocks);
            }
        }
        else if (isLView(lView[i])) {
            // This is a component, enter the `getDeferBlocks` recursively.
            getDeferBlocks(lView[i], deferBlocks);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlzY292ZXJ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvZGVmZXIvZGlzY292ZXJ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyx1QkFBdUIsRUFBYSxNQUFNLGlDQUFpQyxDQUFDO0FBRXBGLE9BQU8sRUFBQyxZQUFZLEVBQUUsT0FBTyxFQUFDLE1BQU0sbUNBQW1DLENBQUM7QUFDeEUsT0FBTyxFQUFDLGFBQWEsRUFBUyxLQUFLLEVBQUMsTUFBTSw0QkFBNEIsQ0FBQztBQUd2RSxPQUFPLEVBQUMscUJBQXFCLEVBQUUsb0JBQW9CLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFZcEU7Ozs7O0dBS0c7QUFDSCxNQUFNLFVBQVUsY0FBYyxDQUFDLEtBQVksRUFBRSxXQUFnQztJQUMzRSxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDM0IsS0FBSyxJQUFJLENBQUMsR0FBRyxhQUFhLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQzdELElBQUksWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDM0IsTUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVCLDBFQUEwRTtZQUMxRSwrRUFBK0U7WUFDL0UseUJBQXlCO1lBQ3pCLE1BQU0sTUFBTSxHQUFHLENBQUMsS0FBSyxLQUFLLENBQUMsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDO1lBQ2pELElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDWixNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBVSxDQUFDO2dCQUNyQyxNQUFNLFFBQVEsR0FBRyxxQkFBcUIsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ3JELElBQUksb0JBQW9CLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztvQkFDbkMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFDLFVBQVUsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBQyxDQUFDLENBQUM7b0JBQ3ZELHVEQUF1RDtvQkFDdkQsNkRBQTZEO29CQUM3RCxTQUFTO2dCQUNYLENBQUM7WUFDSCxDQUFDO1lBQ0QsS0FBSyxJQUFJLENBQUMsR0FBRyx1QkFBdUIsRUFBRSxDQUFDLEdBQUcsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUNqRSxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBVSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQ3RELENBQUM7UUFDSCxDQUFDO2FBQU0sSUFBSSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUM3QiwrREFBK0Q7WUFDL0QsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUN4QyxDQUFDO0lBQ0gsQ0FBQztBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q09OVEFJTkVSX0hFQURFUl9PRkZTRVQsIExDb250YWluZXJ9IGZyb20gJy4uL3JlbmRlcjMvaW50ZXJmYWNlcy9jb250YWluZXInO1xuaW1wb3J0IHtUTm9kZX0gZnJvbSAnLi4vcmVuZGVyMy9pbnRlcmZhY2VzL25vZGUnO1xuaW1wb3J0IHtpc0xDb250YWluZXIsIGlzTFZpZXd9IGZyb20gJy4uL3JlbmRlcjMvaW50ZXJmYWNlcy90eXBlX2NoZWNrcyc7XG5pbXBvcnQge0hFQURFUl9PRkZTRVQsIExWaWV3LCBUVklFV30gZnJvbSAnLi4vcmVuZGVyMy9pbnRlcmZhY2VzL3ZpZXcnO1xuXG5pbXBvcnQge1REZWZlckJsb2NrRGV0YWlsc30gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmltcG9ydCB7Z2V0VERlZmVyQmxvY2tEZXRhaWxzLCBpc1REZWZlckJsb2NrRGV0YWlsc30gZnJvbSAnLi91dGlscyc7XG5cbi8qKlxuICogRGVmZXIgYmxvY2sgaW5zdGFuY2UgZm9yIHRlc3RpbmcuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRGVmZXJCbG9ja0RldGFpbHMge1xuICBsQ29udGFpbmVyOiBMQ29udGFpbmVyO1xuICBsVmlldzogTFZpZXc7XG4gIHROb2RlOiBUTm9kZTtcbiAgdERldGFpbHM6IFREZWZlckJsb2NrRGV0YWlscztcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZXMgYWxsIGRlZmVyIGJsb2NrcyBpbiBhIGdpdmVuIExWaWV3LlxuICpcbiAqIEBwYXJhbSBsVmlldyBsVmlldyB3aXRoIGRlZmVyIGJsb2Nrc1xuICogQHBhcmFtIGRlZmVyQmxvY2tzIGRlZmVyIGJsb2NrIGFnZ3JlZ2F0b3IgYXJyYXlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldERlZmVyQmxvY2tzKGxWaWV3OiBMVmlldywgZGVmZXJCbG9ja3M6IERlZmVyQmxvY2tEZXRhaWxzW10pIHtcbiAgY29uc3QgdFZpZXcgPSBsVmlld1tUVklFV107XG4gIGZvciAobGV0IGkgPSBIRUFERVJfT0ZGU0VUOyBpIDwgdFZpZXcuYmluZGluZ1N0YXJ0SW5kZXg7IGkrKykge1xuICAgIGlmIChpc0xDb250YWluZXIobFZpZXdbaV0pKSB7XG4gICAgICBjb25zdCBsQ29udGFpbmVyID0gbFZpZXdbaV07XG4gICAgICAvLyBBbiBMQ29udGFpbmVyIG1heSByZXByZXNlbnQgYW4gaW5zdGFuY2Ugb2YgYSBkZWZlciBibG9jaywgaW4gd2hpY2ggY2FzZVxuICAgICAgLy8gd2Ugc3RvcmUgaXQgYXMgYSByZXN1bHQuIE90aGVyd2lzZSwga2VlcCBpdGVyYXRpbmcgb3ZlciBMQ29udGFpbmVyIHZpZXdzIGFuZFxuICAgICAgLy8gbG9vayBmb3IgZGVmZXIgYmxvY2tzLlxuICAgICAgY29uc3QgaXNMYXN0ID0gaSA9PT0gdFZpZXcuYmluZGluZ1N0YXJ0SW5kZXggLSAxO1xuICAgICAgaWYgKCFpc0xhc3QpIHtcbiAgICAgICAgY29uc3QgdE5vZGUgPSB0Vmlldy5kYXRhW2ldIGFzIFROb2RlO1xuICAgICAgICBjb25zdCB0RGV0YWlscyA9IGdldFREZWZlckJsb2NrRGV0YWlscyh0VmlldywgdE5vZGUpO1xuICAgICAgICBpZiAoaXNURGVmZXJCbG9ja0RldGFpbHModERldGFpbHMpKSB7XG4gICAgICAgICAgZGVmZXJCbG9ja3MucHVzaCh7bENvbnRhaW5lciwgbFZpZXcsIHROb2RlLCB0RGV0YWlsc30pO1xuICAgICAgICAgIC8vIFRoaXMgTENvbnRhaW5lciByZXByZXNlbnRzIGEgZGVmZXIgYmxvY2ssIHNvIHdlIGV4aXRcbiAgICAgICAgICAvLyB0aGlzIGl0ZXJhdGlvbiBhbmQgZG9uJ3QgaW5zcGVjdCB2aWV3cyBpbiB0aGlzIExDb250YWluZXIuXG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGZvciAobGV0IGkgPSBDT05UQUlORVJfSEVBREVSX09GRlNFVDsgaSA8IGxDb250YWluZXIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZ2V0RGVmZXJCbG9ja3MobENvbnRhaW5lcltpXSBhcyBMVmlldywgZGVmZXJCbG9ja3MpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoaXNMVmlldyhsVmlld1tpXSkpIHtcbiAgICAgIC8vIFRoaXMgaXMgYSBjb21wb25lbnQsIGVudGVyIHRoZSBgZ2V0RGVmZXJCbG9ja3NgIHJlY3Vyc2l2ZWx5LlxuICAgICAgZ2V0RGVmZXJCbG9ja3MobFZpZXdbaV0sIGRlZmVyQmxvY2tzKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==