/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as chars from '../chars';
import { Lexer, TokenType } from '../expression_parser/lexer';
import { ParseError, ParseSourceSpan } from '../parse_util';
import * as t from './r3_ast';
/** Pattern for a timing value in a trigger. */
const TIME_PATTERN = /^\d+\.?\d*(ms|s)?$/;
/** Pattern for a separator between keywords in a trigger expression. */
const SEPARATOR_PATTERN = /^\s$/;
/** Pairs of characters that form syntax that is comma-delimited. */
const COMMA_DELIMITED_SYNTAX = new Map([
    [chars.$LBRACE, chars.$RBRACE], // Object literals
    [chars.$LBRACKET, chars.$RBRACKET], // Array literals
    [chars.$LPAREN, chars.$RPAREN], // Function calls
]);
/** Possible types of `on` triggers. */
var OnTriggerType;
(function (OnTriggerType) {
    OnTriggerType["IDLE"] = "idle";
    OnTriggerType["TIMER"] = "timer";
    OnTriggerType["INTERACTION"] = "interaction";
    OnTriggerType["IMMEDIATE"] = "immediate";
    OnTriggerType["HOVER"] = "hover";
    OnTriggerType["VIEWPORT"] = "viewport";
})(OnTriggerType || (OnTriggerType = {}));
/** Parses a `when` deferred trigger. */
export function parseWhenTrigger({ expression, sourceSpan }, bindingParser, triggers, errors) {
    const whenIndex = expression.indexOf('when');
    const whenSourceSpan = new ParseSourceSpan(sourceSpan.start.moveBy(whenIndex), sourceSpan.start.moveBy(whenIndex + 'when'.length));
    const prefetchSpan = getPrefetchSpan(expression, sourceSpan);
    // This is here just to be safe, we shouldn't enter this function
    // in the first place if a block doesn't have the "when" keyword.
    if (whenIndex === -1) {
        errors.push(new ParseError(sourceSpan, `Could not find "when" keyword in expression`));
    }
    else {
        const start = getTriggerParametersStart(expression, whenIndex + 1);
        const parsed = bindingParser.parseBinding(expression.slice(start), false, sourceSpan, sourceSpan.start.offset + start);
        trackTrigger('when', triggers, errors, new t.BoundDeferredTrigger(parsed, sourceSpan, prefetchSpan, whenSourceSpan));
    }
}
/** Parses an `on` trigger */
export function parseOnTrigger({ expression, sourceSpan }, triggers, errors, placeholder) {
    const onIndex = expression.indexOf('on');
    const onSourceSpan = new ParseSourceSpan(sourceSpan.start.moveBy(onIndex), sourceSpan.start.moveBy(onIndex + 'on'.length));
    const prefetchSpan = getPrefetchSpan(expression, sourceSpan);
    // This is here just to be safe, we shouldn't enter this function
    // in the first place if a block doesn't have the "on" keyword.
    if (onIndex === -1) {
        errors.push(new ParseError(sourceSpan, `Could not find "on" keyword in expression`));
    }
    else {
        const start = getTriggerParametersStart(expression, onIndex + 1);
        const parser = new OnTriggerParser(expression, start, sourceSpan, triggers, errors, placeholder, prefetchSpan, onSourceSpan);
        parser.parse();
    }
}
function getPrefetchSpan(expression, sourceSpan) {
    if (!expression.startsWith('prefetch')) {
        return null;
    }
    return new ParseSourceSpan(sourceSpan.start, sourceSpan.start.moveBy('prefetch'.length));
}
class OnTriggerParser {
    constructor(expression, start, span, triggers, errors, placeholder, prefetchSpan, onSourceSpan) {
        this.expression = expression;
        this.start = start;
        this.span = span;
        this.triggers = triggers;
        this.errors = errors;
        this.placeholder = placeholder;
        this.prefetchSpan = prefetchSpan;
        this.onSourceSpan = onSourceSpan;
        this.index = 0;
        this.tokens = new Lexer().tokenize(expression.slice(start));
    }
    parse() {
        while (this.tokens.length > 0 && this.index < this.tokens.length) {
            const token = this.token();
            if (!token.isIdentifier()) {
                this.unexpectedToken(token);
                break;
            }
            // An identifier immediately followed by a comma or the end of
            // the expression cannot have parameters so we can exit early.
            if (this.isFollowedByOrLast(chars.$COMMA)) {
                this.consumeTrigger(token, []);
                this.advance();
            }
            else if (this.isFollowedByOrLast(chars.$LPAREN)) {
                this.advance(); // Advance to the opening paren.
                const prevErrors = this.errors.length;
                const parameters = this.consumeParameters();
                if (this.errors.length !== prevErrors) {
                    break;
                }
                this.consumeTrigger(token, parameters);
                this.advance(); // Advance past the closing paren.
            }
            else if (this.index < this.tokens.length - 1) {
                this.unexpectedToken(this.tokens[this.index + 1]);
            }
            this.advance();
        }
    }
    advance() {
        this.index++;
    }
    isFollowedByOrLast(char) {
        if (this.index === this.tokens.length - 1) {
            return true;
        }
        return this.tokens[this.index + 1].isCharacter(char);
    }
    token() {
        return this.tokens[Math.min(this.index, this.tokens.length - 1)];
    }
    consumeTrigger(identifier, parameters) {
        const triggerNameStartSpan = this.span.start.moveBy(this.start + identifier.index - this.tokens[0].index);
        const nameSpan = new ParseSourceSpan(triggerNameStartSpan, triggerNameStartSpan.moveBy(identifier.strValue.length));
        const endSpan = triggerNameStartSpan.moveBy(this.token().end - identifier.index);
        // Put the prefetch and on spans with the first trigger
        // This should maybe be refactored to have something like an outer OnGroup AST
        // Since triggers can be grouped with commas "on hover(x), interaction(y)"
        const isFirstTrigger = identifier.index === 0;
        const onSourceSpan = isFirstTrigger ? this.onSourceSpan : null;
        const prefetchSourceSpan = isFirstTrigger ? this.prefetchSpan : null;
        const sourceSpan = new ParseSourceSpan(isFirstTrigger ? this.span.start : triggerNameStartSpan, endSpan);
        try {
            switch (identifier.toString()) {
                case OnTriggerType.IDLE:
                    this.trackTrigger('idle', createIdleTrigger(parameters, nameSpan, sourceSpan, prefetchSourceSpan, onSourceSpan));
                    break;
                case OnTriggerType.TIMER:
                    this.trackTrigger('timer', createTimerTrigger(parameters, nameSpan, sourceSpan, this.prefetchSpan, this.onSourceSpan));
                    break;
                case OnTriggerType.INTERACTION:
                    this.trackTrigger('interaction', createInteractionTrigger(parameters, nameSpan, sourceSpan, this.prefetchSpan, this.onSourceSpan, this.placeholder));
                    break;
                case OnTriggerType.IMMEDIATE:
                    this.trackTrigger('immediate', createImmediateTrigger(parameters, nameSpan, sourceSpan, this.prefetchSpan, this.onSourceSpan));
                    break;
                case OnTriggerType.HOVER:
                    this.trackTrigger('hover', createHoverTrigger(parameters, nameSpan, sourceSpan, this.prefetchSpan, this.onSourceSpan, this.placeholder));
                    break;
                case OnTriggerType.VIEWPORT:
                    this.trackTrigger('viewport', createViewportTrigger(parameters, nameSpan, sourceSpan, this.prefetchSpan, this.onSourceSpan, this.placeholder));
                    break;
                default:
                    throw new Error(`Unrecognized trigger type "${identifier}"`);
            }
        }
        catch (e) {
            this.error(identifier, e.message);
        }
    }
    consumeParameters() {
        const parameters = [];
        if (!this.token().isCharacter(chars.$LPAREN)) {
            this.unexpectedToken(this.token());
            return parameters;
        }
        this.advance();
        const commaDelimStack = [];
        let current = '';
        while (this.index < this.tokens.length) {
            const token = this.token();
            // Stop parsing if we've hit the end character and we're outside of a comma-delimited syntax.
            // Note that we don't need to account for strings here since the lexer already parsed them
            // into string tokens.
            if (token.isCharacter(chars.$RPAREN) && commaDelimStack.length === 0) {
                if (current.length) {
                    parameters.push(current);
                }
                break;
            }
            // In the `on` microsyntax "top-level" commas (e.g. ones outside of an parameters) separate
            // the different triggers (e.g. `on idle,timer(500)`). This is problematic, because the
            // function-like syntax also implies that multiple parameters can be passed into the
            // individual trigger (e.g. `on foo(a, b)`). To avoid tripping up the parser with commas that
            // are part of other sorts of syntax (object literals, arrays), we treat anything inside
            // a comma-delimited syntax block as plain text.
            if (token.type === TokenType.Character && COMMA_DELIMITED_SYNTAX.has(token.numValue)) {
                commaDelimStack.push(COMMA_DELIMITED_SYNTAX.get(token.numValue));
            }
            if (commaDelimStack.length > 0 &&
                token.isCharacter(commaDelimStack[commaDelimStack.length - 1])) {
                commaDelimStack.pop();
            }
            // If we hit a comma outside of a comma-delimited syntax, it means
            // that we're at the top level and we're starting a new parameter.
            if (commaDelimStack.length === 0 && token.isCharacter(chars.$COMMA) && current.length > 0) {
                parameters.push(current);
                current = '';
                this.advance();
                continue;
            }
            // Otherwise treat the token as a plain text character in the current parameter.
            current += this.tokenText();
            this.advance();
        }
        if (!this.token().isCharacter(chars.$RPAREN) || commaDelimStack.length > 0) {
            this.error(this.token(), 'Unexpected end of expression');
        }
        if (this.index < this.tokens.length - 1 &&
            !this.tokens[this.index + 1].isCharacter(chars.$COMMA)) {
            this.unexpectedToken(this.tokens[this.index + 1]);
        }
        return parameters;
    }
    tokenText() {
        // Tokens have a toString already which we could use, but for string tokens it omits the quotes.
        // Eventually we could expose this information on the token directly.
        return this.expression.slice(this.start + this.token().index, this.start + this.token().end);
    }
    trackTrigger(name, trigger) {
        trackTrigger(name, this.triggers, this.errors, trigger);
    }
    error(token, message) {
        const newStart = this.span.start.moveBy(this.start + token.index);
        const newEnd = newStart.moveBy(token.end - token.index);
        this.errors.push(new ParseError(new ParseSourceSpan(newStart, newEnd), message));
    }
    unexpectedToken(token) {
        this.error(token, `Unexpected token "${token}"`);
    }
}
/** Adds a trigger to a map of triggers. */
function trackTrigger(name, allTriggers, errors, trigger) {
    if (allTriggers[name]) {
        errors.push(new ParseError(trigger.sourceSpan, `Duplicate "${name}" trigger is not allowed`));
    }
    else {
        allTriggers[name] = trigger;
    }
}
function createIdleTrigger(parameters, nameSpan, sourceSpan, prefetchSpan, onSourceSpan) {
    if (parameters.length > 0) {
        throw new Error(`"${OnTriggerType.IDLE}" trigger cannot have parameters`);
    }
    return new t.IdleDeferredTrigger(nameSpan, sourceSpan, prefetchSpan, onSourceSpan);
}
function createTimerTrigger(parameters, nameSpan, sourceSpan, prefetchSpan, onSourceSpan) {
    if (parameters.length !== 1) {
        throw new Error(`"${OnTriggerType.TIMER}" trigger must have exactly one parameter`);
    }
    const delay = parseDeferredTime(parameters[0]);
    if (delay === null) {
        throw new Error(`Could not parse time value of trigger "${OnTriggerType.TIMER}"`);
    }
    return new t.TimerDeferredTrigger(delay, nameSpan, sourceSpan, prefetchSpan, onSourceSpan);
}
function createImmediateTrigger(parameters, nameSpan, sourceSpan, prefetchSpan, onSourceSpan) {
    if (parameters.length > 0) {
        throw new Error(`"${OnTriggerType.IMMEDIATE}" trigger cannot have parameters`);
    }
    return new t.ImmediateDeferredTrigger(nameSpan, sourceSpan, prefetchSpan, onSourceSpan);
}
function createHoverTrigger(parameters, nameSpan, sourceSpan, prefetchSpan, onSourceSpan, placeholder) {
    validateReferenceBasedTrigger(OnTriggerType.HOVER, parameters, placeholder);
    return new t.HoverDeferredTrigger(parameters[0] ?? null, nameSpan, sourceSpan, prefetchSpan, onSourceSpan);
}
function createInteractionTrigger(parameters, nameSpan, sourceSpan, prefetchSpan, onSourceSpan, placeholder) {
    validateReferenceBasedTrigger(OnTriggerType.INTERACTION, parameters, placeholder);
    return new t.InteractionDeferredTrigger(parameters[0] ?? null, nameSpan, sourceSpan, prefetchSpan, onSourceSpan);
}
function createViewportTrigger(parameters, nameSpan, sourceSpan, prefetchSpan, onSourceSpan, placeholder) {
    validateReferenceBasedTrigger(OnTriggerType.VIEWPORT, parameters, placeholder);
    return new t.ViewportDeferredTrigger(parameters[0] ?? null, nameSpan, sourceSpan, prefetchSpan, onSourceSpan);
}
function validateReferenceBasedTrigger(type, parameters, placeholder) {
    if (parameters.length > 1) {
        throw new Error(`"${type}" trigger can only have zero or one parameters`);
    }
    if (parameters.length === 0) {
        if (placeholder === null) {
            throw new Error(`"${type}" trigger with no parameters can only be placed on an @defer that has a @placeholder block`);
        }
        if (placeholder.children.length !== 1 || !(placeholder.children[0] instanceof t.Element)) {
            throw new Error(`"${type}" trigger with no parameters can only be placed on an @defer that has a ` +
                `@placeholder block with exactly one root element node`);
        }
    }
}
/** Gets the index within an expression at which the trigger parameters start. */
export function getTriggerParametersStart(value, startPosition = 0) {
    let hasFoundSeparator = false;
    for (let i = startPosition; i < value.length; i++) {
        if (SEPARATOR_PATTERN.test(value[i])) {
            hasFoundSeparator = true;
        }
        else if (hasFoundSeparator) {
            return i;
        }
    }
    return -1;
}
/**
 * Parses a time expression from a deferred trigger to
 * milliseconds. Returns null if it cannot be parsed.
 */
export function parseDeferredTime(value) {
    const match = value.match(TIME_PATTERN);
    if (!match) {
        return null;
    }
    const [time, units] = match;
    return parseFloat(time) * (units === 's' ? 1000 : 1);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicjNfZGVmZXJyZWRfdHJpZ2dlcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvcmVuZGVyMy9yM19kZWZlcnJlZF90cmlnZ2Vycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEtBQUssS0FBSyxNQUFNLFVBQVUsQ0FBQztBQUNsQyxPQUFPLEVBQUMsS0FBSyxFQUFTLFNBQVMsRUFBQyxNQUFNLDRCQUE0QixDQUFDO0FBRW5FLE9BQU8sRUFBQyxVQUFVLEVBQUUsZUFBZSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRzFELE9BQU8sS0FBSyxDQUFDLE1BQU0sVUFBVSxDQUFDO0FBRTlCLCtDQUErQztBQUMvQyxNQUFNLFlBQVksR0FBRyxvQkFBb0IsQ0FBQztBQUUxQyx3RUFBd0U7QUFDeEUsTUFBTSxpQkFBaUIsR0FBRyxNQUFNLENBQUM7QUFFakMsb0VBQW9FO0FBQ3BFLE1BQU0sc0JBQXNCLEdBQUcsSUFBSSxHQUFHLENBQUM7SUFDckMsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxrQkFBa0I7SUFDbEQsQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsRUFBRSxpQkFBaUI7SUFDckQsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxpQkFBaUI7Q0FDbEQsQ0FBQyxDQUFDO0FBRUgsdUNBQXVDO0FBQ3ZDLElBQUssYUFPSjtBQVBELFdBQUssYUFBYTtJQUNoQiw4QkFBYSxDQUFBO0lBQ2IsZ0NBQWUsQ0FBQTtJQUNmLDRDQUEyQixDQUFBO0lBQzNCLHdDQUF1QixDQUFBO0lBQ3ZCLGdDQUFlLENBQUE7SUFDZixzQ0FBcUIsQ0FBQTtBQUN2QixDQUFDLEVBUEksYUFBYSxLQUFiLGFBQWEsUUFPakI7QUFFRCx3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Q0FBQztJQUVELE9BQU8sQ0FBQyxDQUFDLENBQUM7QUFDWixDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsTUFBTSxVQUFVLGlCQUFpQixDQUFDLEtBQWE7SUFDN0MsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUV4QyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDWCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFFRCxNQUFNLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxHQUFHLEtBQUssQ0FBQztJQUM1QixPQUFPLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdkQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgY2hhcnMgZnJvbSAnLi4vY2hhcnMnO1xuaW1wb3J0IHtMZXhlciwgVG9rZW4sIFRva2VuVHlwZX0gZnJvbSAnLi4vZXhwcmVzc2lvbl9wYXJzZXIvbGV4ZXInO1xuaW1wb3J0ICogYXMgaHRtbCBmcm9tICcuLi9tbF9wYXJzZXIvYXN0JztcbmltcG9ydCB7UGFyc2VFcnJvciwgUGFyc2VTb3VyY2VTcGFufSBmcm9tICcuLi9wYXJzZV91dGlsJztcbmltcG9ydCB7QmluZGluZ1BhcnNlcn0gZnJvbSAnLi4vdGVtcGxhdGVfcGFyc2VyL2JpbmRpbmdfcGFyc2VyJztcblxuaW1wb3J0ICogYXMgdCBmcm9tICcuL3IzX2FzdCc7XG5cbi8qKiBQYXR0ZXJuIGZvciBhIHRpbWluZyB2YWx1ZSBpbiBhIHRyaWdnZXIuICovXG5jb25zdCBUSU1FX1BBVFRFUk4gPSAvXlxcZCtcXC4/XFxkKihtc3xzKT8kLztcblxuLyoqIFBhdHRlcm4gZm9yIGEgc2VwYXJhdG9yIGJldHdlZW4ga2V5d29yZHMgaW4gYSB0cmlnZ2VyIGV4cHJlc3Npb24uICovXG5jb25zdCBTRVBBUkFUT1JfUEFUVEVSTiA9IC9eXFxzJC87XG5cbi8qKiBQYWlycyBvZiBjaGFyYWN0ZXJzIHRoYXQgZm9ybSBzeW50YXggdGhhdCBpcyBjb21tYS1kZWxpbWl0ZWQuICovXG5jb25zdCBDT01NQV9ERUxJTUlURURfU1lOVEFYID0gbmV3IE1hcChbXG4gIFtjaGFycy4kTEJSQUNFLCBjaGFycy4kUkJSQUNFXSwgLy8gT2JqZWN0IGxpdGVyYWxzXG4gIFtjaGFycy4kTEJSQUNLRVQsIGNoYXJzLiRSQlJBQ0tFVF0sIC8vIEFycmF5IGxpdGVyYWxzXG4gIFtjaGFycy4kTFBBUkVOLCBjaGFycy4kUlBBUkVOXSwgLy8gRnVuY3Rpb24gY2FsbHNcbl0pO1xuXG4vKiogUG9zc2libGUgdHlwZXMgb2YgYG9uYCB0cmlnZ2Vycy4gKi9cbmVudW0gT25UcmlnZ2VyVHlwZSB7XG4gIElETEUgPSAnaWRsZScsXG4gIFRJTUVSID0gJ3RpbWVyJyxcbiAgSU5URVJBQ1RJT04gPSAnaW50ZXJhY3Rpb24nLFxuICBJTU1FRElBVEUgPSAnaW1tZWRpYXRlJyxcbiAgSE9WRVIgPSAnaG92ZXInLFxuICBWSUVXUE9SVCA9ICd2aWV3cG9ydCcsXG59XG5cbi8qKiBQYXJzZXMgYSBgd2hlbmAgZGVmZXJyZWQgdHJpZ2dlci4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVdoZW5UcmlnZ2VyKFxuICB7ZXhwcmVzc2lvbiwgc291cmNlU3Bhbn06IGh0bWwuQmxvY2tQYXJhbWV0ZXIsXG4gIGJpbmRpbmdQYXJzZXI6IEJpbmRpbmdQYXJzZXIsXG4gIHRyaWdnZXJzOiB0LkRlZmVycmVkQmxvY2tUcmlnZ2VycyxcbiAgZXJyb3JzOiBQYXJzZUVycm9yW10sXG4pOiB2b2lkIHtcbiAgY29uc3Qgd2hlbkluZGV4ID0gZXhwcmVzc2lvbi5pbmRleE9mKCd3aGVuJyk7XG4gIGNvbnN0IHdoZW5Tb3VyY2VTcGFuID0gbmV3IFBhcnNlU291cmNlU3BhbihcbiAgICBzb3VyY2VTcGFuLnN0YXJ0Lm1vdmVCeSh3aGVuSW5kZXgpLFxuICAgIHNvdXJjZVNwYW4uc3RhcnQubW92ZUJ5KHdoZW5JbmRleCArICd3aGVuJy5sZW5ndGgpLFxuICApO1xuICBjb25zdCBwcmVmZXRjaFNwYW4gPSBnZXRQcmVmZXRjaFNwYW4oZXhwcmVzc2lvbiwgc291cmNlU3Bhbik7XG5cbiAgLy8gVGhpcyBpcyBoZXJlIGp1c3QgdG8gYmUgc2FmZSwgd2Ugc2hvdWxkbid0IGVudGVyIHRoaXMgZnVuY3Rpb25cbiAgLy8gaW4gdGhlIGZpcnN0IHBsYWNlIGlmIGEgYmxvY2sgZG9lc24ndCBoYXZlIHRoZSBcIndoZW5cIiBrZXl3b3JkLlxuICBpZiAod2hlbkluZGV4ID09PSAtMSkge1xuICAgIGVycm9ycy5wdXNoKG5ldyBQYXJzZUVycm9yKHNvdXJjZVNwYW4sIGBDb3VsZCBub3QgZmluZCBcIndoZW5cIiBrZXl3b3JkIGluIGV4cHJlc3Npb25gKSk7XG4gIH0gZWxzZSB7XG4gICAgY29uc3Qgc3RhcnQgPSBnZXRUcmlnZ2VyUGFyYW1ldGVyc1N0YXJ0KGV4cHJlc3Npb24sIHdoZW5JbmRleCArIDEpO1xuICAgIGNvbnN0IHBhcnNlZCA9IGJpbmRpbmdQYXJzZXIucGFyc2VCaW5kaW5nKFxuICAgICAgZXhwcmVzc2lvbi5zbGljZShzdGFydCksXG4gICAgICBmYWxzZSxcbiAgICAgIHNvdXJjZVNwYW4sXG4gICAgICBzb3VyY2VTcGFuLnN0YXJ0Lm9mZnNldCArIHN0YXJ0LFxuICAgICk7XG4gICAgdHJhY2tUcmlnZ2VyKFxuICAgICAgJ3doZW4nLFxuICAgICAgdHJpZ2dlcnMsXG4gICAgICBlcnJvcnMsXG4gICAgICBuZXcgdC5Cb3VuZERlZmVycmVkVHJpZ2dlcihwYXJzZWQsIHNvdXJjZVNwYW4sIHByZWZldGNoU3Bhbiwgd2hlblNvdXJjZVNwYW4pLFxuICAgICk7XG4gIH1cbn1cblxuLyoqIFBhcnNlcyBhbiBgb25gIHRyaWdnZXIgKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZU9uVHJpZ2dlcihcbiAge2V4cHJlc3Npb24sIHNvdXJjZVNwYW59OiBodG1sLkJsb2NrUGFyYW1ldGVyLFxuICB0cmlnZ2VyczogdC5EZWZlcnJlZEJsb2NrVHJpZ2dlcnMsXG4gIGVycm9yczogUGFyc2VFcnJvcltdLFxuICBwbGFjZWhvbGRlcjogdC5EZWZlcnJlZEJsb2NrUGxhY2Vob2xkZXIgfCBudWxsLFxuKTogdm9pZCB7XG4gIGNvbnN0IG9uSW5kZXggPSBleHByZXNzaW9uLmluZGV4T2YoJ29uJyk7XG4gIGNvbnN0IG9uU291cmNlU3BhbiA9IG5ldyBQYXJzZVNvdXJjZVNwYW4oXG4gICAgc291cmNlU3Bhbi5zdGFydC5tb3ZlQnkob25JbmRleCksXG4gICAgc291cmNlU3Bhbi5zdGFydC5tb3ZlQnkob25JbmRleCArICdvbicubGVuZ3RoKSxcbiAgKTtcbiAgY29uc3QgcHJlZmV0Y2hTcGFuID0gZ2V0UHJlZmV0Y2hTcGFuKGV4cHJlc3Npb24sIHNvdXJjZVNwYW4pO1xuXG4gIC8vIFRoaXMgaXMgaGVyZSBqdXN0IHRvIGJlIHNhZmUsIHdlIHNob3VsZG4ndCBlbnRlciB0aGlzIGZ1bmN0aW9uXG4gIC8vIGluIHRoZSBmaXJzdCBwbGFjZSBpZiBhIGJsb2NrIGRvZXNuJ3QgaGF2ZSB0aGUgXCJvblwiIGtleXdvcmQuXG4gIGlmIChvbkluZGV4ID09PSAtMSkge1xuICAgIGVycm9ycy5wdXNoKG5ldyBQYXJzZUVycm9yKHNvdXJjZVNwYW4sIGBDb3VsZCBub3QgZmluZCBcIm9uXCIga2V5d29yZCBpbiBleHByZXNzaW9uYCkpO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IHN0YXJ0ID0gZ2V0VHJpZ2dlclBhcmFtZXRlcnNTdGFydChleHByZXNzaW9uLCBvbkluZGV4ICsgMSk7XG4gICAgY29uc3QgcGFyc2VyID0gbmV3IE9uVHJpZ2dlclBhcnNlcihcbiAgICAgIGV4cHJlc3Npb24sXG4gICAgICBzdGFydCxcbiAgICAgIHNvdXJjZVNwYW4sXG4gICAgICB0cmlnZ2VycyxcbiAgICAgIGVycm9ycyxcbiAgICAgIHBsYWNlaG9sZGVyLFxuICAgICAgcHJlZmV0Y2hTcGFuLFxuICAgICAgb25Tb3VyY2VTcGFuLFxuICAgICk7XG4gICAgcGFyc2VyLnBhcnNlKCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0UHJlZmV0Y2hTcGFuKGV4cHJlc3Npb246IHN0cmluZywgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuKSB7XG4gIGlmICghZXhwcmVzc2lvbi5zdGFydHNXaXRoKCdwcmVmZXRjaCcpKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgcmV0dXJuIG5ldyBQYXJzZVNvdXJjZVNwYW4oc291cmNlU3Bhbi5zdGFydCwgc291cmNlU3Bhbi5zdGFydC5tb3ZlQnkoJ3ByZWZldGNoJy5sZW5ndGgpKTtcbn1cblxuY2xhc3MgT25UcmlnZ2VyUGFyc2VyIHtcbiAgcHJpdmF0ZSBpbmRleCA9IDA7XG4gIHByaXZhdGUgdG9rZW5zOiBUb2tlbltdO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgZXhwcmVzc2lvbjogc3RyaW5nLFxuICAgIHByaXZhdGUgc3RhcnQ6IG51bWJlcixcbiAgICBwcml2YXRlIHNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICBwcml2YXRlIHRyaWdnZXJzOiB0LkRlZmVycmVkQmxvY2tUcmlnZ2VycyxcbiAgICBwcml2YXRlIGVycm9yczogUGFyc2VFcnJvcltdLFxuICAgIHByaXZhdGUgcGxhY2Vob2xkZXI6IHQuRGVmZXJyZWRCbG9ja1BsYWNlaG9sZGVyIHwgbnVsbCxcbiAgICBwcml2YXRlIHByZWZldGNoU3BhbjogUGFyc2VTb3VyY2VTcGFuIHwgbnVsbCxcbiAgICBwcml2YXRlIG9uU291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICApIHtcbiAgICB0aGlzLnRva2VucyA9IG5ldyBMZXhlcigpLnRva2VuaXplKGV4cHJlc3Npb24uc2xpY2Uoc3RhcnQpKTtcbiAgfVxuXG4gIHBhcnNlKCk6IHZvaWQge1xuICAgIHdoaWxlICh0aGlzLnRva2Vucy5sZW5ndGggPiAwICYmIHRoaXMuaW5kZXggPCB0aGlzLnRva2Vucy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IHRva2VuID0gdGhpcy50b2tlbigpO1xuXG4gICAgICBpZiAoIXRva2VuLmlzSWRlbnRpZmllcigpKSB7XG4gICAgICAgIHRoaXMudW5leHBlY3RlZFRva2VuKHRva2VuKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIC8vIEFuIGlkZW50aWZpZXIgaW1tZWRpYXRlbHkgZm9sbG93ZWQgYnkgYSBjb21tYSBvciB0aGUgZW5kIG9mXG4gICAgICAvLyB0aGUgZXhwcmVzc2lvbiBjYW5ub3QgaGF2ZSBwYXJhbWV0ZXJzIHNvIHdlIGNhbiBleGl0IGVhcmx5LlxuICAgICAgaWYgKHRoaXMuaXNGb2xsb3dlZEJ5T3JMYXN0KGNoYXJzLiRDT01NQSkpIHtcbiAgICAgICAgdGhpcy5jb25zdW1lVHJpZ2dlcih0b2tlbiwgW10pO1xuICAgICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5pc0ZvbGxvd2VkQnlPckxhc3QoY2hhcnMuJExQQVJFTikpIHtcbiAgICAgICAgdGhpcy5hZHZhbmNlKCk7IC8vIEFkdmFuY2UgdG8gdGhlIG9wZW5pbmcgcGFyZW4uXG4gICAgICAgIGNvbnN0IHByZXZFcnJvcnMgPSB0aGlzLmVycm9ycy5sZW5ndGg7XG4gICAgICAgIGNvbnN0IHBhcmFtZXRlcnMgPSB0aGlzLmNvbnN1bWVQYXJhbWV0ZXJzKCk7XG4gICAgICAgIGlmICh0aGlzLmVycm9ycy5sZW5ndGggIT09IHByZXZFcnJvcnMpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNvbnN1bWVUcmlnZ2VyKHRva2VuLCBwYXJhbWV0ZXJzKTtcbiAgICAgICAgdGhpcy5hZHZhbmNlKCk7IC8vIEFkdmFuY2UgcGFzdCB0aGUgY2xvc2luZyBwYXJlbi5cbiAgICAgIH0gZWxzZSBpZiAodGhpcy5pbmRleCA8IHRoaXMudG9rZW5zLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgdGhpcy51bmV4cGVjdGVkVG9rZW4odGhpcy50b2tlbnNbdGhpcy5pbmRleCArIDFdKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhZHZhbmNlKCkge1xuICAgIHRoaXMuaW5kZXgrKztcbiAgfVxuXG4gIHByaXZhdGUgaXNGb2xsb3dlZEJ5T3JMYXN0KGNoYXI6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgIGlmICh0aGlzLmluZGV4ID09PSB0aGlzLnRva2Vucy5sZW5ndGggLSAxKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy50b2tlbnNbdGhpcy5pbmRleCArIDFdLmlzQ2hhcmFjdGVyKGNoYXIpO1xuICB9XG5cbiAgcHJpdmF0ZSB0b2tlbigpOiBUb2tlbiB7XG4gICAgcmV0dXJuIHRoaXMudG9rZW5zW01hdGgubWluKHRoaXMuaW5kZXgsIHRoaXMudG9rZW5zLmxlbmd0aCAtIDEpXTtcbiAgfVxuXG4gIHByaXZhdGUgY29uc3VtZVRyaWdnZXIoaWRlbnRpZmllcjogVG9rZW4sIHBhcmFtZXRlcnM6IHN0cmluZ1tdKSB7XG4gICAgY29uc3QgdHJpZ2dlck5hbWVTdGFydFNwYW4gPSB0aGlzLnNwYW4uc3RhcnQubW92ZUJ5KFxuICAgICAgdGhpcy5zdGFydCArIGlkZW50aWZpZXIuaW5kZXggLSB0aGlzLnRva2Vuc1swXS5pbmRleCxcbiAgICApO1xuICAgIGNvbnN0IG5hbWVTcGFuID0gbmV3IFBhcnNlU291cmNlU3BhbihcbiAgICAgIHRyaWdnZXJOYW1lU3RhcnRTcGFuLFxuICAgICAgdHJpZ2dlck5hbWVTdGFydFNwYW4ubW92ZUJ5KGlkZW50aWZpZXIuc3RyVmFsdWUubGVuZ3RoKSxcbiAgICApO1xuICAgIGNvbnN0IGVuZFNwYW4gPSB0cmlnZ2VyTmFtZVN0YXJ0U3Bhbi5tb3ZlQnkodGhpcy50b2tlbigpLmVuZCAtIGlkZW50aWZpZXIuaW5kZXgpO1xuXG4gICAgLy8gUHV0IHRoZSBwcmVmZXRjaCBhbmQgb24gc3BhbnMgd2l0aCB0aGUgZmlyc3QgdHJpZ2dlclxuICAgIC8vIFRoaXMgc2hvdWxkIG1heWJlIGJlIHJlZmFjdG9yZWQgdG8gaGF2ZSBzb21ldGhpbmcgbGlrZSBhbiBvdXRlciBPbkdyb3VwIEFTVFxuICAgIC8vIFNpbmNlIHRyaWdnZXJzIGNhbiBiZSBncm91cGVkIHdpdGggY29tbWFzIFwib24gaG92ZXIoeCksIGludGVyYWN0aW9uKHkpXCJcbiAgICBjb25zdCBpc0ZpcnN0VHJpZ2dlciA9IGlkZW50aWZpZXIuaW5kZXggPT09IDA7XG4gICAgY29uc3Qgb25Tb3VyY2VTcGFuID0gaXNGaXJzdFRyaWdnZXIgPyB0aGlzLm9uU291cmNlU3BhbiA6IG51bGw7XG4gICAgY29uc3QgcHJlZmV0Y2hTb3VyY2VTcGFuID0gaXNGaXJzdFRyaWdnZXIgPyB0aGlzLnByZWZldGNoU3BhbiA6IG51bGw7XG4gICAgY29uc3Qgc291cmNlU3BhbiA9IG5ldyBQYXJzZVNvdXJjZVNwYW4oXG4gICAgICBpc0ZpcnN0VHJpZ2dlciA/IHRoaXMuc3Bhbi5zdGFydCA6IHRyaWdnZXJOYW1lU3RhcnRTcGFuLFxuICAgICAgZW5kU3BhbixcbiAgICApO1xuXG4gICAgdHJ5IHtcbiAgICAgIHN3aXRjaCAoaWRlbnRpZmllci50b1N0cmluZygpKSB7XG4gICAgICAgIGNhc2UgT25UcmlnZ2VyVHlwZS5JRExFOlxuICAgICAgICAgIHRoaXMudHJhY2tUcmlnZ2VyKFxuICAgICAgICAgICAgJ2lkbGUnLFxuICAgICAgICAgICAgY3JlYXRlSWRsZVRyaWdnZXIocGFyYW1ldGVycywgbmFtZVNwYW4sIHNvdXJjZVNwYW4sIHByZWZldGNoU291cmNlU3Bhbiwgb25Tb3VyY2VTcGFuKSxcbiAgICAgICAgICApO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgT25UcmlnZ2VyVHlwZS5USU1FUjpcbiAgICAgICAgICB0aGlzLnRyYWNrVHJpZ2dlcihcbiAgICAgICAgICAgICd0aW1lcicsXG4gICAgICAgICAgICBjcmVhdGVUaW1lclRyaWdnZXIoXG4gICAgICAgICAgICAgIHBhcmFtZXRlcnMsXG4gICAgICAgICAgICAgIG5hbWVTcGFuLFxuICAgICAgICAgICAgICBzb3VyY2VTcGFuLFxuICAgICAgICAgICAgICB0aGlzLnByZWZldGNoU3BhbixcbiAgICAgICAgICAgICAgdGhpcy5vblNvdXJjZVNwYW4sXG4gICAgICAgICAgICApLFxuICAgICAgICAgICk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSBPblRyaWdnZXJUeXBlLklOVEVSQUNUSU9OOlxuICAgICAgICAgIHRoaXMudHJhY2tUcmlnZ2VyKFxuICAgICAgICAgICAgJ2ludGVyYWN0aW9uJyxcbiAgICAgICAgICAgIGNyZWF0ZUludGVyYWN0aW9uVHJpZ2dlcihcbiAgICAgICAgICAgICAgcGFyYW1ldGVycyxcbiAgICAgICAgICAgICAgbmFtZVNwYW4sXG4gICAgICAgICAgICAgIHNvdXJjZVNwYW4sXG4gICAgICAgICAgICAgIHRoaXMucHJlZmV0Y2hTcGFuLFxuICAgICAgICAgICAgICB0aGlzLm9uU291cmNlU3BhbixcbiAgICAgICAgICAgICAgdGhpcy5wbGFjZWhvbGRlcixcbiAgICAgICAgICAgICksXG4gICAgICAgICAgKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIE9uVHJpZ2dlclR5cGUuSU1NRURJQVRFOlxuICAgICAgICAgIHRoaXMudHJhY2tUcmlnZ2VyKFxuICAgICAgICAgICAgJ2ltbWVkaWF0ZScsXG4gICAgICAgICAgICBjcmVhdGVJbW1lZGlhdGVUcmlnZ2VyKFxuICAgICAgICAgICAgICBwYXJhbWV0ZXJzLFxuICAgICAgICAgICAgICBuYW1lU3BhbixcbiAgICAgICAgICAgICAgc291cmNlU3BhbixcbiAgICAgICAgICAgICAgdGhpcy5wcmVmZXRjaFNwYW4sXG4gICAgICAgICAgICAgIHRoaXMub25Tb3VyY2VTcGFuLFxuICAgICAgICAgICAgKSxcbiAgICAgICAgICApO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgT25UcmlnZ2VyVHlwZS5IT1ZFUjpcbiAgICAgICAgICB0aGlzLnRyYWNrVHJpZ2dlcihcbiAgICAgICAgICAgICdob3ZlcicsXG4gICAgICAgICAgICBjcmVhdGVIb3ZlclRyaWdnZXIoXG4gICAgICAgICAgICAgIHBhcmFtZXRlcnMsXG4gICAgICAgICAgICAgIG5hbWVTcGFuLFxuICAgICAgICAgICAgICBzb3VyY2VTcGFuLFxuICAgICAgICAgICAgICB0aGlzLnByZWZldGNoU3BhbixcbiAgICAgICAgICAgICAgdGhpcy5vblNvdXJjZVNwYW4sXG4gICAgICAgICAgICAgIHRoaXMucGxhY2Vob2xkZXIsXG4gICAgICAgICAgICApLFxuICAgICAgICAgICk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSBPblRyaWdnZXJUeXBlLlZJRVdQT1JUOlxuICAgICAgICAgIHRoaXMudHJhY2tUcmlnZ2VyKFxuICAgICAgICAgICAgJ3ZpZXdwb3J0JyxcbiAgICAgICAgICAgIGNyZWF0ZVZpZXdwb3J0VHJpZ2dlcihcbiAgICAgICAgICAgICAgcGFyYW1ldGVycyxcbiAgICAgICAgICAgICAgbmFtZVNwYW4sXG4gICAgICAgICAgICAgIHNvdXJjZVNwYW4sXG4gICAgICAgICAgICAgIHRoaXMucHJlZmV0Y2hTcGFuLFxuICAgICAgICAgICAgICB0aGlzLm9uU291cmNlU3BhbixcbiAgICAgICAgICAgICAgdGhpcy5wbGFjZWhvbGRlcixcbiAgICAgICAgICAgICksXG4gICAgICAgICAgKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5yZWNvZ25pemVkIHRyaWdnZXIgdHlwZSBcIiR7aWRlbnRpZmllcn1cImApO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRoaXMuZXJyb3IoaWRlbnRpZmllciwgKGUgYXMgRXJyb3IpLm1lc3NhZ2UpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgY29uc3VtZVBhcmFtZXRlcnMoKTogc3RyaW5nW10ge1xuICAgIGNvbnN0IHBhcmFtZXRlcnM6IHN0cmluZ1tdID0gW107XG5cbiAgICBpZiAoIXRoaXMudG9rZW4oKS5pc0NoYXJhY3RlcihjaGFycy4kTFBBUkVOKSkge1xuICAgICAgdGhpcy51bmV4cGVjdGVkVG9rZW4odGhpcy50b2tlbigpKTtcbiAgICAgIHJldHVybiBwYXJhbWV0ZXJzO1xuICAgIH1cblxuICAgIHRoaXMuYWR2YW5jZSgpO1xuXG4gICAgY29uc3QgY29tbWFEZWxpbVN0YWNrOiBudW1iZXJbXSA9IFtdO1xuICAgIGxldCBjdXJyZW50ID0gJyc7XG5cbiAgICB3aGlsZSAodGhpcy5pbmRleCA8IHRoaXMudG9rZW5zLmxlbmd0aCkge1xuICAgICAgY29uc3QgdG9rZW4gPSB0aGlzLnRva2VuKCk7XG5cbiAgICAgIC8vIFN0b3AgcGFyc2luZyBpZiB3ZSd2ZSBoaXQgdGhlIGVuZCBjaGFyYWN0ZXIgYW5kIHdlJ3JlIG91dHNpZGUgb2YgYSBjb21tYS1kZWxpbWl0ZWQgc3ludGF4LlxuICAgICAgLy8gTm90ZSB0aGF0IHdlIGRvbid0IG5lZWQgdG8gYWNjb3VudCBmb3Igc3RyaW5ncyBoZXJlIHNpbmNlIHRoZSBsZXhlciBhbHJlYWR5IHBhcnNlZCB0aGVtXG4gICAgICAvLyBpbnRvIHN0cmluZyB0b2tlbnMuXG4gICAgICBpZiAodG9rZW4uaXNDaGFyYWN0ZXIoY2hhcnMuJFJQQVJFTikgJiYgY29tbWFEZWxpbVN0YWNrLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBpZiAoY3VycmVudC5sZW5ndGgpIHtcbiAgICAgICAgICBwYXJhbWV0ZXJzLnB1c2goY3VycmVudCk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIC8vIEluIHRoZSBgb25gIG1pY3Jvc3ludGF4IFwidG9wLWxldmVsXCIgY29tbWFzIChlLmcuIG9uZXMgb3V0c2lkZSBvZiBhbiBwYXJhbWV0ZXJzKSBzZXBhcmF0ZVxuICAgICAgLy8gdGhlIGRpZmZlcmVudCB0cmlnZ2VycyAoZS5nLiBgb24gaWRsZSx0aW1lcig1MDApYCkuIFRoaXMgaXMgcHJvYmxlbWF0aWMsIGJlY2F1c2UgdGhlXG4gICAgICAvLyBmdW5jdGlvbi1saWtlIHN5bnRheCBhbHNvIGltcGxpZXMgdGhhdCBtdWx0aXBsZSBwYXJhbWV0ZXJzIGNhbiBiZSBwYXNzZWQgaW50byB0aGVcbiAgICAgIC8vIGluZGl2aWR1YWwgdHJpZ2dlciAoZS5nLiBgb24gZm9vKGEsIGIpYCkuIFRvIGF2b2lkIHRyaXBwaW5nIHVwIHRoZSBwYXJzZXIgd2l0aCBjb21tYXMgdGhhdFxuICAgICAgLy8gYXJlIHBhcnQgb2Ygb3RoZXIgc29ydHMgb2Ygc3ludGF4IChvYmplY3QgbGl0ZXJhbHMsIGFycmF5cyksIHdlIHRyZWF0IGFueXRoaW5nIGluc2lkZVxuICAgICAgLy8gYSBjb21tYS1kZWxpbWl0ZWQgc3ludGF4IGJsb2NrIGFzIHBsYWluIHRleHQuXG4gICAgICBpZiAodG9rZW4udHlwZSA9PT0gVG9rZW5UeXBlLkNoYXJhY3RlciAmJiBDT01NQV9ERUxJTUlURURfU1lOVEFYLmhhcyh0b2tlbi5udW1WYWx1ZSkpIHtcbiAgICAgICAgY29tbWFEZWxpbVN0YWNrLnB1c2goQ09NTUFfREVMSU1JVEVEX1NZTlRBWC5nZXQodG9rZW4ubnVtVmFsdWUpISk7XG4gICAgICB9XG5cbiAgICAgIGlmIChcbiAgICAgICAgY29tbWFEZWxpbVN0YWNrLmxlbmd0aCA+IDAgJiZcbiAgICAgICAgdG9rZW4uaXNDaGFyYWN0ZXIoY29tbWFEZWxpbVN0YWNrW2NvbW1hRGVsaW1TdGFjay5sZW5ndGggLSAxXSlcbiAgICAgICkge1xuICAgICAgICBjb21tYURlbGltU3RhY2sucG9wKCk7XG4gICAgICB9XG5cbiAgICAgIC8vIElmIHdlIGhpdCBhIGNvbW1hIG91dHNpZGUgb2YgYSBjb21tYS1kZWxpbWl0ZWQgc3ludGF4LCBpdCBtZWFuc1xuICAgICAgLy8gdGhhdCB3ZSdyZSBhdCB0aGUgdG9wIGxldmVsIGFuZCB3ZSdyZSBzdGFydGluZyBhIG5ldyBwYXJhbWV0ZXIuXG4gICAgICBpZiAoY29tbWFEZWxpbVN0YWNrLmxlbmd0aCA9PT0gMCAmJiB0b2tlbi5pc0NoYXJhY3RlcihjaGFycy4kQ09NTUEpICYmIGN1cnJlbnQubGVuZ3RoID4gMCkge1xuICAgICAgICBwYXJhbWV0ZXJzLnB1c2goY3VycmVudCk7XG4gICAgICAgIGN1cnJlbnQgPSAnJztcbiAgICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBPdGhlcndpc2UgdHJlYXQgdGhlIHRva2VuIGFzIGEgcGxhaW4gdGV4dCBjaGFyYWN0ZXIgaW4gdGhlIGN1cnJlbnQgcGFyYW1ldGVyLlxuICAgICAgY3VycmVudCArPSB0aGlzLnRva2VuVGV4dCgpO1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLnRva2VuKCkuaXNDaGFyYWN0ZXIoY2hhcnMuJFJQQVJFTikgfHwgY29tbWFEZWxpbVN0YWNrLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuZXJyb3IodGhpcy50b2tlbigpLCAnVW5leHBlY3RlZCBlbmQgb2YgZXhwcmVzc2lvbicpO1xuICAgIH1cblxuICAgIGlmIChcbiAgICAgIHRoaXMuaW5kZXggPCB0aGlzLnRva2Vucy5sZW5ndGggLSAxICYmXG4gICAgICAhdGhpcy50b2tlbnNbdGhpcy5pbmRleCArIDFdLmlzQ2hhcmFjdGVyKGNoYXJzLiRDT01NQSlcbiAgICApIHtcbiAgICAgIHRoaXMudW5leHBlY3RlZFRva2VuKHRoaXMudG9rZW5zW3RoaXMuaW5kZXggKyAxXSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHBhcmFtZXRlcnM7XG4gIH1cblxuICBwcml2YXRlIHRva2VuVGV4dCgpOiBzdHJpbmcge1xuICAgIC8vIFRva2VucyBoYXZlIGEgdG9TdHJpbmcgYWxyZWFkeSB3aGljaCB3ZSBjb3VsZCB1c2UsIGJ1dCBmb3Igc3RyaW5nIHRva2VucyBpdCBvbWl0cyB0aGUgcXVvdGVzLlxuICAgIC8vIEV2ZW50dWFsbHkgd2UgY291bGQgZXhwb3NlIHRoaXMgaW5mb3JtYXRpb24gb24gdGhlIHRva2VuIGRpcmVjdGx5LlxuICAgIHJldHVybiB0aGlzLmV4cHJlc3Npb24uc2xpY2UodGhpcy5zdGFydCArIHRoaXMudG9rZW4oKS5pbmRleCwgdGhpcy5zdGFydCArIHRoaXMudG9rZW4oKS5lbmQpO1xuICB9XG5cbiAgcHJpdmF0ZSB0cmFja1RyaWdnZXIobmFtZToga2V5b2YgdC5EZWZlcnJlZEJsb2NrVHJpZ2dlcnMsIHRyaWdnZXI6IHQuRGVmZXJyZWRUcmlnZ2VyKTogdm9pZCB7XG4gICAgdHJhY2tUcmlnZ2VyKG5hbWUsIHRoaXMudHJpZ2dlcnMsIHRoaXMuZXJyb3JzLCB0cmlnZ2VyKTtcbiAgfVxuXG4gIHByaXZhdGUgZXJyb3IodG9rZW46IFRva2VuLCBtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBuZXdTdGFydCA9IHRoaXMuc3Bhbi5zdGFydC5tb3ZlQnkodGhpcy5zdGFydCArIHRva2VuLmluZGV4KTtcbiAgICBjb25zdCBuZXdFbmQgPSBuZXdTdGFydC5tb3ZlQnkodG9rZW4uZW5kIC0gdG9rZW4uaW5kZXgpO1xuICAgIHRoaXMuZXJyb3JzLnB1c2gobmV3IFBhcnNlRXJyb3IobmV3IFBhcnNlU291cmNlU3BhbihuZXdTdGFydCwgbmV3RW5kKSwgbWVzc2FnZSkpO1xuICB9XG5cbiAgcHJpdmF0ZSB1bmV4cGVjdGVkVG9rZW4odG9rZW46IFRva2VuKSB7XG4gICAgdGhpcy5lcnJvcih0b2tlbiwgYFVuZXhwZWN0ZWQgdG9rZW4gXCIke3Rva2VufVwiYCk7XG4gIH1cbn1cblxuLyoqIEFkZHMgYSB0cmlnZ2VyIHRvIGEgbWFwIG9mIHRyaWdnZXJzLiAqL1xuZnVuY3Rpb24gdHJhY2tUcmlnZ2VyKFxuICBuYW1lOiBrZXlvZiB0LkRlZmVycmVkQmxvY2tUcmlnZ2VycyxcbiAgYWxsVHJpZ2dlcnM6IHQuRGVmZXJyZWRCbG9ja1RyaWdnZXJzLFxuICBlcnJvcnM6IFBhcnNlRXJyb3JbXSxcbiAgdHJpZ2dlcjogdC5EZWZlcnJlZFRyaWdnZXIsXG4pIHtcbiAgaWYgKGFsbFRyaWdnZXJzW25hbWVdKSB7XG4gICAgZXJyb3JzLnB1c2gobmV3IFBhcnNlRXJyb3IodHJpZ2dlci5zb3VyY2VTcGFuLCBgRHVwbGljYXRlIFwiJHtuYW1lfVwiIHRyaWdnZXIgaXMgbm90IGFsbG93ZWRgKSk7XG4gIH0gZWxzZSB7XG4gICAgYWxsVHJpZ2dlcnNbbmFtZV0gPSB0cmlnZ2VyIGFzIGFueTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVJZGxlVHJpZ2dlcihcbiAgcGFyYW1ldGVyczogc3RyaW5nW10sXG4gIG5hbWVTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgcHJlZmV0Y2hTcGFuOiBQYXJzZVNvdXJjZVNwYW4gfCBudWxsLFxuICBvblNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbiB8IG51bGwsXG4pOiB0LklkbGVEZWZlcnJlZFRyaWdnZXIge1xuICBpZiAocGFyYW1ldGVycy5sZW5ndGggPiAwKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBcIiR7T25UcmlnZ2VyVHlwZS5JRExFfVwiIHRyaWdnZXIgY2Fubm90IGhhdmUgcGFyYW1ldGVyc2ApO1xuICB9XG5cbiAgcmV0dXJuIG5ldyB0LklkbGVEZWZlcnJlZFRyaWdnZXIobmFtZVNwYW4sIHNvdXJjZVNwYW4sIHByZWZldGNoU3Bhbiwgb25Tb3VyY2VTcGFuKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlVGltZXJUcmlnZ2VyKFxuICBwYXJhbWV0ZXJzOiBzdHJpbmdbXSxcbiAgbmFtZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICBwcmVmZXRjaFNwYW46IFBhcnNlU291cmNlU3BhbiB8IG51bGwsXG4gIG9uU291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuIHwgbnVsbCxcbikge1xuICBpZiAocGFyYW1ldGVycy5sZW5ndGggIT09IDEpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFwiJHtPblRyaWdnZXJUeXBlLlRJTUVSfVwiIHRyaWdnZXIgbXVzdCBoYXZlIGV4YWN0bHkgb25lIHBhcmFtZXRlcmApO1xuICB9XG5cbiAgY29uc3QgZGVsYXkgPSBwYXJzZURlZmVycmVkVGltZShwYXJhbWV0ZXJzWzBdKTtcblxuICBpZiAoZGVsYXkgPT09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYENvdWxkIG5vdCBwYXJzZSB0aW1lIHZhbHVlIG9mIHRyaWdnZXIgXCIke09uVHJpZ2dlclR5cGUuVElNRVJ9XCJgKTtcbiAgfVxuXG4gIHJldHVybiBuZXcgdC5UaW1lckRlZmVycmVkVHJpZ2dlcihkZWxheSwgbmFtZVNwYW4sIHNvdXJjZVNwYW4sIHByZWZldGNoU3Bhbiwgb25Tb3VyY2VTcGFuKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlSW1tZWRpYXRlVHJpZ2dlcihcbiAgcGFyYW1ldGVyczogc3RyaW5nW10sXG4gIG5hbWVTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgcHJlZmV0Y2hTcGFuOiBQYXJzZVNvdXJjZVNwYW4gfCBudWxsLFxuICBvblNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbiB8IG51bGwsXG4pOiB0LkltbWVkaWF0ZURlZmVycmVkVHJpZ2dlciB7XG4gIGlmIChwYXJhbWV0ZXJzLmxlbmd0aCA+IDApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFwiJHtPblRyaWdnZXJUeXBlLklNTUVESUFURX1cIiB0cmlnZ2VyIGNhbm5vdCBoYXZlIHBhcmFtZXRlcnNgKTtcbiAgfVxuXG4gIHJldHVybiBuZXcgdC5JbW1lZGlhdGVEZWZlcnJlZFRyaWdnZXIobmFtZVNwYW4sIHNvdXJjZVNwYW4sIHByZWZldGNoU3Bhbiwgb25Tb3VyY2VTcGFuKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlSG92ZXJUcmlnZ2VyKFxuICBwYXJhbWV0ZXJzOiBzdHJpbmdbXSxcbiAgbmFtZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICBwcmVmZXRjaFNwYW46IFBhcnNlU291cmNlU3BhbiB8IG51bGwsXG4gIG9uU291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuIHwgbnVsbCxcbiAgcGxhY2Vob2xkZXI6IHQuRGVmZXJyZWRCbG9ja1BsYWNlaG9sZGVyIHwgbnVsbCxcbik6IHQuSG92ZXJEZWZlcnJlZFRyaWdnZXIge1xuICB2YWxpZGF0ZVJlZmVyZW5jZUJhc2VkVHJpZ2dlcihPblRyaWdnZXJUeXBlLkhPVkVSLCBwYXJhbWV0ZXJzLCBwbGFjZWhvbGRlcik7XG4gIHJldHVybiBuZXcgdC5Ib3ZlckRlZmVycmVkVHJpZ2dlcihcbiAgICBwYXJhbWV0ZXJzWzBdID8/IG51bGwsXG4gICAgbmFtZVNwYW4sXG4gICAgc291cmNlU3BhbixcbiAgICBwcmVmZXRjaFNwYW4sXG4gICAgb25Tb3VyY2VTcGFuLFxuICApO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVJbnRlcmFjdGlvblRyaWdnZXIoXG4gIHBhcmFtZXRlcnM6IHN0cmluZ1tdLFxuICBuYW1lU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gIHByZWZldGNoU3BhbjogUGFyc2VTb3VyY2VTcGFuIHwgbnVsbCxcbiAgb25Tb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4gfCBudWxsLFxuICBwbGFjZWhvbGRlcjogdC5EZWZlcnJlZEJsb2NrUGxhY2Vob2xkZXIgfCBudWxsLFxuKTogdC5JbnRlcmFjdGlvbkRlZmVycmVkVHJpZ2dlciB7XG4gIHZhbGlkYXRlUmVmZXJlbmNlQmFzZWRUcmlnZ2VyKE9uVHJpZ2dlclR5cGUuSU5URVJBQ1RJT04sIHBhcmFtZXRlcnMsIHBsYWNlaG9sZGVyKTtcbiAgcmV0dXJuIG5ldyB0LkludGVyYWN0aW9uRGVmZXJyZWRUcmlnZ2VyKFxuICAgIHBhcmFtZXRlcnNbMF0gPz8gbnVsbCxcbiAgICBuYW1lU3BhbixcbiAgICBzb3VyY2VTcGFuLFxuICAgIHByZWZldGNoU3BhbixcbiAgICBvblNvdXJjZVNwYW4sXG4gICk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVZpZXdwb3J0VHJpZ2dlcihcbiAgcGFyYW1ldGVyczogc3RyaW5nW10sXG4gIG5hbWVTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgcHJlZmV0Y2hTcGFuOiBQYXJzZVNvdXJjZVNwYW4gfCBudWxsLFxuICBvblNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbiB8IG51bGwsXG4gIHBsYWNlaG9sZGVyOiB0LkRlZmVycmVkQmxvY2tQbGFjZWhvbGRlciB8IG51bGwsXG4pOiB0LlZpZXdwb3J0RGVmZXJyZWRUcmlnZ2VyIHtcbiAgdmFsaWRhdGVSZWZlcmVuY2VCYXNlZFRyaWdnZXIoT25UcmlnZ2VyVHlwZS5WSUVXUE9SVCwgcGFyYW1ldGVycywgcGxhY2Vob2xkZXIpO1xuICByZXR1cm4gbmV3IHQuVmlld3BvcnREZWZlcnJlZFRyaWdnZXIoXG4gICAgcGFyYW1ldGVyc1swXSA/PyBudWxsLFxuICAgIG5hbWVTcGFuLFxuICAgIHNvdXJjZVNwYW4sXG4gICAgcHJlZmV0Y2hTcGFuLFxuICAgIG9uU291cmNlU3BhbixcbiAgKTtcbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVSZWZlcmVuY2VCYXNlZFRyaWdnZXIoXG4gIHR5cGU6IE9uVHJpZ2dlclR5cGUsXG4gIHBhcmFtZXRlcnM6IHN0cmluZ1tdLFxuICBwbGFjZWhvbGRlcjogdC5EZWZlcnJlZEJsb2NrUGxhY2Vob2xkZXIgfCBudWxsLFxuKSB7XG4gIGlmIChwYXJhbWV0ZXJzLmxlbmd0aCA+IDEpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFwiJHt0eXBlfVwiIHRyaWdnZXIgY2FuIG9ubHkgaGF2ZSB6ZXJvIG9yIG9uZSBwYXJhbWV0ZXJzYCk7XG4gIH1cblxuICBpZiAocGFyYW1ldGVycy5sZW5ndGggPT09IDApIHtcbiAgICBpZiAocGxhY2Vob2xkZXIgPT09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYFwiJHt0eXBlfVwiIHRyaWdnZXIgd2l0aCBubyBwYXJhbWV0ZXJzIGNhbiBvbmx5IGJlIHBsYWNlZCBvbiBhbiBAZGVmZXIgdGhhdCBoYXMgYSBAcGxhY2Vob2xkZXIgYmxvY2tgLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAocGxhY2Vob2xkZXIuY2hpbGRyZW4ubGVuZ3RoICE9PSAxIHx8ICEocGxhY2Vob2xkZXIuY2hpbGRyZW5bMF0gaW5zdGFuY2VvZiB0LkVsZW1lbnQpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBcIiR7dHlwZX1cIiB0cmlnZ2VyIHdpdGggbm8gcGFyYW1ldGVycyBjYW4gb25seSBiZSBwbGFjZWQgb24gYW4gQGRlZmVyIHRoYXQgaGFzIGEgYCArXG4gICAgICAgICAgYEBwbGFjZWhvbGRlciBibG9jayB3aXRoIGV4YWN0bHkgb25lIHJvb3QgZWxlbWVudCBub2RlYCxcbiAgICAgICk7XG4gICAgfVxuICB9XG59XG5cbi8qKiBHZXRzIHRoZSBpbmRleCB3aXRoaW4gYW4gZXhwcmVzc2lvbiBhdCB3aGljaCB0aGUgdHJpZ2dlciBwYXJhbWV0ZXJzIHN0YXJ0LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFRyaWdnZXJQYXJhbWV0ZXJzU3RhcnQodmFsdWU6IHN0cmluZywgc3RhcnRQb3NpdGlvbiA9IDApOiBudW1iZXIge1xuICBsZXQgaGFzRm91bmRTZXBhcmF0b3IgPSBmYWxzZTtcblxuICBmb3IgKGxldCBpID0gc3RhcnRQb3NpdGlvbjsgaSA8IHZhbHVlLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKFNFUEFSQVRPUl9QQVRURVJOLnRlc3QodmFsdWVbaV0pKSB7XG4gICAgICBoYXNGb3VuZFNlcGFyYXRvciA9IHRydWU7XG4gICAgfSBlbHNlIGlmIChoYXNGb3VuZFNlcGFyYXRvcikge1xuICAgICAgcmV0dXJuIGk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIC0xO1xufVxuXG4vKipcbiAqIFBhcnNlcyBhIHRpbWUgZXhwcmVzc2lvbiBmcm9tIGEgZGVmZXJyZWQgdHJpZ2dlciB0b1xuICogbWlsbGlzZWNvbmRzLiBSZXR1cm5zIG51bGwgaWYgaXQgY2Fubm90IGJlIHBhcnNlZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlRGVmZXJyZWRUaW1lKHZhbHVlOiBzdHJpbmcpOiBudW1iZXIgfCBudWxsIHtcbiAgY29uc3QgbWF0Y2ggPSB2YWx1ZS5tYXRjaChUSU1FX1BBVFRFUk4pO1xuXG4gIGlmICghbWF0Y2gpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNvbnN0IFt0aW1lLCB1bml0c10gPSBtYXRjaDtcbiAgcmV0dXJuIHBhcnNlRmxvYXQodGltZSkgKiAodW5pdHMgPT09ICdzJyA/IDEwMDAgOiAxKTtcbn1cbiJdfQ==