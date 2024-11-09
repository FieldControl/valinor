/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { BuiltinFunctionCall, convertActionBinding, convertAssignmentActionBinding, convertPropertyBinding, convertPureComponentScopeFunction, convertUpdateArguments } from '../../compiler_util/expression_converter';
import * as core from '../../core';
import { AstMemoryEfficientTransformer, Call, ImplicitReceiver, Interpolation, LiteralArray, LiteralPrimitive, PropertyRead } from '../../expression_parser/ast';
import { Lexer } from '../../expression_parser/lexer';
import { Parser } from '../../expression_parser/parser';
import * as i18n from '../../i18n/i18n_ast';
import * as html from '../../ml_parser/ast';
import { DEFAULT_INTERPOLATION_CONFIG } from '../../ml_parser/defaults';
import { HtmlParser } from '../../ml_parser/html_parser';
import { WhitespaceVisitor } from '../../ml_parser/html_whitespaces';
import { isNgContainer as checkIsNgContainer, splitNsName } from '../../ml_parser/tags';
import { mapLiteral } from '../../output/map_util';
import * as o from '../../output/output_ast';
import { sanitizeIdentifier } from '../../parse_util';
import { DomElementSchemaRegistry } from '../../schema/dom_element_schema_registry';
import { isIframeSecuritySensitiveAttr } from '../../schema/dom_security_schema';
import { isTrustedTypesSink } from '../../schema/trusted_types_sinks';
import { BindingParser } from '../../template_parser/binding_parser';
import { error, partitionArray } from '../../util';
import * as t from '../r3_ast';
import { Identifiers as R3 } from '../r3_identifiers';
import { htmlAstToRender3Ast } from '../r3_template_transform';
import { prepareSyntheticListenerFunctionName, prepareSyntheticListenerName, prepareSyntheticPropertyName } from '../util';
import { I18nContext } from './i18n/context';
import { createGoogleGetMsgStatements } from './i18n/get_msg_utils';
import { createLocalizeStatements } from './i18n/localize_utils';
import { I18nMetaVisitor } from './i18n/meta';
import { assembleBoundTextPlaceholders, assembleI18nBoundString, declareI18nVariable, formatI18nPlaceholderNamesInMap, getTranslationConstPrefix, hasI18nMeta, I18N_ICU_MAPPING_PREFIX, icuFromI18nMessage, isI18nRootNode, isSingleI18nIcu, placeholdersToParams, TRANSLATION_VAR_PREFIX, wrapI18nPlaceholder } from './i18n/util';
import { StylingBuilder } from './styling_builder';
import { asLiteral, CONTEXT_NAME, DIRECT_CONTEXT_REFERENCE, getInstructionStatements, getInterpolationArgsLength, IMPLICIT_REFERENCE, invalid, invokeInstruction, NON_BINDABLE_ATTR, REFERENCE_PREFIX, RENDER_FLAGS, RESTORED_VIEW_CONTEXT_NAME, trimTrailingNulls } from './util';
// Selector attribute name of `<ng-content>`
const NG_CONTENT_SELECT_ATTR = 'select';
// Attribute name of `ngProjectAs`.
const NG_PROJECT_AS_ATTR_NAME = 'ngProjectAs';
// Global symbols available only inside event bindings.
const EVENT_BINDING_SCOPE_GLOBALS = new Set(['$event']);
// Tag name of the `ng-template` element.
const NG_TEMPLATE_TAG_NAME = 'ng-template';
// List of supported global targets for event listeners
const GLOBAL_TARGET_RESOLVERS = new Map([['window', R3.resolveWindow], ['document', R3.resolveDocument], ['body', R3.resolveBody]]);
export const LEADING_TRIVIA_CHARS = [' ', '\n', '\r', '\t'];
//  if (rf & flags) { .. }
export function renderFlagCheckIfStmt(flags, statements) {
    return o.ifStmt(o.variable(RENDER_FLAGS).bitwiseAnd(o.literal(flags), null, false), statements);
}
export function prepareEventListenerParameters(eventAst, handlerName = null, scope = null) {
    const { type, name, target, phase, handler } = eventAst;
    if (target && !GLOBAL_TARGET_RESOLVERS.has(target)) {
        throw new Error(`Unexpected global target '${target}' defined for '${name}' event.
        Supported list of global targets: ${Array.from(GLOBAL_TARGET_RESOLVERS.keys())}.`);
    }
    const eventArgumentName = '$event';
    const implicitReceiverAccesses = new Set();
    const implicitReceiverExpr = (scope === null || scope.bindingLevel === 0) ?
        o.variable(CONTEXT_NAME) :
        scope.getOrCreateSharedContextVar(0);
    const bindingStatements = eventAst.type === 2 /* ParsedEventType.TwoWay */ ?
        convertAssignmentActionBinding(scope, implicitReceiverExpr, handler, 'b', eventAst.handlerSpan, implicitReceiverAccesses, EVENT_BINDING_SCOPE_GLOBALS) :
        convertActionBinding(scope, implicitReceiverExpr, handler, 'b', eventAst.handlerSpan, implicitReceiverAccesses, EVENT_BINDING_SCOPE_GLOBALS);
    const statements = [];
    const variableDeclarations = scope?.variableDeclarations();
    const restoreViewStatement = scope?.restoreViewStatement();
    if (variableDeclarations) {
        // `variableDeclarations` needs to run first, because
        // `restoreViewStatement` depends on the result.
        statements.push(...variableDeclarations);
    }
    statements.push(...bindingStatements);
    if (restoreViewStatement) {
        statements.unshift(restoreViewStatement);
        // If there's a `restoreView` call, we need to reset the view at the end of the listener
        // in order to avoid a leak. If there's a `return` statement already, we wrap it in the
        // call, e.g. `return resetView(ctx.foo())`. Otherwise we add the call as the last statement.
        const lastStatement = statements[statements.length - 1];
        if (lastStatement instanceof o.ReturnStatement) {
            statements[statements.length - 1] = new o.ReturnStatement(invokeInstruction(lastStatement.value.sourceSpan, R3.resetView, [lastStatement.value]));
        }
        else {
            statements.push(new o.ExpressionStatement(invokeInstruction(null, R3.resetView, [])));
        }
    }
    const eventName = type === 1 /* ParsedEventType.Animation */ ? prepareSyntheticListenerName(name, phase) : name;
    const fnName = handlerName && sanitizeIdentifier(handlerName);
    const fnArgs = [];
    if (implicitReceiverAccesses.has(eventArgumentName)) {
        fnArgs.push(new o.FnParam(eventArgumentName, o.DYNAMIC_TYPE));
    }
    const handlerFn = o.fn(fnArgs, statements, o.INFERRED_TYPE, null, fnName);
    const params = [o.literal(eventName), handlerFn];
    if (target) {
        params.push(o.literal(false), // `useCapture` flag, defaults to `false`
        o.importExpr(GLOBAL_TARGET_RESOLVERS.get(target)));
    }
    return params;
}
function createComponentDefConsts() {
    return {
        prepareStatements: [],
        constExpressions: [],
        i18nVarRefsCache: new Map(),
    };
}
class TemplateData {
    constructor(name, index, scope, visitor) {
        this.name = name;
        this.index = index;
        this.scope = scope;
        this.visitor = visitor;
    }
    getConstCount() {
        return this.visitor.getConstCount();
    }
    getVarCount() {
        return this.visitor.getVarCount();
    }
}
export class TemplateDefinitionBuilder {
    constructor(constantPool, parentBindingScope, level = 0, contextName, i18nContext, templateIndex, templateName, _namespace, relativeContextFilePath, i18nUseExternalIds, deferBlocks, elementLocations, allDeferrableDepsFn, _constants = createComponentDefConsts()) {
        this.constantPool = constantPool;
        this.level = level;
        this.contextName = contextName;
        this.i18nContext = i18nContext;
        this.templateIndex = templateIndex;
        this.templateName = templateName;
        this._namespace = _namespace;
        this.i18nUseExternalIds = i18nUseExternalIds;
        this.deferBlocks = deferBlocks;
        this.elementLocations = elementLocations;
        this.allDeferrableDepsFn = allDeferrableDepsFn;
        this._constants = _constants;
        this._dataIndex = 0;
        this._bindingContext = 0;
        this._prefixCode = [];
        /**
         * List of callbacks to generate creation mode instructions. We store them here as we process
         * the template so bindings in listeners are resolved only once all nodes have been visited.
         * This ensures all local refs and context variables are available for matching.
         */
        this._creationCodeFns = [];
        /**
         * List of callbacks to generate update mode instructions. We store them here as we process
         * the template so bindings are resolved only once all nodes have been visited. This ensures
         * all local refs and context variables are available for matching.
         */
        this._updateCodeFns = [];
        /** Index of the currently-selected node. */
        this._currentIndex = 0;
        /** Temporary variable declarations generated from visiting pipes, literals, etc. */
        this._tempVariables = [];
        /**
         * Temporary variable used to store state between control flow instructions.
         * Should be accessed via the `allocateControlFlowTempVariable` method.
         */
        this._controlFlowTempVariable = null;
        /**
         * List of callbacks to build nested templates. Nested templates must not be visited until
         * after the parent template has finished visiting all of its nodes. This ensures that all
         * local ref bindings in nested templates are able to find local ref values if the refs
         * are defined after the template declaration.
         */
        this._nestedTemplateFns = [];
        // i18n context local to this template
        this.i18n = null;
        // Number of slots to reserve for pureFunctions
        this._pureFunctionSlots = 0;
        // Number of binding slots
        this._bindingSlots = 0;
        // Projection slots found in the template. Projection slots can distribute projected
        // nodes based on a selector, or can just use the wildcard selector to match
        // all nodes which aren't matching any selector.
        this._ngContentReservedSlots = [];
        // Number of non-default selectors found in all parent templates of this template. We need to
        // track it to properly adjust projection slot index in the `projection` instruction.
        this._ngContentSelectorsOffset = 0;
        // Expression that should be used as implicit receiver when converting template
        // expressions to output AST.
        this._implicitReceiverExpr = null;
        // These should be handled in the template or element directly.
        this.visitReference = invalid;
        this.visitVariable = invalid;
        this.visitTextAttribute = invalid;
        this.visitBoundAttribute = invalid;
        this.visitBoundEvent = invalid;
        this.visitDeferredTrigger = invalid;
        this.visitDeferredBlockError = invalid;
        this.visitDeferredBlockLoading = invalid;
        this.visitDeferredBlockPlaceholder = invalid;
        this.visitIfBlockBranch = invalid;
        this.visitSwitchBlockCase = invalid;
        this.visitForLoopBlockEmpty = invalid;
        this.visitUnknownBlock = invalid;
        this._bindingScope = parentBindingScope.nestedScope(level);
        // Turn the relative context file path into an identifier by replacing non-alphanumeric
        // characters with underscores.
        this.fileBasedI18nSuffix = relativeContextFilePath.replace(/[^A-Za-z0-9]/g, '_') + '_';
        this._valueConverter = new ValueConverter(constantPool, () => this.allocateDataSlot(), (numSlots) => this.allocatePureFunctionSlots(numSlots), (name, localName, slot, value) => {
            this._bindingScope.set(this.level, localName, value);
            this.creationInstruction(null, R3.pipe, [o.literal(slot), o.literal(name)]);
        });
    }
    buildTemplateFunction(nodes, variables, ngContentSelectorsOffset = 0, i18n, variableAliases) {
        this._ngContentSelectorsOffset = ngContentSelectorsOffset;
        if (this._namespace !== R3.namespaceHTML) {
            this.creationInstruction(null, this._namespace);
        }
        // Create variable bindings
        variables.forEach(v => {
            const alias = variableAliases?.[v.name];
            this.registerContextVariables(v.name, v.value);
            if (alias) {
                this.registerContextVariables(alias, v.value);
            }
        });
        // Initiate i18n context in case:
        // - this template has parent i18n context
        // - or the template has i18n meta associated with it,
        //   but it's not initiated by the Element (e.g. <ng-template i18n>)
        const initI18nContext = this.i18nContext ||
            (isI18nRootNode(i18n) && !isSingleI18nIcu(i18n) &&
                !(isSingleElementTemplate(nodes) && nodes[0].i18n === i18n));
        const selfClosingI18nInstruction = hasTextChildrenOnly(nodes);
        if (initI18nContext) {
            this.i18nStart(null, i18n, selfClosingI18nInstruction);
        }
        // This is the initial pass through the nodes of this template. In this pass, we
        // queue all creation mode and update mode instructions for generation in the second
        // pass. It's necessary to separate the passes to ensure local refs are defined before
        // resolving bindings. We also count bindings in this pass as we walk bound expressions.
        t.visitAll(this, nodes);
        // Add total binding count to pure function count so pure function instructions are
        // generated with the correct slot offset when update instructions are processed.
        this._pureFunctionSlots += this._bindingSlots;
        // Pipes are walked in the first pass (to enqueue `pipe()` creation instructions and
        // `pipeBind` update instructions), so we have to update the slot offsets manually
        // to account for bindings.
        this._valueConverter.updatePipeSlotOffsets(this._bindingSlots);
        // Nested templates must be processed before creation instructions so template()
        // instructions can be generated with the correct internal const count.
        this._nestedTemplateFns.forEach(buildTemplateFn => buildTemplateFn());
        // Output the `projectionDef` instruction when some `<ng-content>` tags are present.
        // The `projectionDef` instruction is only emitted for the component template and
        // is skipped for nested templates (<ng-template> tags).
        if (this.level === 0 && this._ngContentReservedSlots.length) {
            const parameters = [];
            // By default the `projectionDef` instructions creates one slot for the wildcard
            // selector if no parameters are passed. Therefore we only want to allocate a new
            // array for the projection slots if the default projection slot is not sufficient.
            if (this._ngContentReservedSlots.length > 1 || this._ngContentReservedSlots[0] !== '*') {
                const r3ReservedSlots = this._ngContentReservedSlots.map(s => s !== '*' ? core.parseSelectorToR3Selector(s) : s);
                parameters.push(this.constantPool.getConstLiteral(asLiteral(r3ReservedSlots), true));
            }
            // Since we accumulate ngContent selectors while processing template elements,
            // we *prepend* `projectionDef` to creation instructions block, to put it before
            // any `projection` instructions
            this.creationInstruction(null, R3.projectionDef, parameters, /* prepend */ true);
        }
        if (initI18nContext) {
            this.i18nEnd(null, selfClosingI18nInstruction);
        }
        // Generate all the creation mode instructions (e.g. resolve bindings in listeners)
        const creationStatements = getInstructionStatements(this._creationCodeFns);
        // Generate all the update mode instructions (e.g. resolve property or text bindings)
        const updateStatements = getInstructionStatements(this._updateCodeFns);
        //  Variable declaration must occur after binding resolution so we can generate context
        //  instructions that build on each other.
        // e.g. const b = nextContext().$implicit(); const b = nextContext();
        const creationVariables = this._bindingScope.viewSnapshotStatements();
        const updateVariables = this._bindingScope.variableDeclarations().concat(this._tempVariables);
        const creationBlock = creationStatements.length > 0 ?
            [renderFlagCheckIfStmt(1 /* core.RenderFlags.Create */, creationVariables.concat(creationStatements))] :
            [];
        const updateBlock = updateStatements.length > 0 ?
            [renderFlagCheckIfStmt(2 /* core.RenderFlags.Update */, updateVariables.concat(updateStatements))] :
            [];
        return o.fn(
        // i.e. (rf: RenderFlags, ctx: any)
        [new o.FnParam(RENDER_FLAGS, o.NUMBER_TYPE), new o.FnParam(CONTEXT_NAME, null)], [
            // Temporary variable declarations for query refresh (i.e. let _t: any;)
            ...this._prefixCode,
            // Creating mode (i.e. if (rf & RenderFlags.Create) { ... })
            ...creationBlock,
            // Binding and refresh mode (i.e. if (rf & RenderFlags.Update) {...})
            ...updateBlock,
        ], o.INFERRED_TYPE, null, this.templateName);
    }
    // LocalResolver
    getLocal(name) {
        return this._bindingScope.get(name);
    }
    // LocalResolver
    notifyImplicitReceiverUse() {
        this._bindingScope.notifyImplicitReceiverUse();
    }
    // LocalResolver
    maybeRestoreView() {
        this._bindingScope.maybeRestoreView();
    }
    i18nTranslate(message, params = {}, ref, transformFn) {
        const _ref = ref || this.i18nGenerateMainBlockVar();
        // Closure Compiler requires const names to start with `MSG_` but disallows any other const to
        // start with `MSG_`. We define a variable starting with `MSG_` just for the `goog.getMsg` call
        const closureVar = this.i18nGenerateClosureVar(message.id);
        const statements = getTranslationDeclStmts(message, _ref, closureVar, params, transformFn);
        this._constants.prepareStatements.push(...statements);
        return _ref;
    }
    registerContextVariables(name, value) {
        const scopedName = this._bindingScope.freshReferenceName();
        const retrievalLevel = this.level;
        const isDirect = value === DIRECT_CONTEXT_REFERENCE;
        const lhs = o.variable(name + scopedName);
        this._bindingScope.set(retrievalLevel, name, scope => {
            // If we're at the top level and we're referring to the context variable directly, we
            // can do so through the implicit receiver, instead of renaming it. Note that this does
            // not apply to listeners, because they need to restore the context.
            return isDirect && scope.bindingLevel === retrievalLevel && !scope.isListenerScope() ?
                o.variable(CONTEXT_NAME) :
                lhs;
        }, 1 /* DeclarationPriority.CONTEXT */, (scope, relativeLevel) => {
            let rhs;
            if (scope.bindingLevel === retrievalLevel) {
                if (scope.isListenerScope() && scope.hasRestoreViewVariable()) {
                    // e.g. restoredCtx.
                    // We have to get the context from a view reference, if one is available, because
                    // the context that was passed in during creation may not be correct anymore.
                    // For more information see: https://github.com/angular/angular/pull/40360.
                    rhs = o.variable(RESTORED_VIEW_CONTEXT_NAME);
                    scope.notifyRestoredViewContextUse();
                }
                else if (isDirect) {
                    // If we have a direct read of the context at the top level we don't need to
                    // declare any variables and we can refer to it directly.
                    return [];
                }
                else {
                    // e.g. ctx
                    rhs = o.variable(CONTEXT_NAME);
                }
            }
            else {
                const sharedCtxVar = scope.getSharedContextName(retrievalLevel);
                // e.g. ctx_r0   OR  x(2);
                rhs = sharedCtxVar ? sharedCtxVar : generateNextContextExpr(relativeLevel);
            }
            return [
                // e.g. const $items$ = x(2) for direct context references and
                // const $item$ = x(2).$implicit for indirect ones.
                lhs.set(isDirect ? rhs : rhs.prop(value || IMPLICIT_REFERENCE)).toConstDecl()
            ];
        });
    }
    i18nAppendBindings(expressions) {
        if (expressions.length > 0) {
            expressions.forEach(expression => this.i18n.appendBinding(expression));
        }
    }
    i18nBindProps(props) {
        const bound = {};
        Object.keys(props).forEach(key => {
            const prop = props[key];
            if (prop instanceof t.Text) {
                bound[key] = o.literal(prop.value);
            }
            else {
                const value = prop.value.visit(this._valueConverter);
                this.allocateBindingSlots(value);
                if (value instanceof Interpolation) {
                    const { strings, expressions } = value;
                    const { id, bindings } = this.i18n;
                    const label = assembleI18nBoundString(strings, bindings.size, id);
                    this.i18nAppendBindings(expressions);
                    bound[key] = o.literal(label);
                }
            }
        });
        return bound;
    }
    // Generates top level vars for i18n blocks (i.e. `i18n_N`).
    i18nGenerateMainBlockVar() {
        return o.variable(this.constantPool.uniqueName(TRANSLATION_VAR_PREFIX));
    }
    // Generates vars with Closure-specific names for i18n blocks (i.e. `MSG_XXX`).
    i18nGenerateClosureVar(messageId) {
        let name;
        const suffix = this.fileBasedI18nSuffix.toUpperCase();
        if (this.i18nUseExternalIds) {
            const prefix = getTranslationConstPrefix(`EXTERNAL_`);
            const uniqueSuffix = this.constantPool.uniqueName(suffix);
            name = `${prefix}${sanitizeIdentifier(messageId)}$$${uniqueSuffix}`;
        }
        else {
            const prefix = getTranslationConstPrefix(suffix);
            name = this.constantPool.uniqueName(prefix);
        }
        return o.variable(name);
    }
    i18nUpdateRef(context) {
        const { icus, meta, isRoot, isResolved, isEmitted } = context;
        if (isRoot && isResolved && !isEmitted && !isSingleI18nIcu(meta)) {
            context.isEmitted = true;
            const placeholders = context.getSerializedPlaceholders();
            let icuMapping = {};
            let params = placeholders.size ? placeholdersToParams(placeholders) : {};
            if (icus.size) {
                icus.forEach((refs, key) => {
                    if (refs.length === 1) {
                        // if we have one ICU defined for a given
                        // placeholder - just output its reference
                        params[key] = refs[0];
                    }
                    else {
                        // ... otherwise we need to activate post-processing
                        // to replace ICU placeholders with proper values
                        const placeholder = wrapI18nPlaceholder(`${I18N_ICU_MAPPING_PREFIX}${key}`);
                        params[key] = o.literal(placeholder);
                        icuMapping[key] = o.literalArr(refs);
                    }
                });
            }
            // translation requires post processing in 2 cases:
            // - if we have placeholders with multiple values (ex. `START_DIV`: [�#1�, �#2�, ...])
            // - if we have multiple ICUs that refer to the same placeholder name
            const needsPostprocessing = Array.from(placeholders.values()).some((value) => value.length > 1) ||
                Object.keys(icuMapping).length;
            let transformFn;
            if (needsPostprocessing) {
                transformFn = (raw) => {
                    const args = [raw];
                    if (Object.keys(icuMapping).length) {
                        args.push(mapLiteral(icuMapping, true));
                    }
                    return invokeInstruction(null, R3.i18nPostprocess, args);
                };
            }
            this.i18nTranslate(meta, params, context.ref, transformFn);
        }
    }
    i18nStart(span = null, meta, selfClosing) {
        const index = this.allocateDataSlot();
        this.i18n = this.i18nContext ?
            this.i18nContext.forkChildContext(index, this.templateIndex, meta) :
            new I18nContext(index, this.i18nGenerateMainBlockVar(), 0, this.templateIndex, meta);
        // generate i18nStart instruction
        const { id, ref } = this.i18n;
        const params = [o.literal(index), this.addToConsts(ref)];
        if (id > 0) {
            // do not push 3rd argument (sub-block id)
            // into i18nStart call for top level i18n context
            params.push(o.literal(id));
        }
        this.creationInstruction(span, selfClosing ? R3.i18n : R3.i18nStart, params);
    }
    i18nEnd(span = null, selfClosing) {
        if (!this.i18n) {
            throw new Error('i18nEnd is executed with no i18n context present');
        }
        if (this.i18nContext) {
            this.i18nContext.reconcileChildContext(this.i18n);
            this.i18nUpdateRef(this.i18nContext);
        }
        else {
            this.i18nUpdateRef(this.i18n);
        }
        // setup accumulated bindings
        const { index, bindings } = this.i18n;
        if (bindings.size) {
            for (const binding of bindings) {
                // for i18n block, advance to the most recent element index (by taking the current number of
                // elements and subtracting one) before invoking `i18nExp` instructions, to make sure the
                // necessary lifecycle hooks of components/directives are properly flushed.
                this.updateInstructionWithAdvance(this.getConstCount() - 1, span, R3.i18nExp, () => this.convertPropertyBinding(binding));
            }
            this.updateInstruction(span, R3.i18nApply, [o.literal(index)]);
        }
        if (!selfClosing) {
            this.creationInstruction(span, R3.i18nEnd);
        }
        this.i18n = null; // reset local i18n context
    }
    i18nAttributesInstruction(nodeIndex, attrs, sourceSpan) {
        let hasBindings = false;
        const i18nAttrArgs = [];
        attrs.forEach(attr => {
            const message = attr.i18n;
            const converted = attr.value.visit(this._valueConverter);
            this.allocateBindingSlots(converted);
            if (converted instanceof Interpolation) {
                const placeholders = assembleBoundTextPlaceholders(message);
                const params = placeholdersToParams(placeholders);
                i18nAttrArgs.push(o.literal(attr.name), this.i18nTranslate(message, params));
                converted.expressions.forEach(expression => {
                    hasBindings = true;
                    this.updateInstructionWithAdvance(nodeIndex, sourceSpan, R3.i18nExp, () => this.convertPropertyBinding(expression));
                });
            }
        });
        if (i18nAttrArgs.length > 0) {
            const index = o.literal(this.allocateDataSlot());
            const constIndex = this.addToConsts(o.literalArr(i18nAttrArgs));
            this.creationInstruction(sourceSpan, R3.i18nAttributes, [index, constIndex]);
            if (hasBindings) {
                this.updateInstruction(sourceSpan, R3.i18nApply, [index]);
            }
        }
    }
    getNamespaceInstruction(namespaceKey) {
        switch (namespaceKey) {
            case 'math':
                return R3.namespaceMathML;
            case 'svg':
                return R3.namespaceSVG;
            default:
                return R3.namespaceHTML;
        }
    }
    addNamespaceInstruction(nsInstruction, element) {
        this._namespace = nsInstruction;
        this.creationInstruction(element.startSourceSpan, nsInstruction);
    }
    /**
     * Adds an update instruction for an interpolated property or attribute, such as
     * `prop="{{value}}"` or `attr.title="{{value}}"`
     */
    interpolatedUpdateInstruction(instruction, elementIndex, attrName, input, value, params) {
        this.updateInstructionWithAdvance(elementIndex, input.sourceSpan, instruction, () => [o.literal(attrName), ...this.getUpdateInstructionArguments(value), ...params]);
    }
    visitContent(ngContent) {
        const slot = this.allocateDataSlot();
        const projectionSlotIdx = this._ngContentSelectorsOffset + this._ngContentReservedSlots.length;
        const parameters = [o.literal(slot)];
        this._ngContentReservedSlots.push(ngContent.selector);
        const nonContentSelectAttributes = ngContent.attributes.filter(attr => attr.name.toLowerCase() !== NG_CONTENT_SELECT_ATTR);
        const attributes = this.getAttributeExpressions(ngContent.name, nonContentSelectAttributes, [], []);
        if (attributes.length > 0) {
            parameters.push(o.literal(projectionSlotIdx), o.literalArr(attributes));
        }
        else if (projectionSlotIdx !== 0) {
            parameters.push(o.literal(projectionSlotIdx));
        }
        this.creationInstruction(ngContent.sourceSpan, R3.projection, parameters);
        if (this.i18n) {
            this.i18n.appendProjection(ngContent.i18n, slot);
        }
    }
    visitElement(element) {
        const elementIndex = this.allocateDataSlot();
        const stylingBuilder = new StylingBuilder(null);
        this.elementLocations.set(element, { index: elementIndex, level: this.level });
        let isNonBindableMode = false;
        const isI18nRootElement = isI18nRootNode(element.i18n) && !isSingleI18nIcu(element.i18n);
        const outputAttrs = [];
        const [namespaceKey, elementName] = splitNsName(element.name);
        const isNgContainer = checkIsNgContainer(element.name);
        // Handle styling, i18n, ngNonBindable attributes
        for (const attr of element.attributes) {
            const { name, value } = attr;
            if (name === NON_BINDABLE_ATTR) {
                isNonBindableMode = true;
            }
            else if (name === 'style') {
                stylingBuilder.registerStyleAttr(value);
            }
            else if (name === 'class') {
                stylingBuilder.registerClassAttr(value);
            }
            else {
                outputAttrs.push(attr);
            }
        }
        // Regular element or ng-container creation mode
        const parameters = [o.literal(elementIndex)];
        if (!isNgContainer) {
            parameters.push(o.literal(elementName));
        }
        // Add the attributes
        const allOtherInputs = [];
        const boundI18nAttrs = [];
        element.inputs.forEach(input => {
            const stylingInputWasSet = stylingBuilder.registerBoundInput(input);
            if (!stylingInputWasSet) {
                if ((input.type === 0 /* BindingType.Property */ || input.type === 5 /* BindingType.TwoWay */) &&
                    input.i18n) {
                    boundI18nAttrs.push(input);
                }
                else {
                    allOtherInputs.push(input);
                }
            }
        });
        // add attributes for directive and projection matching purposes
        const attributes = this.getAttributeExpressions(element.name, outputAttrs, allOtherInputs, element.outputs, stylingBuilder, [], boundI18nAttrs);
        parameters.push(this.addAttrsToConsts(attributes));
        // local refs (ex.: <div #foo #bar="baz">)
        const refs = this.prepareRefsArray(element.references);
        parameters.push(this.addToConsts(refs));
        const wasInNamespace = this._namespace;
        const currentNamespace = this.getNamespaceInstruction(namespaceKey);
        // If the namespace is changing now, include an instruction to change it
        // during element creation.
        if (currentNamespace !== wasInNamespace) {
            this.addNamespaceInstruction(currentNamespace, element);
        }
        if (this.i18n) {
            this.i18n.appendElement(element.i18n, elementIndex);
        }
        // Note that we do not append text node instructions and ICUs inside i18n section,
        // so we exclude them while calculating whether current element has children
        const hasChildren = (!isI18nRootElement && this.i18n) ? !hasTextChildrenOnly(element.children) :
            element.children.length > 0;
        const createSelfClosingInstruction = !stylingBuilder.hasBindingsWithPipes &&
            element.outputs.length === 0 && boundI18nAttrs.length === 0 && !hasChildren;
        const createSelfClosingI18nInstruction = !createSelfClosingInstruction && hasTextChildrenOnly(element.children);
        if (createSelfClosingInstruction) {
            this.creationInstruction(element.sourceSpan, isNgContainer ? R3.elementContainer : R3.element, trimTrailingNulls(parameters));
        }
        else {
            this.creationInstruction(element.startSourceSpan, isNgContainer ? R3.elementContainerStart : R3.elementStart, trimTrailingNulls(parameters));
            if (isNonBindableMode) {
                this.creationInstruction(element.startSourceSpan, R3.disableBindings);
            }
            if (boundI18nAttrs.length > 0) {
                this.i18nAttributesInstruction(elementIndex, boundI18nAttrs, element.startSourceSpan ?? element.sourceSpan);
            }
            // Generate Listeners (outputs)
            if (element.outputs.length > 0) {
                for (const outputAst of element.outputs) {
                    this.creationInstruction(outputAst.sourceSpan, outputAst.type === 2 /* ParsedEventType.TwoWay */ ? R3.twoWayListener : R3.listener, this.prepareListenerParameter(element.name, outputAst, elementIndex));
                }
            }
            // Note: it's important to keep i18n/i18nStart instructions after i18nAttributes and
            // listeners, to make sure i18nAttributes instruction targets current element at runtime.
            if (isI18nRootElement) {
                this.i18nStart(element.startSourceSpan, element.i18n, createSelfClosingI18nInstruction);
            }
        }
        // the code here will collect all update-level styling instructions and add them to the
        // update block of the template function AOT code. Instructions like `styleProp`,
        // `styleMap`, `classMap`, `classProp`
        // are all generated and assigned in the code below.
        const stylingInstructions = stylingBuilder.buildUpdateLevelInstructions(this._valueConverter);
        const limit = stylingInstructions.length - 1;
        for (let i = 0; i <= limit; i++) {
            const instruction = stylingInstructions[i];
            this._bindingSlots += this.processStylingUpdateInstruction(elementIndex, instruction);
        }
        // the reason why `undefined` is used is because the renderer understands this as a
        // special value to symbolize that there is no RHS to this binding
        // TODO (matsko): revisit this once FW-959 is approached
        const emptyValueBindInstruction = o.literal(undefined);
        const propertyBindings = [];
        const attributeBindings = [];
        // Generate element input bindings
        allOtherInputs.forEach(input => {
            const inputType = input.type;
            if (inputType === 4 /* BindingType.Animation */) {
                const value = input.value.visit(this._valueConverter);
                // animation bindings can be presented in the following formats:
                // 1. [@binding]="fooExp"
                // 2. [@binding]="{value:fooExp, params:{...}}"
                // 3. [@binding]
                // 4. @binding
                // All formats will be valid for when a synthetic binding is created.
                // The reasoning for this is because the renderer should get each
                // synthetic binding value in the order of the array that they are
                // defined in...
                const hasValue = value instanceof LiteralPrimitive ? !!value.value : true;
                this.allocateBindingSlots(value);
                propertyBindings.push({
                    span: input.sourceSpan,
                    reference: R3.property,
                    paramsOrFn: getBindingFunctionParams(() => hasValue ? this.convertPropertyBinding(value) : emptyValueBindInstruction, prepareSyntheticPropertyName(input.name))
                });
            }
            else {
                // we must skip attributes with associated i18n context, since these attributes are handled
                // separately and corresponding `i18nExp` and `i18nApply` instructions will be generated
                if (input.i18n)
                    return;
                const value = input.value.visit(this._valueConverter);
                if (value !== undefined) {
                    const params = [];
                    const [attrNamespace, attrName] = splitNsName(input.name);
                    const isAttributeBinding = inputType === 1 /* BindingType.Attribute */;
                    let sanitizationRef = resolveSanitizationFn(input.securityContext, isAttributeBinding);
                    if (!sanitizationRef) {
                        // If there was no sanitization function found based on the security context
                        // of an attribute/property - check whether this attribute/property is
                        // one of the security-sensitive <iframe> attributes (and that the current
                        // element is actually an <iframe>).
                        if (isIframeElement(element.name) && isIframeSecuritySensitiveAttr(input.name)) {
                            sanitizationRef = o.importExpr(R3.validateIframeAttribute);
                        }
                    }
                    if (sanitizationRef) {
                        params.push(sanitizationRef);
                    }
                    if (attrNamespace) {
                        const namespaceLiteral = o.literal(attrNamespace);
                        if (sanitizationRef) {
                            params.push(namespaceLiteral);
                        }
                        else {
                            // If there wasn't a sanitization ref, we need to add
                            // an extra param so that we can pass in the namespace.
                            params.push(o.literal(null), namespaceLiteral);
                        }
                    }
                    this.allocateBindingSlots(value);
                    // Note: we don't separate two-way property bindings and regular ones,
                    // because their assignment order needs to be maintained.
                    if (inputType === 0 /* BindingType.Property */ || inputType === 5 /* BindingType.TwoWay */) {
                        if (value instanceof Interpolation) {
                            // prop="{{value}}" and friends
                            this.interpolatedUpdateInstruction(getPropertyInterpolationExpression(value), elementIndex, attrName, input, value, params);
                        }
                        else {
                            // [prop]="value"
                            // Collect all the properties so that we can chain into a single function at the end.
                            propertyBindings.push({
                                span: input.sourceSpan,
                                reference: inputType === 5 /* BindingType.TwoWay */ ? R3.twoWayProperty : R3.property,
                                paramsOrFn: getBindingFunctionParams(() => this.convertPropertyBinding(value), attrName, params)
                            });
                        }
                    }
                    else if (inputType === 1 /* BindingType.Attribute */) {
                        if (value instanceof Interpolation && getInterpolationArgsLength(value) > 1) {
                            // attr.name="text{{value}}" and friends
                            this.interpolatedUpdateInstruction(getAttributeInterpolationExpression(value), elementIndex, attrName, input, value, params);
                        }
                        else {
                            const boundValue = value instanceof Interpolation ? value.expressions[0] : value;
                            // [attr.name]="value" or attr.name="{{value}}"
                            // Collect the attribute bindings so that they can be chained at the end.
                            attributeBindings.push({
                                span: input.sourceSpan,
                                paramsOrFn: getBindingFunctionParams(() => this.convertPropertyBinding(boundValue), attrName, params)
                            });
                        }
                    }
                    else {
                        // class prop
                        this.updateInstructionWithAdvance(elementIndex, input.sourceSpan, R3.classProp, () => {
                            return [
                                o.literal(elementIndex), o.literal(attrName), this.convertPropertyBinding(value),
                                ...params
                            ];
                        });
                    }
                }
            }
        });
        for (const propertyBinding of propertyBindings) {
            this.updateInstructionWithAdvance(elementIndex, propertyBinding.span, propertyBinding.reference, propertyBinding.paramsOrFn);
        }
        for (const attributeBinding of attributeBindings) {
            this.updateInstructionWithAdvance(elementIndex, attributeBinding.span, R3.attribute, attributeBinding.paramsOrFn);
        }
        // Traverse element child nodes
        t.visitAll(this, element.children);
        if (!isI18nRootElement && this.i18n) {
            this.i18n.appendElement(element.i18n, elementIndex, true);
        }
        if (!createSelfClosingInstruction) {
            // Finish element construction mode.
            const span = element.endSourceSpan ?? element.sourceSpan;
            if (isI18nRootElement) {
                this.i18nEnd(span, createSelfClosingI18nInstruction);
            }
            if (isNonBindableMode) {
                this.creationInstruction(span, R3.enableBindings);
            }
            this.creationInstruction(span, isNgContainer ? R3.elementContainerEnd : R3.elementEnd);
        }
    }
    prepareEmbeddedTemplateFn(children, contextNameSuffix, variables = [], i18nMeta, variableAliases) {
        const index = this.allocateDataSlot();
        if (this.i18n && i18nMeta) {
            if (i18nMeta instanceof i18n.BlockPlaceholder) {
                this.i18n.appendBlock(i18nMeta, index);
            }
            else {
                this.i18n.appendTemplate(i18nMeta, index);
            }
        }
        const contextName = `${this.contextName}${contextNameSuffix}_${index}`;
        // Note: For the unique name, we don't include an unique suffix, unless really needed.
        // This keeps the generated output more clean as most of the time, we don't expect conflicts.
        const name = this.constantPool.uniqueName(`${contextName}_Template`, /** alwaysIncludeSuffix */ false);
        // Create the template function
        const visitor = new TemplateDefinitionBuilder(this.constantPool, this._bindingScope, this.level + 1, contextName, this.i18n, index, name, this._namespace, this.fileBasedI18nSuffix, this.i18nUseExternalIds, this.deferBlocks, this.elementLocations, this.allDeferrableDepsFn, this._constants);
        // Nested templates must not be visited until after their parent templates have completed
        // processing, so they are queued here until after the initial pass. Otherwise, we wouldn't
        // be able to support bindings in nested templates to local refs that occur after the
        // template definition. e.g. <div *ngIf="showing">{{ foo }}</div>  <div #foo></div>
        this._nestedTemplateFns.push(() => {
            const templateFunctionExpr = visitor.buildTemplateFunction(children, variables, this._ngContentReservedSlots.length + this._ngContentSelectorsOffset, i18nMeta, variableAliases);
            this.constantPool.statements.push(templateFunctionExpr.toDeclStmt(name));
            if (visitor._ngContentReservedSlots.length) {
                this._ngContentReservedSlots.push(...visitor._ngContentReservedSlots);
            }
        });
        return new TemplateData(name, index, visitor._bindingScope, visitor);
    }
    createEmbeddedTemplateFn(tagName, children, contextNameSuffix, sourceSpan, variables = [], attrsExprs, references, i18n) {
        const data = this.prepareEmbeddedTemplateFn(children, contextNameSuffix, variables, i18n);
        const parameters = [
            o.literal(data.index),
            o.variable(data.name),
            o.literal(tagName),
            this.addAttrsToConsts(attrsExprs || null),
        ];
        // local refs (ex.: <ng-template #foo>)
        if (references && references.length > 0) {
            const refs = this.prepareRefsArray(references);
            parameters.push(this.addToConsts(refs));
            parameters.push(o.importExpr(R3.templateRefExtractor));
        }
        // e.g. template(1, MyComp_Template_1)
        this.creationInstruction(sourceSpan, R3.templateCreate, () => {
            parameters.splice(2, 0, o.literal(data.getConstCount()), o.literal(data.getVarCount()));
            return trimTrailingNulls(parameters);
        });
        return data.index;
    }
    visitTemplate(template) {
        // We don't care about the tag's namespace here, because we infer
        // it based on the parent nodes inside the template instruction.
        const tagNameWithoutNamespace = template.tagName ? splitNsName(template.tagName)[1] : template.tagName;
        const contextNameSuffix = template.tagName ? '_' + sanitizeIdentifier(template.tagName) : '';
        // prepare attributes parameter (including attributes used for directive matching)
        const attrsExprs = this.getAttributeExpressions(NG_TEMPLATE_TAG_NAME, template.attributes, template.inputs, template.outputs, undefined /* styles */, template.templateAttrs);
        const templateIndex = this.createEmbeddedTemplateFn(tagNameWithoutNamespace, template.children, contextNameSuffix, template.sourceSpan, template.variables, attrsExprs, template.references, template.i18n);
        // handle property bindings e.g. ɵɵproperty('ngForOf', ctx.items), et al;
        this.templatePropertyBindings(templateIndex, template.templateAttrs);
        // Only add normal input/output binding instructions on explicit <ng-template> elements.
        if (tagNameWithoutNamespace === NG_TEMPLATE_TAG_NAME) {
            const [i18nInputs, inputs] = partitionArray(template.inputs, hasI18nMeta);
            // Add i18n attributes that may act as inputs to directives. If such attributes are present,
            // generate `i18nAttributes` instruction. Note: we generate it only for explicit <ng-template>
            // elements, in case of inline templates, corresponding instructions will be generated in the
            // nested template function.
            if (i18nInputs.length > 0) {
                this.i18nAttributesInstruction(templateIndex, i18nInputs, template.startSourceSpan ?? template.sourceSpan);
            }
            // Add the input bindings
            if (inputs.length > 0) {
                this.templatePropertyBindings(templateIndex, inputs);
            }
            // Generate listeners for directive output
            for (const outputAst of template.outputs) {
                this.creationInstruction(outputAst.sourceSpan, outputAst.type === 2 /* ParsedEventType.TwoWay */ ? R3.twoWayListener : R3.listener, this.prepareListenerParameter('ng_template', outputAst, templateIndex));
            }
        }
    }
    visitBoundText(text) {
        if (this.i18n) {
            const value = text.value.visit(this._valueConverter);
            this.allocateBindingSlots(value);
            if (value instanceof Interpolation) {
                this.i18n.appendBoundText(text.i18n);
                this.i18nAppendBindings(value.expressions);
            }
            return;
        }
        const nodeIndex = this.allocateDataSlot();
        this.creationInstruction(text.sourceSpan, R3.text, [o.literal(nodeIndex)]);
        const value = text.value.visit(this._valueConverter);
        this.allocateBindingSlots(value);
        if (value instanceof Interpolation) {
            this.updateInstructionWithAdvance(nodeIndex, text.sourceSpan, getTextInterpolationExpression(value), () => this.getUpdateInstructionArguments(value));
        }
        else {
            error('Text nodes should be interpolated and never bound directly.');
        }
    }
    visitText(text) {
        // when a text element is located within a translatable
        // block, we exclude this text element from instructions set,
        // since it will be captured in i18n content and processed at runtime
        if (!this.i18n) {
            this.creationInstruction(text.sourceSpan, R3.text, [o.literal(this.allocateDataSlot()), o.literal(text.value)]);
        }
    }
    visitIcu(icu) {
        let initWasInvoked = false;
        // if an ICU was created outside of i18n block, we still treat
        // it as a translatable entity and invoke i18nStart and i18nEnd
        // to generate i18n context and the necessary instructions
        if (!this.i18n) {
            initWasInvoked = true;
            this.i18nStart(null, icu.i18n, true);
        }
        const i18n = this.i18n;
        const vars = this.i18nBindProps(icu.vars);
        const placeholders = this.i18nBindProps(icu.placeholders);
        // output ICU directly and keep ICU reference in context
        const message = icu.i18n;
        // we always need post-processing function for ICUs, to make sure that:
        // - all placeholders in a form of {PLACEHOLDER} are replaced with actual values (note:
        // `goog.getMsg` does not process ICUs and uses the `{PLACEHOLDER}` format for placeholders
        // inside ICUs)
        // - all ICU vars (such as `VAR_SELECT` or `VAR_PLURAL`) are replaced with correct values
        const transformFn = (raw) => {
            // Sort the map entries in the compiled output. This makes it easy to acheive identical output
            // in the template pipeline compiler.
            const params = Object.fromEntries(Object.entries({ ...vars, ...placeholders }).sort());
            const formatted = formatI18nPlaceholderNamesInMap(params, /* useCamelCase */ false);
            return invokeInstruction(null, R3.i18nPostprocess, [raw, mapLiteral(formatted, true)]);
        };
        // in case the whole i18n message is a single ICU - we do not need to
        // create a separate top-level translation, we can use the root ref instead
        // and make this ICU a top-level translation
        // note: ICU placeholders are replaced with actual values in `i18nPostprocess` function
        // separately, so we do not pass placeholders into `i18nTranslate` function.
        if (isSingleI18nIcu(i18n.meta)) {
            this.i18nTranslate(message, /* placeholders */ {}, i18n.ref, transformFn);
        }
        else {
            // output ICU directly and keep ICU reference in context
            const ref = this.i18nTranslate(message, /* placeholders */ {}, /* ref */ undefined, transformFn);
            i18n.appendIcu(icuFromI18nMessage(message).name, ref);
        }
        if (initWasInvoked) {
            this.i18nEnd(null, true);
        }
        return null;
    }
    visitIfBlock(block) {
        // Allocate one slot for the result of the expression.
        this.allocateBindingSlots(null);
        // We have to process the block in two steps: once here and again in the update instruction
        // callback in order to generate the correct expressions when pipes or pure functions are
        // used inside the branch expressions.
        const branchData = block.branches.map((branch, branchIndex) => {
            const { expression, expressionAlias, children, sourceSpan } = branch;
            // If the branch has an alias, it'll be assigned directly to the container's context.
            // We define a variable referring directly to the context so that any nested usages can be
            // rewritten to refer to it.
            const variables = expressionAlias !== null ?
                [new t.Variable(expressionAlias.name, DIRECT_CONTEXT_REFERENCE, expressionAlias.sourceSpan, expressionAlias.keySpan)] :
                undefined;
            let tagName = null;
            let attrsExprs;
            // Only the first branch can be used for projection, because the conditional
            // uses the container of the first branch as the insertion point for all branches.
            if (branchIndex === 0) {
                const inferredData = this.inferProjectionDataFromInsertionPoint(branch);
                tagName = inferredData.tagName;
                attrsExprs = inferredData.attrsExprs;
            }
            // Note: the template needs to be created *before* we process the expression,
            // otherwise pipes injecting some symbols won't work (see #52102).
            const templateIndex = this.createEmbeddedTemplateFn(tagName, children, '_Conditional', sourceSpan, variables, attrsExprs, undefined, branch.i18n);
            const processedExpression = expression === null ? null : expression.visit(this._valueConverter);
            return { index: templateIndex, expression: processedExpression, alias: expressionAlias };
        });
        // Use the index of the first block as the index for the entire container.
        const containerIndex = branchData[0].index;
        const paramsCallback = () => {
            let contextVariable = null;
            const generateBranch = (branchIndex) => {
                // If we've gone beyond the last branch, return the special -1 value which means that no
                // view will be rendered. Note that we don't need to reset the context here, because -1
                // won't render a view so the passed-in context won't be captured.
                if (branchIndex > branchData.length - 1) {
                    return o.literal(-1);
                }
                const { index, expression, alias } = branchData[branchIndex];
                // If the branch has no expression, it means that it's the final `else`.
                // Return its index and stop the recursion. Assumes that there's only one
                // `else` condition and that it's the last branch.
                if (expression === null) {
                    return o.literal(index);
                }
                let comparisonTarget;
                if (alias) {
                    // If the branch is aliased, we need to assign the expression value to the temporary
                    // variable and then pass it into `conditional`. E.g. for the expression:
                    // `@if (foo(); as alias) {...}` we have to generate:
                    // ```
                    // let temp;
                    // conditional(0, (temp = ctx.foo()) ? 0 : -1, temp);
                    // ```
                    contextVariable = this.allocateControlFlowTempVariable();
                    comparisonTarget = contextVariable.set(this.convertPropertyBinding(expression));
                }
                else {
                    comparisonTarget = this.convertPropertyBinding(expression);
                }
                return comparisonTarget.conditional(o.literal(index), generateBranch(branchIndex + 1));
            };
            const params = [o.literal(containerIndex), generateBranch(0)];
            if (contextVariable !== null) {
                params.push(contextVariable);
            }
            return params;
        };
        this.updateInstructionWithAdvance(containerIndex, block.branches[0].sourceSpan, R3.conditional, paramsCallback);
    }
    visitSwitchBlock(block) {
        if (block.cases.length === 0) {
            return;
        }
        // We have to process the block in two steps: once here and again in the update instruction
        // callback in order to generate the correct expressions when pipes or pure functions are used.
        const caseData = block.cases.map(currentCase => {
            const index = this.createEmbeddedTemplateFn(null, currentCase.children, '_Case', currentCase.sourceSpan, undefined, undefined, undefined, currentCase.i18n);
            const expression = currentCase.expression === null ?
                null :
                currentCase.expression.visit(this._valueConverter);
            return { index, expression };
        });
        // Use the index of the first block as the index for the entire container.
        const containerIndex = caseData[0].index;
        // Note: the expression needs to be processed *after* the template,
        // otherwise pipes injecting some symbols won't work (see #52102).
        const blockExpression = block.expression.visit(this._valueConverter);
        this.allocateBindingSlots(null); // Allocate a slot for the primary block expression.
        this.updateInstructionWithAdvance(containerIndex, block.sourceSpan, R3.conditional, () => {
            const generateCases = (caseIndex) => {
                // If we've gone beyond the last branch, return the special -1
                // value which means that no view will be rendered.
                if (caseIndex > caseData.length - 1) {
                    return o.literal(-1);
                }
                const { index, expression } = caseData[caseIndex];
                // If the case has no expression, it means that it's the `default` case.
                // Return its index and stop the recursion. Assumes that there's only one
                // `default` condition and that it's defined last.
                if (expression === null) {
                    return o.literal(index);
                }
                // If this is the very first comparison, we need to assign the value of the primary
                // expression as a part of the comparison so the remaining cases can reuse it. In practice
                // this looks as follows:
                // ```
                // let temp;
                // conditional(1, (temp = ctx.foo) === 1 ? 1 : temp === 2 ? 2 : temp === 3 ? 3 : 4);
                // ```
                const comparisonTarget = caseIndex === 0 ?
                    this.allocateControlFlowTempVariable().set(this.convertPropertyBinding(blockExpression)) :
                    this.allocateControlFlowTempVariable();
                return comparisonTarget.identical(this.convertPropertyBinding(expression))
                    .conditional(o.literal(index), generateCases(caseIndex + 1));
            };
            return [o.literal(containerIndex), generateCases(0)];
        });
    }
    visitDeferredBlock(deferred) {
        const { loading, placeholder, error, triggers, prefetchTriggers } = deferred;
        const metadata = this.deferBlocks.get(deferred);
        if (!metadata) {
            throw new Error('Could not resolve `defer` block metadata. Block may need to be analyzed.');
        }
        const primaryTemplateIndex = this.createEmbeddedTemplateFn(null, deferred.children, '_Defer', deferred.sourceSpan, undefined, undefined, undefined, deferred.i18n);
        const loadingIndex = loading ? this.createEmbeddedTemplateFn(null, loading.children, '_DeferLoading', loading.sourceSpan, undefined, undefined, undefined, loading.i18n) :
            null;
        const loadingConsts = loading ?
            trimTrailingNulls([o.literal(loading.minimumTime), o.literal(loading.afterTime)]) :
            null;
        const placeholderIndex = placeholder ?
            this.createEmbeddedTemplateFn(null, placeholder.children, '_DeferPlaceholder', placeholder.sourceSpan, undefined, undefined, undefined, placeholder.i18n) :
            null;
        const placeholderConsts = placeholder && placeholder.minimumTime !== null ?
            // TODO(crisbeto): potentially pass the time directly instead of storing it in the `consts`
            // since the placeholder block can only have one parameter?
            o.literalArr([o.literal(placeholder.minimumTime)]) :
            null;
        const errorIndex = error ? this.createEmbeddedTemplateFn(null, error.children, '_DeferError', error.sourceSpan, undefined, undefined, undefined, error.i18n) :
            null;
        // Note: we generate this last so the index matches the instruction order.
        const deferredIndex = this.allocateDataSlot();
        const depsFnName = `${this.contextName}_Defer_${deferredIndex}_DepsFn`;
        // e.g. `defer(1, 0, MyComp_Defer_1_DepsFn, ...)`
        this.creationInstruction(deferred.sourceSpan, R3.defer, trimTrailingNulls([
            o.literal(deferredIndex),
            o.literal(primaryTemplateIndex),
            this.allDeferrableDepsFn ?? this.createDeferredDepsFunction(depsFnName, metadata),
            o.literal(loadingIndex),
            o.literal(placeholderIndex),
            o.literal(errorIndex),
            loadingConsts?.length ? this.addToConsts(o.literalArr(loadingConsts)) : o.TYPED_NULL_EXPR,
            placeholderConsts ? this.addToConsts(placeholderConsts) : o.TYPED_NULL_EXPR,
            (loadingConsts?.length || placeholderConsts) ?
                o.importExpr(R3.deferEnableTimerScheduling) :
                o.TYPED_NULL_EXPR,
        ]));
        // Allocate an extra data slot right after a defer block slot to store
        // instance-specific state of that defer block at runtime.
        this.allocateDataSlot();
        // Note: the triggers need to be processed *after* the various templates,
        // otherwise pipes injecting some symbols won't work (see #52102).
        this.createDeferTriggerInstructions(deferredIndex, triggers, metadata, false);
        this.createDeferTriggerInstructions(deferredIndex, prefetchTriggers, metadata, true);
    }
    createDeferredDepsFunction(name, metadata) {
        if (metadata.deps.length === 0) {
            return o.TYPED_NULL_EXPR;
        }
        // This defer block has deps for which we need to generate dynamic imports.
        const dependencyExp = [];
        for (const deferredDep of metadata.deps) {
            if (deferredDep.isDeferrable) {
                // Callback function, e.g. `m () => m.MyCmp;`.
                const innerFn = o.arrowFn([new o.FnParam('m', o.DYNAMIC_TYPE)], 
                // Default imports are always accessed through the `default` property.
                o.variable('m').prop(deferredDep.isDefaultImport ? 'default' : deferredDep.symbolName));
                // Dynamic import, e.g. `import('./a').then(...)`.
                const importExpr = (new o.DynamicImportExpr(deferredDep.importPath)).prop('then').callFn([innerFn]);
                dependencyExp.push(importExpr);
            }
            else {
                // Non-deferrable symbol, just use a reference to the type.
                dependencyExp.push(deferredDep.type);
            }
        }
        const depsFnExpr = o.arrowFn([], o.literalArr(dependencyExp));
        this.constantPool.statements.push(depsFnExpr.toDeclStmt(name, o.StmtModifier.Final));
        return o.variable(name);
    }
    createDeferTriggerInstructions(deferredIndex, triggers, metadata, prefetch) {
        const { when, idle, immediate, timer, hover, interaction, viewport } = triggers;
        // `deferWhen(ctx.someValue)`
        if (when) {
            const value = when.value.visit(this._valueConverter);
            this.allocateBindingSlots(value);
            this.updateInstructionWithAdvance(deferredIndex, when.sourceSpan, prefetch ? R3.deferPrefetchWhen : R3.deferWhen, () => this.convertPropertyBinding(value));
        }
        // Note that we generate an implicit `on idle` if the `deferred` block has no triggers.
        // `deferOnIdle()`
        if (idle || (!prefetch && Object.keys(triggers).length === 0)) {
            this.creationInstruction(idle?.sourceSpan || null, prefetch ? R3.deferPrefetchOnIdle : R3.deferOnIdle);
        }
        // `deferOnImmediate()`
        if (immediate) {
            this.creationInstruction(immediate.sourceSpan, prefetch ? R3.deferPrefetchOnImmediate : R3.deferOnImmediate);
        }
        // `deferOnTimer(1337)`
        if (timer) {
            this.creationInstruction(timer.sourceSpan, prefetch ? R3.deferPrefetchOnTimer : R3.deferOnTimer, [o.literal(timer.delay)]);
        }
        // `deferOnHover(index, walkUpTimes)`
        if (hover) {
            this.domNodeBasedTrigger('hover', hover, metadata, prefetch ? R3.deferPrefetchOnHover : R3.deferOnHover);
        }
        // `deferOnInteraction(index, walkUpTimes)`
        if (interaction) {
            this.domNodeBasedTrigger('interaction', interaction, metadata, prefetch ? R3.deferPrefetchOnInteraction : R3.deferOnInteraction);
        }
        // `deferOnViewport(index, walkUpTimes)`
        if (viewport) {
            this.domNodeBasedTrigger('viewport', viewport, metadata, prefetch ? R3.deferPrefetchOnViewport : R3.deferOnViewport);
        }
    }
    domNodeBasedTrigger(name, trigger, metadata, instructionRef) {
        const triggerEl = metadata.triggerElements.get(trigger);
        // Don't generate anything if a trigger cannot be resolved.
        // We'll have template diagnostics to surface these to users.
        if (!triggerEl) {
            return;
        }
        this.creationInstruction(trigger.sourceSpan, instructionRef, () => {
            const location = this.elementLocations.get(triggerEl);
            if (!location) {
                throw new Error(`Could not determine location of reference passed into ` +
                    `'${name}' trigger. Template may not have been fully analyzed.`);
            }
            // A negative depth means that the trigger is inside the placeholder.
            // Cap it at -1 since we only care whether or not it's negative.
            const depth = Math.max(this.level - location.level, -1);
            const params = [o.literal(location.index)];
            // The most common case should be a trigger within the view so we can omit a depth of
            // zero. For triggers in parent views and in the placeholder we need to pass it in.
            if (depth !== 0) {
                params.push(o.literal(depth));
            }
            return params;
        });
    }
    /**
     * Infers the data used for content projection (tag name and attributes) from the content of a
     * node.
     * @param node Node for which to infer the projection data.
     */
    inferProjectionDataFromInsertionPoint(node) {
        let root = null;
        let tagName = null;
        let attrsExprs;
        for (const child of node.children) {
            // Skip over comment nodes.
            if (child instanceof t.Comment) {
                continue;
            }
            // We can only infer the tag name/attributes if there's a single root node.
            if (root !== null) {
                root = null;
                break;
            }
            // Root nodes can only elements or templates with a tag name (e.g. `<div *foo></div>`).
            if (child instanceof t.Element || (child instanceof t.Template && child.tagName !== null)) {
                root = child;
            }
        }
        // If we've found a single root node, its tag name and *static* attributes can be copied
        // to the surrounding template to be used for content projection. Note that it's important
        // that we don't copy any bound attributes since they don't participate in content projection
        // and they can be used in directive matching (in the case of `Template.templateAttrs`).
        if (root !== null) {
            const name = root instanceof t.Element ? root.name : root.tagName;
            // Don't pass along `ng-template` tag name since it enables directive matching.
            tagName = name === NG_TEMPLATE_TAG_NAME ? null : name;
            attrsExprs =
                this.getAttributeExpressions(NG_TEMPLATE_TAG_NAME, root.attributes, root.inputs, []);
        }
        return { tagName, attrsExprs };
    }
    allocateDataSlot() {
        return this._dataIndex++;
    }
    visitForLoopBlock(block) {
        // Allocate one slot for the repeater metadata. The slots for the primary and empty block
        // are implicitly inferred by the runtime to index + 1 and index + 2.
        const blockIndex = this.allocateDataSlot();
        const { tagName, attrsExprs } = this.inferProjectionDataFromInsertionPoint(block);
        const primaryData = this.prepareEmbeddedTemplateFn(block.children, '_For', [block.item, block.contextVariables.$index, block.contextVariables.$count], block.i18n, {
            // We need to provide level-specific versions of `$index` and `$count`, because
            // they're used when deriving the remaining variables (`$odd`, `$even` etc.) while at the
            // same time being available implicitly. Without these aliases, we wouldn't be able to
            // access the `$index` of a parent loop from inside of a nested loop.
            [block.contextVariables.$index.name]: this.getLevelSpecificVariableName('$index', this.level + 1),
            [block.contextVariables.$count.name]: this.getLevelSpecificVariableName('$count', this.level + 1),
        });
        const { expression: trackByExpression, usesComponentInstance: trackByUsesComponentInstance } = this.createTrackByFunction(block);
        let emptyData = null;
        let emptyTagName = null;
        let emptyAttrsExprs;
        if (block.empty !== null) {
            const emptyInferred = this.inferProjectionDataFromInsertionPoint(block.empty);
            emptyTagName = emptyInferred.tagName;
            emptyAttrsExprs = emptyInferred.attrsExprs;
            emptyData = this.prepareEmbeddedTemplateFn(block.empty.children, '_ForEmpty', undefined, block.empty.i18n);
            // Allocate an extra slot for the empty block tracking.
            this.allocateBindingSlots(null);
        }
        this.registerComputedLoopVariables(block, primaryData.scope);
        // `repeaterCreate(0, ...)`
        this.creationInstruction(block.sourceSpan, R3.repeaterCreate, () => {
            const params = [
                o.literal(blockIndex),
                o.variable(primaryData.name),
                o.literal(primaryData.getConstCount()),
                o.literal(primaryData.getVarCount()),
                o.literal(tagName),
                this.addAttrsToConsts(attrsExprs || null),
                trackByExpression,
            ];
            if (emptyData !== null) {
                params.push(o.literal(trackByUsesComponentInstance), o.variable(emptyData.name), o.literal(emptyData.getConstCount()), o.literal(emptyData.getVarCount()), o.literal(emptyTagName), this.addAttrsToConsts(emptyAttrsExprs || null));
            }
            else if (trackByUsesComponentInstance) {
                // If the tracking function doesn't use the component instance, we can omit the flag.
                params.push(o.literal(trackByUsesComponentInstance));
            }
            return trimTrailingNulls(params);
        });
        // Note: the expression needs to be processed *after* the template,
        // otherwise pipes injecting some symbols won't work (see #52102).
        // Note: we don't allocate binding slots for this expression,
        // because its value isn't stored in the LView.
        const value = block.expression.visit(this._valueConverter);
        // `advance(x); repeater(iterable)`
        this.updateInstructionWithAdvance(blockIndex, block.sourceSpan, R3.repeater, () => [this.convertPropertyBinding(value)]);
    }
    registerComputedLoopVariables(block, bindingScope) {
        const level = bindingScope.bindingLevel;
        bindingScope.set(level, block.contextVariables.$odd.name, (scope, retrievalLevel) => {
            return this.getLevelSpecificForLoopVariable(block, scope, retrievalLevel, '$index')
                .modulo(o.literal(2))
                .notIdentical(o.literal(0));
        });
        bindingScope.set(level, block.contextVariables.$even.name, (scope, retrievalLevel) => {
            return this.getLevelSpecificForLoopVariable(block, scope, retrievalLevel, '$index')
                .modulo(o.literal(2))
                .identical(o.literal(0));
        });
        bindingScope.set(level, block.contextVariables.$first.name, (scope, retrievalLevel) => {
            return this.getLevelSpecificForLoopVariable(block, scope, retrievalLevel, '$index')
                .identical(o.literal(0));
        });
        bindingScope.set(level, block.contextVariables.$last.name, (scope, retrievalLevel) => {
            const index = this.getLevelSpecificForLoopVariable(block, scope, retrievalLevel, '$index');
            const count = this.getLevelSpecificForLoopVariable(block, scope, retrievalLevel, '$count');
            return index.identical(count.minus(o.literal(1)));
        });
    }
    getLevelSpecificVariableName(name, level) {
        // We use the `ɵ` here to ensure that there are no name conflicts with user-defined variables.
        return `ɵ${name}_${level}`;
    }
    /**
     * Gets the name of a for loop variable at a specific binding level. This allows us to look
     * up implicitly shadowed variables like `$index` and `$count` at a specific level.
     */
    getLevelSpecificForLoopVariable(block, scope, retrievalLevel, name) {
        const scopeName = scope.bindingLevel === retrievalLevel ?
            block.contextVariables[name].name :
            this.getLevelSpecificVariableName(name, retrievalLevel);
        return scope.get(scopeName);
    }
    optimizeTrackByFunction(block) {
        const indexLocalName = block.contextVariables.$index.name;
        const itemName = block.item.name;
        const ast = block.trackBy.ast;
        // Top-level access of `$index` uses the built in `repeaterTrackByIndex`.
        if (ast instanceof PropertyRead && ast.receiver instanceof ImplicitReceiver &&
            ast.name === indexLocalName) {
            return { expression: o.importExpr(R3.repeaterTrackByIndex), usesComponentInstance: false };
        }
        // Top-level access of the item uses the built in `repeaterTrackByIdentity`.
        if (ast instanceof PropertyRead && ast.receiver instanceof ImplicitReceiver &&
            ast.name === itemName) {
            return { expression: o.importExpr(R3.repeaterTrackByIdentity), usesComponentInstance: false };
        }
        // Top-level calls in the form of `fn($index, item)` can be passed in directly.
        if (ast instanceof Call && ast.receiver instanceof PropertyRead &&
            ast.receiver.receiver instanceof ImplicitReceiver && ast.args.length === 2) {
            const firstIsIndex = ast.args[0] instanceof PropertyRead &&
                ast.args[0].receiver instanceof ImplicitReceiver && ast.args[0].name === indexLocalName;
            const secondIsItem = ast.args[1] instanceof PropertyRead &&
                ast.args[1].receiver instanceof ImplicitReceiver && ast.args[1].name === itemName;
            if (firstIsIndex && secondIsItem) {
                // If we're in the top-level component, we can access directly through `ctx`,
                // otherwise we have to get a hold of the component through `componentInstance()`.
                const receiver = this.level === 0 ? o.variable(CONTEXT_NAME) :
                    new o.ExternalExpr(R3.componentInstance).callFn([]);
                return { expression: receiver.prop(ast.receiver.name), usesComponentInstance: false };
            }
        }
        return null;
    }
    createTrackByFunction(block) {
        const optimizedFn = this.optimizeTrackByFunction(block);
        // If the tracking function can be optimized, we don't need any further processing.
        if (optimizedFn !== null) {
            return optimizedFn;
        }
        const contextVars = block.contextVariables;
        const scope = new TrackByBindingScope(this._bindingScope, {
            // Alias `$index` and the item name to `$index` and `$item` respectively.
            // This allows us to reuse pure functions that may have different item names,
            // but are otherwise identical.
            [contextVars.$index.name]: '$index',
            [block.item.name]: '$item',
            // Accessing these variables in a tracking function will result in a template diagnostic.
            // We define them as globals so that their accesses are preserved verbatim instead of being
            // rewritten to the actual accesses.
            [contextVars.$count.name]: contextVars.$count.name,
            [contextVars.$first.name]: contextVars.$first.name,
            [contextVars.$last.name]: contextVars.$last.name,
            [contextVars.$even.name]: contextVars.$even.name,
            [contextVars.$odd.name]: contextVars.$odd.name,
        });
        const params = [new o.FnParam('$index'), new o.FnParam('$item')];
        const stmts = convertPureComponentScopeFunction(block.trackBy.ast, scope, o.variable(CONTEXT_NAME), 'track');
        const usesComponentInstance = scope.getComponentAccessCount() > 0;
        let fn;
        if (!usesComponentInstance && stmts.length === 1 && stmts[0] instanceof o.ExpressionStatement) {
            fn = o.arrowFn(params, stmts[0].expr);
        }
        else {
            // The last statement is returned implicitly.
            if (stmts.length > 0) {
                const lastStatement = stmts[stmts.length - 1];
                if (lastStatement instanceof o.ExpressionStatement) {
                    stmts[stmts.length - 1] = new o.ReturnStatement(lastStatement.expr);
                }
            }
            // This has to be a function expression, because `.bind` doesn't work on arrow functions.
            fn = o.fn(params, stmts);
        }
        return {
            expression: this.constantPool.getSharedFunctionReference(fn, '_forTrack'),
            usesComponentInstance,
        };
    }
    getConstCount() {
        return this._dataIndex;
    }
    getVarCount() {
        return this._pureFunctionSlots;
    }
    getConsts() {
        return this._constants;
    }
    getNgContentSelectors() {
        return this._ngContentReservedSlots.length ?
            this.constantPool.getConstLiteral(asLiteral(this._ngContentReservedSlots), true) :
            null;
    }
    bindingContext() {
        return `${this._bindingContext++}`;
    }
    templatePropertyBindings(templateIndex, attrs) {
        const propertyBindings = [];
        for (const input of attrs) {
            if (!(input instanceof t.BoundAttribute)) {
                continue;
            }
            const value = input.value.visit(this._valueConverter);
            if (value === undefined) {
                continue;
            }
            this.allocateBindingSlots(value);
            if (value instanceof Interpolation) {
                // Params typically contain attribute namespace and value sanitizer, which is applicable
                // for regular HTML elements, but not applicable for <ng-template> (since props act as
                // inputs to directives), so keep params array empty.
                const params = [];
                // prop="{{value}}" case
                this.interpolatedUpdateInstruction(getPropertyInterpolationExpression(value), templateIndex, input.name, input, value, params);
            }
            else {
                // [prop]="value" case
                propertyBindings.push({
                    span: input.sourceSpan,
                    paramsOrFn: getBindingFunctionParams(() => this.convertPropertyBinding(value), input.name)
                });
            }
        }
        for (const propertyBinding of propertyBindings) {
            this.updateInstructionWithAdvance(templateIndex, propertyBinding.span, R3.property, propertyBinding.paramsOrFn);
        }
    }
    // Bindings must only be resolved after all local refs have been visited, so all
    // instructions are queued in callbacks that execute once the initial pass has completed.
    // Otherwise, we wouldn't be able to support local refs that are defined after their
    // bindings. e.g. {{ foo }} <div #foo></div>
    instructionFn(fns, span, reference, paramsOrFn, prepend = false) {
        fns[prepend ? 'unshift' : 'push']({ span, reference, paramsOrFn });
    }
    processStylingUpdateInstruction(elementIndex, instruction) {
        let allocateBindingSlots = 0;
        if (instruction) {
            for (const call of instruction.calls) {
                allocateBindingSlots += call.allocateBindingSlots;
                this.updateInstructionWithAdvance(elementIndex, call.sourceSpan, instruction.reference, () => call.params(value => (call.supportsInterpolation && value instanceof Interpolation) ?
                    this.getUpdateInstructionArguments(value) :
                    this.convertPropertyBinding(value)));
            }
        }
        return allocateBindingSlots;
    }
    creationInstruction(span, reference, paramsOrFn, prepend) {
        this.instructionFn(this._creationCodeFns, span, reference, paramsOrFn || [], prepend);
    }
    updateInstructionWithAdvance(nodeIndex, span, reference, paramsOrFn) {
        this.addAdvanceInstructionIfNecessary(nodeIndex, span);
        this.updateInstruction(span, reference, paramsOrFn);
    }
    updateInstruction(span, reference, paramsOrFn) {
        this.instructionFn(this._updateCodeFns, span, reference, paramsOrFn || []);
    }
    addAdvanceInstructionIfNecessary(nodeIndex, span) {
        if (nodeIndex !== this._currentIndex) {
            const delta = nodeIndex - this._currentIndex;
            if (delta < 1) {
                throw new Error('advance instruction can only go forwards');
            }
            this.instructionFn(this._updateCodeFns, span, R3.advance, delta > 1 ? [o.literal(delta)] : []);
            this._currentIndex = nodeIndex;
        }
    }
    allocatePureFunctionSlots(numSlots) {
        const originalSlots = this._pureFunctionSlots;
        this._pureFunctionSlots += numSlots;
        return originalSlots;
    }
    allocateBindingSlots(value) {
        this._bindingSlots += value instanceof Interpolation ? value.expressions.length : 1;
    }
    /**
     * Gets an expression that refers to the implicit receiver. The implicit
     * receiver is always the root level context.
     */
    getImplicitReceiverExpr() {
        if (this._implicitReceiverExpr) {
            return this._implicitReceiverExpr;
        }
        return this._implicitReceiverExpr = this.level === 0 ?
            o.variable(CONTEXT_NAME) :
            this._bindingScope.getOrCreateSharedContextVar(0);
    }
    convertPropertyBinding(value) {
        const convertedPropertyBinding = convertPropertyBinding(this, this.getImplicitReceiverExpr(), value, this.bindingContext());
        const valExpr = convertedPropertyBinding.currValExpr;
        this._tempVariables.push(...convertedPropertyBinding.stmts);
        return valExpr;
    }
    /**
     * Gets a list of argument expressions to pass to an update instruction expression. Also updates
     * the temp variables state with temp variables that were identified as needing to be created
     * while visiting the arguments.
     * @param value The original expression we will be resolving an arguments list from.
     */
    getUpdateInstructionArguments(value) {
        const { args, stmts } = convertUpdateArguments(this, this.getImplicitReceiverExpr(), value, this.bindingContext());
        this._tempVariables.push(...stmts);
        return args;
    }
    /**
     * Creates and returns a variable that can be used to
     * store the state between control flow instructions.
     */
    allocateControlFlowTempVariable() {
        // Note: the assumption here is that we'll only need one temporary variable for all control
        // flow instructions. It's expected that any instructions will overwrite it before passing it
        // into the parameters.
        if (this._controlFlowTempVariable === null) {
            const name = `${this.contextName}_contFlowTmp`;
            this._tempVariables.push(new o.DeclareVarStmt(name));
            this._controlFlowTempVariable = o.variable(name);
        }
        return this._controlFlowTempVariable;
    }
    /**
     * Prepares all attribute expression values for the `TAttributes` array.
     *
     * The purpose of this function is to properly construct an attributes array that
     * is passed into the `elementStart` (or just `element`) functions. Because there
     * are many different types of attributes, the array needs to be constructed in a
     * special way so that `elementStart` can properly evaluate them.
     *
     * The format looks like this:
     *
     * ```
     * attrs = [prop, value, prop2, value2,
     *   PROJECT_AS, selector,
     *   CLASSES, class1, class2,
     *   STYLES, style1, value1, style2, value2,
     *   BINDINGS, name1, name2, name3,
     *   TEMPLATE, name4, name5, name6,
     *   I18N, name7, name8, ...]
     * ```
     *
     * Note that this function will fully ignore all synthetic (@foo) attribute values
     * because those values are intended to always be generated as property instructions.
     */
    getAttributeExpressions(elementName, renderAttributes, inputs, outputs, styles, templateAttrs = [], boundI18nAttrs = []) {
        const alreadySeen = new Set();
        const attrExprs = [];
        let ngProjectAsAttr;
        for (const attr of renderAttributes) {
            if (attr.name === NG_PROJECT_AS_ATTR_NAME) {
                ngProjectAsAttr = attr;
            }
            // Note that static i18n attributes aren't in the i18n array,
            // because they're treated in the same way as regular attributes.
            if (attr.i18n) {
                // When i18n attributes are present on elements with structural directives
                // (e.g. `<div *ngIf title="Hello" i18n-title>`), we want to avoid generating
                // duplicate i18n translation blocks for `ɵɵtemplate` and `ɵɵelement` instruction
                // attributes. So we do a cache lookup to see if suitable i18n translation block
                // already exists.
                const { i18nVarRefsCache } = this._constants;
                let i18nVarRef;
                if (i18nVarRefsCache.has(attr.i18n)) {
                    i18nVarRef = i18nVarRefsCache.get(attr.i18n);
                }
                else {
                    i18nVarRef = this.i18nTranslate(attr.i18n);
                    i18nVarRefsCache.set(attr.i18n, i18nVarRef);
                }
                attrExprs.push(o.literal(attr.name), i18nVarRef);
            }
            else {
                attrExprs.push(...getAttributeNameLiterals(attr.name), trustedConstAttribute(elementName, attr));
            }
        }
        // Keep ngProjectAs next to the other name, value pairs so we can verify that we match
        // ngProjectAs marker in the attribute name slot.
        if (ngProjectAsAttr) {
            attrExprs.push(...getNgProjectAsLiteral(ngProjectAsAttr));
        }
        function addAttrExpr(key, value) {
            if (typeof key === 'string') {
                if (!alreadySeen.has(key)) {
                    attrExprs.push(...getAttributeNameLiterals(key));
                    value !== undefined && attrExprs.push(value);
                    alreadySeen.add(key);
                }
            }
            else {
                attrExprs.push(o.literal(key));
            }
        }
        // it's important that this occurs before BINDINGS and TEMPLATE because once `elementStart`
        // comes across the BINDINGS or TEMPLATE markers then it will continue reading each value as
        // as single property value cell by cell.
        if (styles) {
            styles.populateInitialStylingAttrs(attrExprs);
        }
        if (inputs.length || outputs.length) {
            const attrsLengthBeforeInputs = attrExprs.length;
            for (let i = 0; i < inputs.length; i++) {
                const input = inputs[i];
                // We don't want the animation and attribute bindings in the
                // attributes array since they aren't used for directive matching.
                if (input.type !== 4 /* BindingType.Animation */ && input.type !== 1 /* BindingType.Attribute */) {
                    addAttrExpr(input.name);
                }
            }
            for (let i = 0; i < outputs.length; i++) {
                const output = outputs[i];
                if (output.type !== 1 /* ParsedEventType.Animation */) {
                    addAttrExpr(output.name);
                }
            }
            // this is a cheap way of adding the marker only after all the input/output
            // values have been filtered (by not including the animation ones) and added
            // to the expressions. The marker is important because it tells the runtime
            // code that this is where attributes without values start...
            if (attrExprs.length !== attrsLengthBeforeInputs) {
                attrExprs.splice(attrsLengthBeforeInputs, 0, o.literal(3 /* core.AttributeMarker.Bindings */));
            }
        }
        if (templateAttrs.length) {
            attrExprs.push(o.literal(4 /* core.AttributeMarker.Template */));
            templateAttrs.forEach(attr => addAttrExpr(attr.name));
        }
        if (boundI18nAttrs.length) {
            attrExprs.push(o.literal(6 /* core.AttributeMarker.I18n */));
            boundI18nAttrs.forEach(attr => addAttrExpr(attr.name));
        }
        return attrExprs;
    }
    addToConsts(expression) {
        if (o.isNull(expression)) {
            return o.TYPED_NULL_EXPR;
        }
        const consts = this._constants.constExpressions;
        // Try to reuse a literal that's already in the array, if possible.
        for (let i = 0; i < consts.length; i++) {
            if (consts[i].isEquivalent(expression)) {
                return o.literal(i);
            }
        }
        return o.literal(consts.push(expression) - 1);
    }
    addAttrsToConsts(attrs) {
        return attrs !== null && attrs.length > 0 ? this.addToConsts(o.literalArr(attrs)) :
            o.TYPED_NULL_EXPR;
    }
    prepareRefsArray(references) {
        if (!references || references.length === 0) {
            return o.TYPED_NULL_EXPR;
        }
        const refsParam = references.flatMap(reference => {
            const slot = this.allocateDataSlot();
            // Generate the update temporary.
            const variableName = this._bindingScope.freshReferenceName();
            const retrievalLevel = this.level;
            const lhs = o.variable(variableName);
            this._bindingScope.set(retrievalLevel, reference.name, lhs, 0 /* DeclarationPriority.DEFAULT */, (scope, relativeLevel) => {
                // e.g. nextContext(2);
                const nextContextStmt = relativeLevel > 0 ? [generateNextContextExpr(relativeLevel).toStmt()] : [];
                // e.g. const $foo$ = reference(1);
                const refExpr = lhs.set(o.importExpr(R3.reference).callFn([o.literal(slot)]));
                return nextContextStmt.concat(refExpr.toConstDecl());
            }, true);
            return [reference.name, reference.value];
        });
        return asLiteral(refsParam);
    }
    prepareListenerParameter(tagName, outputAst, index) {
        return () => {
            const eventName = outputAst.name;
            const bindingFnName = outputAst.type === 1 /* ParsedEventType.Animation */ ?
                // synthetic @listener.foo values are treated the exact same as are standard listeners
                prepareSyntheticListenerFunctionName(eventName, outputAst.phase) :
                sanitizeIdentifier(eventName);
            const handlerName = `${this.templateName}_${tagName}_${bindingFnName}_${index}_listener`;
            const scope = this._bindingScope.nestedScope(this._bindingScope.bindingLevel, EVENT_BINDING_SCOPE_GLOBALS);
            return prepareEventListenerParameters(outputAst, handlerName, scope);
        };
    }
}
export class ValueConverter extends AstMemoryEfficientTransformer {
    constructor(constantPool, allocateSlot, allocatePureFunctionSlots, definePipe) {
        super();
        this.constantPool = constantPool;
        this.allocateSlot = allocateSlot;
        this.allocatePureFunctionSlots = allocatePureFunctionSlots;
        this.definePipe = definePipe;
        this._pipeBindExprs = [];
    }
    // AstMemoryEfficientTransformer
    visitPipe(pipe, context) {
        // Allocate a slot to create the pipe
        const slot = this.allocateSlot();
        const slotPseudoLocal = `PIPE:${slot}`;
        // Allocate one slot for the result plus one slot per pipe argument
        const pureFunctionSlot = this.allocatePureFunctionSlots(2 + pipe.args.length);
        const target = new PropertyRead(pipe.span, pipe.sourceSpan, pipe.nameSpan, new ImplicitReceiver(pipe.span, pipe.sourceSpan), slotPseudoLocal);
        const { identifier, isVarLength } = pipeBindingCallInfo(pipe.args);
        this.definePipe(pipe.name, slotPseudoLocal, slot, o.importExpr(identifier));
        const args = [pipe.exp, ...pipe.args];
        const convertedArgs = isVarLength ?
            this.visitAll([new LiteralArray(pipe.span, pipe.sourceSpan, args)]) :
            this.visitAll(args);
        const pipeBindExpr = new Call(pipe.span, pipe.sourceSpan, target, [
            new LiteralPrimitive(pipe.span, pipe.sourceSpan, slot),
            new LiteralPrimitive(pipe.span, pipe.sourceSpan, pureFunctionSlot),
            ...convertedArgs,
        ], null);
        this._pipeBindExprs.push(pipeBindExpr);
        return pipeBindExpr;
    }
    updatePipeSlotOffsets(bindingSlots) {
        this._pipeBindExprs.forEach((pipe) => {
            // update the slot offset arg (index 1) to account for binding slots
            const slotOffset = pipe.args[1];
            slotOffset.value += bindingSlots;
        });
    }
    visitLiteralArray(array, context) {
        return new BuiltinFunctionCall(array.span, array.sourceSpan, this.visitAll(array.expressions), values => {
            // If the literal has calculated (non-literal) elements transform it into
            // calls to literal factories that compose the literal and will cache intermediate
            // values.
            const literal = o.literalArr(values);
            return getLiteralFactory(this.constantPool, literal, this.allocatePureFunctionSlots);
        });
    }
    visitLiteralMap(map, context) {
        return new BuiltinFunctionCall(map.span, map.sourceSpan, this.visitAll(map.values), values => {
            // If the literal has calculated (non-literal) elements  transform it into
            // calls to literal factories that compose the literal and will cache intermediate
            // values.
            const literal = o.literalMap(values.map((value, index) => ({ key: map.keys[index].key, value, quoted: map.keys[index].quoted })));
            return getLiteralFactory(this.constantPool, literal, this.allocatePureFunctionSlots);
        });
    }
}
// Pipes always have at least one parameter, the value they operate on
const pipeBindingIdentifiers = [R3.pipeBind1, R3.pipeBind2, R3.pipeBind3, R3.pipeBind4];
function pipeBindingCallInfo(args) {
    const identifier = pipeBindingIdentifiers[args.length];
    return {
        identifier: identifier || R3.pipeBindV,
        isVarLength: !identifier,
    };
}
const pureFunctionIdentifiers = [
    R3.pureFunction0, R3.pureFunction1, R3.pureFunction2, R3.pureFunction3, R3.pureFunction4,
    R3.pureFunction5, R3.pureFunction6, R3.pureFunction7, R3.pureFunction8
];
function pureFunctionCallInfo(args) {
    const identifier = pureFunctionIdentifiers[args.length];
    return {
        identifier: identifier || R3.pureFunctionV,
        isVarLength: !identifier,
    };
}
// e.g. x(2);
function generateNextContextExpr(relativeLevelDiff) {
    return o.importExpr(R3.nextContext)
        .callFn(relativeLevelDiff > 1 ? [o.literal(relativeLevelDiff)] : []);
}
function getLiteralFactory(constantPool, literal, allocateSlots) {
    const { literalFactory, literalFactoryArguments } = constantPool.getLiteralFactory(literal);
    // Allocate 1 slot for the result plus 1 per argument
    const startSlot = allocateSlots(1 + literalFactoryArguments.length);
    const { identifier, isVarLength } = pureFunctionCallInfo(literalFactoryArguments);
    // Literal factories are pure functions that only need to be re-invoked when the parameters
    // change.
    const args = [o.literal(startSlot), literalFactory];
    if (isVarLength) {
        args.push(o.literalArr(literalFactoryArguments));
    }
    else {
        args.push(...literalFactoryArguments);
    }
    return o.importExpr(identifier).callFn(args);
}
/**
 * Gets an array of literals that can be added to an expression
 * to represent the name and namespace of an attribute. E.g.
 * `:xlink:href` turns into `[AttributeMarker.NamespaceURI, 'xlink', 'href']`.
 *
 * @param name Name of the attribute, including the namespace.
 */
function getAttributeNameLiterals(name) {
    const [attributeNamespace, attributeName] = splitNsName(name);
    const nameLiteral = o.literal(attributeName);
    if (attributeNamespace) {
        return [
            o.literal(0 /* core.AttributeMarker.NamespaceURI */), o.literal(attributeNamespace), nameLiteral
        ];
    }
    return [nameLiteral];
}
/** The prefix used to get a shared context in BindingScope's map. */
const SHARED_CONTEXT_KEY = '$$shared_ctx$$';
export class BindingScope {
    static createRootScope() {
        return new BindingScope();
    }
    constructor(bindingLevel = 0, parent = null, globals) {
        this.bindingLevel = bindingLevel;
        this.parent = parent;
        this.globals = globals;
        /** Keeps a map from local variables to their BindingData. */
        this.map = new Map();
        this.referenceNameIndex = 0;
        this.restoreViewVariable = null;
        this.usesRestoredViewContext = false;
        if (globals !== undefined) {
            for (const name of globals) {
                this.set(0, name, o.variable(name));
            }
        }
    }
    get(name) {
        let current = this;
        while (current) {
            let value = current.map.get(name);
            if (value != null) {
                if (current !== this) {
                    // make a local copy and reset the `declare` state
                    value = {
                        retrievalLevel: value.retrievalLevel,
                        lhs: value.lhs,
                        declareLocalCallback: value.declareLocalCallback,
                        declare: false,
                        priority: value.priority
                    };
                    // Cache the value locally.
                    this.map.set(name, value);
                    // Possibly generate a shared context var
                    this.maybeGenerateSharedContextVar(value);
                    this.maybeRestoreView();
                }
                if (value.declareLocalCallback && !value.declare) {
                    value.declare = true;
                }
                return typeof value.lhs === 'function' ? value.lhs(this, value.retrievalLevel) : value.lhs;
            }
            current = current.parent;
        }
        // If we get to this point, we are looking for a property on the top level component
        // - If level === 0, we are on the top and don't need to re-declare `ctx`.
        // - If level > 0, we are in an embedded view. We need to retrieve the name of the
        // local var we used to store the component context, e.g. const $comp$ = x();
        return this.bindingLevel === 0 ? null : this.getComponentProperty(name);
    }
    /** Checks whether a variable exists locally on the current scope. */
    hasLocal(name) {
        return this.map.has(name);
    }
    /**
     * Create a local variable for later reference.
     *
     * @param retrievalLevel The level from which this value can be retrieved
     * @param name Name of the variable.
     * @param lhs AST representing the left hand side of the `let lhs = rhs;`.
     * @param priority The sorting priority of this var
     * @param declareLocalCallback The callback to invoke when declaring this local var
     * @param localRef Whether or not this is a local ref
     */
    set(retrievalLevel, name, lhs, priority = 0 /* DeclarationPriority.DEFAULT */, declareLocalCallback, localRef) {
        if (this.map.has(name)) {
            if (localRef) {
                // Do not throw an error if it's a local ref and do not update existing value,
                // so the first defined ref is always returned.
                return this;
            }
            error(`The name ${name} is already defined in scope to be ${this.map.get(name)}`);
        }
        this.map.set(name, {
            retrievalLevel: retrievalLevel,
            lhs: lhs,
            declare: false,
            declareLocalCallback: declareLocalCallback,
            priority: priority,
        });
        return this;
    }
    // Implemented as part of LocalResolver.
    getLocal(name) {
        return this.get(name);
    }
    // Implemented as part of LocalResolver.
    notifyImplicitReceiverUse() {
        if (this.bindingLevel !== 0) {
            // Since the implicit receiver is accessed in an embedded view, we need to
            // ensure that we declare a shared context variable for the current template
            // in the update variables.
            this.map.get(SHARED_CONTEXT_KEY + 0).declare = true;
        }
    }
    nestedScope(level, globals) {
        const newScope = new BindingScope(level, this, globals);
        if (level > 0)
            newScope.generateSharedContextVar(0);
        return newScope;
    }
    /**
     * Gets or creates a shared context variable and returns its expression. Note that
     * this does not mean that the shared variable will be declared. Variables in the
     * binding scope will be only declared if they are used.
     */
    getOrCreateSharedContextVar(retrievalLevel) {
        const bindingKey = SHARED_CONTEXT_KEY + retrievalLevel;
        if (!this.map.has(bindingKey)) {
            this.generateSharedContextVar(retrievalLevel);
        }
        // Shared context variables are always generated as "ReadVarExpr".
        return this.map.get(bindingKey).lhs;
    }
    getSharedContextName(retrievalLevel) {
        const sharedCtxObj = this.map.get(SHARED_CONTEXT_KEY + retrievalLevel);
        // Shared context variables are always generated as "ReadVarExpr".
        return sharedCtxObj && sharedCtxObj.declare ? sharedCtxObj.lhs : null;
    }
    maybeGenerateSharedContextVar(value) {
        if (value.priority === 1 /* DeclarationPriority.CONTEXT */ &&
            value.retrievalLevel < this.bindingLevel) {
            const sharedCtxObj = this.map.get(SHARED_CONTEXT_KEY + value.retrievalLevel);
            if (sharedCtxObj) {
                sharedCtxObj.declare = true;
            }
            else {
                this.generateSharedContextVar(value.retrievalLevel);
            }
        }
    }
    generateSharedContextVar(retrievalLevel) {
        const lhs = o.variable(CONTEXT_NAME + this.freshReferenceName());
        this.map.set(SHARED_CONTEXT_KEY + retrievalLevel, {
            retrievalLevel: retrievalLevel,
            lhs: lhs,
            declareLocalCallback: (scope, relativeLevel) => {
                // const ctx_r0 = nextContext(2);
                return [lhs.set(generateNextContextExpr(relativeLevel)).toConstDecl()];
            },
            declare: false,
            priority: 2 /* DeclarationPriority.SHARED_CONTEXT */,
        });
    }
    getComponentProperty(name) {
        const componentValue = this.map.get(SHARED_CONTEXT_KEY + 0);
        componentValue.declare = true;
        this.maybeRestoreView();
        const lhs = typeof componentValue.lhs === 'function' ?
            componentValue.lhs(this, componentValue.retrievalLevel) :
            componentValue.lhs;
        return name === DIRECT_CONTEXT_REFERENCE ? lhs : lhs.prop(name);
    }
    maybeRestoreView() {
        // View restoration is required for listener instructions inside embedded views, because
        // they only run in creation mode and they can have references to the context object.
        // If the context object changes in update mode, the reference will be incorrect, because
        // it was established during creation.
        if (this.isListenerScope()) {
            if (!this.parent.restoreViewVariable) {
                // parent saves variable to generate a shared `const $s$ = getCurrentView();` instruction
                this.parent.restoreViewVariable = o.variable(this.parent.freshReferenceName());
            }
            this.restoreViewVariable = this.parent.restoreViewVariable;
        }
    }
    restoreViewStatement() {
        if (this.restoreViewVariable) {
            const restoreCall = invokeInstruction(null, R3.restoreView, [this.restoreViewVariable]);
            // Either `const restoredCtx = restoreView($state$);` or `restoreView($state$);`
            // depending on whether it is being used.
            return this.usesRestoredViewContext ?
                o.variable(RESTORED_VIEW_CONTEXT_NAME).set(restoreCall).toConstDecl() :
                restoreCall.toStmt();
        }
        return null;
    }
    viewSnapshotStatements() {
        // const $state$ = getCurrentView();
        return this.restoreViewVariable ?
            [
                this.restoreViewVariable.set(invokeInstruction(null, R3.getCurrentView, [])).toConstDecl()
            ] :
            [];
    }
    isListenerScope() {
        return this.parent && this.parent.bindingLevel === this.bindingLevel;
    }
    variableDeclarations() {
        let currentContextLevel = 0;
        return Array.from(this.map.values())
            .filter(value => value.declare)
            .sort((a, b) => b.retrievalLevel - a.retrievalLevel || b.priority - a.priority)
            .reduce((stmts, value) => {
            const levelDiff = this.bindingLevel - value.retrievalLevel;
            const currStmts = value.declareLocalCallback(this, levelDiff - currentContextLevel);
            currentContextLevel = levelDiff;
            return stmts.concat(currStmts);
        }, []);
    }
    freshReferenceName() {
        let current = this;
        // Find the top scope as it maintains the global reference count
        while (current.parent)
            current = current.parent;
        const ref = `${REFERENCE_PREFIX}${current.referenceNameIndex++}`;
        return ref;
    }
    hasRestoreViewVariable() {
        return !!this.restoreViewVariable;
    }
    notifyRestoredViewContextUse() {
        this.usesRestoredViewContext = true;
    }
}
/** Binding scope of a `track` function inside a `for` loop block. */
class TrackByBindingScope extends BindingScope {
    constructor(parentScope, globalOverrides) {
        super(parentScope.bindingLevel + 1, parentScope);
        this.globalOverrides = globalOverrides;
        this.componentAccessCount = 0;
    }
    get(name) {
        // Intercept any overridden globals.
        if (this.globalOverrides.hasOwnProperty(name)) {
            return o.variable(this.globalOverrides[name]);
        }
        let current = this.parent;
        // Prevent accesses of template variables outside the `for` loop.
        while (current) {
            if (current.hasLocal(name)) {
                return null;
            }
            current = current.parent;
        }
        // When the component scope is accessed, we redirect it through `this`.
        this.componentAccessCount++;
        return o.variable('this').prop(name);
    }
    /** Gets the number of times the host component has been accessed through the scope. */
    getComponentAccessCount() {
        return this.componentAccessCount;
    }
}
/**
 * Creates an array of expressions out of an `ngProjectAs` attributes
 * which can be added to the instruction parameters.
 */
function getNgProjectAsLiteral(attribute) {
    // Parse the attribute value into a CssSelectorList. Note that we only take the
    // first selector, because we don't support multiple selectors in ngProjectAs.
    const parsedR3Selector = core.parseSelectorToR3Selector(attribute.value)[0];
    return [o.literal(5 /* core.AttributeMarker.ProjectAs */), asLiteral(parsedR3Selector)];
}
/**
 * Gets the instruction to generate for an interpolated property
 * @param interpolation An Interpolation AST
 */
function getPropertyInterpolationExpression(interpolation) {
    switch (getInterpolationArgsLength(interpolation)) {
        case 1:
            return R3.propertyInterpolate;
        case 3:
            return R3.propertyInterpolate1;
        case 5:
            return R3.propertyInterpolate2;
        case 7:
            return R3.propertyInterpolate3;
        case 9:
            return R3.propertyInterpolate4;
        case 11:
            return R3.propertyInterpolate5;
        case 13:
            return R3.propertyInterpolate6;
        case 15:
            return R3.propertyInterpolate7;
        case 17:
            return R3.propertyInterpolate8;
        default:
            return R3.propertyInterpolateV;
    }
}
/**
 * Gets the instruction to generate for an interpolated attribute
 * @param interpolation An Interpolation AST
 */
function getAttributeInterpolationExpression(interpolation) {
    switch (getInterpolationArgsLength(interpolation)) {
        case 3:
            return R3.attributeInterpolate1;
        case 5:
            return R3.attributeInterpolate2;
        case 7:
            return R3.attributeInterpolate3;
        case 9:
            return R3.attributeInterpolate4;
        case 11:
            return R3.attributeInterpolate5;
        case 13:
            return R3.attributeInterpolate6;
        case 15:
            return R3.attributeInterpolate7;
        case 17:
            return R3.attributeInterpolate8;
        default:
            return R3.attributeInterpolateV;
    }
}
/**
 * Gets the instruction to generate for interpolated text.
 * @param interpolation An Interpolation AST
 */
function getTextInterpolationExpression(interpolation) {
    switch (getInterpolationArgsLength(interpolation)) {
        case 1:
            return R3.textInterpolate;
        case 3:
            return R3.textInterpolate1;
        case 5:
            return R3.textInterpolate2;
        case 7:
            return R3.textInterpolate3;
        case 9:
            return R3.textInterpolate4;
        case 11:
            return R3.textInterpolate5;
        case 13:
            return R3.textInterpolate6;
        case 15:
            return R3.textInterpolate7;
        case 17:
            return R3.textInterpolate8;
        default:
            return R3.textInterpolateV;
    }
}
/**
 * Parse a template into render3 `Node`s and additional metadata, with no other dependencies.
 *
 * @param template text of the template to parse
 * @param templateUrl URL to use for source mapping of the parsed template
 * @param options options to modify how the template is parsed
 */
export function parseTemplate(template, templateUrl, options = {}) {
    const { interpolationConfig, preserveWhitespaces, enableI18nLegacyMessageIdFormat } = options;
    const bindingParser = makeBindingParser(interpolationConfig);
    const htmlParser = new HtmlParser();
    const parseResult = htmlParser.parse(template, templateUrl, {
        leadingTriviaChars: LEADING_TRIVIA_CHARS,
        ...options,
        tokenizeExpansionForms: true,
        tokenizeBlocks: options.enableBlockSyntax ?? true,
    });
    if (!options.alwaysAttemptHtmlToR3AstConversion && parseResult.errors &&
        parseResult.errors.length > 0) {
        const parsedTemplate = {
            interpolationConfig,
            preserveWhitespaces,
            errors: parseResult.errors,
            nodes: [],
            styleUrls: [],
            styles: [],
            ngContentSelectors: []
        };
        if (options.collectCommentNodes) {
            parsedTemplate.commentNodes = [];
        }
        return parsedTemplate;
    }
    let rootNodes = parseResult.rootNodes;
    // process i18n meta information (scan attributes, generate ids)
    // before we run whitespace removal process, because existing i18n
    // extraction process (ng extract-i18n) relies on a raw content to generate
    // message ids
    const i18nMetaVisitor = new I18nMetaVisitor(interpolationConfig, /* keepI18nAttrs */ !preserveWhitespaces, enableI18nLegacyMessageIdFormat);
    const i18nMetaResult = i18nMetaVisitor.visitAllWithErrors(rootNodes);
    if (!options.alwaysAttemptHtmlToR3AstConversion && i18nMetaResult.errors &&
        i18nMetaResult.errors.length > 0) {
        const parsedTemplate = {
            interpolationConfig,
            preserveWhitespaces,
            errors: i18nMetaResult.errors,
            nodes: [],
            styleUrls: [],
            styles: [],
            ngContentSelectors: []
        };
        if (options.collectCommentNodes) {
            parsedTemplate.commentNodes = [];
        }
        return parsedTemplate;
    }
    rootNodes = i18nMetaResult.rootNodes;
    if (!preserveWhitespaces) {
        rootNodes = html.visitAll(new WhitespaceVisitor(), rootNodes);
        // run i18n meta visitor again in case whitespaces are removed (because that might affect
        // generated i18n message content) and first pass indicated that i18n content is present in a
        // template. During this pass i18n IDs generated at the first pass will be preserved, so we can
        // mimic existing extraction process (ng extract-i18n)
        if (i18nMetaVisitor.hasI18nMeta) {
            rootNodes = html.visitAll(new I18nMetaVisitor(interpolationConfig, /* keepI18nAttrs */ false), rootNodes);
        }
    }
    const { nodes, errors, styleUrls, styles, ngContentSelectors, commentNodes } = htmlAstToRender3Ast(rootNodes, bindingParser, { collectCommentNodes: !!options.collectCommentNodes });
    errors.push(...parseResult.errors, ...i18nMetaResult.errors);
    const parsedTemplate = {
        interpolationConfig,
        preserveWhitespaces,
        errors: errors.length > 0 ? errors : null,
        nodes,
        styleUrls,
        styles,
        ngContentSelectors
    };
    if (options.collectCommentNodes) {
        parsedTemplate.commentNodes = commentNodes;
    }
    return parsedTemplate;
}
const elementRegistry = new DomElementSchemaRegistry();
/**
 * Construct a `BindingParser` with a default configuration.
 */
export function makeBindingParser(interpolationConfig = DEFAULT_INTERPOLATION_CONFIG) {
    return new BindingParser(new Parser(new Lexer()), interpolationConfig, elementRegistry, []);
}
export function resolveSanitizationFn(context, isAttribute) {
    switch (context) {
        case core.SecurityContext.HTML:
            return o.importExpr(R3.sanitizeHtml);
        case core.SecurityContext.SCRIPT:
            return o.importExpr(R3.sanitizeScript);
        case core.SecurityContext.STYLE:
            // the compiler does not fill in an instruction for [style.prop?] binding
            // values because the style algorithm knows internally what props are subject
            // to sanitization (only [attr.style] values are explicitly sanitized)
            return isAttribute ? o.importExpr(R3.sanitizeStyle) : null;
        case core.SecurityContext.URL:
            return o.importExpr(R3.sanitizeUrl);
        case core.SecurityContext.RESOURCE_URL:
            return o.importExpr(R3.sanitizeResourceUrl);
        default:
            return null;
    }
}
function trustedConstAttribute(tagName, attr) {
    const value = asLiteral(attr.value);
    if (isTrustedTypesSink(tagName, attr.name)) {
        switch (elementRegistry.securityContext(tagName, attr.name, /* isAttribute */ true)) {
            case core.SecurityContext.HTML:
                return o.taggedTemplate(o.importExpr(R3.trustConstantHtml), new o.TemplateLiteral([new o.TemplateLiteralElement(attr.value)], []), undefined, attr.valueSpan);
            // NB: no SecurityContext.SCRIPT here, as the corresponding tags are stripped by the compiler.
            case core.SecurityContext.RESOURCE_URL:
                return o.taggedTemplate(o.importExpr(R3.trustConstantResourceUrl), new o.TemplateLiteral([new o.TemplateLiteralElement(attr.value)], []), undefined, attr.valueSpan);
            default:
                return value;
        }
    }
    else {
        return value;
    }
}
function isSingleElementTemplate(children) {
    return children.length === 1 && children[0] instanceof t.Element;
}
function isTextNode(node) {
    return node instanceof t.Text || node instanceof t.BoundText || node instanceof t.Icu;
}
function isIframeElement(tagName) {
    return tagName.toLowerCase() === 'iframe';
}
function hasTextChildrenOnly(children) {
    return children.every(isTextNode);
}
function getBindingFunctionParams(deferredParams, name, eagerParams) {
    return () => {
        const value = deferredParams();
        const fnParams = Array.isArray(value) ? value : [value];
        if (eagerParams) {
            fnParams.push(...eagerParams);
        }
        if (name) {
            // We want the property name to always be the first function parameter.
            fnParams.unshift(o.literal(name));
        }
        return fnParams;
    };
}
/** Name of the global variable that is used to determine if we use Closure translations or not */
const NG_I18N_CLOSURE_MODE = 'ngI18nClosureMode';
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
 * @param transformFn Optional transformation function that will be applied to the translation (e.g.
 * post-processing).
 * @returns An array of statements that defined a given translation.
 */
export function getTranslationDeclStmts(message, variable, closureVar, params = {}, transformFn) {
    // Sort the map entries in the compiled output. This makes it easy to acheive identical output in
    // the template pipeline compiler.
    params = Object.fromEntries(Object.entries(params).sort());
    const statements = [
        declareI18nVariable(variable),
        o.ifStmt(createClosureModeGuard(), createGoogleGetMsgStatements(variable, message, closureVar, params), createLocalizeStatements(variable, message, formatI18nPlaceholderNamesInMap(params, /* useCamelCase */ false))),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVtcGxhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvcmVuZGVyMy92aWV3L3RlbXBsYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxtQkFBbUIsRUFBRSxvQkFBb0IsRUFBRSw4QkFBOEIsRUFBRSxzQkFBc0IsRUFBRSxpQ0FBaUMsRUFBRSxzQkFBc0IsRUFBZ0IsTUFBTSwwQ0FBMEMsQ0FBQztBQUVyTyxPQUFPLEtBQUssSUFBSSxNQUFNLFlBQVksQ0FBQztBQUNuQyxPQUFPLEVBQU0sNkJBQTZCLEVBQTRCLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxhQUFhLEVBQUUsWUFBWSxFQUFjLGdCQUFnQixFQUFtQixZQUFZLEVBQUMsTUFBTSw2QkFBNkIsQ0FBQztBQUMzTixPQUFPLEVBQUMsS0FBSyxFQUFDLE1BQU0sK0JBQStCLENBQUM7QUFDcEQsT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLGdDQUFnQyxDQUFDO0FBQ3RELE9BQU8sS0FBSyxJQUFJLE1BQU0scUJBQXFCLENBQUM7QUFDNUMsT0FBTyxLQUFLLElBQUksTUFBTSxxQkFBcUIsQ0FBQztBQUM1QyxPQUFPLEVBQUMsNEJBQTRCLEVBQXNCLE1BQU0sMEJBQTBCLENBQUM7QUFDM0YsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLDZCQUE2QixDQUFDO0FBQ3ZELE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLGtDQUFrQyxDQUFDO0FBRW5FLE9BQU8sRUFBQyxhQUFhLElBQUksa0JBQWtCLEVBQUUsV0FBVyxFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFDdEYsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQ2pELE9BQU8sS0FBSyxDQUFDLE1BQU0seUJBQXlCLENBQUM7QUFDN0MsT0FBTyxFQUE4QixrQkFBa0IsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBQ2pGLE9BQU8sRUFBQyx3QkFBd0IsRUFBQyxNQUFNLDBDQUEwQyxDQUFDO0FBQ2xGLE9BQU8sRUFBQyw2QkFBNkIsRUFBQyxNQUFNLGtDQUFrQyxDQUFDO0FBQy9FLE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLGtDQUFrQyxDQUFDO0FBRXBFLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxzQ0FBc0MsQ0FBQztBQUNuRSxPQUFPLEVBQUMsS0FBSyxFQUFFLGNBQWMsRUFBQyxNQUFNLFlBQVksQ0FBQztBQUNqRCxPQUFPLEtBQUssQ0FBQyxNQUFNLFdBQVcsQ0FBQztBQUMvQixPQUFPLEVBQUMsV0FBVyxJQUFJLEVBQUUsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ3BELE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLDBCQUEwQixDQUFDO0FBQzdELE9BQU8sRUFBQyxvQ0FBb0MsRUFBRSw0QkFBNEIsRUFBRSw0QkFBNEIsRUFBQyxNQUFNLFNBQVMsQ0FBQztBQUd6SCxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDM0MsT0FBTyxFQUFDLDRCQUE0QixFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFDbEUsT0FBTyxFQUFDLHdCQUF3QixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDL0QsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUM1QyxPQUFPLEVBQUMsNkJBQTZCLEVBQUUsdUJBQXVCLEVBQUUsbUJBQW1CLEVBQUUsK0JBQStCLEVBQUUseUJBQXlCLEVBQUUsV0FBVyxFQUFFLHVCQUF1QixFQUFFLGtCQUFrQixFQUFFLGNBQWMsRUFBRSxlQUFlLEVBQUUsb0JBQW9CLEVBQUUsc0JBQXNCLEVBQUUsbUJBQW1CLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDbFUsT0FBTyxFQUFDLGNBQWMsRUFBcUIsTUFBTSxtQkFBbUIsQ0FBQztBQUNyRSxPQUFPLEVBQUMsU0FBUyxFQUFFLFlBQVksRUFBRSx3QkFBd0IsRUFBRSx3QkFBd0IsRUFBRSwwQkFBMEIsRUFBRSxrQkFBa0IsRUFBa0MsT0FBTyxFQUFFLGlCQUFpQixFQUFFLGlCQUFpQixFQUFFLGdCQUFnQixFQUFFLFlBQVksRUFBRSwwQkFBMEIsRUFBRSxpQkFBaUIsRUFBQyxNQUFNLFFBQVEsQ0FBQztBQUlqVCw0Q0FBNEM7QUFDNUMsTUFBTSxzQkFBc0IsR0FBRyxRQUFRLENBQUM7QUFFeEMsbUNBQW1DO0FBQ25DLE1BQU0sdUJBQXVCLEdBQUcsYUFBYSxDQUFDO0FBRTlDLHVEQUF1RDtBQUN2RCxNQUFNLDJCQUEyQixHQUFHLElBQUksR0FBRyxDQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztBQUVoRSx5Q0FBeUM7QUFDekMsTUFBTSxvQkFBb0IsR0FBRyxhQUFhLENBQUM7QUFFM0MsdURBQXVEO0FBQ3ZELE1BQU0sdUJBQXVCLEdBQUcsSUFBSSxHQUFHLENBQ25DLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBRWhHLE1BQU0sQ0FBQyxNQUFNLG9CQUFvQixHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFFNUQsMEJBQTBCO0FBQzFCLE1BQU0sVUFBVSxxQkFBcUIsQ0FDakMsS0FBdUIsRUFBRSxVQUF5QjtJQUNwRCxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDbEcsQ0FBQztBQUVELE1BQU0sVUFBVSw4QkFBOEIsQ0FDMUMsUUFBc0IsRUFBRSxjQUEyQixJQUFJLEVBQ3ZELFFBQTJCLElBQUk7SUFDakMsTUFBTSxFQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUMsR0FBRyxRQUFRLENBQUM7SUFDdEQsSUFBSSxNQUFNLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztRQUNuRCxNQUFNLElBQUksS0FBSyxDQUFDLDZCQUE2QixNQUFNLGtCQUFrQixJQUFJOzRDQUNqQyxLQUFLLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3pGLENBQUM7SUFFRCxNQUFNLGlCQUFpQixHQUFHLFFBQVEsQ0FBQztJQUNuQyxNQUFNLHdCQUF3QixHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7SUFDbkQsTUFBTSxvQkFBb0IsR0FBRyxDQUFDLEtBQUssS0FBSyxJQUFJLElBQUksS0FBSyxDQUFDLFlBQVksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZFLENBQUMsQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztRQUMxQixLQUFLLENBQUMsMkJBQTJCLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDekMsTUFBTSxpQkFBaUIsR0FBRyxRQUFRLENBQUMsSUFBSSxtQ0FBMkIsQ0FBQyxDQUFDO1FBQ2hFLDhCQUE4QixDQUMxQixLQUFLLEVBQUUsb0JBQW9CLEVBQUUsT0FBTyxFQUFFLEdBQUcsRUFBRSxRQUFRLENBQUMsV0FBVyxFQUFFLHdCQUF3QixFQUN6RiwyQkFBMkIsQ0FBQyxDQUFDLENBQUM7UUFDbEMsb0JBQW9CLENBQ2hCLEtBQUssRUFBRSxvQkFBb0IsRUFBRSxPQUFPLEVBQUUsR0FBRyxFQUFFLFFBQVEsQ0FBQyxXQUFXLEVBQUUsd0JBQXdCLEVBQ3pGLDJCQUEyQixDQUFDLENBQUM7SUFDckMsTUFBTSxVQUFVLEdBQUcsRUFBRSxDQUFDO0lBQ3RCLE1BQU0sb0JBQW9CLEdBQUcsS0FBSyxFQUFFLG9CQUFvQixFQUFFLENBQUM7SUFDM0QsTUFBTSxvQkFBb0IsR0FBRyxLQUFLLEVBQUUsb0JBQW9CLEVBQUUsQ0FBQztJQUUzRCxJQUFJLG9CQUFvQixFQUFFLENBQUM7UUFDekIscURBQXFEO1FBQ3JELGdEQUFnRDtRQUNoRCxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsb0JBQW9CLENBQUMsQ0FBQztJQUMzQyxDQUFDO0lBRUQsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLGlCQUFpQixDQUFDLENBQUM7SUFFdEMsSUFBSSxvQkFBb0IsRUFBRSxDQUFDO1FBQ3pCLFVBQVUsQ0FBQyxPQUFPLENBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUV6Qyx3RkFBd0Y7UUFDeEYsdUZBQXVGO1FBQ3ZGLDZGQUE2RjtRQUM3RixNQUFNLGFBQWEsR0FBRyxVQUFVLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztRQUN4RCxJQUFJLGFBQWEsWUFBWSxDQUFDLENBQUMsZUFBZSxFQUFFLENBQUM7WUFDL0MsVUFBVSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsZUFBZSxDQUNyRCxpQkFBaUIsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsU0FBUyxFQUFFLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM5RixDQUFDO2FBQU0sQ0FBQztZQUNOLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsbUJBQW1CLENBQUMsaUJBQWlCLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3hGLENBQUM7SUFDSCxDQUFDO0lBRUQsTUFBTSxTQUFTLEdBQ1gsSUFBSSxzQ0FBOEIsQ0FBQyxDQUFDLENBQUMsNEJBQTRCLENBQUMsSUFBSSxFQUFFLEtBQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7SUFDM0YsTUFBTSxNQUFNLEdBQUcsV0FBVyxJQUFJLGtCQUFrQixDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQzlELE1BQU0sTUFBTSxHQUFnQixFQUFFLENBQUM7SUFFL0IsSUFBSSx3QkFBd0IsQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsRUFBRSxDQUFDO1FBQ3BELE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO0lBQ2hFLENBQUM7SUFFRCxNQUFNLFNBQVMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDLGFBQWEsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDMUUsTUFBTSxNQUFNLEdBQW1CLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztJQUNqRSxJQUFJLE1BQU0sRUFBRSxDQUFDO1FBQ1gsTUFBTSxDQUFDLElBQUksQ0FDUCxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFHLHlDQUF5QztRQUM1RCxDQUFDLENBQUMsVUFBVSxDQUFDLHVCQUF1QixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUUsQ0FBQyxDQUFDLENBQUM7SUFDMUQsQ0FBQztJQUNELE9BQU8sTUFBTSxDQUFDO0FBQ2hCLENBQUM7QUFzQkQsU0FBUyx3QkFBd0I7SUFDL0IsT0FBTztRQUNMLGlCQUFpQixFQUFFLEVBQUU7UUFDckIsZ0JBQWdCLEVBQUUsRUFBRTtRQUNwQixnQkFBZ0IsRUFBRSxJQUFJLEdBQUcsRUFBRTtLQUM1QixDQUFDO0FBQ0osQ0FBQztBQUVELE1BQU0sWUFBWTtJQUNoQixZQUNhLElBQVksRUFBVyxLQUFhLEVBQVcsS0FBbUIsRUFDbkUsT0FBa0M7UUFEakMsU0FBSSxHQUFKLElBQUksQ0FBUTtRQUFXLFVBQUssR0FBTCxLQUFLLENBQVE7UUFBVyxVQUFLLEdBQUwsS0FBSyxDQUFjO1FBQ25FLFlBQU8sR0FBUCxPQUFPLENBQTJCO0lBQUcsQ0FBQztJQUVsRCxhQUFhO1FBQ1gsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQ3RDLENBQUM7SUFFRCxXQUFXO1FBQ1QsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3BDLENBQUM7Q0FDRjtBQUVELE1BQU0sT0FBTyx5QkFBeUI7SUFtRXBDLFlBQ1ksWUFBMEIsRUFBRSxrQkFBZ0MsRUFBVSxRQUFRLENBQUMsRUFDL0UsV0FBd0IsRUFBVSxXQUE2QixFQUMvRCxhQUEwQixFQUFVLFlBQXlCLEVBQzdELFVBQStCLEVBQUUsdUJBQStCLEVBQ2hFLGtCQUEyQixFQUMzQixXQUF1RCxFQUN2RCxnQkFBZ0UsRUFDaEUsbUJBQXVDLEVBQ3ZDLGFBQWlDLHdCQUF3QixFQUFFO1FBUjNELGlCQUFZLEdBQVosWUFBWSxDQUFjO1FBQTRDLFVBQUssR0FBTCxLQUFLLENBQUk7UUFDL0UsZ0JBQVcsR0FBWCxXQUFXLENBQWE7UUFBVSxnQkFBVyxHQUFYLFdBQVcsQ0FBa0I7UUFDL0Qsa0JBQWEsR0FBYixhQUFhLENBQWE7UUFBVSxpQkFBWSxHQUFaLFlBQVksQ0FBYTtRQUM3RCxlQUFVLEdBQVYsVUFBVSxDQUFxQjtRQUMvQix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQVM7UUFDM0IsZ0JBQVcsR0FBWCxXQUFXLENBQTRDO1FBQ3ZELHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBZ0Q7UUFDaEUsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFvQjtRQUN2QyxlQUFVLEdBQVYsVUFBVSxDQUFpRDtRQTNFL0QsZUFBVSxHQUFHLENBQUMsQ0FBQztRQUNmLG9CQUFlLEdBQUcsQ0FBQyxDQUFDO1FBQ3BCLGdCQUFXLEdBQWtCLEVBQUUsQ0FBQztRQUN4Qzs7OztXQUlHO1FBQ0sscUJBQWdCLEdBQWtCLEVBQUUsQ0FBQztRQUM3Qzs7OztXQUlHO1FBQ0ssbUJBQWMsR0FBa0IsRUFBRSxDQUFDO1FBRTNDLDRDQUE0QztRQUNwQyxrQkFBYSxHQUFXLENBQUMsQ0FBQztRQUVsQyxvRkFBb0Y7UUFDNUUsbUJBQWMsR0FBa0IsRUFBRSxDQUFDO1FBRTNDOzs7V0FHRztRQUNLLDZCQUF3QixHQUF1QixJQUFJLENBQUM7UUFFNUQ7Ozs7O1dBS0c7UUFDSyx1QkFBa0IsR0FBbUIsRUFBRSxDQUFDO1FBUWhELHNDQUFzQztRQUM5QixTQUFJLEdBQXFCLElBQUksQ0FBQztRQUV0QywrQ0FBK0M7UUFDdkMsdUJBQWtCLEdBQUcsQ0FBQyxDQUFDO1FBRS9CLDBCQUEwQjtRQUNsQixrQkFBYSxHQUFHLENBQUMsQ0FBQztRQUkxQixvRkFBb0Y7UUFDcEYsNEVBQTRFO1FBQzVFLGdEQUFnRDtRQUN4Qyw0QkFBdUIsR0FBbUIsRUFBRSxDQUFDO1FBRXJELDZGQUE2RjtRQUM3RixxRkFBcUY7UUFDN0UsOEJBQXlCLEdBQUcsQ0FBQyxDQUFDO1FBRXRDLCtFQUErRTtRQUMvRSw2QkFBNkI7UUFDckIsMEJBQXFCLEdBQXVCLElBQUksQ0FBQztRQTB6QnpELCtEQUErRDtRQUN0RCxtQkFBYyxHQUFHLE9BQU8sQ0FBQztRQUN6QixrQkFBYSxHQUFHLE9BQU8sQ0FBQztRQUN4Qix1QkFBa0IsR0FBRyxPQUFPLENBQUM7UUFDN0Isd0JBQW1CLEdBQUcsT0FBTyxDQUFDO1FBQzlCLG9CQUFlLEdBQUcsT0FBTyxDQUFDO1FBQzFCLHlCQUFvQixHQUFHLE9BQU8sQ0FBQztRQUMvQiw0QkFBdUIsR0FBRyxPQUFPLENBQUM7UUFDbEMsOEJBQXlCLEdBQUcsT0FBTyxDQUFDO1FBQ3BDLGtDQUE2QixHQUFHLE9BQU8sQ0FBQztRQUN4Qyx1QkFBa0IsR0FBRyxPQUFPLENBQUM7UUFDN0IseUJBQW9CLEdBQUcsT0FBTyxDQUFDO1FBQy9CLDJCQUFzQixHQUFHLE9BQU8sQ0FBQztRQUNqQyxzQkFBaUIsR0FBRyxPQUFPLENBQUM7UUEzekJuQyxJQUFJLENBQUMsYUFBYSxHQUFHLGtCQUFrQixDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUUzRCx1RkFBdUY7UUFDdkYsK0JBQStCO1FBQy9CLElBQUksQ0FBQyxtQkFBbUIsR0FBRyx1QkFBdUIsQ0FBQyxPQUFPLENBQUMsZUFBZSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQztRQUV2RixJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksY0FBYyxDQUNyQyxZQUFZLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLEVBQzNDLENBQUMsUUFBZ0IsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLFFBQVEsQ0FBQyxFQUM5RCxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEtBQW1CLEVBQUUsRUFBRTtZQUM3QyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNyRCxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzlFLENBQUMsQ0FBQyxDQUFDO0lBQ1QsQ0FBQztJQUVELHFCQUFxQixDQUNqQixLQUFlLEVBQUUsU0FBdUIsRUFBRSwyQkFBbUMsQ0FBQyxFQUM5RSxJQUFvQixFQUFFLGVBQXdDO1FBQ2hFLElBQUksQ0FBQyx5QkFBeUIsR0FBRyx3QkFBd0IsQ0FBQztRQUUxRCxJQUFJLElBQUksQ0FBQyxVQUFVLEtBQUssRUFBRSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ3pDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ2xELENBQUM7UUFFRCwyQkFBMkI7UUFDM0IsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUNwQixNQUFNLEtBQUssR0FBRyxlQUFlLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDeEMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQy9DLElBQUksS0FBSyxFQUFFLENBQUM7Z0JBQ1YsSUFBSSxDQUFDLHdCQUF3QixDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDaEQsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO1FBRUgsaUNBQWlDO1FBQ2pDLDBDQUEwQztRQUMxQyxzREFBc0Q7UUFDdEQsb0VBQW9FO1FBQ3BFLE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxXQUFXO1lBQ3BDLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQztnQkFDOUMsQ0FBQyxDQUFDLHVCQUF1QixDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNsRSxNQUFNLDBCQUEwQixHQUFHLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzlELElBQUksZUFBZSxFQUFFLENBQUM7WUFDcEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsSUFBSyxFQUFFLDBCQUEwQixDQUFDLENBQUM7UUFDMUQsQ0FBQztRQUVELGdGQUFnRjtRQUNoRixvRkFBb0Y7UUFDcEYsc0ZBQXNGO1FBQ3RGLHdGQUF3RjtRQUN4RixDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixtRkFBbUY7UUFDbkYsaUZBQWlGO1FBQ2pGLElBQUksQ0FBQyxrQkFBa0IsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDO1FBRTlDLG9GQUFvRjtRQUNwRixrRkFBa0Y7UUFDbEYsMkJBQTJCO1FBQzNCLElBQUksQ0FBQyxlQUFlLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBRS9ELGdGQUFnRjtRQUNoRix1RUFBdUU7UUFDdkUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUM7UUFFdEUsb0ZBQW9GO1FBQ3BGLGlGQUFpRjtRQUNqRix3REFBd0Q7UUFDeEQsSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsdUJBQXVCLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDNUQsTUFBTSxVQUFVLEdBQW1CLEVBQUUsQ0FBQztZQUV0QyxnRkFBZ0Y7WUFDaEYsaUZBQWlGO1lBQ2pGLG1GQUFtRjtZQUNuRixJQUFJLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztnQkFDdkYsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLEdBQUcsQ0FDcEQsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM1RCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3ZGLENBQUM7WUFFRCw4RUFBOEU7WUFDOUUsZ0ZBQWdGO1lBQ2hGLGdDQUFnQztZQUNoQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxhQUFhLEVBQUUsVUFBVSxFQUFFLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNuRixDQUFDO1FBRUQsSUFBSSxlQUFlLEVBQUUsQ0FBQztZQUNwQixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSwwQkFBMEIsQ0FBQyxDQUFDO1FBQ2pELENBQUM7UUFFRCxtRkFBbUY7UUFDbkYsTUFBTSxrQkFBa0IsR0FBRyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUUzRSxxRkFBcUY7UUFDckYsTUFBTSxnQkFBZ0IsR0FBRyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7UUFFdkUsdUZBQXVGO1FBQ3ZGLDBDQUEwQztRQUMxQyxxRUFBcUU7UUFDckUsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLHNCQUFzQixFQUFFLENBQUM7UUFDdEUsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7UUFFOUYsTUFBTSxhQUFhLEdBQUcsa0JBQWtCLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ2pELENBQUMscUJBQXFCLGtDQUNPLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdFLEVBQUUsQ0FBQztRQUVQLE1BQU0sV0FBVyxHQUFHLGdCQUFnQixDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztZQUM3QyxDQUFDLHFCQUFxQixrQ0FBMEIsZUFBZSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVGLEVBQUUsQ0FBQztRQUVQLE9BQU8sQ0FBQyxDQUFDLEVBQUU7UUFDUCxtQ0FBbUM7UUFDbkMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQy9FO1lBQ0Usd0VBQXdFO1lBQ3hFLEdBQUcsSUFBSSxDQUFDLFdBQVc7WUFDbkIsNERBQTREO1lBQzVELEdBQUcsYUFBYTtZQUNoQixxRUFBcUU7WUFDckUsR0FBRyxXQUFXO1NBQ2YsRUFDRCxDQUFDLENBQUMsYUFBYSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDaEQsQ0FBQztJQUVELGdCQUFnQjtJQUNoQixRQUFRLENBQUMsSUFBWTtRQUNuQixPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3RDLENBQUM7SUFFRCxnQkFBZ0I7SUFDaEIseUJBQXlCO1FBQ3ZCLElBQUksQ0FBQyxhQUFhLENBQUMseUJBQXlCLEVBQUUsQ0FBQztJQUNqRCxDQUFDO0lBRUQsZ0JBQWdCO0lBQ2hCLGdCQUFnQjtRQUNkLElBQUksQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztJQUN4QyxDQUFDO0lBRU8sYUFBYSxDQUNqQixPQUFxQixFQUFFLFNBQXlDLEVBQUUsRUFBRSxHQUFtQixFQUN2RixXQUFrRDtRQUNwRCxNQUFNLElBQUksR0FBRyxHQUFHLElBQUksSUFBSSxDQUFDLHdCQUF3QixFQUFFLENBQUM7UUFDcEQsOEZBQThGO1FBQzlGLCtGQUErRjtRQUMvRixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzNELE1BQU0sVUFBVSxHQUFHLHVCQUF1QixDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQztRQUMzRixJQUFJLENBQUMsVUFBVSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxHQUFHLFVBQVUsQ0FBQyxDQUFDO1FBQ3RELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVPLHdCQUF3QixDQUFDLElBQVksRUFBRSxLQUFhO1FBQzFELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUMzRCxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ2xDLE1BQU0sUUFBUSxHQUFHLEtBQUssS0FBSyx3QkFBd0IsQ0FBQztRQUNwRCxNQUFNLEdBQUcsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxVQUFVLENBQUMsQ0FBQztRQUUxQyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FDbEIsY0FBYyxFQUFFLElBQUksRUFDcEIsS0FBSyxDQUFDLEVBQUU7WUFDTixxRkFBcUY7WUFDckYsdUZBQXVGO1lBQ3ZGLG9FQUFvRTtZQUNwRSxPQUFPLFFBQVEsSUFBSSxLQUFLLENBQUMsWUFBWSxLQUFLLGNBQWMsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDO2dCQUNsRixDQUFDLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7Z0JBQzFCLEdBQUcsQ0FBQztRQUNWLENBQUMsdUNBRUQsQ0FBQyxLQUFtQixFQUFFLGFBQXFCLEVBQUUsRUFBRTtZQUM3QyxJQUFJLEdBQWlCLENBQUM7WUFFdEIsSUFBSSxLQUFLLENBQUMsWUFBWSxLQUFLLGNBQWMsRUFBRSxDQUFDO2dCQUMxQyxJQUFJLEtBQUssQ0FBQyxlQUFlLEVBQUUsSUFBSSxLQUFLLENBQUMsc0JBQXNCLEVBQUUsRUFBRSxDQUFDO29CQUM5RCxvQkFBb0I7b0JBQ3BCLGlGQUFpRjtvQkFDakYsNkVBQTZFO29CQUM3RSwyRUFBMkU7b0JBQzNFLEdBQUcsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLDBCQUEwQixDQUFDLENBQUM7b0JBQzdDLEtBQUssQ0FBQyw0QkFBNEIsRUFBRSxDQUFDO2dCQUN2QyxDQUFDO3FCQUFNLElBQUksUUFBUSxFQUFFLENBQUM7b0JBQ3BCLDRFQUE0RTtvQkFDNUUseURBQXlEO29CQUN6RCxPQUFPLEVBQUUsQ0FBQztnQkFDWixDQUFDO3FCQUFNLENBQUM7b0JBQ04sV0FBVztvQkFDWCxHQUFHLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDakMsQ0FBQztZQUNILENBQUM7aUJBQU0sQ0FBQztnQkFDTixNQUFNLFlBQVksR0FBRyxLQUFLLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLENBQUM7Z0JBQ2hFLDBCQUEwQjtnQkFDMUIsR0FBRyxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyx1QkFBdUIsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUM3RSxDQUFDO1lBRUQsT0FBTztnQkFDTCw4REFBOEQ7Z0JBQzlELG1EQUFtRDtnQkFDbkQsR0FBRyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLElBQUksa0JBQWtCLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRTthQUM5RSxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUM7SUFDVCxDQUFDO0lBRU8sa0JBQWtCLENBQUMsV0FBa0I7UUFDM0MsSUFBSSxXQUFXLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQzNCLFdBQVcsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSyxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQzFFLENBQUM7SUFDSCxDQUFDO0lBRU8sYUFBYSxDQUFDLEtBQTBDO1FBQzlELE1BQU0sS0FBSyxHQUFrQyxFQUFFLENBQUM7UUFDaEQsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDL0IsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3hCLElBQUksSUFBSSxZQUFZLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDM0IsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3JDLENBQUM7aUJBQU0sQ0FBQztnQkFDTixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7Z0JBQ3JELElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDakMsSUFBSSxLQUFLLFlBQVksYUFBYSxFQUFFLENBQUM7b0JBQ25DLE1BQU0sRUFBQyxPQUFPLEVBQUUsV0FBVyxFQUFDLEdBQUcsS0FBSyxDQUFDO29CQUNyQyxNQUFNLEVBQUMsRUFBRSxFQUFFLFFBQVEsRUFBQyxHQUFHLElBQUksQ0FBQyxJQUFLLENBQUM7b0JBQ2xDLE1BQU0sS0FBSyxHQUFHLHVCQUF1QixDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO29CQUNsRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsV0FBVyxDQUFDLENBQUM7b0JBQ3JDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNoQyxDQUFDO1lBQ0gsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBRUQsNERBQTREO0lBQ3BELHdCQUF3QjtRQUM5QixPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDO0lBQzFFLENBQUM7SUFFRCwrRUFBK0U7SUFDdkUsc0JBQXNCLENBQUMsU0FBaUI7UUFDOUMsSUFBSSxJQUFZLENBQUM7UUFDakIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3RELElBQUksSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7WUFDNUIsTUFBTSxNQUFNLEdBQUcseUJBQXlCLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDdEQsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDMUQsSUFBSSxHQUFHLEdBQUcsTUFBTSxHQUFHLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxLQUFLLFlBQVksRUFBRSxDQUFDO1FBQ3RFLENBQUM7YUFBTSxDQUFDO1lBQ04sTUFBTSxNQUFNLEdBQUcseUJBQXlCLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDakQsSUFBSSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzlDLENBQUM7UUFDRCxPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDMUIsQ0FBQztJQUVPLGFBQWEsQ0FBQyxPQUFvQjtRQUN4QyxNQUFNLEVBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBQyxHQUFHLE9BQU8sQ0FBQztRQUM1RCxJQUFJLE1BQU0sSUFBSSxVQUFVLElBQUksQ0FBQyxTQUFTLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUNqRSxPQUFPLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztZQUN6QixNQUFNLFlBQVksR0FBRyxPQUFPLENBQUMseUJBQXlCLEVBQUUsQ0FBQztZQUN6RCxJQUFJLFVBQVUsR0FBbUMsRUFBRSxDQUFDO1lBQ3BELElBQUksTUFBTSxHQUNOLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDaEUsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQW9CLEVBQUUsR0FBVyxFQUFFLEVBQUU7b0JBQ2pELElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQzt3QkFDdEIseUNBQXlDO3dCQUN6QywwQ0FBMEM7d0JBQzFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3hCLENBQUM7eUJBQU0sQ0FBQzt3QkFDTixvREFBb0Q7d0JBQ3BELGlEQUFpRDt3QkFDakQsTUFBTSxXQUFXLEdBQVcsbUJBQW1CLENBQUMsR0FBRyx1QkFBdUIsR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDO3dCQUNwRixNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQzt3QkFDckMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ3ZDLENBQUM7Z0JBQ0gsQ0FBQyxDQUFDLENBQUM7WUFDTCxDQUFDO1lBRUQsbURBQW1EO1lBQ25ELHNGQUFzRjtZQUN0RixxRUFBcUU7WUFDckUsTUFBTSxtQkFBbUIsR0FDckIsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFlLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO2dCQUM3RSxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLE1BQU0sQ0FBQztZQUVuQyxJQUFJLFdBQVcsQ0FBQztZQUNoQixJQUFJLG1CQUFtQixFQUFFLENBQUM7Z0JBQ3hCLFdBQVcsR0FBRyxDQUFDLEdBQWtCLEVBQUUsRUFBRTtvQkFDbkMsTUFBTSxJQUFJLEdBQW1CLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQ25DLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQzt3QkFDbkMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7b0JBQzFDLENBQUM7b0JBQ0QsT0FBTyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDM0QsQ0FBQyxDQUFDO1lBQ0osQ0FBQztZQUNELElBQUksQ0FBQyxhQUFhLENBQUMsSUFBb0IsRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLEdBQUcsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUM3RSxDQUFDO0lBQ0gsQ0FBQztJQUVPLFNBQVMsQ0FBQyxPQUE2QixJQUFJLEVBQUUsSUFBbUIsRUFBRSxXQUFxQjtRQUU3RixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUN0QyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUMxQixJQUFJLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsYUFBYyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDckUsSUFBSSxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRXpGLGlDQUFpQztRQUNqQyxNQUFNLEVBQUMsRUFBRSxFQUFFLEdBQUcsRUFBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDNUIsTUFBTSxNQUFNLEdBQW1CLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDekUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDWCwwQ0FBMEM7WUFDMUMsaURBQWlEO1lBQ2pELE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzdCLENBQUM7UUFDRCxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUMvRSxDQUFDO0lBRU8sT0FBTyxDQUFDLE9BQTZCLElBQUksRUFBRSxXQUFxQjtRQUN0RSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2YsTUFBTSxJQUFJLEtBQUssQ0FBQyxrREFBa0QsQ0FBQyxDQUFDO1FBQ3RFLENBQUM7UUFFRCxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNyQixJQUFJLENBQUMsV0FBVyxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNsRCxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUN2QyxDQUFDO2FBQU0sQ0FBQztZQUNOLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2hDLENBQUM7UUFFRCw2QkFBNkI7UUFDN0IsTUFBTSxFQUFDLEtBQUssRUFBRSxRQUFRLEVBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3BDLElBQUksUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2xCLEtBQUssTUFBTSxPQUFPLElBQUksUUFBUSxFQUFFLENBQUM7Z0JBQy9CLDRGQUE0RjtnQkFDNUYseUZBQXlGO2dCQUN6RiwyRUFBMkU7Z0JBQzNFLElBQUksQ0FBQyw0QkFBNEIsQ0FDN0IsSUFBSSxDQUFDLGFBQWEsRUFBRSxHQUFHLENBQUMsRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUM5RixDQUFDO1lBRUQsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDakUsQ0FBQztRQUNELElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNqQixJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM3QyxDQUFDO1FBQ0QsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBRSwyQkFBMkI7SUFDaEQsQ0FBQztJQUVPLHlCQUF5QixDQUM3QixTQUFpQixFQUFFLEtBQXlCLEVBQUUsVUFBMkI7UUFDM0UsSUFBSSxXQUFXLEdBQUcsS0FBSyxDQUFDO1FBQ3hCLE1BQU0sWUFBWSxHQUFtQixFQUFFLENBQUM7UUFDeEMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNuQixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBcUIsQ0FBQztZQUMzQyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDekQsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3JDLElBQUksU0FBUyxZQUFZLGFBQWEsRUFBRSxDQUFDO2dCQUN2QyxNQUFNLFlBQVksR0FBRyw2QkFBNkIsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDNUQsTUFBTSxNQUFNLEdBQUcsb0JBQW9CLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQ2xELFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFDN0UsU0FBUyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUU7b0JBQ3pDLFdBQVcsR0FBRyxJQUFJLENBQUM7b0JBQ25CLElBQUksQ0FBQyw0QkFBNEIsQ0FDN0IsU0FBUyxFQUFFLFVBQVUsRUFBRSxFQUFFLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO2dCQUN4RixDQUFDLENBQUMsQ0FBQztZQUNMLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUNILElBQUksWUFBWSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUM1QixNQUFNLEtBQUssR0FBaUIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDO1lBQy9ELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1lBQ2hFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLGNBQWMsRUFBRSxDQUFDLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQzdFLElBQUksV0FBVyxFQUFFLENBQUM7Z0JBQ2hCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDNUQsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0lBRU8sdUJBQXVCLENBQUMsWUFBeUI7UUFDdkQsUUFBUSxZQUFZLEVBQUUsQ0FBQztZQUNyQixLQUFLLE1BQU07Z0JBQ1QsT0FBTyxFQUFFLENBQUMsZUFBZSxDQUFDO1lBQzVCLEtBQUssS0FBSztnQkFDUixPQUFPLEVBQUUsQ0FBQyxZQUFZLENBQUM7WUFDekI7Z0JBQ0UsT0FBTyxFQUFFLENBQUMsYUFBYSxDQUFDO1FBQzVCLENBQUM7SUFDSCxDQUFDO0lBRU8sdUJBQXVCLENBQUMsYUFBa0MsRUFBRSxPQUFrQjtRQUNwRixJQUFJLENBQUMsVUFBVSxHQUFHLGFBQWEsQ0FBQztRQUNoQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBRSxhQUFhLENBQUMsQ0FBQztJQUNuRSxDQUFDO0lBRUQ7OztPQUdHO0lBQ0ssNkJBQTZCLENBQ2pDLFdBQWdDLEVBQUUsWUFBb0IsRUFBRSxRQUFnQixFQUN4RSxLQUF1QixFQUFFLEtBQW9CLEVBQUUsTUFBYTtRQUM5RCxJQUFJLENBQUMsNEJBQTRCLENBQzdCLFlBQVksRUFBRSxLQUFLLENBQUMsVUFBVSxFQUFFLFdBQVcsRUFDM0MsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLDZCQUE2QixDQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUM1RixDQUFDO0lBRUQsWUFBWSxDQUFDLFNBQW9CO1FBQy9CLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQ3JDLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxNQUFNLENBQUM7UUFDL0YsTUFBTSxVQUFVLEdBQW1CLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBRXJELElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRXRELE1BQU0sMEJBQTBCLEdBQzVCLFNBQVMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsS0FBSyxzQkFBc0IsQ0FBQyxDQUFDO1FBQzVGLE1BQU0sVUFBVSxHQUNaLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLDBCQUEwQixFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUVyRixJQUFJLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDMUIsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQzFFLENBQUM7YUFBTSxJQUFJLGlCQUFpQixLQUFLLENBQUMsRUFBRSxDQUFDO1lBQ25DLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7UUFDaEQsQ0FBQztRQUVELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDMUUsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDZCxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxJQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDcEQsQ0FBQztJQUNILENBQUM7SUFFRCxZQUFZLENBQUMsT0FBa0I7UUFDN0IsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFDN0MsTUFBTSxjQUFjLEdBQUcsSUFBSSxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDaEQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsRUFBQyxLQUFLLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFDLENBQUMsQ0FBQztRQUU3RSxJQUFJLGlCQUFpQixHQUFZLEtBQUssQ0FBQztRQUN2QyxNQUFNLGlCQUFpQixHQUNuQixjQUFjLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVuRSxNQUFNLFdBQVcsR0FBc0IsRUFBRSxDQUFDO1FBQzFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsV0FBVyxDQUFDLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM5RCxNQUFNLGFBQWEsR0FBRyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFdkQsaURBQWlEO1FBQ2pELEtBQUssTUFBTSxJQUFJLElBQUksT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ3RDLE1BQU0sRUFBQyxJQUFJLEVBQUUsS0FBSyxFQUFDLEdBQUcsSUFBSSxDQUFDO1lBQzNCLElBQUksSUFBSSxLQUFLLGlCQUFpQixFQUFFLENBQUM7Z0JBQy9CLGlCQUFpQixHQUFHLElBQUksQ0FBQztZQUMzQixDQUFDO2lCQUFNLElBQUksSUFBSSxLQUFLLE9BQU8sRUFBRSxDQUFDO2dCQUM1QixjQUFjLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDMUMsQ0FBQztpQkFBTSxJQUFJLElBQUksS0FBSyxPQUFPLEVBQUUsQ0FBQztnQkFDNUIsY0FBYyxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzFDLENBQUM7aUJBQU0sQ0FBQztnQkFDTixXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3pCLENBQUM7UUFDSCxDQUFDO1FBRUQsZ0RBQWdEO1FBQ2hELE1BQU0sVUFBVSxHQUFtQixDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztRQUM3RCxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDbkIsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7UUFDMUMsQ0FBQztRQUVELHFCQUFxQjtRQUNyQixNQUFNLGNBQWMsR0FBdUIsRUFBRSxDQUFDO1FBQzlDLE1BQU0sY0FBYyxHQUF1QixFQUFFLENBQUM7UUFFOUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDN0IsTUFBTSxrQkFBa0IsR0FBRyxjQUFjLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDcEUsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7Z0JBQ3hCLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxpQ0FBeUIsSUFBSSxLQUFLLENBQUMsSUFBSSwrQkFBdUIsQ0FBQztvQkFDMUUsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO29CQUNmLGNBQWMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzdCLENBQUM7cUJBQU0sQ0FBQztvQkFDTixjQUFjLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUM3QixDQUFDO1lBQ0gsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO1FBRUgsZ0VBQWdFO1FBQ2hFLE1BQU0sVUFBVSxHQUFtQixJQUFJLENBQUMsdUJBQXVCLENBQzNELE9BQU8sQ0FBQyxJQUFJLEVBQUUsV0FBVyxFQUFFLGNBQWMsRUFBRSxPQUFPLENBQUMsT0FBTyxFQUFFLGNBQWMsRUFBRSxFQUFFLEVBQzlFLGNBQWMsQ0FBQyxDQUFDO1FBQ3BCLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFFbkQsMENBQTBDO1FBQzFDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDdkQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFFeEMsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUN2QyxNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUVwRSx3RUFBd0U7UUFDeEUsMkJBQTJCO1FBQzNCLElBQUksZ0JBQWdCLEtBQUssY0FBYyxFQUFFLENBQUM7WUFDeEMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLGdCQUFnQixFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzFELENBQUM7UUFFRCxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNkLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFLLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDdkQsQ0FBQztRQUVELGtGQUFrRjtRQUNsRiw0RUFBNEU7UUFDNUUsTUFBTSxXQUFXLEdBQUcsQ0FBQyxDQUFDLGlCQUFpQixJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUN4QyxPQUFPLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFFcEYsTUFBTSw0QkFBNEIsR0FBRyxDQUFDLGNBQWMsQ0FBQyxvQkFBb0I7WUFDckUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLGNBQWMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQ2hGLE1BQU0sZ0NBQWdDLEdBQ2xDLENBQUMsNEJBQTRCLElBQUksbUJBQW1CLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRTNFLElBQUksNEJBQTRCLEVBQUUsQ0FBQztZQUNqQyxJQUFJLENBQUMsbUJBQW1CLENBQ3BCLE9BQU8sQ0FBQyxVQUFVLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQ3BFLGlCQUFpQixDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFDckMsQ0FBQzthQUFNLENBQUM7WUFDTixJQUFJLENBQUMsbUJBQW1CLENBQ3BCLE9BQU8sQ0FBQyxlQUFlLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQ25GLGlCQUFpQixDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFFbkMsSUFBSSxpQkFBaUIsRUFBRSxDQUFDO2dCQUN0QixJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBRSxFQUFFLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDeEUsQ0FBQztZQUVELElBQUksY0FBYyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDOUIsSUFBSSxDQUFDLHlCQUF5QixDQUMxQixZQUFZLEVBQUUsY0FBYyxFQUFFLE9BQU8sQ0FBQyxlQUFlLElBQUksT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ25GLENBQUM7WUFFRCwrQkFBK0I7WUFDL0IsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDL0IsS0FBSyxNQUFNLFNBQVMsSUFBSSxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7b0JBQ3hDLElBQUksQ0FBQyxtQkFBbUIsQ0FDcEIsU0FBUyxDQUFDLFVBQVUsRUFDcEIsU0FBUyxDQUFDLElBQUksbUNBQTJCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQzNFLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDO2dCQUM1RSxDQUFDO1lBQ0gsQ0FBQztZQUVELG9GQUFvRjtZQUNwRix5RkFBeUY7WUFDekYsSUFBSSxpQkFBaUIsRUFBRSxDQUFDO2dCQUN0QixJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxlQUFlLEVBQUUsT0FBTyxDQUFDLElBQUssRUFBRSxnQ0FBZ0MsQ0FBQyxDQUFDO1lBQzNGLENBQUM7UUFDSCxDQUFDO1FBRUQsdUZBQXVGO1FBQ3ZGLGlGQUFpRjtRQUNqRixzQ0FBc0M7UUFDdEMsb0RBQW9EO1FBQ3BELE1BQU0sbUJBQW1CLEdBQUcsY0FBYyxDQUFDLDRCQUE0QixDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUM5RixNQUFNLEtBQUssR0FBRyxtQkFBbUIsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQzdDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUNoQyxNQUFNLFdBQVcsR0FBRyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMzQyxJQUFJLENBQUMsYUFBYSxJQUFJLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxZQUFZLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDeEYsQ0FBQztRQUVELG1GQUFtRjtRQUNuRixrRUFBa0U7UUFDbEUsd0RBQXdEO1FBQ3hELE1BQU0seUJBQXlCLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN2RCxNQUFNLGdCQUFnQixHQUFrQixFQUFFLENBQUM7UUFDM0MsTUFBTSxpQkFBaUIsR0FBcUMsRUFBRSxDQUFDO1FBRS9ELGtDQUFrQztRQUNsQyxjQUFjLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQzdCLE1BQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUM7WUFDN0IsSUFBSSxTQUFTLGtDQUEwQixFQUFFLENBQUM7Z0JBQ3hDLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztnQkFDdEQsZ0VBQWdFO2dCQUNoRSx5QkFBeUI7Z0JBQ3pCLCtDQUErQztnQkFDL0MsZ0JBQWdCO2dCQUNoQixjQUFjO2dCQUNkLHFFQUFxRTtnQkFDckUsaUVBQWlFO2dCQUNqRSxrRUFBa0U7Z0JBQ2xFLGdCQUFnQjtnQkFDaEIsTUFBTSxRQUFRLEdBQUcsS0FBSyxZQUFZLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO2dCQUMxRSxJQUFJLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBRWpDLGdCQUFnQixDQUFDLElBQUksQ0FBQztvQkFDcEIsSUFBSSxFQUFFLEtBQUssQ0FBQyxVQUFVO29CQUN0QixTQUFTLEVBQUUsRUFBRSxDQUFDLFFBQVE7b0JBQ3RCLFVBQVUsRUFBRSx3QkFBd0IsQ0FDaEMsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLHlCQUF5QixFQUMvRSw0QkFBNEIsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQzlDLENBQUMsQ0FBQztZQUNMLENBQUM7aUJBQU0sQ0FBQztnQkFDTiwyRkFBMkY7Z0JBQzNGLHdGQUF3RjtnQkFDeEYsSUFBSSxLQUFLLENBQUMsSUFBSTtvQkFBRSxPQUFPO2dCQUV2QixNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7Z0JBQ3RELElBQUksS0FBSyxLQUFLLFNBQVMsRUFBRSxDQUFDO29CQUN4QixNQUFNLE1BQU0sR0FBVSxFQUFFLENBQUM7b0JBQ3pCLE1BQU0sQ0FBQyxhQUFhLEVBQUUsUUFBUSxDQUFDLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDMUQsTUFBTSxrQkFBa0IsR0FBRyxTQUFTLGtDQUEwQixDQUFDO29CQUMvRCxJQUFJLGVBQWUsR0FBRyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsZUFBZSxFQUFFLGtCQUFrQixDQUFDLENBQUM7b0JBQ3ZGLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQzt3QkFDckIsNEVBQTRFO3dCQUM1RSxzRUFBc0U7d0JBQ3RFLDBFQUEwRTt3QkFDMUUsb0NBQW9DO3dCQUNwQyxJQUFJLGVBQWUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksNkJBQTZCLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7NEJBQy9FLGVBQWUsR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO3dCQUM3RCxDQUFDO29CQUNILENBQUM7b0JBQ0QsSUFBSSxlQUFlLEVBQUUsQ0FBQzt3QkFDcEIsTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztvQkFDL0IsQ0FBQztvQkFDRCxJQUFJLGFBQWEsRUFBRSxDQUFDO3dCQUNsQixNQUFNLGdCQUFnQixHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7d0JBRWxELElBQUksZUFBZSxFQUFFLENBQUM7NEJBQ3BCLE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzt3QkFDaEMsQ0FBQzs2QkFBTSxDQUFDOzRCQUNOLHFEQUFxRDs0QkFDckQsdURBQXVEOzRCQUN2RCxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQzt3QkFDakQsQ0FBQztvQkFDSCxDQUFDO29CQUNELElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFFakMsc0VBQXNFO29CQUN0RSx5REFBeUQ7b0JBQ3pELElBQUksU0FBUyxpQ0FBeUIsSUFBSSxTQUFTLCtCQUF1QixFQUFFLENBQUM7d0JBQzNFLElBQUksS0FBSyxZQUFZLGFBQWEsRUFBRSxDQUFDOzRCQUNuQywrQkFBK0I7NEJBQy9CLElBQUksQ0FBQyw2QkFBNkIsQ0FDOUIsa0NBQWtDLENBQUMsS0FBSyxDQUFDLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUMvRSxNQUFNLENBQUMsQ0FBQzt3QkFDZCxDQUFDOzZCQUFNLENBQUM7NEJBQ04saUJBQWlCOzRCQUNqQixxRkFBcUY7NEJBQ3JGLGdCQUFnQixDQUFDLElBQUksQ0FBQztnQ0FDcEIsSUFBSSxFQUFFLEtBQUssQ0FBQyxVQUFVO2dDQUN0QixTQUFTLEVBQUUsU0FBUywrQkFBdUIsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLFFBQVE7Z0NBQzdFLFVBQVUsRUFBRSx3QkFBd0IsQ0FDaEMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLEtBQUssQ0FBQyxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUM7NkJBQ2hFLENBQUMsQ0FBQzt3QkFDTCxDQUFDO29CQUNILENBQUM7eUJBQU0sSUFBSSxTQUFTLGtDQUEwQixFQUFFLENBQUM7d0JBQy9DLElBQUksS0FBSyxZQUFZLGFBQWEsSUFBSSwwQkFBMEIsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQzs0QkFDNUUsd0NBQXdDOzRCQUN4QyxJQUFJLENBQUMsNkJBQTZCLENBQzlCLG1DQUFtQyxDQUFDLEtBQUssQ0FBQyxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFDaEYsTUFBTSxDQUFDLENBQUM7d0JBQ2QsQ0FBQzs2QkFBTSxDQUFDOzRCQUNOLE1BQU0sVUFBVSxHQUFHLEtBQUssWUFBWSxhQUFhLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQzs0QkFDakYsK0NBQStDOzRCQUMvQyx5RUFBeUU7NEJBQ3pFLGlCQUFpQixDQUFDLElBQUksQ0FBQztnQ0FDckIsSUFBSSxFQUFFLEtBQUssQ0FBQyxVQUFVO2dDQUN0QixVQUFVLEVBQUUsd0JBQXdCLENBQ2hDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxVQUFVLENBQUMsRUFBRSxRQUFRLEVBQUUsTUFBTSxDQUFDOzZCQUNyRSxDQUFDLENBQUM7d0JBQ0wsQ0FBQztvQkFDSCxDQUFDO3lCQUFNLENBQUM7d0JBQ04sYUFBYTt3QkFDYixJQUFJLENBQUMsNEJBQTRCLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLFNBQVMsRUFBRSxHQUFHLEVBQUU7NEJBQ25GLE9BQU87Z0NBQ0wsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxLQUFLLENBQUM7Z0NBQ2hGLEdBQUcsTUFBTTs2QkFDVixDQUFDO3dCQUNKLENBQUMsQ0FBQyxDQUFDO29CQUNMLENBQUM7Z0JBQ0gsQ0FBQztZQUNILENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUVILEtBQUssTUFBTSxlQUFlLElBQUksZ0JBQWdCLEVBQUUsQ0FBQztZQUMvQyxJQUFJLENBQUMsNEJBQTRCLENBQzdCLFlBQVksRUFBRSxlQUFlLENBQUMsSUFBSSxFQUFFLGVBQWUsQ0FBQyxTQUFTLEVBQzdELGVBQWUsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNsQyxDQUFDO1FBRUQsS0FBSyxNQUFNLGdCQUFnQixJQUFJLGlCQUFpQixFQUFFLENBQUM7WUFDakQsSUFBSSxDQUFDLDRCQUE0QixDQUM3QixZQUFZLEVBQUUsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxTQUFTLEVBQUUsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDdEYsQ0FBQztRQUVELCtCQUErQjtRQUMvQixDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFbkMsSUFBSSxDQUFDLGlCQUFpQixJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNwQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSyxFQUFFLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM3RCxDQUFDO1FBRUQsSUFBSSxDQUFDLDRCQUE0QixFQUFFLENBQUM7WUFDbEMsb0NBQW9DO1lBQ3BDLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxhQUFhLElBQUksT0FBTyxDQUFDLFVBQVUsQ0FBQztZQUN6RCxJQUFJLGlCQUFpQixFQUFFLENBQUM7Z0JBQ3RCLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLGdDQUFnQyxDQUFDLENBQUM7WUFDdkQsQ0FBQztZQUNELElBQUksaUJBQWlCLEVBQUUsQ0FBQztnQkFDdEIsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDcEQsQ0FBQztZQUNELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN6RixDQUFDO0lBQ0gsQ0FBQztJQUVPLHlCQUF5QixDQUM3QixRQUFrQixFQUFFLGlCQUF5QixFQUFFLFlBQTBCLEVBQUUsRUFDM0UsUUFBd0IsRUFBRSxlQUF3QztRQUNwRSxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUV0QyxJQUFJLElBQUksQ0FBQyxJQUFJLElBQUksUUFBUSxFQUFFLENBQUM7WUFDMUIsSUFBSSxRQUFRLFlBQVksSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7Z0JBQzlDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUN6QyxDQUFDO2lCQUFNLENBQUM7Z0JBQ04sSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQzVDLENBQUM7UUFDSCxDQUFDO1FBRUQsTUFBTSxXQUFXLEdBQUcsR0FBRyxJQUFJLENBQUMsV0FBVyxHQUFHLGlCQUFpQixJQUFJLEtBQUssRUFBRSxDQUFDO1FBQ3ZFLHNGQUFzRjtRQUN0Riw2RkFBNkY7UUFDN0YsTUFBTSxJQUFJLEdBQ04sSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsR0FBRyxXQUFXLFdBQVcsRUFBRSwwQkFBMEIsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUU5RiwrQkFBK0I7UUFDL0IsTUFBTSxPQUFPLEdBQUcsSUFBSSx5QkFBeUIsQ0FDekMsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxFQUFFLFdBQVcsRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQzFGLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixFQUFFLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsV0FBVyxFQUNwRixJQUFJLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUV0RSx5RkFBeUY7UUFDekYsMkZBQTJGO1FBQzNGLHFGQUFxRjtRQUNyRixtRkFBbUY7UUFDbkYsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDaEMsTUFBTSxvQkFBb0IsR0FBRyxPQUFPLENBQUMscUJBQXFCLENBQ3RELFFBQVEsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLHVCQUF1QixDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMseUJBQXlCLEVBQ3pGLFFBQVEsRUFBRSxlQUFlLENBQUMsQ0FBQztZQUMvQixJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDekUsSUFBSSxPQUFPLENBQUMsdUJBQXVCLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQzNDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsdUJBQXVCLENBQUMsQ0FBQztZQUN4RSxDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPLElBQUksWUFBWSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsT0FBTyxDQUFDLGFBQWEsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUN2RSxDQUFDO0lBRU8sd0JBQXdCLENBQzVCLE9BQW9CLEVBQUUsUUFBa0IsRUFBRSxpQkFBeUIsRUFDbkUsVUFBMkIsRUFBRSxZQUEwQixFQUFFLEVBQUUsVUFBMkIsRUFDdEYsVUFBMEIsRUFBRSxJQUFvQjtRQUNsRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMseUJBQXlCLENBQUMsUUFBUSxFQUFFLGlCQUFpQixFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMxRixNQUFNLFVBQVUsR0FBbUI7WUFDakMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBQ3JCLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztZQUNyQixDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQztZQUNsQixJQUFJLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQztTQUMxQyxDQUFDO1FBRUYsdUNBQXVDO1FBQ3ZDLElBQUksVUFBVSxJQUFJLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDeEMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQy9DLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3hDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDO1FBQ3pELENBQUM7UUFFRCxzQ0FBc0M7UUFDdEMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsY0FBYyxFQUFFLEdBQUcsRUFBRTtZQUMzRCxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDeEYsT0FBTyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN2QyxDQUFDLENBQUMsQ0FBQztRQUVILE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztJQUNwQixDQUFDO0lBRUQsYUFBYSxDQUFDLFFBQW9CO1FBQ2hDLGlFQUFpRTtRQUNqRSxnRUFBZ0U7UUFDaEUsTUFBTSx1QkFBdUIsR0FDekIsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQztRQUMzRSxNQUFNLGlCQUFpQixHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUU3RixrRkFBa0Y7UUFDbEYsTUFBTSxVQUFVLEdBQW1CLElBQUksQ0FBQyx1QkFBdUIsQ0FDM0Qsb0JBQW9CLEVBQUUsUUFBUSxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxPQUFPLEVBQzVFLFNBQVMsQ0FBQyxZQUFZLEVBQUUsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBRXBELE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FDL0MsdUJBQXVCLEVBQUUsUUFBUSxDQUFDLFFBQVEsRUFBRSxpQkFBaUIsRUFBRSxRQUFRLENBQUMsVUFBVSxFQUNsRixRQUFRLENBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRSxRQUFRLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUV4RSx5RUFBeUU7UUFDekUsSUFBSSxDQUFDLHdCQUF3QixDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUM7UUFFckUsd0ZBQXdGO1FBQ3hGLElBQUksdUJBQXVCLEtBQUssb0JBQW9CLEVBQUUsQ0FBQztZQUNyRCxNQUFNLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxHQUN0QixjQUFjLENBQXFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFFckYsNEZBQTRGO1lBQzVGLDhGQUE4RjtZQUM5Riw2RkFBNkY7WUFDN0YsNEJBQTRCO1lBQzVCLElBQUksVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDMUIsSUFBSSxDQUFDLHlCQUF5QixDQUMxQixhQUFhLEVBQUUsVUFBVSxFQUFFLFFBQVEsQ0FBQyxlQUFlLElBQUksUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ2xGLENBQUM7WUFFRCx5QkFBeUI7WUFDekIsSUFBSSxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUN0QixJQUFJLENBQUMsd0JBQXdCLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ3ZELENBQUM7WUFFRCwwQ0FBMEM7WUFDMUMsS0FBSyxNQUFNLFNBQVMsSUFBSSxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ3pDLElBQUksQ0FBQyxtQkFBbUIsQ0FDcEIsU0FBUyxDQUFDLFVBQVUsRUFDcEIsU0FBUyxDQUFDLElBQUksbUNBQTJCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQzNFLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxhQUFhLEVBQUUsU0FBUyxFQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUM7WUFDOUUsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0lBaUJELGNBQWMsQ0FBQyxJQUFpQjtRQUM5QixJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNkLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUNyRCxJQUFJLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDakMsSUFBSSxLQUFLLFlBQVksYUFBYSxFQUFFLENBQUM7Z0JBQ25DLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFLLENBQUMsQ0FBQztnQkFDdEMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUM3QyxDQUFDO1lBQ0QsT0FBTztRQUNULENBQUM7UUFFRCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUUxQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFM0UsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ3JELElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUVqQyxJQUFJLEtBQUssWUFBWSxhQUFhLEVBQUUsQ0FBQztZQUNuQyxJQUFJLENBQUMsNEJBQTRCLENBQzdCLFNBQVMsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLDhCQUE4QixDQUFDLEtBQUssQ0FBQyxFQUNqRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsNkJBQTZCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUN2RCxDQUFDO2FBQU0sQ0FBQztZQUNOLEtBQUssQ0FBQyw2REFBNkQsQ0FBQyxDQUFDO1FBQ3ZFLENBQUM7SUFDSCxDQUFDO0lBRUQsU0FBUyxDQUFDLElBQVk7UUFDcEIsdURBQXVEO1FBQ3ZELDZEQUE2RDtRQUM3RCxxRUFBcUU7UUFDckUsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNmLElBQUksQ0FBQyxtQkFBbUIsQ0FDcEIsSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM3RixDQUFDO0lBQ0gsQ0FBQztJQUVELFFBQVEsQ0FBQyxHQUFVO1FBQ2pCLElBQUksY0FBYyxHQUFHLEtBQUssQ0FBQztRQUUzQiw4REFBOEQ7UUFDOUQsK0RBQStEO1FBQy9ELDBEQUEwRDtRQUMxRCxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2YsY0FBYyxHQUFHLElBQUksQ0FBQztZQUN0QixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsSUFBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3hDLENBQUM7UUFFRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSyxDQUFDO1FBQ3hCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzFDLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBRTFELHdEQUF3RDtRQUN4RCxNQUFNLE9BQU8sR0FBRyxHQUFHLENBQUMsSUFBcUIsQ0FBQztRQUUxQyx1RUFBdUU7UUFDdkUsdUZBQXVGO1FBQ3ZGLDJGQUEyRjtRQUMzRixlQUFlO1FBQ2YseUZBQXlGO1FBQ3pGLE1BQU0sV0FBVyxHQUFHLENBQUMsR0FBa0IsRUFBRSxFQUFFO1lBQ3pDLDhGQUE4RjtZQUM5RixxQ0FBcUM7WUFDckMsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUMsR0FBRyxJQUFJLEVBQUUsR0FBRyxZQUFZLEVBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7WUFDckYsTUFBTSxTQUFTLEdBQUcsK0JBQStCLENBQUMsTUFBTSxFQUFFLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3BGLE9BQU8saUJBQWlCLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxHQUFHLEVBQUUsVUFBVSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekYsQ0FBQyxDQUFDO1FBRUYscUVBQXFFO1FBQ3JFLDJFQUEyRTtRQUMzRSw0Q0FBNEM7UUFDNUMsdUZBQXVGO1FBQ3ZGLDRFQUE0RTtRQUM1RSxJQUFJLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUMvQixJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxrQkFBa0IsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUM1RSxDQUFDO2FBQU0sQ0FBQztZQUNOLHdEQUF3RDtZQUN4RCxNQUFNLEdBQUcsR0FDTCxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxrQkFBa0IsQ0FBQyxFQUFFLEVBQUUsU0FBUyxDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUN6RixJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztRQUN4RCxDQUFDO1FBRUQsSUFBSSxjQUFjLEVBQUUsQ0FBQztZQUNuQixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMzQixDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQsWUFBWSxDQUFDLEtBQWdCO1FBQzNCLHNEQUFzRDtRQUN0RCxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFaEMsMkZBQTJGO1FBQzNGLHlGQUF5RjtRQUN6RixzQ0FBc0M7UUFDdEMsTUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsV0FBVyxFQUFFLEVBQUU7WUFDNUQsTUFBTSxFQUFDLFVBQVUsRUFBRSxlQUFlLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBQyxHQUFHLE1BQU0sQ0FBQztZQUVuRSxxRkFBcUY7WUFDckYsMEZBQTBGO1lBQzFGLDRCQUE0QjtZQUM1QixNQUFNLFNBQVMsR0FBRyxlQUFlLEtBQUssSUFBSSxDQUFDLENBQUM7Z0JBQ3hDLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUNYLGVBQWUsQ0FBQyxJQUFJLEVBQUUsd0JBQXdCLEVBQUUsZUFBZSxDQUFDLFVBQVUsRUFDMUUsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDL0IsU0FBUyxDQUFDO1lBRWQsSUFBSSxPQUFPLEdBQWdCLElBQUksQ0FBQztZQUNoQyxJQUFJLFVBQW9DLENBQUM7WUFFekMsNEVBQTRFO1lBQzVFLGtGQUFrRjtZQUNsRixJQUFJLFdBQVcsS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDdEIsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLHFDQUFxQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUN4RSxPQUFPLEdBQUcsWUFBWSxDQUFDLE9BQU8sQ0FBQztnQkFDL0IsVUFBVSxHQUFHLFlBQVksQ0FBQyxVQUFVLENBQUM7WUFDdkMsQ0FBQztZQUVELDZFQUE2RTtZQUM3RSxrRUFBa0U7WUFDbEUsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUMvQyxPQUFPLEVBQUUsUUFBUSxFQUFFLGNBQWMsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQy9FLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNqQixNQUFNLG1CQUFtQixHQUNyQixVQUFVLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQ3hFLE9BQU8sRUFBQyxLQUFLLEVBQUUsYUFBYSxFQUFFLFVBQVUsRUFBRSxtQkFBbUIsRUFBRSxLQUFLLEVBQUUsZUFBZSxFQUFDLENBQUM7UUFDekYsQ0FBQyxDQUFDLENBQUM7UUFFSCwwRUFBMEU7UUFDMUUsTUFBTSxjQUFjLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUMzQyxNQUFNLGNBQWMsR0FBRyxHQUFHLEVBQUU7WUFDMUIsSUFBSSxlQUFlLEdBQXVCLElBQUksQ0FBQztZQUMvQyxNQUFNLGNBQWMsR0FBRyxDQUFDLFdBQW1CLEVBQWdCLEVBQUU7Z0JBQzNELHdGQUF3RjtnQkFDeEYsdUZBQXVGO2dCQUN2RixrRUFBa0U7Z0JBQ2xFLElBQUksV0FBVyxHQUFHLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7b0JBQ3hDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN2QixDQUFDO2dCQUVELE1BQU0sRUFBQyxLQUFLLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBQyxHQUFHLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFFM0Qsd0VBQXdFO2dCQUN4RSx5RUFBeUU7Z0JBQ3pFLGtEQUFrRDtnQkFDbEQsSUFBSSxVQUFVLEtBQUssSUFBSSxFQUFFLENBQUM7b0JBQ3hCLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDMUIsQ0FBQztnQkFFRCxJQUFJLGdCQUE4QixDQUFDO2dCQUVuQyxJQUFJLEtBQUssRUFBRSxDQUFDO29CQUNWLG9GQUFvRjtvQkFDcEYseUVBQXlFO29CQUN6RSxxREFBcUQ7b0JBQ3JELE1BQU07b0JBQ04sWUFBWTtvQkFDWixxREFBcUQ7b0JBQ3JELE1BQU07b0JBQ04sZUFBZSxHQUFHLElBQUksQ0FBQywrQkFBK0IsRUFBRSxDQUFDO29CQUN6RCxnQkFBZ0IsR0FBRyxlQUFlLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO2dCQUNsRixDQUFDO3FCQUFNLENBQUM7b0JBQ04sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUM3RCxDQUFDO2dCQUVELE9BQU8sZ0JBQWdCLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsY0FBYyxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pGLENBQUMsQ0FBQztZQUVGLE1BQU0sTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUU5RCxJQUFJLGVBQWUsS0FBSyxJQUFJLEVBQUUsQ0FBQztnQkFDN0IsTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUMvQixDQUFDO1lBRUQsT0FBTyxNQUFNLENBQUM7UUFDaEIsQ0FBQyxDQUFDO1FBRUYsSUFBSSxDQUFDLDRCQUE0QixDQUM3QixjQUFjLEVBQUUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLFdBQVcsRUFBRSxjQUFjLENBQUMsQ0FBQztJQUNwRixDQUFDO0lBRUQsZ0JBQWdCLENBQUMsS0FBb0I7UUFDbkMsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUM3QixPQUFPO1FBQ1QsQ0FBQztRQUVELDJGQUEyRjtRQUMzRiwrRkFBK0Y7UUFDL0YsTUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLEVBQUU7WUFDN0MsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUN2QyxJQUFJLEVBQUUsV0FBVyxDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsV0FBVyxDQUFDLFVBQVUsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUNqRixTQUFTLEVBQUUsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2pDLE1BQU0sVUFBVSxHQUFHLFdBQVcsQ0FBQyxVQUFVLEtBQUssSUFBSSxDQUFDLENBQUM7Z0JBQ2hELElBQUksQ0FBQyxDQUFDO2dCQUNOLFdBQVcsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUN2RCxPQUFPLEVBQUMsS0FBSyxFQUFFLFVBQVUsRUFBQyxDQUFDO1FBQzdCLENBQUMsQ0FBQyxDQUFDO1FBRUgsMEVBQTBFO1FBQzFFLE1BQU0sY0FBYyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFFekMsbUVBQW1FO1FBQ25FLGtFQUFrRTtRQUNsRSxNQUFNLGVBQWUsR0FBRyxLQUFLLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDckUsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUUsb0RBQW9EO1FBRXRGLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxjQUFjLEVBQUUsS0FBSyxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsV0FBVyxFQUFFLEdBQUcsRUFBRTtZQUN2RixNQUFNLGFBQWEsR0FBRyxDQUFDLFNBQWlCLEVBQWdCLEVBQUU7Z0JBQ3hELDhEQUE4RDtnQkFDOUQsbURBQW1EO2dCQUNuRCxJQUFJLFNBQVMsR0FBRyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO29CQUNwQyxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdkIsQ0FBQztnQkFFRCxNQUFNLEVBQUMsS0FBSyxFQUFFLFVBQVUsRUFBQyxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFFaEQsd0VBQXdFO2dCQUN4RSx5RUFBeUU7Z0JBQ3pFLGtEQUFrRDtnQkFDbEQsSUFBSSxVQUFVLEtBQUssSUFBSSxFQUFFLENBQUM7b0JBQ3hCLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDMUIsQ0FBQztnQkFFRCxtRkFBbUY7Z0JBQ25GLDBGQUEwRjtnQkFDMUYseUJBQXlCO2dCQUN6QixNQUFNO2dCQUNOLFlBQVk7Z0JBQ1osb0ZBQW9GO2dCQUNwRixNQUFNO2dCQUNOLE1BQU0sZ0JBQWdCLEdBQUcsU0FBUyxLQUFLLENBQUMsQ0FBQyxDQUFDO29CQUN0QyxJQUFJLENBQUMsK0JBQStCLEVBQUUsQ0FBQyxHQUFHLENBQ3RDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ25ELElBQUksQ0FBQywrQkFBK0IsRUFBRSxDQUFDO2dCQUUzQyxPQUFPLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsVUFBVSxDQUFDLENBQUM7cUJBQ3JFLFdBQVcsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLGFBQWEsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNuRSxDQUFDLENBQUM7WUFFRixPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsRUFBRSxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2RCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxrQkFBa0IsQ0FBQyxRQUF5QjtRQUMxQyxNQUFNLEVBQUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLGdCQUFnQixFQUFDLEdBQUcsUUFBUSxDQUFDO1FBQzNFLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRWhELElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNkLE1BQU0sSUFBSSxLQUFLLENBQUMsMEVBQTBFLENBQUMsQ0FBQztRQUM5RixDQUFDO1FBRUQsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLENBQUMsd0JBQXdCLENBQ3RELElBQUksRUFBRSxRQUFRLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUMsVUFBVSxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUN2RixRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbkIsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQ3pCLElBQUksRUFBRSxPQUFPLENBQUMsUUFBUSxFQUFFLGVBQWUsRUFBRSxPQUFPLENBQUMsVUFBVSxFQUMzRCxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNwRCxJQUFJLENBQUM7UUFDcEMsTUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLENBQUM7WUFDM0IsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNuRixJQUFJLENBQUM7UUFFVCxNQUFNLGdCQUFnQixHQUFHLFdBQVcsQ0FBQyxDQUFDO1lBQ2xDLElBQUksQ0FBQyx3QkFBd0IsQ0FDekIsSUFBSSxFQUFFLFdBQVcsQ0FBQyxRQUFRLEVBQUUsbUJBQW1CLEVBQUUsV0FBVyxDQUFDLFVBQVUsRUFBRSxTQUFTLEVBQ2xGLFNBQVMsRUFBRSxTQUFTLEVBQUUsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDN0MsSUFBSSxDQUFDO1FBQ1QsTUFBTSxpQkFBaUIsR0FBRyxXQUFXLElBQUksV0FBVyxDQUFDLFdBQVcsS0FBSyxJQUFJLENBQUMsQ0FBQztZQUN2RSwyRkFBMkY7WUFDM0YsMkRBQTJEO1lBQzNELENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwRCxJQUFJLENBQUM7UUFFVCxNQUFNLFVBQVUsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FDekIsSUFBSSxFQUFFLEtBQUssQ0FBQyxRQUFRLEVBQUUsYUFBYSxFQUFFLEtBQUssQ0FBQyxVQUFVLEVBQUUsU0FBUyxFQUNoRSxTQUFTLEVBQUUsU0FBUyxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3ZDLElBQUksQ0FBQztRQUVoQywwRUFBMEU7UUFDMUUsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFDOUMsTUFBTSxVQUFVLEdBQUcsR0FBRyxJQUFJLENBQUMsV0FBVyxVQUFVLGFBQWEsU0FBUyxDQUFDO1FBRXZFLGlEQUFpRDtRQUNqRCxJQUFJLENBQUMsbUJBQW1CLENBQ3BCLFFBQVEsQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxpQkFBaUIsQ0FBQztZQUMvQyxDQUFDLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQztZQUN4QixDQUFDLENBQUMsT0FBTyxDQUFDLG9CQUFvQixDQUFDO1lBQy9CLElBQUksQ0FBQyxtQkFBbUIsSUFBSSxJQUFJLENBQUMsMEJBQTBCLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQztZQUNqRixDQUFDLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQztZQUN2QixDQUFDLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDO1lBQzNCLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDO1lBQ3JCLGFBQWEsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsZUFBZTtZQUN6RixpQkFBaUIsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsZUFBZTtZQUMzRSxDQUFDLGFBQWEsRUFBRSxNQUFNLElBQUksaUJBQWlCLENBQUMsQ0FBQyxDQUFDO2dCQUMxQyxDQUFDLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLENBQUM7Z0JBQzdDLENBQUMsQ0FBQyxlQUFlO1NBQ3RCLENBQUMsQ0FBQyxDQUFDO1FBRVIsc0VBQXNFO1FBQ3RFLDBEQUEwRDtRQUMxRCxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUV4Qix5RUFBeUU7UUFDekUsa0VBQWtFO1FBQ2xFLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxhQUFhLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM5RSxJQUFJLENBQUMsOEJBQThCLENBQUMsYUFBYSxFQUFFLGdCQUFnQixFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN2RixDQUFDO0lBRU8sMEJBQTBCLENBQUMsSUFBWSxFQUFFLFFBQThCO1FBQzdFLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDL0IsT0FBTyxDQUFDLENBQUMsZUFBZSxDQUFDO1FBQzNCLENBQUM7UUFFRCwyRUFBMkU7UUFDM0UsTUFBTSxhQUFhLEdBQW1CLEVBQUUsQ0FBQztRQUV6QyxLQUFLLE1BQU0sV0FBVyxJQUFJLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUN4QyxJQUFJLFdBQVcsQ0FBQyxZQUFZLEVBQUUsQ0FBQztnQkFDN0IsOENBQThDO2dCQUM5QyxNQUFNLE9BQU8sR0FBRyxDQUFDLENBQUMsT0FBTyxDQUNyQixDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUNwQyxzRUFBc0U7Z0JBQ3RFLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7Z0JBRTVGLGtEQUFrRDtnQkFDbEQsTUFBTSxVQUFVLEdBQ1osQ0FBQyxJQUFJLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsVUFBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztnQkFDdEYsYUFBYSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNqQyxDQUFDO2lCQUFNLENBQUM7Z0JBQ04sMkRBQTJEO2dCQUMzRCxhQUFhLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN2QyxDQUFDO1FBQ0gsQ0FBQztRQUVELE1BQU0sVUFBVSxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztRQUU5RCxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBRXJGLE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMxQixDQUFDO0lBRU8sOEJBQThCLENBQ2xDLGFBQXFCLEVBQUUsUUFBaUMsRUFBRSxRQUE4QixFQUN4RixRQUFpQjtRQUNuQixNQUFNLEVBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFDLEdBQUcsUUFBUSxDQUFDO1FBRTlFLDZCQUE2QjtRQUM3QixJQUFJLElBQUksRUFBRSxDQUFDO1lBQ1QsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQ3JELElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNqQyxJQUFJLENBQUMsNEJBQTRCLENBQzdCLGFBQWEsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUM5RSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNoRCxDQUFDO1FBRUQsdUZBQXVGO1FBQ3ZGLGtCQUFrQjtRQUNsQixJQUFJLElBQUksSUFBSSxDQUFDLENBQUMsUUFBUSxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDOUQsSUFBSSxDQUFDLG1CQUFtQixDQUNwQixJQUFJLEVBQUUsVUFBVSxJQUFJLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3BGLENBQUM7UUFFRCx1QkFBdUI7UUFDdkIsSUFBSSxTQUFTLEVBQUUsQ0FBQztZQUNkLElBQUksQ0FBQyxtQkFBbUIsQ0FDcEIsU0FBUyxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDMUYsQ0FBQztRQUVELHVCQUF1QjtRQUN2QixJQUFJLEtBQUssRUFBRSxDQUFDO1lBQ1YsSUFBSSxDQUFDLG1CQUFtQixDQUNwQixLQUFLLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsWUFBWSxFQUN0RSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNoQyxDQUFDO1FBRUQscUNBQXFDO1FBQ3JDLElBQUksS0FBSyxFQUFFLENBQUM7WUFDVixJQUFJLENBQUMsbUJBQW1CLENBQ3BCLE9BQU8sRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDdEYsQ0FBQztRQUVELDJDQUEyQztRQUMzQyxJQUFJLFdBQVcsRUFBRSxDQUFDO1lBQ2hCLElBQUksQ0FBQyxtQkFBbUIsQ0FDcEIsYUFBYSxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQ3BDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLDBCQUEwQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUN4RSxDQUFDO1FBRUQsd0NBQXdDO1FBQ3hDLElBQUksUUFBUSxFQUFFLENBQUM7WUFDYixJQUFJLENBQUMsbUJBQW1CLENBQ3BCLFVBQVUsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUM5QixRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ2xFLENBQUM7SUFDSCxDQUFDO0lBRU8sbUJBQW1CLENBQ3ZCLElBQVksRUFDWixPQUFzRixFQUN0RixRQUE4QixFQUFFLGNBQW1DO1FBQ3JFLE1BQU0sU0FBUyxHQUFHLFFBQVEsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRXhELDJEQUEyRDtRQUMzRCw2REFBNkQ7UUFDN0QsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ2YsT0FBTztRQUNULENBQUM7UUFFRCxJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxjQUFjLEVBQUUsR0FBRyxFQUFFO1lBQ2hFLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFdEQsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUNkLE1BQU0sSUFBSSxLQUFLLENBQ1gsd0RBQXdEO29CQUN4RCxJQUFJLElBQUksdURBQXVELENBQUMsQ0FBQztZQUN2RSxDQUFDO1lBRUQscUVBQXFFO1lBQ3JFLGdFQUFnRTtZQUNoRSxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hELE1BQU0sTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUUzQyxxRkFBcUY7WUFDckYsbUZBQW1GO1lBQ25GLElBQUksS0FBSyxLQUFLLENBQUMsRUFBRSxDQUFDO2dCQUNoQixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUNoQyxDQUFDO1lBRUQsT0FBTyxNQUFNLENBQUM7UUFDaEIsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNLLHFDQUFxQyxDQUFDLElBQ21CO1FBQy9ELElBQUksSUFBSSxHQUE4QixJQUFJLENBQUM7UUFDM0MsSUFBSSxPQUFPLEdBQWdCLElBQUksQ0FBQztRQUNoQyxJQUFJLFVBQW9DLENBQUM7UUFFekMsS0FBSyxNQUFNLEtBQUssSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDbEMsMkJBQTJCO1lBQzNCLElBQUksS0FBSyxZQUFZLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDL0IsU0FBUztZQUNYLENBQUM7WUFFRCwyRUFBMkU7WUFDM0UsSUFBSSxJQUFJLEtBQUssSUFBSSxFQUFFLENBQUM7Z0JBQ2xCLElBQUksR0FBRyxJQUFJLENBQUM7Z0JBQ1osTUFBTTtZQUNSLENBQUM7WUFFRCx1RkFBdUY7WUFDdkYsSUFBSSxLQUFLLFlBQVksQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLEtBQUssWUFBWSxDQUFDLENBQUMsUUFBUSxJQUFJLEtBQUssQ0FBQyxPQUFPLEtBQUssSUFBSSxDQUFDLEVBQUUsQ0FBQztnQkFDMUYsSUFBSSxHQUFHLEtBQUssQ0FBQztZQUNmLENBQUM7UUFDSCxDQUFDO1FBRUQsd0ZBQXdGO1FBQ3hGLDBGQUEwRjtRQUMxRiw2RkFBNkY7UUFDN0Ysd0ZBQXdGO1FBQ3hGLElBQUksSUFBSSxLQUFLLElBQUksRUFBRSxDQUFDO1lBQ2xCLE1BQU0sSUFBSSxHQUFHLElBQUksWUFBWSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1lBQ2xFLCtFQUErRTtZQUMvRSxPQUFPLEdBQUcsSUFBSSxLQUFLLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUN0RCxVQUFVO2dCQUNOLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDM0YsQ0FBQztRQUVELE9BQU8sRUFBQyxPQUFPLEVBQUUsVUFBVSxFQUFDLENBQUM7SUFDL0IsQ0FBQztJQUVPLGdCQUFnQjtRQUN0QixPQUFPLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUMzQixDQUFDO0lBRUQsaUJBQWlCLENBQUMsS0FBcUI7UUFDckMseUZBQXlGO1FBQ3pGLHFFQUFxRTtRQUNyRSxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUMzQyxNQUFNLEVBQUMsT0FBTyxFQUFFLFVBQVUsRUFBQyxHQUFHLElBQUksQ0FBQyxxQ0FBcUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNoRixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMseUJBQXlCLENBQzlDLEtBQUssQ0FBQyxRQUFRLEVBQUUsTUFBTSxFQUN0QixDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLEVBQUUsS0FBSyxDQUFDLElBQUksRUFBRTtZQUN0RiwrRUFBK0U7WUFDL0UseUZBQXlGO1lBQ3pGLHNGQUFzRjtZQUN0RixxRUFBcUU7WUFDckUsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUNoQyxJQUFJLENBQUMsNEJBQTRCLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1lBQy9ELENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFDaEMsSUFBSSxDQUFDLDRCQUE0QixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztTQUNoRSxDQUFDLENBQUM7UUFDUCxNQUFNLEVBQUMsVUFBVSxFQUFFLGlCQUFpQixFQUFFLHFCQUFxQixFQUFFLDRCQUE0QixFQUFDLEdBQ3RGLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN0QyxJQUFJLFNBQVMsR0FBc0IsSUFBSSxDQUFDO1FBQ3hDLElBQUksWUFBWSxHQUFnQixJQUFJLENBQUM7UUFDckMsSUFBSSxlQUF5QyxDQUFDO1FBRTlDLElBQUksS0FBSyxDQUFDLEtBQUssS0FBSyxJQUFJLEVBQUUsQ0FBQztZQUN6QixNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMscUNBQXFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzlFLFlBQVksR0FBRyxhQUFhLENBQUMsT0FBTyxDQUFDO1lBQ3JDLGVBQWUsR0FBRyxhQUFhLENBQUMsVUFBVSxDQUFDO1lBQzNDLFNBQVMsR0FBRyxJQUFJLENBQUMseUJBQXlCLENBQ3RDLEtBQUssQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNwRSx1REFBdUQ7WUFDdkQsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xDLENBQUM7UUFFRCxJQUFJLENBQUMsNkJBQTZCLENBQUMsS0FBSyxFQUFFLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUU3RCwyQkFBMkI7UUFDM0IsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLGNBQWMsRUFBRSxHQUFHLEVBQUU7WUFDakUsTUFBTSxNQUFNLEdBQUc7Z0JBQ2IsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUM7Z0JBQ3JCLENBQUMsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQztnQkFDNUIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsYUFBYSxFQUFFLENBQUM7Z0JBQ3RDLENBQUMsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUNwQyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQztnQkFDbEIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUM7Z0JBQ3pDLGlCQUFpQjthQUNsQixDQUFDO1lBRUYsSUFBSSxTQUFTLEtBQUssSUFBSSxFQUFFLENBQUM7Z0JBQ3ZCLE1BQU0sQ0FBQyxJQUFJLENBQ1AsQ0FBQyxDQUFDLE9BQU8sQ0FBQyw0QkFBNEIsQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUNuRSxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQ3hFLENBQUMsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGVBQWUsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQy9FLENBQUM7aUJBQU0sSUFBSSw0QkFBNEIsRUFBRSxDQUFDO2dCQUN4QyxxRkFBcUY7Z0JBQ3JGLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDLENBQUM7WUFDdkQsQ0FBQztZQUVELE9BQU8saUJBQWlCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbkMsQ0FBQyxDQUFDLENBQUM7UUFFSCxtRUFBbUU7UUFDbkUsa0VBQWtFO1FBQ2xFLDZEQUE2RDtRQUM3RCwrQ0FBK0M7UUFDL0MsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBRTNELG1DQUFtQztRQUNuQyxJQUFJLENBQUMsNEJBQTRCLENBQzdCLFVBQVUsRUFBRSxLQUFLLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzdGLENBQUM7SUFFTyw2QkFBNkIsQ0FBQyxLQUFxQixFQUFFLFlBQTBCO1FBQ3JGLE1BQU0sS0FBSyxHQUFHLFlBQVksQ0FBQyxZQUFZLENBQUM7UUFFeEMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLEVBQUUsY0FBYyxFQUFFLEVBQUU7WUFDbEYsT0FBTyxJQUFJLENBQUMsK0JBQStCLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxjQUFjLEVBQUUsUUFBUSxDQUFDO2lCQUM5RSxNQUFNLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDcEIsWUFBWSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsQyxDQUFDLENBQUMsQ0FBQztRQUVILFlBQVksQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsS0FBSyxFQUFFLGNBQWMsRUFBRSxFQUFFO1lBQ25GLE9BQU8sSUFBSSxDQUFDLCtCQUErQixDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsY0FBYyxFQUFFLFFBQVEsQ0FBQztpQkFDOUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ3BCLFNBQVMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDL0IsQ0FBQyxDQUFDLENBQUM7UUFFSCxZQUFZLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDLEtBQUssRUFBRSxjQUFjLEVBQUUsRUFBRTtZQUNwRixPQUFPLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLGNBQWMsRUFBRSxRQUFRLENBQUM7aUJBQzlFLFNBQVMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDL0IsQ0FBQyxDQUFDLENBQUM7UUFFSCxZQUFZLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLEtBQUssRUFBRSxjQUFjLEVBQUUsRUFBRTtZQUNuRixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsK0JBQStCLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxjQUFjLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDM0YsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLCtCQUErQixDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsY0FBYyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQzNGLE9BQU8sS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3BELENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVPLDRCQUE0QixDQUFDLElBQVksRUFBRSxLQUFhO1FBQzlELDhGQUE4RjtRQUM5RixPQUFPLElBQUksSUFBSSxJQUFJLEtBQUssRUFBRSxDQUFDO0lBQzdCLENBQUM7SUFFRDs7O09BR0c7SUFDSywrQkFBK0IsQ0FDbkMsS0FBcUIsRUFBRSxLQUFtQixFQUFFLGNBQXNCLEVBQ2xFLElBQWlDO1FBQ25DLE1BQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxZQUFZLEtBQUssY0FBYyxDQUFDLENBQUM7WUFDckQsS0FBSyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ25DLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxJQUFJLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFDNUQsT0FBTyxLQUFLLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBRSxDQUFDO0lBQy9CLENBQUM7SUFFTyx1QkFBdUIsQ0FBQyxLQUFxQjtRQUNuRCxNQUFNLGNBQWMsR0FBRyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztRQUMxRCxNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztRQUNqQyxNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQztRQUU5Qix5RUFBeUU7UUFDekUsSUFBSSxHQUFHLFlBQVksWUFBWSxJQUFJLEdBQUcsQ0FBQyxRQUFRLFlBQVksZ0JBQWdCO1lBQ3ZFLEdBQUcsQ0FBQyxJQUFJLEtBQUssY0FBYyxFQUFFLENBQUM7WUFDaEMsT0FBTyxFQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFLHFCQUFxQixFQUFFLEtBQUssRUFBQyxDQUFDO1FBQzNGLENBQUM7UUFFRCw0RUFBNEU7UUFDNUUsSUFBSSxHQUFHLFlBQVksWUFBWSxJQUFJLEdBQUcsQ0FBQyxRQUFRLFlBQVksZ0JBQWdCO1lBQ3ZFLEdBQUcsQ0FBQyxJQUFJLEtBQUssUUFBUSxFQUFFLENBQUM7WUFDMUIsT0FBTyxFQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFLHFCQUFxQixFQUFFLEtBQUssRUFBQyxDQUFDO1FBQzlGLENBQUM7UUFFRCwrRUFBK0U7UUFDL0UsSUFBSSxHQUFHLFlBQVksSUFBSSxJQUFJLEdBQUcsQ0FBQyxRQUFRLFlBQVksWUFBWTtZQUMzRCxHQUFHLENBQUMsUUFBUSxDQUFDLFFBQVEsWUFBWSxnQkFBZ0IsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUMvRSxNQUFNLFlBQVksR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxZQUFZLFlBQVk7Z0JBQ3BELEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxZQUFZLGdCQUFnQixJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLGNBQWMsQ0FBQztZQUM1RixNQUFNLFlBQVksR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxZQUFZLFlBQVk7Z0JBQ3BELEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxZQUFZLGdCQUFnQixJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLFFBQVEsQ0FBQztZQUV0RixJQUFJLFlBQVksSUFBSSxZQUFZLEVBQUUsQ0FBQztnQkFDakMsNkVBQTZFO2dCQUM3RSxrRkFBa0Y7Z0JBQ2xGLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7b0JBQzFCLElBQUksQ0FBQyxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ3hGLE9BQU8sRUFBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLHFCQUFxQixFQUFFLEtBQUssRUFBQyxDQUFDO1lBQ3RGLENBQUM7UUFDSCxDQUFDO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRU8scUJBQXFCLENBQUMsS0FBcUI7UUFJakQsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRXhELG1GQUFtRjtRQUNuRixJQUFJLFdBQVcsS0FBSyxJQUFJLEVBQUUsQ0FBQztZQUN6QixPQUFPLFdBQVcsQ0FBQztRQUNyQixDQUFDO1FBRUQsTUFBTSxXQUFXLEdBQUcsS0FBSyxDQUFDLGdCQUFnQixDQUFDO1FBQzNDLE1BQU0sS0FBSyxHQUFHLElBQUksbUJBQW1CLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRTtZQUN4RCx5RUFBeUU7WUFDekUsNkVBQTZFO1lBQzdFLCtCQUErQjtZQUMvQixDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsUUFBUTtZQUNuQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTztZQUUxQix5RkFBeUY7WUFDekYsMkZBQTJGO1lBQzNGLG9DQUFvQztZQUNwQyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsV0FBVyxDQUFDLE1BQU0sQ0FBQyxJQUFJO1lBQ2xELENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxXQUFXLENBQUMsTUFBTSxDQUFDLElBQUk7WUFDbEQsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLENBQUMsSUFBSTtZQUNoRCxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssQ0FBQyxJQUFJO1lBQ2hELENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUk7U0FDL0MsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDakUsTUFBTSxLQUFLLEdBQUcsaUNBQWlDLENBQzNDLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ2pFLE1BQU0scUJBQXFCLEdBQUcsS0FBSyxDQUFDLHVCQUF1QixFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ2xFLElBQUksRUFBc0MsQ0FBQztRQUUzQyxJQUFJLENBQUMscUJBQXFCLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1lBQzlGLEVBQUUsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDeEMsQ0FBQzthQUFNLENBQUM7WUFDTiw2Q0FBNkM7WUFDN0MsSUFBSSxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUNyQixNQUFNLGFBQWEsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDOUMsSUFBSSxhQUFhLFlBQVksQ0FBQyxDQUFDLG1CQUFtQixFQUFFLENBQUM7b0JBQ25ELEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLGVBQWUsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3RFLENBQUM7WUFDSCxDQUFDO1lBQ0QseUZBQXlGO1lBQ3pGLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMzQixDQUFDO1FBRUQsT0FBTztZQUNMLFVBQVUsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLDBCQUEwQixDQUFDLEVBQUUsRUFBRSxXQUFXLENBQUM7WUFDekUscUJBQXFCO1NBQ3RCLENBQUM7SUFDSixDQUFDO0lBRUQsYUFBYTtRQUNYLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQztJQUN6QixDQUFDO0lBRUQsV0FBVztRQUNULE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDO0lBQ2pDLENBQUM7SUFFRCxTQUFTO1FBQ1AsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDO0lBQ3pCLENBQUM7SUFFRCxxQkFBcUI7UUFDbkIsT0FBTyxJQUFJLENBQUMsdUJBQXVCLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDeEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDbEYsSUFBSSxDQUFDO0lBQ1gsQ0FBQztJQUVPLGNBQWM7UUFDcEIsT0FBTyxHQUFHLElBQUksQ0FBQyxlQUFlLEVBQUUsRUFBRSxDQUFDO0lBQ3JDLENBQUM7SUFFTyx3QkFBd0IsQ0FDNUIsYUFBcUIsRUFBRSxLQUEyQztRQUNwRSxNQUFNLGdCQUFnQixHQUFxQyxFQUFFLENBQUM7UUFFOUQsS0FBSyxNQUFNLEtBQUssSUFBSSxLQUFLLEVBQUUsQ0FBQztZQUMxQixJQUFJLENBQUMsQ0FBQyxLQUFLLFlBQVksQ0FBQyxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUM7Z0JBQ3pDLFNBQVM7WUFDWCxDQUFDO1lBRUQsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQ3RELElBQUksS0FBSyxLQUFLLFNBQVMsRUFBRSxDQUFDO2dCQUN4QixTQUFTO1lBQ1gsQ0FBQztZQUVELElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNqQyxJQUFJLEtBQUssWUFBWSxhQUFhLEVBQUUsQ0FBQztnQkFDbkMsd0ZBQXdGO2dCQUN4RixzRkFBc0Y7Z0JBQ3RGLHFEQUFxRDtnQkFDckQsTUFBTSxNQUFNLEdBQVUsRUFBRSxDQUFDO2dCQUV6Qix3QkFBd0I7Z0JBQ3hCLElBQUksQ0FBQyw2QkFBNkIsQ0FDOUIsa0NBQWtDLENBQUMsS0FBSyxDQUFDLEVBQUUsYUFBYSxFQUFFLEtBQUssQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFDbEYsTUFBTSxDQUFDLENBQUM7WUFDZCxDQUFDO2lCQUFNLENBQUM7Z0JBQ04sc0JBQXNCO2dCQUN0QixnQkFBZ0IsQ0FBQyxJQUFJLENBQUM7b0JBQ3BCLElBQUksRUFBRSxLQUFLLENBQUMsVUFBVTtvQkFDdEIsVUFBVSxFQUFFLHdCQUF3QixDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxLQUFLLENBQUMsRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDO2lCQUMzRixDQUFDLENBQUM7WUFDTCxDQUFDO1FBQ0gsQ0FBQztRQUVELEtBQUssTUFBTSxlQUFlLElBQUksZ0JBQWdCLEVBQUUsQ0FBQztZQUMvQyxJQUFJLENBQUMsNEJBQTRCLENBQzdCLGFBQWEsRUFBRSxlQUFlLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxRQUFRLEVBQUUsZUFBZSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3BGLENBQUM7SUFDSCxDQUFDO0lBRUQsZ0ZBQWdGO0lBQ2hGLHlGQUF5RjtJQUN6RixvRkFBb0Y7SUFDcEYsNENBQTRDO0lBQ3BDLGFBQWEsQ0FDakIsR0FBa0IsRUFBRSxJQUEwQixFQUFFLFNBQThCLEVBQzlFLFVBQTZCLEVBQUUsVUFBbUIsS0FBSztRQUN6RCxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUMsQ0FBQyxDQUFDO0lBQ25FLENBQUM7SUFFTywrQkFBK0IsQ0FDbkMsWUFBb0IsRUFBRSxXQUFvQztRQUM1RCxJQUFJLG9CQUFvQixHQUFHLENBQUMsQ0FBQztRQUM3QixJQUFJLFdBQVcsRUFBRSxDQUFDO1lBQ2hCLEtBQUssTUFBTSxJQUFJLElBQUksV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUNyQyxvQkFBb0IsSUFBSSxJQUFJLENBQUMsb0JBQW9CLENBQUM7Z0JBQ2xELElBQUksQ0FBQyw0QkFBNEIsQ0FDN0IsWUFBWSxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsV0FBVyxDQUFDLFNBQVMsRUFDcEQsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FDUCxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLHFCQUFxQixJQUFJLEtBQUssWUFBWSxhQUFhLENBQUMsQ0FBQyxDQUFDO29CQUNyRSxJQUFJLENBQUMsNkJBQTZCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztvQkFDM0MsSUFBSSxDQUFDLHNCQUFzQixDQUFDLEtBQUssQ0FBQyxDQUFtQixDQUFDLENBQUM7WUFDM0UsQ0FBQztRQUNILENBQUM7UUFDRCxPQUFPLG9CQUFvQixDQUFDO0lBQzlCLENBQUM7SUFFTyxtQkFBbUIsQ0FDdkIsSUFBMEIsRUFBRSxTQUE4QixFQUFFLFVBQThCLEVBQzFGLE9BQWlCO1FBQ25CLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsVUFBVSxJQUFJLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUN4RixDQUFDO0lBRU8sNEJBQTRCLENBQ2hDLFNBQWlCLEVBQUUsSUFBMEIsRUFBRSxTQUE4QixFQUM3RSxVQUE4QjtRQUNoQyxJQUFJLENBQUMsZ0NBQWdDLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3ZELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQ3RELENBQUM7SUFFTyxpQkFBaUIsQ0FDckIsSUFBMEIsRUFBRSxTQUE4QixFQUFFLFVBQThCO1FBQzVGLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLFVBQVUsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUM3RSxDQUFDO0lBRU8sZ0NBQWdDLENBQUMsU0FBaUIsRUFBRSxJQUEwQjtRQUNwRixJQUFJLFNBQVMsS0FBSyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDckMsTUFBTSxLQUFLLEdBQUcsU0FBUyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUM7WUFFN0MsSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQ2QsTUFBTSxJQUFJLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1lBQzlELENBQUM7WUFFRCxJQUFJLENBQUMsYUFBYSxDQUNkLElBQUksQ0FBQyxjQUFjLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxPQUFPLEVBQUUsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2hGLElBQUksQ0FBQyxhQUFhLEdBQUcsU0FBUyxDQUFDO1FBQ2pDLENBQUM7SUFDSCxDQUFDO0lBRU8seUJBQXlCLENBQUMsUUFBZ0I7UUFDaEQsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDO1FBQzlDLElBQUksQ0FBQyxrQkFBa0IsSUFBSSxRQUFRLENBQUM7UUFDcEMsT0FBTyxhQUFhLENBQUM7SUFDdkIsQ0FBQztJQUVPLG9CQUFvQixDQUFDLEtBQWU7UUFDMUMsSUFBSSxDQUFDLGFBQWEsSUFBSSxLQUFLLFlBQVksYUFBYSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3RGLENBQUM7SUFFRDs7O09BR0c7SUFDSyx1QkFBdUI7UUFDN0IsSUFBSSxJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztZQUMvQixPQUFPLElBQUksQ0FBQyxxQkFBcUIsQ0FBQztRQUNwQyxDQUFDO1FBRUQsT0FBTyxJQUFJLENBQUMscUJBQXFCLEdBQUcsSUFBSSxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQztZQUNsRCxDQUFDLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7WUFDMUIsSUFBSSxDQUFDLGFBQWEsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN4RCxDQUFDO0lBRU8sc0JBQXNCLENBQUMsS0FBVTtRQUN2QyxNQUFNLHdCQUF3QixHQUMxQixzQkFBc0IsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLHVCQUF1QixFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDO1FBQy9GLE1BQU0sT0FBTyxHQUFHLHdCQUF3QixDQUFDLFdBQVcsQ0FBQztRQUNyRCxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxHQUFHLHdCQUF3QixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzVELE9BQU8sT0FBTyxDQUFDO0lBQ2pCLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNLLDZCQUE2QixDQUFDLEtBQW9CO1FBQ3hELE1BQU0sRUFBQyxJQUFJLEVBQUUsS0FBSyxFQUFDLEdBQ2Ysc0JBQXNCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQztRQUUvRixJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDO1FBQ25DLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVEOzs7T0FHRztJQUNLLCtCQUErQjtRQUNyQywyRkFBMkY7UUFDM0YsNkZBQTZGO1FBQzdGLHVCQUF1QjtRQUN2QixJQUFJLElBQUksQ0FBQyx3QkFBd0IsS0FBSyxJQUFJLEVBQUUsQ0FBQztZQUMzQyxNQUFNLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxXQUFXLGNBQWMsQ0FBQztZQUMvQyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNyRCxJQUFJLENBQUMsd0JBQXdCLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNuRCxDQUFDO1FBRUQsT0FBTyxJQUFJLENBQUMsd0JBQXdCLENBQUM7SUFDdkMsQ0FBQztJQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09Bc0JHO0lBQ0ssdUJBQXVCLENBQzNCLFdBQW1CLEVBQUUsZ0JBQW1DLEVBQUUsTUFBMEIsRUFDcEYsT0FBdUIsRUFBRSxNQUF1QixFQUNoRCxnQkFBc0QsRUFBRSxFQUN4RCxpQkFBcUMsRUFBRTtRQUN6QyxNQUFNLFdBQVcsR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFDO1FBQ3RDLE1BQU0sU0FBUyxHQUFtQixFQUFFLENBQUM7UUFDckMsSUFBSSxlQUEwQyxDQUFDO1FBRS9DLEtBQUssTUFBTSxJQUFJLElBQUksZ0JBQWdCLEVBQUUsQ0FBQztZQUNwQyxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssdUJBQXVCLEVBQUUsQ0FBQztnQkFDMUMsZUFBZSxHQUFHLElBQUksQ0FBQztZQUN6QixDQUFDO1lBRUQsNkRBQTZEO1lBQzdELGlFQUFpRTtZQUNqRSxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDZCwwRUFBMEU7Z0JBQzFFLDZFQUE2RTtnQkFDN0UsaUZBQWlGO2dCQUNqRixnRkFBZ0Y7Z0JBQ2hGLGtCQUFrQjtnQkFDbEIsTUFBTSxFQUFDLGdCQUFnQixFQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztnQkFDM0MsSUFBSSxVQUF5QixDQUFDO2dCQUM5QixJQUFJLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztvQkFDcEMsVUFBVSxHQUFHLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFFLENBQUM7Z0JBQ2hELENBQUM7cUJBQU0sQ0FBQztvQkFDTixVQUFVLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBb0IsQ0FBQyxDQUFDO29CQUMzRCxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztnQkFDOUMsQ0FBQztnQkFDRCxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQ25ELENBQUM7aUJBQU0sQ0FBQztnQkFDTixTQUFTLENBQUMsSUFBSSxDQUNWLEdBQUcsd0JBQXdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLHFCQUFxQixDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3hGLENBQUM7UUFDSCxDQUFDO1FBRUQsc0ZBQXNGO1FBQ3RGLGlEQUFpRDtRQUNqRCxJQUFJLGVBQWUsRUFBRSxDQUFDO1lBQ3BCLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxxQkFBcUIsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1FBQzVELENBQUM7UUFFRCxTQUFTLFdBQVcsQ0FBQyxHQUFrQixFQUFFLEtBQW9CO1lBQzNELElBQUksT0FBTyxHQUFHLEtBQUssUUFBUSxFQUFFLENBQUM7Z0JBQzVCLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7b0JBQzFCLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyx3QkFBd0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUNqRCxLQUFLLEtBQUssU0FBUyxJQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQzdDLFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3ZCLENBQUM7WUFDSCxDQUFDO2lCQUFNLENBQUM7Z0JBQ04sU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDakMsQ0FBQztRQUNILENBQUM7UUFFRCwyRkFBMkY7UUFDM0YsNEZBQTRGO1FBQzVGLHlDQUF5QztRQUN6QyxJQUFJLE1BQU0sRUFBRSxDQUFDO1lBQ1gsTUFBTSxDQUFDLDJCQUEyQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ2hELENBQUM7UUFFRCxJQUFJLE1BQU0sQ0FBQyxNQUFNLElBQUksT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ3BDLE1BQU0sdUJBQXVCLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQztZQUVqRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUN2QyxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hCLDREQUE0RDtnQkFDNUQsa0VBQWtFO2dCQUNsRSxJQUFJLEtBQUssQ0FBQyxJQUFJLGtDQUEwQixJQUFJLEtBQUssQ0FBQyxJQUFJLGtDQUEwQixFQUFFLENBQUM7b0JBQ2pGLFdBQVcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzFCLENBQUM7WUFDSCxDQUFDO1lBRUQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQkFDeEMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMxQixJQUFJLE1BQU0sQ0FBQyxJQUFJLHNDQUE4QixFQUFFLENBQUM7b0JBQzlDLFdBQVcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzNCLENBQUM7WUFDSCxDQUFDO1lBRUQsMkVBQTJFO1lBQzNFLDRFQUE0RTtZQUM1RSwyRUFBMkU7WUFDM0UsNkRBQTZEO1lBQzdELElBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyx1QkFBdUIsRUFBRSxDQUFDO2dCQUNqRCxTQUFTLENBQUMsTUFBTSxDQUFDLHVCQUF1QixFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyx1Q0FBK0IsQ0FBQyxDQUFDO1lBQ3pGLENBQUM7UUFDSCxDQUFDO1FBRUQsSUFBSSxhQUFhLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDekIsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyx1Q0FBK0IsQ0FBQyxDQUFDO1lBQ3pELGFBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDeEQsQ0FBQztRQUVELElBQUksY0FBYyxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQzFCLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sbUNBQTJCLENBQUMsQ0FBQztZQUNyRCxjQUFjLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3pELENBQUM7UUFFRCxPQUFPLFNBQVMsQ0FBQztJQUNuQixDQUFDO0lBRU8sV0FBVyxDQUFDLFVBQXdCO1FBQzFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDO1lBQ3pCLE9BQU8sQ0FBQyxDQUFDLGVBQWUsQ0FBQztRQUMzQixDQUFDO1FBRUQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQztRQUVoRCxtRUFBbUU7UUFDbkUsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUN2QyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQztnQkFDdkMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RCLENBQUM7UUFDSCxDQUFDO1FBRUQsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDaEQsQ0FBQztJQUVPLGdCQUFnQixDQUFDLEtBQTBCO1FBQ2pELE9BQU8sS0FBSyxLQUFLLElBQUksSUFBSSxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN2QyxDQUFDLENBQUMsZUFBZSxDQUFDO0lBQ2hFLENBQUM7SUFFTyxnQkFBZ0IsQ0FBQyxVQUF5QjtRQUNoRCxJQUFJLENBQUMsVUFBVSxJQUFJLFVBQVUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDM0MsT0FBTyxDQUFDLENBQUMsZUFBZSxDQUFDO1FBQzNCLENBQUM7UUFFRCxNQUFNLFNBQVMsR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQy9DLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQ3JDLGlDQUFpQztZQUNqQyxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLGtCQUFrQixFQUFFLENBQUM7WUFDN0QsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztZQUNsQyxNQUFNLEdBQUcsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ3JDLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUNsQixjQUFjLEVBQUUsU0FBUyxDQUFDLElBQUksRUFBRSxHQUFHLHVDQUNOLENBQUMsS0FBbUIsRUFBRSxhQUFxQixFQUFFLEVBQUU7Z0JBQzFFLHVCQUF1QjtnQkFDdkIsTUFBTSxlQUFlLEdBQ2pCLGFBQWEsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsdUJBQXVCLENBQUMsYUFBYSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO2dCQUUvRSxtQ0FBbUM7Z0JBQ25DLE1BQU0sT0FBTyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDOUUsT0FBTyxlQUFlLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZELENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUViLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMzQyxDQUFDLENBQUMsQ0FBQztRQUVILE9BQU8sU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzlCLENBQUM7SUFFTyx3QkFBd0IsQ0FBQyxPQUFlLEVBQUUsU0FBdUIsRUFBRSxLQUFhO1FBRXRGLE9BQU8sR0FBRyxFQUFFO1lBQ1YsTUFBTSxTQUFTLEdBQVcsU0FBUyxDQUFDLElBQUksQ0FBQztZQUN6QyxNQUFNLGFBQWEsR0FBRyxTQUFTLENBQUMsSUFBSSxzQ0FBOEIsQ0FBQyxDQUFDO2dCQUNoRSxzRkFBc0Y7Z0JBQ3RGLG9DQUFvQyxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsS0FBTSxDQUFDLENBQUMsQ0FBQztnQkFDbkUsa0JBQWtCLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDbEMsTUFBTSxXQUFXLEdBQUcsR0FBRyxJQUFJLENBQUMsWUFBWSxJQUFJLE9BQU8sSUFBSSxhQUFhLElBQUksS0FBSyxXQUFXLENBQUM7WUFDekYsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQ3hDLElBQUksQ0FBQyxhQUFhLENBQUMsWUFBWSxFQUFFLDJCQUEyQixDQUFDLENBQUM7WUFDbEUsT0FBTyw4QkFBOEIsQ0FBQyxTQUFTLEVBQUUsV0FBVyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3ZFLENBQUMsQ0FBQztJQUNKLENBQUM7Q0FDRjtBQUVELE1BQU0sT0FBTyxjQUFlLFNBQVEsNkJBQTZCO0lBRy9ELFlBQ1ksWUFBMEIsRUFBVSxZQUEwQixFQUM5RCx5QkFBdUQsRUFDdkQsVUFDd0U7UUFDbEYsS0FBSyxFQUFFLENBQUM7UUFKRSxpQkFBWSxHQUFaLFlBQVksQ0FBYztRQUFVLGlCQUFZLEdBQVosWUFBWSxDQUFjO1FBQzlELDhCQUF5QixHQUF6Qix5QkFBeUIsQ0FBOEI7UUFDdkQsZUFBVSxHQUFWLFVBQVUsQ0FDOEQ7UUFONUUsbUJBQWMsR0FBVyxFQUFFLENBQUM7SUFRcEMsQ0FBQztJQUVELGdDQUFnQztJQUN2QixTQUFTLENBQUMsSUFBaUIsRUFBRSxPQUFZO1FBQ2hELHFDQUFxQztRQUNyQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDakMsTUFBTSxlQUFlLEdBQUcsUUFBUSxJQUFJLEVBQUUsQ0FBQztRQUN2QyxtRUFBbUU7UUFDbkUsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMseUJBQXlCLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDOUUsTUFBTSxNQUFNLEdBQUcsSUFBSSxZQUFZLENBQzNCLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQzNGLGVBQWUsQ0FBQyxDQUFDO1FBQ3JCLE1BQU0sRUFBQyxVQUFVLEVBQUUsV0FBVyxFQUFDLEdBQUcsbUJBQW1CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pFLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxlQUFlLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUM1RSxNQUFNLElBQUksR0FBVSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDN0MsTUFBTSxhQUFhLEdBQVUsV0FBVyxDQUFDLENBQUM7WUFDdEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyRSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRXhCLE1BQU0sWUFBWSxHQUFHLElBQUksSUFBSSxDQUN6QixJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsTUFBTSxFQUNsQztZQUNFLElBQUksZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQztZQUN0RCxJQUFJLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxnQkFBZ0IsQ0FBQztZQUNsRSxHQUFHLGFBQWE7U0FDakIsRUFDRCxJQUFLLENBQUMsQ0FBQztRQUNYLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3ZDLE9BQU8sWUFBWSxDQUFDO0lBQ3RCLENBQUM7SUFFRCxxQkFBcUIsQ0FBQyxZQUFvQjtRQUN4QyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQVUsRUFBRSxFQUFFO1lBQ3pDLG9FQUFvRTtZQUNwRSxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBcUIsQ0FBQztZQUNuRCxVQUFVLENBQUMsS0FBZ0IsSUFBSSxZQUFZLENBQUM7UUFDL0MsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRVEsaUJBQWlCLENBQUMsS0FBbUIsRUFBRSxPQUFZO1FBQzFELE9BQU8sSUFBSSxtQkFBbUIsQ0FDMUIsS0FBSyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxFQUFFO1lBQ3ZFLHlFQUF5RTtZQUN6RSxrRkFBa0Y7WUFDbEYsVUFBVTtZQUNWLE1BQU0sT0FBTyxHQUFHLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDckMsT0FBTyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMseUJBQXlCLENBQUMsQ0FBQztRQUN2RixDQUFDLENBQUMsQ0FBQztJQUNULENBQUM7SUFFUSxlQUFlLENBQUMsR0FBZSxFQUFFLE9BQVk7UUFDcEQsT0FBTyxJQUFJLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxNQUFNLENBQUMsRUFBRTtZQUMzRiwwRUFBMEU7WUFDMUUsa0ZBQWtGO1lBQ2xGLFVBQVU7WUFDVixNQUFNLE9BQU8sR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQ25DLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDNUYsT0FBTyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMseUJBQXlCLENBQUMsQ0FBQztRQUN2RixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRjtBQUVELHNFQUFzRTtBQUN0RSxNQUFNLHNCQUFzQixHQUFHLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBRXhGLFNBQVMsbUJBQW1CLENBQUMsSUFBb0I7SUFDL0MsTUFBTSxVQUFVLEdBQUcsc0JBQXNCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3ZELE9BQU87UUFDTCxVQUFVLEVBQUUsVUFBVSxJQUFJLEVBQUUsQ0FBQyxTQUFTO1FBQ3RDLFdBQVcsRUFBRSxDQUFDLFVBQVU7S0FDekIsQ0FBQztBQUNKLENBQUM7QUFFRCxNQUFNLHVCQUF1QixHQUFHO0lBQzlCLEVBQUUsQ0FBQyxhQUFhLEVBQUUsRUFBRSxDQUFDLGFBQWEsRUFBRSxFQUFFLENBQUMsYUFBYSxFQUFFLEVBQUUsQ0FBQyxhQUFhLEVBQUUsRUFBRSxDQUFDLGFBQWE7SUFDeEYsRUFBRSxDQUFDLGFBQWEsRUFBRSxFQUFFLENBQUMsYUFBYSxFQUFFLEVBQUUsQ0FBQyxhQUFhLEVBQUUsRUFBRSxDQUFDLGFBQWE7Q0FDdkUsQ0FBQztBQUVGLFNBQVMsb0JBQW9CLENBQUMsSUFBb0I7SUFDaEQsTUFBTSxVQUFVLEdBQUcsdUJBQXVCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3hELE9BQU87UUFDTCxVQUFVLEVBQUUsVUFBVSxJQUFJLEVBQUUsQ0FBQyxhQUFhO1FBQzFDLFdBQVcsRUFBRSxDQUFDLFVBQVU7S0FDekIsQ0FBQztBQUNKLENBQUM7QUFFRCxhQUFhO0FBQ2IsU0FBUyx1QkFBdUIsQ0FBQyxpQkFBeUI7SUFDeEQsT0FBTyxDQUFDLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUM7U0FDOUIsTUFBTSxDQUFDLGlCQUFpQixHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDM0UsQ0FBQztBQUVELFNBQVMsaUJBQWlCLENBQ3RCLFlBQTBCLEVBQUUsT0FBNEMsRUFDeEUsYUFBMkM7SUFDN0MsTUFBTSxFQUFDLGNBQWMsRUFBRSx1QkFBdUIsRUFBQyxHQUFHLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUMxRixxREFBcUQ7SUFDckQsTUFBTSxTQUFTLEdBQUcsYUFBYSxDQUFDLENBQUMsR0FBRyx1QkFBdUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNwRSxNQUFNLEVBQUMsVUFBVSxFQUFFLFdBQVcsRUFBQyxHQUFHLG9CQUFvQixDQUFDLHVCQUF1QixDQUFDLENBQUM7SUFFaEYsMkZBQTJGO0lBQzNGLFVBQVU7SUFDVixNQUFNLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFFcEQsSUFBSSxXQUFXLEVBQUUsQ0FBQztRQUNoQixJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxDQUFDO0lBQ25ELENBQUM7U0FBTSxDQUFDO1FBQ04sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLHVCQUF1QixDQUFDLENBQUM7SUFDeEMsQ0FBQztJQUVELE9BQU8sQ0FBQyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDL0MsQ0FBQztBQUVEOzs7Ozs7R0FNRztBQUNILFNBQVMsd0JBQXdCLENBQUMsSUFBWTtJQUM1QyxNQUFNLENBQUMsa0JBQWtCLEVBQUUsYUFBYSxDQUFDLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzlELE1BQU0sV0FBVyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7SUFFN0MsSUFBSSxrQkFBa0IsRUFBRSxDQUFDO1FBQ3ZCLE9BQU87WUFDTCxDQUFDLENBQUMsT0FBTywyQ0FBbUMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLEVBQUUsV0FBVztTQUN6RixDQUFDO0lBQ0osQ0FBQztJQUVELE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUN2QixDQUFDO0FBZ0JELHFFQUFxRTtBQUNyRSxNQUFNLGtCQUFrQixHQUFHLGdCQUFnQixDQUFDO0FBK0I1QyxNQUFNLE9BQU8sWUFBWTtJQU12QixNQUFNLENBQUMsZUFBZTtRQUNwQixPQUFPLElBQUksWUFBWSxFQUFFLENBQUM7SUFDNUIsQ0FBQztJQUVELFlBQ1csZUFBdUIsQ0FBQyxFQUFXLFNBQTRCLElBQUksRUFDbkUsT0FBcUI7UUFEckIsaUJBQVksR0FBWixZQUFZLENBQVk7UUFBVyxXQUFNLEdBQU4sTUFBTSxDQUEwQjtRQUNuRSxZQUFPLEdBQVAsT0FBTyxDQUFjO1FBWGhDLDZEQUE2RDtRQUNyRCxRQUFHLEdBQUcsSUFBSSxHQUFHLEVBQXVCLENBQUM7UUFDckMsdUJBQWtCLEdBQUcsQ0FBQyxDQUFDO1FBQ3ZCLHdCQUFtQixHQUF1QixJQUFJLENBQUM7UUFDL0MsNEJBQXVCLEdBQUcsS0FBSyxDQUFDO1FBUXRDLElBQUksT0FBTyxLQUFLLFNBQVMsRUFBRSxDQUFDO1lBQzFCLEtBQUssTUFBTSxJQUFJLElBQUksT0FBTyxFQUFFLENBQUM7Z0JBQzNCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDdEMsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0lBRUQsR0FBRyxDQUFDLElBQVk7UUFDZCxJQUFJLE9BQU8sR0FBc0IsSUFBSSxDQUFDO1FBQ3RDLE9BQU8sT0FBTyxFQUFFLENBQUM7WUFDZixJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNsQyxJQUFJLEtBQUssSUFBSSxJQUFJLEVBQUUsQ0FBQztnQkFDbEIsSUFBSSxPQUFPLEtBQUssSUFBSSxFQUFFLENBQUM7b0JBQ3JCLGtEQUFrRDtvQkFDbEQsS0FBSyxHQUFHO3dCQUNOLGNBQWMsRUFBRSxLQUFLLENBQUMsY0FBYzt3QkFDcEMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHO3dCQUNkLG9CQUFvQixFQUFFLEtBQUssQ0FBQyxvQkFBb0I7d0JBQ2hELE9BQU8sRUFBRSxLQUFLO3dCQUNkLFFBQVEsRUFBRSxLQUFLLENBQUMsUUFBUTtxQkFDekIsQ0FBQztvQkFFRiwyQkFBMkI7b0JBQzNCLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztvQkFDMUIseUNBQXlDO29CQUN6QyxJQUFJLENBQUMsNkJBQTZCLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQzFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO2dCQUMxQixDQUFDO2dCQUVELElBQUksS0FBSyxDQUFDLG9CQUFvQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO29CQUNqRCxLQUFLLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztnQkFDdkIsQ0FBQztnQkFDRCxPQUFPLE9BQU8sS0FBSyxDQUFDLEdBQUcsS0FBSyxVQUFVLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQztZQUM3RixDQUFDO1lBQ0QsT0FBTyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7UUFDM0IsQ0FBQztRQUVELG9GQUFvRjtRQUNwRiwwRUFBMEU7UUFDMUUsa0ZBQWtGO1FBQ2xGLDZFQUE2RTtRQUM3RSxPQUFPLElBQUksQ0FBQyxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMxRSxDQUFDO0lBRUQscUVBQXFFO0lBQ3JFLFFBQVEsQ0FBQyxJQUFZO1FBQ25CLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDNUIsQ0FBQztJQUVEOzs7Ozs7Ozs7T0FTRztJQUNILEdBQUcsQ0FBQyxjQUFzQixFQUFFLElBQVksRUFBRSxHQUFxQyxFQUMzRSw4Q0FBOEMsRUFDOUMsb0JBQThDLEVBQUUsUUFBZTtRQUNqRSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDdkIsSUFBSSxRQUFRLEVBQUUsQ0FBQztnQkFDYiw4RUFBOEU7Z0JBQzlFLCtDQUErQztnQkFDL0MsT0FBTyxJQUFJLENBQUM7WUFDZCxDQUFDO1lBQ0QsS0FBSyxDQUFDLFlBQVksSUFBSSxzQ0FBc0MsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3BGLENBQUM7UUFDRCxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUU7WUFDakIsY0FBYyxFQUFFLGNBQWM7WUFDOUIsR0FBRyxFQUFFLEdBQUc7WUFDUixPQUFPLEVBQUUsS0FBSztZQUNkLG9CQUFvQixFQUFFLG9CQUFvQjtZQUMxQyxRQUFRLEVBQUUsUUFBUTtTQUNuQixDQUFDLENBQUM7UUFDSCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFFRCx3Q0FBd0M7SUFDeEMsUUFBUSxDQUFDLElBQVk7UUFDbkIsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3hCLENBQUM7SUFFRCx3Q0FBd0M7SUFDeEMseUJBQXlCO1FBQ3ZCLElBQUksSUFBSSxDQUFDLFlBQVksS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUM1QiwwRUFBMEU7WUFDMUUsNEVBQTRFO1lBQzVFLDJCQUEyQjtZQUMzQixJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsR0FBRyxDQUFDLENBQUUsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1FBQ3ZELENBQUM7SUFDSCxDQUFDO0lBRUQsV0FBVyxDQUFDLEtBQWEsRUFBRSxPQUFxQjtRQUM5QyxNQUFNLFFBQVEsR0FBRyxJQUFJLFlBQVksQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3hELElBQUksS0FBSyxHQUFHLENBQUM7WUFBRSxRQUFRLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDcEQsT0FBTyxRQUFRLENBQUM7SUFDbEIsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCwyQkFBMkIsQ0FBQyxjQUFzQjtRQUNoRCxNQUFNLFVBQVUsR0FBRyxrQkFBa0IsR0FBRyxjQUFjLENBQUM7UUFDdkQsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7WUFDOUIsSUFBSSxDQUFDLHdCQUF3QixDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ2hELENBQUM7UUFDRCxrRUFBa0U7UUFDbEUsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUUsQ0FBQyxHQUFvQixDQUFDO0lBQ3hELENBQUM7SUFFRCxvQkFBb0IsQ0FBQyxjQUFzQjtRQUN6QyxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsR0FBRyxjQUFjLENBQUMsQ0FBQztRQUN2RSxrRUFBa0U7UUFDbEUsT0FBTyxZQUFZLElBQUksWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLEdBQW9CLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztJQUN6RixDQUFDO0lBRUQsNkJBQTZCLENBQUMsS0FBa0I7UUFDOUMsSUFBSSxLQUFLLENBQUMsUUFBUSx3Q0FBZ0M7WUFDOUMsS0FBSyxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDN0MsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLEdBQUcsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQzdFLElBQUksWUFBWSxFQUFFLENBQUM7Z0JBQ2pCLFlBQVksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1lBQzlCLENBQUM7aUJBQU0sQ0FBQztnQkFDTixJQUFJLENBQUMsd0JBQXdCLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQ3RELENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztJQUVELHdCQUF3QixDQUFDLGNBQXNCO1FBQzdDLE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUM7UUFDakUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLEdBQUcsY0FBYyxFQUFFO1lBQ2hELGNBQWMsRUFBRSxjQUFjO1lBQzlCLEdBQUcsRUFBRSxHQUFHO1lBQ1Isb0JBQW9CLEVBQUUsQ0FBQyxLQUFtQixFQUFFLGFBQXFCLEVBQUUsRUFBRTtnQkFDbkUsaUNBQWlDO2dCQUNqQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7WUFDekUsQ0FBQztZQUNELE9BQU8sRUFBRSxLQUFLO1lBQ2QsUUFBUSw0Q0FBb0M7U0FDN0MsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELG9CQUFvQixDQUFDLElBQVk7UUFDL0IsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLEdBQUcsQ0FBQyxDQUFFLENBQUM7UUFDN0QsY0FBYyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7UUFDOUIsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFDeEIsTUFBTSxHQUFHLEdBQUcsT0FBTyxjQUFjLENBQUMsR0FBRyxLQUFLLFVBQVUsQ0FBQyxDQUFDO1lBQ2xELGNBQWMsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLGNBQWMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO1lBQ3pELGNBQWMsQ0FBQyxHQUFHLENBQUM7UUFDdkIsT0FBTyxJQUFJLEtBQUssd0JBQXdCLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNsRSxDQUFDO0lBRUQsZ0JBQWdCO1FBQ2Qsd0ZBQXdGO1FBQ3hGLHFGQUFxRjtRQUNyRix5RkFBeUY7UUFDekYsc0NBQXNDO1FBQ3RDLElBQUksSUFBSSxDQUFDLGVBQWUsRUFBRSxFQUFFLENBQUM7WUFDM0IsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFPLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztnQkFDdEMseUZBQXlGO2dCQUN6RixJQUFJLENBQUMsTUFBTyxDQUFDLG1CQUFtQixHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU8sQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUM7WUFDbkYsQ0FBQztZQUNELElBQUksQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLENBQUMsTUFBTyxDQUFDLG1CQUFtQixDQUFDO1FBQzlELENBQUM7SUFDSCxDQUFDO0lBRUQsb0JBQW9CO1FBQ2xCLElBQUksSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7WUFDN0IsTUFBTSxXQUFXLEdBQUcsaUJBQWlCLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDO1lBQ3hGLGdGQUFnRjtZQUNoRix5Q0FBeUM7WUFDekMsT0FBTyxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQztnQkFDakMsQ0FBQyxDQUFDLFFBQVEsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO2dCQUN2RSxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDM0IsQ0FBQztRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVELHNCQUFzQjtRQUNwQixvQ0FBb0M7UUFDcEMsT0FBTyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztZQUM3QjtnQkFDRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsY0FBYyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFO2FBQzNGLENBQUMsQ0FBQztZQUNILEVBQUUsQ0FBQztJQUNULENBQUM7SUFFRCxlQUFlO1FBQ2IsT0FBTyxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxLQUFLLElBQUksQ0FBQyxZQUFZLENBQUM7SUFDdkUsQ0FBQztJQUVELG9CQUFvQjtRQUNsQixJQUFJLG1CQUFtQixHQUFHLENBQUMsQ0FBQztRQUM1QixPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQzthQUN4QixNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDO2FBQzlCLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFDLGNBQWMsSUFBSSxDQUFDLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUM7YUFDOUUsTUFBTSxDQUFDLENBQUMsS0FBb0IsRUFBRSxLQUFrQixFQUFFLEVBQUU7WUFDbkQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUMsY0FBYyxDQUFDO1lBQzNELE1BQU0sU0FBUyxHQUNYLEtBQUssQ0FBQyxvQkFBcUIsQ0FBQyxJQUFJLEVBQUUsU0FBUyxHQUFHLG1CQUFtQixDQUFDLENBQUM7WUFDdkUsbUJBQW1CLEdBQUcsU0FBUyxDQUFDO1lBQ2hDLE9BQU8sS0FBSyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNqQyxDQUFDLEVBQUUsRUFBRSxDQUFrQixDQUFDO0lBQ3JDLENBQUM7SUFHRCxrQkFBa0I7UUFDaEIsSUFBSSxPQUFPLEdBQWlCLElBQUksQ0FBQztRQUNqQyxnRUFBZ0U7UUFDaEUsT0FBTyxPQUFPLENBQUMsTUFBTTtZQUFFLE9BQU8sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO1FBQ2hELE1BQU0sR0FBRyxHQUFHLEdBQUcsZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixFQUFFLEVBQUUsQ0FBQztRQUNqRSxPQUFPLEdBQUcsQ0FBQztJQUNiLENBQUM7SUFFRCxzQkFBc0I7UUFDcEIsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDO0lBQ3BDLENBQUM7SUFFRCw0QkFBNEI7UUFDMUIsSUFBSSxDQUFDLHVCQUF1QixHQUFHLElBQUksQ0FBQztJQUN0QyxDQUFDO0NBQ0Y7QUFFRCxxRUFBcUU7QUFDckUsTUFBTSxtQkFBb0IsU0FBUSxZQUFZO0lBRzVDLFlBQVksV0FBeUIsRUFBVSxlQUF1QztRQUNwRixLQUFLLENBQUMsV0FBVyxDQUFDLFlBQVksR0FBRyxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFESixvQkFBZSxHQUFmLGVBQWUsQ0FBd0I7UUFGOUUseUJBQW9CLEdBQUcsQ0FBQyxDQUFDO0lBSWpDLENBQUM7SUFFUSxHQUFHLENBQUMsSUFBWTtRQUN2QixvQ0FBb0M7UUFDcEMsSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1lBQzlDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDaEQsQ0FBQztRQUVELElBQUksT0FBTyxHQUFzQixJQUFJLENBQUMsTUFBTSxDQUFDO1FBRTdDLGlFQUFpRTtRQUNqRSxPQUFPLE9BQU8sRUFBRSxDQUFDO1lBQ2YsSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7Z0JBQzNCLE9BQU8sSUFBSSxDQUFDO1lBQ2QsQ0FBQztZQUNELE9BQU8sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO1FBQzNCLENBQUM7UUFFRCx1RUFBdUU7UUFDdkUsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7UUFDNUIsT0FBTyxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBRUQsdUZBQXVGO0lBQ3ZGLHVCQUF1QjtRQUNyQixPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQztJQUNuQyxDQUFDO0NBQ0Y7QUFFRDs7O0dBR0c7QUFDSCxTQUFTLHFCQUFxQixDQUFDLFNBQTBCO0lBQ3ZELCtFQUErRTtJQUMvRSw4RUFBOEU7SUFDOUUsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMseUJBQXlCLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzVFLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyx3Q0FBZ0MsRUFBRSxTQUFTLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO0FBQ2xGLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxTQUFTLGtDQUFrQyxDQUFDLGFBQTRCO0lBQ3RFLFFBQVEsMEJBQTBCLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQztRQUNsRCxLQUFLLENBQUM7WUFDSixPQUFPLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQztRQUNoQyxLQUFLLENBQUM7WUFDSixPQUFPLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQztRQUNqQyxLQUFLLENBQUM7WUFDSixPQUFPLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQztRQUNqQyxLQUFLLENBQUM7WUFDSixPQUFPLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQztRQUNqQyxLQUFLLENBQUM7WUFDSixPQUFPLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQztRQUNqQyxLQUFLLEVBQUU7WUFDTCxPQUFPLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQztRQUNqQyxLQUFLLEVBQUU7WUFDTCxPQUFPLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQztRQUNqQyxLQUFLLEVBQUU7WUFDTCxPQUFPLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQztRQUNqQyxLQUFLLEVBQUU7WUFDTCxPQUFPLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQztRQUNqQztZQUNFLE9BQU8sRUFBRSxDQUFDLG9CQUFvQixDQUFDO0lBQ25DLENBQUM7QUFDSCxDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBUyxtQ0FBbUMsQ0FBQyxhQUE0QjtJQUN2RSxRQUFRLDBCQUEwQixDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUM7UUFDbEQsS0FBSyxDQUFDO1lBQ0osT0FBTyxFQUFFLENBQUMscUJBQXFCLENBQUM7UUFDbEMsS0FBSyxDQUFDO1lBQ0osT0FBTyxFQUFFLENBQUMscUJBQXFCLENBQUM7UUFDbEMsS0FBSyxDQUFDO1lBQ0osT0FBTyxFQUFFLENBQUMscUJBQXFCLENBQUM7UUFDbEMsS0FBSyxDQUFDO1lBQ0osT0FBTyxFQUFFLENBQUMscUJBQXFCLENBQUM7UUFDbEMsS0FBSyxFQUFFO1lBQ0wsT0FBTyxFQUFFLENBQUMscUJBQXFCLENBQUM7UUFDbEMsS0FBSyxFQUFFO1lBQ0wsT0FBTyxFQUFFLENBQUMscUJBQXFCLENBQUM7UUFDbEMsS0FBSyxFQUFFO1lBQ0wsT0FBTyxFQUFFLENBQUMscUJBQXFCLENBQUM7UUFDbEMsS0FBSyxFQUFFO1lBQ0wsT0FBTyxFQUFFLENBQUMscUJBQXFCLENBQUM7UUFDbEM7WUFDRSxPQUFPLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQztJQUNwQyxDQUFDO0FBQ0gsQ0FBQztBQUVEOzs7R0FHRztBQUNILFNBQVMsOEJBQThCLENBQUMsYUFBNEI7SUFDbEUsUUFBUSwwQkFBMEIsQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDO1FBQ2xELEtBQUssQ0FBQztZQUNKLE9BQU8sRUFBRSxDQUFDLGVBQWUsQ0FBQztRQUM1QixLQUFLLENBQUM7WUFDSixPQUFPLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQztRQUM3QixLQUFLLENBQUM7WUFDSixPQUFPLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQztRQUM3QixLQUFLLENBQUM7WUFDSixPQUFPLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQztRQUM3QixLQUFLLENBQUM7WUFDSixPQUFPLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQztRQUM3QixLQUFLLEVBQUU7WUFDTCxPQUFPLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQztRQUM3QixLQUFLLEVBQUU7WUFDTCxPQUFPLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQztRQUM3QixLQUFLLEVBQUU7WUFDTCxPQUFPLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQztRQUM3QixLQUFLLEVBQUU7WUFDTCxPQUFPLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQztRQUM3QjtZQUNFLE9BQU8sRUFBRSxDQUFDLGdCQUFnQixDQUFDO0lBQy9CLENBQUM7QUFDSCxDQUFDO0FBd0dEOzs7Ozs7R0FNRztBQUNILE1BQU0sVUFBVSxhQUFhLENBQ3pCLFFBQWdCLEVBQUUsV0FBbUIsRUFBRSxVQUFnQyxFQUFFO0lBQzNFLE1BQU0sRUFBQyxtQkFBbUIsRUFBRSxtQkFBbUIsRUFBRSwrQkFBK0IsRUFBQyxHQUFHLE9BQU8sQ0FBQztJQUM1RixNQUFNLGFBQWEsR0FBRyxpQkFBaUIsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0lBQzdELE1BQU0sVUFBVSxHQUFHLElBQUksVUFBVSxFQUFFLENBQUM7SUFDcEMsTUFBTSxXQUFXLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsV0FBVyxFQUFFO1FBQzFELGtCQUFrQixFQUFFLG9CQUFvQjtRQUN4QyxHQUFHLE9BQU87UUFDVixzQkFBc0IsRUFBRSxJQUFJO1FBQzVCLGNBQWMsRUFBRSxPQUFPLENBQUMsaUJBQWlCLElBQUksSUFBSTtLQUNsRCxDQUFDLENBQUM7SUFFSCxJQUFJLENBQUMsT0FBTyxDQUFDLGtDQUFrQyxJQUFJLFdBQVcsQ0FBQyxNQUFNO1FBQ2pFLFdBQVcsQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQ2xDLE1BQU0sY0FBYyxHQUFtQjtZQUNyQyxtQkFBbUI7WUFDbkIsbUJBQW1CO1lBQ25CLE1BQU0sRUFBRSxXQUFXLENBQUMsTUFBTTtZQUMxQixLQUFLLEVBQUUsRUFBRTtZQUNULFNBQVMsRUFBRSxFQUFFO1lBQ2IsTUFBTSxFQUFFLEVBQUU7WUFDVixrQkFBa0IsRUFBRSxFQUFFO1NBQ3ZCLENBQUM7UUFDRixJQUFJLE9BQU8sQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1lBQ2hDLGNBQWMsQ0FBQyxZQUFZLEdBQUcsRUFBRSxDQUFDO1FBQ25DLENBQUM7UUFDRCxPQUFPLGNBQWMsQ0FBQztJQUN4QixDQUFDO0lBRUQsSUFBSSxTQUFTLEdBQWdCLFdBQVcsQ0FBQyxTQUFTLENBQUM7SUFFbkQsZ0VBQWdFO0lBQ2hFLGtFQUFrRTtJQUNsRSwyRUFBMkU7SUFDM0UsY0FBYztJQUNkLE1BQU0sZUFBZSxHQUFHLElBQUksZUFBZSxDQUN2QyxtQkFBbUIsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDLG1CQUFtQixFQUM3RCwrQkFBK0IsQ0FBQyxDQUFDO0lBQ3JDLE1BQU0sY0FBYyxHQUFHLGVBQWUsQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUVyRSxJQUFJLENBQUMsT0FBTyxDQUFDLGtDQUFrQyxJQUFJLGNBQWMsQ0FBQyxNQUFNO1FBQ3BFLGNBQWMsQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQ3JDLE1BQU0sY0FBYyxHQUFtQjtZQUNyQyxtQkFBbUI7WUFDbkIsbUJBQW1CO1lBQ25CLE1BQU0sRUFBRSxjQUFjLENBQUMsTUFBTTtZQUM3QixLQUFLLEVBQUUsRUFBRTtZQUNULFNBQVMsRUFBRSxFQUFFO1lBQ2IsTUFBTSxFQUFFLEVBQUU7WUFDVixrQkFBa0IsRUFBRSxFQUFFO1NBQ3ZCLENBQUM7UUFDRixJQUFJLE9BQU8sQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1lBQ2hDLGNBQWMsQ0FBQyxZQUFZLEdBQUcsRUFBRSxDQUFDO1FBQ25DLENBQUM7UUFDRCxPQUFPLGNBQWMsQ0FBQztJQUN4QixDQUFDO0lBRUQsU0FBUyxHQUFHLGNBQWMsQ0FBQyxTQUFTLENBQUM7SUFFckMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7UUFDekIsU0FBUyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxpQkFBaUIsRUFBRSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBRTlELHlGQUF5RjtRQUN6Riw2RkFBNkY7UUFDN0YsK0ZBQStGO1FBQy9GLHNEQUFzRDtRQUN0RCxJQUFJLGVBQWUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNoQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FDckIsSUFBSSxlQUFlLENBQUMsbUJBQW1CLEVBQUUsbUJBQW1CLENBQUMsS0FBSyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDdEYsQ0FBQztJQUNILENBQUM7SUFFRCxNQUFNLEVBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLGtCQUFrQixFQUFFLFlBQVksRUFBQyxHQUFHLG1CQUFtQixDQUM1RixTQUFTLEVBQUUsYUFBYSxFQUFFLEVBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsRUFBQyxDQUFDLENBQUM7SUFDcEYsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLFdBQVcsQ0FBQyxNQUFNLEVBQUUsR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7SUFFN0QsTUFBTSxjQUFjLEdBQW1CO1FBQ3JDLG1CQUFtQjtRQUNuQixtQkFBbUI7UUFDbkIsTUFBTSxFQUFFLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUk7UUFDekMsS0FBSztRQUNMLFNBQVM7UUFDVCxNQUFNO1FBQ04sa0JBQWtCO0tBQ25CLENBQUM7SUFFRixJQUFJLE9BQU8sQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1FBQ2hDLGNBQWMsQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDO0lBQzdDLENBQUM7SUFDRCxPQUFPLGNBQWMsQ0FBQztBQUN4QixDQUFDO0FBRUQsTUFBTSxlQUFlLEdBQUcsSUFBSSx3QkFBd0IsRUFBRSxDQUFDO0FBRXZEOztHQUVHO0FBQ0gsTUFBTSxVQUFVLGlCQUFpQixDQUM3QixzQkFBMkMsNEJBQTRCO0lBQ3pFLE9BQU8sSUFBSSxhQUFhLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxFQUFFLG1CQUFtQixFQUFFLGVBQWUsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUM5RixDQUFDO0FBRUQsTUFBTSxVQUFVLHFCQUFxQixDQUFDLE9BQTZCLEVBQUUsV0FBcUI7SUFDeEYsUUFBUSxPQUFPLEVBQUUsQ0FBQztRQUNoQixLQUFLLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSTtZQUM1QixPQUFPLENBQUMsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3ZDLEtBQUssSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNO1lBQzlCLE9BQU8sQ0FBQyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDekMsS0FBSyxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUs7WUFDN0IseUVBQXlFO1lBQ3pFLDZFQUE2RTtZQUM3RSxzRUFBc0U7WUFDdEUsT0FBTyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDN0QsS0FBSyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUc7WUFDM0IsT0FBTyxDQUFDLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUN0QyxLQUFLLElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWTtZQUNwQyxPQUFPLENBQUMsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFDOUM7WUFDRSxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0FBQ0gsQ0FBQztBQUVELFNBQVMscUJBQXFCLENBQUMsT0FBZSxFQUFFLElBQXFCO0lBQ25FLE1BQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDcEMsSUFBSSxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7UUFDM0MsUUFBUSxlQUFlLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLGlCQUFpQixDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDcEYsS0FBSyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUk7Z0JBQzVCLE9BQU8sQ0FBQyxDQUFDLGNBQWMsQ0FDbkIsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsaUJBQWlCLENBQUMsRUFDbEMsSUFBSSxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUNoRixJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDdEIsOEZBQThGO1lBQzlGLEtBQUssSUFBSSxDQUFDLGVBQWUsQ0FBQyxZQUFZO2dCQUNwQyxPQUFPLENBQUMsQ0FBQyxjQUFjLENBQ25CLENBQUMsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLHdCQUF3QixDQUFDLEVBQ3pDLElBQUksQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFDaEYsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3RCO2dCQUNFLE9BQU8sS0FBSyxDQUFDO1FBQ2pCLENBQUM7SUFDSCxDQUFDO1NBQU0sQ0FBQztRQUNOLE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztBQUNILENBQUM7QUFFRCxTQUFTLHVCQUF1QixDQUFDLFFBQWtCO0lBQ2pELE9BQU8sUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxPQUFPLENBQUM7QUFDbkUsQ0FBQztBQUVELFNBQVMsVUFBVSxDQUFDLElBQVk7SUFDOUIsT0FBTyxJQUFJLFlBQVksQ0FBQyxDQUFDLElBQUksSUFBSSxJQUFJLFlBQVksQ0FBQyxDQUFDLFNBQVMsSUFBSSxJQUFJLFlBQVksQ0FBQyxDQUFDLEdBQUcsQ0FBQztBQUN4RixDQUFDO0FBRUQsU0FBUyxlQUFlLENBQUMsT0FBZTtJQUN0QyxPQUFPLE9BQU8sQ0FBQyxXQUFXLEVBQUUsS0FBSyxRQUFRLENBQUM7QUFDNUMsQ0FBQztBQUVELFNBQVMsbUJBQW1CLENBQUMsUUFBa0I7SUFDN0MsT0FBTyxRQUFRLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ3BDLENBQUM7QUFFRCxTQUFTLHdCQUF3QixDQUM3QixjQUFxRCxFQUFFLElBQWEsRUFDcEUsV0FBNEI7SUFDOUIsT0FBTyxHQUFHLEVBQUU7UUFDVixNQUFNLEtBQUssR0FBRyxjQUFjLEVBQUUsQ0FBQztRQUMvQixNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDeEQsSUFBSSxXQUFXLEVBQUUsQ0FBQztZQUNoQixRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsV0FBVyxDQUFDLENBQUM7UUFDaEMsQ0FBQztRQUNELElBQUksSUFBSSxFQUFFLENBQUM7WUFDVCx1RUFBdUU7WUFDdkUsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDcEMsQ0FBQztRQUNELE9BQU8sUUFBUSxDQUFDO0lBQ2xCLENBQUMsQ0FBQztBQUNKLENBQUM7QUFFRCxrR0FBa0c7QUFDbEcsTUFBTSxvQkFBb0IsR0FBRyxtQkFBbUIsQ0FBQztBQUVqRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXlCRztBQUNILE1BQU0sVUFBVSx1QkFBdUIsQ0FDbkMsT0FBcUIsRUFBRSxRQUF1QixFQUFFLFVBQXlCLEVBQ3pFLFNBQXlDLEVBQUUsRUFDM0MsV0FBa0Q7SUFDcEQsaUdBQWlHO0lBQ2pHLGtDQUFrQztJQUNsQyxNQUFNLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7SUFFM0QsTUFBTSxVQUFVLEdBQWtCO1FBQ2hDLG1CQUFtQixDQUFDLFFBQVEsQ0FBQztRQUM3QixDQUFDLENBQUMsTUFBTSxDQUNKLHNCQUFzQixFQUFFLEVBQ3hCLDRCQUE0QixDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sQ0FBQyxFQUNuRSx3QkFBd0IsQ0FDcEIsUUFBUSxFQUFFLE9BQU8sRUFBRSwrQkFBK0IsQ0FBQyxNQUFNLEVBQUUsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztLQUMvRixDQUFDO0lBRUYsSUFBSSxXQUFXLEVBQUUsQ0FBQztRQUNoQixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xGLENBQUM7SUFFRCxPQUFPLFVBQVUsQ0FBQztBQUNwQixDQUFDO0FBRUQ7Ozs7Ozs7R0FPRztBQUNILFNBQVMsc0JBQXNCO0lBQzdCLE9BQU8sQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLG9CQUFvQixDQUFDLENBQUM7U0FDaEQsWUFBWSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQztTQUNuRCxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUM7QUFDN0MsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0J1aWx0aW5GdW5jdGlvbkNhbGwsIGNvbnZlcnRBY3Rpb25CaW5kaW5nLCBjb252ZXJ0QXNzaWdubWVudEFjdGlvbkJpbmRpbmcsIGNvbnZlcnRQcm9wZXJ0eUJpbmRpbmcsIGNvbnZlcnRQdXJlQ29tcG9uZW50U2NvcGVGdW5jdGlvbiwgY29udmVydFVwZGF0ZUFyZ3VtZW50cywgTG9jYWxSZXNvbHZlcn0gZnJvbSAnLi4vLi4vY29tcGlsZXJfdXRpbC9leHByZXNzaW9uX2NvbnZlcnRlcic7XG5pbXBvcnQge0NvbnN0YW50UG9vbH0gZnJvbSAnLi4vLi4vY29uc3RhbnRfcG9vbCc7XG5pbXBvcnQgKiBhcyBjb3JlIGZyb20gJy4uLy4uL2NvcmUnO1xuaW1wb3J0IHtBU1QsIEFzdE1lbW9yeUVmZmljaWVudFRyYW5zZm9ybWVyLCBCaW5kaW5nUGlwZSwgQmluZGluZ1R5cGUsIENhbGwsIEltcGxpY2l0UmVjZWl2ZXIsIEludGVycG9sYXRpb24sIExpdGVyYWxBcnJheSwgTGl0ZXJhbE1hcCwgTGl0ZXJhbFByaW1pdGl2ZSwgUGFyc2VkRXZlbnRUeXBlLCBQcm9wZXJ0eVJlYWR9IGZyb20gJy4uLy4uL2V4cHJlc3Npb25fcGFyc2VyL2FzdCc7XG5pbXBvcnQge0xleGVyfSBmcm9tICcuLi8uLi9leHByZXNzaW9uX3BhcnNlci9sZXhlcic7XG5pbXBvcnQge1BhcnNlcn0gZnJvbSAnLi4vLi4vZXhwcmVzc2lvbl9wYXJzZXIvcGFyc2VyJztcbmltcG9ydCAqIGFzIGkxOG4gZnJvbSAnLi4vLi4vaTE4bi9pMThuX2FzdCc7XG5pbXBvcnQgKiBhcyBodG1sIGZyb20gJy4uLy4uL21sX3BhcnNlci9hc3QnO1xuaW1wb3J0IHtERUZBVUxUX0lOVEVSUE9MQVRJT05fQ09ORklHLCBJbnRlcnBvbGF0aW9uQ29uZmlnfSBmcm9tICcuLi8uLi9tbF9wYXJzZXIvZGVmYXVsdHMnO1xuaW1wb3J0IHtIdG1sUGFyc2VyfSBmcm9tICcuLi8uLi9tbF9wYXJzZXIvaHRtbF9wYXJzZXInO1xuaW1wb3J0IHtXaGl0ZXNwYWNlVmlzaXRvcn0gZnJvbSAnLi4vLi4vbWxfcGFyc2VyL2h0bWxfd2hpdGVzcGFjZXMnO1xuaW1wb3J0IHtMZXhlclJhbmdlfSBmcm9tICcuLi8uLi9tbF9wYXJzZXIvbGV4ZXInO1xuaW1wb3J0IHtpc05nQ29udGFpbmVyIGFzIGNoZWNrSXNOZ0NvbnRhaW5lciwgc3BsaXROc05hbWV9IGZyb20gJy4uLy4uL21sX3BhcnNlci90YWdzJztcbmltcG9ydCB7bWFwTGl0ZXJhbH0gZnJvbSAnLi4vLi4vb3V0cHV0L21hcF91dGlsJztcbmltcG9ydCAqIGFzIG8gZnJvbSAnLi4vLi4vb3V0cHV0L291dHB1dF9hc3QnO1xuaW1wb3J0IHtQYXJzZUVycm9yLCBQYXJzZVNvdXJjZVNwYW4sIHNhbml0aXplSWRlbnRpZmllcn0gZnJvbSAnLi4vLi4vcGFyc2VfdXRpbCc7XG5pbXBvcnQge0RvbUVsZW1lbnRTY2hlbWFSZWdpc3RyeX0gZnJvbSAnLi4vLi4vc2NoZW1hL2RvbV9lbGVtZW50X3NjaGVtYV9yZWdpc3RyeSc7XG5pbXBvcnQge2lzSWZyYW1lU2VjdXJpdHlTZW5zaXRpdmVBdHRyfSBmcm9tICcuLi8uLi9zY2hlbWEvZG9tX3NlY3VyaXR5X3NjaGVtYSc7XG5pbXBvcnQge2lzVHJ1c3RlZFR5cGVzU2lua30gZnJvbSAnLi4vLi4vc2NoZW1hL3RydXN0ZWRfdHlwZXNfc2lua3MnO1xuaW1wb3J0IHtDc3NTZWxlY3Rvcn0gZnJvbSAnLi4vLi4vc2VsZWN0b3InO1xuaW1wb3J0IHtCaW5kaW5nUGFyc2VyfSBmcm9tICcuLi8uLi90ZW1wbGF0ZV9wYXJzZXIvYmluZGluZ19wYXJzZXInO1xuaW1wb3J0IHtlcnJvciwgcGFydGl0aW9uQXJyYXl9IGZyb20gJy4uLy4uL3V0aWwnO1xuaW1wb3J0ICogYXMgdCBmcm9tICcuLi9yM19hc3QnO1xuaW1wb3J0IHtJZGVudGlmaWVycyBhcyBSM30gZnJvbSAnLi4vcjNfaWRlbnRpZmllcnMnO1xuaW1wb3J0IHtodG1sQXN0VG9SZW5kZXIzQXN0fSBmcm9tICcuLi9yM190ZW1wbGF0ZV90cmFuc2Zvcm0nO1xuaW1wb3J0IHtwcmVwYXJlU3ludGhldGljTGlzdGVuZXJGdW5jdGlvbk5hbWUsIHByZXBhcmVTeW50aGV0aWNMaXN0ZW5lck5hbWUsIHByZXBhcmVTeW50aGV0aWNQcm9wZXJ0eU5hbWV9IGZyb20gJy4uL3V0aWwnO1xuXG5pbXBvcnQge1IzRGVmZXJCbG9ja01ldGFkYXRhfSBmcm9tICcuL2FwaSc7XG5pbXBvcnQge0kxOG5Db250ZXh0fSBmcm9tICcuL2kxOG4vY29udGV4dCc7XG5pbXBvcnQge2NyZWF0ZUdvb2dsZUdldE1zZ1N0YXRlbWVudHN9IGZyb20gJy4vaTE4bi9nZXRfbXNnX3V0aWxzJztcbmltcG9ydCB7Y3JlYXRlTG9jYWxpemVTdGF0ZW1lbnRzfSBmcm9tICcuL2kxOG4vbG9jYWxpemVfdXRpbHMnO1xuaW1wb3J0IHtJMThuTWV0YVZpc2l0b3J9IGZyb20gJy4vaTE4bi9tZXRhJztcbmltcG9ydCB7YXNzZW1ibGVCb3VuZFRleHRQbGFjZWhvbGRlcnMsIGFzc2VtYmxlSTE4bkJvdW5kU3RyaW5nLCBkZWNsYXJlSTE4blZhcmlhYmxlLCBmb3JtYXRJMThuUGxhY2Vob2xkZXJOYW1lc0luTWFwLCBnZXRUcmFuc2xhdGlvbkNvbnN0UHJlZml4LCBoYXNJMThuTWV0YSwgSTE4Tl9JQ1VfTUFQUElOR19QUkVGSVgsIGljdUZyb21JMThuTWVzc2FnZSwgaXNJMThuUm9vdE5vZGUsIGlzU2luZ2xlSTE4bkljdSwgcGxhY2Vob2xkZXJzVG9QYXJhbXMsIFRSQU5TTEFUSU9OX1ZBUl9QUkVGSVgsIHdyYXBJMThuUGxhY2Vob2xkZXJ9IGZyb20gJy4vaTE4bi91dGlsJztcbmltcG9ydCB7U3R5bGluZ0J1aWxkZXIsIFN0eWxpbmdJbnN0cnVjdGlvbn0gZnJvbSAnLi9zdHlsaW5nX2J1aWxkZXInO1xuaW1wb3J0IHthc0xpdGVyYWwsIENPTlRFWFRfTkFNRSwgRElSRUNUX0NPTlRFWFRfUkVGRVJFTkNFLCBnZXRJbnN0cnVjdGlvblN0YXRlbWVudHMsIGdldEludGVycG9sYXRpb25BcmdzTGVuZ3RoLCBJTVBMSUNJVF9SRUZFUkVOQ0UsIEluc3RydWN0aW9uLCBJbnN0cnVjdGlvblBhcmFtcywgaW52YWxpZCwgaW52b2tlSW5zdHJ1Y3Rpb24sIE5PTl9CSU5EQUJMRV9BVFRSLCBSRUZFUkVOQ0VfUFJFRklYLCBSRU5ERVJfRkxBR1MsIFJFU1RPUkVEX1ZJRVdfQ09OVEVYVF9OQU1FLCB0cmltVHJhaWxpbmdOdWxsc30gZnJvbSAnLi91dGlsJztcblxuXG5cbi8vIFNlbGVjdG9yIGF0dHJpYnV0ZSBuYW1lIG9mIGA8bmctY29udGVudD5gXG5jb25zdCBOR19DT05URU5UX1NFTEVDVF9BVFRSID0gJ3NlbGVjdCc7XG5cbi8vIEF0dHJpYnV0ZSBuYW1lIG9mIGBuZ1Byb2plY3RBc2AuXG5jb25zdCBOR19QUk9KRUNUX0FTX0FUVFJfTkFNRSA9ICduZ1Byb2plY3RBcyc7XG5cbi8vIEdsb2JhbCBzeW1ib2xzIGF2YWlsYWJsZSBvbmx5IGluc2lkZSBldmVudCBiaW5kaW5ncy5cbmNvbnN0IEVWRU5UX0JJTkRJTkdfU0NPUEVfR0xPQkFMUyA9IG5ldyBTZXQ8c3RyaW5nPihbJyRldmVudCddKTtcblxuLy8gVGFnIG5hbWUgb2YgdGhlIGBuZy10ZW1wbGF0ZWAgZWxlbWVudC5cbmNvbnN0IE5HX1RFTVBMQVRFX1RBR19OQU1FID0gJ25nLXRlbXBsYXRlJztcblxuLy8gTGlzdCBvZiBzdXBwb3J0ZWQgZ2xvYmFsIHRhcmdldHMgZm9yIGV2ZW50IGxpc3RlbmVyc1xuY29uc3QgR0xPQkFMX1RBUkdFVF9SRVNPTFZFUlMgPSBuZXcgTWFwPHN0cmluZywgby5FeHRlcm5hbFJlZmVyZW5jZT4oXG4gICAgW1snd2luZG93JywgUjMucmVzb2x2ZVdpbmRvd10sIFsnZG9jdW1lbnQnLCBSMy5yZXNvbHZlRG9jdW1lbnRdLCBbJ2JvZHknLCBSMy5yZXNvbHZlQm9keV1dKTtcblxuZXhwb3J0IGNvbnN0IExFQURJTkdfVFJJVklBX0NIQVJTID0gWycgJywgJ1xcbicsICdcXHInLCAnXFx0J107XG5cbi8vICBpZiAocmYgJiBmbGFncykgeyAuLiB9XG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyRmxhZ0NoZWNrSWZTdG10KFxuICAgIGZsYWdzOiBjb3JlLlJlbmRlckZsYWdzLCBzdGF0ZW1lbnRzOiBvLlN0YXRlbWVudFtdKTogby5JZlN0bXQge1xuICByZXR1cm4gby5pZlN0bXQoby52YXJpYWJsZShSRU5ERVJfRkxBR1MpLmJpdHdpc2VBbmQoby5saXRlcmFsKGZsYWdzKSwgbnVsbCwgZmFsc2UpLCBzdGF0ZW1lbnRzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByZXBhcmVFdmVudExpc3RlbmVyUGFyYW1ldGVycyhcbiAgICBldmVudEFzdDogdC5Cb3VuZEV2ZW50LCBoYW5kbGVyTmFtZTogc3RyaW5nfG51bGwgPSBudWxsLFxuICAgIHNjb3BlOiBCaW5kaW5nU2NvcGV8bnVsbCA9IG51bGwpOiBvLkV4cHJlc3Npb25bXSB7XG4gIGNvbnN0IHt0eXBlLCBuYW1lLCB0YXJnZXQsIHBoYXNlLCBoYW5kbGVyfSA9IGV2ZW50QXN0O1xuICBpZiAodGFyZ2V0ICYmICFHTE9CQUxfVEFSR0VUX1JFU09MVkVSUy5oYXModGFyZ2V0KSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgVW5leHBlY3RlZCBnbG9iYWwgdGFyZ2V0ICcke3RhcmdldH0nIGRlZmluZWQgZm9yICcke25hbWV9JyBldmVudC5cbiAgICAgICAgU3VwcG9ydGVkIGxpc3Qgb2YgZ2xvYmFsIHRhcmdldHM6ICR7QXJyYXkuZnJvbShHTE9CQUxfVEFSR0VUX1JFU09MVkVSUy5rZXlzKCkpfS5gKTtcbiAgfVxuXG4gIGNvbnN0IGV2ZW50QXJndW1lbnROYW1lID0gJyRldmVudCc7XG4gIGNvbnN0IGltcGxpY2l0UmVjZWl2ZXJBY2Nlc3NlcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICBjb25zdCBpbXBsaWNpdFJlY2VpdmVyRXhwciA9IChzY29wZSA9PT0gbnVsbCB8fCBzY29wZS5iaW5kaW5nTGV2ZWwgPT09IDApID9cbiAgICAgIG8udmFyaWFibGUoQ09OVEVYVF9OQU1FKSA6XG4gICAgICBzY29wZS5nZXRPckNyZWF0ZVNoYXJlZENvbnRleHRWYXIoMCk7XG4gIGNvbnN0IGJpbmRpbmdTdGF0ZW1lbnRzID0gZXZlbnRBc3QudHlwZSA9PT0gUGFyc2VkRXZlbnRUeXBlLlR3b1dheSA/XG4gICAgICBjb252ZXJ0QXNzaWdubWVudEFjdGlvbkJpbmRpbmcoXG4gICAgICAgICAgc2NvcGUsIGltcGxpY2l0UmVjZWl2ZXJFeHByLCBoYW5kbGVyLCAnYicsIGV2ZW50QXN0LmhhbmRsZXJTcGFuLCBpbXBsaWNpdFJlY2VpdmVyQWNjZXNzZXMsXG4gICAgICAgICAgRVZFTlRfQklORElOR19TQ09QRV9HTE9CQUxTKSA6XG4gICAgICBjb252ZXJ0QWN0aW9uQmluZGluZyhcbiAgICAgICAgICBzY29wZSwgaW1wbGljaXRSZWNlaXZlckV4cHIsIGhhbmRsZXIsICdiJywgZXZlbnRBc3QuaGFuZGxlclNwYW4sIGltcGxpY2l0UmVjZWl2ZXJBY2Nlc3NlcyxcbiAgICAgICAgICBFVkVOVF9CSU5ESU5HX1NDT1BFX0dMT0JBTFMpO1xuICBjb25zdCBzdGF0ZW1lbnRzID0gW107XG4gIGNvbnN0IHZhcmlhYmxlRGVjbGFyYXRpb25zID0gc2NvcGU/LnZhcmlhYmxlRGVjbGFyYXRpb25zKCk7XG4gIGNvbnN0IHJlc3RvcmVWaWV3U3RhdGVtZW50ID0gc2NvcGU/LnJlc3RvcmVWaWV3U3RhdGVtZW50KCk7XG5cbiAgaWYgKHZhcmlhYmxlRGVjbGFyYXRpb25zKSB7XG4gICAgLy8gYHZhcmlhYmxlRGVjbGFyYXRpb25zYCBuZWVkcyB0byBydW4gZmlyc3QsIGJlY2F1c2VcbiAgICAvLyBgcmVzdG9yZVZpZXdTdGF0ZW1lbnRgIGRlcGVuZHMgb24gdGhlIHJlc3VsdC5cbiAgICBzdGF0ZW1lbnRzLnB1c2goLi4udmFyaWFibGVEZWNsYXJhdGlvbnMpO1xuICB9XG5cbiAgc3RhdGVtZW50cy5wdXNoKC4uLmJpbmRpbmdTdGF0ZW1lbnRzKTtcblxuICBpZiAocmVzdG9yZVZpZXdTdGF0ZW1lbnQpIHtcbiAgICBzdGF0ZW1lbnRzLnVuc2hpZnQocmVzdG9yZVZpZXdTdGF0ZW1lbnQpO1xuXG4gICAgLy8gSWYgdGhlcmUncyBhIGByZXN0b3JlVmlld2AgY2FsbCwgd2UgbmVlZCB0byByZXNldCB0aGUgdmlldyBhdCB0aGUgZW5kIG9mIHRoZSBsaXN0ZW5lclxuICAgIC8vIGluIG9yZGVyIHRvIGF2b2lkIGEgbGVhay4gSWYgdGhlcmUncyBhIGByZXR1cm5gIHN0YXRlbWVudCBhbHJlYWR5LCB3ZSB3cmFwIGl0IGluIHRoZVxuICAgIC8vIGNhbGwsIGUuZy4gYHJldHVybiByZXNldFZpZXcoY3R4LmZvbygpKWAuIE90aGVyd2lzZSB3ZSBhZGQgdGhlIGNhbGwgYXMgdGhlIGxhc3Qgc3RhdGVtZW50LlxuICAgIGNvbnN0IGxhc3RTdGF0ZW1lbnQgPSBzdGF0ZW1lbnRzW3N0YXRlbWVudHMubGVuZ3RoIC0gMV07XG4gICAgaWYgKGxhc3RTdGF0ZW1lbnQgaW5zdGFuY2VvZiBvLlJldHVyblN0YXRlbWVudCkge1xuICAgICAgc3RhdGVtZW50c1tzdGF0ZW1lbnRzLmxlbmd0aCAtIDFdID0gbmV3IG8uUmV0dXJuU3RhdGVtZW50KFxuICAgICAgICAgIGludm9rZUluc3RydWN0aW9uKGxhc3RTdGF0ZW1lbnQudmFsdWUuc291cmNlU3BhbiwgUjMucmVzZXRWaWV3LCBbbGFzdFN0YXRlbWVudC52YWx1ZV0pKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RhdGVtZW50cy5wdXNoKG5ldyBvLkV4cHJlc3Npb25TdGF0ZW1lbnQoaW52b2tlSW5zdHJ1Y3Rpb24obnVsbCwgUjMucmVzZXRWaWV3LCBbXSkpKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBldmVudE5hbWU6IHN0cmluZyA9XG4gICAgICB0eXBlID09PSBQYXJzZWRFdmVudFR5cGUuQW5pbWF0aW9uID8gcHJlcGFyZVN5bnRoZXRpY0xpc3RlbmVyTmFtZShuYW1lLCBwaGFzZSEpIDogbmFtZTtcbiAgY29uc3QgZm5OYW1lID0gaGFuZGxlck5hbWUgJiYgc2FuaXRpemVJZGVudGlmaWVyKGhhbmRsZXJOYW1lKTtcbiAgY29uc3QgZm5BcmdzOiBvLkZuUGFyYW1bXSA9IFtdO1xuXG4gIGlmIChpbXBsaWNpdFJlY2VpdmVyQWNjZXNzZXMuaGFzKGV2ZW50QXJndW1lbnROYW1lKSkge1xuICAgIGZuQXJncy5wdXNoKG5ldyBvLkZuUGFyYW0oZXZlbnRBcmd1bWVudE5hbWUsIG8uRFlOQU1JQ19UWVBFKSk7XG4gIH1cblxuICBjb25zdCBoYW5kbGVyRm4gPSBvLmZuKGZuQXJncywgc3RhdGVtZW50cywgby5JTkZFUlJFRF9UWVBFLCBudWxsLCBmbk5hbWUpO1xuICBjb25zdCBwYXJhbXM6IG8uRXhwcmVzc2lvbltdID0gW28ubGl0ZXJhbChldmVudE5hbWUpLCBoYW5kbGVyRm5dO1xuICBpZiAodGFyZ2V0KSB7XG4gICAgcGFyYW1zLnB1c2goXG4gICAgICAgIG8ubGl0ZXJhbChmYWxzZSksICAvLyBgdXNlQ2FwdHVyZWAgZmxhZywgZGVmYXVsdHMgdG8gYGZhbHNlYFxuICAgICAgICBvLmltcG9ydEV4cHIoR0xPQkFMX1RBUkdFVF9SRVNPTFZFUlMuZ2V0KHRhcmdldCkhKSk7XG4gIH1cbiAgcmV0dXJuIHBhcmFtcztcbn1cblxuLy8gQ29sbGVjdHMgaW5mb3JtYXRpb24gbmVlZGVkIHRvIGdlbmVyYXRlIGBjb25zdHNgIGZpZWxkIG9mIHRoZSBDb21wb25lbnREZWYuXG5leHBvcnQgaW50ZXJmYWNlIENvbXBvbmVudERlZkNvbnN0cyB7XG4gIC8qKlxuICAgKiBXaGVuIGEgY29uc3RhbnQgcmVxdWlyZXMgc29tZSBwcmUtcHJvY2Vzc2luZyAoZS5nLiBpMThuIHRyYW5zbGF0aW9uIGJsb2NrIHRoYXQgaW5jbHVkZXNcbiAgICogZ29vZy5nZXRNc2cgYW5kICRsb2NhbGl6ZSBjYWxscyksIHRoZSBgcHJlcGFyZVN0YXRlbWVudHNgIHNlY3Rpb24gY29udGFpbnMgY29ycmVzcG9uZGluZ1xuICAgKiBzdGF0ZW1lbnRzLlxuICAgKi9cbiAgcHJlcGFyZVN0YXRlbWVudHM6IG8uU3RhdGVtZW50W107XG5cbiAgLyoqXG4gICAqIEFjdHVhbCBleHByZXNzaW9ucyB0aGF0IHJlcHJlc2VudCBjb25zdGFudHMuXG4gICAqL1xuICBjb25zdEV4cHJlc3Npb25zOiBvLkV4cHJlc3Npb25bXTtcblxuICAvKipcbiAgICogQ2FjaGUgdG8gYXZvaWQgZ2VuZXJhdGluZyBkdXBsaWNhdGVkIGkxOG4gdHJhbnNsYXRpb24gYmxvY2tzLlxuICAgKi9cbiAgaTE4blZhclJlZnNDYWNoZTogTWFwPGkxOG4uSTE4bk1ldGEsIG8uUmVhZFZhckV4cHI+O1xufVxuXG5mdW5jdGlvbiBjcmVhdGVDb21wb25lbnREZWZDb25zdHMoKTogQ29tcG9uZW50RGVmQ29uc3RzIHtcbiAgcmV0dXJuIHtcbiAgICBwcmVwYXJlU3RhdGVtZW50czogW10sXG4gICAgY29uc3RFeHByZXNzaW9uczogW10sXG4gICAgaTE4blZhclJlZnNDYWNoZTogbmV3IE1hcCgpLFxuICB9O1xufVxuXG5jbGFzcyBUZW1wbGF0ZURhdGEge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHJlYWRvbmx5IG5hbWU6IHN0cmluZywgcmVhZG9ubHkgaW5kZXg6IG51bWJlciwgcmVhZG9ubHkgc2NvcGU6IEJpbmRpbmdTY29wZSxcbiAgICAgIHByaXZhdGUgdmlzaXRvcjogVGVtcGxhdGVEZWZpbml0aW9uQnVpbGRlcikge31cblxuICBnZXRDb25zdENvdW50KCkge1xuICAgIHJldHVybiB0aGlzLnZpc2l0b3IuZ2V0Q29uc3RDb3VudCgpO1xuICB9XG5cbiAgZ2V0VmFyQ291bnQoKSB7XG4gICAgcmV0dXJuIHRoaXMudmlzaXRvci5nZXRWYXJDb3VudCgpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBUZW1wbGF0ZURlZmluaXRpb25CdWlsZGVyIGltcGxlbWVudHMgdC5WaXNpdG9yPHZvaWQ+LCBMb2NhbFJlc29sdmVyIHtcbiAgcHJpdmF0ZSBfZGF0YUluZGV4ID0gMDtcbiAgcHJpdmF0ZSBfYmluZGluZ0NvbnRleHQgPSAwO1xuICBwcml2YXRlIF9wcmVmaXhDb2RlOiBvLlN0YXRlbWVudFtdID0gW107XG4gIC8qKlxuICAgKiBMaXN0IG9mIGNhbGxiYWNrcyB0byBnZW5lcmF0ZSBjcmVhdGlvbiBtb2RlIGluc3RydWN0aW9ucy4gV2Ugc3RvcmUgdGhlbSBoZXJlIGFzIHdlIHByb2Nlc3NcbiAgICogdGhlIHRlbXBsYXRlIHNvIGJpbmRpbmdzIGluIGxpc3RlbmVycyBhcmUgcmVzb2x2ZWQgb25seSBvbmNlIGFsbCBub2RlcyBoYXZlIGJlZW4gdmlzaXRlZC5cbiAgICogVGhpcyBlbnN1cmVzIGFsbCBsb2NhbCByZWZzIGFuZCBjb250ZXh0IHZhcmlhYmxlcyBhcmUgYXZhaWxhYmxlIGZvciBtYXRjaGluZy5cbiAgICovXG4gIHByaXZhdGUgX2NyZWF0aW9uQ29kZUZuczogSW5zdHJ1Y3Rpb25bXSA9IFtdO1xuICAvKipcbiAgICogTGlzdCBvZiBjYWxsYmFja3MgdG8gZ2VuZXJhdGUgdXBkYXRlIG1vZGUgaW5zdHJ1Y3Rpb25zLiBXZSBzdG9yZSB0aGVtIGhlcmUgYXMgd2UgcHJvY2Vzc1xuICAgKiB0aGUgdGVtcGxhdGUgc28gYmluZGluZ3MgYXJlIHJlc29sdmVkIG9ubHkgb25jZSBhbGwgbm9kZXMgaGF2ZSBiZWVuIHZpc2l0ZWQuIFRoaXMgZW5zdXJlc1xuICAgKiBhbGwgbG9jYWwgcmVmcyBhbmQgY29udGV4dCB2YXJpYWJsZXMgYXJlIGF2YWlsYWJsZSBmb3IgbWF0Y2hpbmcuXG4gICAqL1xuICBwcml2YXRlIF91cGRhdGVDb2RlRm5zOiBJbnN0cnVjdGlvbltdID0gW107XG5cbiAgLyoqIEluZGV4IG9mIHRoZSBjdXJyZW50bHktc2VsZWN0ZWQgbm9kZS4gKi9cbiAgcHJpdmF0ZSBfY3VycmVudEluZGV4OiBudW1iZXIgPSAwO1xuXG4gIC8qKiBUZW1wb3JhcnkgdmFyaWFibGUgZGVjbGFyYXRpb25zIGdlbmVyYXRlZCBmcm9tIHZpc2l0aW5nIHBpcGVzLCBsaXRlcmFscywgZXRjLiAqL1xuICBwcml2YXRlIF90ZW1wVmFyaWFibGVzOiBvLlN0YXRlbWVudFtdID0gW107XG5cbiAgLyoqXG4gICAqIFRlbXBvcmFyeSB2YXJpYWJsZSB1c2VkIHRvIHN0b3JlIHN0YXRlIGJldHdlZW4gY29udHJvbCBmbG93IGluc3RydWN0aW9ucy5cbiAgICogU2hvdWxkIGJlIGFjY2Vzc2VkIHZpYSB0aGUgYGFsbG9jYXRlQ29udHJvbEZsb3dUZW1wVmFyaWFibGVgIG1ldGhvZC5cbiAgICovXG4gIHByaXZhdGUgX2NvbnRyb2xGbG93VGVtcFZhcmlhYmxlOiBvLlJlYWRWYXJFeHByfG51bGwgPSBudWxsO1xuXG4gIC8qKlxuICAgKiBMaXN0IG9mIGNhbGxiYWNrcyB0byBidWlsZCBuZXN0ZWQgdGVtcGxhdGVzLiBOZXN0ZWQgdGVtcGxhdGVzIG11c3Qgbm90IGJlIHZpc2l0ZWQgdW50aWxcbiAgICogYWZ0ZXIgdGhlIHBhcmVudCB0ZW1wbGF0ZSBoYXMgZmluaXNoZWQgdmlzaXRpbmcgYWxsIG9mIGl0cyBub2Rlcy4gVGhpcyBlbnN1cmVzIHRoYXQgYWxsXG4gICAqIGxvY2FsIHJlZiBiaW5kaW5ncyBpbiBuZXN0ZWQgdGVtcGxhdGVzIGFyZSBhYmxlIHRvIGZpbmQgbG9jYWwgcmVmIHZhbHVlcyBpZiB0aGUgcmVmc1xuICAgKiBhcmUgZGVmaW5lZCBhZnRlciB0aGUgdGVtcGxhdGUgZGVjbGFyYXRpb24uXG4gICAqL1xuICBwcml2YXRlIF9uZXN0ZWRUZW1wbGF0ZUZuczogKCgpID0+IHZvaWQpW10gPSBbXTtcbiAgLyoqXG4gICAqIFRoaXMgc2NvcGUgY29udGFpbnMgbG9jYWwgdmFyaWFibGVzIGRlY2xhcmVkIGluIHRoZSB1cGRhdGUgbW9kZSBibG9jayBvZiB0aGUgdGVtcGxhdGUuXG4gICAqIChlLmcuIHJlZnMgYW5kIGNvbnRleHQgdmFycyBpbiBiaW5kaW5ncylcbiAgICovXG4gIHByaXZhdGUgX2JpbmRpbmdTY29wZTogQmluZGluZ1Njb3BlO1xuICBwcml2YXRlIF92YWx1ZUNvbnZlcnRlcjogVmFsdWVDb252ZXJ0ZXI7XG5cbiAgLy8gaTE4biBjb250ZXh0IGxvY2FsIHRvIHRoaXMgdGVtcGxhdGVcbiAgcHJpdmF0ZSBpMThuOiBJMThuQ29udGV4dHxudWxsID0gbnVsbDtcblxuICAvLyBOdW1iZXIgb2Ygc2xvdHMgdG8gcmVzZXJ2ZSBmb3IgcHVyZUZ1bmN0aW9uc1xuICBwcml2YXRlIF9wdXJlRnVuY3Rpb25TbG90cyA9IDA7XG5cbiAgLy8gTnVtYmVyIG9mIGJpbmRpbmcgc2xvdHNcbiAgcHJpdmF0ZSBfYmluZGluZ1Nsb3RzID0gMDtcblxuICBwcml2YXRlIGZpbGVCYXNlZEkxOG5TdWZmaXg6IHN0cmluZztcblxuICAvLyBQcm9qZWN0aW9uIHNsb3RzIGZvdW5kIGluIHRoZSB0ZW1wbGF0ZS4gUHJvamVjdGlvbiBzbG90cyBjYW4gZGlzdHJpYnV0ZSBwcm9qZWN0ZWRcbiAgLy8gbm9kZXMgYmFzZWQgb24gYSBzZWxlY3Rvciwgb3IgY2FuIGp1c3QgdXNlIHRoZSB3aWxkY2FyZCBzZWxlY3RvciB0byBtYXRjaFxuICAvLyBhbGwgbm9kZXMgd2hpY2ggYXJlbid0IG1hdGNoaW5nIGFueSBzZWxlY3Rvci5cbiAgcHJpdmF0ZSBfbmdDb250ZW50UmVzZXJ2ZWRTbG90czogKHN0cmluZ3wnKicpW10gPSBbXTtcblxuICAvLyBOdW1iZXIgb2Ygbm9uLWRlZmF1bHQgc2VsZWN0b3JzIGZvdW5kIGluIGFsbCBwYXJlbnQgdGVtcGxhdGVzIG9mIHRoaXMgdGVtcGxhdGUuIFdlIG5lZWQgdG9cbiAgLy8gdHJhY2sgaXQgdG8gcHJvcGVybHkgYWRqdXN0IHByb2plY3Rpb24gc2xvdCBpbmRleCBpbiB0aGUgYHByb2plY3Rpb25gIGluc3RydWN0aW9uLlxuICBwcml2YXRlIF9uZ0NvbnRlbnRTZWxlY3RvcnNPZmZzZXQgPSAwO1xuXG4gIC8vIEV4cHJlc3Npb24gdGhhdCBzaG91bGQgYmUgdXNlZCBhcyBpbXBsaWNpdCByZWNlaXZlciB3aGVuIGNvbnZlcnRpbmcgdGVtcGxhdGVcbiAgLy8gZXhwcmVzc2lvbnMgdG8gb3V0cHV0IEFTVC5cbiAgcHJpdmF0ZSBfaW1wbGljaXRSZWNlaXZlckV4cHI6IG8uUmVhZFZhckV4cHJ8bnVsbCA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIGNvbnN0YW50UG9vbDogQ29uc3RhbnRQb29sLCBwYXJlbnRCaW5kaW5nU2NvcGU6IEJpbmRpbmdTY29wZSwgcHJpdmF0ZSBsZXZlbCA9IDAsXG4gICAgICBwcml2YXRlIGNvbnRleHROYW1lOiBzdHJpbmd8bnVsbCwgcHJpdmF0ZSBpMThuQ29udGV4dDogSTE4bkNvbnRleHR8bnVsbCxcbiAgICAgIHByaXZhdGUgdGVtcGxhdGVJbmRleDogbnVtYmVyfG51bGwsIHByaXZhdGUgdGVtcGxhdGVOYW1lOiBzdHJpbmd8bnVsbCxcbiAgICAgIHByaXZhdGUgX25hbWVzcGFjZTogby5FeHRlcm5hbFJlZmVyZW5jZSwgcmVsYXRpdmVDb250ZXh0RmlsZVBhdGg6IHN0cmluZyxcbiAgICAgIHByaXZhdGUgaTE4blVzZUV4dGVybmFsSWRzOiBib29sZWFuLFxuICAgICAgcHJpdmF0ZSBkZWZlckJsb2NrczogTWFwPHQuRGVmZXJyZWRCbG9jaywgUjNEZWZlckJsb2NrTWV0YWRhdGE+LFxuICAgICAgcHJpdmF0ZSBlbGVtZW50TG9jYXRpb25zOiBNYXA8dC5FbGVtZW50LCB7aW5kZXg6IG51bWJlciwgbGV2ZWw6IG51bWJlcn0+LFxuICAgICAgcHJpdmF0ZSBhbGxEZWZlcnJhYmxlRGVwc0ZuOiBvLlJlYWRWYXJFeHByfG51bGwsXG4gICAgICBwcml2YXRlIF9jb25zdGFudHM6IENvbXBvbmVudERlZkNvbnN0cyA9IGNyZWF0ZUNvbXBvbmVudERlZkNvbnN0cygpKSB7XG4gICAgdGhpcy5fYmluZGluZ1Njb3BlID0gcGFyZW50QmluZGluZ1Njb3BlLm5lc3RlZFNjb3BlKGxldmVsKTtcblxuICAgIC8vIFR1cm4gdGhlIHJlbGF0aXZlIGNvbnRleHQgZmlsZSBwYXRoIGludG8gYW4gaWRlbnRpZmllciBieSByZXBsYWNpbmcgbm9uLWFscGhhbnVtZXJpY1xuICAgIC8vIGNoYXJhY3RlcnMgd2l0aCB1bmRlcnNjb3Jlcy5cbiAgICB0aGlzLmZpbGVCYXNlZEkxOG5TdWZmaXggPSByZWxhdGl2ZUNvbnRleHRGaWxlUGF0aC5yZXBsYWNlKC9bXkEtWmEtejAtOV0vZywgJ18nKSArICdfJztcblxuICAgIHRoaXMuX3ZhbHVlQ29udmVydGVyID0gbmV3IFZhbHVlQ29udmVydGVyKFxuICAgICAgICBjb25zdGFudFBvb2wsICgpID0+IHRoaXMuYWxsb2NhdGVEYXRhU2xvdCgpLFxuICAgICAgICAobnVtU2xvdHM6IG51bWJlcikgPT4gdGhpcy5hbGxvY2F0ZVB1cmVGdW5jdGlvblNsb3RzKG51bVNsb3RzKSxcbiAgICAgICAgKG5hbWUsIGxvY2FsTmFtZSwgc2xvdCwgdmFsdWU6IG8uRXhwcmVzc2lvbikgPT4ge1xuICAgICAgICAgIHRoaXMuX2JpbmRpbmdTY29wZS5zZXQodGhpcy5sZXZlbCwgbG9jYWxOYW1lLCB2YWx1ZSk7XG4gICAgICAgICAgdGhpcy5jcmVhdGlvbkluc3RydWN0aW9uKG51bGwsIFIzLnBpcGUsIFtvLmxpdGVyYWwoc2xvdCksIG8ubGl0ZXJhbChuYW1lKV0pO1xuICAgICAgICB9KTtcbiAgfVxuXG4gIGJ1aWxkVGVtcGxhdGVGdW5jdGlvbihcbiAgICAgIG5vZGVzOiB0Lk5vZGVbXSwgdmFyaWFibGVzOiB0LlZhcmlhYmxlW10sIG5nQ29udGVudFNlbGVjdG9yc09mZnNldDogbnVtYmVyID0gMCxcbiAgICAgIGkxOG4/OiBpMThuLkkxOG5NZXRhLCB2YXJpYWJsZUFsaWFzZXM/OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+KTogby5GdW5jdGlvbkV4cHIge1xuICAgIHRoaXMuX25nQ29udGVudFNlbGVjdG9yc09mZnNldCA9IG5nQ29udGVudFNlbGVjdG9yc09mZnNldDtcblxuICAgIGlmICh0aGlzLl9uYW1lc3BhY2UgIT09IFIzLm5hbWVzcGFjZUhUTUwpIHtcbiAgICAgIHRoaXMuY3JlYXRpb25JbnN0cnVjdGlvbihudWxsLCB0aGlzLl9uYW1lc3BhY2UpO1xuICAgIH1cblxuICAgIC8vIENyZWF0ZSB2YXJpYWJsZSBiaW5kaW5nc1xuICAgIHZhcmlhYmxlcy5mb3JFYWNoKHYgPT4ge1xuICAgICAgY29uc3QgYWxpYXMgPSB2YXJpYWJsZUFsaWFzZXM/Llt2Lm5hbWVdO1xuICAgICAgdGhpcy5yZWdpc3RlckNvbnRleHRWYXJpYWJsZXModi5uYW1lLCB2LnZhbHVlKTtcbiAgICAgIGlmIChhbGlhcykge1xuICAgICAgICB0aGlzLnJlZ2lzdGVyQ29udGV4dFZhcmlhYmxlcyhhbGlhcywgdi52YWx1ZSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBJbml0aWF0ZSBpMThuIGNvbnRleHQgaW4gY2FzZTpcbiAgICAvLyAtIHRoaXMgdGVtcGxhdGUgaGFzIHBhcmVudCBpMThuIGNvbnRleHRcbiAgICAvLyAtIG9yIHRoZSB0ZW1wbGF0ZSBoYXMgaTE4biBtZXRhIGFzc29jaWF0ZWQgd2l0aCBpdCxcbiAgICAvLyAgIGJ1dCBpdCdzIG5vdCBpbml0aWF0ZWQgYnkgdGhlIEVsZW1lbnQgKGUuZy4gPG5nLXRlbXBsYXRlIGkxOG4+KVxuICAgIGNvbnN0IGluaXRJMThuQ29udGV4dCA9IHRoaXMuaTE4bkNvbnRleHQgfHxcbiAgICAgICAgKGlzSTE4blJvb3ROb2RlKGkxOG4pICYmICFpc1NpbmdsZUkxOG5JY3UoaTE4bikgJiZcbiAgICAgICAgICEoaXNTaW5nbGVFbGVtZW50VGVtcGxhdGUobm9kZXMpICYmIG5vZGVzWzBdLmkxOG4gPT09IGkxOG4pKTtcbiAgICBjb25zdCBzZWxmQ2xvc2luZ0kxOG5JbnN0cnVjdGlvbiA9IGhhc1RleHRDaGlsZHJlbk9ubHkobm9kZXMpO1xuICAgIGlmIChpbml0STE4bkNvbnRleHQpIHtcbiAgICAgIHRoaXMuaTE4blN0YXJ0KG51bGwsIGkxOG4hLCBzZWxmQ2xvc2luZ0kxOG5JbnN0cnVjdGlvbik7XG4gICAgfVxuXG4gICAgLy8gVGhpcyBpcyB0aGUgaW5pdGlhbCBwYXNzIHRocm91Z2ggdGhlIG5vZGVzIG9mIHRoaXMgdGVtcGxhdGUuIEluIHRoaXMgcGFzcywgd2VcbiAgICAvLyBxdWV1ZSBhbGwgY3JlYXRpb24gbW9kZSBhbmQgdXBkYXRlIG1vZGUgaW5zdHJ1Y3Rpb25zIGZvciBnZW5lcmF0aW9uIGluIHRoZSBzZWNvbmRcbiAgICAvLyBwYXNzLiBJdCdzIG5lY2Vzc2FyeSB0byBzZXBhcmF0ZSB0aGUgcGFzc2VzIHRvIGVuc3VyZSBsb2NhbCByZWZzIGFyZSBkZWZpbmVkIGJlZm9yZVxuICAgIC8vIHJlc29sdmluZyBiaW5kaW5ncy4gV2UgYWxzbyBjb3VudCBiaW5kaW5ncyBpbiB0aGlzIHBhc3MgYXMgd2Ugd2FsayBib3VuZCBleHByZXNzaW9ucy5cbiAgICB0LnZpc2l0QWxsKHRoaXMsIG5vZGVzKTtcblxuICAgIC8vIEFkZCB0b3RhbCBiaW5kaW5nIGNvdW50IHRvIHB1cmUgZnVuY3Rpb24gY291bnQgc28gcHVyZSBmdW5jdGlvbiBpbnN0cnVjdGlvbnMgYXJlXG4gICAgLy8gZ2VuZXJhdGVkIHdpdGggdGhlIGNvcnJlY3Qgc2xvdCBvZmZzZXQgd2hlbiB1cGRhdGUgaW5zdHJ1Y3Rpb25zIGFyZSBwcm9jZXNzZWQuXG4gICAgdGhpcy5fcHVyZUZ1bmN0aW9uU2xvdHMgKz0gdGhpcy5fYmluZGluZ1Nsb3RzO1xuXG4gICAgLy8gUGlwZXMgYXJlIHdhbGtlZCBpbiB0aGUgZmlyc3QgcGFzcyAodG8gZW5xdWV1ZSBgcGlwZSgpYCBjcmVhdGlvbiBpbnN0cnVjdGlvbnMgYW5kXG4gICAgLy8gYHBpcGVCaW5kYCB1cGRhdGUgaW5zdHJ1Y3Rpb25zKSwgc28gd2UgaGF2ZSB0byB1cGRhdGUgdGhlIHNsb3Qgb2Zmc2V0cyBtYW51YWxseVxuICAgIC8vIHRvIGFjY291bnQgZm9yIGJpbmRpbmdzLlxuICAgIHRoaXMuX3ZhbHVlQ29udmVydGVyLnVwZGF0ZVBpcGVTbG90T2Zmc2V0cyh0aGlzLl9iaW5kaW5nU2xvdHMpO1xuXG4gICAgLy8gTmVzdGVkIHRlbXBsYXRlcyBtdXN0IGJlIHByb2Nlc3NlZCBiZWZvcmUgY3JlYXRpb24gaW5zdHJ1Y3Rpb25zIHNvIHRlbXBsYXRlKClcbiAgICAvLyBpbnN0cnVjdGlvbnMgY2FuIGJlIGdlbmVyYXRlZCB3aXRoIHRoZSBjb3JyZWN0IGludGVybmFsIGNvbnN0IGNvdW50LlxuICAgIHRoaXMuX25lc3RlZFRlbXBsYXRlRm5zLmZvckVhY2goYnVpbGRUZW1wbGF0ZUZuID0+IGJ1aWxkVGVtcGxhdGVGbigpKTtcblxuICAgIC8vIE91dHB1dCB0aGUgYHByb2plY3Rpb25EZWZgIGluc3RydWN0aW9uIHdoZW4gc29tZSBgPG5nLWNvbnRlbnQ+YCB0YWdzIGFyZSBwcmVzZW50LlxuICAgIC8vIFRoZSBgcHJvamVjdGlvbkRlZmAgaW5zdHJ1Y3Rpb24gaXMgb25seSBlbWl0dGVkIGZvciB0aGUgY29tcG9uZW50IHRlbXBsYXRlIGFuZFxuICAgIC8vIGlzIHNraXBwZWQgZm9yIG5lc3RlZCB0ZW1wbGF0ZXMgKDxuZy10ZW1wbGF0ZT4gdGFncykuXG4gICAgaWYgKHRoaXMubGV2ZWwgPT09IDAgJiYgdGhpcy5fbmdDb250ZW50UmVzZXJ2ZWRTbG90cy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IHBhcmFtZXRlcnM6IG8uRXhwcmVzc2lvbltdID0gW107XG5cbiAgICAgIC8vIEJ5IGRlZmF1bHQgdGhlIGBwcm9qZWN0aW9uRGVmYCBpbnN0cnVjdGlvbnMgY3JlYXRlcyBvbmUgc2xvdCBmb3IgdGhlIHdpbGRjYXJkXG4gICAgICAvLyBzZWxlY3RvciBpZiBubyBwYXJhbWV0ZXJzIGFyZSBwYXNzZWQuIFRoZXJlZm9yZSB3ZSBvbmx5IHdhbnQgdG8gYWxsb2NhdGUgYSBuZXdcbiAgICAgIC8vIGFycmF5IGZvciB0aGUgcHJvamVjdGlvbiBzbG90cyBpZiB0aGUgZGVmYXVsdCBwcm9qZWN0aW9uIHNsb3QgaXMgbm90IHN1ZmZpY2llbnQuXG4gICAgICBpZiAodGhpcy5fbmdDb250ZW50UmVzZXJ2ZWRTbG90cy5sZW5ndGggPiAxIHx8IHRoaXMuX25nQ29udGVudFJlc2VydmVkU2xvdHNbMF0gIT09ICcqJykge1xuICAgICAgICBjb25zdCByM1Jlc2VydmVkU2xvdHMgPSB0aGlzLl9uZ0NvbnRlbnRSZXNlcnZlZFNsb3RzLm1hcChcbiAgICAgICAgICAgIHMgPT4gcyAhPT0gJyonID8gY29yZS5wYXJzZVNlbGVjdG9yVG9SM1NlbGVjdG9yKHMpIDogcyk7XG4gICAgICAgIHBhcmFtZXRlcnMucHVzaCh0aGlzLmNvbnN0YW50UG9vbC5nZXRDb25zdExpdGVyYWwoYXNMaXRlcmFsKHIzUmVzZXJ2ZWRTbG90cyksIHRydWUpKTtcbiAgICAgIH1cblxuICAgICAgLy8gU2luY2Ugd2UgYWNjdW11bGF0ZSBuZ0NvbnRlbnQgc2VsZWN0b3JzIHdoaWxlIHByb2Nlc3NpbmcgdGVtcGxhdGUgZWxlbWVudHMsXG4gICAgICAvLyB3ZSAqcHJlcGVuZCogYHByb2plY3Rpb25EZWZgIHRvIGNyZWF0aW9uIGluc3RydWN0aW9ucyBibG9jaywgdG8gcHV0IGl0IGJlZm9yZVxuICAgICAgLy8gYW55IGBwcm9qZWN0aW9uYCBpbnN0cnVjdGlvbnNcbiAgICAgIHRoaXMuY3JlYXRpb25JbnN0cnVjdGlvbihudWxsLCBSMy5wcm9qZWN0aW9uRGVmLCBwYXJhbWV0ZXJzLCAvKiBwcmVwZW5kICovIHRydWUpO1xuICAgIH1cblxuICAgIGlmIChpbml0STE4bkNvbnRleHQpIHtcbiAgICAgIHRoaXMuaTE4bkVuZChudWxsLCBzZWxmQ2xvc2luZ0kxOG5JbnN0cnVjdGlvbik7XG4gICAgfVxuXG4gICAgLy8gR2VuZXJhdGUgYWxsIHRoZSBjcmVhdGlvbiBtb2RlIGluc3RydWN0aW9ucyAoZS5nLiByZXNvbHZlIGJpbmRpbmdzIGluIGxpc3RlbmVycylcbiAgICBjb25zdCBjcmVhdGlvblN0YXRlbWVudHMgPSBnZXRJbnN0cnVjdGlvblN0YXRlbWVudHModGhpcy5fY3JlYXRpb25Db2RlRm5zKTtcblxuICAgIC8vIEdlbmVyYXRlIGFsbCB0aGUgdXBkYXRlIG1vZGUgaW5zdHJ1Y3Rpb25zIChlLmcuIHJlc29sdmUgcHJvcGVydHkgb3IgdGV4dCBiaW5kaW5ncylcbiAgICBjb25zdCB1cGRhdGVTdGF0ZW1lbnRzID0gZ2V0SW5zdHJ1Y3Rpb25TdGF0ZW1lbnRzKHRoaXMuX3VwZGF0ZUNvZGVGbnMpO1xuXG4gICAgLy8gIFZhcmlhYmxlIGRlY2xhcmF0aW9uIG11c3Qgb2NjdXIgYWZ0ZXIgYmluZGluZyByZXNvbHV0aW9uIHNvIHdlIGNhbiBnZW5lcmF0ZSBjb250ZXh0XG4gICAgLy8gIGluc3RydWN0aW9ucyB0aGF0IGJ1aWxkIG9uIGVhY2ggb3RoZXIuXG4gICAgLy8gZS5nLiBjb25zdCBiID0gbmV4dENvbnRleHQoKS4kaW1wbGljaXQoKTsgY29uc3QgYiA9IG5leHRDb250ZXh0KCk7XG4gICAgY29uc3QgY3JlYXRpb25WYXJpYWJsZXMgPSB0aGlzLl9iaW5kaW5nU2NvcGUudmlld1NuYXBzaG90U3RhdGVtZW50cygpO1xuICAgIGNvbnN0IHVwZGF0ZVZhcmlhYmxlcyA9IHRoaXMuX2JpbmRpbmdTY29wZS52YXJpYWJsZURlY2xhcmF0aW9ucygpLmNvbmNhdCh0aGlzLl90ZW1wVmFyaWFibGVzKTtcblxuICAgIGNvbnN0IGNyZWF0aW9uQmxvY2sgPSBjcmVhdGlvblN0YXRlbWVudHMubGVuZ3RoID4gMCA/XG4gICAgICAgIFtyZW5kZXJGbGFnQ2hlY2tJZlN0bXQoXG4gICAgICAgICAgICBjb3JlLlJlbmRlckZsYWdzLkNyZWF0ZSwgY3JlYXRpb25WYXJpYWJsZXMuY29uY2F0KGNyZWF0aW9uU3RhdGVtZW50cykpXSA6XG4gICAgICAgIFtdO1xuXG4gICAgY29uc3QgdXBkYXRlQmxvY2sgPSB1cGRhdGVTdGF0ZW1lbnRzLmxlbmd0aCA+IDAgP1xuICAgICAgICBbcmVuZGVyRmxhZ0NoZWNrSWZTdG10KGNvcmUuUmVuZGVyRmxhZ3MuVXBkYXRlLCB1cGRhdGVWYXJpYWJsZXMuY29uY2F0KHVwZGF0ZVN0YXRlbWVudHMpKV0gOlxuICAgICAgICBbXTtcblxuICAgIHJldHVybiBvLmZuKFxuICAgICAgICAvLyBpLmUuIChyZjogUmVuZGVyRmxhZ3MsIGN0eDogYW55KVxuICAgICAgICBbbmV3IG8uRm5QYXJhbShSRU5ERVJfRkxBR1MsIG8uTlVNQkVSX1RZUEUpLCBuZXcgby5GblBhcmFtKENPTlRFWFRfTkFNRSwgbnVsbCldLFxuICAgICAgICBbXG4gICAgICAgICAgLy8gVGVtcG9yYXJ5IHZhcmlhYmxlIGRlY2xhcmF0aW9ucyBmb3IgcXVlcnkgcmVmcmVzaCAoaS5lLiBsZXQgX3Q6IGFueTspXG4gICAgICAgICAgLi4udGhpcy5fcHJlZml4Q29kZSxcbiAgICAgICAgICAvLyBDcmVhdGluZyBtb2RlIChpLmUuIGlmIChyZiAmIFJlbmRlckZsYWdzLkNyZWF0ZSkgeyAuLi4gfSlcbiAgICAgICAgICAuLi5jcmVhdGlvbkJsb2NrLFxuICAgICAgICAgIC8vIEJpbmRpbmcgYW5kIHJlZnJlc2ggbW9kZSAoaS5lLiBpZiAocmYgJiBSZW5kZXJGbGFncy5VcGRhdGUpIHsuLi59KVxuICAgICAgICAgIC4uLnVwZGF0ZUJsb2NrLFxuICAgICAgICBdLFxuICAgICAgICBvLklORkVSUkVEX1RZUEUsIG51bGwsIHRoaXMudGVtcGxhdGVOYW1lKTtcbiAgfVxuXG4gIC8vIExvY2FsUmVzb2x2ZXJcbiAgZ2V0TG9jYWwobmFtZTogc3RyaW5nKTogby5FeHByZXNzaW9ufG51bGwge1xuICAgIHJldHVybiB0aGlzLl9iaW5kaW5nU2NvcGUuZ2V0KG5hbWUpO1xuICB9XG5cbiAgLy8gTG9jYWxSZXNvbHZlclxuICBub3RpZnlJbXBsaWNpdFJlY2VpdmVyVXNlKCk6IHZvaWQge1xuICAgIHRoaXMuX2JpbmRpbmdTY29wZS5ub3RpZnlJbXBsaWNpdFJlY2VpdmVyVXNlKCk7XG4gIH1cblxuICAvLyBMb2NhbFJlc29sdmVyXG4gIG1heWJlUmVzdG9yZVZpZXcoKTogdm9pZCB7XG4gICAgdGhpcy5fYmluZGluZ1Njb3BlLm1heWJlUmVzdG9yZVZpZXcoKTtcbiAgfVxuXG4gIHByaXZhdGUgaTE4blRyYW5zbGF0ZShcbiAgICAgIG1lc3NhZ2U6IGkxOG4uTWVzc2FnZSwgcGFyYW1zOiB7W25hbWU6IHN0cmluZ106IG8uRXhwcmVzc2lvbn0gPSB7fSwgcmVmPzogby5SZWFkVmFyRXhwcixcbiAgICAgIHRyYW5zZm9ybUZuPzogKHJhdzogby5SZWFkVmFyRXhwcikgPT4gby5FeHByZXNzaW9uKTogby5SZWFkVmFyRXhwciB7XG4gICAgY29uc3QgX3JlZiA9IHJlZiB8fCB0aGlzLmkxOG5HZW5lcmF0ZU1haW5CbG9ja1ZhcigpO1xuICAgIC8vIENsb3N1cmUgQ29tcGlsZXIgcmVxdWlyZXMgY29uc3QgbmFtZXMgdG8gc3RhcnQgd2l0aCBgTVNHX2AgYnV0IGRpc2FsbG93cyBhbnkgb3RoZXIgY29uc3QgdG9cbiAgICAvLyBzdGFydCB3aXRoIGBNU0dfYC4gV2UgZGVmaW5lIGEgdmFyaWFibGUgc3RhcnRpbmcgd2l0aCBgTVNHX2AganVzdCBmb3IgdGhlIGBnb29nLmdldE1zZ2AgY2FsbFxuICAgIGNvbnN0IGNsb3N1cmVWYXIgPSB0aGlzLmkxOG5HZW5lcmF0ZUNsb3N1cmVWYXIobWVzc2FnZS5pZCk7XG4gICAgY29uc3Qgc3RhdGVtZW50cyA9IGdldFRyYW5zbGF0aW9uRGVjbFN0bXRzKG1lc3NhZ2UsIF9yZWYsIGNsb3N1cmVWYXIsIHBhcmFtcywgdHJhbnNmb3JtRm4pO1xuICAgIHRoaXMuX2NvbnN0YW50cy5wcmVwYXJlU3RhdGVtZW50cy5wdXNoKC4uLnN0YXRlbWVudHMpO1xuICAgIHJldHVybiBfcmVmO1xuICB9XG5cbiAgcHJpdmF0ZSByZWdpc3RlckNvbnRleHRWYXJpYWJsZXMobmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKSB7XG4gICAgY29uc3Qgc2NvcGVkTmFtZSA9IHRoaXMuX2JpbmRpbmdTY29wZS5mcmVzaFJlZmVyZW5jZU5hbWUoKTtcbiAgICBjb25zdCByZXRyaWV2YWxMZXZlbCA9IHRoaXMubGV2ZWw7XG4gICAgY29uc3QgaXNEaXJlY3QgPSB2YWx1ZSA9PT0gRElSRUNUX0NPTlRFWFRfUkVGRVJFTkNFO1xuICAgIGNvbnN0IGxocyA9IG8udmFyaWFibGUobmFtZSArIHNjb3BlZE5hbWUpO1xuXG4gICAgdGhpcy5fYmluZGluZ1Njb3BlLnNldChcbiAgICAgICAgcmV0cmlldmFsTGV2ZWwsIG5hbWUsXG4gICAgICAgIHNjb3BlID0+IHtcbiAgICAgICAgICAvLyBJZiB3ZSdyZSBhdCB0aGUgdG9wIGxldmVsIGFuZCB3ZSdyZSByZWZlcnJpbmcgdG8gdGhlIGNvbnRleHQgdmFyaWFibGUgZGlyZWN0bHksIHdlXG4gICAgICAgICAgLy8gY2FuIGRvIHNvIHRocm91Z2ggdGhlIGltcGxpY2l0IHJlY2VpdmVyLCBpbnN0ZWFkIG9mIHJlbmFtaW5nIGl0LiBOb3RlIHRoYXQgdGhpcyBkb2VzXG4gICAgICAgICAgLy8gbm90IGFwcGx5IHRvIGxpc3RlbmVycywgYmVjYXVzZSB0aGV5IG5lZWQgdG8gcmVzdG9yZSB0aGUgY29udGV4dC5cbiAgICAgICAgICByZXR1cm4gaXNEaXJlY3QgJiYgc2NvcGUuYmluZGluZ0xldmVsID09PSByZXRyaWV2YWxMZXZlbCAmJiAhc2NvcGUuaXNMaXN0ZW5lclNjb3BlKCkgP1xuICAgICAgICAgICAgICBvLnZhcmlhYmxlKENPTlRFWFRfTkFNRSkgOlxuICAgICAgICAgICAgICBsaHM7XG4gICAgICAgIH0sXG4gICAgICAgIERlY2xhcmF0aW9uUHJpb3JpdHkuQ09OVEVYVCxcbiAgICAgICAgKHNjb3BlOiBCaW5kaW5nU2NvcGUsIHJlbGF0aXZlTGV2ZWw6IG51bWJlcikgPT4ge1xuICAgICAgICAgIGxldCByaHM6IG8uRXhwcmVzc2lvbjtcblxuICAgICAgICAgIGlmIChzY29wZS5iaW5kaW5nTGV2ZWwgPT09IHJldHJpZXZhbExldmVsKSB7XG4gICAgICAgICAgICBpZiAoc2NvcGUuaXNMaXN0ZW5lclNjb3BlKCkgJiYgc2NvcGUuaGFzUmVzdG9yZVZpZXdWYXJpYWJsZSgpKSB7XG4gICAgICAgICAgICAgIC8vIGUuZy4gcmVzdG9yZWRDdHguXG4gICAgICAgICAgICAgIC8vIFdlIGhhdmUgdG8gZ2V0IHRoZSBjb250ZXh0IGZyb20gYSB2aWV3IHJlZmVyZW5jZSwgaWYgb25lIGlzIGF2YWlsYWJsZSwgYmVjYXVzZVxuICAgICAgICAgICAgICAvLyB0aGUgY29udGV4dCB0aGF0IHdhcyBwYXNzZWQgaW4gZHVyaW5nIGNyZWF0aW9uIG1heSBub3QgYmUgY29ycmVjdCBhbnltb3JlLlxuICAgICAgICAgICAgICAvLyBGb3IgbW9yZSBpbmZvcm1hdGlvbiBzZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvcHVsbC80MDM2MC5cbiAgICAgICAgICAgICAgcmhzID0gby52YXJpYWJsZShSRVNUT1JFRF9WSUVXX0NPTlRFWFRfTkFNRSk7XG4gICAgICAgICAgICAgIHNjb3BlLm5vdGlmeVJlc3RvcmVkVmlld0NvbnRleHRVc2UoKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNEaXJlY3QpIHtcbiAgICAgICAgICAgICAgLy8gSWYgd2UgaGF2ZSBhIGRpcmVjdCByZWFkIG9mIHRoZSBjb250ZXh0IGF0IHRoZSB0b3AgbGV2ZWwgd2UgZG9uJ3QgbmVlZCB0b1xuICAgICAgICAgICAgICAvLyBkZWNsYXJlIGFueSB2YXJpYWJsZXMgYW5kIHdlIGNhbiByZWZlciB0byBpdCBkaXJlY3RseS5cbiAgICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gZS5nLiBjdHhcbiAgICAgICAgICAgICAgcmhzID0gby52YXJpYWJsZShDT05URVhUX05BTUUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBzaGFyZWRDdHhWYXIgPSBzY29wZS5nZXRTaGFyZWRDb250ZXh0TmFtZShyZXRyaWV2YWxMZXZlbCk7XG4gICAgICAgICAgICAvLyBlLmcuIGN0eF9yMCAgIE9SICB4KDIpO1xuICAgICAgICAgICAgcmhzID0gc2hhcmVkQ3R4VmFyID8gc2hhcmVkQ3R4VmFyIDogZ2VuZXJhdGVOZXh0Q29udGV4dEV4cHIocmVsYXRpdmVMZXZlbCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIC8vIGUuZy4gY29uc3QgJGl0ZW1zJCA9IHgoMikgZm9yIGRpcmVjdCBjb250ZXh0IHJlZmVyZW5jZXMgYW5kXG4gICAgICAgICAgICAvLyBjb25zdCAkaXRlbSQgPSB4KDIpLiRpbXBsaWNpdCBmb3IgaW5kaXJlY3Qgb25lcy5cbiAgICAgICAgICAgIGxocy5zZXQoaXNEaXJlY3QgPyByaHMgOiByaHMucHJvcCh2YWx1ZSB8fCBJTVBMSUNJVF9SRUZFUkVOQ0UpKS50b0NvbnN0RGVjbCgpXG4gICAgICAgICAgXTtcbiAgICAgICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGkxOG5BcHBlbmRCaW5kaW5ncyhleHByZXNzaW9uczogQVNUW10pIHtcbiAgICBpZiAoZXhwcmVzc2lvbnMubGVuZ3RoID4gMCkge1xuICAgICAgZXhwcmVzc2lvbnMuZm9yRWFjaChleHByZXNzaW9uID0+IHRoaXMuaTE4biEuYXBwZW5kQmluZGluZyhleHByZXNzaW9uKSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBpMThuQmluZFByb3BzKHByb3BzOiB7W2tleTogc3RyaW5nXTogdC5UZXh0fHQuQm91bmRUZXh0fSk6IHtba2V5OiBzdHJpbmddOiBvLkV4cHJlc3Npb259IHtcbiAgICBjb25zdCBib3VuZDoge1trZXk6IHN0cmluZ106IG8uRXhwcmVzc2lvbn0gPSB7fTtcbiAgICBPYmplY3Qua2V5cyhwcm9wcykuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgY29uc3QgcHJvcCA9IHByb3BzW2tleV07XG4gICAgICBpZiAocHJvcCBpbnN0YW5jZW9mIHQuVGV4dCkge1xuICAgICAgICBib3VuZFtrZXldID0gby5saXRlcmFsKHByb3AudmFsdWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBwcm9wLnZhbHVlLnZpc2l0KHRoaXMuX3ZhbHVlQ29udmVydGVyKTtcbiAgICAgICAgdGhpcy5hbGxvY2F0ZUJpbmRpbmdTbG90cyh2YWx1ZSk7XG4gICAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIEludGVycG9sYXRpb24pIHtcbiAgICAgICAgICBjb25zdCB7c3RyaW5ncywgZXhwcmVzc2lvbnN9ID0gdmFsdWU7XG4gICAgICAgICAgY29uc3Qge2lkLCBiaW5kaW5nc30gPSB0aGlzLmkxOG4hO1xuICAgICAgICAgIGNvbnN0IGxhYmVsID0gYXNzZW1ibGVJMThuQm91bmRTdHJpbmcoc3RyaW5ncywgYmluZGluZ3Muc2l6ZSwgaWQpO1xuICAgICAgICAgIHRoaXMuaTE4bkFwcGVuZEJpbmRpbmdzKGV4cHJlc3Npb25zKTtcbiAgICAgICAgICBib3VuZFtrZXldID0gby5saXRlcmFsKGxhYmVsKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBib3VuZDtcbiAgfVxuXG4gIC8vIEdlbmVyYXRlcyB0b3AgbGV2ZWwgdmFycyBmb3IgaTE4biBibG9ja3MgKGkuZS4gYGkxOG5fTmApLlxuICBwcml2YXRlIGkxOG5HZW5lcmF0ZU1haW5CbG9ja1ZhcigpOiBvLlJlYWRWYXJFeHByIHtcbiAgICByZXR1cm4gby52YXJpYWJsZSh0aGlzLmNvbnN0YW50UG9vbC51bmlxdWVOYW1lKFRSQU5TTEFUSU9OX1ZBUl9QUkVGSVgpKTtcbiAgfVxuXG4gIC8vIEdlbmVyYXRlcyB2YXJzIHdpdGggQ2xvc3VyZS1zcGVjaWZpYyBuYW1lcyBmb3IgaTE4biBibG9ja3MgKGkuZS4gYE1TR19YWFhgKS5cbiAgcHJpdmF0ZSBpMThuR2VuZXJhdGVDbG9zdXJlVmFyKG1lc3NhZ2VJZDogc3RyaW5nKTogby5SZWFkVmFyRXhwciB7XG4gICAgbGV0IG5hbWU6IHN0cmluZztcbiAgICBjb25zdCBzdWZmaXggPSB0aGlzLmZpbGVCYXNlZEkxOG5TdWZmaXgudG9VcHBlckNhc2UoKTtcbiAgICBpZiAodGhpcy5pMThuVXNlRXh0ZXJuYWxJZHMpIHtcbiAgICAgIGNvbnN0IHByZWZpeCA9IGdldFRyYW5zbGF0aW9uQ29uc3RQcmVmaXgoYEVYVEVSTkFMX2ApO1xuICAgICAgY29uc3QgdW5pcXVlU3VmZml4ID0gdGhpcy5jb25zdGFudFBvb2wudW5pcXVlTmFtZShzdWZmaXgpO1xuICAgICAgbmFtZSA9IGAke3ByZWZpeH0ke3Nhbml0aXplSWRlbnRpZmllcihtZXNzYWdlSWQpfSQkJHt1bmlxdWVTdWZmaXh9YDtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgcHJlZml4ID0gZ2V0VHJhbnNsYXRpb25Db25zdFByZWZpeChzdWZmaXgpO1xuICAgICAgbmFtZSA9IHRoaXMuY29uc3RhbnRQb29sLnVuaXF1ZU5hbWUocHJlZml4KTtcbiAgICB9XG4gICAgcmV0dXJuIG8udmFyaWFibGUobmFtZSk7XG4gIH1cblxuICBwcml2YXRlIGkxOG5VcGRhdGVSZWYoY29udGV4dDogSTE4bkNvbnRleHQpOiB2b2lkIHtcbiAgICBjb25zdCB7aWN1cywgbWV0YSwgaXNSb290LCBpc1Jlc29sdmVkLCBpc0VtaXR0ZWR9ID0gY29udGV4dDtcbiAgICBpZiAoaXNSb290ICYmIGlzUmVzb2x2ZWQgJiYgIWlzRW1pdHRlZCAmJiAhaXNTaW5nbGVJMThuSWN1KG1ldGEpKSB7XG4gICAgICBjb250ZXh0LmlzRW1pdHRlZCA9IHRydWU7XG4gICAgICBjb25zdCBwbGFjZWhvbGRlcnMgPSBjb250ZXh0LmdldFNlcmlhbGl6ZWRQbGFjZWhvbGRlcnMoKTtcbiAgICAgIGxldCBpY3VNYXBwaW5nOiB7W25hbWU6IHN0cmluZ106IG8uRXhwcmVzc2lvbn0gPSB7fTtcbiAgICAgIGxldCBwYXJhbXM6IHtbbmFtZTogc3RyaW5nXTogby5FeHByZXNzaW9ufSA9XG4gICAgICAgICAgcGxhY2Vob2xkZXJzLnNpemUgPyBwbGFjZWhvbGRlcnNUb1BhcmFtcyhwbGFjZWhvbGRlcnMpIDoge307XG4gICAgICBpZiAoaWN1cy5zaXplKSB7XG4gICAgICAgIGljdXMuZm9yRWFjaCgocmVmczogby5FeHByZXNzaW9uW10sIGtleTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgaWYgKHJlZnMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICAvLyBpZiB3ZSBoYXZlIG9uZSBJQ1UgZGVmaW5lZCBmb3IgYSBnaXZlblxuICAgICAgICAgICAgLy8gcGxhY2Vob2xkZXIgLSBqdXN0IG91dHB1dCBpdHMgcmVmZXJlbmNlXG4gICAgICAgICAgICBwYXJhbXNba2V5XSA9IHJlZnNbMF07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIC4uLiBvdGhlcndpc2Ugd2UgbmVlZCB0byBhY3RpdmF0ZSBwb3N0LXByb2Nlc3NpbmdcbiAgICAgICAgICAgIC8vIHRvIHJlcGxhY2UgSUNVIHBsYWNlaG9sZGVycyB3aXRoIHByb3BlciB2YWx1ZXNcbiAgICAgICAgICAgIGNvbnN0IHBsYWNlaG9sZGVyOiBzdHJpbmcgPSB3cmFwSTE4blBsYWNlaG9sZGVyKGAke0kxOE5fSUNVX01BUFBJTkdfUFJFRklYfSR7a2V5fWApO1xuICAgICAgICAgICAgcGFyYW1zW2tleV0gPSBvLmxpdGVyYWwocGxhY2Vob2xkZXIpO1xuICAgICAgICAgICAgaWN1TWFwcGluZ1trZXldID0gby5saXRlcmFsQXJyKHJlZnMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIHRyYW5zbGF0aW9uIHJlcXVpcmVzIHBvc3QgcHJvY2Vzc2luZyBpbiAyIGNhc2VzOlxuICAgICAgLy8gLSBpZiB3ZSBoYXZlIHBsYWNlaG9sZGVycyB3aXRoIG11bHRpcGxlIHZhbHVlcyAoZXguIGBTVEFSVF9ESVZgOiBb77+9IzHvv70sIO+/vSMy77+9LCAuLi5dKVxuICAgICAgLy8gLSBpZiB3ZSBoYXZlIG11bHRpcGxlIElDVXMgdGhhdCByZWZlciB0byB0aGUgc2FtZSBwbGFjZWhvbGRlciBuYW1lXG4gICAgICBjb25zdCBuZWVkc1Bvc3Rwcm9jZXNzaW5nID1cbiAgICAgICAgICBBcnJheS5mcm9tKHBsYWNlaG9sZGVycy52YWx1ZXMoKSkuc29tZSgodmFsdWU6IHN0cmluZ1tdKSA9PiB2YWx1ZS5sZW5ndGggPiAxKSB8fFxuICAgICAgICAgIE9iamVjdC5rZXlzKGljdU1hcHBpbmcpLmxlbmd0aDtcblxuICAgICAgbGV0IHRyYW5zZm9ybUZuO1xuICAgICAgaWYgKG5lZWRzUG9zdHByb2Nlc3NpbmcpIHtcbiAgICAgICAgdHJhbnNmb3JtRm4gPSAocmF3OiBvLlJlYWRWYXJFeHByKSA9PiB7XG4gICAgICAgICAgY29uc3QgYXJnczogby5FeHByZXNzaW9uW10gPSBbcmF3XTtcbiAgICAgICAgICBpZiAoT2JqZWN0LmtleXMoaWN1TWFwcGluZykubGVuZ3RoKSB7XG4gICAgICAgICAgICBhcmdzLnB1c2gobWFwTGl0ZXJhbChpY3VNYXBwaW5nLCB0cnVlKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBpbnZva2VJbnN0cnVjdGlvbihudWxsLCBSMy5pMThuUG9zdHByb2Nlc3MsIGFyZ3MpO1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgdGhpcy5pMThuVHJhbnNsYXRlKG1ldGEgYXMgaTE4bi5NZXNzYWdlLCBwYXJhbXMsIGNvbnRleHQucmVmLCB0cmFuc2Zvcm1Gbik7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBpMThuU3RhcnQoc3BhbjogUGFyc2VTb3VyY2VTcGFufG51bGwgPSBudWxsLCBtZXRhOiBpMThuLkkxOG5NZXRhLCBzZWxmQ2xvc2luZz86IGJvb2xlYW4pOlxuICAgICAgdm9pZCB7XG4gICAgY29uc3QgaW5kZXggPSB0aGlzLmFsbG9jYXRlRGF0YVNsb3QoKTtcbiAgICB0aGlzLmkxOG4gPSB0aGlzLmkxOG5Db250ZXh0ID9cbiAgICAgICAgdGhpcy5pMThuQ29udGV4dC5mb3JrQ2hpbGRDb250ZXh0KGluZGV4LCB0aGlzLnRlbXBsYXRlSW5kZXghLCBtZXRhKSA6XG4gICAgICAgIG5ldyBJMThuQ29udGV4dChpbmRleCwgdGhpcy5pMThuR2VuZXJhdGVNYWluQmxvY2tWYXIoKSwgMCwgdGhpcy50ZW1wbGF0ZUluZGV4LCBtZXRhKTtcblxuICAgIC8vIGdlbmVyYXRlIGkxOG5TdGFydCBpbnN0cnVjdGlvblxuICAgIGNvbnN0IHtpZCwgcmVmfSA9IHRoaXMuaTE4bjtcbiAgICBjb25zdCBwYXJhbXM6IG8uRXhwcmVzc2lvbltdID0gW28ubGl0ZXJhbChpbmRleCksIHRoaXMuYWRkVG9Db25zdHMocmVmKV07XG4gICAgaWYgKGlkID4gMCkge1xuICAgICAgLy8gZG8gbm90IHB1c2ggM3JkIGFyZ3VtZW50IChzdWItYmxvY2sgaWQpXG4gICAgICAvLyBpbnRvIGkxOG5TdGFydCBjYWxsIGZvciB0b3AgbGV2ZWwgaTE4biBjb250ZXh0XG4gICAgICBwYXJhbXMucHVzaChvLmxpdGVyYWwoaWQpKTtcbiAgICB9XG4gICAgdGhpcy5jcmVhdGlvbkluc3RydWN0aW9uKHNwYW4sIHNlbGZDbG9zaW5nID8gUjMuaTE4biA6IFIzLmkxOG5TdGFydCwgcGFyYW1zKTtcbiAgfVxuXG4gIHByaXZhdGUgaTE4bkVuZChzcGFuOiBQYXJzZVNvdXJjZVNwYW58bnVsbCA9IG51bGwsIHNlbGZDbG9zaW5nPzogYm9vbGVhbik6IHZvaWQge1xuICAgIGlmICghdGhpcy5pMThuKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2kxOG5FbmQgaXMgZXhlY3V0ZWQgd2l0aCBubyBpMThuIGNvbnRleHQgcHJlc2VudCcpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmkxOG5Db250ZXh0KSB7XG4gICAgICB0aGlzLmkxOG5Db250ZXh0LnJlY29uY2lsZUNoaWxkQ29udGV4dCh0aGlzLmkxOG4pO1xuICAgICAgdGhpcy5pMThuVXBkYXRlUmVmKHRoaXMuaTE4bkNvbnRleHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmkxOG5VcGRhdGVSZWYodGhpcy5pMThuKTtcbiAgICB9XG5cbiAgICAvLyBzZXR1cCBhY2N1bXVsYXRlZCBiaW5kaW5nc1xuICAgIGNvbnN0IHtpbmRleCwgYmluZGluZ3N9ID0gdGhpcy5pMThuO1xuICAgIGlmIChiaW5kaW5ncy5zaXplKSB7XG4gICAgICBmb3IgKGNvbnN0IGJpbmRpbmcgb2YgYmluZGluZ3MpIHtcbiAgICAgICAgLy8gZm9yIGkxOG4gYmxvY2ssIGFkdmFuY2UgdG8gdGhlIG1vc3QgcmVjZW50IGVsZW1lbnQgaW5kZXggKGJ5IHRha2luZyB0aGUgY3VycmVudCBudW1iZXIgb2ZcbiAgICAgICAgLy8gZWxlbWVudHMgYW5kIHN1YnRyYWN0aW5nIG9uZSkgYmVmb3JlIGludm9raW5nIGBpMThuRXhwYCBpbnN0cnVjdGlvbnMsIHRvIG1ha2Ugc3VyZSB0aGVcbiAgICAgICAgLy8gbmVjZXNzYXJ5IGxpZmVjeWNsZSBob29rcyBvZiBjb21wb25lbnRzL2RpcmVjdGl2ZXMgYXJlIHByb3Blcmx5IGZsdXNoZWQuXG4gICAgICAgIHRoaXMudXBkYXRlSW5zdHJ1Y3Rpb25XaXRoQWR2YW5jZShcbiAgICAgICAgICAgIHRoaXMuZ2V0Q29uc3RDb3VudCgpIC0gMSwgc3BhbiwgUjMuaTE4bkV4cCwgKCkgPT4gdGhpcy5jb252ZXJ0UHJvcGVydHlCaW5kaW5nKGJpbmRpbmcpKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy51cGRhdGVJbnN0cnVjdGlvbihzcGFuLCBSMy5pMThuQXBwbHksIFtvLmxpdGVyYWwoaW5kZXgpXSk7XG4gICAgfVxuICAgIGlmICghc2VsZkNsb3NpbmcpIHtcbiAgICAgIHRoaXMuY3JlYXRpb25JbnN0cnVjdGlvbihzcGFuLCBSMy5pMThuRW5kKTtcbiAgICB9XG4gICAgdGhpcy5pMThuID0gbnVsbDsgIC8vIHJlc2V0IGxvY2FsIGkxOG4gY29udGV4dFxuICB9XG5cbiAgcHJpdmF0ZSBpMThuQXR0cmlidXRlc0luc3RydWN0aW9uKFxuICAgICAgbm9kZUluZGV4OiBudW1iZXIsIGF0dHJzOiB0LkJvdW5kQXR0cmlidXRlW10sIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3Bhbik6IHZvaWQge1xuICAgIGxldCBoYXNCaW5kaW5ncyA9IGZhbHNlO1xuICAgIGNvbnN0IGkxOG5BdHRyQXJnczogby5FeHByZXNzaW9uW10gPSBbXTtcbiAgICBhdHRycy5mb3JFYWNoKGF0dHIgPT4ge1xuICAgICAgY29uc3QgbWVzc2FnZSA9IGF0dHIuaTE4biEgYXMgaTE4bi5NZXNzYWdlO1xuICAgICAgY29uc3QgY29udmVydGVkID0gYXR0ci52YWx1ZS52aXNpdCh0aGlzLl92YWx1ZUNvbnZlcnRlcik7XG4gICAgICB0aGlzLmFsbG9jYXRlQmluZGluZ1Nsb3RzKGNvbnZlcnRlZCk7XG4gICAgICBpZiAoY29udmVydGVkIGluc3RhbmNlb2YgSW50ZXJwb2xhdGlvbikge1xuICAgICAgICBjb25zdCBwbGFjZWhvbGRlcnMgPSBhc3NlbWJsZUJvdW5kVGV4dFBsYWNlaG9sZGVycyhtZXNzYWdlKTtcbiAgICAgICAgY29uc3QgcGFyYW1zID0gcGxhY2Vob2xkZXJzVG9QYXJhbXMocGxhY2Vob2xkZXJzKTtcbiAgICAgICAgaTE4bkF0dHJBcmdzLnB1c2goby5saXRlcmFsKGF0dHIubmFtZSksIHRoaXMuaTE4blRyYW5zbGF0ZShtZXNzYWdlLCBwYXJhbXMpKTtcbiAgICAgICAgY29udmVydGVkLmV4cHJlc3Npb25zLmZvckVhY2goZXhwcmVzc2lvbiA9PiB7XG4gICAgICAgICAgaGFzQmluZGluZ3MgPSB0cnVlO1xuICAgICAgICAgIHRoaXMudXBkYXRlSW5zdHJ1Y3Rpb25XaXRoQWR2YW5jZShcbiAgICAgICAgICAgICAgbm9kZUluZGV4LCBzb3VyY2VTcGFuLCBSMy5pMThuRXhwLCAoKSA9PiB0aGlzLmNvbnZlcnRQcm9wZXJ0eUJpbmRpbmcoZXhwcmVzc2lvbikpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAoaTE4bkF0dHJBcmdzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IGluZGV4OiBvLkV4cHJlc3Npb24gPSBvLmxpdGVyYWwodGhpcy5hbGxvY2F0ZURhdGFTbG90KCkpO1xuICAgICAgY29uc3QgY29uc3RJbmRleCA9IHRoaXMuYWRkVG9Db25zdHMoby5saXRlcmFsQXJyKGkxOG5BdHRyQXJncykpO1xuICAgICAgdGhpcy5jcmVhdGlvbkluc3RydWN0aW9uKHNvdXJjZVNwYW4sIFIzLmkxOG5BdHRyaWJ1dGVzLCBbaW5kZXgsIGNvbnN0SW5kZXhdKTtcbiAgICAgIGlmIChoYXNCaW5kaW5ncykge1xuICAgICAgICB0aGlzLnVwZGF0ZUluc3RydWN0aW9uKHNvdXJjZVNwYW4sIFIzLmkxOG5BcHBseSwgW2luZGV4XSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBnZXROYW1lc3BhY2VJbnN0cnVjdGlvbihuYW1lc3BhY2VLZXk6IHN0cmluZ3xudWxsKSB7XG4gICAgc3dpdGNoIChuYW1lc3BhY2VLZXkpIHtcbiAgICAgIGNhc2UgJ21hdGgnOlxuICAgICAgICByZXR1cm4gUjMubmFtZXNwYWNlTWF0aE1MO1xuICAgICAgY2FzZSAnc3ZnJzpcbiAgICAgICAgcmV0dXJuIFIzLm5hbWVzcGFjZVNWRztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBSMy5uYW1lc3BhY2VIVE1MO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYWRkTmFtZXNwYWNlSW5zdHJ1Y3Rpb24obnNJbnN0cnVjdGlvbjogby5FeHRlcm5hbFJlZmVyZW5jZSwgZWxlbWVudDogdC5FbGVtZW50KSB7XG4gICAgdGhpcy5fbmFtZXNwYWNlID0gbnNJbnN0cnVjdGlvbjtcbiAgICB0aGlzLmNyZWF0aW9uSW5zdHJ1Y3Rpb24oZWxlbWVudC5zdGFydFNvdXJjZVNwYW4sIG5zSW5zdHJ1Y3Rpb24pO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgYW4gdXBkYXRlIGluc3RydWN0aW9uIGZvciBhbiBpbnRlcnBvbGF0ZWQgcHJvcGVydHkgb3IgYXR0cmlidXRlLCBzdWNoIGFzXG4gICAqIGBwcm9wPVwie3t2YWx1ZX19XCJgIG9yIGBhdHRyLnRpdGxlPVwie3t2YWx1ZX19XCJgXG4gICAqL1xuICBwcml2YXRlIGludGVycG9sYXRlZFVwZGF0ZUluc3RydWN0aW9uKFxuICAgICAgaW5zdHJ1Y3Rpb246IG8uRXh0ZXJuYWxSZWZlcmVuY2UsIGVsZW1lbnRJbmRleDogbnVtYmVyLCBhdHRyTmFtZTogc3RyaW5nLFxuICAgICAgaW5wdXQ6IHQuQm91bmRBdHRyaWJ1dGUsIHZhbHVlOiBJbnRlcnBvbGF0aW9uLCBwYXJhbXM6IGFueVtdKSB7XG4gICAgdGhpcy51cGRhdGVJbnN0cnVjdGlvbldpdGhBZHZhbmNlKFxuICAgICAgICBlbGVtZW50SW5kZXgsIGlucHV0LnNvdXJjZVNwYW4sIGluc3RydWN0aW9uLFxuICAgICAgICAoKSA9PiBbby5saXRlcmFsKGF0dHJOYW1lKSwgLi4udGhpcy5nZXRVcGRhdGVJbnN0cnVjdGlvbkFyZ3VtZW50cyh2YWx1ZSksIC4uLnBhcmFtc10pO1xuICB9XG5cbiAgdmlzaXRDb250ZW50KG5nQ29udGVudDogdC5Db250ZW50KSB7XG4gICAgY29uc3Qgc2xvdCA9IHRoaXMuYWxsb2NhdGVEYXRhU2xvdCgpO1xuICAgIGNvbnN0IHByb2plY3Rpb25TbG90SWR4ID0gdGhpcy5fbmdDb250ZW50U2VsZWN0b3JzT2Zmc2V0ICsgdGhpcy5fbmdDb250ZW50UmVzZXJ2ZWRTbG90cy5sZW5ndGg7XG4gICAgY29uc3QgcGFyYW1ldGVyczogby5FeHByZXNzaW9uW10gPSBbby5saXRlcmFsKHNsb3QpXTtcblxuICAgIHRoaXMuX25nQ29udGVudFJlc2VydmVkU2xvdHMucHVzaChuZ0NvbnRlbnQuc2VsZWN0b3IpO1xuXG4gICAgY29uc3Qgbm9uQ29udGVudFNlbGVjdEF0dHJpYnV0ZXMgPVxuICAgICAgICBuZ0NvbnRlbnQuYXR0cmlidXRlcy5maWx0ZXIoYXR0ciA9PiBhdHRyLm5hbWUudG9Mb3dlckNhc2UoKSAhPT0gTkdfQ09OVEVOVF9TRUxFQ1RfQVRUUik7XG4gICAgY29uc3QgYXR0cmlidXRlcyA9XG4gICAgICAgIHRoaXMuZ2V0QXR0cmlidXRlRXhwcmVzc2lvbnMobmdDb250ZW50Lm5hbWUsIG5vbkNvbnRlbnRTZWxlY3RBdHRyaWJ1dGVzLCBbXSwgW10pO1xuXG4gICAgaWYgKGF0dHJpYnV0ZXMubGVuZ3RoID4gMCkge1xuICAgICAgcGFyYW1ldGVycy5wdXNoKG8ubGl0ZXJhbChwcm9qZWN0aW9uU2xvdElkeCksIG8ubGl0ZXJhbEFycihhdHRyaWJ1dGVzKSk7XG4gICAgfSBlbHNlIGlmIChwcm9qZWN0aW9uU2xvdElkeCAhPT0gMCkge1xuICAgICAgcGFyYW1ldGVycy5wdXNoKG8ubGl0ZXJhbChwcm9qZWN0aW9uU2xvdElkeCkpO1xuICAgIH1cblxuICAgIHRoaXMuY3JlYXRpb25JbnN0cnVjdGlvbihuZ0NvbnRlbnQuc291cmNlU3BhbiwgUjMucHJvamVjdGlvbiwgcGFyYW1ldGVycyk7XG4gICAgaWYgKHRoaXMuaTE4bikge1xuICAgICAgdGhpcy5pMThuLmFwcGVuZFByb2plY3Rpb24obmdDb250ZW50LmkxOG4hLCBzbG90KTtcbiAgICB9XG4gIH1cblxuICB2aXNpdEVsZW1lbnQoZWxlbWVudDogdC5FbGVtZW50KSB7XG4gICAgY29uc3QgZWxlbWVudEluZGV4ID0gdGhpcy5hbGxvY2F0ZURhdGFTbG90KCk7XG4gICAgY29uc3Qgc3R5bGluZ0J1aWxkZXIgPSBuZXcgU3R5bGluZ0J1aWxkZXIobnVsbCk7XG4gICAgdGhpcy5lbGVtZW50TG9jYXRpb25zLnNldChlbGVtZW50LCB7aW5kZXg6IGVsZW1lbnRJbmRleCwgbGV2ZWw6IHRoaXMubGV2ZWx9KTtcblxuICAgIGxldCBpc05vbkJpbmRhYmxlTW9kZTogYm9vbGVhbiA9IGZhbHNlO1xuICAgIGNvbnN0IGlzSTE4blJvb3RFbGVtZW50OiBib29sZWFuID1cbiAgICAgICAgaXNJMThuUm9vdE5vZGUoZWxlbWVudC5pMThuKSAmJiAhaXNTaW5nbGVJMThuSWN1KGVsZW1lbnQuaTE4bik7XG5cbiAgICBjb25zdCBvdXRwdXRBdHRyczogdC5UZXh0QXR0cmlidXRlW10gPSBbXTtcbiAgICBjb25zdCBbbmFtZXNwYWNlS2V5LCBlbGVtZW50TmFtZV0gPSBzcGxpdE5zTmFtZShlbGVtZW50Lm5hbWUpO1xuICAgIGNvbnN0IGlzTmdDb250YWluZXIgPSBjaGVja0lzTmdDb250YWluZXIoZWxlbWVudC5uYW1lKTtcblxuICAgIC8vIEhhbmRsZSBzdHlsaW5nLCBpMThuLCBuZ05vbkJpbmRhYmxlIGF0dHJpYnV0ZXNcbiAgICBmb3IgKGNvbnN0IGF0dHIgb2YgZWxlbWVudC5hdHRyaWJ1dGVzKSB7XG4gICAgICBjb25zdCB7bmFtZSwgdmFsdWV9ID0gYXR0cjtcbiAgICAgIGlmIChuYW1lID09PSBOT05fQklOREFCTEVfQVRUUikge1xuICAgICAgICBpc05vbkJpbmRhYmxlTW9kZSA9IHRydWU7XG4gICAgICB9IGVsc2UgaWYgKG5hbWUgPT09ICdzdHlsZScpIHtcbiAgICAgICAgc3R5bGluZ0J1aWxkZXIucmVnaXN0ZXJTdHlsZUF0dHIodmFsdWUpO1xuICAgICAgfSBlbHNlIGlmIChuYW1lID09PSAnY2xhc3MnKSB7XG4gICAgICAgIHN0eWxpbmdCdWlsZGVyLnJlZ2lzdGVyQ2xhc3NBdHRyKHZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG91dHB1dEF0dHJzLnB1c2goYXR0cik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gUmVndWxhciBlbGVtZW50IG9yIG5nLWNvbnRhaW5lciBjcmVhdGlvbiBtb2RlXG4gICAgY29uc3QgcGFyYW1ldGVyczogby5FeHByZXNzaW9uW10gPSBbby5saXRlcmFsKGVsZW1lbnRJbmRleCldO1xuICAgIGlmICghaXNOZ0NvbnRhaW5lcikge1xuICAgICAgcGFyYW1ldGVycy5wdXNoKG8ubGl0ZXJhbChlbGVtZW50TmFtZSkpO1xuICAgIH1cblxuICAgIC8vIEFkZCB0aGUgYXR0cmlidXRlc1xuICAgIGNvbnN0IGFsbE90aGVySW5wdXRzOiB0LkJvdW5kQXR0cmlidXRlW10gPSBbXTtcbiAgICBjb25zdCBib3VuZEkxOG5BdHRyczogdC5Cb3VuZEF0dHJpYnV0ZVtdID0gW107XG5cbiAgICBlbGVtZW50LmlucHV0cy5mb3JFYWNoKGlucHV0ID0+IHtcbiAgICAgIGNvbnN0IHN0eWxpbmdJbnB1dFdhc1NldCA9IHN0eWxpbmdCdWlsZGVyLnJlZ2lzdGVyQm91bmRJbnB1dChpbnB1dCk7XG4gICAgICBpZiAoIXN0eWxpbmdJbnB1dFdhc1NldCkge1xuICAgICAgICBpZiAoKGlucHV0LnR5cGUgPT09IEJpbmRpbmdUeXBlLlByb3BlcnR5IHx8IGlucHV0LnR5cGUgPT09IEJpbmRpbmdUeXBlLlR3b1dheSkgJiZcbiAgICAgICAgICAgIGlucHV0LmkxOG4pIHtcbiAgICAgICAgICBib3VuZEkxOG5BdHRycy5wdXNoKGlucHV0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhbGxPdGhlcklucHV0cy5wdXNoKGlucHV0KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gYWRkIGF0dHJpYnV0ZXMgZm9yIGRpcmVjdGl2ZSBhbmQgcHJvamVjdGlvbiBtYXRjaGluZyBwdXJwb3Nlc1xuICAgIGNvbnN0IGF0dHJpYnV0ZXM6IG8uRXhwcmVzc2lvbltdID0gdGhpcy5nZXRBdHRyaWJ1dGVFeHByZXNzaW9ucyhcbiAgICAgICAgZWxlbWVudC5uYW1lLCBvdXRwdXRBdHRycywgYWxsT3RoZXJJbnB1dHMsIGVsZW1lbnQub3V0cHV0cywgc3R5bGluZ0J1aWxkZXIsIFtdLFxuICAgICAgICBib3VuZEkxOG5BdHRycyk7XG4gICAgcGFyYW1ldGVycy5wdXNoKHRoaXMuYWRkQXR0cnNUb0NvbnN0cyhhdHRyaWJ1dGVzKSk7XG5cbiAgICAvLyBsb2NhbCByZWZzIChleC46IDxkaXYgI2ZvbyAjYmFyPVwiYmF6XCI+KVxuICAgIGNvbnN0IHJlZnMgPSB0aGlzLnByZXBhcmVSZWZzQXJyYXkoZWxlbWVudC5yZWZlcmVuY2VzKTtcbiAgICBwYXJhbWV0ZXJzLnB1c2godGhpcy5hZGRUb0NvbnN0cyhyZWZzKSk7XG5cbiAgICBjb25zdCB3YXNJbk5hbWVzcGFjZSA9IHRoaXMuX25hbWVzcGFjZTtcbiAgICBjb25zdCBjdXJyZW50TmFtZXNwYWNlID0gdGhpcy5nZXROYW1lc3BhY2VJbnN0cnVjdGlvbihuYW1lc3BhY2VLZXkpO1xuXG4gICAgLy8gSWYgdGhlIG5hbWVzcGFjZSBpcyBjaGFuZ2luZyBub3csIGluY2x1ZGUgYW4gaW5zdHJ1Y3Rpb24gdG8gY2hhbmdlIGl0XG4gICAgLy8gZHVyaW5nIGVsZW1lbnQgY3JlYXRpb24uXG4gICAgaWYgKGN1cnJlbnROYW1lc3BhY2UgIT09IHdhc0luTmFtZXNwYWNlKSB7XG4gICAgICB0aGlzLmFkZE5hbWVzcGFjZUluc3RydWN0aW9uKGN1cnJlbnROYW1lc3BhY2UsIGVsZW1lbnQpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmkxOG4pIHtcbiAgICAgIHRoaXMuaTE4bi5hcHBlbmRFbGVtZW50KGVsZW1lbnQuaTE4biEsIGVsZW1lbnRJbmRleCk7XG4gICAgfVxuXG4gICAgLy8gTm90ZSB0aGF0IHdlIGRvIG5vdCBhcHBlbmQgdGV4dCBub2RlIGluc3RydWN0aW9ucyBhbmQgSUNVcyBpbnNpZGUgaTE4biBzZWN0aW9uLFxuICAgIC8vIHNvIHdlIGV4Y2x1ZGUgdGhlbSB3aGlsZSBjYWxjdWxhdGluZyB3aGV0aGVyIGN1cnJlbnQgZWxlbWVudCBoYXMgY2hpbGRyZW5cbiAgICBjb25zdCBoYXNDaGlsZHJlbiA9ICghaXNJMThuUm9vdEVsZW1lbnQgJiYgdGhpcy5pMThuKSA/ICFoYXNUZXh0Q2hpbGRyZW5Pbmx5KGVsZW1lbnQuY2hpbGRyZW4pIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuY2hpbGRyZW4ubGVuZ3RoID4gMDtcblxuICAgIGNvbnN0IGNyZWF0ZVNlbGZDbG9zaW5nSW5zdHJ1Y3Rpb24gPSAhc3R5bGluZ0J1aWxkZXIuaGFzQmluZGluZ3NXaXRoUGlwZXMgJiZcbiAgICAgICAgZWxlbWVudC5vdXRwdXRzLmxlbmd0aCA9PT0gMCAmJiBib3VuZEkxOG5BdHRycy5sZW5ndGggPT09IDAgJiYgIWhhc0NoaWxkcmVuO1xuICAgIGNvbnN0IGNyZWF0ZVNlbGZDbG9zaW5nSTE4bkluc3RydWN0aW9uID1cbiAgICAgICAgIWNyZWF0ZVNlbGZDbG9zaW5nSW5zdHJ1Y3Rpb24gJiYgaGFzVGV4dENoaWxkcmVuT25seShlbGVtZW50LmNoaWxkcmVuKTtcblxuICAgIGlmIChjcmVhdGVTZWxmQ2xvc2luZ0luc3RydWN0aW9uKSB7XG4gICAgICB0aGlzLmNyZWF0aW9uSW5zdHJ1Y3Rpb24oXG4gICAgICAgICAgZWxlbWVudC5zb3VyY2VTcGFuLCBpc05nQ29udGFpbmVyID8gUjMuZWxlbWVudENvbnRhaW5lciA6IFIzLmVsZW1lbnQsXG4gICAgICAgICAgdHJpbVRyYWlsaW5nTnVsbHMocGFyYW1ldGVycykpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNyZWF0aW9uSW5zdHJ1Y3Rpb24oXG4gICAgICAgICAgZWxlbWVudC5zdGFydFNvdXJjZVNwYW4sIGlzTmdDb250YWluZXIgPyBSMy5lbGVtZW50Q29udGFpbmVyU3RhcnQgOiBSMy5lbGVtZW50U3RhcnQsXG4gICAgICAgICAgdHJpbVRyYWlsaW5nTnVsbHMocGFyYW1ldGVycykpO1xuXG4gICAgICBpZiAoaXNOb25CaW5kYWJsZU1vZGUpIHtcbiAgICAgICAgdGhpcy5jcmVhdGlvbkluc3RydWN0aW9uKGVsZW1lbnQuc3RhcnRTb3VyY2VTcGFuLCBSMy5kaXNhYmxlQmluZGluZ3MpO1xuICAgICAgfVxuXG4gICAgICBpZiAoYm91bmRJMThuQXR0cnMubGVuZ3RoID4gMCkge1xuICAgICAgICB0aGlzLmkxOG5BdHRyaWJ1dGVzSW5zdHJ1Y3Rpb24oXG4gICAgICAgICAgICBlbGVtZW50SW5kZXgsIGJvdW5kSTE4bkF0dHJzLCBlbGVtZW50LnN0YXJ0U291cmNlU3BhbiA/PyBlbGVtZW50LnNvdXJjZVNwYW4pO1xuICAgICAgfVxuXG4gICAgICAvLyBHZW5lcmF0ZSBMaXN0ZW5lcnMgKG91dHB1dHMpXG4gICAgICBpZiAoZWxlbWVudC5vdXRwdXRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgZm9yIChjb25zdCBvdXRwdXRBc3Qgb2YgZWxlbWVudC5vdXRwdXRzKSB7XG4gICAgICAgICAgdGhpcy5jcmVhdGlvbkluc3RydWN0aW9uKFxuICAgICAgICAgICAgICBvdXRwdXRBc3Quc291cmNlU3BhbixcbiAgICAgICAgICAgICAgb3V0cHV0QXN0LnR5cGUgPT09IFBhcnNlZEV2ZW50VHlwZS5Ud29XYXkgPyBSMy50d29XYXlMaXN0ZW5lciA6IFIzLmxpc3RlbmVyLFxuICAgICAgICAgICAgICB0aGlzLnByZXBhcmVMaXN0ZW5lclBhcmFtZXRlcihlbGVtZW50Lm5hbWUsIG91dHB1dEFzdCwgZWxlbWVudEluZGV4KSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gTm90ZTogaXQncyBpbXBvcnRhbnQgdG8ga2VlcCBpMThuL2kxOG5TdGFydCBpbnN0cnVjdGlvbnMgYWZ0ZXIgaTE4bkF0dHJpYnV0ZXMgYW5kXG4gICAgICAvLyBsaXN0ZW5lcnMsIHRvIG1ha2Ugc3VyZSBpMThuQXR0cmlidXRlcyBpbnN0cnVjdGlvbiB0YXJnZXRzIGN1cnJlbnQgZWxlbWVudCBhdCBydW50aW1lLlxuICAgICAgaWYgKGlzSTE4blJvb3RFbGVtZW50KSB7XG4gICAgICAgIHRoaXMuaTE4blN0YXJ0KGVsZW1lbnQuc3RhcnRTb3VyY2VTcGFuLCBlbGVtZW50LmkxOG4hLCBjcmVhdGVTZWxmQ2xvc2luZ0kxOG5JbnN0cnVjdGlvbik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gdGhlIGNvZGUgaGVyZSB3aWxsIGNvbGxlY3QgYWxsIHVwZGF0ZS1sZXZlbCBzdHlsaW5nIGluc3RydWN0aW9ucyBhbmQgYWRkIHRoZW0gdG8gdGhlXG4gICAgLy8gdXBkYXRlIGJsb2NrIG9mIHRoZSB0ZW1wbGF0ZSBmdW5jdGlvbiBBT1QgY29kZS4gSW5zdHJ1Y3Rpb25zIGxpa2UgYHN0eWxlUHJvcGAsXG4gICAgLy8gYHN0eWxlTWFwYCwgYGNsYXNzTWFwYCwgYGNsYXNzUHJvcGBcbiAgICAvLyBhcmUgYWxsIGdlbmVyYXRlZCBhbmQgYXNzaWduZWQgaW4gdGhlIGNvZGUgYmVsb3cuXG4gICAgY29uc3Qgc3R5bGluZ0luc3RydWN0aW9ucyA9IHN0eWxpbmdCdWlsZGVyLmJ1aWxkVXBkYXRlTGV2ZWxJbnN0cnVjdGlvbnModGhpcy5fdmFsdWVDb252ZXJ0ZXIpO1xuICAgIGNvbnN0IGxpbWl0ID0gc3R5bGluZ0luc3RydWN0aW9ucy5sZW5ndGggLSAxO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDw9IGxpbWl0OyBpKyspIHtcbiAgICAgIGNvbnN0IGluc3RydWN0aW9uID0gc3R5bGluZ0luc3RydWN0aW9uc1tpXTtcbiAgICAgIHRoaXMuX2JpbmRpbmdTbG90cyArPSB0aGlzLnByb2Nlc3NTdHlsaW5nVXBkYXRlSW5zdHJ1Y3Rpb24oZWxlbWVudEluZGV4LCBpbnN0cnVjdGlvbik7XG4gICAgfVxuXG4gICAgLy8gdGhlIHJlYXNvbiB3aHkgYHVuZGVmaW5lZGAgaXMgdXNlZCBpcyBiZWNhdXNlIHRoZSByZW5kZXJlciB1bmRlcnN0YW5kcyB0aGlzIGFzIGFcbiAgICAvLyBzcGVjaWFsIHZhbHVlIHRvIHN5bWJvbGl6ZSB0aGF0IHRoZXJlIGlzIG5vIFJIUyB0byB0aGlzIGJpbmRpbmdcbiAgICAvLyBUT0RPIChtYXRza28pOiByZXZpc2l0IHRoaXMgb25jZSBGVy05NTkgaXMgYXBwcm9hY2hlZFxuICAgIGNvbnN0IGVtcHR5VmFsdWVCaW5kSW5zdHJ1Y3Rpb24gPSBvLmxpdGVyYWwodW5kZWZpbmVkKTtcbiAgICBjb25zdCBwcm9wZXJ0eUJpbmRpbmdzOiBJbnN0cnVjdGlvbltdID0gW107XG4gICAgY29uc3QgYXR0cmlidXRlQmluZGluZ3M6IE9taXQ8SW5zdHJ1Y3Rpb24sICdyZWZlcmVuY2UnPltdID0gW107XG5cbiAgICAvLyBHZW5lcmF0ZSBlbGVtZW50IGlucHV0IGJpbmRpbmdzXG4gICAgYWxsT3RoZXJJbnB1dHMuZm9yRWFjaChpbnB1dCA9PiB7XG4gICAgICBjb25zdCBpbnB1dFR5cGUgPSBpbnB1dC50eXBlO1xuICAgICAgaWYgKGlucHV0VHlwZSA9PT0gQmluZGluZ1R5cGUuQW5pbWF0aW9uKSB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gaW5wdXQudmFsdWUudmlzaXQodGhpcy5fdmFsdWVDb252ZXJ0ZXIpO1xuICAgICAgICAvLyBhbmltYXRpb24gYmluZGluZ3MgY2FuIGJlIHByZXNlbnRlZCBpbiB0aGUgZm9sbG93aW5nIGZvcm1hdHM6XG4gICAgICAgIC8vIDEuIFtAYmluZGluZ109XCJmb29FeHBcIlxuICAgICAgICAvLyAyLiBbQGJpbmRpbmddPVwie3ZhbHVlOmZvb0V4cCwgcGFyYW1zOnsuLi59fVwiXG4gICAgICAgIC8vIDMuIFtAYmluZGluZ11cbiAgICAgICAgLy8gNC4gQGJpbmRpbmdcbiAgICAgICAgLy8gQWxsIGZvcm1hdHMgd2lsbCBiZSB2YWxpZCBmb3Igd2hlbiBhIHN5bnRoZXRpYyBiaW5kaW5nIGlzIGNyZWF0ZWQuXG4gICAgICAgIC8vIFRoZSByZWFzb25pbmcgZm9yIHRoaXMgaXMgYmVjYXVzZSB0aGUgcmVuZGVyZXIgc2hvdWxkIGdldCBlYWNoXG4gICAgICAgIC8vIHN5bnRoZXRpYyBiaW5kaW5nIHZhbHVlIGluIHRoZSBvcmRlciBvZiB0aGUgYXJyYXkgdGhhdCB0aGV5IGFyZVxuICAgICAgICAvLyBkZWZpbmVkIGluLi4uXG4gICAgICAgIGNvbnN0IGhhc1ZhbHVlID0gdmFsdWUgaW5zdGFuY2VvZiBMaXRlcmFsUHJpbWl0aXZlID8gISF2YWx1ZS52YWx1ZSA6IHRydWU7XG4gICAgICAgIHRoaXMuYWxsb2NhdGVCaW5kaW5nU2xvdHModmFsdWUpO1xuXG4gICAgICAgIHByb3BlcnR5QmluZGluZ3MucHVzaCh7XG4gICAgICAgICAgc3BhbjogaW5wdXQuc291cmNlU3BhbixcbiAgICAgICAgICByZWZlcmVuY2U6IFIzLnByb3BlcnR5LFxuICAgICAgICAgIHBhcmFtc09yRm46IGdldEJpbmRpbmdGdW5jdGlvblBhcmFtcyhcbiAgICAgICAgICAgICAgKCkgPT4gaGFzVmFsdWUgPyB0aGlzLmNvbnZlcnRQcm9wZXJ0eUJpbmRpbmcodmFsdWUpIDogZW1wdHlWYWx1ZUJpbmRJbnN0cnVjdGlvbixcbiAgICAgICAgICAgICAgcHJlcGFyZVN5bnRoZXRpY1Byb3BlcnR5TmFtZShpbnB1dC5uYW1lKSlcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyB3ZSBtdXN0IHNraXAgYXR0cmlidXRlcyB3aXRoIGFzc29jaWF0ZWQgaTE4biBjb250ZXh0LCBzaW5jZSB0aGVzZSBhdHRyaWJ1dGVzIGFyZSBoYW5kbGVkXG4gICAgICAgIC8vIHNlcGFyYXRlbHkgYW5kIGNvcnJlc3BvbmRpbmcgYGkxOG5FeHBgIGFuZCBgaTE4bkFwcGx5YCBpbnN0cnVjdGlvbnMgd2lsbCBiZSBnZW5lcmF0ZWRcbiAgICAgICAgaWYgKGlucHV0LmkxOG4pIHJldHVybjtcblxuICAgICAgICBjb25zdCB2YWx1ZSA9IGlucHV0LnZhbHVlLnZpc2l0KHRoaXMuX3ZhbHVlQ29udmVydGVyKTtcbiAgICAgICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBjb25zdCBwYXJhbXM6IGFueVtdID0gW107XG4gICAgICAgICAgY29uc3QgW2F0dHJOYW1lc3BhY2UsIGF0dHJOYW1lXSA9IHNwbGl0TnNOYW1lKGlucHV0Lm5hbWUpO1xuICAgICAgICAgIGNvbnN0IGlzQXR0cmlidXRlQmluZGluZyA9IGlucHV0VHlwZSA9PT0gQmluZGluZ1R5cGUuQXR0cmlidXRlO1xuICAgICAgICAgIGxldCBzYW5pdGl6YXRpb25SZWYgPSByZXNvbHZlU2FuaXRpemF0aW9uRm4oaW5wdXQuc2VjdXJpdHlDb250ZXh0LCBpc0F0dHJpYnV0ZUJpbmRpbmcpO1xuICAgICAgICAgIGlmICghc2FuaXRpemF0aW9uUmVmKSB7XG4gICAgICAgICAgICAvLyBJZiB0aGVyZSB3YXMgbm8gc2FuaXRpemF0aW9uIGZ1bmN0aW9uIGZvdW5kIGJhc2VkIG9uIHRoZSBzZWN1cml0eSBjb250ZXh0XG4gICAgICAgICAgICAvLyBvZiBhbiBhdHRyaWJ1dGUvcHJvcGVydHkgLSBjaGVjayB3aGV0aGVyIHRoaXMgYXR0cmlidXRlL3Byb3BlcnR5IGlzXG4gICAgICAgICAgICAvLyBvbmUgb2YgdGhlIHNlY3VyaXR5LXNlbnNpdGl2ZSA8aWZyYW1lPiBhdHRyaWJ1dGVzIChhbmQgdGhhdCB0aGUgY3VycmVudFxuICAgICAgICAgICAgLy8gZWxlbWVudCBpcyBhY3R1YWxseSBhbiA8aWZyYW1lPikuXG4gICAgICAgICAgICBpZiAoaXNJZnJhbWVFbGVtZW50KGVsZW1lbnQubmFtZSkgJiYgaXNJZnJhbWVTZWN1cml0eVNlbnNpdGl2ZUF0dHIoaW5wdXQubmFtZSkpIHtcbiAgICAgICAgICAgICAgc2FuaXRpemF0aW9uUmVmID0gby5pbXBvcnRFeHByKFIzLnZhbGlkYXRlSWZyYW1lQXR0cmlidXRlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHNhbml0aXphdGlvblJlZikge1xuICAgICAgICAgICAgcGFyYW1zLnB1c2goc2FuaXRpemF0aW9uUmVmKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGF0dHJOYW1lc3BhY2UpIHtcbiAgICAgICAgICAgIGNvbnN0IG5hbWVzcGFjZUxpdGVyYWwgPSBvLmxpdGVyYWwoYXR0ck5hbWVzcGFjZSk7XG5cbiAgICAgICAgICAgIGlmIChzYW5pdGl6YXRpb25SZWYpIHtcbiAgICAgICAgICAgICAgcGFyYW1zLnB1c2gobmFtZXNwYWNlTGl0ZXJhbCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBJZiB0aGVyZSB3YXNuJ3QgYSBzYW5pdGl6YXRpb24gcmVmLCB3ZSBuZWVkIHRvIGFkZFxuICAgICAgICAgICAgICAvLyBhbiBleHRyYSBwYXJhbSBzbyB0aGF0IHdlIGNhbiBwYXNzIGluIHRoZSBuYW1lc3BhY2UuXG4gICAgICAgICAgICAgIHBhcmFtcy5wdXNoKG8ubGl0ZXJhbChudWxsKSwgbmFtZXNwYWNlTGl0ZXJhbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuYWxsb2NhdGVCaW5kaW5nU2xvdHModmFsdWUpO1xuXG4gICAgICAgICAgLy8gTm90ZTogd2UgZG9uJ3Qgc2VwYXJhdGUgdHdvLXdheSBwcm9wZXJ0eSBiaW5kaW5ncyBhbmQgcmVndWxhciBvbmVzLFxuICAgICAgICAgIC8vIGJlY2F1c2UgdGhlaXIgYXNzaWdubWVudCBvcmRlciBuZWVkcyB0byBiZSBtYWludGFpbmVkLlxuICAgICAgICAgIGlmIChpbnB1dFR5cGUgPT09IEJpbmRpbmdUeXBlLlByb3BlcnR5IHx8IGlucHV0VHlwZSA9PT0gQmluZGluZ1R5cGUuVHdvV2F5KSB7XG4gICAgICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBJbnRlcnBvbGF0aW9uKSB7XG4gICAgICAgICAgICAgIC8vIHByb3A9XCJ7e3ZhbHVlfX1cIiBhbmQgZnJpZW5kc1xuICAgICAgICAgICAgICB0aGlzLmludGVycG9sYXRlZFVwZGF0ZUluc3RydWN0aW9uKFxuICAgICAgICAgICAgICAgICAgZ2V0UHJvcGVydHlJbnRlcnBvbGF0aW9uRXhwcmVzc2lvbih2YWx1ZSksIGVsZW1lbnRJbmRleCwgYXR0ck5hbWUsIGlucHV0LCB2YWx1ZSxcbiAgICAgICAgICAgICAgICAgIHBhcmFtcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBbcHJvcF09XCJ2YWx1ZVwiXG4gICAgICAgICAgICAgIC8vIENvbGxlY3QgYWxsIHRoZSBwcm9wZXJ0aWVzIHNvIHRoYXQgd2UgY2FuIGNoYWluIGludG8gYSBzaW5nbGUgZnVuY3Rpb24gYXQgdGhlIGVuZC5cbiAgICAgICAgICAgICAgcHJvcGVydHlCaW5kaW5ncy5wdXNoKHtcbiAgICAgICAgICAgICAgICBzcGFuOiBpbnB1dC5zb3VyY2VTcGFuLFxuICAgICAgICAgICAgICAgIHJlZmVyZW5jZTogaW5wdXRUeXBlID09PSBCaW5kaW5nVHlwZS5Ud29XYXkgPyBSMy50d29XYXlQcm9wZXJ0eSA6IFIzLnByb3BlcnR5LFxuICAgICAgICAgICAgICAgIHBhcmFtc09yRm46IGdldEJpbmRpbmdGdW5jdGlvblBhcmFtcyhcbiAgICAgICAgICAgICAgICAgICAgKCkgPT4gdGhpcy5jb252ZXJ0UHJvcGVydHlCaW5kaW5nKHZhbHVlKSwgYXR0ck5hbWUsIHBhcmFtcylcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGlmIChpbnB1dFR5cGUgPT09IEJpbmRpbmdUeXBlLkF0dHJpYnV0ZSkge1xuICAgICAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgSW50ZXJwb2xhdGlvbiAmJiBnZXRJbnRlcnBvbGF0aW9uQXJnc0xlbmd0aCh2YWx1ZSkgPiAxKSB7XG4gICAgICAgICAgICAgIC8vIGF0dHIubmFtZT1cInRleHR7e3ZhbHVlfX1cIiBhbmQgZnJpZW5kc1xuICAgICAgICAgICAgICB0aGlzLmludGVycG9sYXRlZFVwZGF0ZUluc3RydWN0aW9uKFxuICAgICAgICAgICAgICAgICAgZ2V0QXR0cmlidXRlSW50ZXJwb2xhdGlvbkV4cHJlc3Npb24odmFsdWUpLCBlbGVtZW50SW5kZXgsIGF0dHJOYW1lLCBpbnB1dCwgdmFsdWUsXG4gICAgICAgICAgICAgICAgICBwYXJhbXMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgY29uc3QgYm91bmRWYWx1ZSA9IHZhbHVlIGluc3RhbmNlb2YgSW50ZXJwb2xhdGlvbiA/IHZhbHVlLmV4cHJlc3Npb25zWzBdIDogdmFsdWU7XG4gICAgICAgICAgICAgIC8vIFthdHRyLm5hbWVdPVwidmFsdWVcIiBvciBhdHRyLm5hbWU9XCJ7e3ZhbHVlfX1cIlxuICAgICAgICAgICAgICAvLyBDb2xsZWN0IHRoZSBhdHRyaWJ1dGUgYmluZGluZ3Mgc28gdGhhdCB0aGV5IGNhbiBiZSBjaGFpbmVkIGF0IHRoZSBlbmQuXG4gICAgICAgICAgICAgIGF0dHJpYnV0ZUJpbmRpbmdzLnB1c2goe1xuICAgICAgICAgICAgICAgIHNwYW46IGlucHV0LnNvdXJjZVNwYW4sXG4gICAgICAgICAgICAgICAgcGFyYW1zT3JGbjogZ2V0QmluZGluZ0Z1bmN0aW9uUGFyYW1zKFxuICAgICAgICAgICAgICAgICAgICAoKSA9PiB0aGlzLmNvbnZlcnRQcm9wZXJ0eUJpbmRpbmcoYm91bmRWYWx1ZSksIGF0dHJOYW1lLCBwYXJhbXMpXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBjbGFzcyBwcm9wXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUluc3RydWN0aW9uV2l0aEFkdmFuY2UoZWxlbWVudEluZGV4LCBpbnB1dC5zb3VyY2VTcGFuLCBSMy5jbGFzc1Byb3AsICgpID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICBvLmxpdGVyYWwoZWxlbWVudEluZGV4KSwgby5saXRlcmFsKGF0dHJOYW1lKSwgdGhpcy5jb252ZXJ0UHJvcGVydHlCaW5kaW5nKHZhbHVlKSxcbiAgICAgICAgICAgICAgICAuLi5wYXJhbXNcbiAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgZm9yIChjb25zdCBwcm9wZXJ0eUJpbmRpbmcgb2YgcHJvcGVydHlCaW5kaW5ncykge1xuICAgICAgdGhpcy51cGRhdGVJbnN0cnVjdGlvbldpdGhBZHZhbmNlKFxuICAgICAgICAgIGVsZW1lbnRJbmRleCwgcHJvcGVydHlCaW5kaW5nLnNwYW4sIHByb3BlcnR5QmluZGluZy5yZWZlcmVuY2UsXG4gICAgICAgICAgcHJvcGVydHlCaW5kaW5nLnBhcmFtc09yRm4pO1xuICAgIH1cblxuICAgIGZvciAoY29uc3QgYXR0cmlidXRlQmluZGluZyBvZiBhdHRyaWJ1dGVCaW5kaW5ncykge1xuICAgICAgdGhpcy51cGRhdGVJbnN0cnVjdGlvbldpdGhBZHZhbmNlKFxuICAgICAgICAgIGVsZW1lbnRJbmRleCwgYXR0cmlidXRlQmluZGluZy5zcGFuLCBSMy5hdHRyaWJ1dGUsIGF0dHJpYnV0ZUJpbmRpbmcucGFyYW1zT3JGbik7XG4gICAgfVxuXG4gICAgLy8gVHJhdmVyc2UgZWxlbWVudCBjaGlsZCBub2Rlc1xuICAgIHQudmlzaXRBbGwodGhpcywgZWxlbWVudC5jaGlsZHJlbik7XG5cbiAgICBpZiAoIWlzSTE4blJvb3RFbGVtZW50ICYmIHRoaXMuaTE4bikge1xuICAgICAgdGhpcy5pMThuLmFwcGVuZEVsZW1lbnQoZWxlbWVudC5pMThuISwgZWxlbWVudEluZGV4LCB0cnVlKTtcbiAgICB9XG5cbiAgICBpZiAoIWNyZWF0ZVNlbGZDbG9zaW5nSW5zdHJ1Y3Rpb24pIHtcbiAgICAgIC8vIEZpbmlzaCBlbGVtZW50IGNvbnN0cnVjdGlvbiBtb2RlLlxuICAgICAgY29uc3Qgc3BhbiA9IGVsZW1lbnQuZW5kU291cmNlU3BhbiA/PyBlbGVtZW50LnNvdXJjZVNwYW47XG4gICAgICBpZiAoaXNJMThuUm9vdEVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5pMThuRW5kKHNwYW4sIGNyZWF0ZVNlbGZDbG9zaW5nSTE4bkluc3RydWN0aW9uKTtcbiAgICAgIH1cbiAgICAgIGlmIChpc05vbkJpbmRhYmxlTW9kZSkge1xuICAgICAgICB0aGlzLmNyZWF0aW9uSW5zdHJ1Y3Rpb24oc3BhbiwgUjMuZW5hYmxlQmluZGluZ3MpO1xuICAgICAgfVxuICAgICAgdGhpcy5jcmVhdGlvbkluc3RydWN0aW9uKHNwYW4sIGlzTmdDb250YWluZXIgPyBSMy5lbGVtZW50Q29udGFpbmVyRW5kIDogUjMuZWxlbWVudEVuZCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBwcmVwYXJlRW1iZWRkZWRUZW1wbGF0ZUZuKFxuICAgICAgY2hpbGRyZW46IHQuTm9kZVtdLCBjb250ZXh0TmFtZVN1ZmZpeDogc3RyaW5nLCB2YXJpYWJsZXM6IHQuVmFyaWFibGVbXSA9IFtdLFxuICAgICAgaTE4bk1ldGE/OiBpMThuLkkxOG5NZXRhLCB2YXJpYWJsZUFsaWFzZXM/OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+KSB7XG4gICAgY29uc3QgaW5kZXggPSB0aGlzLmFsbG9jYXRlRGF0YVNsb3QoKTtcblxuICAgIGlmICh0aGlzLmkxOG4gJiYgaTE4bk1ldGEpIHtcbiAgICAgIGlmIChpMThuTWV0YSBpbnN0YW5jZW9mIGkxOG4uQmxvY2tQbGFjZWhvbGRlcikge1xuICAgICAgICB0aGlzLmkxOG4uYXBwZW5kQmxvY2soaTE4bk1ldGEsIGluZGV4KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuaTE4bi5hcHBlbmRUZW1wbGF0ZShpMThuTWV0YSwgaW5kZXgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGNvbnRleHROYW1lID0gYCR7dGhpcy5jb250ZXh0TmFtZX0ke2NvbnRleHROYW1lU3VmZml4fV8ke2luZGV4fWA7XG4gICAgLy8gTm90ZTogRm9yIHRoZSB1bmlxdWUgbmFtZSwgd2UgZG9uJ3QgaW5jbHVkZSBhbiB1bmlxdWUgc3VmZml4LCB1bmxlc3MgcmVhbGx5IG5lZWRlZC5cbiAgICAvLyBUaGlzIGtlZXBzIHRoZSBnZW5lcmF0ZWQgb3V0cHV0IG1vcmUgY2xlYW4gYXMgbW9zdCBvZiB0aGUgdGltZSwgd2UgZG9uJ3QgZXhwZWN0IGNvbmZsaWN0cy5cbiAgICBjb25zdCBuYW1lID1cbiAgICAgICAgdGhpcy5jb25zdGFudFBvb2wudW5pcXVlTmFtZShgJHtjb250ZXh0TmFtZX1fVGVtcGxhdGVgLCAvKiogYWx3YXlzSW5jbHVkZVN1ZmZpeCAqLyBmYWxzZSk7XG5cbiAgICAvLyBDcmVhdGUgdGhlIHRlbXBsYXRlIGZ1bmN0aW9uXG4gICAgY29uc3QgdmlzaXRvciA9IG5ldyBUZW1wbGF0ZURlZmluaXRpb25CdWlsZGVyKFxuICAgICAgICB0aGlzLmNvbnN0YW50UG9vbCwgdGhpcy5fYmluZGluZ1Njb3BlLCB0aGlzLmxldmVsICsgMSwgY29udGV4dE5hbWUsIHRoaXMuaTE4biwgaW5kZXgsIG5hbWUsXG4gICAgICAgIHRoaXMuX25hbWVzcGFjZSwgdGhpcy5maWxlQmFzZWRJMThuU3VmZml4LCB0aGlzLmkxOG5Vc2VFeHRlcm5hbElkcywgdGhpcy5kZWZlckJsb2NrcyxcbiAgICAgICAgdGhpcy5lbGVtZW50TG9jYXRpb25zLCB0aGlzLmFsbERlZmVycmFibGVEZXBzRm4sIHRoaXMuX2NvbnN0YW50cyk7XG5cbiAgICAvLyBOZXN0ZWQgdGVtcGxhdGVzIG11c3Qgbm90IGJlIHZpc2l0ZWQgdW50aWwgYWZ0ZXIgdGhlaXIgcGFyZW50IHRlbXBsYXRlcyBoYXZlIGNvbXBsZXRlZFxuICAgIC8vIHByb2Nlc3NpbmcsIHNvIHRoZXkgYXJlIHF1ZXVlZCBoZXJlIHVudGlsIGFmdGVyIHRoZSBpbml0aWFsIHBhc3MuIE90aGVyd2lzZSwgd2Ugd291bGRuJ3RcbiAgICAvLyBiZSBhYmxlIHRvIHN1cHBvcnQgYmluZGluZ3MgaW4gbmVzdGVkIHRlbXBsYXRlcyB0byBsb2NhbCByZWZzIHRoYXQgb2NjdXIgYWZ0ZXIgdGhlXG4gICAgLy8gdGVtcGxhdGUgZGVmaW5pdGlvbi4gZS5nLiA8ZGl2ICpuZ0lmPVwic2hvd2luZ1wiPnt7IGZvbyB9fTwvZGl2PiAgPGRpdiAjZm9vPjwvZGl2PlxuICAgIHRoaXMuX25lc3RlZFRlbXBsYXRlRm5zLnB1c2goKCkgPT4ge1xuICAgICAgY29uc3QgdGVtcGxhdGVGdW5jdGlvbkV4cHIgPSB2aXNpdG9yLmJ1aWxkVGVtcGxhdGVGdW5jdGlvbihcbiAgICAgICAgICBjaGlsZHJlbiwgdmFyaWFibGVzLCB0aGlzLl9uZ0NvbnRlbnRSZXNlcnZlZFNsb3RzLmxlbmd0aCArIHRoaXMuX25nQ29udGVudFNlbGVjdG9yc09mZnNldCxcbiAgICAgICAgICBpMThuTWV0YSwgdmFyaWFibGVBbGlhc2VzKTtcbiAgICAgIHRoaXMuY29uc3RhbnRQb29sLnN0YXRlbWVudHMucHVzaCh0ZW1wbGF0ZUZ1bmN0aW9uRXhwci50b0RlY2xTdG10KG5hbWUpKTtcbiAgICAgIGlmICh2aXNpdG9yLl9uZ0NvbnRlbnRSZXNlcnZlZFNsb3RzLmxlbmd0aCkge1xuICAgICAgICB0aGlzLl9uZ0NvbnRlbnRSZXNlcnZlZFNsb3RzLnB1c2goLi4udmlzaXRvci5fbmdDb250ZW50UmVzZXJ2ZWRTbG90cyk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gbmV3IFRlbXBsYXRlRGF0YShuYW1lLCBpbmRleCwgdmlzaXRvci5fYmluZGluZ1Njb3BlLCB2aXNpdG9yKTtcbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlRW1iZWRkZWRUZW1wbGF0ZUZuKFxuICAgICAgdGFnTmFtZTogc3RyaW5nfG51bGwsIGNoaWxkcmVuOiB0Lk5vZGVbXSwgY29udGV4dE5hbWVTdWZmaXg6IHN0cmluZyxcbiAgICAgIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbiwgdmFyaWFibGVzOiB0LlZhcmlhYmxlW10gPSBbXSwgYXR0cnNFeHBycz86IG8uRXhwcmVzc2lvbltdLFxuICAgICAgcmVmZXJlbmNlcz86IHQuUmVmZXJlbmNlW10sIGkxOG4/OiBpMThuLkkxOG5NZXRhKTogbnVtYmVyIHtcbiAgICBjb25zdCBkYXRhID0gdGhpcy5wcmVwYXJlRW1iZWRkZWRUZW1wbGF0ZUZuKGNoaWxkcmVuLCBjb250ZXh0TmFtZVN1ZmZpeCwgdmFyaWFibGVzLCBpMThuKTtcbiAgICBjb25zdCBwYXJhbWV0ZXJzOiBvLkV4cHJlc3Npb25bXSA9IFtcbiAgICAgIG8ubGl0ZXJhbChkYXRhLmluZGV4KSxcbiAgICAgIG8udmFyaWFibGUoZGF0YS5uYW1lKSxcbiAgICAgIG8ubGl0ZXJhbCh0YWdOYW1lKSxcbiAgICAgIHRoaXMuYWRkQXR0cnNUb0NvbnN0cyhhdHRyc0V4cHJzIHx8IG51bGwpLFxuICAgIF07XG5cbiAgICAvLyBsb2NhbCByZWZzIChleC46IDxuZy10ZW1wbGF0ZSAjZm9vPilcbiAgICBpZiAocmVmZXJlbmNlcyAmJiByZWZlcmVuY2VzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IHJlZnMgPSB0aGlzLnByZXBhcmVSZWZzQXJyYXkocmVmZXJlbmNlcyk7XG4gICAgICBwYXJhbWV0ZXJzLnB1c2godGhpcy5hZGRUb0NvbnN0cyhyZWZzKSk7XG4gICAgICBwYXJhbWV0ZXJzLnB1c2goby5pbXBvcnRFeHByKFIzLnRlbXBsYXRlUmVmRXh0cmFjdG9yKSk7XG4gICAgfVxuXG4gICAgLy8gZS5nLiB0ZW1wbGF0ZSgxLCBNeUNvbXBfVGVtcGxhdGVfMSlcbiAgICB0aGlzLmNyZWF0aW9uSW5zdHJ1Y3Rpb24oc291cmNlU3BhbiwgUjMudGVtcGxhdGVDcmVhdGUsICgpID0+IHtcbiAgICAgIHBhcmFtZXRlcnMuc3BsaWNlKDIsIDAsIG8ubGl0ZXJhbChkYXRhLmdldENvbnN0Q291bnQoKSksIG8ubGl0ZXJhbChkYXRhLmdldFZhckNvdW50KCkpKTtcbiAgICAgIHJldHVybiB0cmltVHJhaWxpbmdOdWxscyhwYXJhbWV0ZXJzKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBkYXRhLmluZGV4O1xuICB9XG5cbiAgdmlzaXRUZW1wbGF0ZSh0ZW1wbGF0ZTogdC5UZW1wbGF0ZSkge1xuICAgIC8vIFdlIGRvbid0IGNhcmUgYWJvdXQgdGhlIHRhZydzIG5hbWVzcGFjZSBoZXJlLCBiZWNhdXNlIHdlIGluZmVyXG4gICAgLy8gaXQgYmFzZWQgb24gdGhlIHBhcmVudCBub2RlcyBpbnNpZGUgdGhlIHRlbXBsYXRlIGluc3RydWN0aW9uLlxuICAgIGNvbnN0IHRhZ05hbWVXaXRob3V0TmFtZXNwYWNlID1cbiAgICAgICAgdGVtcGxhdGUudGFnTmFtZSA/IHNwbGl0TnNOYW1lKHRlbXBsYXRlLnRhZ05hbWUpWzFdIDogdGVtcGxhdGUudGFnTmFtZTtcbiAgICBjb25zdCBjb250ZXh0TmFtZVN1ZmZpeCA9IHRlbXBsYXRlLnRhZ05hbWUgPyAnXycgKyBzYW5pdGl6ZUlkZW50aWZpZXIodGVtcGxhdGUudGFnTmFtZSkgOiAnJztcblxuICAgIC8vIHByZXBhcmUgYXR0cmlidXRlcyBwYXJhbWV0ZXIgKGluY2x1ZGluZyBhdHRyaWJ1dGVzIHVzZWQgZm9yIGRpcmVjdGl2ZSBtYXRjaGluZylcbiAgICBjb25zdCBhdHRyc0V4cHJzOiBvLkV4cHJlc3Npb25bXSA9IHRoaXMuZ2V0QXR0cmlidXRlRXhwcmVzc2lvbnMoXG4gICAgICAgIE5HX1RFTVBMQVRFX1RBR19OQU1FLCB0ZW1wbGF0ZS5hdHRyaWJ1dGVzLCB0ZW1wbGF0ZS5pbnB1dHMsIHRlbXBsYXRlLm91dHB1dHMsXG4gICAgICAgIHVuZGVmaW5lZCAvKiBzdHlsZXMgKi8sIHRlbXBsYXRlLnRlbXBsYXRlQXR0cnMpO1xuXG4gICAgY29uc3QgdGVtcGxhdGVJbmRleCA9IHRoaXMuY3JlYXRlRW1iZWRkZWRUZW1wbGF0ZUZuKFxuICAgICAgICB0YWdOYW1lV2l0aG91dE5hbWVzcGFjZSwgdGVtcGxhdGUuY2hpbGRyZW4sIGNvbnRleHROYW1lU3VmZml4LCB0ZW1wbGF0ZS5zb3VyY2VTcGFuLFxuICAgICAgICB0ZW1wbGF0ZS52YXJpYWJsZXMsIGF0dHJzRXhwcnMsIHRlbXBsYXRlLnJlZmVyZW5jZXMsIHRlbXBsYXRlLmkxOG4pO1xuXG4gICAgLy8gaGFuZGxlIHByb3BlcnR5IGJpbmRpbmdzIGUuZy4gybXJtXByb3BlcnR5KCduZ0Zvck9mJywgY3R4Lml0ZW1zKSwgZXQgYWw7XG4gICAgdGhpcy50ZW1wbGF0ZVByb3BlcnR5QmluZGluZ3ModGVtcGxhdGVJbmRleCwgdGVtcGxhdGUudGVtcGxhdGVBdHRycyk7XG5cbiAgICAvLyBPbmx5IGFkZCBub3JtYWwgaW5wdXQvb3V0cHV0IGJpbmRpbmcgaW5zdHJ1Y3Rpb25zIG9uIGV4cGxpY2l0IDxuZy10ZW1wbGF0ZT4gZWxlbWVudHMuXG4gICAgaWYgKHRhZ05hbWVXaXRob3V0TmFtZXNwYWNlID09PSBOR19URU1QTEFURV9UQUdfTkFNRSkge1xuICAgICAgY29uc3QgW2kxOG5JbnB1dHMsIGlucHV0c10gPVxuICAgICAgICAgIHBhcnRpdGlvbkFycmF5PHQuQm91bmRBdHRyaWJ1dGUsIHQuQm91bmRBdHRyaWJ1dGU+KHRlbXBsYXRlLmlucHV0cywgaGFzSTE4bk1ldGEpO1xuXG4gICAgICAvLyBBZGQgaTE4biBhdHRyaWJ1dGVzIHRoYXQgbWF5IGFjdCBhcyBpbnB1dHMgdG8gZGlyZWN0aXZlcy4gSWYgc3VjaCBhdHRyaWJ1dGVzIGFyZSBwcmVzZW50LFxuICAgICAgLy8gZ2VuZXJhdGUgYGkxOG5BdHRyaWJ1dGVzYCBpbnN0cnVjdGlvbi4gTm90ZTogd2UgZ2VuZXJhdGUgaXQgb25seSBmb3IgZXhwbGljaXQgPG5nLXRlbXBsYXRlPlxuICAgICAgLy8gZWxlbWVudHMsIGluIGNhc2Ugb2YgaW5saW5lIHRlbXBsYXRlcywgY29ycmVzcG9uZGluZyBpbnN0cnVjdGlvbnMgd2lsbCBiZSBnZW5lcmF0ZWQgaW4gdGhlXG4gICAgICAvLyBuZXN0ZWQgdGVtcGxhdGUgZnVuY3Rpb24uXG4gICAgICBpZiAoaTE4bklucHV0cy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHRoaXMuaTE4bkF0dHJpYnV0ZXNJbnN0cnVjdGlvbihcbiAgICAgICAgICAgIHRlbXBsYXRlSW5kZXgsIGkxOG5JbnB1dHMsIHRlbXBsYXRlLnN0YXJ0U291cmNlU3BhbiA/PyB0ZW1wbGF0ZS5zb3VyY2VTcGFuKTtcbiAgICAgIH1cblxuICAgICAgLy8gQWRkIHRoZSBpbnB1dCBiaW5kaW5nc1xuICAgICAgaWYgKGlucHV0cy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHRoaXMudGVtcGxhdGVQcm9wZXJ0eUJpbmRpbmdzKHRlbXBsYXRlSW5kZXgsIGlucHV0cyk7XG4gICAgICB9XG5cbiAgICAgIC8vIEdlbmVyYXRlIGxpc3RlbmVycyBmb3IgZGlyZWN0aXZlIG91dHB1dFxuICAgICAgZm9yIChjb25zdCBvdXRwdXRBc3Qgb2YgdGVtcGxhdGUub3V0cHV0cykge1xuICAgICAgICB0aGlzLmNyZWF0aW9uSW5zdHJ1Y3Rpb24oXG4gICAgICAgICAgICBvdXRwdXRBc3Quc291cmNlU3BhbixcbiAgICAgICAgICAgIG91dHB1dEFzdC50eXBlID09PSBQYXJzZWRFdmVudFR5cGUuVHdvV2F5ID8gUjMudHdvV2F5TGlzdGVuZXIgOiBSMy5saXN0ZW5lcixcbiAgICAgICAgICAgIHRoaXMucHJlcGFyZUxpc3RlbmVyUGFyYW1ldGVyKCduZ190ZW1wbGF0ZScsIG91dHB1dEFzdCwgdGVtcGxhdGVJbmRleCkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIFRoZXNlIHNob3VsZCBiZSBoYW5kbGVkIGluIHRoZSB0ZW1wbGF0ZSBvciBlbGVtZW50IGRpcmVjdGx5LlxuICByZWFkb25seSB2aXNpdFJlZmVyZW5jZSA9IGludmFsaWQ7XG4gIHJlYWRvbmx5IHZpc2l0VmFyaWFibGUgPSBpbnZhbGlkO1xuICByZWFkb25seSB2aXNpdFRleHRBdHRyaWJ1dGUgPSBpbnZhbGlkO1xuICByZWFkb25seSB2aXNpdEJvdW5kQXR0cmlidXRlID0gaW52YWxpZDtcbiAgcmVhZG9ubHkgdmlzaXRCb3VuZEV2ZW50ID0gaW52YWxpZDtcbiAgcmVhZG9ubHkgdmlzaXREZWZlcnJlZFRyaWdnZXIgPSBpbnZhbGlkO1xuICByZWFkb25seSB2aXNpdERlZmVycmVkQmxvY2tFcnJvciA9IGludmFsaWQ7XG4gIHJlYWRvbmx5IHZpc2l0RGVmZXJyZWRCbG9ja0xvYWRpbmcgPSBpbnZhbGlkO1xuICByZWFkb25seSB2aXNpdERlZmVycmVkQmxvY2tQbGFjZWhvbGRlciA9IGludmFsaWQ7XG4gIHJlYWRvbmx5IHZpc2l0SWZCbG9ja0JyYW5jaCA9IGludmFsaWQ7XG4gIHJlYWRvbmx5IHZpc2l0U3dpdGNoQmxvY2tDYXNlID0gaW52YWxpZDtcbiAgcmVhZG9ubHkgdmlzaXRGb3JMb29wQmxvY2tFbXB0eSA9IGludmFsaWQ7XG4gIHJlYWRvbmx5IHZpc2l0VW5rbm93bkJsb2NrID0gaW52YWxpZDtcblxuICB2aXNpdEJvdW5kVGV4dCh0ZXh0OiB0LkJvdW5kVGV4dCkge1xuICAgIGlmICh0aGlzLmkxOG4pIHtcbiAgICAgIGNvbnN0IHZhbHVlID0gdGV4dC52YWx1ZS52aXNpdCh0aGlzLl92YWx1ZUNvbnZlcnRlcik7XG4gICAgICB0aGlzLmFsbG9jYXRlQmluZGluZ1Nsb3RzKHZhbHVlKTtcbiAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIEludGVycG9sYXRpb24pIHtcbiAgICAgICAgdGhpcy5pMThuLmFwcGVuZEJvdW5kVGV4dCh0ZXh0LmkxOG4hKTtcbiAgICAgICAgdGhpcy5pMThuQXBwZW5kQmluZGluZ3ModmFsdWUuZXhwcmVzc2lvbnMpO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IG5vZGVJbmRleCA9IHRoaXMuYWxsb2NhdGVEYXRhU2xvdCgpO1xuXG4gICAgdGhpcy5jcmVhdGlvbkluc3RydWN0aW9uKHRleHQuc291cmNlU3BhbiwgUjMudGV4dCwgW28ubGl0ZXJhbChub2RlSW5kZXgpXSk7XG5cbiAgICBjb25zdCB2YWx1ZSA9IHRleHQudmFsdWUudmlzaXQodGhpcy5fdmFsdWVDb252ZXJ0ZXIpO1xuICAgIHRoaXMuYWxsb2NhdGVCaW5kaW5nU2xvdHModmFsdWUpO1xuXG4gICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgSW50ZXJwb2xhdGlvbikge1xuICAgICAgdGhpcy51cGRhdGVJbnN0cnVjdGlvbldpdGhBZHZhbmNlKFxuICAgICAgICAgIG5vZGVJbmRleCwgdGV4dC5zb3VyY2VTcGFuLCBnZXRUZXh0SW50ZXJwb2xhdGlvbkV4cHJlc3Npb24odmFsdWUpLFxuICAgICAgICAgICgpID0+IHRoaXMuZ2V0VXBkYXRlSW5zdHJ1Y3Rpb25Bcmd1bWVudHModmFsdWUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZXJyb3IoJ1RleHQgbm9kZXMgc2hvdWxkIGJlIGludGVycG9sYXRlZCBhbmQgbmV2ZXIgYm91bmQgZGlyZWN0bHkuJyk7XG4gICAgfVxuICB9XG5cbiAgdmlzaXRUZXh0KHRleHQ6IHQuVGV4dCkge1xuICAgIC8vIHdoZW4gYSB0ZXh0IGVsZW1lbnQgaXMgbG9jYXRlZCB3aXRoaW4gYSB0cmFuc2xhdGFibGVcbiAgICAvLyBibG9jaywgd2UgZXhjbHVkZSB0aGlzIHRleHQgZWxlbWVudCBmcm9tIGluc3RydWN0aW9ucyBzZXQsXG4gICAgLy8gc2luY2UgaXQgd2lsbCBiZSBjYXB0dXJlZCBpbiBpMThuIGNvbnRlbnQgYW5kIHByb2Nlc3NlZCBhdCBydW50aW1lXG4gICAgaWYgKCF0aGlzLmkxOG4pIHtcbiAgICAgIHRoaXMuY3JlYXRpb25JbnN0cnVjdGlvbihcbiAgICAgICAgICB0ZXh0LnNvdXJjZVNwYW4sIFIzLnRleHQsIFtvLmxpdGVyYWwodGhpcy5hbGxvY2F0ZURhdGFTbG90KCkpLCBvLmxpdGVyYWwodGV4dC52YWx1ZSldKTtcbiAgICB9XG4gIH1cblxuICB2aXNpdEljdShpY3U6IHQuSWN1KSB7XG4gICAgbGV0IGluaXRXYXNJbnZva2VkID0gZmFsc2U7XG5cbiAgICAvLyBpZiBhbiBJQ1Ugd2FzIGNyZWF0ZWQgb3V0c2lkZSBvZiBpMThuIGJsb2NrLCB3ZSBzdGlsbCB0cmVhdFxuICAgIC8vIGl0IGFzIGEgdHJhbnNsYXRhYmxlIGVudGl0eSBhbmQgaW52b2tlIGkxOG5TdGFydCBhbmQgaTE4bkVuZFxuICAgIC8vIHRvIGdlbmVyYXRlIGkxOG4gY29udGV4dCBhbmQgdGhlIG5lY2Vzc2FyeSBpbnN0cnVjdGlvbnNcbiAgICBpZiAoIXRoaXMuaTE4bikge1xuICAgICAgaW5pdFdhc0ludm9rZWQgPSB0cnVlO1xuICAgICAgdGhpcy5pMThuU3RhcnQobnVsbCwgaWN1LmkxOG4hLCB0cnVlKTtcbiAgICB9XG5cbiAgICBjb25zdCBpMThuID0gdGhpcy5pMThuITtcbiAgICBjb25zdCB2YXJzID0gdGhpcy5pMThuQmluZFByb3BzKGljdS52YXJzKTtcbiAgICBjb25zdCBwbGFjZWhvbGRlcnMgPSB0aGlzLmkxOG5CaW5kUHJvcHMoaWN1LnBsYWNlaG9sZGVycyk7XG5cbiAgICAvLyBvdXRwdXQgSUNVIGRpcmVjdGx5IGFuZCBrZWVwIElDVSByZWZlcmVuY2UgaW4gY29udGV4dFxuICAgIGNvbnN0IG1lc3NhZ2UgPSBpY3UuaTE4biEgYXMgaTE4bi5NZXNzYWdlO1xuXG4gICAgLy8gd2UgYWx3YXlzIG5lZWQgcG9zdC1wcm9jZXNzaW5nIGZ1bmN0aW9uIGZvciBJQ1VzLCB0byBtYWtlIHN1cmUgdGhhdDpcbiAgICAvLyAtIGFsbCBwbGFjZWhvbGRlcnMgaW4gYSBmb3JtIG9mIHtQTEFDRUhPTERFUn0gYXJlIHJlcGxhY2VkIHdpdGggYWN0dWFsIHZhbHVlcyAobm90ZTpcbiAgICAvLyBgZ29vZy5nZXRNc2dgIGRvZXMgbm90IHByb2Nlc3MgSUNVcyBhbmQgdXNlcyB0aGUgYHtQTEFDRUhPTERFUn1gIGZvcm1hdCBmb3IgcGxhY2Vob2xkZXJzXG4gICAgLy8gaW5zaWRlIElDVXMpXG4gICAgLy8gLSBhbGwgSUNVIHZhcnMgKHN1Y2ggYXMgYFZBUl9TRUxFQ1RgIG9yIGBWQVJfUExVUkFMYCkgYXJlIHJlcGxhY2VkIHdpdGggY29ycmVjdCB2YWx1ZXNcbiAgICBjb25zdCB0cmFuc2Zvcm1GbiA9IChyYXc6IG8uUmVhZFZhckV4cHIpID0+IHtcbiAgICAgIC8vIFNvcnQgdGhlIG1hcCBlbnRyaWVzIGluIHRoZSBjb21waWxlZCBvdXRwdXQuIFRoaXMgbWFrZXMgaXQgZWFzeSB0byBhY2hlaXZlIGlkZW50aWNhbCBvdXRwdXRcbiAgICAgIC8vIGluIHRoZSB0ZW1wbGF0ZSBwaXBlbGluZSBjb21waWxlci5cbiAgICAgIGNvbnN0IHBhcmFtcyA9IE9iamVjdC5mcm9tRW50cmllcyhPYmplY3QuZW50cmllcyh7Li4udmFycywgLi4ucGxhY2Vob2xkZXJzfSkuc29ydCgpKTtcbiAgICAgIGNvbnN0IGZvcm1hdHRlZCA9IGZvcm1hdEkxOG5QbGFjZWhvbGRlck5hbWVzSW5NYXAocGFyYW1zLCAvKiB1c2VDYW1lbENhc2UgKi8gZmFsc2UpO1xuICAgICAgcmV0dXJuIGludm9rZUluc3RydWN0aW9uKG51bGwsIFIzLmkxOG5Qb3N0cHJvY2VzcywgW3JhdywgbWFwTGl0ZXJhbChmb3JtYXR0ZWQsIHRydWUpXSk7XG4gICAgfTtcblxuICAgIC8vIGluIGNhc2UgdGhlIHdob2xlIGkxOG4gbWVzc2FnZSBpcyBhIHNpbmdsZSBJQ1UgLSB3ZSBkbyBub3QgbmVlZCB0b1xuICAgIC8vIGNyZWF0ZSBhIHNlcGFyYXRlIHRvcC1sZXZlbCB0cmFuc2xhdGlvbiwgd2UgY2FuIHVzZSB0aGUgcm9vdCByZWYgaW5zdGVhZFxuICAgIC8vIGFuZCBtYWtlIHRoaXMgSUNVIGEgdG9wLWxldmVsIHRyYW5zbGF0aW9uXG4gICAgLy8gbm90ZTogSUNVIHBsYWNlaG9sZGVycyBhcmUgcmVwbGFjZWQgd2l0aCBhY3R1YWwgdmFsdWVzIGluIGBpMThuUG9zdHByb2Nlc3NgIGZ1bmN0aW9uXG4gICAgLy8gc2VwYXJhdGVseSwgc28gd2UgZG8gbm90IHBhc3MgcGxhY2Vob2xkZXJzIGludG8gYGkxOG5UcmFuc2xhdGVgIGZ1bmN0aW9uLlxuICAgIGlmIChpc1NpbmdsZUkxOG5JY3UoaTE4bi5tZXRhKSkge1xuICAgICAgdGhpcy5pMThuVHJhbnNsYXRlKG1lc3NhZ2UsIC8qIHBsYWNlaG9sZGVycyAqLyB7fSwgaTE4bi5yZWYsIHRyYW5zZm9ybUZuKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gb3V0cHV0IElDVSBkaXJlY3RseSBhbmQga2VlcCBJQ1UgcmVmZXJlbmNlIGluIGNvbnRleHRcbiAgICAgIGNvbnN0IHJlZiA9XG4gICAgICAgICAgdGhpcy5pMThuVHJhbnNsYXRlKG1lc3NhZ2UsIC8qIHBsYWNlaG9sZGVycyAqLyB7fSwgLyogcmVmICovIHVuZGVmaW5lZCwgdHJhbnNmb3JtRm4pO1xuICAgICAgaTE4bi5hcHBlbmRJY3UoaWN1RnJvbUkxOG5NZXNzYWdlKG1lc3NhZ2UpLm5hbWUsIHJlZik7XG4gICAgfVxuXG4gICAgaWYgKGluaXRXYXNJbnZva2VkKSB7XG4gICAgICB0aGlzLmkxOG5FbmQobnVsbCwgdHJ1ZSk7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgdmlzaXRJZkJsb2NrKGJsb2NrOiB0LklmQmxvY2spOiB2b2lkIHtcbiAgICAvLyBBbGxvY2F0ZSBvbmUgc2xvdCBmb3IgdGhlIHJlc3VsdCBvZiB0aGUgZXhwcmVzc2lvbi5cbiAgICB0aGlzLmFsbG9jYXRlQmluZGluZ1Nsb3RzKG51bGwpO1xuXG4gICAgLy8gV2UgaGF2ZSB0byBwcm9jZXNzIHRoZSBibG9jayBpbiB0d28gc3RlcHM6IG9uY2UgaGVyZSBhbmQgYWdhaW4gaW4gdGhlIHVwZGF0ZSBpbnN0cnVjdGlvblxuICAgIC8vIGNhbGxiYWNrIGluIG9yZGVyIHRvIGdlbmVyYXRlIHRoZSBjb3JyZWN0IGV4cHJlc3Npb25zIHdoZW4gcGlwZXMgb3IgcHVyZSBmdW5jdGlvbnMgYXJlXG4gICAgLy8gdXNlZCBpbnNpZGUgdGhlIGJyYW5jaCBleHByZXNzaW9ucy5cbiAgICBjb25zdCBicmFuY2hEYXRhID0gYmxvY2suYnJhbmNoZXMubWFwKChicmFuY2gsIGJyYW5jaEluZGV4KSA9PiB7XG4gICAgICBjb25zdCB7ZXhwcmVzc2lvbiwgZXhwcmVzc2lvbkFsaWFzLCBjaGlsZHJlbiwgc291cmNlU3Bhbn0gPSBicmFuY2g7XG5cbiAgICAgIC8vIElmIHRoZSBicmFuY2ggaGFzIGFuIGFsaWFzLCBpdCdsbCBiZSBhc3NpZ25lZCBkaXJlY3RseSB0byB0aGUgY29udGFpbmVyJ3MgY29udGV4dC5cbiAgICAgIC8vIFdlIGRlZmluZSBhIHZhcmlhYmxlIHJlZmVycmluZyBkaXJlY3RseSB0byB0aGUgY29udGV4dCBzbyB0aGF0IGFueSBuZXN0ZWQgdXNhZ2VzIGNhbiBiZVxuICAgICAgLy8gcmV3cml0dGVuIHRvIHJlZmVyIHRvIGl0LlxuICAgICAgY29uc3QgdmFyaWFibGVzID0gZXhwcmVzc2lvbkFsaWFzICE9PSBudWxsID9cbiAgICAgICAgICBbbmV3IHQuVmFyaWFibGUoXG4gICAgICAgICAgICAgIGV4cHJlc3Npb25BbGlhcy5uYW1lLCBESVJFQ1RfQ09OVEVYVF9SRUZFUkVOQ0UsIGV4cHJlc3Npb25BbGlhcy5zb3VyY2VTcGFuLFxuICAgICAgICAgICAgICBleHByZXNzaW9uQWxpYXMua2V5U3BhbildIDpcbiAgICAgICAgICB1bmRlZmluZWQ7XG5cbiAgICAgIGxldCB0YWdOYW1lOiBzdHJpbmd8bnVsbCA9IG51bGw7XG4gICAgICBsZXQgYXR0cnNFeHByczogby5FeHByZXNzaW9uW118dW5kZWZpbmVkO1xuXG4gICAgICAvLyBPbmx5IHRoZSBmaXJzdCBicmFuY2ggY2FuIGJlIHVzZWQgZm9yIHByb2plY3Rpb24sIGJlY2F1c2UgdGhlIGNvbmRpdGlvbmFsXG4gICAgICAvLyB1c2VzIHRoZSBjb250YWluZXIgb2YgdGhlIGZpcnN0IGJyYW5jaCBhcyB0aGUgaW5zZXJ0aW9uIHBvaW50IGZvciBhbGwgYnJhbmNoZXMuXG4gICAgICBpZiAoYnJhbmNoSW5kZXggPT09IDApIHtcbiAgICAgICAgY29uc3QgaW5mZXJyZWREYXRhID0gdGhpcy5pbmZlclByb2plY3Rpb25EYXRhRnJvbUluc2VydGlvblBvaW50KGJyYW5jaCk7XG4gICAgICAgIHRhZ05hbWUgPSBpbmZlcnJlZERhdGEudGFnTmFtZTtcbiAgICAgICAgYXR0cnNFeHBycyA9IGluZmVycmVkRGF0YS5hdHRyc0V4cHJzO1xuICAgICAgfVxuXG4gICAgICAvLyBOb3RlOiB0aGUgdGVtcGxhdGUgbmVlZHMgdG8gYmUgY3JlYXRlZCAqYmVmb3JlKiB3ZSBwcm9jZXNzIHRoZSBleHByZXNzaW9uLFxuICAgICAgLy8gb3RoZXJ3aXNlIHBpcGVzIGluamVjdGluZyBzb21lIHN5bWJvbHMgd29uJ3Qgd29yayAoc2VlICM1MjEwMikuXG4gICAgICBjb25zdCB0ZW1wbGF0ZUluZGV4ID0gdGhpcy5jcmVhdGVFbWJlZGRlZFRlbXBsYXRlRm4oXG4gICAgICAgICAgdGFnTmFtZSwgY2hpbGRyZW4sICdfQ29uZGl0aW9uYWwnLCBzb3VyY2VTcGFuLCB2YXJpYWJsZXMsIGF0dHJzRXhwcnMsIHVuZGVmaW5lZCxcbiAgICAgICAgICBicmFuY2guaTE4bik7XG4gICAgICBjb25zdCBwcm9jZXNzZWRFeHByZXNzaW9uID1cbiAgICAgICAgICBleHByZXNzaW9uID09PSBudWxsID8gbnVsbCA6IGV4cHJlc3Npb24udmlzaXQodGhpcy5fdmFsdWVDb252ZXJ0ZXIpO1xuICAgICAgcmV0dXJuIHtpbmRleDogdGVtcGxhdGVJbmRleCwgZXhwcmVzc2lvbjogcHJvY2Vzc2VkRXhwcmVzc2lvbiwgYWxpYXM6IGV4cHJlc3Npb25BbGlhc307XG4gICAgfSk7XG5cbiAgICAvLyBVc2UgdGhlIGluZGV4IG9mIHRoZSBmaXJzdCBibG9jayBhcyB0aGUgaW5kZXggZm9yIHRoZSBlbnRpcmUgY29udGFpbmVyLlxuICAgIGNvbnN0IGNvbnRhaW5lckluZGV4ID0gYnJhbmNoRGF0YVswXS5pbmRleDtcbiAgICBjb25zdCBwYXJhbXNDYWxsYmFjayA9ICgpID0+IHtcbiAgICAgIGxldCBjb250ZXh0VmFyaWFibGU6IG8uUmVhZFZhckV4cHJ8bnVsbCA9IG51bGw7XG4gICAgICBjb25zdCBnZW5lcmF0ZUJyYW5jaCA9IChicmFuY2hJbmRleDogbnVtYmVyKTogby5FeHByZXNzaW9uID0+IHtcbiAgICAgICAgLy8gSWYgd2UndmUgZ29uZSBiZXlvbmQgdGhlIGxhc3QgYnJhbmNoLCByZXR1cm4gdGhlIHNwZWNpYWwgLTEgdmFsdWUgd2hpY2ggbWVhbnMgdGhhdCBub1xuICAgICAgICAvLyB2aWV3IHdpbGwgYmUgcmVuZGVyZWQuIE5vdGUgdGhhdCB3ZSBkb24ndCBuZWVkIHRvIHJlc2V0IHRoZSBjb250ZXh0IGhlcmUsIGJlY2F1c2UgLTFcbiAgICAgICAgLy8gd29uJ3QgcmVuZGVyIGEgdmlldyBzbyB0aGUgcGFzc2VkLWluIGNvbnRleHQgd29uJ3QgYmUgY2FwdHVyZWQuXG4gICAgICAgIGlmIChicmFuY2hJbmRleCA+IGJyYW5jaERhdGEubGVuZ3RoIC0gMSkge1xuICAgICAgICAgIHJldHVybiBvLmxpdGVyYWwoLTEpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qge2luZGV4LCBleHByZXNzaW9uLCBhbGlhc30gPSBicmFuY2hEYXRhW2JyYW5jaEluZGV4XTtcblxuICAgICAgICAvLyBJZiB0aGUgYnJhbmNoIGhhcyBubyBleHByZXNzaW9uLCBpdCBtZWFucyB0aGF0IGl0J3MgdGhlIGZpbmFsIGBlbHNlYC5cbiAgICAgICAgLy8gUmV0dXJuIGl0cyBpbmRleCBhbmQgc3RvcCB0aGUgcmVjdXJzaW9uLiBBc3N1bWVzIHRoYXQgdGhlcmUncyBvbmx5IG9uZVxuICAgICAgICAvLyBgZWxzZWAgY29uZGl0aW9uIGFuZCB0aGF0IGl0J3MgdGhlIGxhc3QgYnJhbmNoLlxuICAgICAgICBpZiAoZXhwcmVzc2lvbiA9PT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybiBvLmxpdGVyYWwoaW5kZXgpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGNvbXBhcmlzb25UYXJnZXQ6IG8uRXhwcmVzc2lvbjtcblxuICAgICAgICBpZiAoYWxpYXMpIHtcbiAgICAgICAgICAvLyBJZiB0aGUgYnJhbmNoIGlzIGFsaWFzZWQsIHdlIG5lZWQgdG8gYXNzaWduIHRoZSBleHByZXNzaW9uIHZhbHVlIHRvIHRoZSB0ZW1wb3JhcnlcbiAgICAgICAgICAvLyB2YXJpYWJsZSBhbmQgdGhlbiBwYXNzIGl0IGludG8gYGNvbmRpdGlvbmFsYC4gRS5nLiBmb3IgdGhlIGV4cHJlc3Npb246XG4gICAgICAgICAgLy8gYEBpZiAoZm9vKCk7IGFzIGFsaWFzKSB7Li4ufWAgd2UgaGF2ZSB0byBnZW5lcmF0ZTpcbiAgICAgICAgICAvLyBgYGBcbiAgICAgICAgICAvLyBsZXQgdGVtcDtcbiAgICAgICAgICAvLyBjb25kaXRpb25hbCgwLCAodGVtcCA9IGN0eC5mb28oKSkgPyAwIDogLTEsIHRlbXApO1xuICAgICAgICAgIC8vIGBgYFxuICAgICAgICAgIGNvbnRleHRWYXJpYWJsZSA9IHRoaXMuYWxsb2NhdGVDb250cm9sRmxvd1RlbXBWYXJpYWJsZSgpO1xuICAgICAgICAgIGNvbXBhcmlzb25UYXJnZXQgPSBjb250ZXh0VmFyaWFibGUuc2V0KHRoaXMuY29udmVydFByb3BlcnR5QmluZGluZyhleHByZXNzaW9uKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29tcGFyaXNvblRhcmdldCA9IHRoaXMuY29udmVydFByb3BlcnR5QmluZGluZyhleHByZXNzaW9uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjb21wYXJpc29uVGFyZ2V0LmNvbmRpdGlvbmFsKG8ubGl0ZXJhbChpbmRleCksIGdlbmVyYXRlQnJhbmNoKGJyYW5jaEluZGV4ICsgMSkpO1xuICAgICAgfTtcblxuICAgICAgY29uc3QgcGFyYW1zID0gW28ubGl0ZXJhbChjb250YWluZXJJbmRleCksIGdlbmVyYXRlQnJhbmNoKDApXTtcblxuICAgICAgaWYgKGNvbnRleHRWYXJpYWJsZSAhPT0gbnVsbCkge1xuICAgICAgICBwYXJhbXMucHVzaChjb250ZXh0VmFyaWFibGUpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcGFyYW1zO1xuICAgIH07XG5cbiAgICB0aGlzLnVwZGF0ZUluc3RydWN0aW9uV2l0aEFkdmFuY2UoXG4gICAgICAgIGNvbnRhaW5lckluZGV4LCBibG9jay5icmFuY2hlc1swXS5zb3VyY2VTcGFuLCBSMy5jb25kaXRpb25hbCwgcGFyYW1zQ2FsbGJhY2spO1xuICB9XG5cbiAgdmlzaXRTd2l0Y2hCbG9jayhibG9jazogdC5Td2l0Y2hCbG9jayk6IHZvaWQge1xuICAgIGlmIChibG9jay5jYXNlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBXZSBoYXZlIHRvIHByb2Nlc3MgdGhlIGJsb2NrIGluIHR3byBzdGVwczogb25jZSBoZXJlIGFuZCBhZ2FpbiBpbiB0aGUgdXBkYXRlIGluc3RydWN0aW9uXG4gICAgLy8gY2FsbGJhY2sgaW4gb3JkZXIgdG8gZ2VuZXJhdGUgdGhlIGNvcnJlY3QgZXhwcmVzc2lvbnMgd2hlbiBwaXBlcyBvciBwdXJlIGZ1bmN0aW9ucyBhcmUgdXNlZC5cbiAgICBjb25zdCBjYXNlRGF0YSA9IGJsb2NrLmNhc2VzLm1hcChjdXJyZW50Q2FzZSA9PiB7XG4gICAgICBjb25zdCBpbmRleCA9IHRoaXMuY3JlYXRlRW1iZWRkZWRUZW1wbGF0ZUZuKFxuICAgICAgICAgIG51bGwsIGN1cnJlbnRDYXNlLmNoaWxkcmVuLCAnX0Nhc2UnLCBjdXJyZW50Q2FzZS5zb3VyY2VTcGFuLCB1bmRlZmluZWQsIHVuZGVmaW5lZCxcbiAgICAgICAgICB1bmRlZmluZWQsIGN1cnJlbnRDYXNlLmkxOG4pO1xuICAgICAgY29uc3QgZXhwcmVzc2lvbiA9IGN1cnJlbnRDYXNlLmV4cHJlc3Npb24gPT09IG51bGwgP1xuICAgICAgICAgIG51bGwgOlxuICAgICAgICAgIGN1cnJlbnRDYXNlLmV4cHJlc3Npb24udmlzaXQodGhpcy5fdmFsdWVDb252ZXJ0ZXIpO1xuICAgICAgcmV0dXJuIHtpbmRleCwgZXhwcmVzc2lvbn07XG4gICAgfSk7XG5cbiAgICAvLyBVc2UgdGhlIGluZGV4IG9mIHRoZSBmaXJzdCBibG9jayBhcyB0aGUgaW5kZXggZm9yIHRoZSBlbnRpcmUgY29udGFpbmVyLlxuICAgIGNvbnN0IGNvbnRhaW5lckluZGV4ID0gY2FzZURhdGFbMF0uaW5kZXg7XG5cbiAgICAvLyBOb3RlOiB0aGUgZXhwcmVzc2lvbiBuZWVkcyB0byBiZSBwcm9jZXNzZWQgKmFmdGVyKiB0aGUgdGVtcGxhdGUsXG4gICAgLy8gb3RoZXJ3aXNlIHBpcGVzIGluamVjdGluZyBzb21lIHN5bWJvbHMgd29uJ3Qgd29yayAoc2VlICM1MjEwMikuXG4gICAgY29uc3QgYmxvY2tFeHByZXNzaW9uID0gYmxvY2suZXhwcmVzc2lvbi52aXNpdCh0aGlzLl92YWx1ZUNvbnZlcnRlcik7XG4gICAgdGhpcy5hbGxvY2F0ZUJpbmRpbmdTbG90cyhudWxsKTsgIC8vIEFsbG9jYXRlIGEgc2xvdCBmb3IgdGhlIHByaW1hcnkgYmxvY2sgZXhwcmVzc2lvbi5cblxuICAgIHRoaXMudXBkYXRlSW5zdHJ1Y3Rpb25XaXRoQWR2YW5jZShjb250YWluZXJJbmRleCwgYmxvY2suc291cmNlU3BhbiwgUjMuY29uZGl0aW9uYWwsICgpID0+IHtcbiAgICAgIGNvbnN0IGdlbmVyYXRlQ2FzZXMgPSAoY2FzZUluZGV4OiBudW1iZXIpOiBvLkV4cHJlc3Npb24gPT4ge1xuICAgICAgICAvLyBJZiB3ZSd2ZSBnb25lIGJleW9uZCB0aGUgbGFzdCBicmFuY2gsIHJldHVybiB0aGUgc3BlY2lhbCAtMVxuICAgICAgICAvLyB2YWx1ZSB3aGljaCBtZWFucyB0aGF0IG5vIHZpZXcgd2lsbCBiZSByZW5kZXJlZC5cbiAgICAgICAgaWYgKGNhc2VJbmRleCA+IGNhc2VEYXRhLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICByZXR1cm4gby5saXRlcmFsKC0xKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHtpbmRleCwgZXhwcmVzc2lvbn0gPSBjYXNlRGF0YVtjYXNlSW5kZXhdO1xuXG4gICAgICAgIC8vIElmIHRoZSBjYXNlIGhhcyBubyBleHByZXNzaW9uLCBpdCBtZWFucyB0aGF0IGl0J3MgdGhlIGBkZWZhdWx0YCBjYXNlLlxuICAgICAgICAvLyBSZXR1cm4gaXRzIGluZGV4IGFuZCBzdG9wIHRoZSByZWN1cnNpb24uIEFzc3VtZXMgdGhhdCB0aGVyZSdzIG9ubHkgb25lXG4gICAgICAgIC8vIGBkZWZhdWx0YCBjb25kaXRpb24gYW5kIHRoYXQgaXQncyBkZWZpbmVkIGxhc3QuXG4gICAgICAgIGlmIChleHByZXNzaW9uID09PSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIG8ubGl0ZXJhbChpbmRleCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiB0aGlzIGlzIHRoZSB2ZXJ5IGZpcnN0IGNvbXBhcmlzb24sIHdlIG5lZWQgdG8gYXNzaWduIHRoZSB2YWx1ZSBvZiB0aGUgcHJpbWFyeVxuICAgICAgICAvLyBleHByZXNzaW9uIGFzIGEgcGFydCBvZiB0aGUgY29tcGFyaXNvbiBzbyB0aGUgcmVtYWluaW5nIGNhc2VzIGNhbiByZXVzZSBpdC4gSW4gcHJhY3RpY2VcbiAgICAgICAgLy8gdGhpcyBsb29rcyBhcyBmb2xsb3dzOlxuICAgICAgICAvLyBgYGBcbiAgICAgICAgLy8gbGV0IHRlbXA7XG4gICAgICAgIC8vIGNvbmRpdGlvbmFsKDEsICh0ZW1wID0gY3R4LmZvbykgPT09IDEgPyAxIDogdGVtcCA9PT0gMiA/IDIgOiB0ZW1wID09PSAzID8gMyA6IDQpO1xuICAgICAgICAvLyBgYGBcbiAgICAgICAgY29uc3QgY29tcGFyaXNvblRhcmdldCA9IGNhc2VJbmRleCA9PT0gMCA/XG4gICAgICAgICAgICB0aGlzLmFsbG9jYXRlQ29udHJvbEZsb3dUZW1wVmFyaWFibGUoKS5zZXQoXG4gICAgICAgICAgICAgICAgdGhpcy5jb252ZXJ0UHJvcGVydHlCaW5kaW5nKGJsb2NrRXhwcmVzc2lvbikpIDpcbiAgICAgICAgICAgIHRoaXMuYWxsb2NhdGVDb250cm9sRmxvd1RlbXBWYXJpYWJsZSgpO1xuXG4gICAgICAgIHJldHVybiBjb21wYXJpc29uVGFyZ2V0LmlkZW50aWNhbCh0aGlzLmNvbnZlcnRQcm9wZXJ0eUJpbmRpbmcoZXhwcmVzc2lvbikpXG4gICAgICAgICAgICAuY29uZGl0aW9uYWwoby5saXRlcmFsKGluZGV4KSwgZ2VuZXJhdGVDYXNlcyhjYXNlSW5kZXggKyAxKSk7XG4gICAgICB9O1xuXG4gICAgICByZXR1cm4gW28ubGl0ZXJhbChjb250YWluZXJJbmRleCksIGdlbmVyYXRlQ2FzZXMoMCldO1xuICAgIH0pO1xuICB9XG5cbiAgdmlzaXREZWZlcnJlZEJsb2NrKGRlZmVycmVkOiB0LkRlZmVycmVkQmxvY2spOiB2b2lkIHtcbiAgICBjb25zdCB7bG9hZGluZywgcGxhY2Vob2xkZXIsIGVycm9yLCB0cmlnZ2VycywgcHJlZmV0Y2hUcmlnZ2Vyc30gPSBkZWZlcnJlZDtcbiAgICBjb25zdCBtZXRhZGF0YSA9IHRoaXMuZGVmZXJCbG9ja3MuZ2V0KGRlZmVycmVkKTtcblxuICAgIGlmICghbWV0YWRhdGEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IHJlc29sdmUgYGRlZmVyYCBibG9jayBtZXRhZGF0YS4gQmxvY2sgbWF5IG5lZWQgdG8gYmUgYW5hbHl6ZWQuJyk7XG4gICAgfVxuXG4gICAgY29uc3QgcHJpbWFyeVRlbXBsYXRlSW5kZXggPSB0aGlzLmNyZWF0ZUVtYmVkZGVkVGVtcGxhdGVGbihcbiAgICAgICAgbnVsbCwgZGVmZXJyZWQuY2hpbGRyZW4sICdfRGVmZXInLCBkZWZlcnJlZC5zb3VyY2VTcGFuLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLFxuICAgICAgICBkZWZlcnJlZC5pMThuKTtcbiAgICBjb25zdCBsb2FkaW5nSW5kZXggPSBsb2FkaW5nID8gdGhpcy5jcmVhdGVFbWJlZGRlZFRlbXBsYXRlRm4oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBudWxsLCBsb2FkaW5nLmNoaWxkcmVuLCAnX0RlZmVyTG9hZGluZycsIGxvYWRpbmcuc291cmNlU3BhbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIGxvYWRpbmcuaTE4bikgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBudWxsO1xuICAgIGNvbnN0IGxvYWRpbmdDb25zdHMgPSBsb2FkaW5nID9cbiAgICAgICAgdHJpbVRyYWlsaW5nTnVsbHMoW28ubGl0ZXJhbChsb2FkaW5nLm1pbmltdW1UaW1lKSwgby5saXRlcmFsKGxvYWRpbmcuYWZ0ZXJUaW1lKV0pIDpcbiAgICAgICAgbnVsbDtcblxuICAgIGNvbnN0IHBsYWNlaG9sZGVySW5kZXggPSBwbGFjZWhvbGRlciA/XG4gICAgICAgIHRoaXMuY3JlYXRlRW1iZWRkZWRUZW1wbGF0ZUZuKFxuICAgICAgICAgICAgbnVsbCwgcGxhY2Vob2xkZXIuY2hpbGRyZW4sICdfRGVmZXJQbGFjZWhvbGRlcicsIHBsYWNlaG9sZGVyLnNvdXJjZVNwYW4sIHVuZGVmaW5lZCxcbiAgICAgICAgICAgIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBwbGFjZWhvbGRlci5pMThuKSA6XG4gICAgICAgIG51bGw7XG4gICAgY29uc3QgcGxhY2Vob2xkZXJDb25zdHMgPSBwbGFjZWhvbGRlciAmJiBwbGFjZWhvbGRlci5taW5pbXVtVGltZSAhPT0gbnVsbCA/XG4gICAgICAgIC8vIFRPRE8oY3Jpc2JldG8pOiBwb3RlbnRpYWxseSBwYXNzIHRoZSB0aW1lIGRpcmVjdGx5IGluc3RlYWQgb2Ygc3RvcmluZyBpdCBpbiB0aGUgYGNvbnN0c2BcbiAgICAgICAgLy8gc2luY2UgdGhlIHBsYWNlaG9sZGVyIGJsb2NrIGNhbiBvbmx5IGhhdmUgb25lIHBhcmFtZXRlcj9cbiAgICAgICAgby5saXRlcmFsQXJyKFtvLmxpdGVyYWwocGxhY2Vob2xkZXIubWluaW11bVRpbWUpXSkgOlxuICAgICAgICBudWxsO1xuXG4gICAgY29uc3QgZXJyb3JJbmRleCA9IGVycm9yID8gdGhpcy5jcmVhdGVFbWJlZGRlZFRlbXBsYXRlRm4oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bGwsIGVycm9yLmNoaWxkcmVuLCAnX0RlZmVyRXJyb3InLCBlcnJvci5zb3VyY2VTcGFuLCB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBlcnJvci5pMThuKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVsbDtcblxuICAgIC8vIE5vdGU6IHdlIGdlbmVyYXRlIHRoaXMgbGFzdCBzbyB0aGUgaW5kZXggbWF0Y2hlcyB0aGUgaW5zdHJ1Y3Rpb24gb3JkZXIuXG4gICAgY29uc3QgZGVmZXJyZWRJbmRleCA9IHRoaXMuYWxsb2NhdGVEYXRhU2xvdCgpO1xuICAgIGNvbnN0IGRlcHNGbk5hbWUgPSBgJHt0aGlzLmNvbnRleHROYW1lfV9EZWZlcl8ke2RlZmVycmVkSW5kZXh9X0RlcHNGbmA7XG5cbiAgICAvLyBlLmcuIGBkZWZlcigxLCAwLCBNeUNvbXBfRGVmZXJfMV9EZXBzRm4sIC4uLilgXG4gICAgdGhpcy5jcmVhdGlvbkluc3RydWN0aW9uKFxuICAgICAgICBkZWZlcnJlZC5zb3VyY2VTcGFuLCBSMy5kZWZlciwgdHJpbVRyYWlsaW5nTnVsbHMoW1xuICAgICAgICAgIG8ubGl0ZXJhbChkZWZlcnJlZEluZGV4KSxcbiAgICAgICAgICBvLmxpdGVyYWwocHJpbWFyeVRlbXBsYXRlSW5kZXgpLFxuICAgICAgICAgIHRoaXMuYWxsRGVmZXJyYWJsZURlcHNGbiA/PyB0aGlzLmNyZWF0ZURlZmVycmVkRGVwc0Z1bmN0aW9uKGRlcHNGbk5hbWUsIG1ldGFkYXRhKSxcbiAgICAgICAgICBvLmxpdGVyYWwobG9hZGluZ0luZGV4KSxcbiAgICAgICAgICBvLmxpdGVyYWwocGxhY2Vob2xkZXJJbmRleCksXG4gICAgICAgICAgby5saXRlcmFsKGVycm9ySW5kZXgpLFxuICAgICAgICAgIGxvYWRpbmdDb25zdHM/Lmxlbmd0aCA/IHRoaXMuYWRkVG9Db25zdHMoby5saXRlcmFsQXJyKGxvYWRpbmdDb25zdHMpKSA6IG8uVFlQRURfTlVMTF9FWFBSLFxuICAgICAgICAgIHBsYWNlaG9sZGVyQ29uc3RzID8gdGhpcy5hZGRUb0NvbnN0cyhwbGFjZWhvbGRlckNvbnN0cykgOiBvLlRZUEVEX05VTExfRVhQUixcbiAgICAgICAgICAobG9hZGluZ0NvbnN0cz8ubGVuZ3RoIHx8IHBsYWNlaG9sZGVyQ29uc3RzKSA/XG4gICAgICAgICAgICAgIG8uaW1wb3J0RXhwcihSMy5kZWZlckVuYWJsZVRpbWVyU2NoZWR1bGluZykgOlxuICAgICAgICAgICAgICBvLlRZUEVEX05VTExfRVhQUixcbiAgICAgICAgXSkpO1xuXG4gICAgLy8gQWxsb2NhdGUgYW4gZXh0cmEgZGF0YSBzbG90IHJpZ2h0IGFmdGVyIGEgZGVmZXIgYmxvY2sgc2xvdCB0byBzdG9yZVxuICAgIC8vIGluc3RhbmNlLXNwZWNpZmljIHN0YXRlIG9mIHRoYXQgZGVmZXIgYmxvY2sgYXQgcnVudGltZS5cbiAgICB0aGlzLmFsbG9jYXRlRGF0YVNsb3QoKTtcblxuICAgIC8vIE5vdGU6IHRoZSB0cmlnZ2VycyBuZWVkIHRvIGJlIHByb2Nlc3NlZCAqYWZ0ZXIqIHRoZSB2YXJpb3VzIHRlbXBsYXRlcyxcbiAgICAvLyBvdGhlcndpc2UgcGlwZXMgaW5qZWN0aW5nIHNvbWUgc3ltYm9scyB3b24ndCB3b3JrIChzZWUgIzUyMTAyKS5cbiAgICB0aGlzLmNyZWF0ZURlZmVyVHJpZ2dlckluc3RydWN0aW9ucyhkZWZlcnJlZEluZGV4LCB0cmlnZ2VycywgbWV0YWRhdGEsIGZhbHNlKTtcbiAgICB0aGlzLmNyZWF0ZURlZmVyVHJpZ2dlckluc3RydWN0aW9ucyhkZWZlcnJlZEluZGV4LCBwcmVmZXRjaFRyaWdnZXJzLCBtZXRhZGF0YSwgdHJ1ZSk7XG4gIH1cblxuICBwcml2YXRlIGNyZWF0ZURlZmVycmVkRGVwc0Z1bmN0aW9uKG5hbWU6IHN0cmluZywgbWV0YWRhdGE6IFIzRGVmZXJCbG9ja01ldGFkYXRhKSB7XG4gICAgaWYgKG1ldGFkYXRhLmRlcHMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gby5UWVBFRF9OVUxMX0VYUFI7XG4gICAgfVxuXG4gICAgLy8gVGhpcyBkZWZlciBibG9jayBoYXMgZGVwcyBmb3Igd2hpY2ggd2UgbmVlZCB0byBnZW5lcmF0ZSBkeW5hbWljIGltcG9ydHMuXG4gICAgY29uc3QgZGVwZW5kZW5jeUV4cDogby5FeHByZXNzaW9uW10gPSBbXTtcblxuICAgIGZvciAoY29uc3QgZGVmZXJyZWREZXAgb2YgbWV0YWRhdGEuZGVwcykge1xuICAgICAgaWYgKGRlZmVycmVkRGVwLmlzRGVmZXJyYWJsZSkge1xuICAgICAgICAvLyBDYWxsYmFjayBmdW5jdGlvbiwgZS5nLiBgbSAoKSA9PiBtLk15Q21wO2AuXG4gICAgICAgIGNvbnN0IGlubmVyRm4gPSBvLmFycm93Rm4oXG4gICAgICAgICAgICBbbmV3IG8uRm5QYXJhbSgnbScsIG8uRFlOQU1JQ19UWVBFKV0sXG4gICAgICAgICAgICAvLyBEZWZhdWx0IGltcG9ydHMgYXJlIGFsd2F5cyBhY2Nlc3NlZCB0aHJvdWdoIHRoZSBgZGVmYXVsdGAgcHJvcGVydHkuXG4gICAgICAgICAgICBvLnZhcmlhYmxlKCdtJykucHJvcChkZWZlcnJlZERlcC5pc0RlZmF1bHRJbXBvcnQgPyAnZGVmYXVsdCcgOiBkZWZlcnJlZERlcC5zeW1ib2xOYW1lKSk7XG5cbiAgICAgICAgLy8gRHluYW1pYyBpbXBvcnQsIGUuZy4gYGltcG9ydCgnLi9hJykudGhlbiguLi4pYC5cbiAgICAgICAgY29uc3QgaW1wb3J0RXhwciA9XG4gICAgICAgICAgICAobmV3IG8uRHluYW1pY0ltcG9ydEV4cHIoZGVmZXJyZWREZXAuaW1wb3J0UGF0aCEpKS5wcm9wKCd0aGVuJykuY2FsbEZuKFtpbm5lckZuXSk7XG4gICAgICAgIGRlcGVuZGVuY3lFeHAucHVzaChpbXBvcnRFeHByKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIE5vbi1kZWZlcnJhYmxlIHN5bWJvbCwganVzdCB1c2UgYSByZWZlcmVuY2UgdG8gdGhlIHR5cGUuXG4gICAgICAgIGRlcGVuZGVuY3lFeHAucHVzaChkZWZlcnJlZERlcC50eXBlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBkZXBzRm5FeHByID0gby5hcnJvd0ZuKFtdLCBvLmxpdGVyYWxBcnIoZGVwZW5kZW5jeUV4cCkpO1xuXG4gICAgdGhpcy5jb25zdGFudFBvb2wuc3RhdGVtZW50cy5wdXNoKGRlcHNGbkV4cHIudG9EZWNsU3RtdChuYW1lLCBvLlN0bXRNb2RpZmllci5GaW5hbCkpO1xuXG4gICAgcmV0dXJuIG8udmFyaWFibGUobmFtZSk7XG4gIH1cblxuICBwcml2YXRlIGNyZWF0ZURlZmVyVHJpZ2dlckluc3RydWN0aW9ucyhcbiAgICAgIGRlZmVycmVkSW5kZXg6IG51bWJlciwgdHJpZ2dlcnM6IHQuRGVmZXJyZWRCbG9ja1RyaWdnZXJzLCBtZXRhZGF0YTogUjNEZWZlckJsb2NrTWV0YWRhdGEsXG4gICAgICBwcmVmZXRjaDogYm9vbGVhbikge1xuICAgIGNvbnN0IHt3aGVuLCBpZGxlLCBpbW1lZGlhdGUsIHRpbWVyLCBob3ZlciwgaW50ZXJhY3Rpb24sIHZpZXdwb3J0fSA9IHRyaWdnZXJzO1xuXG4gICAgLy8gYGRlZmVyV2hlbihjdHguc29tZVZhbHVlKWBcbiAgICBpZiAod2hlbikge1xuICAgICAgY29uc3QgdmFsdWUgPSB3aGVuLnZhbHVlLnZpc2l0KHRoaXMuX3ZhbHVlQ29udmVydGVyKTtcbiAgICAgIHRoaXMuYWxsb2NhdGVCaW5kaW5nU2xvdHModmFsdWUpO1xuICAgICAgdGhpcy51cGRhdGVJbnN0cnVjdGlvbldpdGhBZHZhbmNlKFxuICAgICAgICAgIGRlZmVycmVkSW5kZXgsIHdoZW4uc291cmNlU3BhbiwgcHJlZmV0Y2ggPyBSMy5kZWZlclByZWZldGNoV2hlbiA6IFIzLmRlZmVyV2hlbixcbiAgICAgICAgICAoKSA9PiB0aGlzLmNvbnZlcnRQcm9wZXJ0eUJpbmRpbmcodmFsdWUpKTtcbiAgICB9XG5cbiAgICAvLyBOb3RlIHRoYXQgd2UgZ2VuZXJhdGUgYW4gaW1wbGljaXQgYG9uIGlkbGVgIGlmIHRoZSBgZGVmZXJyZWRgIGJsb2NrIGhhcyBubyB0cmlnZ2Vycy5cbiAgICAvLyBgZGVmZXJPbklkbGUoKWBcbiAgICBpZiAoaWRsZSB8fCAoIXByZWZldGNoICYmIE9iamVjdC5rZXlzKHRyaWdnZXJzKS5sZW5ndGggPT09IDApKSB7XG4gICAgICB0aGlzLmNyZWF0aW9uSW5zdHJ1Y3Rpb24oXG4gICAgICAgICAgaWRsZT8uc291cmNlU3BhbiB8fCBudWxsLCBwcmVmZXRjaCA/IFIzLmRlZmVyUHJlZmV0Y2hPbklkbGUgOiBSMy5kZWZlck9uSWRsZSk7XG4gICAgfVxuXG4gICAgLy8gYGRlZmVyT25JbW1lZGlhdGUoKWBcbiAgICBpZiAoaW1tZWRpYXRlKSB7XG4gICAgICB0aGlzLmNyZWF0aW9uSW5zdHJ1Y3Rpb24oXG4gICAgICAgICAgaW1tZWRpYXRlLnNvdXJjZVNwYW4sIHByZWZldGNoID8gUjMuZGVmZXJQcmVmZXRjaE9uSW1tZWRpYXRlIDogUjMuZGVmZXJPbkltbWVkaWF0ZSk7XG4gICAgfVxuXG4gICAgLy8gYGRlZmVyT25UaW1lcigxMzM3KWBcbiAgICBpZiAodGltZXIpIHtcbiAgICAgIHRoaXMuY3JlYXRpb25JbnN0cnVjdGlvbihcbiAgICAgICAgICB0aW1lci5zb3VyY2VTcGFuLCBwcmVmZXRjaCA/IFIzLmRlZmVyUHJlZmV0Y2hPblRpbWVyIDogUjMuZGVmZXJPblRpbWVyLFxuICAgICAgICAgIFtvLmxpdGVyYWwodGltZXIuZGVsYXkpXSk7XG4gICAgfVxuXG4gICAgLy8gYGRlZmVyT25Ib3ZlcihpbmRleCwgd2Fsa1VwVGltZXMpYFxuICAgIGlmIChob3Zlcikge1xuICAgICAgdGhpcy5kb21Ob2RlQmFzZWRUcmlnZ2VyKFxuICAgICAgICAgICdob3ZlcicsIGhvdmVyLCBtZXRhZGF0YSwgcHJlZmV0Y2ggPyBSMy5kZWZlclByZWZldGNoT25Ib3ZlciA6IFIzLmRlZmVyT25Ib3Zlcik7XG4gICAgfVxuXG4gICAgLy8gYGRlZmVyT25JbnRlcmFjdGlvbihpbmRleCwgd2Fsa1VwVGltZXMpYFxuICAgIGlmIChpbnRlcmFjdGlvbikge1xuICAgICAgdGhpcy5kb21Ob2RlQmFzZWRUcmlnZ2VyKFxuICAgICAgICAgICdpbnRlcmFjdGlvbicsIGludGVyYWN0aW9uLCBtZXRhZGF0YSxcbiAgICAgICAgICBwcmVmZXRjaCA/IFIzLmRlZmVyUHJlZmV0Y2hPbkludGVyYWN0aW9uIDogUjMuZGVmZXJPbkludGVyYWN0aW9uKTtcbiAgICB9XG5cbiAgICAvLyBgZGVmZXJPblZpZXdwb3J0KGluZGV4LCB3YWxrVXBUaW1lcylgXG4gICAgaWYgKHZpZXdwb3J0KSB7XG4gICAgICB0aGlzLmRvbU5vZGVCYXNlZFRyaWdnZXIoXG4gICAgICAgICAgJ3ZpZXdwb3J0Jywgdmlld3BvcnQsIG1ldGFkYXRhLFxuICAgICAgICAgIHByZWZldGNoID8gUjMuZGVmZXJQcmVmZXRjaE9uVmlld3BvcnQgOiBSMy5kZWZlck9uVmlld3BvcnQpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZG9tTm9kZUJhc2VkVHJpZ2dlcihcbiAgICAgIG5hbWU6IHN0cmluZyxcbiAgICAgIHRyaWdnZXI6IHQuSW50ZXJhY3Rpb25EZWZlcnJlZFRyaWdnZXJ8dC5Ib3ZlckRlZmVycmVkVHJpZ2dlcnx0LlZpZXdwb3J0RGVmZXJyZWRUcmlnZ2VyLFxuICAgICAgbWV0YWRhdGE6IFIzRGVmZXJCbG9ja01ldGFkYXRhLCBpbnN0cnVjdGlvblJlZjogby5FeHRlcm5hbFJlZmVyZW5jZSkge1xuICAgIGNvbnN0IHRyaWdnZXJFbCA9IG1ldGFkYXRhLnRyaWdnZXJFbGVtZW50cy5nZXQodHJpZ2dlcik7XG5cbiAgICAvLyBEb24ndCBnZW5lcmF0ZSBhbnl0aGluZyBpZiBhIHRyaWdnZXIgY2Fubm90IGJlIHJlc29sdmVkLlxuICAgIC8vIFdlJ2xsIGhhdmUgdGVtcGxhdGUgZGlhZ25vc3RpY3MgdG8gc3VyZmFjZSB0aGVzZSB0byB1c2Vycy5cbiAgICBpZiAoIXRyaWdnZXJFbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuY3JlYXRpb25JbnN0cnVjdGlvbih0cmlnZ2VyLnNvdXJjZVNwYW4sIGluc3RydWN0aW9uUmVmLCAoKSA9PiB7XG4gICAgICBjb25zdCBsb2NhdGlvbiA9IHRoaXMuZWxlbWVudExvY2F0aW9ucy5nZXQodHJpZ2dlckVsKTtcblxuICAgICAgaWYgKCFsb2NhdGlvbikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgQ291bGQgbm90IGRldGVybWluZSBsb2NhdGlvbiBvZiByZWZlcmVuY2UgcGFzc2VkIGludG8gYCArXG4gICAgICAgICAgICBgJyR7bmFtZX0nIHRyaWdnZXIuIFRlbXBsYXRlIG1heSBub3QgaGF2ZSBiZWVuIGZ1bGx5IGFuYWx5emVkLmApO1xuICAgICAgfVxuXG4gICAgICAvLyBBIG5lZ2F0aXZlIGRlcHRoIG1lYW5zIHRoYXQgdGhlIHRyaWdnZXIgaXMgaW5zaWRlIHRoZSBwbGFjZWhvbGRlci5cbiAgICAgIC8vIENhcCBpdCBhdCAtMSBzaW5jZSB3ZSBvbmx5IGNhcmUgd2hldGhlciBvciBub3QgaXQncyBuZWdhdGl2ZS5cbiAgICAgIGNvbnN0IGRlcHRoID0gTWF0aC5tYXgodGhpcy5sZXZlbCAtIGxvY2F0aW9uLmxldmVsLCAtMSk7XG4gICAgICBjb25zdCBwYXJhbXMgPSBbby5saXRlcmFsKGxvY2F0aW9uLmluZGV4KV07XG5cbiAgICAgIC8vIFRoZSBtb3N0IGNvbW1vbiBjYXNlIHNob3VsZCBiZSBhIHRyaWdnZXIgd2l0aGluIHRoZSB2aWV3IHNvIHdlIGNhbiBvbWl0IGEgZGVwdGggb2ZcbiAgICAgIC8vIHplcm8uIEZvciB0cmlnZ2VycyBpbiBwYXJlbnQgdmlld3MgYW5kIGluIHRoZSBwbGFjZWhvbGRlciB3ZSBuZWVkIHRvIHBhc3MgaXQgaW4uXG4gICAgICBpZiAoZGVwdGggIT09IDApIHtcbiAgICAgICAgcGFyYW1zLnB1c2goby5saXRlcmFsKGRlcHRoKSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBwYXJhbXM7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogSW5mZXJzIHRoZSBkYXRhIHVzZWQgZm9yIGNvbnRlbnQgcHJvamVjdGlvbiAodGFnIG5hbWUgYW5kIGF0dHJpYnV0ZXMpIGZyb20gdGhlIGNvbnRlbnQgb2YgYVxuICAgKiBub2RlLlxuICAgKiBAcGFyYW0gbm9kZSBOb2RlIGZvciB3aGljaCB0byBpbmZlciB0aGUgcHJvamVjdGlvbiBkYXRhLlxuICAgKi9cbiAgcHJpdmF0ZSBpbmZlclByb2plY3Rpb25EYXRhRnJvbUluc2VydGlvblBvaW50KG5vZGU6IHQuSWZCbG9ja0JyYW5jaHx0LkZvckxvb3BCbG9ja3xcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHQuRm9yTG9vcEJsb2NrRW1wdHkpIHtcbiAgICBsZXQgcm9vdDogdC5FbGVtZW50fHQuVGVtcGxhdGV8bnVsbCA9IG51bGw7XG4gICAgbGV0IHRhZ05hbWU6IHN0cmluZ3xudWxsID0gbnVsbDtcbiAgICBsZXQgYXR0cnNFeHByczogby5FeHByZXNzaW9uW118dW5kZWZpbmVkO1xuXG4gICAgZm9yIChjb25zdCBjaGlsZCBvZiBub2RlLmNoaWxkcmVuKSB7XG4gICAgICAvLyBTa2lwIG92ZXIgY29tbWVudCBub2Rlcy5cbiAgICAgIGlmIChjaGlsZCBpbnN0YW5jZW9mIHQuQ29tbWVudCkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gV2UgY2FuIG9ubHkgaW5mZXIgdGhlIHRhZyBuYW1lL2F0dHJpYnV0ZXMgaWYgdGhlcmUncyBhIHNpbmdsZSByb290IG5vZGUuXG4gICAgICBpZiAocm9vdCAhPT0gbnVsbCkge1xuICAgICAgICByb290ID0gbnVsbDtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIC8vIFJvb3Qgbm9kZXMgY2FuIG9ubHkgZWxlbWVudHMgb3IgdGVtcGxhdGVzIHdpdGggYSB0YWcgbmFtZSAoZS5nLiBgPGRpdiAqZm9vPjwvZGl2PmApLlxuICAgICAgaWYgKGNoaWxkIGluc3RhbmNlb2YgdC5FbGVtZW50IHx8IChjaGlsZCBpbnN0YW5jZW9mIHQuVGVtcGxhdGUgJiYgY2hpbGQudGFnTmFtZSAhPT0gbnVsbCkpIHtcbiAgICAgICAgcm9vdCA9IGNoaWxkO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIElmIHdlJ3ZlIGZvdW5kIGEgc2luZ2xlIHJvb3Qgbm9kZSwgaXRzIHRhZyBuYW1lIGFuZCAqc3RhdGljKiBhdHRyaWJ1dGVzIGNhbiBiZSBjb3BpZWRcbiAgICAvLyB0byB0aGUgc3Vycm91bmRpbmcgdGVtcGxhdGUgdG8gYmUgdXNlZCBmb3IgY29udGVudCBwcm9qZWN0aW9uLiBOb3RlIHRoYXQgaXQncyBpbXBvcnRhbnRcbiAgICAvLyB0aGF0IHdlIGRvbid0IGNvcHkgYW55IGJvdW5kIGF0dHJpYnV0ZXMgc2luY2UgdGhleSBkb24ndCBwYXJ0aWNpcGF0ZSBpbiBjb250ZW50IHByb2plY3Rpb25cbiAgICAvLyBhbmQgdGhleSBjYW4gYmUgdXNlZCBpbiBkaXJlY3RpdmUgbWF0Y2hpbmcgKGluIHRoZSBjYXNlIG9mIGBUZW1wbGF0ZS50ZW1wbGF0ZUF0dHJzYCkuXG4gICAgaWYgKHJvb3QgIT09IG51bGwpIHtcbiAgICAgIGNvbnN0IG5hbWUgPSByb290IGluc3RhbmNlb2YgdC5FbGVtZW50ID8gcm9vdC5uYW1lIDogcm9vdC50YWdOYW1lO1xuICAgICAgLy8gRG9uJ3QgcGFzcyBhbG9uZyBgbmctdGVtcGxhdGVgIHRhZyBuYW1lIHNpbmNlIGl0IGVuYWJsZXMgZGlyZWN0aXZlIG1hdGNoaW5nLlxuICAgICAgdGFnTmFtZSA9IG5hbWUgPT09IE5HX1RFTVBMQVRFX1RBR19OQU1FID8gbnVsbCA6IG5hbWU7XG4gICAgICBhdHRyc0V4cHJzID1cbiAgICAgICAgICB0aGlzLmdldEF0dHJpYnV0ZUV4cHJlc3Npb25zKE5HX1RFTVBMQVRFX1RBR19OQU1FLCByb290LmF0dHJpYnV0ZXMsIHJvb3QuaW5wdXRzLCBbXSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHt0YWdOYW1lLCBhdHRyc0V4cHJzfTtcbiAgfVxuXG4gIHByaXZhdGUgYWxsb2NhdGVEYXRhU2xvdCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YUluZGV4Kys7XG4gIH1cblxuICB2aXNpdEZvckxvb3BCbG9jayhibG9jazogdC5Gb3JMb29wQmxvY2spOiB2b2lkIHtcbiAgICAvLyBBbGxvY2F0ZSBvbmUgc2xvdCBmb3IgdGhlIHJlcGVhdGVyIG1ldGFkYXRhLiBUaGUgc2xvdHMgZm9yIHRoZSBwcmltYXJ5IGFuZCBlbXB0eSBibG9ja1xuICAgIC8vIGFyZSBpbXBsaWNpdGx5IGluZmVycmVkIGJ5IHRoZSBydW50aW1lIHRvIGluZGV4ICsgMSBhbmQgaW5kZXggKyAyLlxuICAgIGNvbnN0IGJsb2NrSW5kZXggPSB0aGlzLmFsbG9jYXRlRGF0YVNsb3QoKTtcbiAgICBjb25zdCB7dGFnTmFtZSwgYXR0cnNFeHByc30gPSB0aGlzLmluZmVyUHJvamVjdGlvbkRhdGFGcm9tSW5zZXJ0aW9uUG9pbnQoYmxvY2spO1xuICAgIGNvbnN0IHByaW1hcnlEYXRhID0gdGhpcy5wcmVwYXJlRW1iZWRkZWRUZW1wbGF0ZUZuKFxuICAgICAgICBibG9jay5jaGlsZHJlbiwgJ19Gb3InLFxuICAgICAgICBbYmxvY2suaXRlbSwgYmxvY2suY29udGV4dFZhcmlhYmxlcy4kaW5kZXgsIGJsb2NrLmNvbnRleHRWYXJpYWJsZXMuJGNvdW50XSwgYmxvY2suaTE4biwge1xuICAgICAgICAgIC8vIFdlIG5lZWQgdG8gcHJvdmlkZSBsZXZlbC1zcGVjaWZpYyB2ZXJzaW9ucyBvZiBgJGluZGV4YCBhbmQgYCRjb3VudGAsIGJlY2F1c2VcbiAgICAgICAgICAvLyB0aGV5J3JlIHVzZWQgd2hlbiBkZXJpdmluZyB0aGUgcmVtYWluaW5nIHZhcmlhYmxlcyAoYCRvZGRgLCBgJGV2ZW5gIGV0Yy4pIHdoaWxlIGF0IHRoZVxuICAgICAgICAgIC8vIHNhbWUgdGltZSBiZWluZyBhdmFpbGFibGUgaW1wbGljaXRseS4gV2l0aG91dCB0aGVzZSBhbGlhc2VzLCB3ZSB3b3VsZG4ndCBiZSBhYmxlIHRvXG4gICAgICAgICAgLy8gYWNjZXNzIHRoZSBgJGluZGV4YCBvZiBhIHBhcmVudCBsb29wIGZyb20gaW5zaWRlIG9mIGEgbmVzdGVkIGxvb3AuXG4gICAgICAgICAgW2Jsb2NrLmNvbnRleHRWYXJpYWJsZXMuJGluZGV4Lm5hbWVdOlxuICAgICAgICAgICAgICB0aGlzLmdldExldmVsU3BlY2lmaWNWYXJpYWJsZU5hbWUoJyRpbmRleCcsIHRoaXMubGV2ZWwgKyAxKSxcbiAgICAgICAgICBbYmxvY2suY29udGV4dFZhcmlhYmxlcy4kY291bnQubmFtZV06XG4gICAgICAgICAgICAgIHRoaXMuZ2V0TGV2ZWxTcGVjaWZpY1ZhcmlhYmxlTmFtZSgnJGNvdW50JywgdGhpcy5sZXZlbCArIDEpLFxuICAgICAgICB9KTtcbiAgICBjb25zdCB7ZXhwcmVzc2lvbjogdHJhY2tCeUV4cHJlc3Npb24sIHVzZXNDb21wb25lbnRJbnN0YW5jZTogdHJhY2tCeVVzZXNDb21wb25lbnRJbnN0YW5jZX0gPVxuICAgICAgICB0aGlzLmNyZWF0ZVRyYWNrQnlGdW5jdGlvbihibG9jayk7XG4gICAgbGV0IGVtcHR5RGF0YTogVGVtcGxhdGVEYXRhfG51bGwgPSBudWxsO1xuICAgIGxldCBlbXB0eVRhZ05hbWU6IHN0cmluZ3xudWxsID0gbnVsbDtcbiAgICBsZXQgZW1wdHlBdHRyc0V4cHJzOiBvLkV4cHJlc3Npb25bXXx1bmRlZmluZWQ7XG5cbiAgICBpZiAoYmxvY2suZW1wdHkgIT09IG51bGwpIHtcbiAgICAgIGNvbnN0IGVtcHR5SW5mZXJyZWQgPSB0aGlzLmluZmVyUHJvamVjdGlvbkRhdGFGcm9tSW5zZXJ0aW9uUG9pbnQoYmxvY2suZW1wdHkpO1xuICAgICAgZW1wdHlUYWdOYW1lID0gZW1wdHlJbmZlcnJlZC50YWdOYW1lO1xuICAgICAgZW1wdHlBdHRyc0V4cHJzID0gZW1wdHlJbmZlcnJlZC5hdHRyc0V4cHJzO1xuICAgICAgZW1wdHlEYXRhID0gdGhpcy5wcmVwYXJlRW1iZWRkZWRUZW1wbGF0ZUZuKFxuICAgICAgICAgIGJsb2NrLmVtcHR5LmNoaWxkcmVuLCAnX0ZvckVtcHR5JywgdW5kZWZpbmVkLCBibG9jay5lbXB0eS5pMThuKTtcbiAgICAgIC8vIEFsbG9jYXRlIGFuIGV4dHJhIHNsb3QgZm9yIHRoZSBlbXB0eSBibG9jayB0cmFja2luZy5cbiAgICAgIHRoaXMuYWxsb2NhdGVCaW5kaW5nU2xvdHMobnVsbCk7XG4gICAgfVxuXG4gICAgdGhpcy5yZWdpc3RlckNvbXB1dGVkTG9vcFZhcmlhYmxlcyhibG9jaywgcHJpbWFyeURhdGEuc2NvcGUpO1xuXG4gICAgLy8gYHJlcGVhdGVyQ3JlYXRlKDAsIC4uLilgXG4gICAgdGhpcy5jcmVhdGlvbkluc3RydWN0aW9uKGJsb2NrLnNvdXJjZVNwYW4sIFIzLnJlcGVhdGVyQ3JlYXRlLCAoKSA9PiB7XG4gICAgICBjb25zdCBwYXJhbXMgPSBbXG4gICAgICAgIG8ubGl0ZXJhbChibG9ja0luZGV4KSxcbiAgICAgICAgby52YXJpYWJsZShwcmltYXJ5RGF0YS5uYW1lKSxcbiAgICAgICAgby5saXRlcmFsKHByaW1hcnlEYXRhLmdldENvbnN0Q291bnQoKSksXG4gICAgICAgIG8ubGl0ZXJhbChwcmltYXJ5RGF0YS5nZXRWYXJDb3VudCgpKSxcbiAgICAgICAgby5saXRlcmFsKHRhZ05hbWUpLFxuICAgICAgICB0aGlzLmFkZEF0dHJzVG9Db25zdHMoYXR0cnNFeHBycyB8fCBudWxsKSxcbiAgICAgICAgdHJhY2tCeUV4cHJlc3Npb24sXG4gICAgICBdO1xuXG4gICAgICBpZiAoZW1wdHlEYXRhICE9PSBudWxsKSB7XG4gICAgICAgIHBhcmFtcy5wdXNoKFxuICAgICAgICAgICAgby5saXRlcmFsKHRyYWNrQnlVc2VzQ29tcG9uZW50SW5zdGFuY2UpLCBvLnZhcmlhYmxlKGVtcHR5RGF0YS5uYW1lKSxcbiAgICAgICAgICAgIG8ubGl0ZXJhbChlbXB0eURhdGEuZ2V0Q29uc3RDb3VudCgpKSwgby5saXRlcmFsKGVtcHR5RGF0YS5nZXRWYXJDb3VudCgpKSxcbiAgICAgICAgICAgIG8ubGl0ZXJhbChlbXB0eVRhZ05hbWUpLCB0aGlzLmFkZEF0dHJzVG9Db25zdHMoZW1wdHlBdHRyc0V4cHJzIHx8IG51bGwpKTtcbiAgICAgIH0gZWxzZSBpZiAodHJhY2tCeVVzZXNDb21wb25lbnRJbnN0YW5jZSkge1xuICAgICAgICAvLyBJZiB0aGUgdHJhY2tpbmcgZnVuY3Rpb24gZG9lc24ndCB1c2UgdGhlIGNvbXBvbmVudCBpbnN0YW5jZSwgd2UgY2FuIG9taXQgdGhlIGZsYWcuXG4gICAgICAgIHBhcmFtcy5wdXNoKG8ubGl0ZXJhbCh0cmFja0J5VXNlc0NvbXBvbmVudEluc3RhbmNlKSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0cmltVHJhaWxpbmdOdWxscyhwYXJhbXMpO1xuICAgIH0pO1xuXG4gICAgLy8gTm90ZTogdGhlIGV4cHJlc3Npb24gbmVlZHMgdG8gYmUgcHJvY2Vzc2VkICphZnRlciogdGhlIHRlbXBsYXRlLFxuICAgIC8vIG90aGVyd2lzZSBwaXBlcyBpbmplY3Rpbmcgc29tZSBzeW1ib2xzIHdvbid0IHdvcmsgKHNlZSAjNTIxMDIpLlxuICAgIC8vIE5vdGU6IHdlIGRvbid0IGFsbG9jYXRlIGJpbmRpbmcgc2xvdHMgZm9yIHRoaXMgZXhwcmVzc2lvbixcbiAgICAvLyBiZWNhdXNlIGl0cyB2YWx1ZSBpc24ndCBzdG9yZWQgaW4gdGhlIExWaWV3LlxuICAgIGNvbnN0IHZhbHVlID0gYmxvY2suZXhwcmVzc2lvbi52aXNpdCh0aGlzLl92YWx1ZUNvbnZlcnRlcik7XG5cbiAgICAvLyBgYWR2YW5jZSh4KTsgcmVwZWF0ZXIoaXRlcmFibGUpYFxuICAgIHRoaXMudXBkYXRlSW5zdHJ1Y3Rpb25XaXRoQWR2YW5jZShcbiAgICAgICAgYmxvY2tJbmRleCwgYmxvY2suc291cmNlU3BhbiwgUjMucmVwZWF0ZXIsICgpID0+IFt0aGlzLmNvbnZlcnRQcm9wZXJ0eUJpbmRpbmcodmFsdWUpXSk7XG4gIH1cblxuICBwcml2YXRlIHJlZ2lzdGVyQ29tcHV0ZWRMb29wVmFyaWFibGVzKGJsb2NrOiB0LkZvckxvb3BCbG9jaywgYmluZGluZ1Njb3BlOiBCaW5kaW5nU2NvcGUpOiB2b2lkIHtcbiAgICBjb25zdCBsZXZlbCA9IGJpbmRpbmdTY29wZS5iaW5kaW5nTGV2ZWw7XG5cbiAgICBiaW5kaW5nU2NvcGUuc2V0KGxldmVsLCBibG9jay5jb250ZXh0VmFyaWFibGVzLiRvZGQubmFtZSwgKHNjb3BlLCByZXRyaWV2YWxMZXZlbCkgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0TGV2ZWxTcGVjaWZpY0Zvckxvb3BWYXJpYWJsZShibG9jaywgc2NvcGUsIHJldHJpZXZhbExldmVsLCAnJGluZGV4JylcbiAgICAgICAgICAubW9kdWxvKG8ubGl0ZXJhbCgyKSlcbiAgICAgICAgICAubm90SWRlbnRpY2FsKG8ubGl0ZXJhbCgwKSk7XG4gICAgfSk7XG5cbiAgICBiaW5kaW5nU2NvcGUuc2V0KGxldmVsLCBibG9jay5jb250ZXh0VmFyaWFibGVzLiRldmVuLm5hbWUsIChzY29wZSwgcmV0cmlldmFsTGV2ZWwpID0+IHtcbiAgICAgIHJldHVybiB0aGlzLmdldExldmVsU3BlY2lmaWNGb3JMb29wVmFyaWFibGUoYmxvY2ssIHNjb3BlLCByZXRyaWV2YWxMZXZlbCwgJyRpbmRleCcpXG4gICAgICAgICAgLm1vZHVsbyhvLmxpdGVyYWwoMikpXG4gICAgICAgICAgLmlkZW50aWNhbChvLmxpdGVyYWwoMCkpO1xuICAgIH0pO1xuXG4gICAgYmluZGluZ1Njb3BlLnNldChsZXZlbCwgYmxvY2suY29udGV4dFZhcmlhYmxlcy4kZmlyc3QubmFtZSwgKHNjb3BlLCByZXRyaWV2YWxMZXZlbCkgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0TGV2ZWxTcGVjaWZpY0Zvckxvb3BWYXJpYWJsZShibG9jaywgc2NvcGUsIHJldHJpZXZhbExldmVsLCAnJGluZGV4JylcbiAgICAgICAgICAuaWRlbnRpY2FsKG8ubGl0ZXJhbCgwKSk7XG4gICAgfSk7XG5cbiAgICBiaW5kaW5nU2NvcGUuc2V0KGxldmVsLCBibG9jay5jb250ZXh0VmFyaWFibGVzLiRsYXN0Lm5hbWUsIChzY29wZSwgcmV0cmlldmFsTGV2ZWwpID0+IHtcbiAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5nZXRMZXZlbFNwZWNpZmljRm9yTG9vcFZhcmlhYmxlKGJsb2NrLCBzY29wZSwgcmV0cmlldmFsTGV2ZWwsICckaW5kZXgnKTtcbiAgICAgIGNvbnN0IGNvdW50ID0gdGhpcy5nZXRMZXZlbFNwZWNpZmljRm9yTG9vcFZhcmlhYmxlKGJsb2NrLCBzY29wZSwgcmV0cmlldmFsTGV2ZWwsICckY291bnQnKTtcbiAgICAgIHJldHVybiBpbmRleC5pZGVudGljYWwoY291bnQubWludXMoby5saXRlcmFsKDEpKSk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGdldExldmVsU3BlY2lmaWNWYXJpYWJsZU5hbWUobmFtZTogc3RyaW5nLCBsZXZlbDogbnVtYmVyKTogc3RyaW5nIHtcbiAgICAvLyBXZSB1c2UgdGhlIGDJtWAgaGVyZSB0byBlbnN1cmUgdGhhdCB0aGVyZSBhcmUgbm8gbmFtZSBjb25mbGljdHMgd2l0aCB1c2VyLWRlZmluZWQgdmFyaWFibGVzLlxuICAgIHJldHVybiBgybUke25hbWV9XyR7bGV2ZWx9YDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBuYW1lIG9mIGEgZm9yIGxvb3AgdmFyaWFibGUgYXQgYSBzcGVjaWZpYyBiaW5kaW5nIGxldmVsLiBUaGlzIGFsbG93cyB1cyB0byBsb29rXG4gICAqIHVwIGltcGxpY2l0bHkgc2hhZG93ZWQgdmFyaWFibGVzIGxpa2UgYCRpbmRleGAgYW5kIGAkY291bnRgIGF0IGEgc3BlY2lmaWMgbGV2ZWwuXG4gICAqL1xuICBwcml2YXRlIGdldExldmVsU3BlY2lmaWNGb3JMb29wVmFyaWFibGUoXG4gICAgICBibG9jazogdC5Gb3JMb29wQmxvY2ssIHNjb3BlOiBCaW5kaW5nU2NvcGUsIHJldHJpZXZhbExldmVsOiBudW1iZXIsXG4gICAgICBuYW1lOiBrZXlvZiB0LkZvckxvb3BCbG9ja0NvbnRleHQpOiBvLkV4cHJlc3Npb24ge1xuICAgIGNvbnN0IHNjb3BlTmFtZSA9IHNjb3BlLmJpbmRpbmdMZXZlbCA9PT0gcmV0cmlldmFsTGV2ZWwgP1xuICAgICAgICBibG9jay5jb250ZXh0VmFyaWFibGVzW25hbWVdLm5hbWUgOlxuICAgICAgICB0aGlzLmdldExldmVsU3BlY2lmaWNWYXJpYWJsZU5hbWUobmFtZSwgcmV0cmlldmFsTGV2ZWwpO1xuICAgIHJldHVybiBzY29wZS5nZXQoc2NvcGVOYW1lKSE7XG4gIH1cblxuICBwcml2YXRlIG9wdGltaXplVHJhY2tCeUZ1bmN0aW9uKGJsb2NrOiB0LkZvckxvb3BCbG9jaykge1xuICAgIGNvbnN0IGluZGV4TG9jYWxOYW1lID0gYmxvY2suY29udGV4dFZhcmlhYmxlcy4kaW5kZXgubmFtZTtcbiAgICBjb25zdCBpdGVtTmFtZSA9IGJsb2NrLml0ZW0ubmFtZTtcbiAgICBjb25zdCBhc3QgPSBibG9jay50cmFja0J5LmFzdDtcblxuICAgIC8vIFRvcC1sZXZlbCBhY2Nlc3Mgb2YgYCRpbmRleGAgdXNlcyB0aGUgYnVpbHQgaW4gYHJlcGVhdGVyVHJhY2tCeUluZGV4YC5cbiAgICBpZiAoYXN0IGluc3RhbmNlb2YgUHJvcGVydHlSZWFkICYmIGFzdC5yZWNlaXZlciBpbnN0YW5jZW9mIEltcGxpY2l0UmVjZWl2ZXIgJiZcbiAgICAgICAgYXN0Lm5hbWUgPT09IGluZGV4TG9jYWxOYW1lKSB7XG4gICAgICByZXR1cm4ge2V4cHJlc3Npb246IG8uaW1wb3J0RXhwcihSMy5yZXBlYXRlclRyYWNrQnlJbmRleCksIHVzZXNDb21wb25lbnRJbnN0YW5jZTogZmFsc2V9O1xuICAgIH1cblxuICAgIC8vIFRvcC1sZXZlbCBhY2Nlc3Mgb2YgdGhlIGl0ZW0gdXNlcyB0aGUgYnVpbHQgaW4gYHJlcGVhdGVyVHJhY2tCeUlkZW50aXR5YC5cbiAgICBpZiAoYXN0IGluc3RhbmNlb2YgUHJvcGVydHlSZWFkICYmIGFzdC5yZWNlaXZlciBpbnN0YW5jZW9mIEltcGxpY2l0UmVjZWl2ZXIgJiZcbiAgICAgICAgYXN0Lm5hbWUgPT09IGl0ZW1OYW1lKSB7XG4gICAgICByZXR1cm4ge2V4cHJlc3Npb246IG8uaW1wb3J0RXhwcihSMy5yZXBlYXRlclRyYWNrQnlJZGVudGl0eSksIHVzZXNDb21wb25lbnRJbnN0YW5jZTogZmFsc2V9O1xuICAgIH1cblxuICAgIC8vIFRvcC1sZXZlbCBjYWxscyBpbiB0aGUgZm9ybSBvZiBgZm4oJGluZGV4LCBpdGVtKWAgY2FuIGJlIHBhc3NlZCBpbiBkaXJlY3RseS5cbiAgICBpZiAoYXN0IGluc3RhbmNlb2YgQ2FsbCAmJiBhc3QucmVjZWl2ZXIgaW5zdGFuY2VvZiBQcm9wZXJ0eVJlYWQgJiZcbiAgICAgICAgYXN0LnJlY2VpdmVyLnJlY2VpdmVyIGluc3RhbmNlb2YgSW1wbGljaXRSZWNlaXZlciAmJiBhc3QuYXJncy5sZW5ndGggPT09IDIpIHtcbiAgICAgIGNvbnN0IGZpcnN0SXNJbmRleCA9IGFzdC5hcmdzWzBdIGluc3RhbmNlb2YgUHJvcGVydHlSZWFkICYmXG4gICAgICAgICAgYXN0LmFyZ3NbMF0ucmVjZWl2ZXIgaW5zdGFuY2VvZiBJbXBsaWNpdFJlY2VpdmVyICYmIGFzdC5hcmdzWzBdLm5hbWUgPT09IGluZGV4TG9jYWxOYW1lO1xuICAgICAgY29uc3Qgc2Vjb25kSXNJdGVtID0gYXN0LmFyZ3NbMV0gaW5zdGFuY2VvZiBQcm9wZXJ0eVJlYWQgJiZcbiAgICAgICAgICBhc3QuYXJnc1sxXS5yZWNlaXZlciBpbnN0YW5jZW9mIEltcGxpY2l0UmVjZWl2ZXIgJiYgYXN0LmFyZ3NbMV0ubmFtZSA9PT0gaXRlbU5hbWU7XG5cbiAgICAgIGlmIChmaXJzdElzSW5kZXggJiYgc2Vjb25kSXNJdGVtKSB7XG4gICAgICAgIC8vIElmIHdlJ3JlIGluIHRoZSB0b3AtbGV2ZWwgY29tcG9uZW50LCB3ZSBjYW4gYWNjZXNzIGRpcmVjdGx5IHRocm91Z2ggYGN0eGAsXG4gICAgICAgIC8vIG90aGVyd2lzZSB3ZSBoYXZlIHRvIGdldCBhIGhvbGQgb2YgdGhlIGNvbXBvbmVudCB0aHJvdWdoIGBjb21wb25lbnRJbnN0YW5jZSgpYC5cbiAgICAgICAgY29uc3QgcmVjZWl2ZXIgPSB0aGlzLmxldmVsID09PSAwID8gby52YXJpYWJsZShDT05URVhUX05BTUUpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IG8uRXh0ZXJuYWxFeHByKFIzLmNvbXBvbmVudEluc3RhbmNlKS5jYWxsRm4oW10pO1xuICAgICAgICByZXR1cm4ge2V4cHJlc3Npb246IHJlY2VpdmVyLnByb3AoYXN0LnJlY2VpdmVyLm5hbWUpLCB1c2VzQ29tcG9uZW50SW5zdGFuY2U6IGZhbHNlfTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlVHJhY2tCeUZ1bmN0aW9uKGJsb2NrOiB0LkZvckxvb3BCbG9jayk6IHtcbiAgICBleHByZXNzaW9uOiBvLkV4cHJlc3Npb24sXG4gICAgdXNlc0NvbXBvbmVudEluc3RhbmNlOiBib29sZWFuLFxuICB9IHtcbiAgICBjb25zdCBvcHRpbWl6ZWRGbiA9IHRoaXMub3B0aW1pemVUcmFja0J5RnVuY3Rpb24oYmxvY2spO1xuXG4gICAgLy8gSWYgdGhlIHRyYWNraW5nIGZ1bmN0aW9uIGNhbiBiZSBvcHRpbWl6ZWQsIHdlIGRvbid0IG5lZWQgYW55IGZ1cnRoZXIgcHJvY2Vzc2luZy5cbiAgICBpZiAob3B0aW1pemVkRm4gIT09IG51bGwpIHtcbiAgICAgIHJldHVybiBvcHRpbWl6ZWRGbjtcbiAgICB9XG5cbiAgICBjb25zdCBjb250ZXh0VmFycyA9IGJsb2NrLmNvbnRleHRWYXJpYWJsZXM7XG4gICAgY29uc3Qgc2NvcGUgPSBuZXcgVHJhY2tCeUJpbmRpbmdTY29wZSh0aGlzLl9iaW5kaW5nU2NvcGUsIHtcbiAgICAgIC8vIEFsaWFzIGAkaW5kZXhgIGFuZCB0aGUgaXRlbSBuYW1lIHRvIGAkaW5kZXhgIGFuZCBgJGl0ZW1gIHJlc3BlY3RpdmVseS5cbiAgICAgIC8vIFRoaXMgYWxsb3dzIHVzIHRvIHJldXNlIHB1cmUgZnVuY3Rpb25zIHRoYXQgbWF5IGhhdmUgZGlmZmVyZW50IGl0ZW0gbmFtZXMsXG4gICAgICAvLyBidXQgYXJlIG90aGVyd2lzZSBpZGVudGljYWwuXG4gICAgICBbY29udGV4dFZhcnMuJGluZGV4Lm5hbWVdOiAnJGluZGV4JyxcbiAgICAgIFtibG9jay5pdGVtLm5hbWVdOiAnJGl0ZW0nLFxuXG4gICAgICAvLyBBY2Nlc3NpbmcgdGhlc2UgdmFyaWFibGVzIGluIGEgdHJhY2tpbmcgZnVuY3Rpb24gd2lsbCByZXN1bHQgaW4gYSB0ZW1wbGF0ZSBkaWFnbm9zdGljLlxuICAgICAgLy8gV2UgZGVmaW5lIHRoZW0gYXMgZ2xvYmFscyBzbyB0aGF0IHRoZWlyIGFjY2Vzc2VzIGFyZSBwcmVzZXJ2ZWQgdmVyYmF0aW0gaW5zdGVhZCBvZiBiZWluZ1xuICAgICAgLy8gcmV3cml0dGVuIHRvIHRoZSBhY3R1YWwgYWNjZXNzZXMuXG4gICAgICBbY29udGV4dFZhcnMuJGNvdW50Lm5hbWVdOiBjb250ZXh0VmFycy4kY291bnQubmFtZSxcbiAgICAgIFtjb250ZXh0VmFycy4kZmlyc3QubmFtZV06IGNvbnRleHRWYXJzLiRmaXJzdC5uYW1lLFxuICAgICAgW2NvbnRleHRWYXJzLiRsYXN0Lm5hbWVdOiBjb250ZXh0VmFycy4kbGFzdC5uYW1lLFxuICAgICAgW2NvbnRleHRWYXJzLiRldmVuLm5hbWVdOiBjb250ZXh0VmFycy4kZXZlbi5uYW1lLFxuICAgICAgW2NvbnRleHRWYXJzLiRvZGQubmFtZV06IGNvbnRleHRWYXJzLiRvZGQubmFtZSxcbiAgICB9KTtcbiAgICBjb25zdCBwYXJhbXMgPSBbbmV3IG8uRm5QYXJhbSgnJGluZGV4JyksIG5ldyBvLkZuUGFyYW0oJyRpdGVtJyldO1xuICAgIGNvbnN0IHN0bXRzID0gY29udmVydFB1cmVDb21wb25lbnRTY29wZUZ1bmN0aW9uKFxuICAgICAgICBibG9jay50cmFja0J5LmFzdCwgc2NvcGUsIG8udmFyaWFibGUoQ09OVEVYVF9OQU1FKSwgJ3RyYWNrJyk7XG4gICAgY29uc3QgdXNlc0NvbXBvbmVudEluc3RhbmNlID0gc2NvcGUuZ2V0Q29tcG9uZW50QWNjZXNzQ291bnQoKSA+IDA7XG4gICAgbGV0IGZuOiBvLkFycm93RnVuY3Rpb25FeHByfG8uRnVuY3Rpb25FeHByO1xuXG4gICAgaWYgKCF1c2VzQ29tcG9uZW50SW5zdGFuY2UgJiYgc3RtdHMubGVuZ3RoID09PSAxICYmIHN0bXRzWzBdIGluc3RhbmNlb2Ygby5FeHByZXNzaW9uU3RhdGVtZW50KSB7XG4gICAgICBmbiA9IG8uYXJyb3dGbihwYXJhbXMsIHN0bXRzWzBdLmV4cHIpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUaGUgbGFzdCBzdGF0ZW1lbnQgaXMgcmV0dXJuZWQgaW1wbGljaXRseS5cbiAgICAgIGlmIChzdG10cy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IGxhc3RTdGF0ZW1lbnQgPSBzdG10c1tzdG10cy5sZW5ndGggLSAxXTtcbiAgICAgICAgaWYgKGxhc3RTdGF0ZW1lbnQgaW5zdGFuY2VvZiBvLkV4cHJlc3Npb25TdGF0ZW1lbnQpIHtcbiAgICAgICAgICBzdG10c1tzdG10cy5sZW5ndGggLSAxXSA9IG5ldyBvLlJldHVyblN0YXRlbWVudChsYXN0U3RhdGVtZW50LmV4cHIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBUaGlzIGhhcyB0byBiZSBhIGZ1bmN0aW9uIGV4cHJlc3Npb24sIGJlY2F1c2UgYC5iaW5kYCBkb2Vzbid0IHdvcmsgb24gYXJyb3cgZnVuY3Rpb25zLlxuICAgICAgZm4gPSBvLmZuKHBhcmFtcywgc3RtdHMpO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBleHByZXNzaW9uOiB0aGlzLmNvbnN0YW50UG9vbC5nZXRTaGFyZWRGdW5jdGlvblJlZmVyZW5jZShmbiwgJ19mb3JUcmFjaycpLFxuICAgICAgdXNlc0NvbXBvbmVudEluc3RhbmNlLFxuICAgIH07XG4gIH1cblxuICBnZXRDb25zdENvdW50KCkge1xuICAgIHJldHVybiB0aGlzLl9kYXRhSW5kZXg7XG4gIH1cblxuICBnZXRWYXJDb3VudCgpIHtcbiAgICByZXR1cm4gdGhpcy5fcHVyZUZ1bmN0aW9uU2xvdHM7XG4gIH1cblxuICBnZXRDb25zdHMoKTogQ29tcG9uZW50RGVmQ29uc3RzIHtcbiAgICByZXR1cm4gdGhpcy5fY29uc3RhbnRzO1xuICB9XG5cbiAgZ2V0TmdDb250ZW50U2VsZWN0b3JzKCk6IG8uRXhwcmVzc2lvbnxudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fbmdDb250ZW50UmVzZXJ2ZWRTbG90cy5sZW5ndGggP1xuICAgICAgICB0aGlzLmNvbnN0YW50UG9vbC5nZXRDb25zdExpdGVyYWwoYXNMaXRlcmFsKHRoaXMuX25nQ29udGVudFJlc2VydmVkU2xvdHMpLCB0cnVlKSA6XG4gICAgICAgIG51bGw7XG4gIH1cblxuICBwcml2YXRlIGJpbmRpbmdDb250ZXh0KCkge1xuICAgIHJldHVybiBgJHt0aGlzLl9iaW5kaW5nQ29udGV4dCsrfWA7XG4gIH1cblxuICBwcml2YXRlIHRlbXBsYXRlUHJvcGVydHlCaW5kaW5ncyhcbiAgICAgIHRlbXBsYXRlSW5kZXg6IG51bWJlciwgYXR0cnM6ICh0LkJvdW5kQXR0cmlidXRlfHQuVGV4dEF0dHJpYnV0ZSlbXSkge1xuICAgIGNvbnN0IHByb3BlcnR5QmluZGluZ3M6IE9taXQ8SW5zdHJ1Y3Rpb24sICdyZWZlcmVuY2UnPltdID0gW107XG5cbiAgICBmb3IgKGNvbnN0IGlucHV0IG9mIGF0dHJzKSB7XG4gICAgICBpZiAoIShpbnB1dCBpbnN0YW5jZW9mIHQuQm91bmRBdHRyaWJ1dGUpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB2YWx1ZSA9IGlucHV0LnZhbHVlLnZpc2l0KHRoaXMuX3ZhbHVlQ29udmVydGVyKTtcbiAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmFsbG9jYXRlQmluZGluZ1Nsb3RzKHZhbHVlKTtcbiAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIEludGVycG9sYXRpb24pIHtcbiAgICAgICAgLy8gUGFyYW1zIHR5cGljYWxseSBjb250YWluIGF0dHJpYnV0ZSBuYW1lc3BhY2UgYW5kIHZhbHVlIHNhbml0aXplciwgd2hpY2ggaXMgYXBwbGljYWJsZVxuICAgICAgICAvLyBmb3IgcmVndWxhciBIVE1MIGVsZW1lbnRzLCBidXQgbm90IGFwcGxpY2FibGUgZm9yIDxuZy10ZW1wbGF0ZT4gKHNpbmNlIHByb3BzIGFjdCBhc1xuICAgICAgICAvLyBpbnB1dHMgdG8gZGlyZWN0aXZlcyksIHNvIGtlZXAgcGFyYW1zIGFycmF5IGVtcHR5LlxuICAgICAgICBjb25zdCBwYXJhbXM6IGFueVtdID0gW107XG5cbiAgICAgICAgLy8gcHJvcD1cInt7dmFsdWV9fVwiIGNhc2VcbiAgICAgICAgdGhpcy5pbnRlcnBvbGF0ZWRVcGRhdGVJbnN0cnVjdGlvbihcbiAgICAgICAgICAgIGdldFByb3BlcnR5SW50ZXJwb2xhdGlvbkV4cHJlc3Npb24odmFsdWUpLCB0ZW1wbGF0ZUluZGV4LCBpbnB1dC5uYW1lLCBpbnB1dCwgdmFsdWUsXG4gICAgICAgICAgICBwYXJhbXMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gW3Byb3BdPVwidmFsdWVcIiBjYXNlXG4gICAgICAgIHByb3BlcnR5QmluZGluZ3MucHVzaCh7XG4gICAgICAgICAgc3BhbjogaW5wdXQuc291cmNlU3BhbixcbiAgICAgICAgICBwYXJhbXNPckZuOiBnZXRCaW5kaW5nRnVuY3Rpb25QYXJhbXMoKCkgPT4gdGhpcy5jb252ZXJ0UHJvcGVydHlCaW5kaW5nKHZhbHVlKSwgaW5wdXQubmFtZSlcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBwcm9wZXJ0eUJpbmRpbmcgb2YgcHJvcGVydHlCaW5kaW5ncykge1xuICAgICAgdGhpcy51cGRhdGVJbnN0cnVjdGlvbldpdGhBZHZhbmNlKFxuICAgICAgICAgIHRlbXBsYXRlSW5kZXgsIHByb3BlcnR5QmluZGluZy5zcGFuLCBSMy5wcm9wZXJ0eSwgcHJvcGVydHlCaW5kaW5nLnBhcmFtc09yRm4pO1xuICAgIH1cbiAgfVxuXG4gIC8vIEJpbmRpbmdzIG11c3Qgb25seSBiZSByZXNvbHZlZCBhZnRlciBhbGwgbG9jYWwgcmVmcyBoYXZlIGJlZW4gdmlzaXRlZCwgc28gYWxsXG4gIC8vIGluc3RydWN0aW9ucyBhcmUgcXVldWVkIGluIGNhbGxiYWNrcyB0aGF0IGV4ZWN1dGUgb25jZSB0aGUgaW5pdGlhbCBwYXNzIGhhcyBjb21wbGV0ZWQuXG4gIC8vIE90aGVyd2lzZSwgd2Ugd291bGRuJ3QgYmUgYWJsZSB0byBzdXBwb3J0IGxvY2FsIHJlZnMgdGhhdCBhcmUgZGVmaW5lZCBhZnRlciB0aGVpclxuICAvLyBiaW5kaW5ncy4gZS5nLiB7eyBmb28gfX0gPGRpdiAjZm9vPjwvZGl2PlxuICBwcml2YXRlIGluc3RydWN0aW9uRm4oXG4gICAgICBmbnM6IEluc3RydWN0aW9uW10sIHNwYW46IFBhcnNlU291cmNlU3BhbnxudWxsLCByZWZlcmVuY2U6IG8uRXh0ZXJuYWxSZWZlcmVuY2UsXG4gICAgICBwYXJhbXNPckZuOiBJbnN0cnVjdGlvblBhcmFtcywgcHJlcGVuZDogYm9vbGVhbiA9IGZhbHNlKTogdm9pZCB7XG4gICAgZm5zW3ByZXBlbmQgPyAndW5zaGlmdCcgOiAncHVzaCddKHtzcGFuLCByZWZlcmVuY2UsIHBhcmFtc09yRm59KTtcbiAgfVxuXG4gIHByaXZhdGUgcHJvY2Vzc1N0eWxpbmdVcGRhdGVJbnN0cnVjdGlvbihcbiAgICAgIGVsZW1lbnRJbmRleDogbnVtYmVyLCBpbnN0cnVjdGlvbjogU3R5bGluZ0luc3RydWN0aW9ufG51bGwpIHtcbiAgICBsZXQgYWxsb2NhdGVCaW5kaW5nU2xvdHMgPSAwO1xuICAgIGlmIChpbnN0cnVjdGlvbikge1xuICAgICAgZm9yIChjb25zdCBjYWxsIG9mIGluc3RydWN0aW9uLmNhbGxzKSB7XG4gICAgICAgIGFsbG9jYXRlQmluZGluZ1Nsb3RzICs9IGNhbGwuYWxsb2NhdGVCaW5kaW5nU2xvdHM7XG4gICAgICAgIHRoaXMudXBkYXRlSW5zdHJ1Y3Rpb25XaXRoQWR2YW5jZShcbiAgICAgICAgICAgIGVsZW1lbnRJbmRleCwgY2FsbC5zb3VyY2VTcGFuLCBpbnN0cnVjdGlvbi5yZWZlcmVuY2UsXG4gICAgICAgICAgICAoKSA9PiBjYWxsLnBhcmFtcyhcbiAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9PiAoY2FsbC5zdXBwb3J0c0ludGVycG9sYXRpb24gJiYgdmFsdWUgaW5zdGFuY2VvZiBJbnRlcnBvbGF0aW9uKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0VXBkYXRlSW5zdHJ1Y3Rpb25Bcmd1bWVudHModmFsdWUpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb252ZXJ0UHJvcGVydHlCaW5kaW5nKHZhbHVlKSkgYXMgby5FeHByZXNzaW9uW10pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYWxsb2NhdGVCaW5kaW5nU2xvdHM7XG4gIH1cblxuICBwcml2YXRlIGNyZWF0aW9uSW5zdHJ1Y3Rpb24oXG4gICAgICBzcGFuOiBQYXJzZVNvdXJjZVNwYW58bnVsbCwgcmVmZXJlbmNlOiBvLkV4dGVybmFsUmVmZXJlbmNlLCBwYXJhbXNPckZuPzogSW5zdHJ1Y3Rpb25QYXJhbXMsXG4gICAgICBwcmVwZW5kPzogYm9vbGVhbikge1xuICAgIHRoaXMuaW5zdHJ1Y3Rpb25Gbih0aGlzLl9jcmVhdGlvbkNvZGVGbnMsIHNwYW4sIHJlZmVyZW5jZSwgcGFyYW1zT3JGbiB8fCBbXSwgcHJlcGVuZCk7XG4gIH1cblxuICBwcml2YXRlIHVwZGF0ZUluc3RydWN0aW9uV2l0aEFkdmFuY2UoXG4gICAgICBub2RlSW5kZXg6IG51bWJlciwgc3BhbjogUGFyc2VTb3VyY2VTcGFufG51bGwsIHJlZmVyZW5jZTogby5FeHRlcm5hbFJlZmVyZW5jZSxcbiAgICAgIHBhcmFtc09yRm4/OiBJbnN0cnVjdGlvblBhcmFtcykge1xuICAgIHRoaXMuYWRkQWR2YW5jZUluc3RydWN0aW9uSWZOZWNlc3Nhcnkobm9kZUluZGV4LCBzcGFuKTtcbiAgICB0aGlzLnVwZGF0ZUluc3RydWN0aW9uKHNwYW4sIHJlZmVyZW5jZSwgcGFyYW1zT3JGbik7XG4gIH1cblxuICBwcml2YXRlIHVwZGF0ZUluc3RydWN0aW9uKFxuICAgICAgc3BhbjogUGFyc2VTb3VyY2VTcGFufG51bGwsIHJlZmVyZW5jZTogby5FeHRlcm5hbFJlZmVyZW5jZSwgcGFyYW1zT3JGbj86IEluc3RydWN0aW9uUGFyYW1zKSB7XG4gICAgdGhpcy5pbnN0cnVjdGlvbkZuKHRoaXMuX3VwZGF0ZUNvZGVGbnMsIHNwYW4sIHJlZmVyZW5jZSwgcGFyYW1zT3JGbiB8fCBbXSk7XG4gIH1cblxuICBwcml2YXRlIGFkZEFkdmFuY2VJbnN0cnVjdGlvbklmTmVjZXNzYXJ5KG5vZGVJbmRleDogbnVtYmVyLCBzcGFuOiBQYXJzZVNvdXJjZVNwYW58bnVsbCkge1xuICAgIGlmIChub2RlSW5kZXggIT09IHRoaXMuX2N1cnJlbnRJbmRleCkge1xuICAgICAgY29uc3QgZGVsdGEgPSBub2RlSW5kZXggLSB0aGlzLl9jdXJyZW50SW5kZXg7XG5cbiAgICAgIGlmIChkZWx0YSA8IDEpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdhZHZhbmNlIGluc3RydWN0aW9uIGNhbiBvbmx5IGdvIGZvcndhcmRzJyk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuaW5zdHJ1Y3Rpb25GbihcbiAgICAgICAgICB0aGlzLl91cGRhdGVDb2RlRm5zLCBzcGFuLCBSMy5hZHZhbmNlLCBkZWx0YSA+IDEgPyBbby5saXRlcmFsKGRlbHRhKV0gOiBbXSk7XG4gICAgICB0aGlzLl9jdXJyZW50SW5kZXggPSBub2RlSW5kZXg7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhbGxvY2F0ZVB1cmVGdW5jdGlvblNsb3RzKG51bVNsb3RzOiBudW1iZXIpOiBudW1iZXIge1xuICAgIGNvbnN0IG9yaWdpbmFsU2xvdHMgPSB0aGlzLl9wdXJlRnVuY3Rpb25TbG90cztcbiAgICB0aGlzLl9wdXJlRnVuY3Rpb25TbG90cyArPSBudW1TbG90cztcbiAgICByZXR1cm4gb3JpZ2luYWxTbG90cztcbiAgfVxuXG4gIHByaXZhdGUgYWxsb2NhdGVCaW5kaW5nU2xvdHModmFsdWU6IEFTVHxudWxsKSB7XG4gICAgdGhpcy5fYmluZGluZ1Nsb3RzICs9IHZhbHVlIGluc3RhbmNlb2YgSW50ZXJwb2xhdGlvbiA/IHZhbHVlLmV4cHJlc3Npb25zLmxlbmd0aCA6IDE7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyBhbiBleHByZXNzaW9uIHRoYXQgcmVmZXJzIHRvIHRoZSBpbXBsaWNpdCByZWNlaXZlci4gVGhlIGltcGxpY2l0XG4gICAqIHJlY2VpdmVyIGlzIGFsd2F5cyB0aGUgcm9vdCBsZXZlbCBjb250ZXh0LlxuICAgKi9cbiAgcHJpdmF0ZSBnZXRJbXBsaWNpdFJlY2VpdmVyRXhwcigpOiBvLlJlYWRWYXJFeHByIHtcbiAgICBpZiAodGhpcy5faW1wbGljaXRSZWNlaXZlckV4cHIpIHtcbiAgICAgIHJldHVybiB0aGlzLl9pbXBsaWNpdFJlY2VpdmVyRXhwcjtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5faW1wbGljaXRSZWNlaXZlckV4cHIgPSB0aGlzLmxldmVsID09PSAwID9cbiAgICAgICAgby52YXJpYWJsZShDT05URVhUX05BTUUpIDpcbiAgICAgICAgdGhpcy5fYmluZGluZ1Njb3BlLmdldE9yQ3JlYXRlU2hhcmVkQ29udGV4dFZhcigwKTtcbiAgfVxuXG4gIHByaXZhdGUgY29udmVydFByb3BlcnR5QmluZGluZyh2YWx1ZTogQVNUKTogby5FeHByZXNzaW9uIHtcbiAgICBjb25zdCBjb252ZXJ0ZWRQcm9wZXJ0eUJpbmRpbmcgPVxuICAgICAgICBjb252ZXJ0UHJvcGVydHlCaW5kaW5nKHRoaXMsIHRoaXMuZ2V0SW1wbGljaXRSZWNlaXZlckV4cHIoKSwgdmFsdWUsIHRoaXMuYmluZGluZ0NvbnRleHQoKSk7XG4gICAgY29uc3QgdmFsRXhwciA9IGNvbnZlcnRlZFByb3BlcnR5QmluZGluZy5jdXJyVmFsRXhwcjtcbiAgICB0aGlzLl90ZW1wVmFyaWFibGVzLnB1c2goLi4uY29udmVydGVkUHJvcGVydHlCaW5kaW5nLnN0bXRzKTtcbiAgICByZXR1cm4gdmFsRXhwcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIGEgbGlzdCBvZiBhcmd1bWVudCBleHByZXNzaW9ucyB0byBwYXNzIHRvIGFuIHVwZGF0ZSBpbnN0cnVjdGlvbiBleHByZXNzaW9uLiBBbHNvIHVwZGF0ZXNcbiAgICogdGhlIHRlbXAgdmFyaWFibGVzIHN0YXRlIHdpdGggdGVtcCB2YXJpYWJsZXMgdGhhdCB3ZXJlIGlkZW50aWZpZWQgYXMgbmVlZGluZyB0byBiZSBjcmVhdGVkXG4gICAqIHdoaWxlIHZpc2l0aW5nIHRoZSBhcmd1bWVudHMuXG4gICAqIEBwYXJhbSB2YWx1ZSBUaGUgb3JpZ2luYWwgZXhwcmVzc2lvbiB3ZSB3aWxsIGJlIHJlc29sdmluZyBhbiBhcmd1bWVudHMgbGlzdCBmcm9tLlxuICAgKi9cbiAgcHJpdmF0ZSBnZXRVcGRhdGVJbnN0cnVjdGlvbkFyZ3VtZW50cyh2YWx1ZTogSW50ZXJwb2xhdGlvbik6IG8uRXhwcmVzc2lvbltdIHtcbiAgICBjb25zdCB7YXJncywgc3RtdHN9ID1cbiAgICAgICAgY29udmVydFVwZGF0ZUFyZ3VtZW50cyh0aGlzLCB0aGlzLmdldEltcGxpY2l0UmVjZWl2ZXJFeHByKCksIHZhbHVlLCB0aGlzLmJpbmRpbmdDb250ZXh0KCkpO1xuXG4gICAgdGhpcy5fdGVtcFZhcmlhYmxlcy5wdXNoKC4uLnN0bXRzKTtcbiAgICByZXR1cm4gYXJncztcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuZCByZXR1cm5zIGEgdmFyaWFibGUgdGhhdCBjYW4gYmUgdXNlZCB0b1xuICAgKiBzdG9yZSB0aGUgc3RhdGUgYmV0d2VlbiBjb250cm9sIGZsb3cgaW5zdHJ1Y3Rpb25zLlxuICAgKi9cbiAgcHJpdmF0ZSBhbGxvY2F0ZUNvbnRyb2xGbG93VGVtcFZhcmlhYmxlKCk6IG8uUmVhZFZhckV4cHIge1xuICAgIC8vIE5vdGU6IHRoZSBhc3N1bXB0aW9uIGhlcmUgaXMgdGhhdCB3ZSdsbCBvbmx5IG5lZWQgb25lIHRlbXBvcmFyeSB2YXJpYWJsZSBmb3IgYWxsIGNvbnRyb2xcbiAgICAvLyBmbG93IGluc3RydWN0aW9ucy4gSXQncyBleHBlY3RlZCB0aGF0IGFueSBpbnN0cnVjdGlvbnMgd2lsbCBvdmVyd3JpdGUgaXQgYmVmb3JlIHBhc3NpbmcgaXRcbiAgICAvLyBpbnRvIHRoZSBwYXJhbWV0ZXJzLlxuICAgIGlmICh0aGlzLl9jb250cm9sRmxvd1RlbXBWYXJpYWJsZSA9PT0gbnVsbCkge1xuICAgICAgY29uc3QgbmFtZSA9IGAke3RoaXMuY29udGV4dE5hbWV9X2NvbnRGbG93VG1wYDtcbiAgICAgIHRoaXMuX3RlbXBWYXJpYWJsZXMucHVzaChuZXcgby5EZWNsYXJlVmFyU3RtdChuYW1lKSk7XG4gICAgICB0aGlzLl9jb250cm9sRmxvd1RlbXBWYXJpYWJsZSA9IG8udmFyaWFibGUobmFtZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX2NvbnRyb2xGbG93VGVtcFZhcmlhYmxlO1xuICB9XG5cbiAgLyoqXG4gICAqIFByZXBhcmVzIGFsbCBhdHRyaWJ1dGUgZXhwcmVzc2lvbiB2YWx1ZXMgZm9yIHRoZSBgVEF0dHJpYnV0ZXNgIGFycmF5LlxuICAgKlxuICAgKiBUaGUgcHVycG9zZSBvZiB0aGlzIGZ1bmN0aW9uIGlzIHRvIHByb3Blcmx5IGNvbnN0cnVjdCBhbiBhdHRyaWJ1dGVzIGFycmF5IHRoYXRcbiAgICogaXMgcGFzc2VkIGludG8gdGhlIGBlbGVtZW50U3RhcnRgIChvciBqdXN0IGBlbGVtZW50YCkgZnVuY3Rpb25zLiBCZWNhdXNlIHRoZXJlXG4gICAqIGFyZSBtYW55IGRpZmZlcmVudCB0eXBlcyBvZiBhdHRyaWJ1dGVzLCB0aGUgYXJyYXkgbmVlZHMgdG8gYmUgY29uc3RydWN0ZWQgaW4gYVxuICAgKiBzcGVjaWFsIHdheSBzbyB0aGF0IGBlbGVtZW50U3RhcnRgIGNhbiBwcm9wZXJseSBldmFsdWF0ZSB0aGVtLlxuICAgKlxuICAgKiBUaGUgZm9ybWF0IGxvb2tzIGxpa2UgdGhpczpcbiAgICpcbiAgICogYGBgXG4gICAqIGF0dHJzID0gW3Byb3AsIHZhbHVlLCBwcm9wMiwgdmFsdWUyLFxuICAgKiAgIFBST0pFQ1RfQVMsIHNlbGVjdG9yLFxuICAgKiAgIENMQVNTRVMsIGNsYXNzMSwgY2xhc3MyLFxuICAgKiAgIFNUWUxFUywgc3R5bGUxLCB2YWx1ZTEsIHN0eWxlMiwgdmFsdWUyLFxuICAgKiAgIEJJTkRJTkdTLCBuYW1lMSwgbmFtZTIsIG5hbWUzLFxuICAgKiAgIFRFTVBMQVRFLCBuYW1lNCwgbmFtZTUsIG5hbWU2LFxuICAgKiAgIEkxOE4sIG5hbWU3LCBuYW1lOCwgLi4uXVxuICAgKiBgYGBcbiAgICpcbiAgICogTm90ZSB0aGF0IHRoaXMgZnVuY3Rpb24gd2lsbCBmdWxseSBpZ25vcmUgYWxsIHN5bnRoZXRpYyAoQGZvbykgYXR0cmlidXRlIHZhbHVlc1xuICAgKiBiZWNhdXNlIHRob3NlIHZhbHVlcyBhcmUgaW50ZW5kZWQgdG8gYWx3YXlzIGJlIGdlbmVyYXRlZCBhcyBwcm9wZXJ0eSBpbnN0cnVjdGlvbnMuXG4gICAqL1xuICBwcml2YXRlIGdldEF0dHJpYnV0ZUV4cHJlc3Npb25zKFxuICAgICAgZWxlbWVudE5hbWU6IHN0cmluZywgcmVuZGVyQXR0cmlidXRlczogdC5UZXh0QXR0cmlidXRlW10sIGlucHV0czogdC5Cb3VuZEF0dHJpYnV0ZVtdLFxuICAgICAgb3V0cHV0czogdC5Cb3VuZEV2ZW50W10sIHN0eWxlcz86IFN0eWxpbmdCdWlsZGVyLFxuICAgICAgdGVtcGxhdGVBdHRyczogKHQuQm91bmRBdHRyaWJ1dGV8dC5UZXh0QXR0cmlidXRlKVtdID0gW10sXG4gICAgICBib3VuZEkxOG5BdHRyczogdC5Cb3VuZEF0dHJpYnV0ZVtdID0gW10pOiBvLkV4cHJlc3Npb25bXSB7XG4gICAgY29uc3QgYWxyZWFkeVNlZW4gPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICBjb25zdCBhdHRyRXhwcnM6IG8uRXhwcmVzc2lvbltdID0gW107XG4gICAgbGV0IG5nUHJvamVjdEFzQXR0cjogdC5UZXh0QXR0cmlidXRlfHVuZGVmaW5lZDtcblxuICAgIGZvciAoY29uc3QgYXR0ciBvZiByZW5kZXJBdHRyaWJ1dGVzKSB7XG4gICAgICBpZiAoYXR0ci5uYW1lID09PSBOR19QUk9KRUNUX0FTX0FUVFJfTkFNRSkge1xuICAgICAgICBuZ1Byb2plY3RBc0F0dHIgPSBhdHRyO1xuICAgICAgfVxuXG4gICAgICAvLyBOb3RlIHRoYXQgc3RhdGljIGkxOG4gYXR0cmlidXRlcyBhcmVuJ3QgaW4gdGhlIGkxOG4gYXJyYXksXG4gICAgICAvLyBiZWNhdXNlIHRoZXkncmUgdHJlYXRlZCBpbiB0aGUgc2FtZSB3YXkgYXMgcmVndWxhciBhdHRyaWJ1dGVzLlxuICAgICAgaWYgKGF0dHIuaTE4bikge1xuICAgICAgICAvLyBXaGVuIGkxOG4gYXR0cmlidXRlcyBhcmUgcHJlc2VudCBvbiBlbGVtZW50cyB3aXRoIHN0cnVjdHVyYWwgZGlyZWN0aXZlc1xuICAgICAgICAvLyAoZS5nLiBgPGRpdiAqbmdJZiB0aXRsZT1cIkhlbGxvXCIgaTE4bi10aXRsZT5gKSwgd2Ugd2FudCB0byBhdm9pZCBnZW5lcmF0aW5nXG4gICAgICAgIC8vIGR1cGxpY2F0ZSBpMThuIHRyYW5zbGF0aW9uIGJsb2NrcyBmb3IgYMm1ybV0ZW1wbGF0ZWAgYW5kIGDJtcm1ZWxlbWVudGAgaW5zdHJ1Y3Rpb25cbiAgICAgICAgLy8gYXR0cmlidXRlcy4gU28gd2UgZG8gYSBjYWNoZSBsb29rdXAgdG8gc2VlIGlmIHN1aXRhYmxlIGkxOG4gdHJhbnNsYXRpb24gYmxvY2tcbiAgICAgICAgLy8gYWxyZWFkeSBleGlzdHMuXG4gICAgICAgIGNvbnN0IHtpMThuVmFyUmVmc0NhY2hlfSA9IHRoaXMuX2NvbnN0YW50cztcbiAgICAgICAgbGV0IGkxOG5WYXJSZWY6IG8uUmVhZFZhckV4cHI7XG4gICAgICAgIGlmIChpMThuVmFyUmVmc0NhY2hlLmhhcyhhdHRyLmkxOG4pKSB7XG4gICAgICAgICAgaTE4blZhclJlZiA9IGkxOG5WYXJSZWZzQ2FjaGUuZ2V0KGF0dHIuaTE4bikhO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGkxOG5WYXJSZWYgPSB0aGlzLmkxOG5UcmFuc2xhdGUoYXR0ci5pMThuIGFzIGkxOG4uTWVzc2FnZSk7XG4gICAgICAgICAgaTE4blZhclJlZnNDYWNoZS5zZXQoYXR0ci5pMThuLCBpMThuVmFyUmVmKTtcbiAgICAgICAgfVxuICAgICAgICBhdHRyRXhwcnMucHVzaChvLmxpdGVyYWwoYXR0ci5uYW1lKSwgaTE4blZhclJlZik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhdHRyRXhwcnMucHVzaChcbiAgICAgICAgICAgIC4uLmdldEF0dHJpYnV0ZU5hbWVMaXRlcmFscyhhdHRyLm5hbWUpLCB0cnVzdGVkQ29uc3RBdHRyaWJ1dGUoZWxlbWVudE5hbWUsIGF0dHIpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBLZWVwIG5nUHJvamVjdEFzIG5leHQgdG8gdGhlIG90aGVyIG5hbWUsIHZhbHVlIHBhaXJzIHNvIHdlIGNhbiB2ZXJpZnkgdGhhdCB3ZSBtYXRjaFxuICAgIC8vIG5nUHJvamVjdEFzIG1hcmtlciBpbiB0aGUgYXR0cmlidXRlIG5hbWUgc2xvdC5cbiAgICBpZiAobmdQcm9qZWN0QXNBdHRyKSB7XG4gICAgICBhdHRyRXhwcnMucHVzaCguLi5nZXROZ1Byb2plY3RBc0xpdGVyYWwobmdQcm9qZWN0QXNBdHRyKSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYWRkQXR0ckV4cHIoa2V5OiBzdHJpbmd8bnVtYmVyLCB2YWx1ZT86IG8uRXhwcmVzc2lvbik6IHZvaWQge1xuICAgICAgaWYgKHR5cGVvZiBrZXkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGlmICghYWxyZWFkeVNlZW4uaGFzKGtleSkpIHtcbiAgICAgICAgICBhdHRyRXhwcnMucHVzaCguLi5nZXRBdHRyaWJ1dGVOYW1lTGl0ZXJhbHMoa2V5KSk7XG4gICAgICAgICAgdmFsdWUgIT09IHVuZGVmaW5lZCAmJiBhdHRyRXhwcnMucHVzaCh2YWx1ZSk7XG4gICAgICAgICAgYWxyZWFkeVNlZW4uYWRkKGtleSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGF0dHJFeHBycy5wdXNoKG8ubGl0ZXJhbChrZXkpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBpdCdzIGltcG9ydGFudCB0aGF0IHRoaXMgb2NjdXJzIGJlZm9yZSBCSU5ESU5HUyBhbmQgVEVNUExBVEUgYmVjYXVzZSBvbmNlIGBlbGVtZW50U3RhcnRgXG4gICAgLy8gY29tZXMgYWNyb3NzIHRoZSBCSU5ESU5HUyBvciBURU1QTEFURSBtYXJrZXJzIHRoZW4gaXQgd2lsbCBjb250aW51ZSByZWFkaW5nIGVhY2ggdmFsdWUgYXNcbiAgICAvLyBhcyBzaW5nbGUgcHJvcGVydHkgdmFsdWUgY2VsbCBieSBjZWxsLlxuICAgIGlmIChzdHlsZXMpIHtcbiAgICAgIHN0eWxlcy5wb3B1bGF0ZUluaXRpYWxTdHlsaW5nQXR0cnMoYXR0ckV4cHJzKTtcbiAgICB9XG5cbiAgICBpZiAoaW5wdXRzLmxlbmd0aCB8fCBvdXRwdXRzLmxlbmd0aCkge1xuICAgICAgY29uc3QgYXR0cnNMZW5ndGhCZWZvcmVJbnB1dHMgPSBhdHRyRXhwcnMubGVuZ3RoO1xuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGlucHV0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBpbnB1dCA9IGlucHV0c1tpXTtcbiAgICAgICAgLy8gV2UgZG9uJ3Qgd2FudCB0aGUgYW5pbWF0aW9uIGFuZCBhdHRyaWJ1dGUgYmluZGluZ3MgaW4gdGhlXG4gICAgICAgIC8vIGF0dHJpYnV0ZXMgYXJyYXkgc2luY2UgdGhleSBhcmVuJ3QgdXNlZCBmb3IgZGlyZWN0aXZlIG1hdGNoaW5nLlxuICAgICAgICBpZiAoaW5wdXQudHlwZSAhPT0gQmluZGluZ1R5cGUuQW5pbWF0aW9uICYmIGlucHV0LnR5cGUgIT09IEJpbmRpbmdUeXBlLkF0dHJpYnV0ZSkge1xuICAgICAgICAgIGFkZEF0dHJFeHByKGlucHV0Lm5hbWUpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3V0cHV0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBvdXRwdXQgPSBvdXRwdXRzW2ldO1xuICAgICAgICBpZiAob3V0cHV0LnR5cGUgIT09IFBhcnNlZEV2ZW50VHlwZS5BbmltYXRpb24pIHtcbiAgICAgICAgICBhZGRBdHRyRXhwcihvdXRwdXQubmFtZSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gdGhpcyBpcyBhIGNoZWFwIHdheSBvZiBhZGRpbmcgdGhlIG1hcmtlciBvbmx5IGFmdGVyIGFsbCB0aGUgaW5wdXQvb3V0cHV0XG4gICAgICAvLyB2YWx1ZXMgaGF2ZSBiZWVuIGZpbHRlcmVkIChieSBub3QgaW5jbHVkaW5nIHRoZSBhbmltYXRpb24gb25lcykgYW5kIGFkZGVkXG4gICAgICAvLyB0byB0aGUgZXhwcmVzc2lvbnMuIFRoZSBtYXJrZXIgaXMgaW1wb3J0YW50IGJlY2F1c2UgaXQgdGVsbHMgdGhlIHJ1bnRpbWVcbiAgICAgIC8vIGNvZGUgdGhhdCB0aGlzIGlzIHdoZXJlIGF0dHJpYnV0ZXMgd2l0aG91dCB2YWx1ZXMgc3RhcnQuLi5cbiAgICAgIGlmIChhdHRyRXhwcnMubGVuZ3RoICE9PSBhdHRyc0xlbmd0aEJlZm9yZUlucHV0cykge1xuICAgICAgICBhdHRyRXhwcnMuc3BsaWNlKGF0dHJzTGVuZ3RoQmVmb3JlSW5wdXRzLCAwLCBvLmxpdGVyYWwoY29yZS5BdHRyaWJ1dGVNYXJrZXIuQmluZGluZ3MpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGVtcGxhdGVBdHRycy5sZW5ndGgpIHtcbiAgICAgIGF0dHJFeHBycy5wdXNoKG8ubGl0ZXJhbChjb3JlLkF0dHJpYnV0ZU1hcmtlci5UZW1wbGF0ZSkpO1xuICAgICAgdGVtcGxhdGVBdHRycy5mb3JFYWNoKGF0dHIgPT4gYWRkQXR0ckV4cHIoYXR0ci5uYW1lKSk7XG4gICAgfVxuXG4gICAgaWYgKGJvdW5kSTE4bkF0dHJzLmxlbmd0aCkge1xuICAgICAgYXR0ckV4cHJzLnB1c2goby5saXRlcmFsKGNvcmUuQXR0cmlidXRlTWFya2VyLkkxOG4pKTtcbiAgICAgIGJvdW5kSTE4bkF0dHJzLmZvckVhY2goYXR0ciA9PiBhZGRBdHRyRXhwcihhdHRyLm5hbWUpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYXR0ckV4cHJzO1xuICB9XG5cbiAgcHJpdmF0ZSBhZGRUb0NvbnN0cyhleHByZXNzaW9uOiBvLkV4cHJlc3Npb24pOiBvLkxpdGVyYWxFeHByIHtcbiAgICBpZiAoby5pc051bGwoZXhwcmVzc2lvbikpIHtcbiAgICAgIHJldHVybiBvLlRZUEVEX05VTExfRVhQUjtcbiAgICB9XG5cbiAgICBjb25zdCBjb25zdHMgPSB0aGlzLl9jb25zdGFudHMuY29uc3RFeHByZXNzaW9ucztcblxuICAgIC8vIFRyeSB0byByZXVzZSBhIGxpdGVyYWwgdGhhdCdzIGFscmVhZHkgaW4gdGhlIGFycmF5LCBpZiBwb3NzaWJsZS5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbnN0cy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGNvbnN0c1tpXS5pc0VxdWl2YWxlbnQoZXhwcmVzc2lvbikpIHtcbiAgICAgICAgcmV0dXJuIG8ubGl0ZXJhbChpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gby5saXRlcmFsKGNvbnN0cy5wdXNoKGV4cHJlc3Npb24pIC0gMSk7XG4gIH1cblxuICBwcml2YXRlIGFkZEF0dHJzVG9Db25zdHMoYXR0cnM6IG8uRXhwcmVzc2lvbltdfG51bGwpOiBvLkxpdGVyYWxFeHByIHtcbiAgICByZXR1cm4gYXR0cnMgIT09IG51bGwgJiYgYXR0cnMubGVuZ3RoID4gMCA/IHRoaXMuYWRkVG9Db25zdHMoby5saXRlcmFsQXJyKGF0dHJzKSkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgby5UWVBFRF9OVUxMX0VYUFI7XG4gIH1cblxuICBwcml2YXRlIHByZXBhcmVSZWZzQXJyYXkocmVmZXJlbmNlczogdC5SZWZlcmVuY2VbXSk6IG8uRXhwcmVzc2lvbiB7XG4gICAgaWYgKCFyZWZlcmVuY2VzIHx8IHJlZmVyZW5jZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gby5UWVBFRF9OVUxMX0VYUFI7XG4gICAgfVxuXG4gICAgY29uc3QgcmVmc1BhcmFtID0gcmVmZXJlbmNlcy5mbGF0TWFwKHJlZmVyZW5jZSA9PiB7XG4gICAgICBjb25zdCBzbG90ID0gdGhpcy5hbGxvY2F0ZURhdGFTbG90KCk7XG4gICAgICAvLyBHZW5lcmF0ZSB0aGUgdXBkYXRlIHRlbXBvcmFyeS5cbiAgICAgIGNvbnN0IHZhcmlhYmxlTmFtZSA9IHRoaXMuX2JpbmRpbmdTY29wZS5mcmVzaFJlZmVyZW5jZU5hbWUoKTtcbiAgICAgIGNvbnN0IHJldHJpZXZhbExldmVsID0gdGhpcy5sZXZlbDtcbiAgICAgIGNvbnN0IGxocyA9IG8udmFyaWFibGUodmFyaWFibGVOYW1lKTtcbiAgICAgIHRoaXMuX2JpbmRpbmdTY29wZS5zZXQoXG4gICAgICAgICAgcmV0cmlldmFsTGV2ZWwsIHJlZmVyZW5jZS5uYW1lLCBsaHMsXG4gICAgICAgICAgRGVjbGFyYXRpb25Qcmlvcml0eS5ERUZBVUxULCAoc2NvcGU6IEJpbmRpbmdTY29wZSwgcmVsYXRpdmVMZXZlbDogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgICAvLyBlLmcuIG5leHRDb250ZXh0KDIpO1xuICAgICAgICAgICAgY29uc3QgbmV4dENvbnRleHRTdG10ID1cbiAgICAgICAgICAgICAgICByZWxhdGl2ZUxldmVsID4gMCA/IFtnZW5lcmF0ZU5leHRDb250ZXh0RXhwcihyZWxhdGl2ZUxldmVsKS50b1N0bXQoKV0gOiBbXTtcblxuICAgICAgICAgICAgLy8gZS5nLiBjb25zdCAkZm9vJCA9IHJlZmVyZW5jZSgxKTtcbiAgICAgICAgICAgIGNvbnN0IHJlZkV4cHIgPSBsaHMuc2V0KG8uaW1wb3J0RXhwcihSMy5yZWZlcmVuY2UpLmNhbGxGbihbby5saXRlcmFsKHNsb3QpXSkpO1xuICAgICAgICAgICAgcmV0dXJuIG5leHRDb250ZXh0U3RtdC5jb25jYXQocmVmRXhwci50b0NvbnN0RGVjbCgpKTtcbiAgICAgICAgICB9LCB0cnVlKTtcblxuICAgICAgcmV0dXJuIFtyZWZlcmVuY2UubmFtZSwgcmVmZXJlbmNlLnZhbHVlXTtcbiAgICB9KTtcblxuICAgIHJldHVybiBhc0xpdGVyYWwocmVmc1BhcmFtKTtcbiAgfVxuXG4gIHByaXZhdGUgcHJlcGFyZUxpc3RlbmVyUGFyYW1ldGVyKHRhZ05hbWU6IHN0cmluZywgb3V0cHV0QXN0OiB0LkJvdW5kRXZlbnQsIGluZGV4OiBudW1iZXIpOlxuICAgICAgKCkgPT4gby5FeHByZXNzaW9uW10ge1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBjb25zdCBldmVudE5hbWU6IHN0cmluZyA9IG91dHB1dEFzdC5uYW1lO1xuICAgICAgY29uc3QgYmluZGluZ0ZuTmFtZSA9IG91dHB1dEFzdC50eXBlID09PSBQYXJzZWRFdmVudFR5cGUuQW5pbWF0aW9uID9cbiAgICAgICAgICAvLyBzeW50aGV0aWMgQGxpc3RlbmVyLmZvbyB2YWx1ZXMgYXJlIHRyZWF0ZWQgdGhlIGV4YWN0IHNhbWUgYXMgYXJlIHN0YW5kYXJkIGxpc3RlbmVyc1xuICAgICAgICAgIHByZXBhcmVTeW50aGV0aWNMaXN0ZW5lckZ1bmN0aW9uTmFtZShldmVudE5hbWUsIG91dHB1dEFzdC5waGFzZSEpIDpcbiAgICAgICAgICBzYW5pdGl6ZUlkZW50aWZpZXIoZXZlbnROYW1lKTtcbiAgICAgIGNvbnN0IGhhbmRsZXJOYW1lID0gYCR7dGhpcy50ZW1wbGF0ZU5hbWV9XyR7dGFnTmFtZX1fJHtiaW5kaW5nRm5OYW1lfV8ke2luZGV4fV9saXN0ZW5lcmA7XG4gICAgICBjb25zdCBzY29wZSA9IHRoaXMuX2JpbmRpbmdTY29wZS5uZXN0ZWRTY29wZShcbiAgICAgICAgICB0aGlzLl9iaW5kaW5nU2NvcGUuYmluZGluZ0xldmVsLCBFVkVOVF9CSU5ESU5HX1NDT1BFX0dMT0JBTFMpO1xuICAgICAgcmV0dXJuIHByZXBhcmVFdmVudExpc3RlbmVyUGFyYW1ldGVycyhvdXRwdXRBc3QsIGhhbmRsZXJOYW1lLCBzY29wZSk7XG4gICAgfTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgVmFsdWVDb252ZXJ0ZXIgZXh0ZW5kcyBBc3RNZW1vcnlFZmZpY2llbnRUcmFuc2Zvcm1lciB7XG4gIHByaXZhdGUgX3BpcGVCaW5kRXhwcnM6IENhbGxbXSA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBjb25zdGFudFBvb2w6IENvbnN0YW50UG9vbCwgcHJpdmF0ZSBhbGxvY2F0ZVNsb3Q6ICgpID0+IG51bWJlcixcbiAgICAgIHByaXZhdGUgYWxsb2NhdGVQdXJlRnVuY3Rpb25TbG90czogKG51bVNsb3RzOiBudW1iZXIpID0+IG51bWJlcixcbiAgICAgIHByaXZhdGUgZGVmaW5lUGlwZTpcbiAgICAgICAgICAobmFtZTogc3RyaW5nLCBsb2NhbE5hbWU6IHN0cmluZywgc2xvdDogbnVtYmVyLCB2YWx1ZTogby5FeHByZXNzaW9uKSA9PiB2b2lkKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIC8vIEFzdE1lbW9yeUVmZmljaWVudFRyYW5zZm9ybWVyXG4gIG92ZXJyaWRlIHZpc2l0UGlwZShwaXBlOiBCaW5kaW5nUGlwZSwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICAvLyBBbGxvY2F0ZSBhIHNsb3QgdG8gY3JlYXRlIHRoZSBwaXBlXG4gICAgY29uc3Qgc2xvdCA9IHRoaXMuYWxsb2NhdGVTbG90KCk7XG4gICAgY29uc3Qgc2xvdFBzZXVkb0xvY2FsID0gYFBJUEU6JHtzbG90fWA7XG4gICAgLy8gQWxsb2NhdGUgb25lIHNsb3QgZm9yIHRoZSByZXN1bHQgcGx1cyBvbmUgc2xvdCBwZXIgcGlwZSBhcmd1bWVudFxuICAgIGNvbnN0IHB1cmVGdW5jdGlvblNsb3QgPSB0aGlzLmFsbG9jYXRlUHVyZUZ1bmN0aW9uU2xvdHMoMiArIHBpcGUuYXJncy5sZW5ndGgpO1xuICAgIGNvbnN0IHRhcmdldCA9IG5ldyBQcm9wZXJ0eVJlYWQoXG4gICAgICAgIHBpcGUuc3BhbiwgcGlwZS5zb3VyY2VTcGFuLCBwaXBlLm5hbWVTcGFuLCBuZXcgSW1wbGljaXRSZWNlaXZlcihwaXBlLnNwYW4sIHBpcGUuc291cmNlU3BhbiksXG4gICAgICAgIHNsb3RQc2V1ZG9Mb2NhbCk7XG4gICAgY29uc3Qge2lkZW50aWZpZXIsIGlzVmFyTGVuZ3RofSA9IHBpcGVCaW5kaW5nQ2FsbEluZm8ocGlwZS5hcmdzKTtcbiAgICB0aGlzLmRlZmluZVBpcGUocGlwZS5uYW1lLCBzbG90UHNldWRvTG9jYWwsIHNsb3QsIG8uaW1wb3J0RXhwcihpZGVudGlmaWVyKSk7XG4gICAgY29uc3QgYXJnczogQVNUW10gPSBbcGlwZS5leHAsIC4uLnBpcGUuYXJnc107XG4gICAgY29uc3QgY29udmVydGVkQXJnczogQVNUW10gPSBpc1Zhckxlbmd0aCA/XG4gICAgICAgIHRoaXMudmlzaXRBbGwoW25ldyBMaXRlcmFsQXJyYXkocGlwZS5zcGFuLCBwaXBlLnNvdXJjZVNwYW4sIGFyZ3MpXSkgOlxuICAgICAgICB0aGlzLnZpc2l0QWxsKGFyZ3MpO1xuXG4gICAgY29uc3QgcGlwZUJpbmRFeHByID0gbmV3IENhbGwoXG4gICAgICAgIHBpcGUuc3BhbiwgcGlwZS5zb3VyY2VTcGFuLCB0YXJnZXQsXG4gICAgICAgIFtcbiAgICAgICAgICBuZXcgTGl0ZXJhbFByaW1pdGl2ZShwaXBlLnNwYW4sIHBpcGUuc291cmNlU3Bhbiwgc2xvdCksXG4gICAgICAgICAgbmV3IExpdGVyYWxQcmltaXRpdmUocGlwZS5zcGFuLCBwaXBlLnNvdXJjZVNwYW4sIHB1cmVGdW5jdGlvblNsb3QpLFxuICAgICAgICAgIC4uLmNvbnZlcnRlZEFyZ3MsXG4gICAgICAgIF0sXG4gICAgICAgIG51bGwhKTtcbiAgICB0aGlzLl9waXBlQmluZEV4cHJzLnB1c2gocGlwZUJpbmRFeHByKTtcbiAgICByZXR1cm4gcGlwZUJpbmRFeHByO1xuICB9XG5cbiAgdXBkYXRlUGlwZVNsb3RPZmZzZXRzKGJpbmRpbmdTbG90czogbnVtYmVyKSB7XG4gICAgdGhpcy5fcGlwZUJpbmRFeHBycy5mb3JFYWNoKChwaXBlOiBDYWxsKSA9PiB7XG4gICAgICAvLyB1cGRhdGUgdGhlIHNsb3Qgb2Zmc2V0IGFyZyAoaW5kZXggMSkgdG8gYWNjb3VudCBmb3IgYmluZGluZyBzbG90c1xuICAgICAgY29uc3Qgc2xvdE9mZnNldCA9IHBpcGUuYXJnc1sxXSBhcyBMaXRlcmFsUHJpbWl0aXZlO1xuICAgICAgKHNsb3RPZmZzZXQudmFsdWUgYXMgbnVtYmVyKSArPSBiaW5kaW5nU2xvdHM7XG4gICAgfSk7XG4gIH1cblxuICBvdmVycmlkZSB2aXNpdExpdGVyYWxBcnJheShhcnJheTogTGl0ZXJhbEFycmF5LCBjb250ZXh0OiBhbnkpOiBBU1Qge1xuICAgIHJldHVybiBuZXcgQnVpbHRpbkZ1bmN0aW9uQ2FsbChcbiAgICAgICAgYXJyYXkuc3BhbiwgYXJyYXkuc291cmNlU3BhbiwgdGhpcy52aXNpdEFsbChhcnJheS5leHByZXNzaW9ucyksIHZhbHVlcyA9PiB7XG4gICAgICAgICAgLy8gSWYgdGhlIGxpdGVyYWwgaGFzIGNhbGN1bGF0ZWQgKG5vbi1saXRlcmFsKSBlbGVtZW50cyB0cmFuc2Zvcm0gaXQgaW50b1xuICAgICAgICAgIC8vIGNhbGxzIHRvIGxpdGVyYWwgZmFjdG9yaWVzIHRoYXQgY29tcG9zZSB0aGUgbGl0ZXJhbCBhbmQgd2lsbCBjYWNoZSBpbnRlcm1lZGlhdGVcbiAgICAgICAgICAvLyB2YWx1ZXMuXG4gICAgICAgICAgY29uc3QgbGl0ZXJhbCA9IG8ubGl0ZXJhbEFycih2YWx1ZXMpO1xuICAgICAgICAgIHJldHVybiBnZXRMaXRlcmFsRmFjdG9yeSh0aGlzLmNvbnN0YW50UG9vbCwgbGl0ZXJhbCwgdGhpcy5hbGxvY2F0ZVB1cmVGdW5jdGlvblNsb3RzKTtcbiAgICAgICAgfSk7XG4gIH1cblxuICBvdmVycmlkZSB2aXNpdExpdGVyYWxNYXAobWFwOiBMaXRlcmFsTWFwLCBjb250ZXh0OiBhbnkpOiBBU1Qge1xuICAgIHJldHVybiBuZXcgQnVpbHRpbkZ1bmN0aW9uQ2FsbChtYXAuc3BhbiwgbWFwLnNvdXJjZVNwYW4sIHRoaXMudmlzaXRBbGwobWFwLnZhbHVlcyksIHZhbHVlcyA9PiB7XG4gICAgICAvLyBJZiB0aGUgbGl0ZXJhbCBoYXMgY2FsY3VsYXRlZCAobm9uLWxpdGVyYWwpIGVsZW1lbnRzICB0cmFuc2Zvcm0gaXQgaW50b1xuICAgICAgLy8gY2FsbHMgdG8gbGl0ZXJhbCBmYWN0b3JpZXMgdGhhdCBjb21wb3NlIHRoZSBsaXRlcmFsIGFuZCB3aWxsIGNhY2hlIGludGVybWVkaWF0ZVxuICAgICAgLy8gdmFsdWVzLlxuICAgICAgY29uc3QgbGl0ZXJhbCA9IG8ubGl0ZXJhbE1hcCh2YWx1ZXMubWFwKFxuICAgICAgICAgICh2YWx1ZSwgaW5kZXgpID0+ICh7a2V5OiBtYXAua2V5c1tpbmRleF0ua2V5LCB2YWx1ZSwgcXVvdGVkOiBtYXAua2V5c1tpbmRleF0ucXVvdGVkfSkpKTtcbiAgICAgIHJldHVybiBnZXRMaXRlcmFsRmFjdG9yeSh0aGlzLmNvbnN0YW50UG9vbCwgbGl0ZXJhbCwgdGhpcy5hbGxvY2F0ZVB1cmVGdW5jdGlvblNsb3RzKTtcbiAgICB9KTtcbiAgfVxufVxuXG4vLyBQaXBlcyBhbHdheXMgaGF2ZSBhdCBsZWFzdCBvbmUgcGFyYW1ldGVyLCB0aGUgdmFsdWUgdGhleSBvcGVyYXRlIG9uXG5jb25zdCBwaXBlQmluZGluZ0lkZW50aWZpZXJzID0gW1IzLnBpcGVCaW5kMSwgUjMucGlwZUJpbmQyLCBSMy5waXBlQmluZDMsIFIzLnBpcGVCaW5kNF07XG5cbmZ1bmN0aW9uIHBpcGVCaW5kaW5nQ2FsbEluZm8oYXJnczogby5FeHByZXNzaW9uW10pIHtcbiAgY29uc3QgaWRlbnRpZmllciA9IHBpcGVCaW5kaW5nSWRlbnRpZmllcnNbYXJncy5sZW5ndGhdO1xuICByZXR1cm4ge1xuICAgIGlkZW50aWZpZXI6IGlkZW50aWZpZXIgfHwgUjMucGlwZUJpbmRWLFxuICAgIGlzVmFyTGVuZ3RoOiAhaWRlbnRpZmllcixcbiAgfTtcbn1cblxuY29uc3QgcHVyZUZ1bmN0aW9uSWRlbnRpZmllcnMgPSBbXG4gIFIzLnB1cmVGdW5jdGlvbjAsIFIzLnB1cmVGdW5jdGlvbjEsIFIzLnB1cmVGdW5jdGlvbjIsIFIzLnB1cmVGdW5jdGlvbjMsIFIzLnB1cmVGdW5jdGlvbjQsXG4gIFIzLnB1cmVGdW5jdGlvbjUsIFIzLnB1cmVGdW5jdGlvbjYsIFIzLnB1cmVGdW5jdGlvbjcsIFIzLnB1cmVGdW5jdGlvbjhcbl07XG5cbmZ1bmN0aW9uIHB1cmVGdW5jdGlvbkNhbGxJbmZvKGFyZ3M6IG8uRXhwcmVzc2lvbltdKSB7XG4gIGNvbnN0IGlkZW50aWZpZXIgPSBwdXJlRnVuY3Rpb25JZGVudGlmaWVyc1thcmdzLmxlbmd0aF07XG4gIHJldHVybiB7XG4gICAgaWRlbnRpZmllcjogaWRlbnRpZmllciB8fCBSMy5wdXJlRnVuY3Rpb25WLFxuICAgIGlzVmFyTGVuZ3RoOiAhaWRlbnRpZmllcixcbiAgfTtcbn1cblxuLy8gZS5nLiB4KDIpO1xuZnVuY3Rpb24gZ2VuZXJhdGVOZXh0Q29udGV4dEV4cHIocmVsYXRpdmVMZXZlbERpZmY6IG51bWJlcik6IG8uRXhwcmVzc2lvbiB7XG4gIHJldHVybiBvLmltcG9ydEV4cHIoUjMubmV4dENvbnRleHQpXG4gICAgICAuY2FsbEZuKHJlbGF0aXZlTGV2ZWxEaWZmID4gMSA/IFtvLmxpdGVyYWwocmVsYXRpdmVMZXZlbERpZmYpXSA6IFtdKTtcbn1cblxuZnVuY3Rpb24gZ2V0TGl0ZXJhbEZhY3RvcnkoXG4gICAgY29uc3RhbnRQb29sOiBDb25zdGFudFBvb2wsIGxpdGVyYWw6IG8uTGl0ZXJhbEFycmF5RXhwcnxvLkxpdGVyYWxNYXBFeHByLFxuICAgIGFsbG9jYXRlU2xvdHM6IChudW1TbG90czogbnVtYmVyKSA9PiBudW1iZXIpOiBvLkV4cHJlc3Npb24ge1xuICBjb25zdCB7bGl0ZXJhbEZhY3RvcnksIGxpdGVyYWxGYWN0b3J5QXJndW1lbnRzfSA9IGNvbnN0YW50UG9vbC5nZXRMaXRlcmFsRmFjdG9yeShsaXRlcmFsKTtcbiAgLy8gQWxsb2NhdGUgMSBzbG90IGZvciB0aGUgcmVzdWx0IHBsdXMgMSBwZXIgYXJndW1lbnRcbiAgY29uc3Qgc3RhcnRTbG90ID0gYWxsb2NhdGVTbG90cygxICsgbGl0ZXJhbEZhY3RvcnlBcmd1bWVudHMubGVuZ3RoKTtcbiAgY29uc3Qge2lkZW50aWZpZXIsIGlzVmFyTGVuZ3RofSA9IHB1cmVGdW5jdGlvbkNhbGxJbmZvKGxpdGVyYWxGYWN0b3J5QXJndW1lbnRzKTtcblxuICAvLyBMaXRlcmFsIGZhY3RvcmllcyBhcmUgcHVyZSBmdW5jdGlvbnMgdGhhdCBvbmx5IG5lZWQgdG8gYmUgcmUtaW52b2tlZCB3aGVuIHRoZSBwYXJhbWV0ZXJzXG4gIC8vIGNoYW5nZS5cbiAgY29uc3QgYXJncyA9IFtvLmxpdGVyYWwoc3RhcnRTbG90KSwgbGl0ZXJhbEZhY3RvcnldO1xuXG4gIGlmIChpc1Zhckxlbmd0aCkge1xuICAgIGFyZ3MucHVzaChvLmxpdGVyYWxBcnIobGl0ZXJhbEZhY3RvcnlBcmd1bWVudHMpKTtcbiAgfSBlbHNlIHtcbiAgICBhcmdzLnB1c2goLi4ubGl0ZXJhbEZhY3RvcnlBcmd1bWVudHMpO1xuICB9XG5cbiAgcmV0dXJuIG8uaW1wb3J0RXhwcihpZGVudGlmaWVyKS5jYWxsRm4oYXJncyk7XG59XG5cbi8qKlxuICogR2V0cyBhbiBhcnJheSBvZiBsaXRlcmFscyB0aGF0IGNhbiBiZSBhZGRlZCB0byBhbiBleHByZXNzaW9uXG4gKiB0byByZXByZXNlbnQgdGhlIG5hbWUgYW5kIG5hbWVzcGFjZSBvZiBhbiBhdHRyaWJ1dGUuIEUuZy5cbiAqIGA6eGxpbms6aHJlZmAgdHVybnMgaW50byBgW0F0dHJpYnV0ZU1hcmtlci5OYW1lc3BhY2VVUkksICd4bGluaycsICdocmVmJ11gLlxuICpcbiAqIEBwYXJhbSBuYW1lIE5hbWUgb2YgdGhlIGF0dHJpYnV0ZSwgaW5jbHVkaW5nIHRoZSBuYW1lc3BhY2UuXG4gKi9cbmZ1bmN0aW9uIGdldEF0dHJpYnV0ZU5hbWVMaXRlcmFscyhuYW1lOiBzdHJpbmcpOiBvLkxpdGVyYWxFeHByW10ge1xuICBjb25zdCBbYXR0cmlidXRlTmFtZXNwYWNlLCBhdHRyaWJ1dGVOYW1lXSA9IHNwbGl0TnNOYW1lKG5hbWUpO1xuICBjb25zdCBuYW1lTGl0ZXJhbCA9IG8ubGl0ZXJhbChhdHRyaWJ1dGVOYW1lKTtcblxuICBpZiAoYXR0cmlidXRlTmFtZXNwYWNlKSB7XG4gICAgcmV0dXJuIFtcbiAgICAgIG8ubGl0ZXJhbChjb3JlLkF0dHJpYnV0ZU1hcmtlci5OYW1lc3BhY2VVUkkpLCBvLmxpdGVyYWwoYXR0cmlidXRlTmFtZXNwYWNlKSwgbmFtZUxpdGVyYWxcbiAgICBdO1xuICB9XG5cbiAgcmV0dXJuIFtuYW1lTGl0ZXJhbF07XG59XG5cbi8qKlxuICogRnVuY3Rpb24gd2hpY2ggaXMgZXhlY3V0ZWQgd2hlbmV2ZXIgYSB2YXJpYWJsZSBpcyByZWZlcmVuY2VkIGZvciB0aGUgZmlyc3QgdGltZSBpbiBhIGdpdmVuXG4gKiBzY29wZS5cbiAqXG4gKiBJdCBpcyBleHBlY3RlZCB0aGF0IHRoZSBmdW5jdGlvbiBjcmVhdGVzIHRoZSBgY29uc3QgbG9jYWxOYW1lID0gZXhwcmVzc2lvbmA7IHN0YXRlbWVudC5cbiAqL1xudHlwZSBEZWNsYXJlTG9jYWxWYXJDYWxsYmFjayA9IChzY29wZTogQmluZGluZ1Njb3BlLCByZWxhdGl2ZUxldmVsOiBudW1iZXIpID0+IG8uU3RhdGVtZW50W107XG5cbi8qKlxuICogRnVuY3Rpb24gdGhhdCBpcyBleGVjdXRlZCB3aGVuZXZlciBhIHZhcmlhYmxlIGlzIHJlZmVyZW5jZWQuIEl0IGFsbG93cyBmb3IgdGhlIHZhcmlhYmxlIHRvIGJlXG4gKiByZW5hbWVkIGRlcGVuZGluZyBvbiBpdHMgbG9jYXRpb24uXG4gKi9cbnR5cGUgTG9jYWxWYXJSZWZDYWxsYmFjayA9IChzY29wZTogQmluZGluZ1Njb3BlLCByZXRyaWV2YWxMZXZlbDogbnVtYmVyKSA9PiBvLkV4cHJlc3Npb247XG5cbi8qKiBUaGUgcHJlZml4IHVzZWQgdG8gZ2V0IGEgc2hhcmVkIGNvbnRleHQgaW4gQmluZGluZ1Njb3BlJ3MgbWFwLiAqL1xuY29uc3QgU0hBUkVEX0NPTlRFWFRfS0VZID0gJyQkc2hhcmVkX2N0eCQkJztcblxuLyoqXG4gKiBUaGlzIGlzIHVzZWQgd2hlbiBvbmUgcmVmZXJzIHRvIHZhcmlhYmxlIHN1Y2ggYXM6ICdsZXQgYWJjID0gbmV4dENvbnRleHQoMikuJGltcGxpY2l0YC5cbiAqIC0ga2V5IHRvIHRoZSBtYXAgaXMgdGhlIHN0cmluZyBsaXRlcmFsIGBcImFiY1wiYC5cbiAqIC0gdmFsdWUgYHJldHJpZXZhbExldmVsYCBpcyB0aGUgbGV2ZWwgZnJvbSB3aGljaCB0aGlzIHZhbHVlIGNhbiBiZSByZXRyaWV2ZWQsIHdoaWNoIGlzIDIgbGV2ZWxzXG4gKiB1cCBpbiBleGFtcGxlLlxuICogLSB2YWx1ZSBgbGhzYCBpcyB0aGUgbGVmdCBoYW5kIHNpZGUgd2hpY2ggaXMgYW4gQVNUIHJlcHJlc2VudGluZyBgYWJjYC5cbiAqIC0gdmFsdWUgYGRlY2xhcmVMb2NhbENhbGxiYWNrYCBpcyBhIGNhbGxiYWNrIHRoYXQgaXMgaW52b2tlZCB3aGVuIGRlY2xhcmluZyB0aGUgbG9jYWwuXG4gKiAtIHZhbHVlIGBkZWNsYXJlYCBpcyB0cnVlIGlmIHRoaXMgdmFsdWUgbmVlZHMgdG8gYmUgZGVjbGFyZWQuXG4gKiAtIHZhbHVlIGBsb2NhbFJlZmAgaXMgdHJ1ZSBpZiB3ZSBhcmUgc3RvcmluZyBhIGxvY2FsIHJlZmVyZW5jZVxuICogLSB2YWx1ZSBgcHJpb3JpdHlgIGRpY3RhdGVzIHRoZSBzb3J0aW5nIHByaW9yaXR5IG9mIHRoaXMgdmFyIGRlY2xhcmF0aW9uIGNvbXBhcmVkXG4gKiB0byBvdGhlciB2YXIgZGVjbGFyYXRpb25zIG9uIHRoZSBzYW1lIHJldHJpZXZhbCBsZXZlbC4gRm9yIGV4YW1wbGUsIGlmIHRoZXJlIGlzIGFcbiAqIGNvbnRleHQgdmFyaWFibGUgYW5kIGEgbG9jYWwgcmVmIGFjY2Vzc2luZyB0aGUgc2FtZSBwYXJlbnQgdmlldywgdGhlIGNvbnRleHQgdmFyXG4gKiBkZWNsYXJhdGlvbiBzaG91bGQgYWx3YXlzIGNvbWUgYmVmb3JlIHRoZSBsb2NhbCByZWYgZGVjbGFyYXRpb24uXG4gKi9cbnR5cGUgQmluZGluZ0RhdGEgPSB7XG4gIHJldHJpZXZhbExldmVsOiBudW1iZXI7IGxoczogby5FeHByZXNzaW9uIHwgTG9jYWxWYXJSZWZDYWxsYmFjaztcbiAgZGVjbGFyZUxvY2FsQ2FsbGJhY2s/OiBEZWNsYXJlTG9jYWxWYXJDYWxsYmFjazsgZGVjbGFyZTogYm9vbGVhbjsgcHJpb3JpdHk6IG51bWJlcjtcbn07XG5cbi8qKlxuICogVGhlIHNvcnRpbmcgcHJpb3JpdHkgb2YgYSBsb2NhbCB2YXJpYWJsZSBkZWNsYXJhdGlvbi4gSGlnaGVyIG51bWJlcnNcbiAqIG1lYW4gdGhlIGRlY2xhcmF0aW9uIHdpbGwgYXBwZWFyIGZpcnN0IGluIHRoZSBnZW5lcmF0ZWQgY29kZS5cbiAqL1xuY29uc3QgZW51bSBEZWNsYXJhdGlvblByaW9yaXR5IHtcbiAgREVGQVVMVCA9IDAsXG4gIENPTlRFWFQgPSAxLFxuICBTSEFSRURfQ09OVEVYVCA9IDJcbn1cblxuZXhwb3J0IGNsYXNzIEJpbmRpbmdTY29wZSBpbXBsZW1lbnRzIExvY2FsUmVzb2x2ZXIge1xuICAvKiogS2VlcHMgYSBtYXAgZnJvbSBsb2NhbCB2YXJpYWJsZXMgdG8gdGhlaXIgQmluZGluZ0RhdGEuICovXG4gIHByaXZhdGUgbWFwID0gbmV3IE1hcDxzdHJpbmcsIEJpbmRpbmdEYXRhPigpO1xuICBwcml2YXRlIHJlZmVyZW5jZU5hbWVJbmRleCA9IDA7XG4gIHByaXZhdGUgcmVzdG9yZVZpZXdWYXJpYWJsZTogby5SZWFkVmFyRXhwcnxudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSB1c2VzUmVzdG9yZWRWaWV3Q29udGV4dCA9IGZhbHNlO1xuICBzdGF0aWMgY3JlYXRlUm9vdFNjb3BlKCk6IEJpbmRpbmdTY29wZSB7XG4gICAgcmV0dXJuIG5ldyBCaW5kaW5nU2NvcGUoKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyBiaW5kaW5nTGV2ZWw6IG51bWJlciA9IDAsIHJlYWRvbmx5IHBhcmVudDogQmluZGluZ1Njb3BlfG51bGwgPSBudWxsLFxuICAgICAgcHVibGljIGdsb2JhbHM/OiBTZXQ8c3RyaW5nPikge1xuICAgIGlmIChnbG9iYWxzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGZvciAoY29uc3QgbmFtZSBvZiBnbG9iYWxzKSB7XG4gICAgICAgIHRoaXMuc2V0KDAsIG5hbWUsIG8udmFyaWFibGUobmFtZSkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGdldChuYW1lOiBzdHJpbmcpOiBvLkV4cHJlc3Npb258bnVsbCB7XG4gICAgbGV0IGN1cnJlbnQ6IEJpbmRpbmdTY29wZXxudWxsID0gdGhpcztcbiAgICB3aGlsZSAoY3VycmVudCkge1xuICAgICAgbGV0IHZhbHVlID0gY3VycmVudC5tYXAuZ2V0KG5hbWUpO1xuICAgICAgaWYgKHZhbHVlICE9IG51bGwpIHtcbiAgICAgICAgaWYgKGN1cnJlbnQgIT09IHRoaXMpIHtcbiAgICAgICAgICAvLyBtYWtlIGEgbG9jYWwgY29weSBhbmQgcmVzZXQgdGhlIGBkZWNsYXJlYCBzdGF0ZVxuICAgICAgICAgIHZhbHVlID0ge1xuICAgICAgICAgICAgcmV0cmlldmFsTGV2ZWw6IHZhbHVlLnJldHJpZXZhbExldmVsLFxuICAgICAgICAgICAgbGhzOiB2YWx1ZS5saHMsXG4gICAgICAgICAgICBkZWNsYXJlTG9jYWxDYWxsYmFjazogdmFsdWUuZGVjbGFyZUxvY2FsQ2FsbGJhY2ssXG4gICAgICAgICAgICBkZWNsYXJlOiBmYWxzZSxcbiAgICAgICAgICAgIHByaW9yaXR5OiB2YWx1ZS5wcmlvcml0eVxuICAgICAgICAgIH07XG5cbiAgICAgICAgICAvLyBDYWNoZSB0aGUgdmFsdWUgbG9jYWxseS5cbiAgICAgICAgICB0aGlzLm1hcC5zZXQobmFtZSwgdmFsdWUpO1xuICAgICAgICAgIC8vIFBvc3NpYmx5IGdlbmVyYXRlIGEgc2hhcmVkIGNvbnRleHQgdmFyXG4gICAgICAgICAgdGhpcy5tYXliZUdlbmVyYXRlU2hhcmVkQ29udGV4dFZhcih2YWx1ZSk7XG4gICAgICAgICAgdGhpcy5tYXliZVJlc3RvcmVWaWV3KCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodmFsdWUuZGVjbGFyZUxvY2FsQ2FsbGJhY2sgJiYgIXZhbHVlLmRlY2xhcmUpIHtcbiAgICAgICAgICB2YWx1ZS5kZWNsYXJlID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHlwZW9mIHZhbHVlLmxocyA9PT0gJ2Z1bmN0aW9uJyA/IHZhbHVlLmxocyh0aGlzLCB2YWx1ZS5yZXRyaWV2YWxMZXZlbCkgOiB2YWx1ZS5saHM7XG4gICAgICB9XG4gICAgICBjdXJyZW50ID0gY3VycmVudC5wYXJlbnQ7XG4gICAgfVxuXG4gICAgLy8gSWYgd2UgZ2V0IHRvIHRoaXMgcG9pbnQsIHdlIGFyZSBsb29raW5nIGZvciBhIHByb3BlcnR5IG9uIHRoZSB0b3AgbGV2ZWwgY29tcG9uZW50XG4gICAgLy8gLSBJZiBsZXZlbCA9PT0gMCwgd2UgYXJlIG9uIHRoZSB0b3AgYW5kIGRvbid0IG5lZWQgdG8gcmUtZGVjbGFyZSBgY3R4YC5cbiAgICAvLyAtIElmIGxldmVsID4gMCwgd2UgYXJlIGluIGFuIGVtYmVkZGVkIHZpZXcuIFdlIG5lZWQgdG8gcmV0cmlldmUgdGhlIG5hbWUgb2YgdGhlXG4gICAgLy8gbG9jYWwgdmFyIHdlIHVzZWQgdG8gc3RvcmUgdGhlIGNvbXBvbmVudCBjb250ZXh0LCBlLmcuIGNvbnN0ICRjb21wJCA9IHgoKTtcbiAgICByZXR1cm4gdGhpcy5iaW5kaW5nTGV2ZWwgPT09IDAgPyBudWxsIDogdGhpcy5nZXRDb21wb25lbnRQcm9wZXJ0eShuYW1lKTtcbiAgfVxuXG4gIC8qKiBDaGVja3Mgd2hldGhlciBhIHZhcmlhYmxlIGV4aXN0cyBsb2NhbGx5IG9uIHRoZSBjdXJyZW50IHNjb3BlLiAqL1xuICBoYXNMb2NhbChuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5tYXAuaGFzKG5hbWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIGxvY2FsIHZhcmlhYmxlIGZvciBsYXRlciByZWZlcmVuY2UuXG4gICAqXG4gICAqIEBwYXJhbSByZXRyaWV2YWxMZXZlbCBUaGUgbGV2ZWwgZnJvbSB3aGljaCB0aGlzIHZhbHVlIGNhbiBiZSByZXRyaWV2ZWRcbiAgICogQHBhcmFtIG5hbWUgTmFtZSBvZiB0aGUgdmFyaWFibGUuXG4gICAqIEBwYXJhbSBsaHMgQVNUIHJlcHJlc2VudGluZyB0aGUgbGVmdCBoYW5kIHNpZGUgb2YgdGhlIGBsZXQgbGhzID0gcmhzO2AuXG4gICAqIEBwYXJhbSBwcmlvcml0eSBUaGUgc29ydGluZyBwcmlvcml0eSBvZiB0aGlzIHZhclxuICAgKiBAcGFyYW0gZGVjbGFyZUxvY2FsQ2FsbGJhY2sgVGhlIGNhbGxiYWNrIHRvIGludm9rZSB3aGVuIGRlY2xhcmluZyB0aGlzIGxvY2FsIHZhclxuICAgKiBAcGFyYW0gbG9jYWxSZWYgV2hldGhlciBvciBub3QgdGhpcyBpcyBhIGxvY2FsIHJlZlxuICAgKi9cbiAgc2V0KHJldHJpZXZhbExldmVsOiBudW1iZXIsIG5hbWU6IHN0cmluZywgbGhzOiBvLkV4cHJlc3Npb258TG9jYWxWYXJSZWZDYWxsYmFjayxcbiAgICAgIHByaW9yaXR5OiBudW1iZXIgPSBEZWNsYXJhdGlvblByaW9yaXR5LkRFRkFVTFQsXG4gICAgICBkZWNsYXJlTG9jYWxDYWxsYmFjaz86IERlY2xhcmVMb2NhbFZhckNhbGxiYWNrLCBsb2NhbFJlZj86IHRydWUpOiBCaW5kaW5nU2NvcGUge1xuICAgIGlmICh0aGlzLm1hcC5oYXMobmFtZSkpIHtcbiAgICAgIGlmIChsb2NhbFJlZikge1xuICAgICAgICAvLyBEbyBub3QgdGhyb3cgYW4gZXJyb3IgaWYgaXQncyBhIGxvY2FsIHJlZiBhbmQgZG8gbm90IHVwZGF0ZSBleGlzdGluZyB2YWx1ZSxcbiAgICAgICAgLy8gc28gdGhlIGZpcnN0IGRlZmluZWQgcmVmIGlzIGFsd2F5cyByZXR1cm5lZC5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgICBlcnJvcihgVGhlIG5hbWUgJHtuYW1lfSBpcyBhbHJlYWR5IGRlZmluZWQgaW4gc2NvcGUgdG8gYmUgJHt0aGlzLm1hcC5nZXQobmFtZSl9YCk7XG4gICAgfVxuICAgIHRoaXMubWFwLnNldChuYW1lLCB7XG4gICAgICByZXRyaWV2YWxMZXZlbDogcmV0cmlldmFsTGV2ZWwsXG4gICAgICBsaHM6IGxocyxcbiAgICAgIGRlY2xhcmU6IGZhbHNlLFxuICAgICAgZGVjbGFyZUxvY2FsQ2FsbGJhY2s6IGRlY2xhcmVMb2NhbENhbGxiYWNrLFxuICAgICAgcHJpb3JpdHk6IHByaW9yaXR5LFxuICAgIH0pO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gSW1wbGVtZW50ZWQgYXMgcGFydCBvZiBMb2NhbFJlc29sdmVyLlxuICBnZXRMb2NhbChuYW1lOiBzdHJpbmcpOiAoby5FeHByZXNzaW9ufG51bGwpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQobmFtZSk7XG4gIH1cblxuICAvLyBJbXBsZW1lbnRlZCBhcyBwYXJ0IG9mIExvY2FsUmVzb2x2ZXIuXG4gIG5vdGlmeUltcGxpY2l0UmVjZWl2ZXJVc2UoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuYmluZGluZ0xldmVsICE9PSAwKSB7XG4gICAgICAvLyBTaW5jZSB0aGUgaW1wbGljaXQgcmVjZWl2ZXIgaXMgYWNjZXNzZWQgaW4gYW4gZW1iZWRkZWQgdmlldywgd2UgbmVlZCB0b1xuICAgICAgLy8gZW5zdXJlIHRoYXQgd2UgZGVjbGFyZSBhIHNoYXJlZCBjb250ZXh0IHZhcmlhYmxlIGZvciB0aGUgY3VycmVudCB0ZW1wbGF0ZVxuICAgICAgLy8gaW4gdGhlIHVwZGF0ZSB2YXJpYWJsZXMuXG4gICAgICB0aGlzLm1hcC5nZXQoU0hBUkVEX0NPTlRFWFRfS0VZICsgMCkhLmRlY2xhcmUgPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIG5lc3RlZFNjb3BlKGxldmVsOiBudW1iZXIsIGdsb2JhbHM/OiBTZXQ8c3RyaW5nPik6IEJpbmRpbmdTY29wZSB7XG4gICAgY29uc3QgbmV3U2NvcGUgPSBuZXcgQmluZGluZ1Njb3BlKGxldmVsLCB0aGlzLCBnbG9iYWxzKTtcbiAgICBpZiAobGV2ZWwgPiAwKSBuZXdTY29wZS5nZW5lcmF0ZVNoYXJlZENvbnRleHRWYXIoMCk7XG4gICAgcmV0dXJuIG5ld1Njb3BlO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgb3IgY3JlYXRlcyBhIHNoYXJlZCBjb250ZXh0IHZhcmlhYmxlIGFuZCByZXR1cm5zIGl0cyBleHByZXNzaW9uLiBOb3RlIHRoYXRcbiAgICogdGhpcyBkb2VzIG5vdCBtZWFuIHRoYXQgdGhlIHNoYXJlZCB2YXJpYWJsZSB3aWxsIGJlIGRlY2xhcmVkLiBWYXJpYWJsZXMgaW4gdGhlXG4gICAqIGJpbmRpbmcgc2NvcGUgd2lsbCBiZSBvbmx5IGRlY2xhcmVkIGlmIHRoZXkgYXJlIHVzZWQuXG4gICAqL1xuICBnZXRPckNyZWF0ZVNoYXJlZENvbnRleHRWYXIocmV0cmlldmFsTGV2ZWw6IG51bWJlcik6IG8uUmVhZFZhckV4cHIge1xuICAgIGNvbnN0IGJpbmRpbmdLZXkgPSBTSEFSRURfQ09OVEVYVF9LRVkgKyByZXRyaWV2YWxMZXZlbDtcbiAgICBpZiAoIXRoaXMubWFwLmhhcyhiaW5kaW5nS2V5KSkge1xuICAgICAgdGhpcy5nZW5lcmF0ZVNoYXJlZENvbnRleHRWYXIocmV0cmlldmFsTGV2ZWwpO1xuICAgIH1cbiAgICAvLyBTaGFyZWQgY29udGV4dCB2YXJpYWJsZXMgYXJlIGFsd2F5cyBnZW5lcmF0ZWQgYXMgXCJSZWFkVmFyRXhwclwiLlxuICAgIHJldHVybiB0aGlzLm1hcC5nZXQoYmluZGluZ0tleSkhLmxocyBhcyBvLlJlYWRWYXJFeHByO1xuICB9XG5cbiAgZ2V0U2hhcmVkQ29udGV4dE5hbWUocmV0cmlldmFsTGV2ZWw6IG51bWJlcik6IG8uUmVhZFZhckV4cHJ8bnVsbCB7XG4gICAgY29uc3Qgc2hhcmVkQ3R4T2JqID0gdGhpcy5tYXAuZ2V0KFNIQVJFRF9DT05URVhUX0tFWSArIHJldHJpZXZhbExldmVsKTtcbiAgICAvLyBTaGFyZWQgY29udGV4dCB2YXJpYWJsZXMgYXJlIGFsd2F5cyBnZW5lcmF0ZWQgYXMgXCJSZWFkVmFyRXhwclwiLlxuICAgIHJldHVybiBzaGFyZWRDdHhPYmogJiYgc2hhcmVkQ3R4T2JqLmRlY2xhcmUgPyBzaGFyZWRDdHhPYmoubGhzIGFzIG8uUmVhZFZhckV4cHIgOiBudWxsO1xuICB9XG5cbiAgbWF5YmVHZW5lcmF0ZVNoYXJlZENvbnRleHRWYXIodmFsdWU6IEJpbmRpbmdEYXRhKSB7XG4gICAgaWYgKHZhbHVlLnByaW9yaXR5ID09PSBEZWNsYXJhdGlvblByaW9yaXR5LkNPTlRFWFQgJiZcbiAgICAgICAgdmFsdWUucmV0cmlldmFsTGV2ZWwgPCB0aGlzLmJpbmRpbmdMZXZlbCkge1xuICAgICAgY29uc3Qgc2hhcmVkQ3R4T2JqID0gdGhpcy5tYXAuZ2V0KFNIQVJFRF9DT05URVhUX0tFWSArIHZhbHVlLnJldHJpZXZhbExldmVsKTtcbiAgICAgIGlmIChzaGFyZWRDdHhPYmopIHtcbiAgICAgICAgc2hhcmVkQ3R4T2JqLmRlY2xhcmUgPSB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5nZW5lcmF0ZVNoYXJlZENvbnRleHRWYXIodmFsdWUucmV0cmlldmFsTGV2ZWwpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGdlbmVyYXRlU2hhcmVkQ29udGV4dFZhcihyZXRyaWV2YWxMZXZlbDogbnVtYmVyKSB7XG4gICAgY29uc3QgbGhzID0gby52YXJpYWJsZShDT05URVhUX05BTUUgKyB0aGlzLmZyZXNoUmVmZXJlbmNlTmFtZSgpKTtcbiAgICB0aGlzLm1hcC5zZXQoU0hBUkVEX0NPTlRFWFRfS0VZICsgcmV0cmlldmFsTGV2ZWwsIHtcbiAgICAgIHJldHJpZXZhbExldmVsOiByZXRyaWV2YWxMZXZlbCxcbiAgICAgIGxoczogbGhzLFxuICAgICAgZGVjbGFyZUxvY2FsQ2FsbGJhY2s6IChzY29wZTogQmluZGluZ1Njb3BlLCByZWxhdGl2ZUxldmVsOiBudW1iZXIpID0+IHtcbiAgICAgICAgLy8gY29uc3QgY3R4X3IwID0gbmV4dENvbnRleHQoMik7XG4gICAgICAgIHJldHVybiBbbGhzLnNldChnZW5lcmF0ZU5leHRDb250ZXh0RXhwcihyZWxhdGl2ZUxldmVsKSkudG9Db25zdERlY2woKV07XG4gICAgICB9LFxuICAgICAgZGVjbGFyZTogZmFsc2UsXG4gICAgICBwcmlvcml0eTogRGVjbGFyYXRpb25Qcmlvcml0eS5TSEFSRURfQ09OVEVYVCxcbiAgICB9KTtcbiAgfVxuXG4gIGdldENvbXBvbmVudFByb3BlcnR5KG5hbWU6IHN0cmluZyk6IG8uRXhwcmVzc2lvbiB7XG4gICAgY29uc3QgY29tcG9uZW50VmFsdWUgPSB0aGlzLm1hcC5nZXQoU0hBUkVEX0NPTlRFWFRfS0VZICsgMCkhO1xuICAgIGNvbXBvbmVudFZhbHVlLmRlY2xhcmUgPSB0cnVlO1xuICAgIHRoaXMubWF5YmVSZXN0b3JlVmlldygpO1xuICAgIGNvbnN0IGxocyA9IHR5cGVvZiBjb21wb25lbnRWYWx1ZS5saHMgPT09ICdmdW5jdGlvbicgP1xuICAgICAgICBjb21wb25lbnRWYWx1ZS5saHModGhpcywgY29tcG9uZW50VmFsdWUucmV0cmlldmFsTGV2ZWwpIDpcbiAgICAgICAgY29tcG9uZW50VmFsdWUubGhzO1xuICAgIHJldHVybiBuYW1lID09PSBESVJFQ1RfQ09OVEVYVF9SRUZFUkVOQ0UgPyBsaHMgOiBsaHMucHJvcChuYW1lKTtcbiAgfVxuXG4gIG1heWJlUmVzdG9yZVZpZXcoKSB7XG4gICAgLy8gVmlldyByZXN0b3JhdGlvbiBpcyByZXF1aXJlZCBmb3IgbGlzdGVuZXIgaW5zdHJ1Y3Rpb25zIGluc2lkZSBlbWJlZGRlZCB2aWV3cywgYmVjYXVzZVxuICAgIC8vIHRoZXkgb25seSBydW4gaW4gY3JlYXRpb24gbW9kZSBhbmQgdGhleSBjYW4gaGF2ZSByZWZlcmVuY2VzIHRvIHRoZSBjb250ZXh0IG9iamVjdC5cbiAgICAvLyBJZiB0aGUgY29udGV4dCBvYmplY3QgY2hhbmdlcyBpbiB1cGRhdGUgbW9kZSwgdGhlIHJlZmVyZW5jZSB3aWxsIGJlIGluY29ycmVjdCwgYmVjYXVzZVxuICAgIC8vIGl0IHdhcyBlc3RhYmxpc2hlZCBkdXJpbmcgY3JlYXRpb24uXG4gICAgaWYgKHRoaXMuaXNMaXN0ZW5lclNjb3BlKCkpIHtcbiAgICAgIGlmICghdGhpcy5wYXJlbnQhLnJlc3RvcmVWaWV3VmFyaWFibGUpIHtcbiAgICAgICAgLy8gcGFyZW50IHNhdmVzIHZhcmlhYmxlIHRvIGdlbmVyYXRlIGEgc2hhcmVkIGBjb25zdCAkcyQgPSBnZXRDdXJyZW50VmlldygpO2AgaW5zdHJ1Y3Rpb25cbiAgICAgICAgdGhpcy5wYXJlbnQhLnJlc3RvcmVWaWV3VmFyaWFibGUgPSBvLnZhcmlhYmxlKHRoaXMucGFyZW50IS5mcmVzaFJlZmVyZW5jZU5hbWUoKSk7XG4gICAgICB9XG4gICAgICB0aGlzLnJlc3RvcmVWaWV3VmFyaWFibGUgPSB0aGlzLnBhcmVudCEucmVzdG9yZVZpZXdWYXJpYWJsZTtcbiAgICB9XG4gIH1cblxuICByZXN0b3JlVmlld1N0YXRlbWVudCgpOiBvLlN0YXRlbWVudHxudWxsIHtcbiAgICBpZiAodGhpcy5yZXN0b3JlVmlld1ZhcmlhYmxlKSB7XG4gICAgICBjb25zdCByZXN0b3JlQ2FsbCA9IGludm9rZUluc3RydWN0aW9uKG51bGwsIFIzLnJlc3RvcmVWaWV3LCBbdGhpcy5yZXN0b3JlVmlld1ZhcmlhYmxlXSk7XG4gICAgICAvLyBFaXRoZXIgYGNvbnN0IHJlc3RvcmVkQ3R4ID0gcmVzdG9yZVZpZXcoJHN0YXRlJCk7YCBvciBgcmVzdG9yZVZpZXcoJHN0YXRlJCk7YFxuICAgICAgLy8gZGVwZW5kaW5nIG9uIHdoZXRoZXIgaXQgaXMgYmVpbmcgdXNlZC5cbiAgICAgIHJldHVybiB0aGlzLnVzZXNSZXN0b3JlZFZpZXdDb250ZXh0ID9cbiAgICAgICAgICBvLnZhcmlhYmxlKFJFU1RPUkVEX1ZJRVdfQ09OVEVYVF9OQU1FKS5zZXQocmVzdG9yZUNhbGwpLnRvQ29uc3REZWNsKCkgOlxuICAgICAgICAgIHJlc3RvcmVDYWxsLnRvU3RtdCgpO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHZpZXdTbmFwc2hvdFN0YXRlbWVudHMoKTogby5TdGF0ZW1lbnRbXSB7XG4gICAgLy8gY29uc3QgJHN0YXRlJCA9IGdldEN1cnJlbnRWaWV3KCk7XG4gICAgcmV0dXJuIHRoaXMucmVzdG9yZVZpZXdWYXJpYWJsZSA/XG4gICAgICAgIFtcbiAgICAgICAgICB0aGlzLnJlc3RvcmVWaWV3VmFyaWFibGUuc2V0KGludm9rZUluc3RydWN0aW9uKG51bGwsIFIzLmdldEN1cnJlbnRWaWV3LCBbXSkpLnRvQ29uc3REZWNsKClcbiAgICAgICAgXSA6XG4gICAgICAgIFtdO1xuICB9XG5cbiAgaXNMaXN0ZW5lclNjb3BlKCkge1xuICAgIHJldHVybiB0aGlzLnBhcmVudCAmJiB0aGlzLnBhcmVudC5iaW5kaW5nTGV2ZWwgPT09IHRoaXMuYmluZGluZ0xldmVsO1xuICB9XG5cbiAgdmFyaWFibGVEZWNsYXJhdGlvbnMoKTogby5TdGF0ZW1lbnRbXSB7XG4gICAgbGV0IGN1cnJlbnRDb250ZXh0TGV2ZWwgPSAwO1xuICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMubWFwLnZhbHVlcygpKVxuICAgICAgICAgICAgICAgLmZpbHRlcih2YWx1ZSA9PiB2YWx1ZS5kZWNsYXJlKVxuICAgICAgICAgICAgICAgLnNvcnQoKGEsIGIpID0+IGIucmV0cmlldmFsTGV2ZWwgLSBhLnJldHJpZXZhbExldmVsIHx8IGIucHJpb3JpdHkgLSBhLnByaW9yaXR5KVxuICAgICAgICAgICAgICAgLnJlZHVjZSgoc3RtdHM6IG8uU3RhdGVtZW50W10sIHZhbHVlOiBCaW5kaW5nRGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgICBjb25zdCBsZXZlbERpZmYgPSB0aGlzLmJpbmRpbmdMZXZlbCAtIHZhbHVlLnJldHJpZXZhbExldmVsO1xuICAgICAgICAgICAgICAgICBjb25zdCBjdXJyU3RtdHMgPVxuICAgICAgICAgICAgICAgICAgICAgdmFsdWUuZGVjbGFyZUxvY2FsQ2FsbGJhY2shKHRoaXMsIGxldmVsRGlmZiAtIGN1cnJlbnRDb250ZXh0TGV2ZWwpO1xuICAgICAgICAgICAgICAgICBjdXJyZW50Q29udGV4dExldmVsID0gbGV2ZWxEaWZmO1xuICAgICAgICAgICAgICAgICByZXR1cm4gc3RtdHMuY29uY2F0KGN1cnJTdG10cyk7XG4gICAgICAgICAgICAgICB9LCBbXSkgYXMgby5TdGF0ZW1lbnRbXTtcbiAgfVxuXG5cbiAgZnJlc2hSZWZlcmVuY2VOYW1lKCk6IHN0cmluZyB7XG4gICAgbGV0IGN1cnJlbnQ6IEJpbmRpbmdTY29wZSA9IHRoaXM7XG4gICAgLy8gRmluZCB0aGUgdG9wIHNjb3BlIGFzIGl0IG1haW50YWlucyB0aGUgZ2xvYmFsIHJlZmVyZW5jZSBjb3VudFxuICAgIHdoaWxlIChjdXJyZW50LnBhcmVudCkgY3VycmVudCA9IGN1cnJlbnQucGFyZW50O1xuICAgIGNvbnN0IHJlZiA9IGAke1JFRkVSRU5DRV9QUkVGSVh9JHtjdXJyZW50LnJlZmVyZW5jZU5hbWVJbmRleCsrfWA7XG4gICAgcmV0dXJuIHJlZjtcbiAgfVxuXG4gIGhhc1Jlc3RvcmVWaWV3VmFyaWFibGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICEhdGhpcy5yZXN0b3JlVmlld1ZhcmlhYmxlO1xuICB9XG5cbiAgbm90aWZ5UmVzdG9yZWRWaWV3Q29udGV4dFVzZSgpOiB2b2lkIHtcbiAgICB0aGlzLnVzZXNSZXN0b3JlZFZpZXdDb250ZXh0ID0gdHJ1ZTtcbiAgfVxufVxuXG4vKiogQmluZGluZyBzY29wZSBvZiBhIGB0cmFja2AgZnVuY3Rpb24gaW5zaWRlIGEgYGZvcmAgbG9vcCBibG9jay4gKi9cbmNsYXNzIFRyYWNrQnlCaW5kaW5nU2NvcGUgZXh0ZW5kcyBCaW5kaW5nU2NvcGUge1xuICBwcml2YXRlIGNvbXBvbmVudEFjY2Vzc0NvdW50ID0gMDtcblxuICBjb25zdHJ1Y3RvcihwYXJlbnRTY29wZTogQmluZGluZ1Njb3BlLCBwcml2YXRlIGdsb2JhbE92ZXJyaWRlczogUmVjb3JkPHN0cmluZywgc3RyaW5nPikge1xuICAgIHN1cGVyKHBhcmVudFNjb3BlLmJpbmRpbmdMZXZlbCArIDEsIHBhcmVudFNjb3BlKTtcbiAgfVxuXG4gIG92ZXJyaWRlIGdldChuYW1lOiBzdHJpbmcpOiBvLkV4cHJlc3Npb258bnVsbCB7XG4gICAgLy8gSW50ZXJjZXB0IGFueSBvdmVycmlkZGVuIGdsb2JhbHMuXG4gICAgaWYgKHRoaXMuZ2xvYmFsT3ZlcnJpZGVzLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICByZXR1cm4gby52YXJpYWJsZSh0aGlzLmdsb2JhbE92ZXJyaWRlc1tuYW1lXSk7XG4gICAgfVxuXG4gICAgbGV0IGN1cnJlbnQ6IEJpbmRpbmdTY29wZXxudWxsID0gdGhpcy5wYXJlbnQ7XG5cbiAgICAvLyBQcmV2ZW50IGFjY2Vzc2VzIG9mIHRlbXBsYXRlIHZhcmlhYmxlcyBvdXRzaWRlIHRoZSBgZm9yYCBsb29wLlxuICAgIHdoaWxlIChjdXJyZW50KSB7XG4gICAgICBpZiAoY3VycmVudC5oYXNMb2NhbChuYW1lKSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIGN1cnJlbnQgPSBjdXJyZW50LnBhcmVudDtcbiAgICB9XG5cbiAgICAvLyBXaGVuIHRoZSBjb21wb25lbnQgc2NvcGUgaXMgYWNjZXNzZWQsIHdlIHJlZGlyZWN0IGl0IHRocm91Z2ggYHRoaXNgLlxuICAgIHRoaXMuY29tcG9uZW50QWNjZXNzQ291bnQrKztcbiAgICByZXR1cm4gby52YXJpYWJsZSgndGhpcycpLnByb3AobmFtZSk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgbnVtYmVyIG9mIHRpbWVzIHRoZSBob3N0IGNvbXBvbmVudCBoYXMgYmVlbiBhY2Nlc3NlZCB0aHJvdWdoIHRoZSBzY29wZS4gKi9cbiAgZ2V0Q29tcG9uZW50QWNjZXNzQ291bnQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5jb21wb25lbnRBY2Nlc3NDb3VudDtcbiAgfVxufVxuXG4vKipcbiAqIENyZWF0ZXMgYW4gYXJyYXkgb2YgZXhwcmVzc2lvbnMgb3V0IG9mIGFuIGBuZ1Byb2plY3RBc2AgYXR0cmlidXRlc1xuICogd2hpY2ggY2FuIGJlIGFkZGVkIHRvIHRoZSBpbnN0cnVjdGlvbiBwYXJhbWV0ZXJzLlxuICovXG5mdW5jdGlvbiBnZXROZ1Byb2plY3RBc0xpdGVyYWwoYXR0cmlidXRlOiB0LlRleHRBdHRyaWJ1dGUpOiBvLkV4cHJlc3Npb25bXSB7XG4gIC8vIFBhcnNlIHRoZSBhdHRyaWJ1dGUgdmFsdWUgaW50byBhIENzc1NlbGVjdG9yTGlzdC4gTm90ZSB0aGF0IHdlIG9ubHkgdGFrZSB0aGVcbiAgLy8gZmlyc3Qgc2VsZWN0b3IsIGJlY2F1c2Ugd2UgZG9uJ3Qgc3VwcG9ydCBtdWx0aXBsZSBzZWxlY3RvcnMgaW4gbmdQcm9qZWN0QXMuXG4gIGNvbnN0IHBhcnNlZFIzU2VsZWN0b3IgPSBjb3JlLnBhcnNlU2VsZWN0b3JUb1IzU2VsZWN0b3IoYXR0cmlidXRlLnZhbHVlKVswXTtcbiAgcmV0dXJuIFtvLmxpdGVyYWwoY29yZS5BdHRyaWJ1dGVNYXJrZXIuUHJvamVjdEFzKSwgYXNMaXRlcmFsKHBhcnNlZFIzU2VsZWN0b3IpXTtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBpbnN0cnVjdGlvbiB0byBnZW5lcmF0ZSBmb3IgYW4gaW50ZXJwb2xhdGVkIHByb3BlcnR5XG4gKiBAcGFyYW0gaW50ZXJwb2xhdGlvbiBBbiBJbnRlcnBvbGF0aW9uIEFTVFxuICovXG5mdW5jdGlvbiBnZXRQcm9wZXJ0eUludGVycG9sYXRpb25FeHByZXNzaW9uKGludGVycG9sYXRpb246IEludGVycG9sYXRpb24pIHtcbiAgc3dpdGNoIChnZXRJbnRlcnBvbGF0aW9uQXJnc0xlbmd0aChpbnRlcnBvbGF0aW9uKSkge1xuICAgIGNhc2UgMTpcbiAgICAgIHJldHVybiBSMy5wcm9wZXJ0eUludGVycG9sYXRlO1xuICAgIGNhc2UgMzpcbiAgICAgIHJldHVybiBSMy5wcm9wZXJ0eUludGVycG9sYXRlMTtcbiAgICBjYXNlIDU6XG4gICAgICByZXR1cm4gUjMucHJvcGVydHlJbnRlcnBvbGF0ZTI7XG4gICAgY2FzZSA3OlxuICAgICAgcmV0dXJuIFIzLnByb3BlcnR5SW50ZXJwb2xhdGUzO1xuICAgIGNhc2UgOTpcbiAgICAgIHJldHVybiBSMy5wcm9wZXJ0eUludGVycG9sYXRlNDtcbiAgICBjYXNlIDExOlxuICAgICAgcmV0dXJuIFIzLnByb3BlcnR5SW50ZXJwb2xhdGU1O1xuICAgIGNhc2UgMTM6XG4gICAgICByZXR1cm4gUjMucHJvcGVydHlJbnRlcnBvbGF0ZTY7XG4gICAgY2FzZSAxNTpcbiAgICAgIHJldHVybiBSMy5wcm9wZXJ0eUludGVycG9sYXRlNztcbiAgICBjYXNlIDE3OlxuICAgICAgcmV0dXJuIFIzLnByb3BlcnR5SW50ZXJwb2xhdGU4O1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gUjMucHJvcGVydHlJbnRlcnBvbGF0ZVY7XG4gIH1cbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBpbnN0cnVjdGlvbiB0byBnZW5lcmF0ZSBmb3IgYW4gaW50ZXJwb2xhdGVkIGF0dHJpYnV0ZVxuICogQHBhcmFtIGludGVycG9sYXRpb24gQW4gSW50ZXJwb2xhdGlvbiBBU1RcbiAqL1xuZnVuY3Rpb24gZ2V0QXR0cmlidXRlSW50ZXJwb2xhdGlvbkV4cHJlc3Npb24oaW50ZXJwb2xhdGlvbjogSW50ZXJwb2xhdGlvbikge1xuICBzd2l0Y2ggKGdldEludGVycG9sYXRpb25BcmdzTGVuZ3RoKGludGVycG9sYXRpb24pKSB7XG4gICAgY2FzZSAzOlxuICAgICAgcmV0dXJuIFIzLmF0dHJpYnV0ZUludGVycG9sYXRlMTtcbiAgICBjYXNlIDU6XG4gICAgICByZXR1cm4gUjMuYXR0cmlidXRlSW50ZXJwb2xhdGUyO1xuICAgIGNhc2UgNzpcbiAgICAgIHJldHVybiBSMy5hdHRyaWJ1dGVJbnRlcnBvbGF0ZTM7XG4gICAgY2FzZSA5OlxuICAgICAgcmV0dXJuIFIzLmF0dHJpYnV0ZUludGVycG9sYXRlNDtcbiAgICBjYXNlIDExOlxuICAgICAgcmV0dXJuIFIzLmF0dHJpYnV0ZUludGVycG9sYXRlNTtcbiAgICBjYXNlIDEzOlxuICAgICAgcmV0dXJuIFIzLmF0dHJpYnV0ZUludGVycG9sYXRlNjtcbiAgICBjYXNlIDE1OlxuICAgICAgcmV0dXJuIFIzLmF0dHJpYnV0ZUludGVycG9sYXRlNztcbiAgICBjYXNlIDE3OlxuICAgICAgcmV0dXJuIFIzLmF0dHJpYnV0ZUludGVycG9sYXRlODtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIFIzLmF0dHJpYnV0ZUludGVycG9sYXRlVjtcbiAgfVxufVxuXG4vKipcbiAqIEdldHMgdGhlIGluc3RydWN0aW9uIHRvIGdlbmVyYXRlIGZvciBpbnRlcnBvbGF0ZWQgdGV4dC5cbiAqIEBwYXJhbSBpbnRlcnBvbGF0aW9uIEFuIEludGVycG9sYXRpb24gQVNUXG4gKi9cbmZ1bmN0aW9uIGdldFRleHRJbnRlcnBvbGF0aW9uRXhwcmVzc2lvbihpbnRlcnBvbGF0aW9uOiBJbnRlcnBvbGF0aW9uKTogby5FeHRlcm5hbFJlZmVyZW5jZSB7XG4gIHN3aXRjaCAoZ2V0SW50ZXJwb2xhdGlvbkFyZ3NMZW5ndGgoaW50ZXJwb2xhdGlvbikpIHtcbiAgICBjYXNlIDE6XG4gICAgICByZXR1cm4gUjMudGV4dEludGVycG9sYXRlO1xuICAgIGNhc2UgMzpcbiAgICAgIHJldHVybiBSMy50ZXh0SW50ZXJwb2xhdGUxO1xuICAgIGNhc2UgNTpcbiAgICAgIHJldHVybiBSMy50ZXh0SW50ZXJwb2xhdGUyO1xuICAgIGNhc2UgNzpcbiAgICAgIHJldHVybiBSMy50ZXh0SW50ZXJwb2xhdGUzO1xuICAgIGNhc2UgOTpcbiAgICAgIHJldHVybiBSMy50ZXh0SW50ZXJwb2xhdGU0O1xuICAgIGNhc2UgMTE6XG4gICAgICByZXR1cm4gUjMudGV4dEludGVycG9sYXRlNTtcbiAgICBjYXNlIDEzOlxuICAgICAgcmV0dXJuIFIzLnRleHRJbnRlcnBvbGF0ZTY7XG4gICAgY2FzZSAxNTpcbiAgICAgIHJldHVybiBSMy50ZXh0SW50ZXJwb2xhdGU3O1xuICAgIGNhc2UgMTc6XG4gICAgICByZXR1cm4gUjMudGV4dEludGVycG9sYXRlODtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIFIzLnRleHRJbnRlcnBvbGF0ZVY7XG4gIH1cbn1cblxuLyoqXG4gKiBPcHRpb25zIHRoYXQgY2FuIGJlIHVzZWQgdG8gbW9kaWZ5IGhvdyBhIHRlbXBsYXRlIGlzIHBhcnNlZCBieSBgcGFyc2VUZW1wbGF0ZSgpYC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBQYXJzZVRlbXBsYXRlT3B0aW9ucyB7XG4gIC8qKlxuICAgKiBJbmNsdWRlIHdoaXRlc3BhY2Ugbm9kZXMgaW4gdGhlIHBhcnNlZCBvdXRwdXQuXG4gICAqL1xuICBwcmVzZXJ2ZVdoaXRlc3BhY2VzPzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIFByZXNlcnZlIG9yaWdpbmFsIGxpbmUgZW5kaW5ncyBpbnN0ZWFkIG9mIG5vcm1hbGl6aW5nICdcXHJcXG4nIGVuZGluZ3MgdG8gJ1xcbicuXG4gICAqL1xuICBwcmVzZXJ2ZUxpbmVFbmRpbmdzPzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIEhvdyB0byBwYXJzZSBpbnRlcnBvbGF0aW9uIG1hcmtlcnMuXG4gICAqL1xuICBpbnRlcnBvbGF0aW9uQ29uZmlnPzogSW50ZXJwb2xhdGlvbkNvbmZpZztcbiAgLyoqXG4gICAqIFRoZSBzdGFydCBhbmQgZW5kIHBvaW50IG9mIHRoZSB0ZXh0IHRvIHBhcnNlIHdpdGhpbiB0aGUgYHNvdXJjZWAgc3RyaW5nLlxuICAgKiBUaGUgZW50aXJlIGBzb3VyY2VgIHN0cmluZyBpcyBwYXJzZWQgaWYgdGhpcyBpcyBub3QgcHJvdmlkZWQuXG4gICAqICovXG4gIHJhbmdlPzogTGV4ZXJSYW5nZTtcbiAgLyoqXG4gICAqIElmIHRoaXMgdGV4dCBpcyBzdG9yZWQgaW4gYSBKYXZhU2NyaXB0IHN0cmluZywgdGhlbiB3ZSBoYXZlIHRvIGRlYWwgd2l0aCBlc2NhcGUgc2VxdWVuY2VzLlxuICAgKlxuICAgKiAqKkV4YW1wbGUgMToqKlxuICAgKlxuICAgKiBgYGBcbiAgICogXCJhYmNcXFwiZGVmXFxuZ2hpXCJcbiAgICogYGBgXG4gICAqXG4gICAqIC0gVGhlIGBcXFwiYCBtdXN0IGJlIGNvbnZlcnRlZCB0byBgXCJgLlxuICAgKiAtIFRoZSBgXFxuYCBtdXN0IGJlIGNvbnZlcnRlZCB0byBhIG5ldyBsaW5lIGNoYXJhY3RlciBpbiBhIHRva2VuLFxuICAgKiAgIGJ1dCBpdCBzaG91bGQgbm90IGluY3JlbWVudCB0aGUgY3VycmVudCBsaW5lIGZvciBzb3VyY2UgbWFwcGluZy5cbiAgICpcbiAgICogKipFeGFtcGxlIDI6KipcbiAgICpcbiAgICogYGBgXG4gICAqIFwiYWJjXFxcbiAgICogIGRlZlwiXG4gICAqIGBgYFxuICAgKlxuICAgKiBUaGUgbGluZSBjb250aW51YXRpb24gKGBcXGAgZm9sbG93ZWQgYnkgYSBuZXdsaW5lKSBzaG91bGQgYmUgcmVtb3ZlZCBmcm9tIGEgdG9rZW5cbiAgICogYnV0IHRoZSBuZXcgbGluZSBzaG91bGQgaW5jcmVtZW50IHRoZSBjdXJyZW50IGxpbmUgZm9yIHNvdXJjZSBtYXBwaW5nLlxuICAgKi9cbiAgZXNjYXBlZFN0cmluZz86IGJvb2xlYW47XG4gIC8qKlxuICAgKiBBbiBhcnJheSBvZiBjaGFyYWN0ZXJzIHRoYXQgc2hvdWxkIGJlIGNvbnNpZGVyZWQgYXMgbGVhZGluZyB0cml2aWEuXG4gICAqIExlYWRpbmcgdHJpdmlhIGFyZSBjaGFyYWN0ZXJzIHRoYXQgYXJlIG5vdCBpbXBvcnRhbnQgdG8gdGhlIGRldmVsb3BlciwgYW5kIHNvIHNob3VsZCBub3QgYmVcbiAgICogaW5jbHVkZWQgaW4gc291cmNlLW1hcCBzZWdtZW50cy4gIEEgY29tbW9uIGV4YW1wbGUgaXMgd2hpdGVzcGFjZS5cbiAgICovXG4gIGxlYWRpbmdUcml2aWFDaGFycz86IHN0cmluZ1tdO1xuXG4gIC8qKlxuICAgKiBSZW5kZXIgYCRsb2NhbGl6ZWAgbWVzc2FnZSBpZHMgd2l0aCBhZGRpdGlvbmFsIGxlZ2FjeSBtZXNzYWdlIGlkcy5cbiAgICpcbiAgICogVGhpcyBvcHRpb24gZGVmYXVsdHMgdG8gYHRydWVgIGJ1dCBpbiB0aGUgZnV0dXJlIHRoZSBkZWZhdWx0IHdpbGwgYmUgZmxpcHBlZC5cbiAgICpcbiAgICogRm9yIG5vdyBzZXQgdGhpcyBvcHRpb24gdG8gZmFsc2UgaWYgeW91IGhhdmUgbWlncmF0ZWQgdGhlIHRyYW5zbGF0aW9uIGZpbGVzIHRvIHVzZSB0aGUgbmV3XG4gICAqIGAkbG9jYWxpemVgIG1lc3NhZ2UgaWQgZm9ybWF0IGFuZCB5b3UgYXJlIG5vdCB1c2luZyBjb21waWxlIHRpbWUgdHJhbnNsYXRpb24gbWVyZ2luZy5cbiAgICovXG4gIGVuYWJsZUkxOG5MZWdhY3lNZXNzYWdlSWRGb3JtYXQ/OiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBJZiB0aGlzIHRleHQgaXMgc3RvcmVkIGluIGFuIGV4dGVybmFsIHRlbXBsYXRlIChlLmcuIHZpYSBgdGVtcGxhdGVVcmxgKSB0aGVuIHdlIG5lZWQgdG8gZGVjaWRlXG4gICAqIHdoZXRoZXIgb3Igbm90IHRvIG5vcm1hbGl6ZSB0aGUgbGluZS1lbmRpbmdzIChmcm9tIGBcXHJcXG5gIHRvIGBcXG5gKSB3aGVuIHByb2Nlc3NpbmcgSUNVXG4gICAqIGV4cHJlc3Npb25zLlxuICAgKlxuICAgKiBJZiBgdHJ1ZWAgdGhlbiB3ZSB3aWxsIG5vcm1hbGl6ZSBJQ1UgZXhwcmVzc2lvbiBsaW5lIGVuZGluZ3MuXG4gICAqIFRoZSBkZWZhdWx0IGlzIGBmYWxzZWAsIGJ1dCB0aGlzIHdpbGwgYmUgc3dpdGNoZWQgaW4gYSBmdXR1cmUgbWFqb3IgcmVsZWFzZS5cbiAgICovXG4gIGkxOG5Ob3JtYWxpemVMaW5lRW5kaW5nc0luSUNVcz86IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdG8gYWx3YXlzIGF0dGVtcHQgdG8gY29udmVydCB0aGUgcGFyc2VkIEhUTUwgQVNUIHRvIGFuIFIzIEFTVCwgZGVzcGl0ZSBIVE1MIG9yIGkxOG5cbiAgICogTWV0YSBwYXJzZSBlcnJvcnMuXG4gICAqXG4gICAqXG4gICAqIFRoaXMgb3B0aW9uIGlzIHVzZWZ1bCBpbiB0aGUgY29udGV4dCBvZiB0aGUgbGFuZ3VhZ2Ugc2VydmljZSwgd2hlcmUgd2Ugd2FudCB0byBnZXQgYXMgbXVjaFxuICAgKiBpbmZvcm1hdGlvbiBhcyBwb3NzaWJsZSwgZGVzcGl0ZSBhbnkgZXJyb3JzIGluIHRoZSBIVE1MLiBBcyBhbiBleGFtcGxlLCBhIHVzZXIgbWF5IGJlIGFkZGluZ1xuICAgKiBhIG5ldyB0YWcgYW5kIGV4cGVjdGluZyBhdXRvY29tcGxldGUgb24gdGhhdCB0YWcuIEluIHRoaXMgc2NlbmFyaW8sIHRoZSBIVE1MIGlzIGluIGFuIGVycm9yZWRcbiAgICogc3RhdGUsIGFzIHRoZXJlIGlzIGFuIGluY29tcGxldGUgb3BlbiB0YWcuIEhvd2V2ZXIsIHdlJ3JlIHN0aWxsIGFibGUgdG8gY29udmVydCB0aGUgSFRNTCBBU1RcbiAgICogbm9kZXMgdG8gUjMgQVNUIG5vZGVzIGluIG9yZGVyIHRvIHByb3ZpZGUgaW5mb3JtYXRpb24gZm9yIHRoZSBsYW5ndWFnZSBzZXJ2aWNlLlxuICAgKlxuICAgKiBOb3RlIHRoYXQgZXZlbiB3aGVuIGB0cnVlYCB0aGUgSFRNTCBwYXJzZSBhbmQgaTE4biBlcnJvcnMgYXJlIHN0aWxsIGFwcGVuZGVkIHRvIHRoZSBlcnJvcnNcbiAgICogb3V0cHV0LCBidXQgdGhpcyBpcyBkb25lIGFmdGVyIGNvbnZlcnRpbmcgdGhlIEhUTUwgQVNUIHRvIFIzIEFTVC5cbiAgICovXG4gIGFsd2F5c0F0dGVtcHRIdG1sVG9SM0FzdENvbnZlcnNpb24/OiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBJbmNsdWRlIEhUTUwgQ29tbWVudCBub2RlcyBpbiBhIHRvcC1sZXZlbCBjb21tZW50cyBhcnJheSBvbiB0aGUgcmV0dXJuZWQgUjMgQVNULlxuICAgKlxuICAgKiBUaGlzIG9wdGlvbiBpcyByZXF1aXJlZCBieSB0b29saW5nIHRoYXQgbmVlZHMgdG8ga25vdyB0aGUgbG9jYXRpb24gb2YgY29tbWVudCBub2RlcyB3aXRoaW4gdGhlXG4gICAqIEFTVC4gQSBjb25jcmV0ZSBleGFtcGxlIGlzIEBhbmd1bGFyLWVzbGludCB3aGljaCByZXF1aXJlcyB0aGlzIGluIG9yZGVyIHRvIGVuYWJsZVxuICAgKiBcImVzbGludC1kaXNhYmxlXCIgY29tbWVudHMgd2l0aGluIEhUTUwgdGVtcGxhdGVzLCB3aGljaCB0aGVuIGFsbG93cyB1c2VycyB0byB0dXJuIG9mZiBzcGVjaWZpY1xuICAgKiBydWxlcyBvbiBhIGNhc2UgYnkgY2FzZSBiYXNpcywgaW5zdGVhZCBvZiBmb3IgdGhlaXIgd2hvbGUgcHJvamVjdCB3aXRoaW4gYSBjb25maWd1cmF0aW9uIGZpbGUuXG4gICAqL1xuICBjb2xsZWN0Q29tbWVudE5vZGVzPzogYm9vbGVhbjtcblxuICAvKiogV2hldGhlciB0aGUgQCBibG9jayBzeW50YXggaXMgZW5hYmxlZC4gKi9cbiAgZW5hYmxlQmxvY2tTeW50YXg/OiBib29sZWFuO1xufVxuXG4vKipcbiAqIFBhcnNlIGEgdGVtcGxhdGUgaW50byByZW5kZXIzIGBOb2RlYHMgYW5kIGFkZGl0aW9uYWwgbWV0YWRhdGEsIHdpdGggbm8gb3RoZXIgZGVwZW5kZW5jaWVzLlxuICpcbiAqIEBwYXJhbSB0ZW1wbGF0ZSB0ZXh0IG9mIHRoZSB0ZW1wbGF0ZSB0byBwYXJzZVxuICogQHBhcmFtIHRlbXBsYXRlVXJsIFVSTCB0byB1c2UgZm9yIHNvdXJjZSBtYXBwaW5nIG9mIHRoZSBwYXJzZWQgdGVtcGxhdGVcbiAqIEBwYXJhbSBvcHRpb25zIG9wdGlvbnMgdG8gbW9kaWZ5IGhvdyB0aGUgdGVtcGxhdGUgaXMgcGFyc2VkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVRlbXBsYXRlKFxuICAgIHRlbXBsYXRlOiBzdHJpbmcsIHRlbXBsYXRlVXJsOiBzdHJpbmcsIG9wdGlvbnM6IFBhcnNlVGVtcGxhdGVPcHRpb25zID0ge30pOiBQYXJzZWRUZW1wbGF0ZSB7XG4gIGNvbnN0IHtpbnRlcnBvbGF0aW9uQ29uZmlnLCBwcmVzZXJ2ZVdoaXRlc3BhY2VzLCBlbmFibGVJMThuTGVnYWN5TWVzc2FnZUlkRm9ybWF0fSA9IG9wdGlvbnM7XG4gIGNvbnN0IGJpbmRpbmdQYXJzZXIgPSBtYWtlQmluZGluZ1BhcnNlcihpbnRlcnBvbGF0aW9uQ29uZmlnKTtcbiAgY29uc3QgaHRtbFBhcnNlciA9IG5ldyBIdG1sUGFyc2VyKCk7XG4gIGNvbnN0IHBhcnNlUmVzdWx0ID0gaHRtbFBhcnNlci5wYXJzZSh0ZW1wbGF0ZSwgdGVtcGxhdGVVcmwsIHtcbiAgICBsZWFkaW5nVHJpdmlhQ2hhcnM6IExFQURJTkdfVFJJVklBX0NIQVJTLFxuICAgIC4uLm9wdGlvbnMsXG4gICAgdG9rZW5pemVFeHBhbnNpb25Gb3JtczogdHJ1ZSxcbiAgICB0b2tlbml6ZUJsb2Nrczogb3B0aW9ucy5lbmFibGVCbG9ja1N5bnRheCA/PyB0cnVlLFxuICB9KTtcblxuICBpZiAoIW9wdGlvbnMuYWx3YXlzQXR0ZW1wdEh0bWxUb1IzQXN0Q29udmVyc2lvbiAmJiBwYXJzZVJlc3VsdC5lcnJvcnMgJiZcbiAgICAgIHBhcnNlUmVzdWx0LmVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgY29uc3QgcGFyc2VkVGVtcGxhdGU6IFBhcnNlZFRlbXBsYXRlID0ge1xuICAgICAgaW50ZXJwb2xhdGlvbkNvbmZpZyxcbiAgICAgIHByZXNlcnZlV2hpdGVzcGFjZXMsXG4gICAgICBlcnJvcnM6IHBhcnNlUmVzdWx0LmVycm9ycyxcbiAgICAgIG5vZGVzOiBbXSxcbiAgICAgIHN0eWxlVXJsczogW10sXG4gICAgICBzdHlsZXM6IFtdLFxuICAgICAgbmdDb250ZW50U2VsZWN0b3JzOiBbXVxuICAgIH07XG4gICAgaWYgKG9wdGlvbnMuY29sbGVjdENvbW1lbnROb2Rlcykge1xuICAgICAgcGFyc2VkVGVtcGxhdGUuY29tbWVudE5vZGVzID0gW107XG4gICAgfVxuICAgIHJldHVybiBwYXJzZWRUZW1wbGF0ZTtcbiAgfVxuXG4gIGxldCByb290Tm9kZXM6IGh0bWwuTm9kZVtdID0gcGFyc2VSZXN1bHQucm9vdE5vZGVzO1xuXG4gIC8vIHByb2Nlc3MgaTE4biBtZXRhIGluZm9ybWF0aW9uIChzY2FuIGF0dHJpYnV0ZXMsIGdlbmVyYXRlIGlkcylcbiAgLy8gYmVmb3JlIHdlIHJ1biB3aGl0ZXNwYWNlIHJlbW92YWwgcHJvY2VzcywgYmVjYXVzZSBleGlzdGluZyBpMThuXG4gIC8vIGV4dHJhY3Rpb24gcHJvY2VzcyAobmcgZXh0cmFjdC1pMThuKSByZWxpZXMgb24gYSByYXcgY29udGVudCB0byBnZW5lcmF0ZVxuICAvLyBtZXNzYWdlIGlkc1xuICBjb25zdCBpMThuTWV0YVZpc2l0b3IgPSBuZXcgSTE4bk1ldGFWaXNpdG9yKFxuICAgICAgaW50ZXJwb2xhdGlvbkNvbmZpZywgLyoga2VlcEkxOG5BdHRycyAqLyAhcHJlc2VydmVXaGl0ZXNwYWNlcyxcbiAgICAgIGVuYWJsZUkxOG5MZWdhY3lNZXNzYWdlSWRGb3JtYXQpO1xuICBjb25zdCBpMThuTWV0YVJlc3VsdCA9IGkxOG5NZXRhVmlzaXRvci52aXNpdEFsbFdpdGhFcnJvcnMocm9vdE5vZGVzKTtcblxuICBpZiAoIW9wdGlvbnMuYWx3YXlzQXR0ZW1wdEh0bWxUb1IzQXN0Q29udmVyc2lvbiAmJiBpMThuTWV0YVJlc3VsdC5lcnJvcnMgJiZcbiAgICAgIGkxOG5NZXRhUmVzdWx0LmVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgY29uc3QgcGFyc2VkVGVtcGxhdGU6IFBhcnNlZFRlbXBsYXRlID0ge1xuICAgICAgaW50ZXJwb2xhdGlvbkNvbmZpZyxcbiAgICAgIHByZXNlcnZlV2hpdGVzcGFjZXMsXG4gICAgICBlcnJvcnM6IGkxOG5NZXRhUmVzdWx0LmVycm9ycyxcbiAgICAgIG5vZGVzOiBbXSxcbiAgICAgIHN0eWxlVXJsczogW10sXG4gICAgICBzdHlsZXM6IFtdLFxuICAgICAgbmdDb250ZW50U2VsZWN0b3JzOiBbXVxuICAgIH07XG4gICAgaWYgKG9wdGlvbnMuY29sbGVjdENvbW1lbnROb2Rlcykge1xuICAgICAgcGFyc2VkVGVtcGxhdGUuY29tbWVudE5vZGVzID0gW107XG4gICAgfVxuICAgIHJldHVybiBwYXJzZWRUZW1wbGF0ZTtcbiAgfVxuXG4gIHJvb3ROb2RlcyA9IGkxOG5NZXRhUmVzdWx0LnJvb3ROb2RlcztcblxuICBpZiAoIXByZXNlcnZlV2hpdGVzcGFjZXMpIHtcbiAgICByb290Tm9kZXMgPSBodG1sLnZpc2l0QWxsKG5ldyBXaGl0ZXNwYWNlVmlzaXRvcigpLCByb290Tm9kZXMpO1xuXG4gICAgLy8gcnVuIGkxOG4gbWV0YSB2aXNpdG9yIGFnYWluIGluIGNhc2Ugd2hpdGVzcGFjZXMgYXJlIHJlbW92ZWQgKGJlY2F1c2UgdGhhdCBtaWdodCBhZmZlY3RcbiAgICAvLyBnZW5lcmF0ZWQgaTE4biBtZXNzYWdlIGNvbnRlbnQpIGFuZCBmaXJzdCBwYXNzIGluZGljYXRlZCB0aGF0IGkxOG4gY29udGVudCBpcyBwcmVzZW50IGluIGFcbiAgICAvLyB0ZW1wbGF0ZS4gRHVyaW5nIHRoaXMgcGFzcyBpMThuIElEcyBnZW5lcmF0ZWQgYXQgdGhlIGZpcnN0IHBhc3Mgd2lsbCBiZSBwcmVzZXJ2ZWQsIHNvIHdlIGNhblxuICAgIC8vIG1pbWljIGV4aXN0aW5nIGV4dHJhY3Rpb24gcHJvY2VzcyAobmcgZXh0cmFjdC1pMThuKVxuICAgIGlmIChpMThuTWV0YVZpc2l0b3IuaGFzSTE4bk1ldGEpIHtcbiAgICAgIHJvb3ROb2RlcyA9IGh0bWwudmlzaXRBbGwoXG4gICAgICAgICAgbmV3IEkxOG5NZXRhVmlzaXRvcihpbnRlcnBvbGF0aW9uQ29uZmlnLCAvKiBrZWVwSTE4bkF0dHJzICovIGZhbHNlKSwgcm9vdE5vZGVzKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCB7bm9kZXMsIGVycm9ycywgc3R5bGVVcmxzLCBzdHlsZXMsIG5nQ29udGVudFNlbGVjdG9ycywgY29tbWVudE5vZGVzfSA9IGh0bWxBc3RUb1JlbmRlcjNBc3QoXG4gICAgICByb290Tm9kZXMsIGJpbmRpbmdQYXJzZXIsIHtjb2xsZWN0Q29tbWVudE5vZGVzOiAhIW9wdGlvbnMuY29sbGVjdENvbW1lbnROb2Rlc30pO1xuICBlcnJvcnMucHVzaCguLi5wYXJzZVJlc3VsdC5lcnJvcnMsIC4uLmkxOG5NZXRhUmVzdWx0LmVycm9ycyk7XG5cbiAgY29uc3QgcGFyc2VkVGVtcGxhdGU6IFBhcnNlZFRlbXBsYXRlID0ge1xuICAgIGludGVycG9sYXRpb25Db25maWcsXG4gICAgcHJlc2VydmVXaGl0ZXNwYWNlcyxcbiAgICBlcnJvcnM6IGVycm9ycy5sZW5ndGggPiAwID8gZXJyb3JzIDogbnVsbCxcbiAgICBub2RlcyxcbiAgICBzdHlsZVVybHMsXG4gICAgc3R5bGVzLFxuICAgIG5nQ29udGVudFNlbGVjdG9yc1xuICB9O1xuXG4gIGlmIChvcHRpb25zLmNvbGxlY3RDb21tZW50Tm9kZXMpIHtcbiAgICBwYXJzZWRUZW1wbGF0ZS5jb21tZW50Tm9kZXMgPSBjb21tZW50Tm9kZXM7XG4gIH1cbiAgcmV0dXJuIHBhcnNlZFRlbXBsYXRlO1xufVxuXG5jb25zdCBlbGVtZW50UmVnaXN0cnkgPSBuZXcgRG9tRWxlbWVudFNjaGVtYVJlZ2lzdHJ5KCk7XG5cbi8qKlxuICogQ29uc3RydWN0IGEgYEJpbmRpbmdQYXJzZXJgIHdpdGggYSBkZWZhdWx0IGNvbmZpZ3VyYXRpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYWtlQmluZGluZ1BhcnNlcihcbiAgICBpbnRlcnBvbGF0aW9uQ29uZmlnOiBJbnRlcnBvbGF0aW9uQ29uZmlnID0gREVGQVVMVF9JTlRFUlBPTEFUSU9OX0NPTkZJRyk6IEJpbmRpbmdQYXJzZXIge1xuICByZXR1cm4gbmV3IEJpbmRpbmdQYXJzZXIobmV3IFBhcnNlcihuZXcgTGV4ZXIoKSksIGludGVycG9sYXRpb25Db25maWcsIGVsZW1lbnRSZWdpc3RyeSwgW10pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZVNhbml0aXphdGlvbkZuKGNvbnRleHQ6IGNvcmUuU2VjdXJpdHlDb250ZXh0LCBpc0F0dHJpYnV0ZT86IGJvb2xlYW4pIHtcbiAgc3dpdGNoIChjb250ZXh0KSB7XG4gICAgY2FzZSBjb3JlLlNlY3VyaXR5Q29udGV4dC5IVE1MOlxuICAgICAgcmV0dXJuIG8uaW1wb3J0RXhwcihSMy5zYW5pdGl6ZUh0bWwpO1xuICAgIGNhc2UgY29yZS5TZWN1cml0eUNvbnRleHQuU0NSSVBUOlxuICAgICAgcmV0dXJuIG8uaW1wb3J0RXhwcihSMy5zYW5pdGl6ZVNjcmlwdCk7XG4gICAgY2FzZSBjb3JlLlNlY3VyaXR5Q29udGV4dC5TVFlMRTpcbiAgICAgIC8vIHRoZSBjb21waWxlciBkb2VzIG5vdCBmaWxsIGluIGFuIGluc3RydWN0aW9uIGZvciBbc3R5bGUucHJvcD9dIGJpbmRpbmdcbiAgICAgIC8vIHZhbHVlcyBiZWNhdXNlIHRoZSBzdHlsZSBhbGdvcml0aG0ga25vd3MgaW50ZXJuYWxseSB3aGF0IHByb3BzIGFyZSBzdWJqZWN0XG4gICAgICAvLyB0byBzYW5pdGl6YXRpb24gKG9ubHkgW2F0dHIuc3R5bGVdIHZhbHVlcyBhcmUgZXhwbGljaXRseSBzYW5pdGl6ZWQpXG4gICAgICByZXR1cm4gaXNBdHRyaWJ1dGUgPyBvLmltcG9ydEV4cHIoUjMuc2FuaXRpemVTdHlsZSkgOiBudWxsO1xuICAgIGNhc2UgY29yZS5TZWN1cml0eUNvbnRleHQuVVJMOlxuICAgICAgcmV0dXJuIG8uaW1wb3J0RXhwcihSMy5zYW5pdGl6ZVVybCk7XG4gICAgY2FzZSBjb3JlLlNlY3VyaXR5Q29udGV4dC5SRVNPVVJDRV9VUkw6XG4gICAgICByZXR1cm4gby5pbXBvcnRFeHByKFIzLnNhbml0aXplUmVzb3VyY2VVcmwpO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG5mdW5jdGlvbiB0cnVzdGVkQ29uc3RBdHRyaWJ1dGUodGFnTmFtZTogc3RyaW5nLCBhdHRyOiB0LlRleHRBdHRyaWJ1dGUpOiBvLkV4cHJlc3Npb24ge1xuICBjb25zdCB2YWx1ZSA9IGFzTGl0ZXJhbChhdHRyLnZhbHVlKTtcbiAgaWYgKGlzVHJ1c3RlZFR5cGVzU2luayh0YWdOYW1lLCBhdHRyLm5hbWUpKSB7XG4gICAgc3dpdGNoIChlbGVtZW50UmVnaXN0cnkuc2VjdXJpdHlDb250ZXh0KHRhZ05hbWUsIGF0dHIubmFtZSwgLyogaXNBdHRyaWJ1dGUgKi8gdHJ1ZSkpIHtcbiAgICAgIGNhc2UgY29yZS5TZWN1cml0eUNvbnRleHQuSFRNTDpcbiAgICAgICAgcmV0dXJuIG8udGFnZ2VkVGVtcGxhdGUoXG4gICAgICAgICAgICBvLmltcG9ydEV4cHIoUjMudHJ1c3RDb25zdGFudEh0bWwpLFxuICAgICAgICAgICAgbmV3IG8uVGVtcGxhdGVMaXRlcmFsKFtuZXcgby5UZW1wbGF0ZUxpdGVyYWxFbGVtZW50KGF0dHIudmFsdWUpXSwgW10pLCB1bmRlZmluZWQsXG4gICAgICAgICAgICBhdHRyLnZhbHVlU3Bhbik7XG4gICAgICAvLyBOQjogbm8gU2VjdXJpdHlDb250ZXh0LlNDUklQVCBoZXJlLCBhcyB0aGUgY29ycmVzcG9uZGluZyB0YWdzIGFyZSBzdHJpcHBlZCBieSB0aGUgY29tcGlsZXIuXG4gICAgICBjYXNlIGNvcmUuU2VjdXJpdHlDb250ZXh0LlJFU09VUkNFX1VSTDpcbiAgICAgICAgcmV0dXJuIG8udGFnZ2VkVGVtcGxhdGUoXG4gICAgICAgICAgICBvLmltcG9ydEV4cHIoUjMudHJ1c3RDb25zdGFudFJlc291cmNlVXJsKSxcbiAgICAgICAgICAgIG5ldyBvLlRlbXBsYXRlTGl0ZXJhbChbbmV3IG8uVGVtcGxhdGVMaXRlcmFsRWxlbWVudChhdHRyLnZhbHVlKV0sIFtdKSwgdW5kZWZpbmVkLFxuICAgICAgICAgICAgYXR0ci52YWx1ZVNwYW4pO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNTaW5nbGVFbGVtZW50VGVtcGxhdGUoY2hpbGRyZW46IHQuTm9kZVtdKTogY2hpbGRyZW4gaXNbdC5FbGVtZW50XSB7XG4gIHJldHVybiBjaGlsZHJlbi5sZW5ndGggPT09IDEgJiYgY2hpbGRyZW5bMF0gaW5zdGFuY2VvZiB0LkVsZW1lbnQ7XG59XG5cbmZ1bmN0aW9uIGlzVGV4dE5vZGUobm9kZTogdC5Ob2RlKTogYm9vbGVhbiB7XG4gIHJldHVybiBub2RlIGluc3RhbmNlb2YgdC5UZXh0IHx8IG5vZGUgaW5zdGFuY2VvZiB0LkJvdW5kVGV4dCB8fCBub2RlIGluc3RhbmNlb2YgdC5JY3U7XG59XG5cbmZ1bmN0aW9uIGlzSWZyYW1lRWxlbWVudCh0YWdOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIHRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ2lmcmFtZSc7XG59XG5cbmZ1bmN0aW9uIGhhc1RleHRDaGlsZHJlbk9ubHkoY2hpbGRyZW46IHQuTm9kZVtdKTogYm9vbGVhbiB7XG4gIHJldHVybiBjaGlsZHJlbi5ldmVyeShpc1RleHROb2RlKTtcbn1cblxuZnVuY3Rpb24gZ2V0QmluZGluZ0Z1bmN0aW9uUGFyYW1zKFxuICAgIGRlZmVycmVkUGFyYW1zOiAoKSA9PiAoby5FeHByZXNzaW9uIHwgby5FeHByZXNzaW9uW10pLCBuYW1lPzogc3RyaW5nLFxuICAgIGVhZ2VyUGFyYW1zPzogby5FeHByZXNzaW9uW10pIHtcbiAgcmV0dXJuICgpID0+IHtcbiAgICBjb25zdCB2YWx1ZSA9IGRlZmVycmVkUGFyYW1zKCk7XG4gICAgY29uc3QgZm5QYXJhbXMgPSBBcnJheS5pc0FycmF5KHZhbHVlKSA/IHZhbHVlIDogW3ZhbHVlXTtcbiAgICBpZiAoZWFnZXJQYXJhbXMpIHtcbiAgICAgIGZuUGFyYW1zLnB1c2goLi4uZWFnZXJQYXJhbXMpO1xuICAgIH1cbiAgICBpZiAobmFtZSkge1xuICAgICAgLy8gV2Ugd2FudCB0aGUgcHJvcGVydHkgbmFtZSB0byBhbHdheXMgYmUgdGhlIGZpcnN0IGZ1bmN0aW9uIHBhcmFtZXRlci5cbiAgICAgIGZuUGFyYW1zLnVuc2hpZnQoby5saXRlcmFsKG5hbWUpKTtcbiAgICB9XG4gICAgcmV0dXJuIGZuUGFyYW1zO1xuICB9O1xufVxuXG4vKiogTmFtZSBvZiB0aGUgZ2xvYmFsIHZhcmlhYmxlIHRoYXQgaXMgdXNlZCB0byBkZXRlcm1pbmUgaWYgd2UgdXNlIENsb3N1cmUgdHJhbnNsYXRpb25zIG9yIG5vdCAqL1xuY29uc3QgTkdfSTE4Tl9DTE9TVVJFX01PREUgPSAnbmdJMThuQ2xvc3VyZU1vZGUnO1xuXG4vKipcbiAqIEdlbmVyYXRlIHN0YXRlbWVudHMgdGhhdCBkZWZpbmUgYSBnaXZlbiB0cmFuc2xhdGlvbiBtZXNzYWdlLlxuICpcbiAqIGBgYFxuICogdmFyIEkxOE5fMTtcbiAqIGlmICh0eXBlb2YgbmdJMThuQ2xvc3VyZU1vZGUgIT09IHVuZGVmaW5lZCAmJiBuZ0kxOG5DbG9zdXJlTW9kZSkge1xuICogICAgIHZhciBNU0dfRVhURVJOQUxfWFhYID0gZ29vZy5nZXRNc2coXG4gKiAgICAgICAgICBcIlNvbWUgbWVzc2FnZSB3aXRoIHskaW50ZXJwb2xhdGlvbn0hXCIsXG4gKiAgICAgICAgICB7IFwiaW50ZXJwb2xhdGlvblwiOiBcIlxcdUZGRkQwXFx1RkZGRFwiIH1cbiAqICAgICApO1xuICogICAgIEkxOE5fMSA9IE1TR19FWFRFUk5BTF9YWFg7XG4gKiB9XG4gKiBlbHNlIHtcbiAqICAgICBJMThOXzEgPSAkbG9jYWxpemVgU29tZSBtZXNzYWdlIHdpdGggJHsnXFx1RkZGRDBcXHVGRkZEJ30hYDtcbiAqIH1cbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBtZXNzYWdlIFRoZSBvcmlnaW5hbCBpMThuIEFTVCBtZXNzYWdlIG5vZGVcbiAqIEBwYXJhbSB2YXJpYWJsZSBUaGUgdmFyaWFibGUgdGhhdCB3aWxsIGJlIGFzc2lnbmVkIHRoZSB0cmFuc2xhdGlvbiwgZS5nLiBgSTE4Tl8xYC5cbiAqIEBwYXJhbSBjbG9zdXJlVmFyIFRoZSB2YXJpYWJsZSBmb3IgQ2xvc3VyZSBgZ29vZy5nZXRNc2dgIGNhbGxzLCBlLmcuIGBNU0dfRVhURVJOQUxfWFhYYC5cbiAqIEBwYXJhbSBwYXJhbXMgT2JqZWN0IG1hcHBpbmcgcGxhY2Vob2xkZXIgbmFtZXMgdG8gdGhlaXIgdmFsdWVzIChlLmcuXG4gKiBgeyBcImludGVycG9sYXRpb25cIjogXCJcXHVGRkZEMFxcdUZGRkRcIiB9YCkuXG4gKiBAcGFyYW0gdHJhbnNmb3JtRm4gT3B0aW9uYWwgdHJhbnNmb3JtYXRpb24gZnVuY3Rpb24gdGhhdCB3aWxsIGJlIGFwcGxpZWQgdG8gdGhlIHRyYW5zbGF0aW9uIChlLmcuXG4gKiBwb3N0LXByb2Nlc3NpbmcpLlxuICogQHJldHVybnMgQW4gYXJyYXkgb2Ygc3RhdGVtZW50cyB0aGF0IGRlZmluZWQgYSBnaXZlbiB0cmFuc2xhdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFRyYW5zbGF0aW9uRGVjbFN0bXRzKFxuICAgIG1lc3NhZ2U6IGkxOG4uTWVzc2FnZSwgdmFyaWFibGU6IG8uUmVhZFZhckV4cHIsIGNsb3N1cmVWYXI6IG8uUmVhZFZhckV4cHIsXG4gICAgcGFyYW1zOiB7W25hbWU6IHN0cmluZ106IG8uRXhwcmVzc2lvbn0gPSB7fSxcbiAgICB0cmFuc2Zvcm1Gbj86IChyYXc6IG8uUmVhZFZhckV4cHIpID0+IG8uRXhwcmVzc2lvbik6IG8uU3RhdGVtZW50W10ge1xuICAvLyBTb3J0IHRoZSBtYXAgZW50cmllcyBpbiB0aGUgY29tcGlsZWQgb3V0cHV0LiBUaGlzIG1ha2VzIGl0IGVhc3kgdG8gYWNoZWl2ZSBpZGVudGljYWwgb3V0cHV0IGluXG4gIC8vIHRoZSB0ZW1wbGF0ZSBwaXBlbGluZSBjb21waWxlci5cbiAgcGFyYW1zID0gT2JqZWN0LmZyb21FbnRyaWVzKE9iamVjdC5lbnRyaWVzKHBhcmFtcykuc29ydCgpKTtcblxuICBjb25zdCBzdGF0ZW1lbnRzOiBvLlN0YXRlbWVudFtdID0gW1xuICAgIGRlY2xhcmVJMThuVmFyaWFibGUodmFyaWFibGUpLFxuICAgIG8uaWZTdG10KFxuICAgICAgICBjcmVhdGVDbG9zdXJlTW9kZUd1YXJkKCksXG4gICAgICAgIGNyZWF0ZUdvb2dsZUdldE1zZ1N0YXRlbWVudHModmFyaWFibGUsIG1lc3NhZ2UsIGNsb3N1cmVWYXIsIHBhcmFtcyksXG4gICAgICAgIGNyZWF0ZUxvY2FsaXplU3RhdGVtZW50cyhcbiAgICAgICAgICAgIHZhcmlhYmxlLCBtZXNzYWdlLCBmb3JtYXRJMThuUGxhY2Vob2xkZXJOYW1lc0luTWFwKHBhcmFtcywgLyogdXNlQ2FtZWxDYXNlICovIGZhbHNlKSkpLFxuICBdO1xuXG4gIGlmICh0cmFuc2Zvcm1Gbikge1xuICAgIHN0YXRlbWVudHMucHVzaChuZXcgby5FeHByZXNzaW9uU3RhdGVtZW50KHZhcmlhYmxlLnNldCh0cmFuc2Zvcm1Gbih2YXJpYWJsZSkpKSk7XG4gIH1cblxuICByZXR1cm4gc3RhdGVtZW50cztcbn1cblxuLyoqXG4gKiBDcmVhdGUgdGhlIGV4cHJlc3Npb24gdGhhdCB3aWxsIGJlIHVzZWQgdG8gZ3VhcmQgdGhlIGNsb3N1cmUgbW9kZSBibG9ja1xuICogSXQgaXMgZXF1aXZhbGVudCB0bzpcbiAqXG4gKiBgYGBcbiAqIHR5cGVvZiBuZ0kxOG5DbG9zdXJlTW9kZSAhPT0gdW5kZWZpbmVkICYmIG5nSTE4bkNsb3N1cmVNb2RlXG4gKiBgYGBcbiAqL1xuZnVuY3Rpb24gY3JlYXRlQ2xvc3VyZU1vZGVHdWFyZCgpOiBvLkJpbmFyeU9wZXJhdG9yRXhwciB7XG4gIHJldHVybiBvLnR5cGVvZkV4cHIoby52YXJpYWJsZShOR19JMThOX0NMT1NVUkVfTU9ERSkpXG4gICAgICAubm90SWRlbnRpY2FsKG8ubGl0ZXJhbCgndW5kZWZpbmVkJywgby5TVFJJTkdfVFlQRSkpXG4gICAgICAuYW5kKG8udmFyaWFibGUoTkdfSTE4Tl9DTE9TVVJFX01PREUpKTtcbn1cblxuLyoqXG4gKiBJbmZvcm1hdGlvbiBhYm91dCB0aGUgdGVtcGxhdGUgd2hpY2ggd2FzIGV4dHJhY3RlZCBkdXJpbmcgcGFyc2luZy5cbiAqXG4gKiBUaGlzIGNvbnRhaW5zIHRoZSBhY3R1YWwgcGFyc2VkIHRlbXBsYXRlIGFzIHdlbGwgYXMgYW55IG1ldGFkYXRhIGNvbGxlY3RlZCBkdXJpbmcgaXRzIHBhcnNpbmcsXG4gKiBzb21lIG9mIHdoaWNoIG1pZ2h0IGJlIHVzZWZ1bCBmb3IgcmUtcGFyc2luZyB0aGUgdGVtcGxhdGUgd2l0aCBkaWZmZXJlbnQgb3B0aW9ucy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBQYXJzZWRUZW1wbGF0ZSB7XG4gIC8qKlxuICAgKiBJbmNsdWRlIHdoaXRlc3BhY2Ugbm9kZXMgaW4gdGhlIHBhcnNlZCBvdXRwdXQuXG4gICAqL1xuICBwcmVzZXJ2ZVdoaXRlc3BhY2VzPzogYm9vbGVhbjtcblxuICAvKipcbiAgICogSG93IHRvIHBhcnNlIGludGVycG9sYXRpb24gbWFya2Vycy5cbiAgICovXG4gIGludGVycG9sYXRpb25Db25maWc/OiBJbnRlcnBvbGF0aW9uQ29uZmlnO1xuICAvKipcbiAgICogQW55IGVycm9ycyBmcm9tIHBhcnNpbmcgdGhlIHRlbXBsYXRlIHRoZSBmaXJzdCB0aW1lLlxuICAgKlxuICAgKiBgbnVsbGAgaWYgdGhlcmUgYXJlIG5vIGVycm9ycy4gT3RoZXJ3aXNlLCB0aGUgYXJyYXkgb2YgZXJyb3JzIGlzIGd1YXJhbnRlZWQgdG8gYmUgbm9uLWVtcHR5LlxuICAgKi9cbiAgZXJyb3JzOiBQYXJzZUVycm9yW118bnVsbDtcblxuICAvKipcbiAgICogVGhlIHRlbXBsYXRlIEFTVCwgcGFyc2VkIGZyb20gdGhlIHRlbXBsYXRlLlxuICAgKi9cbiAgbm9kZXM6IHQuTm9kZVtdO1xuXG4gIC8qKlxuICAgKiBBbnkgc3R5bGVVcmxzIGV4dHJhY3RlZCBmcm9tIHRoZSBtZXRhZGF0YS5cbiAgICovXG4gIHN0eWxlVXJsczogc3RyaW5nW107XG5cbiAgLyoqXG4gICAqIEFueSBpbmxpbmUgc3R5bGVzIGV4dHJhY3RlZCBmcm9tIHRoZSBtZXRhZGF0YS5cbiAgICovXG4gIHN0eWxlczogc3RyaW5nW107XG5cbiAgLyoqXG4gICAqIEFueSBuZy1jb250ZW50IHNlbGVjdG9ycyBleHRyYWN0ZWQgZnJvbSB0aGUgdGVtcGxhdGUuXG4gICAqL1xuICBuZ0NvbnRlbnRTZWxlY3RvcnM6IHN0cmluZ1tdO1xuXG4gIC8qKlxuICAgKiBBbnkgUjMgQ29tbWVudCBOb2RlcyBleHRyYWN0ZWQgZnJvbSB0aGUgdGVtcGxhdGUgd2hlbiB0aGUgYGNvbGxlY3RDb21tZW50Tm9kZXNgIHBhcnNlIHRlbXBsYXRlXG4gICAqIG9wdGlvbiBpcyBlbmFibGVkLlxuICAgKi9cbiAgY29tbWVudE5vZGVzPzogdC5Db21tZW50W107XG59XG4iXX0=