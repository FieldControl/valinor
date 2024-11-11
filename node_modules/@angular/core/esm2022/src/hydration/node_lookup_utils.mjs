/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
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
 */
export function isDisconnectedNode(tNode, lView) {
    return (!(tNode.type & (16 /* TNodeType.Projection */ | 128 /* TNodeType.LetDeclaration */)) &&
        !!lView[tNode.index] &&
        isDisconnectedRNode(unwrapRNode(lView[tNode.index])));
}
/**
 * Check whether the given node exists, but is disconnected from the DOM.
 *
 * Note: we leverage the fact that we have this information available in the DOM emulation
 * layer (in Domino) for now. Longer-term solution should not rely on the DOM emulation and
 * only use internal data structures and state to compute this information.
 */
export function isDisconnectedRNode(rNode) {
    return !!rNode && !rNode.isConnected;
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
    if (tNode.type & (12 /* TNodeType.AnyContainer */ | 32 /* TNodeType.Icu */)) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZV9sb29rdXBfdXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9oeWRyYXRpb24vbm9kZV9sb29rdXBfdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBSUgsT0FBTyxFQUNMLDBCQUEwQixFQUMxQixhQUFhLEVBQ2IsSUFBSSxHQUdMLE1BQU0sNEJBQTRCLENBQUM7QUFDcEMsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0sOEJBQThCLENBQUM7QUFDaEUsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLDRCQUE0QixDQUFDO0FBQ3pELE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxpQ0FBaUMsQ0FBQztBQUNoRSxPQUFPLEVBQUMsZ0JBQWdCLEVBQUUsV0FBVyxFQUFDLE1BQU0sNEJBQTRCLENBQUM7QUFDekUsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBRTdDLE9BQU8sRUFBQyxvQkFBb0IsRUFBRSxzQkFBc0IsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUMzRSxPQUFPLEVBQ0wsdUJBQXVCLEVBQ3ZCLGlCQUFpQixFQUNqQix5QkFBeUIsR0FDMUIsTUFBTSxrQkFBa0IsQ0FBQztBQUMxQixPQUFPLEVBRUwsa0JBQWtCLEVBQ2xCLEtBQUssRUFDTCxtQkFBbUIsRUFDbkIsbUJBQW1CLEdBQ3BCLE1BQU0sY0FBYyxDQUFDO0FBQ3RCLE9BQU8sRUFBQywyQkFBMkIsRUFBRSxjQUFjLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFFcEUsa0VBQWtFO0FBQ2xFLFNBQVMsMkJBQTJCLENBQUMsS0FBWTtJQUMvQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxLQUFLLENBQUMsTUFBTSxFQUFFLElBQUksdUNBQStCLENBQUM7QUFDMUUsQ0FBQztBQUVELGdFQUFnRTtBQUNoRSxTQUFTLGdCQUFnQixDQUFDLEtBQVk7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QUFrQixDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztRQUVwRCxtRUFBbUU7UUFDbkUsMERBQTBEO1FBQzFELElBQUksVUFBVSxFQUFFLENBQUM7WUFDZixLQUFLLEdBQUcsVUFBVSxDQUFDO1FBQ3JCLENBQUM7SUFDSCxDQUFDO0lBQ0QsSUFBSSxJQUFJLEdBQWtCLGVBQWUsQ0FBQyxXQUFtQixFQUFFLEtBQWEsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO0lBQ2pHLElBQUksSUFBSSxLQUFLLElBQUksSUFBSSxXQUFXLEtBQUssS0FBSyxFQUFFLENBQUM7UUFDM0MsbUVBQW1FO1FBQ25FLGlGQUFpRjtRQUNqRixFQUFFO1FBQ0YsK0VBQStFO1FBQy9FLGdGQUFnRjtRQUNoRix3RkFBd0Y7UUFDeEYsdUZBQXVGO1FBQ3ZGLG1GQUFtRjtRQUNuRixxREFBcUQ7UUFDckQsTUFBTSxJQUFJLEdBQUksV0FBb0IsQ0FBQyxhQUFjLENBQUMsSUFBWSxDQUFDO1FBQy9ELElBQUksR0FBRyxlQUFlLENBQUMsSUFBSSxFQUFFLEtBQWEsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO1FBRWpFLElBQUksSUFBSSxLQUFLLElBQUksRUFBRSxDQUFDO1lBQ2xCLHlFQUF5RTtZQUN6RSxtQ0FBbUM7WUFDbkMsTUFBTSxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDeEMsQ0FBQztJQUNILENBQUM7SUFDRCxPQUFPLElBQUssQ0FBQztBQUNmLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCB7VE5vZGUsIFROb2RlVHlwZX0gZnJvbSAnLi4vcmVuZGVyMy9pbnRlcmZhY2VzL25vZGUnO1xuaW1wb3J0IHtSRWxlbWVudCwgUk5vZGV9IGZyb20gJy4uL3JlbmRlcjMvaW50ZXJmYWNlcy9yZW5kZXJlcl9kb20nO1xuaW1wb3J0IHtcbiAgREVDTEFSQVRJT05fQ09NUE9ORU5UX1ZJRVcsXG4gIEhFQURFUl9PRkZTRVQsXG4gIEhPU1QsXG4gIExWaWV3LFxuICBUVmlldyxcbn0gZnJvbSAnLi4vcmVuZGVyMy9pbnRlcmZhY2VzL3ZpZXcnO1xuaW1wb3J0IHtnZXRGaXJzdE5hdGl2ZU5vZGV9IGZyb20gJy4uL3JlbmRlcjMvbm9kZV9tYW5pcHVsYXRpb24nO1xuaW1wb3J0IHvJtcm1cmVzb2x2ZUJvZHl9IGZyb20gJy4uL3JlbmRlcjMvdXRpbC9taXNjX3V0aWxzJztcbmltcG9ydCB7cmVuZGVyU3RyaW5naWZ5fSBmcm9tICcuLi9yZW5kZXIzL3V0aWwvc3RyaW5naWZ5X3V0aWxzJztcbmltcG9ydCB7Z2V0TmF0aXZlQnlUTm9kZSwgdW53cmFwUk5vZGV9IGZyb20gJy4uL3JlbmRlcjMvdXRpbC92aWV3X3V0aWxzJztcbmltcG9ydCB7YXNzZXJ0RGVmaW5lZH0gZnJvbSAnLi4vdXRpbC9hc3NlcnQnO1xuXG5pbXBvcnQge2NvbXByZXNzTm9kZUxvY2F0aW9uLCBkZWNvbXByZXNzTm9kZUxvY2F0aW9ufSBmcm9tICcuL2NvbXByZXNzaW9uJztcbmltcG9ydCB7XG4gIG5vZGVOb3RGb3VuZEF0UGF0aEVycm9yLFxuICBub2RlTm90Rm91bmRFcnJvcixcbiAgdmFsaWRhdGVTaWJsaW5nTm9kZUV4aXN0cyxcbn0gZnJvbSAnLi9lcnJvcl9oYW5kbGluZyc7XG5pbXBvcnQge1xuICBEZWh5ZHJhdGVkVmlldyxcbiAgTm9kZU5hdmlnYXRpb25TdGVwLFxuICBOT0RFUyxcbiAgUkVGRVJFTkNFX05PREVfQk9EWSxcbiAgUkVGRVJFTkNFX05PREVfSE9TVCxcbn0gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmltcG9ydCB7Y2FsY1NlcmlhbGl6ZWRDb250YWluZXJTaXplLCBnZXRTZWdtZW50SGVhZH0gZnJvbSAnLi91dGlscyc7XG5cbi8qKiBXaGV0aGVyIGN1cnJlbnQgVE5vZGUgaXMgYSBmaXJzdCBub2RlIGluIGFuIDxuZy1jb250YWluZXI+LiAqL1xuZnVuY3Rpb24gaXNGaXJzdEVsZW1lbnRJbk5nQ29udGFpbmVyKHROb2RlOiBUTm9kZSk6IGJvb2xlYW4ge1xuICByZXR1cm4gIXROb2RlLnByZXYgJiYgdE5vZGUucGFyZW50Py50eXBlID09PSBUTm9kZVR5cGUuRWxlbWVudENvbnRhaW5lcjtcbn1cblxuLyoqIFJldHVybnMgYW4gaW5zdHJ1Y3Rpb24gaW5kZXggKHN1YnRyYWN0aW5nIEhFQURFUl9PRkZTRVQpLiAqL1xuZnVuY3Rpb24gZ2V0Tm9PZmZzZXRJbmRleCh0Tm9kZTogVE5vZGUpOiBudW1iZXIge1xuICByZXR1cm4gdE5vZGUuaW5kZXggLSBIRUFERVJfT0ZGU0VUO1xufVxuXG4vKipcbiAqIENoZWNrIHdoZXRoZXIgYSBnaXZlbiBub2RlIGV4aXN0cywgYnV0IGlzIGRpc2Nvbm5lY3RlZCBmcm9tIHRoZSBET00uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0Rpc2Nvbm5lY3RlZE5vZGUodE5vZGU6IFROb2RlLCBsVmlldzogTFZpZXcpIHtcbiAgcmV0dXJuIChcbiAgICAhKHROb2RlLnR5cGUgJiAoVE5vZGVUeXBlLlByb2plY3Rpb24gfCBUTm9kZVR5cGUuTGV0RGVjbGFyYXRpb24pKSAmJlxuICAgICEhbFZpZXdbdE5vZGUuaW5kZXhdICYmXG4gICAgaXNEaXNjb25uZWN0ZWRSTm9kZSh1bndyYXBSTm9kZShsVmlld1t0Tm9kZS5pbmRleF0pKVxuICApO1xufVxuXG4vKipcbiAqIENoZWNrIHdoZXRoZXIgdGhlIGdpdmVuIG5vZGUgZXhpc3RzLCBidXQgaXMgZGlzY29ubmVjdGVkIGZyb20gdGhlIERPTS5cbiAqXG4gKiBOb3RlOiB3ZSBsZXZlcmFnZSB0aGUgZmFjdCB0aGF0IHdlIGhhdmUgdGhpcyBpbmZvcm1hdGlvbiBhdmFpbGFibGUgaW4gdGhlIERPTSBlbXVsYXRpb25cbiAqIGxheWVyIChpbiBEb21pbm8pIGZvciBub3cuIExvbmdlci10ZXJtIHNvbHV0aW9uIHNob3VsZCBub3QgcmVseSBvbiB0aGUgRE9NIGVtdWxhdGlvbiBhbmRcbiAqIG9ubHkgdXNlIGludGVybmFsIGRhdGEgc3RydWN0dXJlcyBhbmQgc3RhdGUgdG8gY29tcHV0ZSB0aGlzIGluZm9ybWF0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNEaXNjb25uZWN0ZWRSTm9kZShyTm9kZTogUk5vZGUgfCBudWxsKSB7XG4gIHJldHVybiAhIXJOb2RlICYmICEock5vZGUgYXMgTm9kZSkuaXNDb25uZWN0ZWQ7XG59XG5cbi8qKlxuICogTG9jYXRlIGEgbm9kZSBpbiBhbiBpMThuIHRyZWUgdGhhdCBjb3JyZXNwb25kcyB0byBhIGdpdmVuIGluc3RydWN0aW9uIGluZGV4LlxuICpcbiAqIEBwYXJhbSBoeWRyYXRpb25JbmZvIFRoZSBoeWRyYXRpb24gYW5ub3RhdGlvbiBkYXRhXG4gKiBAcGFyYW0gbm9PZmZzZXRJbmRleCB0aGUgaW5zdHJ1Y3Rpb24gaW5kZXhcbiAqIEByZXR1cm5zIGFuIFJOb2RlIHRoYXQgY29ycmVzcG9uZHMgdG8gdGhlIGluc3RydWN0aW9uIGluZGV4XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsb2NhdGVJMThuUk5vZGVCeUluZGV4PFQgZXh0ZW5kcyBSTm9kZT4oXG4gIGh5ZHJhdGlvbkluZm86IERlaHlkcmF0ZWRWaWV3LFxuICBub09mZnNldEluZGV4OiBudW1iZXIsXG4pOiBUIHwgbnVsbCB8IHVuZGVmaW5lZCB7XG4gIGNvbnN0IGkxOG5Ob2RlcyA9IGh5ZHJhdGlvbkluZm8uaTE4bk5vZGVzO1xuICBpZiAoaTE4bk5vZGVzKSB7XG4gICAgcmV0dXJuIGkxOG5Ob2Rlcy5nZXQobm9PZmZzZXRJbmRleCkgYXMgVCB8IG51bGwgfCB1bmRlZmluZWQ7XG4gIH1cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuLyoqXG4gKiBBdHRlbXB0IHRvIGxvY2F0ZSBhbiBSTm9kZSBieSBhIHBhdGgsIGlmIGl0IGV4aXN0cy5cbiAqXG4gKiBAcGFyYW0gaHlkcmF0aW9uSW5mbyBUaGUgaHlkcmF0aW9uIGFubm90YXRpb24gZGF0YVxuICogQHBhcmFtIGxWaWV3IHRoZSBjdXJyZW50IGxWaWV3XG4gKiBAcGFyYW0gbm9PZmZzZXRJbmRleCB0aGUgaW5zdHJ1Y3Rpb24gaW5kZXhcbiAqIEByZXR1cm5zIGFuIFJOb2RlIHRoYXQgY29ycmVzcG9uZHMgdG8gdGhlIGluc3RydWN0aW9uIGluZGV4IG9yIG51bGwgaWYgbm8gcGF0aCBleGlzdHNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyeUxvY2F0ZVJOb2RlQnlQYXRoKFxuICBoeWRyYXRpb25JbmZvOiBEZWh5ZHJhdGVkVmlldyxcbiAgbFZpZXc6IExWaWV3PHVua25vd24+LFxuICBub09mZnNldEluZGV4OiBudW1iZXIsXG4pOiBSTm9kZSB8IG51bGwge1xuICBjb25zdCBub2RlcyA9IGh5ZHJhdGlvbkluZm8uZGF0YVtOT0RFU107XG4gIGNvbnN0IHBhdGggPSBub2Rlcz8uW25vT2Zmc2V0SW5kZXhdO1xuICByZXR1cm4gcGF0aCA/IGxvY2F0ZVJOb2RlQnlQYXRoKHBhdGgsIGxWaWV3KSA6IG51bGw7XG59XG5cbi8qKlxuICogTG9jYXRlIGEgbm9kZSBpbiBET00gdHJlZSB0aGF0IGNvcnJlc3BvbmRzIHRvIGEgZ2l2ZW4gVE5vZGUuXG4gKlxuICogQHBhcmFtIGh5ZHJhdGlvbkluZm8gVGhlIGh5ZHJhdGlvbiBhbm5vdGF0aW9uIGRhdGFcbiAqIEBwYXJhbSB0VmlldyB0aGUgY3VycmVudCB0Vmlld1xuICogQHBhcmFtIGxWaWV3IHRoZSBjdXJyZW50IGxWaWV3XG4gKiBAcGFyYW0gdE5vZGUgdGhlIGN1cnJlbnQgdE5vZGVcbiAqIEByZXR1cm5zIGFuIFJOb2RlIHRoYXQgcmVwcmVzZW50cyBhIGdpdmVuIHROb2RlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsb2NhdGVOZXh0Uk5vZGU8VCBleHRlbmRzIFJOb2RlPihcbiAgaHlkcmF0aW9uSW5mbzogRGVoeWRyYXRlZFZpZXcsXG4gIHRWaWV3OiBUVmlldyxcbiAgbFZpZXc6IExWaWV3PHVua25vd24+LFxuICB0Tm9kZTogVE5vZGUsXG4pOiBUIHwgbnVsbCB7XG4gIGNvbnN0IG5vT2Zmc2V0SW5kZXggPSBnZXROb09mZnNldEluZGV4KHROb2RlKTtcbiAgbGV0IG5hdGl2ZSA9IGxvY2F0ZUkxOG5STm9kZUJ5SW5kZXgoaHlkcmF0aW9uSW5mbywgbm9PZmZzZXRJbmRleCk7XG5cbiAgaWYgKG5hdGl2ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgY29uc3Qgbm9kZXMgPSBoeWRyYXRpb25JbmZvLmRhdGFbTk9ERVNdO1xuICAgIGlmIChub2Rlcz8uW25vT2Zmc2V0SW5kZXhdKSB7XG4gICAgICAvLyBXZSBrbm93IHRoZSBleGFjdCBsb2NhdGlvbiBvZiB0aGUgbm9kZS5cbiAgICAgIG5hdGl2ZSA9IGxvY2F0ZVJOb2RlQnlQYXRoKG5vZGVzW25vT2Zmc2V0SW5kZXhdLCBsVmlldyk7XG4gICAgfSBlbHNlIGlmICh0Vmlldy5maXJzdENoaWxkID09PSB0Tm9kZSkge1xuICAgICAgLy8gV2UgY3JlYXRlIGEgZmlyc3Qgbm9kZSBpbiB0aGlzIHZpZXcsIHNvIHdlIHVzZSBhIHJlZmVyZW5jZVxuICAgICAgLy8gdG8gdGhlIGZpcnN0IGNoaWxkIGluIHRoaXMgRE9NIHNlZ21lbnQuXG4gICAgICBuYXRpdmUgPSBoeWRyYXRpb25JbmZvLmZpcnN0Q2hpbGQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIExvY2F0ZSBhIG5vZGUgYmFzZWQgb24gYSBwcmV2aW91cyBzaWJsaW5nIG9yIGEgcGFyZW50IG5vZGUuXG4gICAgICBjb25zdCBwcmV2aW91c1ROb2RlUGFyZW50ID0gdE5vZGUucHJldiA9PT0gbnVsbDtcbiAgICAgIGNvbnN0IHByZXZpb3VzVE5vZGUgPSAodE5vZGUucHJldiA/PyB0Tm9kZS5wYXJlbnQpITtcbiAgICAgIG5nRGV2TW9kZSAmJlxuICAgICAgICBhc3NlcnREZWZpbmVkKFxuICAgICAgICAgIHByZXZpb3VzVE5vZGUsXG4gICAgICAgICAgJ1VuZXhwZWN0ZWQgc3RhdGU6IGN1cnJlbnQgVE5vZGUgZG9lcyBub3QgaGF2ZSBhIGNvbm5lY3Rpb24gJyArXG4gICAgICAgICAgICAndG8gdGhlIHByZXZpb3VzIG5vZGUgb3IgYSBwYXJlbnQgbm9kZS4nLFxuICAgICAgICApO1xuICAgICAgaWYgKGlzRmlyc3RFbGVtZW50SW5OZ0NvbnRhaW5lcih0Tm9kZSkpIHtcbiAgICAgICAgY29uc3Qgbm9PZmZzZXRQYXJlbnRJbmRleCA9IGdldE5vT2Zmc2V0SW5kZXgodE5vZGUucGFyZW50ISk7XG4gICAgICAgIG5hdGl2ZSA9IGdldFNlZ21lbnRIZWFkKGh5ZHJhdGlvbkluZm8sIG5vT2Zmc2V0UGFyZW50SW5kZXgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IHByZXZpb3VzUkVsZW1lbnQgPSBnZXROYXRpdmVCeVROb2RlKHByZXZpb3VzVE5vZGUsIGxWaWV3KTtcbiAgICAgICAgaWYgKHByZXZpb3VzVE5vZGVQYXJlbnQpIHtcbiAgICAgICAgICBuYXRpdmUgPSAocHJldmlvdXNSRWxlbWVudCBhcyBSRWxlbWVudCkuZmlyc3RDaGlsZDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBJZiB0aGUgcHJldmlvdXMgbm9kZSBpcyBhbiBlbGVtZW50LCBidXQgaXQgYWxzbyBoYXMgY29udGFpbmVyIGluZm8sXG4gICAgICAgICAgLy8gdGhpcyBtZWFucyB0aGF0IHdlIGFyZSBwcm9jZXNzaW5nIGEgbm9kZSBsaWtlIGA8ZGl2ICN2Y3JUYXJnZXQ+YCwgd2hpY2ggaXNcbiAgICAgICAgICAvLyByZXByZXNlbnRlZCBpbiB0aGUgRE9NIGFzIGA8ZGl2PjwvZGl2Pi4uLjwhLS1jb250YWluZXItLT5gLlxuICAgICAgICAgIC8vIEluIHRoaXMgY2FzZSwgdGhlcmUgYXJlIG5vZGVzICphZnRlciogdGhpcyBlbGVtZW50IGFuZCB3ZSBuZWVkIHRvIHNraXBcbiAgICAgICAgICAvLyBhbGwgb2YgdGhlbSB0byByZWFjaCBhbiBlbGVtZW50IHRoYXQgd2UgYXJlIGxvb2tpbmcgZm9yLlxuICAgICAgICAgIGNvbnN0IG5vT2Zmc2V0UHJldlNpYmxpbmdJbmRleCA9IGdldE5vT2Zmc2V0SW5kZXgocHJldmlvdXNUTm9kZSk7XG4gICAgICAgICAgY29uc3Qgc2VnbWVudEhlYWQgPSBnZXRTZWdtZW50SGVhZChoeWRyYXRpb25JbmZvLCBub09mZnNldFByZXZTaWJsaW5nSW5kZXgpO1xuICAgICAgICAgIGlmIChwcmV2aW91c1ROb2RlLnR5cGUgPT09IFROb2RlVHlwZS5FbGVtZW50ICYmIHNlZ21lbnRIZWFkKSB7XG4gICAgICAgICAgICBjb25zdCBudW1Sb290Tm9kZXNUb1NraXAgPSBjYWxjU2VyaWFsaXplZENvbnRhaW5lclNpemUoXG4gICAgICAgICAgICAgIGh5ZHJhdGlvbkluZm8sXG4gICAgICAgICAgICAgIG5vT2Zmc2V0UHJldlNpYmxpbmdJbmRleCxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICAvLyBgKzFgIHN0YW5kcyBmb3IgYW4gYW5jaG9yIGNvbW1lbnQgbm9kZSBhZnRlciBhbGwgdGhlIHZpZXdzIGluIHRoaXMgY29udGFpbmVyLlxuICAgICAgICAgICAgY29uc3Qgbm9kZXNUb1NraXAgPSBudW1Sb290Tm9kZXNUb1NraXAgKyAxO1xuICAgICAgICAgICAgLy8gRmlyc3Qgbm9kZSBhZnRlciB0aGlzIHNlZ21lbnQuXG4gICAgICAgICAgICBuYXRpdmUgPSBzaWJsaW5nQWZ0ZXIobm9kZXNUb1NraXAsIHNlZ21lbnRIZWFkKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbmF0aXZlID0gcHJldmlvdXNSRWxlbWVudC5uZXh0U2libGluZztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIG5hdGl2ZSBhcyBUO1xufVxuXG4vKipcbiAqIFNraXBzIG92ZXIgYSBzcGVjaWZpZWQgbnVtYmVyIG9mIG5vZGVzIGFuZCByZXR1cm5zIHRoZSBuZXh0IHNpYmxpbmcgbm9kZSBhZnRlciB0aGF0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2libGluZ0FmdGVyPFQgZXh0ZW5kcyBSTm9kZT4oc2tpcDogbnVtYmVyLCBmcm9tOiBSTm9kZSk6IFQgfCBudWxsIHtcbiAgbGV0IGN1cnJlbnROb2RlID0gZnJvbTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBza2lwOyBpKyspIHtcbiAgICBuZ0Rldk1vZGUgJiYgdmFsaWRhdGVTaWJsaW5nTm9kZUV4aXN0cyhjdXJyZW50Tm9kZSk7XG4gICAgY3VycmVudE5vZGUgPSBjdXJyZW50Tm9kZS5uZXh0U2libGluZyE7XG4gIH1cbiAgcmV0dXJuIGN1cnJlbnROb2RlIGFzIFQ7XG59XG5cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9uIHRvIHByb2R1Y2UgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIG5hdmlnYXRpb24gc3RlcHNcbiAqIChpbiB0ZXJtcyBvZiBgbmV4dFNpYmxpbmdgIGFuZCBgZmlyc3RDaGlsZGAgbmF2aWdhdGlvbnMpLiBVc2VkIGluIGVycm9yXG4gKiBtZXNzYWdlcyBpbiBkZXYgbW9kZS5cbiAqL1xuZnVuY3Rpb24gc3RyaW5naWZ5TmF2aWdhdGlvbkluc3RydWN0aW9ucyhpbnN0cnVjdGlvbnM6IChudW1iZXIgfCBOb2RlTmF2aWdhdGlvblN0ZXApW10pOiBzdHJpbmcge1xuICBjb25zdCBjb250YWluZXIgPSBbXTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnN0cnVjdGlvbnMubGVuZ3RoOyBpICs9IDIpIHtcbiAgICBjb25zdCBzdGVwID0gaW5zdHJ1Y3Rpb25zW2ldO1xuICAgIGNvbnN0IHJlcGVhdCA9IGluc3RydWN0aW9uc1tpICsgMV0gYXMgbnVtYmVyO1xuICAgIGZvciAobGV0IHIgPSAwOyByIDwgcmVwZWF0OyByKyspIHtcbiAgICAgIGNvbnRhaW5lci5wdXNoKHN0ZXAgPT09IE5vZGVOYXZpZ2F0aW9uU3RlcC5GaXJzdENoaWxkID8gJ2ZpcnN0Q2hpbGQnIDogJ25leHRTaWJsaW5nJyk7XG4gICAgfVxuICB9XG4gIHJldHVybiBjb250YWluZXIuam9pbignLicpO1xufVxuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0aGF0IG5hdmlnYXRlcyBmcm9tIGEgc3RhcnRpbmcgcG9pbnQgbm9kZSAodGhlIGBmcm9tYCBub2RlKVxuICogdXNpbmcgcHJvdmlkZWQgc2V0IG9mIG5hdmlnYXRpb24gaW5zdHJ1Y3Rpb25zICh3aXRoaW4gYHBhdGhgIGFyZ3VtZW50KS5cbiAqL1xuZnVuY3Rpb24gbmF2aWdhdGVUb05vZGUoZnJvbTogTm9kZSwgaW5zdHJ1Y3Rpb25zOiAobnVtYmVyIHwgTm9kZU5hdmlnYXRpb25TdGVwKVtdKTogUk5vZGUge1xuICBsZXQgbm9kZSA9IGZyb207XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgaW5zdHJ1Y3Rpb25zLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgY29uc3Qgc3RlcCA9IGluc3RydWN0aW9uc1tpXTtcbiAgICBjb25zdCByZXBlYXQgPSBpbnN0cnVjdGlvbnNbaSArIDFdIGFzIG51bWJlcjtcbiAgICBmb3IgKGxldCByID0gMDsgciA8IHJlcGVhdDsgcisrKSB7XG4gICAgICBpZiAobmdEZXZNb2RlICYmICFub2RlKSB7XG4gICAgICAgIHRocm93IG5vZGVOb3RGb3VuZEF0UGF0aEVycm9yKGZyb20sIHN0cmluZ2lmeU5hdmlnYXRpb25JbnN0cnVjdGlvbnMoaW5zdHJ1Y3Rpb25zKSk7XG4gICAgICB9XG4gICAgICBzd2l0Y2ggKHN0ZXApIHtcbiAgICAgICAgY2FzZSBOb2RlTmF2aWdhdGlvblN0ZXAuRmlyc3RDaGlsZDpcbiAgICAgICAgICBub2RlID0gbm9kZS5maXJzdENoaWxkITtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBOb2RlTmF2aWdhdGlvblN0ZXAuTmV4dFNpYmxpbmc6XG4gICAgICAgICAgbm9kZSA9IG5vZGUubmV4dFNpYmxpbmchO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBpZiAobmdEZXZNb2RlICYmICFub2RlKSB7XG4gICAgdGhyb3cgbm9kZU5vdEZvdW5kQXRQYXRoRXJyb3IoZnJvbSwgc3RyaW5naWZ5TmF2aWdhdGlvbkluc3RydWN0aW9ucyhpbnN0cnVjdGlvbnMpKTtcbiAgfVxuICByZXR1cm4gbm9kZSBhcyBSTm9kZTtcbn1cblxuLyoqXG4gKiBMb2NhdGVzIGFuIFJOb2RlIGdpdmVuIGEgc2V0IG9mIG5hdmlnYXRpb24gaW5zdHJ1Y3Rpb25zICh3aGljaCBhbHNvIGNvbnRhaW5zXG4gKiBhIHN0YXJ0aW5nIHBvaW50IG5vZGUgaW5mbykuXG4gKi9cbmZ1bmN0aW9uIGxvY2F0ZVJOb2RlQnlQYXRoKHBhdGg6IHN0cmluZywgbFZpZXc6IExWaWV3KTogUk5vZGUge1xuICBjb25zdCBbcmVmZXJlbmNlTm9kZSwgLi4ubmF2aWdhdGlvbkluc3RydWN0aW9uc10gPSBkZWNvbXByZXNzTm9kZUxvY2F0aW9uKHBhdGgpO1xuICBsZXQgcmVmOiBFbGVtZW50O1xuICBpZiAocmVmZXJlbmNlTm9kZSA9PT0gUkVGRVJFTkNFX05PREVfSE9TVCkge1xuICAgIHJlZiA9IGxWaWV3W0RFQ0xBUkFUSU9OX0NPTVBPTkVOVF9WSUVXXVtIT1NUXSBhcyB1bmtub3duIGFzIEVsZW1lbnQ7XG4gIH0gZWxzZSBpZiAocmVmZXJlbmNlTm9kZSA9PT0gUkVGRVJFTkNFX05PREVfQk9EWSkge1xuICAgIHJlZiA9IMm1ybVyZXNvbHZlQm9keShcbiAgICAgIGxWaWV3W0RFQ0xBUkFUSU9OX0NPTVBPTkVOVF9WSUVXXVtIT1NUXSBhcyBSRWxlbWVudCAmIHtvd25lckRvY3VtZW50OiBEb2N1bWVudH0sXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICBjb25zdCBwYXJlbnRFbGVtZW50SWQgPSBOdW1iZXIocmVmZXJlbmNlTm9kZSk7XG4gICAgcmVmID0gdW53cmFwUk5vZGUoKGxWaWV3IGFzIGFueSlbcGFyZW50RWxlbWVudElkICsgSEVBREVSX09GRlNFVF0pIGFzIEVsZW1lbnQ7XG4gIH1cbiAgcmV0dXJuIG5hdmlnYXRlVG9Ob2RlKHJlZiwgbmF2aWdhdGlvbkluc3RydWN0aW9ucyk7XG59XG5cbi8qKlxuICogR2VuZXJhdGUgYSBsaXN0IG9mIERPTSBuYXZpZ2F0aW9uIG9wZXJhdGlvbnMgdG8gZ2V0IGZyb20gbm9kZSBgc3RhcnRgIHRvIG5vZGUgYGZpbmlzaGAuXG4gKlxuICogTm90ZTogYXNzdW1lcyB0aGF0IG5vZGUgYHN0YXJ0YCBvY2N1cnMgYmVmb3JlIG5vZGUgYGZpbmlzaGAgaW4gYW4gaW4tb3JkZXIgdHJhdmVyc2FsIG9mIHRoZSBET01cbiAqIHRyZWUuIFRoYXQgaXMsIHdlIHNob3VsZCBiZSBhYmxlIHRvIGdldCBmcm9tIGBzdGFydGAgdG8gYGZpbmlzaGAgcHVyZWx5IGJ5IHVzaW5nIGAuZmlyc3RDaGlsZGBcbiAqIGFuZCBgLm5leHRTaWJsaW5nYCBvcGVyYXRpb25zLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbmF2aWdhdGVCZXR3ZWVuKHN0YXJ0OiBOb2RlLCBmaW5pc2g6IE5vZGUpOiBOb2RlTmF2aWdhdGlvblN0ZXBbXSB8IG51bGwge1xuICBpZiAoc3RhcnQgPT09IGZpbmlzaCkge1xuICAgIHJldHVybiBbXTtcbiAgfSBlbHNlIGlmIChzdGFydC5wYXJlbnRFbGVtZW50ID09IG51bGwgfHwgZmluaXNoLnBhcmVudEVsZW1lbnQgPT0gbnVsbCkge1xuICAgIHJldHVybiBudWxsO1xuICB9IGVsc2UgaWYgKHN0YXJ0LnBhcmVudEVsZW1lbnQgPT09IGZpbmlzaC5wYXJlbnRFbGVtZW50KSB7XG4gICAgcmV0dXJuIG5hdmlnYXRlQmV0d2VlblNpYmxpbmdzKHN0YXJ0LCBmaW5pc2gpO1xuICB9IGVsc2Uge1xuICAgIC8vIGBmaW5pc2hgIGlzIGEgY2hpbGQgb2YgaXRzIHBhcmVudCwgc28gdGhlIHBhcmVudCB3aWxsIGFsd2F5cyBoYXZlIGEgY2hpbGQuXG4gICAgY29uc3QgcGFyZW50ID0gZmluaXNoLnBhcmVudEVsZW1lbnQhO1xuXG4gICAgY29uc3QgcGFyZW50UGF0aCA9IG5hdmlnYXRlQmV0d2VlbihzdGFydCwgcGFyZW50KTtcbiAgICBjb25zdCBjaGlsZFBhdGggPSBuYXZpZ2F0ZUJldHdlZW4ocGFyZW50LmZpcnN0Q2hpbGQhLCBmaW5pc2gpO1xuICAgIGlmICghcGFyZW50UGF0aCB8fCAhY2hpbGRQYXRoKSByZXR1cm4gbnVsbDtcblxuICAgIHJldHVybiBbXG4gICAgICAvLyBGaXJzdCBuYXZpZ2F0ZSB0byBgZmluaXNoYCdzIHBhcmVudFxuICAgICAgLi4ucGFyZW50UGF0aCxcbiAgICAgIC8vIFRoZW4gdG8gaXRzIGZpcnN0IGNoaWxkLlxuICAgICAgTm9kZU5hdmlnYXRpb25TdGVwLkZpcnN0Q2hpbGQsXG4gICAgICAvLyBBbmQgZmluYWxseSBmcm9tIHRoYXQgbm9kZSB0byBgZmluaXNoYCAobWF5YmUgYSBuby1vcCBpZiB3ZSdyZSBhbHJlYWR5IHRoZXJlKS5cbiAgICAgIC4uLmNoaWxkUGF0aCxcbiAgICBdO1xuICB9XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyBhIHBhdGggYmV0d2VlbiAyIHNpYmxpbmcgbm9kZXMgKGdlbmVyYXRlcyBhIG51bWJlciBvZiBgTmV4dFNpYmxpbmdgIG5hdmlnYXRpb25zKS5cbiAqIFJldHVybnMgYG51bGxgIGlmIG5vIHN1Y2ggcGF0aCBleGlzdHMgYmV0d2VlbiB0aGUgZ2l2ZW4gbm9kZXMuXG4gKi9cbmZ1bmN0aW9uIG5hdmlnYXRlQmV0d2VlblNpYmxpbmdzKHN0YXJ0OiBOb2RlLCBmaW5pc2g6IE5vZGUpOiBOb2RlTmF2aWdhdGlvblN0ZXBbXSB8IG51bGwge1xuICBjb25zdCBuYXY6IE5vZGVOYXZpZ2F0aW9uU3RlcFtdID0gW107XG4gIGxldCBub2RlOiBOb2RlIHwgbnVsbCA9IG51bGw7XG4gIGZvciAobm9kZSA9IHN0YXJ0OyBub2RlICE9IG51bGwgJiYgbm9kZSAhPT0gZmluaXNoOyBub2RlID0gbm9kZS5uZXh0U2libGluZykge1xuICAgIG5hdi5wdXNoKE5vZGVOYXZpZ2F0aW9uU3RlcC5OZXh0U2libGluZyk7XG4gIH1cbiAgLy8gSWYgdGhlIGBub2RlYCBiZWNvbWVzIGBudWxsYCBvciBgdW5kZWZpbmVkYCBhdCB0aGUgZW5kLCB0aGF0IG1lYW5zIHRoYXQgd2VcbiAgLy8gZGlkbid0IGZpbmQgdGhlIGBlbmRgIG5vZGUsIHRodXMgcmV0dXJuIGBudWxsYCAod2hpY2ggd291bGQgdHJpZ2dlciBzZXJpYWxpemF0aW9uXG4gIC8vIGVycm9yIHRvIGJlIHByb2R1Y2VkKS5cbiAgcmV0dXJuIG5vZGUgPT0gbnVsbCA/IG51bGwgOiBuYXY7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyBhIHBhdGggYmV0d2VlbiAyIG5vZGVzIGluIHRlcm1zIG9mIGBuZXh0U2libGluZ2AgYW5kIGBmaXJzdENoaWxkYFxuICogbmF2aWdhdGlvbnM6XG4gKiAtIHRoZSBgZnJvbWAgbm9kZSBpcyBhIGtub3duIG5vZGUsIHVzZWQgYXMgYW4gc3RhcnRpbmcgcG9pbnQgZm9yIHRoZSBsb29rdXBcbiAqICAgKHRoZSBgZnJvbU5vZGVOYW1lYCBhcmd1bWVudCBpcyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgbm9kZSkuXG4gKiAtIHRoZSBgdG9gIG5vZGUgaXMgYSBub2RlIHRoYXQgdGhlIHJ1bnRpbWUgbG9naWMgd291bGQgYmUgbG9va2luZyB1cCxcbiAqICAgdXNpbmcgdGhlIHBhdGggZ2VuZXJhdGVkIGJ5IHRoaXMgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjYWxjUGF0aEJldHdlZW4oZnJvbTogTm9kZSwgdG86IE5vZGUsIGZyb21Ob2RlTmFtZTogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XG4gIGNvbnN0IHBhdGggPSBuYXZpZ2F0ZUJldHdlZW4oZnJvbSwgdG8pO1xuICByZXR1cm4gcGF0aCA9PT0gbnVsbCA/IG51bGwgOiBjb21wcmVzc05vZGVMb2NhdGlvbihmcm9tTm9kZU5hbWUsIHBhdGgpO1xufVxuXG4vKipcbiAqIEludm9rZWQgYXQgc2VyaWFsaXphdGlvbiB0aW1lIChvbiB0aGUgc2VydmVyKSB3aGVuIGEgc2V0IG9mIG5hdmlnYXRpb25cbiAqIGluc3RydWN0aW9ucyBuZWVkcyB0byBiZSBnZW5lcmF0ZWQgZm9yIGEgVE5vZGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjYWxjUGF0aEZvck5vZGUoXG4gIHROb2RlOiBUTm9kZSxcbiAgbFZpZXc6IExWaWV3LFxuICBleGNsdWRlZFBhcmVudE5vZGVzOiBTZXQ8bnVtYmVyPiB8IG51bGwsXG4pOiBzdHJpbmcge1xuICBsZXQgcGFyZW50VE5vZGUgPSB0Tm9kZS5wYXJlbnQ7XG4gIGxldCBwYXJlbnRJbmRleDogbnVtYmVyIHwgc3RyaW5nO1xuICBsZXQgcGFyZW50Uk5vZGU6IFJOb2RlO1xuICBsZXQgcmVmZXJlbmNlTm9kZU5hbWU6IHN0cmluZztcblxuICAvLyBTa2lwIG92ZXIgYWxsIHBhcmVudCBub2RlcyB0aGF0IGFyZSBkaXNjb25uZWN0ZWQgZnJvbSB0aGUgRE9NLCBzdWNoIG5vZGVzXG4gIC8vIGNhbiBub3QgYmUgdXNlZCBhcyBhbmNob3JzLlxuICAvL1xuICAvLyBUaGlzIG1pZ2h0IGhhcHBlbiBpbiBjZXJ0YWluIGNvbnRlbnQgcHJvamVjdGlvbi1iYXNlZCB1c2UtY2FzZXMsIHdoZXJlXG4gIC8vIGEgY29udGVudCBvZiBhbiBlbGVtZW50IGlzIHByb2plY3RlZCBhbmQgdXNlZCwgd2hlbiBhIHBhcmVudCBlbGVtZW50XG4gIC8vIGl0c2VsZiByZW1haW5zIGRldGFjaGVkIGZyb20gRE9NLiBJbiB0aGlzIHNjZW5hcmlvIHdlIHRyeSB0byBmaW5kIGEgcGFyZW50XG4gIC8vIGVsZW1lbnQgdGhhdCBpcyBhdHRhY2hlZCB0byBET00gYW5kIGNhbiBhY3QgYXMgYW4gYW5jaG9yIGluc3RlYWQuXG4gIC8vXG4gIC8vIEl0IGNhbiBhbHNvIGhhcHBlbiB0aGF0IHRoZSBwYXJlbnQgbm9kZSBzaG91bGQgYmUgZXhjbHVkZWQsIGZvciBleGFtcGxlLFxuICAvLyBiZWNhdXNlIGl0IGJlbG9uZ3MgdG8gYW4gaTE4biBibG9jaywgd2hpY2ggcmVxdWlyZXMgcGF0aHMgd2hpY2ggYXJlbid0XG4gIC8vIHJlbGF0aXZlIHRvIG90aGVyIHZpZXdzIGluIGFuIGkxOG4gYmxvY2suXG4gIHdoaWxlIChcbiAgICBwYXJlbnRUTm9kZSAhPT0gbnVsbCAmJlxuICAgIChpc0Rpc2Nvbm5lY3RlZE5vZGUocGFyZW50VE5vZGUsIGxWaWV3KSB8fCBleGNsdWRlZFBhcmVudE5vZGVzPy5oYXMocGFyZW50VE5vZGUuaW5kZXgpKVxuICApIHtcbiAgICBwYXJlbnRUTm9kZSA9IHBhcmVudFROb2RlLnBhcmVudDtcbiAgfVxuXG4gIGlmIChwYXJlbnRUTm9kZSA9PT0gbnVsbCB8fCAhKHBhcmVudFROb2RlLnR5cGUgJiBUTm9kZVR5cGUuQW55Uk5vZGUpKSB7XG4gICAgLy8gSWYgdGhlcmUgaXMgbm8gcGFyZW50IFROb2RlIG9yIGEgcGFyZW50IFROb2RlIGRvZXMgbm90IHJlcHJlc2VudCBhbiBSTm9kZVxuICAgIC8vIChpLmUuIG5vdCBhIERPTSBub2RlKSwgdXNlIGNvbXBvbmVudCBob3N0IGVsZW1lbnQgYXMgYSByZWZlcmVuY2Ugbm9kZS5cbiAgICBwYXJlbnRJbmRleCA9IHJlZmVyZW5jZU5vZGVOYW1lID0gUkVGRVJFTkNFX05PREVfSE9TVDtcbiAgICBwYXJlbnRSTm9kZSA9IGxWaWV3W0RFQ0xBUkFUSU9OX0NPTVBPTkVOVF9WSUVXXVtIT1NUXSE7XG4gIH0gZWxzZSB7XG4gICAgLy8gVXNlIHBhcmVudCBUTm9kZSBhcyBhIHJlZmVyZW5jZSBub2RlLlxuICAgIHBhcmVudEluZGV4ID0gcGFyZW50VE5vZGUuaW5kZXg7XG4gICAgcGFyZW50Uk5vZGUgPSB1bndyYXBSTm9kZShsVmlld1twYXJlbnRJbmRleF0pO1xuICAgIHJlZmVyZW5jZU5vZGVOYW1lID0gcmVuZGVyU3RyaW5naWZ5KHBhcmVudEluZGV4IC0gSEVBREVSX09GRlNFVCk7XG4gIH1cbiAgbGV0IHJOb2RlID0gdW53cmFwUk5vZGUobFZpZXdbdE5vZGUuaW5kZXhdKTtcbiAgaWYgKHROb2RlLnR5cGUgJiAoVE5vZGVUeXBlLkFueUNvbnRhaW5lciB8IFROb2RlVHlwZS5JY3UpKSB7XG4gICAgLy8gRm9yIDxuZy1jb250YWluZXI+IG5vZGVzLCBpbnN0ZWFkIG9mIHNlcmlhbGl6aW5nIGEgcmVmZXJlbmNlXG4gICAgLy8gdG8gdGhlIGFuY2hvciBjb21tZW50IG5vZGUsIHNlcmlhbGl6ZSBhIGxvY2F0aW9uIG9mIHRoZSBmaXJzdFxuICAgIC8vIERPTSBlbGVtZW50LiBQYWlyZWQgd2l0aCB0aGUgY29udGFpbmVyIHNpemUgKHNlcmlhbGl6ZWQgYXMgYSBwYXJ0XG4gICAgLy8gb2YgYG5naC5jb250YWluZXJzYCksIGl0IHNob3VsZCBnaXZlIGVub3VnaCBpbmZvcm1hdGlvbiBmb3IgcnVudGltZVxuICAgIC8vIHRvIGh5ZHJhdGUgbm9kZXMgaW4gdGhpcyBjb250YWluZXIuXG4gICAgY29uc3QgZmlyc3RSTm9kZSA9IGdldEZpcnN0TmF0aXZlTm9kZShsVmlldywgdE5vZGUpO1xuXG4gICAgLy8gSWYgY29udGFpbmVyIGlzIG5vdCBlbXB0eSwgdXNlIGEgcmVmZXJlbmNlIHRvIHRoZSBmaXJzdCBlbGVtZW50LFxuICAgIC8vIG90aGVyd2lzZSwgck5vZGUgd291bGQgcG9pbnQgdG8gYW4gYW5jaG9yIGNvbW1lbnQgbm9kZS5cbiAgICBpZiAoZmlyc3RSTm9kZSkge1xuICAgICAgck5vZGUgPSBmaXJzdFJOb2RlO1xuICAgIH1cbiAgfVxuICBsZXQgcGF0aDogc3RyaW5nIHwgbnVsbCA9IGNhbGNQYXRoQmV0d2VlbihwYXJlbnRSTm9kZSBhcyBOb2RlLCByTm9kZSBhcyBOb2RlLCByZWZlcmVuY2VOb2RlTmFtZSk7XG4gIGlmIChwYXRoID09PSBudWxsICYmIHBhcmVudFJOb2RlICE9PSByTm9kZSkge1xuICAgIC8vIFNlYXJjaGluZyBmb3IgYSBwYXRoIGJldHdlZW4gZWxlbWVudHMgd2l0aGluIGEgaG9zdCBub2RlIGZhaWxlZC5cbiAgICAvLyBUcnlpbmcgdG8gZmluZCBhIHBhdGggdG8gYW4gZWxlbWVudCBzdGFydGluZyBmcm9tIHRoZSBgZG9jdW1lbnQuYm9keWAgaW5zdGVhZC5cbiAgICAvL1xuICAgIC8vIEltcG9ydGFudCBub3RlOiB0aGlzIHR5cGUgb2YgcmVmZXJlbmNlIGlzIHJlbGF0aXZlbHkgdW5zdGFibGUsIHNpbmNlIEFuZ3VsYXJcbiAgICAvLyBtYXkgbm90IGJlIGFibGUgdG8gY29udHJvbCBwYXJ0cyBvZiB0aGUgcGFnZSB0aGF0IHRoZSBydW50aW1lIGxvZ2ljIG5hdmlnYXRlc1xuICAgIC8vIHRocm91Z2guIFRoaXMgaXMgbW9zdGx5IG5lZWRlZCB0byBjb3ZlciBcInBvcnRhbHNcIiB1c2UtY2FzZSAobGlrZSBtZW51cywgZGlhbG9nIGJveGVzLFxuICAgIC8vIGV0YyksIHdoZXJlIG5vZGVzIGFyZSBjb250ZW50LXByb2plY3RlZCAoaW5jbHVkaW5nIGRpcmVjdCBET00gbWFuaXB1bGF0aW9ucykgb3V0c2lkZVxuICAgIC8vIG9mIHRoZSBob3N0IG5vZGUuIFRoZSBiZXR0ZXIgc29sdXRpb24gaXMgdG8gcHJvdmlkZSBBUElzIHRvIHdvcmsgd2l0aCBcInBvcnRhbHNcIixcbiAgICAvLyBhdCB3aGljaCBwb2ludCB0aGlzIGNvZGUgcGF0aCB3b3VsZCBub3QgYmUgbmVlZGVkLlxuICAgIGNvbnN0IGJvZHkgPSAocGFyZW50Uk5vZGUgYXMgTm9kZSkub3duZXJEb2N1bWVudCEuYm9keSBhcyBOb2RlO1xuICAgIHBhdGggPSBjYWxjUGF0aEJldHdlZW4oYm9keSwgck5vZGUgYXMgTm9kZSwgUkVGRVJFTkNFX05PREVfQk9EWSk7XG5cbiAgICBpZiAocGF0aCA9PT0gbnVsbCkge1xuICAgICAgLy8gSWYgdGhlIHBhdGggaXMgc3RpbGwgZW1wdHksIGl0J3MgbGlrZWx5IHRoYXQgdGhpcyBub2RlIGlzIGRldGFjaGVkIGFuZFxuICAgICAgLy8gd29uJ3QgYmUgZm91bmQgZHVyaW5nIGh5ZHJhdGlvbi5cbiAgICAgIHRocm93IG5vZGVOb3RGb3VuZEVycm9yKGxWaWV3LCB0Tm9kZSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBwYXRoITtcbn1cbiJdfQ==