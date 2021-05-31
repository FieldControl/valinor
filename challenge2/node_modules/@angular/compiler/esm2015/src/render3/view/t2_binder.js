/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AST, ImplicitReceiver, RecursiveAstVisitor } from '../../expression_parser/ast';
import { Template } from '../r3_ast';
import { createCssSelector } from './template';
import { getAttrsForDirectiveMatching } from './util';
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
        const templateEntities = extractTemplateEntities(scope);
        // Next, perform directive matching on the template using the `DirectiveBinder`. This returns:
        //   - directives: Map of nodes (elements & ng-templates) to the directives on them.
        //   - bindings: Map of inputs, outputs, and attributes to the directive/element that claims
        //     them. TODO(alxhub): handle multiple directives claiming an input/output/etc.
        //   - references: Map of #references to their targets.
        const { directives, bindings, references } = DirectiveBinder.apply(target.template, this.directiveMatcher);
        // Finally, run the TemplateBinder to bind references, variables, and other entities within the
        // template. This extracts all the metadata that doesn't depend on directive matching.
        const { expressions, symbols, nestingLevel, usedPipes } = TemplateBinder.apply(target.template, scope);
        return new R3BoundTarget(target, directives, bindings, references, expressions, symbols, nestingLevel, templateEntities, usedPipes);
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
    constructor(parentScope, template) {
        this.parentScope = parentScope;
        this.template = template;
        /**
         * Named members of the `Scope`, such as `Reference`s or `Variable`s.
         */
        this.namedEntities = new Map();
        /**
         * Child `Scope`s for immediately nested `Template`s.
         */
        this.childScopes = new Map();
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
     * Internal method to process the template and populate the `Scope`.
     */
    ingest(template) {
        if (template instanceof Template) {
            // Variables on an <ng-template> are defined in the inner scope.
            template.variables.forEach(node => this.visitVariable(node));
            // Process the nodes of the template.
            template.children.forEach(node => node.visit(this));
        }
        else {
            // No overarching `Template` instance, so process the nodes directly.
            template.forEach(node => node.visit(this));
        }
    }
    visitElement(element) {
        // `Element`s in the template may have `Reference`s which are captured in the scope.
        element.references.forEach(node => this.visitReference(node));
        // Recurse into the `Element`'s children.
        element.children.forEach(node => node.visit(this));
    }
    visitTemplate(template) {
        // References on a <ng-template> are defined in the outer scope, so capture them before
        // processing the template's child scope.
        template.references.forEach(node => this.visitReference(node));
        // Next, create an inner scope and process the template within it.
        const scope = new Scope(this, template);
        scope.ingest(template);
        this.childScopes.set(template, scope);
    }
    visitVariable(variable) {
        // Declare the variable if it's not already.
        this.maybeDeclare(variable);
    }
    visitReference(reference) {
        // Declare the variable if it's not already.
        this.maybeDeclare(reference);
    }
    // Unused visitors.
    visitContent(content) { }
    visitBoundAttribute(attr) { }
    visitBoundEvent(event) { }
    visitBoundText(text) { }
    visitText(text) { }
    visitTextAttribute(attr) { }
    visitIcu(icu) { }
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
     * Get the child scope for a `Template`.
     *
     * This should always be defined.
     */
    getChildScope(template) {
        const res = this.childScopes.get(template);
        if (res === undefined) {
            throw new Error(`Assertion error: child scope for ${template} not found`);
        }
        return res;
    }
}
/**
 * Processes a template and matches directives on nodes (elements and templates).
 *
 * Usually used via the static `apply()` method.
 */
class DirectiveBinder {
    constructor(matcher, directives, bindings, references) {
        this.matcher = matcher;
        this.directives = directives;
        this.bindings = bindings;
        this.references = references;
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
        const matcher = new DirectiveBinder(selectorMatcher, directives, bindings, references);
        matcher.ingest(template);
        return { directives, bindings, references };
    }
    ingest(template) {
        template.forEach(node => node.visit(this));
    }
    visitElement(element) {
        this.visitElementOrTemplate(element.name, element);
    }
    visitTemplate(template) {
        this.visitElementOrTemplate('ng-template', template);
    }
    visitElementOrTemplate(elementName, node) {
        // First, determine the HTML shape of the node for the purpose of directive matching.
        // Do this by building up a `CssSelector` for the node.
        const cssSelector = createCssSelector(elementName, getAttrsForDirectiveMatching(node));
        // Next, use the `SelectorMatcher` to get the list of directives on the node.
        const directives = [];
        this.matcher.match(cssSelector, (_, directive) => directives.push(directive));
        if (directives.length > 0) {
            this.directives.set(node, directives);
        }
        // Resolve any references that are created on this node.
        node.references.forEach(ref => {
            let dirTarget = null;
            // If the reference expression is empty, then it matches the "primary" directive on the node
            // (if there is one). Otherwise it matches the host node itself (either an element or
            // <ng-template> node).
            if (ref.value.trim() === '') {
                // This could be a reference to a component if there is one.
                dirTarget = directives.find(dir => dir.isComponent) || null;
            }
            else {
                // This should be a reference to a directive exported via exportAs.
                dirTarget =
                    directives.find(dir => dir.exportAs !== null && dir.exportAs.some(value => value === ref.value)) ||
                        null;
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
            const dir = directives.find(dir => dir[ioType].hasBindingPropertyName(attribute.name));
            const binding = dir !== undefined ? dir : node;
            this.bindings.set(attribute, binding);
        };
        // Node inputs (bound attributes) and text attributes can be bound to an
        // input on a directive.
        node.inputs.forEach(input => setAttributeBinding(input, 'inputs'));
        node.attributes.forEach(attr => setAttributeBinding(attr, 'inputs'));
        if (node instanceof Template) {
            node.templateAttrs.forEach(attr => setAttributeBinding(attr, 'inputs'));
        }
        // Node outputs (bound events) can be bound to an output on a directive.
        node.outputs.forEach(output => setAttributeBinding(output, 'outputs'));
        // Recurse into the node's children.
        node.children.forEach(child => child.visit(this));
    }
    // Unused visitors.
    visitContent(content) { }
    visitVariable(variable) { }
    visitReference(reference) { }
    visitTextAttribute(attribute) { }
    visitBoundAttribute(attribute) { }
    visitBoundEvent(attribute) { }
    visitBoundAttributeOrEvent(node) { }
    visitText(text) { }
    visitBoundText(text) { }
    visitIcu(icu) { }
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
    constructor(bindings, symbols, usedPipes, nestingLevel, scope, template, level) {
        super();
        this.bindings = bindings;
        this.symbols = symbols;
        this.usedPipes = usedPipes;
        this.nestingLevel = nestingLevel;
        this.scope = scope;
        this.template = template;
        this.level = level;
        this.pipesUsed = [];
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
     * @param template the nodes of the template to process
     * @param scope the `Scope` of the template being processed.
     * @returns three maps which contain metadata about the template: `expressions` which interprets
     * special `AST` nodes in expressions as pointing to references or variables declared within the
     * template, `symbols` which maps those variables and references to the nested `Template` which
     * declares them, if any, and `nestingLevel` which associates each `Template` with a integer
     * nesting level (how many levels deep within the template structure the `Template` is), starting
     * at 1.
     */
    static apply(template, scope) {
        const expressions = new Map();
        const symbols = new Map();
        const nestingLevel = new Map();
        const usedPipes = new Set();
        // The top-level template has nesting level 0.
        const binder = new TemplateBinder(expressions, symbols, usedPipes, nestingLevel, scope, template instanceof Template ? template : null, 0);
        binder.ingest(template);
        return { expressions, symbols, nestingLevel, usedPipes };
    }
    ingest(template) {
        if (template instanceof Template) {
            // For <ng-template>s, process only variables and child nodes. Inputs, outputs, templateAttrs,
            // and references were all processed in the scope of the containing template.
            template.variables.forEach(this.visitNode);
            template.children.forEach(this.visitNode);
            // Set the nesting level.
            this.nestingLevel.set(template, this.level);
        }
        else {
            // Visit each node from the top-level template.
            template.forEach(this.visitNode);
        }
    }
    visitElement(element) {
        // Visit the inputs, outputs, and children of the element.
        element.inputs.forEach(this.visitNode);
        element.outputs.forEach(this.visitNode);
        element.children.forEach(this.visitNode);
    }
    visitTemplate(template) {
        // First, visit inputs, outputs and template attributes of the template node.
        template.inputs.forEach(this.visitNode);
        template.outputs.forEach(this.visitNode);
        template.templateAttrs.forEach(this.visitNode);
        // References are also evaluated in the outer context.
        template.references.forEach(this.visitNode);
        // Next, recurse into the template using its scope, and bumping the nesting level up by one.
        const childScope = this.scope.getChildScope(template);
        const binder = new TemplateBinder(this.bindings, this.symbols, this.usedPipes, this.nestingLevel, childScope, template, this.level + 1);
        binder.ingest(template);
    }
    visitVariable(variable) {
        // Register the `Variable` as a symbol in the current `Template`.
        if (this.template !== null) {
            this.symbols.set(variable, this.template);
        }
    }
    visitReference(reference) {
        // Register the `Reference` as a symbol in the current `Template`.
        if (this.template !== null) {
            this.symbols.set(reference, this.template);
        }
    }
    // Unused template visitors
    visitText(text) { }
    visitContent(content) { }
    visitTextAttribute(attribute) { }
    visitIcu(icu) {
        Object.keys(icu.vars).forEach(key => icu.vars[key].visit(this));
        Object.keys(icu.placeholders).forEach(key => icu.placeholders[key].visit(this));
    }
    // The remaining visitors are concerned with processing AST expressions within template bindings
    visitBoundAttribute(attribute) {
        attribute.value.visit(this);
    }
    visitBoundEvent(event) {
        event.handler.visit(this);
    }
    visitBoundText(text) {
        text.value.visit(this);
    }
    visitPipe(ast, context) {
        this.usedPipes.add(ast.name);
        return super.visitPipe(ast, context);
    }
    // These five types of AST expressions can refer to expression roots, which could be variables
    // or references in the current scope.
    visitPropertyRead(ast, context) {
        this.maybeMap(context, ast, ast.name);
        return super.visitPropertyRead(ast, context);
    }
    visitSafePropertyRead(ast, context) {
        this.maybeMap(context, ast, ast.name);
        return super.visitSafePropertyRead(ast, context);
    }
    visitPropertyWrite(ast, context) {
        this.maybeMap(context, ast, ast.name);
        return super.visitPropertyWrite(ast, context);
    }
    visitMethodCall(ast, context) {
        this.maybeMap(context, ast, ast.name);
        return super.visitMethodCall(ast, context);
    }
    visitSafeMethodCall(ast, context) {
        this.maybeMap(context, ast, ast.name);
        return super.visitSafeMethodCall(ast, context);
    }
    maybeMap(scope, ast, name) {
        // If the receiver of the expression isn't the `ImplicitReceiver`, this isn't the root of an
        // `AST` expression that maps to a `Variable` or `Reference`.
        if (!(ast.receiver instanceof ImplicitReceiver)) {
            return;
        }
        // Check whether the name exists in the current scope. If so, map it. Otherwise, the name is
        // probably a property on the top-level component context.
        let target = this.scope.lookup(name);
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
    constructor(target, directives, bindings, references, exprTargets, symbols, nestingLevel, templateEntities, usedPipes) {
        this.target = target;
        this.directives = directives;
        this.bindings = bindings;
        this.references = references;
        this.exprTargets = exprTargets;
        this.symbols = symbols;
        this.nestingLevel = nestingLevel;
        this.templateEntities = templateEntities;
        this.usedPipes = usedPipes;
    }
    getEntitiesInTemplateScope(template) {
        var _a;
        return (_a = this.templateEntities.get(template)) !== null && _a !== void 0 ? _a : new Set();
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
    getTemplateOfSymbol(symbol) {
        return this.symbols.get(symbol) || null;
    }
    getNestingLevel(template) {
        return this.nestingLevel.get(template) || 0;
    }
    getUsedDirectives() {
        const set = new Set();
        this.directives.forEach(dirs => dirs.forEach(dir => set.add(dir)));
        return Array.from(set.values());
    }
    getUsedPipes() {
        return Array.from(this.usedPipes);
    }
}
function extractTemplateEntities(rootScope) {
    const entityMap = new Map();
    function extractScopeEntities(scope) {
        if (entityMap.has(scope.template)) {
            return entityMap.get(scope.template);
        }
        const currentEntities = scope.namedEntities;
        let templateEntities;
        if (scope.parentScope !== null) {
            templateEntities = new Map([...extractScopeEntities(scope.parentScope), ...currentEntities]);
        }
        else {
            templateEntities = new Map(currentEntities);
        }
        entityMap.set(scope.template, templateEntities);
        return templateEntities;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidDJfYmluZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3JlbmRlcjMvdmlldy90Ml9iaW5kZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLEdBQUcsRUFBZSxnQkFBZ0IsRUFBMkMsbUJBQW1CLEVBQW1DLE1BQU0sNkJBQTZCLENBQUM7QUFFL0ssT0FBTyxFQUFnRixRQUFRLEVBQXlDLE1BQU0sV0FBVyxDQUFDO0FBRzFKLE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLFlBQVksQ0FBQztBQUM3QyxPQUFPLEVBQUMsNEJBQTRCLEVBQUMsTUFBTSxRQUFRLENBQUM7QUFHcEQ7Ozs7R0FJRztBQUNILE1BQU0sT0FBTyxjQUFjO0lBQ3pCLFlBQW9CLGdCQUE2QztRQUE3QyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQTZCO0lBQUcsQ0FBQztJQUVyRTs7O09BR0c7SUFDSCxJQUFJLENBQUMsTUFBYztRQUNqQixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRTtZQUNwQiw0RUFBNEU7WUFDNUUsTUFBTSxJQUFJLEtBQUssQ0FBQyw4Q0FBOEMsQ0FBQyxDQUFDO1NBQ2pFO1FBRUQsNEZBQTRGO1FBQzVGLGlFQUFpRTtRQUNqRSxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUczQyxrRkFBa0Y7UUFDbEYsTUFBTSxnQkFBZ0IsR0FBRyx1QkFBdUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUV4RCw4RkFBOEY7UUFDOUYsb0ZBQW9GO1FBQ3BGLDRGQUE0RjtRQUM1RixtRkFBbUY7UUFDbkYsdURBQXVEO1FBQ3ZELE1BQU0sRUFBQyxVQUFVLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBQyxHQUNwQyxlQUFlLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxR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M0UsS0FBSyxNQUFNLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxJQUFJLFNBQVMsRUFBRTtRQUM1QyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDNUQ7SUFDRCxPQUFPLGdCQUFnQixDQUFDO0FBQzFCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtBU1QsIEJpbmRpbmdQaXBlLCBJbXBsaWNpdFJlY2VpdmVyLCBNZXRob2RDYWxsLCBQcm9wZXJ0eVJlYWQsIFByb3BlcnR5V3JpdGUsIFJlY3Vyc2l2ZUFzdFZpc2l0b3IsIFNhZmVNZXRob2RDYWxsLCBTYWZlUHJvcGVydHlSZWFkfSBmcm9tICcuLi8uLi9leHByZXNzaW9uX3BhcnNlci9hc3QnO1xuaW1wb3J0IHtTZWxlY3Rvck1hdGNoZXJ9IGZyb20gJy4uLy4uL3NlbGVjdG9yJztcbmltcG9ydCB7Qm91bmRBdHRyaWJ1dGUsIEJvdW5kRXZlbnQsIEJvdW5kVGV4dCwgQ29udGVudCwgRWxlbWVudCwgSWN1LCBOb2RlLCBSZWZlcmVuY2UsIFRlbXBsYXRlLCBUZXh0LCBUZXh0QXR0cmlidXRlLCBWYXJpYWJsZSwgVmlzaXRvcn0gZnJvbSAnLi4vcjNfYXN0JztcblxuaW1wb3J0IHtCb3VuZFRhcmdldCwgRGlyZWN0aXZlTWV0YSwgVGFyZ2V0LCBUYXJnZXRCaW5kZXJ9IGZyb20gJy4vdDJfYXBpJztcbmltcG9ydCB7Y3JlYXRlQ3NzU2VsZWN0b3J9IGZyb20gJy4vdGVtcGxhdGUnO1xuaW1wb3J0IHtnZXRBdHRyc0ZvckRpcmVjdGl2ZU1hdGNoaW5nfSBmcm9tICcuL3V0aWwnO1xuXG5cbi8qKlxuICogUHJvY2Vzc2VzIGBUYXJnZXRgcyB3aXRoIGEgZ2l2ZW4gc2V0IG9mIGRpcmVjdGl2ZXMgYW5kIHBlcmZvcm1zIGEgYmluZGluZyBvcGVyYXRpb24sIHdoaWNoXG4gKiByZXR1cm5zIGFuIG9iamVjdCBzaW1pbGFyIHRvIFR5cGVTY3JpcHQncyBgdHMuVHlwZUNoZWNrZXJgIHRoYXQgY29udGFpbnMga25vd2xlZGdlIGFib3V0IHRoZVxuICogdGFyZ2V0LlxuICovXG5leHBvcnQgY2xhc3MgUjNUYXJnZXRCaW5kZXI8RGlyZWN0aXZlVCBleHRlbmRzIERpcmVjdGl2ZU1ldGE+IGltcGxlbWVudHMgVGFyZ2V0QmluZGVyPERpcmVjdGl2ZVQ+IHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBkaXJlY3RpdmVNYXRjaGVyOiBTZWxlY3Rvck1hdGNoZXI8RGlyZWN0aXZlVD4pIHt9XG5cbiAgLyoqXG4gICAqIFBlcmZvcm0gYSBiaW5kaW5nIG9wZXJhdGlvbiBvbiB0aGUgZ2l2ZW4gYFRhcmdldGAgYW5kIHJldHVybiBhIGBCb3VuZFRhcmdldGAgd2hpY2ggY29udGFpbnNcbiAgICogbWV0YWRhdGEgYWJvdXQgdGhlIHR5cGVzIHJlZmVyZW5jZWQgaW4gdGhlIHRlbXBsYXRlLlxuICAgKi9cbiAgYmluZCh0YXJnZXQ6IFRhcmdldCk6IEJvdW5kVGFyZ2V0PERpcmVjdGl2ZVQ+IHtcbiAgICBpZiAoIXRhcmdldC50ZW1wbGF0ZSkge1xuICAgICAgLy8gVE9ETyhhbHhodWIpOiBoYW5kbGUgdGFyZ2V0cyB3aGljaCBjb250YWluIHRoaW5ncyBsaWtlIEhvc3RCaW5kaW5ncywgZXRjLlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdCaW5kaW5nIHdpdGhvdXQgYSB0ZW1wbGF0ZSBub3QgeWV0IHN1cHBvcnRlZCcpO1xuICAgIH1cblxuICAgIC8vIEZpcnN0LCBwYXJzZSB0aGUgdGVtcGxhdGUgaW50byBhIGBTY29wZWAgc3RydWN0dXJlLiBUaGlzIG9wZXJhdGlvbiBjYXB0dXJlcyB0aGUgc3ludGFjdGljXG4gICAgLy8gc2NvcGVzIGluIHRoZSB0ZW1wbGF0ZSBhbmQgbWFrZXMgdGhlbSBhdmFpbGFibGUgZm9yIGxhdGVyIHVzZS5cbiAgICBjb25zdCBzY29wZSA9IFNjb3BlLmFwcGx5KHRhcmdldC50ZW1wbGF0ZSk7XG5cblxuICAgIC8vIFVzZSB0aGUgYFNjb3BlYCB0byBleHRyYWN0IHRoZSBlbnRpdGllcyBwcmVzZW50IGF0IGV2ZXJ5IGxldmVsIG9mIHRoZSB0ZW1wbGF0ZS5cbiAgICBjb25zdCB0ZW1wbGF0ZUVudGl0aWVzID0gZXh0cmFjdFRlbXBsYXRlRW50aXRpZXMoc2NvcGUpO1xuXG4gICAgLy8gTmV4dCwgcGVyZm9ybSBkaXJlY3RpdmUgbWF0Y2hpbmcgb24gdGhlIHRlbXBsYXRlIHVzaW5nIHRoZSBgRGlyZWN0aXZlQmluZGVyYC4gVGhpcyByZXR1cm5zOlxuICAgIC8vICAgLSBkaXJlY3RpdmVzOiBNYXAgb2Ygbm9kZXMgKGVsZW1lbnRzICYgbmctdGVtcGxhdGVzKSB0byB0aGUgZGlyZWN0aXZlcyBvbiB0aGVtLlxuICAgIC8vICAgLSBiaW5kaW5nczogTWFwIG9mIGlucHV0cywgb3V0cHV0cywgYW5kIGF0dHJpYnV0ZXMgdG8gdGhlIGRpcmVjdGl2ZS9lbGVtZW50IHRoYXQgY2xhaW1zXG4gICAgLy8gICAgIHRoZW0uIFRPRE8oYWx4aHViKTogaGFuZGxlIG11bHRpcGxlIGRpcmVjdGl2ZXMgY2xhaW1pbmcgYW4gaW5wdXQvb3V0cHV0L2V0Yy5cbiAgICAvLyAgIC0gcmVmZXJlbmNlczogTWFwIG9mICNyZWZlcmVuY2VzIHRvIHRoZWlyIHRhcmdldHMuXG4gICAgY29uc3Qge2RpcmVjdGl2ZXMsIGJpbmRpbmdzLCByZWZlcmVuY2VzfSA9XG4gICAgICAgIERpcmVjdGl2ZUJpbmRlci5hcHBseSh0YXJnZXQudGVtcGxhdGUsIHRoaXMuZGlyZWN0aXZlTWF0Y2hlcik7XG4gICAgLy8gRmluYWxseSwgcnVuIHRoZSBUZW1wbGF0ZUJpbmRlciB0byBiaW5kIHJlZmVyZW5jZXMsIHZhcmlhYmxlcywgYW5kIG90aGVyIGVudGl0aWVzIHdpdGhpbiB0aGVcbiAgICAvLyB0ZW1wbGF0ZS4gVGhpcyBleHRyYWN0cyBhbGwgdGhlIG1ldGFkYXRhIHRoYXQgZG9lc24ndCBkZXBlbmQgb24gZGlyZWN0aXZlIG1hdGNoaW5nLlxuICAgIGNvbnN0IHtleHByZXNzaW9ucywgc3ltYm9scywgbmVzdGluZ0xldmVsLCB1c2VkUGlwZXN9ID1cbiAgICAgICAgVGVtcGxhdGVCaW5kZXIuYXBwbHkodGFyZ2V0LnRlbXBsYXRlLCBzY29wZSk7XG4gICAgcmV0dXJuIG5ldyBSM0JvdW5kVGFyZ2V0KFxuICAgICAgICB0YXJnZXQsIGRpcmVjdGl2ZXMsIGJpbmRpbmdzLCByZWZlcmVuY2VzLCBleHByZXNzaW9ucywgc3ltYm9scywgbmVzdGluZ0xldmVsLFxuICAgICAgICB0ZW1wbGF0ZUVudGl0aWVzLCB1c2VkUGlwZXMpO1xuICB9XG59XG5cbi8qKlxuICogUmVwcmVzZW50cyBhIGJpbmRpbmcgc2NvcGUgd2l0aGluIGEgdGVtcGxhdGUuXG4gKlxuICogQW55IHZhcmlhYmxlcywgcmVmZXJlbmNlcywgb3Igb3RoZXIgbmFtZWQgZW50aXRpZXMgZGVjbGFyZWQgd2l0aGluIHRoZSB0ZW1wbGF0ZSB3aWxsXG4gKiBiZSBjYXB0dXJlZCBhbmQgYXZhaWxhYmxlIGJ5IG5hbWUgaW4gYG5hbWVkRW50aXRpZXNgLiBBZGRpdGlvbmFsbHksIGNoaWxkIHRlbXBsYXRlcyB3aWxsXG4gKiBiZSBhbmFseXplZCBhbmQgaGF2ZSB0aGVpciBjaGlsZCBgU2NvcGVgcyBhdmFpbGFibGUgaW4gYGNoaWxkU2NvcGVzYC5cbiAqL1xuY2xhc3MgU2NvcGUgaW1wbGVtZW50cyBWaXNpdG9yIHtcbiAgLyoqXG4gICAqIE5hbWVkIG1lbWJlcnMgb2YgdGhlIGBTY29wZWAsIHN1Y2ggYXMgYFJlZmVyZW5jZWBzIG9yIGBWYXJpYWJsZWBzLlxuICAgKi9cbiAgcmVhZG9ubHkgbmFtZWRFbnRpdGllcyA9IG5ldyBNYXA8c3RyaW5nLCBSZWZlcmVuY2V8VmFyaWFibGU+KCk7XG5cbiAgLyoqXG4gICAqIENoaWxkIGBTY29wZWBzIGZvciBpbW1lZGlhdGVseSBuZXN0ZWQgYFRlbXBsYXRlYHMuXG4gICAqL1xuICByZWFkb25seSBjaGlsZFNjb3BlcyA9IG5ldyBNYXA8VGVtcGxhdGUsIFNjb3BlPigpO1xuXG4gIHByaXZhdGUgY29uc3RydWN0b3IocmVhZG9ubHkgcGFyZW50U2NvcGU6IFNjb3BlfG51bGwsIHJlYWRvbmx5IHRlbXBsYXRlOiBUZW1wbGF0ZXxudWxsKSB7fVxuXG4gIHN0YXRpYyBuZXdSb290U2NvcGUoKTogU2NvcGUge1xuICAgIHJldHVybiBuZXcgU2NvcGUobnVsbCwgbnVsbCk7XG4gIH1cblxuICAvKipcbiAgICogUHJvY2VzcyBhIHRlbXBsYXRlIChlaXRoZXIgYXMgYSBgVGVtcGxhdGVgIHN1Yi10ZW1wbGF0ZSB3aXRoIHZhcmlhYmxlcywgb3IgYSBwbGFpbiBhcnJheSBvZlxuICAgKiB0ZW1wbGF0ZSBgTm9kZWBzKSBhbmQgY29uc3RydWN0IGl0cyBgU2NvcGVgLlxuICAgKi9cbiAgc3RhdGljIGFwcGx5KHRlbXBsYXRlOiBOb2RlW10pOiBTY29wZSB7XG4gICAgY29uc3Qgc2NvcGUgPSBTY29wZS5uZXdSb290U2NvcGUoKTtcbiAgICBzY29wZS5pbmdlc3QodGVtcGxhdGUpO1xuICAgIHJldHVybiBzY29wZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbnRlcm5hbCBtZXRob2QgdG8gcHJvY2VzcyB0aGUgdGVtcGxhdGUgYW5kIHBvcHVsYXRlIHRoZSBgU2NvcGVgLlxuICAgKi9cbiAgcHJpdmF0ZSBpbmdlc3QodGVtcGxhdGU6IFRlbXBsYXRlfE5vZGVbXSk6IHZvaWQge1xuICAgIGlmICh0ZW1wbGF0ZSBpbnN0YW5jZW9mIFRlbXBsYXRlKSB7XG4gICAgICAvLyBWYXJpYWJsZXMgb24gYW4gPG5nLXRlbXBsYXRlPiBhcmUgZGVmaW5lZCBpbiB0aGUgaW5uZXIgc2NvcGUuXG4gICAgICB0ZW1wbGF0ZS52YXJpYWJsZXMuZm9yRWFjaChub2RlID0+IHRoaXMudmlzaXRWYXJpYWJsZShub2RlKSk7XG5cbiAgICAgIC8vIFByb2Nlc3MgdGhlIG5vZGVzIG9mIHRoZSB0ZW1wbGF0ZS5cbiAgICAgIHRlbXBsYXRlLmNoaWxkcmVuLmZvckVhY2gobm9kZSA9PiBub2RlLnZpc2l0KHRoaXMpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gTm8gb3ZlcmFyY2hpbmcgYFRlbXBsYXRlYCBpbnN0YW5jZSwgc28gcHJvY2VzcyB0aGUgbm9kZXMgZGlyZWN0bHkuXG4gICAgICB0ZW1wbGF0ZS5mb3JFYWNoKG5vZGUgPT4gbm9kZS52aXNpdCh0aGlzKSk7XG4gICAgfVxuICB9XG5cbiAgdmlzaXRFbGVtZW50KGVsZW1lbnQ6IEVsZW1lbnQpIHtcbiAgICAvLyBgRWxlbWVudGBzIGluIHRoZSB0ZW1wbGF0ZSBtYXkgaGF2ZSBgUmVmZXJlbmNlYHMgd2hpY2ggYXJlIGNhcHR1cmVkIGluIHRoZSBzY29wZS5cbiAgICBlbGVtZW50LnJlZmVyZW5jZXMuZm9yRWFjaChub2RlID0+IHRoaXMudmlzaXRSZWZlcmVuY2Uobm9kZSkpO1xuXG4gICAgLy8gUmVjdXJzZSBpbnRvIHRoZSBgRWxlbWVudGAncyBjaGlsZHJlbi5cbiAgICBlbGVtZW50LmNoaWxkcmVuLmZvckVhY2gobm9kZSA9PiBub2RlLnZpc2l0KHRoaXMpKTtcbiAgfVxuXG4gIHZpc2l0VGVtcGxhdGUodGVtcGxhdGU6IFRlbXBsYXRlKSB7XG4gICAgLy8gUmVmZXJlbmNlcyBvbiBhIDxuZy10ZW1wbGF0ZT4gYXJlIGRlZmluZWQgaW4gdGhlIG91dGVyIHNjb3BlLCBzbyBjYXB0dXJlIHRoZW0gYmVmb3JlXG4gICAgLy8gcHJvY2Vzc2luZyB0aGUgdGVtcGxhdGUncyBjaGlsZCBzY29wZS5cbiAgICB0ZW1wbGF0ZS5yZWZlcmVuY2VzLmZvckVhY2gobm9kZSA9PiB0aGlzLnZpc2l0UmVmZXJlbmNlKG5vZGUpKTtcblxuICAgIC8vIE5leHQsIGNyZWF0ZSBhbiBpbm5lciBzY29wZSBhbmQgcHJvY2VzcyB0aGUgdGVtcGxhdGUgd2l0aGluIGl0LlxuICAgIGNvbnN0IHNjb3BlID0gbmV3IFNjb3BlKHRoaXMsIHRlbXBsYXRlKTtcbiAgICBzY29wZS5pbmdlc3QodGVtcGxhdGUpO1xuICAgIHRoaXMuY2hpbGRTY29wZXMuc2V0KHRlbXBsYXRlLCBzY29wZSk7XG4gIH1cblxuICB2aXNpdFZhcmlhYmxlKHZhcmlhYmxlOiBWYXJpYWJsZSkge1xuICAgIC8vIERlY2xhcmUgdGhlIHZhcmlhYmxlIGlmIGl0J3Mgbm90IGFscmVhZHkuXG4gICAgdGhpcy5tYXliZURlY2xhcmUodmFyaWFibGUpO1xuICB9XG5cbiAgdmlzaXRSZWZlcmVuY2UocmVmZXJlbmNlOiBSZWZlcmVuY2UpIHtcbiAgICAvLyBEZWNsYXJlIHRoZSB2YXJpYWJsZSBpZiBpdCdzIG5vdCBhbHJlYWR5LlxuICAgIHRoaXMubWF5YmVEZWNsYXJlKHJlZmVyZW5jZSk7XG4gIH1cblxuICAvLyBVbnVzZWQgdmlzaXRvcnMuXG4gIHZpc2l0Q29udGVudChjb250ZW50OiBDb250ZW50KSB7fVxuICB2aXNpdEJvdW5kQXR0cmlidXRlKGF0dHI6IEJvdW5kQXR0cmlidXRlKSB7fVxuICB2aXNpdEJvdW5kRXZlbnQoZXZlbnQ6IEJvdW5kRXZlbnQpIHt9XG4gIHZpc2l0Qm91bmRUZXh0KHRleHQ6IEJvdW5kVGV4dCkge31cbiAgdmlzaXRUZXh0KHRleHQ6IFRleHQpIHt9XG4gIHZpc2l0VGV4dEF0dHJpYnV0ZShhdHRyOiBUZXh0QXR0cmlidXRlKSB7fVxuICB2aXNpdEljdShpY3U6IEljdSkge31cblxuICBwcml2YXRlIG1heWJlRGVjbGFyZSh0aGluZzogUmVmZXJlbmNlfFZhcmlhYmxlKSB7XG4gICAgLy8gRGVjbGFyZSBzb21ldGhpbmcgd2l0aCBhIG5hbWUsIGFzIGxvbmcgYXMgdGhhdCBuYW1lIGlzbid0IHRha2VuLlxuICAgIGlmICghdGhpcy5uYW1lZEVudGl0aWVzLmhhcyh0aGluZy5uYW1lKSkge1xuICAgICAgdGhpcy5uYW1lZEVudGl0aWVzLnNldCh0aGluZy5uYW1lLCB0aGluZyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIExvb2sgdXAgYSB2YXJpYWJsZSB3aXRoaW4gdGhpcyBgU2NvcGVgLlxuICAgKlxuICAgKiBUaGlzIGNhbiByZWN1cnNlIGludG8gYSBwYXJlbnQgYFNjb3BlYCBpZiBpdCdzIGF2YWlsYWJsZS5cbiAgICovXG4gIGxvb2t1cChuYW1lOiBzdHJpbmcpOiBSZWZlcmVuY2V8VmFyaWFibGV8bnVsbCB7XG4gICAgaWYgKHRoaXMubmFtZWRFbnRpdGllcy5oYXMobmFtZSkpIHtcbiAgICAgIC8vIEZvdW5kIGluIHRoZSBsb2NhbCBzY29wZS5cbiAgICAgIHJldHVybiB0aGlzLm5hbWVkRW50aXRpZXMuZ2V0KG5hbWUpITtcbiAgICB9IGVsc2UgaWYgKHRoaXMucGFyZW50U2NvcGUgIT09IG51bGwpIHtcbiAgICAgIC8vIE5vdCBpbiB0aGUgbG9jYWwgc2NvcGUsIGJ1dCB0aGVyZSdzIGEgcGFyZW50IHNjb3BlIHNvIGNoZWNrIHRoZXJlLlxuICAgICAgcmV0dXJuIHRoaXMucGFyZW50U2NvcGUubG9va3VwKG5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBBdCB0aGUgdG9wIGxldmVsIGFuZCBpdCB3YXNuJ3QgZm91bmQuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBjaGlsZCBzY29wZSBmb3IgYSBgVGVtcGxhdGVgLlxuICAgKlxuICAgKiBUaGlzIHNob3VsZCBhbHdheXMgYmUgZGVmaW5lZC5cbiAgICovXG4gIGdldENoaWxkU2NvcGUodGVtcGxhdGU6IFRlbXBsYXRlKTogU2NvcGUge1xuICAgIGNvbnN0IHJlcyA9IHRoaXMuY2hpbGRTY29wZXMuZ2V0KHRlbXBsYXRlKTtcbiAgICBpZiAocmVzID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQXNzZXJ0aW9uIGVycm9yOiBjaGlsZCBzY29wZSBmb3IgJHt0ZW1wbGF0ZX0gbm90IGZvdW5kYCk7XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cbn1cblxuLyoqXG4gKiBQcm9jZXNzZXMgYSB0ZW1wbGF0ZSBhbmQgbWF0Y2hlcyBkaXJlY3RpdmVzIG9uIG5vZGVzIChlbGVtZW50cyBhbmQgdGVtcGxhdGVzKS5cbiAqXG4gKiBVc3VhbGx5IHVzZWQgdmlhIHRoZSBzdGF0aWMgYGFwcGx5KClgIG1ldGhvZC5cbiAqL1xuY2xhc3MgRGlyZWN0aXZlQmluZGVyPERpcmVjdGl2ZVQgZXh0ZW5kcyBEaXJlY3RpdmVNZXRhPiBpbXBsZW1lbnRzIFZpc2l0b3Ige1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgbWF0Y2hlcjogU2VsZWN0b3JNYXRjaGVyPERpcmVjdGl2ZVQ+LFxuICAgICAgcHJpdmF0ZSBkaXJlY3RpdmVzOiBNYXA8RWxlbWVudHxUZW1wbGF0ZSwgRGlyZWN0aXZlVFtdPixcbiAgICAgIHByaXZhdGUgYmluZGluZ3M6IE1hcDxCb3VuZEF0dHJpYnV0ZXxCb3VuZEV2ZW50fFRleHRBdHRyaWJ1dGUsIERpcmVjdGl2ZVR8RWxlbWVudHxUZW1wbGF0ZT4sXG4gICAgICBwcml2YXRlIHJlZmVyZW5jZXM6XG4gICAgICAgICAgTWFwPFJlZmVyZW5jZSwge2RpcmVjdGl2ZTogRGlyZWN0aXZlVCwgbm9kZTogRWxlbWVudHxUZW1wbGF0ZX18RWxlbWVudHxUZW1wbGF0ZT4pIHt9XG5cbiAgLyoqXG4gICAqIFByb2Nlc3MgYSB0ZW1wbGF0ZSAobGlzdCBvZiBgTm9kZWBzKSBhbmQgcGVyZm9ybSBkaXJlY3RpdmUgbWF0Y2hpbmcgYWdhaW5zdCBlYWNoIG5vZGUuXG4gICAqXG4gICAqIEBwYXJhbSB0ZW1wbGF0ZSB0aGUgbGlzdCBvZiB0ZW1wbGF0ZSBgTm9kZWBzIHRvIG1hdGNoIChyZWN1cnNpdmVseSkuXG4gICAqIEBwYXJhbSBzZWxlY3Rvck1hdGNoZXIgYSBgU2VsZWN0b3JNYXRjaGVyYCBjb250YWluaW5nIHRoZSBkaXJlY3RpdmVzIHRoYXQgYXJlIGluIHNjb3BlIGZvclxuICAgKiB0aGlzIHRlbXBsYXRlLlxuICAgKiBAcmV0dXJucyB0aHJlZSBtYXBzIHdoaWNoIGNvbnRhaW4gaW5mb3JtYXRpb24gYWJvdXQgZGlyZWN0aXZlcyBpbiB0aGUgdGVtcGxhdGU6IHRoZVxuICAgKiBgZGlyZWN0aXZlc2AgbWFwIHdoaWNoIGxpc3RzIGRpcmVjdGl2ZXMgbWF0Y2hlZCBvbiBlYWNoIG5vZGUsIHRoZSBgYmluZGluZ3NgIG1hcCB3aGljaFxuICAgKiBpbmRpY2F0ZXMgd2hpY2ggZGlyZWN0aXZlcyBjbGFpbWVkIHdoaWNoIGJpbmRpbmdzIChpbnB1dHMsIG91dHB1dHMsIGV0YyksIGFuZCB0aGUgYHJlZmVyZW5jZXNgXG4gICAqIG1hcCB3aGljaCByZXNvbHZlcyAjcmVmZXJlbmNlcyAoYFJlZmVyZW5jZWBzKSB3aXRoaW4gdGhlIHRlbXBsYXRlIHRvIHRoZSBuYW1lZCBkaXJlY3RpdmUgb3JcbiAgICogdGVtcGxhdGUgbm9kZS5cbiAgICovXG4gIHN0YXRpYyBhcHBseTxEaXJlY3RpdmVUIGV4dGVuZHMgRGlyZWN0aXZlTWV0YT4oXG4gICAgICB0ZW1wbGF0ZTogTm9kZVtdLCBzZWxlY3Rvck1hdGNoZXI6IFNlbGVjdG9yTWF0Y2hlcjxEaXJlY3RpdmVUPik6IHtcbiAgICBkaXJlY3RpdmVzOiBNYXA8RWxlbWVudHxUZW1wbGF0ZSwgRGlyZWN0aXZlVFtdPixcbiAgICBiaW5kaW5nczogTWFwPEJvdW5kQXR0cmlidXRlfEJvdW5kRXZlbnR8VGV4dEF0dHJpYnV0ZSwgRGlyZWN0aXZlVHxFbGVtZW50fFRlbXBsYXRlPixcbiAgICByZWZlcmVuY2VzOiBNYXA8UmVmZXJlbmNlLCB7ZGlyZWN0aXZlOiBEaXJlY3RpdmVULCBub2RlOiBFbGVtZW50fFRlbXBsYXRlfXxFbGVtZW50fFRlbXBsYXRlPixcbiAgfSB7XG4gICAgY29uc3QgZGlyZWN0aXZlcyA9IG5ldyBNYXA8RWxlbWVudHxUZW1wbGF0ZSwgRGlyZWN0aXZlVFtdPigpO1xuICAgIGNvbnN0IGJpbmRpbmdzID1cbiAgICAgICAgbmV3IE1hcDxCb3VuZEF0dHJpYnV0ZXxCb3VuZEV2ZW50fFRleHRBdHRyaWJ1dGUsIERpcmVjdGl2ZVR8RWxlbWVudHxUZW1wbGF0ZT4oKTtcbiAgICBjb25zdCByZWZlcmVuY2VzID1cbiAgICAgICAgbmV3IE1hcDxSZWZlcmVuY2UsIHtkaXJlY3RpdmU6IERpcmVjdGl2ZVQsIG5vZGU6IEVsZW1lbnQgfCBUZW1wbGF0ZX18RWxlbWVudHxUZW1wbGF0ZT4oKTtcbiAgICBjb25zdCBtYXRjaGVyID0gbmV3IERpcmVjdGl2ZUJpbmRlcihzZWxlY3Rvck1hdGNoZXIsIGRpcmVjdGl2ZXMsIGJpbmRpbmdzLCByZWZlcmVuY2VzKTtcbiAgICBtYXRjaGVyLmluZ2VzdCh0ZW1wbGF0ZSk7XG4gICAgcmV0dXJuIHtkaXJlY3RpdmVzLCBiaW5kaW5ncywgcmVmZXJlbmNlc307XG4gIH1cblxuICBwcml2YXRlIGluZ2VzdCh0ZW1wbGF0ZTogTm9kZVtdKTogdm9pZCB7XG4gICAgdGVtcGxhdGUuZm9yRWFjaChub2RlID0+IG5vZGUudmlzaXQodGhpcykpO1xuICB9XG5cbiAgdmlzaXRFbGVtZW50KGVsZW1lbnQ6IEVsZW1lbnQpOiB2b2lkIHtcbiAgICB0aGlzLnZpc2l0RWxlbWVudE9yVGVtcGxhdGUoZWxlbWVudC5uYW1lLCBlbGVtZW50KTtcbiAgfVxuXG4gIHZpc2l0VGVtcGxhdGUodGVtcGxhdGU6IFRlbXBsYXRlKTogdm9pZCB7XG4gICAgdGhpcy52aXNpdEVsZW1lbnRPclRlbXBsYXRlKCduZy10ZW1wbGF0ZScsIHRlbXBsYXRlKTtcbiAgfVxuXG4gIHZpc2l0RWxlbWVudE9yVGVtcGxhdGUoZWxlbWVudE5hbWU6IHN0cmluZywgbm9kZTogRWxlbWVudHxUZW1wbGF0ZSk6IHZvaWQge1xuICAgIC8vIEZpcnN0LCBkZXRlcm1pbmUgdGhlIEhUTUwgc2hhcGUgb2YgdGhlIG5vZGUgZm9yIHRoZSBwdXJwb3NlIG9mIGRpcmVjdGl2ZSBtYXRjaGluZy5cbiAgICAvLyBEbyB0aGlzIGJ5IGJ1aWxkaW5nIHVwIGEgYENzc1NlbGVjdG9yYCBmb3IgdGhlIG5vZGUuXG4gICAgY29uc3QgY3NzU2VsZWN0b3IgPSBjcmVhdGVDc3NTZWxlY3RvcihlbGVtZW50TmFtZSwgZ2V0QXR0cnNGb3JEaXJlY3RpdmVNYXRjaGluZyhub2RlKSk7XG5cbiAgICAvLyBOZXh0LCB1c2UgdGhlIGBTZWxlY3Rvck1hdGNoZXJgIHRvIGdldCB0aGUgbGlzdCBvZiBkaXJlY3RpdmVzIG9uIHRoZSBub2RlLlxuICAgIGNvbnN0IGRpcmVjdGl2ZXM6IERpcmVjdGl2ZVRbXSA9IFtdO1xuICAgIHRoaXMubWF0Y2hlci5tYXRjaChjc3NTZWxlY3RvciwgKF8sIGRpcmVjdGl2ZSkgPT4gZGlyZWN0aXZlcy5wdXNoKGRpcmVjdGl2ZSkpO1xuICAgIGlmIChkaXJlY3RpdmVzLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuZGlyZWN0aXZlcy5zZXQobm9kZSwgZGlyZWN0aXZlcyk7XG4gICAgfVxuXG4gICAgLy8gUmVzb2x2ZSBhbnkgcmVmZXJlbmNlcyB0aGF0IGFyZSBjcmVhdGVkIG9uIHRoaXMgbm9kZS5cbiAgICBub2RlLnJlZmVyZW5jZXMuZm9yRWFjaChyZWYgPT4ge1xuICAgICAgbGV0IGRpclRhcmdldDogRGlyZWN0aXZlVHxudWxsID0gbnVsbDtcblxuICAgICAgLy8gSWYgdGhlIHJlZmVyZW5jZSBleHByZXNzaW9uIGlzIGVtcHR5LCB0aGVuIGl0IG1hdGNoZXMgdGhlIFwicHJpbWFyeVwiIGRpcmVjdGl2ZSBvbiB0aGUgbm9kZVxuICAgICAgLy8gKGlmIHRoZXJlIGlzIG9uZSkuIE90aGVyd2lzZSBpdCBtYXRjaGVzIHRoZSBob3N0IG5vZGUgaXRzZWxmIChlaXRoZXIgYW4gZWxlbWVudCBvclxuICAgICAgLy8gPG5nLXRlbXBsYXRlPiBub2RlKS5cbiAgICAgIGlmIChyZWYudmFsdWUudHJpbSgpID09PSAnJykge1xuICAgICAgICAvLyBUaGlzIGNvdWxkIGJlIGEgcmVmZXJlbmNlIHRvIGEgY29tcG9uZW50IGlmIHRoZXJlIGlzIG9uZS5cbiAgICAgICAgZGlyVGFyZ2V0ID0gZGlyZWN0aXZlcy5maW5kKGRpciA9PiBkaXIuaXNDb21wb25lbnQpIHx8IG51bGw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBUaGlzIHNob3VsZCBiZSBhIHJlZmVyZW5jZSB0byBhIGRpcmVjdGl2ZSBleHBvcnRlZCB2aWEgZXhwb3J0QXMuXG4gICAgICAgIGRpclRhcmdldCA9XG4gICAgICAgICAgICBkaXJlY3RpdmVzLmZpbmQoXG4gICAgICAgICAgICAgICAgZGlyID0+IGRpci5leHBvcnRBcyAhPT0gbnVsbCAmJiBkaXIuZXhwb3J0QXMuc29tZSh2YWx1ZSA9PiB2YWx1ZSA9PT0gcmVmLnZhbHVlKSkgfHxcbiAgICAgICAgICAgIG51bGw7XG4gICAgICAgIC8vIENoZWNrIGlmIGEgbWF0Y2hpbmcgZGlyZWN0aXZlIHdhcyBmb3VuZC5cbiAgICAgICAgaWYgKGRpclRhcmdldCA9PT0gbnVsbCkge1xuICAgICAgICAgIC8vIE5vIG1hdGNoaW5nIGRpcmVjdGl2ZSB3YXMgZm91bmQgLSB0aGlzIHJlZmVyZW5jZSBwb2ludHMgdG8gYW4gdW5rbm93biB0YXJnZXQuIExlYXZlIGl0XG4gICAgICAgICAgLy8gdW5tYXBwZWQuXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChkaXJUYXJnZXQgIT09IG51bGwpIHtcbiAgICAgICAgLy8gVGhpcyByZWZlcmVuY2UgcG9pbnRzIHRvIGEgZGlyZWN0aXZlLlxuICAgICAgICB0aGlzLnJlZmVyZW5jZXMuc2V0KHJlZiwge2RpcmVjdGl2ZTogZGlyVGFyZ2V0LCBub2RlfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBUaGlzIHJlZmVyZW5jZSBwb2ludHMgdG8gdGhlIG5vZGUgaXRzZWxmLlxuICAgICAgICB0aGlzLnJlZmVyZW5jZXMuc2V0KHJlZiwgbm9kZSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBBc3NvY2lhdGUgYXR0cmlidXRlcy9iaW5kaW5ncyBvbiB0aGUgbm9kZSB3aXRoIGRpcmVjdGl2ZXMgb3Igd2l0aCB0aGUgbm9kZSBpdHNlbGYuXG4gICAgdHlwZSBCb3VuZE5vZGUgPSBCb3VuZEF0dHJpYnV0ZXxCb3VuZEV2ZW50fFRleHRBdHRyaWJ1dGU7XG4gICAgY29uc3Qgc2V0QXR0cmlidXRlQmluZGluZyA9XG4gICAgICAgIChhdHRyaWJ1dGU6IEJvdW5kTm9kZSwgaW9UeXBlOiBrZXlvZiBQaWNrPERpcmVjdGl2ZU1ldGEsICdpbnB1dHMnfCdvdXRwdXRzJz4pID0+IHtcbiAgICAgICAgICBjb25zdCBkaXIgPSBkaXJlY3RpdmVzLmZpbmQoZGlyID0+IGRpcltpb1R5cGVdLmhhc0JpbmRpbmdQcm9wZXJ0eU5hbWUoYXR0cmlidXRlLm5hbWUpKTtcbiAgICAgICAgICBjb25zdCBiaW5kaW5nID0gZGlyICE9PSB1bmRlZmluZWQgPyBkaXIgOiBub2RlO1xuICAgICAgICAgIHRoaXMuYmluZGluZ3Muc2V0KGF0dHJpYnV0ZSwgYmluZGluZyk7XG4gICAgICAgIH07XG5cbiAgICAvLyBOb2RlIGlucHV0cyAoYm91bmQgYXR0cmlidXRlcykgYW5kIHRleHQgYXR0cmlidXRlcyBjYW4gYmUgYm91bmQgdG8gYW5cbiAgICAvLyBpbnB1dCBvbiBhIGRpcmVjdGl2ZS5cbiAgICBub2RlLmlucHV0cy5mb3JFYWNoKGlucHV0ID0+IHNldEF0dHJpYnV0ZUJpbmRpbmcoaW5wdXQsICdpbnB1dHMnKSk7XG4gICAgbm9kZS5hdHRyaWJ1dGVzLmZvckVhY2goYXR0ciA9PiBzZXRBdHRyaWJ1dGVCaW5kaW5nKGF0dHIsICdpbnB1dHMnKSk7XG4gICAgaWYgKG5vZGUgaW5zdGFuY2VvZiBUZW1wbGF0ZSkge1xuICAgICAgbm9kZS50ZW1wbGF0ZUF0dHJzLmZvckVhY2goYXR0ciA9PiBzZXRBdHRyaWJ1dGVCaW5kaW5nKGF0dHIsICdpbnB1dHMnKSk7XG4gICAgfVxuICAgIC8vIE5vZGUgb3V0cHV0cyAoYm91bmQgZXZlbnRzKSBjYW4gYmUgYm91bmQgdG8gYW4gb3V0cHV0IG9uIGEgZGlyZWN0aXZlLlxuICAgIG5vZGUub3V0cHV0cy5mb3JFYWNoKG91dHB1dCA9PiBzZXRBdHRyaWJ1dGVCaW5kaW5nKG91dHB1dCwgJ291dHB1dHMnKSk7XG5cbiAgICAvLyBSZWN1cnNlIGludG8gdGhlIG5vZGUncyBjaGlsZHJlbi5cbiAgICBub2RlLmNoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4gY2hpbGQudmlzaXQodGhpcykpO1xuICB9XG5cbiAgLy8gVW51c2VkIHZpc2l0b3JzLlxuICB2aXNpdENvbnRlbnQoY29udGVudDogQ29udGVudCk6IHZvaWQge31cbiAgdmlzaXRWYXJpYWJsZSh2YXJpYWJsZTogVmFyaWFibGUpOiB2b2lkIHt9XG4gIHZpc2l0UmVmZXJlbmNlKHJlZmVyZW5jZTogUmVmZXJlbmNlKTogdm9pZCB7fVxuICB2aXNpdFRleHRBdHRyaWJ1dGUoYXR0cmlidXRlOiBUZXh0QXR0cmlidXRlKTogdm9pZCB7fVxuICB2aXNpdEJvdW5kQXR0cmlidXRlKGF0dHJpYnV0ZTogQm91bmRBdHRyaWJ1dGUpOiB2b2lkIHt9XG4gIHZpc2l0Qm91bmRFdmVudChhdHRyaWJ1dGU6IEJvdW5kRXZlbnQpOiB2b2lkIHt9XG4gIHZpc2l0Qm91bmRBdHRyaWJ1dGVPckV2ZW50KG5vZGU6IEJvdW5kQXR0cmlidXRlfEJvdW5kRXZlbnQpIHt9XG4gIHZpc2l0VGV4dCh0ZXh0OiBUZXh0KTogdm9pZCB7fVxuICB2aXNpdEJvdW5kVGV4dCh0ZXh0OiBCb3VuZFRleHQpOiB2b2lkIHt9XG4gIHZpc2l0SWN1KGljdTogSWN1KTogdm9pZCB7fVxufVxuXG4vKipcbiAqIFByb2Nlc3NlcyBhIHRlbXBsYXRlIGFuZCBleHRyYWN0IG1ldGFkYXRhIGFib3V0IGV4cHJlc3Npb25zIGFuZCBzeW1ib2xzIHdpdGhpbi5cbiAqXG4gKiBUaGlzIGlzIGEgY29tcGFuaW9uIHRvIHRoZSBgRGlyZWN0aXZlQmluZGVyYCB0aGF0IGRvZXNuJ3QgcmVxdWlyZSBrbm93bGVkZ2Ugb2YgZGlyZWN0aXZlcyBtYXRjaGVkXG4gKiB3aXRoaW4gdGhlIHRlbXBsYXRlIGluIG9yZGVyIHRvIG9wZXJhdGUuXG4gKlxuICogRXhwcmVzc2lvbnMgYXJlIHZpc2l0ZWQgYnkgdGhlIHN1cGVyY2xhc3MgYFJlY3Vyc2l2ZUFzdFZpc2l0b3JgLCB3aXRoIGN1c3RvbSBsb2dpYyBwcm92aWRlZFxuICogYnkgb3ZlcnJpZGRlbiBtZXRob2RzIGZyb20gdGhhdCB2aXNpdG9yLlxuICovXG5jbGFzcyBUZW1wbGF0ZUJpbmRlciBleHRlbmRzIFJlY3Vyc2l2ZUFzdFZpc2l0b3IgaW1wbGVtZW50cyBWaXNpdG9yIHtcbiAgcHJpdmF0ZSB2aXNpdE5vZGU6IChub2RlOiBOb2RlKSA9PiB2b2lkO1xuXG4gIHByaXZhdGUgcGlwZXNVc2VkOiBzdHJpbmdbXSA9IFtdO1xuXG4gIHByaXZhdGUgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIGJpbmRpbmdzOiBNYXA8QVNULCBSZWZlcmVuY2V8VmFyaWFibGU+LFxuICAgICAgcHJpdmF0ZSBzeW1ib2xzOiBNYXA8UmVmZXJlbmNlfFZhcmlhYmxlLCBUZW1wbGF0ZT4sIHByaXZhdGUgdXNlZFBpcGVzOiBTZXQ8c3RyaW5nPixcbiAgICAgIHByaXZhdGUgbmVzdGluZ0xldmVsOiBNYXA8VGVtcGxhdGUsIG51bWJlcj4sIHByaXZhdGUgc2NvcGU6IFNjb3BlLFxuICAgICAgcHJpdmF0ZSB0ZW1wbGF0ZTogVGVtcGxhdGV8bnVsbCwgcHJpdmF0ZSBsZXZlbDogbnVtYmVyKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIC8vIFNhdmUgYSBiaXQgb2YgcHJvY2Vzc2luZyB0aW1lIGJ5IGNvbnN0cnVjdGluZyB0aGlzIGNsb3N1cmUgaW4gYWR2YW5jZS5cbiAgICB0aGlzLnZpc2l0Tm9kZSA9IChub2RlOiBOb2RlKSA9PiBub2RlLnZpc2l0KHRoaXMpO1xuICB9XG5cbiAgLy8gVGhpcyBtZXRob2QgaXMgZGVmaW5lZCB0byByZWNvbmNpbGUgdGhlIHR5cGUgb2YgVGVtcGxhdGVCaW5kZXIgc2luY2UgYm90aFxuICAvLyBSZWN1cnNpdmVBc3RWaXNpdG9yIGFuZCBWaXNpdG9yIGRlZmluZSB0aGUgdmlzaXQoKSBtZXRob2QgaW4gdGhlaXJcbiAgLy8gaW50ZXJmYWNlcy5cbiAgdmlzaXQobm9kZTogQVNUfE5vZGUsIGNvbnRleHQ/OiBhbnkpIHtcbiAgICBpZiAobm9kZSBpbnN0YW5jZW9mIEFTVCkge1xuICAgICAgbm9kZS52aXNpdCh0aGlzLCBjb250ZXh0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgbm9kZS52aXNpdCh0aGlzKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUHJvY2VzcyBhIHRlbXBsYXRlIGFuZCBleHRyYWN0IG1ldGFkYXRhIGFib3V0IGV4cHJlc3Npb25zIGFuZCBzeW1ib2xzIHdpdGhpbi5cbiAgICpcbiAgICogQHBhcmFtIHRlbXBsYXRlIHRoZSBub2RlcyBvZiB0aGUgdGVtcGxhdGUgdG8gcHJvY2Vzc1xuICAgKiBAcGFyYW0gc2NvcGUgdGhlIGBTY29wZWAgb2YgdGhlIHRlbXBsYXRlIGJlaW5nIHByb2Nlc3NlZC5cbiAgICogQHJldHVybnMgdGhyZWUgbWFwcyB3aGljaCBjb250YWluIG1ldGFkYXRhIGFib3V0IHRoZSB0ZW1wbGF0ZTogYGV4cHJlc3Npb25zYCB3aGljaCBpbnRlcnByZXRzXG4gICAqIHNwZWNpYWwgYEFTVGAgbm9kZXMgaW4gZXhwcmVzc2lvbnMgYXMgcG9pbnRpbmcgdG8gcmVmZXJlbmNlcyBvciB2YXJpYWJsZXMgZGVjbGFyZWQgd2l0aGluIHRoZVxuICAgKiB0ZW1wbGF0ZSwgYHN5bWJvbHNgIHdoaWNoIG1hcHMgdGhvc2UgdmFyaWFibGVzIGFuZCByZWZlcmVuY2VzIHRvIHRoZSBuZXN0ZWQgYFRlbXBsYXRlYCB3aGljaFxuICAgKiBkZWNsYXJlcyB0aGVtLCBpZiBhbnksIGFuZCBgbmVzdGluZ0xldmVsYCB3aGljaCBhc3NvY2lhdGVzIGVhY2ggYFRlbXBsYXRlYCB3aXRoIGEgaW50ZWdlclxuICAgKiBuZXN0aW5nIGxldmVsIChob3cgbWFueSBsZXZlbHMgZGVlcCB3aXRoaW4gdGhlIHRlbXBsYXRlIHN0cnVjdHVyZSB0aGUgYFRlbXBsYXRlYCBpcyksIHN0YXJ0aW5nXG4gICAqIGF0IDEuXG4gICAqL1xuICBzdGF0aWMgYXBwbHkodGVtcGxhdGU6IE5vZGVbXSwgc2NvcGU6IFNjb3BlKToge1xuICAgIGV4cHJlc3Npb25zOiBNYXA8QVNULCBSZWZlcmVuY2V8VmFyaWFibGU+LFxuICAgIHN5bWJvbHM6IE1hcDxWYXJpYWJsZXxSZWZlcmVuY2UsIFRlbXBsYXRlPixcbiAgICBuZXN0aW5nTGV2ZWw6IE1hcDxUZW1wbGF0ZSwgbnVtYmVyPixcbiAgICB1c2VkUGlwZXM6IFNldDxzdHJpbmc+LFxuICB9IHtcbiAgICBjb25zdCBleHByZXNzaW9ucyA9IG5ldyBNYXA8QVNULCBSZWZlcmVuY2V8VmFyaWFibGU+KCk7XG4gICAgY29uc3Qgc3ltYm9scyA9IG5ldyBNYXA8VmFyaWFibGV8UmVmZXJlbmNlLCBUZW1wbGF0ZT4oKTtcbiAgICBjb25zdCBuZXN0aW5nTGV2ZWwgPSBuZXcgTWFwPFRlbXBsYXRlLCBudW1iZXI+KCk7XG4gICAgY29uc3QgdXNlZFBpcGVzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgLy8gVGhlIHRvcC1sZXZlbCB0ZW1wbGF0ZSBoYXMgbmVzdGluZyBsZXZlbCAwLlxuICAgIGNvbnN0IGJpbmRlciA9IG5ldyBUZW1wbGF0ZUJpbmRlcihcbiAgICAgICAgZXhwcmVzc2lvbnMsIHN5bWJvbHMsIHVzZWRQaXBlcywgbmVzdGluZ0xldmVsLCBzY29wZSxcbiAgICAgICAgdGVtcGxhdGUgaW5zdGFuY2VvZiBUZW1wbGF0ZSA/IHRlbXBsYXRlIDogbnVsbCwgMCk7XG4gICAgYmluZGVyLmluZ2VzdCh0ZW1wbGF0ZSk7XG4gICAgcmV0dXJuIHtleHByZXNzaW9ucywgc3ltYm9scywgbmVzdGluZ0xldmVsLCB1c2VkUGlwZXN9O1xuICB9XG5cbiAgcHJpdmF0ZSBpbmdlc3QodGVtcGxhdGU6IFRlbXBsYXRlfE5vZGVbXSk6IHZvaWQge1xuICAgIGlmICh0ZW1wbGF0ZSBpbnN0YW5jZW9mIFRlbXBsYXRlKSB7XG4gICAgICAvLyBGb3IgPG5nLXRlbXBsYXRlPnMsIHByb2Nlc3Mgb25seSB2YXJpYWJsZXMgYW5kIGNoaWxkIG5vZGVzLiBJbnB1dHMsIG91dHB1dHMsIHRlbXBsYXRlQXR0cnMsXG4gICAgICAvLyBhbmQgcmVmZXJlbmNlcyB3ZXJlIGFsbCBwcm9jZXNzZWQgaW4gdGhlIHNjb3BlIG9mIHRoZSBjb250YWluaW5nIHRlbXBsYXRlLlxuICAgICAgdGVtcGxhdGUudmFyaWFibGVzLmZvckVhY2godGhpcy52aXNpdE5vZGUpO1xuICAgICAgdGVtcGxhdGUuY2hpbGRyZW4uZm9yRWFjaCh0aGlzLnZpc2l0Tm9kZSk7XG5cbiAgICAgIC8vIFNldCB0aGUgbmVzdGluZyBsZXZlbC5cbiAgICAgIHRoaXMubmVzdGluZ0xldmVsLnNldCh0ZW1wbGF0ZSwgdGhpcy5sZXZlbCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFZpc2l0IGVhY2ggbm9kZSBmcm9tIHRoZSB0b3AtbGV2ZWwgdGVtcGxhdGUuXG4gICAgICB0ZW1wbGF0ZS5mb3JFYWNoKHRoaXMudmlzaXROb2RlKTtcbiAgICB9XG4gIH1cblxuICB2aXNpdEVsZW1lbnQoZWxlbWVudDogRWxlbWVudCkge1xuICAgIC8vIFZpc2l0IHRoZSBpbnB1dHMsIG91dHB1dHMsIGFuZCBjaGlsZHJlbiBvZiB0aGUgZWxlbWVudC5cbiAgICBlbGVtZW50LmlucHV0cy5mb3JFYWNoKHRoaXMudmlzaXROb2RlKTtcbiAgICBlbGVtZW50Lm91dHB1dHMuZm9yRWFjaCh0aGlzLnZpc2l0Tm9kZSk7XG4gICAgZWxlbWVudC5jaGlsZHJlbi5mb3JFYWNoKHRoaXMudmlzaXROb2RlKTtcbiAgfVxuXG4gIHZpc2l0VGVtcGxhdGUodGVtcGxhdGU6IFRlbXBsYXRlKSB7XG4gICAgLy8gRmlyc3QsIHZpc2l0IGlucHV0cywgb3V0cHV0cyBhbmQgdGVtcGxhdGUgYXR0cmlidXRlcyBvZiB0aGUgdGVtcGxhdGUgbm9kZS5cbiAgICB0ZW1wbGF0ZS5pbnB1dHMuZm9yRWFjaCh0aGlzLnZpc2l0Tm9kZSk7XG4gICAgdGVtcGxhdGUub3V0cHV0cy5mb3JFYWNoKHRoaXMudmlzaXROb2RlKTtcbiAgICB0ZW1wbGF0ZS50ZW1wbGF0ZUF0dHJzLmZvckVhY2godGhpcy52aXNpdE5vZGUpO1xuXG4gICAgLy8gUmVmZXJlbmNlcyBhcmUgYWxzbyBldmFsdWF0ZWQgaW4gdGhlIG91dGVyIGNvbnRleHQuXG4gICAgdGVtcGxhdGUucmVmZXJlbmNlcy5mb3JFYWNoKHRoaXMudmlzaXROb2RlKTtcblxuICAgIC8vIE5leHQsIHJlY3Vyc2UgaW50byB0aGUgdGVtcGxhdGUgdXNpbmcgaXRzIHNjb3BlLCBhbmQgYnVtcGluZyB0aGUgbmVzdGluZyBsZXZlbCB1cCBieSBvbmUuXG4gICAgY29uc3QgY2hpbGRTY29wZSA9IHRoaXMuc2NvcGUuZ2V0Q2hpbGRTY29wZSh0ZW1wbGF0ZSk7XG4gICAgY29uc3QgYmluZGVyID0gbmV3IFRlbXBsYXRlQmluZGVyKFxuICAgICAgICB0aGlzLmJpbmRpbmdzLCB0aGlzLnN5bWJvbHMsIHRoaXMudXNlZFBpcGVzLCB0aGlzLm5lc3RpbmdMZXZlbCwgY2hpbGRTY29wZSwgdGVtcGxhdGUsXG4gICAgICAgIHRoaXMubGV2ZWwgKyAxKTtcbiAgICBiaW5kZXIuaW5nZXN0KHRlbXBsYXRlKTtcbiAgfVxuXG4gIHZpc2l0VmFyaWFibGUodmFyaWFibGU6IFZhcmlhYmxlKSB7XG4gICAgLy8gUmVnaXN0ZXIgdGhlIGBWYXJpYWJsZWAgYXMgYSBzeW1ib2wgaW4gdGhlIGN1cnJlbnQgYFRlbXBsYXRlYC5cbiAgICBpZiAodGhpcy50ZW1wbGF0ZSAhPT0gbnVsbCkge1xuICAgICAgdGhpcy5zeW1ib2xzLnNldCh2YXJpYWJsZSwgdGhpcy50ZW1wbGF0ZSk7XG4gICAgfVxuICB9XG5cbiAgdmlzaXRSZWZlcmVuY2UocmVmZXJlbmNlOiBSZWZlcmVuY2UpIHtcbiAgICAvLyBSZWdpc3RlciB0aGUgYFJlZmVyZW5jZWAgYXMgYSBzeW1ib2wgaW4gdGhlIGN1cnJlbnQgYFRlbXBsYXRlYC5cbiAgICBpZiAodGhpcy50ZW1wbGF0ZSAhPT0gbnVsbCkge1xuICAgICAgdGhpcy5zeW1ib2xzLnNldChyZWZlcmVuY2UsIHRoaXMudGVtcGxhdGUpO1xuICAgIH1cbiAgfVxuXG4gIC8vIFVudXNlZCB0ZW1wbGF0ZSB2aXNpdG9yc1xuXG4gIHZpc2l0VGV4dCh0ZXh0OiBUZXh0KSB7fVxuICB2aXNpdENvbnRlbnQoY29udGVudDogQ29udGVudCkge31cbiAgdmlzaXRUZXh0QXR0cmlidXRlKGF0dHJpYnV0ZTogVGV4dEF0dHJpYnV0ZSkge31cbiAgdmlzaXRJY3UoaWN1OiBJY3UpOiB2b2lkIHtcbiAgICBPYmplY3Qua2V5cyhpY3UudmFycykuZm9yRWFjaChrZXkgPT4gaWN1LnZhcnNba2V5XS52aXNpdCh0aGlzKSk7XG4gICAgT2JqZWN0LmtleXMoaWN1LnBsYWNlaG9sZGVycykuZm9yRWFjaChrZXkgPT4gaWN1LnBsYWNlaG9sZGVyc1trZXldLnZpc2l0KHRoaXMpKTtcbiAgfVxuXG4gIC8vIFRoZSByZW1haW5pbmcgdmlzaXRvcnMgYXJlIGNvbmNlcm5lZCB3aXRoIHByb2Nlc3NpbmcgQVNUIGV4cHJlc3Npb25zIHdpdGhpbiB0ZW1wbGF0ZSBiaW5kaW5nc1xuXG4gIHZpc2l0Qm91bmRBdHRyaWJ1dGUoYXR0cmlidXRlOiBCb3VuZEF0dHJpYnV0ZSkge1xuICAgIGF0dHJpYnV0ZS52YWx1ZS52aXNpdCh0aGlzKTtcbiAgfVxuXG4gIHZpc2l0Qm91bmRFdmVudChldmVudDogQm91bmRFdmVudCkge1xuICAgIGV2ZW50LmhhbmRsZXIudmlzaXQodGhpcyk7XG4gIH1cblxuICB2aXNpdEJvdW5kVGV4dCh0ZXh0OiBCb3VuZFRleHQpIHtcbiAgICB0ZXh0LnZhbHVlLnZpc2l0KHRoaXMpO1xuICB9XG4gIHZpc2l0UGlwZShhc3Q6IEJpbmRpbmdQaXBlLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHRoaXMudXNlZFBpcGVzLmFkZChhc3QubmFtZSk7XG4gICAgcmV0dXJuIHN1cGVyLnZpc2l0UGlwZShhc3QsIGNvbnRleHQpO1xuICB9XG5cbiAgLy8gVGhlc2UgZml2ZSB0eXBlcyBvZiBBU1QgZXhwcmVzc2lvbnMgY2FuIHJlZmVyIHRvIGV4cHJlc3Npb24gcm9vdHMsIHdoaWNoIGNvdWxkIGJlIHZhcmlhYmxlc1xuICAvLyBvciByZWZlcmVuY2VzIGluIHRoZSBjdXJyZW50IHNjb3BlLlxuXG4gIHZpc2l0UHJvcGVydHlSZWFkKGFzdDogUHJvcGVydHlSZWFkLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHRoaXMubWF5YmVNYXAoY29udGV4dCwgYXN0LCBhc3QubmFtZSk7XG4gICAgcmV0dXJuIHN1cGVyLnZpc2l0UHJvcGVydHlSZWFkKGFzdCwgY29udGV4dCk7XG4gIH1cblxuICB2aXNpdFNhZmVQcm9wZXJ0eVJlYWQoYXN0OiBTYWZlUHJvcGVydHlSZWFkLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHRoaXMubWF5YmVNYXAoY29udGV4dCwgYXN0LCBhc3QubmFtZSk7XG4gICAgcmV0dXJuIHN1cGVyLnZpc2l0U2FmZVByb3BlcnR5UmVhZChhc3QsIGNvbnRleHQpO1xuICB9XG5cbiAgdmlzaXRQcm9wZXJ0eVdyaXRlKGFzdDogUHJvcGVydHlXcml0ZSwgY29udGV4dDogYW55KTogYW55IHtcbiAgICB0aGlzLm1heWJlTWFwKGNvbnRleHQsIGFzdCwgYXN0Lm5hbWUpO1xuICAgIHJldHVybiBzdXBlci52aXNpdFByb3BlcnR5V3JpdGUoYXN0LCBjb250ZXh0KTtcbiAgfVxuXG4gIHZpc2l0TWV0aG9kQ2FsbChhc3Q6IE1ldGhvZENhbGwsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgdGhpcy5tYXliZU1hcChjb250ZXh0LCBhc3QsIGFzdC5uYW1lKTtcbiAgICByZXR1cm4gc3VwZXIudmlzaXRNZXRob2RDYWxsKGFzdCwgY29udGV4dCk7XG4gIH1cblxuICB2aXNpdFNhZmVNZXRob2RDYWxsKGFzdDogU2FmZU1ldGhvZENhbGwsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgdGhpcy5tYXliZU1hcChjb250ZXh0LCBhc3QsIGFzdC5uYW1lKTtcbiAgICByZXR1cm4gc3VwZXIudmlzaXRTYWZlTWV0aG9kQ2FsbChhc3QsIGNvbnRleHQpO1xuICB9XG5cbiAgcHJpdmF0ZSBtYXliZU1hcChcbiAgICAgIHNjb3BlOiBTY29wZSwgYXN0OiBQcm9wZXJ0eVJlYWR8U2FmZVByb3BlcnR5UmVhZHxQcm9wZXJ0eVdyaXRlfE1ldGhvZENhbGx8U2FmZU1ldGhvZENhbGwsXG4gICAgICBuYW1lOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAvLyBJZiB0aGUgcmVjZWl2ZXIgb2YgdGhlIGV4cHJlc3Npb24gaXNuJ3QgdGhlIGBJbXBsaWNpdFJlY2VpdmVyYCwgdGhpcyBpc24ndCB0aGUgcm9vdCBvZiBhblxuICAgIC8vIGBBU1RgIGV4cHJlc3Npb24gdGhhdCBtYXBzIHRvIGEgYFZhcmlhYmxlYCBvciBgUmVmZXJlbmNlYC5cbiAgICBpZiAoIShhc3QucmVjZWl2ZXIgaW5zdGFuY2VvZiBJbXBsaWNpdFJlY2VpdmVyKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIENoZWNrIHdoZXRoZXIgdGhlIG5hbWUgZXhpc3RzIGluIHRoZSBjdXJyZW50IHNjb3BlLiBJZiBzbywgbWFwIGl0LiBPdGhlcndpc2UsIHRoZSBuYW1lIGlzXG4gICAgLy8gcHJvYmFibHkgYSBwcm9wZXJ0eSBvbiB0aGUgdG9wLWxldmVsIGNvbXBvbmVudCBjb250ZXh0LlxuICAgIGxldCB0YXJnZXQgPSB0aGlzLnNjb3BlLmxvb2t1cChuYW1lKTtcbiAgICBpZiAodGFyZ2V0ICE9PSBudWxsKSB7XG4gICAgICB0aGlzLmJpbmRpbmdzLnNldChhc3QsIHRhcmdldCk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogTWV0YWRhdGEgY29udGFpbmVyIGZvciBhIGBUYXJnZXRgIHRoYXQgYWxsb3dzIHF1ZXJpZXMgZm9yIHNwZWNpZmljIGJpdHMgb2YgbWV0YWRhdGEuXG4gKlxuICogU2VlIGBCb3VuZFRhcmdldGAgZm9yIGRvY3VtZW50YXRpb24gb24gdGhlIGluZGl2aWR1YWwgbWV0aG9kcy5cbiAqL1xuZXhwb3J0IGNsYXNzIFIzQm91bmRUYXJnZXQ8RGlyZWN0aXZlVCBleHRlbmRzIERpcmVjdGl2ZU1ldGE+IGltcGxlbWVudHMgQm91bmRUYXJnZXQ8RGlyZWN0aXZlVD4ge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHJlYWRvbmx5IHRhcmdldDogVGFyZ2V0LCBwcml2YXRlIGRpcmVjdGl2ZXM6IE1hcDxFbGVtZW50fFRlbXBsYXRlLCBEaXJlY3RpdmVUW10+LFxuICAgICAgcHJpdmF0ZSBiaW5kaW5nczogTWFwPEJvdW5kQXR0cmlidXRlfEJvdW5kRXZlbnR8VGV4dEF0dHJpYnV0ZSwgRGlyZWN0aXZlVHxFbGVtZW50fFRlbXBsYXRlPixcbiAgICAgIHByaXZhdGUgcmVmZXJlbmNlczpcbiAgICAgICAgICBNYXA8Qm91bmRBdHRyaWJ1dGV8Qm91bmRFdmVudHxSZWZlcmVuY2V8VGV4dEF0dHJpYnV0ZSxcbiAgICAgICAgICAgICAge2RpcmVjdGl2ZTogRGlyZWN0aXZlVCwgbm9kZTogRWxlbWVudHxUZW1wbGF0ZX18RWxlbWVudHxUZW1wbGF0ZT4sXG4gICAgICBwcml2YXRlIGV4cHJUYXJnZXRzOiBNYXA8QVNULCBSZWZlcmVuY2V8VmFyaWFibGU+LFxuICAgICAgcHJpdmF0ZSBzeW1ib2xzOiBNYXA8UmVmZXJlbmNlfFZhcmlhYmxlLCBUZW1wbGF0ZT4sXG4gICAgICBwcml2YXRlIG5lc3RpbmdMZXZlbDogTWFwPFRlbXBsYXRlLCBudW1iZXI+LFxuICAgICAgcHJpdmF0ZSB0ZW1wbGF0ZUVudGl0aWVzOiBNYXA8VGVtcGxhdGV8bnVsbCwgUmVhZG9ubHlTZXQ8UmVmZXJlbmNlfFZhcmlhYmxlPj4sXG4gICAgICBwcml2YXRlIHVzZWRQaXBlczogU2V0PHN0cmluZz4pIHt9XG5cbiAgZ2V0RW50aXRpZXNJblRlbXBsYXRlU2NvcGUodGVtcGxhdGU6IFRlbXBsYXRlfG51bGwpOiBSZWFkb25seVNldDxSZWZlcmVuY2V8VmFyaWFibGU+IHtcbiAgICByZXR1cm4gdGhpcy50ZW1wbGF0ZUVudGl0aWVzLmdldCh0ZW1wbGF0ZSkgPz8gbmV3IFNldCgpO1xuICB9XG5cbiAgZ2V0RGlyZWN0aXZlc09mTm9kZShub2RlOiBFbGVtZW50fFRlbXBsYXRlKTogRGlyZWN0aXZlVFtdfG51bGwge1xuICAgIHJldHVybiB0aGlzLmRpcmVjdGl2ZXMuZ2V0KG5vZGUpIHx8IG51bGw7XG4gIH1cblxuICBnZXRSZWZlcmVuY2VUYXJnZXQocmVmOiBSZWZlcmVuY2UpOiB7ZGlyZWN0aXZlOiBEaXJlY3RpdmVULCBub2RlOiBFbGVtZW50fFRlbXBsYXRlfXxFbGVtZW50XG4gICAgICB8VGVtcGxhdGV8bnVsbCB7XG4gICAgcmV0dXJuIHRoaXMucmVmZXJlbmNlcy5nZXQocmVmKSB8fCBudWxsO1xuICB9XG5cbiAgZ2V0Q29uc3VtZXJPZkJpbmRpbmcoYmluZGluZzogQm91bmRBdHRyaWJ1dGV8Qm91bmRFdmVudHxUZXh0QXR0cmlidXRlKTogRGlyZWN0aXZlVHxFbGVtZW50XG4gICAgICB8VGVtcGxhdGV8bnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuYmluZGluZ3MuZ2V0KGJpbmRpbmcpIHx8IG51bGw7XG4gIH1cblxuICBnZXRFeHByZXNzaW9uVGFyZ2V0KGV4cHI6IEFTVCk6IFJlZmVyZW5jZXxWYXJpYWJsZXxudWxsIHtcbiAgICByZXR1cm4gdGhpcy5leHByVGFyZ2V0cy5nZXQoZXhwcikgfHwgbnVsbDtcbiAgfVxuXG4gIGdldFRlbXBsYXRlT2ZTeW1ib2woc3ltYm9sOiBSZWZlcmVuY2V8VmFyaWFibGUpOiBUZW1wbGF0ZXxudWxsIHtcbiAgICByZXR1cm4gdGhpcy5zeW1ib2xzLmdldChzeW1ib2wpIHx8IG51bGw7XG4gIH1cblxuICBnZXROZXN0aW5nTGV2ZWwodGVtcGxhdGU6IFRlbXBsYXRlKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5uZXN0aW5nTGV2ZWwuZ2V0KHRlbXBsYXRlKSB8fCAwO1xuICB9XG5cbiAgZ2V0VXNlZERpcmVjdGl2ZXMoKTogRGlyZWN0aXZlVFtdIHtcbiAgICBjb25zdCBzZXQgPSBuZXcgU2V0PERpcmVjdGl2ZVQ+KCk7XG4gICAgdGhpcy5kaXJlY3RpdmVzLmZvckVhY2goZGlycyA9PiBkaXJzLmZvckVhY2goZGlyID0+IHNldC5hZGQoZGlyKSkpO1xuICAgIHJldHVybiBBcnJheS5mcm9tKHNldC52YWx1ZXMoKSk7XG4gIH1cblxuICBnZXRVc2VkUGlwZXMoKTogc3RyaW5nW10ge1xuICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMudXNlZFBpcGVzKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBleHRyYWN0VGVtcGxhdGVFbnRpdGllcyhyb290U2NvcGU6IFNjb3BlKTogTWFwPFRlbXBsYXRlfG51bGwsIFNldDxSZWZlcmVuY2V8VmFyaWFibGU+PiB7XG4gIGNvbnN0IGVudGl0eU1hcCA9IG5ldyBNYXA8VGVtcGxhdGV8bnVsbCwgTWFwPHN0cmluZywgUmVmZXJlbmNlfFZhcmlhYmxlPj4oKTtcblxuICBmdW5jdGlvbiBleHRyYWN0U2NvcGVFbnRpdGllcyhzY29wZTogU2NvcGUpOiBNYXA8c3RyaW5nLCBSZWZlcmVuY2V8VmFyaWFibGU+IHtcbiAgICBpZiAoZW50aXR5TWFwLmhhcyhzY29wZS50ZW1wbGF0ZSkpIHtcbiAgICAgIHJldHVybiBlbnRpdHlNYXAuZ2V0KHNjb3BlLnRlbXBsYXRlKSE7XG4gICAgfVxuXG4gICAgY29uc3QgY3VycmVudEVudGl0aWVzID0gc2NvcGUubmFtZWRFbnRpdGllcztcblxuICAgIGxldCB0ZW1wbGF0ZUVudGl0aWVzOiBNYXA8c3RyaW5nLCBSZWZlcmVuY2V8VmFyaWFibGU+O1xuICAgIGlmIChzY29wZS5wYXJlbnRTY29wZSAhPT0gbnVsbCkge1xuICAgICAgdGVtcGxhdGVFbnRpdGllcyA9IG5ldyBNYXAoWy4uLmV4dHJhY3RTY29wZUVudGl0aWVzKHNjb3BlLnBhcmVudFNjb3BlKSwgLi4uY3VycmVudEVudGl0aWVzXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRlbXBsYXRlRW50aXRpZXMgPSBuZXcgTWFwKGN1cnJlbnRFbnRpdGllcyk7XG4gICAgfVxuXG4gICAgZW50aXR5TWFwLnNldChzY29wZS50ZW1wbGF0ZSwgdGVtcGxhdGVFbnRpdGllcyk7XG4gICAgcmV0dXJuIHRlbXBsYXRlRW50aXRpZXM7XG4gIH1cblxuICBjb25zdCBzY29wZXNUb1Byb2Nlc3M6IFNjb3BlW10gPSBbcm9vdFNjb3BlXTtcbiAgd2hpbGUgKHNjb3Blc1RvUHJvY2Vzcy5sZW5ndGggPiAwKSB7XG4gICAgY29uc3Qgc2NvcGUgPSBzY29wZXNUb1Byb2Nlc3MucG9wKCkhO1xuICAgIGZvciAoY29uc3QgY2hpbGRTY29wZSBvZiBzY29wZS5jaGlsZFNjb3Blcy52YWx1ZXMoKSkge1xuICAgICAgc2NvcGVzVG9Qcm9jZXNzLnB1c2goY2hpbGRTY29wZSk7XG4gICAgfVxuICAgIGV4dHJhY3RTY29wZUVudGl0aWVzKHNjb3BlKTtcbiAgfVxuXG4gIGNvbnN0IHRlbXBsYXRlRW50aXRpZXMgPSBuZXcgTWFwPFRlbXBsYXRlfG51bGwsIFNldDxSZWZlcmVuY2V8VmFyaWFibGU+PigpO1xuICBmb3IgKGNvbnN0IFt0ZW1wbGF0ZSwgZW50aXRpZXNdIG9mIGVudGl0eU1hcCkge1xuICAgIHRlbXBsYXRlRW50aXRpZXMuc2V0KHRlbXBsYXRlLCBuZXcgU2V0KGVudGl0aWVzLnZhbHVlcygpKSk7XG4gIH1cbiAgcmV0dXJuIHRlbXBsYXRlRW50aXRpZXM7XG59XG4iXX0=