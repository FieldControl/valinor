/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import '../../util/ng_dev_mode';
import '../../util/ng_i18n_closure_mode';
import { getTemplateContent, SRCSET_ATTRS, URI_ATTRS, VALID_ATTRS, VALID_ELEMENTS } from '../../sanitization/html_sanitizer';
import { getInertBodyHelper } from '../../sanitization/inert_body';
import { _sanitizeUrl, sanitizeSrcset } from '../../sanitization/url_sanitizer';
import { assertDefined, assertEqual, assertGreaterThanOrEqual, assertOneOf, assertString } from '../../util/assert';
import { loadIcuContainerVisitor } from '../instructions/i18n_icu_container_visitor';
import { allocExpando, createTNodeAtIndex } from '../instructions/shared';
import { getDocument } from '../interfaces/document';
import { ELEMENT_MARKER, I18nCreateOpCode, ICU_MARKER } from '../interfaces/i18n';
import { HEADER_OFFSET } from '../interfaces/view';
import { getCurrentParentTNode, getCurrentTNode, setCurrentTNode } from '../state';
import { attachDebugGetter } from '../util/debug_utils';
import { i18nCreateOpCodesToString, i18nRemoveOpCodesToString, i18nUpdateOpCodesToString, icuCreateOpCodesToString } from './i18n_debug';
import { addTNodeAndUpdateInsertBeforeIndex } from './i18n_insert_before_index';
import { ensureIcuContainerVisitorLoaded } from './i18n_tree_shaking';
import { createTNodePlaceholder, icuCreateOpCode, setTIcu, setTNodeInsertBeforeIndex } from './i18n_util';
const BINDING_REGEXP = /�(\d+):?\d*�/gi;
const ICU_REGEXP = /({\s*�\d+:?\d*�\s*,\s*\S{6}\s*,[\s\S]*})/gi;
const NESTED_ICU = /�(\d+)�/;
const ICU_BLOCK_REGEXP = /^\s*(�\d+:?\d*�)\s*,\s*(select|plural)\s*,/;
const MARKER = `�`;
const SUBTEMPLATE_REGEXP = /�\/?\*(\d+:\d+)�/gi;
const PH_REGEXP = /�(\/?[#*]\d+):?\d*�/gi;
/**
 * Angular Dart introduced &ngsp; as a placeholder for non-removable space, see:
 * https://github.com/dart-lang/angular/blob/0bb611387d29d65b5af7f9d2515ab571fd3fbee4/_tests/test/compiler/preserve_whitespace_test.dart#L25-L32
 * In Angular Dart &ngsp; is converted to the 0xE500 PUA (Private Use Areas) unicode character
 * and later on replaced by a space. We are re-implementing the same idea here, since translations
 * might contain this special character.
 */
const NGSP_UNICODE_REGEXP = /\uE500/g;
function replaceNgsp(value) {
    return value.replace(NGSP_UNICODE_REGEXP, ' ');
}
/**
 * Create dynamic nodes from i18n translation block.
 *
 * - Text nodes are created synchronously
 * - TNodes are linked into tree lazily
 *
 * @param tView Current `TView`
 * @parentTNodeIndex index to the parent TNode of this i18n block
 * @param lView Current `LView`
 * @param index Index of `ɵɵi18nStart` instruction.
 * @param message Message to translate.
 * @param subTemplateIndex Index into the sub template of message translation. (ie in case of
 *     `ngIf`) (-1 otherwise)
 */
export function i18nStartFirstCreatePass(tView, parentTNodeIndex, lView, index, message, subTemplateIndex) {
    const rootTNode = getCurrentParentTNode();
    const createOpCodes = [];
    const updateOpCodes = [];
    const existingTNodeStack = [[]];
    if (ngDevMode) {
        attachDebugGetter(createOpCodes, i18nCreateOpCodesToString);
        attachDebugGetter(updateOpCodes, i18nUpdateOpCodesToString);
    }
    message = getTranslationForTemplate(message, subTemplateIndex);
    const msgParts = replaceNgsp(message).split(PH_REGEXP);
    for (let i = 0; i < msgParts.length; i++) {
        let value = msgParts[i];
        if ((i & 1) === 0) {
            // Even indexes are text (including bindings & ICU expressions)
            const parts = i18nParseTextIntoPartsAndICU(value);
            for (let j = 0; j < parts.length; j++) {
                let part = parts[j];
                if ((j & 1) === 0) {
                    // `j` is odd therefore `part` is string
                    const text = part;
                    ngDevMode && assertString(text, 'Parsed ICU part should be string');
                    if (text !== '') {
                        i18nStartFirstCreatePassProcessTextNode(tView, rootTNode, existingTNodeStack[0], createOpCodes, updateOpCodes, lView, text);
                    }
                }
                else {
                    // `j` is Even therefor `part` is an `ICUExpression`
                    const icuExpression = part;
                    // Verify that ICU expression has the right shape. Translations might contain invalid
                    // constructions (while original messages were correct), so ICU parsing at runtime may
                    // not succeed (thus `icuExpression` remains a string).
                    // Note: we intentionally retain the error here by not using `ngDevMode`, because
                    // the value can change based on the locale and users aren't guaranteed to hit
                    // an invalid string while they're developing.
                    if (typeof icuExpression !== 'object') {
                        throw new Error(`Unable to parse ICU expression in "${message}" message.`);
                    }
                    const icuContainerTNode = createTNodeAndAddOpCode(tView, rootTNode, existingTNodeStack[0], lView, createOpCodes, ngDevMode ? `ICU ${index}:${icuExpression.mainBinding}` : '', true);
                    const icuNodeIndex = icuContainerTNode.index;
                    ngDevMode &&
                        assertGreaterThanOrEqual(icuNodeIndex, HEADER_OFFSET, 'Index must be in absolute LView offset');
                    icuStart(tView, lView, updateOpCodes, parentTNodeIndex, icuExpression, icuNodeIndex);
                }
            }
        }
        else {
            // Odd indexes are placeholders (elements and sub-templates)
            // At this point value is something like: '/#1:2' (originally coming from '�/#1:2�')
            const isClosing = value.charCodeAt(0) === 47 /* SLASH */;
            const type = value.charCodeAt(isClosing ? 1 : 0);
            ngDevMode && assertOneOf(type, 42 /* STAR */, 35 /* HASH */);
            const index = HEADER_OFFSET + Number.parseInt(value.substring((isClosing ? 2 : 1)));
            if (isClosing) {
                existingTNodeStack.shift();
                setCurrentTNode(getCurrentParentTNode(), false);
            }
            else {
                const tNode = createTNodePlaceholder(tView, existingTNodeStack[0], index);
                existingTNodeStack.unshift([]);
                setCurrentTNode(tNode, true);
            }
        }
    }
    tView.data[index] = {
        create: createOpCodes,
        update: updateOpCodes,
    };
}
/**
 * Allocate space in i18n Range add create OpCode instruction to crete a text or comment node.
 *
 * @param tView Current `TView` needed to allocate space in i18n range.
 * @param rootTNode Root `TNode` of the i18n block. This node determines if the new TNode will be
 *     added as part of the `i18nStart` instruction or as part of the `TNode.insertBeforeIndex`.
 * @param existingTNodes internal state for `addTNodeAndUpdateInsertBeforeIndex`.
 * @param lView Current `LView` needed to allocate space in i18n range.
 * @param createOpCodes Array storing `I18nCreateOpCodes` where new opCodes will be added.
 * @param text Text to be added when the `Text` or `Comment` node will be created.
 * @param isICU true if a `Comment` node for ICU (instead of `Text`) node should be created.
 */
function createTNodeAndAddOpCode(tView, rootTNode, existingTNodes, lView, createOpCodes, text, isICU) {
    const i18nNodeIdx = allocExpando(tView, lView, 1, null);
    let opCode = i18nNodeIdx << I18nCreateOpCode.SHIFT;
    let parentTNode = getCurrentParentTNode();
    if (rootTNode === parentTNode) {
        // FIXME(misko): A null `parentTNode` should represent when we fall of the `LView` boundary.
        // (there is no parent), but in some circumstances (because we are inconsistent about how we set
        // `previousOrParentTNode`) it could point to `rootTNode` So this is a work around.
        parentTNode = null;
    }
    if (parentTNode === null) {
        // If we don't have a parent that means that we can eagerly add nodes.
        // If we have a parent than these nodes can't be added now (as the parent has not been created
        // yet) and instead the `parentTNode` is responsible for adding it. See
        // `TNode.insertBeforeIndex`
        opCode |= I18nCreateOpCode.APPEND_EAGERLY;
    }
    if (isICU) {
        opCode |= I18nCreateOpCode.COMMENT;
        ensureIcuContainerVisitorLoaded(loadIcuContainerVisitor);
    }
    createOpCodes.push(opCode, text === null ? '' : text);
    // We store `{{?}}` so that when looking at debug `TNodeType.template` we can see where the
    // bindings are.
    const tNode = createTNodeAtIndex(tView, i18nNodeIdx, isICU ? 32 /* Icu */ : 1 /* Text */, text === null ? (ngDevMode ? '{{?}}' : '') : text, null);
    addTNodeAndUpdateInsertBeforeIndex(existingTNodes, tNode);
    const tNodeIdx = tNode.index;
    setCurrentTNode(tNode, false /* Text nodes are self closing */);
    if (parentTNode !== null && rootTNode !== parentTNode) {
        // We are a child of deeper node (rather than a direct child of `i18nStart` instruction.)
        // We have to make sure to add ourselves to the parent.
        setTNodeInsertBeforeIndex(parentTNode, tNodeIdx);
    }
    return tNode;
}
/**
 * Processes text node in i18n block.
 *
 * Text nodes can have:
 * - Create instruction in `createOpCodes` for creating the text node.
 * - Allocate spec for text node in i18n range of `LView`
 * - If contains binding:
 *    - bindings => allocate space in i18n range of `LView` to store the binding value.
 *    - populate `updateOpCodes` with update instructions.
 *
 * @param tView Current `TView`
 * @param rootTNode Root `TNode` of the i18n block. This node determines if the new TNode will
 *     be added as part of the `i18nStart` instruction or as part of the
 *     `TNode.insertBeforeIndex`.
 * @param existingTNodes internal state for `addTNodeAndUpdateInsertBeforeIndex`.
 * @param createOpCodes Location where the creation OpCodes will be stored.
 * @param lView Current `LView`
 * @param text The translated text (which may contain binding)
 */
function i18nStartFirstCreatePassProcessTextNode(tView, rootTNode, existingTNodes, createOpCodes, updateOpCodes, lView, text) {
    const hasBinding = text.match(BINDING_REGEXP);
    const tNode = createTNodeAndAddOpCode(tView, rootTNode, existingTNodes, lView, createOpCodes, hasBinding ? null : text, false);
    if (hasBinding) {
        generateBindingUpdateOpCodes(updateOpCodes, text, tNode.index, null, 0, null);
    }
}
/**
 * See `i18nAttributes` above.
 */
export function i18nAttributesFirstPass(tView, index, values) {
    const previousElement = getCurrentTNode();
    const previousElementIndex = previousElement.index;
    const updateOpCodes = [];
    if (ngDevMode) {
        attachDebugGetter(updateOpCodes, i18nUpdateOpCodesToString);
    }
    if (tView.firstCreatePass && tView.data[index] === null) {
        for (let i = 0; i < values.length; i += 2) {
            const attrName = values[i];
            const message = values[i + 1];
            if (message !== '') {
                // Check if attribute value contains an ICU and throw an error if that's the case.
                // ICUs in element attributes are not supported.
                // Note: we intentionally retain the error here by not using `ngDevMode`, because
                // the `value` can change based on the locale and users aren't guaranteed to hit
                // an invalid string while they're developing.
                if (ICU_REGEXP.test(message)) {
                    throw new Error(`ICU expressions are not supported in attributes. Message: "${message}".`);
                }
                // i18n attributes that hit this code path are guaranteed to have bindings, because
                // the compiler treats static i18n attributes as regular attribute bindings.
                // Since this may not be the first i18n attribute on this element we need to pass in how
                // many previous bindings there have already been.
                generateBindingUpdateOpCodes(updateOpCodes, message, previousElementIndex, attrName, countBindings(updateOpCodes), null);
            }
        }
        tView.data[index] = updateOpCodes;
    }
}
/**
 * Generate the OpCodes to update the bindings of a string.
 *
 * @param updateOpCodes Place where the update opcodes will be stored.
 * @param str The string containing the bindings.
 * @param destinationNode Index of the destination node which will receive the binding.
 * @param attrName Name of the attribute, if the string belongs to an attribute.
 * @param sanitizeFn Sanitization function used to sanitize the string after update, if necessary.
 * @param bindingStart The lView index of the next expression that can be bound via an opCode.
 * @returns The mask value for these bindings
 */
function generateBindingUpdateOpCodes(updateOpCodes, str, destinationNode, attrName, bindingStart, sanitizeFn) {
    ngDevMode &&
        assertGreaterThanOrEqual(destinationNode, HEADER_OFFSET, 'Index must be in absolute LView offset');
    const maskIndex = updateOpCodes.length; // Location of mask
    const sizeIndex = maskIndex + 1; // location of size for skipping
    updateOpCodes.push(null, null); // Alloc space for mask and size
    const startIndex = maskIndex + 2; // location of first allocation.
    if (ngDevMode) {
        attachDebugGetter(updateOpCodes, i18nUpdateOpCodesToString);
    }
    const textParts = str.split(BINDING_REGEXP);
    let mask = 0;
    for (let j = 0; j < textParts.length; j++) {
        const textValue = textParts[j];
        if (j & 1) {
            // Odd indexes are bindings
            const bindingIndex = bindingStart + parseInt(textValue, 10);
            updateOpCodes.push(-1 - bindingIndex);
            mask = mask | toMaskBit(bindingIndex);
        }
        else if (textValue !== '') {
            // Even indexes are text
            updateOpCodes.push(textValue);
        }
    }
    updateOpCodes.push(destinationNode << 2 /* SHIFT_REF */ |
        (attrName ? 1 /* Attr */ : 0 /* Text */));
    if (attrName) {
        updateOpCodes.push(attrName, sanitizeFn);
    }
    updateOpCodes[maskIndex] = mask;
    updateOpCodes[sizeIndex] = updateOpCodes.length - startIndex;
    return mask;
}
/**
 * Count the number of bindings in the given `opCodes`.
 *
 * It could be possible to speed this up, by passing the number of bindings found back from
 * `generateBindingUpdateOpCodes()` to `i18nAttributesFirstPass()` but this would then require more
 * complexity in the code and/or transient objects to be created.
 *
 * Since this function is only called once when the template is instantiated, is trivial in the
 * first instance (since `opCodes` will be an empty array), and it is not common for elements to
 * contain multiple i18n bound attributes, it seems like this is a reasonable compromise.
 */
function countBindings(opCodes) {
    let count = 0;
    for (let i = 0; i < opCodes.length; i++) {
        const opCode = opCodes[i];
        // Bindings are negative numbers.
        if (typeof opCode === 'number' && opCode < 0) {
            count++;
        }
    }
    return count;
}
/**
 * Convert binding index to mask bit.
 *
 * Each index represents a single bit on the bit-mask. Because bit-mask only has 32 bits, we make
 * the 32nd bit share all masks for all bindings higher than 32. Since it is extremely rare to
 * have more than 32 bindings this will be hit very rarely. The downside of hitting this corner
 * case is that we will execute binding code more often than necessary. (penalty of performance)
 */
function toMaskBit(bindingIndex) {
    return 1 << Math.min(bindingIndex, 31);
}
export function isRootTemplateMessage(subTemplateIndex) {
    return subTemplateIndex === -1;
}
/**
 * Removes everything inside the sub-templates of a message.
 */
function removeInnerTemplateTranslation(message) {
    let match;
    let res = '';
    let index = 0;
    let inTemplate = false;
    let tagMatched;
    while ((match = SUBTEMPLATE_REGEXP.exec(message)) !== null) {
        if (!inTemplate) {
            res += message.substring(index, match.index + match[0].length);
            tagMatched = match[1];
            inTemplate = true;
        }
        else {
            if (match[0] === `${MARKER}/*${tagMatched}${MARKER}`) {
                index = match.index;
                inTemplate = false;
            }
        }
    }
    ngDevMode &&
        assertEqual(inTemplate, false, `Tag mismatch: unable to find the end of the sub-template in the translation "${message}"`);
    res += message.substr(index);
    return res;
}
/**
 * Extracts a part of a message and removes the rest.
 *
 * This method is used for extracting a part of the message associated with a template. A
 * translated message can span multiple templates.
 *
 * Example:
 * ```
 * <div i18n>Translate <span *ngIf>me</span>!</div>
 * ```
 *
 * @param message The message to crop
 * @param subTemplateIndex Index of the sub-template to extract. If undefined it returns the
 * external template and removes all sub-templates.
 */
export function getTranslationForTemplate(message, subTemplateIndex) {
    if (isRootTemplateMessage(subTemplateIndex)) {
        // We want the root template message, ignore all sub-templates
        return removeInnerTemplateTranslation(message);
    }
    else {
        // We want a specific sub-template
        const start = message.indexOf(`:${subTemplateIndex}${MARKER}`) + 2 + subTemplateIndex.toString().length;
        const end = message.search(new RegExp(`${MARKER}\\/\\*\\d+:${subTemplateIndex}${MARKER}`));
        return removeInnerTemplateTranslation(message.substring(start, end));
    }
}
/**
 * Generate the OpCodes for ICU expressions.
 *
 * @param icuExpression
 * @param index Index where the anchor is stored and an optional `TIcuContainerNode`
 *   - `lView[anchorIdx]` points to a `Comment` node representing the anchor for the ICU.
 *   - `tView.data[anchorIdx]` points to the `TIcuContainerNode` if ICU is root (`null` otherwise)
 */
export function icuStart(tView, lView, updateOpCodes, parentIdx, icuExpression, anchorIdx) {
    ngDevMode && assertDefined(icuExpression, 'ICU expression must be defined');
    let bindingMask = 0;
    const tIcu = {
        type: icuExpression.type,
        currentCaseLViewIndex: allocExpando(tView, lView, 1, null),
        anchorIdx,
        cases: [],
        create: [],
        remove: [],
        update: []
    };
    addUpdateIcuSwitch(updateOpCodes, icuExpression, anchorIdx);
    setTIcu(tView, anchorIdx, tIcu);
    const values = icuExpression.values;
    for (let i = 0; i < values.length; i++) {
        // Each value is an array of strings & other ICU expressions
        const valueArr = values[i];
        const nestedIcus = [];
        for (let j = 0; j < valueArr.length; j++) {
            const value = valueArr[j];
            if (typeof value !== 'string') {
                // It is an nested ICU expression
                const icuIndex = nestedIcus.push(value) - 1;
                // Replace nested ICU expression by a comment node
                valueArr[j] = `<!--�${icuIndex}�-->`;
            }
        }
        bindingMask = parseIcuCase(tView, tIcu, lView, updateOpCodes, parentIdx, icuExpression.cases[i], valueArr.join(''), nestedIcus) |
            bindingMask;
    }
    if (bindingMask) {
        addUpdateIcuUpdate(updateOpCodes, bindingMask, anchorIdx);
    }
}
/**
 * Parses text containing an ICU expression and produces a JSON object for it.
 * Original code from closure library, modified for Angular.
 *
 * @param pattern Text containing an ICU expression that needs to be parsed.
 *
 */
export function parseICUBlock(pattern) {
    const cases = [];
    const values = [];
    let icuType = 1 /* plural */;
    let mainBinding = 0;
    pattern = pattern.replace(ICU_BLOCK_REGEXP, function (str, binding, type) {
        if (type === 'select') {
            icuType = 0 /* select */;
        }
        else {
            icuType = 1 /* plural */;
        }
        mainBinding = parseInt(binding.substr(1), 10);
        return '';
    });
    const parts = i18nParseTextIntoPartsAndICU(pattern);
    // Looking for (key block)+ sequence. One of the keys has to be "other".
    for (let pos = 0; pos < parts.length;) {
        let key = parts[pos++].trim();
        if (icuType === 1 /* plural */) {
            // Key can be "=x", we just want "x"
            key = key.replace(/\s*(?:=)?(\w+)\s*/, '$1');
        }
        if (key.length) {
            cases.push(key);
        }
        const blocks = i18nParseTextIntoPartsAndICU(parts[pos++]);
        if (cases.length > values.length) {
            values.push(blocks);
        }
    }
    // TODO(ocombe): support ICU expressions in attributes, see #21615
    return { type: icuType, mainBinding: mainBinding, cases, values };
}
/**
 * Breaks pattern into strings and top level {...} blocks.
 * Can be used to break a message into text and ICU expressions, or to break an ICU expression
 * into keys and cases. Original code from closure library, modified for Angular.
 *
 * @param pattern (sub)Pattern to be broken.
 * @returns An `Array<string|IcuExpression>` where:
 *   - odd positions: `string` => text between ICU expressions
 *   - even positions: `ICUExpression` => ICU expression parsed into `ICUExpression` record.
 */
export function i18nParseTextIntoPartsAndICU(pattern) {
    if (!pattern) {
        return [];
    }
    let prevPos = 0;
    const braceStack = [];
    const results = [];
    const braces = /[{}]/g;
    // lastIndex doesn't get set to 0 so we have to.
    braces.lastIndex = 0;
    let match;
    while (match = braces.exec(pattern)) {
        const pos = match.index;
        if (match[0] == '}') {
            braceStack.pop();
            if (braceStack.length == 0) {
                // End of the block.
                const block = pattern.substring(prevPos, pos);
                if (ICU_BLOCK_REGEXP.test(block)) {
                    results.push(parseICUBlock(block));
                }
                else {
                    results.push(block);
                }
                prevPos = pos + 1;
            }
        }
        else {
            if (braceStack.length == 0) {
                const substring = pattern.substring(prevPos, pos);
                results.push(substring);
                prevPos = pos + 1;
            }
            braceStack.push('{');
        }
    }
    const substring = pattern.substring(prevPos);
    results.push(substring);
    return results;
}
/**
 * Parses a node, its children and its siblings, and generates the mutate & update OpCodes.
 *
 */
export function parseIcuCase(tView, tIcu, lView, updateOpCodes, parentIdx, caseName, unsafeCaseHtml, nestedIcus) {
    const create = [];
    const remove = [];
    const update = [];
    if (ngDevMode) {
        attachDebugGetter(create, icuCreateOpCodesToString);
        attachDebugGetter(remove, i18nRemoveOpCodesToString);
        attachDebugGetter(update, i18nUpdateOpCodesToString);
    }
    tIcu.cases.push(caseName);
    tIcu.create.push(create);
    tIcu.remove.push(remove);
    tIcu.update.push(update);
    const inertBodyHelper = getInertBodyHelper(getDocument());
    const inertBodyElement = inertBodyHelper.getInertBodyElement(unsafeCaseHtml);
    ngDevMode && assertDefined(inertBodyElement, 'Unable to generate inert body element');
    const inertRootNode = getTemplateContent(inertBodyElement) || inertBodyElement;
    if (inertRootNode) {
        return walkIcuTree(tView, tIcu, lView, updateOpCodes, create, remove, update, inertRootNode, parentIdx, nestedIcus, 0);
    }
    else {
        return 0;
    }
}
function walkIcuTree(tView, tIcu, lView, sharedUpdateOpCodes, create, remove, update, parentNode, parentIdx, nestedIcus, depth) {
    let bindingMask = 0;
    let currentNode = parentNode.firstChild;
    while (currentNode) {
        const newIndex = allocExpando(tView, lView, 1, null);
        switch (currentNode.nodeType) {
            case Node.ELEMENT_NODE:
                const element = currentNode;
                const tagName = element.tagName.toLowerCase();
                if (VALID_ELEMENTS.hasOwnProperty(tagName)) {
                    addCreateNodeAndAppend(create, ELEMENT_MARKER, tagName, parentIdx, newIndex);
                    tView.data[newIndex] = tagName;
                    const elAttrs = element.attributes;
                    for (let i = 0; i < elAttrs.length; i++) {
                        const attr = elAttrs.item(i);
                        const lowerAttrName = attr.name.toLowerCase();
                        const hasBinding = !!attr.value.match(BINDING_REGEXP);
                        // we assume the input string is safe, unless it's using a binding
                        if (hasBinding) {
                            if (VALID_ATTRS.hasOwnProperty(lowerAttrName)) {
                                if (URI_ATTRS[lowerAttrName]) {
                                    generateBindingUpdateOpCodes(update, attr.value, newIndex, attr.name, 0, _sanitizeUrl);
                                }
                                else if (SRCSET_ATTRS[lowerAttrName]) {
                                    generateBindingUpdateOpCodes(update, attr.value, newIndex, attr.name, 0, sanitizeSrcset);
                                }
                                else {
                                    generateBindingUpdateOpCodes(update, attr.value, newIndex, attr.name, 0, null);
                                }
                            }
                            else {
                                ngDevMode &&
                                    console.warn(`WARNING: ignoring unsafe attribute value ` +
                                        `${lowerAttrName} on element ${tagName} ` +
                                        `(see https://g.co/ng/security#xss)`);
                            }
                        }
                        else {
                            addCreateAttribute(create, newIndex, attr);
                        }
                    }
                    // Parse the children of this node (if any)
                    bindingMask = walkIcuTree(tView, tIcu, lView, sharedUpdateOpCodes, create, remove, update, currentNode, newIndex, nestedIcus, depth + 1) |
                        bindingMask;
                    addRemoveNode(remove, newIndex, depth);
                }
                break;
            case Node.TEXT_NODE:
                const value = currentNode.textContent || '';
                const hasBinding = value.match(BINDING_REGEXP);
                addCreateNodeAndAppend(create, null, hasBinding ? '' : value, parentIdx, newIndex);
                addRemoveNode(remove, newIndex, depth);
                if (hasBinding) {
                    bindingMask =
                        generateBindingUpdateOpCodes(update, value, newIndex, null, 0, null) | bindingMask;
                }
                break;
            case Node.COMMENT_NODE:
                // Check if the comment node is a placeholder for a nested ICU
                const isNestedIcu = NESTED_ICU.exec(currentNode.textContent || '');
                if (isNestedIcu) {
                    const nestedIcuIndex = parseInt(isNestedIcu[1], 10);
                    const icuExpression = nestedIcus[nestedIcuIndex];
                    // Create the comment node that will anchor the ICU expression
                    addCreateNodeAndAppend(create, ICU_MARKER, ngDevMode ? `nested ICU ${nestedIcuIndex}` : '', parentIdx, newIndex);
                    icuStart(tView, lView, sharedUpdateOpCodes, parentIdx, icuExpression, newIndex);
                    addRemoveNestedIcu(remove, newIndex, depth);
                }
                break;
        }
        currentNode = currentNode.nextSibling;
    }
    return bindingMask;
}
function addRemoveNode(remove, index, depth) {
    if (depth === 0) {
        remove.push(index);
    }
}
function addRemoveNestedIcu(remove, index, depth) {
    if (depth === 0) {
        remove.push(~index); // remove ICU at `index`
        remove.push(index); // remove ICU comment at `index`
    }
}
function addUpdateIcuSwitch(update, icuExpression, index) {
    update.push(toMaskBit(icuExpression.mainBinding), 2, -1 - icuExpression.mainBinding, index << 2 /* SHIFT_REF */ | 2 /* IcuSwitch */);
}
function addUpdateIcuUpdate(update, bindingMask, index) {
    update.push(bindingMask, 1, index << 2 /* SHIFT_REF */ | 3 /* IcuUpdate */);
}
function addCreateNodeAndAppend(create, marker, text, appendToParentIdx, createAtIdx) {
    if (marker !== null) {
        create.push(marker);
    }
    create.push(text, createAtIdx, icuCreateOpCode(0 /* AppendChild */, appendToParentIdx, createAtIdx));
}
function addCreateAttribute(create, newIndex, attr) {
    create.push(newIndex << 1 /* SHIFT_REF */ | 1 /* Attr */, attr.name, attr.value);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaTE4bl9wYXJzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL3JlbmRlcjMvaTE4bi9pMThuX3BhcnNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUNILE9BQU8sd0JBQXdCLENBQUM7QUFDaEMsT0FBTyxpQ0FBaUMsQ0FBQztBQUV6QyxPQUFPLEVBQUMsa0JBQWtCLEVBQUUsWUFBWSxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsY0FBYyxFQUFDLE1BQU0sbUNBQW1DLENBQUM7QUFDM0gsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0sK0JBQStCLENBQUM7QUFDakUsT0FBTyxFQUFDLFlBQVksRUFBRSxjQUFjLEVBQUMsTUFBTSxrQ0FBa0MsQ0FBQztBQUM5RSxPQUFPLEVBQUMsYUFBYSxFQUFFLFdBQVcsRUFBRSx3QkFBd0IsRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFFbEgsT0FBTyxFQUFDLHVCQUF1QixFQUFDLE1BQU0sNENBQTRDLENBQUM7QUFDbkYsT0FBTyxFQUFDLFlBQVksRUFBRSxrQkFBa0IsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQ3hFLE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUNuRCxPQUFPLEVBQUMsY0FBYyxFQUFFLGdCQUFnQixFQUE2RSxVQUFVLEVBQXlFLE1BQU0sb0JBQW9CLENBQUM7QUFHbk8sT0FBTyxFQUFDLGFBQWEsRUFBZSxNQUFNLG9CQUFvQixDQUFDO0FBQy9ELE9BQU8sRUFBQyxxQkFBcUIsRUFBRSxlQUFlLEVBQUUsZUFBZSxFQUFDLE1BQU0sVUFBVSxDQUFDO0FBQ2pGLE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBRXRELE9BQU8sRUFBQyx5QkFBeUIsRUFBRSx5QkFBeUIsRUFBRSx5QkFBeUIsRUFBRSx3QkFBd0IsRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUN2SSxPQUFPLEVBQUMsa0NBQWtDLEVBQUMsTUFBTSw0QkFBNEIsQ0FBQztBQUM5RSxPQUFPLEVBQUMsK0JBQStCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNwRSxPQUFPLEVBQUMsc0JBQXNCLEVBQUUsZUFBZSxFQUFFLE9BQU8sRUFBRSx5QkFBeUIsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUl4RyxNQUFNLGNBQWMsR0FBRyxnQkFBZ0IsQ0FBQztBQUN4QyxNQUFNLFVBQVUsR0FBRyw0Q0FBNEMsQ0FBQztBQUNoRSxNQUFNLFVBQVUsR0FBRyxTQUFTLENBQUM7QUFDN0IsTUFBTSxnQkFBZ0IsR0FBRyw0Q0FBNEMsQ0FBQztBQUV0RSxNQUFNLE1BQU0sR0FBRyxHQUFHLENBQUM7QUFDbkIsTUFBTSxrQkFBa0IsR0FBRyxvQkFBb0IsQ0FBQztBQUNoRCxNQUFNLFNBQVMsR0FBRyx1QkFBdUIsQ0FBQztBQUUxQzs7Ozs7O0dBTUc7QUFDSCxNQUFNLG1CQUFtQixHQUFHLFNBQVMsQ0FBQztBQUN0QyxTQUFTLFdBQVcsQ0FBQyxLQUFhO0lBQ2hDLE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUNqRCxDQUFDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7R0FhRztBQUNILE1BQU0sVUFBVSx3QkFBd0IsQ0FDcEMsS0FBWSxFQUFFLGdCQUF3QixFQUFFLEtBQVksRUFBRSxLQUFhLEVBQUUsT0FBZSxFQUNwRixnQkFBd0I7SUFDMUIsTUFBTSxTQUFTLEdBQUcscUJBQXFCLEVBQUUsQ0FBQztJQUMxQyxNQUFNLGFBQWEsR0FBc0IsRUFBUyxDQUFDO0lBQ25ELE1BQU0sYUFBYSxHQUFzQixFQUFTLENBQUM7SUFDbkQsTUFBTSxrQkFBa0IsR0FBYyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzNDLElBQUksU0FBUyxFQUFFO1FBQ2IsaUJBQWlCLENBQUMsYUFBYSxFQUFFLHlCQUF5QixDQUFDLENBQUM7UUFDNUQsaUJBQWlCLENBQUMsYUFBYSxFQUFFLHlCQUF5QixDQUFDLENBQUM7S0FDN0Q7SUFFRCxPQUFPLEdBQUcseUJBQXlCLENBQUMsT0FBTyxFQUFFLGdCQUFnQixDQUFDLENBQUM7SUFDL0QsTUFBTSxRQUFRLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN2RCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUN4QyxJQUFJLEtBQUssR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDeEIsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDakIsK0RBQStEO1lBQy9ELE1BQU0sS0FBSyxHQUFHLDRCQUE0QixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2xELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNyQyxJQUFJLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BCLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFO29CQUNqQix3Q0FBd0M7b0JBQ3hDLE1BQU0sSUFBSSxHQUFHLElBQWMsQ0FBQztvQkFDNUIsU0FBUyxJQUFJLFlBQVksQ0FBQyxJQUFJLEVBQUUsa0NBQWtDLENBQUMsQ0FBQztvQkFDcEUsSUFBSSxJQUFJLEtBQUssRUFBRSxFQUFFO3dCQUNmLHVDQUF1QyxDQUNuQyxLQUFLLEVBQUUsU0FBUyxFQUFFLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxFQUFFLGFBQWEsRUFBRSxhQUFhLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO3FCQUN6RjtpQkFDRjtxQkFBTTtvQkFDTCxvREFBb0Q7b0JBQ3BELE1BQU0sYUFBYSxHQUFrQixJQUFxQixDQUFDO29CQUMzRCxxRkFBcUY7b0JBQ3JGLHNGQUFzRjtvQkFDdEYsdURBQXVEO29CQUN2RCxpRkFBaUY7b0JBQ2pGLDhFQUE4RTtvQkFDOUUsOENBQThDO29CQUM5QyxJQUFJLE9BQU8sYUFBYSxLQUFLLFFBQVEsRUFBRTt3QkFDckMsTUFBTSxJQUFJLEtBQUssQ0FBQyxzQ0FBc0MsT0FBTyxZQUFZLENBQUMsQ0FBQztxQkFDNUU7b0JBQ0QsTUFBTSxpQkFBaUIsR0FBRyx1QkFBdUIsQ0FDN0MsS0FBSyxFQUFFLFNBQVMsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsYUFBYSxFQUM3RCxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sS0FBSyxJQUFJLGFBQWEsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO29CQUN4RSxNQUFNLFlBQVksR0FBRyxpQkFBaUIsQ0FBQyxLQUFLLENBQUM7b0JBQzdDLFNBQVM7d0JBQ0wsd0JBQXdCLENBQ3BCLFlBQVksRUFBRSxhQUFhLEVBQUUsd0NBQXdDLENBQUMsQ0FBQztvQkFDL0UsUUFBUSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsYUFBYSxFQUFFLGdCQUFnQixFQUFFLGFBQWEsRUFBRSxZQUFZLENBQUMsQ0FBQztpQkFDdEY7YUFDRjtTQUNGO2FBQU07WUFDTCw0REFBNEQ7WUFDNUQsb0ZBQW9GO1lBQ3BGLE1BQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixDQUFDO1lBQ3pELE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2pELFNBQVMsSUFBSSxXQUFXLENBQUMsSUFBSSwrQkFBK0IsQ0FBQztZQUM3RCxNQUFNLEtBQUssR0FBRyxhQUFhLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwRixJQUFJLFNBQVMsRUFBRTtnQkFDYixrQkFBa0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDM0IsZUFBZSxDQUFDLHFCQUFxQixFQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFDbEQ7aUJBQU07Z0JBQ0wsTUFBTSxLQUFLLEdBQUcsc0JBQXNCLENBQUMsS0FBSyxFQUFFLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUMxRSxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQy9CLGVBQWUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7YUFDOUI7U0FDRjtLQUNGO0lBRUQsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBVTtRQUN6QixNQUFNLEVBQUUsYUFBYTtRQUNyQixNQUFNLEVBQUUsYUFBYTtLQUN0QixDQUFDO0FBQ0osQ0FBQztBQUVEOzs7Ozs7Ozs7OztHQVdHO0FBQ0gsU0FBUyx1QkFBdUIsQ0FDNUIsS0FBWSxFQUFFLFNBQXFCLEVBQUUsY0FBdUIsRUFBRSxLQUFZLEVBQzFFLGFBQWdDLEVBQUUsSUFBaUIsRUFBRSxLQUFjO0lBQ3JFLE1BQU0sV0FBVyxHQUFHLFlBQVksQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN4RCxJQUFJLE1BQU0sR0FBRyxXQUFXLElBQUksZ0JBQWdCLENBQUMsS0FBSyxDQUFDO0lBQ25ELElBQUksV0FBVyxHQUFHLHFCQUFxQixFQUFFLENBQUM7SUFFMUMsSUFBSSxTQUFTLEtBQUssV0FBVyxFQUFFO1FBQzdCLDRGQUE0RjtRQUM1RixnR0FBZ0c7UUFDaEcsbUZBQW1GO1FBQ25GLFdBQVcsR0FBRyxJQUFJLENBQUM7S0FDcEI7SUFDRCxJQUFJLFdBQVcsS0FBSyxJQUFJLEVBQUU7UUFDeEIsc0VBQXNFO1FBQ3RFLDhGQUE4RjtRQUM5Rix1RUFBdUU7UUFDdkUsNEJBQTRCO1FBQzVCLE1BQU0sSUFBSSxnQkFBZ0IsQ0FBQyxjQUFjLENBQUM7S0FDM0M7SUFDRCxJQUFJLEtBQUssRUFBRTtRQUNULE1BQU0sSUFBSSxnQkFBZ0IsQ0FBQyxPQUFPLENBQUM7UUFDbkMsK0JBQStCLENBQUMsdUJBQXVCLENBQUMsQ0FBQztLQUMxRDtJQUNELGFBQWEsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdEQsMkZBQTJGO0lBQzNGLGdCQUFnQjtJQUNoQixNQUFNLEtBQUssR0FBRyxrQkFBa0IsQ0FDNUIsS0FBSyxFQUFFLFdBQVcsRUFBRSxLQUFLLENBQUMsQ0FBQyxjQUFlLENBQUMsYUFBZSxFQUMxRCxJQUFJLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzdELGtDQUFrQyxDQUFDLGNBQWMsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUMxRCxNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDO0lBQzdCLGVBQWUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLGlDQUFpQyxDQUFDLENBQUM7SUFDaEUsSUFBSSxXQUFXLEtBQUssSUFBSSxJQUFJLFNBQVMsS0FBSyxXQUFXLEVBQUU7UUFDckQseUZBQXlGO1FBQ3pGLHVEQUF1RDtRQUN2RCx5QkFBeUIsQ0FBQyxXQUFXLEVBQUUsUUFBUSxDQUFDLENBQUM7S0FDbEQ7SUFDRCxPQUFPLEtBQUssQ0FBQztBQUNmLENBQUM7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBa0JHO0FBQ0gsU0FBUyx1Q0FBdUMsQ0FDNUMsS0FBWSxFQUFFLFNBQXFCLEVBQUUsY0FBdUIsRUFBRSxhQUFnQyxFQUM5RixhQUFnQyxFQUFFLEtBQVksRUFBRSxJQUFZO0lBQzlELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDOUMsTUFBTSxLQUFLLEdBQUcsdUJBQXVCLENBQ2pDLEtBQUssRUFBRSxTQUFTLEVBQUUsY0FBYyxFQUFFLEtBQUssRUFBRSxhQUFhLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztJQUM3RixJQUFJLFVBQVUsRUFBRTtRQUNkLDRCQUE0QixDQUFDLGFBQWEsRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0tBQy9FO0FBQ0gsQ0FBQztBQUVEOztHQUVHO0FBQ0gsTUFBTSxVQUFVLHVCQUF1QixDQUFDLEtBQVksRUFBRSxLQUFhLEVBQUUsTUFBZ0I7SUFDbkYsTUFBTSxlQUFlLEdBQUcsZUFBZSxFQUFHLENBQUM7SUFDM0MsTUFBTSxvQkFBb0IsR0FBRyxlQUFlLENBQUMsS0FBSyxDQUFDO0lBQ25ELE1BQU0sYUFBYSxHQUFzQixFQUFTLENBQUM7SUFDbkQsSUFBSSxTQUFTLEVBQUU7UUFDYixpQkFBaUIsQ0FBQyxhQUFhLEVBQUUseUJBQXlCLENBQUMsQ0FBQztLQUM3RDtJQUNELElBQUksS0FBSyxDQUFDLGVBQWUsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLElBQUksRUFBRTtRQUN2RCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3pDLE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMzQixNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBRTlCLElBQUksT0FBTyxLQUFLLEVBQUUsRUFBRTtnQkFDbEIsa0ZBQWtGO2dCQUNsRixnREFBZ0Q7Z0JBQ2hELGlGQUFpRjtnQkFDakYsZ0ZBQWdGO2dCQUNoRiw4Q0FBOEM7Z0JBQzlDLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRTtvQkFDNUIsTUFBTSxJQUFJLEtBQUssQ0FDWCw4REFBOEQsT0FBTyxJQUFJLENBQUMsQ0FBQztpQkFDaEY7Z0JBRUQsbUZBQW1GO2dCQUNuRiw0RUFBNEU7Z0JBQzVFLHdGQUF3RjtnQkFDeEYsa0RBQWtEO2dCQUNsRCw0QkFBNEIsQ0FDeEIsYUFBYSxFQUFFLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxRQUFRLEVBQUUsYUFBYSxDQUFDLGFBQWEsQ0FBQyxFQUNwRixJQUFJLENBQUMsQ0FBQzthQUNYO1NBQ0Y7UUFDRCxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLGFBQWEsQ0FBQztLQUNuQztBQUNILENBQUM7QUFHRDs7Ozs7Ozs7OztHQVVHO0FBQ0gsU0FBUyw0QkFBNEIsQ0FDakMsYUFBZ0MsRUFBRSxHQUFXLEVBQUUsZUFBdUIsRUFBRSxRQUFxQixFQUM3RixZQUFvQixFQUFFLFVBQTRCO0lBQ3BELFNBQVM7UUFDTCx3QkFBd0IsQ0FDcEIsZUFBZSxFQUFFLGFBQWEsRUFBRSx3Q0FBd0MsQ0FBQyxDQUFDO0lBQ2xGLE1BQU0sU0FBUyxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBRSxtQkFBbUI7SUFDNUQsTUFBTSxTQUFTLEdBQUcsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFTLGdDQUFnQztJQUN6RSxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFVLGdDQUFnQztJQUN6RSxNQUFNLFVBQVUsR0FBRyxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQVEsZ0NBQWdDO0lBQ3pFLElBQUksU0FBUyxFQUFFO1FBQ2IsaUJBQWlCLENBQUMsYUFBYSxFQUFFLHlCQUF5QixDQUFDLENBQUM7S0FDN0Q7SUFDRCxNQUFNLFNBQVMsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQzVDLElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQztJQUViLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ3pDLE1BQU0sU0FBUyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUUvQixJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDVCwyQkFBMkI7WUFDM0IsTUFBTSxZQUFZLEdBQUcsWUFBWSxHQUFHLFFBQVEsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDNUQsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxZQUFZLENBQUMsQ0FBQztZQUN0QyxJQUFJLEdBQUcsSUFBSSxHQUFHLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQztTQUN2QzthQUFNLElBQUksU0FBUyxLQUFLLEVBQUUsRUFBRTtZQUMzQix3QkFBd0I7WUFDeEIsYUFBYSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUMvQjtLQUNGO0lBRUQsYUFBYSxDQUFDLElBQUksQ0FDZCxlQUFlLHFCQUE4QjtRQUM3QyxDQUFDLFFBQVEsQ0FBQyxDQUFDLGNBQXVCLENBQUMsYUFBc0IsQ0FBQyxDQUFDLENBQUM7SUFDaEUsSUFBSSxRQUFRLEVBQUU7UUFDWixhQUFhLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQztLQUMxQztJQUNELGFBQWEsQ0FBQyxTQUFTLENBQUMsR0FBRyxJQUFJLENBQUM7SUFDaEMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxHQUFHLGFBQWEsQ0FBQyxNQUFNLEdBQUcsVUFBVSxDQUFDO0lBQzdELE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQztBQUVEOzs7Ozs7Ozs7O0dBVUc7QUFDSCxTQUFTLGFBQWEsQ0FBQyxPQUEwQjtJQUMvQyxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7SUFDZCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUN2QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDMUIsaUNBQWlDO1FBQ2pDLElBQUksT0FBTyxNQUFNLEtBQUssUUFBUSxJQUFJLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDNUMsS0FBSyxFQUFFLENBQUM7U0FDVDtLQUNGO0lBQ0QsT0FBTyxLQUFLLENBQUM7QUFDZixDQUFDO0FBRUQ7Ozs7Ozs7R0FPRztBQUNILFNBQVMsU0FBUyxDQUFDLFlBQW9CO0lBQ3JDLE9BQU8sQ0FBQyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3pDLENBQUM7QUFFRCxNQUFNLFVBQVUscUJBQXFCLENBQUMsZ0JBQXdCO0lBQzVELE9BQU8sZ0JBQWdCLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDakMsQ0FBQztBQUdEOztHQUVHO0FBQ0gsU0FBUyw4QkFBOEIsQ0FBQyxPQUFlO0lBQ3JELElBQUksS0FBSyxDQUFDO0lBQ1YsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDO0lBQ2IsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO0lBQ2QsSUFBSSxVQUFVLEdBQUcsS0FBSyxDQUFDO0lBQ3ZCLElBQUksVUFBVSxDQUFDO0lBRWYsT0FBTyxDQUFDLEtBQUssR0FBRyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxJQUFJLEVBQUU7UUFDMUQsSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUNmLEdBQUcsSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMvRCxVQUFVLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RCLFVBQVUsR0FBRyxJQUFJLENBQUM7U0FDbkI7YUFBTTtZQUNMLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsTUFBTSxLQUFLLFVBQVUsR0FBRyxNQUFNLEVBQUUsRUFBRTtnQkFDcEQsS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUM7Z0JBQ3BCLFVBQVUsR0FBRyxLQUFLLENBQUM7YUFDcEI7U0FDRjtLQUNGO0lBRUQsU0FBUztRQUNMLFdBQVcsQ0FDUCxVQUFVLEVBQUUsS0FBSyxFQUNqQixnRkFDSSxPQUFPLEdBQUcsQ0FBQyxDQUFDO0lBRXhCLEdBQUcsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzdCLE9BQU8sR0FBRyxDQUFDO0FBQ2IsQ0FBQztBQUdEOzs7Ozs7Ozs7Ozs7OztHQWNHO0FBQ0gsTUFBTSxVQUFVLHlCQUF5QixDQUFDLE9BQWUsRUFBRSxnQkFBd0I7SUFDakYsSUFBSSxxQkFBcUIsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFO1FBQzNDLDhEQUE4RDtRQUM5RCxPQUFPLDhCQUE4QixDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQ2hEO1NBQU07UUFDTCxrQ0FBa0M7UUFDbEMsTUFBTSxLQUFLLEdBQ1AsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLGdCQUFnQixHQUFHLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxDQUFDLE1BQU0sQ0FBQztRQUM5RixNQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksTUFBTSxDQUFDLEdBQUcsTUFBTSxjQUFjLGdCQUFnQixHQUFHLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMzRixPQUFPLDhCQUE4QixDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7S0FDdEU7QUFDSCxDQUFDO0FBRUQ7Ozs7Ozs7R0FPRztBQUNILE1BQU0sVUFBVSxRQUFRLENBQ3BCLEtBQVksRUFBRSxLQUFZLEVBQUUsYUFBZ0MsRUFBRSxTQUFpQixFQUMvRSxhQUE0QixFQUFFLFNBQWlCO0lBQ2pELFNBQVMsSUFBSSxhQUFhLENBQUMsYUFBYSxFQUFFLGdDQUFnQyxDQUFDLENBQUM7SUFDNUUsSUFBSSxXQUFXLEdBQUcsQ0FBQyxDQUFDO0lBQ3BCLE1BQU0sSUFBSSxHQUFTO1FBQ2pCLElBQUksRUFBRSxhQUFhLENBQUMsSUFBSTtRQUN4QixxQkFBcUIsRUFBRSxZQUFZLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDO1FBQzFELFNBQVM7UUFDVCxLQUFLLEVBQUUsRUFBRTtRQUNULE1BQU0sRUFBRSxFQUFFO1FBQ1YsTUFBTSxFQUFFLEVBQUU7UUFDVixNQUFNLEVBQUUsRUFBRTtLQUNYLENBQUM7SUFDRixrQkFBa0IsQ0FBQyxhQUFhLEVBQUUsYUFBYSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQzVELE9BQU8sQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ2hDLE1BQU0sTUFBTSxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUM7SUFDcEMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDdEMsNERBQTREO1FBQzVELE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMzQixNQUFNLFVBQVUsR0FBb0IsRUFBRSxDQUFDO1FBQ3ZDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3hDLE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMxQixJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRTtnQkFDN0IsaUNBQWlDO2dCQUNqQyxNQUFNLFFBQVEsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQXNCLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQzdELGtEQUFrRDtnQkFDbEQsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsUUFBUSxNQUFNLENBQUM7YUFDdEM7U0FDRjtRQUNELFdBQVcsR0FBRyxZQUFZLENBQ1IsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsYUFBYSxFQUFFLFNBQVMsRUFBRSxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUNwRSxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLFVBQVUsQ0FBQztZQUM1QyxXQUFXLENBQUM7S0FDakI7SUFDRCxJQUFJLFdBQVcsRUFBRTtRQUNmLGtCQUFrQixDQUFDLGFBQWEsRUFBRSxXQUFXLEVBQUUsU0FBUyxDQUFDLENBQUM7S0FDM0Q7QUFDSCxDQUFDO0FBRUQ7Ozs7OztHQU1HO0FBQ0gsTUFBTSxVQUFVLGFBQWEsQ0FBQyxPQUFlO0lBQzNDLE1BQU0sS0FBSyxHQUFHLEVBQUUsQ0FBQztJQUNqQixNQUFNLE1BQU0sR0FBK0IsRUFBRSxDQUFDO0lBQzlDLElBQUksT0FBTyxpQkFBaUIsQ0FBQztJQUM3QixJQUFJLFdBQVcsR0FBRyxDQUFDLENBQUM7SUFDcEIsT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEVBQUUsVUFBUyxHQUFXLEVBQUUsT0FBZSxFQUFFLElBQVk7UUFDN0YsSUFBSSxJQUFJLEtBQUssUUFBUSxFQUFFO1lBQ3JCLE9BQU8saUJBQWlCLENBQUM7U0FDMUI7YUFBTTtZQUNMLE9BQU8saUJBQWlCLENBQUM7U0FDMUI7UUFDRCxXQUFXLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDOUMsT0FBTyxFQUFFLENBQUM7SUFDWixDQUFDLENBQUMsQ0FBQztJQUVILE1BQU0sS0FBSyxHQUFHLDRCQUE0QixDQUFDLE9BQU8sQ0FBYSxDQUFDO0lBQ2hFLHdFQUF3RTtJQUN4RSxLQUFLLElBQUksR0FBRyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsS0FBSyxDQUFDLE1BQU0sR0FBRztRQUNyQyxJQUFJLEdBQUcsR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUM5QixJQUFJLE9BQU8sbUJBQW1CLEVBQUU7WUFDOUIsb0NBQW9DO1lBQ3BDLEdBQUcsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLG1CQUFtQixFQUFFLElBQUksQ0FBQyxDQUFDO1NBQzlDO1FBQ0QsSUFBSSxHQUFHLENBQUMsTUFBTSxFQUFFO1lBQ2QsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUNqQjtRQUVELE1BQU0sTUFBTSxHQUFHLDRCQUE0QixDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFhLENBQUM7UUFDdEUsSUFBSSxLQUFLLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUU7WUFDaEMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUNyQjtLQUNGO0lBRUQsa0VBQWtFO0lBQ2xFLE9BQU8sRUFBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBQyxDQUFDO0FBQ2xFLENBQUM7QUFHRDs7Ozs7Ozs7O0dBU0c7QUFDSCxNQUFNLFVBQVUsNEJBQTRCLENBQUMsT0FBZTtJQUMxRCxJQUFJLENBQUMsT0FBTyxFQUFFO1FBQ1osT0FBTyxFQUFFLENBQUM7S0FDWDtJQUVELElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQztJQUNoQixNQUFNLFVBQVUsR0FBRyxFQUFFLENBQUM7SUFDdEIsTUFBTSxPQUFPLEdBQTZCLEVBQUUsQ0FBQztJQUM3QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUM7SUFDdkIsZ0RBQWdEO0lBQ2hELE1BQU0sQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO0lBRXJCLElBQUksS0FBSyxDQUFDO0lBQ1YsT0FBTyxLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRTtRQUNuQyxNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDO1FBQ3hCLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsRUFBRTtZQUNuQixVQUFVLENBQUMsR0FBRyxFQUFFLENBQUM7WUFFakIsSUFBSSxVQUFVLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtnQkFDMUIsb0JBQW9CO2dCQUNwQixNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDOUMsSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUU7b0JBQ2hDLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7aUJBQ3BDO3FCQUFNO29CQUNMLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7aUJBQ3JCO2dCQUVELE9BQU8sR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDO2FBQ25CO1NBQ0Y7YUFBTTtZQUNMLElBQUksVUFBVSxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUU7Z0JBQzFCLE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUNsRCxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUN4QixPQUFPLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQzthQUNuQjtZQUNELFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDdEI7S0FDRjtJQUVELE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDN0MsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN4QixPQUFPLE9BQU8sQ0FBQztBQUNqQixDQUFDO0FBR0Q7OztHQUdHO0FBQ0gsTUFBTSxVQUFVLFlBQVksQ0FDeEIsS0FBWSxFQUFFLElBQVUsRUFBRSxLQUFZLEVBQUUsYUFBZ0MsRUFBRSxTQUFpQixFQUMzRixRQUFnQixFQUFFLGNBQXNCLEVBQUUsVUFBMkI7SUFDdkUsTUFBTSxNQUFNLEdBQXFCLEVBQVMsQ0FBQztJQUMzQyxNQUFNLE1BQU0sR0FBc0IsRUFBUyxDQUFDO0lBQzVDLE1BQU0sTUFBTSxHQUFzQixFQUFTLENBQUM7SUFDNUMsSUFBSSxTQUFTLEVBQUU7UUFDYixpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsd0JBQXdCLENBQUMsQ0FBQztRQUNwRCxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUseUJBQXlCLENBQUMsQ0FBQztRQUNyRCxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUseUJBQXlCLENBQUMsQ0FBQztLQUN0RDtJQUNELElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzFCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3pCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3pCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBRXpCLE1BQU0sZUFBZSxHQUFHLGtCQUFrQixDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7SUFDMUQsTUFBTSxnQkFBZ0IsR0FBRyxlQUFlLENBQUMsbUJBQW1CLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDN0UsU0FBUyxJQUFJLGFBQWEsQ0FBQyxnQkFBZ0IsRUFBRSx1Q0FBdUMsQ0FBQyxDQUFDO0lBQ3RGLE1BQU0sYUFBYSxHQUFHLGtCQUFrQixDQUFDLGdCQUFpQixDQUFZLElBQUksZ0JBQWdCLENBQUM7SUFDM0YsSUFBSSxhQUFhLEVBQUU7UUFDakIsT0FBTyxXQUFXLENBQ2QsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsYUFBYSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLGFBQWEsRUFBRSxTQUFTLEVBQ25GLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQztLQUNwQjtTQUFNO1FBQ0wsT0FBTyxDQUFDLENBQUM7S0FDVjtBQUNILENBQUM7QUFFRCxTQUFTLFdBQVcsQ0FDaEIsS0FBWSxFQUFFLElBQVUsRUFBRSxLQUFZLEVBQUUsbUJBQXNDLEVBQzlFLE1BQXdCLEVBQUUsTUFBeUIsRUFBRSxNQUF5QixFQUM5RSxVQUFtQixFQUFFLFNBQWlCLEVBQUUsVUFBMkIsRUFBRSxLQUFhO0lBQ3BGLElBQUksV0FBVyxHQUFHLENBQUMsQ0FBQztJQUNwQixJQUFJLFdBQVcsR0FBRyxVQUFVLENBQUMsVUFBVSxDQUFDO0lBQ3hDLE9BQU8sV0FBVyxFQUFFO1FBQ2xCLE1BQU0sUUFBUSxHQUFHLFlBQVksQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNyRCxRQUFRLFdBQVcsQ0FBQyxRQUFRLEVBQUU7WUFDNUIsS0FBSyxJQUFJLENBQUMsWUFBWTtnQkFDcEIsTUFBTSxPQUFPLEdBQUcsV0FBc0IsQ0FBQztnQkFDdkMsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDOUMsSUFBSSxjQUFjLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxFQUFFO29CQUMxQyxzQkFBc0IsQ0FBQyxNQUFNLEVBQUUsY0FBYyxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7b0JBQzdFLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsT0FBTyxDQUFDO29CQUMvQixNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDO29CQUNuQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTt3QkFDdkMsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUUsQ0FBQzt3QkFDOUIsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQzt3QkFDOUMsTUFBTSxVQUFVLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDO3dCQUN0RCxrRUFBa0U7d0JBQ2xFLElBQUksVUFBVSxFQUFFOzRCQUNkLElBQUksV0FBVyxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUMsRUFBRTtnQ0FDN0MsSUFBSSxTQUFTLENBQUMsYUFBYSxDQUFDLEVBQUU7b0NBQzVCLDRCQUE0QixDQUN4QixNQUFNLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsWUFBWSxDQUFDLENBQUM7aUNBQy9EO3FDQUFNLElBQUksWUFBWSxDQUFDLGFBQWEsQ0FBQyxFQUFFO29DQUN0Qyw0QkFBNEIsQ0FDeEIsTUFBTSxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLGNBQWMsQ0FBQyxDQUFDO2lDQUNqRTtxQ0FBTTtvQ0FDTCw0QkFBNEIsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7aUNBQ2hGOzZCQUNGO2lDQUFNO2dDQUNMLFNBQVM7b0NBQ0wsT0FBTyxDQUFDLElBQUksQ0FDUiwyQ0FBMkM7d0NBQzNDLEdBQUcsYUFBYSxlQUFlLE9BQU8sR0FBRzt3Q0FDekMsb0NBQW9DLENBQUMsQ0FBQzs2QkFDL0M7eUJBQ0Y7NkJBQU07NEJBQ0wsa0JBQWtCLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQzt5QkFDNUM7cUJBQ0Y7b0JBQ0QsMkNBQTJDO29CQUMzQyxXQUFXLEdBQUcsV0FBVyxDQUNQLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUMvRCxXQUFzQixFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsS0FBSyxHQUFHLENBQUMsQ0FBQzt3QkFDdEUsV0FBVyxDQUFDO29CQUNoQixhQUFhLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztpQkFDeEM7Z0JBQ0QsTUFBTTtZQUNSLEtBQUssSUFBSSxDQUFDLFNBQVM7Z0JBQ2pCLE1BQU0sS0FBSyxHQUFHLFdBQVcsQ0FBQyxXQUFXLElBQUksRUFBRSxDQUFDO2dCQUM1QyxNQUFNLFVBQVUsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDO2dCQUMvQyxzQkFBc0IsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUNuRixhQUFhLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDdkMsSUFBSSxVQUFVLEVBQUU7b0JBQ2QsV0FBVzt3QkFDUCw0QkFBNEIsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLFdBQVcsQ0FBQztpQkFDeEY7Z0JBQ0QsTUFBTTtZQUNSLEtBQUssSUFBSSxDQUFDLFlBQVk7Z0JBQ3BCLDhEQUE4RDtnQkFDOUQsTUFBTSxXQUFXLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxJQUFJLEVBQUUsQ0FBQyxDQUFDO2dCQUNuRSxJQUFJLFdBQVcsRUFBRTtvQkFDZixNQUFNLGNBQWMsR0FBRyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO29CQUNwRCxNQUFNLGFBQWEsR0FBa0IsVUFBVSxDQUFDLGNBQWMsQ0FBQyxDQUFDO29CQUNoRSw4REFBOEQ7b0JBQzlELHNCQUFzQixDQUNsQixNQUFNLEVBQUUsVUFBVSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsY0FBYyxjQUFjLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLFNBQVMsRUFDOUUsUUFBUSxDQUFDLENBQUM7b0JBQ2QsUUFBUSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsbUJBQW1CLEVBQUUsU0FBUyxFQUFFLGFBQWEsRUFBRSxRQUFRLENBQUMsQ0FBQztvQkFDaEYsa0JBQWtCLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztpQkFDN0M7Z0JBQ0QsTUFBTTtTQUNUO1FBQ0QsV0FBVyxHQUFHLFdBQVcsQ0FBQyxXQUFXLENBQUM7S0FDdkM7SUFDRCxPQUFPLFdBQVcsQ0FBQztBQUNyQixDQUFDO0FBRUQsU0FBUyxhQUFhLENBQUMsTUFBeUIsRUFBRSxLQUFhLEVBQUUsS0FBYTtJQUM1RSxJQUFJLEtBQUssS0FBSyxDQUFDLEVBQUU7UUFDZixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ3BCO0FBQ0gsQ0FBQztBQUVELFNBQVMsa0JBQWtCLENBQUMsTUFBeUIsRUFBRSxLQUFhLEVBQUUsS0FBYTtJQUNqRixJQUFJLEtBQUssS0FBSyxDQUFDLEVBQUU7UUFDZixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBRSx3QkFBd0I7UUFDOUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFHLGdDQUFnQztLQUN2RDtBQUNILENBQUM7QUFFRCxTQUFTLGtCQUFrQixDQUN2QixNQUF5QixFQUFFLGFBQTRCLEVBQUUsS0FBYTtJQUN4RSxNQUFNLENBQUMsSUFBSSxDQUNQLFNBQVMsQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLGFBQWEsQ0FBQyxXQUFXLEVBQ3ZFLEtBQUsscUJBQThCLG9CQUE2QixDQUFDLENBQUM7QUFDeEUsQ0FBQztBQUVELFNBQVMsa0JBQWtCLENBQUMsTUFBeUIsRUFBRSxXQUFtQixFQUFFLEtBQWE7SUFDdkYsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLEtBQUsscUJBQThCLG9CQUE2QixDQUFDLENBQUM7QUFDaEcsQ0FBQztBQUVELFNBQVMsc0JBQXNCLENBQzNCLE1BQXdCLEVBQUUsTUFBc0MsRUFBRSxJQUFZLEVBQzlFLGlCQUF5QixFQUFFLFdBQW1CO0lBQ2hELElBQUksTUFBTSxLQUFLLElBQUksRUFBRTtRQUNuQixNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQ3JCO0lBQ0QsTUFBTSxDQUFDLElBQUksQ0FDUCxJQUFJLEVBQUUsV0FBVyxFQUNqQixlQUFlLHNCQUE4QixpQkFBaUIsRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDO0FBQ3BGLENBQUM7QUFFRCxTQUFTLGtCQUFrQixDQUFDLE1BQXdCLEVBQUUsUUFBZ0IsRUFBRSxJQUFVO0lBQ2hGLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxxQkFBNkIsZUFBdUIsRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNuRyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgJy4uLy4uL3V0aWwvbmdfZGV2X21vZGUnO1xuaW1wb3J0ICcuLi8uLi91dGlsL25nX2kxOG5fY2xvc3VyZV9tb2RlJztcblxuaW1wb3J0IHtnZXRUZW1wbGF0ZUNvbnRlbnQsIFNSQ1NFVF9BVFRSUywgVVJJX0FUVFJTLCBWQUxJRF9BVFRSUywgVkFMSURfRUxFTUVOVFN9IGZyb20gJy4uLy4uL3Nhbml0aXphdGlvbi9odG1sX3Nhbml0aXplcic7XG5pbXBvcnQge2dldEluZXJ0Qm9keUhlbHBlcn0gZnJvbSAnLi4vLi4vc2FuaXRpemF0aW9uL2luZXJ0X2JvZHknO1xuaW1wb3J0IHtfc2FuaXRpemVVcmwsIHNhbml0aXplU3Jjc2V0fSBmcm9tICcuLi8uLi9zYW5pdGl6YXRpb24vdXJsX3Nhbml0aXplcic7XG5pbXBvcnQge2Fzc2VydERlZmluZWQsIGFzc2VydEVxdWFsLCBhc3NlcnRHcmVhdGVyVGhhbk9yRXF1YWwsIGFzc2VydE9uZU9mLCBhc3NlcnRTdHJpbmd9IGZyb20gJy4uLy4uL3V0aWwvYXNzZXJ0JztcbmltcG9ydCB7Q2hhckNvZGV9IGZyb20gJy4uLy4uL3V0aWwvY2hhcl9jb2RlJztcbmltcG9ydCB7bG9hZEljdUNvbnRhaW5lclZpc2l0b3J9IGZyb20gJy4uL2luc3RydWN0aW9ucy9pMThuX2ljdV9jb250YWluZXJfdmlzaXRvcic7XG5pbXBvcnQge2FsbG9jRXhwYW5kbywgY3JlYXRlVE5vZGVBdEluZGV4fSBmcm9tICcuLi9pbnN0cnVjdGlvbnMvc2hhcmVkJztcbmltcG9ydCB7Z2V0RG9jdW1lbnR9IGZyb20gJy4uL2ludGVyZmFjZXMvZG9jdW1lbnQnO1xuaW1wb3J0IHtFTEVNRU5UX01BUktFUiwgSTE4bkNyZWF0ZU9wQ29kZSwgSTE4bkNyZWF0ZU9wQ29kZXMsIEkxOG5SZW1vdmVPcENvZGVzLCBJMThuVXBkYXRlT3BDb2RlLCBJMThuVXBkYXRlT3BDb2RlcywgSUNVX01BUktFUiwgSWN1Q3JlYXRlT3BDb2RlLCBJY3VDcmVhdGVPcENvZGVzLCBJY3VFeHByZXNzaW9uLCBJY3VUeXBlLCBUSTE4biwgVEljdX0gZnJvbSAnLi4vaW50ZXJmYWNlcy9pMThuJztcbmltcG9ydCB7VE5vZGUsIFROb2RlVHlwZX0gZnJvbSAnLi4vaW50ZXJmYWNlcy9ub2RlJztcbmltcG9ydCB7U2FuaXRpemVyRm59IGZyb20gJy4uL2ludGVyZmFjZXMvc2FuaXRpemF0aW9uJztcbmltcG9ydCB7SEVBREVSX09GRlNFVCwgTFZpZXcsIFRWaWV3fSBmcm9tICcuLi9pbnRlcmZhY2VzL3ZpZXcnO1xuaW1wb3J0IHtnZXRDdXJyZW50UGFyZW50VE5vZGUsIGdldEN1cnJlbnRUTm9kZSwgc2V0Q3VycmVudFROb2RlfSBmcm9tICcuLi9zdGF0ZSc7XG5pbXBvcnQge2F0dGFjaERlYnVnR2V0dGVyfSBmcm9tICcuLi91dGlsL2RlYnVnX3V0aWxzJztcblxuaW1wb3J0IHtpMThuQ3JlYXRlT3BDb2Rlc1RvU3RyaW5nLCBpMThuUmVtb3ZlT3BDb2Rlc1RvU3RyaW5nLCBpMThuVXBkYXRlT3BDb2Rlc1RvU3RyaW5nLCBpY3VDcmVhdGVPcENvZGVzVG9TdHJpbmd9IGZyb20gJy4vaTE4bl9kZWJ1Zyc7XG5pbXBvcnQge2FkZFROb2RlQW5kVXBkYXRlSW5zZXJ0QmVmb3JlSW5kZXh9IGZyb20gJy4vaTE4bl9pbnNlcnRfYmVmb3JlX2luZGV4JztcbmltcG9ydCB7ZW5zdXJlSWN1Q29udGFpbmVyVmlzaXRvckxvYWRlZH0gZnJvbSAnLi9pMThuX3RyZWVfc2hha2luZyc7XG5pbXBvcnQge2NyZWF0ZVROb2RlUGxhY2Vob2xkZXIsIGljdUNyZWF0ZU9wQ29kZSwgc2V0VEljdSwgc2V0VE5vZGVJbnNlcnRCZWZvcmVJbmRleH0gZnJvbSAnLi9pMThuX3V0aWwnO1xuXG5cblxuY29uc3QgQklORElOR19SRUdFWFAgPSAv77+9KFxcZCspOj9cXGQq77+9L2dpO1xuY29uc3QgSUNVX1JFR0VYUCA9IC8oe1xccyrvv71cXGQrOj9cXGQq77+9XFxzKixcXHMqXFxTezZ9XFxzKixbXFxzXFxTXSp9KS9naTtcbmNvbnN0IE5FU1RFRF9JQ1UgPSAv77+9KFxcZCsp77+9LztcbmNvbnN0IElDVV9CTE9DS19SRUdFWFAgPSAvXlxccyoo77+9XFxkKzo/XFxkKu+/vSlcXHMqLFxccyooc2VsZWN0fHBsdXJhbClcXHMqLC87XG5cbmNvbnN0IE1BUktFUiA9IGDvv71gO1xuY29uc3QgU1VCVEVNUExBVEVfUkVHRVhQID0gL++/vVxcLz9cXCooXFxkKzpcXGQrKe+/vS9naTtcbmNvbnN0IFBIX1JFR0VYUCA9IC/vv70oXFwvP1sjKl1cXGQrKTo/XFxkKu+/vS9naTtcblxuLyoqXG4gKiBBbmd1bGFyIERhcnQgaW50cm9kdWNlZCAmbmdzcDsgYXMgYSBwbGFjZWhvbGRlciBmb3Igbm9uLXJlbW92YWJsZSBzcGFjZSwgc2VlOlxuICogaHR0cHM6Ly9naXRodWIuY29tL2RhcnQtbGFuZy9hbmd1bGFyL2Jsb2IvMGJiNjExMzg3ZDI5ZDY1YjVhZjdmOWQyNTE1YWI1NzFmZDNmYmVlNC9fdGVzdHMvdGVzdC9jb21waWxlci9wcmVzZXJ2ZV93aGl0ZXNwYWNlX3Rlc3QuZGFydCNMMjUtTDMyXG4gKiBJbiBBbmd1bGFyIERhcnQgJm5nc3A7IGlzIGNvbnZlcnRlZCB0byB0aGUgMHhFNTAwIFBVQSAoUHJpdmF0ZSBVc2UgQXJlYXMpIHVuaWNvZGUgY2hhcmFjdGVyXG4gKiBhbmQgbGF0ZXIgb24gcmVwbGFjZWQgYnkgYSBzcGFjZS4gV2UgYXJlIHJlLWltcGxlbWVudGluZyB0aGUgc2FtZSBpZGVhIGhlcmUsIHNpbmNlIHRyYW5zbGF0aW9uc1xuICogbWlnaHQgY29udGFpbiB0aGlzIHNwZWNpYWwgY2hhcmFjdGVyLlxuICovXG5jb25zdCBOR1NQX1VOSUNPREVfUkVHRVhQID0gL1xcdUU1MDAvZztcbmZ1bmN0aW9uIHJlcGxhY2VOZ3NwKHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gdmFsdWUucmVwbGFjZShOR1NQX1VOSUNPREVfUkVHRVhQLCAnICcpO1xufVxuXG4vKipcbiAqIENyZWF0ZSBkeW5hbWljIG5vZGVzIGZyb20gaTE4biB0cmFuc2xhdGlvbiBibG9jay5cbiAqXG4gKiAtIFRleHQgbm9kZXMgYXJlIGNyZWF0ZWQgc3luY2hyb25vdXNseVxuICogLSBUTm9kZXMgYXJlIGxpbmtlZCBpbnRvIHRyZWUgbGF6aWx5XG4gKlxuICogQHBhcmFtIHRWaWV3IEN1cnJlbnQgYFRWaWV3YFxuICogQHBhcmVudFROb2RlSW5kZXggaW5kZXggdG8gdGhlIHBhcmVudCBUTm9kZSBvZiB0aGlzIGkxOG4gYmxvY2tcbiAqIEBwYXJhbSBsVmlldyBDdXJyZW50IGBMVmlld2BcbiAqIEBwYXJhbSBpbmRleCBJbmRleCBvZiBgybXJtWkxOG5TdGFydGAgaW5zdHJ1Y3Rpb24uXG4gKiBAcGFyYW0gbWVzc2FnZSBNZXNzYWdlIHRvIHRyYW5zbGF0ZS5cbiAqIEBwYXJhbSBzdWJUZW1wbGF0ZUluZGV4IEluZGV4IGludG8gdGhlIHN1YiB0ZW1wbGF0ZSBvZiBtZXNzYWdlIHRyYW5zbGF0aW9uLiAoaWUgaW4gY2FzZSBvZlxuICogICAgIGBuZ0lmYCkgKC0xIG90aGVyd2lzZSlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGkxOG5TdGFydEZpcnN0Q3JlYXRlUGFzcyhcbiAgICB0VmlldzogVFZpZXcsIHBhcmVudFROb2RlSW5kZXg6IG51bWJlciwgbFZpZXc6IExWaWV3LCBpbmRleDogbnVtYmVyLCBtZXNzYWdlOiBzdHJpbmcsXG4gICAgc3ViVGVtcGxhdGVJbmRleDogbnVtYmVyKSB7XG4gIGNvbnN0IHJvb3RUTm9kZSA9IGdldEN1cnJlbnRQYXJlbnRUTm9kZSgpO1xuICBjb25zdCBjcmVhdGVPcENvZGVzOiBJMThuQ3JlYXRlT3BDb2RlcyA9IFtdIGFzIGFueTtcbiAgY29uc3QgdXBkYXRlT3BDb2RlczogSTE4blVwZGF0ZU9wQ29kZXMgPSBbXSBhcyBhbnk7XG4gIGNvbnN0IGV4aXN0aW5nVE5vZGVTdGFjazogVE5vZGVbXVtdID0gW1tdXTtcbiAgaWYgKG5nRGV2TW9kZSkge1xuICAgIGF0dGFjaERlYnVnR2V0dGVyKGNyZWF0ZU9wQ29kZXMsIGkxOG5DcmVhdGVPcENvZGVzVG9TdHJpbmcpO1xuICAgIGF0dGFjaERlYnVnR2V0dGVyKHVwZGF0ZU9wQ29kZXMsIGkxOG5VcGRhdGVPcENvZGVzVG9TdHJpbmcpO1xuICB9XG5cbiAgbWVzc2FnZSA9IGdldFRyYW5zbGF0aW9uRm9yVGVtcGxhdGUobWVzc2FnZSwgc3ViVGVtcGxhdGVJbmRleCk7XG4gIGNvbnN0IG1zZ1BhcnRzID0gcmVwbGFjZU5nc3AobWVzc2FnZSkuc3BsaXQoUEhfUkVHRVhQKTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBtc2dQYXJ0cy5sZW5ndGg7IGkrKykge1xuICAgIGxldCB2YWx1ZSA9IG1zZ1BhcnRzW2ldO1xuICAgIGlmICgoaSAmIDEpID09PSAwKSB7XG4gICAgICAvLyBFdmVuIGluZGV4ZXMgYXJlIHRleHQgKGluY2x1ZGluZyBiaW5kaW5ncyAmIElDVSBleHByZXNzaW9ucylcbiAgICAgIGNvbnN0IHBhcnRzID0gaTE4blBhcnNlVGV4dEludG9QYXJ0c0FuZElDVSh2YWx1ZSk7XG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHBhcnRzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIGxldCBwYXJ0ID0gcGFydHNbal07XG4gICAgICAgIGlmICgoaiAmIDEpID09PSAwKSB7XG4gICAgICAgICAgLy8gYGpgIGlzIG9kZCB0aGVyZWZvcmUgYHBhcnRgIGlzIHN0cmluZ1xuICAgICAgICAgIGNvbnN0IHRleHQgPSBwYXJ0IGFzIHN0cmluZztcbiAgICAgICAgICBuZ0Rldk1vZGUgJiYgYXNzZXJ0U3RyaW5nKHRleHQsICdQYXJzZWQgSUNVIHBhcnQgc2hvdWxkIGJlIHN0cmluZycpO1xuICAgICAgICAgIGlmICh0ZXh0ICE9PSAnJykge1xuICAgICAgICAgICAgaTE4blN0YXJ0Rmlyc3RDcmVhdGVQYXNzUHJvY2Vzc1RleHROb2RlKFxuICAgICAgICAgICAgICAgIHRWaWV3LCByb290VE5vZGUsIGV4aXN0aW5nVE5vZGVTdGFja1swXSwgY3JlYXRlT3BDb2RlcywgdXBkYXRlT3BDb2RlcywgbFZpZXcsIHRleHQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBgamAgaXMgRXZlbiB0aGVyZWZvciBgcGFydGAgaXMgYW4gYElDVUV4cHJlc3Npb25gXG4gICAgICAgICAgY29uc3QgaWN1RXhwcmVzc2lvbjogSWN1RXhwcmVzc2lvbiA9IHBhcnQgYXMgSWN1RXhwcmVzc2lvbjtcbiAgICAgICAgICAvLyBWZXJpZnkgdGhhdCBJQ1UgZXhwcmVzc2lvbiBoYXMgdGhlIHJpZ2h0IHNoYXBlLiBUcmFuc2xhdGlvbnMgbWlnaHQgY29udGFpbiBpbnZhbGlkXG4gICAgICAgICAgLy8gY29uc3RydWN0aW9ucyAod2hpbGUgb3JpZ2luYWwgbWVzc2FnZXMgd2VyZSBjb3JyZWN0KSwgc28gSUNVIHBhcnNpbmcgYXQgcnVudGltZSBtYXlcbiAgICAgICAgICAvLyBub3Qgc3VjY2VlZCAodGh1cyBgaWN1RXhwcmVzc2lvbmAgcmVtYWlucyBhIHN0cmluZykuXG4gICAgICAgICAgLy8gTm90ZTogd2UgaW50ZW50aW9uYWxseSByZXRhaW4gdGhlIGVycm9yIGhlcmUgYnkgbm90IHVzaW5nIGBuZ0Rldk1vZGVgLCBiZWNhdXNlXG4gICAgICAgICAgLy8gdGhlIHZhbHVlIGNhbiBjaGFuZ2UgYmFzZWQgb24gdGhlIGxvY2FsZSBhbmQgdXNlcnMgYXJlbid0IGd1YXJhbnRlZWQgdG8gaGl0XG4gICAgICAgICAgLy8gYW4gaW52YWxpZCBzdHJpbmcgd2hpbGUgdGhleSdyZSBkZXZlbG9waW5nLlxuICAgICAgICAgIGlmICh0eXBlb2YgaWN1RXhwcmVzc2lvbiAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5hYmxlIHRvIHBhcnNlIElDVSBleHByZXNzaW9uIGluIFwiJHttZXNzYWdlfVwiIG1lc3NhZ2UuYCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IGljdUNvbnRhaW5lclROb2RlID0gY3JlYXRlVE5vZGVBbmRBZGRPcENvZGUoXG4gICAgICAgICAgICAgIHRWaWV3LCByb290VE5vZGUsIGV4aXN0aW5nVE5vZGVTdGFja1swXSwgbFZpZXcsIGNyZWF0ZU9wQ29kZXMsXG4gICAgICAgICAgICAgIG5nRGV2TW9kZSA/IGBJQ1UgJHtpbmRleH06JHtpY3VFeHByZXNzaW9uLm1haW5CaW5kaW5nfWAgOiAnJywgdHJ1ZSk7XG4gICAgICAgICAgY29uc3QgaWN1Tm9kZUluZGV4ID0gaWN1Q29udGFpbmVyVE5vZGUuaW5kZXg7XG4gICAgICAgICAgbmdEZXZNb2RlICYmXG4gICAgICAgICAgICAgIGFzc2VydEdyZWF0ZXJUaGFuT3JFcXVhbChcbiAgICAgICAgICAgICAgICAgIGljdU5vZGVJbmRleCwgSEVBREVSX09GRlNFVCwgJ0luZGV4IG11c3QgYmUgaW4gYWJzb2x1dGUgTFZpZXcgb2Zmc2V0Jyk7XG4gICAgICAgICAgaWN1U3RhcnQodFZpZXcsIGxWaWV3LCB1cGRhdGVPcENvZGVzLCBwYXJlbnRUTm9kZUluZGV4LCBpY3VFeHByZXNzaW9uLCBpY3VOb2RlSW5kZXgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIE9kZCBpbmRleGVzIGFyZSBwbGFjZWhvbGRlcnMgKGVsZW1lbnRzIGFuZCBzdWItdGVtcGxhdGVzKVxuICAgICAgLy8gQXQgdGhpcyBwb2ludCB2YWx1ZSBpcyBzb21ldGhpbmcgbGlrZTogJy8jMToyJyAob3JpZ2luYWxseSBjb21pbmcgZnJvbSAn77+9LyMxOjLvv70nKVxuICAgICAgY29uc3QgaXNDbG9zaW5nID0gdmFsdWUuY2hhckNvZGVBdCgwKSA9PT0gQ2hhckNvZGUuU0xBU0g7XG4gICAgICBjb25zdCB0eXBlID0gdmFsdWUuY2hhckNvZGVBdChpc0Nsb3NpbmcgPyAxIDogMCk7XG4gICAgICBuZ0Rldk1vZGUgJiYgYXNzZXJ0T25lT2YodHlwZSwgQ2hhckNvZGUuU1RBUiwgQ2hhckNvZGUuSEFTSCk7XG4gICAgICBjb25zdCBpbmRleCA9IEhFQURFUl9PRkZTRVQgKyBOdW1iZXIucGFyc2VJbnQodmFsdWUuc3Vic3RyaW5nKChpc0Nsb3NpbmcgPyAyIDogMSkpKTtcbiAgICAgIGlmIChpc0Nsb3NpbmcpIHtcbiAgICAgICAgZXhpc3RpbmdUTm9kZVN0YWNrLnNoaWZ0KCk7XG4gICAgICAgIHNldEN1cnJlbnRUTm9kZShnZXRDdXJyZW50UGFyZW50VE5vZGUoKSEsIGZhbHNlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHROb2RlID0gY3JlYXRlVE5vZGVQbGFjZWhvbGRlcih0VmlldywgZXhpc3RpbmdUTm9kZVN0YWNrWzBdLCBpbmRleCk7XG4gICAgICAgIGV4aXN0aW5nVE5vZGVTdGFjay51bnNoaWZ0KFtdKTtcbiAgICAgICAgc2V0Q3VycmVudFROb2RlKHROb2RlLCB0cnVlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB0Vmlldy5kYXRhW2luZGV4XSA9IDxUSTE4bj57XG4gICAgY3JlYXRlOiBjcmVhdGVPcENvZGVzLFxuICAgIHVwZGF0ZTogdXBkYXRlT3BDb2RlcyxcbiAgfTtcbn1cblxuLyoqXG4gKiBBbGxvY2F0ZSBzcGFjZSBpbiBpMThuIFJhbmdlIGFkZCBjcmVhdGUgT3BDb2RlIGluc3RydWN0aW9uIHRvIGNyZXRlIGEgdGV4dCBvciBjb21tZW50IG5vZGUuXG4gKlxuICogQHBhcmFtIHRWaWV3IEN1cnJlbnQgYFRWaWV3YCBuZWVkZWQgdG8gYWxsb2NhdGUgc3BhY2UgaW4gaTE4biByYW5nZS5cbiAqIEBwYXJhbSByb290VE5vZGUgUm9vdCBgVE5vZGVgIG9mIHRoZSBpMThuIGJsb2NrLiBUaGlzIG5vZGUgZGV0ZXJtaW5lcyBpZiB0aGUgbmV3IFROb2RlIHdpbGwgYmVcbiAqICAgICBhZGRlZCBhcyBwYXJ0IG9mIHRoZSBgaTE4blN0YXJ0YCBpbnN0cnVjdGlvbiBvciBhcyBwYXJ0IG9mIHRoZSBgVE5vZGUuaW5zZXJ0QmVmb3JlSW5kZXhgLlxuICogQHBhcmFtIGV4aXN0aW5nVE5vZGVzIGludGVybmFsIHN0YXRlIGZvciBgYWRkVE5vZGVBbmRVcGRhdGVJbnNlcnRCZWZvcmVJbmRleGAuXG4gKiBAcGFyYW0gbFZpZXcgQ3VycmVudCBgTFZpZXdgIG5lZWRlZCB0byBhbGxvY2F0ZSBzcGFjZSBpbiBpMThuIHJhbmdlLlxuICogQHBhcmFtIGNyZWF0ZU9wQ29kZXMgQXJyYXkgc3RvcmluZyBgSTE4bkNyZWF0ZU9wQ29kZXNgIHdoZXJlIG5ldyBvcENvZGVzIHdpbGwgYmUgYWRkZWQuXG4gKiBAcGFyYW0gdGV4dCBUZXh0IHRvIGJlIGFkZGVkIHdoZW4gdGhlIGBUZXh0YCBvciBgQ29tbWVudGAgbm9kZSB3aWxsIGJlIGNyZWF0ZWQuXG4gKiBAcGFyYW0gaXNJQ1UgdHJ1ZSBpZiBhIGBDb21tZW50YCBub2RlIGZvciBJQ1UgKGluc3RlYWQgb2YgYFRleHRgKSBub2RlIHNob3VsZCBiZSBjcmVhdGVkLlxuICovXG5mdW5jdGlvbiBjcmVhdGVUTm9kZUFuZEFkZE9wQ29kZShcbiAgICB0VmlldzogVFZpZXcsIHJvb3RUTm9kZTogVE5vZGV8bnVsbCwgZXhpc3RpbmdUTm9kZXM6IFROb2RlW10sIGxWaWV3OiBMVmlldyxcbiAgICBjcmVhdGVPcENvZGVzOiBJMThuQ3JlYXRlT3BDb2RlcywgdGV4dDogc3RyaW5nfG51bGwsIGlzSUNVOiBib29sZWFuKTogVE5vZGUge1xuICBjb25zdCBpMThuTm9kZUlkeCA9IGFsbG9jRXhwYW5kbyh0VmlldywgbFZpZXcsIDEsIG51bGwpO1xuICBsZXQgb3BDb2RlID0gaTE4bk5vZGVJZHggPDwgSTE4bkNyZWF0ZU9wQ29kZS5TSElGVDtcbiAgbGV0IHBhcmVudFROb2RlID0gZ2V0Q3VycmVudFBhcmVudFROb2RlKCk7XG5cbiAgaWYgKHJvb3RUTm9kZSA9PT0gcGFyZW50VE5vZGUpIHtcbiAgICAvLyBGSVhNRShtaXNrbyk6IEEgbnVsbCBgcGFyZW50VE5vZGVgIHNob3VsZCByZXByZXNlbnQgd2hlbiB3ZSBmYWxsIG9mIHRoZSBgTFZpZXdgIGJvdW5kYXJ5LlxuICAgIC8vICh0aGVyZSBpcyBubyBwYXJlbnQpLCBidXQgaW4gc29tZSBjaXJjdW1zdGFuY2VzIChiZWNhdXNlIHdlIGFyZSBpbmNvbnNpc3RlbnQgYWJvdXQgaG93IHdlIHNldFxuICAgIC8vIGBwcmV2aW91c09yUGFyZW50VE5vZGVgKSBpdCBjb3VsZCBwb2ludCB0byBgcm9vdFROb2RlYCBTbyB0aGlzIGlzIGEgd29yayBhcm91bmQuXG4gICAgcGFyZW50VE5vZGUgPSBudWxsO1xuICB9XG4gIGlmIChwYXJlbnRUTm9kZSA9PT0gbnVsbCkge1xuICAgIC8vIElmIHdlIGRvbid0IGhhdmUgYSBwYXJlbnQgdGhhdCBtZWFucyB0aGF0IHdlIGNhbiBlYWdlcmx5IGFkZCBub2Rlcy5cbiAgICAvLyBJZiB3ZSBoYXZlIGEgcGFyZW50IHRoYW4gdGhlc2Ugbm9kZXMgY2FuJ3QgYmUgYWRkZWQgbm93IChhcyB0aGUgcGFyZW50IGhhcyBub3QgYmVlbiBjcmVhdGVkXG4gICAgLy8geWV0KSBhbmQgaW5zdGVhZCB0aGUgYHBhcmVudFROb2RlYCBpcyByZXNwb25zaWJsZSBmb3IgYWRkaW5nIGl0LiBTZWVcbiAgICAvLyBgVE5vZGUuaW5zZXJ0QmVmb3JlSW5kZXhgXG4gICAgb3BDb2RlIHw9IEkxOG5DcmVhdGVPcENvZGUuQVBQRU5EX0VBR0VSTFk7XG4gIH1cbiAgaWYgKGlzSUNVKSB7XG4gICAgb3BDb2RlIHw9IEkxOG5DcmVhdGVPcENvZGUuQ09NTUVOVDtcbiAgICBlbnN1cmVJY3VDb250YWluZXJWaXNpdG9yTG9hZGVkKGxvYWRJY3VDb250YWluZXJWaXNpdG9yKTtcbiAgfVxuICBjcmVhdGVPcENvZGVzLnB1c2gob3BDb2RlLCB0ZXh0ID09PSBudWxsID8gJycgOiB0ZXh0KTtcbiAgLy8gV2Ugc3RvcmUgYHt7P319YCBzbyB0aGF0IHdoZW4gbG9va2luZyBhdCBkZWJ1ZyBgVE5vZGVUeXBlLnRlbXBsYXRlYCB3ZSBjYW4gc2VlIHdoZXJlIHRoZVxuICAvLyBiaW5kaW5ncyBhcmUuXG4gIGNvbnN0IHROb2RlID0gY3JlYXRlVE5vZGVBdEluZGV4KFxuICAgICAgdFZpZXcsIGkxOG5Ob2RlSWR4LCBpc0lDVSA/IFROb2RlVHlwZS5JY3UgOiBUTm9kZVR5cGUuVGV4dCxcbiAgICAgIHRleHQgPT09IG51bGwgPyAobmdEZXZNb2RlID8gJ3t7P319JyA6ICcnKSA6IHRleHQsIG51bGwpO1xuICBhZGRUTm9kZUFuZFVwZGF0ZUluc2VydEJlZm9yZUluZGV4KGV4aXN0aW5nVE5vZGVzLCB0Tm9kZSk7XG4gIGNvbnN0IHROb2RlSWR4ID0gdE5vZGUuaW5kZXg7XG4gIHNldEN1cnJlbnRUTm9kZSh0Tm9kZSwgZmFsc2UgLyogVGV4dCBub2RlcyBhcmUgc2VsZiBjbG9zaW5nICovKTtcbiAgaWYgKHBhcmVudFROb2RlICE9PSBudWxsICYmIHJvb3RUTm9kZSAhPT0gcGFyZW50VE5vZGUpIHtcbiAgICAvLyBXZSBhcmUgYSBjaGlsZCBvZiBkZWVwZXIgbm9kZSAocmF0aGVyIHRoYW4gYSBkaXJlY3QgY2hpbGQgb2YgYGkxOG5TdGFydGAgaW5zdHJ1Y3Rpb24uKVxuICAgIC8vIFdlIGhhdmUgdG8gbWFrZSBzdXJlIHRvIGFkZCBvdXJzZWx2ZXMgdG8gdGhlIHBhcmVudC5cbiAgICBzZXRUTm9kZUluc2VydEJlZm9yZUluZGV4KHBhcmVudFROb2RlLCB0Tm9kZUlkeCk7XG4gIH1cbiAgcmV0dXJuIHROb2RlO1xufVxuXG4vKipcbiAqIFByb2Nlc3NlcyB0ZXh0IG5vZGUgaW4gaTE4biBibG9jay5cbiAqXG4gKiBUZXh0IG5vZGVzIGNhbiBoYXZlOlxuICogLSBDcmVhdGUgaW5zdHJ1Y3Rpb24gaW4gYGNyZWF0ZU9wQ29kZXNgIGZvciBjcmVhdGluZyB0aGUgdGV4dCBub2RlLlxuICogLSBBbGxvY2F0ZSBzcGVjIGZvciB0ZXh0IG5vZGUgaW4gaTE4biByYW5nZSBvZiBgTFZpZXdgXG4gKiAtIElmIGNvbnRhaW5zIGJpbmRpbmc6XG4gKiAgICAtIGJpbmRpbmdzID0+IGFsbG9jYXRlIHNwYWNlIGluIGkxOG4gcmFuZ2Ugb2YgYExWaWV3YCB0byBzdG9yZSB0aGUgYmluZGluZyB2YWx1ZS5cbiAqICAgIC0gcG9wdWxhdGUgYHVwZGF0ZU9wQ29kZXNgIHdpdGggdXBkYXRlIGluc3RydWN0aW9ucy5cbiAqXG4gKiBAcGFyYW0gdFZpZXcgQ3VycmVudCBgVFZpZXdgXG4gKiBAcGFyYW0gcm9vdFROb2RlIFJvb3QgYFROb2RlYCBvZiB0aGUgaTE4biBibG9jay4gVGhpcyBub2RlIGRldGVybWluZXMgaWYgdGhlIG5ldyBUTm9kZSB3aWxsXG4gKiAgICAgYmUgYWRkZWQgYXMgcGFydCBvZiB0aGUgYGkxOG5TdGFydGAgaW5zdHJ1Y3Rpb24gb3IgYXMgcGFydCBvZiB0aGVcbiAqICAgICBgVE5vZGUuaW5zZXJ0QmVmb3JlSW5kZXhgLlxuICogQHBhcmFtIGV4aXN0aW5nVE5vZGVzIGludGVybmFsIHN0YXRlIGZvciBgYWRkVE5vZGVBbmRVcGRhdGVJbnNlcnRCZWZvcmVJbmRleGAuXG4gKiBAcGFyYW0gY3JlYXRlT3BDb2RlcyBMb2NhdGlvbiB3aGVyZSB0aGUgY3JlYXRpb24gT3BDb2RlcyB3aWxsIGJlIHN0b3JlZC5cbiAqIEBwYXJhbSBsVmlldyBDdXJyZW50IGBMVmlld2BcbiAqIEBwYXJhbSB0ZXh0IFRoZSB0cmFuc2xhdGVkIHRleHQgKHdoaWNoIG1heSBjb250YWluIGJpbmRpbmcpXG4gKi9cbmZ1bmN0aW9uIGkxOG5TdGFydEZpcnN0Q3JlYXRlUGFzc1Byb2Nlc3NUZXh0Tm9kZShcbiAgICB0VmlldzogVFZpZXcsIHJvb3RUTm9kZTogVE5vZGV8bnVsbCwgZXhpc3RpbmdUTm9kZXM6IFROb2RlW10sIGNyZWF0ZU9wQ29kZXM6IEkxOG5DcmVhdGVPcENvZGVzLFxuICAgIHVwZGF0ZU9wQ29kZXM6IEkxOG5VcGRhdGVPcENvZGVzLCBsVmlldzogTFZpZXcsIHRleHQ6IHN0cmluZyk6IHZvaWQge1xuICBjb25zdCBoYXNCaW5kaW5nID0gdGV4dC5tYXRjaChCSU5ESU5HX1JFR0VYUCk7XG4gIGNvbnN0IHROb2RlID0gY3JlYXRlVE5vZGVBbmRBZGRPcENvZGUoXG4gICAgICB0Vmlldywgcm9vdFROb2RlLCBleGlzdGluZ1ROb2RlcywgbFZpZXcsIGNyZWF0ZU9wQ29kZXMsIGhhc0JpbmRpbmcgPyBudWxsIDogdGV4dCwgZmFsc2UpO1xuICBpZiAoaGFzQmluZGluZykge1xuICAgIGdlbmVyYXRlQmluZGluZ1VwZGF0ZU9wQ29kZXModXBkYXRlT3BDb2RlcywgdGV4dCwgdE5vZGUuaW5kZXgsIG51bGwsIDAsIG51bGwpO1xuICB9XG59XG5cbi8qKlxuICogU2VlIGBpMThuQXR0cmlidXRlc2AgYWJvdmUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpMThuQXR0cmlidXRlc0ZpcnN0UGFzcyh0VmlldzogVFZpZXcsIGluZGV4OiBudW1iZXIsIHZhbHVlczogc3RyaW5nW10pIHtcbiAgY29uc3QgcHJldmlvdXNFbGVtZW50ID0gZ2V0Q3VycmVudFROb2RlKCkhO1xuICBjb25zdCBwcmV2aW91c0VsZW1lbnRJbmRleCA9IHByZXZpb3VzRWxlbWVudC5pbmRleDtcbiAgY29uc3QgdXBkYXRlT3BDb2RlczogSTE4blVwZGF0ZU9wQ29kZXMgPSBbXSBhcyBhbnk7XG4gIGlmIChuZ0Rldk1vZGUpIHtcbiAgICBhdHRhY2hEZWJ1Z0dldHRlcih1cGRhdGVPcENvZGVzLCBpMThuVXBkYXRlT3BDb2Rlc1RvU3RyaW5nKTtcbiAgfVxuICBpZiAodFZpZXcuZmlyc3RDcmVhdGVQYXNzICYmIHRWaWV3LmRhdGFbaW5kZXhdID09PSBudWxsKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB2YWx1ZXMubGVuZ3RoOyBpICs9IDIpIHtcbiAgICAgIGNvbnN0IGF0dHJOYW1lID0gdmFsdWVzW2ldO1xuICAgICAgY29uc3QgbWVzc2FnZSA9IHZhbHVlc1tpICsgMV07XG5cbiAgICAgIGlmIChtZXNzYWdlICE9PSAnJykge1xuICAgICAgICAvLyBDaGVjayBpZiBhdHRyaWJ1dGUgdmFsdWUgY29udGFpbnMgYW4gSUNVIGFuZCB0aHJvdyBhbiBlcnJvciBpZiB0aGF0J3MgdGhlIGNhc2UuXG4gICAgICAgIC8vIElDVXMgaW4gZWxlbWVudCBhdHRyaWJ1dGVzIGFyZSBub3Qgc3VwcG9ydGVkLlxuICAgICAgICAvLyBOb3RlOiB3ZSBpbnRlbnRpb25hbGx5IHJldGFpbiB0aGUgZXJyb3IgaGVyZSBieSBub3QgdXNpbmcgYG5nRGV2TW9kZWAsIGJlY2F1c2VcbiAgICAgICAgLy8gdGhlIGB2YWx1ZWAgY2FuIGNoYW5nZSBiYXNlZCBvbiB0aGUgbG9jYWxlIGFuZCB1c2VycyBhcmVuJ3QgZ3VhcmFudGVlZCB0byBoaXRcbiAgICAgICAgLy8gYW4gaW52YWxpZCBzdHJpbmcgd2hpbGUgdGhleSdyZSBkZXZlbG9waW5nLlxuICAgICAgICBpZiAoSUNVX1JFR0VYUC50ZXN0KG1lc3NhZ2UpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICBgSUNVIGV4cHJlc3Npb25zIGFyZSBub3Qgc3VwcG9ydGVkIGluIGF0dHJpYnV0ZXMuIE1lc3NhZ2U6IFwiJHttZXNzYWdlfVwiLmApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaTE4biBhdHRyaWJ1dGVzIHRoYXQgaGl0IHRoaXMgY29kZSBwYXRoIGFyZSBndWFyYW50ZWVkIHRvIGhhdmUgYmluZGluZ3MsIGJlY2F1c2VcbiAgICAgICAgLy8gdGhlIGNvbXBpbGVyIHRyZWF0cyBzdGF0aWMgaTE4biBhdHRyaWJ1dGVzIGFzIHJlZ3VsYXIgYXR0cmlidXRlIGJpbmRpbmdzLlxuICAgICAgICAvLyBTaW5jZSB0aGlzIG1heSBub3QgYmUgdGhlIGZpcnN0IGkxOG4gYXR0cmlidXRlIG9uIHRoaXMgZWxlbWVudCB3ZSBuZWVkIHRvIHBhc3MgaW4gaG93XG4gICAgICAgIC8vIG1hbnkgcHJldmlvdXMgYmluZGluZ3MgdGhlcmUgaGF2ZSBhbHJlYWR5IGJlZW4uXG4gICAgICAgIGdlbmVyYXRlQmluZGluZ1VwZGF0ZU9wQ29kZXMoXG4gICAgICAgICAgICB1cGRhdGVPcENvZGVzLCBtZXNzYWdlLCBwcmV2aW91c0VsZW1lbnRJbmRleCwgYXR0ck5hbWUsIGNvdW50QmluZGluZ3ModXBkYXRlT3BDb2RlcyksXG4gICAgICAgICAgICBudWxsKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdFZpZXcuZGF0YVtpbmRleF0gPSB1cGRhdGVPcENvZGVzO1xuICB9XG59XG5cblxuLyoqXG4gKiBHZW5lcmF0ZSB0aGUgT3BDb2RlcyB0byB1cGRhdGUgdGhlIGJpbmRpbmdzIG9mIGEgc3RyaW5nLlxuICpcbiAqIEBwYXJhbSB1cGRhdGVPcENvZGVzIFBsYWNlIHdoZXJlIHRoZSB1cGRhdGUgb3Bjb2RlcyB3aWxsIGJlIHN0b3JlZC5cbiAqIEBwYXJhbSBzdHIgVGhlIHN0cmluZyBjb250YWluaW5nIHRoZSBiaW5kaW5ncy5cbiAqIEBwYXJhbSBkZXN0aW5hdGlvbk5vZGUgSW5kZXggb2YgdGhlIGRlc3RpbmF0aW9uIG5vZGUgd2hpY2ggd2lsbCByZWNlaXZlIHRoZSBiaW5kaW5nLlxuICogQHBhcmFtIGF0dHJOYW1lIE5hbWUgb2YgdGhlIGF0dHJpYnV0ZSwgaWYgdGhlIHN0cmluZyBiZWxvbmdzIHRvIGFuIGF0dHJpYnV0ZS5cbiAqIEBwYXJhbSBzYW5pdGl6ZUZuIFNhbml0aXphdGlvbiBmdW5jdGlvbiB1c2VkIHRvIHNhbml0aXplIHRoZSBzdHJpbmcgYWZ0ZXIgdXBkYXRlLCBpZiBuZWNlc3NhcnkuXG4gKiBAcGFyYW0gYmluZGluZ1N0YXJ0IFRoZSBsVmlldyBpbmRleCBvZiB0aGUgbmV4dCBleHByZXNzaW9uIHRoYXQgY2FuIGJlIGJvdW5kIHZpYSBhbiBvcENvZGUuXG4gKiBAcmV0dXJucyBUaGUgbWFzayB2YWx1ZSBmb3IgdGhlc2UgYmluZGluZ3NcbiAqL1xuZnVuY3Rpb24gZ2VuZXJhdGVCaW5kaW5nVXBkYXRlT3BDb2RlcyhcbiAgICB1cGRhdGVPcENvZGVzOiBJMThuVXBkYXRlT3BDb2Rlcywgc3RyOiBzdHJpbmcsIGRlc3RpbmF0aW9uTm9kZTogbnVtYmVyLCBhdHRyTmFtZTogc3RyaW5nfG51bGwsXG4gICAgYmluZGluZ1N0YXJ0OiBudW1iZXIsIHNhbml0aXplRm46IFNhbml0aXplckZufG51bGwpOiBudW1iZXIge1xuICBuZ0Rldk1vZGUgJiZcbiAgICAgIGFzc2VydEdyZWF0ZXJUaGFuT3JFcXVhbChcbiAgICAgICAgICBkZXN0aW5hdGlvbk5vZGUsIEhFQURFUl9PRkZTRVQsICdJbmRleCBtdXN0IGJlIGluIGFic29sdXRlIExWaWV3IG9mZnNldCcpO1xuICBjb25zdCBtYXNrSW5kZXggPSB1cGRhdGVPcENvZGVzLmxlbmd0aDsgIC8vIExvY2F0aW9uIG9mIG1hc2tcbiAgY29uc3Qgc2l6ZUluZGV4ID0gbWFza0luZGV4ICsgMTsgICAgICAgICAvLyBsb2NhdGlvbiBvZiBzaXplIGZvciBza2lwcGluZ1xuICB1cGRhdGVPcENvZGVzLnB1c2gobnVsbCwgbnVsbCk7ICAgICAgICAgIC8vIEFsbG9jIHNwYWNlIGZvciBtYXNrIGFuZCBzaXplXG4gIGNvbnN0IHN0YXJ0SW5kZXggPSBtYXNrSW5kZXggKyAyOyAgICAgICAgLy8gbG9jYXRpb24gb2YgZmlyc3QgYWxsb2NhdGlvbi5cbiAgaWYgKG5nRGV2TW9kZSkge1xuICAgIGF0dGFjaERlYnVnR2V0dGVyKHVwZGF0ZU9wQ29kZXMsIGkxOG5VcGRhdGVPcENvZGVzVG9TdHJpbmcpO1xuICB9XG4gIGNvbnN0IHRleHRQYXJ0cyA9IHN0ci5zcGxpdChCSU5ESU5HX1JFR0VYUCk7XG4gIGxldCBtYXNrID0gMDtcblxuICBmb3IgKGxldCBqID0gMDsgaiA8IHRleHRQYXJ0cy5sZW5ndGg7IGorKykge1xuICAgIGNvbnN0IHRleHRWYWx1ZSA9IHRleHRQYXJ0c1tqXTtcblxuICAgIGlmIChqICYgMSkge1xuICAgICAgLy8gT2RkIGluZGV4ZXMgYXJlIGJpbmRpbmdzXG4gICAgICBjb25zdCBiaW5kaW5nSW5kZXggPSBiaW5kaW5nU3RhcnQgKyBwYXJzZUludCh0ZXh0VmFsdWUsIDEwKTtcbiAgICAgIHVwZGF0ZU9wQ29kZXMucHVzaCgtMSAtIGJpbmRpbmdJbmRleCk7XG4gICAgICBtYXNrID0gbWFzayB8IHRvTWFza0JpdChiaW5kaW5nSW5kZXgpO1xuICAgIH0gZWxzZSBpZiAodGV4dFZhbHVlICE9PSAnJykge1xuICAgICAgLy8gRXZlbiBpbmRleGVzIGFyZSB0ZXh0XG4gICAgICB1cGRhdGVPcENvZGVzLnB1c2godGV4dFZhbHVlKTtcbiAgICB9XG4gIH1cblxuICB1cGRhdGVPcENvZGVzLnB1c2goXG4gICAgICBkZXN0aW5hdGlvbk5vZGUgPDwgSTE4blVwZGF0ZU9wQ29kZS5TSElGVF9SRUYgfFxuICAgICAgKGF0dHJOYW1lID8gSTE4blVwZGF0ZU9wQ29kZS5BdHRyIDogSTE4blVwZGF0ZU9wQ29kZS5UZXh0KSk7XG4gIGlmIChhdHRyTmFtZSkge1xuICAgIHVwZGF0ZU9wQ29kZXMucHVzaChhdHRyTmFtZSwgc2FuaXRpemVGbik7XG4gIH1cbiAgdXBkYXRlT3BDb2Rlc1ttYXNrSW5kZXhdID0gbWFzaztcbiAgdXBkYXRlT3BDb2Rlc1tzaXplSW5kZXhdID0gdXBkYXRlT3BDb2Rlcy5sZW5ndGggLSBzdGFydEluZGV4O1xuICByZXR1cm4gbWFzaztcbn1cblxuLyoqXG4gKiBDb3VudCB0aGUgbnVtYmVyIG9mIGJpbmRpbmdzIGluIHRoZSBnaXZlbiBgb3BDb2Rlc2AuXG4gKlxuICogSXQgY291bGQgYmUgcG9zc2libGUgdG8gc3BlZWQgdGhpcyB1cCwgYnkgcGFzc2luZyB0aGUgbnVtYmVyIG9mIGJpbmRpbmdzIGZvdW5kIGJhY2sgZnJvbVxuICogYGdlbmVyYXRlQmluZGluZ1VwZGF0ZU9wQ29kZXMoKWAgdG8gYGkxOG5BdHRyaWJ1dGVzRmlyc3RQYXNzKClgIGJ1dCB0aGlzIHdvdWxkIHRoZW4gcmVxdWlyZSBtb3JlXG4gKiBjb21wbGV4aXR5IGluIHRoZSBjb2RlIGFuZC9vciB0cmFuc2llbnQgb2JqZWN0cyB0byBiZSBjcmVhdGVkLlxuICpcbiAqIFNpbmNlIHRoaXMgZnVuY3Rpb24gaXMgb25seSBjYWxsZWQgb25jZSB3aGVuIHRoZSB0ZW1wbGF0ZSBpcyBpbnN0YW50aWF0ZWQsIGlzIHRyaXZpYWwgaW4gdGhlXG4gKiBmaXJzdCBpbnN0YW5jZSAoc2luY2UgYG9wQ29kZXNgIHdpbGwgYmUgYW4gZW1wdHkgYXJyYXkpLCBhbmQgaXQgaXMgbm90IGNvbW1vbiBmb3IgZWxlbWVudHMgdG9cbiAqIGNvbnRhaW4gbXVsdGlwbGUgaTE4biBib3VuZCBhdHRyaWJ1dGVzLCBpdCBzZWVtcyBsaWtlIHRoaXMgaXMgYSByZWFzb25hYmxlIGNvbXByb21pc2UuXG4gKi9cbmZ1bmN0aW9uIGNvdW50QmluZGluZ3Mob3BDb2RlczogSTE4blVwZGF0ZU9wQ29kZXMpOiBudW1iZXIge1xuICBsZXQgY291bnQgPSAwO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IG9wQ29kZXMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBvcENvZGUgPSBvcENvZGVzW2ldO1xuICAgIC8vIEJpbmRpbmdzIGFyZSBuZWdhdGl2ZSBudW1iZXJzLlxuICAgIGlmICh0eXBlb2Ygb3BDb2RlID09PSAnbnVtYmVyJyAmJiBvcENvZGUgPCAwKSB7XG4gICAgICBjb3VudCsrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gY291bnQ7XG59XG5cbi8qKlxuICogQ29udmVydCBiaW5kaW5nIGluZGV4IHRvIG1hc2sgYml0LlxuICpcbiAqIEVhY2ggaW5kZXggcmVwcmVzZW50cyBhIHNpbmdsZSBiaXQgb24gdGhlIGJpdC1tYXNrLiBCZWNhdXNlIGJpdC1tYXNrIG9ubHkgaGFzIDMyIGJpdHMsIHdlIG1ha2VcbiAqIHRoZSAzMm5kIGJpdCBzaGFyZSBhbGwgbWFza3MgZm9yIGFsbCBiaW5kaW5ncyBoaWdoZXIgdGhhbiAzMi4gU2luY2UgaXQgaXMgZXh0cmVtZWx5IHJhcmUgdG9cbiAqIGhhdmUgbW9yZSB0aGFuIDMyIGJpbmRpbmdzIHRoaXMgd2lsbCBiZSBoaXQgdmVyeSByYXJlbHkuIFRoZSBkb3duc2lkZSBvZiBoaXR0aW5nIHRoaXMgY29ybmVyXG4gKiBjYXNlIGlzIHRoYXQgd2Ugd2lsbCBleGVjdXRlIGJpbmRpbmcgY29kZSBtb3JlIG9mdGVuIHRoYW4gbmVjZXNzYXJ5LiAocGVuYWx0eSBvZiBwZXJmb3JtYW5jZSlcbiAqL1xuZnVuY3Rpb24gdG9NYXNrQml0KGJpbmRpbmdJbmRleDogbnVtYmVyKTogbnVtYmVyIHtcbiAgcmV0dXJuIDEgPDwgTWF0aC5taW4oYmluZGluZ0luZGV4LCAzMSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1Jvb3RUZW1wbGF0ZU1lc3NhZ2Uoc3ViVGVtcGxhdGVJbmRleDogbnVtYmVyKTogc3ViVGVtcGxhdGVJbmRleCBpcyAtIDEge1xuICByZXR1cm4gc3ViVGVtcGxhdGVJbmRleCA9PT0gLTE7XG59XG5cblxuLyoqXG4gKiBSZW1vdmVzIGV2ZXJ5dGhpbmcgaW5zaWRlIHRoZSBzdWItdGVtcGxhdGVzIG9mIGEgbWVzc2FnZS5cbiAqL1xuZnVuY3Rpb24gcmVtb3ZlSW5uZXJUZW1wbGF0ZVRyYW5zbGF0aW9uKG1lc3NhZ2U6IHN0cmluZyk6IHN0cmluZyB7XG4gIGxldCBtYXRjaDtcbiAgbGV0IHJlcyA9ICcnO1xuICBsZXQgaW5kZXggPSAwO1xuICBsZXQgaW5UZW1wbGF0ZSA9IGZhbHNlO1xuICBsZXQgdGFnTWF0Y2hlZDtcblxuICB3aGlsZSAoKG1hdGNoID0gU1VCVEVNUExBVEVfUkVHRVhQLmV4ZWMobWVzc2FnZSkpICE9PSBudWxsKSB7XG4gICAgaWYgKCFpblRlbXBsYXRlKSB7XG4gICAgICByZXMgKz0gbWVzc2FnZS5zdWJzdHJpbmcoaW5kZXgsIG1hdGNoLmluZGV4ICsgbWF0Y2hbMF0ubGVuZ3RoKTtcbiAgICAgIHRhZ01hdGNoZWQgPSBtYXRjaFsxXTtcbiAgICAgIGluVGVtcGxhdGUgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAobWF0Y2hbMF0gPT09IGAke01BUktFUn0vKiR7dGFnTWF0Y2hlZH0ke01BUktFUn1gKSB7XG4gICAgICAgIGluZGV4ID0gbWF0Y2guaW5kZXg7XG4gICAgICAgIGluVGVtcGxhdGUgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBuZ0Rldk1vZGUgJiZcbiAgICAgIGFzc2VydEVxdWFsKFxuICAgICAgICAgIGluVGVtcGxhdGUsIGZhbHNlLFxuICAgICAgICAgIGBUYWcgbWlzbWF0Y2g6IHVuYWJsZSB0byBmaW5kIHRoZSBlbmQgb2YgdGhlIHN1Yi10ZW1wbGF0ZSBpbiB0aGUgdHJhbnNsYXRpb24gXCIke1xuICAgICAgICAgICAgICBtZXNzYWdlfVwiYCk7XG5cbiAgcmVzICs9IG1lc3NhZ2Uuc3Vic3RyKGluZGV4KTtcbiAgcmV0dXJuIHJlcztcbn1cblxuXG4vKipcbiAqIEV4dHJhY3RzIGEgcGFydCBvZiBhIG1lc3NhZ2UgYW5kIHJlbW92ZXMgdGhlIHJlc3QuXG4gKlxuICogVGhpcyBtZXRob2QgaXMgdXNlZCBmb3IgZXh0cmFjdGluZyBhIHBhcnQgb2YgdGhlIG1lc3NhZ2UgYXNzb2NpYXRlZCB3aXRoIGEgdGVtcGxhdGUuIEFcbiAqIHRyYW5zbGF0ZWQgbWVzc2FnZSBjYW4gc3BhbiBtdWx0aXBsZSB0ZW1wbGF0ZXMuXG4gKlxuICogRXhhbXBsZTpcbiAqIGBgYFxuICogPGRpdiBpMThuPlRyYW5zbGF0ZSA8c3BhbiAqbmdJZj5tZTwvc3Bhbj4hPC9kaXY+XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gbWVzc2FnZSBUaGUgbWVzc2FnZSB0byBjcm9wXG4gKiBAcGFyYW0gc3ViVGVtcGxhdGVJbmRleCBJbmRleCBvZiB0aGUgc3ViLXRlbXBsYXRlIHRvIGV4dHJhY3QuIElmIHVuZGVmaW5lZCBpdCByZXR1cm5zIHRoZVxuICogZXh0ZXJuYWwgdGVtcGxhdGUgYW5kIHJlbW92ZXMgYWxsIHN1Yi10ZW1wbGF0ZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRUcmFuc2xhdGlvbkZvclRlbXBsYXRlKG1lc3NhZ2U6IHN0cmluZywgc3ViVGVtcGxhdGVJbmRleDogbnVtYmVyKSB7XG4gIGlmIChpc1Jvb3RUZW1wbGF0ZU1lc3NhZ2Uoc3ViVGVtcGxhdGVJbmRleCkpIHtcbiAgICAvLyBXZSB3YW50IHRoZSByb290IHRlbXBsYXRlIG1lc3NhZ2UsIGlnbm9yZSBhbGwgc3ViLXRlbXBsYXRlc1xuICAgIHJldHVybiByZW1vdmVJbm5lclRlbXBsYXRlVHJhbnNsYXRpb24obWVzc2FnZSk7XG4gIH0gZWxzZSB7XG4gICAgLy8gV2Ugd2FudCBhIHNwZWNpZmljIHN1Yi10ZW1wbGF0ZVxuICAgIGNvbnN0IHN0YXJ0ID1cbiAgICAgICAgbWVzc2FnZS5pbmRleE9mKGA6JHtzdWJUZW1wbGF0ZUluZGV4fSR7TUFSS0VSfWApICsgMiArIHN1YlRlbXBsYXRlSW5kZXgudG9TdHJpbmcoKS5sZW5ndGg7XG4gICAgY29uc3QgZW5kID0gbWVzc2FnZS5zZWFyY2gobmV3IFJlZ0V4cChgJHtNQVJLRVJ9XFxcXC9cXFxcKlxcXFxkKzoke3N1YlRlbXBsYXRlSW5kZXh9JHtNQVJLRVJ9YCkpO1xuICAgIHJldHVybiByZW1vdmVJbm5lclRlbXBsYXRlVHJhbnNsYXRpb24obWVzc2FnZS5zdWJzdHJpbmcoc3RhcnQsIGVuZCkpO1xuICB9XG59XG5cbi8qKlxuICogR2VuZXJhdGUgdGhlIE9wQ29kZXMgZm9yIElDVSBleHByZXNzaW9ucy5cbiAqXG4gKiBAcGFyYW0gaWN1RXhwcmVzc2lvblxuICogQHBhcmFtIGluZGV4IEluZGV4IHdoZXJlIHRoZSBhbmNob3IgaXMgc3RvcmVkIGFuZCBhbiBvcHRpb25hbCBgVEljdUNvbnRhaW5lck5vZGVgXG4gKiAgIC0gYGxWaWV3W2FuY2hvcklkeF1gIHBvaW50cyB0byBhIGBDb21tZW50YCBub2RlIHJlcHJlc2VudGluZyB0aGUgYW5jaG9yIGZvciB0aGUgSUNVLlxuICogICAtIGB0Vmlldy5kYXRhW2FuY2hvcklkeF1gIHBvaW50cyB0byB0aGUgYFRJY3VDb250YWluZXJOb2RlYCBpZiBJQ1UgaXMgcm9vdCAoYG51bGxgIG90aGVyd2lzZSlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGljdVN0YXJ0KFxuICAgIHRWaWV3OiBUVmlldywgbFZpZXc6IExWaWV3LCB1cGRhdGVPcENvZGVzOiBJMThuVXBkYXRlT3BDb2RlcywgcGFyZW50SWR4OiBudW1iZXIsXG4gICAgaWN1RXhwcmVzc2lvbjogSWN1RXhwcmVzc2lvbiwgYW5jaG9ySWR4OiBudW1iZXIpIHtcbiAgbmdEZXZNb2RlICYmIGFzc2VydERlZmluZWQoaWN1RXhwcmVzc2lvbiwgJ0lDVSBleHByZXNzaW9uIG11c3QgYmUgZGVmaW5lZCcpO1xuICBsZXQgYmluZGluZ01hc2sgPSAwO1xuICBjb25zdCB0SWN1OiBUSWN1ID0ge1xuICAgIHR5cGU6IGljdUV4cHJlc3Npb24udHlwZSxcbiAgICBjdXJyZW50Q2FzZUxWaWV3SW5kZXg6IGFsbG9jRXhwYW5kbyh0VmlldywgbFZpZXcsIDEsIG51bGwpLFxuICAgIGFuY2hvcklkeCxcbiAgICBjYXNlczogW10sXG4gICAgY3JlYXRlOiBbXSxcbiAgICByZW1vdmU6IFtdLFxuICAgIHVwZGF0ZTogW11cbiAgfTtcbiAgYWRkVXBkYXRlSWN1U3dpdGNoKHVwZGF0ZU9wQ29kZXMsIGljdUV4cHJlc3Npb24sIGFuY2hvcklkeCk7XG4gIHNldFRJY3UodFZpZXcsIGFuY2hvcklkeCwgdEljdSk7XG4gIGNvbnN0IHZhbHVlcyA9IGljdUV4cHJlc3Npb24udmFsdWVzO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHZhbHVlcy5sZW5ndGg7IGkrKykge1xuICAgIC8vIEVhY2ggdmFsdWUgaXMgYW4gYXJyYXkgb2Ygc3RyaW5ncyAmIG90aGVyIElDVSBleHByZXNzaW9uc1xuICAgIGNvbnN0IHZhbHVlQXJyID0gdmFsdWVzW2ldO1xuICAgIGNvbnN0IG5lc3RlZEljdXM6IEljdUV4cHJlc3Npb25bXSA9IFtdO1xuICAgIGZvciAobGV0IGogPSAwOyBqIDwgdmFsdWVBcnIubGVuZ3RoOyBqKyspIHtcbiAgICAgIGNvbnN0IHZhbHVlID0gdmFsdWVBcnJbal07XG4gICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykge1xuICAgICAgICAvLyBJdCBpcyBhbiBuZXN0ZWQgSUNVIGV4cHJlc3Npb25cbiAgICAgICAgY29uc3QgaWN1SW5kZXggPSBuZXN0ZWRJY3VzLnB1c2godmFsdWUgYXMgSWN1RXhwcmVzc2lvbikgLSAxO1xuICAgICAgICAvLyBSZXBsYWNlIG5lc3RlZCBJQ1UgZXhwcmVzc2lvbiBieSBhIGNvbW1lbnQgbm9kZVxuICAgICAgICB2YWx1ZUFycltqXSA9IGA8IS0t77+9JHtpY3VJbmRleH3vv70tLT5gO1xuICAgICAgfVxuICAgIH1cbiAgICBiaW5kaW5nTWFzayA9IHBhcnNlSWN1Q2FzZShcbiAgICAgICAgICAgICAgICAgICAgICB0VmlldywgdEljdSwgbFZpZXcsIHVwZGF0ZU9wQ29kZXMsIHBhcmVudElkeCwgaWN1RXhwcmVzc2lvbi5jYXNlc1tpXSxcbiAgICAgICAgICAgICAgICAgICAgICB2YWx1ZUFyci5qb2luKCcnKSwgbmVzdGVkSWN1cykgfFxuICAgICAgICBiaW5kaW5nTWFzaztcbiAgfVxuICBpZiAoYmluZGluZ01hc2spIHtcbiAgICBhZGRVcGRhdGVJY3VVcGRhdGUodXBkYXRlT3BDb2RlcywgYmluZGluZ01hc2ssIGFuY2hvcklkeCk7XG4gIH1cbn1cblxuLyoqXG4gKiBQYXJzZXMgdGV4dCBjb250YWluaW5nIGFuIElDVSBleHByZXNzaW9uIGFuZCBwcm9kdWNlcyBhIEpTT04gb2JqZWN0IGZvciBpdC5cbiAqIE9yaWdpbmFsIGNvZGUgZnJvbSBjbG9zdXJlIGxpYnJhcnksIG1vZGlmaWVkIGZvciBBbmd1bGFyLlxuICpcbiAqIEBwYXJhbSBwYXR0ZXJuIFRleHQgY29udGFpbmluZyBhbiBJQ1UgZXhwcmVzc2lvbiB0aGF0IG5lZWRzIHRvIGJlIHBhcnNlZC5cbiAqXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUlDVUJsb2NrKHBhdHRlcm46IHN0cmluZyk6IEljdUV4cHJlc3Npb24ge1xuICBjb25zdCBjYXNlcyA9IFtdO1xuICBjb25zdCB2YWx1ZXM6IChzdHJpbmd8SWN1RXhwcmVzc2lvbilbXVtdID0gW107XG4gIGxldCBpY3VUeXBlID0gSWN1VHlwZS5wbHVyYWw7XG4gIGxldCBtYWluQmluZGluZyA9IDA7XG4gIHBhdHRlcm4gPSBwYXR0ZXJuLnJlcGxhY2UoSUNVX0JMT0NLX1JFR0VYUCwgZnVuY3Rpb24oc3RyOiBzdHJpbmcsIGJpbmRpbmc6IHN0cmluZywgdHlwZTogc3RyaW5nKSB7XG4gICAgaWYgKHR5cGUgPT09ICdzZWxlY3QnKSB7XG4gICAgICBpY3VUeXBlID0gSWN1VHlwZS5zZWxlY3Q7XG4gICAgfSBlbHNlIHtcbiAgICAgIGljdVR5cGUgPSBJY3VUeXBlLnBsdXJhbDtcbiAgICB9XG4gICAgbWFpbkJpbmRpbmcgPSBwYXJzZUludChiaW5kaW5nLnN1YnN0cigxKSwgMTApO1xuICAgIHJldHVybiAnJztcbiAgfSk7XG5cbiAgY29uc3QgcGFydHMgPSBpMThuUGFyc2VUZXh0SW50b1BhcnRzQW5kSUNVKHBhdHRlcm4pIGFzIHN0cmluZ1tdO1xuICAvLyBMb29raW5nIGZvciAoa2V5IGJsb2NrKSsgc2VxdWVuY2UuIE9uZSBvZiB0aGUga2V5cyBoYXMgdG8gYmUgXCJvdGhlclwiLlxuICBmb3IgKGxldCBwb3MgPSAwOyBwb3MgPCBwYXJ0cy5sZW5ndGg7KSB7XG4gICAgbGV0IGtleSA9IHBhcnRzW3BvcysrXS50cmltKCk7XG4gICAgaWYgKGljdVR5cGUgPT09IEljdVR5cGUucGx1cmFsKSB7XG4gICAgICAvLyBLZXkgY2FuIGJlIFwiPXhcIiwgd2UganVzdCB3YW50IFwieFwiXG4gICAgICBrZXkgPSBrZXkucmVwbGFjZSgvXFxzKig/Oj0pPyhcXHcrKVxccyovLCAnJDEnKTtcbiAgICB9XG4gICAgaWYgKGtleS5sZW5ndGgpIHtcbiAgICAgIGNhc2VzLnB1c2goa2V5KTtcbiAgICB9XG5cbiAgICBjb25zdCBibG9ja3MgPSBpMThuUGFyc2VUZXh0SW50b1BhcnRzQW5kSUNVKHBhcnRzW3BvcysrXSkgYXMgc3RyaW5nW107XG4gICAgaWYgKGNhc2VzLmxlbmd0aCA+IHZhbHVlcy5sZW5ndGgpIHtcbiAgICAgIHZhbHVlcy5wdXNoKGJsb2Nrcyk7XG4gICAgfVxuICB9XG5cbiAgLy8gVE9ETyhvY29tYmUpOiBzdXBwb3J0IElDVSBleHByZXNzaW9ucyBpbiBhdHRyaWJ1dGVzLCBzZWUgIzIxNjE1XG4gIHJldHVybiB7dHlwZTogaWN1VHlwZSwgbWFpbkJpbmRpbmc6IG1haW5CaW5kaW5nLCBjYXNlcywgdmFsdWVzfTtcbn1cblxuXG4vKipcbiAqIEJyZWFrcyBwYXR0ZXJuIGludG8gc3RyaW5ncyBhbmQgdG9wIGxldmVsIHsuLi59IGJsb2Nrcy5cbiAqIENhbiBiZSB1c2VkIHRvIGJyZWFrIGEgbWVzc2FnZSBpbnRvIHRleHQgYW5kIElDVSBleHByZXNzaW9ucywgb3IgdG8gYnJlYWsgYW4gSUNVIGV4cHJlc3Npb25cbiAqIGludG8ga2V5cyBhbmQgY2FzZXMuIE9yaWdpbmFsIGNvZGUgZnJvbSBjbG9zdXJlIGxpYnJhcnksIG1vZGlmaWVkIGZvciBBbmd1bGFyLlxuICpcbiAqIEBwYXJhbSBwYXR0ZXJuIChzdWIpUGF0dGVybiB0byBiZSBicm9rZW4uXG4gKiBAcmV0dXJucyBBbiBgQXJyYXk8c3RyaW5nfEljdUV4cHJlc3Npb24+YCB3aGVyZTpcbiAqICAgLSBvZGQgcG9zaXRpb25zOiBgc3RyaW5nYCA9PiB0ZXh0IGJldHdlZW4gSUNVIGV4cHJlc3Npb25zXG4gKiAgIC0gZXZlbiBwb3NpdGlvbnM6IGBJQ1VFeHByZXNzaW9uYCA9PiBJQ1UgZXhwcmVzc2lvbiBwYXJzZWQgaW50byBgSUNVRXhwcmVzc2lvbmAgcmVjb3JkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gaTE4blBhcnNlVGV4dEludG9QYXJ0c0FuZElDVShwYXR0ZXJuOiBzdHJpbmcpOiAoc3RyaW5nfEljdUV4cHJlc3Npb24pW10ge1xuICBpZiAoIXBhdHRlcm4pIHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICBsZXQgcHJldlBvcyA9IDA7XG4gIGNvbnN0IGJyYWNlU3RhY2sgPSBbXTtcbiAgY29uc3QgcmVzdWx0czogKHN0cmluZ3xJY3VFeHByZXNzaW9uKVtdID0gW107XG4gIGNvbnN0IGJyYWNlcyA9IC9be31dL2c7XG4gIC8vIGxhc3RJbmRleCBkb2Vzbid0IGdldCBzZXQgdG8gMCBzbyB3ZSBoYXZlIHRvLlxuICBicmFjZXMubGFzdEluZGV4ID0gMDtcblxuICBsZXQgbWF0Y2g7XG4gIHdoaWxlIChtYXRjaCA9IGJyYWNlcy5leGVjKHBhdHRlcm4pKSB7XG4gICAgY29uc3QgcG9zID0gbWF0Y2guaW5kZXg7XG4gICAgaWYgKG1hdGNoWzBdID09ICd9Jykge1xuICAgICAgYnJhY2VTdGFjay5wb3AoKTtcblxuICAgICAgaWYgKGJyYWNlU3RhY2subGVuZ3RoID09IDApIHtcbiAgICAgICAgLy8gRW5kIG9mIHRoZSBibG9jay5cbiAgICAgICAgY29uc3QgYmxvY2sgPSBwYXR0ZXJuLnN1YnN0cmluZyhwcmV2UG9zLCBwb3MpO1xuICAgICAgICBpZiAoSUNVX0JMT0NLX1JFR0VYUC50ZXN0KGJsb2NrKSkge1xuICAgICAgICAgIHJlc3VsdHMucHVzaChwYXJzZUlDVUJsb2NrKGJsb2NrKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzdWx0cy5wdXNoKGJsb2NrKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByZXZQb3MgPSBwb3MgKyAxO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoYnJhY2VTdGFjay5sZW5ndGggPT0gMCkge1xuICAgICAgICBjb25zdCBzdWJzdHJpbmcgPSBwYXR0ZXJuLnN1YnN0cmluZyhwcmV2UG9zLCBwb3MpO1xuICAgICAgICByZXN1bHRzLnB1c2goc3Vic3RyaW5nKTtcbiAgICAgICAgcHJldlBvcyA9IHBvcyArIDE7XG4gICAgICB9XG4gICAgICBicmFjZVN0YWNrLnB1c2goJ3snKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBzdWJzdHJpbmcgPSBwYXR0ZXJuLnN1YnN0cmluZyhwcmV2UG9zKTtcbiAgcmVzdWx0cy5wdXNoKHN1YnN0cmluZyk7XG4gIHJldHVybiByZXN1bHRzO1xufVxuXG5cbi8qKlxuICogUGFyc2VzIGEgbm9kZSwgaXRzIGNoaWxkcmVuIGFuZCBpdHMgc2libGluZ3MsIGFuZCBnZW5lcmF0ZXMgdGhlIG11dGF0ZSAmIHVwZGF0ZSBPcENvZGVzLlxuICpcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlSWN1Q2FzZShcbiAgICB0VmlldzogVFZpZXcsIHRJY3U6IFRJY3UsIGxWaWV3OiBMVmlldywgdXBkYXRlT3BDb2RlczogSTE4blVwZGF0ZU9wQ29kZXMsIHBhcmVudElkeDogbnVtYmVyLFxuICAgIGNhc2VOYW1lOiBzdHJpbmcsIHVuc2FmZUNhc2VIdG1sOiBzdHJpbmcsIG5lc3RlZEljdXM6IEljdUV4cHJlc3Npb25bXSk6IG51bWJlciB7XG4gIGNvbnN0IGNyZWF0ZTogSWN1Q3JlYXRlT3BDb2RlcyA9IFtdIGFzIGFueTtcbiAgY29uc3QgcmVtb3ZlOiBJMThuUmVtb3ZlT3BDb2RlcyA9IFtdIGFzIGFueTtcbiAgY29uc3QgdXBkYXRlOiBJMThuVXBkYXRlT3BDb2RlcyA9IFtdIGFzIGFueTtcbiAgaWYgKG5nRGV2TW9kZSkge1xuICAgIGF0dGFjaERlYnVnR2V0dGVyKGNyZWF0ZSwgaWN1Q3JlYXRlT3BDb2Rlc1RvU3RyaW5nKTtcbiAgICBhdHRhY2hEZWJ1Z0dldHRlcihyZW1vdmUsIGkxOG5SZW1vdmVPcENvZGVzVG9TdHJpbmcpO1xuICAgIGF0dGFjaERlYnVnR2V0dGVyKHVwZGF0ZSwgaTE4blVwZGF0ZU9wQ29kZXNUb1N0cmluZyk7XG4gIH1cbiAgdEljdS5jYXNlcy5wdXNoKGNhc2VOYW1lKTtcbiAgdEljdS5jcmVhdGUucHVzaChjcmVhdGUpO1xuICB0SWN1LnJlbW92ZS5wdXNoKHJlbW92ZSk7XG4gIHRJY3UudXBkYXRlLnB1c2godXBkYXRlKTtcblxuICBjb25zdCBpbmVydEJvZHlIZWxwZXIgPSBnZXRJbmVydEJvZHlIZWxwZXIoZ2V0RG9jdW1lbnQoKSk7XG4gIGNvbnN0IGluZXJ0Qm9keUVsZW1lbnQgPSBpbmVydEJvZHlIZWxwZXIuZ2V0SW5lcnRCb2R5RWxlbWVudCh1bnNhZmVDYXNlSHRtbCk7XG4gIG5nRGV2TW9kZSAmJiBhc3NlcnREZWZpbmVkKGluZXJ0Qm9keUVsZW1lbnQsICdVbmFibGUgdG8gZ2VuZXJhdGUgaW5lcnQgYm9keSBlbGVtZW50Jyk7XG4gIGNvbnN0IGluZXJ0Um9vdE5vZGUgPSBnZXRUZW1wbGF0ZUNvbnRlbnQoaW5lcnRCb2R5RWxlbWVudCEpIGFzIEVsZW1lbnQgfHwgaW5lcnRCb2R5RWxlbWVudDtcbiAgaWYgKGluZXJ0Um9vdE5vZGUpIHtcbiAgICByZXR1cm4gd2Fsa0ljdVRyZWUoXG4gICAgICAgIHRWaWV3LCB0SWN1LCBsVmlldywgdXBkYXRlT3BDb2RlcywgY3JlYXRlLCByZW1vdmUsIHVwZGF0ZSwgaW5lcnRSb290Tm9kZSwgcGFyZW50SWR4LFxuICAgICAgICBuZXN0ZWRJY3VzLCAwKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gMDtcbiAgfVxufVxuXG5mdW5jdGlvbiB3YWxrSWN1VHJlZShcbiAgICB0VmlldzogVFZpZXcsIHRJY3U6IFRJY3UsIGxWaWV3OiBMVmlldywgc2hhcmVkVXBkYXRlT3BDb2RlczogSTE4blVwZGF0ZU9wQ29kZXMsXG4gICAgY3JlYXRlOiBJY3VDcmVhdGVPcENvZGVzLCByZW1vdmU6IEkxOG5SZW1vdmVPcENvZGVzLCB1cGRhdGU6IEkxOG5VcGRhdGVPcENvZGVzLFxuICAgIHBhcmVudE5vZGU6IEVsZW1lbnQsIHBhcmVudElkeDogbnVtYmVyLCBuZXN0ZWRJY3VzOiBJY3VFeHByZXNzaW9uW10sIGRlcHRoOiBudW1iZXIpOiBudW1iZXIge1xuICBsZXQgYmluZGluZ01hc2sgPSAwO1xuICBsZXQgY3VycmVudE5vZGUgPSBwYXJlbnROb2RlLmZpcnN0Q2hpbGQ7XG4gIHdoaWxlIChjdXJyZW50Tm9kZSkge1xuICAgIGNvbnN0IG5ld0luZGV4ID0gYWxsb2NFeHBhbmRvKHRWaWV3LCBsVmlldywgMSwgbnVsbCk7XG4gICAgc3dpdGNoIChjdXJyZW50Tm9kZS5ub2RlVHlwZSkge1xuICAgICAgY2FzZSBOb2RlLkVMRU1FTlRfTk9ERTpcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IGN1cnJlbnROb2RlIGFzIEVsZW1lbnQ7XG4gICAgICAgIGNvbnN0IHRhZ05hbWUgPSBlbGVtZW50LnRhZ05hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgaWYgKFZBTElEX0VMRU1FTlRTLmhhc093blByb3BlcnR5KHRhZ05hbWUpKSB7XG4gICAgICAgICAgYWRkQ3JlYXRlTm9kZUFuZEFwcGVuZChjcmVhdGUsIEVMRU1FTlRfTUFSS0VSLCB0YWdOYW1lLCBwYXJlbnRJZHgsIG5ld0luZGV4KTtcbiAgICAgICAgICB0Vmlldy5kYXRhW25ld0luZGV4XSA9IHRhZ05hbWU7XG4gICAgICAgICAgY29uc3QgZWxBdHRycyA9IGVsZW1lbnQuYXR0cmlidXRlcztcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGVsQXR0cnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGF0dHIgPSBlbEF0dHJzLml0ZW0oaSkhO1xuICAgICAgICAgICAgY29uc3QgbG93ZXJBdHRyTmFtZSA9IGF0dHIubmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgY29uc3QgaGFzQmluZGluZyA9ICEhYXR0ci52YWx1ZS5tYXRjaChCSU5ESU5HX1JFR0VYUCk7XG4gICAgICAgICAgICAvLyB3ZSBhc3N1bWUgdGhlIGlucHV0IHN0cmluZyBpcyBzYWZlLCB1bmxlc3MgaXQncyB1c2luZyBhIGJpbmRpbmdcbiAgICAgICAgICAgIGlmIChoYXNCaW5kaW5nKSB7XG4gICAgICAgICAgICAgIGlmIChWQUxJRF9BVFRSUy5oYXNPd25Qcm9wZXJ0eShsb3dlckF0dHJOYW1lKSkge1xuICAgICAgICAgICAgICAgIGlmIChVUklfQVRUUlNbbG93ZXJBdHRyTmFtZV0pIHtcbiAgICAgICAgICAgICAgICAgIGdlbmVyYXRlQmluZGluZ1VwZGF0ZU9wQ29kZXMoXG4gICAgICAgICAgICAgICAgICAgICAgdXBkYXRlLCBhdHRyLnZhbHVlLCBuZXdJbmRleCwgYXR0ci5uYW1lLCAwLCBfc2FuaXRpemVVcmwpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoU1JDU0VUX0FUVFJTW2xvd2VyQXR0ck5hbWVdKSB7XG4gICAgICAgICAgICAgICAgICBnZW5lcmF0ZUJpbmRpbmdVcGRhdGVPcENvZGVzKFxuICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZSwgYXR0ci52YWx1ZSwgbmV3SW5kZXgsIGF0dHIubmFtZSwgMCwgc2FuaXRpemVTcmNzZXQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBnZW5lcmF0ZUJpbmRpbmdVcGRhdGVPcENvZGVzKHVwZGF0ZSwgYXR0ci52YWx1ZSwgbmV3SW5kZXgsIGF0dHIubmFtZSwgMCwgbnVsbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5nRGV2TW9kZSAmJlxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICAgICAgICAgICAgICAgICBgV0FSTklORzogaWdub3JpbmcgdW5zYWZlIGF0dHJpYnV0ZSB2YWx1ZSBgICtcbiAgICAgICAgICAgICAgICAgICAgICAgIGAke2xvd2VyQXR0ck5hbWV9IG9uIGVsZW1lbnQgJHt0YWdOYW1lfSBgICtcbiAgICAgICAgICAgICAgICAgICAgICAgIGAoc2VlIGh0dHBzOi8vZy5jby9uZy9zZWN1cml0eSN4c3MpYCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGFkZENyZWF0ZUF0dHJpYnV0ZShjcmVhdGUsIG5ld0luZGV4LCBhdHRyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gUGFyc2UgdGhlIGNoaWxkcmVuIG9mIHRoaXMgbm9kZSAoaWYgYW55KVxuICAgICAgICAgIGJpbmRpbmdNYXNrID0gd2Fsa0ljdVRyZWUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdFZpZXcsIHRJY3UsIGxWaWV3LCBzaGFyZWRVcGRhdGVPcENvZGVzLCBjcmVhdGUsIHJlbW92ZSwgdXBkYXRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnROb2RlIGFzIEVsZW1lbnQsIG5ld0luZGV4LCBuZXN0ZWRJY3VzLCBkZXB0aCArIDEpIHxcbiAgICAgICAgICAgICAgYmluZGluZ01hc2s7XG4gICAgICAgICAgYWRkUmVtb3ZlTm9kZShyZW1vdmUsIG5ld0luZGV4LCBkZXB0aCk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIE5vZGUuVEVYVF9OT0RFOlxuICAgICAgICBjb25zdCB2YWx1ZSA9IGN1cnJlbnROb2RlLnRleHRDb250ZW50IHx8ICcnO1xuICAgICAgICBjb25zdCBoYXNCaW5kaW5nID0gdmFsdWUubWF0Y2goQklORElOR19SRUdFWFApO1xuICAgICAgICBhZGRDcmVhdGVOb2RlQW5kQXBwZW5kKGNyZWF0ZSwgbnVsbCwgaGFzQmluZGluZyA/ICcnIDogdmFsdWUsIHBhcmVudElkeCwgbmV3SW5kZXgpO1xuICAgICAgICBhZGRSZW1vdmVOb2RlKHJlbW92ZSwgbmV3SW5kZXgsIGRlcHRoKTtcbiAgICAgICAgaWYgKGhhc0JpbmRpbmcpIHtcbiAgICAgICAgICBiaW5kaW5nTWFzayA9XG4gICAgICAgICAgICAgIGdlbmVyYXRlQmluZGluZ1VwZGF0ZU9wQ29kZXModXBkYXRlLCB2YWx1ZSwgbmV3SW5kZXgsIG51bGwsIDAsIG51bGwpIHwgYmluZGluZ01hc2s7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIE5vZGUuQ09NTUVOVF9OT0RFOlxuICAgICAgICAvLyBDaGVjayBpZiB0aGUgY29tbWVudCBub2RlIGlzIGEgcGxhY2Vob2xkZXIgZm9yIGEgbmVzdGVkIElDVVxuICAgICAgICBjb25zdCBpc05lc3RlZEljdSA9IE5FU1RFRF9JQ1UuZXhlYyhjdXJyZW50Tm9kZS50ZXh0Q29udGVudCB8fCAnJyk7XG4gICAgICAgIGlmIChpc05lc3RlZEljdSkge1xuICAgICAgICAgIGNvbnN0IG5lc3RlZEljdUluZGV4ID0gcGFyc2VJbnQoaXNOZXN0ZWRJY3VbMV0sIDEwKTtcbiAgICAgICAgICBjb25zdCBpY3VFeHByZXNzaW9uOiBJY3VFeHByZXNzaW9uID0gbmVzdGVkSWN1c1tuZXN0ZWRJY3VJbmRleF07XG4gICAgICAgICAgLy8gQ3JlYXRlIHRoZSBjb21tZW50IG5vZGUgdGhhdCB3aWxsIGFuY2hvciB0aGUgSUNVIGV4cHJlc3Npb25cbiAgICAgICAgICBhZGRDcmVhdGVOb2RlQW5kQXBwZW5kKFxuICAgICAgICAgICAgICBjcmVhdGUsIElDVV9NQVJLRVIsIG5nRGV2TW9kZSA/IGBuZXN0ZWQgSUNVICR7bmVzdGVkSWN1SW5kZXh9YCA6ICcnLCBwYXJlbnRJZHgsXG4gICAgICAgICAgICAgIG5ld0luZGV4KTtcbiAgICAgICAgICBpY3VTdGFydCh0VmlldywgbFZpZXcsIHNoYXJlZFVwZGF0ZU9wQ29kZXMsIHBhcmVudElkeCwgaWN1RXhwcmVzc2lvbiwgbmV3SW5kZXgpO1xuICAgICAgICAgIGFkZFJlbW92ZU5lc3RlZEljdShyZW1vdmUsIG5ld0luZGV4LCBkZXB0aCk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGN1cnJlbnROb2RlID0gY3VycmVudE5vZGUubmV4dFNpYmxpbmc7XG4gIH1cbiAgcmV0dXJuIGJpbmRpbmdNYXNrO1xufVxuXG5mdW5jdGlvbiBhZGRSZW1vdmVOb2RlKHJlbW92ZTogSTE4blJlbW92ZU9wQ29kZXMsIGluZGV4OiBudW1iZXIsIGRlcHRoOiBudW1iZXIpIHtcbiAgaWYgKGRlcHRoID09PSAwKSB7XG4gICAgcmVtb3ZlLnB1c2goaW5kZXgpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFkZFJlbW92ZU5lc3RlZEljdShyZW1vdmU6IEkxOG5SZW1vdmVPcENvZGVzLCBpbmRleDogbnVtYmVyLCBkZXB0aDogbnVtYmVyKSB7XG4gIGlmIChkZXB0aCA9PT0gMCkge1xuICAgIHJlbW92ZS5wdXNoKH5pbmRleCk7ICAvLyByZW1vdmUgSUNVIGF0IGBpbmRleGBcbiAgICByZW1vdmUucHVzaChpbmRleCk7ICAgLy8gcmVtb3ZlIElDVSBjb21tZW50IGF0IGBpbmRleGBcbiAgfVxufVxuXG5mdW5jdGlvbiBhZGRVcGRhdGVJY3VTd2l0Y2goXG4gICAgdXBkYXRlOiBJMThuVXBkYXRlT3BDb2RlcywgaWN1RXhwcmVzc2lvbjogSWN1RXhwcmVzc2lvbiwgaW5kZXg6IG51bWJlcikge1xuICB1cGRhdGUucHVzaChcbiAgICAgIHRvTWFza0JpdChpY3VFeHByZXNzaW9uLm1haW5CaW5kaW5nKSwgMiwgLTEgLSBpY3VFeHByZXNzaW9uLm1haW5CaW5kaW5nLFxuICAgICAgaW5kZXggPDwgSTE4blVwZGF0ZU9wQ29kZS5TSElGVF9SRUYgfCBJMThuVXBkYXRlT3BDb2RlLkljdVN3aXRjaCk7XG59XG5cbmZ1bmN0aW9uIGFkZFVwZGF0ZUljdVVwZGF0ZSh1cGRhdGU6IEkxOG5VcGRhdGVPcENvZGVzLCBiaW5kaW5nTWFzazogbnVtYmVyLCBpbmRleDogbnVtYmVyKSB7XG4gIHVwZGF0ZS5wdXNoKGJpbmRpbmdNYXNrLCAxLCBpbmRleCA8PCBJMThuVXBkYXRlT3BDb2RlLlNISUZUX1JFRiB8IEkxOG5VcGRhdGVPcENvZGUuSWN1VXBkYXRlKTtcbn1cblxuZnVuY3Rpb24gYWRkQ3JlYXRlTm9kZUFuZEFwcGVuZChcbiAgICBjcmVhdGU6IEljdUNyZWF0ZU9wQ29kZXMsIG1hcmtlcjogbnVsbHxJQ1VfTUFSS0VSfEVMRU1FTlRfTUFSS0VSLCB0ZXh0OiBzdHJpbmcsXG4gICAgYXBwZW5kVG9QYXJlbnRJZHg6IG51bWJlciwgY3JlYXRlQXRJZHg6IG51bWJlcikge1xuICBpZiAobWFya2VyICE9PSBudWxsKSB7XG4gICAgY3JlYXRlLnB1c2gobWFya2VyKTtcbiAgfVxuICBjcmVhdGUucHVzaChcbiAgICAgIHRleHQsIGNyZWF0ZUF0SWR4LFxuICAgICAgaWN1Q3JlYXRlT3BDb2RlKEljdUNyZWF0ZU9wQ29kZS5BcHBlbmRDaGlsZCwgYXBwZW5kVG9QYXJlbnRJZHgsIGNyZWF0ZUF0SWR4KSk7XG59XG5cbmZ1bmN0aW9uIGFkZENyZWF0ZUF0dHJpYnV0ZShjcmVhdGU6IEljdUNyZWF0ZU9wQ29kZXMsIG5ld0luZGV4OiBudW1iZXIsIGF0dHI6IEF0dHIpIHtcbiAgY3JlYXRlLnB1c2gobmV3SW5kZXggPDwgSWN1Q3JlYXRlT3BDb2RlLlNISUZUX1JFRiB8IEljdUNyZWF0ZU9wQ29kZS5BdHRyLCBhdHRyLm5hbWUsIGF0dHIudmFsdWUpO1xufVxuIl19