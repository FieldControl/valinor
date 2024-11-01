/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import '../../util/ng_dev_mode';
import '../../util/ng_i18n_closure_mode';
import { XSS_SECURITY_URL } from '../../error_details_base_url';
import { getTemplateContent, URI_ATTRS, VALID_ATTRS, VALID_ELEMENTS, } from '../../sanitization/html_sanitizer';
import { getInertBodyHelper } from '../../sanitization/inert_body';
import { _sanitizeUrl } from '../../sanitization/url_sanitizer';
import { assertDefined, assertEqual, assertGreaterThanOrEqual, assertOneOf, assertString, } from '../../util/assert';
import { loadIcuContainerVisitor } from '../instructions/i18n_icu_container_visitor';
import { allocExpando, createTNodeAtIndex } from '../instructions/shared';
import { getDocument } from '../interfaces/document';
import { ELEMENT_MARKER, I18nCreateOpCode, ICU_MARKER, } from '../interfaces/i18n';
import { HEADER_OFFSET } from '../interfaces/view';
import { getCurrentParentTNode, getCurrentTNode, setCurrentTNode } from '../state';
import { i18nCreateOpCodesToString, i18nRemoveOpCodesToString, i18nUpdateOpCodesToString, icuCreateOpCodesToString, } from './i18n_debug';
import { addTNodeAndUpdateInsertBeforeIndex } from './i18n_insert_before_index';
import { ensureIcuContainerVisitorLoaded } from './i18n_tree_shaking';
import { createTNodePlaceholder, icuCreateOpCode, isRootTemplateMessage, setTIcu, setTNodeInsertBeforeIndex, } from './i18n_util';
const BINDING_REGEXP = /�(\d+):?\d*�/gi;
const ICU_REGEXP = /({\s*�\d+:?\d*�\s*,\s*\S{6}\s*,[\s\S]*})/gi;
const NESTED_ICU = /�(\d+)�/;
const ICU_BLOCK_REGEXP = /^\s*(�\d+:?\d*�)\s*,\s*(select|plural)\s*,/;
const MARKER = `�`;
const SUBTEMPLATE_REGEXP = /�\/?\*(\d+:\d+)�/gi;
const PH_REGEXP = /�(\/?[#*]\d+):?\d*�/gi;
/**
 * Angular uses the special entity &ngsp; as a placeholder for non-removable space.
 * It's replaced by the 0xE500 PUA (Private Use Areas) unicode character and later on replaced by a
 * space.
 * We are re-implementing the same idea since translations might contain this special character.
 */
const NGSP_UNICODE_REGEXP = /\uE500/g;
function replaceNgsp(value) {
    return value.replace(NGSP_UNICODE_REGEXP, ' ');
}
/**
 * Patch a `debug` property getter on top of the existing object.
 *
 * NOTE: always call this method with `ngDevMode && attachDebugObject(...)`
 *
 * @param obj Object to patch
 * @param debugGetter Getter returning a value to patch
 */
function attachDebugGetter(obj, debugGetter) {
    if (ngDevMode) {
        Object.defineProperty(obj, 'debug', { get: debugGetter, enumerable: false });
    }
    else {
        throw new Error('This method should be guarded with `ngDevMode` so that it can be tree shaken in production!');
    }
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
    const astStack = [[]];
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
                        i18nStartFirstCreatePassProcessTextNode(astStack[0], tView, rootTNode, existingTNodeStack[0], createOpCodes, updateOpCodes, lView, text);
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
                    icuStart(astStack[0], tView, lView, updateOpCodes, parentTNodeIndex, icuExpression, icuNodeIndex);
                }
            }
        }
        else {
            // Odd indexes are placeholders (elements and sub-templates)
            // At this point value is something like: '/#1:2' (originally coming from '�/#1:2�')
            const isClosing = value.charCodeAt(0) === 47 /* CharCode.SLASH */;
            const type = value.charCodeAt(isClosing ? 1 : 0);
            ngDevMode && assertOneOf(type, 42 /* CharCode.STAR */, 35 /* CharCode.HASH */);
            const index = HEADER_OFFSET + Number.parseInt(value.substring(isClosing ? 2 : 1));
            if (isClosing) {
                existingTNodeStack.shift();
                astStack.shift();
                setCurrentTNode(getCurrentParentTNode(), false);
            }
            else {
                const tNode = createTNodePlaceholder(tView, existingTNodeStack[0], index);
                existingTNodeStack.unshift([]);
                setCurrentTNode(tNode, true);
                const placeholderNode = {
                    kind: 2 /* I18nNodeKind.PLACEHOLDER */,
                    index,
                    children: [],
                    type: type === 35 /* CharCode.HASH */ ? 0 /* I18nPlaceholderType.ELEMENT */ : 1 /* I18nPlaceholderType.SUBTEMPLATE */,
                };
                astStack[0].push(placeholderNode);
                astStack.unshift(placeholderNode.children);
            }
        }
    }
    tView.data[index] = {
        create: createOpCodes,
        update: updateOpCodes,
        ast: astStack[0],
        parentTNodeIndex,
    };
}
/**
 * Allocate space in i18n Range add create OpCode instruction to create a text or comment node.
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
    const tNode = createTNodeAtIndex(tView, i18nNodeIdx, isICU ? 32 /* TNodeType.Icu */ : 1 /* TNodeType.Text */, text === null ? (ngDevMode ? '{{?}}' : '') : text, null);
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
function i18nStartFirstCreatePassProcessTextNode(ast, tView, rootTNode, existingTNodes, createOpCodes, updateOpCodes, lView, text) {
    const hasBinding = text.match(BINDING_REGEXP);
    const tNode = createTNodeAndAddOpCode(tView, rootTNode, existingTNodes, lView, createOpCodes, hasBinding ? null : text, false);
    const index = tNode.index;
    if (hasBinding) {
        generateBindingUpdateOpCodes(updateOpCodes, text, index, null, 0, null);
    }
    ast.push({ kind: 0 /* I18nNodeKind.TEXT */, index });
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
    updateOpCodes.push((destinationNode << 2 /* I18nUpdateOpCode.SHIFT_REF */) |
        (attrName ? 1 /* I18nUpdateOpCode.Attr */ : 0 /* I18nUpdateOpCode.Text */));
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
    res += message.slice(index);
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
function icuStart(ast, tView, lView, updateOpCodes, parentIdx, icuExpression, anchorIdx) {
    ngDevMode && assertDefined(icuExpression, 'ICU expression must be defined');
    let bindingMask = 0;
    const tIcu = {
        type: icuExpression.type,
        currentCaseLViewIndex: allocExpando(tView, lView, 1, null),
        anchorIdx,
        cases: [],
        create: [],
        remove: [],
        update: [],
    };
    addUpdateIcuSwitch(updateOpCodes, icuExpression, anchorIdx);
    setTIcu(tView, anchorIdx, tIcu);
    const values = icuExpression.values;
    const cases = [];
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
        const caseAst = [];
        cases.push(caseAst);
        bindingMask =
            parseIcuCase(caseAst, tView, tIcu, lView, updateOpCodes, parentIdx, icuExpression.cases[i], valueArr.join(''), nestedIcus) | bindingMask;
    }
    if (bindingMask) {
        addUpdateIcuUpdate(updateOpCodes, bindingMask, anchorIdx);
    }
    ast.push({
        kind: 3 /* I18nNodeKind.ICU */,
        index: anchorIdx,
        cases,
        currentCaseLViewIndex: tIcu.currentCaseLViewIndex,
    });
}
/**
 * Parses text containing an ICU expression and produces a JSON object for it.
 * Original code from closure library, modified for Angular.
 *
 * @param pattern Text containing an ICU expression that needs to be parsed.
 *
 */
function parseICUBlock(pattern) {
    const cases = [];
    const values = [];
    let icuType = 1 /* IcuType.plural */;
    let mainBinding = 0;
    pattern = pattern.replace(ICU_BLOCK_REGEXP, function (str, binding, type) {
        if (type === 'select') {
            icuType = 0 /* IcuType.select */;
        }
        else {
            icuType = 1 /* IcuType.plural */;
        }
        mainBinding = parseInt(binding.slice(1), 10);
        return '';
    });
    const parts = i18nParseTextIntoPartsAndICU(pattern);
    // Looking for (key block)+ sequence. One of the keys has to be "other".
    for (let pos = 0; pos < parts.length;) {
        let key = parts[pos++].trim();
        if (icuType === 1 /* IcuType.plural */) {
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
function i18nParseTextIntoPartsAndICU(pattern) {
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
    while ((match = braces.exec(pattern))) {
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
function parseIcuCase(ast, tView, tIcu, lView, updateOpCodes, parentIdx, caseName, unsafeCaseHtml, nestedIcus) {
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
        return walkIcuTree(ast, tView, tIcu, lView, updateOpCodes, create, remove, update, inertRootNode, parentIdx, nestedIcus, 0);
    }
    else {
        return 0;
    }
}
function walkIcuTree(ast, tView, tIcu, lView, sharedUpdateOpCodes, create, remove, update, parentNode, parentIdx, nestedIcus, depth) {
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
                                else {
                                    generateBindingUpdateOpCodes(update, attr.value, newIndex, attr.name, 0, null);
                                }
                            }
                            else {
                                ngDevMode &&
                                    console.warn(`WARNING: ignoring unsafe attribute value ` +
                                        `${lowerAttrName} on element ${tagName} ` +
                                        `(see ${XSS_SECURITY_URL})`);
                            }
                        }
                        else {
                            addCreateAttribute(create, newIndex, attr);
                        }
                    }
                    const elementNode = {
                        kind: 1 /* I18nNodeKind.ELEMENT */,
                        index: newIndex,
                        children: [],
                    };
                    ast.push(elementNode);
                    // Parse the children of this node (if any)
                    bindingMask =
                        walkIcuTree(elementNode.children, tView, tIcu, lView, sharedUpdateOpCodes, create, remove, update, currentNode, newIndex, nestedIcus, depth + 1) | bindingMask;
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
                ast.push({
                    kind: 0 /* I18nNodeKind.TEXT */,
                    index: newIndex,
                });
                break;
            case Node.COMMENT_NODE:
                // Check if the comment node is a placeholder for a nested ICU
                const isNestedIcu = NESTED_ICU.exec(currentNode.textContent || '');
                if (isNestedIcu) {
                    const nestedIcuIndex = parseInt(isNestedIcu[1], 10);
                    const icuExpression = nestedIcus[nestedIcuIndex];
                    // Create the comment node that will anchor the ICU expression
                    addCreateNodeAndAppend(create, ICU_MARKER, ngDevMode ? `nested ICU ${nestedIcuIndex}` : '', parentIdx, newIndex);
                    icuStart(ast, tView, lView, sharedUpdateOpCodes, parentIdx, icuExpression, newIndex);
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
    update.push(toMaskBit(icuExpression.mainBinding), 2, -1 - icuExpression.mainBinding, (index << 2 /* I18nUpdateOpCode.SHIFT_REF */) | 2 /* I18nUpdateOpCode.IcuSwitch */);
}
function addUpdateIcuUpdate(update, bindingMask, index) {
    update.push(bindingMask, 1, (index << 2 /* I18nUpdateOpCode.SHIFT_REF */) | 3 /* I18nUpdateOpCode.IcuUpdate */);
}
function addCreateNodeAndAppend(create, marker, text, appendToParentIdx, createAtIdx) {
    if (marker !== null) {
        create.push(marker);
    }
    create.push(text, createAtIdx, icuCreateOpCode(0 /* IcuCreateOpCode.AppendChild */, appendToParentIdx, createAtIdx));
}
function addCreateAttribute(create, newIndex, attr) {
    create.push((newIndex << 1 /* IcuCreateOpCode.SHIFT_REF */) | 1 /* IcuCreateOpCode.Attr */, attr.name, attr.value);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaTE4bl9wYXJzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL3JlbmRlcjMvaTE4bi9pMThuX3BhcnNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUNILE9BQU8sd0JBQXdCLENBQUM7QUFDaEMsT0FBTyxpQ0FBaUMsQ0FBQztBQUV6QyxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSw4QkFBOEIsQ0FBQztBQUM5RCxPQUFPLEVBQ0wsa0JBQWtCLEVBQ2xCLFNBQVMsRUFDVCxXQUFXLEVBQ1gsY0FBYyxHQUNmLE1BQU0sbUNBQW1DLENBQUM7QUFDM0MsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0sK0JBQStCLENBQUM7QUFDakUsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGtDQUFrQyxDQUFDO0FBQzlELE9BQU8sRUFDTCxhQUFhLEVBQ2IsV0FBVyxFQUNYLHdCQUF3QixFQUN4QixXQUFXLEVBQ1gsWUFBWSxHQUNiLE1BQU0sbUJBQW1CLENBQUM7QUFFM0IsT0FBTyxFQUFDLHVCQUF1QixFQUFDLE1BQU0sNENBQTRDLENBQUM7QUFDbkYsT0FBTyxFQUFDLFlBQVksRUFBRSxrQkFBa0IsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQ3hFLE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUNuRCxPQUFPLEVBQ0wsY0FBYyxFQUNkLGdCQUFnQixFQVVoQixVQUFVLEdBT1gsTUFBTSxvQkFBb0IsQ0FBQztBQUc1QixPQUFPLEVBQUMsYUFBYSxFQUFlLE1BQU0sb0JBQW9CLENBQUM7QUFDL0QsT0FBTyxFQUFDLHFCQUFxQixFQUFFLGVBQWUsRUFBRSxlQUFlLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFFakYsT0FBTyxFQUNMLHlCQUF5QixFQUN6Qix5QkFBeUIsRUFDekIseUJBQXlCLEVBQ3pCLHdCQUF3QixHQUN6QixNQUFN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Q0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLENBQUMsS0FBSyxzQ0FBOEIsQ0FBQyxxQ0FBNkIsQ0FBQyxDQUFDO0FBQ2xHLENBQUM7QUFFRCxTQUFTLHNCQUFzQixDQUM3QixNQUF3QixFQUN4QixNQUEwQyxFQUMxQyxJQUFZLEVBQ1osaUJBQXlCLEVBQ3pCLFdBQW1CO0lBRW5CLElBQUksTUFBTSxLQUFLLElBQUksRUFBRSxDQUFDO1FBQ3BCLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDdEIsQ0FBQztJQUNELE1BQU0sQ0FBQyxJQUFJLENBQ1QsSUFBSSxFQUNKLFdBQVcsRUFDWCxlQUFlLHNDQUE4QixpQkFBaUIsRUFBRSxXQUFXLENBQUMsQ0FDN0UsQ0FBQztBQUNKLENBQUM7QUFFRCxTQUFTLGtCQUFrQixDQUFDLE1BQXdCLEVBQUUsUUFBZ0IsRUFBRSxJQUFVO0lBQ2hGLE1BQU0sQ0FBQyxJQUFJLENBQ1QsQ0FBQyxRQUFRLHFDQUE2QixDQUFDLCtCQUF1QixFQUM5RCxJQUFJLENBQUMsSUFBSSxFQUNULElBQUksQ0FBQyxLQUFLLENBQ1gsQ0FBQztBQUNKLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5pbXBvcnQgJy4uLy4uL3V0aWwvbmdfZGV2X21vZGUnO1xuaW1wb3J0ICcuLi8uLi91dGlsL25nX2kxOG5fY2xvc3VyZV9tb2RlJztcblxuaW1wb3J0IHtYU1NfU0VDVVJJVFlfVVJMfSBmcm9tICcuLi8uLi9lcnJvcl9kZXRhaWxzX2Jhc2VfdXJsJztcbmltcG9ydCB7XG4gIGdldFRlbXBsYXRlQ29udGVudCxcbiAgVVJJX0FUVFJTLFxuICBWQUxJRF9BVFRSUyxcbiAgVkFMSURfRUxFTUVOVFMsXG59IGZyb20gJy4uLy4uL3Nhbml0aXphdGlvbi9odG1sX3Nhbml0aXplcic7XG5pbXBvcnQge2dldEluZXJ0Qm9keUhlbHBlcn0gZnJvbSAnLi4vLi4vc2FuaXRpemF0aW9uL2luZXJ0X2JvZHknO1xuaW1wb3J0IHtfc2FuaXRpemVVcmx9IGZyb20gJy4uLy4uL3Nhbml0aXphdGlvbi91cmxfc2FuaXRpemVyJztcbmltcG9ydCB7XG4gIGFzc2VydERlZmluZWQsXG4gIGFzc2VydEVxdWFsLFxuICBhc3NlcnRHcmVhdGVyVGhhbk9yRXF1YWwsXG4gIGFzc2VydE9uZU9mLFxuICBhc3NlcnRTdHJpbmcsXG59IGZyb20gJy4uLy4uL3V0aWwvYXNzZXJ0JztcbmltcG9ydCB7Q2hhckNvZGV9IGZyb20gJy4uLy4uL3V0aWwvY2hhcl9jb2RlJztcbmltcG9ydCB7bG9hZEljdUNvbnRhaW5lclZpc2l0b3J9IGZyb20gJy4uL2luc3RydWN0aW9ucy9pMThuX2ljdV9jb250YWluZXJfdmlzaXRvcic7XG5pbXBvcnQge2FsbG9jRXhwYW5kbywgY3JlYXRlVE5vZGVBdEluZGV4fSBmcm9tICcuLi9pbnN0cnVjdGlvbnMvc2hhcmVkJztcbmltcG9ydCB7Z2V0RG9jdW1lbnR9IGZyb20gJy4uL2ludGVyZmFjZXMvZG9jdW1lbnQnO1xuaW1wb3J0IHtcbiAgRUxFTUVOVF9NQVJLRVIsXG4gIEkxOG5DcmVhdGVPcENvZGUsXG4gIEkxOG5DcmVhdGVPcENvZGVzLFxuICBJMThuRWxlbWVudE5vZGUsXG4gIEkxOG5Ob2RlLFxuICBJMThuTm9kZUtpbmQsXG4gIEkxOG5QbGFjZWhvbGRlck5vZGUsXG4gIEkxOG5QbGFjZWhvbGRlclR5cGUsXG4gIEkxOG5SZW1vdmVPcENvZGVzLFxuICBJMThuVXBkYXRlT3BDb2RlLFxuICBJMThuVXBkYXRlT3BDb2RlcyxcbiAgSUNVX01BUktFUixcbiAgSWN1Q3JlYXRlT3BDb2RlLFxuICBJY3VDcmVhdGVPcENvZGVzLFxuICBJY3VFeHByZXNzaW9uLFxuICBJY3VUeXBlLFxuICBUSTE4bixcbiAgVEljdSxcbn0gZnJvbSAnLi4vaW50ZXJmYWNlcy9pMThuJztcbmltcG9ydCB7VE5vZGUsIFROb2RlVHlwZX0gZnJvbSAnLi4vaW50ZXJmYWNlcy9ub2RlJztcbmltcG9ydCB7U2FuaXRpemVyRm59IGZyb20gJy4uL2ludGVyZmFjZXMvc2FuaXRpemF0aW9uJztcbmltcG9ydCB7SEVBREVSX09GRlNFVCwgTFZpZXcsIFRWaWV3fSBmcm9tICcuLi9pbnRlcmZhY2VzL3ZpZXcnO1xuaW1wb3J0IHtnZXRDdXJyZW50UGFyZW50VE5vZGUsIGdldEN1cnJlbnRUTm9kZSwgc2V0Q3VycmVudFROb2RlfSBmcm9tICcuLi9zdGF0ZSc7XG5cbmltcG9ydCB7XG4gIGkxOG5DcmVhdGVPcENvZGVzVG9TdHJpbmcsXG4gIGkxOG5SZW1vdmVPcENvZGVzVG9TdHJpbmcsXG4gIGkxOG5VcGRhdGVPcENvZGVzVG9TdHJpbmcsXG4gIGljdUNyZWF0ZU9wQ29kZXNUb1N0cmluZyxcbn0gZnJvbSAnLi9pMThuX2RlYnVnJztcbmltcG9ydCB7YWRkVE5vZGVBbmRVcGRhdGVJbnNlcnRCZWZvcmVJbmRleH0gZnJvbSAnLi9pMThuX2luc2VydF9iZWZvcmVfaW5kZXgnO1xuaW1wb3J0IHtlbnN1cmVJY3VDb250YWluZXJWaXNpdG9yTG9hZGVkfSBmcm9tICcuL2kxOG5fdHJlZV9zaGFraW5nJztcbmltcG9ydCB7XG4gIGNyZWF0ZVROb2RlUGxhY2Vob2xkZXIsXG4gIGljdUNyZWF0ZU9wQ29kZSxcbiAgaXNSb290VGVtcGxhdGVNZXNzYWdlLFxuICBzZXRUSWN1LFxuICBzZXRUTm9kZUluc2VydEJlZm9yZUluZGV4LFxufSBmcm9tICcuL2kxOG5fdXRpbCc7XG5cbmNvbnN0IEJJTkRJTkdfUkVHRVhQID0gL++/vShcXGQrKTo/XFxkKu+/vS9naTtcbmNvbnN0IElDVV9SRUdFWFAgPSAvKHtcXHMq77+9XFxkKzo/XFxkKu+/vVxccyosXFxzKlxcU3s2fVxccyosW1xcc1xcU10qfSkvZ2k7XG5jb25zdCBORVNURURfSUNVID0gL++/vShcXGQrKe+/vS87XG5jb25zdCBJQ1VfQkxPQ0tfUkVHRVhQID0gL15cXHMqKO+/vVxcZCs6P1xcZCrvv70pXFxzKixcXHMqKHNlbGVjdHxwbHVyYWwpXFxzKiwvO1xuXG5jb25zdCBNQVJLRVIgPSBg77+9YDtcbmNvbnN0IFNVQlRFTVBMQVRFX1JFR0VYUCA9IC/vv71cXC8/XFwqKFxcZCs6XFxkKynvv70vZ2k7XG5jb25zdCBQSF9SRUdFWFAgPSAv77+9KFxcLz9bIypdXFxkKyk6P1xcZCrvv70vZ2k7XG5cbi8qKlxuICogQW5ndWxhciB1c2VzIHRoZSBzcGVjaWFsIGVudGl0eSAmbmdzcDsgYXMgYSBwbGFjZWhvbGRlciBmb3Igbm9uLXJlbW92YWJsZSBzcGFjZS5cbiAqIEl0J3MgcmVwbGFjZWQgYnkgdGhlIDB4RTUwMCBQVUEgKFByaXZhdGUgVXNlIEFyZWFzKSB1bmljb2RlIGNoYXJhY3RlciBhbmQgbGF0ZXIgb24gcmVwbGFjZWQgYnkgYVxuICogc3BhY2UuXG4gKiBXZSBhcmUgcmUtaW1wbGVtZW50aW5nIHRoZSBzYW1lIGlkZWEgc2luY2UgdHJhbnNsYXRpb25zIG1pZ2h0IGNvbnRhaW4gdGhpcyBzcGVjaWFsIGNoYXJhY3Rlci5cbiAqL1xuY29uc3QgTkdTUF9VTklDT0RFX1JFR0VYUCA9IC9cXHVFNTAwL2c7XG5mdW5jdGlvbiByZXBsYWNlTmdzcCh2YWx1ZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHZhbHVlLnJlcGxhY2UoTkdTUF9VTklDT0RFX1JFR0VYUCwgJyAnKTtcbn1cblxuLyoqXG4gKiBQYXRjaCBhIGBkZWJ1Z2AgcHJvcGVydHkgZ2V0dGVyIG9uIHRvcCBvZiB0aGUgZXhpc3Rpbmcgb2JqZWN0LlxuICpcbiAqIE5PVEU6IGFsd2F5cyBjYWxsIHRoaXMgbWV0aG9kIHdpdGggYG5nRGV2TW9kZSAmJiBhdHRhY2hEZWJ1Z09iamVjdCguLi4pYFxuICpcbiAqIEBwYXJhbSBvYmogT2JqZWN0IHRvIHBhdGNoXG4gKiBAcGFyYW0gZGVidWdHZXR0ZXIgR2V0dGVyIHJldHVybmluZyBhIHZhbHVlIHRvIHBhdGNoXG4gKi9cbmZ1bmN0aW9uIGF0dGFjaERlYnVnR2V0dGVyPFQ+KG9iajogVCwgZGVidWdHZXR0ZXI6ICh0aGlzOiBUKSA9PiBhbnkpOiB2b2lkIHtcbiAgaWYgKG5nRGV2TW9kZSkge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosICdkZWJ1ZycsIHtnZXQ6IGRlYnVnR2V0dGVyLCBlbnVtZXJhYmxlOiBmYWxzZX0pO1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICdUaGlzIG1ldGhvZCBzaG91bGQgYmUgZ3VhcmRlZCB3aXRoIGBuZ0Rldk1vZGVgIHNvIHRoYXQgaXQgY2FuIGJlIHRyZWUgc2hha2VuIGluIHByb2R1Y3Rpb24hJyxcbiAgICApO1xuICB9XG59XG5cbi8qKlxuICogQ3JlYXRlIGR5bmFtaWMgbm9kZXMgZnJvbSBpMThuIHRyYW5zbGF0aW9uIGJsb2NrLlxuICpcbiAqIC0gVGV4dCBub2RlcyBhcmUgY3JlYXRlZCBzeW5jaHJvbm91c2x5XG4gKiAtIFROb2RlcyBhcmUgbGlua2VkIGludG8gdHJlZSBsYXppbHlcbiAqXG4gKiBAcGFyYW0gdFZpZXcgQ3VycmVudCBgVFZpZXdgXG4gKiBAcGFyZW50VE5vZGVJbmRleCBpbmRleCB0byB0aGUgcGFyZW50IFROb2RlIG9mIHRoaXMgaTE4biBibG9ja1xuICogQHBhcmFtIGxWaWV3IEN1cnJlbnQgYExWaWV3YFxuICogQHBhcmFtIGluZGV4IEluZGV4IG9mIGDJtcm1aTE4blN0YXJ0YCBpbnN0cnVjdGlvbi5cbiAqIEBwYXJhbSBtZXNzYWdlIE1lc3NhZ2UgdG8gdHJhbnNsYXRlLlxuICogQHBhcmFtIHN1YlRlbXBsYXRlSW5kZXggSW5kZXggaW50byB0aGUgc3ViIHRlbXBsYXRlIG9mIG1lc3NhZ2UgdHJhbnNsYXRpb24uIChpZSBpbiBjYXNlIG9mXG4gKiAgICAgYG5nSWZgKSAoLTEgb3RoZXJ3aXNlKVxuICovXG5leHBvcnQgZnVuY3Rpb24gaTE4blN0YXJ0Rmlyc3RDcmVhdGVQYXNzKFxuICB0VmlldzogVFZpZXcsXG4gIHBhcmVudFROb2RlSW5kZXg6IG51bWJlcixcbiAgbFZpZXc6IExWaWV3LFxuICBpbmRleDogbnVtYmVyLFxuICBtZXNzYWdlOiBzdHJpbmcsXG4gIHN1YlRlbXBsYXRlSW5kZXg6IG51bWJlcixcbikge1xuICBjb25zdCByb290VE5vZGUgPSBnZXRDdXJyZW50UGFyZW50VE5vZGUoKTtcbiAgY29uc3QgY3JlYXRlT3BDb2RlczogSTE4bkNyZWF0ZU9wQ29kZXMgPSBbXSBhcyBhbnk7XG4gIGNvbnN0IHVwZGF0ZU9wQ29kZXM6IEkxOG5VcGRhdGVPcENvZGVzID0gW10gYXMgYW55O1xuICBjb25zdCBleGlzdGluZ1ROb2RlU3RhY2s6IFROb2RlW11bXSA9IFtbXV07XG4gIGNvbnN0IGFzdFN0YWNrOiBBcnJheTxBcnJheTxJMThuTm9kZT4+ID0gW1tdXTtcbiAgaWYgKG5nRGV2TW9kZSkge1xuICAgIGF0dGFjaERlYnVnR2V0dGVyKGNyZWF0ZU9wQ29kZXMsIGkxOG5DcmVhdGVPcENvZGVzVG9TdHJpbmcpO1xuICAgIGF0dGFjaERlYnVnR2V0dGVyKHVwZGF0ZU9wQ29kZXMsIGkxOG5VcGRhdGVPcENvZGVzVG9TdHJpbmcpO1xuICB9XG5cbiAgbWVzc2FnZSA9IGdldFRyYW5zbGF0aW9uRm9yVGVtcGxhdGUobWVzc2FnZSwgc3ViVGVtcGxhdGVJbmRleCk7XG4gIGNvbnN0IG1zZ1BhcnRzID0gcmVwbGFjZU5nc3AobWVzc2FnZSkuc3BsaXQoUEhfUkVHRVhQKTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBtc2dQYXJ0cy5sZW5ndGg7IGkrKykge1xuICAgIGxldCB2YWx1ZSA9IG1zZ1BhcnRzW2ldO1xuICAgIGlmICgoaSAmIDEpID09PSAwKSB7XG4gICAgICAvLyBFdmVuIGluZGV4ZXMgYXJlIHRleHQgKGluY2x1ZGluZyBiaW5kaW5ncyAmIElDVSBleHByZXNzaW9ucylcbiAgICAgIGNvbnN0IHBhcnRzID0gaTE4blBhcnNlVGV4dEludG9QYXJ0c0FuZElDVSh2YWx1ZSk7XG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHBhcnRzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIGxldCBwYXJ0ID0gcGFydHNbal07XG4gICAgICAgIGlmICgoaiAmIDEpID09PSAwKSB7XG4gICAgICAgICAgLy8gYGpgIGlzIG9kZCB0aGVyZWZvcmUgYHBhcnRgIGlzIHN0cmluZ1xuICAgICAgICAgIGNvbnN0IHRleHQgPSBwYXJ0IGFzIHN0cmluZztcbiAgICAgICAgICBuZ0Rldk1vZGUgJiYgYXNzZXJ0U3RyaW5nKHRleHQsICdQYXJzZWQgSUNVIHBhcnQgc2hvdWxkIGJlIHN0cmluZycpO1xuICAgICAgICAgIGlmICh0ZXh0ICE9PSAnJykge1xuICAgICAgICAgICAgaTE4blN0YXJ0Rmlyc3RDcmVhdGVQYXNzUHJvY2Vzc1RleHROb2RlKFxuICAgICAgICAgICAgICBhc3RTdGFja1swXSxcbiAgICAgICAgICAgICAgdFZpZXcsXG4gICAgICAgICAgICAgIHJvb3RUTm9kZSxcbiAgICAgICAgICAgICAgZXhpc3RpbmdUTm9kZVN0YWNrWzBdLFxuICAgICAgICAgICAgICBjcmVhdGVPcENvZGVzLFxuICAgICAgICAgICAgICB1cGRhdGVPcENvZGVzLFxuICAgICAgICAgICAgICBsVmlldyxcbiAgICAgICAgICAgICAgdGV4dCxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIGBqYCBpcyBFdmVuIHRoZXJlZm9yIGBwYXJ0YCBpcyBhbiBgSUNVRXhwcmVzc2lvbmBcbiAgICAgICAgICBjb25zdCBpY3VFeHByZXNzaW9uOiBJY3VFeHByZXNzaW9uID0gcGFydCBhcyBJY3VFeHByZXNzaW9uO1xuICAgICAgICAgIC8vIFZlcmlmeSB0aGF0IElDVSBleHByZXNzaW9uIGhhcyB0aGUgcmlnaHQgc2hhcGUuIFRyYW5zbGF0aW9ucyBtaWdodCBjb250YWluIGludmFsaWRcbiAgICAgICAgICAvLyBjb25zdHJ1Y3Rpb25zICh3aGlsZSBvcmlnaW5hbCBtZXNzYWdlcyB3ZXJlIGNvcnJlY3QpLCBzbyBJQ1UgcGFyc2luZyBhdCBydW50aW1lIG1heVxuICAgICAgICAgIC8vIG5vdCBzdWNjZWVkICh0aHVzIGBpY3VFeHByZXNzaW9uYCByZW1haW5zIGEgc3RyaW5nKS5cbiAgICAgICAgICAvLyBOb3RlOiB3ZSBpbnRlbnRpb25hbGx5IHJldGFpbiB0aGUgZXJyb3IgaGVyZSBieSBub3QgdXNpbmcgYG5nRGV2TW9kZWAsIGJlY2F1c2VcbiAgICAgICAgICAvLyB0aGUgdmFsdWUgY2FuIGNoYW5nZSBiYXNlZCBvbiB0aGUgbG9jYWxlIGFuZCB1c2VycyBhcmVuJ3QgZ3VhcmFudGVlZCB0byBoaXRcbiAgICAgICAgICAvLyBhbiBpbnZhbGlkIHN0cmluZyB3aGlsZSB0aGV5J3JlIGRldmVsb3BpbmcuXG4gICAgICAgICAgaWYgKHR5cGVvZiBpY3VFeHByZXNzaW9uICE9PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmFibGUgdG8gcGFyc2UgSUNVIGV4cHJlc3Npb24gaW4gXCIke21lc3NhZ2V9XCIgbWVzc2FnZS5gKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgaWN1Q29udGFpbmVyVE5vZGUgPSBjcmVhdGVUTm9kZUFuZEFkZE9wQ29kZShcbiAgICAgICAgICAgIHRWaWV3LFxuICAgICAgICAgICAgcm9vdFROb2RlLFxuICAgICAgICAgICAgZXhpc3RpbmdUTm9kZVN0YWNrWzBdLFxuICAgICAgICAgICAgbFZpZXcsXG4gICAgICAgICAgICBjcmVhdGVPcENvZGVzLFxuICAgICAgICAgICAgbmdEZXZNb2RlID8gYElDVSAke2luZGV4fToke2ljdUV4cHJlc3Npb24ubWFpbkJpbmRpbmd9YCA6ICcnLFxuICAgICAgICAgICAgdHJ1ZSxcbiAgICAgICAgICApO1xuICAgICAgICAgIGNvbnN0IGljdU5vZGVJbmRleCA9IGljdUNvbnRhaW5lclROb2RlLmluZGV4O1xuICAgICAgICAgIG5nRGV2TW9kZSAmJlxuICAgICAgICAgICAgYXNzZXJ0R3JlYXRlclRoYW5PckVxdWFsKFxuICAgICAgICAgICAgICBpY3VOb2RlSW5kZXgsXG4gICAgICAgICAgICAgIEhFQURFUl9PRkZTRVQsXG4gICAgICAgICAgICAgICdJbmRleCBtdXN0IGJlIGluIGFic29sdXRlIExWaWV3IG9mZnNldCcsXG4gICAgICAgICAgICApO1xuICAgICAgICAgIGljdVN0YXJ0KFxuICAgICAgICAgICAgYXN0U3RhY2tbMF0sXG4gICAgICAgICAgICB0VmlldyxcbiAgICAgICAgICAgIGxWaWV3LFxuICAgICAgICAgICAgdXBkYXRlT3BDb2RlcyxcbiAgICAgICAgICAgIHBhcmVudFROb2RlSW5kZXgsXG4gICAgICAgICAgICBpY3VFeHByZXNzaW9uLFxuICAgICAgICAgICAgaWN1Tm9kZUluZGV4LFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gT2RkIGluZGV4ZXMgYXJlIHBsYWNlaG9sZGVycyAoZWxlbWVudHMgYW5kIHN1Yi10ZW1wbGF0ZXMpXG4gICAgICAvLyBBdCB0aGlzIHBvaW50IHZhbHVlIGlzIHNvbWV0aGluZyBsaWtlOiAnLyMxOjInIChvcmlnaW5hbGx5IGNvbWluZyBmcm9tICfvv70vIzE6Mu+/vScpXG4gICAgICBjb25zdCBpc0Nsb3NpbmcgPSB2YWx1ZS5jaGFyQ29kZUF0KDApID09PSBDaGFyQ29kZS5TTEFTSDtcbiAgICAgIGNvbnN0IHR5cGUgPSB2YWx1ZS5jaGFyQ29kZUF0KGlzQ2xvc2luZyA/IDEgOiAwKTtcbiAgICAgIG5nRGV2TW9kZSAmJiBhc3NlcnRPbmVPZih0eXBlLCBDaGFyQ29kZS5TVEFSLCBDaGFyQ29kZS5IQVNIKTtcbiAgICAgIGNvbnN0IGluZGV4ID0gSEVBREVSX09GRlNFVCArIE51bWJlci5wYXJzZUludCh2YWx1ZS5zdWJzdHJpbmcoaXNDbG9zaW5nID8gMiA6IDEpKTtcbiAgICAgIGlmIChpc0Nsb3NpbmcpIHtcbiAgICAgICAgZXhpc3RpbmdUTm9kZVN0YWNrLnNoaWZ0KCk7XG4gICAgICAgIGFzdFN0YWNrLnNoaWZ0KCk7XG4gICAgICAgIHNldEN1cnJlbnRUTm9kZShnZXRDdXJyZW50UGFyZW50VE5vZGUoKSEsIGZhbHNlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHROb2RlID0gY3JlYXRlVE5vZGVQbGFjZWhvbGRlcih0VmlldywgZXhpc3RpbmdUTm9kZVN0YWNrWzBdLCBpbmRleCk7XG4gICAgICAgIGV4aXN0aW5nVE5vZGVTdGFjay51bnNoaWZ0KFtdKTtcbiAgICAgICAgc2V0Q3VycmVudFROb2RlKHROb2RlLCB0cnVlKTtcblxuICAgICAgICBjb25zdCBwbGFjZWhvbGRlck5vZGU6IEkxOG5QbGFjZWhvbGRlck5vZGUgPSB7XG4gICAgICAgICAga2luZDogSTE4bk5vZGVLaW5kLlBMQUNFSE9MREVSLFxuICAgICAgICAgIGluZGV4LFxuICAgICAgICAgIGNoaWxkcmVuOiBbXSxcbiAgICAgICAgICB0eXBlOlxuICAgICAgICAgICAgdHlwZSA9PT0gQ2hhckNvZGUuSEFTSCA/IEkxOG5QbGFjZWhvbGRlclR5cGUuRUxFTUVOVCA6IEkxOG5QbGFjZWhvbGRlclR5cGUuU1VCVEVNUExBVEUsXG4gICAgICAgIH07XG4gICAgICAgIGFzdFN0YWNrWzBdLnB1c2gocGxhY2Vob2xkZXJOb2RlKTtcbiAgICAgICAgYXN0U3RhY2sudW5zaGlmdChwbGFjZWhvbGRlck5vZGUuY2hpbGRyZW4pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHRWaWV3LmRhdGFbaW5kZXhdID0gPFRJMThuPntcbiAgICBjcmVhdGU6IGNyZWF0ZU9wQ29kZXMsXG4gICAgdXBkYXRlOiB1cGRhdGVPcENvZGVzLFxuICAgIGFzdDogYXN0U3RhY2tbMF0sXG4gICAgcGFyZW50VE5vZGVJbmRleCxcbiAgfTtcbn1cblxuLyoqXG4gKiBBbGxvY2F0ZSBzcGFjZSBpbiBpMThuIFJhbmdlIGFkZCBjcmVhdGUgT3BDb2RlIGluc3RydWN0aW9uIHRvIGNyZWF0ZSBhIHRleHQgb3IgY29tbWVudCBub2RlLlxuICpcbiAqIEBwYXJhbSB0VmlldyBDdXJyZW50IGBUVmlld2AgbmVlZGVkIHRvIGFsbG9jYXRlIHNwYWNlIGluIGkxOG4gcmFuZ2UuXG4gKiBAcGFyYW0gcm9vdFROb2RlIFJvb3QgYFROb2RlYCBvZiB0aGUgaTE4biBibG9jay4gVGhpcyBub2RlIGRldGVybWluZXMgaWYgdGhlIG5ldyBUTm9kZSB3aWxsIGJlXG4gKiAgICAgYWRkZWQgYXMgcGFydCBvZiB0aGUgYGkxOG5TdGFydGAgaW5zdHJ1Y3Rpb24gb3IgYXMgcGFydCBvZiB0aGUgYFROb2RlLmluc2VydEJlZm9yZUluZGV4YC5cbiAqIEBwYXJhbSBleGlzdGluZ1ROb2RlcyBpbnRlcm5hbCBzdGF0ZSBmb3IgYGFkZFROb2RlQW5kVXBkYXRlSW5zZXJ0QmVmb3JlSW5kZXhgLlxuICogQHBhcmFtIGxWaWV3IEN1cnJlbnQgYExWaWV3YCBuZWVkZWQgdG8gYWxsb2NhdGUgc3BhY2UgaW4gaTE4biByYW5nZS5cbiAqIEBwYXJhbSBjcmVhdGVPcENvZGVzIEFycmF5IHN0b3JpbmcgYEkxOG5DcmVhdGVPcENvZGVzYCB3aGVyZSBuZXcgb3BDb2RlcyB3aWxsIGJlIGFkZGVkLlxuICogQHBhcmFtIHRleHQgVGV4dCB0byBiZSBhZGRlZCB3aGVuIHRoZSBgVGV4dGAgb3IgYENvbW1lbnRgIG5vZGUgd2lsbCBiZSBjcmVhdGVkLlxuICogQHBhcmFtIGlzSUNVIHRydWUgaWYgYSBgQ29tbWVudGAgbm9kZSBmb3IgSUNVIChpbnN0ZWFkIG9mIGBUZXh0YCkgbm9kZSBzaG91bGQgYmUgY3JlYXRlZC5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlVE5vZGVBbmRBZGRPcENvZGUoXG4gIHRWaWV3OiBUVmlldyxcbiAgcm9vdFROb2RlOiBUTm9kZSB8IG51bGwsXG4gIGV4aXN0aW5nVE5vZGVzOiBUTm9kZVtdLFxuICBsVmlldzogTFZpZXcsXG4gIGNyZWF0ZU9wQ29kZXM6IEkxOG5DcmVhdGVPcENvZGVzLFxuICB0ZXh0OiBzdHJpbmcgfCBudWxsLFxuICBpc0lDVTogYm9vbGVhbixcbik6IFROb2RlIHtcbiAgY29uc3QgaTE4bk5vZGVJZHggPSBhbGxvY0V4cGFuZG8odFZpZXcsIGxWaWV3LCAxLCBudWxsKTtcbiAgbGV0IG9wQ29kZSA9IGkxOG5Ob2RlSWR4IDw8IEkxOG5DcmVhdGVPcENvZGUuU0hJRlQ7XG4gIGxldCBwYXJlbnRUTm9kZSA9IGdldEN1cnJlbnRQYXJlbnRUTm9kZSgpO1xuXG4gIGlmIChyb290VE5vZGUgPT09IHBhcmVudFROb2RlKSB7XG4gICAgLy8gRklYTUUobWlza28pOiBBIG51bGwgYHBhcmVudFROb2RlYCBzaG91bGQgcmVwcmVzZW50IHdoZW4gd2UgZmFsbCBvZiB0aGUgYExWaWV3YCBib3VuZGFyeS5cbiAgICAvLyAodGhlcmUgaXMgbm8gcGFyZW50KSwgYnV0IGluIHNvbWUgY2lyY3Vtc3RhbmNlcyAoYmVjYXVzZSB3ZSBhcmUgaW5jb25zaXN0ZW50IGFib3V0IGhvdyB3ZSBzZXRcbiAgICAvLyBgcHJldmlvdXNPclBhcmVudFROb2RlYCkgaXQgY291bGQgcG9pbnQgdG8gYHJvb3RUTm9kZWAgU28gdGhpcyBpcyBhIHdvcmsgYXJvdW5kLlxuICAgIHBhcmVudFROb2RlID0gbnVsbDtcbiAgfVxuICBpZiAocGFyZW50VE5vZGUgPT09IG51bGwpIHtcbiAgICAvLyBJZiB3ZSBkb24ndCBoYXZlIGEgcGFyZW50IHRoYXQgbWVhbnMgdGhhdCB3ZSBjYW4gZWFnZXJseSBhZGQgbm9kZXMuXG4gICAgLy8gSWYgd2UgaGF2ZSBhIHBhcmVudCB0aGFuIHRoZXNlIG5vZGVzIGNhbid0IGJlIGFkZGVkIG5vdyAoYXMgdGhlIHBhcmVudCBoYXMgbm90IGJlZW4gY3JlYXRlZFxuICAgIC8vIHlldCkgYW5kIGluc3RlYWQgdGhlIGBwYXJlbnRUTm9kZWAgaXMgcmVzcG9uc2libGUgZm9yIGFkZGluZyBpdC4gU2VlXG4gICAgLy8gYFROb2RlLmluc2VydEJlZm9yZUluZGV4YFxuICAgIG9wQ29kZSB8PSBJMThuQ3JlYXRlT3BDb2RlLkFQUEVORF9FQUdFUkxZO1xuICB9XG4gIGlmIChpc0lDVSkge1xuICAgIG9wQ29kZSB8PSBJMThuQ3JlYXRlT3BDb2RlLkNPTU1FTlQ7XG4gICAgZW5zdXJlSWN1Q29udGFpbmVyVmlzaXRvckxvYWRlZChsb2FkSWN1Q29udGFpbmVyVmlzaXRvcik7XG4gIH1cbiAgY3JlYXRlT3BDb2Rlcy5wdXNoKG9wQ29kZSwgdGV4dCA9PT0gbnVsbCA/ICcnIDogdGV4dCk7XG4gIC8vIFdlIHN0b3JlIGB7ez99fWAgc28gdGhhdCB3aGVuIGxvb2tpbmcgYXQgZGVidWcgYFROb2RlVHlwZS50ZW1wbGF0ZWAgd2UgY2FuIHNlZSB3aGVyZSB0aGVcbiAgLy8gYmluZGluZ3MgYXJlLlxuICBjb25zdCB0Tm9kZSA9IGNyZWF0ZVROb2RlQXRJbmRleChcbiAgICB0VmlldyxcbiAgICBpMThuTm9kZUlkeCxcbiAgICBpc0lDVSA/IFROb2RlVHlwZS5JY3UgOiBUTm9kZVR5cGUuVGV4dCxcbiAgICB0ZXh0ID09PSBudWxsID8gKG5nRGV2TW9kZSA/ICd7ez99fScgOiAnJykgOiB0ZXh0LFxuICAgIG51bGwsXG4gICk7XG4gIGFkZFROb2RlQW5kVXBkYXRlSW5zZXJ0QmVmb3JlSW5kZXgoZXhpc3RpbmdUTm9kZXMsIHROb2RlKTtcbiAgY29uc3QgdE5vZGVJZHggPSB0Tm9kZS5pbmRleDtcbiAgc2V0Q3VycmVudFROb2RlKHROb2RlLCBmYWxzZSAvKiBUZXh0IG5vZGVzIGFyZSBzZWxmIGNsb3NpbmcgKi8pO1xuICBpZiAocGFyZW50VE5vZGUgIT09IG51bGwgJiYgcm9vdFROb2RlICE9PSBwYXJlbnRUTm9kZSkge1xuICAgIC8vIFdlIGFyZSBhIGNoaWxkIG9mIGRlZXBlciBub2RlIChyYXRoZXIgdGhhbiBhIGRpcmVjdCBjaGlsZCBvZiBgaTE4blN0YXJ0YCBpbnN0cnVjdGlvbi4pXG4gICAgLy8gV2UgaGF2ZSB0byBtYWtlIHN1cmUgdG8gYWRkIG91cnNlbHZlcyB0byB0aGUgcGFyZW50LlxuICAgIHNldFROb2RlSW5zZXJ0QmVmb3JlSW5kZXgocGFyZW50VE5vZGUsIHROb2RlSWR4KTtcbiAgfVxuICByZXR1cm4gdE5vZGU7XG59XG5cbi8qKlxuICogUHJvY2Vzc2VzIHRleHQgbm9kZSBpbiBpMThuIGJsb2NrLlxuICpcbiAqIFRleHQgbm9kZXMgY2FuIGhhdmU6XG4gKiAtIENyZWF0ZSBpbnN0cnVjdGlvbiBpbiBgY3JlYXRlT3BDb2Rlc2AgZm9yIGNyZWF0aW5nIHRoZSB0ZXh0IG5vZGUuXG4gKiAtIEFsbG9jYXRlIHNwZWMgZm9yIHRleHQgbm9kZSBpbiBpMThuIHJhbmdlIG9mIGBMVmlld2BcbiAqIC0gSWYgY29udGFpbnMgYmluZGluZzpcbiAqICAgIC0gYmluZGluZ3MgPT4gYWxsb2NhdGUgc3BhY2UgaW4gaTE4biByYW5nZSBvZiBgTFZpZXdgIHRvIHN0b3JlIHRoZSBiaW5kaW5nIHZhbHVlLlxuICogICAgLSBwb3B1bGF0ZSBgdXBkYXRlT3BDb2Rlc2Agd2l0aCB1cGRhdGUgaW5zdHJ1Y3Rpb25zLlxuICpcbiAqIEBwYXJhbSB0VmlldyBDdXJyZW50IGBUVmlld2BcbiAqIEBwYXJhbSByb290VE5vZGUgUm9vdCBgVE5vZGVgIG9mIHRoZSBpMThuIGJsb2NrLiBUaGlzIG5vZGUgZGV0ZXJtaW5lcyBpZiB0aGUgbmV3IFROb2RlIHdpbGxcbiAqICAgICBiZSBhZGRlZCBhcyBwYXJ0IG9mIHRoZSBgaTE4blN0YXJ0YCBpbnN0cnVjdGlvbiBvciBhcyBwYXJ0IG9mIHRoZVxuICogICAgIGBUTm9kZS5pbnNlcnRCZWZvcmVJbmRleGAuXG4gKiBAcGFyYW0gZXhpc3RpbmdUTm9kZXMgaW50ZXJuYWwgc3RhdGUgZm9yIGBhZGRUTm9kZUFuZFVwZGF0ZUluc2VydEJlZm9yZUluZGV4YC5cbiAqIEBwYXJhbSBjcmVhdGVPcENvZGVzIExvY2F0aW9uIHdoZXJlIHRoZSBjcmVhdGlvbiBPcENvZGVzIHdpbGwgYmUgc3RvcmVkLlxuICogQHBhcmFtIGxWaWV3IEN1cnJlbnQgYExWaWV3YFxuICogQHBhcmFtIHRleHQgVGhlIHRyYW5zbGF0ZWQgdGV4dCAod2hpY2ggbWF5IGNvbnRhaW4gYmluZGluZylcbiAqL1xuZnVuY3Rpb24gaTE4blN0YXJ0Rmlyc3RDcmVhdGVQYXNzUHJvY2Vzc1RleHROb2RlKFxuICBhc3Q6IEkxOG5Ob2RlW10sXG4gIHRWaWV3OiBUVmlldyxcbiAgcm9vdFROb2RlOiBUTm9kZSB8IG51bGwsXG4gIGV4aXN0aW5nVE5vZGVzOiBUTm9kZVtdLFxuICBjcmVhdGVPcENvZGVzOiBJMThuQ3JlYXRlT3BDb2RlcyxcbiAgdXBkYXRlT3BDb2RlczogSTE4blVwZGF0ZU9wQ29kZXMsXG4gIGxWaWV3OiBMVmlldyxcbiAgdGV4dDogc3RyaW5nLFxuKTogdm9pZCB7XG4gIGNvbnN0IGhhc0JpbmRpbmcgPSB0ZXh0Lm1hdGNoKEJJTkRJTkdfUkVHRVhQKTtcbiAgY29uc3QgdE5vZGUgPSBjcmVhdGVUTm9kZUFuZEFkZE9wQ29kZShcbiAgICB0VmlldyxcbiAgICByb290VE5vZGUsXG4gICAgZXhpc3RpbmdUTm9kZXMsXG4gICAgbFZpZXcsXG4gICAgY3JlYXRlT3BDb2RlcyxcbiAgICBoYXNCaW5kaW5nID8gbnVsbCA6IHRleHQsXG4gICAgZmFsc2UsXG4gICk7XG4gIGNvbnN0IGluZGV4ID0gdE5vZGUuaW5kZXg7XG4gIGlmIChoYXNCaW5kaW5nKSB7XG4gICAgZ2VuZXJhdGVCaW5kaW5nVXBkYXRlT3BDb2Rlcyh1cGRhdGVPcENvZGVzLCB0ZXh0LCBpbmRleCwgbnVsbCwgMCwgbnVsbCk7XG4gIH1cbiAgYXN0LnB1c2goe2tpbmQ6IEkxOG5Ob2RlS2luZC5URVhULCBpbmRleH0pO1xufVxuXG4vKipcbiAqIFNlZSBgaTE4bkF0dHJpYnV0ZXNgIGFib3ZlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gaTE4bkF0dHJpYnV0ZXNGaXJzdFBhc3ModFZpZXc6IFRWaWV3LCBpbmRleDogbnVtYmVyLCB2YWx1ZXM6IHN0cmluZ1tdKSB7XG4gIGNvbnN0IHByZXZpb3VzRWxlbWVudCA9IGdldEN1cnJlbnRUTm9kZSgpITtcbiAgY29uc3QgcHJldmlvdXNFbGVtZW50SW5kZXggPSBwcmV2aW91c0VsZW1lbnQuaW5kZXg7XG4gIGNvbnN0IHVwZGF0ZU9wQ29kZXM6IEkxOG5VcGRhdGVPcENvZGVzID0gW10gYXMgYW55O1xuICBpZiAobmdEZXZNb2RlKSB7XG4gICAgYXR0YWNoRGVidWdHZXR0ZXIodXBkYXRlT3BDb2RlcywgaTE4blVwZGF0ZU9wQ29kZXNUb1N0cmluZyk7XG4gIH1cbiAgaWYgKHRWaWV3LmZpcnN0Q3JlYXRlUGFzcyAmJiB0Vmlldy5kYXRhW2luZGV4XSA9PT0gbnVsbCkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdmFsdWVzLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgICBjb25zdCBhdHRyTmFtZSA9IHZhbHVlc1tpXTtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSB2YWx1ZXNbaSArIDFdO1xuXG4gICAgICBpZiAobWVzc2FnZSAhPT0gJycpIHtcbiAgICAgICAgLy8gQ2hlY2sgaWYgYXR0cmlidXRlIHZhbHVlIGNvbnRhaW5zIGFuIElDVSBhbmQgdGhyb3cgYW4gZXJyb3IgaWYgdGhhdCdzIHRoZSBjYXNlLlxuICAgICAgICAvLyBJQ1VzIGluIGVsZW1lbnQgYXR0cmlidXRlcyBhcmUgbm90IHN1cHBvcnRlZC5cbiAgICAgICAgLy8gTm90ZTogd2UgaW50ZW50aW9uYWxseSByZXRhaW4gdGhlIGVycm9yIGhlcmUgYnkgbm90IHVzaW5nIGBuZ0Rldk1vZGVgLCBiZWNhdXNlXG4gICAgICAgIC8vIHRoZSBgdmFsdWVgIGNhbiBjaGFuZ2UgYmFzZWQgb24gdGhlIGxvY2FsZSBhbmQgdXNlcnMgYXJlbid0IGd1YXJhbnRlZWQgdG8gaGl0XG4gICAgICAgIC8vIGFuIGludmFsaWQgc3RyaW5nIHdoaWxlIHRoZXkncmUgZGV2ZWxvcGluZy5cbiAgICAgICAgaWYgKElDVV9SRUdFWFAudGVzdChtZXNzYWdlKSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBJQ1UgZXhwcmVzc2lvbnMgYXJlIG5vdCBzdXBwb3J0ZWQgaW4gYXR0cmlidXRlcy4gTWVzc2FnZTogXCIke21lc3NhZ2V9XCIuYCxcbiAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaTE4biBhdHRyaWJ1dGVzIHRoYXQgaGl0IHRoaXMgY29kZSBwYXRoIGFyZSBndWFyYW50ZWVkIHRvIGhhdmUgYmluZGluZ3MsIGJlY2F1c2VcbiAgICAgICAgLy8gdGhlIGNvbXBpbGVyIHRyZWF0cyBzdGF0aWMgaTE4biBhdHRyaWJ1dGVzIGFzIHJlZ3VsYXIgYXR0cmlidXRlIGJpbmRpbmdzLlxuICAgICAgICAvLyBTaW5jZSB0aGlzIG1heSBub3QgYmUgdGhlIGZpcnN0IGkxOG4gYXR0cmlidXRlIG9uIHRoaXMgZWxlbWVudCB3ZSBuZWVkIHRvIHBhc3MgaW4gaG93XG4gICAgICAgIC8vIG1hbnkgcHJldmlvdXMgYmluZGluZ3MgdGhlcmUgaGF2ZSBhbHJlYWR5IGJlZW4uXG4gICAgICAgIGdlbmVyYXRlQmluZGluZ1VwZGF0ZU9wQ29kZXMoXG4gICAgICAgICAgdXBkYXRlT3BDb2RlcyxcbiAgICAgICAgICBtZXNzYWdlLFxuICAgICAgICAgIHByZXZpb3VzRWxlbWVudEluZGV4LFxuICAgICAgICAgIGF0dHJOYW1lLFxuICAgICAgICAgIGNvdW50QmluZGluZ3ModXBkYXRlT3BDb2RlcyksXG4gICAgICAgICAgbnVsbCxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdFZpZXcuZGF0YVtpbmRleF0gPSB1cGRhdGVPcENvZGVzO1xuICB9XG59XG5cbi8qKlxuICogR2VuZXJhdGUgdGhlIE9wQ29kZXMgdG8gdXBkYXRlIHRoZSBiaW5kaW5ncyBvZiBhIHN0cmluZy5cbiAqXG4gKiBAcGFyYW0gdXBkYXRlT3BDb2RlcyBQbGFjZSB3aGVyZSB0aGUgdXBkYXRlIG9wY29kZXMgd2lsbCBiZSBzdG9yZWQuXG4gKiBAcGFyYW0gc3RyIFRoZSBzdHJpbmcgY29udGFpbmluZyB0aGUgYmluZGluZ3MuXG4gKiBAcGFyYW0gZGVzdGluYXRpb25Ob2RlIEluZGV4IG9mIHRoZSBkZXN0aW5hdGlvbiBub2RlIHdoaWNoIHdpbGwgcmVjZWl2ZSB0aGUgYmluZGluZy5cbiAqIEBwYXJhbSBhdHRyTmFtZSBOYW1lIG9mIHRoZSBhdHRyaWJ1dGUsIGlmIHRoZSBzdHJpbmcgYmVsb25ncyB0byBhbiBhdHRyaWJ1dGUuXG4gKiBAcGFyYW0gc2FuaXRpemVGbiBTYW5pdGl6YXRpb24gZnVuY3Rpb24gdXNlZCB0byBzYW5pdGl6ZSB0aGUgc3RyaW5nIGFmdGVyIHVwZGF0ZSwgaWYgbmVjZXNzYXJ5LlxuICogQHBhcmFtIGJpbmRpbmdTdGFydCBUaGUgbFZpZXcgaW5kZXggb2YgdGhlIG5leHQgZXhwcmVzc2lvbiB0aGF0IGNhbiBiZSBib3VuZCB2aWEgYW4gb3BDb2RlLlxuICogQHJldHVybnMgVGhlIG1hc2sgdmFsdWUgZm9yIHRoZXNlIGJpbmRpbmdzXG4gKi9cbmZ1bmN0aW9uIGdlbmVyYXRlQmluZGluZ1VwZGF0ZU9wQ29kZXMoXG4gIHVwZGF0ZU9wQ29kZXM6IEkxOG5VcGRhdGVPcENvZGVzLFxuICBzdHI6IHN0cmluZyxcbiAgZGVzdGluYXRpb25Ob2RlOiBudW1iZXIsXG4gIGF0dHJOYW1lOiBzdHJpbmcgfCBudWxsLFxuICBiaW5kaW5nU3RhcnQ6IG51bWJlcixcbiAgc2FuaXRpemVGbjogU2FuaXRpemVyRm4gfCBudWxsLFxuKTogbnVtYmVyIHtcbiAgbmdEZXZNb2RlICYmXG4gICAgYXNzZXJ0R3JlYXRlclRoYW5PckVxdWFsKFxuICAgICAgZGVzdGluYXRpb25Ob2RlLFxuICAgICAgSEVBREVSX09GRlNFVCxcbiAgICAgICdJbmRleCBtdXN0IGJlIGluIGFic29sdXRlIExWaWV3IG9mZnNldCcsXG4gICAgKTtcbiAgY29uc3QgbWFza0luZGV4ID0gdXBkYXRlT3BDb2Rlcy5sZW5ndGg7IC8vIExvY2F0aW9uIG9mIG1hc2tcbiAgY29uc3Qgc2l6ZUluZGV4ID0gbWFza0luZGV4ICsgMTsgLy8gbG9jYXRpb24gb2Ygc2l6ZSBmb3Igc2tpcHBpbmdcbiAgdXBkYXRlT3BDb2Rlcy5wdXNoKG51bGwsIG51bGwpOyAvLyBBbGxvYyBzcGFjZSBmb3IgbWFzayBhbmQgc2l6ZVxuICBjb25zdCBzdGFydEluZGV4ID0gbWFza0luZGV4ICsgMjsgLy8gbG9jYXRpb24gb2YgZmlyc3QgYWxsb2NhdGlvbi5cbiAgaWYgKG5nRGV2TW9kZSkge1xuICAgIGF0dGFjaERlYnVnR2V0dGVyKHVwZGF0ZU9wQ29kZXMsIGkxOG5VcGRhdGVPcENvZGVzVG9TdHJpbmcpO1xuICB9XG4gIGNvbnN0IHRleHRQYXJ0cyA9IHN0ci5zcGxpdChCSU5ESU5HX1JFR0VYUCk7XG4gIGxldCBtYXNrID0gMDtcblxuICBmb3IgKGxldCBqID0gMDsgaiA8IHRleHRQYXJ0cy5sZW5ndGg7IGorKykge1xuICAgIGNvbnN0IHRleHRWYWx1ZSA9IHRleHRQYXJ0c1tqXTtcblxuICAgIGlmIChqICYgMSkge1xuICAgICAgLy8gT2RkIGluZGV4ZXMgYXJlIGJpbmRpbmdzXG4gICAgICBjb25zdCBiaW5kaW5nSW5kZXggPSBiaW5kaW5nU3RhcnQgKyBwYXJzZUludCh0ZXh0VmFsdWUsIDEwKTtcbiAgICAgIHVwZGF0ZU9wQ29kZXMucHVzaCgtMSAtIGJpbmRpbmdJbmRleCk7XG4gICAgICBtYXNrID0gbWFzayB8IHRvTWFza0JpdChiaW5kaW5nSW5kZXgpO1xuICAgIH0gZWxzZSBpZiAodGV4dFZhbHVlICE9PSAnJykge1xuICAgICAgLy8gRXZlbiBpbmRleGVzIGFyZSB0ZXh0XG4gICAgICB1cGRhdGVPcENvZGVzLnB1c2godGV4dFZhbHVlKTtcbiAgICB9XG4gIH1cblxuICB1cGRhdGVPcENvZGVzLnB1c2goXG4gICAgKGRlc3RpbmF0aW9uTm9kZSA8PCBJMThuVXBkYXRlT3BDb2RlLlNISUZUX1JFRikgfFxuICAgICAgKGF0dHJOYW1lID8gSTE4blVwZGF0ZU9wQ29kZS5BdHRyIDogSTE4blVwZGF0ZU9wQ29kZS5UZXh0KSxcbiAgKTtcbiAgaWYgKGF0dHJOYW1lKSB7XG4gICAgdXBkYXRlT3BDb2Rlcy5wdXNoKGF0dHJOYW1lLCBzYW5pdGl6ZUZuKTtcbiAgfVxuICB1cGRhdGVPcENvZGVzW21hc2tJbmRleF0gPSBtYXNrO1xuICB1cGRhdGVPcENvZGVzW3NpemVJbmRleF0gPSB1cGRhdGVPcENvZGVzLmxlbmd0aCAtIHN0YXJ0SW5kZXg7XG4gIHJldHVybiBtYXNrO1xufVxuXG4vKipcbiAqIENvdW50IHRoZSBudW1iZXIgb2YgYmluZGluZ3MgaW4gdGhlIGdpdmVuIGBvcENvZGVzYC5cbiAqXG4gKiBJdCBjb3VsZCBiZSBwb3NzaWJsZSB0byBzcGVlZCB0aGlzIHVwLCBieSBwYXNzaW5nIHRoZSBudW1iZXIgb2YgYmluZGluZ3MgZm91bmQgYmFjayBmcm9tXG4gKiBgZ2VuZXJhdGVCaW5kaW5nVXBkYXRlT3BDb2RlcygpYCB0byBgaTE4bkF0dHJpYnV0ZXNGaXJzdFBhc3MoKWAgYnV0IHRoaXMgd291bGQgdGhlbiByZXF1aXJlIG1vcmVcbiAqIGNvbXBsZXhpdHkgaW4gdGhlIGNvZGUgYW5kL29yIHRyYW5zaWVudCBvYmplY3RzIHRvIGJlIGNyZWF0ZWQuXG4gKlxuICogU2luY2UgdGhpcyBmdW5jdGlvbiBpcyBvbmx5IGNhbGxlZCBvbmNlIHdoZW4gdGhlIHRlbXBsYXRlIGlzIGluc3RhbnRpYXRlZCwgaXMgdHJpdmlhbCBpbiB0aGVcbiAqIGZpcnN0IGluc3RhbmNlIChzaW5jZSBgb3BDb2Rlc2Agd2lsbCBiZSBhbiBlbXB0eSBhcnJheSksIGFuZCBpdCBpcyBub3QgY29tbW9uIGZvciBlbGVtZW50cyB0b1xuICogY29udGFpbiBtdWx0aXBsZSBpMThuIGJvdW5kIGF0dHJpYnV0ZXMsIGl0IHNlZW1zIGxpa2UgdGhpcyBpcyBhIHJlYXNvbmFibGUgY29tcHJvbWlzZS5cbiAqL1xuZnVuY3Rpb24gY291bnRCaW5kaW5ncyhvcENvZGVzOiBJMThuVXBkYXRlT3BDb2Rlcyk6IG51bWJlciB7XG4gIGxldCBjb3VudCA9IDA7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgb3BDb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IG9wQ29kZSA9IG9wQ29kZXNbaV07XG4gICAgLy8gQmluZGluZ3MgYXJlIG5lZ2F0aXZlIG51bWJlcnMuXG4gICAgaWYgKHR5cGVvZiBvcENvZGUgPT09ICdudW1iZXInICYmIG9wQ29kZSA8IDApIHtcbiAgICAgIGNvdW50Kys7XG4gICAgfVxuICB9XG4gIHJldHVybiBjb3VudDtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGJpbmRpbmcgaW5kZXggdG8gbWFzayBiaXQuXG4gKlxuICogRWFjaCBpbmRleCByZXByZXNlbnRzIGEgc2luZ2xlIGJpdCBvbiB0aGUgYml0LW1hc2suIEJlY2F1c2UgYml0LW1hc2sgb25seSBoYXMgMzIgYml0cywgd2UgbWFrZVxuICogdGhlIDMybmQgYml0IHNoYXJlIGFsbCBtYXNrcyBmb3IgYWxsIGJpbmRpbmdzIGhpZ2hlciB0aGFuIDMyLiBTaW5jZSBpdCBpcyBleHRyZW1lbHkgcmFyZSB0b1xuICogaGF2ZSBtb3JlIHRoYW4gMzIgYmluZGluZ3MgdGhpcyB3aWxsIGJlIGhpdCB2ZXJ5IHJhcmVseS4gVGhlIGRvd25zaWRlIG9mIGhpdHRpbmcgdGhpcyBjb3JuZXJcbiAqIGNhc2UgaXMgdGhhdCB3ZSB3aWxsIGV4ZWN1dGUgYmluZGluZyBjb2RlIG1vcmUgb2Z0ZW4gdGhhbiBuZWNlc3NhcnkuIChwZW5hbHR5IG9mIHBlcmZvcm1hbmNlKVxuICovXG5mdW5jdGlvbiB0b01hc2tCaXQoYmluZGluZ0luZGV4OiBudW1iZXIpOiBudW1iZXIge1xuICByZXR1cm4gMSA8PCBNYXRoLm1pbihiaW5kaW5nSW5kZXgsIDMxKTtcbn1cblxuLyoqXG4gKiBSZW1vdmVzIGV2ZXJ5dGhpbmcgaW5zaWRlIHRoZSBzdWItdGVtcGxhdGVzIG9mIGEgbWVzc2FnZS5cbiAqL1xuZnVuY3Rpb24gcmVtb3ZlSW5uZXJUZW1wbGF0ZVRyYW5zbGF0aW9uKG1lc3NhZ2U6IHN0cmluZyk6IHN0cmluZyB7XG4gIGxldCBtYXRjaDtcbiAgbGV0IHJlcyA9ICcnO1xuICBsZXQgaW5kZXggPSAwO1xuICBsZXQgaW5UZW1wbGF0ZSA9IGZhbHNlO1xuICBsZXQgdGFnTWF0Y2hlZDtcblxuICB3aGlsZSAoKG1hdGNoID0gU1VCVEVNUExBVEVfUkVHRVhQLmV4ZWMobWVzc2FnZSkpICE9PSBudWxsKSB7XG4gICAgaWYgKCFpblRlbXBsYXRlKSB7XG4gICAgICByZXMgKz0gbWVzc2FnZS5zdWJzdHJpbmcoaW5kZXgsIG1hdGNoLmluZGV4ICsgbWF0Y2hbMF0ubGVuZ3RoKTtcbiAgICAgIHRhZ01hdGNoZWQgPSBtYXRjaFsxXTtcbiAgICAgIGluVGVtcGxhdGUgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAobWF0Y2hbMF0gPT09IGAke01BUktFUn0vKiR7dGFnTWF0Y2hlZH0ke01BUktFUn1gKSB7XG4gICAgICAgIGluZGV4ID0gbWF0Y2guaW5kZXg7XG4gICAgICAgIGluVGVtcGxhdGUgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBuZ0Rldk1vZGUgJiZcbiAgICBhc3NlcnRFcXVhbChcbiAgICAgIGluVGVtcGxhdGUsXG4gICAgICBmYWxzZSxcbiAgICAgIGBUYWcgbWlzbWF0Y2g6IHVuYWJsZSB0byBmaW5kIHRoZSBlbmQgb2YgdGhlIHN1Yi10ZW1wbGF0ZSBpbiB0aGUgdHJhbnNsYXRpb24gXCIke21lc3NhZ2V9XCJgLFxuICAgICk7XG5cbiAgcmVzICs9IG1lc3NhZ2Uuc2xpY2UoaW5kZXgpO1xuICByZXR1cm4gcmVzO1xufVxuXG4vKipcbiAqIEV4dHJhY3RzIGEgcGFydCBvZiBhIG1lc3NhZ2UgYW5kIHJlbW92ZXMgdGhlIHJlc3QuXG4gKlxuICogVGhpcyBtZXRob2QgaXMgdXNlZCBmb3IgZXh0cmFjdGluZyBhIHBhcnQgb2YgdGhlIG1lc3NhZ2UgYXNzb2NpYXRlZCB3aXRoIGEgdGVtcGxhdGUuIEFcbiAqIHRyYW5zbGF0ZWQgbWVzc2FnZSBjYW4gc3BhbiBtdWx0aXBsZSB0ZW1wbGF0ZXMuXG4gKlxuICogRXhhbXBsZTpcbiAqIGBgYFxuICogPGRpdiBpMThuPlRyYW5zbGF0ZSA8c3BhbiAqbmdJZj5tZTwvc3Bhbj4hPC9kaXY+XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gbWVzc2FnZSBUaGUgbWVzc2FnZSB0byBjcm9wXG4gKiBAcGFyYW0gc3ViVGVtcGxhdGVJbmRleCBJbmRleCBvZiB0aGUgc3ViLXRlbXBsYXRlIHRvIGV4dHJhY3QuIElmIHVuZGVmaW5lZCBpdCByZXR1cm5zIHRoZVxuICogZXh0ZXJuYWwgdGVtcGxhdGUgYW5kIHJlbW92ZXMgYWxsIHN1Yi10ZW1wbGF0ZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRUcmFuc2xhdGlvbkZvclRlbXBsYXRlKG1lc3NhZ2U6IHN0cmluZywgc3ViVGVtcGxhdGVJbmRleDogbnVtYmVyKSB7XG4gIGlmIChpc1Jvb3RUZW1wbGF0ZU1lc3NhZ2Uoc3ViVGVtcGxhdGVJbmRleCkpIHtcbiAgICAvLyBXZSB3YW50IHRoZSByb290IHRlbXBsYXRlIG1lc3NhZ2UsIGlnbm9yZSBhbGwgc3ViLXRlbXBsYXRlc1xuICAgIHJldHVybiByZW1vdmVJbm5lclRlbXBsYXRlVHJhbnNsYXRpb24obWVzc2FnZSk7XG4gIH0gZWxzZSB7XG4gICAgLy8gV2Ugd2FudCBhIHNwZWNpZmljIHN1Yi10ZW1wbGF0ZVxuICAgIGNvbnN0IHN0YXJ0ID1cbiAgICAgIG1lc3NhZ2UuaW5kZXhPZihgOiR7c3ViVGVtcGxhdGVJbmRleH0ke01BUktFUn1gKSArIDIgKyBzdWJUZW1wbGF0ZUluZGV4LnRvU3RyaW5nKCkubGVuZ3RoO1xuICAgIGNvbnN0IGVuZCA9IG1lc3NhZ2Uuc2VhcmNoKG5ldyBSZWdFeHAoYCR7TUFSS0VSfVxcXFwvXFxcXCpcXFxcZCs6JHtzdWJUZW1wbGF0ZUluZGV4fSR7TUFSS0VSfWApKTtcbiAgICByZXR1cm4gcmVtb3ZlSW5uZXJUZW1wbGF0ZVRyYW5zbGF0aW9uKG1lc3NhZ2Uuc3Vic3RyaW5nKHN0YXJ0LCBlbmQpKTtcbiAgfVxufVxuXG4vKipcbiAqIEdlbmVyYXRlIHRoZSBPcENvZGVzIGZvciBJQ1UgZXhwcmVzc2lvbnMuXG4gKlxuICogQHBhcmFtIGljdUV4cHJlc3Npb25cbiAqIEBwYXJhbSBpbmRleCBJbmRleCB3aGVyZSB0aGUgYW5jaG9yIGlzIHN0b3JlZCBhbmQgYW4gb3B0aW9uYWwgYFRJY3VDb250YWluZXJOb2RlYFxuICogICAtIGBsVmlld1thbmNob3JJZHhdYCBwb2ludHMgdG8gYSBgQ29tbWVudGAgbm9kZSByZXByZXNlbnRpbmcgdGhlIGFuY2hvciBmb3IgdGhlIElDVS5cbiAqICAgLSBgdFZpZXcuZGF0YVthbmNob3JJZHhdYCBwb2ludHMgdG8gdGhlIGBUSWN1Q29udGFpbmVyTm9kZWAgaWYgSUNVIGlzIHJvb3QgKGBudWxsYCBvdGhlcndpc2UpXG4gKi9cbmZ1bmN0aW9uIGljdVN0YXJ0KFxuICBhc3Q6IEkxOG5Ob2RlW10sXG4gIHRWaWV3OiBUVmlldyxcbiAgbFZpZXc6IExWaWV3LFxuICB1cGRhdGVPcENvZGVzOiBJMThuVXBkYXRlT3BDb2RlcyxcbiAgcGFyZW50SWR4OiBudW1iZXIsXG4gIGljdUV4cHJlc3Npb246IEljdUV4cHJlc3Npb24sXG4gIGFuY2hvcklkeDogbnVtYmVyLFxuKSB7XG4gIG5nRGV2TW9kZSAmJiBhc3NlcnREZWZpbmVkKGljdUV4cHJlc3Npb24sICdJQ1UgZXhwcmVzc2lvbiBtdXN0IGJlIGRlZmluZWQnKTtcbiAgbGV0IGJpbmRpbmdNYXNrID0gMDtcbiAgY29uc3QgdEljdTogVEljdSA9IHtcbiAgICB0eXBlOiBpY3VFeHByZXNzaW9uLnR5cGUsXG4gICAgY3VycmVudENhc2VMVmlld0luZGV4OiBhbGxvY0V4cGFuZG8odFZpZXcsIGxWaWV3LCAxLCBudWxsKSxcbiAgICBhbmNob3JJZHgsXG4gICAgY2FzZXM6IFtdLFxuICAgIGNyZWF0ZTogW10sXG4gICAgcmVtb3ZlOiBbXSxcbiAgICB1cGRhdGU6IFtdLFxuICB9O1xuICBhZGRVcGRhdGVJY3VTd2l0Y2godXBkYXRlT3BDb2RlcywgaWN1RXhwcmVzc2lvbiwgYW5jaG9ySWR4KTtcbiAgc2V0VEljdSh0VmlldywgYW5jaG9ySWR4LCB0SWN1KTtcbiAgY29uc3QgdmFsdWVzID0gaWN1RXhwcmVzc2lvbi52YWx1ZXM7XG4gIGNvbnN0IGNhc2VzOiBJMThuTm9kZVtdW10gPSBbXTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCB2YWx1ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAvLyBFYWNoIHZhbHVlIGlzIGFuIGFycmF5IG9mIHN0cmluZ3MgJiBvdGhlciBJQ1UgZXhwcmVzc2lvbnNcbiAgICBjb25zdCB2YWx1ZUFyciA9IHZhbHVlc1tpXTtcbiAgICBjb25zdCBuZXN0ZWRJY3VzOiBJY3VFeHByZXNzaW9uW10gPSBbXTtcbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IHZhbHVlQXJyLmxlbmd0aDsgaisrKSB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHZhbHVlQXJyW2pdO1xuICAgICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgLy8gSXQgaXMgYW4gbmVzdGVkIElDVSBleHByZXNzaW9uXG4gICAgICAgIGNvbnN0IGljdUluZGV4ID0gbmVzdGVkSWN1cy5wdXNoKHZhbHVlIGFzIEljdUV4cHJlc3Npb24pIC0gMTtcbiAgICAgICAgLy8gUmVwbGFjZSBuZXN0ZWQgSUNVIGV4cHJlc3Npb24gYnkgYSBjb21tZW50IG5vZGVcbiAgICAgICAgdmFsdWVBcnJbal0gPSBgPCEtLe+/vSR7aWN1SW5kZXh977+9LS0+YDtcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgY2FzZUFzdDogSTE4bk5vZGVbXSA9IFtdO1xuICAgIGNhc2VzLnB1c2goY2FzZUFzdCk7XG4gICAgYmluZGluZ01hc2sgPVxuICAgICAgcGFyc2VJY3VDYXNlKFxuICAgICAgICBjYXNlQXN0LFxuICAgICAgICB0VmlldyxcbiAgICAgICAgdEljdSxcbiAgICAgICAgbFZpZXcsXG4gICAgICAgIHVwZGF0ZU9wQ29kZXMsXG4gICAgICAgIHBhcmVudElkeCxcbiAgICAgICAgaWN1RXhwcmVzc2lvbi5jYXNlc1tpXSxcbiAgICAgICAgdmFsdWVBcnIuam9pbignJyksXG4gICAgICAgIG5lc3RlZEljdXMsXG4gICAgICApIHwgYmluZGluZ01hc2s7XG4gIH1cbiAgaWYgKGJpbmRpbmdNYXNrKSB7XG4gICAgYWRkVXBkYXRlSWN1VXBkYXRlKHVwZGF0ZU9wQ29kZXMsIGJpbmRpbmdNYXNrLCBhbmNob3JJZHgpO1xuICB9XG4gIGFzdC5wdXNoKHtcbiAgICBraW5kOiBJMThuTm9kZUtpbmQuSUNVLFxuICAgIGluZGV4OiBhbmNob3JJZHgsXG4gICAgY2FzZXMsXG4gICAgY3VycmVudENhc2VMVmlld0luZGV4OiB0SWN1LmN1cnJlbnRDYXNlTFZpZXdJbmRleCxcbiAgfSk7XG59XG5cbi8qKlxuICogUGFyc2VzIHRleHQgY29udGFpbmluZyBhbiBJQ1UgZXhwcmVzc2lvbiBhbmQgcHJvZHVjZXMgYSBKU09OIG9iamVjdCBmb3IgaXQuXG4gKiBPcmlnaW5hbCBjb2RlIGZyb20gY2xvc3VyZSBsaWJyYXJ5LCBtb2RpZmllZCBmb3IgQW5ndWxhci5cbiAqXG4gKiBAcGFyYW0gcGF0dGVybiBUZXh0IGNvbnRhaW5pbmcgYW4gSUNVIGV4cHJlc3Npb24gdGhhdCBuZWVkcyB0byBiZSBwYXJzZWQuXG4gKlxuICovXG5mdW5jdGlvbiBwYXJzZUlDVUJsb2NrKHBhdHRlcm46IHN0cmluZyk6IEljdUV4cHJlc3Npb24ge1xuICBjb25zdCBjYXNlcyA9IFtdO1xuICBjb25zdCB2YWx1ZXM6IChzdHJpbmcgfCBJY3VFeHByZXNzaW9uKVtdW10gPSBbXTtcbiAgbGV0IGljdVR5cGUgPSBJY3VUeXBlLnBsdXJhbDtcbiAgbGV0IG1haW5CaW5kaW5nID0gMDtcbiAgcGF0dGVybiA9IHBhdHRlcm4ucmVwbGFjZShcbiAgICBJQ1VfQkxPQ0tfUkVHRVhQLFxuICAgIGZ1bmN0aW9uIChzdHI6IHN0cmluZywgYmluZGluZzogc3RyaW5nLCB0eXBlOiBzdHJpbmcpIHtcbiAgICAgIGlmICh0eXBlID09PSAnc2VsZWN0Jykge1xuICAgICAgICBpY3VUeXBlID0gSWN1VHlwZS5zZWxlY3Q7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpY3VUeXBlID0gSWN1VHlwZS5wbHVyYWw7XG4gICAgICB9XG4gICAgICBtYWluQmluZGluZyA9IHBhcnNlSW50KGJpbmRpbmcuc2xpY2UoMSksIDEwKTtcbiAgICAgIHJldHVybiAnJztcbiAgICB9LFxuICApO1xuXG4gIGNvbnN0IHBhcnRzID0gaTE4blBhcnNlVGV4dEludG9QYXJ0c0FuZElDVShwYXR0ZXJuKSBhcyBzdHJpbmdbXTtcbiAgLy8gTG9va2luZyBmb3IgKGtleSBibG9jaykrIHNlcXVlbmNlLiBPbmUgb2YgdGhlIGtleXMgaGFzIHRvIGJlIFwib3RoZXJcIi5cbiAgZm9yIChsZXQgcG9zID0gMDsgcG9zIDwgcGFydHMubGVuZ3RoOyApIHtcbiAgICBsZXQga2V5ID0gcGFydHNbcG9zKytdLnRyaW0oKTtcbiAgICBpZiAoaWN1VHlwZSA9PT0gSWN1VHlwZS5wbHVyYWwpIHtcbiAgICAgIC8vIEtleSBjYW4gYmUgXCI9eFwiLCB3ZSBqdXN0IHdhbnQgXCJ4XCJcbiAgICAgIGtleSA9IGtleS5yZXBsYWNlKC9cXHMqKD86PSk/KFxcdyspXFxzKi8sICckMScpO1xuICAgIH1cbiAgICBpZiAoa2V5Lmxlbmd0aCkge1xuICAgICAgY2FzZXMucHVzaChrZXkpO1xuICAgIH1cblxuICAgIGNvbnN0IGJsb2NrcyA9IGkxOG5QYXJzZVRleHRJbnRvUGFydHNBbmRJQ1UocGFydHNbcG9zKytdKSBhcyBzdHJpbmdbXTtcbiAgICBpZiAoY2FzZXMubGVuZ3RoID4gdmFsdWVzLmxlbmd0aCkge1xuICAgICAgdmFsdWVzLnB1c2goYmxvY2tzKTtcbiAgICB9XG4gIH1cblxuICAvLyBUT0RPKG9jb21iZSk6IHN1cHBvcnQgSUNVIGV4cHJlc3Npb25zIGluIGF0dHJpYnV0ZXMsIHNlZSAjMjE2MTVcbiAgcmV0dXJuIHt0eXBlOiBpY3VUeXBlLCBtYWluQmluZGluZzogbWFpbkJpbmRpbmcsIGNhc2VzLCB2YWx1ZXN9O1xufVxuXG4vKipcbiAqIEJyZWFrcyBwYXR0ZXJuIGludG8gc3RyaW5ncyBhbmQgdG9wIGxldmVsIHsuLi59IGJsb2Nrcy5cbiAqIENhbiBiZSB1c2VkIHRvIGJyZWFrIGEgbWVzc2FnZSBpbnRvIHRleHQgYW5kIElDVSBleHByZXNzaW9ucywgb3IgdG8gYnJlYWsgYW4gSUNVIGV4cHJlc3Npb25cbiAqIGludG8ga2V5cyBhbmQgY2FzZXMuIE9yaWdpbmFsIGNvZGUgZnJvbSBjbG9zdXJlIGxpYnJhcnksIG1vZGlmaWVkIGZvciBBbmd1bGFyLlxuICpcbiAqIEBwYXJhbSBwYXR0ZXJuIChzdWIpUGF0dGVybiB0byBiZSBicm9rZW4uXG4gKiBAcmV0dXJucyBBbiBgQXJyYXk8c3RyaW5nfEljdUV4cHJlc3Npb24+YCB3aGVyZTpcbiAqICAgLSBvZGQgcG9zaXRpb25zOiBgc3RyaW5nYCA9PiB0ZXh0IGJldHdlZW4gSUNVIGV4cHJlc3Npb25zXG4gKiAgIC0gZXZlbiBwb3NpdGlvbnM6IGBJQ1VFeHByZXNzaW9uYCA9PiBJQ1UgZXhwcmVzc2lvbiBwYXJzZWQgaW50byBgSUNVRXhwcmVzc2lvbmAgcmVjb3JkLlxuICovXG5mdW5jdGlvbiBpMThuUGFyc2VUZXh0SW50b1BhcnRzQW5kSUNVKHBhdHRlcm46IHN0cmluZyk6IChzdHJpbmcgfCBJY3VFeHByZXNzaW9uKVtdIHtcbiAgaWYgKCFwYXR0ZXJuKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgbGV0IHByZXZQb3MgPSAwO1xuICBjb25zdCBicmFjZVN0YWNrID0gW107XG4gIGNvbnN0IHJlc3VsdHM6IChzdHJpbmcgfCBJY3VFeHByZXNzaW9uKVtdID0gW107XG4gIGNvbnN0IGJyYWNlcyA9IC9be31dL2c7XG4gIC8vIGxhc3RJbmRleCBkb2Vzbid0IGdldCBzZXQgdG8gMCBzbyB3ZSBoYXZlIHRvLlxuICBicmFjZXMubGFzdEluZGV4ID0gMDtcblxuICBsZXQgbWF0Y2g7XG4gIHdoaWxlICgobWF0Y2ggPSBicmFjZXMuZXhlYyhwYXR0ZXJuKSkpIHtcbiAgICBjb25zdCBwb3MgPSBtYXRjaC5pbmRleDtcbiAgICBpZiAobWF0Y2hbMF0gPT0gJ30nKSB7XG4gICAgICBicmFjZVN0YWNrLnBvcCgpO1xuXG4gICAgICBpZiAoYnJhY2VTdGFjay5sZW5ndGggPT0gMCkge1xuICAgICAgICAvLyBFbmQgb2YgdGhlIGJsb2NrLlxuICAgICAgICBjb25zdCBibG9jayA9IHBhdHRlcm4uc3Vic3RyaW5nKHByZXZQb3MsIHBvcyk7XG4gICAgICAgIGlmIChJQ1VfQkxPQ0tfUkVHRVhQLnRlc3QoYmxvY2spKSB7XG4gICAgICAgICAgcmVzdWx0cy5wdXNoKHBhcnNlSUNVQmxvY2soYmxvY2spKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXN1bHRzLnB1c2goYmxvY2spO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJldlBvcyA9IHBvcyArIDE7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChicmFjZVN0YWNrLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgIGNvbnN0IHN1YnN0cmluZyA9IHBhdHRlcm4uc3Vic3RyaW5nKHByZXZQb3MsIHBvcyk7XG4gICAgICAgIHJlc3VsdHMucHVzaChzdWJzdHJpbmcpO1xuICAgICAgICBwcmV2UG9zID0gcG9zICsgMTtcbiAgICAgIH1cbiAgICAgIGJyYWNlU3RhY2sucHVzaCgneycpO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHN1YnN0cmluZyA9IHBhdHRlcm4uc3Vic3RyaW5nKHByZXZQb3MpO1xuICByZXN1bHRzLnB1c2goc3Vic3RyaW5nKTtcbiAgcmV0dXJuIHJlc3VsdHM7XG59XG5cbi8qKlxuICogUGFyc2VzIGEgbm9kZSwgaXRzIGNoaWxkcmVuIGFuZCBpdHMgc2libGluZ3MsIGFuZCBnZW5lcmF0ZXMgdGhlIG11dGF0ZSAmIHVwZGF0ZSBPcENvZGVzLlxuICpcbiAqL1xuZnVuY3Rpb24gcGFyc2VJY3VDYXNlKFxuICBhc3Q6IEkxOG5Ob2RlW10sXG4gIHRWaWV3OiBUVmlldyxcbiAgdEljdTogVEljdSxcbiAgbFZpZXc6IExWaWV3LFxuICB1cGRhdGVPcENvZGVzOiBJMThuVXBkYXRlT3BDb2RlcyxcbiAgcGFyZW50SWR4OiBudW1iZXIsXG4gIGNhc2VOYW1lOiBzdHJpbmcsXG4gIHVuc2FmZUNhc2VIdG1sOiBzdHJpbmcsXG4gIG5lc3RlZEljdXM6IEljdUV4cHJlc3Npb25bXSxcbik6IG51bWJlciB7XG4gIGNvbnN0IGNyZWF0ZTogSWN1Q3JlYXRlT3BDb2RlcyA9IFtdIGFzIGFueTtcbiAgY29uc3QgcmVtb3ZlOiBJMThuUmVtb3ZlT3BDb2RlcyA9IFtdIGFzIGFueTtcbiAgY29uc3QgdXBkYXRlOiBJMThuVXBkYXRlT3BDb2RlcyA9IFtdIGFzIGFueTtcbiAgaWYgKG5nRGV2TW9kZSkge1xuICAgIGF0dGFjaERlYnVnR2V0dGVyKGNyZWF0ZSwgaWN1Q3JlYXRlT3BDb2Rlc1RvU3RyaW5nKTtcbiAgICBhdHRhY2hEZWJ1Z0dldHRlcihyZW1vdmUsIGkxOG5SZW1vdmVPcENvZGVzVG9TdHJpbmcpO1xuICAgIGF0dGFjaERlYnVnR2V0dGVyKHVwZGF0ZSwgaTE4blVwZGF0ZU9wQ29kZXNUb1N0cmluZyk7XG4gIH1cbiAgdEljdS5jYXNlcy5wdXNoKGNhc2VOYW1lKTtcbiAgdEljdS5jcmVhdGUucHVzaChjcmVhdGUpO1xuICB0SWN1LnJlbW92ZS5wdXNoKHJlbW92ZSk7XG4gIHRJY3UudXBkYXRlLnB1c2godXBkYXRlKTtcblxuICBjb25zdCBpbmVydEJvZHlIZWxwZXIgPSBnZXRJbmVydEJvZHlIZWxwZXIoZ2V0RG9jdW1lbnQoKSk7XG4gIGNvbnN0IGluZXJ0Qm9keUVsZW1lbnQgPSBpbmVydEJvZHlIZWxwZXIuZ2V0SW5lcnRCb2R5RWxlbWVudCh1bnNhZmVDYXNlSHRtbCk7XG4gIG5nRGV2TW9kZSAmJiBhc3NlcnREZWZpbmVkKGluZXJ0Qm9keUVsZW1lbnQsICdVbmFibGUgdG8gZ2VuZXJhdGUgaW5lcnQgYm9keSBlbGVtZW50Jyk7XG4gIGNvbnN0IGluZXJ0Um9vdE5vZGUgPSAoZ2V0VGVtcGxhdGVDb250ZW50KGluZXJ0Qm9keUVsZW1lbnQhKSBhcyBFbGVtZW50KSB8fCBpbmVydEJvZHlFbGVtZW50O1xuICBpZiAoaW5lcnRSb290Tm9kZSkge1xuICAgIHJldHVybiB3YWxrSWN1VHJlZShcbiAgICAgIGFzdCxcbiAgICAgIHRWaWV3LFxuICAgICAgdEljdSxcbiAgICAgIGxWaWV3LFxuICAgICAgdXBkYXRlT3BDb2RlcyxcbiAgICAgIGNyZWF0ZSxcbiAgICAgIHJlbW92ZSxcbiAgICAgIHVwZGF0ZSxcbiAgICAgIGluZXJ0Um9vdE5vZGUsXG4gICAgICBwYXJlbnRJZHgsXG4gICAgICBuZXN0ZWRJY3VzLFxuICAgICAgMCxcbiAgICApO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiAwO1xuICB9XG59XG5cbmZ1bmN0aW9uIHdhbGtJY3VUcmVlKFxuICBhc3Q6IEkxOG5Ob2RlW10sXG4gIHRWaWV3OiBUVmlldyxcbiAgdEljdTogVEljdSxcbiAgbFZpZXc6IExWaWV3LFxuICBzaGFyZWRVcGRhdGVPcENvZGVzOiBJMThuVXBkYXRlT3BDb2RlcyxcbiAgY3JlYXRlOiBJY3VDcmVhdGVPcENvZGVzLFxuICByZW1vdmU6IEkxOG5SZW1vdmVPcENvZGVzLFxuICB1cGRhdGU6IEkxOG5VcGRhdGVPcENvZGVzLFxuICBwYXJlbnROb2RlOiBFbGVtZW50LFxuICBwYXJlbnRJZHg6IG51bWJlcixcbiAgbmVzdGVkSWN1czogSWN1RXhwcmVzc2lvbltdLFxuICBkZXB0aDogbnVtYmVyLFxuKTogbnVtYmVyIHtcbiAgbGV0IGJpbmRpbmdNYXNrID0gMDtcbiAgbGV0IGN1cnJlbnROb2RlID0gcGFyZW50Tm9kZS5maXJzdENoaWxkO1xuICB3aGlsZSAoY3VycmVudE5vZGUpIHtcbiAgICBjb25zdCBuZXdJbmRleCA9IGFsbG9jRXhwYW5kbyh0VmlldywgbFZpZXcsIDEsIG51bGwpO1xuICAgIHN3aXRjaCAoY3VycmVudE5vZGUubm9kZVR5cGUpIHtcbiAgICAgIGNhc2UgTm9kZS5FTEVNRU5UX05PREU6XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBjdXJyZW50Tm9kZSBhcyBFbGVtZW50O1xuICAgICAgICBjb25zdCB0YWdOYW1lID0gZWxlbWVudC50YWdOYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGlmIChWQUxJRF9FTEVNRU5UUy5oYXNPd25Qcm9wZXJ0eSh0YWdOYW1lKSkge1xuICAgICAgICAgIGFkZENyZWF0ZU5vZGVBbmRBcHBlbmQoY3JlYXRlLCBFTEVNRU5UX01BUktFUiwgdGFnTmFtZSwgcGFyZW50SWR4LCBuZXdJbmRleCk7XG4gICAgICAgICAgdFZpZXcuZGF0YVtuZXdJbmRleF0gPSB0YWdOYW1lO1xuICAgICAgICAgIGNvbnN0IGVsQXR0cnMgPSBlbGVtZW50LmF0dHJpYnV0ZXM7XG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbEF0dHJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBhdHRyID0gZWxBdHRycy5pdGVtKGkpITtcbiAgICAgICAgICAgIGNvbnN0IGxvd2VyQXR0ck5hbWUgPSBhdHRyLm5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgIGNvbnN0IGhhc0JpbmRpbmcgPSAhIWF0dHIudmFsdWUubWF0Y2goQklORElOR19SRUdFWFApO1xuICAgICAgICAgICAgLy8gd2UgYXNzdW1lIHRoZSBpbnB1dCBzdHJpbmcgaXMgc2FmZSwgdW5sZXNzIGl0J3MgdXNpbmcgYSBiaW5kaW5nXG4gICAgICAgICAgICBpZiAoaGFzQmluZGluZykge1xuICAgICAgICAgICAgICBpZiAoVkFMSURfQVRUUlMuaGFzT3duUHJvcGVydHkobG93ZXJBdHRyTmFtZSkpIHtcbiAgICAgICAgICAgICAgICBpZiAoVVJJX0FUVFJTW2xvd2VyQXR0ck5hbWVdKSB7XG4gICAgICAgICAgICAgICAgICBnZW5lcmF0ZUJpbmRpbmdVcGRhdGVPcENvZGVzKFxuICAgICAgICAgICAgICAgICAgICB1cGRhdGUsXG4gICAgICAgICAgICAgICAgICAgIGF0dHIudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIG5ld0luZGV4LFxuICAgICAgICAgICAgICAgICAgICBhdHRyLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgIF9zYW5pdGl6ZVVybCxcbiAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIGdlbmVyYXRlQmluZGluZ1VwZGF0ZU9wQ29kZXModXBkYXRlLCBhdHRyLnZhbHVlLCBuZXdJbmRleCwgYXR0ci5uYW1lLCAwLCBudWxsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbmdEZXZNb2RlICYmXG4gICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICAgICAgICAgICAgIGBXQVJOSU5HOiBpZ25vcmluZyB1bnNhZmUgYXR0cmlidXRlIHZhbHVlIGAgK1xuICAgICAgICAgICAgICAgICAgICAgIGAke2xvd2VyQXR0ck5hbWV9IG9uIGVsZW1lbnQgJHt0YWdOYW1lfSBgICtcbiAgICAgICAgICAgICAgICAgICAgICBgKHNlZSAke1hTU19TRUNVUklUWV9VUkx9KWAsXG4gICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBhZGRDcmVhdGVBdHRyaWJ1dGUoY3JlYXRlLCBuZXdJbmRleCwgYXR0cik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IGVsZW1lbnROb2RlOiBJMThuRWxlbWVudE5vZGUgPSB7XG4gICAgICAgICAgICBraW5kOiBJMThuTm9kZUtpbmQuRUxFTUVOVCxcbiAgICAgICAgICAgIGluZGV4OiBuZXdJbmRleCxcbiAgICAgICAgICAgIGNoaWxkcmVuOiBbXSxcbiAgICAgICAgICB9O1xuICAgICAgICAgIGFzdC5wdXNoKGVsZW1lbnROb2RlKTtcbiAgICAgICAgICAvLyBQYXJzZSB0aGUgY2hpbGRyZW4gb2YgdGhpcyBub2RlIChpZiBhbnkpXG4gICAgICAgICAgYmluZGluZ01hc2sgPVxuICAgICAgICAgICAgd2Fsa0ljdVRyZWUoXG4gICAgICAgICAgICAgIGVsZW1lbnROb2RlLmNoaWxkcmVuLFxuICAgICAgICAgICAgICB0VmlldyxcbiAgICAgICAgICAgICAgdEljdSxcbiAgICAgICAgICAgICAgbFZpZXcsXG4gICAgICAgICAgICAgIHNoYXJlZFVwZGF0ZU9wQ29kZXMsXG4gICAgICAgICAgICAgIGNyZWF0ZSxcbiAgICAgICAgICAgICAgcmVtb3ZlLFxuICAgICAgICAgICAgICB1cGRhdGUsXG4gICAgICAgICAgICAgIGN1cnJlbnROb2RlIGFzIEVsZW1lbnQsXG4gICAgICAgICAgICAgIG5ld0luZGV4LFxuICAgICAgICAgICAgICBuZXN0ZWRJY3VzLFxuICAgICAgICAgICAgICBkZXB0aCArIDEsXG4gICAgICAgICAgICApIHwgYmluZGluZ01hc2s7XG4gICAgICAgICAgYWRkUmVtb3ZlTm9kZShyZW1vdmUsIG5ld0luZGV4LCBkZXB0aCk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIE5vZGUuVEVYVF9OT0RFOlxuICAgICAgICBjb25zdCB2YWx1ZSA9IGN1cnJlbnROb2RlLnRleHRDb250ZW50IHx8ICcnO1xuICAgICAgICBjb25zdCBoYXNCaW5kaW5nID0gdmFsdWUubWF0Y2goQklORElOR19SRUdFWFApO1xuICAgICAgICBhZGRDcmVhdGVOb2RlQW5kQXBwZW5kKGNyZWF0ZSwgbnVsbCwgaGFzQmluZGluZyA/ICcnIDogdmFsdWUsIHBhcmVudElkeCwgbmV3SW5kZXgpO1xuICAgICAgICBhZGRSZW1vdmVOb2RlKHJlbW92ZSwgbmV3SW5kZXgsIGRlcHRoKTtcbiAgICAgICAgaWYgKGhhc0JpbmRpbmcpIHtcbiAgICAgICAgICBiaW5kaW5nTWFzayA9XG4gICAgICAgICAgICBnZW5lcmF0ZUJpbmRpbmdVcGRhdGVPcENvZGVzKHVwZGF0ZSwgdmFsdWUsIG5ld0luZGV4LCBudWxsLCAwLCBudWxsKSB8IGJpbmRpbmdNYXNrO1xuICAgICAgICB9XG4gICAgICAgIGFzdC5wdXNoKHtcbiAgICAgICAgICBraW5kOiBJMThuTm9kZUtpbmQuVEVYVCxcbiAgICAgICAgICBpbmRleDogbmV3SW5kZXgsXG4gICAgICAgIH0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgTm9kZS5DT01NRU5UX05PREU6XG4gICAgICAgIC8vIENoZWNrIGlmIHRoZSBjb21tZW50IG5vZGUgaXMgYSBwbGFjZWhvbGRlciBmb3IgYSBuZXN0ZWQgSUNVXG4gICAgICAgIGNvbnN0IGlzTmVzdGVkSWN1ID0gTkVTVEVEX0lDVS5leGVjKGN1cnJlbnROb2RlLnRleHRDb250ZW50IHx8ICcnKTtcbiAgICAgICAgaWYgKGlzTmVzdGVkSWN1KSB7XG4gICAgICAgICAgY29uc3QgbmVzdGVkSWN1SW5kZXggPSBwYXJzZUludChpc05lc3RlZEljdVsxXSwgMTApO1xuICAgICAgICAgIGNvbnN0IGljdUV4cHJlc3Npb246IEljdUV4cHJlc3Npb24gPSBuZXN0ZWRJY3VzW25lc3RlZEljdUluZGV4XTtcbiAgICAgICAgICAvLyBDcmVhdGUgdGhlIGNvbW1lbnQgbm9kZSB0aGF0IHdpbGwgYW5jaG9yIHRoZSBJQ1UgZXhwcmVzc2lvblxuICAgICAgICAgIGFkZENyZWF0ZU5vZGVBbmRBcHBlbmQoXG4gICAgICAgICAgICBjcmVhdGUsXG4gICAgICAgICAgICBJQ1VfTUFSS0VSLFxuICAgICAgICAgICAgbmdEZXZNb2RlID8gYG5lc3RlZCBJQ1UgJHtuZXN0ZWRJY3VJbmRleH1gIDogJycsXG4gICAgICAgICAgICBwYXJlbnRJZHgsXG4gICAgICAgICAgICBuZXdJbmRleCxcbiAgICAgICAgICApO1xuICAgICAgICAgIGljdVN0YXJ0KGFzdCwgdFZpZXcsIGxWaWV3LCBzaGFyZWRVcGRhdGVPcENvZGVzLCBwYXJlbnRJZHgsIGljdUV4cHJlc3Npb24sIG5ld0luZGV4KTtcbiAgICAgICAgICBhZGRSZW1vdmVOZXN0ZWRJY3UocmVtb3ZlLCBuZXdJbmRleCwgZGVwdGgpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBjdXJyZW50Tm9kZSA9IGN1cnJlbnROb2RlLm5leHRTaWJsaW5nO1xuICB9XG4gIHJldHVybiBiaW5kaW5nTWFzaztcbn1cblxuZnVuY3Rpb24gYWRkUmVtb3ZlTm9kZShyZW1vdmU6IEkxOG5SZW1vdmVPcENvZGVzLCBpbmRleDogbnVtYmVyLCBkZXB0aDogbnVtYmVyKSB7XG4gIGlmIChkZXB0aCA9PT0gMCkge1xuICAgIHJlbW92ZS5wdXNoKGluZGV4KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBhZGRSZW1vdmVOZXN0ZWRJY3UocmVtb3ZlOiBJMThuUmVtb3ZlT3BDb2RlcywgaW5kZXg6IG51bWJlciwgZGVwdGg6IG51bWJlcikge1xuICBpZiAoZGVwdGggPT09IDApIHtcbiAgICByZW1vdmUucHVzaCh+aW5kZXgpOyAvLyByZW1vdmUgSUNVIGF0IGBpbmRleGBcbiAgICByZW1vdmUucHVzaChpbmRleCk7IC8vIHJlbW92ZSBJQ1UgY29tbWVudCBhdCBgaW5kZXhgXG4gIH1cbn1cblxuZnVuY3Rpb24gYWRkVXBkYXRlSWN1U3dpdGNoKFxuICB1cGRhdGU6IEkxOG5VcGRhdGVPcENvZGVzLFxuICBpY3VFeHByZXNzaW9uOiBJY3VFeHByZXNzaW9uLFxuICBpbmRleDogbnVtYmVyLFxuKSB7XG4gIHVwZGF0ZS5wdXNoKFxuICAgIHRvTWFza0JpdChpY3VFeHByZXNzaW9uLm1haW5CaW5kaW5nKSxcbiAgICAyLFxuICAgIC0xIC0gaWN1RXhwcmVzc2lvbi5tYWluQmluZGluZyxcbiAgICAoaW5kZXggPDwgSTE4blVwZGF0ZU9wQ29kZS5TSElGVF9SRUYpIHwgSTE4blVwZGF0ZU9wQ29kZS5JY3VTd2l0Y2gsXG4gICk7XG59XG5cbmZ1bmN0aW9uIGFkZFVwZGF0ZUljdVVwZGF0ZSh1cGRhdGU6IEkxOG5VcGRhdGVPcENvZGVzLCBiaW5kaW5nTWFzazogbnVtYmVyLCBpbmRleDogbnVtYmVyKSB7XG4gIHVwZGF0ZS5wdXNoKGJpbmRpbmdNYXNrLCAxLCAoaW5kZXggPDwgSTE4blVwZGF0ZU9wQ29kZS5TSElGVF9SRUYpIHwgSTE4blVwZGF0ZU9wQ29kZS5JY3VVcGRhdGUpO1xufVxuXG5mdW5jdGlvbiBhZGRDcmVhdGVOb2RlQW5kQXBwZW5kKFxuICBjcmVhdGU6IEljdUNyZWF0ZU9wQ29kZXMsXG4gIG1hcmtlcjogbnVsbCB8IElDVV9NQVJLRVIgfCBFTEVNRU5UX01BUktFUixcbiAgdGV4dDogc3RyaW5nLFxuICBhcHBlbmRUb1BhcmVudElkeDogbnVtYmVyLFxuICBjcmVhdGVBdElkeDogbnVtYmVyLFxuKSB7XG4gIGlmIChtYXJrZXIgIT09IG51bGwpIHtcbiAgICBjcmVhdGUucHVzaChtYXJrZXIpO1xuICB9XG4gIGNyZWF0ZS5wdXNoKFxuICAgIHRleHQsXG4gICAgY3JlYXRlQXRJZHgsXG4gICAgaWN1Q3JlYXRlT3BDb2RlKEljdUNyZWF0ZU9wQ29kZS5BcHBlbmRDaGlsZCwgYXBwZW5kVG9QYXJlbnRJZHgsIGNyZWF0ZUF0SWR4KSxcbiAgKTtcbn1cblxuZnVuY3Rpb24gYWRkQ3JlYXRlQXR0cmlidXRlKGNyZWF0ZTogSWN1Q3JlYXRlT3BDb2RlcywgbmV3SW5kZXg6IG51bWJlciwgYXR0cjogQXR0cikge1xuICBjcmVhdGUucHVzaChcbiAgICAobmV3SW5kZXggPDwgSWN1Q3JlYXRlT3BDb2RlLlNISUZUX1JFRikgfCBJY3VDcmVhdGVPcENvZGUuQXR0cixcbiAgICBhdHRyLm5hbWUsXG4gICAgYXR0ci52YWx1ZSxcbiAgKTtcbn1cbiJdfQ==