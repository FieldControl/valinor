/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL21sX3BhcnNlci9wYXJzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFVBQVUsRUFBaUIsZUFBZSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRXpFLE9BQU8sS0FBSyxJQUFJLE1BQU0sT0FBTyxDQUFDO0FBQzlCLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxZQUFZLENBQUM7QUFDMUMsT0FBTyxFQUFDLFFBQVEsRUFBa0IsTUFBTSxTQUFTLENBQUM7QUFDbEQsT0FBTyxFQUFDLFdBQVcsRUFBRSxjQUFjLEVBQUUsV0FBVyxFQUFnQixNQUFNLFFBQVEsQ0FBQztBQW9DL0UsTUFBTSxPQUFPLFNBQVUsU0FBUSxVQUFVO0lBQ3ZDLE1BQU0sQ0FBQyxNQUFNLENBQUMsV0FBMEIsRUFBRSxJQUFxQixFQUFFLEdBQVc7UUFDMUUsT0FBTyxJQUFJLFNBQVMsQ0FBQyxXQUFXLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFFRCxZQUNTLFdBQTBCLEVBQ2pDLElBQXFCLEVBQ3JCLEdBQVc7UUFFWCxLQUFLLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBSlYsZ0JBQVcsR0FBWCxXQUFXLENBQWU7SUFLbkMsQ0FBQztDQUNGO0FBRUQsTUFBTSxPQUFPLGVBQWU7SUFDMUIsWUFDUyxTQUFzQixFQUN0QixNQUFvQjtRQURwQixjQUFTLEdBQVQsU0FBUyxDQUFhO1FBQ3RCLFdBQU0sR0FBTixNQUFNLENBQWM7SUFDMUIsQ0FBQztDQUNMO0FBRUQsTUFBTSxPQUFPLE1BQU07SUFDakIsWUFBbUIsZ0JBQW9EO1FBQXBELHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBb0M7SUFBRyxDQUFDO0lBRTNFLEtBQUssQ0FBQyxNQUFjLEVBQUUsR0FB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QyxPQUFPLGNBQWMsQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUM7SUFDekMsQ0FBQztJQUNELElBQUksZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7UUFDbEMsT0FBTyxNQUFNLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDN0QsQ0FBQztJQUNELElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1FBQzFCLE9BQU8sTUFBTSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzdELENBQUM7SUFDRCxPQUFPLEtBQUssQ0FBQztBQUNmLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCB7UGFyc2VFcnJvciwgUGFyc2VMb2NhdGlvbiwgUGFyc2VTb3VyY2VTcGFufSBmcm9tICcuLi9wYXJzZV91dGlsJztcblxuaW1wb3J0ICogYXMgaHRtbCBmcm9tICcuL2FzdCc7XG5pbXBvcnQge05BTUVEX0VOVElUSUVTfSBmcm9tICcuL2VudGl0aWVzJztcbmltcG9ydCB7dG9rZW5pemUsIFRva2VuaXplT3B0aW9uc30gZnJvbSAnLi9sZXhlcic7XG5pbXBvcnQge2dldE5zUHJlZml4LCBtZXJnZU5zQW5kTmFtZSwgc3BsaXROc05hbWUsIFRhZ0RlZmluaXRpb259IGZyb20gJy4vdGFncyc7XG5pbXBvcnQge1xuICBBdHRyaWJ1dGVOYW1lVG9rZW4sXG4gIEF0dHJpYnV0ZVF1b3RlVG9rZW4sXG4gIEJsb2NrQ2xvc2VUb2tlbixcbiAgQmxvY2tPcGVuU3RhcnRUb2tlbixcbiAgQmxvY2tQYXJhbWV0ZXJUb2tlbixcbiAgQ2RhdGFTdGFydFRva2VuLFxuICBDb21tZW50U3RhcnRUb2tlbixcbiAgRXhwYW5zaW9uQ2FzZUV4cHJlc3Npb25FbmRUb2tlbixcbiAgRXhwYW5zaW9uQ2FzZUV4cHJlc3Npb25TdGFydFRva2VuLFxuICBFeHBhbnNpb25DYXNlVmFsdWVUb2tlbixcbiAgRXhwYW5zaW9uRm9ybVN0YXJ0VG9rZW4sXG4gIEluY29tcGxldGVCbG9ja09wZW5Ub2tlbixcbiAgSW5jb21wbGV0ZUxldFRva2VuLFxuICBJbmNvbXBsZXRlVGFnT3BlblRva2VuLFxuICBJbnRlcnBvbGF0ZWRBdHRyaWJ1dGVUb2tlbixcbiAgSW50ZXJwb2xhdGVkVGV4dFRva2VuLFxuICBMZXRFbmRUb2tlbixcbiAgTGV0U3RhcnRUb2tlbixcbiAgTGV0VmFsdWVUb2tlbixcbiAgVGFnQ2xvc2VUb2tlbixcbiAgVGFnT3BlblN0YXJ0VG9rZW4sXG4gIFRleHRUb2tlbixcbiAgVG9rZW4sXG4gIFRva2VuVHlwZSxcbn0gZnJvbSAnLi90b2tlbnMnO1xuXG4vKiogTm9kZXMgdGhhdCBjYW4gY29udGFpbiBvdGhlciBub2Rlcy4gKi9cbnR5cGUgTm9kZUNvbnRhaW5lciA9IGh0bWwuRWxlbWVudCB8IGh0bWwuQmxvY2s7XG5cbi8qKiBDbGFzcyB0aGF0IGNhbiBjb25zdHJ1Y3QgYSBgTm9kZUNvbnRhaW5lcmAuICovXG5pbnRlcmZhY2UgTm9kZUNvbnRhaW5lckNvbnN0cnVjdG9yIGV4dGVuZHMgRnVuY3Rpb24ge1xuICBuZXcgKC4uLmFyZ3M6IGFueVtdKTogTm9kZUNvbnRhaW5lcjtcbn1cblxuZXhwb3J0IGNsYXNzIFRyZWVFcnJvciBleHRlbmRzIFBhcnNlRXJyb3Ige1xuICBzdGF0aWMgY3JlYXRlKGVsZW1lbnROYW1lOiBzdHJpbmcgfCBudWxsLCBzcGFuOiBQYXJzZVNvdXJjZVNwYW4sIG1zZzogc3RyaW5nKTogVHJlZUVycm9yIHtcbiAgICByZXR1cm4gbmV3IFRyZWVFcnJvcihlbGVtZW50TmFtZSwgc3BhbiwgbXNnKTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBlbGVtZW50TmFtZTogc3RyaW5nIHwgbnVsbCxcbiAgICBzcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgbXNnOiBzdHJpbmcsXG4gICkge1xuICAgIHN1cGVyKHNwYW4sIG1zZyk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFBhcnNlVHJlZVJlc3VsdCB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyByb290Tm9kZXM6IGh0bWwuTm9kZVtdLFxuICAgIHB1YmxpYyBlcnJvcnM6IFBhcnNlRXJyb3JbXSxcbiAgKSB7fVxufVxuXG5leHBvcnQgY2xhc3MgUGFyc2VyIHtcbiAgY29uc3RydWN0b3IocHVibGljIGdldFRhZ0RlZmluaXRpb246ICh0YWdOYW1lOiBzdHJpbmcpID0+IFRhZ0RlZmluaXRpb24pIHt9XG5cbiAgcGFyc2Uoc291cmNlOiBzdHJpbmcsIHVybDogc3RyaW5nLCBvcHRpb25zPzogVG9rZW5pemVPcHRpb25zKTogUGFyc2VUcmVlUmVzdWx0IHtcbiAgICBjb25zdCB0b2tlbml6ZVJlc3VsdCA9IHRva2VuaXplKHNvdXJjZSwgdXJsLCB0aGlzLmdldFRhZ0RlZmluaXRpb24sIG9wdGlvbnMpO1xuICAgIGNvbnN0IHBhcnNlciA9IG5ldyBfVHJlZUJ1aWxkZXIodG9rZW5pemVSZXN1bHQudG9rZW5zLCB0aGlzLmdldFRhZ0RlZmluaXRpb24pO1xuICAgIHBhcnNlci5idWlsZCgpO1xuICAgIHJldHVybiBuZXcgUGFyc2VUcmVlUmVzdWx0KFxuICAgICAgcGFyc2VyLnJvb3ROb2RlcyxcbiAgICAgICh0b2tlbml6ZVJlc3VsdC5lcnJvcnMgYXMgUGFyc2VFcnJvcltdKS5jb25jYXQocGFyc2VyLmVycm9ycyksXG4gICAgKTtcbiAgfVxufVxuXG5jbGFzcyBfVHJlZUJ1aWxkZXIge1xuICBwcml2YXRlIF9pbmRleDogbnVtYmVyID0gLTE7XG4gIC8vIGBfcGVla2Agd2lsbCBiZSBpbml0aWFsaXplZCBieSB0aGUgY2FsbCB0byBgX2FkdmFuY2UoKWAgaW4gdGhlIGNvbnN0cnVjdG9yLlxuICBwcml2YXRlIF9wZWVrITogVG9rZW47XG4gIHByaXZhdGUgX2NvbnRhaW5lclN0YWNrOiBOb2RlQ29udGFpbmVyW10gPSBbXTtcblxuICByb290Tm9kZXM6IGh0bWwuTm9kZVtdID0gW107XG4gIGVycm9yczogVHJlZUVycm9yW10gPSBbXTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIHRva2VuczogVG9rZW5bXSxcbiAgICBwcml2YXRlIGdldFRhZ0RlZmluaXRpb246ICh0YWdOYW1lOiBzdHJpbmcpID0+IFRhZ0RlZmluaXRpb24sXG4gICkge1xuICAgIHRoaXMuX2FkdmFuY2UoKTtcbiAgfVxuXG4gIGJ1aWxkKCk6IHZvaWQge1xuICAgIHdoaWxlICh0aGlzLl9wZWVrLnR5cGUgIT09IFRva2VuVHlwZS5FT0YpIHtcbiAgICAgIGlmIChcbiAgICAgICAgdGhpcy5fcGVlay50eXBlID09PSBUb2tlblR5cGUuVEFHX09QRU5fU1RBUlQgfHxcbiAgICAgICAgdGhpcy5fcGVlay50eXBlID09PSBUb2tlblR5cGUuSU5DT01QTEVURV9UQUdfT1BFTlxuICAgICAgKSB7XG4gICAgICAgIHRoaXMuX2NvbnN1bWVTdGFydFRhZyh0aGlzLl9hZHZhbmNlKCkpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl9wZWVrLnR5cGUgPT09IFRva2VuVHlwZS5UQUdfQ0xPU0UpIHtcbiAgICAgICAgdGhpcy5fY29uc3VtZUVuZFRhZyh0aGlzLl9hZHZhbmNlKCkpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl9wZWVrLnR5cGUgPT09IFRva2VuVHlwZS5DREFUQV9TVEFSVCkge1xuICAgICAgICB0aGlzLl9jbG9zZVZvaWRFbGVtZW50KCk7XG4gICAgICAgIHRoaXMuX2NvbnN1bWVDZGF0YSh0aGlzLl9hZHZhbmNlKCkpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl9wZWVrLnR5cGUgPT09IFRva2VuVHlwZS5DT01NRU5UX1NUQVJUKSB7XG4gICAgICAgIHRoaXMuX2Nsb3NlVm9pZEVsZW1lbnQoKTtcbiAgICAgICAgdGhpcy5fY29uc3VtZUNvbW1lbnQodGhpcy5fYWR2YW5jZSgpKTtcbiAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgIHRoaXMuX3BlZWsudHlwZSA9PT0gVG9rZW5UeXBlLlRFWFQgfHxcbiAgICAgICAgdGhpcy5fcGVlay50eXBlID09PSBUb2tlblR5cGUuUkFXX1RFWFQgfHxcbiAgICAgICAgdGhpcy5fcGVlay50eXBlID09PSBUb2tlblR5cGUuRVNDQVBBQkxFX1JBV19URVhUXG4gICAgICApIHtcbiAgICAgICAgdGhpcy5fY2xvc2VWb2lkRWxlbWVudCgpO1xuICAgICAgICB0aGlzLl9jb25zdW1lVGV4dCh0aGlzLl9hZHZhbmNlKCkpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl9wZWVrLnR5cGUgPT09IFRva2VuVHlwZS5FWFBBTlNJT05fRk9STV9TVEFSVCkge1xuICAgICAgICB0aGlzLl9jb25zdW1lRXhwYW5zaW9uKHRoaXMuX2FkdmFuY2UoKSk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX3BlZWsudHlwZSA9PT0gVG9rZW5UeXBlLkJMT0NLX09QRU5fU1RBUlQpIHtcbiAgICAgICAgdGhpcy5fY2xvc2VWb2lkRWxlbWVudCgpO1xuICAgICAgICB0aGlzLl9jb25zdW1lQmxvY2tPcGVuKHRoaXMuX2FkdmFuY2UoKSk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX3BlZWsudHlwZSA9PT0gVG9rZW5UeXBlLkJMT0NLX0NMT1NFKSB7XG4gICAgICAgIHRoaXMuX2Nsb3NlVm9pZEVsZW1lbnQoKTtcbiAgICAgICAgdGhpcy5fY29uc3VtZUJsb2NrQ2xvc2UodGhpcy5fYWR2YW5jZSgpKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fcGVlay50eXBlID09PSBUb2tlblR5cGUuSU5DT01QTEVURV9CTE9DS19PUEVOKSB7XG4gICAgICAgIHRoaXMuX2Nsb3NlVm9pZEVsZW1lbnQoKTtcbiAgICAgICAgdGhpcy5fY29uc3VtZUluY29tcGxldGVCbG9jayh0aGlzLl9hZHZhbmNlKCkpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl9wZWVrLnR5cGUgPT09IFRva2VuVHlwZS5MRVRfU1RBUlQpIHtcbiAgICAgICAgdGhpcy5fY2xvc2VWb2lkRWxlbWVudCgpO1xuICAgICAgICB0aGlzLl9jb25zdW1lTGV0KHRoaXMuX2FkdmFuY2UoKSk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX3BlZWsudHlwZSA9PT0gVG9rZW5UeXBlLklOQ09NUExFVEVfTEVUKSB7XG4gICAgICAgIHRoaXMuX2Nsb3NlVm9pZEVsZW1lbnQoKTtcbiAgICAgICAgdGhpcy5fY29uc3VtZUluY29tcGxldGVMZXQodGhpcy5fYWR2YW5jZSgpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFNraXAgYWxsIG90aGVyIHRva2Vucy4uLlxuICAgICAgICB0aGlzLl9hZHZhbmNlKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBsZWZ0b3ZlckNvbnRhaW5lciBvZiB0aGlzLl9jb250YWluZXJTdGFjaykge1xuICAgICAgLy8gVW5saWtlIEhUTUwgZWxlbWVudHMsIGJsb2NrcyBhcmVuJ3QgY2xvc2VkIGltcGxpY2l0bHkgYnkgdGhlIGVuZCBvZiB0aGUgZmlsZS5cbiAgICAgIGlmIChsZWZ0b3ZlckNvbnRhaW5lciBpbnN0YW5jZW9mIGh0bWwuQmxvY2spIHtcbiAgICAgICAgdGhpcy5lcnJvcnMucHVzaChcbiAgICAgICAgICBUcmVlRXJyb3IuY3JlYXRlKFxuICAgICAgICAgICAgbGVmdG92ZXJDb250YWluZXIubmFtZSxcbiAgICAgICAgICAgIGxlZnRvdmVyQ29udGFpbmVyLnNvdXJjZVNwYW4sXG4gICAgICAgICAgICBgVW5jbG9zZWQgYmxvY2sgXCIke2xlZnRvdmVyQ29udGFpbmVyLm5hbWV9XCJgLFxuICAgICAgICAgICksXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfYWR2YW5jZTxUIGV4dGVuZHMgVG9rZW4+KCk6IFQge1xuICAgIGNvbnN0IHByZXYgPSB0aGlzLl9wZWVrO1xuICAgIGlmICh0aGlzLl9pbmRleCA8IHRoaXMudG9rZW5zLmxlbmd0aCAtIDEpIHtcbiAgICAgIC8vIE5vdGU6IHRoZXJlIGlzIGFsd2F5cyBhbiBFT0YgdG9rZW4gYXQgdGhlIGVuZFxuICAgICAgdGhpcy5faW5kZXgrKztcbiAgICB9XG4gICAgdGhpcy5fcGVlayA9IHRoaXMudG9rZW5zW3RoaXMuX2luZGV4XTtcbiAgICByZXR1cm4gcHJldiBhcyBUO1xuICB9XG5cbiAgcHJpdmF0ZSBfYWR2YW5jZUlmPFQgZXh0ZW5kcyBUb2tlblR5cGU+KHR5cGU6IFQpOiAoVG9rZW4gJiB7dHlwZTogVH0pIHwgbnVsbCB7XG4gICAgaWYgKHRoaXMuX3BlZWsudHlwZSA9PT0gdHlwZSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2FkdmFuY2U8VG9rZW4gJiB7dHlwZTogVH0+KCk7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29uc3VtZUNkYXRhKF9zdGFydFRva2VuOiBDZGF0YVN0YXJ0VG9rZW4pIHtcbiAgICB0aGlzLl9jb25zdW1lVGV4dCh0aGlzLl9hZHZhbmNlPFRleHRUb2tlbj4oKSk7XG4gICAgdGhpcy5fYWR2YW5jZUlmKFRva2VuVHlwZS5DREFUQV9FTkQpO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29uc3VtZUNvbW1lbnQodG9rZW46IENvbW1lbnRTdGFydFRva2VuKSB7XG4gICAgY29uc3QgdGV4dCA9IHRoaXMuX2FkdmFuY2VJZihUb2tlblR5cGUuUkFXX1RFWFQpO1xuICAgIGNvbnN0IGVuZFRva2VuID0gdGhpcy5fYWR2YW5jZUlmKFRva2VuVHlwZS5DT01NRU5UX0VORCk7XG4gICAgY29uc3QgdmFsdWUgPSB0ZXh0ICE9IG51bGwgPyB0ZXh0LnBhcnRzWzBdLnRyaW0oKSA6IG51bGw7XG4gICAgY29uc3Qgc291cmNlU3BhbiA9XG4gICAgICBlbmRUb2tlbiA9PSBudWxsXG4gICAgICAgID8gdG9rZW4uc291cmNlU3BhblxuICAgICAgICA6IG5ldyBQYXJzZVNvdXJjZVNwYW4oXG4gICAgICAgICAgICB0b2tlbi5zb3VyY2VTcGFuLnN0YXJ0LFxuICAgICAgICAgICAgZW5kVG9rZW4uc291cmNlU3Bhbi5lbmQsXG4gICAgICAgICAgICB0b2tlbi5zb3VyY2VTcGFuLmZ1bGxTdGFydCxcbiAgICAgICAgICApO1xuICAgIHRoaXMuX2FkZFRvUGFyZW50KG5ldyBodG1sLkNvbW1lbnQodmFsdWUsIHNvdXJjZVNwYW4pKTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbnN1bWVFeHBhbnNpb24odG9rZW46IEV4cGFuc2lvbkZvcm1TdGFydFRva2VuKSB7XG4gICAgY29uc3Qgc3dpdGNoVmFsdWUgPSB0aGlzLl9hZHZhbmNlPFRleHRUb2tlbj4oKTtcblxuICAgIGNvbnN0IHR5cGUgPSB0aGlzLl9hZHZhbmNlPFRleHRUb2tlbj4oKTtcbiAgICBjb25zdCBjYXNlczogaHRtbC5FeHBhbnNpb25DYXNlW10gPSBbXTtcblxuICAgIC8vIHJlYWQgPVxuICAgIHdoaWxlICh0aGlzLl9wZWVrLnR5cGUgPT09IFRva2VuVHlwZS5FWFBBTlNJT05fQ0FTRV9WQUxVRSkge1xuICAgICAgY29uc3QgZXhwQ2FzZSA9IHRoaXMuX3BhcnNlRXhwYW5zaW9uQ2FzZSgpO1xuICAgICAgaWYgKCFleHBDYXNlKSByZXR1cm47IC8vIGVycm9yXG4gICAgICBjYXNlcy5wdXNoKGV4cENhc2UpO1xuICAgIH1cblxuICAgIC8vIHJlYWQgdGhlIGZpbmFsIH1cbiAgICBpZiAodGhpcy5fcGVlay50eXBlICE9PSBUb2tlblR5cGUuRVhQQU5TSU9OX0ZPUk1fRU5EKSB7XG4gICAgICB0aGlzLmVycm9ycy5wdXNoKFxuICAgICAgICBUcmVlRXJyb3IuY3JlYXRlKG51bGwsIHRoaXMuX3BlZWsuc291cmNlU3BhbiwgYEludmFsaWQgSUNVIG1lc3NhZ2UuIE1pc3NpbmcgJ30nLmApLFxuICAgICAgKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3Qgc291cmNlU3BhbiA9IG5ldyBQYXJzZVNvdXJjZVNwYW4oXG4gICAgICB0b2tlbi5zb3VyY2VTcGFuLnN0YXJ0LFxuICAgICAgdGhpcy5fcGVlay5zb3VyY2VTcGFuLmVuZCxcbiAgICAgIHRva2VuLnNvdXJjZVNwYW4uZnVsbFN0YXJ0LFxuICAgICk7XG4gICAgdGhpcy5fYWRkVG9QYXJlbnQoXG4gICAgICBuZXcgaHRtbC5FeHBhbnNpb24oXG4gICAgICAgIHN3aXRjaFZhbHVlLnBhcnRzWzBdLFxuICAgICAgICB0eXBlLnBhcnRzWzBdLFxuICAgICAgICBjYXNlcyxcbiAgICAgICAgc291cmNlU3BhbixcbiAgICAgICAgc3dpdGNoVmFsdWUuc291cmNlU3BhbixcbiAgICAgICksXG4gICAgKTtcblxuICAgIHRoaXMuX2FkdmFuY2UoKTtcbiAgfVxuXG4gIHByaXZhdGUgX3BhcnNlRXhwYW5zaW9uQ2FzZSgpOiBodG1sLkV4cGFuc2lvbkNhc2UgfCBudWxsIHtcbiAgICBjb25zdCB2YWx1ZSA9IHRoaXMuX2FkdmFuY2U8RXhwYW5zaW9uQ2FzZVZhbHVlVG9rZW4+KCk7XG5cbiAgICAvLyByZWFkIHtcbiAgICBpZiAodGhpcy5fcGVlay50eXBlICE9PSBUb2tlblR5cGUuRVhQQU5TSU9OX0NBU0VfRVhQX1NUQVJUKSB7XG4gICAgICB0aGlzLmVycm9ycy5wdXNoKFxuICAgICAgICBUcmVlRXJyb3IuY3JlYXRlKG51bGwsIHRoaXMuX3BlZWsuc291cmNlU3BhbiwgYEludmFsaWQgSUNVIG1lc3NhZ2UuIE1pc3NpbmcgJ3snLmApLFxuICAgICAgKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8vIHJlYWQgdW50aWwgfVxuICAgIGNvbnN0IHN0YXJ0ID0gdGhpcy5fYWR2YW5jZTxFeHBhbnNpb25DYXNlRXhwcmVzc2lvblN0YXJ0VG9rZW4+KCk7XG5cbiAgICBjb25zdCBleHAgPSB0aGlzLl9jb2xsZWN0RXhwYW5zaW9uRXhwVG9rZW5zKHN0YXJ0KTtcbiAgICBpZiAoIWV4cCkgcmV0dXJuIG51bGw7XG5cbiAgICBjb25zdCBlbmQgPSB0aGlzLl9hZHZhbmNlPEV4cGFuc2lvbkNhc2VFeHByZXNzaW9uRW5kVG9rZW4+KCk7XG4gICAgZXhwLnB1c2goe3R5cGU6IFRva2VuVHlwZS5FT0YsIHBhcnRzOiBbXSwgc291cmNlU3BhbjogZW5kLnNvdXJjZVNwYW59KTtcblxuICAgIC8vIHBhcnNlIGV2ZXJ5dGhpbmcgaW4gYmV0d2VlbiB7IGFuZCB9XG4gICAgY29uc3QgZXhwYW5zaW9uQ2FzZVBhcnNlciA9IG5ldyBfVHJlZUJ1aWxkZXIoZXhwLCB0aGlzLmdldFRhZ0RlZmluaXRpb24pO1xuICAgIGV4cGFuc2lvbkNhc2VQYXJzZXIuYnVpbGQoKTtcbiAgICBpZiAoZXhwYW5zaW9uQ2FzZVBhcnNlci5lcnJvcnMubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5lcnJvcnMgPSB0aGlzLmVycm9ycy5jb25jYXQoZXhwYW5zaW9uQ2FzZVBhcnNlci5lcnJvcnMpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3Qgc291cmNlU3BhbiA9IG5ldyBQYXJzZVNvdXJjZVNwYW4oXG4gICAgICB2YWx1ZS5zb3VyY2VTcGFuLnN0YXJ0LFxuICAgICAgZW5kLnNvdXJjZVNwYW4uZW5kLFxuICAgICAgdmFsdWUuc291cmNlU3Bhbi5mdWxsU3RhcnQsXG4gICAgKTtcbiAgICBjb25zdCBleHBTb3VyY2VTcGFuID0gbmV3IFBhcnNlU291cmNlU3BhbihcbiAgICAgIHN0YXJ0LnNvdXJjZVNwYW4uc3RhcnQsXG4gICAgICBlbmQuc291cmNlU3Bhbi5lbmQsXG4gICAgICBzdGFydC5zb3VyY2VTcGFuLmZ1bGxTdGFydCxcbiAgICApO1xuICAgIHJldHVybiBuZXcgaHRtbC5FeHBhbnNpb25DYXNlKFxuICAgICAgdmFsdWUucGFydHNbMF0sXG4gICAgICBleHBhbnNpb25DYXNlUGFyc2VyLnJvb3ROb2RlcyxcbiAgICAgIHNvdXJjZVNwYW4sXG4gICAgICB2YWx1ZS5zb3VyY2VTcGFuLFxuICAgICAgZXhwU291cmNlU3BhbixcbiAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29sbGVjdEV4cGFuc2lvbkV4cFRva2VucyhzdGFydDogVG9rZW4pOiBUb2tlbltdIHwgbnVsbCB7XG4gICAgY29uc3QgZXhwOiBUb2tlbltdID0gW107XG4gICAgY29uc3QgZXhwYW5zaW9uRm9ybVN0YWNrID0gW1Rva2VuVHlwZS5FWFBBTlNJT05fQ0FTRV9FWFBfU1RBUlRdO1xuXG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIGlmIChcbiAgICAgICAgdGhpcy5fcGVlay50eXBlID09PSBUb2tlblR5cGUuRVhQQU5TSU9OX0ZPUk1fU1RBUlQgfHxcbiAgICAgICAgdGhpcy5fcGVlay50eXBlID09PSBUb2tlblR5cGUuRVhQQU5TSU9OX0NBU0VfRVhQX1NUQVJUXG4gICAgICApIHtcbiAgICAgICAgZXhwYW5zaW9uRm9ybVN0YWNrLnB1c2godGhpcy5fcGVlay50eXBlKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuX3BlZWsudHlwZSA9PT0gVG9rZW5UeXBlLkVYUEFOU0lPTl9DQVNFX0VYUF9FTkQpIHtcbiAgICAgICAgaWYgKGxhc3RPblN0YWNrKGV4cGFuc2lvbkZvcm1TdGFjaywgVG9rZW5UeXBlLkVYUEFOU0lPTl9DQVNFX0VYUF9TVEFSVCkpIHtcbiAgICAgICAgICBleHBhbnNpb25Gb3JtU3RhY2sucG9wKCk7XG4gICAgICAgICAgaWYgKGV4cGFuc2lvbkZvcm1TdGFjay5sZW5ndGggPT09IDApIHJldHVybiBleHA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5lcnJvcnMucHVzaChcbiAgICAgICAgICAgIFRyZWVFcnJvci5jcmVhdGUobnVsbCwgc3RhcnQuc291cmNlU3BhbiwgYEludmFsaWQgSUNVIG1lc3NhZ2UuIE1pc3NpbmcgJ30nLmApLFxuICAgICAgICAgICk7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuX3BlZWsudHlwZSA9PT0gVG9rZW5UeXBlLkVYUEFOU0lPTl9GT1JNX0VORCkge1xuICAgICAgICBpZiAobGFzdE9uU3RhY2soZXhwYW5zaW9uRm9ybVN0YWNrLCBUb2tlblR5cGUuRVhQQU5TSU9OX0ZPUk1fU1RBUlQpKSB7XG4gICAgICAgICAgZXhwYW5zaW9uRm9ybVN0YWNrLnBvcCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuZXJyb3JzLnB1c2goXG4gICAgICAgICAgICBUcmVlRXJyb3IuY3JlYXRlKG51bGwsIHN0YXJ0LnNvdXJjZVNwYW4sIGBJbnZhbGlkIElDVSBtZXNzYWdlLiBNaXNzaW5nICd9Jy5gKSxcbiAgICAgICAgICApO1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLl9wZWVrLnR5cGUgPT09IFRva2VuVHlwZS5FT0YpIHtcbiAgICAgICAgdGhpcy5lcnJvcnMucHVzaChcbiAgICAgICAgICBUcmVlRXJyb3IuY3JlYXRlKG51bGwsIHN0YXJ0LnNvdXJjZVNwYW4sIGBJbnZhbGlkIElDVSBtZXNzYWdlLiBNaXNzaW5nICd9Jy5gKSxcbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG5cbiAgICAgIGV4cC5wdXNoKHRoaXMuX2FkdmFuY2UoKSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfY29uc3VtZVRleHQodG9rZW46IEludGVycG9sYXRlZFRleHRUb2tlbikge1xuICAgIGNvbnN0IHRva2VucyA9IFt0b2tlbl07XG4gICAgY29uc3Qgc3RhcnRTcGFuID0gdG9rZW4uc291cmNlU3BhbjtcbiAgICBsZXQgdGV4dCA9IHRva2VuLnBhcnRzWzBdO1xuICAgIGlmICh0ZXh0Lmxlbmd0aCA+IDAgJiYgdGV4dFswXSA9PT0gJ1xcbicpIHtcbiAgICAgIGNvbnN0IHBhcmVudCA9IHRoaXMuX2dldENvbnRhaW5lcigpO1xuXG4gICAgICBpZiAoXG4gICAgICAgIHBhcmVudCAhPSBudWxsICYmXG4gICAgICAgIHBhcmVudC5jaGlsZHJlbi5sZW5ndGggPT09IDAgJiZcbiAgICAgICAgdGhpcy5nZXRUYWdEZWZpbml0aW9uKHBhcmVudC5uYW1lKS5pZ25vcmVGaXJzdExmXG4gICAgICApIHtcbiAgICAgICAgdGV4dCA9IHRleHQuc3Vic3RyaW5nKDEpO1xuICAgICAgICB0b2tlbnNbMF0gPSB7dHlwZTogdG9rZW4udHlwZSwgc291cmNlU3BhbjogdG9rZW4uc291cmNlU3BhbiwgcGFydHM6IFt0ZXh0XX0gYXMgdHlwZW9mIHRva2VuO1xuICAgICAgfVxuICAgIH1cblxuICAgIHdoaWxlIChcbiAgICAgIHRoaXMuX3BlZWsudHlwZSA9PT0gVG9rZW5UeXBlLklOVEVSUE9MQVRJT04gfHxcbiAgICAgIHRoaXMuX3BlZWsudHlwZSA9PT0gVG9rZW5UeXBlLlRFWFQgfHxcbiAgICAgIHRoaXMuX3BlZWsudHlwZSA9PT0gVG9rZW5UeXBlLkVOQ09ERURfRU5USVRZXG4gICAgKSB7XG4gICAgICB0b2tlbiA9IHRoaXMuX2FkdmFuY2UoKTtcbiAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgIGlmICh0b2tlbi50eXBlID09PSBUb2tlblR5cGUuSU5URVJQT0xBVElPTikge1xuICAgICAgICAvLyBGb3IgYmFja3dhcmQgY29tcGF0aWJpbGl0eSB3ZSBkZWNvZGUgSFRNTCBlbnRpdGllcyB0aGF0IGFwcGVhciBpbiBpbnRlcnBvbGF0aW9uXG4gICAgICAgIC8vIGV4cHJlc3Npb25zLiBUaGlzIGlzIGFyZ3VhYmx5IGEgYnVnLCBidXQgaXQgY291bGQgYmUgYSBjb25zaWRlcmFibGUgYnJlYWtpbmcgY2hhbmdlIHRvXG4gICAgICAgIC8vIGZpeCBpdC4gSXQgc2hvdWxkIGJlIGFkZHJlc3NlZCBpbiBhIGxhcmdlciBwcm9qZWN0IHRvIHJlZmFjdG9yIHRoZSBlbnRpcmUgcGFyc2VyL2xleGVyXG4gICAgICAgIC8vIGNoYWluIGFmdGVyIFZpZXcgRW5naW5lIGhhcyBiZWVuIHJlbW92ZWQuXG4gICAgICAgIHRleHQgKz0gdG9rZW4ucGFydHMuam9pbignJykucmVwbGFjZSgvJihbXjtdKyk7L2csIGRlY29kZUVudGl0eSk7XG4gICAgICB9IGVsc2UgaWYgKHRva2VuLnR5cGUgPT09IFRva2VuVHlwZS5FTkNPREVEX0VOVElUWSkge1xuICAgICAgICB0ZXh0ICs9IHRva2VuLnBhcnRzWzBdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGV4dCArPSB0b2tlbi5wYXJ0cy5qb2luKCcnKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGV4dC5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBlbmRTcGFuID0gdG9rZW4uc291cmNlU3BhbjtcbiAgICAgIHRoaXMuX2FkZFRvUGFyZW50KFxuICAgICAgICBuZXcgaHRtbC5UZXh0KFxuICAgICAgICAgIHRleHQsXG4gICAgICAgICAgbmV3IFBhcnNlU291cmNlU3BhbihzdGFydFNwYW4uc3RhcnQsIGVuZFNwYW4uZW5kLCBzdGFydFNwYW4uZnVsbFN0YXJ0LCBzdGFydFNwYW4uZGV0YWlscyksXG4gICAgICAgICAgdG9rZW5zLFxuICAgICAgICApLFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9jbG9zZVZvaWRFbGVtZW50KCk6IHZvaWQge1xuICAgIGNvbnN0IGVsID0gdGhpcy5fZ2V0Q29udGFpbmVyKCk7XG4gICAgaWYgKGVsIGluc3RhbmNlb2YgaHRtbC5FbGVtZW50ICYmIHRoaXMuZ2V0VGFnRGVmaW5pdGlvbihlbC5uYW1lKS5pc1ZvaWQpIHtcbiAgICAgIHRoaXMuX2NvbnRhaW5lclN0YWNrLnBvcCgpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2NvbnN1bWVTdGFydFRhZyhzdGFydFRhZ1Rva2VuOiBUYWdPcGVuU3RhcnRUb2tlbiB8IEluY29tcGxldGVUYWdPcGVuVG9rZW4pIHtcbiAgICBjb25zdCBbcHJlZml4LCBuYW1lXSA9IHN0YXJ0VGFnVG9rZW4ucGFydHM7XG4gICAgY29uc3QgYXR0cnM6IGh0bWwuQXR0cmlidXRlW10gPSBbXTtcbiAgICB3aGlsZSAodGhpcy5fcGVlay50eXBlID09PSBUb2tlblR5cGUuQVRUUl9OQU1FKSB7XG4gICAgICBhdHRycy5wdXNoKHRoaXMuX2NvbnN1bWVBdHRyKHRoaXMuX2FkdmFuY2U8QXR0cmlidXRlTmFtZVRva2VuPigpKSk7XG4gICAgfVxuICAgIGNvbnN0IGZ1bGxOYW1lID0gdGhpcy5fZ2V0RWxlbWVudEZ1bGxOYW1lKHByZWZpeCwgbmFtZSwgdGhpcy5fZ2V0Q2xvc2VzdFBhcmVudEVsZW1lbnQoKSk7XG4gICAgbGV0IHNlbGZDbG9zaW5nID0gZmFsc2U7XG4gICAgLy8gTm90ZTogVGhlcmUgY291bGQgaGF2ZSBiZWVuIGEgdG9rZW5pemVyIGVycm9yXG4gICAgLy8gc28gdGhhdCB3ZSBkb24ndCBnZXQgYSB0b2tlbiBmb3IgdGhlIGVuZCB0YWcuLi5cbiAgICBpZiAodGhpcy5fcGVlay50eXBlID09PSBUb2tlblR5cGUuVEFHX09QRU5fRU5EX1ZPSUQpIHtcbiAgICAgIHRoaXMuX2FkdmFuY2UoKTtcbiAgICAgIHNlbGZDbG9zaW5nID0gdHJ1ZTtcbiAgICAgIGNvbnN0IHRhZ0RlZiA9IHRoaXMuZ2V0VGFnRGVmaW5pdGlvbihmdWxsTmFtZSk7XG4gICAgICBpZiAoISh0YWdEZWYuY2FuU2VsZkNsb3NlIHx8IGdldE5zUHJlZml4KGZ1bGxOYW1lKSAhPT0gbnVsbCB8fCB0YWdEZWYuaXNWb2lkKSkge1xuICAgICAgICB0aGlzLmVycm9ycy5wdXNoKFxuICAgICAgICAgIFRyZWVFcnJvci5jcmVhdGUoXG4gICAgICAgICAgICBmdWxsTmFtZSxcbiAgICAgICAgICAgIHN0YXJ0VGFnVG9rZW4uc291cmNlU3BhbixcbiAgICAgICAgICAgIGBPbmx5IHZvaWQsIGN1c3RvbSBhbmQgZm9yZWlnbiBlbGVtZW50cyBjYW4gYmUgc2VsZiBjbG9zZWQgXCIke3N0YXJ0VGFnVG9rZW4ucGFydHNbMV19XCJgLFxuICAgICAgICAgICksXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0aGlzLl9wZWVrLnR5cGUgPT09IFRva2VuVHlwZS5UQUdfT1BFTl9FTkQpIHtcbiAgICAgIHRoaXMuX2FkdmFuY2UoKTtcbiAgICAgIHNlbGZDbG9zaW5nID0gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IGVuZCA9IHRoaXMuX3BlZWsuc291cmNlU3Bhbi5mdWxsU3RhcnQ7XG4gICAgY29uc3Qgc3BhbiA9IG5ldyBQYXJzZVNvdXJjZVNwYW4oXG4gICAgICBzdGFydFRhZ1Rva2VuLnNvdXJjZVNwYW4uc3RhcnQsXG4gICAgICBlbmQsXG4gICAgICBzdGFydFRhZ1Rva2VuLnNvdXJjZVNwYW4uZnVsbFN0YXJ0LFxuICAgICk7XG4gICAgLy8gQ3JlYXRlIGEgc2VwYXJhdGUgYHN0YXJ0U3BhbmAgYmVjYXVzZSBgc3BhbmAgd2lsbCBiZSBtb2RpZmllZCB3aGVuIHRoZXJlIGlzIGFuIGBlbmRgIHNwYW4uXG4gICAgY29uc3Qgc3RhcnRTcGFuID0gbmV3IFBhcnNlU291cmNlU3BhbihcbiAgICAgIHN0YXJ0VGFnVG9rZW4uc291cmNlU3Bhbi5zdGFydCxcbiAgICAgIGVuZCxcbiAgICAgIHN0YXJ0VGFnVG9rZW4uc291cmNlU3Bhbi5mdWxsU3RhcnQsXG4gICAgKTtcbiAgICBjb25zdCBlbCA9IG5ldyBodG1sLkVsZW1lbnQoZnVsbE5hbWUsIGF0dHJzLCBbXSwgc3Bhbiwgc3RhcnRTcGFuLCB1bmRlZmluZWQpO1xuICAgIGNvbnN0IHBhcmVudEVsID0gdGhpcy5fZ2V0Q29udGFpbmVyKCk7XG4gICAgdGhpcy5fcHVzaENvbnRhaW5lcihcbiAgICAgIGVsLFxuICAgICAgcGFyZW50RWwgaW5zdGFuY2VvZiBodG1sLkVsZW1lbnQgJiZcbiAgICAgICAgdGhpcy5nZXRUYWdEZWZpbml0aW9uKHBhcmVudEVsLm5hbWUpLmlzQ2xvc2VkQnlDaGlsZChlbC5uYW1lKSxcbiAgICApO1xuICAgIGlmIChzZWxmQ2xvc2luZykge1xuICAgICAgLy8gRWxlbWVudHMgdGhhdCBhcmUgc2VsZi1jbG9zZWQgaGF2ZSB0aGVpciBgZW5kU291cmNlU3BhbmAgc2V0IHRvIHRoZSBmdWxsIHNwYW4sIGFzIHRoZVxuICAgICAgLy8gZWxlbWVudCBzdGFydCB0YWcgYWxzbyByZXByZXNlbnRzIHRoZSBlbmQgdGFnLlxuICAgICAgdGhpcy5fcG9wQ29udGFpbmVyKGZ1bGxOYW1lLCBodG1sLkVsZW1lbnQsIHNwYW4pO1xuICAgIH0gZWxzZSBpZiAoc3RhcnRUYWdUb2tlbi50eXBlID09PSBUb2tlblR5cGUuSU5DT01QTEVURV9UQUdfT1BFTikge1xuICAgICAgLy8gV2UgYWxyZWFkeSBrbm93IHRoZSBvcGVuaW5nIHRhZyBpcyBub3QgY29tcGxldGUsIHNvIGl0IGlzIHVubGlrZWx5IGl0IGhhcyBhIGNvcnJlc3BvbmRpbmdcbiAgICAgIC8vIGNsb3NlIHRhZy4gTGV0J3Mgb3B0aW1pc3RpY2FsbHkgcGFyc2UgaXQgYXMgYSBmdWxsIGVsZW1lbnQgYW5kIGVtaXQgYW4gZXJyb3IuXG4gICAgICB0aGlzLl9wb3BDb250YWluZXIoZnVsbE5hbWUsIGh0bWwuRWxlbWVudCwgbnVsbCk7XG4gICAgICB0aGlzLmVycm9ycy5wdXNoKFxuICAgICAgICBUcmVlRXJyb3IuY3JlYXRlKGZ1bGxOYW1lLCBzcGFuLCBgT3BlbmluZyB0YWcgXCIke2Z1bGxOYW1lfVwiIG5vdCB0ZXJtaW5hdGVkLmApLFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9wdXNoQ29udGFpbmVyKG5vZGU6IE5vZGVDb250YWluZXIsIGlzQ2xvc2VkQnlDaGlsZDogYm9vbGVhbikge1xuICAgIGlmIChpc0Nsb3NlZEJ5Q2hpbGQpIHtcbiAgICAgIHRoaXMuX2NvbnRhaW5lclN0YWNrLnBvcCgpO1xuICAgIH1cblxuICAgIHRoaXMuX2FkZFRvUGFyZW50KG5vZGUpO1xuICAgIHRoaXMuX2NvbnRhaW5lclN0YWNrLnB1c2gobm9kZSk7XG4gIH1cblxuICBwcml2YXRlIF9jb25zdW1lRW5kVGFnKGVuZFRhZ1Rva2VuOiBUYWdDbG9zZVRva2VuKSB7XG4gICAgY29uc3QgZnVsbE5hbWUgPSB0aGlzLl9nZXRFbGVtZW50RnVsbE5hbWUoXG4gICAgICBlbmRUYWdUb2tlbi5wYXJ0c1swXSxcbiAgICAgIGVuZFRhZ1Rva2VuLnBhcnRzWzFdLFxuICAgICAgdGhpcy5fZ2V0Q2xvc2VzdFBhcmVudEVsZW1lbnQoKSxcbiAgICApO1xuXG4gICAgaWYgKHRoaXMuZ2V0VGFnRGVmaW5pdGlvbihmdWxsTmFtZSkuaXNWb2lkKSB7XG4gICAgICB0aGlzLmVycm9ycy5wdXNoKFxuICAgICAgICBUcmVlRXJyb3IuY3JlYXRlKFxuICAgICAgICAgIGZ1bGxOYW1lLFxuICAgICAgICAgIGVuZFRhZ1Rva2VuLnNvdXJjZVNwYW4sXG4gICAgICAgICAgYFZvaWQgZWxlbWVudHMgZG8gbm90IGhhdmUgZW5kIHRhZ3MgXCIke2VuZFRhZ1Rva2VuLnBhcnRzWzFdfVwiYCxcbiAgICAgICAgKSxcbiAgICAgICk7XG4gICAgfSBlbHNlIGlmICghdGhpcy5fcG9wQ29udGFpbmVyKGZ1bGxOYW1lLCBodG1sLkVsZW1lbnQsIGVuZFRhZ1Rva2VuLnNvdXJjZVNwYW4pKSB7XG4gICAgICBjb25zdCBlcnJNc2cgPSBgVW5leHBlY3RlZCBjbG9zaW5nIHRhZyBcIiR7ZnVsbE5hbWV9XCIuIEl0IG1heSBoYXBwZW4gd2hlbiB0aGUgdGFnIGhhcyBhbHJlYWR5IGJlZW4gY2xvc2VkIGJ5IGFub3RoZXIgdGFnLiBGb3IgbW9yZSBpbmZvIHNlZSBodHRwczovL3d3dy53My5vcmcvVFIvaHRtbDUvc3ludGF4Lmh0bWwjY2xvc2luZy1lbGVtZW50cy10aGF0LWhhdmUtaW1wbGllZC1lbmQtdGFnc2A7XG4gICAgICB0aGlzLmVycm9ycy5wdXNoKFRyZWVFcnJvci5jcmVhdGUoZnVsbE5hbWUsIGVuZFRhZ1Rva2VuLnNvdXJjZVNwYW4sIGVyck1zZykpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDbG9zZXMgdGhlIG5lYXJlc3QgZWxlbWVudCB3aXRoIHRoZSB0YWcgbmFtZSBgZnVsbE5hbWVgIGluIHRoZSBwYXJzZSB0cmVlLlxuICAgKiBgZW5kU291cmNlU3BhbmAgaXMgdGhlIHNwYW4gb2YgdGhlIGNsb3NpbmcgdGFnLCBvciBudWxsIGlmIHRoZSBlbGVtZW50IGRvZXNcbiAgICogbm90IGhhdmUgYSBjbG9zaW5nIHRhZyAoZm9yIGV4YW1wbGUsIHRoaXMgaGFwcGVucyB3aGVuIGFuIGluY29tcGxldGVcbiAgICogb3BlbmluZyB0YWcgaXMgcmVjb3ZlcmVkKS5cbiAgICovXG4gIHByaXZhdGUgX3BvcENvbnRhaW5lcihcbiAgICBleHBlY3RlZE5hbWU6IHN0cmluZyB8IG51bGwsXG4gICAgZXhwZWN0ZWRUeXBlOiBOb2RlQ29udGFpbmVyQ29uc3RydWN0b3IsXG4gICAgZW5kU291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuIHwgbnVsbCxcbiAgKTogYm9vbGVhbiB7XG4gICAgbGV0IHVuZXhwZWN0ZWRDbG9zZVRhZ0RldGVjdGVkID0gZmFsc2U7XG4gICAgZm9yIChsZXQgc3RhY2tJbmRleCA9IHRoaXMuX2NvbnRhaW5lclN0YWNrLmxlbmd0aCAtIDE7IHN0YWNrSW5kZXggPj0gMDsgc3RhY2tJbmRleC0tKSB7XG4gICAgICBjb25zdCBub2RlID0gdGhpcy5fY29udGFpbmVyU3RhY2tbc3RhY2tJbmRleF07XG5cbiAgICAgIGlmICgobm9kZS5uYW1lID09PSBleHBlY3RlZE5hbWUgfHwgZXhwZWN0ZWROYW1lID09PSBudWxsKSAmJiBub2RlIGluc3RhbmNlb2YgZXhwZWN0ZWRUeXBlKSB7XG4gICAgICAgIC8vIFJlY29yZCB0aGUgcGFyc2Ugc3BhbiB3aXRoIHRoZSBlbGVtZW50IHRoYXQgaXMgYmVpbmcgY2xvc2VkLiBBbnkgZWxlbWVudHMgdGhhdCBhcmVcbiAgICAgICAgLy8gcmVtb3ZlZCBmcm9tIHRoZSBlbGVtZW50IHN0YWNrIGF0IHRoaXMgcG9pbnQgYXJlIGNsb3NlZCBpbXBsaWNpdGx5LCBzbyB0aGV5IHdvbid0IGdldFxuICAgICAgICAvLyBhbiBlbmQgc291cmNlIHNwYW4gKGFzIHRoZXJlIGlzIG5vIGV4cGxpY2l0IGNsb3NpbmcgZWxlbWVudCkuXG4gICAgICAgIG5vZGUuZW5kU291cmNlU3BhbiA9IGVuZFNvdXJjZVNwYW47XG4gICAgICAgIG5vZGUuc291cmNlU3Bhbi5lbmQgPSBlbmRTb3VyY2VTcGFuICE9PSBudWxsID8gZW5kU291cmNlU3Bhbi5lbmQgOiBub2RlLnNvdXJjZVNwYW4uZW5kO1xuICAgICAgICB0aGlzLl9jb250YWluZXJTdGFjay5zcGxpY2Uoc3RhY2tJbmRleCwgdGhpcy5fY29udGFpbmVyU3RhY2subGVuZ3RoIC0gc3RhY2tJbmRleCk7XG4gICAgICAgIHJldHVybiAhdW5leHBlY3RlZENsb3NlVGFnRGV0ZWN0ZWQ7XG4gICAgICB9XG5cbiAgICAgIC8vIEJsb2NrcyBhbmQgbW9zdCBlbGVtZW50cyBhcmUgbm90IHNlbGYgY2xvc2luZy5cbiAgICAgIGlmIChcbiAgICAgICAgbm9kZSBpbnN0YW5jZW9mIGh0bWwuQmxvY2sgfHxcbiAgICAgICAgKG5vZGUgaW5zdGFuY2VvZiBodG1sLkVsZW1lbnQgJiYgIXRoaXMuZ2V0VGFnRGVmaW5pdGlvbihub2RlLm5hbWUpLmNsb3NlZEJ5UGFyZW50KVxuICAgICAgKSB7XG4gICAgICAgIC8vIE5vdGUgdGhhdCB3ZSBlbmNvdW50ZXJlZCBhbiB1bmV4cGVjdGVkIGNsb3NlIHRhZyBidXQgY29udGludWUgcHJvY2Vzc2luZyB0aGUgZWxlbWVudFxuICAgICAgICAvLyBzdGFjayBzbyB3ZSBjYW4gYXNzaWduIGFuIGBlbmRTb3VyY2VTcGFuYCBpZiB0aGVyZSBpcyBhIGNvcnJlc3BvbmRpbmcgc3RhcnQgdGFnIGZvciB0aGlzXG4gICAgICAgIC8vIGVuZCB0YWcgaW4gdGhlIHN0YWNrLlxuICAgICAgICB1bmV4cGVjdGVkQ2xvc2VUYWdEZXRlY3RlZCA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbnN1bWVBdHRyKGF0dHJOYW1lOiBBdHRyaWJ1dGVOYW1lVG9rZW4pOiBodG1sLkF0dHJpYnV0ZSB7XG4gICAgY29uc3QgZnVsbE5hbWUgPSBtZXJnZU5zQW5kTmFtZShhdHRyTmFtZS5wYXJ0c1swXSwgYXR0ck5hbWUucGFydHNbMV0pO1xuICAgIGxldCBhdHRyRW5kID0gYXR0ck5hbWUuc291cmNlU3Bhbi5lbmQ7XG5cbiAgICAvLyBDb25zdW1lIGFueSBxdW90ZVxuICAgIGlmICh0aGlzLl9wZWVrLnR5cGUgPT09IFRva2VuVHlwZS5BVFRSX1FVT1RFKSB7XG4gICAgICB0aGlzLl9hZHZhbmNlKCk7XG4gICAgfVxuXG4gICAgLy8gQ29uc3VtZSB0aGUgYXR0cmlidXRlIHZhbHVlXG4gICAgbGV0IHZhbHVlID0gJyc7XG4gICAgY29uc3QgdmFsdWVUb2tlbnM6IEludGVycG9sYXRlZEF0dHJpYnV0ZVRva2VuW10gPSBbXTtcbiAgICBsZXQgdmFsdWVTdGFydFNwYW46IFBhcnNlU291cmNlU3BhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBsZXQgdmFsdWVFbmQ6IFBhcnNlTG9jYXRpb24gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLy8gTk9URTogV2UgbmVlZCB0byB1c2UgYSBuZXcgdmFyaWFibGUgYG5leHRUb2tlblR5cGVgIGhlcmUgdG8gaGlkZSB0aGUgYWN0dWFsIHR5cGUgb2ZcbiAgICAvLyBgX3BlZWsudHlwZWAgZnJvbSBUUy4gT3RoZXJ3aXNlIFRTIHdpbGwgbmFycm93IHRoZSB0eXBlIG9mIGBfcGVlay50eXBlYCBwcmV2ZW50aW5nIGl0IGZyb21cbiAgICAvLyBiZWluZyBhYmxlIHRvIGNvbnNpZGVyIGBBVFRSX1ZBTFVFX0lOVEVSUE9MQVRJT05gIGFzIGFuIG9wdGlvbi4gVGhpcyBpcyBiZWNhdXNlIFRTIGlzIG5vdFxuICAgIC8vIGFibGUgdG8gc2VlIHRoYXQgYF9hZHZhbmNlKClgIHdpbGwgYWN0dWFsbHkgbXV0YXRlIGBfcGVla2AuXG4gICAgY29uc3QgbmV4dFRva2VuVHlwZSA9IHRoaXMuX3BlZWsudHlwZSBhcyBUb2tlblR5cGU7XG4gICAgaWYgKG5leHRUb2tlblR5cGUgPT09IFRva2VuVHlwZS5BVFRSX1ZBTFVFX1RFWFQpIHtcbiAgICAgIHZhbHVlU3RhcnRTcGFuID0gdGhpcy5fcGVlay5zb3VyY2VTcGFuO1xuICAgICAgdmFsdWVFbmQgPSB0aGlzLl9wZWVrLnNvdXJjZVNwYW4uZW5kO1xuICAgICAgd2hpbGUgKFxuICAgICAgICB0aGlzLl9wZWVrLnR5cGUgPT09IFRva2VuVHlwZS5BVFRSX1ZBTFVFX1RFWFQgfHxcbiAgICAgICAgdGhpcy5fcGVlay50eXBlID09PSBUb2tlblR5cGUuQVRUUl9WQUxVRV9JTlRFUlBPTEFUSU9OIHx8XG4gICAgICAgIHRoaXMuX3BlZWsudHlwZSA9PT0gVG9rZW5UeXBlLkVOQ09ERURfRU5USVRZXG4gICAgICApIHtcbiAgICAgICAgY29uc3QgdmFsdWVUb2tlbiA9IHRoaXMuX2FkdmFuY2U8SW50ZXJwb2xhdGVkQXR0cmlidXRlVG9rZW4+KCk7XG4gICAgICAgIHZhbHVlVG9rZW5zLnB1c2godmFsdWVUb2tlbik7XG4gICAgICAgIGlmICh2YWx1ZVRva2VuLnR5cGUgPT09IFRva2VuVHlwZS5BVFRSX1ZBTFVFX0lOVEVSUE9MQVRJT04pIHtcbiAgICAgICAgICAvLyBGb3IgYmFja3dhcmQgY29tcGF0aWJpbGl0eSB3ZSBkZWNvZGUgSFRNTCBlbnRpdGllcyB0aGF0IGFwcGVhciBpbiBpbnRlcnBvbGF0aW9uXG4gICAgICAgICAgLy8gZXhwcmVzc2lvbnMuIFRoaXMgaXMgYXJndWFibHkgYSBidWcsIGJ1dCBpdCBjb3VsZCBiZSBhIGNvbnNpZGVyYWJsZSBicmVha2luZyBjaGFuZ2UgdG9cbiAgICAgICAgICAvLyBmaXggaXQuIEl0IHNob3VsZCBiZSBhZGRyZXNzZWQgaW4gYSBsYXJnZXIgcHJvamVjdCB0byByZWZhY3RvciB0aGUgZW50aXJlIHBhcnNlci9sZXhlclxuICAgICAgICAgIC8vIGNoYWluIGFmdGVyIFZpZXcgRW5naW5lIGhhcyBiZWVuIHJlbW92ZWQuXG4gICAgICAgICAgdmFsdWUgKz0gdmFsdWVUb2tlbi5wYXJ0cy5qb2luKCcnKS5yZXBsYWNlKC8mKFteO10rKTsvZywgZGVjb2RlRW50aXR5KTtcbiAgICAgICAgfSBlbHNlIGlmICh2YWx1ZVRva2VuLnR5cGUgPT09IFRva2VuVHlwZS5FTkNPREVEX0VOVElUWSkge1xuICAgICAgICAgIHZhbHVlICs9IHZhbHVlVG9rZW4ucGFydHNbMF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFsdWUgKz0gdmFsdWVUb2tlbi5wYXJ0cy5qb2luKCcnKTtcbiAgICAgICAgfVxuICAgICAgICB2YWx1ZUVuZCA9IGF0dHJFbmQgPSB2YWx1ZVRva2VuLnNvdXJjZVNwYW4uZW5kO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIENvbnN1bWUgYW55IHF1b3RlXG4gICAgaWYgKHRoaXMuX3BlZWsudHlwZSA9PT0gVG9rZW5UeXBlLkFUVFJfUVVPVEUpIHtcbiAgICAgIGNvbnN0IHF1b3RlVG9rZW4gPSB0aGlzLl9hZHZhbmNlPEF0dHJpYnV0ZVF1b3RlVG9rZW4+KCk7XG4gICAgICBhdHRyRW5kID0gcXVvdGVUb2tlbi5zb3VyY2VTcGFuLmVuZDtcbiAgICB9XG5cbiAgICBjb25zdCB2YWx1ZVNwYW4gPVxuICAgICAgdmFsdWVTdGFydFNwYW4gJiZcbiAgICAgIHZhbHVlRW5kICYmXG4gICAgICBuZXcgUGFyc2VTb3VyY2VTcGFuKHZhbHVlU3RhcnRTcGFuLnN0YXJ0LCB2YWx1ZUVuZCwgdmFsdWVTdGFydFNwYW4uZnVsbFN0YXJ0KTtcbiAgICByZXR1cm4gbmV3IGh0bWwuQXR0cmlidXRlKFxuICAgICAgZnVsbE5hbWUsXG4gICAgICB2YWx1ZSxcbiAgICAgIG5ldyBQYXJzZVNvdXJjZVNwYW4oYXR0ck5hbWUuc291cmNlU3Bhbi5zdGFydCwgYXR0ckVuZCwgYXR0ck5hbWUuc291cmNlU3Bhbi5mdWxsU3RhcnQpLFxuICAgICAgYXR0ck5hbWUuc291cmNlU3BhbixcbiAgICAgIHZhbHVlU3BhbixcbiAgICAgIHZhbHVlVG9rZW5zLmxlbmd0aCA+IDAgPyB2YWx1ZVRva2VucyA6IHVuZGVmaW5lZCxcbiAgICAgIHVuZGVmaW5lZCxcbiAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29uc3VtZUJsb2NrT3Blbih0b2tlbjogQmxvY2tPcGVuU3RhcnRUb2tlbikge1xuICAgIGNvbnN0IHBhcmFtZXRlcnM6IGh0bWwuQmxvY2tQYXJhbWV0ZXJbXSA9IFtdO1xuXG4gICAgd2hpbGUgKHRoaXMuX3BlZWsudHlwZSA9PT0gVG9rZW5UeXBlLkJMT0NLX1BBUkFNRVRFUikge1xuICAgICAgY29uc3QgcGFyYW1Ub2tlbiA9IHRoaXMuX2FkdmFuY2U8QmxvY2tQYXJhbWV0ZXJUb2tlbj4oKTtcbiAgICAgIHBhcmFtZXRlcnMucHVzaChuZXcgaHRtbC5CbG9ja1BhcmFtZXRlcihwYXJhbVRva2VuLnBhcnRzWzBdLCBwYXJhbVRva2VuLnNvdXJjZVNwYW4pKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fcGVlay50eXBlID09PSBUb2tlblR5cGUuQkxPQ0tfT1BFTl9FTkQpIHtcbiAgICAgIHRoaXMuX2FkdmFuY2UoKTtcbiAgICB9XG5cbiAgICBjb25zdCBlbmQgPSB0aGlzLl9wZWVrLnNvdXJjZVNwYW4uZnVsbFN0YXJ0O1xuICAgIGNvbnN0IHNwYW4gPSBuZXcgUGFyc2VTb3VyY2VTcGFuKHRva2VuLnNvdXJjZVNwYW4uc3RhcnQsIGVuZCwgdG9rZW4uc291cmNlU3Bhbi5mdWxsU3RhcnQpO1xuICAgIC8vIENyZWF0ZSBhIHNlcGFyYXRlIGBzdGFydFNwYW5gIGJlY2F1c2UgYHNwYW5gIHdpbGwgYmUgbW9kaWZpZWQgd2hlbiB0aGVyZSBpcyBhbiBgZW5kYCBzcGFuLlxuICAgIGNvbnN0IHN0YXJ0U3BhbiA9IG5ldyBQYXJzZVNvdXJjZVNwYW4odG9rZW4uc291cmNlU3Bhbi5zdGFydCwgZW5kLCB0b2tlbi5zb3VyY2VTcGFuLmZ1bGxTdGFydCk7XG4gICAgY29uc3QgYmxvY2sgPSBuZXcgaHRtbC5CbG9jayh0b2tlbi5wYXJ0c1swXSwgcGFyYW1ldGVycywgW10sIHNwYW4sIHRva2VuLnNvdXJjZVNwYW4sIHN0YXJ0U3Bhbik7XG4gICAgdGhpcy5fcHVzaENvbnRhaW5lcihibG9jaywgZmFsc2UpO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29uc3VtZUJsb2NrQ2xvc2UodG9rZW46IEJsb2NrQ2xvc2VUb2tlbikge1xuICAgIGlmICghdGhpcy5fcG9wQ29udGFpbmVyKG51bGwsIGh0bWwuQmxvY2ssIHRva2VuLnNvdXJjZVNwYW4pKSB7XG4gICAgICB0aGlzLmVycm9ycy5wdXNoKFxuICAgICAgICBUcmVlRXJyb3IuY3JlYXRlKFxuICAgICAgICAgIG51bGwsXG4gICAgICAgICAgdG9rZW4uc291cmNlU3BhbixcbiAgICAgICAgICBgVW5leHBlY3RlZCBjbG9zaW5nIGJsb2NrLiBUaGUgYmxvY2sgbWF5IGhhdmUgYmVlbiBjbG9zZWQgZWFybGllci4gYCArXG4gICAgICAgICAgICBgSWYgeW91IG1lYW50IHRvIHdyaXRlIHRoZSB9IGNoYXJhY3RlciwgeW91IHNob3VsZCB1c2UgdGhlIFwiJiMxMjU7XCIgYCArXG4gICAgICAgICAgICBgSFRNTCBlbnRpdHkgaW5zdGVhZC5gLFxuICAgICAgICApLFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9jb25zdW1lSW5jb21wbGV0ZUJsb2NrKHRva2VuOiBJbmNvbXBsZXRlQmxvY2tPcGVuVG9rZW4pIHtcbiAgICBjb25zdCBwYXJhbWV0ZXJzOiBodG1sLkJsb2NrUGFyYW1ldGVyW10gPSBbXTtcblxuICAgIHdoaWxlICh0aGlzLl9wZWVrLnR5cGUgPT09IFRva2VuVHlwZS5CTE9DS19QQVJBTUVURVIpIHtcbiAgICAgIGNvbnN0IHBhcmFtVG9rZW4gPSB0aGlzLl9hZHZhbmNlPEJsb2NrUGFyYW1ldGVyVG9rZW4+KCk7XG4gICAgICBwYXJhbWV0ZXJzLnB1c2gobmV3IGh0bWwuQmxvY2tQYXJhbWV0ZXIocGFyYW1Ub2tlbi5wYXJ0c1swXSwgcGFyYW1Ub2tlbi5zb3VyY2VTcGFuKSk7XG4gICAgfVxuXG4gICAgY29uc3QgZW5kID0gdGhpcy5fcGVlay5zb3VyY2VTcGFuLmZ1bGxTdGFydDtcbiAgICBjb25zdCBzcGFuID0gbmV3IFBhcnNlU291cmNlU3Bhbih0b2tlbi5zb3VyY2VTcGFuLnN0YXJ0LCBlbmQsIHRva2VuLnNvdXJjZVNwYW4uZnVsbFN0YXJ0KTtcbiAgICAvLyBDcmVhdGUgYSBzZXBhcmF0ZSBgc3RhcnRTcGFuYCBiZWNhdXNlIGBzcGFuYCB3aWxsIGJlIG1vZGlmaWVkIHdoZW4gdGhlcmUgaXMgYW4gYGVuZGAgc3Bhbi5cbiAgICBjb25zdCBzdGFydFNwYW4gPSBuZXcgUGFyc2VTb3VyY2VTcGFuKHRva2VuLnNvdXJjZVNwYW4uc3RhcnQsIGVuZCwgdG9rZW4uc291cmNlU3Bhbi5mdWxsU3RhcnQpO1xuICAgIGNvbnN0IGJsb2NrID0gbmV3IGh0bWwuQmxvY2sodG9rZW4ucGFydHNbMF0sIHBhcmFtZXRlcnMsIFtdLCBzcGFuLCB0b2tlbi5zb3VyY2VTcGFuLCBzdGFydFNwYW4pO1xuICAgIHRoaXMuX3B1c2hDb250YWluZXIoYmxvY2ssIGZhbHNlKTtcblxuICAgIC8vIEluY29tcGxldGUgYmxvY2tzIGRvbid0IGhhdmUgY2hpbGRyZW4gc28gd2UgY2xvc2UgdGhlbSBpbW1lZGlhdGVseSBhbmQgcmVwb3J0IGFuIGVycm9yLlxuICAgIHRoaXMuX3BvcENvbnRhaW5lcihudWxsLCBodG1sLkJsb2NrLCBudWxsKTtcblxuICAgIHRoaXMuZXJyb3JzLnB1c2goXG4gICAgICBUcmVlRXJyb3IuY3JlYXRlKFxuICAgICAgICB0b2tlbi5wYXJ0c1swXSxcbiAgICAgICAgc3BhbixcbiAgICAgICAgYEluY29tcGxldGUgYmxvY2sgXCIke3Rva2VuLnBhcnRzWzBdfVwiLiBJZiB5b3UgbWVhbnQgdG8gd3JpdGUgdGhlIEAgY2hhcmFjdGVyLCBgICtcbiAgICAgICAgICBgeW91IHNob3VsZCB1c2UgdGhlIFwiJiM2NDtcIiBIVE1MIGVudGl0eSBpbnN0ZWFkLmAsXG4gICAgICApLFxuICAgICk7XG4gIH1cblxuICBwcml2YXRlIF9jb25zdW1lTGV0KHN0YXJ0VG9rZW46IExldFN0YXJ0VG9rZW4pIHtcbiAgICBjb25zdCBuYW1lID0gc3RhcnRUb2tlbi5wYXJ0c1swXTtcbiAgICBsZXQgdmFsdWVUb2tlbjogTGV0VmFsdWVUb2tlbjtcbiAgICBsZXQgZW5kVG9rZW46IExldEVuZFRva2VuO1xuXG4gICAgaWYgKHRoaXMuX3BlZWsudHlwZSAhPT0gVG9rZW5UeXBlLkxFVF9WQUxVRSkge1xuICAgICAgdGhpcy5lcnJvcnMucHVzaChcbiAgICAgICAgVHJlZUVycm9yLmNyZWF0ZShcbiAgICAgICAgICBzdGFydFRva2VuLnBhcnRzWzBdLFxuICAgICAgICAgIHN0YXJ0VG9rZW4uc291cmNlU3BhbixcbiAgICAgICAgICBgSW52YWxpZCBAbGV0IGRlY2xhcmF0aW9uIFwiJHtuYW1lfVwiLiBEZWNsYXJhdGlvbiBtdXN0IGhhdmUgYSB2YWx1ZS5gLFxuICAgICAgICApLFxuICAgICAgKTtcbiAgICAgIHJldHVybjtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWVUb2tlbiA9IHRoaXMuX2FkdmFuY2UoKTtcbiAgICB9XG5cbiAgICAvLyBUeXBlIGNhc3QgaXMgbmVjZXNzYXJ5IGhlcmUgc2luY2UgVFMgbmFycm93ZWQgdGhlIHR5cGUgb2YgYHBlZWtgIGFib3ZlLlxuICAgIGlmICgodGhpcy5fcGVlayBhcyBUb2tlbikudHlwZSAhPT0gVG9rZW5UeXBlLkxFVF9FTkQpIHtcbiAgICAgIHRoaXMuZXJyb3JzLnB1c2goXG4gICAgICAgIFRyZWVFcnJvci5jcmVhdGUoXG4gICAgICAgICAgc3RhcnRUb2tlbi5wYXJ0c1swXSxcbiAgICAgICAgICBzdGFydFRva2VuLnNvdXJjZVNwYW4sXG4gICAgICAgICAgYFVudGVybWluYXRlZCBAbGV0IGRlY2xhcmF0aW9uIFwiJHtuYW1lfVwiLiBEZWNsYXJhdGlvbiBtdXN0IGJlIHRlcm1pbmF0ZWQgd2l0aCBhIHNlbWljb2xvbi5gLFxuICAgICAgICApLFxuICAgICAgKTtcbiAgICAgIHJldHVybjtcbiAgICB9IGVsc2Uge1xuICAgICAgZW5kVG9rZW4gPSB0aGlzLl9hZHZhbmNlKCk7XG4gICAgfVxuXG4gICAgY29uc3QgZW5kID0gZW5kVG9rZW4uc291cmNlU3Bhbi5mdWxsU3RhcnQ7XG4gICAgY29uc3Qgc3BhbiA9IG5ldyBQYXJzZVNvdXJjZVNwYW4oXG4gICAgICBzdGFydFRva2VuLnNvdXJjZVNwYW4uc3RhcnQsXG4gICAgICBlbmQsXG4gICAgICBzdGFydFRva2VuLnNvdXJjZVNwYW4uZnVsbFN0YXJ0LFxuICAgICk7XG5cbiAgICAvLyBUaGUgc3RhcnQgdG9rZW4gdXN1YWxseSBjYXB0dXJlcyB0aGUgYEBsZXRgLiBDb25zdHJ1Y3QgYSBuYW1lIHNwYW4gYnlcbiAgICAvLyBvZmZzZXR0aW5nIHRoZSBzdGFydCBieSB0aGUgbGVuZ3RoIG9mIGFueSB0ZXh0IGJlZm9yZSB0aGUgbmFtZS5cbiAgICBjb25zdCBzdGFydE9mZnNldCA9IHN0YXJ0VG9rZW4uc291cmNlU3Bhbi50b1N0cmluZygpLmxhc3RJbmRleE9mKG5hbWUpO1xuICAgIGNvbnN0IG5hbWVTdGFydCA9IHN0YXJ0VG9rZW4uc291cmNlU3Bhbi5zdGFydC5tb3ZlQnkoc3RhcnRPZmZzZXQpO1xuICAgIGNvbnN0IG5hbWVTcGFuID0gbmV3IFBhcnNlU291cmNlU3BhbihuYW1lU3RhcnQsIHN0YXJ0VG9rZW4uc291cmNlU3Bhbi5lbmQpO1xuICAgIGNvbnN0IG5vZGUgPSBuZXcgaHRtbC5MZXREZWNsYXJhdGlvbihcbiAgICAgIG5hbWUsXG4gICAgICB2YWx1ZVRva2VuLnBhcnRzWzBdLFxuICAgICAgc3BhbixcbiAgICAgIG5hbWVTcGFuLFxuICAgICAgdmFsdWVUb2tlbi5zb3VyY2VTcGFuLFxuICAgICk7XG5cbiAgICB0aGlzLl9hZGRUb1BhcmVudChub2RlKTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbnN1bWVJbmNvbXBsZXRlTGV0KHRva2VuOiBJbmNvbXBsZXRlTGV0VG9rZW4pIHtcbiAgICAvLyBJbmNvbXBsZXRlIGBAbGV0YCBkZWNsYXJhdGlvbiBtYXkgZW5kIHVwIHdpdGggYW4gZW1wdHkgbmFtZS5cbiAgICBjb25zdCBuYW1lID0gdG9rZW4ucGFydHNbMF0gPz8gJyc7XG4gICAgY29uc3QgbmFtZVN0cmluZyA9IG5hbWUgPyBgIFwiJHtuYW1lfVwiYCA6ICcnO1xuXG4gICAgLy8gSWYgdGhlcmUncyBhdCBsZWFzdCBhIG5hbWUsIHdlIGNhbiBzYWx2YWdlIGFuIEFTVCBub2RlIHRoYXQgY2FuIGJlIHVzZWQgZm9yIGNvbXBsZXRpb25zLlxuICAgIGlmIChuYW1lLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IHN0YXJ0T2Zmc2V0ID0gdG9rZW4uc291cmNlU3Bhbi50b1N0cmluZygpLmxhc3RJbmRleE9mKG5hbWUpO1xuICAgICAgY29uc3QgbmFtZVN0YXJ0ID0gdG9rZW4uc291cmNlU3Bhbi5zdGFydC5tb3ZlQnkoc3RhcnRPZmZzZXQpO1xuICAgICAgY29uc3QgbmFtZVNwYW4gPSBuZXcgUGFyc2VTb3VyY2VTcGFuKG5hbWVTdGFydCwgdG9rZW4uc291cmNlU3Bhbi5lbmQpO1xuICAgICAgY29uc3QgdmFsdWVTcGFuID0gbmV3IFBhcnNlU291cmNlU3BhbihcbiAgICAgICAgdG9rZW4uc291cmNlU3Bhbi5zdGFydCxcbiAgICAgICAgdG9rZW4uc291cmNlU3Bhbi5zdGFydC5tb3ZlQnkoMCksXG4gICAgICApO1xuICAgICAgY29uc3Qgbm9kZSA9IG5ldyBodG1sLkxldERlY2xhcmF0aW9uKG5hbWUsICcnLCB0b2tlbi5zb3VyY2VTcGFuLCBuYW1lU3BhbiwgdmFsdWVTcGFuKTtcbiAgICAgIHRoaXMuX2FkZFRvUGFyZW50KG5vZGUpO1xuICAgIH1cblxuICAgIHRoaXMuZXJyb3JzLnB1c2goXG4gICAgICBUcmVlRXJyb3IuY3JlYXRlKFxuICAgICAgICB0b2tlbi5wYXJ0c1swXSxcbiAgICAgICAgdG9rZW4uc291cmNlU3BhbixcbiAgICAgICAgYEluY29tcGxldGUgQGxldCBkZWNsYXJhdGlvbiR7bmFtZVN0cmluZ30uIGAgK1xuICAgICAgICAgIGBAbGV0IGRlY2xhcmF0aW9ucyBtdXN0IGJlIHdyaXR0ZW4gYXMgXFxgQGxldCA8bmFtZT4gPSA8dmFsdWU+O1xcYGAsXG4gICAgICApLFxuICAgICk7XG4gIH1cblxuICBwcml2YXRlIF9nZXRDb250YWluZXIoKTogTm9kZUNvbnRhaW5lciB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLl9jb250YWluZXJTdGFjay5sZW5ndGggPiAwXG4gICAgICA/IHRoaXMuX2NvbnRhaW5lclN0YWNrW3RoaXMuX2NvbnRhaW5lclN0YWNrLmxlbmd0aCAtIDFdXG4gICAgICA6IG51bGw7XG4gIH1cblxuICBwcml2YXRlIF9nZXRDbG9zZXN0UGFyZW50RWxlbWVudCgpOiBodG1sLkVsZW1lbnQgfCBudWxsIHtcbiAgICBmb3IgKGxldCBpID0gdGhpcy5fY29udGFpbmVyU3RhY2subGVuZ3RoIC0gMTsgaSA+IC0xOyBpLS0pIHtcbiAgICAgIGlmICh0aGlzLl9jb250YWluZXJTdGFja1tpXSBpbnN0YW5jZW9mIGh0bWwuRWxlbWVudCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fY29udGFpbmVyU3RhY2tbaV0gYXMgaHRtbC5FbGVtZW50O1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcHJpdmF0ZSBfYWRkVG9QYXJlbnQobm9kZTogaHRtbC5Ob2RlKSB7XG4gICAgY29uc3QgcGFyZW50ID0gdGhpcy5fZ2V0Q29udGFpbmVyKCk7XG5cbiAgICBpZiAocGFyZW50ID09PSBudWxsKSB7XG4gICAgICB0aGlzLnJvb3ROb2Rlcy5wdXNoKG5vZGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYXJlbnQuY2hpbGRyZW4ucHVzaChub2RlKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9nZXRFbGVtZW50RnVsbE5hbWUoXG4gICAgcHJlZml4OiBzdHJpbmcsXG4gICAgbG9jYWxOYW1lOiBzdHJpbmcsXG4gICAgcGFyZW50RWxlbWVudDogaHRtbC5FbGVtZW50IHwgbnVsbCxcbiAgKTogc3RyaW5nIHtcbiAgICBpZiAocHJlZml4ID09PSAnJykge1xuICAgICAgcHJlZml4ID0gdGhpcy5nZXRUYWdEZWZpbml0aW9uKGxvY2FsTmFtZSkuaW1wbGljaXROYW1lc3BhY2VQcmVmaXggfHwgJyc7XG4gICAgICBpZiAocHJlZml4ID09PSAnJyAmJiBwYXJlbnRFbGVtZW50ICE9IG51bGwpIHtcbiAgICAgICAgY29uc3QgcGFyZW50VGFnTmFtZSA9IHNwbGl0TnNOYW1lKHBhcmVudEVsZW1lbnQubmFtZSlbMV07XG4gICAgICAgIGNvbnN0IHBhcmVudFRhZ0RlZmluaXRpb24gPSB0aGlzLmdldFRhZ0RlZmluaXRpb24ocGFyZW50VGFnTmFtZSk7XG4gICAgICAgIGlmICghcGFyZW50VGFnRGVmaW5pdGlvbi5wcmV2ZW50TmFtZXNwYWNlSW5oZXJpdGFuY2UpIHtcbiAgICAgICAgICBwcmVmaXggPSBnZXROc1ByZWZpeChwYXJlbnRFbGVtZW50Lm5hbWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG1lcmdlTnNBbmROYW1lKHByZWZpeCwgbG9jYWxOYW1lKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBsYXN0T25TdGFjayhzdGFjazogYW55W10sIGVsZW1lbnQ6IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gc3RhY2subGVuZ3RoID4gMCAmJiBzdGFja1tzdGFjay5sZW5ndGggLSAxXSA9PT0gZWxlbWVudDtcbn1cblxuLyoqXG4gKiBEZWNvZGUgdGhlIGBlbnRpdHlgIHN0cmluZywgd2hpY2ggd2UgYmVsaWV2ZSBpcyB0aGUgY29udGVudHMgb2YgYW4gSFRNTCBlbnRpdHkuXG4gKlxuICogSWYgdGhlIHN0cmluZyBpcyBub3QgYWN0dWFsbHkgYSB2YWxpZC9rbm93biBlbnRpdHkgdGhlbiBqdXN0IHJldHVybiB0aGUgb3JpZ2luYWwgYG1hdGNoYCBzdHJpbmcuXG4gKi9cbmZ1bmN0aW9uIGRlY29kZUVudGl0eShtYXRjaDogc3RyaW5nLCBlbnRpdHk6IHN0cmluZyk6IHN0cmluZyB7XG4gIGlmIChOQU1FRF9FTlRJVElFU1tlbnRpdHldICE9PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gTkFNRURfRU5USVRJRVNbZW50aXR5XSB8fCBtYXRjaDtcbiAgfVxuICBpZiAoL14jeFthLWYwLTldKyQvaS50ZXN0KGVudGl0eSkpIHtcbiAgICByZXR1cm4gU3RyaW5nLmZyb21Db2RlUG9pbnQocGFyc2VJbnQoZW50aXR5LnNsaWNlKDIpLCAxNikpO1xuICB9XG4gIGlmICgvXiNcXGQrJC8udGVzdChlbnRpdHkpKSB7XG4gICAgcmV0dXJuIFN0cmluZy5mcm9tQ29kZVBvaW50KHBhcnNlSW50KGVudGl0eS5zbGljZSgxKSwgMTApKTtcbiAgfVxuICByZXR1cm4gbWF0Y2g7XG59XG4iXX0=