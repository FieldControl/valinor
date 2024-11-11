/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { WhitespaceVisitor, visitAllWithSiblings } from '../../../ml_parser/html_whitespaces';
import { computeDecimalDigest, computeDigest, decimalDigest } from '../../../i18n/digest';
import * as i18n from '../../../i18n/i18n_ast';
import { createI18nMessageFactory } from '../../../i18n/i18n_parser';
import { I18nError } from '../../../i18n/parse_util';
import * as html from '../../../ml_parser/ast';
import { DEFAULT_CONTAINER_BLOCKS, DEFAULT_INTERPOLATION_CONFIG, } from '../../../ml_parser/defaults';
import { ParseTreeResult } from '../../../ml_parser/parser';
import * as o from '../../../output/output_ast';
import { isTrustedTypesSink } from '../../../schema/trusted_types_sinks';
import { hasI18nAttrs, I18N_ATTR, I18N_ATTR_PREFIX, icuFromI18nMessage } from './util';
const setI18nRefs = (originalNodeMap) => {
    return (trimmedNode, i18nNode) => {
        // We need to set i18n properties on the original, untrimmed AST nodes. The i18n nodes needs to
        // use the trimmed content for message IDs to make messages more stable to whitespace changes.
        // But we don't want to actually trim the content, so we can't use the trimmed HTML AST for
        // general code gen. Instead we map the trimmed HTML AST back to the original AST and then
        // attach the i18n nodes so we get trimmed i18n nodes on the original (untrimmed) HTML AST.
        const originalNode = originalNodeMap.get(trimmedNode) ?? trimmedNode;
        if (originalNode instanceof html.NodeWithI18n) {
            if (i18nNode instanceof i18n.IcuPlaceholder && originalNode.i18n instanceof i18n.Message) {
                // This html node represents an ICU but this is a second processing pass, and the legacy id
                // was computed in the previous pass and stored in the `i18n` property as a message.
                // We are about to wipe out that property so capture the previous message to be reused when
                // generating the message for this ICU later. See `_generateI18nMessage()`.
                i18nNode.previousMessage = originalNode.i18n;
            }
            originalNode.i18n = i18nNode;
        }
        return i18nNode;
    };
};
/**
 * This visitor walks over HTML parse tree and converts information stored in
 * i18n-related attributes ("i18n" and "i18n-*") into i18n meta object that is
 * stored with other element's and attribute's information.
 */
export class I18nMetaVisitor {
    constructor(interpolationConfig = DEFAULT_INTERPOLATION_CONFIG, keepI18nAttrs = false, enableI18nLegacyMessageIdFormat = false, containerBlocks = DEFAULT_CONTAINER_BLOCKS, preserveSignificantWhitespace = true, 
    // When dropping significant whitespace we need to retain empty tokens or
    // else we won't be able to reuse source spans because empty tokens would be
    // removed and cause a mismatch. Unfortunately this still needs to be
    // configurable and sometimes needs to be set independently in order to make
    // sure the number of nodes don't change between parses, even when
    // `preserveSignificantWhitespace` changes.
    retainEmptyTokens = !preserveSignificantWhitespace) {
        this.interpolationConfig = interpolationConfig;
        this.keepI18nAttrs = keepI18nAttrs;
        this.enableI18nLegacyMessageIdFormat = enableI18nLegacyMessageIdFormat;
        this.containerBlocks = containerBlocks;
        this.preserveSignificantWhitespace = preserveSignificantWhitespace;
        this.retainEmptyTokens = retainEmptyTokens;
        // whether visited nodes contain i18n information
        this.hasI18nMeta = false;
        this._errors = [];
    }
    _generateI18nMessage(nodes, meta = '', visitNodeFn) {
        const { meaning, description, customId } = this._parseMetadata(meta);
        const createI18nMessage = createI18nMessageFactory(this.interpolationConfig, this.containerBlocks, this.retainEmptyTokens);
        const message = createI18nMessage(nodes, meaning, description, customId, visitNodeFn);
        this._setMessageId(message, meta);
        this._setLegacyIds(message, meta);
        return message;
    }
    visitAllWithErrors(nodes) {
        const result = nodes.map((node) => node.visit(this, null));
        return new ParseTreeResult(result, this._errors);
    }
    visitElement(element) {
        let message = undefined;
        if (hasI18nAttrs(element)) {
            this.hasI18nMeta = true;
            const attrs = [];
            const attrsMeta = {};
            for (const attr of element.attrs) {
                if (attr.name === I18N_ATTR) {
                    // root 'i18n' node attribute
                    const i18n = element.i18n || attr.value;
                    // Generate a new AST with whitespace trimmed, but also generate a map
                    // to correlate each new node to its original so we can apply i18n
                    // information to the original node based on the trimmed content.
                    //
                    // `WhitespaceVisitor` removes *insignificant* whitespace as well as
                    // significant whitespace. Enabling this visitor should be conditional
                    // on `preserveWhitespace` rather than `preserveSignificantWhitespace`,
                    // however this would be a breaking change for existing behavior where
                    // `preserveWhitespace` was not respected correctly when generating
                    // message IDs. This is really a bug but one we need to keep to maintain
                    // backwards compatibility.
                    const originalNodeMap = new Map();
                    const trimmedNodes = this.preserveSignificantWhitespace
                        ? element.children
                        : visitAllWithSiblings(new WhitespaceVisitor(false /* preserveSignificantWhitespace */, originalNodeMap), element.children);
                    message = this._generateI18nMessage(trimmedNodes, i18n, setI18nRefs(originalNodeMap));
                    if (message.nodes.length === 0) {
                        // Ignore the message if it is empty.
                        message = undefined;
                    }
                    // Store the message on the element
                    element.i18n = message;
                }
                else if (attr.name.startsWith(I18N_ATTR_PREFIX)) {
                    // 'i18n-*' attributes
                    const name = attr.name.slice(I18N_ATTR_PREFIX.length);
                    if (isTrustedTypesSink(element.name, name)) {
                        this._reportError(attr, `Translating attribute '${name}' is disallowed for security reasons.`);
                    }
                    else {
                        attrsMeta[name] = attr.value;
                    }
                }
                else {
                    // non-i18n attributes
                    attrs.push(attr);
                }
            }
            // set i18n meta for attributes
            if (Object.keys(attrsMeta).length) {
                for (const attr of attrs) {
                    const meta = attrsMeta[attr.name];
                    // do not create translation for empty attributes
                    if (meta !== undefined && attr.value) {
                        attr.i18n = this._generateI18nMessage([attr], attr.i18n || meta);
                    }
                }
            }
            if (!this.keepI18nAttrs) {
                // update element's attributes,
                // keeping only non-i18n related ones
                element.attrs = attrs;
            }
        }
        html.visitAll(this, element.children, message);
        return element;
    }
    visitExpansion(expansion, currentMessage) {
        let message;
        const meta = expansion.i18n;
        this.hasI18nMeta = true;
        if (meta instanceof i18n.IcuPlaceholder) {
            // set ICU placeholder name (e.g. "ICU_1"),
            // generated while processing root element contents,
            // so we can reference it when we output translation
            const name = meta.name;
            message = this._generateI18nMessage([expansion], meta);
            const icu = icuFromI18nMessage(message);
            icu.name = name;
            if (currentMessage !== null) {
                // Also update the placeholderToMessage map with this new message
                currentMessage.placeholderToMessage[name] = message;
            }
        }
        else {
            // ICU is a top level message, try to use metadata from container element if provided via
            // `context` argument. Note: context may not be available for standalone ICUs (without
            // wrapping element), so fallback to ICU metadata in this case.
            message = this._generateI18nMessage([expansion], currentMessage || meta);
        }
        expansion.i18n = message;
        return expansion;
    }
    visitText(text) {
        return text;
    }
    visitAttribute(attribute) {
        return attribute;
    }
    visitComment(comment) {
        return comment;
    }
    visitExpansionCase(expansionCase) {
        return expansionCase;
    }
    visitBlock(block, context) {
        html.visitAll(this, block.children, context);
        return block;
    }
    visitBlockParameter(parameter, context) {
        return parameter;
    }
    visitLetDeclaration(decl, context) {
        return decl;
    }
    /**
     * Parse the general form `meta` passed into extract the explicit metadata needed to create a
     * `Message`.
     *
     * There are three possibilities for the `meta` variable
     * 1) a string from an `i18n` template attribute: parse it to extract the metadata values.
     * 2) a `Message` from a previous processing pass: reuse the metadata values in the message.
     * 4) other: ignore this and just process the message metadata as normal
     *
     * @param meta the bucket that holds information about the message
     * @returns the parsed metadata.
     */
    _parseMetadata(meta) {
        return typeof meta === 'string'
            ? parseI18nMeta(meta)
            : meta instanceof i18n.Message
                ? meta
                : {};
    }
    /**
     * Generate (or restore) message id if not specified already.
     */
    _setMessageId(message, meta) {
        if (!message.id) {
            message.id =
                (meta instanceof i18n.Message && meta.id) ||
                    decimalDigest(message, /* preservePlaceholders */ this.preserveSignificantWhitespace);
        }
    }
    /**
     * Update the `message` with a `legacyId` if necessary.
     *
     * @param message the message whose legacy id should be set
     * @param meta information about the message being processed
     */
    _setLegacyIds(message, meta) {
        if (this.enableI18nLegacyMessageIdFormat) {
            message.legacyIds = [
                computeDigest(message),
                computeDecimalDigest(message, 
                /* preservePlaceholders */ this.preserveSignificantWhitespace),
            ];
        }
        else if (typeof meta !== 'string') {
            // This occurs if we are doing the 2nd pass after whitespace removal (see `parseTemplate()` in
            // `packages/compiler/src/render3/view/template.ts`).
            // In that case we want to reuse the legacy message generated in the 1st pass (see
            // `setI18nRefs()`).
            const previousMessage = meta instanceof i18n.Message
                ? meta
                : meta instanceof i18n.IcuPlaceholder
                    ? meta.previousMessage
                    : undefined;
            message.legacyIds = previousMessage ? previousMessage.legacyIds : [];
        }
    }
    _reportError(node, msg) {
        this._errors.push(new I18nError(node.sourceSpan, msg));
    }
}
/** I18n separators for metadata **/
const I18N_MEANING_SEPARATOR = '|';
const I18N_ID_SEPARATOR = '@@';
/**
 * Parses i18n metas like:
 *  - "@@id",
 *  - "description[@@id]",
 *  - "meaning|description[@@id]"
 * and returns an object with parsed output.
 *
 * @param meta String that represents i18n meta
 * @returns Object with id, meaning and description fields
 */
export function parseI18nMeta(meta = '') {
    let customId;
    let meaning;
    let description;
    meta = meta.trim();
    if (meta) {
        const idIndex = meta.indexOf(I18N_ID_SEPARATOR);
        const descIndex = meta.indexOf(I18N_MEANING_SEPARATOR);
        let meaningAndDesc;
        [meaningAndDesc, customId] =
            idIndex > -1 ? [meta.slice(0, idIndex), meta.slice(idIndex + 2)] : [meta, ''];
        [meaning, description] =
            descIndex > -1
                ? [meaningAndDesc.slice(0, descIndex), meaningAndDesc.slice(descIndex + 1)]
                : ['', meaningAndDesc];
    }
    return { customId, meaning, description };
}
// Converts i18n meta information for a message (id, description, meaning)
// to a JsDoc statement formatted as expected by the Closure compiler.
export function i18nMetaToJSDoc(meta) {
    const tags = [];
    if (meta.description) {
        tags.push({ tagName: "desc" /* o.JSDocTagName.Desc */, text: meta.description });
    }
    else {
        // Suppress the JSCompiler warning that a `@desc` was not given for this message.
        tags.push({ tagName: "suppress" /* o.JSDocTagName.Suppress */, text: '{msgDescriptions}' });
    }
    if (meta.meaning) {
        tags.push({ tagName: "meaning" /* o.JSDocTagName.Meaning */, text: meta.meaning });
    }
    return o.jsDocComment(tags);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9yZW5kZXIzL3ZpZXcvaTE4bi9tZXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxpQkFBaUIsRUFBRSxvQkFBb0IsRUFBQyxNQUFNLHFDQUFxQyxDQUFDO0FBQzVGLE9BQU8sRUFBQyxvQkFBb0IsRUFBRSxhQUFhLEVBQUUsYUFBYSxFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFDeEYsT0FBTyxLQUFLLElBQUksTUFBTSx3QkFBd0IsQ0FBQztBQUMvQyxPQUFPLEVBQUMsd0JBQXdCLEVBQWMsTUFBTSwyQkFBMkIsQ0FBQztBQUNoRixPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sMEJBQTBCLENBQUM7QUFDbkQsT0FBTyxLQUFLLElBQUksTUFBTSx3QkFBd0IsQ0FBQztBQUMvQyxPQUFPLEVBQ0wsd0JBQXdCLEVBQ3hCLDRCQUE0QixHQUU3QixNQUFNLDZCQUE2QixDQUFDO0FBQ3JDLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQztBQUMxRCxPQUFPLEtBQUssQ0FBQyxNQUFNLDRCQUE0QixDQUFDO0FBQ2hELE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLHFDQUFxQyxDQUFDO0FBRXZFLE9BQU8sRUFBQyxZQUFZLEVBQUUsU0FBUyxFQUFFLGdCQUFnQixFQUFFLGtCQUFrQixFQUFDLE1BQU0sUUFBUSxDQUFDO0FBVXJGLE1BQU0sV0FBVyxHQUFHLENBQUMsZUFBMEMsRUFBZSxFQUFFO0lBQzlFLE9BQU8sQ0FBQyxXQUFXLEVBQUUsUUFBUSxFQUFFLEVBQUU7UUFDL0IsK0ZBQStGO1FBQy9GLDhGQUE4RjtRQUM5RiwyRkFBMkY7UUFDM0YsMEZBQTBGO1FBQzFGLDJGQUEyRjtRQUMzRixNQUFNLFlBQVksR0FBRyxlQUFlLENBQUMsR0FB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QUFDLElBQUksQ0FBQyxFQUFDLE9BQU8sMENBQXlCLEVBQUUsSUFBSSxFQUFFLG1CQUFtQixFQUFDLENBQUMsQ0FBQztJQUMzRSxDQUFDO0lBQ0QsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDakIsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFDLE9BQU8sd0NBQXdCLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDO0lBQ25FLENBQUM7SUFDRCxPQUFPLENBQUMsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDOUIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtXaGl0ZXNwYWNlVmlzaXRvciwgdmlzaXRBbGxXaXRoU2libGluZ3N9IGZyb20gJy4uLy4uLy4uL21sX3BhcnNlci9odG1sX3doaXRlc3BhY2VzJztcbmltcG9ydCB7Y29tcHV0ZURlY2ltYWxEaWdlc3QsIGNvbXB1dGVEaWdlc3QsIGRlY2ltYWxEaWdlc3R9IGZyb20gJy4uLy4uLy4uL2kxOG4vZGlnZXN0JztcbmltcG9ydCAqIGFzIGkxOG4gZnJvbSAnLi4vLi4vLi4vaTE4bi9pMThuX2FzdCc7XG5pbXBvcnQge2NyZWF0ZUkxOG5NZXNzYWdlRmFjdG9yeSwgVmlzaXROb2RlRm59IGZyb20gJy4uLy4uLy4uL2kxOG4vaTE4bl9wYXJzZXInO1xuaW1wb3J0IHtJMThuRXJyb3J9IGZyb20gJy4uLy4uLy4uL2kxOG4vcGFyc2VfdXRpbCc7XG5pbXBvcnQgKiBhcyBodG1sIGZyb20gJy4uLy4uLy4uL21sX3BhcnNlci9hc3QnO1xuaW1wb3J0IHtcbiAgREVGQVVMVF9DT05UQUlORVJfQkxPQ0tTLFxuICBERUZBVUxUX0lOVEVSUE9MQVRJT05fQ09ORklHLFxuICBJbnRlcnBvbGF0aW9uQ29uZmlnLFxufSBmcm9tICcuLi8uLi8uLi9tbF9wYXJzZXIvZGVmYXVsdHMnO1xuaW1wb3J0IHtQYXJzZVRyZWVSZXN1bHR9IGZyb20gJy4uLy4uLy4uL21sX3BhcnNlci9wYXJzZXInO1xuaW1wb3J0ICogYXMgbyBmcm9tICcuLi8uLi8uLi9vdXRwdXQvb3V0cHV0X2FzdCc7XG5pbXBvcnQge2lzVHJ1c3RlZFR5cGVzU2lua30gZnJvbSAnLi4vLi4vLi4vc2NoZW1hL3RydXN0ZWRfdHlwZXNfc2lua3MnO1xuXG5pbXBvcnQge2hhc0kxOG5BdHRycywgSTE4Tl9BVFRSLCBJMThOX0FUVFJfUFJFRklYLCBpY3VGcm9tSTE4bk1lc3NhZ2V9IGZyb20gJy4vdXRpbCc7XG5cbmV4cG9ydCB0eXBlIEkxOG5NZXRhID0ge1xuICBpZD86IHN0cmluZztcbiAgY3VzdG9tSWQ/OiBzdHJpbmc7XG4gIGxlZ2FjeUlkcz86IHN0cmluZ1tdO1xuICBkZXNjcmlwdGlvbj86IHN0cmluZztcbiAgbWVhbmluZz86IHN0cmluZztcbn07XG5cbmNvbnN0IHNldEkxOG5SZWZzID0gKG9yaWdpbmFsTm9kZU1hcDogTWFwPGh0bWwuTm9kZSwgaHRtbC5Ob2RlPik6IFZpc2l0Tm9kZUZuID0+IHtcbiAgcmV0dXJuICh0cmltbWVkTm9kZSwgaTE4bk5vZGUpID0+IHtcbiAgICAvLyBXZSBuZWVkIHRvIHNldCBpMThuIHByb3BlcnRpZXMgb24gdGhlIG9yaWdpbmFsLCB1bnRyaW1tZWQgQVNUIG5vZGVzLiBUaGUgaTE4biBub2RlcyBuZWVkcyB0b1xuICAgIC8vIHVzZSB0aGUgdHJpbW1lZCBjb250ZW50IGZvciBtZXNzYWdlIElEcyB0byBtYWtlIG1lc3NhZ2VzIG1vcmUgc3RhYmxlIHRvIHdoaXRlc3BhY2UgY2hhbmdlcy5cbiAgICAvLyBCdXQgd2UgZG9uJ3Qgd2FudCB0byBhY3R1YWxseSB0cmltIHRoZSBjb250ZW50LCBzbyB3ZSBjYW4ndCB1c2UgdGhlIHRyaW1tZWQgSFRNTCBBU1QgZm9yXG4gICAgLy8gZ2VuZXJhbCBjb2RlIGdlbi4gSW5zdGVhZCB3ZSBtYXAgdGhlIHRyaW1tZWQgSFRNTCBBU1QgYmFjayB0byB0aGUgb3JpZ2luYWwgQVNUIGFuZCB0aGVuXG4gICAgLy8gYXR0YWNoIHRoZSBpMThuIG5vZGVzIHNvIHdlIGdldCB0cmltbWVkIGkxOG4gbm9kZXMgb24gdGhlIG9yaWdpbmFsICh1bnRyaW1tZWQpIEhUTUwgQVNULlxuICAgIGNvbnN0IG9yaWdpbmFsTm9kZSA9IG9yaWdpbmFsTm9kZU1hcC5nZXQodHJpbW1lZE5vZGUpID8/IHRyaW1tZWROb2RlO1xuXG4gICAgaWYgKG9yaWdpbmFsTm9kZSBpbnN0YW5jZW9mIGh0bWwuTm9kZVdpdGhJMThuKSB7XG4gICAgICBpZiAoaTE4bk5vZGUgaW5zdGFuY2VvZiBpMThuLkljdVBsYWNlaG9sZGVyICYmIG9yaWdpbmFsTm9kZS5pMThuIGluc3RhbmNlb2YgaTE4bi5NZXNzYWdlKSB7XG4gICAgICAgIC8vIFRoaXMgaHRtbCBub2RlIHJlcHJlc2VudHMgYW4gSUNVIGJ1dCB0aGlzIGlzIGEgc2Vjb25kIHByb2Nlc3NpbmcgcGFzcywgYW5kIHRoZSBsZWdhY3kgaWRcbiAgICAgICAgLy8gd2FzIGNvbXB1dGVkIGluIHRoZSBwcmV2aW91cyBwYXNzIGFuZCBzdG9yZWQgaW4gdGhlIGBpMThuYCBwcm9wZXJ0eSBhcyBhIG1lc3NhZ2UuXG4gICAgICAgIC8vIFdlIGFyZSBhYm91dCB0byB3aXBlIG91dCB0aGF0IHByb3BlcnR5IHNvIGNhcHR1cmUgdGhlIHByZXZpb3VzIG1lc3NhZ2UgdG8gYmUgcmV1c2VkIHdoZW5cbiAgICAgICAgLy8gZ2VuZXJhdGluZyB0aGUgbWVzc2FnZSBmb3IgdGhpcyBJQ1UgbGF0ZXIuIFNlZSBgX2dlbmVyYXRlSTE4bk1lc3NhZ2UoKWAuXG4gICAgICAgIGkxOG5Ob2RlLnByZXZpb3VzTWVzc2FnZSA9IG9yaWdpbmFsTm9kZS5pMThuO1xuICAgICAgfVxuICAgICAgb3JpZ2luYWxOb2RlLmkxOG4gPSBpMThuTm9kZTtcbiAgICB9XG4gICAgcmV0dXJuIGkxOG5Ob2RlO1xuICB9O1xufTtcblxuLyoqXG4gKiBUaGlzIHZpc2l0b3Igd2Fsa3Mgb3ZlciBIVE1MIHBhcnNlIHRyZWUgYW5kIGNvbnZlcnRzIGluZm9ybWF0aW9uIHN0b3JlZCBpblxuICogaTE4bi1yZWxhdGVkIGF0dHJpYnV0ZXMgKFwiaTE4blwiIGFuZCBcImkxOG4tKlwiKSBpbnRvIGkxOG4gbWV0YSBvYmplY3QgdGhhdCBpc1xuICogc3RvcmVkIHdpdGggb3RoZXIgZWxlbWVudCdzIGFuZCBhdHRyaWJ1dGUncyBpbmZvcm1hdGlvbi5cbiAqL1xuZXhwb3J0IGNsYXNzIEkxOG5NZXRhVmlzaXRvciBpbXBsZW1lbnRzIGh0bWwuVmlzaXRvciB7XG4gIC8vIHdoZXRoZXIgdmlzaXRlZCBub2RlcyBjb250YWluIGkxOG4gaW5mb3JtYXRpb25cbiAgcHVibGljIGhhc0kxOG5NZXRhOiBib29sZWFuID0gZmFsc2U7XG4gIHByaXZhdGUgX2Vycm9yczogSTE4bkVycm9yW10gPSBbXTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGludGVycG9sYXRpb25Db25maWc6IEludGVycG9sYXRpb25Db25maWcgPSBERUZBVUxUX0lOVEVSUE9MQVRJT05fQ09ORklHLFxuICAgIHByaXZhdGUga2VlcEkxOG5BdHRycyA9IGZhbHNlLFxuICAgIHByaXZhdGUgZW5hYmxlSTE4bkxlZ2FjeU1lc3NhZ2VJZEZvcm1hdCA9IGZhbHNlLFxuICAgIHByaXZhdGUgY29udGFpbmVyQmxvY2tzOiBTZXQ8c3RyaW5nPiA9IERFRkFVTFRfQ09OVEFJTkVSX0JMT0NLUyxcbiAgICBwcml2YXRlIHJlYWRvbmx5IHByZXNlcnZlU2lnbmlmaWNhbnRXaGl0ZXNwYWNlOiBib29sZWFuID0gdHJ1ZSxcblxuICAgIC8vIFdoZW4gZHJvcHBpbmcgc2lnbmlmaWNhbnQgd2hpdGVzcGFjZSB3ZSBuZWVkIHRvIHJldGFpbiBlbXB0eSB0b2tlbnMgb3JcbiAgICAvLyBlbHNlIHdlIHdvbid0IGJlIGFibGUgdG8gcmV1c2Ugc291cmNlIHNwYW5zIGJlY2F1c2UgZW1wdHkgdG9rZW5zIHdvdWxkIGJlXG4gICAgLy8gcmVtb3ZlZCBhbmQgY2F1c2UgYSBtaXNtYXRjaC4gVW5mb3J0dW5hdGVseSB0aGlzIHN0aWxsIG5lZWRzIHRvIGJlXG4gICAgLy8gY29uZmlndXJhYmxlIGFuZCBzb21ldGltZXMgbmVlZHMgdG8gYmUgc2V0IGluZGVwZW5kZW50bHkgaW4gb3JkZXIgdG8gbWFrZVxuICAgIC8vIHN1cmUgdGhlIG51bWJlciBvZiBub2RlcyBkb24ndCBjaGFuZ2UgYmV0d2VlbiBwYXJzZXMsIGV2ZW4gd2hlblxuICAgIC8vIGBwcmVzZXJ2ZVNpZ25pZmljYW50V2hpdGVzcGFjZWAgY2hhbmdlcy5cbiAgICBwcml2YXRlIHJlYWRvbmx5IHJldGFpbkVtcHR5VG9rZW5zOiBib29sZWFuID0gIXByZXNlcnZlU2lnbmlmaWNhbnRXaGl0ZXNwYWNlLFxuICApIHt9XG5cbiAgcHJpdmF0ZSBfZ2VuZXJhdGVJMThuTWVzc2FnZShcbiAgICBub2RlczogaHRtbC5Ob2RlW10sXG4gICAgbWV0YTogc3RyaW5nIHwgaTE4bi5JMThuTWV0YSA9ICcnLFxuICAgIHZpc2l0Tm9kZUZuPzogVmlzaXROb2RlRm4sXG4gICk6IGkxOG4uTWVzc2FnZSB7XG4gICAgY29uc3Qge21lYW5pbmcsIGRlc2NyaXB0aW9uLCBjdXN0b21JZH0gPSB0aGlzLl9wYXJzZU1ldGFkYXRhKG1ldGEpO1xuICAgIGNvbnN0IGNyZWF0ZUkxOG5NZXNzYWdlID0gY3JlYXRlSTE4bk1lc3NhZ2VGYWN0b3J5KFxuICAgICAgdGhpcy5pbnRlcnBvbGF0aW9uQ29uZmlnLFxuICAgICAgdGhpcy5jb250YWluZXJCbG9ja3MsXG4gICAgICB0aGlzLnJldGFpbkVtcHR5VG9rZW5zLFxuICAgICk7XG4gICAgY29uc3QgbWVzc2FnZSA9IGNyZWF0ZUkxOG5NZXNzYWdlKG5vZGVzLCBtZWFuaW5nLCBkZXNjcmlwdGlvbiwgY3VzdG9tSWQsIHZpc2l0Tm9kZUZuKTtcbiAgICB0aGlzLl9zZXRNZXNzYWdlSWQobWVzc2FnZSwgbWV0YSk7XG4gICAgdGhpcy5fc2V0TGVnYWN5SWRzKG1lc3NhZ2UsIG1ldGEpO1xuICAgIHJldHVybiBtZXNzYWdlO1xuICB9XG5cbiAgdmlzaXRBbGxXaXRoRXJyb3JzKG5vZGVzOiBodG1sLk5vZGVbXSk6IFBhcnNlVHJlZVJlc3VsdCB7XG4gICAgY29uc3QgcmVzdWx0ID0gbm9kZXMubWFwKChub2RlKSA9PiBub2RlLnZpc2l0KHRoaXMsIG51bGwpKTtcbiAgICByZXR1cm4gbmV3IFBhcnNlVHJlZVJlc3VsdChyZXN1bHQsIHRoaXMuX2Vycm9ycyk7XG4gIH1cblxuICB2aXNpdEVsZW1lbnQoZWxlbWVudDogaHRtbC5FbGVtZW50KTogYW55IHtcbiAgICBsZXQgbWVzc2FnZTogaTE4bi5NZXNzYWdlIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuXG4gICAgaWYgKGhhc0kxOG5BdHRycyhlbGVtZW50KSkge1xuICAgICAgdGhpcy5oYXNJMThuTWV0YSA9IHRydWU7XG4gICAgICBjb25zdCBhdHRyczogaHRtbC5BdHRyaWJ1dGVbXSA9IFtdO1xuICAgICAgY29uc3QgYXR0cnNNZXRhOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuXG4gICAgICBmb3IgKGNvbnN0IGF0dHIgb2YgZWxlbWVudC5hdHRycykge1xuICAgICAgICBpZiAoYXR0ci5uYW1lID09PSBJMThOX0FUVFIpIHtcbiAgICAgICAgICAvLyByb290ICdpMThuJyBub2RlIGF0dHJpYnV0ZVxuICAgICAgICAgIGNvbnN0IGkxOG4gPSBlbGVtZW50LmkxOG4gfHwgYXR0ci52YWx1ZTtcblxuICAgICAgICAgIC8vIEdlbmVyYXRlIGEgbmV3IEFTVCB3aXRoIHdoaXRlc3BhY2UgdHJpbW1lZCwgYnV0IGFsc28gZ2VuZXJhdGUgYSBtYXBcbiAgICAgICAgICAvLyB0byBjb3JyZWxhdGUgZWFjaCBuZXcgbm9kZSB0byBpdHMgb3JpZ2luYWwgc28gd2UgY2FuIGFwcGx5IGkxOG5cbiAgICAgICAgICAvLyBpbmZvcm1hdGlvbiB0byB0aGUgb3JpZ2luYWwgbm9kZSBiYXNlZCBvbiB0aGUgdHJpbW1lZCBjb250ZW50LlxuICAgICAgICAgIC8vXG4gICAgICAgICAgLy8gYFdoaXRlc3BhY2VWaXNpdG9yYCByZW1vdmVzICppbnNpZ25pZmljYW50KiB3aGl0ZXNwYWNlIGFzIHdlbGwgYXNcbiAgICAgICAgICAvLyBzaWduaWZpY2FudCB3aGl0ZXNwYWNlLiBFbmFibGluZyB0aGlzIHZpc2l0b3Igc2hvdWxkIGJlIGNvbmRpdGlvbmFsXG4gICAgICAgICAgLy8gb24gYHByZXNlcnZlV2hpdGVzcGFjZWAgcmF0aGVyIHRoYW4gYHByZXNlcnZlU2lnbmlmaWNhbnRXaGl0ZXNwYWNlYCxcbiAgICAgICAgICAvLyBob3dldmVyIHRoaXMgd291bGQgYmUgYSBicmVha2luZyBjaGFuZ2UgZm9yIGV4aXN0aW5nIGJlaGF2aW9yIHdoZXJlXG4gICAgICAgICAgLy8gYHByZXNlcnZlV2hpdGVzcGFjZWAgd2FzIG5vdCByZXNwZWN0ZWQgY29ycmVjdGx5IHdoZW4gZ2VuZXJhdGluZ1xuICAgICAgICAgIC8vIG1lc3NhZ2UgSURzLiBUaGlzIGlzIHJlYWxseSBhIGJ1ZyBidXQgb25lIHdlIG5lZWQgdG8ga2VlcCB0byBtYWludGFpblxuICAgICAgICAgIC8vIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5LlxuICAgICAgICAgIGNvbnN0IG9yaWdpbmFsTm9kZU1hcCA9IG5ldyBNYXA8aHRtbC5Ob2RlLCBodG1sLk5vZGU+KCk7XG4gICAgICAgICAgY29uc3QgdHJpbW1lZE5vZGVzID0gdGhpcy5wcmVzZXJ2ZVNpZ25pZmljYW50V2hpdGVzcGFjZVxuICAgICAgICAgICAgPyBlbGVtZW50LmNoaWxkcmVuXG4gICAgICAgICAgICA6IHZpc2l0QWxsV2l0aFNpYmxpbmdzKFxuICAgICAgICAgICAgICAgIG5ldyBXaGl0ZXNwYWNlVmlzaXRvcihmYWxzZSAvKiBwcmVzZXJ2ZVNpZ25pZmljYW50V2hpdGVzcGFjZSAqLywgb3JpZ2luYWxOb2RlTWFwKSxcbiAgICAgICAgICAgICAgICBlbGVtZW50LmNoaWxkcmVuLFxuICAgICAgICAgICAgICApO1xuICAgICAgICAgIG1lc3NhZ2UgPSB0aGlzLl9nZW5lcmF0ZUkxOG5NZXNzYWdlKHRyaW1tZWROb2RlcywgaTE4biwgc2V0STE4blJlZnMob3JpZ2luYWxOb2RlTWFwKSk7XG4gICAgICAgICAgaWYgKG1lc3NhZ2Uubm9kZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAvLyBJZ25vcmUgdGhlIG1lc3NhZ2UgaWYgaXQgaXMgZW1wdHkuXG4gICAgICAgICAgICBtZXNzYWdlID0gdW5kZWZpbmVkO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBTdG9yZSB0aGUgbWVzc2FnZSBvbiB0aGUgZWxlbWVudFxuICAgICAgICAgIGVsZW1lbnQuaTE4biA9IG1lc3NhZ2U7XG4gICAgICAgIH0gZWxzZSBpZiAoYXR0ci5uYW1lLnN0YXJ0c1dpdGgoSTE4Tl9BVFRSX1BSRUZJWCkpIHtcbiAgICAgICAgICAvLyAnaTE4bi0qJyBhdHRyaWJ1dGVzXG4gICAgICAgICAgY29uc3QgbmFtZSA9IGF0dHIubmFtZS5zbGljZShJMThOX0FUVFJfUFJFRklYLmxlbmd0aCk7XG4gICAgICAgICAgaWYgKGlzVHJ1c3RlZFR5cGVzU2luayhlbGVtZW50Lm5hbWUsIG5hbWUpKSB7XG4gICAgICAgICAgICB0aGlzLl9yZXBvcnRFcnJvcihcbiAgICAgICAgICAgICAgYXR0cixcbiAgICAgICAgICAgICAgYFRyYW5zbGF0aW5nIGF0dHJpYnV0ZSAnJHtuYW1lfScgaXMgZGlzYWxsb3dlZCBmb3Igc2VjdXJpdHkgcmVhc29ucy5gLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXR0cnNNZXRhW25hbWVdID0gYXR0ci52YWx1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gbm9uLWkxOG4gYXR0cmlidXRlc1xuICAgICAgICAgIGF0dHJzLnB1c2goYXR0cik7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gc2V0IGkxOG4gbWV0YSBmb3IgYXR0cmlidXRlc1xuICAgICAgaWYgKE9iamVjdC5rZXlzKGF0dHJzTWV0YSkubGVuZ3RoKSB7XG4gICAgICAgIGZvciAoY29uc3QgYXR0ciBvZiBhdHRycykge1xuICAgICAgICAgIGNvbnN0IG1ldGEgPSBhdHRyc01ldGFbYXR0ci5uYW1lXTtcbiAgICAgICAgICAvLyBkbyBub3QgY3JlYXRlIHRyYW5zbGF0aW9uIGZvciBlbXB0eSBhdHRyaWJ1dGVzXG4gICAgICAgICAgaWYgKG1ldGEgIT09IHVuZGVmaW5lZCAmJiBhdHRyLnZhbHVlKSB7XG4gICAgICAgICAgICBhdHRyLmkxOG4gPSB0aGlzLl9nZW5lcmF0ZUkxOG5NZXNzYWdlKFthdHRyXSwgYXR0ci5pMThuIHx8IG1ldGEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMua2VlcEkxOG5BdHRycykge1xuICAgICAgICAvLyB1cGRhdGUgZWxlbWVudCdzIGF0dHJpYnV0ZXMsXG4gICAgICAgIC8vIGtlZXBpbmcgb25seSBub24taTE4biByZWxhdGVkIG9uZXNcbiAgICAgICAgZWxlbWVudC5hdHRycyA9IGF0dHJzO1xuICAgICAgfVxuICAgIH1cbiAgICBodG1sLnZpc2l0QWxsKHRoaXMsIGVsZW1lbnQuY2hpbGRyZW4sIG1lc3NhZ2UpO1xuICAgIHJldHVybiBlbGVtZW50O1xuICB9XG5cbiAgdmlzaXRFeHBhbnNpb24oZXhwYW5zaW9uOiBodG1sLkV4cGFuc2lvbiwgY3VycmVudE1lc3NhZ2U6IGkxOG4uTWVzc2FnZSB8IG51bGwpOiBhbnkge1xuICAgIGxldCBtZXNzYWdlO1xuICAgIGNvbnN0IG1ldGEgPSBleHBhbnNpb24uaTE4bjtcbiAgICB0aGlzLmhhc0kxOG5NZXRhID0gdHJ1ZTtcbiAgICBpZiAobWV0YSBpbnN0YW5jZW9mIGkxOG4uSWN1UGxhY2Vob2xkZXIpIHtcbiAgICAgIC8vIHNldCBJQ1UgcGxhY2Vob2xkZXIgbmFtZSAoZS5nLiBcIklDVV8xXCIpLFxuICAgICAgLy8gZ2VuZXJhdGVkIHdoaWxlIHByb2Nlc3Npbmcgcm9vdCBlbGVtZW50IGNvbnRlbnRzLFxuICAgICAgLy8gc28gd2UgY2FuIHJlZmVyZW5jZSBpdCB3aGVuIHdlIG91dHB1dCB0cmFuc2xhdGlvblxuICAgICAgY29uc3QgbmFtZSA9IG1ldGEubmFtZTtcbiAgICAgIG1lc3NhZ2UgPSB0aGlzLl9nZW5lcmF0ZUkxOG5NZXNzYWdlKFtleHBhbnNpb25dLCBtZXRhKTtcbiAgICAgIGNvbnN0IGljdSA9IGljdUZyb21JMThuTWVzc2FnZShtZXNzYWdlKTtcbiAgICAgIGljdS5uYW1lID0gbmFtZTtcbiAgICAgIGlmIChjdXJyZW50TWVzc2FnZSAhPT0gbnVsbCkge1xuICAgICAgICAvLyBBbHNvIHVwZGF0ZSB0aGUgcGxhY2Vob2xkZXJUb01lc3NhZ2UgbWFwIHdpdGggdGhpcyBuZXcgbWVzc2FnZVxuICAgICAgICBjdXJyZW50TWVzc2FnZS5wbGFjZWhvbGRlclRvTWVzc2FnZVtuYW1lXSA9IG1lc3NhZ2U7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIElDVSBpcyBhIHRvcCBsZXZlbCBtZXNzYWdlLCB0cnkgdG8gdXNlIG1ldGFkYXRhIGZyb20gY29udGFpbmVyIGVsZW1lbnQgaWYgcHJvdmlkZWQgdmlhXG4gICAgICAvLyBgY29udGV4dGAgYXJndW1lbnQuIE5vdGU6IGNvbnRleHQgbWF5IG5vdCBiZSBhdmFpbGFibGUgZm9yIHN0YW5kYWxvbmUgSUNVcyAod2l0aG91dFxuICAgICAgLy8gd3JhcHBpbmcgZWxlbWVudCksIHNvIGZhbGxiYWNrIHRvIElDVSBtZXRhZGF0YSBpbiB0aGlzIGNhc2UuXG4gICAgICBtZXNzYWdlID0gdGhpcy5fZ2VuZXJhdGVJMThuTWVzc2FnZShbZXhwYW5zaW9uXSwgY3VycmVudE1lc3NhZ2UgfHwgbWV0YSk7XG4gICAgfVxuICAgIGV4cGFuc2lvbi5pMThuID0gbWVzc2FnZTtcbiAgICByZXR1cm4gZXhwYW5zaW9uO1xuICB9XG5cbiAgdmlzaXRUZXh0KHRleHQ6IGh0bWwuVGV4dCk6IGFueSB7XG4gICAgcmV0dXJuIHRleHQ7XG4gIH1cbiAgdmlzaXRBdHRyaWJ1dGUoYXR0cmlidXRlOiBodG1sLkF0dHJpYnV0ZSk6IGFueSB7XG4gICAgcmV0dXJuIGF0dHJpYnV0ZTtcbiAgfVxuICB2aXNpdENvbW1lbnQoY29tbWVudDogaHRtbC5Db21tZW50KTogYW55IHtcbiAgICByZXR1cm4gY29tbWVudDtcbiAgfVxuICB2aXNpdEV4cGFuc2lvbkNhc2UoZXhwYW5zaW9uQ2FzZTogaHRtbC5FeHBhbnNpb25DYXNlKTogYW55IHtcbiAgICByZXR1cm4gZXhwYW5zaW9uQ2FzZTtcbiAgfVxuXG4gIHZpc2l0QmxvY2soYmxvY2s6IGh0bWwuQmxvY2ssIGNvbnRleHQ6IGFueSkge1xuICAgIGh0bWwudmlzaXRBbGwodGhpcywgYmxvY2suY2hpbGRyZW4sIGNvbnRleHQpO1xuICAgIHJldHVybiBibG9jaztcbiAgfVxuXG4gIHZpc2l0QmxvY2tQYXJhbWV0ZXIocGFyYW1ldGVyOiBodG1sLkJsb2NrUGFyYW1ldGVyLCBjb250ZXh0OiBhbnkpIHtcbiAgICByZXR1cm4gcGFyYW1ldGVyO1xuICB9XG5cbiAgdmlzaXRMZXREZWNsYXJhdGlvbihkZWNsOiBodG1sLkxldERlY2xhcmF0aW9uLCBjb250ZXh0OiBhbnkpIHtcbiAgICByZXR1cm4gZGVjbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBQYXJzZSB0aGUgZ2VuZXJhbCBmb3JtIGBtZXRhYCBwYXNzZWQgaW50byBleHRyYWN0IHRoZSBleHBsaWNpdCBtZXRhZGF0YSBuZWVkZWQgdG8gY3JlYXRlIGFcbiAgICogYE1lc3NhZ2VgLlxuICAgKlxuICAgKiBUaGVyZSBhcmUgdGhyZWUgcG9zc2liaWxpdGllcyBmb3IgdGhlIGBtZXRhYCB2YXJpYWJsZVxuICAgKiAxKSBhIHN0cmluZyBmcm9tIGFuIGBpMThuYCB0ZW1wbGF0ZSBhdHRyaWJ1dGU6IHBhcnNlIGl0IHRvIGV4dHJhY3QgdGhlIG1ldGFkYXRhIHZhbHVlcy5cbiAgICogMikgYSBgTWVzc2FnZWAgZnJvbSBhIHByZXZpb3VzIHByb2Nlc3NpbmcgcGFzczogcmV1c2UgdGhlIG1ldGFkYXRhIHZhbHVlcyBpbiB0aGUgbWVzc2FnZS5cbiAgICogNCkgb3RoZXI6IGlnbm9yZSB0aGlzIGFuZCBqdXN0IHByb2Nlc3MgdGhlIG1lc3NhZ2UgbWV0YWRhdGEgYXMgbm9ybWFsXG4gICAqXG4gICAqIEBwYXJhbSBtZXRhIHRoZSBidWNrZXQgdGhhdCBob2xkcyBpbmZvcm1hdGlvbiBhYm91dCB0aGUgbWVzc2FnZVxuICAgKiBAcmV0dXJucyB0aGUgcGFyc2VkIG1ldGFkYXRhLlxuICAgKi9cbiAgcHJpdmF0ZSBfcGFyc2VNZXRhZGF0YShtZXRhOiBzdHJpbmcgfCBpMThuLkkxOG5NZXRhKTogSTE4bk1ldGEge1xuICAgIHJldHVybiB0eXBlb2YgbWV0YSA9PT0gJ3N0cmluZydcbiAgICAgID8gcGFyc2VJMThuTWV0YShtZXRhKVxuICAgICAgOiBtZXRhIGluc3RhbmNlb2YgaTE4bi5NZXNzYWdlXG4gICAgICAgID8gbWV0YVxuICAgICAgICA6IHt9O1xuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIChvciByZXN0b3JlKSBtZXNzYWdlIGlkIGlmIG5vdCBzcGVjaWZpZWQgYWxyZWFkeS5cbiAgICovXG4gIHByaXZhdGUgX3NldE1lc3NhZ2VJZChtZXNzYWdlOiBpMThuLk1lc3NhZ2UsIG1ldGE6IHN0cmluZyB8IGkxOG4uSTE4bk1ldGEpOiB2b2lkIHtcbiAgICBpZiAoIW1lc3NhZ2UuaWQpIHtcbiAgICAgIG1lc3NhZ2UuaWQgPVxuICAgICAgICAobWV0YSBpbnN0YW5jZW9mIGkxOG4uTWVzc2FnZSAmJiBtZXRhLmlkKSB8fFxuICAgICAgICBkZWNpbWFsRGlnZXN0KG1lc3NhZ2UsIC8qIHByZXNlcnZlUGxhY2Vob2xkZXJzICovIHRoaXMucHJlc2VydmVTaWduaWZpY2FudFdoaXRlc3BhY2UpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgdGhlIGBtZXNzYWdlYCB3aXRoIGEgYGxlZ2FjeUlkYCBpZiBuZWNlc3NhcnkuXG4gICAqXG4gICAqIEBwYXJhbSBtZXNzYWdlIHRoZSBtZXNzYWdlIHdob3NlIGxlZ2FjeSBpZCBzaG91bGQgYmUgc2V0XG4gICAqIEBwYXJhbSBtZXRhIGluZm9ybWF0aW9uIGFib3V0IHRoZSBtZXNzYWdlIGJlaW5nIHByb2Nlc3NlZFxuICAgKi9cbiAgcHJpdmF0ZSBfc2V0TGVnYWN5SWRzKG1lc3NhZ2U6IGkxOG4uTWVzc2FnZSwgbWV0YTogc3RyaW5nIHwgaTE4bi5JMThuTWV0YSk6IHZvaWQge1xuICAgIGlmICh0aGlzLmVuYWJsZUkxOG5MZWdhY3lNZXNzYWdlSWRGb3JtYXQpIHtcbiAgICAgIG1lc3NhZ2UubGVnYWN5SWRzID0gW1xuICAgICAgICBjb21wdXRlRGlnZXN0KG1lc3NhZ2UpLFxuICAgICAgICBjb21wdXRlRGVjaW1hbERpZ2VzdChcbiAgICAgICAgICBtZXNzYWdlLFxuICAgICAgICAgIC8qIHByZXNlcnZlUGxhY2Vob2xkZXJzICovIHRoaXMucHJlc2VydmVTaWduaWZpY2FudFdoaXRlc3BhY2UsXG4gICAgICAgICksXG4gICAgICBdO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIG1ldGEgIT09ICdzdHJpbmcnKSB7XG4gICAgICAvLyBUaGlzIG9jY3VycyBpZiB3ZSBhcmUgZG9pbmcgdGhlIDJuZCBwYXNzIGFmdGVyIHdoaXRlc3BhY2UgcmVtb3ZhbCAoc2VlIGBwYXJzZVRlbXBsYXRlKClgIGluXG4gICAgICAvLyBgcGFja2FnZXMvY29tcGlsZXIvc3JjL3JlbmRlcjMvdmlldy90ZW1wbGF0ZS50c2ApLlxuICAgICAgLy8gSW4gdGhhdCBjYXNlIHdlIHdhbnQgdG8gcmV1c2UgdGhlIGxlZ2FjeSBtZXNzYWdlIGdlbmVyYXRlZCBpbiB0aGUgMXN0IHBhc3MgKHNlZVxuICAgICAgLy8gYHNldEkxOG5SZWZzKClgKS5cbiAgICAgIGNvbnN0IHByZXZpb3VzTWVzc2FnZSA9XG4gICAgICAgIG1ldGEgaW5zdGFuY2VvZiBpMThuLk1lc3NhZ2VcbiAgICAgICAgICA/IG1ldGFcbiAgICAgICAgICA6IG1ldGEgaW5zdGFuY2VvZiBpMThuLkljdVBsYWNlaG9sZGVyXG4gICAgICAgICAgICA/IG1ldGEucHJldmlvdXNNZXNzYWdlXG4gICAgICAgICAgICA6IHVuZGVmaW5lZDtcbiAgICAgIG1lc3NhZ2UubGVnYWN5SWRzID0gcHJldmlvdXNNZXNzYWdlID8gcHJldmlvdXNNZXNzYWdlLmxlZ2FjeUlkcyA6IFtdO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3JlcG9ydEVycm9yKG5vZGU6IGh0bWwuTm9kZSwgbXNnOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9lcnJvcnMucHVzaChuZXcgSTE4bkVycm9yKG5vZGUuc291cmNlU3BhbiwgbXNnKSk7XG4gIH1cbn1cblxuLyoqIEkxOG4gc2VwYXJhdG9ycyBmb3IgbWV0YWRhdGEgKiovXG5jb25zdCBJMThOX01FQU5JTkdfU0VQQVJBVE9SID0gJ3wnO1xuY29uc3QgSTE4Tl9JRF9TRVBBUkFUT1IgPSAnQEAnO1xuXG4vKipcbiAqIFBhcnNlcyBpMThuIG1ldGFzIGxpa2U6XG4gKiAgLSBcIkBAaWRcIixcbiAqICAtIFwiZGVzY3JpcHRpb25bQEBpZF1cIixcbiAqICAtIFwibWVhbmluZ3xkZXNjcmlwdGlvbltAQGlkXVwiXG4gKiBhbmQgcmV0dXJucyBhbiBvYmplY3Qgd2l0aCBwYXJzZWQgb3V0cHV0LlxuICpcbiAqIEBwYXJhbSBtZXRhIFN0cmluZyB0aGF0IHJlcHJlc2VudHMgaTE4biBtZXRhXG4gKiBAcmV0dXJucyBPYmplY3Qgd2l0aCBpZCwgbWVhbmluZyBhbmQgZGVzY3JpcHRpb24gZmllbGRzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUkxOG5NZXRhKG1ldGE6IHN0cmluZyA9ICcnKTogSTE4bk1ldGEge1xuICBsZXQgY3VzdG9tSWQ6IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgbGV0IG1lYW5pbmc6IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgbGV0IGRlc2NyaXB0aW9uOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cbiAgbWV0YSA9IG1ldGEudHJpbSgpO1xuICBpZiAobWV0YSkge1xuICAgIGNvbnN0IGlkSW5kZXggPSBtZXRhLmluZGV4T2YoSTE4Tl9JRF9TRVBBUkFUT1IpO1xuICAgIGNvbnN0IGRlc2NJbmRleCA9IG1ldGEuaW5kZXhPZihJMThOX01FQU5JTkdfU0VQQVJBVE9SKTtcbiAgICBsZXQgbWVhbmluZ0FuZERlc2M6IHN0cmluZztcbiAgICBbbWVhbmluZ0FuZERlc2MsIGN1c3RvbUlkXSA9XG4gICAgICBpZEluZGV4ID4gLTEgPyBbbWV0YS5zbGljZSgwLCBpZEluZGV4KSwgbWV0YS5zbGljZShpZEluZGV4ICsgMildIDogW21ldGEsICcnXTtcbiAgICBbbWVhbmluZywgZGVzY3JpcHRpb25dID1cbiAgICAgIGRlc2NJbmRleCA+IC0xXG4gICAgICAgID8gW21lYW5pbmdBbmREZXNjLnNsaWNlKDAsIGRlc2NJbmRleCksIG1lYW5pbmdBbmREZXNjLnNsaWNlKGRlc2NJbmRleCArIDEpXVxuICAgICAgICA6IFsnJywgbWVhbmluZ0FuZERlc2NdO1xuICB9XG5cbiAgcmV0dXJuIHtjdXN0b21JZCwgbWVhbmluZywgZGVzY3JpcHRpb259O1xufVxuXG4vLyBDb252ZXJ0cyBpMThuIG1ldGEgaW5mb3JtYXRpb24gZm9yIGEgbWVzc2FnZSAoaWQsIGRlc2NyaXB0aW9uLCBtZWFuaW5nKVxuLy8gdG8gYSBKc0RvYyBzdGF0ZW1lbnQgZm9ybWF0dGVkIGFzIGV4cGVjdGVkIGJ5IHRoZSBDbG9zdXJlIGNvbXBpbGVyLlxuZXhwb3J0IGZ1bmN0aW9uIGkxOG5NZXRhVG9KU0RvYyhtZXRhOiBJMThuTWV0YSk6IG8uSlNEb2NDb21tZW50IHtcbiAgY29uc3QgdGFnczogby5KU0RvY1RhZ1tdID0gW107XG4gIGlmIChtZXRhLmRlc2NyaXB0aW9uKSB7XG4gICAgdGFncy5wdXNoKHt0YWdOYW1lOiBvLkpTRG9jVGFnTmFtZS5EZXNjLCB0ZXh0OiBtZXRhLmRlc2NyaXB0aW9ufSk7XG4gIH0gZWxzZSB7XG4gICAgLy8gU3VwcHJlc3MgdGhlIEpTQ29tcGlsZXIgd2FybmluZyB0aGF0IGEgYEBkZXNjYCB3YXMgbm90IGdpdmVuIGZvciB0aGlzIG1lc3NhZ2UuXG4gICAgdGFncy5wdXNoKHt0YWdOYW1lOiBvLkpTRG9jVGFnTmFtZS5TdXBwcmVzcywgdGV4dDogJ3ttc2dEZXNjcmlwdGlvbnN9J30pO1xuICB9XG4gIGlmIChtZXRhLm1lYW5pbmcpIHtcbiAgICB0YWdzLnB1c2goe3RhZ05hbWU6IG8uSlNEb2NUYWdOYW1lLk1lYW5pbmcsIHRleHQ6IG1ldGEubWVhbmluZ30pO1xuICB9XG4gIHJldHVybiBvLmpzRG9jQ29tbWVudCh0YWdzKTtcbn1cbiJdfQ==