/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { mapLiteral } from '../../../../output/map_util';
import * as o from '../../../../output/output_ast';
import { sanitizeIdentifier } from '../../../../parse_util';
import { Identifiers } from '../../../../render3/r3_identifiers';
import { createGoogleGetMsgStatements } from '../../../../render3/view/i18n/get_msg_utils';
import { createLocalizeStatements } from '../../../../render3/view/i18n/localize_utils';
import { formatI18nPlaceholderNamesInMap } from '../../../../render3/view/i18n/util';
import * as ir from '../../ir';
/** Name of the global variable that is used to determine if we use Closure translations or not */
const NG_I18N_CLOSURE_MODE = 'ngI18nClosureMode';
/**
 * Prefix for non-`goog.getMsg` i18n-related vars.
 * Note: the prefix uses lowercase characters intentionally due to a Closure behavior that
 * considers variables like `I18N_0` as constants and throws an error when their value changes.
 */
const TRANSLATION_VAR_PREFIX = 'i18n_';
/** Prefix of ICU expressions for post processing */
export const I18N_ICU_MAPPING_PREFIX = 'I18N_EXP_';
/**
 * The escape sequence used for message param values.
 */
const ESCAPE = '\uFFFD';
/* Closure variables holding messages must be named `MSG_[A-Z0-9]+` */
const CLOSURE_TRANSLATION_VAR_PREFIX = 'MSG_';
/**
 * Generates a prefix for translation const name.
 *
 * @param extra Additional local prefix that should be injected into translation var name
 * @returns Complete translation const prefix
 */
export function getTranslationConstPrefix(extra) {
    return `${CLOSURE_TRANSLATION_VAR_PREFIX}${extra}`.toUpperCase();
}
/**
 * Generate AST to declare a variable. E.g. `var I18N_1;`.
 * @param variable the name of the variable to declare.
 */
export function declareI18nVariable(variable) {
    return new o.DeclareVarStmt(variable.name, undefined, o.INFERRED_TYPE, undefined, variable.sourceSpan);
}
/**
 * Lifts i18n properties into the consts array.
 * TODO: Can we use `ConstCollectedExpr`?
 * TODO: The way the various attributes are linked together is very complex. Perhaps we could
 * simplify the process, maybe by combining the context and message ops?
 */
export function collectI18nConsts(job) {
    const fileBasedI18nSuffix = job.relativeContextFilePath.replace(/[^A-Za-z0-9]/g, '_').toUpperCase() + '_';
    // Step One: Build up various lookup maps we need to collect all the consts.
    // Context Xref -> Extracted Attribute Ops
    const extractedAttributesByI18nContext = new Map();
    // Element/ElementStart Xref -> I18n Attributes config op
    const i18nAttributesByElement = new Map();
    // Element/ElementStart Xref -> All I18n Expression ops for attrs on that target
    const i18nExpressionsByElement = new Map();
    // I18n Message Xref -> I18n Message Op (TODO: use a central op map)
    const messages = new Map();
    for (const unit of job.units) {
        for (const op of unit.ops()) {
            if (op.kind === ir.OpKind.ExtractedAttribute && op.i18nContext !== null) {
                const attributes = extractedAttributesByI18nContext.get(op.i18nContext) ?? [];
                attributes.push(op);
                extractedAttributesByI18nContext.set(op.i18nContext, attributes);
            }
            else if (op.kind === ir.OpKind.I18nAttributes) {
                i18nAttributesByElement.set(op.target, op);
            }
            else if (op.kind === ir.OpKind.I18nExpression &&
                op.usage === ir.I18nExpressionFor.I18nAttribute) {
                const expressions = i18nExpressionsByElement.get(op.target) ?? [];
                expressions.push(op);
                i18nExpressionsByElement.set(op.target, expressions);
            }
            else if (op.kind === ir.OpKind.I18nMessage) {
                messages.set(op.xref, op);
            }
        }
    }
    // Step Two: Serialize the extracted i18n messages for root i18n blocks and i18n attributes into
    // the const array.
    //
    // Also, each i18n message will have a variable expression that can refer to its
    // value. Store these expressions in the appropriate place:
    // 1. For normal i18n content, it also goes in the const array. We save the const index to use
    // later.
    // 2. For extracted attributes, it becomes the value of the extracted attribute instruction.
    // 3. For i18n bindings, it will go in a separate const array instruction below; for now, we just
    // save it.
    const i18nValuesByContext = new Map();
    const messageConstIndices = new Map();
    for (const unit of job.units) {
        for (const op of unit.create) {
            if (op.kind === ir.OpKind.I18nMessage) {
                if (op.messagePlaceholder === null) {
                    const { mainVar, statements } = collectMessage(job, fileBasedI18nSuffix, messages, op);
                    if (op.i18nBlock !== null) {
                        // This is a regular i18n message with a corresponding i18n block. Collect it into the
                        // const array.
                        const i18nConst = job.addConst(mainVar, statements);
                        messageConstIndices.set(op.i18nBlock, i18nConst);
                    }
                    else {
                        // This is an i18n attribute. Extract the initializers into the const pool.
                        job.constsInitializers.push(...statements);
                        // Save the i18n variable value for later.
                        i18nValuesByContext.set(op.i18nContext, mainVar);
                        // This i18n message may correspond to an individual extracted attribute. If so, The
                        // value of that attribute is updated to read the extracted i18n variable.
                        const attributesForMessage = extractedAttributesByI18nContext.get(op.i18nContext);
                        if (attributesForMessage !== undefined) {
                            for (const attr of attributesForMessage) {
                                attr.expression = mainVar.clone();
                            }
                        }
                    }
                }
                ir.OpList.remove(op);
            }
        }
    }
    // Step Three: Serialize I18nAttributes configurations into the const array. Each I18nAttributes
    // instruction has a config array, which contains k-v pairs describing each binding name, and the
    // i18n variable that provides the value.
    for (const unit of job.units) {
        for (const elem of unit.create) {
            if (ir.isElementOrContainerOp(elem)) {
                const i18nAttributes = i18nAttributesByElement.get(elem.xref);
                if (i18nAttributes === undefined) {
                    // This element is not associated with an i18n attributes configuration instruction.
                    continue;
                }
                let i18nExpressions = i18nExpressionsByElement.get(elem.xref);
                if (i18nExpressions === undefined) {
                    // Unused i18nAttributes should have already been removed.
                    // TODO: Should the removal of those dead instructions be merged with this phase?
                    throw new Error('AssertionError: Could not find any i18n expressions associated with an I18nAttributes instruction');
                }
                // Find expressions for all the unique property names, removing duplicates.
                const seenPropertyNames = new Set();
                i18nExpressions = i18nExpressions.filter((i18nExpr) => {
                    const seen = seenPropertyNames.has(i18nExpr.name);
                    seenPropertyNames.add(i18nExpr.name);
                    return !seen;
                });
                const i18nAttributeConfig = i18nExpressions.flatMap((i18nExpr) => {
                    const i18nExprValue = i18nValuesByContext.get(i18nExpr.context);
                    if (i18nExprValue === undefined) {
                        throw new Error("AssertionError: Could not find i18n expression's value");
                    }
                    return [o.literal(i18nExpr.name), i18nExprValue];
                });
                i18nAttributes.i18nAttributesConfig = job.addConst(new o.LiteralArrayExpr(i18nAttributeConfig));
            }
        }
    }
    // Step Four: Propagate the extracted const index into i18n ops that messages were extracted from.
    for (const unit of job.units) {
        for (const op of unit.create) {
            if (op.kind === ir.OpKind.I18nStart) {
                const msgIndex = messageConstIndices.get(op.root);
                if (msgIndex === undefined) {
                    throw new Error('AssertionError: Could not find corresponding i18n block index for an i18n message op; was an i18n message incorrectly assumed to correspond to an attribute?');
                }
                op.messageIndex = msgIndex;
            }
        }
    }
}
/**
 * Collects the given message into a set of statements that can be added to the const array.
 * This will recursively collect any sub-messages referenced from the parent message as well.
 */
function collectMessage(job, fileBasedI18nSuffix, messages, messageOp) {
    // Recursively collect any sub-messages, record each sub-message's main variable under its
    // placeholder so that we can add them to the params for the parent message. It is possible
    // that multiple sub-messages will share the same placeholder, so we need to track an array of
    // variables for each placeholder.
    const statements = [];
    const subMessagePlaceholders = new Map();
    for (const subMessageId of messageOp.subMessages) {
        const subMessage = messages.get(subMessageId);
        const { mainVar: subMessageVar, statements: subMessageStatements } = collectMessage(job, fileBasedI18nSuffix, messages, subMessage);
        statements.push(...subMessageStatements);
        const subMessages = subMessagePlaceholders.get(subMessage.messagePlaceholder) ?? [];
        subMessages.push(subMessageVar);
        subMessagePlaceholders.set(subMessage.messagePlaceholder, subMessages);
    }
    addSubMessageParams(messageOp, subMessagePlaceholders);
    // Sort the params for consistency with TemaplateDefinitionBuilder output.
    messageOp.params = new Map([...messageOp.params.entries()].sort());
    const mainVar = o.variable(job.pool.uniqueName(TRANSLATION_VAR_PREFIX));
    // Closure Compiler requires const names to start with `MSG_` but disallows any other
    // const to start with `MSG_`. We define a variable starting with `MSG_` just for the
    // `goog.getMsg` call
    const closureVar = i18nGenerateClosureVar(job.pool, messageOp.message.id, fileBasedI18nSuffix, job.i18nUseExternalIds);
    let transformFn = undefined;
    // If nescessary, add a post-processing step and resolve any placeholder params that are
    // set in post-processing.
    if (messageOp.needsPostprocessing || messageOp.postprocessingParams.size > 0) {
        // Sort the post-processing params for consistency with TemaplateDefinitionBuilder output.
        const postprocessingParams = Object.fromEntries([...messageOp.postprocessingParams.entries()].sort());
        const formattedPostprocessingParams = formatI18nPlaceholderNamesInMap(postprocessingParams, 
        /* useCamelCase */ false);
        const extraTransformFnParams = [];
        if (messageOp.postprocessingParams.size > 0) {
            extraTransformFnParams.push(mapLiteral(formattedPostprocessingParams, /* quoted */ true));
        }
        transformFn = (expr) => o.importExpr(Identifiers.i18nPostprocess).callFn([expr, ...extraTransformFnParams]);
    }
    // Add the message's statements
    statements.push(...getTranslationDeclStmts(messageOp.message, mainVar, closureVar, messageOp.params, transformFn));
    return { mainVar, statements };
}
/**
 * Adds the given subMessage placeholders to the given message op.
 *
 * If a placeholder only corresponds to a single sub-message variable, we just set that variable
 * as the param value. However, if the placeholder corresponds to multiple sub-message
 * variables, we need to add a special placeholder value that is handled by the post-processing
 * step. We then add the array of variables as a post-processing param.
 */
function addSubMessageParams(messageOp, subMessagePlaceholders) {
    for (const [placeholder, subMessages] of subMessagePlaceholders) {
        if (subMessages.length === 1) {
            messageOp.params.set(placeholder, subMessages[0]);
        }
        else {
            messageOp.params.set(placeholder, o.literal(`${ESCAPE}${I18N_ICU_MAPPING_PREFIX}${placeholder}${ESCAPE}`));
            messageOp.postprocessingParams.set(placeholder, o.literalArr(subMessages));
        }
    }
}
/**
 * Generate statements that define a given translation message.
 *
 * ```
 * var I18N_1;
 * if (typeof ngI18nClosureMode !== undefined && ngI18nClosureMode) {
 *     var MSG_EXTERNAL_XXX = goog.getMsg(
 *          "Some message with {$interpolation}!",
 *          { "interpolation": "\uFFFD0\uFFFD" }
 *     );
 *     I18N_1 = MSG_EXTERNAL_XXX;
 * }
 * else {
 *     I18N_1 = $localize`Some message with ${'\uFFFD0\uFFFD'}!`;
 * }
 * ```
 *
 * @param message The original i18n AST message node
 * @param variable The variable that will be assigned the translation, e.g. `I18N_1`.
 * @param closureVar The variable for Closure `goog.getMsg` calls, e.g. `MSG_EXTERNAL_XXX`.
 * @param params Object mapping placeholder names to their values (e.g.
 * `{ "interpolation": "\uFFFD0\uFFFD" }`).
 * @param transformFn Optional transformation function that will be applied to the translation
 *     (e.g.
 * post-processing).
 * @returns An array of statements that defined a given translation.
 */
function getTranslationDeclStmts(message, variable, closureVar, params, transformFn) {
    const paramsObject = Object.fromEntries(params);
    const statements = [
        declareI18nVariable(variable),
        o.ifStmt(createClosureModeGuard(), createGoogleGetMsgStatements(variable, message, closureVar, paramsObject), createLocalizeStatements(variable, message, formatI18nPlaceholderNamesInMap(paramsObject, /* useCamelCase */ false))),
    ];
    if (transformFn) {
        statements.push(new o.ExpressionStatement(variable.set(transformFn(variable))));
    }
    return statements;
}
/**
 * Create the expression that will be used to guard the closure mode block
 * It is equivalent to:
 *
 * ```
 * typeof ngI18nClosureMode !== undefined && ngI18nClosureMode
 * ```
 */
function createClosureModeGuard() {
    return o
        .typeofExpr(o.variable(NG_I18N_CLOSURE_MODE))
        .notIdentical(o.literal('undefined', o.STRING_TYPE))
        .and(o.variable(NG_I18N_CLOSURE_MODE));
}
/**
 * Generates vars with Closure-specific names for i18n blocks (i.e. `MSG_XXX`).
 */
function i18nGenerateClosureVar(pool, messageId, fileBasedI18nSuffix, useExternalIds) {
    let name;
    const suffix = fileBasedI18nSuffix;
    if (useExternalIds) {
        const prefix = getTranslationConstPrefix(`EXTERNAL_`);
        const uniqueSuffix = pool.uniqueName(suffix);
        name = `${prefix}${sanitizeIdentifier(messageId)}$$${uniqueSuffix}`;
    }
    else {
        const prefix = getTranslationConstPrefix(suffix);
        name = pool.uniqueName(prefix);
    }
    return o.variable(name);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaTE4bl9jb25zdF9jb2xsZWN0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3RlbXBsYXRlL3BpcGVsaW5lL3NyYy9waGFzZXMvaTE4bl9jb25zdF9jb2xsZWN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUlILE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSw2QkFBNkIsQ0FBQztBQUN2RCxPQUFPLEtBQUssQ0FBQyxNQUFNLCtCQUErQixDQUFDO0FBQ25ELE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQzFELE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxvQ0FBb0MsQ0FBQztBQUMvRCxPQUFPLEVBQUMsNEJBQTRCLEVBQUMsTUFBTSw2Q0FBNkMsQ0FBQztBQUN6RixPQUFPLEVBQUMsd0JBQXdCLEVBQUMsTUFBTSw4Q0FBOEMsQ0FBQztBQUN0RixPQUFPLEVBQUMsK0JBQStCLEVBQUMsTUFBTSxvQ0FBb0MsQ0FBQztBQUNuRixPQUFPLEtBQUssRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUcvQixrR0FBa0c7QUFDbEcsTUFBTSxvQkFBb0IsR0FBRyxtQkFBbUIsQ0FBQztBQUVqRDs7OztHQUlHO0FBQ0gsTUFBTSxzQkFBc0IsR0FBRyxPQUFPLENBQUM7QUFFdkMsb0RBQW9EO0FBQ3BELE1BQU0sQ0FBQyxNQUFNLHVCQUF1QixHQUFHLFdBQVcsQ0FBQztBQUVuRDs7R0FFRztBQUNILE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQztBQUV4QixzRUFBc0U7QUFDdEUsTUFBTSw4QkFBOEIsR0FBRyxNQUFNLENBQUM7QUFFOUM7Ozs7O0dBS0c7QUFDSCxNQUFNLFVBQVUseUJBQXlCLENBQUMsS0FBYTtJQUNyRCxPQUFPLEdBQUcsOEJBQThCLEdBQUcsS0FBSyxFQUFFLENBQUMsV0FBVyxFQUFFLENB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LENBQUMsTUFBTSxDQUFDLENBQUM7UUFDN0MsSUFBSSxHQUFHLEdBQUcsTUFBTSxHQUFHLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxLQUFLLFlBQVksRUFBRSxDQUFDO0lBQ3RFLENBQUM7U0FBTSxDQUFDO1FBQ04sTUFBTSxNQUFNLEdBQUcseUJBQXlCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDakQsSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDakMsQ0FBQztJQUNELE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMxQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7dHlwZSBDb25zdGFudFBvb2x9IGZyb20gJy4uLy4uLy4uLy4uL2NvbnN0YW50X3Bvb2wnO1xuaW1wb3J0ICogYXMgaTE4biBmcm9tICcuLi8uLi8uLi8uLi9pMThuL2kxOG5fYXN0JztcbmltcG9ydCB7bWFwTGl0ZXJhbH0gZnJvbSAnLi4vLi4vLi4vLi4vb3V0cHV0L21hcF91dGlsJztcbmltcG9ydCAqIGFzIG8gZnJvbSAnLi4vLi4vLi4vLi4vb3V0cHV0L291dHB1dF9hc3QnO1xuaW1wb3J0IHtzYW5pdGl6ZUlkZW50aWZpZXJ9IGZyb20gJy4uLy4uLy4uLy4uL3BhcnNlX3V0aWwnO1xuaW1wb3J0IHtJZGVudGlmaWVyc30gZnJvbSAnLi4vLi4vLi4vLi4vcmVuZGVyMy9yM19pZGVudGlmaWVycyc7XG5pbXBvcnQge2NyZWF0ZUdvb2dsZUdldE1zZ1N0YXRlbWVudHN9IGZyb20gJy4uLy4uLy4uLy4uL3JlbmRlcjMvdmlldy9pMThuL2dldF9tc2dfdXRpbHMnO1xuaW1wb3J0IHtjcmVhdGVMb2NhbGl6ZVN0YXRlbWVudHN9IGZyb20gJy4uLy4uLy4uLy4uL3JlbmRlcjMvdmlldy9pMThuL2xvY2FsaXplX3V0aWxzJztcbmltcG9ydCB7Zm9ybWF0STE4blBsYWNlaG9sZGVyTmFtZXNJbk1hcH0gZnJvbSAnLi4vLi4vLi4vLi4vcmVuZGVyMy92aWV3L2kxOG4vdXRpbCc7XG5pbXBvcnQgKiBhcyBpciBmcm9tICcuLi8uLi9pcic7XG5pbXBvcnQge0NvbXBvbmVudENvbXBpbGF0aW9uSm9ifSBmcm9tICcuLi9jb21waWxhdGlvbic7XG5cbi8qKiBOYW1lIG9mIHRoZSBnbG9iYWwgdmFyaWFibGUgdGhhdCBpcyB1c2VkIHRvIGRldGVybWluZSBpZiB3ZSB1c2UgQ2xvc3VyZSB0cmFuc2xhdGlvbnMgb3Igbm90ICovXG5jb25zdCBOR19JMThOX0NMT1NVUkVfTU9ERSA9ICduZ0kxOG5DbG9zdXJlTW9kZSc7XG5cbi8qKlxuICogUHJlZml4IGZvciBub24tYGdvb2cuZ2V0TXNnYCBpMThuLXJlbGF0ZWQgdmFycy5cbiAqIE5vdGU6IHRoZSBwcmVmaXggdXNlcyBsb3dlcmNhc2UgY2hhcmFjdGVycyBpbnRlbnRpb25hbGx5IGR1ZSB0byBhIENsb3N1cmUgYmVoYXZpb3IgdGhhdFxuICogY29uc2lkZXJzIHZhcmlhYmxlcyBsaWtlIGBJMThOXzBgIGFzIGNvbnN0YW50cyBhbmQgdGhyb3dzIGFuIGVycm9yIHdoZW4gdGhlaXIgdmFsdWUgY2hhbmdlcy5cbiAqL1xuY29uc3QgVFJBTlNMQVRJT05fVkFSX1BSRUZJWCA9ICdpMThuXyc7XG5cbi8qKiBQcmVmaXggb2YgSUNVIGV4cHJlc3Npb25zIGZvciBwb3N0IHByb2Nlc3NpbmcgKi9cbmV4cG9ydCBjb25zdCBJMThOX0lDVV9NQVBQSU5HX1BSRUZJWCA9ICdJMThOX0VYUF8nO1xuXG4vKipcbiAqIFRoZSBlc2NhcGUgc2VxdWVuY2UgdXNlZCBmb3IgbWVzc2FnZSBwYXJhbSB2YWx1ZXMuXG4gKi9cbmNvbnN0IEVTQ0FQRSA9ICdcXHVGRkZEJztcblxuLyogQ2xvc3VyZSB2YXJpYWJsZXMgaG9sZGluZyBtZXNzYWdlcyBtdXN0IGJlIG5hbWVkIGBNU0dfW0EtWjAtOV0rYCAqL1xuY29uc3QgQ0xPU1VSRV9UUkFOU0xBVElPTl9WQVJfUFJFRklYID0gJ01TR18nO1xuXG4vKipcbiAqIEdlbmVyYXRlcyBhIHByZWZpeCBmb3IgdHJhbnNsYXRpb24gY29uc3QgbmFtZS5cbiAqXG4gKiBAcGFyYW0gZXh0cmEgQWRkaXRpb25hbCBsb2NhbCBwcmVmaXggdGhhdCBzaG91bGQgYmUgaW5qZWN0ZWQgaW50byB0cmFuc2xhdGlvbiB2YXIgbmFtZVxuICogQHJldHVybnMgQ29tcGxldGUgdHJhbnNsYXRpb24gY29uc3QgcHJlZml4XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRUcmFuc2xhdGlvbkNvbnN0UHJlZml4KGV4dHJhOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gYCR7Q0xPU1VSRV9UUkFOU0xBVElPTl9WQVJfUFJFRklYfSR7ZXh0cmF9YC50b1VwcGVyQ2FzZSgpO1xufVxuXG4vKipcbiAqIEdlbmVyYXRlIEFTVCB0byBkZWNsYXJlIGEgdmFyaWFibGUuIEUuZy4gYHZhciBJMThOXzE7YC5cbiAqIEBwYXJhbSB2YXJpYWJsZSB0aGUgbmFtZSBvZiB0aGUgdmFyaWFibGUgdG8gZGVjbGFyZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlY2xhcmVJMThuVmFyaWFibGUodmFyaWFibGU6IG8uUmVhZFZhckV4cHIpOiBvLlN0YXRlbWVudCB7XG4gIHJldHVybiBuZXcgby5EZWNsYXJlVmFyU3RtdChcbiAgICB2YXJpYWJsZS5uYW1lISxcbiAgICB1bmRlZmluZWQsXG4gICAgby5JTkZFUlJFRF9UWVBFLFxuICAgIHVuZGVmaW5lZCxcbiAgICB2YXJpYWJsZS5zb3VyY2VTcGFuLFxuICApO1xufVxuXG4vKipcbiAqIExpZnRzIGkxOG4gcHJvcGVydGllcyBpbnRvIHRoZSBjb25zdHMgYXJyYXkuXG4gKiBUT0RPOiBDYW4gd2UgdXNlIGBDb25zdENvbGxlY3RlZEV4cHJgP1xuICogVE9ETzogVGhlIHdheSB0aGUgdmFyaW91cyBhdHRyaWJ1dGVzIGFyZSBsaW5rZWQgdG9nZXRoZXIgaXMgdmVyeSBjb21wbGV4LiBQZXJoYXBzIHdlIGNvdWxkXG4gKiBzaW1wbGlmeSB0aGUgcHJvY2VzcywgbWF5YmUgYnkgY29tYmluaW5nIHRoZSBjb250ZXh0IGFuZCBtZXNzYWdlIG9wcz9cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbGxlY3RJMThuQ29uc3RzKGpvYjogQ29tcG9uZW50Q29tcGlsYXRpb25Kb2IpOiB2b2lkIHtcbiAgY29uc3QgZmlsZUJhc2VkSTE4blN1ZmZpeCA9XG4gICAgam9iLnJlbGF0aXZlQ29udGV4dEZpbGVQYXRoLnJlcGxhY2UoL1teQS1aYS16MC05XS9nLCAnXycpLnRvVXBwZXJDYXNlKCkgKyAnXyc7XG4gIC8vIFN0ZXAgT25lOiBCdWlsZCB1cCB2YXJpb3VzIGxvb2t1cCBtYXBzIHdlIG5lZWQgdG8gY29sbGVjdCBhbGwgdGhlIGNvbnN0cy5cblxuICAvLyBDb250ZXh0IFhyZWYgLT4gRXh0cmFjdGVkIEF0dHJpYnV0ZSBPcHNcbiAgY29uc3QgZXh0cmFjdGVkQXR0cmlidXRlc0J5STE4bkNvbnRleHQgPSBuZXcgTWFwPGlyLlhyZWZJZCwgaXIuRXh0cmFjdGVkQXR0cmlidXRlT3BbXT4oKTtcbiAgLy8gRWxlbWVudC9FbGVtZW50U3RhcnQgWHJlZiAtPiBJMThuIEF0dHJpYnV0ZXMgY29uZmlnIG9wXG4gIGNvbnN0IGkxOG5BdHRyaWJ1dGVzQnlFbGVtZW50ID0gbmV3IE1hcDxpci5YcmVmSWQsIGlyLkkxOG5BdHRyaWJ1dGVzT3A+KCk7XG4gIC8vIEVsZW1lbnQvRWxlbWVudFN0YXJ0IFhyZWYgLT4gQWxsIEkxOG4gRXhwcmVzc2lvbiBvcHMgZm9yIGF0dHJzIG9uIHRoYXQgdGFyZ2V0XG4gIGNvbnN0IGkxOG5FeHByZXNzaW9uc0J5RWxlbWVudCA9IG5ldyBNYXA8aXIuWHJlZklkLCBpci5JMThuRXhwcmVzc2lvbk9wW10+KCk7XG4gIC8vIEkxOG4gTWVzc2FnZSBYcmVmIC0+IEkxOG4gTWVzc2FnZSBPcCAoVE9ETzogdXNlIGEgY2VudHJhbCBvcCBtYXApXG4gIGNvbnN0IG1lc3NhZ2VzID0gbmV3IE1hcDxpci5YcmVmSWQsIGlyLkkxOG5NZXNzYWdlT3A+KCk7XG5cbiAgZm9yIChjb25zdCB1bml0IG9mIGpvYi51bml0cykge1xuICAgIGZvciAoY29uc3Qgb3Agb2YgdW5pdC5vcHMoKSkge1xuICAgICAgaWYgKG9wLmtpbmQgPT09IGlyLk9wS2luZC5FeHRyYWN0ZWRBdHRyaWJ1dGUgJiYgb3AuaTE4bkNvbnRleHQgIT09IG51bGwpIHtcbiAgICAgICAgY29uc3QgYXR0cmlidXRlcyA9IGV4dHJhY3RlZEF0dHJpYnV0ZXNCeUkxOG5Db250ZXh0LmdldChvcC5pMThuQ29udGV4dCkgPz8gW107XG4gICAgICAgIGF0dHJpYnV0ZXMucHVzaChvcCk7XG4gICAgICAgIGV4dHJhY3RlZEF0dHJpYnV0ZXNCeUkxOG5Db250ZXh0LnNldChvcC5pMThuQ29udGV4dCwgYXR0cmlidXRlcyk7XG4gICAgICB9IGVsc2UgaWYgKG9wLmtpbmQgPT09IGlyLk9wS2luZC5JMThuQXR0cmlidXRlcykge1xuICAgICAgICBpMThuQXR0cmlidXRlc0J5RWxlbWVudC5zZXQob3AudGFyZ2V0LCBvcCk7XG4gICAgICB9IGVsc2UgaWYgKFxuICAgICAgICBvcC5raW5kID09PSBpci5PcEtpbmQuSTE4bkV4cHJlc3Npb24gJiZcbiAgICAgICAgb3AudXNhZ2UgPT09IGlyLkkxOG5FeHByZXNzaW9uRm9yLkkxOG5BdHRyaWJ1dGVcbiAgICAgICkge1xuICAgICAgICBjb25zdCBleHByZXNzaW9ucyA9IGkxOG5FeHByZXNzaW9uc0J5RWxlbWVudC5nZXQob3AudGFyZ2V0KSA/PyBbXTtcbiAgICAgICAgZXhwcmVzc2lvbnMucHVzaChvcCk7XG4gICAgICAgIGkxOG5FeHByZXNzaW9uc0J5RWxlbWVudC5zZXQob3AudGFyZ2V0LCBleHByZXNzaW9ucyk7XG4gICAgICB9IGVsc2UgaWYgKG9wLmtpbmQgPT09IGlyLk9wS2luZC5JMThuTWVzc2FnZSkge1xuICAgICAgICBtZXNzYWdlcy5zZXQob3AueHJlZiwgb3ApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIFN0ZXAgVHdvOiBTZXJpYWxpemUgdGhlIGV4dHJhY3RlZCBpMThuIG1lc3NhZ2VzIGZvciByb290IGkxOG4gYmxvY2tzIGFuZCBpMThuIGF0dHJpYnV0ZXMgaW50b1xuICAvLyB0aGUgY29uc3QgYXJyYXkuXG4gIC8vXG4gIC8vIEFsc28sIGVhY2ggaTE4biBtZXNzYWdlIHdpbGwgaGF2ZSBhIHZhcmlhYmxlIGV4cHJlc3Npb24gdGhhdCBjYW4gcmVmZXIgdG8gaXRzXG4gIC8vIHZhbHVlLiBTdG9yZSB0aGVzZSBleHByZXNzaW9ucyBpbiB0aGUgYXBwcm9wcmlhdGUgcGxhY2U6XG4gIC8vIDEuIEZvciBub3JtYWwgaTE4biBjb250ZW50LCBpdCBhbHNvIGdvZXMgaW4gdGhlIGNvbnN0IGFycmF5LiBXZSBzYXZlIHRoZSBjb25zdCBpbmRleCB0byB1c2VcbiAgLy8gbGF0ZXIuXG4gIC8vIDIuIEZvciBleHRyYWN0ZWQgYXR0cmlidXRlcywgaXQgYmVjb21lcyB0aGUgdmFsdWUgb2YgdGhlIGV4dHJhY3RlZCBhdHRyaWJ1dGUgaW5zdHJ1Y3Rpb24uXG4gIC8vIDMuIEZvciBpMThuIGJpbmRpbmdzLCBpdCB3aWxsIGdvIGluIGEgc2VwYXJhdGUgY29uc3QgYXJyYXkgaW5zdHJ1Y3Rpb24gYmVsb3c7IGZvciBub3csIHdlIGp1c3RcbiAgLy8gc2F2ZSBpdC5cblxuICBjb25zdCBpMThuVmFsdWVzQnlDb250ZXh0ID0gbmV3IE1hcDxpci5YcmVmSWQsIG8uRXhwcmVzc2lvbj4oKTtcbiAgY29uc3QgbWVzc2FnZUNvbnN0SW5kaWNlcyA9IG5ldyBNYXA8aXIuWHJlZklkLCBpci5Db25zdEluZGV4PigpO1xuXG4gIGZvciAoY29uc3QgdW5pdCBvZiBqb2IudW5pdHMpIHtcbiAgICBmb3IgKGNvbnN0IG9wIG9mIHVuaXQuY3JlYXRlKSB7XG4gICAgICBpZiAob3Aua2luZCA9PT0gaXIuT3BLaW5kLkkxOG5NZXNzYWdlKSB7XG4gICAgICAgIGlmIChvcC5tZXNzYWdlUGxhY2Vob2xkZXIgPT09IG51bGwpIHtcbiAgICAgICAgICBjb25zdCB7bWFpblZhciwgc3RhdGVtZW50c30gPSBjb2xsZWN0TWVzc2FnZShqb2IsIGZpbGVCYXNlZEkxOG5TdWZmaXgsIG1lc3NhZ2VzLCBvcCk7XG4gICAgICAgICAgaWYgKG9wLmkxOG5CbG9jayAhPT0gbnVsbCkge1xuICAgICAgICAgICAgLy8gVGhpcyBpcyBhIHJlZ3VsYXIgaTE4biBtZXNzYWdlIHdpdGggYSBjb3JyZXNwb25kaW5nIGkxOG4gYmxvY2suIENvbGxlY3QgaXQgaW50byB0aGVcbiAgICAgICAgICAgIC8vIGNvbnN0IGFycmF5LlxuICAgICAgICAgICAgY29uc3QgaTE4bkNvbnN0ID0gam9iLmFkZENvbnN0KG1haW5WYXIsIHN0YXRlbWVudHMpO1xuICAgICAgICAgICAgbWVzc2FnZUNvbnN0SW5kaWNlcy5zZXQob3AuaTE4bkJsb2NrLCBpMThuQ29uc3QpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBUaGlzIGlzIGFuIGkxOG4gYXR0cmlidXRlLiBFeHRyYWN0IHRoZSBpbml0aWFsaXplcnMgaW50byB0aGUgY29uc3QgcG9vbC5cbiAgICAgICAgICAgIGpvYi5jb25zdHNJbml0aWFsaXplcnMucHVzaCguLi5zdGF0ZW1lbnRzKTtcblxuICAgICAgICAgICAgLy8gU2F2ZSB0aGUgaTE4biB2YXJpYWJsZSB2YWx1ZSBmb3IgbGF0ZXIuXG4gICAgICAgICAgICBpMThuVmFsdWVzQnlDb250ZXh0LnNldChvcC5pMThuQ29udGV4dCwgbWFpblZhcik7XG5cbiAgICAgICAgICAgIC8vIFRoaXMgaTE4biBtZXNzYWdlIG1heSBjb3JyZXNwb25kIHRvIGFuIGluZGl2aWR1YWwgZXh0cmFjdGVkIGF0dHJpYnV0ZS4gSWYgc28sIFRoZVxuICAgICAgICAgICAgLy8gdmFsdWUgb2YgdGhhdCBhdHRyaWJ1dGUgaXMgdXBkYXRlZCB0byByZWFkIHRoZSBleHRyYWN0ZWQgaTE4biB2YXJpYWJsZS5cbiAgICAgICAgICAgIGNvbnN0IGF0dHJpYnV0ZXNGb3JNZXNzYWdlID0gZXh0cmFjdGVkQXR0cmlidXRlc0J5STE4bkNvbnRleHQuZ2V0KG9wLmkxOG5Db250ZXh0KTtcbiAgICAgICAgICAgIGlmIChhdHRyaWJ1dGVzRm9yTWVzc2FnZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgIGZvciAoY29uc3QgYXR0ciBvZiBhdHRyaWJ1dGVzRm9yTWVzc2FnZSkge1xuICAgICAgICAgICAgICAgIGF0dHIuZXhwcmVzc2lvbiA9IG1haW5WYXIuY2xvbmUoKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpci5PcExpc3QucmVtb3ZlPGlyLkNyZWF0ZU9wPihvcCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gU3RlcCBUaHJlZTogU2VyaWFsaXplIEkxOG5BdHRyaWJ1dGVzIGNvbmZpZ3VyYXRpb25zIGludG8gdGhlIGNvbnN0IGFycmF5LiBFYWNoIEkxOG5BdHRyaWJ1dGVzXG4gIC8vIGluc3RydWN0aW9uIGhhcyBhIGNvbmZpZyBhcnJheSwgd2hpY2ggY29udGFpbnMgay12IHBhaXJzIGRlc2NyaWJpbmcgZWFjaCBiaW5kaW5nIG5hbWUsIGFuZCB0aGVcbiAgLy8gaTE4biB2YXJpYWJsZSB0aGF0IHByb3ZpZGVzIHRoZSB2YWx1ZS5cblxuICBmb3IgKGNvbnN0IHVuaXQgb2Ygam9iLnVuaXRzKSB7XG4gICAgZm9yIChjb25zdCBlbGVtIG9mIHVuaXQuY3JlYXRlKSB7XG4gICAgICBpZiAoaXIuaXNFbGVtZW50T3JDb250YWluZXJPcChlbGVtKSkge1xuICAgICAgICBjb25zdCBpMThuQXR0cmlidXRlcyA9IGkxOG5BdHRyaWJ1dGVzQnlFbGVtZW50LmdldChlbGVtLnhyZWYpO1xuICAgICAgICBpZiAoaTE4bkF0dHJpYnV0ZXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIC8vIFRoaXMgZWxlbWVudCBpcyBub3QgYXNzb2NpYXRlZCB3aXRoIGFuIGkxOG4gYXR0cmlidXRlcyBjb25maWd1cmF0aW9uIGluc3RydWN0aW9uLlxuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGkxOG5FeHByZXNzaW9ucyA9IGkxOG5FeHByZXNzaW9uc0J5RWxlbWVudC5nZXQoZWxlbS54cmVmKTtcbiAgICAgICAgaWYgKGkxOG5FeHByZXNzaW9ucyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgLy8gVW51c2VkIGkxOG5BdHRyaWJ1dGVzIHNob3VsZCBoYXZlIGFscmVhZHkgYmVlbiByZW1vdmVkLlxuICAgICAgICAgIC8vIFRPRE86IFNob3VsZCB0aGUgcmVtb3ZhbCBvZiB0aG9zZSBkZWFkIGluc3RydWN0aW9ucyBiZSBtZXJnZWQgd2l0aCB0aGlzIHBoYXNlP1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICdBc3NlcnRpb25FcnJvcjogQ291bGQgbm90IGZpbmQgYW55IGkxOG4gZXhwcmVzc2lvbnMgYXNzb2NpYXRlZCB3aXRoIGFuIEkxOG5BdHRyaWJ1dGVzIGluc3RydWN0aW9uJyxcbiAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRmluZCBleHByZXNzaW9ucyBmb3IgYWxsIHRoZSB1bmlxdWUgcHJvcGVydHkgbmFtZXMsIHJlbW92aW5nIGR1cGxpY2F0ZXMuXG4gICAgICAgIGNvbnN0IHNlZW5Qcm9wZXJ0eU5hbWVzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgICAgIGkxOG5FeHByZXNzaW9ucyA9IGkxOG5FeHByZXNzaW9ucy5maWx0ZXIoKGkxOG5FeHByKSA9PiB7XG4gICAgICAgICAgY29uc3Qgc2VlbiA9IHNlZW5Qcm9wZXJ0eU5hbWVzLmhhcyhpMThuRXhwci5uYW1lKTtcbiAgICAgICAgICBzZWVuUHJvcGVydHlOYW1lcy5hZGQoaTE4bkV4cHIubmFtZSk7XG4gICAgICAgICAgcmV0dXJuICFzZWVuO1xuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBpMThuQXR0cmlidXRlQ29uZmlnID0gaTE4bkV4cHJlc3Npb25zLmZsYXRNYXAoKGkxOG5FeHByKSA9PiB7XG4gICAgICAgICAgY29uc3QgaTE4bkV4cHJWYWx1ZSA9IGkxOG5WYWx1ZXNCeUNvbnRleHQuZ2V0KGkxOG5FeHByLmNvbnRleHQpO1xuICAgICAgICAgIGlmIChpMThuRXhwclZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkFzc2VydGlvbkVycm9yOiBDb3VsZCBub3QgZmluZCBpMThuIGV4cHJlc3Npb24ncyB2YWx1ZVwiKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIFtvLmxpdGVyYWwoaTE4bkV4cHIubmFtZSksIGkxOG5FeHByVmFsdWVdO1xuICAgICAgICB9KTtcblxuICAgICAgICBpMThuQXR0cmlidXRlcy5pMThuQXR0cmlidXRlc0NvbmZpZyA9IGpvYi5hZGRDb25zdChcbiAgICAgICAgICBuZXcgby5MaXRlcmFsQXJyYXlFeHByKGkxOG5BdHRyaWJ1dGVDb25maWcpLFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIFN0ZXAgRm91cjogUHJvcGFnYXRlIHRoZSBleHRyYWN0ZWQgY29uc3QgaW5kZXggaW50byBpMThuIG9wcyB0aGF0IG1lc3NhZ2VzIHdlcmUgZXh0cmFjdGVkIGZyb20uXG5cbiAgZm9yIChjb25zdCB1bml0IG9mIGpvYi51bml0cykge1xuICAgIGZvciAoY29uc3Qgb3Agb2YgdW5pdC5jcmVhdGUpIHtcbiAgICAgIGlmIChvcC5raW5kID09PSBpci5PcEtpbmQuSTE4blN0YXJ0KSB7XG4gICAgICAgIGNvbnN0IG1zZ0luZGV4ID0gbWVzc2FnZUNvbnN0SW5kaWNlcy5nZXQob3Aucm9vdCk7XG4gICAgICAgIGlmIChtc2dJbmRleCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgJ0Fzc2VydGlvbkVycm9yOiBDb3VsZCBub3QgZmluZCBjb3JyZXNwb25kaW5nIGkxOG4gYmxvY2sgaW5kZXggZm9yIGFuIGkxOG4gbWVzc2FnZSBvcDsgd2FzIGFuIGkxOG4gbWVzc2FnZSBpbmNvcnJlY3RseSBhc3N1bWVkIHRvIGNvcnJlc3BvbmQgdG8gYW4gYXR0cmlidXRlPycsXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBvcC5tZXNzYWdlSW5kZXggPSBtc2dJbmRleDtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBDb2xsZWN0cyB0aGUgZ2l2ZW4gbWVzc2FnZSBpbnRvIGEgc2V0IG9mIHN0YXRlbWVudHMgdGhhdCBjYW4gYmUgYWRkZWQgdG8gdGhlIGNvbnN0IGFycmF5LlxuICogVGhpcyB3aWxsIHJlY3Vyc2l2ZWx5IGNvbGxlY3QgYW55IHN1Yi1tZXNzYWdlcyByZWZlcmVuY2VkIGZyb20gdGhlIHBhcmVudCBtZXNzYWdlIGFzIHdlbGwuXG4gKi9cbmZ1bmN0aW9uIGNvbGxlY3RNZXNzYWdlKFxuICBqb2I6IENvbXBvbmVudENvbXBpbGF0aW9uSm9iLFxuICBmaWxlQmFzZWRJMThuU3VmZml4OiBzdHJpbmcsXG4gIG1lc3NhZ2VzOiBNYXA8aXIuWHJlZklkLCBpci5JMThuTWVzc2FnZU9wPixcbiAgbWVzc2FnZU9wOiBpci5JMThuTWVzc2FnZU9wLFxuKToge21haW5WYXI6IG8uUmVhZFZhckV4cHI7IHN0YXRlbWVudHM6IG8uU3RhdGVtZW50W119IHtcbiAgLy8gUmVjdXJzaXZlbHkgY29sbGVjdCBhbnkgc3ViLW1lc3NhZ2VzLCByZWNvcmQgZWFjaCBzdWItbWVzc2FnZSdzIG1haW4gdmFyaWFibGUgdW5kZXIgaXRzXG4gIC8vIHBsYWNlaG9sZGVyIHNvIHRoYXQgd2UgY2FuIGFkZCB0aGVtIHRvIHRoZSBwYXJhbXMgZm9yIHRoZSBwYXJlbnQgbWVzc2FnZS4gSXQgaXMgcG9zc2libGVcbiAgLy8gdGhhdCBtdWx0aXBsZSBzdWItbWVzc2FnZXMgd2lsbCBzaGFyZSB0aGUgc2FtZSBwbGFjZWhvbGRlciwgc28gd2UgbmVlZCB0byB0cmFjayBhbiBhcnJheSBvZlxuICAvLyB2YXJpYWJsZXMgZm9yIGVhY2ggcGxhY2Vob2xkZXIuXG4gIGNvbnN0IHN0YXRlbWVudHM6IG8uU3RhdGVtZW50W10gPSBbXTtcbiAgY29uc3Qgc3ViTWVzc2FnZVBsYWNlaG9sZGVycyA9IG5ldyBNYXA8c3RyaW5nLCBvLkV4cHJlc3Npb25bXT4oKTtcbiAgZm9yIChjb25zdCBzdWJNZXNzYWdlSWQgb2YgbWVzc2FnZU9wLnN1Yk1lc3NhZ2VzKSB7XG4gICAgY29uc3Qgc3ViTWVzc2FnZSA9IG1lc3NhZ2VzLmdldChzdWJNZXNzYWdlSWQpITtcbiAgICBjb25zdCB7bWFpblZhcjogc3ViTWVzc2FnZVZhciwgc3RhdGVtZW50czogc3ViTWVzc2FnZVN0YXRlbWVudHN9ID0gY29sbGVjdE1lc3NhZ2UoXG4gICAgICBqb2IsXG4gICAgICBmaWxlQmFzZWRJMThuU3VmZml4LFxuICAgICAgbWVzc2FnZXMsXG4gICAgICBzdWJNZXNzYWdlLFxuICAgICk7XG4gICAgc3RhdGVtZW50cy5wdXNoKC4uLnN1Yk1lc3NhZ2VTdGF0ZW1lbnRzKTtcbiAgICBjb25zdCBzdWJNZXNzYWdlcyA9IHN1Yk1lc3NhZ2VQbGFjZWhvbGRlcnMuZ2V0KHN1Yk1lc3NhZ2UubWVzc2FnZVBsYWNlaG9sZGVyISkgPz8gW107XG4gICAgc3ViTWVzc2FnZXMucHVzaChzdWJNZXNzYWdlVmFyKTtcbiAgICBzdWJNZXNzYWdlUGxhY2Vob2xkZXJzLnNldChzdWJNZXNzYWdlLm1lc3NhZ2VQbGFjZWhvbGRlciEsIHN1Yk1lc3NhZ2VzKTtcbiAgfVxuICBhZGRTdWJNZXNzYWdlUGFyYW1zKG1lc3NhZ2VPcCwgc3ViTWVzc2FnZVBsYWNlaG9sZGVycyk7XG5cbiAgLy8gU29ydCB0aGUgcGFyYW1zIGZvciBjb25zaXN0ZW5jeSB3aXRoIFRlbWFwbGF0ZURlZmluaXRpb25CdWlsZGVyIG91dHB1dC5cbiAgbWVzc2FnZU9wLnBhcmFtcyA9IG5ldyBNYXAoWy4uLm1lc3NhZ2VPcC5wYXJhbXMuZW50cmllcygpXS5zb3J0KCkpO1xuXG4gIGNvbnN0IG1haW5WYXIgPSBvLnZhcmlhYmxlKGpvYi5wb29sLnVuaXF1ZU5hbWUoVFJBTlNMQVRJT05fVkFSX1BSRUZJWCkpO1xuICAvLyBDbG9zdXJlIENvbXBpbGVyIHJlcXVpcmVzIGNvbnN0IG5hbWVzIHRvIHN0YXJ0IHdpdGggYE1TR19gIGJ1dCBkaXNhbGxvd3MgYW55IG90aGVyXG4gIC8vIGNvbnN0IHRvIHN0YXJ0IHdpdGggYE1TR19gLiBXZSBkZWZpbmUgYSB2YXJpYWJsZSBzdGFydGluZyB3aXRoIGBNU0dfYCBqdXN0IGZvciB0aGVcbiAgLy8gYGdvb2cuZ2V0TXNnYCBjYWxsXG4gIGNvbnN0IGNsb3N1cmVWYXIgPSBpMThuR2VuZXJhdGVDbG9zdXJlVmFyKFxuICAgIGpvYi5wb29sLFxuICAgIG1lc3NhZ2VPcC5tZXNzYWdlLmlkLFxuICAgIGZpbGVCYXNlZEkxOG5TdWZmaXgsXG4gICAgam9iLmkxOG5Vc2VFeHRlcm5hbElkcyxcbiAgKTtcbiAgbGV0IHRyYW5zZm9ybUZuID0gdW5kZWZpbmVkO1xuXG4gIC8vIElmIG5lc2Nlc3NhcnksIGFkZCBhIHBvc3QtcHJvY2Vzc2luZyBzdGVwIGFuZCByZXNvbHZlIGFueSBwbGFjZWhvbGRlciBwYXJhbXMgdGhhdCBhcmVcbiAgLy8gc2V0IGluIHBvc3QtcHJvY2Vzc2luZy5cbiAgaWYgKG1lc3NhZ2VPcC5uZWVkc1Bvc3Rwcm9jZXNzaW5nIHx8IG1lc3NhZ2VPcC5wb3N0cHJvY2Vzc2luZ1BhcmFtcy5zaXplID4gMCkge1xuICAgIC8vIFNvcnQgdGhlIHBvc3QtcHJvY2Vzc2luZyBwYXJhbXMgZm9yIGNvbnNpc3RlbmN5IHdpdGggVGVtYXBsYXRlRGVmaW5pdGlvbkJ1aWxkZXIgb3V0cHV0LlxuICAgIGNvbnN0IHBvc3Rwcm9jZXNzaW5nUGFyYW1zID0gT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgICAgWy4uLm1lc3NhZ2VPcC5wb3N0cHJvY2Vzc2luZ1BhcmFtcy5lbnRyaWVzKCldLnNvcnQoKSxcbiAgICApO1xuICAgIGNvbnN0IGZvcm1hdHRlZFBvc3Rwcm9jZXNzaW5nUGFyYW1zID0gZm9ybWF0STE4blBsYWNlaG9sZGVyTmFtZXNJbk1hcChcbiAgICAgIHBvc3Rwcm9jZXNzaW5nUGFyYW1zLFxuICAgICAgLyogdXNlQ2FtZWxDYXNlICovIGZhbHNlLFxuICAgICk7XG4gICAgY29uc3QgZXh0cmFUcmFuc2Zvcm1GblBhcmFtczogby5FeHByZXNzaW9uW10gPSBbXTtcbiAgICBpZiAobWVzc2FnZU9wLnBvc3Rwcm9jZXNzaW5nUGFyYW1zLnNpemUgPiAwKSB7XG4gICAgICBleHRyYVRyYW5zZm9ybUZuUGFyYW1zLnB1c2gobWFwTGl0ZXJhbChmb3JtYXR0ZWRQb3N0cHJvY2Vzc2luZ1BhcmFtcywgLyogcXVvdGVkICovIHRydWUpKTtcbiAgICB9XG4gICAgdHJhbnNmb3JtRm4gPSAoZXhwcjogby5SZWFkVmFyRXhwcikgPT5cbiAgICAgIG8uaW1wb3J0RXhwcihJZGVudGlmaWVycy5pMThuUG9zdHByb2Nlc3MpLmNhbGxGbihbZXhwciwgLi4uZXh0cmFUcmFuc2Zvcm1GblBhcmFtc10pO1xuICB9XG5cbiAgLy8gQWRkIHRoZSBtZXNzYWdlJ3Mgc3RhdGVtZW50c1xuICBzdGF0ZW1lbnRzLnB1c2goXG4gICAgLi4uZ2V0VHJhbnNsYXRpb25EZWNsU3RtdHMoXG4gICAgICBtZXNzYWdlT3AubWVzc2FnZSxcbiAgICAgIG1haW5WYXIsXG4gICAgICBjbG9zdXJlVmFyLFxuICAgICAgbWVzc2FnZU9wLnBhcmFtcyxcbiAgICAgIHRyYW5zZm9ybUZuLFxuICAgICksXG4gICk7XG5cbiAgcmV0dXJuIHttYWluVmFyLCBzdGF0ZW1lbnRzfTtcbn1cblxuLyoqXG4gKiBBZGRzIHRoZSBnaXZlbiBzdWJNZXNzYWdlIHBsYWNlaG9sZGVycyB0byB0aGUgZ2l2ZW4gbWVzc2FnZSBvcC5cbiAqXG4gKiBJZiBhIHBsYWNlaG9sZGVyIG9ubHkgY29ycmVzcG9uZHMgdG8gYSBzaW5nbGUgc3ViLW1lc3NhZ2UgdmFyaWFibGUsIHdlIGp1c3Qgc2V0IHRoYXQgdmFyaWFibGVcbiAqIGFzIHRoZSBwYXJhbSB2YWx1ZS4gSG93ZXZlciwgaWYgdGhlIHBsYWNlaG9sZGVyIGNvcnJlc3BvbmRzIHRvIG11bHRpcGxlIHN1Yi1tZXNzYWdlXG4gKiB2YXJpYWJsZXMsIHdlIG5lZWQgdG8gYWRkIGEgc3BlY2lhbCBwbGFjZWhvbGRlciB2YWx1ZSB0aGF0IGlzIGhhbmRsZWQgYnkgdGhlIHBvc3QtcHJvY2Vzc2luZ1xuICogc3RlcC4gV2UgdGhlbiBhZGQgdGhlIGFycmF5IG9mIHZhcmlhYmxlcyBhcyBhIHBvc3QtcHJvY2Vzc2luZyBwYXJhbS5cbiAqL1xuZnVuY3Rpb24gYWRkU3ViTWVzc2FnZVBhcmFtcyhcbiAgbWVzc2FnZU9wOiBpci5JMThuTWVzc2FnZU9wLFxuICBzdWJNZXNzYWdlUGxhY2Vob2xkZXJzOiBNYXA8c3RyaW5nLCBvLkV4cHJlc3Npb25bXT4sXG4pIHtcbiAgZm9yIChjb25zdCBbcGxhY2Vob2xkZXIsIHN1Yk1lc3NhZ2VzXSBvZiBzdWJNZXNzYWdlUGxhY2Vob2xkZXJzKSB7XG4gICAgaWYgKHN1Yk1lc3NhZ2VzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgbWVzc2FnZU9wLnBhcmFtcy5zZXQocGxhY2Vob2xkZXIsIHN1Yk1lc3NhZ2VzWzBdKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbWVzc2FnZU9wLnBhcmFtcy5zZXQoXG4gICAgICAgIHBsYWNlaG9sZGVyLFxuICAgICAgICBvLmxpdGVyYWwoYCR7RVNDQVBFfSR7STE4Tl9JQ1VfTUFQUElOR19QUkVGSVh9JHtwbGFjZWhvbGRlcn0ke0VTQ0FQRX1gKSxcbiAgICAgICk7XG4gICAgICBtZXNzYWdlT3AucG9zdHByb2Nlc3NpbmdQYXJhbXMuc2V0KHBsYWNlaG9sZGVyLCBvLmxpdGVyYWxBcnIoc3ViTWVzc2FnZXMpKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBHZW5lcmF0ZSBzdGF0ZW1lbnRzIHRoYXQgZGVmaW5lIGEgZ2l2ZW4gdHJhbnNsYXRpb24gbWVzc2FnZS5cbiAqXG4gKiBgYGBcbiAqIHZhciBJMThOXzE7XG4gKiBpZiAodHlwZW9mIG5nSTE4bkNsb3N1cmVNb2RlICE9PSB1bmRlZmluZWQgJiYgbmdJMThuQ2xvc3VyZU1vZGUpIHtcbiAqICAgICB2YXIgTVNHX0VYVEVSTkFMX1hYWCA9IGdvb2cuZ2V0TXNnKFxuICogICAgICAgICAgXCJTb21lIG1lc3NhZ2Ugd2l0aCB7JGludGVycG9sYXRpb259IVwiLFxuICogICAgICAgICAgeyBcImludGVycG9sYXRpb25cIjogXCJcXHVGRkZEMFxcdUZGRkRcIiB9XG4gKiAgICAgKTtcbiAqICAgICBJMThOXzEgPSBNU0dfRVhURVJOQUxfWFhYO1xuICogfVxuICogZWxzZSB7XG4gKiAgICAgSTE4Tl8xID0gJGxvY2FsaXplYFNvbWUgbWVzc2FnZSB3aXRoICR7J1xcdUZGRkQwXFx1RkZGRCd9IWA7XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gbWVzc2FnZSBUaGUgb3JpZ2luYWwgaTE4biBBU1QgbWVzc2FnZSBub2RlXG4gKiBAcGFyYW0gdmFyaWFibGUgVGhlIHZhcmlhYmxlIHRoYXQgd2lsbCBiZSBhc3NpZ25lZCB0aGUgdHJhbnNsYXRpb24sIGUuZy4gYEkxOE5fMWAuXG4gKiBAcGFyYW0gY2xvc3VyZVZhciBUaGUgdmFyaWFibGUgZm9yIENsb3N1cmUgYGdvb2cuZ2V0TXNnYCBjYWxscywgZS5nLiBgTVNHX0VYVEVSTkFMX1hYWGAuXG4gKiBAcGFyYW0gcGFyYW1zIE9iamVjdCBtYXBwaW5nIHBsYWNlaG9sZGVyIG5hbWVzIHRvIHRoZWlyIHZhbHVlcyAoZS5nLlxuICogYHsgXCJpbnRlcnBvbGF0aW9uXCI6IFwiXFx1RkZGRDBcXHVGRkZEXCIgfWApLlxuICogQHBhcmFtIHRyYW5zZm9ybUZuIE9wdGlvbmFsIHRyYW5zZm9ybWF0aW9uIGZ1bmN0aW9uIHRoYXQgd2lsbCBiZSBhcHBsaWVkIHRvIHRoZSB0cmFuc2xhdGlvblxuICogICAgIChlLmcuXG4gKiBwb3N0LXByb2Nlc3NpbmcpLlxuICogQHJldHVybnMgQW4gYXJyYXkgb2Ygc3RhdGVtZW50cyB0aGF0IGRlZmluZWQgYSBnaXZlbiB0cmFuc2xhdGlvbi5cbiAqL1xuZnVuY3Rpb24gZ2V0VHJhbnNsYXRpb25EZWNsU3RtdHMoXG4gIG1lc3NhZ2U6IGkxOG4uTWVzc2FnZSxcbiAgdmFyaWFibGU6IG8uUmVhZFZhckV4cHIsXG4gIGNsb3N1cmVWYXI6IG8uUmVhZFZhckV4cHIsXG4gIHBhcmFtczogTWFwPHN0cmluZywgby5FeHByZXNzaW9uPixcbiAgdHJhbnNmb3JtRm4/OiAocmF3OiBvLlJlYWRWYXJFeHByKSA9PiBvLkV4cHJlc3Npb24sXG4pOiBvLlN0YXRlbWVudFtdIHtcbiAgY29uc3QgcGFyYW1zT2JqZWN0ID0gT2JqZWN0LmZyb21FbnRyaWVzKHBhcmFtcyk7XG4gIGNvbnN0IHN0YXRlbWVudHM6IG8uU3RhdGVtZW50W10gPSBbXG4gICAgZGVjbGFyZUkxOG5WYXJpYWJsZSh2YXJpYWJsZSksXG4gICAgby5pZlN0bXQoXG4gICAgICBjcmVhdGVDbG9zdXJlTW9kZUd1YXJkKCksXG4gICAgICBjcmVhdGVHb29nbGVHZXRNc2dTdGF0ZW1lbnRzKHZhcmlhYmxlLCBtZXNzYWdlLCBjbG9zdXJlVmFyLCBwYXJhbXNPYmplY3QpLFxuICAgICAgY3JlYXRlTG9jYWxpemVTdGF0ZW1lbnRzKFxuICAgICAgICB2YXJpYWJsZSxcbiAgICAgICAgbWVzc2FnZSxcbiAgICAgICAgZm9ybWF0STE4blBsYWNlaG9sZGVyTmFtZXNJbk1hcChwYXJhbXNPYmplY3QsIC8qIHVzZUNhbWVsQ2FzZSAqLyBmYWxzZSksXG4gICAgICApLFxuICAgICksXG4gIF07XG5cbiAgaWYgKHRyYW5zZm9ybUZuKSB7XG4gICAgc3RhdGVtZW50cy5wdXNoKG5ldyBvLkV4cHJlc3Npb25TdGF0ZW1lbnQodmFyaWFibGUuc2V0KHRyYW5zZm9ybUZuKHZhcmlhYmxlKSkpKTtcbiAgfVxuXG4gIHJldHVybiBzdGF0ZW1lbnRzO1xufVxuXG4vKipcbiAqIENyZWF0ZSB0aGUgZXhwcmVzc2lvbiB0aGF0IHdpbGwgYmUgdXNlZCB0byBndWFyZCB0aGUgY2xvc3VyZSBtb2RlIGJsb2NrXG4gKiBJdCBpcyBlcXVpdmFsZW50IHRvOlxuICpcbiAqIGBgYFxuICogdHlwZW9mIG5nSTE4bkNsb3N1cmVNb2RlICE9PSB1bmRlZmluZWQgJiYgbmdJMThuQ2xvc3VyZU1vZGVcbiAqIGBgYFxuICovXG5mdW5jdGlvbiBjcmVhdGVDbG9zdXJlTW9kZUd1YXJkKCk6IG8uQmluYXJ5T3BlcmF0b3JFeHByIHtcbiAgcmV0dXJuIG9cbiAgICAudHlwZW9mRXhwcihvLnZhcmlhYmxlKE5HX0kxOE5fQ0xPU1VSRV9NT0RFKSlcbiAgICAubm90SWRlbnRpY2FsKG8ubGl0ZXJhbCgndW5kZWZpbmVkJywgby5TVFJJTkdfVFlQRSkpXG4gICAgLmFuZChvLnZhcmlhYmxlKE5HX0kxOE5fQ0xPU1VSRV9NT0RFKSk7XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIHZhcnMgd2l0aCBDbG9zdXJlLXNwZWNpZmljIG5hbWVzIGZvciBpMThuIGJsb2NrcyAoaS5lLiBgTVNHX1hYWGApLlxuICovXG5mdW5jdGlvbiBpMThuR2VuZXJhdGVDbG9zdXJlVmFyKFxuICBwb29sOiBDb25zdGFudFBvb2wsXG4gIG1lc3NhZ2VJZDogc3RyaW5nLFxuICBmaWxlQmFzZWRJMThuU3VmZml4OiBzdHJpbmcsXG4gIHVzZUV4dGVybmFsSWRzOiBib29sZWFuLFxuKTogby5SZWFkVmFyRXhwciB7XG4gIGxldCBuYW1lOiBzdHJpbmc7XG4gIGNvbnN0IHN1ZmZpeCA9IGZpbGVCYXNlZEkxOG5TdWZmaXg7XG4gIGlmICh1c2VFeHRlcm5hbElkcykge1xuICAgIGNvbnN0IHByZWZpeCA9IGdldFRyYW5zbGF0aW9uQ29uc3RQcmVmaXgoYEVYVEVSTkFMX2ApO1xuICAgIGNvbnN0IHVuaXF1ZVN1ZmZpeCA9IHBvb2wudW5pcXVlTmFtZShzdWZmaXgpO1xuICAgIG5hbWUgPSBgJHtwcmVmaXh9JHtzYW5pdGl6ZUlkZW50aWZpZXIobWVzc2FnZUlkKX0kJCR7dW5pcXVlU3VmZml4fWA7XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgcHJlZml4ID0gZ2V0VHJhbnNsYXRpb25Db25zdFByZWZpeChzdWZmaXgpO1xuICAgIG5hbWUgPSBwb29sLnVuaXF1ZU5hbWUocHJlZml4KTtcbiAgfVxuICByZXR1cm4gby52YXJpYWJsZShuYW1lKTtcbn1cbiJdfQ==