/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { RuntimeError } from '../../errors';
import { claimDehydratedIcuCase, isI18nHydrationSupportEnabled } from '../../hydration/i18n';
import { locateI18nRNodeByIndex } from '../../hydration/node_lookup_utils';
import { isDisconnectedNode, markRNodeAsClaimedByHydration } from '../../hydration/utils';
import { getPluralCase } from '../../i18n/localization';
import { assertDefined, assertDomNode, assertEqual, assertGreaterThan, assertIndexInRange, throwError, } from '../../util/assert';
import { assertIndexInExpandoRange, assertTIcu } from '../assert';
import { attachPatchData } from '../context_discovery';
import { elementPropertyInternal, setElementAttribute } from '../instructions/shared';
import { ELEMENT_MARKER, I18nCreateOpCode, ICU_MARKER, } from '../interfaces/i18n';
import { HEADER_OFFSET, HYDRATION, RENDERER } from '../interfaces/view';
import { createCommentNode, createElementNode, createTextNode, nativeInsertBefore, nativeParentNode, nativeRemoveNode, updateTextNode, } from '../node_manipulation';
import { getBindingIndex, isInSkipHydrationBlock, lastNodeWasCreated, wasLastNodeCreated, } from '../state';
import { renderStringify } from '../util/stringify_utils';
import { getNativeByIndex, unwrapRNode } from '../util/view_utils';
import { getLocaleId } from './i18n_locale_id';
import { getCurrentICUCaseIndex, getParentFromIcuCreateOpCode, getRefFromIcuCreateOpCode, getTIcu, } from './i18n_util';
/**
 * Keep track of which input bindings in `ɵɵi18nExp` have changed.
 *
 * This is used to efficiently update expressions in i18n only when the corresponding input has
 * changed.
 *
 * 1) Each bit represents which of the `ɵɵi18nExp` has changed.
 * 2) There are 32 bits allowed in JS.
 * 3) Bit 32 is special as it is shared for all changes past 32. (In other words if you have more
 * than 32 `ɵɵi18nExp` then all changes past 32nd `ɵɵi18nExp` will be mapped to same bit. This means
 * that we may end up changing more than we need to. But i18n expressions with 32 bindings is rare
 * so in practice it should not be an issue.)
 */
let changeMask = 0b0;
/**
 * Keeps track of which bit needs to be updated in `changeMask`
 *
 * This value gets incremented on every call to `ɵɵi18nExp`
 */
let changeMaskCounter = 0;
/**
 * Keep track of which input bindings in `ɵɵi18nExp` have changed.
 *
 * `setMaskBit` gets invoked by each call to `ɵɵi18nExp`.
 *
 * @param hasChange did `ɵɵi18nExp` detect a change.
 */
export function setMaskBit(hasChange) {
    if (hasChange) {
        changeMask = changeMask | (1 << Math.min(changeMaskCounter, 31));
    }
    changeMaskCounter++;
}
export function applyI18n(tView, lView, index) {
    if (changeMaskCounter > 0) {
        ngDevMode && assertDefined(tView, `tView should be defined`);
        const tI18n = tView.data[index];
        // When `index` points to an `ɵɵi18nAttributes` then we have an array otherwise `TI18n`
        const updateOpCodes = Array.isArray(tI18n)
            ? tI18n
            : tI18n.update;
        const bindingsStartIndex = getBindingIndex() - changeMaskCounter - 1;
        applyUpdateOpCodes(tView, lView, updateOpCodes, bindingsStartIndex, changeMask);
    }
    // Reset changeMask & maskBit to default for the next update cycle
    changeMask = 0b0;
    changeMaskCounter = 0;
}
function createNodeWithoutHydration(lView, textOrName, nodeType) {
    const renderer = lView[RENDERER];
    switch (nodeType) {
        case Node.COMMENT_NODE:
            return createCommentNode(renderer, textOrName);
        case Node.TEXT_NODE:
            return createTextNode(renderer, textOrName);
        case Node.ELEMENT_NODE:
            return createElementNode(renderer, textOrName, null);
    }
}
let _locateOrCreateNode = (lView, index, textOrName, nodeType) => {
    lastNodeWasCreated(true);
    return createNodeWithoutHydration(lView, textOrName, nodeType);
};
function locateOrCreateNodeImpl(lView, index, textOrName, nodeType) {
    const hydrationInfo = lView[HYDRATION];
    const noOffsetIndex = index - HEADER_OFFSET;
    const isNodeCreationMode = !isI18nHydrationSupportEnabled() ||
        !hydrationInfo ||
        isInSkipHydrationBlock() ||
        isDisconnectedNode(hydrationInfo, noOffsetIndex);
    lastNodeWasCreated(isNodeCreationMode);
    if (isNodeCreationMode) {
        return createNodeWithoutHydration(lView, textOrName, nodeType);
    }
    const native = locateI18nRNodeByIndex(hydrationInfo, noOffsetIndex);
    // TODO: Improve error handling
    //
    // Other hydration paths use validateMatchingNode() in order to provide
    // detailed information in development mode about the expected DOM.
    // However, not every node in an i18n block has a TNode. Instead, we
    // need to be able to use the AST to generate a similar message.
    ngDevMode && assertDefined(native, 'expected native element');
    ngDevMode && assertEqual(native.nodeType, nodeType, 'expected matching nodeType');
    ngDevMode &&
        nodeType === Node.ELEMENT_NODE &&
        assertEqual(native.tagName.toLowerCase(), textOrName.toLowerCase(), 'expecting matching tagName');
    ngDevMode && markRNodeAsClaimedByHydration(native);
    return native;
}
export function enableLocateOrCreateI18nNodeImpl() {
    _locateOrCreateNode = locateOrCreateNodeImpl;
}
/**
 * Apply `I18nCreateOpCodes` op-codes as stored in `TI18n.create`.
 *
 * Creates text (and comment) nodes which are internationalized.
 *
 * @param lView Current lView
 * @param createOpCodes Set of op-codes to apply
 * @param parentRNode Parent node (so that direct children can be added eagerly) or `null` if it is
 *     a root node.
 * @param insertInFrontOf DOM node that should be used as an anchor.
 */
export function applyCreateOpCodes(lView, createOpCodes, parentRNode, insertInFrontOf) {
    const renderer = lView[RENDERER];
    for (let i = 0; i < createOpCodes.length; i++) {
        const opCode = createOpCodes[i++];
        const text = createOpCodes[i];
        const isComment = (opCode & I18nCreateOpCode.COMMENT) === I18nCreateOpCode.COMMENT;
        const appendNow = (opCode & I18nCreateOpCode.APPEND_EAGERLY) === I18nCreateOpCode.APPEND_EAGERLY;
        const index = opCode >>> I18nCreateOpCode.SHIFT;
        let rNode = lView[index];
        let lastNodeWasCreated = false;
        if (rNode === null) {
            // We only create new DOM nodes if they don't already exist: If ICU switches case back to a
            // case which was already instantiated, no need to create new DOM nodes.
            rNode = lView[index] = _locateOrCreateNode(lView, index, text, isComment ? Node.COMMENT_NODE : Node.TEXT_NODE);
            lastNodeWasCreated = wasLastNodeCreated();
        }
        if (appendNow && parentRNode !== null && lastNodeWasCreated) {
            nativeInsertBefore(renderer, parentRNode, rNode, insertInFrontOf, false);
        }
    }
}
/**
 * Apply `I18nMutateOpCodes` OpCodes.
 *
 * @param tView Current `TView`
 * @param mutableOpCodes Mutable OpCodes to process
 * @param lView Current `LView`
 * @param anchorRNode place where the i18n node should be inserted.
 */
export function applyMutableOpCodes(tView, mutableOpCodes, lView, anchorRNode) {
    ngDevMode && assertDomNode(anchorRNode);
    const renderer = lView[RENDERER];
    // `rootIdx` represents the node into which all inserts happen.
    let rootIdx = null;
    // `rootRNode` represents the real node into which we insert. This can be different from
    // `lView[rootIdx]` if we have projection.
    //  - null we don't have a parent (as can be the case in when we are inserting into a root of
    //    LView which has no parent.)
    //  - `RElement` The element representing the root after taking projection into account.
    let rootRNode;
    for (let i = 0; i < mutableOpCodes.length; i++) {
        const opCode = mutableOpCodes[i];
        if (typeof opCode == 'string') {
            const textNodeIndex = mutableOpCodes[++i];
            if (lView[textNodeIndex] === null) {
                ngDevMode && ngDevMode.rendererCreateTextNode++;
                ngDevMode && assertIndexInRange(lView, textNodeIndex);
                lView[textNodeIndex] = _locateOrCreateNode(lView, textNodeIndex, opCode, Node.TEXT_NODE);
            }
        }
        else if (typeof opCode == 'number') {
            switch (opCode & 1 /* IcuCreateOpCode.MASK_INSTRUCTION */) {
                case 0 /* IcuCreateOpCode.AppendChild */:
                    const parentIdx = getParentFromIcuCreateOpCode(opCode);
                    if (rootIdx === null) {
                        // The first operation should save the `rootIdx` because the first operation
                        // must insert into the root. (Only subsequent operations can insert into a dynamic
                        // parent)
                        rootIdx = parentIdx;
                        rootRNode = nativeParentNode(renderer, anchorRNode);
                    }
                    let insertInFrontOf;
                    let parentRNode;
                    if (parentIdx === rootIdx) {
                        insertInFrontOf = anchorRNode;
                        parentRNode = rootRNode;
                    }
                    else {
                        insertInFrontOf = null;
                        parentRNode = unwrapRNode(lView[parentIdx]);
                    }
                    // FIXME(misko): Refactor with `processI18nText`
                    if (parentRNode !== null) {
                        // This can happen if the `LView` we are adding to is not attached to a parent `LView`.
                        // In such a case there is no "root" we can attach to. This is fine, as we still need to
                        // create the elements. When the `LView` gets later added to a parent these "root" nodes
                        // get picked up and added.
                        ngDevMode && assertDomNode(parentRNode);
                        const refIdx = getRefFromIcuCreateOpCode(opCode);
                        ngDevMode && assertGreaterThan(refIdx, HEADER_OFFSET, 'Missing ref');
                        // `unwrapRNode` is not needed here as all of these point to RNodes as part of the i18n
                        // which can't have components.
                        const child = lView[refIdx];
                        ngDevMode && assertDomNode(child);
                        nativeInsertBefore(renderer, parentRNode, child, insertInFrontOf, false);
                        const tIcu = getTIcu(tView, refIdx);
                        if (tIcu !== null && typeof tIcu === 'object') {
                            // If we just added a comment node which has ICU then that ICU may have already been
                            // rendered and therefore we need to re-add it here.
                            ngDevMode && assertTIcu(tIcu);
                            const caseIndex = getCurrentICUCaseIndex(tIcu, lView);
                            if (caseIndex !== null) {
                                applyMutableOpCodes(tView, tIcu.create[caseIndex], lView, lView[tIcu.anchorIdx]);
                            }
                        }
                    }
                    break;
                case 1 /* IcuCreateOpCode.Attr */:
                    const elementNodeIndex = opCode >>> 1 /* IcuCreateOpCode.SHIFT_REF */;
                    const attrName = mutableOpCodes[++i];
                    const attrValue = mutableOpCodes[++i];
                    // This code is used for ICU expressions only, since we don't support
                    // directives/components in ICUs, we don't need to worry about inputs here
                    setElementAttribute(renderer, getNativeByIndex(elementNodeIndex, lView), null, null, attrName, attrValue, null);
                    break;
                default:
                    if (ngDevMode) {
                        throw new RuntimeError(700 /* RuntimeErrorCode.INVALID_I18N_STRUCTURE */, `Unable to determine the type of mutate operation for "${opCode}"`);
                    }
            }
        }
        else {
            switch (opCode) {
                case ICU_MARKER:
                    const commentValue = mutableOpCodes[++i];
                    const commentNodeIndex = mutableOpCodes[++i];
                    if (lView[commentNodeIndex] === null) {
                        ngDevMode &&
                            assertEqual(typeof commentValue, 'string', `Expected "${commentValue}" to be a comment node value`);
                        ngDevMode && ngDevMode.rendererCreateComment++;
                        ngDevMode && assertIndexInExpandoRange(lView, commentNodeIndex);
                        const commentRNode = (lView[commentNodeIndex] = _locateOrCreateNode(lView, commentNodeIndex, commentValue, Node.COMMENT_NODE));
                        // FIXME(misko): Attaching patch data is only needed for the root (Also add tests)
                        attachPatchData(commentRNode, lView);
                    }
                    break;
                case ELEMENT_MARKER:
                    const tagName = mutableOpCodes[++i];
                    const elementNodeIndex = mutableOpCodes[++i];
                    if (lView[elementNodeIndex] === null) {
                        ngDevMode &&
                            assertEqual(typeof tagName, 'string', `Expected "${tagName}" to be an element node tag name`);
                        ngDevMode && ngDevMode.rendererCreateElement++;
                        ngDevMode && assertIndexInExpandoRange(lView, elementNodeIndex);
                        const elementRNode = (lView[elementNodeIndex] = _locateOrCreateNode(lView, elementNodeIndex, tagName, Node.ELEMENT_NODE));
                        // FIXME(misko): Attaching patch data is only needed for the root (Also add tests)
                        attachPatchData(elementRNode, lView);
                    }
                    break;
                default:
                    ngDevMode &&
                        throwError(`Unable to determine the type of mutate operation for "${opCode}"`);
            }
        }
    }
}
/**
 * Apply `I18nUpdateOpCodes` OpCodes
 *
 * @param tView Current `TView`
 * @param lView Current `LView`
 * @param updateOpCodes OpCodes to process
 * @param bindingsStartIndex Location of the first `ɵɵi18nApply`
 * @param changeMask Each bit corresponds to a `ɵɵi18nExp` (Counting backwards from
 *     `bindingsStartIndex`)
 */
export function applyUpdateOpCodes(tView, lView, updateOpCodes, bindingsStartIndex, changeMask) {
    for (let i = 0; i < updateOpCodes.length; i++) {
        // bit code to check if we should apply the next update
        const checkBit = updateOpCodes[i];
        // Number of opCodes to skip until next set of update codes
        const skipCodes = updateOpCodes[++i];
        if (checkBit & changeMask) {
            // The value has been updated since last checked
            let value = '';
            for (let j = i + 1; j <= i + skipCodes; j++) {
                const opCode = updateOpCodes[j];
                if (typeof opCode == 'string') {
                    value += opCode;
                }
                else if (typeof opCode == 'number') {
                    if (opCode < 0) {
                        // Negative opCode represent `i18nExp` values offset.
                        value += renderStringify(lView[bindingsStartIndex - opCode]);
                    }
                    else {
                        const nodeIndex = opCode >>> 2 /* I18nUpdateOpCode.SHIFT_REF */;
                        switch (opCode & 3 /* I18nUpdateOpCode.MASK_OPCODE */) {
                            case 1 /* I18nUpdateOpCode.Attr */:
                                const propName = updateOpCodes[++j];
                                const sanitizeFn = updateOpCodes[++j];
                                const tNodeOrTagName = tView.data[nodeIndex];
                                ngDevMode && assertDefined(tNodeOrTagName, 'Experting TNode or string');
                                if (typeof tNodeOrTagName === 'string') {
                                    // IF we don't have a `TNode`, then we are an element in ICU (as ICU content does
                                    // not have TNode), in which case we know that there are no directives, and hence
                                    // we use attribute setting.
                                    setElementAttribute(lView[RENDERER], lView[nodeIndex], null, tNodeOrTagName, propName, value, sanitizeFn);
                                }
                                else {
                                    elementPropertyInternal(tView, tNodeOrTagName, lView, propName, value, lView[RENDERER], sanitizeFn, false);
                                }
                                break;
                            case 0 /* I18nUpdateOpCode.Text */:
                                const rText = lView[nodeIndex];
                                rText !== null && updateTextNode(lView[RENDERER], rText, value);
                                break;
                            case 2 /* I18nUpdateOpCode.IcuSwitch */:
                                applyIcuSwitchCase(tView, getTIcu(tView, nodeIndex), lView, value);
                                break;
                            case 3 /* I18nUpdateOpCode.IcuUpdate */:
                                applyIcuUpdateCase(tView, getTIcu(tView, nodeIndex), bindingsStartIndex, lView);
                                break;
                        }
                    }
                }
            }
        }
        else {
            const opCode = updateOpCodes[i + 1];
            if (opCode > 0 && (opCode & 3 /* I18nUpdateOpCode.MASK_OPCODE */) === 3 /* I18nUpdateOpCode.IcuUpdate */) {
                // Special case for the `icuUpdateCase`. It could be that the mask did not match, but
                // we still need to execute `icuUpdateCase` because the case has changed recently due to
                // previous `icuSwitchCase` instruction. (`icuSwitchCase` and `icuUpdateCase` always come in
                // pairs.)
                const nodeIndex = opCode >>> 2 /* I18nUpdateOpCode.SHIFT_REF */;
                const tIcu = getTIcu(tView, nodeIndex);
                const currentIndex = lView[tIcu.currentCaseLViewIndex];
                if (currentIndex < 0) {
                    applyIcuUpdateCase(tView, tIcu, bindingsStartIndex, lView);
                }
            }
        }
        i += skipCodes;
    }
}
/**
 * Apply OpCodes associated with updating an existing ICU.
 *
 * @param tView Current `TView`
 * @param tIcu Current `TIcu`
 * @param bindingsStartIndex Location of the first `ɵɵi18nApply`
 * @param lView Current `LView`
 */
function applyIcuUpdateCase(tView, tIcu, bindingsStartIndex, lView) {
    ngDevMode && assertIndexInRange(lView, tIcu.currentCaseLViewIndex);
    let activeCaseIndex = lView[tIcu.currentCaseLViewIndex];
    if (activeCaseIndex !== null) {
        let mask = changeMask;
        if (activeCaseIndex < 0) {
            // Clear the flag.
            // Negative number means that the ICU was freshly created and we need to force the update.
            activeCaseIndex = lView[tIcu.currentCaseLViewIndex] = ~activeCaseIndex;
            // -1 is same as all bits on, which simulates creation since it marks all bits dirty
            mask = -1;
        }
        applyUpdateOpCodes(tView, lView, tIcu.update[activeCaseIndex], bindingsStartIndex, mask);
    }
}
/**
 * Apply OpCodes associated with switching a case on ICU.
 *
 * This involves tearing down existing case and than building up a new case.
 *
 * @param tView Current `TView`
 * @param tIcu Current `TIcu`
 * @param lView Current `LView`
 * @param value Value of the case to update to.
 */
function applyIcuSwitchCase(tView, tIcu, lView, value) {
    // Rebuild a new case for this ICU
    const caseIndex = getCaseIndex(tIcu, value);
    let activeCaseIndex = getCurrentICUCaseIndex(tIcu, lView);
    if (activeCaseIndex !== caseIndex) {
        applyIcuSwitchCaseRemove(tView, tIcu, lView);
        lView[tIcu.currentCaseLViewIndex] = caseIndex === null ? null : ~caseIndex;
        if (caseIndex !== null) {
            // Add the nodes for the new case
            const anchorRNode = lView[tIcu.anchorIdx];
            if (anchorRNode) {
                ngDevMode && assertDomNode(anchorRNode);
                applyMutableOpCodes(tView, tIcu.create[caseIndex], lView, anchorRNode);
            }
            claimDehydratedIcuCase(lView, tIcu.anchorIdx, caseIndex);
        }
    }
}
/**
 * Apply OpCodes associated with tearing ICU case.
 *
 * This involves tearing down existing case and than building up a new case.
 *
 * @param tView Current `TView`
 * @param tIcu Current `TIcu`
 * @param lView Current `LView`
 */
function applyIcuSwitchCaseRemove(tView, tIcu, lView) {
    let activeCaseIndex = getCurrentICUCaseIndex(tIcu, lView);
    if (activeCaseIndex !== null) {
        const removeCodes = tIcu.remove[activeCaseIndex];
        for (let i = 0; i < removeCodes.length; i++) {
            const nodeOrIcuIndex = removeCodes[i];
            if (nodeOrIcuIndex > 0) {
                // Positive numbers are `RNode`s.
                const rNode = getNativeByIndex(nodeOrIcuIndex, lView);
                rNode !== null && nativeRemoveNode(lView[RENDERER], rNode);
            }
            else {
                // Negative numbers are ICUs
                applyIcuSwitchCaseRemove(tView, getTIcu(tView, ~nodeOrIcuIndex), lView);
            }
        }
    }
}
/**
 * Returns the index of the current case of an ICU expression depending on the main binding value
 *
 * @param icuExpression
 * @param bindingValue The value of the main binding used by this ICU expression
 */
function getCaseIndex(icuExpression, bindingValue) {
    let index = icuExpression.cases.indexOf(bindingValue);
    if (index === -1) {
        switch (icuExpression.type) {
            case 1 /* IcuType.plural */: {
                const resolvedCase = getPluralCase(bindingValue, getLocaleId());
                index = icuExpression.cases.indexOf(resolvedCase);
                if (index === -1 && resolvedCase !== 'other') {
                    index = icuExpression.cases.indexOf('other');
                }
                break;
            }
            case 0 /* IcuType.select */: {
                index = icuExpression.cases.indexOf('other');
                break;
            }
        }
    }
    return index === -1 ? null : index;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaTE4bl9hcHBseS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL3JlbmRlcjMvaTE4bi9pMThuX2FwcGx5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxZQUFZLEVBQW1CLE1BQU0sY0FBYyxDQUFDO0FBQzVELE9BQU8sRUFBQyxzQkFBc0IsRUFBRSw2QkFBNkIsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQzNGLE9BQU8sRUFBQyxzQkFBc0IsRUFBQyxNQUFNLG1DQUFtQyxDQUFDO0FBQ3pFLE9BQU8sRUFBQyxrQkFBa0IsRUFBRSw2QkFBNkIsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQ3hGLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSx5QkFBeUIsQ0FBQztBQUN0RCxPQUFPLEVBQ0wsYUFBYSxFQUNiLGFBQWEsRUFDYixXQUFXLEVBQ1gsaUJBQWlCLEVBQ2pCLGtCQUFrQixFQUNsQixVQUFVLEdBQ1gsTUFBTSxtQkFBbUIsQ0FBQztBQUMzQixPQUFPLEVBQUMseUJBQXlCLEVBQUUsVUFBVSxFQUFDLE1BQU0sV0FBVyxDQUFDO0FBQ2hFLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUNyRCxPQUFPLEVBQUMsdUJBQXVCLEVBQUUsbUJBQW1CLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUNwRixPQUFPLEVBQ0wsY0FBYyxFQUNkLGdCQUFnQixFQUloQixVQUFVLEdBTVgsTUFBTSxvQkFBb0IsQ0FBQztBQUk1QixPQUFPLEVBQUMsYUFBYSxFQUFFLFNBQVMsRUFBUyxRQUFRLEVBQVEsTUFBTSxvQkFBb0IsQ0FBQztBQUNwRixPQUFPLEVBQ0wsaUJBQWlCLEVBQ2pCLGlCQUFpQixFQUNqQixjQUFjLEVBQ2Qsa0JBQWtCLEVBQ2xCLGdCQUFnQixFQUNoQixnQkFBZ0IsRUFDaEIsY0FBYyxHQUNmLE1B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QUNwQixLQUFLLEdBQUcsYUFBYSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQzdDLE1BQU07WUFDUixDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7SUFDRCxPQUFPLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7QUFDckMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtSdW50aW1lRXJyb3IsIFJ1bnRpbWVFcnJvckNvZGV9IGZyb20gJy4uLy4uL2Vycm9ycyc7XG5pbXBvcnQge2NsYWltRGVoeWRyYXRlZEljdUNhc2UsIGlzSTE4bkh5ZHJhdGlvblN1cHBvcnRFbmFibGVkfSBmcm9tICcuLi8uLi9oeWRyYXRpb24vaTE4bic7XG5pbXBvcnQge2xvY2F0ZUkxOG5STm9kZUJ5SW5kZXh9IGZyb20gJy4uLy4uL2h5ZHJhdGlvbi9ub2RlX2xvb2t1cF91dGlscyc7XG5pbXBvcnQge2lzRGlzY29ubmVjdGVkTm9kZSwgbWFya1JOb2RlQXNDbGFpbWVkQnlIeWRyYXRpb259IGZyb20gJy4uLy4uL2h5ZHJhdGlvbi91dGlscyc7XG5pbXBvcnQge2dldFBsdXJhbENhc2V9IGZyb20gJy4uLy4uL2kxOG4vbG9jYWxpemF0aW9uJztcbmltcG9ydCB7XG4gIGFzc2VydERlZmluZWQsXG4gIGFzc2VydERvbU5vZGUsXG4gIGFzc2VydEVxdWFsLFxuICBhc3NlcnRHcmVhdGVyVGhhbixcbiAgYXNzZXJ0SW5kZXhJblJhbmdlLFxuICB0aHJvd0Vycm9yLFxufSBmcm9tICcuLi8uLi91dGlsL2Fzc2VydCc7XG5pbXBvcnQge2Fzc2VydEluZGV4SW5FeHBhbmRvUmFuZ2UsIGFzc2VydFRJY3V9IGZyb20gJy4uL2Fzc2VydCc7XG5pbXBvcnQge2F0dGFjaFBhdGNoRGF0YX0gZnJvbSAnLi4vY29udGV4dF9kaXNjb3ZlcnknO1xuaW1wb3J0IHtlbGVtZW50UHJvcGVydHlJbnRlcm5hbCwgc2V0RWxlbWVudEF0dHJpYnV0ZX0gZnJvbSAnLi4vaW5zdHJ1Y3Rpb25zL3NoYXJlZCc7XG5pbXBvcnQge1xuICBFTEVNRU5UX01BUktFUixcbiAgSTE4bkNyZWF0ZU9wQ29kZSxcbiAgSTE4bkNyZWF0ZU9wQ29kZXMsXG4gIEkxOG5VcGRhdGVPcENvZGUsXG4gIEkxOG5VcGRhdGVPcENvZGVzLFxuICBJQ1VfTUFSS0VSLFxuICBJY3VDcmVhdGVPcENvZGUsXG4gIEljdUNyZWF0ZU9wQ29kZXMsXG4gIEljdVR5cGUsXG4gIFRJMThuLFxuICBUSWN1LFxufSBmcm9tICcuLi9pbnRlcmZhY2VzL2kxOG4nO1xuaW1wb3J0IHtUTm9kZX0gZnJvbSAnLi4vaW50ZXJmYWNlcy9ub2RlJztcbmltcG9ydCB7UkVsZW1lbnQsIFJOb2RlLCBSVGV4dH0gZnJvbSAnLi4vaW50ZXJmYWNlcy9yZW5kZXJlcl9kb20nO1xuaW1wb3J0IHtTYW5pdGl6ZXJGbn0gZnJvbSAnLi4vaW50ZXJmYWNlcy9zYW5pdGl6YXRpb24nO1xuaW1wb3J0IHtIRUFERVJfT0ZGU0VULCBIWURSQVRJT04sIExWaWV3LCBSRU5ERVJFUiwgVFZpZXd9IGZyb20gJy4uL2ludGVyZmFjZXMvdmlldyc7XG5pbXBvcnQge1xuICBjcmVhdGVDb21tZW50Tm9kZSxcbiAgY3JlYXRlRWxlbWVudE5vZGUsXG4gIGNyZWF0ZVRleHROb2RlLFxuICBuYXRpdmVJbnNlcnRCZWZvcmUsXG4gIG5hdGl2ZVBhcmVudE5vZGUsXG4gIG5hdGl2ZVJlbW92ZU5vZGUsXG4gIHVwZGF0ZVRleHROb2RlLFxufSBmcm9tICcuLi9ub2RlX21hbmlwdWxhdGlvbic7XG5pbXBvcnQge1xuICBnZXRCaW5kaW5nSW5kZXgsXG4gIGlzSW5Ta2lwSHlkcmF0aW9uQmxvY2ssXG4gIGxhc3ROb2RlV2FzQ3JlYXRlZCxcbiAgd2FzTGFzdE5vZGVDcmVhdGVkLFxufSBmcm9tICcuLi9zdGF0ZSc7XG5pbXBvcnQge3JlbmRlclN0cmluZ2lmeX0gZnJvbSAnLi4vdXRpbC9zdHJpbmdpZnlfdXRpbHMnO1xuaW1wb3J0IHtnZXROYXRpdmVCeUluZGV4LCB1bndyYXBSTm9kZX0gZnJvbSAnLi4vdXRpbC92aWV3X3V0aWxzJztcblxuaW1wb3J0IHtnZXRMb2NhbGVJZH0gZnJvbSAnLi9pMThuX2xvY2FsZV9pZCc7XG5pbXBvcnQge1xuICBnZXRDdXJyZW50SUNVQ2FzZUluZGV4LFxuICBnZXRQYXJlbnRGcm9tSWN1Q3JlYXRlT3BDb2RlLFxuICBnZXRSZWZGcm9tSWN1Q3JlYXRlT3BDb2RlLFxuICBnZXRUSWN1LFxufSBmcm9tICcuL2kxOG5fdXRpbCc7XG5cbi8qKlxuICogS2VlcCB0cmFjayBvZiB3aGljaCBpbnB1dCBiaW5kaW5ncyBpbiBgybXJtWkxOG5FeHBgIGhhdmUgY2hhbmdlZC5cbiAqXG4gKiBUaGlzIGlzIHVzZWQgdG8gZWZmaWNpZW50bHkgdXBkYXRlIGV4cHJlc3Npb25zIGluIGkxOG4gb25seSB3aGVuIHRoZSBjb3JyZXNwb25kaW5nIGlucHV0IGhhc1xuICogY2hhbmdlZC5cbiAqXG4gKiAxKSBFYWNoIGJpdCByZXByZXNlbnRzIHdoaWNoIG9mIHRoZSBgybXJtWkxOG5FeHBgIGhhcyBjaGFuZ2VkLlxuICogMikgVGhlcmUgYXJlIDMyIGJpdHMgYWxsb3dlZCBpbiBKUy5cbiAqIDMpIEJpdCAzMiBpcyBzcGVjaWFsIGFzIGl0IGlzIHNoYXJlZCBmb3IgYWxsIGNoYW5nZXMgcGFzdCAzMi4gKEluIG90aGVyIHdvcmRzIGlmIHlvdSBoYXZlIG1vcmVcbiAqIHRoYW4gMzIgYMm1ybVpMThuRXhwYCB0aGVuIGFsbCBjaGFuZ2VzIHBhc3QgMzJuZCBgybXJtWkxOG5FeHBgIHdpbGwgYmUgbWFwcGVkIHRvIHNhbWUgYml0LiBUaGlzIG1lYW5zXG4gKiB0aGF0IHdlIG1heSBlbmQgdXAgY2hhbmdpbmcgbW9yZSB0aGFuIHdlIG5lZWQgdG8uIEJ1dCBpMThuIGV4cHJlc3Npb25zIHdpdGggMzIgYmluZGluZ3MgaXMgcmFyZVxuICogc28gaW4gcHJhY3RpY2UgaXQgc2hvdWxkIG5vdCBiZSBhbiBpc3N1ZS4pXG4gKi9cbmxldCBjaGFuZ2VNYXNrID0gMGIwO1xuXG4vKipcbiAqIEtlZXBzIHRyYWNrIG9mIHdoaWNoIGJpdCBuZWVkcyB0byBiZSB1cGRhdGVkIGluIGBjaGFuZ2VNYXNrYFxuICpcbiAqIFRoaXMgdmFsdWUgZ2V0cyBpbmNyZW1lbnRlZCBvbiBldmVyeSBjYWxsIHRvIGDJtcm1aTE4bkV4cGBcbiAqL1xubGV0IGNoYW5nZU1hc2tDb3VudGVyID0gMDtcblxuLyoqXG4gKiBLZWVwIHRyYWNrIG9mIHdoaWNoIGlucHV0IGJpbmRpbmdzIGluIGDJtcm1aTE4bkV4cGAgaGF2ZSBjaGFuZ2VkLlxuICpcbiAqIGBzZXRNYXNrQml0YCBnZXRzIGludm9rZWQgYnkgZWFjaCBjYWxsIHRvIGDJtcm1aTE4bkV4cGAuXG4gKlxuICogQHBhcmFtIGhhc0NoYW5nZSBkaWQgYMm1ybVpMThuRXhwYCBkZXRlY3QgYSBjaGFuZ2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRNYXNrQml0KGhhc0NoYW5nZTogYm9vbGVhbikge1xuICBpZiAoaGFzQ2hhbmdlKSB7XG4gICAgY2hhbmdlTWFzayA9IGNoYW5nZU1hc2sgfCAoMSA8PCBNYXRoLm1pbihjaGFuZ2VNYXNrQ291bnRlciwgMzEpKTtcbiAgfVxuICBjaGFuZ2VNYXNrQ291bnRlcisrO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlJMThuKHRWaWV3OiBUVmlldywgbFZpZXc6IExWaWV3LCBpbmRleDogbnVtYmVyKSB7XG4gIGlmIChjaGFuZ2VNYXNrQ291bnRlciA+IDApIHtcbiAgICBuZ0Rldk1vZGUgJiYgYXNzZXJ0RGVmaW5lZCh0VmlldywgYHRWaWV3IHNob3VsZCBiZSBkZWZpbmVkYCk7XG4gICAgY29uc3QgdEkxOG4gPSB0Vmlldy5kYXRhW2luZGV4XSBhcyBUSTE4biB8IEkxOG5VcGRhdGVPcENvZGVzO1xuICAgIC8vIFdoZW4gYGluZGV4YCBwb2ludHMgdG8gYW4gYMm1ybVpMThuQXR0cmlidXRlc2AgdGhlbiB3ZSBoYXZlIGFuIGFycmF5IG90aGVyd2lzZSBgVEkxOG5gXG4gICAgY29uc3QgdXBkYXRlT3BDb2RlczogSTE4blVwZGF0ZU9wQ29kZXMgPSBBcnJheS5pc0FycmF5KHRJMThuKVxuICAgICAgPyAodEkxOG4gYXMgSTE4blVwZGF0ZU9wQ29kZXMpXG4gICAgICA6ICh0STE4biBhcyBUSTE4bikudXBkYXRlO1xuICAgIGNvbnN0IGJpbmRpbmdzU3RhcnRJbmRleCA9IGdldEJpbmRpbmdJbmRleCgpIC0gY2hhbmdlTWFza0NvdW50ZXIgLSAxO1xuICAgIGFwcGx5VXBkYXRlT3BDb2Rlcyh0VmlldywgbFZpZXcsIHVwZGF0ZU9wQ29kZXMsIGJpbmRpbmdzU3RhcnRJbmRleCwgY2hhbmdlTWFzayk7XG4gIH1cbiAgLy8gUmVzZXQgY2hhbmdlTWFzayAmIG1hc2tCaXQgdG8gZGVmYXVsdCBmb3IgdGhlIG5leHQgdXBkYXRlIGN5Y2xlXG4gIGNoYW5nZU1hc2sgPSAwYjA7XG4gIGNoYW5nZU1hc2tDb3VudGVyID0gMDtcbn1cblxuZnVuY3Rpb24gY3JlYXRlTm9kZVdpdGhvdXRIeWRyYXRpb24oXG4gIGxWaWV3OiBMVmlldyxcbiAgdGV4dE9yTmFtZTogc3RyaW5nLFxuICBub2RlVHlwZTogdHlwZW9mIE5vZGUuQ09NTUVOVF9OT0RFIHwgdHlwZW9mIE5vZGUuVEVYVF9OT0RFIHwgdHlwZW9mIE5vZGUuRUxFTUVOVF9OT0RFLFxuKSB7XG4gIGNvbnN0IHJlbmRlcmVyID0gbFZpZXdbUkVOREVSRVJdO1xuXG4gIHN3aXRjaCAobm9kZVR5cGUpIHtcbiAgICBjYXNlIE5vZGUuQ09NTUVOVF9OT0RFOlxuICAgICAgcmV0dXJuIGNyZWF0ZUNvbW1lbnROb2RlKHJlbmRlcmVyLCB0ZXh0T3JOYW1lKTtcblxuICAgIGNhc2UgTm9kZS5URVhUX05PREU6XG4gICAgICByZXR1cm4gY3JlYXRlVGV4dE5vZGUocmVuZGVyZXIsIHRleHRPck5hbWUpO1xuXG4gICAgY2FzZSBOb2RlLkVMRU1FTlRfTk9ERTpcbiAgICAgIHJldHVybiBjcmVhdGVFbGVtZW50Tm9kZShyZW5kZXJlciwgdGV4dE9yTmFtZSwgbnVsbCk7XG4gIH1cbn1cblxubGV0IF9sb2NhdGVPckNyZWF0ZU5vZGU6IHR5cGVvZiBsb2NhdGVPckNyZWF0ZU5vZGVJbXBsID0gKGxWaWV3LCBpbmRleCwgdGV4dE9yTmFtZSwgbm9kZVR5cGUpID0+IHtcbiAgbGFzdE5vZGVXYXNDcmVhdGVkKHRydWUpO1xuICByZXR1cm4gY3JlYXRlTm9kZVdpdGhvdXRIeWRyYXRpb24obFZpZXcsIHRleHRPck5hbWUsIG5vZGVUeXBlKTtcbn07XG5cbmZ1bmN0aW9uIGxvY2F0ZU9yQ3JlYXRlTm9kZUltcGwoXG4gIGxWaWV3OiBMVmlldyxcbiAgaW5kZXg6IG51bWJlcixcbiAgdGV4dE9yTmFtZTogc3RyaW5nLFxuICBub2RlVHlwZTogdHlwZW9mIE5vZGUuQ09NTUVOVF9OT0RFIHwgdHlwZW9mIE5vZGUuVEVYVF9OT0RFIHwgdHlwZW9mIE5vZGUuRUxFTUVOVF9OT0RFLFxuKSB7XG4gIGNvbnN0IGh5ZHJhdGlvbkluZm8gPSBsVmlld1tIWURSQVRJT05dO1xuICBjb25zdCBub09mZnNldEluZGV4ID0gaW5kZXggLSBIRUFERVJfT0ZGU0VUO1xuICBjb25zdCBpc05vZGVDcmVhdGlvbk1vZGUgPVxuICAgICFpc0kxOG5IeWRyYXRpb25TdXBwb3J0RW5hYmxlZCgpIHx8XG4gICAgIWh5ZHJhdGlvbkluZm8gfHxcbiAgICBpc0luU2tpcEh5ZHJhdGlvbkJsb2NrKCkgfHxcbiAgICBpc0Rpc2Nvbm5lY3RlZE5vZGUoaHlkcmF0aW9uSW5mbywgbm9PZmZzZXRJbmRleCk7XG5cbiAgbGFzdE5vZGVXYXNDcmVhdGVkKGlzTm9kZUNyZWF0aW9uTW9kZSk7XG4gIGlmIChpc05vZGVDcmVhdGlvbk1vZGUpIHtcbiAgICByZXR1cm4gY3JlYXRlTm9kZVdpdGhvdXRIeWRyYXRpb24obFZpZXcsIHRleHRPck5hbWUsIG5vZGVUeXBlKTtcbiAgfVxuXG4gIGNvbnN0IG5hdGl2ZSA9IGxvY2F0ZUkxOG5STm9kZUJ5SW5kZXgoaHlkcmF0aW9uSW5mbyEsIG5vT2Zmc2V0SW5kZXgpIGFzIFJOb2RlO1xuXG4gIC8vIFRPRE86IEltcHJvdmUgZXJyb3IgaGFuZGxpbmdcbiAgLy9cbiAgLy8gT3RoZXIgaHlkcmF0aW9uIHBhdGhzIHVzZSB2YWxpZGF0ZU1hdGNoaW5nTm9kZSgpIGluIG9yZGVyIHRvIHByb3ZpZGVcbiAgLy8gZGV0YWlsZWQgaW5mb3JtYXRpb24gaW4gZGV2ZWxvcG1lbnQgbW9kZSBhYm91dCB0aGUgZXhwZWN0ZWQgRE9NLlxuICAvLyBIb3dldmVyLCBub3QgZXZlcnkgbm9kZSBpbiBhbiBpMThuIGJsb2NrIGhhcyBhIFROb2RlLiBJbnN0ZWFkLCB3ZVxuICAvLyBuZWVkIHRvIGJlIGFibGUgdG8gdXNlIHRoZSBBU1QgdG8gZ2VuZXJhdGUgYSBzaW1pbGFyIG1lc3NhZ2UuXG4gIG5nRGV2TW9kZSAmJiBhc3NlcnREZWZpbmVkKG5hdGl2ZSwgJ2V4cGVjdGVkIG5hdGl2ZSBlbGVtZW50Jyk7XG4gIG5nRGV2TW9kZSAmJiBhc3NlcnRFcXVhbCgobmF0aXZlIGFzIE5vZGUpLm5vZGVUeXBlLCBub2RlVHlwZSwgJ2V4cGVjdGVkIG1hdGNoaW5nIG5vZGVUeXBlJyk7XG4gIG5nRGV2TW9kZSAmJlxuICAgIG5vZGVUeXBlID09PSBOb2RlLkVMRU1FTlRfTk9ERSAmJlxuICAgIGFzc2VydEVxdWFsKFxuICAgICAgKG5hdGl2ZSBhcyBIVE1MRWxlbWVudCkudGFnTmFtZS50b0xvd2VyQ2FzZSgpLFxuICAgICAgdGV4dE9yTmFtZS50b0xvd2VyQ2FzZSgpLFxuICAgICAgJ2V4cGVjdGluZyBtYXRjaGluZyB0YWdOYW1lJyxcbiAgICApO1xuICBuZ0Rldk1vZGUgJiYgbWFya1JOb2RlQXNDbGFpbWVkQnlIeWRyYXRpb24obmF0aXZlKTtcblxuICByZXR1cm4gbmF0aXZlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZW5hYmxlTG9jYXRlT3JDcmVhdGVJMThuTm9kZUltcGwoKSB7XG4gIF9sb2NhdGVPckNyZWF0ZU5vZGUgPSBsb2NhdGVPckNyZWF0ZU5vZGVJbXBsO1xufVxuXG4vKipcbiAqIEFwcGx5IGBJMThuQ3JlYXRlT3BDb2Rlc2Agb3AtY29kZXMgYXMgc3RvcmVkIGluIGBUSTE4bi5jcmVhdGVgLlxuICpcbiAqIENyZWF0ZXMgdGV4dCAoYW5kIGNvbW1lbnQpIG5vZGVzIHdoaWNoIGFyZSBpbnRlcm5hdGlvbmFsaXplZC5cbiAqXG4gKiBAcGFyYW0gbFZpZXcgQ3VycmVudCBsVmlld1xuICogQHBhcmFtIGNyZWF0ZU9wQ29kZXMgU2V0IG9mIG9wLWNvZGVzIHRvIGFwcGx5XG4gKiBAcGFyYW0gcGFyZW50Uk5vZGUgUGFyZW50IG5vZGUgKHNvIHRoYXQgZGlyZWN0IGNoaWxkcmVuIGNhbiBiZSBhZGRlZCBlYWdlcmx5KSBvciBgbnVsbGAgaWYgaXQgaXNcbiAqICAgICBhIHJvb3Qgbm9kZS5cbiAqIEBwYXJhbSBpbnNlcnRJbkZyb250T2YgRE9NIG5vZGUgdGhhdCBzaG91bGQgYmUgdXNlZCBhcyBhbiBhbmNob3IuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhcHBseUNyZWF0ZU9wQ29kZXMoXG4gIGxWaWV3OiBMVmlldyxcbiAgY3JlYXRlT3BDb2RlczogSTE4bkNyZWF0ZU9wQ29kZXMsXG4gIHBhcmVudFJOb2RlOiBSRWxlbWVudCB8IG51bGwsXG4gIGluc2VydEluRnJvbnRPZjogUkVsZW1lbnQgfCBudWxsLFxuKTogdm9pZCB7XG4gIGNvbnN0IHJlbmRlcmVyID0gbFZpZXdbUkVOREVSRVJdO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGNyZWF0ZU9wQ29kZXMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBvcENvZGUgPSBjcmVhdGVPcENvZGVzW2krK10gYXMgYW55O1xuICAgIGNvbnN0IHRleHQgPSBjcmVhdGVPcENvZGVzW2ldIGFzIHN0cmluZztcbiAgICBjb25zdCBpc0NvbW1lbnQgPSAob3BDb2RlICYgSTE4bkNyZWF0ZU9wQ29kZS5DT01NRU5UKSA9PT0gSTE4bkNyZWF0ZU9wQ29kZS5DT01NRU5UO1xuICAgIGNvbnN0IGFwcGVuZE5vdyA9XG4gICAgICAob3BDb2RlICYgSTE4bkNyZWF0ZU9wQ29kZS5BUFBFTkRfRUFHRVJMWSkgPT09IEkxOG5DcmVhdGVPcENvZGUuQVBQRU5EX0VBR0VSTFk7XG4gICAgY29uc3QgaW5kZXggPSBvcENvZGUgPj4+IEkxOG5DcmVhdGVPcENvZGUuU0hJRlQ7XG4gICAgbGV0IHJOb2RlID0gbFZpZXdbaW5kZXhdO1xuICAgIGxldCBsYXN0Tm9kZVdhc0NyZWF0ZWQgPSBmYWxzZTtcbiAgICBpZiAock5vZGUgPT09IG51bGwpIHtcbiAgICAgIC8vIFdlIG9ubHkgY3JlYXRlIG5ldyBET00gbm9kZXMgaWYgdGhleSBkb24ndCBhbHJlYWR5IGV4aXN0OiBJZiBJQ1Ugc3dpdGNoZXMgY2FzZSBiYWNrIHRvIGFcbiAgICAgIC8vIGNhc2Ugd2hpY2ggd2FzIGFscmVhZHkgaW5zdGFudGlhdGVkLCBubyBuZWVkIHRvIGNyZWF0ZSBuZXcgRE9NIG5vZGVzLlxuICAgICAgck5vZGUgPSBsVmlld1tpbmRleF0gPSBfbG9jYXRlT3JDcmVhdGVOb2RlKFxuICAgICAgICBsVmlldyxcbiAgICAgICAgaW5kZXgsXG4gICAgICAgIHRleHQsXG4gICAgICAgIGlzQ29tbWVudCA/IE5vZGUuQ09NTUVOVF9OT0RFIDogTm9kZS5URVhUX05PREUsXG4gICAgICApO1xuICAgICAgbGFzdE5vZGVXYXNDcmVhdGVkID0gd2FzTGFzdE5vZGVDcmVhdGVkKCk7XG4gICAgfVxuICAgIGlmIChhcHBlbmROb3cgJiYgcGFyZW50Uk5vZGUgIT09IG51bGwgJiYgbGFzdE5vZGVXYXNDcmVhdGVkKSB7XG4gICAgICBuYXRpdmVJbnNlcnRCZWZvcmUocmVuZGVyZXIsIHBhcmVudFJOb2RlLCByTm9kZSwgaW5zZXJ0SW5Gcm9udE9mLCBmYWxzZSk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQXBwbHkgYEkxOG5NdXRhdGVPcENvZGVzYCBPcENvZGVzLlxuICpcbiAqIEBwYXJhbSB0VmlldyBDdXJyZW50IGBUVmlld2BcbiAqIEBwYXJhbSBtdXRhYmxlT3BDb2RlcyBNdXRhYmxlIE9wQ29kZXMgdG8gcHJvY2Vzc1xuICogQHBhcmFtIGxWaWV3IEN1cnJlbnQgYExWaWV3YFxuICogQHBhcmFtIGFuY2hvclJOb2RlIHBsYWNlIHdoZXJlIHRoZSBpMThuIG5vZGUgc2hvdWxkIGJlIGluc2VydGVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlNdXRhYmxlT3BDb2RlcyhcbiAgdFZpZXc6IFRWaWV3LFxuICBtdXRhYmxlT3BDb2RlczogSWN1Q3JlYXRlT3BDb2RlcyxcbiAgbFZpZXc6IExWaWV3LFxuICBhbmNob3JSTm9kZTogUk5vZGUsXG4pOiB2b2lkIHtcbiAgbmdEZXZNb2RlICYmIGFzc2VydERvbU5vZGUoYW5jaG9yUk5vZGUpO1xuICBjb25zdCByZW5kZXJlciA9IGxWaWV3W1JFTkRFUkVSXTtcbiAgLy8gYHJvb3RJZHhgIHJlcHJlc2VudHMgdGhlIG5vZGUgaW50byB3aGljaCBhbGwgaW5zZXJ0cyBoYXBwZW4uXG4gIGxldCByb290SWR4OiBudW1iZXIgfCBudWxsID0gbnVsbDtcbiAgLy8gYHJvb3RSTm9kZWAgcmVwcmVzZW50cyB0aGUgcmVhbCBub2RlIGludG8gd2hpY2ggd2UgaW5zZXJ0LiBUaGlzIGNhbiBiZSBkaWZmZXJlbnQgZnJvbVxuICAvLyBgbFZpZXdbcm9vdElkeF1gIGlmIHdlIGhhdmUgcHJvamVjdGlvbi5cbiAgLy8gIC0gbnVsbCB3ZSBkb24ndCBoYXZlIGEgcGFyZW50IChhcyBjYW4gYmUgdGhlIGNhc2UgaW4gd2hlbiB3ZSBhcmUgaW5zZXJ0aW5nIGludG8gYSByb290IG9mXG4gIC8vICAgIExWaWV3IHdoaWNoIGhhcyBubyBwYXJlbnQuKVxuICAvLyAgLSBgUkVsZW1lbnRgIFRoZSBlbGVtZW50IHJlcHJlc2VudGluZyB0aGUgcm9vdCBhZnRlciB0YWtpbmcgcHJvamVjdGlvbiBpbnRvIGFjY291bnQuXG4gIGxldCByb290Uk5vZGUhOiBSRWxlbWVudCB8IG51bGw7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbXV0YWJsZU9wQ29kZXMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBvcENvZGUgPSBtdXRhYmxlT3BDb2Rlc1tpXTtcbiAgICBpZiAodHlwZW9mIG9wQ29kZSA9PSAnc3RyaW5nJykge1xuICAgICAgY29uc3QgdGV4dE5vZGVJbmRleCA9IG11dGFibGVPcENvZGVzWysraV0gYXMgbnVtYmVyO1xuICAgICAgaWYgKGxWaWV3W3RleHROb2RlSW5kZXhdID09PSBudWxsKSB7XG4gICAgICAgIG5nRGV2TW9kZSAmJiBuZ0Rldk1vZGUucmVuZGVyZXJDcmVhdGVUZXh0Tm9kZSsrO1xuICAgICAgICBuZ0Rldk1vZGUgJiYgYXNzZXJ0SW5kZXhJblJhbmdlKGxWaWV3LCB0ZXh0Tm9kZUluZGV4KTtcbiAgICAgICAgbFZpZXdbdGV4dE5vZGVJbmRleF0gPSBfbG9jYXRlT3JDcmVhdGVOb2RlKGxWaWV3LCB0ZXh0Tm9kZUluZGV4LCBvcENvZGUsIE5vZGUuVEVYVF9OT0RFKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBvcENvZGUgPT0gJ251bWJlcicpIHtcbiAgICAgIHN3aXRjaCAob3BDb2RlICYgSWN1Q3JlYXRlT3BDb2RlLk1BU0tfSU5TVFJVQ1RJT04pIHtcbiAgICAgICAgY2FzZSBJY3VDcmVhdGVPcENvZGUuQXBwZW5kQ2hpbGQ6XG4gICAgICAgICAgY29uc3QgcGFyZW50SWR4ID0gZ2V0UGFyZW50RnJvbUljdUNyZWF0ZU9wQ29kZShvcENvZGUpO1xuICAgICAgICAgIGlmIChyb290SWR4ID09PSBudWxsKSB7XG4gICAgICAgICAgICAvLyBUaGUgZmlyc3Qgb3BlcmF0aW9uIHNob3VsZCBzYXZlIHRoZSBgcm9vdElkeGAgYmVjYXVzZSB0aGUgZmlyc3Qgb3BlcmF0aW9uXG4gICAgICAgICAgICAvLyBtdXN0IGluc2VydCBpbnRvIHRoZSByb290LiAoT25seSBzdWJzZXF1ZW50IG9wZXJhdGlvbnMgY2FuIGluc2VydCBpbnRvIGEgZHluYW1pY1xuICAgICAgICAgICAgLy8gcGFyZW50KVxuICAgICAgICAgICAgcm9vdElkeCA9IHBhcmVudElkeDtcbiAgICAgICAgICAgIHJvb3RSTm9kZSA9IG5hdGl2ZVBhcmVudE5vZGUocmVuZGVyZXIsIGFuY2hvclJOb2RlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgbGV0IGluc2VydEluRnJvbnRPZjogUk5vZGUgfCBudWxsO1xuICAgICAgICAgIGxldCBwYXJlbnRSTm9kZTogUkVsZW1lbnQgfCBudWxsO1xuICAgICAgICAgIGlmIChwYXJlbnRJZHggPT09IHJvb3RJZHgpIHtcbiAgICAgICAgICAgIGluc2VydEluRnJvbnRPZiA9IGFuY2hvclJOb2RlO1xuICAgICAgICAgICAgcGFyZW50Uk5vZGUgPSByb290Uk5vZGU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGluc2VydEluRnJvbnRPZiA9IG51bGw7XG4gICAgICAgICAgICBwYXJlbnRSTm9kZSA9IHVud3JhcFJOb2RlKGxWaWV3W3BhcmVudElkeF0pIGFzIFJFbGVtZW50O1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBGSVhNRShtaXNrbyk6IFJlZmFjdG9yIHdpdGggYHByb2Nlc3NJMThuVGV4dGBcbiAgICAgICAgICBpZiAocGFyZW50Uk5vZGUgIT09IG51bGwpIHtcbiAgICAgICAgICAgIC8vIFRoaXMgY2FuIGhhcHBlbiBpZiB0aGUgYExWaWV3YCB3ZSBhcmUgYWRkaW5nIHRvIGlzIG5vdCBhdHRhY2hlZCB0byBhIHBhcmVudCBgTFZpZXdgLlxuICAgICAgICAgICAgLy8gSW4gc3VjaCBhIGNhc2UgdGhlcmUgaXMgbm8gXCJyb290XCIgd2UgY2FuIGF0dGFjaCB0by4gVGhpcyBpcyBmaW5lLCBhcyB3ZSBzdGlsbCBuZWVkIHRvXG4gICAgICAgICAgICAvLyBjcmVhdGUgdGhlIGVsZW1lbnRzLiBXaGVuIHRoZSBgTFZpZXdgIGdldHMgbGF0ZXIgYWRkZWQgdG8gYSBwYXJlbnQgdGhlc2UgXCJyb290XCIgbm9kZXNcbiAgICAgICAgICAgIC8vIGdldCBwaWNrZWQgdXAgYW5kIGFkZGVkLlxuICAgICAgICAgICAgbmdEZXZNb2RlICYmIGFzc2VydERvbU5vZGUocGFyZW50Uk5vZGUpO1xuICAgICAgICAgICAgY29uc3QgcmVmSWR4ID0gZ2V0UmVmRnJvbUljdUNyZWF0ZU9wQ29kZShvcENvZGUpO1xuICAgICAgICAgICAgbmdEZXZNb2RlICYmIGFzc2VydEdyZWF0ZXJUaGFuKHJlZklkeCwgSEVBREVSX09GRlNFVCwgJ01pc3NpbmcgcmVmJyk7XG4gICAgICAgICAgICAvLyBgdW53cmFwUk5vZGVgIGlzIG5vdCBuZWVkZWQgaGVyZSBhcyBhbGwgb2YgdGhlc2UgcG9pbnQgdG8gUk5vZGVzIGFzIHBhcnQgb2YgdGhlIGkxOG5cbiAgICAgICAgICAgIC8vIHdoaWNoIGNhbid0IGhhdmUgY29tcG9uZW50cy5cbiAgICAgICAgICAgIGNvbnN0IGNoaWxkID0gbFZpZXdbcmVmSWR4XSBhcyBSRWxlbWVudDtcbiAgICAgICAgICAgIG5nRGV2TW9kZSAmJiBhc3NlcnREb21Ob2RlKGNoaWxkKTtcbiAgICAgICAgICAgIG5hdGl2ZUluc2VydEJlZm9yZShyZW5kZXJlciwgcGFyZW50Uk5vZGUsIGNoaWxkLCBpbnNlcnRJbkZyb250T2YsIGZhbHNlKTtcbiAgICAgICAgICAgIGNvbnN0IHRJY3UgPSBnZXRUSWN1KHRWaWV3LCByZWZJZHgpO1xuICAgICAgICAgICAgaWYgKHRJY3UgIT09IG51bGwgJiYgdHlwZW9mIHRJY3UgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgIC8vIElmIHdlIGp1c3QgYWRkZWQgYSBjb21tZW50IG5vZGUgd2hpY2ggaGFzIElDVSB0aGVuIHRoYXQgSUNVIG1heSBoYXZlIGFscmVhZHkgYmVlblxuICAgICAgICAgICAgICAvLyByZW5kZXJlZCBhbmQgdGhlcmVmb3JlIHdlIG5lZWQgdG8gcmUtYWRkIGl0IGhlcmUuXG4gICAgICAgICAgICAgIG5nRGV2TW9kZSAmJiBhc3NlcnRUSWN1KHRJY3UpO1xuICAgICAgICAgICAgICBjb25zdCBjYXNlSW5kZXggPSBnZXRDdXJyZW50SUNVQ2FzZUluZGV4KHRJY3UsIGxWaWV3KTtcbiAgICAgICAgICAgICAgaWYgKGNhc2VJbmRleCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGFwcGx5TXV0YWJsZU9wQ29kZXModFZpZXcsIHRJY3UuY3JlYXRlW2Nhc2VJbmRleF0sIGxWaWV3LCBsVmlld1t0SWN1LmFuY2hvcklkeF0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEljdUNyZWF0ZU9wQ29kZS5BdHRyOlxuICAgICAgICAgIGNvbnN0IGVsZW1lbnROb2RlSW5kZXggPSBvcENvZGUgPj4+IEljdUNyZWF0ZU9wQ29kZS5TSElGVF9SRUY7XG4gICAgICAgICAgY29uc3QgYXR0ck5hbWUgPSBtdXRhYmxlT3BDb2Rlc1srK2ldIGFzIHN0cmluZztcbiAgICAgICAgICBjb25zdCBhdHRyVmFsdWUgPSBtdXRhYmxlT3BDb2Rlc1srK2ldIGFzIHN0cmluZztcbiAgICAgICAgICAvLyBUaGlzIGNvZGUgaXMgdXNlZCBmb3IgSUNVIGV4cHJlc3Npb25zIG9ubHksIHNpbmNlIHdlIGRvbid0IHN1cHBvcnRcbiAgICAgICAgICAvLyBkaXJlY3RpdmVzL2NvbXBvbmVudHMgaW4gSUNVcywgd2UgZG9uJ3QgbmVlZCB0byB3b3JyeSBhYm91dCBpbnB1dHMgaGVyZVxuICAgICAgICAgIHNldEVsZW1lbnRBdHRyaWJ1dGUoXG4gICAgICAgICAgICByZW5kZXJlcixcbiAgICAgICAgICAgIGdldE5hdGl2ZUJ5SW5kZXgoZWxlbWVudE5vZGVJbmRleCwgbFZpZXcpIGFzIFJFbGVtZW50LFxuICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICBhdHRyTmFtZSxcbiAgICAgICAgICAgIGF0dHJWYWx1ZSxcbiAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBpZiAobmdEZXZNb2RlKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSTE4Tl9TVFJVQ1RVUkUsXG4gICAgICAgICAgICAgIGBVbmFibGUgdG8gZGV0ZXJtaW5lIHRoZSB0eXBlIG9mIG11dGF0ZSBvcGVyYXRpb24gZm9yIFwiJHtvcENvZGV9XCJgLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHN3aXRjaCAob3BDb2RlKSB7XG4gICAgICAgIGNhc2UgSUNVX01BUktFUjpcbiAgICAgICAgICBjb25zdCBjb21tZW50VmFsdWUgPSBtdXRhYmxlT3BDb2Rlc1srK2ldIGFzIHN0cmluZztcbiAgICAgICAgICBjb25zdCBjb21tZW50Tm9kZUluZGV4ID0gbXV0YWJsZU9wQ29kZXNbKytpXSBhcyBudW1iZXI7XG4gICAgICAgICAgaWYgKGxWaWV3W2NvbW1lbnROb2RlSW5kZXhdID09PSBudWxsKSB7XG4gICAgICAgICAgICBuZ0Rldk1vZGUgJiZcbiAgICAgICAgICAgICAgYXNzZXJ0RXF1YWwoXG4gICAgICAgICAgICAgICAgdHlwZW9mIGNvbW1lbnRWYWx1ZSxcbiAgICAgICAgICAgICAgICAnc3RyaW5nJyxcbiAgICAgICAgICAgICAgICBgRXhwZWN0ZWQgXCIke2NvbW1lbnRWYWx1ZX1cIiB0byBiZSBhIGNvbW1lbnQgbm9kZSB2YWx1ZWAsXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICBuZ0Rldk1vZGUgJiYgbmdEZXZNb2RlLnJlbmRlcmVyQ3JlYXRlQ29tbWVudCsrO1xuICAgICAgICAgICAgbmdEZXZNb2RlICYmIGFzc2VydEluZGV4SW5FeHBhbmRvUmFuZ2UobFZpZXcsIGNvbW1lbnROb2RlSW5kZXgpO1xuICAgICAgICAgICAgY29uc3QgY29tbWVudFJOb2RlID0gKGxWaWV3W2NvbW1lbnROb2RlSW5kZXhdID0gX2xvY2F0ZU9yQ3JlYXRlTm9kZShcbiAgICAgICAgICAgICAgbFZpZXcsXG4gICAgICAgICAgICAgIGNvbW1lbnROb2RlSW5kZXgsXG4gICAgICAgICAgICAgIGNvbW1lbnRWYWx1ZSxcbiAgICAgICAgICAgICAgTm9kZS5DT01NRU5UX05PREUsXG4gICAgICAgICAgICApKTtcbiAgICAgICAgICAgIC8vIEZJWE1FKG1pc2tvKTogQXR0YWNoaW5nIHBhdGNoIGRhdGEgaXMgb25seSBuZWVkZWQgZm9yIHRoZSByb290IChBbHNvIGFkZCB0ZXN0cylcbiAgICAgICAgICAgIGF0dGFjaFBhdGNoRGF0YShjb21tZW50Uk5vZGUsIGxWaWV3KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgRUxFTUVOVF9NQVJLRVI6XG4gICAgICAgICAgY29uc3QgdGFnTmFtZSA9IG11dGFibGVPcENvZGVzWysraV0gYXMgc3RyaW5nO1xuICAgICAgICAgIGNvbnN0IGVsZW1lbnROb2RlSW5kZXggPSBtdXRhYmxlT3BDb2Rlc1srK2ldIGFzIG51bWJlcjtcbiAgICAgICAgICBpZiAobFZpZXdbZWxlbWVudE5vZGVJbmRleF0gPT09IG51bGwpIHtcbiAgICAgICAgICAgIG5nRGV2TW9kZSAmJlxuICAgICAgICAgICAgICBhc3NlcnRFcXVhbChcbiAgICAgICAgICAgICAgICB0eXBlb2YgdGFnTmFtZSxcbiAgICAgICAgICAgICAgICAnc3RyaW5nJyxcbiAgICAgICAgICAgICAgICBgRXhwZWN0ZWQgXCIke3RhZ05hbWV9XCIgdG8gYmUgYW4gZWxlbWVudCBub2RlIHRhZyBuYW1lYCxcbiAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgbmdEZXZNb2RlICYmIG5nRGV2TW9kZS5yZW5kZXJlckNyZWF0ZUVsZW1lbnQrKztcbiAgICAgICAgICAgIG5nRGV2TW9kZSAmJiBhc3NlcnRJbmRleEluRXhwYW5kb1JhbmdlKGxWaWV3LCBlbGVtZW50Tm9kZUluZGV4KTtcbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnRSTm9kZSA9IChsVmlld1tlbGVtZW50Tm9kZUluZGV4XSA9IF9sb2NhdGVPckNyZWF0ZU5vZGUoXG4gICAgICAgICAgICAgIGxWaWV3LFxuICAgICAgICAgICAgICBlbGVtZW50Tm9kZUluZGV4LFxuICAgICAgICAgICAgICB0YWdOYW1lLFxuICAgICAgICAgICAgICBOb2RlLkVMRU1FTlRfTk9ERSxcbiAgICAgICAgICAgICkpO1xuICAgICAgICAgICAgLy8gRklYTUUobWlza28pOiBBdHRhY2hpbmcgcGF0Y2ggZGF0YSBpcyBvbmx5IG5lZWRlZCBmb3IgdGhlIHJvb3QgKEFsc28gYWRkIHRlc3RzKVxuICAgICAgICAgICAgYXR0YWNoUGF0Y2hEYXRhKGVsZW1lbnRSTm9kZSwgbFZpZXcpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBuZ0Rldk1vZGUgJiZcbiAgICAgICAgICAgIHRocm93RXJyb3IoYFVuYWJsZSB0byBkZXRlcm1pbmUgdGhlIHR5cGUgb2YgbXV0YXRlIG9wZXJhdGlvbiBmb3IgXCIke29wQ29kZX1cImApO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEFwcGx5IGBJMThuVXBkYXRlT3BDb2Rlc2AgT3BDb2Rlc1xuICpcbiAqIEBwYXJhbSB0VmlldyBDdXJyZW50IGBUVmlld2BcbiAqIEBwYXJhbSBsVmlldyBDdXJyZW50IGBMVmlld2BcbiAqIEBwYXJhbSB1cGRhdGVPcENvZGVzIE9wQ29kZXMgdG8gcHJvY2Vzc1xuICogQHBhcmFtIGJpbmRpbmdzU3RhcnRJbmRleCBMb2NhdGlvbiBvZiB0aGUgZmlyc3QgYMm1ybVpMThuQXBwbHlgXG4gKiBAcGFyYW0gY2hhbmdlTWFzayBFYWNoIGJpdCBjb3JyZXNwb25kcyB0byBhIGDJtcm1aTE4bkV4cGAgKENvdW50aW5nIGJhY2t3YXJkcyBmcm9tXG4gKiAgICAgYGJpbmRpbmdzU3RhcnRJbmRleGApXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhcHBseVVwZGF0ZU9wQ29kZXMoXG4gIHRWaWV3OiBUVmlldyxcbiAgbFZpZXc6IExWaWV3LFxuICB1cGRhdGVPcENvZGVzOiBJMThuVXBkYXRlT3BDb2RlcyxcbiAgYmluZGluZ3NTdGFydEluZGV4OiBudW1iZXIsXG4gIGNoYW5nZU1hc2s6IG51bWJlcixcbikge1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHVwZGF0ZU9wQ29kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAvLyBiaXQgY29kZSB0byBjaGVjayBpZiB3ZSBzaG91bGQgYXBwbHkgdGhlIG5leHQgdXBkYXRlXG4gICAgY29uc3QgY2hlY2tCaXQgPSB1cGRhdGVPcENvZGVzW2ldIGFzIG51bWJlcjtcbiAgICAvLyBOdW1iZXIgb2Ygb3BDb2RlcyB0byBza2lwIHVudGlsIG5leHQgc2V0IG9mIHVwZGF0ZSBjb2Rlc1xuICAgIGNvbnN0IHNraXBDb2RlcyA9IHVwZGF0ZU9wQ29kZXNbKytpXSBhcyBudW1iZXI7XG4gICAgaWYgKGNoZWNrQml0ICYgY2hhbmdlTWFzaykge1xuICAgICAgLy8gVGhlIHZhbHVlIGhhcyBiZWVuIHVwZGF0ZWQgc2luY2UgbGFzdCBjaGVja2VkXG4gICAgICBsZXQgdmFsdWUgPSAnJztcbiAgICAgIGZvciAobGV0IGogPSBpICsgMTsgaiA8PSBpICsgc2tpcENvZGVzOyBqKyspIHtcbiAgICAgICAgY29uc3Qgb3BDb2RlID0gdXBkYXRlT3BDb2Rlc1tqXTtcbiAgICAgICAgaWYgKHR5cGVvZiBvcENvZGUgPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICB2YWx1ZSArPSBvcENvZGU7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIG9wQ29kZSA9PSAnbnVtYmVyJykge1xuICAgICAgICAgIGlmIChvcENvZGUgPCAwKSB7XG4gICAgICAgICAgICAvLyBOZWdhdGl2ZSBvcENvZGUgcmVwcmVzZW50IGBpMThuRXhwYCB2YWx1ZXMgb2Zmc2V0LlxuICAgICAgICAgICAgdmFsdWUgKz0gcmVuZGVyU3RyaW5naWZ5KGxWaWV3W2JpbmRpbmdzU3RhcnRJbmRleCAtIG9wQ29kZV0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBub2RlSW5kZXggPSBvcENvZGUgPj4+IEkxOG5VcGRhdGVPcENvZGUuU0hJRlRfUkVGO1xuICAgICAgICAgICAgc3dpdGNoIChvcENvZGUgJiBJMThuVXBkYXRlT3BDb2RlLk1BU0tfT1BDT0RFKSB7XG4gICAgICAgICAgICAgIGNhc2UgSTE4blVwZGF0ZU9wQ29kZS5BdHRyOlxuICAgICAgICAgICAgICAgIGNvbnN0IHByb3BOYW1lID0gdXBkYXRlT3BDb2Rlc1srK2pdIGFzIHN0cmluZztcbiAgICAgICAgICAgICAgICBjb25zdCBzYW5pdGl6ZUZuID0gdXBkYXRlT3BDb2Rlc1srK2pdIGFzIFNhbml0aXplckZuIHwgbnVsbDtcbiAgICAgICAgICAgICAgICBjb25zdCB0Tm9kZU9yVGFnTmFtZSA9IHRWaWV3LmRhdGFbbm9kZUluZGV4XSBhcyBUTm9kZSB8IHN0cmluZztcbiAgICAgICAgICAgICAgICBuZ0Rldk1vZGUgJiYgYXNzZXJ0RGVmaW5lZCh0Tm9kZU9yVGFnTmFtZSwgJ0V4cGVydGluZyBUTm9kZSBvciBzdHJpbmcnKTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHROb2RlT3JUYWdOYW1lID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgLy8gSUYgd2UgZG9uJ3QgaGF2ZSBhIGBUTm9kZWAsIHRoZW4gd2UgYXJlIGFuIGVsZW1lbnQgaW4gSUNVIChhcyBJQ1UgY29udGVudCBkb2VzXG4gICAgICAgICAgICAgICAgICAvLyBub3QgaGF2ZSBUTm9kZSksIGluIHdoaWNoIGNhc2Ugd2Uga25vdyB0aGF0IHRoZXJlIGFyZSBubyBkaXJlY3RpdmVzLCBhbmQgaGVuY2VcbiAgICAgICAgICAgICAgICAgIC8vIHdlIHVzZSBhdHRyaWJ1dGUgc2V0dGluZy5cbiAgICAgICAgICAgICAgICAgIHNldEVsZW1lbnRBdHRyaWJ1dGUoXG4gICAgICAgICAgICAgICAgICAgIGxWaWV3W1JFTkRFUkVSXSxcbiAgICAgICAgICAgICAgICAgICAgbFZpZXdbbm9kZUluZGV4XSxcbiAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgdE5vZGVPclRhZ05hbWUsXG4gICAgICAgICAgICAgICAgICAgIHByb3BOYW1lLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgc2FuaXRpemVGbixcbiAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIGVsZW1lbnRQcm9wZXJ0eUludGVybmFsKFxuICAgICAgICAgICAgICAgICAgICB0VmlldyxcbiAgICAgICAgICAgICAgICAgICAgdE5vZGVPclRhZ05hbWUsXG4gICAgICAgICAgICAgICAgICAgIGxWaWV3LFxuICAgICAgICAgICAgICAgICAgICBwcm9wTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIGxWaWV3W1JFTkRFUkVSXSxcbiAgICAgICAgICAgICAgICAgICAgc2FuaXRpemVGbixcbiAgICAgICAgICAgICAgICAgICAgZmFsc2UsXG4gICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgY2FzZSBJMThuVXBkYXRlT3BDb2RlLlRleHQ6XG4gICAgICAgICAgICAgICAgY29uc3QgclRleHQgPSBsVmlld1tub2RlSW5kZXhdIGFzIFJUZXh0IHwgbnVsbDtcbiAgICAgICAgICAgICAgICByVGV4dCAhPT0gbnVsbCAmJiB1cGRhdGVUZXh0Tm9kZShsVmlld1tSRU5ERVJFUl0sIHJUZXh0LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIGNhc2UgSTE4blVwZGF0ZU9wQ29kZS5JY3VTd2l0Y2g6XG4gICAgICAgICAgICAgICAgYXBwbHlJY3VTd2l0Y2hDYXNlKHRWaWV3LCBnZXRUSWN1KHRWaWV3LCBub2RlSW5kZXgpISwgbFZpZXcsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgY2FzZSBJMThuVXBkYXRlT3BDb2RlLkljdVVwZGF0ZTpcbiAgICAgICAgICAgICAgICBhcHBseUljdVVwZGF0ZUNhc2UodFZpZXcsIGdldFRJY3UodFZpZXcsIG5vZGVJbmRleCkhLCBiaW5kaW5nc1N0YXJ0SW5kZXgsIGxWaWV3KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3Qgb3BDb2RlID0gdXBkYXRlT3BDb2Rlc1tpICsgMV0gYXMgbnVtYmVyO1xuICAgICAgaWYgKG9wQ29kZSA+IDAgJiYgKG9wQ29kZSAmIEkxOG5VcGRhdGVPcENvZGUuTUFTS19PUENPREUpID09PSBJMThuVXBkYXRlT3BDb2RlLkljdVVwZGF0ZSkge1xuICAgICAgICAvLyBTcGVjaWFsIGNhc2UgZm9yIHRoZSBgaWN1VXBkYXRlQ2FzZWAuIEl0IGNvdWxkIGJlIHRoYXQgdGhlIG1hc2sgZGlkIG5vdCBtYXRjaCwgYnV0XG4gICAgICAgIC8vIHdlIHN0aWxsIG5lZWQgdG8gZXhlY3V0ZSBgaWN1VXBkYXRlQ2FzZWAgYmVjYXVzZSB0aGUgY2FzZSBoYXMgY2hhbmdlZCByZWNlbnRseSBkdWUgdG9cbiAgICAgICAgLy8gcHJldmlvdXMgYGljdVN3aXRjaENhc2VgIGluc3RydWN0aW9uLiAoYGljdVN3aXRjaENhc2VgIGFuZCBgaWN1VXBkYXRlQ2FzZWAgYWx3YXlzIGNvbWUgaW5cbiAgICAgICAgLy8gcGFpcnMuKVxuICAgICAgICBjb25zdCBub2RlSW5kZXggPSBvcENvZGUgPj4+IEkxOG5VcGRhdGVPcENvZGUuU0hJRlRfUkVGO1xuICAgICAgICBjb25zdCB0SWN1ID0gZ2V0VEljdSh0Vmlldywgbm9kZUluZGV4KSE7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRJbmRleCA9IGxWaWV3W3RJY3UuY3VycmVudENhc2VMVmlld0luZGV4XTtcbiAgICAgICAgaWYgKGN1cnJlbnRJbmRleCA8IDApIHtcbiAgICAgICAgICBhcHBseUljdVVwZGF0ZUNhc2UodFZpZXcsIHRJY3UsIGJpbmRpbmdzU3RhcnRJbmRleCwgbFZpZXcpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGkgKz0gc2tpcENvZGVzO1xuICB9XG59XG5cbi8qKlxuICogQXBwbHkgT3BDb2RlcyBhc3NvY2lhdGVkIHdpdGggdXBkYXRpbmcgYW4gZXhpc3RpbmcgSUNVLlxuICpcbiAqIEBwYXJhbSB0VmlldyBDdXJyZW50IGBUVmlld2BcbiAqIEBwYXJhbSB0SWN1IEN1cnJlbnQgYFRJY3VgXG4gKiBAcGFyYW0gYmluZGluZ3NTdGFydEluZGV4IExvY2F0aW9uIG9mIHRoZSBmaXJzdCBgybXJtWkxOG5BcHBseWBcbiAqIEBwYXJhbSBsVmlldyBDdXJyZW50IGBMVmlld2BcbiAqL1xuZnVuY3Rpb24gYXBwbHlJY3VVcGRhdGVDYXNlKHRWaWV3OiBUVmlldywgdEljdTogVEljdSwgYmluZGluZ3NTdGFydEluZGV4OiBudW1iZXIsIGxWaWV3OiBMVmlldykge1xuICBuZ0Rldk1vZGUgJiYgYXNzZXJ0SW5kZXhJblJhbmdlKGxWaWV3LCB0SWN1LmN1cnJlbnRDYXNlTFZpZXdJbmRleCk7XG4gIGxldCBhY3RpdmVDYXNlSW5kZXggPSBsVmlld1t0SWN1LmN1cnJlbnRDYXNlTFZpZXdJbmRleF07XG4gIGlmIChhY3RpdmVDYXNlSW5kZXggIT09IG51bGwpIHtcbiAgICBsZXQgbWFzayA9IGNoYW5nZU1hc2s7XG4gICAgaWYgKGFjdGl2ZUNhc2VJbmRleCA8IDApIHtcbiAgICAgIC8vIENsZWFyIHRoZSBmbGFnLlxuICAgICAgLy8gTmVnYXRpdmUgbnVtYmVyIG1lYW5zIHRoYXQgdGhlIElDVSB3YXMgZnJlc2hseSBjcmVhdGVkIGFuZCB3ZSBuZWVkIHRvIGZvcmNlIHRoZSB1cGRhdGUuXG4gICAgICBhY3RpdmVDYXNlSW5kZXggPSBsVmlld1t0SWN1LmN1cnJlbnRDYXNlTFZpZXdJbmRleF0gPSB+YWN0aXZlQ2FzZUluZGV4O1xuICAgICAgLy8gLTEgaXMgc2FtZSBhcyBhbGwgYml0cyBvbiwgd2hpY2ggc2ltdWxhdGVzIGNyZWF0aW9uIHNpbmNlIGl0IG1hcmtzIGFsbCBiaXRzIGRpcnR5XG4gICAgICBtYXNrID0gLTE7XG4gICAgfVxuICAgIGFwcGx5VXBkYXRlT3BDb2Rlcyh0VmlldywgbFZpZXcsIHRJY3UudXBkYXRlW2FjdGl2ZUNhc2VJbmRleF0sIGJpbmRpbmdzU3RhcnRJbmRleCwgbWFzayk7XG4gIH1cbn1cblxuLyoqXG4gKiBBcHBseSBPcENvZGVzIGFzc29jaWF0ZWQgd2l0aCBzd2l0Y2hpbmcgYSBjYXNlIG9uIElDVS5cbiAqXG4gKiBUaGlzIGludm9sdmVzIHRlYXJpbmcgZG93biBleGlzdGluZyBjYXNlIGFuZCB0aGFuIGJ1aWxkaW5nIHVwIGEgbmV3IGNhc2UuXG4gKlxuICogQHBhcmFtIHRWaWV3IEN1cnJlbnQgYFRWaWV3YFxuICogQHBhcmFtIHRJY3UgQ3VycmVudCBgVEljdWBcbiAqIEBwYXJhbSBsVmlldyBDdXJyZW50IGBMVmlld2BcbiAqIEBwYXJhbSB2YWx1ZSBWYWx1ZSBvZiB0aGUgY2FzZSB0byB1cGRhdGUgdG8uXG4gKi9cbmZ1bmN0aW9uIGFwcGx5SWN1U3dpdGNoQ2FzZSh0VmlldzogVFZpZXcsIHRJY3U6IFRJY3UsIGxWaWV3OiBMVmlldywgdmFsdWU6IHN0cmluZykge1xuICAvLyBSZWJ1aWxkIGEgbmV3IGNhc2UgZm9yIHRoaXMgSUNVXG4gIGNvbnN0IGNhc2VJbmRleCA9IGdldENhc2VJbmRleCh0SWN1LCB2YWx1ZSk7XG4gIGxldCBhY3RpdmVDYXNlSW5kZXggPSBnZXRDdXJyZW50SUNVQ2FzZUluZGV4KHRJY3UsIGxWaWV3KTtcbiAgaWYgKGFjdGl2ZUNhc2VJbmRleCAhPT0gY2FzZUluZGV4KSB7XG4gICAgYXBwbHlJY3VTd2l0Y2hDYXNlUmVtb3ZlKHRWaWV3LCB0SWN1LCBsVmlldyk7XG4gICAgbFZpZXdbdEljdS5jdXJyZW50Q2FzZUxWaWV3SW5kZXhdID0gY2FzZUluZGV4ID09PSBudWxsID8gbnVsbCA6IH5jYXNlSW5kZXg7XG4gICAgaWYgKGNhc2VJbmRleCAhPT0gbnVsbCkge1xuICAgICAgLy8gQWRkIHRoZSBub2RlcyBmb3IgdGhlIG5ldyBjYXNlXG4gICAgICBjb25zdCBhbmNob3JSTm9kZSA9IGxWaWV3W3RJY3UuYW5jaG9ySWR4XTtcbiAgICAgIGlmIChhbmNob3JSTm9kZSkge1xuICAgICAgICBuZ0Rldk1vZGUgJiYgYXNzZXJ0RG9tTm9kZShhbmNob3JSTm9kZSk7XG4gICAgICAgIGFwcGx5TXV0YWJsZU9wQ29kZXModFZpZXcsIHRJY3UuY3JlYXRlW2Nhc2VJbmRleF0sIGxWaWV3LCBhbmNob3JSTm9kZSk7XG4gICAgICB9XG4gICAgICBjbGFpbURlaHlkcmF0ZWRJY3VDYXNlKGxWaWV3LCB0SWN1LmFuY2hvcklkeCwgY2FzZUluZGV4KTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBBcHBseSBPcENvZGVzIGFzc29jaWF0ZWQgd2l0aCB0ZWFyaW5nIElDVSBjYXNlLlxuICpcbiAqIFRoaXMgaW52b2x2ZXMgdGVhcmluZyBkb3duIGV4aXN0aW5nIGNhc2UgYW5kIHRoYW4gYnVpbGRpbmcgdXAgYSBuZXcgY2FzZS5cbiAqXG4gKiBAcGFyYW0gdFZpZXcgQ3VycmVudCBgVFZpZXdgXG4gKiBAcGFyYW0gdEljdSBDdXJyZW50IGBUSWN1YFxuICogQHBhcmFtIGxWaWV3IEN1cnJlbnQgYExWaWV3YFxuICovXG5mdW5jdGlvbiBhcHBseUljdVN3aXRjaENhc2VSZW1vdmUodFZpZXc6IFRWaWV3LCB0SWN1OiBUSWN1LCBsVmlldzogTFZpZXcpIHtcbiAgbGV0IGFjdGl2ZUNhc2VJbmRleCA9IGdldEN1cnJlbnRJQ1VDYXNlSW5kZXgodEljdSwgbFZpZXcpO1xuICBpZiAoYWN0aXZlQ2FzZUluZGV4ICE9PSBudWxsKSB7XG4gICAgY29uc3QgcmVtb3ZlQ29kZXMgPSB0SWN1LnJlbW92ZVthY3RpdmVDYXNlSW5kZXhdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVtb3ZlQ29kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IG5vZGVPckljdUluZGV4ID0gcmVtb3ZlQ29kZXNbaV0gYXMgbnVtYmVyO1xuICAgICAgaWYgKG5vZGVPckljdUluZGV4ID4gMCkge1xuICAgICAgICAvLyBQb3NpdGl2ZSBudW1iZXJzIGFyZSBgUk5vZGVgcy5cbiAgICAgICAgY29uc3Qgck5vZGUgPSBnZXROYXRpdmVCeUluZGV4KG5vZGVPckljdUluZGV4LCBsVmlldyk7XG4gICAgICAgIHJOb2RlICE9PSBudWxsICYmIG5hdGl2ZVJlbW92ZU5vZGUobFZpZXdbUkVOREVSRVJdLCByTm9kZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBOZWdhdGl2ZSBudW1iZXJzIGFyZSBJQ1VzXG4gICAgICAgIGFwcGx5SWN1U3dpdGNoQ2FzZVJlbW92ZSh0VmlldywgZ2V0VEljdSh0Vmlldywgfm5vZGVPckljdUluZGV4KSEsIGxWaWV3KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBpbmRleCBvZiB0aGUgY3VycmVudCBjYXNlIG9mIGFuIElDVSBleHByZXNzaW9uIGRlcGVuZGluZyBvbiB0aGUgbWFpbiBiaW5kaW5nIHZhbHVlXG4gKlxuICogQHBhcmFtIGljdUV4cHJlc3Npb25cbiAqIEBwYXJhbSBiaW5kaW5nVmFsdWUgVGhlIHZhbHVlIG9mIHRoZSBtYWluIGJpbmRpbmcgdXNlZCBieSB0aGlzIElDVSBleHByZXNzaW9uXG4gKi9cbmZ1bmN0aW9uIGdldENhc2VJbmRleChpY3VFeHByZXNzaW9uOiBUSWN1LCBiaW5kaW5nVmFsdWU6IHN0cmluZyk6IG51bWJlciB8IG51bGwge1xuICBsZXQgaW5kZXggPSBpY3VFeHByZXNzaW9uLmNhc2VzLmluZGV4T2YoYmluZGluZ1ZhbHVlKTtcbiAgaWYgKGluZGV4ID09PSAtMSkge1xuICAgIHN3aXRjaCAoaWN1RXhwcmVzc2lvbi50eXBlKSB7XG4gICAgICBjYXNlIEljdVR5cGUucGx1cmFsOiB7XG4gICAgICAgIGNvbnN0IHJlc29sdmVkQ2FzZSA9IGdldFBsdXJhbENhc2UoYmluZGluZ1ZhbHVlLCBnZXRMb2NhbGVJZCgpKTtcbiAgICAgICAgaW5kZXggPSBpY3VFeHByZXNzaW9uLmNhc2VzLmluZGV4T2YocmVzb2x2ZWRDYXNlKTtcbiAgICAgICAgaWYgKGluZGV4ID09PSAtMSAmJiByZXNvbHZlZENhc2UgIT09ICdvdGhlcicpIHtcbiAgICAgICAgICBpbmRleCA9IGljdUV4cHJlc3Npb24uY2FzZXMuaW5kZXhPZignb3RoZXInKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNhc2UgSWN1VHlwZS5zZWxlY3Q6IHtcbiAgICAgICAgaW5kZXggPSBpY3VFeHByZXNzaW9uLmNhc2VzLmluZGV4T2YoJ290aGVyJyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gaW5kZXggPT09IC0xID8gbnVsbCA6IGluZGV4O1xufVxuIl19