/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { inject, Injector } from '../di';
import { isRootTemplateMessage } from '../render3/i18n/i18n_util';
import { HEADER_OFFSET, HYDRATION, RENDERER, TVIEW } from '../render3/interfaces/view';
import { nativeRemoveNode } from '../render3/node_manipulation';
import { unwrapRNode } from '../render3/util/view_utils';
import { assertDefined, assertNotEqual } from '../util/assert';
import { I18N_DATA } from './interfaces';
import { locateNextRNode, tryLocateRNodeByPath } from './node_lookup_utils';
import { IS_I18N_HYDRATION_ENABLED } from './tokens';
import { getNgContainerSize, initDisconnectedNodes, isSerializedElementContainer, processTextNodeBeforeSerialization, } from './utils';
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
    const caseQueue = [];
    tI18n.ast.forEach((node) => serializeI18nBlock(lView, caseQueue, context, node));
    return caseQueue.length > 0 ? caseQueue : null;
}
function serializeI18nBlock(lView, caseQueue, context, node) {
    switch (node.kind) {
        case 0 /* I18nNodeKind.TEXT */:
            const rNode = unwrapRNode(lView[node.index]);
            processTextNodeBeforeSerialization(context, rNode);
            break;
        case 1 /* I18nNodeKind.ELEMENT */:
        case 2 /* I18nNodeKind.PLACEHOLDER */:
            node.children.forEach((node) => serializeI18nBlock(lView, caseQueue, context, node));
            break;
        case 3 /* I18nNodeKind.ICU */:
            const currentCase = lView[node.currentCaseLViewIndex];
            if (currentCase != null) {
                // i18n uses a negative value to signal a change to a new case, so we
                // need to invert it to get the proper value.
                const caseIdx = currentCase < 0 ? ~currentCase : currentCase;
                caseQueue.push(caseIdx);
                node.cases[caseIdx].forEach((node) => serializeI18nBlock(lView, caseQueue, context, node));
            }
            break;
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
    if (!isI18nHydrationSupportEnabled()) {
        return;
    }
    const hydrationInfo = lView[HYDRATION];
    if (!hydrationInfo) {
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
        for (const node of nodeOrNodes) {
            // If the node is being projected elsewhere, we need to temporarily
            // branch the state to that location to continue hydration.
            // Otherwise, we continue hydration from the current location.
            const targetNode = tryLocateRNodeByPath(context.hydrationInfo, context.lView, node.index - HEADER_OFFSET);
            const nextState = targetNode ? forkHydrationState(state, targetNode) : state;
            collectI18nNodesFromDom(context, nextState, node);
        }
    }
    else {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaTE4bi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL2h5ZHJhdGlvbi9pMThuLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxNQUFNLEVBQUUsUUFBUSxFQUFDLE1BQU0sT0FBTyxDQUFDO0FBQ3ZDLE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLDJCQUEyQixDQUFDO0FBS2hFLE9BQU8sRUFBQyxhQUFhLEVBQUUsU0FBUyxFQUFTLFFBQVEsRUFBUyxLQUFLLEVBQUMsTUFBTSw0QkFBNEIsQ0FBQztBQUNuRyxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSw4QkFBOEIsQ0FBQztBQUM5RCxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sNEJBQTRCLENBQUM7QUFDdkQsT0FBTyxFQUFDLGFBQWEsRUFBRSxjQUFjLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUc3RCxPQUFPLEVBQW9DLFNBQVMsRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUMxRSxPQUFPLEVBQUMsZUFBZSxFQUFFLG9CQUFvQixFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDMUUsT0FBTyxFQUFDLHlCQUF5QixFQUFDLE1BQU0sVUFBVSxDQUFDO0FBQ25ELE9BQU8sRUFDTCxrQkFBa0IsRUFDbEIscUJBQXFCLEVBQ3JCLDRCQUE0QixFQUM1QixrQ0FBa0MsR0FDbkMsTUFBTSxTQUFTLENBQUM7QUFFakIsSUFBSSw4QkFBOEIsR0FBRyxLQUFLLENBQUM7QUFFM0MsSUFBSSxpQ0FBaUMsR0FBNEMsR0FBRyxFQUFFO0lBQ3BGLG1FQUFtRTtBQUNyRSxDQUFDLENBQUM7QUFFRixNQUFNLFVBQVUsZ0NBQWdDLENBQUMsT0FBZ0I7SUFDL0QsOEJBQThCLEdBQUcsT0FBTyxDQUFDO0FBQzNDLENBQUM7QUFFRCxNQUFNLFVBQVUsNkJBQTZCO0lBQzNDLE9BQU8sOEJBQThCLENBQUM7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QUMsQ0FBQztZQUNqQyxLQUFLLE1BQU0saUJBQWlCLElBQUksb0JBQW9CLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQztnQkFDOUQsd0JBQXdCLENBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1lBQ25FLENBQUM7UUFDSCxDQUFDO1FBRUQsYUFBYSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFDcEMsYUFBYSxDQUFDLGlCQUFpQixHQUFHLFNBQVMsQ0FBQztJQUM5QyxDQUFDO0FBQ0gsQ0FBQztBQUVELFNBQVMsd0JBQXdCLENBQy9CLFFBQWtCLEVBQ2xCLFNBQW9DLEVBQ3BDLGlCQUFvQztJQUVwQyxLQUFLLE1BQU0sSUFBSSxJQUFJLGlCQUFpQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUN4RSxNQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsYUFBYSxDQUFDLENBQUM7UUFDeEQsSUFBSSxLQUFLLEVBQUUsQ0FBQztZQUNWLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDM0MsQ0FBQztJQUNILENBQUM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7aW5qZWN0LCBJbmplY3Rvcn0gZnJvbSAnLi4vZGknO1xuaW1wb3J0IHtpc1Jvb3RUZW1wbGF0ZU1lc3NhZ2V9IGZyb20gJy4uL3JlbmRlcjMvaTE4bi9pMThuX3V0aWwnO1xuaW1wb3J0IHtJMThuTm9kZSwgSTE4bk5vZGVLaW5kLCBJMThuUGxhY2Vob2xkZXJUeXBlLCBUSTE4bn0gZnJvbSAnLi4vcmVuZGVyMy9pbnRlcmZhY2VzL2kxOG4nO1xuaW1wb3J0IHtUTm9kZSwgVE5vZGVUeXBlfSBmcm9tICcuLi9yZW5kZXIzL2ludGVyZmFjZXMvbm9kZSc7XG5pbXBvcnQgdHlwZSB7UmVuZGVyZXJ9IGZyb20gJy4uL3JlbmRlcjMvaW50ZXJmYWNlcy9yZW5kZXJlcic7XG5pbXBvcnQgdHlwZSB7Uk5vZGV9IGZyb20gJy4uL3JlbmRlcjMvaW50ZXJmYWNlcy9yZW5kZXJlcl9kb20nO1xuaW1wb3J0IHtIRUFERVJfT0ZGU0VULCBIWURSQVRJT04sIExWaWV3LCBSRU5ERVJFUiwgVFZpZXcsIFRWSUVXfSBmcm9tICcuLi9yZW5kZXIzL2ludGVyZmFjZXMvdmlldyc7XG5pbXBvcnQge25hdGl2ZVJlbW92ZU5vZGV9IGZyb20gJy4uL3JlbmRlcjMvbm9kZV9tYW5pcHVsYXRpb24nO1xuaW1wb3J0IHt1bndyYXBSTm9kZX0gZnJvbSAnLi4vcmVuZGVyMy91dGlsL3ZpZXdfdXRpbHMnO1xuaW1wb3J0IHthc3NlcnREZWZpbmVkLCBhc3NlcnROb3RFcXVhbH0gZnJvbSAnLi4vdXRpbC9hc3NlcnQnO1xuXG5pbXBvcnQgdHlwZSB7SHlkcmF0aW9uQ29udGV4dH0gZnJvbSAnLi9hbm5vdGF0ZSc7XG5pbXBvcnQge0RlaHlkcmF0ZWRJY3VEYXRhLCBEZWh5ZHJhdGVkVmlldywgSTE4Tl9EQVRBfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuaW1wb3J0IHtsb2NhdGVOZXh0Uk5vZGUsIHRyeUxvY2F0ZVJOb2RlQnlQYXRofSBmcm9tICcuL25vZGVfbG9va3VwX3V0aWxzJztcbmltcG9ydCB7SVNfSTE4Tl9IWURSQVRJT05fRU5BQkxFRH0gZnJvbSAnLi90b2tlbnMnO1xuaW1wb3J0IHtcbiAgZ2V0TmdDb250YWluZXJTaXplLFxuICBpbml0RGlzY29ubmVjdGVkTm9kZXMsXG4gIGlzU2VyaWFsaXplZEVsZW1lbnRDb250YWluZXIsXG4gIHByb2Nlc3NUZXh0Tm9kZUJlZm9yZVNlcmlhbGl6YXRpb24sXG59IGZyb20gJy4vdXRpbHMnO1xuXG5sZXQgX2lzSTE4bkh5ZHJhdGlvblN1cHBvcnRFbmFibGVkID0gZmFsc2U7XG5cbmxldCBfcHJlcGFyZUkxOG5CbG9ja0Zvckh5ZHJhdGlvbkltcGw6IHR5cGVvZiBwcmVwYXJlSTE4bkJsb2NrRm9ySHlkcmF0aW9uSW1wbCA9ICgpID0+IHtcbiAgLy8gbm9vcCB1bmxlc3MgYGVuYWJsZVByZXBhcmVJMThuQmxvY2tGb3JIeWRyYXRpb25JbXBsYCBpcyBpbnZva2VkLlxufTtcblxuZXhwb3J0IGZ1bmN0aW9uIHNldElzSTE4bkh5ZHJhdGlvblN1cHBvcnRFbmFibGVkKGVuYWJsZWQ6IGJvb2xlYW4pIHtcbiAgX2lzSTE4bkh5ZHJhdGlvblN1cHBvcnRFbmFibGVkID0gZW5hYmxlZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzSTE4bkh5ZHJhdGlvblN1cHBvcnRFbmFibGVkKCkge1xuICByZXR1cm4gX2lzSTE4bkh5ZHJhdGlvblN1cHBvcnRFbmFibGVkO1xufVxuXG4vKipcbiAqIFByZXBhcmVzIGFuIGkxOG4gYmxvY2sgYW5kIGl0cyBjaGlsZHJlbiwgbG9jYXRlZCBhdCB0aGUgZ2l2ZW5cbiAqIHZpZXcgYW5kIGluc3RydWN0aW9uIGluZGV4LCBmb3IgaHlkcmF0aW9uLlxuICpcbiAqIEBwYXJhbSBsVmlldyBsVmlldyB3aXRoIHRoZSBpMThuIGJsb2NrXG4gKiBAcGFyYW0gaW5kZXggaW5kZXggb2YgdGhlIGkxOG4gYmxvY2sgaW4gdGhlIGxWaWV3XG4gKiBAcGFyYW0gcGFyZW50VE5vZGUgVE5vZGUgb2YgdGhlIHBhcmVudCBvZiB0aGUgaTE4biBibG9ja1xuICogQHBhcmFtIHN1YlRlbXBsYXRlSW5kZXggc3ViLXRlbXBsYXRlIGluZGV4LCBvciAtMSBmb3IgdGhlIG1haW4gdGVtcGxhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByZXBhcmVJMThuQmxvY2tGb3JIeWRyYXRpb24oXG4gIGxWaWV3OiBMVmlldyxcbiAgaW5kZXg6IG51bWJlcixcbiAgcGFyZW50VE5vZGU6IFROb2RlIHwgbnVsbCxcbiAgc3ViVGVtcGxhdGVJbmRleDogbnVtYmVyLFxuKTogdm9pZCB7XG4gIF9wcmVwYXJlSTE4bkJsb2NrRm9ySHlkcmF0aW9uSW1wbChsVmlldywgaW5kZXgsIHBhcmVudFROb2RlLCBzdWJUZW1wbGF0ZUluZGV4KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVuYWJsZVByZXBhcmVJMThuQmxvY2tGb3JIeWRyYXRpb25JbXBsKCkge1xuICBfcHJlcGFyZUkxOG5CbG9ja0Zvckh5ZHJhdGlvbkltcGwgPSBwcmVwYXJlSTE4bkJsb2NrRm9ySHlkcmF0aW9uSW1wbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzSTE4bkh5ZHJhdGlvbkVuYWJsZWQoaW5qZWN0b3I/OiBJbmplY3Rvcikge1xuICBpbmplY3RvciA9IGluamVjdG9yID8/IGluamVjdChJbmplY3Rvcik7XG4gIHJldHVybiBpbmplY3Rvci5nZXQoSVNfSTE4Tl9IWURSQVRJT05fRU5BQkxFRCwgZmFsc2UpO1xufVxuXG4vKipcbiAqIENvbGxlY3RzLCBpZiBub3QgYWxyZWFkeSBjYWNoZWQsIGFsbCBvZiB0aGUgaW5kaWNlcyBpbiB0aGVcbiAqIGdpdmVuIFRWaWV3IHdoaWNoIGFyZSBjaGlsZHJlbiBvZiBhbiBpMThuIGJsb2NrLlxuICpcbiAqIFNpbmNlIGkxOG4gYmxvY2tzIGRvbid0IGludHJvZHVjZSBhIHBhcmVudCBUTm9kZSwgdGhpcyBpcyBuZWNlc3NhcnlcbiAqIGluIG9yZGVyIHRvIGRldGVybWluZSB3aGljaCBpbmRpY2VzIGluIGEgTFZpZXcgYXJlIHRyYW5zbGF0ZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRPckNvbXB1dGVJMThuQ2hpbGRyZW4oXG4gIHRWaWV3OiBUVmlldyxcbiAgY29udGV4dDogSHlkcmF0aW9uQ29udGV4dCxcbik6IFNldDxudW1iZXI+IHwgbnVsbCB7XG4gIGxldCBpMThuQ2hpbGRyZW4gPSBjb250ZXh0LmkxOG5DaGlsZHJlbi5nZXQodFZpZXcpO1xuICBpZiAoaTE4bkNoaWxkcmVuID09PSB1bmRlZmluZWQpIHtcbiAgICBpMThuQ2hpbGRyZW4gPSBjb2xsZWN0STE4bkNoaWxkcmVuKHRWaWV3KTtcbiAgICBjb250ZXh0LmkxOG5DaGlsZHJlbi5zZXQodFZpZXcsIGkxOG5DaGlsZHJlbik7XG4gIH1cbiAgcmV0dXJuIGkxOG5DaGlsZHJlbjtcbn1cblxuZnVuY3Rpb24gY29sbGVjdEkxOG5DaGlsZHJlbih0VmlldzogVFZpZXcpOiBTZXQ8bnVtYmVyPiB8IG51bGwge1xuICBjb25zdCBjaGlsZHJlbiA9IG5ldyBTZXQ8bnVtYmVyPigpO1xuXG4gIGZ1bmN0aW9uIGNvbGxlY3RJMThuVmlld3Mobm9kZTogSTE4bk5vZGUpIHtcbiAgICBjaGlsZHJlbi5hZGQobm9kZS5pbmRleCk7XG5cbiAgICBzd2l0Y2ggKG5vZGUua2luZCkge1xuICAgICAgY2FzZSBJMThuTm9kZUtpbmQuRUxFTUVOVDpcbiAgICAgIGNhc2UgSTE4bk5vZGVLaW5kLlBMQUNFSE9MREVSOiB7XG4gICAgICAgIGZvciAoY29uc3QgY2hpbGROb2RlIG9mIG5vZGUuY2hpbGRyZW4pIHtcbiAgICAgICAgICBjb2xsZWN0STE4blZpZXdzKGNoaWxkTm9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIGNhc2UgSTE4bk5vZGVLaW5kLklDVToge1xuICAgICAgICBmb3IgKGNvbnN0IGNhc2VOb2RlcyBvZiBub2RlLmNhc2VzKSB7XG4gICAgICAgICAgZm9yIChjb25zdCBjYXNlTm9kZSBvZiBjYXNlTm9kZXMpIHtcbiAgICAgICAgICAgIGNvbGxlY3RJMThuVmlld3MoY2FzZU5vZGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBUcmF2ZXJzZSB0aHJvdWdoIHRoZSBBU1Qgb2YgZWFjaCBpMThuIGJsb2NrIGluIHRoZSBMVmlldyxcbiAgLy8gYW5kIGNvbGxlY3QgZXZlcnkgaW5zdHJ1Y3Rpb24gaW5kZXguXG4gIGZvciAobGV0IGkgPSBIRUFERVJfT0ZGU0VUOyBpIDwgdFZpZXcuYmluZGluZ1N0YXJ0SW5kZXg7IGkrKykge1xuICAgIGNvbnN0IHRJMThuID0gdFZpZXcuZGF0YVtpXSBhcyBUSTE4biB8IHVuZGVmaW5lZDtcbiAgICBpZiAoIXRJMThuIHx8ICF0STE4bi5hc3QpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGZvciAoY29uc3Qgbm9kZSBvZiB0STE4bi5hc3QpIHtcbiAgICAgIGNvbGxlY3RJMThuVmlld3Mobm9kZSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGNoaWxkcmVuLnNpemUgPT09IDAgPyBudWxsIDogY2hpbGRyZW47XG59XG5cbi8qKlxuICogQXR0ZW1wdHMgdG8gc2VyaWFsaXplIGkxOG4gZGF0YSBmb3IgYW4gaTE4biBibG9jaywgbG9jYXRlZCBhdFxuICogdGhlIGdpdmVuIHZpZXcgYW5kIGluc3RydWN0aW9uIGluZGV4LlxuICpcbiAqIEBwYXJhbSBsVmlldyBsVmlldyB3aXRoIHRoZSBpMThuIGJsb2NrXG4gKiBAcGFyYW0gaW5kZXggaW5kZXggb2YgdGhlIGkxOG4gYmxvY2sgaW4gdGhlIGxWaWV3XG4gKiBAcGFyYW0gY29udGV4dCB0aGUgaHlkcmF0aW9uIGNvbnRleHRcbiAqIEByZXR1cm5zIHRoZSBpMThuIGRhdGEsIG9yIG51bGwgaWYgdGhlcmUgaXMgbm8gcmVsZXZhbnQgZGF0YVxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJ5U2VyaWFsaXplSTE4bkJsb2NrKFxuICBsVmlldzogTFZpZXcsXG4gIGluZGV4OiBudW1iZXIsXG4gIGNvbnRleHQ6IEh5ZHJhdGlvbkNvbnRleHQsXG4pOiBBcnJheTxudW1iZXI+IHwgbnVsbCB7XG4gIGlmICghY29udGV4dC5pc0kxOG5IeWRyYXRpb25FbmFibGVkKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBjb25zdCB0VmlldyA9IGxWaWV3W1RWSUVXXTtcbiAgY29uc3QgdEkxOG4gPSB0Vmlldy5kYXRhW2luZGV4XSBhcyBUSTE4biB8IHVuZGVmaW5lZDtcbiAgaWYgKCF0STE4biB8fCAhdEkxOG4uYXN0KSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBjb25zdCBjYXNlUXVldWU6IG51bWJlcltdID0gW107XG4gIHRJMThuLmFzdC5mb3JFYWNoKChub2RlKSA9PiBzZXJpYWxpemVJMThuQmxvY2sobFZpZXcsIGNhc2VRdWV1ZSwgY29udGV4dCwgbm9kZSkpO1xuICByZXR1cm4gY2FzZVF1ZXVlLmxlbmd0aCA+IDAgPyBjYXNlUXVldWUgOiBudWxsO1xufVxuXG5mdW5jdGlvbiBzZXJpYWxpemVJMThuQmxvY2soXG4gIGxWaWV3OiBMVmlldyxcbiAgY2FzZVF1ZXVlOiBudW1iZXJbXSxcbiAgY29udGV4dDogSHlkcmF0aW9uQ29udGV4dCxcbiAgbm9kZTogSTE4bk5vZGUsXG4pIHtcbiAgc3dpdGNoIChub2RlLmtpbmQpIHtcbiAgICBjYXNlIEkxOG5Ob2RlS2luZC5URVhUOlxuICAgICAgY29uc3Qgck5vZGUgPSB1bndyYXBSTm9kZShsVmlld1tub2RlLmluZGV4XSEpO1xuICAgICAgcHJvY2Vzc1RleHROb2RlQmVmb3JlU2VyaWFsaXphdGlvbihjb250ZXh0LCByTm9kZSk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgSTE4bk5vZGVLaW5kLkVMRU1FTlQ6XG4gICAgY2FzZSBJMThuTm9kZUtpbmQuUExBQ0VIT0xERVI6XG4gICAgICBub2RlLmNoaWxkcmVuLmZvckVhY2goKG5vZGUpID0+IHNlcmlhbGl6ZUkxOG5CbG9jayhsVmlldywgY2FzZVF1ZXVlLCBjb250ZXh0LCBub2RlKSk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgSTE4bk5vZGVLaW5kLklDVTpcbiAgICAgIGNvbnN0IGN1cnJlbnRDYXNlID0gbFZpZXdbbm9kZS5jdXJyZW50Q2FzZUxWaWV3SW5kZXhdIGFzIG51bWJlciB8IG51bGw7XG4gICAgICBpZiAoY3VycmVudENhc2UgIT0gbnVsbCkge1xuICAgICAgICAvLyBpMThuIHVzZXMgYSBuZWdhdGl2ZSB2YWx1ZSB0byBzaWduYWwgYSBjaGFuZ2UgdG8gYSBuZXcgY2FzZSwgc28gd2VcbiAgICAgICAgLy8gbmVlZCB0byBpbnZlcnQgaXQgdG8gZ2V0IHRoZSBwcm9wZXIgdmFsdWUuXG4gICAgICAgIGNvbnN0IGNhc2VJZHggPSBjdXJyZW50Q2FzZSA8IDAgPyB+Y3VycmVudENhc2UgOiBjdXJyZW50Q2FzZTtcbiAgICAgICAgY2FzZVF1ZXVlLnB1c2goY2FzZUlkeCk7XG4gICAgICAgIG5vZGUuY2FzZXNbY2FzZUlkeF0uZm9yRWFjaCgobm9kZSkgPT4gc2VyaWFsaXplSTE4bkJsb2NrKGxWaWV3LCBjYXNlUXVldWUsIGNvbnRleHQsIG5vZGUpKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICB9XG59XG5cbi8qKlxuICogRGVzY3JpYmVzIHNoYXJlZCBkYXRhIGF2YWlsYWJsZSBkdXJpbmcgdGhlIGh5ZHJhdGlvbiBwcm9jZXNzLlxuICovXG5pbnRlcmZhY2UgSTE4bkh5ZHJhdGlvbkNvbnRleHQge1xuICBoeWRyYXRpb25JbmZvOiBEZWh5ZHJhdGVkVmlldztcbiAgbFZpZXc6IExWaWV3O1xuICBpMThuTm9kZXM6IE1hcDxudW1iZXIsIFJOb2RlIHwgbnVsbD47XG4gIGRpc2Nvbm5lY3RlZE5vZGVzOiBTZXQ8bnVtYmVyPjtcbiAgY2FzZVF1ZXVlOiBudW1iZXJbXTtcbiAgZGVoeWRyYXRlZEljdURhdGE6IE1hcDxudW1iZXIsIERlaHlkcmF0ZWRJY3VEYXRhPjtcbn1cblxuLyoqXG4gKiBEZXNjcmliZXMgY3VycmVudCBoeWRyYXRpb24gc3RhdGUuXG4gKi9cbmludGVyZmFjZSBJMThuSHlkcmF0aW9uU3RhdGUge1xuICAvLyBUaGUgY3VycmVudCBub2RlXG4gIGN1cnJlbnROb2RlOiBOb2RlIHwgbnVsbDtcblxuICAvKipcbiAgICogV2hldGhlciB0aGUgdHJlZSBzaG91bGQgYmUgY29ubmVjdGVkLlxuICAgKlxuICAgKiBEdXJpbmcgaHlkcmF0aW9uLCBpdCBjYW4gaGFwcGVuIHRoYXQgd2UgZXhwZWN0IHRvIGhhdmUgYVxuICAgKiBjdXJyZW50IFJOb2RlLCBidXQgd2UgZG9uJ3QuIEluIHN1Y2ggY2FzZXMsIHdlIHN0aWxsIG5lZWRcbiAgICogdG8gcHJvcGFnYXRlIHRoZSBleHBlY3RhdGlvbiB0byB0aGUgY29ycmVzcG9uZGluZyBMVmlld3MsXG4gICAqIHNvIHRoYXQgdGhlIHByb3BlciBkb3duc3RyZWFtIGVycm9yIGhhbmRsaW5nIGNhbiBwcm92aWRlXG4gICAqIHRoZSBjb3JyZWN0IGNvbnRleHQgZm9yIHRoZSBlcnJvci5cbiAgICovXG4gIGlzQ29ubmVjdGVkOiBib29sZWFuO1xufVxuXG5mdW5jdGlvbiBzZXRDdXJyZW50Tm9kZShzdGF0ZTogSTE4bkh5ZHJhdGlvblN0YXRlLCBub2RlOiBOb2RlIHwgbnVsbCkge1xuICBzdGF0ZS5jdXJyZW50Tm9kZSA9IG5vZGU7XG59XG5cbi8qKlxuICogTWFya3MgdGhlIGN1cnJlbnQgUk5vZGUgYXMgdGhlIGh5ZHJhdGlvbiByb290IGZvciB0aGUgZ2l2ZW5cbiAqIEFTVCBub2RlLlxuICovXG5mdW5jdGlvbiBhcHBlbmRJMThuTm9kZVRvQ29sbGVjdGlvbihcbiAgY29udGV4dDogSTE4bkh5ZHJhdGlvbkNvbnRleHQsXG4gIHN0YXRlOiBJMThuSHlkcmF0aW9uU3RhdGUsXG4gIGFzdE5vZGU6IEkxOG5Ob2RlLFxuKSB7XG4gIGNvbnN0IG5vT2Zmc2V0SW5kZXggPSBhc3ROb2RlLmluZGV4IC0gSEVBREVSX09GRlNFVDtcbiAgY29uc3Qge2Rpc2Nvbm5lY3RlZE5vZGVzfSA9IGNvbnRleHQ7XG4gIGNvbnN0IGN1cnJlbnROb2RlID0gc3RhdGUuY3VycmVudE5vZGU7XG5cbiAgaWYgKHN0YXRlLmlzQ29ubmVjdGVkKSB7XG4gICAgY29udGV4dC5pMThuTm9kZXMuc2V0KG5vT2Zmc2V0SW5kZXgsIGN1cnJlbnROb2RlKTtcblxuICAgIC8vIFdlIGV4cGVjdCB0aGUgbm9kZSB0byBiZSBjb25uZWN0ZWQsIHNvIGVuc3VyZSB0aGF0IGl0XG4gICAgLy8gaXMgbm90IGluIHRoZSBzZXQsIHJlZ2FyZGxlc3Mgb2Ygd2hldGhlciB3ZSBmb3VuZCBpdCxcbiAgICAvLyBzbyB0aGF0IHRoZSBkb3duc3RyZWFtIGVycm9yIGhhbmRsaW5nIGNhbiBwcm92aWRlIHRoZVxuICAgIC8vIHByb3BlciBjb250ZXh0LlxuICAgIGRpc2Nvbm5lY3RlZE5vZGVzLmRlbGV0ZShub09mZnNldEluZGV4KTtcbiAgfSBlbHNlIHtcbiAgICBkaXNjb25uZWN0ZWROb2Rlcy5hZGQobm9PZmZzZXRJbmRleCk7XG4gIH1cblxuICByZXR1cm4gY3VycmVudE5vZGU7XG59XG5cbi8qKlxuICogU2tpcCBvdmVyIHNvbWUgc2libGluZyBub2RlcyBkdXJpbmcgaHlkcmF0aW9uLlxuICpcbiAqIE5vdGU6IHdlIHVzZSB0aGlzIGluc3RlYWQgb2YgYHNpYmxpbmdBZnRlcmAgYXMgaXQncyBleHBlY3RlZCB0aGF0XG4gKiBzb21ldGltZXMgd2UgbWlnaHQgZW5jb3VudGVyIG51bGwgbm9kZXMuIEluIHRob3NlIGNhc2VzLCB3ZSB3YW50IHRvXG4gKiBkZWZlciB0byBkb3duc3RyZWFtIGVycm9yIGhhbmRsaW5nIHRvIHByb3ZpZGUgcHJvcGVyIGNvbnRleHQuXG4gKi9cbmZ1bmN0aW9uIHNraXBTaWJsaW5nTm9kZXMoc3RhdGU6IEkxOG5IeWRyYXRpb25TdGF0ZSwgc2tpcDogbnVtYmVyKSB7XG4gIGxldCBjdXJyZW50Tm9kZSA9IHN0YXRlLmN1cnJlbnROb2RlO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHNraXA7IGkrKykge1xuICAgIGlmICghY3VycmVudE5vZGUpIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBjdXJyZW50Tm9kZSA9IGN1cnJlbnROb2RlPy5uZXh0U2libGluZyA/PyBudWxsO1xuICB9XG4gIHJldHVybiBjdXJyZW50Tm9kZTtcbn1cblxuLyoqXG4gKiBGb3JrIHRoZSBnaXZlbiBzdGF0ZSBpbnRvIGEgbmV3IHN0YXRlIGZvciBoeWRyYXRpbmcgY2hpbGRyZW4uXG4gKi9cbmZ1bmN0aW9uIGZvcmtIeWRyYXRpb25TdGF0ZShzdGF0ZTogSTE4bkh5ZHJhdGlvblN0YXRlLCBuZXh0Tm9kZTogTm9kZSB8IG51bGwpIHtcbiAgcmV0dXJuIHtjdXJyZW50Tm9kZTogbmV4dE5vZGUsIGlzQ29ubmVjdGVkOiBzdGF0ZS5pc0Nvbm5lY3RlZH07XG59XG5cbmZ1bmN0aW9uIHByZXBhcmVJMThuQmxvY2tGb3JIeWRyYXRpb25JbXBsKFxuICBsVmlldzogTFZpZXcsXG4gIGluZGV4OiBudW1iZXIsXG4gIHBhcmVudFROb2RlOiBUTm9kZSB8IG51bGwsXG4gIHN1YlRlbXBsYXRlSW5kZXg6IG51bWJlcixcbikge1xuICBpZiAoIWlzSTE4bkh5ZHJhdGlvblN1cHBvcnRFbmFibGVkKCkpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCBoeWRyYXRpb25JbmZvID0gbFZpZXdbSFlEUkFUSU9OXTtcbiAgaWYgKCFoeWRyYXRpb25JbmZvKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29uc3QgdFZpZXcgPSBsVmlld1tUVklFV107XG4gIGNvbnN0IHRJMThuID0gdFZpZXcuZGF0YVtpbmRleF0gYXMgVEkxOG47XG4gIG5nRGV2TW9kZSAmJlxuICAgIGFzc2VydERlZmluZWQodEkxOG4sICdFeHBlY3RlZCBpMThuIGRhdGEgdG8gYmUgcHJlc2VudCBpbiBhIGdpdmVuIFRWaWV3IHNsb3QgZHVyaW5nIGh5ZHJhdGlvbicpO1xuXG4gIGZ1bmN0aW9uIGZpbmRIeWRyYXRpb25Sb290KCkge1xuICAgIGlmIChpc1Jvb3RUZW1wbGF0ZU1lc3NhZ2Uoc3ViVGVtcGxhdGVJbmRleCkpIHtcbiAgICAgIC8vIFRoaXMgaXMgdGhlIHJvb3Qgb2YgYW4gaTE4biBibG9jay4gSW4gdGhpcyBjYXNlLCBvdXIgaHlkcmF0aW9uIHJvb3Qgd2lsbFxuICAgICAgLy8gZGVwZW5kIG9uIHdoZXJlIG91ciBwYXJlbnQgVE5vZGUgKGkuZS4gdGhlIGJsb2NrIHdpdGggaTE4biBhcHBsaWVkKSBpc1xuICAgICAgLy8gaW4gdGhlIERPTS5cbiAgICAgIG5nRGV2TW9kZSAmJiBhc3NlcnREZWZpbmVkKHBhcmVudFROb2RlLCAnRXhwZWN0ZWQgcGFyZW50IFROb2RlIHdoaWxlIGh5ZHJhdGluZyBpMThuIHJvb3QnKTtcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gbG9jYXRlTmV4dFJOb2RlKGh5ZHJhdGlvbkluZm8hLCB0VmlldywgbFZpZXcsIHBhcmVudFROb2RlISkgYXMgTm9kZTtcblxuICAgICAgLy8gSWYgdGhpcyBpMThuIGJsb2NrIGlzIGF0dGFjaGVkIHRvIGFuIDxuZy1jb250YWluZXI+LCB0aGVuIHdlIHdhbnQgdG8gYmVnaW5cbiAgICAgIC8vIGh5ZHJhdGluZyBkaXJlY3RseSB3aXRoIHRoZSBSTm9kZS4gT3RoZXJ3aXNlLCBmb3IgYSBUTm9kZSB3aXRoIGEgcGh5c2ljYWwgRE9NXG4gICAgICAvLyBlbGVtZW50LCB3ZSB3YW50IHRvIHJlY3Vyc2UgaW50byB0aGUgZmlyc3QgY2hpbGQgYW5kIGJlZ2luIHRoZXJlLlxuICAgICAgcmV0dXJuIHBhcmVudFROb2RlIS50eXBlICYgVE5vZGVUeXBlLkVsZW1lbnRDb250YWluZXIgPyByb290Tm9kZSA6IHJvb3ROb2RlLmZpcnN0Q2hpbGQ7XG4gICAgfVxuXG4gICAgLy8gVGhpcyBpcyBhIG5lc3RlZCB0ZW1wbGF0ZSBpbiBhbiBpMThuIGJsb2NrLiBJbiB0aGlzIGNhc2UsIHRoZSBlbnRpcmUgdmlld1xuICAgIC8vIGlzIHRyYW5zbGF0ZWQsIGFuZCBwYXJ0IG9mIGEgZGVoeWRyYXRlZCB2aWV3IGluIGEgY29udGFpbmVyLiBUaGlzIG1lYW5zIHRoYXRcbiAgICAvLyB3ZSBjYW4gc2ltcGx5IGJlZ2luIGh5ZHJhdGlvbiB3aXRoIHRoZSBmaXJzdCBkZWh5ZHJhdGVkIGNoaWxkLlxuICAgIHJldHVybiBoeWRyYXRpb25JbmZvPy5maXJzdENoaWxkIGFzIE5vZGU7XG4gIH1cblxuICBjb25zdCBjdXJyZW50Tm9kZSA9IGZpbmRIeWRyYXRpb25Sb290KCk7XG4gIG5nRGV2TW9kZSAmJiBhc3NlcnREZWZpbmVkKGN1cnJlbnROb2RlLCAnRXhwZWN0ZWQgcm9vdCBpMThuIG5vZGUgZHVyaW5nIGh5ZHJhdGlvbicpO1xuXG4gIGNvbnN0IGRpc2Nvbm5lY3RlZE5vZGVzID0gaW5pdERpc2Nvbm5lY3RlZE5vZGVzKGh5ZHJhdGlvbkluZm8pID8/IG5ldyBTZXQoKTtcbiAgY29uc3QgaTE4bk5vZGVzID0gKGh5ZHJhdGlvbkluZm8uaTE4bk5vZGVzID8/PSBuZXcgTWFwPG51bWJlciwgUk5vZGUgfCBudWxsPigpKTtcbiAgY29uc3QgY2FzZVF1ZXVlID0gaHlkcmF0aW9uSW5mby5kYXRhW0kxOE5fREFUQV0/LltpbmRleCAtIEhFQURFUl9PRkZTRVRdID8/IFtdO1xuICBjb25zdCBkZWh5ZHJhdGVkSWN1RGF0YSA9IChoeWRyYXRpb25JbmZvLmRlaHlkcmF0ZWRJY3VEYXRhID8/PSBuZXcgTWFwPFxuICAgIG51bWJlcixcbiAgICBEZWh5ZHJhdGVkSWN1RGF0YVxuICA+KCkpO1xuXG4gIGNvbGxlY3RJMThuTm9kZXNGcm9tRG9tKFxuICAgIHtoeWRyYXRpb25JbmZvLCBsVmlldywgaTE4bk5vZGVzLCBkaXNjb25uZWN0ZWROb2RlcywgY2FzZVF1ZXVlLCBkZWh5ZHJhdGVkSWN1RGF0YX0sXG4gICAge2N1cnJlbnROb2RlLCBpc0Nvbm5lY3RlZDogdHJ1ZX0sXG4gICAgdEkxOG4uYXN0LFxuICApO1xuXG4gIC8vIE5vZGVzIGZyb20gaW5hY3RpdmUgSUNVIGNhc2VzIHNob3VsZCBiZSBjb25zaWRlcmVkIGRpc2Nvbm5lY3RlZC4gV2UgdHJhY2sgdGhlbSBhYm92ZVxuICAvLyBiZWNhdXNlIHRoZXkgYXJlbid0IChhbmQgc2hvdWxkbid0IGJlKSBzZXJpYWxpemVkLiBTaW5jZSB3ZSBtYXkgbXV0YXRlIG9yIGNyZWF0ZSBhXG4gIC8vIG5ldyBzZXQsIHdlIG5lZWQgdG8gYmUgc3VyZSB0byB3cml0ZSB0aGUgZXhwZWN0ZWQgdmFsdWUgYmFjayB0byB0aGUgRGVoeWRyYXRlZFZpZXcuXG4gIGh5ZHJhdGlvbkluZm8uZGlzY29ubmVjdGVkTm9kZXMgPSBkaXNjb25uZWN0ZWROb2Rlcy5zaXplID09PSAwID8gbnVsbCA6IGRpc2Nvbm5lY3RlZE5vZGVzO1xufVxuXG5mdW5jdGlvbiBjb2xsZWN0STE4bk5vZGVzRnJvbURvbShcbiAgY29udGV4dDogSTE4bkh5ZHJhdGlvbkNvbnRleHQsXG4gIHN0YXRlOiBJMThuSHlkcmF0aW9uU3RhdGUsXG4gIG5vZGVPck5vZGVzOiBJMThuTm9kZSB8IEkxOG5Ob2RlW10sXG4pIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkobm9kZU9yTm9kZXMpKSB7XG4gICAgZm9yIChjb25zdCBub2RlIG9mIG5vZGVPck5vZGVzKSB7XG4gICAgICAvLyBJZiB0aGUgbm9kZSBpcyBiZWluZyBwcm9qZWN0ZWQgZWxzZXdoZXJlLCB3ZSBuZWVkIHRvIHRlbXBvcmFyaWx5XG4gICAgICAvLyBicmFuY2ggdGhlIHN0YXRlIHRvIHRoYXQgbG9jYXRpb24gdG8gY29udGludWUgaHlkcmF0aW9uLlxuICAgICAgLy8gT3RoZXJ3aXNlLCB3ZSBjb250aW51ZSBoeWRyYXRpb24gZnJvbSB0aGUgY3VycmVudCBsb2NhdGlvbi5cbiAgICAgIGNvbnN0IHRhcmdldE5vZGUgPSB0cnlMb2NhdGVSTm9kZUJ5UGF0aChcbiAgICAgICAgY29udGV4dC5oeWRyYXRpb25JbmZvLFxuICAgICAgICBjb250ZXh0LmxWaWV3LFxuICAgICAgICBub2RlLmluZGV4IC0gSEVBREVSX09GRlNFVCxcbiAgICAgICk7XG4gICAgICBjb25zdCBuZXh0U3RhdGUgPSB0YXJnZXROb2RlID8gZm9ya0h5ZHJhdGlvblN0YXRlKHN0YXRlLCB0YXJnZXROb2RlIGFzIE5vZGUpIDogc3RhdGU7XG4gICAgICBjb2xsZWN0STE4bk5vZGVzRnJvbURvbShjb250ZXh0LCBuZXh0U3RhdGUsIG5vZGUpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBzd2l0Y2ggKG5vZGVPck5vZGVzLmtpbmQpIHtcbiAgICAgIGNhc2UgSTE4bk5vZGVLaW5kLlRFWFQ6IHtcbiAgICAgICAgLy8gQ2xhaW0gYSB0ZXh0IG5vZGUgZm9yIGh5ZHJhdGlvblxuICAgICAgICBjb25zdCBjdXJyZW50Tm9kZSA9IGFwcGVuZEkxOG5Ob2RlVG9Db2xsZWN0aW9uKGNvbnRleHQsIHN0YXRlLCBub2RlT3JOb2Rlcyk7XG4gICAgICAgIHNldEN1cnJlbnROb2RlKHN0YXRlLCBjdXJyZW50Tm9kZT8ubmV4dFNpYmxpbmcgPz8gbnVsbCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICBjYXNlIEkxOG5Ob2RlS2luZC5FTEVNRU5UOiB7XG4gICAgICAgIC8vIFJlY3Vyc2UgaW50byB0aGUgY3VycmVudCBlbGVtZW50J3MgY2hpbGRyZW4uLi5cbiAgICAgICAgY29sbGVjdEkxOG5Ob2Rlc0Zyb21Eb20oXG4gICAgICAgICAgY29udGV4dCxcbiAgICAgICAgICBmb3JrSHlkcmF0aW9uU3RhdGUoc3RhdGUsIHN0YXRlLmN1cnJlbnROb2RlPy5maXJzdENoaWxkID8/IG51bGwpLFxuICAgICAgICAgIG5vZGVPck5vZGVzLmNoaWxkcmVuLFxuICAgICAgICApO1xuXG4gICAgICAgIC8vIEFuZCBjbGFpbSB0aGUgcGFyZW50IGVsZW1lbnQgaXRzZWxmLlxuICAgICAgICBjb25zdCBjdXJyZW50Tm9kZSA9IGFwcGVuZEkxOG5Ob2RlVG9Db2xsZWN0aW9uKGNvbnRleHQsIHN0YXRlLCBub2RlT3JOb2Rlcyk7XG4gICAgICAgIHNldEN1cnJlbnROb2RlKHN0YXRlLCBjdXJyZW50Tm9kZT8ubmV4dFNpYmxpbmcgPz8gbnVsbCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICBjYXNlIEkxOG5Ob2RlS2luZC5QTEFDRUhPTERFUjoge1xuICAgICAgICBjb25zdCBub09mZnNldEluZGV4ID0gbm9kZU9yTm9kZXMuaW5kZXggLSBIRUFERVJfT0ZGU0VUO1xuICAgICAgICBjb25zdCB7aHlkcmF0aW9uSW5mb30gPSBjb250ZXh0O1xuICAgICAgICBjb25zdCBjb250YWluZXJTaXplID0gZ2V0TmdDb250YWluZXJTaXplKGh5ZHJhdGlvbkluZm8sIG5vT2Zmc2V0SW5kZXgpO1xuXG4gICAgICAgIHN3aXRjaCAobm9kZU9yTm9kZXMudHlwZSkge1xuICAgICAgICAgIGNhc2UgSTE4blBsYWNlaG9sZGVyVHlwZS5FTEVNRU5UOiB7XG4gICAgICAgICAgICAvLyBIeWRyYXRpb24gZXhwZWN0cyB0byBmaW5kIHRoZSBoZWFkIG9mIHRoZSBlbGVtZW50LlxuICAgICAgICAgICAgY29uc3QgY3VycmVudE5vZGUgPSBhcHBlbmRJMThuTm9kZVRvQ29sbGVjdGlvbihjb250ZXh0LCBzdGF0ZSwgbm9kZU9yTm9kZXMpO1xuXG4gICAgICAgICAgICAvLyBBIFROb2RlIGZvciB0aGUgbm9kZSBtYXkgbm90IHlldCBpZiB3ZSdyZSBoeWRyYXRpbmcgZHVyaW5nIHRoZSBmaXJzdCBwYXNzLFxuICAgICAgICAgICAgLy8gc28gdXNlIHRoZSBzZXJpYWxpemVkIGRhdGEgdG8gZGV0ZXJtaW5lIGlmIHRoaXMgaXMgYW4gPG5nLWNvbnRhaW5lcj4uXG4gICAgICAgICAgICBpZiAoaXNTZXJpYWxpemVkRWxlbWVudENvbnRhaW5lcihoeWRyYXRpb25JbmZvLCBub09mZnNldEluZGV4KSkge1xuICAgICAgICAgICAgICAvLyBBbiA8bmctY29udGFpbmVyPiBkb2Vzbid0IGhhdmUgYSBwaHlzaWNhbCBET00gbm9kZSwgc28gd2UgbmVlZCB0b1xuICAgICAgICAgICAgICAvLyBjb250aW51ZSBoeWRyYXRpbmcgZnJvbSBzaWJsaW5ncy5cbiAgICAgICAgICAgICAgY29sbGVjdEkxOG5Ob2Rlc0Zyb21Eb20oY29udGV4dCwgc3RhdGUsIG5vZGVPck5vZGVzLmNoaWxkcmVuKTtcblxuICAgICAgICAgICAgICAvLyBTa2lwIG92ZXIgdGhlIGFuY2hvciBlbGVtZW50LiBJdCB3aWxsIGJlIGNsYWltZWQgYnkgdGhlXG4gICAgICAgICAgICAgIC8vIGRvd25zdHJlYW0gY29udGFpbmVyIGh5ZHJhdGlvbi5cbiAgICAgICAgICAgICAgY29uc3QgbmV4dE5vZGUgPSBza2lwU2libGluZ05vZGVzKHN0YXRlLCAxKTtcbiAgICAgICAgICAgICAgc2V0Q3VycmVudE5vZGUoc3RhdGUsIG5leHROb2RlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIE5vbi1jb250YWluZXIgZWxlbWVudHMgcmVwcmVzZW50IGFuIGFjdHVhbCBub2RlIGluIHRoZSBET00sIHNvIHdlXG4gICAgICAgICAgICAgIC8vIG5lZWQgdG8gY29udGludWUgaHlkcmF0aW9uIHdpdGggdGhlIGNoaWxkcmVuLCBhbmQgY2xhaW0gdGhlIG5vZGUuXG4gICAgICAgICAgICAgIGNvbGxlY3RJMThuTm9kZXNGcm9tRG9tKFxuICAgICAgICAgICAgICAgIGNvbnRleHQsXG4gICAgICAgICAgICAgICAgZm9ya0h5ZHJhdGlvblN0YXRlKHN0YXRlLCBzdGF0ZS5jdXJyZW50Tm9kZT8uZmlyc3RDaGlsZCA/PyBudWxsKSxcbiAgICAgICAgICAgICAgICBub2RlT3JOb2Rlcy5jaGlsZHJlbixcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgc2V0Q3VycmVudE5vZGUoc3RhdGUsIGN1cnJlbnROb2RlPy5uZXh0U2libGluZyA/PyBudWxsKTtcblxuICAgICAgICAgICAgICAvLyBFbGVtZW50cyBjYW4gYWxzbyBiZSB0aGUgYW5jaG9yIG9mIGEgdmlldyBjb250YWluZXIsIHNvIHRoZXJlIG1heVxuICAgICAgICAgICAgICAvLyBiZSBlbGVtZW50cyBhZnRlciB0aGlzIG5vZGUgdGhhdCB3ZSBuZWVkIHRvIHNraXAuXG4gICAgICAgICAgICAgIGlmIChjb250YWluZXJTaXplICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgLy8gYCsxYCBzdGFuZHMgZm9yIGFuIGFuY2hvciBub2RlIGFmdGVyIGFsbCBvZiB0aGUgdmlld3MgaW4gdGhlIGNvbnRhaW5lci5cbiAgICAgICAgICAgICAgICBjb25zdCBuZXh0Tm9kZSA9IHNraXBTaWJsaW5nTm9kZXMoc3RhdGUsIGNvbnRhaW5lclNpemUgKyAxKTtcbiAgICAgICAgICAgICAgICBzZXRDdXJyZW50Tm9kZShzdGF0ZSwgbmV4dE5vZGUpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjYXNlIEkxOG5QbGFjZWhvbGRlclR5cGUuU1VCVEVNUExBVEU6IHtcbiAgICAgICAgICAgIG5nRGV2TW9kZSAmJlxuICAgICAgICAgICAgICBhc3NlcnROb3RFcXVhbChcbiAgICAgICAgICAgICAgICBjb250YWluZXJTaXplLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgJ0V4cGVjdGVkIGEgY29udGFpbmVyIHNpemUgd2hpbGUgaHlkcmF0aW5nIGkxOG4gc3VidGVtcGxhdGUnLFxuICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAvLyBIeWRyYXRpb24gZXhwZWN0cyB0byBmaW5kIHRoZSBoZWFkIG9mIHRoZSB0ZW1wbGF0ZS5cbiAgICAgICAgICAgIGFwcGVuZEkxOG5Ob2RlVG9Db2xsZWN0aW9uKGNvbnRleHQsIHN0YXRlLCBub2RlT3JOb2Rlcyk7XG5cbiAgICAgICAgICAgIC8vIFNraXAgb3ZlciBhbGwgb2YgdGhlIHRlbXBsYXRlIGNoaWxkcmVuLCBhcyB3ZWxsIGFzIHRoZSBhbmNob3JcbiAgICAgICAgICAgIC8vIG5vZGUsIHNpbmNlIHRoZSB0ZW1wbGF0ZSBpdHNlbGYgd2lsbCBoYW5kbGUgdGhlbSBpbnN0ZWFkLlxuICAgICAgICAgICAgY29uc3QgbmV4dE5vZGUgPSBza2lwU2libGluZ05vZGVzKHN0YXRlLCBjb250YWluZXJTaXplISArIDEpO1xuICAgICAgICAgICAgc2V0Q3VycmVudE5vZGUoc3RhdGUsIG5leHROb2RlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgY2FzZSBJMThuTm9kZUtpbmQuSUNVOiB7XG4gICAgICAgIC8vIElmIHRoZSBjdXJyZW50IG5vZGUgaXMgY29ubmVjdGVkLCB3ZSBuZWVkIHRvIHBvcCB0aGUgbmV4dCBjYXNlIGZyb20gdGhlXG4gICAgICAgIC8vIHF1ZXVlLCBzbyB0aGF0IHRoZSBhY3RpdmUgY2FzZSBpcyBhbHNvIGNvbnNpZGVyZWQgY29ubmVjdGVkLlxuICAgICAgICBjb25zdCBzZWxlY3RlZENhc2UgPSBzdGF0ZS5pc0Nvbm5lY3RlZCA/IGNvbnRleHQuY2FzZVF1ZXVlLnNoaWZ0KCkhIDogbnVsbDtcbiAgICAgICAgY29uc3QgY2hpbGRTdGF0ZSA9IHtjdXJyZW50Tm9kZTogbnVsbCwgaXNDb25uZWN0ZWQ6IGZhbHNlfTtcblxuICAgICAgICAvLyBXZSB0cmF2ZXJzZSB0aHJvdWdoIGVhY2ggY2FzZSwgZXZlbiBpZiBpdCdzIG5vdCBhY3RpdmUsXG4gICAgICAgIC8vIHNvIHRoYXQgd2UgY29ycmVjdGx5IHBvcHVsYXRlIGRpc2Nvbm5lY3RlZCBub2Rlcy5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBub2RlT3JOb2Rlcy5jYXNlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGNvbGxlY3RJMThuTm9kZXNGcm9tRG9tKFxuICAgICAgICAgICAgY29udGV4dCxcbiAgICAgICAgICAgIGkgPT09IHNlbGVjdGVkQ2FzZSA/IHN0YXRlIDogY2hpbGRTdGF0ZSxcbiAgICAgICAgICAgIG5vZGVPck5vZGVzLmNhc2VzW2ldLFxuICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2VsZWN0ZWRDYXNlICE9PSBudWxsKSB7XG4gICAgICAgICAgLy8gSUNVcyByZXByZXNlbnQgYSBicmFuY2hpbmcgc3RhdGUsIGFuZCB0aGUgc2VsZWN0ZWQgY2FzZSBjb3VsZCBiZSBkaWZmZXJlbnRcbiAgICAgICAgICAvLyB0aGFuIHdoYXQgaXQgd2FzIG9uIHRoZSBzZXJ2ZXIuIEluIHRoYXQgY2FzZSwgd2UgbmVlZCB0byBiZSBhYmxlIHRvIGNsZWFuXG4gICAgICAgICAgLy8gdXAgdGhlIG5vZGVzIGZyb20gdGhlIG9yaWdpbmFsIGNhc2UuIFRvIGRvIHRoYXQsIHdlIHN0b3JlIHRoZSBzZWxlY3RlZCBjYXNlLlxuICAgICAgICAgIGNvbnRleHQuZGVoeWRyYXRlZEljdURhdGEuc2V0KG5vZGVPck5vZGVzLmluZGV4LCB7Y2FzZTogc2VsZWN0ZWRDYXNlLCBub2RlOiBub2RlT3JOb2Rlc30pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSHlkcmF0aW9uIGV4cGVjdHMgdG8gZmluZCB0aGUgSUNVIGFuY2hvciBlbGVtZW50LlxuICAgICAgICBjb25zdCBjdXJyZW50Tm9kZSA9IGFwcGVuZEkxOG5Ob2RlVG9Db2xsZWN0aW9uKGNvbnRleHQsIHN0YXRlLCBub2RlT3JOb2Rlcyk7XG4gICAgICAgIHNldEN1cnJlbnROb2RlKHN0YXRlLCBjdXJyZW50Tm9kZT8ubmV4dFNpYmxpbmcgPz8gbnVsbCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5sZXQgX2NsYWltRGVoeWRyYXRlZEljdUNhc2VJbXBsOiB0eXBlb2YgY2xhaW1EZWh5ZHJhdGVkSWN1Q2FzZUltcGwgPSAoKSA9PiB7XG4gIC8vIG5vb3AgdW5sZXNzIGBlbmFibGVDbGFpbURlaHlkcmF0ZWRJY3VDYXNlSW1wbGAgaXMgaW52b2tlZFxufTtcblxuLyoqXG4gKiBNYXJrIHRoZSBjYXNlIGZvciB0aGUgSUNVIG5vZGUgYXQgdGhlIGdpdmVuIGluZGV4IGluIHRoZSB2aWV3IGFzIGNsYWltZWQsXG4gKiBhbGxvd2luZyBpdHMgbm9kZXMgdG8gYmUgaHlkcmF0ZWQgYW5kIG5vdCBjbGVhbmVkIHVwLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY2xhaW1EZWh5ZHJhdGVkSWN1Q2FzZShsVmlldzogTFZpZXcsIGljdUluZGV4OiBudW1iZXIsIGNhc2VJbmRleDogbnVtYmVyKSB7XG4gIF9jbGFpbURlaHlkcmF0ZWRJY3VDYXNlSW1wbChsVmlldywgaWN1SW5kZXgsIGNhc2VJbmRleCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlbmFibGVDbGFpbURlaHlkcmF0ZWRJY3VDYXNlSW1wbCgpIHtcbiAgX2NsYWltRGVoeWRyYXRlZEljdUNhc2VJbXBsID0gY2xhaW1EZWh5ZHJhdGVkSWN1Q2FzZUltcGw7XG59XG5cbmZ1bmN0aW9uIGNsYWltRGVoeWRyYXRlZEljdUNhc2VJbXBsKGxWaWV3OiBMVmlldywgaWN1SW5kZXg6IG51bWJlciwgY2FzZUluZGV4OiBudW1iZXIpIHtcbiAgY29uc3QgZGVoeWRyYXRlZEljdURhdGFNYXAgPSBsVmlld1tIWURSQVRJT05dPy5kZWh5ZHJhdGVkSWN1RGF0YTtcbiAgaWYgKGRlaHlkcmF0ZWRJY3VEYXRhTWFwKSB7XG4gICAgY29uc3QgZGVoeWRyYXRlZEljdURhdGEgPSBkZWh5ZHJhdGVkSWN1RGF0YU1hcC5nZXQoaWN1SW5kZXgpO1xuICAgIGlmIChkZWh5ZHJhdGVkSWN1RGF0YT8uY2FzZSA9PT0gY2FzZUluZGV4KSB7XG4gICAgICAvLyBJZiB0aGUgY2FzZSB3ZSdyZSBhdHRlbXB0aW5nIHRvIGNsYWltIG1hdGNoZXMgdGhlIGRlaHlkcmF0ZWQgb25lLFxuICAgICAgLy8gd2UgcmVtb3ZlIGl0IGZyb20gdGhlIG1hcCB0byBtYXJrIGl0IGFzIFwiY2xhaW1lZC5cIlxuICAgICAgZGVoeWRyYXRlZEljdURhdGFNYXAuZGVsZXRlKGljdUluZGV4KTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBDbGVhbiB1cCBhbGwgaTE4biBoeWRyYXRpb24gZGF0YSBhc3NvY2lhdGVkIHdpdGggdGhlIGdpdmVuIHZpZXcuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbGVhbnVwSTE4bkh5ZHJhdGlvbkRhdGEobFZpZXc6IExWaWV3KSB7XG4gIGNvbnN0IGh5ZHJhdGlvbkluZm8gPSBsVmlld1tIWURSQVRJT05dO1xuICBpZiAoaHlkcmF0aW9uSW5mbykge1xuICAgIGNvbnN0IHtpMThuTm9kZXMsIGRlaHlkcmF0ZWRJY3VEYXRhOiBkZWh5ZHJhdGVkSWN1RGF0YU1hcH0gPSBoeWRyYXRpb25JbmZvO1xuICAgIGlmIChpMThuTm9kZXMgJiYgZGVoeWRyYXRlZEljdURhdGFNYXApIHtcbiAgICAgIGNvbnN0IHJlbmRlcmVyID0gbFZpZXdbUkVOREVSRVJdO1xuICAgICAgZm9yIChjb25zdCBkZWh5ZHJhdGVkSWN1RGF0YSBvZiBkZWh5ZHJhdGVkSWN1RGF0YU1hcC52YWx1ZXMoKSkge1xuICAgICAgICBjbGVhbnVwRGVoeWRyYXRlZEljdURhdGEocmVuZGVyZXIsIGkxOG5Ob2RlcywgZGVoeWRyYXRlZEljdURhdGEpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGh5ZHJhdGlvbkluZm8uaTE4bk5vZGVzID0gdW5kZWZpbmVkO1xuICAgIGh5ZHJhdGlvbkluZm8uZGVoeWRyYXRlZEljdURhdGEgPSB1bmRlZmluZWQ7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2xlYW51cERlaHlkcmF0ZWRJY3VEYXRhKFxuICByZW5kZXJlcjogUmVuZGVyZXIsXG4gIGkxOG5Ob2RlczogTWFwPG51bWJlciwgUk5vZGUgfCBudWxsPixcbiAgZGVoeWRyYXRlZEljdURhdGE6IERlaHlkcmF0ZWRJY3VEYXRhLFxuKSB7XG4gIGZvciAoY29uc3Qgbm9kZSBvZiBkZWh5ZHJhdGVkSWN1RGF0YS5ub2RlLmNhc2VzW2RlaHlkcmF0ZWRJY3VEYXRhLmNhc2VdKSB7XG4gICAgY29uc3Qgck5vZGUgPSBpMThuTm9kZXMuZ2V0KG5vZGUuaW5kZXggLSBIRUFERVJfT0ZGU0VUKTtcbiAgICBpZiAock5vZGUpIHtcbiAgICAgIG5hdGl2ZVJlbW92ZU5vZGUocmVuZGVyZXIsIHJOb2RlLCBmYWxzZSk7XG4gICAgfVxuICB9XG59XG4iXX0=