/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { AST, ImplicitReceiver, RecursiveAstVisitor, ThisReceiver, } from '../../expression_parser/ast';
import { CssSelector, SelectorMatcher } from '../../selector';
import { Comment, Content, DeferredBlock, DeferredBlockError, DeferredBlockLoading, DeferredBlockPlaceholder, Element, ForLoopBlock, ForLoopBlockEmpty, HoverDeferredTrigger, IfBlockBranch, InteractionDeferredTrigger, LetDeclaration, Reference, SwitchBlockCase, Template, ViewportDeferredTrigger, } from '../r3_ast';
import { parseTemplate } from './template';
import { createCssSelectorFromNode } from './util';
/**
 * Computes a difference between full list (first argument) and
 * list of items that should be excluded from the full list (second
 * argument).
 */
function diff(fullList, itemsToExclude) {
    const exclude = new Set(itemsToExclude);
    return fullList.filter((item) => !exclude.has(item));
}
/**
 * Given a template string and a set of available directive selectors,
 * computes a list of matching selectors and splits them into 2 buckets:
 * (1) eagerly used in a template and (2) directives used only in defer
 * blocks. Similarly, returns 2 lists of pipes (eager and deferrable).
 *
 * Note: deferrable directives selectors and pipes names used in `@defer`
 * blocks are **candidates** and API caller should make sure that:
 *
 *  * A Component where a given template is defined is standalone
 *  * Underlying dependency classes are also standalone
 *  * Dependency class symbols are not eagerly used in a TS file
 *    where a host component (that owns the template) is located
 */
export function findMatchingDirectivesAndPipes(template, directiveSelectors) {
    const matcher = new SelectorMatcher();
    for (const selector of directiveSelectors) {
        // Create a fake directive instance to account for the logic inside
        // of the `R3TargetBinder` class (which invokes the `hasBindingPropertyName`
        // function internally).
        const fakeDirective = {
            selector,
            exportAs: null,
            inputs: {
                hasBindingPropertyName() {
                    return false;
                },
            },
            outputs: {
                hasBindingPropertyName() {
                    return false;
                },
            },
        };
        matcher.addSelectables(CssSelector.parse(selector), [fakeDirective]);
    }
    const parsedTemplate = parseTemplate(template, '' /* templateUrl */);
    const binder = new R3TargetBinder(matcher);
    const bound = binder.bind({ template: parsedTemplate.nodes });
    const eagerDirectiveSelectors = bound.getEagerlyUsedDirectives().map((dir) => dir.selector);
    const allMatchedDirectiveSelectors = bound.getUsedDirectives().map((dir) => dir.selector);
    const eagerPipes = bound.getEagerlyUsedPipes();
    return {
        directives: {
            regular: eagerDirectiveSelectors,
            deferCandidates: diff(allMatchedDirectiveSelectors, eagerDirectiveSelectors),
        },
        pipes: {
            regular: eagerPipes,
            deferCandidates: diff(bound.getUsedPipes(), eagerPipes),
        },
    };
}
/**
 * Processes `Target`s with a given set of directives and performs a binding operation, which
 * returns an object similar to TypeScript's `ts.TypeChecker` that contains knowledge about the
 * target.
 */
export class R3TargetBinder {
    constructor(directiveMatcher) {
        this.directiveMatcher = directiveMatcher;
    }
    /**
     * Perform a binding operation on the given `Target` and return a `BoundTarget` which contains
     * metadata about the types referenced in the template.
     */
    bind(target) {
        if (!target.template) {
            // TODO(alxhub): handle targets which contain things like HostBindings, etc.
            throw new Error('Binding without a template not yet supported');
        }
        // First, parse the template into a `Scope` structure. This operation captures the syntactic
        // scopes in the template and makes them available for later use.
        const scope = Scope.apply(target.template);
        // Use the `Scope` to extract the entities present at every level of the template.
        const scopedNodeEntities = extractScopedNodeEntities(scope);
        // Next, perform directive matching on the template using the `DirectiveBinder`. This returns:
        //   - directives: Map of nodes (elements & ng-templates) to the directives on them.
        //   - bindings: Map of inputs, outputs, and attributes to the directive/element that claims
        //     them. TODO(alxhub): handle multiple directives claiming an input/output/etc.
        //   - references: Map of #references to their targets.
        const { directives, eagerDirectives, bindings, references } = DirectiveBinder.apply(target.template, this.directiveMatcher);
        // Finally, run the TemplateBinder to bind references, variables, and other entities within the
        // template. This extracts all the metadata that doesn't depend on directive matching.
        const { expressions, symbols, nestingLevel, usedPipes, eagerPipes, deferBlocks } = TemplateBinder.applyWithScope(target.template, scope);
        return new R3BoundTarget(target, directives, eagerDirectives, bindings, references, expressions, symbols, nestingLevel, scopedNodeEntities, usedPipes, eagerPipes, deferBlocks);
    }
}
/**
 * Represents a binding scope within a template.
 *
 * Any variables, references, or other named entities declared within the template will
 * be captured and available by name in `namedEntities`. Additionally, child templates will
 * be analyzed and have their child `Scope`s available in `childScopes`.
 */
class Scope {
    constructor(parentScope, rootNode) {
        this.parentScope = parentScope;
        this.rootNode = rootNode;
        /**
         * Named members of the `Scope`, such as `Reference`s or `Variable`s.
         */
        this.namedEntities = new Map();
        /**
         * Set of elements that belong to this scope.
         */
        this.elementsInScope = new Set();
        /**
         * Child `Scope`s for immediately nested `ScopedNode`s.
         */
        this.childScopes = new Map();
        this.isDeferred =
            parentScope !== null && parentScope.isDeferred ? true : rootNode instanceof DeferredBlock;
    }
    static newRootScope() {
        return new Scope(null, null);
    }
    /**
     * Process a template (either as a `Template` sub-template with variables, or a plain array of
     * template `Node`s) and construct its `Scope`.
     */
    static apply(template) {
        const scope = Scope.newRootScope();
        scope.ingest(template);
        return scope;
    }
    /**
     * Internal method to process the scoped node and populate the `Scope`.
     */
    ingest(nodeOrNodes) {
        if (nodeOrNodes instanceof Template) {
            // Variables on an <ng-template> are defined in the inner scope.
            nodeOrNodes.variables.forEach((node) => this.visitVariable(node));
            // Process the nodes of the template.
            nodeOrNodes.children.forEach((node) => node.visit(this));
        }
        else if (nodeOrNodes instanceof IfBlockBranch) {
            if (nodeOrNodes.expressionAlias !== null) {
                this.visitVariable(nodeOrNodes.expressionAlias);
            }
            nodeOrNodes.children.forEach((node) => node.visit(this));
        }
        else if (nodeOrNodes instanceof ForLoopBlock) {
            this.visitVariable(nodeOrNodes.item);
            nodeOrNodes.contextVariables.forEach((v) => this.visitVariable(v));
            nodeOrNodes.children.forEach((node) => node.visit(this));
        }
        else if (nodeOrNodes instanceof SwitchBlockCase ||
            nodeOrNodes instanceof ForLoopBlockEmpty ||
            nodeOrNodes instanceof DeferredBlock ||
            nodeOrNodes instanceof DeferredBlockError ||
            nodeOrNodes instanceof DeferredBlockPlaceholder ||
            nodeOrNodes instanceof DeferredBlockLoading ||
            nodeOrNodes instanceof Content) {
            nodeOrNodes.children.forEach((node) => node.visit(this));
        }
        else {
            // No overarching `Template` instance, so process the nodes directly.
            nodeOrNodes.forEach((node) => node.visit(this));
        }
    }
    visitElement(element) {
        // `Element`s in the template may have `Reference`s which are captured in the scope.
        element.references.forEach((node) => this.visitReference(node));
        // Recurse into the `Element`'s children.
        element.children.forEach((node) => node.visit(this));
        this.elementsInScope.add(element);
    }
    visitTemplate(template) {
        // References on a <ng-template> are defined in the outer scope, so capture them before
        // processing the template's child scope.
        template.references.forEach((node) => this.visitReference(node));
        // Next, create an inner scope and process the template within it.
        this.ingestScopedNode(template);
    }
    visitVariable(variable) {
        // Declare the variable if it's not already.
        this.maybeDeclare(variable);
    }
    visitReference(reference) {
        // Declare the variable if it's not already.
        this.maybeDeclare(reference);
    }
    visitDeferredBlock(deferred) {
        this.ingestScopedNode(deferred);
        deferred.placeholder?.visit(this);
        deferred.loading?.visit(this);
        deferred.error?.visit(this);
    }
    visitDeferredBlockPlaceholder(block) {
        this.ingestScopedNode(block);
    }
    visitDeferredBlockError(block) {
        this.ingestScopedNode(block);
    }
    visitDeferredBlockLoading(block) {
        this.ingestScopedNode(block);
    }
    visitSwitchBlock(block) {
        block.cases.forEach((node) => node.visit(this));
    }
    visitSwitchBlockCase(block) {
        this.ingestScopedNode(block);
    }
    visitForLoopBlock(block) {
        this.ingestScopedNode(block);
        block.empty?.visit(this);
    }
    visitForLoopBlockEmpty(block) {
        this.ingestScopedNode(block);
    }
    visitIfBlock(block) {
        block.branches.forEach((node) => node.visit(this));
    }
    visitIfBlockBranch(block) {
        this.ingestScopedNode(block);
    }
    visitContent(content) {
        this.ingestScopedNode(content);
    }
    visitLetDeclaration(decl) {
        this.maybeDeclare(decl);
    }
    // Unused visitors.
    visitBoundAttribute(attr) { }
    visitBoundEvent(event) { }
    visitBoundText(text) { }
    visitText(text) { }
    visitTextAttribute(attr) { }
    visitIcu(icu) { }
    visitDeferredTrigger(trigger) { }
    visitUnknownBlock(block) { }
    maybeDeclare(thing) {
        // Declare something with a name, as long as that name isn't taken.
        if (!this.namedEntities.has(thing.name)) {
            this.namedEntities.set(thing.name, thing);
        }
    }
    /**
     * Look up a variable within this `Scope`.
     *
     * This can recurse into a parent `Scope` if it's available.
     */
    lookup(name) {
        if (this.namedEntities.has(name)) {
            // Found in the local scope.
            return this.namedEntities.get(name);
        }
        else if (this.parentScope !== null) {
            // Not in the local scope, but there's a parent scope so check there.
            return this.parentScope.lookup(name);
        }
        else {
            // At the top level and it wasn't found.
            return null;
        }
    }
    /**
     * Get the child scope for a `ScopedNode`.
     *
     * This should always be defined.
     */
    getChildScope(node) {
        const res = this.childScopes.get(node);
        if (res === undefined) {
            throw new Error(`Assertion error: child scope for ${node} not found`);
        }
        return res;
    }
    ingestScopedNode(node) {
        const scope = new Scope(this, node);
        scope.ingest(node);
        this.childScopes.set(node, scope);
    }
}
/**
 * Processes a template and matches directives on nodes (elements and templates).
 *
 * Usually used via the static `apply()` method.
 */
class DirectiveBinder {
    constructor(matcher, directives, eagerDirectives, bindings, references) {
        this.matcher = matcher;
        this.directives = directives;
        this.eagerDirectives = eagerDirectives;
        this.bindings = bindings;
        this.references = references;
        // Indicates whether we are visiting elements within a `defer` block
        this.isInDeferBlock = false;
    }
    /**
     * Process a template (list of `Node`s) and perform directive matching against each node.
     *
     * @param template the list of template `Node`s to match (recursively).
     * @param selectorMatcher a `SelectorMatcher` containing the directives that are in scope for
     * this template.
     * @returns three maps which contain information about directives in the template: the
     * `directives` map which lists directives matched on each node, the `bindings` map which
     * indicates which directives claimed which bindings (inputs, outputs, etc), and the `references`
     * map which resolves #references (`Reference`s) within the template to the named directive or
     * template node.
     */
    static apply(template, selectorMatcher) {
        const directives = new Map();
        const bindings = new Map();
        const references = new Map();
        const eagerDirectives = [];
        const matcher = new DirectiveBinder(selectorMatcher, directives, eagerDirectives, bindings, references);
        matcher.ingest(template);
        return { directives, eagerDirectives, bindings, references };
    }
    ingest(template) {
        template.forEach((node) => node.visit(this));
    }
    visitElement(element) {
        this.visitElementOrTemplate(element);
    }
    visitTemplate(template) {
        this.visitElementOrTemplate(template);
    }
    visitElementOrTemplate(node) {
        // First, determine the HTML shape of the node for the purpose of directive matching.
        // Do this by building up a `CssSelector` for the node.
        const cssSelector = createCssSelectorFromNode(node);
        // Next, use the `SelectorMatcher` to get the list of directives on the node.
        const directives = [];
        this.matcher.match(cssSelector, (_selector, results) => directives.push(...results));
        if (directives.length > 0) {
            this.directives.set(node, directives);
            if (!this.isInDeferBlock) {
                this.eagerDirectives.push(...directives);
            }
        }
        // Resolve any references that are created on this node.
        node.references.forEach((ref) => {
            let dirTarget = null;
            // If the reference expression is empty, then it matches the "primary" directive on the node
            // (if there is one). Otherwise it matches the host node itself (either an element or
            // <ng-template> node).
            if (ref.value.trim() === '') {
                // This could be a reference to a component if there is one.
                dirTarget = directives.find((dir) => dir.isComponent) || null;
            }
            else {
                // This should be a reference to a directive exported via exportAs.
                dirTarget =
                    directives.find((dir) => dir.exportAs !== null && dir.exportAs.some((value) => value === ref.value)) || null;
                // Check if a matching directive was found.
                if (dirTarget === null) {
                    // No matching directive was found - this reference points to an unknown target. Leave it
                    // unmapped.
                    return;
                }
            }
            if (dirTarget !== null) {
                // This reference points to a directive.
                this.references.set(ref, { directive: dirTarget, node });
            }
            else {
                // This reference points to the node itself.
                this.references.set(ref, node);
            }
        });
        const setAttributeBinding = (attribute, ioType) => {
            const dir = directives.find((dir) => dir[ioType].hasBindingPropertyName(attribute.name));
            const binding = dir !== undefined ? dir : node;
            this.bindings.set(attribute, binding);
        };
        // Node inputs (bound attributes) and text attributes can be bound to an
        // input on a directive.
        node.inputs.forEach((input) => setAttributeBinding(input, 'inputs'));
        node.attributes.forEach((attr) => setAttributeBinding(attr, 'inputs'));
        if (node instanceof Template) {
            node.templateAttrs.forEach((attr) => setAttributeBinding(attr, 'inputs'));
        }
        // Node outputs (bound events) can be bound to an output on a directive.
        node.outputs.forEach((output) => setAttributeBinding(output, 'outputs'));
        // Recurse into the node's children.
        node.children.forEach((child) => child.visit(this));
    }
    visitDeferredBlock(deferred) {
        const wasInDeferBlock = this.isInDeferBlock;
        this.isInDeferBlock = true;
        deferred.children.forEach((child) => child.visit(this));
        this.isInDeferBlock = wasInDeferBlock;
        deferred.placeholder?.visit(this);
        deferred.loading?.visit(this);
        deferred.error?.visit(this);
    }
    visitDeferredBlockPlaceholder(block) {
        block.children.forEach((child) => child.visit(this));
    }
    visitDeferredBlockError(block) {
        block.children.forEach((child) => child.visit(this));
    }
    visitDeferredBlockLoading(block) {
        block.children.forEach((child) => child.visit(this));
    }
    visitSwitchBlock(block) {
        block.cases.forEach((node) => node.visit(this));
    }
    visitSwitchBlockCase(block) {
        block.children.forEach((node) => node.visit(this));
    }
    visitForLoopBlock(block) {
        block.item.visit(this);
        block.contextVariables.forEach((v) => v.visit(this));
        block.children.forEach((node) => node.visit(this));
        block.empty?.visit(this);
    }
    visitForLoopBlockEmpty(block) {
        block.children.forEach((node) => node.visit(this));
    }
    visitIfBlock(block) {
        block.branches.forEach((node) => node.visit(this));
    }
    visitIfBlockBranch(block) {
        block.expressionAlias?.visit(this);
        block.children.forEach((node) => node.visit(this));
    }
    visitContent(content) {
        content.children.forEach((child) => child.visit(this));
    }
    // Unused visitors.
    visitVariable(variable) { }
    visitReference(reference) { }
    visitTextAttribute(attribute) { }
    visitBoundAttribute(attribute) { }
    visitBoundEvent(attribute) { }
    visitBoundAttributeOrEvent(node) { }
    visitText(text) { }
    visitBoundText(text) { }
    visitIcu(icu) { }
    visitDeferredTrigger(trigger) { }
    visitUnknownBlock(block) { }
    visitLetDeclaration(decl) { }
}
/**
 * Processes a template and extract metadata about expressions and symbols within.
 *
 * This is a companion to the `DirectiveBinder` that doesn't require knowledge of directives matched
 * within the template in order to operate.
 *
 * Expressions are visited by the superclass `RecursiveAstVisitor`, with custom logic provided
 * by overridden methods from that visitor.
 */
class TemplateBinder extends RecursiveAstVisitor {
    constructor(bindings, symbols, usedPipes, eagerPipes, deferBlocks, nestingLevel, scope, rootNode, level) {
        super();
        this.bindings = bindings;
        this.symbols = symbols;
        this.usedPipes = usedPipes;
        this.eagerPipes = eagerPipes;
        this.deferBlocks = deferBlocks;
        this.nestingLevel = nestingLevel;
        this.scope = scope;
        this.rootNode = rootNode;
        this.level = level;
        // Save a bit of processing time by constructing this closure in advance.
        this.visitNode = (node) => node.visit(this);
    }
    // This method is defined to reconcile the type of TemplateBinder since both
    // RecursiveAstVisitor and Visitor define the visit() method in their
    // interfaces.
    visit(node, context) {
        if (node instanceof AST) {
            node.visit(this, context);
        }
        else {
            node.visit(this);
        }
    }
    /**
     * Process a template and extract metadata about expressions and symbols within.
     *
     * @param nodes the nodes of the template to process
     * @param scope the `Scope` of the template being processed.
     * @returns three maps which contain metadata about the template: `expressions` which interprets
     * special `AST` nodes in expressions as pointing to references or variables declared within the
     * template, `symbols` which maps those variables and references to the nested `Template` which
     * declares them, if any, and `nestingLevel` which associates each `Template` with a integer
     * nesting level (how many levels deep within the template structure the `Template` is), starting
     * at 1.
     */
    static applyWithScope(nodes, scope) {
        const expressions = new Map();
        const symbols = new Map();
        const nestingLevel = new Map();
        const usedPipes = new Set();
        const eagerPipes = new Set();
        const template = nodes instanceof Template ? nodes : null;
        const deferBlocks = [];
        // The top-level template has nesting level 0.
        const binder = new TemplateBinder(expressions, symbols, usedPipes, eagerPipes, deferBlocks, nestingLevel, scope, template, 0);
        binder.ingest(nodes);
        return { expressions, symbols, nestingLevel, usedPipes, eagerPipes, deferBlocks };
    }
    ingest(nodeOrNodes) {
        if (nodeOrNodes instanceof Template) {
            // For <ng-template>s, process only variables and child nodes. Inputs, outputs, templateAttrs,
            // and references were all processed in the scope of the containing template.
            nodeOrNodes.variables.forEach(this.visitNode);
            nodeOrNodes.children.forEach(this.visitNode);
            // Set the nesting level.
            this.nestingLevel.set(nodeOrNodes, this.level);
        }
        else if (nodeOrNodes instanceof IfBlockBranch) {
            if (nodeOrNodes.expressionAlias !== null) {
                this.visitNode(nodeOrNodes.expressionAlias);
            }
            nodeOrNodes.children.forEach(this.visitNode);
            this.nestingLevel.set(nodeOrNodes, this.level);
        }
        else if (nodeOrNodes instanceof ForLoopBlock) {
            this.visitNode(nodeOrNodes.item);
            nodeOrNodes.contextVariables.forEach((v) => this.visitNode(v));
            nodeOrNodes.trackBy.visit(this);
            nodeOrNodes.children.forEach(this.visitNode);
            this.nestingLevel.set(nodeOrNodes, this.level);
        }
        else if (nodeOrNodes instanceof DeferredBlock) {
            if (this.scope.rootNode !== nodeOrNodes) {
                throw new Error(`Assertion error: resolved incorrect scope for deferred block ${nodeOrNodes}`);
            }
            this.deferBlocks.push([nodeOrNodes, this.scope]);
            nodeOrNodes.children.forEach((node) => node.visit(this));
            this.nestingLevel.set(nodeOrNodes, this.level);
        }
        else if (nodeOrNodes instanceof SwitchBlockCase ||
            nodeOrNodes instanceof ForLoopBlockEmpty ||
            nodeOrNodes instanceof DeferredBlockError ||
            nodeOrNodes instanceof DeferredBlockPlaceholder ||
            nodeOrNodes instanceof DeferredBlockLoading ||
            nodeOrNodes instanceof Content) {
            nodeOrNodes.children.forEach((node) => node.visit(this));
            this.nestingLevel.set(nodeOrNodes, this.level);
        }
        else {
            // Visit each node from the top-level template.
            nodeOrNodes.forEach(this.visitNode);
        }
    }
    visitElement(element) {
        // Visit the inputs, outputs, and children of the element.
        element.inputs.forEach(this.visitNode);
        element.outputs.forEach(this.visitNode);
        element.children.forEach(this.visitNode);
        element.references.forEach(this.visitNode);
    }
    visitTemplate(template) {
        // First, visit inputs, outputs and template attributes of the template node.
        template.inputs.forEach(this.visitNode);
        template.outputs.forEach(this.visitNode);
        template.templateAttrs.forEach(this.visitNode);
        template.references.forEach(this.visitNode);
        // Next, recurse into the template.
        this.ingestScopedNode(template);
    }
    visitVariable(variable) {
        // Register the `Variable` as a symbol in the current `Template`.
        if (this.rootNode !== null) {
            this.symbols.set(variable, this.rootNode);
        }
    }
    visitReference(reference) {
        // Register the `Reference` as a symbol in the current `Template`.
        if (this.rootNode !== null) {
            this.symbols.set(reference, this.rootNode);
        }
    }
    // Unused template visitors
    visitText(text) { }
    visitTextAttribute(attribute) { }
    visitUnknownBlock(block) { }
    visitDeferredTrigger() { }
    visitIcu(icu) {
        Object.keys(icu.vars).forEach((key) => icu.vars[key].visit(this));
        Object.keys(icu.placeholders).forEach((key) => icu.placeholders[key].visit(this));
    }
    // The remaining visitors are concerned with processing AST expressions within template bindings
    visitBoundAttribute(attribute) {
        attribute.value.visit(this);
    }
    visitBoundEvent(event) {
        event.handler.visit(this);
    }
    visitDeferredBlock(deferred) {
        this.ingestScopedNode(deferred);
        deferred.triggers.when?.value.visit(this);
        deferred.prefetchTriggers.when?.value.visit(this);
        deferred.placeholder && this.visitNode(deferred.placeholder);
        deferred.loading && this.visitNode(deferred.loading);
        deferred.error && this.visitNode(deferred.error);
    }
    visitDeferredBlockPlaceholder(block) {
        this.ingestScopedNode(block);
    }
    visitDeferredBlockError(block) {
        this.ingestScopedNode(block);
    }
    visitDeferredBlockLoading(block) {
        this.ingestScopedNode(block);
    }
    visitSwitchBlock(block) {
        block.expression.visit(this);
        block.cases.forEach(this.visitNode);
    }
    visitSwitchBlockCase(block) {
        block.expression?.visit(this);
        this.ingestScopedNode(block);
    }
    visitForLoopBlock(block) {
        block.expression.visit(this);
        this.ingestScopedNode(block);
        block.empty?.visit(this);
    }
    visitForLoopBlockEmpty(block) {
        this.ingestScopedNode(block);
    }
    visitIfBlock(block) {
        block.branches.forEach((node) => node.visit(this));
    }
    visitIfBlockBranch(block) {
        block.expression?.visit(this);
        this.ingestScopedNode(block);
    }
    visitContent(content) {
        this.ingestScopedNode(content);
    }
    visitBoundText(text) {
        text.value.visit(this);
    }
    visitLetDeclaration(decl) {
        decl.value.visit(this);
        if (this.rootNode !== null) {
            this.symbols.set(decl, this.rootNode);
        }
    }
    visitPipe(ast, context) {
        this.usedPipes.add(ast.name);
        if (!this.scope.isDeferred) {
            this.eagerPipes.add(ast.name);
        }
        return super.visitPipe(ast, context);
    }
    // These five types of AST expressions can refer to expression roots, which could be variables
    // or references in the current scope.
    visitPropertyRead(ast, context) {
        this.maybeMap(ast, ast.name);
        return super.visitPropertyRead(ast, context);
    }
    visitSafePropertyRead(ast, context) {
        this.maybeMap(ast, ast.name);
        return super.visitSafePropertyRead(ast, context);
    }
    visitPropertyWrite(ast, context) {
        this.maybeMap(ast, ast.name);
        return super.visitPropertyWrite(ast, context);
    }
    ingestScopedNode(node) {
        const childScope = this.scope.getChildScope(node);
        const binder = new TemplateBinder(this.bindings, this.symbols, this.usedPipes, this.eagerPipes, this.deferBlocks, this.nestingLevel, childScope, node, this.level + 1);
        binder.ingest(node);
    }
    maybeMap(ast, name) {
        // If the receiver of the expression isn't the `ImplicitReceiver`, this isn't the root of an
        // `AST` expression that maps to a `Variable` or `Reference`.
        if (!(ast.receiver instanceof ImplicitReceiver)) {
            return;
        }
        // Check whether the name exists in the current scope. If so, map it. Otherwise, the name is
        // probably a property on the top-level component context.
        const target = this.scope.lookup(name);
        // It's not allowed to read template entities via `this`, however it previously worked by
        // accident (see #55115). Since `@let` declarations are new, we can fix it from the beginning,
        // whereas pre-existing template entities will be fixed in #55115.
        if (target instanceof LetDeclaration && ast.receiver instanceof ThisReceiver) {
            return;
        }
        if (target !== null) {
            this.bindings.set(ast, target);
        }
    }
}
/**
 * Metadata container for a `Target` that allows queries for specific bits of metadata.
 *
 * See `BoundTarget` for documentation on the individual methods.
 */
export class R3BoundTarget {
    constructor(target, directives, eagerDirectives, bindings, references, exprTargets, symbols, nestingLevel, scopedNodeEntities, usedPipes, eagerPipes, rawDeferred) {
        this.target = target;
        this.directives = directives;
        this.eagerDirectives = eagerDirectives;
        this.bindings = bindings;
        this.references = references;
        this.exprTargets = exprTargets;
        this.symbols = symbols;
        this.nestingLevel = nestingLevel;
        this.scopedNodeEntities = scopedNodeEntities;
        this.usedPipes = usedPipes;
        this.eagerPipes = eagerPipes;
        this.deferredBlocks = rawDeferred.map((current) => current[0]);
        this.deferredScopes = new Map(rawDeferred);
    }
    getEntitiesInScope(node) {
        return this.scopedNodeEntities.get(node) ?? new Set();
    }
    getDirectivesOfNode(node) {
        return this.directives.get(node) || null;
    }
    getReferenceTarget(ref) {
        return this.references.get(ref) || null;
    }
    getConsumerOfBinding(binding) {
        return this.bindings.get(binding) || null;
    }
    getExpressionTarget(expr) {
        return this.exprTargets.get(expr) || null;
    }
    getDefinitionNodeOfSymbol(symbol) {
        return this.symbols.get(symbol) || null;
    }
    getNestingLevel(node) {
        return this.nestingLevel.get(node) || 0;
    }
    getUsedDirectives() {
        const set = new Set();
        this.directives.forEach((dirs) => dirs.forEach((dir) => set.add(dir)));
        return Array.from(set.values());
    }
    getEagerlyUsedDirectives() {
        const set = new Set(this.eagerDirectives);
        return Array.from(set.values());
    }
    getUsedPipes() {
        return Array.from(this.usedPipes);
    }
    getEagerlyUsedPipes() {
        return Array.from(this.eagerPipes);
    }
    getDeferBlocks() {
        return this.deferredBlocks;
    }
    getDeferredTriggerTarget(block, trigger) {
        // Only triggers that refer to DOM nodes can be resolved.
        if (!(trigger instanceof InteractionDeferredTrigger) &&
            !(trigger instanceof ViewportDeferredTrigger) &&
            !(trigger instanceof HoverDeferredTrigger)) {
            return null;
        }
        const name = trigger.reference;
        if (name === null) {
            let trigger = null;
            if (block.placeholder !== null) {
                for (const child of block.placeholder.children) {
                    // Skip over comment nodes. Currently by default the template parser doesn't capture
                    // comments, but we have a safeguard here just in case since it can be enabled.
                    if (child instanceof Comment) {
                        continue;
                    }
                    // We can only infer the trigger if there's one root element node. Any other
                    // nodes at the root make it so that we can't infer the trigger anymore.
                    if (trigger !== null) {
                        return null;
                    }
                    if (child instanceof Element) {
                        trigger = child;
                    }
                }
            }
            return trigger;
        }
        const outsideRef = this.findEntityInScope(block, name);
        // First try to resolve the target in the scope of the main deferred block. Note that we
        // skip triggers defined inside the main block itself, because they might not exist yet.
        if (outsideRef instanceof Reference && this.getDefinitionNodeOfSymbol(outsideRef) !== block) {
            const target = this.getReferenceTarget(outsideRef);
            if (target !== null) {
                return this.referenceTargetToElement(target);
            }
        }
        // If the trigger couldn't be found in the main block, check the
        // placeholder block which is shown before the main block has loaded.
        if (block.placeholder !== null) {
            const refInPlaceholder = this.findEntityInScope(block.placeholder, name);
            const targetInPlaceholder = refInPlaceholder instanceof Reference ? this.getReferenceTarget(refInPlaceholder) : null;
            if (targetInPlaceholder !== null) {
                return this.referenceTargetToElement(targetInPlaceholder);
            }
        }
        return null;
    }
    isDeferred(element) {
        for (const block of this.deferredBlocks) {
            if (!this.deferredScopes.has(block)) {
                continue;
            }
            const stack = [this.deferredScopes.get(block)];
            while (stack.length > 0) {
                const current = stack.pop();
                if (current.elementsInScope.has(element)) {
                    return true;
                }
                stack.push(...current.childScopes.values());
            }
        }
        return false;
    }
    /**
     * Finds an entity with a specific name in a scope.
     * @param rootNode Root node of the scope.
     * @param name Name of the entity.
     */
    findEntityInScope(rootNode, name) {
        const entities = this.getEntitiesInScope(rootNode);
        for (const entity of entities) {
            if (entity.name === name) {
                return entity;
            }
        }
        return null;
    }
    /** Coerces a `ReferenceTarget` to an `Element`, if possible. */
    referenceTargetToElement(target) {
        if (target instanceof Element) {
            return target;
        }
        if (target instanceof Template) {
            return null;
        }
        return this.referenceTargetToElement(target.node);
    }
}
function extractScopedNodeEntities(rootScope) {
    const entityMap = new Map();
    function extractScopeEntities(scope) {
        if (entityMap.has(scope.rootNode)) {
            return entityMap.get(scope.rootNode);
        }
        const currentEntities = scope.namedEntities;
        let entities;
        if (scope.parentScope !== null) {
            entities = new Map([...extractScopeEntities(scope.parentScope), ...currentEntities]);
        }
        else {
            entities = new Map(currentEntities);
        }
        entityMap.set(scope.rootNode, entities);
        return entities;
    }
    const scopesToProcess = [rootScope];
    while (scopesToProcess.length > 0) {
        const scope = scopesToProcess.pop();
        for (const childScope of scope.childScopes.values()) {
            scopesToProcess.push(childScope);
        }
        extractScopeEntities(scope);
    }
    const templateEntities = new Map();
    for (const [template, entities] of entityMap) {
        templateEntities.set(template, new Set(entities.values()));
    }
    return templateEntities;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidDJfYmluZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3JlbmRlcjMvdmlldy90Ml9iaW5kZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLEdBQUcsRUFFSCxnQkFBZ0IsRUFHaEIsbUJBQW1CLEVBRW5CLFlBQVksR0FDYixNQUFNLDZCQUE2QixDQUFDO0FBQ3JDLE9BQU8sRUFBQyxXQUFXLEVBQUUsZUFBZSxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDNUQsT0FBTyxFQUlMLE9BQU8sRUFDUCxPQUFPLEVBQ1AsYUFBYSxFQUNiLGtCQUFrQixFQUNsQixvQkFBb0IsRUFDcEIsd0JBQXdCLEVBRXhCLE9BQU8sRUFDUCxZQUFZLEVBQ1osaUJBQWlCLEVBQ2pCLG9CQUFvQixFQUdwQixhQUFhLEVBQ2IsMEJBQTBCLEVBQzFCLGNBQWMsRUFFZCxTQUFTLEVBRVQsZUFBZSxFQUNmLFFBQVEsRUFLUix1QkFBdUIsR0FFeEIsTUFBTSxXQUFXLENBQUM7QUFXbkIsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLFlBQVksQ0FBQztBQUN6QyxPQUFPLEVBQUMseUJBQXlCLEVBQUMsTUFBTSxRQUFRLENBQUM7QUFFakQ7Ozs7R0FJRztBQUNILFNBQVMsSUFBSSxDQUFDLFFBQWtCLEVBQUUsY0FBd0I7SUFDeEQsTUFBTSxPQUFPLEdBQUcsSUFBSSxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDeEMsT0FBTyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUN2RCxDQUFDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7R0FhRztBQUNILE1BQU0sVUFBVSw4QkFBOEIsQ0FBQyxRQUFnQixFQUFFLGtCQUE0QjtJQUMzRixN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QixDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsRUFBRSxHQUFHLGVBQWUsQ0FBQyxDQUFDLENBQUM7UUFDdkYsQ0FBQzthQUFNLENBQUM7WUFDTixRQUFRLEdBQUcsSUFBSSxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDdEMsQ0FBQztRQUVELFNBQVMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUN4QyxPQUFPLFFBQVEsQ0FBQztJQUNsQixDQUFDO0lBRUQsTUFBTSxlQUFlLEdBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUM3QyxPQUFPLGVBQWUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDbEMsTUFBTSxLQUFLLEdBQUcsZUFBZSxDQUFDLEdBQUcsRUFBRyxDQUFDO1FBQ3JDLEtBQUssTUFBTSxVQUFVLElBQUksS0FBSyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDO1lBQ3BELGVBQWUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDbkMsQ0FBQztRQUNELG9CQUFvQixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzlCLENBQUM7SUFFRCxNQUFNLGdCQUFnQixHQUFHLElBQUksR0FBRyxFQUEwQyxDQUFDO0lBQzNFLEtBQUssTUFBTSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsSUFBSSxTQUFTLEVBQUUsQ0FBQztRQUM3QyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDN0QsQ0FBQztJQUNELE9BQU8sZ0JBQWdCLENBQUM7QUFDMUIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgQVNULFxuICBCaW5kaW5nUGlwZSxcbiAgSW1wbGljaXRSZWNlaXZlcixcbiAgUHJvcGVydHlSZWFkLFxuICBQcm9wZXJ0eVdyaXRlLFxuICBSZWN1cnNpdmVBc3RWaXNpdG9yLFxuICBTYWZlUHJvcGVydHlSZWFkLFxuICBUaGlzUmVjZWl2ZXIsXG59IGZyb20gJy4uLy4uL2V4cHJlc3Npb25fcGFyc2VyL2FzdCc7XG5pbXBvcnQge0Nzc1NlbGVjdG9yLCBTZWxlY3Rvck1hdGNoZXJ9IGZyb20gJy4uLy4uL3NlbGVjdG9yJztcbmltcG9ydCB7XG4gIEJvdW5kQXR0cmlidXRlLFxuICBCb3VuZEV2ZW50LFxuICBCb3VuZFRleHQsXG4gIENvbW1lbnQsXG4gIENvbnRlbnQsXG4gIERlZmVycmVkQmxvY2ssXG4gIERlZmVycmVkQmxvY2tFcnJvcixcbiAgRGVmZXJyZWRCbG9ja0xvYWRpbmcsXG4gIERlZmVycmVkQmxvY2tQbGFjZWhvbGRlcixcbiAgRGVmZXJyZWRUcmlnZ2VyLFxuICBFbGVtZW50LFxuICBGb3JMb29wQmxvY2ssXG4gIEZvckxvb3BCbG9ja0VtcHR5LFxuICBIb3ZlckRlZmVycmVkVHJpZ2dlcixcbiAgSWN1LFxuICBJZkJsb2NrLFxuICBJZkJsb2NrQnJhbmNoLFxuICBJbnRlcmFjdGlvbkRlZmVycmVkVHJpZ2dlcixcbiAgTGV0RGVjbGFyYXRpb24sXG4gIE5vZGUsXG4gIFJlZmVyZW5jZSxcbiAgU3dpdGNoQmxvY2ssXG4gIFN3aXRjaEJsb2NrQ2FzZSxcbiAgVGVtcGxhdGUsXG4gIFRleHQsXG4gIFRleHRBdHRyaWJ1dGUsXG4gIFVua25vd25CbG9jayxcbiAgVmFyaWFibGUsXG4gIFZpZXdwb3J0RGVmZXJyZWRUcmlnZ2VyLFxuICBWaXNpdG9yLFxufSBmcm9tICcuLi9yM19hc3QnO1xuXG5pbXBvcnQge1xuICBCb3VuZFRhcmdldCxcbiAgRGlyZWN0aXZlTWV0YSxcbiAgUmVmZXJlbmNlVGFyZ2V0LFxuICBTY29wZWROb2RlLFxuICBUYXJnZXQsXG4gIFRhcmdldEJpbmRlcixcbiAgVGVtcGxhdGVFbnRpdHksXG59IGZyb20gJy4vdDJfYXBpJztcbmltcG9ydCB7cGFyc2VUZW1wbGF0ZX0gZnJvbSAnLi90ZW1wbGF0ZSc7XG5pbXBvcnQge2NyZWF0ZUNzc1NlbGVjdG9yRnJvbU5vZGV9IGZyb20gJy4vdXRpbCc7XG5cbi8qKlxuICogQ29tcHV0ZXMgYSBkaWZmZXJlbmNlIGJldHdlZW4gZnVsbCBsaXN0IChmaXJzdCBhcmd1bWVudCkgYW5kXG4gKiBsaXN0IG9mIGl0ZW1zIHRoYXQgc2hvdWxkIGJlIGV4Y2x1ZGVkIGZyb20gdGhlIGZ1bGwgbGlzdCAoc2Vjb25kXG4gKiBhcmd1bWVudCkuXG4gKi9cbmZ1bmN0aW9uIGRpZmYoZnVsbExpc3Q6IHN0cmluZ1tdLCBpdGVtc1RvRXhjbHVkZTogc3RyaW5nW10pOiBzdHJpbmdbXSB7XG4gIGNvbnN0IGV4Y2x1ZGUgPSBuZXcgU2V0KGl0ZW1zVG9FeGNsdWRlKTtcbiAgcmV0dXJuIGZ1bGxMaXN0LmZpbHRlcigoaXRlbSkgPT4gIWV4Y2x1ZGUuaGFzKGl0ZW0pKTtcbn1cblxuLyoqXG4gKiBHaXZlbiBhIHRlbXBsYXRlIHN0cmluZyBhbmQgYSBzZXQgb2YgYXZhaWxhYmxlIGRpcmVjdGl2ZSBzZWxlY3RvcnMsXG4gKiBjb21wdXRlcyBhIGxpc3Qgb2YgbWF0Y2hpbmcgc2VsZWN0b3JzIGFuZCBzcGxpdHMgdGhlbSBpbnRvIDIgYnVja2V0czpcbiAqICgxKSBlYWdlcmx5IHVzZWQgaW4gYSB0ZW1wbGF0ZSBhbmQgKDIpIGRpcmVjdGl2ZXMgdXNlZCBvbmx5IGluIGRlZmVyXG4gKiBibG9ja3MuIFNpbWlsYXJseSwgcmV0dXJucyAyIGxpc3RzIG9mIHBpcGVzIChlYWdlciBhbmQgZGVmZXJyYWJsZSkuXG4gKlxuICogTm90ZTogZGVmZXJyYWJsZSBkaXJlY3RpdmVzIHNlbGVjdG9ycyBhbmQgcGlwZXMgbmFtZXMgdXNlZCBpbiBgQGRlZmVyYFxuICogYmxvY2tzIGFyZSAqKmNhbmRpZGF0ZXMqKiBhbmQgQVBJIGNhbGxlciBzaG91bGQgbWFrZSBzdXJlIHRoYXQ6XG4gKlxuICogICogQSBDb21wb25lbnQgd2hlcmUgYSBnaXZlbiB0ZW1wbGF0ZSBpcyBkZWZpbmVkIGlzIHN0YW5kYWxvbmVcbiAqICAqIFVuZGVybHlpbmcgZGVwZW5kZW5jeSBjbGFzc2VzIGFyZSBhbHNvIHN0YW5kYWxvbmVcbiAqICAqIERlcGVuZGVuY3kgY2xhc3Mgc3ltYm9scyBhcmUgbm90IGVhZ2VybHkgdXNlZCBpbiBhIFRTIGZpbGVcbiAqICAgIHdoZXJlIGEgaG9zdCBjb21wb25lbnQgKHRoYXQgb3ducyB0aGUgdGVtcGxhdGUpIGlzIGxvY2F0ZWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZpbmRNYXRjaGluZ0RpcmVjdGl2ZXNBbmRQaXBlcyh0ZW1wbGF0ZTogc3RyaW5nLCBkaXJlY3RpdmVTZWxlY3RvcnM6IHN0cmluZ1tdKSB7XG4gIGNvbnN0IG1hdGNoZXIgPSBuZXcgU2VsZWN0b3JNYXRjaGVyPHVua25vd25bXT4oKTtcbiAgZm9yIChjb25zdCBzZWxlY3RvciBvZiBkaXJlY3RpdmVTZWxlY3RvcnMpIHtcbiAgICAvLyBDcmVhdGUgYSBmYWtlIGRpcmVjdGl2ZSBpbnN0YW5jZSB0byBhY2NvdW50IGZvciB0aGUgbG9naWMgaW5zaWRlXG4gICAgLy8gb2YgdGhlIGBSM1RhcmdldEJpbmRlcmAgY2xhc3MgKHdoaWNoIGludm9rZXMgdGhlIGBoYXNCaW5kaW5nUHJvcGVydHlOYW1lYFxuICAgIC8vIGZ1bmN0aW9uIGludGVybmFsbHkpLlxuICAgIGNvbnN0IGZha2VEaXJlY3RpdmUgPSB7XG4gICAgICBzZWxlY3RvcixcbiAgICAgIGV4cG9ydEFzOiBudWxsLFxuICAgICAgaW5wdXRzOiB7XG4gICAgICAgIGhhc0JpbmRpbmdQcm9wZXJ0eU5hbWUoKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIG91dHB1dHM6IHtcbiAgICAgICAgaGFzQmluZGluZ1Byb3BlcnR5TmFtZSgpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH07XG4gICAgbWF0Y2hlci5hZGRTZWxlY3RhYmxlcyhDc3NTZWxlY3Rvci5wYXJzZShzZWxlY3RvciksIFtmYWtlRGlyZWN0aXZlXSk7XG4gIH1cbiAgY29uc3QgcGFyc2VkVGVtcGxhdGUgPSBwYXJzZVRlbXBsYXRlKHRlbXBsYXRlLCAnJyAvKiB0ZW1wbGF0ZVVybCAqLyk7XG4gIGNvbnN0IGJpbmRlciA9IG5ldyBSM1RhcmdldEJpbmRlcihtYXRjaGVyIGFzIGFueSk7XG4gIGNvbnN0IGJvdW5kID0gYmluZGVyLmJpbmQoe3RlbXBsYXRlOiBwYXJzZWRUZW1wbGF0ZS5ub2Rlc30pO1xuXG4gIGNvbnN0IGVhZ2VyRGlyZWN0aXZlU2VsZWN0b3JzID0gYm91bmQuZ2V0RWFnZXJseVVzZWREaXJlY3RpdmVzKCkubWFwKChkaXIpID0+IGRpci5zZWxlY3RvciEpO1xuICBjb25zdCBhbGxNYXRjaGVkRGlyZWN0aXZlU2VsZWN0b3JzID0gYm91bmQuZ2V0VXNlZERpcmVjdGl2ZXMoKS5tYXAoKGRpcikgPT4gZGlyLnNlbGVjdG9yISk7XG4gIGNvbnN0IGVhZ2VyUGlwZXMgPSBib3VuZC5nZXRFYWdlcmx5VXNlZFBpcGVzKCk7XG4gIHJldHVybiB7XG4gICAgZGlyZWN0aXZlczoge1xuICAgICAgcmVndWxhcjogZWFnZXJEaXJlY3RpdmVTZWxlY3RvcnMsXG4gICAgICBkZWZlckNhbmRpZGF0ZXM6IGRpZmYoYWxsTWF0Y2hlZERpcmVjdGl2ZVNlbGVjdG9ycywgZWFnZXJEaXJlY3RpdmVTZWxlY3RvcnMpLFxuICAgIH0sXG4gICAgcGlwZXM6IHtcbiAgICAgIHJlZ3VsYXI6IGVhZ2VyUGlwZXMsXG4gICAgICBkZWZlckNhbmRpZGF0ZXM6IGRpZmYoYm91bmQuZ2V0VXNlZFBpcGVzKCksIGVhZ2VyUGlwZXMpLFxuICAgIH0sXG4gIH07XG59XG5cbi8qKlxuICogUHJvY2Vzc2VzIGBUYXJnZXRgcyB3aXRoIGEgZ2l2ZW4gc2V0IG9mIGRpcmVjdGl2ZXMgYW5kIHBlcmZvcm1zIGEgYmluZGluZyBvcGVyYXRpb24sIHdoaWNoXG4gKiByZXR1cm5zIGFuIG9iamVjdCBzaW1pbGFyIHRvIFR5cGVTY3JpcHQncyBgdHMuVHlwZUNoZWNrZXJgIHRoYXQgY29udGFpbnMga25vd2xlZGdlIGFib3V0IHRoZVxuICogdGFyZ2V0LlxuICovXG5leHBvcnQgY2xhc3MgUjNUYXJnZXRCaW5kZXI8RGlyZWN0aXZlVCBleHRlbmRzIERpcmVjdGl2ZU1ldGE+IGltcGxlbWVudHMgVGFyZ2V0QmluZGVyPERpcmVjdGl2ZVQ+IHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBkaXJlY3RpdmVNYXRjaGVyOiBTZWxlY3Rvck1hdGNoZXI8RGlyZWN0aXZlVFtdPikge31cblxuICAvKipcbiAgICogUGVyZm9ybSBhIGJpbmRpbmcgb3BlcmF0aW9uIG9uIHRoZSBnaXZlbiBgVGFyZ2V0YCBhbmQgcmV0dXJuIGEgYEJvdW5kVGFyZ2V0YCB3aGljaCBjb250YWluc1xuICAgKiBtZXRhZGF0YSBhYm91dCB0aGUgdHlwZXMgcmVmZXJlbmNlZCBpbiB0aGUgdGVtcGxhdGUuXG4gICAqL1xuICBiaW5kKHRhcmdldDogVGFyZ2V0KTogQm91bmRUYXJnZXQ8RGlyZWN0aXZlVD4ge1xuICAgIGlmICghdGFyZ2V0LnRlbXBsYXRlKSB7XG4gICAgICAvLyBUT0RPKGFseGh1Yik6IGhhbmRsZSB0YXJnZXRzIHdoaWNoIGNvbnRhaW4gdGhpbmdzIGxpa2UgSG9zdEJpbmRpbmdzLCBldGMuXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0JpbmRpbmcgd2l0aG91dCBhIHRlbXBsYXRlIG5vdCB5ZXQgc3VwcG9ydGVkJyk7XG4gICAgfVxuXG4gICAgLy8gRmlyc3QsIHBhcnNlIHRoZSB0ZW1wbGF0ZSBpbnRvIGEgYFNjb3BlYCBzdHJ1Y3R1cmUuIFRoaXMgb3BlcmF0aW9uIGNhcHR1cmVzIHRoZSBzeW50YWN0aWNcbiAgICAvLyBzY29wZXMgaW4gdGhlIHRlbXBsYXRlIGFuZCBtYWtlcyB0aGVtIGF2YWlsYWJsZSBmb3IgbGF0ZXIgdXNlLlxuICAgIGNvbnN0IHNjb3BlID0gU2NvcGUuYXBwbHkodGFyZ2V0LnRlbXBsYXRlKTtcblxuICAgIC8vIFVzZSB0aGUgYFNjb3BlYCB0byBleHRyYWN0IHRoZSBlbnRpdGllcyBwcmVzZW50IGF0IGV2ZXJ5IGxldmVsIG9mIHRoZSB0ZW1wbGF0ZS5cbiAgICBjb25zdCBzY29wZWROb2RlRW50aXRpZXMgPSBleHRyYWN0U2NvcGVkTm9kZUVudGl0aWVzKHNjb3BlKTtcblxuICAgIC8vIE5leHQsIHBlcmZvcm0gZGlyZWN0aXZlIG1hdGNoaW5nIG9uIHRoZSB0ZW1wbGF0ZSB1c2luZyB0aGUgYERpcmVjdGl2ZUJpbmRlcmAuIFRoaXMgcmV0dXJuczpcbiAgICAvLyAgIC0gZGlyZWN0aXZlczogTWFwIG9mIG5vZGVzIChlbGVtZW50cyAmIG5nLXRlbXBsYXRlcykgdG8gdGhlIGRpcmVjdGl2ZXMgb24gdGhlbS5cbiAgICAvLyAgIC0gYmluZGluZ3M6IE1hcCBvZiBpbnB1dHMsIG91dHB1dHMsIGFuZCBhdHRyaWJ1dGVzIHRvIHRoZSBkaXJlY3RpdmUvZWxlbWVudCB0aGF0IGNsYWltc1xuICAgIC8vICAgICB0aGVtLiBUT0RPKGFseGh1Yik6IGhhbmRsZSBtdWx0aXBsZSBkaXJlY3RpdmVzIGNsYWltaW5nIGFuIGlucHV0L291dHB1dC9ldGMuXG4gICAgLy8gICAtIHJlZmVyZW5jZXM6IE1hcCBvZiAjcmVmZXJlbmNlcyB0byB0aGVpciB0YXJnZXRzLlxuICAgIGNvbnN0IHtkaXJlY3RpdmVzLCBlYWdlckRpcmVjdGl2ZXMsIGJpbmRpbmdzLCByZWZlcmVuY2VzfSA9IERpcmVjdGl2ZUJpbmRlci5hcHBseShcbiAgICAgIHRhcmdldC50ZW1wbGF0ZSxcbiAgICAgIHRoaXMuZGlyZWN0aXZlTWF0Y2hlcixcbiAgICApO1xuICAgIC8vIEZpbmFsbHksIHJ1biB0aGUgVGVtcGxhdGVCaW5kZXIgdG8gYmluZCByZWZlcmVuY2VzLCB2YXJpYWJsZXMsIGFuZCBvdGhlciBlbnRpdGllcyB3aXRoaW4gdGhlXG4gICAgLy8gdGVtcGxhdGUuIFRoaXMgZXh0cmFjdHMgYWxsIHRoZSBtZXRhZGF0YSB0aGF0IGRvZXNuJ3QgZGVwZW5kIG9uIGRpcmVjdGl2ZSBtYXRjaGluZy5cbiAgICBjb25zdCB7ZXhwcmVzc2lvbnMsIHN5bWJvbHMsIG5lc3RpbmdMZXZlbCwgdXNlZFBpcGVzLCBlYWdlclBpcGVzLCBkZWZlckJsb2Nrc30gPVxuICAgICAgVGVtcGxhdGVCaW5kZXIuYXBwbHlXaXRoU2NvcGUodGFyZ2V0LnRlbXBsYXRlLCBzY29wZSk7XG4gICAgcmV0dXJuIG5ldyBSM0JvdW5kVGFyZ2V0KFxuICAgICAgdGFyZ2V0LFxuICAgICAgZGlyZWN0aXZlcyxcbiAgICAgIGVhZ2VyRGlyZWN0aXZlcyxcbiAgICAgIGJpbmRpbmdzLFxuICAgICAgcmVmZXJlbmNlcyxcbiAgICAgIGV4cHJlc3Npb25zLFxuICAgICAgc3ltYm9scyxcbiAgICAgIG5lc3RpbmdMZXZlbCxcbiAgICAgIHNjb3BlZE5vZGVFbnRpdGllcyxcbiAgICAgIHVzZWRQaXBlcyxcbiAgICAgIGVhZ2VyUGlwZXMsXG4gICAgICBkZWZlckJsb2NrcyxcbiAgICApO1xuICB9XG59XG5cbi8qKlxuICogUmVwcmVzZW50cyBhIGJpbmRpbmcgc2NvcGUgd2l0aGluIGEgdGVtcGxhdGUuXG4gKlxuICogQW55IHZhcmlhYmxlcywgcmVmZXJlbmNlcywgb3Igb3RoZXIgbmFtZWQgZW50aXRpZXMgZGVjbGFyZWQgd2l0aGluIHRoZSB0ZW1wbGF0ZSB3aWxsXG4gKiBiZSBjYXB0dXJlZCBhbmQgYXZhaWxhYmxlIGJ5IG5hbWUgaW4gYG5hbWVkRW50aXRpZXNgLiBBZGRpdGlvbmFsbHksIGNoaWxkIHRlbXBsYXRlcyB3aWxsXG4gKiBiZSBhbmFseXplZCBhbmQgaGF2ZSB0aGVpciBjaGlsZCBgU2NvcGVgcyBhdmFpbGFibGUgaW4gYGNoaWxkU2NvcGVzYC5cbiAqL1xuY2xhc3MgU2NvcGUgaW1wbGVtZW50cyBWaXNpdG9yIHtcbiAgLyoqXG4gICAqIE5hbWVkIG1lbWJlcnMgb2YgdGhlIGBTY29wZWAsIHN1Y2ggYXMgYFJlZmVyZW5jZWBzIG9yIGBWYXJpYWJsZWBzLlxuICAgKi9cbiAgcmVhZG9ubHkgbmFtZWRFbnRpdGllcyA9IG5ldyBNYXA8c3RyaW5nLCBUZW1wbGF0ZUVudGl0eT4oKTtcblxuICAvKipcbiAgICogU2V0IG9mIGVsZW1lbnRzIHRoYXQgYmVsb25nIHRvIHRoaXMgc2NvcGUuXG4gICAqL1xuICByZWFkb25seSBlbGVtZW50c0luU2NvcGUgPSBuZXcgU2V0PEVsZW1lbnQ+KCk7XG5cbiAgLyoqXG4gICAqIENoaWxkIGBTY29wZWBzIGZvciBpbW1lZGlhdGVseSBuZXN0ZWQgYFNjb3BlZE5vZGVgcy5cbiAgICovXG4gIHJlYWRvbmx5IGNoaWxkU2NvcGVzID0gbmV3IE1hcDxTY29wZWROb2RlLCBTY29wZT4oKTtcblxuICAvKiogV2hldGhlciB0aGlzIHNjb3BlIGlzIGRlZmVycmVkIG9yIGlmIGFueSBvZiBpdHMgYW5jZXN0b3JzIGFyZSBkZWZlcnJlZC4gKi9cbiAgcmVhZG9ubHkgaXNEZWZlcnJlZDogYm9vbGVhbjtcblxuICBwcml2YXRlIGNvbnN0cnVjdG9yKFxuICAgIHJlYWRvbmx5IHBhcmVudFNjb3BlOiBTY29wZSB8IG51bGwsXG4gICAgcmVhZG9ubHkgcm9vdE5vZGU6IFNjb3BlZE5vZGUgfCBudWxsLFxuICApIHtcbiAgICB0aGlzLmlzRGVmZXJyZWQgPVxuICAgICAgcGFyZW50U2NvcGUgIT09IG51bGwgJiYgcGFyZW50U2NvcGUuaXNEZWZlcnJlZCA/IHRydWUgOiByb290Tm9kZSBpbnN0YW5jZW9mIERlZmVycmVkQmxvY2s7XG4gIH1cblxuICBzdGF0aWMgbmV3Um9vdFNjb3BlKCk6IFNjb3BlIHtcbiAgICByZXR1cm4gbmV3IFNjb3BlKG51bGwsIG51bGwpO1xuICB9XG5cbiAgLyoqXG4gICAqIFByb2Nlc3MgYSB0ZW1wbGF0ZSAoZWl0aGVyIGFzIGEgYFRlbXBsYXRlYCBzdWItdGVtcGxhdGUgd2l0aCB2YXJpYWJsZXMsIG9yIGEgcGxhaW4gYXJyYXkgb2ZcbiAgICogdGVtcGxhdGUgYE5vZGVgcykgYW5kIGNvbnN0cnVjdCBpdHMgYFNjb3BlYC5cbiAgICovXG4gIHN0YXRpYyBhcHBseSh0ZW1wbGF0ZTogTm9kZVtdKTogU2NvcGUge1xuICAgIGNvbnN0IHNjb3BlID0gU2NvcGUubmV3Um9vdFNjb3BlKCk7XG4gICAgc2NvcGUuaW5nZXN0KHRlbXBsYXRlKTtcbiAgICByZXR1cm4gc2NvcGU7XG4gIH1cblxuICAvKipcbiAgICogSW50ZXJuYWwgbWV0aG9kIHRvIHByb2Nlc3MgdGhlIHNjb3BlZCBub2RlIGFuZCBwb3B1bGF0ZSB0aGUgYFNjb3BlYC5cbiAgICovXG4gIHByaXZhdGUgaW5nZXN0KG5vZGVPck5vZGVzOiBTY29wZWROb2RlIHwgTm9kZVtdKTogdm9pZCB7XG4gICAgaWYgKG5vZGVPck5vZGVzIGluc3RhbmNlb2YgVGVtcGxhdGUpIHtcbiAgICAgIC8vIFZhcmlhYmxlcyBvbiBhbiA8bmctdGVtcGxhdGU+IGFyZSBkZWZpbmVkIGluIHRoZSBpbm5lciBzY29wZS5cbiAgICAgIG5vZGVPck5vZGVzLnZhcmlhYmxlcy5mb3JFYWNoKChub2RlKSA9PiB0aGlzLnZpc2l0VmFyaWFibGUobm9kZSkpO1xuXG4gICAgICAvLyBQcm9jZXNzIHRoZSBub2RlcyBvZiB0aGUgdGVtcGxhdGUuXG4gICAgICBub2RlT3JOb2Rlcy5jaGlsZHJlbi5mb3JFYWNoKChub2RlKSA9PiBub2RlLnZpc2l0KHRoaXMpKTtcbiAgICB9IGVsc2UgaWYgKG5vZGVPck5vZGVzIGluc3RhbmNlb2YgSWZCbG9ja0JyYW5jaCkge1xuICAgICAgaWYgKG5vZGVPck5vZGVzLmV4cHJlc3Npb25BbGlhcyAhPT0gbnVsbCkge1xuICAgICAgICB0aGlzLnZpc2l0VmFyaWFibGUobm9kZU9yTm9kZXMuZXhwcmVzc2lvbkFsaWFzKTtcbiAgICAgIH1cbiAgICAgIG5vZGVPck5vZGVzLmNoaWxkcmVuLmZvckVhY2goKG5vZGUpID0+IG5vZGUudmlzaXQodGhpcykpO1xuICAgIH0gZWxzZSBpZiAobm9kZU9yTm9kZXMgaW5zdGFuY2VvZiBGb3JMb29wQmxvY2spIHtcbiAgICAgIHRoaXMudmlzaXRWYXJpYWJsZShub2RlT3JOb2Rlcy5pdGVtKTtcbiAgICAgIG5vZGVPck5vZGVzLmNvbnRleHRWYXJpYWJsZXMuZm9yRWFjaCgodikgPT4gdGhpcy52aXNpdFZhcmlhYmxlKHYpKTtcbiAgICAgIG5vZGVPck5vZGVzLmNoaWxkcmVuLmZvckVhY2goKG5vZGUpID0+IG5vZGUudmlzaXQodGhpcykpO1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICBub2RlT3JOb2RlcyBpbnN0YW5jZW9mIFN3aXRjaEJsb2NrQ2FzZSB8fFxuICAgICAgbm9kZU9yTm9kZXMgaW5zdGFuY2VvZiBGb3JMb29wQmxvY2tFbXB0eSB8fFxuICAgICAgbm9kZU9yTm9kZXMgaW5zdGFuY2VvZiBEZWZlcnJlZEJsb2NrIHx8XG4gICAgICBub2RlT3JOb2RlcyBpbnN0YW5jZW9mIERlZmVycmVkQmxvY2tFcnJvciB8fFxuICAgICAgbm9kZU9yTm9kZXMgaW5zdGFuY2VvZiBEZWZlcnJlZEJsb2NrUGxhY2Vob2xkZXIgfHxcbiAgICAgIG5vZGVPck5vZGVzIGluc3RhbmNlb2YgRGVmZXJyZWRCbG9ja0xvYWRpbmcgfHxcbiAgICAgIG5vZGVPck5vZGVzIGluc3RhbmNlb2YgQ29udGVudFxuICAgICkge1xuICAgICAgbm9kZU9yTm9kZXMuY2hpbGRyZW4uZm9yRWFjaCgobm9kZSkgPT4gbm9kZS52aXNpdCh0aGlzKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIE5vIG92ZXJhcmNoaW5nIGBUZW1wbGF0ZWAgaW5zdGFuY2UsIHNvIHByb2Nlc3MgdGhlIG5vZGVzIGRpcmVjdGx5LlxuICAgICAgbm9kZU9yTm9kZXMuZm9yRWFjaCgobm9kZSkgPT4gbm9kZS52aXNpdCh0aGlzKSk7XG4gICAgfVxuICB9XG5cbiAgdmlzaXRFbGVtZW50KGVsZW1lbnQ6IEVsZW1lbnQpIHtcbiAgICAvLyBgRWxlbWVudGBzIGluIHRoZSB0ZW1wbGF0ZSBtYXkgaGF2ZSBgUmVmZXJlbmNlYHMgd2hpY2ggYXJlIGNhcHR1cmVkIGluIHRoZSBzY29wZS5cbiAgICBlbGVtZW50LnJlZmVyZW5jZXMuZm9yRWFjaCgobm9kZSkgPT4gdGhpcy52aXNpdFJlZmVyZW5jZShub2RlKSk7XG5cbiAgICAvLyBSZWN1cnNlIGludG8gdGhlIGBFbGVtZW50YCdzIGNoaWxkcmVuLlxuICAgIGVsZW1lbnQuY2hpbGRyZW4uZm9yRWFjaCgobm9kZSkgPT4gbm9kZS52aXNpdCh0aGlzKSk7XG5cbiAgICB0aGlzLmVsZW1lbnRzSW5TY29wZS5hZGQoZWxlbWVudCk7XG4gIH1cblxuICB2aXNpdFRlbXBsYXRlKHRlbXBsYXRlOiBUZW1wbGF0ZSkge1xuICAgIC8vIFJlZmVyZW5jZXMgb24gYSA8bmctdGVtcGxhdGU+IGFyZSBkZWZpbmVkIGluIHRoZSBvdXRlciBzY29wZSwgc28gY2FwdHVyZSB0aGVtIGJlZm9yZVxuICAgIC8vIHByb2Nlc3NpbmcgdGhlIHRlbXBsYXRlJ3MgY2hpbGQgc2NvcGUuXG4gICAgdGVtcGxhdGUucmVmZXJlbmNlcy5mb3JFYWNoKChub2RlKSA9PiB0aGlzLnZpc2l0UmVmZXJlbmNlKG5vZGUpKTtcblxuICAgIC8vIE5leHQsIGNyZWF0ZSBhbiBpbm5lciBzY29wZSBhbmQgcHJvY2VzcyB0aGUgdGVtcGxhdGUgd2l0aGluIGl0LlxuICAgIHRoaXMuaW5nZXN0U2NvcGVkTm9kZSh0ZW1wbGF0ZSk7XG4gIH1cblxuICB2aXNpdFZhcmlhYmxlKHZhcmlhYmxlOiBWYXJpYWJsZSkge1xuICAgIC8vIERlY2xhcmUgdGhlIHZhcmlhYmxlIGlmIGl0J3Mgbm90IGFscmVhZHkuXG4gICAgdGhpcy5tYXliZURlY2xhcmUodmFyaWFibGUpO1xuICB9XG5cbiAgdmlzaXRSZWZlcmVuY2UocmVmZXJlbmNlOiBSZWZlcmVuY2UpIHtcbiAgICAvLyBEZWNsYXJlIHRoZSB2YXJpYWJsZSBpZiBpdCdzIG5vdCBhbHJlYWR5LlxuICAgIHRoaXMubWF5YmVEZWNsYXJlKHJlZmVyZW5jZSk7XG4gIH1cblxuICB2aXNpdERlZmVycmVkQmxvY2soZGVmZXJyZWQ6IERlZmVycmVkQmxvY2spIHtcbiAgICB0aGlzLmluZ2VzdFNjb3BlZE5vZGUoZGVmZXJyZWQpO1xuICAgIGRlZmVycmVkLnBsYWNlaG9sZGVyPy52aXNpdCh0aGlzKTtcbiAgICBkZWZlcnJlZC5sb2FkaW5nPy52aXNpdCh0aGlzKTtcbiAgICBkZWZlcnJlZC5lcnJvcj8udmlzaXQodGhpcyk7XG4gIH1cblxuICB2aXNpdERlZmVycmVkQmxvY2tQbGFjZWhvbGRlcihibG9jazogRGVmZXJyZWRCbG9ja1BsYWNlaG9sZGVyKSB7XG4gICAgdGhpcy5pbmdlc3RTY29wZWROb2RlKGJsb2NrKTtcbiAgfVxuXG4gIHZpc2l0RGVmZXJyZWRCbG9ja0Vycm9yKGJsb2NrOiBEZWZlcnJlZEJsb2NrRXJyb3IpIHtcbiAgICB0aGlzLmluZ2VzdFNjb3BlZE5vZGUoYmxvY2spO1xuICB9XG5cbiAgdmlzaXREZWZlcnJlZEJsb2NrTG9hZGluZyhibG9jazogRGVmZXJyZWRCbG9ja0xvYWRpbmcpIHtcbiAgICB0aGlzLmluZ2VzdFNjb3BlZE5vZGUoYmxvY2spO1xuICB9XG5cbiAgdmlzaXRTd2l0Y2hCbG9jayhibG9jazogU3dpdGNoQmxvY2spIHtcbiAgICBibG9jay5jYXNlcy5mb3JFYWNoKChub2RlKSA9PiBub2RlLnZpc2l0KHRoaXMpKTtcbiAgfVxuXG4gIHZpc2l0U3dpdGNoQmxvY2tDYXNlKGJsb2NrOiBTd2l0Y2hCbG9ja0Nhc2UpIHtcbiAgICB0aGlzLmluZ2VzdFNjb3BlZE5vZGUoYmxvY2spO1xuICB9XG5cbiAgdmlzaXRGb3JMb29wQmxvY2soYmxvY2s6IEZvckxvb3BCbG9jaykge1xuICAgIHRoaXMuaW5nZXN0U2NvcGVkTm9kZShibG9jayk7XG4gICAgYmxvY2suZW1wdHk/LnZpc2l0KHRoaXMpO1xuICB9XG5cbiAgdmlzaXRGb3JMb29wQmxvY2tFbXB0eShibG9jazogRm9yTG9vcEJsb2NrRW1wdHkpIHtcbiAgICB0aGlzLmluZ2VzdFNjb3BlZE5vZGUoYmxvY2spO1xuICB9XG5cbiAgdmlzaXRJZkJsb2NrKGJsb2NrOiBJZkJsb2NrKSB7XG4gICAgYmxvY2suYnJhbmNoZXMuZm9yRWFjaCgobm9kZSkgPT4gbm9kZS52aXNpdCh0aGlzKSk7XG4gIH1cblxuICB2aXNpdElmQmxvY2tCcmFuY2goYmxvY2s6IElmQmxvY2tCcmFuY2gpIHtcbiAgICB0aGlzLmluZ2VzdFNjb3BlZE5vZGUoYmxvY2spO1xuICB9XG5cbiAgdmlzaXRDb250ZW50KGNvbnRlbnQ6IENvbnRlbnQpIHtcbiAgICB0aGlzLmluZ2VzdFNjb3BlZE5vZGUoY29udGVudCk7XG4gIH1cblxuICB2aXNpdExldERlY2xhcmF0aW9uKGRlY2w6IExldERlY2xhcmF0aW9uKSB7XG4gICAgdGhpcy5tYXliZURlY2xhcmUoZGVjbCk7XG4gIH1cblxuICAvLyBVbnVzZWQgdmlzaXRvcnMuXG4gIHZpc2l0Qm91bmRBdHRyaWJ1dGUoYXR0cjogQm91bmRBdHRyaWJ1dGUpIHt9XG4gIHZpc2l0Qm91bmRFdmVudChldmVudDogQm91bmRFdmVudCkge31cbiAgdmlzaXRCb3VuZFRleHQodGV4dDogQm91bmRUZXh0KSB7fVxuICB2aXNpdFRleHQodGV4dDogVGV4dCkge31cbiAgdmlzaXRUZXh0QXR0cmlidXRlKGF0dHI6IFRleHRBdHRyaWJ1dGUpIHt9XG4gIHZpc2l0SWN1KGljdTogSWN1KSB7fVxuICB2aXNpdERlZmVycmVkVHJpZ2dlcih0cmlnZ2VyOiBEZWZlcnJlZFRyaWdnZXIpIHt9XG4gIHZpc2l0VW5rbm93bkJsb2NrKGJsb2NrOiBVbmtub3duQmxvY2spIHt9XG5cbiAgcHJpdmF0ZSBtYXliZURlY2xhcmUodGhpbmc6IFRlbXBsYXRlRW50aXR5KSB7XG4gICAgLy8gRGVjbGFyZSBzb21ldGhpbmcgd2l0aCBhIG5hbWUsIGFzIGxvbmcgYXMgdGhhdCBuYW1lIGlzbid0IHRha2VuLlxuICAgIGlmICghdGhpcy5uYW1lZEVudGl0aWVzLmhhcyh0aGluZy5uYW1lKSkge1xuICAgICAgdGhpcy5uYW1lZEVudGl0aWVzLnNldCh0aGluZy5uYW1lLCB0aGluZyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIExvb2sgdXAgYSB2YXJpYWJsZSB3aXRoaW4gdGhpcyBgU2NvcGVgLlxuICAgKlxuICAgKiBUaGlzIGNhbiByZWN1cnNlIGludG8gYSBwYXJlbnQgYFNjb3BlYCBpZiBpdCdzIGF2YWlsYWJsZS5cbiAgICovXG4gIGxvb2t1cChuYW1lOiBzdHJpbmcpOiBUZW1wbGF0ZUVudGl0eSB8IG51bGwge1xuICAgIGlmICh0aGlzLm5hbWVkRW50aXRpZXMuaGFzKG5hbWUpKSB7XG4gICAgICAvLyBGb3VuZCBpbiB0aGUgbG9jYWwgc2NvcGUuXG4gICAgICByZXR1cm4gdGhpcy5uYW1lZEVudGl0aWVzLmdldChuYW1lKSE7XG4gICAgfSBlbHNlIGlmICh0aGlzLnBhcmVudFNjb3BlICE9PSBudWxsKSB7XG4gICAgICAvLyBOb3QgaW4gdGhlIGxvY2FsIHNjb3BlLCBidXQgdGhlcmUncyBhIHBhcmVudCBzY29wZSBzbyBjaGVjayB0aGVyZS5cbiAgICAgIHJldHVybiB0aGlzLnBhcmVudFNjb3BlLmxvb2t1cChuYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gQXQgdGhlIHRvcCBsZXZlbCBhbmQgaXQgd2Fzbid0IGZvdW5kLlxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgY2hpbGQgc2NvcGUgZm9yIGEgYFNjb3BlZE5vZGVgLlxuICAgKlxuICAgKiBUaGlzIHNob3VsZCBhbHdheXMgYmUgZGVmaW5lZC5cbiAgICovXG4gIGdldENoaWxkU2NvcGUobm9kZTogU2NvcGVkTm9kZSk6IFNjb3BlIHtcbiAgICBjb25zdCByZXMgPSB0aGlzLmNoaWxkU2NvcGVzLmdldChub2RlKTtcbiAgICBpZiAocmVzID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQXNzZXJ0aW9uIGVycm9yOiBjaGlsZCBzY29wZSBmb3IgJHtub2RlfSBub3QgZm91bmRgKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuXG4gIHByaXZhdGUgaW5nZXN0U2NvcGVkTm9kZShub2RlOiBTY29wZWROb2RlKSB7XG4gICAgY29uc3Qgc2NvcGUgPSBuZXcgU2NvcGUodGhpcywgbm9kZSk7XG4gICAgc2NvcGUuaW5nZXN0KG5vZGUpO1xuICAgIHRoaXMuY2hpbGRTY29wZXMuc2V0KG5vZGUsIHNjb3BlKTtcbiAgfVxufVxuXG4vKipcbiAqIFByb2Nlc3NlcyBhIHRlbXBsYXRlIGFuZCBtYXRjaGVzIGRpcmVjdGl2ZXMgb24gbm9kZXMgKGVsZW1lbnRzIGFuZCB0ZW1wbGF0ZXMpLlxuICpcbiAqIFVzdWFsbHkgdXNlZCB2aWEgdGhlIHN0YXRpYyBgYXBwbHkoKWAgbWV0aG9kLlxuICovXG5jbGFzcyBEaXJlY3RpdmVCaW5kZXI8RGlyZWN0aXZlVCBleHRlbmRzIERpcmVjdGl2ZU1ldGE+IGltcGxlbWVudHMgVmlzaXRvciB7XG4gIC8vIEluZGljYXRlcyB3aGV0aGVyIHdlIGFyZSB2aXNpdGluZyBlbGVtZW50cyB3aXRoaW4gYSBgZGVmZXJgIGJsb2NrXG4gIHByaXZhdGUgaXNJbkRlZmVyQmxvY2sgPSBmYWxzZTtcblxuICBwcml2YXRlIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgbWF0Y2hlcjogU2VsZWN0b3JNYXRjaGVyPERpcmVjdGl2ZVRbXT4sXG4gICAgcHJpdmF0ZSBkaXJlY3RpdmVzOiBNYXA8RWxlbWVudCB8IFRlbXBsYXRlLCBEaXJlY3RpdmVUW10+LFxuICAgIHByaXZhdGUgZWFnZXJEaXJlY3RpdmVzOiBEaXJlY3RpdmVUW10sXG4gICAgcHJpdmF0ZSBiaW5kaW5nczogTWFwPFxuICAgICAgQm91bmRBdHRyaWJ1dGUgfCBCb3VuZEV2ZW50IHwgVGV4dEF0dHJpYnV0ZSxcbiAgICAgIERpcmVjdGl2ZVQgfCBFbGVtZW50IHwgVGVtcGxhdGVcbiAgICA+LFxuICAgIHByaXZhdGUgcmVmZXJlbmNlczogTWFwPFxuICAgICAgUmVmZXJlbmNlLFxuICAgICAge2RpcmVjdGl2ZTogRGlyZWN0aXZlVDsgbm9kZTogRWxlbWVudCB8IFRlbXBsYXRlfSB8IEVsZW1lbnQgfCBUZW1wbGF0ZVxuICAgID4sXG4gICkge31cblxuICAvKipcbiAgICogUHJvY2VzcyBhIHRlbXBsYXRlIChsaXN0IG9mIGBOb2RlYHMpIGFuZCBwZXJmb3JtIGRpcmVjdGl2ZSBtYXRjaGluZyBhZ2FpbnN0IGVhY2ggbm9kZS5cbiAgICpcbiAgICogQHBhcmFtIHRlbXBsYXRlIHRoZSBsaXN0IG9mIHRlbXBsYXRlIGBOb2RlYHMgdG8gbWF0Y2ggKHJlY3Vyc2l2ZWx5KS5cbiAgICogQHBhcmFtIHNlbGVjdG9yTWF0Y2hlciBhIGBTZWxlY3Rvck1hdGNoZXJgIGNvbnRhaW5pbmcgdGhlIGRpcmVjdGl2ZXMgdGhhdCBhcmUgaW4gc2NvcGUgZm9yXG4gICAqIHRoaXMgdGVtcGxhdGUuXG4gICAqIEByZXR1cm5zIHRocmVlIG1hcHMgd2hpY2ggY29udGFpbiBpbmZvcm1hdGlvbiBhYm91dCBkaXJlY3RpdmVzIGluIHRoZSB0ZW1wbGF0ZTogdGhlXG4gICAqIGBkaXJlY3RpdmVzYCBtYXAgd2hpY2ggbGlzdHMgZGlyZWN0aXZlcyBtYXRjaGVkIG9uIGVhY2ggbm9kZSwgdGhlIGBiaW5kaW5nc2AgbWFwIHdoaWNoXG4gICAqIGluZGljYXRlcyB3aGljaCBkaXJlY3RpdmVzIGNsYWltZWQgd2hpY2ggYmluZGluZ3MgKGlucHV0cywgb3V0cHV0cywgZXRjKSwgYW5kIHRoZSBgcmVmZXJlbmNlc2BcbiAgICogbWFwIHdoaWNoIHJlc29sdmVzICNyZWZlcmVuY2VzIChgUmVmZXJlbmNlYHMpIHdpdGhpbiB0aGUgdGVtcGxhdGUgdG8gdGhlIG5hbWVkIGRpcmVjdGl2ZSBvclxuICAgKiB0ZW1wbGF0ZSBub2RlLlxuICAgKi9cbiAgc3RhdGljIGFwcGx5PERpcmVjdGl2ZVQgZXh0ZW5kcyBEaXJlY3RpdmVNZXRhPihcbiAgICB0ZW1wbGF0ZTogTm9kZVtdLFxuICAgIHNlbGVjdG9yTWF0Y2hlcjogU2VsZWN0b3JNYXRjaGVyPERpcmVjdGl2ZVRbXT4sXG4gICk6IHtcbiAgICBkaXJlY3RpdmVzOiBNYXA8RWxlbWVudCB8IFRlbXBsYXRlLCBEaXJlY3RpdmVUW10+O1xuICAgIGVhZ2VyRGlyZWN0aXZlczogRGlyZWN0aXZlVFtdO1xuICAgIGJpbmRpbmdzOiBNYXA8Qm91bmRBdHRyaWJ1dGUgfCBCb3VuZEV2ZW50IHwgVGV4dEF0dHJpYnV0ZSwgRGlyZWN0aXZlVCB8IEVsZW1lbnQgfCBUZW1wbGF0ZT47XG4gICAgcmVmZXJlbmNlczogTWFwPFxuICAgICAgUmVmZXJlbmNlLFxuICAgICAge2RpcmVjdGl2ZTogRGlyZWN0aXZlVDsgbm9kZTogRWxlbWVudCB8IFRlbXBsYXRlfSB8IEVsZW1lbnQgfCBUZW1wbGF0ZVxuICAgID47XG4gIH0ge1xuICAgIGNvbnN0IGRpcmVjdGl2ZXMgPSBuZXcgTWFwPEVsZW1lbnQgfCBUZW1wbGF0ZSwgRGlyZWN0aXZlVFtdPigpO1xuICAgIGNvbnN0IGJpbmRpbmdzID0gbmV3IE1hcDxcbiAgICAgIEJvdW5kQXR0cmlidXRlIHwgQm91bmRFdmVudCB8IFRleHRBdHRyaWJ1dGUsXG4gICAgICBEaXJlY3RpdmVUIHwgRWxlbWVudCB8IFRlbXBsYXRlXG4gICAgPigpO1xuICAgIGNvbnN0IHJlZmVyZW5jZXMgPSBuZXcgTWFwPFxuICAgICAgUmVmZXJlbmNlLFxuICAgICAge2RpcmVjdGl2ZTogRGlyZWN0aXZlVDsgbm9kZTogRWxlbWVudCB8IFRlbXBsYXRlfSB8IEVsZW1lbnQgfCBUZW1wbGF0ZVxuICAgID4oKTtcbiAgICBjb25zdCBlYWdlckRpcmVjdGl2ZXM6IERpcmVjdGl2ZVRbXSA9IFtdO1xuICAgIGNvbnN0IG1hdGNoZXIgPSBuZXcgRGlyZWN0aXZlQmluZGVyKFxuICAgICAgc2VsZWN0b3JNYXRjaGVyLFxuICAgICAgZGlyZWN0aXZlcyxcbiAgICAgIGVhZ2VyRGlyZWN0aXZlcyxcbiAgICAgIGJpbmRpbmdzLFxuICAgICAgcmVmZXJlbmNlcyxcbiAgICApO1xuICAgIG1hdGNoZXIuaW5nZXN0KHRlbXBsYXRlKTtcbiAgICByZXR1cm4ge2RpcmVjdGl2ZXMsIGVhZ2VyRGlyZWN0aXZlcywgYmluZGluZ3MsIHJlZmVyZW5jZXN9O1xuICB9XG5cbiAgcHJpdmF0ZSBpbmdlc3QodGVtcGxhdGU6IE5vZGVbXSk6IHZvaWQge1xuICAgIHRlbXBsYXRlLmZvckVhY2goKG5vZGUpID0+IG5vZGUudmlzaXQodGhpcykpO1xuICB9XG5cbiAgdmlzaXRFbGVtZW50KGVsZW1lbnQ6IEVsZW1lbnQpOiB2b2lkIHtcbiAgICB0aGlzLnZpc2l0RWxlbWVudE9yVGVtcGxhdGUoZWxlbWVudCk7XG4gIH1cblxuICB2aXNpdFRlbXBsYXRlKHRlbXBsYXRlOiBUZW1wbGF0ZSk6IHZvaWQge1xuICAgIHRoaXMudmlzaXRFbGVtZW50T3JUZW1wbGF0ZSh0ZW1wbGF0ZSk7XG4gIH1cblxuICB2aXNpdEVsZW1lbnRPclRlbXBsYXRlKG5vZGU6IEVsZW1lbnQgfCBUZW1wbGF0ZSk6IHZvaWQge1xuICAgIC8vIEZpcnN0LCBkZXRlcm1pbmUgdGhlIEhUTUwgc2hhcGUgb2YgdGhlIG5vZGUgZm9yIHRoZSBwdXJwb3NlIG9mIGRpcmVjdGl2ZSBtYXRjaGluZy5cbiAgICAvLyBEbyB0aGlzIGJ5IGJ1aWxkaW5nIHVwIGEgYENzc1NlbGVjdG9yYCBmb3IgdGhlIG5vZGUuXG4gICAgY29uc3QgY3NzU2VsZWN0b3IgPSBjcmVhdGVDc3NTZWxlY3RvckZyb21Ob2RlKG5vZGUpO1xuXG4gICAgLy8gTmV4dCwgdXNlIHRoZSBgU2VsZWN0b3JNYXRjaGVyYCB0byBnZXQgdGhlIGxpc3Qgb2YgZGlyZWN0aXZlcyBvbiB0aGUgbm9kZS5cbiAgICBjb25zdCBkaXJlY3RpdmVzOiBEaXJlY3RpdmVUW10gPSBbXTtcbiAgICB0aGlzLm1hdGNoZXIubWF0Y2goY3NzU2VsZWN0b3IsIChfc2VsZWN0b3IsIHJlc3VsdHMpID0+IGRpcmVjdGl2ZXMucHVzaCguLi5yZXN1bHRzKSk7XG4gICAgaWYgKGRpcmVjdGl2ZXMubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5kaXJlY3RpdmVzLnNldChub2RlLCBkaXJlY3RpdmVzKTtcbiAgICAgIGlmICghdGhpcy5pc0luRGVmZXJCbG9jaykge1xuICAgICAgICB0aGlzLmVhZ2VyRGlyZWN0aXZlcy5wdXNoKC4uLmRpcmVjdGl2ZXMpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFJlc29sdmUgYW55IHJlZmVyZW5jZXMgdGhhdCBhcmUgY3JlYXRlZCBvbiB0aGlzIG5vZGUuXG4gICAgbm9kZS5yZWZlcmVuY2VzLmZvckVhY2goKHJlZikgPT4ge1xuICAgICAgbGV0IGRpclRhcmdldDogRGlyZWN0aXZlVCB8IG51bGwgPSBudWxsO1xuXG4gICAgICAvLyBJZiB0aGUgcmVmZXJlbmNlIGV4cHJlc3Npb24gaXMgZW1wdHksIHRoZW4gaXQgbWF0Y2hlcyB0aGUgXCJwcmltYXJ5XCIgZGlyZWN0aXZlIG9uIHRoZSBub2RlXG4gICAgICAvLyAoaWYgdGhlcmUgaXMgb25lKS4gT3RoZXJ3aXNlIGl0IG1hdGNoZXMgdGhlIGhvc3Qgbm9kZSBpdHNlbGYgKGVpdGhlciBhbiBlbGVtZW50IG9yXG4gICAgICAvLyA8bmctdGVtcGxhdGU+IG5vZGUpLlxuICAgICAgaWYgKHJlZi52YWx1ZS50cmltKCkgPT09ICcnKSB7XG4gICAgICAgIC8vIFRoaXMgY291bGQgYmUgYSByZWZlcmVuY2UgdG8gYSBjb21wb25lbnQgaWYgdGhlcmUgaXMgb25lLlxuICAgICAgICBkaXJUYXJnZXQgPSBkaXJlY3RpdmVzLmZpbmQoKGRpcikgPT4gZGlyLmlzQ29tcG9uZW50KSB8fCBudWxsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gVGhpcyBzaG91bGQgYmUgYSByZWZlcmVuY2UgdG8gYSBkaXJlY3RpdmUgZXhwb3J0ZWQgdmlhIGV4cG9ydEFzLlxuICAgICAgICBkaXJUYXJnZXQgPVxuICAgICAgICAgIGRpcmVjdGl2ZXMuZmluZChcbiAgICAgICAgICAgIChkaXIpID0+IGRpci5leHBvcnRBcyAhPT0gbnVsbCAmJiBkaXIuZXhwb3J0QXMuc29tZSgodmFsdWUpID0+IHZhbHVlID09PSByZWYudmFsdWUpLFxuICAgICAgICAgICkgfHwgbnVsbDtcbiAgICAgICAgLy8gQ2hlY2sgaWYgYSBtYXRjaGluZyBkaXJlY3RpdmUgd2FzIGZvdW5kLlxuICAgICAgICBpZiAoZGlyVGFyZ2V0ID09PSBudWxsKSB7XG4gICAgICAgICAgLy8gTm8gbWF0Y2hpbmcgZGlyZWN0aXZlIHdhcyBmb3VuZCAtIHRoaXMgcmVmZXJlbmNlIHBvaW50cyB0byBhbiB1bmtub3duIHRhcmdldC4gTGVhdmUgaXRcbiAgICAgICAgICAvLyB1bm1hcHBlZC5cbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGRpclRhcmdldCAhPT0gbnVsbCkge1xuICAgICAgICAvLyBUaGlzIHJlZmVyZW5jZSBwb2ludHMgdG8gYSBkaXJlY3RpdmUuXG4gICAgICAgIHRoaXMucmVmZXJlbmNlcy5zZXQocmVmLCB7ZGlyZWN0aXZlOiBkaXJUYXJnZXQsIG5vZGV9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFRoaXMgcmVmZXJlbmNlIHBvaW50cyB0byB0aGUgbm9kZSBpdHNlbGYuXG4gICAgICAgIHRoaXMucmVmZXJlbmNlcy5zZXQocmVmLCBub2RlKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIEFzc29jaWF0ZSBhdHRyaWJ1dGVzL2JpbmRpbmdzIG9uIHRoZSBub2RlIHdpdGggZGlyZWN0aXZlcyBvciB3aXRoIHRoZSBub2RlIGl0c2VsZi5cbiAgICB0eXBlIEJvdW5kTm9kZSA9IEJvdW5kQXR0cmlidXRlIHwgQm91bmRFdmVudCB8IFRleHRBdHRyaWJ1dGU7XG4gICAgY29uc3Qgc2V0QXR0cmlidXRlQmluZGluZyA9IChcbiAgICAgIGF0dHJpYnV0ZTogQm91bmROb2RlLFxuICAgICAgaW9UeXBlOiBrZXlvZiBQaWNrPERpcmVjdGl2ZU1ldGEsICdpbnB1dHMnIHwgJ291dHB1dHMnPixcbiAgICApID0+IHtcbiAgICAgIGNvbnN0IGRpciA9IGRpcmVjdGl2ZXMuZmluZCgoZGlyKSA9PiBkaXJbaW9UeXBlXS5oYXNCaW5kaW5nUHJvcGVydHlOYW1lKGF0dHJpYnV0ZS5uYW1lKSk7XG4gICAgICBjb25zdCBiaW5kaW5nID0gZGlyICE9PSB1bmRlZmluZWQgPyBkaXIgOiBub2RlO1xuICAgICAgdGhpcy5iaW5kaW5ncy5zZXQoYXR0cmlidXRlLCBiaW5kaW5nKTtcbiAgICB9O1xuXG4gICAgLy8gTm9kZSBpbnB1dHMgKGJvdW5kIGF0dHJpYnV0ZXMpIGFuZCB0ZXh0IGF0dHJpYnV0ZXMgY2FuIGJlIGJvdW5kIHRvIGFuXG4gICAgLy8gaW5wdXQgb24gYSBkaXJlY3RpdmUuXG4gICAgbm9kZS5pbnB1dHMuZm9yRWFjaCgoaW5wdXQpID0+IHNldEF0dHJpYnV0ZUJpbmRpbmcoaW5wdXQsICdpbnB1dHMnKSk7XG4gICAgbm9kZS5hdHRyaWJ1dGVzLmZvckVhY2goKGF0dHIpID0+IHNldEF0dHJpYnV0ZUJpbmRpbmcoYXR0ciwgJ2lucHV0cycpKTtcbiAgICBpZiAobm9kZSBpbnN0YW5jZW9mIFRlbXBsYXRlKSB7XG4gICAgICBub2RlLnRlbXBsYXRlQXR0cnMuZm9yRWFjaCgoYXR0cikgPT4gc2V0QXR0cmlidXRlQmluZGluZyhhdHRyLCAnaW5wdXRzJykpO1xuICAgIH1cbiAgICAvLyBOb2RlIG91dHB1dHMgKGJvdW5kIGV2ZW50cykgY2FuIGJlIGJvdW5kIHRvIGFuIG91dHB1dCBvbiBhIGRpcmVjdGl2ZS5cbiAgICBub2RlLm91dHB1dHMuZm9yRWFjaCgob3V0cHV0KSA9PiBzZXRBdHRyaWJ1dGVCaW5kaW5nKG91dHB1dCwgJ291dHB1dHMnKSk7XG5cbiAgICAvLyBSZWN1cnNlIGludG8gdGhlIG5vZGUncyBjaGlsZHJlbi5cbiAgICBub2RlLmNoaWxkcmVuLmZvckVhY2goKGNoaWxkKSA9PiBjaGlsZC52aXNpdCh0aGlzKSk7XG4gIH1cblxuICB2aXNpdERlZmVycmVkQmxvY2soZGVmZXJyZWQ6IERlZmVycmVkQmxvY2spOiB2b2lkIHtcbiAgICBjb25zdCB3YXNJbkRlZmVyQmxvY2sgPSB0aGlzLmlzSW5EZWZlckJsb2NrO1xuICAgIHRoaXMuaXNJbkRlZmVyQmxvY2sgPSB0cnVlO1xuICAgIGRlZmVycmVkLmNoaWxkcmVuLmZvckVhY2goKGNoaWxkKSA9PiBjaGlsZC52aXNpdCh0aGlzKSk7XG4gICAgdGhpcy5pc0luRGVmZXJCbG9jayA9IHdhc0luRGVmZXJCbG9jaztcblxuICAgIGRlZmVycmVkLnBsYWNlaG9sZGVyPy52aXNpdCh0aGlzKTtcbiAgICBkZWZlcnJlZC5sb2FkaW5nPy52aXNpdCh0aGlzKTtcbiAgICBkZWZlcnJlZC5lcnJvcj8udmlzaXQodGhpcyk7XG4gIH1cblxuICB2aXNpdERlZmVycmVkQmxvY2tQbGFjZWhvbGRlcihibG9jazogRGVmZXJyZWRCbG9ja1BsYWNlaG9sZGVyKTogdm9pZCB7XG4gICAgYmxvY2suY2hpbGRyZW4uZm9yRWFjaCgoY2hpbGQpID0+IGNoaWxkLnZpc2l0KHRoaXMpKTtcbiAgfVxuXG4gIHZpc2l0RGVmZXJyZWRCbG9ja0Vycm9yKGJsb2NrOiBEZWZlcnJlZEJsb2NrRXJyb3IpOiB2b2lkIHtcbiAgICBibG9jay5jaGlsZHJlbi5mb3JFYWNoKChjaGlsZCkgPT4gY2hpbGQudmlzaXQodGhpcykpO1xuICB9XG5cbiAgdmlzaXREZWZlcnJlZEJsb2NrTG9hZGluZyhibG9jazogRGVmZXJyZWRCbG9ja0xvYWRpbmcpOiB2b2lkIHtcbiAgICBibG9jay5jaGlsZHJlbi5mb3JFYWNoKChjaGlsZCkgPT4gY2hpbGQudmlzaXQodGhpcykpO1xuICB9XG5cbiAgdmlzaXRTd2l0Y2hCbG9jayhibG9jazogU3dpdGNoQmxvY2spIHtcbiAgICBibG9jay5jYXNlcy5mb3JFYWNoKChub2RlKSA9PiBub2RlLnZpc2l0KHRoaXMpKTtcbiAgfVxuXG4gIHZpc2l0U3dpdGNoQmxvY2tDYXNlKGJsb2NrOiBTd2l0Y2hCbG9ja0Nhc2UpIHtcbiAgICBibG9jay5jaGlsZHJlbi5mb3JFYWNoKChub2RlKSA9PiBub2RlLnZpc2l0KHRoaXMpKTtcbiAgfVxuXG4gIHZpc2l0Rm9yTG9vcEJsb2NrKGJsb2NrOiBGb3JMb29wQmxvY2spIHtcbiAgICBibG9jay5pdGVtLnZpc2l0KHRoaXMpO1xuICAgIGJsb2NrLmNvbnRleHRWYXJpYWJsZXMuZm9yRWFjaCgodikgPT4gdi52aXNpdCh0aGlzKSk7XG4gICAgYmxvY2suY2hpbGRyZW4uZm9yRWFjaCgobm9kZSkgPT4gbm9kZS52aXNpdCh0aGlzKSk7XG4gICAgYmxvY2suZW1wdHk/LnZpc2l0KHRoaXMpO1xuICB9XG5cbiAgdmlzaXRGb3JMb29wQmxvY2tFbXB0eShibG9jazogRm9yTG9vcEJsb2NrRW1wdHkpIHtcbiAgICBibG9jay5jaGlsZHJlbi5mb3JFYWNoKChub2RlKSA9PiBub2RlLnZpc2l0KHRoaXMpKTtcbiAgfVxuXG4gIHZpc2l0SWZCbG9jayhibG9jazogSWZCbG9jaykge1xuICAgIGJsb2NrLmJyYW5jaGVzLmZvckVhY2goKG5vZGUpID0+IG5vZGUudmlzaXQodGhpcykpO1xuICB9XG5cbiAgdmlzaXRJZkJsb2NrQnJhbmNoKGJsb2NrOiBJZkJsb2NrQnJhbmNoKSB7XG4gICAgYmxvY2suZXhwcmVzc2lvbkFsaWFzPy52aXNpdCh0aGlzKTtcbiAgICBibG9jay5jaGlsZHJlbi5mb3JFYWNoKChub2RlKSA9PiBub2RlLnZpc2l0KHRoaXMpKTtcbiAgfVxuXG4gIHZpc2l0Q29udGVudChjb250ZW50OiBDb250ZW50KTogdm9pZCB7XG4gICAgY29udGVudC5jaGlsZHJlbi5mb3JFYWNoKChjaGlsZCkgPT4gY2hpbGQudmlzaXQodGhpcykpO1xuICB9XG5cbiAgLy8gVW51c2VkIHZpc2l0b3JzLlxuICB2aXNpdFZhcmlhYmxlKHZhcmlhYmxlOiBWYXJpYWJsZSk6IHZvaWQge31cbiAgdmlzaXRSZWZlcmVuY2UocmVmZXJlbmNlOiBSZWZlcmVuY2UpOiB2b2lkIHt9XG4gIHZpc2l0VGV4dEF0dHJpYnV0ZShhdHRyaWJ1dGU6IFRleHRBdHRyaWJ1dGUpOiB2b2lkIHt9XG4gIHZpc2l0Qm91bmRBdHRyaWJ1dGUoYXR0cmlidXRlOiBCb3VuZEF0dHJpYnV0ZSk6IHZvaWQge31cbiAgdmlzaXRCb3VuZEV2ZW50KGF0dHJpYnV0ZTogQm91bmRFdmVudCk6IHZvaWQge31cbiAgdmlzaXRCb3VuZEF0dHJpYnV0ZU9yRXZlbnQobm9kZTogQm91bmRBdHRyaWJ1dGUgfCBCb3VuZEV2ZW50KSB7fVxuICB2aXNpdFRleHQodGV4dDogVGV4dCk6IHZvaWQge31cbiAgdmlzaXRCb3VuZFRleHQodGV4dDogQm91bmRUZXh0KTogdm9pZCB7fVxuICB2aXNpdEljdShpY3U6IEljdSk6IHZvaWQge31cbiAgdmlzaXREZWZlcnJlZFRyaWdnZXIodHJpZ2dlcjogRGVmZXJyZWRUcmlnZ2VyKTogdm9pZCB7fVxuICB2aXNpdFVua25vd25CbG9jayhibG9jazogVW5rbm93bkJsb2NrKSB7fVxuICB2aXNpdExldERlY2xhcmF0aW9uKGRlY2w6IExldERlY2xhcmF0aW9uKSB7fVxufVxuXG4vKipcbiAqIFByb2Nlc3NlcyBhIHRlbXBsYXRlIGFuZCBleHRyYWN0IG1ldGFkYXRhIGFib3V0IGV4cHJlc3Npb25zIGFuZCBzeW1ib2xzIHdpdGhpbi5cbiAqXG4gKiBUaGlzIGlzIGEgY29tcGFuaW9uIHRvIHRoZSBgRGlyZWN0aXZlQmluZGVyYCB0aGF0IGRvZXNuJ3QgcmVxdWlyZSBrbm93bGVkZ2Ugb2YgZGlyZWN0aXZlcyBtYXRjaGVkXG4gKiB3aXRoaW4gdGhlIHRlbXBsYXRlIGluIG9yZGVyIHRvIG9wZXJhdGUuXG4gKlxuICogRXhwcmVzc2lvbnMgYXJlIHZpc2l0ZWQgYnkgdGhlIHN1cGVyY2xhc3MgYFJlY3Vyc2l2ZUFzdFZpc2l0b3JgLCB3aXRoIGN1c3RvbSBsb2dpYyBwcm92aWRlZFxuICogYnkgb3ZlcnJpZGRlbiBtZXRob2RzIGZyb20gdGhhdCB2aXNpdG9yLlxuICovXG5jbGFzcyBUZW1wbGF0ZUJpbmRlciBleHRlbmRzIFJlY3Vyc2l2ZUFzdFZpc2l0b3IgaW1wbGVtZW50cyBWaXNpdG9yIHtcbiAgcHJpdmF0ZSB2aXNpdE5vZGU6IChub2RlOiBOb2RlKSA9PiB2b2lkO1xuXG4gIHByaXZhdGUgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBiaW5kaW5nczogTWFwPEFTVCwgVGVtcGxhdGVFbnRpdHk+LFxuICAgIHByaXZhdGUgc3ltYm9sczogTWFwPFRlbXBsYXRlRW50aXR5LCBTY29wZWROb2RlPixcbiAgICBwcml2YXRlIHVzZWRQaXBlczogU2V0PHN0cmluZz4sXG4gICAgcHJpdmF0ZSBlYWdlclBpcGVzOiBTZXQ8c3RyaW5nPixcbiAgICBwcml2YXRlIGRlZmVyQmxvY2tzOiBbRGVmZXJyZWRCbG9jaywgU2NvcGVdW10sXG4gICAgcHJpdmF0ZSBuZXN0aW5nTGV2ZWw6IE1hcDxTY29wZWROb2RlLCBudW1iZXI+LFxuICAgIHByaXZhdGUgc2NvcGU6IFNjb3BlLFxuICAgIHByaXZhdGUgcm9vdE5vZGU6IFNjb3BlZE5vZGUgfCBudWxsLFxuICAgIHByaXZhdGUgbGV2ZWw6IG51bWJlcixcbiAgKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIC8vIFNhdmUgYSBiaXQgb2YgcHJvY2Vzc2luZyB0aW1lIGJ5IGNvbnN0cnVjdGluZyB0aGlzIGNsb3N1cmUgaW4gYWR2YW5jZS5cbiAgICB0aGlzLnZpc2l0Tm9kZSA9IChub2RlOiBOb2RlKSA9PiBub2RlLnZpc2l0KHRoaXMpO1xuICB9XG5cbiAgLy8gVGhpcyBtZXRob2QgaXMgZGVmaW5lZCB0byByZWNvbmNpbGUgdGhlIHR5cGUgb2YgVGVtcGxhdGVCaW5kZXIgc2luY2UgYm90aFxuICAvLyBSZWN1cnNpdmVBc3RWaXNpdG9yIGFuZCBWaXNpdG9yIGRlZmluZSB0aGUgdmlzaXQoKSBtZXRob2QgaW4gdGhlaXJcbiAgLy8gaW50ZXJmYWNlcy5cbiAgb3ZlcnJpZGUgdmlzaXQobm9kZTogQVNUIHwgTm9kZSwgY29udGV4dD86IGFueSkge1xuICAgIGlmIChub2RlIGluc3RhbmNlb2YgQVNUKSB7XG4gICAgICBub2RlLnZpc2l0KHRoaXMsIGNvbnRleHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBub2RlLnZpc2l0KHRoaXMpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBQcm9jZXNzIGEgdGVtcGxhdGUgYW5kIGV4dHJhY3QgbWV0YWRhdGEgYWJvdXQgZXhwcmVzc2lvbnMgYW5kIHN5bWJvbHMgd2l0aGluLlxuICAgKlxuICAgKiBAcGFyYW0gbm9kZXMgdGhlIG5vZGVzIG9mIHRoZSB0ZW1wbGF0ZSB0byBwcm9jZXNzXG4gICAqIEBwYXJhbSBzY29wZSB0aGUgYFNjb3BlYCBvZiB0aGUgdGVtcGxhdGUgYmVpbmcgcHJvY2Vzc2VkLlxuICAgKiBAcmV0dXJucyB0aHJlZSBtYXBzIHdoaWNoIGNvbnRhaW4gbWV0YWRhdGEgYWJvdXQgdGhlIHRlbXBsYXRlOiBgZXhwcmVzc2lvbnNgIHdoaWNoIGludGVycHJldHNcbiAgICogc3BlY2lhbCBgQVNUYCBub2RlcyBpbiBleHByZXNzaW9ucyBhcyBwb2ludGluZyB0byByZWZlcmVuY2VzIG9yIHZhcmlhYmxlcyBkZWNsYXJlZCB3aXRoaW4gdGhlXG4gICAqIHRlbXBsYXRlLCBgc3ltYm9sc2Agd2hpY2ggbWFwcyB0aG9zZSB2YXJpYWJsZXMgYW5kIHJlZmVyZW5jZXMgdG8gdGhlIG5lc3RlZCBgVGVtcGxhdGVgIHdoaWNoXG4gICAqIGRlY2xhcmVzIHRoZW0sIGlmIGFueSwgYW5kIGBuZXN0aW5nTGV2ZWxgIHdoaWNoIGFzc29jaWF0ZXMgZWFjaCBgVGVtcGxhdGVgIHdpdGggYSBpbnRlZ2VyXG4gICAqIG5lc3RpbmcgbGV2ZWwgKGhvdyBtYW55IGxldmVscyBkZWVwIHdpdGhpbiB0aGUgdGVtcGxhdGUgc3RydWN0dXJlIHRoZSBgVGVtcGxhdGVgIGlzKSwgc3RhcnRpbmdcbiAgICogYXQgMS5cbiAgICovXG4gIHN0YXRpYyBhcHBseVdpdGhTY29wZShcbiAgICBub2RlczogTm9kZVtdLFxuICAgIHNjb3BlOiBTY29wZSxcbiAgKToge1xuICAgIGV4cHJlc3Npb25zOiBNYXA8QVNULCBUZW1wbGF0ZUVudGl0eT47XG4gICAgc3ltYm9sczogTWFwPFRlbXBsYXRlRW50aXR5LCBUZW1wbGF0ZT47XG4gICAgbmVzdGluZ0xldmVsOiBNYXA8U2NvcGVkTm9kZSwgbnVtYmVyPjtcbiAgICB1c2VkUGlwZXM6IFNldDxzdHJpbmc+O1xuICAgIGVhZ2VyUGlwZXM6IFNldDxzdHJpbmc+O1xuICAgIGRlZmVyQmxvY2tzOiBbRGVmZXJyZWRCbG9jaywgU2NvcGVdW107XG4gIH0ge1xuICAgIGNvbnN0IGV4cHJlc3Npb25zID0gbmV3IE1hcDxBU1QsIFRlbXBsYXRlRW50aXR5PigpO1xuICAgIGNvbnN0IHN5bWJvbHMgPSBuZXcgTWFwPFRlbXBsYXRlRW50aXR5LCBUZW1wbGF0ZT4oKTtcbiAgICBjb25zdCBuZXN0aW5nTGV2ZWwgPSBuZXcgTWFwPFNjb3BlZE5vZGUsIG51bWJlcj4oKTtcbiAgICBjb25zdCB1c2VkUGlwZXMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICBjb25zdCBlYWdlclBpcGVzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgY29uc3QgdGVtcGxhdGUgPSBub2RlcyBpbnN0YW5jZW9mIFRlbXBsYXRlID8gbm9kZXMgOiBudWxsO1xuICAgIGNvbnN0IGRlZmVyQmxvY2tzOiBbRGVmZXJyZWRCbG9jaywgU2NvcGVdW10gPSBbXTtcbiAgICAvLyBUaGUgdG9wLWxldmVsIHRlbXBsYXRlIGhhcyBuZXN0aW5nIGxldmVsIDAuXG4gICAgY29uc3QgYmluZGVyID0gbmV3IFRlbXBsYXRlQmluZGVyKFxuICAgICAgZXhwcmVzc2lvbnMsXG4gICAgICBzeW1ib2xzLFxuICAgICAgdXNlZFBpcGVzLFxuICAgICAgZWFnZXJQaXBlcyxcbiAgICAgIGRlZmVyQmxvY2tzLFxuICAgICAgbmVzdGluZ0xldmVsLFxuICAgICAgc2NvcGUsXG4gICAgICB0ZW1wbGF0ZSxcbiAgICAgIDAsXG4gICAgKTtcbiAgICBiaW5kZXIuaW5nZXN0KG5vZGVzKTtcbiAgICByZXR1cm4ge2V4cHJlc3Npb25zLCBzeW1ib2xzLCBuZXN0aW5nTGV2ZWwsIHVzZWRQaXBlcywgZWFnZXJQaXBlcywgZGVmZXJCbG9ja3N9O1xuICB9XG5cbiAgcHJpdmF0ZSBpbmdlc3Qobm9kZU9yTm9kZXM6IFNjb3BlZE5vZGUgfCBOb2RlW10pOiB2b2lkIHtcbiAgICBpZiAobm9kZU9yTm9kZXMgaW5zdGFuY2VvZiBUZW1wbGF0ZSkge1xuICAgICAgLy8gRm9yIDxuZy10ZW1wbGF0ZT5zLCBwcm9jZXNzIG9ubHkgdmFyaWFibGVzIGFuZCBjaGlsZCBub2Rlcy4gSW5wdXRzLCBvdXRwdXRzLCB0ZW1wbGF0ZUF0dHJzLFxuICAgICAgLy8gYW5kIHJlZmVyZW5jZXMgd2VyZSBhbGwgcHJvY2Vzc2VkIGluIHRoZSBzY29wZSBvZiB0aGUgY29udGFpbmluZyB0ZW1wbGF0ZS5cbiAgICAgIG5vZGVPck5vZGVzLnZhcmlhYmxlcy5mb3JFYWNoKHRoaXMudmlzaXROb2RlKTtcbiAgICAgIG5vZGVPck5vZGVzLmNoaWxkcmVuLmZvckVhY2godGhpcy52aXNpdE5vZGUpO1xuXG4gICAgICAvLyBTZXQgdGhlIG5lc3RpbmcgbGV2ZWwuXG4gICAgICB0aGlzLm5lc3RpbmdMZXZlbC5zZXQobm9kZU9yTm9kZXMsIHRoaXMubGV2ZWwpO1xuICAgIH0gZWxzZSBpZiAobm9kZU9yTm9kZXMgaW5zdGFuY2VvZiBJZkJsb2NrQnJhbmNoKSB7XG4gICAgICBpZiAobm9kZU9yTm9kZXMuZXhwcmVzc2lvbkFsaWFzICE9PSBudWxsKSB7XG4gICAgICAgIHRoaXMudmlzaXROb2RlKG5vZGVPck5vZGVzLmV4cHJlc3Npb25BbGlhcyk7XG4gICAgICB9XG4gICAgICBub2RlT3JOb2Rlcy5jaGlsZHJlbi5mb3JFYWNoKHRoaXMudmlzaXROb2RlKTtcbiAgICAgIHRoaXMubmVzdGluZ0xldmVsLnNldChub2RlT3JOb2RlcywgdGhpcy5sZXZlbCk7XG4gICAgfSBlbHNlIGlmIChub2RlT3JOb2RlcyBpbnN0YW5jZW9mIEZvckxvb3BCbG9jaykge1xuICAgICAgdGhpcy52aXNpdE5vZGUobm9kZU9yTm9kZXMuaXRlbSk7XG4gICAgICBub2RlT3JOb2Rlcy5jb250ZXh0VmFyaWFibGVzLmZvckVhY2goKHYpID0+IHRoaXMudmlzaXROb2RlKHYpKTtcbiAgICAgIG5vZGVPck5vZGVzLnRyYWNrQnkudmlzaXQodGhpcyk7XG4gICAgICBub2RlT3JOb2Rlcy5jaGlsZHJlbi5mb3JFYWNoKHRoaXMudmlzaXROb2RlKTtcbiAgICAgIHRoaXMubmVzdGluZ0xldmVsLnNldChub2RlT3JOb2RlcywgdGhpcy5sZXZlbCk7XG4gICAgfSBlbHNlIGlmIChub2RlT3JOb2RlcyBpbnN0YW5jZW9mIERlZmVycmVkQmxvY2spIHtcbiAgICAgIGlmICh0aGlzLnNjb3BlLnJvb3ROb2RlICE9PSBub2RlT3JOb2Rlcykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYEFzc2VydGlvbiBlcnJvcjogcmVzb2x2ZWQgaW5jb3JyZWN0IHNjb3BlIGZvciBkZWZlcnJlZCBibG9jayAke25vZGVPck5vZGVzfWAsXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICB0aGlzLmRlZmVyQmxvY2tzLnB1c2goW25vZGVPck5vZGVzLCB0aGlzLnNjb3BlXSk7XG4gICAgICBub2RlT3JOb2Rlcy5jaGlsZHJlbi5mb3JFYWNoKChub2RlKSA9PiBub2RlLnZpc2l0KHRoaXMpKTtcbiAgICAgIHRoaXMubmVzdGluZ0xldmVsLnNldChub2RlT3JOb2RlcywgdGhpcy5sZXZlbCk7XG4gICAgfSBlbHNlIGlmIChcbiAgICAgIG5vZGVPck5vZGVzIGluc3RhbmNlb2YgU3dpdGNoQmxvY2tDYXNlIHx8XG4gICAgICBub2RlT3JOb2RlcyBpbnN0YW5jZW9mIEZvckxvb3BCbG9ja0VtcHR5IHx8XG4gICAgICBub2RlT3JOb2RlcyBpbnN0YW5jZW9mIERlZmVycmVkQmxvY2tFcnJvciB8fFxuICAgICAgbm9kZU9yTm9kZXMgaW5zdGFuY2VvZiBEZWZlcnJlZEJsb2NrUGxhY2Vob2xkZXIgfHxcbiAgICAgIG5vZGVPck5vZGVzIGluc3RhbmNlb2YgRGVmZXJyZWRCbG9ja0xvYWRpbmcgfHxcbiAgICAgIG5vZGVPck5vZGVzIGluc3RhbmNlb2YgQ29udGVudFxuICAgICkge1xuICAgICAgbm9kZU9yTm9kZXMuY2hpbGRyZW4uZm9yRWFjaCgobm9kZSkgPT4gbm9kZS52aXNpdCh0aGlzKSk7XG4gICAgICB0aGlzLm5lc3RpbmdMZXZlbC5zZXQobm9kZU9yTm9kZXMsIHRoaXMubGV2ZWwpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBWaXNpdCBlYWNoIG5vZGUgZnJvbSB0aGUgdG9wLWxldmVsIHRlbXBsYXRlLlxuICAgICAgbm9kZU9yTm9kZXMuZm9yRWFjaCh0aGlzLnZpc2l0Tm9kZSk7XG4gICAgfVxuICB9XG5cbiAgdmlzaXRFbGVtZW50KGVsZW1lbnQ6IEVsZW1lbnQpIHtcbiAgICAvLyBWaXNpdCB0aGUgaW5wdXRzLCBvdXRwdXRzLCBhbmQgY2hpbGRyZW4gb2YgdGhlIGVsZW1lbnQuXG4gICAgZWxlbWVudC5pbnB1dHMuZm9yRWFjaCh0aGlzLnZpc2l0Tm9kZSk7XG4gICAgZWxlbWVudC5vdXRwdXRzLmZvckVhY2godGhpcy52aXNpdE5vZGUpO1xuICAgIGVsZW1lbnQuY2hpbGRyZW4uZm9yRWFjaCh0aGlzLnZpc2l0Tm9kZSk7XG4gICAgZWxlbWVudC5yZWZlcmVuY2VzLmZvckVhY2godGhpcy52aXNpdE5vZGUpO1xuICB9XG5cbiAgdmlzaXRUZW1wbGF0ZSh0ZW1wbGF0ZTogVGVtcGxhdGUpIHtcbiAgICAvLyBGaXJzdCwgdmlzaXQgaW5wdXRzLCBvdXRwdXRzIGFuZCB0ZW1wbGF0ZSBhdHRyaWJ1dGVzIG9mIHRoZSB0ZW1wbGF0ZSBub2RlLlxuICAgIHRlbXBsYXRlLmlucHV0cy5mb3JFYWNoKHRoaXMudmlzaXROb2RlKTtcbiAgICB0ZW1wbGF0ZS5vdXRwdXRzLmZvckVhY2godGhpcy52aXNpdE5vZGUpO1xuICAgIHRlbXBsYXRlLnRlbXBsYXRlQXR0cnMuZm9yRWFjaCh0aGlzLnZpc2l0Tm9kZSk7XG4gICAgdGVtcGxhdGUucmVmZXJlbmNlcy5mb3JFYWNoKHRoaXMudmlzaXROb2RlKTtcblxuICAgIC8vIE5leHQsIHJlY3Vyc2UgaW50byB0aGUgdGVtcGxhdGUuXG4gICAgdGhpcy5pbmdlc3RTY29wZWROb2RlKHRlbXBsYXRlKTtcbiAgfVxuXG4gIHZpc2l0VmFyaWFibGUodmFyaWFibGU6IFZhcmlhYmxlKSB7XG4gICAgLy8gUmVnaXN0ZXIgdGhlIGBWYXJpYWJsZWAgYXMgYSBzeW1ib2wgaW4gdGhlIGN1cnJlbnQgYFRlbXBsYXRlYC5cbiAgICBpZiAodGhpcy5yb290Tm9kZSAhPT0gbnVsbCkge1xuICAgICAgdGhpcy5zeW1ib2xzLnNldCh2YXJpYWJsZSwgdGhpcy5yb290Tm9kZSk7XG4gICAgfVxuICB9XG5cbiAgdmlzaXRSZWZlcmVuY2UocmVmZXJlbmNlOiBSZWZlcmVuY2UpIHtcbiAgICAvLyBSZWdpc3RlciB0aGUgYFJlZmVyZW5jZWAgYXMgYSBzeW1ib2wgaW4gdGhlIGN1cnJlbnQgYFRlbXBsYXRlYC5cbiAgICBpZiAodGhpcy5yb290Tm9kZSAhPT0gbnVsbCkge1xuICAgICAgdGhpcy5zeW1ib2xzLnNldChyZWZlcmVuY2UsIHRoaXMucm9vdE5vZGUpO1xuICAgIH1cbiAgfVxuXG4gIC8vIFVudXNlZCB0ZW1wbGF0ZSB2aXNpdG9yc1xuICB2aXNpdFRleHQodGV4dDogVGV4dCkge31cbiAgdmlzaXRUZXh0QXR0cmlidXRlKGF0dHJpYnV0ZTogVGV4dEF0dHJpYnV0ZSkge31cbiAgdmlzaXRVbmtub3duQmxvY2soYmxvY2s6IFVua25vd25CbG9jaykge31cbiAgdmlzaXREZWZlcnJlZFRyaWdnZXIoKTogdm9pZCB7fVxuICB2aXNpdEljdShpY3U6IEljdSk6IHZvaWQge1xuICAgIE9iamVjdC5rZXlzKGljdS52YXJzKS5mb3JFYWNoKChrZXkpID0+IGljdS52YXJzW2tleV0udmlzaXQodGhpcykpO1xuICAgIE9iamVjdC5rZXlzKGljdS5wbGFjZWhvbGRlcnMpLmZvckVhY2goKGtleSkgPT4gaWN1LnBsYWNlaG9sZGVyc1trZXldLnZpc2l0KHRoaXMpKTtcbiAgfVxuXG4gIC8vIFRoZSByZW1haW5pbmcgdmlzaXRvcnMgYXJlIGNvbmNlcm5lZCB3aXRoIHByb2Nlc3NpbmcgQVNUIGV4cHJlc3Npb25zIHdpdGhpbiB0ZW1wbGF0ZSBiaW5kaW5nc1xuXG4gIHZpc2l0Qm91bmRBdHRyaWJ1dGUoYXR0cmlidXRlOiBCb3VuZEF0dHJpYnV0ZSkge1xuICAgIGF0dHJpYnV0ZS52YWx1ZS52aXNpdCh0aGlzKTtcbiAgfVxuXG4gIHZpc2l0Qm91bmRFdmVudChldmVudDogQm91bmRFdmVudCkge1xuICAgIGV2ZW50LmhhbmRsZXIudmlzaXQodGhpcyk7XG4gIH1cblxuICB2aXNpdERlZmVycmVkQmxvY2soZGVmZXJyZWQ6IERlZmVycmVkQmxvY2spIHtcbiAgICB0aGlzLmluZ2VzdFNjb3BlZE5vZGUoZGVmZXJyZWQpO1xuICAgIGRlZmVycmVkLnRyaWdnZXJzLndoZW4/LnZhbHVlLnZpc2l0KHRoaXMpO1xuICAgIGRlZmVycmVkLnByZWZldGNoVHJpZ2dlcnMud2hlbj8udmFsdWUudmlzaXQodGhpcyk7XG4gICAgZGVmZXJyZWQucGxhY2Vob2xkZXIgJiYgdGhpcy52aXNpdE5vZGUoZGVmZXJyZWQucGxhY2Vob2xkZXIpO1xuICAgIGRlZmVycmVkLmxvYWRpbmcgJiYgdGhpcy52aXNpdE5vZGUoZGVmZXJyZWQubG9hZGluZyk7XG4gICAgZGVmZXJyZWQuZXJyb3IgJiYgdGhpcy52aXNpdE5vZGUoZGVmZXJyZWQuZXJyb3IpO1xuICB9XG5cbiAgdmlzaXREZWZlcnJlZEJsb2NrUGxhY2Vob2xkZXIoYmxvY2s6IERlZmVycmVkQmxvY2tQbGFjZWhvbGRlcikge1xuICAgIHRoaXMuaW5nZXN0U2NvcGVkTm9kZShibG9jayk7XG4gIH1cblxuICB2aXNpdERlZmVycmVkQmxvY2tFcnJvcihibG9jazogRGVmZXJyZWRCbG9ja0Vycm9yKSB7XG4gICAgdGhpcy5pbmdlc3RTY29wZWROb2RlKGJsb2NrKTtcbiAgfVxuXG4gIHZpc2l0RGVmZXJyZWRCbG9ja0xvYWRpbmcoYmxvY2s6IERlZmVycmVkQmxvY2tMb2FkaW5nKSB7XG4gICAgdGhpcy5pbmdlc3RTY29wZWROb2RlKGJsb2NrKTtcbiAgfVxuXG4gIHZpc2l0U3dpdGNoQmxvY2soYmxvY2s6IFN3aXRjaEJsb2NrKSB7XG4gICAgYmxvY2suZXhwcmVzc2lvbi52aXNpdCh0aGlzKTtcbiAgICBibG9jay5jYXNlcy5mb3JFYWNoKHRoaXMudmlzaXROb2RlKTtcbiAgfVxuXG4gIHZpc2l0U3dpdGNoQmxvY2tDYXNlKGJsb2NrOiBTd2l0Y2hCbG9ja0Nhc2UpIHtcbiAgICBibG9jay5leHByZXNzaW9uPy52aXNpdCh0aGlzKTtcbiAgICB0aGlzLmluZ2VzdFNjb3BlZE5vZGUoYmxvY2spO1xuICB9XG5cbiAgdmlzaXRGb3JMb29wQmxvY2soYmxvY2s6IEZvckxvb3BCbG9jaykge1xuICAgIGJsb2NrLmV4cHJlc3Npb24udmlzaXQodGhpcyk7XG4gICAgdGhpcy5pbmdlc3RTY29wZWROb2RlKGJsb2NrKTtcbiAgICBibG9jay5lbXB0eT8udmlzaXQodGhpcyk7XG4gIH1cblxuICB2aXNpdEZvckxvb3BCbG9ja0VtcHR5KGJsb2NrOiBGb3JMb29wQmxvY2tFbXB0eSkge1xuICAgIHRoaXMuaW5nZXN0U2NvcGVkTm9kZShibG9jayk7XG4gIH1cblxuICB2aXNpdElmQmxvY2soYmxvY2s6IElmQmxvY2spIHtcbiAgICBibG9jay5icmFuY2hlcy5mb3JFYWNoKChub2RlKSA9PiBub2RlLnZpc2l0KHRoaXMpKTtcbiAgfVxuXG4gIHZpc2l0SWZCbG9ja0JyYW5jaChibG9jazogSWZCbG9ja0JyYW5jaCkge1xuICAgIGJsb2NrLmV4cHJlc3Npb24/LnZpc2l0KHRoaXMpO1xuICAgIHRoaXMuaW5nZXN0U2NvcGVkTm9kZShibG9jayk7XG4gIH1cblxuICB2aXNpdENvbnRlbnQoY29udGVudDogQ29udGVudCkge1xuICAgIHRoaXMuaW5nZXN0U2NvcGVkTm9kZShjb250ZW50KTtcbiAgfVxuXG4gIHZpc2l0Qm91bmRUZXh0KHRleHQ6IEJvdW5kVGV4dCkge1xuICAgIHRleHQudmFsdWUudmlzaXQodGhpcyk7XG4gIH1cblxuICB2aXNpdExldERlY2xhcmF0aW9uKGRlY2w6IExldERlY2xhcmF0aW9uKSB7XG4gICAgZGVjbC52YWx1ZS52aXNpdCh0aGlzKTtcblxuICAgIGlmICh0aGlzLnJvb3ROb2RlICE9PSBudWxsKSB7XG4gICAgICB0aGlzLnN5bWJvbHMuc2V0KGRlY2wsIHRoaXMucm9vdE5vZGUpO1xuICAgIH1cbiAgfVxuXG4gIG92ZXJyaWRlIHZpc2l0UGlwZShhc3Q6IEJpbmRpbmdQaXBlLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHRoaXMudXNlZFBpcGVzLmFkZChhc3QubmFtZSk7XG4gICAgaWYgKCF0aGlzLnNjb3BlLmlzRGVmZXJyZWQpIHtcbiAgICAgIHRoaXMuZWFnZXJQaXBlcy5hZGQoYXN0Lm5hbWUpO1xuICAgIH1cbiAgICByZXR1cm4gc3VwZXIudmlzaXRQaXBlKGFzdCwgY29udGV4dCk7XG4gIH1cblxuICAvLyBUaGVzZSBmaXZlIHR5cGVzIG9mIEFTVCBleHByZXNzaW9ucyBjYW4gcmVmZXIgdG8gZXhwcmVzc2lvbiByb290cywgd2hpY2ggY291bGQgYmUgdmFyaWFibGVzXG4gIC8vIG9yIHJlZmVyZW5jZXMgaW4gdGhlIGN1cnJlbnQgc2NvcGUuXG5cbiAgb3ZlcnJpZGUgdmlzaXRQcm9wZXJ0eVJlYWQoYXN0OiBQcm9wZXJ0eVJlYWQsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgdGhpcy5tYXliZU1hcChhc3QsIGFzdC5uYW1lKTtcbiAgICByZXR1cm4gc3VwZXIudmlzaXRQcm9wZXJ0eVJlYWQoYXN0LCBjb250ZXh0KTtcbiAgfVxuXG4gIG92ZXJyaWRlIHZpc2l0U2FmZVByb3BlcnR5UmVhZChhc3Q6IFNhZmVQcm9wZXJ0eVJlYWQsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgdGhpcy5tYXliZU1hcChhc3QsIGFzdC5uYW1lKTtcbiAgICByZXR1cm4gc3VwZXIudmlzaXRTYWZlUHJvcGVydHlSZWFkKGFzdCwgY29udGV4dCk7XG4gIH1cblxuICBvdmVycmlkZSB2aXNpdFByb3BlcnR5V3JpdGUoYXN0OiBQcm9wZXJ0eVdyaXRlLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHRoaXMubWF5YmVNYXAoYXN0LCBhc3QubmFtZSk7XG4gICAgcmV0dXJuIHN1cGVyLnZpc2l0UHJvcGVydHlXcml0ZShhc3QsIGNvbnRleHQpO1xuICB9XG5cbiAgcHJpdmF0ZSBpbmdlc3RTY29wZWROb2RlKG5vZGU6IFNjb3BlZE5vZGUpIHtcbiAgICBjb25zdCBjaGlsZFNjb3BlID0gdGhpcy5zY29wZS5nZXRDaGlsZFNjb3BlKG5vZGUpO1xuICAgIGNvbnN0IGJpbmRlciA9IG5ldyBUZW1wbGF0ZUJpbmRlcihcbiAgICAgIHRoaXMuYmluZGluZ3MsXG4gICAgICB0aGlzLnN5bWJvbHMsXG4gICAgICB0aGlzLnVzZWRQaXBlcyxcbiAgICAgIHRoaXMuZWFnZXJQaXBlcyxcbiAgICAgIHRoaXMuZGVmZXJCbG9ja3MsXG4gICAgICB0aGlzLm5lc3RpbmdMZXZlbCxcbiAgICAgIGNoaWxkU2NvcGUsXG4gICAgICBub2RlLFxuICAgICAgdGhpcy5sZXZlbCArIDEsXG4gICAgKTtcbiAgICBiaW5kZXIuaW5nZXN0KG5vZGUpO1xuICB9XG5cbiAgcHJpdmF0ZSBtYXliZU1hcChhc3Q6IFByb3BlcnR5UmVhZCB8IFNhZmVQcm9wZXJ0eVJlYWQgfCBQcm9wZXJ0eVdyaXRlLCBuYW1lOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAvLyBJZiB0aGUgcmVjZWl2ZXIgb2YgdGhlIGV4cHJlc3Npb24gaXNuJ3QgdGhlIGBJbXBsaWNpdFJlY2VpdmVyYCwgdGhpcyBpc24ndCB0aGUgcm9vdCBvZiBhblxuICAgIC8vIGBBU1RgIGV4cHJlc3Npb24gdGhhdCBtYXBzIHRvIGEgYFZhcmlhYmxlYCBvciBgUmVmZXJlbmNlYC5cbiAgICBpZiAoIShhc3QucmVjZWl2ZXIgaW5zdGFuY2VvZiBJbXBsaWNpdFJlY2VpdmVyKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIENoZWNrIHdoZXRoZXIgdGhlIG5hbWUgZXhpc3RzIGluIHRoZSBjdXJyZW50IHNjb3BlLiBJZiBzbywgbWFwIGl0LiBPdGhlcndpc2UsIHRoZSBuYW1lIGlzXG4gICAgLy8gcHJvYmFibHkgYSBwcm9wZXJ0eSBvbiB0aGUgdG9wLWxldmVsIGNvbXBvbmVudCBjb250ZXh0LlxuICAgIGNvbnN0IHRhcmdldCA9IHRoaXMuc2NvcGUubG9va3VwKG5hbWUpO1xuXG4gICAgLy8gSXQncyBub3QgYWxsb3dlZCB0byByZWFkIHRlbXBsYXRlIGVudGl0aWVzIHZpYSBgdGhpc2AsIGhvd2V2ZXIgaXQgcHJldmlvdXNseSB3b3JrZWQgYnlcbiAgICAvLyBhY2NpZGVudCAoc2VlICM1NTExNSkuIFNpbmNlIGBAbGV0YCBkZWNsYXJhdGlvbnMgYXJlIG5ldywgd2UgY2FuIGZpeCBpdCBmcm9tIHRoZSBiZWdpbm5pbmcsXG4gICAgLy8gd2hlcmVhcyBwcmUtZXhpc3RpbmcgdGVtcGxhdGUgZW50aXRpZXMgd2lsbCBiZSBmaXhlZCBpbiAjNTUxMTUuXG4gICAgaWYgKHRhcmdldCBpbnN0YW5jZW9mIExldERlY2xhcmF0aW9uICYmIGFzdC5yZWNlaXZlciBpbnN0YW5jZW9mIFRoaXNSZWNlaXZlcikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0YXJnZXQgIT09IG51bGwpIHtcbiAgICAgIHRoaXMuYmluZGluZ3Muc2V0KGFzdCwgdGFyZ2V0KTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBNZXRhZGF0YSBjb250YWluZXIgZm9yIGEgYFRhcmdldGAgdGhhdCBhbGxvd3MgcXVlcmllcyBmb3Igc3BlY2lmaWMgYml0cyBvZiBtZXRhZGF0YS5cbiAqXG4gKiBTZWUgYEJvdW5kVGFyZ2V0YCBmb3IgZG9jdW1lbnRhdGlvbiBvbiB0aGUgaW5kaXZpZHVhbCBtZXRob2RzLlxuICovXG5leHBvcnQgY2xhc3MgUjNCb3VuZFRhcmdldDxEaXJlY3RpdmVUIGV4dGVuZHMgRGlyZWN0aXZlTWV0YT4gaW1wbGVtZW50cyBCb3VuZFRhcmdldDxEaXJlY3RpdmVUPiB7XG4gIC8qKiBEZWZlcnJlZCBibG9ja3MsIG9yZGVyZWQgYXMgdGhleSBhcHBlYXIgaW4gdGhlIHRlbXBsYXRlLiAqL1xuICBwcml2YXRlIGRlZmVycmVkQmxvY2tzOiBEZWZlcnJlZEJsb2NrW107XG5cbiAgLyoqIE1hcCBvZiBkZWZlcnJlZCBibG9ja3MgdG8gdGhlaXIgc2NvcGUuICovXG4gIHByaXZhdGUgZGVmZXJyZWRTY29wZXM6IE1hcDxEZWZlcnJlZEJsb2NrLCBTY29wZT47XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcmVhZG9ubHkgdGFyZ2V0OiBUYXJnZXQsXG4gICAgcHJpdmF0ZSBkaXJlY3RpdmVzOiBNYXA8RWxlbWVudCB8IFRlbXBsYXRlLCBEaXJlY3RpdmVUW10+LFxuICAgIHByaXZhdGUgZWFnZXJEaXJlY3RpdmVzOiBEaXJlY3RpdmVUW10sXG4gICAgcHJpdmF0ZSBiaW5kaW5nczogTWFwPFxuICAgICAgQm91bmRBdHRyaWJ1dGUgfCBCb3VuZEV2ZW50IHwgVGV4dEF0dHJpYnV0ZSxcbiAgICAgIERpcmVjdGl2ZVQgfCBFbGVtZW50IHwgVGVtcGxhdGVcbiAgICA+LFxuICAgIHByaXZhdGUgcmVmZXJlbmNlczogTWFwPFxuICAgICAgQm91bmRBdHRyaWJ1dGUgfCBCb3VuZEV2ZW50IHwgUmVmZXJlbmNlIHwgVGV4dEF0dHJpYnV0ZSxcbiAgICAgIHtkaXJlY3RpdmU6IERpcmVjdGl2ZVQ7IG5vZGU6IEVsZW1lbnQgfCBUZW1wbGF0ZX0gfCBFbGVtZW50IHwgVGVtcGxhdGVcbiAgICA+LFxuICAgIHByaXZhdGUgZXhwclRhcmdldHM6IE1hcDxBU1QsIFRlbXBsYXRlRW50aXR5PixcbiAgICBwcml2YXRlIHN5bWJvbHM6IE1hcDxUZW1wbGF0ZUVudGl0eSwgVGVtcGxhdGU+LFxuICAgIHByaXZhdGUgbmVzdGluZ0xldmVsOiBNYXA8U2NvcGVkTm9kZSwgbnVtYmVyPixcbiAgICBwcml2YXRlIHNjb3BlZE5vZGVFbnRpdGllczogTWFwPFNjb3BlZE5vZGUgfCBudWxsLCBSZWFkb25seVNldDxUZW1wbGF0ZUVudGl0eT4+LFxuICAgIHByaXZhdGUgdXNlZFBpcGVzOiBTZXQ8c3RyaW5nPixcbiAgICBwcml2YXRlIGVhZ2VyUGlwZXM6IFNldDxzdHJpbmc+LFxuICAgIHJhd0RlZmVycmVkOiBbRGVmZXJyZWRCbG9jaywgU2NvcGVdW10sXG4gICkge1xuICAgIHRoaXMuZGVmZXJyZWRCbG9ja3MgPSByYXdEZWZlcnJlZC5tYXAoKGN1cnJlbnQpID0+IGN1cnJlbnRbMF0pO1xuICAgIHRoaXMuZGVmZXJyZWRTY29wZXMgPSBuZXcgTWFwKHJhd0RlZmVycmVkKTtcbiAgfVxuXG4gIGdldEVudGl0aWVzSW5TY29wZShub2RlOiBTY29wZWROb2RlIHwgbnVsbCk6IFJlYWRvbmx5U2V0PFRlbXBsYXRlRW50aXR5PiB7XG4gICAgcmV0dXJuIHRoaXMuc2NvcGVkTm9kZUVudGl0aWVzLmdldChub2RlKSA/PyBuZXcgU2V0KCk7XG4gIH1cblxuICBnZXREaXJlY3RpdmVzT2ZOb2RlKG5vZGU6IEVsZW1lbnQgfCBUZW1wbGF0ZSk6IERpcmVjdGl2ZVRbXSB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLmRpcmVjdGl2ZXMuZ2V0KG5vZGUpIHx8IG51bGw7XG4gIH1cblxuICBnZXRSZWZlcmVuY2VUYXJnZXQocmVmOiBSZWZlcmVuY2UpOiBSZWZlcmVuY2VUYXJnZXQ8RGlyZWN0aXZlVD4gfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5yZWZlcmVuY2VzLmdldChyZWYpIHx8IG51bGw7XG4gIH1cblxuICBnZXRDb25zdW1lck9mQmluZGluZyhcbiAgICBiaW5kaW5nOiBCb3VuZEF0dHJpYnV0ZSB8IEJvdW5kRXZlbnQgfCBUZXh0QXR0cmlidXRlLFxuICApOiBEaXJlY3RpdmVUIHwgRWxlbWVudCB8IFRlbXBsYXRlIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuYmluZGluZ3MuZ2V0KGJpbmRpbmcpIHx8IG51bGw7XG4gIH1cblxuICBnZXRFeHByZXNzaW9uVGFyZ2V0KGV4cHI6IEFTVCk6IFRlbXBsYXRlRW50aXR5IHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuZXhwclRhcmdldHMuZ2V0KGV4cHIpIHx8IG51bGw7XG4gIH1cblxuICBnZXREZWZpbml0aW9uTm9kZU9mU3ltYm9sKHN5bWJvbDogVGVtcGxhdGVFbnRpdHkpOiBTY29wZWROb2RlIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuc3ltYm9scy5nZXQoc3ltYm9sKSB8fCBudWxsO1xuICB9XG5cbiAgZ2V0TmVzdGluZ0xldmVsKG5vZGU6IFNjb3BlZE5vZGUpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLm5lc3RpbmdMZXZlbC5nZXQobm9kZSkgfHwgMDtcbiAgfVxuXG4gIGdldFVzZWREaXJlY3RpdmVzKCk6IERpcmVjdGl2ZVRbXSB7XG4gICAgY29uc3Qgc2V0ID0gbmV3IFNldDxEaXJlY3RpdmVUPigpO1xuICAgIHRoaXMuZGlyZWN0aXZlcy5mb3JFYWNoKChkaXJzKSA9PiBkaXJzLmZvckVhY2goKGRpcikgPT4gc2V0LmFkZChkaXIpKSk7XG4gICAgcmV0dXJuIEFycmF5LmZyb20oc2V0LnZhbHVlcygpKTtcbiAgfVxuXG4gIGdldEVhZ2VybHlVc2VkRGlyZWN0aXZlcygpOiBEaXJlY3RpdmVUW10ge1xuICAgIGNvbnN0IHNldCA9IG5ldyBTZXQ8RGlyZWN0aXZlVD4odGhpcy5lYWdlckRpcmVjdGl2ZXMpO1xuICAgIHJldHVybiBBcnJheS5mcm9tKHNldC52YWx1ZXMoKSk7XG4gIH1cblxuICBnZXRVc2VkUGlwZXMoKTogc3RyaW5nW10ge1xuICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMudXNlZFBpcGVzKTtcbiAgfVxuXG4gIGdldEVhZ2VybHlVc2VkUGlwZXMoKTogc3RyaW5nW10ge1xuICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMuZWFnZXJQaXBlcyk7XG4gIH1cblxuICBnZXREZWZlckJsb2NrcygpOiBEZWZlcnJlZEJsb2NrW10ge1xuICAgIHJldHVybiB0aGlzLmRlZmVycmVkQmxvY2tzO1xuICB9XG5cbiAgZ2V0RGVmZXJyZWRUcmlnZ2VyVGFyZ2V0KGJsb2NrOiBEZWZlcnJlZEJsb2NrLCB0cmlnZ2VyOiBEZWZlcnJlZFRyaWdnZXIpOiBFbGVtZW50IHwgbnVsbCB7XG4gICAgLy8gT25seSB0cmlnZ2VycyB0aGF0IHJlZmVyIHRvIERPTSBub2RlcyBjYW4gYmUgcmVzb2x2ZWQuXG4gICAgaWYgKFxuICAgICAgISh0cmlnZ2VyIGluc3RhbmNlb2YgSW50ZXJhY3Rpb25EZWZlcnJlZFRyaWdnZXIpICYmXG4gICAgICAhKHRyaWdnZXIgaW5zdGFuY2VvZiBWaWV3cG9ydERlZmVycmVkVHJpZ2dlcikgJiZcbiAgICAgICEodHJpZ2dlciBpbnN0YW5jZW9mIEhvdmVyRGVmZXJyZWRUcmlnZ2VyKVxuICAgICkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgbmFtZSA9IHRyaWdnZXIucmVmZXJlbmNlO1xuXG4gICAgaWYgKG5hbWUgPT09IG51bGwpIHtcbiAgICAgIGxldCB0cmlnZ2VyOiBFbGVtZW50IHwgbnVsbCA9IG51bGw7XG5cbiAgICAgIGlmIChibG9jay5wbGFjZWhvbGRlciAhPT0gbnVsbCkge1xuICAgICAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIGJsb2NrLnBsYWNlaG9sZGVyLmNoaWxkcmVuKSB7XG4gICAgICAgICAgLy8gU2tpcCBvdmVyIGNvbW1lbnQgbm9kZXMuIEN1cnJlbnRseSBieSBkZWZhdWx0IHRoZSB0ZW1wbGF0ZSBwYXJzZXIgZG9lc24ndCBjYXB0dXJlXG4gICAgICAgICAgLy8gY29tbWVudHMsIGJ1dCB3ZSBoYXZlIGEgc2FmZWd1YXJkIGhlcmUganVzdCBpbiBjYXNlIHNpbmNlIGl0IGNhbiBiZSBlbmFibGVkLlxuICAgICAgICAgIGlmIChjaGlsZCBpbnN0YW5jZW9mIENvbW1lbnQpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFdlIGNhbiBvbmx5IGluZmVyIHRoZSB0cmlnZ2VyIGlmIHRoZXJlJ3Mgb25lIHJvb3QgZWxlbWVudCBub2RlLiBBbnkgb3RoZXJcbiAgICAgICAgICAvLyBub2RlcyBhdCB0aGUgcm9vdCBtYWtlIGl0IHNvIHRoYXQgd2UgY2FuJ3QgaW5mZXIgdGhlIHRyaWdnZXIgYW55bW9yZS5cbiAgICAgICAgICBpZiAodHJpZ2dlciAhPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGNoaWxkIGluc3RhbmNlb2YgRWxlbWVudCkge1xuICAgICAgICAgICAgdHJpZ2dlciA9IGNoaWxkO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdHJpZ2dlcjtcbiAgICB9XG5cbiAgICBjb25zdCBvdXRzaWRlUmVmID0gdGhpcy5maW5kRW50aXR5SW5TY29wZShibG9jaywgbmFtZSk7XG5cbiAgICAvLyBGaXJzdCB0cnkgdG8gcmVzb2x2ZSB0aGUgdGFyZ2V0IGluIHRoZSBzY29wZSBvZiB0aGUgbWFpbiBkZWZlcnJlZCBibG9jay4gTm90ZSB0aGF0IHdlXG4gICAgLy8gc2tpcCB0cmlnZ2VycyBkZWZpbmVkIGluc2lkZSB0aGUgbWFpbiBibG9jayBpdHNlbGYsIGJlY2F1c2UgdGhleSBtaWdodCBub3QgZXhpc3QgeWV0LlxuICAgIGlmIChvdXRzaWRlUmVmIGluc3RhbmNlb2YgUmVmZXJlbmNlICYmIHRoaXMuZ2V0RGVmaW5pdGlvbk5vZGVPZlN5bWJvbChvdXRzaWRlUmVmKSAhPT0gYmxvY2spIHtcbiAgICAgIGNvbnN0IHRhcmdldCA9IHRoaXMuZ2V0UmVmZXJlbmNlVGFyZ2V0KG91dHNpZGVSZWYpO1xuXG4gICAgICBpZiAodGFyZ2V0ICE9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlZmVyZW5jZVRhcmdldFRvRWxlbWVudCh0YXJnZXQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIElmIHRoZSB0cmlnZ2VyIGNvdWxkbid0IGJlIGZvdW5kIGluIHRoZSBtYWluIGJsb2NrLCBjaGVjayB0aGVcbiAgICAvLyBwbGFjZWhvbGRlciBibG9jayB3aGljaCBpcyBzaG93biBiZWZvcmUgdGhlIG1haW4gYmxvY2sgaGFzIGxvYWRlZC5cbiAgICBpZiAoYmxvY2sucGxhY2Vob2xkZXIgIT09IG51bGwpIHtcbiAgICAgIGNvbnN0IHJlZkluUGxhY2Vob2xkZXIgPSB0aGlzLmZpbmRFbnRpdHlJblNjb3BlKGJsb2NrLnBsYWNlaG9sZGVyLCBuYW1lKTtcbiAgICAgIGNvbnN0IHRhcmdldEluUGxhY2Vob2xkZXIgPVxuICAgICAgICByZWZJblBsYWNlaG9sZGVyIGluc3RhbmNlb2YgUmVmZXJlbmNlID8gdGhpcy5nZXRSZWZlcmVuY2VUYXJnZXQocmVmSW5QbGFjZWhvbGRlcikgOiBudWxsO1xuXG4gICAgICBpZiAodGFyZ2V0SW5QbGFjZWhvbGRlciAhPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yZWZlcmVuY2VUYXJnZXRUb0VsZW1lbnQodGFyZ2V0SW5QbGFjZWhvbGRlcik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBpc0RlZmVycmVkKGVsZW1lbnQ6IEVsZW1lbnQpOiBib29sZWFuIHtcbiAgICBmb3IgKGNvbnN0IGJsb2NrIG9mIHRoaXMuZGVmZXJyZWRCbG9ja3MpIHtcbiAgICAgIGlmICghdGhpcy5kZWZlcnJlZFNjb3Blcy5oYXMoYmxvY2spKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBzdGFjazogU2NvcGVbXSA9IFt0aGlzLmRlZmVycmVkU2NvcGVzLmdldChibG9jaykhXTtcblxuICAgICAgd2hpbGUgKHN0YWNrLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QgY3VycmVudCA9IHN0YWNrLnBvcCgpITtcblxuICAgICAgICBpZiAoY3VycmVudC5lbGVtZW50c0luU2NvcGUuaGFzKGVsZW1lbnQpKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBzdGFjay5wdXNoKC4uLmN1cnJlbnQuY2hpbGRTY29wZXMudmFsdWVzKCkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGaW5kcyBhbiBlbnRpdHkgd2l0aCBhIHNwZWNpZmljIG5hbWUgaW4gYSBzY29wZS5cbiAgICogQHBhcmFtIHJvb3ROb2RlIFJvb3Qgbm9kZSBvZiB0aGUgc2NvcGUuXG4gICAqIEBwYXJhbSBuYW1lIE5hbWUgb2YgdGhlIGVudGl0eS5cbiAgICovXG4gIHByaXZhdGUgZmluZEVudGl0eUluU2NvcGUocm9vdE5vZGU6IFNjb3BlZE5vZGUsIG5hbWU6IHN0cmluZyk6IFRlbXBsYXRlRW50aXR5IHwgbnVsbCB7XG4gICAgY29uc3QgZW50aXRpZXMgPSB0aGlzLmdldEVudGl0aWVzSW5TY29wZShyb290Tm9kZSk7XG5cbiAgICBmb3IgKGNvbnN0IGVudGl0eSBvZiBlbnRpdGllcykge1xuICAgICAgaWYgKGVudGl0eS5uYW1lID09PSBuYW1lKSB7XG4gICAgICAgIHJldHVybiBlbnRpdHk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKiogQ29lcmNlcyBhIGBSZWZlcmVuY2VUYXJnZXRgIHRvIGFuIGBFbGVtZW50YCwgaWYgcG9zc2libGUuICovXG4gIHByaXZhdGUgcmVmZXJlbmNlVGFyZ2V0VG9FbGVtZW50KHRhcmdldDogUmVmZXJlbmNlVGFyZ2V0PERpcmVjdGl2ZVQ+KTogRWxlbWVudCB8IG51bGwge1xuICAgIGlmICh0YXJnZXQgaW5zdGFuY2VvZiBFbGVtZW50KSB7XG4gICAgICByZXR1cm4gdGFyZ2V0O1xuICAgIH1cblxuICAgIGlmICh0YXJnZXQgaW5zdGFuY2VvZiBUZW1wbGF0ZSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMucmVmZXJlbmNlVGFyZ2V0VG9FbGVtZW50KHRhcmdldC5ub2RlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBleHRyYWN0U2NvcGVkTm9kZUVudGl0aWVzKHJvb3RTY29wZTogU2NvcGUpOiBNYXA8U2NvcGVkTm9kZSB8IG51bGwsIFNldDxUZW1wbGF0ZUVudGl0eT4+IHtcbiAgY29uc3QgZW50aXR5TWFwID0gbmV3IE1hcDxTY29wZWROb2RlIHwgbnVsbCwgTWFwPHN0cmluZywgVGVtcGxhdGVFbnRpdHk+PigpO1xuXG4gIGZ1bmN0aW9uIGV4dHJhY3RTY29wZUVudGl0aWVzKHNjb3BlOiBTY29wZSk6IE1hcDxzdHJpbmcsIFRlbXBsYXRlRW50aXR5PiB7XG4gICAgaWYgKGVudGl0eU1hcC5oYXMoc2NvcGUucm9vdE5vZGUpKSB7XG4gICAgICByZXR1cm4gZW50aXR5TWFwLmdldChzY29wZS5yb290Tm9kZSkhO1xuICAgIH1cblxuICAgIGNvbnN0IGN1cnJlbnRFbnRpdGllcyA9IHNjb3BlLm5hbWVkRW50aXRpZXM7XG5cbiAgICBsZXQgZW50aXRpZXM6IE1hcDxzdHJpbmcsIFRlbXBsYXRlRW50aXR5PjtcbiAgICBpZiAoc2NvcGUucGFyZW50U2NvcGUgIT09IG51bGwpIHtcbiAgICAgIGVudGl0aWVzID0gbmV3IE1hcChbLi4uZXh0cmFjdFNjb3BlRW50aXRpZXMoc2NvcGUucGFyZW50U2NvcGUpLCAuLi5jdXJyZW50RW50aXRpZXNdKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZW50aXRpZXMgPSBuZXcgTWFwKGN1cnJlbnRFbnRpdGllcyk7XG4gICAgfVxuXG4gICAgZW50aXR5TWFwLnNldChzY29wZS5yb290Tm9kZSwgZW50aXRpZXMpO1xuICAgIHJldHVybiBlbnRpdGllcztcbiAgfVxuXG4gIGNvbnN0IHNjb3Blc1RvUHJvY2VzczogU2NvcGVbXSA9IFtyb290U2NvcGVdO1xuICB3aGlsZSAoc2NvcGVzVG9Qcm9jZXNzLmxlbmd0aCA+IDApIHtcbiAgICBjb25zdCBzY29wZSA9IHNjb3Blc1RvUHJvY2Vzcy5wb3AoKSE7XG4gICAgZm9yIChjb25zdCBjaGlsZFNjb3BlIG9mIHNjb3BlLmNoaWxkU2NvcGVzLnZhbHVlcygpKSB7XG4gICAgICBzY29wZXNUb1Byb2Nlc3MucHVzaChjaGlsZFNjb3BlKTtcbiAgICB9XG4gICAgZXh0cmFjdFNjb3BlRW50aXRpZXMoc2NvcGUpO1xuICB9XG5cbiAgY29uc3QgdGVtcGxhdGVFbnRpdGllcyA9IG5ldyBNYXA8U2NvcGVkTm9kZSB8IG51bGwsIFNldDxUZW1wbGF0ZUVudGl0eT4+KCk7XG4gIGZvciAoY29uc3QgW3RlbXBsYXRlLCBlbnRpdGllc10gb2YgZW50aXR5TWFwKSB7XG4gICAgdGVtcGxhdGVFbnRpdGllcy5zZXQodGVtcGxhdGUsIG5ldyBTZXQoZW50aXRpZXMudmFsdWVzKCkpKTtcbiAgfVxuICByZXR1cm4gdGVtcGxhdGVFbnRpdGllcztcbn1cbiJdfQ==