/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as chars from '../chars';
import { DEFAULT_INTERPOLATION_CONFIG } from '../ml_parser/interpolation_config';
import { AbsoluteSourceSpan, ASTWithSource, Binary, BindingPipe, Chain, Conditional, EmptyExpr, ExpressionBinding, FunctionCall, ImplicitReceiver, Interpolation, KeyedRead, KeyedWrite, LiteralArray, LiteralMap, LiteralPrimitive, MethodCall, NonNullAssert, ParserError, ParseSpan, PrefixNot, PropertyRead, PropertyWrite, Quote, RecursiveAstVisitor, SafeMethodCall, SafePropertyRead, ThisReceiver, Unary, VariableBinding } from './ast';
import { EOF, isIdentifier, isQuote, TokenType } from './lexer';
export class SplitInterpolation {
    constructor(strings, expressions, offsets) {
        this.strings = strings;
        this.expressions = expressions;
        this.offsets = offsets;
    }
}
export class TemplateBindingParseResult {
    constructor(templateBindings, warnings, errors) {
        this.templateBindings = templateBindings;
        this.warnings = warnings;
        this.errors = errors;
    }
}
export class Parser {
    constructor(_lexer) {
        this._lexer = _lexer;
        this.errors = [];
        this.simpleExpressionChecker = SimpleExpressionChecker;
    }
    parseAction(input, location, absoluteOffset, interpolationConfig = DEFAULT_INTERPOLATION_CONFIG) {
        this._checkNoInterpolation(input, location, interpolationConfig);
        const sourceToLex = this._stripComments(input);
        const tokens = this._lexer.tokenize(this._stripComments(input));
        const ast = new _ParseAST(input, location, absoluteOffset, tokens, sourceToLex.length, true, this.errors, input.length - sourceToLex.length)
            .parseChain();
        return new ASTWithSource(ast, input, location, absoluteOffset, this.errors);
    }
    parseBinding(input, location, absoluteOffset, interpolationConfig = DEFAULT_INTERPOLATION_CONFIG) {
        const ast = this._parseBindingAst(input, location, absoluteOffset, interpolationConfig);
        return new ASTWithSource(ast, input, location, absoluteOffset, this.errors);
    }
    checkSimpleExpression(ast) {
        const checker = new this.simpleExpressionChecker();
        ast.visit(checker);
        return checker.errors;
    }
    parseSimpleBinding(input, location, absoluteOffset, interpolationConfig = DEFAULT_INTERPOLATION_CONFIG) {
        const ast = this._parseBindingAst(input, location, absoluteOffset, interpolationConfig);
        const errors = this.checkSimpleExpression(ast);
        if (errors.length > 0) {
            this._reportError(`Host binding expression cannot contain ${errors.join(' ')}`, input, location);
        }
        return new ASTWithSource(ast, input, location, absoluteOffset, this.errors);
    }
    _reportError(message, input, errLocation, ctxLocation) {
        this.errors.push(new ParserError(message, input, errLocation, ctxLocation));
    }
    _parseBindingAst(input, location, absoluteOffset, interpolationConfig) {
        // Quotes expressions use 3rd-party expression language. We don't want to use
        // our lexer or parser for that, so we check for that ahead of time.
        const quote = this._parseQuote(input, location, absoluteOffset);
        if (quote != null) {
            return quote;
        }
        this._checkNoInterpolation(input, location, interpolationConfig);
        const sourceToLex = this._stripComments(input);
        const tokens = this._lexer.tokenize(sourceToLex);
        return new _ParseAST(input, location, absoluteOffset, tokens, sourceToLex.length, false, this.errors, input.length - sourceToLex.length)
            .parseChain();
    }
    _parseQuote(input, location, absoluteOffset) {
        if (input == null)
            return null;
        const prefixSeparatorIndex = input.indexOf(':');
        if (prefixSeparatorIndex == -1)
            return null;
        const prefix = input.substring(0, prefixSeparatorIndex).trim();
        if (!isIdentifier(prefix))
            return null;
        const uninterpretedExpression = input.substring(prefixSeparatorIndex + 1);
        const span = new ParseSpan(0, input.length);
        return new Quote(span, span.toAbsolute(absoluteOffset), prefix, uninterpretedExpression, location);
    }
    /**
     * Parse microsyntax template expression and return a list of bindings or
     * parsing errors in case the given expression is invalid.
     *
     * For example,
     * ```
     *   <div *ngFor="let item of items">
     *         ^      ^ absoluteValueOffset for `templateValue`
     *         absoluteKeyOffset for `templateKey`
     * ```
     * contains three bindings:
     * 1. ngFor -> null
     * 2. item -> NgForOfContext.$implicit
     * 3. ngForOf -> items
     *
     * This is apparent from the de-sugared template:
     * ```
     *   <ng-template ngFor let-item [ngForOf]="items">
     * ```
     *
     * @param templateKey name of directive, without the * prefix. For example: ngIf, ngFor
     * @param templateValue RHS of the microsyntax attribute
     * @param templateUrl template filename if it's external, component filename if it's inline
     * @param absoluteKeyOffset start of the `templateKey`
     * @param absoluteValueOffset start of the `templateValue`
     */
    parseTemplateBindings(templateKey, templateValue, templateUrl, absoluteKeyOffset, absoluteValueOffset) {
        const tokens = this._lexer.tokenize(templateValue);
        const parser = new _ParseAST(templateValue, templateUrl, absoluteValueOffset, tokens, templateValue.length, false /* parseAction */, this.errors, 0 /* relative offset */);
        return parser.parseTemplateBindings({
            source: templateKey,
            span: new AbsoluteSourceSpan(absoluteKeyOffset, absoluteKeyOffset + templateKey.length),
        });
    }
    parseInterpolation(input, location, absoluteOffset, interpolationConfig = DEFAULT_INTERPOLATION_CONFIG) {
        const { strings, expressions, offsets } = this.splitInterpolation(input, location, interpolationConfig);
        if (expressions.length === 0)
            return null;
        const expressionNodes = [];
        for (let i = 0; i < expressions.length; ++i) {
            const expressionText = expressions[i].text;
            const sourceToLex = this._stripComments(expressionText);
            const tokens = this._lexer.tokenize(sourceToLex);
            const ast = new _ParseAST(input, location, absoluteOffset, tokens, sourceToLex.length, false, this.errors, offsets[i] + (expressionText.length - sourceToLex.length))
                .parseChain();
            expressionNodes.push(ast);
        }
        return this.createInterpolationAst(strings.map(s => s.text), expressionNodes, input, location, absoluteOffset);
    }
    /**
     * Similar to `parseInterpolation`, but treats the provided string as a single expression
     * element that would normally appear within the interpolation prefix and suffix (`{{` and `}}`).
     * This is used for parsing the switch expression in ICUs.
     */
    parseInterpolationExpression(expression, location, absoluteOffset) {
        const sourceToLex = this._stripComments(expression);
        const tokens = this._lexer.tokenize(sourceToLex);
        const ast = new _ParseAST(expression, location, absoluteOffset, tokens, sourceToLex.length, 
        /* parseAction */ false, this.errors, 0)
            .parseChain();
        const strings = ['', '']; // The prefix and suffix strings are both empty
        return this.createInterpolationAst(strings, [ast], expression, location, absoluteOffset);
    }
    createInterpolationAst(strings, expressions, input, location, absoluteOffset) {
        const span = new ParseSpan(0, input.length);
        const interpolation = new Interpolation(span, span.toAbsolute(absoluteOffset), strings, expressions);
        return new ASTWithSource(interpolation, input, location, absoluteOffset, this.errors);
    }
    /**
     * Splits a string of text into "raw" text segments and expressions present in interpolations in
     * the string.
     * Returns `null` if there are no interpolations, otherwise a
     * `SplitInterpolation` with splits that look like
     *   <raw text> <expression> <raw text> ... <raw text> <expression> <raw text>
     */
    splitInterpolation(input, location, interpolationConfig = DEFAULT_INTERPOLATION_CONFIG) {
        const strings = [];
        const expressions = [];
        const offsets = [];
        let i = 0;
        let atInterpolation = false;
        let extendLastString = false;
        let { start: interpStart, end: interpEnd } = interpolationConfig;
        while (i < input.length) {
            if (!atInterpolation) {
                // parse until starting {{
                const start = i;
                i = input.indexOf(interpStart, i);
                if (i === -1) {
                    i = input.length;
                }
                const text = input.substring(start, i);
                strings.push({ text, start, end: i });
                atInterpolation = true;
            }
            else {
                // parse from starting {{ to ending }} while ignoring content inside quotes.
                const fullStart = i;
                const exprStart = fullStart + interpStart.length;
                const exprEnd = this._getInterpolationEndIndex(input, interpEnd, exprStart);
                if (exprEnd === -1) {
                    // Could not find the end of the interpolation; do not parse an expression.
                    // Instead we should extend the content on the last raw string.
                    atInterpolation = false;
                    extendLastString = true;
                    break;
                }
                const fullEnd = exprEnd + interpEnd.length;
                const text = input.substring(exprStart, exprEnd);
                if (text.trim().length === 0) {
                    this._reportError('Blank expressions are not allowed in interpolated strings', input, `at column ${i} in`, location);
                }
                expressions.push({ text, start: fullStart, end: fullEnd });
                offsets.push(exprStart);
                i = fullEnd;
                atInterpolation = false;
            }
        }
        if (!atInterpolation) {
            // If we are now at a text section, add the remaining content as a raw string.
            if (extendLastString) {
                const piece = strings[strings.length - 1];
                piece.text += input.substring(i);
                piece.end = input.length;
            }
            else {
                strings.push({ text: input.substring(i), start: i, end: input.length });
            }
        }
        return new SplitInterpolation(strings, expressions, offsets);
    }
    wrapLiteralPrimitive(input, location, absoluteOffset) {
        const span = new ParseSpan(0, input == null ? 0 : input.length);
        return new ASTWithSource(new LiteralPrimitive(span, span.toAbsolute(absoluteOffset), input), input, location, absoluteOffset, this.errors);
    }
    _stripComments(input) {
        const i = this._commentStart(input);
        return i != null ? input.substring(0, i).trim() : input;
    }
    _commentStart(input) {
        let outerQuote = null;
        for (let i = 0; i < input.length - 1; i++) {
            const char = input.charCodeAt(i);
            const nextChar = input.charCodeAt(i + 1);
            if (char === chars.$SLASH && nextChar == chars.$SLASH && outerQuote == null)
                return i;
            if (outerQuote === char) {
                outerQuote = null;
            }
            else if (outerQuote == null && isQuote(char)) {
                outerQuote = char;
            }
        }
        return null;
    }
    _checkNoInterpolation(input, location, { start, end }) {
        let startIndex = -1;
        let endIndex = -1;
        for (const charIndex of this._forEachUnquotedChar(input, 0)) {
            if (startIndex === -1) {
                if (input.startsWith(start)) {
                    startIndex = charIndex;
                }
            }
            else {
                endIndex = this._getInterpolationEndIndex(input, end, charIndex);
                if (endIndex > -1) {
                    break;
                }
            }
        }
        if (startIndex > -1 && endIndex > -1) {
            this._reportError(`Got interpolation (${start}${end}) where expression was expected`, input, `at column ${startIndex} in`, location);
        }
    }
    /**
     * Finds the index of the end of an interpolation expression
     * while ignoring comments and quoted content.
     */
    _getInterpolationEndIndex(input, expressionEnd, start) {
        for (const charIndex of this._forEachUnquotedChar(input, start)) {
            if (input.startsWith(expressionEnd, charIndex)) {
                return charIndex;
            }
            // Nothing else in the expression matters after we've
            // hit a comment so look directly for the end token.
            if (input.startsWith('//', charIndex)) {
                return input.indexOf(expressionEnd, charIndex);
            }
        }
        return -1;
    }
    /**
     * Generator used to iterate over the character indexes of a string that are outside of quotes.
     * @param input String to loop through.
     * @param start Index within the string at which to start.
     */
    *_forEachUnquotedChar(input, start) {
        let currentQuote = null;
        let escapeCount = 0;
        for (let i = start; i < input.length; i++) {
            const char = input[i];
            // Skip the characters inside quotes. Note that we only care about the outer-most
            // quotes matching up and we need to account for escape characters.
            if (isQuote(input.charCodeAt(i)) && (currentQuote === null || currentQuote === char) &&
                escapeCount % 2 === 0) {
                currentQuote = currentQuote === null ? char : null;
            }
            else if (currentQuote === null) {
                yield i;
            }
            escapeCount = char === '\\' ? escapeCount + 1 : 0;
        }
    }
}
export class IvyParser extends Parser {
    constructor() {
        super(...arguments);
        this.simpleExpressionChecker = IvySimpleExpressionChecker;
    }
}
/** Describes a stateful context an expression parser is in. */
var ParseContextFlags;
(function (ParseContextFlags) {
    ParseContextFlags[ParseContextFlags["None"] = 0] = "None";
    /**
     * A Writable context is one in which a value may be written to an lvalue.
     * For example, after we see a property access, we may expect a write to the
     * property via the "=" operator.
     *   prop
     *        ^ possible "=" after
     */
    ParseContextFlags[ParseContextFlags["Writable"] = 1] = "Writable";
})(ParseContextFlags || (ParseContextFlags = {}));
export class _ParseAST {
    constructor(input, location, absoluteOffset, tokens, inputLength, parseAction, errors, offset) {
        this.input = input;
        this.location = location;
        this.absoluteOffset = absoluteOffset;
        this.tokens = tokens;
        this.inputLength = inputLength;
        this.parseAction = parseAction;
        this.errors = errors;
        this.offset = offset;
        this.rparensExpected = 0;
        this.rbracketsExpected = 0;
        this.rbracesExpected = 0;
        this.context = ParseContextFlags.None;
        // Cache of expression start and input indeces to the absolute source span they map to, used to
        // prevent creating superfluous source spans in `sourceSpan`.
        // A serial of the expression start and input index is used for mapping because both are stateful
        // and may change for subsequent expressions visited by the parser.
        this.sourceSpanCache = new Map();
        this.index = 0;
    }
    peek(offset) {
        const i = this.index + offset;
        return i < this.tokens.length ? this.tokens[i] : EOF;
    }
    get next() {
        return this.peek(0);
    }
    /** Whether all the parser input has been processed. */
    get atEOF() {
        return this.index >= this.tokens.length;
    }
    /**
     * Index of the next token to be processed, or the end of the last token if all have been
     * processed.
     */
    get inputIndex() {
        return this.atEOF ? this.currentEndIndex : this.next.index + this.offset;
    }
    /**
     * End index of the last processed token, or the start of the first token if none have been
     * processed.
     */
    get currentEndIndex() {
        if (this.index > 0) {
            const curToken = this.peek(-1);
            return curToken.end + this.offset;
        }
        // No tokens have been processed yet; return the next token's start or the length of the input
        // if there is no token.
        if (this.tokens.length === 0) {
            return this.inputLength + this.offset;
        }
        return this.next.index + this.offset;
    }
    /**
     * Returns the absolute offset of the start of the current token.
     */
    get currentAbsoluteOffset() {
        return this.absoluteOffset + this.inputIndex;
    }
    /**
     * Retrieve a `ParseSpan` from `start` to the current position (or to `artificialEndIndex` if
     * provided).
     *
     * @param start Position from which the `ParseSpan` will start.
     * @param artificialEndIndex Optional ending index to be used if provided (and if greater than the
     *     natural ending index)
     */
    span(start, artificialEndIndex) {
        let endIndex = this.currentEndIndex;
        if (artificialEndIndex !== undefined && artificialEndIndex > this.currentEndIndex) {
            endIndex = artificialEndIndex;
        }
        // In some unusual parsing scenarios (like when certain tokens are missing and an `EmptyExpr` is
        // being created), the current token may already be advanced beyond the `currentEndIndex`. This
        // appears to be a deep-seated parser bug.
        //
        // As a workaround for now, swap the start and end indices to ensure a valid `ParseSpan`.
        // TODO(alxhub): fix the bug upstream in the parser state, and remove this workaround.
        if (start > endIndex) {
            const tmp = endIndex;
            endIndex = start;
            start = tmp;
        }
        return new ParseSpan(start, endIndex);
    }
    sourceSpan(start, artificialEndIndex) {
        const serial = `${start}@${this.inputIndex}:${artificialEndIndex}`;
        if (!this.sourceSpanCache.has(serial)) {
            this.sourceSpanCache.set(serial, this.span(start, artificialEndIndex).toAbsolute(this.absoluteOffset));
        }
        return this.sourceSpanCache.get(serial);
    }
    advance() {
        this.index++;
    }
    /**
     * Executes a callback in the provided context.
     */
    withContext(context, cb) {
        this.context |= context;
        const ret = cb();
        this.context ^= context;
        return ret;
    }
    consumeOptionalCharacter(code) {
        if (this.next.isCharacter(code)) {
            this.advance();
            return true;
        }
        else {
            return false;
        }
    }
    peekKeywordLet() {
        return this.next.isKeywordLet();
    }
    peekKeywordAs() {
        return this.next.isKeywordAs();
    }
    /**
     * Consumes an expected character, otherwise emits an error about the missing expected character
     * and skips over the token stream until reaching a recoverable point.
     *
     * See `this.error` and `this.skip` for more details.
     */
    expectCharacter(code) {
        if (this.consumeOptionalCharacter(code))
            return;
        this.error(`Missing expected ${String.fromCharCode(code)}`);
    }
    consumeOptionalOperator(op) {
        if (this.next.isOperator(op)) {
            this.advance();
            return true;
        }
        else {
            return false;
        }
    }
    expectOperator(operator) {
        if (this.consumeOptionalOperator(operator))
            return;
        this.error(`Missing expected operator ${operator}`);
    }
    prettyPrintToken(tok) {
        return tok === EOF ? 'end of input' : `token ${tok}`;
    }
    expectIdentifierOrKeyword() {
        const n = this.next;
        if (!n.isIdentifier() && !n.isKeyword()) {
            if (n.isPrivateIdentifier()) {
                this._reportErrorForPrivateIdentifier(n, 'expected identifier or keyword');
            }
            else {
                this.error(`Unexpected ${this.prettyPrintToken(n)}, expected identifier or keyword`);
            }
            return null;
        }
        this.advance();
        return n.toString();
    }
    expectIdentifierOrKeywordOrString() {
        const n = this.next;
        if (!n.isIdentifier() && !n.isKeyword() && !n.isString()) {
            if (n.isPrivateIdentifier()) {
                this._reportErrorForPrivateIdentifier(n, 'expected identifier, keyword or string');
            }
            else {
                this.error(`Unexpected ${this.prettyPrintToken(n)}, expected identifier, keyword, or string`);
            }
            return '';
        }
        this.advance();
        return n.toString();
    }
    parseChain() {
        const exprs = [];
        const start = this.inputIndex;
        while (this.index < this.tokens.length) {
            const expr = this.parsePipe();
            exprs.push(expr);
            if (this.consumeOptionalCharacter(chars.$SEMICOLON)) {
                if (!this.parseAction) {
                    this.error('Binding expression cannot contain chained expression');
                }
                while (this.consumeOptionalCharacter(chars.$SEMICOLON)) {
                } // read all semicolons
            }
            else if (this.index < this.tokens.length) {
                this.error(`Unexpected token '${this.next}'`);
            }
        }
        if (exprs.length == 0) {
            // We have no expressions so create an empty expression that spans the entire input length
            const artificialStart = this.offset;
            const artificialEnd = this.offset + this.inputLength;
            return new EmptyExpr(this.span(artificialStart, artificialEnd), this.sourceSpan(artificialStart, artificialEnd));
        }
        if (exprs.length == 1)
            return exprs[0];
        return new Chain(this.span(start), this.sourceSpan(start), exprs);
    }
    parsePipe() {
        const start = this.inputIndex;
        let result = this.parseExpression();
        if (this.consumeOptionalOperator('|')) {
            if (this.parseAction) {
                this.error('Cannot have a pipe in an action expression');
            }
            do {
                const nameStart = this.inputIndex;
                let nameId = this.expectIdentifierOrKeyword();
                let nameSpan;
                let fullSpanEnd = undefined;
                if (nameId !== null) {
                    nameSpan = this.sourceSpan(nameStart);
                }
                else {
                    // No valid identifier was found, so we'll assume an empty pipe name ('').
                    nameId = '';
                    // However, there may have been whitespace present between the pipe character and the next
                    // token in the sequence (or the end of input). We want to track this whitespace so that
                    // the `BindingPipe` we produce covers not just the pipe character, but any trailing
                    // whitespace beyond it. Another way of thinking about this is that the zero-length name
                    // is assumed to be at the end of any whitespace beyond the pipe character.
                    //
                    // Therefore, we push the end of the `ParseSpan` for this pipe all the way up to the
                    // beginning of the next token, or until the end of input if the next token is EOF.
                    fullSpanEnd = this.next.index !== -1 ? this.next.index : this.inputLength + this.offset;
                    // The `nameSpan` for an empty pipe name is zero-length at the end of any whitespace
                    // beyond the pipe character.
                    nameSpan = new ParseSpan(fullSpanEnd, fullSpanEnd).toAbsolute(this.absoluteOffset);
                }
                const args = [];
                while (this.consumeOptionalCharacter(chars.$COLON)) {
                    args.push(this.parseExpression());
                    // If there are additional expressions beyond the name, then the artificial end for the
                    // name is no longer relevant.
                }
                result = new BindingPipe(this.span(start), this.sourceSpan(start, fullSpanEnd), result, nameId, args, nameSpan);
            } while (this.consumeOptionalOperator('|'));
        }
        return result;
    }
    parseExpression() {
        return this.parseConditional();
    }
    parseConditional() {
        const start = this.inputIndex;
        const result = this.parseLogicalOr();
        if (this.consumeOptionalOperator('?')) {
            const yes = this.parsePipe();
            let no;
            if (!this.consumeOptionalCharacter(chars.$COLON)) {
                const end = this.inputIndex;
                const expression = this.input.substring(start, end);
                this.error(`Conditional expression ${expression} requires all 3 expressions`);
                no = new EmptyExpr(this.span(start), this.sourceSpan(start));
            }
            else {
                no = this.parsePipe();
            }
            return new Conditional(this.span(start), this.sourceSpan(start), result, yes, no);
        }
        else {
            return result;
        }
    }
    parseLogicalOr() {
        // '||'
        const start = this.inputIndex;
        let result = this.parseLogicalAnd();
        while (this.consumeOptionalOperator('||')) {
            const right = this.parseLogicalAnd();
            result = new Binary(this.span(start), this.sourceSpan(start), '||', result, right);
        }
        return result;
    }
    parseLogicalAnd() {
        // '&&'
        const start = this.inputIndex;
        let result = this.parseNullishCoalescing();
        while (this.consumeOptionalOperator('&&')) {
            const right = this.parseNullishCoalescing();
            result = new Binary(this.span(start), this.sourceSpan(start), '&&', result, right);
        }
        return result;
    }
    parseNullishCoalescing() {
        // '??'
        const start = this.inputIndex;
        let result = this.parseEquality();
        while (this.consumeOptionalOperator('??')) {
            const right = this.parseEquality();
            result = new Binary(this.span(start), this.sourceSpan(start), '??', result, right);
        }
        return result;
    }
    parseEquality() {
        // '==','!=','===','!=='
        const start = this.inputIndex;
        let result = this.parseRelational();
        while (this.next.type == TokenType.Operator) {
            const operator = this.next.strValue;
            switch (operator) {
                case '==':
                case '===':
                case '!=':
                case '!==':
                    this.advance();
                    const right = this.parseRelational();
                    result = new Binary(this.span(start), this.sourceSpan(start), operator, result, right);
                    continue;
            }
            break;
        }
        return result;
    }
    parseRelational() {
        // '<', '>', '<=', '>='
        const start = this.inputIndex;
        let result = this.parseAdditive();
        while (this.next.type == TokenType.Operator) {
            const operator = this.next.strValue;
            switch (operator) {
                case '<':
                case '>':
                case '<=':
                case '>=':
                    this.advance();
                    const right = this.parseAdditive();
                    result = new Binary(this.span(start), this.sourceSpan(start), operator, result, right);
                    continue;
            }
            break;
        }
        return result;
    }
    parseAdditive() {
        // '+', '-'
        const start = this.inputIndex;
        let result = this.parseMultiplicative();
        while (this.next.type == TokenType.Operator) {
            const operator = this.next.strValue;
            switch (operator) {
                case '+':
                case '-':
                    this.advance();
                    let right = this.parseMultiplicative();
                    result = new Binary(this.span(start), this.sourceSpan(start), operator, result, right);
                    continue;
            }
            break;
        }
        return result;
    }
    parseMultiplicative() {
        // '*', '%', '/'
        const start = this.inputIndex;
        let result = this.parsePrefix();
        while (this.next.type == TokenType.Operator) {
            const operator = this.next.strValue;
            switch (operator) {
                case '*':
                case '%':
                case '/':
                    this.advance();
                    let right = this.parsePrefix();
                    result = new Binary(this.span(start), this.sourceSpan(start), operator, result, right);
                    continue;
            }
            break;
        }
        return result;
    }
    parsePrefix() {
        if (this.next.type == TokenType.Operator) {
            const start = this.inputIndex;
            const operator = this.next.strValue;
            let result;
            switch (operator) {
                case '+':
                    this.advance();
                    result = this.parsePrefix();
                    return Unary.createPlus(this.span(start), this.sourceSpan(start), result);
                case '-':
                    this.advance();
                    result = this.parsePrefix();
                    return Unary.createMinus(this.span(start), this.sourceSpan(start), result);
                case '!':
                    this.advance();
                    result = this.parsePrefix();
                    return new PrefixNot(this.span(start), this.sourceSpan(start), result);
            }
        }
        return this.parseCallChain();
    }
    parseCallChain() {
        const start = this.inputIndex;
        let result = this.parsePrimary();
        while (true) {
            if (this.consumeOptionalCharacter(chars.$PERIOD)) {
                result = this.parseAccessMemberOrMethodCall(result, start, false);
            }
            else if (this.consumeOptionalOperator('?.')) {
                result = this.parseAccessMemberOrMethodCall(result, start, true);
            }
            else if (this.consumeOptionalCharacter(chars.$LBRACKET)) {
                this.withContext(ParseContextFlags.Writable, () => {
                    this.rbracketsExpected++;
                    const key = this.parsePipe();
                    if (key instanceof EmptyExpr) {
                        this.error(`Key access cannot be empty`);
                    }
                    this.rbracketsExpected--;
                    this.expectCharacter(chars.$RBRACKET);
                    if (this.consumeOptionalOperator('=')) {
                        const value = this.parseConditional();
                        result = new KeyedWrite(this.span(start), this.sourceSpan(start), result, key, value);
                    }
                    else {
                        result = new KeyedRead(this.span(start), this.sourceSpan(start), result, key);
                    }
                });
            }
            else if (this.consumeOptionalCharacter(chars.$LPAREN)) {
                this.rparensExpected++;
                const args = this.parseCallArguments();
                this.rparensExpected--;
                this.expectCharacter(chars.$RPAREN);
                result = new FunctionCall(this.span(start), this.sourceSpan(start), result, args);
            }
            else if (this.consumeOptionalOperator('!')) {
                result = new NonNullAssert(this.span(start), this.sourceSpan(start), result);
            }
            else {
                return result;
            }
        }
    }
    parsePrimary() {
        const start = this.inputIndex;
        if (this.consumeOptionalCharacter(chars.$LPAREN)) {
            this.rparensExpected++;
            const result = this.parsePipe();
            this.rparensExpected--;
            this.expectCharacter(chars.$RPAREN);
            return result;
        }
        else if (this.next.isKeywordNull()) {
            this.advance();
            return new LiteralPrimitive(this.span(start), this.sourceSpan(start), null);
        }
        else if (this.next.isKeywordUndefined()) {
            this.advance();
            return new LiteralPrimitive(this.span(start), this.sourceSpan(start), void 0);
        }
        else if (this.next.isKeywordTrue()) {
            this.advance();
            return new LiteralPrimitive(this.span(start), this.sourceSpan(start), true);
        }
        else if (this.next.isKeywordFalse()) {
            this.advance();
            return new LiteralPrimitive(this.span(start), this.sourceSpan(start), false);
        }
        else if (this.next.isKeywordThis()) {
            this.advance();
            return new ThisReceiver(this.span(start), this.sourceSpan(start));
        }
        else if (this.consumeOptionalCharacter(chars.$LBRACKET)) {
            this.rbracketsExpected++;
            const elements = this.parseExpressionList(chars.$RBRACKET);
            this.rbracketsExpected--;
            this.expectCharacter(chars.$RBRACKET);
            return new LiteralArray(this.span(start), this.sourceSpan(start), elements);
        }
        else if (this.next.isCharacter(chars.$LBRACE)) {
            return this.parseLiteralMap();
        }
        else if (this.next.isIdentifier()) {
            return this.parseAccessMemberOrMethodCall(new ImplicitReceiver(this.span(start), this.sourceSpan(start)), start, false);
        }
        else if (this.next.isNumber()) {
            const value = this.next.toNumber();
            this.advance();
            return new LiteralPrimitive(this.span(start), this.sourceSpan(start), value);
        }
        else if (this.next.isString()) {
            const literalValue = this.next.toString();
            this.advance();
            return new LiteralPrimitive(this.span(start), this.sourceSpan(start), literalValue);
        }
        else if (this.next.isPrivateIdentifier()) {
            this._reportErrorForPrivateIdentifier(this.next, null);
            return new EmptyExpr(this.span(start), this.sourceSpan(start));
        }
        else if (this.index >= this.tokens.length) {
            this.error(`Unexpected end of expression: ${this.input}`);
            return new EmptyExpr(this.span(start), this.sourceSpan(start));
        }
        else {
            this.error(`Unexpected token ${this.next}`);
            return new EmptyExpr(this.span(start), this.sourceSpan(start));
        }
    }
    parseExpressionList(terminator) {
        const result = [];
        do {
            if (!this.next.isCharacter(terminator)) {
                result.push(this.parsePipe());
            }
            else {
                break;
            }
        } while (this.consumeOptionalCharacter(chars.$COMMA));
        return result;
    }
    parseLiteralMap() {
        const keys = [];
        const values = [];
        const start = this.inputIndex;
        this.expectCharacter(chars.$LBRACE);
        if (!this.consumeOptionalCharacter(chars.$RBRACE)) {
            this.rbracesExpected++;
            do {
                const quoted = this.next.isString();
                const key = this.expectIdentifierOrKeywordOrString();
                keys.push({ key, quoted });
                this.expectCharacter(chars.$COLON);
                values.push(this.parsePipe());
            } while (this.consumeOptionalCharacter(chars.$COMMA));
            this.rbracesExpected--;
            this.expectCharacter(chars.$RBRACE);
        }
        return new LiteralMap(this.span(start), this.sourceSpan(start), keys, values);
    }
    parseAccessMemberOrMethodCall(receiver, start, isSafe = false) {
        const nameStart = this.inputIndex;
        const id = this.withContext(ParseContextFlags.Writable, () => {
            var _a;
            const id = (_a = this.expectIdentifierOrKeyword()) !== null && _a !== void 0 ? _a : '';
            if (id.length === 0) {
                this.error(`Expected identifier for property access`, receiver.span.end);
            }
            return id;
        });
        const nameSpan = this.sourceSpan(nameStart);
        if (this.consumeOptionalCharacter(chars.$LPAREN)) {
            const argumentStart = this.inputIndex;
            this.rparensExpected++;
            const args = this.parseCallArguments();
            const argumentSpan = this.span(argumentStart, this.inputIndex).toAbsolute(this.absoluteOffset);
            this.expectCharacter(chars.$RPAREN);
            this.rparensExpected--;
            const span = this.span(start);
            const sourceSpan = this.sourceSpan(start);
            return isSafe ?
                new SafeMethodCall(span, sourceSpan, nameSpan, receiver, id, args, argumentSpan) :
                new MethodCall(span, sourceSpan, nameSpan, receiver, id, args, argumentSpan);
        }
        else {
            if (isSafe) {
                if (this.consumeOptionalOperator('=')) {
                    this.error('The \'?.\' operator cannot be used in the assignment');
                    return new EmptyExpr(this.span(start), this.sourceSpan(start));
                }
                else {
                    return new SafePropertyRead(this.span(start), this.sourceSpan(start), nameSpan, receiver, id);
                }
            }
            else {
                if (this.consumeOptionalOperator('=')) {
                    if (!this.parseAction) {
                        this.error('Bindings cannot contain assignments');
                        return new EmptyExpr(this.span(start), this.sourceSpan(start));
                    }
                    const value = this.parseConditional();
                    return new PropertyWrite(this.span(start), this.sourceSpan(start), nameSpan, receiver, id, value);
                }
                else {
                    return new PropertyRead(this.span(start), this.sourceSpan(start), nameSpan, receiver, id);
                }
            }
        }
    }
    parseCallArguments() {
        if (this.next.isCharacter(chars.$RPAREN))
            return [];
        const positionals = [];
        do {
            positionals.push(this.parsePipe());
        } while (this.consumeOptionalCharacter(chars.$COMMA));
        return positionals;
    }
    /**
     * Parses an identifier, a keyword, a string with an optional `-` in between,
     * and returns the string along with its absolute source span.
     */
    expectTemplateBindingKey() {
        let result = '';
        let operatorFound = false;
        const start = this.currentAbsoluteOffset;
        do {
            result += this.expectIdentifierOrKeywordOrString();
            operatorFound = this.consumeOptionalOperator('-');
            if (operatorFound) {
                result += '-';
            }
        } while (operatorFound);
        return {
            source: result,
            span: new AbsoluteSourceSpan(start, start + result.length),
        };
    }
    /**
     * Parse microsyntax template expression and return a list of bindings or
     * parsing errors in case the given expression is invalid.
     *
     * For example,
     * ```
     *   <div *ngFor="let item of items; index as i; trackBy: func">
     * ```
     * contains five bindings:
     * 1. ngFor -> null
     * 2. item -> NgForOfContext.$implicit
     * 3. ngForOf -> items
     * 4. i -> NgForOfContext.index
     * 5. ngForTrackBy -> func
     *
     * For a full description of the microsyntax grammar, see
     * https://gist.github.com/mhevery/d3530294cff2e4a1b3fe15ff75d08855
     *
     * @param templateKey name of the microsyntax directive, like ngIf, ngFor,
     * without the *, along with its absolute span.
     */
    parseTemplateBindings(templateKey) {
        const bindings = [];
        // The first binding is for the template key itself
        // In *ngFor="let item of items", key = "ngFor", value = null
        // In *ngIf="cond | pipe", key = "ngIf", value = "cond | pipe"
        bindings.push(...this.parseDirectiveKeywordBindings(templateKey));
        while (this.index < this.tokens.length) {
            // If it starts with 'let', then this must be variable declaration
            const letBinding = this.parseLetBinding();
            if (letBinding) {
                bindings.push(letBinding);
            }
            else {
                // Two possible cases here, either `value "as" key` or
                // "directive-keyword expression". We don't know which case, but both
                // "value" and "directive-keyword" are template binding key, so consume
                // the key first.
                const key = this.expectTemplateBindingKey();
                // Peek at the next token, if it is "as" then this must be variable
                // declaration.
                const binding = this.parseAsBinding(key);
                if (binding) {
                    bindings.push(binding);
                }
                else {
                    // Otherwise the key must be a directive keyword, like "of". Transform
                    // the key to actual key. Eg. of -> ngForOf, trackBy -> ngForTrackBy
                    key.source =
                        templateKey.source + key.source.charAt(0).toUpperCase() + key.source.substring(1);
                    bindings.push(...this.parseDirectiveKeywordBindings(key));
                }
            }
            this.consumeStatementTerminator();
        }
        return new TemplateBindingParseResult(bindings, [] /* warnings */, this.errors);
    }
    /**
     * Parse a directive keyword, followed by a mandatory expression.
     * For example, "of items", "trackBy: func".
     * The bindings are: ngForOf -> items, ngForTrackBy -> func
     * There could be an optional "as" binding that follows the expression.
     * For example,
     * ```
     *   *ngFor="let item of items | slice:0:1 as collection".
     *                    ^^ ^^^^^^^^^^^^^^^^^ ^^^^^^^^^^^^^
     *               keyword    bound target   optional 'as' binding
     * ```
     *
     * @param key binding key, for example, ngFor, ngIf, ngForOf, along with its
     * absolute span.
     */
    parseDirectiveKeywordBindings(key) {
        const bindings = [];
        this.consumeOptionalCharacter(chars.$COLON); // trackBy: trackByFunction
        const value = this.getDirectiveBoundTarget();
        let spanEnd = this.currentAbsoluteOffset;
        // The binding could optionally be followed by "as". For example,
        // *ngIf="cond | pipe as x". In this case, the key in the "as" binding
        // is "x" and the value is the template key itself ("ngIf"). Note that the
        // 'key' in the current context now becomes the "value" in the next binding.
        const asBinding = this.parseAsBinding(key);
        if (!asBinding) {
            this.consumeStatementTerminator();
            spanEnd = this.currentAbsoluteOffset;
        }
        const sourceSpan = new AbsoluteSourceSpan(key.span.start, spanEnd);
        bindings.push(new ExpressionBinding(sourceSpan, key, value));
        if (asBinding) {
            bindings.push(asBinding);
        }
        return bindings;
    }
    /**
     * Return the expression AST for the bound target of a directive keyword
     * binding. For example,
     * ```
     *   *ngIf="condition | pipe"
     *          ^^^^^^^^^^^^^^^^ bound target for "ngIf"
     *   *ngFor="let item of items"
     *                       ^^^^^ bound target for "ngForOf"
     * ```
     */
    getDirectiveBoundTarget() {
        if (this.next === EOF || this.peekKeywordAs() || this.peekKeywordLet()) {
            return null;
        }
        const ast = this.parsePipe(); // example: "condition | async"
        const { start, end } = ast.span;
        const value = this.input.substring(start, end);
        return new ASTWithSource(ast, value, this.location, this.absoluteOffset + start, this.errors);
    }
    /**
     * Return the binding for a variable declared using `as`. Note that the order
     * of the key-value pair in this declaration is reversed. For example,
     * ```
     *   *ngFor="let item of items; index as i"
     *                              ^^^^^    ^
     *                              value    key
     * ```
     *
     * @param value name of the value in the declaration, "ngIf" in the example
     * above, along with its absolute span.
     */
    parseAsBinding(value) {
        if (!this.peekKeywordAs()) {
            return null;
        }
        this.advance(); // consume the 'as' keyword
        const key = this.expectTemplateBindingKey();
        this.consumeStatementTerminator();
        const sourceSpan = new AbsoluteSourceSpan(value.span.start, this.currentAbsoluteOffset);
        return new VariableBinding(sourceSpan, key, value);
    }
    /**
     * Return the binding for a variable declared using `let`. For example,
     * ```
     *   *ngFor="let item of items; let i=index;"
     *           ^^^^^^^^           ^^^^^^^^^^^
     * ```
     * In the first binding, `item` is bound to `NgForOfContext.$implicit`.
     * In the second binding, `i` is bound to `NgForOfContext.index`.
     */
    parseLetBinding() {
        if (!this.peekKeywordLet()) {
            return null;
        }
        const spanStart = this.currentAbsoluteOffset;
        this.advance(); // consume the 'let' keyword
        const key = this.expectTemplateBindingKey();
        let value = null;
        if (this.consumeOptionalOperator('=')) {
            value = this.expectTemplateBindingKey();
        }
        this.consumeStatementTerminator();
        const sourceSpan = new AbsoluteSourceSpan(spanStart, this.currentAbsoluteOffset);
        return new VariableBinding(sourceSpan, key, value);
    }
    /**
     * Consume the optional statement terminator: semicolon or comma.
     */
    consumeStatementTerminator() {
        this.consumeOptionalCharacter(chars.$SEMICOLON) || this.consumeOptionalCharacter(chars.$COMMA);
    }
    /**
     * Records an error and skips over the token stream until reaching a recoverable point. See
     * `this.skip` for more details on token skipping.
     */
    error(message, index = null) {
        this.errors.push(new ParserError(message, this.input, this.locationText(index), this.location));
        this.skip();
    }
    locationText(index = null) {
        if (index == null)
            index = this.index;
        return (index < this.tokens.length) ? `at column ${this.tokens[index].index + 1} in` :
            `at the end of the expression`;
    }
    /**
     * Records an error for an unexpected private identifier being discovered.
     * @param token Token representing a private identifier.
     * @param extraMessage Optional additional message being appended to the error.
     */
    _reportErrorForPrivateIdentifier(token, extraMessage) {
        let errorMessage = `Private identifiers are not supported. Unexpected private identifier: ${token}`;
        if (extraMessage !== null) {
            errorMessage += `, ${extraMessage}`;
        }
        this.error(errorMessage);
    }
    /**
     * Error recovery should skip tokens until it encounters a recovery point.
     *
     * The following are treated as unconditional recovery points:
     *   - end of input
     *   - ';' (parseChain() is always the root production, and it expects a ';')
     *   - '|' (since pipes may be chained and each pipe expression may be treated independently)
     *
     * The following are conditional recovery points:
     *   - ')', '}', ']' if one of calling productions is expecting one of these symbols
     *     - This allows skip() to recover from errors such as '(a.) + 1' allowing more of the AST to
     *       be retained (it doesn't skip any tokens as the ')' is retained because of the '(' begins
     *       an '(' <expr> ')' production).
     *       The recovery points of grouping symbols must be conditional as they must be skipped if
     *       none of the calling productions are not expecting the closing token else we will never
     *       make progress in the case of an extraneous group closing symbol (such as a stray ')').
     *       That is, we skip a closing symbol if we are not in a grouping production.
     *   - '=' in a `Writable` context
     *     - In this context, we are able to recover after seeing the `=` operator, which
     *       signals the presence of an independent rvalue expression following the `=` operator.
     *
     * If a production expects one of these token it increments the corresponding nesting count,
     * and then decrements it just prior to checking if the token is in the input.
     */
    skip() {
        let n = this.next;
        while (this.index < this.tokens.length && !n.isCharacter(chars.$SEMICOLON) &&
            !n.isOperator('|') && (this.rparensExpected <= 0 || !n.isCharacter(chars.$RPAREN)) &&
            (this.rbracesExpected <= 0 || !n.isCharacter(chars.$RBRACE)) &&
            (this.rbracketsExpected <= 0 || !n.isCharacter(chars.$RBRACKET)) &&
            (!(this.context & ParseContextFlags.Writable) || !n.isOperator('='))) {
            if (this.next.isError()) {
                this.errors.push(new ParserError(this.next.toString(), this.input, this.locationText(), this.location));
            }
            this.advance();
            n = this.next;
        }
    }
}
class SimpleExpressionChecker {
    constructor() {
        this.errors = [];
    }
    visitImplicitReceiver(ast, context) { }
    visitThisReceiver(ast, context) { }
    visitInterpolation(ast, context) { }
    visitLiteralPrimitive(ast, context) { }
    visitPropertyRead(ast, context) { }
    visitPropertyWrite(ast, context) { }
    visitSafePropertyRead(ast, context) { }
    visitMethodCall(ast, context) { }
    visitSafeMethodCall(ast, context) { }
    visitFunctionCall(ast, context) { }
    visitLiteralArray(ast, context) {
        this.visitAll(ast.expressions, context);
    }
    visitLiteralMap(ast, context) {
        this.visitAll(ast.values, context);
    }
    visitUnary(ast, context) { }
    visitBinary(ast, context) { }
    visitPrefixNot(ast, context) { }
    visitNonNullAssert(ast, context) { }
    visitConditional(ast, context) { }
    visitPipe(ast, context) {
        this.errors.push('pipes');
    }
    visitKeyedRead(ast, context) { }
    visitKeyedWrite(ast, context) { }
    visitAll(asts, context) {
        return asts.map(node => node.visit(this, context));
    }
    visitChain(ast, context) { }
    visitQuote(ast, context) { }
}
/**
 * This class implements SimpleExpressionChecker used in View Engine and performs more strict checks
 * to make sure host bindings do not contain pipes. In View Engine, having pipes in host bindings is
 * not supported as well, but in some cases (like `!(value | async)`) the error is not triggered at
 * compile time. In order to preserve View Engine behavior, more strict checks are introduced for
 * Ivy mode only.
 */
class IvySimpleExpressionChecker extends RecursiveAstVisitor {
    constructor() {
        super(...arguments);
        this.errors = [];
    }
    visitPipe() {
        this.errors.push('pipes');
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL2V4cHJlc3Npb25fcGFyc2VyL3BhcnNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEtBQUssS0FBSyxNQUFNLFVBQVUsQ0FBQztBQUNsQyxPQUFPLEVBQUMsNEJBQTRCLEVBQXNCLE1BQU0sbUNBQW1DLENBQUM7QUFFcEcsT0FBTyxFQUFDLGtCQUFrQixFQUFtQixhQUFhLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxpQkFBaUIsRUFBRSxZQUFZLEVBQUUsZ0JBQWdCLEVBQUUsYUFBYSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLFVBQVUsRUFBaUIsZ0JBQWdCLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUUsYUFBYSxFQUFFLEtBQUssRUFBRSxtQkFBbUIsRUFBRSxjQUFjLEVBQUUsZ0JBQWdCLEVBQThDLFlBQVksRUFBRSxLQUFLLEVBQUUsZUFBZSxFQUFDLE1BQU0sT0FBTyxDQUFDO0FBQzVmLE9BQU8sRUFBQyxHQUFHLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBZ0IsU0FBUyxFQUFDLE1BQU0sU0FBUyxDQUFDO0FBTzVFLE1BQU0sT0FBTyxrQkFBa0I7SUFDN0IsWUFDVyxPQUE2QixFQUFTLFdBQWlDLEVBQ3ZFLE9BQWlCO1FBRGpCLFlBQU8sR0FBUCxPQUFPLENBQXNCO1FBQVMsZ0JBQVcsR0FBWCxXQUFXLENBQXNCO1FBQ3ZFLFlBQU8sR0FBUCxPQUFPLENBQVU7SUFBRyxDQUFDO0NBQ2pDO0FBRUQsTUFBTSxPQUFPLDBCQUEwQjtJQUNyQyxZQUNXLGdCQUFtQyxFQUFTLFFBQWtCLEVBQzlELE1BQXFCO1FBRHJCLHFC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SUFFdkQsZ0JBQWdCLENBQUMsR0FBZ0IsRUFBRSxPQUFZLElBQUcsQ0FBQztJQUVuRCxTQUFTLENBQUMsR0FBZ0IsRUFBRSxPQUFZO1FBQ3RDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFFRCxjQUFjLENBQUMsR0FBYyxFQUFFLE9BQVksSUFBRyxDQUFDO0lBRS9DLGVBQWUsQ0FBQyxHQUFlLEVBQUUsT0FBWSxJQUFHLENBQUM7SUFFakQsUUFBUSxDQUFDLElBQVcsRUFBRSxPQUFZO1FBQ2hDLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDckQsQ0FBQztJQUVELFVBQVUsQ0FBQyxHQUFVLEVBQUUsT0FBWSxJQUFHLENBQUM7SUFFdkMsVUFBVSxDQUFDLEdBQVUsRUFBRSxPQUFZLElBQUcsQ0FBQztDQUN4QztBQUVEOzs7Ozs7R0FNRztBQUNILE1BQU0sMEJBQTJCLFNBQVEsbUJBQW1CO0lBQTVEOztRQUNFLFdBQU0sR0FBYSxFQUFFLENBQUM7SUFLeEIsQ0FBQztJQUhDLFNBQVM7UUFDUCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUM1QixDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgY2hhcnMgZnJvbSAnLi4vY2hhcnMnO1xuaW1wb3J0IHtERUZBVUxUX0lOVEVSUE9MQVRJT05fQ09ORklHLCBJbnRlcnBvbGF0aW9uQ29uZmlnfSBmcm9tICcuLi9tbF9wYXJzZXIvaW50ZXJwb2xhdGlvbl9jb25maWcnO1xuXG5pbXBvcnQge0Fic29sdXRlU291cmNlU3BhbiwgQVNULCBBc3RWaXNpdG9yLCBBU1RXaXRoU291cmNlLCBCaW5hcnksIEJpbmRpbmdQaXBlLCBDaGFpbiwgQ29uZGl0aW9uYWwsIEVtcHR5RXhwciwgRXhwcmVzc2lvbkJpbmRpbmcsIEZ1bmN0aW9uQ2FsbCwgSW1wbGljaXRSZWNlaXZlciwgSW50ZXJwb2xhdGlvbiwgS2V5ZWRSZWFkLCBLZXllZFdyaXRlLCBMaXRlcmFsQXJyYXksIExpdGVyYWxNYXAsIExpdGVyYWxNYXBLZXksIExpdGVyYWxQcmltaXRpdmUsIE1ldGhvZENhbGwsIE5vbk51bGxBc3NlcnQsIFBhcnNlckVycm9yLCBQYXJzZVNwYW4sIFByZWZpeE5vdCwgUHJvcGVydHlSZWFkLCBQcm9wZXJ0eVdyaXRlLCBRdW90ZSwgUmVjdXJzaXZlQXN0VmlzaXRvciwgU2FmZU1ldGhvZENhbGwsIFNhZmVQcm9wZXJ0eVJlYWQsIFRlbXBsYXRlQmluZGluZywgVGVtcGxhdGVCaW5kaW5nSWRlbnRpZmllciwgVGhpc1JlY2VpdmVyLCBVbmFyeSwgVmFyaWFibGVCaW5kaW5nfSBmcm9tICcuL2FzdCc7XG5pbXBvcnQge0VPRiwgaXNJZGVudGlmaWVyLCBpc1F1b3RlLCBMZXhlciwgVG9rZW4sIFRva2VuVHlwZX0gZnJvbSAnLi9sZXhlcic7XG5cbmV4cG9ydCBpbnRlcmZhY2UgSW50ZXJwb2xhdGlvblBpZWNlIHtcbiAgdGV4dDogc3RyaW5nO1xuICBzdGFydDogbnVtYmVyO1xuICBlbmQ6IG51bWJlcjtcbn1cbmV4cG9ydCBjbGFzcyBTcGxpdEludGVycG9sYXRpb24ge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyBzdHJpbmdzOiBJbnRlcnBvbGF0aW9uUGllY2VbXSwgcHVibGljIGV4cHJlc3Npb25zOiBJbnRlcnBvbGF0aW9uUGllY2VbXSxcbiAgICAgIHB1YmxpYyBvZmZzZXRzOiBudW1iZXJbXSkge31cbn1cblxuZXhwb3J0IGNsYXNzIFRlbXBsYXRlQmluZGluZ1BhcnNlUmVzdWx0IHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgdGVtcGxhdGVCaW5kaW5nczogVGVtcGxhdGVCaW5kaW5nW10sIHB1YmxpYyB3YXJuaW5nczogc3RyaW5nW10sXG4gICAgICBwdWJsaWMgZXJyb3JzOiBQYXJzZXJFcnJvcltdKSB7fVxufVxuXG5leHBvcnQgY2xhc3MgUGFyc2VyIHtcbiAgcHJpdmF0ZSBlcnJvcnM6IFBhcnNlckVycm9yW10gPSBbXTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9sZXhlcjogTGV4ZXIpIHt9XG5cbiAgc2ltcGxlRXhwcmVzc2lvbkNoZWNrZXIgPSBTaW1wbGVFeHByZXNzaW9uQ2hlY2tlcjtcblxuICBwYXJzZUFjdGlvbihcbiAgICAgIGlucHV0OiBzdHJpbmcsIGxvY2F0aW9uOiBzdHJpbmcsIGFic29sdXRlT2Zmc2V0OiBudW1iZXIsXG4gICAgICBpbnRlcnBvbGF0aW9uQ29uZmlnOiBJbnRlcnBvbGF0aW9uQ29uZmlnID0gREVGQVVMVF9JTlRFUlBPTEFUSU9OX0NPTkZJRyk6IEFTVFdpdGhTb3VyY2Uge1xuICAgIHRoaXMuX2NoZWNrTm9JbnRlcnBvbGF0aW9uKGlucHV0LCBsb2NhdGlvbiwgaW50ZXJwb2xhdGlvbkNvbmZpZyk7XG4gICAgY29uc3Qgc291cmNlVG9MZXggPSB0aGlzLl9zdHJpcENvbW1lbnRzKGlucHV0KTtcbiAgICBjb25zdCB0b2tlbnMgPSB0aGlzLl9sZXhlci50b2tlbml6ZSh0aGlzLl9zdHJpcENvbW1lbnRzKGlucHV0KSk7XG4gICAgY29uc3QgYXN0ID0gbmV3IF9QYXJzZUFTVChcbiAgICAgICAgICAgICAgICAgICAgaW5wdXQsIGxvY2F0aW9uLCBhYnNvbHV0ZU9mZnNldCwgdG9rZW5zLCBzb3VyY2VUb0xleC5sZW5ndGgsIHRydWUsIHRoaXMuZXJyb3JzLFxuICAgICAgICAgICAgICAgICAgICBpbnB1dC5sZW5ndGggLSBzb3VyY2VUb0xleC5sZW5ndGgpXG4gICAgICAgICAgICAgICAgICAgIC5wYXJzZUNoYWluKCk7XG4gICAgcmV0dXJuIG5ldyBBU1RXaXRoU291cmNlKGFzdCwgaW5wdXQsIGxvY2F0aW9uLCBhYnNvbHV0ZU9mZnNldCwgdGhpcy5lcnJvcnMpO1xuICB9XG5cbiAgcGFyc2VCaW5kaW5nKFxuICAgICAgaW5wdXQ6IHN0cmluZywgbG9jYXRpb246IHN0cmluZywgYWJzb2x1dGVPZmZzZXQ6IG51bWJlcixcbiAgICAgIGludGVycG9sYXRpb25Db25maWc6IEludGVycG9sYXRpb25Db25maWcgPSBERUZBVUxUX0lOVEVSUE9MQVRJT05fQ09ORklHKTogQVNUV2l0aFNvdXJjZSB7XG4gICAgY29uc3QgYXN0ID0gdGhpcy5fcGFyc2VCaW5kaW5nQXN0KGlucHV0LCBsb2NhdGlvbiwgYWJzb2x1dGVPZmZzZXQsIGludGVycG9sYXRpb25Db25maWcpO1xuICAgIHJldHVybiBuZXcgQVNUV2l0aFNvdXJjZShhc3QsIGlucHV0LCBsb2NhdGlvbiwgYWJzb2x1dGVPZmZzZXQsIHRoaXMuZXJyb3JzKTtcbiAgfVxuXG4gIHByaXZhdGUgY2hlY2tTaW1wbGVFeHByZXNzaW9uKGFzdDogQVNUKTogc3RyaW5nW10ge1xuICAgIGNvbnN0IGNoZWNrZXIgPSBuZXcgdGhpcy5zaW1wbGVFeHByZXNzaW9uQ2hlY2tlcigpO1xuICAgIGFzdC52aXNpdChjaGVja2VyKTtcbiAgICByZXR1cm4gY2hlY2tlci5lcnJvcnM7XG4gIH1cblxuICBwYXJzZVNpbXBsZUJpbmRpbmcoXG4gICAgICBpbnB1dDogc3RyaW5nLCBsb2NhdGlvbjogc3RyaW5nLCBhYnNvbHV0ZU9mZnNldDogbnVtYmVyLFxuICAgICAgaW50ZXJwb2xhdGlvbkNvbmZpZzogSW50ZXJwb2xhdGlvbkNvbmZpZyA9IERFRkFVTFRfSU5URVJQT0xBVElPTl9DT05GSUcpOiBBU1RXaXRoU291cmNlIHtcbiAgICBjb25zdCBhc3QgPSB0aGlzLl9wYXJzZUJpbmRpbmdBc3QoaW5wdXQsIGxvY2F0aW9uLCBhYnNvbHV0ZU9mZnNldCwgaW50ZXJwb2xhdGlvbkNvbmZpZyk7XG4gICAgY29uc3QgZXJyb3JzID0gdGhpcy5jaGVja1NpbXBsZUV4cHJlc3Npb24oYXN0KTtcbiAgICBpZiAoZXJyb3JzLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuX3JlcG9ydEVycm9yKFxuICAgICAgICAgIGBIb3N0IGJpbmRpbmcgZXhwcmVzc2lvbiBjYW5ub3QgY29udGFpbiAke2Vycm9ycy5qb2luKCcgJyl9YCwgaW5wdXQsIGxvY2F0aW9uKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBBU1RXaXRoU291cmNlKGFzdCwgaW5wdXQsIGxvY2F0aW9uLCBhYnNvbHV0ZU9mZnNldCwgdGhpcy5lcnJvcnMpO1xuICB9XG5cbiAgcHJpdmF0ZSBfcmVwb3J0RXJyb3IobWVzc2FnZTogc3RyaW5nLCBpbnB1dDogc3RyaW5nLCBlcnJMb2NhdGlvbjogc3RyaW5nLCBjdHhMb2NhdGlvbj86IHN0cmluZykge1xuICAgIHRoaXMuZXJyb3JzLnB1c2gobmV3IFBhcnNlckVycm9yKG1lc3NhZ2UsIGlucHV0LCBlcnJMb2NhdGlvbiwgY3R4TG9jYXRpb24pKTtcbiAgfVxuXG4gIHByaXZhdGUgX3BhcnNlQmluZGluZ0FzdChcbiAgICAgIGlucHV0OiBzdHJpbmcsIGxvY2F0aW9uOiBzdHJpbmcsIGFic29sdXRlT2Zmc2V0OiBudW1iZXIsXG4gICAgICBpbnRlcnBvbGF0aW9uQ29uZmlnOiBJbnRlcnBvbGF0aW9uQ29uZmlnKTogQVNUIHtcbiAgICAvLyBRdW90ZXMgZXhwcmVzc2lvbnMgdXNlIDNyZC1wYXJ0eSBleHByZXNzaW9uIGxhbmd1YWdlLiBXZSBkb24ndCB3YW50IHRvIHVzZVxuICAgIC8vIG91ciBsZXhlciBvciBwYXJzZXIgZm9yIHRoYXQsIHNvIHdlIGNoZWNrIGZvciB0aGF0IGFoZWFkIG9mIHRpbWUuXG4gICAgY29uc3QgcXVvdGUgPSB0aGlzLl9wYXJzZVF1b3RlKGlucHV0LCBsb2NhdGlvbiwgYWJzb2x1dGVPZmZzZXQpO1xuXG4gICAgaWYgKHF1b3RlICE9IG51bGwpIHtcbiAgICAgIHJldHVybiBxdW90ZTtcbiAgICB9XG5cbiAgICB0aGlzLl9jaGVja05vSW50ZXJwb2xhdGlvbihpbnB1dCwgbG9jYXRpb24sIGludGVycG9sYXRpb25Db25maWcpO1xuICAgIGNvbnN0IHNvdXJjZVRvTGV4ID0gdGhpcy5fc3RyaXBDb21tZW50cyhpbnB1dCk7XG4gICAgY29uc3QgdG9rZW5zID0gdGhpcy5fbGV4ZXIudG9rZW5pemUoc291cmNlVG9MZXgpO1xuICAgIHJldHVybiBuZXcgX1BhcnNlQVNUKFxuICAgICAgICAgICAgICAgaW5wdXQsIGxvY2F0aW9uLCBhYnNvbHV0ZU9mZnNldCwgdG9rZW5zLCBzb3VyY2VUb0xleC5sZW5ndGgsIGZhbHNlLCB0aGlzLmVycm9ycyxcbiAgICAgICAgICAgICAgIGlucHV0Lmxlbmd0aCAtIHNvdXJjZVRvTGV4Lmxlbmd0aClcbiAgICAgICAgLnBhcnNlQ2hhaW4oKTtcbiAgfVxuXG4gIHByaXZhdGUgX3BhcnNlUXVvdGUoaW5wdXQ6IHN0cmluZ3xudWxsLCBsb2NhdGlvbjogc3RyaW5nLCBhYnNvbHV0ZU9mZnNldDogbnVtYmVyKTogQVNUfG51bGwge1xuICAgIGlmIChpbnB1dCA9PSBudWxsKSByZXR1cm4gbnVsbDtcbiAgICBjb25zdCBwcmVmaXhTZXBhcmF0b3JJbmRleCA9IGlucHV0LmluZGV4T2YoJzonKTtcbiAgICBpZiAocHJlZml4U2VwYXJhdG9ySW5kZXggPT0gLTEpIHJldHVybiBudWxsO1xuICAgIGNvbnN0IHByZWZpeCA9IGlucHV0LnN1YnN0cmluZygwLCBwcmVmaXhTZXBhcmF0b3JJbmRleCkudHJpbSgpO1xuICAgIGlmICghaXNJZGVudGlmaWVyKHByZWZpeCkpIHJldHVybiBudWxsO1xuICAgIGNvbnN0IHVuaW50ZXJwcmV0ZWRFeHByZXNzaW9uID0gaW5wdXQuc3Vic3RyaW5nKHByZWZpeFNlcGFyYXRvckluZGV4ICsgMSk7XG4gICAgY29uc3Qgc3BhbiA9IG5ldyBQYXJzZVNwYW4oMCwgaW5wdXQubGVuZ3RoKTtcbiAgICByZXR1cm4gbmV3IFF1b3RlKFxuICAgICAgICBzcGFuLCBzcGFuLnRvQWJzb2x1dGUoYWJzb2x1dGVPZmZzZXQpLCBwcmVmaXgsIHVuaW50ZXJwcmV0ZWRFeHByZXNzaW9uLCBsb2NhdGlvbik7XG4gIH1cblxuICAvKipcbiAgICogUGFyc2UgbWljcm9zeW50YXggdGVtcGxhdGUgZXhwcmVzc2lvbiBhbmQgcmV0dXJuIGEgbGlzdCBvZiBiaW5kaW5ncyBvclxuICAgKiBwYXJzaW5nIGVycm9ycyBpbiBjYXNlIHRoZSBnaXZlbiBleHByZXNzaW9uIGlzIGludmFsaWQuXG4gICAqXG4gICAqIEZvciBleGFtcGxlLFxuICAgKiBgYGBcbiAgICogICA8ZGl2ICpuZ0Zvcj1cImxldCBpdGVtIG9mIGl0ZW1zXCI+XG4gICAqICAgICAgICAgXiAgICAgIF4gYWJzb2x1dGVWYWx1ZU9mZnNldCBmb3IgYHRlbXBsYXRlVmFsdWVgXG4gICAqICAgICAgICAgYWJzb2x1dGVLZXlPZmZzZXQgZm9yIGB0ZW1wbGF0ZUtleWBcbiAgICogYGBgXG4gICAqIGNvbnRhaW5zIHRocmVlIGJpbmRpbmdzOlxuICAgKiAxLiBuZ0ZvciAtPiBudWxsXG4gICAqIDIuIGl0ZW0gLT4gTmdGb3JPZkNvbnRleHQuJGltcGxpY2l0XG4gICAqIDMuIG5nRm9yT2YgLT4gaXRlbXNcbiAgICpcbiAgICogVGhpcyBpcyBhcHBhcmVudCBmcm9tIHRoZSBkZS1zdWdhcmVkIHRlbXBsYXRlOlxuICAgKiBgYGBcbiAgICogICA8bmctdGVtcGxhdGUgbmdGb3IgbGV0LWl0ZW0gW25nRm9yT2ZdPVwiaXRlbXNcIj5cbiAgICogYGBgXG4gICAqXG4gICAqIEBwYXJhbSB0ZW1wbGF0ZUtleSBuYW1lIG9mIGRpcmVjdGl2ZSwgd2l0aG91dCB0aGUgKiBwcmVmaXguIEZvciBleGFtcGxlOiBuZ0lmLCBuZ0ZvclxuICAgKiBAcGFyYW0gdGVtcGxhdGVWYWx1ZSBSSFMgb2YgdGhlIG1pY3Jvc3ludGF4IGF0dHJpYnV0ZVxuICAgKiBAcGFyYW0gdGVtcGxhdGVVcmwgdGVtcGxhdGUgZmlsZW5hbWUgaWYgaXQncyBleHRlcm5hbCwgY29tcG9uZW50IGZpbGVuYW1lIGlmIGl0J3MgaW5saW5lXG4gICAqIEBwYXJhbSBhYnNvbHV0ZUtleU9mZnNldCBzdGFydCBvZiB0aGUgYHRlbXBsYXRlS2V5YFxuICAgKiBAcGFyYW0gYWJzb2x1dGVWYWx1ZU9mZnNldCBzdGFydCBvZiB0aGUgYHRlbXBsYXRlVmFsdWVgXG4gICAqL1xuICBwYXJzZVRlbXBsYXRlQmluZGluZ3MoXG4gICAgICB0ZW1wbGF0ZUtleTogc3RyaW5nLCB0ZW1wbGF0ZVZhbHVlOiBzdHJpbmcsIHRlbXBsYXRlVXJsOiBzdHJpbmcsIGFic29sdXRlS2V5T2Zmc2V0OiBudW1iZXIsXG4gICAgICBhYnNvbHV0ZVZhbHVlT2Zmc2V0OiBudW1iZXIpOiBUZW1wbGF0ZUJpbmRpbmdQYXJzZVJlc3VsdCB7XG4gICAgY29uc3QgdG9rZW5zID0gdGhpcy5fbGV4ZXIudG9rZW5pemUodGVtcGxhdGVWYWx1ZSk7XG4gICAgY29uc3QgcGFyc2VyID0gbmV3IF9QYXJzZUFTVChcbiAgICAgICAgdGVtcGxhdGVWYWx1ZSwgdGVtcGxhdGVVcmwsIGFic29sdXRlVmFsdWVPZmZzZXQsIHRva2VucywgdGVtcGxhdGVWYWx1ZS5sZW5ndGgsXG4gICAgICAgIGZhbHNlIC8qIHBhcnNlQWN0aW9uICovLCB0aGlzLmVycm9ycywgMCAvKiByZWxhdGl2ZSBvZmZzZXQgKi8pO1xuICAgIHJldHVybiBwYXJzZXIucGFyc2VUZW1wbGF0ZUJpbmRpbmdzKHtcbiAgICAgIHNvdXJjZTogdGVtcGxhdGVLZXksXG4gICAgICBzcGFuOiBuZXcgQWJzb2x1dGVTb3VyY2VTcGFuKGFic29sdXRlS2V5T2Zmc2V0LCBhYnNvbHV0ZUtleU9mZnNldCArIHRlbXBsYXRlS2V5Lmxlbmd0aCksXG4gICAgfSk7XG4gIH1cblxuICBwYXJzZUludGVycG9sYXRpb24oXG4gICAgICBpbnB1dDogc3RyaW5nLCBsb2NhdGlvbjogc3RyaW5nLCBhYnNvbHV0ZU9mZnNldDogbnVtYmVyLFxuICAgICAgaW50ZXJwb2xhdGlvbkNvbmZpZzogSW50ZXJwb2xhdGlvbkNvbmZpZyA9IERFRkFVTFRfSU5URVJQT0xBVElPTl9DT05GSUcpOiBBU1RXaXRoU291cmNlfG51bGwge1xuICAgIGNvbnN0IHtzdHJpbmdzLCBleHByZXNzaW9ucywgb2Zmc2V0c30gPVxuICAgICAgICB0aGlzLnNwbGl0SW50ZXJwb2xhdGlvbihpbnB1dCwgbG9jYXRpb24sIGludGVycG9sYXRpb25Db25maWcpO1xuICAgIGlmIChleHByZXNzaW9ucy5sZW5ndGggPT09IDApIHJldHVybiBudWxsO1xuXG4gICAgY29uc3QgZXhwcmVzc2lvbk5vZGVzOiBBU1RbXSA9IFtdO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBleHByZXNzaW9ucy5sZW5ndGg7ICsraSkge1xuICAgICAgY29uc3QgZXhwcmVzc2lvblRleHQgPSBleHByZXNzaW9uc1tpXS50ZXh0O1xuICAgICAgY29uc3Qgc291cmNlVG9MZXggPSB0aGlzLl9zdHJpcENvbW1lbnRzKGV4cHJlc3Npb25UZXh0KTtcbiAgICAgIGNvbnN0IHRva2VucyA9IHRoaXMuX2xleGVyLnRva2VuaXplKHNvdXJjZVRvTGV4KTtcbiAgICAgIGNvbnN0IGFzdCA9IG5ldyBfUGFyc2VBU1QoXG4gICAgICAgICAgICAgICAgICAgICAgaW5wdXQsIGxvY2F0aW9uLCBhYnNvbHV0ZU9mZnNldCwgdG9rZW5zLCBzb3VyY2VUb0xleC5sZW5ndGgsIGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZXJyb3JzLCBvZmZzZXRzW2ldICsgKGV4cHJlc3Npb25UZXh0Lmxlbmd0aCAtIHNvdXJjZVRvTGV4Lmxlbmd0aCkpXG4gICAgICAgICAgICAgICAgICAgICAgLnBhcnNlQ2hhaW4oKTtcbiAgICAgIGV4cHJlc3Npb25Ob2Rlcy5wdXNoKGFzdCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuY3JlYXRlSW50ZXJwb2xhdGlvbkFzdChcbiAgICAgICAgc3RyaW5ncy5tYXAocyA9PiBzLnRleHQpLCBleHByZXNzaW9uTm9kZXMsIGlucHV0LCBsb2NhdGlvbiwgYWJzb2x1dGVPZmZzZXQpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNpbWlsYXIgdG8gYHBhcnNlSW50ZXJwb2xhdGlvbmAsIGJ1dCB0cmVhdHMgdGhlIHByb3ZpZGVkIHN0cmluZyBhcyBhIHNpbmdsZSBleHByZXNzaW9uXG4gICAqIGVsZW1lbnQgdGhhdCB3b3VsZCBub3JtYWxseSBhcHBlYXIgd2l0aGluIHRoZSBpbnRlcnBvbGF0aW9uIHByZWZpeCBhbmQgc3VmZml4IChge3tgIGFuZCBgfX1gKS5cbiAgICogVGhpcyBpcyB1c2VkIGZvciBwYXJzaW5nIHRoZSBzd2l0Y2ggZXhwcmVzc2lvbiBpbiBJQ1VzLlxuICAgKi9cbiAgcGFyc2VJbnRlcnBvbGF0aW9uRXhwcmVzc2lvbihleHByZXNzaW9uOiBzdHJpbmcsIGxvY2F0aW9uOiBzdHJpbmcsIGFic29sdXRlT2Zmc2V0OiBudW1iZXIpOlxuICAgICAgQVNUV2l0aFNvdXJjZSB7XG4gICAgY29uc3Qgc291cmNlVG9MZXggPSB0aGlzLl9zdHJpcENvbW1lbnRzKGV4cHJlc3Npb24pO1xuICAgIGNvbnN0IHRva2VucyA9IHRoaXMuX2xleGVyLnRva2VuaXplKHNvdXJjZVRvTGV4KTtcbiAgICBjb25zdCBhc3QgPSBuZXcgX1BhcnNlQVNUKFxuICAgICAgICAgICAgICAgICAgICBleHByZXNzaW9uLCBsb2NhdGlvbiwgYWJzb2x1dGVPZmZzZXQsIHRva2Vucywgc291cmNlVG9MZXgubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICAvKiBwYXJzZUFjdGlvbiAqLyBmYWxzZSwgdGhpcy5lcnJvcnMsIDApXG4gICAgICAgICAgICAgICAgICAgIC5wYXJzZUNoYWluKCk7XG4gICAgY29uc3Qgc3RyaW5ncyA9IFsnJywgJyddOyAgLy8gVGhlIHByZWZpeCBhbmQgc3VmZml4IHN0cmluZ3MgYXJlIGJvdGggZW1wdHlcbiAgICByZXR1cm4gdGhpcy5jcmVhdGVJbnRlcnBvbGF0aW9uQXN0KHN0cmluZ3MsIFthc3RdLCBleHByZXNzaW9uLCBsb2NhdGlvbiwgYWJzb2x1dGVPZmZzZXQpO1xuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVJbnRlcnBvbGF0aW9uQXN0KFxuICAgICAgc3RyaW5nczogc3RyaW5nW10sIGV4cHJlc3Npb25zOiBBU1RbXSwgaW5wdXQ6IHN0cmluZywgbG9jYXRpb246IHN0cmluZyxcbiAgICAgIGFic29sdXRlT2Zmc2V0OiBudW1iZXIpOiBBU1RXaXRoU291cmNlIHtcbiAgICBjb25zdCBzcGFuID0gbmV3IFBhcnNlU3BhbigwLCBpbnB1dC5sZW5ndGgpO1xuICAgIGNvbnN0IGludGVycG9sYXRpb24gPVxuICAgICAgICBuZXcgSW50ZXJwb2xhdGlvbihzcGFuLCBzcGFuLnRvQWJzb2x1dGUoYWJzb2x1dGVPZmZzZXQpLCBzdHJpbmdzLCBleHByZXNzaW9ucyk7XG4gICAgcmV0dXJuIG5ldyBBU1RXaXRoU291cmNlKGludGVycG9sYXRpb24sIGlucHV0LCBsb2NhdGlvbiwgYWJzb2x1dGVPZmZzZXQsIHRoaXMuZXJyb3JzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTcGxpdHMgYSBzdHJpbmcgb2YgdGV4dCBpbnRvIFwicmF3XCIgdGV4dCBzZWdtZW50cyBhbmQgZXhwcmVzc2lvbnMgcHJlc2VudCBpbiBpbnRlcnBvbGF0aW9ucyBpblxuICAgKiB0aGUgc3RyaW5nLlxuICAgKiBSZXR1cm5zIGBudWxsYCBpZiB0aGVyZSBhcmUgbm8gaW50ZXJwb2xhdGlvbnMsIG90aGVyd2lzZSBhXG4gICAqIGBTcGxpdEludGVycG9sYXRpb25gIHdpdGggc3BsaXRzIHRoYXQgbG9vayBsaWtlXG4gICAqICAgPHJhdyB0ZXh0PiA8ZXhwcmVzc2lvbj4gPHJhdyB0ZXh0PiAuLi4gPHJhdyB0ZXh0PiA8ZXhwcmVzc2lvbj4gPHJhdyB0ZXh0PlxuICAgKi9cbiAgc3BsaXRJbnRlcnBvbGF0aW9uKFxuICAgICAgaW5wdXQ6IHN0cmluZywgbG9jYXRpb246IHN0cmluZyxcbiAgICAgIGludGVycG9sYXRpb25Db25maWc6IEludGVycG9sYXRpb25Db25maWcgPSBERUZBVUxUX0lOVEVSUE9MQVRJT05fQ09ORklHKTogU3BsaXRJbnRlcnBvbGF0aW9uIHtcbiAgICBjb25zdCBzdHJpbmdzOiBJbnRlcnBvbGF0aW9uUGllY2VbXSA9IFtdO1xuICAgIGNvbnN0IGV4cHJlc3Npb25zOiBJbnRlcnBvbGF0aW9uUGllY2VbXSA9IFtdO1xuICAgIGNvbnN0IG9mZnNldHM6IG51bWJlcltdID0gW107XG4gICAgbGV0IGkgPSAwO1xuICAgIGxldCBhdEludGVycG9sYXRpb24gPSBmYWxzZTtcbiAgICBsZXQgZXh0ZW5kTGFzdFN0cmluZyA9IGZhbHNlO1xuICAgIGxldCB7c3RhcnQ6IGludGVycFN0YXJ0LCBlbmQ6IGludGVycEVuZH0gPSBpbnRlcnBvbGF0aW9uQ29uZmlnO1xuICAgIHdoaWxlIChpIDwgaW5wdXQubGVuZ3RoKSB7XG4gICAgICBpZiAoIWF0SW50ZXJwb2xhdGlvbikge1xuICAgICAgICAvLyBwYXJzZSB1bnRpbCBzdGFydGluZyB7e1xuICAgICAgICBjb25zdCBzdGFydCA9IGk7XG4gICAgICAgIGkgPSBpbnB1dC5pbmRleE9mKGludGVycFN0YXJ0LCBpKTtcbiAgICAgICAgaWYgKGkgPT09IC0xKSB7XG4gICAgICAgICAgaSA9IGlucHV0Lmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0ZXh0ID0gaW5wdXQuc3Vic3RyaW5nKHN0YXJ0LCBpKTtcbiAgICAgICAgc3RyaW5ncy5wdXNoKHt0ZXh0LCBzdGFydCwgZW5kOiBpfSk7XG5cbiAgICAgICAgYXRJbnRlcnBvbGF0aW9uID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIHBhcnNlIGZyb20gc3RhcnRpbmcge3sgdG8gZW5kaW5nIH19IHdoaWxlIGlnbm9yaW5nIGNvbnRlbnQgaW5zaWRlIHF1b3Rlcy5cbiAgICAgICAgY29uc3QgZnVsbFN0YXJ0ID0gaTtcbiAgICAgICAgY29uc3QgZXhwclN0YXJ0ID0gZnVsbFN0YXJ0ICsgaW50ZXJwU3RhcnQubGVuZ3RoO1xuICAgICAgICBjb25zdCBleHByRW5kID0gdGhpcy5fZ2V0SW50ZXJwb2xhdGlvbkVuZEluZGV4KGlucHV0LCBpbnRlcnBFbmQsIGV4cHJTdGFydCk7XG4gICAgICAgIGlmIChleHByRW5kID09PSAtMSkge1xuICAgICAgICAgIC8vIENvdWxkIG5vdCBmaW5kIHRoZSBlbmQgb2YgdGhlIGludGVycG9sYXRpb247IGRvIG5vdCBwYXJzZSBhbiBleHByZXNzaW9uLlxuICAgICAgICAgIC8vIEluc3RlYWQgd2Ugc2hvdWxkIGV4dGVuZCB0aGUgY29udGVudCBvbiB0aGUgbGFzdCByYXcgc3RyaW5nLlxuICAgICAgICAgIGF0SW50ZXJwb2xhdGlvbiA9IGZhbHNlO1xuICAgICAgICAgIGV4dGVuZExhc3RTdHJpbmcgPSB0cnVlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGZ1bGxFbmQgPSBleHByRW5kICsgaW50ZXJwRW5kLmxlbmd0aDtcblxuICAgICAgICBjb25zdCB0ZXh0ID0gaW5wdXQuc3Vic3RyaW5nKGV4cHJTdGFydCwgZXhwckVuZCk7XG4gICAgICAgIGlmICh0ZXh0LnRyaW0oKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICB0aGlzLl9yZXBvcnRFcnJvcihcbiAgICAgICAgICAgICAgJ0JsYW5rIGV4cHJlc3Npb25zIGFyZSBub3QgYWxsb3dlZCBpbiBpbnRlcnBvbGF0ZWQgc3RyaW5ncycsIGlucHV0LFxuICAgICAgICAgICAgICBgYXQgY29sdW1uICR7aX0gaW5gLCBsb2NhdGlvbik7XG4gICAgICAgIH1cbiAgICAgICAgZXhwcmVzc2lvbnMucHVzaCh7dGV4dCwgc3RhcnQ6IGZ1bGxTdGFydCwgZW5kOiBmdWxsRW5kfSk7XG4gICAgICAgIG9mZnNldHMucHVzaChleHByU3RhcnQpO1xuXG4gICAgICAgIGkgPSBmdWxsRW5kO1xuICAgICAgICBhdEludGVycG9sYXRpb24gPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKCFhdEludGVycG9sYXRpb24pIHtcbiAgICAgIC8vIElmIHdlIGFyZSBub3cgYXQgYSB0ZXh0IHNlY3Rpb24sIGFkZCB0aGUgcmVtYWluaW5nIGNvbnRlbnQgYXMgYSByYXcgc3RyaW5nLlxuICAgICAgaWYgKGV4dGVuZExhc3RTdHJpbmcpIHtcbiAgICAgICAgY29uc3QgcGllY2UgPSBzdHJpbmdzW3N0cmluZ3MubGVuZ3RoIC0gMV07XG4gICAgICAgIHBpZWNlLnRleHQgKz0gaW5wdXQuc3Vic3RyaW5nKGkpO1xuICAgICAgICBwaWVjZS5lbmQgPSBpbnB1dC5sZW5ndGg7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdHJpbmdzLnB1c2goe3RleHQ6IGlucHV0LnN1YnN0cmluZyhpKSwgc3RhcnQ6IGksIGVuZDogaW5wdXQubGVuZ3RofSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBuZXcgU3BsaXRJbnRlcnBvbGF0aW9uKHN0cmluZ3MsIGV4cHJlc3Npb25zLCBvZmZzZXRzKTtcbiAgfVxuXG4gIHdyYXBMaXRlcmFsUHJpbWl0aXZlKGlucHV0OiBzdHJpbmd8bnVsbCwgbG9jYXRpb246IHN0cmluZywgYWJzb2x1dGVPZmZzZXQ6IG51bWJlcik6XG4gICAgICBBU1RXaXRoU291cmNlIHtcbiAgICBjb25zdCBzcGFuID0gbmV3IFBhcnNlU3BhbigwLCBpbnB1dCA9PSBudWxsID8gMCA6IGlucHV0Lmxlbmd0aCk7XG4gICAgcmV0dXJuIG5ldyBBU1RXaXRoU291cmNlKFxuICAgICAgICBuZXcgTGl0ZXJhbFByaW1pdGl2ZShzcGFuLCBzcGFuLnRvQWJzb2x1dGUoYWJzb2x1dGVPZmZzZXQpLCBpbnB1dCksIGlucHV0LCBsb2NhdGlvbixcbiAgICAgICAgYWJzb2x1dGVPZmZzZXQsIHRoaXMuZXJyb3JzKTtcbiAgfVxuXG4gIHByaXZhdGUgX3N0cmlwQ29tbWVudHMoaW5wdXQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgY29uc3QgaSA9IHRoaXMuX2NvbW1lbnRTdGFydChpbnB1dCk7XG4gICAgcmV0dXJuIGkgIT0gbnVsbCA/IGlucHV0LnN1YnN0cmluZygwLCBpKS50cmltKCkgOiBpbnB1dDtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbW1lbnRTdGFydChpbnB1dDogc3RyaW5nKTogbnVtYmVyfG51bGwge1xuICAgIGxldCBvdXRlclF1b3RlOiBudW1iZXJ8bnVsbCA9IG51bGw7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnB1dC5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgIGNvbnN0IGNoYXIgPSBpbnB1dC5jaGFyQ29kZUF0KGkpO1xuICAgICAgY29uc3QgbmV4dENoYXIgPSBpbnB1dC5jaGFyQ29kZUF0KGkgKyAxKTtcblxuICAgICAgaWYgKGNoYXIgPT09IGNoYXJzLiRTTEFTSCAmJiBuZXh0Q2hhciA9PSBjaGFycy4kU0xBU0ggJiYgb3V0ZXJRdW90ZSA9PSBudWxsKSByZXR1cm4gaTtcblxuICAgICAgaWYgKG91dGVyUXVvdGUgPT09IGNoYXIpIHtcbiAgICAgICAgb3V0ZXJRdW90ZSA9IG51bGw7XG4gICAgICB9IGVsc2UgaWYgKG91dGVyUXVvdGUgPT0gbnVsbCAmJiBpc1F1b3RlKGNoYXIpKSB7XG4gICAgICAgIG91dGVyUXVvdGUgPSBjaGFyO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHByaXZhdGUgX2NoZWNrTm9JbnRlcnBvbGF0aW9uKGlucHV0OiBzdHJpbmcsIGxvY2F0aW9uOiBzdHJpbmcsIHtzdGFydCwgZW5kfTogSW50ZXJwb2xhdGlvbkNvbmZpZyk6XG4gICAgICB2b2lkIHtcbiAgICBsZXQgc3RhcnRJbmRleCA9IC0xO1xuICAgIGxldCBlbmRJbmRleCA9IC0xO1xuXG4gICAgZm9yIChjb25zdCBjaGFySW5kZXggb2YgdGhpcy5fZm9yRWFjaFVucXVvdGVkQ2hhcihpbnB1dCwgMCkpIHtcbiAgICAgIGlmIChzdGFydEluZGV4ID09PSAtMSkge1xuICAgICAgICBpZiAoaW5wdXQuc3RhcnRzV2l0aChzdGFydCkpIHtcbiAgICAgICAgICBzdGFydEluZGV4ID0gY2hhckluZGV4O1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlbmRJbmRleCA9IHRoaXMuX2dldEludGVycG9sYXRpb25FbmRJbmRleChpbnB1dCwgZW5kLCBjaGFySW5kZXgpO1xuICAgICAgICBpZiAoZW5kSW5kZXggPiAtMSkge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHN0YXJ0SW5kZXggPiAtMSAmJiBlbmRJbmRleCA+IC0xKSB7XG4gICAgICB0aGlzLl9yZXBvcnRFcnJvcihcbiAgICAgICAgICBgR290IGludGVycG9sYXRpb24gKCR7c3RhcnR9JHtlbmR9KSB3aGVyZSBleHByZXNzaW9uIHdhcyBleHBlY3RlZGAsIGlucHV0LFxuICAgICAgICAgIGBhdCBjb2x1bW4gJHtzdGFydEluZGV4fSBpbmAsIGxvY2F0aW9uKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRmluZHMgdGhlIGluZGV4IG9mIHRoZSBlbmQgb2YgYW4gaW50ZXJwb2xhdGlvbiBleHByZXNzaW9uXG4gICAqIHdoaWxlIGlnbm9yaW5nIGNvbW1lbnRzIGFuZCBxdW90ZWQgY29udGVudC5cbiAgICovXG4gIHByaXZhdGUgX2dldEludGVycG9sYXRpb25FbmRJbmRleChpbnB1dDogc3RyaW5nLCBleHByZXNzaW9uRW5kOiBzdHJpbmcsIHN0YXJ0OiBudW1iZXIpOiBudW1iZXIge1xuICAgIGZvciAoY29uc3QgY2hhckluZGV4IG9mIHRoaXMuX2ZvckVhY2hVbnF1b3RlZENoYXIoaW5wdXQsIHN0YXJ0KSkge1xuICAgICAgaWYgKGlucHV0LnN0YXJ0c1dpdGgoZXhwcmVzc2lvbkVuZCwgY2hhckluZGV4KSkge1xuICAgICAgICByZXR1cm4gY2hhckluZGV4O1xuICAgICAgfVxuXG4gICAgICAvLyBOb3RoaW5nIGVsc2UgaW4gdGhlIGV4cHJlc3Npb24gbWF0dGVycyBhZnRlciB3ZSd2ZVxuICAgICAgLy8gaGl0IGEgY29tbWVudCBzbyBsb29rIGRpcmVjdGx5IGZvciB0aGUgZW5kIHRva2VuLlxuICAgICAgaWYgKGlucHV0LnN0YXJ0c1dpdGgoJy8vJywgY2hhckluZGV4KSkge1xuICAgICAgICByZXR1cm4gaW5wdXQuaW5kZXhPZihleHByZXNzaW9uRW5kLCBjaGFySW5kZXgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiAtMTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0b3IgdXNlZCB0byBpdGVyYXRlIG92ZXIgdGhlIGNoYXJhY3RlciBpbmRleGVzIG9mIGEgc3RyaW5nIHRoYXQgYXJlIG91dHNpZGUgb2YgcXVvdGVzLlxuICAgKiBAcGFyYW0gaW5wdXQgU3RyaW5nIHRvIGxvb3AgdGhyb3VnaC5cbiAgICogQHBhcmFtIHN0YXJ0IEluZGV4IHdpdGhpbiB0aGUgc3RyaW5nIGF0IHdoaWNoIHRvIHN0YXJ0LlxuICAgKi9cbiAgcHJpdmF0ZSAqIF9mb3JFYWNoVW5xdW90ZWRDaGFyKGlucHV0OiBzdHJpbmcsIHN0YXJ0OiBudW1iZXIpIHtcbiAgICBsZXQgY3VycmVudFF1b3RlOiBzdHJpbmd8bnVsbCA9IG51bGw7XG4gICAgbGV0IGVzY2FwZUNvdW50ID0gMDtcbiAgICBmb3IgKGxldCBpID0gc3RhcnQ7IGkgPCBpbnB1dC5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgY2hhciA9IGlucHV0W2ldO1xuICAgICAgLy8gU2tpcCB0aGUgY2hhcmFjdGVycyBpbnNpZGUgcXVvdGVzLiBOb3RlIHRoYXQgd2Ugb25seSBjYXJlIGFib3V0IHRoZSBvdXRlci1tb3N0XG4gICAgICAvLyBxdW90ZXMgbWF0Y2hpbmcgdXAgYW5kIHdlIG5lZWQgdG8gYWNjb3VudCBmb3IgZXNjYXBlIGNoYXJhY3RlcnMuXG4gICAgICBpZiAoaXNRdW90ZShpbnB1dC5jaGFyQ29kZUF0KGkpKSAmJiAoY3VycmVudFF1b3RlID09PSBudWxsIHx8IGN1cnJlbnRRdW90ZSA9PT0gY2hhcikgJiZcbiAgICAgICAgICBlc2NhcGVDb3VudCAlIDIgPT09IDApIHtcbiAgICAgICAgY3VycmVudFF1b3RlID0gY3VycmVudFF1b3RlID09PSBudWxsID8gY2hhciA6IG51bGw7XG4gICAgICB9IGVsc2UgaWYgKGN1cnJlbnRRdW90ZSA9PT0gbnVsbCkge1xuICAgICAgICB5aWVsZCBpO1xuICAgICAgfVxuICAgICAgZXNjYXBlQ291bnQgPSBjaGFyID09PSAnXFxcXCcgPyBlc2NhcGVDb3VudCArIDEgOiAwO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgSXZ5UGFyc2VyIGV4dGVuZHMgUGFyc2VyIHtcbiAgc2ltcGxlRXhwcmVzc2lvbkNoZWNrZXIgPSBJdnlTaW1wbGVFeHByZXNzaW9uQ2hlY2tlcjtcbn1cblxuLyoqIERlc2NyaWJlcyBhIHN0YXRlZnVsIGNvbnRleHQgYW4gZXhwcmVzc2lvbiBwYXJzZXIgaXMgaW4uICovXG5lbnVtIFBhcnNlQ29udGV4dEZsYWdzIHtcbiAgTm9uZSA9IDAsXG4gIC8qKlxuICAgKiBBIFdyaXRhYmxlIGNvbnRleHQgaXMgb25lIGluIHdoaWNoIGEgdmFsdWUgbWF5IGJlIHdyaXR0ZW4gdG8gYW4gbHZhbHVlLlxuICAgKiBGb3IgZXhhbXBsZSwgYWZ0ZXIgd2Ugc2VlIGEgcHJvcGVydHkgYWNjZXNzLCB3ZSBtYXkgZXhwZWN0IGEgd3JpdGUgdG8gdGhlXG4gICAqIHByb3BlcnR5IHZpYSB0aGUgXCI9XCIgb3BlcmF0b3IuXG4gICAqICAgcHJvcFxuICAgKiAgICAgICAgXiBwb3NzaWJsZSBcIj1cIiBhZnRlclxuICAgKi9cbiAgV3JpdGFibGUgPSAxLFxufVxuXG5leHBvcnQgY2xhc3MgX1BhcnNlQVNUIHtcbiAgcHJpdmF0ZSBycGFyZW5zRXhwZWN0ZWQgPSAwO1xuICBwcml2YXRlIHJicmFja2V0c0V4cGVjdGVkID0gMDtcbiAgcHJpdmF0ZSByYnJhY2VzRXhwZWN0ZWQgPSAwO1xuICBwcml2YXRlIGNvbnRleHQgPSBQYXJzZUNvbnRleHRGbGFncy5Ob25lO1xuXG4gIC8vIENhY2hlIG9mIGV4cHJlc3Npb24gc3RhcnQgYW5kIGlucHV0IGluZGVjZXMgdG8gdGhlIGFic29sdXRlIHNvdXJjZSBzcGFuIHRoZXkgbWFwIHRvLCB1c2VkIHRvXG4gIC8vIHByZXZlbnQgY3JlYXRpbmcgc3VwZXJmbHVvdXMgc291cmNlIHNwYW5zIGluIGBzb3VyY2VTcGFuYC5cbiAgLy8gQSBzZXJpYWwgb2YgdGhlIGV4cHJlc3Npb24gc3RhcnQgYW5kIGlucHV0IGluZGV4IGlzIHVzZWQgZm9yIG1hcHBpbmcgYmVjYXVzZSBib3RoIGFyZSBzdGF0ZWZ1bFxuICAvLyBhbmQgbWF5IGNoYW5nZSBmb3Igc3Vic2VxdWVudCBleHByZXNzaW9ucyB2aXNpdGVkIGJ5IHRoZSBwYXJzZXIuXG4gIHByaXZhdGUgc291cmNlU3BhbkNhY2hlID0gbmV3IE1hcDxzdHJpbmcsIEFic29sdXRlU291cmNlU3Bhbj4oKTtcblxuICBpbmRleDogbnVtYmVyID0gMDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyBpbnB1dDogc3RyaW5nLCBwdWJsaWMgbG9jYXRpb246IHN0cmluZywgcHVibGljIGFic29sdXRlT2Zmc2V0OiBudW1iZXIsXG4gICAgICBwdWJsaWMgdG9rZW5zOiBUb2tlbltdLCBwdWJsaWMgaW5wdXRMZW5ndGg6IG51bWJlciwgcHVibGljIHBhcnNlQWN0aW9uOiBib29sZWFuLFxuICAgICAgcHJpdmF0ZSBlcnJvcnM6IFBhcnNlckVycm9yW10sIHByaXZhdGUgb2Zmc2V0OiBudW1iZXIpIHt9XG5cbiAgcGVlayhvZmZzZXQ6IG51bWJlcik6IFRva2VuIHtcbiAgICBjb25zdCBpID0gdGhpcy5pbmRleCArIG9mZnNldDtcbiAgICByZXR1cm4gaSA8IHRoaXMudG9rZW5zLmxlbmd0aCA/IHRoaXMudG9rZW5zW2ldIDogRU9GO1xuICB9XG5cbiAgZ2V0IG5leHQoKTogVG9rZW4ge1xuICAgIHJldHVybiB0aGlzLnBlZWsoMCk7XG4gIH1cblxuICAvKiogV2hldGhlciBhbGwgdGhlIHBhcnNlciBpbnB1dCBoYXMgYmVlbiBwcm9jZXNzZWQuICovXG4gIGdldCBhdEVPRigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5pbmRleCA+PSB0aGlzLnRva2Vucy5sZW5ndGg7XG4gIH1cblxuICAvKipcbiAgICogSW5kZXggb2YgdGhlIG5leHQgdG9rZW4gdG8gYmUgcHJvY2Vzc2VkLCBvciB0aGUgZW5kIG9mIHRoZSBsYXN0IHRva2VuIGlmIGFsbCBoYXZlIGJlZW5cbiAgICogcHJvY2Vzc2VkLlxuICAgKi9cbiAgZ2V0IGlucHV0SW5kZXgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5hdEVPRiA/IHRoaXMuY3VycmVudEVuZEluZGV4IDogdGhpcy5uZXh0LmluZGV4ICsgdGhpcy5vZmZzZXQ7XG4gIH1cblxuICAvKipcbiAgICogRW5kIGluZGV4IG9mIHRoZSBsYXN0IHByb2Nlc3NlZCB0b2tlbiwgb3IgdGhlIHN0YXJ0IG9mIHRoZSBmaXJzdCB0b2tlbiBpZiBub25lIGhhdmUgYmVlblxuICAgKiBwcm9jZXNzZWQuXG4gICAqL1xuICBnZXQgY3VycmVudEVuZEluZGV4KCk6IG51bWJlciB7XG4gICAgaWYgKHRoaXMuaW5kZXggPiAwKSB7XG4gICAgICBjb25zdCBjdXJUb2tlbiA9IHRoaXMucGVlaygtMSk7XG4gICAgICByZXR1cm4gY3VyVG9rZW4uZW5kICsgdGhpcy5vZmZzZXQ7XG4gICAgfVxuICAgIC8vIE5vIHRva2VucyBoYXZlIGJlZW4gcHJvY2Vzc2VkIHlldDsgcmV0dXJuIHRoZSBuZXh0IHRva2VuJ3Mgc3RhcnQgb3IgdGhlIGxlbmd0aCBvZiB0aGUgaW5wdXRcbiAgICAvLyBpZiB0aGVyZSBpcyBubyB0b2tlbi5cbiAgICBpZiAodGhpcy50b2tlbnMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gdGhpcy5pbnB1dExlbmd0aCArIHRoaXMub2Zmc2V0O1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5uZXh0LmluZGV4ICsgdGhpcy5vZmZzZXQ7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgYWJzb2x1dGUgb2Zmc2V0IG9mIHRoZSBzdGFydCBvZiB0aGUgY3VycmVudCB0b2tlbi5cbiAgICovXG4gIGdldCBjdXJyZW50QWJzb2x1dGVPZmZzZXQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5hYnNvbHV0ZU9mZnNldCArIHRoaXMuaW5wdXRJbmRleDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZSBhIGBQYXJzZVNwYW5gIGZyb20gYHN0YXJ0YCB0byB0aGUgY3VycmVudCBwb3NpdGlvbiAob3IgdG8gYGFydGlmaWNpYWxFbmRJbmRleGAgaWZcbiAgICogcHJvdmlkZWQpLlxuICAgKlxuICAgKiBAcGFyYW0gc3RhcnQgUG9zaXRpb24gZnJvbSB3aGljaCB0aGUgYFBhcnNlU3BhbmAgd2lsbCBzdGFydC5cbiAgICogQHBhcmFtIGFydGlmaWNpYWxFbmRJbmRleCBPcHRpb25hbCBlbmRpbmcgaW5kZXggdG8gYmUgdXNlZCBpZiBwcm92aWRlZCAoYW5kIGlmIGdyZWF0ZXIgdGhhbiB0aGVcbiAgICogICAgIG5hdHVyYWwgZW5kaW5nIGluZGV4KVxuICAgKi9cbiAgc3BhbihzdGFydDogbnVtYmVyLCBhcnRpZmljaWFsRW5kSW5kZXg/OiBudW1iZXIpOiBQYXJzZVNwYW4ge1xuICAgIGxldCBlbmRJbmRleCA9IHRoaXMuY3VycmVudEVuZEluZGV4O1xuICAgIGlmIChhcnRpZmljaWFsRW5kSW5kZXggIT09IHVuZGVmaW5lZCAmJiBhcnRpZmljaWFsRW5kSW5kZXggPiB0aGlzLmN1cnJlbnRFbmRJbmRleCkge1xuICAgICAgZW5kSW5kZXggPSBhcnRpZmljaWFsRW5kSW5kZXg7XG4gICAgfVxuXG4gICAgLy8gSW4gc29tZSB1bnVzdWFsIHBhcnNpbmcgc2NlbmFyaW9zIChsaWtlIHdoZW4gY2VydGFpbiB0b2tlbnMgYXJlIG1pc3NpbmcgYW5kIGFuIGBFbXB0eUV4cHJgIGlzXG4gICAgLy8gYmVpbmcgY3JlYXRlZCksIHRoZSBjdXJyZW50IHRva2VuIG1heSBhbHJlYWR5IGJlIGFkdmFuY2VkIGJleW9uZCB0aGUgYGN1cnJlbnRFbmRJbmRleGAuIFRoaXNcbiAgICAvLyBhcHBlYXJzIHRvIGJlIGEgZGVlcC1zZWF0ZWQgcGFyc2VyIGJ1Zy5cbiAgICAvL1xuICAgIC8vIEFzIGEgd29ya2Fyb3VuZCBmb3Igbm93LCBzd2FwIHRoZSBzdGFydCBhbmQgZW5kIGluZGljZXMgdG8gZW5zdXJlIGEgdmFsaWQgYFBhcnNlU3BhbmAuXG4gICAgLy8gVE9ETyhhbHhodWIpOiBmaXggdGhlIGJ1ZyB1cHN0cmVhbSBpbiB0aGUgcGFyc2VyIHN0YXRlLCBhbmQgcmVtb3ZlIHRoaXMgd29ya2Fyb3VuZC5cbiAgICBpZiAoc3RhcnQgPiBlbmRJbmRleCkge1xuICAgICAgY29uc3QgdG1wID0gZW5kSW5kZXg7XG4gICAgICBlbmRJbmRleCA9IHN0YXJ0O1xuICAgICAgc3RhcnQgPSB0bXA7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBQYXJzZVNwYW4oc3RhcnQsIGVuZEluZGV4KTtcbiAgfVxuXG4gIHNvdXJjZVNwYW4oc3RhcnQ6IG51bWJlciwgYXJ0aWZpY2lhbEVuZEluZGV4PzogbnVtYmVyKTogQWJzb2x1dGVTb3VyY2VTcGFuIHtcbiAgICBjb25zdCBzZXJpYWwgPSBgJHtzdGFydH1AJHt0aGlzLmlucHV0SW5kZXh9OiR7YXJ0aWZpY2lhbEVuZEluZGV4fWA7XG4gICAgaWYgKCF0aGlzLnNvdXJjZVNwYW5DYWNoZS5oYXMoc2VyaWFsKSkge1xuICAgICAgdGhpcy5zb3VyY2VTcGFuQ2FjaGUuc2V0KFxuICAgICAgICAgIHNlcmlhbCwgdGhpcy5zcGFuKHN0YXJ0LCBhcnRpZmljaWFsRW5kSW5kZXgpLnRvQWJzb2x1dGUodGhpcy5hYnNvbHV0ZU9mZnNldCkpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5zb3VyY2VTcGFuQ2FjaGUuZ2V0KHNlcmlhbCkhO1xuICB9XG5cbiAgYWR2YW5jZSgpIHtcbiAgICB0aGlzLmluZGV4Kys7XG4gIH1cblxuICAvKipcbiAgICogRXhlY3V0ZXMgYSBjYWxsYmFjayBpbiB0aGUgcHJvdmlkZWQgY29udGV4dC5cbiAgICovXG4gIHByaXZhdGUgd2l0aENvbnRleHQ8VD4oY29udGV4dDogUGFyc2VDb250ZXh0RmxhZ3MsIGNiOiAoKSA9PiBUKTogVCB7XG4gICAgdGhpcy5jb250ZXh0IHw9IGNvbnRleHQ7XG4gICAgY29uc3QgcmV0ID0gY2IoKTtcbiAgICB0aGlzLmNvbnRleHQgXj0gY29udGV4dDtcbiAgICByZXR1cm4gcmV0O1xuICB9XG5cbiAgY29uc3VtZU9wdGlvbmFsQ2hhcmFjdGVyKGNvZGU6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgIGlmICh0aGlzLm5leHQuaXNDaGFyYWN0ZXIoY29kZSkpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBwZWVrS2V5d29yZExldCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5uZXh0LmlzS2V5d29yZExldCgpO1xuICB9XG4gIHBlZWtLZXl3b3JkQXMoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMubmV4dC5pc0tleXdvcmRBcygpO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnN1bWVzIGFuIGV4cGVjdGVkIGNoYXJhY3Rlciwgb3RoZXJ3aXNlIGVtaXRzIGFuIGVycm9yIGFib3V0IHRoZSBtaXNzaW5nIGV4cGVjdGVkIGNoYXJhY3RlclxuICAgKiBhbmQgc2tpcHMgb3ZlciB0aGUgdG9rZW4gc3RyZWFtIHVudGlsIHJlYWNoaW5nIGEgcmVjb3ZlcmFibGUgcG9pbnQuXG4gICAqXG4gICAqIFNlZSBgdGhpcy5lcnJvcmAgYW5kIGB0aGlzLnNraXBgIGZvciBtb3JlIGRldGFpbHMuXG4gICAqL1xuICBleHBlY3RDaGFyYWN0ZXIoY29kZTogbnVtYmVyKSB7XG4gICAgaWYgKHRoaXMuY29uc3VtZU9wdGlvbmFsQ2hhcmFjdGVyKGNvZGUpKSByZXR1cm47XG4gICAgdGhpcy5lcnJvcihgTWlzc2luZyBleHBlY3RlZCAke1N0cmluZy5mcm9tQ2hhckNvZGUoY29kZSl9YCk7XG4gIH1cblxuICBjb25zdW1lT3B0aW9uYWxPcGVyYXRvcihvcDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMubmV4dC5pc09wZXJhdG9yKG9wKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGV4cGVjdE9wZXJhdG9yKG9wZXJhdG9yOiBzdHJpbmcpIHtcbiAgICBpZiAodGhpcy5jb25zdW1lT3B0aW9uYWxPcGVyYXRvcihvcGVyYXRvcikpIHJldHVybjtcbiAgICB0aGlzLmVycm9yKGBNaXNzaW5nIGV4cGVjdGVkIG9wZXJhdG9yICR7b3BlcmF0b3J9YCk7XG4gIH1cblxuICBwcmV0dHlQcmludFRva2VuKHRvazogVG9rZW4pOiBzdHJpbmcge1xuICAgIHJldHVybiB0b2sgPT09IEVPRiA/ICdlbmQgb2YgaW5wdXQnIDogYHRva2VuICR7dG9rfWA7XG4gIH1cblxuICBleHBlY3RJZGVudGlmaWVyT3JLZXl3b3JkKCk6IHN0cmluZ3xudWxsIHtcbiAgICBjb25zdCBuID0gdGhpcy5uZXh0O1xuICAgIGlmICghbi5pc0lkZW50aWZpZXIoKSAmJiAhbi5pc0tleXdvcmQoKSkge1xuICAgICAgaWYgKG4uaXNQcml2YXRlSWRlbnRpZmllcigpKSB7XG4gICAgICAgIHRoaXMuX3JlcG9ydEVycm9yRm9yUHJpdmF0ZUlkZW50aWZpZXIobiwgJ2V4cGVjdGVkIGlkZW50aWZpZXIgb3Iga2V5d29yZCcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5lcnJvcihgVW5leHBlY3RlZCAke3RoaXMucHJldHR5UHJpbnRUb2tlbihuKX0sIGV4cGVjdGVkIGlkZW50aWZpZXIgb3Iga2V5d29yZGApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgIHJldHVybiBuLnRvU3RyaW5nKCkgYXMgc3RyaW5nO1xuICB9XG5cbiAgZXhwZWN0SWRlbnRpZmllck9yS2V5d29yZE9yU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgY29uc3QgbiA9IHRoaXMubmV4dDtcbiAgICBpZiAoIW4uaXNJZGVudGlmaWVyKCkgJiYgIW4uaXNLZXl3b3JkKCkgJiYgIW4uaXNTdHJpbmcoKSkge1xuICAgICAgaWYgKG4uaXNQcml2YXRlSWRlbnRpZmllcigpKSB7XG4gICAgICAgIHRoaXMuX3JlcG9ydEVycm9yRm9yUHJpdmF0ZUlkZW50aWZpZXIobiwgJ2V4cGVjdGVkIGlkZW50aWZpZXIsIGtleXdvcmQgb3Igc3RyaW5nJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmVycm9yKFxuICAgICAgICAgICAgYFVuZXhwZWN0ZWQgJHt0aGlzLnByZXR0eVByaW50VG9rZW4obil9LCBleHBlY3RlZCBpZGVudGlmaWVyLCBrZXl3b3JkLCBvciBzdHJpbmdgKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiAnJztcbiAgICB9XG4gICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgcmV0dXJuIG4udG9TdHJpbmcoKSBhcyBzdHJpbmc7XG4gIH1cblxuICBwYXJzZUNoYWluKCk6IEFTVCB7XG4gICAgY29uc3QgZXhwcnM6IEFTVFtdID0gW107XG4gICAgY29uc3Qgc3RhcnQgPSB0aGlzLmlucHV0SW5kZXg7XG4gICAgd2hpbGUgKHRoaXMuaW5kZXggPCB0aGlzLnRva2Vucy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IGV4cHIgPSB0aGlzLnBhcnNlUGlwZSgpO1xuICAgICAgZXhwcnMucHVzaChleHByKTtcblxuICAgICAgaWYgKHRoaXMuY29uc3VtZU9wdGlvbmFsQ2hhcmFjdGVyKGNoYXJzLiRTRU1JQ09MT04pKSB7XG4gICAgICAgIGlmICghdGhpcy5wYXJzZUFjdGlvbikge1xuICAgICAgICAgIHRoaXMuZXJyb3IoJ0JpbmRpbmcgZXhwcmVzc2lvbiBjYW5ub3QgY29udGFpbiBjaGFpbmVkIGV4cHJlc3Npb24nKTtcbiAgICAgICAgfVxuICAgICAgICB3aGlsZSAodGhpcy5jb25zdW1lT3B0aW9uYWxDaGFyYWN0ZXIoY2hhcnMuJFNFTUlDT0xPTikpIHtcbiAgICAgICAgfSAgLy8gcmVhZCBhbGwgc2VtaWNvbG9uc1xuICAgICAgfSBlbHNlIGlmICh0aGlzLmluZGV4IDwgdGhpcy50b2tlbnMubGVuZ3RoKSB7XG4gICAgICAgIHRoaXMuZXJyb3IoYFVuZXhwZWN0ZWQgdG9rZW4gJyR7dGhpcy5uZXh0fSdgKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGV4cHJzLmxlbmd0aCA9PSAwKSB7XG4gICAgICAvLyBXZSBoYXZlIG5vIGV4cHJlc3Npb25zIHNvIGNyZWF0ZSBhbiBlbXB0eSBleHByZXNzaW9uIHRoYXQgc3BhbnMgdGhlIGVudGlyZSBpbnB1dCBsZW5ndGhcbiAgICAgIGNvbnN0IGFydGlmaWNpYWxTdGFydCA9IHRoaXMub2Zmc2V0O1xuICAgICAgY29uc3QgYXJ0aWZpY2lhbEVuZCA9IHRoaXMub2Zmc2V0ICsgdGhpcy5pbnB1dExlbmd0aDtcbiAgICAgIHJldHVybiBuZXcgRW1wdHlFeHByKFxuICAgICAgICAgIHRoaXMuc3BhbihhcnRpZmljaWFsU3RhcnQsIGFydGlmaWNpYWxFbmQpLFxuICAgICAgICAgIHRoaXMuc291cmNlU3BhbihhcnRpZmljaWFsU3RhcnQsIGFydGlmaWNpYWxFbmQpKTtcbiAgICB9XG4gICAgaWYgKGV4cHJzLmxlbmd0aCA9PSAxKSByZXR1cm4gZXhwcnNbMF07XG4gICAgcmV0dXJuIG5ldyBDaGFpbih0aGlzLnNwYW4oc3RhcnQpLCB0aGlzLnNvdXJjZVNwYW4oc3RhcnQpLCBleHBycyk7XG4gIH1cblxuICBwYXJzZVBpcGUoKTogQVNUIHtcbiAgICBjb25zdCBzdGFydCA9IHRoaXMuaW5wdXRJbmRleDtcbiAgICBsZXQgcmVzdWx0ID0gdGhpcy5wYXJzZUV4cHJlc3Npb24oKTtcbiAgICBpZiAodGhpcy5jb25zdW1lT3B0aW9uYWxPcGVyYXRvcignfCcpKSB7XG4gICAgICBpZiAodGhpcy5wYXJzZUFjdGlvbikge1xuICAgICAgICB0aGlzLmVycm9yKCdDYW5ub3QgaGF2ZSBhIHBpcGUgaW4gYW4gYWN0aW9uIGV4cHJlc3Npb24nKTtcbiAgICAgIH1cblxuICAgICAgZG8ge1xuICAgICAgICBjb25zdCBuYW1lU3RhcnQgPSB0aGlzLmlucHV0SW5kZXg7XG4gICAgICAgIGxldCBuYW1lSWQgPSB0aGlzLmV4cGVjdElkZW50aWZpZXJPcktleXdvcmQoKTtcbiAgICAgICAgbGV0IG5hbWVTcGFuOiBBYnNvbHV0ZVNvdXJjZVNwYW47XG4gICAgICAgIGxldCBmdWxsU3BhbkVuZDogbnVtYmVyfHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKG5hbWVJZCAhPT0gbnVsbCkge1xuICAgICAgICAgIG5hbWVTcGFuID0gdGhpcy5zb3VyY2VTcGFuKG5hbWVTdGFydCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gTm8gdmFsaWQgaWRlbnRpZmllciB3YXMgZm91bmQsIHNvIHdlJ2xsIGFzc3VtZSBhbiBlbXB0eSBwaXBlIG5hbWUgKCcnKS5cbiAgICAgICAgICBuYW1lSWQgPSAnJztcblxuICAgICAgICAgIC8vIEhvd2V2ZXIsIHRoZXJlIG1heSBoYXZlIGJlZW4gd2hpdGVzcGFjZSBwcmVzZW50IGJldHdlZW4gdGhlIHBpcGUgY2hhcmFjdGVyIGFuZCB0aGUgbmV4dFxuICAgICAgICAgIC8vIHRva2VuIGluIHRoZSBzZXF1ZW5jZSAob3IgdGhlIGVuZCBvZiBpbnB1dCkuIFdlIHdhbnQgdG8gdHJhY2sgdGhpcyB3aGl0ZXNwYWNlIHNvIHRoYXRcbiAgICAgICAgICAvLyB0aGUgYEJpbmRpbmdQaXBlYCB3ZSBwcm9kdWNlIGNvdmVycyBub3QganVzdCB0aGUgcGlwZSBjaGFyYWN0ZXIsIGJ1dCBhbnkgdHJhaWxpbmdcbiAgICAgICAgICAvLyB3aGl0ZXNwYWNlIGJleW9uZCBpdC4gQW5vdGhlciB3YXkgb2YgdGhpbmtpbmcgYWJvdXQgdGhpcyBpcyB0aGF0IHRoZSB6ZXJvLWxlbmd0aCBuYW1lXG4gICAgICAgICAgLy8gaXMgYXNzdW1lZCB0byBiZSBhdCB0aGUgZW5kIG9mIGFueSB3aGl0ZXNwYWNlIGJleW9uZCB0aGUgcGlwZSBjaGFyYWN0ZXIuXG4gICAgICAgICAgLy9cbiAgICAgICAgICAvLyBUaGVyZWZvcmUsIHdlIHB1c2ggdGhlIGVuZCBvZiB0aGUgYFBhcnNlU3BhbmAgZm9yIHRoaXMgcGlwZSBhbGwgdGhlIHdheSB1cCB0byB0aGVcbiAgICAgICAgICAvLyBiZWdpbm5pbmcgb2YgdGhlIG5leHQgdG9rZW4sIG9yIHVudGlsIHRoZSBlbmQgb2YgaW5wdXQgaWYgdGhlIG5leHQgdG9rZW4gaXMgRU9GLlxuICAgICAgICAgIGZ1bGxTcGFuRW5kID0gdGhpcy5uZXh0LmluZGV4ICE9PSAtMSA/IHRoaXMubmV4dC5pbmRleCA6IHRoaXMuaW5wdXRMZW5ndGggKyB0aGlzLm9mZnNldDtcblxuICAgICAgICAgIC8vIFRoZSBgbmFtZVNwYW5gIGZvciBhbiBlbXB0eSBwaXBlIG5hbWUgaXMgemVyby1sZW5ndGggYXQgdGhlIGVuZCBvZiBhbnkgd2hpdGVzcGFjZVxuICAgICAgICAgIC8vIGJleW9uZCB0aGUgcGlwZSBjaGFyYWN0ZXIuXG4gICAgICAgICAgbmFtZVNwYW4gPSBuZXcgUGFyc2VTcGFuKGZ1bGxTcGFuRW5kLCBmdWxsU3BhbkVuZCkudG9BYnNvbHV0ZSh0aGlzLmFic29sdXRlT2Zmc2V0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGFyZ3M6IEFTVFtdID0gW107XG4gICAgICAgIHdoaWxlICh0aGlzLmNvbnN1bWVPcHRpb25hbENoYXJhY3RlcihjaGFycy4kQ09MT04pKSB7XG4gICAgICAgICAgYXJncy5wdXNoKHRoaXMucGFyc2VFeHByZXNzaW9uKCkpO1xuXG4gICAgICAgICAgLy8gSWYgdGhlcmUgYXJlIGFkZGl0aW9uYWwgZXhwcmVzc2lvbnMgYmV5b25kIHRoZSBuYW1lLCB0aGVuIHRoZSBhcnRpZmljaWFsIGVuZCBmb3IgdGhlXG4gICAgICAgICAgLy8gbmFtZSBpcyBubyBsb25nZXIgcmVsZXZhbnQuXG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0ID0gbmV3IEJpbmRpbmdQaXBlKFxuICAgICAgICAgICAgdGhpcy5zcGFuKHN0YXJ0KSwgdGhpcy5zb3VyY2VTcGFuKHN0YXJ0LCBmdWxsU3BhbkVuZCksIHJlc3VsdCwgbmFtZUlkLCBhcmdzLCBuYW1lU3Bhbik7XG4gICAgICB9IHdoaWxlICh0aGlzLmNvbnN1bWVPcHRpb25hbE9wZXJhdG9yKCd8JykpO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBwYXJzZUV4cHJlc3Npb24oKTogQVNUIHtcbiAgICByZXR1cm4gdGhpcy5wYXJzZUNvbmRpdGlvbmFsKCk7XG4gIH1cblxuICBwYXJzZUNvbmRpdGlvbmFsKCk6IEFTVCB7XG4gICAgY29uc3Qgc3RhcnQgPSB0aGlzLmlucHV0SW5kZXg7XG4gICAgY29uc3QgcmVzdWx0ID0gdGhpcy5wYXJzZUxvZ2ljYWxPcigpO1xuXG4gICAgaWYgKHRoaXMuY29uc3VtZU9wdGlvbmFsT3BlcmF0b3IoJz8nKSkge1xuICAgICAgY29uc3QgeWVzID0gdGhpcy5wYXJzZVBpcGUoKTtcbiAgICAgIGxldCBubzogQVNUO1xuICAgICAgaWYgKCF0aGlzLmNvbnN1bWVPcHRpb25hbENoYXJhY3RlcihjaGFycy4kQ09MT04pKSB7XG4gICAgICAgIGNvbnN0IGVuZCA9IHRoaXMuaW5wdXRJbmRleDtcbiAgICAgICAgY29uc3QgZXhwcmVzc2lvbiA9IHRoaXMuaW5wdXQuc3Vic3RyaW5nKHN0YXJ0LCBlbmQpO1xuICAgICAgICB0aGlzLmVycm9yKGBDb25kaXRpb25hbCBleHByZXNzaW9uICR7ZXhwcmVzc2lvbn0gcmVxdWlyZXMgYWxsIDMgZXhwcmVzc2lvbnNgKTtcbiAgICAgICAgbm8gPSBuZXcgRW1wdHlFeHByKHRoaXMuc3BhbihzdGFydCksIHRoaXMuc291cmNlU3BhbihzdGFydCkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbm8gPSB0aGlzLnBhcnNlUGlwZSgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBDb25kaXRpb25hbCh0aGlzLnNwYW4oc3RhcnQpLCB0aGlzLnNvdXJjZVNwYW4oc3RhcnQpLCByZXN1bHQsIHllcywgbm8pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgfVxuXG4gIHBhcnNlTG9naWNhbE9yKCk6IEFTVCB7XG4gICAgLy8gJ3x8J1xuICAgIGNvbnN0IHN0YXJ0ID0gdGhpcy5pbnB1dEluZGV4O1xuICAgIGxldCByZXN1bHQgPSB0aGlzLnBhcnNlTG9naWNhbEFuZCgpO1xuICAgIHdoaWxlICh0aGlzLmNvbnN1bWVPcHRpb25hbE9wZXJhdG9yKCd8fCcpKSB7XG4gICAgICBjb25zdCByaWdodCA9IHRoaXMucGFyc2VMb2dpY2FsQW5kKCk7XG4gICAgICByZXN1bHQgPSBuZXcgQmluYXJ5KHRoaXMuc3BhbihzdGFydCksIHRoaXMuc291cmNlU3BhbihzdGFydCksICd8fCcsIHJlc3VsdCwgcmlnaHQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgcGFyc2VMb2dpY2FsQW5kKCk6IEFTVCB7XG4gICAgLy8gJyYmJ1xuICAgIGNvbnN0IHN0YXJ0ID0gdGhpcy5pbnB1dEluZGV4O1xuICAgIGxldCByZXN1bHQgPSB0aGlzLnBhcnNlTnVsbGlzaENvYWxlc2NpbmcoKTtcbiAgICB3aGlsZSAodGhpcy5jb25zdW1lT3B0aW9uYWxPcGVyYXRvcignJiYnKSkge1xuICAgICAgY29uc3QgcmlnaHQgPSB0aGlzLnBhcnNlTnVsbGlzaENvYWxlc2NpbmcoKTtcbiAgICAgIHJlc3VsdCA9IG5ldyBCaW5hcnkodGhpcy5zcGFuKHN0YXJ0KSwgdGhpcy5zb3VyY2VTcGFuKHN0YXJ0KSwgJyYmJywgcmVzdWx0LCByaWdodCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBwYXJzZU51bGxpc2hDb2FsZXNjaW5nKCk6IEFTVCB7XG4gICAgLy8gJz8/J1xuICAgIGNvbnN0IHN0YXJ0ID0gdGhpcy5pbnB1dEluZGV4O1xuICAgIGxldCByZXN1bHQgPSB0aGlzLnBhcnNlRXF1YWxpdHkoKTtcbiAgICB3aGlsZSAodGhpcy5jb25zdW1lT3B0aW9uYWxPcGVyYXRvcignPz8nKSkge1xuICAgICAgY29uc3QgcmlnaHQgPSB0aGlzLnBhcnNlRXF1YWxpdHkoKTtcbiAgICAgIHJlc3VsdCA9IG5ldyBCaW5hcnkodGhpcy5zcGFuKHN0YXJ0KSwgdGhpcy5zb3VyY2VTcGFuKHN0YXJ0KSwgJz8/JywgcmVzdWx0LCByaWdodCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBwYXJzZUVxdWFsaXR5KCk6IEFTVCB7XG4gICAgLy8gJz09JywnIT0nLCc9PT0nLCchPT0nXG4gICAgY29uc3Qgc3RhcnQgPSB0aGlzLmlucHV0SW5kZXg7XG4gICAgbGV0IHJlc3VsdCA9IHRoaXMucGFyc2VSZWxhdGlvbmFsKCk7XG4gICAgd2hpbGUgKHRoaXMubmV4dC50eXBlID09IFRva2VuVHlwZS5PcGVyYXRvcikge1xuICAgICAgY29uc3Qgb3BlcmF0b3IgPSB0aGlzLm5leHQuc3RyVmFsdWU7XG4gICAgICBzd2l0Y2ggKG9wZXJhdG9yKSB7XG4gICAgICAgIGNhc2UgJz09JzpcbiAgICAgICAgY2FzZSAnPT09JzpcbiAgICAgICAgY2FzZSAnIT0nOlxuICAgICAgICBjYXNlICchPT0nOlxuICAgICAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgICAgIGNvbnN0IHJpZ2h0ID0gdGhpcy5wYXJzZVJlbGF0aW9uYWwoKTtcbiAgICAgICAgICByZXN1bHQgPSBuZXcgQmluYXJ5KHRoaXMuc3BhbihzdGFydCksIHRoaXMuc291cmNlU3BhbihzdGFydCksIG9wZXJhdG9yLCByZXN1bHQsIHJpZ2h0KTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgcGFyc2VSZWxhdGlvbmFsKCk6IEFTVCB7XG4gICAgLy8gJzwnLCAnPicsICc8PScsICc+PSdcbiAgICBjb25zdCBzdGFydCA9IHRoaXMuaW5wdXRJbmRleDtcbiAgICBsZXQgcmVzdWx0ID0gdGhpcy5wYXJzZUFkZGl0aXZlKCk7XG4gICAgd2hpbGUgKHRoaXMubmV4dC50eXBlID09IFRva2VuVHlwZS5PcGVyYXRvcikge1xuICAgICAgY29uc3Qgb3BlcmF0b3IgPSB0aGlzLm5leHQuc3RyVmFsdWU7XG4gICAgICBzd2l0Y2ggKG9wZXJhdG9yKSB7XG4gICAgICAgIGNhc2UgJzwnOlxuICAgICAgICBjYXNlICc+JzpcbiAgICAgICAgY2FzZSAnPD0nOlxuICAgICAgICBjYXNlICc+PSc6XG4gICAgICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICAgICAgY29uc3QgcmlnaHQgPSB0aGlzLnBhcnNlQWRkaXRpdmUoKTtcbiAgICAgICAgICByZXN1bHQgPSBuZXcgQmluYXJ5KHRoaXMuc3BhbihzdGFydCksIHRoaXMuc291cmNlU3BhbihzdGFydCksIG9wZXJhdG9yLCByZXN1bHQsIHJpZ2h0KTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgcGFyc2VBZGRpdGl2ZSgpOiBBU1Qge1xuICAgIC8vICcrJywgJy0nXG4gICAgY29uc3Qgc3RhcnQgPSB0aGlzLmlucHV0SW5kZXg7XG4gICAgbGV0IHJlc3VsdCA9IHRoaXMucGFyc2VNdWx0aXBsaWNhdGl2ZSgpO1xuICAgIHdoaWxlICh0aGlzLm5leHQudHlwZSA9PSBUb2tlblR5cGUuT3BlcmF0b3IpIHtcbiAgICAgIGNvbnN0IG9wZXJhdG9yID0gdGhpcy5uZXh0LnN0clZhbHVlO1xuICAgICAgc3dpdGNoIChvcGVyYXRvcikge1xuICAgICAgICBjYXNlICcrJzpcbiAgICAgICAgY2FzZSAnLSc6XG4gICAgICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICAgICAgbGV0IHJpZ2h0ID0gdGhpcy5wYXJzZU11bHRpcGxpY2F0aXZlKCk7XG4gICAgICAgICAgcmVzdWx0ID0gbmV3IEJpbmFyeSh0aGlzLnNwYW4oc3RhcnQpLCB0aGlzLnNvdXJjZVNwYW4oc3RhcnQpLCBvcGVyYXRvciwgcmVzdWx0LCByaWdodCk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHBhcnNlTXVsdGlwbGljYXRpdmUoKTogQVNUIHtcbiAgICAvLyAnKicsICclJywgJy8nXG4gICAgY29uc3Qgc3RhcnQgPSB0aGlzLmlucHV0SW5kZXg7XG4gICAgbGV0IHJlc3VsdCA9IHRoaXMucGFyc2VQcmVmaXgoKTtcbiAgICB3aGlsZSAodGhpcy5uZXh0LnR5cGUgPT0gVG9rZW5UeXBlLk9wZXJhdG9yKSB7XG4gICAgICBjb25zdCBvcGVyYXRvciA9IHRoaXMubmV4dC5zdHJWYWx1ZTtcbiAgICAgIHN3aXRjaCAob3BlcmF0b3IpIHtcbiAgICAgICAgY2FzZSAnKic6XG4gICAgICAgIGNhc2UgJyUnOlxuICAgICAgICBjYXNlICcvJzpcbiAgICAgICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgICAgICBsZXQgcmlnaHQgPSB0aGlzLnBhcnNlUHJlZml4KCk7XG4gICAgICAgICAgcmVzdWx0ID0gbmV3IEJpbmFyeSh0aGlzLnNwYW4oc3RhcnQpLCB0aGlzLnNvdXJjZVNwYW4oc3RhcnQpLCBvcGVyYXRvciwgcmVzdWx0LCByaWdodCk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHBhcnNlUHJlZml4KCk6IEFTVCB7XG4gICAgaWYgKHRoaXMubmV4dC50eXBlID09IFRva2VuVHlwZS5PcGVyYXRvcikge1xuICAgICAgY29uc3Qgc3RhcnQgPSB0aGlzLmlucHV0SW5kZXg7XG4gICAgICBjb25zdCBvcGVyYXRvciA9IHRoaXMubmV4dC5zdHJWYWx1ZTtcbiAgICAgIGxldCByZXN1bHQ6IEFTVDtcbiAgICAgIHN3aXRjaCAob3BlcmF0b3IpIHtcbiAgICAgICAgY2FzZSAnKyc6XG4gICAgICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICAgICAgcmVzdWx0ID0gdGhpcy5wYXJzZVByZWZpeCgpO1xuICAgICAgICAgIHJldHVybiBVbmFyeS5jcmVhdGVQbHVzKHRoaXMuc3BhbihzdGFydCksIHRoaXMuc291cmNlU3BhbihzdGFydCksIHJlc3VsdCk7XG4gICAgICAgIGNhc2UgJy0nOlxuICAgICAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgICAgIHJlc3VsdCA9IHRoaXMucGFyc2VQcmVmaXgoKTtcbiAgICAgICAgICByZXR1cm4gVW5hcnkuY3JlYXRlTWludXModGhpcy5zcGFuKHN0YXJ0KSwgdGhpcy5zb3VyY2VTcGFuKHN0YXJ0KSwgcmVzdWx0KTtcbiAgICAgICAgY2FzZSAnISc6XG4gICAgICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICAgICAgcmVzdWx0ID0gdGhpcy5wYXJzZVByZWZpeCgpO1xuICAgICAgICAgIHJldHVybiBuZXcgUHJlZml4Tm90KHRoaXMuc3BhbihzdGFydCksIHRoaXMuc291cmNlU3BhbihzdGFydCksIHJlc3VsdCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnBhcnNlQ2FsbENoYWluKCk7XG4gIH1cblxuICBwYXJzZUNhbGxDaGFpbigpOiBBU1Qge1xuICAgIGNvbnN0IHN0YXJ0ID0gdGhpcy5pbnB1dEluZGV4O1xuICAgIGxldCByZXN1bHQgPSB0aGlzLnBhcnNlUHJpbWFyeSgpO1xuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBpZiAodGhpcy5jb25zdW1lT3B0aW9uYWxDaGFyYWN0ZXIoY2hhcnMuJFBFUklPRCkpIHtcbiAgICAgICAgcmVzdWx0ID0gdGhpcy5wYXJzZUFjY2Vzc01lbWJlck9yTWV0aG9kQ2FsbChyZXN1bHQsIHN0YXJ0LCBmYWxzZSk7XG5cbiAgICAgIH0gZWxzZSBpZiAodGhpcy5jb25zdW1lT3B0aW9uYWxPcGVyYXRvcignPy4nKSkge1xuICAgICAgICByZXN1bHQgPSB0aGlzLnBhcnNlQWNjZXNzTWVtYmVyT3JNZXRob2RDYWxsKHJlc3VsdCwgc3RhcnQsIHRydWUpO1xuXG4gICAgICB9IGVsc2UgaWYgKHRoaXMuY29uc3VtZU9wdGlvbmFsQ2hhcmFjdGVyKGNoYXJzLiRMQlJBQ0tFVCkpIHtcbiAgICAgICAgdGhpcy53aXRoQ29udGV4dChQYXJzZUNvbnRleHRGbGFncy5Xcml0YWJsZSwgKCkgPT4ge1xuICAgICAgICAgIHRoaXMucmJyYWNrZXRzRXhwZWN0ZWQrKztcbiAgICAgICAgICBjb25zdCBrZXkgPSB0aGlzLnBhcnNlUGlwZSgpO1xuICAgICAgICAgIGlmIChrZXkgaW5zdGFuY2VvZiBFbXB0eUV4cHIpIHtcbiAgICAgICAgICAgIHRoaXMuZXJyb3IoYEtleSBhY2Nlc3MgY2Fubm90IGJlIGVtcHR5YCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMucmJyYWNrZXRzRXhwZWN0ZWQtLTtcbiAgICAgICAgICB0aGlzLmV4cGVjdENoYXJhY3RlcihjaGFycy4kUkJSQUNLRVQpO1xuICAgICAgICAgIGlmICh0aGlzLmNvbnN1bWVPcHRpb25hbE9wZXJhdG9yKCc9JykpIHtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5wYXJzZUNvbmRpdGlvbmFsKCk7XG4gICAgICAgICAgICByZXN1bHQgPSBuZXcgS2V5ZWRXcml0ZSh0aGlzLnNwYW4oc3RhcnQpLCB0aGlzLnNvdXJjZVNwYW4oc3RhcnQpLCByZXN1bHQsIGtleSwgdmFsdWUpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQgPSBuZXcgS2V5ZWRSZWFkKHRoaXMuc3BhbihzdGFydCksIHRoaXMuc291cmNlU3BhbihzdGFydCksIHJlc3VsdCwga2V5KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLmNvbnN1bWVPcHRpb25hbENoYXJhY3RlcihjaGFycy4kTFBBUkVOKSkge1xuICAgICAgICB0aGlzLnJwYXJlbnNFeHBlY3RlZCsrO1xuICAgICAgICBjb25zdCBhcmdzID0gdGhpcy5wYXJzZUNhbGxBcmd1bWVudHMoKTtcbiAgICAgICAgdGhpcy5ycGFyZW5zRXhwZWN0ZWQtLTtcbiAgICAgICAgdGhpcy5leHBlY3RDaGFyYWN0ZXIoY2hhcnMuJFJQQVJFTik7XG4gICAgICAgIHJlc3VsdCA9IG5ldyBGdW5jdGlvbkNhbGwodGhpcy5zcGFuKHN0YXJ0KSwgdGhpcy5zb3VyY2VTcGFuKHN0YXJ0KSwgcmVzdWx0LCBhcmdzKTtcblxuICAgICAgfSBlbHNlIGlmICh0aGlzLmNvbnN1bWVPcHRpb25hbE9wZXJhdG9yKCchJykpIHtcbiAgICAgICAgcmVzdWx0ID0gbmV3IE5vbk51bGxBc3NlcnQodGhpcy5zcGFuKHN0YXJ0KSwgdGhpcy5zb3VyY2VTcGFuKHN0YXJ0KSwgcmVzdWx0KTtcblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwYXJzZVByaW1hcnkoKTogQVNUIHtcbiAgICBjb25zdCBzdGFydCA9IHRoaXMuaW5wdXRJbmRleDtcbiAgICBpZiAodGhpcy5jb25zdW1lT3B0aW9uYWxDaGFyYWN0ZXIoY2hhcnMuJExQQVJFTikpIHtcbiAgICAgIHRoaXMucnBhcmVuc0V4cGVjdGVkKys7XG4gICAgICBjb25zdCByZXN1bHQgPSB0aGlzLnBhcnNlUGlwZSgpO1xuICAgICAgdGhpcy5ycGFyZW5zRXhwZWN0ZWQtLTtcbiAgICAgIHRoaXMuZXhwZWN0Q2hhcmFjdGVyKGNoYXJzLiRSUEFSRU4pO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcblxuICAgIH0gZWxzZSBpZiAodGhpcy5uZXh0LmlzS2V5d29yZE51bGwoKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICByZXR1cm4gbmV3IExpdGVyYWxQcmltaXRpdmUodGhpcy5zcGFuKHN0YXJ0KSwgdGhpcy5zb3VyY2VTcGFuKHN0YXJ0KSwgbnVsbCk7XG5cbiAgICB9IGVsc2UgaWYgKHRoaXMubmV4dC5pc0tleXdvcmRVbmRlZmluZWQoKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICByZXR1cm4gbmV3IExpdGVyYWxQcmltaXRpdmUodGhpcy5zcGFuKHN0YXJ0KSwgdGhpcy5zb3VyY2VTcGFuKHN0YXJ0KSwgdm9pZCAwKTtcblxuICAgIH0gZWxzZSBpZiAodGhpcy5uZXh0LmlzS2V5d29yZFRydWUoKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICByZXR1cm4gbmV3IExpdGVyYWxQcmltaXRpdmUodGhpcy5zcGFuKHN0YXJ0KSwgdGhpcy5zb3VyY2VTcGFuKHN0YXJ0KSwgdHJ1ZSk7XG5cbiAgICB9IGVsc2UgaWYgKHRoaXMubmV4dC5pc0tleXdvcmRGYWxzZSgpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIHJldHVybiBuZXcgTGl0ZXJhbFByaW1pdGl2ZSh0aGlzLnNwYW4oc3RhcnQpLCB0aGlzLnNvdXJjZVNwYW4oc3RhcnQpLCBmYWxzZSk7XG5cbiAgICB9IGVsc2UgaWYgKHRoaXMubmV4dC5pc0tleXdvcmRUaGlzKCkpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgcmV0dXJuIG5ldyBUaGlzUmVjZWl2ZXIodGhpcy5zcGFuKHN0YXJ0KSwgdGhpcy5zb3VyY2VTcGFuKHN0YXJ0KSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmNvbnN1bWVPcHRpb25hbENoYXJhY3RlcihjaGFycy4kTEJSQUNLRVQpKSB7XG4gICAgICB0aGlzLnJicmFja2V0c0V4cGVjdGVkKys7XG4gICAgICBjb25zdCBlbGVtZW50cyA9IHRoaXMucGFyc2VFeHByZXNzaW9uTGlzdChjaGFycy4kUkJSQUNLRVQpO1xuICAgICAgdGhpcy5yYnJhY2tldHNFeHBlY3RlZC0tO1xuICAgICAgdGhpcy5leHBlY3RDaGFyYWN0ZXIoY2hhcnMuJFJCUkFDS0VUKTtcbiAgICAgIHJldHVybiBuZXcgTGl0ZXJhbEFycmF5KHRoaXMuc3BhbihzdGFydCksIHRoaXMuc291cmNlU3BhbihzdGFydCksIGVsZW1lbnRzKTtcblxuICAgIH0gZWxzZSBpZiAodGhpcy5uZXh0LmlzQ2hhcmFjdGVyKGNoYXJzLiRMQlJBQ0UpKSB7XG4gICAgICByZXR1cm4gdGhpcy5wYXJzZUxpdGVyYWxNYXAoKTtcblxuICAgIH0gZWxzZSBpZiAodGhpcy5uZXh0LmlzSWRlbnRpZmllcigpKSB7XG4gICAgICByZXR1cm4gdGhpcy5wYXJzZUFjY2Vzc01lbWJlck9yTWV0aG9kQ2FsbChcbiAgICAgICAgICBuZXcgSW1wbGljaXRSZWNlaXZlcih0aGlzLnNwYW4oc3RhcnQpLCB0aGlzLnNvdXJjZVNwYW4oc3RhcnQpKSwgc3RhcnQsIGZhbHNlKTtcblxuICAgIH0gZWxzZSBpZiAodGhpcy5uZXh0LmlzTnVtYmVyKCkpIHtcbiAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5uZXh0LnRvTnVtYmVyKCk7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIHJldHVybiBuZXcgTGl0ZXJhbFByaW1pdGl2ZSh0aGlzLnNwYW4oc3RhcnQpLCB0aGlzLnNvdXJjZVNwYW4oc3RhcnQpLCB2YWx1ZSk7XG5cbiAgICB9IGVsc2UgaWYgKHRoaXMubmV4dC5pc1N0cmluZygpKSB7XG4gICAgICBjb25zdCBsaXRlcmFsVmFsdWUgPSB0aGlzLm5leHQudG9TdHJpbmcoKTtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgcmV0dXJuIG5ldyBMaXRlcmFsUHJpbWl0aXZlKHRoaXMuc3BhbihzdGFydCksIHRoaXMuc291cmNlU3BhbihzdGFydCksIGxpdGVyYWxWYWx1ZSk7XG5cbiAgICB9IGVsc2UgaWYgKHRoaXMubmV4dC5pc1ByaXZhdGVJZGVudGlmaWVyKCkpIHtcbiAgICAgIHRoaXMuX3JlcG9ydEVycm9yRm9yUHJpdmF0ZUlkZW50aWZpZXIodGhpcy5uZXh0LCBudWxsKTtcbiAgICAgIHJldHVybiBuZXcgRW1wdHlFeHByKHRoaXMuc3BhbihzdGFydCksIHRoaXMuc291cmNlU3BhbihzdGFydCkpO1xuXG4gICAgfSBlbHNlIGlmICh0aGlzLmluZGV4ID49IHRoaXMudG9rZW5zLmxlbmd0aCkge1xuICAgICAgdGhpcy5lcnJvcihgVW5leHBlY3RlZCBlbmQgb2YgZXhwcmVzc2lvbjogJHt0aGlzLmlucHV0fWApO1xuICAgICAgcmV0dXJuIG5ldyBFbXB0eUV4cHIodGhpcy5zcGFuKHN0YXJ0KSwgdGhpcy5zb3VyY2VTcGFuKHN0YXJ0KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZXJyb3IoYFVuZXhwZWN0ZWQgdG9rZW4gJHt0aGlzLm5leHR9YCk7XG4gICAgICByZXR1cm4gbmV3IEVtcHR5RXhwcih0aGlzLnNwYW4oc3RhcnQpLCB0aGlzLnNvdXJjZVNwYW4oc3RhcnQpKTtcbiAgICB9XG4gIH1cblxuICBwYXJzZUV4cHJlc3Npb25MaXN0KHRlcm1pbmF0b3I6IG51bWJlcik6IEFTVFtdIHtcbiAgICBjb25zdCByZXN1bHQ6IEFTVFtdID0gW107XG5cbiAgICBkbyB7XG4gICAgICBpZiAoIXRoaXMubmV4dC5pc0NoYXJhY3Rlcih0ZXJtaW5hdG9yKSkge1xuICAgICAgICByZXN1bHQucHVzaCh0aGlzLnBhcnNlUGlwZSgpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH0gd2hpbGUgKHRoaXMuY29uc3VtZU9wdGlvbmFsQ2hhcmFjdGVyKGNoYXJzLiRDT01NQSkpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBwYXJzZUxpdGVyYWxNYXAoKTogTGl0ZXJhbE1hcCB7XG4gICAgY29uc3Qga2V5czogTGl0ZXJhbE1hcEtleVtdID0gW107XG4gICAgY29uc3QgdmFsdWVzOiBBU1RbXSA9IFtdO1xuICAgIGNvbnN0IHN0YXJ0ID0gdGhpcy5pbnB1dEluZGV4O1xuICAgIHRoaXMuZXhwZWN0Q2hhcmFjdGVyKGNoYXJzLiRMQlJBQ0UpO1xuICAgIGlmICghdGhpcy5jb25zdW1lT3B0aW9uYWxDaGFyYWN0ZXIoY2hhcnMuJFJCUkFDRSkpIHtcbiAgICAgIHRoaXMucmJyYWNlc0V4cGVjdGVkKys7XG4gICAgICBkbyB7XG4gICAgICAgIGNvbnN0IHF1b3RlZCA9IHRoaXMubmV4dC5pc1N0cmluZygpO1xuICAgICAgICBjb25zdCBrZXkgPSB0aGlzLmV4cGVjdElkZW50aWZpZXJPcktleXdvcmRPclN0cmluZygpO1xuICAgICAgICBrZXlzLnB1c2goe2tleSwgcXVvdGVkfSk7XG4gICAgICAgIHRoaXMuZXhwZWN0Q2hhcmFjdGVyKGNoYXJzLiRDT0xPTik7XG4gICAgICAgIHZhbHVlcy5wdXNoKHRoaXMucGFyc2VQaXBlKCkpO1xuICAgICAgfSB3aGlsZSAodGhpcy5jb25zdW1lT3B0aW9uYWxDaGFyYWN0ZXIoY2hhcnMuJENPTU1BKSk7XG4gICAgICB0aGlzLnJicmFjZXNFeHBlY3RlZC0tO1xuICAgICAgdGhpcy5leHBlY3RDaGFyYWN0ZXIoY2hhcnMuJFJCUkFDRSk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgTGl0ZXJhbE1hcCh0aGlzLnNwYW4oc3RhcnQpLCB0aGlzLnNvdXJjZVNwYW4oc3RhcnQpLCBrZXlzLCB2YWx1ZXMpO1xuICB9XG5cbiAgcGFyc2VBY2Nlc3NNZW1iZXJPck1ldGhvZENhbGwocmVjZWl2ZXI6IEFTVCwgc3RhcnQ6IG51bWJlciwgaXNTYWZlOiBib29sZWFuID0gZmFsc2UpOiBBU1Qge1xuICAgIGNvbnN0IG5hbWVTdGFydCA9IHRoaXMuaW5wdXRJbmRleDtcbiAgICBjb25zdCBpZCA9IHRoaXMud2l0aENvbnRleHQoUGFyc2VDb250ZXh0RmxhZ3MuV3JpdGFibGUsICgpID0+IHtcbiAgICAgIGNvbnN0IGlkID0gdGhpcy5leHBlY3RJZGVudGlmaWVyT3JLZXl3b3JkKCkgPz8gJyc7XG4gICAgICBpZiAoaWQubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHRoaXMuZXJyb3IoYEV4cGVjdGVkIGlkZW50aWZpZXIgZm9yIHByb3BlcnR5IGFjY2Vzc2AsIHJlY2VpdmVyLnNwYW4uZW5kKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBpZDtcbiAgICB9KTtcbiAgICBjb25zdCBuYW1lU3BhbiA9IHRoaXMuc291cmNlU3BhbihuYW1lU3RhcnQpO1xuXG4gICAgaWYgKHRoaXMuY29uc3VtZU9wdGlvbmFsQ2hhcmFjdGVyKGNoYXJzLiRMUEFSRU4pKSB7XG4gICAgICBjb25zdCBhcmd1bWVudFN0YXJ0ID0gdGhpcy5pbnB1dEluZGV4O1xuICAgICAgdGhpcy5ycGFyZW5zRXhwZWN0ZWQrKztcbiAgICAgIGNvbnN0IGFyZ3MgPSB0aGlzLnBhcnNlQ2FsbEFyZ3VtZW50cygpO1xuICAgICAgY29uc3QgYXJndW1lbnRTcGFuID1cbiAgICAgICAgICB0aGlzLnNwYW4oYXJndW1lbnRTdGFydCwgdGhpcy5pbnB1dEluZGV4KS50b0Fic29sdXRlKHRoaXMuYWJzb2x1dGVPZmZzZXQpO1xuXG4gICAgICB0aGlzLmV4cGVjdENoYXJhY3RlcihjaGFycy4kUlBBUkVOKTtcbiAgICAgIHRoaXMucnBhcmVuc0V4cGVjdGVkLS07XG4gICAgICBjb25zdCBzcGFuID0gdGhpcy5zcGFuKHN0YXJ0KTtcbiAgICAgIGNvbnN0IHNvdXJjZVNwYW4gPSB0aGlzLnNvdXJjZVNwYW4oc3RhcnQpO1xuICAgICAgcmV0dXJuIGlzU2FmZSA/XG4gICAgICAgICAgbmV3IFNhZmVNZXRob2RDYWxsKHNwYW4sIHNvdXJjZVNwYW4sIG5hbWVTcGFuLCByZWNlaXZlciwgaWQsIGFyZ3MsIGFyZ3VtZW50U3BhbikgOlxuICAgICAgICAgIG5ldyBNZXRob2RDYWxsKHNwYW4sIHNvdXJjZVNwYW4sIG5hbWVTcGFuLCByZWNlaXZlciwgaWQsIGFyZ3MsIGFyZ3VtZW50U3Bhbik7XG5cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGlzU2FmZSkge1xuICAgICAgICBpZiAodGhpcy5jb25zdW1lT3B0aW9uYWxPcGVyYXRvcignPScpKSB7XG4gICAgICAgICAgdGhpcy5lcnJvcignVGhlIFxcJz8uXFwnIG9wZXJhdG9yIGNhbm5vdCBiZSB1c2VkIGluIHRoZSBhc3NpZ25tZW50Jyk7XG4gICAgICAgICAgcmV0dXJuIG5ldyBFbXB0eUV4cHIodGhpcy5zcGFuKHN0YXJ0KSwgdGhpcy5zb3VyY2VTcGFuKHN0YXJ0KSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBTYWZlUHJvcGVydHlSZWFkKFxuICAgICAgICAgICAgICB0aGlzLnNwYW4oc3RhcnQpLCB0aGlzLnNvdXJjZVNwYW4oc3RhcnQpLCBuYW1lU3BhbiwgcmVjZWl2ZXIsIGlkKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHRoaXMuY29uc3VtZU9wdGlvbmFsT3BlcmF0b3IoJz0nKSkge1xuICAgICAgICAgIGlmICghdGhpcy5wYXJzZUFjdGlvbikge1xuICAgICAgICAgICAgdGhpcy5lcnJvcignQmluZGluZ3MgY2Fubm90IGNvbnRhaW4gYXNzaWdubWVudHMnKTtcbiAgICAgICAgICAgIHJldHVybiBuZXcgRW1wdHlFeHByKHRoaXMuc3BhbihzdGFydCksIHRoaXMuc291cmNlU3BhbihzdGFydCkpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5wYXJzZUNvbmRpdGlvbmFsKCk7XG4gICAgICAgICAgcmV0dXJuIG5ldyBQcm9wZXJ0eVdyaXRlKFxuICAgICAgICAgICAgICB0aGlzLnNwYW4oc3RhcnQpLCB0aGlzLnNvdXJjZVNwYW4oc3RhcnQpLCBuYW1lU3BhbiwgcmVjZWl2ZXIsIGlkLCB2YWx1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBQcm9wZXJ0eVJlYWQodGhpcy5zcGFuKHN0YXJ0KSwgdGhpcy5zb3VyY2VTcGFuKHN0YXJ0KSwgbmFtZVNwYW4sIHJlY2VpdmVyLCBpZCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwYXJzZUNhbGxBcmd1bWVudHMoKTogQmluZGluZ1BpcGVbXSB7XG4gICAgaWYgKHRoaXMubmV4dC5pc0NoYXJhY3RlcihjaGFycy4kUlBBUkVOKSkgcmV0dXJuIFtdO1xuICAgIGNvbnN0IHBvc2l0aW9uYWxzOiBBU1RbXSA9IFtdO1xuICAgIGRvIHtcbiAgICAgIHBvc2l0aW9uYWxzLnB1c2godGhpcy5wYXJzZVBpcGUoKSk7XG4gICAgfSB3aGlsZSAodGhpcy5jb25zdW1lT3B0aW9uYWxDaGFyYWN0ZXIoY2hhcnMuJENPTU1BKSk7XG4gICAgcmV0dXJuIHBvc2l0aW9uYWxzIGFzIEJpbmRpbmdQaXBlW107XG4gIH1cblxuICAvKipcbiAgICogUGFyc2VzIGFuIGlkZW50aWZpZXIsIGEga2V5d29yZCwgYSBzdHJpbmcgd2l0aCBhbiBvcHRpb25hbCBgLWAgaW4gYmV0d2VlbixcbiAgICogYW5kIHJldHVybnMgdGhlIHN0cmluZyBhbG9uZyB3aXRoIGl0cyBhYnNvbHV0ZSBzb3VyY2Ugc3Bhbi5cbiAgICovXG4gIGV4cGVjdFRlbXBsYXRlQmluZGluZ0tleSgpOiBUZW1wbGF0ZUJpbmRpbmdJZGVudGlmaWVyIHtcbiAgICBsZXQgcmVzdWx0ID0gJyc7XG4gICAgbGV0IG9wZXJhdG9yRm91bmQgPSBmYWxzZTtcbiAgICBjb25zdCBzdGFydCA9IHRoaXMuY3VycmVudEFic29sdXRlT2Zmc2V0O1xuICAgIGRvIHtcbiAgICAgIHJlc3VsdCArPSB0aGlzLmV4cGVjdElkZW50aWZpZXJPcktleXdvcmRPclN0cmluZygpO1xuICAgICAgb3BlcmF0b3JGb3VuZCA9IHRoaXMuY29uc3VtZU9wdGlvbmFsT3BlcmF0b3IoJy0nKTtcbiAgICAgIGlmIChvcGVyYXRvckZvdW5kKSB7XG4gICAgICAgIHJlc3VsdCArPSAnLSc7XG4gICAgICB9XG4gICAgfSB3aGlsZSAob3BlcmF0b3JGb3VuZCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHNvdXJjZTogcmVzdWx0LFxuICAgICAgc3BhbjogbmV3IEFic29sdXRlU291cmNlU3BhbihzdGFydCwgc3RhcnQgKyByZXN1bHQubGVuZ3RoKSxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFBhcnNlIG1pY3Jvc3ludGF4IHRlbXBsYXRlIGV4cHJlc3Npb24gYW5kIHJldHVybiBhIGxpc3Qgb2YgYmluZGluZ3Mgb3JcbiAgICogcGFyc2luZyBlcnJvcnMgaW4gY2FzZSB0aGUgZ2l2ZW4gZXhwcmVzc2lvbiBpcyBpbnZhbGlkLlxuICAgKlxuICAgKiBGb3IgZXhhbXBsZSxcbiAgICogYGBgXG4gICAqICAgPGRpdiAqbmdGb3I9XCJsZXQgaXRlbSBvZiBpdGVtczsgaW5kZXggYXMgaTsgdHJhY2tCeTogZnVuY1wiPlxuICAgKiBgYGBcbiAgICogY29udGFpbnMgZml2ZSBiaW5kaW5nczpcbiAgICogMS4gbmdGb3IgLT4gbnVsbFxuICAgKiAyLiBpdGVtIC0+IE5nRm9yT2ZDb250ZXh0LiRpbXBsaWNpdFxuICAgKiAzLiBuZ0Zvck9mIC0+IGl0ZW1zXG4gICAqIDQuIGkgLT4gTmdGb3JPZkNvbnRleHQuaW5kZXhcbiAgICogNS4gbmdGb3JUcmFja0J5IC0+IGZ1bmNcbiAgICpcbiAgICogRm9yIGEgZnVsbCBkZXNjcmlwdGlvbiBvZiB0aGUgbWljcm9zeW50YXggZ3JhbW1hciwgc2VlXG4gICAqIGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL21oZXZlcnkvZDM1MzAyOTRjZmYyZTRhMWIzZmUxNWZmNzVkMDg4NTVcbiAgICpcbiAgICogQHBhcmFtIHRlbXBsYXRlS2V5IG5hbWUgb2YgdGhlIG1pY3Jvc3ludGF4IGRpcmVjdGl2ZSwgbGlrZSBuZ0lmLCBuZ0ZvcixcbiAgICogd2l0aG91dCB0aGUgKiwgYWxvbmcgd2l0aCBpdHMgYWJzb2x1dGUgc3Bhbi5cbiAgICovXG4gIHBhcnNlVGVtcGxhdGVCaW5kaW5ncyh0ZW1wbGF0ZUtleTogVGVtcGxhdGVCaW5kaW5nSWRlbnRpZmllcik6IFRlbXBsYXRlQmluZGluZ1BhcnNlUmVzdWx0IHtcbiAgICBjb25zdCBiaW5kaW5nczogVGVtcGxhdGVCaW5kaW5nW10gPSBbXTtcblxuICAgIC8vIFRoZSBmaXJzdCBiaW5kaW5nIGlzIGZvciB0aGUgdGVtcGxhdGUga2V5IGl0c2VsZlxuICAgIC8vIEluICpuZ0Zvcj1cImxldCBpdGVtIG9mIGl0ZW1zXCIsIGtleSA9IFwibmdGb3JcIiwgdmFsdWUgPSBudWxsXG4gICAgLy8gSW4gKm5nSWY9XCJjb25kIHwgcGlwZVwiLCBrZXkgPSBcIm5nSWZcIiwgdmFsdWUgPSBcImNvbmQgfCBwaXBlXCJcbiAgICBiaW5kaW5ncy5wdXNoKC4uLnRoaXMucGFyc2VEaXJlY3RpdmVLZXl3b3JkQmluZGluZ3ModGVtcGxhdGVLZXkpKTtcblxuICAgIHdoaWxlICh0aGlzLmluZGV4IDwgdGhpcy50b2tlbnMubGVuZ3RoKSB7XG4gICAgICAvLyBJZiBpdCBzdGFydHMgd2l0aCAnbGV0JywgdGhlbiB0aGlzIG11c3QgYmUgdmFyaWFibGUgZGVjbGFyYXRpb25cbiAgICAgIGNvbnN0IGxldEJpbmRpbmcgPSB0aGlzLnBhcnNlTGV0QmluZGluZygpO1xuICAgICAgaWYgKGxldEJpbmRpbmcpIHtcbiAgICAgICAgYmluZGluZ3MucHVzaChsZXRCaW5kaW5nKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFR3byBwb3NzaWJsZSBjYXNlcyBoZXJlLCBlaXRoZXIgYHZhbHVlIFwiYXNcIiBrZXlgIG9yXG4gICAgICAgIC8vIFwiZGlyZWN0aXZlLWtleXdvcmQgZXhwcmVzc2lvblwiLiBXZSBkb24ndCBrbm93IHdoaWNoIGNhc2UsIGJ1dCBib3RoXG4gICAgICAgIC8vIFwidmFsdWVcIiBhbmQgXCJkaXJlY3RpdmUta2V5d29yZFwiIGFyZSB0ZW1wbGF0ZSBiaW5kaW5nIGtleSwgc28gY29uc3VtZVxuICAgICAgICAvLyB0aGUga2V5IGZpcnN0LlxuICAgICAgICBjb25zdCBrZXkgPSB0aGlzLmV4cGVjdFRlbXBsYXRlQmluZGluZ0tleSgpO1xuICAgICAgICAvLyBQZWVrIGF0IHRoZSBuZXh0IHRva2VuLCBpZiBpdCBpcyBcImFzXCIgdGhlbiB0aGlzIG11c3QgYmUgdmFyaWFibGVcbiAgICAgICAgLy8gZGVjbGFyYXRpb24uXG4gICAgICAgIGNvbnN0IGJpbmRpbmcgPSB0aGlzLnBhcnNlQXNCaW5kaW5nKGtleSk7XG4gICAgICAgIGlmIChiaW5kaW5nKSB7XG4gICAgICAgICAgYmluZGluZ3MucHVzaChiaW5kaW5nKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBPdGhlcndpc2UgdGhlIGtleSBtdXN0IGJlIGEgZGlyZWN0aXZlIGtleXdvcmQsIGxpa2UgXCJvZlwiLiBUcmFuc2Zvcm1cbiAgICAgICAgICAvLyB0aGUga2V5IHRvIGFjdHVhbCBrZXkuIEVnLiBvZiAtPiBuZ0Zvck9mLCB0cmFja0J5IC0+IG5nRm9yVHJhY2tCeVxuICAgICAgICAgIGtleS5zb3VyY2UgPVxuICAgICAgICAgICAgICB0ZW1wbGF0ZUtleS5zb3VyY2UgKyBrZXkuc291cmNlLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsga2V5LnNvdXJjZS5zdWJzdHJpbmcoMSk7XG4gICAgICAgICAgYmluZGluZ3MucHVzaCguLi50aGlzLnBhcnNlRGlyZWN0aXZlS2V5d29yZEJpbmRpbmdzKGtleSkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLmNvbnN1bWVTdGF0ZW1lbnRUZXJtaW5hdG9yKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBUZW1wbGF0ZUJpbmRpbmdQYXJzZVJlc3VsdChiaW5kaW5ncywgW10gLyogd2FybmluZ3MgKi8sIHRoaXMuZXJyb3JzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQYXJzZSBhIGRpcmVjdGl2ZSBrZXl3b3JkLCBmb2xsb3dlZCBieSBhIG1hbmRhdG9yeSBleHByZXNzaW9uLlxuICAgKiBGb3IgZXhhbXBsZSwgXCJvZiBpdGVtc1wiLCBcInRyYWNrQnk6IGZ1bmNcIi5cbiAgICogVGhlIGJpbmRpbmdzIGFyZTogbmdGb3JPZiAtPiBpdGVtcywgbmdGb3JUcmFja0J5IC0+IGZ1bmNcbiAgICogVGhlcmUgY291bGQgYmUgYW4gb3B0aW9uYWwgXCJhc1wiIGJpbmRpbmcgdGhhdCBmb2xsb3dzIHRoZSBleHByZXNzaW9uLlxuICAgKiBGb3IgZXhhbXBsZSxcbiAgICogYGBgXG4gICAqICAgKm5nRm9yPVwibGV0IGl0ZW0gb2YgaXRlbXMgfCBzbGljZTowOjEgYXMgY29sbGVjdGlvblwiLlxuICAgKiAgICAgICAgICAgICAgICAgICAgXl4gXl5eXl5eXl5eXl5eXl5eXl4gXl5eXl5eXl5eXl5eXlxuICAgKiAgICAgICAgICAgICAgIGtleXdvcmQgICAgYm91bmQgdGFyZ2V0ICAgb3B0aW9uYWwgJ2FzJyBiaW5kaW5nXG4gICAqIGBgYFxuICAgKlxuICAgKiBAcGFyYW0ga2V5IGJpbmRpbmcga2V5LCBmb3IgZXhhbXBsZSwgbmdGb3IsIG5nSWYsIG5nRm9yT2YsIGFsb25nIHdpdGggaXRzXG4gICAqIGFic29sdXRlIHNwYW4uXG4gICAqL1xuICBwcml2YXRlIHBhcnNlRGlyZWN0aXZlS2V5d29yZEJpbmRpbmdzKGtleTogVGVtcGxhdGVCaW5kaW5nSWRlbnRpZmllcik6IFRlbXBsYXRlQmluZGluZ1tdIHtcbiAgICBjb25zdCBiaW5kaW5nczogVGVtcGxhdGVCaW5kaW5nW10gPSBbXTtcbiAgICB0aGlzLmNvbnN1bWVPcHRpb25hbENoYXJhY3RlcihjaGFycy4kQ09MT04pOyAgLy8gdHJhY2tCeTogdHJhY2tCeUZ1bmN0aW9uXG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLmdldERpcmVjdGl2ZUJvdW5kVGFyZ2V0KCk7XG4gICAgbGV0IHNwYW5FbmQgPSB0aGlzLmN1cnJlbnRBYnNvbHV0ZU9mZnNldDtcbiAgICAvLyBUaGUgYmluZGluZyBjb3VsZCBvcHRpb25hbGx5IGJlIGZvbGxvd2VkIGJ5IFwiYXNcIi4gRm9yIGV4YW1wbGUsXG4gICAgLy8gKm5nSWY9XCJjb25kIHwgcGlwZSBhcyB4XCIuIEluIHRoaXMgY2FzZSwgdGhlIGtleSBpbiB0aGUgXCJhc1wiIGJpbmRpbmdcbiAgICAvLyBpcyBcInhcIiBhbmQgdGhlIHZhbHVlIGlzIHRoZSB0ZW1wbGF0ZSBrZXkgaXRzZWxmIChcIm5nSWZcIikuIE5vdGUgdGhhdCB0aGVcbiAgICAvLyAna2V5JyBpbiB0aGUgY3VycmVudCBjb250ZXh0IG5vdyBiZWNvbWVzIHRoZSBcInZhbHVlXCIgaW4gdGhlIG5leHQgYmluZGluZy5cbiAgICBjb25zdCBhc0JpbmRpbmcgPSB0aGlzLnBhcnNlQXNCaW5kaW5nKGtleSk7XG4gICAgaWYgKCFhc0JpbmRpbmcpIHtcbiAgICAgIHRoaXMuY29uc3VtZVN0YXRlbWVudFRlcm1pbmF0b3IoKTtcbiAgICAgIHNwYW5FbmQgPSB0aGlzLmN1cnJlbnRBYnNvbHV0ZU9mZnNldDtcbiAgICB9XG4gICAgY29uc3Qgc291cmNlU3BhbiA9IG5ldyBBYnNvbHV0ZVNvdXJjZVNwYW4oa2V5LnNwYW4uc3RhcnQsIHNwYW5FbmQpO1xuICAgIGJpbmRpbmdzLnB1c2gobmV3IEV4cHJlc3Npb25CaW5kaW5nKHNvdXJjZVNwYW4sIGtleSwgdmFsdWUpKTtcbiAgICBpZiAoYXNCaW5kaW5nKSB7XG4gICAgICBiaW5kaW5ncy5wdXNoKGFzQmluZGluZyk7XG4gICAgfVxuICAgIHJldHVybiBiaW5kaW5ncztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gdGhlIGV4cHJlc3Npb24gQVNUIGZvciB0aGUgYm91bmQgdGFyZ2V0IG9mIGEgZGlyZWN0aXZlIGtleXdvcmRcbiAgICogYmluZGluZy4gRm9yIGV4YW1wbGUsXG4gICAqIGBgYFxuICAgKiAgICpuZ0lmPVwiY29uZGl0aW9uIHwgcGlwZVwiXG4gICAqICAgICAgICAgIF5eXl5eXl5eXl5eXl5eXl4gYm91bmQgdGFyZ2V0IGZvciBcIm5nSWZcIlxuICAgKiAgICpuZ0Zvcj1cImxldCBpdGVtIG9mIGl0ZW1zXCJcbiAgICogICAgICAgICAgICAgICAgICAgICAgIF5eXl5eIGJvdW5kIHRhcmdldCBmb3IgXCJuZ0Zvck9mXCJcbiAgICogYGBgXG4gICAqL1xuICBwcml2YXRlIGdldERpcmVjdGl2ZUJvdW5kVGFyZ2V0KCk6IEFTVFdpdGhTb3VyY2V8bnVsbCB7XG4gICAgaWYgKHRoaXMubmV4dCA9PT0gRU9GIHx8IHRoaXMucGVla0tleXdvcmRBcygpIHx8IHRoaXMucGVla0tleXdvcmRMZXQoKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IGFzdCA9IHRoaXMucGFyc2VQaXBlKCk7ICAvLyBleGFtcGxlOiBcImNvbmRpdGlvbiB8IGFzeW5jXCJcbiAgICBjb25zdCB7c3RhcnQsIGVuZH0gPSBhc3Quc3BhbjtcbiAgICBjb25zdCB2YWx1ZSA9IHRoaXMuaW5wdXQuc3Vic3RyaW5nKHN0YXJ0LCBlbmQpO1xuICAgIHJldHVybiBuZXcgQVNUV2l0aFNvdXJjZShhc3QsIHZhbHVlLCB0aGlzLmxvY2F0aW9uLCB0aGlzLmFic29sdXRlT2Zmc2V0ICsgc3RhcnQsIHRoaXMuZXJyb3JzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gdGhlIGJpbmRpbmcgZm9yIGEgdmFyaWFibGUgZGVjbGFyZWQgdXNpbmcgYGFzYC4gTm90ZSB0aGF0IHRoZSBvcmRlclxuICAgKiBvZiB0aGUga2V5LXZhbHVlIHBhaXIgaW4gdGhpcyBkZWNsYXJhdGlvbiBpcyByZXZlcnNlZC4gRm9yIGV4YW1wbGUsXG4gICAqIGBgYFxuICAgKiAgICpuZ0Zvcj1cImxldCBpdGVtIG9mIGl0ZW1zOyBpbmRleCBhcyBpXCJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICBeXl5eXiAgICBeXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgICAga2V5XG4gICAqIGBgYFxuICAgKlxuICAgKiBAcGFyYW0gdmFsdWUgbmFtZSBvZiB0aGUgdmFsdWUgaW4gdGhlIGRlY2xhcmF0aW9uLCBcIm5nSWZcIiBpbiB0aGUgZXhhbXBsZVxuICAgKiBhYm92ZSwgYWxvbmcgd2l0aCBpdHMgYWJzb2x1dGUgc3Bhbi5cbiAgICovXG4gIHByaXZhdGUgcGFyc2VBc0JpbmRpbmcodmFsdWU6IFRlbXBsYXRlQmluZGluZ0lkZW50aWZpZXIpOiBUZW1wbGF0ZUJpbmRpbmd8bnVsbCB7XG4gICAgaWYgKCF0aGlzLnBlZWtLZXl3b3JkQXMoKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHRoaXMuYWR2YW5jZSgpOyAgLy8gY29uc3VtZSB0aGUgJ2FzJyBrZXl3b3JkXG4gICAgY29uc3Qga2V5ID0gdGhpcy5leHBlY3RUZW1wbGF0ZUJpbmRpbmdLZXkoKTtcbiAgICB0aGlzLmNvbnN1bWVTdGF0ZW1lbnRUZXJtaW5hdG9yKCk7XG4gICAgY29uc3Qgc291cmNlU3BhbiA9IG5ldyBBYnNvbHV0ZVNvdXJjZVNwYW4odmFsdWUuc3Bhbi5zdGFydCwgdGhpcy5jdXJyZW50QWJzb2x1dGVPZmZzZXQpO1xuICAgIHJldHVybiBuZXcgVmFyaWFibGVCaW5kaW5nKHNvdXJjZVNwYW4sIGtleSwgdmFsdWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiB0aGUgYmluZGluZyBmb3IgYSB2YXJpYWJsZSBkZWNsYXJlZCB1c2luZyBgbGV0YC4gRm9yIGV4YW1wbGUsXG4gICAqIGBgYFxuICAgKiAgICpuZ0Zvcj1cImxldCBpdGVtIG9mIGl0ZW1zOyBsZXQgaT1pbmRleDtcIlxuICAgKiAgICAgICAgICAgXl5eXl5eXl4gICAgICAgICAgIF5eXl5eXl5eXl5eXG4gICAqIGBgYFxuICAgKiBJbiB0aGUgZmlyc3QgYmluZGluZywgYGl0ZW1gIGlzIGJvdW5kIHRvIGBOZ0Zvck9mQ29udGV4dC4kaW1wbGljaXRgLlxuICAgKiBJbiB0aGUgc2Vjb25kIGJpbmRpbmcsIGBpYCBpcyBib3VuZCB0byBgTmdGb3JPZkNvbnRleHQuaW5kZXhgLlxuICAgKi9cbiAgcHJpdmF0ZSBwYXJzZUxldEJpbmRpbmcoKTogVGVtcGxhdGVCaW5kaW5nfG51bGwge1xuICAgIGlmICghdGhpcy5wZWVrS2V5d29yZExldCgpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3Qgc3BhblN0YXJ0ID0gdGhpcy5jdXJyZW50QWJzb2x1dGVPZmZzZXQ7XG4gICAgdGhpcy5hZHZhbmNlKCk7ICAvLyBjb25zdW1lIHRoZSAnbGV0JyBrZXl3b3JkXG4gICAgY29uc3Qga2V5ID0gdGhpcy5leHBlY3RUZW1wbGF0ZUJpbmRpbmdLZXkoKTtcbiAgICBsZXQgdmFsdWU6IFRlbXBsYXRlQmluZGluZ0lkZW50aWZpZXJ8bnVsbCA9IG51bGw7XG4gICAgaWYgKHRoaXMuY29uc3VtZU9wdGlvbmFsT3BlcmF0b3IoJz0nKSkge1xuICAgICAgdmFsdWUgPSB0aGlzLmV4cGVjdFRlbXBsYXRlQmluZGluZ0tleSgpO1xuICAgIH1cbiAgICB0aGlzLmNvbnN1bWVTdGF0ZW1lbnRUZXJtaW5hdG9yKCk7XG4gICAgY29uc3Qgc291cmNlU3BhbiA9IG5ldyBBYnNvbHV0ZVNvdXJjZVNwYW4oc3BhblN0YXJ0LCB0aGlzLmN1cnJlbnRBYnNvbHV0ZU9mZnNldCk7XG4gICAgcmV0dXJuIG5ldyBWYXJpYWJsZUJpbmRpbmcoc291cmNlU3Bhbiwga2V5LCB2YWx1ZSk7XG4gIH1cblxuICAvKipcbiAgICogQ29uc3VtZSB0aGUgb3B0aW9uYWwgc3RhdGVtZW50IHRlcm1pbmF0b3I6IHNlbWljb2xvbiBvciBjb21tYS5cbiAgICovXG4gIHByaXZhdGUgY29uc3VtZVN0YXRlbWVudFRlcm1pbmF0b3IoKSB7XG4gICAgdGhpcy5jb25zdW1lT3B0aW9uYWxDaGFyYWN0ZXIoY2hhcnMuJFNFTUlDT0xPTikgfHwgdGhpcy5jb25zdW1lT3B0aW9uYWxDaGFyYWN0ZXIoY2hhcnMuJENPTU1BKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWNvcmRzIGFuIGVycm9yIGFuZCBza2lwcyBvdmVyIHRoZSB0b2tlbiBzdHJlYW0gdW50aWwgcmVhY2hpbmcgYSByZWNvdmVyYWJsZSBwb2ludC4gU2VlXG4gICAqIGB0aGlzLnNraXBgIGZvciBtb3JlIGRldGFpbHMgb24gdG9rZW4gc2tpcHBpbmcuXG4gICAqL1xuICBlcnJvcihtZXNzYWdlOiBzdHJpbmcsIGluZGV4OiBudW1iZXJ8bnVsbCA9IG51bGwpIHtcbiAgICB0aGlzLmVycm9ycy5wdXNoKG5ldyBQYXJzZXJFcnJvcihtZXNzYWdlLCB0aGlzLmlucHV0LCB0aGlzLmxvY2F0aW9uVGV4dChpbmRleCksIHRoaXMubG9jYXRpb24pKTtcbiAgICB0aGlzLnNraXAoKTtcbiAgfVxuXG4gIHByaXZhdGUgbG9jYXRpb25UZXh0KGluZGV4OiBudW1iZXJ8bnVsbCA9IG51bGwpIHtcbiAgICBpZiAoaW5kZXggPT0gbnVsbCkgaW5kZXggPSB0aGlzLmluZGV4O1xuICAgIHJldHVybiAoaW5kZXggPCB0aGlzLnRva2Vucy5sZW5ndGgpID8gYGF0IGNvbHVtbiAke3RoaXMudG9rZW5zW2luZGV4XS5pbmRleCArIDF9IGluYCA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgYXQgdGhlIGVuZCBvZiB0aGUgZXhwcmVzc2lvbmA7XG4gIH1cblxuICAvKipcbiAgICogUmVjb3JkcyBhbiBlcnJvciBmb3IgYW4gdW5leHBlY3RlZCBwcml2YXRlIGlkZW50aWZpZXIgYmVpbmcgZGlzY292ZXJlZC5cbiAgICogQHBhcmFtIHRva2VuIFRva2VuIHJlcHJlc2VudGluZyBhIHByaXZhdGUgaWRlbnRpZmllci5cbiAgICogQHBhcmFtIGV4dHJhTWVzc2FnZSBPcHRpb25hbCBhZGRpdGlvbmFsIG1lc3NhZ2UgYmVpbmcgYXBwZW5kZWQgdG8gdGhlIGVycm9yLlxuICAgKi9cbiAgcHJpdmF0ZSBfcmVwb3J0RXJyb3JGb3JQcml2YXRlSWRlbnRpZmllcih0b2tlbjogVG9rZW4sIGV4dHJhTWVzc2FnZTogc3RyaW5nfG51bGwpIHtcbiAgICBsZXQgZXJyb3JNZXNzYWdlID1cbiAgICAgICAgYFByaXZhdGUgaWRlbnRpZmllcnMgYXJlIG5vdCBzdXBwb3J0ZWQuIFVuZXhwZWN0ZWQgcHJpdmF0ZSBpZGVudGlmaWVyOiAke3Rva2VufWA7XG4gICAgaWYgKGV4dHJhTWVzc2FnZSAhPT0gbnVsbCkge1xuICAgICAgZXJyb3JNZXNzYWdlICs9IGAsICR7ZXh0cmFNZXNzYWdlfWA7XG4gICAgfVxuICAgIHRoaXMuZXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFcnJvciByZWNvdmVyeSBzaG91bGQgc2tpcCB0b2tlbnMgdW50aWwgaXQgZW5jb3VudGVycyBhIHJlY292ZXJ5IHBvaW50LlxuICAgKlxuICAgKiBUaGUgZm9sbG93aW5nIGFyZSB0cmVhdGVkIGFzIHVuY29uZGl0aW9uYWwgcmVjb3ZlcnkgcG9pbnRzOlxuICAgKiAgIC0gZW5kIG9mIGlucHV0XG4gICAqICAgLSAnOycgKHBhcnNlQ2hhaW4oKSBpcyBhbHdheXMgdGhlIHJvb3QgcHJvZHVjdGlvbiwgYW5kIGl0IGV4cGVjdHMgYSAnOycpXG4gICAqICAgLSAnfCcgKHNpbmNlIHBpcGVzIG1heSBiZSBjaGFpbmVkIGFuZCBlYWNoIHBpcGUgZXhwcmVzc2lvbiBtYXkgYmUgdHJlYXRlZCBpbmRlcGVuZGVudGx5KVxuICAgKlxuICAgKiBUaGUgZm9sbG93aW5nIGFyZSBjb25kaXRpb25hbCByZWNvdmVyeSBwb2ludHM6XG4gICAqICAgLSAnKScsICd9JywgJ10nIGlmIG9uZSBvZiBjYWxsaW5nIHByb2R1Y3Rpb25zIGlzIGV4cGVjdGluZyBvbmUgb2YgdGhlc2Ugc3ltYm9sc1xuICAgKiAgICAgLSBUaGlzIGFsbG93cyBza2lwKCkgdG8gcmVjb3ZlciBmcm9tIGVycm9ycyBzdWNoIGFzICcoYS4pICsgMScgYWxsb3dpbmcgbW9yZSBvZiB0aGUgQVNUIHRvXG4gICAqICAgICAgIGJlIHJldGFpbmVkIChpdCBkb2Vzbid0IHNraXAgYW55IHRva2VucyBhcyB0aGUgJyknIGlzIHJldGFpbmVkIGJlY2F1c2Ugb2YgdGhlICcoJyBiZWdpbnNcbiAgICogICAgICAgYW4gJygnIDxleHByPiAnKScgcHJvZHVjdGlvbikuXG4gICAqICAgICAgIFRoZSByZWNvdmVyeSBwb2ludHMgb2YgZ3JvdXBpbmcgc3ltYm9scyBtdXN0IGJlIGNvbmRpdGlvbmFsIGFzIHRoZXkgbXVzdCBiZSBza2lwcGVkIGlmXG4gICAqICAgICAgIG5vbmUgb2YgdGhlIGNhbGxpbmcgcHJvZHVjdGlvbnMgYXJlIG5vdCBleHBlY3RpbmcgdGhlIGNsb3NpbmcgdG9rZW4gZWxzZSB3ZSB3aWxsIG5ldmVyXG4gICAqICAgICAgIG1ha2UgcHJvZ3Jlc3MgaW4gdGhlIGNhc2Ugb2YgYW4gZXh0cmFuZW91cyBncm91cCBjbG9zaW5nIHN5bWJvbCAoc3VjaCBhcyBhIHN0cmF5ICcpJykuXG4gICAqICAgICAgIFRoYXQgaXMsIHdlIHNraXAgYSBjbG9zaW5nIHN5bWJvbCBpZiB3ZSBhcmUgbm90IGluIGEgZ3JvdXBpbmcgcHJvZHVjdGlvbi5cbiAgICogICAtICc9JyBpbiBhIGBXcml0YWJsZWAgY29udGV4dFxuICAgKiAgICAgLSBJbiB0aGlzIGNvbnRleHQsIHdlIGFyZSBhYmxlIHRvIHJlY292ZXIgYWZ0ZXIgc2VlaW5nIHRoZSBgPWAgb3BlcmF0b3IsIHdoaWNoXG4gICAqICAgICAgIHNpZ25hbHMgdGhlIHByZXNlbmNlIG9mIGFuIGluZGVwZW5kZW50IHJ2YWx1ZSBleHByZXNzaW9uIGZvbGxvd2luZyB0aGUgYD1gIG9wZXJhdG9yLlxuICAgKlxuICAgKiBJZiBhIHByb2R1Y3Rpb24gZXhwZWN0cyBvbmUgb2YgdGhlc2UgdG9rZW4gaXQgaW5jcmVtZW50cyB0aGUgY29ycmVzcG9uZGluZyBuZXN0aW5nIGNvdW50LFxuICAgKiBhbmQgdGhlbiBkZWNyZW1lbnRzIGl0IGp1c3QgcHJpb3IgdG8gY2hlY2tpbmcgaWYgdGhlIHRva2VuIGlzIGluIHRoZSBpbnB1dC5cbiAgICovXG4gIHByaXZhdGUgc2tpcCgpIHtcbiAgICBsZXQgbiA9IHRoaXMubmV4dDtcbiAgICB3aGlsZSAodGhpcy5pbmRleCA8IHRoaXMudG9rZW5zLmxlbmd0aCAmJiAhbi5pc0NoYXJhY3RlcihjaGFycy4kU0VNSUNPTE9OKSAmJlxuICAgICAgICAgICAhbi5pc09wZXJhdG9yKCd8JykgJiYgKHRoaXMucnBhcmVuc0V4cGVjdGVkIDw9IDAgfHwgIW4uaXNDaGFyYWN0ZXIoY2hhcnMuJFJQQVJFTikpICYmXG4gICAgICAgICAgICh0aGlzLnJicmFjZXNFeHBlY3RlZCA8PSAwIHx8ICFuLmlzQ2hhcmFjdGVyKGNoYXJzLiRSQlJBQ0UpKSAmJlxuICAgICAgICAgICAodGhpcy5yYnJhY2tldHNFeHBlY3RlZCA8PSAwIHx8ICFuLmlzQ2hhcmFjdGVyKGNoYXJzLiRSQlJBQ0tFVCkpICYmXG4gICAgICAgICAgICghKHRoaXMuY29udGV4dCAmIFBhcnNlQ29udGV4dEZsYWdzLldyaXRhYmxlKSB8fCAhbi5pc09wZXJhdG9yKCc9JykpKSB7XG4gICAgICBpZiAodGhpcy5uZXh0LmlzRXJyb3IoKSkge1xuICAgICAgICB0aGlzLmVycm9ycy5wdXNoKFxuICAgICAgICAgICAgbmV3IFBhcnNlckVycm9yKHRoaXMubmV4dC50b1N0cmluZygpISwgdGhpcy5pbnB1dCwgdGhpcy5sb2NhdGlvblRleHQoKSwgdGhpcy5sb2NhdGlvbikpO1xuICAgICAgfVxuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICBuID0gdGhpcy5uZXh0O1xuICAgIH1cbiAgfVxufVxuXG5jbGFzcyBTaW1wbGVFeHByZXNzaW9uQ2hlY2tlciBpbXBsZW1lbnRzIEFzdFZpc2l0b3Ige1xuICBlcnJvcnM6IHN0cmluZ1tdID0gW107XG5cbiAgdmlzaXRJbXBsaWNpdFJlY2VpdmVyKGFzdDogSW1wbGljaXRSZWNlaXZlciwgY29udGV4dDogYW55KSB7fVxuXG4gIHZpc2l0VGhpc1JlY2VpdmVyKGFzdDogVGhpc1JlY2VpdmVyLCBjb250ZXh0OiBhbnkpIHt9XG5cbiAgdmlzaXRJbnRlcnBvbGF0aW9uKGFzdDogSW50ZXJwb2xhdGlvbiwgY29udGV4dDogYW55KSB7fVxuXG4gIHZpc2l0TGl0ZXJhbFByaW1pdGl2ZShhc3Q6IExpdGVyYWxQcmltaXRpdmUsIGNvbnRleHQ6IGFueSkge31cblxuICB2aXNpdFByb3BlcnR5UmVhZChhc3Q6IFByb3BlcnR5UmVhZCwgY29udGV4dDogYW55KSB7fVxuXG4gIHZpc2l0UHJvcGVydHlXcml0ZShhc3Q6IFByb3BlcnR5V3JpdGUsIGNvbnRleHQ6IGFueSkge31cblxuICB2aXNpdFNhZmVQcm9wZXJ0eVJlYWQoYXN0OiBTYWZlUHJvcGVydHlSZWFkLCBjb250ZXh0OiBhbnkpIHt9XG5cbiAgdmlzaXRNZXRob2RDYWxsKGFzdDogTWV0aG9kQ2FsbCwgY29udGV4dDogYW55KSB7fVxuXG4gIHZpc2l0U2FmZU1ldGhvZENhbGwoYXN0OiBTYWZlTWV0aG9kQ2FsbCwgY29udGV4dDogYW55KSB7fVxuXG4gIHZpc2l0RnVuY3Rpb25DYWxsKGFzdDogRnVuY3Rpb25DYWxsLCBjb250ZXh0OiBhbnkpIHt9XG5cbiAgdmlzaXRMaXRlcmFsQXJyYXkoYXN0OiBMaXRlcmFsQXJyYXksIGNvbnRleHQ6IGFueSkge1xuICAgIHRoaXMudmlzaXRBbGwoYXN0LmV4cHJlc3Npb25zLCBjb250ZXh0KTtcbiAgfVxuXG4gIHZpc2l0TGl0ZXJhbE1hcChhc3Q6IExpdGVyYWxNYXAsIGNvbnRleHQ6IGFueSkge1xuICAgIHRoaXMudmlzaXRBbGwoYXN0LnZhbHVlcywgY29udGV4dCk7XG4gIH1cblxuICB2aXNpdFVuYXJ5KGFzdDogVW5hcnksIGNvbnRleHQ6IGFueSkge31cblxuICB2aXNpdEJpbmFyeShhc3Q6IEJpbmFyeSwgY29udGV4dDogYW55KSB7fVxuXG4gIHZpc2l0UHJlZml4Tm90KGFzdDogUHJlZml4Tm90LCBjb250ZXh0OiBhbnkpIHt9XG5cbiAgdmlzaXROb25OdWxsQXNzZXJ0KGFzdDogTm9uTnVsbEFzc2VydCwgY29udGV4dDogYW55KSB7fVxuXG4gIHZpc2l0Q29uZGl0aW9uYWwoYXN0OiBDb25kaXRpb25hbCwgY29udGV4dDogYW55KSB7fVxuXG4gIHZpc2l0UGlwZShhc3Q6IEJpbmRpbmdQaXBlLCBjb250ZXh0OiBhbnkpIHtcbiAgICB0aGlzLmVycm9ycy5wdXNoKCdwaXBlcycpO1xuICB9XG5cbiAgdmlzaXRLZXllZFJlYWQoYXN0OiBLZXllZFJlYWQsIGNvbnRleHQ6IGFueSkge31cblxuICB2aXNpdEtleWVkV3JpdGUoYXN0OiBLZXllZFdyaXRlLCBjb250ZXh0OiBhbnkpIHt9XG5cbiAgdmlzaXRBbGwoYXN0czogYW55W10sIGNvbnRleHQ6IGFueSk6IGFueVtdIHtcbiAgICByZXR1cm4gYXN0cy5tYXAobm9kZSA9PiBub2RlLnZpc2l0KHRoaXMsIGNvbnRleHQpKTtcbiAgfVxuXG4gIHZpc2l0Q2hhaW4oYXN0OiBDaGFpbiwgY29udGV4dDogYW55KSB7fVxuXG4gIHZpc2l0UXVvdGUoYXN0OiBRdW90ZSwgY29udGV4dDogYW55KSB7fVxufVxuXG4vKipcbiAqIFRoaXMgY2xhc3MgaW1wbGVtZW50cyBTaW1wbGVFeHByZXNzaW9uQ2hlY2tlciB1c2VkIGluIFZpZXcgRW5naW5lIGFuZCBwZXJmb3JtcyBtb3JlIHN0cmljdCBjaGVja3NcbiAqIHRvIG1ha2Ugc3VyZSBob3N0IGJpbmRpbmdzIGRvIG5vdCBjb250YWluIHBpcGVzLiBJbiBWaWV3IEVuZ2luZSwgaGF2aW5nIHBpcGVzIGluIGhvc3QgYmluZGluZ3MgaXNcbiAqIG5vdCBzdXBwb3J0ZWQgYXMgd2VsbCwgYnV0IGluIHNvbWUgY2FzZXMgKGxpa2UgYCEodmFsdWUgfCBhc3luYylgKSB0aGUgZXJyb3IgaXMgbm90IHRyaWdnZXJlZCBhdFxuICogY29tcGlsZSB0aW1lLiBJbiBvcmRlciB0byBwcmVzZXJ2ZSBWaWV3IEVuZ2luZSBiZWhhdmlvciwgbW9yZSBzdHJpY3QgY2hlY2tzIGFyZSBpbnRyb2R1Y2VkIGZvclxuICogSXZ5IG1vZGUgb25seS5cbiAqL1xuY2xhc3MgSXZ5U2ltcGxlRXhwcmVzc2lvbkNoZWNrZXIgZXh0ZW5kcyBSZWN1cnNpdmVBc3RWaXNpdG9yIGltcGxlbWVudHMgU2ltcGxlRXhwcmVzc2lvbkNoZWNrZXIge1xuICBlcnJvcnM6IHN0cmluZ1tdID0gW107XG5cbiAgdmlzaXRQaXBlKCkge1xuICAgIHRoaXMuZXJyb3JzLnB1c2goJ3BpcGVzJyk7XG4gIH1cbn1cbiJdfQ==