/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Lexer as ExpressionLexer } from '../expression_parser/lexer';
import { Parser as ExpressionParser } from '../expression_parser/parser';
import * as html from '../ml_parser/ast';
import { getHtmlTagDefinition } from '../ml_parser/html_tags';
import { ParseSourceSpan } from '../parse_util';
import * as i18n from './i18n_ast';
import { PlaceholderRegistry } from './serializers/placeholder';
const _expParser = new ExpressionParser(new ExpressionLexer());
/**
 * Returns a function converting html nodes to an i18n Message given an interpolationConfig
 */
export function createI18nMessageFactory(interpolationConfig, containerBlocks) {
    const visitor = new _I18nVisitor(_expParser, interpolationConfig, containerBlocks);
    return (nodes, meaning, description, customId, visitNodeFn) => visitor.toI18nMessage(nodes, meaning, description, customId, visitNodeFn);
}
function noopVisitNodeFn(_html, i18n) {
    return i18n;
}
class _I18nVisitor {
    constructor(_expressionParser, _interpolationConfig, _containerBlocks) {
        this._expressionParser = _expressionParser;
        this._interpolationConfig = _interpolationConfig;
        this._containerBlocks = _containerBlocks;
    }
    toI18nMessage(nodes, meaning = '', description = '', customId = '', visitNodeFn) {
        const context = {
            isIcu: nodes.length == 1 && nodes[0] instanceof html.Expansion,
            icuDepth: 0,
            placeholderRegistry: new PlaceholderRegistry(),
            placeholderToContent: {},
            placeholderToMessage: {},
            visitNodeFn: visitNodeFn || noopVisitNodeFn,
        };
        const i18nodes = html.visitAll(this, nodes, context);
        return new i18n.Message(i18nodes, context.placeholderToContent, context.placeholderToMessage, meaning, description, customId);
    }
    visitElement(el, context) {
        const children = html.visitAll(this, el.children, context);
        const attrs = {};
        el.attrs.forEach((attr) => {
            // Do not visit the attributes, translatable ones are top-level ASTs
            attrs[attr.name] = attr.value;
        });
        const isVoid = getHtmlTagDefinition(el.name).isVoid;
        const startPhName = context.placeholderRegistry.getStartTagPlaceholderName(el.name, attrs, isVoid);
        context.placeholderToContent[startPhName] = {
            text: el.startSourceSpan.toString(),
            sourceSpan: el.startSourceSpan,
        };
        let closePhName = '';
        if (!isVoid) {
            closePhName = context.placeholderRegistry.getCloseTagPlaceholderName(el.name);
            context.placeholderToContent[closePhName] = {
                text: `</${el.name}>`,
                sourceSpan: el.endSourceSpan ?? el.sourceSpan,
            };
        }
        const node = new i18n.TagPlaceholder(el.name, attrs, startPhName, closePhName, children, isVoid, el.sourceSpan, el.startSourceSpan, el.endSourceSpan);
        return context.visitNodeFn(el, node);
    }
    visitAttribute(attribute, context) {
        const node = attribute.valueTokens === undefined || attribute.valueTokens.length === 1
            ? new i18n.Text(attribute.value, attribute.valueSpan || attribute.sourceSpan)
            : this._visitTextWithInterpolation(attribute.valueTokens, attribute.valueSpan || attribute.sourceSpan, context, attribute.i18n);
        return context.visitNodeFn(attribute, node);
    }
    visitText(text, context) {
        const node = text.tokens.length === 1
            ? new i18n.Text(text.value, text.sourceSpan)
            : this._visitTextWithInterpolation(text.tokens, text.sourceSpan, context, text.i18n);
        return context.visitNodeFn(text, node);
    }
    visitComment(comment, context) {
        return null;
    }
    visitExpansion(icu, context) {
        context.icuDepth++;
        const i18nIcuCases = {};
        const i18nIcu = new i18n.Icu(icu.switchValue, icu.type, i18nIcuCases, icu.sourceSpan);
        icu.cases.forEach((caze) => {
            i18nIcuCases[caze.value] = new i18n.Container(caze.expression.map((node) => node.visit(this, context)), caze.expSourceSpan);
        });
        context.icuDepth--;
        if (context.isIcu || context.icuDepth > 0) {
            // Returns an ICU node when:
            // - the message (vs a part of the message) is an ICU message, or
            // - the ICU message is nested.
            const expPh = context.placeholderRegistry.getUniquePlaceholder(`VAR_${icu.type}`);
            i18nIcu.expressionPlaceholder = expPh;
            context.placeholderToContent[expPh] = {
                text: icu.switchValue,
                sourceSpan: icu.switchValueSourceSpan,
            };
            return context.visitNodeFn(icu, i18nIcu);
        }
        // Else returns a placeholder
        // ICU placeholders should not be replaced with their original content but with the their
        // translations.
        // TODO(vicb): add a html.Node -> i18n.Message cache to avoid having to re-create the msg
        const phName = context.placeholderRegistry.getPlaceholderName('ICU', icu.sourceSpan.toString());
        context.placeholderToMessage[phName] = this.toI18nMessage([icu], '', '', '', undefined);
        const node = new i18n.IcuPlaceholder(i18nIcu, phName, icu.sourceSpan);
        return context.visitNodeFn(icu, node);
    }
    visitExpansionCase(_icuCase, _context) {
        throw new Error('Unreachable code');
    }
    visitBlock(block, context) {
        const children = html.visitAll(this, block.children, context);
        if (this._containerBlocks.has(block.name)) {
            return new i18n.Container(children, block.sourceSpan);
        }
        const parameters = block.parameters.map((param) => param.expression);
        const startPhName = context.placeholderRegistry.getStartBlockPlaceholderName(block.name, parameters);
        const closePhName = context.placeholderRegistry.getCloseBlockPlaceholderName(block.name);
        context.placeholderToContent[startPhName] = {
            text: block.startSourceSpan.toString(),
            sourceSpan: block.startSourceSpan,
        };
        context.placeholderToContent[closePhName] = {
            text: block.endSourceSpan ? block.endSourceSpan.toString() : '}',
            sourceSpan: block.endSourceSpan ?? block.sourceSpan,
        };
        const node = new i18n.BlockPlaceholder(block.name, parameters, startPhName, closePhName, children, block.sourceSpan, block.startSourceSpan, block.endSourceSpan);
        return context.visitNodeFn(block, node);
    }
    visitBlockParameter(_parameter, _context) {
        throw new Error('Unreachable code');
    }
    visitLetDeclaration(decl, context) {
        return null;
    }
    /**
     * Convert, text and interpolated tokens up into text and placeholder pieces.
     *
     * @param tokens The text and interpolated tokens.
     * @param sourceSpan The span of the whole of the `text` string.
     * @param context The current context of the visitor, used to compute and store placeholders.
     * @param previousI18n Any i18n metadata associated with this `text` from a previous pass.
     */
    _visitTextWithInterpolation(tokens, sourceSpan, context, previousI18n) {
        // Return a sequence of `Text` and `Placeholder` nodes grouped in a `Container`.
        const nodes = [];
        // We will only create a container if there are actually interpolations,
        // so this flag tracks that.
        let hasInterpolation = false;
        for (const token of tokens) {
            switch (token.type) {
                case 8 /* TokenType.INTERPOLATION */:
                case 17 /* TokenType.ATTR_VALUE_INTERPOLATION */:
                    hasInterpolation = true;
                    const expression = token.parts[1];
                    const baseName = extractPlaceholderName(expression) || 'INTERPOLATION';
                    const phName = context.placeholderRegistry.getPlaceholderName(baseName, expression);
                    context.placeholderToContent[phName] = {
                        text: token.parts.join(''),
                        sourceSpan: token.sourceSpan,
                    };
                    nodes.push(new i18n.Placeholder(expression, phName, token.sourceSpan));
                    break;
                default:
                    if (token.parts[0].length > 0) {
                        // This token is text or an encoded entity.
                        // If it is following on from a previous text node then merge it into that node
                        // Otherwise, if it is following an interpolation, then add a new node.
                        const previous = nodes[nodes.length - 1];
                        if (previous instanceof i18n.Text) {
                            previous.value += token.parts[0];
                            previous.sourceSpan = new ParseSourceSpan(previous.sourceSpan.start, token.sourceSpan.end, previous.sourceSpan.fullStart, previous.sourceSpan.details);
                        }
                        else {
                            nodes.push(new i18n.Text(token.parts[0], token.sourceSpan));
                        }
                    }
                    break;
            }
        }
        if (hasInterpolation) {
            // Whitespace removal may have invalidated the interpolation source-spans.
            reusePreviousSourceSpans(nodes, previousI18n);
            return new i18n.Container(nodes, sourceSpan);
        }
        else {
            return nodes[0];
        }
    }
}
/**
 * Re-use the source-spans from `previousI18n` metadata for the `nodes`.
 *
 * Whitespace removal can invalidate the source-spans of interpolation nodes, so we
 * reuse the source-span stored from a previous pass before the whitespace was removed.
 *
 * @param nodes The `Text` and `Placeholder` nodes to be processed.
 * @param previousI18n Any i18n metadata for these `nodes` stored from a previous pass.
 */
function reusePreviousSourceSpans(nodes, previousI18n) {
    if (previousI18n instanceof i18n.Message) {
        // The `previousI18n` is an i18n `Message`, so we are processing an `Attribute` with i18n
        // metadata. The `Message` should consist only of a single `Container` that contains the
        // parts (`Text` and `Placeholder`) to process.
        assertSingleContainerMessage(previousI18n);
        previousI18n = previousI18n.nodes[0];
    }
    if (previousI18n instanceof i18n.Container) {
        // The `previousI18n` is a `Container`, which means that this is a second i18n extraction pass
        // after whitespace has been removed from the AST nodes.
        assertEquivalentNodes(previousI18n.children, nodes);
        // Reuse the source-spans from the first pass.
        for (let i = 0; i < nodes.length; i++) {
            nodes[i].sourceSpan = previousI18n.children[i].sourceSpan;
        }
    }
}
/**
 * Asserts that the `message` contains exactly one `Container` node.
 */
function assertSingleContainerMessage(message) {
    const nodes = message.nodes;
    if (nodes.length !== 1 || !(nodes[0] instanceof i18n.Container)) {
        throw new Error('Unexpected previous i18n message - expected it to consist of only a single `Container` node.');
    }
}
/**
 * Asserts that the `previousNodes` and `node` collections have the same number of elements and
 * corresponding elements have the same node type.
 */
function assertEquivalentNodes(previousNodes, nodes) {
    if (previousNodes.length !== nodes.length) {
        throw new Error('The number of i18n message children changed between first and second pass.');
    }
    if (previousNodes.some((node, i) => nodes[i].constructor !== node.constructor)) {
        throw new Error('The types of the i18n message children changed between first and second pass.');
    }
}
const _CUSTOM_PH_EXP = /\/\/[\s\S]*i18n[\s\S]*\([\s\S]*ph[\s\S]*=[\s\S]*("|')([\s\S]*?)\1[\s\S]*\)/g;
function extractPlaceholderName(input) {
    return input.split(_CUSTOM_PH_EXP)[2];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaTE4bl9wYXJzZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvaTE4bi9pMThuX3BhcnNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsS0FBSyxJQUFJLGVBQWUsRUFBQyxNQUFNLDRCQUE0QixDQUFDO0FBQ3BFLE9BQU8sRUFBQyxNQUFNLElBQUksZ0JBQWdCLEVBQUMsTUFBTSw2QkFBNkIsQ0FBQztBQUN2RSxPQUFPLEtBQUssSUFBSSxNQUFNLGtCQUFrQixDQUFDO0FBRXpDLE9BQU8sRUFBQyxvQkFBb0IsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBRTVELE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFOUMsT0FBTyxLQUFLLElBQUksTUFBTSxZQUFZLENBQUM7QUFDbkMsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0sMkJBQTJCLENBQUM7QUFFOUQsTUFBTSxVQUFVLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLGVBQWUsRUFBRSxDQUFDLENBQUM7QUFjL0Q7O0dBRUc7QUFDSCxNQUFNLFVBQVUsd0JBQXdCLENBQ3RDLG1CQUF3QyxFQUN4QyxlQUE0QjtJQUU1QixNQUFNLE9BQU8sR0FBRyxJQUFJLFlBQVksQ0FBQyxVQUFVLEVBQUUsbUJBQW1CLEVBQUUsZUFBZSxDQUFDLENBQUM7SUFDbkYsT0FBTyxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsRUFBRSxDQUM1RCxPQUFPLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxXQUFXLENBQUMsQ0FBQztBQUM5RSxDQUFDO0FBV0QsU0FBUyxlQUFlLENBQUMsS0FBZ0IsRUFBRSxJQUFlO0lBQ3hELE9BQU8sSUFBSSxDQUFDO0FBQ2Qs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LENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxLQUFLLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDO1FBQy9FLE1BQU0sSUFBSSxLQUFLLENBQ2IsK0VBQStFLENBQ2hGLENBQUM7SUFDSixDQUFDO0FBQ0gsQ0FBQztBQUVELE1BQU0sY0FBYyxHQUNsQiw2RUFBNkUsQ0FBQztBQUVoRixTQUFTLHNCQUFzQixDQUFDLEtBQWE7SUFDM0MsT0FBTyxLQUFLLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3hDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtMZXhlciBhcyBFeHByZXNzaW9uTGV4ZXJ9IGZyb20gJy4uL2V4cHJlc3Npb25fcGFyc2VyL2xleGVyJztcbmltcG9ydCB7UGFyc2VyIGFzIEV4cHJlc3Npb25QYXJzZXJ9IGZyb20gJy4uL2V4cHJlc3Npb25fcGFyc2VyL3BhcnNlcic7XG5pbXBvcnQgKiBhcyBodG1sIGZyb20gJy4uL21sX3BhcnNlci9hc3QnO1xuaW1wb3J0IHtJbnRlcnBvbGF0aW9uQ29uZmlnfSBmcm9tICcuLi9tbF9wYXJzZXIvZGVmYXVsdHMnO1xuaW1wb3J0IHtnZXRIdG1sVGFnRGVmaW5pdGlvbn0gZnJvbSAnLi4vbWxfcGFyc2VyL2h0bWxfdGFncyc7XG5pbXBvcnQge0ludGVycG9sYXRlZEF0dHJpYnV0ZVRva2VuLCBJbnRlcnBvbGF0ZWRUZXh0VG9rZW4sIFRva2VuVHlwZX0gZnJvbSAnLi4vbWxfcGFyc2VyL3Rva2Vucyc7XG5pbXBvcnQge1BhcnNlU291cmNlU3Bhbn0gZnJvbSAnLi4vcGFyc2VfdXRpbCc7XG5cbmltcG9ydCAqIGFzIGkxOG4gZnJvbSAnLi9pMThuX2FzdCc7XG5pbXBvcnQge1BsYWNlaG9sZGVyUmVnaXN0cnl9IGZyb20gJy4vc2VyaWFsaXplcnMvcGxhY2Vob2xkZXInO1xuXG5jb25zdCBfZXhwUGFyc2VyID0gbmV3IEV4cHJlc3Npb25QYXJzZXIobmV3IEV4cHJlc3Npb25MZXhlcigpKTtcblxuZXhwb3J0IHR5cGUgVmlzaXROb2RlRm4gPSAoaHRtbDogaHRtbC5Ob2RlLCBpMThuOiBpMThuLk5vZGUpID0+IGkxOG4uTm9kZTtcblxuZXhwb3J0IGludGVyZmFjZSBJMThuTWVzc2FnZUZhY3Rvcnkge1xuICAoXG4gICAgbm9kZXM6IGh0bWwuTm9kZVtdLFxuICAgIG1lYW5pbmc6IHN0cmluZyB8IHVuZGVmaW5lZCxcbiAgICBkZXNjcmlwdGlvbjogc3RyaW5nIHwgdW5kZWZpbmVkLFxuICAgIGN1c3RvbUlkOiBzdHJpbmcgfCB1bmRlZmluZWQsXG4gICAgdmlzaXROb2RlRm4/OiBWaXNpdE5vZGVGbixcbiAgKTogaTE4bi5NZXNzYWdlO1xufVxuXG4vKipcbiAqIFJldHVybnMgYSBmdW5jdGlvbiBjb252ZXJ0aW5nIGh0bWwgbm9kZXMgdG8gYW4gaTE4biBNZXNzYWdlIGdpdmVuIGFuIGludGVycG9sYXRpb25Db25maWdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUkxOG5NZXNzYWdlRmFjdG9yeShcbiAgaW50ZXJwb2xhdGlvbkNvbmZpZzogSW50ZXJwb2xhdGlvbkNvbmZpZyxcbiAgY29udGFpbmVyQmxvY2tzOiBTZXQ8c3RyaW5nPixcbik6IEkxOG5NZXNzYWdlRmFjdG9yeSB7XG4gIGNvbnN0IHZpc2l0b3IgPSBuZXcgX0kxOG5WaXNpdG9yKF9leHBQYXJzZXIsIGludGVycG9sYXRpb25Db25maWcsIGNvbnRhaW5lckJsb2Nrcyk7XG4gIHJldHVybiAobm9kZXMsIG1lYW5pbmcsIGRlc2NyaXB0aW9uLCBjdXN0b21JZCwgdmlzaXROb2RlRm4pID0+XG4gICAgdmlzaXRvci50b0kxOG5NZXNzYWdlKG5vZGVzLCBtZWFuaW5nLCBkZXNjcmlwdGlvbiwgY3VzdG9tSWQsIHZpc2l0Tm9kZUZuKTtcbn1cblxuaW50ZXJmYWNlIEkxOG5NZXNzYWdlVmlzaXRvckNvbnRleHQge1xuICBpc0ljdTogYm9vbGVhbjtcbiAgaWN1RGVwdGg6IG51bWJlcjtcbiAgcGxhY2Vob2xkZXJSZWdpc3RyeTogUGxhY2Vob2xkZXJSZWdpc3RyeTtcbiAgcGxhY2Vob2xkZXJUb0NvbnRlbnQ6IHtbcGhOYW1lOiBzdHJpbmddOiBpMThuLk1lc3NhZ2VQbGFjZWhvbGRlcn07XG4gIHBsYWNlaG9sZGVyVG9NZXNzYWdlOiB7W3BoTmFtZTogc3RyaW5nXTogaTE4bi5NZXNzYWdlfTtcbiAgdmlzaXROb2RlRm46IFZpc2l0Tm9kZUZuO1xufVxuXG5mdW5jdGlvbiBub29wVmlzaXROb2RlRm4oX2h0bWw6IGh0bWwuTm9kZSwgaTE4bjogaTE4bi5Ob2RlKTogaTE4bi5Ob2RlIHtcbiAgcmV0dXJuIGkxOG47XG59XG5cbmNsYXNzIF9JMThuVmlzaXRvciBpbXBsZW1lbnRzIGh0bWwuVmlzaXRvciB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgX2V4cHJlc3Npb25QYXJzZXI6IEV4cHJlc3Npb25QYXJzZXIsXG4gICAgcHJpdmF0ZSBfaW50ZXJwb2xhdGlvbkNvbmZpZzogSW50ZXJwb2xhdGlvbkNvbmZpZyxcbiAgICBwcml2YXRlIF9jb250YWluZXJCbG9ja3M6IFNldDxzdHJpbmc+LFxuICApIHt9XG5cbiAgcHVibGljIHRvSTE4bk1lc3NhZ2UoXG4gICAgbm9kZXM6IGh0bWwuTm9kZVtdLFxuICAgIG1lYW5pbmcgPSAnJyxcbiAgICBkZXNjcmlwdGlvbiA9ICcnLFxuICAgIGN1c3RvbUlkID0gJycsXG4gICAgdmlzaXROb2RlRm46IFZpc2l0Tm9kZUZuIHwgdW5kZWZpbmVkLFxuICApOiBpMThuLk1lc3NhZ2Uge1xuICAgIGNvbnN0IGNvbnRleHQ6IEkxOG5NZXNzYWdlVmlzaXRvckNvbnRleHQgPSB7XG4gICAgICBpc0ljdTogbm9kZXMubGVuZ3RoID09IDEgJiYgbm9kZXNbMF0gaW5zdGFuY2VvZiBodG1sLkV4cGFuc2lvbixcbiAgICAgIGljdURlcHRoOiAwLFxuICAgICAgcGxhY2Vob2xkZXJSZWdpc3RyeTogbmV3IFBsYWNlaG9sZGVyUmVnaXN0cnkoKSxcbiAgICAgIHBsYWNlaG9sZGVyVG9Db250ZW50OiB7fSxcbiAgICAgIHBsYWNlaG9sZGVyVG9NZXNzYWdlOiB7fSxcbiAgICAgIHZpc2l0Tm9kZUZuOiB2aXNpdE5vZGVGbiB8fCBub29wVmlzaXROb2RlRm4sXG4gICAgfTtcblxuICAgIGNvbnN0IGkxOG5vZGVzOiBpMThuLk5vZGVbXSA9IGh0bWwudmlzaXRBbGwodGhpcywgbm9kZXMsIGNvbnRleHQpO1xuXG4gICAgcmV0dXJuIG5ldyBpMThuLk1lc3NhZ2UoXG4gICAgICBpMThub2RlcyxcbiAgICAgIGNvbnRleHQucGxhY2Vob2xkZXJUb0NvbnRlbnQsXG4gICAgICBjb250ZXh0LnBsYWNlaG9sZGVyVG9NZXNzYWdlLFxuICAgICAgbWVhbmluZyxcbiAgICAgIGRlc2NyaXB0aW9uLFxuICAgICAgY3VzdG9tSWQsXG4gICAgKTtcbiAgfVxuXG4gIHZpc2l0RWxlbWVudChlbDogaHRtbC5FbGVtZW50LCBjb250ZXh0OiBJMThuTWVzc2FnZVZpc2l0b3JDb250ZXh0KTogaTE4bi5Ob2RlIHtcbiAgICBjb25zdCBjaGlsZHJlbiA9IGh0bWwudmlzaXRBbGwodGhpcywgZWwuY2hpbGRyZW4sIGNvbnRleHQpO1xuICAgIGNvbnN0IGF0dHJzOiB7W2s6IHN0cmluZ106IHN0cmluZ30gPSB7fTtcbiAgICBlbC5hdHRycy5mb3JFYWNoKChhdHRyKSA9PiB7XG4gICAgICAvLyBEbyBub3QgdmlzaXQgdGhlIGF0dHJpYnV0ZXMsIHRyYW5zbGF0YWJsZSBvbmVzIGFyZSB0b3AtbGV2ZWwgQVNUc1xuICAgICAgYXR0cnNbYXR0ci5uYW1lXSA9IGF0dHIudmFsdWU7XG4gICAgfSk7XG5cbiAgICBjb25zdCBpc1ZvaWQ6IGJvb2xlYW4gPSBnZXRIdG1sVGFnRGVmaW5pdGlvbihlbC5uYW1lKS5pc1ZvaWQ7XG4gICAgY29uc3Qgc3RhcnRQaE5hbWUgPSBjb250ZXh0LnBsYWNlaG9sZGVyUmVnaXN0cnkuZ2V0U3RhcnRUYWdQbGFjZWhvbGRlck5hbWUoXG4gICAgICBlbC5uYW1lLFxuICAgICAgYXR0cnMsXG4gICAgICBpc1ZvaWQsXG4gICAgKTtcbiAgICBjb250ZXh0LnBsYWNlaG9sZGVyVG9Db250ZW50W3N0YXJ0UGhOYW1lXSA9IHtcbiAgICAgIHRleHQ6IGVsLnN0YXJ0U291cmNlU3Bhbi50b1N0cmluZygpLFxuICAgICAgc291cmNlU3BhbjogZWwuc3RhcnRTb3VyY2VTcGFuLFxuICAgIH07XG5cbiAgICBsZXQgY2xvc2VQaE5hbWUgPSAnJztcblxuICAgIGlmICghaXNWb2lkKSB7XG4gICAgICBjbG9zZVBoTmFtZSA9IGNvbnRleHQucGxhY2Vob2xkZXJSZWdpc3RyeS5nZXRDbG9zZVRhZ1BsYWNlaG9sZGVyTmFtZShlbC5uYW1lKTtcbiAgICAgIGNvbnRleHQucGxhY2Vob2xkZXJUb0NvbnRlbnRbY2xvc2VQaE5hbWVdID0ge1xuICAgICAgICB0ZXh0OiBgPC8ke2VsLm5hbWV9PmAsXG4gICAgICAgIHNvdXJjZVNwYW46IGVsLmVuZFNvdXJjZVNwYW4gPz8gZWwuc291cmNlU3BhbixcbiAgICAgIH07XG4gICAgfVxuXG4gICAgY29uc3Qgbm9kZSA9IG5ldyBpMThuLlRhZ1BsYWNlaG9sZGVyKFxuICAgICAgZWwubmFtZSxcbiAgICAgIGF0dHJzLFxuICAgICAgc3RhcnRQaE5hbWUsXG4gICAgICBjbG9zZVBoTmFtZSxcbiAgICAgIGNoaWxkcmVuLFxuICAgICAgaXNWb2lkLFxuICAgICAgZWwuc291cmNlU3BhbixcbiAgICAgIGVsLnN0YXJ0U291cmNlU3BhbixcbiAgICAgIGVsLmVuZFNvdXJjZVNwYW4sXG4gICAgKTtcbiAgICByZXR1cm4gY29udGV4dC52aXNpdE5vZGVGbihlbCwgbm9kZSk7XG4gIH1cblxuICB2aXNpdEF0dHJpYnV0ZShhdHRyaWJ1dGU6IGh0bWwuQXR0cmlidXRlLCBjb250ZXh0OiBJMThuTWVzc2FnZVZpc2l0b3JDb250ZXh0KTogaTE4bi5Ob2RlIHtcbiAgICBjb25zdCBub2RlID1cbiAgICAgIGF0dHJpYnV0ZS52YWx1ZVRva2VucyA9PT0gdW5kZWZpbmVkIHx8IGF0dHJpYnV0ZS52YWx1ZVRva2Vucy5sZW5ndGggPT09IDFcbiAgICAgICAgPyBuZXcgaTE4bi5UZXh0KGF0dHJpYnV0ZS52YWx1ZSwgYXR0cmlidXRlLnZhbHVlU3BhbiB8fCBhdHRyaWJ1dGUuc291cmNlU3BhbilcbiAgICAgICAgOiB0aGlzLl92aXNpdFRleHRXaXRoSW50ZXJwb2xhdGlvbihcbiAgICAgICAgICAgIGF0dHJpYnV0ZS52YWx1ZVRva2VucyxcbiAgICAgICAgICAgIGF0dHJpYnV0ZS52YWx1ZVNwYW4gfHwgYXR0cmlidXRlLnNvdXJjZVNwYW4sXG4gICAgICAgICAgICBjb250ZXh0LFxuICAgICAgICAgICAgYXR0cmlidXRlLmkxOG4sXG4gICAgICAgICAgKTtcbiAgICByZXR1cm4gY29udGV4dC52aXNpdE5vZGVGbihhdHRyaWJ1dGUsIG5vZGUpO1xuICB9XG5cbiAgdmlzaXRUZXh0KHRleHQ6IGh0bWwuVGV4dCwgY29udGV4dDogSTE4bk1lc3NhZ2VWaXNpdG9yQ29udGV4dCk6IGkxOG4uTm9kZSB7XG4gICAgY29uc3Qgbm9kZSA9XG4gICAgICB0ZXh0LnRva2Vucy5sZW5ndGggPT09IDFcbiAgICAgICAgPyBuZXcgaTE4bi5UZXh0KHRleHQudmFsdWUsIHRleHQuc291cmNlU3BhbilcbiAgICAgICAgOiB0aGlzLl92aXNpdFRleHRXaXRoSW50ZXJwb2xhdGlvbih0ZXh0LnRva2VucywgdGV4dC5zb3VyY2VTcGFuLCBjb250ZXh0LCB0ZXh0LmkxOG4pO1xuICAgIHJldHVybiBjb250ZXh0LnZpc2l0Tm9kZUZuKHRleHQsIG5vZGUpO1xuICB9XG5cbiAgdmlzaXRDb21tZW50KGNvbW1lbnQ6IGh0bWwuQ29tbWVudCwgY29udGV4dDogSTE4bk1lc3NhZ2VWaXNpdG9yQ29udGV4dCk6IGkxOG4uTm9kZSB8IG51bGwge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgdmlzaXRFeHBhbnNpb24oaWN1OiBodG1sLkV4cGFuc2lvbiwgY29udGV4dDogSTE4bk1lc3NhZ2VWaXNpdG9yQ29udGV4dCk6IGkxOG4uTm9kZSB7XG4gICAgY29udGV4dC5pY3VEZXB0aCsrO1xuICAgIGNvbnN0IGkxOG5JY3VDYXNlczoge1trOiBzdHJpbmddOiBpMThuLk5vZGV9ID0ge307XG4gICAgY29uc3QgaTE4bkljdSA9IG5ldyBpMThuLkljdShpY3Uuc3dpdGNoVmFsdWUsIGljdS50eXBlLCBpMThuSWN1Q2FzZXMsIGljdS5zb3VyY2VTcGFuKTtcbiAgICBpY3UuY2FzZXMuZm9yRWFjaCgoY2F6ZSk6IHZvaWQgPT4ge1xuICAgICAgaTE4bkljdUNhc2VzW2NhemUudmFsdWVdID0gbmV3IGkxOG4uQ29udGFpbmVyKFxuICAgICAgICBjYXplLmV4cHJlc3Npb24ubWFwKChub2RlKSA9PiBub2RlLnZpc2l0KHRoaXMsIGNvbnRleHQpKSxcbiAgICAgICAgY2F6ZS5leHBTb3VyY2VTcGFuLFxuICAgICAgKTtcbiAgICB9KTtcbiAgICBjb250ZXh0LmljdURlcHRoLS07XG5cbiAgICBpZiAoY29udGV4dC5pc0ljdSB8fCBjb250ZXh0LmljdURlcHRoID4gMCkge1xuICAgICAgLy8gUmV0dXJucyBhbiBJQ1Ugbm9kZSB3aGVuOlxuICAgICAgLy8gLSB0aGUgbWVzc2FnZSAodnMgYSBwYXJ0IG9mIHRoZSBtZXNzYWdlKSBpcyBhbiBJQ1UgbWVzc2FnZSwgb3JcbiAgICAgIC8vIC0gdGhlIElDVSBtZXNzYWdlIGlzIG5lc3RlZC5cbiAgICAgIGNvbnN0IGV4cFBoID0gY29udGV4dC5wbGFjZWhvbGRlclJlZ2lzdHJ5LmdldFVuaXF1ZVBsYWNlaG9sZGVyKGBWQVJfJHtpY3UudHlwZX1gKTtcbiAgICAgIGkxOG5JY3UuZXhwcmVzc2lvblBsYWNlaG9sZGVyID0gZXhwUGg7XG4gICAgICBjb250ZXh0LnBsYWNlaG9sZGVyVG9Db250ZW50W2V4cFBoXSA9IHtcbiAgICAgICAgdGV4dDogaWN1LnN3aXRjaFZhbHVlLFxuICAgICAgICBzb3VyY2VTcGFuOiBpY3Uuc3dpdGNoVmFsdWVTb3VyY2VTcGFuLFxuICAgICAgfTtcbiAgICAgIHJldHVybiBjb250ZXh0LnZpc2l0Tm9kZUZuKGljdSwgaTE4bkljdSk7XG4gICAgfVxuXG4gICAgLy8gRWxzZSByZXR1cm5zIGEgcGxhY2Vob2xkZXJcbiAgICAvLyBJQ1UgcGxhY2Vob2xkZXJzIHNob3VsZCBub3QgYmUgcmVwbGFjZWQgd2l0aCB0aGVpciBvcmlnaW5hbCBjb250ZW50IGJ1dCB3aXRoIHRoZSB0aGVpclxuICAgIC8vIHRyYW5zbGF0aW9ucy5cbiAgICAvLyBUT0RPKHZpY2IpOiBhZGQgYSBodG1sLk5vZGUgLT4gaTE4bi5NZXNzYWdlIGNhY2hlIHRvIGF2b2lkIGhhdmluZyB0byByZS1jcmVhdGUgdGhlIG1zZ1xuICAgIGNvbnN0IHBoTmFtZSA9IGNvbnRleHQucGxhY2Vob2xkZXJSZWdpc3RyeS5nZXRQbGFjZWhvbGRlck5hbWUoJ0lDVScsIGljdS5zb3VyY2VTcGFuLnRvU3RyaW5nKCkpO1xuICAgIGNvbnRleHQucGxhY2Vob2xkZXJUb01lc3NhZ2VbcGhOYW1lXSA9IHRoaXMudG9JMThuTWVzc2FnZShbaWN1XSwgJycsICcnLCAnJywgdW5kZWZpbmVkKTtcbiAgICBjb25zdCBub2RlID0gbmV3IGkxOG4uSWN1UGxhY2Vob2xkZXIoaTE4bkljdSwgcGhOYW1lLCBpY3Uuc291cmNlU3Bhbik7XG4gICAgcmV0dXJuIGNvbnRleHQudmlzaXROb2RlRm4oaWN1LCBub2RlKTtcbiAgfVxuXG4gIHZpc2l0RXhwYW5zaW9uQ2FzZShfaWN1Q2FzZTogaHRtbC5FeHBhbnNpb25DYXNlLCBfY29udGV4dDogSTE4bk1lc3NhZ2VWaXNpdG9yQ29udGV4dCk6IGkxOG4uTm9kZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdVbnJlYWNoYWJsZSBjb2RlJyk7XG4gIH1cblxuICB2aXNpdEJsb2NrKGJsb2NrOiBodG1sLkJsb2NrLCBjb250ZXh0OiBJMThuTWVzc2FnZVZpc2l0b3JDb250ZXh0KSB7XG4gICAgY29uc3QgY2hpbGRyZW4gPSBodG1sLnZpc2l0QWxsKHRoaXMsIGJsb2NrLmNoaWxkcmVuLCBjb250ZXh0KTtcblxuICAgIGlmICh0aGlzLl9jb250YWluZXJCbG9ja3MuaGFzKGJsb2NrLm5hbWUpKSB7XG4gICAgICByZXR1cm4gbmV3IGkxOG4uQ29udGFpbmVyKGNoaWxkcmVuLCBibG9jay5zb3VyY2VTcGFuKTtcbiAgICB9XG5cbiAgICBjb25zdCBwYXJhbWV0ZXJzID0gYmxvY2sucGFyYW1ldGVycy5tYXAoKHBhcmFtKSA9PiBwYXJhbS5leHByZXNzaW9uKTtcbiAgICBjb25zdCBzdGFydFBoTmFtZSA9IGNvbnRleHQucGxhY2Vob2xkZXJSZWdpc3RyeS5nZXRTdGFydEJsb2NrUGxhY2Vob2xkZXJOYW1lKFxuICAgICAgYmxvY2submFtZSxcbiAgICAgIHBhcmFtZXRlcnMsXG4gICAgKTtcbiAgICBjb25zdCBjbG9zZVBoTmFtZSA9IGNvbnRleHQucGxhY2Vob2xkZXJSZWdpc3RyeS5nZXRDbG9zZUJsb2NrUGxhY2Vob2xkZXJOYW1lKGJsb2NrLm5hbWUpO1xuXG4gICAgY29udGV4dC5wbGFjZWhvbGRlclRvQ29udGVudFtzdGFydFBoTmFtZV0gPSB7XG4gICAgICB0ZXh0OiBibG9jay5zdGFydFNvdXJjZVNwYW4udG9TdHJpbmcoKSxcbiAgICAgIHNvdXJjZVNwYW46IGJsb2NrLnN0YXJ0U291cmNlU3BhbixcbiAgICB9O1xuXG4gICAgY29udGV4dC5wbGFjZWhvbGRlclRvQ29udGVudFtjbG9zZVBoTmFtZV0gPSB7XG4gICAgICB0ZXh0OiBibG9jay5lbmRTb3VyY2VTcGFuID8gYmxvY2suZW5kU291cmNlU3Bhbi50b1N0cmluZygpIDogJ30nLFxuICAgICAgc291cmNlU3BhbjogYmxvY2suZW5kU291cmNlU3BhbiA/PyBibG9jay5zb3VyY2VTcGFuLFxuICAgIH07XG5cbiAgICBjb25zdCBub2RlID0gbmV3IGkxOG4uQmxvY2tQbGFjZWhvbGRlcihcbiAgICAgIGJsb2NrLm5hbWUsXG4gICAgICBwYXJhbWV0ZXJzLFxuICAgICAgc3RhcnRQaE5hbWUsXG4gICAgICBjbG9zZVBoTmFtZSxcbiAgICAgIGNoaWxkcmVuLFxuICAgICAgYmxvY2suc291cmNlU3BhbixcbiAgICAgIGJsb2NrLnN0YXJ0U291cmNlU3BhbixcbiAgICAgIGJsb2NrLmVuZFNvdXJjZVNwYW4sXG4gICAgKTtcbiAgICByZXR1cm4gY29udGV4dC52aXNpdE5vZGVGbihibG9jaywgbm9kZSk7XG4gIH1cblxuICB2aXNpdEJsb2NrUGFyYW1ldGVyKF9wYXJhbWV0ZXI6IGh0bWwuQmxvY2tQYXJhbWV0ZXIsIF9jb250ZXh0OiBJMThuTWVzc2FnZVZpc2l0b3JDb250ZXh0KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdVbnJlYWNoYWJsZSBjb2RlJyk7XG4gIH1cblxuICB2aXNpdExldERlY2xhcmF0aW9uKGRlY2w6IGh0bWwuTGV0RGVjbGFyYXRpb24sIGNvbnRleHQ6IGFueSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnQsIHRleHQgYW5kIGludGVycG9sYXRlZCB0b2tlbnMgdXAgaW50byB0ZXh0IGFuZCBwbGFjZWhvbGRlciBwaWVjZXMuXG4gICAqXG4gICAqIEBwYXJhbSB0b2tlbnMgVGhlIHRleHQgYW5kIGludGVycG9sYXRlZCB0b2tlbnMuXG4gICAqIEBwYXJhbSBzb3VyY2VTcGFuIFRoZSBzcGFuIG9mIHRoZSB3aG9sZSBvZiB0aGUgYHRleHRgIHN0cmluZy5cbiAgICogQHBhcmFtIGNvbnRleHQgVGhlIGN1cnJlbnQgY29udGV4dCBvZiB0aGUgdmlzaXRvciwgdXNlZCB0byBjb21wdXRlIGFuZCBzdG9yZSBwbGFjZWhvbGRlcnMuXG4gICAqIEBwYXJhbSBwcmV2aW91c0kxOG4gQW55IGkxOG4gbWV0YWRhdGEgYXNzb2NpYXRlZCB3aXRoIHRoaXMgYHRleHRgIGZyb20gYSBwcmV2aW91cyBwYXNzLlxuICAgKi9cbiAgcHJpdmF0ZSBfdmlzaXRUZXh0V2l0aEludGVycG9sYXRpb24oXG4gICAgdG9rZW5zOiAoSW50ZXJwb2xhdGVkVGV4dFRva2VuIHwgSW50ZXJwb2xhdGVkQXR0cmlidXRlVG9rZW4pW10sXG4gICAgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgIGNvbnRleHQ6IEkxOG5NZXNzYWdlVmlzaXRvckNvbnRleHQsXG4gICAgcHJldmlvdXNJMThuOiBpMThuLkkxOG5NZXRhIHwgdW5kZWZpbmVkLFxuICApOiBpMThuLk5vZGUge1xuICAgIC8vIFJldHVybiBhIHNlcXVlbmNlIG9mIGBUZXh0YCBhbmQgYFBsYWNlaG9sZGVyYCBub2RlcyBncm91cGVkIGluIGEgYENvbnRhaW5lcmAuXG4gICAgY29uc3Qgbm9kZXM6IGkxOG4uTm9kZVtdID0gW107XG4gICAgLy8gV2Ugd2lsbCBvbmx5IGNyZWF0ZSBhIGNvbnRhaW5lciBpZiB0aGVyZSBhcmUgYWN0dWFsbHkgaW50ZXJwb2xhdGlvbnMsXG4gICAgLy8gc28gdGhpcyBmbGFnIHRyYWNrcyB0aGF0LlxuICAgIGxldCBoYXNJbnRlcnBvbGF0aW9uID0gZmFsc2U7XG4gICAgZm9yIChjb25zdCB0b2tlbiBvZiB0b2tlbnMpIHtcbiAgICAgIHN3aXRjaCAodG9rZW4udHlwZSkge1xuICAgICAgICBjYXNlIFRva2VuVHlwZS5JTlRFUlBPTEFUSU9OOlxuICAgICAgICBjYXNlIFRva2VuVHlwZS5BVFRSX1ZBTFVFX0lOVEVSUE9MQVRJT046XG4gICAgICAgICAgaGFzSW50ZXJwb2xhdGlvbiA9IHRydWU7XG4gICAgICAgICAgY29uc3QgZXhwcmVzc2lvbiA9IHRva2VuLnBhcnRzWzFdO1xuICAgICAgICAgIGNvbnN0IGJhc2VOYW1lID0gZXh0cmFjdFBsYWNlaG9sZGVyTmFtZShleHByZXNzaW9uKSB8fCAnSU5URVJQT0xBVElPTic7XG4gICAgICAgICAgY29uc3QgcGhOYW1lID0gY29udGV4dC5wbGFjZWhvbGRlclJlZ2lzdHJ5LmdldFBsYWNlaG9sZGVyTmFtZShiYXNlTmFtZSwgZXhwcmVzc2lvbik7XG4gICAgICAgICAgY29udGV4dC5wbGFjZWhvbGRlclRvQ29udGVudFtwaE5hbWVdID0ge1xuICAgICAgICAgICAgdGV4dDogdG9rZW4ucGFydHMuam9pbignJyksXG4gICAgICAgICAgICBzb3VyY2VTcGFuOiB0b2tlbi5zb3VyY2VTcGFuLFxuICAgICAgICAgIH07XG4gICAgICAgICAgbm9kZXMucHVzaChuZXcgaTE4bi5QbGFjZWhvbGRlcihleHByZXNzaW9uLCBwaE5hbWUsIHRva2VuLnNvdXJjZVNwYW4pKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBpZiAodG9rZW4ucGFydHNbMF0ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgLy8gVGhpcyB0b2tlbiBpcyB0ZXh0IG9yIGFuIGVuY29kZWQgZW50aXR5LlxuICAgICAgICAgICAgLy8gSWYgaXQgaXMgZm9sbG93aW5nIG9uIGZyb20gYSBwcmV2aW91cyB0ZXh0IG5vZGUgdGhlbiBtZXJnZSBpdCBpbnRvIHRoYXQgbm9kZVxuICAgICAgICAgICAgLy8gT3RoZXJ3aXNlLCBpZiBpdCBpcyBmb2xsb3dpbmcgYW4gaW50ZXJwb2xhdGlvbiwgdGhlbiBhZGQgYSBuZXcgbm9kZS5cbiAgICAgICAgICAgIGNvbnN0IHByZXZpb3VzID0gbm9kZXNbbm9kZXMubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICBpZiAocHJldmlvdXMgaW5zdGFuY2VvZiBpMThuLlRleHQpIHtcbiAgICAgICAgICAgICAgcHJldmlvdXMudmFsdWUgKz0gdG9rZW4ucGFydHNbMF07XG4gICAgICAgICAgICAgIHByZXZpb3VzLnNvdXJjZVNwYW4gPSBuZXcgUGFyc2VTb3VyY2VTcGFuKFxuICAgICAgICAgICAgICAgIHByZXZpb3VzLnNvdXJjZVNwYW4uc3RhcnQsXG4gICAgICAgICAgICAgICAgdG9rZW4uc291cmNlU3Bhbi5lbmQsXG4gICAgICAgICAgICAgICAgcHJldmlvdXMuc291cmNlU3Bhbi5mdWxsU3RhcnQsXG4gICAgICAgICAgICAgICAgcHJldmlvdXMuc291cmNlU3Bhbi5kZXRhaWxzLFxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgbm9kZXMucHVzaChuZXcgaTE4bi5UZXh0KHRva2VuLnBhcnRzWzBdLCB0b2tlbi5zb3VyY2VTcGFuKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChoYXNJbnRlcnBvbGF0aW9uKSB7XG4gICAgICAvLyBXaGl0ZXNwYWNlIHJlbW92YWwgbWF5IGhhdmUgaW52YWxpZGF0ZWQgdGhlIGludGVycG9sYXRpb24gc291cmNlLXNwYW5zLlxuICAgICAgcmV1c2VQcmV2aW91c1NvdXJjZVNwYW5zKG5vZGVzLCBwcmV2aW91c0kxOG4pO1xuICAgICAgcmV0dXJuIG5ldyBpMThuLkNvbnRhaW5lcihub2Rlcywgc291cmNlU3Bhbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBub2Rlc1swXTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBSZS11c2UgdGhlIHNvdXJjZS1zcGFucyBmcm9tIGBwcmV2aW91c0kxOG5gIG1ldGFkYXRhIGZvciB0aGUgYG5vZGVzYC5cbiAqXG4gKiBXaGl0ZXNwYWNlIHJlbW92YWwgY2FuIGludmFsaWRhdGUgdGhlIHNvdXJjZS1zcGFucyBvZiBpbnRlcnBvbGF0aW9uIG5vZGVzLCBzbyB3ZVxuICogcmV1c2UgdGhlIHNvdXJjZS1zcGFuIHN0b3JlZCBmcm9tIGEgcHJldmlvdXMgcGFzcyBiZWZvcmUgdGhlIHdoaXRlc3BhY2Ugd2FzIHJlbW92ZWQuXG4gKlxuICogQHBhcmFtIG5vZGVzIFRoZSBgVGV4dGAgYW5kIGBQbGFjZWhvbGRlcmAgbm9kZXMgdG8gYmUgcHJvY2Vzc2VkLlxuICogQHBhcmFtIHByZXZpb3VzSTE4biBBbnkgaTE4biBtZXRhZGF0YSBmb3IgdGhlc2UgYG5vZGVzYCBzdG9yZWQgZnJvbSBhIHByZXZpb3VzIHBhc3MuXG4gKi9cbmZ1bmN0aW9uIHJldXNlUHJldmlvdXNTb3VyY2VTcGFucyhcbiAgbm9kZXM6IGkxOG4uTm9kZVtdLFxuICBwcmV2aW91c0kxOG46IGkxOG4uSTE4bk1ldGEgfCB1bmRlZmluZWQsXG4pOiB2b2lkIHtcbiAgaWYgKHByZXZpb3VzSTE4biBpbnN0YW5jZW9mIGkxOG4uTWVzc2FnZSkge1xuICAgIC8vIFRoZSBgcHJldmlvdXNJMThuYCBpcyBhbiBpMThuIGBNZXNzYWdlYCwgc28gd2UgYXJlIHByb2Nlc3NpbmcgYW4gYEF0dHJpYnV0ZWAgd2l0aCBpMThuXG4gICAgLy8gbWV0YWRhdGEuIFRoZSBgTWVzc2FnZWAgc2hvdWxkIGNvbnNpc3Qgb25seSBvZiBhIHNpbmdsZSBgQ29udGFpbmVyYCB0aGF0IGNvbnRhaW5zIHRoZVxuICAgIC8vIHBhcnRzIChgVGV4dGAgYW5kIGBQbGFjZWhvbGRlcmApIHRvIHByb2Nlc3MuXG4gICAgYXNzZXJ0U2luZ2xlQ29udGFpbmVyTWVzc2FnZShwcmV2aW91c0kxOG4pO1xuICAgIHByZXZpb3VzSTE4biA9IHByZXZpb3VzSTE4bi5ub2Rlc1swXTtcbiAgfVxuXG4gIGlmIChwcmV2aW91c0kxOG4gaW5zdGFuY2VvZiBpMThuLkNvbnRhaW5lcikge1xuICAgIC8vIFRoZSBgcHJldmlvdXNJMThuYCBpcyBhIGBDb250YWluZXJgLCB3aGljaCBtZWFucyB0aGF0IHRoaXMgaXMgYSBzZWNvbmQgaTE4biBleHRyYWN0aW9uIHBhc3NcbiAgICAvLyBhZnRlciB3aGl0ZXNwYWNlIGhhcyBiZWVuIHJlbW92ZWQgZnJvbSB0aGUgQVNUIG5vZGVzLlxuICAgIGFzc2VydEVxdWl2YWxlbnROb2RlcyhwcmV2aW91c0kxOG4uY2hpbGRyZW4sIG5vZGVzKTtcblxuICAgIC8vIFJldXNlIHRoZSBzb3VyY2Utc3BhbnMgZnJvbSB0aGUgZmlyc3QgcGFzcy5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBub2Rlc1tpXS5zb3VyY2VTcGFuID0gcHJldmlvdXNJMThuLmNoaWxkcmVuW2ldLnNvdXJjZVNwYW47XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQXNzZXJ0cyB0aGF0IHRoZSBgbWVzc2FnZWAgY29udGFpbnMgZXhhY3RseSBvbmUgYENvbnRhaW5lcmAgbm9kZS5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0U2luZ2xlQ29udGFpbmVyTWVzc2FnZShtZXNzYWdlOiBpMThuLk1lc3NhZ2UpOiB2b2lkIHtcbiAgY29uc3Qgbm9kZXMgPSBtZXNzYWdlLm5vZGVzO1xuICBpZiAobm9kZXMubGVuZ3RoICE9PSAxIHx8ICEobm9kZXNbMF0gaW5zdGFuY2VvZiBpMThuLkNvbnRhaW5lcikpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAnVW5leHBlY3RlZCBwcmV2aW91cyBpMThuIG1lc3NhZ2UgLSBleHBlY3RlZCBpdCB0byBjb25zaXN0IG9mIG9ubHkgYSBzaW5nbGUgYENvbnRhaW5lcmAgbm9kZS4nLFxuICAgICk7XG4gIH1cbn1cblxuLyoqXG4gKiBBc3NlcnRzIHRoYXQgdGhlIGBwcmV2aW91c05vZGVzYCBhbmQgYG5vZGVgIGNvbGxlY3Rpb25zIGhhdmUgdGhlIHNhbWUgbnVtYmVyIG9mIGVsZW1lbnRzIGFuZFxuICogY29ycmVzcG9uZGluZyBlbGVtZW50cyBoYXZlIHRoZSBzYW1lIG5vZGUgdHlwZS5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0RXF1aXZhbGVudE5vZGVzKHByZXZpb3VzTm9kZXM6IGkxOG4uTm9kZVtdLCBub2RlczogaTE4bi5Ob2RlW10pOiB2b2lkIHtcbiAgaWYgKHByZXZpb3VzTm9kZXMubGVuZ3RoICE9PSBub2Rlcy5sZW5ndGgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSBudW1iZXIgb2YgaTE4biBtZXNzYWdlIGNoaWxkcmVuIGNoYW5nZWQgYmV0d2VlbiBmaXJzdCBhbmQgc2Vjb25kIHBhc3MuJyk7XG4gIH1cbiAgaWYgKHByZXZpb3VzTm9kZXMuc29tZSgobm9kZSwgaSkgPT4gbm9kZXNbaV0uY29uc3RydWN0b3IgIT09IG5vZGUuY29uc3RydWN0b3IpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgJ1RoZSB0eXBlcyBvZiB0aGUgaTE4biBtZXNzYWdlIGNoaWxkcmVuIGNoYW5nZWQgYmV0d2VlbiBmaXJzdCBhbmQgc2Vjb25kIHBhc3MuJyxcbiAgICApO1xuICB9XG59XG5cbmNvbnN0IF9DVVNUT01fUEhfRVhQID1cbiAgL1xcL1xcL1tcXHNcXFNdKmkxOG5bXFxzXFxTXSpcXChbXFxzXFxTXSpwaFtcXHNcXFNdKj1bXFxzXFxTXSooXCJ8JykoW1xcc1xcU10qPylcXDFbXFxzXFxTXSpcXCkvZztcblxuZnVuY3Rpb24gZXh0cmFjdFBsYWNlaG9sZGVyTmFtZShpbnB1dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGlucHV0LnNwbGl0KF9DVVNUT01fUEhfRVhQKVsyXTtcbn1cbiJdfQ==