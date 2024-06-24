/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicjNfZGVmZXJyZWRfdHJpZ2dlcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvcmVuZGVyMy9yM19kZWZlcnJlZF90cmlnZ2Vycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEtBQUssS0FBSyxNQUFNLFVBQVUsQ0FBQztBQUNsQyxPQUFPLEVBQUMsS0FBSyxFQUFTLFNBQVMsRUFBQyxNQUFNLDRCQUE0QixDQUFDO0FBRW5FLE9BQU8sRUFBQyxVQUFVLEVBQUUsZUFBZSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRzFELE9BQU8sS0FBSyxDQUFDLE1BQU0sVUFBVSxDQUFDO0FBRTlCLCtDQUErQztBQUMvQyxNQUFNLFlBQVksR0FBRyxvQkFBb0IsQ0FBQztBQUUxQyx3RUFBd0U7QUFDeEUsTUFBTSxpQkFBaUIsR0FBRyxNQUFNLENBQUM7QUFFakMsb0VBQW9FO0FBQ3BFLE1BQU0sc0JBQXNCLEdBQUcsSUFBSSxHQUFHLENBQUM7SUFDckMsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxrQkFBa0I7SUFDbEQsQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsRUFBRSxpQkFBaUI7SUFDckQsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxpQkFBaUI7Q0FDbEQsQ0FBQyxDQUFDO0FBRUgsdUNBQXVDO0FBQ3ZDLElBQUssYUFPSjtBQVBELFdBQUssYUFBYTtJQUNoQiw4QkFBYSxDQUFBO0lBQ2IsZ0NBQWUsQ0FBQTtJQUNmLDRDQUEyQixDQUFBO0lBQzNCLHdDQUF1QixDQUFBO0lBQ3ZCLGdDQUFlLENBQUE7SUFDZixzQ0FBcUIsQ0FBQTtBQUN2QixDQUFDLEVBUEksYUFBYSxLQUFiLGFBQWEsUUFPakI7QUFFRCx3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Q0FBQztJQUVELE9BQU8sQ0FBQyxDQUFDLENBQUM7QUFDWixDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsTUFBTSxVQUFVLGlCQUFpQixDQUFDLEtBQWE7SUFDN0MsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUV4QyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDWCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFFRCxNQUFNLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxHQUFHLEtBQUssQ0FBQztJQUM1QixPQUFPLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdkQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBjaGFycyBmcm9tICcuLi9jaGFycyc7XG5pbXBvcnQge0xleGVyLCBUb2tlbiwgVG9rZW5UeXBlfSBmcm9tICcuLi9leHByZXNzaW9uX3BhcnNlci9sZXhlcic7XG5pbXBvcnQgKiBhcyBodG1sIGZyb20gJy4uL21sX3BhcnNlci9hc3QnO1xuaW1wb3J0IHtQYXJzZUVycm9yLCBQYXJzZVNvdXJjZVNwYW59IGZyb20gJy4uL3BhcnNlX3V0aWwnO1xuaW1wb3J0IHtCaW5kaW5nUGFyc2VyfSBmcm9tICcuLi90ZW1wbGF0ZV9wYXJzZXIvYmluZGluZ19wYXJzZXInO1xuXG5pbXBvcnQgKiBhcyB0IGZyb20gJy4vcjNfYXN0JztcblxuLyoqIFBhdHRlcm4gZm9yIGEgdGltaW5nIHZhbHVlIGluIGEgdHJpZ2dlci4gKi9cbmNvbnN0IFRJTUVfUEFUVEVSTiA9IC9eXFxkK1xcLj9cXGQqKG1zfHMpPyQvO1xuXG4vKiogUGF0dGVybiBmb3IgYSBzZXBhcmF0b3IgYmV0d2VlbiBrZXl3b3JkcyBpbiBhIHRyaWdnZXIgZXhwcmVzc2lvbi4gKi9cbmNvbnN0IFNFUEFSQVRPUl9QQVRURVJOID0gL15cXHMkLztcblxuLyoqIFBhaXJzIG9mIGNoYXJhY3RlcnMgdGhhdCBmb3JtIHN5bnRheCB0aGF0IGlzIGNvbW1hLWRlbGltaXRlZC4gKi9cbmNvbnN0IENPTU1BX0RFTElNSVRFRF9TWU5UQVggPSBuZXcgTWFwKFtcbiAgW2NoYXJzLiRMQlJBQ0UsIGNoYXJzLiRSQlJBQ0VdLCAvLyBPYmplY3QgbGl0ZXJhbHNcbiAgW2NoYXJzLiRMQlJBQ0tFVCwgY2hhcnMuJFJCUkFDS0VUXSwgLy8gQXJyYXkgbGl0ZXJhbHNcbiAgW2NoYXJzLiRMUEFSRU4sIGNoYXJzLiRSUEFSRU5dLCAvLyBGdW5jdGlvbiBjYWxsc1xuXSk7XG5cbi8qKiBQb3NzaWJsZSB0eXBlcyBvZiBgb25gIHRyaWdnZXJzLiAqL1xuZW51bSBPblRyaWdnZXJUeXBlIHtcbiAgSURMRSA9ICdpZGxlJyxcbiAgVElNRVIgPSAndGltZXInLFxuICBJTlRFUkFDVElPTiA9ICdpbnRlcmFjdGlvbicsXG4gIElNTUVESUFURSA9ICdpbW1lZGlhdGUnLFxuICBIT1ZFUiA9ICdob3ZlcicsXG4gIFZJRVdQT1JUID0gJ3ZpZXdwb3J0Jyxcbn1cblxuLyoqIFBhcnNlcyBhIGB3aGVuYCBkZWZlcnJlZCB0cmlnZ2VyLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlV2hlblRyaWdnZXIoXG4gIHtleHByZXNzaW9uLCBzb3VyY2VTcGFufTogaHRtbC5CbG9ja1BhcmFtZXRlcixcbiAgYmluZGluZ1BhcnNlcjogQmluZGluZ1BhcnNlcixcbiAgdHJpZ2dlcnM6IHQuRGVmZXJyZWRCbG9ja1RyaWdnZXJzLFxuICBlcnJvcnM6IFBhcnNlRXJyb3JbXSxcbik6IHZvaWQge1xuICBjb25zdCB3aGVuSW5kZXggPSBleHByZXNzaW9uLmluZGV4T2YoJ3doZW4nKTtcbiAgY29uc3Qgd2hlblNvdXJjZVNwYW4gPSBuZXcgUGFyc2VTb3VyY2VTcGFuKFxuICAgIHNvdXJjZVNwYW4uc3RhcnQubW92ZUJ5KHdoZW5JbmRleCksXG4gICAgc291cmNlU3Bhbi5zdGFydC5tb3ZlQnkod2hlbkluZGV4ICsgJ3doZW4nLmxlbmd0aCksXG4gICk7XG4gIGNvbnN0IHByZWZldGNoU3BhbiA9IGdldFByZWZldGNoU3BhbihleHByZXNzaW9uLCBzb3VyY2VTcGFuKTtcblxuICAvLyBUaGlzIGlzIGhlcmUganVzdCB0byBiZSBzYWZlLCB3ZSBzaG91bGRuJ3QgZW50ZXIgdGhpcyBmdW5jdGlvblxuICAvLyBpbiB0aGUgZmlyc3QgcGxhY2UgaWYgYSBibG9jayBkb2Vzbid0IGhhdmUgdGhlIFwid2hlblwiIGtleXdvcmQuXG4gIGlmICh3aGVuSW5kZXggPT09IC0xKSB7XG4gICAgZXJyb3JzLnB1c2gobmV3IFBhcnNlRXJyb3Ioc291cmNlU3BhbiwgYENvdWxkIG5vdCBmaW5kIFwid2hlblwiIGtleXdvcmQgaW4gZXhwcmVzc2lvbmApKTtcbiAgfSBlbHNlIHtcbiAgICBjb25zdCBzdGFydCA9IGdldFRyaWdnZXJQYXJhbWV0ZXJzU3RhcnQoZXhwcmVzc2lvbiwgd2hlbkluZGV4ICsgMSk7XG4gICAgY29uc3QgcGFyc2VkID0gYmluZGluZ1BhcnNlci5wYXJzZUJpbmRpbmcoXG4gICAgICBleHByZXNzaW9uLnNsaWNlKHN0YXJ0KSxcbiAgICAgIGZhbHNlLFxuICAgICAgc291cmNlU3BhbixcbiAgICAgIHNvdXJjZVNwYW4uc3RhcnQub2Zmc2V0ICsgc3RhcnQsXG4gICAgKTtcbiAgICB0cmFja1RyaWdnZXIoXG4gICAgICAnd2hlbicsXG4gICAgICB0cmlnZ2VycyxcbiAgICAgIGVycm9ycyxcbiAgICAgIG5ldyB0LkJvdW5kRGVmZXJyZWRUcmlnZ2VyKHBhcnNlZCwgc291cmNlU3BhbiwgcHJlZmV0Y2hTcGFuLCB3aGVuU291cmNlU3BhbiksXG4gICAgKTtcbiAgfVxufVxuXG4vKiogUGFyc2VzIGFuIGBvbmAgdHJpZ2dlciAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlT25UcmlnZ2VyKFxuICB7ZXhwcmVzc2lvbiwgc291cmNlU3Bhbn06IGh0bWwuQmxvY2tQYXJhbWV0ZXIsXG4gIHRyaWdnZXJzOiB0LkRlZmVycmVkQmxvY2tUcmlnZ2VycyxcbiAgZXJyb3JzOiBQYXJzZUVycm9yW10sXG4gIHBsYWNlaG9sZGVyOiB0LkRlZmVycmVkQmxvY2tQbGFjZWhvbGRlciB8IG51bGwsXG4pOiB2b2lkIHtcbiAgY29uc3Qgb25JbmRleCA9IGV4cHJlc3Npb24uaW5kZXhPZignb24nKTtcbiAgY29uc3Qgb25Tb3VyY2VTcGFuID0gbmV3IFBhcnNlU291cmNlU3BhbihcbiAgICBzb3VyY2VTcGFuLnN0YXJ0Lm1vdmVCeShvbkluZGV4KSxcbiAgICBzb3VyY2VTcGFuLnN0YXJ0Lm1vdmVCeShvbkluZGV4ICsgJ29uJy5sZW5ndGgpLFxuICApO1xuICBjb25zdCBwcmVmZXRjaFNwYW4gPSBnZXRQcmVmZXRjaFNwYW4oZXhwcmVzc2lvbiwgc291cmNlU3Bhbik7XG5cbiAgLy8gVGhpcyBpcyBoZXJlIGp1c3QgdG8gYmUgc2FmZSwgd2Ugc2hvdWxkbid0IGVudGVyIHRoaXMgZnVuY3Rpb25cbiAgLy8gaW4gdGhlIGZpcnN0IHBsYWNlIGlmIGEgYmxvY2sgZG9lc24ndCBoYXZlIHRoZSBcIm9uXCIga2V5d29yZC5cbiAgaWYgKG9uSW5kZXggPT09IC0xKSB7XG4gICAgZXJyb3JzLnB1c2gobmV3IFBhcnNlRXJyb3Ioc291cmNlU3BhbiwgYENvdWxkIG5vdCBmaW5kIFwib25cIiBrZXl3b3JkIGluIGV4cHJlc3Npb25gKSk7XG4gIH0gZWxzZSB7XG4gICAgY29uc3Qgc3RhcnQgPSBnZXRUcmlnZ2VyUGFyYW1ldGVyc1N0YXJ0KGV4cHJlc3Npb24sIG9uSW5kZXggKyAxKTtcbiAgICBjb25zdCBwYXJzZXIgPSBuZXcgT25UcmlnZ2VyUGFyc2VyKFxuICAgICAgZXhwcmVzc2lvbixcbiAgICAgIHN0YXJ0LFxuICAgICAgc291cmNlU3BhbixcbiAgICAgIHRyaWdnZXJzLFxuICAgICAgZXJyb3JzLFxuICAgICAgcGxhY2Vob2xkZXIsXG4gICAgICBwcmVmZXRjaFNwYW4sXG4gICAgICBvblNvdXJjZVNwYW4sXG4gICAgKTtcbiAgICBwYXJzZXIucGFyc2UoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRQcmVmZXRjaFNwYW4oZXhwcmVzc2lvbjogc3RyaW5nLCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pIHtcbiAgaWYgKCFleHByZXNzaW9uLnN0YXJ0c1dpdGgoJ3ByZWZldGNoJykpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICByZXR1cm4gbmV3IFBhcnNlU291cmNlU3Bhbihzb3VyY2VTcGFuLnN0YXJ0LCBzb3VyY2VTcGFuLnN0YXJ0Lm1vdmVCeSgncHJlZmV0Y2gnLmxlbmd0aCkpO1xufVxuXG5jbGFzcyBPblRyaWdnZXJQYXJzZXIge1xuICBwcml2YXRlIGluZGV4ID0gMDtcbiAgcHJpdmF0ZSB0b2tlbnM6IFRva2VuW107XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBleHByZXNzaW9uOiBzdHJpbmcsXG4gICAgcHJpdmF0ZSBzdGFydDogbnVtYmVyLFxuICAgIHByaXZhdGUgc3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgIHByaXZhdGUgdHJpZ2dlcnM6IHQuRGVmZXJyZWRCbG9ja1RyaWdnZXJzLFxuICAgIHByaXZhdGUgZXJyb3JzOiBQYXJzZUVycm9yW10sXG4gICAgcHJpdmF0ZSBwbGFjZWhvbGRlcjogdC5EZWZlcnJlZEJsb2NrUGxhY2Vob2xkZXIgfCBudWxsLFxuICAgIHByaXZhdGUgcHJlZmV0Y2hTcGFuOiBQYXJzZVNvdXJjZVNwYW4gfCBudWxsLFxuICAgIHByaXZhdGUgb25Tb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICkge1xuICAgIHRoaXMudG9rZW5zID0gbmV3IExleGVyKCkudG9rZW5pemUoZXhwcmVzc2lvbi5zbGljZShzdGFydCkpO1xuICB9XG5cbiAgcGFyc2UoKTogdm9pZCB7XG4gICAgd2hpbGUgKHRoaXMudG9rZW5zLmxlbmd0aCA+IDAgJiYgdGhpcy5pbmRleCA8IHRoaXMudG9rZW5zLmxlbmd0aCkge1xuICAgICAgY29uc3QgdG9rZW4gPSB0aGlzLnRva2VuKCk7XG5cbiAgICAgIGlmICghdG9rZW4uaXNJZGVudGlmaWVyKCkpIHtcbiAgICAgICAgdGhpcy51bmV4cGVjdGVkVG9rZW4odG9rZW4pO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgLy8gQW4gaWRlbnRpZmllciBpbW1lZGlhdGVseSBmb2xsb3dlZCBieSBhIGNvbW1hIG9yIHRoZSBlbmQgb2ZcbiAgICAgIC8vIHRoZSBleHByZXNzaW9uIGNhbm5vdCBoYXZlIHBhcmFtZXRlcnMgc28gd2UgY2FuIGV4aXQgZWFybHkuXG4gICAgICBpZiAodGhpcy5pc0ZvbGxvd2VkQnlPckxhc3QoY2hhcnMuJENPTU1BKSkge1xuICAgICAgICB0aGlzLmNvbnN1bWVUcmlnZ2VyKHRva2VuLCBbXSk7XG4gICAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLmlzRm9sbG93ZWRCeU9yTGFzdChjaGFycy4kTFBBUkVOKSkge1xuICAgICAgICB0aGlzLmFkdmFuY2UoKTsgLy8gQWR2YW5jZSB0byB0aGUgb3BlbmluZyBwYXJlbi5cbiAgICAgICAgY29uc3QgcHJldkVycm9ycyA9IHRoaXMuZXJyb3JzLmxlbmd0aDtcbiAgICAgICAgY29uc3QgcGFyYW1ldGVycyA9IHRoaXMuY29uc3VtZVBhcmFtZXRlcnMoKTtcbiAgICAgICAgaWYgKHRoaXMuZXJyb3JzLmxlbmd0aCAhPT0gcHJldkVycm9ycykge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY29uc3VtZVRyaWdnZXIodG9rZW4sIHBhcmFtZXRlcnMpO1xuICAgICAgICB0aGlzLmFkdmFuY2UoKTsgLy8gQWR2YW5jZSBwYXN0IHRoZSBjbG9zaW5nIHBhcmVuLlxuICAgICAgfSBlbHNlIGlmICh0aGlzLmluZGV4IDwgdGhpcy50b2tlbnMubGVuZ3RoIC0gMSkge1xuICAgICAgICB0aGlzLnVuZXhwZWN0ZWRUb2tlbih0aGlzLnRva2Vuc1t0aGlzLmluZGV4ICsgMV0pO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFkdmFuY2UoKSB7XG4gICAgdGhpcy5pbmRleCsrO1xuICB9XG5cbiAgcHJpdmF0ZSBpc0ZvbGxvd2VkQnlPckxhc3QoY2hhcjogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMuaW5kZXggPT09IHRoaXMudG9rZW5zLmxlbmd0aCAtIDEpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnRva2Vuc1t0aGlzLmluZGV4ICsgMV0uaXNDaGFyYWN0ZXIoY2hhcik7XG4gIH1cblxuICBwcml2YXRlIHRva2VuKCk6IFRva2VuIHtcbiAgICByZXR1cm4gdGhpcy50b2tlbnNbTWF0aC5taW4odGhpcy5pbmRleCwgdGhpcy50b2tlbnMubGVuZ3RoIC0gMSldO1xuICB9XG5cbiAgcHJpdmF0ZSBjb25zdW1lVHJpZ2dlcihpZGVudGlmaWVyOiBUb2tlbiwgcGFyYW1ldGVyczogc3RyaW5nW10pIHtcbiAgICBjb25zdCB0cmlnZ2VyTmFtZVN0YXJ0U3BhbiA9IHRoaXMuc3Bhbi5zdGFydC5tb3ZlQnkoXG4gICAgICB0aGlzLnN0YXJ0ICsgaWRlbnRpZmllci5pbmRleCAtIHRoaXMudG9rZW5zWzBdLmluZGV4LFxuICAgICk7XG4gICAgY29uc3QgbmFtZVNwYW4gPSBuZXcgUGFyc2VTb3VyY2VTcGFuKFxuICAgICAgdHJpZ2dlck5hbWVTdGFydFNwYW4sXG4gICAgICB0cmlnZ2VyTmFtZVN0YXJ0U3Bhbi5tb3ZlQnkoaWRlbnRpZmllci5zdHJWYWx1ZS5sZW5ndGgpLFxuICAgICk7XG4gICAgY29uc3QgZW5kU3BhbiA9IHRyaWdnZXJOYW1lU3RhcnRTcGFuLm1vdmVCeSh0aGlzLnRva2VuKCkuZW5kIC0gaWRlbnRpZmllci5pbmRleCk7XG5cbiAgICAvLyBQdXQgdGhlIHByZWZldGNoIGFuZCBvbiBzcGFucyB3aXRoIHRoZSBmaXJzdCB0cmlnZ2VyXG4gICAgLy8gVGhpcyBzaG91bGQgbWF5YmUgYmUgcmVmYWN0b3JlZCB0byBoYXZlIHNvbWV0aGluZyBsaWtlIGFuIG91dGVyIE9uR3JvdXAgQVNUXG4gICAgLy8gU2luY2UgdHJpZ2dlcnMgY2FuIGJlIGdyb3VwZWQgd2l0aCBjb21tYXMgXCJvbiBob3Zlcih4KSwgaW50ZXJhY3Rpb24oeSlcIlxuICAgIGNvbnN0IGlzRmlyc3RUcmlnZ2VyID0gaWRlbnRpZmllci5pbmRleCA9PT0gMDtcbiAgICBjb25zdCBvblNvdXJjZVNwYW4gPSBpc0ZpcnN0VHJpZ2dlciA/IHRoaXMub25Tb3VyY2VTcGFuIDogbnVsbDtcbiAgICBjb25zdCBwcmVmZXRjaFNvdXJjZVNwYW4gPSBpc0ZpcnN0VHJpZ2dlciA/IHRoaXMucHJlZmV0Y2hTcGFuIDogbnVsbDtcbiAgICBjb25zdCBzb3VyY2VTcGFuID0gbmV3IFBhcnNlU291cmNlU3BhbihcbiAgICAgIGlzRmlyc3RUcmlnZ2VyID8gdGhpcy5zcGFuLnN0YXJ0IDogdHJpZ2dlck5hbWVTdGFydFNwYW4sXG4gICAgICBlbmRTcGFuLFxuICAgICk7XG5cbiAgICB0cnkge1xuICAgICAgc3dpdGNoIChpZGVudGlmaWVyLnRvU3RyaW5nKCkpIHtcbiAgICAgICAgY2FzZSBPblRyaWdnZXJUeXBlLklETEU6XG4gICAgICAgICAgdGhpcy50cmFja1RyaWdnZXIoXG4gICAgICAgICAgICAnaWRsZScsXG4gICAgICAgICAgICBjcmVhdGVJZGxlVHJpZ2dlcihwYXJhbWV0ZXJzLCBuYW1lU3Bhbiwgc291cmNlU3BhbiwgcHJlZmV0Y2hTb3VyY2VTcGFuLCBvblNvdXJjZVNwYW4pLFxuICAgICAgICAgICk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSBPblRyaWdnZXJUeXBlLlRJTUVSOlxuICAgICAgICAgIHRoaXMudHJhY2tUcmlnZ2VyKFxuICAgICAgICAgICAgJ3RpbWVyJyxcbiAgICAgICAgICAgIGNyZWF0ZVRpbWVyVHJpZ2dlcihcbiAgICAgICAgICAgICAgcGFyYW1ldGVycyxcbiAgICAgICAgICAgICAgbmFtZVNwYW4sXG4gICAgICAgICAgICAgIHNvdXJjZVNwYW4sXG4gICAgICAgICAgICAgIHRoaXMucHJlZmV0Y2hTcGFuLFxuICAgICAgICAgICAgICB0aGlzLm9uU291cmNlU3BhbixcbiAgICAgICAgICAgICksXG4gICAgICAgICAgKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIE9uVHJpZ2dlclR5cGUuSU5URVJBQ1RJT046XG4gICAgICAgICAgdGhpcy50cmFja1RyaWdnZXIoXG4gICAgICAgICAgICAnaW50ZXJhY3Rpb24nLFxuICAgICAgICAgICAgY3JlYXRlSW50ZXJhY3Rpb25UcmlnZ2VyKFxuICAgICAgICAgICAgICBwYXJhbWV0ZXJzLFxuICAgICAgICAgICAgICBuYW1lU3BhbixcbiAgICAgICAgICAgICAgc291cmNlU3BhbixcbiAgICAgICAgICAgICAgdGhpcy5wcmVmZXRjaFNwYW4sXG4gICAgICAgICAgICAgIHRoaXMub25Tb3VyY2VTcGFuLFxuICAgICAgICAgICAgICB0aGlzLnBsYWNlaG9sZGVyLFxuICAgICAgICAgICAgKSxcbiAgICAgICAgICApO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgT25UcmlnZ2VyVHlwZS5JTU1FRElBVEU6XG4gICAgICAgICAgdGhpcy50cmFja1RyaWdnZXIoXG4gICAgICAgICAgICAnaW1tZWRpYXRlJyxcbiAgICAgICAgICAgIGNyZWF0ZUltbWVkaWF0ZVRyaWdnZXIoXG4gICAgICAgICAgICAgIHBhcmFtZXRlcnMsXG4gICAgICAgICAgICAgIG5hbWVTcGFuLFxuICAgICAgICAgICAgICBzb3VyY2VTcGFuLFxuICAgICAgICAgICAgICB0aGlzLnByZWZldGNoU3BhbixcbiAgICAgICAgICAgICAgdGhpcy5vblNvdXJjZVNwYW4sXG4gICAgICAgICAgICApLFxuICAgICAgICAgICk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSBPblRyaWdnZXJUeXBlLkhPVkVSOlxuICAgICAgICAgIHRoaXMudHJhY2tUcmlnZ2VyKFxuICAgICAgICAgICAgJ2hvdmVyJyxcbiAgICAgICAgICAgIGNyZWF0ZUhvdmVyVHJpZ2dlcihcbiAgICAgICAgICAgICAgcGFyYW1ldGVycyxcbiAgICAgICAgICAgICAgbmFtZVNwYW4sXG4gICAgICAgICAgICAgIHNvdXJjZVNwYW4sXG4gICAgICAgICAgICAgIHRoaXMucHJlZmV0Y2hTcGFuLFxuICAgICAgICAgICAgICB0aGlzLm9uU291cmNlU3BhbixcbiAgICAgICAgICAgICAgdGhpcy5wbGFjZWhvbGRlcixcbiAgICAgICAgICAgICksXG4gICAgICAgICAgKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIE9uVHJpZ2dlclR5cGUuVklFV1BPUlQ6XG4gICAgICAgICAgdGhpcy50cmFja1RyaWdnZXIoXG4gICAgICAgICAgICAndmlld3BvcnQnLFxuICAgICAgICAgICAgY3JlYXRlVmlld3BvcnRUcmlnZ2VyKFxuICAgICAgICAgICAgICBwYXJhbWV0ZXJzLFxuICAgICAgICAgICAgICBuYW1lU3BhbixcbiAgICAgICAgICAgICAgc291cmNlU3BhbixcbiAgICAgICAgICAgICAgdGhpcy5wcmVmZXRjaFNwYW4sXG4gICAgICAgICAgICAgIHRoaXMub25Tb3VyY2VTcGFuLFxuICAgICAgICAgICAgICB0aGlzLnBsYWNlaG9sZGVyLFxuICAgICAgICAgICAgKSxcbiAgICAgICAgICApO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbnJlY29nbml6ZWQgdHJpZ2dlciB0eXBlIFwiJHtpZGVudGlmaWVyfVwiYCk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhpcy5lcnJvcihpZGVudGlmaWVyLCAoZSBhcyBFcnJvcikubWVzc2FnZSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBjb25zdW1lUGFyYW1ldGVycygpOiBzdHJpbmdbXSB7XG4gICAgY29uc3QgcGFyYW1ldGVyczogc3RyaW5nW10gPSBbXTtcblxuICAgIGlmICghdGhpcy50b2tlbigpLmlzQ2hhcmFjdGVyKGNoYXJzLiRMUEFSRU4pKSB7XG4gICAgICB0aGlzLnVuZXhwZWN0ZWRUb2tlbih0aGlzLnRva2VuKCkpO1xuICAgICAgcmV0dXJuIHBhcmFtZXRlcnM7XG4gICAgfVxuXG4gICAgdGhpcy5hZHZhbmNlKCk7XG5cbiAgICBjb25zdCBjb21tYURlbGltU3RhY2s6IG51bWJlcltdID0gW107XG4gICAgbGV0IGN1cnJlbnQgPSAnJztcblxuICAgIHdoaWxlICh0aGlzLmluZGV4IDwgdGhpcy50b2tlbnMubGVuZ3RoKSB7XG4gICAgICBjb25zdCB0b2tlbiA9IHRoaXMudG9rZW4oKTtcblxuICAgICAgLy8gU3RvcCBwYXJzaW5nIGlmIHdlJ3ZlIGhpdCB0aGUgZW5kIGNoYXJhY3RlciBhbmQgd2UncmUgb3V0c2lkZSBvZiBhIGNvbW1hLWRlbGltaXRlZCBzeW50YXguXG4gICAgICAvLyBOb3RlIHRoYXQgd2UgZG9uJ3QgbmVlZCB0byBhY2NvdW50IGZvciBzdHJpbmdzIGhlcmUgc2luY2UgdGhlIGxleGVyIGFscmVhZHkgcGFyc2VkIHRoZW1cbiAgICAgIC8vIGludG8gc3RyaW5nIHRva2Vucy5cbiAgICAgIGlmICh0b2tlbi5pc0NoYXJhY3RlcihjaGFycy4kUlBBUkVOKSAmJiBjb21tYURlbGltU3RhY2subGVuZ3RoID09PSAwKSB7XG4gICAgICAgIGlmIChjdXJyZW50Lmxlbmd0aCkge1xuICAgICAgICAgIHBhcmFtZXRlcnMucHVzaChjdXJyZW50KTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgLy8gSW4gdGhlIGBvbmAgbWljcm9zeW50YXggXCJ0b3AtbGV2ZWxcIiBjb21tYXMgKGUuZy4gb25lcyBvdXRzaWRlIG9mIGFuIHBhcmFtZXRlcnMpIHNlcGFyYXRlXG4gICAgICAvLyB0aGUgZGlmZmVyZW50IHRyaWdnZXJzIChlLmcuIGBvbiBpZGxlLHRpbWVyKDUwMClgKS4gVGhpcyBpcyBwcm9ibGVtYXRpYywgYmVjYXVzZSB0aGVcbiAgICAgIC8vIGZ1bmN0aW9uLWxpa2Ugc3ludGF4IGFsc28gaW1wbGllcyB0aGF0IG11bHRpcGxlIHBhcmFtZXRlcnMgY2FuIGJlIHBhc3NlZCBpbnRvIHRoZVxuICAgICAgLy8gaW5kaXZpZHVhbCB0cmlnZ2VyIChlLmcuIGBvbiBmb28oYSwgYilgKS4gVG8gYXZvaWQgdHJpcHBpbmcgdXAgdGhlIHBhcnNlciB3aXRoIGNvbW1hcyB0aGF0XG4gICAgICAvLyBhcmUgcGFydCBvZiBvdGhlciBzb3J0cyBvZiBzeW50YXggKG9iamVjdCBsaXRlcmFscywgYXJyYXlzKSwgd2UgdHJlYXQgYW55dGhpbmcgaW5zaWRlXG4gICAgICAvLyBhIGNvbW1hLWRlbGltaXRlZCBzeW50YXggYmxvY2sgYXMgcGxhaW4gdGV4dC5cbiAgICAgIGlmICh0b2tlbi50eXBlID09PSBUb2tlblR5cGUuQ2hhcmFjdGVyICYmIENPTU1BX0RFTElNSVRFRF9TWU5UQVguaGFzKHRva2VuLm51bVZhbHVlKSkge1xuICAgICAgICBjb21tYURlbGltU3RhY2sucHVzaChDT01NQV9ERUxJTUlURURfU1lOVEFYLmdldCh0b2tlbi5udW1WYWx1ZSkhKTtcbiAgICAgIH1cblxuICAgICAgaWYgKFxuICAgICAgICBjb21tYURlbGltU3RhY2subGVuZ3RoID4gMCAmJlxuICAgICAgICB0b2tlbi5pc0NoYXJhY3Rlcihjb21tYURlbGltU3RhY2tbY29tbWFEZWxpbVN0YWNrLmxlbmd0aCAtIDFdKVxuICAgICAgKSB7XG4gICAgICAgIGNvbW1hRGVsaW1TdGFjay5wb3AoKTtcbiAgICAgIH1cblxuICAgICAgLy8gSWYgd2UgaGl0IGEgY29tbWEgb3V0c2lkZSBvZiBhIGNvbW1hLWRlbGltaXRlZCBzeW50YXgsIGl0IG1lYW5zXG4gICAgICAvLyB0aGF0IHdlJ3JlIGF0IHRoZSB0b3AgbGV2ZWwgYW5kIHdlJ3JlIHN0YXJ0aW5nIGEgbmV3IHBhcmFtZXRlci5cbiAgICAgIGlmIChjb21tYURlbGltU3RhY2subGVuZ3RoID09PSAwICYmIHRva2VuLmlzQ2hhcmFjdGVyKGNoYXJzLiRDT01NQSkgJiYgY3VycmVudC5sZW5ndGggPiAwKSB7XG4gICAgICAgIHBhcmFtZXRlcnMucHVzaChjdXJyZW50KTtcbiAgICAgICAgY3VycmVudCA9ICcnO1xuICAgICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIE90aGVyd2lzZSB0cmVhdCB0aGUgdG9rZW4gYXMgYSBwbGFpbiB0ZXh0IGNoYXJhY3RlciBpbiB0aGUgY3VycmVudCBwYXJhbWV0ZXIuXG4gICAgICBjdXJyZW50ICs9IHRoaXMudG9rZW5UZXh0KCk7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMudG9rZW4oKS5pc0NoYXJhY3RlcihjaGFycy4kUlBBUkVOKSB8fCBjb21tYURlbGltU3RhY2subGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5lcnJvcih0aGlzLnRva2VuKCksICdVbmV4cGVjdGVkIGVuZCBvZiBleHByZXNzaW9uJyk7XG4gICAgfVxuXG4gICAgaWYgKFxuICAgICAgdGhpcy5pbmRleCA8IHRoaXMudG9rZW5zLmxlbmd0aCAtIDEgJiZcbiAgICAgICF0aGlzLnRva2Vuc1t0aGlzLmluZGV4ICsgMV0uaXNDaGFyYWN0ZXIoY2hhcnMuJENPTU1BKVxuICAgICkge1xuICAgICAgdGhpcy51bmV4cGVjdGVkVG9rZW4odGhpcy50b2tlbnNbdGhpcy5pbmRleCArIDFdKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcGFyYW1ldGVycztcbiAgfVxuXG4gIHByaXZhdGUgdG9rZW5UZXh0KCk6IHN0cmluZyB7XG4gICAgLy8gVG9rZW5zIGhhdmUgYSB0b1N0cmluZyBhbHJlYWR5IHdoaWNoIHdlIGNvdWxkIHVzZSwgYnV0IGZvciBzdHJpbmcgdG9rZW5zIGl0IG9taXRzIHRoZSBxdW90ZXMuXG4gICAgLy8gRXZlbnR1YWxseSB3ZSBjb3VsZCBleHBvc2UgdGhpcyBpbmZvcm1hdGlvbiBvbiB0aGUgdG9rZW4gZGlyZWN0bHkuXG4gICAgcmV0dXJuIHRoaXMuZXhwcmVzc2lvbi5zbGljZSh0aGlzLnN0YXJ0ICsgdGhpcy50b2tlbigpLmluZGV4LCB0aGlzLnN0YXJ0ICsgdGhpcy50b2tlbigpLmVuZCk7XG4gIH1cblxuICBwcml2YXRlIHRyYWNrVHJpZ2dlcihuYW1lOiBrZXlvZiB0LkRlZmVycmVkQmxvY2tUcmlnZ2VycywgdHJpZ2dlcjogdC5EZWZlcnJlZFRyaWdnZXIpOiB2b2lkIHtcbiAgICB0cmFja1RyaWdnZXIobmFtZSwgdGhpcy50cmlnZ2VycywgdGhpcy5lcnJvcnMsIHRyaWdnZXIpO1xuICB9XG5cbiAgcHJpdmF0ZSBlcnJvcih0b2tlbjogVG9rZW4sIG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IG5ld1N0YXJ0ID0gdGhpcy5zcGFuLnN0YXJ0Lm1vdmVCeSh0aGlzLnN0YXJ0ICsgdG9rZW4uaW5kZXgpO1xuICAgIGNvbnN0IG5ld0VuZCA9IG5ld1N0YXJ0Lm1vdmVCeSh0b2tlbi5lbmQgLSB0b2tlbi5pbmRleCk7XG4gICAgdGhpcy5lcnJvcnMucHVzaChuZXcgUGFyc2VFcnJvcihuZXcgUGFyc2VTb3VyY2VTcGFuKG5ld1N0YXJ0LCBuZXdFbmQpLCBtZXNzYWdlKSk7XG4gIH1cblxuICBwcml2YXRlIHVuZXhwZWN0ZWRUb2tlbih0b2tlbjogVG9rZW4pIHtcbiAgICB0aGlzLmVycm9yKHRva2VuLCBgVW5leHBlY3RlZCB0b2tlbiBcIiR7dG9rZW59XCJgKTtcbiAgfVxufVxuXG4vKiogQWRkcyBhIHRyaWdnZXIgdG8gYSBtYXAgb2YgdHJpZ2dlcnMuICovXG5mdW5jdGlvbiB0cmFja1RyaWdnZXIoXG4gIG5hbWU6IGtleW9mIHQuRGVmZXJyZWRCbG9ja1RyaWdnZXJzLFxuICBhbGxUcmlnZ2VyczogdC5EZWZlcnJlZEJsb2NrVHJpZ2dlcnMsXG4gIGVycm9yczogUGFyc2VFcnJvcltdLFxuICB0cmlnZ2VyOiB0LkRlZmVycmVkVHJpZ2dlcixcbikge1xuICBpZiAoYWxsVHJpZ2dlcnNbbmFtZV0pIHtcbiAgICBlcnJvcnMucHVzaChuZXcgUGFyc2VFcnJvcih0cmlnZ2VyLnNvdXJjZVNwYW4sIGBEdXBsaWNhdGUgXCIke25hbWV9XCIgdHJpZ2dlciBpcyBub3QgYWxsb3dlZGApKTtcbiAgfSBlbHNlIHtcbiAgICBhbGxUcmlnZ2Vyc1tuYW1lXSA9IHRyaWdnZXIgYXMgYW55O1xuICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUlkbGVUcmlnZ2VyKFxuICBwYXJhbWV0ZXJzOiBzdHJpbmdbXSxcbiAgbmFtZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICBwcmVmZXRjaFNwYW46IFBhcnNlU291cmNlU3BhbiB8IG51bGwsXG4gIG9uU291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuIHwgbnVsbCxcbik6IHQuSWRsZURlZmVycmVkVHJpZ2dlciB7XG4gIGlmIChwYXJhbWV0ZXJzLmxlbmd0aCA+IDApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFwiJHtPblRyaWdnZXJUeXBlLklETEV9XCIgdHJpZ2dlciBjYW5ub3QgaGF2ZSBwYXJhbWV0ZXJzYCk7XG4gIH1cblxuICByZXR1cm4gbmV3IHQuSWRsZURlZmVycmVkVHJpZ2dlcihuYW1lU3Bhbiwgc291cmNlU3BhbiwgcHJlZmV0Y2hTcGFuLCBvblNvdXJjZVNwYW4pO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVUaW1lclRyaWdnZXIoXG4gIHBhcmFtZXRlcnM6IHN0cmluZ1tdLFxuICBuYW1lU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gIHByZWZldGNoU3BhbjogUGFyc2VTb3VyY2VTcGFuIHwgbnVsbCxcbiAgb25Tb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4gfCBudWxsLFxuKSB7XG4gIGlmIChwYXJhbWV0ZXJzLmxlbmd0aCAhPT0gMSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgXCIke09uVHJpZ2dlclR5cGUuVElNRVJ9XCIgdHJpZ2dlciBtdXN0IGhhdmUgZXhhY3RseSBvbmUgcGFyYW1ldGVyYCk7XG4gIH1cblxuICBjb25zdCBkZWxheSA9IHBhcnNlRGVmZXJyZWRUaW1lKHBhcmFtZXRlcnNbMF0pO1xuXG4gIGlmIChkZWxheSA9PT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgQ291bGQgbm90IHBhcnNlIHRpbWUgdmFsdWUgb2YgdHJpZ2dlciBcIiR7T25UcmlnZ2VyVHlwZS5USU1FUn1cImApO1xuICB9XG5cbiAgcmV0dXJuIG5ldyB0LlRpbWVyRGVmZXJyZWRUcmlnZ2VyKGRlbGF5LCBuYW1lU3Bhbiwgc291cmNlU3BhbiwgcHJlZmV0Y2hTcGFuLCBvblNvdXJjZVNwYW4pO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVJbW1lZGlhdGVUcmlnZ2VyKFxuICBwYXJhbWV0ZXJzOiBzdHJpbmdbXSxcbiAgbmFtZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICBwcmVmZXRjaFNwYW46IFBhcnNlU291cmNlU3BhbiB8IG51bGwsXG4gIG9uU291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuIHwgbnVsbCxcbik6IHQuSW1tZWRpYXRlRGVmZXJyZWRUcmlnZ2VyIHtcbiAgaWYgKHBhcmFtZXRlcnMubGVuZ3RoID4gMCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgXCIke09uVHJpZ2dlclR5cGUuSU1NRURJQVRFfVwiIHRyaWdnZXIgY2Fubm90IGhhdmUgcGFyYW1ldGVyc2ApO1xuICB9XG5cbiAgcmV0dXJuIG5ldyB0LkltbWVkaWF0ZURlZmVycmVkVHJpZ2dlcihuYW1lU3Bhbiwgc291cmNlU3BhbiwgcHJlZmV0Y2hTcGFuLCBvblNvdXJjZVNwYW4pO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVIb3ZlclRyaWdnZXIoXG4gIHBhcmFtZXRlcnM6IHN0cmluZ1tdLFxuICBuYW1lU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gIHByZWZldGNoU3BhbjogUGFyc2VTb3VyY2VTcGFuIHwgbnVsbCxcbiAgb25Tb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4gfCBudWxsLFxuICBwbGFjZWhvbGRlcjogdC5EZWZlcnJlZEJsb2NrUGxhY2Vob2xkZXIgfCBudWxsLFxuKTogdC5Ib3ZlckRlZmVycmVkVHJpZ2dlciB7XG4gIHZhbGlkYXRlUmVmZXJlbmNlQmFzZWRUcmlnZ2VyKE9uVHJpZ2dlclR5cGUuSE9WRVIsIHBhcmFtZXRlcnMsIHBsYWNlaG9sZGVyKTtcbiAgcmV0dXJuIG5ldyB0LkhvdmVyRGVmZXJyZWRUcmlnZ2VyKFxuICAgIHBhcmFtZXRlcnNbMF0gPz8gbnVsbCxcbiAgICBuYW1lU3BhbixcbiAgICBzb3VyY2VTcGFuLFxuICAgIHByZWZldGNoU3BhbixcbiAgICBvblNvdXJjZVNwYW4sXG4gICk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUludGVyYWN0aW9uVHJpZ2dlcihcbiAgcGFyYW1ldGVyczogc3RyaW5nW10sXG4gIG5hbWVTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgcHJlZmV0Y2hTcGFuOiBQYXJzZVNvdXJjZVNwYW4gfCBudWxsLFxuICBvblNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbiB8IG51bGwsXG4gIHBsYWNlaG9sZGVyOiB0LkRlZmVycmVkQmxvY2tQbGFjZWhvbGRlciB8IG51bGwsXG4pOiB0LkludGVyYWN0aW9uRGVmZXJyZWRUcmlnZ2VyIHtcbiAgdmFsaWRhdGVSZWZlcmVuY2VCYXNlZFRyaWdnZXIoT25UcmlnZ2VyVHlwZS5JTlRFUkFDVElPTiwgcGFyYW1ldGVycywgcGxhY2Vob2xkZXIpO1xuICByZXR1cm4gbmV3IHQuSW50ZXJhY3Rpb25EZWZlcnJlZFRyaWdnZXIoXG4gICAgcGFyYW1ldGVyc1swXSA/PyBudWxsLFxuICAgIG5hbWVTcGFuLFxuICAgIHNvdXJjZVNwYW4sXG4gICAgcHJlZmV0Y2hTcGFuLFxuICAgIG9uU291cmNlU3BhbixcbiAgKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlVmlld3BvcnRUcmlnZ2VyKFxuICBwYXJhbWV0ZXJzOiBzdHJpbmdbXSxcbiAgbmFtZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICBwcmVmZXRjaFNwYW46IFBhcnNlU291cmNlU3BhbiB8IG51bGwsXG4gIG9uU291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuIHwgbnVsbCxcbiAgcGxhY2Vob2xkZXI6IHQuRGVmZXJyZWRCbG9ja1BsYWNlaG9sZGVyIHwgbnVsbCxcbik6IHQuVmlld3BvcnREZWZlcnJlZFRyaWdnZXIge1xuICB2YWxpZGF0ZVJlZmVyZW5jZUJhc2VkVHJpZ2dlcihPblRyaWdnZXJUeXBlLlZJRVdQT1JULCBwYXJhbWV0ZXJzLCBwbGFjZWhvbGRlcik7XG4gIHJldHVybiBuZXcgdC5WaWV3cG9ydERlZmVycmVkVHJpZ2dlcihcbiAgICBwYXJhbWV0ZXJzWzBdID8/IG51bGwsXG4gICAgbmFtZVNwYW4sXG4gICAgc291cmNlU3BhbixcbiAgICBwcmVmZXRjaFNwYW4sXG4gICAgb25Tb3VyY2VTcGFuLFxuICApO1xufVxuXG5mdW5jdGlvbiB2YWxpZGF0ZVJlZmVyZW5jZUJhc2VkVHJpZ2dlcihcbiAgdHlwZTogT25UcmlnZ2VyVHlwZSxcbiAgcGFyYW1ldGVyczogc3RyaW5nW10sXG4gIHBsYWNlaG9sZGVyOiB0LkRlZmVycmVkQmxvY2tQbGFjZWhvbGRlciB8IG51bGwsXG4pIHtcbiAgaWYgKHBhcmFtZXRlcnMubGVuZ3RoID4gMSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgXCIke3R5cGV9XCIgdHJpZ2dlciBjYW4gb25seSBoYXZlIHplcm8gb3Igb25lIHBhcmFtZXRlcnNgKTtcbiAgfVxuXG4gIGlmIChwYXJhbWV0ZXJzLmxlbmd0aCA9PT0gMCkge1xuICAgIGlmIChwbGFjZWhvbGRlciA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgXCIke3R5cGV9XCIgdHJpZ2dlciB3aXRoIG5vIHBhcmFtZXRlcnMgY2FuIG9ubHkgYmUgcGxhY2VkIG9uIGFuIEBkZWZlciB0aGF0IGhhcyBhIEBwbGFjZWhvbGRlciBibG9ja2AsXG4gICAgICApO1xuICAgIH1cblxuICAgIGlmIChwbGFjZWhvbGRlci5jaGlsZHJlbi5sZW5ndGggIT09IDEgfHwgIShwbGFjZWhvbGRlci5jaGlsZHJlblswXSBpbnN0YW5jZW9mIHQuRWxlbWVudCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYFwiJHt0eXBlfVwiIHRyaWdnZXIgd2l0aCBubyBwYXJhbWV0ZXJzIGNhbiBvbmx5IGJlIHBsYWNlZCBvbiBhbiBAZGVmZXIgdGhhdCBoYXMgYSBgICtcbiAgICAgICAgICBgQHBsYWNlaG9sZGVyIGJsb2NrIHdpdGggZXhhY3RseSBvbmUgcm9vdCBlbGVtZW50IG5vZGVgLFxuICAgICAgKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqIEdldHMgdGhlIGluZGV4IHdpdGhpbiBhbiBleHByZXNzaW9uIGF0IHdoaWNoIHRoZSB0cmlnZ2VyIHBhcmFtZXRlcnMgc3RhcnQuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0VHJpZ2dlclBhcmFtZXRlcnNTdGFydCh2YWx1ZTogc3RyaW5nLCBzdGFydFBvc2l0aW9uID0gMCk6IG51bWJlciB7XG4gIGxldCBoYXNGb3VuZFNlcGFyYXRvciA9IGZhbHNlO1xuXG4gIGZvciAobGV0IGkgPSBzdGFydFBvc2l0aW9uOyBpIDwgdmFsdWUubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoU0VQQVJBVE9SX1BBVFRFUk4udGVzdCh2YWx1ZVtpXSkpIHtcbiAgICAgIGhhc0ZvdW5kU2VwYXJhdG9yID0gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKGhhc0ZvdW5kU2VwYXJhdG9yKSB7XG4gICAgICByZXR1cm4gaTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gLTE7XG59XG5cbi8qKlxuICogUGFyc2VzIGEgdGltZSBleHByZXNzaW9uIGZyb20gYSBkZWZlcnJlZCB0cmlnZ2VyIHRvXG4gKiBtaWxsaXNlY29uZHMuIFJldHVybnMgbnVsbCBpZiBpdCBjYW5ub3QgYmUgcGFyc2VkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VEZWZlcnJlZFRpbWUodmFsdWU6IHN0cmluZyk6IG51bWJlciB8IG51bGwge1xuICBjb25zdCBtYXRjaCA9IHZhbHVlLm1hdGNoKFRJTUVfUEFUVEVSTik7XG5cbiAgaWYgKCFtYXRjaCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgY29uc3QgW3RpbWUsIHVuaXRzXSA9IG1hdGNoO1xuICByZXR1cm4gcGFyc2VGbG9hdCh0aW1lKSAqICh1bml0cyA9PT0gJ3MnID8gMTAwMCA6IDEpO1xufVxuIl19