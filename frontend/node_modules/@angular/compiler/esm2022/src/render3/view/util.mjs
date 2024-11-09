/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { InputFlags } from '../../core';
import { splitNsName } from '../../ml_parser/tags';
import * as o from '../../output/output_ast';
import { CssSelector } from '../../selector';
import * as t from '../r3_ast';
import { Identifiers as R3 } from '../r3_identifiers';
import { isI18nAttribute } from './i18n/util';
/**
 * Checks whether an object key contains potentially unsafe chars, thus the key should be wrapped in
 * quotes. Note: we do not wrap all keys into quotes, as it may have impact on minification and may
 * not work in some cases when object keys are mangled by a minifier.
 *
 * TODO(FW-1136): this is a temporary solution, we need to come up with a better way of working with
 * inputs that contain potentially unsafe chars.
 */
export const UNSAFE_OBJECT_KEY_NAME_REGEXP = /[-.]/;
/** Name of the temporary to use during data binding */
export const TEMPORARY_NAME = '_t';
/** Name of the context parameter passed into a template function */
export const CONTEXT_NAME = 'ctx';
/** Name of the RenderFlag passed into a template function */
export const RENDER_FLAGS = 'rf';
/** The prefix reference variables */
export const REFERENCE_PREFIX = '_r';
/** The name of the implicit context reference */
export const IMPLICIT_REFERENCE = '$implicit';
/** Non bindable attribute name **/
export const NON_BINDABLE_ATTR = 'ngNonBindable';
/** Name for the variable keeping track of the context returned by `ɵɵrestoreView`. */
export const RESTORED_VIEW_CONTEXT_NAME = 'restoredCtx';
/** Special value representing a direct access to a template's context. */
export const DIRECT_CONTEXT_REFERENCE = '#context';
/**
 * Maximum length of a single instruction chain. Because our output AST uses recursion, we're
 * limited in how many expressions we can nest before we reach the call stack limit. This
 * length is set very conservatively in order to reduce the chance of problems.
 */
const MAX_CHAIN_LENGTH = 500;
/** Instructions that support chaining. */
const CHAINABLE_INSTRUCTIONS = new Set([
    R3.element,
    R3.elementStart,
    R3.elementEnd,
    R3.elementContainer,
    R3.elementContainerStart,
    R3.elementContainerEnd,
    R3.i18nExp,
    R3.listener,
    R3.classProp,
    R3.syntheticHostListener,
    R3.hostProperty,
    R3.syntheticHostProperty,
    R3.property,
    R3.propertyInterpolate1,
    R3.propertyInterpolate2,
    R3.propertyInterpolate3,
    R3.propertyInterpolate4,
    R3.propertyInterpolate5,
    R3.propertyInterpolate6,
    R3.propertyInterpolate7,
    R3.propertyInterpolate8,
    R3.propertyInterpolateV,
    R3.attribute,
    R3.attributeInterpolate1,
    R3.attributeInterpolate2,
    R3.attributeInterpolate3,
    R3.attributeInterpolate4,
    R3.attributeInterpolate5,
    R3.attributeInterpolate6,
    R3.attributeInterpolate7,
    R3.attributeInterpolate8,
    R3.attributeInterpolateV,
    R3.styleProp,
    R3.stylePropInterpolate1,
    R3.stylePropInterpolate2,
    R3.stylePropInterpolate3,
    R3.stylePropInterpolate4,
    R3.stylePropInterpolate5,
    R3.stylePropInterpolate6,
    R3.stylePropInterpolate7,
    R3.stylePropInterpolate8,
    R3.stylePropInterpolateV,
    R3.textInterpolate,
    R3.textInterpolate1,
    R3.textInterpolate2,
    R3.textInterpolate3,
    R3.textInterpolate4,
    R3.textInterpolate5,
    R3.textInterpolate6,
    R3.textInterpolate7,
    R3.textInterpolate8,
    R3.textInterpolateV,
    R3.templateCreate,
    R3.twoWayProperty,
    R3.twoWayListener,
]);
/** Generates a call to a single instruction. */
export function invokeInstruction(span, reference, params) {
    return o.importExpr(reference, null, span).callFn(params, span);
}
/**
 * Creates an allocator for a temporary variable.
 *
 * A variable declaration is added to the statements the first time the allocator is invoked.
 */
export function temporaryAllocator(pushStatement, name) {
    let temp = null;
    return () => {
        if (!temp) {
            pushStatement(new o.DeclareVarStmt(TEMPORARY_NAME, undefined, o.DYNAMIC_TYPE));
            temp = o.variable(name);
        }
        return temp;
    };
}
export function invalid(arg) {
    throw new Error(`Invalid state: Visitor ${this.constructor.name} doesn't handle ${arg.constructor.name}`);
}
export function asLiteral(value) {
    if (Array.isArray(value)) {
        return o.literalArr(value.map(asLiteral));
    }
    return o.literal(value, o.INFERRED_TYPE);
}
/**
 * Serializes inputs and outputs for `defineDirective` and `defineComponent`.
 *
 * This will attempt to generate optimized data structures to minimize memory or
 * file size of fully compiled applications.
 */
export function conditionallyCreateDirectiveBindingLiteral(map, forInputs) {
    const keys = Object.getOwnPropertyNames(map);
    if (keys.length === 0) {
        return null;
    }
    return o.literalMap(keys.map(key => {
        const value = map[key];
        let declaredName;
        let publicName;
        let minifiedName;
        let expressionValue;
        if (typeof value === 'string') {
            // canonical syntax: `dirProp: publicProp`
            declaredName = key;
            minifiedName = key;
            publicName = value;
            expressionValue = asLiteral(publicName);
        }
        else {
            minifiedName = key;
            declaredName = value.classPropertyName;
            publicName = value.bindingPropertyName;
            const differentDeclaringName = publicName !== declaredName;
            const hasDecoratorInputTransform = value.transformFunction !== null;
            // Build up input flags
            let flags = null;
            if (value.isSignal) {
                flags = bitwiseOrInputFlagsExpr(InputFlags.SignalBased, flags);
            }
            if (hasDecoratorInputTransform) {
                flags = bitwiseOrInputFlagsExpr(InputFlags.HasDecoratorInputTransform, flags);
            }
            // Inputs, compared to outputs, will track their declared name (for `ngOnChanges`), support
            // decorator input transform functions, or store flag information if there is any.
            if (forInputs && (differentDeclaringName || hasDecoratorInputTransform || flags !== null)) {
                const flagsExpr = flags ?? o.importExpr(R3.InputFlags).prop(InputFlags[InputFlags.None]);
                const result = [flagsExpr, asLiteral(publicName)];
                if (differentDeclaringName || hasDecoratorInputTransform) {
                    result.push(asLiteral(declaredName));
                    if (hasDecoratorInputTransform) {
                        result.push(value.transformFunction);
                    }
                }
                expressionValue = o.literalArr(result);
            }
            else {
                expressionValue = asLiteral(publicName);
            }
        }
        return {
            key: minifiedName,
            // put quotes around keys that contain potentially unsafe characters
            quoted: UNSAFE_OBJECT_KEY_NAME_REGEXP.test(minifiedName),
            value: expressionValue,
        };
    }));
}
/** Gets an output AST expression referencing the given flag. */
function getInputFlagExpr(flag) {
    return o.importExpr(R3.InputFlags).prop(InputFlags[flag]);
}
/** Combines a given input flag with an existing flag expression, if present. */
function bitwiseOrInputFlagsExpr(flag, expr) {
    if (expr === null) {
        return getInputFlagExpr(flag);
    }
    return getInputFlagExpr(flag).bitwiseOr(expr);
}
/**
 *  Remove trailing null nodes as they are implied.
 */
export function trimTrailingNulls(parameters) {
    while (o.isNull(parameters[parameters.length - 1])) {
        parameters.pop();
    }
    return parameters;
}
/**
 * A representation for an object literal used during codegen of definition objects. The generic
 * type `T` allows to reference a documented type of the generated structure, such that the
 * property names that are set can be resolved to their documented declaration.
 */
export class DefinitionMap {
    constructor() {
        this.values = [];
    }
    set(key, value) {
        if (value) {
            const existing = this.values.find(value => value.key === key);
            if (existing) {
                existing.value = value;
            }
            else {
                this.values.push({ key: key, value, quoted: false });
            }
        }
    }
    toLiteralMap() {
        return o.literalMap(this.values);
    }
}
/**
 * Creates a `CssSelector` from an AST node.
 */
export function createCssSelectorFromNode(node) {
    const elementName = node instanceof t.Element ? node.name : 'ng-template';
    const attributes = getAttrsForDirectiveMatching(node);
    const cssSelector = new CssSelector();
    const elementNameNoNs = splitNsName(elementName)[1];
    cssSelector.setElement(elementNameNoNs);
    Object.getOwnPropertyNames(attributes).forEach((name) => {
        const nameNoNs = splitNsName(name)[1];
        const value = attributes[name];
        cssSelector.addAttribute(nameNoNs, value);
        if (name.toLowerCase() === 'class') {
            const classes = value.trim().split(/\s+/);
            classes.forEach(className => cssSelector.addClassName(className));
        }
    });
    return cssSelector;
}
/**
 * Extract a map of properties to values for a given element or template node, which can be used
 * by the directive matching machinery.
 *
 * @param elOrTpl the element or template in question
 * @return an object set up for directive matching. For attributes on the element/template, this
 * object maps a property name to its (static) value. For any bindings, this map simply maps the
 * property name to an empty string.
 */
function getAttrsForDirectiveMatching(elOrTpl) {
    const attributesMap = {};
    if (elOrTpl instanceof t.Template && elOrTpl.tagName !== 'ng-template') {
        elOrTpl.templateAttrs.forEach(a => attributesMap[a.name] = '');
    }
    else {
        elOrTpl.attributes.forEach(a => {
            if (!isI18nAttribute(a.name)) {
                attributesMap[a.name] = a.value;
            }
        });
        elOrTpl.inputs.forEach(i => {
            if (i.type === 0 /* BindingType.Property */ || i.type === 5 /* BindingType.TwoWay */) {
                attributesMap[i.name] = '';
            }
        });
        elOrTpl.outputs.forEach(o => {
            attributesMap[o.name] = '';
        });
    }
    return attributesMap;
}
/**
 * Gets the number of arguments expected to be passed to a generated instruction in the case of
 * interpolation instructions.
 * @param interpolation An interpolation ast
 */
export function getInterpolationArgsLength(interpolation) {
    const { expressions, strings } = interpolation;
    if (expressions.length === 1 && strings.length === 2 && strings[0] === '' && strings[1] === '') {
        // If the interpolation has one interpolated value, but the prefix and suffix are both empty
        // strings, we only pass one argument, to a special instruction like `propertyInterpolate` or
        // `textInterpolate`.
        return 1;
    }
    else {
        return expressions.length + strings.length;
    }
}
/**
 * Generates the final instruction call statements based on the passed in configuration.
 * Will try to chain instructions as much as possible, if chaining is supported.
 */
export function getInstructionStatements(instructions) {
    const statements = [];
    let pendingExpression = null;
    let pendingExpressionType = null;
    let chainLength = 0;
    for (const current of instructions) {
        const resolvedParams = (typeof current.paramsOrFn === 'function' ? current.paramsOrFn() : current.paramsOrFn) ??
            [];
        const params = Array.isArray(resolvedParams) ? resolvedParams : [resolvedParams];
        // If the current instruction is the same as the previous one
        // and it can be chained, add another call to the chain.
        if (chainLength < MAX_CHAIN_LENGTH && pendingExpressionType === current.reference &&
            CHAINABLE_INSTRUCTIONS.has(pendingExpressionType)) {
            // We'll always have a pending expression when there's a pending expression type.
            pendingExpression = pendingExpression.callFn(params, pendingExpression.sourceSpan);
            chainLength++;
        }
        else {
            if (pendingExpression !== null) {
                statements.push(pendingExpression.toStmt());
            }
            pendingExpression = invokeInstruction(current.span, current.reference, params);
            pendingExpressionType = current.reference;
            chainLength = 0;
        }
    }
    // Since the current instruction adds the previous one to the statements,
    // we may be left with the final one at the end that is still pending.
    if (pendingExpression !== null) {
        statements.push(pendingExpression.toStmt());
    }
    return statements;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9yZW5kZXIzL3ZpZXcvdXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sWUFBWSxDQUFDO0FBRXRDLE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUNqRCxPQUFPLEtBQUssQ0FBQyxNQUFNLHlCQUF5QixDQUFDO0FBRTdDLE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUMzQyxPQUFPLEtBQUssQ0FBQyxNQUFNLFdBQVcsQ0FBQztBQUMvQixPQUFPLEVBQUMsV0FBVyxJQUFJLEVBQUUsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBRXBELE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFHNUM7Ozs7Ozs7R0FPRztBQUNILE1BQU0sQ0FBQyxNQUFNLDZCQUE2QixHQUFHLE1BQU0sQ0FBQztBQUVwRCx1REFBdUQ7QUFDdkQsTUFBTSxDQUFDLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQztBQUVuQyxvRUFBb0U7QUFDcEUsTUFBTSxDQUFDLE1BQU0sWUFBWSxHQUFHLEtBQUssQ0FBQztBQUVsQyw2REFBNkQ7QUFDN0QsTUFBTSxDQUFDLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQztBQUVqQyxxQ0FBcUM7QUFDckMsTUFBTSxDQUFDLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO0FBRXJDLGlEQUFpRDtBQUNqRCxNQUFNLENBQUMsTUFBTSxrQkFBa0IsR0FBRyxXQUFXLENBQUM7QUFFOUMsbUNBQW1DO0FBQ25DLE1BQU0sQ0FBQyxNQUFNLGlCQUFpQixHQUFHLGVBQWUsQ0FBQztBQUVqRCxzRkFBc0Y7QUFDdEYsTUFBTSxDQUFDLE1BQU0sMEJBQTBCLEdBQUcsYUFBYSxD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QVUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztZQUM5QyxDQUFDO1lBQ0QsaUJBQWlCLEdBQUcsaUJBQWlCLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQy9FLHFCQUFxQixHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUM7WUFDMUMsV0FBVyxHQUFHLENBQUMsQ0FBQztRQUNsQixDQUFDO0lBQ0gsQ0FBQztJQUVELHlFQUF5RTtJQUN6RSxzRUFBc0U7SUFDdEUsSUFBSSxpQkFBaUIsS0FBSyxJQUFJLEVBQUUsQ0FBQztRQUMvQixVQUFVLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUVELE9BQU8sVUFBVSxDQUFDO0FBQ3BCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbnB1dEZsYWdzfSBmcm9tICcuLi8uLi9jb3JlJztcbmltcG9ydCB7QmluZGluZ1R5cGUsIEludGVycG9sYXRpb259IGZyb20gJy4uLy4uL2V4cHJlc3Npb25fcGFyc2VyL2FzdCc7XG5pbXBvcnQge3NwbGl0TnNOYW1lfSBmcm9tICcuLi8uLi9tbF9wYXJzZXIvdGFncyc7XG5pbXBvcnQgKiBhcyBvIGZyb20gJy4uLy4uL291dHB1dC9vdXRwdXRfYXN0JztcbmltcG9ydCB7UGFyc2VTb3VyY2VTcGFufSBmcm9tICcuLi8uLi9wYXJzZV91dGlsJztcbmltcG9ydCB7Q3NzU2VsZWN0b3J9IGZyb20gJy4uLy4uL3NlbGVjdG9yJztcbmltcG9ydCAqIGFzIHQgZnJvbSAnLi4vcjNfYXN0JztcbmltcG9ydCB7SWRlbnRpZmllcnMgYXMgUjN9IGZyb20gJy4uL3IzX2lkZW50aWZpZXJzJztcblxuaW1wb3J0IHtpc0kxOG5BdHRyaWJ1dGV9IGZyb20gJy4vaTE4bi91dGlsJztcblxuXG4vKipcbiAqIENoZWNrcyB3aGV0aGVyIGFuIG9iamVjdCBrZXkgY29udGFpbnMgcG90ZW50aWFsbHkgdW5zYWZlIGNoYXJzLCB0aHVzIHRoZSBrZXkgc2hvdWxkIGJlIHdyYXBwZWQgaW5cbiAqIHF1b3Rlcy4gTm90ZTogd2UgZG8gbm90IHdyYXAgYWxsIGtleXMgaW50byBxdW90ZXMsIGFzIGl0IG1heSBoYXZlIGltcGFjdCBvbiBtaW5pZmljYXRpb24gYW5kIG1heVxuICogbm90IHdvcmsgaW4gc29tZSBjYXNlcyB3aGVuIG9iamVjdCBrZXlzIGFyZSBtYW5nbGVkIGJ5IGEgbWluaWZpZXIuXG4gKlxuICogVE9ETyhGVy0xMTM2KTogdGhpcyBpcyBhIHRlbXBvcmFyeSBzb2x1dGlvbiwgd2UgbmVlZCB0byBjb21lIHVwIHdpdGggYSBiZXR0ZXIgd2F5IG9mIHdvcmtpbmcgd2l0aFxuICogaW5wdXRzIHRoYXQgY29udGFpbiBwb3RlbnRpYWxseSB1bnNhZmUgY2hhcnMuXG4gKi9cbmV4cG9ydCBjb25zdCBVTlNBRkVfT0JKRUNUX0tFWV9OQU1FX1JFR0VYUCA9IC9bLS5dLztcblxuLyoqIE5hbWUgb2YgdGhlIHRlbXBvcmFyeSB0byB1c2UgZHVyaW5nIGRhdGEgYmluZGluZyAqL1xuZXhwb3J0IGNvbnN0IFRFTVBPUkFSWV9OQU1FID0gJ190JztcblxuLyoqIE5hbWUgb2YgdGhlIGNvbnRleHQgcGFyYW1ldGVyIHBhc3NlZCBpbnRvIGEgdGVtcGxhdGUgZnVuY3Rpb24gKi9cbmV4cG9ydCBjb25zdCBDT05URVhUX05BTUUgPSAnY3R4JztcblxuLyoqIE5hbWUgb2YgdGhlIFJlbmRlckZsYWcgcGFzc2VkIGludG8gYSB0ZW1wbGF0ZSBmdW5jdGlvbiAqL1xuZXhwb3J0IGNvbnN0IFJFTkRFUl9GTEFHUyA9ICdyZic7XG5cbi8qKiBUaGUgcHJlZml4IHJlZmVyZW5jZSB2YXJpYWJsZXMgKi9cbmV4cG9ydCBjb25zdCBSRUZFUkVOQ0VfUFJFRklYID0gJ19yJztcblxuLyoqIFRoZSBuYW1lIG9mIHRoZSBpbXBsaWNpdCBjb250ZXh0IHJlZmVyZW5jZSAqL1xuZXhwb3J0IGNvbnN0IElNUExJQ0lUX1JFRkVSRU5DRSA9ICckaW1wbGljaXQnO1xuXG4vKiogTm9uIGJpbmRhYmxlIGF0dHJpYnV0ZSBuYW1lICoqL1xuZXhwb3J0IGNvbnN0IE5PTl9CSU5EQUJMRV9BVFRSID0gJ25nTm9uQmluZGFibGUnO1xuXG4vKiogTmFtZSBmb3IgdGhlIHZhcmlhYmxlIGtlZXBpbmcgdHJhY2sgb2YgdGhlIGNvbnRleHQgcmV0dXJuZWQgYnkgYMm1ybVyZXN0b3JlVmlld2AuICovXG5leHBvcnQgY29uc3QgUkVTVE9SRURfVklFV19DT05URVhUX05BTUUgPSAncmVzdG9yZWRDdHgnO1xuXG4vKiogU3BlY2lhbCB2YWx1ZSByZXByZXNlbnRpbmcgYSBkaXJlY3QgYWNjZXNzIHRvIGEgdGVtcGxhdGUncyBjb250ZXh0LiAqL1xuZXhwb3J0IGNvbnN0IERJUkVDVF9DT05URVhUX1JFRkVSRU5DRSA9ICcjY29udGV4dCc7XG5cbi8qKlxuICogTWF4aW11bSBsZW5ndGggb2YgYSBzaW5nbGUgaW5zdHJ1Y3Rpb24gY2hhaW4uIEJlY2F1c2Ugb3VyIG91dHB1dCBBU1QgdXNlcyByZWN1cnNpb24sIHdlJ3JlXG4gKiBsaW1pdGVkIGluIGhvdyBtYW55IGV4cHJlc3Npb25zIHdlIGNhbiBuZXN0IGJlZm9yZSB3ZSByZWFjaCB0aGUgY2FsbCBzdGFjayBsaW1pdC4gVGhpc1xuICogbGVuZ3RoIGlzIHNldCB2ZXJ5IGNvbnNlcnZhdGl2ZWx5IGluIG9yZGVyIHRvIHJlZHVjZSB0aGUgY2hhbmNlIG9mIHByb2JsZW1zLlxuICovXG5jb25zdCBNQVhfQ0hBSU5fTEVOR1RIID0gNTAwO1xuXG4vKiogSW5zdHJ1Y3Rpb25zIHRoYXQgc3VwcG9ydCBjaGFpbmluZy4gKi9cbmNvbnN0IENIQUlOQUJMRV9JTlNUUlVDVElPTlMgPSBuZXcgU2V0KFtcbiAgUjMuZWxlbWVudCxcbiAgUjMuZWxlbWVudFN0YXJ0LFxuICBSMy5lbGVtZW50RW5kLFxuICBSMy5lbGVtZW50Q29udGFpbmVyLFxuICBSMy5lbGVtZW50Q29udGFpbmVyU3RhcnQsXG4gIFIzLmVsZW1lbnRDb250YWluZXJFbmQsXG4gIFIzLmkxOG5FeHAsXG4gIFIzLmxpc3RlbmVyLFxuICBSMy5jbGFzc1Byb3AsXG4gIFIzLnN5bnRoZXRpY0hvc3RMaXN0ZW5lcixcbiAgUjMuaG9zdFByb3BlcnR5LFxuICBSMy5zeW50aGV0aWNIb3N0UHJvcGVydHksXG4gIFIzLnByb3BlcnR5LFxuICBSMy5wcm9wZXJ0eUludGVycG9sYXRlMSxcbiAgUjMucHJvcGVydHlJbnRlcnBvbGF0ZTIsXG4gIFIzLnByb3BlcnR5SW50ZXJwb2xhdGUzLFxuICBSMy5wcm9wZXJ0eUludGVycG9sYXRlNCxcbiAgUjMucHJvcGVydHlJbnRlcnBvbGF0ZTUsXG4gIFIzLnByb3BlcnR5SW50ZXJwb2xhdGU2LFxuICBSMy5wcm9wZXJ0eUludGVycG9sYXRlNyxcbiAgUjMucHJvcGVydHlJbnRlcnBvbGF0ZTgsXG4gIFIzLnByb3BlcnR5SW50ZXJwb2xhdGVWLFxuICBSMy5hdHRyaWJ1dGUsXG4gIFIzLmF0dHJpYnV0ZUludGVycG9sYXRlMSxcbiAgUjMuYXR0cmlidXRlSW50ZXJwb2xhdGUyLFxuICBSMy5hdHRyaWJ1dGVJbnRlcnBvbGF0ZTMsXG4gIFIzLmF0dHJpYnV0ZUludGVycG9sYXRlNCxcbiAgUjMuYXR0cmlidXRlSW50ZXJwb2xhdGU1LFxuICBSMy5hdHRyaWJ1dGVJbnRlcnBvbGF0ZTYsXG4gIFIzLmF0dHJpYnV0ZUludGVycG9sYXRlNyxcbiAgUjMuYXR0cmlidXRlSW50ZXJwb2xhdGU4LFxuICBSMy5hdHRyaWJ1dGVJbnRlcnBvbGF0ZVYsXG4gIFIzLnN0eWxlUHJvcCxcbiAgUjMuc3R5bGVQcm9wSW50ZXJwb2xhdGUxLFxuICBSMy5zdHlsZVByb3BJbnRlcnBvbGF0ZTIsXG4gIFIzLnN0eWxlUHJvcEludGVycG9sYXRlMyxcbiAgUjMuc3R5bGVQcm9wSW50ZXJwb2xhdGU0LFxuICBSMy5zdHlsZVByb3BJbnRlcnBvbGF0ZTUsXG4gIFIzLnN0eWxlUHJvcEludGVycG9sYXRlNixcbiAgUjMuc3R5bGVQcm9wSW50ZXJwb2xhdGU3LFxuICBSMy5zdHlsZVByb3BJbnRlcnBvbGF0ZTgsXG4gIFIzLnN0eWxlUHJvcEludGVycG9sYXRlVixcbiAgUjMudGV4dEludGVycG9sYXRlLFxuICBSMy50ZXh0SW50ZXJwb2xhdGUxLFxuICBSMy50ZXh0SW50ZXJwb2xhdGUyLFxuICBSMy50ZXh0SW50ZXJwb2xhdGUzLFxuICBSMy50ZXh0SW50ZXJwb2xhdGU0LFxuICBSMy50ZXh0SW50ZXJwb2xhdGU1LFxuICBSMy50ZXh0SW50ZXJwb2xhdGU2LFxuICBSMy50ZXh0SW50ZXJwb2xhdGU3LFxuICBSMy50ZXh0SW50ZXJwb2xhdGU4LFxuICBSMy50ZXh0SW50ZXJwb2xhdGVWLFxuICBSMy50ZW1wbGF0ZUNyZWF0ZSxcbiAgUjMudHdvV2F5UHJvcGVydHksXG4gIFIzLnR3b1dheUxpc3RlbmVyLFxuXSk7XG5cbi8qKlxuICogUG9zc2libGUgdHlwZXMgdGhhdCBjYW4gYmUgdXNlZCB0byBnZW5lcmF0ZSB0aGUgcGFyYW1ldGVycyBvZiBhbiBpbnN0cnVjdGlvbiBjYWxsLlxuICogSWYgdGhlIHBhcmFtZXRlcnMgYXJlIGEgZnVuY3Rpb24sIHRoZSBmdW5jdGlvbiB3aWxsIGJlIGludm9rZWQgYXQgdGhlIHRpbWUgdGhlIGluc3RydWN0aW9uXG4gKiBpcyBnZW5lcmF0ZWQuXG4gKi9cbmV4cG9ydCB0eXBlIEluc3RydWN0aW9uUGFyYW1zID0gKG8uRXhwcmVzc2lvbnxvLkV4cHJlc3Npb25bXSl8KCgpID0+IChvLkV4cHJlc3Npb258by5FeHByZXNzaW9uW10pKTtcblxuLyoqIE5lY2Vzc2FyeSBpbmZvcm1hdGlvbiB0byBnZW5lcmF0ZSBhIGNhbGwgdG8gYW4gaW5zdHJ1Y3Rpb24gZnVuY3Rpb24uICovXG5leHBvcnQgaW50ZXJmYWNlIEluc3RydWN0aW9uIHtcbiAgc3BhbjogUGFyc2VTb3VyY2VTcGFufG51bGw7XG4gIHJlZmVyZW5jZTogby5FeHRlcm5hbFJlZmVyZW5jZTtcbiAgcGFyYW1zT3JGbj86IEluc3RydWN0aW9uUGFyYW1zO1xufVxuXG4vKiogR2VuZXJhdGVzIGEgY2FsbCB0byBhIHNpbmdsZSBpbnN0cnVjdGlvbi4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnZva2VJbnN0cnVjdGlvbihcbiAgICBzcGFuOiBQYXJzZVNvdXJjZVNwYW58bnVsbCwgcmVmZXJlbmNlOiBvLkV4dGVybmFsUmVmZXJlbmNlLFxuICAgIHBhcmFtczogby5FeHByZXNzaW9uW10pOiBvLkV4cHJlc3Npb24ge1xuICByZXR1cm4gby5pbXBvcnRFeHByKHJlZmVyZW5jZSwgbnVsbCwgc3BhbikuY2FsbEZuKHBhcmFtcywgc3Bhbik7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhbGxvY2F0b3IgZm9yIGEgdGVtcG9yYXJ5IHZhcmlhYmxlLlxuICpcbiAqIEEgdmFyaWFibGUgZGVjbGFyYXRpb24gaXMgYWRkZWQgdG8gdGhlIHN0YXRlbWVudHMgdGhlIGZpcnN0IHRpbWUgdGhlIGFsbG9jYXRvciBpcyBpbnZva2VkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdGVtcG9yYXJ5QWxsb2NhdG9yKHB1c2hTdGF0ZW1lbnQ6IChzdDogby5TdGF0ZW1lbnQpID0+IHZvaWQsIG5hbWU6IHN0cmluZyk6ICgpID0+XG4gICAgby5SZWFkVmFyRXhwciB7XG4gIGxldCB0ZW1wOiBvLlJlYWRWYXJFeHByfG51bGwgPSBudWxsO1xuICByZXR1cm4gKCkgPT4ge1xuICAgIGlmICghdGVtcCkge1xuICAgICAgcHVzaFN0YXRlbWVudChuZXcgby5EZWNsYXJlVmFyU3RtdChURU1QT1JBUllfTkFNRSwgdW5kZWZpbmVkLCBvLkRZTkFNSUNfVFlQRSkpO1xuICAgICAgdGVtcCA9IG8udmFyaWFibGUobmFtZSk7XG4gICAgfVxuICAgIHJldHVybiB0ZW1wO1xuICB9O1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBpbnZhbGlkPFQ+KHRoaXM6IHQuVmlzaXRvciwgYXJnOiBvLkV4cHJlc3Npb258by5TdGF0ZW1lbnR8dC5Ob2RlKTogbmV2ZXIge1xuICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgSW52YWxpZCBzdGF0ZTogVmlzaXRvciAke3RoaXMuY29uc3RydWN0b3IubmFtZX0gZG9lc24ndCBoYW5kbGUgJHthcmcuY29uc3RydWN0b3IubmFtZX1gKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFzTGl0ZXJhbCh2YWx1ZTogYW55KTogby5FeHByZXNzaW9uIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgcmV0dXJuIG8ubGl0ZXJhbEFycih2YWx1ZS5tYXAoYXNMaXRlcmFsKSk7XG4gIH1cbiAgcmV0dXJuIG8ubGl0ZXJhbCh2YWx1ZSwgby5JTkZFUlJFRF9UWVBFKTtcbn1cblxuLyoqXG4gKiBTZXJpYWxpemVzIGlucHV0cyBhbmQgb3V0cHV0cyBmb3IgYGRlZmluZURpcmVjdGl2ZWAgYW5kIGBkZWZpbmVDb21wb25lbnRgLlxuICpcbiAqIFRoaXMgd2lsbCBhdHRlbXB0IHRvIGdlbmVyYXRlIG9wdGltaXplZCBkYXRhIHN0cnVjdHVyZXMgdG8gbWluaW1pemUgbWVtb3J5IG9yXG4gKiBmaWxlIHNpemUgb2YgZnVsbHkgY29tcGlsZWQgYXBwbGljYXRpb25zLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY29uZGl0aW9uYWxseUNyZWF0ZURpcmVjdGl2ZUJpbmRpbmdMaXRlcmFsKFxuICAgIG1hcDogUmVjb3JkPHN0cmluZywgc3RyaW5nfHtcbiAgICAgIGNsYXNzUHJvcGVydHlOYW1lOiBzdHJpbmc7XG4gICAgICBiaW5kaW5nUHJvcGVydHlOYW1lOiBzdHJpbmc7XG4gICAgICB0cmFuc2Zvcm1GdW5jdGlvbjogby5FeHByZXNzaW9ufG51bGw7XG4gICAgICBpc1NpZ25hbDogYm9vbGVhbixcbiAgICB9PiwgZm9ySW5wdXRzPzogYm9vbGVhbik6IG8uRXhwcmVzc2lvbnxudWxsIHtcbiAgY29uc3Qga2V5cyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKG1hcCk7XG5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICByZXR1cm4gby5saXRlcmFsTWFwKGtleXMubWFwKGtleSA9PiB7XG4gICAgY29uc3QgdmFsdWUgPSBtYXBba2V5XTtcbiAgICBsZXQgZGVjbGFyZWROYW1lOiBzdHJpbmc7XG4gICAgbGV0IHB1YmxpY05hbWU6IHN0cmluZztcbiAgICBsZXQgbWluaWZpZWROYW1lOiBzdHJpbmc7XG4gICAgbGV0IGV4cHJlc3Npb25WYWx1ZTogby5FeHByZXNzaW9uO1xuXG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIC8vIGNhbm9uaWNhbCBzeW50YXg6IGBkaXJQcm9wOiBwdWJsaWNQcm9wYFxuICAgICAgZGVjbGFyZWROYW1lID0ga2V5O1xuICAgICAgbWluaWZpZWROYW1lID0ga2V5O1xuICAgICAgcHVibGljTmFtZSA9IHZhbHVlO1xuICAgICAgZXhwcmVzc2lvblZhbHVlID0gYXNMaXRlcmFsKHB1YmxpY05hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBtaW5pZmllZE5hbWUgPSBrZXk7XG4gICAgICBkZWNsYXJlZE5hbWUgPSB2YWx1ZS5jbGFzc1Byb3BlcnR5TmFtZTtcbiAgICAgIHB1YmxpY05hbWUgPSB2YWx1ZS5iaW5kaW5nUHJvcGVydHlOYW1lO1xuXG4gICAgICBjb25zdCBkaWZmZXJlbnREZWNsYXJpbmdOYW1lID0gcHVibGljTmFtZSAhPT0gZGVjbGFyZWROYW1lO1xuICAgICAgY29uc3QgaGFzRGVjb3JhdG9ySW5wdXRUcmFuc2Zvcm0gPSB2YWx1ZS50cmFuc2Zvcm1GdW5jdGlvbiAhPT0gbnVsbDtcblxuICAgICAgLy8gQnVpbGQgdXAgaW5wdXQgZmxhZ3NcbiAgICAgIGxldCBmbGFnczogby5FeHByZXNzaW9ufG51bGwgPSBudWxsO1xuICAgICAgaWYgKHZhbHVlLmlzU2lnbmFsKSB7XG4gICAgICAgIGZsYWdzID0gYml0d2lzZU9ySW5wdXRGbGFnc0V4cHIoSW5wdXRGbGFncy5TaWduYWxCYXNlZCwgZmxhZ3MpO1xuICAgICAgfVxuICAgICAgaWYgKGhhc0RlY29yYXRvcklucHV0VHJhbnNmb3JtKSB7XG4gICAgICAgIGZsYWdzID0gYml0d2lzZU9ySW5wdXRGbGFnc0V4cHIoSW5wdXRGbGFncy5IYXNEZWNvcmF0b3JJbnB1dFRyYW5zZm9ybSwgZmxhZ3MpO1xuICAgICAgfVxuXG4gICAgICAvLyBJbnB1dHMsIGNvbXBhcmVkIHRvIG91dHB1dHMsIHdpbGwgdHJhY2sgdGhlaXIgZGVjbGFyZWQgbmFtZSAoZm9yIGBuZ09uQ2hhbmdlc2ApLCBzdXBwb3J0XG4gICAgICAvLyBkZWNvcmF0b3IgaW5wdXQgdHJhbnNmb3JtIGZ1bmN0aW9ucywgb3Igc3RvcmUgZmxhZyBpbmZvcm1hdGlvbiBpZiB0aGVyZSBpcyBhbnkuXG4gICAgICBpZiAoZm9ySW5wdXRzICYmIChkaWZmZXJlbnREZWNsYXJpbmdOYW1lIHx8IGhhc0RlY29yYXRvcklucHV0VHJhbnNmb3JtIHx8IGZsYWdzICE9PSBudWxsKSkge1xuICAgICAgICBjb25zdCBmbGFnc0V4cHIgPSBmbGFncyA/PyBvLmltcG9ydEV4cHIoUjMuSW5wdXRGbGFncykucHJvcChJbnB1dEZsYWdzW0lucHV0RmxhZ3MuTm9uZV0pO1xuICAgICAgICBjb25zdCByZXN1bHQ6IG8uRXhwcmVzc2lvbltdID0gW2ZsYWdzRXhwciwgYXNMaXRlcmFsKHB1YmxpY05hbWUpXTtcblxuICAgICAgICBpZiAoZGlmZmVyZW50RGVjbGFyaW5nTmFtZSB8fCBoYXNEZWNvcmF0b3JJbnB1dFRyYW5zZm9ybSkge1xuICAgICAgICAgIHJlc3VsdC5wdXNoKGFzTGl0ZXJhbChkZWNsYXJlZE5hbWUpKTtcblxuICAgICAgICAgIGlmIChoYXNEZWNvcmF0b3JJbnB1dFRyYW5zZm9ybSkge1xuICAgICAgICAgICAgcmVzdWx0LnB1c2godmFsdWUudHJhbnNmb3JtRnVuY3Rpb24hKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBleHByZXNzaW9uVmFsdWUgPSBvLmxpdGVyYWxBcnIocmVzdWx0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGV4cHJlc3Npb25WYWx1ZSA9IGFzTGl0ZXJhbChwdWJsaWNOYW1lKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAga2V5OiBtaW5pZmllZE5hbWUsXG4gICAgICAvLyBwdXQgcXVvdGVzIGFyb3VuZCBrZXlzIHRoYXQgY29udGFpbiBwb3RlbnRpYWxseSB1bnNhZmUgY2hhcmFjdGVyc1xuICAgICAgcXVvdGVkOiBVTlNBRkVfT0JKRUNUX0tFWV9OQU1FX1JFR0VYUC50ZXN0KG1pbmlmaWVkTmFtZSksXG4gICAgICB2YWx1ZTogZXhwcmVzc2lvblZhbHVlLFxuICAgIH07XG4gIH0pKTtcbn1cblxuLyoqIEdldHMgYW4gb3V0cHV0IEFTVCBleHByZXNzaW9uIHJlZmVyZW5jaW5nIHRoZSBnaXZlbiBmbGFnLiAqL1xuZnVuY3Rpb24gZ2V0SW5wdXRGbGFnRXhwcihmbGFnOiBJbnB1dEZsYWdzKTogby5FeHByZXNzaW9uIHtcbiAgcmV0dXJuIG8uaW1wb3J0RXhwcihSMy5JbnB1dEZsYWdzKS5wcm9wKElucHV0RmxhZ3NbZmxhZ10pO1xufVxuXG4vKiogQ29tYmluZXMgYSBnaXZlbiBpbnB1dCBmbGFnIHdpdGggYW4gZXhpc3RpbmcgZmxhZyBleHByZXNzaW9uLCBpZiBwcmVzZW50LiAqL1xuZnVuY3Rpb24gYml0d2lzZU9ySW5wdXRGbGFnc0V4cHIoZmxhZzogSW5wdXRGbGFncywgZXhwcjogby5FeHByZXNzaW9ufG51bGwpOiBvLkV4cHJlc3Npb24ge1xuICBpZiAoZXhwciA9PT0gbnVsbCkge1xuICAgIHJldHVybiBnZXRJbnB1dEZsYWdFeHByKGZsYWcpO1xuICB9XG4gIHJldHVybiBnZXRJbnB1dEZsYWdFeHByKGZsYWcpLmJpdHdpc2VPcihleHByKTtcbn1cblxuLyoqXG4gKiAgUmVtb3ZlIHRyYWlsaW5nIG51bGwgbm9kZXMgYXMgdGhleSBhcmUgaW1wbGllZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyaW1UcmFpbGluZ051bGxzKHBhcmFtZXRlcnM6IG8uRXhwcmVzc2lvbltdKTogby5FeHByZXNzaW9uW10ge1xuICB3aGlsZSAoby5pc051bGwocGFyYW1ldGVyc1twYXJhbWV0ZXJzLmxlbmd0aCAtIDFdKSkge1xuICAgIHBhcmFtZXRlcnMucG9wKCk7XG4gIH1cbiAgcmV0dXJuIHBhcmFtZXRlcnM7XG59XG5cbi8qKlxuICogQSByZXByZXNlbnRhdGlvbiBmb3IgYW4gb2JqZWN0IGxpdGVyYWwgdXNlZCBkdXJpbmcgY29kZWdlbiBvZiBkZWZpbml0aW9uIG9iamVjdHMuIFRoZSBnZW5lcmljXG4gKiB0eXBlIGBUYCBhbGxvd3MgdG8gcmVmZXJlbmNlIGEgZG9jdW1lbnRlZCB0eXBlIG9mIHRoZSBnZW5lcmF0ZWQgc3RydWN0dXJlLCBzdWNoIHRoYXQgdGhlXG4gKiBwcm9wZXJ0eSBuYW1lcyB0aGF0IGFyZSBzZXQgY2FuIGJlIHJlc29sdmVkIHRvIHRoZWlyIGRvY3VtZW50ZWQgZGVjbGFyYXRpb24uXG4gKi9cbmV4cG9ydCBjbGFzcyBEZWZpbml0aW9uTWFwPFQgPSBhbnk+IHtcbiAgdmFsdWVzOiB7a2V5OiBzdHJpbmcsIHF1b3RlZDogYm9vbGVhbiwgdmFsdWU6IG8uRXhwcmVzc2lvbn1bXSA9IFtdO1xuXG4gIHNldChrZXk6IGtleW9mIFQsIHZhbHVlOiBvLkV4cHJlc3Npb258bnVsbCk6IHZvaWQge1xuICAgIGlmICh2YWx1ZSkge1xuICAgICAgY29uc3QgZXhpc3RpbmcgPSB0aGlzLnZhbHVlcy5maW5kKHZhbHVlID0+IHZhbHVlLmtleSA9PT0ga2V5KTtcblxuICAgICAgaWYgKGV4aXN0aW5nKSB7XG4gICAgICAgIGV4aXN0aW5nLnZhbHVlID0gdmFsdWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnZhbHVlcy5wdXNoKHtrZXk6IGtleSBhcyBzdHJpbmcsIHZhbHVlLCBxdW90ZWQ6IGZhbHNlfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdG9MaXRlcmFsTWFwKCk6IG8uTGl0ZXJhbE1hcEV4cHIge1xuICAgIHJldHVybiBvLmxpdGVyYWxNYXAodGhpcy52YWx1ZXMpO1xuICB9XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIGBDc3NTZWxlY3RvcmAgZnJvbSBhbiBBU1Qgbm9kZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUNzc1NlbGVjdG9yRnJvbU5vZGUobm9kZTogdC5FbGVtZW50fHQuVGVtcGxhdGUpOiBDc3NTZWxlY3RvciB7XG4gIGNvbnN0IGVsZW1lbnROYW1lID0gbm9kZSBpbnN0YW5jZW9mIHQuRWxlbWVudCA/IG5vZGUubmFtZSA6ICduZy10ZW1wbGF0ZSc7XG4gIGNvbnN0IGF0dHJpYnV0ZXMgPSBnZXRBdHRyc0ZvckRpcmVjdGl2ZU1hdGNoaW5nKG5vZGUpO1xuICBjb25zdCBjc3NTZWxlY3RvciA9IG5ldyBDc3NTZWxlY3RvcigpO1xuICBjb25zdCBlbGVtZW50TmFtZU5vTnMgPSBzcGxpdE5zTmFtZShlbGVtZW50TmFtZSlbMV07XG5cbiAgY3NzU2VsZWN0b3Iuc2V0RWxlbWVudChlbGVtZW50TmFtZU5vTnMpO1xuXG4gIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGF0dHJpYnV0ZXMpLmZvckVhY2goKG5hbWUpID0+IHtcbiAgICBjb25zdCBuYW1lTm9OcyA9IHNwbGl0TnNOYW1lKG5hbWUpWzFdO1xuICAgIGNvbnN0IHZhbHVlID0gYXR0cmlidXRlc1tuYW1lXTtcblxuICAgIGNzc1NlbGVjdG9yLmFkZEF0dHJpYnV0ZShuYW1lTm9OcywgdmFsdWUpO1xuICAgIGlmIChuYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdjbGFzcycpIHtcbiAgICAgIGNvbnN0IGNsYXNzZXMgPSB2YWx1ZS50cmltKCkuc3BsaXQoL1xccysvKTtcbiAgICAgIGNsYXNzZXMuZm9yRWFjaChjbGFzc05hbWUgPT4gY3NzU2VsZWN0b3IuYWRkQ2xhc3NOYW1lKGNsYXNzTmFtZSkpO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIGNzc1NlbGVjdG9yO1xufVxuXG4vKipcbiAqIEV4dHJhY3QgYSBtYXAgb2YgcHJvcGVydGllcyB0byB2YWx1ZXMgZm9yIGEgZ2l2ZW4gZWxlbWVudCBvciB0ZW1wbGF0ZSBub2RlLCB3aGljaCBjYW4gYmUgdXNlZFxuICogYnkgdGhlIGRpcmVjdGl2ZSBtYXRjaGluZyBtYWNoaW5lcnkuXG4gKlxuICogQHBhcmFtIGVsT3JUcGwgdGhlIGVsZW1lbnQgb3IgdGVtcGxhdGUgaW4gcXVlc3Rpb25cbiAqIEByZXR1cm4gYW4gb2JqZWN0IHNldCB1cCBmb3IgZGlyZWN0aXZlIG1hdGNoaW5nLiBGb3IgYXR0cmlidXRlcyBvbiB0aGUgZWxlbWVudC90ZW1wbGF0ZSwgdGhpc1xuICogb2JqZWN0IG1hcHMgYSBwcm9wZXJ0eSBuYW1lIHRvIGl0cyAoc3RhdGljKSB2YWx1ZS4gRm9yIGFueSBiaW5kaW5ncywgdGhpcyBtYXAgc2ltcGx5IG1hcHMgdGhlXG4gKiBwcm9wZXJ0eSBuYW1lIHRvIGFuIGVtcHR5IHN0cmluZy5cbiAqL1xuZnVuY3Rpb24gZ2V0QXR0cnNGb3JEaXJlY3RpdmVNYXRjaGluZyhlbE9yVHBsOiB0LkVsZW1lbnR8dC5UZW1wbGF0ZSk6IHtbbmFtZTogc3RyaW5nXTogc3RyaW5nfSB7XG4gIGNvbnN0IGF0dHJpYnV0ZXNNYXA6IHtbbmFtZTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuXG5cbiAgaWYgKGVsT3JUcGwgaW5zdGFuY2VvZiB0LlRlbXBsYXRlICYmIGVsT3JUcGwudGFnTmFtZSAhPT0gJ25nLXRlbXBsYXRlJykge1xuICAgIGVsT3JUcGwudGVtcGxhdGVBdHRycy5mb3JFYWNoKGEgPT4gYXR0cmlidXRlc01hcFthLm5hbWVdID0gJycpO1xuICB9IGVsc2Uge1xuICAgIGVsT3JUcGwuYXR0cmlidXRlcy5mb3JFYWNoKGEgPT4ge1xuICAgICAgaWYgKCFpc0kxOG5BdHRyaWJ1dGUoYS5uYW1lKSkge1xuICAgICAgICBhdHRyaWJ1dGVzTWFwW2EubmFtZV0gPSBhLnZhbHVlO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgZWxPclRwbC5pbnB1dHMuZm9yRWFjaChpID0+IHtcbiAgICAgIGlmIChpLnR5cGUgPT09IEJpbmRpbmdUeXBlLlByb3BlcnR5IHx8IGkudHlwZSA9PT0gQmluZGluZ1R5cGUuVHdvV2F5KSB7XG4gICAgICAgIGF0dHJpYnV0ZXNNYXBbaS5uYW1lXSA9ICcnO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGVsT3JUcGwub3V0cHV0cy5mb3JFYWNoKG8gPT4ge1xuICAgICAgYXR0cmlidXRlc01hcFtvLm5hbWVdID0gJyc7XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gYXR0cmlidXRlc01hcDtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBudW1iZXIgb2YgYXJndW1lbnRzIGV4cGVjdGVkIHRvIGJlIHBhc3NlZCB0byBhIGdlbmVyYXRlZCBpbnN0cnVjdGlvbiBpbiB0aGUgY2FzZSBvZlxuICogaW50ZXJwb2xhdGlvbiBpbnN0cnVjdGlvbnMuXG4gKiBAcGFyYW0gaW50ZXJwb2xhdGlvbiBBbiBpbnRlcnBvbGF0aW9uIGFzdFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0SW50ZXJwb2xhdGlvbkFyZ3NMZW5ndGgoaW50ZXJwb2xhdGlvbjogSW50ZXJwb2xhdGlvbikge1xuICBjb25zdCB7ZXhwcmVzc2lvbnMsIHN0cmluZ3N9ID0gaW50ZXJwb2xhdGlvbjtcbiAgaWYgKGV4cHJlc3Npb25zLmxlbmd0aCA9PT0gMSAmJiBzdHJpbmdzLmxlbmd0aCA9PT0gMiAmJiBzdHJpbmdzWzBdID09PSAnJyAmJiBzdHJpbmdzWzFdID09PSAnJykge1xuICAgIC8vIElmIHRoZSBpbnRlcnBvbGF0aW9uIGhhcyBvbmUgaW50ZXJwb2xhdGVkIHZhbHVlLCBidXQgdGhlIHByZWZpeCBhbmQgc3VmZml4IGFyZSBib3RoIGVtcHR5XG4gICAgLy8gc3RyaW5ncywgd2Ugb25seSBwYXNzIG9uZSBhcmd1bWVudCwgdG8gYSBzcGVjaWFsIGluc3RydWN0aW9uIGxpa2UgYHByb3BlcnR5SW50ZXJwb2xhdGVgIG9yXG4gICAgLy8gYHRleHRJbnRlcnBvbGF0ZWAuXG4gICAgcmV0dXJuIDE7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGV4cHJlc3Npb25zLmxlbmd0aCArIHN0cmluZ3MubGVuZ3RoO1xuICB9XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIHRoZSBmaW5hbCBpbnN0cnVjdGlvbiBjYWxsIHN0YXRlbWVudHMgYmFzZWQgb24gdGhlIHBhc3NlZCBpbiBjb25maWd1cmF0aW9uLlxuICogV2lsbCB0cnkgdG8gY2hhaW4gaW5zdHJ1Y3Rpb25zIGFzIG11Y2ggYXMgcG9zc2libGUsIGlmIGNoYWluaW5nIGlzIHN1cHBvcnRlZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEluc3RydWN0aW9uU3RhdGVtZW50cyhpbnN0cnVjdGlvbnM6IEluc3RydWN0aW9uW10pOiBvLlN0YXRlbWVudFtdIHtcbiAgY29uc3Qgc3RhdGVtZW50czogby5TdGF0ZW1lbnRbXSA9IFtdO1xuICBsZXQgcGVuZGluZ0V4cHJlc3Npb246IG8uRXhwcmVzc2lvbnxudWxsID0gbnVsbDtcbiAgbGV0IHBlbmRpbmdFeHByZXNzaW9uVHlwZTogby5FeHRlcm5hbFJlZmVyZW5jZXxudWxsID0gbnVsbDtcbiAgbGV0IGNoYWluTGVuZ3RoID0gMDtcblxuICBmb3IgKGNvbnN0IGN1cnJlbnQgb2YgaW5zdHJ1Y3Rpb25zKSB7XG4gICAgY29uc3QgcmVzb2x2ZWRQYXJhbXMgPVxuICAgICAgICAodHlwZW9mIGN1cnJlbnQucGFyYW1zT3JGbiA9PT0gJ2Z1bmN0aW9uJyA/IGN1cnJlbnQucGFyYW1zT3JGbigpIDogY3VycmVudC5wYXJhbXNPckZuKSA/P1xuICAgICAgICBbXTtcbiAgICBjb25zdCBwYXJhbXMgPSBBcnJheS5pc0FycmF5KHJlc29sdmVkUGFyYW1zKSA/IHJlc29sdmVkUGFyYW1zIDogW3Jlc29sdmVkUGFyYW1zXTtcblxuICAgIC8vIElmIHRoZSBjdXJyZW50IGluc3RydWN0aW9uIGlzIHRoZSBzYW1lIGFzIHRoZSBwcmV2aW91cyBvbmVcbiAgICAvLyBhbmQgaXQgY2FuIGJlIGNoYWluZWQsIGFkZCBhbm90aGVyIGNhbGwgdG8gdGhlIGNoYWluLlxuICAgIGlmIChjaGFpbkxlbmd0aCA8IE1BWF9DSEFJTl9MRU5HVEggJiYgcGVuZGluZ0V4cHJlc3Npb25UeXBlID09PSBjdXJyZW50LnJlZmVyZW5jZSAmJlxuICAgICAgICBDSEFJTkFCTEVfSU5TVFJVQ1RJT05TLmhhcyhwZW5kaW5nRXhwcmVzc2lvblR5cGUpKSB7XG4gICAgICAvLyBXZSdsbCBhbHdheXMgaGF2ZSBhIHBlbmRpbmcgZXhwcmVzc2lvbiB3aGVuIHRoZXJlJ3MgYSBwZW5kaW5nIGV4cHJlc3Npb24gdHlwZS5cbiAgICAgIHBlbmRpbmdFeHByZXNzaW9uID0gcGVuZGluZ0V4cHJlc3Npb24hLmNhbGxGbihwYXJhbXMsIHBlbmRpbmdFeHByZXNzaW9uIS5zb3VyY2VTcGFuKTtcbiAgICAgIGNoYWluTGVuZ3RoKys7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChwZW5kaW5nRXhwcmVzc2lvbiAhPT0gbnVsbCkge1xuICAgICAgICBzdGF0ZW1lbnRzLnB1c2gocGVuZGluZ0V4cHJlc3Npb24udG9TdG10KCkpO1xuICAgICAgfVxuICAgICAgcGVuZGluZ0V4cHJlc3Npb24gPSBpbnZva2VJbnN0cnVjdGlvbihjdXJyZW50LnNwYW4sIGN1cnJlbnQucmVmZXJlbmNlLCBwYXJhbXMpO1xuICAgICAgcGVuZGluZ0V4cHJlc3Npb25UeXBlID0gY3VycmVudC5yZWZlcmVuY2U7XG4gICAgICBjaGFpbkxlbmd0aCA9IDA7XG4gICAgfVxuICB9XG5cbiAgLy8gU2luY2UgdGhlIGN1cnJlbnQgaW5zdHJ1Y3Rpb24gYWRkcyB0aGUgcHJldmlvdXMgb25lIHRvIHRoZSBzdGF0ZW1lbnRzLFxuICAvLyB3ZSBtYXkgYmUgbGVmdCB3aXRoIHRoZSBmaW5hbCBvbmUgYXQgdGhlIGVuZCB0aGF0IGlzIHN0aWxsIHBlbmRpbmcuXG4gIGlmIChwZW5kaW5nRXhwcmVzc2lvbiAhPT0gbnVsbCkge1xuICAgIHN0YXRlbWVudHMucHVzaChwZW5kaW5nRXhwcmVzc2lvbi50b1N0bXQoKSk7XG4gIH1cblxuICByZXR1cm4gc3RhdGVtZW50cztcbn1cbiJdfQ==