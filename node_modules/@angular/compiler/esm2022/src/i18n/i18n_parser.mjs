/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
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
export function createI18nMessageFactory(interpolationConfig, containerBlocks, retainEmptyTokens) {
    const visitor = new _I18nVisitor(_expParser, interpolationConfig, containerBlocks, retainEmptyTokens);
    return (nodes, meaning, description, customId, visitNodeFn) => visitor.toI18nMessage(nodes, meaning, description, customId, visitNodeFn);
}
function noopVisitNodeFn(_html, i18n) {
    return i18n;
}
class _I18nVisitor {
    constructor(_expressionParser, _interpolationConfig, _containerBlocks, _retainEmptyTokens) {
        this._expressionParser = _expressionParser;
        this._interpolationConfig = _interpolationConfig;
        this._containerBlocks = _containerBlocks;
        this._retainEmptyTokens = _retainEmptyTokens;
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
                    // Try to merge text tokens with previous tokens. We do this even for all tokens
                    // when `retainEmptyTokens == true` because whitespace tokens may have non-zero
                    // length, but will be trimmed by `WhitespaceVisitor` in one extraction pass and
                    // be considered "empty" there. Therefore a whitespace token with
                    // `retainEmptyTokens === true` should be treated like an empty token and either
                    // retained or merged into the previous node. Since extraction does two passes with
                    // different trimming behavior, the second pass needs to have identical node count
                    // to reuse source spans, so we need this check to get the same answer when both
                    // trimming and not trimming.
                    if (token.parts[0].length > 0 || this._retainEmptyTokens) {
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
                    else {
                        // Retain empty tokens to avoid breaking dropping entire nodes such that source
                        // spans should not be reusable across multiple parses of a template. We *should*
                        // do this all the time, however we need to maintain backwards compatibility
                        // with existing message IDs so we can't do it by default and should only enable
                        // this when removing significant whitespace.
                        if (this._retainEmptyTokens) {
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
        throw new Error(`
The number of i18n message children changed between first and second pass.

First pass (${previousNodes.length} tokens):
${previousNodes.map((node) => `"${node.sourceSpan.toString()}"`).join('\n')}

Second pass (${nodes.length} tokens):
${nodes.map((node) => `"${node.sourceSpan.toString()}"`).join('\n')}
    `.trim());
    }
    if (previousNodes.some((node, i) => nodes[i].constructor !== node.constructor)) {
        throw new Error('The types of the i18n message children changed between first and second pass.');
    }
}
const _CUSTOM_PH_EXP = /\/\/[\s\S]*i18n[\s\S]*\([\s\S]*ph[\s\S]*=[\s\S]*("|')([\s\S]*?)\1[\s\S]*\)/g;
function extractPlaceholderName(input) {
    return input.split(_CUSTOM_PH_EXP)[2];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaTE4bl9wYXJzZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvaTE4bi9pMThuX3BhcnNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsS0FBSyxJQUFJLGVBQWUsRUFBQyxNQUFNLDRCQUE0QixDQUFDO0FBQ3BFLE9BQU8sRUFBQyxNQUFNLElBQUksZ0JBQWdCLEVBQUMsTUFBTSw2QkFBNkIsQ0FBQztBQUN2RSxPQUFPLEtBQUssSUFBSSxNQUFNLGtCQUFrQixDQUFDO0FBRXpDLE9BQU8sRUFBQyxvQkFBb0IsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBRTVELE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFOUMsT0FBTyxLQUFLLElBQUksTUFBTSxZQUFZLENBQUM7QUFDbkMsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0sMkJBQTJCLENBQUM7QUFFOUQsTUFBTSxVQUFVLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLGVBQWUsRUFBRSxDQUFDLENBQUM7QUFjL0Q7O0dBRUc7QUFDSCxNQUFNLFVBQVUsd0JBQXdCLENBQ3RDLG1CQUF3QyxFQUN4QyxlQUE0QixFQUM1QixpQkFBMEI7SUFFMUIsTUFBTSxPQUFPLEdBQUcsSUFBSSxZQUFZLENBQzlCLFVBQVUsRUFDVixtQkFBbUIsRUFDbkIsZUFBZSxFQUNmLGlCQUFpQixDQUNsQixDQUFDO0lBQ0YsT0FBTyxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsRUFBRSxDQUM1RCxPQUFPLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxXQUFXLENBQUMsQ0FBQztBQUM5RSxDQUFDO0FBV0QsU0FBUyxlQUFlLENBQUMsS0FBZ0IsRUFBRSxJQUFlO0lBQ3hELE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQztBQUVELE1BQU0sWUFBWTtJQUNoQixZQUNVLGlCQUFtQyxFQUNuQyxvQkFBeUMsRUFDekMsZ0JBQTZCLEVBQ3BCLGtCQUEyQjtRQUhwQyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQWtCO1FBQ25DLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBcUI7UUFDekMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFhO1FBQ3BCLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBUztJQUMzQyxDQUFDO0lBRUcsYUFBYSxDQUNsQixLQUFrQixFQUNsQixPQUFPLEdBQUcsRUFBRSxFQUNaLFdBQVcsR0FBRyxFQUFFLEVBQ2hCLFFBQVEsR0FBRyxFQUFFLEVBQ2IsV0FBb0M7UUFFcEMsTUFBTSxPQUFPLEdBQThCO1lBQ3pDLEtBQUssRUFBRSxLQUFLLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLFlBQVksSUFBSSxDQUFDLFNBQVM7WUFDOUQsUUFBUSxFQUFFLENBQUM7WUFDWCxtQkFBbUIsRUFBRSxJQUFJLG1CQUFtQixFQUFFO1lBQzlDLG9CQUFvQixFQUFFLEVBQUU7WUFDeEIsb0JBQW9CLEVBQUUsRUFBRTtZQUN4QixXQUFXLEVBQUUsV0FBVyxJQUFJLGVBQWU7U0FDNUMsQ0FBQztRQUVGLE1BQU0sUUFBUSxHQUFnQixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFbEUsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQ3JCLFFBQVEsRUFDUixPQUFPLENBQUMsb0JBQW9CLEVBQzVCLE9BQU8sQ0FBQyxvQkFBb0IsRUFDNUIsT0FBTyxFQUNQLFdBQVcsRUFDWCxRQUFRLENBQ1QsQ0FBQztJQUNKLENBQUM7SUFFRCxZQUFZLENBQUMsRUFBZ0IsRUFBRSxPQUFrQztRQUMvRCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzNELE1BQU0sS0FBSyxHQUEwQixFQUFFLENBQUM7UUFDeEMsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtZQUN4QixvRUFBb0U7WUFDcEUsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ2hDLENBQUMsQ0FBQyxDQUFDO1FBRUgsTUFBTSxNQUFNLEdBQVksb0JBQW9CLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQztRQUM3RCxNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUMsMEJBQTBCLENBQ3hFLEVBQUUsQ0FBQyxJQUFJLEVBQ1AsS0FBSyxFQUNMLE1BQU0sQ0FDUCxDQUFDO1FBQ0YsT0FBTyxDQUFDLG9CQUFvQixDQUFDLFdBQVcsQ0FBQyxHQUFHO1lBQzFDLElBQUksRUFBRSxFQUFFLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRTtZQUNuQyxVQUFVLEVBQUUsRUFBRSxDQUFDLGVBQWU7U0FDL0IsQ0FBQztRQUVGLElBQUksV0FBVyxHQUFHLEVBQUUsQ0FBQztRQUVyQixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDWixXQUFXLEdBQUcsT0FBTyxDQUFDLG1CQUFtQixDQUFDLDBCQUEwQixDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM5RSxPQUFPLENBQUMsb0JBQW9CLENBQUMsV0FBVyxDQUFDLEdBQUc7Z0JBQzFDLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQyxJQUFJLEdBQUc7Z0JBQ3JCLFVBQVUsRUFBRSxFQUFFLENBQUMsYUFBYSxJQUFJLEVBQUUsQ0FBQyxVQUFVO2FBQzlDLENBQUM7UUFDSixDQUFDO1FBRUQsTUFBTSxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUNsQyxFQUFFLENBQUMsSUFBSSxFQUNQLEtBQUssRUFDTCxXQUFXLEVBQ1gsV0FBVyxFQUNYLFFBQVEsRUFDUixNQUFNLEVBQ04sRUFBRSxDQUFDLFVBQVUsRUFDYixFQUFFLENBQUMsZUFBZSxFQUNsQixFQUFFLENBQUMsYUFBYSxDQUNqQixDQUFDO1FBQ0YsT0FBTyxPQUFPLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBRUQsY0FBYyxDQUFDLFNBQXlCLEVBQUUsT0FBa0M7UUFDMUUsTUFBTSxJQUFJLEdBQ1IsU0FBUyxDQUFDLFdBQVcsS0FBSyxTQUFTLElBQUksU0FBUyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEtBQUssQ0FBQztZQUN2RSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLFNBQVMsSUFBSSxTQUFTLENBQUMsVUFBVSxDQUFDO1lBQzdFLENBQUMsQ0FBQyxJQUFJLENBQUMsMkJBQTJCLENBQzlCLFNBQVMsQ0FBQyxXQUFXLEVBQ3JCLFNBQVMsQ0FBQyxTQUFTLElBQUksU0FBUyxDQUFDLFVBQVUsRUFDM0MsT0FBTyxFQUNQLFNBQVMsQ0FBQyxJQUFJLENBQ2YsQ0FBQztRQUNSLE9BQU8sT0FBTyxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUVELFNBQVMsQ0FBQyxJQUFlLEVBQUUsT0FBa0M7UUFDM0QsTUFBTSxJQUFJLEdBQ1IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQztZQUN0QixDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQztZQUM1QyxDQUFDLENBQUMsSUFBSSxDQUFDLDJCQUEyQixDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3pGLE9BQU8sT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDekMsQ0FBQztJQUVELFlBQVksQ0FBQyxPQUFxQixFQUFFLE9BQWtDO1FBQ3BFLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVELGNBQWMsQ0FBQyxHQUFtQixFQUFFLE9BQWtDO1FBQ3BFLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNuQixNQUFNLFlBQVksR0FBNkIsRUFBRSxDQUFDO1FBQ2xELE1BQU0sT0FBTyxHQUFHLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN0RixHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBUSxFQUFFO1lBQy9CLFlBQVksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUMzQyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFDeEQsSUFBSSxDQUFDLGFBQWEsQ0FDbkIsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBRW5CLElBQUksT0FBTyxDQUFDLEtBQUssSUFBSSxPQUFPLENBQUMsUUFBUSxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQzFDLDRCQUE0QjtZQUM1QixpRUFBaUU7WUFDakUsK0JBQStCO1lBQy9CLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQ2xGLE9BQU8sQ0FBQyxxQkFBcUIsR0FBRyxLQUFLLENBQUM7WUFDdEMsT0FBTyxDQUFDLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxHQUFHO2dCQUNwQyxJQUFJLEVBQUUsR0FBRyxDQUFDLFdBQVc7Z0JBQ3JCLFVBQVUsRUFBRSxHQUFHLENBQUMscUJBQXFCO2FBQ3RDLENBQUM7WUFDRixPQUFPLE9BQU8sQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzNDLENBQUM7UUFFRCw2QkFBNkI7UUFDN0IseUZBQXlGO1FBQ3pGLGdCQUFnQjtRQUNoQix5RkFBeUY7UUFDekYsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLG1CQUFtQixDQUFDLGtCQUFrQixDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDaEcsT0FBTyxDQUFDLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUN4RixNQUFNLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDdEUsT0FBTyxPQUFPLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN4QyxDQUFDO0lBRUQsa0JBQWtCLENBQUMsUUFBNEIsRUFBRSxRQUFtQztRQUNsRixNQUFNLElBQUksS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUM7SUFDdEMsQ0FBQztJQUVELFVBQVUsQ0FBQyxLQUFpQixFQUFFLE9BQWtDO1FBQzlELE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFOUQsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1lBQzFDLE9BQU8sSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDeEQsQ0FBQztRQUVELE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDckUsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLG1CQUFtQixDQUFDLDRCQUE0QixDQUMxRSxLQUFLLENBQUMsSUFBSSxFQUNWLFVBQVUsQ0FDWCxDQUFDO1FBQ0YsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLG1CQUFtQixDQUFDLDRCQUE0QixDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUV6RixPQUFPLENBQUMsb0JBQW9CLENBQUMsV0FBVyxDQUFDLEdBQUc7WUFDMUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxlQUFlLENBQUMsUUFBUSxFQUFFO1lBQ3RDLFVBQVUsRUFBRSxLQUFLLENBQUMsZUFBZTtTQUNsQyxDQUFDO1FBRUYsT0FBTyxDQUFDLG9CQUFvQixDQUFDLFdBQVcsQ0FBQyxHQUFHO1lBQzFDLElBQUksRUFBRSxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHO1lBQ2hFLFVBQVUsRUFBRSxLQUFLLENBQUMsYUFBYSxJQUFJLEtBQUssQ0FBQyxVQUFVO1NBQ3BELENBQUM7UUFFRixNQUFNLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FDcEMsS0FBSyxDQUFDLElBQUksRUFDVixVQUFVLEVBQ1YsV0FBVyxFQUNYLFdBQVcsRUFDWCxRQUFRLEVBQ1IsS0FBSyxDQUFDLFVBQVUsRUFDaEIsS0FBSyxDQUFDLGVBQWUsRUFDckIsS0FBSyxDQUFDLGFBQWEsQ0FDcEIsQ0FBQztRQUNGLE9BQU8sT0FBTyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUVELG1CQUFtQixDQUFDLFVBQStCLEVBQUUsUUFBbUM7UUFDdEYsTUFBTSxJQUFJLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0lBQ3RDLENBQUM7SUFFRCxtQkFBbUIsQ0FBQyxJQUF5QixFQUFFLE9BQVk7UUFDekQsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNLLDJCQUEyQixDQUNqQyxNQUE4RCxFQUM5RCxVQUEyQixFQUMzQixPQUFrQyxFQUNsQyxZQUF1QztRQUV2QyxnRkFBZ0Y7UUFDaEYsTUFBTSxLQUFLLEdBQWdCLEVBQUUsQ0FBQztRQUM5Qix3RUFBd0U7UUFDeEUsNEJBQTRCO1FBQzVCLElBQUksZ0JBQWdCLEdBQUcsS0FBSyxDQUFDO1FBQzdCLEtBQUssTUFBTSxLQUFLLElBQUksTUFBTSxFQUFFLENBQUM7WUFDM0IsUUFBUSxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ25CLHFDQUE2QjtnQkFDN0I7b0JBQ0UsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO29CQUN4QixNQUFNLFVBQVUsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNsQyxNQUFNLFFBQVEsR0FBRyxzQkFBc0IsQ0FBQyxVQUFVLENBQUMsSUFBSSxlQUFlLENBQUM7b0JBQ3ZFLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUM7b0JBQ3BGLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsR0FBRzt3QkFDckMsSUFBSSxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQzt3QkFDMUIsVUFBVSxFQUFFLEtBQUssQ0FBQyxVQUFVO3FCQUM3QixDQUFDO29CQUNGLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7b0JBQ3ZFLE1BQU07Z0JBQ1I7b0JBQ0UsZ0ZBQWdGO29CQUNoRiwrRUFBK0U7b0JBQy9FLGdGQUFnRjtvQkFDaEYsaUVBQWlFO29CQUNqRSxnRkFBZ0Y7b0JBQ2hGLG1GQUFtRjtvQkFDbkYsa0ZBQWtGO29CQUNsRixnRkFBZ0Y7b0JBQ2hGLDZCQUE2QjtvQkFDN0IsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7d0JBQ3pELDJDQUEyQzt3QkFDM0MsK0VBQStFO3dCQUMvRSx1RUFBdUU7d0JBQ3ZFLE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO3dCQUN6QyxJQUFJLFFBQVEsWUFBWSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7NEJBQ2xDLFFBQVEsQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDakMsUUFBUSxDQUFDLFVBQVUsR0FBRyxJQUFJLGVBQWUsQ0FDdkMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQ3pCLEtBQUssQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUNwQixRQUFRLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFDN0IsUUFBUSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQzVCLENBQUM7d0JBQ0osQ0FBQzs2QkFBTSxDQUFDOzRCQUNOLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7d0JBQzlELENBQUM7b0JBQ0gsQ0FBQzt5QkFBTSxDQUFDO3dCQUNOLCtFQUErRTt3QkFDL0UsaUZBQWlGO3dCQUNqRiw0RUFBNEU7d0JBQzVFLGdGQUFnRjt3QkFDaEYsNkNBQTZDO3dCQUM3QyxJQUFJLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDOzRCQUM1QixLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO3dCQUM5RCxDQUFDO29CQUNILENBQUM7b0JBRUQsTUFBTTtZQUNWLENBQUM7UUFDSCxDQUFDO1FBRUQsSUFBSSxnQkFBZ0IsRUFBRSxDQUFDO1lBQ3JCLDBFQUEwRTtZQUMxRSx3QkFBd0IsQ0FBQyxLQUFLLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFDOUMsT0FBTyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQy9DLENBQUM7YUFBTSxDQUFDO1lBQ04sT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEIsQ0FBQztJQUNILENBQUM7Q0FDRjtBQUVEOzs7Ozs7OztHQVFHO0FBQ0gsU0FBUyx3QkFBd0IsQ0FDL0IsS0FBa0IsRUFDbEIsWUFBdUM7SUFFdkMsSUFBSSxZQUFZLFlBQVksSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3pDLHlGQUF5RjtRQUN6Rix3RkFBd0Y7UUFDeEYsK0NBQStDO1FBQy9DLDRCQUE0QixDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzNDLFlBQVksR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFFRCxJQUFJLFlBQVksWUFBWSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDM0MsOEZBQThGO1FBQzlGLHdEQUF3RDtRQUN4RCxxQkFBcUIsQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXBELDhDQUE4QztRQUM5QyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ3RDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEdBQUcsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUM7UUFDNUQsQ0FBQztJQUNILENBQUM7QUFDSCxDQUFDO0FBRUQ7O0dBRUc7QUFDSCxTQUFTLDRCQUE0QixDQUFDLE9BQXFCO0lBQ3pELE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUM7SUFDNUIsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxZQUFZLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDO1FBQ2hFLE1BQU0sSUFBSSxLQUFLLENBQ2IsOEZBQThGLENBQy9GLENBQUM7SUFDSixDQUFDO0FBQ0gsQ0FBQztBQUVEOzs7R0FHRztBQUNILFNBQVMscUJBQXFCLENBQUMsYUFBMEIsRUFBRSxLQUFrQjtJQUMzRSxJQUFJLGFBQWEsQ0FBQyxNQUFNLEtBQUssS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQzFDLE1BQU0sSUFBSSxLQUFLLENBQ2I7OztjQUdRLGFBQWEsQ0FBQyxNQUFNO0VBQ2hDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQzs7ZUFFNUQsS0FBSyxDQUFDLE1BQU07RUFDekIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO0tBQzlELENBQUMsSUFBSSxFQUFFLENBQ1AsQ0FBQztJQUNKLENBQUM7SUFDRCxJQUFJLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxLQUFLLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDO1FBQy9FLE1BQU0sSUFBSSxLQUFLLENBQ2IsK0VBQStFLENBQ2hGLENBQUM7SUFDSixDQUFDO0FBQ0gsQ0FBQztBQUVELE1BQU0sY0FBYyxHQUNsQiw2RUFBNkUsQ0FBQztBQUVoRixTQUFTLHNCQUFzQixDQUFDLEtBQWE7SUFDM0MsT0FBTyxLQUFLLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3hDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCB7TGV4ZXIgYXMgRXhwcmVzc2lvbkxleGVyfSBmcm9tICcuLi9leHByZXNzaW9uX3BhcnNlci9sZXhlcic7XG5pbXBvcnQge1BhcnNlciBhcyBFeHByZXNzaW9uUGFyc2VyfSBmcm9tICcuLi9leHByZXNzaW9uX3BhcnNlci9wYXJzZXInO1xuaW1wb3J0ICogYXMgaHRtbCBmcm9tICcuLi9tbF9wYXJzZXIvYXN0JztcbmltcG9ydCB7SW50ZXJwb2xhdGlvbkNvbmZpZ30gZnJvbSAnLi4vbWxfcGFyc2VyL2RlZmF1bHRzJztcbmltcG9ydCB7Z2V0SHRtbFRhZ0RlZmluaXRpb259IGZyb20gJy4uL21sX3BhcnNlci9odG1sX3RhZ3MnO1xuaW1wb3J0IHtJbnRlcnBvbGF0ZWRBdHRyaWJ1dGVUb2tlbiwgSW50ZXJwb2xhdGVkVGV4dFRva2VuLCBUb2tlblR5cGV9IGZyb20gJy4uL21sX3BhcnNlci90b2tlbnMnO1xuaW1wb3J0IHtQYXJzZVNvdXJjZVNwYW59IGZyb20gJy4uL3BhcnNlX3V0aWwnO1xuXG5pbXBvcnQgKiBhcyBpMThuIGZyb20gJy4vaTE4bl9hc3QnO1xuaW1wb3J0IHtQbGFjZWhvbGRlclJlZ2lzdHJ5fSBmcm9tICcuL3NlcmlhbGl6ZXJzL3BsYWNlaG9sZGVyJztcblxuY29uc3QgX2V4cFBhcnNlciA9IG5ldyBFeHByZXNzaW9uUGFyc2VyKG5ldyBFeHByZXNzaW9uTGV4ZXIoKSk7XG5cbmV4cG9ydCB0eXBlIFZpc2l0Tm9kZUZuID0gKGh0bWw6IGh0bWwuTm9kZSwgaTE4bjogaTE4bi5Ob2RlKSA9PiBpMThuLk5vZGU7XG5cbmV4cG9ydCBpbnRlcmZhY2UgSTE4bk1lc3NhZ2VGYWN0b3J5IHtcbiAgKFxuICAgIG5vZGVzOiBodG1sLk5vZGVbXSxcbiAgICBtZWFuaW5nOiBzdHJpbmcgfCB1bmRlZmluZWQsXG4gICAgZGVzY3JpcHRpb246IHN0cmluZyB8IHVuZGVmaW5lZCxcbiAgICBjdXN0b21JZDogc3RyaW5nIHwgdW5kZWZpbmVkLFxuICAgIHZpc2l0Tm9kZUZuPzogVmlzaXROb2RlRm4sXG4gICk6IGkxOG4uTWVzc2FnZTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgZnVuY3Rpb24gY29udmVydGluZyBodG1sIG5vZGVzIHRvIGFuIGkxOG4gTWVzc2FnZSBnaXZlbiBhbiBpbnRlcnBvbGF0aW9uQ29uZmlnXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVJMThuTWVzc2FnZUZhY3RvcnkoXG4gIGludGVycG9sYXRpb25Db25maWc6IEludGVycG9sYXRpb25Db25maWcsXG4gIGNvbnRhaW5lckJsb2NrczogU2V0PHN0cmluZz4sXG4gIHJldGFpbkVtcHR5VG9rZW5zOiBib29sZWFuLFxuKTogSTE4bk1lc3NhZ2VGYWN0b3J5IHtcbiAgY29uc3QgdmlzaXRvciA9IG5ldyBfSTE4blZpc2l0b3IoXG4gICAgX2V4cFBhcnNlcixcbiAgICBpbnRlcnBvbGF0aW9uQ29uZmlnLFxuICAgIGNvbnRhaW5lckJsb2NrcyxcbiAgICByZXRhaW5FbXB0eVRva2VucyxcbiAgKTtcbiAgcmV0dXJuIChub2RlcywgbWVhbmluZywgZGVzY3JpcHRpb24sIGN1c3RvbUlkLCB2aXNpdE5vZGVGbikgPT5cbiAgICB2aXNpdG9yLnRvSTE4bk1lc3NhZ2Uobm9kZXMsIG1lYW5pbmcsIGRlc2NyaXB0aW9uLCBjdXN0b21JZCwgdmlzaXROb2RlRm4pO1xufVxuXG5pbnRlcmZhY2UgSTE4bk1lc3NhZ2VWaXNpdG9yQ29udGV4dCB7XG4gIGlzSWN1OiBib29sZWFuO1xuICBpY3VEZXB0aDogbnVtYmVyO1xuICBwbGFjZWhvbGRlclJlZ2lzdHJ5OiBQbGFjZWhvbGRlclJlZ2lzdHJ5O1xuICBwbGFjZWhvbGRlclRvQ29udGVudDoge1twaE5hbWU6IHN0cmluZ106IGkxOG4uTWVzc2FnZVBsYWNlaG9sZGVyfTtcbiAgcGxhY2Vob2xkZXJUb01lc3NhZ2U6IHtbcGhOYW1lOiBzdHJpbmddOiBpMThuLk1lc3NhZ2V9O1xuICB2aXNpdE5vZGVGbjogVmlzaXROb2RlRm47XG59XG5cbmZ1bmN0aW9uIG5vb3BWaXNpdE5vZGVGbihfaHRtbDogaHRtbC5Ob2RlLCBpMThuOiBpMThuLk5vZGUpOiBpMThuLk5vZGUge1xuICByZXR1cm4gaTE4bjtcbn1cblxuY2xhc3MgX0kxOG5WaXNpdG9yIGltcGxlbWVudHMgaHRtbC5WaXNpdG9yIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBfZXhwcmVzc2lvblBhcnNlcjogRXhwcmVzc2lvblBhcnNlcixcbiAgICBwcml2YXRlIF9pbnRlcnBvbGF0aW9uQ29uZmlnOiBJbnRlcnBvbGF0aW9uQ29uZmlnLFxuICAgIHByaXZhdGUgX2NvbnRhaW5lckJsb2NrczogU2V0PHN0cmluZz4sXG4gICAgcHJpdmF0ZSByZWFkb25seSBfcmV0YWluRW1wdHlUb2tlbnM6IGJvb2xlYW4sXG4gICkge31cblxuICBwdWJsaWMgdG9JMThuTWVzc2FnZShcbiAgICBub2RlczogaHRtbC5Ob2RlW10sXG4gICAgbWVhbmluZyA9ICcnLFxuICAgIGRlc2NyaXB0aW9uID0gJycsXG4gICAgY3VzdG9tSWQgPSAnJyxcbiAgICB2aXNpdE5vZGVGbjogVmlzaXROb2RlRm4gfCB1bmRlZmluZWQsXG4gICk6IGkxOG4uTWVzc2FnZSB7XG4gICAgY29uc3QgY29udGV4dDogSTE4bk1lc3NhZ2VWaXNpdG9yQ29udGV4dCA9IHtcbiAgICAgIGlzSWN1OiBub2Rlcy5sZW5ndGggPT0gMSAmJiBub2Rlc1swXSBpbnN0YW5jZW9mIGh0bWwuRXhwYW5zaW9uLFxuICAgICAgaWN1RGVwdGg6IDAsXG4gICAgICBwbGFjZWhvbGRlclJlZ2lzdHJ5OiBuZXcgUGxhY2Vob2xkZXJSZWdpc3RyeSgpLFxuICAgICAgcGxhY2Vob2xkZXJUb0NvbnRlbnQ6IHt9LFxuICAgICAgcGxhY2Vob2xkZXJUb01lc3NhZ2U6IHt9LFxuICAgICAgdmlzaXROb2RlRm46IHZpc2l0Tm9kZUZuIHx8IG5vb3BWaXNpdE5vZGVGbixcbiAgICB9O1xuXG4gICAgY29uc3QgaTE4bm9kZXM6IGkxOG4uTm9kZVtdID0gaHRtbC52aXNpdEFsbCh0aGlzLCBub2RlcywgY29udGV4dCk7XG5cbiAgICByZXR1cm4gbmV3IGkxOG4uTWVzc2FnZShcbiAgICAgIGkxOG5vZGVzLFxuICAgICAgY29udGV4dC5wbGFjZWhvbGRlclRvQ29udGVudCxcbiAgICAgIGNvbnRleHQucGxhY2Vob2xkZXJUb01lc3NhZ2UsXG4gICAgICBtZWFuaW5nLFxuICAgICAgZGVzY3JpcHRpb24sXG4gICAgICBjdXN0b21JZCxcbiAgICApO1xuICB9XG5cbiAgdmlzaXRFbGVtZW50KGVsOiBodG1sLkVsZW1lbnQsIGNvbnRleHQ6IEkxOG5NZXNzYWdlVmlzaXRvckNvbnRleHQpOiBpMThuLk5vZGUge1xuICAgIGNvbnN0IGNoaWxkcmVuID0gaHRtbC52aXNpdEFsbCh0aGlzLCBlbC5jaGlsZHJlbiwgY29udGV4dCk7XG4gICAgY29uc3QgYXR0cnM6IHtbazogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuICAgIGVsLmF0dHJzLmZvckVhY2goKGF0dHIpID0+IHtcbiAgICAgIC8vIERvIG5vdCB2aXNpdCB0aGUgYXR0cmlidXRlcywgdHJhbnNsYXRhYmxlIG9uZXMgYXJlIHRvcC1sZXZlbCBBU1RzXG4gICAgICBhdHRyc1thdHRyLm5hbWVdID0gYXR0ci52YWx1ZTtcbiAgICB9KTtcblxuICAgIGNvbnN0IGlzVm9pZDogYm9vbGVhbiA9IGdldEh0bWxUYWdEZWZpbml0aW9uKGVsLm5hbWUpLmlzVm9pZDtcbiAgICBjb25zdCBzdGFydFBoTmFtZSA9IGNvbnRleHQucGxhY2Vob2xkZXJSZWdpc3RyeS5nZXRTdGFydFRhZ1BsYWNlaG9sZGVyTmFtZShcbiAgICAgIGVsLm5hbWUsXG4gICAgICBhdHRycyxcbiAgICAgIGlzVm9pZCxcbiAgICApO1xuICAgIGNvbnRleHQucGxhY2Vob2xkZXJUb0NvbnRlbnRbc3RhcnRQaE5hbWVdID0ge1xuICAgICAgdGV4dDogZWwuc3RhcnRTb3VyY2VTcGFuLnRvU3RyaW5nKCksXG4gICAgICBzb3VyY2VTcGFuOiBlbC5zdGFydFNvdXJjZVNwYW4sXG4gICAgfTtcblxuICAgIGxldCBjbG9zZVBoTmFtZSA9ICcnO1xuXG4gICAgaWYgKCFpc1ZvaWQpIHtcbiAgICAgIGNsb3NlUGhOYW1lID0gY29udGV4dC5wbGFjZWhvbGRlclJlZ2lzdHJ5LmdldENsb3NlVGFnUGxhY2Vob2xkZXJOYW1lKGVsLm5hbWUpO1xuICAgICAgY29udGV4dC5wbGFjZWhvbGRlclRvQ29udGVudFtjbG9zZVBoTmFtZV0gPSB7XG4gICAgICAgIHRleHQ6IGA8LyR7ZWwubmFtZX0+YCxcbiAgICAgICAgc291cmNlU3BhbjogZWwuZW5kU291cmNlU3BhbiA/PyBlbC5zb3VyY2VTcGFuLFxuICAgICAgfTtcbiAgICB9XG5cbiAgICBjb25zdCBub2RlID0gbmV3IGkxOG4uVGFnUGxhY2Vob2xkZXIoXG4gICAgICBlbC5uYW1lLFxuICAgICAgYXR0cnMsXG4gICAgICBzdGFydFBoTmFtZSxcbiAgICAgIGNsb3NlUGhOYW1lLFxuICAgICAgY2hpbGRyZW4sXG4gICAgICBpc1ZvaWQsXG4gICAgICBlbC5zb3VyY2VTcGFuLFxuICAgICAgZWwuc3RhcnRTb3VyY2VTcGFuLFxuICAgICAgZWwuZW5kU291cmNlU3BhbixcbiAgICApO1xuICAgIHJldHVybiBjb250ZXh0LnZpc2l0Tm9kZUZuKGVsLCBub2RlKTtcbiAgfVxuXG4gIHZpc2l0QXR0cmlidXRlKGF0dHJpYnV0ZTogaHRtbC5BdHRyaWJ1dGUsIGNvbnRleHQ6IEkxOG5NZXNzYWdlVmlzaXRvckNvbnRleHQpOiBpMThuLk5vZGUge1xuICAgIGNvbnN0IG5vZGUgPVxuICAgICAgYXR0cmlidXRlLnZhbHVlVG9rZW5zID09PSB1bmRlZmluZWQgfHwgYXR0cmlidXRlLnZhbHVlVG9rZW5zLmxlbmd0aCA9PT0gMVxuICAgICAgICA/IG5ldyBpMThuLlRleHQoYXR0cmlidXRlLnZhbHVlLCBhdHRyaWJ1dGUudmFsdWVTcGFuIHx8IGF0dHJpYnV0ZS5zb3VyY2VTcGFuKVxuICAgICAgICA6IHRoaXMuX3Zpc2l0VGV4dFdpdGhJbnRlcnBvbGF0aW9uKFxuICAgICAgICAgICAgYXR0cmlidXRlLnZhbHVlVG9rZW5zLFxuICAgICAgICAgICAgYXR0cmlidXRlLnZhbHVlU3BhbiB8fCBhdHRyaWJ1dGUuc291cmNlU3BhbixcbiAgICAgICAgICAgIGNvbnRleHQsXG4gICAgICAgICAgICBhdHRyaWJ1dGUuaTE4bixcbiAgICAgICAgICApO1xuICAgIHJldHVybiBjb250ZXh0LnZpc2l0Tm9kZUZuKGF0dHJpYnV0ZSwgbm9kZSk7XG4gIH1cblxuICB2aXNpdFRleHQodGV4dDogaHRtbC5UZXh0LCBjb250ZXh0OiBJMThuTWVzc2FnZVZpc2l0b3JDb250ZXh0KTogaTE4bi5Ob2RlIHtcbiAgICBjb25zdCBub2RlID1cbiAgICAgIHRleHQudG9rZW5zLmxlbmd0aCA9PT0gMVxuICAgICAgICA/IG5ldyBpMThuLlRleHQodGV4dC52YWx1ZSwgdGV4dC5zb3VyY2VTcGFuKVxuICAgICAgICA6IHRoaXMuX3Zpc2l0VGV4dFdpdGhJbnRlcnBvbGF0aW9uKHRleHQudG9rZW5zLCB0ZXh0LnNvdXJjZVNwYW4sIGNvbnRleHQsIHRleHQuaTE4bik7XG4gICAgcmV0dXJuIGNvbnRleHQudmlzaXROb2RlRm4odGV4dCwgbm9kZSk7XG4gIH1cblxuICB2aXNpdENvbW1lbnQoY29tbWVudDogaHRtbC5Db21tZW50LCBjb250ZXh0OiBJMThuTWVzc2FnZVZpc2l0b3JDb250ZXh0KTogaTE4bi5Ob2RlIHwgbnVsbCB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICB2aXNpdEV4cGFuc2lvbihpY3U6IGh0bWwuRXhwYW5zaW9uLCBjb250ZXh0OiBJMThuTWVzc2FnZVZpc2l0b3JDb250ZXh0KTogaTE4bi5Ob2RlIHtcbiAgICBjb250ZXh0LmljdURlcHRoKys7XG4gICAgY29uc3QgaTE4bkljdUNhc2VzOiB7W2s6IHN0cmluZ106IGkxOG4uTm9kZX0gPSB7fTtcbiAgICBjb25zdCBpMThuSWN1ID0gbmV3IGkxOG4uSWN1KGljdS5zd2l0Y2hWYWx1ZSwgaWN1LnR5cGUsIGkxOG5JY3VDYXNlcywgaWN1LnNvdXJjZVNwYW4pO1xuICAgIGljdS5jYXNlcy5mb3JFYWNoKChjYXplKTogdm9pZCA9PiB7XG4gICAgICBpMThuSWN1Q2FzZXNbY2F6ZS52YWx1ZV0gPSBuZXcgaTE4bi5Db250YWluZXIoXG4gICAgICAgIGNhemUuZXhwcmVzc2lvbi5tYXAoKG5vZGUpID0+IG5vZGUudmlzaXQodGhpcywgY29udGV4dCkpLFxuICAgICAgICBjYXplLmV4cFNvdXJjZVNwYW4sXG4gICAgICApO1xuICAgIH0pO1xuICAgIGNvbnRleHQuaWN1RGVwdGgtLTtcblxuICAgIGlmIChjb250ZXh0LmlzSWN1IHx8IGNvbnRleHQuaWN1RGVwdGggPiAwKSB7XG4gICAgICAvLyBSZXR1cm5zIGFuIElDVSBub2RlIHdoZW46XG4gICAgICAvLyAtIHRoZSBtZXNzYWdlICh2cyBhIHBhcnQgb2YgdGhlIG1lc3NhZ2UpIGlzIGFuIElDVSBtZXNzYWdlLCBvclxuICAgICAgLy8gLSB0aGUgSUNVIG1lc3NhZ2UgaXMgbmVzdGVkLlxuICAgICAgY29uc3QgZXhwUGggPSBjb250ZXh0LnBsYWNlaG9sZGVyUmVnaXN0cnkuZ2V0VW5pcXVlUGxhY2Vob2xkZXIoYFZBUl8ke2ljdS50eXBlfWApO1xuICAgICAgaTE4bkljdS5leHByZXNzaW9uUGxhY2Vob2xkZXIgPSBleHBQaDtcbiAgICAgIGNvbnRleHQucGxhY2Vob2xkZXJUb0NvbnRlbnRbZXhwUGhdID0ge1xuICAgICAgICB0ZXh0OiBpY3Uuc3dpdGNoVmFsdWUsXG4gICAgICAgIHNvdXJjZVNwYW46IGljdS5zd2l0Y2hWYWx1ZVNvdXJjZVNwYW4sXG4gICAgICB9O1xuICAgICAgcmV0dXJuIGNvbnRleHQudmlzaXROb2RlRm4oaWN1LCBpMThuSWN1KTtcbiAgICB9XG5cbiAgICAvLyBFbHNlIHJldHVybnMgYSBwbGFjZWhvbGRlclxuICAgIC8vIElDVSBwbGFjZWhvbGRlcnMgc2hvdWxkIG5vdCBiZSByZXBsYWNlZCB3aXRoIHRoZWlyIG9yaWdpbmFsIGNvbnRlbnQgYnV0IHdpdGggdGhlIHRoZWlyXG4gICAgLy8gdHJhbnNsYXRpb25zLlxuICAgIC8vIFRPRE8odmljYik6IGFkZCBhIGh0bWwuTm9kZSAtPiBpMThuLk1lc3NhZ2UgY2FjaGUgdG8gYXZvaWQgaGF2aW5nIHRvIHJlLWNyZWF0ZSB0aGUgbXNnXG4gICAgY29uc3QgcGhOYW1lID0gY29udGV4dC5wbGFjZWhvbGRlclJlZ2lzdHJ5LmdldFBsYWNlaG9sZGVyTmFtZSgnSUNVJywgaWN1LnNvdXJjZVNwYW4udG9TdHJpbmcoKSk7XG4gICAgY29udGV4dC5wbGFjZWhvbGRlclRvTWVzc2FnZVtwaE5hbWVdID0gdGhpcy50b0kxOG5NZXNzYWdlKFtpY3VdLCAnJywgJycsICcnLCB1bmRlZmluZWQpO1xuICAgIGNvbnN0IG5vZGUgPSBuZXcgaTE4bi5JY3VQbGFjZWhvbGRlcihpMThuSWN1LCBwaE5hbWUsIGljdS5zb3VyY2VTcGFuKTtcbiAgICByZXR1cm4gY29udGV4dC52aXNpdE5vZGVGbihpY3UsIG5vZGUpO1xuICB9XG5cbiAgdmlzaXRFeHBhbnNpb25DYXNlKF9pY3VDYXNlOiBodG1sLkV4cGFuc2lvbkNhc2UsIF9jb250ZXh0OiBJMThuTWVzc2FnZVZpc2l0b3JDb250ZXh0KTogaTE4bi5Ob2RlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1VucmVhY2hhYmxlIGNvZGUnKTtcbiAgfVxuXG4gIHZpc2l0QmxvY2soYmxvY2s6IGh0bWwuQmxvY2ssIGNvbnRleHQ6IEkxOG5NZXNzYWdlVmlzaXRvckNvbnRleHQpIHtcbiAgICBjb25zdCBjaGlsZHJlbiA9IGh0bWwudmlzaXRBbGwodGhpcywgYmxvY2suY2hpbGRyZW4sIGNvbnRleHQpO1xuXG4gICAgaWYgKHRoaXMuX2NvbnRhaW5lckJsb2Nrcy5oYXMoYmxvY2submFtZSkpIHtcbiAgICAgIHJldHVybiBuZXcgaTE4bi5Db250YWluZXIoY2hpbGRyZW4sIGJsb2NrLnNvdXJjZVNwYW4pO1xuICAgIH1cblxuICAgIGNvbnN0IHBhcmFtZXRlcnMgPSBibG9jay5wYXJhbWV0ZXJzLm1hcCgocGFyYW0pID0+IHBhcmFtLmV4cHJlc3Npb24pO1xuICAgIGNvbnN0IHN0YXJ0UGhOYW1lID0gY29udGV4dC5wbGFjZWhvbGRlclJlZ2lzdHJ5LmdldFN0YXJ0QmxvY2tQbGFjZWhvbGRlck5hbWUoXG4gICAgICBibG9jay5uYW1lLFxuICAgICAgcGFyYW1ldGVycyxcbiAgICApO1xuICAgIGNvbnN0IGNsb3NlUGhOYW1lID0gY29udGV4dC5wbGFjZWhvbGRlclJlZ2lzdHJ5LmdldENsb3NlQmxvY2tQbGFjZWhvbGRlck5hbWUoYmxvY2submFtZSk7XG5cbiAgICBjb250ZXh0LnBsYWNlaG9sZGVyVG9Db250ZW50W3N0YXJ0UGhOYW1lXSA9IHtcbiAgICAgIHRleHQ6IGJsb2NrLnN0YXJ0U291cmNlU3Bhbi50b1N0cmluZygpLFxuICAgICAgc291cmNlU3BhbjogYmxvY2suc3RhcnRTb3VyY2VTcGFuLFxuICAgIH07XG5cbiAgICBjb250ZXh0LnBsYWNlaG9sZGVyVG9Db250ZW50W2Nsb3NlUGhOYW1lXSA9IHtcbiAgICAgIHRleHQ6IGJsb2NrLmVuZFNvdXJjZVNwYW4gPyBibG9jay5lbmRTb3VyY2VTcGFuLnRvU3RyaW5nKCkgOiAnfScsXG4gICAgICBzb3VyY2VTcGFuOiBibG9jay5lbmRTb3VyY2VTcGFuID8/IGJsb2NrLnNvdXJjZVNwYW4sXG4gICAgfTtcblxuICAgIGNvbnN0IG5vZGUgPSBuZXcgaTE4bi5CbG9ja1BsYWNlaG9sZGVyKFxuICAgICAgYmxvY2submFtZSxcbiAgICAgIHBhcmFtZXRlcnMsXG4gICAgICBzdGFydFBoTmFtZSxcbiAgICAgIGNsb3NlUGhOYW1lLFxuICAgICAgY2hpbGRyZW4sXG4gICAgICBibG9jay5zb3VyY2VTcGFuLFxuICAgICAgYmxvY2suc3RhcnRTb3VyY2VTcGFuLFxuICAgICAgYmxvY2suZW5kU291cmNlU3BhbixcbiAgICApO1xuICAgIHJldHVybiBjb250ZXh0LnZpc2l0Tm9kZUZuKGJsb2NrLCBub2RlKTtcbiAgfVxuXG4gIHZpc2l0QmxvY2tQYXJhbWV0ZXIoX3BhcmFtZXRlcjogaHRtbC5CbG9ja1BhcmFtZXRlciwgX2NvbnRleHQ6IEkxOG5NZXNzYWdlVmlzaXRvckNvbnRleHQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1VucmVhY2hhYmxlIGNvZGUnKTtcbiAgfVxuXG4gIHZpc2l0TGV0RGVjbGFyYXRpb24oZGVjbDogaHRtbC5MZXREZWNsYXJhdGlvbiwgY29udGV4dDogYW55KSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydCwgdGV4dCBhbmQgaW50ZXJwb2xhdGVkIHRva2VucyB1cCBpbnRvIHRleHQgYW5kIHBsYWNlaG9sZGVyIHBpZWNlcy5cbiAgICpcbiAgICogQHBhcmFtIHRva2VucyBUaGUgdGV4dCBhbmQgaW50ZXJwb2xhdGVkIHRva2Vucy5cbiAgICogQHBhcmFtIHNvdXJjZVNwYW4gVGhlIHNwYW4gb2YgdGhlIHdob2xlIG9mIHRoZSBgdGV4dGAgc3RyaW5nLlxuICAgKiBAcGFyYW0gY29udGV4dCBUaGUgY3VycmVudCBjb250ZXh0IG9mIHRoZSB2aXNpdG9yLCB1c2VkIHRvIGNvbXB1dGUgYW5kIHN0b3JlIHBsYWNlaG9sZGVycy5cbiAgICogQHBhcmFtIHByZXZpb3VzSTE4biBBbnkgaTE4biBtZXRhZGF0YSBhc3NvY2lhdGVkIHdpdGggdGhpcyBgdGV4dGAgZnJvbSBhIHByZXZpb3VzIHBhc3MuXG4gICAqL1xuICBwcml2YXRlIF92aXNpdFRleHRXaXRoSW50ZXJwb2xhdGlvbihcbiAgICB0b2tlbnM6IChJbnRlcnBvbGF0ZWRUZXh0VG9rZW4gfCBJbnRlcnBvbGF0ZWRBdHRyaWJ1dGVUb2tlbilbXSxcbiAgICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgY29udGV4dDogSTE4bk1lc3NhZ2VWaXNpdG9yQ29udGV4dCxcbiAgICBwcmV2aW91c0kxOG46IGkxOG4uSTE4bk1ldGEgfCB1bmRlZmluZWQsXG4gICk6IGkxOG4uTm9kZSB7XG4gICAgLy8gUmV0dXJuIGEgc2VxdWVuY2Ugb2YgYFRleHRgIGFuZCBgUGxhY2Vob2xkZXJgIG5vZGVzIGdyb3VwZWQgaW4gYSBgQ29udGFpbmVyYC5cbiAgICBjb25zdCBub2RlczogaTE4bi5Ob2RlW10gPSBbXTtcbiAgICAvLyBXZSB3aWxsIG9ubHkgY3JlYXRlIGEgY29udGFpbmVyIGlmIHRoZXJlIGFyZSBhY3R1YWxseSBpbnRlcnBvbGF0aW9ucyxcbiAgICAvLyBzbyB0aGlzIGZsYWcgdHJhY2tzIHRoYXQuXG4gICAgbGV0IGhhc0ludGVycG9sYXRpb24gPSBmYWxzZTtcbiAgICBmb3IgKGNvbnN0IHRva2VuIG9mIHRva2Vucykge1xuICAgICAgc3dpdGNoICh0b2tlbi50eXBlKSB7XG4gICAgICAgIGNhc2UgVG9rZW5UeXBlLklOVEVSUE9MQVRJT046XG4gICAgICAgIGNhc2UgVG9rZW5UeXBlLkFUVFJfVkFMVUVfSU5URVJQT0xBVElPTjpcbiAgICAgICAgICBoYXNJbnRlcnBvbGF0aW9uID0gdHJ1ZTtcbiAgICAgICAgICBjb25zdCBleHByZXNzaW9uID0gdG9rZW4ucGFydHNbMV07XG4gICAgICAgICAgY29uc3QgYmFzZU5hbWUgPSBleHRyYWN0UGxhY2Vob2xkZXJOYW1lKGV4cHJlc3Npb24pIHx8ICdJTlRFUlBPTEFUSU9OJztcbiAgICAgICAgICBjb25zdCBwaE5hbWUgPSBjb250ZXh0LnBsYWNlaG9sZGVyUmVnaXN0cnkuZ2V0UGxhY2Vob2xkZXJOYW1lKGJhc2VOYW1lLCBleHByZXNzaW9uKTtcbiAgICAgICAgICBjb250ZXh0LnBsYWNlaG9sZGVyVG9Db250ZW50W3BoTmFtZV0gPSB7XG4gICAgICAgICAgICB0ZXh0OiB0b2tlbi5wYXJ0cy5qb2luKCcnKSxcbiAgICAgICAgICAgIHNvdXJjZVNwYW46IHRva2VuLnNvdXJjZVNwYW4sXG4gICAgICAgICAgfTtcbiAgICAgICAgICBub2Rlcy5wdXNoKG5ldyBpMThuLlBsYWNlaG9sZGVyKGV4cHJlc3Npb24sIHBoTmFtZSwgdG9rZW4uc291cmNlU3BhbikpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIC8vIFRyeSB0byBtZXJnZSB0ZXh0IHRva2VucyB3aXRoIHByZXZpb3VzIHRva2Vucy4gV2UgZG8gdGhpcyBldmVuIGZvciBhbGwgdG9rZW5zXG4gICAgICAgICAgLy8gd2hlbiBgcmV0YWluRW1wdHlUb2tlbnMgPT0gdHJ1ZWAgYmVjYXVzZSB3aGl0ZXNwYWNlIHRva2VucyBtYXkgaGF2ZSBub24temVyb1xuICAgICAgICAgIC8vIGxlbmd0aCwgYnV0IHdpbGwgYmUgdHJpbW1lZCBieSBgV2hpdGVzcGFjZVZpc2l0b3JgIGluIG9uZSBleHRyYWN0aW9uIHBhc3MgYW5kXG4gICAgICAgICAgLy8gYmUgY29uc2lkZXJlZCBcImVtcHR5XCIgdGhlcmUuIFRoZXJlZm9yZSBhIHdoaXRlc3BhY2UgdG9rZW4gd2l0aFxuICAgICAgICAgIC8vIGByZXRhaW5FbXB0eVRva2VucyA9PT0gdHJ1ZWAgc2hvdWxkIGJlIHRyZWF0ZWQgbGlrZSBhbiBlbXB0eSB0b2tlbiBhbmQgZWl0aGVyXG4gICAgICAgICAgLy8gcmV0YWluZWQgb3IgbWVyZ2VkIGludG8gdGhlIHByZXZpb3VzIG5vZGUuIFNpbmNlIGV4dHJhY3Rpb24gZG9lcyB0d28gcGFzc2VzIHdpdGhcbiAgICAgICAgICAvLyBkaWZmZXJlbnQgdHJpbW1pbmcgYmVoYXZpb3IsIHRoZSBzZWNvbmQgcGFzcyBuZWVkcyB0byBoYXZlIGlkZW50aWNhbCBub2RlIGNvdW50XG4gICAgICAgICAgLy8gdG8gcmV1c2Ugc291cmNlIHNwYW5zLCBzbyB3ZSBuZWVkIHRoaXMgY2hlY2sgdG8gZ2V0IHRoZSBzYW1lIGFuc3dlciB3aGVuIGJvdGhcbiAgICAgICAgICAvLyB0cmltbWluZyBhbmQgbm90IHRyaW1taW5nLlxuICAgICAgICAgIGlmICh0b2tlbi5wYXJ0c1swXS5sZW5ndGggPiAwIHx8IHRoaXMuX3JldGFpbkVtcHR5VG9rZW5zKSB7XG4gICAgICAgICAgICAvLyBUaGlzIHRva2VuIGlzIHRleHQgb3IgYW4gZW5jb2RlZCBlbnRpdHkuXG4gICAgICAgICAgICAvLyBJZiBpdCBpcyBmb2xsb3dpbmcgb24gZnJvbSBhIHByZXZpb3VzIHRleHQgbm9kZSB0aGVuIG1lcmdlIGl0IGludG8gdGhhdCBub2RlXG4gICAgICAgICAgICAvLyBPdGhlcndpc2UsIGlmIGl0IGlzIGZvbGxvd2luZyBhbiBpbnRlcnBvbGF0aW9uLCB0aGVuIGFkZCBhIG5ldyBub2RlLlxuICAgICAgICAgICAgY29uc3QgcHJldmlvdXMgPSBub2Rlc1tub2Rlcy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgIGlmIChwcmV2aW91cyBpbnN0YW5jZW9mIGkxOG4uVGV4dCkge1xuICAgICAgICAgICAgICBwcmV2aW91cy52YWx1ZSArPSB0b2tlbi5wYXJ0c1swXTtcbiAgICAgICAgICAgICAgcHJldmlvdXMuc291cmNlU3BhbiA9IG5ldyBQYXJzZVNvdXJjZVNwYW4oXG4gICAgICAgICAgICAgICAgcHJldmlvdXMuc291cmNlU3Bhbi5zdGFydCxcbiAgICAgICAgICAgICAgICB0b2tlbi5zb3VyY2VTcGFuLmVuZCxcbiAgICAgICAgICAgICAgICBwcmV2aW91cy5zb3VyY2VTcGFuLmZ1bGxTdGFydCxcbiAgICAgICAgICAgICAgICBwcmV2aW91cy5zb3VyY2VTcGFuLmRldGFpbHMsXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBub2Rlcy5wdXNoKG5ldyBpMThuLlRleHQodG9rZW4ucGFydHNbMF0sIHRva2VuLnNvdXJjZVNwYW4pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gUmV0YWluIGVtcHR5IHRva2VucyB0byBhdm9pZCBicmVha2luZyBkcm9wcGluZyBlbnRpcmUgbm9kZXMgc3VjaCB0aGF0IHNvdXJjZVxuICAgICAgICAgICAgLy8gc3BhbnMgc2hvdWxkIG5vdCBiZSByZXVzYWJsZSBhY3Jvc3MgbXVsdGlwbGUgcGFyc2VzIG9mIGEgdGVtcGxhdGUuIFdlICpzaG91bGQqXG4gICAgICAgICAgICAvLyBkbyB0aGlzIGFsbCB0aGUgdGltZSwgaG93ZXZlciB3ZSBuZWVkIHRvIG1haW50YWluIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5XG4gICAgICAgICAgICAvLyB3aXRoIGV4aXN0aW5nIG1lc3NhZ2UgSURzIHNvIHdlIGNhbid0IGRvIGl0IGJ5IGRlZmF1bHQgYW5kIHNob3VsZCBvbmx5IGVuYWJsZVxuICAgICAgICAgICAgLy8gdGhpcyB3aGVuIHJlbW92aW5nIHNpZ25pZmljYW50IHdoaXRlc3BhY2UuXG4gICAgICAgICAgICBpZiAodGhpcy5fcmV0YWluRW1wdHlUb2tlbnMpIHtcbiAgICAgICAgICAgICAgbm9kZXMucHVzaChuZXcgaTE4bi5UZXh0KHRva2VuLnBhcnRzWzBdLCB0b2tlbi5zb3VyY2VTcGFuKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGhhc0ludGVycG9sYXRpb24pIHtcbiAgICAgIC8vIFdoaXRlc3BhY2UgcmVtb3ZhbCBtYXkgaGF2ZSBpbnZhbGlkYXRlZCB0aGUgaW50ZXJwb2xhdGlvbiBzb3VyY2Utc3BhbnMuXG4gICAgICByZXVzZVByZXZpb3VzU291cmNlU3BhbnMobm9kZXMsIHByZXZpb3VzSTE4bik7XG4gICAgICByZXR1cm4gbmV3IGkxOG4uQ29udGFpbmVyKG5vZGVzLCBzb3VyY2VTcGFuKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG5vZGVzWzBdO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFJlLXVzZSB0aGUgc291cmNlLXNwYW5zIGZyb20gYHByZXZpb3VzSTE4bmAgbWV0YWRhdGEgZm9yIHRoZSBgbm9kZXNgLlxuICpcbiAqIFdoaXRlc3BhY2UgcmVtb3ZhbCBjYW4gaW52YWxpZGF0ZSB0aGUgc291cmNlLXNwYW5zIG9mIGludGVycG9sYXRpb24gbm9kZXMsIHNvIHdlXG4gKiByZXVzZSB0aGUgc291cmNlLXNwYW4gc3RvcmVkIGZyb20gYSBwcmV2aW91cyBwYXNzIGJlZm9yZSB0aGUgd2hpdGVzcGFjZSB3YXMgcmVtb3ZlZC5cbiAqXG4gKiBAcGFyYW0gbm9kZXMgVGhlIGBUZXh0YCBhbmQgYFBsYWNlaG9sZGVyYCBub2RlcyB0byBiZSBwcm9jZXNzZWQuXG4gKiBAcGFyYW0gcHJldmlvdXNJMThuIEFueSBpMThuIG1ldGFkYXRhIGZvciB0aGVzZSBgbm9kZXNgIHN0b3JlZCBmcm9tIGEgcHJldmlvdXMgcGFzcy5cbiAqL1xuZnVuY3Rpb24gcmV1c2VQcmV2aW91c1NvdXJjZVNwYW5zKFxuICBub2RlczogaTE4bi5Ob2RlW10sXG4gIHByZXZpb3VzSTE4bjogaTE4bi5JMThuTWV0YSB8IHVuZGVmaW5lZCxcbik6IHZvaWQge1xuICBpZiAocHJldmlvdXNJMThuIGluc3RhbmNlb2YgaTE4bi5NZXNzYWdlKSB7XG4gICAgLy8gVGhlIGBwcmV2aW91c0kxOG5gIGlzIGFuIGkxOG4gYE1lc3NhZ2VgLCBzbyB3ZSBhcmUgcHJvY2Vzc2luZyBhbiBgQXR0cmlidXRlYCB3aXRoIGkxOG5cbiAgICAvLyBtZXRhZGF0YS4gVGhlIGBNZXNzYWdlYCBzaG91bGQgY29uc2lzdCBvbmx5IG9mIGEgc2luZ2xlIGBDb250YWluZXJgIHRoYXQgY29udGFpbnMgdGhlXG4gICAgLy8gcGFydHMgKGBUZXh0YCBhbmQgYFBsYWNlaG9sZGVyYCkgdG8gcHJvY2Vzcy5cbiAgICBhc3NlcnRTaW5nbGVDb250YWluZXJNZXNzYWdlKHByZXZpb3VzSTE4bik7XG4gICAgcHJldmlvdXNJMThuID0gcHJldmlvdXNJMThuLm5vZGVzWzBdO1xuICB9XG5cbiAgaWYgKHByZXZpb3VzSTE4biBpbnN0YW5jZW9mIGkxOG4uQ29udGFpbmVyKSB7XG4gICAgLy8gVGhlIGBwcmV2aW91c0kxOG5gIGlzIGEgYENvbnRhaW5lcmAsIHdoaWNoIG1lYW5zIHRoYXQgdGhpcyBpcyBhIHNlY29uZCBpMThuIGV4dHJhY3Rpb24gcGFzc1xuICAgIC8vIGFmdGVyIHdoaXRlc3BhY2UgaGFzIGJlZW4gcmVtb3ZlZCBmcm9tIHRoZSBBU1Qgbm9kZXMuXG4gICAgYXNzZXJ0RXF1aXZhbGVudE5vZGVzKHByZXZpb3VzSTE4bi5jaGlsZHJlbiwgbm9kZXMpO1xuXG4gICAgLy8gUmV1c2UgdGhlIHNvdXJjZS1zcGFucyBmcm9tIHRoZSBmaXJzdCBwYXNzLlxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIG5vZGVzW2ldLnNvdXJjZVNwYW4gPSBwcmV2aW91c0kxOG4uY2hpbGRyZW5baV0uc291cmNlU3BhbjtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBBc3NlcnRzIHRoYXQgdGhlIGBtZXNzYWdlYCBjb250YWlucyBleGFjdGx5IG9uZSBgQ29udGFpbmVyYCBub2RlLlxuICovXG5mdW5jdGlvbiBhc3NlcnRTaW5nbGVDb250YWluZXJNZXNzYWdlKG1lc3NhZ2U6IGkxOG4uTWVzc2FnZSk6IHZvaWQge1xuICBjb25zdCBub2RlcyA9IG1lc3NhZ2Uubm9kZXM7XG4gIGlmIChub2Rlcy5sZW5ndGggIT09IDEgfHwgIShub2Rlc1swXSBpbnN0YW5jZW9mIGkxOG4uQ29udGFpbmVyKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICdVbmV4cGVjdGVkIHByZXZpb3VzIGkxOG4gbWVzc2FnZSAtIGV4cGVjdGVkIGl0IHRvIGNvbnNpc3Qgb2Ygb25seSBhIHNpbmdsZSBgQ29udGFpbmVyYCBub2RlLicsXG4gICAgKTtcbiAgfVxufVxuXG4vKipcbiAqIEFzc2VydHMgdGhhdCB0aGUgYHByZXZpb3VzTm9kZXNgIGFuZCBgbm9kZWAgY29sbGVjdGlvbnMgaGF2ZSB0aGUgc2FtZSBudW1iZXIgb2YgZWxlbWVudHMgYW5kXG4gKiBjb3JyZXNwb25kaW5nIGVsZW1lbnRzIGhhdmUgdGhlIHNhbWUgbm9kZSB0eXBlLlxuICovXG5mdW5jdGlvbiBhc3NlcnRFcXVpdmFsZW50Tm9kZXMocHJldmlvdXNOb2RlczogaTE4bi5Ob2RlW10sIG5vZGVzOiBpMThuLk5vZGVbXSk6IHZvaWQge1xuICBpZiAocHJldmlvdXNOb2Rlcy5sZW5ndGggIT09IG5vZGVzLmxlbmd0aCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgIGBcblRoZSBudW1iZXIgb2YgaTE4biBtZXNzYWdlIGNoaWxkcmVuIGNoYW5nZWQgYmV0d2VlbiBmaXJzdCBhbmQgc2Vjb25kIHBhc3MuXG5cbkZpcnN0IHBhc3MgKCR7cHJldmlvdXNOb2Rlcy5sZW5ndGh9IHRva2Vucyk6XG4ke3ByZXZpb3VzTm9kZXMubWFwKChub2RlKSA9PiBgXCIke25vZGUuc291cmNlU3Bhbi50b1N0cmluZygpfVwiYCkuam9pbignXFxuJyl9XG5cblNlY29uZCBwYXNzICgke25vZGVzLmxlbmd0aH0gdG9rZW5zKTpcbiR7bm9kZXMubWFwKChub2RlKSA9PiBgXCIke25vZGUuc291cmNlU3Bhbi50b1N0cmluZygpfVwiYCkuam9pbignXFxuJyl9XG4gICAgYC50cmltKCksXG4gICAgKTtcbiAgfVxuICBpZiAocHJldmlvdXNOb2Rlcy5zb21lKChub2RlLCBpKSA9PiBub2Rlc1tpXS5jb25zdHJ1Y3RvciAhPT0gbm9kZS5jb25zdHJ1Y3RvcikpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAnVGhlIHR5cGVzIG9mIHRoZSBpMThuIG1lc3NhZ2UgY2hpbGRyZW4gY2hhbmdlZCBiZXR3ZWVuIGZpcnN0IGFuZCBzZWNvbmQgcGFzcy4nLFxuICAgICk7XG4gIH1cbn1cblxuY29uc3QgX0NVU1RPTV9QSF9FWFAgPVxuICAvXFwvXFwvW1xcc1xcU10qaTE4bltcXHNcXFNdKlxcKFtcXHNcXFNdKnBoW1xcc1xcU10qPVtcXHNcXFNdKihcInwnKShbXFxzXFxTXSo/KVxcMVtcXHNcXFNdKlxcKS9nO1xuXG5mdW5jdGlvbiBleHRyYWN0UGxhY2Vob2xkZXJOYW1lKGlucHV0OiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gaW5wdXQuc3BsaXQoX0NVU1RPTV9QSF9FWFApWzJdO1xufVxuIl19