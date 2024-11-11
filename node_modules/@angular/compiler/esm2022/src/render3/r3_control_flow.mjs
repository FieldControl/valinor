/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
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
const ALLOWED_FOR_LOOP_LET_VARIABLES = new Set([
    '$index',
    '$first',
    '$last',
    '$even',
    '$odd',
    '$count',
]);
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
            errors.push(new ParseError(ast.startSourceSpan, '@for loop must have a "track" expression'));
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
    const primaryExpression = ast.parameters.length > 0
        ? parseBlockParameterToBinding(ast.parameters[0], bindingParser)
        : bindingParser.parseBinding('', false, ast.sourceSpan, 0);
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
        const expression = node.name === 'case' ? parseBlockParameterToBinding(node.parameters[0], bindingParser) : null;
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
        errors,
    };
}
/** Parses the parameters of a `for` loop block. */
function parseForLoopParameters(block, errors, bindingParser) {
    if (block.parameters.length === 0) {
        errors.push(new ParseError(block.startSourceSpan, '@for loop does not have an expression'));
        return null;
    }
    const [expressionParam, ...secondaryParams] = block.parameters;
    const match = stripOptionalParentheses(expressionParam, errors)?.match(FOR_LOOP_EXPRESSION_PATTERN);
    if (!match || match[2].trim().length === 0) {
        errors.push(new ParseError(expressionParam.sourceSpan, 'Cannot parse expression. @for loop expression must match the pattern "<identifier> of <expression>"'));
        return null;
    }
    const [, itemName, rawExpression] = match;
    if (ALLOWED_FOR_LOOP_LET_VARIABLES.has(itemName)) {
        errors.push(new ParseError(expressionParam.sourceSpan, `@for loop item name cannot be one of ${Array.from(ALLOWED_FOR_LOOP_LET_VARIABLES).join(', ')}.`));
    }
    // `expressionParam.expression` contains the variable declaration and the expression of the
    // for...of statement, i.e. 'user of users' The variable of a ForOfStatement is _only_ the "const
    // user" part and does not include "of x".
    const variableName = expressionParam.expression.split(' ')[0];
    const variableSpan = new ParseSourceSpan(expressionParam.sourceSpan.start, expressionParam.sourceSpan.start.moveBy(variableName.length));
    const result = {
        itemName: new t.Variable(itemName, '$implicit', variableSpan, variableSpan),
        trackBy: null,
        expression: parseBlockParameterToBinding(expressionParam, bindingParser, rawExpression),
        context: Array.from(ALLOWED_FOR_LOOP_LET_VARIABLES, (variableName) => {
            // Give ambiently-available context variables empty spans at the end of
            // the start of the `for` block, since they are not explicitly defined.
            const emptySpanAfterForBlockStart = new ParseSourceSpan(block.startSourceSpan.end, block.startSourceSpan.end);
            return new t.Variable(variableName, variableName, emptySpanAfterForBlockStart, emptySpanAfterForBlockStart);
        }),
    };
    for (const param of secondaryParams) {
        const letMatch = param.expression.match(FOR_LOOP_LET_PATTERN);
        if (letMatch !== null) {
            const variablesSpan = new ParseSourceSpan(param.sourceSpan.start.moveBy(letMatch[0].length - letMatch[1].length), param.sourceSpan.end);
            parseLetParameter(param.sourceSpan, letMatch[1], variablesSpan, itemName, result.context, errors);
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
                    errors.push(new ParseError(block.startSourceSpan, '@for loop must have a "track" expression'));
                }
                const keywordSpan = new ParseSourceSpan(param.sourceSpan.start, param.sourceSpan.start.moveBy('track'.length));
                result.trackBy = { expression, keywordSpan };
            }
            continue;
        }
        errors.push(new ParseError(param.sourceSpan, `Unrecognized @for loop paramater "${param.expression}"`));
    }
    return result;
}
/** Parses the `let` parameter of a `for` loop block. */
function parseLetParameter(sourceSpan, expression, span, loopItemName, context, errors) {
    const parts = expression.split(',');
    let startSpan = span.start;
    for (const part of parts) {
        const expressionParts = part.split('=');
        const name = expressionParts.length === 2 ? expressionParts[0].trim() : '';
        const variableName = expressionParts.length === 2 ? expressionParts[1].trim() : '';
        if (name.length === 0 || variableName.length === 0) {
            errors.push(new ParseError(sourceSpan, `Invalid @for loop "let" parameter. Parameter should match the pattern "<name> = <variable name>"`));
        }
        else if (!ALLOWED_FOR_LOOP_LET_VARIABLES.has(variableName)) {
            errors.push(new ParseError(sourceSpan, `Unknown "let" parameter variable "${variableName}". The allowed variables are: ${Array.from(ALLOWED_FOR_LOOP_LET_VARIABLES).join(', ')}`));
        }
        else if (name === loopItemName) {
            errors.push(new ParseError(sourceSpan, `Invalid @for loop "let" parameter. Variable cannot be called "${loopItemName}"`));
        }
        else if (context.some((v) => v.name === name)) {
            errors.push(new ParseError(sourceSpan, `Duplicate "let" parameter variable "${variableName}"`));
        }
        else {
            const [, keyLeadingWhitespace, keyName] = expressionParts[0].match(CHARACTERS_IN_SURROUNDING_WHITESPACE_PATTERN) ?? [];
            const keySpan = keyLeadingWhitespace !== undefined && expressionParts.length === 2
                ? new ParseSourceSpan(
                /* strip leading spaces */
                startSpan.moveBy(keyLeadingWhitespace.length), 
                /* advance to end of the variable name */
                startSpan.moveBy(keyLeadingWhitespace.length + keyName.length))
                : span;
            let valueSpan = undefined;
            if (expressionParts.length === 2) {
                const [, valueLeadingWhitespace, implicit] = expressionParts[1].match(CHARACTERS_IN_SURROUNDING_WHITESPACE_PATTERN) ?? [];
                valueSpan =
                    valueLeadingWhitespace !== undefined
                        ? new ParseSourceSpan(startSpan.moveBy(expressionParts[0].length + 1 + valueLeadingWhitespace.length), startSpan.moveBy(expressionParts[0].length + 1 + valueLeadingWhitespace.length + implicit.length))
                        : undefined;
            }
            const sourceSpan = new ParseSourceSpan(keySpan.start, valueSpan?.end ?? keySpan.end);
            context.push(new t.Variable(name, variableName, sourceSpan, keySpan, valueSpan));
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
                errors.push(new ParseError(block.startSourceSpan, 'Conditional can only have one @else block'));
            }
            else if (connectedBlocks.length > 1 && i < connectedBlocks.length - 1) {
                errors.push(new ParseError(block.startSourceSpan, '@else block must be last inside the conditional'));
            }
            else if (block.parameters.length > 0) {
                errors.push(new ParseError(block.startSourceSpan, '@else block cannot have parameters'));
            }
            hasElse = true;
        }
        else if (!ELSE_IF_PATTERN.test(block.name)) {
            errors.push(new ParseError(block.startSourceSpan, `Unrecognized conditional block @${block.name}`));
        }
    }
    return errors;
}
/** Checks that the shape of a `switch` block is valid. Returns an array of errors. */
function validateSwitchBlock(ast) {
    const errors = [];
    let hasDefault = false;
    if (ast.parameters.length !== 1) {
        errors.push(new ParseError(ast.startSourceSpan, '@switch block must have exactly one parameter'));
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
                errors.push(new ParseError(node.startSourceSpan, '@switch block can only have one @default block'));
            }
            else if (node.parameters.length > 0) {
                errors.push(new ParseError(node.startSourceSpan, '@default block cannot have parameters'));
            }
            hasDefault = true;
        }
        else if (node.name === 'case' && node.parameters.length !== 1) {
            errors.push(new ParseError(node.startSourceSpan, '@case block must have exactly one parameter'));
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
        errors.push(new ParseError(block.startSourceSpan, 'Conditional block does not have an expression'));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicjNfY29udHJvbF9mbG93LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3JlbmRlcjMvcjNfY29udHJvbF9mbG93LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBZ0IsU0FBUyxFQUFDLE1BQU0sMEJBQTBCLENBQUM7QUFDbEUsT0FBTyxLQUFLLElBQUksTUFBTSxrQkFBa0IsQ0FBQztBQUN6QyxPQUFPLEVBQUMsVUFBVSxFQUFFLGVBQWUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUcxRCxPQUFPLEtBQUssQ0FBQyxNQUFNLFVBQVUsQ0FBQztBQUU5QixzREFBc0Q7QUFDdEQsTUFBTSwyQkFBMkIsR0FBRyx1Q0FBdUMsQ0FBQztBQUU1RSwrREFBK0Q7QUFDL0QsTUFBTSxzQkFBc0IsR0FBRyxvQkFBb0IsQ0FBQztBQUVwRCw4REFBOEQ7QUFDOUQsTUFBTSx5QkFBeUIsR0FBRyxjQUFjLENBQUM7QUFFakQsbURBQW1EO0FBQ25ELE1BQU0sZUFBZSxHQUFHLG1CQUFtQixDQUFDO0FBRTVDLGtEQUFrRDtBQUNsRCxNQUFNLG9CQUFvQixHQUFHLGtCQUFrQixDQUFDO0FBRWhEOzs7R0FHRztBQUNILE1BQU0sNENBQTRDLEdBQUcsaUJBQWlCLENBQUM7QUFFdkUsOEZBQThGO0FBQzlGLE1BQU0sOEJBQThCLEdBQUcsSUFBSSxHQUFHLENBQUM7SUFDN0MsUUFBUTtJQUNSLFFBQVE7SUFDUixPQUFPO0lBQ1AsT0FBTztJQUNQLE1BQU07SUFDTixRQUFRO0NBQ1QsQ0FBQyxDQUFDO0FBRUg7OztHQUdHO0FBQ0gsTUFBTSxVQUFVLHVCQUF1QixDQUFDLElBQVk7SUFDbEQsT0FBTyxJQUFJLEtBQUssT0FBTyxDQUFDO0FBQzFCLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxNQUFNLFVBQVUsc0JBQXNCLENBQUMsSUFBWTtJQUNqRCxPQUFPLElB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QyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQ2hELE1BQU0sSUFBSSxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUUzQixJQUFJLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztZQUNqQixHQUFHLEdBQUcsQ0FBQyxDQUFDO1lBQ1IsVUFBVSxFQUFFLENBQUM7WUFDYixJQUFJLFVBQVUsS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDckIsTUFBTTtZQUNSLENBQUM7UUFDSCxDQUFDO2FBQU0sSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDakMsU0FBUztRQUNYLENBQUM7YUFBTSxDQUFDO1lBQ04sTUFBTTtRQUNSLENBQUM7SUFDSCxDQUFDO0lBRUQsSUFBSSxVQUFVLEtBQUssQ0FBQyxFQUFFLENBQUM7UUFDckIsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLFVBQVUsQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLG9DQUFvQyxDQUFDLENBQUMsQ0FBQztRQUNwRixPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFFRCxPQUFPLFVBQVUsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ3RDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCB7QVNUV2l0aFNvdXJjZSwgRW1wdHlFeHByfSBmcm9tICcuLi9leHByZXNzaW9uX3BhcnNlci9hc3QnO1xuaW1wb3J0ICogYXMgaHRtbCBmcm9tICcuLi9tbF9wYXJzZXIvYXN0JztcbmltcG9ydCB7UGFyc2VFcnJvciwgUGFyc2VTb3VyY2VTcGFufSBmcm9tICcuLi9wYXJzZV91dGlsJztcbmltcG9ydCB7QmluZGluZ1BhcnNlcn0gZnJvbSAnLi4vdGVtcGxhdGVfcGFyc2VyL2JpbmRpbmdfcGFyc2VyJztcblxuaW1wb3J0ICogYXMgdCBmcm9tICcuL3IzX2FzdCc7XG5cbi8qKiBQYXR0ZXJuIGZvciB0aGUgZXhwcmVzc2lvbiBpbiBhIGZvciBsb29wIGJsb2NrLiAqL1xuY29uc3QgRk9SX0xPT1BfRVhQUkVTU0lPTl9QQVRURVJOID0gL15cXHMqKFswLTlBLVphLXpfJF0qKVxccytvZlxccysoW1xcU1xcc10qKS87XG5cbi8qKiBQYXR0ZXJuIGZvciB0aGUgdHJhY2tpbmcgZXhwcmVzc2lvbiBpbiBhIGZvciBsb29wIGJsb2NrLiAqL1xuY29uc3QgRk9SX0xPT1BfVFJBQ0tfUEFUVEVSTiA9IC9edHJhY2tcXHMrKFtcXFNcXHNdKikvO1xuXG4vKiogUGF0dGVybiBmb3IgdGhlIGBhc2AgZXhwcmVzc2lvbiBpbiBhIGNvbmRpdGlvbmFsIGJsb2NrLiAqL1xuY29uc3QgQ09ORElUSU9OQUxfQUxJQVNfUEFUVEVSTiA9IC9eKGFzXFxzKSsoLiopLztcblxuLyoqIFBhdHRlcm4gdXNlZCB0byBpZGVudGlmeSBhbiBgZWxzZSBpZmAgYmxvY2suICovXG5jb25zdCBFTFNFX0lGX1BBVFRFUk4gPSAvXmVsc2VbXlxcU1xcclxcbl0raWYvO1xuXG4vKiogUGF0dGVybiB1c2VkIHRvIGlkZW50aWZ5IGEgYGxldGAgcGFyYW1ldGVyLiAqL1xuY29uc3QgRk9SX0xPT1BfTEVUX1BBVFRFUk4gPSAvXmxldFxccysoW1xcU1xcc10qKS87XG5cbi8qKlxuICogUGF0dGVybiB0byBncm91cCBhIHN0cmluZyBpbnRvIGxlYWRpbmcgd2hpdGVzcGFjZSwgbm9uIHdoaXRlc3BhY2UsIGFuZCB0cmFpbGluZyB3aGl0ZXNwYWNlLlxuICogVXNlZnVsIGZvciBnZXR0aW5nIHRoZSB2YXJpYWJsZSBuYW1lIHNwYW4gd2hlbiBhIHNwYW4gY2FuIGNvbnRhaW4gbGVhZGluZyBhbmQgdHJhaWxpbmcgc3BhY2UuXG4gKi9cbmNvbnN0IENIQVJBQ1RFUlNfSU5fU1VSUk9VTkRJTkdfV0hJVEVTUEFDRV9QQVRURVJOID0gLyhcXHMqKShcXFMrKShcXHMqKS87XG5cbi8qKiBOYW1lcyBvZiB2YXJpYWJsZXMgdGhhdCBhcmUgYWxsb3dlZCB0byBiZSB1c2VkIGluIHRoZSBgbGV0YCBleHByZXNzaW9uIG9mIGEgYGZvcmAgbG9vcC4gKi9cbmNvbnN0IEFMTE9XRURfRk9SX0xPT1BfTEVUX1ZBUklBQkxFUyA9IG5ldyBTZXQoW1xuICAnJGluZGV4JyxcbiAgJyRmaXJzdCcsXG4gICckbGFzdCcsXG4gICckZXZlbicsXG4gICckb2RkJyxcbiAgJyRjb3VudCcsXG5dKTtcblxuLyoqXG4gKiBQcmVkaWNhdGUgZnVuY3Rpb24gdGhhdCBkZXRlcm1pbmVzIGlmIGEgYmxvY2sgd2l0aFxuICogYSBzcGVjaWZpYyBuYW1lIGNhbSBiZSBjb25uZWN0ZWQgdG8gYSBgZm9yYCBibG9jay5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQ29ubmVjdGVkRm9yTG9vcEJsb2NrKG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gbmFtZSA9PT0gJ2VtcHR5Jztcbn1cblxuLyoqXG4gKiBQcmVkaWNhdGUgZnVuY3Rpb24gdGhhdCBkZXRlcm1pbmVzIGlmIGEgYmxvY2sgd2l0aFxuICogYSBzcGVjaWZpYyBuYW1lIGNhbSBiZSBjb25uZWN0ZWQgdG8gYW4gYGlmYCBibG9jay5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQ29ubmVjdGVkSWZMb29wQmxvY2sobmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBuYW1lID09PSAnZWxzZScgfHwgRUxTRV9JRl9QQVRURVJOLnRlc3QobmFtZSk7XG59XG5cbi8qKiBDcmVhdGVzIGFuIGBpZmAgbG9vcCBibG9jayBmcm9tIGFuIEhUTUwgQVNUIG5vZGUuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlSWZCbG9jayhcbiAgYXN0OiBodG1sLkJsb2NrLFxuICBjb25uZWN0ZWRCbG9ja3M6IGh0bWwuQmxvY2tbXSxcbiAgdmlzaXRvcjogaHRtbC5WaXNpdG9yLFxuICBiaW5kaW5nUGFyc2VyOiBCaW5kaW5nUGFyc2VyLFxuKToge25vZGU6IHQuSWZCbG9jayB8IG51bGw7IGVycm9yczogUGFyc2VFcnJvcltdfSB7XG4gIGNvbnN0IGVycm9yczogUGFyc2VFcnJvcltdID0gdmFsaWRhdGVJZkNvbm5lY3RlZEJsb2Nrcyhjb25uZWN0ZWRCbG9ja3MpO1xuICBjb25zdCBicmFuY2hlczogdC5JZkJsb2NrQnJhbmNoW10gPSBbXTtcbiAgY29uc3QgbWFpbkJsb2NrUGFyYW1zID0gcGFyc2VDb25kaXRpb25hbEJsb2NrUGFyYW1ldGVycyhhc3QsIGVycm9ycywgYmluZGluZ1BhcnNlcik7XG5cbiAgaWYgKG1haW5CbG9ja1BhcmFtcyAhPT0gbnVsbCkge1xuICAgIGJyYW5jaGVzLnB1c2goXG4gICAgICBuZXcgdC5JZkJsb2NrQnJhbmNoKFxuICAgICAgICBtYWluQmxvY2tQYXJhbXMuZXhwcmVzc2lvbixcbiAgICAgICAgaHRtbC52aXNpdEFsbCh2aXNpdG9yLCBhc3QuY2hpbGRyZW4sIGFzdC5jaGlsZHJlbiksXG4gICAgICAgIG1haW5CbG9ja1BhcmFtcy5leHByZXNzaW9uQWxpYXMsXG4gICAgICAgIGFzdC5zb3VyY2VTcGFuLFxuICAgICAgICBhc3Quc3RhcnRTb3VyY2VTcGFuLFxuICAgICAgICBhc3QuZW5kU291cmNlU3BhbixcbiAgICAgICAgYXN0Lm5hbWVTcGFuLFxuICAgICAgICBhc3QuaTE4bixcbiAgICAgICksXG4gICAgKTtcbiAgfVxuXG4gIGZvciAoY29uc3QgYmxvY2sgb2YgY29ubmVjdGVkQmxvY2tzKSB7XG4gICAgaWYgKEVMU0VfSUZfUEFUVEVSTi50ZXN0KGJsb2NrLm5hbWUpKSB7XG4gICAgICBjb25zdCBwYXJhbXMgPSBwYXJzZUNvbmRpdGlvbmFsQmxvY2tQYXJhbWV0ZXJzKGJsb2NrLCBlcnJvcnMsIGJpbmRpbmdQYXJzZXIpO1xuXG4gICAgICBpZiAocGFyYW1zICE9PSBudWxsKSB7XG4gICAgICAgIGNvbnN0IGNoaWxkcmVuID0gaHRtbC52aXNpdEFsbCh2aXNpdG9yLCBibG9jay5jaGlsZHJlbiwgYmxvY2suY2hpbGRyZW4pO1xuICAgICAgICBicmFuY2hlcy5wdXNoKFxuICAgICAgICAgIG5ldyB0LklmQmxvY2tCcmFuY2goXG4gICAgICAgICAgICBwYXJhbXMuZXhwcmVzc2lvbixcbiAgICAgICAgICAgIGNoaWxkcmVuLFxuICAgICAgICAgICAgcGFyYW1zLmV4cHJlc3Npb25BbGlhcyxcbiAgICAgICAgICAgIGJsb2NrLnNvdXJjZVNwYW4sXG4gICAgICAgICAgICBibG9jay5zdGFydFNvdXJjZVNwYW4sXG4gICAgICAgICAgICBibG9jay5lbmRTb3VyY2VTcGFuLFxuICAgICAgICAgICAgYmxvY2submFtZVNwYW4sXG4gICAgICAgICAgICBibG9jay5pMThuLFxuICAgICAgICAgICksXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChibG9jay5uYW1lID09PSAnZWxzZScpIHtcbiAgICAgIGNvbnN0IGNoaWxkcmVuID0gaHRtbC52aXNpdEFsbCh2aXNpdG9yLCBibG9jay5jaGlsZHJlbiwgYmxvY2suY2hpbGRyZW4pO1xuICAgICAgYnJhbmNoZXMucHVzaChcbiAgICAgICAgbmV3IHQuSWZCbG9ja0JyYW5jaChcbiAgICAgICAgICBudWxsLFxuICAgICAgICAgIGNoaWxkcmVuLFxuICAgICAgICAgIG51bGwsXG4gICAgICAgICAgYmxvY2suc291cmNlU3BhbixcbiAgICAgICAgICBibG9jay5zdGFydFNvdXJjZVNwYW4sXG4gICAgICAgICAgYmxvY2suZW5kU291cmNlU3BhbixcbiAgICAgICAgICBibG9jay5uYW1lU3BhbixcbiAgICAgICAgICBibG9jay5pMThuLFxuICAgICAgICApLFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICAvLyBUaGUgb3V0ZXIgSWZCbG9jayBzaG91bGQgaGF2ZSBhIHNwYW4gdGhhdCBlbmNhcHN1bGF0ZXMgYWxsIGJyYW5jaGVzLlxuICBjb25zdCBpZkJsb2NrU3RhcnRTb3VyY2VTcGFuID1cbiAgICBicmFuY2hlcy5sZW5ndGggPiAwID8gYnJhbmNoZXNbMF0uc3RhcnRTb3VyY2VTcGFuIDogYXN0LnN0YXJ0U291cmNlU3BhbjtcbiAgY29uc3QgaWZCbG9ja0VuZFNvdXJjZVNwYW4gPVxuICAgIGJyYW5jaGVzLmxlbmd0aCA+IDAgPyBicmFuY2hlc1ticmFuY2hlcy5sZW5ndGggLSAxXS5lbmRTb3VyY2VTcGFuIDogYXN0LmVuZFNvdXJjZVNwYW47XG5cbiAgbGV0IHdob2xlU291cmNlU3BhbiA9IGFzdC5zb3VyY2VTcGFuO1xuICBjb25zdCBsYXN0QnJhbmNoID0gYnJhbmNoZXNbYnJhbmNoZXMubGVuZ3RoIC0gMV07XG4gIGlmIChsYXN0QnJhbmNoICE9PSB1bmRlZmluZWQpIHtcbiAgICB3aG9sZVNvdXJjZVNwYW4gPSBuZXcgUGFyc2VTb3VyY2VTcGFuKGlmQmxvY2tTdGFydFNvdXJjZVNwYW4uc3RhcnQsIGxhc3RCcmFuY2guc291cmNlU3Bhbi5lbmQpO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBub2RlOiBuZXcgdC5JZkJsb2NrKFxuICAgICAgYnJhbmNoZXMsXG4gICAgICB3aG9sZVNvdXJjZVNwYW4sXG4gICAgICBhc3Quc3RhcnRTb3VyY2VTcGFuLFxuICAgICAgaWZCbG9ja0VuZFNvdXJjZVNwYW4sXG4gICAgICBhc3QubmFtZVNwYW4sXG4gICAgKSxcbiAgICBlcnJvcnMsXG4gIH07XG59XG5cbi8qKiBDcmVhdGVzIGEgYGZvcmAgbG9vcCBibG9jayBmcm9tIGFuIEhUTUwgQVNUIG5vZGUuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRm9yTG9vcChcbiAgYXN0OiBodG1sLkJsb2NrLFxuICBjb25uZWN0ZWRCbG9ja3M6IGh0bWwuQmxvY2tbXSxcbiAgdmlzaXRvcjogaHRtbC5WaXNpdG9yLFxuICBiaW5kaW5nUGFyc2VyOiBCaW5kaW5nUGFyc2VyLFxuKToge25vZGU6IHQuRm9yTG9vcEJsb2NrIHwgbnVsbDsgZXJyb3JzOiBQYXJzZUVycm9yW119IHtcbiAgY29uc3QgZXJyb3JzOiBQYXJzZUVycm9yW10gPSBbXTtcbiAgY29uc3QgcGFyYW1zID0gcGFyc2VGb3JMb29wUGFyYW1ldGVycyhhc3QsIGVycm9ycywgYmluZGluZ1BhcnNlcik7XG4gIGxldCBub2RlOiB0LkZvckxvb3BCbG9jayB8IG51bGwgPSBudWxsO1xuICBsZXQgZW1wdHk6IHQuRm9yTG9vcEJsb2NrRW1wdHkgfCBudWxsID0gbnVsbDtcblxuICBmb3IgKGNvbnN0IGJsb2NrIG9mIGNvbm5lY3RlZEJsb2Nrcykge1xuICAgIGlmIChibG9jay5uYW1lID09PSAnZW1wdHknKSB7XG4gICAgICBpZiAoZW1wdHkgIT09IG51bGwpIHtcbiAgICAgICAgZXJyb3JzLnB1c2gobmV3IFBhcnNlRXJyb3IoYmxvY2suc291cmNlU3BhbiwgJ0Bmb3IgbG9vcCBjYW4gb25seSBoYXZlIG9uZSBAZW1wdHkgYmxvY2snKSk7XG4gICAgICB9IGVsc2UgaWYgKGJsb2NrLnBhcmFtZXRlcnMubGVuZ3RoID4gMCkge1xuICAgICAgICBlcnJvcnMucHVzaChuZXcgUGFyc2VFcnJvcihibG9jay5zb3VyY2VTcGFuLCAnQGVtcHR5IGJsb2NrIGNhbm5vdCBoYXZlIHBhcmFtZXRlcnMnKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlbXB0eSA9IG5ldyB0LkZvckxvb3BCbG9ja0VtcHR5KFxuICAgICAgICAgIGh0bWwudmlzaXRBbGwodmlzaXRvciwgYmxvY2suY2hpbGRyZW4sIGJsb2NrLmNoaWxkcmVuKSxcbiAgICAgICAgICBibG9jay5zb3VyY2VTcGFuLFxuICAgICAgICAgIGJsb2NrLnN0YXJ0U291cmNlU3BhbixcbiAgICAgICAgICBibG9jay5lbmRTb3VyY2VTcGFuLFxuICAgICAgICAgIGJsb2NrLm5hbWVTcGFuLFxuICAgICAgICAgIGJsb2NrLmkxOG4sXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGVycm9ycy5wdXNoKG5ldyBQYXJzZUVycm9yKGJsb2NrLnNvdXJjZVNwYW4sIGBVbnJlY29nbml6ZWQgQGZvciBsb29wIGJsb2NrIFwiJHtibG9jay5uYW1lfVwiYCkpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChwYXJhbXMgIT09IG51bGwpIHtcbiAgICBpZiAocGFyYW1zLnRyYWNrQnkgPT09IG51bGwpIHtcbiAgICAgIC8vIFRPRE86IFdlIHNob3VsZCBub3QgZmFpbCBoZXJlLCBhbmQgaW5zdGVhZCB0cnkgdG8gcHJvZHVjZSBzb21lIEFTVCBmb3IgdGhlIGxhbmd1YWdlXG4gICAgICAvLyBzZXJ2aWNlLlxuICAgICAgZXJyb3JzLnB1c2gobmV3IFBhcnNlRXJyb3IoYXN0LnN0YXJ0U291cmNlU3BhbiwgJ0Bmb3IgbG9vcCBtdXN0IGhhdmUgYSBcInRyYWNrXCIgZXhwcmVzc2lvbicpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVGhlIGBmb3JgIGJsb2NrIGhhcyBhIG1haW4gc3BhbiB0aGF0IGluY2x1ZGVzIHRoZSBgZW1wdHlgIGJyYW5jaC4gRm9yIG9ubHkgdGhlIHNwYW4gb2YgdGhlXG4gICAgICAvLyBtYWluIGBmb3JgIGJvZHksIHVzZSBgbWFpblNvdXJjZVNwYW5gLlxuICAgICAgY29uc3QgZW5kU3BhbiA9IGVtcHR5Py5lbmRTb3VyY2VTcGFuID8/IGFzdC5lbmRTb3VyY2VTcGFuO1xuICAgICAgY29uc3Qgc291cmNlU3BhbiA9IG5ldyBQYXJzZVNvdXJjZVNwYW4oXG4gICAgICAgIGFzdC5zb3VyY2VTcGFuLnN0YXJ0LFxuICAgICAgICBlbmRTcGFuPy5lbmQgPz8gYXN0LnNvdXJjZVNwYW4uZW5kLFxuICAgICAgKTtcbiAgICAgIG5vZGUgPSBuZXcgdC5Gb3JMb29wQmxvY2soXG4gICAgICAgIHBhcmFtcy5pdGVtTmFtZSxcbiAgICAgICAgcGFyYW1zLmV4cHJlc3Npb24sXG4gICAgICAgIHBhcmFtcy50cmFja0J5LmV4cHJlc3Npb24sXG4gICAgICAgIHBhcmFtcy50cmFja0J5LmtleXdvcmRTcGFuLFxuICAgICAgICBwYXJhbXMuY29udGV4dCxcbiAgICAgICAgaHRtbC52aXNpdEFsbCh2aXNpdG9yLCBhc3QuY2hpbGRyZW4sIGFzdC5jaGlsZHJlbiksXG4gICAgICAgIGVtcHR5LFxuICAgICAgICBzb3VyY2VTcGFuLFxuICAgICAgICBhc3Quc291cmNlU3BhbixcbiAgICAgICAgYXN0LnN0YXJ0U291cmNlU3BhbixcbiAgICAgICAgZW5kU3BhbixcbiAgICAgICAgYXN0Lm5hbWVTcGFuLFxuICAgICAgICBhc3QuaTE4bixcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHtub2RlLCBlcnJvcnN9O1xufVxuXG4vKiogQ3JlYXRlcyBhIHN3aXRjaCBibG9jayBmcm9tIGFuIEhUTUwgQVNUIG5vZGUuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3dpdGNoQmxvY2soXG4gIGFzdDogaHRtbC5CbG9jayxcbiAgdmlzaXRvcjogaHRtbC5WaXNpdG9yLFxuICBiaW5kaW5nUGFyc2VyOiBCaW5kaW5nUGFyc2VyLFxuKToge25vZGU6IHQuU3dpdGNoQmxvY2sgfCBudWxsOyBlcnJvcnM6IFBhcnNlRXJyb3JbXX0ge1xuICBjb25zdCBlcnJvcnMgPSB2YWxpZGF0ZVN3aXRjaEJsb2NrKGFzdCk7XG4gIGNvbnN0IHByaW1hcnlFeHByZXNzaW9uID1cbiAgICBhc3QucGFyYW1ldGVycy5sZW5ndGggPiAwXG4gICAgICA/IHBhcnNlQmxvY2tQYXJhbWV0ZXJUb0JpbmRpbmcoYXN0LnBhcmFtZXRlcnNbMF0sIGJpbmRpbmdQYXJzZXIpXG4gICAgICA6IGJpbmRpbmdQYXJzZXIucGFyc2VCaW5kaW5nKCcnLCBmYWxzZSwgYXN0LnNvdXJjZVNwYW4sIDApO1xuICBjb25zdCBjYXNlczogdC5Td2l0Y2hCbG9ja0Nhc2VbXSA9IFtdO1xuICBjb25zdCB1bmtub3duQmxvY2tzOiB0LlVua25vd25CbG9ja1tdID0gW107XG4gIGxldCBkZWZhdWx0Q2FzZTogdC5Td2l0Y2hCbG9ja0Nhc2UgfCBudWxsID0gbnVsbDtcblxuICAvLyBIZXJlIHdlIGFzc3VtZSB0aGF0IGFsbCB0aGUgYmxvY2tzIGFyZSB2YWxpZCBnaXZlbiB0aGF0IHdlIHZhbGlkYXRlZCB0aGVtIGFib3ZlLlxuICBmb3IgKGNvbnN0IG5vZGUgb2YgYXN0LmNoaWxkcmVuKSB7XG4gICAgaWYgKCEobm9kZSBpbnN0YW5jZW9mIGh0bWwuQmxvY2spKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBpZiAoKG5vZGUubmFtZSAhPT0gJ2Nhc2UnIHx8IG5vZGUucGFyYW1ldGVycy5sZW5ndGggPT09IDApICYmIG5vZGUubmFtZSAhPT0gJ2RlZmF1bHQnKSB7XG4gICAgICB1bmtub3duQmxvY2tzLnB1c2gobmV3IHQuVW5rbm93bkJsb2NrKG5vZGUubmFtZSwgbm9kZS5zb3VyY2VTcGFuLCBub2RlLm5hbWVTcGFuKSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBjb25zdCBleHByZXNzaW9uID1cbiAgICAgIG5vZGUubmFtZSA9PT0gJ2Nhc2UnID8gcGFyc2VCbG9ja1BhcmFtZXRlclRvQmluZGluZyhub2RlLnBhcmFtZXRlcnNbMF0sIGJpbmRpbmdQYXJzZXIpIDogbnVsbDtcbiAgICBjb25zdCBhc3QgPSBuZXcgdC5Td2l0Y2hCbG9ja0Nhc2UoXG4gICAgICBleHByZXNzaW9uLFxuICAgICAgaHRtbC52aXNpdEFsbCh2aXNpdG9yLCBub2RlLmNoaWxkcmVuLCBub2RlLmNoaWxkcmVuKSxcbiAgICAgIG5vZGUuc291cmNlU3BhbixcbiAgICAgIG5vZGUuc3RhcnRTb3VyY2VTcGFuLFxuICAgICAgbm9kZS5lbmRTb3VyY2VTcGFuLFxuICAgICAgbm9kZS5uYW1lU3BhbixcbiAgICAgIG5vZGUuaTE4bixcbiAgICApO1xuXG4gICAgaWYgKGV4cHJlc3Npb24gPT09IG51bGwpIHtcbiAgICAgIGRlZmF1bHRDYXNlID0gYXN0O1xuICAgIH0gZWxzZSB7XG4gICAgICBjYXNlcy5wdXNoKGFzdCk7XG4gICAgfVxuICB9XG5cbiAgLy8gRW5zdXJlIHRoYXQgdGhlIGRlZmF1bHQgY2FzZSBpcyBsYXN0IGluIHRoZSBhcnJheS5cbiAgaWYgKGRlZmF1bHRDYXNlICE9PSBudWxsKSB7XG4gICAgY2FzZXMucHVzaChkZWZhdWx0Q2FzZSk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIG5vZGU6IG5ldyB0LlN3aXRjaEJsb2NrKFxuICAgICAgcHJpbWFyeUV4cHJlc3Npb24sXG4gICAgICBjYXNlcyxcbiAgICAgIHVua25vd25CbG9ja3MsXG4gICAgICBhc3Quc291cmNlU3BhbixcbiAgICAgIGFzdC5zdGFydFNvdXJjZVNwYW4sXG4gICAgICBhc3QuZW5kU291cmNlU3BhbixcbiAgICAgIGFzdC5uYW1lU3BhbixcbiAgICApLFxuICAgIGVycm9ycyxcbiAgfTtcbn1cblxuLyoqIFBhcnNlcyB0aGUgcGFyYW1ldGVycyBvZiBhIGBmb3JgIGxvb3AgYmxvY2suICovXG5mdW5jdGlvbiBwYXJzZUZvckxvb3BQYXJhbWV0ZXJzKFxuICBibG9jazogaHRtbC5CbG9jayxcbiAgZXJyb3JzOiBQYXJzZUVycm9yW10sXG4gIGJpbmRpbmdQYXJzZXI6IEJpbmRpbmdQYXJzZXIsXG4pIHtcbiAgaWYgKGJsb2NrLnBhcmFtZXRlcnMubGVuZ3RoID09PSAwKSB7XG4gICAgZXJyb3JzLnB1c2gobmV3IFBhcnNlRXJyb3IoYmxvY2suc3RhcnRTb3VyY2VTcGFuLCAnQGZvciBsb29wIGRvZXMgbm90IGhhdmUgYW4gZXhwcmVzc2lvbicpKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNvbnN0IFtleHByZXNzaW9uUGFyYW0sIC4uLnNlY29uZGFyeVBhcmFtc10gPSBibG9jay5wYXJhbWV0ZXJzO1xuICBjb25zdCBtYXRjaCA9IHN0cmlwT3B0aW9uYWxQYXJlbnRoZXNlcyhleHByZXNzaW9uUGFyYW0sIGVycm9ycyk/Lm1hdGNoKFxuICAgIEZPUl9MT09QX0VYUFJFU1NJT05fUEFUVEVSTixcbiAgKTtcblxuICBpZiAoIW1hdGNoIHx8IG1hdGNoWzJdLnRyaW0oKS5sZW5ndGggPT09IDApIHtcbiAgICBlcnJvcnMucHVzaChcbiAgICAgIG5ldyBQYXJzZUVycm9yKFxuICAgICAgICBleHByZXNzaW9uUGFyYW0uc291cmNlU3BhbixcbiAgICAgICAgJ0Nhbm5vdCBwYXJzZSBleHByZXNzaW9uLiBAZm9yIGxvb3AgZXhwcmVzc2lvbiBtdXN0IG1hdGNoIHRoZSBwYXR0ZXJuIFwiPGlkZW50aWZpZXI+IG9mIDxleHByZXNzaW9uPlwiJyxcbiAgICAgICksXG4gICAgKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNvbnN0IFssIGl0ZW1OYW1lLCByYXdFeHByZXNzaW9uXSA9IG1hdGNoO1xuICBpZiAoQUxMT1dFRF9GT1JfTE9PUF9MRVRfVkFSSUFCTEVTLmhhcyhpdGVtTmFtZSkpIHtcbiAgICBlcnJvcnMucHVzaChcbiAgICAgIG5ldyBQYXJzZUVycm9yKFxuICAgICAgICBleHByZXNzaW9uUGFyYW0uc291cmNlU3BhbixcbiAgICAgICAgYEBmb3IgbG9vcCBpdGVtIG5hbWUgY2Fubm90IGJlIG9uZSBvZiAke0FycmF5LmZyb20oQUxMT1dFRF9GT1JfTE9PUF9MRVRfVkFSSUFCTEVTKS5qb2luKFxuICAgICAgICAgICcsICcsXG4gICAgICAgICl9LmAsXG4gICAgICApLFxuICAgICk7XG4gIH1cblxuICAvLyBgZXhwcmVzc2lvblBhcmFtLmV4cHJlc3Npb25gIGNvbnRhaW5zIHRoZSB2YXJpYWJsZSBkZWNsYXJhdGlvbiBhbmQgdGhlIGV4cHJlc3Npb24gb2YgdGhlXG4gIC8vIGZvci4uLm9mIHN0YXRlbWVudCwgaS5lLiAndXNlciBvZiB1c2VycycgVGhlIHZhcmlhYmxlIG9mIGEgRm9yT2ZTdGF0ZW1lbnQgaXMgX29ubHlfIHRoZSBcImNvbnN0XG4gIC8vIHVzZXJcIiBwYXJ0IGFuZCBkb2VzIG5vdCBpbmNsdWRlIFwib2YgeFwiLlxuICBjb25zdCB2YXJpYWJsZU5hbWUgPSBleHByZXNzaW9uUGFyYW0uZXhwcmVzc2lvbi5zcGxpdCgnICcpWzBdO1xuICBjb25zdCB2YXJpYWJsZVNwYW4gPSBuZXcgUGFyc2VTb3VyY2VTcGFuKFxuICAgIGV4cHJlc3Npb25QYXJhbS5zb3VyY2VTcGFuLnN0YXJ0LFxuICAgIGV4cHJlc3Npb25QYXJhbS5zb3VyY2VTcGFuLnN0YXJ0Lm1vdmVCeSh2YXJpYWJsZU5hbWUubGVuZ3RoKSxcbiAgKTtcbiAgY29uc3QgcmVzdWx0ID0ge1xuICAgIGl0ZW1OYW1lOiBuZXcgdC5WYXJpYWJsZShpdGVtTmFtZSwgJyRpbXBsaWNpdCcsIHZhcmlhYmxlU3BhbiwgdmFyaWFibGVTcGFuKSxcbiAgICB0cmFja0J5OiBudWxsIGFzIHtleHByZXNzaW9uOiBBU1RXaXRoU291cmNlOyBrZXl3b3JkU3BhbjogUGFyc2VTb3VyY2VTcGFufSB8IG51bGwsXG4gICAgZXhwcmVzc2lvbjogcGFyc2VCbG9ja1BhcmFtZXRlclRvQmluZGluZyhleHByZXNzaW9uUGFyYW0sIGJpbmRpbmdQYXJzZXIsIHJhd0V4cHJlc3Npb24pLFxuICAgIGNvbnRleHQ6IEFycmF5LmZyb20oQUxMT1dFRF9GT1JfTE9PUF9MRVRfVkFSSUFCTEVTLCAodmFyaWFibGVOYW1lKSA9PiB7XG4gICAgICAvLyBHaXZlIGFtYmllbnRseS1hdmFpbGFibGUgY29udGV4dCB2YXJpYWJsZXMgZW1wdHkgc3BhbnMgYXQgdGhlIGVuZCBvZlxuICAgICAgLy8gdGhlIHN0YXJ0IG9mIHRoZSBgZm9yYCBibG9jaywgc2luY2UgdGhleSBhcmUgbm90IGV4cGxpY2l0bHkgZGVmaW5lZC5cbiAgICAgIGNvbnN0IGVtcHR5U3BhbkFmdGVyRm9yQmxvY2tTdGFydCA9IG5ldyBQYXJzZVNvdXJjZVNwYW4oXG4gICAgICAgIGJsb2NrLnN0YXJ0U291cmNlU3Bhbi5lbmQsXG4gICAgICAgIGJsb2NrLnN0YXJ0U291cmNlU3Bhbi5lbmQsXG4gICAgICApO1xuICAgICAgcmV0dXJuIG5ldyB0LlZhcmlhYmxlKFxuICAgICAgICB2YXJpYWJsZU5hbWUsXG4gICAgICAgIHZhcmlhYmxlTmFtZSxcbiAgICAgICAgZW1wdHlTcGFuQWZ0ZXJGb3JCbG9ja1N0YXJ0LFxuICAgICAgICBlbXB0eVNwYW5BZnRlckZvckJsb2NrU3RhcnQsXG4gICAgICApO1xuICAgIH0pLFxuICB9O1xuXG4gIGZvciAoY29uc3QgcGFyYW0gb2Ygc2Vjb25kYXJ5UGFyYW1zKSB7XG4gICAgY29uc3QgbGV0TWF0Y2ggPSBwYXJhbS5leHByZXNzaW9uLm1hdGNoKEZPUl9MT09QX0xFVF9QQVRURVJOKTtcblxuICAgIGlmIChsZXRNYXRjaCAhPT0gbnVsbCkge1xuICAgICAgY29uc3QgdmFyaWFibGVzU3BhbiA9IG5ldyBQYXJzZVNvdXJjZVNwYW4oXG4gICAgICAgIHBhcmFtLnNvdXJjZVNwYW4uc3RhcnQubW92ZUJ5KGxldE1hdGNoWzBdLmxlbmd0aCAtIGxldE1hdGNoWzFdLmxlbmd0aCksXG4gICAgICAgIHBhcmFtLnNvdXJjZVNwYW4uZW5kLFxuICAgICAgKTtcbiAgICAgIHBhcnNlTGV0UGFyYW1ldGVyKFxuICAgICAgICBwYXJhbS5zb3VyY2VTcGFuLFxuICAgICAgICBsZXRNYXRjaFsxXSxcbiAgICAgICAgdmFyaWFibGVzU3BhbixcbiAgICAgICAgaXRlbU5hbWUsXG4gICAgICAgIHJlc3VsdC5jb250ZXh0LFxuICAgICAgICBlcnJvcnMsXG4gICAgICApO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgY29uc3QgdHJhY2tNYXRjaCA9IHBhcmFtLmV4cHJlc3Npb24ubWF0Y2goRk9SX0xPT1BfVFJBQ0tfUEFUVEVSTik7XG5cbiAgICBpZiAodHJhY2tNYXRjaCAhPT0gbnVsbCkge1xuICAgICAgaWYgKHJlc3VsdC50cmFja0J5ICE9PSBudWxsKSB7XG4gICAgICAgIGVycm9ycy5wdXNoKFxuICAgICAgICAgIG5ldyBQYXJzZUVycm9yKHBhcmFtLnNvdXJjZVNwYW4sICdAZm9yIGxvb3AgY2FuIG9ubHkgaGF2ZSBvbmUgXCJ0cmFja1wiIGV4cHJlc3Npb24nKSxcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGV4cHJlc3Npb24gPSBwYXJzZUJsb2NrUGFyYW1ldGVyVG9CaW5kaW5nKHBhcmFtLCBiaW5kaW5nUGFyc2VyLCB0cmFja01hdGNoWzFdKTtcbiAgICAgICAgaWYgKGV4cHJlc3Npb24uYXN0IGluc3RhbmNlb2YgRW1wdHlFeHByKSB7XG4gICAgICAgICAgZXJyb3JzLnB1c2goXG4gICAgICAgICAgICBuZXcgUGFyc2VFcnJvcihibG9jay5zdGFydFNvdXJjZVNwYW4sICdAZm9yIGxvb3AgbXVzdCBoYXZlIGEgXCJ0cmFja1wiIGV4cHJlc3Npb24nKSxcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGtleXdvcmRTcGFuID0gbmV3IFBhcnNlU291cmNlU3BhbihcbiAgICAgICAgICBwYXJhbS5zb3VyY2VTcGFuLnN0YXJ0LFxuICAgICAgICAgIHBhcmFtLnNvdXJjZVNwYW4uc3RhcnQubW92ZUJ5KCd0cmFjaycubGVuZ3RoKSxcbiAgICAgICAgKTtcbiAgICAgICAgcmVzdWx0LnRyYWNrQnkgPSB7ZXhwcmVzc2lvbiwga2V5d29yZFNwYW59O1xuICAgICAgfVxuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgZXJyb3JzLnB1c2goXG4gICAgICBuZXcgUGFyc2VFcnJvcihwYXJhbS5zb3VyY2VTcGFuLCBgVW5yZWNvZ25pemVkIEBmb3IgbG9vcCBwYXJhbWF0ZXIgXCIke3BhcmFtLmV4cHJlc3Npb259XCJgKSxcbiAgICApO1xuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqIFBhcnNlcyB0aGUgYGxldGAgcGFyYW1ldGVyIG9mIGEgYGZvcmAgbG9vcCBibG9jay4gKi9cbmZ1bmN0aW9uIHBhcnNlTGV0UGFyYW1ldGVyKFxuICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gIGV4cHJlc3Npb246IHN0cmluZyxcbiAgc3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICBsb29wSXRlbU5hbWU6IHN0cmluZyxcbiAgY29udGV4dDogdC5WYXJpYWJsZVtdLFxuICBlcnJvcnM6IFBhcnNlRXJyb3JbXSxcbik6IHZvaWQge1xuICBjb25zdCBwYXJ0cyA9IGV4cHJlc3Npb24uc3BsaXQoJywnKTtcbiAgbGV0IHN0YXJ0U3BhbiA9IHNwYW4uc3RhcnQ7XG4gIGZvciAoY29uc3QgcGFydCBvZiBwYXJ0cykge1xuICAgIGNvbnN0IGV4cHJlc3Npb25QYXJ0cyA9IHBhcnQuc3BsaXQoJz0nKTtcbiAgICBjb25zdCBuYW1lID0gZXhwcmVzc2lvblBhcnRzLmxlbmd0aCA9PT0gMiA/IGV4cHJlc3Npb25QYXJ0c1swXS50cmltKCkgOiAnJztcbiAgICBjb25zdCB2YXJpYWJsZU5hbWUgPSBleHByZXNzaW9uUGFydHMubGVuZ3RoID09PSAyID8gZXhwcmVzc2lvblBhcnRzWzFdLnRyaW0oKSA6ICcnO1xuXG4gICAgaWYgKG5hbWUubGVuZ3RoID09PSAwIHx8IHZhcmlhYmxlTmFtZS5sZW5ndGggPT09IDApIHtcbiAgICAgIGVycm9ycy5wdXNoKFxuICAgICAgICBuZXcgUGFyc2VFcnJvcihcbiAgICAgICAgICBzb3VyY2VTcGFuLFxuICAgICAgICAgIGBJbnZhbGlkIEBmb3IgbG9vcCBcImxldFwiIHBhcmFtZXRlci4gUGFyYW1ldGVyIHNob3VsZCBtYXRjaCB0aGUgcGF0dGVybiBcIjxuYW1lPiA9IDx2YXJpYWJsZSBuYW1lPlwiYCxcbiAgICAgICAgKSxcbiAgICAgICk7XG4gICAgfSBlbHNlIGlmICghQUxMT1dFRF9GT1JfTE9PUF9MRVRfVkFSSUFCTEVTLmhhcyh2YXJpYWJsZU5hbWUpKSB7XG4gICAgICBlcnJvcnMucHVzaChcbiAgICAgICAgbmV3IFBhcnNlRXJyb3IoXG4gICAgICAgICAgc291cmNlU3BhbixcbiAgICAgICAgICBgVW5rbm93biBcImxldFwiIHBhcmFtZXRlciB2YXJpYWJsZSBcIiR7dmFyaWFibGVOYW1lfVwiLiBUaGUgYWxsb3dlZCB2YXJpYWJsZXMgYXJlOiAke0FycmF5LmZyb20oXG4gICAgICAgICAgICBBTExPV0VEX0ZPUl9MT09QX0xFVF9WQVJJQUJMRVMsXG4gICAgICAgICAgKS5qb2luKCcsICcpfWAsXG4gICAgICAgICksXG4gICAgICApO1xuICAgIH0gZWxzZSBpZiAobmFtZSA9PT0gbG9vcEl0ZW1OYW1lKSB7XG4gICAgICBlcnJvcnMucHVzaChcbiAgICAgICAgbmV3IFBhcnNlRXJyb3IoXG4gICAgICAgICAgc291cmNlU3BhbixcbiAgICAgICAgICBgSW52YWxpZCBAZm9yIGxvb3AgXCJsZXRcIiBwYXJhbWV0ZXIuIFZhcmlhYmxlIGNhbm5vdCBiZSBjYWxsZWQgXCIke2xvb3BJdGVtTmFtZX1cImAsXG4gICAgICAgICksXG4gICAgICApO1xuICAgIH0gZWxzZSBpZiAoY29udGV4dC5zb21lKCh2KSA9PiB2Lm5hbWUgPT09IG5hbWUpKSB7XG4gICAgICBlcnJvcnMucHVzaChcbiAgICAgICAgbmV3IFBhcnNlRXJyb3Ioc291cmNlU3BhbiwgYER1cGxpY2F0ZSBcImxldFwiIHBhcmFtZXRlciB2YXJpYWJsZSBcIiR7dmFyaWFibGVOYW1lfVwiYCksXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBbLCBrZXlMZWFkaW5nV2hpdGVzcGFjZSwga2V5TmFtZV0gPVxuICAgICAgICBleHByZXNzaW9uUGFydHNbMF0ubWF0Y2goQ0hBUkFDVEVSU19JTl9TVVJST1VORElOR19XSElURVNQQUNFX1BBVFRFUk4pID8/IFtdO1xuICAgICAgY29uc3Qga2V5U3BhbiA9XG4gICAgICAgIGtleUxlYWRpbmdXaGl0ZXNwYWNlICE9PSB1bmRlZmluZWQgJiYgZXhwcmVzc2lvblBhcnRzLmxlbmd0aCA9PT0gMlxuICAgICAgICAgID8gbmV3IFBhcnNlU291cmNlU3BhbihcbiAgICAgICAgICAgICAgLyogc3RyaXAgbGVhZGluZyBzcGFjZXMgKi9cbiAgICAgICAgICAgICAgc3RhcnRTcGFuLm1vdmVCeShrZXlMZWFkaW5nV2hpdGVzcGFjZS5sZW5ndGgpLFxuICAgICAgICAgICAgICAvKiBhZHZhbmNlIHRvIGVuZCBvZiB0aGUgdmFyaWFibGUgbmFtZSAqL1xuICAgICAgICAgICAgICBzdGFydFNwYW4ubW92ZUJ5KGtleUxlYWRpbmdXaGl0ZXNwYWNlLmxlbmd0aCArIGtleU5hbWUubGVuZ3RoKSxcbiAgICAgICAgICAgIClcbiAgICAgICAgICA6IHNwYW47XG5cbiAgICAgIGxldCB2YWx1ZVNwYW46IFBhcnNlU291cmNlU3BhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAgIGlmIChleHByZXNzaW9uUGFydHMubGVuZ3RoID09PSAyKSB7XG4gICAgICAgIGNvbnN0IFssIHZhbHVlTGVhZGluZ1doaXRlc3BhY2UsIGltcGxpY2l0XSA9XG4gICAgICAgICAgZXhwcmVzc2lvblBhcnRzWzFdLm1hdGNoKENIQVJBQ1RFUlNfSU5fU1VSUk9VTkRJTkdfV0hJVEVTUEFDRV9QQVRURVJOKSA/PyBbXTtcbiAgICAgICAgdmFsdWVTcGFuID1cbiAgICAgICAgICB2YWx1ZUxlYWRpbmdXaGl0ZXNwYWNlICE9PSB1bmRlZmluZWRcbiAgICAgICAgICAgID8gbmV3IFBhcnNlU291cmNlU3BhbihcbiAgICAgICAgICAgICAgICBzdGFydFNwYW4ubW92ZUJ5KGV4cHJlc3Npb25QYXJ0c1swXS5sZW5ndGggKyAxICsgdmFsdWVMZWFkaW5nV2hpdGVzcGFjZS5sZW5ndGgpLFxuICAgICAgICAgICAgICAgIHN0YXJ0U3Bhbi5tb3ZlQnkoXG4gICAgICAgICAgICAgICAgICBleHByZXNzaW9uUGFydHNbMF0ubGVuZ3RoICsgMSArIHZhbHVlTGVhZGluZ1doaXRlc3BhY2UubGVuZ3RoICsgaW1wbGljaXQubGVuZ3RoLFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgIDogdW5kZWZpbmVkO1xuICAgICAgfVxuICAgICAgY29uc3Qgc291cmNlU3BhbiA9IG5ldyBQYXJzZVNvdXJjZVNwYW4oa2V5U3Bhbi5zdGFydCwgdmFsdWVTcGFuPy5lbmQgPz8ga2V5U3Bhbi5lbmQpO1xuICAgICAgY29udGV4dC5wdXNoKG5ldyB0LlZhcmlhYmxlKG5hbWUsIHZhcmlhYmxlTmFtZSwgc291cmNlU3Bhbiwga2V5U3BhbiwgdmFsdWVTcGFuKSk7XG4gICAgfVxuICAgIHN0YXJ0U3BhbiA9IHN0YXJ0U3Bhbi5tb3ZlQnkocGFydC5sZW5ndGggKyAxIC8qIGFkZCAxIHRvIG1vdmUgcGFzdCB0aGUgY29tbWEgKi8pO1xuICB9XG59XG5cbi8qKlxuICogQ2hlY2tzIHRoYXQgdGhlIHNoYXBlIG9mIHRoZSBibG9ja3MgY29ubmVjdGVkIHRvIGFuXG4gKiBgQGlmYCBibG9jayBpcyBjb3JyZWN0LiBSZXR1cm5zIGFuIGFycmF5IG9mIGVycm9ycy5cbiAqL1xuZnVuY3Rpb24gdmFsaWRhdGVJZkNvbm5lY3RlZEJsb2Nrcyhjb25uZWN0ZWRCbG9ja3M6IGh0bWwuQmxvY2tbXSk6IFBhcnNlRXJyb3JbXSB7XG4gIGNvbnN0IGVycm9yczogUGFyc2VFcnJvcltdID0gW107XG4gIGxldCBoYXNFbHNlID0gZmFsc2U7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb25uZWN0ZWRCbG9ja3MubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBibG9jayA9IGNvbm5lY3RlZEJsb2Nrc1tpXTtcblxuICAgIGlmIChibG9jay5uYW1lID09PSAnZWxzZScpIHtcbiAgICAgIGlmIChoYXNFbHNlKSB7XG4gICAgICAgIGVycm9ycy5wdXNoKFxuICAgICAgICAgIG5ldyBQYXJzZUVycm9yKGJsb2NrLnN0YXJ0U291cmNlU3BhbiwgJ0NvbmRpdGlvbmFsIGNhbiBvbmx5IGhhdmUgb25lIEBlbHNlIGJsb2NrJyksXG4gICAgICAgICk7XG4gICAgICB9IGVsc2UgaWYgKGNvbm5lY3RlZEJsb2Nrcy5sZW5ndGggPiAxICYmIGkgPCBjb25uZWN0ZWRCbG9ja3MubGVuZ3RoIC0gMSkge1xuICAgICAgICBlcnJvcnMucHVzaChcbiAgICAgICAgICBuZXcgUGFyc2VFcnJvcihibG9jay5zdGFydFNvdXJjZVNwYW4sICdAZWxzZSBibG9jayBtdXN0IGJlIGxhc3QgaW5zaWRlIHRoZSBjb25kaXRpb25hbCcpLFxuICAgICAgICApO1xuICAgICAgfSBlbHNlIGlmIChibG9jay5wYXJhbWV0ZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgZXJyb3JzLnB1c2gobmV3IFBhcnNlRXJyb3IoYmxvY2suc3RhcnRTb3VyY2VTcGFuLCAnQGVsc2UgYmxvY2sgY2Fubm90IGhhdmUgcGFyYW1ldGVycycpKTtcbiAgICAgIH1cbiAgICAgIGhhc0Vsc2UgPSB0cnVlO1xuICAgIH0gZWxzZSBpZiAoIUVMU0VfSUZfUEFUVEVSTi50ZXN0KGJsb2NrLm5hbWUpKSB7XG4gICAgICBlcnJvcnMucHVzaChcbiAgICAgICAgbmV3IFBhcnNlRXJyb3IoYmxvY2suc3RhcnRTb3VyY2VTcGFuLCBgVW5yZWNvZ25pemVkIGNvbmRpdGlvbmFsIGJsb2NrIEAke2Jsb2NrLm5hbWV9YCksXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBlcnJvcnM7XG59XG5cbi8qKiBDaGVja3MgdGhhdCB0aGUgc2hhcGUgb2YgYSBgc3dpdGNoYCBibG9jayBpcyB2YWxpZC4gUmV0dXJucyBhbiBhcnJheSBvZiBlcnJvcnMuICovXG5mdW5jdGlvbiB2YWxpZGF0ZVN3aXRjaEJsb2NrKGFzdDogaHRtbC5CbG9jayk6IFBhcnNlRXJyb3JbXSB7XG4gIGNvbnN0IGVycm9yczogUGFyc2VFcnJvcltdID0gW107XG4gIGxldCBoYXNEZWZhdWx0ID0gZmFsc2U7XG5cbiAgaWYgKGFzdC5wYXJhbWV0ZXJzLmxlbmd0aCAhPT0gMSkge1xuICAgIGVycm9ycy5wdXNoKFxuICAgICAgbmV3IFBhcnNlRXJyb3IoYXN0LnN0YXJ0U291cmNlU3BhbiwgJ0Bzd2l0Y2ggYmxvY2sgbXVzdCBoYXZlIGV4YWN0bHkgb25lIHBhcmFtZXRlcicpLFxuICAgICk7XG4gICAgcmV0dXJuIGVycm9ycztcbiAgfVxuXG4gIGZvciAoY29uc3Qgbm9kZSBvZiBhc3QuY2hpbGRyZW4pIHtcbiAgICAvLyBTa2lwIG92ZXIgY29tbWVudHMgYW5kIGVtcHR5IHRleHQgbm9kZXMgaW5zaWRlIHRoZSBzd2l0Y2ggYmxvY2suXG4gICAgLy8gRW1wdHkgdGV4dCBub2RlcyBjYW4gYmUgdXNlZCBmb3IgZm9ybWF0dGluZyB3aGlsZSBjb21tZW50cyBkb24ndCBhZmZlY3QgdGhlIHJ1bnRpbWUuXG4gICAgaWYgKFxuICAgICAgbm9kZSBpbnN0YW5jZW9mIGh0bWwuQ29tbWVudCB8fFxuICAgICAgKG5vZGUgaW5zdGFuY2VvZiBodG1sLlRleHQgJiYgbm9kZS52YWx1ZS50cmltKCkubGVuZ3RoID09PSAwKVxuICAgICkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgaWYgKCEobm9kZSBpbnN0YW5jZW9mIGh0bWwuQmxvY2spIHx8IChub2RlLm5hbWUgIT09ICdjYXNlJyAmJiBub2RlLm5hbWUgIT09ICdkZWZhdWx0JykpIHtcbiAgICAgIGVycm9ycy5wdXNoKFxuICAgICAgICBuZXcgUGFyc2VFcnJvcihub2RlLnNvdXJjZVNwYW4sICdAc3dpdGNoIGJsb2NrIGNhbiBvbmx5IGNvbnRhaW4gQGNhc2UgYW5kIEBkZWZhdWx0IGJsb2NrcycpLFxuICAgICAgKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGlmIChub2RlLm5hbWUgPT09ICdkZWZhdWx0Jykge1xuICAgICAgaWYgKGhhc0RlZmF1bHQpIHtcbiAgICAgICAgZXJyb3JzLnB1c2goXG4gICAgICAgICAgbmV3IFBhcnNlRXJyb3Iobm9kZS5zdGFydFNvdXJjZVNwYW4sICdAc3dpdGNoIGJsb2NrIGNhbiBvbmx5IGhhdmUgb25lIEBkZWZhdWx0IGJsb2NrJyksXG4gICAgICAgICk7XG4gICAgICB9IGVsc2UgaWYgKG5vZGUucGFyYW1ldGVycy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGVycm9ycy5wdXNoKG5ldyBQYXJzZUVycm9yKG5vZGUuc3RhcnRTb3VyY2VTcGFuLCAnQGRlZmF1bHQgYmxvY2sgY2Fubm90IGhhdmUgcGFyYW1ldGVycycpKTtcbiAgICAgIH1cbiAgICAgIGhhc0RlZmF1bHQgPSB0cnVlO1xuICAgIH0gZWxzZSBpZiAobm9kZS5uYW1lID09PSAnY2FzZScgJiYgbm9kZS5wYXJhbWV0ZXJzLmxlbmd0aCAhPT0gMSkge1xuICAgICAgZXJyb3JzLnB1c2goXG4gICAgICAgIG5ldyBQYXJzZUVycm9yKG5vZGUuc3RhcnRTb3VyY2VTcGFuLCAnQGNhc2UgYmxvY2sgbXVzdCBoYXZlIGV4YWN0bHkgb25lIHBhcmFtZXRlcicpLFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZXJyb3JzO1xufVxuXG4vKipcbiAqIFBhcnNlcyBhIGJsb2NrIHBhcmFtZXRlciBpbnRvIGEgYmluZGluZyBBU1QuXG4gKiBAcGFyYW0gYXN0IEJsb2NrIHBhcmFtZXRlciB0aGF0IHNob3VsZCBiZSBwYXJzZWQuXG4gKiBAcGFyYW0gYmluZGluZ1BhcnNlciBQYXJzZXIgdGhhdCB0aGUgZXhwcmVzc2lvbiBzaG91bGQgYmUgcGFyc2VkIHdpdGguXG4gKiBAcGFyYW0gcGFydCBTcGVjaWZpYyBwYXJ0IG9mIHRoZSBleHByZXNzaW9uIHRoYXQgc2hvdWxkIGJlIHBhcnNlZC5cbiAqL1xuZnVuY3Rpb24gcGFyc2VCbG9ja1BhcmFtZXRlclRvQmluZGluZyhcbiAgYXN0OiBodG1sLkJsb2NrUGFyYW1ldGVyLFxuICBiaW5kaW5nUGFyc2VyOiBCaW5kaW5nUGFyc2VyLFxuICBwYXJ0Pzogc3RyaW5nLFxuKTogQVNUV2l0aFNvdXJjZSB7XG4gIGxldCBzdGFydDogbnVtYmVyO1xuICBsZXQgZW5kOiBudW1iZXI7XG5cbiAgaWYgKHR5cGVvZiBwYXJ0ID09PSAnc3RyaW5nJykge1xuICAgIC8vIE5vdGU6IGBsYXN0SW5kZXhPZmAgaGVyZSBzaG91bGQgYmUgZW5vdWdoIHRvIGtub3cgdGhlIHN0YXJ0IGluZGV4IG9mIHRoZSBleHByZXNzaW9uLFxuICAgIC8vIGJlY2F1c2Ugd2Uga25vdyB0aGF0IGl0J2xsIGJlIGF0IHRoZSBlbmQgb2YgdGhlIHBhcmFtLiBJZGVhbGx5IHdlIGNvdWxkIHVzZSB0aGUgYGRgXG4gICAgLy8gZmxhZyB3aGVuIG1hdGNoaW5nIHZpYSByZWdleCBhbmQgZ2V0IHRoZSBpbmRleCBmcm9tIGBtYXRjaC5pbmRpY2VzYCwgYnV0IGl0J3MgdW5jbGVhclxuICAgIC8vIGlmIHdlIGNhbiB1c2UgaXQgeWV0IHNpbmNlIGl0J3MgYSByZWxhdGl2ZWx5IG5ldyBmZWF0dXJlLiBTZWU6XG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3RjMzkvcHJvcG9zYWwtcmVnZXhwLW1hdGNoLWluZGljZXNcbiAgICBzdGFydCA9IE1hdGgubWF4KDAsIGFzdC5leHByZXNzaW9uLmxhc3RJbmRleE9mKHBhcnQpKTtcbiAgICBlbmQgPSBzdGFydCArIHBhcnQubGVuZ3RoO1xuICB9IGVsc2Uge1xuICAgIHN0YXJ0ID0gMDtcbiAgICBlbmQgPSBhc3QuZXhwcmVzc2lvbi5sZW5ndGg7XG4gIH1cblxuICByZXR1cm4gYmluZGluZ1BhcnNlci5wYXJzZUJpbmRpbmcoXG4gICAgYXN0LmV4cHJlc3Npb24uc2xpY2Uoc3RhcnQsIGVuZCksXG4gICAgZmFsc2UsXG4gICAgYXN0LnNvdXJjZVNwYW4sXG4gICAgYXN0LnNvdXJjZVNwYW4uc3RhcnQub2Zmc2V0ICsgc3RhcnQsXG4gICk7XG59XG5cbi8qKiBQYXJzZXMgdGhlIHBhcmFtZXRlciBvZiBhIGNvbmRpdGlvbmFsIGJsb2NrIChgaWZgIG9yIGBlbHNlIGlmYCkuICovXG5mdW5jdGlvbiBwYXJzZUNvbmRpdGlvbmFsQmxvY2tQYXJhbWV0ZXJzKFxuICBibG9jazogaHRtbC5CbG9jayxcbiAgZXJyb3JzOiBQYXJzZUVycm9yW10sXG4gIGJpbmRpbmdQYXJzZXI6IEJpbmRpbmdQYXJzZXIsXG4pIHtcbiAgaWYgKGJsb2NrLnBhcmFtZXRlcnMubGVuZ3RoID09PSAwKSB7XG4gICAgZXJyb3JzLnB1c2goXG4gICAgICBuZXcgUGFyc2VFcnJvcihibG9jay5zdGFydFNvdXJjZVNwYW4sICdDb25kaXRpb25hbCBibG9jayBkb2VzIG5vdCBoYXZlIGFuIGV4cHJlc3Npb24nKSxcbiAgICApO1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgY29uc3QgZXhwcmVzc2lvbiA9IHBhcnNlQmxvY2tQYXJhbWV0ZXJUb0JpbmRpbmcoYmxvY2sucGFyYW1ldGVyc1swXSwgYmluZGluZ1BhcnNlcik7XG4gIGxldCBleHByZXNzaW9uQWxpYXM6IHQuVmFyaWFibGUgfCBudWxsID0gbnVsbDtcblxuICAvLyBTdGFydCBmcm9tIDEgc2luY2Ugd2UgcHJvY2Vzc2VkIHRoZSBmaXJzdCBwYXJhbWV0ZXIgYWxyZWFkeS5cbiAgZm9yIChsZXQgaSA9IDE7IGkgPCBibG9jay5wYXJhbWV0ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgcGFyYW0gPSBibG9jay5wYXJhbWV0ZXJzW2ldO1xuICAgIGNvbnN0IGFsaWFzTWF0Y2ggPSBwYXJhbS5leHByZXNzaW9uLm1hdGNoKENPTkRJVElPTkFMX0FMSUFTX1BBVFRFUk4pO1xuXG4gICAgLy8gRm9yIG5vdyBjb25kaXRpb25hbHMgY2FuIG9ubHkgaGF2ZSBhbiBgYXNgIHBhcmFtZXRlci5cbiAgICAvLyBXZSBtYXkgd2FudCB0byByZXdvcmsgdGhpcyBsYXRlciBpZiB3ZSBhZGQgbW9yZS5cbiAgICBpZiAoYWxpYXNNYXRjaCA9PT0gbnVsbCkge1xuICAgICAgZXJyb3JzLnB1c2goXG4gICAgICAgIG5ldyBQYXJzZUVycm9yKFxuICAgICAgICAgIHBhcmFtLnNvdXJjZVNwYW4sXG4gICAgICAgICAgYFVucmVjb2duaXplZCBjb25kaXRpb25hbCBwYXJhbWF0ZXIgXCIke3BhcmFtLmV4cHJlc3Npb259XCJgLFxuICAgICAgICApLFxuICAgICAgKTtcbiAgICB9IGVsc2UgaWYgKGJsb2NrLm5hbWUgIT09ICdpZicpIHtcbiAgICAgIGVycm9ycy5wdXNoKFxuICAgICAgICBuZXcgUGFyc2VFcnJvcihcbiAgICAgICAgICBwYXJhbS5zb3VyY2VTcGFuLFxuICAgICAgICAgICdcImFzXCIgZXhwcmVzc2lvbiBpcyBvbmx5IGFsbG93ZWQgb24gdGhlIHByaW1hcnkgQGlmIGJsb2NrJyxcbiAgICAgICAgKSxcbiAgICAgICk7XG4gICAgfSBlbHNlIGlmIChleHByZXNzaW9uQWxpYXMgIT09IG51bGwpIHtcbiAgICAgIGVycm9ycy5wdXNoKFxuICAgICAgICBuZXcgUGFyc2VFcnJvcihwYXJhbS5zb3VyY2VTcGFuLCAnQ29uZGl0aW9uYWwgY2FuIG9ubHkgaGF2ZSBvbmUgXCJhc1wiIGV4cHJlc3Npb24nKSxcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IG5hbWUgPSBhbGlhc01hdGNoWzJdLnRyaW0oKTtcbiAgICAgIGNvbnN0IHZhcmlhYmxlU3RhcnQgPSBwYXJhbS5zb3VyY2VTcGFuLnN0YXJ0Lm1vdmVCeShhbGlhc01hdGNoWzFdLmxlbmd0aCk7XG4gICAgICBjb25zdCB2YXJpYWJsZVNwYW4gPSBuZXcgUGFyc2VTb3VyY2VTcGFuKHZhcmlhYmxlU3RhcnQsIHZhcmlhYmxlU3RhcnQubW92ZUJ5KG5hbWUubGVuZ3RoKSk7XG4gICAgICBleHByZXNzaW9uQWxpYXMgPSBuZXcgdC5WYXJpYWJsZShuYW1lLCBuYW1lLCB2YXJpYWJsZVNwYW4sIHZhcmlhYmxlU3Bhbik7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHtleHByZXNzaW9uLCBleHByZXNzaW9uQWxpYXN9O1xufVxuXG4vKiogU3RyaXBzIG9wdGlvbmFsIHBhcmVudGhlc2VzIGFyb3VuZCBmcm9tIGEgY29udHJvbCBmcm9tIGV4cHJlc3Npb24gcGFyYW1ldGVyLiAqL1xuZnVuY3Rpb24gc3RyaXBPcHRpb25hbFBhcmVudGhlc2VzKHBhcmFtOiBodG1sLkJsb2NrUGFyYW1ldGVyLCBlcnJvcnM6IFBhcnNlRXJyb3JbXSk6IHN0cmluZyB8IG51bGwge1xuICBjb25zdCBleHByZXNzaW9uID0gcGFyYW0uZXhwcmVzc2lvbjtcbiAgY29uc3Qgc3BhY2VSZWdleCA9IC9eXFxzJC87XG4gIGxldCBvcGVuUGFyZW5zID0gMDtcbiAgbGV0IHN0YXJ0ID0gMDtcbiAgbGV0IGVuZCA9IGV4cHJlc3Npb24ubGVuZ3RoIC0gMTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGV4cHJlc3Npb24ubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBjaGFyID0gZXhwcmVzc2lvbltpXTtcblxuICAgIGlmIChjaGFyID09PSAnKCcpIHtcbiAgICAgIHN0YXJ0ID0gaSArIDE7XG4gICAgICBvcGVuUGFyZW5zKys7XG4gICAgfSBlbHNlIGlmIChzcGFjZVJlZ2V4LnRlc3QoY2hhcikpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBpZiAob3BlblBhcmVucyA9PT0gMCkge1xuICAgIHJldHVybiBleHByZXNzaW9uO1xuICB9XG5cbiAgZm9yIChsZXQgaSA9IGV4cHJlc3Npb24ubGVuZ3RoIC0gMTsgaSA+IC0xOyBpLS0pIHtcbiAgICBjb25zdCBjaGFyID0gZXhwcmVzc2lvbltpXTtcblxuICAgIGlmIChjaGFyID09PSAnKScpIHtcbiAgICAgIGVuZCA9IGk7XG4gICAgICBvcGVuUGFyZW5zLS07XG4gICAgICBpZiAob3BlblBhcmVucyA9PT0gMCkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHNwYWNlUmVnZXgudGVzdChjaGFyKSkge1xuICAgICAgY29udGludWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIGlmIChvcGVuUGFyZW5zICE9PSAwKSB7XG4gICAgZXJyb3JzLnB1c2gobmV3IFBhcnNlRXJyb3IocGFyYW0uc291cmNlU3BhbiwgJ1VuY2xvc2VkIHBhcmVudGhlc2VzIGluIGV4cHJlc3Npb24nKSk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICByZXR1cm4gZXhwcmVzc2lvbi5zbGljZShzdGFydCwgZW5kKTtcbn1cbiJdfQ==