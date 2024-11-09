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
import { declareI18nVariable, formatI18nPlaceholderNamesInMap, getTranslationConstPrefix } from '../../../../render3/view/i18n/util';
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
            else if (op.kind === ir.OpKind.I18nExpression && op.usage === ir.I18nExpressionFor.I18nAttribute) {
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
                i18nExpressions = i18nExpressions.filter(i18nExpr => {
                    const seen = (seenPropertyNames.has(i18nExpr.name));
                    seenPropertyNames.add(i18nExpr.name);
                    return !seen;
                });
                const i18nAttributeConfig = i18nExpressions.flatMap(i18nExpr => {
                    const i18nExprValue = i18nValuesByContext.get(i18nExpr.context);
                    if (i18nExprValue === undefined) {
                        throw new Error('AssertionError: Could not find i18n expression\'s value');
                    }
                    return [o.literal(i18nExpr.name), i18nExprValue];
                });
                i18nAttributes.i18nAttributesConfig =
                    job.addConst(new o.LiteralArrayExpr(i18nAttributeConfig));
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
        const formattedPostprocessingParams = formatI18nPlaceholderNamesInMap(postprocessingParams, /* useCamelCase */ false);
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
    return o.typeofExpr(o.variable(NG_I18N_CLOSURE_MODE))
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaTE4bl9jb25zdF9jb2xsZWN0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3RlbXBsYXRlL3BpcGVsaW5lL3NyYy9waGFzZXMvaTE4bl9jb25zdF9jb2xsZWN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUlILE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSw2QkFBNkIsQ0FBQztBQUN2RCxPQUFPLEtBQUssQ0FBQyxNQUFNLCtCQUErQixDQUFDO0FBQ25ELE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQzFELE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxvQ0FBb0MsQ0FBQztBQUMvRCxPQUFPLEVBQUMsNEJBQTRCLEVBQUMsTUFBTSw2Q0FBNkMsQ0FBQztBQUN6RixPQUFPLEVBQUMsd0JBQXdCLEVBQUMsTUFBTSw4Q0FBOEMsQ0FBQztBQUN0RixPQUFPLEVBQUMsbUJBQW1CLEVBQUUsK0JBQStCLEVBQUUseUJBQXlCLEVBQUMsTUFBTSxvQ0FBb0MsQ0FBQztBQUNuSSxPQUFPLEtBQUssRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUcvQixrR0FBa0c7QUFDbEcsTUFBTSxvQkFBb0IsR0FBRyxtQkFBbUIsQ0FBQztBQUVqRDs7OztHQUlHO0FBQ0gsTUFBTSxzQkFBc0IsR0FBRyxPQUFPLENBQUM7QUFFdkMsb0RBQW9EO0FBQ3BELE1BQU0sQ0FBQyxNQUFNLHVCQUF1QixHQUFHLFdBQVcsQ0FBQztBQUVuRDs7R0FFRztBQUNILE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQztBQUV4Qjs7Ozs7R0FLRztBQUNILE1BQU0sVUFBVSxpQkFBaUIsQ0FBQyxHQUE0QjtJQUM1RCxNQUFNLG1CQUFtQixHQUNyQixHQUFHLENBQUMsdUJBQXVCLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBRSxHQUFHLENBQUMs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cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHt0eXBlIENvbnN0YW50UG9vbH0gZnJvbSAnLi4vLi4vLi4vLi4vY29uc3RhbnRfcG9vbCc7XG5pbXBvcnQgKiBhcyBpMThuIGZyb20gJy4uLy4uLy4uLy4uL2kxOG4vaTE4bl9hc3QnO1xuaW1wb3J0IHttYXBMaXRlcmFsfSBmcm9tICcuLi8uLi8uLi8uLi9vdXRwdXQvbWFwX3V0aWwnO1xuaW1wb3J0ICogYXMgbyBmcm9tICcuLi8uLi8uLi8uLi9vdXRwdXQvb3V0cHV0X2FzdCc7XG5pbXBvcnQge3Nhbml0aXplSWRlbnRpZmllcn0gZnJvbSAnLi4vLi4vLi4vLi4vcGFyc2VfdXRpbCc7XG5pbXBvcnQge0lkZW50aWZpZXJzfSBmcm9tICcuLi8uLi8uLi8uLi9yZW5kZXIzL3IzX2lkZW50aWZpZXJzJztcbmltcG9ydCB7Y3JlYXRlR29vZ2xlR2V0TXNnU3RhdGVtZW50c30gZnJvbSAnLi4vLi4vLi4vLi4vcmVuZGVyMy92aWV3L2kxOG4vZ2V0X21zZ191dGlscyc7XG5pbXBvcnQge2NyZWF0ZUxvY2FsaXplU3RhdGVtZW50c30gZnJvbSAnLi4vLi4vLi4vLi4vcmVuZGVyMy92aWV3L2kxOG4vbG9jYWxpemVfdXRpbHMnO1xuaW1wb3J0IHtkZWNsYXJlSTE4blZhcmlhYmxlLCBmb3JtYXRJMThuUGxhY2Vob2xkZXJOYW1lc0luTWFwLCBnZXRUcmFuc2xhdGlvbkNvbnN0UHJlZml4fSBmcm9tICcuLi8uLi8uLi8uLi9yZW5kZXIzL3ZpZXcvaTE4bi91dGlsJztcbmltcG9ydCAqIGFzIGlyIGZyb20gJy4uLy4uL2lyJztcbmltcG9ydCB7Q29tcG9uZW50Q29tcGlsYXRpb25Kb2J9IGZyb20gJy4uL2NvbXBpbGF0aW9uJztcblxuLyoqIE5hbWUgb2YgdGhlIGdsb2JhbCB2YXJpYWJsZSB0aGF0IGlzIHVzZWQgdG8gZGV0ZXJtaW5lIGlmIHdlIHVzZSBDbG9zdXJlIHRyYW5zbGF0aW9ucyBvciBub3QgKi9cbmNvbnN0IE5HX0kxOE5fQ0xPU1VSRV9NT0RFID0gJ25nSTE4bkNsb3N1cmVNb2RlJztcblxuLyoqXG4gKiBQcmVmaXggZm9yIG5vbi1gZ29vZy5nZXRNc2dgIGkxOG4tcmVsYXRlZCB2YXJzLlxuICogTm90ZTogdGhlIHByZWZpeCB1c2VzIGxvd2VyY2FzZSBjaGFyYWN0ZXJzIGludGVudGlvbmFsbHkgZHVlIHRvIGEgQ2xvc3VyZSBiZWhhdmlvciB0aGF0XG4gKiBjb25zaWRlcnMgdmFyaWFibGVzIGxpa2UgYEkxOE5fMGAgYXMgY29uc3RhbnRzIGFuZCB0aHJvd3MgYW4gZXJyb3Igd2hlbiB0aGVpciB2YWx1ZSBjaGFuZ2VzLlxuICovXG5jb25zdCBUUkFOU0xBVElPTl9WQVJfUFJFRklYID0gJ2kxOG5fJztcblxuLyoqIFByZWZpeCBvZiBJQ1UgZXhwcmVzc2lvbnMgZm9yIHBvc3QgcHJvY2Vzc2luZyAqL1xuZXhwb3J0IGNvbnN0IEkxOE5fSUNVX01BUFBJTkdfUFJFRklYID0gJ0kxOE5fRVhQXyc7XG5cbi8qKlxuICogVGhlIGVzY2FwZSBzZXF1ZW5jZSB1c2VkIGZvciBtZXNzYWdlIHBhcmFtIHZhbHVlcy5cbiAqL1xuY29uc3QgRVNDQVBFID0gJ1xcdUZGRkQnO1xuXG4vKipcbiAqIExpZnRzIGkxOG4gcHJvcGVydGllcyBpbnRvIHRoZSBjb25zdHMgYXJyYXkuXG4gKiBUT0RPOiBDYW4gd2UgdXNlIGBDb25zdENvbGxlY3RlZEV4cHJgP1xuICogVE9ETzogVGhlIHdheSB0aGUgdmFyaW91cyBhdHRyaWJ1dGVzIGFyZSBsaW5rZWQgdG9nZXRoZXIgaXMgdmVyeSBjb21wbGV4LiBQZXJoYXBzIHdlIGNvdWxkXG4gKiBzaW1wbGlmeSB0aGUgcHJvY2VzcywgbWF5YmUgYnkgY29tYmluaW5nIHRoZSBjb250ZXh0IGFuZCBtZXNzYWdlIG9wcz9cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbGxlY3RJMThuQ29uc3RzKGpvYjogQ29tcG9uZW50Q29tcGlsYXRpb25Kb2IpOiB2b2lkIHtcbiAgY29uc3QgZmlsZUJhc2VkSTE4blN1ZmZpeCA9XG4gICAgICBqb2IucmVsYXRpdmVDb250ZXh0RmlsZVBhdGgucmVwbGFjZSgvW15BLVphLXowLTldL2csICdfJykudG9VcHBlckNhc2UoKSArICdfJztcbiAgLy8gU3RlcCBPbmU6IEJ1aWxkIHVwIHZhcmlvdXMgbG9va3VwIG1hcHMgd2UgbmVlZCB0byBjb2xsZWN0IGFsbCB0aGUgY29uc3RzLlxuXG4gIC8vIENvbnRleHQgWHJlZiAtPiBFeHRyYWN0ZWQgQXR0cmlidXRlIE9wc1xuICBjb25zdCBleHRyYWN0ZWRBdHRyaWJ1dGVzQnlJMThuQ29udGV4dCA9IG5ldyBNYXA8aXIuWHJlZklkLCBpci5FeHRyYWN0ZWRBdHRyaWJ1dGVPcFtdPigpO1xuICAvLyBFbGVtZW50L0VsZW1lbnRTdGFydCBYcmVmIC0+IEkxOG4gQXR0cmlidXRlcyBjb25maWcgb3BcbiAgY29uc3QgaTE4bkF0dHJpYnV0ZXNCeUVsZW1lbnQgPSBuZXcgTWFwPGlyLlhyZWZJZCwgaXIuSTE4bkF0dHJpYnV0ZXNPcD4oKTtcbiAgLy8gRWxlbWVudC9FbGVtZW50U3RhcnQgWHJlZiAtPiBBbGwgSTE4biBFeHByZXNzaW9uIG9wcyBmb3IgYXR0cnMgb24gdGhhdCB0YXJnZXRcbiAgY29uc3QgaTE4bkV4cHJlc3Npb25zQnlFbGVtZW50ID0gbmV3IE1hcDxpci5YcmVmSWQsIGlyLkkxOG5FeHByZXNzaW9uT3BbXT4oKTtcbiAgLy8gSTE4biBNZXNzYWdlIFhyZWYgLT4gSTE4biBNZXNzYWdlIE9wIChUT0RPOiB1c2UgYSBjZW50cmFsIG9wIG1hcClcbiAgY29uc3QgbWVzc2FnZXMgPSBuZXcgTWFwPGlyLlhyZWZJZCwgaXIuSTE4bk1lc3NhZ2VPcD4oKTtcblxuICBmb3IgKGNvbnN0IHVuaXQgb2Ygam9iLnVuaXRzKSB7XG4gICAgZm9yIChjb25zdCBvcCBvZiB1bml0Lm9wcygpKSB7XG4gICAgICBpZiAob3Aua2luZCA9PT0gaXIuT3BLaW5kLkV4dHJhY3RlZEF0dHJpYnV0ZSAmJiBvcC5pMThuQ29udGV4dCAhPT0gbnVsbCkge1xuICAgICAgICBjb25zdCBhdHRyaWJ1dGVzID0gZXh0cmFjdGVkQXR0cmlidXRlc0J5STE4bkNvbnRleHQuZ2V0KG9wLmkxOG5Db250ZXh0KSA/PyBbXTtcbiAgICAgICAgYXR0cmlidXRlcy5wdXNoKG9wKTtcbiAgICAgICAgZXh0cmFjdGVkQXR0cmlidXRlc0J5STE4bkNvbnRleHQuc2V0KG9wLmkxOG5Db250ZXh0LCBhdHRyaWJ1dGVzKTtcbiAgICAgIH0gZWxzZSBpZiAob3Aua2luZCA9PT0gaXIuT3BLaW5kLkkxOG5BdHRyaWJ1dGVzKSB7XG4gICAgICAgIGkxOG5BdHRyaWJ1dGVzQnlFbGVtZW50LnNldChvcC50YXJnZXQsIG9wKTtcbiAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgb3Aua2luZCA9PT0gaXIuT3BLaW5kLkkxOG5FeHByZXNzaW9uICYmIG9wLnVzYWdlID09PSBpci5JMThuRXhwcmVzc2lvbkZvci5JMThuQXR0cmlidXRlKSB7XG4gICAgICAgIGNvbnN0IGV4cHJlc3Npb25zID0gaTE4bkV4cHJlc3Npb25zQnlFbGVtZW50LmdldChvcC50YXJnZXQpID8/IFtdO1xuICAgICAgICBleHByZXNzaW9ucy5wdXNoKG9wKTtcbiAgICAgICAgaTE4bkV4cHJlc3Npb25zQnlFbGVtZW50LnNldChvcC50YXJnZXQsIGV4cHJlc3Npb25zKTtcbiAgICAgIH0gZWxzZSBpZiAob3Aua2luZCA9PT0gaXIuT3BLaW5kLkkxOG5NZXNzYWdlKSB7XG4gICAgICAgIG1lc3NhZ2VzLnNldChvcC54cmVmLCBvcCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gU3RlcCBUd286IFNlcmlhbGl6ZSB0aGUgZXh0cmFjdGVkIGkxOG4gbWVzc2FnZXMgZm9yIHJvb3QgaTE4biBibG9ja3MgYW5kIGkxOG4gYXR0cmlidXRlcyBpbnRvXG4gIC8vIHRoZSBjb25zdCBhcnJheS5cbiAgLy9cbiAgLy8gQWxzbywgZWFjaCBpMThuIG1lc3NhZ2Ugd2lsbCBoYXZlIGEgdmFyaWFibGUgZXhwcmVzc2lvbiB0aGF0IGNhbiByZWZlciB0byBpdHNcbiAgLy8gdmFsdWUuIFN0b3JlIHRoZXNlIGV4cHJlc3Npb25zIGluIHRoZSBhcHByb3ByaWF0ZSBwbGFjZTpcbiAgLy8gMS4gRm9yIG5vcm1hbCBpMThuIGNvbnRlbnQsIGl0IGFsc28gZ29lcyBpbiB0aGUgY29uc3QgYXJyYXkuIFdlIHNhdmUgdGhlIGNvbnN0IGluZGV4IHRvIHVzZVxuICAvLyBsYXRlci5cbiAgLy8gMi4gRm9yIGV4dHJhY3RlZCBhdHRyaWJ1dGVzLCBpdCBiZWNvbWVzIHRoZSB2YWx1ZSBvZiB0aGUgZXh0cmFjdGVkIGF0dHJpYnV0ZSBpbnN0cnVjdGlvbi5cbiAgLy8gMy4gRm9yIGkxOG4gYmluZGluZ3MsIGl0IHdpbGwgZ28gaW4gYSBzZXBhcmF0ZSBjb25zdCBhcnJheSBpbnN0cnVjdGlvbiBiZWxvdzsgZm9yIG5vdywgd2UganVzdFxuICAvLyBzYXZlIGl0LlxuXG4gIGNvbnN0IGkxOG5WYWx1ZXNCeUNvbnRleHQgPSBuZXcgTWFwPGlyLlhyZWZJZCwgby5FeHByZXNzaW9uPigpO1xuICBjb25zdCBtZXNzYWdlQ29uc3RJbmRpY2VzID0gbmV3IE1hcDxpci5YcmVmSWQsIGlyLkNvbnN0SW5kZXg+KCk7XG5cbiAgZm9yIChjb25zdCB1bml0IG9mIGpvYi51bml0cykge1xuICAgIGZvciAoY29uc3Qgb3Agb2YgdW5pdC5jcmVhdGUpIHtcbiAgICAgIGlmIChvcC5raW5kID09PSBpci5PcEtpbmQuSTE4bk1lc3NhZ2UpIHtcbiAgICAgICAgaWYgKG9wLm1lc3NhZ2VQbGFjZWhvbGRlciA9PT0gbnVsbCkge1xuICAgICAgICAgIGNvbnN0IHttYWluVmFyLCBzdGF0ZW1lbnRzfSA9IGNvbGxlY3RNZXNzYWdlKGpvYiwgZmlsZUJhc2VkSTE4blN1ZmZpeCwgbWVzc2FnZXMsIG9wKTtcbiAgICAgICAgICBpZiAob3AuaTE4bkJsb2NrICE9PSBudWxsKSB7XG4gICAgICAgICAgICAvLyBUaGlzIGlzIGEgcmVndWxhciBpMThuIG1lc3NhZ2Ugd2l0aCBhIGNvcnJlc3BvbmRpbmcgaTE4biBibG9jay4gQ29sbGVjdCBpdCBpbnRvIHRoZVxuICAgICAgICAgICAgLy8gY29uc3QgYXJyYXkuXG4gICAgICAgICAgICBjb25zdCBpMThuQ29uc3QgPSBqb2IuYWRkQ29uc3QobWFpblZhciwgc3RhdGVtZW50cyk7XG4gICAgICAgICAgICBtZXNzYWdlQ29uc3RJbmRpY2VzLnNldChvcC5pMThuQmxvY2ssIGkxOG5Db25zdCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFRoaXMgaXMgYW4gaTE4biBhdHRyaWJ1dGUuIEV4dHJhY3QgdGhlIGluaXRpYWxpemVycyBpbnRvIHRoZSBjb25zdCBwb29sLlxuICAgICAgICAgICAgam9iLmNvbnN0c0luaXRpYWxpemVycy5wdXNoKC4uLnN0YXRlbWVudHMpO1xuXG4gICAgICAgICAgICAvLyBTYXZlIHRoZSBpMThuIHZhcmlhYmxlIHZhbHVlIGZvciBsYXRlci5cbiAgICAgICAgICAgIGkxOG5WYWx1ZXNCeUNvbnRleHQuc2V0KG9wLmkxOG5Db250ZXh0LCBtYWluVmFyKTtcblxuICAgICAgICAgICAgLy8gVGhpcyBpMThuIG1lc3NhZ2UgbWF5IGNvcnJlc3BvbmQgdG8gYW4gaW5kaXZpZHVhbCBleHRyYWN0ZWQgYXR0cmlidXRlLiBJZiBzbywgVGhlXG4gICAgICAgICAgICAvLyB2YWx1ZSBvZiB0aGF0IGF0dHJpYnV0ZSBpcyB1cGRhdGVkIHRvIHJlYWQgdGhlIGV4dHJhY3RlZCBpMThuIHZhcmlhYmxlLlxuICAgICAgICAgICAgY29uc3QgYXR0cmlidXRlc0Zvck1lc3NhZ2UgPSBleHRyYWN0ZWRBdHRyaWJ1dGVzQnlJMThuQ29udGV4dC5nZXQob3AuaTE4bkNvbnRleHQpO1xuICAgICAgICAgICAgaWYgKGF0dHJpYnV0ZXNGb3JNZXNzYWdlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgZm9yIChjb25zdCBhdHRyIG9mIGF0dHJpYnV0ZXNGb3JNZXNzYWdlKSB7XG4gICAgICAgICAgICAgICAgYXR0ci5leHByZXNzaW9uID0gbWFpblZhci5jbG9uZSgpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlyLk9wTGlzdC5yZW1vdmU8aXIuQ3JlYXRlT3A+KG9wKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBTdGVwIFRocmVlOiBTZXJpYWxpemUgSTE4bkF0dHJpYnV0ZXMgY29uZmlndXJhdGlvbnMgaW50byB0aGUgY29uc3QgYXJyYXkuIEVhY2ggSTE4bkF0dHJpYnV0ZXNcbiAgLy8gaW5zdHJ1Y3Rpb24gaGFzIGEgY29uZmlnIGFycmF5LCB3aGljaCBjb250YWlucyBrLXYgcGFpcnMgZGVzY3JpYmluZyBlYWNoIGJpbmRpbmcgbmFtZSwgYW5kIHRoZVxuICAvLyBpMThuIHZhcmlhYmxlIHRoYXQgcHJvdmlkZXMgdGhlIHZhbHVlLlxuXG4gIGZvciAoY29uc3QgdW5pdCBvZiBqb2IudW5pdHMpIHtcbiAgICBmb3IgKGNvbnN0IGVsZW0gb2YgdW5pdC5jcmVhdGUpIHtcbiAgICAgIGlmIChpci5pc0VsZW1lbnRPckNvbnRhaW5lck9wKGVsZW0pKSB7XG4gICAgICAgIGNvbnN0IGkxOG5BdHRyaWJ1dGVzID0gaTE4bkF0dHJpYnV0ZXNCeUVsZW1lbnQuZ2V0KGVsZW0ueHJlZik7XG4gICAgICAgIGlmIChpMThuQXR0cmlidXRlcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgLy8gVGhpcyBlbGVtZW50IGlzIG5vdCBhc3NvY2lhdGVkIHdpdGggYW4gaTE4biBhdHRyaWJ1dGVzIGNvbmZpZ3VyYXRpb24gaW5zdHJ1Y3Rpb24uXG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgaTE4bkV4cHJlc3Npb25zID0gaTE4bkV4cHJlc3Npb25zQnlFbGVtZW50LmdldChlbGVtLnhyZWYpO1xuICAgICAgICBpZiAoaTE4bkV4cHJlc3Npb25zID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAvLyBVbnVzZWQgaTE4bkF0dHJpYnV0ZXMgc2hvdWxkIGhhdmUgYWxyZWFkeSBiZWVuIHJlbW92ZWQuXG4gICAgICAgICAgLy8gVE9ETzogU2hvdWxkIHRoZSByZW1vdmFsIG9mIHRob3NlIGRlYWQgaW5zdHJ1Y3Rpb25zIGJlIG1lcmdlZCB3aXRoIHRoaXMgcGhhc2U/XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAnQXNzZXJ0aW9uRXJyb3I6IENvdWxkIG5vdCBmaW5kIGFueSBpMThuIGV4cHJlc3Npb25zIGFzc29jaWF0ZWQgd2l0aCBhbiBJMThuQXR0cmlidXRlcyBpbnN0cnVjdGlvbicpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRmluZCBleHByZXNzaW9ucyBmb3IgYWxsIHRoZSB1bmlxdWUgcHJvcGVydHkgbmFtZXMsIHJlbW92aW5nIGR1cGxpY2F0ZXMuXG4gICAgICAgIGNvbnN0IHNlZW5Qcm9wZXJ0eU5hbWVzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgICAgIGkxOG5FeHByZXNzaW9ucyA9IGkxOG5FeHByZXNzaW9ucy5maWx0ZXIoaTE4bkV4cHIgPT4ge1xuICAgICAgICAgIGNvbnN0IHNlZW4gPSAoc2VlblByb3BlcnR5TmFtZXMuaGFzKGkxOG5FeHByLm5hbWUpKTtcbiAgICAgICAgICBzZWVuUHJvcGVydHlOYW1lcy5hZGQoaTE4bkV4cHIubmFtZSk7XG4gICAgICAgICAgcmV0dXJuICFzZWVuO1xuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBpMThuQXR0cmlidXRlQ29uZmlnID0gaTE4bkV4cHJlc3Npb25zLmZsYXRNYXAoaTE4bkV4cHIgPT4ge1xuICAgICAgICAgIGNvbnN0IGkxOG5FeHByVmFsdWUgPSBpMThuVmFsdWVzQnlDb250ZXh0LmdldChpMThuRXhwci5jb250ZXh0KTtcbiAgICAgICAgICBpZiAoaTE4bkV4cHJWYWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Fzc2VydGlvbkVycm9yOiBDb3VsZCBub3QgZmluZCBpMThuIGV4cHJlc3Npb25cXCdzIHZhbHVlJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBbby5saXRlcmFsKGkxOG5FeHByLm5hbWUpLCBpMThuRXhwclZhbHVlXTtcbiAgICAgICAgfSk7XG5cblxuICAgICAgICBpMThuQXR0cmlidXRlcy5pMThuQXR0cmlidXRlc0NvbmZpZyA9XG4gICAgICAgICAgICBqb2IuYWRkQ29uc3QobmV3IG8uTGl0ZXJhbEFycmF5RXhwcihpMThuQXR0cmlidXRlQ29uZmlnKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gU3RlcCBGb3VyOiBQcm9wYWdhdGUgdGhlIGV4dHJhY3RlZCBjb25zdCBpbmRleCBpbnRvIGkxOG4gb3BzIHRoYXQgbWVzc2FnZXMgd2VyZSBleHRyYWN0ZWQgZnJvbS5cblxuICBmb3IgKGNvbnN0IHVuaXQgb2Ygam9iLnVuaXRzKSB7XG4gICAgZm9yIChjb25zdCBvcCBvZiB1bml0LmNyZWF0ZSkge1xuICAgICAgaWYgKG9wLmtpbmQgPT09IGlyLk9wS2luZC5JMThuU3RhcnQpIHtcbiAgICAgICAgY29uc3QgbXNnSW5kZXggPSBtZXNzYWdlQ29uc3RJbmRpY2VzLmdldChvcC5yb290KTtcbiAgICAgICAgaWYgKG1zZ0luZGV4ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICdBc3NlcnRpb25FcnJvcjogQ291bGQgbm90IGZpbmQgY29ycmVzcG9uZGluZyBpMThuIGJsb2NrIGluZGV4IGZvciBhbiBpMThuIG1lc3NhZ2Ugb3A7IHdhcyBhbiBpMThuIG1lc3NhZ2UgaW5jb3JyZWN0bHkgYXNzdW1lZCB0byBjb3JyZXNwb25kIHRvIGFuIGF0dHJpYnV0ZT8nKTtcbiAgICAgICAgfVxuICAgICAgICBvcC5tZXNzYWdlSW5kZXggPSBtc2dJbmRleDtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBDb2xsZWN0cyB0aGUgZ2l2ZW4gbWVzc2FnZSBpbnRvIGEgc2V0IG9mIHN0YXRlbWVudHMgdGhhdCBjYW4gYmUgYWRkZWQgdG8gdGhlIGNvbnN0IGFycmF5LlxuICogVGhpcyB3aWxsIHJlY3Vyc2l2ZWx5IGNvbGxlY3QgYW55IHN1Yi1tZXNzYWdlcyByZWZlcmVuY2VkIGZyb20gdGhlIHBhcmVudCBtZXNzYWdlIGFzIHdlbGwuXG4gKi9cbmZ1bmN0aW9uIGNvbGxlY3RNZXNzYWdlKFxuICAgIGpvYjogQ29tcG9uZW50Q29tcGlsYXRpb25Kb2IsIGZpbGVCYXNlZEkxOG5TdWZmaXg6IHN0cmluZyxcbiAgICBtZXNzYWdlczogTWFwPGlyLlhyZWZJZCwgaXIuSTE4bk1lc3NhZ2VPcD4sXG4gICAgbWVzc2FnZU9wOiBpci5JMThuTWVzc2FnZU9wKToge21haW5WYXI6IG8uUmVhZFZhckV4cHIsIHN0YXRlbWVudHM6IG8uU3RhdGVtZW50W119IHtcbiAgLy8gUmVjdXJzaXZlbHkgY29sbGVjdCBhbnkgc3ViLW1lc3NhZ2VzLCByZWNvcmQgZWFjaCBzdWItbWVzc2FnZSdzIG1haW4gdmFyaWFibGUgdW5kZXIgaXRzXG4gIC8vIHBsYWNlaG9sZGVyIHNvIHRoYXQgd2UgY2FuIGFkZCB0aGVtIHRvIHRoZSBwYXJhbXMgZm9yIHRoZSBwYXJlbnQgbWVzc2FnZS4gSXQgaXMgcG9zc2libGVcbiAgLy8gdGhhdCBtdWx0aXBsZSBzdWItbWVzc2FnZXMgd2lsbCBzaGFyZSB0aGUgc2FtZSBwbGFjZWhvbGRlciwgc28gd2UgbmVlZCB0byB0cmFjayBhbiBhcnJheSBvZlxuICAvLyB2YXJpYWJsZXMgZm9yIGVhY2ggcGxhY2Vob2xkZXIuXG4gIGNvbnN0IHN0YXRlbWVudHM6IG8uU3RhdGVtZW50W10gPSBbXTtcbiAgY29uc3Qgc3ViTWVzc2FnZVBsYWNlaG9sZGVycyA9IG5ldyBNYXA8c3RyaW5nLCBvLkV4cHJlc3Npb25bXT4oKTtcbiAgZm9yIChjb25zdCBzdWJNZXNzYWdlSWQgb2YgbWVzc2FnZU9wLnN1Yk1lc3NhZ2VzKSB7XG4gICAgY29uc3Qgc3ViTWVzc2FnZSA9IG1lc3NhZ2VzLmdldChzdWJNZXNzYWdlSWQpITtcbiAgICBjb25zdCB7bWFpblZhcjogc3ViTWVzc2FnZVZhciwgc3RhdGVtZW50czogc3ViTWVzc2FnZVN0YXRlbWVudHN9ID1cbiAgICAgICAgY29sbGVjdE1lc3NhZ2Uoam9iLCBmaWxlQmFzZWRJMThuU3VmZml4LCBtZXNzYWdlcywgc3ViTWVzc2FnZSk7XG4gICAgc3RhdGVtZW50cy5wdXNoKC4uLnN1Yk1lc3NhZ2VTdGF0ZW1lbnRzKTtcbiAgICBjb25zdCBzdWJNZXNzYWdlcyA9IHN1Yk1lc3NhZ2VQbGFjZWhvbGRlcnMuZ2V0KHN1Yk1lc3NhZ2UubWVzc2FnZVBsYWNlaG9sZGVyISkgPz8gW107XG4gICAgc3ViTWVzc2FnZXMucHVzaChzdWJNZXNzYWdlVmFyKTtcbiAgICBzdWJNZXNzYWdlUGxhY2Vob2xkZXJzLnNldChzdWJNZXNzYWdlLm1lc3NhZ2VQbGFjZWhvbGRlciEsIHN1Yk1lc3NhZ2VzKTtcbiAgfVxuICBhZGRTdWJNZXNzYWdlUGFyYW1zKG1lc3NhZ2VPcCwgc3ViTWVzc2FnZVBsYWNlaG9sZGVycyk7XG5cbiAgLy8gU29ydCB0aGUgcGFyYW1zIGZvciBjb25zaXN0ZW5jeSB3aXRoIFRlbWFwbGF0ZURlZmluaXRpb25CdWlsZGVyIG91dHB1dC5cbiAgbWVzc2FnZU9wLnBhcmFtcyA9IG5ldyBNYXAoWy4uLm1lc3NhZ2VPcC5wYXJhbXMuZW50cmllcygpXS5zb3J0KCkpO1xuXG4gIGNvbnN0IG1haW5WYXIgPSBvLnZhcmlhYmxlKGpvYi5wb29sLnVuaXF1ZU5hbWUoVFJBTlNMQVRJT05fVkFSX1BSRUZJWCkpO1xuICAvLyBDbG9zdXJlIENvbXBpbGVyIHJlcXVpcmVzIGNvbnN0IG5hbWVzIHRvIHN0YXJ0IHdpdGggYE1TR19gIGJ1dCBkaXNhbGxvd3MgYW55IG90aGVyXG4gIC8vIGNvbnN0IHRvIHN0YXJ0IHdpdGggYE1TR19gLiBXZSBkZWZpbmUgYSB2YXJpYWJsZSBzdGFydGluZyB3aXRoIGBNU0dfYCBqdXN0IGZvciB0aGVcbiAgLy8gYGdvb2cuZ2V0TXNnYCBjYWxsXG4gIGNvbnN0IGNsb3N1cmVWYXIgPSBpMThuR2VuZXJhdGVDbG9zdXJlVmFyKFxuICAgICAgam9iLnBvb2wsIG1lc3NhZ2VPcC5tZXNzYWdlLmlkLCBmaWxlQmFzZWRJMThuU3VmZml4LCBqb2IuaTE4blVzZUV4dGVybmFsSWRzKTtcbiAgbGV0IHRyYW5zZm9ybUZuID0gdW5kZWZpbmVkO1xuXG4gIC8vIElmIG5lc2Nlc3NhcnksIGFkZCBhIHBvc3QtcHJvY2Vzc2luZyBzdGVwIGFuZCByZXNvbHZlIGFueSBwbGFjZWhvbGRlciBwYXJhbXMgdGhhdCBhcmVcbiAgLy8gc2V0IGluIHBvc3QtcHJvY2Vzc2luZy5cbiAgaWYgKG1lc3NhZ2VPcC5uZWVkc1Bvc3Rwcm9jZXNzaW5nIHx8IG1lc3NhZ2VPcC5wb3N0cHJvY2Vzc2luZ1BhcmFtcy5zaXplID4gMCkge1xuICAgIC8vIFNvcnQgdGhlIHBvc3QtcHJvY2Vzc2luZyBwYXJhbXMgZm9yIGNvbnNpc3RlbmN5IHdpdGggVGVtYXBsYXRlRGVmaW5pdGlvbkJ1aWxkZXIgb3V0cHV0LlxuICAgIGNvbnN0IHBvc3Rwcm9jZXNzaW5nUGFyYW1zID1cbiAgICAgICAgT2JqZWN0LmZyb21FbnRyaWVzKFsuLi5tZXNzYWdlT3AucG9zdHByb2Nlc3NpbmdQYXJhbXMuZW50cmllcygpXS5zb3J0KCkpO1xuICAgIGNvbnN0IGZvcm1hdHRlZFBvc3Rwcm9jZXNzaW5nUGFyYW1zID1cbiAgICAgICAgZm9ybWF0STE4blBsYWNlaG9sZGVyTmFtZXNJbk1hcChwb3N0cHJvY2Vzc2luZ1BhcmFtcywgLyogdXNlQ2FtZWxDYXNlICovIGZhbHNlKTtcbiAgICBjb25zdCBleHRyYVRyYW5zZm9ybUZuUGFyYW1zOiBvLkV4cHJlc3Npb25bXSA9IFtdO1xuICAgIGlmIChtZXNzYWdlT3AucG9zdHByb2Nlc3NpbmdQYXJhbXMuc2l6ZSA+IDApIHtcbiAgICAgIGV4dHJhVHJhbnNmb3JtRm5QYXJhbXMucHVzaChtYXBMaXRlcmFsKGZvcm1hdHRlZFBvc3Rwcm9jZXNzaW5nUGFyYW1zLCAvKiBxdW90ZWQgKi8gdHJ1ZSkpO1xuICAgIH1cbiAgICB0cmFuc2Zvcm1GbiA9IChleHByOiBvLlJlYWRWYXJFeHByKSA9PlxuICAgICAgICBvLmltcG9ydEV4cHIoSWRlbnRpZmllcnMuaTE4blBvc3Rwcm9jZXNzKS5jYWxsRm4oW2V4cHIsIC4uLmV4dHJhVHJhbnNmb3JtRm5QYXJhbXNdKTtcbiAgfVxuXG4gIC8vIEFkZCB0aGUgbWVzc2FnZSdzIHN0YXRlbWVudHNcbiAgc3RhdGVtZW50cy5wdXNoKC4uLmdldFRyYW5zbGF0aW9uRGVjbFN0bXRzKFxuICAgICAgbWVzc2FnZU9wLm1lc3NhZ2UsIG1haW5WYXIsIGNsb3N1cmVWYXIsIG1lc3NhZ2VPcC5wYXJhbXMsIHRyYW5zZm9ybUZuKSk7XG5cbiAgcmV0dXJuIHttYWluVmFyLCBzdGF0ZW1lbnRzfTtcbn1cblxuLyoqXG4gKiBBZGRzIHRoZSBnaXZlbiBzdWJNZXNzYWdlIHBsYWNlaG9sZGVycyB0byB0aGUgZ2l2ZW4gbWVzc2FnZSBvcC5cbiAqXG4gKiBJZiBhIHBsYWNlaG9sZGVyIG9ubHkgY29ycmVzcG9uZHMgdG8gYSBzaW5nbGUgc3ViLW1lc3NhZ2UgdmFyaWFibGUsIHdlIGp1c3Qgc2V0IHRoYXQgdmFyaWFibGVcbiAqIGFzIHRoZSBwYXJhbSB2YWx1ZS4gSG93ZXZlciwgaWYgdGhlIHBsYWNlaG9sZGVyIGNvcnJlc3BvbmRzIHRvIG11bHRpcGxlIHN1Yi1tZXNzYWdlXG4gKiB2YXJpYWJsZXMsIHdlIG5lZWQgdG8gYWRkIGEgc3BlY2lhbCBwbGFjZWhvbGRlciB2YWx1ZSB0aGF0IGlzIGhhbmRsZWQgYnkgdGhlIHBvc3QtcHJvY2Vzc2luZ1xuICogc3RlcC4gV2UgdGhlbiBhZGQgdGhlIGFycmF5IG9mIHZhcmlhYmxlcyBhcyBhIHBvc3QtcHJvY2Vzc2luZyBwYXJhbS5cbiAqL1xuZnVuY3Rpb24gYWRkU3ViTWVzc2FnZVBhcmFtcyhcbiAgICBtZXNzYWdlT3A6IGlyLkkxOG5NZXNzYWdlT3AsIHN1Yk1lc3NhZ2VQbGFjZWhvbGRlcnM6IE1hcDxzdHJpbmcsIG8uRXhwcmVzc2lvbltdPikge1xuICBmb3IgKGNvbnN0IFtwbGFjZWhvbGRlciwgc3ViTWVzc2FnZXNdIG9mIHN1Yk1lc3NhZ2VQbGFjZWhvbGRlcnMpIHtcbiAgICBpZiAoc3ViTWVzc2FnZXMubGVuZ3RoID09PSAxKSB7XG4gICAgICBtZXNzYWdlT3AucGFyYW1zLnNldChwbGFjZWhvbGRlciwgc3ViTWVzc2FnZXNbMF0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBtZXNzYWdlT3AucGFyYW1zLnNldChcbiAgICAgICAgICBwbGFjZWhvbGRlciwgby5saXRlcmFsKGAke0VTQ0FQRX0ke0kxOE5fSUNVX01BUFBJTkdfUFJFRklYfSR7cGxhY2Vob2xkZXJ9JHtFU0NBUEV9YCkpO1xuICAgICAgbWVzc2FnZU9wLnBvc3Rwcm9jZXNzaW5nUGFyYW1zLnNldChwbGFjZWhvbGRlciwgby5saXRlcmFsQXJyKHN1Yk1lc3NhZ2VzKSk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogR2VuZXJhdGUgc3RhdGVtZW50cyB0aGF0IGRlZmluZSBhIGdpdmVuIHRyYW5zbGF0aW9uIG1lc3NhZ2UuXG4gKlxuICogYGBgXG4gKiB2YXIgSTE4Tl8xO1xuICogaWYgKHR5cGVvZiBuZ0kxOG5DbG9zdXJlTW9kZSAhPT0gdW5kZWZpbmVkICYmIG5nSTE4bkNsb3N1cmVNb2RlKSB7XG4gKiAgICAgdmFyIE1TR19FWFRFUk5BTF9YWFggPSBnb29nLmdldE1zZyhcbiAqICAgICAgICAgIFwiU29tZSBtZXNzYWdlIHdpdGggeyRpbnRlcnBvbGF0aW9ufSFcIixcbiAqICAgICAgICAgIHsgXCJpbnRlcnBvbGF0aW9uXCI6IFwiXFx1RkZGRDBcXHVGRkZEXCIgfVxuICogICAgICk7XG4gKiAgICAgSTE4Tl8xID0gTVNHX0VYVEVSTkFMX1hYWDtcbiAqIH1cbiAqIGVsc2Uge1xuICogICAgIEkxOE5fMSA9ICRsb2NhbGl6ZWBTb21lIG1lc3NhZ2Ugd2l0aCAkeydcXHVGRkZEMFxcdUZGRkQnfSFgO1xuICogfVxuICogYGBgXG4gKlxuICogQHBhcmFtIG1lc3NhZ2UgVGhlIG9yaWdpbmFsIGkxOG4gQVNUIG1lc3NhZ2Ugbm9kZVxuICogQHBhcmFtIHZhcmlhYmxlIFRoZSB2YXJpYWJsZSB0aGF0IHdpbGwgYmUgYXNzaWduZWQgdGhlIHRyYW5zbGF0aW9uLCBlLmcuIGBJMThOXzFgLlxuICogQHBhcmFtIGNsb3N1cmVWYXIgVGhlIHZhcmlhYmxlIGZvciBDbG9zdXJlIGBnb29nLmdldE1zZ2AgY2FsbHMsIGUuZy4gYE1TR19FWFRFUk5BTF9YWFhgLlxuICogQHBhcmFtIHBhcmFtcyBPYmplY3QgbWFwcGluZyBwbGFjZWhvbGRlciBuYW1lcyB0byB0aGVpciB2YWx1ZXMgKGUuZy5cbiAqIGB7IFwiaW50ZXJwb2xhdGlvblwiOiBcIlxcdUZGRkQwXFx1RkZGRFwiIH1gKS5cbiAqIEBwYXJhbSB0cmFuc2Zvcm1GbiBPcHRpb25hbCB0cmFuc2Zvcm1hdGlvbiBmdW5jdGlvbiB0aGF0IHdpbGwgYmUgYXBwbGllZCB0byB0aGUgdHJhbnNsYXRpb25cbiAqICAgICAoZS5nLlxuICogcG9zdC1wcm9jZXNzaW5nKS5cbiAqIEByZXR1cm5zIEFuIGFycmF5IG9mIHN0YXRlbWVudHMgdGhhdCBkZWZpbmVkIGEgZ2l2ZW4gdHJhbnNsYXRpb24uXG4gKi9cbmZ1bmN0aW9uIGdldFRyYW5zbGF0aW9uRGVjbFN0bXRzKFxuICAgIG1lc3NhZ2U6IGkxOG4uTWVzc2FnZSwgdmFyaWFibGU6IG8uUmVhZFZhckV4cHIsIGNsb3N1cmVWYXI6IG8uUmVhZFZhckV4cHIsXG4gICAgcGFyYW1zOiBNYXA8c3RyaW5nLCBvLkV4cHJlc3Npb24+LFxuICAgIHRyYW5zZm9ybUZuPzogKHJhdzogby5SZWFkVmFyRXhwcikgPT4gby5FeHByZXNzaW9uKTogby5TdGF0ZW1lbnRbXSB7XG4gIGNvbnN0IHBhcmFtc09iamVjdCA9IE9iamVjdC5mcm9tRW50cmllcyhwYXJhbXMpO1xuICBjb25zdCBzdGF0ZW1lbnRzOiBvLlN0YXRlbWVudFtdID0gW1xuICAgIGRlY2xhcmVJMThuVmFyaWFibGUodmFyaWFibGUpLFxuICAgIG8uaWZTdG10KFxuICAgICAgICBjcmVhdGVDbG9zdXJlTW9kZUd1YXJkKCksXG4gICAgICAgIGNyZWF0ZUdvb2dsZUdldE1zZ1N0YXRlbWVudHModmFyaWFibGUsIG1lc3NhZ2UsIGNsb3N1cmVWYXIsIHBhcmFtc09iamVjdCksXG4gICAgICAgIGNyZWF0ZUxvY2FsaXplU3RhdGVtZW50cyhcbiAgICAgICAgICAgIHZhcmlhYmxlLCBtZXNzYWdlLFxuICAgICAgICAgICAgZm9ybWF0STE4blBsYWNlaG9sZGVyTmFtZXNJbk1hcChwYXJhbXNPYmplY3QsIC8qIHVzZUNhbWVsQ2FzZSAqLyBmYWxzZSkpKSxcbiAgXTtcblxuICBpZiAodHJhbnNmb3JtRm4pIHtcbiAgICBzdGF0ZW1lbnRzLnB1c2gobmV3IG8uRXhwcmVzc2lvblN0YXRlbWVudCh2YXJpYWJsZS5zZXQodHJhbnNmb3JtRm4odmFyaWFibGUpKSkpO1xuICB9XG5cbiAgcmV0dXJuIHN0YXRlbWVudHM7XG59XG5cbi8qKlxuICogQ3JlYXRlIHRoZSBleHByZXNzaW9uIHRoYXQgd2lsbCBiZSB1c2VkIHRvIGd1YXJkIHRoZSBjbG9zdXJlIG1vZGUgYmxvY2tcbiAqIEl0IGlzIGVxdWl2YWxlbnQgdG86XG4gKlxuICogYGBgXG4gKiB0eXBlb2YgbmdJMThuQ2xvc3VyZU1vZGUgIT09IHVuZGVmaW5lZCAmJiBuZ0kxOG5DbG9zdXJlTW9kZVxuICogYGBgXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUNsb3N1cmVNb2RlR3VhcmQoKTogby5CaW5hcnlPcGVyYXRvckV4cHIge1xuICByZXR1cm4gby50eXBlb2ZFeHByKG8udmFyaWFibGUoTkdfSTE4Tl9DTE9TVVJFX01PREUpKVxuICAgICAgLm5vdElkZW50aWNhbChvLmxpdGVyYWwoJ3VuZGVmaW5lZCcsIG8uU1RSSU5HX1RZUEUpKVxuICAgICAgLmFuZChvLnZhcmlhYmxlKE5HX0kxOE5fQ0xPU1VSRV9NT0RFKSk7XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIHZhcnMgd2l0aCBDbG9zdXJlLXNwZWNpZmljIG5hbWVzIGZvciBpMThuIGJsb2NrcyAoaS5lLiBgTVNHX1hYWGApLlxuICovXG5mdW5jdGlvbiBpMThuR2VuZXJhdGVDbG9zdXJlVmFyKFxuICAgIHBvb2w6IENvbnN0YW50UG9vbCwgbWVzc2FnZUlkOiBzdHJpbmcsIGZpbGVCYXNlZEkxOG5TdWZmaXg6IHN0cmluZyxcbiAgICB1c2VFeHRlcm5hbElkczogYm9vbGVhbik6IG8uUmVhZFZhckV4cHIge1xuICBsZXQgbmFtZTogc3RyaW5nO1xuICBjb25zdCBzdWZmaXggPSBmaWxlQmFzZWRJMThuU3VmZml4O1xuICBpZiAodXNlRXh0ZXJuYWxJZHMpIHtcbiAgICBjb25zdCBwcmVmaXggPSBnZXRUcmFuc2xhdGlvbkNvbnN0UHJlZml4KGBFWFRFUk5BTF9gKTtcbiAgICBjb25zdCB1bmlxdWVTdWZmaXggPSBwb29sLnVuaXF1ZU5hbWUoc3VmZml4KTtcbiAgICBuYW1lID0gYCR7cHJlZml4fSR7c2FuaXRpemVJZGVudGlmaWVyKG1lc3NhZ2VJZCl9JCQke3VuaXF1ZVN1ZmZpeH1gO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IHByZWZpeCA9IGdldFRyYW5zbGF0aW9uQ29uc3RQcmVmaXgoc3VmZml4KTtcbiAgICBuYW1lID0gcG9vbC51bmlxdWVOYW1lKHByZWZpeCk7XG4gIH1cbiAgcmV0dXJuIG8udmFyaWFibGUobmFtZSk7XG59XG4iXX0=