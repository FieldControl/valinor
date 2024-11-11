/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { SecurityContext } from '../core';
import { AbsoluteSourceSpan, ASTWithSource, Binary, BindingType, BoundElementProperty, Conditional, EmptyExpr, KeyedRead, NonNullAssert, ParsedEvent, ParsedEventType, ParsedProperty, ParsedPropertyType, ParsedVariable, PrefixNot, PropertyRead, RecursiveAstVisitor, VariableBinding, } from '../expression_parser/ast';
import { mergeNsAndName } from '../ml_parser/tags';
import { ParseError, ParseErrorLevel, ParseSourceSpan } from '../parse_util';
import { CssSelector } from '../selector';
import { splitAtColon, splitAtPeriod } from '../util';
const PROPERTY_PARTS_SEPARATOR = '.';
const ATTRIBUTE_PREFIX = 'attr';
const CLASS_PREFIX = 'class';
const STYLE_PREFIX = 'style';
const TEMPLATE_ATTR_PREFIX = '*';
const ANIMATE_PROP_PREFIX = 'animate-';
/**
 * Parses bindings in templates and in the directive host area.
 */
export class BindingParser {
    constructor(_exprParser, _interpolationConfig, _schemaRegistry, errors, _allowInvalidAssignmentEvents = false) {
        this._exprParser = _exprParser;
        this._interpolationConfig = _interpolationConfig;
        this._schemaRegistry = _schemaRegistry;
        this.errors = errors;
        this._allowInvalidAssignmentEvents = _allowInvalidAssignmentEvents;
    }
    get interpolationConfig() {
        return this._interpolationConfig;
    }
    createBoundHostProperties(properties, sourceSpan) {
        const boundProps = [];
        for (const propName of Object.keys(properties)) {
            const expression = properties[propName];
            if (typeof expression === 'string') {
                this.parsePropertyBinding(propName, expression, true, false, sourceSpan, sourceSpan.start.offset, undefined, [], 
                // Use the `sourceSpan` for  `keySpan`. This isn't really accurate, but neither is the
                // sourceSpan, as it represents the sourceSpan of the host itself rather than the
                // source of the host binding (which doesn't exist in the template). Regardless,
                // neither of these values are used in Ivy but are only here to satisfy the function
                // signature. This should likely be refactored in the future so that `sourceSpan`
                // isn't being used inaccurately.
                boundProps, sourceSpan);
            }
            else {
                this._reportError(`Value of the host property binding "${propName}" needs to be a string representing an expression but got "${expression}" (${typeof expression})`, sourceSpan);
            }
        }
        return boundProps;
    }
    createDirectiveHostEventAsts(hostListeners, sourceSpan) {
        const targetEvents = [];
        for (const propName of Object.keys(hostListeners)) {
            const expression = hostListeners[propName];
            if (typeof expression === 'string') {
                // Use the `sourceSpan` for  `keySpan` and `handlerSpan`. This isn't really accurate, but
                // neither is the `sourceSpan`, as it represents the `sourceSpan` of the host itself
                // rather than the source of the host binding (which doesn't exist in the template).
                // Regardless, neither of these values are used in Ivy but are only here to satisfy the
                // function signature. This should likely be refactored in the future so that `sourceSpan`
                // isn't being used inaccurately.
                this.parseEvent(propName, expression, 
                /* isAssignmentEvent */ false, sourceSpan, sourceSpan, [], targetEvents, sourceSpan);
            }
            else {
                this._reportError(`Value of the host listener "${propName}" needs to be a string representing an expression but got "${expression}" (${typeof expression})`, sourceSpan);
            }
        }
        return targetEvents;
    }
    parseInterpolation(value, sourceSpan, interpolatedTokens) {
        const sourceInfo = sourceSpan.start.toString();
        const absoluteOffset = sourceSpan.fullStart.offset;
        try {
            const ast = this._exprParser.parseInterpolation(value, sourceInfo, absoluteOffset, interpolatedTokens, this._interpolationConfig);
            if (ast)
                this._reportExpressionParserErrors(ast.errors, sourceSpan);
            return ast;
        }
        catch (e) {
            this._reportError(`${e}`, sourceSpan);
            return this._exprParser.wrapLiteralPrimitive('ERROR', sourceInfo, absoluteOffset);
        }
    }
    /**
     * Similar to `parseInterpolation`, but treats the provided string as a single expression
     * element that would normally appear within the interpolation prefix and suffix (`{{` and `}}`).
     * This is used for parsing the switch expression in ICUs.
     */
    parseInterpolationExpression(expression, sourceSpan) {
        const sourceInfo = sourceSpan.start.toString();
        const absoluteOffset = sourceSpan.start.offset;
        try {
            const ast = this._exprParser.parseInterpolationExpression(expression, sourceInfo, absoluteOffset);
            if (ast)
                this._reportExpressionParserErrors(ast.errors, sourceSpan);
            return ast;
        }
        catch (e) {
            this._reportError(`${e}`, sourceSpan);
            return this._exprParser.wrapLiteralPrimitive('ERROR', sourceInfo, absoluteOffset);
        }
    }
    /**
     * Parses the bindings in a microsyntax expression, and converts them to
     * `ParsedProperty` or `ParsedVariable`.
     *
     * @param tplKey template binding name
     * @param tplValue template binding value
     * @param sourceSpan span of template binding relative to entire the template
     * @param absoluteValueOffset start of the tplValue relative to the entire template
     * @param targetMatchableAttrs potential attributes to match in the template
     * @param targetProps target property bindings in the template
     * @param targetVars target variables in the template
     */
    parseInlineTemplateBinding(tplKey, tplValue, sourceSpan, absoluteValueOffset, targetMatchableAttrs, targetProps, targetVars, isIvyAst) {
        const absoluteKeyOffset = sourceSpan.start.offset + TEMPLATE_ATTR_PREFIX.length;
        const bindings = this._parseTemplateBindings(tplKey, tplValue, sourceSpan, absoluteKeyOffset, absoluteValueOffset);
        for (const binding of bindings) {
            // sourceSpan is for the entire HTML attribute. bindingSpan is for a particular
            // binding within the microsyntax expression so it's more narrow than sourceSpan.
            const bindingSpan = moveParseSourceSpan(sourceSpan, binding.sourceSpan);
            const key = binding.key.source;
            const keySpan = moveParseSourceSpan(sourceSpan, binding.key.span);
            if (binding instanceof VariableBinding) {
                const value = binding.value ? binding.value.source : '$implicit';
                const valueSpan = binding.value
                    ? moveParseSourceSpan(sourceSpan, binding.value.span)
                    : undefined;
                targetVars.push(new ParsedVariable(key, value, bindingSpan, keySpan, valueSpan));
            }
            else if (binding.value) {
                const srcSpan = isIvyAst ? bindingSpan : sourceSpan;
                const valueSpan = moveParseSourceSpan(sourceSpan, binding.value.ast.sourceSpan);
                this._parsePropertyAst(key, binding.value, false, srcSpan, keySpan, valueSpan, targetMatchableAttrs, targetProps);
            }
            else {
                targetMatchableAttrs.push([key, '' /* value */]);
                // Since this is a literal attribute with no RHS, source span should be
                // just the key span.
                this.parseLiteralAttr(key, null /* value */, keySpan, absoluteValueOffset, undefined /* valueSpan */, targetMatchableAttrs, targetProps, keySpan);
            }
        }
    }
    /**
     * Parses the bindings in a microsyntax expression, e.g.
     * ```
     *    <tag *tplKey="let value1 = prop; let value2 = localVar">
     * ```
     *
     * @param tplKey template binding name
     * @param tplValue template binding value
     * @param sourceSpan span of template binding relative to entire the template
     * @param absoluteKeyOffset start of the `tplKey`
     * @param absoluteValueOffset start of the `tplValue`
     */
    _parseTemplateBindings(tplKey, tplValue, sourceSpan, absoluteKeyOffset, absoluteValueOffset) {
        const sourceInfo = sourceSpan.start.toString();
        try {
            const bindingsResult = this._exprParser.parseTemplateBindings(tplKey, tplValue, sourceInfo, absoluteKeyOffset, absoluteValueOffset);
            this._reportExpressionParserErrors(bindingsResult.errors, sourceSpan);
            bindingsResult.warnings.forEach((warning) => {
                this._reportError(warning, sourceSpan, ParseErrorLevel.WARNING);
            });
            return bindingsResult.templateBindings;
        }
        catch (e) {
            this._reportError(`${e}`, sourceSpan);
            return [];
        }
    }
    parseLiteralAttr(name, value, sourceSpan, absoluteOffset, valueSpan, targetMatchableAttrs, targetProps, keySpan) {
        if (isAnimationLabel(name)) {
            name = name.substring(1);
            if (keySpan !== undefined) {
                keySpan = moveParseSourceSpan(keySpan, new AbsoluteSourceSpan(keySpan.start.offset + 1, keySpan.end.offset));
            }
            if (value) {
                this._reportError(`Assigning animation triggers via @prop="exp" attributes with an expression is invalid.` +
                    ` Use property bindings (e.g. [@prop]="exp") or use an attribute without a value (e.g. @prop) instead.`, sourceSpan, ParseErrorLevel.ERROR);
            }
            this._parseAnimation(name, value, sourceSpan, absoluteOffset, keySpan, valueSpan, targetMatchableAttrs, targetProps);
        }
        else {
            targetProps.push(new ParsedProperty(name, this._exprParser.wrapLiteralPrimitive(value, '', absoluteOffset), ParsedPropertyType.LITERAL_ATTR, sourceSpan, keySpan, valueSpan));
        }
    }
    parsePropertyBinding(name, expression, isHost, isPartOfAssignmentBinding, sourceSpan, absoluteOffset, valueSpan, targetMatchableAttrs, targetProps, keySpan) {
        if (name.length === 0) {
            this._reportError(`Property name is missing in binding`, sourceSpan);
        }
        let isAnimationProp = false;
        if (name.startsWith(ANIMATE_PROP_PREFIX)) {
            isAnimationProp = true;
            name = name.substring(ANIMATE_PROP_PREFIX.length);
            if (keySpan !== undefined) {
                keySpan = moveParseSourceSpan(keySpan, new AbsoluteSourceSpan(keySpan.start.offset + ANIMATE_PROP_PREFIX.length, keySpan.end.offset));
            }
        }
        else if (isAnimationLabel(name)) {
            isAnimationProp = true;
            name = name.substring(1);
            if (keySpan !== undefined) {
                keySpan = moveParseSourceSpan(keySpan, new AbsoluteSourceSpan(keySpan.start.offset + 1, keySpan.end.offset));
            }
        }
        if (isAnimationProp) {
            this._parseAnimation(name, expression, sourceSpan, absoluteOffset, keySpan, valueSpan, targetMatchableAttrs, targetProps);
        }
        else {
            this._parsePropertyAst(name, this.parseBinding(expression, isHost, valueSpan || sourceSpan, absoluteOffset), isPartOfAssignmentBinding, sourceSpan, keySpan, valueSpan, targetMatchableAttrs, targetProps);
        }
    }
    parsePropertyInterpolation(name, value, sourceSpan, valueSpan, targetMatchableAttrs, targetProps, keySpan, interpolatedTokens) {
        const expr = this.parseInterpolation(value, valueSpan || sourceSpan, interpolatedTokens);
        if (expr) {
            this._parsePropertyAst(name, expr, false, sourceSpan, keySpan, valueSpan, targetMatchableAttrs, targetProps);
            return true;
        }
        return false;
    }
    _parsePropertyAst(name, ast, isPartOfAssignmentBinding, sourceSpan, keySpan, valueSpan, targetMatchableAttrs, targetProps) {
        targetMatchableAttrs.push([name, ast.source]);
        targetProps.push(new ParsedProperty(name, ast, isPartOfAssignmentBinding ? ParsedPropertyType.TWO_WAY : ParsedPropertyType.DEFAULT, sourceSpan, keySpan, valueSpan));
    }
    _parseAnimation(name, expression, sourceSpan, absoluteOffset, keySpan, valueSpan, targetMatchableAttrs, targetProps) {
        if (name.length === 0) {
            this._reportError('Animation trigger is missing', sourceSpan);
        }
        // This will occur when a @trigger is not paired with an expression.
        // For animations it is valid to not have an expression since */void
        // states will be applied by angular when the element is attached/detached
        const ast = this.parseBinding(expression || 'undefined', false, valueSpan || sourceSpan, absoluteOffset);
        targetMatchableAttrs.push([name, ast.source]);
        targetProps.push(new ParsedProperty(name, ast, ParsedPropertyType.ANIMATION, sourceSpan, keySpan, valueSpan));
    }
    parseBinding(value, isHostBinding, sourceSpan, absoluteOffset) {
        const sourceInfo = ((sourceSpan && sourceSpan.start) || '(unknown)').toString();
        try {
            const ast = isHostBinding
                ? this._exprParser.parseSimpleBinding(value, sourceInfo, absoluteOffset, this._interpolationConfig)
                : this._exprParser.parseBinding(value, sourceInfo, absoluteOffset, this._interpolationConfig);
            if (ast)
                this._reportExpressionParserErrors(ast.errors, sourceSpan);
            return ast;
        }
        catch (e) {
            this._reportError(`${e}`, sourceSpan);
            return this._exprParser.wrapLiteralPrimitive('ERROR', sourceInfo, absoluteOffset);
        }
    }
    createBoundElementProperty(elementSelector, boundProp, skipValidation = false, mapPropertyName = true) {
        if (boundProp.isAnimation) {
            return new BoundElementProperty(boundProp.name, BindingType.Animation, SecurityContext.NONE, boundProp.expression, null, boundProp.sourceSpan, boundProp.keySpan, boundProp.valueSpan);
        }
        let unit = null;
        let bindingType = undefined;
        let boundPropertyName = null;
        const parts = boundProp.name.split(PROPERTY_PARTS_SEPARATOR);
        let securityContexts = undefined;
        // Check for special cases (prefix style, attr, class)
        if (parts.length > 1) {
            if (parts[0] == ATTRIBUTE_PREFIX) {
                boundPropertyName = parts.slice(1).join(PROPERTY_PARTS_SEPARATOR);
                if (!skipValidation) {
                    this._validatePropertyOrAttributeName(boundPropertyName, boundProp.sourceSpan, true);
                }
                securityContexts = calcPossibleSecurityContexts(this._schemaRegistry, elementSelector, boundPropertyName, true);
                const nsSeparatorIdx = boundPropertyName.indexOf(':');
                if (nsSeparatorIdx > -1) {
                    const ns = boundPropertyName.substring(0, nsSeparatorIdx);
                    const name = boundPropertyName.substring(nsSeparatorIdx + 1);
                    boundPropertyName = mergeNsAndName(ns, name);
                }
                bindingType = BindingType.Attribute;
            }
            else if (parts[0] == CLASS_PREFIX) {
                boundPropertyName = parts[1];
                bindingType = BindingType.Class;
                securityContexts = [SecurityContext.NONE];
            }
            else if (parts[0] == STYLE_PREFIX) {
                unit = parts.length > 2 ? parts[2] : null;
                boundPropertyName = parts[1];
                bindingType = BindingType.Style;
                securityContexts = [SecurityContext.STYLE];
            }
        }
        // If not a special case, use the full property name
        if (boundPropertyName === null) {
            const mappedPropName = this._schemaRegistry.getMappedPropName(boundProp.name);
            boundPropertyName = mapPropertyName ? mappedPropName : boundProp.name;
            securityContexts = calcPossibleSecurityContexts(this._schemaRegistry, elementSelector, mappedPropName, false);
            bindingType =
                boundProp.type === ParsedPropertyType.TWO_WAY ? BindingType.TwoWay : BindingType.Property;
            if (!skipValidation) {
                this._validatePropertyOrAttributeName(mappedPropName, boundProp.sourceSpan, false);
            }
        }
        return new BoundElementProperty(boundPropertyName, bindingType, securityContexts[0], boundProp.expression, unit, boundProp.sourceSpan, boundProp.keySpan, boundProp.valueSpan);
    }
    // TODO: keySpan should be required but was made optional to avoid changing VE parser.
    parseEvent(name, expression, isAssignmentEvent, sourceSpan, handlerSpan, targetMatchableAttrs, targetEvents, keySpan) {
        if (name.length === 0) {
            this._reportError(`Event name is missing in binding`, sourceSpan);
        }
        if (isAnimationLabel(name)) {
            name = name.slice(1);
            if (keySpan !== undefined) {
                keySpan = moveParseSourceSpan(keySpan, new AbsoluteSourceSpan(keySpan.start.offset + 1, keySpan.end.offset));
            }
            this._parseAnimationEvent(name, expression, sourceSpan, handlerSpan, targetEvents, keySpan);
        }
        else {
            this._parseRegularEvent(name, expression, isAssignmentEvent, sourceSpan, handlerSpan, targetMatchableAttrs, targetEvents, keySpan);
        }
    }
    calcPossibleSecurityContexts(selector, propName, isAttribute) {
        const prop = this._schemaRegistry.getMappedPropName(propName);
        return calcPossibleSecurityContexts(this._schemaRegistry, selector, prop, isAttribute);
    }
    _parseAnimationEvent(name, expression, sourceSpan, handlerSpan, targetEvents, keySpan) {
        const matches = splitAtPeriod(name, [name, '']);
        const eventName = matches[0];
        const phase = matches[1].toLowerCase();
        const ast = this._parseAction(expression, handlerSpan);
        targetEvents.push(new ParsedEvent(eventName, phase, ParsedEventType.Animation, ast, sourceSpan, handlerSpan, keySpan));
        if (eventName.length === 0) {
            this._reportError(`Animation event name is missing in binding`, sourceSpan);
        }
        if (phase) {
            if (phase !== 'start' && phase !== 'done') {
                this._reportError(`The provided animation output phase value "${phase}" for "@${eventName}" is not supported (use start or done)`, sourceSpan);
            }
        }
        else {
            this._reportError(`The animation trigger output event (@${eventName}) is missing its phase value name (start or done are currently supported)`, sourceSpan);
        }
    }
    _parseRegularEvent(name, expression, isAssignmentEvent, sourceSpan, handlerSpan, targetMatchableAttrs, targetEvents, keySpan) {
        // long format: 'target: eventName'
        const [target, eventName] = splitAtColon(name, [null, name]);
        const prevErrorCount = this.errors.length;
        const ast = this._parseAction(expression, handlerSpan);
        const isValid = this.errors.length === prevErrorCount;
        targetMatchableAttrs.push([name, ast.source]);
        // Don't try to validate assignment events if there were other
        // parsing errors to avoid adding more noise to the error logs.
        if (isAssignmentEvent && isValid && !this._isAllowedAssignmentEvent(ast)) {
            this._reportError('Unsupported expression in a two-way binding', sourceSpan);
        }
        targetEvents.push(new ParsedEvent(eventName, target, isAssignmentEvent ? ParsedEventType.TwoWay : ParsedEventType.Regular, ast, sourceSpan, handlerSpan, keySpan));
        // Don't detect directives for event names for now,
        // so don't add the event name to the matchableAttrs
    }
    _parseAction(value, sourceSpan) {
        const sourceInfo = ((sourceSpan && sourceSpan.start) || '(unknown').toString();
        const absoluteOffset = sourceSpan && sourceSpan.start ? sourceSpan.start.offset : 0;
        try {
            const ast = this._exprParser.parseAction(value, sourceInfo, absoluteOffset, this._interpolationConfig);
            if (ast) {
                this._reportExpressionParserErrors(ast.errors, sourceSpan);
            }
            if (!ast || ast.ast instanceof EmptyExpr) {
                this._reportError(`Empty expressions are not allowed`, sourceSpan);
                return this._exprParser.wrapLiteralPrimitive('ERROR', sourceInfo, absoluteOffset);
            }
            return ast;
        }
        catch (e) {
            this._reportError(`${e}`, sourceSpan);
            return this._exprParser.wrapLiteralPrimitive('ERROR', sourceInfo, absoluteOffset);
        }
    }
    _reportError(message, sourceSpan, level = ParseErrorLevel.ERROR) {
        this.errors.push(new ParseError(sourceSpan, message, level));
    }
    _reportExpressionParserErrors(errors, sourceSpan) {
        for (const error of errors) {
            this._reportError(error.message, sourceSpan);
        }
    }
    /**
     * @param propName the name of the property / attribute
     * @param sourceSpan
     * @param isAttr true when binding to an attribute
     */
    _validatePropertyOrAttributeName(propName, sourceSpan, isAttr) {
        const report = isAttr
            ? this._schemaRegistry.validateAttribute(propName)
            : this._schemaRegistry.validateProperty(propName);
        if (report.error) {
            this._reportError(report.msg, sourceSpan, ParseErrorLevel.ERROR);
        }
    }
    /**
     * Returns whether a parsed AST is allowed to be used within the event side of a two-way binding.
     * @param ast Parsed AST to be checked.
     */
    _isAllowedAssignmentEvent(ast) {
        if (ast instanceof ASTWithSource) {
            return this._isAllowedAssignmentEvent(ast.ast);
        }
        if (ast instanceof NonNullAssert) {
            return this._isAllowedAssignmentEvent(ast.expression);
        }
        if (ast instanceof PropertyRead || ast instanceof KeyedRead) {
            return true;
        }
        // TODO(crisbeto): this logic is only here to support the automated migration away
        // from invalid bindings. It should be removed once the migration is deleted.
        if (!this._allowInvalidAssignmentEvents) {
            return false;
        }
        if (ast instanceof Binary) {
            return ((ast.operation === '&&' || ast.operation === '||' || ast.operation === '??') &&
                (ast.right instanceof PropertyRead || ast.right instanceof KeyedRead));
        }
        return ast instanceof Conditional || ast instanceof PrefixNot;
    }
}
export class PipeCollector extends RecursiveAstVisitor {
    constructor() {
        super(...arguments);
        this.pipes = new Map();
    }
    visitPipe(ast, context) {
        this.pipes.set(ast.name, ast);
        ast.exp.visit(this);
        this.visitAll(ast.args, context);
        return null;
    }
}
function isAnimationLabel(name) {
    return name[0] == '@';
}
export function calcPossibleSecurityContexts(registry, selector, propName, isAttribute) {
    const ctxs = [];
    CssSelector.parse(selector).forEach((selector) => {
        const elementNames = selector.element ? [selector.element] : registry.allKnownElementNames();
        const notElementNames = new Set(selector.notSelectors
            .filter((selector) => selector.isElementSelector())
            .map((selector) => selector.element));
        const possibleElementNames = elementNames.filter((elementName) => !notElementNames.has(elementName));
        ctxs.push(...possibleElementNames.map((elementName) => registry.securityContext(elementName, propName, isAttribute)));
    });
    return ctxs.length === 0 ? [SecurityContext.NONE] : Array.from(new Set(ctxs)).sort();
}
/**
 * Compute a new ParseSourceSpan based off an original `sourceSpan` by using
 * absolute offsets from the specified `absoluteSpan`.
 *
 * @param sourceSpan original source span
 * @param absoluteSpan absolute source span to move to
 */
function moveParseSourceSpan(sourceSpan, absoluteSpan) {
    // The difference of two absolute offsets provide the relative offset
    const startDiff = absoluteSpan.start - sourceSpan.start.offset;
    const endDiff = absoluteSpan.end - sourceSpan.end.offset;
    return new ParseSourceSpan(sourceSpan.start.moveBy(startDiff), sourceSpan.end.moveBy(endDiff), sourceSpan.fullStart.moveBy(startDiff), sourceSpan.details);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmluZGluZ19wYXJzZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvdGVtcGxhdGVfcGFyc2VyL2JpbmRpbmdfcGFyc2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFDeEMsT0FBTyxFQUNMLGtCQUFrQixFQUVsQixhQUFhLEVBQ2IsTUFBTSxFQUVOLFdBQVcsRUFDWCxvQkFBb0IsRUFDcEIsV0FBVyxFQUNYLFNBQVMsRUFDVCxTQUFTLEVBQ1QsYUFBYSxFQUNiLFdBQVcsRUFDWCxlQUFlLEVBQ2YsY0FBYyxFQUNkLGtCQUFrQixFQUNsQixjQUFjLEVBRWQsU0FBUyxFQUNULFlBQVksRUFDWixtQkFBbUIsRUFFbkIsZUFBZSxHQUNoQixNQUFNLDBCQUEwQixDQUFDO0FBR2xDLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUVqRCxPQUFPLEVBQUMsVUFBVSxFQUFFLGVBQWUsRUFBRSxlQUFlLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFM0UsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUN4QyxPQUFPLEVBQUMsWUFBWSxFQUFFLGFBQWEsRUFBQyxNQUFNLFNBQVMsQ0FBQztBQUVwRCxNQUFNLHdCQUF3QixHQUFHLEdBQUcsQ0FBQztBQUNyQyxNQUFNLGdCQUFnQixHQUFHLE1BQU0sQ0FBQztBQUNoQyxNQUFNLFlBQVksR0FBRyxPQUFPLENBQUM7QUFDN0IsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDO0FBQzdCLE1BQU0sb0JBQW9CLEdBQUcsR0FBRyxDQUFDO0FBQ2pDLE1BQU0sbUJBQW1CLEdBQUcsVUFBVSxDQUFDO0FBVXZDOztHQUVHO0FBQ0gsTUFBTSxPQUFPLGFBQWE7SUFDeEIsWUFDVSxXQUFtQixFQUNuQixvQkFB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QUFDO0lBQ3pELE9BQU8sSUFBSSxlQUFlLENBQ3hCLFVBQVUsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxFQUNsQyxVQUFVLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFDOUIsVUFBVSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEVBQ3RDLFVBQVUsQ0FBQyxPQUFPLENBQ25CLENBQUM7QUFDSixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1NlY3VyaXR5Q29udGV4dH0gZnJvbSAnLi4vY29yZSc7XG5pbXBvcnQge1xuICBBYnNvbHV0ZVNvdXJjZVNwYW4sXG4gIEFTVCxcbiAgQVNUV2l0aFNvdXJjZSxcbiAgQmluYXJ5LFxuICBCaW5kaW5nUGlwZSxcbiAgQmluZGluZ1R5cGUsXG4gIEJvdW5kRWxlbWVudFByb3BlcnR5LFxuICBDb25kaXRpb25hbCxcbiAgRW1wdHlFeHByLFxuICBLZXllZFJlYWQsXG4gIE5vbk51bGxBc3NlcnQsXG4gIFBhcnNlZEV2ZW50LFxuICBQYXJzZWRFdmVudFR5cGUsXG4gIFBhcnNlZFByb3BlcnR5LFxuICBQYXJzZWRQcm9wZXJ0eVR5cGUsXG4gIFBhcnNlZFZhcmlhYmxlLFxuICBQYXJzZXJFcnJvcixcbiAgUHJlZml4Tm90LFxuICBQcm9wZXJ0eVJlYWQsXG4gIFJlY3Vyc2l2ZUFzdFZpc2l0b3IsXG4gIFRlbXBsYXRlQmluZGluZyxcbiAgVmFyaWFibGVCaW5kaW5nLFxufSBmcm9tICcuLi9leHByZXNzaW9uX3BhcnNlci9hc3QnO1xuaW1wb3J0IHtQYXJzZXJ9IGZyb20gJy4uL2V4cHJlc3Npb25fcGFyc2VyL3BhcnNlcic7XG5pbXBvcnQge0ludGVycG9sYXRpb25Db25maWd9IGZyb20gJy4uL21sX3BhcnNlci9kZWZhdWx0cyc7XG5pbXBvcnQge21lcmdlTnNBbmROYW1lfSBmcm9tICcuLi9tbF9wYXJzZXIvdGFncyc7XG5pbXBvcnQge0ludGVycG9sYXRlZEF0dHJpYnV0ZVRva2VuLCBJbnRlcnBvbGF0ZWRUZXh0VG9rZW59IGZyb20gJy4uL21sX3BhcnNlci90b2tlbnMnO1xuaW1wb3J0IHtQYXJzZUVycm9yLCBQYXJzZUVycm9yTGV2ZWwsIFBhcnNlU291cmNlU3Bhbn0gZnJvbSAnLi4vcGFyc2VfdXRpbCc7XG5pbXBvcnQge0VsZW1lbnRTY2hlbWFSZWdpc3RyeX0gZnJvbSAnLi4vc2NoZW1hL2VsZW1lbnRfc2NoZW1hX3JlZ2lzdHJ5JztcbmltcG9ydCB7Q3NzU2VsZWN0b3J9IGZyb20gJy4uL3NlbGVjdG9yJztcbmltcG9ydCB7c3BsaXRBdENvbG9uLCBzcGxpdEF0UGVyaW9kfSBmcm9tICcuLi91dGlsJztcblxuY29uc3QgUFJPUEVSVFlfUEFSVFNfU0VQQVJBVE9SID0gJy4nO1xuY29uc3QgQVRUUklCVVRFX1BSRUZJWCA9ICdhdHRyJztcbmNvbnN0IENMQVNTX1BSRUZJWCA9ICdjbGFzcyc7XG5jb25zdCBTVFlMRV9QUkVGSVggPSAnc3R5bGUnO1xuY29uc3QgVEVNUExBVEVfQVRUUl9QUkVGSVggPSAnKic7XG5jb25zdCBBTklNQVRFX1BST1BfUFJFRklYID0gJ2FuaW1hdGUtJztcblxuZXhwb3J0IGludGVyZmFjZSBIb3N0UHJvcGVydGllcyB7XG4gIFtrZXk6IHN0cmluZ106IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBIb3N0TGlzdGVuZXJzIHtcbiAgW2tleTogc3RyaW5nXTogc3RyaW5nO1xufVxuXG4vKipcbiAqIFBhcnNlcyBiaW5kaW5ncyBpbiB0ZW1wbGF0ZXMgYW5kIGluIHRoZSBkaXJlY3RpdmUgaG9zdCBhcmVhLlxuICovXG5leHBvcnQgY2xhc3MgQmluZGluZ1BhcnNlciB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgX2V4cHJQYXJzZXI6IFBhcnNlcixcbiAgICBwcml2YXRlIF9pbnRlcnBvbGF0aW9uQ29uZmlnOiBJbnRlcnBvbGF0aW9uQ29uZmlnLFxuICAgIHByaXZhdGUgX3NjaGVtYVJlZ2lzdHJ5OiBFbGVtZW50U2NoZW1hUmVnaXN0cnksXG4gICAgcHVibGljIGVycm9yczogUGFyc2VFcnJvcltdLFxuICAgIHByaXZhdGUgX2FsbG93SW52YWxpZEFzc2lnbm1lbnRFdmVudHMgPSBmYWxzZSxcbiAgKSB7fVxuXG4gIGdldCBpbnRlcnBvbGF0aW9uQ29uZmlnKCk6IEludGVycG9sYXRpb25Db25maWcge1xuICAgIHJldHVybiB0aGlzLl9pbnRlcnBvbGF0aW9uQ29uZmlnO1xuICB9XG5cbiAgY3JlYXRlQm91bmRIb3N0UHJvcGVydGllcyhcbiAgICBwcm9wZXJ0aWVzOiBIb3N0UHJvcGVydGllcyxcbiAgICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICk6IFBhcnNlZFByb3BlcnR5W10gfCBudWxsIHtcbiAgICBjb25zdCBib3VuZFByb3BzOiBQYXJzZWRQcm9wZXJ0eVtdID0gW107XG4gICAgZm9yIChjb25zdCBwcm9wTmFtZSBvZiBPYmplY3Qua2V5cyhwcm9wZXJ0aWVzKSkge1xuICAgICAgY29uc3QgZXhwcmVzc2lvbiA9IHByb3BlcnRpZXNbcHJvcE5hbWVdO1xuICAgICAgaWYgKHR5cGVvZiBleHByZXNzaW9uID09PSAnc3RyaW5nJykge1xuICAgICAgICB0aGlzLnBhcnNlUHJvcGVydHlCaW5kaW5nKFxuICAgICAgICAgIHByb3BOYW1lLFxuICAgICAgICAgIGV4cHJlc3Npb24sXG4gICAgICAgICAgdHJ1ZSxcbiAgICAgICAgICBmYWxzZSxcbiAgICAgICAgICBzb3VyY2VTcGFuLFxuICAgICAgICAgIHNvdXJjZVNwYW4uc3RhcnQub2Zmc2V0LFxuICAgICAgICAgIHVuZGVmaW5lZCxcbiAgICAgICAgICBbXSxcbiAgICAgICAgICAvLyBVc2UgdGhlIGBzb3VyY2VTcGFuYCBmb3IgIGBrZXlTcGFuYC4gVGhpcyBpc24ndCByZWFsbHkgYWNjdXJhdGUsIGJ1dCBuZWl0aGVyIGlzIHRoZVxuICAgICAgICAgIC8vIHNvdXJjZVNwYW4sIGFzIGl0IHJlcHJlc2VudHMgdGhlIHNvdXJjZVNwYW4gb2YgdGhlIGhvc3QgaXRzZWxmIHJhdGhlciB0aGFuIHRoZVxuICAgICAgICAgIC8vIHNvdXJjZSBvZiB0aGUgaG9zdCBiaW5kaW5nICh3aGljaCBkb2Vzbid0IGV4aXN0IGluIHRoZSB0ZW1wbGF0ZSkuIFJlZ2FyZGxlc3MsXG4gICAgICAgICAgLy8gbmVpdGhlciBvZiB0aGVzZSB2YWx1ZXMgYXJlIHVzZWQgaW4gSXZ5IGJ1dCBhcmUgb25seSBoZXJlIHRvIHNhdGlzZnkgdGhlIGZ1bmN0aW9uXG4gICAgICAgICAgLy8gc2lnbmF0dXJlLiBUaGlzIHNob3VsZCBsaWtlbHkgYmUgcmVmYWN0b3JlZCBpbiB0aGUgZnV0dXJlIHNvIHRoYXQgYHNvdXJjZVNwYW5gXG4gICAgICAgICAgLy8gaXNuJ3QgYmVpbmcgdXNlZCBpbmFjY3VyYXRlbHkuXG4gICAgICAgICAgYm91bmRQcm9wcyxcbiAgICAgICAgICBzb3VyY2VTcGFuLFxuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoXG4gICAgICAgICAgYFZhbHVlIG9mIHRoZSBob3N0IHByb3BlcnR5IGJpbmRpbmcgXCIke3Byb3BOYW1lfVwiIG5lZWRzIHRvIGJlIGEgc3RyaW5nIHJlcHJlc2VudGluZyBhbiBleHByZXNzaW9uIGJ1dCBnb3QgXCIke2V4cHJlc3Npb259XCIgKCR7dHlwZW9mIGV4cHJlc3Npb259KWAsXG4gICAgICAgICAgc291cmNlU3BhbixcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGJvdW5kUHJvcHM7XG4gIH1cblxuICBjcmVhdGVEaXJlY3RpdmVIb3N0RXZlbnRBc3RzKFxuICAgIGhvc3RMaXN0ZW5lcnM6IEhvc3RMaXN0ZW5lcnMsXG4gICAgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICApOiBQYXJzZWRFdmVudFtdIHwgbnVsbCB7XG4gICAgY29uc3QgdGFyZ2V0RXZlbnRzOiBQYXJzZWRFdmVudFtdID0gW107XG4gICAgZm9yIChjb25zdCBwcm9wTmFtZSBvZiBPYmplY3Qua2V5cyhob3N0TGlzdGVuZXJzKSkge1xuICAgICAgY29uc3QgZXhwcmVzc2lvbiA9IGhvc3RMaXN0ZW5lcnNbcHJvcE5hbWVdO1xuICAgICAgaWYgKHR5cGVvZiBleHByZXNzaW9uID09PSAnc3RyaW5nJykge1xuICAgICAgICAvLyBVc2UgdGhlIGBzb3VyY2VTcGFuYCBmb3IgIGBrZXlTcGFuYCBhbmQgYGhhbmRsZXJTcGFuYC4gVGhpcyBpc24ndCByZWFsbHkgYWNjdXJhdGUsIGJ1dFxuICAgICAgICAvLyBuZWl0aGVyIGlzIHRoZSBgc291cmNlU3BhbmAsIGFzIGl0IHJlcHJlc2VudHMgdGhlIGBzb3VyY2VTcGFuYCBvZiB0aGUgaG9zdCBpdHNlbGZcbiAgICAgICAgLy8gcmF0aGVyIHRoYW4gdGhlIHNvdXJjZSBvZiB0aGUgaG9zdCBiaW5kaW5nICh3aGljaCBkb2Vzbid0IGV4aXN0IGluIHRoZSB0ZW1wbGF0ZSkuXG4gICAgICAgIC8vIFJlZ2FyZGxlc3MsIG5laXRoZXIgb2YgdGhlc2UgdmFsdWVzIGFyZSB1c2VkIGluIEl2eSBidXQgYXJlIG9ubHkgaGVyZSB0byBzYXRpc2Z5IHRoZVxuICAgICAgICAvLyBmdW5jdGlvbiBzaWduYXR1cmUuIFRoaXMgc2hvdWxkIGxpa2VseSBiZSByZWZhY3RvcmVkIGluIHRoZSBmdXR1cmUgc28gdGhhdCBgc291cmNlU3BhbmBcbiAgICAgICAgLy8gaXNuJ3QgYmVpbmcgdXNlZCBpbmFjY3VyYXRlbHkuXG4gICAgICAgIHRoaXMucGFyc2VFdmVudChcbiAgICAgICAgICBwcm9wTmFtZSxcbiAgICAgICAgICBleHByZXNzaW9uLFxuICAgICAgICAgIC8qIGlzQXNzaWdubWVudEV2ZW50ICovIGZhbHNlLFxuICAgICAgICAgIHNvdXJjZVNwYW4sXG4gICAgICAgICAgc291cmNlU3BhbixcbiAgICAgICAgICBbXSxcbiAgICAgICAgICB0YXJnZXRFdmVudHMsXG4gICAgICAgICAgc291cmNlU3BhbixcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3JlcG9ydEVycm9yKFxuICAgICAgICAgIGBWYWx1ZSBvZiB0aGUgaG9zdCBsaXN0ZW5lciBcIiR7cHJvcE5hbWV9XCIgbmVlZHMgdG8gYmUgYSBzdHJpbmcgcmVwcmVzZW50aW5nIGFuIGV4cHJlc3Npb24gYnV0IGdvdCBcIiR7ZXhwcmVzc2lvbn1cIiAoJHt0eXBlb2YgZXhwcmVzc2lvbn0pYCxcbiAgICAgICAgICBzb3VyY2VTcGFuLFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGFyZ2V0RXZlbnRzO1xuICB9XG5cbiAgcGFyc2VJbnRlcnBvbGF0aW9uKFxuICAgIHZhbHVlOiBzdHJpbmcsXG4gICAgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgIGludGVycG9sYXRlZFRva2VuczogSW50ZXJwb2xhdGVkQXR0cmlidXRlVG9rZW5bXSB8IEludGVycG9sYXRlZFRleHRUb2tlbltdIHwgbnVsbCxcbiAgKTogQVNUV2l0aFNvdXJjZSB7XG4gICAgY29uc3Qgc291cmNlSW5mbyA9IHNvdXJjZVNwYW4uc3RhcnQudG9TdHJpbmcoKTtcbiAgICBjb25zdCBhYnNvbHV0ZU9mZnNldCA9IHNvdXJjZVNwYW4uZnVsbFN0YXJ0Lm9mZnNldDtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBhc3QgPSB0aGlzLl9leHByUGFyc2VyLnBhcnNlSW50ZXJwb2xhdGlvbihcbiAgICAgICAgdmFsdWUsXG4gICAgICAgIHNvdXJjZUluZm8sXG4gICAgICAgIGFic29sdXRlT2Zmc2V0LFxuICAgICAgICBpbnRlcnBvbGF0ZWRUb2tlbnMsXG4gICAgICAgIHRoaXMuX2ludGVycG9sYXRpb25Db25maWcsXG4gICAgICApITtcbiAgICAgIGlmIChhc3QpIHRoaXMuX3JlcG9ydEV4cHJlc3Npb25QYXJzZXJFcnJvcnMoYXN0LmVycm9ycywgc291cmNlU3Bhbik7XG4gICAgICByZXR1cm4gYXN0O1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRoaXMuX3JlcG9ydEVycm9yKGAke2V9YCwgc291cmNlU3Bhbik7XG4gICAgICByZXR1cm4gdGhpcy5fZXhwclBhcnNlci53cmFwTGl0ZXJhbFByaW1pdGl2ZSgnRVJST1InLCBzb3VyY2VJbmZvLCBhYnNvbHV0ZU9mZnNldCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNpbWlsYXIgdG8gYHBhcnNlSW50ZXJwb2xhdGlvbmAsIGJ1dCB0cmVhdHMgdGhlIHByb3ZpZGVkIHN0cmluZyBhcyBhIHNpbmdsZSBleHByZXNzaW9uXG4gICAqIGVsZW1lbnQgdGhhdCB3b3VsZCBub3JtYWxseSBhcHBlYXIgd2l0aGluIHRoZSBpbnRlcnBvbGF0aW9uIHByZWZpeCBhbmQgc3VmZml4IChge3tgIGFuZCBgfX1gKS5cbiAgICogVGhpcyBpcyB1c2VkIGZvciBwYXJzaW5nIHRoZSBzd2l0Y2ggZXhwcmVzc2lvbiBpbiBJQ1VzLlxuICAgKi9cbiAgcGFyc2VJbnRlcnBvbGF0aW9uRXhwcmVzc2lvbihleHByZXNzaW9uOiBzdHJpbmcsIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3Bhbik6IEFTVFdpdGhTb3VyY2Uge1xuICAgIGNvbnN0IHNvdXJjZUluZm8gPSBzb3VyY2VTcGFuLnN0YXJ0LnRvU3RyaW5nKCk7XG4gICAgY29uc3QgYWJzb2x1dGVPZmZzZXQgPSBzb3VyY2VTcGFuLnN0YXJ0Lm9mZnNldDtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBhc3QgPSB0aGlzLl9leHByUGFyc2VyLnBhcnNlSW50ZXJwb2xhdGlvbkV4cHJlc3Npb24oXG4gICAgICAgIGV4cHJlc3Npb24sXG4gICAgICAgIHNvdXJjZUluZm8sXG4gICAgICAgIGFic29sdXRlT2Zmc2V0LFxuICAgICAgKTtcbiAgICAgIGlmIChhc3QpIHRoaXMuX3JlcG9ydEV4cHJlc3Npb25QYXJzZXJFcnJvcnMoYXN0LmVycm9ycywgc291cmNlU3Bhbik7XG4gICAgICByZXR1cm4gYXN0O1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRoaXMuX3JlcG9ydEVycm9yKGAke2V9YCwgc291cmNlU3Bhbik7XG4gICAgICByZXR1cm4gdGhpcy5fZXhwclBhcnNlci53cmFwTGl0ZXJhbFByaW1pdGl2ZSgnRVJST1InLCBzb3VyY2VJbmZvLCBhYnNvbHV0ZU9mZnNldCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFBhcnNlcyB0aGUgYmluZGluZ3MgaW4gYSBtaWNyb3N5bnRheCBleHByZXNzaW9uLCBhbmQgY29udmVydHMgdGhlbSB0b1xuICAgKiBgUGFyc2VkUHJvcGVydHlgIG9yIGBQYXJzZWRWYXJpYWJsZWAuXG4gICAqXG4gICAqIEBwYXJhbSB0cGxLZXkgdGVtcGxhdGUgYmluZGluZyBuYW1lXG4gICAqIEBwYXJhbSB0cGxWYWx1ZSB0ZW1wbGF0ZSBiaW5kaW5nIHZhbHVlXG4gICAqIEBwYXJhbSBzb3VyY2VTcGFuIHNwYW4gb2YgdGVtcGxhdGUgYmluZGluZyByZWxhdGl2ZSB0byBlbnRpcmUgdGhlIHRlbXBsYXRlXG4gICAqIEBwYXJhbSBhYnNvbHV0ZVZhbHVlT2Zmc2V0IHN0YXJ0IG9mIHRoZSB0cGxWYWx1ZSByZWxhdGl2ZSB0byB0aGUgZW50aXJlIHRlbXBsYXRlXG4gICAqIEBwYXJhbSB0YXJnZXRNYXRjaGFibGVBdHRycyBwb3RlbnRpYWwgYXR0cmlidXRlcyB0byBtYXRjaCBpbiB0aGUgdGVtcGxhdGVcbiAgICogQHBhcmFtIHRhcmdldFByb3BzIHRhcmdldCBwcm9wZXJ0eSBiaW5kaW5ncyBpbiB0aGUgdGVtcGxhdGVcbiAgICogQHBhcmFtIHRhcmdldFZhcnMgdGFyZ2V0IHZhcmlhYmxlcyBpbiB0aGUgdGVtcGxhdGVcbiAgICovXG4gIHBhcnNlSW5saW5lVGVtcGxhdGVCaW5kaW5nKFxuICAgIHRwbEtleTogc3RyaW5nLFxuICAgIHRwbFZhbHVlOiBzdHJpbmcsXG4gICAgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgIGFic29sdXRlVmFsdWVPZmZzZXQ6IG51bWJlcixcbiAgICB0YXJnZXRNYXRjaGFibGVBdHRyczogc3RyaW5nW11bXSxcbiAgICB0YXJnZXRQcm9wczogUGFyc2VkUHJvcGVydHlbXSxcbiAgICB0YXJnZXRWYXJzOiBQYXJzZWRWYXJpYWJsZVtdLFxuICAgIGlzSXZ5QXN0OiBib29sZWFuLFxuICApIHtcbiAgICBjb25zdCBhYnNvbHV0ZUtleU9mZnNldCA9IHNvdXJjZVNwYW4uc3RhcnQub2Zmc2V0ICsgVEVNUExBVEVfQVRUUl9QUkVGSVgubGVuZ3RoO1xuICAgIGNvbnN0IGJpbmRpbmdzID0gdGhpcy5fcGFyc2VUZW1wbGF0ZUJpbmRpbmdzKFxuICAgICAgdHBsS2V5LFxuICAgICAgdHBsVmFsdWUsXG4gICAgICBzb3VyY2VTcGFuLFxuICAgICAgYWJzb2x1dGVLZXlPZmZzZXQsXG4gICAgICBhYnNvbHV0ZVZhbHVlT2Zmc2V0LFxuICAgICk7XG5cbiAgICBmb3IgKGNvbnN0IGJpbmRpbmcgb2YgYmluZGluZ3MpIHtcbiAgICAgIC8vIHNvdXJjZVNwYW4gaXMgZm9yIHRoZSBlbnRpcmUgSFRNTCBhdHRyaWJ1dGUuIGJpbmRpbmdTcGFuIGlzIGZvciBhIHBhcnRpY3VsYXJcbiAgICAgIC8vIGJpbmRpbmcgd2l0aGluIHRoZSBtaWNyb3N5bnRheCBleHByZXNzaW9uIHNvIGl0J3MgbW9yZSBuYXJyb3cgdGhhbiBzb3VyY2VTcGFuLlxuICAgICAgY29uc3QgYmluZGluZ1NwYW4gPSBtb3ZlUGFyc2VTb3VyY2VTcGFuKHNvdXJjZVNwYW4sIGJpbmRpbmcuc291cmNlU3Bhbik7XG4gICAgICBjb25zdCBrZXkgPSBiaW5kaW5nLmtleS5zb3VyY2U7XG4gICAgICBjb25zdCBrZXlTcGFuID0gbW92ZVBhcnNlU291cmNlU3Bhbihzb3VyY2VTcGFuLCBiaW5kaW5nLmtleS5zcGFuKTtcbiAgICAgIGlmIChiaW5kaW5nIGluc3RhbmNlb2YgVmFyaWFibGVCaW5kaW5nKSB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gYmluZGluZy52YWx1ZSA/IGJpbmRpbmcudmFsdWUuc291cmNlIDogJyRpbXBsaWNpdCc7XG4gICAgICAgIGNvbnN0IHZhbHVlU3BhbiA9IGJpbmRpbmcudmFsdWVcbiAgICAgICAgICA/IG1vdmVQYXJzZVNvdXJjZVNwYW4oc291cmNlU3BhbiwgYmluZGluZy52YWx1ZS5zcGFuKVxuICAgICAgICAgIDogdW5kZWZpbmVkO1xuICAgICAgICB0YXJnZXRWYXJzLnB1c2gobmV3IFBhcnNlZFZhcmlhYmxlKGtleSwgdmFsdWUsIGJpbmRpbmdTcGFuLCBrZXlTcGFuLCB2YWx1ZVNwYW4pKTtcbiAgICAgIH0gZWxzZSBpZiAoYmluZGluZy52YWx1ZSkge1xuICAgICAgICBjb25zdCBzcmNTcGFuID0gaXNJdnlBc3QgPyBiaW5kaW5nU3BhbiA6IHNvdXJjZVNwYW47XG4gICAgICAgIGNvbnN0IHZhbHVlU3BhbiA9IG1vdmVQYXJzZVNvdXJjZVNwYW4oc291cmNlU3BhbiwgYmluZGluZy52YWx1ZS5hc3Quc291cmNlU3Bhbik7XG4gICAgICAgIHRoaXMuX3BhcnNlUHJvcGVydHlBc3QoXG4gICAgICAgICAga2V5LFxuICAgICAgICAgIGJpbmRpbmcudmFsdWUsXG4gICAgICAgICAgZmFsc2UsXG4gICAgICAgICAgc3JjU3BhbixcbiAgICAgICAgICBrZXlTcGFuLFxuICAgICAgICAgIHZhbHVlU3BhbixcbiAgICAgICAgICB0YXJnZXRNYXRjaGFibGVBdHRycyxcbiAgICAgICAgICB0YXJnZXRQcm9wcyxcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRhcmdldE1hdGNoYWJsZUF0dHJzLnB1c2goW2tleSwgJycgLyogdmFsdWUgKi9dKTtcbiAgICAgICAgLy8gU2luY2UgdGhpcyBpcyBhIGxpdGVyYWwgYXR0cmlidXRlIHdpdGggbm8gUkhTLCBzb3VyY2Ugc3BhbiBzaG91bGQgYmVcbiAgICAgICAgLy8ganVzdCB0aGUga2V5IHNwYW4uXG4gICAgICAgIHRoaXMucGFyc2VMaXRlcmFsQXR0cihcbiAgICAgICAgICBrZXksXG4gICAgICAgICAgbnVsbCAvKiB2YWx1ZSAqLyxcbiAgICAgICAgICBrZXlTcGFuLFxuICAgICAgICAgIGFic29sdXRlVmFsdWVPZmZzZXQsXG4gICAgICAgICAgdW5kZWZpbmVkIC8qIHZhbHVlU3BhbiAqLyxcbiAgICAgICAgICB0YXJnZXRNYXRjaGFibGVBdHRycyxcbiAgICAgICAgICB0YXJnZXRQcm9wcyxcbiAgICAgICAgICBrZXlTcGFuLFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBQYXJzZXMgdGhlIGJpbmRpbmdzIGluIGEgbWljcm9zeW50YXggZXhwcmVzc2lvbiwgZS5nLlxuICAgKiBgYGBcbiAgICogICAgPHRhZyAqdHBsS2V5PVwibGV0IHZhbHVlMSA9IHByb3A7IGxldCB2YWx1ZTIgPSBsb2NhbFZhclwiPlxuICAgKiBgYGBcbiAgICpcbiAgICogQHBhcmFtIHRwbEtleSB0ZW1wbGF0ZSBiaW5kaW5nIG5hbWVcbiAgICogQHBhcmFtIHRwbFZhbHVlIHRlbXBsYXRlIGJpbmRpbmcgdmFsdWVcbiAgICogQHBhcmFtIHNvdXJjZVNwYW4gc3BhbiBvZiB0ZW1wbGF0ZSBiaW5kaW5nIHJlbGF0aXZlIHRvIGVudGlyZSB0aGUgdGVtcGxhdGVcbiAgICogQHBhcmFtIGFic29sdXRlS2V5T2Zmc2V0IHN0YXJ0IG9mIHRoZSBgdHBsS2V5YFxuICAgKiBAcGFyYW0gYWJzb2x1dGVWYWx1ZU9mZnNldCBzdGFydCBvZiB0aGUgYHRwbFZhbHVlYFxuICAgKi9cbiAgcHJpdmF0ZSBfcGFyc2VUZW1wbGF0ZUJpbmRpbmdzKFxuICAgIHRwbEtleTogc3RyaW5nLFxuICAgIHRwbFZhbHVlOiBzdHJpbmcsXG4gICAgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgIGFic29sdXRlS2V5T2Zmc2V0OiBudW1iZXIsXG4gICAgYWJzb2x1dGVWYWx1ZU9mZnNldDogbnVtYmVyLFxuICApOiBUZW1wbGF0ZUJpbmRpbmdbXSB7XG4gICAgY29uc3Qgc291cmNlSW5mbyA9IHNvdXJjZVNwYW4uc3RhcnQudG9TdHJpbmcoKTtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBiaW5kaW5nc1Jlc3VsdCA9IHRoaXMuX2V4cHJQYXJzZXIucGFyc2VUZW1wbGF0ZUJpbmRpbmdzKFxuICAgICAgICB0cGxLZXksXG4gICAgICAgIHRwbFZhbHVlLFxuICAgICAgICBzb3VyY2VJbmZvLFxuICAgICAgICBhYnNvbHV0ZUtleU9mZnNldCxcbiAgICAgICAgYWJzb2x1dGVWYWx1ZU9mZnNldCxcbiAgICAgICk7XG4gICAgICB0aGlzLl9yZXBvcnRFeHByZXNzaW9uUGFyc2VyRXJyb3JzKGJpbmRpbmdzUmVzdWx0LmVycm9ycywgc291cmNlU3Bhbik7XG4gICAgICBiaW5kaW5nc1Jlc3VsdC53YXJuaW5ncy5mb3JFYWNoKCh3YXJuaW5nKSA9PiB7XG4gICAgICAgIHRoaXMuX3JlcG9ydEVycm9yKHdhcm5pbmcsIHNvdXJjZVNwYW4sIFBhcnNlRXJyb3JMZXZlbC5XQVJOSU5HKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGJpbmRpbmdzUmVzdWx0LnRlbXBsYXRlQmluZGluZ3M7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoYCR7ZX1gLCBzb3VyY2VTcGFuKTtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gIH1cblxuICBwYXJzZUxpdGVyYWxBdHRyKFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICB2YWx1ZTogc3RyaW5nIHwgbnVsbCxcbiAgICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgYWJzb2x1dGVPZmZzZXQ6IG51bWJlcixcbiAgICB2YWx1ZVNwYW46IFBhcnNlU291cmNlU3BhbiB8IHVuZGVmaW5lZCxcbiAgICB0YXJnZXRNYXRjaGFibGVBdHRyczogc3RyaW5nW11bXSxcbiAgICB0YXJnZXRQcm9wczogUGFyc2VkUHJvcGVydHlbXSxcbiAgICBrZXlTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICkge1xuICAgIGlmIChpc0FuaW1hdGlvbkxhYmVsKG5hbWUpKSB7XG4gICAgICBuYW1lID0gbmFtZS5zdWJzdHJpbmcoMSk7XG4gICAgICBpZiAoa2V5U3BhbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGtleVNwYW4gPSBtb3ZlUGFyc2VTb3VyY2VTcGFuKFxuICAgICAgICAgIGtleVNwYW4sXG4gICAgICAgICAgbmV3IEFic29sdXRlU291cmNlU3BhbihrZXlTcGFuLnN0YXJ0Lm9mZnNldCArIDEsIGtleVNwYW4uZW5kLm9mZnNldCksXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoXG4gICAgICAgICAgYEFzc2lnbmluZyBhbmltYXRpb24gdHJpZ2dlcnMgdmlhIEBwcm9wPVwiZXhwXCIgYXR0cmlidXRlcyB3aXRoIGFuIGV4cHJlc3Npb24gaXMgaW52YWxpZC5gICtcbiAgICAgICAgICAgIGAgVXNlIHByb3BlcnR5IGJpbmRpbmdzIChlLmcuIFtAcHJvcF09XCJleHBcIikgb3IgdXNlIGFuIGF0dHJpYnV0ZSB3aXRob3V0IGEgdmFsdWUgKGUuZy4gQHByb3ApIGluc3RlYWQuYCxcbiAgICAgICAgICBzb3VyY2VTcGFuLFxuICAgICAgICAgIFBhcnNlRXJyb3JMZXZlbC5FUlJPUixcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX3BhcnNlQW5pbWF0aW9uKFxuICAgICAgICBuYW1lLFxuICAgICAgICB2YWx1ZSxcbiAgICAgICAgc291cmNlU3BhbixcbiAgICAgICAgYWJzb2x1dGVPZmZzZXQsXG4gICAgICAgIGtleVNwYW4sXG4gICAgICAgIHZhbHVlU3BhbixcbiAgICAgICAgdGFyZ2V0TWF0Y2hhYmxlQXR0cnMsXG4gICAgICAgIHRhcmdldFByb3BzLFxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGFyZ2V0UHJvcHMucHVzaChcbiAgICAgICAgbmV3IFBhcnNlZFByb3BlcnR5KFxuICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgdGhpcy5fZXhwclBhcnNlci53cmFwTGl0ZXJhbFByaW1pdGl2ZSh2YWx1ZSwgJycsIGFic29sdXRlT2Zmc2V0KSxcbiAgICAgICAgICBQYXJzZWRQcm9wZXJ0eVR5cGUuTElURVJBTF9BVFRSLFxuICAgICAgICAgIHNvdXJjZVNwYW4sXG4gICAgICAgICAga2V5U3BhbixcbiAgICAgICAgICB2YWx1ZVNwYW4sXG4gICAgICAgICksXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIHBhcnNlUHJvcGVydHlCaW5kaW5nKFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBleHByZXNzaW9uOiBzdHJpbmcsXG4gICAgaXNIb3N0OiBib29sZWFuLFxuICAgIGlzUGFydE9mQXNzaWdubWVudEJpbmRpbmc6IGJvb2xlYW4sXG4gICAgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgIGFic29sdXRlT2Zmc2V0OiBudW1iZXIsXG4gICAgdmFsdWVTcGFuOiBQYXJzZVNvdXJjZVNwYW4gfCB1bmRlZmluZWQsXG4gICAgdGFyZ2V0TWF0Y2hhYmxlQXR0cnM6IHN0cmluZ1tdW10sXG4gICAgdGFyZ2V0UHJvcHM6IFBhcnNlZFByb3BlcnR5W10sXG4gICAga2V5U3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICApIHtcbiAgICBpZiAobmFtZS5sZW5ndGggPT09IDApIHtcbiAgICAgIHRoaXMuX3JlcG9ydEVycm9yKGBQcm9wZXJ0eSBuYW1lIGlzIG1pc3NpbmcgaW4gYmluZGluZ2AsIHNvdXJjZVNwYW4pO1xuICAgIH1cblxuICAgIGxldCBpc0FuaW1hdGlvblByb3AgPSBmYWxzZTtcbiAgICBpZiAobmFtZS5zdGFydHNXaXRoKEFOSU1BVEVfUFJPUF9QUkVGSVgpKSB7XG4gICAgICBpc0FuaW1hdGlvblByb3AgPSB0cnVlO1xuICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyaW5nKEFOSU1BVEVfUFJPUF9QUkVGSVgubGVuZ3RoKTtcbiAgICAgIGlmIChrZXlTcGFuICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAga2V5U3BhbiA9IG1vdmVQYXJzZVNvdXJjZVNwYW4oXG4gICAgICAgICAga2V5U3BhbixcbiAgICAgICAgICBuZXcgQWJzb2x1dGVTb3VyY2VTcGFuKFxuICAgICAgICAgICAga2V5U3Bhbi5zdGFydC5vZmZzZXQgKyBBTklNQVRFX1BST1BfUFJFRklYLmxlbmd0aCxcbiAgICAgICAgICAgIGtleVNwYW4uZW5kLm9mZnNldCxcbiAgICAgICAgICApLFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoaXNBbmltYXRpb25MYWJlbChuYW1lKSkge1xuICAgICAgaXNBbmltYXRpb25Qcm9wID0gdHJ1ZTtcbiAgICAgIG5hbWUgPSBuYW1lLnN1YnN0cmluZygxKTtcbiAgICAgIGlmIChrZXlTcGFuICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAga2V5U3BhbiA9IG1vdmVQYXJzZVNvdXJjZVNwYW4oXG4gICAgICAgICAga2V5U3BhbixcbiAgICAgICAgICBuZXcgQWJzb2x1dGVTb3VyY2VTcGFuKGtleVNwYW4uc3RhcnQub2Zmc2V0ICsgMSwga2V5U3Bhbi5lbmQub2Zmc2V0KSxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoaXNBbmltYXRpb25Qcm9wKSB7XG4gICAgICB0aGlzLl9wYXJzZUFuaW1hdGlvbihcbiAgICAgICAgbmFtZSxcbiAgICAgICAgZXhwcmVzc2lvbixcbiAgICAgICAgc291cmNlU3BhbixcbiAgICAgICAgYWJzb2x1dGVPZmZzZXQsXG4gICAgICAgIGtleVNwYW4sXG4gICAgICAgIHZhbHVlU3BhbixcbiAgICAgICAgdGFyZ2V0TWF0Y2hhYmxlQXR0cnMsXG4gICAgICAgIHRhcmdldFByb3BzLFxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fcGFyc2VQcm9wZXJ0eUFzdChcbiAgICAgICAgbmFtZSxcbiAgICAgICAgdGhpcy5wYXJzZUJpbmRpbmcoZXhwcmVzc2lvbiwgaXNIb3N0LCB2YWx1ZVNwYW4gfHwgc291cmNlU3BhbiwgYWJzb2x1dGVPZmZzZXQpLFxuICAgICAgICBpc1BhcnRPZkFzc2lnbm1lbnRCaW5kaW5nLFxuICAgICAgICBzb3VyY2VTcGFuLFxuICAgICAgICBrZXlTcGFuLFxuICAgICAgICB2YWx1ZVNwYW4sXG4gICAgICAgIHRhcmdldE1hdGNoYWJsZUF0dHJzLFxuICAgICAgICB0YXJnZXRQcm9wcyxcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgcGFyc2VQcm9wZXJ0eUludGVycG9sYXRpb24oXG4gICAgbmFtZTogc3RyaW5nLFxuICAgIHZhbHVlOiBzdHJpbmcsXG4gICAgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgIHZhbHVlU3BhbjogUGFyc2VTb3VyY2VTcGFuIHwgdW5kZWZpbmVkLFxuICAgIHRhcmdldE1hdGNoYWJsZUF0dHJzOiBzdHJpbmdbXVtdLFxuICAgIHRhcmdldFByb3BzOiBQYXJzZWRQcm9wZXJ0eVtdLFxuICAgIGtleVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICBpbnRlcnBvbGF0ZWRUb2tlbnM6IEludGVycG9sYXRlZEF0dHJpYnV0ZVRva2VuW10gfCBJbnRlcnBvbGF0ZWRUZXh0VG9rZW5bXSB8IG51bGwsXG4gICk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGV4cHIgPSB0aGlzLnBhcnNlSW50ZXJwb2xhdGlvbih2YWx1ZSwgdmFsdWVTcGFuIHx8IHNvdXJjZVNwYW4sIGludGVycG9sYXRlZFRva2Vucyk7XG4gICAgaWYgKGV4cHIpIHtcbiAgICAgIHRoaXMuX3BhcnNlUHJvcGVydHlBc3QoXG4gICAgICAgIG5hbWUsXG4gICAgICAgIGV4cHIsXG4gICAgICAgIGZhbHNlLFxuICAgICAgICBzb3VyY2VTcGFuLFxuICAgICAgICBrZXlTcGFuLFxuICAgICAgICB2YWx1ZVNwYW4sXG4gICAgICAgIHRhcmdldE1hdGNoYWJsZUF0dHJzLFxuICAgICAgICB0YXJnZXRQcm9wcyxcbiAgICAgICk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcHJpdmF0ZSBfcGFyc2VQcm9wZXJ0eUFzdChcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgYXN0OiBBU1RXaXRoU291cmNlLFxuICAgIGlzUGFydE9mQXNzaWdubWVudEJpbmRpbmc6IGJvb2xlYW4sXG4gICAgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgIGtleVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICB2YWx1ZVNwYW46IFBhcnNlU291cmNlU3BhbiB8IHVuZGVmaW5lZCxcbiAgICB0YXJnZXRNYXRjaGFibGVBdHRyczogc3RyaW5nW11bXSxcbiAgICB0YXJnZXRQcm9wczogUGFyc2VkUHJvcGVydHlbXSxcbiAgKSB7XG4gICAgdGFyZ2V0TWF0Y2hhYmxlQXR0cnMucHVzaChbbmFtZSwgYXN0LnNvdXJjZSFdKTtcbiAgICB0YXJnZXRQcm9wcy5wdXNoKFxuICAgICAgbmV3IFBhcnNlZFByb3BlcnR5KFxuICAgICAgICBuYW1lLFxuICAgICAgICBhc3QsXG4gICAgICAgIGlzUGFydE9mQXNzaWdubWVudEJpbmRpbmcgPyBQYXJzZWRQcm9wZXJ0eVR5cGUuVFdPX1dBWSA6IFBhcnNlZFByb3BlcnR5VHlwZS5ERUZBVUxULFxuICAgICAgICBzb3VyY2VTcGFuLFxuICAgICAgICBrZXlTcGFuLFxuICAgICAgICB2YWx1ZVNwYW4sXG4gICAgICApLFxuICAgICk7XG4gIH1cblxuICBwcml2YXRlIF9wYXJzZUFuaW1hdGlvbihcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgZXhwcmVzc2lvbjogc3RyaW5nIHwgbnVsbCxcbiAgICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgYWJzb2x1dGVPZmZzZXQ6IG51bWJlcixcbiAgICBrZXlTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgdmFsdWVTcGFuOiBQYXJzZVNvdXJjZVNwYW4gfCB1bmRlZmluZWQsXG4gICAgdGFyZ2V0TWF0Y2hhYmxlQXR0cnM6IHN0cmluZ1tdW10sXG4gICAgdGFyZ2V0UHJvcHM6IFBhcnNlZFByb3BlcnR5W10sXG4gICkge1xuICAgIGlmIChuYW1lLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoJ0FuaW1hdGlvbiB0cmlnZ2VyIGlzIG1pc3NpbmcnLCBzb3VyY2VTcGFuKTtcbiAgICB9XG5cbiAgICAvLyBUaGlzIHdpbGwgb2NjdXIgd2hlbiBhIEB0cmlnZ2VyIGlzIG5vdCBwYWlyZWQgd2l0aCBhbiBleHByZXNzaW9uLlxuICAgIC8vIEZvciBhbmltYXRpb25zIGl0IGlzIHZhbGlkIHRvIG5vdCBoYXZlIGFuIGV4cHJlc3Npb24gc2luY2UgKi92b2lkXG4gICAgLy8gc3RhdGVzIHdpbGwgYmUgYXBwbGllZCBieSBhbmd1bGFyIHdoZW4gdGhlIGVsZW1lbnQgaXMgYXR0YWNoZWQvZGV0YWNoZWRcbiAgICBjb25zdCBhc3QgPSB0aGlzLnBhcnNlQmluZGluZyhcbiAgICAgIGV4cHJlc3Npb24gfHwgJ3VuZGVmaW5lZCcsXG4gICAgICBmYWxzZSxcbiAgICAgIHZhbHVlU3BhbiB8fCBzb3VyY2VTcGFuLFxuICAgICAgYWJzb2x1dGVPZmZzZXQsXG4gICAgKTtcbiAgICB0YXJnZXRNYXRjaGFibGVBdHRycy5wdXNoKFtuYW1lLCBhc3Quc291cmNlIV0pO1xuICAgIHRhcmdldFByb3BzLnB1c2goXG4gICAgICBuZXcgUGFyc2VkUHJvcGVydHkobmFtZSwgYXN0LCBQYXJzZWRQcm9wZXJ0eVR5cGUuQU5JTUFUSU9OLCBzb3VyY2VTcGFuLCBrZXlTcGFuLCB2YWx1ZVNwYW4pLFxuICAgICk7XG4gIH1cblxuICBwYXJzZUJpbmRpbmcoXG4gICAgdmFsdWU6IHN0cmluZyxcbiAgICBpc0hvc3RCaW5kaW5nOiBib29sZWFuLFxuICAgIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICBhYnNvbHV0ZU9mZnNldDogbnVtYmVyLFxuICApOiBBU1RXaXRoU291cmNlIHtcbiAgICBjb25zdCBzb3VyY2VJbmZvID0gKChzb3VyY2VTcGFuICYmIHNvdXJjZVNwYW4uc3RhcnQpIHx8ICcodW5rbm93biknKS50b1N0cmluZygpO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGFzdCA9IGlzSG9zdEJpbmRpbmdcbiAgICAgICAgPyB0aGlzLl9leHByUGFyc2VyLnBhcnNlU2ltcGxlQmluZGluZyhcbiAgICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgICAgc291cmNlSW5mbyxcbiAgICAgICAgICAgIGFic29sdXRlT2Zmc2V0LFxuICAgICAgICAgICAgdGhpcy5faW50ZXJwb2xhdGlvbkNvbmZpZyxcbiAgICAgICAgICApXG4gICAgICAgIDogdGhpcy5fZXhwclBhcnNlci5wYXJzZUJpbmRpbmcoXG4gICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgIHNvdXJjZUluZm8sXG4gICAgICAgICAgICBhYnNvbHV0ZU9mZnNldCxcbiAgICAgICAgICAgIHRoaXMuX2ludGVycG9sYXRpb25Db25maWcsXG4gICAgICAgICAgKTtcbiAgICAgIGlmIChhc3QpIHRoaXMuX3JlcG9ydEV4cHJlc3Npb25QYXJzZXJFcnJvcnMoYXN0LmVycm9ycywgc291cmNlU3Bhbik7XG4gICAgICByZXR1cm4gYXN0O1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRoaXMuX3JlcG9ydEVycm9yKGAke2V9YCwgc291cmNlU3Bhbik7XG4gICAgICByZXR1cm4gdGhpcy5fZXhwclBhcnNlci53cmFwTGl0ZXJhbFByaW1pdGl2ZSgnRVJST1InLCBzb3VyY2VJbmZvLCBhYnNvbHV0ZU9mZnNldCk7XG4gICAgfVxuICB9XG5cbiAgY3JlYXRlQm91bmRFbGVtZW50UHJvcGVydHkoXG4gICAgZWxlbWVudFNlbGVjdG9yOiBzdHJpbmcsXG4gICAgYm91bmRQcm9wOiBQYXJzZWRQcm9wZXJ0eSxcbiAgICBza2lwVmFsaWRhdGlvbjogYm9vbGVhbiA9IGZhbHNlLFxuICAgIG1hcFByb3BlcnR5TmFtZTogYm9vbGVhbiA9IHRydWUsXG4gICk6IEJvdW5kRWxlbWVudFByb3BlcnR5IHtcbiAgICBpZiAoYm91bmRQcm9wLmlzQW5pbWF0aW9uKSB7XG4gICAgICByZXR1cm4gbmV3IEJvdW5kRWxlbWVudFByb3BlcnR5KFxuICAgICAgICBib3VuZFByb3AubmFtZSxcbiAgICAgICAgQmluZGluZ1R5cGUuQW5pbWF0aW9uLFxuICAgICAgICBTZWN1cml0eUNvbnRleHQuTk9ORSxcbiAgICAgICAgYm91bmRQcm9wLmV4cHJlc3Npb24sXG4gICAgICAgIG51bGwsXG4gICAgICAgIGJvdW5kUHJvcC5zb3VyY2VTcGFuLFxuICAgICAgICBib3VuZFByb3Aua2V5U3BhbixcbiAgICAgICAgYm91bmRQcm9wLnZhbHVlU3BhbixcbiAgICAgICk7XG4gICAgfVxuXG4gICAgbGV0IHVuaXQ6IHN0cmluZyB8IG51bGwgPSBudWxsO1xuICAgIGxldCBiaW5kaW5nVHlwZTogQmluZGluZ1R5cGUgPSB1bmRlZmluZWQhO1xuICAgIGxldCBib3VuZFByb3BlcnR5TmFtZTogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG4gICAgY29uc3QgcGFydHMgPSBib3VuZFByb3AubmFtZS5zcGxpdChQUk9QRVJUWV9QQVJUU19TRVBBUkFUT1IpO1xuICAgIGxldCBzZWN1cml0eUNvbnRleHRzOiBTZWN1cml0eUNvbnRleHRbXSA9IHVuZGVmaW5lZCE7XG5cbiAgICAvLyBDaGVjayBmb3Igc3BlY2lhbCBjYXNlcyAocHJlZml4IHN0eWxlLCBhdHRyLCBjbGFzcylcbiAgICBpZiAocGFydHMubGVuZ3RoID4gMSkge1xuICAgICAgaWYgKHBhcnRzWzBdID09IEFUVFJJQlVURV9QUkVGSVgpIHtcbiAgICAgICAgYm91bmRQcm9wZXJ0eU5hbWUgPSBwYXJ0cy5zbGljZSgxKS5qb2luKFBST1BFUlRZX1BBUlRTX1NFUEFSQVRPUik7XG4gICAgICAgIGlmICghc2tpcFZhbGlkYXRpb24pIHtcbiAgICAgICAgICB0aGlzLl92YWxpZGF0ZVByb3BlcnR5T3JBdHRyaWJ1dGVOYW1lKGJvdW5kUHJvcGVydHlOYW1lLCBib3VuZFByb3Auc291cmNlU3BhbiwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgc2VjdXJpdHlDb250ZXh0cyA9IGNhbGNQb3NzaWJsZVNlY3VyaXR5Q29udGV4dHMoXG4gICAgICAgICAgdGhpcy5fc2NoZW1hUmVnaXN0cnksXG4gICAgICAgICAgZWxlbWVudFNlbGVjdG9yLFxuICAgICAgICAgIGJvdW5kUHJvcGVydHlOYW1lLFxuICAgICAgICAgIHRydWUsXG4gICAgICAgICk7XG5cbiAgICAgICAgY29uc3QgbnNTZXBhcmF0b3JJZHggPSBib3VuZFByb3BlcnR5TmFtZS5pbmRleE9mKCc6Jyk7XG4gICAgICAgIGlmIChuc1NlcGFyYXRvcklkeCA+IC0xKSB7XG4gICAgICAgICAgY29uc3QgbnMgPSBib3VuZFByb3BlcnR5TmFtZS5zdWJzdHJpbmcoMCwgbnNTZXBhcmF0b3JJZHgpO1xuICAgICAgICAgIGNvbnN0IG5hbWUgPSBib3VuZFByb3BlcnR5TmFtZS5zdWJzdHJpbmcobnNTZXBhcmF0b3JJZHggKyAxKTtcbiAgICAgICAgICBib3VuZFByb3BlcnR5TmFtZSA9IG1lcmdlTnNBbmROYW1lKG5zLCBuYW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGJpbmRpbmdUeXBlID0gQmluZGluZ1R5cGUuQXR0cmlidXRlO1xuICAgICAgfSBlbHNlIGlmIChwYXJ0c1swXSA9PSBDTEFTU19QUkVGSVgpIHtcbiAgICAgICAgYm91bmRQcm9wZXJ0eU5hbWUgPSBwYXJ0c1sxXTtcbiAgICAgICAgYmluZGluZ1R5cGUgPSBCaW5kaW5nVHlwZS5DbGFzcztcbiAgICAgICAgc2VjdXJpdHlDb250ZXh0cyA9IFtTZWN1cml0eUNvbnRleHQuTk9ORV07XG4gICAgICB9IGVsc2UgaWYgKHBhcnRzWzBdID09IFNUWUxFX1BSRUZJWCkge1xuICAgICAgICB1bml0ID0gcGFydHMubGVuZ3RoID4gMiA/IHBhcnRzWzJdIDogbnVsbDtcbiAgICAgICAgYm91bmRQcm9wZXJ0eU5hbWUgPSBwYXJ0c1sxXTtcbiAgICAgICAgYmluZGluZ1R5cGUgPSBCaW5kaW5nVHlwZS5TdHlsZTtcbiAgICAgICAgc2VjdXJpdHlDb250ZXh0cyA9IFtTZWN1cml0eUNvbnRleHQuU1RZTEVdO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIElmIG5vdCBhIHNwZWNpYWwgY2FzZSwgdXNlIHRoZSBmdWxsIHByb3BlcnR5IG5hbWVcbiAgICBpZiAoYm91bmRQcm9wZXJ0eU5hbWUgPT09IG51bGwpIHtcbiAgICAgIGNvbnN0IG1hcHBlZFByb3BOYW1lID0gdGhpcy5fc2NoZW1hUmVnaXN0cnkuZ2V0TWFwcGVkUHJvcE5hbWUoYm91bmRQcm9wLm5hbWUpO1xuICAgICAgYm91bmRQcm9wZXJ0eU5hbWUgPSBtYXBQcm9wZXJ0eU5hbWUgPyBtYXBwZWRQcm9wTmFtZSA6IGJvdW5kUHJvcC5uYW1lO1xuICAgICAgc2VjdXJpdHlDb250ZXh0cyA9IGNhbGNQb3NzaWJsZVNlY3VyaXR5Q29udGV4dHMoXG4gICAgICAgIHRoaXMuX3NjaGVtYVJlZ2lzdHJ5LFxuICAgICAgICBlbGVtZW50U2VsZWN0b3IsXG4gICAgICAgIG1hcHBlZFByb3BOYW1lLFxuICAgICAgICBmYWxzZSxcbiAgICAgICk7XG4gICAgICBiaW5kaW5nVHlwZSA9XG4gICAgICAgIGJvdW5kUHJvcC50eXBlID09PSBQYXJzZWRQcm9wZXJ0eVR5cGUuVFdPX1dBWSA/IEJpbmRpbmdUeXBlLlR3b1dheSA6IEJpbmRpbmdUeXBlLlByb3BlcnR5O1xuICAgICAgaWYgKCFza2lwVmFsaWRhdGlvbikge1xuICAgICAgICB0aGlzLl92YWxpZGF0ZVByb3BlcnR5T3JBdHRyaWJ1dGVOYW1lKG1hcHBlZFByb3BOYW1lLCBib3VuZFByb3Auc291cmNlU3BhbiwgZmFsc2UpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBuZXcgQm91bmRFbGVtZW50UHJvcGVydHkoXG4gICAgICBib3VuZFByb3BlcnR5TmFtZSxcbiAgICAgIGJpbmRpbmdUeXBlLFxuICAgICAgc2VjdXJpdHlDb250ZXh0c1swXSxcbiAgICAgIGJvdW5kUHJvcC5leHByZXNzaW9uLFxuICAgICAgdW5pdCxcbiAgICAgIGJvdW5kUHJvcC5zb3VyY2VTcGFuLFxuICAgICAgYm91bmRQcm9wLmtleVNwYW4sXG4gICAgICBib3VuZFByb3AudmFsdWVTcGFuLFxuICAgICk7XG4gIH1cblxuICAvLyBUT0RPOiBrZXlTcGFuIHNob3VsZCBiZSByZXF1aXJlZCBidXQgd2FzIG1hZGUgb3B0aW9uYWwgdG8gYXZvaWQgY2hhbmdpbmcgVkUgcGFyc2VyLlxuICBwYXJzZUV2ZW50KFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBleHByZXNzaW9uOiBzdHJpbmcsXG4gICAgaXNBc3NpZ25tZW50RXZlbnQ6IGJvb2xlYW4sXG4gICAgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgIGhhbmRsZXJTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgdGFyZ2V0TWF0Y2hhYmxlQXR0cnM6IHN0cmluZ1tdW10sXG4gICAgdGFyZ2V0RXZlbnRzOiBQYXJzZWRFdmVudFtdLFxuICAgIGtleVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgKSB7XG4gICAgaWYgKG5hbWUubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aGlzLl9yZXBvcnRFcnJvcihgRXZlbnQgbmFtZSBpcyBtaXNzaW5nIGluIGJpbmRpbmdgLCBzb3VyY2VTcGFuKTtcbiAgICB9XG5cbiAgICBpZiAoaXNBbmltYXRpb25MYWJlbChuYW1lKSkge1xuICAgICAgbmFtZSA9IG5hbWUuc2xpY2UoMSk7XG4gICAgICBpZiAoa2V5U3BhbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGtleVNwYW4gPSBtb3ZlUGFyc2VTb3VyY2VTcGFuKFxuICAgICAgICAgIGtleVNwYW4sXG4gICAgICAgICAgbmV3IEFic29sdXRlU291cmNlU3BhbihrZXlTcGFuLnN0YXJ0Lm9mZnNldCArIDEsIGtleVNwYW4uZW5kLm9mZnNldCksXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICB0aGlzLl9wYXJzZUFuaW1hdGlvbkV2ZW50KG5hbWUsIGV4cHJlc3Npb24sIHNvdXJjZVNwYW4sIGhhbmRsZXJTcGFuLCB0YXJnZXRFdmVudHMsIGtleVNwYW4pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9wYXJzZVJlZ3VsYXJFdmVudChcbiAgICAgICAgbmFtZSxcbiAgICAgICAgZXhwcmVzc2lvbixcbiAgICAgICAgaXNBc3NpZ25tZW50RXZlbnQsXG4gICAgICAgIHNvdXJjZVNwYW4sXG4gICAgICAgIGhhbmRsZXJTcGFuLFxuICAgICAgICB0YXJnZXRNYXRjaGFibGVBdHRycyxcbiAgICAgICAgdGFyZ2V0RXZlbnRzLFxuICAgICAgICBrZXlTcGFuLFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBjYWxjUG9zc2libGVTZWN1cml0eUNvbnRleHRzKFxuICAgIHNlbGVjdG9yOiBzdHJpbmcsXG4gICAgcHJvcE5hbWU6IHN0cmluZyxcbiAgICBpc0F0dHJpYnV0ZTogYm9vbGVhbixcbiAgKTogU2VjdXJpdHlDb250ZXh0W10ge1xuICAgIGNvbnN0IHByb3AgPSB0aGlzLl9zY2hlbWFSZWdpc3RyeS5nZXRNYXBwZWRQcm9wTmFtZShwcm9wTmFtZSk7XG4gICAgcmV0dXJuIGNhbGNQb3NzaWJsZVNlY3VyaXR5Q29udGV4dHModGhpcy5fc2NoZW1hUmVnaXN0cnksIHNlbGVjdG9yLCBwcm9wLCBpc0F0dHJpYnV0ZSk7XG4gIH1cblxuICBwcml2YXRlIF9wYXJzZUFuaW1hdGlvbkV2ZW50KFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBleHByZXNzaW9uOiBzdHJpbmcsXG4gICAgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgIGhhbmRsZXJTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgdGFyZ2V0RXZlbnRzOiBQYXJzZWRFdmVudFtdLFxuICAgIGtleVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgKSB7XG4gICAgY29uc3QgbWF0Y2hlcyA9IHNwbGl0QXRQZXJpb2QobmFtZSwgW25hbWUsICcnXSk7XG4gICAgY29uc3QgZXZlbnROYW1lID0gbWF0Y2hlc1swXTtcbiAgICBjb25zdCBwaGFzZSA9IG1hdGNoZXNbMV0udG9Mb3dlckNhc2UoKTtcbiAgICBjb25zdCBhc3QgPSB0aGlzLl9wYXJzZUFjdGlvbihleHByZXNzaW9uLCBoYW5kbGVyU3Bhbik7XG4gICAgdGFyZ2V0RXZlbnRzLnB1c2goXG4gICAgICBuZXcgUGFyc2VkRXZlbnQoXG4gICAgICAgIGV2ZW50TmFtZSxcbiAgICAgICAgcGhhc2UsXG4gICAgICAgIFBhcnNlZEV2ZW50VHlwZS5BbmltYXRpb24sXG4gICAgICAgIGFzdCxcbiAgICAgICAgc291cmNlU3BhbixcbiAgICAgICAgaGFuZGxlclNwYW4sXG4gICAgICAgIGtleVNwYW4sXG4gICAgICApLFxuICAgICk7XG5cbiAgICBpZiAoZXZlbnROYW1lLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoYEFuaW1hdGlvbiBldmVudCBuYW1lIGlzIG1pc3NpbmcgaW4gYmluZGluZ2AsIHNvdXJjZVNwYW4pO1xuICAgIH1cbiAgICBpZiAocGhhc2UpIHtcbiAgICAgIGlmIChwaGFzZSAhPT0gJ3N0YXJ0JyAmJiBwaGFzZSAhPT0gJ2RvbmUnKSB7XG4gICAgICAgIHRoaXMuX3JlcG9ydEVycm9yKFxuICAgICAgICAgIGBUaGUgcHJvdmlkZWQgYW5pbWF0aW9uIG91dHB1dCBwaGFzZSB2YWx1ZSBcIiR7cGhhc2V9XCIgZm9yIFwiQCR7ZXZlbnROYW1lfVwiIGlzIG5vdCBzdXBwb3J0ZWQgKHVzZSBzdGFydCBvciBkb25lKWAsXG4gICAgICAgICAgc291cmNlU3BhbixcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoXG4gICAgICAgIGBUaGUgYW5pbWF0aW9uIHRyaWdnZXIgb3V0cHV0IGV2ZW50IChAJHtldmVudE5hbWV9KSBpcyBtaXNzaW5nIGl0cyBwaGFzZSB2YWx1ZSBuYW1lIChzdGFydCBvciBkb25lIGFyZSBjdXJyZW50bHkgc3VwcG9ydGVkKWAsXG4gICAgICAgIHNvdXJjZVNwYW4sXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3BhcnNlUmVndWxhckV2ZW50KFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBleHByZXNzaW9uOiBzdHJpbmcsXG4gICAgaXNBc3NpZ25tZW50RXZlbnQ6IGJvb2xlYW4sXG4gICAgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgIGhhbmRsZXJTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgdGFyZ2V0TWF0Y2hhYmxlQXR0cnM6IHN0cmluZ1tdW10sXG4gICAgdGFyZ2V0RXZlbnRzOiBQYXJzZWRFdmVudFtdLFxuICAgIGtleVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgKTogdm9pZCB7XG4gICAgLy8gbG9uZyBmb3JtYXQ6ICd0YXJnZXQ6IGV2ZW50TmFtZSdcbiAgICBjb25zdCBbdGFyZ2V0LCBldmVudE5hbWVdID0gc3BsaXRBdENvbG9uKG5hbWUsIFtudWxsISwgbmFtZV0pO1xuICAgIGNvbnN0IHByZXZFcnJvckNvdW50ID0gdGhpcy5lcnJvcnMubGVuZ3RoO1xuICAgIGNvbnN0IGFzdCA9IHRoaXMuX3BhcnNlQWN0aW9uKGV4cHJlc3Npb24sIGhhbmRsZXJTcGFuKTtcbiAgICBjb25zdCBpc1ZhbGlkID0gdGhpcy5lcnJvcnMubGVuZ3RoID09PSBwcmV2RXJyb3JDb3VudDtcbiAgICB0YXJnZXRNYXRjaGFibGVBdHRycy5wdXNoKFtuYW1lISwgYXN0LnNvdXJjZSFdKTtcblxuICAgIC8vIERvbid0IHRyeSB0byB2YWxpZGF0ZSBhc3NpZ25tZW50IGV2ZW50cyBpZiB0aGVyZSB3ZXJlIG90aGVyXG4gICAgLy8gcGFyc2luZyBlcnJvcnMgdG8gYXZvaWQgYWRkaW5nIG1vcmUgbm9pc2UgdG8gdGhlIGVycm9yIGxvZ3MuXG4gICAgaWYgKGlzQXNzaWdubWVudEV2ZW50ICYmIGlzVmFsaWQgJiYgIXRoaXMuX2lzQWxsb3dlZEFzc2lnbm1lbnRFdmVudChhc3QpKSB7XG4gICAgICB0aGlzLl9yZXBvcnRFcnJvcignVW5zdXBwb3J0ZWQgZXhwcmVzc2lvbiBpbiBhIHR3by13YXkgYmluZGluZycsIHNvdXJjZVNwYW4pO1xuICAgIH1cblxuICAgIHRhcmdldEV2ZW50cy5wdXNoKFxuICAgICAgbmV3IFBhcnNlZEV2ZW50KFxuICAgICAgICBldmVudE5hbWUsXG4gICAgICAgIHRhcmdldCxcbiAgICAgICAgaXNBc3NpZ25tZW50RXZlbnQgPyBQYXJzZWRFdmVudFR5cGUuVHdvV2F5IDogUGFyc2VkRXZlbnRUeXBlLlJlZ3VsYXIsXG4gICAgICAgIGFzdCxcbiAgICAgICAgc291cmNlU3BhbixcbiAgICAgICAgaGFuZGxlclNwYW4sXG4gICAgICAgIGtleVNwYW4sXG4gICAgICApLFxuICAgICk7XG4gICAgLy8gRG9uJ3QgZGV0ZWN0IGRpcmVjdGl2ZXMgZm9yIGV2ZW50IG5hbWVzIGZvciBub3csXG4gICAgLy8gc28gZG9uJ3QgYWRkIHRoZSBldmVudCBuYW1lIHRvIHRoZSBtYXRjaGFibGVBdHRyc1xuICB9XG5cbiAgcHJpdmF0ZSBfcGFyc2VBY3Rpb24odmFsdWU6IHN0cmluZywgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuKTogQVNUV2l0aFNvdXJjZSB7XG4gICAgY29uc3Qgc291cmNlSW5mbyA9ICgoc291cmNlU3BhbiAmJiBzb3VyY2VTcGFuLnN0YXJ0KSB8fCAnKHVua25vd24nKS50b1N0cmluZygpO1xuICAgIGNvbnN0IGFic29sdXRlT2Zmc2V0ID0gc291cmNlU3BhbiAmJiBzb3VyY2VTcGFuLnN0YXJ0ID8gc291cmNlU3Bhbi5zdGFydC5vZmZzZXQgOiAwO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGFzdCA9IHRoaXMuX2V4cHJQYXJzZXIucGFyc2VBY3Rpb24oXG4gICAgICAgIHZhbHVlLFxuICAgICAgICBzb3VyY2VJbmZvLFxuICAgICAgICBhYnNvbHV0ZU9mZnNldCxcbiAgICAgICAgdGhpcy5faW50ZXJwb2xhdGlvbkNvbmZpZyxcbiAgICAgICk7XG4gICAgICBpZiAoYXN0KSB7XG4gICAgICAgIHRoaXMuX3JlcG9ydEV4cHJlc3Npb25QYXJzZXJFcnJvcnMoYXN0LmVycm9ycywgc291cmNlU3Bhbik7XG4gICAgICB9XG4gICAgICBpZiAoIWFzdCB8fCBhc3QuYXN0IGluc3RhbmNlb2YgRW1wdHlFeHByKSB7XG4gICAgICAgIHRoaXMuX3JlcG9ydEVycm9yKGBFbXB0eSBleHByZXNzaW9ucyBhcmUgbm90IGFsbG93ZWRgLCBzb3VyY2VTcGFuKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2V4cHJQYXJzZXIud3JhcExpdGVyYWxQcmltaXRpdmUoJ0VSUk9SJywgc291cmNlSW5mbywgYWJzb2x1dGVPZmZzZXQpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGFzdDtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aGlzLl9yZXBvcnRFcnJvcihgJHtlfWAsIHNvdXJjZVNwYW4pO1xuICAgICAgcmV0dXJuIHRoaXMuX2V4cHJQYXJzZXIud3JhcExpdGVyYWxQcmltaXRpdmUoJ0VSUk9SJywgc291cmNlSW5mbywgYWJzb2x1dGVPZmZzZXQpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3JlcG9ydEVycm9yKFxuICAgIG1lc3NhZ2U6IHN0cmluZyxcbiAgICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgbGV2ZWw6IFBhcnNlRXJyb3JMZXZlbCA9IFBhcnNlRXJyb3JMZXZlbC5FUlJPUixcbiAgKSB7XG4gICAgdGhpcy5lcnJvcnMucHVzaChuZXcgUGFyc2VFcnJvcihzb3VyY2VTcGFuLCBtZXNzYWdlLCBsZXZlbCkpO1xuICB9XG5cbiAgcHJpdmF0ZSBfcmVwb3J0RXhwcmVzc2lvblBhcnNlckVycm9ycyhlcnJvcnM6IFBhcnNlckVycm9yW10sIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3Bhbikge1xuICAgIGZvciAoY29uc3QgZXJyb3Igb2YgZXJyb3JzKSB7XG4gICAgICB0aGlzLl9yZXBvcnRFcnJvcihlcnJvci5tZXNzYWdlLCBzb3VyY2VTcGFuKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHByb3BOYW1lIHRoZSBuYW1lIG9mIHRoZSBwcm9wZXJ0eSAvIGF0dHJpYnV0ZVxuICAgKiBAcGFyYW0gc291cmNlU3BhblxuICAgKiBAcGFyYW0gaXNBdHRyIHRydWUgd2hlbiBiaW5kaW5nIHRvIGFuIGF0dHJpYnV0ZVxuICAgKi9cbiAgcHJpdmF0ZSBfdmFsaWRhdGVQcm9wZXJ0eU9yQXR0cmlidXRlTmFtZShcbiAgICBwcm9wTmFtZTogc3RyaW5nLFxuICAgIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICBpc0F0dHI6IGJvb2xlYW4sXG4gICk6IHZvaWQge1xuICAgIGNvbnN0IHJlcG9ydCA9IGlzQXR0clxuICAgICAgPyB0aGlzLl9zY2hlbWFSZWdpc3RyeS52YWxpZGF0ZUF0dHJpYnV0ZShwcm9wTmFtZSlcbiAgICAgIDogdGhpcy5fc2NoZW1hUmVnaXN0cnkudmFsaWRhdGVQcm9wZXJ0eShwcm9wTmFtZSk7XG4gICAgaWYgKHJlcG9ydC5lcnJvcikge1xuICAgICAgdGhpcy5fcmVwb3J0RXJyb3IocmVwb3J0Lm1zZyEsIHNvdXJjZVNwYW4sIFBhcnNlRXJyb3JMZXZlbC5FUlJPUik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgd2hldGhlciBhIHBhcnNlZCBBU1QgaXMgYWxsb3dlZCB0byBiZSB1c2VkIHdpdGhpbiB0aGUgZXZlbnQgc2lkZSBvZiBhIHR3by13YXkgYmluZGluZy5cbiAgICogQHBhcmFtIGFzdCBQYXJzZWQgQVNUIHRvIGJlIGNoZWNrZWQuXG4gICAqL1xuICBwcml2YXRlIF9pc0FsbG93ZWRBc3NpZ25tZW50RXZlbnQoYXN0OiBBU1QpOiBib29sZWFuIHtcbiAgICBpZiAoYXN0IGluc3RhbmNlb2YgQVNUV2l0aFNvdXJjZSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2lzQWxsb3dlZEFzc2lnbm1lbnRFdmVudChhc3QuYXN0KTtcbiAgICB9XG5cbiAgICBpZiAoYXN0IGluc3RhbmNlb2YgTm9uTnVsbEFzc2VydCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2lzQWxsb3dlZEFzc2lnbm1lbnRFdmVudChhc3QuZXhwcmVzc2lvbik7XG4gICAgfVxuXG4gICAgaWYgKGFzdCBpbnN0YW5jZW9mIFByb3BlcnR5UmVhZCB8fCBhc3QgaW5zdGFuY2VvZiBLZXllZFJlYWQpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8vIFRPRE8oY3Jpc2JldG8pOiB0aGlzIGxvZ2ljIGlzIG9ubHkgaGVyZSB0byBzdXBwb3J0IHRoZSBhdXRvbWF0ZWQgbWlncmF0aW9uIGF3YXlcbiAgICAvLyBmcm9tIGludmFsaWQgYmluZGluZ3MuIEl0IHNob3VsZCBiZSByZW1vdmVkIG9uY2UgdGhlIG1pZ3JhdGlvbiBpcyBkZWxldGVkLlxuICAgIGlmICghdGhpcy5fYWxsb3dJbnZhbGlkQXNzaWdubWVudEV2ZW50cykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmIChhc3QgaW5zdGFuY2VvZiBCaW5hcnkpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIChhc3Qub3BlcmF0aW9uID09PSAnJiYnIHx8IGFzdC5vcGVyYXRpb24gPT09ICd8fCcgfHwgYXN0Lm9wZXJhdGlvbiA9PT0gJz8/JykgJiZcbiAgICAgICAgKGFzdC5yaWdodCBpbnN0YW5jZW9mIFByb3BlcnR5UmVhZCB8fCBhc3QucmlnaHQgaW5zdGFuY2VvZiBLZXllZFJlYWQpXG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiBhc3QgaW5zdGFuY2VvZiBDb25kaXRpb25hbCB8fCBhc3QgaW5zdGFuY2VvZiBQcmVmaXhOb3Q7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFBpcGVDb2xsZWN0b3IgZXh0ZW5kcyBSZWN1cnNpdmVBc3RWaXNpdG9yIHtcbiAgcGlwZXMgPSBuZXcgTWFwPHN0cmluZywgQmluZGluZ1BpcGU+KCk7XG4gIG92ZXJyaWRlIHZpc2l0UGlwZShhc3Q6IEJpbmRpbmdQaXBlLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHRoaXMucGlwZXMuc2V0KGFzdC5uYW1lLCBhc3QpO1xuICAgIGFzdC5leHAudmlzaXQodGhpcyk7XG4gICAgdGhpcy52aXNpdEFsbChhc3QuYXJncywgY29udGV4dCk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNBbmltYXRpb25MYWJlbChuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIG5hbWVbMF0gPT0gJ0AnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FsY1Bvc3NpYmxlU2VjdXJpdHlDb250ZXh0cyhcbiAgcmVnaXN0cnk6IEVsZW1lbnRTY2hlbWFSZWdpc3RyeSxcbiAgc2VsZWN0b3I6IHN0cmluZyxcbiAgcHJvcE5hbWU6IHN0cmluZyxcbiAgaXNBdHRyaWJ1dGU6IGJvb2xlYW4sXG4pOiBTZWN1cml0eUNvbnRleHRbXSB7XG4gIGNvbnN0IGN0eHM6IFNlY3VyaXR5Q29udGV4dFtdID0gW107XG4gIENzc1NlbGVjdG9yLnBhcnNlKHNlbGVjdG9yKS5mb3JFYWNoKChzZWxlY3RvcikgPT4ge1xuICAgIGNvbnN0IGVsZW1lbnROYW1lcyA9IHNlbGVjdG9yLmVsZW1lbnQgPyBbc2VsZWN0b3IuZWxlbWVudF0gOiByZWdpc3RyeS5hbGxLbm93bkVsZW1lbnROYW1lcygpO1xuICAgIGNvbnN0IG5vdEVsZW1lbnROYW1lcyA9IG5ldyBTZXQoXG4gICAgICBzZWxlY3Rvci5ub3RTZWxlY3RvcnNcbiAgICAgICAgLmZpbHRlcigoc2VsZWN0b3IpID0+IHNlbGVjdG9yLmlzRWxlbWVudFNlbGVjdG9yKCkpXG4gICAgICAgIC5tYXAoKHNlbGVjdG9yKSA9PiBzZWxlY3Rvci5lbGVtZW50KSxcbiAgICApO1xuICAgIGNvbnN0IHBvc3NpYmxlRWxlbWVudE5hbWVzID0gZWxlbWVudE5hbWVzLmZpbHRlcihcbiAgICAgIChlbGVtZW50TmFtZSkgPT4gIW5vdEVsZW1lbnROYW1lcy5oYXMoZWxlbWVudE5hbWUpLFxuICAgICk7XG5cbiAgICBjdHhzLnB1c2goXG4gICAgICAuLi5wb3NzaWJsZUVsZW1lbnROYW1lcy5tYXAoKGVsZW1lbnROYW1lKSA9PlxuICAgICAgICByZWdpc3RyeS5zZWN1cml0eUNvbnRleHQoZWxlbWVudE5hbWUsIHByb3BOYW1lLCBpc0F0dHJpYnV0ZSksXG4gICAgICApLFxuICAgICk7XG4gIH0pO1xuICByZXR1cm4gY3R4cy5sZW5ndGggPT09IDAgPyBbU2VjdXJpdHlDb250ZXh0Lk5PTkVdIDogQXJyYXkuZnJvbShuZXcgU2V0KGN0eHMpKS5zb3J0KCk7XG59XG5cbi8qKlxuICogQ29tcHV0ZSBhIG5ldyBQYXJzZVNvdXJjZVNwYW4gYmFzZWQgb2ZmIGFuIG9yaWdpbmFsIGBzb3VyY2VTcGFuYCBieSB1c2luZ1xuICogYWJzb2x1dGUgb2Zmc2V0cyBmcm9tIHRoZSBzcGVjaWZpZWQgYGFic29sdXRlU3BhbmAuXG4gKlxuICogQHBhcmFtIHNvdXJjZVNwYW4gb3JpZ2luYWwgc291cmNlIHNwYW5cbiAqIEBwYXJhbSBhYnNvbHV0ZVNwYW4gYWJzb2x1dGUgc291cmNlIHNwYW4gdG8gbW92ZSB0b1xuICovXG5mdW5jdGlvbiBtb3ZlUGFyc2VTb3VyY2VTcGFuKFxuICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gIGFic29sdXRlU3BhbjogQWJzb2x1dGVTb3VyY2VTcGFuLFxuKTogUGFyc2VTb3VyY2VTcGFuIHtcbiAgLy8gVGhlIGRpZmZlcmVuY2Ugb2YgdHdvIGFic29sdXRlIG9mZnNldHMgcHJvdmlkZSB0aGUgcmVsYXRpdmUgb2Zmc2V0XG4gIGNvbnN0IHN0YXJ0RGlmZiA9IGFic29sdXRlU3Bhbi5zdGFydCAtIHNvdXJjZVNwYW4uc3RhcnQub2Zmc2V0O1xuICBjb25zdCBlbmREaWZmID0gYWJzb2x1dGVTcGFuLmVuZCAtIHNvdXJjZVNwYW4uZW5kLm9mZnNldDtcbiAgcmV0dXJuIG5ldyBQYXJzZVNvdXJjZVNwYW4oXG4gICAgc291cmNlU3Bhbi5zdGFydC5tb3ZlQnkoc3RhcnREaWZmKSxcbiAgICBzb3VyY2VTcGFuLmVuZC5tb3ZlQnkoZW5kRGlmZiksXG4gICAgc291cmNlU3Bhbi5mdWxsU3RhcnQubW92ZUJ5KHN0YXJ0RGlmZiksXG4gICAgc291cmNlU3Bhbi5kZXRhaWxzLFxuICApO1xufVxuIl19