/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { EmptyExpr } from '../expression_parser/ast';
import * as html from '../ml_parser/ast';
import { replaceNgsp } from '../ml_parser/html_whitespaces';
import { isNgTemplate } from '../ml_parser/tags';
import { ParseError, ParseErrorLevel, ParseSourceSpan } from '../parse_util';
import { isStyleUrlResolvable } from '../style_url_resolver';
import { isI18nRootNode } from '../template/pipeline/src/ingest';
import { PreparsedElementType, preparseElement } from '../template_parser/template_preparser';
import * as t from './r3_ast';
import { createForLoop, createIfBlock, createSwitchBlock, isConnectedForLoopBlock, isConnectedIfLoopBlock, } from './r3_control_flow';
import { createDeferredBlock, isConnectedDeferLoopBlock } from './r3_deferred_blocks';
import { I18N_ICU_VAR_PREFIX } from './view/i18n/util';
const BIND_NAME_REGEXP = /^(?:(bind-)|(let-)|(ref-|#)|(on-)|(bindon-)|(@))(.*)$/;
// Group 1 = "bind-"
const KW_BIND_IDX = 1;
// Group 2 = "let-"
const KW_LET_IDX = 2;
// Group 3 = "ref-/#"
const KW_REF_IDX = 3;
// Group 4 = "on-"
const KW_ON_IDX = 4;
// Group 5 = "bindon-"
const KW_BINDON_IDX = 5;
// Group 6 = "@"
const KW_AT_IDX = 6;
// Group 7 = the identifier after "bind-", "let-", "ref-/#", "on-", "bindon-" or "@"
const IDENT_KW_IDX = 7;
const BINDING_DELIMS = {
    BANANA_BOX: { start: '[(', end: ')]' },
    PROPERTY: { start: '[', end: ']' },
    EVENT: { start: '(', end: ')' },
};
const TEMPLATE_ATTR_PREFIX = '*';
export function htmlAstToRender3Ast(htmlNodes, bindingParser, options) {
    const transformer = new HtmlAstToIvyAst(bindingParser, options);
    const ivyNodes = html.visitAll(transformer, htmlNodes, htmlNodes);
    // Errors might originate in either the binding parser or the html to ivy transformer
    const allErrors = bindingParser.errors.concat(transformer.errors);
    const result = {
        nodes: ivyNodes,
        errors: allErrors,
        styleUrls: transformer.styleUrls,
        styles: transformer.styles,
        ngContentSelectors: transformer.ngContentSelectors,
    };
    if (options.collectCommentNodes) {
        result.commentNodes = transformer.commentNodes;
    }
    return result;
}
class HtmlAstToIvyAst {
    constructor(bindingParser, options) {
        this.bindingParser = bindingParser;
        this.options = options;
        this.errors = [];
        this.styles = [];
        this.styleUrls = [];
        this.ngContentSelectors = [];
        // This array will be populated if `Render3ParseOptions['collectCommentNodes']` is true
        this.commentNodes = [];
        this.inI18nBlock = false;
        /**
         * Keeps track of the nodes that have been processed already when previous nodes were visited.
         * These are typically blocks connected to other blocks or text nodes between connected blocks.
         */
        this.processedNodes = new Set();
    }
    // HTML visitor
    visitElement(element) {
        const isI18nRootElement = isI18nRootNode(element.i18n);
        if (isI18nRootElement) {
            if (this.inI18nBlock) {
                this.reportError('Cannot mark an element as translatable inside of a translatable section. Please remove the nested i18n marker.', element.sourceSpan);
            }
            this.inI18nBlock = true;
        }
        const preparsedElement = preparseElement(element);
        if (preparsedElement.type === PreparsedElementType.SCRIPT) {
            return null;
        }
        else if (preparsedElement.type === PreparsedElementType.STYLE) {
            const contents = textContents(element);
            if (contents !== null) {
                this.styles.push(contents);
            }
            return null;
        }
        else if (preparsedElement.type === PreparsedElementType.STYLESHEET &&
            isStyleUrlResolvable(preparsedElement.hrefAttr)) {
            this.styleUrls.push(preparsedElement.hrefAttr);
            return null;
        }
        // Whether the element is a `<ng-template>`
        const isTemplateElement = isNgTemplate(element.name);
        const parsedProperties = [];
        const boundEvents = [];
        const variables = [];
        const references = [];
        const attributes = [];
        const i18nAttrsMeta = {};
        const templateParsedProperties = [];
        const templateVariables = [];
        // Whether the element has any *-attribute
        let elementHasInlineTemplate = false;
        for (const attribute of element.attrs) {
            let hasBinding = false;
            const normalizedName = normalizeAttributeName(attribute.name);
            // `*attr` defines template bindings
            let isTemplateBinding = false;
            if (attribute.i18n) {
                i18nAttrsMeta[attribute.name] = attribute.i18n;
            }
            if (normalizedName.startsWith(TEMPLATE_ATTR_PREFIX)) {
                // *-attributes
                if (elementHasInlineTemplate) {
                    this.reportError(`Can't have multiple template bindings on one element. Use only one attribute prefixed with *`, attribute.sourceSpan);
                }
                isTemplateBinding = true;
                elementHasInlineTemplate = true;
                const templateValue = attribute.value;
                const templateKey = normalizedName.substring(TEMPLATE_ATTR_PREFIX.length);
                const parsedVariables = [];
                const absoluteValueOffset = attribute.valueSpan
                    ? attribute.valueSpan.start.offset
                    : // If there is no value span the attribute does not have a value, like `attr` in
                        //`<div attr></div>`. In this case, point to one character beyond the last character of
                        // the attribute name.
                        attribute.sourceSpan.start.offset + attribute.name.length;
                this.bindingParser.parseInlineTemplateBinding(templateKey, templateValue, attribute.sourceSpan, absoluteValueOffset, [], templateParsedProperties, parsedVariables, true /* isIvyAst */);
                templateVariables.push(...parsedVariables.map((v) => new t.Variable(v.name, v.value, v.sourceSpan, v.keySpan, v.valueSpan)));
            }
            else {
                // Check for variables, events, property bindings, interpolation
                hasBinding = this.parseAttribute(isTemplateElement, attribute, [], parsedProperties, boundEvents, variables, references);
            }
            if (!hasBinding && !isTemplateBinding) {
                // don't include the bindings as attributes as well in the AST
                attributes.push(this.visitAttribute(attribute));
            }
        }
        let children;
        if (preparsedElement.nonBindable) {
            // The `NonBindableVisitor` may need to return an array of nodes for blocks so we need
            // to flatten the array here. Avoid doing this for the `HtmlAstToIvyAst` since `flat` creates
            // a new array.
            children = html.visitAll(NON_BINDABLE_VISITOR, element.children).flat(Infinity);
        }
        else {
            children = html.visitAll(this, element.children, element.children);
        }
        let parsedElement;
        if (preparsedElement.type === PreparsedElementType.NG_CONTENT) {
            const selector = preparsedElement.selectAttr;
            const attrs = element.attrs.map((attr) => this.visitAttribute(attr));
            parsedElement = new t.Content(selector, attrs, children, element.sourceSpan, element.i18n);
            this.ngContentSelectors.push(selector);
        }
        else if (isTemplateElement) {
            // `<ng-template>`
            const attrs = this.extractAttributes(element.name, parsedProperties, i18nAttrsMeta);
            parsedElement = new t.Template(element.name, attributes, attrs.bound, boundEvents, [
            /* no template attributes */
            ], children, references, variables, element.sourceSpan, element.startSourceSpan, element.endSourceSpan, element.i18n);
        }
        else {
            const attrs = this.extractAttributes(element.name, parsedProperties, i18nAttrsMeta);
            parsedElement = new t.Element(element.name, attributes, attrs.bound, boundEvents, children, references, element.sourceSpan, element.startSourceSpan, element.endSourceSpan, element.i18n);
        }
        if (elementHasInlineTemplate) {
            // If this node is an inline-template (e.g. has *ngFor) then we need to create a template
            // node that contains this node.
            // Moreover, if the node is an element, then we need to hoist its attributes to the template
            // node for matching against content projection selectors.
            const attrs = this.extractAttributes('ng-template', templateParsedProperties, i18nAttrsMeta);
            const templateAttrs = [];
            attrs.literal.forEach((attr) => templateAttrs.push(attr));
            attrs.bound.forEach((attr) => templateAttrs.push(attr));
            const hoistedAttrs = parsedElement instanceof t.Element
                ? {
                    attributes: parsedElement.attributes,
                    inputs: parsedElement.inputs,
                    outputs: parsedElement.outputs,
                }
                : { attributes: [], inputs: [], outputs: [] };
            // For <ng-template>s with structural directives on them, avoid passing i18n information to
            // the wrapping template to prevent unnecessary i18n instructions from being generated. The
            // necessary i18n meta information will be extracted from child elements.
            const i18n = isTemplateElement && isI18nRootElement ? undefined : element.i18n;
            const name = parsedElement instanceof t.Template ? null : parsedElement.name;
            parsedElement = new t.Template(name, hoistedAttrs.attributes, hoistedAttrs.inputs, hoistedAttrs.outputs, templateAttrs, [parsedElement], [
            /* no references */
            ], templateVariables, element.sourceSpan, element.startSourceSpan, element.endSourceSpan, i18n);
        }
        if (isI18nRootElement) {
            this.inI18nBlock = false;
        }
        return parsedElement;
    }
    visitAttribute(attribute) {
        return new t.TextAttribute(attribute.name, attribute.value, attribute.sourceSpan, attribute.keySpan, attribute.valueSpan, attribute.i18n);
    }
    visitText(text) {
        return this.processedNodes.has(text)
            ? null
            : this._visitTextWithInterpolation(text.value, text.sourceSpan, text.tokens, text.i18n);
    }
    visitExpansion(expansion) {
        if (!expansion.i18n) {
            // do not generate Icu in case it was created
            // outside of i18n block in a template
            return null;
        }
        if (!isI18nRootNode(expansion.i18n)) {
            throw new Error(`Invalid type "${expansion.i18n.constructor}" for "i18n" property of ${expansion.sourceSpan.toString()}. Expected a "Message"`);
        }
        const message = expansion.i18n;
        const vars = {};
        const placeholders = {};
        // extract VARs from ICUs - we process them separately while
        // assembling resulting message via goog.getMsg function, since
        // we need to pass them to top-level goog.getMsg call
        Object.keys(message.placeholders).forEach((key) => {
            const value = message.placeholders[key];
            if (key.startsWith(I18N_ICU_VAR_PREFIX)) {
                // Currently when the `plural` or `select` keywords in an ICU contain trailing spaces (e.g.
                // `{count, select , ...}`), these spaces are also included into the key names in ICU vars
                // (e.g. "VAR_SELECT "). These trailing spaces are not desirable, since they will later be
                // converted into `_` symbols while normalizing placeholder names, which might lead to
                // mismatches at runtime (i.e. placeholder will not be replaced with the correct value).
                const formattedKey = key.trim();
                const ast = this.bindingParser.parseInterpolationExpression(value.text, value.sourceSpan);
                vars[formattedKey] = new t.BoundText(ast, value.sourceSpan);
            }
            else {
                placeholders[key] = this._visitTextWithInterpolation(value.text, value.sourceSpan, null);
            }
        });
        return new t.Icu(vars, placeholders, expansion.sourceSpan, message);
    }
    visitExpansionCase(expansionCase) {
        return null;
    }
    visitComment(comment) {
        if (this.options.collectCommentNodes) {
            this.commentNodes.push(new t.Comment(comment.value || '', comment.sourceSpan));
        }
        return null;
    }
    visitLetDeclaration(decl, context) {
        const value = this.bindingParser.parseBinding(decl.value, false, decl.valueSpan, decl.valueSpan.start.offset);
        if (value.errors.length === 0 && value.ast instanceof EmptyExpr) {
            this.reportError('@let declaration value cannot be empty', decl.valueSpan);
        }
        return new t.LetDeclaration(decl.name, value, decl.sourceSpan, decl.nameSpan, decl.valueSpan);
    }
    visitBlockParameter() {
        return null;
    }
    visitBlock(block, context) {
        const index = Array.isArray(context) ? context.indexOf(block) : -1;
        if (index === -1) {
            throw new Error('Visitor invoked incorrectly. Expecting visitBlock to be invoked siblings array as its context');
        }
        // Connected blocks may have been processed as a part of the previous block.
        if (this.processedNodes.has(block)) {
            return null;
        }
        let result = null;
        switch (block.name) {
            case 'defer':
                result = createDeferredBlock(block, this.findConnectedBlocks(index, context, isConnectedDeferLoopBlock), this, this.bindingParser);
                break;
            case 'switch':
                result = createSwitchBlock(block, this, this.bindingParser);
                break;
            case 'for':
                result = createForLoop(block, this.findConnectedBlocks(index, context, isConnectedForLoopBlock), this, this.bindingParser);
                break;
            case 'if':
                result = createIfBlock(block, this.findConnectedBlocks(index, context, isConnectedIfLoopBlock), this, this.bindingParser);
                break;
            default:
                let errorMessage;
                if (isConnectedDeferLoopBlock(block.name)) {
                    errorMessage = `@${block.name} block can only be used after an @defer block.`;
                    this.processedNodes.add(block);
                }
                else if (isConnectedForLoopBlock(block.name)) {
                    errorMessage = `@${block.name} block can only be used after an @for block.`;
                    this.processedNodes.add(block);
                }
                else if (isConnectedIfLoopBlock(block.name)) {
                    errorMessage = `@${block.name} block can only be used after an @if or @else if block.`;
                    this.processedNodes.add(block);
                }
                else {
                    errorMessage = `Unrecognized block @${block.name}.`;
                }
                result = {
                    node: new t.UnknownBlock(block.name, block.sourceSpan, block.nameSpan),
                    errors: [new ParseError(block.sourceSpan, errorMessage)],
                };
                break;
        }
        this.errors.push(...result.errors);
        return result.node;
    }
    findConnectedBlocks(primaryBlockIndex, siblings, predicate) {
        const relatedBlocks = [];
        for (let i = primaryBlockIndex + 1; i < siblings.length; i++) {
            const node = siblings[i];
            // Skip over comments.
            if (node instanceof html.Comment) {
                continue;
            }
            // Ignore empty text nodes between blocks.
            if (node instanceof html.Text && node.value.trim().length === 0) {
                // Add the text node to the processed nodes since we don't want
                // it to be generated between the connected nodes.
                this.processedNodes.add(node);
                continue;
            }
            // Stop searching as soon as we hit a non-block node or a block that is unrelated.
            if (!(node instanceof html.Block) || !predicate(node.name)) {
                break;
            }
            relatedBlocks.push(node);
            this.processedNodes.add(node);
        }
        return relatedBlocks;
    }
    // convert view engine `ParsedProperty` to a format suitable for IVY
    extractAttributes(elementName, properties, i18nPropsMeta) {
        const bound = [];
        const literal = [];
        properties.forEach((prop) => {
            const i18n = i18nPropsMeta[prop.name];
            if (prop.isLiteral) {
                literal.push(new t.TextAttribute(prop.name, prop.expression.source || '', prop.sourceSpan, prop.keySpan, prop.valueSpan, i18n));
            }
            else {
                // Note that validation is skipped and property mapping is disabled
                // due to the fact that we need to make sure a given prop is not an
                // input of a directive and directive matching happens at runtime.
                const bep = this.bindingParser.createBoundElementProperty(elementName, prop, 
                /* skipValidation */ true, 
                /* mapPropertyName */ false);
                bound.push(t.BoundAttribute.fromBoundElementProperty(bep, i18n));
            }
        });
        return { bound, literal };
    }
    parseAttribute(isTemplateElement, attribute, matchableAttributes, parsedProperties, boundEvents, variables, references) {
        const name = normalizeAttributeName(attribute.name);
        const value = attribute.value;
        const srcSpan = attribute.sourceSpan;
        const absoluteOffset = attribute.valueSpan
            ? attribute.valueSpan.start.offset
            : srcSpan.start.offset;
        function createKeySpan(srcSpan, prefix, identifier) {
            // We need to adjust the start location for the keySpan to account for the removed 'data-'
            // prefix from `normalizeAttributeName`.
            const normalizationAdjustment = attribute.name.length - name.length;
            const keySpanStart = srcSpan.start.moveBy(prefix.length + normalizationAdjustment);
            const keySpanEnd = keySpanStart.moveBy(identifier.length);
            return new ParseSourceSpan(keySpanStart, keySpanEnd, keySpanStart, identifier);
        }
        const bindParts = name.match(BIND_NAME_REGEXP);
        if (bindParts) {
            if (bindParts[KW_BIND_IDX] != null) {
                const identifier = bindParts[IDENT_KW_IDX];
                const keySpan = createKeySpan(srcSpan, bindParts[KW_BIND_IDX], identifier);
                this.bindingParser.parsePropertyBinding(identifier, value, false, false, srcSpan, absoluteOffset, attribute.valueSpan, matchableAttributes, parsedProperties, keySpan);
            }
            else if (bindParts[KW_LET_IDX]) {
                if (isTemplateElement) {
                    const identifier = bindParts[IDENT_KW_IDX];
                    const keySpan = createKeySpan(srcSpan, bindParts[KW_LET_IDX], identifier);
                    this.parseVariable(identifier, value, srcSpan, keySpan, attribute.valueSpan, variables);
                }
                else {
                    this.reportError(`"let-" is only supported on ng-template elements.`, srcSpan);
                }
            }
            else if (bindParts[KW_REF_IDX]) {
                const identifier = bindParts[IDENT_KW_IDX];
                const keySpan = createKeySpan(srcSpan, bindParts[KW_REF_IDX], identifier);
                this.parseReference(identifier, value, srcSpan, keySpan, attribute.valueSpan, references);
            }
            else if (bindParts[KW_ON_IDX]) {
                const events = [];
                const identifier = bindParts[IDENT_KW_IDX];
                const keySpan = createKeySpan(srcSpan, bindParts[KW_ON_IDX], identifier);
                this.bindingParser.parseEvent(identifier, value, 
                /* isAssignmentEvent */ false, srcSpan, attribute.valueSpan || srcSpan, matchableAttributes, events, keySpan);
                addEvents(events, boundEvents);
            }
            else if (bindParts[KW_BINDON_IDX]) {
                const identifier = bindParts[IDENT_KW_IDX];
                const keySpan = createKeySpan(srcSpan, bindParts[KW_BINDON_IDX], identifier);
                this.bindingParser.parsePropertyBinding(identifier, value, false, true, srcSpan, absoluteOffset, attribute.valueSpan, matchableAttributes, parsedProperties, keySpan);
                this.parseAssignmentEvent(identifier, value, srcSpan, attribute.valueSpan, matchableAttributes, boundEvents, keySpan);
            }
            else if (bindParts[KW_AT_IDX]) {
                const keySpan = createKeySpan(srcSpan, '', name);
                this.bindingParser.parseLiteralAttr(name, value, srcSpan, absoluteOffset, attribute.valueSpan, matchableAttributes, parsedProperties, keySpan);
            }
            return true;
        }
        // We didn't see a kw-prefixed property binding, but we have not yet checked
        // for the []/()/[()] syntax.
        let delims = null;
        if (name.startsWith(BINDING_DELIMS.BANANA_BOX.start)) {
            delims = BINDING_DELIMS.BANANA_BOX;
        }
        else if (name.startsWith(BINDING_DELIMS.PROPERTY.start)) {
            delims = BINDING_DELIMS.PROPERTY;
        }
        else if (name.startsWith(BINDING_DELIMS.EVENT.start)) {
            delims = BINDING_DELIMS.EVENT;
        }
        if (delims !== null &&
            // NOTE: older versions of the parser would match a start/end delimited
            // binding iff the property name was terminated by the ending delimiter
            // and the identifier in the binding was non-empty.
            // TODO(ayazhafiz): update this to handle malformed bindings.
            name.endsWith(delims.end) &&
            name.length > delims.start.length + delims.end.length) {
            const identifier = name.substring(delims.start.length, name.length - delims.end.length);
            const keySpan = createKeySpan(srcSpan, delims.start, identifier);
            if (delims.start === BINDING_DELIMS.BANANA_BOX.start) {
                this.bindingParser.parsePropertyBinding(identifier, value, false, true, srcSpan, absoluteOffset, attribute.valueSpan, matchableAttributes, parsedProperties, keySpan);
                this.parseAssignmentEvent(identifier, value, srcSpan, attribute.valueSpan, matchableAttributes, boundEvents, keySpan);
            }
            else if (delims.start === BINDING_DELIMS.PROPERTY.start) {
                this.bindingParser.parsePropertyBinding(identifier, value, false, false, srcSpan, absoluteOffset, attribute.valueSpan, matchableAttributes, parsedProperties, keySpan);
            }
            else {
                const events = [];
                this.bindingParser.parseEvent(identifier, value, 
                /* isAssignmentEvent */ false, srcSpan, attribute.valueSpan || srcSpan, matchableAttributes, events, keySpan);
                addEvents(events, boundEvents);
            }
            return true;
        }
        // No explicit binding found.
        const keySpan = createKeySpan(srcSpan, '' /* prefix */, name);
        const hasBinding = this.bindingParser.parsePropertyInterpolation(name, value, srcSpan, attribute.valueSpan, matchableAttributes, parsedProperties, keySpan, attribute.valueTokens ?? null);
        return hasBinding;
    }
    _visitTextWithInterpolation(value, sourceSpan, interpolatedTokens, i18n) {
        const valueNoNgsp = replaceNgsp(value);
        const expr = this.bindingParser.parseInterpolation(valueNoNgsp, sourceSpan, interpolatedTokens);
        return expr ? new t.BoundText(expr, sourceSpan, i18n) : new t.Text(valueNoNgsp, sourceSpan);
    }
    parseVariable(identifier, value, sourceSpan, keySpan, valueSpan, variables) {
        if (identifier.indexOf('-') > -1) {
            this.reportError(`"-" is not allowed in variable names`, sourceSpan);
        }
        else if (identifier.length === 0) {
            this.reportError(`Variable does not have a name`, sourceSpan);
        }
        variables.push(new t.Variable(identifier, value, sourceSpan, keySpan, valueSpan));
    }
    parseReference(identifier, value, sourceSpan, keySpan, valueSpan, references) {
        if (identifier.indexOf('-') > -1) {
            this.reportError(`"-" is not allowed in reference names`, sourceSpan);
        }
        else if (identifier.length === 0) {
            this.reportError(`Reference does not have a name`, sourceSpan);
        }
        else if (references.some((reference) => reference.name === identifier)) {
            this.reportError(`Reference "#${identifier}" is defined more than once`, sourceSpan);
        }
        references.push(new t.Reference(identifier, value, sourceSpan, keySpan, valueSpan));
    }
    parseAssignmentEvent(name, expression, sourceSpan, valueSpan, targetMatchableAttrs, boundEvents, keySpan) {
        const events = [];
        this.bindingParser.parseEvent(`${name}Change`, expression, 
        /* isAssignmentEvent */ true, sourceSpan, valueSpan || sourceSpan, targetMatchableAttrs, events, keySpan);
        addEvents(events, boundEvents);
    }
    reportError(message, sourceSpan, level = ParseErrorLevel.ERROR) {
        this.errors.push(new ParseError(sourceSpan, message, level));
    }
}
class NonBindableVisitor {
    visitElement(ast) {
        const preparsedElement = preparseElement(ast);
        if (preparsedElement.type === PreparsedElementType.SCRIPT ||
            preparsedElement.type === PreparsedElementType.STYLE ||
            preparsedElement.type === PreparsedElementType.STYLESHEET) {
            // Skipping <script> for security reasons
            // Skipping <style> and stylesheets as we already processed them
            // in the StyleCompiler
            return null;
        }
        const children = html.visitAll(this, ast.children, null);
        return new t.Element(ast.name, html.visitAll(this, ast.attrs), 
        /* inputs */ [], 
        /* outputs */ [], children, 
        /* references */ [], ast.sourceSpan, ast.startSourceSpan, ast.endSourceSpan);
    }
    visitComment(comment) {
        return null;
    }
    visitAttribute(attribute) {
        return new t.TextAttribute(attribute.name, attribute.value, attribute.sourceSpan, attribute.keySpan, attribute.valueSpan, attribute.i18n);
    }
    visitText(text) {
        return new t.Text(text.value, text.sourceSpan);
    }
    visitExpansion(expansion) {
        return null;
    }
    visitExpansionCase(expansionCase) {
        return null;
    }
    visitBlock(block, context) {
        const nodes = [
            // In an ngNonBindable context we treat the opening/closing tags of block as plain text.
            // This is the as if the `tokenizeBlocks` option was disabled.
            new t.Text(block.startSourceSpan.toString(), block.startSourceSpan),
            ...html.visitAll(this, block.children),
        ];
        if (block.endSourceSpan !== null) {
            nodes.push(new t.Text(block.endSourceSpan.toString(), block.endSourceSpan));
        }
        return nodes;
    }
    visitBlockParameter(parameter, context) {
        return null;
    }
    visitLetDeclaration(decl, context) {
        return new t.Text(`@let ${decl.name} = ${decl.value};`, decl.sourceSpan);
    }
}
const NON_BINDABLE_VISITOR = new NonBindableVisitor();
function normalizeAttributeName(attrName) {
    return /^data-/i.test(attrName) ? attrName.substring(5) : attrName;
}
function addEvents(events, boundEvents) {
    boundEvents.push(...events.map((e) => t.BoundEvent.fromParsedEvent(e)));
}
function textContents(node) {
    if (node.children.length !== 1 || !(node.children[0] instanceof html.Text)) {
        return null;
    }
    else {
        return node.children[0].value;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicjNfdGVtcGxhdGVfdHJhbnNmb3JtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3JlbmRlcjMvcjNfdGVtcGxhdGVfdHJhbnNmb3JtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxTQUFTLEVBQThDLE1BQU0sMEJBQTBCLENBQUM7QUFFaEcsT0FBTyxLQUFLLElBQUksTUFBTSxrQkFBa0IsQ0FBQztBQUN6QyxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sK0JBQStCLENBQUM7QUFDMUQsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBRS9DLE9BQU8sRUFBQyxVQUFVLEVBQUUsZUFBZSxFQUFFLGVBQWUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUMzRSxPQUFPLEVBQUMsb0JBQW9CLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUMzRCxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0saUNBQWlDLENBQUM7QUFFL0QsT0FBTyxFQUFDLG9CQUFvQixFQUFFLGVBQWUsRUFBQyxNQUFNLHVDQUF1QyxDQUFDO0FBRTVGLE9BQU8sS0FBSyxDQUFDLE1BQU0sVUFBVSxDQUFDO0FBQzlCLE9BQU8sRUFDTCxhQUFhLEVBQ2IsYUFBYSxFQUNiLGlCQUFpQixFQUNqQix1QkFBdUIsRUFDdkIsc0JBQXNCLEdBQ3ZCLE1BQU0sbUJBQW1CLENBQUM7QUFDM0IsT0FBTyxFQUFDLG1CQUFtQixFQUFFLHlCQUF5QixFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFDcEYsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFFckQsTUFBTSxnQkFBZ0IsR0FBRyx1REFBdUQsQ0FBQztBQUVqRixvQkFBb0I7QUFDcEIsTUFBTSxXQUFXLEdBQUcsQ0FBQyxDQUFDO0FBQ3RCLG1CQUFtQjtBQUNuQixNQUFNLFVBQVUs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LGtCQUFrQixFQUFFLENBQUM7QUFFdEQsU0FBUyxzQkFBc0IsQ0FBQyxRQUFnQjtJQUM5QyxPQUFPLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztBQUNyRSxDQUFDO0FBRUQsU0FBUyxTQUFTLENBQUMsTUFBcUIsRUFBRSxXQUEyQjtJQUNuRSxXQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzFFLENBQUM7QUFFRCxTQUFTLFlBQVksQ0FBQyxJQUFrQjtJQUN0QyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsWUFBWSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUMzRSxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7U0FBTSxDQUFDO1FBQ04sT0FBUSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBZSxDQUFDLEtBQUssQ0FBQztJQUMvQyxDQUFDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0VtcHR5RXhwciwgUGFyc2VkRXZlbnQsIFBhcnNlZFByb3BlcnR5LCBQYXJzZWRWYXJpYWJsZX0gZnJvbSAnLi4vZXhwcmVzc2lvbl9wYXJzZXIvYXN0JztcbmltcG9ydCAqIGFzIGkxOG4gZnJvbSAnLi4vaTE4bi9pMThuX2FzdCc7XG5pbXBvcnQgKiBhcyBodG1sIGZyb20gJy4uL21sX3BhcnNlci9hc3QnO1xuaW1wb3J0IHtyZXBsYWNlTmdzcH0gZnJvbSAnLi4vbWxfcGFyc2VyL2h0bWxfd2hpdGVzcGFjZXMnO1xuaW1wb3J0IHtpc05nVGVtcGxhdGV9IGZyb20gJy4uL21sX3BhcnNlci90YWdzJztcbmltcG9ydCB7SW50ZXJwb2xhdGVkQXR0cmlidXRlVG9rZW4sIEludGVycG9sYXRlZFRleHRUb2tlbn0gZnJvbSAnLi4vbWxfcGFyc2VyL3Rva2Vucyc7XG5pbXBvcnQge1BhcnNlRXJyb3IsIFBhcnNlRXJyb3JMZXZlbCwgUGFyc2VTb3VyY2VTcGFufSBmcm9tICcuLi9wYXJzZV91dGlsJztcbmltcG9ydCB7aXNTdHlsZVVybFJlc29sdmFibGV9IGZyb20gJy4uL3N0eWxlX3VybF9yZXNvbHZlcic7XG5pbXBvcnQge2lzSTE4blJvb3ROb2RlfSBmcm9tICcuLi90ZW1wbGF0ZS9waXBlbGluZS9zcmMvaW5nZXN0JztcbmltcG9ydCB7QmluZGluZ1BhcnNlcn0gZnJvbSAnLi4vdGVtcGxhdGVfcGFyc2VyL2JpbmRpbmdfcGFyc2VyJztcbmltcG9ydCB7UHJlcGFyc2VkRWxlbWVudFR5cGUsIHByZXBhcnNlRWxlbWVudH0gZnJvbSAnLi4vdGVtcGxhdGVfcGFyc2VyL3RlbXBsYXRlX3ByZXBhcnNlcic7XG5cbmltcG9ydCAqIGFzIHQgZnJvbSAnLi9yM19hc3QnO1xuaW1wb3J0IHtcbiAgY3JlYXRlRm9yTG9vcCxcbiAgY3JlYXRlSWZCbG9jayxcbiAgY3JlYXRlU3dpdGNoQmxvY2ssXG4gIGlzQ29ubmVjdGVkRm9yTG9vcEJsb2NrLFxuICBpc0Nvbm5lY3RlZElmTG9vcEJsb2NrLFxufSBmcm9tICcuL3IzX2NvbnRyb2xfZmxvdyc7XG5pbXBvcnQge2NyZWF0ZURlZmVycmVkQmxvY2ssIGlzQ29ubmVjdGVkRGVmZXJMb29wQmxvY2t9IGZyb20gJy4vcjNfZGVmZXJyZWRfYmxvY2tzJztcbmltcG9ydCB7STE4Tl9JQ1VfVkFSX1BSRUZJWH0gZnJvbSAnLi92aWV3L2kxOG4vdXRpbCc7XG5cbmNvbnN0IEJJTkRfTkFNRV9SRUdFWFAgPSAvXig/OihiaW5kLSl8KGxldC0pfChyZWYtfCMpfChvbi0pfChiaW5kb24tKXwoQCkpKC4qKSQvO1xuXG4vLyBHcm91cCAxID0gXCJiaW5kLVwiXG5jb25zdCBLV19CSU5EX0lEWCA9IDE7XG4vLyBHcm91cCAyID0gXCJsZXQtXCJcbmNvbnN0IEtXX0xFVF9JRFggPSAyO1xuLy8gR3JvdXAgMyA9IFwicmVmLS8jXCJcbmNvbnN0IEtXX1JFRl9JRFggPSAzO1xuLy8gR3JvdXAgNCA9IFwib24tXCJcbmNvbnN0IEtXX09OX0lEWCA9IDQ7XG4vLyBHcm91cCA1ID0gXCJiaW5kb24tXCJcbmNvbnN0IEtXX0JJTkRPTl9JRFggPSA1O1xuLy8gR3JvdXAgNiA9IFwiQFwiXG5jb25zdCBLV19BVF9JRFggPSA2O1xuLy8gR3JvdXAgNyA9IHRoZSBpZGVudGlmaWVyIGFmdGVyIFwiYmluZC1cIiwgXCJsZXQtXCIsIFwicmVmLS8jXCIsIFwib24tXCIsIFwiYmluZG9uLVwiIG9yIFwiQFwiXG5jb25zdCBJREVOVF9LV19JRFggPSA3O1xuXG5jb25zdCBCSU5ESU5HX0RFTElNUyA9IHtcbiAgQkFOQU5BX0JPWDoge3N0YXJ0OiAnWygnLCBlbmQ6ICcpXSd9LFxuICBQUk9QRVJUWToge3N0YXJ0OiAnWycsIGVuZDogJ10nfSxcbiAgRVZFTlQ6IHtzdGFydDogJygnLCBlbmQ6ICcpJ30sXG59O1xuXG5jb25zdCBURU1QTEFURV9BVFRSX1BSRUZJWCA9ICcqJztcblxuLy8gUmVzdWx0IG9mIHRoZSBodG1sIEFTVCB0byBJdnkgQVNUIHRyYW5zZm9ybWF0aW9uXG5leHBvcnQgaW50ZXJmYWNlIFJlbmRlcjNQYXJzZVJlc3VsdCB7XG4gIG5vZGVzOiB0Lk5vZGVbXTtcbiAgZXJyb3JzOiBQYXJzZUVycm9yW107XG4gIHN0eWxlczogc3RyaW5nW107XG4gIHN0eWxlVXJsczogc3RyaW5nW107XG4gIG5nQ29udGVudFNlbGVjdG9yczogc3RyaW5nW107XG4gIC8vIFdpbGwgYmUgZGVmaW5lZCBpZiBgUmVuZGVyM1BhcnNlT3B0aW9uc1snY29sbGVjdENvbW1lbnROb2RlcyddYCBpcyB0cnVlXG4gIGNvbW1lbnROb2Rlcz86IHQuQ29tbWVudFtdO1xufVxuXG5pbnRlcmZhY2UgUmVuZGVyM1BhcnNlT3B0aW9ucyB7XG4gIGNvbGxlY3RDb21tZW50Tm9kZXM6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBodG1sQXN0VG9SZW5kZXIzQXN0KFxuICBodG1sTm9kZXM6IGh0bWwuTm9kZVtdLFxuICBiaW5kaW5nUGFyc2VyOiBCaW5kaW5nUGFyc2VyLFxuICBvcHRpb25zOiBSZW5kZXIzUGFyc2VPcHRpb25zLFxuKTogUmVuZGVyM1BhcnNlUmVzdWx0IHtcbiAgY29uc3QgdHJhbnNmb3JtZXIgPSBuZXcgSHRtbEFzdFRvSXZ5QXN0KGJpbmRpbmdQYXJzZXIsIG9wdGlvbnMpO1xuICBjb25zdCBpdnlOb2RlcyA9IGh0bWwudmlzaXRBbGwodHJhbnNmb3JtZXIsIGh0bWxOb2RlcywgaHRtbE5vZGVzKTtcblxuICAvLyBFcnJvcnMgbWlnaHQgb3JpZ2luYXRlIGluIGVpdGhlciB0aGUgYmluZGluZyBwYXJzZXIgb3IgdGhlIGh0bWwgdG8gaXZ5IHRyYW5zZm9ybWVyXG4gIGNvbnN0IGFsbEVycm9ycyA9IGJpbmRpbmdQYXJzZXIuZXJyb3JzLmNvbmNhdCh0cmFuc2Zvcm1lci5lcnJvcnMpO1xuXG4gIGNvbnN0IHJlc3VsdDogUmVuZGVyM1BhcnNlUmVzdWx0ID0ge1xuICAgIG5vZGVzOiBpdnlOb2RlcyxcbiAgICBlcnJvcnM6IGFsbEVycm9ycyxcbiAgICBzdHlsZVVybHM6IHRyYW5zZm9ybWVyLnN0eWxlVXJscyxcbiAgICBzdHlsZXM6IHRyYW5zZm9ybWVyLnN0eWxlcyxcbiAgICBuZ0NvbnRlbnRTZWxlY3RvcnM6IHRyYW5zZm9ybWVyLm5nQ29udGVudFNlbGVjdG9ycyxcbiAgfTtcbiAgaWYgKG9wdGlvbnMuY29sbGVjdENvbW1lbnROb2Rlcykge1xuICAgIHJlc3VsdC5jb21tZW50Tm9kZXMgPSB0cmFuc2Zvcm1lci5jb21tZW50Tm9kZXM7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuY2xhc3MgSHRtbEFzdFRvSXZ5QXN0IGltcGxlbWVudHMgaHRtbC5WaXNpdG9yIHtcbiAgZXJyb3JzOiBQYXJzZUVycm9yW10gPSBbXTtcbiAgc3R5bGVzOiBzdHJpbmdbXSA9IFtdO1xuICBzdHlsZVVybHM6IHN0cmluZ1tdID0gW107XG4gIG5nQ29udGVudFNlbGVjdG9yczogc3RyaW5nW10gPSBbXTtcbiAgLy8gVGhpcyBhcnJheSB3aWxsIGJlIHBvcHVsYXRlZCBpZiBgUmVuZGVyM1BhcnNlT3B0aW9uc1snY29sbGVjdENvbW1lbnROb2RlcyddYCBpcyB0cnVlXG4gIGNvbW1lbnROb2RlczogdC5Db21tZW50W10gPSBbXTtcbiAgcHJpdmF0ZSBpbkkxOG5CbG9jazogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBLZWVwcyB0cmFjayBvZiB0aGUgbm9kZXMgdGhhdCBoYXZlIGJlZW4gcHJvY2Vzc2VkIGFscmVhZHkgd2hlbiBwcmV2aW91cyBub2RlcyB3ZXJlIHZpc2l0ZWQuXG4gICAqIFRoZXNlIGFyZSB0eXBpY2FsbHkgYmxvY2tzIGNvbm5lY3RlZCB0byBvdGhlciBibG9ja3Mgb3IgdGV4dCBub2RlcyBiZXR3ZWVuIGNvbm5lY3RlZCBibG9ja3MuXG4gICAqL1xuICBwcml2YXRlIHByb2Nlc3NlZE5vZGVzID0gbmV3IFNldDxodG1sLkJsb2NrIHwgaHRtbC5UZXh0PigpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgYmluZGluZ1BhcnNlcjogQmluZGluZ1BhcnNlcixcbiAgICBwcml2YXRlIG9wdGlvbnM6IFJlbmRlcjNQYXJzZU9wdGlvbnMsXG4gICkge31cblxuICAvLyBIVE1MIHZpc2l0b3JcbiAgdmlzaXRFbGVtZW50KGVsZW1lbnQ6IGh0bWwuRWxlbWVudCk6IHQuTm9kZSB8IG51bGwge1xuICAgIGNvbnN0IGlzSTE4blJvb3RFbGVtZW50ID0gaXNJMThuUm9vdE5vZGUoZWxlbWVudC5pMThuKTtcbiAgICBpZiAoaXNJMThuUm9vdEVsZW1lbnQpIHtcbiAgICAgIGlmICh0aGlzLmluSTE4bkJsb2NrKSB7XG4gICAgICAgIHRoaXMucmVwb3J0RXJyb3IoXG4gICAgICAgICAgJ0Nhbm5vdCBtYXJrIGFuIGVsZW1lbnQgYXMgdHJhbnNsYXRhYmxlIGluc2lkZSBvZiBhIHRyYW5zbGF0YWJsZSBzZWN0aW9uLiBQbGVhc2UgcmVtb3ZlIHRoZSBuZXN0ZWQgaTE4biBtYXJrZXIuJyxcbiAgICAgICAgICBlbGVtZW50LnNvdXJjZVNwYW4sXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICB0aGlzLmluSTE4bkJsb2NrID0gdHJ1ZTtcbiAgICB9XG4gICAgY29uc3QgcHJlcGFyc2VkRWxlbWVudCA9IHByZXBhcnNlRWxlbWVudChlbGVtZW50KTtcbiAgICBpZiAocHJlcGFyc2VkRWxlbWVudC50eXBlID09PSBQcmVwYXJzZWRFbGVtZW50VHlwZS5TQ1JJUFQpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0gZWxzZSBpZiAocHJlcGFyc2VkRWxlbWVudC50eXBlID09PSBQcmVwYXJzZWRFbGVtZW50VHlwZS5TVFlMRSkge1xuICAgICAgY29uc3QgY29udGVudHMgPSB0ZXh0Q29udGVudHMoZWxlbWVudCk7XG4gICAgICBpZiAoY29udGVudHMgIT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5zdHlsZXMucHVzaChjb250ZW50cyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9IGVsc2UgaWYgKFxuICAgICAgcHJlcGFyc2VkRWxlbWVudC50eXBlID09PSBQcmVwYXJzZWRFbGVtZW50VHlwZS5TVFlMRVNIRUVUICYmXG4gICAgICBpc1N0eWxlVXJsUmVzb2x2YWJsZShwcmVwYXJzZWRFbGVtZW50LmhyZWZBdHRyKVxuICAgICkge1xuICAgICAgdGhpcy5zdHlsZVVybHMucHVzaChwcmVwYXJzZWRFbGVtZW50LmhyZWZBdHRyKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8vIFdoZXRoZXIgdGhlIGVsZW1lbnQgaXMgYSBgPG5nLXRlbXBsYXRlPmBcbiAgICBjb25zdCBpc1RlbXBsYXRlRWxlbWVudCA9IGlzTmdUZW1wbGF0ZShlbGVtZW50Lm5hbWUpO1xuXG4gICAgY29uc3QgcGFyc2VkUHJvcGVydGllczogUGFyc2VkUHJvcGVydHlbXSA9IFtdO1xuICAgIGNvbnN0IGJvdW5kRXZlbnRzOiB0LkJvdW5kRXZlbnRbXSA9IFtdO1xuICAgIGNvbnN0IHZhcmlhYmxlczogdC5WYXJpYWJsZVtdID0gW107XG4gICAgY29uc3QgcmVmZXJlbmNlczogdC5SZWZlcmVuY2VbXSA9IFtdO1xuICAgIGNvbnN0IGF0dHJpYnV0ZXM6IHQuVGV4dEF0dHJpYnV0ZVtdID0gW107XG4gICAgY29uc3QgaTE4bkF0dHJzTWV0YToge1trZXk6IHN0cmluZ106IGkxOG4uSTE4bk1ldGF9ID0ge307XG5cbiAgICBjb25zdCB0ZW1wbGF0ZVBhcnNlZFByb3BlcnRpZXM6IFBhcnNlZFByb3BlcnR5W10gPSBbXTtcbiAgICBjb25zdCB0ZW1wbGF0ZVZhcmlhYmxlczogdC5WYXJpYWJsZVtdID0gW107XG5cbiAgICAvLyBXaGV0aGVyIHRoZSBlbGVtZW50IGhhcyBhbnkgKi1hdHRyaWJ1dGVcbiAgICBsZXQgZWxlbWVudEhhc0lubGluZVRlbXBsYXRlID0gZmFsc2U7XG5cbiAgICBmb3IgKGNvbnN0IGF0dHJpYnV0ZSBvZiBlbGVtZW50LmF0dHJzKSB7XG4gICAgICBsZXQgaGFzQmluZGluZyA9IGZhbHNlO1xuICAgICAgY29uc3Qgbm9ybWFsaXplZE5hbWUgPSBub3JtYWxpemVBdHRyaWJ1dGVOYW1lKGF0dHJpYnV0ZS5uYW1lKTtcblxuICAgICAgLy8gYCphdHRyYCBkZWZpbmVzIHRlbXBsYXRlIGJpbmRpbmdzXG4gICAgICBsZXQgaXNUZW1wbGF0ZUJpbmRpbmcgPSBmYWxzZTtcblxuICAgICAgaWYgKGF0dHJpYnV0ZS5pMThuKSB7XG4gICAgICAgIGkxOG5BdHRyc01ldGFbYXR0cmlidXRlLm5hbWVdID0gYXR0cmlidXRlLmkxOG47XG4gICAgICB9XG5cbiAgICAgIGlmIChub3JtYWxpemVkTmFtZS5zdGFydHNXaXRoKFRFTVBMQVRFX0FUVFJfUFJFRklYKSkge1xuICAgICAgICAvLyAqLWF0dHJpYnV0ZXNcbiAgICAgICAgaWYgKGVsZW1lbnRIYXNJbmxpbmVUZW1wbGF0ZSkge1xuICAgICAgICAgIHRoaXMucmVwb3J0RXJyb3IoXG4gICAgICAgICAgICBgQ2FuJ3QgaGF2ZSBtdWx0aXBsZSB0ZW1wbGF0ZSBiaW5kaW5ncyBvbiBvbmUgZWxlbWVudC4gVXNlIG9ubHkgb25lIGF0dHJpYnV0ZSBwcmVmaXhlZCB3aXRoICpgLFxuICAgICAgICAgICAgYXR0cmlidXRlLnNvdXJjZVNwYW4sXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBpc1RlbXBsYXRlQmluZGluZyA9IHRydWU7XG4gICAgICAgIGVsZW1lbnRIYXNJbmxpbmVUZW1wbGF0ZSA9IHRydWU7XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlVmFsdWUgPSBhdHRyaWJ1dGUudmFsdWU7XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlS2V5ID0gbm9ybWFsaXplZE5hbWUuc3Vic3RyaW5nKFRFTVBMQVRFX0FUVFJfUFJFRklYLmxlbmd0aCk7XG5cbiAgICAgICAgY29uc3QgcGFyc2VkVmFyaWFibGVzOiBQYXJzZWRWYXJpYWJsZVtdID0gW107XG4gICAgICAgIGNvbnN0IGFic29sdXRlVmFsdWVPZmZzZXQgPSBhdHRyaWJ1dGUudmFsdWVTcGFuXG4gICAgICAgICAgPyBhdHRyaWJ1dGUudmFsdWVTcGFuLnN0YXJ0Lm9mZnNldFxuICAgICAgICAgIDogLy8gSWYgdGhlcmUgaXMgbm8gdmFsdWUgc3BhbiB0aGUgYXR0cmlidXRlIGRvZXMgbm90IGhhdmUgYSB2YWx1ZSwgbGlrZSBgYXR0cmAgaW5cbiAgICAgICAgICAgIC8vYDxkaXYgYXR0cj48L2Rpdj5gLiBJbiB0aGlzIGNhc2UsIHBvaW50IHRvIG9uZSBjaGFyYWN0ZXIgYmV5b25kIHRoZSBsYXN0IGNoYXJhY3RlciBvZlxuICAgICAgICAgICAgLy8gdGhlIGF0dHJpYnV0ZSBuYW1lLlxuICAgICAgICAgICAgYXR0cmlidXRlLnNvdXJjZVNwYW4uc3RhcnQub2Zmc2V0ICsgYXR0cmlidXRlLm5hbWUubGVuZ3RoO1xuXG4gICAgICAgIHRoaXMuYmluZGluZ1BhcnNlci5wYXJzZUlubGluZVRlbXBsYXRlQmluZGluZyhcbiAgICAgICAgICB0ZW1wbGF0ZUtleSxcbiAgICAgICAgICB0ZW1wbGF0ZVZhbHVlLFxuICAgICAgICAgIGF0dHJpYnV0ZS5zb3VyY2VTcGFuLFxuICAgICAgICAgIGFic29sdXRlVmFsdWVPZmZzZXQsXG4gICAgICAgICAgW10sXG4gICAgICAgICAgdGVtcGxhdGVQYXJzZWRQcm9wZXJ0aWVzLFxuICAgICAgICAgIHBhcnNlZFZhcmlhYmxlcyxcbiAgICAgICAgICB0cnVlIC8qIGlzSXZ5QXN0ICovLFxuICAgICAgICApO1xuICAgICAgICB0ZW1wbGF0ZVZhcmlhYmxlcy5wdXNoKFxuICAgICAgICAgIC4uLnBhcnNlZFZhcmlhYmxlcy5tYXAoXG4gICAgICAgICAgICAodikgPT4gbmV3IHQuVmFyaWFibGUodi5uYW1lLCB2LnZhbHVlLCB2LnNvdXJjZVNwYW4sIHYua2V5U3Bhbiwgdi52YWx1ZVNwYW4pLFxuICAgICAgICAgICksXG4gICAgICAgICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBDaGVjayBmb3IgdmFyaWFibGVzLCBldmVudHMsIHByb3BlcnR5IGJpbmRpbmdzLCBpbnRlcnBvbGF0aW9uXG4gICAgICAgIGhhc0JpbmRpbmcgPSB0aGlzLnBhcnNlQXR0cmlidXRlKFxuICAgICAgICAgIGlzVGVtcGxhdGVFbGVtZW50LFxuICAgICAgICAgIGF0dHJpYnV0ZSxcbiAgICAgICAgICBbXSxcbiAgICAgICAgICBwYXJzZWRQcm9wZXJ0aWVzLFxuICAgICAgICAgIGJvdW5kRXZlbnRzLFxuICAgICAgICAgIHZhcmlhYmxlcyxcbiAgICAgICAgICByZWZlcmVuY2VzLFxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWhhc0JpbmRpbmcgJiYgIWlzVGVtcGxhdGVCaW5kaW5nKSB7XG4gICAgICAgIC8vIGRvbid0IGluY2x1ZGUgdGhlIGJpbmRpbmdzIGFzIGF0dHJpYnV0ZXMgYXMgd2VsbCBpbiB0aGUgQVNUXG4gICAgICAgIGF0dHJpYnV0ZXMucHVzaCh0aGlzLnZpc2l0QXR0cmlidXRlKGF0dHJpYnV0ZSkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGxldCBjaGlsZHJlbjogdC5Ob2RlW107XG5cbiAgICBpZiAocHJlcGFyc2VkRWxlbWVudC5ub25CaW5kYWJsZSkge1xuICAgICAgLy8gVGhlIGBOb25CaW5kYWJsZVZpc2l0b3JgIG1heSBuZWVkIHRvIHJldHVybiBhbiBhcnJheSBvZiBub2RlcyBmb3IgYmxvY2tzIHNvIHdlIG5lZWRcbiAgICAgIC8vIHRvIGZsYXR0ZW4gdGhlIGFycmF5IGhlcmUuIEF2b2lkIGRvaW5nIHRoaXMgZm9yIHRoZSBgSHRtbEFzdFRvSXZ5QXN0YCBzaW5jZSBgZmxhdGAgY3JlYXRlc1xuICAgICAgLy8gYSBuZXcgYXJyYXkuXG4gICAgICBjaGlsZHJlbiA9IGh0bWwudmlzaXRBbGwoTk9OX0JJTkRBQkxFX1ZJU0lUT1IsIGVsZW1lbnQuY2hpbGRyZW4pLmZsYXQoSW5maW5pdHkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjaGlsZHJlbiA9IGh0bWwudmlzaXRBbGwodGhpcywgZWxlbWVudC5jaGlsZHJlbiwgZWxlbWVudC5jaGlsZHJlbik7XG4gICAgfVxuXG4gICAgbGV0IHBhcnNlZEVsZW1lbnQ6IHQuQ29udGVudCB8IHQuVGVtcGxhdGUgfCB0LkVsZW1lbnQgfCB1bmRlZmluZWQ7XG4gICAgaWYgKHByZXBhcnNlZEVsZW1lbnQudHlwZSA9PT0gUHJlcGFyc2VkRWxlbWVudFR5cGUuTkdfQ09OVEVOVCkge1xuICAgICAgY29uc3Qgc2VsZWN0b3IgPSBwcmVwYXJzZWRFbGVtZW50LnNlbGVjdEF0dHI7XG4gICAgICBjb25zdCBhdHRyczogdC5UZXh0QXR0cmlidXRlW10gPSBlbGVtZW50LmF0dHJzLm1hcCgoYXR0cikgPT4gdGhpcy52aXNpdEF0dHJpYnV0ZShhdHRyKSk7XG4gICAgICBwYXJzZWRFbGVtZW50ID0gbmV3IHQuQ29udGVudChzZWxlY3RvciwgYXR0cnMsIGNoaWxkcmVuLCBlbGVtZW50LnNvdXJjZVNwYW4sIGVsZW1lbnQuaTE4bik7XG4gICAgICB0aGlzLm5nQ29udGVudFNlbGVjdG9ycy5wdXNoKHNlbGVjdG9yKTtcbiAgICB9IGVsc2UgaWYgKGlzVGVtcGxhdGVFbGVtZW50KSB7XG4gICAgICAvLyBgPG5nLXRlbXBsYXRlPmBcbiAgICAgIGNvbnN0IGF0dHJzID0gdGhpcy5leHRyYWN0QXR0cmlidXRlcyhlbGVtZW50Lm5hbWUsIHBhcnNlZFByb3BlcnRpZXMsIGkxOG5BdHRyc01ldGEpO1xuXG4gICAgICBwYXJzZWRFbGVtZW50ID0gbmV3IHQuVGVtcGxhdGUoXG4gICAgICAgIGVsZW1lbnQubmFtZSxcbiAgICAgICAgYXR0cmlidXRlcyxcbiAgICAgICAgYXR0cnMuYm91bmQsXG4gICAgICAgIGJvdW5kRXZlbnRzLFxuICAgICAgICBbXG4gICAgICAgICAgLyogbm8gdGVtcGxhdGUgYXR0cmlidXRlcyAqL1xuICAgICAgICBdLFxuICAgICAgICBjaGlsZHJlbixcbiAgICAgICAgcmVmZXJlbmNlcyxcbiAgICAgICAgdmFyaWFibGVzLFxuICAgICAgICBlbGVtZW50LnNvdXJjZVNwYW4sXG4gICAgICAgIGVsZW1lbnQuc3RhcnRTb3VyY2VTcGFuLFxuICAgICAgICBlbGVtZW50LmVuZFNvdXJjZVNwYW4sXG4gICAgICAgIGVsZW1lbnQuaTE4bixcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGF0dHJzID0gdGhpcy5leHRyYWN0QXR0cmlidXRlcyhlbGVtZW50Lm5hbWUsIHBhcnNlZFByb3BlcnRpZXMsIGkxOG5BdHRyc01ldGEpO1xuICAgICAgcGFyc2VkRWxlbWVudCA9IG5ldyB0LkVsZW1lbnQoXG4gICAgICAgIGVsZW1lbnQubmFtZSxcbiAgICAgICAgYXR0cmlidXRlcyxcbiAgICAgICAgYXR0cnMuYm91bmQsXG4gICAgICAgIGJvdW5kRXZlbnRzLFxuICAgICAgICBjaGlsZHJlbixcbiAgICAgICAgcmVmZXJlbmNlcyxcbiAgICAgICAgZWxlbWVudC5zb3VyY2VTcGFuLFxuICAgICAgICBlbGVtZW50LnN0YXJ0U291cmNlU3BhbixcbiAgICAgICAgZWxlbWVudC5lbmRTb3VyY2VTcGFuLFxuICAgICAgICBlbGVtZW50LmkxOG4sXG4gICAgICApO1xuICAgIH1cblxuICAgIGlmIChlbGVtZW50SGFzSW5saW5lVGVtcGxhdGUpIHtcbiAgICAgIC8vIElmIHRoaXMgbm9kZSBpcyBhbiBpbmxpbmUtdGVtcGxhdGUgKGUuZy4gaGFzICpuZ0ZvcikgdGhlbiB3ZSBuZWVkIHRvIGNyZWF0ZSBhIHRlbXBsYXRlXG4gICAgICAvLyBub2RlIHRoYXQgY29udGFpbnMgdGhpcyBub2RlLlxuICAgICAgLy8gTW9yZW92ZXIsIGlmIHRoZSBub2RlIGlzIGFuIGVsZW1lbnQsIHRoZW4gd2UgbmVlZCB0byBob2lzdCBpdHMgYXR0cmlidXRlcyB0byB0aGUgdGVtcGxhdGVcbiAgICAgIC8vIG5vZGUgZm9yIG1hdGNoaW5nIGFnYWluc3QgY29udGVudCBwcm9qZWN0aW9uIHNlbGVjdG9ycy5cbiAgICAgIGNvbnN0IGF0dHJzID0gdGhpcy5leHRyYWN0QXR0cmlidXRlcygnbmctdGVtcGxhdGUnLCB0ZW1wbGF0ZVBhcnNlZFByb3BlcnRpZXMsIGkxOG5BdHRyc01ldGEpO1xuICAgICAgY29uc3QgdGVtcGxhdGVBdHRyczogKHQuVGV4dEF0dHJpYnV0ZSB8IHQuQm91bmRBdHRyaWJ1dGUpW10gPSBbXTtcbiAgICAgIGF0dHJzLmxpdGVyYWwuZm9yRWFjaCgoYXR0cikgPT4gdGVtcGxhdGVBdHRycy5wdXNoKGF0dHIpKTtcbiAgICAgIGF0dHJzLmJvdW5kLmZvckVhY2goKGF0dHIpID0+IHRlbXBsYXRlQXR0cnMucHVzaChhdHRyKSk7XG4gICAgICBjb25zdCBob2lzdGVkQXR0cnMgPVxuICAgICAgICBwYXJzZWRFbGVtZW50IGluc3RhbmNlb2YgdC5FbGVtZW50XG4gICAgICAgICAgPyB7XG4gICAgICAgICAgICAgIGF0dHJpYnV0ZXM6IHBhcnNlZEVsZW1lbnQuYXR0cmlidXRlcyxcbiAgICAgICAgICAgICAgaW5wdXRzOiBwYXJzZWRFbGVtZW50LmlucHV0cyxcbiAgICAgICAgICAgICAgb3V0cHV0czogcGFyc2VkRWxlbWVudC5vdXRwdXRzLFxuICAgICAgICAgICAgfVxuICAgICAgICAgIDoge2F0dHJpYnV0ZXM6IFtdLCBpbnB1dHM6IFtdLCBvdXRwdXRzOiBbXX07XG5cbiAgICAgIC8vIEZvciA8bmctdGVtcGxhdGU+cyB3aXRoIHN0cnVjdHVyYWwgZGlyZWN0aXZlcyBvbiB0aGVtLCBhdm9pZCBwYXNzaW5nIGkxOG4gaW5mb3JtYXRpb24gdG9cbiAgICAgIC8vIHRoZSB3cmFwcGluZyB0ZW1wbGF0ZSB0byBwcmV2ZW50IHVubmVjZXNzYXJ5IGkxOG4gaW5zdHJ1Y3Rpb25zIGZyb20gYmVpbmcgZ2VuZXJhdGVkLiBUaGVcbiAgICAgIC8vIG5lY2Vzc2FyeSBpMThuIG1ldGEgaW5mb3JtYXRpb24gd2lsbCBiZSBleHRyYWN0ZWQgZnJvbSBjaGlsZCBlbGVtZW50cy5cbiAgICAgIGNvbnN0IGkxOG4gPSBpc1RlbXBsYXRlRWxlbWVudCAmJiBpc0kxOG5Sb290RWxlbWVudCA/IHVuZGVmaW5lZCA6IGVsZW1lbnQuaTE4bjtcbiAgICAgIGNvbnN0IG5hbWUgPSBwYXJzZWRFbGVtZW50IGluc3RhbmNlb2YgdC5UZW1wbGF0ZSA/IG51bGwgOiBwYXJzZWRFbGVtZW50Lm5hbWU7XG5cbiAgICAgIHBhcnNlZEVsZW1lbnQgPSBuZXcgdC5UZW1wbGF0ZShcbiAgICAgICAgbmFtZSxcbiAgICAgICAgaG9pc3RlZEF0dHJzLmF0dHJpYnV0ZXMsXG4gICAgICAgIGhvaXN0ZWRBdHRycy5pbnB1dHMsXG4gICAgICAgIGhvaXN0ZWRBdHRycy5vdXRwdXRzLFxuICAgICAgICB0ZW1wbGF0ZUF0dHJzLFxuICAgICAgICBbcGFyc2VkRWxlbWVudF0sXG4gICAgICAgIFtcbiAgICAgICAgICAvKiBubyByZWZlcmVuY2VzICovXG4gICAgICAgIF0sXG4gICAgICAgIHRlbXBsYXRlVmFyaWFibGVzLFxuICAgICAgICBlbGVtZW50LnNvdXJjZVNwYW4sXG4gICAgICAgIGVsZW1lbnQuc3RhcnRTb3VyY2VTcGFuLFxuICAgICAgICBlbGVtZW50LmVuZFNvdXJjZVNwYW4sXG4gICAgICAgIGkxOG4sXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoaXNJMThuUm9vdEVsZW1lbnQpIHtcbiAgICAgIHRoaXMuaW5JMThuQmxvY2sgPSBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHBhcnNlZEVsZW1lbnQ7XG4gIH1cblxuICB2aXNpdEF0dHJpYnV0ZShhdHRyaWJ1dGU6IGh0bWwuQXR0cmlidXRlKTogdC5UZXh0QXR0cmlidXRlIHtcbiAgICByZXR1cm4gbmV3IHQuVGV4dEF0dHJpYnV0ZShcbiAgICAgIGF0dHJpYnV0ZS5uYW1lLFxuICAgICAgYXR0cmlidXRlLnZhbHVlLFxuICAgICAgYXR0cmlidXRlLnNvdXJjZVNwYW4sXG4gICAgICBhdHRyaWJ1dGUua2V5U3BhbixcbiAgICAgIGF0dHJpYnV0ZS52YWx1ZVNwYW4sXG4gICAgICBhdHRyaWJ1dGUuaTE4bixcbiAgICApO1xuICB9XG5cbiAgdmlzaXRUZXh0KHRleHQ6IGh0bWwuVGV4dCk6IHQuTm9kZSB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLnByb2Nlc3NlZE5vZGVzLmhhcyh0ZXh0KVxuICAgICAgPyBudWxsXG4gICAgICA6IHRoaXMuX3Zpc2l0VGV4dFdpdGhJbnRlcnBvbGF0aW9uKHRleHQudmFsdWUsIHRleHQuc291cmNlU3BhbiwgdGV4dC50b2tlbnMsIHRleHQuaTE4bik7XG4gIH1cblxuICB2aXNpdEV4cGFuc2lvbihleHBhbnNpb246IGh0bWwuRXhwYW5zaW9uKTogdC5JY3UgfCBudWxsIHtcbiAgICBpZiAoIWV4cGFuc2lvbi5pMThuKSB7XG4gICAgICAvLyBkbyBub3QgZ2VuZXJhdGUgSWN1IGluIGNhc2UgaXQgd2FzIGNyZWF0ZWRcbiAgICAgIC8vIG91dHNpZGUgb2YgaTE4biBibG9jayBpbiBhIHRlbXBsYXRlXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgaWYgKCFpc0kxOG5Sb290Tm9kZShleHBhbnNpb24uaTE4bikpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYEludmFsaWQgdHlwZSBcIiR7ZXhwYW5zaW9uLmkxOG4uY29uc3RydWN0b3J9XCIgZm9yIFwiaTE4blwiIHByb3BlcnR5IG9mICR7ZXhwYW5zaW9uLnNvdXJjZVNwYW4udG9TdHJpbmcoKX0uIEV4cGVjdGVkIGEgXCJNZXNzYWdlXCJgLFxuICAgICAgKTtcbiAgICB9XG4gICAgY29uc3QgbWVzc2FnZSA9IGV4cGFuc2lvbi5pMThuO1xuICAgIGNvbnN0IHZhcnM6IHtbbmFtZTogc3RyaW5nXTogdC5Cb3VuZFRleHR9ID0ge307XG4gICAgY29uc3QgcGxhY2Vob2xkZXJzOiB7W25hbWU6IHN0cmluZ106IHQuVGV4dCB8IHQuQm91bmRUZXh0fSA9IHt9O1xuICAgIC8vIGV4dHJhY3QgVkFScyBmcm9tIElDVXMgLSB3ZSBwcm9jZXNzIHRoZW0gc2VwYXJhdGVseSB3aGlsZVxuICAgIC8vIGFzc2VtYmxpbmcgcmVzdWx0aW5nIG1lc3NhZ2UgdmlhIGdvb2cuZ2V0TXNnIGZ1bmN0aW9uLCBzaW5jZVxuICAgIC8vIHdlIG5lZWQgdG8gcGFzcyB0aGVtIHRvIHRvcC1sZXZlbCBnb29nLmdldE1zZyBjYWxsXG4gICAgT2JqZWN0LmtleXMobWVzc2FnZS5wbGFjZWhvbGRlcnMpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgY29uc3QgdmFsdWUgPSBtZXNzYWdlLnBsYWNlaG9sZGVyc1trZXldO1xuICAgICAgaWYgKGtleS5zdGFydHNXaXRoKEkxOE5fSUNVX1ZBUl9QUkVGSVgpKSB7XG4gICAgICAgIC8vIEN1cnJlbnRseSB3aGVuIHRoZSBgcGx1cmFsYCBvciBgc2VsZWN0YCBrZXl3b3JkcyBpbiBhbiBJQ1UgY29udGFpbiB0cmFpbGluZyBzcGFjZXMgKGUuZy5cbiAgICAgICAgLy8gYHtjb3VudCwgc2VsZWN0ICwgLi4ufWApLCB0aGVzZSBzcGFjZXMgYXJlIGFsc28gaW5jbHVkZWQgaW50byB0aGUga2V5IG5hbWVzIGluIElDVSB2YXJzXG4gICAgICAgIC8vIChlLmcuIFwiVkFSX1NFTEVDVCBcIikuIFRoZXNlIHRyYWlsaW5nIHNwYWNlcyBhcmUgbm90IGRlc2lyYWJsZSwgc2luY2UgdGhleSB3aWxsIGxhdGVyIGJlXG4gICAgICAgIC8vIGNvbnZlcnRlZCBpbnRvIGBfYCBzeW1ib2xzIHdoaWxlIG5vcm1hbGl6aW5nIHBsYWNlaG9sZGVyIG5hbWVzLCB3aGljaCBtaWdodCBsZWFkIHRvXG4gICAgICAgIC8vIG1pc21hdGNoZXMgYXQgcnVudGltZSAoaS5lLiBwbGFjZWhvbGRlciB3aWxsIG5vdCBiZSByZXBsYWNlZCB3aXRoIHRoZSBjb3JyZWN0IHZhbHVlKS5cbiAgICAgICAgY29uc3QgZm9ybWF0dGVkS2V5ID0ga2V5LnRyaW0oKTtcblxuICAgICAgICBjb25zdCBhc3QgPSB0aGlzLmJpbmRpbmdQYXJzZXIucGFyc2VJbnRlcnBvbGF0aW9uRXhwcmVzc2lvbih2YWx1ZS50ZXh0LCB2YWx1ZS5zb3VyY2VTcGFuKTtcblxuICAgICAgICB2YXJzW2Zvcm1hdHRlZEtleV0gPSBuZXcgdC5Cb3VuZFRleHQoYXN0LCB2YWx1ZS5zb3VyY2VTcGFuKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBsYWNlaG9sZGVyc1trZXldID0gdGhpcy5fdmlzaXRUZXh0V2l0aEludGVycG9sYXRpb24odmFsdWUudGV4dCwgdmFsdWUuc291cmNlU3BhbiwgbnVsbCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIG5ldyB0LkljdSh2YXJzLCBwbGFjZWhvbGRlcnMsIGV4cGFuc2lvbi5zb3VyY2VTcGFuLCBtZXNzYWdlKTtcbiAgfVxuXG4gIHZpc2l0RXhwYW5zaW9uQ2FzZShleHBhbnNpb25DYXNlOiBodG1sLkV4cGFuc2lvbkNhc2UpOiBudWxsIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHZpc2l0Q29tbWVudChjb21tZW50OiBodG1sLkNvbW1lbnQpOiBudWxsIHtcbiAgICBpZiAodGhpcy5vcHRpb25zLmNvbGxlY3RDb21tZW50Tm9kZXMpIHtcbiAgICAgIHRoaXMuY29tbWVudE5vZGVzLnB1c2gobmV3IHQuQ29tbWVudChjb21tZW50LnZhbHVlIHx8ICcnLCBjb21tZW50LnNvdXJjZVNwYW4pKTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICB2aXNpdExldERlY2xhcmF0aW9uKGRlY2w6IGh0bWwuTGV0RGVjbGFyYXRpb24sIGNvbnRleHQ6IGFueSkge1xuICAgIGNvbnN0IHZhbHVlID0gdGhpcy5iaW5kaW5nUGFyc2VyLnBhcnNlQmluZGluZyhcbiAgICAgIGRlY2wudmFsdWUsXG4gICAgICBmYWxzZSxcbiAgICAgIGRlY2wudmFsdWVTcGFuLFxuICAgICAgZGVjbC52YWx1ZVNwYW4uc3RhcnQub2Zmc2V0LFxuICAgICk7XG5cbiAgICBpZiAodmFsdWUuZXJyb3JzLmxlbmd0aCA9PT0gMCAmJiB2YWx1ZS5hc3QgaW5zdGFuY2VvZiBFbXB0eUV4cHIpIHtcbiAgICAgIHRoaXMucmVwb3J0RXJyb3IoJ0BsZXQgZGVjbGFyYXRpb24gdmFsdWUgY2Fubm90IGJlIGVtcHR5JywgZGVjbC52YWx1ZVNwYW4pO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgdC5MZXREZWNsYXJhdGlvbihkZWNsLm5hbWUsIHZhbHVlLCBkZWNsLnNvdXJjZVNwYW4sIGRlY2wubmFtZVNwYW4sIGRlY2wudmFsdWVTcGFuKTtcbiAgfVxuXG4gIHZpc2l0QmxvY2tQYXJhbWV0ZXIoKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICB2aXNpdEJsb2NrKGJsb2NrOiBodG1sLkJsb2NrLCBjb250ZXh0OiBodG1sLk5vZGVbXSkge1xuICAgIGNvbnN0IGluZGV4ID0gQXJyYXkuaXNBcnJheShjb250ZXh0KSA/IGNvbnRleHQuaW5kZXhPZihibG9jaykgOiAtMTtcblxuICAgIGlmIChpbmRleCA9PT0gLTEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgJ1Zpc2l0b3IgaW52b2tlZCBpbmNvcnJlY3RseS4gRXhwZWN0aW5nIHZpc2l0QmxvY2sgdG8gYmUgaW52b2tlZCBzaWJsaW5ncyBhcnJheSBhcyBpdHMgY29udGV4dCcsXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIENvbm5lY3RlZCBibG9ja3MgbWF5IGhhdmUgYmVlbiBwcm9jZXNzZWQgYXMgYSBwYXJ0IG9mIHRoZSBwcmV2aW91cyBibG9jay5cbiAgICBpZiAodGhpcy5wcm9jZXNzZWROb2Rlcy5oYXMoYmxvY2spKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBsZXQgcmVzdWx0OiB7bm9kZTogdC5Ob2RlIHwgbnVsbDsgZXJyb3JzOiBQYXJzZUVycm9yW119IHwgbnVsbCA9IG51bGw7XG5cbiAgICBzd2l0Y2ggKGJsb2NrLm5hbWUpIHtcbiAgICAgIGNhc2UgJ2RlZmVyJzpcbiAgICAgICAgcmVzdWx0ID0gY3JlYXRlRGVmZXJyZWRCbG9jayhcbiAgICAgICAgICBibG9jayxcbiAgICAgICAgICB0aGlzLmZpbmRDb25uZWN0ZWRCbG9ja3MoaW5kZXgsIGNvbnRleHQsIGlzQ29ubmVjdGVkRGVmZXJMb29wQmxvY2spLFxuICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgdGhpcy5iaW5kaW5nUGFyc2VyLFxuICAgICAgICApO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnc3dpdGNoJzpcbiAgICAgICAgcmVzdWx0ID0gY3JlYXRlU3dpdGNoQmxvY2soYmxvY2ssIHRoaXMsIHRoaXMuYmluZGluZ1BhcnNlcik7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdmb3InOlxuICAgICAgICByZXN1bHQgPSBjcmVhdGVGb3JMb29wKFxuICAgICAgICAgIGJsb2NrLFxuICAgICAgICAgIHRoaXMuZmluZENvbm5lY3RlZEJsb2NrcyhpbmRleCwgY29udGV4dCwgaXNDb25uZWN0ZWRGb3JMb29wQmxvY2spLFxuICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgdGhpcy5iaW5kaW5nUGFyc2VyLFxuICAgICAgICApO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnaWYnOlxuICAgICAgICByZXN1bHQgPSBjcmVhdGVJZkJsb2NrKFxuICAgICAgICAgIGJsb2NrLFxuICAgICAgICAgIHRoaXMuZmluZENvbm5lY3RlZEJsb2NrcyhpbmRleCwgY29udGV4dCwgaXNDb25uZWN0ZWRJZkxvb3BCbG9jayksXG4gICAgICAgICAgdGhpcyxcbiAgICAgICAgICB0aGlzLmJpbmRpbmdQYXJzZXIsXG4gICAgICAgICk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBsZXQgZXJyb3JNZXNzYWdlOiBzdHJpbmc7XG5cbiAgICAgICAgaWYgKGlzQ29ubmVjdGVkRGVmZXJMb29wQmxvY2soYmxvY2submFtZSkpIHtcbiAgICAgICAgICBlcnJvck1lc3NhZ2UgPSBgQCR7YmxvY2submFtZX0gYmxvY2sgY2FuIG9ubHkgYmUgdXNlZCBhZnRlciBhbiBAZGVmZXIgYmxvY2suYDtcbiAgICAgICAgICB0aGlzLnByb2Nlc3NlZE5vZGVzLmFkZChibG9jayk7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNDb25uZWN0ZWRGb3JMb29wQmxvY2soYmxvY2submFtZSkpIHtcbiAgICAgICAgICBlcnJvck1lc3NhZ2UgPSBgQCR7YmxvY2submFtZX0gYmxvY2sgY2FuIG9ubHkgYmUgdXNlZCBhZnRlciBhbiBAZm9yIGJsb2NrLmA7XG4gICAgICAgICAgdGhpcy5wcm9jZXNzZWROb2Rlcy5hZGQoYmxvY2spO1xuICAgICAgICB9IGVsc2UgaWYgKGlzQ29ubmVjdGVkSWZMb29wQmxvY2soYmxvY2submFtZSkpIHtcbiAgICAgICAgICBlcnJvck1lc3NhZ2UgPSBgQCR7YmxvY2submFtZX0gYmxvY2sgY2FuIG9ubHkgYmUgdXNlZCBhZnRlciBhbiBAaWYgb3IgQGVsc2UgaWYgYmxvY2suYDtcbiAgICAgICAgICB0aGlzLnByb2Nlc3NlZE5vZGVzLmFkZChibG9jayk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZXJyb3JNZXNzYWdlID0gYFVucmVjb2duaXplZCBibG9jayBAJHtibG9jay5uYW1lfS5gO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVzdWx0ID0ge1xuICAgICAgICAgIG5vZGU6IG5ldyB0LlVua25vd25CbG9jayhibG9jay5uYW1lLCBibG9jay5zb3VyY2VTcGFuLCBibG9jay5uYW1lU3BhbiksXG4gICAgICAgICAgZXJyb3JzOiBbbmV3IFBhcnNlRXJyb3IoYmxvY2suc291cmNlU3BhbiwgZXJyb3JNZXNzYWdlKV0sXG4gICAgICAgIH07XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIHRoaXMuZXJyb3JzLnB1c2goLi4ucmVzdWx0LmVycm9ycyk7XG4gICAgcmV0dXJuIHJlc3VsdC5ub2RlO1xuICB9XG5cbiAgcHJpdmF0ZSBmaW5kQ29ubmVjdGVkQmxvY2tzKFxuICAgIHByaW1hcnlCbG9ja0luZGV4OiBudW1iZXIsXG4gICAgc2libGluZ3M6IGh0bWwuTm9kZVtdLFxuICAgIHByZWRpY2F0ZTogKGJsb2NrTmFtZTogc3RyaW5nKSA9PiBib29sZWFuLFxuICApOiBodG1sLkJsb2NrW10ge1xuICAgIGNvbnN0IHJlbGF0ZWRCbG9ja3M6IGh0bWwuQmxvY2tbXSA9IFtdO1xuXG4gICAgZm9yIChsZXQgaSA9IHByaW1hcnlCbG9ja0luZGV4ICsgMTsgaSA8IHNpYmxpbmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBub2RlID0gc2libGluZ3NbaV07XG5cbiAgICAgIC8vIFNraXAgb3ZlciBjb21tZW50cy5cbiAgICAgIGlmIChub2RlIGluc3RhbmNlb2YgaHRtbC5Db21tZW50KSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBJZ25vcmUgZW1wdHkgdGV4dCBub2RlcyBiZXR3ZWVuIGJsb2Nrcy5cbiAgICAgIGlmIChub2RlIGluc3RhbmNlb2YgaHRtbC5UZXh0ICYmIG5vZGUudmFsdWUudHJpbSgpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAvLyBBZGQgdGhlIHRleHQgbm9kZSB0byB0aGUgcHJvY2Vzc2VkIG5vZGVzIHNpbmNlIHdlIGRvbid0IHdhbnRcbiAgICAgICAgLy8gaXQgdG8gYmUgZ2VuZXJhdGVkIGJldHdlZW4gdGhlIGNvbm5lY3RlZCBub2Rlcy5cbiAgICAgICAgdGhpcy5wcm9jZXNzZWROb2Rlcy5hZGQobm9kZSk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBTdG9wIHNlYXJjaGluZyBhcyBzb29uIGFzIHdlIGhpdCBhIG5vbi1ibG9jayBub2RlIG9yIGEgYmxvY2sgdGhhdCBpcyB1bnJlbGF0ZWQuXG4gICAgICBpZiAoIShub2RlIGluc3RhbmNlb2YgaHRtbC5CbG9jaykgfHwgIXByZWRpY2F0ZShub2RlLm5hbWUpKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICByZWxhdGVkQmxvY2tzLnB1c2gobm9kZSk7XG4gICAgICB0aGlzLnByb2Nlc3NlZE5vZGVzLmFkZChub2RlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVsYXRlZEJsb2NrcztcbiAgfVxuXG4gIC8vIGNvbnZlcnQgdmlldyBlbmdpbmUgYFBhcnNlZFByb3BlcnR5YCB0byBhIGZvcm1hdCBzdWl0YWJsZSBmb3IgSVZZXG4gIHByaXZhdGUgZXh0cmFjdEF0dHJpYnV0ZXMoXG4gICAgZWxlbWVudE5hbWU6IHN0cmluZyxcbiAgICBwcm9wZXJ0aWVzOiBQYXJzZWRQcm9wZXJ0eVtdLFxuICAgIGkxOG5Qcm9wc01ldGE6IHtba2V5OiBzdHJpbmddOiBpMThuLkkxOG5NZXRhfSxcbiAgKToge2JvdW5kOiB0LkJvdW5kQXR0cmlidXRlW107IGxpdGVyYWw6IHQuVGV4dEF0dHJpYnV0ZVtdfSB7XG4gICAgY29uc3QgYm91bmQ6IHQuQm91bmRBdHRyaWJ1dGVbXSA9IFtdO1xuICAgIGNvbnN0IGxpdGVyYWw6IHQuVGV4dEF0dHJpYnV0ZVtdID0gW107XG5cbiAgICBwcm9wZXJ0aWVzLmZvckVhY2goKHByb3ApID0+IHtcbiAgICAgIGNvbnN0IGkxOG4gPSBpMThuUHJvcHNNZXRhW3Byb3AubmFtZV07XG4gICAgICBpZiAocHJvcC5pc0xpdGVyYWwpIHtcbiAgICAgICAgbGl0ZXJhbC5wdXNoKFxuICAgICAgICAgIG5ldyB0LlRleHRBdHRyaWJ1dGUoXG4gICAgICAgICAgICBwcm9wLm5hbWUsXG4gICAgICAgICAgICBwcm9wLmV4cHJlc3Npb24uc291cmNlIHx8ICcnLFxuICAgICAgICAgICAgcHJvcC5zb3VyY2VTcGFuLFxuICAgICAgICAgICAgcHJvcC5rZXlTcGFuLFxuICAgICAgICAgICAgcHJvcC52YWx1ZVNwYW4sXG4gICAgICAgICAgICBpMThuLFxuICAgICAgICAgICksXG4gICAgICAgICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBOb3RlIHRoYXQgdmFsaWRhdGlvbiBpcyBza2lwcGVkIGFuZCBwcm9wZXJ0eSBtYXBwaW5nIGlzIGRpc2FibGVkXG4gICAgICAgIC8vIGR1ZSB0byB0aGUgZmFjdCB0aGF0IHdlIG5lZWQgdG8gbWFrZSBzdXJlIGEgZ2l2ZW4gcHJvcCBpcyBub3QgYW5cbiAgICAgICAgLy8gaW5wdXQgb2YgYSBkaXJlY3RpdmUgYW5kIGRpcmVjdGl2ZSBtYXRjaGluZyBoYXBwZW5zIGF0IHJ1bnRpbWUuXG4gICAgICAgIGNvbnN0IGJlcCA9IHRoaXMuYmluZGluZ1BhcnNlci5jcmVhdGVCb3VuZEVsZW1lbnRQcm9wZXJ0eShcbiAgICAgICAgICBlbGVtZW50TmFtZSxcbiAgICAgICAgICBwcm9wLFxuICAgICAgICAgIC8qIHNraXBWYWxpZGF0aW9uICovIHRydWUsXG4gICAgICAgICAgLyogbWFwUHJvcGVydHlOYW1lICovIGZhbHNlLFxuICAgICAgICApO1xuICAgICAgICBib3VuZC5wdXNoKHQuQm91bmRBdHRyaWJ1dGUuZnJvbUJvdW5kRWxlbWVudFByb3BlcnR5KGJlcCwgaTE4bikpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHtib3VuZCwgbGl0ZXJhbH07XG4gIH1cblxuICBwcml2YXRlIHBhcnNlQXR0cmlidXRlKFxuICAgIGlzVGVtcGxhdGVFbGVtZW50OiBib29sZWFuLFxuICAgIGF0dHJpYnV0ZTogaHRtbC5BdHRyaWJ1dGUsXG4gICAgbWF0Y2hhYmxlQXR0cmlidXRlczogc3RyaW5nW11bXSxcbiAgICBwYXJzZWRQcm9wZXJ0aWVzOiBQYXJzZWRQcm9wZXJ0eVtdLFxuICAgIGJvdW5kRXZlbnRzOiB0LkJvdW5kRXZlbnRbXSxcbiAgICB2YXJpYWJsZXM6IHQuVmFyaWFibGVbXSxcbiAgICByZWZlcmVuY2VzOiB0LlJlZmVyZW5jZVtdLFxuICApIHtcbiAgICBjb25zdCBuYW1lID0gbm9ybWFsaXplQXR0cmlidXRlTmFtZShhdHRyaWJ1dGUubmFtZSk7XG4gICAgY29uc3QgdmFsdWUgPSBhdHRyaWJ1dGUudmFsdWU7XG4gICAgY29uc3Qgc3JjU3BhbiA9IGF0dHJpYnV0ZS5zb3VyY2VTcGFuO1xuICAgIGNvbnN0IGFic29sdXRlT2Zmc2V0ID0gYXR0cmlidXRlLnZhbHVlU3BhblxuICAgICAgPyBhdHRyaWJ1dGUudmFsdWVTcGFuLnN0YXJ0Lm9mZnNldFxuICAgICAgOiBzcmNTcGFuLnN0YXJ0Lm9mZnNldDtcblxuICAgIGZ1bmN0aW9uIGNyZWF0ZUtleVNwYW4oc3JjU3BhbjogUGFyc2VTb3VyY2VTcGFuLCBwcmVmaXg6IHN0cmluZywgaWRlbnRpZmllcjogc3RyaW5nKSB7XG4gICAgICAvLyBXZSBuZWVkIHRvIGFkanVzdCB0aGUgc3RhcnQgbG9jYXRpb24gZm9yIHRoZSBrZXlTcGFuIHRvIGFjY291bnQgZm9yIHRoZSByZW1vdmVkICdkYXRhLSdcbiAgICAgIC8vIHByZWZpeCBmcm9tIGBub3JtYWxpemVBdHRyaWJ1dGVOYW1lYC5cbiAgICAgIGNvbnN0IG5vcm1hbGl6YXRpb25BZGp1c3RtZW50ID0gYXR0cmlidXRlLm5hbWUubGVuZ3RoIC0gbmFtZS5sZW5ndGg7XG4gICAgICBjb25zdCBrZXlTcGFuU3RhcnQgPSBzcmNTcGFuLnN0YXJ0Lm1vdmVCeShwcmVmaXgubGVuZ3RoICsgbm9ybWFsaXphdGlvbkFkanVzdG1lbnQpO1xuICAgICAgY29uc3Qga2V5U3BhbkVuZCA9IGtleVNwYW5TdGFydC5tb3ZlQnkoaWRlbnRpZmllci5sZW5ndGgpO1xuICAgICAgcmV0dXJuIG5ldyBQYXJzZVNvdXJjZVNwYW4oa2V5U3BhblN0YXJ0LCBrZXlTcGFuRW5kLCBrZXlTcGFuU3RhcnQsIGlkZW50aWZpZXIpO1xuICAgIH1cblxuICAgIGNvbnN0IGJpbmRQYXJ0cyA9IG5hbWUubWF0Y2goQklORF9OQU1FX1JFR0VYUCk7XG5cbiAgICBpZiAoYmluZFBhcnRzKSB7XG4gICAgICBpZiAoYmluZFBhcnRzW0tXX0JJTkRfSURYXSAhPSBudWxsKSB7XG4gICAgICAgIGNvbnN0IGlkZW50aWZpZXIgPSBiaW5kUGFydHNbSURFTlRfS1dfSURYXTtcbiAgICAgICAgY29uc3Qga2V5U3BhbiA9IGNyZWF0ZUtleVNwYW4oc3JjU3BhbiwgYmluZFBhcnRzW0tXX0JJTkRfSURYXSwgaWRlbnRpZmllcik7XG4gICAgICAgIHRoaXMuYmluZGluZ1BhcnNlci5wYXJzZVByb3BlcnR5QmluZGluZyhcbiAgICAgICAgICBpZGVudGlmaWVyLFxuICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgIGZhbHNlLFxuICAgICAgICAgIGZhbHNlLFxuICAgICAgICAgIHNyY1NwYW4sXG4gICAgICAgICAgYWJzb2x1dGVPZmZzZXQsXG4gICAgICAgICAgYXR0cmlidXRlLnZhbHVlU3BhbixcbiAgICAgICAgICBtYXRjaGFibGVBdHRyaWJ1dGVzLFxuICAgICAgICAgIHBhcnNlZFByb3BlcnRpZXMsXG4gICAgICAgICAga2V5U3BhbixcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSBpZiAoYmluZFBhcnRzW0tXX0xFVF9JRFhdKSB7XG4gICAgICAgIGlmIChpc1RlbXBsYXRlRWxlbWVudCkge1xuICAgICAgICAgIGNvbnN0IGlkZW50aWZpZXIgPSBiaW5kUGFydHNbSURFTlRfS1dfSURYXTtcbiAgICAgICAgICBjb25zdCBrZXlTcGFuID0gY3JlYXRlS2V5U3BhbihzcmNTcGFuLCBiaW5kUGFydHNbS1dfTEVUX0lEWF0sIGlkZW50aWZpZXIpO1xuICAgICAgICAgIHRoaXMucGFyc2VWYXJpYWJsZShpZGVudGlmaWVyLCB2YWx1ZSwgc3JjU3Bhbiwga2V5U3BhbiwgYXR0cmlidXRlLnZhbHVlU3BhbiwgdmFyaWFibGVzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnJlcG9ydEVycm9yKGBcImxldC1cIiBpcyBvbmx5IHN1cHBvcnRlZCBvbiBuZy10ZW1wbGF0ZSBlbGVtZW50cy5gLCBzcmNTcGFuKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChiaW5kUGFydHNbS1dfUkVGX0lEWF0pIHtcbiAgICAgICAgY29uc3QgaWRlbnRpZmllciA9IGJpbmRQYXJ0c1tJREVOVF9LV19JRFhdO1xuICAgICAgICBjb25zdCBrZXlTcGFuID0gY3JlYXRlS2V5U3BhbihzcmNTcGFuLCBiaW5kUGFydHNbS1dfUkVGX0lEWF0sIGlkZW50aWZpZXIpO1xuICAgICAgICB0aGlzLnBhcnNlUmVmZXJlbmNlKGlkZW50aWZpZXIsIHZhbHVlLCBzcmNTcGFuLCBrZXlTcGFuLCBhdHRyaWJ1dGUudmFsdWVTcGFuLCByZWZlcmVuY2VzKTtcbiAgICAgIH0gZWxzZSBpZiAoYmluZFBhcnRzW0tXX09OX0lEWF0pIHtcbiAgICAgICAgY29uc3QgZXZlbnRzOiBQYXJzZWRFdmVudFtdID0gW107XG4gICAgICAgIGNvbnN0IGlkZW50aWZpZXIgPSBiaW5kUGFydHNbSURFTlRfS1dfSURYXTtcbiAgICAgICAgY29uc3Qga2V5U3BhbiA9IGNyZWF0ZUtleVNwYW4oc3JjU3BhbiwgYmluZFBhcnRzW0tXX09OX0lEWF0sIGlkZW50aWZpZXIpO1xuICAgICAgICB0aGlzLmJpbmRpbmdQYXJzZXIucGFyc2VFdmVudChcbiAgICAgICAgICBpZGVudGlmaWVyLFxuICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgIC8qIGlzQXNzaWdubWVudEV2ZW50ICovIGZhbHNlLFxuICAgICAgICAgIHNyY1NwYW4sXG4gICAgICAgICAgYXR0cmlidXRlLnZhbHVlU3BhbiB8fCBzcmNTcGFuLFxuICAgICAgICAgIG1hdGNoYWJsZUF0dHJpYnV0ZXMsXG4gICAgICAgICAgZXZlbnRzLFxuICAgICAgICAgIGtleVNwYW4sXG4gICAgICAgICk7XG4gICAgICAgIGFkZEV2ZW50cyhldmVudHMsIGJvdW5kRXZlbnRzKTtcbiAgICAgIH0gZWxzZSBpZiAoYmluZFBhcnRzW0tXX0JJTkRPTl9JRFhdKSB7XG4gICAgICAgIGNvbnN0IGlkZW50aWZpZXIgPSBiaW5kUGFydHNbSURFTlRfS1dfSURYXTtcbiAgICAgICAgY29uc3Qga2V5U3BhbiA9IGNyZWF0ZUtleVNwYW4oc3JjU3BhbiwgYmluZFBhcnRzW0tXX0JJTkRPTl9JRFhdLCBpZGVudGlmaWVyKTtcbiAgICAgICAgdGhpcy5iaW5kaW5nUGFyc2VyLnBhcnNlUHJvcGVydHlCaW5kaW5nKFxuICAgICAgICAgIGlkZW50aWZpZXIsXG4gICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgZmFsc2UsXG4gICAgICAgICAgdHJ1ZSxcbiAgICAgICAgICBzcmNTcGFuLFxuICAgICAgICAgIGFic29sdXRlT2Zmc2V0LFxuICAgICAgICAgIGF0dHJpYnV0ZS52YWx1ZVNwYW4sXG4gICAgICAgICAgbWF0Y2hhYmxlQXR0cmlidXRlcyxcbiAgICAgICAgICBwYXJzZWRQcm9wZXJ0aWVzLFxuICAgICAgICAgIGtleVNwYW4sXG4gICAgICAgICk7XG4gICAgICAgIHRoaXMucGFyc2VBc3NpZ25tZW50RXZlbnQoXG4gICAgICAgICAgaWRlbnRpZmllcixcbiAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICBzcmNTcGFuLFxuICAgICAgICAgIGF0dHJpYnV0ZS52YWx1ZVNwYW4sXG4gICAgICAgICAgbWF0Y2hhYmxlQXR0cmlidXRlcyxcbiAgICAgICAgICBib3VuZEV2ZW50cyxcbiAgICAgICAgICBrZXlTcGFuLFxuICAgICAgICApO1xuICAgICAgfSBlbHNlIGlmIChiaW5kUGFydHNbS1dfQVRfSURYXSkge1xuICAgICAgICBjb25zdCBrZXlTcGFuID0gY3JlYXRlS2V5U3BhbihzcmNTcGFuLCAnJywgbmFtZSk7XG4gICAgICAgIHRoaXMuYmluZGluZ1BhcnNlci5wYXJzZUxpdGVyYWxBdHRyKFxuICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgc3JjU3BhbixcbiAgICAgICAgICBhYnNvbHV0ZU9mZnNldCxcbiAgICAgICAgICBhdHRyaWJ1dGUudmFsdWVTcGFuLFxuICAgICAgICAgIG1hdGNoYWJsZUF0dHJpYnV0ZXMsXG4gICAgICAgICAgcGFyc2VkUHJvcGVydGllcyxcbiAgICAgICAgICBrZXlTcGFuLFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gV2UgZGlkbid0IHNlZSBhIGt3LXByZWZpeGVkIHByb3BlcnR5IGJpbmRpbmcsIGJ1dCB3ZSBoYXZlIG5vdCB5ZXQgY2hlY2tlZFxuICAgIC8vIGZvciB0aGUgW10vKCkvWygpXSBzeW50YXguXG4gICAgbGV0IGRlbGltczoge3N0YXJ0OiBzdHJpbmc7IGVuZDogc3RyaW5nfSB8IG51bGwgPSBudWxsO1xuICAgIGlmIChuYW1lLnN0YXJ0c1dpdGgoQklORElOR19ERUxJTVMuQkFOQU5BX0JPWC5zdGFydCkpIHtcbiAgICAgIGRlbGltcyA9IEJJTkRJTkdfREVMSU1TLkJBTkFOQV9CT1g7XG4gICAgfSBlbHNlIGlmIChuYW1lLnN0YXJ0c1dpdGgoQklORElOR19ERUxJTVMuUFJPUEVSVFkuc3RhcnQpKSB7XG4gICAgICBkZWxpbXMgPSBCSU5ESU5HX0RFTElNUy5QUk9QRVJUWTtcbiAgICB9IGVsc2UgaWYgKG5hbWUuc3RhcnRzV2l0aChCSU5ESU5HX0RFTElNUy5FVkVOVC5zdGFydCkpIHtcbiAgICAgIGRlbGltcyA9IEJJTkRJTkdfREVMSU1TLkVWRU5UO1xuICAgIH1cbiAgICBpZiAoXG4gICAgICBkZWxpbXMgIT09IG51bGwgJiZcbiAgICAgIC8vIE5PVEU6IG9sZGVyIHZlcnNpb25zIG9mIHRoZSBwYXJzZXIgd291bGQgbWF0Y2ggYSBzdGFydC9lbmQgZGVsaW1pdGVkXG4gICAgICAvLyBiaW5kaW5nIGlmZiB0aGUgcHJvcGVydHkgbmFtZSB3YXMgdGVybWluYXRlZCBieSB0aGUgZW5kaW5nIGRlbGltaXRlclxuICAgICAgLy8gYW5kIHRoZSBpZGVudGlmaWVyIGluIHRoZSBiaW5kaW5nIHdhcyBub24tZW1wdHkuXG4gICAgICAvLyBUT0RPKGF5YXpoYWZpeik6IHVwZGF0ZSB0aGlzIHRvIGhhbmRsZSBtYWxmb3JtZWQgYmluZGluZ3MuXG4gICAgICBuYW1lLmVuZHNXaXRoKGRlbGltcy5lbmQpICYmXG4gICAgICBuYW1lLmxlbmd0aCA+IGRlbGltcy5zdGFydC5sZW5ndGggKyBkZWxpbXMuZW5kLmxlbmd0aFxuICAgICkge1xuICAgICAgY29uc3QgaWRlbnRpZmllciA9IG5hbWUuc3Vic3RyaW5nKGRlbGltcy5zdGFydC5sZW5ndGgsIG5hbWUubGVuZ3RoIC0gZGVsaW1zLmVuZC5sZW5ndGgpO1xuICAgICAgY29uc3Qga2V5U3BhbiA9IGNyZWF0ZUtleVNwYW4oc3JjU3BhbiwgZGVsaW1zLnN0YXJ0LCBpZGVudGlmaWVyKTtcbiAgICAgIGlmIChkZWxpbXMuc3RhcnQgPT09IEJJTkRJTkdfREVMSU1TLkJBTkFOQV9CT1guc3RhcnQpIHtcbiAgICAgICAgdGhpcy5iaW5kaW5nUGFyc2VyLnBhcnNlUHJvcGVydHlCaW5kaW5nKFxuICAgICAgICAgIGlkZW50aWZpZXIsXG4gICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgZmFsc2UsXG4gICAgICAgICAgdHJ1ZSxcbiAgICAgICAgICBzcmNTcGFuLFxuICAgICAgICAgIGFic29sdXRlT2Zmc2V0LFxuICAgICAgICAgIGF0dHJpYnV0ZS52YWx1ZVNwYW4sXG4gICAgICAgICAgbWF0Y2hhYmxlQXR0cmlidXRlcyxcbiAgICAgICAgICBwYXJzZWRQcm9wZXJ0aWVzLFxuICAgICAgICAgIGtleVNwYW4sXG4gICAgICAgICk7XG4gICAgICAgIHRoaXMucGFyc2VBc3NpZ25tZW50RXZlbnQoXG4gICAgICAgICAgaWRlbnRpZmllcixcbiAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICBzcmNTcGFuLFxuICAgICAgICAgIGF0dHJpYnV0ZS52YWx1ZVNwYW4sXG4gICAgICAgICAgbWF0Y2hhYmxlQXR0cmlidXRlcyxcbiAgICAgICAgICBib3VuZEV2ZW50cyxcbiAgICAgICAgICBrZXlTcGFuLFxuICAgICAgICApO1xuICAgICAgfSBlbHNlIGlmIChkZWxpbXMuc3RhcnQgPT09IEJJTkRJTkdfREVMSU1TLlBST1BFUlRZLnN0YXJ0KSB7XG4gICAgICAgIHRoaXMuYmluZGluZ1BhcnNlci5wYXJzZVByb3BlcnR5QmluZGluZyhcbiAgICAgICAgICBpZGVudGlmaWVyLFxuICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgIGZhbHNlLFxuICAgICAgICAgIGZhbHNlLFxuICAgICAgICAgIHNyY1NwYW4sXG4gICAgICAgICAgYWJzb2x1dGVPZmZzZXQsXG4gICAgICAgICAgYXR0cmlidXRlLnZhbHVlU3BhbixcbiAgICAgICAgICBtYXRjaGFibGVBdHRyaWJ1dGVzLFxuICAgICAgICAgIHBhcnNlZFByb3BlcnRpZXMsXG4gICAgICAgICAga2V5U3BhbixcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGV2ZW50czogUGFyc2VkRXZlbnRbXSA9IFtdO1xuICAgICAgICB0aGlzLmJpbmRpbmdQYXJzZXIucGFyc2VFdmVudChcbiAgICAgICAgICBpZGVudGlmaWVyLFxuICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgIC8qIGlzQXNzaWdubWVudEV2ZW50ICovIGZhbHNlLFxuICAgICAgICAgIHNyY1NwYW4sXG4gICAgICAgICAgYXR0cmlidXRlLnZhbHVlU3BhbiB8fCBzcmNTcGFuLFxuICAgICAgICAgIG1hdGNoYWJsZUF0dHJpYnV0ZXMsXG4gICAgICAgICAgZXZlbnRzLFxuICAgICAgICAgIGtleVNwYW4sXG4gICAgICAgICk7XG4gICAgICAgIGFkZEV2ZW50cyhldmVudHMsIGJvdW5kRXZlbnRzKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gTm8gZXhwbGljaXQgYmluZGluZyBmb3VuZC5cbiAgICBjb25zdCBrZXlTcGFuID0gY3JlYXRlS2V5U3BhbihzcmNTcGFuLCAnJyAvKiBwcmVmaXggKi8sIG5hbWUpO1xuICAgIGNvbnN0IGhhc0JpbmRpbmcgPSB0aGlzLmJpbmRpbmdQYXJzZXIucGFyc2VQcm9wZXJ0eUludGVycG9sYXRpb24oXG4gICAgICBuYW1lLFxuICAgICAgdmFsdWUsXG4gICAgICBzcmNTcGFuLFxuICAgICAgYXR0cmlidXRlLnZhbHVlU3BhbixcbiAgICAgIG1hdGNoYWJsZUF0dHJpYnV0ZXMsXG4gICAgICBwYXJzZWRQcm9wZXJ0aWVzLFxuICAgICAga2V5U3BhbixcbiAgICAgIGF0dHJpYnV0ZS52YWx1ZVRva2VucyA/PyBudWxsLFxuICAgICk7XG4gICAgcmV0dXJuIGhhc0JpbmRpbmc7XG4gIH1cblxuICBwcml2YXRlIF92aXNpdFRleHRXaXRoSW50ZXJwb2xhdGlvbihcbiAgICB2YWx1ZTogc3RyaW5nLFxuICAgIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICBpbnRlcnBvbGF0ZWRUb2tlbnM6IEludGVycG9sYXRlZEF0dHJpYnV0ZVRva2VuW10gfCBJbnRlcnBvbGF0ZWRUZXh0VG9rZW5bXSB8IG51bGwsXG4gICAgaTE4bj86IGkxOG4uSTE4bk1ldGEsXG4gICk6IHQuVGV4dCB8IHQuQm91bmRUZXh0IHtcbiAgICBjb25zdCB2YWx1ZU5vTmdzcCA9IHJlcGxhY2VOZ3NwKHZhbHVlKTtcbiAgICBjb25zdCBleHByID0gdGhpcy5iaW5kaW5nUGFyc2VyLnBhcnNlSW50ZXJwb2xhdGlvbih2YWx1ZU5vTmdzcCwgc291cmNlU3BhbiwgaW50ZXJwb2xhdGVkVG9rZW5zKTtcbiAgICByZXR1cm4gZXhwciA/IG5ldyB0LkJvdW5kVGV4dChleHByLCBzb3VyY2VTcGFuLCBpMThuKSA6IG5ldyB0LlRleHQodmFsdWVOb05nc3AsIHNvdXJjZVNwYW4pO1xuICB9XG5cbiAgcHJpdmF0ZSBwYXJzZVZhcmlhYmxlKFxuICAgIGlkZW50aWZpZXI6IHN0cmluZyxcbiAgICB2YWx1ZTogc3RyaW5nLFxuICAgIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICBrZXlTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgdmFsdWVTcGFuOiBQYXJzZVNvdXJjZVNwYW4gfCB1bmRlZmluZWQsXG4gICAgdmFyaWFibGVzOiB0LlZhcmlhYmxlW10sXG4gICkge1xuICAgIGlmIChpZGVudGlmaWVyLmluZGV4T2YoJy0nKSA+IC0xKSB7XG4gICAgICB0aGlzLnJlcG9ydEVycm9yKGBcIi1cIiBpcyBub3QgYWxsb3dlZCBpbiB2YXJpYWJsZSBuYW1lc2AsIHNvdXJjZVNwYW4pO1xuICAgIH0gZWxzZSBpZiAoaWRlbnRpZmllci5sZW5ndGggPT09IDApIHtcbiAgICAgIHRoaXMucmVwb3J0RXJyb3IoYFZhcmlhYmxlIGRvZXMgbm90IGhhdmUgYSBuYW1lYCwgc291cmNlU3Bhbik7XG4gICAgfVxuXG4gICAgdmFyaWFibGVzLnB1c2gobmV3IHQuVmFyaWFibGUoaWRlbnRpZmllciwgdmFsdWUsIHNvdXJjZVNwYW4sIGtleVNwYW4sIHZhbHVlU3BhbikpO1xuICB9XG5cbiAgcHJpdmF0ZSBwYXJzZVJlZmVyZW5jZShcbiAgICBpZGVudGlmaWVyOiBzdHJpbmcsXG4gICAgdmFsdWU6IHN0cmluZyxcbiAgICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAga2V5U3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgIHZhbHVlU3BhbjogUGFyc2VTb3VyY2VTcGFuIHwgdW5kZWZpbmVkLFxuICAgIHJlZmVyZW5jZXM6IHQuUmVmZXJlbmNlW10sXG4gICkge1xuICAgIGlmIChpZGVudGlmaWVyLmluZGV4T2YoJy0nKSA+IC0xKSB7XG4gICAgICB0aGlzLnJlcG9ydEVycm9yKGBcIi1cIiBpcyBub3QgYWxsb3dlZCBpbiByZWZlcmVuY2UgbmFtZXNgLCBzb3VyY2VTcGFuKTtcbiAgICB9IGVsc2UgaWYgKGlkZW50aWZpZXIubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aGlzLnJlcG9ydEVycm9yKGBSZWZlcmVuY2UgZG9lcyBub3QgaGF2ZSBhIG5hbWVgLCBzb3VyY2VTcGFuKTtcbiAgICB9IGVsc2UgaWYgKHJlZmVyZW5jZXMuc29tZSgocmVmZXJlbmNlKSA9PiByZWZlcmVuY2UubmFtZSA9PT0gaWRlbnRpZmllcikpIHtcbiAgICAgIHRoaXMucmVwb3J0RXJyb3IoYFJlZmVyZW5jZSBcIiMke2lkZW50aWZpZXJ9XCIgaXMgZGVmaW5lZCBtb3JlIHRoYW4gb25jZWAsIHNvdXJjZVNwYW4pO1xuICAgIH1cblxuICAgIHJlZmVyZW5jZXMucHVzaChuZXcgdC5SZWZlcmVuY2UoaWRlbnRpZmllciwgdmFsdWUsIHNvdXJjZVNwYW4sIGtleVNwYW4sIHZhbHVlU3BhbikpO1xuICB9XG5cbiAgcHJpdmF0ZSBwYXJzZUFzc2lnbm1lbnRFdmVudChcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgZXhwcmVzc2lvbjogc3RyaW5nLFxuICAgIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICB2YWx1ZVNwYW46IFBhcnNlU291cmNlU3BhbiB8IHVuZGVmaW5lZCxcbiAgICB0YXJnZXRNYXRjaGFibGVBdHRyczogc3RyaW5nW11bXSxcbiAgICBib3VuZEV2ZW50czogdC5Cb3VuZEV2ZW50W10sXG4gICAga2V5U3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICApIHtcbiAgICBjb25zdCBldmVudHM6IFBhcnNlZEV2ZW50W10gPSBbXTtcbiAgICB0aGlzLmJpbmRpbmdQYXJzZXIucGFyc2VFdmVudChcbiAgICAgIGAke25hbWV9Q2hhbmdlYCxcbiAgICAgIGV4cHJlc3Npb24sXG4gICAgICAvKiBpc0Fzc2lnbm1lbnRFdmVudCAqLyB0cnVlLFxuICAgICAgc291cmNlU3BhbixcbiAgICAgIHZhbHVlU3BhbiB8fCBzb3VyY2VTcGFuLFxuICAgICAgdGFyZ2V0TWF0Y2hhYmxlQXR0cnMsXG4gICAgICBldmVudHMsXG4gICAgICBrZXlTcGFuLFxuICAgICk7XG4gICAgYWRkRXZlbnRzKGV2ZW50cywgYm91bmRFdmVudHMpO1xuICB9XG5cbiAgcHJpdmF0ZSByZXBvcnRFcnJvcihcbiAgICBtZXNzYWdlOiBzdHJpbmcsXG4gICAgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgIGxldmVsOiBQYXJzZUVycm9yTGV2ZWwgPSBQYXJzZUVycm9yTGV2ZWwuRVJST1IsXG4gICkge1xuICAgIHRoaXMuZXJyb3JzLnB1c2gobmV3IFBhcnNlRXJyb3Ioc291cmNlU3BhbiwgbWVzc2FnZSwgbGV2ZWwpKTtcbiAgfVxufVxuXG5jbGFzcyBOb25CaW5kYWJsZVZpc2l0b3IgaW1wbGVtZW50cyBodG1sLlZpc2l0b3Ige1xuICB2aXNpdEVsZW1lbnQoYXN0OiBodG1sLkVsZW1lbnQpOiB0LkVsZW1lbnQgfCBudWxsIHtcbiAgICBjb25zdCBwcmVwYXJzZWRFbGVtZW50ID0gcHJlcGFyc2VFbGVtZW50KGFzdCk7XG4gICAgaWYgKFxuICAgICAgcHJlcGFyc2VkRWxlbWVudC50eXBlID09PSBQcmVwYXJzZWRFbGVtZW50VHlwZS5TQ1JJUFQgfHxcbiAgICAgIHByZXBhcnNlZEVsZW1lbnQudHlwZSA9PT0gUHJlcGFyc2VkRWxlbWVudFR5cGUuU1RZTEUgfHxcbiAgICAgIHByZXBhcnNlZEVsZW1lbnQudHlwZSA9PT0gUHJlcGFyc2VkRWxlbWVudFR5cGUuU1RZTEVTSEVFVFxuICAgICkge1xuICAgICAgLy8gU2tpcHBpbmcgPHNjcmlwdD4gZm9yIHNlY3VyaXR5IHJlYXNvbnNcbiAgICAgIC8vIFNraXBwaW5nIDxzdHlsZT4gYW5kIHN0eWxlc2hlZXRzIGFzIHdlIGFscmVhZHkgcHJvY2Vzc2VkIHRoZW1cbiAgICAgIC8vIGluIHRoZSBTdHlsZUNvbXBpbGVyXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBjaGlsZHJlbjogdC5Ob2RlW10gPSBodG1sLnZpc2l0QWxsKHRoaXMsIGFzdC5jaGlsZHJlbiwgbnVsbCk7XG4gICAgcmV0dXJuIG5ldyB0LkVsZW1lbnQoXG4gICAgICBhc3QubmFtZSxcbiAgICAgIGh0bWwudmlzaXRBbGwodGhpcywgYXN0LmF0dHJzKSBhcyB0LlRleHRBdHRyaWJ1dGVbXSxcbiAgICAgIC8qIGlucHV0cyAqLyBbXSxcbiAgICAgIC8qIG91dHB1dHMgKi8gW10sXG4gICAgICBjaGlsZHJlbixcbiAgICAgIC8qIHJlZmVyZW5jZXMgKi8gW10sXG4gICAgICBhc3Quc291cmNlU3BhbixcbiAgICAgIGFzdC5zdGFydFNvdXJjZVNwYW4sXG4gICAgICBhc3QuZW5kU291cmNlU3BhbixcbiAgICApO1xuICB9XG5cbiAgdmlzaXRDb21tZW50KGNvbW1lbnQ6IGh0bWwuQ29tbWVudCk6IGFueSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICB2aXNpdEF0dHJpYnV0ZShhdHRyaWJ1dGU6IGh0bWwuQXR0cmlidXRlKTogdC5UZXh0QXR0cmlidXRlIHtcbiAgICByZXR1cm4gbmV3IHQuVGV4dEF0dHJpYnV0ZShcbiAgICAgIGF0dHJpYnV0ZS5uYW1lLFxuICAgICAgYXR0cmlidXRlLnZhbHVlLFxuICAgICAgYXR0cmlidXRlLnNvdXJjZVNwYW4sXG4gICAgICBhdHRyaWJ1dGUua2V5U3BhbixcbiAgICAgIGF0dHJpYnV0ZS52YWx1ZVNwYW4sXG4gICAgICBhdHRyaWJ1dGUuaTE4bixcbiAgICApO1xuICB9XG5cbiAgdmlzaXRUZXh0KHRleHQ6IGh0bWwuVGV4dCk6IHQuVGV4dCB7XG4gICAgcmV0dXJuIG5ldyB0LlRleHQodGV4dC52YWx1ZSwgdGV4dC5zb3VyY2VTcGFuKTtcbiAgfVxuXG4gIHZpc2l0RXhwYW5zaW9uKGV4cGFuc2lvbjogaHRtbC5FeHBhbnNpb24pOiBhbnkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgdmlzaXRFeHBhbnNpb25DYXNlKGV4cGFuc2lvbkNhc2U6IGh0bWwuRXhwYW5zaW9uQ2FzZSk6IGFueSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICB2aXNpdEJsb2NrKGJsb2NrOiBodG1sLkJsb2NrLCBjb250ZXh0OiBhbnkpIHtcbiAgICBjb25zdCBub2RlcyA9IFtcbiAgICAgIC8vIEluIGFuIG5nTm9uQmluZGFibGUgY29udGV4dCB3ZSB0cmVhdCB0aGUgb3BlbmluZy9jbG9zaW5nIHRhZ3Mgb2YgYmxvY2sgYXMgcGxhaW4gdGV4dC5cbiAgICAgIC8vIFRoaXMgaXMgdGhlIGFzIGlmIHRoZSBgdG9rZW5pemVCbG9ja3NgIG9wdGlvbiB3YXMgZGlzYWJsZWQuXG4gICAgICBuZXcgdC5UZXh0KGJsb2NrLnN0YXJ0U291cmNlU3Bhbi50b1N0cmluZygpLCBibG9jay5zdGFydFNvdXJjZVNwYW4pLFxuICAgICAgLi4uaHRtbC52aXNpdEFsbCh0aGlzLCBibG9jay5jaGlsZHJlbiksXG4gICAgXTtcblxuICAgIGlmIChibG9jay5lbmRTb3VyY2VTcGFuICE9PSBudWxsKSB7XG4gICAgICBub2Rlcy5wdXNoKG5ldyB0LlRleHQoYmxvY2suZW5kU291cmNlU3Bhbi50b1N0cmluZygpLCBibG9jay5lbmRTb3VyY2VTcGFuKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5vZGVzO1xuICB9XG5cbiAgdmlzaXRCbG9ja1BhcmFtZXRlcihwYXJhbWV0ZXI6IGh0bWwuQmxvY2tQYXJhbWV0ZXIsIGNvbnRleHQ6IGFueSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgdmlzaXRMZXREZWNsYXJhdGlvbihkZWNsOiBodG1sLkxldERlY2xhcmF0aW9uLCBjb250ZXh0OiBhbnkpIHtcbiAgICByZXR1cm4gbmV3IHQuVGV4dChgQGxldCAke2RlY2wubmFtZX0gPSAke2RlY2wudmFsdWV9O2AsIGRlY2wuc291cmNlU3Bhbik7XG4gIH1cbn1cblxuY29uc3QgTk9OX0JJTkRBQkxFX1ZJU0lUT1IgPSBuZXcgTm9uQmluZGFibGVWaXNpdG9yKCk7XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZUF0dHJpYnV0ZU5hbWUoYXR0ck5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiAvXmRhdGEtL2kudGVzdChhdHRyTmFtZSkgPyBhdHRyTmFtZS5zdWJzdHJpbmcoNSkgOiBhdHRyTmFtZTtcbn1cblxuZnVuY3Rpb24gYWRkRXZlbnRzKGV2ZW50czogUGFyc2VkRXZlbnRbXSwgYm91bmRFdmVudHM6IHQuQm91bmRFdmVudFtdKSB7XG4gIGJvdW5kRXZlbnRzLnB1c2goLi4uZXZlbnRzLm1hcCgoZSkgPT4gdC5Cb3VuZEV2ZW50LmZyb21QYXJzZWRFdmVudChlKSkpO1xufVxuXG5mdW5jdGlvbiB0ZXh0Q29udGVudHMobm9kZTogaHRtbC5FbGVtZW50KTogc3RyaW5nIHwgbnVsbCB7XG4gIGlmIChub2RlLmNoaWxkcmVuLmxlbmd0aCAhPT0gMSB8fCAhKG5vZGUuY2hpbGRyZW5bMF0gaW5zdGFuY2VvZiBodG1sLlRleHQpKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIChub2RlLmNoaWxkcmVuWzBdIGFzIGh0bWwuVGV4dCkudmFsdWU7XG4gIH1cbn1cbiJdfQ==