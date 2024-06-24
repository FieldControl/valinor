/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmluZGluZ19wYXJzZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvdGVtcGxhdGVfcGFyc2VyL2JpbmRpbmdfcGFyc2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFDeEMsT0FBTyxFQUNMLGtCQUFrQixFQUVsQixhQUFhLEVBQ2IsTUFBTSxFQUVOLFdBQVcsRUFDWCxvQkFBb0IsRUFDcEIsV0FBVyxFQUNYLFNBQVMsRUFDVCxTQUFTLEVBQ1QsYUFBYSxFQUNiLFdBQVcsRUFDWCxlQUFlLEVBQ2YsY0FBYyxFQUNkLGtCQUFrQixFQUNsQixjQUFjLEVBRWQsU0FBUyxFQUNULFlBQVksRUFDWixtQkFBbUIsRUFFbkIsZUFBZSxHQUNoQixNQUFNLDBCQUEwQixDQUFDO0FBR2xDLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUVqRCxPQUFPLEVBQUMsVUFBVSxFQUFFLGVBQWUsRUFBRSxlQUFlLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFM0UsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUN4QyxPQUFPLEVBQUMsWUFBWSxFQUFFLGFBQWEsRUFBQyxNQUFNLFNBQVMsQ0FBQztBQUVwRCxNQUFNLHdCQUF3QixHQUFHLEdBQUcsQ0FBQztBQUNyQyxNQUFNLGdCQUFnQixHQUFHLE1BQU0sQ0FBQztBQUNoQyxNQUFNLFlBQVksR0FBRyxPQUFPLENBQUM7QUFDN0IsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDO0FBQzdCLE1BQU0sb0JBQW9CLEdBQUcsR0FBRyxDQUFDO0FBQ2pDLE1BQU0sbUJBQW1CLEdBQUcsVUFBVSxDQUFDO0FBVXZDOztHQUVHO0FBQ0gsTUFBTSxPQUFPLGFBQWE7SUFDeEIsWUFDVSxXQUFtQixFQUNuQixvQkFB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QUFDO0lBQ3pELE9BQU8sSUFBSSxlQUFlLENBQ3hCLFVBQVUsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxFQUNsQyxVQUFVLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFDOUIsVUFBVSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEVBQ3RDLFVBQVUsQ0FBQyxPQUFPLENBQ25CLENBQUM7QUFDSixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7U2VjdXJpdHlDb250ZXh0fSBmcm9tICcuLi9jb3JlJztcbmltcG9ydCB7XG4gIEFic29sdXRlU291cmNlU3BhbixcbiAgQVNULFxuICBBU1RXaXRoU291cmNlLFxuICBCaW5hcnksXG4gIEJpbmRpbmdQaXBlLFxuICBCaW5kaW5nVHlwZSxcbiAgQm91bmRFbGVtZW50UHJvcGVydHksXG4gIENvbmRpdGlvbmFsLFxuICBFbXB0eUV4cHIsXG4gIEtleWVkUmVhZCxcbiAgTm9uTnVsbEFzc2VydCxcbiAgUGFyc2VkRXZlbnQsXG4gIFBhcnNlZEV2ZW50VHlwZSxcbiAgUGFyc2VkUHJvcGVydHksXG4gIFBhcnNlZFByb3BlcnR5VHlwZSxcbiAgUGFyc2VkVmFyaWFibGUsXG4gIFBhcnNlckVycm9yLFxuICBQcmVmaXhOb3QsXG4gIFByb3BlcnR5UmVhZCxcbiAgUmVjdXJzaXZlQXN0VmlzaXRvcixcbiAgVGVtcGxhdGVCaW5kaW5nLFxuICBWYXJpYWJsZUJpbmRpbmcsXG59IGZyb20gJy4uL2V4cHJlc3Npb25fcGFyc2VyL2FzdCc7XG5pbXBvcnQge1BhcnNlcn0gZnJvbSAnLi4vZXhwcmVzc2lvbl9wYXJzZXIvcGFyc2VyJztcbmltcG9ydCB7SW50ZXJwb2xhdGlvbkNvbmZpZ30gZnJvbSAnLi4vbWxfcGFyc2VyL2RlZmF1bHRzJztcbmltcG9ydCB7bWVyZ2VOc0FuZE5hbWV9IGZyb20gJy4uL21sX3BhcnNlci90YWdzJztcbmltcG9ydCB7SW50ZXJwb2xhdGVkQXR0cmlidXRlVG9rZW4sIEludGVycG9sYXRlZFRleHRUb2tlbn0gZnJvbSAnLi4vbWxfcGFyc2VyL3Rva2Vucyc7XG5pbXBvcnQge1BhcnNlRXJyb3IsIFBhcnNlRXJyb3JMZXZlbCwgUGFyc2VTb3VyY2VTcGFufSBmcm9tICcuLi9wYXJzZV91dGlsJztcbmltcG9ydCB7RWxlbWVudFNjaGVtYVJlZ2lzdHJ5fSBmcm9tICcuLi9zY2hlbWEvZWxlbWVudF9zY2hlbWFfcmVnaXN0cnknO1xuaW1wb3J0IHtDc3NTZWxlY3Rvcn0gZnJvbSAnLi4vc2VsZWN0b3InO1xuaW1wb3J0IHtzcGxpdEF0Q29sb24sIHNwbGl0QXRQZXJpb2R9IGZyb20gJy4uL3V0aWwnO1xuXG5jb25zdCBQUk9QRVJUWV9QQVJUU19TRVBBUkFUT1IgPSAnLic7XG5jb25zdCBBVFRSSUJVVEVfUFJFRklYID0gJ2F0dHInO1xuY29uc3QgQ0xBU1NfUFJFRklYID0gJ2NsYXNzJztcbmNvbnN0IFNUWUxFX1BSRUZJWCA9ICdzdHlsZSc7XG5jb25zdCBURU1QTEFURV9BVFRSX1BSRUZJWCA9ICcqJztcbmNvbnN0IEFOSU1BVEVfUFJPUF9QUkVGSVggPSAnYW5pbWF0ZS0nO1xuXG5leHBvcnQgaW50ZXJmYWNlIEhvc3RQcm9wZXJ0aWVzIHtcbiAgW2tleTogc3RyaW5nXTogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEhvc3RMaXN0ZW5lcnMge1xuICBba2V5OiBzdHJpbmddOiBzdHJpbmc7XG59XG5cbi8qKlxuICogUGFyc2VzIGJpbmRpbmdzIGluIHRlbXBsYXRlcyBhbmQgaW4gdGhlIGRpcmVjdGl2ZSBob3N0IGFyZWEuXG4gKi9cbmV4cG9ydCBjbGFzcyBCaW5kaW5nUGFyc2VyIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBfZXhwclBhcnNlcjogUGFyc2VyLFxuICAgIHByaXZhdGUgX2ludGVycG9sYXRpb25Db25maWc6IEludGVycG9sYXRpb25Db25maWcsXG4gICAgcHJpdmF0ZSBfc2NoZW1hUmVnaXN0cnk6IEVsZW1lbnRTY2hlbWFSZWdpc3RyeSxcbiAgICBwdWJsaWMgZXJyb3JzOiBQYXJzZUVycm9yW10sXG4gICAgcHJpdmF0ZSBfYWxsb3dJbnZhbGlkQXNzaWdubWVudEV2ZW50cyA9IGZhbHNlLFxuICApIHt9XG5cbiAgZ2V0IGludGVycG9sYXRpb25Db25maWcoKTogSW50ZXJwb2xhdGlvbkNvbmZpZyB7XG4gICAgcmV0dXJuIHRoaXMuX2ludGVycG9sYXRpb25Db25maWc7XG4gIH1cblxuICBjcmVhdGVCb3VuZEhvc3RQcm9wZXJ0aWVzKFxuICAgIHByb3BlcnRpZXM6IEhvc3RQcm9wZXJ0aWVzLFxuICAgIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgKTogUGFyc2VkUHJvcGVydHlbXSB8IG51bGwge1xuICAgIGNvbnN0IGJvdW5kUHJvcHM6IFBhcnNlZFByb3BlcnR5W10gPSBbXTtcbiAgICBmb3IgKGNvbnN0IHByb3BOYW1lIG9mIE9iamVjdC5rZXlzKHByb3BlcnRpZXMpKSB7XG4gICAgICBjb25zdCBleHByZXNzaW9uID0gcHJvcGVydGllc1twcm9wTmFtZV07XG4gICAgICBpZiAodHlwZW9mIGV4cHJlc3Npb24gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRoaXMucGFyc2VQcm9wZXJ0eUJpbmRpbmcoXG4gICAgICAgICAgcHJvcE5hbWUsXG4gICAgICAgICAgZXhwcmVzc2lvbixcbiAgICAgICAgICB0cnVlLFxuICAgICAgICAgIGZhbHNlLFxuICAgICAgICAgIHNvdXJjZVNwYW4sXG4gICAgICAgICAgc291cmNlU3Bhbi5zdGFydC5vZmZzZXQsXG4gICAgICAgICAgdW5kZWZpbmVkLFxuICAgICAgICAgIFtdLFxuICAgICAgICAgIC8vIFVzZSB0aGUgYHNvdXJjZVNwYW5gIGZvciAgYGtleVNwYW5gLiBUaGlzIGlzbid0IHJlYWxseSBhY2N1cmF0ZSwgYnV0IG5laXRoZXIgaXMgdGhlXG4gICAgICAgICAgLy8gc291cmNlU3BhbiwgYXMgaXQgcmVwcmVzZW50cyB0aGUgc291cmNlU3BhbiBvZiB0aGUgaG9zdCBpdHNlbGYgcmF0aGVyIHRoYW4gdGhlXG4gICAgICAgICAgLy8gc291cmNlIG9mIHRoZSBob3N0IGJpbmRpbmcgKHdoaWNoIGRvZXNuJ3QgZXhpc3QgaW4gdGhlIHRlbXBsYXRlKS4gUmVnYXJkbGVzcyxcbiAgICAgICAgICAvLyBuZWl0aGVyIG9mIHRoZXNlIHZhbHVlcyBhcmUgdXNlZCBpbiBJdnkgYnV0IGFyZSBvbmx5IGhlcmUgdG8gc2F0aXNmeSB0aGUgZnVuY3Rpb25cbiAgICAgICAgICAvLyBzaWduYXR1cmUuIFRoaXMgc2hvdWxkIGxpa2VseSBiZSByZWZhY3RvcmVkIGluIHRoZSBmdXR1cmUgc28gdGhhdCBgc291cmNlU3BhbmBcbiAgICAgICAgICAvLyBpc24ndCBiZWluZyB1c2VkIGluYWNjdXJhdGVseS5cbiAgICAgICAgICBib3VuZFByb3BzLFxuICAgICAgICAgIHNvdXJjZVNwYW4sXG4gICAgICAgICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9yZXBvcnRFcnJvcihcbiAgICAgICAgICBgVmFsdWUgb2YgdGhlIGhvc3QgcHJvcGVydHkgYmluZGluZyBcIiR7cHJvcE5hbWV9XCIgbmVlZHMgdG8gYmUgYSBzdHJpbmcgcmVwcmVzZW50aW5nIGFuIGV4cHJlc3Npb24gYnV0IGdvdCBcIiR7ZXhwcmVzc2lvbn1cIiAoJHt0eXBlb2YgZXhwcmVzc2lvbn0pYCxcbiAgICAgICAgICBzb3VyY2VTcGFuLFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYm91bmRQcm9wcztcbiAgfVxuXG4gIGNyZWF0ZURpcmVjdGl2ZUhvc3RFdmVudEFzdHMoXG4gICAgaG9zdExpc3RlbmVyczogSG9zdExpc3RlbmVycyxcbiAgICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICk6IFBhcnNlZEV2ZW50W10gfCBudWxsIHtcbiAgICBjb25zdCB0YXJnZXRFdmVudHM6IFBhcnNlZEV2ZW50W10gPSBbXTtcbiAgICBmb3IgKGNvbnN0IHByb3BOYW1lIG9mIE9iamVjdC5rZXlzKGhvc3RMaXN0ZW5lcnMpKSB7XG4gICAgICBjb25zdCBleHByZXNzaW9uID0gaG9zdExpc3RlbmVyc1twcm9wTmFtZV07XG4gICAgICBpZiAodHlwZW9mIGV4cHJlc3Npb24gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIC8vIFVzZSB0aGUgYHNvdXJjZVNwYW5gIGZvciAgYGtleVNwYW5gIGFuZCBgaGFuZGxlclNwYW5gLiBUaGlzIGlzbid0IHJlYWxseSBhY2N1cmF0ZSwgYnV0XG4gICAgICAgIC8vIG5laXRoZXIgaXMgdGhlIGBzb3VyY2VTcGFuYCwgYXMgaXQgcmVwcmVzZW50cyB0aGUgYHNvdXJjZVNwYW5gIG9mIHRoZSBob3N0IGl0c2VsZlxuICAgICAgICAvLyByYXRoZXIgdGhhbiB0aGUgc291cmNlIG9mIHRoZSBob3N0IGJpbmRpbmcgKHdoaWNoIGRvZXNuJ3QgZXhpc3QgaW4gdGhlIHRlbXBsYXRlKS5cbiAgICAgICAgLy8gUmVnYXJkbGVzcywgbmVpdGhlciBvZiB0aGVzZSB2YWx1ZXMgYXJlIHVzZWQgaW4gSXZ5IGJ1dCBhcmUgb25seSBoZXJlIHRvIHNhdGlzZnkgdGhlXG4gICAgICAgIC8vIGZ1bmN0aW9uIHNpZ25hdHVyZS4gVGhpcyBzaG91bGQgbGlrZWx5IGJlIHJlZmFjdG9yZWQgaW4gdGhlIGZ1dHVyZSBzbyB0aGF0IGBzb3VyY2VTcGFuYFxuICAgICAgICAvLyBpc24ndCBiZWluZyB1c2VkIGluYWNjdXJhdGVseS5cbiAgICAgICAgdGhpcy5wYXJzZUV2ZW50KFxuICAgICAgICAgIHByb3BOYW1lLFxuICAgICAgICAgIGV4cHJlc3Npb24sXG4gICAgICAgICAgLyogaXNBc3NpZ25tZW50RXZlbnQgKi8gZmFsc2UsXG4gICAgICAgICAgc291cmNlU3BhbixcbiAgICAgICAgICBzb3VyY2VTcGFuLFxuICAgICAgICAgIFtdLFxuICAgICAgICAgIHRhcmdldEV2ZW50cyxcbiAgICAgICAgICBzb3VyY2VTcGFuLFxuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoXG4gICAgICAgICAgYFZhbHVlIG9mIHRoZSBob3N0IGxpc3RlbmVyIFwiJHtwcm9wTmFtZX1cIiBuZWVkcyB0byBiZSBhIHN0cmluZyByZXByZXNlbnRpbmcgYW4gZXhwcmVzc2lvbiBidXQgZ290IFwiJHtleHByZXNzaW9ufVwiICgke3R5cGVvZiBleHByZXNzaW9ufSlgLFxuICAgICAgICAgIHNvdXJjZVNwYW4sXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0YXJnZXRFdmVudHM7XG4gIH1cblxuICBwYXJzZUludGVycG9sYXRpb24oXG4gICAgdmFsdWU6IHN0cmluZyxcbiAgICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgaW50ZXJwb2xhdGVkVG9rZW5zOiBJbnRlcnBvbGF0ZWRBdHRyaWJ1dGVUb2tlbltdIHwgSW50ZXJwb2xhdGVkVGV4dFRva2VuW10gfCBudWxsLFxuICApOiBBU1RXaXRoU291cmNlIHtcbiAgICBjb25zdCBzb3VyY2VJbmZvID0gc291cmNlU3Bhbi5zdGFydC50b1N0cmluZygpO1xuICAgIGNvbnN0IGFic29sdXRlT2Zmc2V0ID0gc291cmNlU3Bhbi5mdWxsU3RhcnQub2Zmc2V0O1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGFzdCA9IHRoaXMuX2V4cHJQYXJzZXIucGFyc2VJbnRlcnBvbGF0aW9uKFxuICAgICAgICB2YWx1ZSxcbiAgICAgICAgc291cmNlSW5mbyxcbiAgICAgICAgYWJzb2x1dGVPZmZzZXQsXG4gICAgICAgIGludGVycG9sYXRlZFRva2VucyxcbiAgICAgICAgdGhpcy5faW50ZXJwb2xhdGlvbkNvbmZpZyxcbiAgICAgICkhO1xuICAgICAgaWYgKGFzdCkgdGhpcy5fcmVwb3J0RXhwcmVzc2lvblBhcnNlckVycm9ycyhhc3QuZXJyb3JzLCBzb3VyY2VTcGFuKTtcbiAgICAgIHJldHVybiBhc3Q7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoYCR7ZX1gLCBzb3VyY2VTcGFuKTtcbiAgICAgIHJldHVybiB0aGlzLl9leHByUGFyc2VyLndyYXBMaXRlcmFsUHJpbWl0aXZlKCdFUlJPUicsIHNvdXJjZUluZm8sIGFic29sdXRlT2Zmc2V0KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2ltaWxhciB0byBgcGFyc2VJbnRlcnBvbGF0aW9uYCwgYnV0IHRyZWF0cyB0aGUgcHJvdmlkZWQgc3RyaW5nIGFzIGEgc2luZ2xlIGV4cHJlc3Npb25cbiAgICogZWxlbWVudCB0aGF0IHdvdWxkIG5vcm1hbGx5IGFwcGVhciB3aXRoaW4gdGhlIGludGVycG9sYXRpb24gcHJlZml4IGFuZCBzdWZmaXggKGB7e2AgYW5kIGB9fWApLlxuICAgKiBUaGlzIGlzIHVzZWQgZm9yIHBhcnNpbmcgdGhlIHN3aXRjaCBleHByZXNzaW9uIGluIElDVXMuXG4gICAqL1xuICBwYXJzZUludGVycG9sYXRpb25FeHByZXNzaW9uKGV4cHJlc3Npb246IHN0cmluZywgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuKTogQVNUV2l0aFNvdXJjZSB7XG4gICAgY29uc3Qgc291cmNlSW5mbyA9IHNvdXJjZVNwYW4uc3RhcnQudG9TdHJpbmcoKTtcbiAgICBjb25zdCBhYnNvbHV0ZU9mZnNldCA9IHNvdXJjZVNwYW4uc3RhcnQub2Zmc2V0O1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGFzdCA9IHRoaXMuX2V4cHJQYXJzZXIucGFyc2VJbnRlcnBvbGF0aW9uRXhwcmVzc2lvbihcbiAgICAgICAgZXhwcmVzc2lvbixcbiAgICAgICAgc291cmNlSW5mbyxcbiAgICAgICAgYWJzb2x1dGVPZmZzZXQsXG4gICAgICApO1xuICAgICAgaWYgKGFzdCkgdGhpcy5fcmVwb3J0RXhwcmVzc2lvblBhcnNlckVycm9ycyhhc3QuZXJyb3JzLCBzb3VyY2VTcGFuKTtcbiAgICAgIHJldHVybiBhc3Q7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoYCR7ZX1gLCBzb3VyY2VTcGFuKTtcbiAgICAgIHJldHVybiB0aGlzLl9leHByUGFyc2VyLndyYXBMaXRlcmFsUHJpbWl0aXZlKCdFUlJPUicsIHNvdXJjZUluZm8sIGFic29sdXRlT2Zmc2V0KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUGFyc2VzIHRoZSBiaW5kaW5ncyBpbiBhIG1pY3Jvc3ludGF4IGV4cHJlc3Npb24sIGFuZCBjb252ZXJ0cyB0aGVtIHRvXG4gICAqIGBQYXJzZWRQcm9wZXJ0eWAgb3IgYFBhcnNlZFZhcmlhYmxlYC5cbiAgICpcbiAgICogQHBhcmFtIHRwbEtleSB0ZW1wbGF0ZSBiaW5kaW5nIG5hbWVcbiAgICogQHBhcmFtIHRwbFZhbHVlIHRlbXBsYXRlIGJpbmRpbmcgdmFsdWVcbiAgICogQHBhcmFtIHNvdXJjZVNwYW4gc3BhbiBvZiB0ZW1wbGF0ZSBiaW5kaW5nIHJlbGF0aXZlIHRvIGVudGlyZSB0aGUgdGVtcGxhdGVcbiAgICogQHBhcmFtIGFic29sdXRlVmFsdWVPZmZzZXQgc3RhcnQgb2YgdGhlIHRwbFZhbHVlIHJlbGF0aXZlIHRvIHRoZSBlbnRpcmUgdGVtcGxhdGVcbiAgICogQHBhcmFtIHRhcmdldE1hdGNoYWJsZUF0dHJzIHBvdGVudGlhbCBhdHRyaWJ1dGVzIHRvIG1hdGNoIGluIHRoZSB0ZW1wbGF0ZVxuICAgKiBAcGFyYW0gdGFyZ2V0UHJvcHMgdGFyZ2V0IHByb3BlcnR5IGJpbmRpbmdzIGluIHRoZSB0ZW1wbGF0ZVxuICAgKiBAcGFyYW0gdGFyZ2V0VmFycyB0YXJnZXQgdmFyaWFibGVzIGluIHRoZSB0ZW1wbGF0ZVxuICAgKi9cbiAgcGFyc2VJbmxpbmVUZW1wbGF0ZUJpbmRpbmcoXG4gICAgdHBsS2V5OiBzdHJpbmcsXG4gICAgdHBsVmFsdWU6IHN0cmluZyxcbiAgICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgYWJzb2x1dGVWYWx1ZU9mZnNldDogbnVtYmVyLFxuICAgIHRhcmdldE1hdGNoYWJsZUF0dHJzOiBzdHJpbmdbXVtdLFxuICAgIHRhcmdldFByb3BzOiBQYXJzZWRQcm9wZXJ0eVtdLFxuICAgIHRhcmdldFZhcnM6IFBhcnNlZFZhcmlhYmxlW10sXG4gICAgaXNJdnlBc3Q6IGJvb2xlYW4sXG4gICkge1xuICAgIGNvbnN0IGFic29sdXRlS2V5T2Zmc2V0ID0gc291cmNlU3Bhbi5zdGFydC5vZmZzZXQgKyBURU1QTEFURV9BVFRSX1BSRUZJWC5sZW5ndGg7XG4gICAgY29uc3QgYmluZGluZ3MgPSB0aGlzLl9wYXJzZVRlbXBsYXRlQmluZGluZ3MoXG4gICAgICB0cGxLZXksXG4gICAgICB0cGxWYWx1ZSxcbiAgICAgIHNvdXJjZVNwYW4sXG4gICAgICBhYnNvbHV0ZUtleU9mZnNldCxcbiAgICAgIGFic29sdXRlVmFsdWVPZmZzZXQsXG4gICAgKTtcblxuICAgIGZvciAoY29uc3QgYmluZGluZyBvZiBiaW5kaW5ncykge1xuICAgICAgLy8gc291cmNlU3BhbiBpcyBmb3IgdGhlIGVudGlyZSBIVE1MIGF0dHJpYnV0ZS4gYmluZGluZ1NwYW4gaXMgZm9yIGEgcGFydGljdWxhclxuICAgICAgLy8gYmluZGluZyB3aXRoaW4gdGhlIG1pY3Jvc3ludGF4IGV4cHJlc3Npb24gc28gaXQncyBtb3JlIG5hcnJvdyB0aGFuIHNvdXJjZVNwYW4uXG4gICAgICBjb25zdCBiaW5kaW5nU3BhbiA9IG1vdmVQYXJzZVNvdXJjZVNwYW4oc291cmNlU3BhbiwgYmluZGluZy5zb3VyY2VTcGFuKTtcbiAgICAgIGNvbnN0IGtleSA9IGJpbmRpbmcua2V5LnNvdXJjZTtcbiAgICAgIGNvbnN0IGtleVNwYW4gPSBtb3ZlUGFyc2VTb3VyY2VTcGFuKHNvdXJjZVNwYW4sIGJpbmRpbmcua2V5LnNwYW4pO1xuICAgICAgaWYgKGJpbmRpbmcgaW5zdGFuY2VvZiBWYXJpYWJsZUJpbmRpbmcpIHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBiaW5kaW5nLnZhbHVlID8gYmluZGluZy52YWx1ZS5zb3VyY2UgOiAnJGltcGxpY2l0JztcbiAgICAgICAgY29uc3QgdmFsdWVTcGFuID0gYmluZGluZy52YWx1ZVxuICAgICAgICAgID8gbW92ZVBhcnNlU291cmNlU3Bhbihzb3VyY2VTcGFuLCBiaW5kaW5nLnZhbHVlLnNwYW4pXG4gICAgICAgICAgOiB1bmRlZmluZWQ7XG4gICAgICAgIHRhcmdldFZhcnMucHVzaChuZXcgUGFyc2VkVmFyaWFibGUoa2V5LCB2YWx1ZSwgYmluZGluZ1NwYW4sIGtleVNwYW4sIHZhbHVlU3BhbikpO1xuICAgICAgfSBlbHNlIGlmIChiaW5kaW5nLnZhbHVlKSB7XG4gICAgICAgIGNvbnN0IHNyY1NwYW4gPSBpc0l2eUFzdCA/IGJpbmRpbmdTcGFuIDogc291cmNlU3BhbjtcbiAgICAgICAgY29uc3QgdmFsdWVTcGFuID0gbW92ZVBhcnNlU291cmNlU3Bhbihzb3VyY2VTcGFuLCBiaW5kaW5nLnZhbHVlLmFzdC5zb3VyY2VTcGFuKTtcbiAgICAgICAgdGhpcy5fcGFyc2VQcm9wZXJ0eUFzdChcbiAgICAgICAgICBrZXksXG4gICAgICAgICAgYmluZGluZy52YWx1ZSxcbiAgICAgICAgICBmYWxzZSxcbiAgICAgICAgICBzcmNTcGFuLFxuICAgICAgICAgIGtleVNwYW4sXG4gICAgICAgICAgdmFsdWVTcGFuLFxuICAgICAgICAgIHRhcmdldE1hdGNoYWJsZUF0dHJzLFxuICAgICAgICAgIHRhcmdldFByb3BzLFxuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGFyZ2V0TWF0Y2hhYmxlQXR0cnMucHVzaChba2V5LCAnJyAvKiB2YWx1ZSAqL10pO1xuICAgICAgICAvLyBTaW5jZSB0aGlzIGlzIGEgbGl0ZXJhbCBhdHRyaWJ1dGUgd2l0aCBubyBSSFMsIHNvdXJjZSBzcGFuIHNob3VsZCBiZVxuICAgICAgICAvLyBqdXN0IHRoZSBrZXkgc3Bhbi5cbiAgICAgICAgdGhpcy5wYXJzZUxpdGVyYWxBdHRyKFxuICAgICAgICAgIGtleSxcbiAgICAgICAgICBudWxsIC8qIHZhbHVlICovLFxuICAgICAgICAgIGtleVNwYW4sXG4gICAgICAgICAgYWJzb2x1dGVWYWx1ZU9mZnNldCxcbiAgICAgICAgICB1bmRlZmluZWQgLyogdmFsdWVTcGFuICovLFxuICAgICAgICAgIHRhcmdldE1hdGNoYWJsZUF0dHJzLFxuICAgICAgICAgIHRhcmdldFByb3BzLFxuICAgICAgICAgIGtleVNwYW4sXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFBhcnNlcyB0aGUgYmluZGluZ3MgaW4gYSBtaWNyb3N5bnRheCBleHByZXNzaW9uLCBlLmcuXG4gICAqIGBgYFxuICAgKiAgICA8dGFnICp0cGxLZXk9XCJsZXQgdmFsdWUxID0gcHJvcDsgbGV0IHZhbHVlMiA9IGxvY2FsVmFyXCI+XG4gICAqIGBgYFxuICAgKlxuICAgKiBAcGFyYW0gdHBsS2V5IHRlbXBsYXRlIGJpbmRpbmcgbmFtZVxuICAgKiBAcGFyYW0gdHBsVmFsdWUgdGVtcGxhdGUgYmluZGluZyB2YWx1ZVxuICAgKiBAcGFyYW0gc291cmNlU3BhbiBzcGFuIG9mIHRlbXBsYXRlIGJpbmRpbmcgcmVsYXRpdmUgdG8gZW50aXJlIHRoZSB0ZW1wbGF0ZVxuICAgKiBAcGFyYW0gYWJzb2x1dGVLZXlPZmZzZXQgc3RhcnQgb2YgdGhlIGB0cGxLZXlgXG4gICAqIEBwYXJhbSBhYnNvbHV0ZVZhbHVlT2Zmc2V0IHN0YXJ0IG9mIHRoZSBgdHBsVmFsdWVgXG4gICAqL1xuICBwcml2YXRlIF9wYXJzZVRlbXBsYXRlQmluZGluZ3MoXG4gICAgdHBsS2V5OiBzdHJpbmcsXG4gICAgdHBsVmFsdWU6IHN0cmluZyxcbiAgICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgYWJzb2x1dGVLZXlPZmZzZXQ6IG51bWJlcixcbiAgICBhYnNvbHV0ZVZhbHVlT2Zmc2V0OiBudW1iZXIsXG4gICk6IFRlbXBsYXRlQmluZGluZ1tdIHtcbiAgICBjb25zdCBzb3VyY2VJbmZvID0gc291cmNlU3Bhbi5zdGFydC50b1N0cmluZygpO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGJpbmRpbmdzUmVzdWx0ID0gdGhpcy5fZXhwclBhcnNlci5wYXJzZVRlbXBsYXRlQmluZGluZ3MoXG4gICAgICAgIHRwbEtleSxcbiAgICAgICAgdHBsVmFsdWUsXG4gICAgICAgIHNvdXJjZUluZm8sXG4gICAgICAgIGFic29sdXRlS2V5T2Zmc2V0LFxuICAgICAgICBhYnNvbHV0ZVZhbHVlT2Zmc2V0LFxuICAgICAgKTtcbiAgICAgIHRoaXMuX3JlcG9ydEV4cHJlc3Npb25QYXJzZXJFcnJvcnMoYmluZGluZ3NSZXN1bHQuZXJyb3JzLCBzb3VyY2VTcGFuKTtcbiAgICAgIGJpbmRpbmdzUmVzdWx0Lndhcm5pbmdzLmZvckVhY2goKHdhcm5pbmcpID0+IHtcbiAgICAgICAgdGhpcy5fcmVwb3J0RXJyb3Iod2FybmluZywgc291cmNlU3BhbiwgUGFyc2VFcnJvckxldmVsLldBUk5JTkcpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gYmluZGluZ3NSZXN1bHQudGVtcGxhdGVCaW5kaW5ncztcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aGlzLl9yZXBvcnRFcnJvcihgJHtlfWAsIHNvdXJjZVNwYW4pO1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgfVxuXG4gIHBhcnNlTGl0ZXJhbEF0dHIoXG4gICAgbmFtZTogc3RyaW5nLFxuICAgIHZhbHVlOiBzdHJpbmcgfCBudWxsLFxuICAgIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICBhYnNvbHV0ZU9mZnNldDogbnVtYmVyLFxuICAgIHZhbHVlU3BhbjogUGFyc2VTb3VyY2VTcGFuIHwgdW5kZWZpbmVkLFxuICAgIHRhcmdldE1hdGNoYWJsZUF0dHJzOiBzdHJpbmdbXVtdLFxuICAgIHRhcmdldFByb3BzOiBQYXJzZWRQcm9wZXJ0eVtdLFxuICAgIGtleVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgKSB7XG4gICAgaWYgKGlzQW5pbWF0aW9uTGFiZWwobmFtZSkpIHtcbiAgICAgIG5hbWUgPSBuYW1lLnN1YnN0cmluZygxKTtcbiAgICAgIGlmIChrZXlTcGFuICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAga2V5U3BhbiA9IG1vdmVQYXJzZVNvdXJjZVNwYW4oXG4gICAgICAgICAga2V5U3BhbixcbiAgICAgICAgICBuZXcgQWJzb2x1dGVTb3VyY2VTcGFuKGtleVNwYW4uc3RhcnQub2Zmc2V0ICsgMSwga2V5U3Bhbi5lbmQub2Zmc2V0KSxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICB0aGlzLl9yZXBvcnRFcnJvcihcbiAgICAgICAgICBgQXNzaWduaW5nIGFuaW1hdGlvbiB0cmlnZ2VycyB2aWEgQHByb3A9XCJleHBcIiBhdHRyaWJ1dGVzIHdpdGggYW4gZXhwcmVzc2lvbiBpcyBpbnZhbGlkLmAgK1xuICAgICAgICAgICAgYCBVc2UgcHJvcGVydHkgYmluZGluZ3MgKGUuZy4gW0Bwcm9wXT1cImV4cFwiKSBvciB1c2UgYW4gYXR0cmlidXRlIHdpdGhvdXQgYSB2YWx1ZSAoZS5nLiBAcHJvcCkgaW5zdGVhZC5gLFxuICAgICAgICAgIHNvdXJjZVNwYW4sXG4gICAgICAgICAgUGFyc2VFcnJvckxldmVsLkVSUk9SLFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgdGhpcy5fcGFyc2VBbmltYXRpb24oXG4gICAgICAgIG5hbWUsXG4gICAgICAgIHZhbHVlLFxuICAgICAgICBzb3VyY2VTcGFuLFxuICAgICAgICBhYnNvbHV0ZU9mZnNldCxcbiAgICAgICAga2V5U3BhbixcbiAgICAgICAgdmFsdWVTcGFuLFxuICAgICAgICB0YXJnZXRNYXRjaGFibGVBdHRycyxcbiAgICAgICAgdGFyZ2V0UHJvcHMsXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICB0YXJnZXRQcm9wcy5wdXNoKFxuICAgICAgICBuZXcgUGFyc2VkUHJvcGVydHkoXG4gICAgICAgICAgbmFtZSxcbiAgICAgICAgICB0aGlzLl9leHByUGFyc2VyLndyYXBMaXRlcmFsUHJpbWl0aXZlKHZhbHVlLCAnJywgYWJzb2x1dGVPZmZzZXQpLFxuICAgICAgICAgIFBhcnNlZFByb3BlcnR5VHlwZS5MSVRFUkFMX0FUVFIsXG4gICAgICAgICAgc291cmNlU3BhbixcbiAgICAgICAgICBrZXlTcGFuLFxuICAgICAgICAgIHZhbHVlU3BhbixcbiAgICAgICAgKSxcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgcGFyc2VQcm9wZXJ0eUJpbmRpbmcoXG4gICAgbmFtZTogc3RyaW5nLFxuICAgIGV4cHJlc3Npb246IHN0cmluZyxcbiAgICBpc0hvc3Q6IGJvb2xlYW4sXG4gICAgaXNQYXJ0T2ZBc3NpZ25tZW50QmluZGluZzogYm9vbGVhbixcbiAgICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgYWJzb2x1dGVPZmZzZXQ6IG51bWJlcixcbiAgICB2YWx1ZVNwYW46IFBhcnNlU291cmNlU3BhbiB8IHVuZGVmaW5lZCxcbiAgICB0YXJnZXRNYXRjaGFibGVBdHRyczogc3RyaW5nW11bXSxcbiAgICB0YXJnZXRQcm9wczogUGFyc2VkUHJvcGVydHlbXSxcbiAgICBrZXlTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICkge1xuICAgIGlmIChuYW1lLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoYFByb3BlcnR5IG5hbWUgaXMgbWlzc2luZyBpbiBiaW5kaW5nYCwgc291cmNlU3Bhbik7XG4gICAgfVxuXG4gICAgbGV0IGlzQW5pbWF0aW9uUHJvcCA9IGZhbHNlO1xuICAgIGlmIChuYW1lLnN0YXJ0c1dpdGgoQU5JTUFURV9QUk9QX1BSRUZJWCkpIHtcbiAgICAgIGlzQW5pbWF0aW9uUHJvcCA9IHRydWU7XG4gICAgICBuYW1lID0gbmFtZS5zdWJzdHJpbmcoQU5JTUFURV9QUk9QX1BSRUZJWC5sZW5ndGgpO1xuICAgICAgaWYgKGtleVNwYW4gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBrZXlTcGFuID0gbW92ZVBhcnNlU291cmNlU3BhbihcbiAgICAgICAgICBrZXlTcGFuLFxuICAgICAgICAgIG5ldyBBYnNvbHV0ZVNvdXJjZVNwYW4oXG4gICAgICAgICAgICBrZXlTcGFuLnN0YXJ0Lm9mZnNldCArIEFOSU1BVEVfUFJPUF9QUkVGSVgubGVuZ3RoLFxuICAgICAgICAgICAga2V5U3Bhbi5lbmQub2Zmc2V0LFxuICAgICAgICAgICksXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChpc0FuaW1hdGlvbkxhYmVsKG5hbWUpKSB7XG4gICAgICBpc0FuaW1hdGlvblByb3AgPSB0cnVlO1xuICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyaW5nKDEpO1xuICAgICAgaWYgKGtleVNwYW4gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBrZXlTcGFuID0gbW92ZVBhcnNlU291cmNlU3BhbihcbiAgICAgICAgICBrZXlTcGFuLFxuICAgICAgICAgIG5ldyBBYnNvbHV0ZVNvdXJjZVNwYW4oa2V5U3Bhbi5zdGFydC5vZmZzZXQgKyAxLCBrZXlTcGFuLmVuZC5vZmZzZXQpLFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChpc0FuaW1hdGlvblByb3ApIHtcbiAgICAgIHRoaXMuX3BhcnNlQW5pbWF0aW9uKFxuICAgICAgICBuYW1lLFxuICAgICAgICBleHByZXNzaW9uLFxuICAgICAgICBzb3VyY2VTcGFuLFxuICAgICAgICBhYnNvbHV0ZU9mZnNldCxcbiAgICAgICAga2V5U3BhbixcbiAgICAgICAgdmFsdWVTcGFuLFxuICAgICAgICB0YXJnZXRNYXRjaGFibGVBdHRycyxcbiAgICAgICAgdGFyZ2V0UHJvcHMsXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9wYXJzZVByb3BlcnR5QXN0KFxuICAgICAgICBuYW1lLFxuICAgICAgICB0aGlzLnBhcnNlQmluZGluZyhleHByZXNzaW9uLCBpc0hvc3QsIHZhbHVlU3BhbiB8fCBzb3VyY2VTcGFuLCBhYnNvbHV0ZU9mZnNldCksXG4gICAgICAgIGlzUGFydE9mQXNzaWdubWVudEJpbmRpbmcsXG4gICAgICAgIHNvdXJjZVNwYW4sXG4gICAgICAgIGtleVNwYW4sXG4gICAgICAgIHZhbHVlU3BhbixcbiAgICAgICAgdGFyZ2V0TWF0Y2hhYmxlQXR0cnMsXG4gICAgICAgIHRhcmdldFByb3BzLFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBwYXJzZVByb3BlcnR5SW50ZXJwb2xhdGlvbihcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgdmFsdWU6IHN0cmluZyxcbiAgICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgdmFsdWVTcGFuOiBQYXJzZVNvdXJjZVNwYW4gfCB1bmRlZmluZWQsXG4gICAgdGFyZ2V0TWF0Y2hhYmxlQXR0cnM6IHN0cmluZ1tdW10sXG4gICAgdGFyZ2V0UHJvcHM6IFBhcnNlZFByb3BlcnR5W10sXG4gICAga2V5U3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgIGludGVycG9sYXRlZFRva2VuczogSW50ZXJwb2xhdGVkQXR0cmlidXRlVG9rZW5bXSB8IEludGVycG9sYXRlZFRleHRUb2tlbltdIHwgbnVsbCxcbiAgKTogYm9vbGVhbiB7XG4gICAgY29uc3QgZXhwciA9IHRoaXMucGFyc2VJbnRlcnBvbGF0aW9uKHZhbHVlLCB2YWx1ZVNwYW4gfHwgc291cmNlU3BhbiwgaW50ZXJwb2xhdGVkVG9rZW5zKTtcbiAgICBpZiAoZXhwcikge1xuICAgICAgdGhpcy5fcGFyc2VQcm9wZXJ0eUFzdChcbiAgICAgICAgbmFtZSxcbiAgICAgICAgZXhwcixcbiAgICAgICAgZmFsc2UsXG4gICAgICAgIHNvdXJjZVNwYW4sXG4gICAgICAgIGtleVNwYW4sXG4gICAgICAgIHZhbHVlU3BhbixcbiAgICAgICAgdGFyZ2V0TWF0Y2hhYmxlQXR0cnMsXG4gICAgICAgIHRhcmdldFByb3BzLFxuICAgICAgKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBwcml2YXRlIF9wYXJzZVByb3BlcnR5QXN0KFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBhc3Q6IEFTVFdpdGhTb3VyY2UsXG4gICAgaXNQYXJ0T2ZBc3NpZ25tZW50QmluZGluZzogYm9vbGVhbixcbiAgICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAga2V5U3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgIHZhbHVlU3BhbjogUGFyc2VTb3VyY2VTcGFuIHwgdW5kZWZpbmVkLFxuICAgIHRhcmdldE1hdGNoYWJsZUF0dHJzOiBzdHJpbmdbXVtdLFxuICAgIHRhcmdldFByb3BzOiBQYXJzZWRQcm9wZXJ0eVtdLFxuICApIHtcbiAgICB0YXJnZXRNYXRjaGFibGVBdHRycy5wdXNoKFtuYW1lLCBhc3Quc291cmNlIV0pO1xuICAgIHRhcmdldFByb3BzLnB1c2goXG4gICAgICBuZXcgUGFyc2VkUHJvcGVydHkoXG4gICAgICAgIG5hbWUsXG4gICAgICAgIGFzdCxcbiAgICAgICAgaXNQYXJ0T2ZBc3NpZ25tZW50QmluZGluZyA/IFBhcnNlZFByb3BlcnR5VHlwZS5UV09fV0FZIDogUGFyc2VkUHJvcGVydHlUeXBlLkRFRkFVTFQsXG4gICAgICAgIHNvdXJjZVNwYW4sXG4gICAgICAgIGtleVNwYW4sXG4gICAgICAgIHZhbHVlU3BhbixcbiAgICAgICksXG4gICAgKTtcbiAgfVxuXG4gIHByaXZhdGUgX3BhcnNlQW5pbWF0aW9uKFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBleHByZXNzaW9uOiBzdHJpbmcgfCBudWxsLFxuICAgIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICBhYnNvbHV0ZU9mZnNldDogbnVtYmVyLFxuICAgIGtleVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICB2YWx1ZVNwYW46IFBhcnNlU291cmNlU3BhbiB8IHVuZGVmaW5lZCxcbiAgICB0YXJnZXRNYXRjaGFibGVBdHRyczogc3RyaW5nW11bXSxcbiAgICB0YXJnZXRQcm9wczogUGFyc2VkUHJvcGVydHlbXSxcbiAgKSB7XG4gICAgaWYgKG5hbWUubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aGlzLl9yZXBvcnRFcnJvcignQW5pbWF0aW9uIHRyaWdnZXIgaXMgbWlzc2luZycsIHNvdXJjZVNwYW4pO1xuICAgIH1cblxuICAgIC8vIFRoaXMgd2lsbCBvY2N1ciB3aGVuIGEgQHRyaWdnZXIgaXMgbm90IHBhaXJlZCB3aXRoIGFuIGV4cHJlc3Npb24uXG4gICAgLy8gRm9yIGFuaW1hdGlvbnMgaXQgaXMgdmFsaWQgdG8gbm90IGhhdmUgYW4gZXhwcmVzc2lvbiBzaW5jZSAqL3ZvaWRcbiAgICAvLyBzdGF0ZXMgd2lsbCBiZSBhcHBsaWVkIGJ5IGFuZ3VsYXIgd2hlbiB0aGUgZWxlbWVudCBpcyBhdHRhY2hlZC9kZXRhY2hlZFxuICAgIGNvbnN0IGFzdCA9IHRoaXMucGFyc2VCaW5kaW5nKFxuICAgICAgZXhwcmVzc2lvbiB8fCAndW5kZWZpbmVkJyxcbiAgICAgIGZhbHNlLFxuICAgICAgdmFsdWVTcGFuIHx8IHNvdXJjZVNwYW4sXG4gICAgICBhYnNvbHV0ZU9mZnNldCxcbiAgICApO1xuICAgIHRhcmdldE1hdGNoYWJsZUF0dHJzLnB1c2goW25hbWUsIGFzdC5zb3VyY2UhXSk7XG4gICAgdGFyZ2V0UHJvcHMucHVzaChcbiAgICAgIG5ldyBQYXJzZWRQcm9wZXJ0eShuYW1lLCBhc3QsIFBhcnNlZFByb3BlcnR5VHlwZS5BTklNQVRJT04sIHNvdXJjZVNwYW4sIGtleVNwYW4sIHZhbHVlU3BhbiksXG4gICAgKTtcbiAgfVxuXG4gIHBhcnNlQmluZGluZyhcbiAgICB2YWx1ZTogc3RyaW5nLFxuICAgIGlzSG9zdEJpbmRpbmc6IGJvb2xlYW4sXG4gICAgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgIGFic29sdXRlT2Zmc2V0OiBudW1iZXIsXG4gICk6IEFTVFdpdGhTb3VyY2Uge1xuICAgIGNvbnN0IHNvdXJjZUluZm8gPSAoKHNvdXJjZVNwYW4gJiYgc291cmNlU3Bhbi5zdGFydCkgfHwgJyh1bmtub3duKScpLnRvU3RyaW5nKCk7XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgYXN0ID0gaXNIb3N0QmluZGluZ1xuICAgICAgICA/IHRoaXMuX2V4cHJQYXJzZXIucGFyc2VTaW1wbGVCaW5kaW5nKFxuICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgICBzb3VyY2VJbmZvLFxuICAgICAgICAgICAgYWJzb2x1dGVPZmZzZXQsXG4gICAgICAgICAgICB0aGlzLl9pbnRlcnBvbGF0aW9uQ29uZmlnLFxuICAgICAgICAgIClcbiAgICAgICAgOiB0aGlzLl9leHByUGFyc2VyLnBhcnNlQmluZGluZyhcbiAgICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgICAgc291cmNlSW5mbyxcbiAgICAgICAgICAgIGFic29sdXRlT2Zmc2V0LFxuICAgICAgICAgICAgdGhpcy5faW50ZXJwb2xhdGlvbkNvbmZpZyxcbiAgICAgICAgICApO1xuICAgICAgaWYgKGFzdCkgdGhpcy5fcmVwb3J0RXhwcmVzc2lvblBhcnNlckVycm9ycyhhc3QuZXJyb3JzLCBzb3VyY2VTcGFuKTtcbiAgICAgIHJldHVybiBhc3Q7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoYCR7ZX1gLCBzb3VyY2VTcGFuKTtcbiAgICAgIHJldHVybiB0aGlzLl9leHByUGFyc2VyLndyYXBMaXRlcmFsUHJpbWl0aXZlKCdFUlJPUicsIHNvdXJjZUluZm8sIGFic29sdXRlT2Zmc2V0KTtcbiAgICB9XG4gIH1cblxuICBjcmVhdGVCb3VuZEVsZW1lbnRQcm9wZXJ0eShcbiAgICBlbGVtZW50U2VsZWN0b3I6IHN0cmluZyxcbiAgICBib3VuZFByb3A6IFBhcnNlZFByb3BlcnR5LFxuICAgIHNraXBWYWxpZGF0aW9uOiBib29sZWFuID0gZmFsc2UsXG4gICAgbWFwUHJvcGVydHlOYW1lOiBib29sZWFuID0gdHJ1ZSxcbiAgKTogQm91bmRFbGVtZW50UHJvcGVydHkge1xuICAgIGlmIChib3VuZFByb3AuaXNBbmltYXRpb24pIHtcbiAgICAgIHJldHVybiBuZXcgQm91bmRFbGVtZW50UHJvcGVydHkoXG4gICAgICAgIGJvdW5kUHJvcC5uYW1lLFxuICAgICAgICBCaW5kaW5nVHlwZS5BbmltYXRpb24sXG4gICAgICAgIFNlY3VyaXR5Q29udGV4dC5OT05FLFxuICAgICAgICBib3VuZFByb3AuZXhwcmVzc2lvbixcbiAgICAgICAgbnVsbCxcbiAgICAgICAgYm91bmRQcm9wLnNvdXJjZVNwYW4sXG4gICAgICAgIGJvdW5kUHJvcC5rZXlTcGFuLFxuICAgICAgICBib3VuZFByb3AudmFsdWVTcGFuLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICBsZXQgdW5pdDogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG4gICAgbGV0IGJpbmRpbmdUeXBlOiBCaW5kaW5nVHlwZSA9IHVuZGVmaW5lZCE7XG4gICAgbGV0IGJvdW5kUHJvcGVydHlOYW1lOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcbiAgICBjb25zdCBwYXJ0cyA9IGJvdW5kUHJvcC5uYW1lLnNwbGl0KFBST1BFUlRZX1BBUlRTX1NFUEFSQVRPUik7XG4gICAgbGV0IHNlY3VyaXR5Q29udGV4dHM6IFNlY3VyaXR5Q29udGV4dFtdID0gdW5kZWZpbmVkITtcblxuICAgIC8vIENoZWNrIGZvciBzcGVjaWFsIGNhc2VzIChwcmVmaXggc3R5bGUsIGF0dHIsIGNsYXNzKVxuICAgIGlmIChwYXJ0cy5sZW5ndGggPiAxKSB7XG4gICAgICBpZiAocGFydHNbMF0gPT0gQVRUUklCVVRFX1BSRUZJWCkge1xuICAgICAgICBib3VuZFByb3BlcnR5TmFtZSA9IHBhcnRzLnNsaWNlKDEpLmpvaW4oUFJPUEVSVFlfUEFSVFNfU0VQQVJBVE9SKTtcbiAgICAgICAgaWYgKCFza2lwVmFsaWRhdGlvbikge1xuICAgICAgICAgIHRoaXMuX3ZhbGlkYXRlUHJvcGVydHlPckF0dHJpYnV0ZU5hbWUoYm91bmRQcm9wZXJ0eU5hbWUsIGJvdW5kUHJvcC5zb3VyY2VTcGFuLCB0cnVlKTtcbiAgICAgICAgfVxuICAgICAgICBzZWN1cml0eUNvbnRleHRzID0gY2FsY1Bvc3NpYmxlU2VjdXJpdHlDb250ZXh0cyhcbiAgICAgICAgICB0aGlzLl9zY2hlbWFSZWdpc3RyeSxcbiAgICAgICAgICBlbGVtZW50U2VsZWN0b3IsXG4gICAgICAgICAgYm91bmRQcm9wZXJ0eU5hbWUsXG4gICAgICAgICAgdHJ1ZSxcbiAgICAgICAgKTtcblxuICAgICAgICBjb25zdCBuc1NlcGFyYXRvcklkeCA9IGJvdW5kUHJvcGVydHlOYW1lLmluZGV4T2YoJzonKTtcbiAgICAgICAgaWYgKG5zU2VwYXJhdG9ySWR4ID4gLTEpIHtcbiAgICAgICAgICBjb25zdCBucyA9IGJvdW5kUHJvcGVydHlOYW1lLnN1YnN0cmluZygwLCBuc1NlcGFyYXRvcklkeCk7XG4gICAgICAgICAgY29uc3QgbmFtZSA9IGJvdW5kUHJvcGVydHlOYW1lLnN1YnN0cmluZyhuc1NlcGFyYXRvcklkeCArIDEpO1xuICAgICAgICAgIGJvdW5kUHJvcGVydHlOYW1lID0gbWVyZ2VOc0FuZE5hbWUobnMsIG5hbWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgYmluZGluZ1R5cGUgPSBCaW5kaW5nVHlwZS5BdHRyaWJ1dGU7XG4gICAgICB9IGVsc2UgaWYgKHBhcnRzWzBdID09IENMQVNTX1BSRUZJWCkge1xuICAgICAgICBib3VuZFByb3BlcnR5TmFtZSA9IHBhcnRzWzFdO1xuICAgICAgICBiaW5kaW5nVHlwZSA9IEJpbmRpbmdUeXBlLkNsYXNzO1xuICAgICAgICBzZWN1cml0eUNvbnRleHRzID0gW1NlY3VyaXR5Q29udGV4dC5OT05FXTtcbiAgICAgIH0gZWxzZSBpZiAocGFydHNbMF0gPT0gU1RZTEVfUFJFRklYKSB7XG4gICAgICAgIHVuaXQgPSBwYXJ0cy5sZW5ndGggPiAyID8gcGFydHNbMl0gOiBudWxsO1xuICAgICAgICBib3VuZFByb3BlcnR5TmFtZSA9IHBhcnRzWzFdO1xuICAgICAgICBiaW5kaW5nVHlwZSA9IEJpbmRpbmdUeXBlLlN0eWxlO1xuICAgICAgICBzZWN1cml0eUNvbnRleHRzID0gW1NlY3VyaXR5Q29udGV4dC5TVFlMRV07XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gSWYgbm90IGEgc3BlY2lhbCBjYXNlLCB1c2UgdGhlIGZ1bGwgcHJvcGVydHkgbmFtZVxuICAgIGlmIChib3VuZFByb3BlcnR5TmFtZSA9PT0gbnVsbCkge1xuICAgICAgY29uc3QgbWFwcGVkUHJvcE5hbWUgPSB0aGlzLl9zY2hlbWFSZWdpc3RyeS5nZXRNYXBwZWRQcm9wTmFtZShib3VuZFByb3AubmFtZSk7XG4gICAgICBib3VuZFByb3BlcnR5TmFtZSA9IG1hcFByb3BlcnR5TmFtZSA/IG1hcHBlZFByb3BOYW1lIDogYm91bmRQcm9wLm5hbWU7XG4gICAgICBzZWN1cml0eUNvbnRleHRzID0gY2FsY1Bvc3NpYmxlU2VjdXJpdHlDb250ZXh0cyhcbiAgICAgICAgdGhpcy5fc2NoZW1hUmVnaXN0cnksXG4gICAgICAgIGVsZW1lbnRTZWxlY3RvcixcbiAgICAgICAgbWFwcGVkUHJvcE5hbWUsXG4gICAgICAgIGZhbHNlLFxuICAgICAgKTtcbiAgICAgIGJpbmRpbmdUeXBlID1cbiAgICAgICAgYm91bmRQcm9wLnR5cGUgPT09IFBhcnNlZFByb3BlcnR5VHlwZS5UV09fV0FZID8gQmluZGluZ1R5cGUuVHdvV2F5IDogQmluZGluZ1R5cGUuUHJvcGVydHk7XG4gICAgICBpZiAoIXNraXBWYWxpZGF0aW9uKSB7XG4gICAgICAgIHRoaXMuX3ZhbGlkYXRlUHJvcGVydHlPckF0dHJpYnV0ZU5hbWUobWFwcGVkUHJvcE5hbWUsIGJvdW5kUHJvcC5zb3VyY2VTcGFuLCBmYWxzZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBCb3VuZEVsZW1lbnRQcm9wZXJ0eShcbiAgICAgIGJvdW5kUHJvcGVydHlOYW1lLFxuICAgICAgYmluZGluZ1R5cGUsXG4gICAgICBzZWN1cml0eUNvbnRleHRzWzBdLFxuICAgICAgYm91bmRQcm9wLmV4cHJlc3Npb24sXG4gICAgICB1bml0LFxuICAgICAgYm91bmRQcm9wLnNvdXJjZVNwYW4sXG4gICAgICBib3VuZFByb3Aua2V5U3BhbixcbiAgICAgIGJvdW5kUHJvcC52YWx1ZVNwYW4sXG4gICAgKTtcbiAgfVxuXG4gIC8vIFRPRE86IGtleVNwYW4gc2hvdWxkIGJlIHJlcXVpcmVkIGJ1dCB3YXMgbWFkZSBvcHRpb25hbCB0byBhdm9pZCBjaGFuZ2luZyBWRSBwYXJzZXIuXG4gIHBhcnNlRXZlbnQoXG4gICAgbmFtZTogc3RyaW5nLFxuICAgIGV4cHJlc3Npb246IHN0cmluZyxcbiAgICBpc0Fzc2lnbm1lbnRFdmVudDogYm9vbGVhbixcbiAgICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgaGFuZGxlclNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICB0YXJnZXRNYXRjaGFibGVBdHRyczogc3RyaW5nW11bXSxcbiAgICB0YXJnZXRFdmVudHM6IFBhcnNlZEV2ZW50W10sXG4gICAga2V5U3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICApIHtcbiAgICBpZiAobmFtZS5sZW5ndGggPT09IDApIHtcbiAgICAgIHRoaXMuX3JlcG9ydEVycm9yKGBFdmVudCBuYW1lIGlzIG1pc3NpbmcgaW4gYmluZGluZ2AsIHNvdXJjZVNwYW4pO1xuICAgIH1cblxuICAgIGlmIChpc0FuaW1hdGlvbkxhYmVsKG5hbWUpKSB7XG4gICAgICBuYW1lID0gbmFtZS5zbGljZSgxKTtcbiAgICAgIGlmIChrZXlTcGFuICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAga2V5U3BhbiA9IG1vdmVQYXJzZVNvdXJjZVNwYW4oXG4gICAgICAgICAga2V5U3BhbixcbiAgICAgICAgICBuZXcgQWJzb2x1dGVTb3VyY2VTcGFuKGtleVNwYW4uc3RhcnQub2Zmc2V0ICsgMSwga2V5U3Bhbi5lbmQub2Zmc2V0KSxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX3BhcnNlQW5pbWF0aW9uRXZlbnQobmFtZSwgZXhwcmVzc2lvbiwgc291cmNlU3BhbiwgaGFuZGxlclNwYW4sIHRhcmdldEV2ZW50cywga2V5U3Bhbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3BhcnNlUmVndWxhckV2ZW50KFxuICAgICAgICBuYW1lLFxuICAgICAgICBleHByZXNzaW9uLFxuICAgICAgICBpc0Fzc2lnbm1lbnRFdmVudCxcbiAgICAgICAgc291cmNlU3BhbixcbiAgICAgICAgaGFuZGxlclNwYW4sXG4gICAgICAgIHRhcmdldE1hdGNoYWJsZUF0dHJzLFxuICAgICAgICB0YXJnZXRFdmVudHMsXG4gICAgICAgIGtleVNwYW4sXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIGNhbGNQb3NzaWJsZVNlY3VyaXR5Q29udGV4dHMoXG4gICAgc2VsZWN0b3I6IHN0cmluZyxcbiAgICBwcm9wTmFtZTogc3RyaW5nLFxuICAgIGlzQXR0cmlidXRlOiBib29sZWFuLFxuICApOiBTZWN1cml0eUNvbnRleHRbXSB7XG4gICAgY29uc3QgcHJvcCA9IHRoaXMuX3NjaGVtYVJlZ2lzdHJ5LmdldE1hcHBlZFByb3BOYW1lKHByb3BOYW1lKTtcbiAgICByZXR1cm4gY2FsY1Bvc3NpYmxlU2VjdXJpdHlDb250ZXh0cyh0aGlzLl9zY2hlbWFSZWdpc3RyeSwgc2VsZWN0b3IsIHByb3AsIGlzQXR0cmlidXRlKTtcbiAgfVxuXG4gIHByaXZhdGUgX3BhcnNlQW5pbWF0aW9uRXZlbnQoXG4gICAgbmFtZTogc3RyaW5nLFxuICAgIGV4cHJlc3Npb246IHN0cmluZyxcbiAgICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgaGFuZGxlclNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICB0YXJnZXRFdmVudHM6IFBhcnNlZEV2ZW50W10sXG4gICAga2V5U3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICApIHtcbiAgICBjb25zdCBtYXRjaGVzID0gc3BsaXRBdFBlcmlvZChuYW1lLCBbbmFtZSwgJyddKTtcbiAgICBjb25zdCBldmVudE5hbWUgPSBtYXRjaGVzWzBdO1xuICAgIGNvbnN0IHBoYXNlID0gbWF0Y2hlc1sxXS50b0xvd2VyQ2FzZSgpO1xuICAgIGNvbnN0IGFzdCA9IHRoaXMuX3BhcnNlQWN0aW9uKGV4cHJlc3Npb24sIGhhbmRsZXJTcGFuKTtcbiAgICB0YXJnZXRFdmVudHMucHVzaChcbiAgICAgIG5ldyBQYXJzZWRFdmVudChcbiAgICAgICAgZXZlbnROYW1lLFxuICAgICAgICBwaGFzZSxcbiAgICAgICAgUGFyc2VkRXZlbnRUeXBlLkFuaW1hdGlvbixcbiAgICAgICAgYXN0LFxuICAgICAgICBzb3VyY2VTcGFuLFxuICAgICAgICBoYW5kbGVyU3BhbixcbiAgICAgICAga2V5U3BhbixcbiAgICAgICksXG4gICAgKTtcblxuICAgIGlmIChldmVudE5hbWUubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aGlzLl9yZXBvcnRFcnJvcihgQW5pbWF0aW9uIGV2ZW50IG5hbWUgaXMgbWlzc2luZyBpbiBiaW5kaW5nYCwgc291cmNlU3Bhbik7XG4gICAgfVxuICAgIGlmIChwaGFzZSkge1xuICAgICAgaWYgKHBoYXNlICE9PSAnc3RhcnQnICYmIHBoYXNlICE9PSAnZG9uZScpIHtcbiAgICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoXG4gICAgICAgICAgYFRoZSBwcm92aWRlZCBhbmltYXRpb24gb3V0cHV0IHBoYXNlIHZhbHVlIFwiJHtwaGFzZX1cIiBmb3IgXCJAJHtldmVudE5hbWV9XCIgaXMgbm90IHN1cHBvcnRlZCAodXNlIHN0YXJ0IG9yIGRvbmUpYCxcbiAgICAgICAgICBzb3VyY2VTcGFuLFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9yZXBvcnRFcnJvcihcbiAgICAgICAgYFRoZSBhbmltYXRpb24gdHJpZ2dlciBvdXRwdXQgZXZlbnQgKEAke2V2ZW50TmFtZX0pIGlzIG1pc3NpbmcgaXRzIHBoYXNlIHZhbHVlIG5hbWUgKHN0YXJ0IG9yIGRvbmUgYXJlIGN1cnJlbnRseSBzdXBwb3J0ZWQpYCxcbiAgICAgICAgc291cmNlU3BhbixcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfcGFyc2VSZWd1bGFyRXZlbnQoXG4gICAgbmFtZTogc3RyaW5nLFxuICAgIGV4cHJlc3Npb246IHN0cmluZyxcbiAgICBpc0Fzc2lnbm1lbnRFdmVudDogYm9vbGVhbixcbiAgICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgaGFuZGxlclNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICB0YXJnZXRNYXRjaGFibGVBdHRyczogc3RyaW5nW11bXSxcbiAgICB0YXJnZXRFdmVudHM6IFBhcnNlZEV2ZW50W10sXG4gICAga2V5U3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICApOiB2b2lkIHtcbiAgICAvLyBsb25nIGZvcm1hdDogJ3RhcmdldDogZXZlbnROYW1lJ1xuICAgIGNvbnN0IFt0YXJnZXQsIGV2ZW50TmFtZV0gPSBzcGxpdEF0Q29sb24obmFtZSwgW251bGwhLCBuYW1lXSk7XG4gICAgY29uc3QgcHJldkVycm9yQ291bnQgPSB0aGlzLmVycm9ycy5sZW5ndGg7XG4gICAgY29uc3QgYXN0ID0gdGhpcy5fcGFyc2VBY3Rpb24oZXhwcmVzc2lvbiwgaGFuZGxlclNwYW4pO1xuICAgIGNvbnN0IGlzVmFsaWQgPSB0aGlzLmVycm9ycy5sZW5ndGggPT09IHByZXZFcnJvckNvdW50O1xuICAgIHRhcmdldE1hdGNoYWJsZUF0dHJzLnB1c2goW25hbWUhLCBhc3Quc291cmNlIV0pO1xuXG4gICAgLy8gRG9uJ3QgdHJ5IHRvIHZhbGlkYXRlIGFzc2lnbm1lbnQgZXZlbnRzIGlmIHRoZXJlIHdlcmUgb3RoZXJcbiAgICAvLyBwYXJzaW5nIGVycm9ycyB0byBhdm9pZCBhZGRpbmcgbW9yZSBub2lzZSB0byB0aGUgZXJyb3IgbG9ncy5cbiAgICBpZiAoaXNBc3NpZ25tZW50RXZlbnQgJiYgaXNWYWxpZCAmJiAhdGhpcy5faXNBbGxvd2VkQXNzaWdubWVudEV2ZW50KGFzdCkpIHtcbiAgICAgIHRoaXMuX3JlcG9ydEVycm9yKCdVbnN1cHBvcnRlZCBleHByZXNzaW9uIGluIGEgdHdvLXdheSBiaW5kaW5nJywgc291cmNlU3Bhbik7XG4gICAgfVxuXG4gICAgdGFyZ2V0RXZlbnRzLnB1c2goXG4gICAgICBuZXcgUGFyc2VkRXZlbnQoXG4gICAgICAgIGV2ZW50TmFtZSxcbiAgICAgICAgdGFyZ2V0LFxuICAgICAgICBpc0Fzc2lnbm1lbnRFdmVudCA/IFBhcnNlZEV2ZW50VHlwZS5Ud29XYXkgOiBQYXJzZWRFdmVudFR5cGUuUmVndWxhcixcbiAgICAgICAgYXN0LFxuICAgICAgICBzb3VyY2VTcGFuLFxuICAgICAgICBoYW5kbGVyU3BhbixcbiAgICAgICAga2V5U3BhbixcbiAgICAgICksXG4gICAgKTtcbiAgICAvLyBEb24ndCBkZXRlY3QgZGlyZWN0aXZlcyBmb3IgZXZlbnQgbmFtZXMgZm9yIG5vdyxcbiAgICAvLyBzbyBkb24ndCBhZGQgdGhlIGV2ZW50IG5hbWUgdG8gdGhlIG1hdGNoYWJsZUF0dHJzXG4gIH1cblxuICBwcml2YXRlIF9wYXJzZUFjdGlvbih2YWx1ZTogc3RyaW5nLCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pOiBBU1RXaXRoU291cmNlIHtcbiAgICBjb25zdCBzb3VyY2VJbmZvID0gKChzb3VyY2VTcGFuICYmIHNvdXJjZVNwYW4uc3RhcnQpIHx8ICcodW5rbm93bicpLnRvU3RyaW5nKCk7XG4gICAgY29uc3QgYWJzb2x1dGVPZmZzZXQgPSBzb3VyY2VTcGFuICYmIHNvdXJjZVNwYW4uc3RhcnQgPyBzb3VyY2VTcGFuLnN0YXJ0Lm9mZnNldCA6IDA7XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgYXN0ID0gdGhpcy5fZXhwclBhcnNlci5wYXJzZUFjdGlvbihcbiAgICAgICAgdmFsdWUsXG4gICAgICAgIHNvdXJjZUluZm8sXG4gICAgICAgIGFic29sdXRlT2Zmc2V0LFxuICAgICAgICB0aGlzLl9pbnRlcnBvbGF0aW9uQ29uZmlnLFxuICAgICAgKTtcbiAgICAgIGlmIChhc3QpIHtcbiAgICAgICAgdGhpcy5fcmVwb3J0RXhwcmVzc2lvblBhcnNlckVycm9ycyhhc3QuZXJyb3JzLCBzb3VyY2VTcGFuKTtcbiAgICAgIH1cbiAgICAgIGlmICghYXN0IHx8IGFzdC5hc3QgaW5zdGFuY2VvZiBFbXB0eUV4cHIpIHtcbiAgICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoYEVtcHR5IGV4cHJlc3Npb25zIGFyZSBub3QgYWxsb3dlZGAsIHNvdXJjZVNwYW4pO1xuICAgICAgICByZXR1cm4gdGhpcy5fZXhwclBhcnNlci53cmFwTGl0ZXJhbFByaW1pdGl2ZSgnRVJST1InLCBzb3VyY2VJbmZvLCBhYnNvbHV0ZU9mZnNldCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gYXN0O1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRoaXMuX3JlcG9ydEVycm9yKGAke2V9YCwgc291cmNlU3Bhbik7XG4gICAgICByZXR1cm4gdGhpcy5fZXhwclBhcnNlci53cmFwTGl0ZXJhbFByaW1pdGl2ZSgnRVJST1InLCBzb3VyY2VJbmZvLCBhYnNvbHV0ZU9mZnNldCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfcmVwb3J0RXJyb3IoXG4gICAgbWVzc2FnZTogc3RyaW5nLFxuICAgIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICBsZXZlbDogUGFyc2VFcnJvckxldmVsID0gUGFyc2VFcnJvckxldmVsLkVSUk9SLFxuICApIHtcbiAgICB0aGlzLmVycm9ycy5wdXNoKG5ldyBQYXJzZUVycm9yKHNvdXJjZVNwYW4sIG1lc3NhZ2UsIGxldmVsKSk7XG4gIH1cblxuICBwcml2YXRlIF9yZXBvcnRFeHByZXNzaW9uUGFyc2VyRXJyb3JzKGVycm9yczogUGFyc2VyRXJyb3JbXSwgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuKSB7XG4gICAgZm9yIChjb25zdCBlcnJvciBvZiBlcnJvcnMpIHtcbiAgICAgIHRoaXMuX3JlcG9ydEVycm9yKGVycm9yLm1lc3NhZ2UsIHNvdXJjZVNwYW4pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0gcHJvcE5hbWUgdGhlIG5hbWUgb2YgdGhlIHByb3BlcnR5IC8gYXR0cmlidXRlXG4gICAqIEBwYXJhbSBzb3VyY2VTcGFuXG4gICAqIEBwYXJhbSBpc0F0dHIgdHJ1ZSB3aGVuIGJpbmRpbmcgdG8gYW4gYXR0cmlidXRlXG4gICAqL1xuICBwcml2YXRlIF92YWxpZGF0ZVByb3BlcnR5T3JBdHRyaWJ1dGVOYW1lKFxuICAgIHByb3BOYW1lOiBzdHJpbmcsXG4gICAgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgIGlzQXR0cjogYm9vbGVhbixcbiAgKTogdm9pZCB7XG4gICAgY29uc3QgcmVwb3J0ID0gaXNBdHRyXG4gICAgICA/IHRoaXMuX3NjaGVtYVJlZ2lzdHJ5LnZhbGlkYXRlQXR0cmlidXRlKHByb3BOYW1lKVxuICAgICAgOiB0aGlzLl9zY2hlbWFSZWdpc3RyeS52YWxpZGF0ZVByb3BlcnR5KHByb3BOYW1lKTtcbiAgICBpZiAocmVwb3J0LmVycm9yKSB7XG4gICAgICB0aGlzLl9yZXBvcnRFcnJvcihyZXBvcnQubXNnISwgc291cmNlU3BhbiwgUGFyc2VFcnJvckxldmVsLkVSUk9SKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB3aGV0aGVyIGEgcGFyc2VkIEFTVCBpcyBhbGxvd2VkIHRvIGJlIHVzZWQgd2l0aGluIHRoZSBldmVudCBzaWRlIG9mIGEgdHdvLXdheSBiaW5kaW5nLlxuICAgKiBAcGFyYW0gYXN0IFBhcnNlZCBBU1QgdG8gYmUgY2hlY2tlZC5cbiAgICovXG4gIHByaXZhdGUgX2lzQWxsb3dlZEFzc2lnbm1lbnRFdmVudChhc3Q6IEFTVCk6IGJvb2xlYW4ge1xuICAgIGlmIChhc3QgaW5zdGFuY2VvZiBBU1RXaXRoU291cmNlKSB7XG4gICAgICByZXR1cm4gdGhpcy5faXNBbGxvd2VkQXNzaWdubWVudEV2ZW50KGFzdC5hc3QpO1xuICAgIH1cblxuICAgIGlmIChhc3QgaW5zdGFuY2VvZiBOb25OdWxsQXNzZXJ0KSB7XG4gICAgICByZXR1cm4gdGhpcy5faXNBbGxvd2VkQXNzaWdubWVudEV2ZW50KGFzdC5leHByZXNzaW9uKTtcbiAgICB9XG5cbiAgICBpZiAoYXN0IGluc3RhbmNlb2YgUHJvcGVydHlSZWFkIHx8IGFzdCBpbnN0YW5jZW9mIEtleWVkUmVhZCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gVE9ETyhjcmlzYmV0byk6IHRoaXMgbG9naWMgaXMgb25seSBoZXJlIHRvIHN1cHBvcnQgdGhlIGF1dG9tYXRlZCBtaWdyYXRpb24gYXdheVxuICAgIC8vIGZyb20gaW52YWxpZCBiaW5kaW5ncy4gSXQgc2hvdWxkIGJlIHJlbW92ZWQgb25jZSB0aGUgbWlncmF0aW9uIGlzIGRlbGV0ZWQuXG4gICAgaWYgKCF0aGlzLl9hbGxvd0ludmFsaWRBc3NpZ25tZW50RXZlbnRzKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKGFzdCBpbnN0YW5jZW9mIEJpbmFyeSkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgKGFzdC5vcGVyYXRpb24gPT09ICcmJicgfHwgYXN0Lm9wZXJhdGlvbiA9PT0gJ3x8JyB8fCBhc3Qub3BlcmF0aW9uID09PSAnPz8nKSAmJlxuICAgICAgICAoYXN0LnJpZ2h0IGluc3RhbmNlb2YgUHJvcGVydHlSZWFkIHx8IGFzdC5yaWdodCBpbnN0YW5jZW9mIEtleWVkUmVhZClcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFzdCBpbnN0YW5jZW9mIENvbmRpdGlvbmFsIHx8IGFzdCBpbnN0YW5jZW9mIFByZWZpeE5vdDtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUGlwZUNvbGxlY3RvciBleHRlbmRzIFJlY3Vyc2l2ZUFzdFZpc2l0b3Ige1xuICBwaXBlcyA9IG5ldyBNYXA8c3RyaW5nLCBCaW5kaW5nUGlwZT4oKTtcbiAgb3ZlcnJpZGUgdmlzaXRQaXBlKGFzdDogQmluZGluZ1BpcGUsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgdGhpcy5waXBlcy5zZXQoYXN0Lm5hbWUsIGFzdCk7XG4gICAgYXN0LmV4cC52aXNpdCh0aGlzKTtcbiAgICB0aGlzLnZpc2l0QWxsKGFzdC5hcmdzLCBjb250ZXh0KTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG5mdW5jdGlvbiBpc0FuaW1hdGlvbkxhYmVsKG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gbmFtZVswXSA9PSAnQCc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYWxjUG9zc2libGVTZWN1cml0eUNvbnRleHRzKFxuICByZWdpc3RyeTogRWxlbWVudFNjaGVtYVJlZ2lzdHJ5LFxuICBzZWxlY3Rvcjogc3RyaW5nLFxuICBwcm9wTmFtZTogc3RyaW5nLFxuICBpc0F0dHJpYnV0ZTogYm9vbGVhbixcbik6IFNlY3VyaXR5Q29udGV4dFtdIHtcbiAgY29uc3QgY3R4czogU2VjdXJpdHlDb250ZXh0W10gPSBbXTtcbiAgQ3NzU2VsZWN0b3IucGFyc2Uoc2VsZWN0b3IpLmZvckVhY2goKHNlbGVjdG9yKSA9PiB7XG4gICAgY29uc3QgZWxlbWVudE5hbWVzID0gc2VsZWN0b3IuZWxlbWVudCA/IFtzZWxlY3Rvci5lbGVtZW50XSA6IHJlZ2lzdHJ5LmFsbEtub3duRWxlbWVudE5hbWVzKCk7XG4gICAgY29uc3Qgbm90RWxlbWVudE5hbWVzID0gbmV3IFNldChcbiAgICAgIHNlbGVjdG9yLm5vdFNlbGVjdG9yc1xuICAgICAgICAuZmlsdGVyKChzZWxlY3RvcikgPT4gc2VsZWN0b3IuaXNFbGVtZW50U2VsZWN0b3IoKSlcbiAgICAgICAgLm1hcCgoc2VsZWN0b3IpID0+IHNlbGVjdG9yLmVsZW1lbnQpLFxuICAgICk7XG4gICAgY29uc3QgcG9zc2libGVFbGVtZW50TmFtZXMgPSBlbGVtZW50TmFtZXMuZmlsdGVyKFxuICAgICAgKGVsZW1lbnROYW1lKSA9PiAhbm90RWxlbWVudE5hbWVzLmhhcyhlbGVtZW50TmFtZSksXG4gICAgKTtcblxuICAgIGN0eHMucHVzaChcbiAgICAgIC4uLnBvc3NpYmxlRWxlbWVudE5hbWVzLm1hcCgoZWxlbWVudE5hbWUpID0+XG4gICAgICAgIHJlZ2lzdHJ5LnNlY3VyaXR5Q29udGV4dChlbGVtZW50TmFtZSwgcHJvcE5hbWUsIGlzQXR0cmlidXRlKSxcbiAgICAgICksXG4gICAgKTtcbiAgfSk7XG4gIHJldHVybiBjdHhzLmxlbmd0aCA9PT0gMCA/IFtTZWN1cml0eUNvbnRleHQuTk9ORV0gOiBBcnJheS5mcm9tKG5ldyBTZXQoY3R4cykpLnNvcnQoKTtcbn1cblxuLyoqXG4gKiBDb21wdXRlIGEgbmV3IFBhcnNlU291cmNlU3BhbiBiYXNlZCBvZmYgYW4gb3JpZ2luYWwgYHNvdXJjZVNwYW5gIGJ5IHVzaW5nXG4gKiBhYnNvbHV0ZSBvZmZzZXRzIGZyb20gdGhlIHNwZWNpZmllZCBgYWJzb2x1dGVTcGFuYC5cbiAqXG4gKiBAcGFyYW0gc291cmNlU3BhbiBvcmlnaW5hbCBzb3VyY2Ugc3BhblxuICogQHBhcmFtIGFic29sdXRlU3BhbiBhYnNvbHV0ZSBzb3VyY2Ugc3BhbiB0byBtb3ZlIHRvXG4gKi9cbmZ1bmN0aW9uIG1vdmVQYXJzZVNvdXJjZVNwYW4oXG4gIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgYWJzb2x1dGVTcGFuOiBBYnNvbHV0ZVNvdXJjZVNwYW4sXG4pOiBQYXJzZVNvdXJjZVNwYW4ge1xuICAvLyBUaGUgZGlmZmVyZW5jZSBvZiB0d28gYWJzb2x1dGUgb2Zmc2V0cyBwcm92aWRlIHRoZSByZWxhdGl2ZSBvZmZzZXRcbiAgY29uc3Qgc3RhcnREaWZmID0gYWJzb2x1dGVTcGFuLnN0YXJ0IC0gc291cmNlU3Bhbi5zdGFydC5vZmZzZXQ7XG4gIGNvbnN0IGVuZERpZmYgPSBhYnNvbHV0ZVNwYW4uZW5kIC0gc291cmNlU3Bhbi5lbmQub2Zmc2V0O1xuICByZXR1cm4gbmV3IFBhcnNlU291cmNlU3BhbihcbiAgICBzb3VyY2VTcGFuLnN0YXJ0Lm1vdmVCeShzdGFydERpZmYpLFxuICAgIHNvdXJjZVNwYW4uZW5kLm1vdmVCeShlbmREaWZmKSxcbiAgICBzb3VyY2VTcGFuLmZ1bGxTdGFydC5tb3ZlQnkoc3RhcnREaWZmKSxcbiAgICBzb3VyY2VTcGFuLmRldGFpbHMsXG4gICk7XG59XG4iXX0=