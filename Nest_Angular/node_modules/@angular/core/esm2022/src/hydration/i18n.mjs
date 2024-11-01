/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { inject, Injector } from '../di';
import { isRootTemplateMessage } from '../render3/i18n/i18n_util';
import { createIcuIterator } from '../render3/instructions/i18n_icu_container_visitor';
import { isTNodeShape } from '../render3/interfaces/node';
import { HEADER_OFFSET, HYDRATION, RENDERER, TVIEW } from '../render3/interfaces/view';
import { getFirstNativeNode, nativeRemoveNode } from '../render3/node_manipulation';
import { unwrapRNode } from '../render3/util/view_utils';
import { assertDefined, assertNotEqual } from '../util/assert';
import { I18N_DATA } from './interfaces';
import { isDisconnectedRNode, locateNextRNode, tryLocateRNodeByPath } from './node_lookup_utils';
import { isI18nInSkipHydrationBlock } from './skip_hydration';
import { IS_I18N_HYDRATION_ENABLED } from './tokens';
import { getNgContainerSize, initDisconnectedNodes, isDisconnectedNode, isSerializedElementContainer, processTextNodeBeforeSerialization, } from './utils';
let _isI18nHydrationSupportEnabled = false;
let _prepareI18nBlockForHydrationImpl = () => {
    // noop unless `enablePrepareI18nBlockForHydrationImpl` is invoked.
};
export function setIsI18nHydrationSupportEnabled(enabled) {
    _isI18nHydrationSupportEnabled = enabled;
}
export function isI18nHydrationSupportEnabled() {
    return _isI18nHydrationSupportEnabled;
}
/**
 * Prepares an i18n block and its children, located at the given
 * view and instruction index, for hydration.
 *
 * @param lView lView with the i18n block
 * @param index index of the i18n block in the lView
 * @param parentTNode TNode of the parent of the i18n block
 * @param subTemplateIndex sub-template index, or -1 for the main template
 */
export function prepareI18nBlockForHydration(lView, index, parentTNode, subTemplateIndex) {
    _prepareI18nBlockForHydrationImpl(lView, index, parentTNode, subTemplateIndex);
}
export function enablePrepareI18nBlockForHydrationImpl() {
    _prepareI18nBlockForHydrationImpl = prepareI18nBlockForHydrationImpl;
}
export function isI18nHydrationEnabled(injector) {
    injector = injector ?? inject(Injector);
    return injector.get(IS_I18N_HYDRATION_ENABLED, false);
}
/**
 * Collects, if not already cached, all of the indices in the
 * given TView which are children of an i18n block.
 *
 * Since i18n blocks don't introduce a parent TNode, this is necessary
 * in order to determine which indices in a LView are translated.
 */
export function getOrComputeI18nChildren(tView, context) {
    let i18nChildren = context.i18nChildren.get(tView);
    if (i18nChildren === undefined) {
        i18nChildren = collectI18nChildren(tView);
        context.i18nChildren.set(tView, i18nChildren);
    }
    return i18nChildren;
}
function collectI18nChildren(tView) {
    const children = new Set();
    function collectI18nViews(node) {
        children.add(node.index);
        switch (node.kind) {
            case 1 /* I18nNodeKind.ELEMENT */:
            case 2 /* I18nNodeKind.PLACEHOLDER */: {
                for (const childNode of node.children) {
                    collectI18nViews(childNode);
                }
                break;
            }
            case 3 /* I18nNodeKind.ICU */: {
                for (const caseNodes of node.cases) {
                    for (const caseNode of caseNodes) {
                        collectI18nViews(caseNode);
                    }
                }
                break;
            }
        }
    }
    // Traverse through the AST of each i18n block in the LView,
    // and collect every instruction index.
    for (let i = HEADER_OFFSET; i < tView.bindingStartIndex; i++) {
        const tI18n = tView.data[i];
        if (!tI18n || !tI18n.ast) {
            continue;
        }
        for (const node of tI18n.ast) {
            collectI18nViews(node);
        }
    }
    return children.size === 0 ? null : children;
}
/**
 * Attempts to serialize i18n data for an i18n block, located at
 * the given view and instruction index.
 *
 * @param lView lView with the i18n block
 * @param index index of the i18n block in the lView
 * @param context the hydration context
 * @returns the i18n data, or null if there is no relevant data
 */
export function trySerializeI18nBlock(lView, index, context) {
    if (!context.isI18nHydrationEnabled) {
        return null;
    }
    const tView = lView[TVIEW];
    const tI18n = tView.data[index];
    if (!tI18n || !tI18n.ast) {
        return null;
    }
    const parentTNode = tView.data[tI18n.parentTNodeIndex];
    if (parentTNode && isI18nInSkipHydrationBlock(parentTNode)) {
        return null;
    }
    const serializedI18nBlock = {
        caseQueue: [],
        disconnectedNodes: new Set(),
        disjointNodes: new Set(),
    };
    serializeI18nBlock(lView, serializedI18nBlock, context, tI18n.ast);
    return serializedI18nBlock.caseQueue.length === 0 &&
        serializedI18nBlock.disconnectedNodes.size === 0 &&
        serializedI18nBlock.disjointNodes.size === 0
        ? null
        : serializedI18nBlock;
}
function serializeI18nBlock(lView, serializedI18nBlock, context, nodes) {
    let prevRNode = null;
    for (const node of nodes) {
        const nextRNode = serializeI18nNode(lView, serializedI18nBlock, context, node);
        if (nextRNode) {
            if (isDisjointNode(prevRNode, nextRNode)) {
                serializedI18nBlock.disjointNodes.add(node.index - HEADER_OFFSET);
            }
            prevRNode = nextRNode;
        }
    }
    return prevRNode;
}
/**
 * Helper to determine whether the given nodes are "disjoint".
 *
 * The i18n hydration process walks through the DOM and i18n nodes
 * at the same time. It expects the sibling DOM node of the previous
 * i18n node to be the first node of the next i18n node.
 *
 * In cases of content projection, this won't always be the case. So
 * when we detect that, we mark the node as "disjoint", ensuring that
 * we will serialize the path to the node. This way, when we hydrate the
 * i18n node, we will be able to find the correct place to start.
 */
function isDisjointNode(prevNode, nextNode) {
    return prevNode && prevNode.nextSibling !== nextNode;
}
/**
 * Process the given i18n node for serialization.
 * Returns the first RNode for the i18n node to begin hydration.
 */
function serializeI18nNode(lView, serializedI18nBlock, context, node) {
    const maybeRNode = unwrapRNode(lView[node.index]);
    if (!maybeRNode || isDisconnectedRNode(maybeRNode)) {
        serializedI18nBlock.disconnectedNodes.add(node.index - HEADER_OFFSET);
        return null;
    }
    const rNode = maybeRNode;
    switch (node.kind) {
        case 0 /* I18nNodeKind.TEXT */: {
            processTextNodeBeforeSerialization(context, rNode);
            break;
        }
        case 1 /* I18nNodeKind.ELEMENT */:
        case 2 /* I18nNodeKind.PLACEHOLDER */: {
            serializeI18nBlock(lView, serializedI18nBlock, context, node.children);
            break;
        }
        case 3 /* I18nNodeKind.ICU */: {
            const currentCase = lView[node.currentCaseLViewIndex];
            if (currentCase != null) {
                // i18n uses a negative value to signal a change to a new case, so we
                // need to invert it to get the proper value.
                const caseIdx = currentCase < 0 ? ~currentCase : currentCase;
                serializedI18nBlock.caseQueue.push(caseIdx);
                serializeI18nBlock(lView, serializedI18nBlock, context, node.cases[caseIdx]);
            }
            break;
        }
    }
    return getFirstNativeNodeForI18nNode(lView, node);
}
/**
 * Helper function to get the first native node to begin hydrating
 * the given i18n node.
 */
function getFirstNativeNodeForI18nNode(lView, node) {
    const tView = lView[TVIEW];
    const maybeTNode = tView.data[node.index];
    if (isTNodeShape(maybeTNode)) {
        // If the node is backed by an actual TNode, we can simply delegate.
        return getFirstNativeNode(lView, maybeTNode);
    }
    else if (node.kind === 3 /* I18nNodeKind.ICU */) {
        // A nested ICU container won't have an actual TNode. In that case, we can use
        // an iterator to find the first child.
        const icuIterator = createIcuIterator(maybeTNode, lView);
        let rNode = icuIterator();
        // If the ICU container has no nodes, then we use the ICU anchor as the node.
        return rNode ?? unwrapRNode(lView[node.index]);
    }
    else {
        // Otherwise, the node is a text or trivial element in an ICU container,
        // and we can just use the RNode directly.
        return unwrapRNode(lView[node.index]) ?? null;
    }
}
function setCurrentNode(state, node) {
    state.currentNode = node;
}
/**
 * Marks the current RNode as the hydration root for the given
 * AST node.
 */
function appendI18nNodeToCollection(context, state, astNode) {
    const noOffsetIndex = astNode.index - HEADER_OFFSET;
    const { disconnectedNodes } = context;
    const currentNode = state.currentNode;
    if (state.isConnected) {
        context.i18nNodes.set(noOffsetIndex, currentNode);
        // We expect the node to be connected, so ensure that it
        // is not in the set, regardless of whether we found it,
        // so that the downstream error handling can provide the
        // proper context.
        disconnectedNodes.delete(noOffsetIndex);
    }
    else {
        disconnectedNodes.add(noOffsetIndex);
    }
    return currentNode;
}
/**
 * Skip over some sibling nodes during hydration.
 *
 * Note: we use this instead of `siblingAfter` as it's expected that
 * sometimes we might encounter null nodes. In those cases, we want to
 * defer to downstream error handling to provide proper context.
 */
function skipSiblingNodes(state, skip) {
    let currentNode = state.currentNode;
    for (let i = 0; i < skip; i++) {
        if (!currentNode) {
            break;
        }
        currentNode = currentNode?.nextSibling ?? null;
    }
    return currentNode;
}
/**
 * Fork the given state into a new state for hydrating children.
 */
function forkHydrationState(state, nextNode) {
    return { currentNode: nextNode, isConnected: state.isConnected };
}
function prepareI18nBlockForHydrationImpl(lView, index, parentTNode, subTemplateIndex) {
    const hydrationInfo = lView[HYDRATION];
    if (!hydrationInfo) {
        return;
    }
    if (!isI18nHydrationSupportEnabled() ||
        (parentTNode &&
            (isI18nInSkipHydrationBlock(parentTNode) ||
                isDisconnectedNode(hydrationInfo, parentTNode.index - HEADER_OFFSET)))) {
        return;
    }
    const tView = lView[TVIEW];
    const tI18n = tView.data[index];
    ngDevMode &&
        assertDefined(tI18n, 'Expected i18n data to be present in a given TView slot during hydration');
    function findHydrationRoot() {
        if (isRootTemplateMessage(subTemplateIndex)) {
            // This is the root of an i18n block. In this case, our hydration root will
            // depend on where our parent TNode (i.e. the block with i18n applied) is
            // in the DOM.
            ngDevMode && assertDefined(parentTNode, 'Expected parent TNode while hydrating i18n root');
            const rootNode = locateNextRNode(hydrationInfo, tView, lView, parentTNode);
            // If this i18n block is attached to an <ng-container>, then we want to begin
            // hydrating directly with the RNode. Otherwise, for a TNode with a physical DOM
            // element, we want to recurse into the first child and begin there.
            return parentTNode.type & 8 /* TNodeType.ElementContainer */ ? rootNode : rootNode.firstChild;
        }
        // This is a nested template in an i18n block. In this case, the entire view
        // is translated, and part of a dehydrated view in a container. This means that
        // we can simply begin hydration with the first dehydrated child.
        return hydrationInfo?.firstChild;
    }
    const currentNode = findHydrationRoot();
    ngDevMode && assertDefined(currentNode, 'Expected root i18n node during hydration');
    const disconnectedNodes = initDisconnectedNodes(hydrationInfo) ?? new Set();
    const i18nNodes = (hydrationInfo.i18nNodes ??= new Map());
    const caseQueue = hydrationInfo.data[I18N_DATA]?.[index - HEADER_OFFSET] ?? [];
    const dehydratedIcuData = (hydrationInfo.dehydratedIcuData ??= new Map());
    collectI18nNodesFromDom({ hydrationInfo, lView, i18nNodes, disconnectedNodes, caseQueue, dehydratedIcuData }, { currentNode, isConnected: true }, tI18n.ast);
    // Nodes from inactive ICU cases should be considered disconnected. We track them above
    // because they aren't (and shouldn't be) serialized. Since we may mutate or create a
    // new set, we need to be sure to write the expected value back to the DehydratedView.
    hydrationInfo.disconnectedNodes = disconnectedNodes.size === 0 ? null : disconnectedNodes;
}
function collectI18nNodesFromDom(context, state, nodeOrNodes) {
    if (Array.isArray(nodeOrNodes)) {
        let nextState = state;
        for (const node of nodeOrNodes) {
            // Whenever a node doesn't directly follow the previous RNode, it
            // is given a path. We need to resume collecting nodes from that location
            // until and unless we find another disjoint node.
            const targetNode = tryLocateRNodeByPath(context.hydrationInfo, context.lView, node.index - HEADER_OFFSET);
            if (targetNode) {
                nextState = forkHydrationState(state, targetNode);
            }
            collectI18nNodesFromDom(context, nextState, node);
        }
    }
    else {
        if (context.disconnectedNodes.has(nodeOrNodes.index - HEADER_OFFSET)) {
            // i18n nodes can be considered disconnected if e.g. they were projected.
            // In that case, we have to make sure to skip over them.
            return;
        }
        switch (nodeOrNodes.kind) {
            case 0 /* I18nNodeKind.TEXT */: {
                // Claim a text node for hydration
                const currentNode = appendI18nNodeToCollection(context, state, nodeOrNodes);
                setCurrentNode(state, currentNode?.nextSibling ?? null);
                break;
            }
            case 1 /* I18nNodeKind.ELEMENT */: {
                // Recurse into the current element's children...
                collectI18nNodesFromDom(context, forkHydrationState(state, state.currentNode?.firstChild ?? null), nodeOrNodes.children);
                // And claim the parent element itself.
                const currentNode = appendI18nNodeToCollection(context, state, nodeOrNodes);
                setCurrentNode(state, currentNode?.nextSibling ?? null);
                break;
            }
            case 2 /* I18nNodeKind.PLACEHOLDER */: {
                const noOffsetIndex = nodeOrNodes.index - HEADER_OFFSET;
                const { hydrationInfo } = context;
                const containerSize = getNgContainerSize(hydrationInfo, noOffsetIndex);
                switch (nodeOrNodes.type) {
                    case 0 /* I18nPlaceholderType.ELEMENT */: {
                        // Hydration expects to find the head of the element.
                        const currentNode = appendI18nNodeToCollection(context, state, nodeOrNodes);
                        // A TNode for the node may not yet if we're hydrating during the first pass,
                        // so use the serialized data to determine if this is an <ng-container>.
                        if (isSerializedElementContainer(hydrationInfo, noOffsetIndex)) {
                            // An <ng-container> doesn't have a physical DOM node, so we need to
                            // continue hydrating from siblings.
                            collectI18nNodesFromDom(context, state, nodeOrNodes.children);
                            // Skip over the anchor element. It will be claimed by the
                            // downstream container hydration.
                            const nextNode = skipSiblingNodes(state, 1);
                            setCurrentNode(state, nextNode);
                        }
                        else {
                            // Non-container elements represent an actual node in the DOM, so we
                            // need to continue hydration with the children, and claim the node.
                            collectI18nNodesFromDom(context, forkHydrationState(state, state.currentNode?.firstChild ?? null), nodeOrNodes.children);
                            setCurrentNode(state, currentNode?.nextSibling ?? null);
                            // Elements can also be the anchor of a view container, so there may
                            // be elements after this node that we need to skip.
                            if (containerSize !== null) {
                                // `+1` stands for an anchor node after all of the views in the container.
                                const nextNode = skipSiblingNodes(state, containerSize + 1);
                                setCurrentNode(state, nextNode);
                            }
                        }
                        break;
                    }
                    case 1 /* I18nPlaceholderType.SUBTEMPLATE */: {
                        ngDevMode &&
                            assertNotEqual(containerSize, null, 'Expected a container size while hydrating i18n subtemplate');
                        // Hydration expects to find the head of the template.
                        appendI18nNodeToCollection(context, state, nodeOrNodes);
                        // Skip over all of the template children, as well as the anchor
                        // node, since the template itself will handle them instead.
                        const nextNode = skipSiblingNodes(state, containerSize + 1);
                        setCurrentNode(state, nextNode);
                        break;
                    }
                }
                break;
            }
            case 3 /* I18nNodeKind.ICU */: {
                // If the current node is connected, we need to pop the next case from the
                // queue, so that the active case is also considered connected.
                const selectedCase = state.isConnected ? context.caseQueue.shift() : null;
                const childState = { currentNode: null, isConnected: false };
                // We traverse through each case, even if it's not active,
                // so that we correctly populate disconnected nodes.
                for (let i = 0; i < nodeOrNodes.cases.length; i++) {
                    collectI18nNodesFromDom(context, i === selectedCase ? state : childState, nodeOrNodes.cases[i]);
                }
                if (selectedCase !== null) {
                    // ICUs represent a branching state, and the selected case could be different
                    // than what it was on the server. In that case, we need to be able to clean
                    // up the nodes from the original case. To do that, we store the selected case.
                    context.dehydratedIcuData.set(nodeOrNodes.index, { case: selectedCase, node: nodeOrNodes });
                }
                // Hydration expects to find the ICU anchor element.
                const currentNode = appendI18nNodeToCollection(context, state, nodeOrNodes);
                setCurrentNode(state, currentNode?.nextSibling ?? null);
                break;
            }
        }
    }
}
let _claimDehydratedIcuCaseImpl = () => {
    // noop unless `enableClaimDehydratedIcuCaseImpl` is invoked
};
/**
 * Mark the case for the ICU node at the given index in the view as claimed,
 * allowing its nodes to be hydrated and not cleaned up.
 */
export function claimDehydratedIcuCase(lView, icuIndex, caseIndex) {
    _claimDehydratedIcuCaseImpl(lView, icuIndex, caseIndex);
}
export function enableClaimDehydratedIcuCaseImpl() {
    _claimDehydratedIcuCaseImpl = claimDehydratedIcuCaseImpl;
}
function claimDehydratedIcuCaseImpl(lView, icuIndex, caseIndex) {
    const dehydratedIcuDataMap = lView[HYDRATION]?.dehydratedIcuData;
    if (dehydratedIcuDataMap) {
        const dehydratedIcuData = dehydratedIcuDataMap.get(icuIndex);
        if (dehydratedIcuData?.case === caseIndex) {
            // If the case we're attempting to claim matches the dehydrated one,
            // we remove it from the map to mark it as "claimed."
            dehydratedIcuDataMap.delete(icuIndex);
        }
    }
}
/**
 * Clean up all i18n hydration data associated with the given view.
 */
export function cleanupI18nHydrationData(lView) {
    const hydrationInfo = lView[HYDRATION];
    if (hydrationInfo) {
        const { i18nNodes, dehydratedIcuData: dehydratedIcuDataMap } = hydrationInfo;
        if (i18nNodes && dehydratedIcuDataMap) {
            const renderer = lView[RENDERER];
            for (const dehydratedIcuData of dehydratedIcuDataMap.values()) {
                cleanupDehydratedIcuData(renderer, i18nNodes, dehydratedIcuData);
            }
        }
        hydrationInfo.i18nNodes = undefined;
        hydrationInfo.dehydratedIcuData = undefined;
    }
}
function cleanupDehydratedIcuData(renderer, i18nNodes, dehydratedIcuData) {
    for (const node of dehydratedIcuData.node.cases[dehydratedIcuData.case]) {
        const rNode = i18nNodes.get(node.index - HEADER_OFFSET);
        if (rNode) {
            nativeRemoveNode(renderer, rNode, false);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaTE4bi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL2h5ZHJhdGlvbi9pMThuLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxNQUFNLEVBQUUsUUFBUSxFQUFDLE1BQU0sT0FBTyxDQUFDO0FBQ3ZDLE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLDJCQUEyQixDQUFDO0FBQ2hFLE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLG9EQUFvRCxDQUFDO0FBRXJGLE9BQU8sRUFBQyxZQUFZLEVBQW1CLE1BQU0sNEJBQTRCLENBQUM7QUFHMUUsT0FBTyxFQUFDLGFBQWEsRUFBRSxTQUFTLEVBQVMsUUFBUSxFQUFTLEtBQUssRUFBQyxNQUFNLDRCQUE0QixDQUFDO0FBQ25HLE9BQU8sRUFBQyxrQkFBa0IsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLDhCQUE4QixDQUFDO0FBQ2xGLE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSw0QkFBNEIsQ0FBQztBQUN2RCxPQUFPLEVBQUMsYUFBYSxFQUFFLGNBQWMsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBRzdELE9BQU8sRUFBb0MsU0FBUyxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBQzFFLE9BQU8sRUFBQyxtQkFBbUIsRUFBRSxlQUFlLEVBQUUsb0JBQW9CLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUMvRixPQUFPLEVBQUMsMEJBQTBCLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUM1RCxPQUFPLEVBQUMseUJBQXlCLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFDbkQsT0FBTyxFQUNMLGtCQUFrQixFQUNsQixxQkFBcUIsRUFDckIsa0JBQWtCLEVBQ2xCLDRCQUE0QixFQUM1QixrQ0FBa0MsR0FDbkMsTUFBTSxTQUFTLENBQUM7QUFFakIsSUFBSSw4QkFBOEIsR0FBRyxLQUFLLENBQUM7QUFFM0MsSUFB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RCxJQUFJLEtBQUssRUFBRSxDQUFDO1lBQ1YsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMzQyxDQUFDO0lBQ0gsQ0FBQztBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCB7aW5qZWN0LCBJbmplY3Rvcn0gZnJvbSAnLi4vZGknO1xuaW1wb3J0IHtpc1Jvb3RUZW1wbGF0ZU1lc3NhZ2V9IGZyb20gJy4uL3JlbmRlcjMvaTE4bi9pMThuX3V0aWwnO1xuaW1wb3J0IHtjcmVhdGVJY3VJdGVyYXRvcn0gZnJvbSAnLi4vcmVuZGVyMy9pbnN0cnVjdGlvbnMvaTE4bl9pY3VfY29udGFpbmVyX3Zpc2l0b3InO1xuaW1wb3J0IHtJMThuTm9kZSwgSTE4bk5vZGVLaW5kLCBJMThuUGxhY2Vob2xkZXJUeXBlLCBUSTE4biwgVEljdX0gZnJvbSAnLi4vcmVuZGVyMy9pbnRlcmZhY2VzL2kxOG4nO1xuaW1wb3J0IHtpc1ROb2RlU2hhcGUsIFROb2RlLCBUTm9kZVR5cGV9IGZyb20gJy4uL3JlbmRlcjMvaW50ZXJmYWNlcy9ub2RlJztcbmltcG9ydCB0eXBlIHtSZW5kZXJlcn0gZnJvbSAnLi4vcmVuZGVyMy9pbnRlcmZhY2VzL3JlbmRlcmVyJztcbmltcG9ydCB0eXBlIHtSTm9kZX0gZnJvbSAnLi4vcmVuZGVyMy9pbnRlcmZhY2VzL3JlbmRlcmVyX2RvbSc7XG5pbXBvcnQge0hFQURFUl9PRkZTRVQsIEhZRFJBVElPTiwgTFZpZXcsIFJFTkRFUkVSLCBUVmlldywgVFZJRVd9IGZyb20gJy4uL3JlbmRlcjMvaW50ZXJmYWNlcy92aWV3JztcbmltcG9ydCB7Z2V0Rmlyc3ROYXRpdmVOb2RlLCBuYXRpdmVSZW1vdmVOb2RlfSBmcm9tICcuLi9yZW5kZXIzL25vZGVfbWFuaXB1bGF0aW9uJztcbmltcG9ydCB7dW53cmFwUk5vZGV9IGZyb20gJy4uL3JlbmRlcjMvdXRpbC92aWV3X3V0aWxzJztcbmltcG9ydCB7YXNzZXJ0RGVmaW5lZCwgYXNzZXJ0Tm90RXF1YWx9IGZyb20gJy4uL3V0aWwvYXNzZXJ0JztcblxuaW1wb3J0IHR5cGUge0h5ZHJhdGlvbkNvbnRleHR9IGZyb20gJy4vYW5ub3RhdGUnO1xuaW1wb3J0IHtEZWh5ZHJhdGVkSWN1RGF0YSwgRGVoeWRyYXRlZFZpZXcsIEkxOE5fREFUQX0gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmltcG9ydCB7aXNEaXNjb25uZWN0ZWRSTm9kZSwgbG9jYXRlTmV4dFJOb2RlLCB0cnlMb2NhdGVSTm9kZUJ5UGF0aH0gZnJvbSAnLi9ub2RlX2xvb2t1cF91dGlscyc7XG5pbXBvcnQge2lzSTE4bkluU2tpcEh5ZHJhdGlvbkJsb2NrfSBmcm9tICcuL3NraXBfaHlkcmF0aW9uJztcbmltcG9ydCB7SVNfSTE4Tl9IWURSQVRJT05fRU5BQkxFRH0gZnJvbSAnLi90b2tlbnMnO1xuaW1wb3J0IHtcbiAgZ2V0TmdDb250YWluZXJTaXplLFxuICBpbml0RGlzY29ubmVjdGVkTm9kZXMsXG4gIGlzRGlzY29ubmVjdGVkTm9kZSxcbiAgaXNTZXJpYWxpemVkRWxlbWVudENvbnRhaW5lcixcbiAgcHJvY2Vzc1RleHROb2RlQmVmb3JlU2VyaWFsaXphdGlvbixcbn0gZnJvbSAnLi91dGlscyc7XG5cbmxldCBfaXNJMThuSHlkcmF0aW9uU3VwcG9ydEVuYWJsZWQgPSBmYWxzZTtcblxubGV0IF9wcmVwYXJlSTE4bkJsb2NrRm9ySHlkcmF0aW9uSW1wbDogdHlwZW9mIHByZXBhcmVJMThuQmxvY2tGb3JIeWRyYXRpb25JbXBsID0gKCkgPT4ge1xuICAvLyBub29wIHVubGVzcyBgZW5hYmxlUHJlcGFyZUkxOG5CbG9ja0Zvckh5ZHJhdGlvbkltcGxgIGlzIGludm9rZWQuXG59O1xuXG5leHBvcnQgZnVuY3Rpb24gc2V0SXNJMThuSHlkcmF0aW9uU3VwcG9ydEVuYWJsZWQoZW5hYmxlZDogYm9vbGVhbikge1xuICBfaXNJMThuSHlkcmF0aW9uU3VwcG9ydEVuYWJsZWQgPSBlbmFibGVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNJMThuSHlkcmF0aW9uU3VwcG9ydEVuYWJsZWQoKSB7XG4gIHJldHVybiBfaXNJMThuSHlkcmF0aW9uU3VwcG9ydEVuYWJsZWQ7XG59XG5cbi8qKlxuICogUHJlcGFyZXMgYW4gaTE4biBibG9jayBhbmQgaXRzIGNoaWxkcmVuLCBsb2NhdGVkIGF0IHRoZSBnaXZlblxuICogdmlldyBhbmQgaW5zdHJ1Y3Rpb24gaW5kZXgsIGZvciBoeWRyYXRpb24uXG4gKlxuICogQHBhcmFtIGxWaWV3IGxWaWV3IHdpdGggdGhlIGkxOG4gYmxvY2tcbiAqIEBwYXJhbSBpbmRleCBpbmRleCBvZiB0aGUgaTE4biBibG9jayBpbiB0aGUgbFZpZXdcbiAqIEBwYXJhbSBwYXJlbnRUTm9kZSBUTm9kZSBvZiB0aGUgcGFyZW50IG9mIHRoZSBpMThuIGJsb2NrXG4gKiBAcGFyYW0gc3ViVGVtcGxhdGVJbmRleCBzdWItdGVtcGxhdGUgaW5kZXgsIG9yIC0xIGZvciB0aGUgbWFpbiB0ZW1wbGF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gcHJlcGFyZUkxOG5CbG9ja0Zvckh5ZHJhdGlvbihcbiAgbFZpZXc6IExWaWV3LFxuICBpbmRleDogbnVtYmVyLFxuICBwYXJlbnRUTm9kZTogVE5vZGUgfCBudWxsLFxuICBzdWJUZW1wbGF0ZUluZGV4OiBudW1iZXIsXG4pOiB2b2lkIHtcbiAgX3ByZXBhcmVJMThuQmxvY2tGb3JIeWRyYXRpb25JbXBsKGxWaWV3LCBpbmRleCwgcGFyZW50VE5vZGUsIHN1YlRlbXBsYXRlSW5kZXgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZW5hYmxlUHJlcGFyZUkxOG5CbG9ja0Zvckh5ZHJhdGlvbkltcGwoKSB7XG4gIF9wcmVwYXJlSTE4bkJsb2NrRm9ySHlkcmF0aW9uSW1wbCA9IHByZXBhcmVJMThuQmxvY2tGb3JIeWRyYXRpb25JbXBsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNJMThuSHlkcmF0aW9uRW5hYmxlZChpbmplY3Rvcj86IEluamVjdG9yKSB7XG4gIGluamVjdG9yID0gaW5qZWN0b3IgPz8gaW5qZWN0KEluamVjdG9yKTtcbiAgcmV0dXJuIGluamVjdG9yLmdldChJU19JMThOX0hZRFJBVElPTl9FTkFCTEVELCBmYWxzZSk7XG59XG5cbi8qKlxuICogQ29sbGVjdHMsIGlmIG5vdCBhbHJlYWR5IGNhY2hlZCwgYWxsIG9mIHRoZSBpbmRpY2VzIGluIHRoZVxuICogZ2l2ZW4gVFZpZXcgd2hpY2ggYXJlIGNoaWxkcmVuIG9mIGFuIGkxOG4gYmxvY2suXG4gKlxuICogU2luY2UgaTE4biBibG9ja3MgZG9uJ3QgaW50cm9kdWNlIGEgcGFyZW50IFROb2RlLCB0aGlzIGlzIG5lY2Vzc2FyeVxuICogaW4gb3JkZXIgdG8gZGV0ZXJtaW5lIHdoaWNoIGluZGljZXMgaW4gYSBMVmlldyBhcmUgdHJhbnNsYXRlZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldE9yQ29tcHV0ZUkxOG5DaGlsZHJlbihcbiAgdFZpZXc6IFRWaWV3LFxuICBjb250ZXh0OiBIeWRyYXRpb25Db250ZXh0LFxuKTogU2V0PG51bWJlcj4gfCBudWxsIHtcbiAgbGV0IGkxOG5DaGlsZHJlbiA9IGNvbnRleHQuaTE4bkNoaWxkcmVuLmdldCh0Vmlldyk7XG4gIGlmIChpMThuQ2hpbGRyZW4gPT09IHVuZGVmaW5lZCkge1xuICAgIGkxOG5DaGlsZHJlbiA9IGNvbGxlY3RJMThuQ2hpbGRyZW4odFZpZXcpO1xuICAgIGNvbnRleHQuaTE4bkNoaWxkcmVuLnNldCh0VmlldywgaTE4bkNoaWxkcmVuKTtcbiAgfVxuICByZXR1cm4gaTE4bkNoaWxkcmVuO1xufVxuXG5mdW5jdGlvbiBjb2xsZWN0STE4bkNoaWxkcmVuKHRWaWV3OiBUVmlldyk6IFNldDxudW1iZXI+IHwgbnVsbCB7XG4gIGNvbnN0IGNoaWxkcmVuID0gbmV3IFNldDxudW1iZXI+KCk7XG5cbiAgZnVuY3Rpb24gY29sbGVjdEkxOG5WaWV3cyhub2RlOiBJMThuTm9kZSkge1xuICAgIGNoaWxkcmVuLmFkZChub2RlLmluZGV4KTtcblxuICAgIHN3aXRjaCAobm9kZS5raW5kKSB7XG4gICAgICBjYXNlIEkxOG5Ob2RlS2luZC5FTEVNRU5UOlxuICAgICAgY2FzZSBJMThuTm9kZUtpbmQuUExBQ0VIT0xERVI6IHtcbiAgICAgICAgZm9yIChjb25zdCBjaGlsZE5vZGUgb2Ygbm9kZS5jaGlsZHJlbikge1xuICAgICAgICAgIGNvbGxlY3RJMThuVmlld3MoY2hpbGROb2RlKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgY2FzZSBJMThuTm9kZUtpbmQuSUNVOiB7XG4gICAgICAgIGZvciAoY29uc3QgY2FzZU5vZGVzIG9mIG5vZGUuY2FzZXMpIHtcbiAgICAgICAgICBmb3IgKGNvbnN0IGNhc2VOb2RlIG9mIGNhc2VOb2Rlcykge1xuICAgICAgICAgICAgY29sbGVjdEkxOG5WaWV3cyhjYXNlTm9kZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIFRyYXZlcnNlIHRocm91Z2ggdGhlIEFTVCBvZiBlYWNoIGkxOG4gYmxvY2sgaW4gdGhlIExWaWV3LFxuICAvLyBhbmQgY29sbGVjdCBldmVyeSBpbnN0cnVjdGlvbiBpbmRleC5cbiAgZm9yIChsZXQgaSA9IEhFQURFUl9PRkZTRVQ7IGkgPCB0Vmlldy5iaW5kaW5nU3RhcnRJbmRleDsgaSsrKSB7XG4gICAgY29uc3QgdEkxOG4gPSB0Vmlldy5kYXRhW2ldIGFzIFRJMThuIHwgdW5kZWZpbmVkO1xuICAgIGlmICghdEkxOG4gfHwgIXRJMThuLmFzdCkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBub2RlIG9mIHRJMThuLmFzdCkge1xuICAgICAgY29sbGVjdEkxOG5WaWV3cyhub2RlKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gY2hpbGRyZW4uc2l6ZSA9PT0gMCA/IG51bGwgOiBjaGlsZHJlbjtcbn1cblxuLyoqXG4gKiBSZXN1bHRpbmcgZGF0YSBmcm9tIHNlcmlhbGl6aW5nIGFuIGkxOG4gYmxvY2suXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU2VyaWFsaXplZEkxOG5CbG9jayB7XG4gIC8qKlxuICAgKiBBIHF1ZXVlIG9mIGFjdGl2ZSBJQ1UgY2FzZXMgZnJvbSBhIGRlcHRoLWZpcnN0IHRyYXZlcnNhbFxuICAgKiBvZiB0aGUgaTE4biBBU1QuIFRoaXMgaXMgc2VyaWFsaXplZCB0byB0aGUgY2xpZW50IGluIG9yZGVyXG4gICAqIHRvIGNvcnJlY3RseSBhc3NvY2lhdGUgRE9NIG5vZGVzIHdpdGggaTE4biBub2RlcyBkdXJpbmdcbiAgICogaHlkcmF0aW9uLlxuICAgKi9cbiAgY2FzZVF1ZXVlOiBBcnJheTxudW1iZXI+O1xuXG4gIC8qKlxuICAgKiBBIHNldCBvZiBpbmRpY2VzIGluIHRoZSBsVmlldyBvZiB0aGUgYmxvY2sgZm9yIG5vZGVzXG4gICAqIHRoYXQgYXJlIGRpc2Nvbm5lY3RlZCBmcm9tIHRoZSBET00uIEluIGkxOG4sIHRoaXMgY2FuXG4gICAqIGhhcHBlbiB3aGVuIHVzaW5nIGNvbnRlbnQgcHJvamVjdGlvbiBidXQgc29tZSBub2RlcyBhcmVcbiAgICogbm90IHNlbGVjdGVkIGJ5IGFuIDxuZy1jb250ZW50IC8+LlxuICAgKi9cbiAgZGlzY29ubmVjdGVkTm9kZXM6IFNldDxudW1iZXI+O1xuXG4gIC8qKlxuICAgKiBBIHNldCBvZiBpbmRpY2VzIGluIHRoZSBsVmlldyBvZiB0aGUgYmxvY2sgZm9yIG5vZGVzXG4gICAqIGNvbnNpZGVyZWQgXCJkaXNqb2ludFwiLCBpbmRpY2F0aW5nIHRoYXQgd2UgbmVlZCB0byBzZXJpYWxpemVcbiAgICogYSBwYXRoIHRvIHRoZSBub2RlIGluIG9yZGVyIHRvIGh5ZHJhdGUgaXQuXG4gICAqXG4gICAqIEEgbm9kZSBpcyBjb25zaWRlcmVkIGRpc2pvaW50IHdoZW4gaXRzIFJOb2RlIGRvZXMgbm90XG4gICAqIGRpcmVjdGx5IGZvbGxvdyB0aGUgUk5vZGUgb2YgdGhlIHByZXZpb3VzIGkxOG4gbm9kZSwgZm9yXG4gICAqIGV4YW1wbGUsIGJlY2F1c2Ugb2YgY29udGVudCBwcm9qZWN0aW9uLlxuICAgKi9cbiAgZGlzam9pbnROb2RlczogU2V0PG51bWJlcj47XG59XG5cbi8qKlxuICogQXR0ZW1wdHMgdG8gc2VyaWFsaXplIGkxOG4gZGF0YSBmb3IgYW4gaTE4biBibG9jaywgbG9jYXRlZCBhdFxuICogdGhlIGdpdmVuIHZpZXcgYW5kIGluc3RydWN0aW9uIGluZGV4LlxuICpcbiAqIEBwYXJhbSBsVmlldyBsVmlldyB3aXRoIHRoZSBpMThuIGJsb2NrXG4gKiBAcGFyYW0gaW5kZXggaW5kZXggb2YgdGhlIGkxOG4gYmxvY2sgaW4gdGhlIGxWaWV3XG4gKiBAcGFyYW0gY29udGV4dCB0aGUgaHlkcmF0aW9uIGNvbnRleHRcbiAqIEByZXR1cm5zIHRoZSBpMThuIGRhdGEsIG9yIG51bGwgaWYgdGhlcmUgaXMgbm8gcmVsZXZhbnQgZGF0YVxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJ5U2VyaWFsaXplSTE4bkJsb2NrKFxuICBsVmlldzogTFZpZXcsXG4gIGluZGV4OiBudW1iZXIsXG4gIGNvbnRleHQ6IEh5ZHJhdGlvbkNvbnRleHQsXG4pOiBTZXJpYWxpemVkSTE4bkJsb2NrIHwgbnVsbCB7XG4gIGlmICghY29udGV4dC5pc0kxOG5IeWRyYXRpb25FbmFibGVkKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBjb25zdCB0VmlldyA9IGxWaWV3W1RWSUVXXTtcbiAgY29uc3QgdEkxOG4gPSB0Vmlldy5kYXRhW2luZGV4XSBhcyBUSTE4biB8IHVuZGVmaW5lZDtcbiAgaWYgKCF0STE4biB8fCAhdEkxOG4uYXN0KSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBjb25zdCBwYXJlbnRUTm9kZSA9IHRWaWV3LmRhdGFbdEkxOG4ucGFyZW50VE5vZGVJbmRleF0gYXMgVE5vZGU7XG4gIGlmIChwYXJlbnRUTm9kZSAmJiBpc0kxOG5JblNraXBIeWRyYXRpb25CbG9jayhwYXJlbnRUTm9kZSkpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNvbnN0IHNlcmlhbGl6ZWRJMThuQmxvY2s6IFNlcmlhbGl6ZWRJMThuQmxvY2sgPSB7XG4gICAgY2FzZVF1ZXVlOiBbXSxcbiAgICBkaXNjb25uZWN0ZWROb2RlczogbmV3IFNldCgpLFxuICAgIGRpc2pvaW50Tm9kZXM6IG5ldyBTZXQoKSxcbiAgfTtcbiAgc2VyaWFsaXplSTE4bkJsb2NrKGxWaWV3LCBzZXJpYWxpemVkSTE4bkJsb2NrLCBjb250ZXh0LCB0STE4bi5hc3QpO1xuXG4gIHJldHVybiBzZXJpYWxpemVkSTE4bkJsb2NrLmNhc2VRdWV1ZS5sZW5ndGggPT09IDAgJiZcbiAgICBzZXJpYWxpemVkSTE4bkJsb2NrLmRpc2Nvbm5lY3RlZE5vZGVzLnNpemUgPT09IDAgJiZcbiAgICBzZXJpYWxpemVkSTE4bkJsb2NrLmRpc2pvaW50Tm9kZXMuc2l6ZSA9PT0gMFxuICAgID8gbnVsbFxuICAgIDogc2VyaWFsaXplZEkxOG5CbG9jaztcbn1cblxuZnVuY3Rpb24gc2VyaWFsaXplSTE4bkJsb2NrKFxuICBsVmlldzogTFZpZXcsXG4gIHNlcmlhbGl6ZWRJMThuQmxvY2s6IFNlcmlhbGl6ZWRJMThuQmxvY2ssXG4gIGNvbnRleHQ6IEh5ZHJhdGlvbkNvbnRleHQsXG4gIG5vZGVzOiBJMThuTm9kZVtdLFxuKTogTm9kZSB8IG51bGwge1xuICBsZXQgcHJldlJOb2RlID0gbnVsbDtcbiAgZm9yIChjb25zdCBub2RlIG9mIG5vZGVzKSB7XG4gICAgY29uc3QgbmV4dFJOb2RlID0gc2VyaWFsaXplSTE4bk5vZGUobFZpZXcsIHNlcmlhbGl6ZWRJMThuQmxvY2ssIGNvbnRleHQsIG5vZGUpO1xuICAgIGlmIChuZXh0Uk5vZGUpIHtcbiAgICAgIGlmIChpc0Rpc2pvaW50Tm9kZShwcmV2Uk5vZGUsIG5leHRSTm9kZSkpIHtcbiAgICAgICAgc2VyaWFsaXplZEkxOG5CbG9jay5kaXNqb2ludE5vZGVzLmFkZChub2RlLmluZGV4IC0gSEVBREVSX09GRlNFVCk7XG4gICAgICB9XG4gICAgICBwcmV2Uk5vZGUgPSBuZXh0Uk5vZGU7XG4gICAgfVxuICB9XG4gIHJldHVybiBwcmV2Uk5vZGU7XG59XG5cbi8qKlxuICogSGVscGVyIHRvIGRldGVybWluZSB3aGV0aGVyIHRoZSBnaXZlbiBub2RlcyBhcmUgXCJkaXNqb2ludFwiLlxuICpcbiAqIFRoZSBpMThuIGh5ZHJhdGlvbiBwcm9jZXNzIHdhbGtzIHRocm91Z2ggdGhlIERPTSBhbmQgaTE4biBub2Rlc1xuICogYXQgdGhlIHNhbWUgdGltZS4gSXQgZXhwZWN0cyB0aGUgc2libGluZyBET00gbm9kZSBvZiB0aGUgcHJldmlvdXNcbiAqIGkxOG4gbm9kZSB0byBiZSB0aGUgZmlyc3Qgbm9kZSBvZiB0aGUgbmV4dCBpMThuIG5vZGUuXG4gKlxuICogSW4gY2FzZXMgb2YgY29udGVudCBwcm9qZWN0aW9uLCB0aGlzIHdvbid0IGFsd2F5cyBiZSB0aGUgY2FzZS4gU29cbiAqIHdoZW4gd2UgZGV0ZWN0IHRoYXQsIHdlIG1hcmsgdGhlIG5vZGUgYXMgXCJkaXNqb2ludFwiLCBlbnN1cmluZyB0aGF0XG4gKiB3ZSB3aWxsIHNlcmlhbGl6ZSB0aGUgcGF0aCB0byB0aGUgbm9kZS4gVGhpcyB3YXksIHdoZW4gd2UgaHlkcmF0ZSB0aGVcbiAqIGkxOG4gbm9kZSwgd2Ugd2lsbCBiZSBhYmxlIHRvIGZpbmQgdGhlIGNvcnJlY3QgcGxhY2UgdG8gc3RhcnQuXG4gKi9cbmZ1bmN0aW9uIGlzRGlzam9pbnROb2RlKHByZXZOb2RlOiBOb2RlIHwgbnVsbCwgbmV4dE5vZGU6IE5vZGUpIHtcbiAgcmV0dXJuIHByZXZOb2RlICYmIHByZXZOb2RlLm5leHRTaWJsaW5nICE9PSBuZXh0Tm9kZTtcbn1cblxuLyoqXG4gKiBQcm9jZXNzIHRoZSBnaXZlbiBpMThuIG5vZGUgZm9yIHNlcmlhbGl6YXRpb24uXG4gKiBSZXR1cm5zIHRoZSBmaXJzdCBSTm9kZSBmb3IgdGhlIGkxOG4gbm9kZSB0byBiZWdpbiBoeWRyYXRpb24uXG4gKi9cbmZ1bmN0aW9uIHNlcmlhbGl6ZUkxOG5Ob2RlKFxuICBsVmlldzogTFZpZXcsXG4gIHNlcmlhbGl6ZWRJMThuQmxvY2s6IFNlcmlhbGl6ZWRJMThuQmxvY2ssXG4gIGNvbnRleHQ6IEh5ZHJhdGlvbkNvbnRleHQsXG4gIG5vZGU6IEkxOG5Ob2RlLFxuKTogTm9kZSB8IG51bGwge1xuICBjb25zdCBtYXliZVJOb2RlID0gdW53cmFwUk5vZGUobFZpZXdbbm9kZS5pbmRleF0hKTtcbiAgaWYgKCFtYXliZVJOb2RlIHx8IGlzRGlzY29ubmVjdGVkUk5vZGUobWF5YmVSTm9kZSkpIHtcbiAgICBzZXJpYWxpemVkSTE4bkJsb2NrLmRpc2Nvbm5lY3RlZE5vZGVzLmFkZChub2RlLmluZGV4IC0gSEVBREVSX09GRlNFVCk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBjb25zdCByTm9kZSA9IG1heWJlUk5vZGUgYXMgTm9kZTtcbiAgc3dpdGNoIChub2RlLmtpbmQpIHtcbiAgICBjYXNlIEkxOG5Ob2RlS2luZC5URVhUOiB7XG4gICAgICBwcm9jZXNzVGV4dE5vZGVCZWZvcmVTZXJpYWxpemF0aW9uKGNvbnRleHQsIHJOb2RlKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGNhc2UgSTE4bk5vZGVLaW5kLkVMRU1FTlQ6XG4gICAgY2FzZSBJMThuTm9kZUtpbmQuUExBQ0VIT0xERVI6IHtcbiAgICAgIHNlcmlhbGl6ZUkxOG5CbG9jayhsVmlldywgc2VyaWFsaXplZEkxOG5CbG9jaywgY29udGV4dCwgbm9kZS5jaGlsZHJlbik7XG4gICAgICBicmVhaztcbiAgICB9XG5cbiAgICBjYXNlIEkxOG5Ob2RlS2luZC5JQ1U6IHtcbiAgICAgIGNvbnN0IGN1cnJlbnRDYXNlID0gbFZpZXdbbm9kZS5jdXJyZW50Q2FzZUxWaWV3SW5kZXhdIGFzIG51bWJlciB8IG51bGw7XG4gICAgICBpZiAoY3VycmVudENhc2UgIT0gbnVsbCkge1xuICAgICAgICAvLyBpMThuIHVzZXMgYSBuZWdhdGl2ZSB2YWx1ZSB0byBzaWduYWwgYSBjaGFuZ2UgdG8gYSBuZXcgY2FzZSwgc28gd2VcbiAgICAgICAgLy8gbmVlZCB0byBpbnZlcnQgaXQgdG8gZ2V0IHRoZSBwcm9wZXIgdmFsdWUuXG4gICAgICAgIGNvbnN0IGNhc2VJZHggPSBjdXJyZW50Q2FzZSA8IDAgPyB+Y3VycmVudENhc2UgOiBjdXJyZW50Q2FzZTtcbiAgICAgICAgc2VyaWFsaXplZEkxOG5CbG9jay5jYXNlUXVldWUucHVzaChjYXNlSWR4KTtcbiAgICAgICAgc2VyaWFsaXplSTE4bkJsb2NrKGxWaWV3LCBzZXJpYWxpemVkSTE4bkJsb2NrLCBjb250ZXh0LCBub2RlLmNhc2VzW2Nhc2VJZHhdKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBnZXRGaXJzdE5hdGl2ZU5vZGVGb3JJMThuTm9kZShsVmlldywgbm9kZSkgYXMgTm9kZSB8IG51bGw7XG59XG5cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9uIHRvIGdldCB0aGUgZmlyc3QgbmF0aXZlIG5vZGUgdG8gYmVnaW4gaHlkcmF0aW5nXG4gKiB0aGUgZ2l2ZW4gaTE4biBub2RlLlxuICovXG5mdW5jdGlvbiBnZXRGaXJzdE5hdGl2ZU5vZGVGb3JJMThuTm9kZShsVmlldzogTFZpZXcsIG5vZGU6IEkxOG5Ob2RlKSB7XG4gIGNvbnN0IHRWaWV3ID0gbFZpZXdbVFZJRVddO1xuICBjb25zdCBtYXliZVROb2RlID0gdFZpZXcuZGF0YVtub2RlLmluZGV4XTtcblxuICBpZiAoaXNUTm9kZVNoYXBlKG1heWJlVE5vZGUpKSB7XG4gICAgLy8gSWYgdGhlIG5vZGUgaXMgYmFja2VkIGJ5IGFuIGFjdHVhbCBUTm9kZSwgd2UgY2FuIHNpbXBseSBkZWxlZ2F0ZS5cbiAgICByZXR1cm4gZ2V0Rmlyc3ROYXRpdmVOb2RlKGxWaWV3LCBtYXliZVROb2RlKTtcbiAgfSBlbHNlIGlmIChub2RlLmtpbmQgPT09IEkxOG5Ob2RlS2luZC5JQ1UpIHtcbiAgICAvLyBBIG5lc3RlZCBJQ1UgY29udGFpbmVyIHdvbid0IGhhdmUgYW4gYWN0dWFsIFROb2RlLiBJbiB0aGF0IGNhc2UsIHdlIGNhbiB1c2VcbiAgICAvLyBhbiBpdGVyYXRvciB0byBmaW5kIHRoZSBmaXJzdCBjaGlsZC5cbiAgICBjb25zdCBpY3VJdGVyYXRvciA9IGNyZWF0ZUljdUl0ZXJhdG9yKG1heWJlVE5vZGUgYXMgVEljdSwgbFZpZXcpO1xuICAgIGxldCByTm9kZTogUk5vZGUgfCBudWxsID0gaWN1SXRlcmF0b3IoKTtcblxuICAgIC8vIElmIHRoZSBJQ1UgY29udGFpbmVyIGhhcyBubyBub2RlcywgdGhlbiB3ZSB1c2UgdGhlIElDVSBhbmNob3IgYXMgdGhlIG5vZGUuXG4gICAgcmV0dXJuIHJOb2RlID8/IHVud3JhcFJOb2RlKGxWaWV3W25vZGUuaW5kZXhdKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBPdGhlcndpc2UsIHRoZSBub2RlIGlzIGEgdGV4dCBvciB0cml2aWFsIGVsZW1lbnQgaW4gYW4gSUNVIGNvbnRhaW5lcixcbiAgICAvLyBhbmQgd2UgY2FuIGp1c3QgdXNlIHRoZSBSTm9kZSBkaXJlY3RseS5cbiAgICByZXR1cm4gdW53cmFwUk5vZGUobFZpZXdbbm9kZS5pbmRleF0pID8/IG51bGw7XG4gIH1cbn1cblxuLyoqXG4gKiBEZXNjcmliZXMgc2hhcmVkIGRhdGEgYXZhaWxhYmxlIGR1cmluZyB0aGUgaHlkcmF0aW9uIHByb2Nlc3MuXG4gKi9cbmludGVyZmFjZSBJMThuSHlkcmF0aW9uQ29udGV4dCB7XG4gIGh5ZHJhdGlvbkluZm86IERlaHlkcmF0ZWRWaWV3O1xuICBsVmlldzogTFZpZXc7XG4gIGkxOG5Ob2RlczogTWFwPG51bWJlciwgUk5vZGUgfCBudWxsPjtcbiAgZGlzY29ubmVjdGVkTm9kZXM6IFNldDxudW1iZXI+O1xuICBjYXNlUXVldWU6IG51bWJlcltdO1xuICBkZWh5ZHJhdGVkSWN1RGF0YTogTWFwPG51bWJlciwgRGVoeWRyYXRlZEljdURhdGE+O1xufVxuXG4vKipcbiAqIERlc2NyaWJlcyBjdXJyZW50IGh5ZHJhdGlvbiBzdGF0ZS5cbiAqL1xuaW50ZXJmYWNlIEkxOG5IeWRyYXRpb25TdGF0ZSB7XG4gIC8vIFRoZSBjdXJyZW50IG5vZGVcbiAgY3VycmVudE5vZGU6IE5vZGUgfCBudWxsO1xuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSB0cmVlIHNob3VsZCBiZSBjb25uZWN0ZWQuXG4gICAqXG4gICAqIER1cmluZyBoeWRyYXRpb24sIGl0IGNhbiBoYXBwZW4gdGhhdCB3ZSBleHBlY3QgdG8gaGF2ZSBhXG4gICAqIGN1cnJlbnQgUk5vZGUsIGJ1dCB3ZSBkb24ndC4gSW4gc3VjaCBjYXNlcywgd2Ugc3RpbGwgbmVlZFxuICAgKiB0byBwcm9wYWdhdGUgdGhlIGV4cGVjdGF0aW9uIHRvIHRoZSBjb3JyZXNwb25kaW5nIExWaWV3cyxcbiAgICogc28gdGhhdCB0aGUgcHJvcGVyIGRvd25zdHJlYW0gZXJyb3IgaGFuZGxpbmcgY2FuIHByb3ZpZGVcbiAgICogdGhlIGNvcnJlY3QgY29udGV4dCBmb3IgdGhlIGVycm9yLlxuICAgKi9cbiAgaXNDb25uZWN0ZWQ6IGJvb2xlYW47XG59XG5cbmZ1bmN0aW9uIHNldEN1cnJlbnROb2RlKHN0YXRlOiBJMThuSHlkcmF0aW9uU3RhdGUsIG5vZGU6IE5vZGUgfCBudWxsKSB7XG4gIHN0YXRlLmN1cnJlbnROb2RlID0gbm9kZTtcbn1cblxuLyoqXG4gKiBNYXJrcyB0aGUgY3VycmVudCBSTm9kZSBhcyB0aGUgaHlkcmF0aW9uIHJvb3QgZm9yIHRoZSBnaXZlblxuICogQVNUIG5vZGUuXG4gKi9cbmZ1bmN0aW9uIGFwcGVuZEkxOG5Ob2RlVG9Db2xsZWN0aW9uKFxuICBjb250ZXh0OiBJMThuSHlkcmF0aW9uQ29udGV4dCxcbiAgc3RhdGU6IEkxOG5IeWRyYXRpb25TdGF0ZSxcbiAgYXN0Tm9kZTogSTE4bk5vZGUsXG4pIHtcbiAgY29uc3Qgbm9PZmZzZXRJbmRleCA9IGFzdE5vZGUuaW5kZXggLSBIRUFERVJfT0ZGU0VUO1xuICBjb25zdCB7ZGlzY29ubmVjdGVkTm9kZXN9ID0gY29udGV4dDtcbiAgY29uc3QgY3VycmVudE5vZGUgPSBzdGF0ZS5jdXJyZW50Tm9kZTtcblxuICBpZiAoc3RhdGUuaXNDb25uZWN0ZWQpIHtcbiAgICBjb250ZXh0LmkxOG5Ob2Rlcy5zZXQobm9PZmZzZXRJbmRleCwgY3VycmVudE5vZGUpO1xuXG4gICAgLy8gV2UgZXhwZWN0IHRoZSBub2RlIHRvIGJlIGNvbm5lY3RlZCwgc28gZW5zdXJlIHRoYXQgaXRcbiAgICAvLyBpcyBub3QgaW4gdGhlIHNldCwgcmVnYXJkbGVzcyBvZiB3aGV0aGVyIHdlIGZvdW5kIGl0LFxuICAgIC8vIHNvIHRoYXQgdGhlIGRvd25zdHJlYW0gZXJyb3IgaGFuZGxpbmcgY2FuIHByb3ZpZGUgdGhlXG4gICAgLy8gcHJvcGVyIGNvbnRleHQuXG4gICAgZGlzY29ubmVjdGVkTm9kZXMuZGVsZXRlKG5vT2Zmc2V0SW5kZXgpO1xuICB9IGVsc2Uge1xuICAgIGRpc2Nvbm5lY3RlZE5vZGVzLmFkZChub09mZnNldEluZGV4KTtcbiAgfVxuXG4gIHJldHVybiBjdXJyZW50Tm9kZTtcbn1cblxuLyoqXG4gKiBTa2lwIG92ZXIgc29tZSBzaWJsaW5nIG5vZGVzIGR1cmluZyBoeWRyYXRpb24uXG4gKlxuICogTm90ZTogd2UgdXNlIHRoaXMgaW5zdGVhZCBvZiBgc2libGluZ0FmdGVyYCBhcyBpdCdzIGV4cGVjdGVkIHRoYXRcbiAqIHNvbWV0aW1lcyB3ZSBtaWdodCBlbmNvdW50ZXIgbnVsbCBub2Rlcy4gSW4gdGhvc2UgY2FzZXMsIHdlIHdhbnQgdG9cbiAqIGRlZmVyIHRvIGRvd25zdHJlYW0gZXJyb3IgaGFuZGxpbmcgdG8gcHJvdmlkZSBwcm9wZXIgY29udGV4dC5cbiAqL1xuZnVuY3Rpb24gc2tpcFNpYmxpbmdOb2RlcyhzdGF0ZTogSTE4bkh5ZHJhdGlvblN0YXRlLCBza2lwOiBudW1iZXIpIHtcbiAgbGV0IGN1cnJlbnROb2RlID0gc3RhdGUuY3VycmVudE5vZGU7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc2tpcDsgaSsrKSB7XG4gICAgaWYgKCFjdXJyZW50Tm9kZSkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGN1cnJlbnROb2RlID0gY3VycmVudE5vZGU/Lm5leHRTaWJsaW5nID8/IG51bGw7XG4gIH1cbiAgcmV0dXJuIGN1cnJlbnROb2RlO1xufVxuXG4vKipcbiAqIEZvcmsgdGhlIGdpdmVuIHN0YXRlIGludG8gYSBuZXcgc3RhdGUgZm9yIGh5ZHJhdGluZyBjaGlsZHJlbi5cbiAqL1xuZnVuY3Rpb24gZm9ya0h5ZHJhdGlvblN0YXRlKHN0YXRlOiBJMThuSHlkcmF0aW9uU3RhdGUsIG5leHROb2RlOiBOb2RlIHwgbnVsbCkge1xuICByZXR1cm4ge2N1cnJlbnROb2RlOiBuZXh0Tm9kZSwgaXNDb25uZWN0ZWQ6IHN0YXRlLmlzQ29ubmVjdGVkfTtcbn1cblxuZnVuY3Rpb24gcHJlcGFyZUkxOG5CbG9ja0Zvckh5ZHJhdGlvbkltcGwoXG4gIGxWaWV3OiBMVmlldyxcbiAgaW5kZXg6IG51bWJlcixcbiAgcGFyZW50VE5vZGU6IFROb2RlIHwgbnVsbCxcbiAgc3ViVGVtcGxhdGVJbmRleDogbnVtYmVyLFxuKSB7XG4gIGNvbnN0IGh5ZHJhdGlvbkluZm8gPSBsVmlld1tIWURSQVRJT05dO1xuICBpZiAoIWh5ZHJhdGlvbkluZm8pIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoXG4gICAgIWlzSTE4bkh5ZHJhdGlvblN1cHBvcnRFbmFibGVkKCkgfHxcbiAgICAocGFyZW50VE5vZGUgJiZcbiAgICAgIChpc0kxOG5JblNraXBIeWRyYXRpb25CbG9jayhwYXJlbnRUTm9kZSkgfHxcbiAgICAgICAgaXNEaXNjb25uZWN0ZWROb2RlKGh5ZHJhdGlvbkluZm8sIHBhcmVudFROb2RlLmluZGV4IC0gSEVBREVSX09GRlNFVCkpKVxuICApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCB0VmlldyA9IGxWaWV3W1RWSUVXXTtcbiAgY29uc3QgdEkxOG4gPSB0Vmlldy5kYXRhW2luZGV4XSBhcyBUSTE4bjtcbiAgbmdEZXZNb2RlICYmXG4gICAgYXNzZXJ0RGVmaW5lZCh0STE4biwgJ0V4cGVjdGVkIGkxOG4gZGF0YSB0byBiZSBwcmVzZW50IGluIGEgZ2l2ZW4gVFZpZXcgc2xvdCBkdXJpbmcgaHlkcmF0aW9uJyk7XG5cbiAgZnVuY3Rpb24gZmluZEh5ZHJhdGlvblJvb3QoKSB7XG4gICAgaWYgKGlzUm9vdFRlbXBsYXRlTWVzc2FnZShzdWJUZW1wbGF0ZUluZGV4KSkge1xuICAgICAgLy8gVGhpcyBpcyB0aGUgcm9vdCBvZiBhbiBpMThuIGJsb2NrLiBJbiB0aGlzIGNhc2UsIG91ciBoeWRyYXRpb24gcm9vdCB3aWxsXG4gICAgICAvLyBkZXBlbmQgb24gd2hlcmUgb3VyIHBhcmVudCBUTm9kZSAoaS5lLiB0aGUgYmxvY2sgd2l0aCBpMThuIGFwcGxpZWQpIGlzXG4gICAgICAvLyBpbiB0aGUgRE9NLlxuICAgICAgbmdEZXZNb2RlICYmIGFzc2VydERlZmluZWQocGFyZW50VE5vZGUsICdFeHBlY3RlZCBwYXJlbnQgVE5vZGUgd2hpbGUgaHlkcmF0aW5nIGkxOG4gcm9vdCcpO1xuICAgICAgY29uc3Qgcm9vdE5vZGUgPSBsb2NhdGVOZXh0Uk5vZGUoaHlkcmF0aW9uSW5mbyEsIHRWaWV3LCBsVmlldywgcGFyZW50VE5vZGUhKSBhcyBOb2RlO1xuXG4gICAgICAvLyBJZiB0aGlzIGkxOG4gYmxvY2sgaXMgYXR0YWNoZWQgdG8gYW4gPG5nLWNvbnRhaW5lcj4sIHRoZW4gd2Ugd2FudCB0byBiZWdpblxuICAgICAgLy8gaHlkcmF0aW5nIGRpcmVjdGx5IHdpdGggdGhlIFJOb2RlLiBPdGhlcndpc2UsIGZvciBhIFROb2RlIHdpdGggYSBwaHlzaWNhbCBET01cbiAgICAgIC8vIGVsZW1lbnQsIHdlIHdhbnQgdG8gcmVjdXJzZSBpbnRvIHRoZSBmaXJzdCBjaGlsZCBhbmQgYmVnaW4gdGhlcmUuXG4gICAgICByZXR1cm4gcGFyZW50VE5vZGUhLnR5cGUgJiBUTm9kZVR5cGUuRWxlbWVudENvbnRhaW5lciA/IHJvb3ROb2RlIDogcm9vdE5vZGUuZmlyc3RDaGlsZDtcbiAgICB9XG5cbiAgICAvLyBUaGlzIGlzIGEgbmVzdGVkIHRlbXBsYXRlIGluIGFuIGkxOG4gYmxvY2suIEluIHRoaXMgY2FzZSwgdGhlIGVudGlyZSB2aWV3XG4gICAgLy8gaXMgdHJhbnNsYXRlZCwgYW5kIHBhcnQgb2YgYSBkZWh5ZHJhdGVkIHZpZXcgaW4gYSBjb250YWluZXIuIFRoaXMgbWVhbnMgdGhhdFxuICAgIC8vIHdlIGNhbiBzaW1wbHkgYmVnaW4gaHlkcmF0aW9uIHdpdGggdGhlIGZpcnN0IGRlaHlkcmF0ZWQgY2hpbGQuXG4gICAgcmV0dXJuIGh5ZHJhdGlvbkluZm8/LmZpcnN0Q2hpbGQgYXMgTm9kZTtcbiAgfVxuXG4gIGNvbnN0IGN1cnJlbnROb2RlID0gZmluZEh5ZHJhdGlvblJvb3QoKTtcbiAgbmdEZXZNb2RlICYmIGFzc2VydERlZmluZWQoY3VycmVudE5vZGUsICdFeHBlY3RlZCByb290IGkxOG4gbm9kZSBkdXJpbmcgaHlkcmF0aW9uJyk7XG5cbiAgY29uc3QgZGlzY29ubmVjdGVkTm9kZXMgPSBpbml0RGlzY29ubmVjdGVkTm9kZXMoaHlkcmF0aW9uSW5mbykgPz8gbmV3IFNldCgpO1xuICBjb25zdCBpMThuTm9kZXMgPSAoaHlkcmF0aW9uSW5mby5pMThuTm9kZXMgPz89IG5ldyBNYXA8bnVtYmVyLCBSTm9kZSB8IG51bGw+KCkpO1xuICBjb25zdCBjYXNlUXVldWUgPSBoeWRyYXRpb25JbmZvLmRhdGFbSTE4Tl9EQVRBXT8uW2luZGV4IC0gSEVBREVSX09GRlNFVF0gPz8gW107XG4gIGNvbnN0IGRlaHlkcmF0ZWRJY3VEYXRhID0gKGh5ZHJhdGlvbkluZm8uZGVoeWRyYXRlZEljdURhdGEgPz89IG5ldyBNYXA8XG4gICAgbnVtYmVyLFxuICAgIERlaHlkcmF0ZWRJY3VEYXRhXG4gID4oKSk7XG5cbiAgY29sbGVjdEkxOG5Ob2Rlc0Zyb21Eb20oXG4gICAge2h5ZHJhdGlvbkluZm8sIGxWaWV3LCBpMThuTm9kZXMsIGRpc2Nvbm5lY3RlZE5vZGVzLCBjYXNlUXVldWUsIGRlaHlkcmF0ZWRJY3VEYXRhfSxcbiAgICB7Y3VycmVudE5vZGUsIGlzQ29ubmVjdGVkOiB0cnVlfSxcbiAgICB0STE4bi5hc3QsXG4gICk7XG5cbiAgLy8gTm9kZXMgZnJvbSBpbmFjdGl2ZSBJQ1UgY2FzZXMgc2hvdWxkIGJlIGNvbnNpZGVyZWQgZGlzY29ubmVjdGVkLiBXZSB0cmFjayB0aGVtIGFib3ZlXG4gIC8vIGJlY2F1c2UgdGhleSBhcmVuJ3QgKGFuZCBzaG91bGRuJ3QgYmUpIHNlcmlhbGl6ZWQuIFNpbmNlIHdlIG1heSBtdXRhdGUgb3IgY3JlYXRlIGFcbiAgLy8gbmV3IHNldCwgd2UgbmVlZCB0byBiZSBzdXJlIHRvIHdyaXRlIHRoZSBleHBlY3RlZCB2YWx1ZSBiYWNrIHRvIHRoZSBEZWh5ZHJhdGVkVmlldy5cbiAgaHlkcmF0aW9uSW5mby5kaXNjb25uZWN0ZWROb2RlcyA9IGRpc2Nvbm5lY3RlZE5vZGVzLnNpemUgPT09IDAgPyBudWxsIDogZGlzY29ubmVjdGVkTm9kZXM7XG59XG5cbmZ1bmN0aW9uIGNvbGxlY3RJMThuTm9kZXNGcm9tRG9tKFxuICBjb250ZXh0OiBJMThuSHlkcmF0aW9uQ29udGV4dCxcbiAgc3RhdGU6IEkxOG5IeWRyYXRpb25TdGF0ZSxcbiAgbm9kZU9yTm9kZXM6IEkxOG5Ob2RlIHwgSTE4bk5vZGVbXSxcbikge1xuICBpZiAoQXJyYXkuaXNBcnJheShub2RlT3JOb2RlcykpIHtcbiAgICBsZXQgbmV4dFN0YXRlID0gc3RhdGU7XG4gICAgZm9yIChjb25zdCBub2RlIG9mIG5vZGVPck5vZGVzKSB7XG4gICAgICAvLyBXaGVuZXZlciBhIG5vZGUgZG9lc24ndCBkaXJlY3RseSBmb2xsb3cgdGhlIHByZXZpb3VzIFJOb2RlLCBpdFxuICAgICAgLy8gaXMgZ2l2ZW4gYSBwYXRoLiBXZSBuZWVkIHRvIHJlc3VtZSBjb2xsZWN0aW5nIG5vZGVzIGZyb20gdGhhdCBsb2NhdGlvblxuICAgICAgLy8gdW50aWwgYW5kIHVubGVzcyB3ZSBmaW5kIGFub3RoZXIgZGlzam9pbnQgbm9kZS5cbiAgICAgIGNvbnN0IHRhcmdldE5vZGUgPSB0cnlMb2NhdGVSTm9kZUJ5UGF0aChcbiAgICAgICAgY29udGV4dC5oeWRyYXRpb25JbmZvLFxuICAgICAgICBjb250ZXh0LmxWaWV3LFxuICAgICAgICBub2RlLmluZGV4IC0gSEVBREVSX09GRlNFVCxcbiAgICAgICk7XG4gICAgICBpZiAodGFyZ2V0Tm9kZSkge1xuICAgICAgICBuZXh0U3RhdGUgPSBmb3JrSHlkcmF0aW9uU3RhdGUoc3RhdGUsIHRhcmdldE5vZGUgYXMgTm9kZSk7XG4gICAgICB9XG4gICAgICBjb2xsZWN0STE4bk5vZGVzRnJvbURvbShjb250ZXh0LCBuZXh0U3RhdGUsIG5vZGUpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAoY29udGV4dC5kaXNjb25uZWN0ZWROb2Rlcy5oYXMobm9kZU9yTm9kZXMuaW5kZXggLSBIRUFERVJfT0ZGU0VUKSkge1xuICAgICAgLy8gaTE4biBub2RlcyBjYW4gYmUgY29uc2lkZXJlZCBkaXNjb25uZWN0ZWQgaWYgZS5nLiB0aGV5IHdlcmUgcHJvamVjdGVkLlxuICAgICAgLy8gSW4gdGhhdCBjYXNlLCB3ZSBoYXZlIHRvIG1ha2Ugc3VyZSB0byBza2lwIG92ZXIgdGhlbS5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzd2l0Y2ggKG5vZGVPck5vZGVzLmtpbmQpIHtcbiAgICAgIGNhc2UgSTE4bk5vZGVLaW5kLlRFWFQ6IHtcbiAgICAgICAgLy8gQ2xhaW0gYSB0ZXh0IG5vZGUgZm9yIGh5ZHJhdGlvblxuICAgICAgICBjb25zdCBjdXJyZW50Tm9kZSA9IGFwcGVuZEkxOG5Ob2RlVG9Db2xsZWN0aW9uKGNvbnRleHQsIHN0YXRlLCBub2RlT3JOb2Rlcyk7XG4gICAgICAgIHNldEN1cnJlbnROb2RlKHN0YXRlLCBjdXJyZW50Tm9kZT8ubmV4dFNpYmxpbmcgPz8gbnVsbCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICBjYXNlIEkxOG5Ob2RlS2luZC5FTEVNRU5UOiB7XG4gICAgICAgIC8vIFJlY3Vyc2UgaW50byB0aGUgY3VycmVudCBlbGVtZW50J3MgY2hpbGRyZW4uLi5cbiAgICAgICAgY29sbGVjdEkxOG5Ob2Rlc0Zyb21Eb20oXG4gICAgICAgICAgY29udGV4dCxcbiAgICAgICAgICBmb3JrSHlkcmF0aW9uU3RhdGUoc3RhdGUsIHN0YXRlLmN1cnJlbnROb2RlPy5maXJzdENoaWxkID8/IG51bGwpLFxuICAgICAgICAgIG5vZGVPck5vZGVzLmNoaWxkcmVuLFxuICAgICAgICApO1xuXG4gICAgICAgIC8vIEFuZCBjbGFpbSB0aGUgcGFyZW50IGVsZW1lbnQgaXRzZWxmLlxuICAgICAgICBjb25zdCBjdXJyZW50Tm9kZSA9IGFwcGVuZEkxOG5Ob2RlVG9Db2xsZWN0aW9uKGNvbnRleHQsIHN0YXRlLCBub2RlT3JOb2Rlcyk7XG4gICAgICAgIHNldEN1cnJlbnROb2RlKHN0YXRlLCBjdXJyZW50Tm9kZT8ubmV4dFNpYmxpbmcgPz8gbnVsbCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICBjYXNlIEkxOG5Ob2RlS2luZC5QTEFDRUhPTERFUjoge1xuICAgICAgICBjb25zdCBub09mZnNldEluZGV4ID0gbm9kZU9yTm9kZXMuaW5kZXggLSBIRUFERVJfT0ZGU0VUO1xuICAgICAgICBjb25zdCB7aHlkcmF0aW9uSW5mb30gPSBjb250ZXh0O1xuICAgICAgICBjb25zdCBjb250YWluZXJTaXplID0gZ2V0TmdDb250YWluZXJTaXplKGh5ZHJhdGlvbkluZm8sIG5vT2Zmc2V0SW5kZXgpO1xuXG4gICAgICAgIHN3aXRjaCAobm9kZU9yTm9kZXMudHlwZSkge1xuICAgICAgICAgIGNhc2UgSTE4blBsYWNlaG9sZGVyVHlwZS5FTEVNRU5UOiB7XG4gICAgICAgICAgICAvLyBIeWRyYXRpb24gZXhwZWN0cyB0byBmaW5kIHRoZSBoZWFkIG9mIHRoZSBlbGVtZW50LlxuICAgICAgICAgICAgY29uc3QgY3VycmVudE5vZGUgPSBhcHBlbmRJMThuTm9kZVRvQ29sbGVjdGlvbihjb250ZXh0LCBzdGF0ZSwgbm9kZU9yTm9kZXMpO1xuXG4gICAgICAgICAgICAvLyBBIFROb2RlIGZvciB0aGUgbm9kZSBtYXkgbm90IHlldCBpZiB3ZSdyZSBoeWRyYXRpbmcgZHVyaW5nIHRoZSBmaXJzdCBwYXNzLFxuICAgICAgICAgICAgLy8gc28gdXNlIHRoZSBzZXJpYWxpemVkIGRhdGEgdG8gZGV0ZXJtaW5lIGlmIHRoaXMgaXMgYW4gPG5nLWNvbnRhaW5lcj4uXG4gICAgICAgICAgICBpZiAoaXNTZXJpYWxpemVkRWxlbWVudENvbnRhaW5lcihoeWRyYXRpb25JbmZvLCBub09mZnNldEluZGV4KSkge1xuICAgICAgICAgICAgICAvLyBBbiA8bmctY29udGFpbmVyPiBkb2Vzbid0IGhhdmUgYSBwaHlzaWNhbCBET00gbm9kZSwgc28gd2UgbmVlZCB0b1xuICAgICAgICAgICAgICAvLyBjb250aW51ZSBoeWRyYXRpbmcgZnJvbSBzaWJsaW5ncy5cbiAgICAgICAgICAgICAgY29sbGVjdEkxOG5Ob2Rlc0Zyb21Eb20oY29udGV4dCwgc3RhdGUsIG5vZGVPck5vZGVzLmNoaWxkcmVuKTtcblxuICAgICAgICAgICAgICAvLyBTa2lwIG92ZXIgdGhlIGFuY2hvciBlbGVtZW50LiBJdCB3aWxsIGJlIGNsYWltZWQgYnkgdGhlXG4gICAgICAgICAgICAgIC8vIGRvd25zdHJlYW0gY29udGFpbmVyIGh5ZHJhdGlvbi5cbiAgICAgICAgICAgICAgY29uc3QgbmV4dE5vZGUgPSBza2lwU2libGluZ05vZGVzKHN0YXRlLCAxKTtcbiAgICAgICAgICAgICAgc2V0Q3VycmVudE5vZGUoc3RhdGUsIG5leHROb2RlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIE5vbi1jb250YWluZXIgZWxlbWVudHMgcmVwcmVzZW50IGFuIGFjdHVhbCBub2RlIGluIHRoZSBET00sIHNvIHdlXG4gICAgICAgICAgICAgIC8vIG5lZWQgdG8gY29udGludWUgaHlkcmF0aW9uIHdpdGggdGhlIGNoaWxkcmVuLCBhbmQgY2xhaW0gdGhlIG5vZGUuXG4gICAgICAgICAgICAgIGNvbGxlY3RJMThuTm9kZXNGcm9tRG9tKFxuICAgICAgICAgICAgICAgIGNvbnRleHQsXG4gICAgICAgICAgICAgICAgZm9ya0h5ZHJhdGlvblN0YXRlKHN0YXRlLCBzdGF0ZS5jdXJyZW50Tm9kZT8uZmlyc3RDaGlsZCA/PyBudWxsKSxcbiAgICAgICAgICAgICAgICBub2RlT3JOb2Rlcy5jaGlsZHJlbixcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgc2V0Q3VycmVudE5vZGUoc3RhdGUsIGN1cnJlbnROb2RlPy5uZXh0U2libGluZyA/PyBudWxsKTtcblxuICAgICAgICAgICAgICAvLyBFbGVtZW50cyBjYW4gYWxzbyBiZSB0aGUgYW5jaG9yIG9mIGEgdmlldyBjb250YWluZXIsIHNvIHRoZXJlIG1heVxuICAgICAgICAgICAgICAvLyBiZSBlbGVtZW50cyBhZnRlciB0aGlzIG5vZGUgdGhhdCB3ZSBuZWVkIHRvIHNraXAuXG4gICAgICAgICAgICAgIGlmIChjb250YWluZXJTaXplICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgLy8gYCsxYCBzdGFuZHMgZm9yIGFuIGFuY2hvciBub2RlIGFmdGVyIGFsbCBvZiB0aGUgdmlld3MgaW4gdGhlIGNvbnRhaW5lci5cbiAgICAgICAgICAgICAgICBjb25zdCBuZXh0Tm9kZSA9IHNraXBTaWJsaW5nTm9kZXMoc3RhdGUsIGNvbnRhaW5lclNpemUgKyAxKTtcbiAgICAgICAgICAgICAgICBzZXRDdXJyZW50Tm9kZShzdGF0ZSwgbmV4dE5vZGUpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjYXNlIEkxOG5QbGFjZWhvbGRlclR5cGUuU1VCVEVNUExBVEU6IHtcbiAgICAgICAgICAgIG5nRGV2TW9kZSAmJlxuICAgICAgICAgICAgICBhc3NlcnROb3RFcXVhbChcbiAgICAgICAgICAgICAgICBjb250YWluZXJTaXplLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgJ0V4cGVjdGVkIGEgY29udGFpbmVyIHNpemUgd2hpbGUgaHlkcmF0aW5nIGkxOG4gc3VidGVtcGxhdGUnLFxuICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAvLyBIeWRyYXRpb24gZXhwZWN0cyB0byBmaW5kIHRoZSBoZWFkIG9mIHRoZSB0ZW1wbGF0ZS5cbiAgICAgICAgICAgIGFwcGVuZEkxOG5Ob2RlVG9Db2xsZWN0aW9uKGNvbnRleHQsIHN0YXRlLCBub2RlT3JOb2Rlcyk7XG5cbiAgICAgICAgICAgIC8vIFNraXAgb3ZlciBhbGwgb2YgdGhlIHRlbXBsYXRlIGNoaWxkcmVuLCBhcyB3ZWxsIGFzIHRoZSBhbmNob3JcbiAgICAgICAgICAgIC8vIG5vZGUsIHNpbmNlIHRoZSB0ZW1wbGF0ZSBpdHNlbGYgd2lsbCBoYW5kbGUgdGhlbSBpbnN0ZWFkLlxuICAgICAgICAgICAgY29uc3QgbmV4dE5vZGUgPSBza2lwU2libGluZ05vZGVzKHN0YXRlLCBjb250YWluZXJTaXplISArIDEpO1xuICAgICAgICAgICAgc2V0Q3VycmVudE5vZGUoc3RhdGUsIG5leHROb2RlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgY2FzZSBJMThuTm9kZUtpbmQuSUNVOiB7XG4gICAgICAgIC8vIElmIHRoZSBjdXJyZW50IG5vZGUgaXMgY29ubmVjdGVkLCB3ZSBuZWVkIHRvIHBvcCB0aGUgbmV4dCBjYXNlIGZyb20gdGhlXG4gICAgICAgIC8vIHF1ZXVlLCBzbyB0aGF0IHRoZSBhY3RpdmUgY2FzZSBpcyBhbHNvIGNvbnNpZGVyZWQgY29ubmVjdGVkLlxuICAgICAgICBjb25zdCBzZWxlY3RlZENhc2UgPSBzdGF0ZS5pc0Nvbm5lY3RlZCA/IGNvbnRleHQuY2FzZVF1ZXVlLnNoaWZ0KCkhIDogbnVsbDtcbiAgICAgICAgY29uc3QgY2hpbGRTdGF0ZSA9IHtjdXJyZW50Tm9kZTogbnVsbCwgaXNDb25uZWN0ZWQ6IGZhbHNlfTtcblxuICAgICAgICAvLyBXZSB0cmF2ZXJzZSB0aHJvdWdoIGVhY2ggY2FzZSwgZXZlbiBpZiBpdCdzIG5vdCBhY3RpdmUsXG4gICAgICAgIC8vIHNvIHRoYXQgd2UgY29ycmVjdGx5IHBvcHVsYXRlIGRpc2Nvbm5lY3RlZCBub2Rlcy5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBub2RlT3JOb2Rlcy5jYXNlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGNvbGxlY3RJMThuTm9kZXNGcm9tRG9tKFxuICAgICAgICAgICAgY29udGV4dCxcbiAgICAgICAgICAgIGkgPT09IHNlbGVjdGVkQ2FzZSA/IHN0YXRlIDogY2hpbGRTdGF0ZSxcbiAgICAgICAgICAgIG5vZGVPck5vZGVzLmNhc2VzW2ldLFxuICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2VsZWN0ZWRDYXNlICE9PSBudWxsKSB7XG4gICAgICAgICAgLy8gSUNVcyByZXByZXNlbnQgYSBicmFuY2hpbmcgc3RhdGUsIGFuZCB0aGUgc2VsZWN0ZWQgY2FzZSBjb3VsZCBiZSBkaWZmZXJlbnRcbiAgICAgICAgICAvLyB0aGFuIHdoYXQgaXQgd2FzIG9uIHRoZSBzZXJ2ZXIuIEluIHRoYXQgY2FzZSwgd2UgbmVlZCB0byBiZSBhYmxlIHRvIGNsZWFuXG4gICAgICAgICAgLy8gdXAgdGhlIG5vZGVzIGZyb20gdGhlIG9yaWdpbmFsIGNhc2UuIFRvIGRvIHRoYXQsIHdlIHN0b3JlIHRoZSBzZWxlY3RlZCBjYXNlLlxuICAgICAgICAgIGNvbnRleHQuZGVoeWRyYXRlZEljdURhdGEuc2V0KG5vZGVPck5vZGVzLmluZGV4LCB7Y2FzZTogc2VsZWN0ZWRDYXNlLCBub2RlOiBub2RlT3JOb2Rlc30pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSHlkcmF0aW9uIGV4cGVjdHMgdG8gZmluZCB0aGUgSUNVIGFuY2hvciBlbGVtZW50LlxuICAgICAgICBjb25zdCBjdXJyZW50Tm9kZSA9IGFwcGVuZEkxOG5Ob2RlVG9Db2xsZWN0aW9uKGNvbnRleHQsIHN0YXRlLCBub2RlT3JOb2Rlcyk7XG4gICAgICAgIHNldEN1cnJlbnROb2RlKHN0YXRlLCBjdXJyZW50Tm9kZT8ubmV4dFNpYmxpbmcgPz8gbnVsbCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5sZXQgX2NsYWltRGVoeWRyYXRlZEljdUNhc2VJbXBsOiB0eXBlb2YgY2xhaW1EZWh5ZHJhdGVkSWN1Q2FzZUltcGwgPSAoKSA9PiB7XG4gIC8vIG5vb3AgdW5sZXNzIGBlbmFibGVDbGFpbURlaHlkcmF0ZWRJY3VDYXNlSW1wbGAgaXMgaW52b2tlZFxufTtcblxuLyoqXG4gKiBNYXJrIHRoZSBjYXNlIGZvciB0aGUgSUNVIG5vZGUgYXQgdGhlIGdpdmVuIGluZGV4IGluIHRoZSB2aWV3IGFzIGNsYWltZWQsXG4gKiBhbGxvd2luZyBpdHMgbm9kZXMgdG8gYmUgaHlkcmF0ZWQgYW5kIG5vdCBjbGVhbmVkIHVwLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY2xhaW1EZWh5ZHJhdGVkSWN1Q2FzZShsVmlldzogTFZpZXcsIGljdUluZGV4OiBudW1iZXIsIGNhc2VJbmRleDogbnVtYmVyKSB7XG4gIF9jbGFpbURlaHlkcmF0ZWRJY3VDYXNlSW1wbChsVmlldywgaWN1SW5kZXgsIGNhc2VJbmRleCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlbmFibGVDbGFpbURlaHlkcmF0ZWRJY3VDYXNlSW1wbCgpIHtcbiAgX2NsYWltRGVoeWRyYXRlZEljdUNhc2VJbXBsID0gY2xhaW1EZWh5ZHJhdGVkSWN1Q2FzZUltcGw7XG59XG5cbmZ1bmN0aW9uIGNsYWltRGVoeWRyYXRlZEljdUNhc2VJbXBsKGxWaWV3OiBMVmlldywgaWN1SW5kZXg6IG51bWJlciwgY2FzZUluZGV4OiBudW1iZXIpIHtcbiAgY29uc3QgZGVoeWRyYXRlZEljdURhdGFNYXAgPSBsVmlld1tIWURSQVRJT05dPy5kZWh5ZHJhdGVkSWN1RGF0YTtcbiAgaWYgKGRlaHlkcmF0ZWRJY3VEYXRhTWFwKSB7XG4gICAgY29uc3QgZGVoeWRyYXRlZEljdURhdGEgPSBkZWh5ZHJhdGVkSWN1RGF0YU1hcC5nZXQoaWN1SW5kZXgpO1xuICAgIGlmIChkZWh5ZHJhdGVkSWN1RGF0YT8uY2FzZSA9PT0gY2FzZUluZGV4KSB7XG4gICAgICAvLyBJZiB0aGUgY2FzZSB3ZSdyZSBhdHRlbXB0aW5nIHRvIGNsYWltIG1hdGNoZXMgdGhlIGRlaHlkcmF0ZWQgb25lLFxuICAgICAgLy8gd2UgcmVtb3ZlIGl0IGZyb20gdGhlIG1hcCB0byBtYXJrIGl0IGFzIFwiY2xhaW1lZC5cIlxuICAgICAgZGVoeWRyYXRlZEljdURhdGFNYXAuZGVsZXRlKGljdUluZGV4KTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBDbGVhbiB1cCBhbGwgaTE4biBoeWRyYXRpb24gZGF0YSBhc3NvY2lhdGVkIHdpdGggdGhlIGdpdmVuIHZpZXcuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbGVhbnVwSTE4bkh5ZHJhdGlvbkRhdGEobFZpZXc6IExWaWV3KSB7XG4gIGNvbnN0IGh5ZHJhdGlvbkluZm8gPSBsVmlld1tIWURSQVRJT05dO1xuICBpZiAoaHlkcmF0aW9uSW5mbykge1xuICAgIGNvbnN0IHtpMThuTm9kZXMsIGRlaHlkcmF0ZWRJY3VEYXRhOiBkZWh5ZHJhdGVkSWN1RGF0YU1hcH0gPSBoeWRyYXRpb25JbmZvO1xuICAgIGlmIChpMThuTm9kZXMgJiYgZGVoeWRyYXRlZEljdURhdGFNYXApIHtcbiAgICAgIGNvbnN0IHJlbmRlcmVyID0gbFZpZXdbUkVOREVSRVJdO1xuICAgICAgZm9yIChjb25zdCBkZWh5ZHJhdGVkSWN1RGF0YSBvZiBkZWh5ZHJhdGVkSWN1RGF0YU1hcC52YWx1ZXMoKSkge1xuICAgICAgICBjbGVhbnVwRGVoeWRyYXRlZEljdURhdGEocmVuZGVyZXIsIGkxOG5Ob2RlcywgZGVoeWRyYXRlZEljdURhdGEpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGh5ZHJhdGlvbkluZm8uaTE4bk5vZGVzID0gdW5kZWZpbmVkO1xuICAgIGh5ZHJhdGlvbkluZm8uZGVoeWRyYXRlZEljdURhdGEgPSB1bmRlZmluZWQ7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2xlYW51cERlaHlkcmF0ZWRJY3VEYXRhKFxuICByZW5kZXJlcjogUmVuZGVyZXIsXG4gIGkxOG5Ob2RlczogTWFwPG51bWJlciwgUk5vZGUgfCBudWxsPixcbiAgZGVoeWRyYXRlZEljdURhdGE6IERlaHlkcmF0ZWRJY3VEYXRhLFxuKSB7XG4gIGZvciAoY29uc3Qgbm9kZSBvZiBkZWh5ZHJhdGVkSWN1RGF0YS5ub2RlLmNhc2VzW2RlaHlkcmF0ZWRJY3VEYXRhLmNhc2VdKSB7XG4gICAgY29uc3Qgck5vZGUgPSBpMThuTm9kZXMuZ2V0KG5vZGUuaW5kZXggLSBIRUFERVJfT0ZGU0VUKTtcbiAgICBpZiAock5vZGUpIHtcbiAgICAgIG5hdGl2ZVJlbW92ZU5vZGUocmVuZGVyZXIsIHJOb2RlLCBmYWxzZSk7XG4gICAgfVxuICB9XG59XG4iXX0=