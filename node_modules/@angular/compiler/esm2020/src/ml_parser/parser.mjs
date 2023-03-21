/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ParseError, ParseSourceSpan } from '../parse_util';
import * as html from './ast';
import { NAMED_ENTITIES } from './entities';
import { tokenize } from './lexer';
import { getNsPrefix, mergeNsAndName, splitNsName } from './tags';
export class TreeError extends ParseError {
    static create(elementName, span, msg) {
        return new TreeError(elementName, span, msg);
    }
    constructor(elementName, span, msg) {
        super(span, msg);
        this.elementName = elementName;
    }
}
export class ParseTreeResult {
    constructor(rootNodes, errors) {
        this.rootNodes = rootNodes;
        this.errors = errors;
    }
}
export class Parser {
    constructor(getTagDefinition) {
        this.getTagDefinition = getTagDefinition;
    }
    parse(source, url, options) {
        const tokenizeResult = tokenize(source, url, this.getTagDefinition, options);
        const parser = new _TreeBuilder(tokenizeResult.tokens, this.getTagDefinition);
        parser.build();
        return new ParseTreeResult(parser.rootNodes, tokenizeResult.errors.concat(parser.errors));
    }
}
class _TreeBuilder {
    constructor(tokens, getTagDefinition) {
        this.tokens = tokens;
        this.getTagDefinition = getTagDefinition;
        this._index = -1;
        this._elementStack = [];
        this.rootNodes = [];
        this.errors = [];
        this._advance();
    }
    build() {
        while (this._peek.type !== 24 /* TokenType.EOF */) {
            if (this._peek.type === 0 /* TokenType.TAG_OPEN_START */ ||
                this._peek.type === 4 /* TokenType.INCOMPLETE_TAG_OPEN */) {
                this._consumeStartTag(this._advance());
            }
            else if (this._peek.type === 3 /* TokenType.TAG_CLOSE */) {
                this._consumeEndTag(this._advance());
            }
            else if (this._peek.type === 12 /* TokenType.CDATA_START */) {
                this._closeVoidElement();
                this._consumeCdata(this._advance());
            }
            else if (this._peek.type === 10 /* TokenType.COMMENT_START */) {
                this._closeVoidElement();
                this._consumeComment(this._advance());
            }
            else if (this._peek.type === 5 /* TokenType.TEXT */ || this._peek.type === 7 /* TokenType.RAW_TEXT */ ||
                this._peek.type === 6 /* TokenType.ESCAPABLE_RAW_TEXT */) {
                this._closeVoidElement();
                this._consumeText(this._advance());
            }
            else if (this._peek.type === 19 /* TokenType.EXPANSION_FORM_START */) {
                this._consumeExpansion(this._advance());
            }
            else {
                // Skip all other tokens...
                this._advance();
            }
        }
    }
    _advance() {
        const prev = this._peek;
        if (this._index < this.tokens.length - 1) {
            // Note: there is always an EOF token at the end
            this._index++;
        }
        this._peek = this.tokens[this._index];
        return prev;
    }
    _advanceIf(type) {
        if (this._peek.type === type) {
            return this._advance();
        }
        return null;
    }
    _consumeCdata(_startToken) {
        this._consumeText(this._advance());
        this._advanceIf(13 /* TokenType.CDATA_END */);
    }
    _consumeComment(token) {
        const text = this._advanceIf(7 /* TokenType.RAW_TEXT */);
        this._advanceIf(11 /* TokenType.COMMENT_END */);
        const value = text != null ? text.parts[0].trim() : null;
        this._addToParent(new html.Comment(value, token.sourceSpan));
    }
    _consumeExpansion(token) {
        const switchValue = this._advance();
        const type = this._advance();
        const cases = [];
        // read =
        while (this._peek.type === 20 /* TokenType.EXPANSION_CASE_VALUE */) {
            const expCase = this._parseExpansionCase();
            if (!expCase)
                return; // error
            cases.push(expCase);
        }
        // read the final }
        if (this._peek.type !== 23 /* TokenType.EXPANSION_FORM_END */) {
            this.errors.push(TreeError.create(null, this._peek.sourceSpan, `Invalid ICU message. Missing '}'.`));
            return;
        }
        const sourceSpan = new ParseSourceSpan(token.sourceSpan.start, this._peek.sourceSpan.end, token.sourceSpan.fullStart);
        this._addToParent(new html.Expansion(switchValue.parts[0], type.parts[0], cases, sourceSpan, switchValue.sourceSpan));
        this._advance();
    }
    _parseExpansionCase() {
        const value = this._advance();
        // read {
        if (this._peek.type !== 21 /* TokenType.EXPANSION_CASE_EXP_START */) {
            this.errors.push(TreeError.create(null, this._peek.sourceSpan, `Invalid ICU message. Missing '{'.`));
            return null;
        }
        // read until }
        const start = this._advance();
        const exp = this._collectExpansionExpTokens(start);
        if (!exp)
            return null;
        const end = this._advance();
        exp.push({ type: 24 /* TokenType.EOF */, parts: [], sourceSpan: end.sourceSpan });
        // parse everything in between { and }
        const expansionCaseParser = new _TreeBuilder(exp, this.getTagDefinition);
        expansionCaseParser.build();
        if (expansionCaseParser.errors.length > 0) {
            this.errors = this.errors.concat(expansionCaseParser.errors);
            return null;
        }
        const sourceSpan = new ParseSourceSpan(value.sourceSpan.start, end.sourceSpan.end, value.sourceSpan.fullStart);
        const expSourceSpan = new ParseSourceSpan(start.sourceSpan.start, end.sourceSpan.end, start.sourceSpan.fullStart);
        return new html.ExpansionCase(value.parts[0], expansionCaseParser.rootNodes, sourceSpan, value.sourceSpan, expSourceSpan);
    }
    _collectExpansionExpTokens(start) {
        const exp = [];
        const expansionFormStack = [21 /* TokenType.EXPANSION_CASE_EXP_START */];
        while (true) {
            if (this._peek.type === 19 /* TokenType.EXPANSION_FORM_START */ ||
                this._peek.type === 21 /* TokenType.EXPANSION_CASE_EXP_START */) {
                expansionFormStack.push(this._peek.type);
            }
            if (this._peek.type === 22 /* TokenType.EXPANSION_CASE_EXP_END */) {
                if (lastOnStack(expansionFormStack, 21 /* TokenType.EXPANSION_CASE_EXP_START */)) {
                    expansionFormStack.pop();
                    if (expansionFormStack.length === 0)
                        return exp;
                }
                else {
                    this.errors.push(TreeError.create(null, start.sourceSpan, `Invalid ICU message. Missing '}'.`));
                    return null;
                }
            }
            if (this._peek.type === 23 /* TokenType.EXPANSION_FORM_END */) {
                if (lastOnStack(expansionFormStack, 19 /* TokenType.EXPANSION_FORM_START */)) {
                    expansionFormStack.pop();
                }
                else {
                    this.errors.push(TreeError.create(null, start.sourceSpan, `Invalid ICU message. Missing '}'.`));
                    return null;
                }
            }
            if (this._peek.type === 24 /* TokenType.EOF */) {
                this.errors.push(TreeError.create(null, start.sourceSpan, `Invalid ICU message. Missing '}'.`));
                return null;
            }
            exp.push(this._advance());
        }
    }
    _consumeText(token) {
        const tokens = [token];
        const startSpan = token.sourceSpan;
        let text = token.parts[0];
        if (text.length > 0 && text[0] === '\n') {
            const parent = this._getParentElement();
            if (parent != null && parent.children.length === 0 &&
                this.getTagDefinition(parent.name).ignoreFirstLf) {
                text = text.substring(1);
                tokens[0] = { type: token.type, sourceSpan: token.sourceSpan, parts: [text] };
            }
        }
        while (this._peek.type === 8 /* TokenType.INTERPOLATION */ || this._peek.type === 5 /* TokenType.TEXT */ ||
            this._peek.type === 9 /* TokenType.ENCODED_ENTITY */) {
            token = this._advance();
            tokens.push(token);
            if (token.type === 8 /* TokenType.INTERPOLATION */) {
                // For backward compatibility we decode HTML entities that appear in interpolation
                // expressions. This is arguably a bug, but it could be a considerable breaking change to
                // fix it. It should be addressed in a larger project to refactor the entire parser/lexer
                // chain after View Engine has been removed.
                text += token.parts.join('').replace(/&([^;]+);/g, decodeEntity);
            }
            else if (token.type === 9 /* TokenType.ENCODED_ENTITY */) {
                text += token.parts[0];
            }
            else {
                text += token.parts.join('');
            }
        }
        if (text.length > 0) {
            const endSpan = token.sourceSpan;
            this._addToParent(new html.Text(text, new ParseSourceSpan(startSpan.start, endSpan.end, startSpan.fullStart, startSpan.details), tokens));
        }
    }
    _closeVoidElement() {
        const el = this._getParentElement();
        if (el && this.getTagDefinition(el.name).isVoid) {
            this._elementStack.pop();
        }
    }
    _consumeStartTag(startTagToken) {
        const [prefix, name] = startTagToken.parts;
        const attrs = [];
        while (this._peek.type === 14 /* TokenType.ATTR_NAME */) {
            attrs.push(this._consumeAttr(this._advance()));
        }
        const fullName = this._getElementFullName(prefix, name, this._getParentElement());
        let selfClosing = false;
        // Note: There could have been a tokenizer error
        // so that we don't get a token for the end tag...
        if (this._peek.type === 2 /* TokenType.TAG_OPEN_END_VOID */) {
            this._advance();
            selfClosing = true;
            const tagDef = this.getTagDefinition(fullName);
            if (!(tagDef.canSelfClose || getNsPrefix(fullName) !== null || tagDef.isVoid)) {
                this.errors.push(TreeError.create(fullName, startTagToken.sourceSpan, `Only void, custom and foreign elements can be self closed "${startTagToken.parts[1]}"`));
            }
        }
        else if (this._peek.type === 1 /* TokenType.TAG_OPEN_END */) {
            this._advance();
            selfClosing = false;
        }
        const end = this._peek.sourceSpan.fullStart;
        const span = new ParseSourceSpan(startTagToken.sourceSpan.start, end, startTagToken.sourceSpan.fullStart);
        // Create a separate `startSpan` because `span` will be modified when there is an `end` span.
        const startSpan = new ParseSourceSpan(startTagToken.sourceSpan.start, end, startTagToken.sourceSpan.fullStart);
        const el = new html.Element(fullName, attrs, [], span, startSpan, undefined);
        this._pushElement(el);
        if (selfClosing) {
            // Elements that are self-closed have their `endSourceSpan` set to the full span, as the
            // element start tag also represents the end tag.
            this._popElement(fullName, span);
        }
        else if (startTagToken.type === 4 /* TokenType.INCOMPLETE_TAG_OPEN */) {
            // We already know the opening tag is not complete, so it is unlikely it has a corresponding
            // close tag. Let's optimistically parse it as a full element and emit an error.
            this._popElement(fullName, null);
            this.errors.push(TreeError.create(fullName, span, `Opening tag "${fullName}" not terminated.`));
        }
    }
    _pushElement(el) {
        const parentEl = this._getParentElement();
        if (parentEl && this.getTagDefinition(parentEl.name).isClosedByChild(el.name)) {
            this._elementStack.pop();
        }
        this._addToParent(el);
        this._elementStack.push(el);
    }
    _consumeEndTag(endTagToken) {
        const fullName = this._getElementFullName(endTagToken.parts[0], endTagToken.parts[1], this._getParentElement());
        if (this.getTagDefinition(fullName).isVoid) {
            this.errors.push(TreeError.create(fullName, endTagToken.sourceSpan, `Void elements do not have end tags "${endTagToken.parts[1]}"`));
        }
        else if (!this._popElement(fullName, endTagToken.sourceSpan)) {
            const errMsg = `Unexpected closing tag "${fullName}". It may happen when the tag has already been closed by another tag. For more info see https://www.w3.org/TR/html5/syntax.html#closing-elements-that-have-implied-end-tags`;
            this.errors.push(TreeError.create(fullName, endTagToken.sourceSpan, errMsg));
        }
    }
    /**
     * Closes the nearest element with the tag name `fullName` in the parse tree.
     * `endSourceSpan` is the span of the closing tag, or null if the element does
     * not have a closing tag (for example, this happens when an incomplete
     * opening tag is recovered).
     */
    _popElement(fullName, endSourceSpan) {
        let unexpectedCloseTagDetected = false;
        for (let stackIndex = this._elementStack.length - 1; stackIndex >= 0; stackIndex--) {
            const el = this._elementStack[stackIndex];
            if (el.name === fullName) {
                // Record the parse span with the element that is being closed. Any elements that are
                // removed from the element stack at this point are closed implicitly, so they won't get
                // an end source span (as there is no explicit closing element).
                el.endSourceSpan = endSourceSpan;
                el.sourceSpan.end = endSourceSpan !== null ? endSourceSpan.end : el.sourceSpan.end;
                this._elementStack.splice(stackIndex, this._elementStack.length - stackIndex);
                return !unexpectedCloseTagDetected;
            }
            if (!this.getTagDefinition(el.name).closedByParent) {
                // Note that we encountered an unexpected close tag but continue processing the element
                // stack so we can assign an `endSourceSpan` if there is a corresponding start tag for this
                // end tag in the stack.
                unexpectedCloseTagDetected = true;
            }
        }
        return false;
    }
    _consumeAttr(attrName) {
        const fullName = mergeNsAndName(attrName.parts[0], attrName.parts[1]);
        let attrEnd = attrName.sourceSpan.end;
        // Consume any quote
        if (this._peek.type === 15 /* TokenType.ATTR_QUOTE */) {
            this._advance();
        }
        // Consume the attribute value
        let value = '';
        const valueTokens = [];
        let valueStartSpan = undefined;
        let valueEnd = undefined;
        // NOTE: We need to use a new variable `nextTokenType` here to hide the actual type of
        // `_peek.type` from TS. Otherwise TS will narrow the type of `_peek.type` preventing it from
        // being able to consider `ATTR_VALUE_INTERPOLATION` as an option. This is because TS is not
        // able to see that `_advance()` will actually mutate `_peek`.
        const nextTokenType = this._peek.type;
        if (nextTokenType === 16 /* TokenType.ATTR_VALUE_TEXT */) {
            valueStartSpan = this._peek.sourceSpan;
            valueEnd = this._peek.sourceSpan.end;
            while (this._peek.type === 16 /* TokenType.ATTR_VALUE_TEXT */ ||
                this._peek.type === 17 /* TokenType.ATTR_VALUE_INTERPOLATION */ ||
                this._peek.type === 9 /* TokenType.ENCODED_ENTITY */) {
                const valueToken = this._advance();
                valueTokens.push(valueToken);
                if (valueToken.type === 17 /* TokenType.ATTR_VALUE_INTERPOLATION */) {
                    // For backward compatibility we decode HTML entities that appear in interpolation
                    // expressions. This is arguably a bug, but it could be a considerable breaking change to
                    // fix it. It should be addressed in a larger project to refactor the entire parser/lexer
                    // chain after View Engine has been removed.
                    value += valueToken.parts.join('').replace(/&([^;]+);/g, decodeEntity);
                }
                else if (valueToken.type === 9 /* TokenType.ENCODED_ENTITY */) {
                    value += valueToken.parts[0];
                }
                else {
                    value += valueToken.parts.join('');
                }
                valueEnd = attrEnd = valueToken.sourceSpan.end;
            }
        }
        // Consume any quote
        if (this._peek.type === 15 /* TokenType.ATTR_QUOTE */) {
            const quoteToken = this._advance();
            attrEnd = quoteToken.sourceSpan.end;
        }
        const valueSpan = valueStartSpan && valueEnd &&
            new ParseSourceSpan(valueStartSpan.start, valueEnd, valueStartSpan.fullStart);
        return new html.Attribute(fullName, value, new ParseSourceSpan(attrName.sourceSpan.start, attrEnd, attrName.sourceSpan.fullStart), attrName.sourceSpan, valueSpan, valueTokens.length > 0 ? valueTokens : undefined, undefined);
    }
    _getParentElement() {
        return this._elementStack.length > 0 ? this._elementStack[this._elementStack.length - 1] : null;
    }
    _addToParent(node) {
        const parent = this._getParentElement();
        if (parent != null) {
            parent.children.push(node);
        }
        else {
            this.rootNodes.push(node);
        }
    }
    _getElementFullName(prefix, localName, parentElement) {
        if (prefix === '') {
            prefix = this.getTagDefinition(localName).implicitNamespacePrefix || '';
            if (prefix === '' && parentElement != null) {
                const parentTagName = splitNsName(parentElement.name)[1];
                const parentTagDefinition = this.getTagDefinition(parentTagName);
                if (!parentTagDefinition.preventNamespaceInheritance) {
                    prefix = getNsPrefix(parentElement.name);
                }
            }
        }
        return mergeNsAndName(prefix, localName);
    }
}
function lastOnStack(stack, element) {
    return stack.length > 0 && stack[stack.length - 1] === element;
}
/**
 * Decode the `entity` string, which we believe is the contents of an HTML entity.
 *
 * If the string is not actually a valid/known entity then just return the original `match` string.
 */
function decodeEntity(match, entity) {
    if (NAMED_ENTITIES[entity] !== undefined) {
        return NAMED_ENTITIES[entity] || match;
    }
    if (/^#x[a-f0-9]+$/i.test(entity)) {
        return String.fromCodePoint(parseInt(entity.slice(2), 16));
    }
    if (/^#\d+$/.test(entity)) {
        return String.fromCodePoint(parseInt(entity.slice(1), 10));
    }
    return match;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL21sX3BhcnNlci9wYXJzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFVBQVUsRUFBaUIsZUFBZSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRXpFLE9BQU8sS0FBSyxJQUFJLE1BQU0sT0FBTyxDQUFDO0FBQzlCLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxZQUFZLENBQUM7QUFDMUMsT0FBTyxFQUFDLFFBQVEsRUFBa0IsTUFBTSxTQUFTLENBQUM7QUFDbEQsT0FBTyxFQUFDLFdBQVcsRUFBRSxjQUFjLEVBQUUsV0FBVyxFQUFnQixNQUFNLFFBQVEsQ0FBQztBQUcvRSxNQUFNLE9BQU8sU0FBVSxTQUFRLFVBQVU7SUFDdkMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUF3QixFQUFFLElBQXFCLEVBQUUsR0FBVztRQUN4RSxPQUFPLElBQUksU0FBUyxDQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDL0MsQ0FBQztJQUVELFlBQW1CLFdBQXdCLEVBQUUsSUFBcUIsRUFBRSxHQUFXO1FBQzdFLEtBQUssQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFEQSxnQkFBVyxHQUFYLFdBQVcsQ0FBYTtJQUUzQyxDQUFDO0NBQ0Y7QUFFRCxNQUFNLE9BQU8sZUFBZTtJQUMxQixZQUFtQixTQUFzQixFQUFTLE1BQW9CO1FBQW5ELGNBQVMsR0FBVCxTQUFTLENBQWE7UUFBUyxXQUFNLEdBQU4sTUFBTSxDQUFjO0lBQUcsQ0FBQztDQUMzRTtBQUVELE1BQU0sT0FBTyxNQUFNO0lBQ2pCLFlBQW1CLGdCQUFvRDtRQUFwRCxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQW9DO0lBQUcsQ0FBQztJQUUzRSxLQUFLLENBQUMsTUFBYyxFQUFFLEdBQVcs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R0FBRyxXQUFXLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUMxQzthQUNGO1NBQ0Y7UUFFRCxPQUFPLGNBQWMsQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDM0MsQ0FBQztDQUNGO0FBRUQsU0FBUyxXQUFXLENBQUMsS0FBWSxFQUFFLE9BQVk7SUFDN0MsT0FBTyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsS0FBSyxPQUFPLENBQUM7QUFDakUsQ0FBQztBQUVEOzs7O0dBSUc7QUFDSCxTQUFTLFlBQVksQ0FBQyxLQUFhLEVBQUUsTUFBYztJQUNqRCxJQUFJLGNBQWMsQ0FBQyxNQUFNLENBQUMsS0FBSyxTQUFTLEVBQUU7UUFDeEMsT0FBTyxjQUFjLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDO0tBQ3hDO0lBQ0QsSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUU7UUFDakMsT0FBTyxNQUFNLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDNUQ7SUFDRCxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUU7UUFDekIsT0FBTyxNQUFNLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDNUQ7SUFDRCxPQUFPLEtBQUssQ0FBQztBQUNmLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtQYXJzZUVycm9yLCBQYXJzZUxvY2F0aW9uLCBQYXJzZVNvdXJjZVNwYW59IGZyb20gJy4uL3BhcnNlX3V0aWwnO1xuXG5pbXBvcnQgKiBhcyBodG1sIGZyb20gJy4vYXN0JztcbmltcG9ydCB7TkFNRURfRU5USVRJRVN9IGZyb20gJy4vZW50aXRpZXMnO1xuaW1wb3J0IHt0b2tlbml6ZSwgVG9rZW5pemVPcHRpb25zfSBmcm9tICcuL2xleGVyJztcbmltcG9ydCB7Z2V0TnNQcmVmaXgsIG1lcmdlTnNBbmROYW1lLCBzcGxpdE5zTmFtZSwgVGFnRGVmaW5pdGlvbn0gZnJvbSAnLi90YWdzJztcbmltcG9ydCB7QXR0cmlidXRlTmFtZVRva2VuLCBBdHRyaWJ1dGVRdW90ZVRva2VuLCBDZGF0YVN0YXJ0VG9rZW4sIENvbW1lbnRTdGFydFRva2VuLCBFeHBhbnNpb25DYXNlRXhwcmVzc2lvbkVuZFRva2VuLCBFeHBhbnNpb25DYXNlRXhwcmVzc2lvblN0YXJ0VG9rZW4sIEV4cGFuc2lvbkNhc2VWYWx1ZVRva2VuLCBFeHBhbnNpb25Gb3JtU3RhcnRUb2tlbiwgSW5jb21wbGV0ZVRhZ09wZW5Ub2tlbiwgSW50ZXJwb2xhdGVkQXR0cmlidXRlVG9rZW4sIEludGVycG9sYXRlZFRleHRUb2tlbiwgVGFnQ2xvc2VUb2tlbiwgVGFnT3BlblN0YXJ0VG9rZW4sIFRleHRUb2tlbiwgVG9rZW4sIFRva2VuVHlwZX0gZnJvbSAnLi90b2tlbnMnO1xuXG5leHBvcnQgY2xhc3MgVHJlZUVycm9yIGV4dGVuZHMgUGFyc2VFcnJvciB7XG4gIHN0YXRpYyBjcmVhdGUoZWxlbWVudE5hbWU6IHN0cmluZ3xudWxsLCBzcGFuOiBQYXJzZVNvdXJjZVNwYW4sIG1zZzogc3RyaW5nKTogVHJlZUVycm9yIHtcbiAgICByZXR1cm4gbmV3IFRyZWVFcnJvcihlbGVtZW50TmFtZSwgc3BhbiwgbXNnKTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBlbGVtZW50TmFtZTogc3RyaW5nfG51bGwsIHNwYW46IFBhcnNlU291cmNlU3BhbiwgbXNnOiBzdHJpbmcpIHtcbiAgICBzdXBlcihzcGFuLCBtc2cpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBQYXJzZVRyZWVSZXN1bHQge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgcm9vdE5vZGVzOiBodG1sLk5vZGVbXSwgcHVibGljIGVycm9yczogUGFyc2VFcnJvcltdKSB7fVxufVxuXG5leHBvcnQgY2xhc3MgUGFyc2VyIHtcbiAgY29uc3RydWN0b3IocHVibGljIGdldFRhZ0RlZmluaXRpb246ICh0YWdOYW1lOiBzdHJpbmcpID0+IFRhZ0RlZmluaXRpb24pIHt9XG5cbiAgcGFyc2Uoc291cmNlOiBzdHJpbmcsIHVybDogc3RyaW5nLCBvcHRpb25zPzogVG9rZW5pemVPcHRpb25zKTogUGFyc2VUcmVlUmVzdWx0IHtcbiAgICBjb25zdCB0b2tlbml6ZVJlc3VsdCA9IHRva2VuaXplKHNvdXJjZSwgdXJsLCB0aGlzLmdldFRhZ0RlZmluaXRpb24sIG9wdGlvbnMpO1xuICAgIGNvbnN0IHBhcnNlciA9IG5ldyBfVHJlZUJ1aWxkZXIodG9rZW5pemVSZXN1bHQudG9rZW5zLCB0aGlzLmdldFRhZ0RlZmluaXRpb24pO1xuICAgIHBhcnNlci5idWlsZCgpO1xuICAgIHJldHVybiBuZXcgUGFyc2VUcmVlUmVzdWx0KFxuICAgICAgICBwYXJzZXIucm9vdE5vZGVzLFxuICAgICAgICAodG9rZW5pemVSZXN1bHQuZXJyb3JzIGFzIFBhcnNlRXJyb3JbXSkuY29uY2F0KHBhcnNlci5lcnJvcnMpLFxuICAgICk7XG4gIH1cbn1cblxuY2xhc3MgX1RyZWVCdWlsZGVyIHtcbiAgcHJpdmF0ZSBfaW5kZXg6IG51bWJlciA9IC0xO1xuICAvLyBgX3BlZWtgIHdpbGwgYmUgaW5pdGlhbGl6ZWQgYnkgdGhlIGNhbGwgdG8gYF9hZHZhbmNlKClgIGluIHRoZSBjb25zdHJ1Y3Rvci5cbiAgcHJpdmF0ZSBfcGVlayE6IFRva2VuO1xuICBwcml2YXRlIF9lbGVtZW50U3RhY2s6IGh0bWwuRWxlbWVudFtdID0gW107XG5cbiAgcm9vdE5vZGVzOiBodG1sLk5vZGVbXSA9IFtdO1xuICBlcnJvcnM6IFRyZWVFcnJvcltdID0gW107XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIHRva2VuczogVG9rZW5bXSwgcHJpdmF0ZSBnZXRUYWdEZWZpbml0aW9uOiAodGFnTmFtZTogc3RyaW5nKSA9PiBUYWdEZWZpbml0aW9uKSB7XG4gICAgdGhpcy5fYWR2YW5jZSgpO1xuICB9XG5cbiAgYnVpbGQoKTogdm9pZCB7XG4gICAgd2hpbGUgKHRoaXMuX3BlZWsudHlwZSAhPT0gVG9rZW5UeXBlLkVPRikge1xuICAgICAgaWYgKHRoaXMuX3BlZWsudHlwZSA9PT0gVG9rZW5UeXBlLlRBR19PUEVOX1NUQVJUIHx8XG4gICAgICAgICAgdGhpcy5fcGVlay50eXBlID09PSBUb2tlblR5cGUuSU5DT01QTEVURV9UQUdfT1BFTikge1xuICAgICAgICB0aGlzLl9jb25zdW1lU3RhcnRUYWcodGhpcy5fYWR2YW5jZTxUYWdPcGVuU3RhcnRUb2tlbnxJbmNvbXBsZXRlVGFnT3BlblRva2VuPigpKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fcGVlay50eXBlID09PSBUb2tlblR5cGUuVEFHX0NMT1NFKSB7XG4gICAgICAgIHRoaXMuX2NvbnN1bWVFbmRUYWcodGhpcy5fYWR2YW5jZTxUYWdDbG9zZVRva2VuPigpKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fcGVlay50eXBlID09PSBUb2tlblR5cGUuQ0RBVEFfU1RBUlQpIHtcbiAgICAgICAgdGhpcy5fY2xvc2VWb2lkRWxlbWVudCgpO1xuICAgICAgICB0aGlzLl9jb25zdW1lQ2RhdGEodGhpcy5fYWR2YW5jZTxDZGF0YVN0YXJ0VG9rZW4+KCkpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl9wZWVrLnR5cGUgPT09IFRva2VuVHlwZS5DT01NRU5UX1NUQVJUKSB7XG4gICAgICAgIHRoaXMuX2Nsb3NlVm9pZEVsZW1lbnQoKTtcbiAgICAgICAgdGhpcy5fY29uc3VtZUNvbW1lbnQodGhpcy5fYWR2YW5jZTxDb21tZW50U3RhcnRUb2tlbj4oKSk7XG4gICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgIHRoaXMuX3BlZWsudHlwZSA9PT0gVG9rZW5UeXBlLlRFWFQgfHwgdGhpcy5fcGVlay50eXBlID09PSBUb2tlblR5cGUuUkFXX1RFWFQgfHxcbiAgICAgICAgICB0aGlzLl9wZWVrLnR5cGUgPT09IFRva2VuVHlwZS5FU0NBUEFCTEVfUkFXX1RFWFQpIHtcbiAgICAgICAgdGhpcy5fY2xvc2VWb2lkRWxlbWVudCgpO1xuICAgICAgICB0aGlzLl9jb25zdW1lVGV4dCh0aGlzLl9hZHZhbmNlPFRleHRUb2tlbj4oKSk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX3BlZWsudHlwZSA9PT0gVG9rZW5UeXBlLkVYUEFOU0lPTl9GT1JNX1NUQVJUKSB7XG4gICAgICAgIHRoaXMuX2NvbnN1bWVFeHBhbnNpb24odGhpcy5fYWR2YW5jZTxFeHBhbnNpb25Gb3JtU3RhcnRUb2tlbj4oKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBTa2lwIGFsbCBvdGhlciB0b2tlbnMuLi5cbiAgICAgICAgdGhpcy5fYWR2YW5jZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2FkdmFuY2U8VCBleHRlbmRzIFRva2VuPigpOiBUIHtcbiAgICBjb25zdCBwcmV2ID0gdGhpcy5fcGVlaztcbiAgICBpZiAodGhpcy5faW5kZXggPCB0aGlzLnRva2Vucy5sZW5ndGggLSAxKSB7XG4gICAgICAvLyBOb3RlOiB0aGVyZSBpcyBhbHdheXMgYW4gRU9GIHRva2VuIGF0IHRoZSBlbmRcbiAgICAgIHRoaXMuX2luZGV4Kys7XG4gICAgfVxuICAgIHRoaXMuX3BlZWsgPSB0aGlzLnRva2Vuc1t0aGlzLl9pbmRleF07XG4gICAgcmV0dXJuIHByZXYgYXMgVDtcbiAgfVxuXG4gIHByaXZhdGUgX2FkdmFuY2VJZjxUIGV4dGVuZHMgVG9rZW5UeXBlPih0eXBlOiBUKTogKFRva2VuJnt0eXBlOiBUfSl8bnVsbCB7XG4gICAgaWYgKHRoaXMuX3BlZWsudHlwZSA9PT0gdHlwZSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2FkdmFuY2U8VG9rZW4me3R5cGU6IFR9PigpO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbnN1bWVDZGF0YShfc3RhcnRUb2tlbjogQ2RhdGFTdGFydFRva2VuKSB7XG4gICAgdGhpcy5fY29uc3VtZVRleHQodGhpcy5fYWR2YW5jZTxUZXh0VG9rZW4+KCkpO1xuICAgIHRoaXMuX2FkdmFuY2VJZihUb2tlblR5cGUuQ0RBVEFfRU5EKTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbnN1bWVDb21tZW50KHRva2VuOiBDb21tZW50U3RhcnRUb2tlbikge1xuICAgIGNvbnN0IHRleHQgPSB0aGlzLl9hZHZhbmNlSWYoVG9rZW5UeXBlLlJBV19URVhUKTtcbiAgICB0aGlzLl9hZHZhbmNlSWYoVG9rZW5UeXBlLkNPTU1FTlRfRU5EKTtcbiAgICBjb25zdCB2YWx1ZSA9IHRleHQgIT0gbnVsbCA/IHRleHQucGFydHNbMF0udHJpbSgpIDogbnVsbDtcbiAgICB0aGlzLl9hZGRUb1BhcmVudChuZXcgaHRtbC5Db21tZW50KHZhbHVlLCB0b2tlbi5zb3VyY2VTcGFuKSk7XG4gIH1cblxuICBwcml2YXRlIF9jb25zdW1lRXhwYW5zaW9uKHRva2VuOiBFeHBhbnNpb25Gb3JtU3RhcnRUb2tlbikge1xuICAgIGNvbnN0IHN3aXRjaFZhbHVlID0gdGhpcy5fYWR2YW5jZTxUZXh0VG9rZW4+KCk7XG5cbiAgICBjb25zdCB0eXBlID0gdGhpcy5fYWR2YW5jZTxUZXh0VG9rZW4+KCk7XG4gICAgY29uc3QgY2FzZXM6IGh0bWwuRXhwYW5zaW9uQ2FzZVtdID0gW107XG5cbiAgICAvLyByZWFkID1cbiAgICB3aGlsZSAodGhpcy5fcGVlay50eXBlID09PSBUb2tlblR5cGUuRVhQQU5TSU9OX0NBU0VfVkFMVUUpIHtcbiAgICAgIGNvbnN0IGV4cENhc2UgPSB0aGlzLl9wYXJzZUV4cGFuc2lvbkNhc2UoKTtcbiAgICAgIGlmICghZXhwQ2FzZSkgcmV0dXJuOyAgLy8gZXJyb3JcbiAgICAgIGNhc2VzLnB1c2goZXhwQ2FzZSk7XG4gICAgfVxuXG4gICAgLy8gcmVhZCB0aGUgZmluYWwgfVxuICAgIGlmICh0aGlzLl9wZWVrLnR5cGUgIT09IFRva2VuVHlwZS5FWFBBTlNJT05fRk9STV9FTkQpIHtcbiAgICAgIHRoaXMuZXJyb3JzLnB1c2goXG4gICAgICAgICAgVHJlZUVycm9yLmNyZWF0ZShudWxsLCB0aGlzLl9wZWVrLnNvdXJjZVNwYW4sIGBJbnZhbGlkIElDVSBtZXNzYWdlLiBNaXNzaW5nICd9Jy5gKSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHNvdXJjZVNwYW4gPSBuZXcgUGFyc2VTb3VyY2VTcGFuKFxuICAgICAgICB0b2tlbi5zb3VyY2VTcGFuLnN0YXJ0LCB0aGlzLl9wZWVrLnNvdXJjZVNwYW4uZW5kLCB0b2tlbi5zb3VyY2VTcGFuLmZ1bGxTdGFydCk7XG4gICAgdGhpcy5fYWRkVG9QYXJlbnQobmV3IGh0bWwuRXhwYW5zaW9uKFxuICAgICAgICBzd2l0Y2hWYWx1ZS5wYXJ0c1swXSwgdHlwZS5wYXJ0c1swXSwgY2FzZXMsIHNvdXJjZVNwYW4sIHN3aXRjaFZhbHVlLnNvdXJjZVNwYW4pKTtcblxuICAgIHRoaXMuX2FkdmFuY2UoKTtcbiAgfVxuXG4gIHByaXZhdGUgX3BhcnNlRXhwYW5zaW9uQ2FzZSgpOiBodG1sLkV4cGFuc2lvbkNhc2V8bnVsbCB7XG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLl9hZHZhbmNlPEV4cGFuc2lvbkNhc2VWYWx1ZVRva2VuPigpO1xuXG4gICAgLy8gcmVhZCB7XG4gICAgaWYgKHRoaXMuX3BlZWsudHlwZSAhPT0gVG9rZW5UeXBlLkVYUEFOU0lPTl9DQVNFX0VYUF9TVEFSVCkge1xuICAgICAgdGhpcy5lcnJvcnMucHVzaChcbiAgICAgICAgICBUcmVlRXJyb3IuY3JlYXRlKG51bGwsIHRoaXMuX3BlZWsuc291cmNlU3BhbiwgYEludmFsaWQgSUNVIG1lc3NhZ2UuIE1pc3NpbmcgJ3snLmApKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8vIHJlYWQgdW50aWwgfVxuICAgIGNvbnN0IHN0YXJ0ID0gdGhpcy5fYWR2YW5jZTxFeHBhbnNpb25DYXNlRXhwcmVzc2lvblN0YXJ0VG9rZW4+KCk7XG5cbiAgICBjb25zdCBleHAgPSB0aGlzLl9jb2xsZWN0RXhwYW5zaW9uRXhwVG9rZW5zKHN0YXJ0KTtcbiAgICBpZiAoIWV4cCkgcmV0dXJuIG51bGw7XG5cbiAgICBjb25zdCBlbmQgPSB0aGlzLl9hZHZhbmNlPEV4cGFuc2lvbkNhc2VFeHByZXNzaW9uRW5kVG9rZW4+KCk7XG4gICAgZXhwLnB1c2goe3R5cGU6IFRva2VuVHlwZS5FT0YsIHBhcnRzOiBbXSwgc291cmNlU3BhbjogZW5kLnNvdXJjZVNwYW59KTtcblxuICAgIC8vIHBhcnNlIGV2ZXJ5dGhpbmcgaW4gYmV0d2VlbiB7IGFuZCB9XG4gICAgY29uc3QgZXhwYW5zaW9uQ2FzZVBhcnNlciA9IG5ldyBfVHJlZUJ1aWxkZXIoZXhwLCB0aGlzLmdldFRhZ0RlZmluaXRpb24pO1xuICAgIGV4cGFuc2lvbkNhc2VQYXJzZXIuYnVpbGQoKTtcbiAgICBpZiAoZXhwYW5zaW9uQ2FzZVBhcnNlci5lcnJvcnMubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5lcnJvcnMgPSB0aGlzLmVycm9ycy5jb25jYXQoZXhwYW5zaW9uQ2FzZVBhcnNlci5lcnJvcnMpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3Qgc291cmNlU3BhbiA9XG4gICAgICAgIG5ldyBQYXJzZVNvdXJjZVNwYW4odmFsdWUuc291cmNlU3Bhbi5zdGFydCwgZW5kLnNvdXJjZVNwYW4uZW5kLCB2YWx1ZS5zb3VyY2VTcGFuLmZ1bGxTdGFydCk7XG4gICAgY29uc3QgZXhwU291cmNlU3BhbiA9XG4gICAgICAgIG5ldyBQYXJzZVNvdXJjZVNwYW4oc3RhcnQuc291cmNlU3Bhbi5zdGFydCwgZW5kLnNvdXJjZVNwYW4uZW5kLCBzdGFydC5zb3VyY2VTcGFuLmZ1bGxTdGFydCk7XG4gICAgcmV0dXJuIG5ldyBodG1sLkV4cGFuc2lvbkNhc2UoXG4gICAgICAgIHZhbHVlLnBhcnRzWzBdLCBleHBhbnNpb25DYXNlUGFyc2VyLnJvb3ROb2Rlcywgc291cmNlU3BhbiwgdmFsdWUuc291cmNlU3BhbiwgZXhwU291cmNlU3Bhbik7XG4gIH1cblxuICBwcml2YXRlIF9jb2xsZWN0RXhwYW5zaW9uRXhwVG9rZW5zKHN0YXJ0OiBUb2tlbik6IFRva2VuW118bnVsbCB7XG4gICAgY29uc3QgZXhwOiBUb2tlbltdID0gW107XG4gICAgY29uc3QgZXhwYW5zaW9uRm9ybVN0YWNrID0gW1Rva2VuVHlwZS5FWFBBTlNJT05fQ0FTRV9FWFBfU1RBUlRdO1xuXG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIGlmICh0aGlzLl9wZWVrLnR5cGUgPT09IFRva2VuVHlwZS5FWFBBTlNJT05fRk9STV9TVEFSVCB8fFxuICAgICAgICAgIHRoaXMuX3BlZWsudHlwZSA9PT0gVG9rZW5UeXBlLkVYUEFOU0lPTl9DQVNFX0VYUF9TVEFSVCkge1xuICAgICAgICBleHBhbnNpb25Gb3JtU3RhY2sucHVzaCh0aGlzLl9wZWVrLnR5cGUpO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5fcGVlay50eXBlID09PSBUb2tlblR5cGUuRVhQQU5TSU9OX0NBU0VfRVhQX0VORCkge1xuICAgICAgICBpZiAobGFzdE9uU3RhY2soZXhwYW5zaW9uRm9ybVN0YWNrLCBUb2tlblR5cGUuRVhQQU5TSU9OX0NBU0VfRVhQX1NUQVJUKSkge1xuICAgICAgICAgIGV4cGFuc2lvbkZvcm1TdGFjay5wb3AoKTtcbiAgICAgICAgICBpZiAoZXhwYW5zaW9uRm9ybVN0YWNrLmxlbmd0aCA9PT0gMCkgcmV0dXJuIGV4cDtcblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuZXJyb3JzLnB1c2goXG4gICAgICAgICAgICAgIFRyZWVFcnJvci5jcmVhdGUobnVsbCwgc3RhcnQuc291cmNlU3BhbiwgYEludmFsaWQgSUNVIG1lc3NhZ2UuIE1pc3NpbmcgJ30nLmApKTtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5fcGVlay50eXBlID09PSBUb2tlblR5cGUuRVhQQU5TSU9OX0ZPUk1fRU5EKSB7XG4gICAgICAgIGlmIChsYXN0T25TdGFjayhleHBhbnNpb25Gb3JtU3RhY2ssIFRva2VuVHlwZS5FWFBBTlNJT05fRk9STV9TVEFSVCkpIHtcbiAgICAgICAgICBleHBhbnNpb25Gb3JtU3RhY2sucG9wKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5lcnJvcnMucHVzaChcbiAgICAgICAgICAgICAgVHJlZUVycm9yLmNyZWF0ZShudWxsLCBzdGFydC5zb3VyY2VTcGFuLCBgSW52YWxpZCBJQ1UgbWVzc2FnZS4gTWlzc2luZyAnfScuYCkpO1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLl9wZWVrLnR5cGUgPT09IFRva2VuVHlwZS5FT0YpIHtcbiAgICAgICAgdGhpcy5lcnJvcnMucHVzaChcbiAgICAgICAgICAgIFRyZWVFcnJvci5jcmVhdGUobnVsbCwgc3RhcnQuc291cmNlU3BhbiwgYEludmFsaWQgSUNVIG1lc3NhZ2UuIE1pc3NpbmcgJ30nLmApKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG5cbiAgICAgIGV4cC5wdXNoKHRoaXMuX2FkdmFuY2UoKSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfY29uc3VtZVRleHQodG9rZW46IEludGVycG9sYXRlZFRleHRUb2tlbikge1xuICAgIGNvbnN0IHRva2VucyA9IFt0b2tlbl07XG4gICAgY29uc3Qgc3RhcnRTcGFuID0gdG9rZW4uc291cmNlU3BhbjtcbiAgICBsZXQgdGV4dCA9IHRva2VuLnBhcnRzWzBdO1xuICAgIGlmICh0ZXh0Lmxlbmd0aCA+IDAgJiYgdGV4dFswXSA9PT0gJ1xcbicpIHtcbiAgICAgIGNvbnN0IHBhcmVudCA9IHRoaXMuX2dldFBhcmVudEVsZW1lbnQoKTtcbiAgICAgIGlmIChwYXJlbnQgIT0gbnVsbCAmJiBwYXJlbnQuY2hpbGRyZW4ubGVuZ3RoID09PSAwICYmXG4gICAgICAgICAgdGhpcy5nZXRUYWdEZWZpbml0aW9uKHBhcmVudC5uYW1lKS5pZ25vcmVGaXJzdExmKSB7XG4gICAgICAgIHRleHQgPSB0ZXh0LnN1YnN0cmluZygxKTtcbiAgICAgICAgdG9rZW5zWzBdID0ge3R5cGU6IHRva2VuLnR5cGUsIHNvdXJjZVNwYW46IHRva2VuLnNvdXJjZVNwYW4sIHBhcnRzOiBbdGV4dF19IGFzIHR5cGVvZiB0b2tlbjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB3aGlsZSAodGhpcy5fcGVlay50eXBlID09PSBUb2tlblR5cGUuSU5URVJQT0xBVElPTiB8fCB0aGlzLl9wZWVrLnR5cGUgPT09IFRva2VuVHlwZS5URVhUIHx8XG4gICAgICAgICAgIHRoaXMuX3BlZWsudHlwZSA9PT0gVG9rZW5UeXBlLkVOQ09ERURfRU5USVRZKSB7XG4gICAgICB0b2tlbiA9IHRoaXMuX2FkdmFuY2UoKTtcbiAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgIGlmICh0b2tlbi50eXBlID09PSBUb2tlblR5cGUuSU5URVJQT0xBVElPTikge1xuICAgICAgICAvLyBGb3IgYmFja3dhcmQgY29tcGF0aWJpbGl0eSB3ZSBkZWNvZGUgSFRNTCBlbnRpdGllcyB0aGF0IGFwcGVhciBpbiBpbnRlcnBvbGF0aW9uXG4gICAgICAgIC8vIGV4cHJlc3Npb25zLiBUaGlzIGlzIGFyZ3VhYmx5IGEgYnVnLCBidXQgaXQgY291bGQgYmUgYSBjb25zaWRlcmFibGUgYnJlYWtpbmcgY2hhbmdlIHRvXG4gICAgICAgIC8vIGZpeCBpdC4gSXQgc2hvdWxkIGJlIGFkZHJlc3NlZCBpbiBhIGxhcmdlciBwcm9qZWN0IHRvIHJlZmFjdG9yIHRoZSBlbnRpcmUgcGFyc2VyL2xleGVyXG4gICAgICAgIC8vIGNoYWluIGFmdGVyIFZpZXcgRW5naW5lIGhhcyBiZWVuIHJlbW92ZWQuXG4gICAgICAgIHRleHQgKz0gdG9rZW4ucGFydHMuam9pbignJykucmVwbGFjZSgvJihbXjtdKyk7L2csIGRlY29kZUVudGl0eSk7XG4gICAgICB9IGVsc2UgaWYgKHRva2VuLnR5cGUgPT09IFRva2VuVHlwZS5FTkNPREVEX0VOVElUWSkge1xuICAgICAgICB0ZXh0ICs9IHRva2VuLnBhcnRzWzBdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGV4dCArPSB0b2tlbi5wYXJ0cy5qb2luKCcnKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGV4dC5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBlbmRTcGFuID0gdG9rZW4uc291cmNlU3BhbjtcbiAgICAgIHRoaXMuX2FkZFRvUGFyZW50KG5ldyBodG1sLlRleHQoXG4gICAgICAgICAgdGV4dCxcbiAgICAgICAgICBuZXcgUGFyc2VTb3VyY2VTcGFuKHN0YXJ0U3Bhbi5zdGFydCwgZW5kU3Bhbi5lbmQsIHN0YXJ0U3Bhbi5mdWxsU3RhcnQsIHN0YXJ0U3Bhbi5kZXRhaWxzKSxcbiAgICAgICAgICB0b2tlbnMpKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9jbG9zZVZvaWRFbGVtZW50KCk6IHZvaWQge1xuICAgIGNvbnN0IGVsID0gdGhpcy5fZ2V0UGFyZW50RWxlbWVudCgpO1xuICAgIGlmIChlbCAmJiB0aGlzLmdldFRhZ0RlZmluaXRpb24oZWwubmFtZSkuaXNWb2lkKSB7XG4gICAgICB0aGlzLl9lbGVtZW50U3RhY2sucG9wKCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfY29uc3VtZVN0YXJ0VGFnKHN0YXJ0VGFnVG9rZW46IFRhZ09wZW5TdGFydFRva2VufEluY29tcGxldGVUYWdPcGVuVG9rZW4pIHtcbiAgICBjb25zdCBbcHJlZml4LCBuYW1lXSA9IHN0YXJ0VGFnVG9rZW4ucGFydHM7XG4gICAgY29uc3QgYXR0cnM6IGh0bWwuQXR0cmlidXRlW10gPSBbXTtcbiAgICB3aGlsZSAodGhpcy5fcGVlay50eXBlID09PSBUb2tlblR5cGUuQVRUUl9OQU1FKSB7XG4gICAgICBhdHRycy5wdXNoKHRoaXMuX2NvbnN1bWVBdHRyKHRoaXMuX2FkdmFuY2U8QXR0cmlidXRlTmFtZVRva2VuPigpKSk7XG4gICAgfVxuICAgIGNvbnN0IGZ1bGxOYW1lID0gdGhpcy5fZ2V0RWxlbWVudEZ1bGxOYW1lKHByZWZpeCwgbmFtZSwgdGhpcy5fZ2V0UGFyZW50RWxlbWVudCgpKTtcbiAgICBsZXQgc2VsZkNsb3NpbmcgPSBmYWxzZTtcbiAgICAvLyBOb3RlOiBUaGVyZSBjb3VsZCBoYXZlIGJlZW4gYSB0b2tlbml6ZXIgZXJyb3JcbiAgICAvLyBzbyB0aGF0IHdlIGRvbid0IGdldCBhIHRva2VuIGZvciB0aGUgZW5kIHRhZy4uLlxuICAgIGlmICh0aGlzLl9wZWVrLnR5cGUgPT09IFRva2VuVHlwZS5UQUdfT1BFTl9FTkRfVk9JRCkge1xuICAgICAgdGhpcy5fYWR2YW5jZSgpO1xuICAgICAgc2VsZkNsb3NpbmcgPSB0cnVlO1xuICAgICAgY29uc3QgdGFnRGVmID0gdGhpcy5nZXRUYWdEZWZpbml0aW9uKGZ1bGxOYW1lKTtcbiAgICAgIGlmICghKHRhZ0RlZi5jYW5TZWxmQ2xvc2UgfHwgZ2V0TnNQcmVmaXgoZnVsbE5hbWUpICE9PSBudWxsIHx8IHRhZ0RlZi5pc1ZvaWQpKSB7XG4gICAgICAgIHRoaXMuZXJyb3JzLnB1c2goVHJlZUVycm9yLmNyZWF0ZShcbiAgICAgICAgICAgIGZ1bGxOYW1lLCBzdGFydFRhZ1Rva2VuLnNvdXJjZVNwYW4sXG4gICAgICAgICAgICBgT25seSB2b2lkLCBjdXN0b20gYW5kIGZvcmVpZ24gZWxlbWVudHMgY2FuIGJlIHNlbGYgY2xvc2VkIFwiJHtcbiAgICAgICAgICAgICAgICBzdGFydFRhZ1Rva2VuLnBhcnRzWzFdfVwiYCkpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodGhpcy5fcGVlay50eXBlID09PSBUb2tlblR5cGUuVEFHX09QRU5fRU5EKSB7XG4gICAgICB0aGlzLl9hZHZhbmNlKCk7XG4gICAgICBzZWxmQ2xvc2luZyA9IGZhbHNlO1xuICAgIH1cbiAgICBjb25zdCBlbmQgPSB0aGlzLl9wZWVrLnNvdXJjZVNwYW4uZnVsbFN0YXJ0O1xuICAgIGNvbnN0IHNwYW4gPSBuZXcgUGFyc2VTb3VyY2VTcGFuKFxuICAgICAgICBzdGFydFRhZ1Rva2VuLnNvdXJjZVNwYW4uc3RhcnQsIGVuZCwgc3RhcnRUYWdUb2tlbi5zb3VyY2VTcGFuLmZ1bGxTdGFydCk7XG4gICAgLy8gQ3JlYXRlIGEgc2VwYXJhdGUgYHN0YXJ0U3BhbmAgYmVjYXVzZSBgc3BhbmAgd2lsbCBiZSBtb2RpZmllZCB3aGVuIHRoZXJlIGlzIGFuIGBlbmRgIHNwYW4uXG4gICAgY29uc3Qgc3RhcnRTcGFuID0gbmV3IFBhcnNlU291cmNlU3BhbihcbiAgICAgICAgc3RhcnRUYWdUb2tlbi5zb3VyY2VTcGFuLnN0YXJ0LCBlbmQsIHN0YXJ0VGFnVG9rZW4uc291cmNlU3Bhbi5mdWxsU3RhcnQpO1xuICAgIGNvbnN0IGVsID0gbmV3IGh0bWwuRWxlbWVudChmdWxsTmFtZSwgYXR0cnMsIFtdLCBzcGFuLCBzdGFydFNwYW4sIHVuZGVmaW5lZCk7XG4gICAgdGhpcy5fcHVzaEVsZW1lbnQoZWwpO1xuICAgIGlmIChzZWxmQ2xvc2luZykge1xuICAgICAgLy8gRWxlbWVudHMgdGhhdCBhcmUgc2VsZi1jbG9zZWQgaGF2ZSB0aGVpciBgZW5kU291cmNlU3BhbmAgc2V0IHRvIHRoZSBmdWxsIHNwYW4sIGFzIHRoZVxuICAgICAgLy8gZWxlbWVudCBzdGFydCB0YWcgYWxzbyByZXByZXNlbnRzIHRoZSBlbmQgdGFnLlxuICAgICAgdGhpcy5fcG9wRWxlbWVudChmdWxsTmFtZSwgc3Bhbik7XG4gICAgfSBlbHNlIGlmIChzdGFydFRhZ1Rva2VuLnR5cGUgPT09IFRva2VuVHlwZS5JTkNPTVBMRVRFX1RBR19PUEVOKSB7XG4gICAgICAvLyBXZSBhbHJlYWR5IGtub3cgdGhlIG9wZW5pbmcgdGFnIGlzIG5vdCBjb21wbGV0ZSwgc28gaXQgaXMgdW5saWtlbHkgaXQgaGFzIGEgY29ycmVzcG9uZGluZ1xuICAgICAgLy8gY2xvc2UgdGFnLiBMZXQncyBvcHRpbWlzdGljYWxseSBwYXJzZSBpdCBhcyBhIGZ1bGwgZWxlbWVudCBhbmQgZW1pdCBhbiBlcnJvci5cbiAgICAgIHRoaXMuX3BvcEVsZW1lbnQoZnVsbE5hbWUsIG51bGwpO1xuICAgICAgdGhpcy5lcnJvcnMucHVzaChcbiAgICAgICAgICBUcmVlRXJyb3IuY3JlYXRlKGZ1bGxOYW1lLCBzcGFuLCBgT3BlbmluZyB0YWcgXCIke2Z1bGxOYW1lfVwiIG5vdCB0ZXJtaW5hdGVkLmApKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9wdXNoRWxlbWVudChlbDogaHRtbC5FbGVtZW50KSB7XG4gICAgY29uc3QgcGFyZW50RWwgPSB0aGlzLl9nZXRQYXJlbnRFbGVtZW50KCk7XG5cbiAgICBpZiAocGFyZW50RWwgJiYgdGhpcy5nZXRUYWdEZWZpbml0aW9uKHBhcmVudEVsLm5hbWUpLmlzQ2xvc2VkQnlDaGlsZChlbC5uYW1lKSkge1xuICAgICAgdGhpcy5fZWxlbWVudFN0YWNrLnBvcCgpO1xuICAgIH1cblxuICAgIHRoaXMuX2FkZFRvUGFyZW50KGVsKTtcbiAgICB0aGlzLl9lbGVtZW50U3RhY2sucHVzaChlbCk7XG4gIH1cblxuICBwcml2YXRlIF9jb25zdW1lRW5kVGFnKGVuZFRhZ1Rva2VuOiBUYWdDbG9zZVRva2VuKSB7XG4gICAgY29uc3QgZnVsbE5hbWUgPSB0aGlzLl9nZXRFbGVtZW50RnVsbE5hbWUoXG4gICAgICAgIGVuZFRhZ1Rva2VuLnBhcnRzWzBdLCBlbmRUYWdUb2tlbi5wYXJ0c1sxXSwgdGhpcy5fZ2V0UGFyZW50RWxlbWVudCgpKTtcblxuICAgIGlmICh0aGlzLmdldFRhZ0RlZmluaXRpb24oZnVsbE5hbWUpLmlzVm9pZCkge1xuICAgICAgdGhpcy5lcnJvcnMucHVzaChUcmVlRXJyb3IuY3JlYXRlKFxuICAgICAgICAgIGZ1bGxOYW1lLCBlbmRUYWdUb2tlbi5zb3VyY2VTcGFuLFxuICAgICAgICAgIGBWb2lkIGVsZW1lbnRzIGRvIG5vdCBoYXZlIGVuZCB0YWdzIFwiJHtlbmRUYWdUb2tlbi5wYXJ0c1sxXX1cImApKTtcbiAgICB9IGVsc2UgaWYgKCF0aGlzLl9wb3BFbGVtZW50KGZ1bGxOYW1lLCBlbmRUYWdUb2tlbi5zb3VyY2VTcGFuKSkge1xuICAgICAgY29uc3QgZXJyTXNnID0gYFVuZXhwZWN0ZWQgY2xvc2luZyB0YWcgXCIke1xuICAgICAgICAgIGZ1bGxOYW1lfVwiLiBJdCBtYXkgaGFwcGVuIHdoZW4gdGhlIHRhZyBoYXMgYWxyZWFkeSBiZWVuIGNsb3NlZCBieSBhbm90aGVyIHRhZy4gRm9yIG1vcmUgaW5mbyBzZWUgaHR0cHM6Ly93d3cudzMub3JnL1RSL2h0bWw1L3N5bnRheC5odG1sI2Nsb3NpbmctZWxlbWVudHMtdGhhdC1oYXZlLWltcGxpZWQtZW5kLXRhZ3NgO1xuICAgICAgdGhpcy5lcnJvcnMucHVzaChUcmVlRXJyb3IuY3JlYXRlKGZ1bGxOYW1lLCBlbmRUYWdUb2tlbi5zb3VyY2VTcGFuLCBlcnJNc2cpKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2xvc2VzIHRoZSBuZWFyZXN0IGVsZW1lbnQgd2l0aCB0aGUgdGFnIG5hbWUgYGZ1bGxOYW1lYCBpbiB0aGUgcGFyc2UgdHJlZS5cbiAgICogYGVuZFNvdXJjZVNwYW5gIGlzIHRoZSBzcGFuIG9mIHRoZSBjbG9zaW5nIHRhZywgb3IgbnVsbCBpZiB0aGUgZWxlbWVudCBkb2VzXG4gICAqIG5vdCBoYXZlIGEgY2xvc2luZyB0YWcgKGZvciBleGFtcGxlLCB0aGlzIGhhcHBlbnMgd2hlbiBhbiBpbmNvbXBsZXRlXG4gICAqIG9wZW5pbmcgdGFnIGlzIHJlY292ZXJlZCkuXG4gICAqL1xuICBwcml2YXRlIF9wb3BFbGVtZW50KGZ1bGxOYW1lOiBzdHJpbmcsIGVuZFNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbnxudWxsKTogYm9vbGVhbiB7XG4gICAgbGV0IHVuZXhwZWN0ZWRDbG9zZVRhZ0RldGVjdGVkID0gZmFsc2U7XG4gICAgZm9yIChsZXQgc3RhY2tJbmRleCA9IHRoaXMuX2VsZW1lbnRTdGFjay5sZW5ndGggLSAxOyBzdGFja0luZGV4ID49IDA7IHN0YWNrSW5kZXgtLSkge1xuICAgICAgY29uc3QgZWwgPSB0aGlzLl9lbGVtZW50U3RhY2tbc3RhY2tJbmRleF07XG4gICAgICBpZiAoZWwubmFtZSA9PT0gZnVsbE5hbWUpIHtcbiAgICAgICAgLy8gUmVjb3JkIHRoZSBwYXJzZSBzcGFuIHdpdGggdGhlIGVsZW1lbnQgdGhhdCBpcyBiZWluZyBjbG9zZWQuIEFueSBlbGVtZW50cyB0aGF0IGFyZVxuICAgICAgICAvLyByZW1vdmVkIGZyb20gdGhlIGVsZW1lbnQgc3RhY2sgYXQgdGhpcyBwb2ludCBhcmUgY2xvc2VkIGltcGxpY2l0bHksIHNvIHRoZXkgd29uJ3QgZ2V0XG4gICAgICAgIC8vIGFuIGVuZCBzb3VyY2Ugc3BhbiAoYXMgdGhlcmUgaXMgbm8gZXhwbGljaXQgY2xvc2luZyBlbGVtZW50KS5cbiAgICAgICAgZWwuZW5kU291cmNlU3BhbiA9IGVuZFNvdXJjZVNwYW47XG4gICAgICAgIGVsLnNvdXJjZVNwYW4uZW5kID0gZW5kU291cmNlU3BhbiAhPT0gbnVsbCA/IGVuZFNvdXJjZVNwYW4uZW5kIDogZWwuc291cmNlU3Bhbi5lbmQ7XG5cbiAgICAgICAgdGhpcy5fZWxlbWVudFN0YWNrLnNwbGljZShzdGFja0luZGV4LCB0aGlzLl9lbGVtZW50U3RhY2subGVuZ3RoIC0gc3RhY2tJbmRleCk7XG4gICAgICAgIHJldHVybiAhdW5leHBlY3RlZENsb3NlVGFnRGV0ZWN0ZWQ7XG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy5nZXRUYWdEZWZpbml0aW9uKGVsLm5hbWUpLmNsb3NlZEJ5UGFyZW50KSB7XG4gICAgICAgIC8vIE5vdGUgdGhhdCB3ZSBlbmNvdW50ZXJlZCBhbiB1bmV4cGVjdGVkIGNsb3NlIHRhZyBidXQgY29udGludWUgcHJvY2Vzc2luZyB0aGUgZWxlbWVudFxuICAgICAgICAvLyBzdGFjayBzbyB3ZSBjYW4gYXNzaWduIGFuIGBlbmRTb3VyY2VTcGFuYCBpZiB0aGVyZSBpcyBhIGNvcnJlc3BvbmRpbmcgc3RhcnQgdGFnIGZvciB0aGlzXG4gICAgICAgIC8vIGVuZCB0YWcgaW4gdGhlIHN0YWNrLlxuICAgICAgICB1bmV4cGVjdGVkQ2xvc2VUYWdEZXRlY3RlZCA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbnN1bWVBdHRyKGF0dHJOYW1lOiBBdHRyaWJ1dGVOYW1lVG9rZW4pOiBodG1sLkF0dHJpYnV0ZSB7XG4gICAgY29uc3QgZnVsbE5hbWUgPSBtZXJnZU5zQW5kTmFtZShhdHRyTmFtZS5wYXJ0c1swXSwgYXR0ck5hbWUucGFydHNbMV0pO1xuICAgIGxldCBhdHRyRW5kID0gYXR0ck5hbWUuc291cmNlU3Bhbi5lbmQ7XG5cbiAgICAvLyBDb25zdW1lIGFueSBxdW90ZVxuICAgIGlmICh0aGlzLl9wZWVrLnR5cGUgPT09IFRva2VuVHlwZS5BVFRSX1FVT1RFKSB7XG4gICAgICB0aGlzLl9hZHZhbmNlKCk7XG4gICAgfVxuXG4gICAgLy8gQ29uc3VtZSB0aGUgYXR0cmlidXRlIHZhbHVlXG4gICAgbGV0IHZhbHVlID0gJyc7XG4gICAgY29uc3QgdmFsdWVUb2tlbnM6IEludGVycG9sYXRlZEF0dHJpYnV0ZVRva2VuW10gPSBbXTtcbiAgICBsZXQgdmFsdWVTdGFydFNwYW46IFBhcnNlU291cmNlU3Bhbnx1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgbGV0IHZhbHVlRW5kOiBQYXJzZUxvY2F0aW9ufHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvLyBOT1RFOiBXZSBuZWVkIHRvIHVzZSBhIG5ldyB2YXJpYWJsZSBgbmV4dFRva2VuVHlwZWAgaGVyZSB0byBoaWRlIHRoZSBhY3R1YWwgdHlwZSBvZlxuICAgIC8vIGBfcGVlay50eXBlYCBmcm9tIFRTLiBPdGhlcndpc2UgVFMgd2lsbCBuYXJyb3cgdGhlIHR5cGUgb2YgYF9wZWVrLnR5cGVgIHByZXZlbnRpbmcgaXQgZnJvbVxuICAgIC8vIGJlaW5nIGFibGUgdG8gY29uc2lkZXIgYEFUVFJfVkFMVUVfSU5URVJQT0xBVElPTmAgYXMgYW4gb3B0aW9uLiBUaGlzIGlzIGJlY2F1c2UgVFMgaXMgbm90XG4gICAgLy8gYWJsZSB0byBzZWUgdGhhdCBgX2FkdmFuY2UoKWAgd2lsbCBhY3R1YWxseSBtdXRhdGUgYF9wZWVrYC5cbiAgICBjb25zdCBuZXh0VG9rZW5UeXBlID0gdGhpcy5fcGVlay50eXBlIGFzIFRva2VuVHlwZTtcbiAgICBpZiAobmV4dFRva2VuVHlwZSA9PT0gVG9rZW5UeXBlLkFUVFJfVkFMVUVfVEVYVCkge1xuICAgICAgdmFsdWVTdGFydFNwYW4gPSB0aGlzLl9wZWVrLnNvdXJjZVNwYW47XG4gICAgICB2YWx1ZUVuZCA9IHRoaXMuX3BlZWsuc291cmNlU3Bhbi5lbmQ7XG4gICAgICB3aGlsZSAodGhpcy5fcGVlay50eXBlID09PSBUb2tlblR5cGUuQVRUUl9WQUxVRV9URVhUIHx8XG4gICAgICAgICAgICAgdGhpcy5fcGVlay50eXBlID09PSBUb2tlblR5cGUuQVRUUl9WQUxVRV9JTlRFUlBPTEFUSU9OIHx8XG4gICAgICAgICAgICAgdGhpcy5fcGVlay50eXBlID09PSBUb2tlblR5cGUuRU5DT0RFRF9FTlRJVFkpIHtcbiAgICAgICAgY29uc3QgdmFsdWVUb2tlbiA9IHRoaXMuX2FkdmFuY2U8SW50ZXJwb2xhdGVkQXR0cmlidXRlVG9rZW4+KCk7XG4gICAgICAgIHZhbHVlVG9rZW5zLnB1c2godmFsdWVUb2tlbik7XG4gICAgICAgIGlmICh2YWx1ZVRva2VuLnR5cGUgPT09IFRva2VuVHlwZS5BVFRSX1ZBTFVFX0lOVEVSUE9MQVRJT04pIHtcbiAgICAgICAgICAvLyBGb3IgYmFja3dhcmQgY29tcGF0aWJpbGl0eSB3ZSBkZWNvZGUgSFRNTCBlbnRpdGllcyB0aGF0IGFwcGVhciBpbiBpbnRlcnBvbGF0aW9uXG4gICAgICAgICAgLy8gZXhwcmVzc2lvbnMuIFRoaXMgaXMgYXJndWFibHkgYSBidWcsIGJ1dCBpdCBjb3VsZCBiZSBhIGNvbnNpZGVyYWJsZSBicmVha2luZyBjaGFuZ2UgdG9cbiAgICAgICAgICAvLyBmaXggaXQuIEl0IHNob3VsZCBiZSBhZGRyZXNzZWQgaW4gYSBsYXJnZXIgcHJvamVjdCB0byByZWZhY3RvciB0aGUgZW50aXJlIHBhcnNlci9sZXhlclxuICAgICAgICAgIC8vIGNoYWluIGFmdGVyIFZpZXcgRW5naW5lIGhhcyBiZWVuIHJlbW92ZWQuXG4gICAgICAgICAgdmFsdWUgKz0gdmFsdWVUb2tlbi5wYXJ0cy5qb2luKCcnKS5yZXBsYWNlKC8mKFteO10rKTsvZywgZGVjb2RlRW50aXR5KTtcbiAgICAgICAgfSBlbHNlIGlmICh2YWx1ZVRva2VuLnR5cGUgPT09IFRva2VuVHlwZS5FTkNPREVEX0VOVElUWSkge1xuICAgICAgICAgIHZhbHVlICs9IHZhbHVlVG9rZW4ucGFydHNbMF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFsdWUgKz0gdmFsdWVUb2tlbi5wYXJ0cy5qb2luKCcnKTtcbiAgICAgICAgfVxuICAgICAgICB2YWx1ZUVuZCA9IGF0dHJFbmQgPSB2YWx1ZVRva2VuLnNvdXJjZVNwYW4uZW5kO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIENvbnN1bWUgYW55IHF1b3RlXG4gICAgaWYgKHRoaXMuX3BlZWsudHlwZSA9PT0gVG9rZW5UeXBlLkFUVFJfUVVPVEUpIHtcbiAgICAgIGNvbnN0IHF1b3RlVG9rZW4gPSB0aGlzLl9hZHZhbmNlPEF0dHJpYnV0ZVF1b3RlVG9rZW4+KCk7XG4gICAgICBhdHRyRW5kID0gcXVvdGVUb2tlbi5zb3VyY2VTcGFuLmVuZDtcbiAgICB9XG5cbiAgICBjb25zdCB2YWx1ZVNwYW4gPSB2YWx1ZVN0YXJ0U3BhbiAmJiB2YWx1ZUVuZCAmJlxuICAgICAgICBuZXcgUGFyc2VTb3VyY2VTcGFuKHZhbHVlU3RhcnRTcGFuLnN0YXJ0LCB2YWx1ZUVuZCwgdmFsdWVTdGFydFNwYW4uZnVsbFN0YXJ0KTtcbiAgICByZXR1cm4gbmV3IGh0bWwuQXR0cmlidXRlKFxuICAgICAgICBmdWxsTmFtZSwgdmFsdWUsXG4gICAgICAgIG5ldyBQYXJzZVNvdXJjZVNwYW4oYXR0ck5hbWUuc291cmNlU3Bhbi5zdGFydCwgYXR0ckVuZCwgYXR0ck5hbWUuc291cmNlU3Bhbi5mdWxsU3RhcnQpLFxuICAgICAgICBhdHRyTmFtZS5zb3VyY2VTcGFuLCB2YWx1ZVNwYW4sIHZhbHVlVG9rZW5zLmxlbmd0aCA+IDAgPyB2YWx1ZVRva2VucyA6IHVuZGVmaW5lZCxcbiAgICAgICAgdW5kZWZpbmVkKTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldFBhcmVudEVsZW1lbnQoKTogaHRtbC5FbGVtZW50fG51bGwge1xuICAgIHJldHVybiB0aGlzLl9lbGVtZW50U3RhY2subGVuZ3RoID4gMCA/IHRoaXMuX2VsZW1lbnRTdGFja1t0aGlzLl9lbGVtZW50U3RhY2subGVuZ3RoIC0gMV0gOiBudWxsO1xuICB9XG5cbiAgcHJpdmF0ZSBfYWRkVG9QYXJlbnQobm9kZTogaHRtbC5Ob2RlKSB7XG4gICAgY29uc3QgcGFyZW50ID0gdGhpcy5fZ2V0UGFyZW50RWxlbWVudCgpO1xuICAgIGlmIChwYXJlbnQgIT0gbnVsbCkge1xuICAgICAgcGFyZW50LmNoaWxkcmVuLnB1c2gobm9kZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucm9vdE5vZGVzLnB1c2gobm9kZSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0RWxlbWVudEZ1bGxOYW1lKHByZWZpeDogc3RyaW5nLCBsb2NhbE5hbWU6IHN0cmluZywgcGFyZW50RWxlbWVudDogaHRtbC5FbGVtZW50fG51bGwpOlxuICAgICAgc3RyaW5nIHtcbiAgICBpZiAocHJlZml4ID09PSAnJykge1xuICAgICAgcHJlZml4ID0gdGhpcy5nZXRUYWdEZWZpbml0aW9uKGxvY2FsTmFtZSkuaW1wbGljaXROYW1lc3BhY2VQcmVmaXggfHwgJyc7XG4gICAgICBpZiAocHJlZml4ID09PSAnJyAmJiBwYXJlbnRFbGVtZW50ICE9IG51bGwpIHtcbiAgICAgICAgY29uc3QgcGFyZW50VGFnTmFtZSA9IHNwbGl0TnNOYW1lKHBhcmVudEVsZW1lbnQubmFtZSlbMV07XG4gICAgICAgIGNvbnN0IHBhcmVudFRhZ0RlZmluaXRpb24gPSB0aGlzLmdldFRhZ0RlZmluaXRpb24ocGFyZW50VGFnTmFtZSk7XG4gICAgICAgIGlmICghcGFyZW50VGFnRGVmaW5pdGlvbi5wcmV2ZW50TmFtZXNwYWNlSW5oZXJpdGFuY2UpIHtcbiAgICAgICAgICBwcmVmaXggPSBnZXROc1ByZWZpeChwYXJlbnRFbGVtZW50Lm5hbWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG1lcmdlTnNBbmROYW1lKHByZWZpeCwgbG9jYWxOYW1lKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBsYXN0T25TdGFjayhzdGFjazogYW55W10sIGVsZW1lbnQ6IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gc3RhY2subGVuZ3RoID4gMCAmJiBzdGFja1tzdGFjay5sZW5ndGggLSAxXSA9PT0gZWxlbWVudDtcbn1cblxuLyoqXG4gKiBEZWNvZGUgdGhlIGBlbnRpdHlgIHN0cmluZywgd2hpY2ggd2UgYmVsaWV2ZSBpcyB0aGUgY29udGVudHMgb2YgYW4gSFRNTCBlbnRpdHkuXG4gKlxuICogSWYgdGhlIHN0cmluZyBpcyBub3QgYWN0dWFsbHkgYSB2YWxpZC9rbm93biBlbnRpdHkgdGhlbiBqdXN0IHJldHVybiB0aGUgb3JpZ2luYWwgYG1hdGNoYCBzdHJpbmcuXG4gKi9cbmZ1bmN0aW9uIGRlY29kZUVudGl0eShtYXRjaDogc3RyaW5nLCBlbnRpdHk6IHN0cmluZyk6IHN0cmluZyB7XG4gIGlmIChOQU1FRF9FTlRJVElFU1tlbnRpdHldICE9PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gTkFNRURfRU5USVRJRVNbZW50aXR5XSB8fCBtYXRjaDtcbiAgfVxuICBpZiAoL14jeFthLWYwLTldKyQvaS50ZXN0KGVudGl0eSkpIHtcbiAgICByZXR1cm4gU3RyaW5nLmZyb21Db2RlUG9pbnQocGFyc2VJbnQoZW50aXR5LnNsaWNlKDIpLCAxNikpO1xuICB9XG4gIGlmICgvXiNcXGQrJC8udGVzdChlbnRpdHkpKSB7XG4gICAgcmV0dXJuIFN0cmluZy5mcm9tQ29kZVBvaW50KHBhcnNlSW50KGVudGl0eS5zbGljZSgxKSwgMTApKTtcbiAgfVxuICByZXR1cm4gbWF0Y2g7XG59XG4iXX0=