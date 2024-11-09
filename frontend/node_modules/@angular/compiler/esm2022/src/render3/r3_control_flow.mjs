/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { EmptyExpr } from '../expression_parser/ast';
import * as html from '../ml_parser/ast';
import { ParseError, ParseSourceSpan } from '../parse_util';
import * as t from './r3_ast';
/** Pattern for the expression in a for loop block. */
const FOR_LOOP_EXPRESSION_PATTERN = /^\s*([0-9A-Za-z_$]*)\s+of\s+([\S\s]*)/;
/** Pattern for the tracking expression in a for loop block. */
const FOR_LOOP_TRACK_PATTERN = /^track\s+([\S\s]*)/;
/** Pattern for the `as` expression in a conditional block. */
const CONDITIONAL_ALIAS_PATTERN = /^(as\s)+(.*)/;
/** Pattern used to identify an `else if` block. */
const ELSE_IF_PATTERN = /^else[^\S\r\n]+if/;
/** Pattern used to identify a `let` parameter. */
const FOR_LOOP_LET_PATTERN = /^let\s+([\S\s]*)/;
/**
 * Pattern to group a string into leading whitespace, non whitespace, and trailing whitespace.
 * Useful for getting the variable name span when a span can contain leading and trailing space.
 */
const CHARACTERS_IN_SURROUNDING_WHITESPACE_PATTERN = /(\s*)(\S+)(\s*)/;
/** Names of variables that are allowed to be used in the `let` expression of a `for` loop. */
const ALLOWED_FOR_LOOP_LET_VARIABLES = new Set(['$index', '$first', '$last', '$even', '$odd', '$count']);
/**
 * Predicate function that determines if a block with
 * a specific name cam be connected to a `for` block.
 */
export function isConnectedForLoopBlock(name) {
    return name === 'empty';
}
/**
 * Predicate function that determines if a block with
 * a specific name cam be connected to an `if` block.
 */
export function isConnectedIfLoopBlock(name) {
    return name === 'else' || ELSE_IF_PATTERN.test(name);
}
/** Creates an `if` loop block from an HTML AST node. */
export function createIfBlock(ast, connectedBlocks, visitor, bindingParser) {
    const errors = validateIfConnectedBlocks(connectedBlocks);
    const branches = [];
    const mainBlockParams = parseConditionalBlockParameters(ast, errors, bindingParser);
    if (mainBlockParams !== null) {
        branches.push(new t.IfBlockBranch(mainBlockParams.expression, html.visitAll(visitor, ast.children, ast.children), mainBlockParams.expressionAlias, ast.sourceSpan, ast.startSourceSpan, ast.endSourceSpan, ast.nameSpan, ast.i18n));
    }
    for (const block of connectedBlocks) {
        if (ELSE_IF_PATTERN.test(block.name)) {
            const params = parseConditionalBlockParameters(block, errors, bindingParser);
            if (params !== null) {
                const children = html.visitAll(visitor, block.children, block.children);
                branches.push(new t.IfBlockBranch(params.expression, children, params.expressionAlias, block.sourceSpan, block.startSourceSpan, block.endSourceSpan, block.nameSpan, block.i18n));
            }
        }
        else if (block.name === 'else') {
            const children = html.visitAll(visitor, block.children, block.children);
            branches.push(new t.IfBlockBranch(null, children, null, block.sourceSpan, block.startSourceSpan, block.endSourceSpan, block.nameSpan, block.i18n));
        }
    }
    // The outer IfBlock should have a span that encapsulates all branches.
    const ifBlockStartSourceSpan = branches.length > 0 ? branches[0].startSourceSpan : ast.startSourceSpan;
    const ifBlockEndSourceSpan = branches.length > 0 ? branches[branches.length - 1].endSourceSpan : ast.endSourceSpan;
    let wholeSourceSpan = ast.sourceSpan;
    const lastBranch = branches[branches.length - 1];
    if (lastBranch !== undefined) {
        wholeSourceSpan = new ParseSourceSpan(ifBlockStartSourceSpan.start, lastBranch.sourceSpan.end);
    }
    return {
        node: new t.IfBlock(branches, wholeSourceSpan, ast.startSourceSpan, ifBlockEndSourceSpan, ast.nameSpan),
        errors,
    };
}
/** Creates a `for` loop block from an HTML AST node. */
export function createForLoop(ast, connectedBlocks, visitor, bindingParser) {
    const errors = [];
    const params = parseForLoopParameters(ast, errors, bindingParser);
    let node = null;
    let empty = null;
    for (const block of connectedBlocks) {
        if (block.name === 'empty') {
            if (empty !== null) {
                errors.push(new ParseError(block.sourceSpan, '@for loop can only have one @empty block'));
            }
            else if (block.parameters.length > 0) {
                errors.push(new ParseError(block.sourceSpan, '@empty block cannot have parameters'));
            }
            else {
                empty = new t.ForLoopBlockEmpty(html.visitAll(visitor, block.children, block.children), block.sourceSpan, block.startSourceSpan, block.endSourceSpan, block.nameSpan, block.i18n);
            }
        }
        else {
            errors.push(new ParseError(block.sourceSpan, `Unrecognized @for loop block "${block.name}"`));
        }
    }
    if (params !== null) {
        if (params.trackBy === null) {
            // TODO: We should not fail here, and instead try to produce some AST for the language
            // service.
            errors.push(new ParseError(ast.sourceSpan, '@for loop must have a "track" expression'));
        }
        else {
            // The `for` block has a main span that includes the `empty` branch. For only the span of the
            // main `for` body, use `mainSourceSpan`.
            const endSpan = empty?.endSourceSpan ?? ast.endSourceSpan;
            const sourceSpan = new ParseSourceSpan(ast.sourceSpan.start, endSpan?.end ?? ast.sourceSpan.end);
            node = new t.ForLoopBlock(params.itemName, params.expression, params.trackBy.expression, params.trackBy.keywordSpan, params.context, html.visitAll(visitor, ast.children, ast.children), empty, sourceSpan, ast.sourceSpan, ast.startSourceSpan, endSpan, ast.nameSpan, ast.i18n);
        }
    }
    return { node, errors };
}
/** Creates a switch block from an HTML AST node. */
export function createSwitchBlock(ast, visitor, bindingParser) {
    const errors = validateSwitchBlock(ast);
    const primaryExpression = ast.parameters.length > 0 ?
        parseBlockParameterToBinding(ast.parameters[0], bindingParser) :
        bindingParser.parseBinding('', false, ast.sourceSpan, 0);
    const cases = [];
    const unknownBlocks = [];
    let defaultCase = null;
    // Here we assume that all the blocks are valid given that we validated them above.
    for (const node of ast.children) {
        if (!(node instanceof html.Block)) {
            continue;
        }
        if ((node.name !== 'case' || node.parameters.length === 0) && node.name !== 'default') {
            unknownBlocks.push(new t.UnknownBlock(node.name, node.sourceSpan, node.nameSpan));
            continue;
        }
        const expression = node.name === 'case' ?
            parseBlockParameterToBinding(node.parameters[0], bindingParser) :
            null;
        const ast = new t.SwitchBlockCase(expression, html.visitAll(visitor, node.children, node.children), node.sourceSpan, node.startSourceSpan, node.endSourceSpan, node.nameSpan, node.i18n);
        if (expression === null) {
            defaultCase = ast;
        }
        else {
            cases.push(ast);
        }
    }
    // Ensure that the default case is last in the array.
    if (defaultCase !== null) {
        cases.push(defaultCase);
    }
    return {
        node: new t.SwitchBlock(primaryExpression, cases, unknownBlocks, ast.sourceSpan, ast.startSourceSpan, ast.endSourceSpan, ast.nameSpan),
        errors
    };
}
/** Parses the parameters of a `for` loop block. */
function parseForLoopParameters(block, errors, bindingParser) {
    if (block.parameters.length === 0) {
        errors.push(new ParseError(block.sourceSpan, '@for loop does not have an expression'));
        return null;
    }
    const [expressionParam, ...secondaryParams] = block.parameters;
    const match = stripOptionalParentheses(expressionParam, errors)?.match(FOR_LOOP_EXPRESSION_PATTERN);
    if (!match || match[2].trim().length === 0) {
        errors.push(new ParseError(expressionParam.sourceSpan, 'Cannot parse expression. @for loop expression must match the pattern "<identifier> of <expression>"'));
        return null;
    }
    const [, itemName, rawExpression] = match;
    // `expressionParam.expression` contains the variable declaration and the expression of the
    // for...of statement, i.e. 'user of users' The variable of a ForOfStatement is _only_ the "const
    // user" part and does not include "of x".
    const variableName = expressionParam.expression.split(' ')[0];
    const variableSpan = new ParseSourceSpan(expressionParam.sourceSpan.start, expressionParam.sourceSpan.start.moveBy(variableName.length));
    const result = {
        itemName: new t.Variable(itemName, '$implicit', variableSpan, variableSpan),
        trackBy: null,
        expression: parseBlockParameterToBinding(expressionParam, bindingParser, rawExpression),
        context: {},
    };
    for (const param of secondaryParams) {
        const letMatch = param.expression.match(FOR_LOOP_LET_PATTERN);
        if (letMatch !== null) {
            const variablesSpan = new ParseSourceSpan(param.sourceSpan.start.moveBy(letMatch[0].length - letMatch[1].length), param.sourceSpan.end);
            parseLetParameter(param.sourceSpan, letMatch[1], variablesSpan, result.context, errors);
            continue;
        }
        const trackMatch = param.expression.match(FOR_LOOP_TRACK_PATTERN);
        if (trackMatch !== null) {
            if (result.trackBy !== null) {
                errors.push(new ParseError(param.sourceSpan, '@for loop can only have one "track" expression'));
            }
            else {
                const expression = parseBlockParameterToBinding(param, bindingParser, trackMatch[1]);
                if (expression.ast instanceof EmptyExpr) {
                    errors.push(new ParseError(param.sourceSpan, '@for loop must have a "track" expression'));
                }
                const keywordSpan = new ParseSourceSpan(param.sourceSpan.start, param.sourceSpan.start.moveBy('track'.length));
                result.trackBy = { expression, keywordSpan };
            }
            continue;
        }
        errors.push(new ParseError(param.sourceSpan, `Unrecognized @for loop paramater "${param.expression}"`));
    }
    // Fill out any variables that haven't been defined explicitly.
    for (const variableName of ALLOWED_FOR_LOOP_LET_VARIABLES) {
        if (!result.context.hasOwnProperty(variableName)) {
            // Give ambiently-available context variables empty spans at the end of the start of the `for`
            // block, since they are not explicitly defined.
            const emptySpanAfterForBlockStart = new ParseSourceSpan(block.startSourceSpan.end, block.startSourceSpan.end);
            result.context[variableName] = new t.Variable(variableName, variableName, emptySpanAfterForBlockStart, emptySpanAfterForBlockStart);
        }
    }
    return result;
}
/** Parses the `let` parameter of a `for` loop block. */
function parseLetParameter(sourceSpan, expression, span, context, errors) {
    const parts = expression.split(',');
    let startSpan = span.start;
    for (const part of parts) {
        const expressionParts = part.split('=');
        const name = expressionParts.length === 2 ? expressionParts[0].trim() : '';
        const variableName = (expressionParts.length === 2 ? expressionParts[1].trim() : '');
        if (name.length === 0 || variableName.length === 0) {
            errors.push(new ParseError(sourceSpan, `Invalid @for loop "let" parameter. Parameter should match the pattern "<name> = <variable name>"`));
        }
        else if (!ALLOWED_FOR_LOOP_LET_VARIABLES.has(variableName)) {
            errors.push(new ParseError(sourceSpan, `Unknown "let" parameter variable "${variableName}". The allowed variables are: ${Array.from(ALLOWED_FOR_LOOP_LET_VARIABLES).join(', ')}`));
        }
        else if (context.hasOwnProperty(variableName)) {
            errors.push(new ParseError(sourceSpan, `Duplicate "let" parameter variable "${variableName}"`));
        }
        else {
            const [, keyLeadingWhitespace, keyName] = expressionParts[0].match(CHARACTERS_IN_SURROUNDING_WHITESPACE_PATTERN) ?? [];
            const keySpan = keyLeadingWhitespace !== undefined && expressionParts.length === 2 ?
                new ParseSourceSpan(
                /* strip leading spaces */
                startSpan.moveBy(keyLeadingWhitespace.length), 
                /* advance to end of the variable name */
                startSpan.moveBy(keyLeadingWhitespace.length + keyName.length)) :
                span;
            let valueSpan = undefined;
            if (expressionParts.length === 2) {
                const [, valueLeadingWhitespace, implicit] = expressionParts[1].match(CHARACTERS_IN_SURROUNDING_WHITESPACE_PATTERN) ?? [];
                valueSpan = valueLeadingWhitespace !== undefined ?
                    new ParseSourceSpan(startSpan.moveBy(expressionParts[0].length + 1 + valueLeadingWhitespace.length), startSpan.moveBy(expressionParts[0].length + 1 + valueLeadingWhitespace.length +
                        implicit.length)) :
                    undefined;
            }
            const sourceSpan = new ParseSourceSpan(keySpan.start, valueSpan?.end ?? keySpan.end);
            context[variableName] = new t.Variable(name, variableName, sourceSpan, keySpan, valueSpan);
        }
        startSpan = startSpan.moveBy(part.length + 1 /* add 1 to move past the comma */);
    }
}
/**
 * Checks that the shape of the blocks connected to an
 * `@if` block is correct. Returns an array of errors.
 */
function validateIfConnectedBlocks(connectedBlocks) {
    const errors = [];
    let hasElse = false;
    for (let i = 0; i < connectedBlocks.length; i++) {
        const block = connectedBlocks[i];
        if (block.name === 'else') {
            if (hasElse) {
                errors.push(new ParseError(block.sourceSpan, 'Conditional can only have one @else block'));
            }
            else if (connectedBlocks.length > 1 && i < connectedBlocks.length - 1) {
                errors.push(new ParseError(block.sourceSpan, '@else block must be last inside the conditional'));
            }
            else if (block.parameters.length > 0) {
                errors.push(new ParseError(block.sourceSpan, '@else block cannot have parameters'));
            }
            hasElse = true;
        }
        else if (!ELSE_IF_PATTERN.test(block.name)) {
            errors.push(new ParseError(block.sourceSpan, `Unrecognized conditional block @${block.name}`));
        }
    }
    return errors;
}
/** Checks that the shape of a `switch` block is valid. Returns an array of errors. */
function validateSwitchBlock(ast) {
    const errors = [];
    let hasDefault = false;
    if (ast.parameters.length !== 1) {
        errors.push(new ParseError(ast.sourceSpan, '@switch block must have exactly one parameter'));
        return errors;
    }
    for (const node of ast.children) {
        // Skip over comments and empty text nodes inside the switch block.
        // Empty text nodes can be used for formatting while comments don't affect the runtime.
        if (node instanceof html.Comment ||
            (node instanceof html.Text && node.value.trim().length === 0)) {
            continue;
        }
        if (!(node instanceof html.Block) || (node.name !== 'case' && node.name !== 'default')) {
            errors.push(new ParseError(node.sourceSpan, '@switch block can only contain @case and @default blocks'));
            continue;
        }
        if (node.name === 'default') {
            if (hasDefault) {
                errors.push(new ParseError(node.sourceSpan, '@switch block can only have one @default block'));
            }
            else if (node.parameters.length > 0) {
                errors.push(new ParseError(node.sourceSpan, '@default block cannot have parameters'));
            }
            hasDefault = true;
        }
        else if (node.name === 'case' && node.parameters.length !== 1) {
            errors.push(new ParseError(node.sourceSpan, '@case block must have exactly one parameter'));
        }
    }
    return errors;
}
/**
 * Parses a block parameter into a binding AST.
 * @param ast Block parameter that should be parsed.
 * @param bindingParser Parser that the expression should be parsed with.
 * @param part Specific part of the expression that should be parsed.
 */
function parseBlockParameterToBinding(ast, bindingParser, part) {
    let start;
    let end;
    if (typeof part === 'string') {
        // Note: `lastIndexOf` here should be enough to know the start index of the expression,
        // because we know that it'll be at the end of the param. Ideally we could use the `d`
        // flag when matching via regex and get the index from `match.indices`, but it's unclear
        // if we can use it yet since it's a relatively new feature. See:
        // https://github.com/tc39/proposal-regexp-match-indices
        start = Math.max(0, ast.expression.lastIndexOf(part));
        end = start + part.length;
    }
    else {
        start = 0;
        end = ast.expression.length;
    }
    return bindingParser.parseBinding(ast.expression.slice(start, end), false, ast.sourceSpan, ast.sourceSpan.start.offset + start);
}
/** Parses the parameter of a conditional block (`if` or `else if`). */
function parseConditionalBlockParameters(block, errors, bindingParser) {
    if (block.parameters.length === 0) {
        errors.push(new ParseError(block.sourceSpan, 'Conditional block does not have an expression'));
        return null;
    }
    const expression = parseBlockParameterToBinding(block.parameters[0], bindingParser);
    let expressionAlias = null;
    // Start from 1 since we processed the first parameter already.
    for (let i = 1; i < block.parameters.length; i++) {
        const param = block.parameters[i];
        const aliasMatch = param.expression.match(CONDITIONAL_ALIAS_PATTERN);
        // For now conditionals can only have an `as` parameter.
        // We may want to rework this later if we add more.
        if (aliasMatch === null) {
            errors.push(new ParseError(param.sourceSpan, `Unrecognized conditional paramater "${param.expression}"`));
        }
        else if (block.name !== 'if') {
            errors.push(new ParseError(param.sourceSpan, '"as" expression is only allowed on the primary @if block'));
        }
        else if (expressionAlias !== null) {
            errors.push(new ParseError(param.sourceSpan, 'Conditional can only have one "as" expression'));
        }
        else {
            const name = aliasMatch[2].trim();
            const variableStart = param.sourceSpan.start.moveBy(aliasMatch[1].length);
            const variableSpan = new ParseSourceSpan(variableStart, variableStart.moveBy(name.length));
            expressionAlias = new t.Variable(name, name, variableSpan, variableSpan);
        }
    }
    return { expression, expressionAlias };
}
/** Strips optional parentheses around from a control from expression parameter. */
function stripOptionalParentheses(param, errors) {
    const expression = param.expression;
    const spaceRegex = /^\s$/;
    let openParens = 0;
    let start = 0;
    let end = expression.length - 1;
    for (let i = 0; i < expression.length; i++) {
        const char = expression[i];
        if (char === '(') {
            start = i + 1;
            openParens++;
        }
        else if (spaceRegex.test(char)) {
            continue;
        }
        else {
            break;
        }
    }
    if (openParens === 0) {
        return expression;
    }
    for (let i = expression.length - 1; i > -1; i--) {
        const char = expression[i];
        if (char === ')') {
            end = i;
            openParens--;
            if (openParens === 0) {
                break;
            }
        }
        else if (spaceRegex.test(char)) {
            continue;
        }
        else {
            break;
        }
    }
    if (openParens !== 0) {
        errors.push(new ParseError(param.sourceSpan, 'Unclosed parentheses in expression'));
        return null;
    }
    return expression.slice(start, end);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicjNfY29udHJvbF9mbG93LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3JlbmRlcjMvcjNfY29udHJvbF9mbG93LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBZ0IsU0FBUyxFQUFDLE1BQU0sMEJBQTBCLENBQUM7QUFDbEUsT0FBTyxLQUFLLElBQUksTUFBTSxrQkFBa0IsQ0FBQztBQUN6QyxPQUFPLEVBQUMsVUFBVSxFQUFFLGVBQWUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUcxRCxPQUFPLEtBQUssQ0FBQyxNQUFNLFVBQVUsQ0FBQztBQUU5QixzREFBc0Q7QUFDdEQsTUFBTSwyQkFBMkIsR0FBRyx1Q0FBdUMsQ0FBQztBQUU1RSwrREFBK0Q7QUFDL0QsTUFBTSxzQkFBc0IsR0FBRyxvQkFBb0IsQ0FBQztBQUVwRCw4REFBOEQ7QUFDOUQsTUFBTSx5QkFBeUIsR0FBRyxjQUFjLENBQUM7QUFFakQsbURBQW1EO0FBQ25ELE1BQU0sZUFBZSxHQUFHLG1CQUFtQixDQUFDO0FBRTVDLGtEQUFrRDtBQUNsRCxNQUFNLG9CQUFvQixHQUFHLGtCQUFrQixDQUFDO0FBRWhEOzs7R0FHRztBQUNILE1BQU0sNENBQTRDLEdBQUcsaUJBQWlCLENBQUM7QUFFdkUsOEZBQThGO0FBQzlGLE1BQU0sOEJBQThCLEdBQ2hDLElBQUksR0FBRyxDQUE4QixDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztBQUVuRzs7O0dBR0c7QUFDSCxNQUFNLFVBQVUsdUJBQXVCLENBQUMsSUFBWTtJQUNsRCxPQUFPLElBQUksS0FBSyxPQUFPLENBQUM7QUFDMUIsQ0FBQztBQUVEOzs7R0FHRztBQUNILE1BQU0sVUFBVSxzQkFBc0IsQ0FBQyxJQUFZO0lBQ2pELE9BQU8s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Q1gsQ0FBQzthQUFNLENBQUM7WUFDTixNQUFNO1FBQ1IsQ0FBQztJQUNILENBQUM7SUFFRCxJQUFJLFVBQVUsS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUNyQixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksVUFBVSxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsb0NBQW9DLENBQUMsQ0FBQyxDQUFDO1FBQ3BGLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVELE9BQU8sVUFBVSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDdEMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FTVFdpdGhTb3VyY2UsIEVtcHR5RXhwcn0gZnJvbSAnLi4vZXhwcmVzc2lvbl9wYXJzZXIvYXN0JztcbmltcG9ydCAqIGFzIGh0bWwgZnJvbSAnLi4vbWxfcGFyc2VyL2FzdCc7XG5pbXBvcnQge1BhcnNlRXJyb3IsIFBhcnNlU291cmNlU3Bhbn0gZnJvbSAnLi4vcGFyc2VfdXRpbCc7XG5pbXBvcnQge0JpbmRpbmdQYXJzZXJ9IGZyb20gJy4uL3RlbXBsYXRlX3BhcnNlci9iaW5kaW5nX3BhcnNlcic7XG5cbmltcG9ydCAqIGFzIHQgZnJvbSAnLi9yM19hc3QnO1xuXG4vKiogUGF0dGVybiBmb3IgdGhlIGV4cHJlc3Npb24gaW4gYSBmb3IgbG9vcCBibG9jay4gKi9cbmNvbnN0IEZPUl9MT09QX0VYUFJFU1NJT05fUEFUVEVSTiA9IC9eXFxzKihbMC05QS1aYS16XyRdKilcXHMrb2ZcXHMrKFtcXFNcXHNdKikvO1xuXG4vKiogUGF0dGVybiBmb3IgdGhlIHRyYWNraW5nIGV4cHJlc3Npb24gaW4gYSBmb3IgbG9vcCBibG9jay4gKi9cbmNvbnN0IEZPUl9MT09QX1RSQUNLX1BBVFRFUk4gPSAvXnRyYWNrXFxzKyhbXFxTXFxzXSopLztcblxuLyoqIFBhdHRlcm4gZm9yIHRoZSBgYXNgIGV4cHJlc3Npb24gaW4gYSBjb25kaXRpb25hbCBibG9jay4gKi9cbmNvbnN0IENPTkRJVElPTkFMX0FMSUFTX1BBVFRFUk4gPSAvXihhc1xccykrKC4qKS87XG5cbi8qKiBQYXR0ZXJuIHVzZWQgdG8gaWRlbnRpZnkgYW4gYGVsc2UgaWZgIGJsb2NrLiAqL1xuY29uc3QgRUxTRV9JRl9QQVRURVJOID0gL15lbHNlW15cXFNcXHJcXG5dK2lmLztcblxuLyoqIFBhdHRlcm4gdXNlZCB0byBpZGVudGlmeSBhIGBsZXRgIHBhcmFtZXRlci4gKi9cbmNvbnN0IEZPUl9MT09QX0xFVF9QQVRURVJOID0gL15sZXRcXHMrKFtcXFNcXHNdKikvO1xuXG4vKipcbiAqIFBhdHRlcm4gdG8gZ3JvdXAgYSBzdHJpbmcgaW50byBsZWFkaW5nIHdoaXRlc3BhY2UsIG5vbiB3aGl0ZXNwYWNlLCBhbmQgdHJhaWxpbmcgd2hpdGVzcGFjZS5cbiAqIFVzZWZ1bCBmb3IgZ2V0dGluZyB0aGUgdmFyaWFibGUgbmFtZSBzcGFuIHdoZW4gYSBzcGFuIGNhbiBjb250YWluIGxlYWRpbmcgYW5kIHRyYWlsaW5nIHNwYWNlLlxuICovXG5jb25zdCBDSEFSQUNURVJTX0lOX1NVUlJPVU5ESU5HX1dISVRFU1BBQ0VfUEFUVEVSTiA9IC8oXFxzKikoXFxTKykoXFxzKikvO1xuXG4vKiogTmFtZXMgb2YgdmFyaWFibGVzIHRoYXQgYXJlIGFsbG93ZWQgdG8gYmUgdXNlZCBpbiB0aGUgYGxldGAgZXhwcmVzc2lvbiBvZiBhIGBmb3JgIGxvb3AuICovXG5jb25zdCBBTExPV0VEX0ZPUl9MT09QX0xFVF9WQVJJQUJMRVMgPVxuICAgIG5ldyBTZXQ8a2V5b2YgdC5Gb3JMb29wQmxvY2tDb250ZXh0PihbJyRpbmRleCcsICckZmlyc3QnLCAnJGxhc3QnLCAnJGV2ZW4nLCAnJG9kZCcsICckY291bnQnXSk7XG5cbi8qKlxuICogUHJlZGljYXRlIGZ1bmN0aW9uIHRoYXQgZGV0ZXJtaW5lcyBpZiBhIGJsb2NrIHdpdGhcbiAqIGEgc3BlY2lmaWMgbmFtZSBjYW0gYmUgY29ubmVjdGVkIHRvIGEgYGZvcmAgYmxvY2suXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0Nvbm5lY3RlZEZvckxvb3BCbG9jayhuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIG5hbWUgPT09ICdlbXB0eSc7XG59XG5cbi8qKlxuICogUHJlZGljYXRlIGZ1bmN0aW9uIHRoYXQgZGV0ZXJtaW5lcyBpZiBhIGJsb2NrIHdpdGhcbiAqIGEgc3BlY2lmaWMgbmFtZSBjYW0gYmUgY29ubmVjdGVkIHRvIGFuIGBpZmAgYmxvY2suXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0Nvbm5lY3RlZElmTG9vcEJsb2NrKG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gbmFtZSA9PT0gJ2Vsc2UnIHx8IEVMU0VfSUZfUEFUVEVSTi50ZXN0KG5hbWUpO1xufVxuXG4vKiogQ3JlYXRlcyBhbiBgaWZgIGxvb3AgYmxvY2sgZnJvbSBhbiBIVE1MIEFTVCBub2RlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUlmQmxvY2soXG4gICAgYXN0OiBodG1sLkJsb2NrLCBjb25uZWN0ZWRCbG9ja3M6IGh0bWwuQmxvY2tbXSwgdmlzaXRvcjogaHRtbC5WaXNpdG9yLFxuICAgIGJpbmRpbmdQYXJzZXI6IEJpbmRpbmdQYXJzZXIpOiB7bm9kZTogdC5JZkJsb2NrfG51bGwsIGVycm9yczogUGFyc2VFcnJvcltdfSB7XG4gIGNvbnN0IGVycm9yczogUGFyc2VFcnJvcltdID0gdmFsaWRhdGVJZkNvbm5lY3RlZEJsb2Nrcyhjb25uZWN0ZWRCbG9ja3MpO1xuICBjb25zdCBicmFuY2hlczogdC5JZkJsb2NrQnJhbmNoW10gPSBbXTtcbiAgY29uc3QgbWFpbkJsb2NrUGFyYW1zID0gcGFyc2VDb25kaXRpb25hbEJsb2NrUGFyYW1ldGVycyhhc3QsIGVycm9ycywgYmluZGluZ1BhcnNlcik7XG5cbiAgaWYgKG1haW5CbG9ja1BhcmFtcyAhPT0gbnVsbCkge1xuICAgIGJyYW5jaGVzLnB1c2gobmV3IHQuSWZCbG9ja0JyYW5jaChcbiAgICAgICAgbWFpbkJsb2NrUGFyYW1zLmV4cHJlc3Npb24sIGh0bWwudmlzaXRBbGwodmlzaXRvciwgYXN0LmNoaWxkcmVuLCBhc3QuY2hpbGRyZW4pLFxuICAgICAgICBtYWluQmxvY2tQYXJhbXMuZXhwcmVzc2lvbkFsaWFzLCBhc3Quc291cmNlU3BhbiwgYXN0LnN0YXJ0U291cmNlU3BhbiwgYXN0LmVuZFNvdXJjZVNwYW4sXG4gICAgICAgIGFzdC5uYW1lU3BhbiwgYXN0LmkxOG4pKTtcbiAgfVxuXG4gIGZvciAoY29uc3QgYmxvY2sgb2YgY29ubmVjdGVkQmxvY2tzKSB7XG4gICAgaWYgKEVMU0VfSUZfUEFUVEVSTi50ZXN0KGJsb2NrLm5hbWUpKSB7XG4gICAgICBjb25zdCBwYXJhbXMgPSBwYXJzZUNvbmRpdGlvbmFsQmxvY2tQYXJhbWV0ZXJzKGJsb2NrLCBlcnJvcnMsIGJpbmRpbmdQYXJzZXIpO1xuXG4gICAgICBpZiAocGFyYW1zICE9PSBudWxsKSB7XG4gICAgICAgIGNvbnN0IGNoaWxkcmVuID0gaHRtbC52aXNpdEFsbCh2aXNpdG9yLCBibG9jay5jaGlsZHJlbiwgYmxvY2suY2hpbGRyZW4pO1xuICAgICAgICBicmFuY2hlcy5wdXNoKG5ldyB0LklmQmxvY2tCcmFuY2goXG4gICAgICAgICAgICBwYXJhbXMuZXhwcmVzc2lvbiwgY2hpbGRyZW4sIHBhcmFtcy5leHByZXNzaW9uQWxpYXMsIGJsb2NrLnNvdXJjZVNwYW4sXG4gICAgICAgICAgICBibG9jay5zdGFydFNvdXJjZVNwYW4sIGJsb2NrLmVuZFNvdXJjZVNwYW4sIGJsb2NrLm5hbWVTcGFuLCBibG9jay5pMThuKSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChibG9jay5uYW1lID09PSAnZWxzZScpIHtcbiAgICAgIGNvbnN0IGNoaWxkcmVuID0gaHRtbC52aXNpdEFsbCh2aXNpdG9yLCBibG9jay5jaGlsZHJlbiwgYmxvY2suY2hpbGRyZW4pO1xuICAgICAgYnJhbmNoZXMucHVzaChuZXcgdC5JZkJsb2NrQnJhbmNoKFxuICAgICAgICAgIG51bGwsIGNoaWxkcmVuLCBudWxsLCBibG9jay5zb3VyY2VTcGFuLCBibG9jay5zdGFydFNvdXJjZVNwYW4sIGJsb2NrLmVuZFNvdXJjZVNwYW4sXG4gICAgICAgICAgYmxvY2submFtZVNwYW4sIGJsb2NrLmkxOG4pKTtcbiAgICB9XG4gIH1cblxuICAvLyBUaGUgb3V0ZXIgSWZCbG9jayBzaG91bGQgaGF2ZSBhIHNwYW4gdGhhdCBlbmNhcHN1bGF0ZXMgYWxsIGJyYW5jaGVzLlxuICBjb25zdCBpZkJsb2NrU3RhcnRTb3VyY2VTcGFuID1cbiAgICAgIGJyYW5jaGVzLmxlbmd0aCA+IDAgPyBicmFuY2hlc1swXS5zdGFydFNvdXJjZVNwYW4gOiBhc3Quc3RhcnRTb3VyY2VTcGFuO1xuICBjb25zdCBpZkJsb2NrRW5kU291cmNlU3BhbiA9XG4gICAgICBicmFuY2hlcy5sZW5ndGggPiAwID8gYnJhbmNoZXNbYnJhbmNoZXMubGVuZ3RoIC0gMV0uZW5kU291cmNlU3BhbiA6IGFzdC5lbmRTb3VyY2VTcGFuO1xuXG4gIGxldCB3aG9sZVNvdXJjZVNwYW4gPSBhc3Quc291cmNlU3BhbjtcbiAgY29uc3QgbGFzdEJyYW5jaCA9IGJyYW5jaGVzW2JyYW5jaGVzLmxlbmd0aCAtIDFdO1xuICBpZiAobGFzdEJyYW5jaCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgd2hvbGVTb3VyY2VTcGFuID0gbmV3IFBhcnNlU291cmNlU3BhbihpZkJsb2NrU3RhcnRTb3VyY2VTcGFuLnN0YXJ0LCBsYXN0QnJhbmNoLnNvdXJjZVNwYW4uZW5kKTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgbm9kZTogbmV3IHQuSWZCbG9jayhcbiAgICAgICAgYnJhbmNoZXMsIHdob2xlU291cmNlU3BhbiwgYXN0LnN0YXJ0U291cmNlU3BhbiwgaWZCbG9ja0VuZFNvdXJjZVNwYW4sIGFzdC5uYW1lU3BhbiksXG4gICAgZXJyb3JzLFxuICB9O1xufVxuXG4vKiogQ3JlYXRlcyBhIGBmb3JgIGxvb3AgYmxvY2sgZnJvbSBhbiBIVE1MIEFTVCBub2RlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUZvckxvb3AoXG4gICAgYXN0OiBodG1sLkJsb2NrLCBjb25uZWN0ZWRCbG9ja3M6IGh0bWwuQmxvY2tbXSwgdmlzaXRvcjogaHRtbC5WaXNpdG9yLFxuICAgIGJpbmRpbmdQYXJzZXI6IEJpbmRpbmdQYXJzZXIpOiB7bm9kZTogdC5Gb3JMb29wQmxvY2t8bnVsbCwgZXJyb3JzOiBQYXJzZUVycm9yW119IHtcbiAgY29uc3QgZXJyb3JzOiBQYXJzZUVycm9yW10gPSBbXTtcbiAgY29uc3QgcGFyYW1zID0gcGFyc2VGb3JMb29wUGFyYW1ldGVycyhhc3QsIGVycm9ycywgYmluZGluZ1BhcnNlcik7XG4gIGxldCBub2RlOiB0LkZvckxvb3BCbG9ja3xudWxsID0gbnVsbDtcbiAgbGV0IGVtcHR5OiB0LkZvckxvb3BCbG9ja0VtcHR5fG51bGwgPSBudWxsO1xuXG4gIGZvciAoY29uc3QgYmxvY2sgb2YgY29ubmVjdGVkQmxvY2tzKSB7XG4gICAgaWYgKGJsb2NrLm5hbWUgPT09ICdlbXB0eScpIHtcbiAgICAgIGlmIChlbXB0eSAhPT0gbnVsbCkge1xuICAgICAgICBlcnJvcnMucHVzaChuZXcgUGFyc2VFcnJvcihibG9jay5zb3VyY2VTcGFuLCAnQGZvciBsb29wIGNhbiBvbmx5IGhhdmUgb25lIEBlbXB0eSBibG9jaycpKTtcbiAgICAgIH0gZWxzZSBpZiAoYmxvY2sucGFyYW1ldGVycy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGVycm9ycy5wdXNoKG5ldyBQYXJzZUVycm9yKGJsb2NrLnNvdXJjZVNwYW4sICdAZW1wdHkgYmxvY2sgY2Fubm90IGhhdmUgcGFyYW1ldGVycycpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVtcHR5ID0gbmV3IHQuRm9yTG9vcEJsb2NrRW1wdHkoXG4gICAgICAgICAgICBodG1sLnZpc2l0QWxsKHZpc2l0b3IsIGJsb2NrLmNoaWxkcmVuLCBibG9jay5jaGlsZHJlbiksIGJsb2NrLnNvdXJjZVNwYW4sXG4gICAgICAgICAgICBibG9jay5zdGFydFNvdXJjZVNwYW4sIGJsb2NrLmVuZFNvdXJjZVNwYW4sIGJsb2NrLm5hbWVTcGFuLCBibG9jay5pMThuKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZXJyb3JzLnB1c2gobmV3IFBhcnNlRXJyb3IoYmxvY2suc291cmNlU3BhbiwgYFVucmVjb2duaXplZCBAZm9yIGxvb3AgYmxvY2sgXCIke2Jsb2NrLm5hbWV9XCJgKSk7XG4gICAgfVxuICB9XG5cblxuICBpZiAocGFyYW1zICE9PSBudWxsKSB7XG4gICAgaWYgKHBhcmFtcy50cmFja0J5ID09PSBudWxsKSB7XG4gICAgICAvLyBUT0RPOiBXZSBzaG91bGQgbm90IGZhaWwgaGVyZSwgYW5kIGluc3RlYWQgdHJ5IHRvIHByb2R1Y2Ugc29tZSBBU1QgZm9yIHRoZSBsYW5ndWFnZVxuICAgICAgLy8gc2VydmljZS5cbiAgICAgIGVycm9ycy5wdXNoKG5ldyBQYXJzZUVycm9yKGFzdC5zb3VyY2VTcGFuLCAnQGZvciBsb29wIG11c3QgaGF2ZSBhIFwidHJhY2tcIiBleHByZXNzaW9uJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUaGUgYGZvcmAgYmxvY2sgaGFzIGEgbWFpbiBzcGFuIHRoYXQgaW5jbHVkZXMgdGhlIGBlbXB0eWAgYnJhbmNoLiBGb3Igb25seSB0aGUgc3BhbiBvZiB0aGVcbiAgICAgIC8vIG1haW4gYGZvcmAgYm9keSwgdXNlIGBtYWluU291cmNlU3BhbmAuXG4gICAgICBjb25zdCBlbmRTcGFuID0gZW1wdHk/LmVuZFNvdXJjZVNwYW4gPz8gYXN0LmVuZFNvdXJjZVNwYW47XG4gICAgICBjb25zdCBzb3VyY2VTcGFuID1cbiAgICAgICAgICBuZXcgUGFyc2VTb3VyY2VTcGFuKGFzdC5zb3VyY2VTcGFuLnN0YXJ0LCBlbmRTcGFuPy5lbmQgPz8gYXN0LnNvdXJjZVNwYW4uZW5kKTtcbiAgICAgIG5vZGUgPSBuZXcgdC5Gb3JMb29wQmxvY2soXG4gICAgICAgICAgcGFyYW1zLml0ZW1OYW1lLCBwYXJhbXMuZXhwcmVzc2lvbiwgcGFyYW1zLnRyYWNrQnkuZXhwcmVzc2lvbiwgcGFyYW1zLnRyYWNrQnkua2V5d29yZFNwYW4sXG4gICAgICAgICAgcGFyYW1zLmNvbnRleHQsIGh0bWwudmlzaXRBbGwodmlzaXRvciwgYXN0LmNoaWxkcmVuLCBhc3QuY2hpbGRyZW4pLCBlbXB0eSwgc291cmNlU3BhbixcbiAgICAgICAgICBhc3Quc291cmNlU3BhbiwgYXN0LnN0YXJ0U291cmNlU3BhbiwgZW5kU3BhbiwgYXN0Lm5hbWVTcGFuLCBhc3QuaTE4bik7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHtub2RlLCBlcnJvcnN9O1xufVxuXG4vKiogQ3JlYXRlcyBhIHN3aXRjaCBibG9jayBmcm9tIGFuIEhUTUwgQVNUIG5vZGUuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3dpdGNoQmxvY2soXG4gICAgYXN0OiBodG1sLkJsb2NrLCB2aXNpdG9yOiBodG1sLlZpc2l0b3IsXG4gICAgYmluZGluZ1BhcnNlcjogQmluZGluZ1BhcnNlcik6IHtub2RlOiB0LlN3aXRjaEJsb2NrfG51bGwsIGVycm9yczogUGFyc2VFcnJvcltdfSB7XG4gIGNvbnN0IGVycm9ycyA9IHZhbGlkYXRlU3dpdGNoQmxvY2soYXN0KTtcbiAgY29uc3QgcHJpbWFyeUV4cHJlc3Npb24gPSBhc3QucGFyYW1ldGVycy5sZW5ndGggPiAwID9cbiAgICAgIHBhcnNlQmxvY2tQYXJhbWV0ZXJUb0JpbmRpbmcoYXN0LnBhcmFtZXRlcnNbMF0sIGJpbmRpbmdQYXJzZXIpIDpcbiAgICAgIGJpbmRpbmdQYXJzZXIucGFyc2VCaW5kaW5nKCcnLCBmYWxzZSwgYXN0LnNvdXJjZVNwYW4sIDApO1xuICBjb25zdCBjYXNlczogdC5Td2l0Y2hCbG9ja0Nhc2VbXSA9IFtdO1xuICBjb25zdCB1bmtub3duQmxvY2tzOiB0LlVua25vd25CbG9ja1tdID0gW107XG4gIGxldCBkZWZhdWx0Q2FzZTogdC5Td2l0Y2hCbG9ja0Nhc2V8bnVsbCA9IG51bGw7XG5cbiAgLy8gSGVyZSB3ZSBhc3N1bWUgdGhhdCBhbGwgdGhlIGJsb2NrcyBhcmUgdmFsaWQgZ2l2ZW4gdGhhdCB3ZSB2YWxpZGF0ZWQgdGhlbSBhYm92ZS5cbiAgZm9yIChjb25zdCBub2RlIG9mIGFzdC5jaGlsZHJlbikge1xuICAgIGlmICghKG5vZGUgaW5zdGFuY2VvZiBodG1sLkJsb2NrKSkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgaWYgKChub2RlLm5hbWUgIT09ICdjYXNlJyB8fCBub2RlLnBhcmFtZXRlcnMubGVuZ3RoID09PSAwKSAmJiBub2RlLm5hbWUgIT09ICdkZWZhdWx0Jykge1xuICAgICAgdW5rbm93bkJsb2Nrcy5wdXNoKG5ldyB0LlVua25vd25CbG9jayhub2RlLm5hbWUsIG5vZGUuc291cmNlU3Bhbiwgbm9kZS5uYW1lU3BhbikpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgY29uc3QgZXhwcmVzc2lvbiA9IG5vZGUubmFtZSA9PT0gJ2Nhc2UnID9cbiAgICAgICAgcGFyc2VCbG9ja1BhcmFtZXRlclRvQmluZGluZyhub2RlLnBhcmFtZXRlcnNbMF0sIGJpbmRpbmdQYXJzZXIpIDpcbiAgICAgICAgbnVsbDtcbiAgICBjb25zdCBhc3QgPSBuZXcgdC5Td2l0Y2hCbG9ja0Nhc2UoXG4gICAgICAgIGV4cHJlc3Npb24sIGh0bWwudmlzaXRBbGwodmlzaXRvciwgbm9kZS5jaGlsZHJlbiwgbm9kZS5jaGlsZHJlbiksIG5vZGUuc291cmNlU3BhbixcbiAgICAgICAgbm9kZS5zdGFydFNvdXJjZVNwYW4sIG5vZGUuZW5kU291cmNlU3Bhbiwgbm9kZS5uYW1lU3Bhbiwgbm9kZS5pMThuKTtcblxuICAgIGlmIChleHByZXNzaW9uID09PSBudWxsKSB7XG4gICAgICBkZWZhdWx0Q2FzZSA9IGFzdDtcbiAgICB9IGVsc2Uge1xuICAgICAgY2FzZXMucHVzaChhc3QpO1xuICAgIH1cbiAgfVxuXG4gIC8vIEVuc3VyZSB0aGF0IHRoZSBkZWZhdWx0IGNhc2UgaXMgbGFzdCBpbiB0aGUgYXJyYXkuXG4gIGlmIChkZWZhdWx0Q2FzZSAhPT0gbnVsbCkge1xuICAgIGNhc2VzLnB1c2goZGVmYXVsdENhc2UpO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBub2RlOiBuZXcgdC5Td2l0Y2hCbG9jayhcbiAgICAgICAgcHJpbWFyeUV4cHJlc3Npb24sIGNhc2VzLCB1bmtub3duQmxvY2tzLCBhc3Quc291cmNlU3BhbiwgYXN0LnN0YXJ0U291cmNlU3BhbixcbiAgICAgICAgYXN0LmVuZFNvdXJjZVNwYW4sIGFzdC5uYW1lU3BhbiksXG4gICAgZXJyb3JzXG4gIH07XG59XG5cbi8qKiBQYXJzZXMgdGhlIHBhcmFtZXRlcnMgb2YgYSBgZm9yYCBsb29wIGJsb2NrLiAqL1xuZnVuY3Rpb24gcGFyc2VGb3JMb29wUGFyYW1ldGVycyhcbiAgICBibG9jazogaHRtbC5CbG9jaywgZXJyb3JzOiBQYXJzZUVycm9yW10sIGJpbmRpbmdQYXJzZXI6IEJpbmRpbmdQYXJzZXIpIHtcbiAgaWYgKGJsb2NrLnBhcmFtZXRlcnMubGVuZ3RoID09PSAwKSB7XG4gICAgZXJyb3JzLnB1c2gobmV3IFBhcnNlRXJyb3IoYmxvY2suc291cmNlU3BhbiwgJ0Bmb3IgbG9vcCBkb2VzIG5vdCBoYXZlIGFuIGV4cHJlc3Npb24nKSk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBjb25zdCBbZXhwcmVzc2lvblBhcmFtLCAuLi5zZWNvbmRhcnlQYXJhbXNdID0gYmxvY2sucGFyYW1ldGVycztcbiAgY29uc3QgbWF0Y2ggPVxuICAgICAgc3RyaXBPcHRpb25hbFBhcmVudGhlc2VzKGV4cHJlc3Npb25QYXJhbSwgZXJyb3JzKT8ubWF0Y2goRk9SX0xPT1BfRVhQUkVTU0lPTl9QQVRURVJOKTtcblxuICBpZiAoIW1hdGNoIHx8IG1hdGNoWzJdLnRyaW0oKS5sZW5ndGggPT09IDApIHtcbiAgICBlcnJvcnMucHVzaChuZXcgUGFyc2VFcnJvcihcbiAgICAgICAgZXhwcmVzc2lvblBhcmFtLnNvdXJjZVNwYW4sXG4gICAgICAgICdDYW5ub3QgcGFyc2UgZXhwcmVzc2lvbi4gQGZvciBsb29wIGV4cHJlc3Npb24gbXVzdCBtYXRjaCB0aGUgcGF0dGVybiBcIjxpZGVudGlmaWVyPiBvZiA8ZXhwcmVzc2lvbj5cIicpKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNvbnN0IFssIGl0ZW1OYW1lLCByYXdFeHByZXNzaW9uXSA9IG1hdGNoO1xuICAvLyBgZXhwcmVzc2lvblBhcmFtLmV4cHJlc3Npb25gIGNvbnRhaW5zIHRoZSB2YXJpYWJsZSBkZWNsYXJhdGlvbiBhbmQgdGhlIGV4cHJlc3Npb24gb2YgdGhlXG4gIC8vIGZvci4uLm9mIHN0YXRlbWVudCwgaS5lLiAndXNlciBvZiB1c2VycycgVGhlIHZhcmlhYmxlIG9mIGEgRm9yT2ZTdGF0ZW1lbnQgaXMgX29ubHlfIHRoZSBcImNvbnN0XG4gIC8vIHVzZXJcIiBwYXJ0IGFuZCBkb2VzIG5vdCBpbmNsdWRlIFwib2YgeFwiLlxuICBjb25zdCB2YXJpYWJsZU5hbWUgPSBleHByZXNzaW9uUGFyYW0uZXhwcmVzc2lvbi5zcGxpdCgnICcpWzBdO1xuICBjb25zdCB2YXJpYWJsZVNwYW4gPSBuZXcgUGFyc2VTb3VyY2VTcGFuKFxuICAgICAgZXhwcmVzc2lvblBhcmFtLnNvdXJjZVNwYW4uc3RhcnQsXG4gICAgICBleHByZXNzaW9uUGFyYW0uc291cmNlU3Bhbi5zdGFydC5tb3ZlQnkodmFyaWFibGVOYW1lLmxlbmd0aCkpO1xuICBjb25zdCByZXN1bHQgPSB7XG4gICAgaXRlbU5hbWU6IG5ldyB0LlZhcmlhYmxlKGl0ZW1OYW1lLCAnJGltcGxpY2l0JywgdmFyaWFibGVTcGFuLCB2YXJpYWJsZVNwYW4pLFxuICAgIHRyYWNrQnk6IG51bGwgYXMge2V4cHJlc3Npb246IEFTVFdpdGhTb3VyY2UsIGtleXdvcmRTcGFuOiBQYXJzZVNvdXJjZVNwYW59IHwgbnVsbCxcbiAgICBleHByZXNzaW9uOiBwYXJzZUJsb2NrUGFyYW1ldGVyVG9CaW5kaW5nKGV4cHJlc3Npb25QYXJhbSwgYmluZGluZ1BhcnNlciwgcmF3RXhwcmVzc2lvbiksXG4gICAgY29udGV4dDoge30gYXMgdC5Gb3JMb29wQmxvY2tDb250ZXh0LFxuICB9O1xuXG4gIGZvciAoY29uc3QgcGFyYW0gb2Ygc2Vjb25kYXJ5UGFyYW1zKSB7XG4gICAgY29uc3QgbGV0TWF0Y2ggPSBwYXJhbS5leHByZXNzaW9uLm1hdGNoKEZPUl9MT09QX0xFVF9QQVRURVJOKTtcblxuICAgIGlmIChsZXRNYXRjaCAhPT0gbnVsbCkge1xuICAgICAgY29uc3QgdmFyaWFibGVzU3BhbiA9IG5ldyBQYXJzZVNvdXJjZVNwYW4oXG4gICAgICAgICAgcGFyYW0uc291cmNlU3Bhbi5zdGFydC5tb3ZlQnkobGV0TWF0Y2hbMF0ubGVuZ3RoIC0gbGV0TWF0Y2hbMV0ubGVuZ3RoKSxcbiAgICAgICAgICBwYXJhbS5zb3VyY2VTcGFuLmVuZCk7XG4gICAgICBwYXJzZUxldFBhcmFtZXRlcihwYXJhbS5zb3VyY2VTcGFuLCBsZXRNYXRjaFsxXSwgdmFyaWFibGVzU3BhbiwgcmVzdWx0LmNvbnRleHQsIGVycm9ycyk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBjb25zdCB0cmFja01hdGNoID0gcGFyYW0uZXhwcmVzc2lvbi5tYXRjaChGT1JfTE9PUF9UUkFDS19QQVRURVJOKTtcblxuICAgIGlmICh0cmFja01hdGNoICE9PSBudWxsKSB7XG4gICAgICBpZiAocmVzdWx0LnRyYWNrQnkgIT09IG51bGwpIHtcbiAgICAgICAgZXJyb3JzLnB1c2goXG4gICAgICAgICAgICBuZXcgUGFyc2VFcnJvcihwYXJhbS5zb3VyY2VTcGFuLCAnQGZvciBsb29wIGNhbiBvbmx5IGhhdmUgb25lIFwidHJhY2tcIiBleHByZXNzaW9uJykpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgZXhwcmVzc2lvbiA9IHBhcnNlQmxvY2tQYXJhbWV0ZXJUb0JpbmRpbmcocGFyYW0sIGJpbmRpbmdQYXJzZXIsIHRyYWNrTWF0Y2hbMV0pO1xuICAgICAgICBpZiAoZXhwcmVzc2lvbi5hc3QgaW5zdGFuY2VvZiBFbXB0eUV4cHIpIHtcbiAgICAgICAgICBlcnJvcnMucHVzaChuZXcgUGFyc2VFcnJvcihwYXJhbS5zb3VyY2VTcGFuLCAnQGZvciBsb29wIG11c3QgaGF2ZSBhIFwidHJhY2tcIiBleHByZXNzaW9uJykpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGtleXdvcmRTcGFuID0gbmV3IFBhcnNlU291cmNlU3BhbihcbiAgICAgICAgICAgIHBhcmFtLnNvdXJjZVNwYW4uc3RhcnQsIHBhcmFtLnNvdXJjZVNwYW4uc3RhcnQubW92ZUJ5KCd0cmFjaycubGVuZ3RoKSk7XG4gICAgICAgIHJlc3VsdC50cmFja0J5ID0ge2V4cHJlc3Npb24sIGtleXdvcmRTcGFufTtcbiAgICAgIH1cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGVycm9ycy5wdXNoKFxuICAgICAgICBuZXcgUGFyc2VFcnJvcihwYXJhbS5zb3VyY2VTcGFuLCBgVW5yZWNvZ25pemVkIEBmb3IgbG9vcCBwYXJhbWF0ZXIgXCIke3BhcmFtLmV4cHJlc3Npb259XCJgKSk7XG4gIH1cblxuICAvLyBGaWxsIG91dCBhbnkgdmFyaWFibGVzIHRoYXQgaGF2ZW4ndCBiZWVuIGRlZmluZWQgZXhwbGljaXRseS5cbiAgZm9yIChjb25zdCB2YXJpYWJsZU5hbWUgb2YgQUxMT1dFRF9GT1JfTE9PUF9MRVRfVkFSSUFCTEVTKSB7XG4gICAgaWYgKCFyZXN1bHQuY29udGV4dC5oYXNPd25Qcm9wZXJ0eSh2YXJpYWJsZU5hbWUpKSB7XG4gICAgICAvLyBHaXZlIGFtYmllbnRseS1hdmFpbGFibGUgY29udGV4dCB2YXJpYWJsZXMgZW1wdHkgc3BhbnMgYXQgdGhlIGVuZCBvZiB0aGUgc3RhcnQgb2YgdGhlIGBmb3JgXG4gICAgICAvLyBibG9jaywgc2luY2UgdGhleSBhcmUgbm90IGV4cGxpY2l0bHkgZGVmaW5lZC5cbiAgICAgIGNvbnN0IGVtcHR5U3BhbkFmdGVyRm9yQmxvY2tTdGFydCA9XG4gICAgICAgICAgbmV3IFBhcnNlU291cmNlU3BhbihibG9jay5zdGFydFNvdXJjZVNwYW4uZW5kLCBibG9jay5zdGFydFNvdXJjZVNwYW4uZW5kKTtcbiAgICAgIHJlc3VsdC5jb250ZXh0W3ZhcmlhYmxlTmFtZV0gPSBuZXcgdC5WYXJpYWJsZShcbiAgICAgICAgICB2YXJpYWJsZU5hbWUsIHZhcmlhYmxlTmFtZSwgZW1wdHlTcGFuQWZ0ZXJGb3JCbG9ja1N0YXJ0LCBlbXB0eVNwYW5BZnRlckZvckJsb2NrU3RhcnQpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKiBQYXJzZXMgdGhlIGBsZXRgIHBhcmFtZXRlciBvZiBhIGBmb3JgIGxvb3AgYmxvY2suICovXG5mdW5jdGlvbiBwYXJzZUxldFBhcmFtZXRlcihcbiAgICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sIGV4cHJlc3Npb246IHN0cmluZywgc3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgIGNvbnRleHQ6IHQuRm9yTG9vcEJsb2NrQ29udGV4dCwgZXJyb3JzOiBQYXJzZUVycm9yW10pOiB2b2lkIHtcbiAgY29uc3QgcGFydHMgPSBleHByZXNzaW9uLnNwbGl0KCcsJyk7XG4gIGxldCBzdGFydFNwYW4gPSBzcGFuLnN0YXJ0O1xuICBmb3IgKGNvbnN0IHBhcnQgb2YgcGFydHMpIHtcbiAgICBjb25zdCBleHByZXNzaW9uUGFydHMgPSBwYXJ0LnNwbGl0KCc9Jyk7XG4gICAgY29uc3QgbmFtZSA9IGV4cHJlc3Npb25QYXJ0cy5sZW5ndGggPT09IDIgPyBleHByZXNzaW9uUGFydHNbMF0udHJpbSgpIDogJyc7XG4gICAgY29uc3QgdmFyaWFibGVOYW1lID0gKGV4cHJlc3Npb25QYXJ0cy5sZW5ndGggPT09IDIgPyBleHByZXNzaW9uUGFydHNbMV0udHJpbSgpIDogJycpIGFzXG4gICAgICAgIGtleW9mIHQuRm9yTG9vcEJsb2NrQ29udGV4dDtcblxuICAgIGlmIChuYW1lLmxlbmd0aCA9PT0gMCB8fCB2YXJpYWJsZU5hbWUubGVuZ3RoID09PSAwKSB7XG4gICAgICBlcnJvcnMucHVzaChuZXcgUGFyc2VFcnJvcihcbiAgICAgICAgICBzb3VyY2VTcGFuLFxuICAgICAgICAgIGBJbnZhbGlkIEBmb3IgbG9vcCBcImxldFwiIHBhcmFtZXRlci4gUGFyYW1ldGVyIHNob3VsZCBtYXRjaCB0aGUgcGF0dGVybiBcIjxuYW1lPiA9IDx2YXJpYWJsZSBuYW1lPlwiYCkpO1xuICAgIH0gZWxzZSBpZiAoIUFMTE9XRURfRk9SX0xPT1BfTEVUX1ZBUklBQkxFUy5oYXModmFyaWFibGVOYW1lKSkge1xuICAgICAgZXJyb3JzLnB1c2gobmV3IFBhcnNlRXJyb3IoXG4gICAgICAgICAgc291cmNlU3BhbixcbiAgICAgICAgICBgVW5rbm93biBcImxldFwiIHBhcmFtZXRlciB2YXJpYWJsZSBcIiR7dmFyaWFibGVOYW1lfVwiLiBUaGUgYWxsb3dlZCB2YXJpYWJsZXMgYXJlOiAke1xuICAgICAgICAgICAgICBBcnJheS5mcm9tKEFMTE9XRURfRk9SX0xPT1BfTEVUX1ZBUklBQkxFUykuam9pbignLCAnKX1gKSk7XG4gICAgfSBlbHNlIGlmIChjb250ZXh0Lmhhc093blByb3BlcnR5KHZhcmlhYmxlTmFtZSkpIHtcbiAgICAgIGVycm9ycy5wdXNoKFxuICAgICAgICAgIG5ldyBQYXJzZUVycm9yKHNvdXJjZVNwYW4sIGBEdXBsaWNhdGUgXCJsZXRcIiBwYXJhbWV0ZXIgdmFyaWFibGUgXCIke3ZhcmlhYmxlTmFtZX1cImApKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgWywga2V5TGVhZGluZ1doaXRlc3BhY2UsIGtleU5hbWVdID1cbiAgICAgICAgICBleHByZXNzaW9uUGFydHNbMF0ubWF0Y2goQ0hBUkFDVEVSU19JTl9TVVJST1VORElOR19XSElURVNQQUNFX1BBVFRFUk4pID8/IFtdO1xuICAgICAgY29uc3Qga2V5U3BhbiA9IGtleUxlYWRpbmdXaGl0ZXNwYWNlICE9PSB1bmRlZmluZWQgJiYgZXhwcmVzc2lvblBhcnRzLmxlbmd0aCA9PT0gMiA/XG4gICAgICAgICAgbmV3IFBhcnNlU291cmNlU3BhbihcbiAgICAgICAgICAgICAgLyogc3RyaXAgbGVhZGluZyBzcGFjZXMgKi9cbiAgICAgICAgICAgICAgc3RhcnRTcGFuLm1vdmVCeShrZXlMZWFkaW5nV2hpdGVzcGFjZS5sZW5ndGgpLFxuICAgICAgICAgICAgICAvKiBhZHZhbmNlIHRvIGVuZCBvZiB0aGUgdmFyaWFibGUgbmFtZSAqL1xuICAgICAgICAgICAgICBzdGFydFNwYW4ubW92ZUJ5KGtleUxlYWRpbmdXaGl0ZXNwYWNlLmxlbmd0aCArIGtleU5hbWUubGVuZ3RoKSkgOlxuICAgICAgICAgIHNwYW47XG5cbiAgICAgIGxldCB2YWx1ZVNwYW46IFBhcnNlU291cmNlU3Bhbnx1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgICBpZiAoZXhwcmVzc2lvblBhcnRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgICBjb25zdCBbLCB2YWx1ZUxlYWRpbmdXaGl0ZXNwYWNlLCBpbXBsaWNpdF0gPVxuICAgICAgICAgICAgZXhwcmVzc2lvblBhcnRzWzFdLm1hdGNoKENIQVJBQ1RFUlNfSU5fU1VSUk9VTkRJTkdfV0hJVEVTUEFDRV9QQVRURVJOKSA/PyBbXTtcbiAgICAgICAgdmFsdWVTcGFuID0gdmFsdWVMZWFkaW5nV2hpdGVzcGFjZSAhPT0gdW5kZWZpbmVkID9cbiAgICAgICAgICAgIG5ldyBQYXJzZVNvdXJjZVNwYW4oXG4gICAgICAgICAgICAgICAgc3RhcnRTcGFuLm1vdmVCeShleHByZXNzaW9uUGFydHNbMF0ubGVuZ3RoICsgMSArIHZhbHVlTGVhZGluZ1doaXRlc3BhY2UubGVuZ3RoKSxcbiAgICAgICAgICAgICAgICBzdGFydFNwYW4ubW92ZUJ5KFxuICAgICAgICAgICAgICAgICAgICBleHByZXNzaW9uUGFydHNbMF0ubGVuZ3RoICsgMSArIHZhbHVlTGVhZGluZ1doaXRlc3BhY2UubGVuZ3RoICtcbiAgICAgICAgICAgICAgICAgICAgaW1wbGljaXQubGVuZ3RoKSkgOlxuICAgICAgICAgICAgdW5kZWZpbmVkO1xuICAgICAgfVxuICAgICAgY29uc3Qgc291cmNlU3BhbiA9IG5ldyBQYXJzZVNvdXJjZVNwYW4oa2V5U3Bhbi5zdGFydCwgdmFsdWVTcGFuPy5lbmQgPz8ga2V5U3Bhbi5lbmQpO1xuICAgICAgY29udGV4dFt2YXJpYWJsZU5hbWVdID0gbmV3IHQuVmFyaWFibGUobmFtZSwgdmFyaWFibGVOYW1lLCBzb3VyY2VTcGFuLCBrZXlTcGFuLCB2YWx1ZVNwYW4pO1xuICAgIH1cbiAgICBzdGFydFNwYW4gPSBzdGFydFNwYW4ubW92ZUJ5KHBhcnQubGVuZ3RoICsgMSAvKiBhZGQgMSB0byBtb3ZlIHBhc3QgdGhlIGNvbW1hICovKTtcbiAgfVxufVxuXG4vKipcbiAqIENoZWNrcyB0aGF0IHRoZSBzaGFwZSBvZiB0aGUgYmxvY2tzIGNvbm5lY3RlZCB0byBhblxuICogYEBpZmAgYmxvY2sgaXMgY29ycmVjdC4gUmV0dXJucyBhbiBhcnJheSBvZiBlcnJvcnMuXG4gKi9cbmZ1bmN0aW9uIHZhbGlkYXRlSWZDb25uZWN0ZWRCbG9ja3MoY29ubmVjdGVkQmxvY2tzOiBodG1sLkJsb2NrW10pOiBQYXJzZUVycm9yW10ge1xuICBjb25zdCBlcnJvcnM6IFBhcnNlRXJyb3JbXSA9IFtdO1xuICBsZXQgaGFzRWxzZSA9IGZhbHNlO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgY29ubmVjdGVkQmxvY2tzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgYmxvY2sgPSBjb25uZWN0ZWRCbG9ja3NbaV07XG5cbiAgICBpZiAoYmxvY2submFtZSA9PT0gJ2Vsc2UnKSB7XG4gICAgICBpZiAoaGFzRWxzZSkge1xuICAgICAgICBlcnJvcnMucHVzaChuZXcgUGFyc2VFcnJvcihibG9jay5zb3VyY2VTcGFuLCAnQ29uZGl0aW9uYWwgY2FuIG9ubHkgaGF2ZSBvbmUgQGVsc2UgYmxvY2snKSk7XG4gICAgICB9IGVsc2UgaWYgKGNvbm5lY3RlZEJsb2Nrcy5sZW5ndGggPiAxICYmIGkgPCBjb25uZWN0ZWRCbG9ja3MubGVuZ3RoIC0gMSkge1xuICAgICAgICBlcnJvcnMucHVzaChcbiAgICAgICAgICAgIG5ldyBQYXJzZUVycm9yKGJsb2NrLnNvdXJjZVNwYW4sICdAZWxzZSBibG9jayBtdXN0IGJlIGxhc3QgaW5zaWRlIHRoZSBjb25kaXRpb25hbCcpKTtcbiAgICAgIH0gZWxzZSBpZiAoYmxvY2sucGFyYW1ldGVycy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGVycm9ycy5wdXNoKG5ldyBQYXJzZUVycm9yKGJsb2NrLnNvdXJjZVNwYW4sICdAZWxzZSBibG9jayBjYW5ub3QgaGF2ZSBwYXJhbWV0ZXJzJykpO1xuICAgICAgfVxuICAgICAgaGFzRWxzZSA9IHRydWU7XG4gICAgfSBlbHNlIGlmICghRUxTRV9JRl9QQVRURVJOLnRlc3QoYmxvY2submFtZSkpIHtcbiAgICAgIGVycm9ycy5wdXNoKFxuICAgICAgICAgIG5ldyBQYXJzZUVycm9yKGJsb2NrLnNvdXJjZVNwYW4sIGBVbnJlY29nbml6ZWQgY29uZGl0aW9uYWwgYmxvY2sgQCR7YmxvY2submFtZX1gKSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGVycm9ycztcbn1cblxuLyoqIENoZWNrcyB0aGF0IHRoZSBzaGFwZSBvZiBhIGBzd2l0Y2hgIGJsb2NrIGlzIHZhbGlkLiBSZXR1cm5zIGFuIGFycmF5IG9mIGVycm9ycy4gKi9cbmZ1bmN0aW9uIHZhbGlkYXRlU3dpdGNoQmxvY2soYXN0OiBodG1sLkJsb2NrKTogUGFyc2VFcnJvcltdIHtcbiAgY29uc3QgZXJyb3JzOiBQYXJzZUVycm9yW10gPSBbXTtcbiAgbGV0IGhhc0RlZmF1bHQgPSBmYWxzZTtcblxuICBpZiAoYXN0LnBhcmFtZXRlcnMubGVuZ3RoICE9PSAxKSB7XG4gICAgZXJyb3JzLnB1c2gobmV3IFBhcnNlRXJyb3IoYXN0LnNvdXJjZVNwYW4sICdAc3dpdGNoIGJsb2NrIG11c3QgaGF2ZSBleGFjdGx5IG9uZSBwYXJhbWV0ZXInKSk7XG4gICAgcmV0dXJuIGVycm9ycztcbiAgfVxuXG4gIGZvciAoY29uc3Qgbm9kZSBvZiBhc3QuY2hpbGRyZW4pIHtcbiAgICAvLyBTa2lwIG92ZXIgY29tbWVudHMgYW5kIGVtcHR5IHRleHQgbm9kZXMgaW5zaWRlIHRoZSBzd2l0Y2ggYmxvY2suXG4gICAgLy8gRW1wdHkgdGV4dCBub2RlcyBjYW4gYmUgdXNlZCBmb3IgZm9ybWF0dGluZyB3aGlsZSBjb21tZW50cyBkb24ndCBhZmZlY3QgdGhlIHJ1bnRpbWUuXG4gICAgaWYgKG5vZGUgaW5zdGFuY2VvZiBodG1sLkNvbW1lbnQgfHxcbiAgICAgICAgKG5vZGUgaW5zdGFuY2VvZiBodG1sLlRleHQgJiYgbm9kZS52YWx1ZS50cmltKCkubGVuZ3RoID09PSAwKSkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgaWYgKCEobm9kZSBpbnN0YW5jZW9mIGh0bWwuQmxvY2spIHx8IChub2RlLm5hbWUgIT09ICdjYXNlJyAmJiBub2RlLm5hbWUgIT09ICdkZWZhdWx0JykpIHtcbiAgICAgIGVycm9ycy5wdXNoKG5ldyBQYXJzZUVycm9yKFxuICAgICAgICAgIG5vZGUuc291cmNlU3BhbiwgJ0Bzd2l0Y2ggYmxvY2sgY2FuIG9ubHkgY29udGFpbiBAY2FzZSBhbmQgQGRlZmF1bHQgYmxvY2tzJykpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgaWYgKG5vZGUubmFtZSA9PT0gJ2RlZmF1bHQnKSB7XG4gICAgICBpZiAoaGFzRGVmYXVsdCkge1xuICAgICAgICBlcnJvcnMucHVzaChcbiAgICAgICAgICAgIG5ldyBQYXJzZUVycm9yKG5vZGUuc291cmNlU3BhbiwgJ0Bzd2l0Y2ggYmxvY2sgY2FuIG9ubHkgaGF2ZSBvbmUgQGRlZmF1bHQgYmxvY2snKSk7XG4gICAgICB9IGVsc2UgaWYgKG5vZGUucGFyYW1ldGVycy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGVycm9ycy5wdXNoKG5ldyBQYXJzZUVycm9yKG5vZGUuc291cmNlU3BhbiwgJ0BkZWZhdWx0IGJsb2NrIGNhbm5vdCBoYXZlIHBhcmFtZXRlcnMnKSk7XG4gICAgICB9XG4gICAgICBoYXNEZWZhdWx0ID0gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKG5vZGUubmFtZSA9PT0gJ2Nhc2UnICYmIG5vZGUucGFyYW1ldGVycy5sZW5ndGggIT09IDEpIHtcbiAgICAgIGVycm9ycy5wdXNoKG5ldyBQYXJzZUVycm9yKG5vZGUuc291cmNlU3BhbiwgJ0BjYXNlIGJsb2NrIG11c3QgaGF2ZSBleGFjdGx5IG9uZSBwYXJhbWV0ZXInKSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGVycm9ycztcbn1cblxuLyoqXG4gKiBQYXJzZXMgYSBibG9jayBwYXJhbWV0ZXIgaW50byBhIGJpbmRpbmcgQVNULlxuICogQHBhcmFtIGFzdCBCbG9jayBwYXJhbWV0ZXIgdGhhdCBzaG91bGQgYmUgcGFyc2VkLlxuICogQHBhcmFtIGJpbmRpbmdQYXJzZXIgUGFyc2VyIHRoYXQgdGhlIGV4cHJlc3Npb24gc2hvdWxkIGJlIHBhcnNlZCB3aXRoLlxuICogQHBhcmFtIHBhcnQgU3BlY2lmaWMgcGFydCBvZiB0aGUgZXhwcmVzc2lvbiB0aGF0IHNob3VsZCBiZSBwYXJzZWQuXG4gKi9cbmZ1bmN0aW9uIHBhcnNlQmxvY2tQYXJhbWV0ZXJUb0JpbmRpbmcoXG4gICAgYXN0OiBodG1sLkJsb2NrUGFyYW1ldGVyLCBiaW5kaW5nUGFyc2VyOiBCaW5kaW5nUGFyc2VyLCBwYXJ0Pzogc3RyaW5nKTogQVNUV2l0aFNvdXJjZSB7XG4gIGxldCBzdGFydDogbnVtYmVyO1xuICBsZXQgZW5kOiBudW1iZXI7XG5cbiAgaWYgKHR5cGVvZiBwYXJ0ID09PSAnc3RyaW5nJykge1xuICAgIC8vIE5vdGU6IGBsYXN0SW5kZXhPZmAgaGVyZSBzaG91bGQgYmUgZW5vdWdoIHRvIGtub3cgdGhlIHN0YXJ0IGluZGV4IG9mIHRoZSBleHByZXNzaW9uLFxuICAgIC8vIGJlY2F1c2Ugd2Uga25vdyB0aGF0IGl0J2xsIGJlIGF0IHRoZSBlbmQgb2YgdGhlIHBhcmFtLiBJZGVhbGx5IHdlIGNvdWxkIHVzZSB0aGUgYGRgXG4gICAgLy8gZmxhZyB3aGVuIG1hdGNoaW5nIHZpYSByZWdleCBhbmQgZ2V0IHRoZSBpbmRleCBmcm9tIGBtYXRjaC5pbmRpY2VzYCwgYnV0IGl0J3MgdW5jbGVhclxuICAgIC8vIGlmIHdlIGNhbiB1c2UgaXQgeWV0IHNpbmNlIGl0J3MgYSByZWxhdGl2ZWx5IG5ldyBmZWF0dXJlLiBTZWU6XG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3RjMzkvcHJvcG9zYWwtcmVnZXhwLW1hdGNoLWluZGljZXNcbiAgICBzdGFydCA9IE1hdGgubWF4KDAsIGFzdC5leHByZXNzaW9uLmxhc3RJbmRleE9mKHBhcnQpKTtcbiAgICBlbmQgPSBzdGFydCArIHBhcnQubGVuZ3RoO1xuICB9IGVsc2Uge1xuICAgIHN0YXJ0ID0gMDtcbiAgICBlbmQgPSBhc3QuZXhwcmVzc2lvbi5sZW5ndGg7XG4gIH1cblxuICByZXR1cm4gYmluZGluZ1BhcnNlci5wYXJzZUJpbmRpbmcoXG4gICAgICBhc3QuZXhwcmVzc2lvbi5zbGljZShzdGFydCwgZW5kKSwgZmFsc2UsIGFzdC5zb3VyY2VTcGFuLCBhc3Quc291cmNlU3Bhbi5zdGFydC5vZmZzZXQgKyBzdGFydCk7XG59XG5cbi8qKiBQYXJzZXMgdGhlIHBhcmFtZXRlciBvZiBhIGNvbmRpdGlvbmFsIGJsb2NrIChgaWZgIG9yIGBlbHNlIGlmYCkuICovXG5mdW5jdGlvbiBwYXJzZUNvbmRpdGlvbmFsQmxvY2tQYXJhbWV0ZXJzKFxuICAgIGJsb2NrOiBodG1sLkJsb2NrLCBlcnJvcnM6IFBhcnNlRXJyb3JbXSwgYmluZGluZ1BhcnNlcjogQmluZGluZ1BhcnNlcikge1xuICBpZiAoYmxvY2sucGFyYW1ldGVycy5sZW5ndGggPT09IDApIHtcbiAgICBlcnJvcnMucHVzaChuZXcgUGFyc2VFcnJvcihibG9jay5zb3VyY2VTcGFuLCAnQ29uZGl0aW9uYWwgYmxvY2sgZG9lcyBub3QgaGF2ZSBhbiBleHByZXNzaW9uJykpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgY29uc3QgZXhwcmVzc2lvbiA9IHBhcnNlQmxvY2tQYXJhbWV0ZXJUb0JpbmRpbmcoYmxvY2sucGFyYW1ldGVyc1swXSwgYmluZGluZ1BhcnNlcik7XG4gIGxldCBleHByZXNzaW9uQWxpYXM6IHQuVmFyaWFibGV8bnVsbCA9IG51bGw7XG5cbiAgLy8gU3RhcnQgZnJvbSAxIHNpbmNlIHdlIHByb2Nlc3NlZCB0aGUgZmlyc3QgcGFyYW1ldGVyIGFscmVhZHkuXG4gIGZvciAobGV0IGkgPSAxOyBpIDwgYmxvY2sucGFyYW1ldGVycy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHBhcmFtID0gYmxvY2sucGFyYW1ldGVyc1tpXTtcbiAgICBjb25zdCBhbGlhc01hdGNoID0gcGFyYW0uZXhwcmVzc2lvbi5tYXRjaChDT05ESVRJT05BTF9BTElBU19QQVRURVJOKTtcblxuICAgIC8vIEZvciBub3cgY29uZGl0aW9uYWxzIGNhbiBvbmx5IGhhdmUgYW4gYGFzYCBwYXJhbWV0ZXIuXG4gICAgLy8gV2UgbWF5IHdhbnQgdG8gcmV3b3JrIHRoaXMgbGF0ZXIgaWYgd2UgYWRkIG1vcmUuXG4gICAgaWYgKGFsaWFzTWF0Y2ggPT09IG51bGwpIHtcbiAgICAgIGVycm9ycy5wdXNoKG5ldyBQYXJzZUVycm9yKFxuICAgICAgICAgIHBhcmFtLnNvdXJjZVNwYW4sIGBVbnJlY29nbml6ZWQgY29uZGl0aW9uYWwgcGFyYW1hdGVyIFwiJHtwYXJhbS5leHByZXNzaW9ufVwiYCkpO1xuICAgIH0gZWxzZSBpZiAoYmxvY2submFtZSAhPT0gJ2lmJykge1xuICAgICAgZXJyb3JzLnB1c2gobmV3IFBhcnNlRXJyb3IoXG4gICAgICAgICAgcGFyYW0uc291cmNlU3BhbiwgJ1wiYXNcIiBleHByZXNzaW9uIGlzIG9ubHkgYWxsb3dlZCBvbiB0aGUgcHJpbWFyeSBAaWYgYmxvY2snKSk7XG4gICAgfSBlbHNlIGlmIChleHByZXNzaW9uQWxpYXMgIT09IG51bGwpIHtcbiAgICAgIGVycm9ycy5wdXNoKFxuICAgICAgICAgIG5ldyBQYXJzZUVycm9yKHBhcmFtLnNvdXJjZVNwYW4sICdDb25kaXRpb25hbCBjYW4gb25seSBoYXZlIG9uZSBcImFzXCIgZXhwcmVzc2lvbicpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgbmFtZSA9IGFsaWFzTWF0Y2hbMl0udHJpbSgpO1xuICAgICAgY29uc3QgdmFyaWFibGVTdGFydCA9IHBhcmFtLnNvdXJjZVNwYW4uc3RhcnQubW92ZUJ5KGFsaWFzTWF0Y2hbMV0ubGVuZ3RoKTtcbiAgICAgIGNvbnN0IHZhcmlhYmxlU3BhbiA9IG5ldyBQYXJzZVNvdXJjZVNwYW4odmFyaWFibGVTdGFydCwgdmFyaWFibGVTdGFydC5tb3ZlQnkobmFtZS5sZW5ndGgpKTtcbiAgICAgIGV4cHJlc3Npb25BbGlhcyA9IG5ldyB0LlZhcmlhYmxlKG5hbWUsIG5hbWUsIHZhcmlhYmxlU3BhbiwgdmFyaWFibGVTcGFuKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4ge2V4cHJlc3Npb24sIGV4cHJlc3Npb25BbGlhc307XG59XG5cbi8qKiBTdHJpcHMgb3B0aW9uYWwgcGFyZW50aGVzZXMgYXJvdW5kIGZyb20gYSBjb250cm9sIGZyb20gZXhwcmVzc2lvbiBwYXJhbWV0ZXIuICovXG5mdW5jdGlvbiBzdHJpcE9wdGlvbmFsUGFyZW50aGVzZXMocGFyYW06IGh0bWwuQmxvY2tQYXJhbWV0ZXIsIGVycm9yczogUGFyc2VFcnJvcltdKTogc3RyaW5nfG51bGwge1xuICBjb25zdCBleHByZXNzaW9uID0gcGFyYW0uZXhwcmVzc2lvbjtcbiAgY29uc3Qgc3BhY2VSZWdleCA9IC9eXFxzJC87XG4gIGxldCBvcGVuUGFyZW5zID0gMDtcbiAgbGV0IHN0YXJ0ID0gMDtcbiAgbGV0IGVuZCA9IGV4cHJlc3Npb24ubGVuZ3RoIC0gMTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGV4cHJlc3Npb24ubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBjaGFyID0gZXhwcmVzc2lvbltpXTtcblxuICAgIGlmIChjaGFyID09PSAnKCcpIHtcbiAgICAgIHN0YXJ0ID0gaSArIDE7XG4gICAgICBvcGVuUGFyZW5zKys7XG4gICAgfSBlbHNlIGlmIChzcGFjZVJlZ2V4LnRlc3QoY2hhcikpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBpZiAob3BlblBhcmVucyA9PT0gMCkge1xuICAgIHJldHVybiBleHByZXNzaW9uO1xuICB9XG5cbiAgZm9yIChsZXQgaSA9IGV4cHJlc3Npb24ubGVuZ3RoIC0gMTsgaSA+IC0xOyBpLS0pIHtcbiAgICBjb25zdCBjaGFyID0gZXhwcmVzc2lvbltpXTtcblxuICAgIGlmIChjaGFyID09PSAnKScpIHtcbiAgICAgIGVuZCA9IGk7XG4gICAgICBvcGVuUGFyZW5zLS07XG4gICAgICBpZiAob3BlblBhcmVucyA9PT0gMCkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHNwYWNlUmVnZXgudGVzdChjaGFyKSkge1xuICAgICAgY29udGludWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIGlmIChvcGVuUGFyZW5zICE9PSAwKSB7XG4gICAgZXJyb3JzLnB1c2gobmV3IFBhcnNlRXJyb3IocGFyYW0uc291cmNlU3BhbiwgJ1VuY2xvc2VkIHBhcmVudGhlc2VzIGluIGV4cHJlc3Npb24nKSk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICByZXR1cm4gZXhwcmVzc2lvbi5zbGljZShzdGFydCwgZW5kKTtcbn1cbiJdfQ==