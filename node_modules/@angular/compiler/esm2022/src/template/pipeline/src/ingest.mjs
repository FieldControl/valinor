/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { SecurityContext } from '../../../core';
import * as e from '../../../expression_parser/ast';
import * as i18n from '../../../i18n/i18n_ast';
import { splitNsName } from '../../../ml_parser/tags';
import * as o from '../../../output/output_ast';
import { ParseSourceSpan } from '../../../parse_util';
import * as t from '../../../render3/r3_ast';
import { icuFromI18nMessage } from '../../../render3/view/i18n/util';
import { DomElementSchemaRegistry } from '../../../schema/dom_element_schema_registry';
import * as ir from '../ir';
import { ComponentCompilationJob, HostBindingCompilationJob, } from './compilation';
import { BINARY_OPERATORS, namespaceForKey, prefixWithNamespace } from './conversion';
const compatibilityMode = ir.CompatibilityMode.TemplateDefinitionBuilder;
// Schema containing DOM elements and their properties.
const domSchema = new DomElementSchemaRegistry();
// Tag name of the `ng-template` element.
const NG_TEMPLATE_TAG_NAME = 'ng-template';
export function isI18nRootNode(meta) {
    return meta instanceof i18n.Message;
}
export function isSingleI18nIcu(meta) {
    return isI18nRootNode(meta) && meta.nodes.length === 1 && meta.nodes[0] instanceof i18n.Icu;
}
/**
 * Process a template AST and convert it into a `ComponentCompilation` in the intermediate
 * representation.
 * TODO: Refactor more of the ingestion code into phases.
 */
export function ingestComponent(componentName, template, constantPool, relativeContextFilePath, i18nUseExternalIds, deferMeta, allDeferrableDepsFn) {
    const job = new ComponentCompilationJob(componentName, constantPool, compatibilityMode, relativeContextFilePath, i18nUseExternalIds, deferMeta, allDeferrableDepsFn);
    ingestNodes(job.root, template);
    return job;
}
/**
 * Process a host binding AST and convert it into a `HostBindingCompilationJob` in the intermediate
 * representation.
 */
export function ingestHostBinding(input, bindingParser, constantPool) {
    const job = new HostBindingCompilationJob(input.componentName, constantPool, compatibilityMode);
    for (const property of input.properties ?? []) {
        let bindingKind = ir.BindingKind.Property;
        // TODO: this should really be handled in the parser.
        if (property.name.startsWith('attr.')) {
            property.name = property.name.substring('attr.'.length);
            bindingKind = ir.BindingKind.Attribute;
        }
        if (property.isAnimation) {
            bindingKind = ir.BindingKind.Animation;
        }
        const securityContexts = bindingParser
            .calcPossibleSecurityContexts(input.componentSelector, property.name, bindingKind === ir.BindingKind.Attribute)
            .filter((context) => context !== SecurityContext.NONE);
        ingestHostProperty(job, property, bindingKind, securityContexts);
    }
    for (const [name, expr] of Object.entries(input.attributes) ?? []) {
        const securityContexts = bindingParser
            .calcPossibleSecurityContexts(input.componentSelector, name, true)
            .filter((context) => context !== SecurityContext.NONE);
        ingestHostAttribute(job, name, expr, securityContexts);
    }
    for (const event of input.events ?? []) {
        ingestHostEvent(job, event);
    }
    return job;
}
// TODO: We should refactor the parser to use the same types and structures for host bindings as
// with ordinary components. This would allow us to share a lot more ingestion code.
export function ingestHostProperty(job, property, bindingKind, securityContexts) {
    let expression;
    const ast = property.expression.ast;
    if (ast instanceof e.Interpolation) {
        expression = new ir.Interpolation(ast.strings, ast.expressions.map((expr) => convertAst(expr, job, property.sourceSpan)), []);
    }
    else {
        expression = convertAst(ast, job, property.sourceSpan);
    }
    job.root.update.push(ir.createBindingOp(job.root.xref, bindingKind, property.name, expression, null, securityContexts, false, false, null, 
    /* TODO: How do Host bindings handle i18n attrs? */ null, property.sourceSpan));
}
export function ingestHostAttribute(job, name, value, securityContexts) {
    const attrBinding = ir.createBindingOp(job.root.xref, ir.BindingKind.Attribute, name, value, null, securityContexts, 
    /* Host attributes should always be extracted to const hostAttrs, even if they are not
     *strictly* text literals */
    true, false, null, 
    /* TODO */ null, 
    /** TODO: May be null? */ value.sourceSpan);
    job.root.update.push(attrBinding);
}
export function ingestHostEvent(job, event) {
    const [phase, target] = event.type !== e.ParsedEventType.Animation
        ? [null, event.targetOrPhase]
        : [event.targetOrPhase, null];
    const eventBinding = ir.createListenerOp(job.root.xref, new ir.SlotHandle(), event.name, null, makeListenerHandlerOps(job.root, event.handler, event.handlerSpan), phase, target, true, event.sourceSpan);
    job.root.create.push(eventBinding);
}
/**
 * Ingest the nodes of a template AST into the given `ViewCompilation`.
 */
function ingestNodes(unit, template) {
    for (const node of template) {
        if (node instanceof t.Element) {
            ingestElement(unit, node);
        }
        else if (node instanceof t.Template) {
            ingestTemplate(unit, node);
        }
        else if (node instanceof t.Content) {
            ingestContent(unit, node);
        }
        else if (node instanceof t.Text) {
            ingestText(unit, node, null);
        }
        else if (node instanceof t.BoundText) {
            ingestBoundText(unit, node, null);
        }
        else if (node instanceof t.IfBlock) {
            ingestIfBlock(unit, node);
        }
        else if (node instanceof t.SwitchBlock) {
            ingestSwitchBlock(unit, node);
        }
        else if (node instanceof t.DeferredBlock) {
            ingestDeferBlock(unit, node);
        }
        else if (node instanceof t.Icu) {
            ingestIcu(unit, node);
        }
        else if (node instanceof t.ForLoopBlock) {
            ingestForBlock(unit, node);
        }
        else if (node instanceof t.LetDeclaration) {
            ingestLetDeclaration(unit, node);
        }
        else {
            throw new Error(`Unsupported template node: ${node.constructor.name}`);
        }
    }
}
/**
 * Ingest an element AST from the template into the given `ViewCompilation`.
 */
function ingestElement(unit, element) {
    if (element.i18n !== undefined &&
        !(element.i18n instanceof i18n.Message || element.i18n instanceof i18n.TagPlaceholder)) {
        throw Error(`Unhandled i18n metadata type for element: ${element.i18n.constructor.name}`);
    }
    const id = unit.job.allocateXrefId();
    const [namespaceKey, elementName] = splitNsName(element.name);
    const startOp = ir.createElementStartOp(elementName, id, namespaceForKey(namespaceKey), element.i18n instanceof i18n.TagPlaceholder ? element.i18n : undefined, element.startSourceSpan, element.sourceSpan);
    unit.create.push(startOp);
    ingestElementBindings(unit, startOp, element);
    ingestReferences(startOp, element);
    // Start i18n, if needed, goes after the element create and bindings, but before the nodes
    let i18nBlockId = null;
    if (element.i18n instanceof i18n.Message) {
        i18nBlockId = unit.job.allocateXrefId();
        unit.create.push(ir.createI18nStartOp(i18nBlockId, element.i18n, undefined, element.startSourceSpan));
    }
    ingestNodes(unit, element.children);
    // The source span for the end op is typically the element closing tag. However, if no closing tag
    // exists, such as in `<input>`, we use the start source span instead. Usually the start and end
    // instructions will be collapsed into one `element` instruction, negating the purpose of this
    // fallback, but in cases when it is not collapsed (such as an input with a binding), we still
    // want to map the end instruction to the main element.
    const endOp = ir.createElementEndOp(id, element.endSourceSpan ?? element.startSourceSpan);
    unit.create.push(endOp);
    // If there is an i18n message associated with this element, insert i18n start and end ops.
    if (i18nBlockId !== null) {
        ir.OpList.insertBefore(ir.createI18nEndOp(i18nBlockId, element.endSourceSpan ?? element.startSourceSpan), endOp);
    }
}
/**
 * Ingest an `ng-template` node from the AST into the given `ViewCompilation`.
 */
function ingestTemplate(unit, tmpl) {
    if (tmpl.i18n !== undefined &&
        !(tmpl.i18n instanceof i18n.Message || tmpl.i18n instanceof i18n.TagPlaceholder)) {
        throw Error(`Unhandled i18n metadata type for template: ${tmpl.i18n.constructor.name}`);
    }
    const childView = unit.job.allocateView(unit.xref);
    let tagNameWithoutNamespace = tmpl.tagName;
    let namespacePrefix = '';
    if (tmpl.tagName) {
        [namespacePrefix, tagNameWithoutNamespace] = splitNsName(tmpl.tagName);
    }
    const i18nPlaceholder = tmpl.i18n instanceof i18n.TagPlaceholder ? tmpl.i18n : undefined;
    const namespace = namespaceForKey(namespacePrefix);
    const functionNameSuffix = tagNameWithoutNamespace === null ? '' : prefixWithNamespace(tagNameWithoutNamespace, namespace);
    const templateKind = isPlainTemplate(tmpl)
        ? ir.TemplateKind.NgTemplate
        : ir.TemplateKind.Structural;
    const templateOp = ir.createTemplateOp(childView.xref, templateKind, tagNameWithoutNamespace, functionNameSuffix, namespace, i18nPlaceholder, tmpl.startSourceSpan, tmpl.sourceSpan);
    unit.create.push(templateOp);
    ingestTemplateBindings(unit, templateOp, tmpl, templateKind);
    ingestReferences(templateOp, tmpl);
    ingestNodes(childView, tmpl.children);
    for (const { name, value } of tmpl.variables) {
        childView.contextVariables.set(name, value !== '' ? value : '$implicit');
    }
    // If this is a plain template and there is an i18n message associated with it, insert i18n start
    // and end ops. For structural directive templates, the i18n ops will be added when ingesting the
    // element/template the directive is placed on.
    if (templateKind === ir.TemplateKind.NgTemplate && tmpl.i18n instanceof i18n.Message) {
        const id = unit.job.allocateXrefId();
        ir.OpList.insertAfter(ir.createI18nStartOp(id, tmpl.i18n, undefined, tmpl.startSourceSpan), childView.create.head);
        ir.OpList.insertBefore(ir.createI18nEndOp(id, tmpl.endSourceSpan ?? tmpl.startSourceSpan), childView.create.tail);
    }
}
/**
 * Ingest a content node from the AST into the given `ViewCompilation`.
 */
function ingestContent(unit, content) {
    if (content.i18n !== undefined && !(content.i18n instanceof i18n.TagPlaceholder)) {
        throw Error(`Unhandled i18n metadata type for element: ${content.i18n.constructor.name}`);
    }
    let fallbackView = null;
    // Don't capture default content that's only made up of empty text nodes and comments.
    // Note that we process the default content before the projection in order to match the
    // insertion order at runtime.
    if (content.children.some((child) => !(child instanceof t.Comment) &&
        (!(child instanceof t.Text) || child.value.trim().length > 0))) {
        fallbackView = unit.job.allocateView(unit.xref);
        ingestNodes(fallbackView, content.children);
    }
    const id = unit.job.allocateXrefId();
    const op = ir.createProjectionOp(id, content.selector, content.i18n, fallbackView?.xref ?? null, content.sourceSpan);
    for (const attr of content.attributes) {
        const securityContext = domSchema.securityContext(content.name, attr.name, true);
        unit.update.push(ir.createBindingOp(op.xref, ir.BindingKind.Attribute, attr.name, o.literal(attr.value), null, securityContext, true, false, null, asMessage(attr.i18n), attr.sourceSpan));
    }
    unit.create.push(op);
}
/**
 * Ingest a literal text node from the AST into the given `ViewCompilation`.
 */
function ingestText(unit, text, icuPlaceholder) {
    unit.create.push(ir.createTextOp(unit.job.allocateXrefId(), text.value, icuPlaceholder, text.sourceSpan));
}
/**
 * Ingest an interpolated text node from the AST into the given `ViewCompilation`.
 */
function ingestBoundText(unit, text, icuPlaceholder) {
    let value = text.value;
    if (value instanceof e.ASTWithSource) {
        value = value.ast;
    }
    if (!(value instanceof e.Interpolation)) {
        throw new Error(`AssertionError: expected Interpolation for BoundText node, got ${value.constructor.name}`);
    }
    if (text.i18n !== undefined && !(text.i18n instanceof i18n.Container)) {
        throw Error(`Unhandled i18n metadata type for text interpolation: ${text.i18n?.constructor.name}`);
    }
    const i18nPlaceholders = text.i18n instanceof i18n.Container
        ? text.i18n.children
            .filter((node) => node instanceof i18n.Placeholder)
            .map((placeholder) => placeholder.name)
        : [];
    if (i18nPlaceholders.length > 0 && i18nPlaceholders.length !== value.expressions.length) {
        throw Error(`Unexpected number of i18n placeholders (${value.expressions.length}) for BoundText with ${value.expressions.length} expressions`);
    }
    const textXref = unit.job.allocateXrefId();
    unit.create.push(ir.createTextOp(textXref, '', icuPlaceholder, text.sourceSpan));
    // TemplateDefinitionBuilder does not generate source maps for sub-expressions inside an
    // interpolation. We copy that behavior in compatibility mode.
    // TODO: is it actually correct to generate these extra maps in modern mode?
    const baseSourceSpan = unit.job.compatibility ? null : text.sourceSpan;
    unit.update.push(ir.createInterpolateTextOp(textXref, new ir.Interpolation(value.strings, value.expressions.map((expr) => convertAst(expr, unit.job, baseSourceSpan)), i18nPlaceholders), text.sourceSpan));
}
/**
 * Ingest an `@if` block into the given `ViewCompilation`.
 */
function ingestIfBlock(unit, ifBlock) {
    let firstXref = null;
    let conditions = [];
    for (let i = 0; i < ifBlock.branches.length; i++) {
        const ifCase = ifBlock.branches[i];
        const cView = unit.job.allocateView(unit.xref);
        const tagName = ingestControlFlowInsertionPoint(unit, cView.xref, ifCase);
        if (ifCase.expressionAlias !== null) {
            cView.contextVariables.set(ifCase.expressionAlias.name, ir.CTX_REF);
        }
        let ifCaseI18nMeta = undefined;
        if (ifCase.i18n !== undefined) {
            if (!(ifCase.i18n instanceof i18n.BlockPlaceholder)) {
                throw Error(`Unhandled i18n metadata type for if block: ${ifCase.i18n?.constructor.name}`);
            }
            ifCaseI18nMeta = ifCase.i18n;
        }
        const templateOp = ir.createTemplateOp(cView.xref, ir.TemplateKind.Block, tagName, 'Conditional', ir.Namespace.HTML, ifCaseI18nMeta, ifCase.startSourceSpan, ifCase.sourceSpan);
        unit.create.push(templateOp);
        if (firstXref === null) {
            firstXref = cView.xref;
        }
        const caseExpr = ifCase.expression ? convertAst(ifCase.expression, unit.job, null) : null;
        const conditionalCaseExpr = new ir.ConditionalCaseExpr(caseExpr, templateOp.xref, templateOp.handle, ifCase.expressionAlias);
        conditions.push(conditionalCaseExpr);
        ingestNodes(cView, ifCase.children);
    }
    unit.update.push(ir.createConditionalOp(firstXref, null, conditions, ifBlock.sourceSpan));
}
/**
 * Ingest an `@switch` block into the given `ViewCompilation`.
 */
function ingestSwitchBlock(unit, switchBlock) {
    // Don't ingest empty switches since they won't render anything.
    if (switchBlock.cases.length === 0) {
        return;
    }
    let firstXref = null;
    let conditions = [];
    for (const switchCase of switchBlock.cases) {
        const cView = unit.job.allocateView(unit.xref);
        const tagName = ingestControlFlowInsertionPoint(unit, cView.xref, switchCase);
        let switchCaseI18nMeta = undefined;
        if (switchCase.i18n !== undefined) {
            if (!(switchCase.i18n instanceof i18n.BlockPlaceholder)) {
                throw Error(`Unhandled i18n metadata type for switch block: ${switchCase.i18n?.constructor.name}`);
            }
            switchCaseI18nMeta = switchCase.i18n;
        }
        const templateOp = ir.createTemplateOp(cView.xref, ir.TemplateKind.Block, tagName, 'Case', ir.Namespace.HTML, switchCaseI18nMeta, switchCase.startSourceSpan, switchCase.sourceSpan);
        unit.create.push(templateOp);
        if (firstXref === null) {
            firstXref = cView.xref;
        }
        const caseExpr = switchCase.expression
            ? convertAst(switchCase.expression, unit.job, switchBlock.startSourceSpan)
            : null;
        const conditionalCaseExpr = new ir.ConditionalCaseExpr(caseExpr, templateOp.xref, templateOp.handle);
        conditions.push(conditionalCaseExpr);
        ingestNodes(cView, switchCase.children);
    }
    unit.update.push(ir.createConditionalOp(firstXref, convertAst(switchBlock.expression, unit.job, null), conditions, switchBlock.sourceSpan));
}
function ingestDeferView(unit, suffix, i18nMeta, children, sourceSpan) {
    if (i18nMeta !== undefined && !(i18nMeta instanceof i18n.BlockPlaceholder)) {
        throw Error('Unhandled i18n metadata type for defer block');
    }
    if (children === undefined) {
        return null;
    }
    const secondaryView = unit.job.allocateView(unit.xref);
    ingestNodes(secondaryView, children);
    const templateOp = ir.createTemplateOp(secondaryView.xref, ir.TemplateKind.Block, null, `Defer${suffix}`, ir.Namespace.HTML, i18nMeta, sourceSpan, sourceSpan);
    unit.create.push(templateOp);
    return templateOp;
}
function ingestDeferBlock(unit, deferBlock) {
    let ownResolverFn = null;
    if (unit.job.deferMeta.mode === 0 /* DeferBlockDepsEmitMode.PerBlock */) {
        if (!unit.job.deferMeta.blocks.has(deferBlock)) {
            throw new Error(`AssertionError: unable to find a dependency function for this deferred block`);
        }
        ownResolverFn = unit.job.deferMeta.blocks.get(deferBlock) ?? null;
    }
    // Generate the defer main view and all secondary views.
    const main = ingestDeferView(unit, '', deferBlock.i18n, deferBlock.children, deferBlock.sourceSpan);
    const loading = ingestDeferView(unit, 'Loading', deferBlock.loading?.i18n, deferBlock.loading?.children, deferBlock.loading?.sourceSpan);
    const placeholder = ingestDeferView(unit, 'Placeholder', deferBlock.placeholder?.i18n, deferBlock.placeholder?.children, deferBlock.placeholder?.sourceSpan);
    const error = ingestDeferView(unit, 'Error', deferBlock.error?.i18n, deferBlock.error?.children, deferBlock.error?.sourceSpan);
    // Create the main defer op, and ops for all secondary views.
    const deferXref = unit.job.allocateXrefId();
    const deferOp = ir.createDeferOp(deferXref, main.xref, main.handle, ownResolverFn, unit.job.allDeferrableDepsFn, deferBlock.sourceSpan);
    deferOp.placeholderView = placeholder?.xref ?? null;
    deferOp.placeholderSlot = placeholder?.handle ?? null;
    deferOp.loadingSlot = loading?.handle ?? null;
    deferOp.errorSlot = error?.handle ?? null;
    deferOp.placeholderMinimumTime = deferBlock.placeholder?.minimumTime ?? null;
    deferOp.loadingMinimumTime = deferBlock.loading?.minimumTime ?? null;
    deferOp.loadingAfterTime = deferBlock.loading?.afterTime ?? null;
    unit.create.push(deferOp);
    // Configure all defer `on` conditions.
    // TODO: refactor prefetch triggers to use a separate op type, with a shared superclass. This will
    // make it easier to refactor prefetch behavior in the future.
    let prefetch = false;
    let deferOnOps = [];
    let deferWhenOps = [];
    for (const triggers of [deferBlock.triggers, deferBlock.prefetchTriggers]) {
        if (triggers.idle !== undefined) {
            const deferOnOp = ir.createDeferOnOp(deferXref, { kind: ir.DeferTriggerKind.Idle }, prefetch, triggers.idle.sourceSpan);
            deferOnOps.push(deferOnOp);
        }
        if (triggers.immediate !== undefined) {
            const deferOnOp = ir.createDeferOnOp(deferXref, { kind: ir.DeferTriggerKind.Immediate }, prefetch, triggers.immediate.sourceSpan);
            deferOnOps.push(deferOnOp);
        }
        if (triggers.timer !== undefined) {
            const deferOnOp = ir.createDeferOnOp(deferXref, { kind: ir.DeferTriggerKind.Timer, delay: triggers.timer.delay }, prefetch, triggers.timer.sourceSpan);
            deferOnOps.push(deferOnOp);
        }
        if (triggers.hover !== undefined) {
            const deferOnOp = ir.createDeferOnOp(deferXref, {
                kind: ir.DeferTriggerKind.Hover,
                targetName: triggers.hover.reference,
                targetXref: null,
                targetSlot: null,
                targetView: null,
                targetSlotViewSteps: null,
            }, prefetch, triggers.hover.sourceSpan);
            deferOnOps.push(deferOnOp);
        }
        if (triggers.interaction !== undefined) {
            const deferOnOp = ir.createDeferOnOp(deferXref, {
                kind: ir.DeferTriggerKind.Interaction,
                targetName: triggers.interaction.reference,
                targetXref: null,
                targetSlot: null,
                targetView: null,
                targetSlotViewSteps: null,
            }, prefetch, triggers.interaction.sourceSpan);
            deferOnOps.push(deferOnOp);
        }
        if (triggers.viewport !== undefined) {
            const deferOnOp = ir.createDeferOnOp(deferXref, {
                kind: ir.DeferTriggerKind.Viewport,
                targetName: triggers.viewport.reference,
                targetXref: null,
                targetSlot: null,
                targetView: null,
                targetSlotViewSteps: null,
            }, prefetch, triggers.viewport.sourceSpan);
            deferOnOps.push(deferOnOp);
        }
        if (triggers.when !== undefined) {
            if (triggers.when.value instanceof e.Interpolation) {
                // TemplateDefinitionBuilder supports this case, but it's very strange to me. What would it
                // even mean?
                throw new Error(`Unexpected interpolation in defer block when trigger`);
            }
            const deferOnOp = ir.createDeferWhenOp(deferXref, convertAst(triggers.when.value, unit.job, triggers.when.sourceSpan), prefetch, triggers.when.sourceSpan);
            deferWhenOps.push(deferOnOp);
        }
        // If no (non-prefetching) defer triggers were provided, default to `idle`.
        if (deferOnOps.length === 0 && deferWhenOps.length === 0) {
            deferOnOps.push(ir.createDeferOnOp(deferXref, { kind: ir.DeferTriggerKind.Idle }, false, null));
        }
        prefetch = true;
    }
    unit.create.push(deferOnOps);
    unit.update.push(deferWhenOps);
}
function ingestIcu(unit, icu) {
    if (icu.i18n instanceof i18n.Message && isSingleI18nIcu(icu.i18n)) {
        const xref = unit.job.allocateXrefId();
        unit.create.push(ir.createIcuStartOp(xref, icu.i18n, icuFromI18nMessage(icu.i18n).name, null));
        for (const [placeholder, text] of Object.entries({ ...icu.vars, ...icu.placeholders })) {
            if (text instanceof t.BoundText) {
                ingestBoundText(unit, text, placeholder);
            }
            else {
                ingestText(unit, text, placeholder);
            }
        }
        unit.create.push(ir.createIcuEndOp(xref));
    }
    else {
        throw Error(`Unhandled i18n metadata type for ICU: ${icu.i18n?.constructor.name}`);
    }
}
/**
 * Ingest an `@for` block into the given `ViewCompilation`.
 */
function ingestForBlock(unit, forBlock) {
    const repeaterView = unit.job.allocateView(unit.xref);
    // We copy TemplateDefinitionBuilder's scheme of creating names for `$count` and `$index`
    // that are suffixed with special information, to disambiguate which level of nested loop
    // the below aliases refer to.
    // TODO: We should refactor Template Pipeline's variable phases to gracefully handle
    // shadowing, and arbitrarily many levels of variables depending on each other.
    const indexName = `ɵ$index_${repeaterView.xref}`;
    const countName = `ɵ$count_${repeaterView.xref}`;
    const indexVarNames = new Set();
    // Set all the context variables and aliases available in the repeater.
    repeaterView.contextVariables.set(forBlock.item.name, forBlock.item.value);
    for (const variable of forBlock.contextVariables) {
        if (variable.value === '$index') {
            indexVarNames.add(variable.name);
        }
        if (variable.name === '$index') {
            repeaterView.contextVariables.set('$index', variable.value).set(indexName, variable.value);
        }
        else if (variable.name === '$count') {
            repeaterView.contextVariables.set('$count', variable.value).set(countName, variable.value);
        }
        else {
            repeaterView.aliases.add({
                kind: ir.SemanticVariableKind.Alias,
                name: null,
                identifier: variable.name,
                expression: getComputedForLoopVariableExpression(variable, indexName, countName),
            });
        }
    }
    const sourceSpan = convertSourceSpan(forBlock.trackBy.span, forBlock.sourceSpan);
    const track = convertAst(forBlock.trackBy, unit.job, sourceSpan);
    ingestNodes(repeaterView, forBlock.children);
    let emptyView = null;
    let emptyTagName = null;
    if (forBlock.empty !== null) {
        emptyView = unit.job.allocateView(unit.xref);
        ingestNodes(emptyView, forBlock.empty.children);
        emptyTagName = ingestControlFlowInsertionPoint(unit, emptyView.xref, forBlock.empty);
    }
    const varNames = {
        $index: indexVarNames,
        $implicit: forBlock.item.name,
    };
    if (forBlock.i18n !== undefined && !(forBlock.i18n instanceof i18n.BlockPlaceholder)) {
        throw Error('AssertionError: Unhandled i18n metadata type or @for');
    }
    if (forBlock.empty?.i18n !== undefined &&
        !(forBlock.empty.i18n instanceof i18n.BlockPlaceholder)) {
        throw Error('AssertionError: Unhandled i18n metadata type or @empty');
    }
    const i18nPlaceholder = forBlock.i18n;
    const emptyI18nPlaceholder = forBlock.empty?.i18n;
    const tagName = ingestControlFlowInsertionPoint(unit, repeaterView.xref, forBlock);
    const repeaterCreate = ir.createRepeaterCreateOp(repeaterView.xref, emptyView?.xref ?? null, tagName, track, varNames, emptyTagName, i18nPlaceholder, emptyI18nPlaceholder, forBlock.startSourceSpan, forBlock.sourceSpan);
    unit.create.push(repeaterCreate);
    const expression = convertAst(forBlock.expression, unit.job, convertSourceSpan(forBlock.expression.span, forBlock.sourceSpan));
    const repeater = ir.createRepeaterOp(repeaterCreate.xref, repeaterCreate.handle, expression, forBlock.sourceSpan);
    unit.update.push(repeater);
}
/**
 * Gets an expression that represents a variable in an `@for` loop.
 * @param variable AST representing the variable.
 * @param indexName Loop-specific name for `$index`.
 * @param countName Loop-specific name for `$count`.
 */
function getComputedForLoopVariableExpression(variable, indexName, countName) {
    switch (variable.value) {
        case '$index':
            return new ir.LexicalReadExpr(indexName);
        case '$count':
            return new ir.LexicalReadExpr(countName);
        case '$first':
            return new ir.LexicalReadExpr(indexName).identical(o.literal(0));
        case '$last':
            return new ir.LexicalReadExpr(indexName).identical(new ir.LexicalReadExpr(countName).minus(o.literal(1)));
        case '$even':
            return new ir.LexicalReadExpr(indexName).modulo(o.literal(2)).identical(o.literal(0));
        case '$odd':
            return new ir.LexicalReadExpr(indexName).modulo(o.literal(2)).notIdentical(o.literal(0));
        default:
            throw new Error(`AssertionError: unknown @for loop variable ${variable.value}`);
    }
}
function ingestLetDeclaration(unit, node) {
    const target = unit.job.allocateXrefId();
    unit.create.push(ir.createDeclareLetOp(target, node.name, node.sourceSpan));
    unit.update.push(ir.createStoreLetOp(target, node.name, convertAst(node.value, unit.job, node.valueSpan), node.sourceSpan));
}
/**
 * Convert a template AST expression into an output AST expression.
 */
function convertAst(ast, job, baseSourceSpan) {
    if (ast instanceof e.ASTWithSource) {
        return convertAst(ast.ast, job, baseSourceSpan);
    }
    else if (ast instanceof e.PropertyRead) {
        const isThisReceiver = ast.receiver instanceof e.ThisReceiver;
        // Whether this is an implicit receiver, *excluding* explicit reads of `this`.
        const isImplicitReceiver = ast.receiver instanceof e.ImplicitReceiver && !(ast.receiver instanceof e.ThisReceiver);
        // Whether the  name of the read is a node that should be never retain its explicit this
        // receiver.
        const isSpecialNode = ast.name === '$any' || ast.name === '$event';
        // TODO: The most sensible condition here would be simply `isImplicitReceiver`, to convert only
        // actual implicit `this` reads, and not explicit ones. However, TemplateDefinitionBuilder (and
        // the Typecheck block!) both have the same bug, in which they also consider explicit `this`
        // reads to be implicit. This causes problems when the explicit `this` read is inside a
        // template with a context that also provides the variable name being read:
        // ```
        // <ng-template let-a>{{this.a}}</ng-template>
        // ```
        // The whole point of the explicit `this` was to access the class property, but TDB and the
        // current TCB treat the read as implicit, and give you the context property instead!
        //
        // For now, we emulate this old behavior by aggressively converting explicit reads to to
        // implicit reads, except for the special cases that TDB and the current TCB protect. However,
        // it would be an improvement to fix this.
        //
        // See also the corresponding comment for the TCB, in `type_check_block.ts`.
        if (isImplicitReceiver || (isThisReceiver && !isSpecialNode)) {
            return new ir.LexicalReadExpr(ast.name);
        }
        else {
            return new o.ReadPropExpr(convertAst(ast.receiver, job, baseSourceSpan), ast.name, null, convertSourceSpan(ast.span, baseSourceSpan));
        }
    }
    else if (ast instanceof e.PropertyWrite) {
        if (ast.receiver instanceof e.ImplicitReceiver) {
            return new o.WritePropExpr(
            // TODO: Is it correct to always use the root context in place of the implicit receiver?
            new ir.ContextExpr(job.root.xref), ast.name, convertAst(ast.value, job, baseSourceSpan), null, convertSourceSpan(ast.span, baseSourceSpan));
        }
        return new o.WritePropExpr(convertAst(ast.receiver, job, baseSourceSpan), ast.name, convertAst(ast.value, job, baseSourceSpan), undefined, convertSourceSpan(ast.span, baseSourceSpan));
    }
    else if (ast instanceof e.KeyedWrite) {
        return new o.WriteKeyExpr(convertAst(ast.receiver, job, baseSourceSpan), convertAst(ast.key, job, baseSourceSpan), convertAst(ast.value, job, baseSourceSpan), undefined, convertSourceSpan(ast.span, baseSourceSpan));
    }
    else if (ast instanceof e.Call) {
        if (ast.receiver instanceof e.ImplicitReceiver) {
            throw new Error(`Unexpected ImplicitReceiver`);
        }
        else {
            return new o.InvokeFunctionExpr(convertAst(ast.receiver, job, baseSourceSpan), ast.args.map((arg) => convertAst(arg, job, baseSourceSpan)), undefined, convertSourceSpan(ast.span, baseSourceSpan));
        }
    }
    else if (ast instanceof e.LiteralPrimitive) {
        return o.literal(ast.value, undefined, convertSourceSpan(ast.span, baseSourceSpan));
    }
    else if (ast instanceof e.Unary) {
        switch (ast.operator) {
            case '+':
                return new o.UnaryOperatorExpr(o.UnaryOperator.Plus, convertAst(ast.expr, job, baseSourceSpan), undefined, convertSourceSpan(ast.span, baseSourceSpan));
            case '-':
                return new o.UnaryOperatorExpr(o.UnaryOperator.Minus, convertAst(ast.expr, job, baseSourceSpan), undefined, convertSourceSpan(ast.span, baseSourceSpan));
            default:
                throw new Error(`AssertionError: unknown unary operator ${ast.operator}`);
        }
    }
    else if (ast instanceof e.Binary) {
        const operator = BINARY_OPERATORS.get(ast.operation);
        if (operator === undefined) {
            throw new Error(`AssertionError: unknown binary operator ${ast.operation}`);
        }
        return new o.BinaryOperatorExpr(operator, convertAst(ast.left, job, baseSourceSpan), convertAst(ast.right, job, baseSourceSpan), undefined, convertSourceSpan(ast.span, baseSourceSpan));
    }
    else if (ast instanceof e.ThisReceiver) {
        // TODO: should context expressions have source maps?
        return new ir.ContextExpr(job.root.xref);
    }
    else if (ast instanceof e.KeyedRead) {
        return new o.ReadKeyExpr(convertAst(ast.receiver, job, baseSourceSpan), convertAst(ast.key, job, baseSourceSpan), undefined, convertSourceSpan(ast.span, baseSourceSpan));
    }
    else if (ast instanceof e.Chain) {
        throw new Error(`AssertionError: Chain in unknown context`);
    }
    else if (ast instanceof e.LiteralMap) {
        const entries = ast.keys.map((key, idx) => {
            const value = ast.values[idx];
            // TODO: should literals have source maps, or do we just map the whole surrounding
            // expression?
            return new o.LiteralMapEntry(key.key, convertAst(value, job, baseSourceSpan), key.quoted);
        });
        return new o.LiteralMapExpr(entries, undefined, convertSourceSpan(ast.span, baseSourceSpan));
    }
    else if (ast instanceof e.LiteralArray) {
        // TODO: should literals have source maps, or do we just map the whole surrounding expression?
        return new o.LiteralArrayExpr(ast.expressions.map((expr) => convertAst(expr, job, baseSourceSpan)));
    }
    else if (ast instanceof e.Conditional) {
        return new o.ConditionalExpr(convertAst(ast.condition, job, baseSourceSpan), convertAst(ast.trueExp, job, baseSourceSpan), convertAst(ast.falseExp, job, baseSourceSpan), undefined, convertSourceSpan(ast.span, baseSourceSpan));
    }
    else if (ast instanceof e.NonNullAssert) {
        // A non-null assertion shouldn't impact generated instructions, so we can just drop it.
        return convertAst(ast.expression, job, baseSourceSpan);
    }
    else if (ast instanceof e.BindingPipe) {
        // TODO: pipes should probably have source maps; figure out details.
        return new ir.PipeBindingExpr(job.allocateXrefId(), new ir.SlotHandle(), ast.name, [
            convertAst(ast.exp, job, baseSourceSpan),
            ...ast.args.map((arg) => convertAst(arg, job, baseSourceSpan)),
        ]);
    }
    else if (ast instanceof e.SafeKeyedRead) {
        return new ir.SafeKeyedReadExpr(convertAst(ast.receiver, job, baseSourceSpan), convertAst(ast.key, job, baseSourceSpan), convertSourceSpan(ast.span, baseSourceSpan));
    }
    else if (ast instanceof e.SafePropertyRead) {
        // TODO: source span
        return new ir.SafePropertyReadExpr(convertAst(ast.receiver, job, baseSourceSpan), ast.name);
    }
    else if (ast instanceof e.SafeCall) {
        // TODO: source span
        return new ir.SafeInvokeFunctionExpr(convertAst(ast.receiver, job, baseSourceSpan), ast.args.map((a) => convertAst(a, job, baseSourceSpan)));
    }
    else if (ast instanceof e.EmptyExpr) {
        return new ir.EmptyExpr(convertSourceSpan(ast.span, baseSourceSpan));
    }
    else if (ast instanceof e.PrefixNot) {
        return o.not(convertAst(ast.expression, job, baseSourceSpan), convertSourceSpan(ast.span, baseSourceSpan));
    }
    else {
        throw new Error(`Unhandled expression type "${ast.constructor.name}" in file "${baseSourceSpan?.start.file.url}"`);
    }
}
function convertAstWithInterpolation(job, value, i18nMeta, sourceSpan) {
    let expression;
    if (value instanceof e.Interpolation) {
        expression = new ir.Interpolation(value.strings, value.expressions.map((e) => convertAst(e, job, sourceSpan ?? null)), Object.keys(asMessage(i18nMeta)?.placeholders ?? {}));
    }
    else if (value instanceof e.AST) {
        expression = convertAst(value, job, sourceSpan ?? null);
    }
    else {
        expression = o.literal(value);
    }
    return expression;
}
// TODO: Can we populate Template binding kinds in ingest?
const BINDING_KINDS = new Map([
    [e.BindingType.Property, ir.BindingKind.Property],
    [e.BindingType.TwoWay, ir.BindingKind.TwoWayProperty],
    [e.BindingType.Attribute, ir.BindingKind.Attribute],
    [e.BindingType.Class, ir.BindingKind.ClassName],
    [e.BindingType.Style, ir.BindingKind.StyleProperty],
    [e.BindingType.Animation, ir.BindingKind.Animation],
]);
/**
 * Checks whether the given template is a plain ng-template (as opposed to another kind of template
 * such as a structural directive template or control flow template). This is checked based on the
 * tagName. We can expect that only plain ng-templates will come through with a tagName of
 * 'ng-template'.
 *
 * Here are some of the cases we expect:
 *
 * | Angular HTML                       | Template tagName   |
 * | ---------------------------------- | ------------------ |
 * | `<ng-template>`                    | 'ng-template'      |
 * | `<div *ngIf="true">`               | 'div'              |
 * | `<svg><ng-template>`               | 'svg:ng-template'  |
 * | `@if (true) {`                     | 'Conditional'      |
 * | `<ng-template *ngIf>` (plain)      | 'ng-template'      |
 * | `<ng-template *ngIf>` (structural) | null               |
 */
function isPlainTemplate(tmpl) {
    return splitNsName(tmpl.tagName ?? '')[1] === NG_TEMPLATE_TAG_NAME;
}
/**
 * Ensures that the i18nMeta, if provided, is an i18n.Message.
 */
function asMessage(i18nMeta) {
    if (i18nMeta == null) {
        return null;
    }
    if (!(i18nMeta instanceof i18n.Message)) {
        throw Error(`Expected i18n meta to be a Message, but got: ${i18nMeta.constructor.name}`);
    }
    return i18nMeta;
}
/**
 * Process all of the bindings on an element in the template AST and convert them to their IR
 * representation.
 */
function ingestElementBindings(unit, op, element) {
    let bindings = new Array();
    let i18nAttributeBindingNames = new Set();
    for (const attr of element.attributes) {
        // Attribute literal bindings, such as `attr.foo="bar"`.
        const securityContext = domSchema.securityContext(element.name, attr.name, true);
        bindings.push(ir.createBindingOp(op.xref, ir.BindingKind.Attribute, attr.name, convertAstWithInterpolation(unit.job, attr.value, attr.i18n), null, securityContext, true, false, null, asMessage(attr.i18n), attr.sourceSpan));
        if (attr.i18n) {
            i18nAttributeBindingNames.add(attr.name);
        }
    }
    for (const input of element.inputs) {
        if (i18nAttributeBindingNames.has(input.name)) {
            console.error(`On component ${unit.job.componentName}, the binding ${input.name} is both an i18n attribute and a property. You may want to remove the property binding. This will become a compilation error in future versions of Angular.`);
        }
        // All dynamic bindings (both attribute and property bindings).
        bindings.push(ir.createBindingOp(op.xref, BINDING_KINDS.get(input.type), input.name, convertAstWithInterpolation(unit.job, astOf(input.value), input.i18n), input.unit, input.securityContext, false, false, null, asMessage(input.i18n) ?? null, input.sourceSpan));
    }
    unit.create.push(bindings.filter((b) => b?.kind === ir.OpKind.ExtractedAttribute));
    unit.update.push(bindings.filter((b) => b?.kind === ir.OpKind.Binding));
    for (const output of element.outputs) {
        if (output.type === e.ParsedEventType.Animation && output.phase === null) {
            throw Error('Animation listener should have a phase');
        }
        if (output.type === e.ParsedEventType.TwoWay) {
            unit.create.push(ir.createTwoWayListenerOp(op.xref, op.handle, output.name, op.tag, makeTwoWayListenerHandlerOps(unit, output.handler, output.handlerSpan), output.sourceSpan));
        }
        else {
            unit.create.push(ir.createListenerOp(op.xref, op.handle, output.name, op.tag, makeListenerHandlerOps(unit, output.handler, output.handlerSpan), output.phase, output.target, false, output.sourceSpan));
        }
    }
    // If any of the bindings on this element have an i18n message, then an i18n attrs configuration
    // op is also required.
    if (bindings.some((b) => b?.i18nMessage) !== null) {
        unit.create.push(ir.createI18nAttributesOp(unit.job.allocateXrefId(), new ir.SlotHandle(), op.xref));
    }
}
/**
 * Process all of the bindings on a template in the template AST and convert them to their IR
 * representation.
 */
function ingestTemplateBindings(unit, op, template, templateKind) {
    let bindings = new Array();
    for (const attr of template.templateAttrs) {
        if (attr instanceof t.TextAttribute) {
            const securityContext = domSchema.securityContext(NG_TEMPLATE_TAG_NAME, attr.name, true);
            bindings.push(createTemplateBinding(unit, op.xref, e.BindingType.Attribute, attr.name, attr.value, null, securityContext, true, templateKind, asMessage(attr.i18n), attr.sourceSpan));
        }
        else {
            bindings.push(createTemplateBinding(unit, op.xref, attr.type, attr.name, astOf(attr.value), attr.unit, attr.securityContext, true, templateKind, asMessage(attr.i18n), attr.sourceSpan));
        }
    }
    for (const attr of template.attributes) {
        // Attribute literal bindings, such as `attr.foo="bar"`.
        const securityContext = domSchema.securityContext(NG_TEMPLATE_TAG_NAME, attr.name, true);
        bindings.push(createTemplateBinding(unit, op.xref, e.BindingType.Attribute, attr.name, attr.value, null, securityContext, false, templateKind, asMessage(attr.i18n), attr.sourceSpan));
    }
    for (const input of template.inputs) {
        // Dynamic bindings (both attribute and property bindings).
        bindings.push(createTemplateBinding(unit, op.xref, input.type, input.name, astOf(input.value), input.unit, input.securityContext, false, templateKind, asMessage(input.i18n), input.sourceSpan));
    }
    unit.create.push(bindings.filter((b) => b?.kind === ir.OpKind.ExtractedAttribute));
    unit.update.push(bindings.filter((b) => b?.kind === ir.OpKind.Binding));
    for (const output of template.outputs) {
        if (output.type === e.ParsedEventType.Animation && output.phase === null) {
            throw Error('Animation listener should have a phase');
        }
        if (templateKind === ir.TemplateKind.NgTemplate) {
            if (output.type === e.ParsedEventType.TwoWay) {
                unit.create.push(ir.createTwoWayListenerOp(op.xref, op.handle, output.name, op.tag, makeTwoWayListenerHandlerOps(unit, output.handler, output.handlerSpan), output.sourceSpan));
            }
            else {
                unit.create.push(ir.createListenerOp(op.xref, op.handle, output.name, op.tag, makeListenerHandlerOps(unit, output.handler, output.handlerSpan), output.phase, output.target, false, output.sourceSpan));
            }
        }
        if (templateKind === ir.TemplateKind.Structural &&
            output.type !== e.ParsedEventType.Animation) {
            // Animation bindings are excluded from the structural template's const array.
            const securityContext = domSchema.securityContext(NG_TEMPLATE_TAG_NAME, output.name, false);
            unit.create.push(ir.createExtractedAttributeOp(op.xref, ir.BindingKind.Property, null, output.name, null, null, null, securityContext));
        }
    }
    // TODO: Perhaps we could do this in a phase? (It likely wouldn't change the slot indices.)
    if (bindings.some((b) => b?.i18nMessage) !== null) {
        unit.create.push(ir.createI18nAttributesOp(unit.job.allocateXrefId(), new ir.SlotHandle(), op.xref));
    }
}
/**
 * Helper to ingest an individual binding on a template, either an explicit `ng-template`, or an
 * implicit template created via structural directive.
 *
 * Bindings on templates are *extremely* tricky. I have tried to isolate all of the confusing edge
 * cases into this function, and to comment it well to document the behavior.
 *
 * Some of this behavior is intuitively incorrect, and we should consider changing it in the future.
 *
 * @param view The compilation unit for the view containing the template.
 * @param xref The xref of the template op.
 * @param type The binding type, according to the parser. This is fairly reasonable, e.g. both
 *     dynamic and static attributes have e.BindingType.Attribute.
 * @param name The binding's name.
 * @param value The bindings's value, which will either be an input AST expression, or a string
 *     literal. Note that the input AST expression may or may not be const -- it will only be a
 *     string literal if the parser considered it a text binding.
 * @param unit If the binding has a unit (e.g. `px` for style bindings), then this is the unit.
 * @param securityContext The security context of the binding.
 * @param isStructuralTemplateAttribute Whether this binding actually applies to the structural
 *     ng-template. For example, an `ngFor` would actually apply to the structural template. (Most
 *     bindings on structural elements target the inner element, not the template.)
 * @param templateKind Whether this is an explicit `ng-template` or an implicit template created by
 *     a structural directive. This should never be a block template.
 * @param i18nMessage The i18n metadata for the binding, if any.
 * @param sourceSpan The source span of the binding.
 * @returns An IR binding op, or null if the binding should be skipped.
 */
function createTemplateBinding(view, xref, type, name, value, unit, securityContext, isStructuralTemplateAttribute, templateKind, i18nMessage, sourceSpan) {
    const isTextBinding = typeof value === 'string';
    // If this is a structural template, then several kinds of bindings should not result in an
    // update instruction.
    if (templateKind === ir.TemplateKind.Structural) {
        if (!isStructuralTemplateAttribute) {
            switch (type) {
                case e.BindingType.Property:
                case e.BindingType.Class:
                case e.BindingType.Style:
                    // Because this binding doesn't really target the ng-template, it must be a binding on an
                    // inner node of a structural template. We can't skip it entirely, because we still need
                    // it on the ng-template's consts (e.g. for the purposes of directive matching). However,
                    // we should not generate an update instruction for it.
                    return ir.createExtractedAttributeOp(xref, ir.BindingKind.Property, null, name, null, null, i18nMessage, securityContext);
                case e.BindingType.TwoWay:
                    return ir.createExtractedAttributeOp(xref, ir.BindingKind.TwoWayProperty, null, name, null, null, i18nMessage, securityContext);
            }
        }
        if (!isTextBinding && (type === e.BindingType.Attribute || type === e.BindingType.Animation)) {
            // Again, this binding doesn't really target the ng-template; it actually targets the element
            // inside the structural template. In the case of non-text attribute or animation bindings,
            // the binding doesn't even show up on the ng-template const array, so we just skip it
            // entirely.
            return null;
        }
    }
    let bindingType = BINDING_KINDS.get(type);
    if (templateKind === ir.TemplateKind.NgTemplate) {
        // We know we are dealing with bindings directly on an explicit ng-template.
        // Static attribute bindings should be collected into the const array as k/v pairs. Property
        // bindings should result in a `property` instruction, and `AttributeMarker.Bindings` const
        // entries.
        //
        // The difficulty is with dynamic attribute, style, and class bindings. These don't really make
        // sense on an `ng-template` and should probably be parser errors. However,
        // TemplateDefinitionBuilder generates `property` instructions for them, and so we do that as
        // well.
        //
        // Note that we do have a slight behavior difference with TemplateDefinitionBuilder: although
        // TDB emits `property` instructions for dynamic attributes, styles, and classes, only styles
        // and classes also get const collected into the `AttributeMarker.Bindings` field. Dynamic
        // attribute bindings are missing from the consts entirely. We choose to emit them into the
        // consts field anyway, to avoid creating special cases for something so arcane and nonsensical.
        if (type === e.BindingType.Class ||
            type === e.BindingType.Style ||
            (type === e.BindingType.Attribute && !isTextBinding)) {
            // TODO: These cases should be parse errors.
            bindingType = ir.BindingKind.Property;
        }
    }
    return ir.createBindingOp(xref, bindingType, name, convertAstWithInterpolation(view.job, value, i18nMessage), unit, securityContext, isTextBinding, isStructuralTemplateAttribute, templateKind, i18nMessage, sourceSpan);
}
function makeListenerHandlerOps(unit, handler, handlerSpan) {
    handler = astOf(handler);
    const handlerOps = new Array();
    let handlerExprs = handler instanceof e.Chain ? handler.expressions : [handler];
    if (handlerExprs.length === 0) {
        throw new Error('Expected listener to have non-empty expression list.');
    }
    const expressions = handlerExprs.map((expr) => convertAst(expr, unit.job, handlerSpan));
    const returnExpr = expressions.pop();
    handlerOps.push(...expressions.map((e) => ir.createStatementOp(new o.ExpressionStatement(e, e.sourceSpan))));
    handlerOps.push(ir.createStatementOp(new o.ReturnStatement(returnExpr, returnExpr.sourceSpan)));
    return handlerOps;
}
function makeTwoWayListenerHandlerOps(unit, handler, handlerSpan) {
    handler = astOf(handler);
    const handlerOps = new Array();
    if (handler instanceof e.Chain) {
        if (handler.expressions.length === 1) {
            handler = handler.expressions[0];
        }
        else {
            // This is validated during parsing already, but we do it here just in case.
            throw new Error('Expected two-way listener to have a single expression.');
        }
    }
    const handlerExpr = convertAst(handler, unit.job, handlerSpan);
    const eventReference = new ir.LexicalReadExpr('$event');
    const twoWaySetExpr = new ir.TwoWayBindingSetExpr(handlerExpr, eventReference);
    handlerOps.push(ir.createStatementOp(new o.ExpressionStatement(twoWaySetExpr)));
    handlerOps.push(ir.createStatementOp(new o.ReturnStatement(eventReference)));
    return handlerOps;
}
function astOf(ast) {
    return ast instanceof e.ASTWithSource ? ast.ast : ast;
}
/**
 * Process all of the local references on an element-like structure in the template AST and
 * convert them to their IR representation.
 */
function ingestReferences(op, element) {
    assertIsArray(op.localRefs);
    for (const { name, value } of element.references) {
        op.localRefs.push({
            name,
            target: value,
        });
    }
}
/**
 * Assert that the given value is an array.
 */
function assertIsArray(value) {
    if (!Array.isArray(value)) {
        throw new Error(`AssertionError: expected an array`);
    }
}
/**
 * Creates an absolute `ParseSourceSpan` from the relative `ParseSpan`.
 *
 * `ParseSpan` objects are relative to the start of the expression.
 * This method converts these to full `ParseSourceSpan` objects that
 * show where the span is within the overall source file.
 *
 * @param span the relative span to convert.
 * @param baseSourceSpan a span corresponding to the base of the expression tree.
 * @returns a `ParseSourceSpan` for the given span or null if no `baseSourceSpan` was provided.
 */
function convertSourceSpan(span, baseSourceSpan) {
    if (baseSourceSpan === null) {
        return null;
    }
    const start = baseSourceSpan.start.moveBy(span.start);
    const end = baseSourceSpan.start.moveBy(span.end);
    const fullStart = baseSourceSpan.fullStart.moveBy(span.start);
    return new ParseSourceSpan(start, end, fullStart);
}
/**
 * With the directive-based control flow users were able to conditionally project content using
 * the `*` syntax. E.g. `<div *ngIf="expr" projectMe></div>` will be projected into
 * `<ng-content select="[projectMe]"/>`, because the attributes and tag name from the `div` are
 * copied to the template via the template creation instruction. With `@if` and `@for` that is
 * not the case, because the conditional is placed *around* elements, rather than *on* them.
 * The result is that content projection won't work in the same way if a user converts from
 * `*ngIf` to `@if`.
 *
 * This function aims to cover the most common case by doing the same copying when a control flow
 * node has *one and only one* root element or template node.
 *
 * This approach comes with some caveats:
 * 1. As soon as any other node is added to the root, the copying behavior won't work anymore.
 *    A diagnostic will be added to flag cases like this and to explain how to work around it.
 * 2. If `preserveWhitespaces` is enabled, it's very likely that indentation will break this
 *    workaround, because it'll include an additional text node as the first child. We can work
 *    around it here, but in a discussion it was decided not to, because the user explicitly opted
 *    into preserving the whitespace and we would have to drop it from the generated code.
 *    The diagnostic mentioned point #1 will flag such cases to users.
 *
 * @returns Tag name to be used for the control flow template.
 */
function ingestControlFlowInsertionPoint(unit, xref, node) {
    let root = null;
    for (const child of node.children) {
        // Skip over comment nodes.
        if (child instanceof t.Comment) {
            continue;
        }
        // We can only infer the tag name/attributes if there's a single root node.
        if (root !== null) {
            return null;
        }
        // Root nodes can only elements or templates with a tag name (e.g. `<div *foo></div>`).
        if (child instanceof t.Element || (child instanceof t.Template && child.tagName !== null)) {
            root = child;
        }
    }
    // If we've found a single root node, its tag name and attributes can be
    // copied to the surrounding template to be used for content projection.
    if (root !== null) {
        // Collect the static attributes for content projection purposes.
        for (const attr of root.attributes) {
            const securityContext = domSchema.securityContext(NG_TEMPLATE_TAG_NAME, attr.name, true);
            unit.update.push(ir.createBindingOp(xref, ir.BindingKind.Attribute, attr.name, o.literal(attr.value), null, securityContext, true, false, null, asMessage(attr.i18n), attr.sourceSpan));
        }
        // Also collect the inputs since they participate in content projection as well.
        // Note that TDB used to collect the outputs as well, but it wasn't passing them into
        // the template instruction. Here we just don't collect them.
        for (const attr of root.inputs) {
            if (attr.type !== e.BindingType.Animation && attr.type !== e.BindingType.Attribute) {
                const securityContext = domSchema.securityContext(NG_TEMPLATE_TAG_NAME, attr.name, true);
                unit.create.push(ir.createExtractedAttributeOp(xref, ir.BindingKind.Property, null, attr.name, null, null, null, securityContext));
            }
        }
        const tagName = root instanceof t.Element ? root.name : root.tagName;
        // Don't pass along `ng-template` tag name since it enables directive matching.
        return tagName === NG_TEMPLATE_TAG_NAME ? null : tagName;
    }
    return null;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5nZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3RlbXBsYXRlL3BpcGVsaW5lL3NyYy9pbmdlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBR0gsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUM5QyxPQUFPLEtBQUssQ0FBQyxNQUFNLGdDQUFnQyxDQUFDO0FBQ3BELE9BQU8sS0FBSyxJQUFJLE1BQU0sd0JBQXdCLENBQUM7QUFDL0MsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLHlCQUF5QixDQUFDO0FBQ3BELE9BQU8sS0FBSyxDQUFDLE1BQU0sNEJBQTRCLENBQUM7QUFDaEQsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ3BELE9BQU8sS0FBSyxDQUFDLE1BQU0seUJBQXlCLENBQUM7QUFFN0MsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0saUNBQWlDLENBQUM7QUFDbkUsT0FBTyxFQUFDLHdCQUF3QixFQUFDLE1BQU0sNkNBQTZDLENBQUM7QUFFckYsT0FBTyxLQUFLLEVBQUUsTUFBTSxPQUFPLENBQUM7QUFFNUIsT0FBTyxFQUVMLHVCQUF1QixFQUN2Qix5QkFBeUIsR0FHMUIsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLGdCQUFnQixFQUFFLGVBQWUsRUFBRSxtQkFBbUIsRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUVwRixNQUFNLGlCQUFpQixHQUFHLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyx5QkFBeUIsQ0FBQztBQUV6RSx1REFBdUQ7QUFDdkQsTUFBTSxTQUFTLEdBQUcsSUFBSSx3QkFBd0IsRUFBRSxDQUFDO0FBRWpELHlDQUF5QztBQUN6QyxNQUFNLG9CQUFvQixHQUFHLGFBQWEsQ0FBQztBQUUzQyxNQUFNLFVBQVUsY0FBYyxDQUFDLElBQW9CO0lBQ2pELE9BQU8sSUFBSSxZQUFZLElBQUksQ0FBQyxPQUFPLENBQUM7QUFDdEMsQ0FBQztBQUVELE1BQU0sVUFBVSxlQUFlLENBQUMsSUFBb0I7SUFDbEQsT0FBTyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFlBQVksSUFBSSxDQUFDLEdBQUcsQ0FBQztBQUM5RixDQUFDO0FBRUQ7Ozs7R0FJRztBQUNILE1BQU0sVUFBVSxlQUFlLENBQzdCLGFBQXFCLEVBQ3JCLFFBQWtCLEVBQ2xCLFlBQTBCLEVBQzFCLHVCQUErQixFQUMvQixrQkFBMkIsRUFDM0IsU0FBbUMsRUFDbkMsbUJBQXlDO0lBRXpDLE1BQU0sR0FBRyxHQUFHLElBQUksdUJBQXVCLENBQ3JDLGFBQWEsRUFDYixZQUFZLEVBQ1osaUJBQWlCLEVBQ2pCLHVCQUF1QixFQUN2QixrQkFBa0IsRUFDbEIsU0FBUyxFQUNULG1CQUFtQixDQUNwQixDQUFDO0lBQ0YsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDaEMsT0FBTyxHQUFHLENBQUM7QUFDYixDQUFDO0FBVUQ7OztHQUdHO0FBQ0gsTUFBTSxVQUFVLGlCQUFpQixDQUMvQixLQUF1QixFQUN2QixhQUE0QixFQUM1QixZQUEwQjtJQUUxQixNQUFNLEdBQUcsR0FBRyxJQUFJLHlCQUF5QixDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsWUFBWSxFQUFFLGlCQUFpQixDQUFDLENBQUM7SUFDaEcsS0FBSyxNQUFNLFFBQVEsSUFBSSxLQUFLLENBQUMsVUFBVSxJQUFJLEVBQUUsRUFBRSxDQUFDO1FBQzlDLElBQUksV0FBVyxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDO1FBQzFDLHFEQUFxRDtRQUNyRCxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7WUFDdEMsUUFBUSxDQUFDLElBQUksR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDeEQsV0FBVyxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDO1FBQ3pDLENBQUM7UUFDRCxJQUFJLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUN6QixXQUFXLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUM7UUFDekMsQ0FBQztRQUNELE1BQU0sZ0JBQWdCLEdBQUcsYUFBYTthQUNuQyw0QkFBNEIsQ0FDM0IsS0FBSyxDQUFDLGlCQUFpQixFQUN2QixRQUFRLENBQUMsSUFBSSxFQUNiLFdBQVcsS0FBSyxFQUFFLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FDekM7YUFDQSxNQUFNLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLE9BQU8sS0FBSyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDekQsa0JBQWtCLENBQUMsR0FBRyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztJQUNuRSxDQUFDO0lBQ0QsS0FBSyxNQUFNLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDO1FBQ2xFLE1BQU0sZ0JBQWdCLEdBQUcsYUFBYTthQUNuQyw0QkFBNEIsQ0FBQyxLQUFLLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQzthQUNqRSxNQUFNLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLE9BQU8sS0FBSyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDekQsbUJBQW1CLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztJQUN6RCxDQUFDO0lBQ0QsS0FBSyxNQUFNLEtBQUssSUFBSSxLQUFLLENBQUMsTUFBTSxJQUFJLEVBQUUsRUFBRSxDQUFDO1FBQ3ZDLGVBQWUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUNELE9BQU8sR0FBRyxDQUFDO0FBQ2IsQ0FBQztBQUVELGdHQUFnRztBQUNoRyxvRkFBb0Y7QUFDcEYsTUFBTSxVQUFVLGtCQUFrQixDQUNoQyxHQUE4QixFQUM5QixRQUEwQixFQUMxQixXQUEyQixFQUMzQixnQkFBbUM7SUFFbkMsSUFBSSxVQUEyQyxDQUFDO0lBQ2hELE1BQU0sR0FBRyxHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDO0lBQ3BDLElBQUksR0FBRyxZQUFZLENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUNuQyxVQUFVLEdBQUcsSUFBSSxFQUFFLENBQUMsYUFBYSxDQUMvQixHQUFHLENBQUMsT0FBTyxFQUNYLEdBQUcsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsRUFDekUsRUFBRSxDQUNILENBQUM7SUFDSixDQUFDO1NBQU0sQ0FBQztRQUNOLFVBQVUsR0FBRyxVQUFVLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDekQsQ0FBQztJQUNELEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FDbEIsRUFBRSxDQUFDLGVBQWUsQ0FDaEIsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQ2IsV0FBVyxFQUNYLFFBQVEsQ0FBQyxJQUFJLEVBQ2IsVUFBVSxFQUNWLElBQUksRUFDSixnQkFBZ0IsRUFDaEIsS0FBSyxFQUNMLEtBQUssRUFDTCxJQUFJO0lBQ0osbURBQW1ELENBQUMsSUFBSSxFQUN4RCxRQUFRLENBQUMsVUFBVSxDQUNwQixDQUNGLENBQUM7QUFDSixDQUFDO0FBRUQsTUFBTSxVQUFVLG1CQUFtQixDQUNqQyxHQUE4QixFQUM5QixJQUFZLEVBQ1osS0FBbUIsRUFDbkIsZ0JBQW1DO0lBRW5DLE1BQU0sV0FBVyxHQUFHLEVBQUUsQ0FBQyxlQUFlLENBQ3BDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUNiLEVBQUUsQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUN4QixJQUFJLEVBQ0osS0FBSyxFQUNMLElBQUksRUFDSixnQkFBZ0I7SUFDaEI7Z0NBQzRCO0lBQzVCLElBQUksRUFDSixLQUFLLEVBQ0wsSUFBSTtJQUNKLFVBQVUsQ0FBQyxJQUFJO0lBQ2YseUJBQXlCLENBQUMsS0FBSyxDQUFDLFVBQVcsQ0FDNUMsQ0FBQztJQUNGLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNwQyxDQUFDO0FBRUQsTUFBTSxVQUFVLGVBQWUsQ0FBQyxHQUE4QixFQUFFLEtBQW9CO0lBQ2xGLE1BQU0sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLEdBQ25CLEtBQUssQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLGVBQWUsQ0FBQyxTQUFTO1FBQ3hDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsYUFBYSxDQUFDO1FBQzdCLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDbEMsTUFBTSxZQUFZLEdBQUcsRUFBRSxDQUFDLGdCQUFnQixDQUN0QyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksRUFDYixJQUFJLEVBQUUsQ0FBQyxVQUFVLEVBQUUsRUFDbkIsS0FBSyxDQUFDLElBQUksRUFDVixJQUFJLEVBQ0osc0JBQXNCLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxXQUFXLENBQUMsRUFDbEUsS0FBSyxFQUNMLE1BQU0sRUFDTixJQUFJLEVBQ0osS0FBSyxDQUFDLFVBQVUsQ0FDakIsQ0FBQztJQUNGLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNyQyxDQUFDO0FBRUQ7O0dBRUc7QUFDSCxTQUFTLFdBQVcsQ0FBQyxJQUF5QixFQUFFLFFBQWtCO0lBQ2hFLEtBQUssTUFBTSxJQUFJLElBQUksUUFBUSxFQUFFLENBQUM7UUFDNUIsSUFBSSxJQUFJLFlBQVksQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQzlCLGFBQWEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDNUIsQ0FBQzthQUFNLElBQUksSUFBSSxZQUFZLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUN0QyxjQUFjLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzdCLENBQUM7YUFBTSxJQUFJLElBQUksWUFBWSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDckMsYUFBYSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM1QixDQUFDO2FBQU0sSUFBSSxJQUFJLFlBQVksQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2xDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQy9CLENBQUM7YUFBTSxJQUFJLElBQUksWUFBWSxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDdkMsZUFBZSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDcEMsQ0FBQzthQUFNLElBQUksSUFBSSxZQUFZLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNyQyxhQUFhLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzVCLENBQUM7YUFBTSxJQUFJLElBQUksWUFBWSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDekMsaUJBQWlCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2hDLENBQUM7YUFBTSxJQUFJLElBQUksWUFBWSxDQUFDLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDM0MsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQy9CLENBQUM7YUFBTSxJQUFJLElBQUksWUFBWSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDakMsU0FBUyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN4QixDQUFDO2FBQU0sSUFBSSxJQUFJLFlBQVksQ0FBQyxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQzFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDN0IsQ0FBQzthQUFNLElBQUksSUFBSSxZQUFZLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUM1QyxvQkFBb0IsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDbkMsQ0FBQzthQUFNLENBQUM7WUFDTixNQUFNLElBQUksS0FBSyxDQUFDLDhCQUE4QixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7UUFDekUsQ0FBQztJQUNILENBQUM7QUFDSCxDQUFDO0FBRUQ7O0dBRUc7QUFDSCxTQUFTLGFBQWEsQ0FBQyxJQUF5QixFQUFFLE9BQWtCO0lBQ2xFLElBQ0UsT0FBTyxDQUFDLElBQUksS0FBSyxTQUFTO1FBQzFCLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxZQUFZLElBQUksQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDLElBQUksWUFBWSxJQUFJLENBQUMsY0FBYyxDQUFDLEVBQ3RGLENBQUM7UUFDRCxNQUFNLEtBQUssQ0FBQyw2Q0FBNkMsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUM1RixDQUFDO0lBRUQsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsQ0FBQztJQUVyQyxNQUFNLENBQUMsWUFBWSxFQUFFLFdBQVcsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7SUFFOUQsTUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDLG9CQUFvQixDQUNyQyxXQUFXLEVBQ1gsRUFBRSxFQUNGLGVBQWUsQ0FBQyxZQUFZLENBQUMsRUFDN0IsT0FBTyxDQUFDLElBQUksWUFBWSxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQ3RFLE9BQU8sQ0FBQyxlQUFlLEVBQ3ZCLE9BQU8sQ0FBQyxVQUFVLENBQ25CLENBQUM7SUFDRixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUUxQixxQkFBcUIsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzlDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztJQUVuQywwRkFBMEY7SUFDMUYsSUFBSSxXQUFXLEdBQXFCLElBQUksQ0FBQztJQUN6QyxJQUFJLE9BQU8sQ0FBQyxJQUFJLFlBQVksSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3pDLFdBQVcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ3hDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUNkLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsT0FBTyxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUNwRixDQUFDO0lBQ0osQ0FBQztJQUVELFdBQVcsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRXBDLGtHQUFrRztJQUNsRyxnR0FBZ0c7SUFDaEcsOEZBQThGO0lBQzlGLDhGQUE4RjtJQUM5Rix1REFBdUQ7SUFDdkQsTUFBTSxLQUFLLEdBQUcsRUFBRSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsYUFBYSxJQUFJLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUMxRixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUV4QiwyRkFBMkY7SUFDM0YsSUFBSSxXQUFXLEtBQUssSUFBSSxFQUFFLENBQUM7UUFDekIsRUFBRSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQ3BCLEVBQUUsQ0FBQyxlQUFlLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxhQUFhLElBQUksT0FBTyxDQUFDLGVBQWUsQ0FBQyxFQUNqRixLQUFLLENBQ04sQ0FBQztJQUNKLENBQUM7QUFDSCxDQUFDO0FBRUQ7O0dBRUc7QUFDSCxTQUFTLGNBQWMsQ0FBQyxJQUF5QixFQUFFLElBQWdCO0lBQ2pFLElBQ0UsSUFBSSxDQUFDLElBQUksS0FBSyxTQUFTO1FBQ3ZCLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxZQUFZLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLElBQUksWUFBWSxJQUFJLENBQUMsY0FBYyxDQUFDLEVBQ2hGLENBQUM7UUFDRCxNQUFNLEtBQUssQ0FBQyw4Q0FBOEMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUMxRixDQUFDO0lBRUQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBRW5ELElBQUksdUJBQXVCLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUMzQyxJQUFJLGVBQWUsR0FBa0IsRUFBRSxDQUFDO0lBQ3hDLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2pCLENBQUMsZUFBZSxFQUFFLHVCQUF1QixDQUFDLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN6RSxDQUFDO0lBRUQsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLElBQUksWUFBWSxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7SUFDekYsTUFBTSxTQUFTLEdBQUcsZUFBZSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQ25ELE1BQU0sa0JBQWtCLEdBQ3RCLHVCQUF1QixLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQyx1QkFBdUIsRUFBRSxTQUFTLENBQUMsQ0FBQztJQUNsRyxNQUFNLFlBQVksR0FBRyxlQUFlLENBQUMsSUFBSSxDQUFDO1FBQ3hDLENBQUMsQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLFVBQVU7UUFDNUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDO0lBQy9CLE1BQU0sVUFBVSxHQUFHLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FDcEMsU0FBUyxDQUFDLElBQUksRUFDZCxZQUFZLEVBQ1osdUJBQXVCLEVBQ3ZCLGtCQUFrQixFQUNsQixTQUFTLEVBQ1QsZUFBZSxFQUNmLElBQUksQ0FBQyxlQUFlLEVBQ3BCLElBQUksQ0FBQyxVQUFVLENBQ2hCLENBQUM7SUFDRixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUU3QixzQkFBc0IsQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxZQUFZLENBQUMsQ0FBQztJQUM3RCxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDbkMsV0FBVyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFFdEMsS0FBSyxNQUFNLEVBQUMsSUFBSSxFQUFFLEtBQUssRUFBQyxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUMzQyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxLQUFLLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQzNFLENBQUM7SUFFRCxpR0FBaUc7SUFDakcsaUdBQWlHO0lBQ2pHLCtDQUErQztJQUMvQyxJQUFJLFlBQVksS0FBSyxFQUFFLENBQUMsWUFBWSxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsSUFBSSxZQUFZLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNyRixNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ3JDLEVBQUUsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUNuQixFQUFFLENBQUMsaUJBQWlCLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsRUFDcEUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQ3RCLENBQUM7UUFDRixFQUFFLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FDcEIsRUFBRSxDQUFDLGVBQWUsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLGFBQWEsSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLEVBQ2xFLFNBQVMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUN0QixDQUFDO0lBQ0osQ0FBQztBQUNILENBQUM7QUFFRDs7R0FFRztBQUNILFNBQVMsYUFBYSxDQUFDLElBQXlCLEVBQUUsT0FBa0I7SUFDbEUsSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLFNBQVMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksWUFBWSxJQUFJLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQztRQUNqRixNQUFNLEtBQUssQ0FBQyw2Q0FBNkMsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUM1RixDQUFDO0lBRUQsSUFBSSxZQUFZLEdBQStCLElBQUksQ0FBQztJQUVwRCxzRkFBc0Y7SUFDdEYsdUZBQXVGO0lBQ3ZGLDhCQUE4QjtJQUM5QixJQUNFLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUNuQixDQUFDLEtBQUssRUFBRSxFQUFFLENBQ1IsQ0FBQyxDQUFDLEtBQUssWUFBWSxDQUFDLENBQUMsT0FBTyxDQUFDO1FBQzdCLENBQUMsQ0FBQyxDQUFDLEtBQUssWUFBWSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQ2hFLEVBQ0QsQ0FBQztRQUNELFlBQVksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDaEQsV0FBVyxDQUFDLFlBQVksRUFBRSxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUVELE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLENBQUM7SUFDckMsTUFBTSxFQUFFLEdBQUcsRUFBRSxDQUFDLGtCQUFrQixDQUM5QixFQUFFLEVBQ0YsT0FBTyxDQUFDLFFBQVEsRUFDaEIsT0FBTyxDQUFDLElBQUksRUFDWixZQUFZLEVBQUUsSUFBSSxJQUFJLElBQUksRUFDMUIsT0FBTyxDQUFDLFVBQVUsQ0FDbkIsQ0FBQztJQUNGLEtBQUssTUFBTSxJQUFJLElBQUksT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ3RDLE1BQU0sZUFBZSxHQUFHLFNBQVMsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2pGLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUNkLEVBQUUsQ0FBQyxlQUFlLENBQ2hCLEVBQUUsQ0FBQyxJQUFJLEVBQ1AsRUFBRSxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQ3hCLElBQUksQ0FBQyxJQUFJLEVBQ1QsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQ3JCLElBQUksRUFDSixlQUFlLEVBQ2YsSUFBSSxFQUNKLEtBQUssRUFDTCxJQUFJLEVBQ0osU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFDcEIsSUFBSSxDQUFDLFVBQVUsQ0FDaEIsQ0FDRixDQUFDO0lBQ0osQ0FBQztJQUNELElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3ZCLENBQUM7QUFFRDs7R0FFRztBQUNILFNBQVMsVUFBVSxDQUFDLElBQXlCLEVBQUUsSUFBWSxFQUFFLGNBQTZCO0lBQ3hGLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUNkLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLGNBQWMsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQ3hGLENBQUM7QUFDSixDQUFDO0FBRUQ7O0dBRUc7QUFDSCxTQUFTLGVBQWUsQ0FDdEIsSUFBeUIsRUFDekIsSUFBaUIsRUFDakIsY0FBNkI7SUFFN0IsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztJQUN2QixJQUFJLEtBQUssWUFBWSxDQUFDLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDckMsS0FBSyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUM7SUFDcEIsQ0FBQztJQUNELElBQUksQ0FBQyxDQUFDLEtBQUssWUFBWSxDQUFDLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQztRQUN4QyxNQUFNLElBQUksS0FBSyxDQUNiLGtFQUFrRSxLQUFLLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxDQUMzRixDQUFDO0lBQ0osQ0FBQztJQUNELElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxTQUFTLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLFlBQVksSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUM7UUFDdEUsTUFBTSxLQUFLLENBQ1Qsd0RBQXdELElBQUksQ0FBQyxJQUFJLEVBQUUsV0FBVyxDQUFDLElBQUksRUFBRSxDQUN0RixDQUFDO0lBQ0osQ0FBQztJQUVELE1BQU0sZ0JBQWdCLEdBQ3BCLElBQUksQ0FBQyxJQUFJLFlBQVksSUFBSSxDQUFDLFNBQVM7UUFDakMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUTthQUNmLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBNEIsRUFBRSxDQUFDLElBQUksWUFBWSxJQUFJLENBQUMsV0FBVyxDQUFDO2FBQzVFLEdBQUcsQ0FBQyxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQztRQUMzQyxDQUFDLENBQUMsRUFBRSxDQUFDO0lBQ1QsSUFBSSxnQkFBZ0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLGdCQUFnQixDQUFDLE1BQU0sS0FBSyxLQUFLLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3hGLE1BQU0sS0FBSyxDQUNULDJDQUEyQyxLQUFLLENBQUMsV0FBVyxDQUFDLE1BQU0sd0JBQXdCLEtBQUssQ0FBQyxXQUFXLENBQUMsTUFBTSxjQUFjLENBQ2xJLENBQUM7SUFDSixDQUFDO0lBRUQsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsQ0FBQztJQUMzQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxFQUFFLEVBQUUsY0FBYyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO0lBQ2pGLHdGQUF3RjtJQUN4Riw4REFBOEQ7SUFDOUQsNEVBQTRFO0lBQzVFLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7SUFDdkUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQ2QsRUFBRSxDQUFDLHVCQUF1QixDQUN4QixRQUFRLEVBQ1IsSUFBSSxFQUFFLENBQUMsYUFBYSxDQUNsQixLQUFLLENBQUMsT0FBTyxFQUNiLEtBQUssQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsY0FBYyxDQUFDLENBQUMsRUFDM0UsZ0JBQWdCLENBQ2pCLEVBQ0QsSUFBSSxDQUFDLFVBQVUsQ0FDaEIsQ0FDRixDQUFDO0FBQ0osQ0FBQztBQUVEOztHQUVHO0FBQ0gsU0FBUyxhQUFhLENBQUMsSUFBeUIsRUFBRSxPQUFrQjtJQUNsRSxJQUFJLFNBQVMsR0FBcUIsSUFBSSxDQUFDO0lBQ3ZDLElBQUksVUFBVSxHQUFrQyxFQUFFLENBQUM7SUFDbkQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDakQsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNuQyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDL0MsTUFBTSxPQUFPLEdBQUcsK0JBQStCLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFFMUUsSUFBSSxNQUFNLENBQUMsZUFBZSxLQUFLLElBQUksRUFBRSxDQUFDO1lBQ3BDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3RFLENBQUM7UUFFRCxJQUFJLGNBQWMsR0FBc0MsU0FBUyxDQUFDO1FBQ2xFLElBQUksTUFBTSxDQUFDLElBQUksS0FBSyxTQUFTLEVBQUUsQ0FBQztZQUM5QixJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxZQUFZLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLENBQUM7Z0JBQ3BELE1BQU0sS0FBSyxDQUFDLDhDQUE4QyxNQUFNLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQzdGLENBQUM7WUFDRCxjQUFjLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztRQUMvQixDQUFDO1FBRUQsTUFBTSxVQUFVLEdBQUcsRUFBRSxDQUFDLGdCQUFnQixDQUNwQyxLQUFLLENBQUMsSUFBSSxFQUNWLEVBQUUsQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUNyQixPQUFPLEVBQ1AsYUFBYSxFQUNiLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUNqQixjQUFjLEVBQ2QsTUFBTSxDQUFDLGVBQWUsRUFDdEIsTUFBTSxDQUFDLFVBQVUsQ0FDbEIsQ0FBQztRQUNGLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRTdCLElBQUksU0FBUyxLQUFLLElBQUksRUFBRSxDQUFDO1lBQ3ZCLFNBQVMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO1FBQ3pCLENBQUM7UUFFRCxNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDMUYsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLEVBQUUsQ0FBQyxtQkFBbUIsQ0FDcEQsUUFBUSxFQUNSLFVBQVUsQ0FBQyxJQUFJLEVBQ2YsVUFBVSxDQUFDLE1BQU0sRUFDakIsTUFBTSxDQUFDLGVBQWUsQ0FDdkIsQ0FBQztRQUNGLFVBQVUsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUNyQyxXQUFXLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUN0QyxDQUFDO0lBQ0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLG1CQUFtQixDQUFDLFNBQVUsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO0FBQzdGLENBQUM7QUFFRDs7R0FFRztBQUNILFNBQVMsaUJBQWlCLENBQUMsSUFBeUIsRUFBRSxXQUEwQjtJQUM5RSxnRUFBZ0U7SUFDaEUsSUFBSSxXQUFXLENBQUMsS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUNuQyxPQUFPO0lBQ1QsQ0FBQztJQUVELElBQUksU0FBUyxHQUFxQixJQUFJLENBQUM7SUFDdkMsSUFBSSxVQUFVLEdBQWtDLEVBQUUsQ0FBQztJQUNuRCxLQUFLLE1BQU0sVUFBVSxJQUFJLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUMzQyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDL0MsTUFBTSxPQUFPLEdBQUcsK0JBQStCLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDOUUsSUFBSSxrQkFBa0IsR0FBc0MsU0FBUyxDQUFDO1FBQ3RFLElBQUksVUFBVSxDQUFDLElBQUksS0FBSyxTQUFTLEVBQUUsQ0FBQztZQUNsQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxZQUFZLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLENBQUM7Z0JBQ3hELE1BQU0sS0FBSyxDQUNULGtEQUFrRCxVQUFVLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FDdEYsQ0FBQztZQUNKLENBQUM7WUFDRCxrQkFBa0IsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDO1FBQ3ZDLENBQUM7UUFDRCxNQUFNLFVBQVUsR0FBRyxFQUFFLENBQUMsZ0JBQWdCLENBQ3BDLEtBQUssQ0FBQyxJQUFJLEVBQ1YsRUFBRSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQ3JCLE9BQU8sRUFDUCxNQUFNLEVBQ04sRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQ2pCLGtCQUFrQixFQUNsQixVQUFVLENBQUMsZUFBZSxFQUMxQixVQUFVLENBQUMsVUFBVSxDQUN0QixDQUFDO1FBQ0YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDN0IsSUFBSSxTQUFTLEtBQUssSUFBSSxFQUFFLENBQUM7WUFDdkIsU0FBUyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUM7UUFDekIsQ0FBQztRQUNELE1BQU0sUUFBUSxHQUFHLFVBQVUsQ0FBQyxVQUFVO1lBQ3BDLENBQUMsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLFdBQVcsQ0FBQyxlQUFlLENBQUM7WUFDMUUsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUNULE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxFQUFFLENBQUMsbUJBQW1CLENBQ3BELFFBQVEsRUFDUixVQUFVLENBQUMsSUFBSSxFQUNmLFVBQVUsQ0FBQyxNQUFNLENBQ2xCLENBQUM7UUFDRixVQUFVLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFDckMsV0FBVyxDQUFDLEtBQUssRUFBRSxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUNELElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUNkLEVBQUUsQ0FBQyxtQkFBbUIsQ0FDcEIsU0FBVSxFQUNWLFVBQVUsQ0FBQyxXQUFXLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEVBQ2xELFVBQVUsRUFDVixXQUFXLENBQUMsVUFBVSxDQUN2QixDQUNGLENBQUM7QUFDSixDQUFDO0FBRUQsU0FBUyxlQUFlLENBQ3RCLElBQXlCLEVBQ3pCLE1BQWMsRUFDZCxRQUFtQyxFQUNuQyxRQUFtQixFQUNuQixVQUE0QjtJQUU1QixJQUFJLFFBQVEsS0FBSyxTQUFTLElBQUksQ0FBQyxDQUFDLFFBQVEsWUFBWSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxDQUFDO1FBQzNFLE1BQU0sS0FBSyxDQUFDLDhDQUE4QyxDQUFDLENBQUM7SUFDOUQsQ0FBQztJQUNELElBQUksUUFBUSxLQUFLLFNBQVMsRUFBRSxDQUFDO1FBQzNCLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUNELE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN2RCxXQUFXLENBQUMsYUFBYSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3JDLE1BQU0sVUFBVSxHQUFHLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FDcEMsYUFBYSxDQUFDLElBQUksRUFDbEIsRUFBRSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQ3JCLElBQUksRUFDSixRQUFRLE1BQU0sRUFBRSxFQUNoQixFQUFFLENBQUMsU0FBUyxDQUFDLElBQUksRUFDakIsUUFBUSxFQUNSLFVBQVcsRUFDWCxVQUFXLENBQ1osQ0FBQztJQUNGLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQzdCLE9BQU8sVUFBVSxDQUFDO0FBQ3BCLENBQUM7QUFFRCxTQUFTLGdCQUFnQixDQUFDLElBQXlCLEVBQUUsVUFBMkI7SUFDOUUsSUFBSSxhQUFhLEdBQXdCLElBQUksQ0FBQztJQUU5QyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksNENBQW9DLEVBQUUsQ0FBQztRQUNoRSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDO1lBQy9DLE1BQU0sSUFBSSxLQUFLLENBQ2IsOEVBQThFLENBQy9FLENBQUM7UUFDSixDQUFDO1FBQ0QsYUFBYSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLElBQUksSUFBSSxDQUFDO0lBQ3BFLENBQUM7SUFFRCx3REFBd0Q7SUFDeEQsTUFBTSxJQUFJLEdBQUcsZUFBZSxDQUMxQixJQUFJLEVBQ0osRUFBRSxFQUNGLFVBQVUsQ0FBQyxJQUFJLEVBQ2YsVUFBVSxDQUFDLFFBQVEsRUFDbkIsVUFBVSxDQUFDLFVBQVUsQ0FDckIsQ0FBQztJQUNILE1BQU0sT0FBTyxHQUFHLGVBQWUsQ0FDN0IsSUFBSSxFQUNKLFNBQVMsRUFDVCxVQUFVLENBQUMsT0FBTyxFQUFFLElBQUksRUFDeEIsVUFBVSxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQzVCLFVBQVUsQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUMvQixDQUFDO0lBQ0YsTUFBTSxXQUFXLEdBQUcsZUFBZSxDQUNqQyxJQUFJLEVBQ0osYUFBYSxFQUNiLFVBQVUsQ0FBQyxXQUFXLEVBQUUsSUFBSSxFQUM1QixVQUFVLENBQUMsV0FBVyxFQUFFLFFBQVEsRUFDaEMsVUFBVSxDQUFDLFdBQVcsRUFBRSxVQUFVLENBQ25DLENBQUM7SUFDRixNQUFNLEtBQUssR0FBRyxlQUFlLENBQzNCLElBQUksRUFDSixPQUFPLEVBQ1AsVUFBVSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQ3RCLFVBQVUsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUMxQixVQUFVLENBQUMsS0FBSyxFQUFFLFVBQVUsQ0FDN0IsQ0FBQztJQUVGLDZEQUE2RDtJQUM3RCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxDQUFDO0lBQzVDLE1BQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQyxhQUFhLENBQzlCLFNBQVMsRUFDVCxJQUFJLENBQUMsSUFBSSxFQUNULElBQUksQ0FBQyxNQUFNLEVBQ1gsYUFBYSxFQUNiLElBQUksQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEVBQzVCLFVBQVUsQ0FBQyxVQUFVLENBQ3RCLENBQUM7SUFDRixPQUFPLENBQUMsZUFBZSxHQUFHLFdBQVcsRUFBRSxJQUFJLElBQUksSUFBSSxDQUFDO0lBQ3BELE9BQU8sQ0FBQyxlQUFlLEdBQUcsV0FBVyxFQUFFLE1BQU0sSUFBSSxJQUFJLENBQUM7SUFDdEQsT0FBTyxDQUFDLFdBQVcsR0FBRyxPQUFPLEVBQUUsTUFBTSxJQUFJLElBQUksQ0FBQztJQUM5QyxPQUFPLENBQUMsU0FBUyxHQUFHLEtBQUssRUFBRSxNQUFNLElBQUksSUFBSSxDQUFDO0lBQzFDLE9BQU8sQ0FBQyxzQkFBc0IsR0FBRyxVQUFVLENBQUMsV0FBVyxFQUFFLFdBQVcsSUFBSSxJQUFJLENBQUM7SUFDN0UsT0FBTyxDQUFDLGtCQUFrQixHQUFHLFVBQVUsQ0FBQyxPQUFPLEVBQUUsV0FBVyxJQUFJLElBQUksQ0FBQztJQUNyRSxPQUFPLENBQUMsZ0JBQWdCLEdBQUcsVUFBVSxDQUFDLE9BQU8sRUFBRSxTQUFTLElBQUksSUFBSSxDQUFDO0lBQ2pFLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBRTFCLHVDQUF1QztJQUN2QyxrR0FBa0c7SUFDbEcsOERBQThEO0lBQzlELElBQUksUUFBUSxHQUFHLEtBQUssQ0FBQztJQUNyQixJQUFJLFVBQVUsR0FBbUIsRUFBRSxDQUFDO0lBQ3BDLElBQUksWUFBWSxHQUFxQixFQUFFLENBQUM7SUFDeEMsS0FBSyxNQUFNLFFBQVEsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsQ0FBQztRQUMxRSxJQUFJLFFBQVEsQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFFLENBQUM7WUFDaEMsTUFBTSxTQUFTLEdBQUcsRUFBRSxDQUFDLGVBQWUsQ0FDbEMsU0FBUyxFQUNULEVBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUMsRUFDaEMsUUFBUSxFQUNSLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUN6QixDQUFDO1lBQ0YsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUM3QixDQUFDO1FBQ0QsSUFBSSxRQUFRLENBQUMsU0FBUyxLQUFLLFNBQVMsRUFBRSxDQUFDO1lBQ3JDLE1BQU0sU0FBUyxHQUFHLEVBQUUsQ0FBQyxlQUFlLENBQ2xDLFNBQVMsRUFDVCxFQUFDLElBQUksRUFBRSxFQUFFLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFDLEVBQ3JDLFFBQVEsRUFDUixRQUFRLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FDOUIsQ0FBQztZQUNGLFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDN0IsQ0FBQztRQUNELElBQUksUUFBUSxDQUFDLEtBQUssS0FBSyxTQUFTLEVBQUUsQ0FBQztZQUNqQyxNQUFNLFNBQVMsR0FBRyxFQUFFLENBQUMsZUFBZSxDQUNsQyxTQUFTLEVBQ1QsRUFBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsUUFBUSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUMsRUFDOUQsUUFBUSxFQUNSLFFBQVEsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUMxQixDQUFDO1lBQ0YsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUM3QixDQUFDO1FBQ0QsSUFBSSxRQUFRLENBQUMsS0FBSyxLQUFLLFNBQVMsRUFBRSxDQUFDO1lBQ2pDLE1BQU0sU0FBUyxHQUFHLEVBQUUsQ0FBQyxlQUFlLENBQ2xDLFNBQVMsRUFDVDtnQkFDRSxJQUFJLEVBQUUsRUFBRSxDQUFDLGdCQUFnQixDQUFDLEtBQUs7Z0JBQy9CLFVBQVUsRUFBRSxRQUFRLENBQUMsS0FBSyxDQUFDLFNBQVM7Z0JBQ3BDLFVBQVUsRUFBRSxJQUFJO2dCQUNoQixVQUFVLEVBQUUsSUFBSTtnQkFDaEIsVUFBVSxFQUFFLElBQUk7Z0JBQ2hCLG1CQUFtQixFQUFFLElBQUk7YUFDMUIsRUFDRCxRQUFRLEVBQ1IsUUFBUSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQzFCLENBQUM7WUFDRixVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzdCLENBQUM7UUFDRCxJQUFJLFFBQVEsQ0FBQyxXQUFXLEtBQUssU0FBUyxFQUFFLENBQUM7WUFDdkMsTUFBTSxTQUFTLEdBQUcsRUFBRSxDQUFDLGVBQWUsQ0FDbEMsU0FBUyxFQUNUO2dCQUNFLElBQUksRUFBRSxFQUFFLENBQUMsZ0JBQWdCLENBQUMsV0FBVztnQkFDckMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxXQUFXLENBQUMsU0FBUztnQkFDMUMsVUFBVSxFQUFFLElBQUk7Z0JBQ2hCLFVBQVUsRUFBRSxJQUFJO2dCQUNoQixVQUFVLEVBQUUsSUFBSTtnQkFDaEIsbUJBQW1CLEVBQUUsSUFBSTthQUMxQixFQUNELFFBQVEsRUFDUixRQUFRLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FDaEMsQ0FBQztZQUNGLFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDN0IsQ0FBQztRQUNELElBQUksUUFBUSxDQUFDLFFBQVEsS0FBSyxTQUFTLEVBQUUsQ0FBQztZQUNwQyxNQUFNLFNBQVMsR0FBRyxFQUFFLENBQUMsZUFBZSxDQUNsQyxTQUFTLEVBQ1Q7Z0JBQ0UsSUFBSSxFQUFFLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRO2dCQUNsQyxVQUFVLEVBQUUsUUFBUSxDQUFDLFFBQVEsQ0FBQyxTQUFTO2dCQUN2QyxVQUFVLEVBQUUsSUFBSTtnQkFDaEIsVUFBVSxFQUFFLElBQUk7Z0JBQ2hCLFVBQVUsRUFBRSxJQUFJO2dCQUNoQixtQkFBbUIsRUFBRSxJQUFJO2FBQzFCLEVBQ0QsUUFBUSxFQUNSLFFBQVEsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUM3QixDQUFDO1lBQ0YsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUM3QixDQUFDO1FBQ0QsSUFBSSxRQUFRLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFBRSxDQUFDO1lBQ2hDLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLFlBQVksQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDO2dCQUNuRCwyRkFBMkY7Z0JBQzNGLGFBQWE7Z0JBQ2IsTUFBTSxJQUFJLEtBQUssQ0FBQyxzREFBc0QsQ0FBQyxDQUFDO1lBQzFFLENBQUM7WUFDRCxNQUFNLFNBQVMsR0FBRyxFQUFFLENBQUMsaUJBQWlCLENBQ3BDLFNBQVMsRUFDVCxVQUFVLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUNuRSxRQUFRLEVBQ1IsUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQ3pCLENBQUM7WUFDRixZQUFZLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQy9CLENBQUM7UUFFRCwyRUFBMkU7UUFDM0UsSUFBSSxVQUFVLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxZQUFZLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQ3pELFVBQVUsQ0FBQyxJQUFJLENBQ2IsRUFBRSxDQUFDLGVBQWUsQ0FBQyxTQUFTLEVBQUUsRUFBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBQyxFQUFFLEtBQUssRUFBRSxJQUFLLENBQUMsQ0FDOUUsQ0FBQztRQUNKLENBQUM7UUFDRCxRQUFRLEdBQUcsSUFBSSxDQUFDO0lBQ2xCLENBQUM7SUFFRCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUM3QixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNqQyxDQUFDO0FBRUQsU0FBUyxTQUFTLENBQUMsSUFBeUIsRUFBRSxHQUFVO0lBQ3RELElBQUksR0FBRyxDQUFDLElBQUksWUFBWSxJQUFJLENBQUMsT0FBTyxJQUFJLGVBQWUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUNsRSxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLElBQUksRUFBRSxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLElBQUssQ0FBQyxDQUFDLENBQUM7UUFDaEcsS0FBSyxNQUFNLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLEVBQUUsR0FBRyxHQUFHLENBQUMsWUFBWSxFQUFDLENBQUMsRUFBRSxDQUFDO1lBQ3JGLElBQUksSUFBSSxZQUFZLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFDaEMsZUFBZSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDM0MsQ0FBQztpQkFBTSxDQUFDO2dCQUNOLFVBQVUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQ3RDLENBQUM7UUFDSCxDQUFDO1FBQ0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQzVDLENBQUM7U0FBTSxDQUFDO1FBQ04sTUFBTSxLQUFLLENBQUMseUNBQXlDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7SUFDckYsQ0FBQztBQUNILENBQUM7QUFFRDs7R0FFRztBQUNILFNBQVMsY0FBYyxDQUFDLElBQXlCLEVBQUUsUUFBd0I7SUFDekUsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBRXRELHlGQUF5RjtJQUN6Rix5RkFBeUY7SUFDekYsOEJBQThCO0lBQzlCLG9GQUFvRjtJQUNwRiwrRUFBK0U7SUFDL0UsTUFBTSxTQUFTLEdBQUcsV0FBVyxZQUFZLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDakQsTUFBTSxTQUFTLEdBQUcsV0FBVyxZQUFZLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDakQsTUFBTSxhQUFhLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztJQUV4Qyx1RUFBdUU7SUFDdkUsWUFBWSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBRTNFLEtBQUssTUFBTSxRQUFRLElBQUksUUFBUSxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFDakQsSUFBSSxRQUFRLENBQUMsS0FBSyxLQUFLLFFBQVEsRUFBRSxDQUFDO1lBQ2hDLGFBQWEsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ25DLENBQUM7UUFDRCxJQUFJLFFBQVEsQ0FBQyxJQUFJLEtBQUssUUFBUSxFQUFFLENBQUM7WUFDL0IsWUFBWSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzdGLENBQUM7YUFBTSxJQUFJLFFBQVEsQ0FBQyxJQUFJLEtBQUssUUFBUSxFQUFFLENBQUM7WUFDdEMsWUFBWSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzdGLENBQUM7YUFBTSxDQUFDO1lBQ04sWUFBWSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUM7Z0JBQ3ZCLElBQUksRUFBRSxFQUFFLENBQUMsb0JBQW9CLENBQUMsS0FBSztnQkFDbkMsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsVUFBVSxFQUFFLFFBQVEsQ0FBQyxJQUFJO2dCQUN6QixVQUFVLEVBQUUsb0NBQW9DLENBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUM7YUFDakYsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztJQUNILENBQUM7SUFFRCxNQUFNLFVBQVUsR0FBRyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDakYsTUFBTSxLQUFLLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxVQUFVLENBQUMsQ0FBQztJQUVqRSxXQUFXLENBQUMsWUFBWSxFQUFFLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUU3QyxJQUFJLFNBQVMsR0FBK0IsSUFBSSxDQUFDO0lBQ2pELElBQUksWUFBWSxHQUFrQixJQUFJLENBQUM7SUFDdkMsSUFBSSxRQUFRLENBQUMsS0FBSyxLQUFLLElBQUksRUFBRSxDQUFDO1FBQzVCLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDN0MsV0FBVyxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2hELFlBQVksR0FBRywrQkFBK0IsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDdkYsQ0FBQztJQUVELE1BQU0sUUFBUSxHQUF3QjtRQUNwQyxNQUFNLEVBQUUsYUFBYTtRQUNyQixTQUFTLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJO0tBQzlCLENBQUM7SUFFRixJQUFJLFFBQVEsQ0FBQyxJQUFJLEtBQUssU0FBUyxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxZQUFZLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLENBQUM7UUFDckYsTUFBTSxLQUFLLENBQUMsc0RBQXNELENBQUMsQ0FBQztJQUN0RSxDQUFDO0lBQ0QsSUFDRSxRQUFRLENBQUMsS0FBSyxFQUFFLElBQUksS0FBSyxTQUFTO1FBQ2xDLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksWUFBWSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsRUFDdkQsQ0FBQztRQUNELE1BQU0sS0FBSyxDQUFDLHdEQUF3RCxDQUFDLENBQUM7SUFDeEUsQ0FBQztJQUNELE1BQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUM7SUFDdEMsTUFBTSxvQkFBb0IsR0FBRyxRQUFRLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQztJQUVsRCxNQUFNLE9BQU8sR0FBRywrQkFBK0IsQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztJQUNuRixNQUFNLGNBQWMsR0FBRyxFQUFFLENBQUMsc0JBQXNCLENBQzlDLFlBQVksQ0FBQyxJQUFJLEVBQ2pCLFNBQVMsRUFBRSxJQUFJLElBQUksSUFBSSxFQUN2QixPQUFPLEVBQ1AsS0FBSyxFQUNMLFFBQVEsRUFDUixZQUFZLEVBQ1osZUFBZSxFQUNmLG9CQUFvQixFQUNwQixRQUFRLENBQUMsZUFBZSxFQUN4QixRQUFRLENBQUMsVUFBVSxDQUNwQixDQUFDO0lBQ0YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7SUFFakMsTUFBTSxVQUFVLEdBQUcsVUFBVSxDQUMzQixRQUFRLENBQUMsVUFBVSxFQUNuQixJQUFJLENBQUMsR0FBRyxFQUNSLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FDakUsQ0FBQztJQUNGLE1BQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FDbEMsY0FBYyxDQUFDLElBQUksRUFDbkIsY0FBYyxDQUFDLE1BQU0sRUFDckIsVUFBVSxFQUNWLFFBQVEsQ0FBQyxVQUFVLENBQ3BCLENBQUM7SUFDRixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUM3QixDQUFDO0FBRUQ7Ozs7O0dBS0c7QUFDSCxTQUFTLG9DQUFvQyxDQUMzQyxRQUFvQixFQUNwQixTQUFpQixFQUNqQixTQUFpQjtJQUVqQixRQUFRLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN2QixLQUFLLFFBQVE7WUFDWCxPQUFPLElBQUksRUFBRSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUUzQyxLQUFLLFFBQVE7WUFDWCxPQUFPLElBQUksRUFBRSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUUzQyxLQUFLLFFBQVE7WUFDWCxPQUFPLElBQUksRUFBRSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRW5FLEtBQUssT0FBTztZQUNWLE9BQU8sSUFBSSxFQUFFLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDLFNBQVMsQ0FDaEQsSUFBSSxFQUFFLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQ3RELENBQUM7UUFFSixLQUFLLE9BQU87WUFDVixPQUFPLElBQUksRUFBRSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFeEYsS0FBSyxNQUFNO1lBQ1QsT0FBTyxJQUFJLEVBQUUsQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRTNGO1lBQ0UsTUFBTSxJQUFJLEtBQUssQ0FBQyw4Q0FBOEMsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7SUFDcEYsQ0FBQztBQUNILENBQUM7QUFFRCxTQUFTLG9CQUFvQixDQUFDLElBQXlCLEVBQUUsSUFBc0I7SUFDN0UsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsQ0FBQztJQUV6QyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsa0JBQWtCLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7SUFDNUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQ2QsRUFBRSxDQUFDLGdCQUFnQixDQUNqQixNQUFNLEVBQ04sSUFBSSxDQUFDLElBQUksRUFDVCxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsRUFDaEQsSUFBSSxDQUFDLFVBQVUsQ0FDaEIsQ0FDRixDQUFDO0FBQ0osQ0FBQztBQUVEOztHQUVHO0FBQ0gsU0FBUyxVQUFVLENBQ2pCLEdBQVUsRUFDVixHQUFtQixFQUNuQixjQUFzQztJQUV0QyxJQUFJLEdBQUcsWUFBWSxDQUFDLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDbkMsT0FBTyxVQUFVLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFDbEQsQ0FBQztTQUFNLElBQUksR0FBRyxZQUFZLENBQUMsQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUN6QyxNQUFNLGNBQWMsR0FBRyxHQUFHLENBQUMsUUFBUSxZQUFZLENBQUMsQ0FBQyxZQUFZLENBQUM7UUFDOUQsOEVBQThFO1FBQzlFLE1BQU0sa0JBQWtCLEdBQ3RCLEdBQUcsQ0FBQyxRQUFRLFlBQVksQ0FBQyxDQUFDLGdCQUFnQixJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxZQUFZLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMxRix3RkFBd0Y7UUFDeEYsWUFBWTtRQUNaLE1BQU0sYUFBYSxHQUFHLEdBQUcsQ0FBQyxJQUFJLEtBQUssTUFBTSxJQUFJLEdBQUcsQ0FBQyxJQUFJLEtBQUssUUFBUSxDQUFDO1FBQ25FLCtGQUErRjtRQUMvRiwrRkFBK0Y7UUFDL0YsNEZBQTRGO1FBQzVGLHVGQUF1RjtRQUN2RiwyRUFBMkU7UUFDM0UsTUFBTTtRQUNOLDhDQUE4QztRQUM5QyxNQUFNO1FBQ04sMkZBQTJGO1FBQzNGLHFGQUFxRjtRQUNyRixFQUFFO1FBQ0Ysd0ZBQXdGO1FBQ3hGLDhGQUE4RjtRQUM5RiwwQ0FBMEM7UUFDMUMsRUFBRTtRQUNGLDRFQUE0RTtRQUM1RSxJQUFJLGtCQUFrQixJQUFJLENBQUMsY0FBYyxJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQztZQUM3RCxPQUFPLElBQUksRUFBRSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDMUMsQ0FBQzthQUFNLENBQUM7WUFDTixPQUFPLElBQUksQ0FBQyxDQUFDLFlBQVksQ0FDdkIsVUFBVSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLGNBQWMsQ0FBQyxFQUM3QyxHQUFHLENBQUMsSUFBSSxFQUNSLElBQUksRUFDSixpQkFBaUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLGNBQWMsQ0FBQyxDQUM1QyxDQUFDO1FBQ0osQ0FBQztJQUNILENBQUM7U0FBTSxJQUFJLEdBQUcsWUFBWSxDQUFDLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDMUMsSUFBSSxHQUFHLENBQUMsUUFBUSxZQUFZLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQy9DLE9BQU8sSUFBSSxDQUFDLENBQUMsYUFBYTtZQUN4Qix3RkFBd0Y7WUFDeEYsSUFBSSxFQUFFLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQ2pDLEdBQUcsQ0FBQyxJQUFJLEVBQ1IsVUFBVSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLGNBQWMsQ0FBQyxFQUMxQyxJQUFJLEVBQ0osaUJBQWlCLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsQ0FDNUMsQ0FBQztRQUNKLENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQyxDQUFDLGFBQWEsQ0FDeEIsVUFBVSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLGNBQWMsQ0FBQyxFQUM3QyxHQUFHLENBQUMsSUFBSSxFQUNSLFVBQVUsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxjQUFjLENBQUMsRUFDMUMsU0FBUyxFQUNULGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsY0FBYyxDQUFDLENBQzVDLENBQUM7SUFDSixDQUFDO1NBQU0sSUFBSSxHQUFHLFlBQVksQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ3ZDLE9BQU8sSUFBSSxDQUFDLENBQUMsWUFBWSxDQUN2QixVQUFVLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsY0FBYyxDQUFDLEVBQzdDLFVBQVUsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxjQUFjLENBQUMsRUFDeEMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLGNBQWMsQ0FBQyxFQUMxQyxTQUFTLEVBQ1QsaUJBQWlCLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsQ0FDNUMsQ0FBQztJQUNKLENBQUM7U0FBTSxJQUFJLEdBQUcsWUFBWSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDakMsSUFBSSxHQUFHLENBQUMsUUFBUSxZQUFZLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQy9DLE1BQU0sSUFBSSxLQUFLLENBQUMsNkJBQTZCLENBQUMsQ0FBQztRQUNqRCxDQUFDO2FBQU0sQ0FBQztZQUNOLE9BQU8sSUFBSSxDQUFDLENBQUMsa0JBQWtCLENBQzdCLFVBQVUsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxjQUFjLENBQUMsRUFDN0MsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLGNBQWMsQ0FBQyxDQUFDLEVBQzNELFNBQVMsRUFDVCxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLGNBQWMsQ0FBQyxDQUM1QyxDQUFDO1FBQ0osQ0FBQztJQUNILENBQUM7U0FBTSxJQUFJLEdBQUcsWUFBWSxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUM3QyxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsaUJBQWlCLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDO0lBQ3RGLENBQUM7U0FBTSxJQUFJLEdBQUcsWUFBWSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDbEMsUUFBUSxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDckIsS0FBSyxHQUFHO2dCQUNOLE9BQU8sSUFBSSxDQUFDLENBQUMsaUJBQWlCLENBQzVCLENBQUMsQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUNwQixVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsY0FBYyxDQUFDLEVBQ3pDLFNBQVMsRUFDVCxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLGNBQWMsQ0FBQyxDQUM1QyxDQUFDO1lBQ0osS0FBSyxHQUFHO2dCQUNOLE9BQU8sSUFBSSxDQUFDLENBQUMsaUJBQWlCLENBQzVCLENBQUMsQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUNyQixVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsY0FBYyxDQUFDLEVBQ3pDLFNBQVMsRUFDVCxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLGNBQWMsQ0FBQyxDQUM1QyxDQUFDO1lBQ0o7Z0JBQ0UsTUFBTSxJQUFJLEtBQUssQ0FBQywwQ0FBMEMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDOUUsQ0FBQztJQUNILENBQUM7U0FBTSxJQUFJLEdBQUcsWUFBWSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDbkMsTUFBTSxRQUFRLEdBQUcsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNyRCxJQUFJLFFBQVEsS0FBSyxTQUFTLEVBQUUsQ0FBQztZQUMzQixNQUFNLElBQUksS0FBSyxDQUFDLDJDQUEyQyxHQUFHLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztRQUM5RSxDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUMsQ0FBQyxrQkFBa0IsQ0FDN0IsUUFBUSxFQUNSLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxjQUFjLENBQUMsRUFDekMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLGNBQWMsQ0FBQyxFQUMxQyxTQUFTLEVBQ1QsaUJBQWlCLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsQ0FDNUMsQ0FBQztJQUNKLENBQUM7U0FBTSxJQUFJLEdBQUcsWUFBWSxDQUFDLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDekMscURBQXFEO1FBQ3JELE9BQU8sSUFBSSxFQUFFLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDM0MsQ0FBQztTQUFNLElBQUksR0FBRyxZQUFZLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUN0QyxPQUFPLElBQUksQ0FBQyxDQUFDLFdBQVcsQ0FDdEIsVUFBVSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLGNBQWMsQ0FBQyxFQUM3QyxVQUFVLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsY0FBYyxDQUFDLEVBQ3hDLFNBQVMsRUFDVCxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLGNBQWMsQ0FBQyxDQUM1QyxDQUFDO0lBQ0osQ0FBQztTQUFNLElBQUksR0FBRyxZQUFZLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNsQyxNQUFNLElBQUksS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7SUFDOUQsQ0FBQztTQUFNLElBQUksR0FBRyxZQUFZLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUN2QyxNQUFNLE9BQU8sR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRTtZQUN4QyxNQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzlCLGtGQUFrRjtZQUNsRixjQUFjO1lBQ2QsT0FBTyxJQUFJLENBQUMsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxVQUFVLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxjQUFjLENBQUMsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDNUYsQ0FBQyxDQUFDLENBQUM7UUFDSCxPQUFPLElBQUksQ0FBQyxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQztJQUMvRixDQUFDO1NBQU0sSUFBSSxHQUFHLFlBQVksQ0FBQyxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3pDLDhGQUE4RjtRQUM5RixPQUFPLElBQUksQ0FBQyxDQUFDLGdCQUFnQixDQUMzQixHQUFHLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FDckUsQ0FBQztJQUNKLENBQUM7U0FBTSxJQUFJLEdBQUcsWUFBWSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDeEMsT0FBTyxJQUFJLENBQUMsQ0FBQyxlQUFlLENBQzFCLFVBQVUsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLEdBQUcsRUFBRSxjQUFjLENBQUMsRUFDOUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFLGNBQWMsQ0FBQyxFQUM1QyxVQUFVLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsY0FBYyxDQUFDLEVBQzdDLFNBQVMsRUFDVCxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLGNBQWMsQ0FBQyxDQUM1QyxDQUFDO0lBQ0osQ0FBQztTQUFNLElBQUksR0FBRyxZQUFZLENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUMxQyx3RkFBd0Y7UUFDeEYsT0FBTyxVQUFVLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxHQUFHLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFDekQsQ0FBQztTQUFNLElBQUksR0FBRyxZQUFZLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUN4QyxvRUFBb0U7UUFDcEUsT0FBTyxJQUFJLEVBQUUsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLFVBQVUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxJQUFJLEVBQUU7WUFDakYsVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLGNBQWMsQ0FBQztZQUN4QyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxjQUFjLENBQUMsQ0FBQztTQUMvRCxDQUFDLENBQUM7SUFDTCxDQUFDO1NBQU0sSUFBSSxHQUFHLFlBQVksQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQzFDLE9BQU8sSUFBSSxFQUFFLENBQUMsaUJBQWlCLENBQzdCLFVBQVUsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxjQUFjLENBQUMsRUFDN0MsVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLGNBQWMsQ0FBQyxFQUN4QyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLGNBQWMsQ0FBQyxDQUM1QyxDQUFDO0lBQ0osQ0FBQztTQUFNLElBQUksR0FBRyxZQUFZLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQzdDLG9CQUFvQjtRQUNwQixPQUFPLElBQUksRUFBRSxDQUFDLG9CQUFvQixDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxjQUFjLENBQUMsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDOUYsQ0FBQztTQUFNLElBQUksR0FBRyxZQUFZLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNyQyxvQkFBb0I7UUFDcEIsT0FBTyxJQUFJLEVBQUUsQ0FBQyxzQkFBc0IsQ0FDbEMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLGNBQWMsQ0FBQyxFQUM3QyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FDeEQsQ0FBQztJQUNKLENBQUM7U0FBTSxJQUFJLEdBQUcsWUFBWSxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDdEMsT0FBTyxJQUFJLEVBQUUsQ0FBQyxTQUFTLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDO0lBQ3ZFLENBQUM7U0FBTSxJQUFJLEdBQUcsWUFBWSxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDdEMsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUNWLFVBQVUsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLEdBQUcsRUFBRSxjQUFjLENBQUMsRUFDL0MsaUJBQWlCLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsQ0FDNUMsQ0FBQztJQUNKLENBQUM7U0FBTSxDQUFDO1FBQ04sTUFBTSxJQUFJLEtBQUssQ0FDYiw4QkFBOEIsR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLGNBQWMsY0FBYyxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQ2xHLENBQUM7SUFDSixDQUFDO0FBQ0gsQ0FBQztBQUVELFNBQVMsMkJBQTJCLENBQ2xDLEdBQW1CLEVBQ25CLEtBQXFCLEVBQ3JCLFFBQTBDLEVBQzFDLFVBQTRCO0lBRTVCLElBQUksVUFBMkMsQ0FBQztJQUNoRCxJQUFJLEtBQUssWUFBWSxDQUFDLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDckMsVUFBVSxHQUFHLElBQUksRUFBRSxDQUFDLGFBQWEsQ0FDL0IsS0FBSyxDQUFDLE9BQU8sRUFDYixLQUFLLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsVUFBVSxJQUFJLElBQUksQ0FBQyxDQUFDLEVBQ3BFLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxFQUFFLFlBQVksSUFBSSxFQUFFLENBQUMsQ0FDckQsQ0FBQztJQUNKLENBQUM7U0FBTSxJQUFJLEtBQUssWUFBWSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDbEMsVUFBVSxHQUFHLFVBQVUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLFVBQVUsSUFBSSxJQUFJLENBQUMsQ0FBQztJQUMxRCxDQUFDO1NBQU0sQ0FBQztRQUNOLFVBQVUsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2hDLENBQUM7SUFDRCxPQUFPLFVBQVUsQ0FBQztBQUNwQixDQUFDO0FBRUQsMERBQTBEO0FBQzFELE1BQU0sYUFBYSxHQUFHLElBQUksR0FBRyxDQUFnQztJQUMzRCxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDO0lBQ2pELENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUM7SUFDckQsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQztJQUNuRCxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDO0lBQy9DLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUM7SUFDbkQsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQztDQUNwRCxDQUFDLENBQUM7QUFFSDs7Ozs7Ozs7Ozs7Ozs7OztHQWdCRztBQUNILFNBQVMsZUFBZSxDQUFDLElBQWdCO0lBQ3ZDLE9BQU8sV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssb0JBQW9CLENBQUM7QUFDckUsQ0FBQztBQUVEOztHQUVHO0FBQ0gsU0FBUyxTQUFTLENBQUMsUUFBMEM7SUFDM0QsSUFBSSxRQUFRLElBQUksSUFBSSxFQUFFLENBQUM7UUFDckIsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBQ0QsSUFBSSxDQUFDLENBQUMsUUFBUSxZQUFZLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1FBQ3hDLE1BQU0sS0FBSyxDQUFDLGdEQUFnRCxRQUFRLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7SUFDM0YsQ0FBQztJQUNELE9BQU8sUUFBUSxDQUFDO0FBQ2xCLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxTQUFTLHFCQUFxQixDQUM1QixJQUF5QixFQUN6QixFQUFvQixFQUNwQixPQUFrQjtJQUVsQixJQUFJLFFBQVEsR0FBRyxJQUFJLEtBQUssRUFBaUQsQ0FBQztJQUUxRSxJQUFJLHlCQUF5QixHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7SUFFbEQsS0FBSyxNQUFNLElBQUksSUFBSSxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDdEMsd0RBQXdEO1FBQ3hELE1BQU0sZUFBZSxHQUFHLFNBQVMsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2pGLFFBQVEsQ0FBQyxJQUFJLENBQ1gsRUFBRSxDQUFDLGVBQWUsQ0FDaEIsRUFBRSxDQUFDLElBQUksRUFDUCxFQUFFLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFDeEIsSUFBSSxDQUFDLElBQUksRUFDVCwyQkFBMkIsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUM1RCxJQUFJLEVBQ0osZUFBZSxFQUNmLElBQUksRUFDSixLQUFLLEVBQ0wsSUFBSSxFQUNKLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQ3BCLElBQUksQ0FBQyxVQUFVLENBQ2hCLENBQ0YsQ0FBQztRQUNGLElBQUksSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2QseUJBQXlCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMzQyxDQUFDO0lBQ0gsQ0FBQztJQUVELEtBQUssTUFBTSxLQUFLLElBQUksT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ25DLElBQUkseUJBQXlCLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1lBQzlDLE9BQU8sQ0FBQyxLQUFLLENBQ1gsZ0JBQWdCLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxpQkFBaUIsS0FBSyxDQUFDLElBQUksNkpBQTZKLENBQy9OLENBQUM7UUFDSixDQUFDO1FBQ0QsK0RBQStEO1FBQy9ELFFBQVEsQ0FBQyxJQUFJLENBQ1gsRUFBRSxDQUFDLGVBQWUsQ0FDaEIsRUFBRSxDQUFDLElBQUksRUFDUCxhQUFhLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUUsRUFDOUIsS0FBSyxDQUFDLElBQUksRUFDViwyQkFBMkIsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUNyRSxLQUFLLENBQUMsSUFBSSxFQUNWLEtBQUssQ0FBQyxlQUFlLEVBQ3JCLEtBQUssRUFDTCxLQUFLLEVBQ0wsSUFBSSxFQUNKLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxFQUM3QixLQUFLLENBQUMsVUFBVSxDQUNqQixDQUNGLENBQUM7SUFDSixDQUFDO0lBRUQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQ2QsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBZ0MsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxDQUMvRixDQUFDO0lBQ0YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBcUIsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBRTNGLEtBQUssTUFBTSxNQUFNLElBQUksT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3JDLElBQUksTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsZUFBZSxDQUFDLFNBQVMsSUFBSSxNQUFNLENBQUMsS0FBSyxLQUFLLElBQUksRUFBRSxDQUFDO1lBQ3pFLE1BQU0sS0FBSyxDQUFDLHdDQUF3QyxDQUFDLENBQUM7UUFDeEQsQ0FBQztRQUVELElBQUksTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQzdDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUNkLEVBQUUsQ0FBQyxzQkFBc0IsQ0FDdkIsRUFBRSxDQUFDLElBQUksRUFDUCxFQUFFLENBQUMsTUFBTSxFQUNULE1BQU0sQ0FBQyxJQUFJLEVBQ1gsRUFBRSxDQUFDLEdBQUcsRUFDTiw0QkFBNEIsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsV0FBVyxDQUFDLEVBQ3RFLE1BQU0sQ0FBQyxVQUFVLENBQ2xCLENBQ0YsQ0FBQztRQUNKLENBQUM7YUFBTSxDQUFDO1lBQ04sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQ2QsRUFBRSxDQUFDLGdCQUFnQixDQUNqQixFQUFFLENBQUMsSUFBSSxFQUNQLEVBQUUsQ0FBQyxNQUFNLEVBQ1QsTUFBTSxDQUFDLElBQUksRUFDWCxFQUFFLENBQUMsR0FBRyxFQUNOLHNCQUFzQixDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFDaEUsTUFBTSxDQUFDLEtBQUssRUFDWixNQUFNLENBQUMsTUFBTSxFQUNiLEtBQUssRUFDTCxNQUFNLENBQUMsVUFBVSxDQUNsQixDQUNGLENBQUM7UUFDSixDQUFDO0lBQ0gsQ0FBQztJQUVELGdHQUFnRztJQUNoRyx1QkFBdUI7SUFDdkIsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUM7UUFDbEQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQ2QsRUFBRSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsVUFBVSxFQUFFLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUNuRixDQUFDO0lBQ0osQ0FBQztBQUNILENBQUM7QUFFRDs7O0dBR0c7QUFDSCxTQUFTLHNCQUFzQixDQUM3QixJQUF5QixFQUN6QixFQUFvQixFQUNwQixRQUFvQixFQUNwQixZQUFvQztJQUVwQyxJQUFJLFFBQVEsR0FBRyxJQUFJLEtBQUssRUFBaUQsQ0FBQztJQUUxRSxLQUFLLE1BQU0sSUFBSSxJQUFJLFFBQVEsQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUMxQyxJQUFJLElBQUksWUFBWSxDQUFDLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDcEMsTUFBTSxlQUFlLEdBQUcsU0FBUyxDQUFDLGVBQWUsQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3pGLFFBQVEsQ0FBQyxJQUFJLENBQ1gscUJBQXFCLENBQ25CLElBQUksRUFDSixFQUFFLENBQUMsSUFBSSxFQUNQLENBQUMsQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUN2QixJQUFJLENBQUMsSUFBSSxFQUNULElBQUksQ0FBQyxLQUFLLEVBQ1YsSUFBSSxFQUNKLGVBQWUsRUFDZixJQUFJLEVBQ0osWUFBWSxFQUNaLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQ3BCLElBQUksQ0FBQyxVQUFVLENBQ2hCLENBQ0YsQ0FBQztRQUNKLENBQUM7YUFBTSxDQUFDO1lBQ04sUUFBUSxDQUFDLElBQUksQ0FDWCxxQkFBcUIsQ0FDbkIsSUFBSSxFQUNKLEVBQUUsQ0FBQyxJQUFJLEVBQ1AsSUFBSSxDQUFDLElBQUksRUFDVCxJQUFJLENBQUMsSUFBSSxFQUNULEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQ2pCLElBQUksQ0FBQyxJQUFJLEVBQ1QsSUFBSSxDQUFDLGVBQWUsRUFDcEIsSUFBSSxFQUNKLFlBQVksRUFDWixTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUNwQixJQUFJLENBQUMsVUFBVSxDQUNoQixDQUNGLENBQUM7UUFDSixDQUFDO0lBQ0gsQ0FBQztJQUVELEtBQUssTUFBTSxJQUFJLElBQUksUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ3ZDLHdEQUF3RDtRQUN4RCxNQUFNLGVBQWUsR0FBRyxTQUFTLENBQUMsZUFBZSxDQUFDLG9CQUFvQixFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDekYsUUFBUSxDQUFDLElBQUksQ0FDWCxxQkFBcUIsQ0FDbkIsSUFBSSxFQUNKLEVBQUUsQ0FBQyxJQUFJLEVBQ1AsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQ3ZCLElBQUksQ0FBQyxJQUFJLEVBQ1QsSUFBSSxDQUFDLEtBQUssRUFDVixJQUFJLEVBQ0osZUFBZSxFQUNmLEtBQUssRUFDTCxZQUFZLEVBQ1osU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFDcEIsSUFBSSxDQUFDLFVBQVUsQ0FDaEIsQ0FDRixDQUFDO0lBQ0osQ0FBQztJQUVELEtBQUssTUFBTSxLQUFLLElBQUksUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3BDLDJEQUEyRDtRQUMzRCxRQUFRLENBQUMsSUFBSSxDQUNYLHFCQUFxQixDQUNuQixJQUFJLEVBQ0osRUFBRSxDQUFDLElBQUksRUFDUCxLQUFLLENBQUMsSUFBSSxFQUNWLEtBQUssQ0FBQyxJQUFJLEVBQ1YsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFDbEIsS0FBSyxDQUFDLElBQUksRUFDVixLQUFLLENBQUMsZUFBZSxFQUNyQixLQUFLLEVBQ0wsWUFBWSxFQUNaLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQ3JCLEtBQUssQ0FBQyxVQUFVLENBQ2pCLENBQ0YsQ0FBQztJQUNKLENBQUM7SUFFRCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FDZCxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFnQyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLENBQy9GLENBQUM7SUFDRixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFxQixFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFFM0YsS0FBSyxNQUFNLE1BQU0sSUFBSSxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDdEMsSUFBSSxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxlQUFlLENBQUMsU0FBUyxJQUFJLE1BQU0sQ0FBQyxLQUFLLEtBQUssSUFBSSxFQUFFLENBQUM7WUFDekUsTUFBTSxLQUFLLENBQUMsd0NBQXdDLENBQUMsQ0FBQztRQUN4RCxDQUFDO1FBRUQsSUFBSSxZQUFZLEtBQUssRUFBRSxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNoRCxJQUFJLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDN0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQ2QsRUFBRSxDQUFDLHNCQUFzQixDQUN2QixFQUFFLENBQUMsSUFBSSxFQUNQLEVBQUUsQ0FBQyxNQUFNLEVBQ1QsTUFBTSxDQUFDLElBQUksRUFDWCxFQUFFLENBQUMsR0FBRyxFQUNOLDRCQUE0QixDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFDdEUsTUFBTSxDQUFDLFVBQVUsQ0FDbEIsQ0FDRixDQUFDO1lBQ0osQ0FBQztpQkFBTSxDQUFDO2dCQUNOLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUNkLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FDakIsRUFBRSxDQUFDLElBQUksRUFDUCxFQUFFLENBQUMsTUFBTSxFQUNULE1BQU0sQ0FBQyxJQUFJLEVBQ1gsRUFBRSxDQUFDLEdBQUcsRUFDTixzQkFBc0IsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsV0FBVyxDQUFDLEVBQ2hFLE1BQU0sQ0FBQyxLQUFLLEVBQ1osTUFBTSxDQUFDLE1BQU0sRUFDYixLQUFLLEVBQ0wsTUFBTSxDQUFDLFVBQVUsQ0FDbEIsQ0FDRixDQUFDO1lBQ0osQ0FBQztRQUNILENBQUM7UUFDRCxJQUNFLFlBQVksS0FBSyxFQUFFLENBQUMsWUFBWSxDQUFDLFVBQVU7WUFDM0MsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsZUFBZSxDQUFDLFNBQVMsRUFDM0MsQ0FBQztZQUNELDhFQUE4RTtZQUM5RSxNQUFNLGVBQWUsR0FBRyxTQUFTLENBQUMsZUFBZSxDQUFDLG9CQUFvQixFQUFFLE1BQU0sQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDNUYsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQ2QsRUFBRSxDQUFDLDBCQUEwQixDQUMzQixFQUFFLENBQUMsSUFBSSxFQUNQLEVBQUUsQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUN2QixJQUFJLEVBQ0osTUFBTSxDQUFDLElBQUksRUFDWCxJQUFJLEVBQ0osSUFBSSxFQUNKLElBQUksRUFDSixlQUFlLENBQ2hCLENBQ0YsQ0FBQztRQUNKLENBQUM7SUFDSCxDQUFDO0lBRUQsMkZBQTJGO0lBQzNGLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDO1FBQ2xELElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUNkLEVBQUUsQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLFVBQVUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FDbkYsQ0FBQztJQUNKLENBQUM7QUFDSCxDQUFDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTJCRztBQUNILFNBQVMscUJBQXFCLENBQzVCLElBQXlCLEVBQ3pCLElBQWUsRUFDZixJQUFtQixFQUNuQixJQUFZLEVBQ1osS0FBcUIsRUFDckIsSUFBbUIsRUFDbkIsZUFBZ0MsRUFDaEMsNkJBQXNDLEVBQ3RDLFlBQW9DLEVBQ3BDLFdBQWdDLEVBQ2hDLFVBQTJCO0lBRTNCLE1BQU0sYUFBYSxHQUFHLE9BQU8sS0FBSyxLQUFLLFFBQVEsQ0FBQztJQUNoRCwyRkFBMkY7SUFDM0Ysc0JBQXNCO0lBQ3RCLElBQUksWUFBWSxLQUFLLEVBQUUsQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDaEQsSUFBSSxDQUFDLDZCQUE2QixFQUFFLENBQUM7WUFDbkMsUUFBUSxJQUFJLEVBQUUsQ0FBQztnQkFDYixLQUFLLENBQUMsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDO2dCQUM1QixLQUFLLENBQUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDO2dCQUN6QixLQUFLLENBQUMsQ0FBQyxXQUFXLENBQUMsS0FBSztvQkFDdEIseUZBQXlGO29CQUN6Rix3RkFBd0Y7b0JBQ3hGLHlGQUF5RjtvQkFDekYsdURBQXVEO29CQUN2RCxPQUFPLEVBQUUsQ0FBQywwQkFBMEIsQ0FDbEMsSUFBSSxFQUNKLEVBQUUsQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUN2QixJQUFJLEVBQ0osSUFBSSxFQUNKLElBQUksRUFDSixJQUFJLEVBQ0osV0FBVyxFQUNYLGVBQWUsQ0FDaEIsQ0FBQztnQkFDSixLQUFLLENBQUMsQ0FBQyxXQUFXLENBQUMsTUFBTTtvQkFDdkIsT0FBTyxFQUFFLENBQUMsMEJBQTBCLENBQ2xDLElBQUksRUFDSixFQUFFLENBQUMsV0FBVyxDQUFDLGNBQWMsRUFDN0IsSUFBSSxFQUNKLElBQUksRUFDSixJQUFJLEVBQ0osSUFBSSxFQUNKLFdBQVcsRUFDWCxlQUFlLENBQ2hCLENBQUM7WUFDTixDQUFDO1FBQ0gsQ0FBQztRQUVELElBQUksQ0FBQyxhQUFhLElBQUksQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLFdBQVcsQ0FBQyxTQUFTLElBQUksSUFBSSxLQUFLLENBQUMsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQztZQUM3Riw2RkFBNkY7WUFDN0YsMkZBQTJGO1lBQzNGLHNGQUFzRjtZQUN0RixZQUFZO1lBQ1osT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDO0lBQ0gsQ0FBQztJQUVELElBQUksV0FBVyxHQUFHLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFFLENBQUM7SUFFM0MsSUFBSSxZQUFZLEtBQUssRUFBRSxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUNoRCw0RUFBNEU7UUFDNUUsNEZBQTRGO1FBQzVGLDJGQUEyRjtRQUMzRixXQUFXO1FBQ1gsRUFBRTtRQUNGLCtGQUErRjtRQUMvRiwyRUFBMkU7UUFDM0UsNkZBQTZGO1FBQzdGLFFBQVE7UUFDUixFQUFFO1FBQ0YsNkZBQTZGO1FBQzdGLDZGQUE2RjtRQUM3RiwwRkFBMEY7UUFDMUYsMkZBQTJGO1FBQzNGLGdHQUFnRztRQUNoRyxJQUNFLElBQUksS0FBSyxDQUFDLENBQUMsV0FBVyxDQUFDLEtBQUs7WUFDNUIsSUFBSSxLQUFLLENBQUMsQ0FBQyxXQUFXLENBQUMsS0FBSztZQUM1QixDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsV0FBVyxDQUFDLFNBQVMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUNwRCxDQUFDO1lBQ0QsNENBQTRDO1lBQzVDLFdBQVcsR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQztRQUN4QyxDQUFDO0lBQ0gsQ0FBQztJQUVELE9BQU8sRUFBRSxDQUFDLGVBQWUsQ0FDdkIsSUFBSSxFQUNKLFdBQVcsRUFDWCxJQUFJLEVBQ0osMkJBQTJCLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsV0FBVyxDQUFDLEVBQ3pELElBQUksRUFDSixlQUFlLEVBQ2YsYUFBYSxFQUNiLDZCQUE2QixFQUM3QixZQUFZLEVBQ1osV0FBVyxFQUNYLFVBQVUsQ0FDWCxDQUFDO0FBQ0osQ0FBQztBQUVELFNBQVMsc0JBQXNCLENBQzdCLElBQXFCLEVBQ3JCLE9BQWMsRUFDZCxXQUE0QjtJQUU1QixPQUFPLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3pCLE1BQU0sVUFBVSxHQUFHLElBQUksS0FBSyxFQUFlLENBQUM7SUFDNUMsSUFBSSxZQUFZLEdBQVksT0FBTyxZQUFZLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDekYsSUFBSSxZQUFZLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO1FBQzlCLE1BQU0sSUFBSSxLQUFLLENBQUMsc0RBQXNELENBQUMsQ0FBQztJQUMxRSxDQUFDO0lBQ0QsTUFBTSxXQUFXLEdBQUcsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUM7SUFDeEYsTUFBTSxVQUFVLEdBQUcsV0FBVyxDQUFDLEdBQUcsRUFBRyxDQUFDO0lBQ3RDLFVBQVUsQ0FBQyxJQUFJLENBQ2IsR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FDdkIsRUFBRSxDQUFDLGlCQUFpQixDQUFjLElBQUksQ0FBQyxDQUFDLG1CQUFtQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FDOUUsQ0FDRixDQUFDO0lBQ0YsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUMsZUFBZSxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2hHLE9BQU8sVUFBVSxDQUFDO0FBQ3BCLENBQUM7QUFFRCxTQUFTLDRCQUE0QixDQUNuQyxJQUFxQixFQUNyQixPQUFjLEVBQ2QsV0FBNEI7SUFFNUIsT0FBTyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN6QixNQUFNLFVBQVUsR0FBRyxJQUFJLEtBQUssRUFBZSxDQUFDO0lBRTVDLElBQUksT0FBTyxZQUFZLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUMvQixJQUFJLE9BQU8sQ0FBQyxXQUFXLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQ3JDLE9BQU8sR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ25DLENBQUM7YUFBTSxDQUFDO1lBQ04sNEVBQTRFO1lBQzVFLE1BQU0sSUFBSSxLQUFLLENBQUMsd0RBQXdELENBQUMsQ0FBQztRQUM1RSxDQUFDO0lBQ0gsQ0FBQztJQUVELE1BQU0sV0FBVyxHQUFHLFVBQVUsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUMvRCxNQUFNLGNBQWMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDeEQsTUFBTSxhQUFhLEdBQUcsSUFBSSxFQUFFLENBQUMsb0JBQW9CLENBQUMsV0FBVyxFQUFFLGNBQWMsQ0FBQyxDQUFDO0lBRS9FLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLGlCQUFpQixDQUFjLElBQUksQ0FBQyxDQUFDLG1CQUFtQixDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM3RixVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxlQUFlLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzdFLE9BQU8sVUFBVSxDQUFDO0FBQ3BCLENBQUM7QUFFRCxTQUFTLEtBQUssQ0FBQyxHQUE0QjtJQUN6QyxPQUFPLEdBQUcsWUFBWSxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7QUFDeEQsQ0FBQztBQUVEOzs7R0FHRztBQUNILFNBQVMsZ0JBQWdCLENBQUMsRUFBb0IsRUFBRSxPQUErQjtJQUM3RSxhQUFhLENBQWMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3pDLEtBQUssTUFBTSxFQUFDLElBQUksRUFBRSxLQUFLLEVBQUMsSUFBSSxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDL0MsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUM7WUFDaEIsSUFBSTtZQUNKLE1BQU0sRUFBRSxLQUFLO1NBQ2QsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztBQUNILENBQUM7QUFFRDs7R0FFRztBQUNILFNBQVMsYUFBYSxDQUFJLEtBQVU7SUFDbEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUMxQixNQUFNLElBQUksS0FBSyxDQUFDLG1DQUFtQyxDQUFDLENBQUM7SUFDdkQsQ0FBQztBQUNILENBQUM7QUFFRDs7Ozs7Ozs7OztHQVVHO0FBQ0gsU0FBUyxpQkFBaUIsQ0FDeEIsSUFBaUIsRUFDakIsY0FBc0M7SUFFdEMsSUFBSSxjQUFjLEtBQUssSUFBSSxFQUFFLENBQUM7UUFDNUIsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBQ0QsTUFBTSxLQUFLLEdBQUcsY0FBYyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3RELE1BQU0sR0FBRyxHQUFHLGNBQWMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNsRCxNQUFNLFNBQVMsR0FBRyxjQUFjLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDOUQsT0FBTyxJQUFJLGVBQWUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0FBQ3BELENBQUM7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXNCRztBQUNILFNBQVMsK0JBQStCLENBQ3RDLElBQXlCLEVBQ3pCLElBQWUsRUFDZixJQUFnRjtJQUVoRixJQUFJLElBQUksR0FBa0MsSUFBSSxDQUFDO0lBRS9DLEtBQUssTUFBTSxLQUFLLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ2xDLDJCQUEyQjtRQUMzQixJQUFJLEtBQUssWUFBWSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDL0IsU0FBUztRQUNYLENBQUM7UUFFRCwyRUFBMkU7UUFDM0UsSUFBSSxJQUFJLEtBQUssSUFBSSxFQUFFLENBQUM7WUFDbEIsT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDO1FBRUQsdUZBQXVGO1FBQ3ZGLElBQUksS0FBSyxZQUFZLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxLQUFLLFlBQVksQ0FBQyxDQUFDLFFBQVEsSUFBSSxLQUFLLENBQUMsT0FBTyxLQUFLLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDMUYsSUFBSSxHQUFHLEtBQUssQ0FBQztRQUNmLENBQUM7SUFDSCxDQUFDO0lBRUQsd0VBQXdFO0lBQ3hFLHdFQUF3RTtJQUN4RSxJQUFJLElBQUksS0FBSyxJQUFJLEVBQUUsQ0FBQztRQUNsQixpRUFBaUU7UUFDakUsS0FBSyxNQUFNLElBQUksSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDbkMsTUFBTSxlQUFlLEdBQUcsU0FBUyxDQUFDLGVBQWUsQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3pGLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUNkLEVBQUUsQ0FBQyxlQUFlLENBQ2hCLElBQUksRUFDSixFQUFFLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFDeEIsSUFBSSxDQUFDLElBQUksRUFDVCxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFDckIsSUFBSSxFQUNKLGVBQWUsRUFDZixJQUFJLEVBQ0osS0FBSyxFQUNMLElBQUksRUFDSixTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUNwQixJQUFJLENBQUMsVUFBVSxDQUNoQixDQUNGLENBQUM7UUFDSixDQUFDO1FBRUQsZ0ZBQWdGO1FBQ2hGLHFGQUFxRjtRQUNyRiw2REFBNkQ7UUFDN0QsS0FBSyxNQUFNLElBQUksSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDL0IsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxXQUFXLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFDbkYsTUFBTSxlQUFlLEdBQUcsU0FBUyxDQUFDLGVBQWUsQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUN6RixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FDZCxFQUFFLENBQUMsMEJBQTBCLENBQzNCLElBQUksRUFDSixFQUFFLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFDdkIsSUFBSSxFQUNKLElBQUksQ0FBQyxJQUFJLEVBQ1QsSUFBSSxFQUNKLElBQUksRUFDSixJQUFJLEVBQ0osZUFBZSxDQUNoQixDQUNGLENBQUM7WUFDSixDQUFDO1FBQ0gsQ0FBQztRQUVELE1BQU0sT0FBTyxHQUFHLElBQUksWUFBWSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBRXJFLCtFQUErRTtRQUMvRSxPQUFPLE9BQU8sS0FBSyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7SUFDM0QsQ0FBQztJQUVELE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtDb25zdGFudFBvb2x9IGZyb20gJy4uLy4uLy4uL2NvbnN0YW50X3Bvb2wnO1xuaW1wb3J0IHtTZWN1cml0eUNvbnRleHR9IGZyb20gJy4uLy4uLy4uL2NvcmUnO1xuaW1wb3J0ICogYXMgZSBmcm9tICcuLi8uLi8uLi9leHByZXNzaW9uX3BhcnNlci9hc3QnO1xuaW1wb3J0ICogYXMgaTE4biBmcm9tICcuLi8uLi8uLi9pMThuL2kxOG5fYXN0JztcbmltcG9ydCB7c3BsaXROc05hbWV9IGZyb20gJy4uLy4uLy4uL21sX3BhcnNlci90YWdzJztcbmltcG9ydCAqIGFzIG8gZnJvbSAnLi4vLi4vLi4vb3V0cHV0L291dHB1dF9hc3QnO1xuaW1wb3J0IHtQYXJzZVNvdXJjZVNwYW59IGZyb20gJy4uLy4uLy4uL3BhcnNlX3V0aWwnO1xuaW1wb3J0ICogYXMgdCBmcm9tICcuLi8uLi8uLi9yZW5kZXIzL3IzX2FzdCc7XG5pbXBvcnQge0RlZmVyQmxvY2tEZXBzRW1pdE1vZGUsIFIzQ29tcG9uZW50RGVmZXJNZXRhZGF0YX0gZnJvbSAnLi4vLi4vLi4vcmVuZGVyMy92aWV3L2FwaSc7XG5pbXBvcnQge2ljdUZyb21JMThuTWVzc2FnZX0gZnJvbSAnLi4vLi4vLi4vcmVuZGVyMy92aWV3L2kxOG4vdXRpbCc7XG5pbXBvcnQge0RvbUVsZW1lbnRTY2hlbWFSZWdpc3RyeX0gZnJvbSAnLi4vLi4vLi4vc2NoZW1hL2RvbV9lbGVtZW50X3NjaGVtYV9yZWdpc3RyeSc7XG5pbXBvcnQge0JpbmRpbmdQYXJzZXJ9IGZyb20gJy4uLy4uLy4uL3RlbXBsYXRlX3BhcnNlci9iaW5kaW5nX3BhcnNlcic7XG5pbXBvcnQgKiBhcyBpciBmcm9tICcuLi9pcic7XG5cbmltcG9ydCB7XG4gIENvbXBpbGF0aW9uVW5pdCxcbiAgQ29tcG9uZW50Q29tcGlsYXRpb25Kb2IsXG4gIEhvc3RCaW5kaW5nQ29tcGlsYXRpb25Kb2IsXG4gIHR5cGUgQ29tcGlsYXRpb25Kb2IsXG4gIHR5cGUgVmlld0NvbXBpbGF0aW9uVW5pdCxcbn0gZnJvbSAnLi9jb21waWxhdGlvbic7XG5pbXBvcnQge0JJTkFSWV9PUEVSQVRPUlMsIG5hbWVzcGFjZUZvcktleSwgcHJlZml4V2l0aE5hbWVzcGFjZX0gZnJvbSAnLi9jb252ZXJzaW9uJztcblxuY29uc3QgY29tcGF0aWJpbGl0eU1vZGUgPSBpci5Db21wYXRpYmlsaXR5TW9kZS5UZW1wbGF0ZURlZmluaXRpb25CdWlsZGVyO1xuXG4vLyBTY2hlbWEgY29udGFpbmluZyBET00gZWxlbWVudHMgYW5kIHRoZWlyIHByb3BlcnRpZXMuXG5jb25zdCBkb21TY2hlbWEgPSBuZXcgRG9tRWxlbWVudFNjaGVtYVJlZ2lzdHJ5KCk7XG5cbi8vIFRhZyBuYW1lIG9mIHRoZSBgbmctdGVtcGxhdGVgIGVsZW1lbnQuXG5jb25zdCBOR19URU1QTEFURV9UQUdfTkFNRSA9ICduZy10ZW1wbGF0ZSc7XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0kxOG5Sb290Tm9kZShtZXRhPzogaTE4bi5JMThuTWV0YSk6IG1ldGEgaXMgaTE4bi5NZXNzYWdlIHtcbiAgcmV0dXJuIG1ldGEgaW5zdGFuY2VvZiBpMThuLk1lc3NhZ2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1NpbmdsZUkxOG5JY3UobWV0YT86IGkxOG4uSTE4bk1ldGEpOiBtZXRhIGlzIGkxOG4uSTE4bk1ldGEgJiB7bm9kZXM6IFtpMThuLkljdV19IHtcbiAgcmV0dXJuIGlzSTE4blJvb3ROb2RlKG1ldGEpICYmIG1ldGEubm9kZXMubGVuZ3RoID09PSAxICYmIG1ldGEubm9kZXNbMF0gaW5zdGFuY2VvZiBpMThuLkljdTtcbn1cblxuLyoqXG4gKiBQcm9jZXNzIGEgdGVtcGxhdGUgQVNUIGFuZCBjb252ZXJ0IGl0IGludG8gYSBgQ29tcG9uZW50Q29tcGlsYXRpb25gIGluIHRoZSBpbnRlcm1lZGlhdGVcbiAqIHJlcHJlc2VudGF0aW9uLlxuICogVE9ETzogUmVmYWN0b3IgbW9yZSBvZiB0aGUgaW5nZXN0aW9uIGNvZGUgaW50byBwaGFzZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbmdlc3RDb21wb25lbnQoXG4gIGNvbXBvbmVudE5hbWU6IHN0cmluZyxcbiAgdGVtcGxhdGU6IHQuTm9kZVtdLFxuICBjb25zdGFudFBvb2w6IENvbnN0YW50UG9vbCxcbiAgcmVsYXRpdmVDb250ZXh0RmlsZVBhdGg6IHN0cmluZyxcbiAgaTE4blVzZUV4dGVybmFsSWRzOiBib29sZWFuLFxuICBkZWZlck1ldGE6IFIzQ29tcG9uZW50RGVmZXJNZXRhZGF0YSxcbiAgYWxsRGVmZXJyYWJsZURlcHNGbjogby5SZWFkVmFyRXhwciB8IG51bGwsXG4pOiBDb21wb25lbnRDb21waWxhdGlvbkpvYiB7XG4gIGNvbnN0IGpvYiA9IG5ldyBDb21wb25lbnRDb21waWxhdGlvbkpvYihcbiAgICBjb21wb25lbnROYW1lLFxuICAgIGNvbnN0YW50UG9vbCxcbiAgICBjb21wYXRpYmlsaXR5TW9kZSxcbiAgICByZWxhdGl2ZUNvbnRleHRGaWxlUGF0aCxcbiAgICBpMThuVXNlRXh0ZXJuYWxJZHMsXG4gICAgZGVmZXJNZXRhLFxuICAgIGFsbERlZmVycmFibGVEZXBzRm4sXG4gICk7XG4gIGluZ2VzdE5vZGVzKGpvYi5yb290LCB0ZW1wbGF0ZSk7XG4gIHJldHVybiBqb2I7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSG9zdEJpbmRpbmdJbnB1dCB7XG4gIGNvbXBvbmVudE5hbWU6IHN0cmluZztcbiAgY29tcG9uZW50U2VsZWN0b3I6IHN0cmluZztcbiAgcHJvcGVydGllczogZS5QYXJzZWRQcm9wZXJ0eVtdIHwgbnVsbDtcbiAgYXR0cmlidXRlczoge1trZXk6IHN0cmluZ106IG8uRXhwcmVzc2lvbn07XG4gIGV2ZW50czogZS5QYXJzZWRFdmVudFtdIHwgbnVsbDtcbn1cblxuLyoqXG4gKiBQcm9jZXNzIGEgaG9zdCBiaW5kaW5nIEFTVCBhbmQgY29udmVydCBpdCBpbnRvIGEgYEhvc3RCaW5kaW5nQ29tcGlsYXRpb25Kb2JgIGluIHRoZSBpbnRlcm1lZGlhdGVcbiAqIHJlcHJlc2VudGF0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gaW5nZXN0SG9zdEJpbmRpbmcoXG4gIGlucHV0OiBIb3N0QmluZGluZ0lucHV0LFxuICBiaW5kaW5nUGFyc2VyOiBCaW5kaW5nUGFyc2VyLFxuICBjb25zdGFudFBvb2w6IENvbnN0YW50UG9vbCxcbik6IEhvc3RCaW5kaW5nQ29tcGlsYXRpb25Kb2Ige1xuICBjb25zdCBqb2IgPSBuZXcgSG9zdEJpbmRpbmdDb21waWxhdGlvbkpvYihpbnB1dC5jb21wb25lbnROYW1lLCBjb25zdGFudFBvb2wsIGNvbXBhdGliaWxpdHlNb2RlKTtcbiAgZm9yIChjb25zdCBwcm9wZXJ0eSBvZiBpbnB1dC5wcm9wZXJ0aWVzID8/IFtdKSB7XG4gICAgbGV0IGJpbmRpbmdLaW5kID0gaXIuQmluZGluZ0tpbmQuUHJvcGVydHk7XG4gICAgLy8gVE9ETzogdGhpcyBzaG91bGQgcmVhbGx5IGJlIGhhbmRsZWQgaW4gdGhlIHBhcnNlci5cbiAgICBpZiAocHJvcGVydHkubmFtZS5zdGFydHNXaXRoKCdhdHRyLicpKSB7XG4gICAgICBwcm9wZXJ0eS5uYW1lID0gcHJvcGVydHkubmFtZS5zdWJzdHJpbmcoJ2F0dHIuJy5sZW5ndGgpO1xuICAgICAgYmluZGluZ0tpbmQgPSBpci5CaW5kaW5nS2luZC5BdHRyaWJ1dGU7XG4gICAgfVxuICAgIGlmIChwcm9wZXJ0eS5pc0FuaW1hdGlvbikge1xuICAgICAgYmluZGluZ0tpbmQgPSBpci5CaW5kaW5nS2luZC5BbmltYXRpb247XG4gICAgfVxuICAgIGNvbnN0IHNlY3VyaXR5Q29udGV4dHMgPSBiaW5kaW5nUGFyc2VyXG4gICAgICAuY2FsY1Bvc3NpYmxlU2VjdXJpdHlDb250ZXh0cyhcbiAgICAgICAgaW5wdXQuY29tcG9uZW50U2VsZWN0b3IsXG4gICAgICAgIHByb3BlcnR5Lm5hbWUsXG4gICAgICAgIGJpbmRpbmdLaW5kID09PSBpci5CaW5kaW5nS2luZC5BdHRyaWJ1dGUsXG4gICAgICApXG4gICAgICAuZmlsdGVyKChjb250ZXh0KSA9PiBjb250ZXh0ICE9PSBTZWN1cml0eUNvbnRleHQuTk9ORSk7XG4gICAgaW5nZXN0SG9zdFByb3BlcnR5KGpvYiwgcHJvcGVydHksIGJpbmRpbmdLaW5kLCBzZWN1cml0eUNvbnRleHRzKTtcbiAgfVxuICBmb3IgKGNvbnN0IFtuYW1lLCBleHByXSBvZiBPYmplY3QuZW50cmllcyhpbnB1dC5hdHRyaWJ1dGVzKSA/PyBbXSkge1xuICAgIGNvbnN0IHNlY3VyaXR5Q29udGV4dHMgPSBiaW5kaW5nUGFyc2VyXG4gICAgICAuY2FsY1Bvc3NpYmxlU2VjdXJpdHlDb250ZXh0cyhpbnB1dC5jb21wb25lbnRTZWxlY3RvciwgbmFtZSwgdHJ1ZSlcbiAgICAgIC5maWx0ZXIoKGNvbnRleHQpID0+IGNvbnRleHQgIT09IFNlY3VyaXR5Q29udGV4dC5OT05FKTtcbiAgICBpbmdlc3RIb3N0QXR0cmlidXRlKGpvYiwgbmFtZSwgZXhwciwgc2VjdXJpdHlDb250ZXh0cyk7XG4gIH1cbiAgZm9yIChjb25zdCBldmVudCBvZiBpbnB1dC5ldmVudHMgPz8gW10pIHtcbiAgICBpbmdlc3RIb3N0RXZlbnQoam9iLCBldmVudCk7XG4gIH1cbiAgcmV0dXJuIGpvYjtcbn1cblxuLy8gVE9ETzogV2Ugc2hvdWxkIHJlZmFjdG9yIHRoZSBwYXJzZXIgdG8gdXNlIHRoZSBzYW1lIHR5cGVzIGFuZCBzdHJ1Y3R1cmVzIGZvciBob3N0IGJpbmRpbmdzIGFzXG4vLyB3aXRoIG9yZGluYXJ5IGNvbXBvbmVudHMuIFRoaXMgd291bGQgYWxsb3cgdXMgdG8gc2hhcmUgYSBsb3QgbW9yZSBpbmdlc3Rpb24gY29kZS5cbmV4cG9ydCBmdW5jdGlvbiBpbmdlc3RIb3N0UHJvcGVydHkoXG4gIGpvYjogSG9zdEJpbmRpbmdDb21waWxhdGlvbkpvYixcbiAgcHJvcGVydHk6IGUuUGFyc2VkUHJvcGVydHksXG4gIGJpbmRpbmdLaW5kOiBpci5CaW5kaW5nS2luZCxcbiAgc2VjdXJpdHlDb250ZXh0czogU2VjdXJpdHlDb250ZXh0W10sXG4pOiB2b2lkIHtcbiAgbGV0IGV4cHJlc3Npb246IG8uRXhwcmVzc2lvbiB8IGlyLkludGVycG9sYXRpb247XG4gIGNvbnN0IGFzdCA9IHByb3BlcnR5LmV4cHJlc3Npb24uYXN0O1xuICBpZiAoYXN0IGluc3RhbmNlb2YgZS5JbnRlcnBvbGF0aW9uKSB7XG4gICAgZXhwcmVzc2lvbiA9IG5ldyBpci5JbnRlcnBvbGF0aW9uKFxuICAgICAgYXN0LnN0cmluZ3MsXG4gICAgICBhc3QuZXhwcmVzc2lvbnMubWFwKChleHByKSA9PiBjb252ZXJ0QXN0KGV4cHIsIGpvYiwgcHJvcGVydHkuc291cmNlU3BhbikpLFxuICAgICAgW10sXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICBleHByZXNzaW9uID0gY29udmVydEFzdChhc3QsIGpvYiwgcHJvcGVydHkuc291cmNlU3Bhbik7XG4gIH1cbiAgam9iLnJvb3QudXBkYXRlLnB1c2goXG4gICAgaXIuY3JlYXRlQmluZGluZ09wKFxuICAgICAgam9iLnJvb3QueHJlZixcbiAgICAgIGJpbmRpbmdLaW5kLFxuICAgICAgcHJvcGVydHkubmFtZSxcbiAgICAgIGV4cHJlc3Npb24sXG4gICAgICBudWxsLFxuICAgICAgc2VjdXJpdHlDb250ZXh0cyxcbiAgICAgIGZhbHNlLFxuICAgICAgZmFsc2UsXG4gICAgICBudWxsLFxuICAgICAgLyogVE9ETzogSG93IGRvIEhvc3QgYmluZGluZ3MgaGFuZGxlIGkxOG4gYXR0cnM/ICovIG51bGwsXG4gICAgICBwcm9wZXJ0eS5zb3VyY2VTcGFuLFxuICAgICksXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbmdlc3RIb3N0QXR0cmlidXRlKFxuICBqb2I6IEhvc3RCaW5kaW5nQ29tcGlsYXRpb25Kb2IsXG4gIG5hbWU6IHN0cmluZyxcbiAgdmFsdWU6IG8uRXhwcmVzc2lvbixcbiAgc2VjdXJpdHlDb250ZXh0czogU2VjdXJpdHlDb250ZXh0W10sXG4pOiB2b2lkIHtcbiAgY29uc3QgYXR0ckJpbmRpbmcgPSBpci5jcmVhdGVCaW5kaW5nT3AoXG4gICAgam9iLnJvb3QueHJlZixcbiAgICBpci5CaW5kaW5nS2luZC5BdHRyaWJ1dGUsXG4gICAgbmFtZSxcbiAgICB2YWx1ZSxcbiAgICBudWxsLFxuICAgIHNlY3VyaXR5Q29udGV4dHMsXG4gICAgLyogSG9zdCBhdHRyaWJ1dGVzIHNob3VsZCBhbHdheXMgYmUgZXh0cmFjdGVkIHRvIGNvbnN0IGhvc3RBdHRycywgZXZlbiBpZiB0aGV5IGFyZSBub3RcbiAgICAgKnN0cmljdGx5KiB0ZXh0IGxpdGVyYWxzICovXG4gICAgdHJ1ZSxcbiAgICBmYWxzZSxcbiAgICBudWxsLFxuICAgIC8qIFRPRE8gKi8gbnVsbCxcbiAgICAvKiogVE9ETzogTWF5IGJlIG51bGw/ICovIHZhbHVlLnNvdXJjZVNwYW4hLFxuICApO1xuICBqb2Iucm9vdC51cGRhdGUucHVzaChhdHRyQmluZGluZyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbmdlc3RIb3N0RXZlbnQoam9iOiBIb3N0QmluZGluZ0NvbXBpbGF0aW9uSm9iLCBldmVudDogZS5QYXJzZWRFdmVudCkge1xuICBjb25zdCBbcGhhc2UsIHRhcmdldF0gPVxuICAgIGV2ZW50LnR5cGUgIT09IGUuUGFyc2VkRXZlbnRUeXBlLkFuaW1hdGlvblxuICAgICAgPyBbbnVsbCwgZXZlbnQudGFyZ2V0T3JQaGFzZV1cbiAgICAgIDogW2V2ZW50LnRhcmdldE9yUGhhc2UsIG51bGxdO1xuICBjb25zdCBldmVudEJpbmRpbmcgPSBpci5jcmVhdGVMaXN0ZW5lck9wKFxuICAgIGpvYi5yb290LnhyZWYsXG4gICAgbmV3IGlyLlNsb3RIYW5kbGUoKSxcbiAgICBldmVudC5uYW1lLFxuICAgIG51bGwsXG4gICAgbWFrZUxpc3RlbmVySGFuZGxlck9wcyhqb2Iucm9vdCwgZXZlbnQuaGFuZGxlciwgZXZlbnQuaGFuZGxlclNwYW4pLFxuICAgIHBoYXNlLFxuICAgIHRhcmdldCxcbiAgICB0cnVlLFxuICAgIGV2ZW50LnNvdXJjZVNwYW4sXG4gICk7XG4gIGpvYi5yb290LmNyZWF0ZS5wdXNoKGV2ZW50QmluZGluZyk7XG59XG5cbi8qKlxuICogSW5nZXN0IHRoZSBub2RlcyBvZiBhIHRlbXBsYXRlIEFTVCBpbnRvIHRoZSBnaXZlbiBgVmlld0NvbXBpbGF0aW9uYC5cbiAqL1xuZnVuY3Rpb24gaW5nZXN0Tm9kZXModW5pdDogVmlld0NvbXBpbGF0aW9uVW5pdCwgdGVtcGxhdGU6IHQuTm9kZVtdKTogdm9pZCB7XG4gIGZvciAoY29uc3Qgbm9kZSBvZiB0ZW1wbGF0ZSkge1xuICAgIGlmIChub2RlIGluc3RhbmNlb2YgdC5FbGVtZW50KSB7XG4gICAgICBpbmdlc3RFbGVtZW50KHVuaXQsIG5vZGUpO1xuICAgIH0gZWxzZSBpZiAobm9kZSBpbnN0YW5jZW9mIHQuVGVtcGxhdGUpIHtcbiAgICAgIGluZ2VzdFRlbXBsYXRlKHVuaXQsIG5vZGUpO1xuICAgIH0gZWxzZSBpZiAobm9kZSBpbnN0YW5jZW9mIHQuQ29udGVudCkge1xuICAgICAgaW5nZXN0Q29udGVudCh1bml0LCBub2RlKTtcbiAgICB9IGVsc2UgaWYgKG5vZGUgaW5zdGFuY2VvZiB0LlRleHQpIHtcbiAgICAgIGluZ2VzdFRleHQodW5pdCwgbm9kZSwgbnVsbCk7XG4gICAgfSBlbHNlIGlmIChub2RlIGluc3RhbmNlb2YgdC5Cb3VuZFRleHQpIHtcbiAgICAgIGluZ2VzdEJvdW5kVGV4dCh1bml0LCBub2RlLCBudWxsKTtcbiAgICB9IGVsc2UgaWYgKG5vZGUgaW5zdGFuY2VvZiB0LklmQmxvY2spIHtcbiAgICAgIGluZ2VzdElmQmxvY2sodW5pdCwgbm9kZSk7XG4gICAgfSBlbHNlIGlmIChub2RlIGluc3RhbmNlb2YgdC5Td2l0Y2hCbG9jaykge1xuICAgICAgaW5nZXN0U3dpdGNoQmxvY2sodW5pdCwgbm9kZSk7XG4gICAgfSBlbHNlIGlmIChub2RlIGluc3RhbmNlb2YgdC5EZWZlcnJlZEJsb2NrKSB7XG4gICAgICBpbmdlc3REZWZlckJsb2NrKHVuaXQsIG5vZGUpO1xuICAgIH0gZWxzZSBpZiAobm9kZSBpbnN0YW5jZW9mIHQuSWN1KSB7XG4gICAgICBpbmdlc3RJY3UodW5pdCwgbm9kZSk7XG4gICAgfSBlbHNlIGlmIChub2RlIGluc3RhbmNlb2YgdC5Gb3JMb29wQmxvY2spIHtcbiAgICAgIGluZ2VzdEZvckJsb2NrKHVuaXQsIG5vZGUpO1xuICAgIH0gZWxzZSBpZiAobm9kZSBpbnN0YW5jZW9mIHQuTGV0RGVjbGFyYXRpb24pIHtcbiAgICAgIGluZ2VzdExldERlY2xhcmF0aW9uKHVuaXQsIG5vZGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuc3VwcG9ydGVkIHRlbXBsYXRlIG5vZGU6ICR7bm9kZS5jb25zdHJ1Y3Rvci5uYW1lfWApO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEluZ2VzdCBhbiBlbGVtZW50IEFTVCBmcm9tIHRoZSB0ZW1wbGF0ZSBpbnRvIHRoZSBnaXZlbiBgVmlld0NvbXBpbGF0aW9uYC5cbiAqL1xuZnVuY3Rpb24gaW5nZXN0RWxlbWVudCh1bml0OiBWaWV3Q29tcGlsYXRpb25Vbml0LCBlbGVtZW50OiB0LkVsZW1lbnQpOiB2b2lkIHtcbiAgaWYgKFxuICAgIGVsZW1lbnQuaTE4biAhPT0gdW5kZWZpbmVkICYmXG4gICAgIShlbGVtZW50LmkxOG4gaW5zdGFuY2VvZiBpMThuLk1lc3NhZ2UgfHwgZWxlbWVudC5pMThuIGluc3RhbmNlb2YgaTE4bi5UYWdQbGFjZWhvbGRlcilcbiAgKSB7XG4gICAgdGhyb3cgRXJyb3IoYFVuaGFuZGxlZCBpMThuIG1ldGFkYXRhIHR5cGUgZm9yIGVsZW1lbnQ6ICR7ZWxlbWVudC5pMThuLmNvbnN0cnVjdG9yLm5hbWV9YCk7XG4gIH1cblxuICBjb25zdCBpZCA9IHVuaXQuam9iLmFsbG9jYXRlWHJlZklkKCk7XG5cbiAgY29uc3QgW25hbWVzcGFjZUtleSwgZWxlbWVudE5hbWVdID0gc3BsaXROc05hbWUoZWxlbWVudC5uYW1lKTtcblxuICBjb25zdCBzdGFydE9wID0gaXIuY3JlYXRlRWxlbWVudFN0YXJ0T3AoXG4gICAgZWxlbWVudE5hbWUsXG4gICAgaWQsXG4gICAgbmFtZXNwYWNlRm9yS2V5KG5hbWVzcGFjZUtleSksXG4gICAgZWxlbWVudC5pMThuIGluc3RhbmNlb2YgaTE4bi5UYWdQbGFjZWhvbGRlciA/IGVsZW1lbnQuaTE4biA6IHVuZGVmaW5lZCxcbiAgICBlbGVtZW50LnN0YXJ0U291cmNlU3BhbixcbiAgICBlbGVtZW50LnNvdXJjZVNwYW4sXG4gICk7XG4gIHVuaXQuY3JlYXRlLnB1c2goc3RhcnRPcCk7XG5cbiAgaW5nZXN0RWxlbWVudEJpbmRpbmdzKHVuaXQsIHN0YXJ0T3AsIGVsZW1lbnQpO1xuICBpbmdlc3RSZWZlcmVuY2VzKHN0YXJ0T3AsIGVsZW1lbnQpO1xuXG4gIC8vIFN0YXJ0IGkxOG4sIGlmIG5lZWRlZCwgZ29lcyBhZnRlciB0aGUgZWxlbWVudCBjcmVhdGUgYW5kIGJpbmRpbmdzLCBidXQgYmVmb3JlIHRoZSBub2Rlc1xuICBsZXQgaTE4bkJsb2NrSWQ6IGlyLlhyZWZJZCB8IG51bGwgPSBudWxsO1xuICBpZiAoZWxlbWVudC5pMThuIGluc3RhbmNlb2YgaTE4bi5NZXNzYWdlKSB7XG4gICAgaTE4bkJsb2NrSWQgPSB1bml0LmpvYi5hbGxvY2F0ZVhyZWZJZCgpO1xuICAgIHVuaXQuY3JlYXRlLnB1c2goXG4gICAgICBpci5jcmVhdGVJMThuU3RhcnRPcChpMThuQmxvY2tJZCwgZWxlbWVudC5pMThuLCB1bmRlZmluZWQsIGVsZW1lbnQuc3RhcnRTb3VyY2VTcGFuKSxcbiAgICApO1xuICB9XG5cbiAgaW5nZXN0Tm9kZXModW5pdCwgZWxlbWVudC5jaGlsZHJlbik7XG5cbiAgLy8gVGhlIHNvdXJjZSBzcGFuIGZvciB0aGUgZW5kIG9wIGlzIHR5cGljYWxseSB0aGUgZWxlbWVudCBjbG9zaW5nIHRhZy4gSG93ZXZlciwgaWYgbm8gY2xvc2luZyB0YWdcbiAgLy8gZXhpc3RzLCBzdWNoIGFzIGluIGA8aW5wdXQ+YCwgd2UgdXNlIHRoZSBzdGFydCBzb3VyY2Ugc3BhbiBpbnN0ZWFkLiBVc3VhbGx5IHRoZSBzdGFydCBhbmQgZW5kXG4gIC8vIGluc3RydWN0aW9ucyB3aWxsIGJlIGNvbGxhcHNlZCBpbnRvIG9uZSBgZWxlbWVudGAgaW5zdHJ1Y3Rpb24sIG5lZ2F0aW5nIHRoZSBwdXJwb3NlIG9mIHRoaXNcbiAgLy8gZmFsbGJhY2ssIGJ1dCBpbiBjYXNlcyB3aGVuIGl0IGlzIG5vdCBjb2xsYXBzZWQgKHN1Y2ggYXMgYW4gaW5wdXQgd2l0aCBhIGJpbmRpbmcpLCB3ZSBzdGlsbFxuICAvLyB3YW50IHRvIG1hcCB0aGUgZW5kIGluc3RydWN0aW9uIHRvIHRoZSBtYWluIGVsZW1lbnQuXG4gIGNvbnN0IGVuZE9wID0gaXIuY3JlYXRlRWxlbWVudEVuZE9wKGlkLCBlbGVtZW50LmVuZFNvdXJjZVNwYW4gPz8gZWxlbWVudC5zdGFydFNvdXJjZVNwYW4pO1xuICB1bml0LmNyZWF0ZS5wdXNoKGVuZE9wKTtcblxuICAvLyBJZiB0aGVyZSBpcyBhbiBpMThuIG1lc3NhZ2UgYXNzb2NpYXRlZCB3aXRoIHRoaXMgZWxlbWVudCwgaW5zZXJ0IGkxOG4gc3RhcnQgYW5kIGVuZCBvcHMuXG4gIGlmIChpMThuQmxvY2tJZCAhPT0gbnVsbCkge1xuICAgIGlyLk9wTGlzdC5pbnNlcnRCZWZvcmU8aXIuQ3JlYXRlT3A+KFxuICAgICAgaXIuY3JlYXRlSTE4bkVuZE9wKGkxOG5CbG9ja0lkLCBlbGVtZW50LmVuZFNvdXJjZVNwYW4gPz8gZWxlbWVudC5zdGFydFNvdXJjZVNwYW4pLFxuICAgICAgZW5kT3AsXG4gICAgKTtcbiAgfVxufVxuXG4vKipcbiAqIEluZ2VzdCBhbiBgbmctdGVtcGxhdGVgIG5vZGUgZnJvbSB0aGUgQVNUIGludG8gdGhlIGdpdmVuIGBWaWV3Q29tcGlsYXRpb25gLlxuICovXG5mdW5jdGlvbiBpbmdlc3RUZW1wbGF0ZSh1bml0OiBWaWV3Q29tcGlsYXRpb25Vbml0LCB0bXBsOiB0LlRlbXBsYXRlKTogdm9pZCB7XG4gIGlmIChcbiAgICB0bXBsLmkxOG4gIT09IHVuZGVmaW5lZCAmJlxuICAgICEodG1wbC5pMThuIGluc3RhbmNlb2YgaTE4bi5NZXNzYWdlIHx8IHRtcGwuaTE4biBpbnN0YW5jZW9mIGkxOG4uVGFnUGxhY2Vob2xkZXIpXG4gICkge1xuICAgIHRocm93IEVycm9yKGBVbmhhbmRsZWQgaTE4biBtZXRhZGF0YSB0eXBlIGZvciB0ZW1wbGF0ZTogJHt0bXBsLmkxOG4uY29uc3RydWN0b3IubmFtZX1gKTtcbiAgfVxuXG4gIGNvbnN0IGNoaWxkVmlldyA9IHVuaXQuam9iLmFsbG9jYXRlVmlldyh1bml0LnhyZWYpO1xuXG4gIGxldCB0YWdOYW1lV2l0aG91dE5hbWVzcGFjZSA9IHRtcGwudGFnTmFtZTtcbiAgbGV0IG5hbWVzcGFjZVByZWZpeDogc3RyaW5nIHwgbnVsbCA9ICcnO1xuICBpZiAodG1wbC50YWdOYW1lKSB7XG4gICAgW25hbWVzcGFjZVByZWZpeCwgdGFnTmFtZVdpdGhvdXROYW1lc3BhY2VdID0gc3BsaXROc05hbWUodG1wbC50YWdOYW1lKTtcbiAgfVxuXG4gIGNvbnN0IGkxOG5QbGFjZWhvbGRlciA9IHRtcGwuaTE4biBpbnN0YW5jZW9mIGkxOG4uVGFnUGxhY2Vob2xkZXIgPyB0bXBsLmkxOG4gOiB1bmRlZmluZWQ7XG4gIGNvbnN0IG5hbWVzcGFjZSA9IG5hbWVzcGFjZUZvcktleShuYW1lc3BhY2VQcmVmaXgpO1xuICBjb25zdCBmdW5jdGlvbk5hbWVTdWZmaXggPVxuICAgIHRhZ05hbWVXaXRob3V0TmFtZXNwYWNlID09PSBudWxsID8gJycgOiBwcmVmaXhXaXRoTmFtZXNwYWNlKHRhZ05hbWVXaXRob3V0TmFtZXNwYWNlLCBuYW1lc3BhY2UpO1xuICBjb25zdCB0ZW1wbGF0ZUtpbmQgPSBpc1BsYWluVGVtcGxhdGUodG1wbClcbiAgICA/IGlyLlRlbXBsYXRlS2luZC5OZ1RlbXBsYXRlXG4gICAgOiBpci5UZW1wbGF0ZUtpbmQuU3RydWN0dXJhbDtcbiAgY29uc3QgdGVtcGxhdGVPcCA9IGlyLmNyZWF0ZVRlbXBsYXRlT3AoXG4gICAgY2hpbGRWaWV3LnhyZWYsXG4gICAgdGVtcGxhdGVLaW5kLFxuICAgIHRhZ05hbWVXaXRob3V0TmFtZXNwYWNlLFxuICAgIGZ1bmN0aW9uTmFtZVN1ZmZpeCxcbiAgICBuYW1lc3BhY2UsXG4gICAgaTE4blBsYWNlaG9sZGVyLFxuICAgIHRtcGwuc3RhcnRTb3VyY2VTcGFuLFxuICAgIHRtcGwuc291cmNlU3BhbixcbiAgKTtcbiAgdW5pdC5jcmVhdGUucHVzaCh0ZW1wbGF0ZU9wKTtcblxuICBpbmdlc3RUZW1wbGF0ZUJpbmRpbmdzKHVuaXQsIHRlbXBsYXRlT3AsIHRtcGwsIHRlbXBsYXRlS2luZCk7XG4gIGluZ2VzdFJlZmVyZW5jZXModGVtcGxhdGVPcCwgdG1wbCk7XG4gIGluZ2VzdE5vZGVzKGNoaWxkVmlldywgdG1wbC5jaGlsZHJlbik7XG5cbiAgZm9yIChjb25zdCB7bmFtZSwgdmFsdWV9IG9mIHRtcGwudmFyaWFibGVzKSB7XG4gICAgY2hpbGRWaWV3LmNvbnRleHRWYXJpYWJsZXMuc2V0KG5hbWUsIHZhbHVlICE9PSAnJyA/IHZhbHVlIDogJyRpbXBsaWNpdCcpO1xuICB9XG5cbiAgLy8gSWYgdGhpcyBpcyBhIHBsYWluIHRlbXBsYXRlIGFuZCB0aGVyZSBpcyBhbiBpMThuIG1lc3NhZ2UgYXNzb2NpYXRlZCB3aXRoIGl0LCBpbnNlcnQgaTE4biBzdGFydFxuICAvLyBhbmQgZW5kIG9wcy4gRm9yIHN0cnVjdHVyYWwgZGlyZWN0aXZlIHRlbXBsYXRlcywgdGhlIGkxOG4gb3BzIHdpbGwgYmUgYWRkZWQgd2hlbiBpbmdlc3RpbmcgdGhlXG4gIC8vIGVsZW1lbnQvdGVtcGxhdGUgdGhlIGRpcmVjdGl2ZSBpcyBwbGFjZWQgb24uXG4gIGlmICh0ZW1wbGF0ZUtpbmQgPT09IGlyLlRlbXBsYXRlS2luZC5OZ1RlbXBsYXRlICYmIHRtcGwuaTE4biBpbnN0YW5jZW9mIGkxOG4uTWVzc2FnZSkge1xuICAgIGNvbnN0IGlkID0gdW5pdC5qb2IuYWxsb2NhdGVYcmVmSWQoKTtcbiAgICBpci5PcExpc3QuaW5zZXJ0QWZ0ZXIoXG4gICAgICBpci5jcmVhdGVJMThuU3RhcnRPcChpZCwgdG1wbC5pMThuLCB1bmRlZmluZWQsIHRtcGwuc3RhcnRTb3VyY2VTcGFuKSxcbiAgICAgIGNoaWxkVmlldy5jcmVhdGUuaGVhZCxcbiAgICApO1xuICAgIGlyLk9wTGlzdC5pbnNlcnRCZWZvcmUoXG4gICAgICBpci5jcmVhdGVJMThuRW5kT3AoaWQsIHRtcGwuZW5kU291cmNlU3BhbiA/PyB0bXBsLnN0YXJ0U291cmNlU3BhbiksXG4gICAgICBjaGlsZFZpZXcuY3JlYXRlLnRhaWwsXG4gICAgKTtcbiAgfVxufVxuXG4vKipcbiAqIEluZ2VzdCBhIGNvbnRlbnQgbm9kZSBmcm9tIHRoZSBBU1QgaW50byB0aGUgZ2l2ZW4gYFZpZXdDb21waWxhdGlvbmAuXG4gKi9cbmZ1bmN0aW9uIGluZ2VzdENvbnRlbnQodW5pdDogVmlld0NvbXBpbGF0aW9uVW5pdCwgY29udGVudDogdC5Db250ZW50KTogdm9pZCB7XG4gIGlmIChjb250ZW50LmkxOG4gIT09IHVuZGVmaW5lZCAmJiAhKGNvbnRlbnQuaTE4biBpbnN0YW5jZW9mIGkxOG4uVGFnUGxhY2Vob2xkZXIpKSB7XG4gICAgdGhyb3cgRXJyb3IoYFVuaGFuZGxlZCBpMThuIG1ldGFkYXRhIHR5cGUgZm9yIGVsZW1lbnQ6ICR7Y29udGVudC5pMThuLmNvbnN0cnVjdG9yLm5hbWV9YCk7XG4gIH1cblxuICBsZXQgZmFsbGJhY2tWaWV3OiBWaWV3Q29tcGlsYXRpb25Vbml0IHwgbnVsbCA9IG51bGw7XG5cbiAgLy8gRG9uJ3QgY2FwdHVyZSBkZWZhdWx0IGNvbnRlbnQgdGhhdCdzIG9ubHkgbWFkZSB1cCBvZiBlbXB0eSB0ZXh0IG5vZGVzIGFuZCBjb21tZW50cy5cbiAgLy8gTm90ZSB0aGF0IHdlIHByb2Nlc3MgdGhlIGRlZmF1bHQgY29udGVudCBiZWZvcmUgdGhlIHByb2plY3Rpb24gaW4gb3JkZXIgdG8gbWF0Y2ggdGhlXG4gIC8vIGluc2VydGlvbiBvcmRlciBhdCBydW50aW1lLlxuICBpZiAoXG4gICAgY29udGVudC5jaGlsZHJlbi5zb21lKFxuICAgICAgKGNoaWxkKSA9PlxuICAgICAgICAhKGNoaWxkIGluc3RhbmNlb2YgdC5Db21tZW50KSAmJlxuICAgICAgICAoIShjaGlsZCBpbnN0YW5jZW9mIHQuVGV4dCkgfHwgY2hpbGQudmFsdWUudHJpbSgpLmxlbmd0aCA+IDApLFxuICAgIClcbiAgKSB7XG4gICAgZmFsbGJhY2tWaWV3ID0gdW5pdC5qb2IuYWxsb2NhdGVWaWV3KHVuaXQueHJlZik7XG4gICAgaW5nZXN0Tm9kZXMoZmFsbGJhY2tWaWV3LCBjb250ZW50LmNoaWxkcmVuKTtcbiAgfVxuXG4gIGNvbnN0IGlkID0gdW5pdC5qb2IuYWxsb2NhdGVYcmVmSWQoKTtcbiAgY29uc3Qgb3AgPSBpci5jcmVhdGVQcm9qZWN0aW9uT3AoXG4gICAgaWQsXG4gICAgY29udGVudC5zZWxlY3RvcixcbiAgICBjb250ZW50LmkxOG4sXG4gICAgZmFsbGJhY2tWaWV3Py54cmVmID8/IG51bGwsXG4gICAgY29udGVudC5zb3VyY2VTcGFuLFxuICApO1xuICBmb3IgKGNvbnN0IGF0dHIgb2YgY29udGVudC5hdHRyaWJ1dGVzKSB7XG4gICAgY29uc3Qgc2VjdXJpdHlDb250ZXh0ID0gZG9tU2NoZW1hLnNlY3VyaXR5Q29udGV4dChjb250ZW50Lm5hbWUsIGF0dHIubmFtZSwgdHJ1ZSk7XG4gICAgdW5pdC51cGRhdGUucHVzaChcbiAgICAgIGlyLmNyZWF0ZUJpbmRpbmdPcChcbiAgICAgICAgb3AueHJlZixcbiAgICAgICAgaXIuQmluZGluZ0tpbmQuQXR0cmlidXRlLFxuICAgICAgICBhdHRyLm5hbWUsXG4gICAgICAgIG8ubGl0ZXJhbChhdHRyLnZhbHVlKSxcbiAgICAgICAgbnVsbCxcbiAgICAgICAgc2VjdXJpdHlDb250ZXh0LFxuICAgICAgICB0cnVlLFxuICAgICAgICBmYWxzZSxcbiAgICAgICAgbnVsbCxcbiAgICAgICAgYXNNZXNzYWdlKGF0dHIuaTE4biksXG4gICAgICAgIGF0dHIuc291cmNlU3BhbixcbiAgICAgICksXG4gICAgKTtcbiAgfVxuICB1bml0LmNyZWF0ZS5wdXNoKG9wKTtcbn1cblxuLyoqXG4gKiBJbmdlc3QgYSBsaXRlcmFsIHRleHQgbm9kZSBmcm9tIHRoZSBBU1QgaW50byB0aGUgZ2l2ZW4gYFZpZXdDb21waWxhdGlvbmAuXG4gKi9cbmZ1bmN0aW9uIGluZ2VzdFRleHQodW5pdDogVmlld0NvbXBpbGF0aW9uVW5pdCwgdGV4dDogdC5UZXh0LCBpY3VQbGFjZWhvbGRlcjogc3RyaW5nIHwgbnVsbCk6IHZvaWQge1xuICB1bml0LmNyZWF0ZS5wdXNoKFxuICAgIGlyLmNyZWF0ZVRleHRPcCh1bml0LmpvYi5hbGxvY2F0ZVhyZWZJZCgpLCB0ZXh0LnZhbHVlLCBpY3VQbGFjZWhvbGRlciwgdGV4dC5zb3VyY2VTcGFuKSxcbiAgKTtcbn1cblxuLyoqXG4gKiBJbmdlc3QgYW4gaW50ZXJwb2xhdGVkIHRleHQgbm9kZSBmcm9tIHRoZSBBU1QgaW50byB0aGUgZ2l2ZW4gYFZpZXdDb21waWxhdGlvbmAuXG4gKi9cbmZ1bmN0aW9uIGluZ2VzdEJvdW5kVGV4dChcbiAgdW5pdDogVmlld0NvbXBpbGF0aW9uVW5pdCxcbiAgdGV4dDogdC5Cb3VuZFRleHQsXG4gIGljdVBsYWNlaG9sZGVyOiBzdHJpbmcgfCBudWxsLFxuKTogdm9pZCB7XG4gIGxldCB2YWx1ZSA9IHRleHQudmFsdWU7XG4gIGlmICh2YWx1ZSBpbnN0YW5jZW9mIGUuQVNUV2l0aFNvdXJjZSkge1xuICAgIHZhbHVlID0gdmFsdWUuYXN0O1xuICB9XG4gIGlmICghKHZhbHVlIGluc3RhbmNlb2YgZS5JbnRlcnBvbGF0aW9uKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgIGBBc3NlcnRpb25FcnJvcjogZXhwZWN0ZWQgSW50ZXJwb2xhdGlvbiBmb3IgQm91bmRUZXh0IG5vZGUsIGdvdCAke3ZhbHVlLmNvbnN0cnVjdG9yLm5hbWV9YCxcbiAgICApO1xuICB9XG4gIGlmICh0ZXh0LmkxOG4gIT09IHVuZGVmaW5lZCAmJiAhKHRleHQuaTE4biBpbnN0YW5jZW9mIGkxOG4uQ29udGFpbmVyKSkge1xuICAgIHRocm93IEVycm9yKFxuICAgICAgYFVuaGFuZGxlZCBpMThuIG1ldGFkYXRhIHR5cGUgZm9yIHRleHQgaW50ZXJwb2xhdGlvbjogJHt0ZXh0LmkxOG4/LmNvbnN0cnVjdG9yLm5hbWV9YCxcbiAgICApO1xuICB9XG5cbiAgY29uc3QgaTE4blBsYWNlaG9sZGVycyA9XG4gICAgdGV4dC5pMThuIGluc3RhbmNlb2YgaTE4bi5Db250YWluZXJcbiAgICAgID8gdGV4dC5pMThuLmNoaWxkcmVuXG4gICAgICAgICAgLmZpbHRlcigobm9kZSk6IG5vZGUgaXMgaTE4bi5QbGFjZWhvbGRlciA9PiBub2RlIGluc3RhbmNlb2YgaTE4bi5QbGFjZWhvbGRlcilcbiAgICAgICAgICAubWFwKChwbGFjZWhvbGRlcikgPT4gcGxhY2Vob2xkZXIubmFtZSlcbiAgICAgIDogW107XG4gIGlmIChpMThuUGxhY2Vob2xkZXJzLmxlbmd0aCA+IDAgJiYgaTE4blBsYWNlaG9sZGVycy5sZW5ndGggIT09IHZhbHVlLmV4cHJlc3Npb25zLmxlbmd0aCkge1xuICAgIHRocm93IEVycm9yKFxuICAgICAgYFVuZXhwZWN0ZWQgbnVtYmVyIG9mIGkxOG4gcGxhY2Vob2xkZXJzICgke3ZhbHVlLmV4cHJlc3Npb25zLmxlbmd0aH0pIGZvciBCb3VuZFRleHQgd2l0aCAke3ZhbHVlLmV4cHJlc3Npb25zLmxlbmd0aH0gZXhwcmVzc2lvbnNgLFxuICAgICk7XG4gIH1cblxuICBjb25zdCB0ZXh0WHJlZiA9IHVuaXQuam9iLmFsbG9jYXRlWHJlZklkKCk7XG4gIHVuaXQuY3JlYXRlLnB1c2goaXIuY3JlYXRlVGV4dE9wKHRleHRYcmVmLCAnJywgaWN1UGxhY2Vob2xkZXIsIHRleHQuc291cmNlU3BhbikpO1xuICAvLyBUZW1wbGF0ZURlZmluaXRpb25CdWlsZGVyIGRvZXMgbm90IGdlbmVyYXRlIHNvdXJjZSBtYXBzIGZvciBzdWItZXhwcmVzc2lvbnMgaW5zaWRlIGFuXG4gIC8vIGludGVycG9sYXRpb24uIFdlIGNvcHkgdGhhdCBiZWhhdmlvciBpbiBjb21wYXRpYmlsaXR5IG1vZGUuXG4gIC8vIFRPRE86IGlzIGl0IGFjdHVhbGx5IGNvcnJlY3QgdG8gZ2VuZXJhdGUgdGhlc2UgZXh0cmEgbWFwcyBpbiBtb2Rlcm4gbW9kZT9cbiAgY29uc3QgYmFzZVNvdXJjZVNwYW4gPSB1bml0LmpvYi5jb21wYXRpYmlsaXR5ID8gbnVsbCA6IHRleHQuc291cmNlU3BhbjtcbiAgdW5pdC51cGRhdGUucHVzaChcbiAgICBpci5jcmVhdGVJbnRlcnBvbGF0ZVRleHRPcChcbiAgICAgIHRleHRYcmVmLFxuICAgICAgbmV3IGlyLkludGVycG9sYXRpb24oXG4gICAgICAgIHZhbHVlLnN0cmluZ3MsXG4gICAgICAgIHZhbHVlLmV4cHJlc3Npb25zLm1hcCgoZXhwcikgPT4gY29udmVydEFzdChleHByLCB1bml0LmpvYiwgYmFzZVNvdXJjZVNwYW4pKSxcbiAgICAgICAgaTE4blBsYWNlaG9sZGVycyxcbiAgICAgICksXG4gICAgICB0ZXh0LnNvdXJjZVNwYW4sXG4gICAgKSxcbiAgKTtcbn1cblxuLyoqXG4gKiBJbmdlc3QgYW4gYEBpZmAgYmxvY2sgaW50byB0aGUgZ2l2ZW4gYFZpZXdDb21waWxhdGlvbmAuXG4gKi9cbmZ1bmN0aW9uIGluZ2VzdElmQmxvY2sodW5pdDogVmlld0NvbXBpbGF0aW9uVW5pdCwgaWZCbG9jazogdC5JZkJsb2NrKTogdm9pZCB7XG4gIGxldCBmaXJzdFhyZWY6IGlyLlhyZWZJZCB8IG51bGwgPSBudWxsO1xuICBsZXQgY29uZGl0aW9uczogQXJyYXk8aXIuQ29uZGl0aW9uYWxDYXNlRXhwcj4gPSBbXTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBpZkJsb2NrLmJyYW5jaGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgaWZDYXNlID0gaWZCbG9jay5icmFuY2hlc1tpXTtcbiAgICBjb25zdCBjVmlldyA9IHVuaXQuam9iLmFsbG9jYXRlVmlldyh1bml0LnhyZWYpO1xuICAgIGNvbnN0IHRhZ05hbWUgPSBpbmdlc3RDb250cm9sRmxvd0luc2VydGlvblBvaW50KHVuaXQsIGNWaWV3LnhyZWYsIGlmQ2FzZSk7XG5cbiAgICBpZiAoaWZDYXNlLmV4cHJlc3Npb25BbGlhcyAhPT0gbnVsbCkge1xuICAgICAgY1ZpZXcuY29udGV4dFZhcmlhYmxlcy5zZXQoaWZDYXNlLmV4cHJlc3Npb25BbGlhcy5uYW1lLCBpci5DVFhfUkVGKTtcbiAgICB9XG5cbiAgICBsZXQgaWZDYXNlSTE4bk1ldGE6IGkxOG4uQmxvY2tQbGFjZWhvbGRlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBpZiAoaWZDYXNlLmkxOG4gIT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKCEoaWZDYXNlLmkxOG4gaW5zdGFuY2VvZiBpMThuLkJsb2NrUGxhY2Vob2xkZXIpKSB7XG4gICAgICAgIHRocm93IEVycm9yKGBVbmhhbmRsZWQgaTE4biBtZXRhZGF0YSB0eXBlIGZvciBpZiBibG9jazogJHtpZkNhc2UuaTE4bj8uY29uc3RydWN0b3IubmFtZX1gKTtcbiAgICAgIH1cbiAgICAgIGlmQ2FzZUkxOG5NZXRhID0gaWZDYXNlLmkxOG47XG4gICAgfVxuXG4gICAgY29uc3QgdGVtcGxhdGVPcCA9IGlyLmNyZWF0ZVRlbXBsYXRlT3AoXG4gICAgICBjVmlldy54cmVmLFxuICAgICAgaXIuVGVtcGxhdGVLaW5kLkJsb2NrLFxuICAgICAgdGFnTmFtZSxcbiAgICAgICdDb25kaXRpb25hbCcsXG4gICAgICBpci5OYW1lc3BhY2UuSFRNTCxcbiAgICAgIGlmQ2FzZUkxOG5NZXRhLFxuICAgICAgaWZDYXNlLnN0YXJ0U291cmNlU3BhbixcbiAgICAgIGlmQ2FzZS5zb3VyY2VTcGFuLFxuICAgICk7XG4gICAgdW5pdC5jcmVhdGUucHVzaCh0ZW1wbGF0ZU9wKTtcblxuICAgIGlmIChmaXJzdFhyZWYgPT09IG51bGwpIHtcbiAgICAgIGZpcnN0WHJlZiA9IGNWaWV3LnhyZWY7XG4gICAgfVxuXG4gICAgY29uc3QgY2FzZUV4cHIgPSBpZkNhc2UuZXhwcmVzc2lvbiA/IGNvbnZlcnRBc3QoaWZDYXNlLmV4cHJlc3Npb24sIHVuaXQuam9iLCBudWxsKSA6IG51bGw7XG4gICAgY29uc3QgY29uZGl0aW9uYWxDYXNlRXhwciA9IG5ldyBpci5Db25kaXRpb25hbENhc2VFeHByKFxuICAgICAgY2FzZUV4cHIsXG4gICAgICB0ZW1wbGF0ZU9wLnhyZWYsXG4gICAgICB0ZW1wbGF0ZU9wLmhhbmRsZSxcbiAgICAgIGlmQ2FzZS5leHByZXNzaW9uQWxpYXMsXG4gICAgKTtcbiAgICBjb25kaXRpb25zLnB1c2goY29uZGl0aW9uYWxDYXNlRXhwcik7XG4gICAgaW5nZXN0Tm9kZXMoY1ZpZXcsIGlmQ2FzZS5jaGlsZHJlbik7XG4gIH1cbiAgdW5pdC51cGRhdGUucHVzaChpci5jcmVhdGVDb25kaXRpb25hbE9wKGZpcnN0WHJlZiEsIG51bGwsIGNvbmRpdGlvbnMsIGlmQmxvY2suc291cmNlU3BhbikpO1xufVxuXG4vKipcbiAqIEluZ2VzdCBhbiBgQHN3aXRjaGAgYmxvY2sgaW50byB0aGUgZ2l2ZW4gYFZpZXdDb21waWxhdGlvbmAuXG4gKi9cbmZ1bmN0aW9uIGluZ2VzdFN3aXRjaEJsb2NrKHVuaXQ6IFZpZXdDb21waWxhdGlvblVuaXQsIHN3aXRjaEJsb2NrOiB0LlN3aXRjaEJsb2NrKTogdm9pZCB7XG4gIC8vIERvbid0IGluZ2VzdCBlbXB0eSBzd2l0Y2hlcyBzaW5jZSB0aGV5IHdvbid0IHJlbmRlciBhbnl0aGluZy5cbiAgaWYgKHN3aXRjaEJsb2NrLmNhc2VzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGxldCBmaXJzdFhyZWY6IGlyLlhyZWZJZCB8IG51bGwgPSBudWxsO1xuICBsZXQgY29uZGl0aW9uczogQXJyYXk8aXIuQ29uZGl0aW9uYWxDYXNlRXhwcj4gPSBbXTtcbiAgZm9yIChjb25zdCBzd2l0Y2hDYXNlIG9mIHN3aXRjaEJsb2NrLmNhc2VzKSB7XG4gICAgY29uc3QgY1ZpZXcgPSB1bml0LmpvYi5hbGxvY2F0ZVZpZXcodW5pdC54cmVmKTtcbiAgICBjb25zdCB0YWdOYW1lID0gaW5nZXN0Q29udHJvbEZsb3dJbnNlcnRpb25Qb2ludCh1bml0LCBjVmlldy54cmVmLCBzd2l0Y2hDYXNlKTtcbiAgICBsZXQgc3dpdGNoQ2FzZUkxOG5NZXRhOiBpMThuLkJsb2NrUGxhY2Vob2xkZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgaWYgKHN3aXRjaENhc2UuaTE4biAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAoIShzd2l0Y2hDYXNlLmkxOG4gaW5zdGFuY2VvZiBpMThuLkJsb2NrUGxhY2Vob2xkZXIpKSB7XG4gICAgICAgIHRocm93IEVycm9yKFxuICAgICAgICAgIGBVbmhhbmRsZWQgaTE4biBtZXRhZGF0YSB0eXBlIGZvciBzd2l0Y2ggYmxvY2s6ICR7c3dpdGNoQ2FzZS5pMThuPy5jb25zdHJ1Y3Rvci5uYW1lfWAsXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBzd2l0Y2hDYXNlSTE4bk1ldGEgPSBzd2l0Y2hDYXNlLmkxOG47XG4gICAgfVxuICAgIGNvbnN0IHRlbXBsYXRlT3AgPSBpci5jcmVhdGVUZW1wbGF0ZU9wKFxuICAgICAgY1ZpZXcueHJlZixcbiAgICAgIGlyLlRlbXBsYXRlS2luZC5CbG9jayxcbiAgICAgIHRhZ05hbWUsXG4gICAgICAnQ2FzZScsXG4gICAgICBpci5OYW1lc3BhY2UuSFRNTCxcbiAgICAgIHN3aXRjaENhc2VJMThuTWV0YSxcbiAgICAgIHN3aXRjaENhc2Uuc3RhcnRTb3VyY2VTcGFuLFxuICAgICAgc3dpdGNoQ2FzZS5zb3VyY2VTcGFuLFxuICAgICk7XG4gICAgdW5pdC5jcmVhdGUucHVzaCh0ZW1wbGF0ZU9wKTtcbiAgICBpZiAoZmlyc3RYcmVmID09PSBudWxsKSB7XG4gICAgICBmaXJzdFhyZWYgPSBjVmlldy54cmVmO1xuICAgIH1cbiAgICBjb25zdCBjYXNlRXhwciA9IHN3aXRjaENhc2UuZXhwcmVzc2lvblxuICAgICAgPyBjb252ZXJ0QXN0KHN3aXRjaENhc2UuZXhwcmVzc2lvbiwgdW5pdC5qb2IsIHN3aXRjaEJsb2NrLnN0YXJ0U291cmNlU3BhbilcbiAgICAgIDogbnVsbDtcbiAgICBjb25zdCBjb25kaXRpb25hbENhc2VFeHByID0gbmV3IGlyLkNvbmRpdGlvbmFsQ2FzZUV4cHIoXG4gICAgICBjYXNlRXhwcixcbiAgICAgIHRlbXBsYXRlT3AueHJlZixcbiAgICAgIHRlbXBsYXRlT3AuaGFuZGxlLFxuICAgICk7XG4gICAgY29uZGl0aW9ucy5wdXNoKGNvbmRpdGlvbmFsQ2FzZUV4cHIpO1xuICAgIGluZ2VzdE5vZGVzKGNWaWV3LCBzd2l0Y2hDYXNlLmNoaWxkcmVuKTtcbiAgfVxuICB1bml0LnVwZGF0ZS5wdXNoKFxuICAgIGlyLmNyZWF0ZUNvbmRpdGlvbmFsT3AoXG4gICAgICBmaXJzdFhyZWYhLFxuICAgICAgY29udmVydEFzdChzd2l0Y2hCbG9jay5leHByZXNzaW9uLCB1bml0LmpvYiwgbnVsbCksXG4gICAgICBjb25kaXRpb25zLFxuICAgICAgc3dpdGNoQmxvY2suc291cmNlU3BhbixcbiAgICApLFxuICApO1xufVxuXG5mdW5jdGlvbiBpbmdlc3REZWZlclZpZXcoXG4gIHVuaXQ6IFZpZXdDb21waWxhdGlvblVuaXQsXG4gIHN1ZmZpeDogc3RyaW5nLFxuICBpMThuTWV0YTogaTE4bi5JMThuTWV0YSB8IHVuZGVmaW5lZCxcbiAgY2hpbGRyZW4/OiB0Lk5vZGVbXSxcbiAgc291cmNlU3Bhbj86IFBhcnNlU291cmNlU3Bhbixcbik6IGlyLlRlbXBsYXRlT3AgfCBudWxsIHtcbiAgaWYgKGkxOG5NZXRhICE9PSB1bmRlZmluZWQgJiYgIShpMThuTWV0YSBpbnN0YW5jZW9mIGkxOG4uQmxvY2tQbGFjZWhvbGRlcikpIHtcbiAgICB0aHJvdyBFcnJvcignVW5oYW5kbGVkIGkxOG4gbWV0YWRhdGEgdHlwZSBmb3IgZGVmZXIgYmxvY2snKTtcbiAgfVxuICBpZiAoY2hpbGRyZW4gPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGNvbnN0IHNlY29uZGFyeVZpZXcgPSB1bml0LmpvYi5hbGxvY2F0ZVZpZXcodW5pdC54cmVmKTtcbiAgaW5nZXN0Tm9kZXMoc2Vjb25kYXJ5VmlldywgY2hpbGRyZW4pO1xuICBjb25zdCB0ZW1wbGF0ZU9wID0gaXIuY3JlYXRlVGVtcGxhdGVPcChcbiAgICBzZWNvbmRhcnlWaWV3LnhyZWYsXG4gICAgaXIuVGVtcGxhdGVLaW5kLkJsb2NrLFxuICAgIG51bGwsXG4gICAgYERlZmVyJHtzdWZmaXh9YCxcbiAgICBpci5OYW1lc3BhY2UuSFRNTCxcbiAgICBpMThuTWV0YSxcbiAgICBzb3VyY2VTcGFuISxcbiAgICBzb3VyY2VTcGFuISxcbiAgKTtcbiAgdW5pdC5jcmVhdGUucHVzaCh0ZW1wbGF0ZU9wKTtcbiAgcmV0dXJuIHRlbXBsYXRlT3A7XG59XG5cbmZ1bmN0aW9uIGluZ2VzdERlZmVyQmxvY2sodW5pdDogVmlld0NvbXBpbGF0aW9uVW5pdCwgZGVmZXJCbG9jazogdC5EZWZlcnJlZEJsb2NrKTogdm9pZCB7XG4gIGxldCBvd25SZXNvbHZlckZuOiBvLkV4cHJlc3Npb24gfCBudWxsID0gbnVsbDtcblxuICBpZiAodW5pdC5qb2IuZGVmZXJNZXRhLm1vZGUgPT09IERlZmVyQmxvY2tEZXBzRW1pdE1vZGUuUGVyQmxvY2spIHtcbiAgICBpZiAoIXVuaXQuam9iLmRlZmVyTWV0YS5ibG9ja3MuaGFzKGRlZmVyQmxvY2spKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBBc3NlcnRpb25FcnJvcjogdW5hYmxlIHRvIGZpbmQgYSBkZXBlbmRlbmN5IGZ1bmN0aW9uIGZvciB0aGlzIGRlZmVycmVkIGJsb2NrYCxcbiAgICAgICk7XG4gICAgfVxuICAgIG93blJlc29sdmVyRm4gPSB1bml0LmpvYi5kZWZlck1ldGEuYmxvY2tzLmdldChkZWZlckJsb2NrKSA/PyBudWxsO1xuICB9XG5cbiAgLy8gR2VuZXJhdGUgdGhlIGRlZmVyIG1haW4gdmlldyBhbmQgYWxsIHNlY29uZGFyeSB2aWV3cy5cbiAgY29uc3QgbWFpbiA9IGluZ2VzdERlZmVyVmlldyhcbiAgICB1bml0LFxuICAgICcnLFxuICAgIGRlZmVyQmxvY2suaTE4bixcbiAgICBkZWZlckJsb2NrLmNoaWxkcmVuLFxuICAgIGRlZmVyQmxvY2suc291cmNlU3BhbixcbiAgKSE7XG4gIGNvbnN0IGxvYWRpbmcgPSBpbmdlc3REZWZlclZpZXcoXG4gICAgdW5pdCxcbiAgICAnTG9hZGluZycsXG4gICAgZGVmZXJCbG9jay5sb2FkaW5nPy5pMThuLFxuICAgIGRlZmVyQmxvY2subG9hZGluZz8uY2hpbGRyZW4sXG4gICAgZGVmZXJCbG9jay5sb2FkaW5nPy5zb3VyY2VTcGFuLFxuICApO1xuICBjb25zdCBwbGFjZWhvbGRlciA9IGluZ2VzdERlZmVyVmlldyhcbiAgICB1bml0LFxuICAgICdQbGFjZWhvbGRlcicsXG4gICAgZGVmZXJCbG9jay5wbGFjZWhvbGRlcj8uaTE4bixcbiAgICBkZWZlckJsb2NrLnBsYWNlaG9sZGVyPy5jaGlsZHJlbixcbiAgICBkZWZlckJsb2NrLnBsYWNlaG9sZGVyPy5zb3VyY2VTcGFuLFxuICApO1xuICBjb25zdCBlcnJvciA9IGluZ2VzdERlZmVyVmlldyhcbiAgICB1bml0LFxuICAgICdFcnJvcicsXG4gICAgZGVmZXJCbG9jay5lcnJvcj8uaTE4bixcbiAgICBkZWZlckJsb2NrLmVycm9yPy5jaGlsZHJlbixcbiAgICBkZWZlckJsb2NrLmVycm9yPy5zb3VyY2VTcGFuLFxuICApO1xuXG4gIC8vIENyZWF0ZSB0aGUgbWFpbiBkZWZlciBvcCwgYW5kIG9wcyBmb3IgYWxsIHNlY29uZGFyeSB2aWV3cy5cbiAgY29uc3QgZGVmZXJYcmVmID0gdW5pdC5qb2IuYWxsb2NhdGVYcmVmSWQoKTtcbiAgY29uc3QgZGVmZXJPcCA9IGlyLmNyZWF0ZURlZmVyT3AoXG4gICAgZGVmZXJYcmVmLFxuICAgIG1haW4ueHJlZixcbiAgICBtYWluLmhhbmRsZSxcbiAgICBvd25SZXNvbHZlckZuLFxuICAgIHVuaXQuam9iLmFsbERlZmVycmFibGVEZXBzRm4sXG4gICAgZGVmZXJCbG9jay5zb3VyY2VTcGFuLFxuICApO1xuICBkZWZlck9wLnBsYWNlaG9sZGVyVmlldyA9IHBsYWNlaG9sZGVyPy54cmVmID8/IG51bGw7XG4gIGRlZmVyT3AucGxhY2Vob2xkZXJTbG90ID0gcGxhY2Vob2xkZXI/LmhhbmRsZSA/PyBudWxsO1xuICBkZWZlck9wLmxvYWRpbmdTbG90ID0gbG9hZGluZz8uaGFuZGxlID8/IG51bGw7XG4gIGRlZmVyT3AuZXJyb3JTbG90ID0gZXJyb3I/LmhhbmRsZSA/PyBudWxsO1xuICBkZWZlck9wLnBsYWNlaG9sZGVyTWluaW11bVRpbWUgPSBkZWZlckJsb2NrLnBsYWNlaG9sZGVyPy5taW5pbXVtVGltZSA/PyBudWxsO1xuICBkZWZlck9wLmxvYWRpbmdNaW5pbXVtVGltZSA9IGRlZmVyQmxvY2subG9hZGluZz8ubWluaW11bVRpbWUgPz8gbnVsbDtcbiAgZGVmZXJPcC5sb2FkaW5nQWZ0ZXJUaW1lID0gZGVmZXJCbG9jay5sb2FkaW5nPy5hZnRlclRpbWUgPz8gbnVsbDtcbiAgdW5pdC5jcmVhdGUucHVzaChkZWZlck9wKTtcblxuICAvLyBDb25maWd1cmUgYWxsIGRlZmVyIGBvbmAgY29uZGl0aW9ucy5cbiAgLy8gVE9ETzogcmVmYWN0b3IgcHJlZmV0Y2ggdHJpZ2dlcnMgdG8gdXNlIGEgc2VwYXJhdGUgb3AgdHlwZSwgd2l0aCBhIHNoYXJlZCBzdXBlcmNsYXNzLiBUaGlzIHdpbGxcbiAgLy8gbWFrZSBpdCBlYXNpZXIgdG8gcmVmYWN0b3IgcHJlZmV0Y2ggYmVoYXZpb3IgaW4gdGhlIGZ1dHVyZS5cbiAgbGV0IHByZWZldGNoID0gZmFsc2U7XG4gIGxldCBkZWZlck9uT3BzOiBpci5EZWZlck9uT3BbXSA9IFtdO1xuICBsZXQgZGVmZXJXaGVuT3BzOiBpci5EZWZlcldoZW5PcFtdID0gW107XG4gIGZvciAoY29uc3QgdHJpZ2dlcnMgb2YgW2RlZmVyQmxvY2sudHJpZ2dlcnMsIGRlZmVyQmxvY2sucHJlZmV0Y2hUcmlnZ2Vyc10pIHtcbiAgICBpZiAodHJpZ2dlcnMuaWRsZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBjb25zdCBkZWZlck9uT3AgPSBpci5jcmVhdGVEZWZlck9uT3AoXG4gICAgICAgIGRlZmVyWHJlZixcbiAgICAgICAge2tpbmQ6IGlyLkRlZmVyVHJpZ2dlcktpbmQuSWRsZX0sXG4gICAgICAgIHByZWZldGNoLFxuICAgICAgICB0cmlnZ2Vycy5pZGxlLnNvdXJjZVNwYW4sXG4gICAgICApO1xuICAgICAgZGVmZXJPbk9wcy5wdXNoKGRlZmVyT25PcCk7XG4gICAgfVxuICAgIGlmICh0cmlnZ2Vycy5pbW1lZGlhdGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgY29uc3QgZGVmZXJPbk9wID0gaXIuY3JlYXRlRGVmZXJPbk9wKFxuICAgICAgICBkZWZlclhyZWYsXG4gICAgICAgIHtraW5kOiBpci5EZWZlclRyaWdnZXJLaW5kLkltbWVkaWF0ZX0sXG4gICAgICAgIHByZWZldGNoLFxuICAgICAgICB0cmlnZ2Vycy5pbW1lZGlhdGUuc291cmNlU3BhbixcbiAgICAgICk7XG4gICAgICBkZWZlck9uT3BzLnB1c2goZGVmZXJPbk9wKTtcbiAgICB9XG4gICAgaWYgKHRyaWdnZXJzLnRpbWVyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGNvbnN0IGRlZmVyT25PcCA9IGlyLmNyZWF0ZURlZmVyT25PcChcbiAgICAgICAgZGVmZXJYcmVmLFxuICAgICAgICB7a2luZDogaXIuRGVmZXJUcmlnZ2VyS2luZC5UaW1lciwgZGVsYXk6IHRyaWdnZXJzLnRpbWVyLmRlbGF5fSxcbiAgICAgICAgcHJlZmV0Y2gsXG4gICAgICAgIHRyaWdnZXJzLnRpbWVyLnNvdXJjZVNwYW4sXG4gICAgICApO1xuICAgICAgZGVmZXJPbk9wcy5wdXNoKGRlZmVyT25PcCk7XG4gICAgfVxuICAgIGlmICh0cmlnZ2Vycy5ob3ZlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBjb25zdCBkZWZlck9uT3AgPSBpci5jcmVhdGVEZWZlck9uT3AoXG4gICAgICAgIGRlZmVyWHJlZixcbiAgICAgICAge1xuICAgICAgICAgIGtpbmQ6IGlyLkRlZmVyVHJpZ2dlcktpbmQuSG92ZXIsXG4gICAgICAgICAgdGFyZ2V0TmFtZTogdHJpZ2dlcnMuaG92ZXIucmVmZXJlbmNlLFxuICAgICAgICAgIHRhcmdldFhyZWY6IG51bGwsXG4gICAgICAgICAgdGFyZ2V0U2xvdDogbnVsbCxcbiAgICAgICAgICB0YXJnZXRWaWV3OiBudWxsLFxuICAgICAgICAgIHRhcmdldFNsb3RWaWV3U3RlcHM6IG51bGwsXG4gICAgICAgIH0sXG4gICAgICAgIHByZWZldGNoLFxuICAgICAgICB0cmlnZ2Vycy5ob3Zlci5zb3VyY2VTcGFuLFxuICAgICAgKTtcbiAgICAgIGRlZmVyT25PcHMucHVzaChkZWZlck9uT3ApO1xuICAgIH1cbiAgICBpZiAodHJpZ2dlcnMuaW50ZXJhY3Rpb24gIT09IHVuZGVmaW5lZCkge1xuICAgICAgY29uc3QgZGVmZXJPbk9wID0gaXIuY3JlYXRlRGVmZXJPbk9wKFxuICAgICAgICBkZWZlclhyZWYsXG4gICAgICAgIHtcbiAgICAgICAgICBraW5kOiBpci5EZWZlclRyaWdnZXJLaW5kLkludGVyYWN0aW9uLFxuICAgICAgICAgIHRhcmdldE5hbWU6IHRyaWdnZXJzLmludGVyYWN0aW9uLnJlZmVyZW5jZSxcbiAgICAgICAgICB0YXJnZXRYcmVmOiBudWxsLFxuICAgICAgICAgIHRhcmdldFNsb3Q6IG51bGwsXG4gICAgICAgICAgdGFyZ2V0VmlldzogbnVsbCxcbiAgICAgICAgICB0YXJnZXRTbG90Vmlld1N0ZXBzOiBudWxsLFxuICAgICAgICB9LFxuICAgICAgICBwcmVmZXRjaCxcbiAgICAgICAgdHJpZ2dlcnMuaW50ZXJhY3Rpb24uc291cmNlU3BhbixcbiAgICAgICk7XG4gICAgICBkZWZlck9uT3BzLnB1c2goZGVmZXJPbk9wKTtcbiAgICB9XG4gICAgaWYgKHRyaWdnZXJzLnZpZXdwb3J0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGNvbnN0IGRlZmVyT25PcCA9IGlyLmNyZWF0ZURlZmVyT25PcChcbiAgICAgICAgZGVmZXJYcmVmLFxuICAgICAgICB7XG4gICAgICAgICAga2luZDogaXIuRGVmZXJUcmlnZ2VyS2luZC5WaWV3cG9ydCxcbiAgICAgICAgICB0YXJnZXROYW1lOiB0cmlnZ2Vycy52aWV3cG9ydC5yZWZlcmVuY2UsXG4gICAgICAgICAgdGFyZ2V0WHJlZjogbnVsbCxcbiAgICAgICAgICB0YXJnZXRTbG90OiBudWxsLFxuICAgICAgICAgIHRhcmdldFZpZXc6IG51bGwsXG4gICAgICAgICAgdGFyZ2V0U2xvdFZpZXdTdGVwczogbnVsbCxcbiAgICAgICAgfSxcbiAgICAgICAgcHJlZmV0Y2gsXG4gICAgICAgIHRyaWdnZXJzLnZpZXdwb3J0LnNvdXJjZVNwYW4sXG4gICAgICApO1xuICAgICAgZGVmZXJPbk9wcy5wdXNoKGRlZmVyT25PcCk7XG4gICAgfVxuICAgIGlmICh0cmlnZ2Vycy53aGVuICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmICh0cmlnZ2Vycy53aGVuLnZhbHVlIGluc3RhbmNlb2YgZS5JbnRlcnBvbGF0aW9uKSB7XG4gICAgICAgIC8vIFRlbXBsYXRlRGVmaW5pdGlvbkJ1aWxkZXIgc3VwcG9ydHMgdGhpcyBjYXNlLCBidXQgaXQncyB2ZXJ5IHN0cmFuZ2UgdG8gbWUuIFdoYXQgd291bGQgaXRcbiAgICAgICAgLy8gZXZlbiBtZWFuP1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuZXhwZWN0ZWQgaW50ZXJwb2xhdGlvbiBpbiBkZWZlciBibG9jayB3aGVuIHRyaWdnZXJgKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGRlZmVyT25PcCA9IGlyLmNyZWF0ZURlZmVyV2hlbk9wKFxuICAgICAgICBkZWZlclhyZWYsXG4gICAgICAgIGNvbnZlcnRBc3QodHJpZ2dlcnMud2hlbi52YWx1ZSwgdW5pdC5qb2IsIHRyaWdnZXJzLndoZW4uc291cmNlU3BhbiksXG4gICAgICAgIHByZWZldGNoLFxuICAgICAgICB0cmlnZ2Vycy53aGVuLnNvdXJjZVNwYW4sXG4gICAgICApO1xuICAgICAgZGVmZXJXaGVuT3BzLnB1c2goZGVmZXJPbk9wKTtcbiAgICB9XG5cbiAgICAvLyBJZiBubyAobm9uLXByZWZldGNoaW5nKSBkZWZlciB0cmlnZ2VycyB3ZXJlIHByb3ZpZGVkLCBkZWZhdWx0IHRvIGBpZGxlYC5cbiAgICBpZiAoZGVmZXJPbk9wcy5sZW5ndGggPT09IDAgJiYgZGVmZXJXaGVuT3BzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgZGVmZXJPbk9wcy5wdXNoKFxuICAgICAgICBpci5jcmVhdGVEZWZlck9uT3AoZGVmZXJYcmVmLCB7a2luZDogaXIuRGVmZXJUcmlnZ2VyS2luZC5JZGxlfSwgZmFsc2UsIG51bGwhKSxcbiAgICAgICk7XG4gICAgfVxuICAgIHByZWZldGNoID0gdHJ1ZTtcbiAgfVxuXG4gIHVuaXQuY3JlYXRlLnB1c2goZGVmZXJPbk9wcyk7XG4gIHVuaXQudXBkYXRlLnB1c2goZGVmZXJXaGVuT3BzKTtcbn1cblxuZnVuY3Rpb24gaW5nZXN0SWN1KHVuaXQ6IFZpZXdDb21waWxhdGlvblVuaXQsIGljdTogdC5JY3UpIHtcbiAgaWYgKGljdS5pMThuIGluc3RhbmNlb2YgaTE4bi5NZXNzYWdlICYmIGlzU2luZ2xlSTE4bkljdShpY3UuaTE4bikpIHtcbiAgICBjb25zdCB4cmVmID0gdW5pdC5qb2IuYWxsb2NhdGVYcmVmSWQoKTtcbiAgICB1bml0LmNyZWF0ZS5wdXNoKGlyLmNyZWF0ZUljdVN0YXJ0T3AoeHJlZiwgaWN1LmkxOG4sIGljdUZyb21JMThuTWVzc2FnZShpY3UuaTE4bikubmFtZSwgbnVsbCEpKTtcbiAgICBmb3IgKGNvbnN0IFtwbGFjZWhvbGRlciwgdGV4dF0gb2YgT2JqZWN0LmVudHJpZXMoey4uLmljdS52YXJzLCAuLi5pY3UucGxhY2Vob2xkZXJzfSkpIHtcbiAgICAgIGlmICh0ZXh0IGluc3RhbmNlb2YgdC5Cb3VuZFRleHQpIHtcbiAgICAgICAgaW5nZXN0Qm91bmRUZXh0KHVuaXQsIHRleHQsIHBsYWNlaG9sZGVyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGluZ2VzdFRleHQodW5pdCwgdGV4dCwgcGxhY2Vob2xkZXIpO1xuICAgICAgfVxuICAgIH1cbiAgICB1bml0LmNyZWF0ZS5wdXNoKGlyLmNyZWF0ZUljdUVuZE9wKHhyZWYpKTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBFcnJvcihgVW5oYW5kbGVkIGkxOG4gbWV0YWRhdGEgdHlwZSBmb3IgSUNVOiAke2ljdS5pMThuPy5jb25zdHJ1Y3Rvci5uYW1lfWApO1xuICB9XG59XG5cbi8qKlxuICogSW5nZXN0IGFuIGBAZm9yYCBibG9jayBpbnRvIHRoZSBnaXZlbiBgVmlld0NvbXBpbGF0aW9uYC5cbiAqL1xuZnVuY3Rpb24gaW5nZXN0Rm9yQmxvY2sodW5pdDogVmlld0NvbXBpbGF0aW9uVW5pdCwgZm9yQmxvY2s6IHQuRm9yTG9vcEJsb2NrKTogdm9pZCB7XG4gIGNvbnN0IHJlcGVhdGVyVmlldyA9IHVuaXQuam9iLmFsbG9jYXRlVmlldyh1bml0LnhyZWYpO1xuXG4gIC8vIFdlIGNvcHkgVGVtcGxhdGVEZWZpbml0aW9uQnVpbGRlcidzIHNjaGVtZSBvZiBjcmVhdGluZyBuYW1lcyBmb3IgYCRjb3VudGAgYW5kIGAkaW5kZXhgXG4gIC8vIHRoYXQgYXJlIHN1ZmZpeGVkIHdpdGggc3BlY2lhbCBpbmZvcm1hdGlvbiwgdG8gZGlzYW1iaWd1YXRlIHdoaWNoIGxldmVsIG9mIG5lc3RlZCBsb29wXG4gIC8vIHRoZSBiZWxvdyBhbGlhc2VzIHJlZmVyIHRvLlxuICAvLyBUT0RPOiBXZSBzaG91bGQgcmVmYWN0b3IgVGVtcGxhdGUgUGlwZWxpbmUncyB2YXJpYWJsZSBwaGFzZXMgdG8gZ3JhY2VmdWxseSBoYW5kbGVcbiAgLy8gc2hhZG93aW5nLCBhbmQgYXJiaXRyYXJpbHkgbWFueSBsZXZlbHMgb2YgdmFyaWFibGVzIGRlcGVuZGluZyBvbiBlYWNoIG90aGVyLlxuICBjb25zdCBpbmRleE5hbWUgPSBgybUkaW5kZXhfJHtyZXBlYXRlclZpZXcueHJlZn1gO1xuICBjb25zdCBjb3VudE5hbWUgPSBgybUkY291bnRfJHtyZXBlYXRlclZpZXcueHJlZn1gO1xuICBjb25zdCBpbmRleFZhck5hbWVzID0gbmV3IFNldDxzdHJpbmc+KCk7XG5cbiAgLy8gU2V0IGFsbCB0aGUgY29udGV4dCB2YXJpYWJsZXMgYW5kIGFsaWFzZXMgYXZhaWxhYmxlIGluIHRoZSByZXBlYXRlci5cbiAgcmVwZWF0ZXJWaWV3LmNvbnRleHRWYXJpYWJsZXMuc2V0KGZvckJsb2NrLml0ZW0ubmFtZSwgZm9yQmxvY2suaXRlbS52YWx1ZSk7XG5cbiAgZm9yIChjb25zdCB2YXJpYWJsZSBvZiBmb3JCbG9jay5jb250ZXh0VmFyaWFibGVzKSB7XG4gICAgaWYgKHZhcmlhYmxlLnZhbHVlID09PSAnJGluZGV4Jykge1xuICAgICAgaW5kZXhWYXJOYW1lcy5hZGQodmFyaWFibGUubmFtZSk7XG4gICAgfVxuICAgIGlmICh2YXJpYWJsZS5uYW1lID09PSAnJGluZGV4Jykge1xuICAgICAgcmVwZWF0ZXJWaWV3LmNvbnRleHRWYXJpYWJsZXMuc2V0KCckaW5kZXgnLCB2YXJpYWJsZS52YWx1ZSkuc2V0KGluZGV4TmFtZSwgdmFyaWFibGUudmFsdWUpO1xuICAgIH0gZWxzZSBpZiAodmFyaWFibGUubmFtZSA9PT0gJyRjb3VudCcpIHtcbiAgICAgIHJlcGVhdGVyVmlldy5jb250ZXh0VmFyaWFibGVzLnNldCgnJGNvdW50JywgdmFyaWFibGUudmFsdWUpLnNldChjb3VudE5hbWUsIHZhcmlhYmxlLnZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVwZWF0ZXJWaWV3LmFsaWFzZXMuYWRkKHtcbiAgICAgICAga2luZDogaXIuU2VtYW50aWNWYXJpYWJsZUtpbmQuQWxpYXMsXG4gICAgICAgIG5hbWU6IG51bGwsXG4gICAgICAgIGlkZW50aWZpZXI6IHZhcmlhYmxlLm5hbWUsXG4gICAgICAgIGV4cHJlc3Npb246IGdldENvbXB1dGVkRm9yTG9vcFZhcmlhYmxlRXhwcmVzc2lvbih2YXJpYWJsZSwgaW5kZXhOYW1lLCBjb3VudE5hbWUpLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgY29uc3Qgc291cmNlU3BhbiA9IGNvbnZlcnRTb3VyY2VTcGFuKGZvckJsb2NrLnRyYWNrQnkuc3BhbiwgZm9yQmxvY2suc291cmNlU3Bhbik7XG4gIGNvbnN0IHRyYWNrID0gY29udmVydEFzdChmb3JCbG9jay50cmFja0J5LCB1bml0LmpvYiwgc291cmNlU3Bhbik7XG5cbiAgaW5nZXN0Tm9kZXMocmVwZWF0ZXJWaWV3LCBmb3JCbG9jay5jaGlsZHJlbik7XG5cbiAgbGV0IGVtcHR5VmlldzogVmlld0NvbXBpbGF0aW9uVW5pdCB8IG51bGwgPSBudWxsO1xuICBsZXQgZW1wdHlUYWdOYW1lOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcbiAgaWYgKGZvckJsb2NrLmVtcHR5ICE9PSBudWxsKSB7XG4gICAgZW1wdHlWaWV3ID0gdW5pdC5qb2IuYWxsb2NhdGVWaWV3KHVuaXQueHJlZik7XG4gICAgaW5nZXN0Tm9kZXMoZW1wdHlWaWV3LCBmb3JCbG9jay5lbXB0eS5jaGlsZHJlbik7XG4gICAgZW1wdHlUYWdOYW1lID0gaW5nZXN0Q29udHJvbEZsb3dJbnNlcnRpb25Qb2ludCh1bml0LCBlbXB0eVZpZXcueHJlZiwgZm9yQmxvY2suZW1wdHkpO1xuICB9XG5cbiAgY29uc3QgdmFyTmFtZXM6IGlyLlJlcGVhdGVyVmFyTmFtZXMgPSB7XG4gICAgJGluZGV4OiBpbmRleFZhck5hbWVzLFxuICAgICRpbXBsaWNpdDogZm9yQmxvY2suaXRlbS5uYW1lLFxuICB9O1xuXG4gIGlmIChmb3JCbG9jay5pMThuICE9PSB1bmRlZmluZWQgJiYgIShmb3JCbG9jay5pMThuIGluc3RhbmNlb2YgaTE4bi5CbG9ja1BsYWNlaG9sZGVyKSkge1xuICAgIHRocm93IEVycm9yKCdBc3NlcnRpb25FcnJvcjogVW5oYW5kbGVkIGkxOG4gbWV0YWRhdGEgdHlwZSBvciBAZm9yJyk7XG4gIH1cbiAgaWYgKFxuICAgIGZvckJsb2NrLmVtcHR5Py5pMThuICE9PSB1bmRlZmluZWQgJiZcbiAgICAhKGZvckJsb2NrLmVtcHR5LmkxOG4gaW5zdGFuY2VvZiBpMThuLkJsb2NrUGxhY2Vob2xkZXIpXG4gICkge1xuICAgIHRocm93IEVycm9yKCdBc3NlcnRpb25FcnJvcjogVW5oYW5kbGVkIGkxOG4gbWV0YWRhdGEgdHlwZSBvciBAZW1wdHknKTtcbiAgfVxuICBjb25zdCBpMThuUGxhY2Vob2xkZXIgPSBmb3JCbG9jay5pMThuO1xuICBjb25zdCBlbXB0eUkxOG5QbGFjZWhvbGRlciA9IGZvckJsb2NrLmVtcHR5Py5pMThuO1xuXG4gIGNvbnN0IHRhZ05hbWUgPSBpbmdlc3RDb250cm9sRmxvd0luc2VydGlvblBvaW50KHVuaXQsIHJlcGVhdGVyVmlldy54cmVmLCBmb3JCbG9jayk7XG4gIGNvbnN0IHJlcGVhdGVyQ3JlYXRlID0gaXIuY3JlYXRlUmVwZWF0ZXJDcmVhdGVPcChcbiAgICByZXBlYXRlclZpZXcueHJlZixcbiAgICBlbXB0eVZpZXc/LnhyZWYgPz8gbnVsbCxcbiAgICB0YWdOYW1lLFxuICAgIHRyYWNrLFxuICAgIHZhck5hbWVzLFxuICAgIGVtcHR5VGFnTmFtZSxcbiAgICBpMThuUGxhY2Vob2xkZXIsXG4gICAgZW1wdHlJMThuUGxhY2Vob2xkZXIsXG4gICAgZm9yQmxvY2suc3RhcnRTb3VyY2VTcGFuLFxuICAgIGZvckJsb2NrLnNvdXJjZVNwYW4sXG4gICk7XG4gIHVuaXQuY3JlYXRlLnB1c2gocmVwZWF0ZXJDcmVhdGUpO1xuXG4gIGNvbnN0IGV4cHJlc3Npb24gPSBjb252ZXJ0QXN0KFxuICAgIGZvckJsb2NrLmV4cHJlc3Npb24sXG4gICAgdW5pdC5qb2IsXG4gICAgY29udmVydFNvdXJjZVNwYW4oZm9yQmxvY2suZXhwcmVzc2lvbi5zcGFuLCBmb3JCbG9jay5zb3VyY2VTcGFuKSxcbiAgKTtcbiAgY29uc3QgcmVwZWF0ZXIgPSBpci5jcmVhdGVSZXBlYXRlck9wKFxuICAgIHJlcGVhdGVyQ3JlYXRlLnhyZWYsXG4gICAgcmVwZWF0ZXJDcmVhdGUuaGFuZGxlLFxuICAgIGV4cHJlc3Npb24sXG4gICAgZm9yQmxvY2suc291cmNlU3BhbixcbiAgKTtcbiAgdW5pdC51cGRhdGUucHVzaChyZXBlYXRlcik7XG59XG5cbi8qKlxuICogR2V0cyBhbiBleHByZXNzaW9uIHRoYXQgcmVwcmVzZW50cyBhIHZhcmlhYmxlIGluIGFuIGBAZm9yYCBsb29wLlxuICogQHBhcmFtIHZhcmlhYmxlIEFTVCByZXByZXNlbnRpbmcgdGhlIHZhcmlhYmxlLlxuICogQHBhcmFtIGluZGV4TmFtZSBMb29wLXNwZWNpZmljIG5hbWUgZm9yIGAkaW5kZXhgLlxuICogQHBhcmFtIGNvdW50TmFtZSBMb29wLXNwZWNpZmljIG5hbWUgZm9yIGAkY291bnRgLlxuICovXG5mdW5jdGlvbiBnZXRDb21wdXRlZEZvckxvb3BWYXJpYWJsZUV4cHJlc3Npb24oXG4gIHZhcmlhYmxlOiB0LlZhcmlhYmxlLFxuICBpbmRleE5hbWU6IHN0cmluZyxcbiAgY291bnROYW1lOiBzdHJpbmcsXG4pOiBvLkV4cHJlc3Npb24ge1xuICBzd2l0Y2ggKHZhcmlhYmxlLnZhbHVlKSB7XG4gICAgY2FzZSAnJGluZGV4JzpcbiAgICAgIHJldHVybiBuZXcgaXIuTGV4aWNhbFJlYWRFeHByKGluZGV4TmFtZSk7XG5cbiAgICBjYXNlICckY291bnQnOlxuICAgICAgcmV0dXJuIG5ldyBpci5MZXhpY2FsUmVhZEV4cHIoY291bnROYW1lKTtcblxuICAgIGNhc2UgJyRmaXJzdCc6XG4gICAgICByZXR1cm4gbmV3IGlyLkxleGljYWxSZWFkRXhwcihpbmRleE5hbWUpLmlkZW50aWNhbChvLmxpdGVyYWwoMCkpO1xuXG4gICAgY2FzZSAnJGxhc3QnOlxuICAgICAgcmV0dXJuIG5ldyBpci5MZXhpY2FsUmVhZEV4cHIoaW5kZXhOYW1lKS5pZGVudGljYWwoXG4gICAgICAgIG5ldyBpci5MZXhpY2FsUmVhZEV4cHIoY291bnROYW1lKS5taW51cyhvLmxpdGVyYWwoMSkpLFxuICAgICAgKTtcblxuICAgIGNhc2UgJyRldmVuJzpcbiAgICAgIHJldHVybiBuZXcgaXIuTGV4aWNhbFJlYWRFeHByKGluZGV4TmFtZSkubW9kdWxvKG8ubGl0ZXJhbCgyKSkuaWRlbnRpY2FsKG8ubGl0ZXJhbCgwKSk7XG5cbiAgICBjYXNlICckb2RkJzpcbiAgICAgIHJldHVybiBuZXcgaXIuTGV4aWNhbFJlYWRFeHByKGluZGV4TmFtZSkubW9kdWxvKG8ubGl0ZXJhbCgyKSkubm90SWRlbnRpY2FsKG8ubGl0ZXJhbCgwKSk7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBBc3NlcnRpb25FcnJvcjogdW5rbm93biBAZm9yIGxvb3AgdmFyaWFibGUgJHt2YXJpYWJsZS52YWx1ZX1gKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpbmdlc3RMZXREZWNsYXJhdGlvbih1bml0OiBWaWV3Q29tcGlsYXRpb25Vbml0LCBub2RlOiB0LkxldERlY2xhcmF0aW9uKSB7XG4gIGNvbnN0IHRhcmdldCA9IHVuaXQuam9iLmFsbG9jYXRlWHJlZklkKCk7XG5cbiAgdW5pdC5jcmVhdGUucHVzaChpci5jcmVhdGVEZWNsYXJlTGV0T3AodGFyZ2V0LCBub2RlLm5hbWUsIG5vZGUuc291cmNlU3BhbikpO1xuICB1bml0LnVwZGF0ZS5wdXNoKFxuICAgIGlyLmNyZWF0ZVN0b3JlTGV0T3AoXG4gICAgICB0YXJnZXQsXG4gICAgICBub2RlLm5hbWUsXG4gICAgICBjb252ZXJ0QXN0KG5vZGUudmFsdWUsIHVuaXQuam9iLCBub2RlLnZhbHVlU3BhbiksXG4gICAgICBub2RlLnNvdXJjZVNwYW4sXG4gICAgKSxcbiAgKTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGEgdGVtcGxhdGUgQVNUIGV4cHJlc3Npb24gaW50byBhbiBvdXRwdXQgQVNUIGV4cHJlc3Npb24uXG4gKi9cbmZ1bmN0aW9uIGNvbnZlcnRBc3QoXG4gIGFzdDogZS5BU1QsXG4gIGpvYjogQ29tcGlsYXRpb25Kb2IsXG4gIGJhc2VTb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4gfCBudWxsLFxuKTogby5FeHByZXNzaW9uIHtcbiAgaWYgKGFzdCBpbnN0YW5jZW9mIGUuQVNUV2l0aFNvdXJjZSkge1xuICAgIHJldHVybiBjb252ZXJ0QXN0KGFzdC5hc3QsIGpvYiwgYmFzZVNvdXJjZVNwYW4pO1xuICB9IGVsc2UgaWYgKGFzdCBpbnN0YW5jZW9mIGUuUHJvcGVydHlSZWFkKSB7XG4gICAgY29uc3QgaXNUaGlzUmVjZWl2ZXIgPSBhc3QucmVjZWl2ZXIgaW5zdGFuY2VvZiBlLlRoaXNSZWNlaXZlcjtcbiAgICAvLyBXaGV0aGVyIHRoaXMgaXMgYW4gaW1wbGljaXQgcmVjZWl2ZXIsICpleGNsdWRpbmcqIGV4cGxpY2l0IHJlYWRzIG9mIGB0aGlzYC5cbiAgICBjb25zdCBpc0ltcGxpY2l0UmVjZWl2ZXIgPVxuICAgICAgYXN0LnJlY2VpdmVyIGluc3RhbmNlb2YgZS5JbXBsaWNpdFJlY2VpdmVyICYmICEoYXN0LnJlY2VpdmVyIGluc3RhbmNlb2YgZS5UaGlzUmVjZWl2ZXIpO1xuICAgIC8vIFdoZXRoZXIgdGhlICBuYW1lIG9mIHRoZSByZWFkIGlzIGEgbm9kZSB0aGF0IHNob3VsZCBiZSBuZXZlciByZXRhaW4gaXRzIGV4cGxpY2l0IHRoaXNcbiAgICAvLyByZWNlaXZlci5cbiAgICBjb25zdCBpc1NwZWNpYWxOb2RlID0gYXN0Lm5hbWUgPT09ICckYW55JyB8fCBhc3QubmFtZSA9PT0gJyRldmVudCc7XG4gICAgLy8gVE9ETzogVGhlIG1vc3Qgc2Vuc2libGUgY29uZGl0aW9uIGhlcmUgd291bGQgYmUgc2ltcGx5IGBpc0ltcGxpY2l0UmVjZWl2ZXJgLCB0byBjb252ZXJ0IG9ubHlcbiAgICAvLyBhY3R1YWwgaW1wbGljaXQgYHRoaXNgIHJlYWRzLCBhbmQgbm90IGV4cGxpY2l0IG9uZXMuIEhvd2V2ZXIsIFRlbXBsYXRlRGVmaW5pdGlvbkJ1aWxkZXIgKGFuZFxuICAgIC8vIHRoZSBUeXBlY2hlY2sgYmxvY2shKSBib3RoIGhhdmUgdGhlIHNhbWUgYnVnLCBpbiB3aGljaCB0aGV5IGFsc28gY29uc2lkZXIgZXhwbGljaXQgYHRoaXNgXG4gICAgLy8gcmVhZHMgdG8gYmUgaW1wbGljaXQuIFRoaXMgY2F1c2VzIHByb2JsZW1zIHdoZW4gdGhlIGV4cGxpY2l0IGB0aGlzYCByZWFkIGlzIGluc2lkZSBhXG4gICAgLy8gdGVtcGxhdGUgd2l0aCBhIGNvbnRleHQgdGhhdCBhbHNvIHByb3ZpZGVzIHRoZSB2YXJpYWJsZSBuYW1lIGJlaW5nIHJlYWQ6XG4gICAgLy8gYGBgXG4gICAgLy8gPG5nLXRlbXBsYXRlIGxldC1hPnt7dGhpcy5hfX08L25nLXRlbXBsYXRlPlxuICAgIC8vIGBgYFxuICAgIC8vIFRoZSB3aG9sZSBwb2ludCBvZiB0aGUgZXhwbGljaXQgYHRoaXNgIHdhcyB0byBhY2Nlc3MgdGhlIGNsYXNzIHByb3BlcnR5LCBidXQgVERCIGFuZCB0aGVcbiAgICAvLyBjdXJyZW50IFRDQiB0cmVhdCB0aGUgcmVhZCBhcyBpbXBsaWNpdCwgYW5kIGdpdmUgeW91IHRoZSBjb250ZXh0IHByb3BlcnR5IGluc3RlYWQhXG4gICAgLy9cbiAgICAvLyBGb3Igbm93LCB3ZSBlbXVsYXRlIHRoaXMgb2xkIGJlaGF2aW9yIGJ5IGFnZ3Jlc3NpdmVseSBjb252ZXJ0aW5nIGV4cGxpY2l0IHJlYWRzIHRvIHRvXG4gICAgLy8gaW1wbGljaXQgcmVhZHMsIGV4Y2VwdCBmb3IgdGhlIHNwZWNpYWwgY2FzZXMgdGhhdCBUREIgYW5kIHRoZSBjdXJyZW50IFRDQiBwcm90ZWN0LiBIb3dldmVyLFxuICAgIC8vIGl0IHdvdWxkIGJlIGFuIGltcHJvdmVtZW50IHRvIGZpeCB0aGlzLlxuICAgIC8vXG4gICAgLy8gU2VlIGFsc28gdGhlIGNvcnJlc3BvbmRpbmcgY29tbWVudCBmb3IgdGhlIFRDQiwgaW4gYHR5cGVfY2hlY2tfYmxvY2sudHNgLlxuICAgIGlmIChpc0ltcGxpY2l0UmVjZWl2ZXIgfHwgKGlzVGhpc1JlY2VpdmVyICYmICFpc1NwZWNpYWxOb2RlKSkge1xuICAgICAgcmV0dXJuIG5ldyBpci5MZXhpY2FsUmVhZEV4cHIoYXN0Lm5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbmV3IG8uUmVhZFByb3BFeHByKFxuICAgICAgICBjb252ZXJ0QXN0KGFzdC5yZWNlaXZlciwgam9iLCBiYXNlU291cmNlU3BhbiksXG4gICAgICAgIGFzdC5uYW1lLFxuICAgICAgICBudWxsLFxuICAgICAgICBjb252ZXJ0U291cmNlU3Bhbihhc3Quc3BhbiwgYmFzZVNvdXJjZVNwYW4pLFxuICAgICAgKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoYXN0IGluc3RhbmNlb2YgZS5Qcm9wZXJ0eVdyaXRlKSB7XG4gICAgaWYgKGFzdC5yZWNlaXZlciBpbnN0YW5jZW9mIGUuSW1wbGljaXRSZWNlaXZlcikge1xuICAgICAgcmV0dXJuIG5ldyBvLldyaXRlUHJvcEV4cHIoXG4gICAgICAgIC8vIFRPRE86IElzIGl0IGNvcnJlY3QgdG8gYWx3YXlzIHVzZSB0aGUgcm9vdCBjb250ZXh0IGluIHBsYWNlIG9mIHRoZSBpbXBsaWNpdCByZWNlaXZlcj9cbiAgICAgICAgbmV3IGlyLkNvbnRleHRFeHByKGpvYi5yb290LnhyZWYpLFxuICAgICAgICBhc3QubmFtZSxcbiAgICAgICAgY29udmVydEFzdChhc3QudmFsdWUsIGpvYiwgYmFzZVNvdXJjZVNwYW4pLFxuICAgICAgICBudWxsLFxuICAgICAgICBjb252ZXJ0U291cmNlU3Bhbihhc3Quc3BhbiwgYmFzZVNvdXJjZVNwYW4pLFxuICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBvLldyaXRlUHJvcEV4cHIoXG4gICAgICBjb252ZXJ0QXN0KGFzdC5yZWNlaXZlciwgam9iLCBiYXNlU291cmNlU3BhbiksXG4gICAgICBhc3QubmFtZSxcbiAgICAgIGNvbnZlcnRBc3QoYXN0LnZhbHVlLCBqb2IsIGJhc2VTb3VyY2VTcGFuKSxcbiAgICAgIHVuZGVmaW5lZCxcbiAgICAgIGNvbnZlcnRTb3VyY2VTcGFuKGFzdC5zcGFuLCBiYXNlU291cmNlU3BhbiksXG4gICAgKTtcbiAgfSBlbHNlIGlmIChhc3QgaW5zdGFuY2VvZiBlLktleWVkV3JpdGUpIHtcbiAgICByZXR1cm4gbmV3IG8uV3JpdGVLZXlFeHByKFxuICAgICAgY29udmVydEFzdChhc3QucmVjZWl2ZXIsIGpvYiwgYmFzZVNvdXJjZVNwYW4pLFxuICAgICAgY29udmVydEFzdChhc3Qua2V5LCBqb2IsIGJhc2VTb3VyY2VTcGFuKSxcbiAgICAgIGNvbnZlcnRBc3QoYXN0LnZhbHVlLCBqb2IsIGJhc2VTb3VyY2VTcGFuKSxcbiAgICAgIHVuZGVmaW5lZCxcbiAgICAgIGNvbnZlcnRTb3VyY2VTcGFuKGFzdC5zcGFuLCBiYXNlU291cmNlU3BhbiksXG4gICAgKTtcbiAgfSBlbHNlIGlmIChhc3QgaW5zdGFuY2VvZiBlLkNhbGwpIHtcbiAgICBpZiAoYXN0LnJlY2VpdmVyIGluc3RhbmNlb2YgZS5JbXBsaWNpdFJlY2VpdmVyKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuZXhwZWN0ZWQgSW1wbGljaXRSZWNlaXZlcmApO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbmV3IG8uSW52b2tlRnVuY3Rpb25FeHByKFxuICAgICAgICBjb252ZXJ0QXN0KGFzdC5yZWNlaXZlciwgam9iLCBiYXNlU291cmNlU3BhbiksXG4gICAgICAgIGFzdC5hcmdzLm1hcCgoYXJnKSA9PiBjb252ZXJ0QXN0KGFyZywgam9iLCBiYXNlU291cmNlU3BhbikpLFxuICAgICAgICB1bmRlZmluZWQsXG4gICAgICAgIGNvbnZlcnRTb3VyY2VTcGFuKGFzdC5zcGFuLCBiYXNlU291cmNlU3BhbiksXG4gICAgICApO1xuICAgIH1cbiAgfSBlbHNlIGlmIChhc3QgaW5zdGFuY2VvZiBlLkxpdGVyYWxQcmltaXRpdmUpIHtcbiAgICByZXR1cm4gby5saXRlcmFsKGFzdC52YWx1ZSwgdW5kZWZpbmVkLCBjb252ZXJ0U291cmNlU3Bhbihhc3Quc3BhbiwgYmFzZVNvdXJjZVNwYW4pKTtcbiAgfSBlbHNlIGlmIChhc3QgaW5zdGFuY2VvZiBlLlVuYXJ5KSB7XG4gICAgc3dpdGNoIChhc3Qub3BlcmF0b3IpIHtcbiAgICAgIGNhc2UgJysnOlxuICAgICAgICByZXR1cm4gbmV3IG8uVW5hcnlPcGVyYXRvckV4cHIoXG4gICAgICAgICAgby5VbmFyeU9wZXJhdG9yLlBsdXMsXG4gICAgICAgICAgY29udmVydEFzdChhc3QuZXhwciwgam9iLCBiYXNlU291cmNlU3BhbiksXG4gICAgICAgICAgdW5kZWZpbmVkLFxuICAgICAgICAgIGNvbnZlcnRTb3VyY2VTcGFuKGFzdC5zcGFuLCBiYXNlU291cmNlU3BhbiksXG4gICAgICAgICk7XG4gICAgICBjYXNlICctJzpcbiAgICAgICAgcmV0dXJuIG5ldyBvLlVuYXJ5T3BlcmF0b3JFeHByKFxuICAgICAgICAgIG8uVW5hcnlPcGVyYXRvci5NaW51cyxcbiAgICAgICAgICBjb252ZXJ0QXN0KGFzdC5leHByLCBqb2IsIGJhc2VTb3VyY2VTcGFuKSxcbiAgICAgICAgICB1bmRlZmluZWQsXG4gICAgICAgICAgY29udmVydFNvdXJjZVNwYW4oYXN0LnNwYW4sIGJhc2VTb3VyY2VTcGFuKSxcbiAgICAgICAgKTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgQXNzZXJ0aW9uRXJyb3I6IHVua25vd24gdW5hcnkgb3BlcmF0b3IgJHthc3Qub3BlcmF0b3J9YCk7XG4gICAgfVxuICB9IGVsc2UgaWYgKGFzdCBpbnN0YW5jZW9mIGUuQmluYXJ5KSB7XG4gICAgY29uc3Qgb3BlcmF0b3IgPSBCSU5BUllfT1BFUkFUT1JTLmdldChhc3Qub3BlcmF0aW9uKTtcbiAgICBpZiAob3BlcmF0b3IgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBBc3NlcnRpb25FcnJvcjogdW5rbm93biBiaW5hcnkgb3BlcmF0b3IgJHthc3Qub3BlcmF0aW9ufWApO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IG8uQmluYXJ5T3BlcmF0b3JFeHByKFxuICAgICAgb3BlcmF0b3IsXG4gICAgICBjb252ZXJ0QXN0KGFzdC5sZWZ0LCBqb2IsIGJhc2VTb3VyY2VTcGFuKSxcbiAgICAgIGNvbnZlcnRBc3QoYXN0LnJpZ2h0LCBqb2IsIGJhc2VTb3VyY2VTcGFuKSxcbiAgICAgIHVuZGVmaW5lZCxcbiAgICAgIGNvbnZlcnRTb3VyY2VTcGFuKGFzdC5zcGFuLCBiYXNlU291cmNlU3BhbiksXG4gICAgKTtcbiAgfSBlbHNlIGlmIChhc3QgaW5zdGFuY2VvZiBlLlRoaXNSZWNlaXZlcikge1xuICAgIC8vIFRPRE86IHNob3VsZCBjb250ZXh0IGV4cHJlc3Npb25zIGhhdmUgc291cmNlIG1hcHM/XG4gICAgcmV0dXJuIG5ldyBpci5Db250ZXh0RXhwcihqb2Iucm9vdC54cmVmKTtcbiAgfSBlbHNlIGlmIChhc3QgaW5zdGFuY2VvZiBlLktleWVkUmVhZCkge1xuICAgIHJldHVybiBuZXcgby5SZWFkS2V5RXhwcihcbiAgICAgIGNvbnZlcnRBc3QoYXN0LnJlY2VpdmVyLCBqb2IsIGJhc2VTb3VyY2VTcGFuKSxcbiAgICAgIGNvbnZlcnRBc3QoYXN0LmtleSwgam9iLCBiYXNlU291cmNlU3BhbiksXG4gICAgICB1bmRlZmluZWQsXG4gICAgICBjb252ZXJ0U291cmNlU3Bhbihhc3Quc3BhbiwgYmFzZVNvdXJjZVNwYW4pLFxuICAgICk7XG4gIH0gZWxzZSBpZiAoYXN0IGluc3RhbmNlb2YgZS5DaGFpbikge1xuICAgIHRocm93IG5ldyBFcnJvcihgQXNzZXJ0aW9uRXJyb3I6IENoYWluIGluIHVua25vd24gY29udGV4dGApO1xuICB9IGVsc2UgaWYgKGFzdCBpbnN0YW5jZW9mIGUuTGl0ZXJhbE1hcCkge1xuICAgIGNvbnN0IGVudHJpZXMgPSBhc3Qua2V5cy5tYXAoKGtleSwgaWR4KSA9PiB7XG4gICAgICBjb25zdCB2YWx1ZSA9IGFzdC52YWx1ZXNbaWR4XTtcbiAgICAgIC8vIFRPRE86IHNob3VsZCBsaXRlcmFscyBoYXZlIHNvdXJjZSBtYXBzLCBvciBkbyB3ZSBqdXN0IG1hcCB0aGUgd2hvbGUgc3Vycm91bmRpbmdcbiAgICAgIC8vIGV4cHJlc3Npb24/XG4gICAgICByZXR1cm4gbmV3IG8uTGl0ZXJhbE1hcEVudHJ5KGtleS5rZXksIGNvbnZlcnRBc3QodmFsdWUsIGpvYiwgYmFzZVNvdXJjZVNwYW4pLCBrZXkucXVvdGVkKTtcbiAgICB9KTtcbiAgICByZXR1cm4gbmV3IG8uTGl0ZXJhbE1hcEV4cHIoZW50cmllcywgdW5kZWZpbmVkLCBjb252ZXJ0U291cmNlU3Bhbihhc3Quc3BhbiwgYmFzZVNvdXJjZVNwYW4pKTtcbiAgfSBlbHNlIGlmIChhc3QgaW5zdGFuY2VvZiBlLkxpdGVyYWxBcnJheSkge1xuICAgIC8vIFRPRE86IHNob3VsZCBsaXRlcmFscyBoYXZlIHNvdXJjZSBtYXBzLCBvciBkbyB3ZSBqdXN0IG1hcCB0aGUgd2hvbGUgc3Vycm91bmRpbmcgZXhwcmVzc2lvbj9cbiAgICByZXR1cm4gbmV3IG8uTGl0ZXJhbEFycmF5RXhwcihcbiAgICAgIGFzdC5leHByZXNzaW9ucy5tYXAoKGV4cHIpID0+IGNvbnZlcnRBc3QoZXhwciwgam9iLCBiYXNlU291cmNlU3BhbikpLFxuICAgICk7XG4gIH0gZWxzZSBpZiAoYXN0IGluc3RhbmNlb2YgZS5Db25kaXRpb25hbCkge1xuICAgIHJldHVybiBuZXcgby5Db25kaXRpb25hbEV4cHIoXG4gICAgICBjb252ZXJ0QXN0KGFzdC5jb25kaXRpb24sIGpvYiwgYmFzZVNvdXJjZVNwYW4pLFxuICAgICAgY29udmVydEFzdChhc3QudHJ1ZUV4cCwgam9iLCBiYXNlU291cmNlU3BhbiksXG4gICAgICBjb252ZXJ0QXN0KGFzdC5mYWxzZUV4cCwgam9iLCBiYXNlU291cmNlU3BhbiksXG4gICAgICB1bmRlZmluZWQsXG4gICAgICBjb252ZXJ0U291cmNlU3Bhbihhc3Quc3BhbiwgYmFzZVNvdXJjZVNwYW4pLFxuICAgICk7XG4gIH0gZWxzZSBpZiAoYXN0IGluc3RhbmNlb2YgZS5Ob25OdWxsQXNzZXJ0KSB7XG4gICAgLy8gQSBub24tbnVsbCBhc3NlcnRpb24gc2hvdWxkbid0IGltcGFjdCBnZW5lcmF0ZWQgaW5zdHJ1Y3Rpb25zLCBzbyB3ZSBjYW4ganVzdCBkcm9wIGl0LlxuICAgIHJldHVybiBjb252ZXJ0QXN0KGFzdC5leHByZXNzaW9uLCBqb2IsIGJhc2VTb3VyY2VTcGFuKTtcbiAgfSBlbHNlIGlmIChhc3QgaW5zdGFuY2VvZiBlLkJpbmRpbmdQaXBlKSB7XG4gICAgLy8gVE9ETzogcGlwZXMgc2hvdWxkIHByb2JhYmx5IGhhdmUgc291cmNlIG1hcHM7IGZpZ3VyZSBvdXQgZGV0YWlscy5cbiAgICByZXR1cm4gbmV3IGlyLlBpcGVCaW5kaW5nRXhwcihqb2IuYWxsb2NhdGVYcmVmSWQoKSwgbmV3IGlyLlNsb3RIYW5kbGUoKSwgYXN0Lm5hbWUsIFtcbiAgICAgIGNvbnZlcnRBc3QoYXN0LmV4cCwgam9iLCBiYXNlU291cmNlU3BhbiksXG4gICAgICAuLi5hc3QuYXJncy5tYXAoKGFyZykgPT4gY29udmVydEFzdChhcmcsIGpvYiwgYmFzZVNvdXJjZVNwYW4pKSxcbiAgICBdKTtcbiAgfSBlbHNlIGlmIChhc3QgaW5zdGFuY2VvZiBlLlNhZmVLZXllZFJlYWQpIHtcbiAgICByZXR1cm4gbmV3IGlyLlNhZmVLZXllZFJlYWRFeHByKFxuICAgICAgY29udmVydEFzdChhc3QucmVjZWl2ZXIsIGpvYiwgYmFzZVNvdXJjZVNwYW4pLFxuICAgICAgY29udmVydEFzdChhc3Qua2V5LCBqb2IsIGJhc2VTb3VyY2VTcGFuKSxcbiAgICAgIGNvbnZlcnRTb3VyY2VTcGFuKGFzdC5zcGFuLCBiYXNlU291cmNlU3BhbiksXG4gICAgKTtcbiAgfSBlbHNlIGlmIChhc3QgaW5zdGFuY2VvZiBlLlNhZmVQcm9wZXJ0eVJlYWQpIHtcbiAgICAvLyBUT0RPOiBzb3VyY2Ugc3BhblxuICAgIHJldHVybiBuZXcgaXIuU2FmZVByb3BlcnR5UmVhZEV4cHIoY29udmVydEFzdChhc3QucmVjZWl2ZXIsIGpvYiwgYmFzZVNvdXJjZVNwYW4pLCBhc3QubmFtZSk7XG4gIH0gZWxzZSBpZiAoYXN0IGluc3RhbmNlb2YgZS5TYWZlQ2FsbCkge1xuICAgIC8vIFRPRE86IHNvdXJjZSBzcGFuXG4gICAgcmV0dXJuIG5ldyBpci5TYWZlSW52b2tlRnVuY3Rpb25FeHByKFxuICAgICAgY29udmVydEFzdChhc3QucmVjZWl2ZXIsIGpvYiwgYmFzZVNvdXJjZVNwYW4pLFxuICAgICAgYXN0LmFyZ3MubWFwKChhKSA9PiBjb252ZXJ0QXN0KGEsIGpvYiwgYmFzZVNvdXJjZVNwYW4pKSxcbiAgICApO1xuICB9IGVsc2UgaWYgKGFzdCBpbnN0YW5jZW9mIGUuRW1wdHlFeHByKSB7XG4gICAgcmV0dXJuIG5ldyBpci5FbXB0eUV4cHIoY29udmVydFNvdXJjZVNwYW4oYXN0LnNwYW4sIGJhc2VTb3VyY2VTcGFuKSk7XG4gIH0gZWxzZSBpZiAoYXN0IGluc3RhbmNlb2YgZS5QcmVmaXhOb3QpIHtcbiAgICByZXR1cm4gby5ub3QoXG4gICAgICBjb252ZXJ0QXN0KGFzdC5leHByZXNzaW9uLCBqb2IsIGJhc2VTb3VyY2VTcGFuKSxcbiAgICAgIGNvbnZlcnRTb3VyY2VTcGFuKGFzdC5zcGFuLCBiYXNlU291cmNlU3BhbiksXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgVW5oYW5kbGVkIGV4cHJlc3Npb24gdHlwZSBcIiR7YXN0LmNvbnN0cnVjdG9yLm5hbWV9XCIgaW4gZmlsZSBcIiR7YmFzZVNvdXJjZVNwYW4/LnN0YXJ0LmZpbGUudXJsfVwiYCxcbiAgICApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNvbnZlcnRBc3RXaXRoSW50ZXJwb2xhdGlvbihcbiAgam9iOiBDb21waWxhdGlvbkpvYixcbiAgdmFsdWU6IGUuQVNUIHwgc3RyaW5nLFxuICBpMThuTWV0YTogaTE4bi5JMThuTWV0YSB8IG51bGwgfCB1bmRlZmluZWQsXG4gIHNvdXJjZVNwYW4/OiBQYXJzZVNvdXJjZVNwYW4sXG4pOiBvLkV4cHJlc3Npb24gfCBpci5JbnRlcnBvbGF0aW9uIHtcbiAgbGV0IGV4cHJlc3Npb246IG8uRXhwcmVzc2lvbiB8IGlyLkludGVycG9sYXRpb247XG4gIGlmICh2YWx1ZSBpbnN0YW5jZW9mIGUuSW50ZXJwb2xhdGlvbikge1xuICAgIGV4cHJlc3Npb24gPSBuZXcgaXIuSW50ZXJwb2xhdGlvbihcbiAgICAgIHZhbHVlLnN0cmluZ3MsXG4gICAgICB2YWx1ZS5leHByZXNzaW9ucy5tYXAoKGUpID0+IGNvbnZlcnRBc3QoZSwgam9iLCBzb3VyY2VTcGFuID8/IG51bGwpKSxcbiAgICAgIE9iamVjdC5rZXlzKGFzTWVzc2FnZShpMThuTWV0YSk/LnBsYWNlaG9sZGVycyA/PyB7fSksXG4gICAgKTtcbiAgfSBlbHNlIGlmICh2YWx1ZSBpbnN0YW5jZW9mIGUuQVNUKSB7XG4gICAgZXhwcmVzc2lvbiA9IGNvbnZlcnRBc3QodmFsdWUsIGpvYiwgc291cmNlU3BhbiA/PyBudWxsKTtcbiAgfSBlbHNlIHtcbiAgICBleHByZXNzaW9uID0gby5saXRlcmFsKHZhbHVlKTtcbiAgfVxuICByZXR1cm4gZXhwcmVzc2lvbjtcbn1cblxuLy8gVE9ETzogQ2FuIHdlIHBvcHVsYXRlIFRlbXBsYXRlIGJpbmRpbmcga2luZHMgaW4gaW5nZXN0P1xuY29uc3QgQklORElOR19LSU5EUyA9IG5ldyBNYXA8ZS5CaW5kaW5nVHlwZSwgaXIuQmluZGluZ0tpbmQ+KFtcbiAgW2UuQmluZGluZ1R5cGUuUHJvcGVydHksIGlyLkJpbmRpbmdLaW5kLlByb3BlcnR5XSxcbiAgW2UuQmluZGluZ1R5cGUuVHdvV2F5LCBpci5CaW5kaW5nS2luZC5Ud29XYXlQcm9wZXJ0eV0sXG4gIFtlLkJpbmRpbmdUeXBlLkF0dHJpYnV0ZSwgaXIuQmluZGluZ0tpbmQuQXR0cmlidXRlXSxcbiAgW2UuQmluZGluZ1R5cGUuQ2xhc3MsIGlyLkJpbmRpbmdLaW5kLkNsYXNzTmFtZV0sXG4gIFtlLkJpbmRpbmdUeXBlLlN0eWxlLCBpci5CaW5kaW5nS2luZC5TdHlsZVByb3BlcnR5XSxcbiAgW2UuQmluZGluZ1R5cGUuQW5pbWF0aW9uLCBpci5CaW5kaW5nS2luZC5BbmltYXRpb25dLFxuXSk7XG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgdGhlIGdpdmVuIHRlbXBsYXRlIGlzIGEgcGxhaW4gbmctdGVtcGxhdGUgKGFzIG9wcG9zZWQgdG8gYW5vdGhlciBraW5kIG9mIHRlbXBsYXRlXG4gKiBzdWNoIGFzIGEgc3RydWN0dXJhbCBkaXJlY3RpdmUgdGVtcGxhdGUgb3IgY29udHJvbCBmbG93IHRlbXBsYXRlKS4gVGhpcyBpcyBjaGVja2VkIGJhc2VkIG9uIHRoZVxuICogdGFnTmFtZS4gV2UgY2FuIGV4cGVjdCB0aGF0IG9ubHkgcGxhaW4gbmctdGVtcGxhdGVzIHdpbGwgY29tZSB0aHJvdWdoIHdpdGggYSB0YWdOYW1lIG9mXG4gKiAnbmctdGVtcGxhdGUnLlxuICpcbiAqIEhlcmUgYXJlIHNvbWUgb2YgdGhlIGNhc2VzIHdlIGV4cGVjdDpcbiAqXG4gKiB8IEFuZ3VsYXIgSFRNTCAgICAgICAgICAgICAgICAgICAgICAgfCBUZW1wbGF0ZSB0YWdOYW1lICAgfFxuICogfCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIHwgLS0tLS0tLS0tLS0tLS0tLS0tIHxcbiAqIHwgYDxuZy10ZW1wbGF0ZT5gICAgICAgICAgICAgICAgICAgICB8ICduZy10ZW1wbGF0ZScgICAgICB8XG4gKiB8IGA8ZGl2ICpuZ0lmPVwidHJ1ZVwiPmAgICAgICAgICAgICAgICB8ICdkaXYnICAgICAgICAgICAgICB8XG4gKiB8IGA8c3ZnPjxuZy10ZW1wbGF0ZT5gICAgICAgICAgICAgICAgfCAnc3ZnOm5nLXRlbXBsYXRlJyAgfFxuICogfCBgQGlmICh0cnVlKSB7YCAgICAgICAgICAgICAgICAgICAgIHwgJ0NvbmRpdGlvbmFsJyAgICAgIHxcbiAqIHwgYDxuZy10ZW1wbGF0ZSAqbmdJZj5gIChwbGFpbikgICAgICB8ICduZy10ZW1wbGF0ZScgICAgICB8XG4gKiB8IGA8bmctdGVtcGxhdGUgKm5nSWY+YCAoc3RydWN0dXJhbCkgfCBudWxsICAgICAgICAgICAgICAgfFxuICovXG5mdW5jdGlvbiBpc1BsYWluVGVtcGxhdGUodG1wbDogdC5UZW1wbGF0ZSkge1xuICByZXR1cm4gc3BsaXROc05hbWUodG1wbC50YWdOYW1lID8/ICcnKVsxXSA9PT0gTkdfVEVNUExBVEVfVEFHX05BTUU7XG59XG5cbi8qKlxuICogRW5zdXJlcyB0aGF0IHRoZSBpMThuTWV0YSwgaWYgcHJvdmlkZWQsIGlzIGFuIGkxOG4uTWVzc2FnZS5cbiAqL1xuZnVuY3Rpb24gYXNNZXNzYWdlKGkxOG5NZXRhOiBpMThuLkkxOG5NZXRhIHwgbnVsbCB8IHVuZGVmaW5lZCk6IGkxOG4uTWVzc2FnZSB8IG51bGwge1xuICBpZiAoaTE4bk1ldGEgPT0gbnVsbCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGlmICghKGkxOG5NZXRhIGluc3RhbmNlb2YgaTE4bi5NZXNzYWdlKSkge1xuICAgIHRocm93IEVycm9yKGBFeHBlY3RlZCBpMThuIG1ldGEgdG8gYmUgYSBNZXNzYWdlLCBidXQgZ290OiAke2kxOG5NZXRhLmNvbnN0cnVjdG9yLm5hbWV9YCk7XG4gIH1cbiAgcmV0dXJuIGkxOG5NZXRhO1xufVxuXG4vKipcbiAqIFByb2Nlc3MgYWxsIG9mIHRoZSBiaW5kaW5ncyBvbiBhbiBlbGVtZW50IGluIHRoZSB0ZW1wbGF0ZSBBU1QgYW5kIGNvbnZlcnQgdGhlbSB0byB0aGVpciBJUlxuICogcmVwcmVzZW50YXRpb24uXG4gKi9cbmZ1bmN0aW9uIGluZ2VzdEVsZW1lbnRCaW5kaW5ncyhcbiAgdW5pdDogVmlld0NvbXBpbGF0aW9uVW5pdCxcbiAgb3A6IGlyLkVsZW1lbnRPcEJhc2UsXG4gIGVsZW1lbnQ6IHQuRWxlbWVudCxcbik6IHZvaWQge1xuICBsZXQgYmluZGluZ3MgPSBuZXcgQXJyYXk8aXIuQmluZGluZ09wIHwgaXIuRXh0cmFjdGVkQXR0cmlidXRlT3AgfCBudWxsPigpO1xuXG4gIGxldCBpMThuQXR0cmlidXRlQmluZGluZ05hbWVzID0gbmV3IFNldDxzdHJpbmc+KCk7XG5cbiAgZm9yIChjb25zdCBhdHRyIG9mIGVsZW1lbnQuYXR0cmlidXRlcykge1xuICAgIC8vIEF0dHJpYnV0ZSBsaXRlcmFsIGJpbmRpbmdzLCBzdWNoIGFzIGBhdHRyLmZvbz1cImJhclwiYC5cbiAgICBjb25zdCBzZWN1cml0eUNvbnRleHQgPSBkb21TY2hlbWEuc2VjdXJpdHlDb250ZXh0KGVsZW1lbnQubmFtZSwgYXR0ci5uYW1lLCB0cnVlKTtcbiAgICBiaW5kaW5ncy5wdXNoKFxuICAgICAgaXIuY3JlYXRlQmluZGluZ09wKFxuICAgICAgICBvcC54cmVmLFxuICAgICAgICBpci5CaW5kaW5nS2luZC5BdHRyaWJ1dGUsXG4gICAgICAgIGF0dHIubmFtZSxcbiAgICAgICAgY29udmVydEFzdFdpdGhJbnRlcnBvbGF0aW9uKHVuaXQuam9iLCBhdHRyLnZhbHVlLCBhdHRyLmkxOG4pLFxuICAgICAgICBudWxsLFxuICAgICAgICBzZWN1cml0eUNvbnRleHQsXG4gICAgICAgIHRydWUsXG4gICAgICAgIGZhbHNlLFxuICAgICAgICBudWxsLFxuICAgICAgICBhc01lc3NhZ2UoYXR0ci5pMThuKSxcbiAgICAgICAgYXR0ci5zb3VyY2VTcGFuLFxuICAgICAgKSxcbiAgICApO1xuICAgIGlmIChhdHRyLmkxOG4pIHtcbiAgICAgIGkxOG5BdHRyaWJ1dGVCaW5kaW5nTmFtZXMuYWRkKGF0dHIubmFtZSk7XG4gICAgfVxuICB9XG5cbiAgZm9yIChjb25zdCBpbnB1dCBvZiBlbGVtZW50LmlucHV0cykge1xuICAgIGlmIChpMThuQXR0cmlidXRlQmluZGluZ05hbWVzLmhhcyhpbnB1dC5uYW1lKSkge1xuICAgICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgYE9uIGNvbXBvbmVudCAke3VuaXQuam9iLmNvbXBvbmVudE5hbWV9LCB0aGUgYmluZGluZyAke2lucHV0Lm5hbWV9IGlzIGJvdGggYW4gaTE4biBhdHRyaWJ1dGUgYW5kIGEgcHJvcGVydHkuIFlvdSBtYXkgd2FudCB0byByZW1vdmUgdGhlIHByb3BlcnR5IGJpbmRpbmcuIFRoaXMgd2lsbCBiZWNvbWUgYSBjb21waWxhdGlvbiBlcnJvciBpbiBmdXR1cmUgdmVyc2lvbnMgb2YgQW5ndWxhci5gLFxuICAgICAgKTtcbiAgICB9XG4gICAgLy8gQWxsIGR5bmFtaWMgYmluZGluZ3MgKGJvdGggYXR0cmlidXRlIGFuZCBwcm9wZXJ0eSBiaW5kaW5ncykuXG4gICAgYmluZGluZ3MucHVzaChcbiAgICAgIGlyLmNyZWF0ZUJpbmRpbmdPcChcbiAgICAgICAgb3AueHJlZixcbiAgICAgICAgQklORElOR19LSU5EUy5nZXQoaW5wdXQudHlwZSkhLFxuICAgICAgICBpbnB1dC5uYW1lLFxuICAgICAgICBjb252ZXJ0QXN0V2l0aEludGVycG9sYXRpb24odW5pdC5qb2IsIGFzdE9mKGlucHV0LnZhbHVlKSwgaW5wdXQuaTE4biksXG4gICAgICAgIGlucHV0LnVuaXQsXG4gICAgICAgIGlucHV0LnNlY3VyaXR5Q29udGV4dCxcbiAgICAgICAgZmFsc2UsXG4gICAgICAgIGZhbHNlLFxuICAgICAgICBudWxsLFxuICAgICAgICBhc01lc3NhZ2UoaW5wdXQuaTE4bikgPz8gbnVsbCxcbiAgICAgICAgaW5wdXQuc291cmNlU3BhbixcbiAgICAgICksXG4gICAgKTtcbiAgfVxuXG4gIHVuaXQuY3JlYXRlLnB1c2goXG4gICAgYmluZGluZ3MuZmlsdGVyKChiKTogYiBpcyBpci5FeHRyYWN0ZWRBdHRyaWJ1dGVPcCA9PiBiPy5raW5kID09PSBpci5PcEtpbmQuRXh0cmFjdGVkQXR0cmlidXRlKSxcbiAgKTtcbiAgdW5pdC51cGRhdGUucHVzaChiaW5kaW5ncy5maWx0ZXIoKGIpOiBiIGlzIGlyLkJpbmRpbmdPcCA9PiBiPy5raW5kID09PSBpci5PcEtpbmQuQmluZGluZykpO1xuXG4gIGZvciAoY29uc3Qgb3V0cHV0IG9mIGVsZW1lbnQub3V0cHV0cykge1xuICAgIGlmIChvdXRwdXQudHlwZSA9PT0gZS5QYXJzZWRFdmVudFR5cGUuQW5pbWF0aW9uICYmIG91dHB1dC5waGFzZSA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgRXJyb3IoJ0FuaW1hdGlvbiBsaXN0ZW5lciBzaG91bGQgaGF2ZSBhIHBoYXNlJyk7XG4gICAgfVxuXG4gICAgaWYgKG91dHB1dC50eXBlID09PSBlLlBhcnNlZEV2ZW50VHlwZS5Ud29XYXkpIHtcbiAgICAgIHVuaXQuY3JlYXRlLnB1c2goXG4gICAgICAgIGlyLmNyZWF0ZVR3b1dheUxpc3RlbmVyT3AoXG4gICAgICAgICAgb3AueHJlZixcbiAgICAgICAgICBvcC5oYW5kbGUsXG4gICAgICAgICAgb3V0cHV0Lm5hbWUsXG4gICAgICAgICAgb3AudGFnLFxuICAgICAgICAgIG1ha2VUd29XYXlMaXN0ZW5lckhhbmRsZXJPcHModW5pdCwgb3V0cHV0LmhhbmRsZXIsIG91dHB1dC5oYW5kbGVyU3BhbiksXG4gICAgICAgICAgb3V0cHV0LnNvdXJjZVNwYW4sXG4gICAgICAgICksXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICB1bml0LmNyZWF0ZS5wdXNoKFxuICAgICAgICBpci5jcmVhdGVMaXN0ZW5lck9wKFxuICAgICAgICAgIG9wLnhyZWYsXG4gICAgICAgICAgb3AuaGFuZGxlLFxuICAgICAgICAgIG91dHB1dC5uYW1lLFxuICAgICAgICAgIG9wLnRhZyxcbiAgICAgICAgICBtYWtlTGlzdGVuZXJIYW5kbGVyT3BzKHVuaXQsIG91dHB1dC5oYW5kbGVyLCBvdXRwdXQuaGFuZGxlclNwYW4pLFxuICAgICAgICAgIG91dHB1dC5waGFzZSxcbiAgICAgICAgICBvdXRwdXQudGFyZ2V0LFxuICAgICAgICAgIGZhbHNlLFxuICAgICAgICAgIG91dHB1dC5zb3VyY2VTcGFuLFxuICAgICAgICApLFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICAvLyBJZiBhbnkgb2YgdGhlIGJpbmRpbmdzIG9uIHRoaXMgZWxlbWVudCBoYXZlIGFuIGkxOG4gbWVzc2FnZSwgdGhlbiBhbiBpMThuIGF0dHJzIGNvbmZpZ3VyYXRpb25cbiAgLy8gb3AgaXMgYWxzbyByZXF1aXJlZC5cbiAgaWYgKGJpbmRpbmdzLnNvbWUoKGIpID0+IGI/LmkxOG5NZXNzYWdlKSAhPT0gbnVsbCkge1xuICAgIHVuaXQuY3JlYXRlLnB1c2goXG4gICAgICBpci5jcmVhdGVJMThuQXR0cmlidXRlc09wKHVuaXQuam9iLmFsbG9jYXRlWHJlZklkKCksIG5ldyBpci5TbG90SGFuZGxlKCksIG9wLnhyZWYpLFxuICAgICk7XG4gIH1cbn1cblxuLyoqXG4gKiBQcm9jZXNzIGFsbCBvZiB0aGUgYmluZGluZ3Mgb24gYSB0ZW1wbGF0ZSBpbiB0aGUgdGVtcGxhdGUgQVNUIGFuZCBjb252ZXJ0IHRoZW0gdG8gdGhlaXIgSVJcbiAqIHJlcHJlc2VudGF0aW9uLlxuICovXG5mdW5jdGlvbiBpbmdlc3RUZW1wbGF0ZUJpbmRpbmdzKFxuICB1bml0OiBWaWV3Q29tcGlsYXRpb25Vbml0LFxuICBvcDogaXIuRWxlbWVudE9wQmFzZSxcbiAgdGVtcGxhdGU6IHQuVGVtcGxhdGUsXG4gIHRlbXBsYXRlS2luZDogaXIuVGVtcGxhdGVLaW5kIHwgbnVsbCxcbik6IHZvaWQge1xuICBsZXQgYmluZGluZ3MgPSBuZXcgQXJyYXk8aXIuQmluZGluZ09wIHwgaXIuRXh0cmFjdGVkQXR0cmlidXRlT3AgfCBudWxsPigpO1xuXG4gIGZvciAoY29uc3QgYXR0ciBvZiB0ZW1wbGF0ZS50ZW1wbGF0ZUF0dHJzKSB7XG4gICAgaWYgKGF0dHIgaW5zdGFuY2VvZiB0LlRleHRBdHRyaWJ1dGUpIHtcbiAgICAgIGNvbnN0IHNlY3VyaXR5Q29udGV4dCA9IGRvbVNjaGVtYS5zZWN1cml0eUNvbnRleHQoTkdfVEVNUExBVEVfVEFHX05BTUUsIGF0dHIubmFtZSwgdHJ1ZSk7XG4gICAgICBiaW5kaW5ncy5wdXNoKFxuICAgICAgICBjcmVhdGVUZW1wbGF0ZUJpbmRpbmcoXG4gICAgICAgICAgdW5pdCxcbiAgICAgICAgICBvcC54cmVmLFxuICAgICAgICAgIGUuQmluZGluZ1R5cGUuQXR0cmlidXRlLFxuICAgICAgICAgIGF0dHIubmFtZSxcbiAgICAgICAgICBhdHRyLnZhbHVlLFxuICAgICAgICAgIG51bGwsXG4gICAgICAgICAgc2VjdXJpdHlDb250ZXh0LFxuICAgICAgICAgIHRydWUsXG4gICAgICAgICAgdGVtcGxhdGVLaW5kLFxuICAgICAgICAgIGFzTWVzc2FnZShhdHRyLmkxOG4pLFxuICAgICAgICAgIGF0dHIuc291cmNlU3BhbixcbiAgICAgICAgKSxcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJpbmRpbmdzLnB1c2goXG4gICAgICAgIGNyZWF0ZVRlbXBsYXRlQmluZGluZyhcbiAgICAgICAgICB1bml0LFxuICAgICAgICAgIG9wLnhyZWYsXG4gICAgICAgICAgYXR0ci50eXBlLFxuICAgICAgICAgIGF0dHIubmFtZSxcbiAgICAgICAgICBhc3RPZihhdHRyLnZhbHVlKSxcbiAgICAgICAgICBhdHRyLnVuaXQsXG4gICAgICAgICAgYXR0ci5zZWN1cml0eUNvbnRleHQsXG4gICAgICAgICAgdHJ1ZSxcbiAgICAgICAgICB0ZW1wbGF0ZUtpbmQsXG4gICAgICAgICAgYXNNZXNzYWdlKGF0dHIuaTE4biksXG4gICAgICAgICAgYXR0ci5zb3VyY2VTcGFuLFxuICAgICAgICApLFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBmb3IgKGNvbnN0IGF0dHIgb2YgdGVtcGxhdGUuYXR0cmlidXRlcykge1xuICAgIC8vIEF0dHJpYnV0ZSBsaXRlcmFsIGJpbmRpbmdzLCBzdWNoIGFzIGBhdHRyLmZvbz1cImJhclwiYC5cbiAgICBjb25zdCBzZWN1cml0eUNvbnRleHQgPSBkb21TY2hlbWEuc2VjdXJpdHlDb250ZXh0KE5HX1RFTVBMQVRFX1RBR19OQU1FLCBhdHRyLm5hbWUsIHRydWUpO1xuICAgIGJpbmRpbmdzLnB1c2goXG4gICAgICBjcmVhdGVUZW1wbGF0ZUJpbmRpbmcoXG4gICAgICAgIHVuaXQsXG4gICAgICAgIG9wLnhyZWYsXG4gICAgICAgIGUuQmluZGluZ1R5cGUuQXR0cmlidXRlLFxuICAgICAgICBhdHRyLm5hbWUsXG4gICAgICAgIGF0dHIudmFsdWUsXG4gICAgICAgIG51bGwsXG4gICAgICAgIHNlY3VyaXR5Q29udGV4dCxcbiAgICAgICAgZmFsc2UsXG4gICAgICAgIHRlbXBsYXRlS2luZCxcbiAgICAgICAgYXNNZXNzYWdlKGF0dHIuaTE4biksXG4gICAgICAgIGF0dHIuc291cmNlU3BhbixcbiAgICAgICksXG4gICAgKTtcbiAgfVxuXG4gIGZvciAoY29uc3QgaW5wdXQgb2YgdGVtcGxhdGUuaW5wdXRzKSB7XG4gICAgLy8gRHluYW1pYyBiaW5kaW5ncyAoYm90aCBhdHRyaWJ1dGUgYW5kIHByb3BlcnR5IGJpbmRpbmdzKS5cbiAgICBiaW5kaW5ncy5wdXNoKFxuICAgICAgY3JlYXRlVGVtcGxhdGVCaW5kaW5nKFxuICAgICAgICB1bml0LFxuICAgICAgICBvcC54cmVmLFxuICAgICAgICBpbnB1dC50eXBlLFxuICAgICAgICBpbnB1dC5uYW1lLFxuICAgICAgICBhc3RPZihpbnB1dC52YWx1ZSksXG4gICAgICAgIGlucHV0LnVuaXQsXG4gICAgICAgIGlucHV0LnNlY3VyaXR5Q29udGV4dCxcbiAgICAgICAgZmFsc2UsXG4gICAgICAgIHRlbXBsYXRlS2luZCxcbiAgICAgICAgYXNNZXNzYWdlKGlucHV0LmkxOG4pLFxuICAgICAgICBpbnB1dC5zb3VyY2VTcGFuLFxuICAgICAgKSxcbiAgICApO1xuICB9XG5cbiAgdW5pdC5jcmVhdGUucHVzaChcbiAgICBiaW5kaW5ncy5maWx0ZXIoKGIpOiBiIGlzIGlyLkV4dHJhY3RlZEF0dHJpYnV0ZU9wID0+IGI/LmtpbmQgPT09IGlyLk9wS2luZC5FeHRyYWN0ZWRBdHRyaWJ1dGUpLFxuICApO1xuICB1bml0LnVwZGF0ZS5wdXNoKGJpbmRpbmdzLmZpbHRlcigoYik6IGIgaXMgaXIuQmluZGluZ09wID0+IGI/LmtpbmQgPT09IGlyLk9wS2luZC5CaW5kaW5nKSk7XG5cbiAgZm9yIChjb25zdCBvdXRwdXQgb2YgdGVtcGxhdGUub3V0cHV0cykge1xuICAgIGlmIChvdXRwdXQudHlwZSA9PT0gZS5QYXJzZWRFdmVudFR5cGUuQW5pbWF0aW9uICYmIG91dHB1dC5waGFzZSA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgRXJyb3IoJ0FuaW1hdGlvbiBsaXN0ZW5lciBzaG91bGQgaGF2ZSBhIHBoYXNlJyk7XG4gICAgfVxuXG4gICAgaWYgKHRlbXBsYXRlS2luZCA9PT0gaXIuVGVtcGxhdGVLaW5kLk5nVGVtcGxhdGUpIHtcbiAgICAgIGlmIChvdXRwdXQudHlwZSA9PT0gZS5QYXJzZWRFdmVudFR5cGUuVHdvV2F5KSB7XG4gICAgICAgIHVuaXQuY3JlYXRlLnB1c2goXG4gICAgICAgICAgaXIuY3JlYXRlVHdvV2F5TGlzdGVuZXJPcChcbiAgICAgICAgICAgIG9wLnhyZWYsXG4gICAgICAgICAgICBvcC5oYW5kbGUsXG4gICAgICAgICAgICBvdXRwdXQubmFtZSxcbiAgICAgICAgICAgIG9wLnRhZyxcbiAgICAgICAgICAgIG1ha2VUd29XYXlMaXN0ZW5lckhhbmRsZXJPcHModW5pdCwgb3V0cHV0LmhhbmRsZXIsIG91dHB1dC5oYW5kbGVyU3BhbiksXG4gICAgICAgICAgICBvdXRwdXQuc291cmNlU3BhbixcbiAgICAgICAgICApLFxuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdW5pdC5jcmVhdGUucHVzaChcbiAgICAgICAgICBpci5jcmVhdGVMaXN0ZW5lck9wKFxuICAgICAgICAgICAgb3AueHJlZixcbiAgICAgICAgICAgIG9wLmhhbmRsZSxcbiAgICAgICAgICAgIG91dHB1dC5uYW1lLFxuICAgICAgICAgICAgb3AudGFnLFxuICAgICAgICAgICAgbWFrZUxpc3RlbmVySGFuZGxlck9wcyh1bml0LCBvdXRwdXQuaGFuZGxlciwgb3V0cHV0LmhhbmRsZXJTcGFuKSxcbiAgICAgICAgICAgIG91dHB1dC5waGFzZSxcbiAgICAgICAgICAgIG91dHB1dC50YXJnZXQsXG4gICAgICAgICAgICBmYWxzZSxcbiAgICAgICAgICAgIG91dHB1dC5zb3VyY2VTcGFuLFxuICAgICAgICAgICksXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChcbiAgICAgIHRlbXBsYXRlS2luZCA9PT0gaXIuVGVtcGxhdGVLaW5kLlN0cnVjdHVyYWwgJiZcbiAgICAgIG91dHB1dC50eXBlICE9PSBlLlBhcnNlZEV2ZW50VHlwZS5BbmltYXRpb25cbiAgICApIHtcbiAgICAgIC8vIEFuaW1hdGlvbiBiaW5kaW5ncyBhcmUgZXhjbHVkZWQgZnJvbSB0aGUgc3RydWN0dXJhbCB0ZW1wbGF0ZSdzIGNvbnN0IGFycmF5LlxuICAgICAgY29uc3Qgc2VjdXJpdHlDb250ZXh0ID0gZG9tU2NoZW1hLnNlY3VyaXR5Q29udGV4dChOR19URU1QTEFURV9UQUdfTkFNRSwgb3V0cHV0Lm5hbWUsIGZhbHNlKTtcbiAgICAgIHVuaXQuY3JlYXRlLnB1c2goXG4gICAgICAgIGlyLmNyZWF0ZUV4dHJhY3RlZEF0dHJpYnV0ZU9wKFxuICAgICAgICAgIG9wLnhyZWYsXG4gICAgICAgICAgaXIuQmluZGluZ0tpbmQuUHJvcGVydHksXG4gICAgICAgICAgbnVsbCxcbiAgICAgICAgICBvdXRwdXQubmFtZSxcbiAgICAgICAgICBudWxsLFxuICAgICAgICAgIG51bGwsXG4gICAgICAgICAgbnVsbCxcbiAgICAgICAgICBzZWN1cml0eUNvbnRleHQsXG4gICAgICAgICksXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIC8vIFRPRE86IFBlcmhhcHMgd2UgY291bGQgZG8gdGhpcyBpbiBhIHBoYXNlPyAoSXQgbGlrZWx5IHdvdWxkbid0IGNoYW5nZSB0aGUgc2xvdCBpbmRpY2VzLilcbiAgaWYgKGJpbmRpbmdzLnNvbWUoKGIpID0+IGI/LmkxOG5NZXNzYWdlKSAhPT0gbnVsbCkge1xuICAgIHVuaXQuY3JlYXRlLnB1c2goXG4gICAgICBpci5jcmVhdGVJMThuQXR0cmlidXRlc09wKHVuaXQuam9iLmFsbG9jYXRlWHJlZklkKCksIG5ldyBpci5TbG90SGFuZGxlKCksIG9wLnhyZWYpLFxuICAgICk7XG4gIH1cbn1cblxuLyoqXG4gKiBIZWxwZXIgdG8gaW5nZXN0IGFuIGluZGl2aWR1YWwgYmluZGluZyBvbiBhIHRlbXBsYXRlLCBlaXRoZXIgYW4gZXhwbGljaXQgYG5nLXRlbXBsYXRlYCwgb3IgYW5cbiAqIGltcGxpY2l0IHRlbXBsYXRlIGNyZWF0ZWQgdmlhIHN0cnVjdHVyYWwgZGlyZWN0aXZlLlxuICpcbiAqIEJpbmRpbmdzIG9uIHRlbXBsYXRlcyBhcmUgKmV4dHJlbWVseSogdHJpY2t5LiBJIGhhdmUgdHJpZWQgdG8gaXNvbGF0ZSBhbGwgb2YgdGhlIGNvbmZ1c2luZyBlZGdlXG4gKiBjYXNlcyBpbnRvIHRoaXMgZnVuY3Rpb24sIGFuZCB0byBjb21tZW50IGl0IHdlbGwgdG8gZG9jdW1lbnQgdGhlIGJlaGF2aW9yLlxuICpcbiAqIFNvbWUgb2YgdGhpcyBiZWhhdmlvciBpcyBpbnR1aXRpdmVseSBpbmNvcnJlY3QsIGFuZCB3ZSBzaG91bGQgY29uc2lkZXIgY2hhbmdpbmcgaXQgaW4gdGhlIGZ1dHVyZS5cbiAqXG4gKiBAcGFyYW0gdmlldyBUaGUgY29tcGlsYXRpb24gdW5pdCBmb3IgdGhlIHZpZXcgY29udGFpbmluZyB0aGUgdGVtcGxhdGUuXG4gKiBAcGFyYW0geHJlZiBUaGUgeHJlZiBvZiB0aGUgdGVtcGxhdGUgb3AuXG4gKiBAcGFyYW0gdHlwZSBUaGUgYmluZGluZyB0eXBlLCBhY2NvcmRpbmcgdG8gdGhlIHBhcnNlci4gVGhpcyBpcyBmYWlybHkgcmVhc29uYWJsZSwgZS5nLiBib3RoXG4gKiAgICAgZHluYW1pYyBhbmQgc3RhdGljIGF0dHJpYnV0ZXMgaGF2ZSBlLkJpbmRpbmdUeXBlLkF0dHJpYnV0ZS5cbiAqIEBwYXJhbSBuYW1lIFRoZSBiaW5kaW5nJ3MgbmFtZS5cbiAqIEBwYXJhbSB2YWx1ZSBUaGUgYmluZGluZ3MncyB2YWx1ZSwgd2hpY2ggd2lsbCBlaXRoZXIgYmUgYW4gaW5wdXQgQVNUIGV4cHJlc3Npb24sIG9yIGEgc3RyaW5nXG4gKiAgICAgbGl0ZXJhbC4gTm90ZSB0aGF0IHRoZSBpbnB1dCBBU1QgZXhwcmVzc2lvbiBtYXkgb3IgbWF5IG5vdCBiZSBjb25zdCAtLSBpdCB3aWxsIG9ubHkgYmUgYVxuICogICAgIHN0cmluZyBsaXRlcmFsIGlmIHRoZSBwYXJzZXIgY29uc2lkZXJlZCBpdCBhIHRleHQgYmluZGluZy5cbiAqIEBwYXJhbSB1bml0IElmIHRoZSBiaW5kaW5nIGhhcyBhIHVuaXQgKGUuZy4gYHB4YCBmb3Igc3R5bGUgYmluZGluZ3MpLCB0aGVuIHRoaXMgaXMgdGhlIHVuaXQuXG4gKiBAcGFyYW0gc2VjdXJpdHlDb250ZXh0IFRoZSBzZWN1cml0eSBjb250ZXh0IG9mIHRoZSBiaW5kaW5nLlxuICogQHBhcmFtIGlzU3RydWN0dXJhbFRlbXBsYXRlQXR0cmlidXRlIFdoZXRoZXIgdGhpcyBiaW5kaW5nIGFjdHVhbGx5IGFwcGxpZXMgdG8gdGhlIHN0cnVjdHVyYWxcbiAqICAgICBuZy10ZW1wbGF0ZS4gRm9yIGV4YW1wbGUsIGFuIGBuZ0ZvcmAgd291bGQgYWN0dWFsbHkgYXBwbHkgdG8gdGhlIHN0cnVjdHVyYWwgdGVtcGxhdGUuIChNb3N0XG4gKiAgICAgYmluZGluZ3Mgb24gc3RydWN0dXJhbCBlbGVtZW50cyB0YXJnZXQgdGhlIGlubmVyIGVsZW1lbnQsIG5vdCB0aGUgdGVtcGxhdGUuKVxuICogQHBhcmFtIHRlbXBsYXRlS2luZCBXaGV0aGVyIHRoaXMgaXMgYW4gZXhwbGljaXQgYG5nLXRlbXBsYXRlYCBvciBhbiBpbXBsaWNpdCB0ZW1wbGF0ZSBjcmVhdGVkIGJ5XG4gKiAgICAgYSBzdHJ1Y3R1cmFsIGRpcmVjdGl2ZS4gVGhpcyBzaG91bGQgbmV2ZXIgYmUgYSBibG9jayB0ZW1wbGF0ZS5cbiAqIEBwYXJhbSBpMThuTWVzc2FnZSBUaGUgaTE4biBtZXRhZGF0YSBmb3IgdGhlIGJpbmRpbmcsIGlmIGFueS5cbiAqIEBwYXJhbSBzb3VyY2VTcGFuIFRoZSBzb3VyY2Ugc3BhbiBvZiB0aGUgYmluZGluZy5cbiAqIEByZXR1cm5zIEFuIElSIGJpbmRpbmcgb3AsIG9yIG51bGwgaWYgdGhlIGJpbmRpbmcgc2hvdWxkIGJlIHNraXBwZWQuXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVRlbXBsYXRlQmluZGluZyhcbiAgdmlldzogVmlld0NvbXBpbGF0aW9uVW5pdCxcbiAgeHJlZjogaXIuWHJlZklkLFxuICB0eXBlOiBlLkJpbmRpbmdUeXBlLFxuICBuYW1lOiBzdHJpbmcsXG4gIHZhbHVlOiBlLkFTVCB8IHN0cmluZyxcbiAgdW5pdDogc3RyaW5nIHwgbnVsbCxcbiAgc2VjdXJpdHlDb250ZXh0OiBTZWN1cml0eUNvbnRleHQsXG4gIGlzU3RydWN0dXJhbFRlbXBsYXRlQXR0cmlidXRlOiBib29sZWFuLFxuICB0ZW1wbGF0ZUtpbmQ6IGlyLlRlbXBsYXRlS2luZCB8IG51bGwsXG4gIGkxOG5NZXNzYWdlOiBpMThuLk1lc3NhZ2UgfCBudWxsLFxuICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4pOiBpci5CaW5kaW5nT3AgfCBpci5FeHRyYWN0ZWRBdHRyaWJ1dGVPcCB8IG51bGwge1xuICBjb25zdCBpc1RleHRCaW5kaW5nID0gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJztcbiAgLy8gSWYgdGhpcyBpcyBhIHN0cnVjdHVyYWwgdGVtcGxhdGUsIHRoZW4gc2V2ZXJhbCBraW5kcyBvZiBiaW5kaW5ncyBzaG91bGQgbm90IHJlc3VsdCBpbiBhblxuICAvLyB1cGRhdGUgaW5zdHJ1Y3Rpb24uXG4gIGlmICh0ZW1wbGF0ZUtpbmQgPT09IGlyLlRlbXBsYXRlS2luZC5TdHJ1Y3R1cmFsKSB7XG4gICAgaWYgKCFpc1N0cnVjdHVyYWxUZW1wbGF0ZUF0dHJpYnV0ZSkge1xuICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgIGNhc2UgZS5CaW5kaW5nVHlwZS5Qcm9wZXJ0eTpcbiAgICAgICAgY2FzZSBlLkJpbmRpbmdUeXBlLkNsYXNzOlxuICAgICAgICBjYXNlIGUuQmluZGluZ1R5cGUuU3R5bGU6XG4gICAgICAgICAgLy8gQmVjYXVzZSB0aGlzIGJpbmRpbmcgZG9lc24ndCByZWFsbHkgdGFyZ2V0IHRoZSBuZy10ZW1wbGF0ZSwgaXQgbXVzdCBiZSBhIGJpbmRpbmcgb24gYW5cbiAgICAgICAgICAvLyBpbm5lciBub2RlIG9mIGEgc3RydWN0dXJhbCB0ZW1wbGF0ZS4gV2UgY2FuJ3Qgc2tpcCBpdCBlbnRpcmVseSwgYmVjYXVzZSB3ZSBzdGlsbCBuZWVkXG4gICAgICAgICAgLy8gaXQgb24gdGhlIG5nLXRlbXBsYXRlJ3MgY29uc3RzIChlLmcuIGZvciB0aGUgcHVycG9zZXMgb2YgZGlyZWN0aXZlIG1hdGNoaW5nKS4gSG93ZXZlcixcbiAgICAgICAgICAvLyB3ZSBzaG91bGQgbm90IGdlbmVyYXRlIGFuIHVwZGF0ZSBpbnN0cnVjdGlvbiBmb3IgaXQuXG4gICAgICAgICAgcmV0dXJuIGlyLmNyZWF0ZUV4dHJhY3RlZEF0dHJpYnV0ZU9wKFxuICAgICAgICAgICAgeHJlZixcbiAgICAgICAgICAgIGlyLkJpbmRpbmdLaW5kLlByb3BlcnR5LFxuICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgIGkxOG5NZXNzYWdlLFxuICAgICAgICAgICAgc2VjdXJpdHlDb250ZXh0LFxuICAgICAgICAgICk7XG4gICAgICAgIGNhc2UgZS5CaW5kaW5nVHlwZS5Ud29XYXk6XG4gICAgICAgICAgcmV0dXJuIGlyLmNyZWF0ZUV4dHJhY3RlZEF0dHJpYnV0ZU9wKFxuICAgICAgICAgICAgeHJlZixcbiAgICAgICAgICAgIGlyLkJpbmRpbmdLaW5kLlR3b1dheVByb3BlcnR5LFxuICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgIGkxOG5NZXNzYWdlLFxuICAgICAgICAgICAgc2VjdXJpdHlDb250ZXh0LFxuICAgICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFpc1RleHRCaW5kaW5nICYmICh0eXBlID09PSBlLkJpbmRpbmdUeXBlLkF0dHJpYnV0ZSB8fCB0eXBlID09PSBlLkJpbmRpbmdUeXBlLkFuaW1hdGlvbikpIHtcbiAgICAgIC8vIEFnYWluLCB0aGlzIGJpbmRpbmcgZG9lc24ndCByZWFsbHkgdGFyZ2V0IHRoZSBuZy10ZW1wbGF0ZTsgaXQgYWN0dWFsbHkgdGFyZ2V0cyB0aGUgZWxlbWVudFxuICAgICAgLy8gaW5zaWRlIHRoZSBzdHJ1Y3R1cmFsIHRlbXBsYXRlLiBJbiB0aGUgY2FzZSBvZiBub24tdGV4dCBhdHRyaWJ1dGUgb3IgYW5pbWF0aW9uIGJpbmRpbmdzLFxuICAgICAgLy8gdGhlIGJpbmRpbmcgZG9lc24ndCBldmVuIHNob3cgdXAgb24gdGhlIG5nLXRlbXBsYXRlIGNvbnN0IGFycmF5LCBzbyB3ZSBqdXN0IHNraXAgaXRcbiAgICAgIC8vIGVudGlyZWx5LlxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgbGV0IGJpbmRpbmdUeXBlID0gQklORElOR19LSU5EUy5nZXQodHlwZSkhO1xuXG4gIGlmICh0ZW1wbGF0ZUtpbmQgPT09IGlyLlRlbXBsYXRlS2luZC5OZ1RlbXBsYXRlKSB7XG4gICAgLy8gV2Uga25vdyB3ZSBhcmUgZGVhbGluZyB3aXRoIGJpbmRpbmdzIGRpcmVjdGx5IG9uIGFuIGV4cGxpY2l0IG5nLXRlbXBsYXRlLlxuICAgIC8vIFN0YXRpYyBhdHRyaWJ1dGUgYmluZGluZ3Mgc2hvdWxkIGJlIGNvbGxlY3RlZCBpbnRvIHRoZSBjb25zdCBhcnJheSBhcyBrL3YgcGFpcnMuIFByb3BlcnR5XG4gICAgLy8gYmluZGluZ3Mgc2hvdWxkIHJlc3VsdCBpbiBhIGBwcm9wZXJ0eWAgaW5zdHJ1Y3Rpb24sIGFuZCBgQXR0cmlidXRlTWFya2VyLkJpbmRpbmdzYCBjb25zdFxuICAgIC8vIGVudHJpZXMuXG4gICAgLy9cbiAgICAvLyBUaGUgZGlmZmljdWx0eSBpcyB3aXRoIGR5bmFtaWMgYXR0cmlidXRlLCBzdHlsZSwgYW5kIGNsYXNzIGJpbmRpbmdzLiBUaGVzZSBkb24ndCByZWFsbHkgbWFrZVxuICAgIC8vIHNlbnNlIG9uIGFuIGBuZy10ZW1wbGF0ZWAgYW5kIHNob3VsZCBwcm9iYWJseSBiZSBwYXJzZXIgZXJyb3JzLiBIb3dldmVyLFxuICAgIC8vIFRlbXBsYXRlRGVmaW5pdGlvbkJ1aWxkZXIgZ2VuZXJhdGVzIGBwcm9wZXJ0eWAgaW5zdHJ1Y3Rpb25zIGZvciB0aGVtLCBhbmQgc28gd2UgZG8gdGhhdCBhc1xuICAgIC8vIHdlbGwuXG4gICAgLy9cbiAgICAvLyBOb3RlIHRoYXQgd2UgZG8gaGF2ZSBhIHNsaWdodCBiZWhhdmlvciBkaWZmZXJlbmNlIHdpdGggVGVtcGxhdGVEZWZpbml0aW9uQnVpbGRlcjogYWx0aG91Z2hcbiAgICAvLyBUREIgZW1pdHMgYHByb3BlcnR5YCBpbnN0cnVjdGlvbnMgZm9yIGR5bmFtaWMgYXR0cmlidXRlcywgc3R5bGVzLCBhbmQgY2xhc3Nlcywgb25seSBzdHlsZXNcbiAgICAvLyBhbmQgY2xhc3NlcyBhbHNvIGdldCBjb25zdCBjb2xsZWN0ZWQgaW50byB0aGUgYEF0dHJpYnV0ZU1hcmtlci5CaW5kaW5nc2AgZmllbGQuIER5bmFtaWNcbiAgICAvLyBhdHRyaWJ1dGUgYmluZGluZ3MgYXJlIG1pc3NpbmcgZnJvbSB0aGUgY29uc3RzIGVudGlyZWx5LiBXZSBjaG9vc2UgdG8gZW1pdCB0aGVtIGludG8gdGhlXG4gICAgLy8gY29uc3RzIGZpZWxkIGFueXdheSwgdG8gYXZvaWQgY3JlYXRpbmcgc3BlY2lhbCBjYXNlcyBmb3Igc29tZXRoaW5nIHNvIGFyY2FuZSBhbmQgbm9uc2Vuc2ljYWwuXG4gICAgaWYgKFxuICAgICAgdHlwZSA9PT0gZS5CaW5kaW5nVHlwZS5DbGFzcyB8fFxuICAgICAgdHlwZSA9PT0gZS5CaW5kaW5nVHlwZS5TdHlsZSB8fFxuICAgICAgKHR5cGUgPT09IGUuQmluZGluZ1R5cGUuQXR0cmlidXRlICYmICFpc1RleHRCaW5kaW5nKVxuICAgICkge1xuICAgICAgLy8gVE9ETzogVGhlc2UgY2FzZXMgc2hvdWxkIGJlIHBhcnNlIGVycm9ycy5cbiAgICAgIGJpbmRpbmdUeXBlID0gaXIuQmluZGluZ0tpbmQuUHJvcGVydHk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGlyLmNyZWF0ZUJpbmRpbmdPcChcbiAgICB4cmVmLFxuICAgIGJpbmRpbmdUeXBlLFxuICAgIG5hbWUsXG4gICAgY29udmVydEFzdFdpdGhJbnRlcnBvbGF0aW9uKHZpZXcuam9iLCB2YWx1ZSwgaTE4bk1lc3NhZ2UpLFxuICAgIHVuaXQsXG4gICAgc2VjdXJpdHlDb250ZXh0LFxuICAgIGlzVGV4dEJpbmRpbmcsXG4gICAgaXNTdHJ1Y3R1cmFsVGVtcGxhdGVBdHRyaWJ1dGUsXG4gICAgdGVtcGxhdGVLaW5kLFxuICAgIGkxOG5NZXNzYWdlLFxuICAgIHNvdXJjZVNwYW4sXG4gICk7XG59XG5cbmZ1bmN0aW9uIG1ha2VMaXN0ZW5lckhhbmRsZXJPcHMoXG4gIHVuaXQ6IENvbXBpbGF0aW9uVW5pdCxcbiAgaGFuZGxlcjogZS5BU1QsXG4gIGhhbmRsZXJTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4pOiBpci5VcGRhdGVPcFtdIHtcbiAgaGFuZGxlciA9IGFzdE9mKGhhbmRsZXIpO1xuICBjb25zdCBoYW5kbGVyT3BzID0gbmV3IEFycmF5PGlyLlVwZGF0ZU9wPigpO1xuICBsZXQgaGFuZGxlckV4cHJzOiBlLkFTVFtdID0gaGFuZGxlciBpbnN0YW5jZW9mIGUuQ2hhaW4gPyBoYW5kbGVyLmV4cHJlc3Npb25zIDogW2hhbmRsZXJdO1xuICBpZiAoaGFuZGxlckV4cHJzLmxlbmd0aCA9PT0gMCkge1xuICAgIHRocm93IG5ldyBFcnJvcignRXhwZWN0ZWQgbGlzdGVuZXIgdG8gaGF2ZSBub24tZW1wdHkgZXhwcmVzc2lvbiBsaXN0LicpO1xuICB9XG4gIGNvbnN0IGV4cHJlc3Npb25zID0gaGFuZGxlckV4cHJzLm1hcCgoZXhwcikgPT4gY29udmVydEFzdChleHByLCB1bml0LmpvYiwgaGFuZGxlclNwYW4pKTtcbiAgY29uc3QgcmV0dXJuRXhwciA9IGV4cHJlc3Npb25zLnBvcCgpITtcbiAgaGFuZGxlck9wcy5wdXNoKFxuICAgIC4uLmV4cHJlc3Npb25zLm1hcCgoZSkgPT5cbiAgICAgIGlyLmNyZWF0ZVN0YXRlbWVudE9wPGlyLlVwZGF0ZU9wPihuZXcgby5FeHByZXNzaW9uU3RhdGVtZW50KGUsIGUuc291cmNlU3BhbikpLFxuICAgICksXG4gICk7XG4gIGhhbmRsZXJPcHMucHVzaChpci5jcmVhdGVTdGF0ZW1lbnRPcChuZXcgby5SZXR1cm5TdGF0ZW1lbnQocmV0dXJuRXhwciwgcmV0dXJuRXhwci5zb3VyY2VTcGFuKSkpO1xuICByZXR1cm4gaGFuZGxlck9wcztcbn1cblxuZnVuY3Rpb24gbWFrZVR3b1dheUxpc3RlbmVySGFuZGxlck9wcyhcbiAgdW5pdDogQ29tcGlsYXRpb25Vbml0LFxuICBoYW5kbGVyOiBlLkFTVCxcbiAgaGFuZGxlclNwYW46IFBhcnNlU291cmNlU3Bhbixcbik6IGlyLlVwZGF0ZU9wW10ge1xuICBoYW5kbGVyID0gYXN0T2YoaGFuZGxlcik7XG4gIGNvbnN0IGhhbmRsZXJPcHMgPSBuZXcgQXJyYXk8aXIuVXBkYXRlT3A+KCk7XG5cbiAgaWYgKGhhbmRsZXIgaW5zdGFuY2VvZiBlLkNoYWluKSB7XG4gICAgaWYgKGhhbmRsZXIuZXhwcmVzc2lvbnMubGVuZ3RoID09PSAxKSB7XG4gICAgICBoYW5kbGVyID0gaGFuZGxlci5leHByZXNzaW9uc1swXTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVGhpcyBpcyB2YWxpZGF0ZWQgZHVyaW5nIHBhcnNpbmcgYWxyZWFkeSwgYnV0IHdlIGRvIGl0IGhlcmUganVzdCBpbiBjYXNlLlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdFeHBlY3RlZCB0d28td2F5IGxpc3RlbmVyIHRvIGhhdmUgYSBzaW5nbGUgZXhwcmVzc2lvbi4nKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBoYW5kbGVyRXhwciA9IGNvbnZlcnRBc3QoaGFuZGxlciwgdW5pdC5qb2IsIGhhbmRsZXJTcGFuKTtcbiAgY29uc3QgZXZlbnRSZWZlcmVuY2UgPSBuZXcgaXIuTGV4aWNhbFJlYWRFeHByKCckZXZlbnQnKTtcbiAgY29uc3QgdHdvV2F5U2V0RXhwciA9IG5ldyBpci5Ud29XYXlCaW5kaW5nU2V0RXhwcihoYW5kbGVyRXhwciwgZXZlbnRSZWZlcmVuY2UpO1xuXG4gIGhhbmRsZXJPcHMucHVzaChpci5jcmVhdGVTdGF0ZW1lbnRPcDxpci5VcGRhdGVPcD4obmV3IG8uRXhwcmVzc2lvblN0YXRlbWVudCh0d29XYXlTZXRFeHByKSkpO1xuICBoYW5kbGVyT3BzLnB1c2goaXIuY3JlYXRlU3RhdGVtZW50T3AobmV3IG8uUmV0dXJuU3RhdGVtZW50KGV2ZW50UmVmZXJlbmNlKSkpO1xuICByZXR1cm4gaGFuZGxlck9wcztcbn1cblxuZnVuY3Rpb24gYXN0T2YoYXN0OiBlLkFTVCB8IGUuQVNUV2l0aFNvdXJjZSk6IGUuQVNUIHtcbiAgcmV0dXJuIGFzdCBpbnN0YW5jZW9mIGUuQVNUV2l0aFNvdXJjZSA/IGFzdC5hc3QgOiBhc3Q7XG59XG5cbi8qKlxuICogUHJvY2VzcyBhbGwgb2YgdGhlIGxvY2FsIHJlZmVyZW5jZXMgb24gYW4gZWxlbWVudC1saWtlIHN0cnVjdHVyZSBpbiB0aGUgdGVtcGxhdGUgQVNUIGFuZFxuICogY29udmVydCB0aGVtIHRvIHRoZWlyIElSIHJlcHJlc2VudGF0aW9uLlxuICovXG5mdW5jdGlvbiBpbmdlc3RSZWZlcmVuY2VzKG9wOiBpci5FbGVtZW50T3BCYXNlLCBlbGVtZW50OiB0LkVsZW1lbnQgfCB0LlRlbXBsYXRlKTogdm9pZCB7XG4gIGFzc2VydElzQXJyYXk8aXIuTG9jYWxSZWY+KG9wLmxvY2FsUmVmcyk7XG4gIGZvciAoY29uc3Qge25hbWUsIHZhbHVlfSBvZiBlbGVtZW50LnJlZmVyZW5jZXMpIHtcbiAgICBvcC5sb2NhbFJlZnMucHVzaCh7XG4gICAgICBuYW1lLFxuICAgICAgdGFyZ2V0OiB2YWx1ZSxcbiAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAqIEFzc2VydCB0aGF0IHRoZSBnaXZlbiB2YWx1ZSBpcyBhbiBhcnJheS5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0SXNBcnJheTxUPih2YWx1ZTogYW55KTogYXNzZXJ0cyB2YWx1ZSBpcyBBcnJheTxUPiB7XG4gIGlmICghQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEFzc2VydGlvbkVycm9yOiBleHBlY3RlZCBhbiBhcnJheWApO1xuICB9XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhYnNvbHV0ZSBgUGFyc2VTb3VyY2VTcGFuYCBmcm9tIHRoZSByZWxhdGl2ZSBgUGFyc2VTcGFuYC5cbiAqXG4gKiBgUGFyc2VTcGFuYCBvYmplY3RzIGFyZSByZWxhdGl2ZSB0byB0aGUgc3RhcnQgb2YgdGhlIGV4cHJlc3Npb24uXG4gKiBUaGlzIG1ldGhvZCBjb252ZXJ0cyB0aGVzZSB0byBmdWxsIGBQYXJzZVNvdXJjZVNwYW5gIG9iamVjdHMgdGhhdFxuICogc2hvdyB3aGVyZSB0aGUgc3BhbiBpcyB3aXRoaW4gdGhlIG92ZXJhbGwgc291cmNlIGZpbGUuXG4gKlxuICogQHBhcmFtIHNwYW4gdGhlIHJlbGF0aXZlIHNwYW4gdG8gY29udmVydC5cbiAqIEBwYXJhbSBiYXNlU291cmNlU3BhbiBhIHNwYW4gY29ycmVzcG9uZGluZyB0byB0aGUgYmFzZSBvZiB0aGUgZXhwcmVzc2lvbiB0cmVlLlxuICogQHJldHVybnMgYSBgUGFyc2VTb3VyY2VTcGFuYCBmb3IgdGhlIGdpdmVuIHNwYW4gb3IgbnVsbCBpZiBubyBgYmFzZVNvdXJjZVNwYW5gIHdhcyBwcm92aWRlZC5cbiAqL1xuZnVuY3Rpb24gY29udmVydFNvdXJjZVNwYW4oXG4gIHNwYW46IGUuUGFyc2VTcGFuLFxuICBiYXNlU291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuIHwgbnVsbCxcbik6IFBhcnNlU291cmNlU3BhbiB8IG51bGwge1xuICBpZiAoYmFzZVNvdXJjZVNwYW4gPT09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBjb25zdCBzdGFydCA9IGJhc2VTb3VyY2VTcGFuLnN0YXJ0Lm1vdmVCeShzcGFuLnN0YXJ0KTtcbiAgY29uc3QgZW5kID0gYmFzZVNvdXJjZVNwYW4uc3RhcnQubW92ZUJ5KHNwYW4uZW5kKTtcbiAgY29uc3QgZnVsbFN0YXJ0ID0gYmFzZVNvdXJjZVNwYW4uZnVsbFN0YXJ0Lm1vdmVCeShzcGFuLnN0YXJ0KTtcbiAgcmV0dXJuIG5ldyBQYXJzZVNvdXJjZVNwYW4oc3RhcnQsIGVuZCwgZnVsbFN0YXJ0KTtcbn1cblxuLyoqXG4gKiBXaXRoIHRoZSBkaXJlY3RpdmUtYmFzZWQgY29udHJvbCBmbG93IHVzZXJzIHdlcmUgYWJsZSB0byBjb25kaXRpb25hbGx5IHByb2plY3QgY29udGVudCB1c2luZ1xuICogdGhlIGAqYCBzeW50YXguIEUuZy4gYDxkaXYgKm5nSWY9XCJleHByXCIgcHJvamVjdE1lPjwvZGl2PmAgd2lsbCBiZSBwcm9qZWN0ZWQgaW50b1xuICogYDxuZy1jb250ZW50IHNlbGVjdD1cIltwcm9qZWN0TWVdXCIvPmAsIGJlY2F1c2UgdGhlIGF0dHJpYnV0ZXMgYW5kIHRhZyBuYW1lIGZyb20gdGhlIGBkaXZgIGFyZVxuICogY29waWVkIHRvIHRoZSB0ZW1wbGF0ZSB2aWEgdGhlIHRlbXBsYXRlIGNyZWF0aW9uIGluc3RydWN0aW9uLiBXaXRoIGBAaWZgIGFuZCBgQGZvcmAgdGhhdCBpc1xuICogbm90IHRoZSBjYXNlLCBiZWNhdXNlIHRoZSBjb25kaXRpb25hbCBpcyBwbGFjZWQgKmFyb3VuZCogZWxlbWVudHMsIHJhdGhlciB0aGFuICpvbiogdGhlbS5cbiAqIFRoZSByZXN1bHQgaXMgdGhhdCBjb250ZW50IHByb2plY3Rpb24gd29uJ3Qgd29yayBpbiB0aGUgc2FtZSB3YXkgaWYgYSB1c2VyIGNvbnZlcnRzIGZyb21cbiAqIGAqbmdJZmAgdG8gYEBpZmAuXG4gKlxuICogVGhpcyBmdW5jdGlvbiBhaW1zIHRvIGNvdmVyIHRoZSBtb3N0IGNvbW1vbiBjYXNlIGJ5IGRvaW5nIHRoZSBzYW1lIGNvcHlpbmcgd2hlbiBhIGNvbnRyb2wgZmxvd1xuICogbm9kZSBoYXMgKm9uZSBhbmQgb25seSBvbmUqIHJvb3QgZWxlbWVudCBvciB0ZW1wbGF0ZSBub2RlLlxuICpcbiAqIFRoaXMgYXBwcm9hY2ggY29tZXMgd2l0aCBzb21lIGNhdmVhdHM6XG4gKiAxLiBBcyBzb29uIGFzIGFueSBvdGhlciBub2RlIGlzIGFkZGVkIHRvIHRoZSByb290LCB0aGUgY29weWluZyBiZWhhdmlvciB3b24ndCB3b3JrIGFueW1vcmUuXG4gKiAgICBBIGRpYWdub3N0aWMgd2lsbCBiZSBhZGRlZCB0byBmbGFnIGNhc2VzIGxpa2UgdGhpcyBhbmQgdG8gZXhwbGFpbiBob3cgdG8gd29yayBhcm91bmQgaXQuXG4gKiAyLiBJZiBgcHJlc2VydmVXaGl0ZXNwYWNlc2AgaXMgZW5hYmxlZCwgaXQncyB2ZXJ5IGxpa2VseSB0aGF0IGluZGVudGF0aW9uIHdpbGwgYnJlYWsgdGhpc1xuICogICAgd29ya2Fyb3VuZCwgYmVjYXVzZSBpdCdsbCBpbmNsdWRlIGFuIGFkZGl0aW9uYWwgdGV4dCBub2RlIGFzIHRoZSBmaXJzdCBjaGlsZC4gV2UgY2FuIHdvcmtcbiAqICAgIGFyb3VuZCBpdCBoZXJlLCBidXQgaW4gYSBkaXNjdXNzaW9uIGl0IHdhcyBkZWNpZGVkIG5vdCB0bywgYmVjYXVzZSB0aGUgdXNlciBleHBsaWNpdGx5IG9wdGVkXG4gKiAgICBpbnRvIHByZXNlcnZpbmcgdGhlIHdoaXRlc3BhY2UgYW5kIHdlIHdvdWxkIGhhdmUgdG8gZHJvcCBpdCBmcm9tIHRoZSBnZW5lcmF0ZWQgY29kZS5cbiAqICAgIFRoZSBkaWFnbm9zdGljIG1lbnRpb25lZCBwb2ludCAjMSB3aWxsIGZsYWcgc3VjaCBjYXNlcyB0byB1c2Vycy5cbiAqXG4gKiBAcmV0dXJucyBUYWcgbmFtZSB0byBiZSB1c2VkIGZvciB0aGUgY29udHJvbCBmbG93IHRlbXBsYXRlLlxuICovXG5mdW5jdGlvbiBpbmdlc3RDb250cm9sRmxvd0luc2VydGlvblBvaW50KFxuICB1bml0OiBWaWV3Q29tcGlsYXRpb25Vbml0LFxuICB4cmVmOiBpci5YcmVmSWQsXG4gIG5vZGU6IHQuSWZCbG9ja0JyYW5jaCB8IHQuU3dpdGNoQmxvY2tDYXNlIHwgdC5Gb3JMb29wQmxvY2sgfCB0LkZvckxvb3BCbG9ja0VtcHR5LFxuKTogc3RyaW5nIHwgbnVsbCB7XG4gIGxldCByb290OiB0LkVsZW1lbnQgfCB0LlRlbXBsYXRlIHwgbnVsbCA9IG51bGw7XG5cbiAgZm9yIChjb25zdCBjaGlsZCBvZiBub2RlLmNoaWxkcmVuKSB7XG4gICAgLy8gU2tpcCBvdmVyIGNvbW1lbnQgbm9kZXMuXG4gICAgaWYgKGNoaWxkIGluc3RhbmNlb2YgdC5Db21tZW50KSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBXZSBjYW4gb25seSBpbmZlciB0aGUgdGFnIG5hbWUvYXR0cmlidXRlcyBpZiB0aGVyZSdzIGEgc2luZ2xlIHJvb3Qgbm9kZS5cbiAgICBpZiAocm9vdCAhPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8gUm9vdCBub2RlcyBjYW4gb25seSBlbGVtZW50cyBvciB0ZW1wbGF0ZXMgd2l0aCBhIHRhZyBuYW1lIChlLmcuIGA8ZGl2ICpmb28+PC9kaXY+YCkuXG4gICAgaWYgKGNoaWxkIGluc3RhbmNlb2YgdC5FbGVtZW50IHx8IChjaGlsZCBpbnN0YW5jZW9mIHQuVGVtcGxhdGUgJiYgY2hpbGQudGFnTmFtZSAhPT0gbnVsbCkpIHtcbiAgICAgIHJvb3QgPSBjaGlsZDtcbiAgICB9XG4gIH1cblxuICAvLyBJZiB3ZSd2ZSBmb3VuZCBhIHNpbmdsZSByb290IG5vZGUsIGl0cyB0YWcgbmFtZSBhbmQgYXR0cmlidXRlcyBjYW4gYmVcbiAgLy8gY29waWVkIHRvIHRoZSBzdXJyb3VuZGluZyB0ZW1wbGF0ZSB0byBiZSB1c2VkIGZvciBjb250ZW50IHByb2plY3Rpb24uXG4gIGlmIChyb290ICE9PSBudWxsKSB7XG4gICAgLy8gQ29sbGVjdCB0aGUgc3RhdGljIGF0dHJpYnV0ZXMgZm9yIGNvbnRlbnQgcHJvamVjdGlvbiBwdXJwb3Nlcy5cbiAgICBmb3IgKGNvbnN0IGF0dHIgb2Ygcm9vdC5hdHRyaWJ1dGVzKSB7XG4gICAgICBjb25zdCBzZWN1cml0eUNvbnRleHQgPSBkb21TY2hlbWEuc2VjdXJpdHlDb250ZXh0KE5HX1RFTVBMQVRFX1RBR19OQU1FLCBhdHRyLm5hbWUsIHRydWUpO1xuICAgICAgdW5pdC51cGRhdGUucHVzaChcbiAgICAgICAgaXIuY3JlYXRlQmluZGluZ09wKFxuICAgICAgICAgIHhyZWYsXG4gICAgICAgICAgaXIuQmluZGluZ0tpbmQuQXR0cmlidXRlLFxuICAgICAgICAgIGF0dHIubmFtZSxcbiAgICAgICAgICBvLmxpdGVyYWwoYXR0ci52YWx1ZSksXG4gICAgICAgICAgbnVsbCxcbiAgICAgICAgICBzZWN1cml0eUNvbnRleHQsXG4gICAgICAgICAgdHJ1ZSxcbiAgICAgICAgICBmYWxzZSxcbiAgICAgICAgICBudWxsLFxuICAgICAgICAgIGFzTWVzc2FnZShhdHRyLmkxOG4pLFxuICAgICAgICAgIGF0dHIuc291cmNlU3BhbixcbiAgICAgICAgKSxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gQWxzbyBjb2xsZWN0IHRoZSBpbnB1dHMgc2luY2UgdGhleSBwYXJ0aWNpcGF0ZSBpbiBjb250ZW50IHByb2plY3Rpb24gYXMgd2VsbC5cbiAgICAvLyBOb3RlIHRoYXQgVERCIHVzZWQgdG8gY29sbGVjdCB0aGUgb3V0cHV0cyBhcyB3ZWxsLCBidXQgaXQgd2Fzbid0IHBhc3NpbmcgdGhlbSBpbnRvXG4gICAgLy8gdGhlIHRlbXBsYXRlIGluc3RydWN0aW9uLiBIZXJlIHdlIGp1c3QgZG9uJ3QgY29sbGVjdCB0aGVtLlxuICAgIGZvciAoY29uc3QgYXR0ciBvZiByb290LmlucHV0cykge1xuICAgICAgaWYgKGF0dHIudHlwZSAhPT0gZS5CaW5kaW5nVHlwZS5BbmltYXRpb24gJiYgYXR0ci50eXBlICE9PSBlLkJpbmRpbmdUeXBlLkF0dHJpYnV0ZSkge1xuICAgICAgICBjb25zdCBzZWN1cml0eUNvbnRleHQgPSBkb21TY2hlbWEuc2VjdXJpdHlDb250ZXh0KE5HX1RFTVBMQVRFX1RBR19OQU1FLCBhdHRyLm5hbWUsIHRydWUpO1xuICAgICAgICB1bml0LmNyZWF0ZS5wdXNoKFxuICAgICAgICAgIGlyLmNyZWF0ZUV4dHJhY3RlZEF0dHJpYnV0ZU9wKFxuICAgICAgICAgICAgeHJlZixcbiAgICAgICAgICAgIGlyLkJpbmRpbmdLaW5kLlByb3BlcnR5LFxuICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgIGF0dHIubmFtZSxcbiAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgIHNlY3VyaXR5Q29udGV4dCxcbiAgICAgICAgICApLFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHRhZ05hbWUgPSByb290IGluc3RhbmNlb2YgdC5FbGVtZW50ID8gcm9vdC5uYW1lIDogcm9vdC50YWdOYW1lO1xuXG4gICAgLy8gRG9uJ3QgcGFzcyBhbG9uZyBgbmctdGVtcGxhdGVgIHRhZyBuYW1lIHNpbmNlIGl0IGVuYWJsZXMgZGlyZWN0aXZlIG1hdGNoaW5nLlxuICAgIHJldHVybiB0YWdOYW1lID09PSBOR19URU1QTEFURV9UQUdfTkFNRSA/IG51bGwgOiB0YWdOYW1lO1xuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59XG4iXX0=