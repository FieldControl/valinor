/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaTE4bl9jb25zdF9jb2xsZWN0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3RlbXBsYXRlL3BpcGVsaW5lL3NyYy9waGFzZXMvaTE4bl9jb25zdF9jb2xsZWN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUlILE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSw2QkFBNkIsQ0FBQztBQUN2RCxPQUFPLEtBQUssQ0FBQyxNQUFNLCtCQUErQixDQUFDO0FBQ25ELE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQzFELE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxvQ0FBb0MsQ0FBQztBQUMvRCxPQUFPLEVBQUMsNEJBQTRCLEVBQUMsTUFBTSw2Q0FBNkMsQ0FBQztBQUN6RixPQUFPLEVBQUMsd0JBQXdCLEVBQUMsTUFBTSw4Q0FBOEMsQ0FBQztBQUN0RixPQUFPLEVBQUMsK0JBQStCLEVBQUMsTUFBTSxvQ0FBb0MsQ0FBQztBQUNuRixPQUFPLEtBQUssRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUcvQixrR0FBa0c7QUFDbEcsTUFBTSxvQkFBb0IsR0FBRyxtQkFBbUIsQ0FBQztBQUVqRDs7OztHQUlHO0FBQ0gsTUFBTSxzQkFBc0IsR0FBRyxPQUFPLENBQUM7QUFFdkMsb0RBQW9EO0FBQ3BELE1BQU0sQ0FBQyxNQUFNLHVCQUF1QixHQUFHLFdBQVcsQ0FBQztBQUVuRDs7R0FFRztBQUNILE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQztBQUV4QixzRUFBc0U7QUFDdEUsTUFBTSw4QkFBOEIsR0FBRyxNQUFNLENBQUM7QUFFOUM7Ozs7O0dBS0c7QUFDSCxNQUFNLFVBQVUseUJBQXlCLENBQUMsS0FBYTtJQUNyRCxPQUFPLEdBQUcsOEJBQThCLEdBQUcsS0FBSyxFQUFFLENBQUMsV0FBVyxFQUFFLENB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LENBQUMsTUFBTSxDQUFDLENBQUM7UUFDN0MsSUFBSSxHQUFHLEdBQUcsTUFBTSxHQUFHLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxLQUFLLFlBQVksRUFBRSxDQUFDO0lBQ3RFLENBQUM7U0FBTSxDQUFDO1FBQ04sTUFBTSxNQUFNLEdBQUcseUJBQXlCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDakQsSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDakMsQ0FBQztJQUNELE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMxQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge3R5cGUgQ29uc3RhbnRQb29sfSBmcm9tICcuLi8uLi8uLi8uLi9jb25zdGFudF9wb29sJztcbmltcG9ydCAqIGFzIGkxOG4gZnJvbSAnLi4vLi4vLi4vLi4vaTE4bi9pMThuX2FzdCc7XG5pbXBvcnQge21hcExpdGVyYWx9IGZyb20gJy4uLy4uLy4uLy4uL291dHB1dC9tYXBfdXRpbCc7XG5pbXBvcnQgKiBhcyBvIGZyb20gJy4uLy4uLy4uLy4uL291dHB1dC9vdXRwdXRfYXN0JztcbmltcG9ydCB7c2FuaXRpemVJZGVudGlmaWVyfSBmcm9tICcuLi8uLi8uLi8uLi9wYXJzZV91dGlsJztcbmltcG9ydCB7SWRlbnRpZmllcnN9IGZyb20gJy4uLy4uLy4uLy4uL3JlbmRlcjMvcjNfaWRlbnRpZmllcnMnO1xuaW1wb3J0IHtjcmVhdGVHb29nbGVHZXRNc2dTdGF0ZW1lbnRzfSBmcm9tICcuLi8uLi8uLi8uLi9yZW5kZXIzL3ZpZXcvaTE4bi9nZXRfbXNnX3V0aWxzJztcbmltcG9ydCB7Y3JlYXRlTG9jYWxpemVTdGF0ZW1lbnRzfSBmcm9tICcuLi8uLi8uLi8uLi9yZW5kZXIzL3ZpZXcvaTE4bi9sb2NhbGl6ZV91dGlscyc7XG5pbXBvcnQge2Zvcm1hdEkxOG5QbGFjZWhvbGRlck5hbWVzSW5NYXB9IGZyb20gJy4uLy4uLy4uLy4uL3JlbmRlcjMvdmlldy9pMThuL3V0aWwnO1xuaW1wb3J0ICogYXMgaXIgZnJvbSAnLi4vLi4vaXInO1xuaW1wb3J0IHtDb21wb25lbnRDb21waWxhdGlvbkpvYn0gZnJvbSAnLi4vY29tcGlsYXRpb24nO1xuXG4vKiogTmFtZSBvZiB0aGUgZ2xvYmFsIHZhcmlhYmxlIHRoYXQgaXMgdXNlZCB0byBkZXRlcm1pbmUgaWYgd2UgdXNlIENsb3N1cmUgdHJhbnNsYXRpb25zIG9yIG5vdCAqL1xuY29uc3QgTkdfSTE4Tl9DTE9TVVJFX01PREUgPSAnbmdJMThuQ2xvc3VyZU1vZGUnO1xuXG4vKipcbiAqIFByZWZpeCBmb3Igbm9uLWBnb29nLmdldE1zZ2AgaTE4bi1yZWxhdGVkIHZhcnMuXG4gKiBOb3RlOiB0aGUgcHJlZml4IHVzZXMgbG93ZXJjYXNlIGNoYXJhY3RlcnMgaW50ZW50aW9uYWxseSBkdWUgdG8gYSBDbG9zdXJlIGJlaGF2aW9yIHRoYXRcbiAqIGNvbnNpZGVycyB2YXJpYWJsZXMgbGlrZSBgSTE4Tl8wYCBhcyBjb25zdGFudHMgYW5kIHRocm93cyBhbiBlcnJvciB3aGVuIHRoZWlyIHZhbHVlIGNoYW5nZXMuXG4gKi9cbmNvbnN0IFRSQU5TTEFUSU9OX1ZBUl9QUkVGSVggPSAnaTE4bl8nO1xuXG4vKiogUHJlZml4IG9mIElDVSBleHByZXNzaW9ucyBmb3IgcG9zdCBwcm9jZXNzaW5nICovXG5leHBvcnQgY29uc3QgSTE4Tl9JQ1VfTUFQUElOR19QUkVGSVggPSAnSTE4Tl9FWFBfJztcblxuLyoqXG4gKiBUaGUgZXNjYXBlIHNlcXVlbmNlIHVzZWQgZm9yIG1lc3NhZ2UgcGFyYW0gdmFsdWVzLlxuICovXG5jb25zdCBFU0NBUEUgPSAnXFx1RkZGRCc7XG5cbi8qIENsb3N1cmUgdmFyaWFibGVzIGhvbGRpbmcgbWVzc2FnZXMgbXVzdCBiZSBuYW1lZCBgTVNHX1tBLVowLTldK2AgKi9cbmNvbnN0IENMT1NVUkVfVFJBTlNMQVRJT05fVkFSX1BSRUZJWCA9ICdNU0dfJztcblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSBwcmVmaXggZm9yIHRyYW5zbGF0aW9uIGNvbnN0IG5hbWUuXG4gKlxuICogQHBhcmFtIGV4dHJhIEFkZGl0aW9uYWwgbG9jYWwgcHJlZml4IHRoYXQgc2hvdWxkIGJlIGluamVjdGVkIGludG8gdHJhbnNsYXRpb24gdmFyIG5hbWVcbiAqIEByZXR1cm5zIENvbXBsZXRlIHRyYW5zbGF0aW9uIGNvbnN0IHByZWZpeFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0VHJhbnNsYXRpb25Db25zdFByZWZpeChleHRyYTogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGAke0NMT1NVUkVfVFJBTlNMQVRJT05fVkFSX1BSRUZJWH0ke2V4dHJhfWAudG9VcHBlckNhc2UoKTtcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZSBBU1QgdG8gZGVjbGFyZSBhIHZhcmlhYmxlLiBFLmcuIGB2YXIgSTE4Tl8xO2AuXG4gKiBAcGFyYW0gdmFyaWFibGUgdGhlIG5hbWUgb2YgdGhlIHZhcmlhYmxlIHRvIGRlY2xhcmUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWNsYXJlSTE4blZhcmlhYmxlKHZhcmlhYmxlOiBvLlJlYWRWYXJFeHByKTogby5TdGF0ZW1lbnQge1xuICByZXR1cm4gbmV3IG8uRGVjbGFyZVZhclN0bXQoXG4gICAgdmFyaWFibGUubmFtZSEsXG4gICAgdW5kZWZpbmVkLFxuICAgIG8uSU5GRVJSRURfVFlQRSxcbiAgICB1bmRlZmluZWQsXG4gICAgdmFyaWFibGUuc291cmNlU3BhbixcbiAgKTtcbn1cblxuLyoqXG4gKiBMaWZ0cyBpMThuIHByb3BlcnRpZXMgaW50byB0aGUgY29uc3RzIGFycmF5LlxuICogVE9ETzogQ2FuIHdlIHVzZSBgQ29uc3RDb2xsZWN0ZWRFeHByYD9cbiAqIFRPRE86IFRoZSB3YXkgdGhlIHZhcmlvdXMgYXR0cmlidXRlcyBhcmUgbGlua2VkIHRvZ2V0aGVyIGlzIHZlcnkgY29tcGxleC4gUGVyaGFwcyB3ZSBjb3VsZFxuICogc2ltcGxpZnkgdGhlIHByb2Nlc3MsIG1heWJlIGJ5IGNvbWJpbmluZyB0aGUgY29udGV4dCBhbmQgbWVzc2FnZSBvcHM/XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb2xsZWN0STE4bkNvbnN0cyhqb2I6IENvbXBvbmVudENvbXBpbGF0aW9uSm9iKTogdm9pZCB7XG4gIGNvbnN0IGZpbGVCYXNlZEkxOG5TdWZmaXggPVxuICAgIGpvYi5yZWxhdGl2ZUNvbnRleHRGaWxlUGF0aC5yZXBsYWNlKC9bXkEtWmEtejAtOV0vZywgJ18nKS50b1VwcGVyQ2FzZSgpICsgJ18nO1xuICAvLyBTdGVwIE9uZTogQnVpbGQgdXAgdmFyaW91cyBsb29rdXAgbWFwcyB3ZSBuZWVkIHRvIGNvbGxlY3QgYWxsIHRoZSBjb25zdHMuXG5cbiAgLy8gQ29udGV4dCBYcmVmIC0+IEV4dHJhY3RlZCBBdHRyaWJ1dGUgT3BzXG4gIGNvbnN0IGV4dHJhY3RlZEF0dHJpYnV0ZXNCeUkxOG5Db250ZXh0ID0gbmV3IE1hcDxpci5YcmVmSWQsIGlyLkV4dHJhY3RlZEF0dHJpYnV0ZU9wW10+KCk7XG4gIC8vIEVsZW1lbnQvRWxlbWVudFN0YXJ0IFhyZWYgLT4gSTE4biBBdHRyaWJ1dGVzIGNvbmZpZyBvcFxuICBjb25zdCBpMThuQXR0cmlidXRlc0J5RWxlbWVudCA9IG5ldyBNYXA8aXIuWHJlZklkLCBpci5JMThuQXR0cmlidXRlc09wPigpO1xuICAvLyBFbGVtZW50L0VsZW1lbnRTdGFydCBYcmVmIC0+IEFsbCBJMThuIEV4cHJlc3Npb24gb3BzIGZvciBhdHRycyBvbiB0aGF0IHRhcmdldFxuICBjb25zdCBpMThuRXhwcmVzc2lvbnNCeUVsZW1lbnQgPSBuZXcgTWFwPGlyLlhyZWZJZCwgaXIuSTE4bkV4cHJlc3Npb25PcFtdPigpO1xuICAvLyBJMThuIE1lc3NhZ2UgWHJlZiAtPiBJMThuIE1lc3NhZ2UgT3AgKFRPRE86IHVzZSBhIGNlbnRyYWwgb3AgbWFwKVxuICBjb25zdCBtZXNzYWdlcyA9IG5ldyBNYXA8aXIuWHJlZklkLCBpci5JMThuTWVzc2FnZU9wPigpO1xuXG4gIGZvciAoY29uc3QgdW5pdCBvZiBqb2IudW5pdHMpIHtcbiAgICBmb3IgKGNvbnN0IG9wIG9mIHVuaXQub3BzKCkpIHtcbiAgICAgIGlmIChvcC5raW5kID09PSBpci5PcEtpbmQuRXh0cmFjdGVkQXR0cmlidXRlICYmIG9wLmkxOG5Db250ZXh0ICE9PSBudWxsKSB7XG4gICAgICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSBleHRyYWN0ZWRBdHRyaWJ1dGVzQnlJMThuQ29udGV4dC5nZXQob3AuaTE4bkNvbnRleHQpID8/IFtdO1xuICAgICAgICBhdHRyaWJ1dGVzLnB1c2gob3ApO1xuICAgICAgICBleHRyYWN0ZWRBdHRyaWJ1dGVzQnlJMThuQ29udGV4dC5zZXQob3AuaTE4bkNvbnRleHQsIGF0dHJpYnV0ZXMpO1xuICAgICAgfSBlbHNlIGlmIChvcC5raW5kID09PSBpci5PcEtpbmQuSTE4bkF0dHJpYnV0ZXMpIHtcbiAgICAgICAgaTE4bkF0dHJpYnV0ZXNCeUVsZW1lbnQuc2V0KG9wLnRhcmdldCwgb3ApO1xuICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgb3Aua2luZCA9PT0gaXIuT3BLaW5kLkkxOG5FeHByZXNzaW9uICYmXG4gICAgICAgIG9wLnVzYWdlID09PSBpci5JMThuRXhwcmVzc2lvbkZvci5JMThuQXR0cmlidXRlXG4gICAgICApIHtcbiAgICAgICAgY29uc3QgZXhwcmVzc2lvbnMgPSBpMThuRXhwcmVzc2lvbnNCeUVsZW1lbnQuZ2V0KG9wLnRhcmdldCkgPz8gW107XG4gICAgICAgIGV4cHJlc3Npb25zLnB1c2gob3ApO1xuICAgICAgICBpMThuRXhwcmVzc2lvbnNCeUVsZW1lbnQuc2V0KG9wLnRhcmdldCwgZXhwcmVzc2lvbnMpO1xuICAgICAgfSBlbHNlIGlmIChvcC5raW5kID09PSBpci5PcEtpbmQuSTE4bk1lc3NhZ2UpIHtcbiAgICAgICAgbWVzc2FnZXMuc2V0KG9wLnhyZWYsIG9wKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBTdGVwIFR3bzogU2VyaWFsaXplIHRoZSBleHRyYWN0ZWQgaTE4biBtZXNzYWdlcyBmb3Igcm9vdCBpMThuIGJsb2NrcyBhbmQgaTE4biBhdHRyaWJ1dGVzIGludG9cbiAgLy8gdGhlIGNvbnN0IGFycmF5LlxuICAvL1xuICAvLyBBbHNvLCBlYWNoIGkxOG4gbWVzc2FnZSB3aWxsIGhhdmUgYSB2YXJpYWJsZSBleHByZXNzaW9uIHRoYXQgY2FuIHJlZmVyIHRvIGl0c1xuICAvLyB2YWx1ZS4gU3RvcmUgdGhlc2UgZXhwcmVzc2lvbnMgaW4gdGhlIGFwcHJvcHJpYXRlIHBsYWNlOlxuICAvLyAxLiBGb3Igbm9ybWFsIGkxOG4gY29udGVudCwgaXQgYWxzbyBnb2VzIGluIHRoZSBjb25zdCBhcnJheS4gV2Ugc2F2ZSB0aGUgY29uc3QgaW5kZXggdG8gdXNlXG4gIC8vIGxhdGVyLlxuICAvLyAyLiBGb3IgZXh0cmFjdGVkIGF0dHJpYnV0ZXMsIGl0IGJlY29tZXMgdGhlIHZhbHVlIG9mIHRoZSBleHRyYWN0ZWQgYXR0cmlidXRlIGluc3RydWN0aW9uLlxuICAvLyAzLiBGb3IgaTE4biBiaW5kaW5ncywgaXQgd2lsbCBnbyBpbiBhIHNlcGFyYXRlIGNvbnN0IGFycmF5IGluc3RydWN0aW9uIGJlbG93OyBmb3Igbm93LCB3ZSBqdXN0XG4gIC8vIHNhdmUgaXQuXG5cbiAgY29uc3QgaTE4blZhbHVlc0J5Q29udGV4dCA9IG5ldyBNYXA8aXIuWHJlZklkLCBvLkV4cHJlc3Npb24+KCk7XG4gIGNvbnN0IG1lc3NhZ2VDb25zdEluZGljZXMgPSBuZXcgTWFwPGlyLlhyZWZJZCwgaXIuQ29uc3RJbmRleD4oKTtcblxuICBmb3IgKGNvbnN0IHVuaXQgb2Ygam9iLnVuaXRzKSB7XG4gICAgZm9yIChjb25zdCBvcCBvZiB1bml0LmNyZWF0ZSkge1xuICAgICAgaWYgKG9wLmtpbmQgPT09IGlyLk9wS2luZC5JMThuTWVzc2FnZSkge1xuICAgICAgICBpZiAob3AubWVzc2FnZVBsYWNlaG9sZGVyID09PSBudWxsKSB7XG4gICAgICAgICAgY29uc3Qge21haW5WYXIsIHN0YXRlbWVudHN9ID0gY29sbGVjdE1lc3NhZ2Uoam9iLCBmaWxlQmFzZWRJMThuU3VmZml4LCBtZXNzYWdlcywgb3ApO1xuICAgICAgICAgIGlmIChvcC5pMThuQmxvY2sgIT09IG51bGwpIHtcbiAgICAgICAgICAgIC8vIFRoaXMgaXMgYSByZWd1bGFyIGkxOG4gbWVzc2FnZSB3aXRoIGEgY29ycmVzcG9uZGluZyBpMThuIGJsb2NrLiBDb2xsZWN0IGl0IGludG8gdGhlXG4gICAgICAgICAgICAvLyBjb25zdCBhcnJheS5cbiAgICAgICAgICAgIGNvbnN0IGkxOG5Db25zdCA9IGpvYi5hZGRDb25zdChtYWluVmFyLCBzdGF0ZW1lbnRzKTtcbiAgICAgICAgICAgIG1lc3NhZ2VDb25zdEluZGljZXMuc2V0KG9wLmkxOG5CbG9jaywgaTE4bkNvbnN0KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gVGhpcyBpcyBhbiBpMThuIGF0dHJpYnV0ZS4gRXh0cmFjdCB0aGUgaW5pdGlhbGl6ZXJzIGludG8gdGhlIGNvbnN0IHBvb2wuXG4gICAgICAgICAgICBqb2IuY29uc3RzSW5pdGlhbGl6ZXJzLnB1c2goLi4uc3RhdGVtZW50cyk7XG5cbiAgICAgICAgICAgIC8vIFNhdmUgdGhlIGkxOG4gdmFyaWFibGUgdmFsdWUgZm9yIGxhdGVyLlxuICAgICAgICAgICAgaTE4blZhbHVlc0J5Q29udGV4dC5zZXQob3AuaTE4bkNvbnRleHQsIG1haW5WYXIpO1xuXG4gICAgICAgICAgICAvLyBUaGlzIGkxOG4gbWVzc2FnZSBtYXkgY29ycmVzcG9uZCB0byBhbiBpbmRpdmlkdWFsIGV4dHJhY3RlZCBhdHRyaWJ1dGUuIElmIHNvLCBUaGVcbiAgICAgICAgICAgIC8vIHZhbHVlIG9mIHRoYXQgYXR0cmlidXRlIGlzIHVwZGF0ZWQgdG8gcmVhZCB0aGUgZXh0cmFjdGVkIGkxOG4gdmFyaWFibGUuXG4gICAgICAgICAgICBjb25zdCBhdHRyaWJ1dGVzRm9yTWVzc2FnZSA9IGV4dHJhY3RlZEF0dHJpYnV0ZXNCeUkxOG5Db250ZXh0LmdldChvcC5pMThuQ29udGV4dCk7XG4gICAgICAgICAgICBpZiAoYXR0cmlidXRlc0Zvck1lc3NhZ2UgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICBmb3IgKGNvbnN0IGF0dHIgb2YgYXR0cmlidXRlc0Zvck1lc3NhZ2UpIHtcbiAgICAgICAgICAgICAgICBhdHRyLmV4cHJlc3Npb24gPSBtYWluVmFyLmNsb25lKCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaXIuT3BMaXN0LnJlbW92ZTxpci5DcmVhdGVPcD4ob3ApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIFN0ZXAgVGhyZWU6IFNlcmlhbGl6ZSBJMThuQXR0cmlidXRlcyBjb25maWd1cmF0aW9ucyBpbnRvIHRoZSBjb25zdCBhcnJheS4gRWFjaCBJMThuQXR0cmlidXRlc1xuICAvLyBpbnN0cnVjdGlvbiBoYXMgYSBjb25maWcgYXJyYXksIHdoaWNoIGNvbnRhaW5zIGstdiBwYWlycyBkZXNjcmliaW5nIGVhY2ggYmluZGluZyBuYW1lLCBhbmQgdGhlXG4gIC8vIGkxOG4gdmFyaWFibGUgdGhhdCBwcm92aWRlcyB0aGUgdmFsdWUuXG5cbiAgZm9yIChjb25zdCB1bml0IG9mIGpvYi51bml0cykge1xuICAgIGZvciAoY29uc3QgZWxlbSBvZiB1bml0LmNyZWF0ZSkge1xuICAgICAgaWYgKGlyLmlzRWxlbWVudE9yQ29udGFpbmVyT3AoZWxlbSkpIHtcbiAgICAgICAgY29uc3QgaTE4bkF0dHJpYnV0ZXMgPSBpMThuQXR0cmlidXRlc0J5RWxlbWVudC5nZXQoZWxlbS54cmVmKTtcbiAgICAgICAgaWYgKGkxOG5BdHRyaWJ1dGVzID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAvLyBUaGlzIGVsZW1lbnQgaXMgbm90IGFzc29jaWF0ZWQgd2l0aCBhbiBpMThuIGF0dHJpYnV0ZXMgY29uZmlndXJhdGlvbiBpbnN0cnVjdGlvbi5cbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBpMThuRXhwcmVzc2lvbnMgPSBpMThuRXhwcmVzc2lvbnNCeUVsZW1lbnQuZ2V0KGVsZW0ueHJlZik7XG4gICAgICAgIGlmIChpMThuRXhwcmVzc2lvbnMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIC8vIFVudXNlZCBpMThuQXR0cmlidXRlcyBzaG91bGQgaGF2ZSBhbHJlYWR5IGJlZW4gcmVtb3ZlZC5cbiAgICAgICAgICAvLyBUT0RPOiBTaG91bGQgdGhlIHJlbW92YWwgb2YgdGhvc2UgZGVhZCBpbnN0cnVjdGlvbnMgYmUgbWVyZ2VkIHdpdGggdGhpcyBwaGFzZT9cbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAnQXNzZXJ0aW9uRXJyb3I6IENvdWxkIG5vdCBmaW5kIGFueSBpMThuIGV4cHJlc3Npb25zIGFzc29jaWF0ZWQgd2l0aCBhbiBJMThuQXR0cmlidXRlcyBpbnN0cnVjdGlvbicsXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEZpbmQgZXhwcmVzc2lvbnMgZm9yIGFsbCB0aGUgdW5pcXVlIHByb3BlcnR5IG5hbWVzLCByZW1vdmluZyBkdXBsaWNhdGVzLlxuICAgICAgICBjb25zdCBzZWVuUHJvcGVydHlOYW1lcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgICAgICBpMThuRXhwcmVzc2lvbnMgPSBpMThuRXhwcmVzc2lvbnMuZmlsdGVyKChpMThuRXhwcikgPT4ge1xuICAgICAgICAgIGNvbnN0IHNlZW4gPSBzZWVuUHJvcGVydHlOYW1lcy5oYXMoaTE4bkV4cHIubmFtZSk7XG4gICAgICAgICAgc2VlblByb3BlcnR5TmFtZXMuYWRkKGkxOG5FeHByLm5hbWUpO1xuICAgICAgICAgIHJldHVybiAhc2VlbjtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgaTE4bkF0dHJpYnV0ZUNvbmZpZyA9IGkxOG5FeHByZXNzaW9ucy5mbGF0TWFwKChpMThuRXhwcikgPT4ge1xuICAgICAgICAgIGNvbnN0IGkxOG5FeHByVmFsdWUgPSBpMThuVmFsdWVzQnlDb250ZXh0LmdldChpMThuRXhwci5jb250ZXh0KTtcbiAgICAgICAgICBpZiAoaTE4bkV4cHJWYWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBc3NlcnRpb25FcnJvcjogQ291bGQgbm90IGZpbmQgaTE4biBleHByZXNzaW9uJ3MgdmFsdWVcIik7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBbby5saXRlcmFsKGkxOG5FeHByLm5hbWUpLCBpMThuRXhwclZhbHVlXTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaTE4bkF0dHJpYnV0ZXMuaTE4bkF0dHJpYnV0ZXNDb25maWcgPSBqb2IuYWRkQ29uc3QoXG4gICAgICAgICAgbmV3IG8uTGl0ZXJhbEFycmF5RXhwcihpMThuQXR0cmlidXRlQ29uZmlnKSxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBTdGVwIEZvdXI6IFByb3BhZ2F0ZSB0aGUgZXh0cmFjdGVkIGNvbnN0IGluZGV4IGludG8gaTE4biBvcHMgdGhhdCBtZXNzYWdlcyB3ZXJlIGV4dHJhY3RlZCBmcm9tLlxuXG4gIGZvciAoY29uc3QgdW5pdCBvZiBqb2IudW5pdHMpIHtcbiAgICBmb3IgKGNvbnN0IG9wIG9mIHVuaXQuY3JlYXRlKSB7XG4gICAgICBpZiAob3Aua2luZCA9PT0gaXIuT3BLaW5kLkkxOG5TdGFydCkge1xuICAgICAgICBjb25zdCBtc2dJbmRleCA9IG1lc3NhZ2VDb25zdEluZGljZXMuZ2V0KG9wLnJvb3QpO1xuICAgICAgICBpZiAobXNnSW5kZXggPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICdBc3NlcnRpb25FcnJvcjogQ291bGQgbm90IGZpbmQgY29ycmVzcG9uZGluZyBpMThuIGJsb2NrIGluZGV4IGZvciBhbiBpMThuIG1lc3NhZ2Ugb3A7IHdhcyBhbiBpMThuIG1lc3NhZ2UgaW5jb3JyZWN0bHkgYXNzdW1lZCB0byBjb3JyZXNwb25kIHRvIGFuIGF0dHJpYnV0ZT8nLFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgb3AubWVzc2FnZUluZGV4ID0gbXNnSW5kZXg7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQ29sbGVjdHMgdGhlIGdpdmVuIG1lc3NhZ2UgaW50byBhIHNldCBvZiBzdGF0ZW1lbnRzIHRoYXQgY2FuIGJlIGFkZGVkIHRvIHRoZSBjb25zdCBhcnJheS5cbiAqIFRoaXMgd2lsbCByZWN1cnNpdmVseSBjb2xsZWN0IGFueSBzdWItbWVzc2FnZXMgcmVmZXJlbmNlZCBmcm9tIHRoZSBwYXJlbnQgbWVzc2FnZSBhcyB3ZWxsLlxuICovXG5mdW5jdGlvbiBjb2xsZWN0TWVzc2FnZShcbiAgam9iOiBDb21wb25lbnRDb21waWxhdGlvbkpvYixcbiAgZmlsZUJhc2VkSTE4blN1ZmZpeDogc3RyaW5nLFxuICBtZXNzYWdlczogTWFwPGlyLlhyZWZJZCwgaXIuSTE4bk1lc3NhZ2VPcD4sXG4gIG1lc3NhZ2VPcDogaXIuSTE4bk1lc3NhZ2VPcCxcbik6IHttYWluVmFyOiBvLlJlYWRWYXJFeHByOyBzdGF0ZW1lbnRzOiBvLlN0YXRlbWVudFtdfSB7XG4gIC8vIFJlY3Vyc2l2ZWx5IGNvbGxlY3QgYW55IHN1Yi1tZXNzYWdlcywgcmVjb3JkIGVhY2ggc3ViLW1lc3NhZ2UncyBtYWluIHZhcmlhYmxlIHVuZGVyIGl0c1xuICAvLyBwbGFjZWhvbGRlciBzbyB0aGF0IHdlIGNhbiBhZGQgdGhlbSB0byB0aGUgcGFyYW1zIGZvciB0aGUgcGFyZW50IG1lc3NhZ2UuIEl0IGlzIHBvc3NpYmxlXG4gIC8vIHRoYXQgbXVsdGlwbGUgc3ViLW1lc3NhZ2VzIHdpbGwgc2hhcmUgdGhlIHNhbWUgcGxhY2Vob2xkZXIsIHNvIHdlIG5lZWQgdG8gdHJhY2sgYW4gYXJyYXkgb2ZcbiAgLy8gdmFyaWFibGVzIGZvciBlYWNoIHBsYWNlaG9sZGVyLlxuICBjb25zdCBzdGF0ZW1lbnRzOiBvLlN0YXRlbWVudFtdID0gW107XG4gIGNvbnN0IHN1Yk1lc3NhZ2VQbGFjZWhvbGRlcnMgPSBuZXcgTWFwPHN0cmluZywgby5FeHByZXNzaW9uW10+KCk7XG4gIGZvciAoY29uc3Qgc3ViTWVzc2FnZUlkIG9mIG1lc3NhZ2VPcC5zdWJNZXNzYWdlcykge1xuICAgIGNvbnN0IHN1Yk1lc3NhZ2UgPSBtZXNzYWdlcy5nZXQoc3ViTWVzc2FnZUlkKSE7XG4gICAgY29uc3Qge21haW5WYXI6IHN1Yk1lc3NhZ2VWYXIsIHN0YXRlbWVudHM6IHN1Yk1lc3NhZ2VTdGF0ZW1lbnRzfSA9IGNvbGxlY3RNZXNzYWdlKFxuICAgICAgam9iLFxuICAgICAgZmlsZUJhc2VkSTE4blN1ZmZpeCxcbiAgICAgIG1lc3NhZ2VzLFxuICAgICAgc3ViTWVzc2FnZSxcbiAgICApO1xuICAgIHN0YXRlbWVudHMucHVzaCguLi5zdWJNZXNzYWdlU3RhdGVtZW50cyk7XG4gICAgY29uc3Qgc3ViTWVzc2FnZXMgPSBzdWJNZXNzYWdlUGxhY2Vob2xkZXJzLmdldChzdWJNZXNzYWdlLm1lc3NhZ2VQbGFjZWhvbGRlciEpID8/IFtdO1xuICAgIHN1Yk1lc3NhZ2VzLnB1c2goc3ViTWVzc2FnZVZhcik7XG4gICAgc3ViTWVzc2FnZVBsYWNlaG9sZGVycy5zZXQoc3ViTWVzc2FnZS5tZXNzYWdlUGxhY2Vob2xkZXIhLCBzdWJNZXNzYWdlcyk7XG4gIH1cbiAgYWRkU3ViTWVzc2FnZVBhcmFtcyhtZXNzYWdlT3AsIHN1Yk1lc3NhZ2VQbGFjZWhvbGRlcnMpO1xuXG4gIC8vIFNvcnQgdGhlIHBhcmFtcyBmb3IgY29uc2lzdGVuY3kgd2l0aCBUZW1hcGxhdGVEZWZpbml0aW9uQnVpbGRlciBvdXRwdXQuXG4gIG1lc3NhZ2VPcC5wYXJhbXMgPSBuZXcgTWFwKFsuLi5tZXNzYWdlT3AucGFyYW1zLmVudHJpZXMoKV0uc29ydCgpKTtcblxuICBjb25zdCBtYWluVmFyID0gby52YXJpYWJsZShqb2IucG9vbC51bmlxdWVOYW1lKFRSQU5TTEFUSU9OX1ZBUl9QUkVGSVgpKTtcbiAgLy8gQ2xvc3VyZSBDb21waWxlciByZXF1aXJlcyBjb25zdCBuYW1lcyB0byBzdGFydCB3aXRoIGBNU0dfYCBidXQgZGlzYWxsb3dzIGFueSBvdGhlclxuICAvLyBjb25zdCB0byBzdGFydCB3aXRoIGBNU0dfYC4gV2UgZGVmaW5lIGEgdmFyaWFibGUgc3RhcnRpbmcgd2l0aCBgTVNHX2AganVzdCBmb3IgdGhlXG4gIC8vIGBnb29nLmdldE1zZ2AgY2FsbFxuICBjb25zdCBjbG9zdXJlVmFyID0gaTE4bkdlbmVyYXRlQ2xvc3VyZVZhcihcbiAgICBqb2IucG9vbCxcbiAgICBtZXNzYWdlT3AubWVzc2FnZS5pZCxcbiAgICBmaWxlQmFzZWRJMThuU3VmZml4LFxuICAgIGpvYi5pMThuVXNlRXh0ZXJuYWxJZHMsXG4gICk7XG4gIGxldCB0cmFuc2Zvcm1GbiA9IHVuZGVmaW5lZDtcblxuICAvLyBJZiBuZXNjZXNzYXJ5LCBhZGQgYSBwb3N0LXByb2Nlc3Npbmcgc3RlcCBhbmQgcmVzb2x2ZSBhbnkgcGxhY2Vob2xkZXIgcGFyYW1zIHRoYXQgYXJlXG4gIC8vIHNldCBpbiBwb3N0LXByb2Nlc3NpbmcuXG4gIGlmIChtZXNzYWdlT3AubmVlZHNQb3N0cHJvY2Vzc2luZyB8fCBtZXNzYWdlT3AucG9zdHByb2Nlc3NpbmdQYXJhbXMuc2l6ZSA+IDApIHtcbiAgICAvLyBTb3J0IHRoZSBwb3N0LXByb2Nlc3NpbmcgcGFyYW1zIGZvciBjb25zaXN0ZW5jeSB3aXRoIFRlbWFwbGF0ZURlZmluaXRpb25CdWlsZGVyIG91dHB1dC5cbiAgICBjb25zdCBwb3N0cHJvY2Vzc2luZ1BhcmFtcyA9IE9iamVjdC5mcm9tRW50cmllcyhcbiAgICAgIFsuLi5tZXNzYWdlT3AucG9zdHByb2Nlc3NpbmdQYXJhbXMuZW50cmllcygpXS5zb3J0KCksXG4gICAgKTtcbiAgICBjb25zdCBmb3JtYXR0ZWRQb3N0cHJvY2Vzc2luZ1BhcmFtcyA9IGZvcm1hdEkxOG5QbGFjZWhvbGRlck5hbWVzSW5NYXAoXG4gICAgICBwb3N0cHJvY2Vzc2luZ1BhcmFtcyxcbiAgICAgIC8qIHVzZUNhbWVsQ2FzZSAqLyBmYWxzZSxcbiAgICApO1xuICAgIGNvbnN0IGV4dHJhVHJhbnNmb3JtRm5QYXJhbXM6IG8uRXhwcmVzc2lvbltdID0gW107XG4gICAgaWYgKG1lc3NhZ2VPcC5wb3N0cHJvY2Vzc2luZ1BhcmFtcy5zaXplID4gMCkge1xuICAgICAgZXh0cmFUcmFuc2Zvcm1GblBhcmFtcy5wdXNoKG1hcExpdGVyYWwoZm9ybWF0dGVkUG9zdHByb2Nlc3NpbmdQYXJhbXMsIC8qIHF1b3RlZCAqLyB0cnVlKSk7XG4gICAgfVxuICAgIHRyYW5zZm9ybUZuID0gKGV4cHI6IG8uUmVhZFZhckV4cHIpID0+XG4gICAgICBvLmltcG9ydEV4cHIoSWRlbnRpZmllcnMuaTE4blBvc3Rwcm9jZXNzKS5jYWxsRm4oW2V4cHIsIC4uLmV4dHJhVHJhbnNmb3JtRm5QYXJhbXNdKTtcbiAgfVxuXG4gIC8vIEFkZCB0aGUgbWVzc2FnZSdzIHN0YXRlbWVudHNcbiAgc3RhdGVtZW50cy5wdXNoKFxuICAgIC4uLmdldFRyYW5zbGF0aW9uRGVjbFN0bXRzKFxuICAgICAgbWVzc2FnZU9wLm1lc3NhZ2UsXG4gICAgICBtYWluVmFyLFxuICAgICAgY2xvc3VyZVZhcixcbiAgICAgIG1lc3NhZ2VPcC5wYXJhbXMsXG4gICAgICB0cmFuc2Zvcm1GbixcbiAgICApLFxuICApO1xuXG4gIHJldHVybiB7bWFpblZhciwgc3RhdGVtZW50c307XG59XG5cbi8qKlxuICogQWRkcyB0aGUgZ2l2ZW4gc3ViTWVzc2FnZSBwbGFjZWhvbGRlcnMgdG8gdGhlIGdpdmVuIG1lc3NhZ2Ugb3AuXG4gKlxuICogSWYgYSBwbGFjZWhvbGRlciBvbmx5IGNvcnJlc3BvbmRzIHRvIGEgc2luZ2xlIHN1Yi1tZXNzYWdlIHZhcmlhYmxlLCB3ZSBqdXN0IHNldCB0aGF0IHZhcmlhYmxlXG4gKiBhcyB0aGUgcGFyYW0gdmFsdWUuIEhvd2V2ZXIsIGlmIHRoZSBwbGFjZWhvbGRlciBjb3JyZXNwb25kcyB0byBtdWx0aXBsZSBzdWItbWVzc2FnZVxuICogdmFyaWFibGVzLCB3ZSBuZWVkIHRvIGFkZCBhIHNwZWNpYWwgcGxhY2Vob2xkZXIgdmFsdWUgdGhhdCBpcyBoYW5kbGVkIGJ5IHRoZSBwb3N0LXByb2Nlc3NpbmdcbiAqIHN0ZXAuIFdlIHRoZW4gYWRkIHRoZSBhcnJheSBvZiB2YXJpYWJsZXMgYXMgYSBwb3N0LXByb2Nlc3NpbmcgcGFyYW0uXG4gKi9cbmZ1bmN0aW9uIGFkZFN1Yk1lc3NhZ2VQYXJhbXMoXG4gIG1lc3NhZ2VPcDogaXIuSTE4bk1lc3NhZ2VPcCxcbiAgc3ViTWVzc2FnZVBsYWNlaG9sZGVyczogTWFwPHN0cmluZywgby5FeHByZXNzaW9uW10+LFxuKSB7XG4gIGZvciAoY29uc3QgW3BsYWNlaG9sZGVyLCBzdWJNZXNzYWdlc10gb2Ygc3ViTWVzc2FnZVBsYWNlaG9sZGVycykge1xuICAgIGlmIChzdWJNZXNzYWdlcy5sZW5ndGggPT09IDEpIHtcbiAgICAgIG1lc3NhZ2VPcC5wYXJhbXMuc2V0KHBsYWNlaG9sZGVyLCBzdWJNZXNzYWdlc1swXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG1lc3NhZ2VPcC5wYXJhbXMuc2V0KFxuICAgICAgICBwbGFjZWhvbGRlcixcbiAgICAgICAgby5saXRlcmFsKGAke0VTQ0FQRX0ke0kxOE5fSUNVX01BUFBJTkdfUFJFRklYfSR7cGxhY2Vob2xkZXJ9JHtFU0NBUEV9YCksXG4gICAgICApO1xuICAgICAgbWVzc2FnZU9wLnBvc3Rwcm9jZXNzaW5nUGFyYW1zLnNldChwbGFjZWhvbGRlciwgby5saXRlcmFsQXJyKHN1Yk1lc3NhZ2VzKSk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogR2VuZXJhdGUgc3RhdGVtZW50cyB0aGF0IGRlZmluZSBhIGdpdmVuIHRyYW5zbGF0aW9uIG1lc3NhZ2UuXG4gKlxuICogYGBgXG4gKiB2YXIgSTE4Tl8xO1xuICogaWYgKHR5cGVvZiBuZ0kxOG5DbG9zdXJlTW9kZSAhPT0gdW5kZWZpbmVkICYmIG5nSTE4bkNsb3N1cmVNb2RlKSB7XG4gKiAgICAgdmFyIE1TR19FWFRFUk5BTF9YWFggPSBnb29nLmdldE1zZyhcbiAqICAgICAgICAgIFwiU29tZSBtZXNzYWdlIHdpdGggeyRpbnRlcnBvbGF0aW9ufSFcIixcbiAqICAgICAgICAgIHsgXCJpbnRlcnBvbGF0aW9uXCI6IFwiXFx1RkZGRDBcXHVGRkZEXCIgfVxuICogICAgICk7XG4gKiAgICAgSTE4Tl8xID0gTVNHX0VYVEVSTkFMX1hYWDtcbiAqIH1cbiAqIGVsc2Uge1xuICogICAgIEkxOE5fMSA9ICRsb2NhbGl6ZWBTb21lIG1lc3NhZ2Ugd2l0aCAkeydcXHVGRkZEMFxcdUZGRkQnfSFgO1xuICogfVxuICogYGBgXG4gKlxuICogQHBhcmFtIG1lc3NhZ2UgVGhlIG9yaWdpbmFsIGkxOG4gQVNUIG1lc3NhZ2Ugbm9kZVxuICogQHBhcmFtIHZhcmlhYmxlIFRoZSB2YXJpYWJsZSB0aGF0IHdpbGwgYmUgYXNzaWduZWQgdGhlIHRyYW5zbGF0aW9uLCBlLmcuIGBJMThOXzFgLlxuICogQHBhcmFtIGNsb3N1cmVWYXIgVGhlIHZhcmlhYmxlIGZvciBDbG9zdXJlIGBnb29nLmdldE1zZ2AgY2FsbHMsIGUuZy4gYE1TR19FWFRFUk5BTF9YWFhgLlxuICogQHBhcmFtIHBhcmFtcyBPYmplY3QgbWFwcGluZyBwbGFjZWhvbGRlciBuYW1lcyB0byB0aGVpciB2YWx1ZXMgKGUuZy5cbiAqIGB7IFwiaW50ZXJwb2xhdGlvblwiOiBcIlxcdUZGRkQwXFx1RkZGRFwiIH1gKS5cbiAqIEBwYXJhbSB0cmFuc2Zvcm1GbiBPcHRpb25hbCB0cmFuc2Zvcm1hdGlvbiBmdW5jdGlvbiB0aGF0IHdpbGwgYmUgYXBwbGllZCB0byB0aGUgdHJhbnNsYXRpb25cbiAqICAgICAoZS5nLlxuICogcG9zdC1wcm9jZXNzaW5nKS5cbiAqIEByZXR1cm5zIEFuIGFycmF5IG9mIHN0YXRlbWVudHMgdGhhdCBkZWZpbmVkIGEgZ2l2ZW4gdHJhbnNsYXRpb24uXG4gKi9cbmZ1bmN0aW9uIGdldFRyYW5zbGF0aW9uRGVjbFN0bXRzKFxuICBtZXNzYWdlOiBpMThuLk1lc3NhZ2UsXG4gIHZhcmlhYmxlOiBvLlJlYWRWYXJFeHByLFxuICBjbG9zdXJlVmFyOiBvLlJlYWRWYXJFeHByLFxuICBwYXJhbXM6IE1hcDxzdHJpbmcsIG8uRXhwcmVzc2lvbj4sXG4gIHRyYW5zZm9ybUZuPzogKHJhdzogby5SZWFkVmFyRXhwcikgPT4gby5FeHByZXNzaW9uLFxuKTogby5TdGF0ZW1lbnRbXSB7XG4gIGNvbnN0IHBhcmFtc09iamVjdCA9IE9iamVjdC5mcm9tRW50cmllcyhwYXJhbXMpO1xuICBjb25zdCBzdGF0ZW1lbnRzOiBvLlN0YXRlbWVudFtdID0gW1xuICAgIGRlY2xhcmVJMThuVmFyaWFibGUodmFyaWFibGUpLFxuICAgIG8uaWZTdG10KFxuICAgICAgY3JlYXRlQ2xvc3VyZU1vZGVHdWFyZCgpLFxuICAgICAgY3JlYXRlR29vZ2xlR2V0TXNnU3RhdGVtZW50cyh2YXJpYWJsZSwgbWVzc2FnZSwgY2xvc3VyZVZhciwgcGFyYW1zT2JqZWN0KSxcbiAgICAgIGNyZWF0ZUxvY2FsaXplU3RhdGVtZW50cyhcbiAgICAgICAgdmFyaWFibGUsXG4gICAgICAgIG1lc3NhZ2UsXG4gICAgICAgIGZvcm1hdEkxOG5QbGFjZWhvbGRlck5hbWVzSW5NYXAocGFyYW1zT2JqZWN0LCAvKiB1c2VDYW1lbENhc2UgKi8gZmFsc2UpLFxuICAgICAgKSxcbiAgICApLFxuICBdO1xuXG4gIGlmICh0cmFuc2Zvcm1Gbikge1xuICAgIHN0YXRlbWVudHMucHVzaChuZXcgby5FeHByZXNzaW9uU3RhdGVtZW50KHZhcmlhYmxlLnNldCh0cmFuc2Zvcm1Gbih2YXJpYWJsZSkpKSk7XG4gIH1cblxuICByZXR1cm4gc3RhdGVtZW50cztcbn1cblxuLyoqXG4gKiBDcmVhdGUgdGhlIGV4cHJlc3Npb24gdGhhdCB3aWxsIGJlIHVzZWQgdG8gZ3VhcmQgdGhlIGNsb3N1cmUgbW9kZSBibG9ja1xuICogSXQgaXMgZXF1aXZhbGVudCB0bzpcbiAqXG4gKiBgYGBcbiAqIHR5cGVvZiBuZ0kxOG5DbG9zdXJlTW9kZSAhPT0gdW5kZWZpbmVkICYmIG5nSTE4bkNsb3N1cmVNb2RlXG4gKiBgYGBcbiAqL1xuZnVuY3Rpb24gY3JlYXRlQ2xvc3VyZU1vZGVHdWFyZCgpOiBvLkJpbmFyeU9wZXJhdG9yRXhwciB7XG4gIHJldHVybiBvXG4gICAgLnR5cGVvZkV4cHIoby52YXJpYWJsZShOR19JMThOX0NMT1NVUkVfTU9ERSkpXG4gICAgLm5vdElkZW50aWNhbChvLmxpdGVyYWwoJ3VuZGVmaW5lZCcsIG8uU1RSSU5HX1RZUEUpKVxuICAgIC5hbmQoby52YXJpYWJsZShOR19JMThOX0NMT1NVUkVfTU9ERSkpO1xufVxuXG4vKipcbiAqIEdlbmVyYXRlcyB2YXJzIHdpdGggQ2xvc3VyZS1zcGVjaWZpYyBuYW1lcyBmb3IgaTE4biBibG9ja3MgKGkuZS4gYE1TR19YWFhgKS5cbiAqL1xuZnVuY3Rpb24gaTE4bkdlbmVyYXRlQ2xvc3VyZVZhcihcbiAgcG9vbDogQ29uc3RhbnRQb29sLFxuICBtZXNzYWdlSWQ6IHN0cmluZyxcbiAgZmlsZUJhc2VkSTE4blN1ZmZpeDogc3RyaW5nLFxuICB1c2VFeHRlcm5hbElkczogYm9vbGVhbixcbik6IG8uUmVhZFZhckV4cHIge1xuICBsZXQgbmFtZTogc3RyaW5nO1xuICBjb25zdCBzdWZmaXggPSBmaWxlQmFzZWRJMThuU3VmZml4O1xuICBpZiAodXNlRXh0ZXJuYWxJZHMpIHtcbiAgICBjb25zdCBwcmVmaXggPSBnZXRUcmFuc2xhdGlvbkNvbnN0UHJlZml4KGBFWFRFUk5BTF9gKTtcbiAgICBjb25zdCB1bmlxdWVTdWZmaXggPSBwb29sLnVuaXF1ZU5hbWUoc3VmZml4KTtcbiAgICBuYW1lID0gYCR7cHJlZml4fSR7c2FuaXRpemVJZGVudGlmaWVyKG1lc3NhZ2VJZCl9JCQke3VuaXF1ZVN1ZmZpeH1gO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IHByZWZpeCA9IGdldFRyYW5zbGF0aW9uQ29uc3RQcmVmaXgoc3VmZml4KTtcbiAgICBuYW1lID0gcG9vbC51bmlxdWVOYW1lKHByZWZpeCk7XG4gIH1cbiAgcmV0dXJuIG8udmFyaWFibGUobmFtZSk7XG59XG4iXX0=