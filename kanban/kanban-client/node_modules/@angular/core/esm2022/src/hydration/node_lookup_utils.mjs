/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { DECLARATION_COMPONENT_VIEW, HEADER_OFFSET, HOST, } from '../render3/interfaces/view';
import { getFirstNativeNode } from '../render3/node_manipulation';
import { ɵɵresolveBody } from '../render3/util/misc_utils';
import { renderStringify } from '../render3/util/stringify_utils';
import { getNativeByTNode, unwrapRNode } from '../render3/util/view_utils';
import { assertDefined } from '../util/assert';
import { compressNodeLocation, decompressNodeLocation } from './compression';
import { nodeNotFoundAtPathError, nodeNotFoundError, validateSiblingNodeExists, } from './error_handling';
import { NodeNavigationStep, NODES, REFERENCE_NODE_BODY, REFERENCE_NODE_HOST, } from './interfaces';
import { calcSerializedContainerSize, getSegmentHead } from './utils';
/** Whether current TNode is a first node in an <ng-container>. */
function isFirstElementInNgContainer(tNode) {
    return !tNode.prev && tNode.parent?.type === 8 /* TNodeType.ElementContainer */;
}
/** Returns an instruction index (subtracting HEADER_OFFSET). */
function getNoOffsetIndex(tNode) {
    return tNode.index - HEADER_OFFSET;
}
/**
 * Check whether a given node exists, but is disconnected from the DOM.
 *
 * Note: we leverage the fact that we have this information available in the DOM emulation
 * layer (in Domino) for now. Longer-term solution should not rely on the DOM emulation and
 * only use internal data structures and state to compute this information.
 */
export function isDisconnectedNode(tNode, lView) {
    return (!(tNode.type & 16 /* TNodeType.Projection */) &&
        !!lView[tNode.index] &&
        !unwrapRNode(lView[tNode.index])?.isConnected);
}
/**
 * Locate a node in an i18n tree that corresponds to a given instruction index.
 *
 * @param hydrationInfo The hydration annotation data
 * @param noOffsetIndex the instruction index
 * @returns an RNode that corresponds to the instruction index
 */
export function locateI18nRNodeByIndex(hydrationInfo, noOffsetIndex) {
    const i18nNodes = hydrationInfo.i18nNodes;
    if (i18nNodes) {
        return i18nNodes.get(noOffsetIndex);
    }
    return undefined;
}
/**
 * Attempt to locate an RNode by a path, if it exists.
 *
 * @param hydrationInfo The hydration annotation data
 * @param lView the current lView
 * @param noOffsetIndex the instruction index
 * @returns an RNode that corresponds to the instruction index or null if no path exists
 */
export function tryLocateRNodeByPath(hydrationInfo, lView, noOffsetIndex) {
    const nodes = hydrationInfo.data[NODES];
    const path = nodes?.[noOffsetIndex];
    return path ? locateRNodeByPath(path, lView) : null;
}
/**
 * Locate a node in DOM tree that corresponds to a given TNode.
 *
 * @param hydrationInfo The hydration annotation data
 * @param tView the current tView
 * @param lView the current lView
 * @param tNode the current tNode
 * @returns an RNode that represents a given tNode
 */
export function locateNextRNode(hydrationInfo, tView, lView, tNode) {
    const noOffsetIndex = getNoOffsetIndex(tNode);
    let native = locateI18nRNodeByIndex(hydrationInfo, noOffsetIndex);
    if (native === undefined) {
        const nodes = hydrationInfo.data[NODES];
        if (nodes?.[noOffsetIndex]) {
            // We know the exact location of the node.
            native = locateRNodeByPath(nodes[noOffsetIndex], lView);
        }
        else if (tView.firstChild === tNode) {
            // We create a first node in this view, so we use a reference
            // to the first child in this DOM segment.
            native = hydrationInfo.firstChild;
        }
        else {
            // Locate a node based on a previous sibling or a parent node.
            const previousTNodeParent = tNode.prev === null;
            const previousTNode = (tNode.prev ?? tNode.parent);
            ngDevMode &&
                assertDefined(previousTNode, 'Unexpected state: current TNode does not have a connection ' +
                    'to the previous node or a parent node.');
            if (isFirstElementInNgContainer(tNode)) {
                const noOffsetParentIndex = getNoOffsetIndex(tNode.parent);
                native = getSegmentHead(hydrationInfo, noOffsetParentIndex);
            }
            else {
                let previousRElement = getNativeByTNode(previousTNode, lView);
                if (previousTNodeParent) {
                    native = previousRElement.firstChild;
                }
                else {
                    // If the previous node is an element, but it also has container info,
                    // this means that we are processing a node like `<div #vcrTarget>`, which is
                    // represented in the DOM as `<div></div>...<!--container-->`.
                    // In this case, there are nodes *after* this element and we need to skip
                    // all of them to reach an element that we are looking for.
                    const noOffsetPrevSiblingIndex = getNoOffsetIndex(previousTNode);
                    const segmentHead = getSegmentHead(hydrationInfo, noOffsetPrevSiblingIndex);
                    if (previousTNode.type === 2 /* TNodeType.Element */ && segmentHead) {
                        const numRootNodesToSkip = calcSerializedContainerSize(hydrationInfo, noOffsetPrevSiblingIndex);
                        // `+1` stands for an anchor comment node after all the views in this container.
                        const nodesToSkip = numRootNodesToSkip + 1;
                        // First node after this segment.
                        native = siblingAfter(nodesToSkip, segmentHead);
                    }
                    else {
                        native = previousRElement.nextSibling;
                    }
                }
            }
        }
    }
    return native;
}
/**
 * Skips over a specified number of nodes and returns the next sibling node after that.
 */
export function siblingAfter(skip, from) {
    let currentNode = from;
    for (let i = 0; i < skip; i++) {
        ngDevMode && validateSiblingNodeExists(currentNode);
        currentNode = currentNode.nextSibling;
    }
    return currentNode;
}
/**
 * Helper function to produce a string representation of the navigation steps
 * (in terms of `nextSibling` and `firstChild` navigations). Used in error
 * messages in dev mode.
 */
function stringifyNavigationInstructions(instructions) {
    const container = [];
    for (let i = 0; i < instructions.length; i += 2) {
        const step = instructions[i];
        const repeat = instructions[i + 1];
        for (let r = 0; r < repeat; r++) {
            container.push(step === NodeNavigationStep.FirstChild ? 'firstChild' : 'nextSibling');
        }
    }
    return container.join('.');
}
/**
 * Helper function that navigates from a starting point node (the `from` node)
 * using provided set of navigation instructions (within `path` argument).
 */
function navigateToNode(from, instructions) {
    let node = from;
    for (let i = 0; i < instructions.length; i += 2) {
        const step = instructions[i];
        const repeat = instructions[i + 1];
        for (let r = 0; r < repeat; r++) {
            if (ngDevMode && !node) {
                throw nodeNotFoundAtPathError(from, stringifyNavigationInstructions(instructions));
            }
            switch (step) {
                case NodeNavigationStep.FirstChild:
                    node = node.firstChild;
                    break;
                case NodeNavigationStep.NextSibling:
                    node = node.nextSibling;
                    break;
            }
        }
    }
    if (ngDevMode && !node) {
        throw nodeNotFoundAtPathError(from, stringifyNavigationInstructions(instructions));
    }
    return node;
}
/**
 * Locates an RNode given a set of navigation instructions (which also contains
 * a starting point node info).
 */
function locateRNodeByPath(path, lView) {
    const [referenceNode, ...navigationInstructions] = decompressNodeLocation(path);
    let ref;
    if (referenceNode === REFERENCE_NODE_HOST) {
        ref = lView[DECLARATION_COMPONENT_VIEW][HOST];
    }
    else if (referenceNode === REFERENCE_NODE_BODY) {
        ref = ɵɵresolveBody(lView[DECLARATION_COMPONENT_VIEW][HOST]);
    }
    else {
        const parentElementId = Number(referenceNode);
        ref = unwrapRNode(lView[parentElementId + HEADER_OFFSET]);
    }
    return navigateToNode(ref, navigationInstructions);
}
/**
 * Generate a list of DOM navigation operations to get from node `start` to node `finish`.
 *
 * Note: assumes that node `start` occurs before node `finish` in an in-order traversal of the DOM
 * tree. That is, we should be able to get from `start` to `finish` purely by using `.firstChild`
 * and `.nextSibling` operations.
 */
export function navigateBetween(start, finish) {
    if (start === finish) {
        return [];
    }
    else if (start.parentElement == null || finish.parentElement == null) {
        return null;
    }
    else if (start.parentElement === finish.parentElement) {
        return navigateBetweenSiblings(start, finish);
    }
    else {
        // `finish` is a child of its parent, so the parent will always have a child.
        const parent = finish.parentElement;
        const parentPath = navigateBetween(start, parent);
        const childPath = navigateBetween(parent.firstChild, finish);
        if (!parentPath || !childPath)
            return null;
        return [
            // First navigate to `finish`'s parent
            ...parentPath,
            // Then to its first child.
            NodeNavigationStep.FirstChild,
            // And finally from that node to `finish` (maybe a no-op if we're already there).
            ...childPath,
        ];
    }
}
/**
 * Calculates a path between 2 sibling nodes (generates a number of `NextSibling` navigations).
 * Returns `null` if no such path exists between the given nodes.
 */
function navigateBetweenSiblings(start, finish) {
    const nav = [];
    let node = null;
    for (node = start; node != null && node !== finish; node = node.nextSibling) {
        nav.push(NodeNavigationStep.NextSibling);
    }
    // If the `node` becomes `null` or `undefined` at the end, that means that we
    // didn't find the `end` node, thus return `null` (which would trigger serialization
    // error to be produced).
    return node == null ? null : nav;
}
/**
 * Calculates a path between 2 nodes in terms of `nextSibling` and `firstChild`
 * navigations:
 * - the `from` node is a known node, used as an starting point for the lookup
 *   (the `fromNodeName` argument is a string representation of the node).
 * - the `to` node is a node that the runtime logic would be looking up,
 *   using the path generated by this function.
 */
export function calcPathBetween(from, to, fromNodeName) {
    const path = navigateBetween(from, to);
    return path === null ? null : compressNodeLocation(fromNodeName, path);
}
/**
 * Invoked at serialization time (on the server) when a set of navigation
 * instructions needs to be generated for a TNode.
 */
export function calcPathForNode(tNode, lView, excludedParentNodes) {
    let parentTNode = tNode.parent;
    let parentIndex;
    let parentRNode;
    let referenceNodeName;
    // Skip over all parent nodes that are disconnected from the DOM, such nodes
    // can not be used as anchors.
    //
    // This might happen in certain content projection-based use-cases, where
    // a content of an element is projected and used, when a parent element
    // itself remains detached from DOM. In this scenario we try to find a parent
    // element that is attached to DOM and can act as an anchor instead.
    //
    // It can also happen that the parent node should be excluded, for example,
    // because it belongs to an i18n block, which requires paths which aren't
    // relative to other views in an i18n block.
    while (parentTNode !== null &&
        (isDisconnectedNode(parentTNode, lView) || excludedParentNodes?.has(parentTNode.index))) {
        parentTNode = parentTNode.parent;
    }
    if (parentTNode === null || !(parentTNode.type & 3 /* TNodeType.AnyRNode */)) {
        // If there is no parent TNode or a parent TNode does not represent an RNode
        // (i.e. not a DOM node), use component host element as a reference node.
        parentIndex = referenceNodeName = REFERENCE_NODE_HOST;
        parentRNode = lView[DECLARATION_COMPONENT_VIEW][HOST];
    }
    else {
        // Use parent TNode as a reference node.
        parentIndex = parentTNode.index;
        parentRNode = unwrapRNode(lView[parentIndex]);
        referenceNodeName = renderStringify(parentIndex - HEADER_OFFSET);
    }
    let rNode = unwrapRNode(lView[tNode.index]);
    if (tNode.type & 12 /* TNodeType.AnyContainer */) {
        // For <ng-container> nodes, instead of serializing a reference
        // to the anchor comment node, serialize a location of the first
        // DOM element. Paired with the container size (serialized as a part
        // of `ngh.containers`), it should give enough information for runtime
        // to hydrate nodes in this container.
        const firstRNode = getFirstNativeNode(lView, tNode);
        // If container is not empty, use a reference to the first element,
        // otherwise, rNode would point to an anchor comment node.
        if (firstRNode) {
            rNode = firstRNode;
        }
    }
    let path = calcPathBetween(parentRNode, rNode, referenceNodeName);
    if (path === null && parentRNode !== rNode) {
        // Searching for a path between elements within a host node failed.
        // Trying to find a path to an element starting from the `document.body` instead.
        //
        // Important note: this type of reference is relatively unstable, since Angular
        // may not be able to control parts of the page that the runtime logic navigates
        // through. This is mostly needed to cover "portals" use-case (like menus, dialog boxes,
        // etc), where nodes are content-projected (including direct DOM manipulations) outside
        // of the host node. The better solution is to provide APIs to work with "portals",
        // at which point this code path would not be needed.
        const body = parentRNode.ownerDocument.body;
        path = calcPathBetween(body, rNode, REFERENCE_NODE_BODY);
        if (path === null) {
            // If the path is still empty, it's likely that this node is detached and
            // won't be found during hydration.
            throw nodeNotFoundError(lView, tNode);
        }
    }
    return path;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZV9sb29rdXBfdXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9oeWRyYXRpb24vbm9kZV9sb29rdXBfdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBSUgsT0FBTyxFQUNMLDBCQUEwQixFQUMxQixhQUFhLEVBQ2IsSUFBSSxHQUdMLE1BQU0sNEJBQTRCLENBQUM7QUFDcEMsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0sOEJBQThCLENBQUM7QUFDaEUsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLDRCQUE0QixDQUFDO0FBQ3pELE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxpQ0FBaUMsQ0FBQztBQUNoRSxPQUFPLEVBQUMsZ0JBQWdCLEVBQUUsV0FBVyxFQUFDLE1BQU0sNEJBQTRCLENBQUM7QUFDekUsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBRTdDLE9BQU8sRUFBQyxvQkFBb0IsRUFBRSxzQkFBc0IsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUMzRSxPQUFPLEVBQ0wsdUJBQXVCLEVBQ3ZCLGlCQUFpQixFQUNqQix5QkFBeUIsR0FDMUIsTUFBTSxrQkFBa0IsQ0FBQztBQUMxQixPQUFPLEVBRUwsa0JBQWtCLEVBQ2xCLEtBQUssRUFDTCxtQkFBbUIsRUFDbkIsbUJBQW1CLEdBQ3BCLE1BQU0sY0FBYyxDQUFDO0FBQ3RCLE9BQU8sRUFBQywyQkFBMkIsRUFBRSxjQUFjLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFFcEUsa0VBQWtFO0FBQ2xFLFNBQVMsMkJBQTJCLENBQUMsS0FBWTtJQUMvQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxLQUFLLENBQUMsTUFBTSxFQUFFLElBQUksdUNBQStCLENBQUM7QUFDMUUsQ0FBQztBQUVELGdFQUFnRTtBQUNoRSxTQUFTLGdCQUFnQixDQUFDLEtBQVk7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SUFBSSxHQUFrQixlQUFlLENBQUMsV0FBbUIsRUFBRSxLQUFhLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztJQUNqRyxJQUFJLElBQUksS0FBSyxJQUFJLElBQUksV0FBVyxLQUFLLEtBQUssRUFBRSxDQUFDO1FBQzNDLG1FQUFtRTtRQUNuRSxpRkFBaUY7UUFDakYsRUFBRTtRQUNGLCtFQUErRTtRQUMvRSxnRkFBZ0Y7UUFDaEYsd0ZBQXdGO1FBQ3hGLHVGQUF1RjtRQUN2RixtRkFBbUY7UUFDbkYscURBQXFEO1FBQ3JELE1BQU0sSUFBSSxHQUFJLFdBQW9CLENBQUMsYUFBYyxDQUFDLElBQVksQ0FBQztRQUMvRCxJQUFJLEdBQUcsZUFBZSxDQUFDLElBQUksRUFBRSxLQUFhLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztRQUVqRSxJQUFJLElBQUksS0FBSyxJQUFJLEVBQUUsQ0FBQztZQUNsQix5RUFBeUU7WUFDekUsbUNBQW1DO1lBQ25DLE1BQU0saUJBQWlCLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3hDLENBQUM7SUFDSCxDQUFDO0lBQ0QsT0FBTyxJQUFLLENBQUM7QUFDZixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7VE5vZGUsIFROb2RlVHlwZX0gZnJvbSAnLi4vcmVuZGVyMy9pbnRlcmZhY2VzL25vZGUnO1xuaW1wb3J0IHtSRWxlbWVudCwgUk5vZGV9IGZyb20gJy4uL3JlbmRlcjMvaW50ZXJmYWNlcy9yZW5kZXJlcl9kb20nO1xuaW1wb3J0IHtcbiAgREVDTEFSQVRJT05fQ09NUE9ORU5UX1ZJRVcsXG4gIEhFQURFUl9PRkZTRVQsXG4gIEhPU1QsXG4gIExWaWV3LFxuICBUVmlldyxcbn0gZnJvbSAnLi4vcmVuZGVyMy9pbnRlcmZhY2VzL3ZpZXcnO1xuaW1wb3J0IHtnZXRGaXJzdE5hdGl2ZU5vZGV9IGZyb20gJy4uL3JlbmRlcjMvbm9kZV9tYW5pcHVsYXRpb24nO1xuaW1wb3J0IHvJtcm1cmVzb2x2ZUJvZHl9IGZyb20gJy4uL3JlbmRlcjMvdXRpbC9taXNjX3V0aWxzJztcbmltcG9ydCB7cmVuZGVyU3RyaW5naWZ5fSBmcm9tICcuLi9yZW5kZXIzL3V0aWwvc3RyaW5naWZ5X3V0aWxzJztcbmltcG9ydCB7Z2V0TmF0aXZlQnlUTm9kZSwgdW53cmFwUk5vZGV9IGZyb20gJy4uL3JlbmRlcjMvdXRpbC92aWV3X3V0aWxzJztcbmltcG9ydCB7YXNzZXJ0RGVmaW5lZH0gZnJvbSAnLi4vdXRpbC9hc3NlcnQnO1xuXG5pbXBvcnQge2NvbXByZXNzTm9kZUxvY2F0aW9uLCBkZWNvbXByZXNzTm9kZUxvY2F0aW9ufSBmcm9tICcuL2NvbXByZXNzaW9uJztcbmltcG9ydCB7XG4gIG5vZGVOb3RGb3VuZEF0UGF0aEVycm9yLFxuICBub2RlTm90Rm91bmRFcnJvcixcbiAgdmFsaWRhdGVTaWJsaW5nTm9kZUV4aXN0cyxcbn0gZnJvbSAnLi9lcnJvcl9oYW5kbGluZyc7XG5pbXBvcnQge1xuICBEZWh5ZHJhdGVkVmlldyxcbiAgTm9kZU5hdmlnYXRpb25TdGVwLFxuICBOT0RFUyxcbiAgUkVGRVJFTkNFX05PREVfQk9EWSxcbiAgUkVGRVJFTkNFX05PREVfSE9TVCxcbn0gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmltcG9ydCB7Y2FsY1NlcmlhbGl6ZWRDb250YWluZXJTaXplLCBnZXRTZWdtZW50SGVhZH0gZnJvbSAnLi91dGlscyc7XG5cbi8qKiBXaGV0aGVyIGN1cnJlbnQgVE5vZGUgaXMgYSBmaXJzdCBub2RlIGluIGFuIDxuZy1jb250YWluZXI+LiAqL1xuZnVuY3Rpb24gaXNGaXJzdEVsZW1lbnRJbk5nQ29udGFpbmVyKHROb2RlOiBUTm9kZSk6IGJvb2xlYW4ge1xuICByZXR1cm4gIXROb2RlLnByZXYgJiYgdE5vZGUucGFyZW50Py50eXBlID09PSBUTm9kZVR5cGUuRWxlbWVudENvbnRhaW5lcjtcbn1cblxuLyoqIFJldHVybnMgYW4gaW5zdHJ1Y3Rpb24gaW5kZXggKHN1YnRyYWN0aW5nIEhFQURFUl9PRkZTRVQpLiAqL1xuZnVuY3Rpb24gZ2V0Tm9PZmZzZXRJbmRleCh0Tm9kZTogVE5vZGUpOiBudW1iZXIge1xuICByZXR1cm4gdE5vZGUuaW5kZXggLSBIRUFERVJfT0ZGU0VUO1xufVxuXG4vKipcbiAqIENoZWNrIHdoZXRoZXIgYSBnaXZlbiBub2RlIGV4aXN0cywgYnV0IGlzIGRpc2Nvbm5lY3RlZCBmcm9tIHRoZSBET00uXG4gKlxuICogTm90ZTogd2UgbGV2ZXJhZ2UgdGhlIGZhY3QgdGhhdCB3ZSBoYXZlIHRoaXMgaW5mb3JtYXRpb24gYXZhaWxhYmxlIGluIHRoZSBET00gZW11bGF0aW9uXG4gKiBsYXllciAoaW4gRG9taW5vKSBmb3Igbm93LiBMb25nZXItdGVybSBzb2x1dGlvbiBzaG91bGQgbm90IHJlbHkgb24gdGhlIERPTSBlbXVsYXRpb24gYW5kXG4gKiBvbmx5IHVzZSBpbnRlcm5hbCBkYXRhIHN0cnVjdHVyZXMgYW5kIHN0YXRlIHRvIGNvbXB1dGUgdGhpcyBpbmZvcm1hdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRGlzY29ubmVjdGVkTm9kZSh0Tm9kZTogVE5vZGUsIGxWaWV3OiBMVmlldykge1xuICByZXR1cm4gKFxuICAgICEodE5vZGUudHlwZSAmIFROb2RlVHlwZS5Qcm9qZWN0aW9uKSAmJlxuICAgICEhbFZpZXdbdE5vZGUuaW5kZXhdICYmXG4gICAgISh1bndyYXBSTm9kZShsVmlld1t0Tm9kZS5pbmRleF0pIGFzIE5vZGUpPy5pc0Nvbm5lY3RlZFxuICApO1xufVxuXG4vKipcbiAqIExvY2F0ZSBhIG5vZGUgaW4gYW4gaTE4biB0cmVlIHRoYXQgY29ycmVzcG9uZHMgdG8gYSBnaXZlbiBpbnN0cnVjdGlvbiBpbmRleC5cbiAqXG4gKiBAcGFyYW0gaHlkcmF0aW9uSW5mbyBUaGUgaHlkcmF0aW9uIGFubm90YXRpb24gZGF0YVxuICogQHBhcmFtIG5vT2Zmc2V0SW5kZXggdGhlIGluc3RydWN0aW9uIGluZGV4XG4gKiBAcmV0dXJucyBhbiBSTm9kZSB0aGF0IGNvcnJlc3BvbmRzIHRvIHRoZSBpbnN0cnVjdGlvbiBpbmRleFxuICovXG5leHBvcnQgZnVuY3Rpb24gbG9jYXRlSTE4blJOb2RlQnlJbmRleDxUIGV4dGVuZHMgUk5vZGU+KFxuICBoeWRyYXRpb25JbmZvOiBEZWh5ZHJhdGVkVmlldyxcbiAgbm9PZmZzZXRJbmRleDogbnVtYmVyLFxuKTogVCB8IG51bGwgfCB1bmRlZmluZWQge1xuICBjb25zdCBpMThuTm9kZXMgPSBoeWRyYXRpb25JbmZvLmkxOG5Ob2RlcztcbiAgaWYgKGkxOG5Ob2Rlcykge1xuICAgIHJldHVybiBpMThuTm9kZXMuZ2V0KG5vT2Zmc2V0SW5kZXgpIGFzIFQgfCBudWxsIHwgdW5kZWZpbmVkO1xuICB9XG4gIHJldHVybiB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogQXR0ZW1wdCB0byBsb2NhdGUgYW4gUk5vZGUgYnkgYSBwYXRoLCBpZiBpdCBleGlzdHMuXG4gKlxuICogQHBhcmFtIGh5ZHJhdGlvbkluZm8gVGhlIGh5ZHJhdGlvbiBhbm5vdGF0aW9uIGRhdGFcbiAqIEBwYXJhbSBsVmlldyB0aGUgY3VycmVudCBsVmlld1xuICogQHBhcmFtIG5vT2Zmc2V0SW5kZXggdGhlIGluc3RydWN0aW9uIGluZGV4XG4gKiBAcmV0dXJucyBhbiBSTm9kZSB0aGF0IGNvcnJlc3BvbmRzIHRvIHRoZSBpbnN0cnVjdGlvbiBpbmRleCBvciBudWxsIGlmIG5vIHBhdGggZXhpc3RzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cnlMb2NhdGVSTm9kZUJ5UGF0aChcbiAgaHlkcmF0aW9uSW5mbzogRGVoeWRyYXRlZFZpZXcsXG4gIGxWaWV3OiBMVmlldzx1bmtub3duPixcbiAgbm9PZmZzZXRJbmRleDogbnVtYmVyLFxuKTogUk5vZGUgfCBudWxsIHtcbiAgY29uc3Qgbm9kZXMgPSBoeWRyYXRpb25JbmZvLmRhdGFbTk9ERVNdO1xuICBjb25zdCBwYXRoID0gbm9kZXM/Lltub09mZnNldEluZGV4XTtcbiAgcmV0dXJuIHBhdGggPyBsb2NhdGVSTm9kZUJ5UGF0aChwYXRoLCBsVmlldykgOiBudWxsO1xufVxuXG4vKipcbiAqIExvY2F0ZSBhIG5vZGUgaW4gRE9NIHRyZWUgdGhhdCBjb3JyZXNwb25kcyB0byBhIGdpdmVuIFROb2RlLlxuICpcbiAqIEBwYXJhbSBoeWRyYXRpb25JbmZvIFRoZSBoeWRyYXRpb24gYW5ub3RhdGlvbiBkYXRhXG4gKiBAcGFyYW0gdFZpZXcgdGhlIGN1cnJlbnQgdFZpZXdcbiAqIEBwYXJhbSBsVmlldyB0aGUgY3VycmVudCBsVmlld1xuICogQHBhcmFtIHROb2RlIHRoZSBjdXJyZW50IHROb2RlXG4gKiBAcmV0dXJucyBhbiBSTm9kZSB0aGF0IHJlcHJlc2VudHMgYSBnaXZlbiB0Tm9kZVxuICovXG5leHBvcnQgZnVuY3Rpb24gbG9jYXRlTmV4dFJOb2RlPFQgZXh0ZW5kcyBSTm9kZT4oXG4gIGh5ZHJhdGlvbkluZm86IERlaHlkcmF0ZWRWaWV3LFxuICB0VmlldzogVFZpZXcsXG4gIGxWaWV3OiBMVmlldzx1bmtub3duPixcbiAgdE5vZGU6IFROb2RlLFxuKTogVCB8IG51bGwge1xuICBjb25zdCBub09mZnNldEluZGV4ID0gZ2V0Tm9PZmZzZXRJbmRleCh0Tm9kZSk7XG4gIGxldCBuYXRpdmUgPSBsb2NhdGVJMThuUk5vZGVCeUluZGV4KGh5ZHJhdGlvbkluZm8sIG5vT2Zmc2V0SW5kZXgpO1xuXG4gIGlmIChuYXRpdmUgPT09IHVuZGVmaW5lZCkge1xuICAgIGNvbnN0IG5vZGVzID0gaHlkcmF0aW9uSW5mby5kYXRhW05PREVTXTtcbiAgICBpZiAobm9kZXM/Lltub09mZnNldEluZGV4XSkge1xuICAgICAgLy8gV2Uga25vdyB0aGUgZXhhY3QgbG9jYXRpb24gb2YgdGhlIG5vZGUuXG4gICAgICBuYXRpdmUgPSBsb2NhdGVSTm9kZUJ5UGF0aChub2Rlc1tub09mZnNldEluZGV4XSwgbFZpZXcpO1xuICAgIH0gZWxzZSBpZiAodFZpZXcuZmlyc3RDaGlsZCA9PT0gdE5vZGUpIHtcbiAgICAgIC8vIFdlIGNyZWF0ZSBhIGZpcnN0IG5vZGUgaW4gdGhpcyB2aWV3LCBzbyB3ZSB1c2UgYSByZWZlcmVuY2VcbiAgICAgIC8vIHRvIHRoZSBmaXJzdCBjaGlsZCBpbiB0aGlzIERPTSBzZWdtZW50LlxuICAgICAgbmF0aXZlID0gaHlkcmF0aW9uSW5mby5maXJzdENoaWxkO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBMb2NhdGUgYSBub2RlIGJhc2VkIG9uIGEgcHJldmlvdXMgc2libGluZyBvciBhIHBhcmVudCBub2RlLlxuICAgICAgY29uc3QgcHJldmlvdXNUTm9kZVBhcmVudCA9IHROb2RlLnByZXYgPT09IG51bGw7XG4gICAgICBjb25zdCBwcmV2aW91c1ROb2RlID0gKHROb2RlLnByZXYgPz8gdE5vZGUucGFyZW50KSE7XG4gICAgICBuZ0Rldk1vZGUgJiZcbiAgICAgICAgYXNzZXJ0RGVmaW5lZChcbiAgICAgICAgICBwcmV2aW91c1ROb2RlLFxuICAgICAgICAgICdVbmV4cGVjdGVkIHN0YXRlOiBjdXJyZW50IFROb2RlIGRvZXMgbm90IGhhdmUgYSBjb25uZWN0aW9uICcgK1xuICAgICAgICAgICAgJ3RvIHRoZSBwcmV2aW91cyBub2RlIG9yIGEgcGFyZW50IG5vZGUuJyxcbiAgICAgICAgKTtcbiAgICAgIGlmIChpc0ZpcnN0RWxlbWVudEluTmdDb250YWluZXIodE5vZGUpKSB7XG4gICAgICAgIGNvbnN0IG5vT2Zmc2V0UGFyZW50SW5kZXggPSBnZXROb09mZnNldEluZGV4KHROb2RlLnBhcmVudCEpO1xuICAgICAgICBuYXRpdmUgPSBnZXRTZWdtZW50SGVhZChoeWRyYXRpb25JbmZvLCBub09mZnNldFBhcmVudEluZGV4KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCBwcmV2aW91c1JFbGVtZW50ID0gZ2V0TmF0aXZlQnlUTm9kZShwcmV2aW91c1ROb2RlLCBsVmlldyk7XG4gICAgICAgIGlmIChwcmV2aW91c1ROb2RlUGFyZW50KSB7XG4gICAgICAgICAgbmF0aXZlID0gKHByZXZpb3VzUkVsZW1lbnQgYXMgUkVsZW1lbnQpLmZpcnN0Q2hpbGQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gSWYgdGhlIHByZXZpb3VzIG5vZGUgaXMgYW4gZWxlbWVudCwgYnV0IGl0IGFsc28gaGFzIGNvbnRhaW5lciBpbmZvLFxuICAgICAgICAgIC8vIHRoaXMgbWVhbnMgdGhhdCB3ZSBhcmUgcHJvY2Vzc2luZyBhIG5vZGUgbGlrZSBgPGRpdiAjdmNyVGFyZ2V0PmAsIHdoaWNoIGlzXG4gICAgICAgICAgLy8gcmVwcmVzZW50ZWQgaW4gdGhlIERPTSBhcyBgPGRpdj48L2Rpdj4uLi48IS0tY29udGFpbmVyLS0+YC5cbiAgICAgICAgICAvLyBJbiB0aGlzIGNhc2UsIHRoZXJlIGFyZSBub2RlcyAqYWZ0ZXIqIHRoaXMgZWxlbWVudCBhbmQgd2UgbmVlZCB0byBza2lwXG4gICAgICAgICAgLy8gYWxsIG9mIHRoZW0gdG8gcmVhY2ggYW4gZWxlbWVudCB0aGF0IHdlIGFyZSBsb29raW5nIGZvci5cbiAgICAgICAgICBjb25zdCBub09mZnNldFByZXZTaWJsaW5nSW5kZXggPSBnZXROb09mZnNldEluZGV4KHByZXZpb3VzVE5vZGUpO1xuICAgICAgICAgIGNvbnN0IHNlZ21lbnRIZWFkID0gZ2V0U2VnbWVudEhlYWQoaHlkcmF0aW9uSW5mbywgbm9PZmZzZXRQcmV2U2libGluZ0luZGV4KTtcbiAgICAgICAgICBpZiAocHJldmlvdXNUTm9kZS50eXBlID09PSBUTm9kZVR5cGUuRWxlbWVudCAmJiBzZWdtZW50SGVhZCkge1xuICAgICAgICAgICAgY29uc3QgbnVtUm9vdE5vZGVzVG9Ta2lwID0gY2FsY1NlcmlhbGl6ZWRDb250YWluZXJTaXplKFxuICAgICAgICAgICAgICBoeWRyYXRpb25JbmZvLFxuICAgICAgICAgICAgICBub09mZnNldFByZXZTaWJsaW5nSW5kZXgsXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgLy8gYCsxYCBzdGFuZHMgZm9yIGFuIGFuY2hvciBjb21tZW50IG5vZGUgYWZ0ZXIgYWxsIHRoZSB2aWV3cyBpbiB0aGlzIGNvbnRhaW5lci5cbiAgICAgICAgICAgIGNvbnN0IG5vZGVzVG9Ta2lwID0gbnVtUm9vdE5vZGVzVG9Ta2lwICsgMTtcbiAgICAgICAgICAgIC8vIEZpcnN0IG5vZGUgYWZ0ZXIgdGhpcyBzZWdtZW50LlxuICAgICAgICAgICAgbmF0aXZlID0gc2libGluZ0FmdGVyKG5vZGVzVG9Ta2lwLCBzZWdtZW50SGVhZCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5hdGl2ZSA9IHByZXZpb3VzUkVsZW1lbnQubmV4dFNpYmxpbmc7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBuYXRpdmUgYXMgVDtcbn1cblxuLyoqXG4gKiBTa2lwcyBvdmVyIGEgc3BlY2lmaWVkIG51bWJlciBvZiBub2RlcyBhbmQgcmV0dXJucyB0aGUgbmV4dCBzaWJsaW5nIG5vZGUgYWZ0ZXIgdGhhdC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNpYmxpbmdBZnRlcjxUIGV4dGVuZHMgUk5vZGU+KHNraXA6IG51bWJlciwgZnJvbTogUk5vZGUpOiBUIHwgbnVsbCB7XG4gIGxldCBjdXJyZW50Tm9kZSA9IGZyb207XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc2tpcDsgaSsrKSB7XG4gICAgbmdEZXZNb2RlICYmIHZhbGlkYXRlU2libGluZ05vZGVFeGlzdHMoY3VycmVudE5vZGUpO1xuICAgIGN1cnJlbnROb2RlID0gY3VycmVudE5vZGUubmV4dFNpYmxpbmchO1xuICB9XG4gIHJldHVybiBjdXJyZW50Tm9kZSBhcyBUO1xufVxuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0byBwcm9kdWNlIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBuYXZpZ2F0aW9uIHN0ZXBzXG4gKiAoaW4gdGVybXMgb2YgYG5leHRTaWJsaW5nYCBhbmQgYGZpcnN0Q2hpbGRgIG5hdmlnYXRpb25zKS4gVXNlZCBpbiBlcnJvclxuICogbWVzc2FnZXMgaW4gZGV2IG1vZGUuXG4gKi9cbmZ1bmN0aW9uIHN0cmluZ2lmeU5hdmlnYXRpb25JbnN0cnVjdGlvbnMoaW5zdHJ1Y3Rpb25zOiAobnVtYmVyIHwgTm9kZU5hdmlnYXRpb25TdGVwKVtdKTogc3RyaW5nIHtcbiAgY29uc3QgY29udGFpbmVyID0gW107XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgaW5zdHJ1Y3Rpb25zLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgY29uc3Qgc3RlcCA9IGluc3RydWN0aW9uc1tpXTtcbiAgICBjb25zdCByZXBlYXQgPSBpbnN0cnVjdGlvbnNbaSArIDFdIGFzIG51bWJlcjtcbiAgICBmb3IgKGxldCByID0gMDsgciA8IHJlcGVhdDsgcisrKSB7XG4gICAgICBjb250YWluZXIucHVzaChzdGVwID09PSBOb2RlTmF2aWdhdGlvblN0ZXAuRmlyc3RDaGlsZCA/ICdmaXJzdENoaWxkJyA6ICduZXh0U2libGluZycpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gY29udGFpbmVyLmpvaW4oJy4nKTtcbn1cblxuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdGhhdCBuYXZpZ2F0ZXMgZnJvbSBhIHN0YXJ0aW5nIHBvaW50IG5vZGUgKHRoZSBgZnJvbWAgbm9kZSlcbiAqIHVzaW5nIHByb3ZpZGVkIHNldCBvZiBuYXZpZ2F0aW9uIGluc3RydWN0aW9ucyAod2l0aGluIGBwYXRoYCBhcmd1bWVudCkuXG4gKi9cbmZ1bmN0aW9uIG5hdmlnYXRlVG9Ob2RlKGZyb206IE5vZGUsIGluc3RydWN0aW9uczogKG51bWJlciB8IE5vZGVOYXZpZ2F0aW9uU3RlcClbXSk6IFJOb2RlIHtcbiAgbGV0IG5vZGUgPSBmcm9tO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGluc3RydWN0aW9ucy5sZW5ndGg7IGkgKz0gMikge1xuICAgIGNvbnN0IHN0ZXAgPSBpbnN0cnVjdGlvbnNbaV07XG4gICAgY29uc3QgcmVwZWF0ID0gaW5zdHJ1Y3Rpb25zW2kgKyAxXSBhcyBudW1iZXI7XG4gICAgZm9yIChsZXQgciA9IDA7IHIgPCByZXBlYXQ7IHIrKykge1xuICAgICAgaWYgKG5nRGV2TW9kZSAmJiAhbm9kZSkge1xuICAgICAgICB0aHJvdyBub2RlTm90Rm91bmRBdFBhdGhFcnJvcihmcm9tLCBzdHJpbmdpZnlOYXZpZ2F0aW9uSW5zdHJ1Y3Rpb25zKGluc3RydWN0aW9ucykpO1xuICAgICAgfVxuICAgICAgc3dpdGNoIChzdGVwKSB7XG4gICAgICAgIGNhc2UgTm9kZU5hdmlnYXRpb25TdGVwLkZpcnN0Q2hpbGQ6XG4gICAgICAgICAgbm9kZSA9IG5vZGUuZmlyc3RDaGlsZCE7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgTm9kZU5hdmlnYXRpb25TdGVwLk5leHRTaWJsaW5nOlxuICAgICAgICAgIG5vZGUgPSBub2RlLm5leHRTaWJsaW5nITtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgaWYgKG5nRGV2TW9kZSAmJiAhbm9kZSkge1xuICAgIHRocm93IG5vZGVOb3RGb3VuZEF0UGF0aEVycm9yKGZyb20sIHN0cmluZ2lmeU5hdmlnYXRpb25JbnN0cnVjdGlvbnMoaW5zdHJ1Y3Rpb25zKSk7XG4gIH1cbiAgcmV0dXJuIG5vZGUgYXMgUk5vZGU7XG59XG5cbi8qKlxuICogTG9jYXRlcyBhbiBSTm9kZSBnaXZlbiBhIHNldCBvZiBuYXZpZ2F0aW9uIGluc3RydWN0aW9ucyAod2hpY2ggYWxzbyBjb250YWluc1xuICogYSBzdGFydGluZyBwb2ludCBub2RlIGluZm8pLlxuICovXG5mdW5jdGlvbiBsb2NhdGVSTm9kZUJ5UGF0aChwYXRoOiBzdHJpbmcsIGxWaWV3OiBMVmlldyk6IFJOb2RlIHtcbiAgY29uc3QgW3JlZmVyZW5jZU5vZGUsIC4uLm5hdmlnYXRpb25JbnN0cnVjdGlvbnNdID0gZGVjb21wcmVzc05vZGVMb2NhdGlvbihwYXRoKTtcbiAgbGV0IHJlZjogRWxlbWVudDtcbiAgaWYgKHJlZmVyZW5jZU5vZGUgPT09IFJFRkVSRU5DRV9OT0RFX0hPU1QpIHtcbiAgICByZWYgPSBsVmlld1tERUNMQVJBVElPTl9DT01QT05FTlRfVklFV11bSE9TVF0gYXMgdW5rbm93biBhcyBFbGVtZW50O1xuICB9IGVsc2UgaWYgKHJlZmVyZW5jZU5vZGUgPT09IFJFRkVSRU5DRV9OT0RFX0JPRFkpIHtcbiAgICByZWYgPSDJtcm1cmVzb2x2ZUJvZHkoXG4gICAgICBsVmlld1tERUNMQVJBVElPTl9DT01QT05FTlRfVklFV11bSE9TVF0gYXMgUkVsZW1lbnQgJiB7b3duZXJEb2N1bWVudDogRG9jdW1lbnR9LFxuICAgICk7XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgcGFyZW50RWxlbWVudElkID0gTnVtYmVyKHJlZmVyZW5jZU5vZGUpO1xuICAgIHJlZiA9IHVud3JhcFJOb2RlKChsVmlldyBhcyBhbnkpW3BhcmVudEVsZW1lbnRJZCArIEhFQURFUl9PRkZTRVRdKSBhcyBFbGVtZW50O1xuICB9XG4gIHJldHVybiBuYXZpZ2F0ZVRvTm9kZShyZWYsIG5hdmlnYXRpb25JbnN0cnVjdGlvbnMpO1xufVxuXG4vKipcbiAqIEdlbmVyYXRlIGEgbGlzdCBvZiBET00gbmF2aWdhdGlvbiBvcGVyYXRpb25zIHRvIGdldCBmcm9tIG5vZGUgYHN0YXJ0YCB0byBub2RlIGBmaW5pc2hgLlxuICpcbiAqIE5vdGU6IGFzc3VtZXMgdGhhdCBub2RlIGBzdGFydGAgb2NjdXJzIGJlZm9yZSBub2RlIGBmaW5pc2hgIGluIGFuIGluLW9yZGVyIHRyYXZlcnNhbCBvZiB0aGUgRE9NXG4gKiB0cmVlLiBUaGF0IGlzLCB3ZSBzaG91bGQgYmUgYWJsZSB0byBnZXQgZnJvbSBgc3RhcnRgIHRvIGBmaW5pc2hgIHB1cmVseSBieSB1c2luZyBgLmZpcnN0Q2hpbGRgXG4gKiBhbmQgYC5uZXh0U2libGluZ2Agb3BlcmF0aW9ucy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5hdmlnYXRlQmV0d2VlbihzdGFydDogTm9kZSwgZmluaXNoOiBOb2RlKTogTm9kZU5hdmlnYXRpb25TdGVwW10gfCBudWxsIHtcbiAgaWYgKHN0YXJ0ID09PSBmaW5pc2gpIHtcbiAgICByZXR1cm4gW107XG4gIH0gZWxzZSBpZiAoc3RhcnQucGFyZW50RWxlbWVudCA9PSBudWxsIHx8IGZpbmlzaC5wYXJlbnRFbGVtZW50ID09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfSBlbHNlIGlmIChzdGFydC5wYXJlbnRFbGVtZW50ID09PSBmaW5pc2gucGFyZW50RWxlbWVudCkge1xuICAgIHJldHVybiBuYXZpZ2F0ZUJldHdlZW5TaWJsaW5ncyhzdGFydCwgZmluaXNoKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBgZmluaXNoYCBpcyBhIGNoaWxkIG9mIGl0cyBwYXJlbnQsIHNvIHRoZSBwYXJlbnQgd2lsbCBhbHdheXMgaGF2ZSBhIGNoaWxkLlxuICAgIGNvbnN0IHBhcmVudCA9IGZpbmlzaC5wYXJlbnRFbGVtZW50ITtcblxuICAgIGNvbnN0IHBhcmVudFBhdGggPSBuYXZpZ2F0ZUJldHdlZW4oc3RhcnQsIHBhcmVudCk7XG4gICAgY29uc3QgY2hpbGRQYXRoID0gbmF2aWdhdGVCZXR3ZWVuKHBhcmVudC5maXJzdENoaWxkISwgZmluaXNoKTtcbiAgICBpZiAoIXBhcmVudFBhdGggfHwgIWNoaWxkUGF0aCkgcmV0dXJuIG51bGw7XG5cbiAgICByZXR1cm4gW1xuICAgICAgLy8gRmlyc3QgbmF2aWdhdGUgdG8gYGZpbmlzaGAncyBwYXJlbnRcbiAgICAgIC4uLnBhcmVudFBhdGgsXG4gICAgICAvLyBUaGVuIHRvIGl0cyBmaXJzdCBjaGlsZC5cbiAgICAgIE5vZGVOYXZpZ2F0aW9uU3RlcC5GaXJzdENoaWxkLFxuICAgICAgLy8gQW5kIGZpbmFsbHkgZnJvbSB0aGF0IG5vZGUgdG8gYGZpbmlzaGAgKG1heWJlIGEgbm8tb3AgaWYgd2UncmUgYWxyZWFkeSB0aGVyZSkuXG4gICAgICAuLi5jaGlsZFBhdGgsXG4gICAgXTtcbiAgfVxufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgYSBwYXRoIGJldHdlZW4gMiBzaWJsaW5nIG5vZGVzIChnZW5lcmF0ZXMgYSBudW1iZXIgb2YgYE5leHRTaWJsaW5nYCBuYXZpZ2F0aW9ucykuXG4gKiBSZXR1cm5zIGBudWxsYCBpZiBubyBzdWNoIHBhdGggZXhpc3RzIGJldHdlZW4gdGhlIGdpdmVuIG5vZGVzLlxuICovXG5mdW5jdGlvbiBuYXZpZ2F0ZUJldHdlZW5TaWJsaW5ncyhzdGFydDogTm9kZSwgZmluaXNoOiBOb2RlKTogTm9kZU5hdmlnYXRpb25TdGVwW10gfCBudWxsIHtcbiAgY29uc3QgbmF2OiBOb2RlTmF2aWdhdGlvblN0ZXBbXSA9IFtdO1xuICBsZXQgbm9kZTogTm9kZSB8IG51bGwgPSBudWxsO1xuICBmb3IgKG5vZGUgPSBzdGFydDsgbm9kZSAhPSBudWxsICYmIG5vZGUgIT09IGZpbmlzaDsgbm9kZSA9IG5vZGUubmV4dFNpYmxpbmcpIHtcbiAgICBuYXYucHVzaChOb2RlTmF2aWdhdGlvblN0ZXAuTmV4dFNpYmxpbmcpO1xuICB9XG4gIC8vIElmIHRoZSBgbm9kZWAgYmVjb21lcyBgbnVsbGAgb3IgYHVuZGVmaW5lZGAgYXQgdGhlIGVuZCwgdGhhdCBtZWFucyB0aGF0IHdlXG4gIC8vIGRpZG4ndCBmaW5kIHRoZSBgZW5kYCBub2RlLCB0aHVzIHJldHVybiBgbnVsbGAgKHdoaWNoIHdvdWxkIHRyaWdnZXIgc2VyaWFsaXphdGlvblxuICAvLyBlcnJvciB0byBiZSBwcm9kdWNlZCkuXG4gIHJldHVybiBub2RlID09IG51bGwgPyBudWxsIDogbmF2O1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgYSBwYXRoIGJldHdlZW4gMiBub2RlcyBpbiB0ZXJtcyBvZiBgbmV4dFNpYmxpbmdgIGFuZCBgZmlyc3RDaGlsZGBcbiAqIG5hdmlnYXRpb25zOlxuICogLSB0aGUgYGZyb21gIG5vZGUgaXMgYSBrbm93biBub2RlLCB1c2VkIGFzIGFuIHN0YXJ0aW5nIHBvaW50IGZvciB0aGUgbG9va3VwXG4gKiAgICh0aGUgYGZyb21Ob2RlTmFtZWAgYXJndW1lbnQgaXMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIG5vZGUpLlxuICogLSB0aGUgYHRvYCBub2RlIGlzIGEgbm9kZSB0aGF0IHRoZSBydW50aW1lIGxvZ2ljIHdvdWxkIGJlIGxvb2tpbmcgdXAsXG4gKiAgIHVzaW5nIHRoZSBwYXRoIGdlbmVyYXRlZCBieSB0aGlzIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY2FsY1BhdGhCZXR3ZWVuKGZyb206IE5vZGUsIHRvOiBOb2RlLCBmcm9tTm9kZU5hbWU6IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xuICBjb25zdCBwYXRoID0gbmF2aWdhdGVCZXR3ZWVuKGZyb20sIHRvKTtcbiAgcmV0dXJuIHBhdGggPT09IG51bGwgPyBudWxsIDogY29tcHJlc3NOb2RlTG9jYXRpb24oZnJvbU5vZGVOYW1lLCBwYXRoKTtcbn1cblxuLyoqXG4gKiBJbnZva2VkIGF0IHNlcmlhbGl6YXRpb24gdGltZSAob24gdGhlIHNlcnZlcikgd2hlbiBhIHNldCBvZiBuYXZpZ2F0aW9uXG4gKiBpbnN0cnVjdGlvbnMgbmVlZHMgdG8gYmUgZ2VuZXJhdGVkIGZvciBhIFROb2RlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY2FsY1BhdGhGb3JOb2RlKFxuICB0Tm9kZTogVE5vZGUsXG4gIGxWaWV3OiBMVmlldyxcbiAgZXhjbHVkZWRQYXJlbnROb2RlczogU2V0PG51bWJlcj4gfCBudWxsLFxuKTogc3RyaW5nIHtcbiAgbGV0IHBhcmVudFROb2RlID0gdE5vZGUucGFyZW50O1xuICBsZXQgcGFyZW50SW5kZXg6IG51bWJlciB8IHN0cmluZztcbiAgbGV0IHBhcmVudFJOb2RlOiBSTm9kZTtcbiAgbGV0IHJlZmVyZW5jZU5vZGVOYW1lOiBzdHJpbmc7XG5cbiAgLy8gU2tpcCBvdmVyIGFsbCBwYXJlbnQgbm9kZXMgdGhhdCBhcmUgZGlzY29ubmVjdGVkIGZyb20gdGhlIERPTSwgc3VjaCBub2Rlc1xuICAvLyBjYW4gbm90IGJlIHVzZWQgYXMgYW5jaG9ycy5cbiAgLy9cbiAgLy8gVGhpcyBtaWdodCBoYXBwZW4gaW4gY2VydGFpbiBjb250ZW50IHByb2plY3Rpb24tYmFzZWQgdXNlLWNhc2VzLCB3aGVyZVxuICAvLyBhIGNvbnRlbnQgb2YgYW4gZWxlbWVudCBpcyBwcm9qZWN0ZWQgYW5kIHVzZWQsIHdoZW4gYSBwYXJlbnQgZWxlbWVudFxuICAvLyBpdHNlbGYgcmVtYWlucyBkZXRhY2hlZCBmcm9tIERPTS4gSW4gdGhpcyBzY2VuYXJpbyB3ZSB0cnkgdG8gZmluZCBhIHBhcmVudFxuICAvLyBlbGVtZW50IHRoYXQgaXMgYXR0YWNoZWQgdG8gRE9NIGFuZCBjYW4gYWN0IGFzIGFuIGFuY2hvciBpbnN0ZWFkLlxuICAvL1xuICAvLyBJdCBjYW4gYWxzbyBoYXBwZW4gdGhhdCB0aGUgcGFyZW50IG5vZGUgc2hvdWxkIGJlIGV4Y2x1ZGVkLCBmb3IgZXhhbXBsZSxcbiAgLy8gYmVjYXVzZSBpdCBiZWxvbmdzIHRvIGFuIGkxOG4gYmxvY2ssIHdoaWNoIHJlcXVpcmVzIHBhdGhzIHdoaWNoIGFyZW4ndFxuICAvLyByZWxhdGl2ZSB0byBvdGhlciB2aWV3cyBpbiBhbiBpMThuIGJsb2NrLlxuICB3aGlsZSAoXG4gICAgcGFyZW50VE5vZGUgIT09IG51bGwgJiZcbiAgICAoaXNEaXNjb25uZWN0ZWROb2RlKHBhcmVudFROb2RlLCBsVmlldykgfHwgZXhjbHVkZWRQYXJlbnROb2Rlcz8uaGFzKHBhcmVudFROb2RlLmluZGV4KSlcbiAgKSB7XG4gICAgcGFyZW50VE5vZGUgPSBwYXJlbnRUTm9kZS5wYXJlbnQ7XG4gIH1cblxuICBpZiAocGFyZW50VE5vZGUgPT09IG51bGwgfHwgIShwYXJlbnRUTm9kZS50eXBlICYgVE5vZGVUeXBlLkFueVJOb2RlKSkge1xuICAgIC8vIElmIHRoZXJlIGlzIG5vIHBhcmVudCBUTm9kZSBvciBhIHBhcmVudCBUTm9kZSBkb2VzIG5vdCByZXByZXNlbnQgYW4gUk5vZGVcbiAgICAvLyAoaS5lLiBub3QgYSBET00gbm9kZSksIHVzZSBjb21wb25lbnQgaG9zdCBlbGVtZW50IGFzIGEgcmVmZXJlbmNlIG5vZGUuXG4gICAgcGFyZW50SW5kZXggPSByZWZlcmVuY2VOb2RlTmFtZSA9IFJFRkVSRU5DRV9OT0RFX0hPU1Q7XG4gICAgcGFyZW50Uk5vZGUgPSBsVmlld1tERUNMQVJBVElPTl9DT01QT05FTlRfVklFV11bSE9TVF0hO1xuICB9IGVsc2Uge1xuICAgIC8vIFVzZSBwYXJlbnQgVE5vZGUgYXMgYSByZWZlcmVuY2Ugbm9kZS5cbiAgICBwYXJlbnRJbmRleCA9IHBhcmVudFROb2RlLmluZGV4O1xuICAgIHBhcmVudFJOb2RlID0gdW53cmFwUk5vZGUobFZpZXdbcGFyZW50SW5kZXhdKTtcbiAgICByZWZlcmVuY2VOb2RlTmFtZSA9IHJlbmRlclN0cmluZ2lmeShwYXJlbnRJbmRleCAtIEhFQURFUl9PRkZTRVQpO1xuICB9XG4gIGxldCByTm9kZSA9IHVud3JhcFJOb2RlKGxWaWV3W3ROb2RlLmluZGV4XSk7XG4gIGlmICh0Tm9kZS50eXBlICYgVE5vZGVUeXBlLkFueUNvbnRhaW5lcikge1xuICAgIC8vIEZvciA8bmctY29udGFpbmVyPiBub2RlcywgaW5zdGVhZCBvZiBzZXJpYWxpemluZyBhIHJlZmVyZW5jZVxuICAgIC8vIHRvIHRoZSBhbmNob3IgY29tbWVudCBub2RlLCBzZXJpYWxpemUgYSBsb2NhdGlvbiBvZiB0aGUgZmlyc3RcbiAgICAvLyBET00gZWxlbWVudC4gUGFpcmVkIHdpdGggdGhlIGNvbnRhaW5lciBzaXplIChzZXJpYWxpemVkIGFzIGEgcGFydFxuICAgIC8vIG9mIGBuZ2guY29udGFpbmVyc2ApLCBpdCBzaG91bGQgZ2l2ZSBlbm91Z2ggaW5mb3JtYXRpb24gZm9yIHJ1bnRpbWVcbiAgICAvLyB0byBoeWRyYXRlIG5vZGVzIGluIHRoaXMgY29udGFpbmVyLlxuICAgIGNvbnN0IGZpcnN0Uk5vZGUgPSBnZXRGaXJzdE5hdGl2ZU5vZGUobFZpZXcsIHROb2RlKTtcblxuICAgIC8vIElmIGNvbnRhaW5lciBpcyBub3QgZW1wdHksIHVzZSBhIHJlZmVyZW5jZSB0byB0aGUgZmlyc3QgZWxlbWVudCxcbiAgICAvLyBvdGhlcndpc2UsIHJOb2RlIHdvdWxkIHBvaW50IHRvIGFuIGFuY2hvciBjb21tZW50IG5vZGUuXG4gICAgaWYgKGZpcnN0Uk5vZGUpIHtcbiAgICAgIHJOb2RlID0gZmlyc3RSTm9kZTtcbiAgICB9XG4gIH1cbiAgbGV0IHBhdGg6IHN0cmluZyB8IG51bGwgPSBjYWxjUGF0aEJldHdlZW4ocGFyZW50Uk5vZGUgYXMgTm9kZSwgck5vZGUgYXMgTm9kZSwgcmVmZXJlbmNlTm9kZU5hbWUpO1xuICBpZiAocGF0aCA9PT0gbnVsbCAmJiBwYXJlbnRSTm9kZSAhPT0gck5vZGUpIHtcbiAgICAvLyBTZWFyY2hpbmcgZm9yIGEgcGF0aCBiZXR3ZWVuIGVsZW1lbnRzIHdpdGhpbiBhIGhvc3Qgbm9kZSBmYWlsZWQuXG4gICAgLy8gVHJ5aW5nIHRvIGZpbmQgYSBwYXRoIHRvIGFuIGVsZW1lbnQgc3RhcnRpbmcgZnJvbSB0aGUgYGRvY3VtZW50LmJvZHlgIGluc3RlYWQuXG4gICAgLy9cbiAgICAvLyBJbXBvcnRhbnQgbm90ZTogdGhpcyB0eXBlIG9mIHJlZmVyZW5jZSBpcyByZWxhdGl2ZWx5IHVuc3RhYmxlLCBzaW5jZSBBbmd1bGFyXG4gICAgLy8gbWF5IG5vdCBiZSBhYmxlIHRvIGNvbnRyb2wgcGFydHMgb2YgdGhlIHBhZ2UgdGhhdCB0aGUgcnVudGltZSBsb2dpYyBuYXZpZ2F0ZXNcbiAgICAvLyB0aHJvdWdoLiBUaGlzIGlzIG1vc3RseSBuZWVkZWQgdG8gY292ZXIgXCJwb3J0YWxzXCIgdXNlLWNhc2UgKGxpa2UgbWVudXMsIGRpYWxvZyBib3hlcyxcbiAgICAvLyBldGMpLCB3aGVyZSBub2RlcyBhcmUgY29udGVudC1wcm9qZWN0ZWQgKGluY2x1ZGluZyBkaXJlY3QgRE9NIG1hbmlwdWxhdGlvbnMpIG91dHNpZGVcbiAgICAvLyBvZiB0aGUgaG9zdCBub2RlLiBUaGUgYmV0dGVyIHNvbHV0aW9uIGlzIHRvIHByb3ZpZGUgQVBJcyB0byB3b3JrIHdpdGggXCJwb3J0YWxzXCIsXG4gICAgLy8gYXQgd2hpY2ggcG9pbnQgdGhpcyBjb2RlIHBhdGggd291bGQgbm90IGJlIG5lZWRlZC5cbiAgICBjb25zdCBib2R5ID0gKHBhcmVudFJOb2RlIGFzIE5vZGUpLm93bmVyRG9jdW1lbnQhLmJvZHkgYXMgTm9kZTtcbiAgICBwYXRoID0gY2FsY1BhdGhCZXR3ZWVuKGJvZHksIHJOb2RlIGFzIE5vZGUsIFJFRkVSRU5DRV9OT0RFX0JPRFkpO1xuXG4gICAgaWYgKHBhdGggPT09IG51bGwpIHtcbiAgICAgIC8vIElmIHRoZSBwYXRoIGlzIHN0aWxsIGVtcHR5LCBpdCdzIGxpa2VseSB0aGF0IHRoaXMgbm9kZSBpcyBkZXRhY2hlZCBhbmRcbiAgICAgIC8vIHdvbid0IGJlIGZvdW5kIGR1cmluZyBoeWRyYXRpb24uXG4gICAgICB0aHJvdyBub2RlTm90Rm91bmRFcnJvcihsVmlldywgdE5vZGUpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcGF0aCE7XG59XG4iXX0=