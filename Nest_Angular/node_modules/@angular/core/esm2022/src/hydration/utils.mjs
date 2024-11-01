/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { getComponent } from '../render3/util/discovery_utils';
import { getDocument } from '../render3/interfaces/document';
import { isRootView } from '../render3/interfaces/type_checks';
import { HEADER_OFFSET, TVIEW } from '../render3/interfaces/view';
import { makeStateKey, TransferState } from '../transfer_state';
import { assertDefined } from '../util/assert';
import { CONTAINERS, DISCONNECTED_NODES, ELEMENT_CONTAINERS, MULTIPLIER, NUM_ROOT_NODES, } from './interfaces';
/**
 * The name of the key used in the TransferState collection,
 * where hydration information is located.
 */
const TRANSFER_STATE_TOKEN_ID = '__nghData__';
/**
 * Lookup key used to reference DOM hydration data (ngh) in `TransferState`.
 */
export const NGH_DATA_KEY = makeStateKey(TRANSFER_STATE_TOKEN_ID);
/**
 * The name of the attribute that would be added to host component
 * nodes and contain a reference to a particular slot in transferred
 * state that contains the necessary hydration info for this component.
 */
export const NGH_ATTR_NAME = 'ngh';
/**
 * Marker used in a comment node to ensure hydration content integrity
 */
export const SSR_CONTENT_INTEGRITY_MARKER = 'nghm';
/**
 * Reference to a function that reads `ngh` attribute value from a given RNode
 * and retrieves hydration information from the TransferState using that value
 * as an index. Returns `null` by default, when hydration is not enabled.
 *
 * @param rNode Component's host element.
 * @param injector Injector that this component has access to.
 * @param isRootView Specifies whether we trying to read hydration info for the root view.
 */
let _retrieveHydrationInfoImpl = () => null;
export function retrieveHydrationInfoImpl(rNode, injector, isRootView = false) {
    let nghAttrValue = rNode.getAttribute(NGH_ATTR_NAME);
    if (nghAttrValue == null)
        return null;
    // For cases when a root component also acts as an anchor node for a ViewContainerRef
    // (for example, when ViewContainerRef is injected in a root component), there is a need
    // to serialize information about the component itself, as well as an LContainer that
    // represents this ViewContainerRef. Effectively, we need to serialize 2 pieces of info:
    // (1) hydration info for the root component itself and (2) hydration info for the
    // ViewContainerRef instance (an LContainer). Each piece of information is included into
    // the hydration data (in the TransferState object) separately, thus we end up with 2 ids.
    // Since we only have 1 root element, we encode both bits of info into a single string:
    // ids are separated by the `|` char (e.g. `10|25`, where `10` is the ngh for a component view
    // and 25 is the `ngh` for a root view which holds LContainer).
    const [componentViewNgh, rootViewNgh] = nghAttrValue.split('|');
    nghAttrValue = isRootView ? rootViewNgh : componentViewNgh;
    if (!nghAttrValue)
        return null;
    // We've read one of the ngh ids, keep the remaining one, so that
    // we can set it back on the DOM element.
    const rootNgh = rootViewNgh ? `|${rootViewNgh}` : '';
    const remainingNgh = isRootView ? componentViewNgh : rootNgh;
    let data = {};
    // An element might have an empty `ngh` attribute value (e.g. `<comp ngh="" />`),
    // which means that no special annotations are required. Do not attempt to read
    // from the TransferState in this case.
    if (nghAttrValue !== '') {
        const transferState = injector.get(TransferState, null, { optional: true });
        if (transferState !== null) {
            const nghData = transferState.get(NGH_DATA_KEY, []);
            // The nghAttrValue is always a number referencing an index
            // in the hydration TransferState data.
            data = nghData[Number(nghAttrValue)];
            // If the `ngh` attribute exists and has a non-empty value,
            // the hydration info *must* be present in the TransferState.
            // If there is no data for some reasons, this is an error.
            ngDevMode && assertDefined(data, 'Unable to retrieve hydration info from the TransferState.');
        }
    }
    const dehydratedView = {
        data,
        firstChild: rNode.firstChild ?? null,
    };
    if (isRootView) {
        // If there is hydration info present for the root view, it means that there was
        // a ViewContainerRef injected in the root component. The root component host element
        // acted as an anchor node in this scenario. As a result, the DOM nodes that represent
        // embedded views in this ViewContainerRef are located as siblings to the host node,
        // i.e. `<app-root /><#VIEW1><#VIEW2>...<!--container-->`. In this case, the current
        // node becomes the first child of this root view and the next sibling is the first
        // element in the DOM segment.
        dehydratedView.firstChild = rNode;
        // We use `0` here, since this is the slot (right after the HEADER_OFFSET)
        // where a component LView or an LContainer is located in a root LView.
        setSegmentHead(dehydratedView, 0, rNode.nextSibling);
    }
    if (remainingNgh) {
        // If we have only used one of the ngh ids, store the remaining one
        // back on this RNode.
        rNode.setAttribute(NGH_ATTR_NAME, remainingNgh);
    }
    else {
        // The `ngh` attribute is cleared from the DOM node now
        // that the data has been retrieved for all indices.
        rNode.removeAttribute(NGH_ATTR_NAME);
    }
    // Note: don't check whether this node was claimed for hydration,
    // because this node might've been previously claimed while processing
    // template instructions.
    ngDevMode && markRNodeAsClaimedByHydration(rNode, /* checkIfAlreadyClaimed */ false);
    ngDevMode && ngDevMode.hydratedComponents++;
    return dehydratedView;
}
/**
 * Sets the implementation for the `retrieveHydrationInfo` function.
 */
export function enableRetrieveHydrationInfoImpl() {
    _retrieveHydrationInfoImpl = retrieveHydrationInfoImpl;
}
/**
 * Retrieves hydration info by reading the value from the `ngh` attribute
 * and accessing a corresponding slot in TransferState storage.
 */
export function retrieveHydrationInfo(rNode, injector, isRootView = false) {
    return _retrieveHydrationInfoImpl(rNode, injector, isRootView);
}
/**
 * Retrieves the necessary object from a given ViewRef to serialize:
 *  - an LView for component views
 *  - an LContainer for cases when component acts as a ViewContainerRef anchor
 *  - `null` in case of an embedded view
 */
export function getLNodeForHydration(viewRef) {
    // Reading an internal field from `ViewRef` instance.
    let lView = viewRef._lView;
    const tView = lView[TVIEW];
    // A registered ViewRef might represent an instance of an
    // embedded view, in which case we do not need to annotate it.
    if (tView.type === 2 /* TViewType.Embedded */) {
        return null;
    }
    // Check if it's a root view and if so, retrieve component's
    // LView from the first slot after the header.
    if (isRootView(lView)) {
        lView = lView[HEADER_OFFSET];
    }
    return lView;
}
function getTextNodeContent(node) {
    return node.textContent?.replace(/\s/gm, '');
}
/**
 * Restores text nodes and separators into the DOM that were lost during SSR
 * serialization. The hydration process replaces empty text nodes and text
 * nodes that are immediately adjacent to other text nodes with comment nodes
 * that this method filters on to restore those missing nodes that the
 * hydration process is expecting to be present.
 *
 * @param node The app's root HTML Element
 */
export function processTextNodeMarkersBeforeHydration(node) {
    const doc = getDocument();
    const commentNodesIterator = doc.createNodeIterator(node, NodeFilter.SHOW_COMMENT, {
        acceptNode(node) {
            const content = getTextNodeContent(node);
            const isTextNodeMarker = content === "ngetn" /* TextNodeMarker.EmptyNode */ || content === "ngtns" /* TextNodeMarker.Separator */;
            return isTextNodeMarker ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        },
    });
    let currentNode;
    // We cannot modify the DOM while using the commentIterator,
    // because it throws off the iterator state.
    // So we collect all marker nodes first and then follow up with
    // applying the changes to the DOM: either inserting an empty node
    // or just removing the marker if it was used as a separator.
    const nodes = [];
    while ((currentNode = commentNodesIterator.nextNode())) {
        nodes.push(currentNode);
    }
    for (const node of nodes) {
        if (node.textContent === "ngetn" /* TextNodeMarker.EmptyNode */) {
            node.replaceWith(doc.createTextNode(''));
        }
        else {
            node.remove();
        }
    }
}
/**
 * Internal type that represents a claimed node.
 * Only used in dev mode.
 */
export var HydrationStatus;
(function (HydrationStatus) {
    HydrationStatus["Hydrated"] = "hydrated";
    HydrationStatus["Skipped"] = "skipped";
    HydrationStatus["Mismatched"] = "mismatched";
})(HydrationStatus || (HydrationStatus = {}));
const HYDRATION_INFO_KEY = '__ngDebugHydrationInfo__';
function patchHydrationInfo(node, info) {
    node[HYDRATION_INFO_KEY] = info;
}
export function readHydrationInfo(node) {
    return node[HYDRATION_INFO_KEY] ?? null;
}
/**
 * Marks a node as "claimed" by hydration process.
 * This is needed to make assessments in tests whether
 * the hydration process handled all nodes.
 */
export function markRNodeAsClaimedByHydration(node, checkIfAlreadyClaimed = true) {
    if (!ngDevMode) {
        throw new Error('Calling `markRNodeAsClaimedByHydration` in prod mode ' +
            'is not supported and likely a mistake.');
    }
    if (checkIfAlreadyClaimed && isRNodeClaimedForHydration(node)) {
        throw new Error('Trying to claim a node, which was claimed already.');
    }
    patchHydrationInfo(node, { status: HydrationStatus.Hydrated });
    ngDevMode.hydratedNodes++;
}
export function markRNodeAsSkippedByHydration(node) {
    if (!ngDevMode) {
        throw new Error('Calling `markRNodeAsSkippedByHydration` in prod mode ' +
            'is not supported and likely a mistake.');
    }
    patchHydrationInfo(node, { status: HydrationStatus.Skipped });
    ngDevMode.componentsSkippedHydration++;
}
export function markRNodeAsHavingHydrationMismatch(node, expectedNodeDetails = null, actualNodeDetails = null) {
    if (!ngDevMode) {
        throw new Error('Calling `markRNodeAsMismatchedByHydration` in prod mode ' +
            'is not supported and likely a mistake.');
    }
    // The RNode can be a standard HTMLElement (not an Angular component or directive)
    // The devtools component tree only displays Angular components & directives
    // Therefore we attach the debug info to the closest component/directive
    while (node && !getComponent(node)) {
        node = node?.parentNode;
    }
    if (node) {
        patchHydrationInfo(node, {
            status: HydrationStatus.Mismatched,
            expectedNodeDetails,
            actualNodeDetails,
        });
    }
}
export function isRNodeClaimedForHydration(node) {
    return readHydrationInfo(node)?.status === HydrationStatus.Hydrated;
}
export function setSegmentHead(hydrationInfo, index, node) {
    hydrationInfo.segmentHeads ??= {};
    hydrationInfo.segmentHeads[index] = node;
}
export function getSegmentHead(hydrationInfo, index) {
    return hydrationInfo.segmentHeads?.[index] ?? null;
}
/**
 * Returns the size of an <ng-container>, using either the information
 * serialized in `ELEMENT_CONTAINERS` (element container size) or by
 * computing the sum of root nodes in all dehydrated views in a given
 * container (in case this `<ng-container>` was also used as a view
 * container host node, e.g. <ng-container *ngIf>).
 */
export function getNgContainerSize(hydrationInfo, index) {
    const data = hydrationInfo.data;
    let size = data[ELEMENT_CONTAINERS]?.[index] ?? null;
    // If there is no serialized information available in the `ELEMENT_CONTAINERS` slot,
    // check if we have info about view containers at this location (e.g.
    // `<ng-container *ngIf>`) and use container size as a number of root nodes in this
    // element container.
    if (size === null && data[CONTAINERS]?.[index]) {
        size = calcSerializedContainerSize(hydrationInfo, index);
    }
    return size;
}
export function isSerializedElementContainer(hydrationInfo, index) {
    return hydrationInfo.data[ELEMENT_CONTAINERS]?.[index] !== undefined;
}
export function getSerializedContainerViews(hydrationInfo, index) {
    return hydrationInfo.data[CONTAINERS]?.[index] ?? null;
}
/**
 * Computes the size of a serialized container (the number of root nodes)
 * by calculating the sum of root nodes in all dehydrated views in this container.
 */
export function calcSerializedContainerSize(hydrationInfo, index) {
    const views = getSerializedContainerViews(hydrationInfo, index) ?? [];
    let numNodes = 0;
    for (let view of views) {
        numNodes += view[NUM_ROOT_NODES] * (view[MULTIPLIER] ?? 1);
    }
    return numNodes;
}
/**
 * Attempt to initialize the `disconnectedNodes` field of the given
 * `DehydratedView`. Returns the initialized value.
 */
export function initDisconnectedNodes(hydrationInfo) {
    // Check if we are processing disconnected info for the first time.
    if (typeof hydrationInfo.disconnectedNodes === 'undefined') {
        const nodeIds = hydrationInfo.data[DISCONNECTED_NODES];
        hydrationInfo.disconnectedNodes = nodeIds ? new Set(nodeIds) : null;
    }
    return hydrationInfo.disconnectedNodes;
}
/**
 * Checks whether a node is annotated as "disconnected", i.e. not present
 * in the DOM at serialization time. We should not attempt hydration for
 * such nodes and instead, use a regular "creation mode".
 */
export function isDisconnectedNode(hydrationInfo, index) {
    // Check if we are processing disconnected info for the first time.
    if (typeof hydrationInfo.disconnectedNodes === 'undefined') {
        const nodeIds = hydrationInfo.data[DISCONNECTED_NODES];
        hydrationInfo.disconnectedNodes = nodeIds ? new Set(nodeIds) : null;
    }
    return !!initDisconnectedNodes(hydrationInfo)?.has(index);
}
/**
 * Helper function to prepare text nodes for serialization by ensuring
 * that seperate logical text blocks in the DOM remain separate after
 * serialization.
 */
export function processTextNodeBeforeSerialization(context, node) {
    // Handle cases where text nodes can be lost after DOM serialization:
    //  1. When there is an *empty text node* in DOM: in this case, this
    //     node would not make it into the serialized string and as a result,
    //     this node wouldn't be created in a browser. This would result in
    //     a mismatch during the hydration, where the runtime logic would expect
    //     a text node to be present in live DOM, but no text node would exist.
    //     Example: `<span>{{ name }}</span>` when the `name` is an empty string.
    //     This would result in `<span></span>` string after serialization and
    //     in a browser only the `span` element would be created. To resolve that,
    //     an extra comment node is appended in place of an empty text node and
    //     that special comment node is replaced with an empty text node *before*
    //     hydration.
    //  2. When there are 2 consecutive text nodes present in the DOM.
    //     Example: `<div>Hello <ng-container *ngIf="true">world</ng-container></div>`.
    //     In this scenario, the live DOM would look like this:
    //       <div>#text('Hello ') #text('world') #comment('container')</div>
    //     Serialized string would look like this: `<div>Hello world<!--container--></div>`.
    //     The live DOM in a browser after that would be:
    //       <div>#text('Hello world') #comment('container')</div>
    //     Notice how 2 text nodes are now "merged" into one. This would cause hydration
    //     logic to fail, since it'd expect 2 text nodes being present, not one.
    //     To fix this, we insert a special comment node in between those text nodes, so
    //     serialized representation is: `<div>Hello <!--ngtns-->world<!--container--></div>`.
    //     This forces browser to create 2 text nodes separated by a comment node.
    //     Before running a hydration process, this special comment node is removed, so the
    //     live DOM has exactly the same state as it was before serialization.
    // Collect this node as required special annotation only when its
    // contents is empty. Otherwise, such text node would be present on
    // the client after server-side rendering and no special handling needed.
    const el = node;
    const corruptedTextNodes = context.corruptedTextNodes;
    if (el.textContent === '') {
        corruptedTextNodes.set(el, "ngetn" /* TextNodeMarker.EmptyNode */);
    }
    else if (el.nextSibling?.nodeType === Node.TEXT_NODE) {
        corruptedTextNodes.set(el, "ngtns" /* TextNodeMarker.Separator */);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9oeWRyYXRpb24vdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBSUgsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGlDQUFpQyxDQUFDO0FBRTdELE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxnQ0FBZ0MsQ0FBQztBQUUzRCxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sbUNBQW1DLENBQUM7QUFDN0QsT0FBTyxFQUFDLGFBQWEsRUFBUyxLQUFLLEVBQVksTUFBTSw0QkFBNEIsQ0FBQztBQUNsRixPQUFPLEVBQUMsWUFBWSxFQUFFLGFBQWEsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQzlELE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUc3QyxPQUFPLEVBQ0wsVUFBVSxFQUVWLGtCQUFrQixFQUNsQixrQkFBa0IsRUFDbEIsVUFBVSxFQUNWLGNBQWMsR0FJZixNQUFNLGNBQWMsQ0FBQztBQUV0Qjs7O0dBR0c7QUFDSCxNQUFNLHVCQUF1QixHQUFHLGFBQWEsQ0FBQztBQUU5Qzs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLFlBQVksR0FBRyxZQUFZLENBQXdCLHVCQUF1QixDQUFDLENBQUM7QUFFekY7Ozs7R0FJRztBQUNILE1BQU0sQ0FBQyxNQUFNLGFBQWEsR0FBRyxLQUFLLENBQUM7QUFFbkM7O0dBRUc7QUFDSCxNQUFNLENBQUMsTUFBTSw0QkFBNEIsR0FBRyxNQUFNLENBQUM7QUFzQm5EOzs7Ozs7OztHQVFHO0FBQ0gsSUFBSSwwQkFBMEIsR0FBcUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDO0FBRTlFLE1BQU0sVUFBVSx5QkFBeUIsQ0FDdkMsS0FBZSxFQUNmLFFBQWtCLEVBQ2xCLFVBQVUsR0FBRyxLQUFLO0lBRWxCLElBQUksWUFBWSxHQUFHLEtB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QUM1RSxvRkFBb0Y7SUFDcEYsMEZBQTBGO0lBQzFGLDhFQUE4RTtJQUM5RSx1RkFBdUY7SUFDdkYsMEVBQTBFO0lBRTFFLGlFQUFpRTtJQUNqRSxtRUFBbUU7SUFDbkUseUVBQXlFO0lBQ3pFLE1BQU0sRUFBRSxHQUFHLElBQW1CLENBQUM7SUFDL0IsTUFBTSxrQkFBa0IsR0FBRyxPQUFPLENBQUMsa0JBQWtCLENBQUM7SUFDdEQsSUFBSSxFQUFFLENBQUMsV0FBVyxLQUFLLEVBQUUsRUFBRSxDQUFDO1FBQzFCLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxFQUFFLHlDQUEyQixDQUFDO0lBQ3ZELENBQUM7U0FBTSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsUUFBUSxLQUFLLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUN2RCxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsRUFBRSx5Q0FBMkIsQ0FBQztJQUN2RCxDQUFDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3Rvcn0gZnJvbSAnLi4vZGkvaW5qZWN0b3InO1xuaW1wb3J0IHR5cGUge1ZpZXdSZWZ9IGZyb20gJy4uL2xpbmtlci92aWV3X3JlZic7XG5pbXBvcnQge2dldENvbXBvbmVudH0gZnJvbSAnLi4vcmVuZGVyMy91dGlsL2Rpc2NvdmVyeV91dGlscyc7XG5pbXBvcnQge0xDb250YWluZXJ9IGZyb20gJy4uL3JlbmRlcjMvaW50ZXJmYWNlcy9jb250YWluZXInO1xuaW1wb3J0IHtnZXREb2N1bWVudH0gZnJvbSAnLi4vcmVuZGVyMy9pbnRlcmZhY2VzL2RvY3VtZW50JztcbmltcG9ydCB7UkVsZW1lbnQsIFJOb2RlfSBmcm9tICcuLi9yZW5kZXIzL2ludGVyZmFjZXMvcmVuZGVyZXJfZG9tJztcbmltcG9ydCB7aXNSb290Vmlld30gZnJvbSAnLi4vcmVuZGVyMy9pbnRlcmZhY2VzL3R5cGVfY2hlY2tzJztcbmltcG9ydCB7SEVBREVSX09GRlNFVCwgTFZpZXcsIFRWSUVXLCBUVmlld1R5cGV9IGZyb20gJy4uL3JlbmRlcjMvaW50ZXJmYWNlcy92aWV3JztcbmltcG9ydCB7bWFrZVN0YXRlS2V5LCBUcmFuc2ZlclN0YXRlfSBmcm9tICcuLi90cmFuc2Zlcl9zdGF0ZSc7XG5pbXBvcnQge2Fzc2VydERlZmluZWR9IGZyb20gJy4uL3V0aWwvYXNzZXJ0JztcbmltcG9ydCB0eXBlIHtIeWRyYXRpb25Db250ZXh0fSBmcm9tICcuL2Fubm90YXRlJztcblxuaW1wb3J0IHtcbiAgQ09OVEFJTkVSUyxcbiAgRGVoeWRyYXRlZFZpZXcsXG4gIERJU0NPTk5FQ1RFRF9OT0RFUyxcbiAgRUxFTUVOVF9DT05UQUlORVJTLFxuICBNVUxUSVBMSUVSLFxuICBOVU1fUk9PVF9OT0RFUyxcbiAgU2VyaWFsaXplZENvbnRhaW5lclZpZXcsXG4gIFNlcmlhbGl6ZWRFbGVtZW50Q29udGFpbmVycyxcbiAgU2VyaWFsaXplZFZpZXcsXG59IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5cbi8qKlxuICogVGhlIG5hbWUgb2YgdGhlIGtleSB1c2VkIGluIHRoZSBUcmFuc2ZlclN0YXRlIGNvbGxlY3Rpb24sXG4gKiB3aGVyZSBoeWRyYXRpb24gaW5mb3JtYXRpb24gaXMgbG9jYXRlZC5cbiAqL1xuY29uc3QgVFJBTlNGRVJfU1RBVEVfVE9LRU5fSUQgPSAnX19uZ2hEYXRhX18nO1xuXG4vKipcbiAqIExvb2t1cCBrZXkgdXNlZCB0byByZWZlcmVuY2UgRE9NIGh5ZHJhdGlvbiBkYXRhIChuZ2gpIGluIGBUcmFuc2ZlclN0YXRlYC5cbiAqL1xuZXhwb3J0IGNvbnN0IE5HSF9EQVRBX0tFWSA9IG1ha2VTdGF0ZUtleTxBcnJheTxTZXJpYWxpemVkVmlldz4+KFRSQU5TRkVSX1NUQVRFX1RPS0VOX0lEKTtcblxuLyoqXG4gKiBUaGUgbmFtZSBvZiB0aGUgYXR0cmlidXRlIHRoYXQgd291bGQgYmUgYWRkZWQgdG8gaG9zdCBjb21wb25lbnRcbiAqIG5vZGVzIGFuZCBjb250YWluIGEgcmVmZXJlbmNlIHRvIGEgcGFydGljdWxhciBzbG90IGluIHRyYW5zZmVycmVkXG4gKiBzdGF0ZSB0aGF0IGNvbnRhaW5zIHRoZSBuZWNlc3NhcnkgaHlkcmF0aW9uIGluZm8gZm9yIHRoaXMgY29tcG9uZW50LlxuICovXG5leHBvcnQgY29uc3QgTkdIX0FUVFJfTkFNRSA9ICduZ2gnO1xuXG4vKipcbiAqIE1hcmtlciB1c2VkIGluIGEgY29tbWVudCBub2RlIHRvIGVuc3VyZSBoeWRyYXRpb24gY29udGVudCBpbnRlZ3JpdHlcbiAqL1xuZXhwb3J0IGNvbnN0IFNTUl9DT05URU5UX0lOVEVHUklUWV9NQVJLRVIgPSAnbmdobSc7XG5cbmV4cG9ydCBjb25zdCBlbnVtIFRleHROb2RlTWFya2VyIHtcbiAgLyoqXG4gICAqIFRoZSBjb250ZW50cyBvZiB0aGUgdGV4dCBjb21tZW50IGFkZGVkIHRvIG5vZGVzIHRoYXQgd291bGQgb3RoZXJ3aXNlIGJlXG4gICAqIGVtcHR5IHdoZW4gc2VyaWFsaXplZCBieSB0aGUgc2VydmVyIGFuZCBwYXNzZWQgdG8gdGhlIGNsaWVudC4gVGhlIGVtcHR5XG4gICAqIG5vZGUgaXMgbG9zdCB3aGVuIHRoZSBicm93c2VyIHBhcnNlcyBpdCBvdGhlcndpc2UuIFRoaXMgY29tbWVudCBub2RlIHdpbGxcbiAgICogYmUgcmVwbGFjZWQgZHVyaW5nIGh5ZHJhdGlvbiBpbiB0aGUgY2xpZW50IHRvIHJlc3RvcmUgdGhlIGxvc3QgZW1wdHkgdGV4dFxuICAgKiBub2RlLlxuICAgKi9cbiAgRW1wdHlOb2RlID0gJ25nZXRuJyxcblxuICAvKipcbiAgICogVGhlIGNvbnRlbnRzIG9mIHRoZSB0ZXh0IGNvbW1lbnQgYWRkZWQgaW4gdGhlIGNhc2Ugb2YgYWRqYWNlbnQgdGV4dCBub2Rlcy5cbiAgICogV2hlbiBhZGphY2VudCB0ZXh0IG5vZGVzIGFyZSBzZXJpYWxpemVkIGJ5IHRoZSBzZXJ2ZXIgYW5kIHNlbnQgdG8gdGhlXG4gICAqIGNsaWVudCwgdGhlIGJyb3dzZXIgbG9zZXMgcmVmZXJlbmNlIHRvIHRoZSBhbW91bnQgb2Ygbm9kZXMgYW5kIGFzc3VtZXNcbiAgICoganVzdCBvbmUgdGV4dCBub2RlLiBUaGlzIHNlcGFyYXRvciBpcyByZXBsYWNlZCBkdXJpbmcgaHlkcmF0aW9uIHRvIHJlc3RvcmVcbiAgICogdGhlIHByb3BlciBzZXBhcmF0aW9uIGFuZCBhbW91bnQgb2YgdGV4dCBub2RlcyB0aGF0IHNob3VsZCBiZSBwcmVzZW50LlxuICAgKi9cbiAgU2VwYXJhdG9yID0gJ25ndG5zJyxcbn1cblxuLyoqXG4gKiBSZWZlcmVuY2UgdG8gYSBmdW5jdGlvbiB0aGF0IHJlYWRzIGBuZ2hgIGF0dHJpYnV0ZSB2YWx1ZSBmcm9tIGEgZ2l2ZW4gUk5vZGVcbiAqIGFuZCByZXRyaWV2ZXMgaHlkcmF0aW9uIGluZm9ybWF0aW9uIGZyb20gdGhlIFRyYW5zZmVyU3RhdGUgdXNpbmcgdGhhdCB2YWx1ZVxuICogYXMgYW4gaW5kZXguIFJldHVybnMgYG51bGxgIGJ5IGRlZmF1bHQsIHdoZW4gaHlkcmF0aW9uIGlzIG5vdCBlbmFibGVkLlxuICpcbiAqIEBwYXJhbSByTm9kZSBDb21wb25lbnQncyBob3N0IGVsZW1lbnQuXG4gKiBAcGFyYW0gaW5qZWN0b3IgSW5qZWN0b3IgdGhhdCB0aGlzIGNvbXBvbmVudCBoYXMgYWNjZXNzIHRvLlxuICogQHBhcmFtIGlzUm9vdFZpZXcgU3BlY2lmaWVzIHdoZXRoZXIgd2UgdHJ5aW5nIHRvIHJlYWQgaHlkcmF0aW9uIGluZm8gZm9yIHRoZSByb290IHZpZXcuXG4gKi9cbmxldCBfcmV0cmlldmVIeWRyYXRpb25JbmZvSW1wbDogdHlwZW9mIHJldHJpZXZlSHlkcmF0aW9uSW5mb0ltcGwgPSAoKSA9PiBudWxsO1xuXG5leHBvcnQgZnVuY3Rpb24gcmV0cmlldmVIeWRyYXRpb25JbmZvSW1wbChcbiAgck5vZGU6IFJFbGVtZW50LFxuICBpbmplY3RvcjogSW5qZWN0b3IsXG4gIGlzUm9vdFZpZXcgPSBmYWxzZSxcbik6IERlaHlkcmF0ZWRWaWV3IHwgbnVsbCB7XG4gIGxldCBuZ2hBdHRyVmFsdWUgPSByTm9kZS5nZXRBdHRyaWJ1dGUoTkdIX0FUVFJfTkFNRSk7XG4gIGlmIChuZ2hBdHRyVmFsdWUgPT0gbnVsbCkgcmV0dXJuIG51bGw7XG5cbiAgLy8gRm9yIGNhc2VzIHdoZW4gYSByb290IGNvbXBvbmVudCBhbHNvIGFjdHMgYXMgYW4gYW5jaG9yIG5vZGUgZm9yIGEgVmlld0NvbnRhaW5lclJlZlxuICAvLyAoZm9yIGV4YW1wbGUsIHdoZW4gVmlld0NvbnRhaW5lclJlZiBpcyBpbmplY3RlZCBpbiBhIHJvb3QgY29tcG9uZW50KSwgdGhlcmUgaXMgYSBuZWVkXG4gIC8vIHRvIHNlcmlhbGl6ZSBpbmZvcm1hdGlvbiBhYm91dCB0aGUgY29tcG9uZW50IGl0c2VsZiwgYXMgd2VsbCBhcyBhbiBMQ29udGFpbmVyIHRoYXRcbiAgLy8gcmVwcmVzZW50cyB0aGlzIFZpZXdDb250YWluZXJSZWYuIEVmZmVjdGl2ZWx5LCB3ZSBuZWVkIHRvIHNlcmlhbGl6ZSAyIHBpZWNlcyBvZiBpbmZvOlxuICAvLyAoMSkgaHlkcmF0aW9uIGluZm8gZm9yIHRoZSByb290IGNvbXBvbmVudCBpdHNlbGYgYW5kICgyKSBoeWRyYXRpb24gaW5mbyBmb3IgdGhlXG4gIC8vIFZpZXdDb250YWluZXJSZWYgaW5zdGFuY2UgKGFuIExDb250YWluZXIpLiBFYWNoIHBpZWNlIG9mIGluZm9ybWF0aW9uIGlzIGluY2x1ZGVkIGludG9cbiAgLy8gdGhlIGh5ZHJhdGlvbiBkYXRhIChpbiB0aGUgVHJhbnNmZXJTdGF0ZSBvYmplY3QpIHNlcGFyYXRlbHksIHRodXMgd2UgZW5kIHVwIHdpdGggMiBpZHMuXG4gIC8vIFNpbmNlIHdlIG9ubHkgaGF2ZSAxIHJvb3QgZWxlbWVudCwgd2UgZW5jb2RlIGJvdGggYml0cyBvZiBpbmZvIGludG8gYSBzaW5nbGUgc3RyaW5nOlxuICAvLyBpZHMgYXJlIHNlcGFyYXRlZCBieSB0aGUgYHxgIGNoYXIgKGUuZy4gYDEwfDI1YCwgd2hlcmUgYDEwYCBpcyB0aGUgbmdoIGZvciBhIGNvbXBvbmVudCB2aWV3XG4gIC8vIGFuZCAyNSBpcyB0aGUgYG5naGAgZm9yIGEgcm9vdCB2aWV3IHdoaWNoIGhvbGRzIExDb250YWluZXIpLlxuICBjb25zdCBbY29tcG9uZW50Vmlld05naCwgcm9vdFZpZXdOZ2hdID0gbmdoQXR0clZhbHVlLnNwbGl0KCd8Jyk7XG4gIG5naEF0dHJWYWx1ZSA9IGlzUm9vdFZpZXcgPyByb290Vmlld05naCA6IGNvbXBvbmVudFZpZXdOZ2g7XG4gIGlmICghbmdoQXR0clZhbHVlKSByZXR1cm4gbnVsbDtcblxuICAvLyBXZSd2ZSByZWFkIG9uZSBvZiB0aGUgbmdoIGlkcywga2VlcCB0aGUgcmVtYWluaW5nIG9uZSwgc28gdGhhdFxuICAvLyB3ZSBjYW4gc2V0IGl0IGJhY2sgb24gdGhlIERPTSBlbGVtZW50LlxuICBjb25zdCByb290TmdoID0gcm9vdFZpZXdOZ2ggPyBgfCR7cm9vdFZpZXdOZ2h9YCA6ICcnO1xuICBjb25zdCByZW1haW5pbmdOZ2ggPSBpc1Jvb3RWaWV3ID8gY29tcG9uZW50Vmlld05naCA6IHJvb3ROZ2g7XG5cbiAgbGV0IGRhdGE6IFNlcmlhbGl6ZWRWaWV3ID0ge307XG4gIC8vIEFuIGVsZW1lbnQgbWlnaHQgaGF2ZSBhbiBlbXB0eSBgbmdoYCBhdHRyaWJ1dGUgdmFsdWUgKGUuZy4gYDxjb21wIG5naD1cIlwiIC8+YCksXG4gIC8vIHdoaWNoIG1lYW5zIHRoYXQgbm8gc3BlY2lhbCBhbm5vdGF0aW9ucyBhcmUgcmVxdWlyZWQuIERvIG5vdCBhdHRlbXB0IHRvIHJlYWRcbiAgLy8gZnJvbSB0aGUgVHJhbnNmZXJTdGF0ZSBpbiB0aGlzIGNhc2UuXG4gIGlmIChuZ2hBdHRyVmFsdWUgIT09ICcnKSB7XG4gICAgY29uc3QgdHJhbnNmZXJTdGF0ZSA9IGluamVjdG9yLmdldChUcmFuc2ZlclN0YXRlLCBudWxsLCB7b3B0aW9uYWw6IHRydWV9KTtcbiAgICBpZiAodHJhbnNmZXJTdGF0ZSAhPT0gbnVsbCkge1xuICAgICAgY29uc3QgbmdoRGF0YSA9IHRyYW5zZmVyU3RhdGUuZ2V0KE5HSF9EQVRBX0tFWSwgW10pO1xuXG4gICAgICAvLyBUaGUgbmdoQXR0clZhbHVlIGlzIGFsd2F5cyBhIG51bWJlciByZWZlcmVuY2luZyBhbiBpbmRleFxuICAgICAgLy8gaW4gdGhlIGh5ZHJhdGlvbiBUcmFuc2ZlclN0YXRlIGRhdGEuXG4gICAgICBkYXRhID0gbmdoRGF0YVtOdW1iZXIobmdoQXR0clZhbHVlKV07XG5cbiAgICAgIC8vIElmIHRoZSBgbmdoYCBhdHRyaWJ1dGUgZXhpc3RzIGFuZCBoYXMgYSBub24tZW1wdHkgdmFsdWUsXG4gICAgICAvLyB0aGUgaHlkcmF0aW9uIGluZm8gKm11c3QqIGJlIHByZXNlbnQgaW4gdGhlIFRyYW5zZmVyU3RhdGUuXG4gICAgICAvLyBJZiB0aGVyZSBpcyBubyBkYXRhIGZvciBzb21lIHJlYXNvbnMsIHRoaXMgaXMgYW4gZXJyb3IuXG4gICAgICBuZ0Rldk1vZGUgJiYgYXNzZXJ0RGVmaW5lZChkYXRhLCAnVW5hYmxlIHRvIHJldHJpZXZlIGh5ZHJhdGlvbiBpbmZvIGZyb20gdGhlIFRyYW5zZmVyU3RhdGUuJyk7XG4gICAgfVxuICB9XG4gIGNvbnN0IGRlaHlkcmF0ZWRWaWV3OiBEZWh5ZHJhdGVkVmlldyA9IHtcbiAgICBkYXRhLFxuICAgIGZpcnN0Q2hpbGQ6IHJOb2RlLmZpcnN0Q2hpbGQgPz8gbnVsbCxcbiAgfTtcblxuICBpZiAoaXNSb290Vmlldykge1xuICAgIC8vIElmIHRoZXJlIGlzIGh5ZHJhdGlvbiBpbmZvIHByZXNlbnQgZm9yIHRoZSByb290IHZpZXcsIGl0IG1lYW5zIHRoYXQgdGhlcmUgd2FzXG4gICAgLy8gYSBWaWV3Q29udGFpbmVyUmVmIGluamVjdGVkIGluIHRoZSByb290IGNvbXBvbmVudC4gVGhlIHJvb3QgY29tcG9uZW50IGhvc3QgZWxlbWVudFxuICAgIC8vIGFjdGVkIGFzIGFuIGFuY2hvciBub2RlIGluIHRoaXMgc2NlbmFyaW8uIEFzIGEgcmVzdWx0LCB0aGUgRE9NIG5vZGVzIHRoYXQgcmVwcmVzZW50XG4gICAgLy8gZW1iZWRkZWQgdmlld3MgaW4gdGhpcyBWaWV3Q29udGFpbmVyUmVmIGFyZSBsb2NhdGVkIGFzIHNpYmxpbmdzIHRvIHRoZSBob3N0IG5vZGUsXG4gICAgLy8gaS5lLiBgPGFwcC1yb290IC8+PCNWSUVXMT48I1ZJRVcyPi4uLjwhLS1jb250YWluZXItLT5gLiBJbiB0aGlzIGNhc2UsIHRoZSBjdXJyZW50XG4gICAgLy8gbm9kZSBiZWNvbWVzIHRoZSBmaXJzdCBjaGlsZCBvZiB0aGlzIHJvb3QgdmlldyBhbmQgdGhlIG5leHQgc2libGluZyBpcyB0aGUgZmlyc3RcbiAgICAvLyBlbGVtZW50IGluIHRoZSBET00gc2VnbWVudC5cbiAgICBkZWh5ZHJhdGVkVmlldy5maXJzdENoaWxkID0gck5vZGU7XG5cbiAgICAvLyBXZSB1c2UgYDBgIGhlcmUsIHNpbmNlIHRoaXMgaXMgdGhlIHNsb3QgKHJpZ2h0IGFmdGVyIHRoZSBIRUFERVJfT0ZGU0VUKVxuICAgIC8vIHdoZXJlIGEgY29tcG9uZW50IExWaWV3IG9yIGFuIExDb250YWluZXIgaXMgbG9jYXRlZCBpbiBhIHJvb3QgTFZpZXcuXG4gICAgc2V0U2VnbWVudEhlYWQoZGVoeWRyYXRlZFZpZXcsIDAsIHJOb2RlLm5leHRTaWJsaW5nKTtcbiAgfVxuXG4gIGlmIChyZW1haW5pbmdOZ2gpIHtcbiAgICAvLyBJZiB3ZSBoYXZlIG9ubHkgdXNlZCBvbmUgb2YgdGhlIG5naCBpZHMsIHN0b3JlIHRoZSByZW1haW5pbmcgb25lXG4gICAgLy8gYmFjayBvbiB0aGlzIFJOb2RlLlxuICAgIHJOb2RlLnNldEF0dHJpYnV0ZShOR0hfQVRUUl9OQU1FLCByZW1haW5pbmdOZ2gpO1xuICB9IGVsc2Uge1xuICAgIC8vIFRoZSBgbmdoYCBhdHRyaWJ1dGUgaXMgY2xlYXJlZCBmcm9tIHRoZSBET00gbm9kZSBub3dcbiAgICAvLyB0aGF0IHRoZSBkYXRhIGhhcyBiZWVuIHJldHJpZXZlZCBmb3IgYWxsIGluZGljZXMuXG4gICAgck5vZGUucmVtb3ZlQXR0cmlidXRlKE5HSF9BVFRSX05BTUUpO1xuICB9XG5cbiAgLy8gTm90ZTogZG9uJ3QgY2hlY2sgd2hldGhlciB0aGlzIG5vZGUgd2FzIGNsYWltZWQgZm9yIGh5ZHJhdGlvbixcbiAgLy8gYmVjYXVzZSB0aGlzIG5vZGUgbWlnaHQndmUgYmVlbiBwcmV2aW91c2x5IGNsYWltZWQgd2hpbGUgcHJvY2Vzc2luZ1xuICAvLyB0ZW1wbGF0ZSBpbnN0cnVjdGlvbnMuXG4gIG5nRGV2TW9kZSAmJiBtYXJrUk5vZGVBc0NsYWltZWRCeUh5ZHJhdGlvbihyTm9kZSwgLyogY2hlY2tJZkFscmVhZHlDbGFpbWVkICovIGZhbHNlKTtcbiAgbmdEZXZNb2RlICYmIG5nRGV2TW9kZS5oeWRyYXRlZENvbXBvbmVudHMrKztcblxuICByZXR1cm4gZGVoeWRyYXRlZFZpZXc7XG59XG5cbi8qKlxuICogU2V0cyB0aGUgaW1wbGVtZW50YXRpb24gZm9yIHRoZSBgcmV0cmlldmVIeWRyYXRpb25JbmZvYCBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVuYWJsZVJldHJpZXZlSHlkcmF0aW9uSW5mb0ltcGwoKSB7XG4gIF9yZXRyaWV2ZUh5ZHJhdGlvbkluZm9JbXBsID0gcmV0cmlldmVIeWRyYXRpb25JbmZvSW1wbDtcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZXMgaHlkcmF0aW9uIGluZm8gYnkgcmVhZGluZyB0aGUgdmFsdWUgZnJvbSB0aGUgYG5naGAgYXR0cmlidXRlXG4gKiBhbmQgYWNjZXNzaW5nIGEgY29ycmVzcG9uZGluZyBzbG90IGluIFRyYW5zZmVyU3RhdGUgc3RvcmFnZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJldHJpZXZlSHlkcmF0aW9uSW5mbyhcbiAgck5vZGU6IFJFbGVtZW50LFxuICBpbmplY3RvcjogSW5qZWN0b3IsXG4gIGlzUm9vdFZpZXcgPSBmYWxzZSxcbik6IERlaHlkcmF0ZWRWaWV3IHwgbnVsbCB7XG4gIHJldHVybiBfcmV0cmlldmVIeWRyYXRpb25JbmZvSW1wbChyTm9kZSwgaW5qZWN0b3IsIGlzUm9vdFZpZXcpO1xufVxuXG4vKipcbiAqIFJldHJpZXZlcyB0aGUgbmVjZXNzYXJ5IG9iamVjdCBmcm9tIGEgZ2l2ZW4gVmlld1JlZiB0byBzZXJpYWxpemU6XG4gKiAgLSBhbiBMVmlldyBmb3IgY29tcG9uZW50IHZpZXdzXG4gKiAgLSBhbiBMQ29udGFpbmVyIGZvciBjYXNlcyB3aGVuIGNvbXBvbmVudCBhY3RzIGFzIGEgVmlld0NvbnRhaW5lclJlZiBhbmNob3JcbiAqICAtIGBudWxsYCBpbiBjYXNlIG9mIGFuIGVtYmVkZGVkIHZpZXdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExOb2RlRm9ySHlkcmF0aW9uKHZpZXdSZWY6IFZpZXdSZWYpOiBMVmlldyB8IExDb250YWluZXIgfCBudWxsIHtcbiAgLy8gUmVhZGluZyBhbiBpbnRlcm5hbCBmaWVsZCBmcm9tIGBWaWV3UmVmYCBpbnN0YW5jZS5cbiAgbGV0IGxWaWV3ID0gKHZpZXdSZWYgYXMgYW55KS5fbFZpZXcgYXMgTFZpZXc7XG4gIGNvbnN0IHRWaWV3ID0gbFZpZXdbVFZJRVddO1xuICAvLyBBIHJlZ2lzdGVyZWQgVmlld1JlZiBtaWdodCByZXByZXNlbnQgYW4gaW5zdGFuY2Ugb2YgYW5cbiAgLy8gZW1iZWRkZWQgdmlldywgaW4gd2hpY2ggY2FzZSB3ZSBkbyBub3QgbmVlZCB0byBhbm5vdGF0ZSBpdC5cbiAgaWYgKHRWaWV3LnR5cGUgPT09IFRWaWV3VHlwZS5FbWJlZGRlZCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIC8vIENoZWNrIGlmIGl0J3MgYSByb290IHZpZXcgYW5kIGlmIHNvLCByZXRyaWV2ZSBjb21wb25lbnQnc1xuICAvLyBMVmlldyBmcm9tIHRoZSBmaXJzdCBzbG90IGFmdGVyIHRoZSBoZWFkZXIuXG4gIGlmIChpc1Jvb3RWaWV3KGxWaWV3KSkge1xuICAgIGxWaWV3ID0gbFZpZXdbSEVBREVSX09GRlNFVF07XG4gIH1cblxuICByZXR1cm4gbFZpZXc7XG59XG5cbmZ1bmN0aW9uIGdldFRleHROb2RlQ29udGVudChub2RlOiBOb2RlKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIG5vZGUudGV4dENvbnRlbnQ/LnJlcGxhY2UoL1xccy9nbSwgJycpO1xufVxuXG4vKipcbiAqIFJlc3RvcmVzIHRleHQgbm9kZXMgYW5kIHNlcGFyYXRvcnMgaW50byB0aGUgRE9NIHRoYXQgd2VyZSBsb3N0IGR1cmluZyBTU1JcbiAqIHNlcmlhbGl6YXRpb24uIFRoZSBoeWRyYXRpb24gcHJvY2VzcyByZXBsYWNlcyBlbXB0eSB0ZXh0IG5vZGVzIGFuZCB0ZXh0XG4gKiBub2RlcyB0aGF0IGFyZSBpbW1lZGlhdGVseSBhZGphY2VudCB0byBvdGhlciB0ZXh0IG5vZGVzIHdpdGggY29tbWVudCBub2Rlc1xuICogdGhhdCB0aGlzIG1ldGhvZCBmaWx0ZXJzIG9uIHRvIHJlc3RvcmUgdGhvc2UgbWlzc2luZyBub2RlcyB0aGF0IHRoZVxuICogaHlkcmF0aW9uIHByb2Nlc3MgaXMgZXhwZWN0aW5nIHRvIGJlIHByZXNlbnQuXG4gKlxuICogQHBhcmFtIG5vZGUgVGhlIGFwcCdzIHJvb3QgSFRNTCBFbGVtZW50XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcm9jZXNzVGV4dE5vZGVNYXJrZXJzQmVmb3JlSHlkcmF0aW9uKG5vZGU6IEhUTUxFbGVtZW50KSB7XG4gIGNvbnN0IGRvYyA9IGdldERvY3VtZW50KCk7XG4gIGNvbnN0IGNvbW1lbnROb2Rlc0l0ZXJhdG9yID0gZG9jLmNyZWF0ZU5vZGVJdGVyYXRvcihub2RlLCBOb2RlRmlsdGVyLlNIT1dfQ09NTUVOVCwge1xuICAgIGFjY2VwdE5vZGUobm9kZSkge1xuICAgICAgY29uc3QgY29udGVudCA9IGdldFRleHROb2RlQ29udGVudChub2RlKTtcbiAgICAgIGNvbnN0IGlzVGV4dE5vZGVNYXJrZXIgPVxuICAgICAgICBjb250ZW50ID09PSBUZXh0Tm9kZU1hcmtlci5FbXB0eU5vZGUgfHwgY29udGVudCA9PT0gVGV4dE5vZGVNYXJrZXIuU2VwYXJhdG9yO1xuICAgICAgcmV0dXJuIGlzVGV4dE5vZGVNYXJrZXIgPyBOb2RlRmlsdGVyLkZJTFRFUl9BQ0NFUFQgOiBOb2RlRmlsdGVyLkZJTFRFUl9SRUpFQ1Q7XG4gICAgfSxcbiAgfSk7XG4gIGxldCBjdXJyZW50Tm9kZTogQ29tbWVudDtcbiAgLy8gV2UgY2Fubm90IG1vZGlmeSB0aGUgRE9NIHdoaWxlIHVzaW5nIHRoZSBjb21tZW50SXRlcmF0b3IsXG4gIC8vIGJlY2F1c2UgaXQgdGhyb3dzIG9mZiB0aGUgaXRlcmF0b3Igc3RhdGUuXG4gIC8vIFNvIHdlIGNvbGxlY3QgYWxsIG1hcmtlciBub2RlcyBmaXJzdCBhbmQgdGhlbiBmb2xsb3cgdXAgd2l0aFxuICAvLyBhcHBseWluZyB0aGUgY2hhbmdlcyB0byB0aGUgRE9NOiBlaXRoZXIgaW5zZXJ0aW5nIGFuIGVtcHR5IG5vZGVcbiAgLy8gb3IganVzdCByZW1vdmluZyB0aGUgbWFya2VyIGlmIGl0IHdhcyB1c2VkIGFzIGEgc2VwYXJhdG9yLlxuICBjb25zdCBub2RlcyA9IFtdO1xuICB3aGlsZSAoKGN1cnJlbnROb2RlID0gY29tbWVudE5vZGVzSXRlcmF0b3IubmV4dE5vZGUoKSBhcyBDb21tZW50KSkge1xuICAgIG5vZGVzLnB1c2goY3VycmVudE5vZGUpO1xuICB9XG4gIGZvciAoY29uc3Qgbm9kZSBvZiBub2Rlcykge1xuICAgIGlmIChub2RlLnRleHRDb250ZW50ID09PSBUZXh0Tm9kZU1hcmtlci5FbXB0eU5vZGUpIHtcbiAgICAgIG5vZGUucmVwbGFjZVdpdGgoZG9jLmNyZWF0ZVRleHROb2RlKCcnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5vZGUucmVtb3ZlKCk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogSW50ZXJuYWwgdHlwZSB0aGF0IHJlcHJlc2VudHMgYSBjbGFpbWVkIG5vZGUuXG4gKiBPbmx5IHVzZWQgaW4gZGV2IG1vZGUuXG4gKi9cbmV4cG9ydCBlbnVtIEh5ZHJhdGlvblN0YXR1cyB7XG4gIEh5ZHJhdGVkID0gJ2h5ZHJhdGVkJyxcbiAgU2tpcHBlZCA9ICdza2lwcGVkJyxcbiAgTWlzbWF0Y2hlZCA9ICdtaXNtYXRjaGVkJyxcbn1cblxuZXhwb3J0IHR5cGUgSHlkcmF0aW9uSW5mbyA9XG4gIHwge1xuICAgICAgc3RhdHVzOiBIeWRyYXRpb25TdGF0dXMuSHlkcmF0ZWQgfCBIeWRyYXRpb25TdGF0dXMuU2tpcHBlZDtcbiAgICB9XG4gIHwge1xuICAgICAgc3RhdHVzOiBIeWRyYXRpb25TdGF0dXMuTWlzbWF0Y2hlZDtcbiAgICAgIGFjdHVhbE5vZGVEZXRhaWxzOiBzdHJpbmcgfCBudWxsO1xuICAgICAgZXhwZWN0ZWROb2RlRGV0YWlsczogc3RyaW5nIHwgbnVsbDtcbiAgICB9O1xuXG5jb25zdCBIWURSQVRJT05fSU5GT19LRVkgPSAnX19uZ0RlYnVnSHlkcmF0aW9uSW5mb19fJztcblxuZXhwb3J0IHR5cGUgSHlkcmF0ZWROb2RlID0ge1xuICBbSFlEUkFUSU9OX0lORk9fS0VZXT86IEh5ZHJhdGlvbkluZm87XG59O1xuXG5mdW5jdGlvbiBwYXRjaEh5ZHJhdGlvbkluZm8obm9kZTogUk5vZGUsIGluZm86IEh5ZHJhdGlvbkluZm8pIHtcbiAgKG5vZGUgYXMgSHlkcmF0ZWROb2RlKVtIWURSQVRJT05fSU5GT19LRVldID0gaW5mbztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlYWRIeWRyYXRpb25JbmZvKG5vZGU6IFJOb2RlKTogSHlkcmF0aW9uSW5mbyB8IG51bGwge1xuICByZXR1cm4gKG5vZGUgYXMgSHlkcmF0ZWROb2RlKVtIWURSQVRJT05fSU5GT19LRVldID8/IG51bGw7XG59XG5cbi8qKlxuICogTWFya3MgYSBub2RlIGFzIFwiY2xhaW1lZFwiIGJ5IGh5ZHJhdGlvbiBwcm9jZXNzLlxuICogVGhpcyBpcyBuZWVkZWQgdG8gbWFrZSBhc3Nlc3NtZW50cyBpbiB0ZXN0cyB3aGV0aGVyXG4gKiB0aGUgaHlkcmF0aW9uIHByb2Nlc3MgaGFuZGxlZCBhbGwgbm9kZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYXJrUk5vZGVBc0NsYWltZWRCeUh5ZHJhdGlvbihub2RlOiBSTm9kZSwgY2hlY2tJZkFscmVhZHlDbGFpbWVkID0gdHJ1ZSkge1xuICBpZiAoIW5nRGV2TW9kZSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICdDYWxsaW5nIGBtYXJrUk5vZGVBc0NsYWltZWRCeUh5ZHJhdGlvbmAgaW4gcHJvZCBtb2RlICcgK1xuICAgICAgICAnaXMgbm90IHN1cHBvcnRlZCBhbmQgbGlrZWx5IGEgbWlzdGFrZS4nLFxuICAgICk7XG4gIH1cbiAgaWYgKGNoZWNrSWZBbHJlYWR5Q2xhaW1lZCAmJiBpc1JOb2RlQ2xhaW1lZEZvckh5ZHJhdGlvbihub2RlKSkge1xuICAgIHRocm93IG5ldyBFcnJvcignVHJ5aW5nIHRvIGNsYWltIGEgbm9kZSwgd2hpY2ggd2FzIGNsYWltZWQgYWxyZWFkeS4nKTtcbiAgfVxuICBwYXRjaEh5ZHJhdGlvbkluZm8obm9kZSwge3N0YXR1czogSHlkcmF0aW9uU3RhdHVzLkh5ZHJhdGVkfSk7XG4gIG5nRGV2TW9kZS5oeWRyYXRlZE5vZGVzKys7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYXJrUk5vZGVBc1NraXBwZWRCeUh5ZHJhdGlvbihub2RlOiBSTm9kZSkge1xuICBpZiAoIW5nRGV2TW9kZSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICdDYWxsaW5nIGBtYXJrUk5vZGVBc1NraXBwZWRCeUh5ZHJhdGlvbmAgaW4gcHJvZCBtb2RlICcgK1xuICAgICAgICAnaXMgbm90IHN1cHBvcnRlZCBhbmQgbGlrZWx5IGEgbWlzdGFrZS4nLFxuICAgICk7XG4gIH1cbiAgcGF0Y2hIeWRyYXRpb25JbmZvKG5vZGUsIHtzdGF0dXM6IEh5ZHJhdGlvblN0YXR1cy5Ta2lwcGVkfSk7XG4gIG5nRGV2TW9kZS5jb21wb25lbnRzU2tpcHBlZEh5ZHJhdGlvbisrO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFya1JOb2RlQXNIYXZpbmdIeWRyYXRpb25NaXNtYXRjaChcbiAgbm9kZTogUk5vZGUsXG4gIGV4cGVjdGVkTm9kZURldGFpbHM6IHN0cmluZyB8IG51bGwgPSBudWxsLFxuICBhY3R1YWxOb2RlRGV0YWlsczogc3RyaW5nIHwgbnVsbCA9IG51bGwsXG4pIHtcbiAgaWYgKCFuZ0Rldk1vZGUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAnQ2FsbGluZyBgbWFya1JOb2RlQXNNaXNtYXRjaGVkQnlIeWRyYXRpb25gIGluIHByb2QgbW9kZSAnICtcbiAgICAgICAgJ2lzIG5vdCBzdXBwb3J0ZWQgYW5kIGxpa2VseSBhIG1pc3Rha2UuJyxcbiAgICApO1xuICB9XG5cbiAgLy8gVGhlIFJOb2RlIGNhbiBiZSBhIHN0YW5kYXJkIEhUTUxFbGVtZW50IChub3QgYW4gQW5ndWxhciBjb21wb25lbnQgb3IgZGlyZWN0aXZlKVxuICAvLyBUaGUgZGV2dG9vbHMgY29tcG9uZW50IHRyZWUgb25seSBkaXNwbGF5cyBBbmd1bGFyIGNvbXBvbmVudHMgJiBkaXJlY3RpdmVzXG4gIC8vIFRoZXJlZm9yZSB3ZSBhdHRhY2ggdGhlIGRlYnVnIGluZm8gdG8gdGhlIGNsb3Nlc3QgY29tcG9uZW50L2RpcmVjdGl2ZVxuICB3aGlsZSAobm9kZSAmJiAhZ2V0Q29tcG9uZW50KG5vZGUgYXMgRWxlbWVudCkpIHtcbiAgICBub2RlID0gbm9kZT8ucGFyZW50Tm9kZSBhcyBSTm9kZTtcbiAgfVxuXG4gIGlmIChub2RlKSB7XG4gICAgcGF0Y2hIeWRyYXRpb25JbmZvKG5vZGUsIHtcbiAgICAgIHN0YXR1czogSHlkcmF0aW9uU3RhdHVzLk1pc21hdGNoZWQsXG4gICAgICBleHBlY3RlZE5vZGVEZXRhaWxzLFxuICAgICAgYWN0dWFsTm9kZURldGFpbHMsXG4gICAgfSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUk5vZGVDbGFpbWVkRm9ySHlkcmF0aW9uKG5vZGU6IFJOb2RlKTogYm9vbGVhbiB7XG4gIHJldHVybiByZWFkSHlkcmF0aW9uSW5mbyhub2RlKT8uc3RhdHVzID09PSBIeWRyYXRpb25TdGF0dXMuSHlkcmF0ZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRTZWdtZW50SGVhZChcbiAgaHlkcmF0aW9uSW5mbzogRGVoeWRyYXRlZFZpZXcsXG4gIGluZGV4OiBudW1iZXIsXG4gIG5vZGU6IFJOb2RlIHwgbnVsbCxcbik6IHZvaWQge1xuICBoeWRyYXRpb25JbmZvLnNlZ21lbnRIZWFkcyA/Pz0ge307XG4gIGh5ZHJhdGlvbkluZm8uc2VnbWVudEhlYWRzW2luZGV4XSA9IG5vZGU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRTZWdtZW50SGVhZChoeWRyYXRpb25JbmZvOiBEZWh5ZHJhdGVkVmlldywgaW5kZXg6IG51bWJlcik6IFJOb2RlIHwgbnVsbCB7XG4gIHJldHVybiBoeWRyYXRpb25JbmZvLnNlZ21lbnRIZWFkcz8uW2luZGV4XSA/PyBudWxsO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIHNpemUgb2YgYW4gPG5nLWNvbnRhaW5lcj4sIHVzaW5nIGVpdGhlciB0aGUgaW5mb3JtYXRpb25cbiAqIHNlcmlhbGl6ZWQgaW4gYEVMRU1FTlRfQ09OVEFJTkVSU2AgKGVsZW1lbnQgY29udGFpbmVyIHNpemUpIG9yIGJ5XG4gKiBjb21wdXRpbmcgdGhlIHN1bSBvZiByb290IG5vZGVzIGluIGFsbCBkZWh5ZHJhdGVkIHZpZXdzIGluIGEgZ2l2ZW5cbiAqIGNvbnRhaW5lciAoaW4gY2FzZSB0aGlzIGA8bmctY29udGFpbmVyPmAgd2FzIGFsc28gdXNlZCBhcyBhIHZpZXdcbiAqIGNvbnRhaW5lciBob3N0IG5vZGUsIGUuZy4gPG5nLWNvbnRhaW5lciAqbmdJZj4pLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TmdDb250YWluZXJTaXplKGh5ZHJhdGlvbkluZm86IERlaHlkcmF0ZWRWaWV3LCBpbmRleDogbnVtYmVyKTogbnVtYmVyIHwgbnVsbCB7XG4gIGNvbnN0IGRhdGEgPSBoeWRyYXRpb25JbmZvLmRhdGE7XG4gIGxldCBzaXplID0gZGF0YVtFTEVNRU5UX0NPTlRBSU5FUlNdPy5baW5kZXhdID8/IG51bGw7XG4gIC8vIElmIHRoZXJlIGlzIG5vIHNlcmlhbGl6ZWQgaW5mb3JtYXRpb24gYXZhaWxhYmxlIGluIHRoZSBgRUxFTUVOVF9DT05UQUlORVJTYCBzbG90LFxuICAvLyBjaGVjayBpZiB3ZSBoYXZlIGluZm8gYWJvdXQgdmlldyBjb250YWluZXJzIGF0IHRoaXMgbG9jYXRpb24gKGUuZy5cbiAgLy8gYDxuZy1jb250YWluZXIgKm5nSWY+YCkgYW5kIHVzZSBjb250YWluZXIgc2l6ZSBhcyBhIG51bWJlciBvZiByb290IG5vZGVzIGluIHRoaXNcbiAgLy8gZWxlbWVudCBjb250YWluZXIuXG4gIGlmIChzaXplID09PSBudWxsICYmIGRhdGFbQ09OVEFJTkVSU10/LltpbmRleF0pIHtcbiAgICBzaXplID0gY2FsY1NlcmlhbGl6ZWRDb250YWluZXJTaXplKGh5ZHJhdGlvbkluZm8sIGluZGV4KTtcbiAgfVxuICByZXR1cm4gc2l6ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzU2VyaWFsaXplZEVsZW1lbnRDb250YWluZXIoXG4gIGh5ZHJhdGlvbkluZm86IERlaHlkcmF0ZWRWaWV3LFxuICBpbmRleDogbnVtYmVyLFxuKTogYm9vbGVhbiB7XG4gIHJldHVybiBoeWRyYXRpb25JbmZvLmRhdGFbRUxFTUVOVF9DT05UQUlORVJTXT8uW2luZGV4XSAhPT0gdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2VyaWFsaXplZENvbnRhaW5lclZpZXdzKFxuICBoeWRyYXRpb25JbmZvOiBEZWh5ZHJhdGVkVmlldyxcbiAgaW5kZXg6IG51bWJlcixcbik6IFNlcmlhbGl6ZWRDb250YWluZXJWaWV3W10gfCBudWxsIHtcbiAgcmV0dXJuIGh5ZHJhdGlvbkluZm8uZGF0YVtDT05UQUlORVJTXT8uW2luZGV4XSA/PyBudWxsO1xufVxuXG4vKipcbiAqIENvbXB1dGVzIHRoZSBzaXplIG9mIGEgc2VyaWFsaXplZCBjb250YWluZXIgKHRoZSBudW1iZXIgb2Ygcm9vdCBub2RlcylcbiAqIGJ5IGNhbGN1bGF0aW5nIHRoZSBzdW0gb2Ygcm9vdCBub2RlcyBpbiBhbGwgZGVoeWRyYXRlZCB2aWV3cyBpbiB0aGlzIGNvbnRhaW5lci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNhbGNTZXJpYWxpemVkQ29udGFpbmVyU2l6ZShoeWRyYXRpb25JbmZvOiBEZWh5ZHJhdGVkVmlldywgaW5kZXg6IG51bWJlcik6IG51bWJlciB7XG4gIGNvbnN0IHZpZXdzID0gZ2V0U2VyaWFsaXplZENvbnRhaW5lclZpZXdzKGh5ZHJhdGlvbkluZm8sIGluZGV4KSA/PyBbXTtcbiAgbGV0IG51bU5vZGVzID0gMDtcbiAgZm9yIChsZXQgdmlldyBvZiB2aWV3cykge1xuICAgIG51bU5vZGVzICs9IHZpZXdbTlVNX1JPT1RfTk9ERVNdICogKHZpZXdbTVVMVElQTElFUl0gPz8gMSk7XG4gIH1cbiAgcmV0dXJuIG51bU5vZGVzO1xufVxuXG4vKipcbiAqIEF0dGVtcHQgdG8gaW5pdGlhbGl6ZSB0aGUgYGRpc2Nvbm5lY3RlZE5vZGVzYCBmaWVsZCBvZiB0aGUgZ2l2ZW5cbiAqIGBEZWh5ZHJhdGVkVmlld2AuIFJldHVybnMgdGhlIGluaXRpYWxpemVkIHZhbHVlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gaW5pdERpc2Nvbm5lY3RlZE5vZGVzKGh5ZHJhdGlvbkluZm86IERlaHlkcmF0ZWRWaWV3KTogU2V0PG51bWJlcj4gfCBudWxsIHtcbiAgLy8gQ2hlY2sgaWYgd2UgYXJlIHByb2Nlc3NpbmcgZGlzY29ubmVjdGVkIGluZm8gZm9yIHRoZSBmaXJzdCB0aW1lLlxuICBpZiAodHlwZW9mIGh5ZHJhdGlvbkluZm8uZGlzY29ubmVjdGVkTm9kZXMgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgY29uc3Qgbm9kZUlkcyA9IGh5ZHJhdGlvbkluZm8uZGF0YVtESVNDT05ORUNURURfTk9ERVNdO1xuICAgIGh5ZHJhdGlvbkluZm8uZGlzY29ubmVjdGVkTm9kZXMgPSBub2RlSWRzID8gbmV3IFNldChub2RlSWRzKSA6IG51bGw7XG4gIH1cbiAgcmV0dXJuIGh5ZHJhdGlvbkluZm8uZGlzY29ubmVjdGVkTm9kZXM7XG59XG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgYSBub2RlIGlzIGFubm90YXRlZCBhcyBcImRpc2Nvbm5lY3RlZFwiLCBpLmUuIG5vdCBwcmVzZW50XG4gKiBpbiB0aGUgRE9NIGF0IHNlcmlhbGl6YXRpb24gdGltZS4gV2Ugc2hvdWxkIG5vdCBhdHRlbXB0IGh5ZHJhdGlvbiBmb3JcbiAqIHN1Y2ggbm9kZXMgYW5kIGluc3RlYWQsIHVzZSBhIHJlZ3VsYXIgXCJjcmVhdGlvbiBtb2RlXCIuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0Rpc2Nvbm5lY3RlZE5vZGUoaHlkcmF0aW9uSW5mbzogRGVoeWRyYXRlZFZpZXcsIGluZGV4OiBudW1iZXIpOiBib29sZWFuIHtcbiAgLy8gQ2hlY2sgaWYgd2UgYXJlIHByb2Nlc3NpbmcgZGlzY29ubmVjdGVkIGluZm8gZm9yIHRoZSBmaXJzdCB0aW1lLlxuICBpZiAodHlwZW9mIGh5ZHJhdGlvbkluZm8uZGlzY29ubmVjdGVkTm9kZXMgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgY29uc3Qgbm9kZUlkcyA9IGh5ZHJhdGlvbkluZm8uZGF0YVtESVNDT05ORUNURURfTk9ERVNdO1xuICAgIGh5ZHJhdGlvbkluZm8uZGlzY29ubmVjdGVkTm9kZXMgPSBub2RlSWRzID8gbmV3IFNldChub2RlSWRzKSA6IG51bGw7XG4gIH1cbiAgcmV0dXJuICEhaW5pdERpc2Nvbm5lY3RlZE5vZGVzKGh5ZHJhdGlvbkluZm8pPy5oYXMoaW5kZXgpO1xufVxuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0byBwcmVwYXJlIHRleHQgbm9kZXMgZm9yIHNlcmlhbGl6YXRpb24gYnkgZW5zdXJpbmdcbiAqIHRoYXQgc2VwZXJhdGUgbG9naWNhbCB0ZXh0IGJsb2NrcyBpbiB0aGUgRE9NIHJlbWFpbiBzZXBhcmF0ZSBhZnRlclxuICogc2VyaWFsaXphdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByb2Nlc3NUZXh0Tm9kZUJlZm9yZVNlcmlhbGl6YXRpb24oY29udGV4dDogSHlkcmF0aW9uQ29udGV4dCwgbm9kZTogUk5vZGUpIHtcbiAgLy8gSGFuZGxlIGNhc2VzIHdoZXJlIHRleHQgbm9kZXMgY2FuIGJlIGxvc3QgYWZ0ZXIgRE9NIHNlcmlhbGl6YXRpb246XG4gIC8vICAxLiBXaGVuIHRoZXJlIGlzIGFuICplbXB0eSB0ZXh0IG5vZGUqIGluIERPTTogaW4gdGhpcyBjYXNlLCB0aGlzXG4gIC8vICAgICBub2RlIHdvdWxkIG5vdCBtYWtlIGl0IGludG8gdGhlIHNlcmlhbGl6ZWQgc3RyaW5nIGFuZCBhcyBhIHJlc3VsdCxcbiAgLy8gICAgIHRoaXMgbm9kZSB3b3VsZG4ndCBiZSBjcmVhdGVkIGluIGEgYnJvd3Nlci4gVGhpcyB3b3VsZCByZXN1bHQgaW5cbiAgLy8gICAgIGEgbWlzbWF0Y2ggZHVyaW5nIHRoZSBoeWRyYXRpb24sIHdoZXJlIHRoZSBydW50aW1lIGxvZ2ljIHdvdWxkIGV4cGVjdFxuICAvLyAgICAgYSB0ZXh0IG5vZGUgdG8gYmUgcHJlc2VudCBpbiBsaXZlIERPTSwgYnV0IG5vIHRleHQgbm9kZSB3b3VsZCBleGlzdC5cbiAgLy8gICAgIEV4YW1wbGU6IGA8c3Bhbj57eyBuYW1lIH19PC9zcGFuPmAgd2hlbiB0aGUgYG5hbWVgIGlzIGFuIGVtcHR5IHN0cmluZy5cbiAgLy8gICAgIFRoaXMgd291bGQgcmVzdWx0IGluIGA8c3Bhbj48L3NwYW4+YCBzdHJpbmcgYWZ0ZXIgc2VyaWFsaXphdGlvbiBhbmRcbiAgLy8gICAgIGluIGEgYnJvd3NlciBvbmx5IHRoZSBgc3BhbmAgZWxlbWVudCB3b3VsZCBiZSBjcmVhdGVkLiBUbyByZXNvbHZlIHRoYXQsXG4gIC8vICAgICBhbiBleHRyYSBjb21tZW50IG5vZGUgaXMgYXBwZW5kZWQgaW4gcGxhY2Ugb2YgYW4gZW1wdHkgdGV4dCBub2RlIGFuZFxuICAvLyAgICAgdGhhdCBzcGVjaWFsIGNvbW1lbnQgbm9kZSBpcyByZXBsYWNlZCB3aXRoIGFuIGVtcHR5IHRleHQgbm9kZSAqYmVmb3JlKlxuICAvLyAgICAgaHlkcmF0aW9uLlxuICAvLyAgMi4gV2hlbiB0aGVyZSBhcmUgMiBjb25zZWN1dGl2ZSB0ZXh0IG5vZGVzIHByZXNlbnQgaW4gdGhlIERPTS5cbiAgLy8gICAgIEV4YW1wbGU6IGA8ZGl2PkhlbGxvIDxuZy1jb250YWluZXIgKm5nSWY9XCJ0cnVlXCI+d29ybGQ8L25nLWNvbnRhaW5lcj48L2Rpdj5gLlxuICAvLyAgICAgSW4gdGhpcyBzY2VuYXJpbywgdGhlIGxpdmUgRE9NIHdvdWxkIGxvb2sgbGlrZSB0aGlzOlxuICAvLyAgICAgICA8ZGl2PiN0ZXh0KCdIZWxsbyAnKSAjdGV4dCgnd29ybGQnKSAjY29tbWVudCgnY29udGFpbmVyJyk8L2Rpdj5cbiAgLy8gICAgIFNlcmlhbGl6ZWQgc3RyaW5nIHdvdWxkIGxvb2sgbGlrZSB0aGlzOiBgPGRpdj5IZWxsbyB3b3JsZDwhLS1jb250YWluZXItLT48L2Rpdj5gLlxuICAvLyAgICAgVGhlIGxpdmUgRE9NIGluIGEgYnJvd3NlciBhZnRlciB0aGF0IHdvdWxkIGJlOlxuICAvLyAgICAgICA8ZGl2PiN0ZXh0KCdIZWxsbyB3b3JsZCcpICNjb21tZW50KCdjb250YWluZXInKTwvZGl2PlxuICAvLyAgICAgTm90aWNlIGhvdyAyIHRleHQgbm9kZXMgYXJlIG5vdyBcIm1lcmdlZFwiIGludG8gb25lLiBUaGlzIHdvdWxkIGNhdXNlIGh5ZHJhdGlvblxuICAvLyAgICAgbG9naWMgdG8gZmFpbCwgc2luY2UgaXQnZCBleHBlY3QgMiB0ZXh0IG5vZGVzIGJlaW5nIHByZXNlbnQsIG5vdCBvbmUuXG4gIC8vICAgICBUbyBmaXggdGhpcywgd2UgaW5zZXJ0IGEgc3BlY2lhbCBjb21tZW50IG5vZGUgaW4gYmV0d2VlbiB0aG9zZSB0ZXh0IG5vZGVzLCBzb1xuICAvLyAgICAgc2VyaWFsaXplZCByZXByZXNlbnRhdGlvbiBpczogYDxkaXY+SGVsbG8gPCEtLW5ndG5zLS0+d29ybGQ8IS0tY29udGFpbmVyLS0+PC9kaXY+YC5cbiAgLy8gICAgIFRoaXMgZm9yY2VzIGJyb3dzZXIgdG8gY3JlYXRlIDIgdGV4dCBub2RlcyBzZXBhcmF0ZWQgYnkgYSBjb21tZW50IG5vZGUuXG4gIC8vICAgICBCZWZvcmUgcnVubmluZyBhIGh5ZHJhdGlvbiBwcm9jZXNzLCB0aGlzIHNwZWNpYWwgY29tbWVudCBub2RlIGlzIHJlbW92ZWQsIHNvIHRoZVxuICAvLyAgICAgbGl2ZSBET00gaGFzIGV4YWN0bHkgdGhlIHNhbWUgc3RhdGUgYXMgaXQgd2FzIGJlZm9yZSBzZXJpYWxpemF0aW9uLlxuXG4gIC8vIENvbGxlY3QgdGhpcyBub2RlIGFzIHJlcXVpcmVkIHNwZWNpYWwgYW5ub3RhdGlvbiBvbmx5IHdoZW4gaXRzXG4gIC8vIGNvbnRlbnRzIGlzIGVtcHR5LiBPdGhlcndpc2UsIHN1Y2ggdGV4dCBub2RlIHdvdWxkIGJlIHByZXNlbnQgb25cbiAgLy8gdGhlIGNsaWVudCBhZnRlciBzZXJ2ZXItc2lkZSByZW5kZXJpbmcgYW5kIG5vIHNwZWNpYWwgaGFuZGxpbmcgbmVlZGVkLlxuICBjb25zdCBlbCA9IG5vZGUgYXMgSFRNTEVsZW1lbnQ7XG4gIGNvbnN0IGNvcnJ1cHRlZFRleHROb2RlcyA9IGNvbnRleHQuY29ycnVwdGVkVGV4dE5vZGVzO1xuICBpZiAoZWwudGV4dENvbnRlbnQgPT09ICcnKSB7XG4gICAgY29ycnVwdGVkVGV4dE5vZGVzLnNldChlbCwgVGV4dE5vZGVNYXJrZXIuRW1wdHlOb2RlKTtcbiAgfSBlbHNlIGlmIChlbC5uZXh0U2libGluZz8ubm9kZVR5cGUgPT09IE5vZGUuVEVYVF9OT0RFKSB7XG4gICAgY29ycnVwdGVkVGV4dE5vZGVzLnNldChlbCwgVGV4dE5vZGVNYXJrZXIuU2VwYXJhdG9yKTtcbiAgfVxufVxuIl19