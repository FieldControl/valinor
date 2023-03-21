/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import '../../util/ng_dev_mode';
import '../../util/ng_i18n_closure_mode';
import { XSS_SECURITY_URL } from '../../error_details_base_url';
import { getTemplateContent, URI_ATTRS, VALID_ATTRS, VALID_ELEMENTS } from '../../sanitization/html_sanitizer';
import { getInertBodyHelper } from '../../sanitization/inert_body';
import { _sanitizeUrl } from '../../sanitization/url_sanitizer';
import { assertDefined, assertEqual, assertGreaterThanOrEqual, assertOneOf, assertString } from '../../util/assert';
import { loadIcuContainerVisitor } from '../instructions/i18n_icu_container_visitor';
import { allocExpando, createTNodeAtIndex } from '../instructions/shared';
import { getDocument } from '../interfaces/document';
import { ELEMENT_MARKER, I18nCreateOpCode, ICU_MARKER } from '../interfaces/i18n';
import { HEADER_OFFSET } from '../interfaces/view';
import { getCurrentParentTNode, getCurrentTNode, setCurrentTNode } from '../state';
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
            const isClosing = value.charCodeAt(0) === 47 /* CharCode.SLASH */;
            const type = value.charCodeAt(isClosing ? 1 : 0);
            ngDevMode && assertOneOf(type, 42 /* CharCode.STAR */, 35 /* CharCode.HASH */);
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
    updateOpCodes.push(destinationNode << 2 /* I18nUpdateOpCode.SHIFT_REF */ |
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
    update.push(toMaskBit(icuExpression.mainBinding), 2, -1 - icuExpression.mainBinding, index << 2 /* I18nUpdateOpCode.SHIFT_REF */ | 2 /* I18nUpdateOpCode.IcuSwitch */);
}
function addUpdateIcuUpdate(update, bindingMask, index) {
    update.push(bindingMask, 1, index << 2 /* I18nUpdateOpCode.SHIFT_REF */ | 3 /* I18nUpdateOpCode.IcuUpdate */);
}
function addCreateNodeAndAppend(create, marker, text, appendToParentIdx, createAtIdx) {
    if (marker !== null) {
        create.push(marker);
    }
    create.push(text, createAtIdx, icuCreateOpCode(0 /* IcuCreateOpCode.AppendChild */, appendToParentIdx, createAtIdx));
}
function addCreateAttribute(create, newIndex, attr) {
    create.push(newIndex << 1 /* IcuCreateOpCode.SHIFT_REF */ | 1 /* IcuCreateOpCode.Attr */, attr.name, attr.value);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaTE4bl9wYXJzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL3JlbmRlcjMvaTE4bi9pMThuX3BhcnNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUNILE9BQU8sd0JBQXdCLENBQUM7QUFDaEMsT0FBTyxpQ0FBaUMsQ0FBQztBQUV6QyxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSw4QkFBOEIsQ0FBQztBQUM5RCxPQUFPLEVBQUMsa0JBQWtCLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxjQUFjLEVBQUMsTUFBTSxtQ0FBbUMsQ0FBQztBQUM3RyxPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSwrQkFBK0IsQ0FBQztBQUNqRSxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sa0NBQWtDLENBQUM7QUFDOUQsT0FBTyxFQUFDLGFBQWEsRUFBRSxXQUFXLEVBQUUsd0JBQXdCLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBRWxILE9BQU8sRUFBQyx1QkFBdUIsRUFBQyxNQUFNLDRDQUE0QyxDQUFDO0FBQ25GLE9BQU8sRUFBQyxZQUFZLEVBQUUsa0JBQWtCLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUN4RSxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFDbkQsT0FBTyxFQUFDLGNBQWMsRUFBRSxnQkFBZ0IsRUFBNkUsVUFBVSxFQUF5RSxNQUFNLG9CQUFvQixDQUFDO0FBR25PLE9BQU8sRUFBQyxhQUFhLEVBQWUsTUFBTSxvQkFBb0IsQ0FBQztBQUMvRCxPQUFPLEVBQUMscUJBQXFCLEVBQUUsZUFBZSxFQUFFLGVBQWUsRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUVqRixPQUFPLEVBQUMseUJBQXlCLEVBQUUseUJBQXlCLEVBQUUseUJBQXlCLEVBQUUsd0JBQXdCLEVBQUMsTUFBTSxjQUFj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LFNBQVMsa0JBQWtCLENBQUMsTUFBeUIsRUFBRSxXQUFtQixFQUFFLEtBQWE7SUFDdkYsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLEtBQUssc0NBQThCLHFDQUE2QixDQUFDLENBQUM7QUFDaEcsQ0FBQztBQUVELFNBQVMsc0JBQXNCLENBQzNCLE1BQXdCLEVBQUUsTUFBc0MsRUFBRSxJQUFZLEVBQzlFLGlCQUF5QixFQUFFLFdBQW1CO0lBQ2hELElBQUksTUFBTSxLQUFLLElBQUksRUFBRTtRQUNuQixNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQ3JCO0lBQ0QsTUFBTSxDQUFDLElBQUksQ0FDUCxJQUFJLEVBQUUsV0FBVyxFQUNqQixlQUFlLHNDQUE4QixpQkFBaUIsRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDO0FBQ3BGLENBQUM7QUFFRCxTQUFTLGtCQUFrQixDQUFDLE1BQXdCLEVBQUUsUUFBZ0IsRUFBRSxJQUFVO0lBQ2hGLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxxQ0FBNkIsK0JBQXVCLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDbkcsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0ICcuLi8uLi91dGlsL25nX2Rldl9tb2RlJztcbmltcG9ydCAnLi4vLi4vdXRpbC9uZ19pMThuX2Nsb3N1cmVfbW9kZSc7XG5cbmltcG9ydCB7WFNTX1NFQ1VSSVRZX1VSTH0gZnJvbSAnLi4vLi4vZXJyb3JfZGV0YWlsc19iYXNlX3VybCc7XG5pbXBvcnQge2dldFRlbXBsYXRlQ29udGVudCwgVVJJX0FUVFJTLCBWQUxJRF9BVFRSUywgVkFMSURfRUxFTUVOVFN9IGZyb20gJy4uLy4uL3Nhbml0aXphdGlvbi9odG1sX3Nhbml0aXplcic7XG5pbXBvcnQge2dldEluZXJ0Qm9keUhlbHBlcn0gZnJvbSAnLi4vLi4vc2FuaXRpemF0aW9uL2luZXJ0X2JvZHknO1xuaW1wb3J0IHtfc2FuaXRpemVVcmx9IGZyb20gJy4uLy4uL3Nhbml0aXphdGlvbi91cmxfc2FuaXRpemVyJztcbmltcG9ydCB7YXNzZXJ0RGVmaW5lZCwgYXNzZXJ0RXF1YWwsIGFzc2VydEdyZWF0ZXJUaGFuT3JFcXVhbCwgYXNzZXJ0T25lT2YsIGFzc2VydFN0cmluZ30gZnJvbSAnLi4vLi4vdXRpbC9hc3NlcnQnO1xuaW1wb3J0IHtDaGFyQ29kZX0gZnJvbSAnLi4vLi4vdXRpbC9jaGFyX2NvZGUnO1xuaW1wb3J0IHtsb2FkSWN1Q29udGFpbmVyVmlzaXRvcn0gZnJvbSAnLi4vaW5zdHJ1Y3Rpb25zL2kxOG5faWN1X2NvbnRhaW5lcl92aXNpdG9yJztcbmltcG9ydCB7YWxsb2NFeHBhbmRvLCBjcmVhdGVUTm9kZUF0SW5kZXh9IGZyb20gJy4uL2luc3RydWN0aW9ucy9zaGFyZWQnO1xuaW1wb3J0IHtnZXREb2N1bWVudH0gZnJvbSAnLi4vaW50ZXJmYWNlcy9kb2N1bWVudCc7XG5pbXBvcnQge0VMRU1FTlRfTUFSS0VSLCBJMThuQ3JlYXRlT3BDb2RlLCBJMThuQ3JlYXRlT3BDb2RlcywgSTE4blJlbW92ZU9wQ29kZXMsIEkxOG5VcGRhdGVPcENvZGUsIEkxOG5VcGRhdGVPcENvZGVzLCBJQ1VfTUFSS0VSLCBJY3VDcmVhdGVPcENvZGUsIEljdUNyZWF0ZU9wQ29kZXMsIEljdUV4cHJlc3Npb24sIEljdVR5cGUsIFRJMThuLCBUSWN1fSBmcm9tICcuLi9pbnRlcmZhY2VzL2kxOG4nO1xuaW1wb3J0IHtUTm9kZSwgVE5vZGVUeXBlfSBmcm9tICcuLi9pbnRlcmZhY2VzL25vZGUnO1xuaW1wb3J0IHtTYW5pdGl6ZXJGbn0gZnJvbSAnLi4vaW50ZXJmYWNlcy9zYW5pdGl6YXRpb24nO1xuaW1wb3J0IHtIRUFERVJfT0ZGU0VULCBMVmlldywgVFZpZXd9IGZyb20gJy4uL2ludGVyZmFjZXMvdmlldyc7XG5pbXBvcnQge2dldEN1cnJlbnRQYXJlbnRUTm9kZSwgZ2V0Q3VycmVudFROb2RlLCBzZXRDdXJyZW50VE5vZGV9IGZyb20gJy4uL3N0YXRlJztcblxuaW1wb3J0IHtpMThuQ3JlYXRlT3BDb2Rlc1RvU3RyaW5nLCBpMThuUmVtb3ZlT3BDb2Rlc1RvU3RyaW5nLCBpMThuVXBkYXRlT3BDb2Rlc1RvU3RyaW5nLCBpY3VDcmVhdGVPcENvZGVzVG9TdHJpbmd9IGZyb20gJy4vaTE4bl9kZWJ1Zyc7XG5pbXBvcnQge2FkZFROb2RlQW5kVXBkYXRlSW5zZXJ0QmVmb3JlSW5kZXh9IGZyb20gJy4vaTE4bl9pbnNlcnRfYmVmb3JlX2luZGV4JztcbmltcG9ydCB7ZW5zdXJlSWN1Q29udGFpbmVyVmlzaXRvckxvYWRlZH0gZnJvbSAnLi9pMThuX3RyZWVfc2hha2luZyc7XG5pbXBvcnQge2NyZWF0ZVROb2RlUGxhY2Vob2xkZXIsIGljdUNyZWF0ZU9wQ29kZSwgc2V0VEljdSwgc2V0VE5vZGVJbnNlcnRCZWZvcmVJbmRleH0gZnJvbSAnLi9pMThuX3V0aWwnO1xuXG5cblxuY29uc3QgQklORElOR19SRUdFWFAgPSAv77+9KFxcZCspOj9cXGQq77+9L2dpO1xuY29uc3QgSUNVX1JFR0VYUCA9IC8oe1xccyrvv71cXGQrOj9cXGQq77+9XFxzKixcXHMqXFxTezZ9XFxzKixbXFxzXFxTXSp9KS9naTtcbmNvbnN0IE5FU1RFRF9JQ1UgPSAv77+9KFxcZCsp77+9LztcbmNvbnN0IElDVV9CTE9DS19SRUdFWFAgPSAvXlxccyoo77+9XFxkKzo/XFxkKu+/vSlcXHMqLFxccyooc2VsZWN0fHBsdXJhbClcXHMqLC87XG5cbmNvbnN0IE1BUktFUiA9IGDvv71gO1xuY29uc3QgU1VCVEVNUExBVEVfUkVHRVhQID0gL++/vVxcLz9cXCooXFxkKzpcXGQrKe+/vS9naTtcbmNvbnN0IFBIX1JFR0VYUCA9IC/vv70oXFwvP1sjKl1cXGQrKTo/XFxkKu+/vS9naTtcblxuLyoqXG4gKiBBbmd1bGFyIERhcnQgaW50cm9kdWNlZCAmbmdzcDsgYXMgYSBwbGFjZWhvbGRlciBmb3Igbm9uLXJlbW92YWJsZSBzcGFjZSwgc2VlOlxuICogaHR0cHM6Ly9naXRodWIuY29tL2RhcnQtbGFuZy9hbmd1bGFyL2Jsb2IvMGJiNjExMzg3ZDI5ZDY1YjVhZjdmOWQyNTE1YWI1NzFmZDNmYmVlNC9fdGVzdHMvdGVzdC9jb21waWxlci9wcmVzZXJ2ZV93aGl0ZXNwYWNlX3Rlc3QuZGFydCNMMjUtTDMyXG4gKiBJbiBBbmd1bGFyIERhcnQgJm5nc3A7IGlzIGNvbnZlcnRlZCB0byB0aGUgMHhFNTAwIFBVQSAoUHJpdmF0ZSBVc2UgQXJlYXMpIHVuaWNvZGUgY2hhcmFjdGVyXG4gKiBhbmQgbGF0ZXIgb24gcmVwbGFjZWQgYnkgYSBzcGFjZS4gV2UgYXJlIHJlLWltcGxlbWVudGluZyB0aGUgc2FtZSBpZGVhIGhlcmUsIHNpbmNlIHRyYW5zbGF0aW9uc1xuICogbWlnaHQgY29udGFpbiB0aGlzIHNwZWNpYWwgY2hhcmFjdGVyLlxuICovXG5jb25zdCBOR1NQX1VOSUNPREVfUkVHRVhQID0gL1xcdUU1MDAvZztcbmZ1bmN0aW9uIHJlcGxhY2VOZ3NwKHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gdmFsdWUucmVwbGFjZShOR1NQX1VOSUNPREVfUkVHRVhQLCAnICcpO1xufVxuXG4vKipcbiAqIFBhdGNoIGEgYGRlYnVnYCBwcm9wZXJ0eSBnZXR0ZXIgb24gdG9wIG9mIHRoZSBleGlzdGluZyBvYmplY3QuXG4gKlxuICogTk9URTogYWx3YXlzIGNhbGwgdGhpcyBtZXRob2Qgd2l0aCBgbmdEZXZNb2RlICYmIGF0dGFjaERlYnVnT2JqZWN0KC4uLilgXG4gKlxuICogQHBhcmFtIG9iaiBPYmplY3QgdG8gcGF0Y2hcbiAqIEBwYXJhbSBkZWJ1Z0dldHRlciBHZXR0ZXIgcmV0dXJuaW5nIGEgdmFsdWUgdG8gcGF0Y2hcbiAqL1xuZnVuY3Rpb24gYXR0YWNoRGVidWdHZXR0ZXI8VD4ob2JqOiBULCBkZWJ1Z0dldHRlcjogKHRoaXM6IFQpID0+IGFueSk6IHZvaWQge1xuICBpZiAobmdEZXZNb2RlKSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwgJ2RlYnVnJywge2dldDogZGVidWdHZXR0ZXIsIGVudW1lcmFibGU6IGZhbHNlfSk7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAnVGhpcyBtZXRob2Qgc2hvdWxkIGJlIGd1YXJkZWQgd2l0aCBgbmdEZXZNb2RlYCBzbyB0aGF0IGl0IGNhbiBiZSB0cmVlIHNoYWtlbiBpbiBwcm9kdWN0aW9uIScpO1xuICB9XG59XG5cbi8qKlxuICogQ3JlYXRlIGR5bmFtaWMgbm9kZXMgZnJvbSBpMThuIHRyYW5zbGF0aW9uIGJsb2NrLlxuICpcbiAqIC0gVGV4dCBub2RlcyBhcmUgY3JlYXRlZCBzeW5jaHJvbm91c2x5XG4gKiAtIFROb2RlcyBhcmUgbGlua2VkIGludG8gdHJlZSBsYXppbHlcbiAqXG4gKiBAcGFyYW0gdFZpZXcgQ3VycmVudCBgVFZpZXdgXG4gKiBAcGFyZW50VE5vZGVJbmRleCBpbmRleCB0byB0aGUgcGFyZW50IFROb2RlIG9mIHRoaXMgaTE4biBibG9ja1xuICogQHBhcmFtIGxWaWV3IEN1cnJlbnQgYExWaWV3YFxuICogQHBhcmFtIGluZGV4IEluZGV4IG9mIGDJtcm1aTE4blN0YXJ0YCBpbnN0cnVjdGlvbi5cbiAqIEBwYXJhbSBtZXNzYWdlIE1lc3NhZ2UgdG8gdHJhbnNsYXRlLlxuICogQHBhcmFtIHN1YlRlbXBsYXRlSW5kZXggSW5kZXggaW50byB0aGUgc3ViIHRlbXBsYXRlIG9mIG1lc3NhZ2UgdHJhbnNsYXRpb24uIChpZSBpbiBjYXNlIG9mXG4gKiAgICAgYG5nSWZgKSAoLTEgb3RoZXJ3aXNlKVxuICovXG5leHBvcnQgZnVuY3Rpb24gaTE4blN0YXJ0Rmlyc3RDcmVhdGVQYXNzKFxuICAgIHRWaWV3OiBUVmlldywgcGFyZW50VE5vZGVJbmRleDogbnVtYmVyLCBsVmlldzogTFZpZXcsIGluZGV4OiBudW1iZXIsIG1lc3NhZ2U6IHN0cmluZyxcbiAgICBzdWJUZW1wbGF0ZUluZGV4OiBudW1iZXIpIHtcbiAgY29uc3Qgcm9vdFROb2RlID0gZ2V0Q3VycmVudFBhcmVudFROb2RlKCk7XG4gIGNvbnN0IGNyZWF0ZU9wQ29kZXM6IEkxOG5DcmVhdGVPcENvZGVzID0gW10gYXMgYW55O1xuICBjb25zdCB1cGRhdGVPcENvZGVzOiBJMThuVXBkYXRlT3BDb2RlcyA9IFtdIGFzIGFueTtcbiAgY29uc3QgZXhpc3RpbmdUTm9kZVN0YWNrOiBUTm9kZVtdW10gPSBbW11dO1xuICBpZiAobmdEZXZNb2RlKSB7XG4gICAgYXR0YWNoRGVidWdHZXR0ZXIoY3JlYXRlT3BDb2RlcywgaTE4bkNyZWF0ZU9wQ29kZXNUb1N0cmluZyk7XG4gICAgYXR0YWNoRGVidWdHZXR0ZXIodXBkYXRlT3BDb2RlcywgaTE4blVwZGF0ZU9wQ29kZXNUb1N0cmluZyk7XG4gIH1cblxuICBtZXNzYWdlID0gZ2V0VHJhbnNsYXRpb25Gb3JUZW1wbGF0ZShtZXNzYWdlLCBzdWJUZW1wbGF0ZUluZGV4KTtcbiAgY29uc3QgbXNnUGFydHMgPSByZXBsYWNlTmdzcChtZXNzYWdlKS5zcGxpdChQSF9SRUdFWFApO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IG1zZ1BhcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgbGV0IHZhbHVlID0gbXNnUGFydHNbaV07XG4gICAgaWYgKChpICYgMSkgPT09IDApIHtcbiAgICAgIC8vIEV2ZW4gaW5kZXhlcyBhcmUgdGV4dCAoaW5jbHVkaW5nIGJpbmRpbmdzICYgSUNVIGV4cHJlc3Npb25zKVxuICAgICAgY29uc3QgcGFydHMgPSBpMThuUGFyc2VUZXh0SW50b1BhcnRzQW5kSUNVKHZhbHVlKTtcbiAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcGFydHMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgbGV0IHBhcnQgPSBwYXJ0c1tqXTtcbiAgICAgICAgaWYgKChqICYgMSkgPT09IDApIHtcbiAgICAgICAgICAvLyBgamAgaXMgb2RkIHRoZXJlZm9yZSBgcGFydGAgaXMgc3RyaW5nXG4gICAgICAgICAgY29uc3QgdGV4dCA9IHBhcnQgYXMgc3RyaW5nO1xuICAgICAgICAgIG5nRGV2TW9kZSAmJiBhc3NlcnRTdHJpbmcodGV4dCwgJ1BhcnNlZCBJQ1UgcGFydCBzaG91bGQgYmUgc3RyaW5nJyk7XG4gICAgICAgICAgaWYgKHRleHQgIT09ICcnKSB7XG4gICAgICAgICAgICBpMThuU3RhcnRGaXJzdENyZWF0ZVBhc3NQcm9jZXNzVGV4dE5vZGUoXG4gICAgICAgICAgICAgICAgdFZpZXcsIHJvb3RUTm9kZSwgZXhpc3RpbmdUTm9kZVN0YWNrWzBdLCBjcmVhdGVPcENvZGVzLCB1cGRhdGVPcENvZGVzLCBsVmlldywgdGV4dCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIGBqYCBpcyBFdmVuIHRoZXJlZm9yIGBwYXJ0YCBpcyBhbiBgSUNVRXhwcmVzc2lvbmBcbiAgICAgICAgICBjb25zdCBpY3VFeHByZXNzaW9uOiBJY3VFeHByZXNzaW9uID0gcGFydCBhcyBJY3VFeHByZXNzaW9uO1xuICAgICAgICAgIC8vIFZlcmlmeSB0aGF0IElDVSBleHByZXNzaW9uIGhhcyB0aGUgcmlnaHQgc2hhcGUuIFRyYW5zbGF0aW9ucyBtaWdodCBjb250YWluIGludmFsaWRcbiAgICAgICAgICAvLyBjb25zdHJ1Y3Rpb25zICh3aGlsZSBvcmlnaW5hbCBtZXNzYWdlcyB3ZXJlIGNvcnJlY3QpLCBzbyBJQ1UgcGFyc2luZyBhdCBydW50aW1lIG1heVxuICAgICAgICAgIC8vIG5vdCBzdWNjZWVkICh0aHVzIGBpY3VFeHByZXNzaW9uYCByZW1haW5zIGEgc3RyaW5nKS5cbiAgICAgICAgICAvLyBOb3RlOiB3ZSBpbnRlbnRpb25hbGx5IHJldGFpbiB0aGUgZXJyb3IgaGVyZSBieSBub3QgdXNpbmcgYG5nRGV2TW9kZWAsIGJlY2F1c2VcbiAgICAgICAgICAvLyB0aGUgdmFsdWUgY2FuIGNoYW5nZSBiYXNlZCBvbiB0aGUgbG9jYWxlIGFuZCB1c2VycyBhcmVuJ3QgZ3VhcmFudGVlZCB0byBoaXRcbiAgICAgICAgICAvLyBhbiBpbnZhbGlkIHN0cmluZyB3aGlsZSB0aGV5J3JlIGRldmVsb3BpbmcuXG4gICAgICAgICAgaWYgKHR5cGVvZiBpY3VFeHByZXNzaW9uICE9PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmFibGUgdG8gcGFyc2UgSUNVIGV4cHJlc3Npb24gaW4gXCIke21lc3NhZ2V9XCIgbWVzc2FnZS5gKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgaWN1Q29udGFpbmVyVE5vZGUgPSBjcmVhdGVUTm9kZUFuZEFkZE9wQ29kZShcbiAgICAgICAgICAgICAgdFZpZXcsIHJvb3RUTm9kZSwgZXhpc3RpbmdUTm9kZVN0YWNrWzBdLCBsVmlldywgY3JlYXRlT3BDb2RlcyxcbiAgICAgICAgICAgICAgbmdEZXZNb2RlID8gYElDVSAke2luZGV4fToke2ljdUV4cHJlc3Npb24ubWFpbkJpbmRpbmd9YCA6ICcnLCB0cnVlKTtcbiAgICAgICAgICBjb25zdCBpY3VOb2RlSW5kZXggPSBpY3VDb250YWluZXJUTm9kZS5pbmRleDtcbiAgICAgICAgICBuZ0Rldk1vZGUgJiZcbiAgICAgICAgICAgICAgYXNzZXJ0R3JlYXRlclRoYW5PckVxdWFsKFxuICAgICAgICAgICAgICAgICAgaWN1Tm9kZUluZGV4LCBIRUFERVJfT0ZGU0VULCAnSW5kZXggbXVzdCBiZSBpbiBhYnNvbHV0ZSBMVmlldyBvZmZzZXQnKTtcbiAgICAgICAgICBpY3VTdGFydCh0VmlldywgbFZpZXcsIHVwZGF0ZU9wQ29kZXMsIHBhcmVudFROb2RlSW5kZXgsIGljdUV4cHJlc3Npb24sIGljdU5vZGVJbmRleCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gT2RkIGluZGV4ZXMgYXJlIHBsYWNlaG9sZGVycyAoZWxlbWVudHMgYW5kIHN1Yi10ZW1wbGF0ZXMpXG4gICAgICAvLyBBdCB0aGlzIHBvaW50IHZhbHVlIGlzIHNvbWV0aGluZyBsaWtlOiAnLyMxOjInIChvcmlnaW5hbGx5IGNvbWluZyBmcm9tICfvv70vIzE6Mu+/vScpXG4gICAgICBjb25zdCBpc0Nsb3NpbmcgPSB2YWx1ZS5jaGFyQ29kZUF0KDApID09PSBDaGFyQ29kZS5TTEFTSDtcbiAgICAgIGNvbnN0IHR5cGUgPSB2YWx1ZS5jaGFyQ29kZUF0KGlzQ2xvc2luZyA/IDEgOiAwKTtcbiAgICAgIG5nRGV2TW9kZSAmJiBhc3NlcnRPbmVPZih0eXBlLCBDaGFyQ29kZS5TVEFSLCBDaGFyQ29kZS5IQVNIKTtcbiAgICAgIGNvbnN0IGluZGV4ID0gSEVBREVSX09GRlNFVCArIE51bWJlci5wYXJzZUludCh2YWx1ZS5zdWJzdHJpbmcoKGlzQ2xvc2luZyA/IDIgOiAxKSkpO1xuICAgICAgaWYgKGlzQ2xvc2luZykge1xuICAgICAgICBleGlzdGluZ1ROb2RlU3RhY2suc2hpZnQoKTtcbiAgICAgICAgc2V0Q3VycmVudFROb2RlKGdldEN1cnJlbnRQYXJlbnRUTm9kZSgpISwgZmFsc2UpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgdE5vZGUgPSBjcmVhdGVUTm9kZVBsYWNlaG9sZGVyKHRWaWV3LCBleGlzdGluZ1ROb2RlU3RhY2tbMF0sIGluZGV4KTtcbiAgICAgICAgZXhpc3RpbmdUTm9kZVN0YWNrLnVuc2hpZnQoW10pO1xuICAgICAgICBzZXRDdXJyZW50VE5vZGUodE5vZGUsIHRydWUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHRWaWV3LmRhdGFbaW5kZXhdID0gPFRJMThuPntcbiAgICBjcmVhdGU6IGNyZWF0ZU9wQ29kZXMsXG4gICAgdXBkYXRlOiB1cGRhdGVPcENvZGVzLFxuICB9O1xufVxuXG4vKipcbiAqIEFsbG9jYXRlIHNwYWNlIGluIGkxOG4gUmFuZ2UgYWRkIGNyZWF0ZSBPcENvZGUgaW5zdHJ1Y3Rpb24gdG8gY3JlYXRlIGEgdGV4dCBvciBjb21tZW50IG5vZGUuXG4gKlxuICogQHBhcmFtIHRWaWV3IEN1cnJlbnQgYFRWaWV3YCBuZWVkZWQgdG8gYWxsb2NhdGUgc3BhY2UgaW4gaTE4biByYW5nZS5cbiAqIEBwYXJhbSByb290VE5vZGUgUm9vdCBgVE5vZGVgIG9mIHRoZSBpMThuIGJsb2NrLiBUaGlzIG5vZGUgZGV0ZXJtaW5lcyBpZiB0aGUgbmV3IFROb2RlIHdpbGwgYmVcbiAqICAgICBhZGRlZCBhcyBwYXJ0IG9mIHRoZSBgaTE4blN0YXJ0YCBpbnN0cnVjdGlvbiBvciBhcyBwYXJ0IG9mIHRoZSBgVE5vZGUuaW5zZXJ0QmVmb3JlSW5kZXhgLlxuICogQHBhcmFtIGV4aXN0aW5nVE5vZGVzIGludGVybmFsIHN0YXRlIGZvciBgYWRkVE5vZGVBbmRVcGRhdGVJbnNlcnRCZWZvcmVJbmRleGAuXG4gKiBAcGFyYW0gbFZpZXcgQ3VycmVudCBgTFZpZXdgIG5lZWRlZCB0byBhbGxvY2F0ZSBzcGFjZSBpbiBpMThuIHJhbmdlLlxuICogQHBhcmFtIGNyZWF0ZU9wQ29kZXMgQXJyYXkgc3RvcmluZyBgSTE4bkNyZWF0ZU9wQ29kZXNgIHdoZXJlIG5ldyBvcENvZGVzIHdpbGwgYmUgYWRkZWQuXG4gKiBAcGFyYW0gdGV4dCBUZXh0IHRvIGJlIGFkZGVkIHdoZW4gdGhlIGBUZXh0YCBvciBgQ29tbWVudGAgbm9kZSB3aWxsIGJlIGNyZWF0ZWQuXG4gKiBAcGFyYW0gaXNJQ1UgdHJ1ZSBpZiBhIGBDb21tZW50YCBub2RlIGZvciBJQ1UgKGluc3RlYWQgb2YgYFRleHRgKSBub2RlIHNob3VsZCBiZSBjcmVhdGVkLlxuICovXG5mdW5jdGlvbiBjcmVhdGVUTm9kZUFuZEFkZE9wQ29kZShcbiAgICB0VmlldzogVFZpZXcsIHJvb3RUTm9kZTogVE5vZGV8bnVsbCwgZXhpc3RpbmdUTm9kZXM6IFROb2RlW10sIGxWaWV3OiBMVmlldyxcbiAgICBjcmVhdGVPcENvZGVzOiBJMThuQ3JlYXRlT3BDb2RlcywgdGV4dDogc3RyaW5nfG51bGwsIGlzSUNVOiBib29sZWFuKTogVE5vZGUge1xuICBjb25zdCBpMThuTm9kZUlkeCA9IGFsbG9jRXhwYW5kbyh0VmlldywgbFZpZXcsIDEsIG51bGwpO1xuICBsZXQgb3BDb2RlID0gaTE4bk5vZGVJZHggPDwgSTE4bkNyZWF0ZU9wQ29kZS5TSElGVDtcbiAgbGV0IHBhcmVudFROb2RlID0gZ2V0Q3VycmVudFBhcmVudFROb2RlKCk7XG5cbiAgaWYgKHJvb3RUTm9kZSA9PT0gcGFyZW50VE5vZGUpIHtcbiAgICAvLyBGSVhNRShtaXNrbyk6IEEgbnVsbCBgcGFyZW50VE5vZGVgIHNob3VsZCByZXByZXNlbnQgd2hlbiB3ZSBmYWxsIG9mIHRoZSBgTFZpZXdgIGJvdW5kYXJ5LlxuICAgIC8vICh0aGVyZSBpcyBubyBwYXJlbnQpLCBidXQgaW4gc29tZSBjaXJjdW1zdGFuY2VzIChiZWNhdXNlIHdlIGFyZSBpbmNvbnNpc3RlbnQgYWJvdXQgaG93IHdlIHNldFxuICAgIC8vIGBwcmV2aW91c09yUGFyZW50VE5vZGVgKSBpdCBjb3VsZCBwb2ludCB0byBgcm9vdFROb2RlYCBTbyB0aGlzIGlzIGEgd29yayBhcm91bmQuXG4gICAgcGFyZW50VE5vZGUgPSBudWxsO1xuICB9XG4gIGlmIChwYXJlbnRUTm9kZSA9PT0gbnVsbCkge1xuICAgIC8vIElmIHdlIGRvbid0IGhhdmUgYSBwYXJlbnQgdGhhdCBtZWFucyB0aGF0IHdlIGNhbiBlYWdlcmx5IGFkZCBub2Rlcy5cbiAgICAvLyBJZiB3ZSBoYXZlIGEgcGFyZW50IHRoYW4gdGhlc2Ugbm9kZXMgY2FuJ3QgYmUgYWRkZWQgbm93IChhcyB0aGUgcGFyZW50IGhhcyBub3QgYmVlbiBjcmVhdGVkXG4gICAgLy8geWV0KSBhbmQgaW5zdGVhZCB0aGUgYHBhcmVudFROb2RlYCBpcyByZXNwb25zaWJsZSBmb3IgYWRkaW5nIGl0LiBTZWVcbiAgICAvLyBgVE5vZGUuaW5zZXJ0QmVmb3JlSW5kZXhgXG4gICAgb3BDb2RlIHw9IEkxOG5DcmVhdGVPcENvZGUuQVBQRU5EX0VBR0VSTFk7XG4gIH1cbiAgaWYgKGlzSUNVKSB7XG4gICAgb3BDb2RlIHw9IEkxOG5DcmVhdGVPcENvZGUuQ09NTUVOVDtcbiAgICBlbnN1cmVJY3VDb250YWluZXJWaXNpdG9yTG9hZGVkKGxvYWRJY3VDb250YWluZXJWaXNpdG9yKTtcbiAgfVxuICBjcmVhdGVPcENvZGVzLnB1c2gob3BDb2RlLCB0ZXh0ID09PSBudWxsID8gJycgOiB0ZXh0KTtcbiAgLy8gV2Ugc3RvcmUgYHt7P319YCBzbyB0aGF0IHdoZW4gbG9va2luZyBhdCBkZWJ1ZyBgVE5vZGVUeXBlLnRlbXBsYXRlYCB3ZSBjYW4gc2VlIHdoZXJlIHRoZVxuICAvLyBiaW5kaW5ncyBhcmUuXG4gIGNvbnN0IHROb2RlID0gY3JlYXRlVE5vZGVBdEluZGV4KFxuICAgICAgdFZpZXcsIGkxOG5Ob2RlSWR4LCBpc0lDVSA/IFROb2RlVHlwZS5JY3UgOiBUTm9kZVR5cGUuVGV4dCxcbiAgICAgIHRleHQgPT09IG51bGwgPyAobmdEZXZNb2RlID8gJ3t7P319JyA6ICcnKSA6IHRleHQsIG51bGwpO1xuICBhZGRUTm9kZUFuZFVwZGF0ZUluc2VydEJlZm9yZUluZGV4KGV4aXN0aW5nVE5vZGVzLCB0Tm9kZSk7XG4gIGNvbnN0IHROb2RlSWR4ID0gdE5vZGUuaW5kZXg7XG4gIHNldEN1cnJlbnRUTm9kZSh0Tm9kZSwgZmFsc2UgLyogVGV4dCBub2RlcyBhcmUgc2VsZiBjbG9zaW5nICovKTtcbiAgaWYgKHBhcmVudFROb2RlICE9PSBudWxsICYmIHJvb3RUTm9kZSAhPT0gcGFyZW50VE5vZGUpIHtcbiAgICAvLyBXZSBhcmUgYSBjaGlsZCBvZiBkZWVwZXIgbm9kZSAocmF0aGVyIHRoYW4gYSBkaXJlY3QgY2hpbGQgb2YgYGkxOG5TdGFydGAgaW5zdHJ1Y3Rpb24uKVxuICAgIC8vIFdlIGhhdmUgdG8gbWFrZSBzdXJlIHRvIGFkZCBvdXJzZWx2ZXMgdG8gdGhlIHBhcmVudC5cbiAgICBzZXRUTm9kZUluc2VydEJlZm9yZUluZGV4KHBhcmVudFROb2RlLCB0Tm9kZUlkeCk7XG4gIH1cbiAgcmV0dXJuIHROb2RlO1xufVxuXG4vKipcbiAqIFByb2Nlc3NlcyB0ZXh0IG5vZGUgaW4gaTE4biBibG9jay5cbiAqXG4gKiBUZXh0IG5vZGVzIGNhbiBoYXZlOlxuICogLSBDcmVhdGUgaW5zdHJ1Y3Rpb24gaW4gYGNyZWF0ZU9wQ29kZXNgIGZvciBjcmVhdGluZyB0aGUgdGV4dCBub2RlLlxuICogLSBBbGxvY2F0ZSBzcGVjIGZvciB0ZXh0IG5vZGUgaW4gaTE4biByYW5nZSBvZiBgTFZpZXdgXG4gKiAtIElmIGNvbnRhaW5zIGJpbmRpbmc6XG4gKiAgICAtIGJpbmRpbmdzID0+IGFsbG9jYXRlIHNwYWNlIGluIGkxOG4gcmFuZ2Ugb2YgYExWaWV3YCB0byBzdG9yZSB0aGUgYmluZGluZyB2YWx1ZS5cbiAqICAgIC0gcG9wdWxhdGUgYHVwZGF0ZU9wQ29kZXNgIHdpdGggdXBkYXRlIGluc3RydWN0aW9ucy5cbiAqXG4gKiBAcGFyYW0gdFZpZXcgQ3VycmVudCBgVFZpZXdgXG4gKiBAcGFyYW0gcm9vdFROb2RlIFJvb3QgYFROb2RlYCBvZiB0aGUgaTE4biBibG9jay4gVGhpcyBub2RlIGRldGVybWluZXMgaWYgdGhlIG5ldyBUTm9kZSB3aWxsXG4gKiAgICAgYmUgYWRkZWQgYXMgcGFydCBvZiB0aGUgYGkxOG5TdGFydGAgaW5zdHJ1Y3Rpb24gb3IgYXMgcGFydCBvZiB0aGVcbiAqICAgICBgVE5vZGUuaW5zZXJ0QmVmb3JlSW5kZXhgLlxuICogQHBhcmFtIGV4aXN0aW5nVE5vZGVzIGludGVybmFsIHN0YXRlIGZvciBgYWRkVE5vZGVBbmRVcGRhdGVJbnNlcnRCZWZvcmVJbmRleGAuXG4gKiBAcGFyYW0gY3JlYXRlT3BDb2RlcyBMb2NhdGlvbiB3aGVyZSB0aGUgY3JlYXRpb24gT3BDb2RlcyB3aWxsIGJlIHN0b3JlZC5cbiAqIEBwYXJhbSBsVmlldyBDdXJyZW50IGBMVmlld2BcbiAqIEBwYXJhbSB0ZXh0IFRoZSB0cmFuc2xhdGVkIHRleHQgKHdoaWNoIG1heSBjb250YWluIGJpbmRpbmcpXG4gKi9cbmZ1bmN0aW9uIGkxOG5TdGFydEZpcnN0Q3JlYXRlUGFzc1Byb2Nlc3NUZXh0Tm9kZShcbiAgICB0VmlldzogVFZpZXcsIHJvb3RUTm9kZTogVE5vZGV8bnVsbCwgZXhpc3RpbmdUTm9kZXM6IFROb2RlW10sIGNyZWF0ZU9wQ29kZXM6IEkxOG5DcmVhdGVPcENvZGVzLFxuICAgIHVwZGF0ZU9wQ29kZXM6IEkxOG5VcGRhdGVPcENvZGVzLCBsVmlldzogTFZpZXcsIHRleHQ6IHN0cmluZyk6IHZvaWQge1xuICBjb25zdCBoYXNCaW5kaW5nID0gdGV4dC5tYXRjaChCSU5ESU5HX1JFR0VYUCk7XG4gIGNvbnN0IHROb2RlID0gY3JlYXRlVE5vZGVBbmRBZGRPcENvZGUoXG4gICAgICB0Vmlldywgcm9vdFROb2RlLCBleGlzdGluZ1ROb2RlcywgbFZpZXcsIGNyZWF0ZU9wQ29kZXMsIGhhc0JpbmRpbmcgPyBudWxsIDogdGV4dCwgZmFsc2UpO1xuICBpZiAoaGFzQmluZGluZykge1xuICAgIGdlbmVyYXRlQmluZGluZ1VwZGF0ZU9wQ29kZXModXBkYXRlT3BDb2RlcywgdGV4dCwgdE5vZGUuaW5kZXgsIG51bGwsIDAsIG51bGwpO1xuICB9XG59XG5cbi8qKlxuICogU2VlIGBpMThuQXR0cmlidXRlc2AgYWJvdmUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpMThuQXR0cmlidXRlc0ZpcnN0UGFzcyh0VmlldzogVFZpZXcsIGluZGV4OiBudW1iZXIsIHZhbHVlczogc3RyaW5nW10pIHtcbiAgY29uc3QgcHJldmlvdXNFbGVtZW50ID0gZ2V0Q3VycmVudFROb2RlKCkhO1xuICBjb25zdCBwcmV2aW91c0VsZW1lbnRJbmRleCA9IHByZXZpb3VzRWxlbWVudC5pbmRleDtcbiAgY29uc3QgdXBkYXRlT3BDb2RlczogSTE4blVwZGF0ZU9wQ29kZXMgPSBbXSBhcyBhbnk7XG4gIGlmIChuZ0Rldk1vZGUpIHtcbiAgICBhdHRhY2hEZWJ1Z0dldHRlcih1cGRhdGVPcENvZGVzLCBpMThuVXBkYXRlT3BDb2Rlc1RvU3RyaW5nKTtcbiAgfVxuICBpZiAodFZpZXcuZmlyc3RDcmVhdGVQYXNzICYmIHRWaWV3LmRhdGFbaW5kZXhdID09PSBudWxsKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB2YWx1ZXMubGVuZ3RoOyBpICs9IDIpIHtcbiAgICAgIGNvbnN0IGF0dHJOYW1lID0gdmFsdWVzW2ldO1xuICAgICAgY29uc3QgbWVzc2FnZSA9IHZhbHVlc1tpICsgMV07XG5cbiAgICAgIGlmIChtZXNzYWdlICE9PSAnJykge1xuICAgICAgICAvLyBDaGVjayBpZiBhdHRyaWJ1dGUgdmFsdWUgY29udGFpbnMgYW4gSUNVIGFuZCB0aHJvdyBhbiBlcnJvciBpZiB0aGF0J3MgdGhlIGNhc2UuXG4gICAgICAgIC8vIElDVXMgaW4gZWxlbWVudCBhdHRyaWJ1dGVzIGFyZSBub3Qgc3VwcG9ydGVkLlxuICAgICAgICAvLyBOb3RlOiB3ZSBpbnRlbnRpb25hbGx5IHJldGFpbiB0aGUgZXJyb3IgaGVyZSBieSBub3QgdXNpbmcgYG5nRGV2TW9kZWAsIGJlY2F1c2VcbiAgICAgICAgLy8gdGhlIGB2YWx1ZWAgY2FuIGNoYW5nZSBiYXNlZCBvbiB0aGUgbG9jYWxlIGFuZCB1c2VycyBhcmVuJ3QgZ3VhcmFudGVlZCB0byBoaXRcbiAgICAgICAgLy8gYW4gaW52YWxpZCBzdHJpbmcgd2hpbGUgdGhleSdyZSBkZXZlbG9waW5nLlxuICAgICAgICBpZiAoSUNVX1JFR0VYUC50ZXN0KG1lc3NhZ2UpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICBgSUNVIGV4cHJlc3Npb25zIGFyZSBub3Qgc3VwcG9ydGVkIGluIGF0dHJpYnV0ZXMuIE1lc3NhZ2U6IFwiJHttZXNzYWdlfVwiLmApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaTE4biBhdHRyaWJ1dGVzIHRoYXQgaGl0IHRoaXMgY29kZSBwYXRoIGFyZSBndWFyYW50ZWVkIHRvIGhhdmUgYmluZGluZ3MsIGJlY2F1c2VcbiAgICAgICAgLy8gdGhlIGNvbXBpbGVyIHRyZWF0cyBzdGF0aWMgaTE4biBhdHRyaWJ1dGVzIGFzIHJlZ3VsYXIgYXR0cmlidXRlIGJpbmRpbmdzLlxuICAgICAgICAvLyBTaW5jZSB0aGlzIG1heSBub3QgYmUgdGhlIGZpcnN0IGkxOG4gYXR0cmlidXRlIG9uIHRoaXMgZWxlbWVudCB3ZSBuZWVkIHRvIHBhc3MgaW4gaG93XG4gICAgICAgIC8vIG1hbnkgcHJldmlvdXMgYmluZGluZ3MgdGhlcmUgaGF2ZSBhbHJlYWR5IGJlZW4uXG4gICAgICAgIGdlbmVyYXRlQmluZGluZ1VwZGF0ZU9wQ29kZXMoXG4gICAgICAgICAgICB1cGRhdGVPcENvZGVzLCBtZXNzYWdlLCBwcmV2aW91c0VsZW1lbnRJbmRleCwgYXR0ck5hbWUsIGNvdW50QmluZGluZ3ModXBkYXRlT3BDb2RlcyksXG4gICAgICAgICAgICBudWxsKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdFZpZXcuZGF0YVtpbmRleF0gPSB1cGRhdGVPcENvZGVzO1xuICB9XG59XG5cblxuLyoqXG4gKiBHZW5lcmF0ZSB0aGUgT3BDb2RlcyB0byB1cGRhdGUgdGhlIGJpbmRpbmdzIG9mIGEgc3RyaW5nLlxuICpcbiAqIEBwYXJhbSB1cGRhdGVPcENvZGVzIFBsYWNlIHdoZXJlIHRoZSB1cGRhdGUgb3Bjb2RlcyB3aWxsIGJlIHN0b3JlZC5cbiAqIEBwYXJhbSBzdHIgVGhlIHN0cmluZyBjb250YWluaW5nIHRoZSBiaW5kaW5ncy5cbiAqIEBwYXJhbSBkZXN0aW5hdGlvbk5vZGUgSW5kZXggb2YgdGhlIGRlc3RpbmF0aW9uIG5vZGUgd2hpY2ggd2lsbCByZWNlaXZlIHRoZSBiaW5kaW5nLlxuICogQHBhcmFtIGF0dHJOYW1lIE5hbWUgb2YgdGhlIGF0dHJpYnV0ZSwgaWYgdGhlIHN0cmluZyBiZWxvbmdzIHRvIGFuIGF0dHJpYnV0ZS5cbiAqIEBwYXJhbSBzYW5pdGl6ZUZuIFNhbml0aXphdGlvbiBmdW5jdGlvbiB1c2VkIHRvIHNhbml0aXplIHRoZSBzdHJpbmcgYWZ0ZXIgdXBkYXRlLCBpZiBuZWNlc3NhcnkuXG4gKiBAcGFyYW0gYmluZGluZ1N0YXJ0IFRoZSBsVmlldyBpbmRleCBvZiB0aGUgbmV4dCBleHByZXNzaW9uIHRoYXQgY2FuIGJlIGJvdW5kIHZpYSBhbiBvcENvZGUuXG4gKiBAcmV0dXJucyBUaGUgbWFzayB2YWx1ZSBmb3IgdGhlc2UgYmluZGluZ3NcbiAqL1xuZnVuY3Rpb24gZ2VuZXJhdGVCaW5kaW5nVXBkYXRlT3BDb2RlcyhcbiAgICB1cGRhdGVPcENvZGVzOiBJMThuVXBkYXRlT3BDb2Rlcywgc3RyOiBzdHJpbmcsIGRlc3RpbmF0aW9uTm9kZTogbnVtYmVyLCBhdHRyTmFtZTogc3RyaW5nfG51bGwsXG4gICAgYmluZGluZ1N0YXJ0OiBudW1iZXIsIHNhbml0aXplRm46IFNhbml0aXplckZufG51bGwpOiBudW1iZXIge1xuICBuZ0Rldk1vZGUgJiZcbiAgICAgIGFzc2VydEdyZWF0ZXJUaGFuT3JFcXVhbChcbiAgICAgICAgICBkZXN0aW5hdGlvbk5vZGUsIEhFQURFUl9PRkZTRVQsICdJbmRleCBtdXN0IGJlIGluIGFic29sdXRlIExWaWV3IG9mZnNldCcpO1xuICBjb25zdCBtYXNrSW5kZXggPSB1cGRhdGVPcENvZGVzLmxlbmd0aDsgIC8vIExvY2F0aW9uIG9mIG1hc2tcbiAgY29uc3Qgc2l6ZUluZGV4ID0gbWFza0luZGV4ICsgMTsgICAgICAgICAvLyBsb2NhdGlvbiBvZiBzaXplIGZvciBza2lwcGluZ1xuICB1cGRhdGVPcENvZGVzLnB1c2gobnVsbCwgbnVsbCk7ICAgICAgICAgIC8vIEFsbG9jIHNwYWNlIGZvciBtYXNrIGFuZCBzaXplXG4gIGNvbnN0IHN0YXJ0SW5kZXggPSBtYXNrSW5kZXggKyAyOyAgICAgICAgLy8gbG9jYXRpb24gb2YgZmlyc3QgYWxsb2NhdGlvbi5cbiAgaWYgKG5nRGV2TW9kZSkge1xuICAgIGF0dGFjaERlYnVnR2V0dGVyKHVwZGF0ZU9wQ29kZXMsIGkxOG5VcGRhdGVPcENvZGVzVG9TdHJpbmcpO1xuICB9XG4gIGNvbnN0IHRleHRQYXJ0cyA9IHN0ci5zcGxpdChCSU5ESU5HX1JFR0VYUCk7XG4gIGxldCBtYXNrID0gMDtcblxuICBmb3IgKGxldCBqID0gMDsgaiA8IHRleHRQYXJ0cy5sZW5ndGg7IGorKykge1xuICAgIGNvbnN0IHRleHRWYWx1ZSA9IHRleHRQYXJ0c1tqXTtcblxuICAgIGlmIChqICYgMSkge1xuICAgICAgLy8gT2RkIGluZGV4ZXMgYXJlIGJpbmRpbmdzXG4gICAgICBjb25zdCBiaW5kaW5nSW5kZXggPSBiaW5kaW5nU3RhcnQgKyBwYXJzZUludCh0ZXh0VmFsdWUsIDEwKTtcbiAgICAgIHVwZGF0ZU9wQ29kZXMucHVzaCgtMSAtIGJpbmRpbmdJbmRleCk7XG4gICAgICBtYXNrID0gbWFzayB8IHRvTWFza0JpdChiaW5kaW5nSW5kZXgpO1xuICAgIH0gZWxzZSBpZiAodGV4dFZhbHVlICE9PSAnJykge1xuICAgICAgLy8gRXZlbiBpbmRleGVzIGFyZSB0ZXh0XG4gICAgICB1cGRhdGVPcENvZGVzLnB1c2godGV4dFZhbHVlKTtcbiAgICB9XG4gIH1cblxuICB1cGRhdGVPcENvZGVzLnB1c2goXG4gICAgICBkZXN0aW5hdGlvbk5vZGUgPDwgSTE4blVwZGF0ZU9wQ29kZS5TSElGVF9SRUYgfFxuICAgICAgKGF0dHJOYW1lID8gSTE4blVwZGF0ZU9wQ29kZS5BdHRyIDogSTE4blVwZGF0ZU9wQ29kZS5UZXh0KSk7XG4gIGlmIChhdHRyTmFtZSkge1xuICAgIHVwZGF0ZU9wQ29kZXMucHVzaChhdHRyTmFtZSwgc2FuaXRpemVGbik7XG4gIH1cbiAgdXBkYXRlT3BDb2Rlc1ttYXNrSW5kZXhdID0gbWFzaztcbiAgdXBkYXRlT3BDb2Rlc1tzaXplSW5kZXhdID0gdXBkYXRlT3BDb2Rlcy5sZW5ndGggLSBzdGFydEluZGV4O1xuICByZXR1cm4gbWFzaztcbn1cblxuLyoqXG4gKiBDb3VudCB0aGUgbnVtYmVyIG9mIGJpbmRpbmdzIGluIHRoZSBnaXZlbiBgb3BDb2Rlc2AuXG4gKlxuICogSXQgY291bGQgYmUgcG9zc2libGUgdG8gc3BlZWQgdGhpcyB1cCwgYnkgcGFzc2luZyB0aGUgbnVtYmVyIG9mIGJpbmRpbmdzIGZvdW5kIGJhY2sgZnJvbVxuICogYGdlbmVyYXRlQmluZGluZ1VwZGF0ZU9wQ29kZXMoKWAgdG8gYGkxOG5BdHRyaWJ1dGVzRmlyc3RQYXNzKClgIGJ1dCB0aGlzIHdvdWxkIHRoZW4gcmVxdWlyZSBtb3JlXG4gKiBjb21wbGV4aXR5IGluIHRoZSBjb2RlIGFuZC9vciB0cmFuc2llbnQgb2JqZWN0cyB0byBiZSBjcmVhdGVkLlxuICpcbiAqIFNpbmNlIHRoaXMgZnVuY3Rpb24gaXMgb25seSBjYWxsZWQgb25jZSB3aGVuIHRoZSB0ZW1wbGF0ZSBpcyBpbnN0YW50aWF0ZWQsIGlzIHRyaXZpYWwgaW4gdGhlXG4gKiBmaXJzdCBpbnN0YW5jZSAoc2luY2UgYG9wQ29kZXNgIHdpbGwgYmUgYW4gZW1wdHkgYXJyYXkpLCBhbmQgaXQgaXMgbm90IGNvbW1vbiBmb3IgZWxlbWVudHMgdG9cbiAqIGNvbnRhaW4gbXVsdGlwbGUgaTE4biBib3VuZCBhdHRyaWJ1dGVzLCBpdCBzZWVtcyBsaWtlIHRoaXMgaXMgYSByZWFzb25hYmxlIGNvbXByb21pc2UuXG4gKi9cbmZ1bmN0aW9uIGNvdW50QmluZGluZ3Mob3BDb2RlczogSTE4blVwZGF0ZU9wQ29kZXMpOiBudW1iZXIge1xuICBsZXQgY291bnQgPSAwO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IG9wQ29kZXMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBvcENvZGUgPSBvcENvZGVzW2ldO1xuICAgIC8vIEJpbmRpbmdzIGFyZSBuZWdhdGl2ZSBudW1iZXJzLlxuICAgIGlmICh0eXBlb2Ygb3BDb2RlID09PSAnbnVtYmVyJyAmJiBvcENvZGUgPCAwKSB7XG4gICAgICBjb3VudCsrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gY291bnQ7XG59XG5cbi8qKlxuICogQ29udmVydCBiaW5kaW5nIGluZGV4IHRvIG1hc2sgYml0LlxuICpcbiAqIEVhY2ggaW5kZXggcmVwcmVzZW50cyBhIHNpbmdsZSBiaXQgb24gdGhlIGJpdC1tYXNrLiBCZWNhdXNlIGJpdC1tYXNrIG9ubHkgaGFzIDMyIGJpdHMsIHdlIG1ha2VcbiAqIHRoZSAzMm5kIGJpdCBzaGFyZSBhbGwgbWFza3MgZm9yIGFsbCBiaW5kaW5ncyBoaWdoZXIgdGhhbiAzMi4gU2luY2UgaXQgaXMgZXh0cmVtZWx5IHJhcmUgdG9cbiAqIGhhdmUgbW9yZSB0aGFuIDMyIGJpbmRpbmdzIHRoaXMgd2lsbCBiZSBoaXQgdmVyeSByYXJlbHkuIFRoZSBkb3duc2lkZSBvZiBoaXR0aW5nIHRoaXMgY29ybmVyXG4gKiBjYXNlIGlzIHRoYXQgd2Ugd2lsbCBleGVjdXRlIGJpbmRpbmcgY29kZSBtb3JlIG9mdGVuIHRoYW4gbmVjZXNzYXJ5LiAocGVuYWx0eSBvZiBwZXJmb3JtYW5jZSlcbiAqL1xuZnVuY3Rpb24gdG9NYXNrQml0KGJpbmRpbmdJbmRleDogbnVtYmVyKTogbnVtYmVyIHtcbiAgcmV0dXJuIDEgPDwgTWF0aC5taW4oYmluZGluZ0luZGV4LCAzMSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1Jvb3RUZW1wbGF0ZU1lc3NhZ2Uoc3ViVGVtcGxhdGVJbmRleDogbnVtYmVyKTogc3ViVGVtcGxhdGVJbmRleCBpcyAtIDEge1xuICByZXR1cm4gc3ViVGVtcGxhdGVJbmRleCA9PT0gLTE7XG59XG5cblxuLyoqXG4gKiBSZW1vdmVzIGV2ZXJ5dGhpbmcgaW5zaWRlIHRoZSBzdWItdGVtcGxhdGVzIG9mIGEgbWVzc2FnZS5cbiAqL1xuZnVuY3Rpb24gcmVtb3ZlSW5uZXJUZW1wbGF0ZVRyYW5zbGF0aW9uKG1lc3NhZ2U6IHN0cmluZyk6IHN0cmluZyB7XG4gIGxldCBtYXRjaDtcbiAgbGV0IHJlcyA9ICcnO1xuICBsZXQgaW5kZXggPSAwO1xuICBsZXQgaW5UZW1wbGF0ZSA9IGZhbHNlO1xuICBsZXQgdGFnTWF0Y2hlZDtcblxuICB3aGlsZSAoKG1hdGNoID0gU1VCVEVNUExBVEVfUkVHRVhQLmV4ZWMobWVzc2FnZSkpICE9PSBudWxsKSB7XG4gICAgaWYgKCFpblRlbXBsYXRlKSB7XG4gICAgICByZXMgKz0gbWVzc2FnZS5zdWJzdHJpbmcoaW5kZXgsIG1hdGNoLmluZGV4ICsgbWF0Y2hbMF0ubGVuZ3RoKTtcbiAgICAgIHRhZ01hdGNoZWQgPSBtYXRjaFsxXTtcbiAgICAgIGluVGVtcGxhdGUgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAobWF0Y2hbMF0gPT09IGAke01BUktFUn0vKiR7dGFnTWF0Y2hlZH0ke01BUktFUn1gKSB7XG4gICAgICAgIGluZGV4ID0gbWF0Y2guaW5kZXg7XG4gICAgICAgIGluVGVtcGxhdGUgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBuZ0Rldk1vZGUgJiZcbiAgICAgIGFzc2VydEVxdWFsKFxuICAgICAgICAgIGluVGVtcGxhdGUsIGZhbHNlLFxuICAgICAgICAgIGBUYWcgbWlzbWF0Y2g6IHVuYWJsZSB0byBmaW5kIHRoZSBlbmQgb2YgdGhlIHN1Yi10ZW1wbGF0ZSBpbiB0aGUgdHJhbnNsYXRpb24gXCIke1xuICAgICAgICAgICAgICBtZXNzYWdlfVwiYCk7XG5cbiAgcmVzICs9IG1lc3NhZ2Uuc2xpY2UoaW5kZXgpO1xuICByZXR1cm4gcmVzO1xufVxuXG5cbi8qKlxuICogRXh0cmFjdHMgYSBwYXJ0IG9mIGEgbWVzc2FnZSBhbmQgcmVtb3ZlcyB0aGUgcmVzdC5cbiAqXG4gKiBUaGlzIG1ldGhvZCBpcyB1c2VkIGZvciBleHRyYWN0aW5nIGEgcGFydCBvZiB0aGUgbWVzc2FnZSBhc3NvY2lhdGVkIHdpdGggYSB0ZW1wbGF0ZS4gQVxuICogdHJhbnNsYXRlZCBtZXNzYWdlIGNhbiBzcGFuIG11bHRpcGxlIHRlbXBsYXRlcy5cbiAqXG4gKiBFeGFtcGxlOlxuICogYGBgXG4gKiA8ZGl2IGkxOG4+VHJhbnNsYXRlIDxzcGFuICpuZ0lmPm1lPC9zcGFuPiE8L2Rpdj5cbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBtZXNzYWdlIFRoZSBtZXNzYWdlIHRvIGNyb3BcbiAqIEBwYXJhbSBzdWJUZW1wbGF0ZUluZGV4IEluZGV4IG9mIHRoZSBzdWItdGVtcGxhdGUgdG8gZXh0cmFjdC4gSWYgdW5kZWZpbmVkIGl0IHJldHVybnMgdGhlXG4gKiBleHRlcm5hbCB0ZW1wbGF0ZSBhbmQgcmVtb3ZlcyBhbGwgc3ViLXRlbXBsYXRlcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFRyYW5zbGF0aW9uRm9yVGVtcGxhdGUobWVzc2FnZTogc3RyaW5nLCBzdWJUZW1wbGF0ZUluZGV4OiBudW1iZXIpIHtcbiAgaWYgKGlzUm9vdFRlbXBsYXRlTWVzc2FnZShzdWJUZW1wbGF0ZUluZGV4KSkge1xuICAgIC8vIFdlIHdhbnQgdGhlIHJvb3QgdGVtcGxhdGUgbWVzc2FnZSwgaWdub3JlIGFsbCBzdWItdGVtcGxhdGVzXG4gICAgcmV0dXJuIHJlbW92ZUlubmVyVGVtcGxhdGVUcmFuc2xhdGlvbihtZXNzYWdlKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBXZSB3YW50IGEgc3BlY2lmaWMgc3ViLXRlbXBsYXRlXG4gICAgY29uc3Qgc3RhcnQgPVxuICAgICAgICBtZXNzYWdlLmluZGV4T2YoYDoke3N1YlRlbXBsYXRlSW5kZXh9JHtNQVJLRVJ9YCkgKyAyICsgc3ViVGVtcGxhdGVJbmRleC50b1N0cmluZygpLmxlbmd0aDtcbiAgICBjb25zdCBlbmQgPSBtZXNzYWdlLnNlYXJjaChuZXcgUmVnRXhwKGAke01BUktFUn1cXFxcL1xcXFwqXFxcXGQrOiR7c3ViVGVtcGxhdGVJbmRleH0ke01BUktFUn1gKSk7XG4gICAgcmV0dXJuIHJlbW92ZUlubmVyVGVtcGxhdGVUcmFuc2xhdGlvbihtZXNzYWdlLnN1YnN0cmluZyhzdGFydCwgZW5kKSk7XG4gIH1cbn1cblxuLyoqXG4gKiBHZW5lcmF0ZSB0aGUgT3BDb2RlcyBmb3IgSUNVIGV4cHJlc3Npb25zLlxuICpcbiAqIEBwYXJhbSBpY3VFeHByZXNzaW9uXG4gKiBAcGFyYW0gaW5kZXggSW5kZXggd2hlcmUgdGhlIGFuY2hvciBpcyBzdG9yZWQgYW5kIGFuIG9wdGlvbmFsIGBUSWN1Q29udGFpbmVyTm9kZWBcbiAqICAgLSBgbFZpZXdbYW5jaG9ySWR4XWAgcG9pbnRzIHRvIGEgYENvbW1lbnRgIG5vZGUgcmVwcmVzZW50aW5nIHRoZSBhbmNob3IgZm9yIHRoZSBJQ1UuXG4gKiAgIC0gYHRWaWV3LmRhdGFbYW5jaG9ySWR4XWAgcG9pbnRzIHRvIHRoZSBgVEljdUNvbnRhaW5lck5vZGVgIGlmIElDVSBpcyByb290IChgbnVsbGAgb3RoZXJ3aXNlKVxuICovXG5leHBvcnQgZnVuY3Rpb24gaWN1U3RhcnQoXG4gICAgdFZpZXc6IFRWaWV3LCBsVmlldzogTFZpZXcsIHVwZGF0ZU9wQ29kZXM6IEkxOG5VcGRhdGVPcENvZGVzLCBwYXJlbnRJZHg6IG51bWJlcixcbiAgICBpY3VFeHByZXNzaW9uOiBJY3VFeHByZXNzaW9uLCBhbmNob3JJZHg6IG51bWJlcikge1xuICBuZ0Rldk1vZGUgJiYgYXNzZXJ0RGVmaW5lZChpY3VFeHByZXNzaW9uLCAnSUNVIGV4cHJlc3Npb24gbXVzdCBiZSBkZWZpbmVkJyk7XG4gIGxldCBiaW5kaW5nTWFzayA9IDA7XG4gIGNvbnN0IHRJY3U6IFRJY3UgPSB7XG4gICAgdHlwZTogaWN1RXhwcmVzc2lvbi50eXBlLFxuICAgIGN1cnJlbnRDYXNlTFZpZXdJbmRleDogYWxsb2NFeHBhbmRvKHRWaWV3LCBsVmlldywgMSwgbnVsbCksXG4gICAgYW5jaG9ySWR4LFxuICAgIGNhc2VzOiBbXSxcbiAgICBjcmVhdGU6IFtdLFxuICAgIHJlbW92ZTogW10sXG4gICAgdXBkYXRlOiBbXVxuICB9O1xuICBhZGRVcGRhdGVJY3VTd2l0Y2godXBkYXRlT3BDb2RlcywgaWN1RXhwcmVzc2lvbiwgYW5jaG9ySWR4KTtcbiAgc2V0VEljdSh0VmlldywgYW5jaG9ySWR4LCB0SWN1KTtcbiAgY29uc3QgdmFsdWVzID0gaWN1RXhwcmVzc2lvbi52YWx1ZXM7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgdmFsdWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgLy8gRWFjaCB2YWx1ZSBpcyBhbiBhcnJheSBvZiBzdHJpbmdzICYgb3RoZXIgSUNVIGV4cHJlc3Npb25zXG4gICAgY29uc3QgdmFsdWVBcnIgPSB2YWx1ZXNbaV07XG4gICAgY29uc3QgbmVzdGVkSWN1czogSWN1RXhwcmVzc2lvbltdID0gW107XG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCB2YWx1ZUFyci5sZW5ndGg7IGorKykge1xuICAgICAgY29uc3QgdmFsdWUgPSB2YWx1ZUFycltqXTtcbiAgICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIC8vIEl0IGlzIGFuIG5lc3RlZCBJQ1UgZXhwcmVzc2lvblxuICAgICAgICBjb25zdCBpY3VJbmRleCA9IG5lc3RlZEljdXMucHVzaCh2YWx1ZSBhcyBJY3VFeHByZXNzaW9uKSAtIDE7XG4gICAgICAgIC8vIFJlcGxhY2UgbmVzdGVkIElDVSBleHByZXNzaW9uIGJ5IGEgY29tbWVudCBub2RlXG4gICAgICAgIHZhbHVlQXJyW2pdID0gYDwhLS3vv70ke2ljdUluZGV4fe+/vS0tPmA7XG4gICAgICB9XG4gICAgfVxuICAgIGJpbmRpbmdNYXNrID0gcGFyc2VJY3VDYXNlKFxuICAgICAgICAgICAgICAgICAgICAgIHRWaWV3LCB0SWN1LCBsVmlldywgdXBkYXRlT3BDb2RlcywgcGFyZW50SWR4LCBpY3VFeHByZXNzaW9uLmNhc2VzW2ldLFxuICAgICAgICAgICAgICAgICAgICAgIHZhbHVlQXJyLmpvaW4oJycpLCBuZXN0ZWRJY3VzKSB8XG4gICAgICAgIGJpbmRpbmdNYXNrO1xuICB9XG4gIGlmIChiaW5kaW5nTWFzaykge1xuICAgIGFkZFVwZGF0ZUljdVVwZGF0ZSh1cGRhdGVPcENvZGVzLCBiaW5kaW5nTWFzaywgYW5jaG9ySWR4KTtcbiAgfVxufVxuXG4vKipcbiAqIFBhcnNlcyB0ZXh0IGNvbnRhaW5pbmcgYW4gSUNVIGV4cHJlc3Npb24gYW5kIHByb2R1Y2VzIGEgSlNPTiBvYmplY3QgZm9yIGl0LlxuICogT3JpZ2luYWwgY29kZSBmcm9tIGNsb3N1cmUgbGlicmFyeSwgbW9kaWZpZWQgZm9yIEFuZ3VsYXIuXG4gKlxuICogQHBhcmFtIHBhdHRlcm4gVGV4dCBjb250YWluaW5nIGFuIElDVSBleHByZXNzaW9uIHRoYXQgbmVlZHMgdG8gYmUgcGFyc2VkLlxuICpcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlSUNVQmxvY2socGF0dGVybjogc3RyaW5nKTogSWN1RXhwcmVzc2lvbiB7XG4gIGNvbnN0IGNhc2VzID0gW107XG4gIGNvbnN0IHZhbHVlczogKHN0cmluZ3xJY3VFeHByZXNzaW9uKVtdW10gPSBbXTtcbiAgbGV0IGljdVR5cGUgPSBJY3VUeXBlLnBsdXJhbDtcbiAgbGV0IG1haW5CaW5kaW5nID0gMDtcbiAgcGF0dGVybiA9IHBhdHRlcm4ucmVwbGFjZShJQ1VfQkxPQ0tfUkVHRVhQLCBmdW5jdGlvbihzdHI6IHN0cmluZywgYmluZGluZzogc3RyaW5nLCB0eXBlOiBzdHJpbmcpIHtcbiAgICBpZiAodHlwZSA9PT0gJ3NlbGVjdCcpIHtcbiAgICAgIGljdVR5cGUgPSBJY3VUeXBlLnNlbGVjdDtcbiAgICB9IGVsc2Uge1xuICAgICAgaWN1VHlwZSA9IEljdVR5cGUucGx1cmFsO1xuICAgIH1cbiAgICBtYWluQmluZGluZyA9IHBhcnNlSW50KGJpbmRpbmcuc2xpY2UoMSksIDEwKTtcbiAgICByZXR1cm4gJyc7XG4gIH0pO1xuXG4gIGNvbnN0IHBhcnRzID0gaTE4blBhcnNlVGV4dEludG9QYXJ0c0FuZElDVShwYXR0ZXJuKSBhcyBzdHJpbmdbXTtcbiAgLy8gTG9va2luZyBmb3IgKGtleSBibG9jaykrIHNlcXVlbmNlLiBPbmUgb2YgdGhlIGtleXMgaGFzIHRvIGJlIFwib3RoZXJcIi5cbiAgZm9yIChsZXQgcG9zID0gMDsgcG9zIDwgcGFydHMubGVuZ3RoOykge1xuICAgIGxldCBrZXkgPSBwYXJ0c1twb3MrK10udHJpbSgpO1xuICAgIGlmIChpY3VUeXBlID09PSBJY3VUeXBlLnBsdXJhbCkge1xuICAgICAgLy8gS2V5IGNhbiBiZSBcIj14XCIsIHdlIGp1c3Qgd2FudCBcInhcIlxuICAgICAga2V5ID0ga2V5LnJlcGxhY2UoL1xccyooPzo9KT8oXFx3KylcXHMqLywgJyQxJyk7XG4gICAgfVxuICAgIGlmIChrZXkubGVuZ3RoKSB7XG4gICAgICBjYXNlcy5wdXNoKGtleSk7XG4gICAgfVxuXG4gICAgY29uc3QgYmxvY2tzID0gaTE4blBhcnNlVGV4dEludG9QYXJ0c0FuZElDVShwYXJ0c1twb3MrK10pIGFzIHN0cmluZ1tdO1xuICAgIGlmIChjYXNlcy5sZW5ndGggPiB2YWx1ZXMubGVuZ3RoKSB7XG4gICAgICB2YWx1ZXMucHVzaChibG9ja3MpO1xuICAgIH1cbiAgfVxuXG4gIC8vIFRPRE8ob2NvbWJlKTogc3VwcG9ydCBJQ1UgZXhwcmVzc2lvbnMgaW4gYXR0cmlidXRlcywgc2VlICMyMTYxNVxuICByZXR1cm4ge3R5cGU6IGljdVR5cGUsIG1haW5CaW5kaW5nOiBtYWluQmluZGluZywgY2FzZXMsIHZhbHVlc307XG59XG5cblxuLyoqXG4gKiBCcmVha3MgcGF0dGVybiBpbnRvIHN0cmluZ3MgYW5kIHRvcCBsZXZlbCB7Li4ufSBibG9ja3MuXG4gKiBDYW4gYmUgdXNlZCB0byBicmVhayBhIG1lc3NhZ2UgaW50byB0ZXh0IGFuZCBJQ1UgZXhwcmVzc2lvbnMsIG9yIHRvIGJyZWFrIGFuIElDVSBleHByZXNzaW9uXG4gKiBpbnRvIGtleXMgYW5kIGNhc2VzLiBPcmlnaW5hbCBjb2RlIGZyb20gY2xvc3VyZSBsaWJyYXJ5LCBtb2RpZmllZCBmb3IgQW5ndWxhci5cbiAqXG4gKiBAcGFyYW0gcGF0dGVybiAoc3ViKVBhdHRlcm4gdG8gYmUgYnJva2VuLlxuICogQHJldHVybnMgQW4gYEFycmF5PHN0cmluZ3xJY3VFeHByZXNzaW9uPmAgd2hlcmU6XG4gKiAgIC0gb2RkIHBvc2l0aW9uczogYHN0cmluZ2AgPT4gdGV4dCBiZXR3ZWVuIElDVSBleHByZXNzaW9uc1xuICogICAtIGV2ZW4gcG9zaXRpb25zOiBgSUNVRXhwcmVzc2lvbmAgPT4gSUNVIGV4cHJlc3Npb24gcGFyc2VkIGludG8gYElDVUV4cHJlc3Npb25gIHJlY29yZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGkxOG5QYXJzZVRleHRJbnRvUGFydHNBbmRJQ1UocGF0dGVybjogc3RyaW5nKTogKHN0cmluZ3xJY3VFeHByZXNzaW9uKVtdIHtcbiAgaWYgKCFwYXR0ZXJuKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgbGV0IHByZXZQb3MgPSAwO1xuICBjb25zdCBicmFjZVN0YWNrID0gW107XG4gIGNvbnN0IHJlc3VsdHM6IChzdHJpbmd8SWN1RXhwcmVzc2lvbilbXSA9IFtdO1xuICBjb25zdCBicmFjZXMgPSAvW3t9XS9nO1xuICAvLyBsYXN0SW5kZXggZG9lc24ndCBnZXQgc2V0IHRvIDAgc28gd2UgaGF2ZSB0by5cbiAgYnJhY2VzLmxhc3RJbmRleCA9IDA7XG5cbiAgbGV0IG1hdGNoO1xuICB3aGlsZSAobWF0Y2ggPSBicmFjZXMuZXhlYyhwYXR0ZXJuKSkge1xuICAgIGNvbnN0IHBvcyA9IG1hdGNoLmluZGV4O1xuICAgIGlmIChtYXRjaFswXSA9PSAnfScpIHtcbiAgICAgIGJyYWNlU3RhY2sucG9wKCk7XG5cbiAgICAgIGlmIChicmFjZVN0YWNrLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgIC8vIEVuZCBvZiB0aGUgYmxvY2suXG4gICAgICAgIGNvbnN0IGJsb2NrID0gcGF0dGVybi5zdWJzdHJpbmcocHJldlBvcywgcG9zKTtcbiAgICAgICAgaWYgKElDVV9CTE9DS19SRUdFWFAudGVzdChibG9jaykpIHtcbiAgICAgICAgICByZXN1bHRzLnB1c2gocGFyc2VJQ1VCbG9jayhibG9jaykpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc3VsdHMucHVzaChibG9jayk7XG4gICAgICAgIH1cblxuICAgICAgICBwcmV2UG9zID0gcG9zICsgMTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGJyYWNlU3RhY2subGVuZ3RoID09IDApIHtcbiAgICAgICAgY29uc3Qgc3Vic3RyaW5nID0gcGF0dGVybi5zdWJzdHJpbmcocHJldlBvcywgcG9zKTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKHN1YnN0cmluZyk7XG4gICAgICAgIHByZXZQb3MgPSBwb3MgKyAxO1xuICAgICAgfVxuICAgICAgYnJhY2VTdGFjay5wdXNoKCd7Jyk7XG4gICAgfVxuICB9XG5cbiAgY29uc3Qgc3Vic3RyaW5nID0gcGF0dGVybi5zdWJzdHJpbmcocHJldlBvcyk7XG4gIHJlc3VsdHMucHVzaChzdWJzdHJpbmcpO1xuICByZXR1cm4gcmVzdWx0cztcbn1cblxuXG4vKipcbiAqIFBhcnNlcyBhIG5vZGUsIGl0cyBjaGlsZHJlbiBhbmQgaXRzIHNpYmxpbmdzLCBhbmQgZ2VuZXJhdGVzIHRoZSBtdXRhdGUgJiB1cGRhdGUgT3BDb2Rlcy5cbiAqXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUljdUNhc2UoXG4gICAgdFZpZXc6IFRWaWV3LCB0SWN1OiBUSWN1LCBsVmlldzogTFZpZXcsIHVwZGF0ZU9wQ29kZXM6IEkxOG5VcGRhdGVPcENvZGVzLCBwYXJlbnRJZHg6IG51bWJlcixcbiAgICBjYXNlTmFtZTogc3RyaW5nLCB1bnNhZmVDYXNlSHRtbDogc3RyaW5nLCBuZXN0ZWRJY3VzOiBJY3VFeHByZXNzaW9uW10pOiBudW1iZXIge1xuICBjb25zdCBjcmVhdGU6IEljdUNyZWF0ZU9wQ29kZXMgPSBbXSBhcyBhbnk7XG4gIGNvbnN0IHJlbW92ZTogSTE4blJlbW92ZU9wQ29kZXMgPSBbXSBhcyBhbnk7XG4gIGNvbnN0IHVwZGF0ZTogSTE4blVwZGF0ZU9wQ29kZXMgPSBbXSBhcyBhbnk7XG4gIGlmIChuZ0Rldk1vZGUpIHtcbiAgICBhdHRhY2hEZWJ1Z0dldHRlcihjcmVhdGUsIGljdUNyZWF0ZU9wQ29kZXNUb1N0cmluZyk7XG4gICAgYXR0YWNoRGVidWdHZXR0ZXIocmVtb3ZlLCBpMThuUmVtb3ZlT3BDb2Rlc1RvU3RyaW5nKTtcbiAgICBhdHRhY2hEZWJ1Z0dldHRlcih1cGRhdGUsIGkxOG5VcGRhdGVPcENvZGVzVG9TdHJpbmcpO1xuICB9XG4gIHRJY3UuY2FzZXMucHVzaChjYXNlTmFtZSk7XG4gIHRJY3UuY3JlYXRlLnB1c2goY3JlYXRlKTtcbiAgdEljdS5yZW1vdmUucHVzaChyZW1vdmUpO1xuICB0SWN1LnVwZGF0ZS5wdXNoKHVwZGF0ZSk7XG5cbiAgY29uc3QgaW5lcnRCb2R5SGVscGVyID0gZ2V0SW5lcnRCb2R5SGVscGVyKGdldERvY3VtZW50KCkpO1xuICBjb25zdCBpbmVydEJvZHlFbGVtZW50ID0gaW5lcnRCb2R5SGVscGVyLmdldEluZXJ0Qm9keUVsZW1lbnQodW5zYWZlQ2FzZUh0bWwpO1xuICBuZ0Rldk1vZGUgJiYgYXNzZXJ0RGVmaW5lZChpbmVydEJvZHlFbGVtZW50LCAnVW5hYmxlIHRvIGdlbmVyYXRlIGluZXJ0IGJvZHkgZWxlbWVudCcpO1xuICBjb25zdCBpbmVydFJvb3ROb2RlID0gZ2V0VGVtcGxhdGVDb250ZW50KGluZXJ0Qm9keUVsZW1lbnQhKSBhcyBFbGVtZW50IHx8IGluZXJ0Qm9keUVsZW1lbnQ7XG4gIGlmIChpbmVydFJvb3ROb2RlKSB7XG4gICAgcmV0dXJuIHdhbGtJY3VUcmVlKFxuICAgICAgICB0VmlldywgdEljdSwgbFZpZXcsIHVwZGF0ZU9wQ29kZXMsIGNyZWF0ZSwgcmVtb3ZlLCB1cGRhdGUsIGluZXJ0Um9vdE5vZGUsIHBhcmVudElkeCxcbiAgICAgICAgbmVzdGVkSWN1cywgMCk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIDA7XG4gIH1cbn1cblxuZnVuY3Rpb24gd2Fsa0ljdVRyZWUoXG4gICAgdFZpZXc6IFRWaWV3LCB0SWN1OiBUSWN1LCBsVmlldzogTFZpZXcsIHNoYXJlZFVwZGF0ZU9wQ29kZXM6IEkxOG5VcGRhdGVPcENvZGVzLFxuICAgIGNyZWF0ZTogSWN1Q3JlYXRlT3BDb2RlcywgcmVtb3ZlOiBJMThuUmVtb3ZlT3BDb2RlcywgdXBkYXRlOiBJMThuVXBkYXRlT3BDb2RlcyxcbiAgICBwYXJlbnROb2RlOiBFbGVtZW50LCBwYXJlbnRJZHg6IG51bWJlciwgbmVzdGVkSWN1czogSWN1RXhwcmVzc2lvbltdLCBkZXB0aDogbnVtYmVyKTogbnVtYmVyIHtcbiAgbGV0IGJpbmRpbmdNYXNrID0gMDtcbiAgbGV0IGN1cnJlbnROb2RlID0gcGFyZW50Tm9kZS5maXJzdENoaWxkO1xuICB3aGlsZSAoY3VycmVudE5vZGUpIHtcbiAgICBjb25zdCBuZXdJbmRleCA9IGFsbG9jRXhwYW5kbyh0VmlldywgbFZpZXcsIDEsIG51bGwpO1xuICAgIHN3aXRjaCAoY3VycmVudE5vZGUubm9kZVR5cGUpIHtcbiAgICAgIGNhc2UgTm9kZS5FTEVNRU5UX05PREU6XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBjdXJyZW50Tm9kZSBhcyBFbGVtZW50O1xuICAgICAgICBjb25zdCB0YWdOYW1lID0gZWxlbWVudC50YWdOYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGlmIChWQUxJRF9FTEVNRU5UUy5oYXNPd25Qcm9wZXJ0eSh0YWdOYW1lKSkge1xuICAgICAgICAgIGFkZENyZWF0ZU5vZGVBbmRBcHBlbmQoY3JlYXRlLCBFTEVNRU5UX01BUktFUiwgdGFnTmFtZSwgcGFyZW50SWR4LCBuZXdJbmRleCk7XG4gICAgICAgICAgdFZpZXcuZGF0YVtuZXdJbmRleF0gPSB0YWdOYW1lO1xuICAgICAgICAgIGNvbnN0IGVsQXR0cnMgPSBlbGVtZW50LmF0dHJpYnV0ZXM7XG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbEF0dHJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBhdHRyID0gZWxBdHRycy5pdGVtKGkpITtcbiAgICAgICAgICAgIGNvbnN0IGxvd2VyQXR0ck5hbWUgPSBhdHRyLm5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgIGNvbnN0IGhhc0JpbmRpbmcgPSAhIWF0dHIudmFsdWUubWF0Y2goQklORElOR19SRUdFWFApO1xuICAgICAgICAgICAgLy8gd2UgYXNzdW1lIHRoZSBpbnB1dCBzdHJpbmcgaXMgc2FmZSwgdW5sZXNzIGl0J3MgdXNpbmcgYSBiaW5kaW5nXG4gICAgICAgICAgICBpZiAoaGFzQmluZGluZykge1xuICAgICAgICAgICAgICBpZiAoVkFMSURfQVRUUlMuaGFzT3duUHJvcGVydHkobG93ZXJBdHRyTmFtZSkpIHtcbiAgICAgICAgICAgICAgICBpZiAoVVJJX0FUVFJTW2xvd2VyQXR0ck5hbWVdKSB7XG4gICAgICAgICAgICAgICAgICBnZW5lcmF0ZUJpbmRpbmdVcGRhdGVPcENvZGVzKFxuICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZSwgYXR0ci52YWx1ZSwgbmV3SW5kZXgsIGF0dHIubmFtZSwgMCwgX3Nhbml0aXplVXJsKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgZ2VuZXJhdGVCaW5kaW5nVXBkYXRlT3BDb2Rlcyh1cGRhdGUsIGF0dHIudmFsdWUsIG5ld0luZGV4LCBhdHRyLm5hbWUsIDAsIG51bGwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBuZ0Rldk1vZGUgJiZcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgICAgICAgICAgICAgICAgYFdBUk5JTkc6IGlnbm9yaW5nIHVuc2FmZSBhdHRyaWJ1dGUgdmFsdWUgYCArXG4gICAgICAgICAgICAgICAgICAgICAgICBgJHtsb3dlckF0dHJOYW1lfSBvbiBlbGVtZW50ICR7dGFnTmFtZX0gYCArXG4gICAgICAgICAgICAgICAgICAgICAgICBgKHNlZSAke1hTU19TRUNVUklUWV9VUkx9KWApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBhZGRDcmVhdGVBdHRyaWJ1dGUoY3JlYXRlLCBuZXdJbmRleCwgYXR0cik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIFBhcnNlIHRoZSBjaGlsZHJlbiBvZiB0aGlzIG5vZGUgKGlmIGFueSlcbiAgICAgICAgICBiaW5kaW5nTWFzayA9IHdhbGtJY3VUcmVlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRWaWV3LCB0SWN1LCBsVmlldywgc2hhcmVkVXBkYXRlT3BDb2RlcywgY3JlYXRlLCByZW1vdmUsIHVwZGF0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50Tm9kZSBhcyBFbGVtZW50LCBuZXdJbmRleCwgbmVzdGVkSWN1cywgZGVwdGggKyAxKSB8XG4gICAgICAgICAgICAgIGJpbmRpbmdNYXNrO1xuICAgICAgICAgIGFkZFJlbW92ZU5vZGUocmVtb3ZlLCBuZXdJbmRleCwgZGVwdGgpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBOb2RlLlRFWFRfTk9ERTpcbiAgICAgICAgY29uc3QgdmFsdWUgPSBjdXJyZW50Tm9kZS50ZXh0Q29udGVudCB8fCAnJztcbiAgICAgICAgY29uc3QgaGFzQmluZGluZyA9IHZhbHVlLm1hdGNoKEJJTkRJTkdfUkVHRVhQKTtcbiAgICAgICAgYWRkQ3JlYXRlTm9kZUFuZEFwcGVuZChjcmVhdGUsIG51bGwsIGhhc0JpbmRpbmcgPyAnJyA6IHZhbHVlLCBwYXJlbnRJZHgsIG5ld0luZGV4KTtcbiAgICAgICAgYWRkUmVtb3ZlTm9kZShyZW1vdmUsIG5ld0luZGV4LCBkZXB0aCk7XG4gICAgICAgIGlmIChoYXNCaW5kaW5nKSB7XG4gICAgICAgICAgYmluZGluZ01hc2sgPVxuICAgICAgICAgICAgICBnZW5lcmF0ZUJpbmRpbmdVcGRhdGVPcENvZGVzKHVwZGF0ZSwgdmFsdWUsIG5ld0luZGV4LCBudWxsLCAwLCBudWxsKSB8IGJpbmRpbmdNYXNrO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBOb2RlLkNPTU1FTlRfTk9ERTpcbiAgICAgICAgLy8gQ2hlY2sgaWYgdGhlIGNvbW1lbnQgbm9kZSBpcyBhIHBsYWNlaG9sZGVyIGZvciBhIG5lc3RlZCBJQ1VcbiAgICAgICAgY29uc3QgaXNOZXN0ZWRJY3UgPSBORVNURURfSUNVLmV4ZWMoY3VycmVudE5vZGUudGV4dENvbnRlbnQgfHwgJycpO1xuICAgICAgICBpZiAoaXNOZXN0ZWRJY3UpIHtcbiAgICAgICAgICBjb25zdCBuZXN0ZWRJY3VJbmRleCA9IHBhcnNlSW50KGlzTmVzdGVkSWN1WzFdLCAxMCk7XG4gICAgICAgICAgY29uc3QgaWN1RXhwcmVzc2lvbjogSWN1RXhwcmVzc2lvbiA9IG5lc3RlZEljdXNbbmVzdGVkSWN1SW5kZXhdO1xuICAgICAgICAgIC8vIENyZWF0ZSB0aGUgY29tbWVudCBub2RlIHRoYXQgd2lsbCBhbmNob3IgdGhlIElDVSBleHByZXNzaW9uXG4gICAgICAgICAgYWRkQ3JlYXRlTm9kZUFuZEFwcGVuZChcbiAgICAgICAgICAgICAgY3JlYXRlLCBJQ1VfTUFSS0VSLCBuZ0Rldk1vZGUgPyBgbmVzdGVkIElDVSAke25lc3RlZEljdUluZGV4fWAgOiAnJywgcGFyZW50SWR4LFxuICAgICAgICAgICAgICBuZXdJbmRleCk7XG4gICAgICAgICAgaWN1U3RhcnQodFZpZXcsIGxWaWV3LCBzaGFyZWRVcGRhdGVPcENvZGVzLCBwYXJlbnRJZHgsIGljdUV4cHJlc3Npb24sIG5ld0luZGV4KTtcbiAgICAgICAgICBhZGRSZW1vdmVOZXN0ZWRJY3UocmVtb3ZlLCBuZXdJbmRleCwgZGVwdGgpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBjdXJyZW50Tm9kZSA9IGN1cnJlbnROb2RlLm5leHRTaWJsaW5nO1xuICB9XG4gIHJldHVybiBiaW5kaW5nTWFzaztcbn1cblxuZnVuY3Rpb24gYWRkUmVtb3ZlTm9kZShyZW1vdmU6IEkxOG5SZW1vdmVPcENvZGVzLCBpbmRleDogbnVtYmVyLCBkZXB0aDogbnVtYmVyKSB7XG4gIGlmIChkZXB0aCA9PT0gMCkge1xuICAgIHJlbW92ZS5wdXNoKGluZGV4KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBhZGRSZW1vdmVOZXN0ZWRJY3UocmVtb3ZlOiBJMThuUmVtb3ZlT3BDb2RlcywgaW5kZXg6IG51bWJlciwgZGVwdGg6IG51bWJlcikge1xuICBpZiAoZGVwdGggPT09IDApIHtcbiAgICByZW1vdmUucHVzaCh+aW5kZXgpOyAgLy8gcmVtb3ZlIElDVSBhdCBgaW5kZXhgXG4gICAgcmVtb3ZlLnB1c2goaW5kZXgpOyAgIC8vIHJlbW92ZSBJQ1UgY29tbWVudCBhdCBgaW5kZXhgXG4gIH1cbn1cblxuZnVuY3Rpb24gYWRkVXBkYXRlSWN1U3dpdGNoKFxuICAgIHVwZGF0ZTogSTE4blVwZGF0ZU9wQ29kZXMsIGljdUV4cHJlc3Npb246IEljdUV4cHJlc3Npb24sIGluZGV4OiBudW1iZXIpIHtcbiAgdXBkYXRlLnB1c2goXG4gICAgICB0b01hc2tCaXQoaWN1RXhwcmVzc2lvbi5tYWluQmluZGluZyksIDIsIC0xIC0gaWN1RXhwcmVzc2lvbi5tYWluQmluZGluZyxcbiAgICAgIGluZGV4IDw8IEkxOG5VcGRhdGVPcENvZGUuU0hJRlRfUkVGIHwgSTE4blVwZGF0ZU9wQ29kZS5JY3VTd2l0Y2gpO1xufVxuXG5mdW5jdGlvbiBhZGRVcGRhdGVJY3VVcGRhdGUodXBkYXRlOiBJMThuVXBkYXRlT3BDb2RlcywgYmluZGluZ01hc2s6IG51bWJlciwgaW5kZXg6IG51bWJlcikge1xuICB1cGRhdGUucHVzaChiaW5kaW5nTWFzaywgMSwgaW5kZXggPDwgSTE4blVwZGF0ZU9wQ29kZS5TSElGVF9SRUYgfCBJMThuVXBkYXRlT3BDb2RlLkljdVVwZGF0ZSk7XG59XG5cbmZ1bmN0aW9uIGFkZENyZWF0ZU5vZGVBbmRBcHBlbmQoXG4gICAgY3JlYXRlOiBJY3VDcmVhdGVPcENvZGVzLCBtYXJrZXI6IG51bGx8SUNVX01BUktFUnxFTEVNRU5UX01BUktFUiwgdGV4dDogc3RyaW5nLFxuICAgIGFwcGVuZFRvUGFyZW50SWR4OiBudW1iZXIsIGNyZWF0ZUF0SWR4OiBudW1iZXIpIHtcbiAgaWYgKG1hcmtlciAhPT0gbnVsbCkge1xuICAgIGNyZWF0ZS5wdXNoKG1hcmtlcik7XG4gIH1cbiAgY3JlYXRlLnB1c2goXG4gICAgICB0ZXh0LCBjcmVhdGVBdElkeCxcbiAgICAgIGljdUNyZWF0ZU9wQ29kZShJY3VDcmVhdGVPcENvZGUuQXBwZW5kQ2hpbGQsIGFwcGVuZFRvUGFyZW50SWR4LCBjcmVhdGVBdElkeCkpO1xufVxuXG5mdW5jdGlvbiBhZGRDcmVhdGVBdHRyaWJ1dGUoY3JlYXRlOiBJY3VDcmVhdGVPcENvZGVzLCBuZXdJbmRleDogbnVtYmVyLCBhdHRyOiBBdHRyKSB7XG4gIGNyZWF0ZS5wdXNoKG5ld0luZGV4IDw8IEljdUNyZWF0ZU9wQ29kZS5TSElGVF9SRUYgfCBJY3VDcmVhdGVPcENvZGUuQXR0ciwgYXR0ci5uYW1lLCBhdHRyLnZhbHVlKTtcbn1cbiJdfQ==