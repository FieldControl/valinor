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
        this._containerStack = [];
        this.rootNodes = [];
        this.errors = [];
        this._advance();
    }
    build() {
        while (this._peek.type !== 33 /* TokenType.EOF */) {
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
            else if (this._peek.type === 5 /* TokenType.TEXT */ ||
                this._peek.type === 7 /* TokenType.RAW_TEXT */ ||
                this._peek.type === 6 /* TokenType.ESCAPABLE_RAW_TEXT */) {
                this._closeVoidElement();
                this._consumeText(this._advance());
            }
            else if (this._peek.type === 19 /* TokenType.EXPANSION_FORM_START */) {
                this._consumeExpansion(this._advance());
            }
            else if (this._peek.type === 24 /* TokenType.BLOCK_OPEN_START */) {
                this._closeVoidElement();
                this._consumeBlockOpen(this._advance());
            }
            else if (this._peek.type === 26 /* TokenType.BLOCK_CLOSE */) {
                this._closeVoidElement();
                this._consumeBlockClose(this._advance());
            }
            else if (this._peek.type === 28 /* TokenType.INCOMPLETE_BLOCK_OPEN */) {
                this._closeVoidElement();
                this._consumeIncompleteBlock(this._advance());
            }
            else if (this._peek.type === 29 /* TokenType.LET_START */) {
                this._closeVoidElement();
                this._consumeLet(this._advance());
            }
            else if (this._peek.type === 32 /* TokenType.INCOMPLETE_LET */) {
                this._closeVoidElement();
                this._consumeIncompleteLet(this._advance());
            }
            else {
                // Skip all other tokens...
                this._advance();
            }
        }
        for (const leftoverContainer of this._containerStack) {
            // Unlike HTML elements, blocks aren't closed implicitly by the end of the file.
            if (leftoverContainer instanceof html.Block) {
                this.errors.push(TreeError.create(leftoverContainer.name, leftoverContainer.sourceSpan, `Unclosed block "${leftoverContainer.name}"`));
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
        const endToken = this._advanceIf(11 /* TokenType.COMMENT_END */);
        const value = text != null ? text.parts[0].trim() : null;
        const sourceSpan = endToken == null
            ? token.sourceSpan
            : new ParseSourceSpan(token.sourceSpan.start, endToken.sourceSpan.end, token.sourceSpan.fullStart);
        this._addToParent(new html.Comment(value, sourceSpan));
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
        exp.push({ type: 33 /* TokenType.EOF */, parts: [], sourceSpan: end.sourceSpan });
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
            if (this._peek.type === 33 /* TokenType.EOF */) {
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
            const parent = this._getContainer();
            if (parent != null &&
                parent.children.length === 0 &&
                this.getTagDefinition(parent.name).ignoreFirstLf) {
                text = text.substring(1);
                tokens[0] = { type: token.type, sourceSpan: token.sourceSpan, parts: [text] };
            }
        }
        while (this._peek.type === 8 /* TokenType.INTERPOLATION */ ||
            this._peek.type === 5 /* TokenType.TEXT */ ||
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
        const el = this._getContainer();
        if (el instanceof html.Element && this.getTagDefinition(el.name).isVoid) {
            this._containerStack.pop();
        }
    }
    _consumeStartTag(startTagToken) {
        const [prefix, name] = startTagToken.parts;
        const attrs = [];
        while (this._peek.type === 14 /* TokenType.ATTR_NAME */) {
            attrs.push(this._consumeAttr(this._advance()));
        }
        const fullName = this._getElementFullName(prefix, name, this._getClosestParentElement());
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
        const parentEl = this._getContainer();
        this._pushContainer(el, parentEl instanceof html.Element &&
            this.getTagDefinition(parentEl.name).isClosedByChild(el.name));
        if (selfClosing) {
            // Elements that are self-closed have their `endSourceSpan` set to the full span, as the
            // element start tag also represents the end tag.
            this._popContainer(fullName, html.Element, span);
        }
        else if (startTagToken.type === 4 /* TokenType.INCOMPLETE_TAG_OPEN */) {
            // We already know the opening tag is not complete, so it is unlikely it has a corresponding
            // close tag. Let's optimistically parse it as a full element and emit an error.
            this._popContainer(fullName, html.Element, null);
            this.errors.push(TreeError.create(fullName, span, `Opening tag "${fullName}" not terminated.`));
        }
    }
    _pushContainer(node, isClosedByChild) {
        if (isClosedByChild) {
            this._containerStack.pop();
        }
        this._addToParent(node);
        this._containerStack.push(node);
    }
    _consumeEndTag(endTagToken) {
        const fullName = this._getElementFullName(endTagToken.parts[0], endTagToken.parts[1], this._getClosestParentElement());
        if (this.getTagDefinition(fullName).isVoid) {
            this.errors.push(TreeError.create(fullName, endTagToken.sourceSpan, `Void elements do not have end tags "${endTagToken.parts[1]}"`));
        }
        else if (!this._popContainer(fullName, html.Element, endTagToken.sourceSpan)) {
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
    _popContainer(expectedName, expectedType, endSourceSpan) {
        let unexpectedCloseTagDetected = false;
        for (let stackIndex = this._containerStack.length - 1; stackIndex >= 0; stackIndex--) {
            const node = this._containerStack[stackIndex];
            if ((node.name === expectedName || expectedName === null) && node instanceof expectedType) {
                // Record the parse span with the element that is being closed. Any elements that are
                // removed from the element stack at this point are closed implicitly, so they won't get
                // an end source span (as there is no explicit closing element).
                node.endSourceSpan = endSourceSpan;
                node.sourceSpan.end = endSourceSpan !== null ? endSourceSpan.end : node.sourceSpan.end;
                this._containerStack.splice(stackIndex, this._containerStack.length - stackIndex);
                return !unexpectedCloseTagDetected;
            }
            // Blocks and most elements are not self closing.
            if (node instanceof html.Block ||
                (node instanceof html.Element && !this.getTagDefinition(node.name).closedByParent)) {
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
        const valueSpan = valueStartSpan &&
            valueEnd &&
            new ParseSourceSpan(valueStartSpan.start, valueEnd, valueStartSpan.fullStart);
        return new html.Attribute(fullName, value, new ParseSourceSpan(attrName.sourceSpan.start, attrEnd, attrName.sourceSpan.fullStart), attrName.sourceSpan, valueSpan, valueTokens.length > 0 ? valueTokens : undefined, undefined);
    }
    _consumeBlockOpen(token) {
        const parameters = [];
        while (this._peek.type === 27 /* TokenType.BLOCK_PARAMETER */) {
            const paramToken = this._advance();
            parameters.push(new html.BlockParameter(paramToken.parts[0], paramToken.sourceSpan));
        }
        if (this._peek.type === 25 /* TokenType.BLOCK_OPEN_END */) {
            this._advance();
        }
        const end = this._peek.sourceSpan.fullStart;
        const span = new ParseSourceSpan(token.sourceSpan.start, end, token.sourceSpan.fullStart);
        // Create a separate `startSpan` because `span` will be modified when there is an `end` span.
        const startSpan = new ParseSourceSpan(token.sourceSpan.start, end, token.sourceSpan.fullStart);
        const block = new html.Block(token.parts[0], parameters, [], span, token.sourceSpan, startSpan);
        this._pushContainer(block, false);
    }
    _consumeBlockClose(token) {
        if (!this._popContainer(null, html.Block, token.sourceSpan)) {
            this.errors.push(TreeError.create(null, token.sourceSpan, `Unexpected closing block. The block may have been closed earlier. ` +
                `If you meant to write the } character, you should use the "&#125;" ` +
                `HTML entity instead.`));
        }
    }
    _consumeIncompleteBlock(token) {
        const parameters = [];
        while (this._peek.type === 27 /* TokenType.BLOCK_PARAMETER */) {
            const paramToken = this._advance();
            parameters.push(new html.BlockParameter(paramToken.parts[0], paramToken.sourceSpan));
        }
        const end = this._peek.sourceSpan.fullStart;
        const span = new ParseSourceSpan(token.sourceSpan.start, end, token.sourceSpan.fullStart);
        // Create a separate `startSpan` because `span` will be modified when there is an `end` span.
        const startSpan = new ParseSourceSpan(token.sourceSpan.start, end, token.sourceSpan.fullStart);
        const block = new html.Block(token.parts[0], parameters, [], span, token.sourceSpan, startSpan);
        this._pushContainer(block, false);
        // Incomplete blocks don't have children so we close them immediately and report an error.
        this._popContainer(null, html.Block, null);
        this.errors.push(TreeError.create(token.parts[0], span, `Incomplete block "${token.parts[0]}". If you meant to write the @ character, ` +
            `you should use the "&#64;" HTML entity instead.`));
    }
    _consumeLet(startToken) {
        const name = startToken.parts[0];
        let valueToken;
        let endToken;
        if (this._peek.type !== 30 /* TokenType.LET_VALUE */) {
            this.errors.push(TreeError.create(startToken.parts[0], startToken.sourceSpan, `Invalid @let declaration "${name}". Declaration must have a value.`));
            return;
        }
        else {
            valueToken = this._advance();
        }
        // Type cast is necessary here since TS narrowed the type of `peek` above.
        if (this._peek.type !== 31 /* TokenType.LET_END */) {
            this.errors.push(TreeError.create(startToken.parts[0], startToken.sourceSpan, `Unterminated @let declaration "${name}". Declaration must be terminated with a semicolon.`));
            return;
        }
        else {
            endToken = this._advance();
        }
        const end = endToken.sourceSpan.fullStart;
        const span = new ParseSourceSpan(startToken.sourceSpan.start, end, startToken.sourceSpan.fullStart);
        // The start token usually captures the `@let`. Construct a name span by
        // offsetting the start by the length of any text before the name.
        const startOffset = startToken.sourceSpan.toString().lastIndexOf(name);
        const nameStart = startToken.sourceSpan.start.moveBy(startOffset);
        const nameSpan = new ParseSourceSpan(nameStart, startToken.sourceSpan.end);
        const node = new html.LetDeclaration(name, valueToken.parts[0], span, nameSpan, valueToken.sourceSpan);
        this._addToParent(node);
    }
    _consumeIncompleteLet(token) {
        // Incomplete `@let` declaration may end up with an empty name.
        const name = token.parts[0] ?? '';
        const nameString = name ? ` "${name}"` : '';
        // If there's at least a name, we can salvage an AST node that can be used for completions.
        if (name.length > 0) {
            const startOffset = token.sourceSpan.toString().lastIndexOf(name);
            const nameStart = token.sourceSpan.start.moveBy(startOffset);
            const nameSpan = new ParseSourceSpan(nameStart, token.sourceSpan.end);
            const valueSpan = new ParseSourceSpan(token.sourceSpan.start, token.sourceSpan.start.moveBy(0));
            const node = new html.LetDeclaration(name, '', token.sourceSpan, nameSpan, valueSpan);
            this._addToParent(node);
        }
        this.errors.push(TreeError.create(token.parts[0], token.sourceSpan, `Incomplete @let declaration${nameString}. ` +
            `@let declarations must be written as \`@let <name> = <value>;\``));
    }
    _getContainer() {
        return this._containerStack.length > 0
            ? this._containerStack[this._containerStack.length - 1]
            : null;
    }
    _getClosestParentElement() {
        for (let i = this._containerStack.length - 1; i > -1; i--) {
            if (this._containerStack[i] instanceof html.Element) {
                return this._containerStack[i];
            }
        }
        return null;
    }
    _addToParent(node) {
        const parent = this._getContainer();
        if (parent === null) {
            this.rootNodes.push(node);
        }
        else {
            parent.children.push(node);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL21sX3BhcnNlci9wYXJzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFVBQVUsRUFBaUIsZUFBZSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRXpFLE9BQU8sS0FBSyxJQUFJLE1BQU0sT0FBTyxDQUFDO0FBQzlCLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxZQUFZLENBQUM7QUFDMUMsT0FBTyxFQUFDLFFBQVEsRUFBa0IsTUFBTSxTQUFTLENBQUM7QUFDbEQsT0FBTyxFQUFDLFdBQVcsRUFBRSxjQUFjLEVBQUUsV0FBVyxFQUFnQixNQUFNLFFBQVEsQ0FBQztBQW9DL0UsTUFBTSxPQUFPLFNBQVUsU0FBUSxVQUFVO0lBQ3ZDLE1BQU0sQ0FBQyxNQUFNLENBQUMsV0FBMEIsRUFBRSxJQUFxQixFQUFFLEdBQVc7UUFDMUUsT0FBTyxJQUFJLFNBQVMsQ0FBQyxXQUFXLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFFRCxZQUNTLFdBQTBCLEVBQ2pDLElBQXFCLEVBQ3JCLEdBQVc7UUFFWCxLQUFLLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBSlYsZ0JBQVcsR0FBWCxXQUFXLENBQWU7SUFLbkMsQ0FBQztDQUNGO0FBRUQsTUFBTSxPQUFPLGVBQWU7SUFDMUIsWUFDUyxTQUFzQixFQUN0QixNQUFvQjtRQURwQixjQUFTLEdBQVQsU0FBUyxDQUFhO1FBQ3RCLFdBQU0sR0FBTixNQUFNLENBQWM7SUFDMUIsQ0FBQztDQUNMO0FBRUQsTUFBTSxPQUFPLE1BQU07SUFDakIsWUFBbUIsZ0JBQW9EO1FBQXBELHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBb0M7SUFBRyxDQUFDO0lBRTNFLEtBQUssQ0FBQyxNQUFjLEVBQUUsR0FB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QyxPQUFPLGNBQWMsQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUM7SUFDekMsQ0FBQztJQUNELElBQUksZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7UUFDbEMsT0FBTyxNQUFNLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDN0QsQ0FBQztJQUNELElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1FBQzFCLE9BQU8sTUFBTSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzdELENBQUM7SUFDRCxPQUFPLEtBQUssQ0FBQztBQUNmLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtQYXJzZUVycm9yLCBQYXJzZUxvY2F0aW9uLCBQYXJzZVNvdXJjZVNwYW59IGZyb20gJy4uL3BhcnNlX3V0aWwnO1xuXG5pbXBvcnQgKiBhcyBodG1sIGZyb20gJy4vYXN0JztcbmltcG9ydCB7TkFNRURfRU5USVRJRVN9IGZyb20gJy4vZW50aXRpZXMnO1xuaW1wb3J0IHt0b2tlbml6ZSwgVG9rZW5pemVPcHRpb25zfSBmcm9tICcuL2xleGVyJztcbmltcG9ydCB7Z2V0TnNQcmVmaXgsIG1lcmdlTnNBbmROYW1lLCBzcGxpdE5zTmFtZSwgVGFnRGVmaW5pdGlvbn0gZnJvbSAnLi90YWdzJztcbmltcG9ydCB7XG4gIEF0dHJpYnV0ZU5hbWVUb2tlbixcbiAgQXR0cmlidXRlUXVvdGVUb2tlbixcbiAgQmxvY2tDbG9zZVRva2VuLFxuICBCbG9ja09wZW5TdGFydFRva2VuLFxuICBCbG9ja1BhcmFtZXRlclRva2VuLFxuICBDZGF0YVN0YXJ0VG9rZW4sXG4gIENvbW1lbnRTdGFydFRva2VuLFxuICBFeHBhbnNpb25DYXNlRXhwcmVzc2lvbkVuZFRva2VuLFxuICBFeHBhbnNpb25DYXNlRXhwcmVzc2lvblN0YXJ0VG9rZW4sXG4gIEV4cGFuc2lvbkNhc2VWYWx1ZVRva2VuLFxuICBFeHBhbnNpb25Gb3JtU3RhcnRUb2tlbixcbiAgSW5jb21wbGV0ZUJsb2NrT3BlblRva2VuLFxuICBJbmNvbXBsZXRlTGV0VG9rZW4sXG4gIEluY29tcGxldGVUYWdPcGVuVG9rZW4sXG4gIEludGVycG9sYXRlZEF0dHJpYnV0ZVRva2VuLFxuICBJbnRlcnBvbGF0ZWRUZXh0VG9rZW4sXG4gIExldEVuZFRva2VuLFxuICBMZXRTdGFydFRva2VuLFxuICBMZXRWYWx1ZVRva2VuLFxuICBUYWdDbG9zZVRva2VuLFxuICBUYWdPcGVuU3RhcnRUb2tlbixcbiAgVGV4dFRva2VuLFxuICBUb2tlbixcbiAgVG9rZW5UeXBlLFxufSBmcm9tICcuL3Rva2Vucyc7XG5cbi8qKiBOb2RlcyB0aGF0IGNhbiBjb250YWluIG90aGVyIG5vZGVzLiAqL1xudHlwZSBOb2RlQ29udGFpbmVyID0gaHRtbC5FbGVtZW50IHwgaHRtbC5CbG9jaztcblxuLyoqIENsYXNzIHRoYXQgY2FuIGNvbnN0cnVjdCBhIGBOb2RlQ29udGFpbmVyYC4gKi9cbmludGVyZmFjZSBOb2RlQ29udGFpbmVyQ29uc3RydWN0b3IgZXh0ZW5kcyBGdW5jdGlvbiB7XG4gIG5ldyAoLi4uYXJnczogYW55W10pOiBOb2RlQ29udGFpbmVyO1xufVxuXG5leHBvcnQgY2xhc3MgVHJlZUVycm9yIGV4dGVuZHMgUGFyc2VFcnJvciB7XG4gIHN0YXRpYyBjcmVhdGUoZWxlbWVudE5hbWU6IHN0cmluZyB8IG51bGwsIHNwYW46IFBhcnNlU291cmNlU3BhbiwgbXNnOiBzdHJpbmcpOiBUcmVlRXJyb3Ige1xuICAgIHJldHVybiBuZXcgVHJlZUVycm9yKGVsZW1lbnROYW1lLCBzcGFuLCBtc2cpO1xuICB9XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIGVsZW1lbnROYW1lOiBzdHJpbmcgfCBudWxsLFxuICAgIHNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICBtc2c6IHN0cmluZyxcbiAgKSB7XG4gICAgc3VwZXIoc3BhbiwgbXNnKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUGFyc2VUcmVlUmVzdWx0IHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIHJvb3ROb2RlczogaHRtbC5Ob2RlW10sXG4gICAgcHVibGljIGVycm9yczogUGFyc2VFcnJvcltdLFxuICApIHt9XG59XG5cbmV4cG9ydCBjbGFzcyBQYXJzZXIge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgZ2V0VGFnRGVmaW5pdGlvbjogKHRhZ05hbWU6IHN0cmluZykgPT4gVGFnRGVmaW5pdGlvbikge31cblxuICBwYXJzZShzb3VyY2U6IHN0cmluZywgdXJsOiBzdHJpbmcsIG9wdGlvbnM/OiBUb2tlbml6ZU9wdGlvbnMpOiBQYXJzZVRyZWVSZXN1bHQge1xuICAgIGNvbnN0IHRva2VuaXplUmVzdWx0ID0gdG9rZW5pemUoc291cmNlLCB1cmwsIHRoaXMuZ2V0VGFnRGVmaW5pdGlvbiwgb3B0aW9ucyk7XG4gICAgY29uc3QgcGFyc2VyID0gbmV3IF9UcmVlQnVpbGRlcih0b2tlbml6ZVJlc3VsdC50b2tlbnMsIHRoaXMuZ2V0VGFnRGVmaW5pdGlvbik7XG4gICAgcGFyc2VyLmJ1aWxkKCk7XG4gICAgcmV0dXJuIG5ldyBQYXJzZVRyZWVSZXN1bHQoXG4gICAgICBwYXJzZXIucm9vdE5vZGVzLFxuICAgICAgKHRva2VuaXplUmVzdWx0LmVycm9ycyBhcyBQYXJzZUVycm9yW10pLmNvbmNhdChwYXJzZXIuZXJyb3JzKSxcbiAgICApO1xuICB9XG59XG5cbmNsYXNzIF9UcmVlQnVpbGRlciB7XG4gIHByaXZhdGUgX2luZGV4OiBudW1iZXIgPSAtMTtcbiAgLy8gYF9wZWVrYCB3aWxsIGJlIGluaXRpYWxpemVkIGJ5IHRoZSBjYWxsIHRvIGBfYWR2YW5jZSgpYCBpbiB0aGUgY29uc3RydWN0b3IuXG4gIHByaXZhdGUgX3BlZWshOiBUb2tlbjtcbiAgcHJpdmF0ZSBfY29udGFpbmVyU3RhY2s6IE5vZGVDb250YWluZXJbXSA9IFtdO1xuXG4gIHJvb3ROb2RlczogaHRtbC5Ob2RlW10gPSBbXTtcbiAgZXJyb3JzOiBUcmVlRXJyb3JbXSA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgdG9rZW5zOiBUb2tlbltdLFxuICAgIHByaXZhdGUgZ2V0VGFnRGVmaW5pdGlvbjogKHRhZ05hbWU6IHN0cmluZykgPT4gVGFnRGVmaW5pdGlvbixcbiAgKSB7XG4gICAgdGhpcy5fYWR2YW5jZSgpO1xuICB9XG5cbiAgYnVpbGQoKTogdm9pZCB7XG4gICAgd2hpbGUgKHRoaXMuX3BlZWsudHlwZSAhPT0gVG9rZW5UeXBlLkVPRikge1xuICAgICAgaWYgKFxuICAgICAgICB0aGlzLl9wZWVrLnR5cGUgPT09IFRva2VuVHlwZS5UQUdfT1BFTl9TVEFSVCB8fFxuICAgICAgICB0aGlzLl9wZWVrLnR5cGUgPT09IFRva2VuVHlwZS5JTkNPTVBMRVRFX1RBR19PUEVOXG4gICAgICApIHtcbiAgICAgICAgdGhpcy5fY29uc3VtZVN0YXJ0VGFnKHRoaXMuX2FkdmFuY2UoKSk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX3BlZWsudHlwZSA9PT0gVG9rZW5UeXBlLlRBR19DTE9TRSkge1xuICAgICAgICB0aGlzLl9jb25zdW1lRW5kVGFnKHRoaXMuX2FkdmFuY2UoKSk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX3BlZWsudHlwZSA9PT0gVG9rZW5UeXBlLkNEQVRBX1NUQVJUKSB7XG4gICAgICAgIHRoaXMuX2Nsb3NlVm9pZEVsZW1lbnQoKTtcbiAgICAgICAgdGhpcy5fY29uc3VtZUNkYXRhKHRoaXMuX2FkdmFuY2UoKSk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX3BlZWsudHlwZSA9PT0gVG9rZW5UeXBlLkNPTU1FTlRfU1RBUlQpIHtcbiAgICAgICAgdGhpcy5fY2xvc2VWb2lkRWxlbWVudCgpO1xuICAgICAgICB0aGlzLl9jb25zdW1lQ29tbWVudCh0aGlzLl9hZHZhbmNlKCkpO1xuICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgdGhpcy5fcGVlay50eXBlID09PSBUb2tlblR5cGUuVEVYVCB8fFxuICAgICAgICB0aGlzLl9wZWVrLnR5cGUgPT09IFRva2VuVHlwZS5SQVdfVEVYVCB8fFxuICAgICAgICB0aGlzLl9wZWVrLnR5cGUgPT09IFRva2VuVHlwZS5FU0NBUEFCTEVfUkFXX1RFWFRcbiAgICAgICkge1xuICAgICAgICB0aGlzLl9jbG9zZVZvaWRFbGVtZW50KCk7XG4gICAgICAgIHRoaXMuX2NvbnN1bWVUZXh0KHRoaXMuX2FkdmFuY2UoKSk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX3BlZWsudHlwZSA9PT0gVG9rZW5UeXBlLkVYUEFOU0lPTl9GT1JNX1NUQVJUKSB7XG4gICAgICAgIHRoaXMuX2NvbnN1bWVFeHBhbnNpb24odGhpcy5fYWR2YW5jZSgpKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fcGVlay50eXBlID09PSBUb2tlblR5cGUuQkxPQ0tfT1BFTl9TVEFSVCkge1xuICAgICAgICB0aGlzLl9jbG9zZVZvaWRFbGVtZW50KCk7XG4gICAgICAgIHRoaXMuX2NvbnN1bWVCbG9ja09wZW4odGhpcy5fYWR2YW5jZSgpKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fcGVlay50eXBlID09PSBUb2tlblR5cGUuQkxPQ0tfQ0xPU0UpIHtcbiAgICAgICAgdGhpcy5fY2xvc2VWb2lkRWxlbWVudCgpO1xuICAgICAgICB0aGlzLl9jb25zdW1lQmxvY2tDbG9zZSh0aGlzLl9hZHZhbmNlKCkpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl9wZWVrLnR5cGUgPT09IFRva2VuVHlwZS5JTkNPTVBMRVRFX0JMT0NLX09QRU4pIHtcbiAgICAgICAgdGhpcy5fY2xvc2VWb2lkRWxlbWVudCgpO1xuICAgICAgICB0aGlzLl9jb25zdW1lSW5jb21wbGV0ZUJsb2NrKHRoaXMuX2FkdmFuY2UoKSk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX3BlZWsudHlwZSA9PT0gVG9rZW5UeXBlLkxFVF9TVEFSVCkge1xuICAgICAgICB0aGlzLl9jbG9zZVZvaWRFbGVtZW50KCk7XG4gICAgICAgIHRoaXMuX2NvbnN1bWVMZXQodGhpcy5fYWR2YW5jZSgpKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fcGVlay50eXBlID09PSBUb2tlblR5cGUuSU5DT01QTEVURV9MRVQpIHtcbiAgICAgICAgdGhpcy5fY2xvc2VWb2lkRWxlbWVudCgpO1xuICAgICAgICB0aGlzLl9jb25zdW1lSW5jb21wbGV0ZUxldCh0aGlzLl9hZHZhbmNlKCkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gU2tpcCBhbGwgb3RoZXIgdG9rZW5zLi4uXG4gICAgICAgIHRoaXMuX2FkdmFuY2UoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IGxlZnRvdmVyQ29udGFpbmVyIG9mIHRoaXMuX2NvbnRhaW5lclN0YWNrKSB7XG4gICAgICAvLyBVbmxpa2UgSFRNTCBlbGVtZW50cywgYmxvY2tzIGFyZW4ndCBjbG9zZWQgaW1wbGljaXRseSBieSB0aGUgZW5kIG9mIHRoZSBmaWxlLlxuICAgICAgaWYgKGxlZnRvdmVyQ29udGFpbmVyIGluc3RhbmNlb2YgaHRtbC5CbG9jaykge1xuICAgICAgICB0aGlzLmVycm9ycy5wdXNoKFxuICAgICAgICAgIFRyZWVFcnJvci5jcmVhdGUoXG4gICAgICAgICAgICBsZWZ0b3ZlckNvbnRhaW5lci5uYW1lLFxuICAgICAgICAgICAgbGVmdG92ZXJDb250YWluZXIuc291cmNlU3BhbixcbiAgICAgICAgICAgIGBVbmNsb3NlZCBibG9jayBcIiR7bGVmdG92ZXJDb250YWluZXIubmFtZX1cImAsXG4gICAgICAgICAgKSxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9hZHZhbmNlPFQgZXh0ZW5kcyBUb2tlbj4oKTogVCB7XG4gICAgY29uc3QgcHJldiA9IHRoaXMuX3BlZWs7XG4gICAgaWYgKHRoaXMuX2luZGV4IDwgdGhpcy50b2tlbnMubGVuZ3RoIC0gMSkge1xuICAgICAgLy8gTm90ZTogdGhlcmUgaXMgYWx3YXlzIGFuIEVPRiB0b2tlbiBhdCB0aGUgZW5kXG4gICAgICB0aGlzLl9pbmRleCsrO1xuICAgIH1cbiAgICB0aGlzLl9wZWVrID0gdGhpcy50b2tlbnNbdGhpcy5faW5kZXhdO1xuICAgIHJldHVybiBwcmV2IGFzIFQ7XG4gIH1cblxuICBwcml2YXRlIF9hZHZhbmNlSWY8VCBleHRlbmRzIFRva2VuVHlwZT4odHlwZTogVCk6IChUb2tlbiAmIHt0eXBlOiBUfSkgfCBudWxsIHtcbiAgICBpZiAodGhpcy5fcGVlay50eXBlID09PSB0eXBlKSB7XG4gICAgICByZXR1cm4gdGhpcy5fYWR2YW5jZTxUb2tlbiAmIHt0eXBlOiBUfT4oKTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBwcml2YXRlIF9jb25zdW1lQ2RhdGEoX3N0YXJ0VG9rZW46IENkYXRhU3RhcnRUb2tlbikge1xuICAgIHRoaXMuX2NvbnN1bWVUZXh0KHRoaXMuX2FkdmFuY2U8VGV4dFRva2VuPigpKTtcbiAgICB0aGlzLl9hZHZhbmNlSWYoVG9rZW5UeXBlLkNEQVRBX0VORCk7XG4gIH1cblxuICBwcml2YXRlIF9jb25zdW1lQ29tbWVudCh0b2tlbjogQ29tbWVudFN0YXJ0VG9rZW4pIHtcbiAgICBjb25zdCB0ZXh0ID0gdGhpcy5fYWR2YW5jZUlmKFRva2VuVHlwZS5SQVdfVEVYVCk7XG4gICAgY29uc3QgZW5kVG9rZW4gPSB0aGlzLl9hZHZhbmNlSWYoVG9rZW5UeXBlLkNPTU1FTlRfRU5EKTtcbiAgICBjb25zdCB2YWx1ZSA9IHRleHQgIT0gbnVsbCA/IHRleHQucGFydHNbMF0udHJpbSgpIDogbnVsbDtcbiAgICBjb25zdCBzb3VyY2VTcGFuID1cbiAgICAgIGVuZFRva2VuID09IG51bGxcbiAgICAgICAgPyB0b2tlbi5zb3VyY2VTcGFuXG4gICAgICAgIDogbmV3IFBhcnNlU291cmNlU3BhbihcbiAgICAgICAgICAgIHRva2VuLnNvdXJjZVNwYW4uc3RhcnQsXG4gICAgICAgICAgICBlbmRUb2tlbi5zb3VyY2VTcGFuLmVuZCxcbiAgICAgICAgICAgIHRva2VuLnNvdXJjZVNwYW4uZnVsbFN0YXJ0LFxuICAgICAgICAgICk7XG4gICAgdGhpcy5fYWRkVG9QYXJlbnQobmV3IGh0bWwuQ29tbWVudCh2YWx1ZSwgc291cmNlU3BhbikpO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29uc3VtZUV4cGFuc2lvbih0b2tlbjogRXhwYW5zaW9uRm9ybVN0YXJ0VG9rZW4pIHtcbiAgICBjb25zdCBzd2l0Y2hWYWx1ZSA9IHRoaXMuX2FkdmFuY2U8VGV4dFRva2VuPigpO1xuXG4gICAgY29uc3QgdHlwZSA9IHRoaXMuX2FkdmFuY2U8VGV4dFRva2VuPigpO1xuICAgIGNvbnN0IGNhc2VzOiBodG1sLkV4cGFuc2lvbkNhc2VbXSA9IFtdO1xuXG4gICAgLy8gcmVhZCA9XG4gICAgd2hpbGUgKHRoaXMuX3BlZWsudHlwZSA9PT0gVG9rZW5UeXBlLkVYUEFOU0lPTl9DQVNFX1ZBTFVFKSB7XG4gICAgICBjb25zdCBleHBDYXNlID0gdGhpcy5fcGFyc2VFeHBhbnNpb25DYXNlKCk7XG4gICAgICBpZiAoIWV4cENhc2UpIHJldHVybjsgLy8gZXJyb3JcbiAgICAgIGNhc2VzLnB1c2goZXhwQ2FzZSk7XG4gICAgfVxuXG4gICAgLy8gcmVhZCB0aGUgZmluYWwgfVxuICAgIGlmICh0aGlzLl9wZWVrLnR5cGUgIT09IFRva2VuVHlwZS5FWFBBTlNJT05fRk9STV9FTkQpIHtcbiAgICAgIHRoaXMuZXJyb3JzLnB1c2goXG4gICAgICAgIFRyZWVFcnJvci5jcmVhdGUobnVsbCwgdGhpcy5fcGVlay5zb3VyY2VTcGFuLCBgSW52YWxpZCBJQ1UgbWVzc2FnZS4gTWlzc2luZyAnfScuYCksXG4gICAgICApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBzb3VyY2VTcGFuID0gbmV3IFBhcnNlU291cmNlU3BhbihcbiAgICAgIHRva2VuLnNvdXJjZVNwYW4uc3RhcnQsXG4gICAgICB0aGlzLl9wZWVrLnNvdXJjZVNwYW4uZW5kLFxuICAgICAgdG9rZW4uc291cmNlU3Bhbi5mdWxsU3RhcnQsXG4gICAgKTtcbiAgICB0aGlzLl9hZGRUb1BhcmVudChcbiAgICAgIG5ldyBodG1sLkV4cGFuc2lvbihcbiAgICAgICAgc3dpdGNoVmFsdWUucGFydHNbMF0sXG4gICAgICAgIHR5cGUucGFydHNbMF0sXG4gICAgICAgIGNhc2VzLFxuICAgICAgICBzb3VyY2VTcGFuLFxuICAgICAgICBzd2l0Y2hWYWx1ZS5zb3VyY2VTcGFuLFxuICAgICAgKSxcbiAgICApO1xuXG4gICAgdGhpcy5fYWR2YW5jZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBfcGFyc2VFeHBhbnNpb25DYXNlKCk6IGh0bWwuRXhwYW5zaW9uQ2FzZSB8IG51bGwge1xuICAgIGNvbnN0IHZhbHVlID0gdGhpcy5fYWR2YW5jZTxFeHBhbnNpb25DYXNlVmFsdWVUb2tlbj4oKTtcblxuICAgIC8vIHJlYWQge1xuICAgIGlmICh0aGlzLl9wZWVrLnR5cGUgIT09IFRva2VuVHlwZS5FWFBBTlNJT05fQ0FTRV9FWFBfU1RBUlQpIHtcbiAgICAgIHRoaXMuZXJyb3JzLnB1c2goXG4gICAgICAgIFRyZWVFcnJvci5jcmVhdGUobnVsbCwgdGhpcy5fcGVlay5zb3VyY2VTcGFuLCBgSW52YWxpZCBJQ1UgbWVzc2FnZS4gTWlzc2luZyAneycuYCksXG4gICAgICApO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8gcmVhZCB1bnRpbCB9XG4gICAgY29uc3Qgc3RhcnQgPSB0aGlzLl9hZHZhbmNlPEV4cGFuc2lvbkNhc2VFeHByZXNzaW9uU3RhcnRUb2tlbj4oKTtcblxuICAgIGNvbnN0IGV4cCA9IHRoaXMuX2NvbGxlY3RFeHBhbnNpb25FeHBUb2tlbnMoc3RhcnQpO1xuICAgIGlmICghZXhwKSByZXR1cm4gbnVsbDtcblxuICAgIGNvbnN0IGVuZCA9IHRoaXMuX2FkdmFuY2U8RXhwYW5zaW9uQ2FzZUV4cHJlc3Npb25FbmRUb2tlbj4oKTtcbiAgICBleHAucHVzaCh7dHlwZTogVG9rZW5UeXBlLkVPRiwgcGFydHM6IFtdLCBzb3VyY2VTcGFuOiBlbmQuc291cmNlU3Bhbn0pO1xuXG4gICAgLy8gcGFyc2UgZXZlcnl0aGluZyBpbiBiZXR3ZWVuIHsgYW5kIH1cbiAgICBjb25zdCBleHBhbnNpb25DYXNlUGFyc2VyID0gbmV3IF9UcmVlQnVpbGRlcihleHAsIHRoaXMuZ2V0VGFnRGVmaW5pdGlvbik7XG4gICAgZXhwYW5zaW9uQ2FzZVBhcnNlci5idWlsZCgpO1xuICAgIGlmIChleHBhbnNpb25DYXNlUGFyc2VyLmVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLmVycm9ycyA9IHRoaXMuZXJyb3JzLmNvbmNhdChleHBhbnNpb25DYXNlUGFyc2VyLmVycm9ycyk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBzb3VyY2VTcGFuID0gbmV3IFBhcnNlU291cmNlU3BhbihcbiAgICAgIHZhbHVlLnNvdXJjZVNwYW4uc3RhcnQsXG4gICAgICBlbmQuc291cmNlU3Bhbi5lbmQsXG4gICAgICB2YWx1ZS5zb3VyY2VTcGFuLmZ1bGxTdGFydCxcbiAgICApO1xuICAgIGNvbnN0IGV4cFNvdXJjZVNwYW4gPSBuZXcgUGFyc2VTb3VyY2VTcGFuKFxuICAgICAgc3RhcnQuc291cmNlU3Bhbi5zdGFydCxcbiAgICAgIGVuZC5zb3VyY2VTcGFuLmVuZCxcbiAgICAgIHN0YXJ0LnNvdXJjZVNwYW4uZnVsbFN0YXJ0LFxuICAgICk7XG4gICAgcmV0dXJuIG5ldyBodG1sLkV4cGFuc2lvbkNhc2UoXG4gICAgICB2YWx1ZS5wYXJ0c1swXSxcbiAgICAgIGV4cGFuc2lvbkNhc2VQYXJzZXIucm9vdE5vZGVzLFxuICAgICAgc291cmNlU3BhbixcbiAgICAgIHZhbHVlLnNvdXJjZVNwYW4sXG4gICAgICBleHBTb3VyY2VTcGFuLFxuICAgICk7XG4gIH1cblxuICBwcml2YXRlIF9jb2xsZWN0RXhwYW5zaW9uRXhwVG9rZW5zKHN0YXJ0OiBUb2tlbik6IFRva2VuW10gfCBudWxsIHtcbiAgICBjb25zdCBleHA6IFRva2VuW10gPSBbXTtcbiAgICBjb25zdCBleHBhbnNpb25Gb3JtU3RhY2sgPSBbVG9rZW5UeXBlLkVYUEFOU0lPTl9DQVNFX0VYUF9TVEFSVF07XG5cbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgaWYgKFxuICAgICAgICB0aGlzLl9wZWVrLnR5cGUgPT09IFRva2VuVHlwZS5FWFBBTlNJT05fRk9STV9TVEFSVCB8fFxuICAgICAgICB0aGlzLl9wZWVrLnR5cGUgPT09IFRva2VuVHlwZS5FWFBBTlNJT05fQ0FTRV9FWFBfU1RBUlRcbiAgICAgICkge1xuICAgICAgICBleHBhbnNpb25Gb3JtU3RhY2sucHVzaCh0aGlzLl9wZWVrLnR5cGUpO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5fcGVlay50eXBlID09PSBUb2tlblR5cGUuRVhQQU5TSU9OX0NBU0VfRVhQX0VORCkge1xuICAgICAgICBpZiAobGFzdE9uU3RhY2soZXhwYW5zaW9uRm9ybVN0YWNrLCBUb2tlblR5cGUuRVhQQU5TSU9OX0NBU0VfRVhQX1NUQVJUKSkge1xuICAgICAgICAgIGV4cGFuc2lvbkZvcm1TdGFjay5wb3AoKTtcbiAgICAgICAgICBpZiAoZXhwYW5zaW9uRm9ybVN0YWNrLmxlbmd0aCA9PT0gMCkgcmV0dXJuIGV4cDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmVycm9ycy5wdXNoKFxuICAgICAgICAgICAgVHJlZUVycm9yLmNyZWF0ZShudWxsLCBzdGFydC5zb3VyY2VTcGFuLCBgSW52YWxpZCBJQ1UgbWVzc2FnZS4gTWlzc2luZyAnfScuYCksXG4gICAgICAgICAgKTtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5fcGVlay50eXBlID09PSBUb2tlblR5cGUuRVhQQU5TSU9OX0ZPUk1fRU5EKSB7XG4gICAgICAgIGlmIChsYXN0T25TdGFjayhleHBhbnNpb25Gb3JtU3RhY2ssIFRva2VuVHlwZS5FWFBBTlNJT05fRk9STV9TVEFSVCkpIHtcbiAgICAgICAgICBleHBhbnNpb25Gb3JtU3RhY2sucG9wKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5lcnJvcnMucHVzaChcbiAgICAgICAgICAgIFRyZWVFcnJvci5jcmVhdGUobnVsbCwgc3RhcnQuc291cmNlU3BhbiwgYEludmFsaWQgSUNVIG1lc3NhZ2UuIE1pc3NpbmcgJ30nLmApLFxuICAgICAgICAgICk7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuX3BlZWsudHlwZSA9PT0gVG9rZW5UeXBlLkVPRikge1xuICAgICAgICB0aGlzLmVycm9ycy5wdXNoKFxuICAgICAgICAgIFRyZWVFcnJvci5jcmVhdGUobnVsbCwgc3RhcnQuc291cmNlU3BhbiwgYEludmFsaWQgSUNVIG1lc3NhZ2UuIE1pc3NpbmcgJ30nLmApLFxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cblxuICAgICAgZXhwLnB1c2godGhpcy5fYWR2YW5jZSgpKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9jb25zdW1lVGV4dCh0b2tlbjogSW50ZXJwb2xhdGVkVGV4dFRva2VuKSB7XG4gICAgY29uc3QgdG9rZW5zID0gW3Rva2VuXTtcbiAgICBjb25zdCBzdGFydFNwYW4gPSB0b2tlbi5zb3VyY2VTcGFuO1xuICAgIGxldCB0ZXh0ID0gdG9rZW4ucGFydHNbMF07XG4gICAgaWYgKHRleHQubGVuZ3RoID4gMCAmJiB0ZXh0WzBdID09PSAnXFxuJykge1xuICAgICAgY29uc3QgcGFyZW50ID0gdGhpcy5fZ2V0Q29udGFpbmVyKCk7XG5cbiAgICAgIGlmIChcbiAgICAgICAgcGFyZW50ICE9IG51bGwgJiZcbiAgICAgICAgcGFyZW50LmNoaWxkcmVuLmxlbmd0aCA9PT0gMCAmJlxuICAgICAgICB0aGlzLmdldFRhZ0RlZmluaXRpb24ocGFyZW50Lm5hbWUpLmlnbm9yZUZpcnN0TGZcbiAgICAgICkge1xuICAgICAgICB0ZXh0ID0gdGV4dC5zdWJzdHJpbmcoMSk7XG4gICAgICAgIHRva2Vuc1swXSA9IHt0eXBlOiB0b2tlbi50eXBlLCBzb3VyY2VTcGFuOiB0b2tlbi5zb3VyY2VTcGFuLCBwYXJ0czogW3RleHRdfSBhcyB0eXBlb2YgdG9rZW47XG4gICAgICB9XG4gICAgfVxuXG4gICAgd2hpbGUgKFxuICAgICAgdGhpcy5fcGVlay50eXBlID09PSBUb2tlblR5cGUuSU5URVJQT0xBVElPTiB8fFxuICAgICAgdGhpcy5fcGVlay50eXBlID09PSBUb2tlblR5cGUuVEVYVCB8fFxuICAgICAgdGhpcy5fcGVlay50eXBlID09PSBUb2tlblR5cGUuRU5DT0RFRF9FTlRJVFlcbiAgICApIHtcbiAgICAgIHRva2VuID0gdGhpcy5fYWR2YW5jZSgpO1xuICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgaWYgKHRva2VuLnR5cGUgPT09IFRva2VuVHlwZS5JTlRFUlBPTEFUSU9OKSB7XG4gICAgICAgIC8vIEZvciBiYWNrd2FyZCBjb21wYXRpYmlsaXR5IHdlIGRlY29kZSBIVE1MIGVudGl0aWVzIHRoYXQgYXBwZWFyIGluIGludGVycG9sYXRpb25cbiAgICAgICAgLy8gZXhwcmVzc2lvbnMuIFRoaXMgaXMgYXJndWFibHkgYSBidWcsIGJ1dCBpdCBjb3VsZCBiZSBhIGNvbnNpZGVyYWJsZSBicmVha2luZyBjaGFuZ2UgdG9cbiAgICAgICAgLy8gZml4IGl0LiBJdCBzaG91bGQgYmUgYWRkcmVzc2VkIGluIGEgbGFyZ2VyIHByb2plY3QgdG8gcmVmYWN0b3IgdGhlIGVudGlyZSBwYXJzZXIvbGV4ZXJcbiAgICAgICAgLy8gY2hhaW4gYWZ0ZXIgVmlldyBFbmdpbmUgaGFzIGJlZW4gcmVtb3ZlZC5cbiAgICAgICAgdGV4dCArPSB0b2tlbi5wYXJ0cy5qb2luKCcnKS5yZXBsYWNlKC8mKFteO10rKTsvZywgZGVjb2RlRW50aXR5KTtcbiAgICAgIH0gZWxzZSBpZiAodG9rZW4udHlwZSA9PT0gVG9rZW5UeXBlLkVOQ09ERURfRU5USVRZKSB7XG4gICAgICAgIHRleHQgKz0gdG9rZW4ucGFydHNbMF07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0ZXh0ICs9IHRva2VuLnBhcnRzLmpvaW4oJycpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0ZXh0Lmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IGVuZFNwYW4gPSB0b2tlbi5zb3VyY2VTcGFuO1xuICAgICAgdGhpcy5fYWRkVG9QYXJlbnQoXG4gICAgICAgIG5ldyBodG1sLlRleHQoXG4gICAgICAgICAgdGV4dCxcbiAgICAgICAgICBuZXcgUGFyc2VTb3VyY2VTcGFuKHN0YXJ0U3Bhbi5zdGFydCwgZW5kU3Bhbi5lbmQsIHN0YXJ0U3Bhbi5mdWxsU3RhcnQsIHN0YXJ0U3Bhbi5kZXRhaWxzKSxcbiAgICAgICAgICB0b2tlbnMsXG4gICAgICAgICksXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2Nsb3NlVm9pZEVsZW1lbnQoKTogdm9pZCB7XG4gICAgY29uc3QgZWwgPSB0aGlzLl9nZXRDb250YWluZXIoKTtcbiAgICBpZiAoZWwgaW5zdGFuY2VvZiBodG1sLkVsZW1lbnQgJiYgdGhpcy5nZXRUYWdEZWZpbml0aW9uKGVsLm5hbWUpLmlzVm9pZCkge1xuICAgICAgdGhpcy5fY29udGFpbmVyU3RhY2sucG9wKCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfY29uc3VtZVN0YXJ0VGFnKHN0YXJ0VGFnVG9rZW46IFRhZ09wZW5TdGFydFRva2VuIHwgSW5jb21wbGV0ZVRhZ09wZW5Ub2tlbikge1xuICAgIGNvbnN0IFtwcmVmaXgsIG5hbWVdID0gc3RhcnRUYWdUb2tlbi5wYXJ0cztcbiAgICBjb25zdCBhdHRyczogaHRtbC5BdHRyaWJ1dGVbXSA9IFtdO1xuICAgIHdoaWxlICh0aGlzLl9wZWVrLnR5cGUgPT09IFRva2VuVHlwZS5BVFRSX05BTUUpIHtcbiAgICAgIGF0dHJzLnB1c2godGhpcy5fY29uc3VtZUF0dHIodGhpcy5fYWR2YW5jZTxBdHRyaWJ1dGVOYW1lVG9rZW4+KCkpKTtcbiAgICB9XG4gICAgY29uc3QgZnVsbE5hbWUgPSB0aGlzLl9nZXRFbGVtZW50RnVsbE5hbWUocHJlZml4LCBuYW1lLCB0aGlzLl9nZXRDbG9zZXN0UGFyZW50RWxlbWVudCgpKTtcbiAgICBsZXQgc2VsZkNsb3NpbmcgPSBmYWxzZTtcbiAgICAvLyBOb3RlOiBUaGVyZSBjb3VsZCBoYXZlIGJlZW4gYSB0b2tlbml6ZXIgZXJyb3JcbiAgICAvLyBzbyB0aGF0IHdlIGRvbid0IGdldCBhIHRva2VuIGZvciB0aGUgZW5kIHRhZy4uLlxuICAgIGlmICh0aGlzLl9wZWVrLnR5cGUgPT09IFRva2VuVHlwZS5UQUdfT1BFTl9FTkRfVk9JRCkge1xuICAgICAgdGhpcy5fYWR2YW5jZSgpO1xuICAgICAgc2VsZkNsb3NpbmcgPSB0cnVlO1xuICAgICAgY29uc3QgdGFnRGVmID0gdGhpcy5nZXRUYWdEZWZpbml0aW9uKGZ1bGxOYW1lKTtcbiAgICAgIGlmICghKHRhZ0RlZi5jYW5TZWxmQ2xvc2UgfHwgZ2V0TnNQcmVmaXgoZnVsbE5hbWUpICE9PSBudWxsIHx8IHRhZ0RlZi5pc1ZvaWQpKSB7XG4gICAgICAgIHRoaXMuZXJyb3JzLnB1c2goXG4gICAgICAgICAgVHJlZUVycm9yLmNyZWF0ZShcbiAgICAgICAgICAgIGZ1bGxOYW1lLFxuICAgICAgICAgICAgc3RhcnRUYWdUb2tlbi5zb3VyY2VTcGFuLFxuICAgICAgICAgICAgYE9ubHkgdm9pZCwgY3VzdG9tIGFuZCBmb3JlaWduIGVsZW1lbnRzIGNhbiBiZSBzZWxmIGNsb3NlZCBcIiR7c3RhcnRUYWdUb2tlbi5wYXJ0c1sxXX1cImAsXG4gICAgICAgICAgKSxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHRoaXMuX3BlZWsudHlwZSA9PT0gVG9rZW5UeXBlLlRBR19PUEVOX0VORCkge1xuICAgICAgdGhpcy5fYWR2YW5jZSgpO1xuICAgICAgc2VsZkNsb3NpbmcgPSBmYWxzZTtcbiAgICB9XG4gICAgY29uc3QgZW5kID0gdGhpcy5fcGVlay5zb3VyY2VTcGFuLmZ1bGxTdGFydDtcbiAgICBjb25zdCBzcGFuID0gbmV3IFBhcnNlU291cmNlU3BhbihcbiAgICAgIHN0YXJ0VGFnVG9rZW4uc291cmNlU3Bhbi5zdGFydCxcbiAgICAgIGVuZCxcbiAgICAgIHN0YXJ0VGFnVG9rZW4uc291cmNlU3Bhbi5mdWxsU3RhcnQsXG4gICAgKTtcbiAgICAvLyBDcmVhdGUgYSBzZXBhcmF0ZSBgc3RhcnRTcGFuYCBiZWNhdXNlIGBzcGFuYCB3aWxsIGJlIG1vZGlmaWVkIHdoZW4gdGhlcmUgaXMgYW4gYGVuZGAgc3Bhbi5cbiAgICBjb25zdCBzdGFydFNwYW4gPSBuZXcgUGFyc2VTb3VyY2VTcGFuKFxuICAgICAgc3RhcnRUYWdUb2tlbi5zb3VyY2VTcGFuLnN0YXJ0LFxuICAgICAgZW5kLFxuICAgICAgc3RhcnRUYWdUb2tlbi5zb3VyY2VTcGFuLmZ1bGxTdGFydCxcbiAgICApO1xuICAgIGNvbnN0IGVsID0gbmV3IGh0bWwuRWxlbWVudChmdWxsTmFtZSwgYXR0cnMsIFtdLCBzcGFuLCBzdGFydFNwYW4sIHVuZGVmaW5lZCk7XG4gICAgY29uc3QgcGFyZW50RWwgPSB0aGlzLl9nZXRDb250YWluZXIoKTtcbiAgICB0aGlzLl9wdXNoQ29udGFpbmVyKFxuICAgICAgZWwsXG4gICAgICBwYXJlbnRFbCBpbnN0YW5jZW9mIGh0bWwuRWxlbWVudCAmJlxuICAgICAgICB0aGlzLmdldFRhZ0RlZmluaXRpb24ocGFyZW50RWwubmFtZSkuaXNDbG9zZWRCeUNoaWxkKGVsLm5hbWUpLFxuICAgICk7XG4gICAgaWYgKHNlbGZDbG9zaW5nKSB7XG4gICAgICAvLyBFbGVtZW50cyB0aGF0IGFyZSBzZWxmLWNsb3NlZCBoYXZlIHRoZWlyIGBlbmRTb3VyY2VTcGFuYCBzZXQgdG8gdGhlIGZ1bGwgc3BhbiwgYXMgdGhlXG4gICAgICAvLyBlbGVtZW50IHN0YXJ0IHRhZyBhbHNvIHJlcHJlc2VudHMgdGhlIGVuZCB0YWcuXG4gICAgICB0aGlzLl9wb3BDb250YWluZXIoZnVsbE5hbWUsIGh0bWwuRWxlbWVudCwgc3Bhbik7XG4gICAgfSBlbHNlIGlmIChzdGFydFRhZ1Rva2VuLnR5cGUgPT09IFRva2VuVHlwZS5JTkNPTVBMRVRFX1RBR19PUEVOKSB7XG4gICAgICAvLyBXZSBhbHJlYWR5IGtub3cgdGhlIG9wZW5pbmcgdGFnIGlzIG5vdCBjb21wbGV0ZSwgc28gaXQgaXMgdW5saWtlbHkgaXQgaGFzIGEgY29ycmVzcG9uZGluZ1xuICAgICAgLy8gY2xvc2UgdGFnLiBMZXQncyBvcHRpbWlzdGljYWxseSBwYXJzZSBpdCBhcyBhIGZ1bGwgZWxlbWVudCBhbmQgZW1pdCBhbiBlcnJvci5cbiAgICAgIHRoaXMuX3BvcENvbnRhaW5lcihmdWxsTmFtZSwgaHRtbC5FbGVtZW50LCBudWxsKTtcbiAgICAgIHRoaXMuZXJyb3JzLnB1c2goXG4gICAgICAgIFRyZWVFcnJvci5jcmVhdGUoZnVsbE5hbWUsIHNwYW4sIGBPcGVuaW5nIHRhZyBcIiR7ZnVsbE5hbWV9XCIgbm90IHRlcm1pbmF0ZWQuYCksXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3B1c2hDb250YWluZXIobm9kZTogTm9kZUNvbnRhaW5lciwgaXNDbG9zZWRCeUNoaWxkOiBib29sZWFuKSB7XG4gICAgaWYgKGlzQ2xvc2VkQnlDaGlsZCkge1xuICAgICAgdGhpcy5fY29udGFpbmVyU3RhY2sucG9wKCk7XG4gICAgfVxuXG4gICAgdGhpcy5fYWRkVG9QYXJlbnQobm9kZSk7XG4gICAgdGhpcy5fY29udGFpbmVyU3RhY2sucHVzaChub2RlKTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbnN1bWVFbmRUYWcoZW5kVGFnVG9rZW46IFRhZ0Nsb3NlVG9rZW4pIHtcbiAgICBjb25zdCBmdWxsTmFtZSA9IHRoaXMuX2dldEVsZW1lbnRGdWxsTmFtZShcbiAgICAgIGVuZFRhZ1Rva2VuLnBhcnRzWzBdLFxuICAgICAgZW5kVGFnVG9rZW4ucGFydHNbMV0sXG4gICAgICB0aGlzLl9nZXRDbG9zZXN0UGFyZW50RWxlbWVudCgpLFxuICAgICk7XG5cbiAgICBpZiAodGhpcy5nZXRUYWdEZWZpbml0aW9uKGZ1bGxOYW1lKS5pc1ZvaWQpIHtcbiAgICAgIHRoaXMuZXJyb3JzLnB1c2goXG4gICAgICAgIFRyZWVFcnJvci5jcmVhdGUoXG4gICAgICAgICAgZnVsbE5hbWUsXG4gICAgICAgICAgZW5kVGFnVG9rZW4uc291cmNlU3BhbixcbiAgICAgICAgICBgVm9pZCBlbGVtZW50cyBkbyBub3QgaGF2ZSBlbmQgdGFncyBcIiR7ZW5kVGFnVG9rZW4ucGFydHNbMV19XCJgLFxuICAgICAgICApLFxuICAgICAgKTtcbiAgICB9IGVsc2UgaWYgKCF0aGlzLl9wb3BDb250YWluZXIoZnVsbE5hbWUsIGh0bWwuRWxlbWVudCwgZW5kVGFnVG9rZW4uc291cmNlU3BhbikpIHtcbiAgICAgIGNvbnN0IGVyck1zZyA9IGBVbmV4cGVjdGVkIGNsb3NpbmcgdGFnIFwiJHtmdWxsTmFtZX1cIi4gSXQgbWF5IGhhcHBlbiB3aGVuIHRoZSB0YWcgaGFzIGFscmVhZHkgYmVlbiBjbG9zZWQgYnkgYW5vdGhlciB0YWcuIEZvciBtb3JlIGluZm8gc2VlIGh0dHBzOi8vd3d3LnczLm9yZy9UUi9odG1sNS9zeW50YXguaHRtbCNjbG9zaW5nLWVsZW1lbnRzLXRoYXQtaGF2ZS1pbXBsaWVkLWVuZC10YWdzYDtcbiAgICAgIHRoaXMuZXJyb3JzLnB1c2goVHJlZUVycm9yLmNyZWF0ZShmdWxsTmFtZSwgZW5kVGFnVG9rZW4uc291cmNlU3BhbiwgZXJyTXNnKSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENsb3NlcyB0aGUgbmVhcmVzdCBlbGVtZW50IHdpdGggdGhlIHRhZyBuYW1lIGBmdWxsTmFtZWAgaW4gdGhlIHBhcnNlIHRyZWUuXG4gICAqIGBlbmRTb3VyY2VTcGFuYCBpcyB0aGUgc3BhbiBvZiB0aGUgY2xvc2luZyB0YWcsIG9yIG51bGwgaWYgdGhlIGVsZW1lbnQgZG9lc1xuICAgKiBub3QgaGF2ZSBhIGNsb3NpbmcgdGFnIChmb3IgZXhhbXBsZSwgdGhpcyBoYXBwZW5zIHdoZW4gYW4gaW5jb21wbGV0ZVxuICAgKiBvcGVuaW5nIHRhZyBpcyByZWNvdmVyZWQpLlxuICAgKi9cbiAgcHJpdmF0ZSBfcG9wQ29udGFpbmVyKFxuICAgIGV4cGVjdGVkTmFtZTogc3RyaW5nIHwgbnVsbCxcbiAgICBleHBlY3RlZFR5cGU6IE5vZGVDb250YWluZXJDb25zdHJ1Y3RvcixcbiAgICBlbmRTb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4gfCBudWxsLFxuICApOiBib29sZWFuIHtcbiAgICBsZXQgdW5leHBlY3RlZENsb3NlVGFnRGV0ZWN0ZWQgPSBmYWxzZTtcbiAgICBmb3IgKGxldCBzdGFja0luZGV4ID0gdGhpcy5fY29udGFpbmVyU3RhY2subGVuZ3RoIC0gMTsgc3RhY2tJbmRleCA+PSAwOyBzdGFja0luZGV4LS0pIHtcbiAgICAgIGNvbnN0IG5vZGUgPSB0aGlzLl9jb250YWluZXJTdGFja1tzdGFja0luZGV4XTtcblxuICAgICAgaWYgKChub2RlLm5hbWUgPT09IGV4cGVjdGVkTmFtZSB8fCBleHBlY3RlZE5hbWUgPT09IG51bGwpICYmIG5vZGUgaW5zdGFuY2VvZiBleHBlY3RlZFR5cGUpIHtcbiAgICAgICAgLy8gUmVjb3JkIHRoZSBwYXJzZSBzcGFuIHdpdGggdGhlIGVsZW1lbnQgdGhhdCBpcyBiZWluZyBjbG9zZWQuIEFueSBlbGVtZW50cyB0aGF0IGFyZVxuICAgICAgICAvLyByZW1vdmVkIGZyb20gdGhlIGVsZW1lbnQgc3RhY2sgYXQgdGhpcyBwb2ludCBhcmUgY2xvc2VkIGltcGxpY2l0bHksIHNvIHRoZXkgd29uJ3QgZ2V0XG4gICAgICAgIC8vIGFuIGVuZCBzb3VyY2Ugc3BhbiAoYXMgdGhlcmUgaXMgbm8gZXhwbGljaXQgY2xvc2luZyBlbGVtZW50KS5cbiAgICAgICAgbm9kZS5lbmRTb3VyY2VTcGFuID0gZW5kU291cmNlU3BhbjtcbiAgICAgICAgbm9kZS5zb3VyY2VTcGFuLmVuZCA9IGVuZFNvdXJjZVNwYW4gIT09IG51bGwgPyBlbmRTb3VyY2VTcGFuLmVuZCA6IG5vZGUuc291cmNlU3Bhbi5lbmQ7XG4gICAgICAgIHRoaXMuX2NvbnRhaW5lclN0YWNrLnNwbGljZShzdGFja0luZGV4LCB0aGlzLl9jb250YWluZXJTdGFjay5sZW5ndGggLSBzdGFja0luZGV4KTtcbiAgICAgICAgcmV0dXJuICF1bmV4cGVjdGVkQ2xvc2VUYWdEZXRlY3RlZDtcbiAgICAgIH1cblxuICAgICAgLy8gQmxvY2tzIGFuZCBtb3N0IGVsZW1lbnRzIGFyZSBub3Qgc2VsZiBjbG9zaW5nLlxuICAgICAgaWYgKFxuICAgICAgICBub2RlIGluc3RhbmNlb2YgaHRtbC5CbG9jayB8fFxuICAgICAgICAobm9kZSBpbnN0YW5jZW9mIGh0bWwuRWxlbWVudCAmJiAhdGhpcy5nZXRUYWdEZWZpbml0aW9uKG5vZGUubmFtZSkuY2xvc2VkQnlQYXJlbnQpXG4gICAgICApIHtcbiAgICAgICAgLy8gTm90ZSB0aGF0IHdlIGVuY291bnRlcmVkIGFuIHVuZXhwZWN0ZWQgY2xvc2UgdGFnIGJ1dCBjb250aW51ZSBwcm9jZXNzaW5nIHRoZSBlbGVtZW50XG4gICAgICAgIC8vIHN0YWNrIHNvIHdlIGNhbiBhc3NpZ24gYW4gYGVuZFNvdXJjZVNwYW5gIGlmIHRoZXJlIGlzIGEgY29ycmVzcG9uZGluZyBzdGFydCB0YWcgZm9yIHRoaXNcbiAgICAgICAgLy8gZW5kIHRhZyBpbiB0aGUgc3RhY2suXG4gICAgICAgIHVuZXhwZWN0ZWRDbG9zZVRhZ0RldGVjdGVkID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29uc3VtZUF0dHIoYXR0ck5hbWU6IEF0dHJpYnV0ZU5hbWVUb2tlbik6IGh0bWwuQXR0cmlidXRlIHtcbiAgICBjb25zdCBmdWxsTmFtZSA9IG1lcmdlTnNBbmROYW1lKGF0dHJOYW1lLnBhcnRzWzBdLCBhdHRyTmFtZS5wYXJ0c1sxXSk7XG4gICAgbGV0IGF0dHJFbmQgPSBhdHRyTmFtZS5zb3VyY2VTcGFuLmVuZDtcblxuICAgIC8vIENvbnN1bWUgYW55IHF1b3RlXG4gICAgaWYgKHRoaXMuX3BlZWsudHlwZSA9PT0gVG9rZW5UeXBlLkFUVFJfUVVPVEUpIHtcbiAgICAgIHRoaXMuX2FkdmFuY2UoKTtcbiAgICB9XG5cbiAgICAvLyBDb25zdW1lIHRoZSBhdHRyaWJ1dGUgdmFsdWVcbiAgICBsZXQgdmFsdWUgPSAnJztcbiAgICBjb25zdCB2YWx1ZVRva2VuczogSW50ZXJwb2xhdGVkQXR0cmlidXRlVG9rZW5bXSA9IFtdO1xuICAgIGxldCB2YWx1ZVN0YXJ0U3BhbjogUGFyc2VTb3VyY2VTcGFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIGxldCB2YWx1ZUVuZDogUGFyc2VMb2NhdGlvbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvLyBOT1RFOiBXZSBuZWVkIHRvIHVzZSBhIG5ldyB2YXJpYWJsZSBgbmV4dFRva2VuVHlwZWAgaGVyZSB0byBoaWRlIHRoZSBhY3R1YWwgdHlwZSBvZlxuICAgIC8vIGBfcGVlay50eXBlYCBmcm9tIFRTLiBPdGhlcndpc2UgVFMgd2lsbCBuYXJyb3cgdGhlIHR5cGUgb2YgYF9wZWVrLnR5cGVgIHByZXZlbnRpbmcgaXQgZnJvbVxuICAgIC8vIGJlaW5nIGFibGUgdG8gY29uc2lkZXIgYEFUVFJfVkFMVUVfSU5URVJQT0xBVElPTmAgYXMgYW4gb3B0aW9uLiBUaGlzIGlzIGJlY2F1c2UgVFMgaXMgbm90XG4gICAgLy8gYWJsZSB0byBzZWUgdGhhdCBgX2FkdmFuY2UoKWAgd2lsbCBhY3R1YWxseSBtdXRhdGUgYF9wZWVrYC5cbiAgICBjb25zdCBuZXh0VG9rZW5UeXBlID0gdGhpcy5fcGVlay50eXBlIGFzIFRva2VuVHlwZTtcbiAgICBpZiAobmV4dFRva2VuVHlwZSA9PT0gVG9rZW5UeXBlLkFUVFJfVkFMVUVfVEVYVCkge1xuICAgICAgdmFsdWVTdGFydFNwYW4gPSB0aGlzLl9wZWVrLnNvdXJjZVNwYW47XG4gICAgICB2YWx1ZUVuZCA9IHRoaXMuX3BlZWsuc291cmNlU3Bhbi5lbmQ7XG4gICAgICB3aGlsZSAoXG4gICAgICAgIHRoaXMuX3BlZWsudHlwZSA9PT0gVG9rZW5UeXBlLkFUVFJfVkFMVUVfVEVYVCB8fFxuICAgICAgICB0aGlzLl9wZWVrLnR5cGUgPT09IFRva2VuVHlwZS5BVFRSX1ZBTFVFX0lOVEVSUE9MQVRJT04gfHxcbiAgICAgICAgdGhpcy5fcGVlay50eXBlID09PSBUb2tlblR5cGUuRU5DT0RFRF9FTlRJVFlcbiAgICAgICkge1xuICAgICAgICBjb25zdCB2YWx1ZVRva2VuID0gdGhpcy5fYWR2YW5jZTxJbnRlcnBvbGF0ZWRBdHRyaWJ1dGVUb2tlbj4oKTtcbiAgICAgICAgdmFsdWVUb2tlbnMucHVzaCh2YWx1ZVRva2VuKTtcbiAgICAgICAgaWYgKHZhbHVlVG9rZW4udHlwZSA9PT0gVG9rZW5UeXBlLkFUVFJfVkFMVUVfSU5URVJQT0xBVElPTikge1xuICAgICAgICAgIC8vIEZvciBiYWNrd2FyZCBjb21wYXRpYmlsaXR5IHdlIGRlY29kZSBIVE1MIGVudGl0aWVzIHRoYXQgYXBwZWFyIGluIGludGVycG9sYXRpb25cbiAgICAgICAgICAvLyBleHByZXNzaW9ucy4gVGhpcyBpcyBhcmd1YWJseSBhIGJ1ZywgYnV0IGl0IGNvdWxkIGJlIGEgY29uc2lkZXJhYmxlIGJyZWFraW5nIGNoYW5nZSB0b1xuICAgICAgICAgIC8vIGZpeCBpdC4gSXQgc2hvdWxkIGJlIGFkZHJlc3NlZCBpbiBhIGxhcmdlciBwcm9qZWN0IHRvIHJlZmFjdG9yIHRoZSBlbnRpcmUgcGFyc2VyL2xleGVyXG4gICAgICAgICAgLy8gY2hhaW4gYWZ0ZXIgVmlldyBFbmdpbmUgaGFzIGJlZW4gcmVtb3ZlZC5cbiAgICAgICAgICB2YWx1ZSArPSB2YWx1ZVRva2VuLnBhcnRzLmpvaW4oJycpLnJlcGxhY2UoLyYoW147XSspOy9nLCBkZWNvZGVFbnRpdHkpO1xuICAgICAgICB9IGVsc2UgaWYgKHZhbHVlVG9rZW4udHlwZSA9PT0gVG9rZW5UeXBlLkVOQ09ERURfRU5USVRZKSB7XG4gICAgICAgICAgdmFsdWUgKz0gdmFsdWVUb2tlbi5wYXJ0c1swXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YWx1ZSArPSB2YWx1ZVRva2VuLnBhcnRzLmpvaW4oJycpO1xuICAgICAgICB9XG4gICAgICAgIHZhbHVlRW5kID0gYXR0ckVuZCA9IHZhbHVlVG9rZW4uc291cmNlU3Bhbi5lbmQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQ29uc3VtZSBhbnkgcXVvdGVcbiAgICBpZiAodGhpcy5fcGVlay50eXBlID09PSBUb2tlblR5cGUuQVRUUl9RVU9URSkge1xuICAgICAgY29uc3QgcXVvdGVUb2tlbiA9IHRoaXMuX2FkdmFuY2U8QXR0cmlidXRlUXVvdGVUb2tlbj4oKTtcbiAgICAgIGF0dHJFbmQgPSBxdW90ZVRva2VuLnNvdXJjZVNwYW4uZW5kO1xuICAgIH1cblxuICAgIGNvbnN0IHZhbHVlU3BhbiA9XG4gICAgICB2YWx1ZVN0YXJ0U3BhbiAmJlxuICAgICAgdmFsdWVFbmQgJiZcbiAgICAgIG5ldyBQYXJzZVNvdXJjZVNwYW4odmFsdWVTdGFydFNwYW4uc3RhcnQsIHZhbHVlRW5kLCB2YWx1ZVN0YXJ0U3Bhbi5mdWxsU3RhcnQpO1xuICAgIHJldHVybiBuZXcgaHRtbC5BdHRyaWJ1dGUoXG4gICAgICBmdWxsTmFtZSxcbiAgICAgIHZhbHVlLFxuICAgICAgbmV3IFBhcnNlU291cmNlU3BhbihhdHRyTmFtZS5zb3VyY2VTcGFuLnN0YXJ0LCBhdHRyRW5kLCBhdHRyTmFtZS5zb3VyY2VTcGFuLmZ1bGxTdGFydCksXG4gICAgICBhdHRyTmFtZS5zb3VyY2VTcGFuLFxuICAgICAgdmFsdWVTcGFuLFxuICAgICAgdmFsdWVUb2tlbnMubGVuZ3RoID4gMCA/IHZhbHVlVG9rZW5zIDogdW5kZWZpbmVkLFxuICAgICAgdW5kZWZpbmVkLFxuICAgICk7XG4gIH1cblxuICBwcml2YXRlIF9jb25zdW1lQmxvY2tPcGVuKHRva2VuOiBCbG9ja09wZW5TdGFydFRva2VuKSB7XG4gICAgY29uc3QgcGFyYW1ldGVyczogaHRtbC5CbG9ja1BhcmFtZXRlcltdID0gW107XG5cbiAgICB3aGlsZSAodGhpcy5fcGVlay50eXBlID09PSBUb2tlblR5cGUuQkxPQ0tfUEFSQU1FVEVSKSB7XG4gICAgICBjb25zdCBwYXJhbVRva2VuID0gdGhpcy5fYWR2YW5jZTxCbG9ja1BhcmFtZXRlclRva2VuPigpO1xuICAgICAgcGFyYW1ldGVycy5wdXNoKG5ldyBodG1sLkJsb2NrUGFyYW1ldGVyKHBhcmFtVG9rZW4ucGFydHNbMF0sIHBhcmFtVG9rZW4uc291cmNlU3BhbikpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9wZWVrLnR5cGUgPT09IFRva2VuVHlwZS5CTE9DS19PUEVOX0VORCkge1xuICAgICAgdGhpcy5fYWR2YW5jZSgpO1xuICAgIH1cblxuICAgIGNvbnN0IGVuZCA9IHRoaXMuX3BlZWsuc291cmNlU3Bhbi5mdWxsU3RhcnQ7XG4gICAgY29uc3Qgc3BhbiA9IG5ldyBQYXJzZVNvdXJjZVNwYW4odG9rZW4uc291cmNlU3Bhbi5zdGFydCwgZW5kLCB0b2tlbi5zb3VyY2VTcGFuLmZ1bGxTdGFydCk7XG4gICAgLy8gQ3JlYXRlIGEgc2VwYXJhdGUgYHN0YXJ0U3BhbmAgYmVjYXVzZSBgc3BhbmAgd2lsbCBiZSBtb2RpZmllZCB3aGVuIHRoZXJlIGlzIGFuIGBlbmRgIHNwYW4uXG4gICAgY29uc3Qgc3RhcnRTcGFuID0gbmV3IFBhcnNlU291cmNlU3Bhbih0b2tlbi5zb3VyY2VTcGFuLnN0YXJ0LCBlbmQsIHRva2VuLnNvdXJjZVNwYW4uZnVsbFN0YXJ0KTtcbiAgICBjb25zdCBibG9jayA9IG5ldyBodG1sLkJsb2NrKHRva2VuLnBhcnRzWzBdLCBwYXJhbWV0ZXJzLCBbXSwgc3BhbiwgdG9rZW4uc291cmNlU3Bhbiwgc3RhcnRTcGFuKTtcbiAgICB0aGlzLl9wdXNoQ29udGFpbmVyKGJsb2NrLCBmYWxzZSk7XG4gIH1cblxuICBwcml2YXRlIF9jb25zdW1lQmxvY2tDbG9zZSh0b2tlbjogQmxvY2tDbG9zZVRva2VuKSB7XG4gICAgaWYgKCF0aGlzLl9wb3BDb250YWluZXIobnVsbCwgaHRtbC5CbG9jaywgdG9rZW4uc291cmNlU3BhbikpIHtcbiAgICAgIHRoaXMuZXJyb3JzLnB1c2goXG4gICAgICAgIFRyZWVFcnJvci5jcmVhdGUoXG4gICAgICAgICAgbnVsbCxcbiAgICAgICAgICB0b2tlbi5zb3VyY2VTcGFuLFxuICAgICAgICAgIGBVbmV4cGVjdGVkIGNsb3NpbmcgYmxvY2suIFRoZSBibG9jayBtYXkgaGF2ZSBiZWVuIGNsb3NlZCBlYXJsaWVyLiBgICtcbiAgICAgICAgICAgIGBJZiB5b3UgbWVhbnQgdG8gd3JpdGUgdGhlIH0gY2hhcmFjdGVyLCB5b3Ugc2hvdWxkIHVzZSB0aGUgXCImIzEyNTtcIiBgICtcbiAgICAgICAgICAgIGBIVE1MIGVudGl0eSBpbnN0ZWFkLmAsXG4gICAgICAgICksXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2NvbnN1bWVJbmNvbXBsZXRlQmxvY2sodG9rZW46IEluY29tcGxldGVCbG9ja09wZW5Ub2tlbikge1xuICAgIGNvbnN0IHBhcmFtZXRlcnM6IGh0bWwuQmxvY2tQYXJhbWV0ZXJbXSA9IFtdO1xuXG4gICAgd2hpbGUgKHRoaXMuX3BlZWsudHlwZSA9PT0gVG9rZW5UeXBlLkJMT0NLX1BBUkFNRVRFUikge1xuICAgICAgY29uc3QgcGFyYW1Ub2tlbiA9IHRoaXMuX2FkdmFuY2U8QmxvY2tQYXJhbWV0ZXJUb2tlbj4oKTtcbiAgICAgIHBhcmFtZXRlcnMucHVzaChuZXcgaHRtbC5CbG9ja1BhcmFtZXRlcihwYXJhbVRva2VuLnBhcnRzWzBdLCBwYXJhbVRva2VuLnNvdXJjZVNwYW4pKTtcbiAgICB9XG5cbiAgICBjb25zdCBlbmQgPSB0aGlzLl9wZWVrLnNvdXJjZVNwYW4uZnVsbFN0YXJ0O1xuICAgIGNvbnN0IHNwYW4gPSBuZXcgUGFyc2VTb3VyY2VTcGFuKHRva2VuLnNvdXJjZVNwYW4uc3RhcnQsIGVuZCwgdG9rZW4uc291cmNlU3Bhbi5mdWxsU3RhcnQpO1xuICAgIC8vIENyZWF0ZSBhIHNlcGFyYXRlIGBzdGFydFNwYW5gIGJlY2F1c2UgYHNwYW5gIHdpbGwgYmUgbW9kaWZpZWQgd2hlbiB0aGVyZSBpcyBhbiBgZW5kYCBzcGFuLlxuICAgIGNvbnN0IHN0YXJ0U3BhbiA9IG5ldyBQYXJzZVNvdXJjZVNwYW4odG9rZW4uc291cmNlU3Bhbi5zdGFydCwgZW5kLCB0b2tlbi5zb3VyY2VTcGFuLmZ1bGxTdGFydCk7XG4gICAgY29uc3QgYmxvY2sgPSBuZXcgaHRtbC5CbG9jayh0b2tlbi5wYXJ0c1swXSwgcGFyYW1ldGVycywgW10sIHNwYW4sIHRva2VuLnNvdXJjZVNwYW4sIHN0YXJ0U3Bhbik7XG4gICAgdGhpcy5fcHVzaENvbnRhaW5lcihibG9jaywgZmFsc2UpO1xuXG4gICAgLy8gSW5jb21wbGV0ZSBibG9ja3MgZG9uJ3QgaGF2ZSBjaGlsZHJlbiBzbyB3ZSBjbG9zZSB0aGVtIGltbWVkaWF0ZWx5IGFuZCByZXBvcnQgYW4gZXJyb3IuXG4gICAgdGhpcy5fcG9wQ29udGFpbmVyKG51bGwsIGh0bWwuQmxvY2ssIG51bGwpO1xuXG4gICAgdGhpcy5lcnJvcnMucHVzaChcbiAgICAgIFRyZWVFcnJvci5jcmVhdGUoXG4gICAgICAgIHRva2VuLnBhcnRzWzBdLFxuICAgICAgICBzcGFuLFxuICAgICAgICBgSW5jb21wbGV0ZSBibG9jayBcIiR7dG9rZW4ucGFydHNbMF19XCIuIElmIHlvdSBtZWFudCB0byB3cml0ZSB0aGUgQCBjaGFyYWN0ZXIsIGAgK1xuICAgICAgICAgIGB5b3Ugc2hvdWxkIHVzZSB0aGUgXCImIzY0O1wiIEhUTUwgZW50aXR5IGluc3RlYWQuYCxcbiAgICAgICksXG4gICAgKTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbnN1bWVMZXQoc3RhcnRUb2tlbjogTGV0U3RhcnRUb2tlbikge1xuICAgIGNvbnN0IG5hbWUgPSBzdGFydFRva2VuLnBhcnRzWzBdO1xuICAgIGxldCB2YWx1ZVRva2VuOiBMZXRWYWx1ZVRva2VuO1xuICAgIGxldCBlbmRUb2tlbjogTGV0RW5kVG9rZW47XG5cbiAgICBpZiAodGhpcy5fcGVlay50eXBlICE9PSBUb2tlblR5cGUuTEVUX1ZBTFVFKSB7XG4gICAgICB0aGlzLmVycm9ycy5wdXNoKFxuICAgICAgICBUcmVlRXJyb3IuY3JlYXRlKFxuICAgICAgICAgIHN0YXJ0VG9rZW4ucGFydHNbMF0sXG4gICAgICAgICAgc3RhcnRUb2tlbi5zb3VyY2VTcGFuLFxuICAgICAgICAgIGBJbnZhbGlkIEBsZXQgZGVjbGFyYXRpb24gXCIke25hbWV9XCIuIERlY2xhcmF0aW9uIG11c3QgaGF2ZSBhIHZhbHVlLmAsXG4gICAgICAgICksXG4gICAgICApO1xuICAgICAgcmV0dXJuO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YWx1ZVRva2VuID0gdGhpcy5fYWR2YW5jZSgpO1xuICAgIH1cblxuICAgIC8vIFR5cGUgY2FzdCBpcyBuZWNlc3NhcnkgaGVyZSBzaW5jZSBUUyBuYXJyb3dlZCB0aGUgdHlwZSBvZiBgcGVla2AgYWJvdmUuXG4gICAgaWYgKCh0aGlzLl9wZWVrIGFzIFRva2VuKS50eXBlICE9PSBUb2tlblR5cGUuTEVUX0VORCkge1xuICAgICAgdGhpcy5lcnJvcnMucHVzaChcbiAgICAgICAgVHJlZUVycm9yLmNyZWF0ZShcbiAgICAgICAgICBzdGFydFRva2VuLnBhcnRzWzBdLFxuICAgICAgICAgIHN0YXJ0VG9rZW4uc291cmNlU3BhbixcbiAgICAgICAgICBgVW50ZXJtaW5hdGVkIEBsZXQgZGVjbGFyYXRpb24gXCIke25hbWV9XCIuIERlY2xhcmF0aW9uIG11c3QgYmUgdGVybWluYXRlZCB3aXRoIGEgc2VtaWNvbG9uLmAsXG4gICAgICAgICksXG4gICAgICApO1xuICAgICAgcmV0dXJuO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbmRUb2tlbiA9IHRoaXMuX2FkdmFuY2UoKTtcbiAgICB9XG5cbiAgICBjb25zdCBlbmQgPSBlbmRUb2tlbi5zb3VyY2VTcGFuLmZ1bGxTdGFydDtcbiAgICBjb25zdCBzcGFuID0gbmV3IFBhcnNlU291cmNlU3BhbihcbiAgICAgIHN0YXJ0VG9rZW4uc291cmNlU3Bhbi5zdGFydCxcbiAgICAgIGVuZCxcbiAgICAgIHN0YXJ0VG9rZW4uc291cmNlU3Bhbi5mdWxsU3RhcnQsXG4gICAgKTtcblxuICAgIC8vIFRoZSBzdGFydCB0b2tlbiB1c3VhbGx5IGNhcHR1cmVzIHRoZSBgQGxldGAuIENvbnN0cnVjdCBhIG5hbWUgc3BhbiBieVxuICAgIC8vIG9mZnNldHRpbmcgdGhlIHN0YXJ0IGJ5IHRoZSBsZW5ndGggb2YgYW55IHRleHQgYmVmb3JlIHRoZSBuYW1lLlxuICAgIGNvbnN0IHN0YXJ0T2Zmc2V0ID0gc3RhcnRUb2tlbi5zb3VyY2VTcGFuLnRvU3RyaW5nKCkubGFzdEluZGV4T2YobmFtZSk7XG4gICAgY29uc3QgbmFtZVN0YXJ0ID0gc3RhcnRUb2tlbi5zb3VyY2VTcGFuLnN0YXJ0Lm1vdmVCeShzdGFydE9mZnNldCk7XG4gICAgY29uc3QgbmFtZVNwYW4gPSBuZXcgUGFyc2VTb3VyY2VTcGFuKG5hbWVTdGFydCwgc3RhcnRUb2tlbi5zb3VyY2VTcGFuLmVuZCk7XG4gICAgY29uc3Qgbm9kZSA9IG5ldyBodG1sLkxldERlY2xhcmF0aW9uKFxuICAgICAgbmFtZSxcbiAgICAgIHZhbHVlVG9rZW4ucGFydHNbMF0sXG4gICAgICBzcGFuLFxuICAgICAgbmFtZVNwYW4sXG4gICAgICB2YWx1ZVRva2VuLnNvdXJjZVNwYW4sXG4gICAgKTtcblxuICAgIHRoaXMuX2FkZFRvUGFyZW50KG5vZGUpO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29uc3VtZUluY29tcGxldGVMZXQodG9rZW46IEluY29tcGxldGVMZXRUb2tlbikge1xuICAgIC8vIEluY29tcGxldGUgYEBsZXRgIGRlY2xhcmF0aW9uIG1heSBlbmQgdXAgd2l0aCBhbiBlbXB0eSBuYW1lLlxuICAgIGNvbnN0IG5hbWUgPSB0b2tlbi5wYXJ0c1swXSA/PyAnJztcbiAgICBjb25zdCBuYW1lU3RyaW5nID0gbmFtZSA/IGAgXCIke25hbWV9XCJgIDogJyc7XG5cbiAgICAvLyBJZiB0aGVyZSdzIGF0IGxlYXN0IGEgbmFtZSwgd2UgY2FuIHNhbHZhZ2UgYW4gQVNUIG5vZGUgdGhhdCBjYW4gYmUgdXNlZCBmb3IgY29tcGxldGlvbnMuXG4gICAgaWYgKG5hbWUubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3Qgc3RhcnRPZmZzZXQgPSB0b2tlbi5zb3VyY2VTcGFuLnRvU3RyaW5nKCkubGFzdEluZGV4T2YobmFtZSk7XG4gICAgICBjb25zdCBuYW1lU3RhcnQgPSB0b2tlbi5zb3VyY2VTcGFuLnN0YXJ0Lm1vdmVCeShzdGFydE9mZnNldCk7XG4gICAgICBjb25zdCBuYW1lU3BhbiA9IG5ldyBQYXJzZVNvdXJjZVNwYW4obmFtZVN0YXJ0LCB0b2tlbi5zb3VyY2VTcGFuLmVuZCk7XG4gICAgICBjb25zdCB2YWx1ZVNwYW4gPSBuZXcgUGFyc2VTb3VyY2VTcGFuKFxuICAgICAgICB0b2tlbi5zb3VyY2VTcGFuLnN0YXJ0LFxuICAgICAgICB0b2tlbi5zb3VyY2VTcGFuLnN0YXJ0Lm1vdmVCeSgwKSxcbiAgICAgICk7XG4gICAgICBjb25zdCBub2RlID0gbmV3IGh0bWwuTGV0RGVjbGFyYXRpb24obmFtZSwgJycsIHRva2VuLnNvdXJjZVNwYW4sIG5hbWVTcGFuLCB2YWx1ZVNwYW4pO1xuICAgICAgdGhpcy5fYWRkVG9QYXJlbnQobm9kZSk7XG4gICAgfVxuXG4gICAgdGhpcy5lcnJvcnMucHVzaChcbiAgICAgIFRyZWVFcnJvci5jcmVhdGUoXG4gICAgICAgIHRva2VuLnBhcnRzWzBdLFxuICAgICAgICB0b2tlbi5zb3VyY2VTcGFuLFxuICAgICAgICBgSW5jb21wbGV0ZSBAbGV0IGRlY2xhcmF0aW9uJHtuYW1lU3RyaW5nfS4gYCArXG4gICAgICAgICAgYEBsZXQgZGVjbGFyYXRpb25zIG11c3QgYmUgd3JpdHRlbiBhcyBcXGBAbGV0IDxuYW1lPiA9IDx2YWx1ZT47XFxgYCxcbiAgICAgICksXG4gICAgKTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldENvbnRhaW5lcigpOiBOb2RlQ29udGFpbmVyIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbnRhaW5lclN0YWNrLmxlbmd0aCA+IDBcbiAgICAgID8gdGhpcy5fY29udGFpbmVyU3RhY2tbdGhpcy5fY29udGFpbmVyU3RhY2subGVuZ3RoIC0gMV1cbiAgICAgIDogbnVsbDtcbiAgfVxuXG4gIHByaXZhdGUgX2dldENsb3Nlc3RQYXJlbnRFbGVtZW50KCk6IGh0bWwuRWxlbWVudCB8IG51bGwge1xuICAgIGZvciAobGV0IGkgPSB0aGlzLl9jb250YWluZXJTdGFjay5sZW5ndGggLSAxOyBpID4gLTE7IGktLSkge1xuICAgICAgaWYgKHRoaXMuX2NvbnRhaW5lclN0YWNrW2ldIGluc3RhbmNlb2YgaHRtbC5FbGVtZW50KSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jb250YWluZXJTdGFja1tpXSBhcyBodG1sLkVsZW1lbnQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBwcml2YXRlIF9hZGRUb1BhcmVudChub2RlOiBodG1sLk5vZGUpIHtcbiAgICBjb25zdCBwYXJlbnQgPSB0aGlzLl9nZXRDb250YWluZXIoKTtcblxuICAgIGlmIChwYXJlbnQgPT09IG51bGwpIHtcbiAgICAgIHRoaXMucm9vdE5vZGVzLnB1c2gobm9kZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhcmVudC5jaGlsZHJlbi5wdXNoKG5vZGUpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2dldEVsZW1lbnRGdWxsTmFtZShcbiAgICBwcmVmaXg6IHN0cmluZyxcbiAgICBsb2NhbE5hbWU6IHN0cmluZyxcbiAgICBwYXJlbnRFbGVtZW50OiBodG1sLkVsZW1lbnQgfCBudWxsLFxuICApOiBzdHJpbmcge1xuICAgIGlmIChwcmVmaXggPT09ICcnKSB7XG4gICAgICBwcmVmaXggPSB0aGlzLmdldFRhZ0RlZmluaXRpb24obG9jYWxOYW1lKS5pbXBsaWNpdE5hbWVzcGFjZVByZWZpeCB8fCAnJztcbiAgICAgIGlmIChwcmVmaXggPT09ICcnICYmIHBhcmVudEVsZW1lbnQgIT0gbnVsbCkge1xuICAgICAgICBjb25zdCBwYXJlbnRUYWdOYW1lID0gc3BsaXROc05hbWUocGFyZW50RWxlbWVudC5uYW1lKVsxXTtcbiAgICAgICAgY29uc3QgcGFyZW50VGFnRGVmaW5pdGlvbiA9IHRoaXMuZ2V0VGFnRGVmaW5pdGlvbihwYXJlbnRUYWdOYW1lKTtcbiAgICAgICAgaWYgKCFwYXJlbnRUYWdEZWZpbml0aW9uLnByZXZlbnROYW1lc3BhY2VJbmhlcml0YW5jZSkge1xuICAgICAgICAgIHByZWZpeCA9IGdldE5zUHJlZml4KHBhcmVudEVsZW1lbnQubmFtZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbWVyZ2VOc0FuZE5hbWUocHJlZml4LCBsb2NhbE5hbWUpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGxhc3RPblN0YWNrKHN0YWNrOiBhbnlbXSwgZWxlbWVudDogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiBzdGFjay5sZW5ndGggPiAwICYmIHN0YWNrW3N0YWNrLmxlbmd0aCAtIDFdID09PSBlbGVtZW50O1xufVxuXG4vKipcbiAqIERlY29kZSB0aGUgYGVudGl0eWAgc3RyaW5nLCB3aGljaCB3ZSBiZWxpZXZlIGlzIHRoZSBjb250ZW50cyBvZiBhbiBIVE1MIGVudGl0eS5cbiAqXG4gKiBJZiB0aGUgc3RyaW5nIGlzIG5vdCBhY3R1YWxseSBhIHZhbGlkL2tub3duIGVudGl0eSB0aGVuIGp1c3QgcmV0dXJuIHRoZSBvcmlnaW5hbCBgbWF0Y2hgIHN0cmluZy5cbiAqL1xuZnVuY3Rpb24gZGVjb2RlRW50aXR5KG1hdGNoOiBzdHJpbmcsIGVudGl0eTogc3RyaW5nKTogc3RyaW5nIHtcbiAgaWYgKE5BTUVEX0VOVElUSUVTW2VudGl0eV0gIT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBOQU1FRF9FTlRJVElFU1tlbnRpdHldIHx8IG1hdGNoO1xuICB9XG4gIGlmICgvXiN4W2EtZjAtOV0rJC9pLnRlc3QoZW50aXR5KSkge1xuICAgIHJldHVybiBTdHJpbmcuZnJvbUNvZGVQb2ludChwYXJzZUludChlbnRpdHkuc2xpY2UoMiksIDE2KSk7XG4gIH1cbiAgaWYgKC9eI1xcZCskLy50ZXN0KGVudGl0eSkpIHtcbiAgICByZXR1cm4gU3RyaW5nLmZyb21Db2RlUG9pbnQocGFyc2VJbnQoZW50aXR5LnNsaWNlKDEpLCAxMCkpO1xuICB9XG4gIHJldHVybiBtYXRjaDtcbn1cbiJdfQ==