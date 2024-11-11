/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicjNfdGVtcGxhdGVfdHJhbnNmb3JtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3JlbmRlcjMvcjNfdGVtcGxhdGVfdHJhbnNmb3JtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxTQUFTLEVBQThDLE1BQU0sMEJBQTBCLENBQUM7QUFFaEcsT0FBTyxLQUFLLElBQUksTUFBTSxrQkFBa0IsQ0FBQztBQUN6QyxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sK0JBQStCLENBQUM7QUFDMUQsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBRS9DLE9BQU8sRUFBQyxVQUFVLEVBQUUsZUFBZSxFQUFFLGVBQWUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUMzRSxPQUFPLEVBQUMsb0JBQW9CLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUMzRCxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0saUNBQWlDLENBQUM7QUFFL0QsT0FBTyxFQUFDLG9CQUFvQixFQUFFLGVBQWUsRUFBQyxNQUFNLHVDQUF1QyxDQUFDO0FBRTVGLE9BQU8sS0FBSyxDQUFDLE1BQU0sVUFBVSxDQUFDO0FBQzlCLE9BQU8sRUFDTCxhQUFhLEVBQ2IsYUFBYSxFQUNiLGlCQUFpQixFQUNqQix1QkFBdUIsRUFDdkIsc0JBQXNCLEdBQ3ZCLE1BQU0sbUJBQW1CLENBQUM7QUFDM0IsT0FBTyxFQUFDLG1CQUFtQixFQUFFLHlCQUF5QixFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFDcEYsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFFckQsTUFBTSxnQkFBZ0IsR0FBRyx1REFBdUQsQ0FBQztBQUVqRixvQkFBb0I7QUFDcEIsTUFBTSxXQUFXLEdBQUcsQ0FBQyxDQUFDO0FBQ3RCLG1CQUFtQjtBQUNuQixNQUFNLFVBQVUs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LGtCQUFrQixFQUFFLENBQUM7QUFFdEQsU0FBUyxzQkFBc0IsQ0FBQyxRQUFnQjtJQUM5QyxPQUFPLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztBQUNyRSxDQUFDO0FBRUQsU0FBUyxTQUFTLENBQUMsTUFBcUIsRUFBRSxXQUEyQjtJQUNuRSxXQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzFFLENBQUM7QUFFRCxTQUFTLFlBQVksQ0FBQyxJQUFrQjtJQUN0QyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsWUFBWSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUMzRSxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7U0FBTSxDQUFDO1FBQ04sT0FBUSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBZSxDQUFDLEtBQUssQ0FBQztJQUMvQyxDQUFDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtFbXB0eUV4cHIsIFBhcnNlZEV2ZW50LCBQYXJzZWRQcm9wZXJ0eSwgUGFyc2VkVmFyaWFibGV9IGZyb20gJy4uL2V4cHJlc3Npb25fcGFyc2VyL2FzdCc7XG5pbXBvcnQgKiBhcyBpMThuIGZyb20gJy4uL2kxOG4vaTE4bl9hc3QnO1xuaW1wb3J0ICogYXMgaHRtbCBmcm9tICcuLi9tbF9wYXJzZXIvYXN0JztcbmltcG9ydCB7cmVwbGFjZU5nc3B9IGZyb20gJy4uL21sX3BhcnNlci9odG1sX3doaXRlc3BhY2VzJztcbmltcG9ydCB7aXNOZ1RlbXBsYXRlfSBmcm9tICcuLi9tbF9wYXJzZXIvdGFncyc7XG5pbXBvcnQge0ludGVycG9sYXRlZEF0dHJpYnV0ZVRva2VuLCBJbnRlcnBvbGF0ZWRUZXh0VG9rZW59IGZyb20gJy4uL21sX3BhcnNlci90b2tlbnMnO1xuaW1wb3J0IHtQYXJzZUVycm9yLCBQYXJzZUVycm9yTGV2ZWwsIFBhcnNlU291cmNlU3Bhbn0gZnJvbSAnLi4vcGFyc2VfdXRpbCc7XG5pbXBvcnQge2lzU3R5bGVVcmxSZXNvbHZhYmxlfSBmcm9tICcuLi9zdHlsZV91cmxfcmVzb2x2ZXInO1xuaW1wb3J0IHtpc0kxOG5Sb290Tm9kZX0gZnJvbSAnLi4vdGVtcGxhdGUvcGlwZWxpbmUvc3JjL2luZ2VzdCc7XG5pbXBvcnQge0JpbmRpbmdQYXJzZXJ9IGZyb20gJy4uL3RlbXBsYXRlX3BhcnNlci9iaW5kaW5nX3BhcnNlcic7XG5pbXBvcnQge1ByZXBhcnNlZEVsZW1lbnRUeXBlLCBwcmVwYXJzZUVsZW1lbnR9IGZyb20gJy4uL3RlbXBsYXRlX3BhcnNlci90ZW1wbGF0ZV9wcmVwYXJzZXInO1xuXG5pbXBvcnQgKiBhcyB0IGZyb20gJy4vcjNfYXN0JztcbmltcG9ydCB7XG4gIGNyZWF0ZUZvckxvb3AsXG4gIGNyZWF0ZUlmQmxvY2ssXG4gIGNyZWF0ZVN3aXRjaEJsb2NrLFxuICBpc0Nvbm5lY3RlZEZvckxvb3BCbG9jayxcbiAgaXNDb25uZWN0ZWRJZkxvb3BCbG9jayxcbn0gZnJvbSAnLi9yM19jb250cm9sX2Zsb3cnO1xuaW1wb3J0IHtjcmVhdGVEZWZlcnJlZEJsb2NrLCBpc0Nvbm5lY3RlZERlZmVyTG9vcEJsb2NrfSBmcm9tICcuL3IzX2RlZmVycmVkX2Jsb2Nrcyc7XG5pbXBvcnQge0kxOE5fSUNVX1ZBUl9QUkVGSVh9IGZyb20gJy4vdmlldy9pMThuL3V0aWwnO1xuXG5jb25zdCBCSU5EX05BTUVfUkVHRVhQID0gL14oPzooYmluZC0pfChsZXQtKXwocmVmLXwjKXwob24tKXwoYmluZG9uLSl8KEApKSguKikkLztcblxuLy8gR3JvdXAgMSA9IFwiYmluZC1cIlxuY29uc3QgS1dfQklORF9JRFggPSAxO1xuLy8gR3JvdXAgMiA9IFwibGV0LVwiXG5jb25zdCBLV19MRVRfSURYID0gMjtcbi8vIEdyb3VwIDMgPSBcInJlZi0vI1wiXG5jb25zdCBLV19SRUZfSURYID0gMztcbi8vIEdyb3VwIDQgPSBcIm9uLVwiXG5jb25zdCBLV19PTl9JRFggPSA0O1xuLy8gR3JvdXAgNSA9IFwiYmluZG9uLVwiXG5jb25zdCBLV19CSU5ET05fSURYID0gNTtcbi8vIEdyb3VwIDYgPSBcIkBcIlxuY29uc3QgS1dfQVRfSURYID0gNjtcbi8vIEdyb3VwIDcgPSB0aGUgaWRlbnRpZmllciBhZnRlciBcImJpbmQtXCIsIFwibGV0LVwiLCBcInJlZi0vI1wiLCBcIm9uLVwiLCBcImJpbmRvbi1cIiBvciBcIkBcIlxuY29uc3QgSURFTlRfS1dfSURYID0gNztcblxuY29uc3QgQklORElOR19ERUxJTVMgPSB7XG4gIEJBTkFOQV9CT1g6IHtzdGFydDogJ1soJywgZW5kOiAnKV0nfSxcbiAgUFJPUEVSVFk6IHtzdGFydDogJ1snLCBlbmQ6ICddJ30sXG4gIEVWRU5UOiB7c3RhcnQ6ICcoJywgZW5kOiAnKSd9LFxufTtcblxuY29uc3QgVEVNUExBVEVfQVRUUl9QUkVGSVggPSAnKic7XG5cbi8vIFJlc3VsdCBvZiB0aGUgaHRtbCBBU1QgdG8gSXZ5IEFTVCB0cmFuc2Zvcm1hdGlvblxuZXhwb3J0IGludGVyZmFjZSBSZW5kZXIzUGFyc2VSZXN1bHQge1xuICBub2RlczogdC5Ob2RlW107XG4gIGVycm9yczogUGFyc2VFcnJvcltdO1xuICBzdHlsZXM6IHN0cmluZ1tdO1xuICBzdHlsZVVybHM6IHN0cmluZ1tdO1xuICBuZ0NvbnRlbnRTZWxlY3RvcnM6IHN0cmluZ1tdO1xuICAvLyBXaWxsIGJlIGRlZmluZWQgaWYgYFJlbmRlcjNQYXJzZU9wdGlvbnNbJ2NvbGxlY3RDb21tZW50Tm9kZXMnXWAgaXMgdHJ1ZVxuICBjb21tZW50Tm9kZXM/OiB0LkNvbW1lbnRbXTtcbn1cblxuaW50ZXJmYWNlIFJlbmRlcjNQYXJzZU9wdGlvbnMge1xuICBjb2xsZWN0Q29tbWVudE5vZGVzOiBib29sZWFuO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaHRtbEFzdFRvUmVuZGVyM0FzdChcbiAgaHRtbE5vZGVzOiBodG1sLk5vZGVbXSxcbiAgYmluZGluZ1BhcnNlcjogQmluZGluZ1BhcnNlcixcbiAgb3B0aW9uczogUmVuZGVyM1BhcnNlT3B0aW9ucyxcbik6IFJlbmRlcjNQYXJzZVJlc3VsdCB7XG4gIGNvbnN0IHRyYW5zZm9ybWVyID0gbmV3IEh0bWxBc3RUb0l2eUFzdChiaW5kaW5nUGFyc2VyLCBvcHRpb25zKTtcbiAgY29uc3QgaXZ5Tm9kZXMgPSBodG1sLnZpc2l0QWxsKHRyYW5zZm9ybWVyLCBodG1sTm9kZXMsIGh0bWxOb2Rlcyk7XG5cbiAgLy8gRXJyb3JzIG1pZ2h0IG9yaWdpbmF0ZSBpbiBlaXRoZXIgdGhlIGJpbmRpbmcgcGFyc2VyIG9yIHRoZSBodG1sIHRvIGl2eSB0cmFuc2Zvcm1lclxuICBjb25zdCBhbGxFcnJvcnMgPSBiaW5kaW5nUGFyc2VyLmVycm9ycy5jb25jYXQodHJhbnNmb3JtZXIuZXJyb3JzKTtcblxuICBjb25zdCByZXN1bHQ6IFJlbmRlcjNQYXJzZVJlc3VsdCA9IHtcbiAgICBub2RlczogaXZ5Tm9kZXMsXG4gICAgZXJyb3JzOiBhbGxFcnJvcnMsXG4gICAgc3R5bGVVcmxzOiB0cmFuc2Zvcm1lci5zdHlsZVVybHMsXG4gICAgc3R5bGVzOiB0cmFuc2Zvcm1lci5zdHlsZXMsXG4gICAgbmdDb250ZW50U2VsZWN0b3JzOiB0cmFuc2Zvcm1lci5uZ0NvbnRlbnRTZWxlY3RvcnMsXG4gIH07XG4gIGlmIChvcHRpb25zLmNvbGxlY3RDb21tZW50Tm9kZXMpIHtcbiAgICByZXN1bHQuY29tbWVudE5vZGVzID0gdHJhbnNmb3JtZXIuY29tbWVudE5vZGVzO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmNsYXNzIEh0bWxBc3RUb0l2eUFzdCBpbXBsZW1lbnRzIGh0bWwuVmlzaXRvciB7XG4gIGVycm9yczogUGFyc2VFcnJvcltdID0gW107XG4gIHN0eWxlczogc3RyaW5nW10gPSBbXTtcbiAgc3R5bGVVcmxzOiBzdHJpbmdbXSA9IFtdO1xuICBuZ0NvbnRlbnRTZWxlY3RvcnM6IHN0cmluZ1tdID0gW107XG4gIC8vIFRoaXMgYXJyYXkgd2lsbCBiZSBwb3B1bGF0ZWQgaWYgYFJlbmRlcjNQYXJzZU9wdGlvbnNbJ2NvbGxlY3RDb21tZW50Tm9kZXMnXWAgaXMgdHJ1ZVxuICBjb21tZW50Tm9kZXM6IHQuQ29tbWVudFtdID0gW107XG4gIHByaXZhdGUgaW5JMThuQmxvY2s6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAvKipcbiAgICogS2VlcHMgdHJhY2sgb2YgdGhlIG5vZGVzIHRoYXQgaGF2ZSBiZWVuIHByb2Nlc3NlZCBhbHJlYWR5IHdoZW4gcHJldmlvdXMgbm9kZXMgd2VyZSB2aXNpdGVkLlxuICAgKiBUaGVzZSBhcmUgdHlwaWNhbGx5IGJsb2NrcyBjb25uZWN0ZWQgdG8gb3RoZXIgYmxvY2tzIG9yIHRleHQgbm9kZXMgYmV0d2VlbiBjb25uZWN0ZWQgYmxvY2tzLlxuICAgKi9cbiAgcHJpdmF0ZSBwcm9jZXNzZWROb2RlcyA9IG5ldyBTZXQ8aHRtbC5CbG9jayB8IGh0bWwuVGV4dD4oKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGJpbmRpbmdQYXJzZXI6IEJpbmRpbmdQYXJzZXIsXG4gICAgcHJpdmF0ZSBvcHRpb25zOiBSZW5kZXIzUGFyc2VPcHRpb25zLFxuICApIHt9XG5cbiAgLy8gSFRNTCB2aXNpdG9yXG4gIHZpc2l0RWxlbWVudChlbGVtZW50OiBodG1sLkVsZW1lbnQpOiB0Lk5vZGUgfCBudWxsIHtcbiAgICBjb25zdCBpc0kxOG5Sb290RWxlbWVudCA9IGlzSTE4blJvb3ROb2RlKGVsZW1lbnQuaTE4bik7XG4gICAgaWYgKGlzSTE4blJvb3RFbGVtZW50KSB7XG4gICAgICBpZiAodGhpcy5pbkkxOG5CbG9jaykge1xuICAgICAgICB0aGlzLnJlcG9ydEVycm9yKFxuICAgICAgICAgICdDYW5ub3QgbWFyayBhbiBlbGVtZW50IGFzIHRyYW5zbGF0YWJsZSBpbnNpZGUgb2YgYSB0cmFuc2xhdGFibGUgc2VjdGlvbi4gUGxlYXNlIHJlbW92ZSB0aGUgbmVzdGVkIGkxOG4gbWFya2VyLicsXG4gICAgICAgICAgZWxlbWVudC5zb3VyY2VTcGFuLFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgdGhpcy5pbkkxOG5CbG9jayA9IHRydWU7XG4gICAgfVxuICAgIGNvbnN0IHByZXBhcnNlZEVsZW1lbnQgPSBwcmVwYXJzZUVsZW1lbnQoZWxlbWVudCk7XG4gICAgaWYgKHByZXBhcnNlZEVsZW1lbnQudHlwZSA9PT0gUHJlcGFyc2VkRWxlbWVudFR5cGUuU0NSSVBUKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9IGVsc2UgaWYgKHByZXBhcnNlZEVsZW1lbnQudHlwZSA9PT0gUHJlcGFyc2VkRWxlbWVudFR5cGUuU1RZTEUpIHtcbiAgICAgIGNvbnN0IGNvbnRlbnRzID0gdGV4dENvbnRlbnRzKGVsZW1lbnQpO1xuICAgICAgaWYgKGNvbnRlbnRzICE9PSBudWxsKSB7XG4gICAgICAgIHRoaXMuc3R5bGVzLnB1c2goY29udGVudHMpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSBlbHNlIGlmIChcbiAgICAgIHByZXBhcnNlZEVsZW1lbnQudHlwZSA9PT0gUHJlcGFyc2VkRWxlbWVudFR5cGUuU1RZTEVTSEVFVCAmJlxuICAgICAgaXNTdHlsZVVybFJlc29sdmFibGUocHJlcGFyc2VkRWxlbWVudC5ocmVmQXR0cilcbiAgICApIHtcbiAgICAgIHRoaXMuc3R5bGVVcmxzLnB1c2gocHJlcGFyc2VkRWxlbWVudC5ocmVmQXR0cik7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBXaGV0aGVyIHRoZSBlbGVtZW50IGlzIGEgYDxuZy10ZW1wbGF0ZT5gXG4gICAgY29uc3QgaXNUZW1wbGF0ZUVsZW1lbnQgPSBpc05nVGVtcGxhdGUoZWxlbWVudC5uYW1lKTtcblxuICAgIGNvbnN0IHBhcnNlZFByb3BlcnRpZXM6IFBhcnNlZFByb3BlcnR5W10gPSBbXTtcbiAgICBjb25zdCBib3VuZEV2ZW50czogdC5Cb3VuZEV2ZW50W10gPSBbXTtcbiAgICBjb25zdCB2YXJpYWJsZXM6IHQuVmFyaWFibGVbXSA9IFtdO1xuICAgIGNvbnN0IHJlZmVyZW5jZXM6IHQuUmVmZXJlbmNlW10gPSBbXTtcbiAgICBjb25zdCBhdHRyaWJ1dGVzOiB0LlRleHRBdHRyaWJ1dGVbXSA9IFtdO1xuICAgIGNvbnN0IGkxOG5BdHRyc01ldGE6IHtba2V5OiBzdHJpbmddOiBpMThuLkkxOG5NZXRhfSA9IHt9O1xuXG4gICAgY29uc3QgdGVtcGxhdGVQYXJzZWRQcm9wZXJ0aWVzOiBQYXJzZWRQcm9wZXJ0eVtdID0gW107XG4gICAgY29uc3QgdGVtcGxhdGVWYXJpYWJsZXM6IHQuVmFyaWFibGVbXSA9IFtdO1xuXG4gICAgLy8gV2hldGhlciB0aGUgZWxlbWVudCBoYXMgYW55ICotYXR0cmlidXRlXG4gICAgbGV0IGVsZW1lbnRIYXNJbmxpbmVUZW1wbGF0ZSA9IGZhbHNlO1xuXG4gICAgZm9yIChjb25zdCBhdHRyaWJ1dGUgb2YgZWxlbWVudC5hdHRycykge1xuICAgICAgbGV0IGhhc0JpbmRpbmcgPSBmYWxzZTtcbiAgICAgIGNvbnN0IG5vcm1hbGl6ZWROYW1lID0gbm9ybWFsaXplQXR0cmlidXRlTmFtZShhdHRyaWJ1dGUubmFtZSk7XG5cbiAgICAgIC8vIGAqYXR0cmAgZGVmaW5lcyB0ZW1wbGF0ZSBiaW5kaW5nc1xuICAgICAgbGV0IGlzVGVtcGxhdGVCaW5kaW5nID0gZmFsc2U7XG5cbiAgICAgIGlmIChhdHRyaWJ1dGUuaTE4bikge1xuICAgICAgICBpMThuQXR0cnNNZXRhW2F0dHJpYnV0ZS5uYW1lXSA9IGF0dHJpYnV0ZS5pMThuO1xuICAgICAgfVxuXG4gICAgICBpZiAobm9ybWFsaXplZE5hbWUuc3RhcnRzV2l0aChURU1QTEFURV9BVFRSX1BSRUZJWCkpIHtcbiAgICAgICAgLy8gKi1hdHRyaWJ1dGVzXG4gICAgICAgIGlmIChlbGVtZW50SGFzSW5saW5lVGVtcGxhdGUpIHtcbiAgICAgICAgICB0aGlzLnJlcG9ydEVycm9yKFxuICAgICAgICAgICAgYENhbid0IGhhdmUgbXVsdGlwbGUgdGVtcGxhdGUgYmluZGluZ3Mgb24gb25lIGVsZW1lbnQuIFVzZSBvbmx5IG9uZSBhdHRyaWJ1dGUgcHJlZml4ZWQgd2l0aCAqYCxcbiAgICAgICAgICAgIGF0dHJpYnV0ZS5zb3VyY2VTcGFuLFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgaXNUZW1wbGF0ZUJpbmRpbmcgPSB0cnVlO1xuICAgICAgICBlbGVtZW50SGFzSW5saW5lVGVtcGxhdGUgPSB0cnVlO1xuICAgICAgICBjb25zdCB0ZW1wbGF0ZVZhbHVlID0gYXR0cmlidXRlLnZhbHVlO1xuICAgICAgICBjb25zdCB0ZW1wbGF0ZUtleSA9IG5vcm1hbGl6ZWROYW1lLnN1YnN0cmluZyhURU1QTEFURV9BVFRSX1BSRUZJWC5sZW5ndGgpO1xuXG4gICAgICAgIGNvbnN0IHBhcnNlZFZhcmlhYmxlczogUGFyc2VkVmFyaWFibGVbXSA9IFtdO1xuICAgICAgICBjb25zdCBhYnNvbHV0ZVZhbHVlT2Zmc2V0ID0gYXR0cmlidXRlLnZhbHVlU3BhblxuICAgICAgICAgID8gYXR0cmlidXRlLnZhbHVlU3Bhbi5zdGFydC5vZmZzZXRcbiAgICAgICAgICA6IC8vIElmIHRoZXJlIGlzIG5vIHZhbHVlIHNwYW4gdGhlIGF0dHJpYnV0ZSBkb2VzIG5vdCBoYXZlIGEgdmFsdWUsIGxpa2UgYGF0dHJgIGluXG4gICAgICAgICAgICAvL2A8ZGl2IGF0dHI+PC9kaXY+YC4gSW4gdGhpcyBjYXNlLCBwb2ludCB0byBvbmUgY2hhcmFjdGVyIGJleW9uZCB0aGUgbGFzdCBjaGFyYWN0ZXIgb2ZcbiAgICAgICAgICAgIC8vIHRoZSBhdHRyaWJ1dGUgbmFtZS5cbiAgICAgICAgICAgIGF0dHJpYnV0ZS5zb3VyY2VTcGFuLnN0YXJ0Lm9mZnNldCArIGF0dHJpYnV0ZS5uYW1lLmxlbmd0aDtcblxuICAgICAgICB0aGlzLmJpbmRpbmdQYXJzZXIucGFyc2VJbmxpbmVUZW1wbGF0ZUJpbmRpbmcoXG4gICAgICAgICAgdGVtcGxhdGVLZXksXG4gICAgICAgICAgdGVtcGxhdGVWYWx1ZSxcbiAgICAgICAgICBhdHRyaWJ1dGUuc291cmNlU3BhbixcbiAgICAgICAgICBhYnNvbHV0ZVZhbHVlT2Zmc2V0LFxuICAgICAgICAgIFtdLFxuICAgICAgICAgIHRlbXBsYXRlUGFyc2VkUHJvcGVydGllcyxcbiAgICAgICAgICBwYXJzZWRWYXJpYWJsZXMsXG4gICAgICAgICAgdHJ1ZSAvKiBpc0l2eUFzdCAqLyxcbiAgICAgICAgKTtcbiAgICAgICAgdGVtcGxhdGVWYXJpYWJsZXMucHVzaChcbiAgICAgICAgICAuLi5wYXJzZWRWYXJpYWJsZXMubWFwKFxuICAgICAgICAgICAgKHYpID0+IG5ldyB0LlZhcmlhYmxlKHYubmFtZSwgdi52YWx1ZSwgdi5zb3VyY2VTcGFuLCB2LmtleVNwYW4sIHYudmFsdWVTcGFuKSxcbiAgICAgICAgICApLFxuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQ2hlY2sgZm9yIHZhcmlhYmxlcywgZXZlbnRzLCBwcm9wZXJ0eSBiaW5kaW5ncywgaW50ZXJwb2xhdGlvblxuICAgICAgICBoYXNCaW5kaW5nID0gdGhpcy5wYXJzZUF0dHJpYnV0ZShcbiAgICAgICAgICBpc1RlbXBsYXRlRWxlbWVudCxcbiAgICAgICAgICBhdHRyaWJ1dGUsXG4gICAgICAgICAgW10sXG4gICAgICAgICAgcGFyc2VkUHJvcGVydGllcyxcbiAgICAgICAgICBib3VuZEV2ZW50cyxcbiAgICAgICAgICB2YXJpYWJsZXMsXG4gICAgICAgICAgcmVmZXJlbmNlcyxcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFoYXNCaW5kaW5nICYmICFpc1RlbXBsYXRlQmluZGluZykge1xuICAgICAgICAvLyBkb24ndCBpbmNsdWRlIHRoZSBiaW5kaW5ncyBhcyBhdHRyaWJ1dGVzIGFzIHdlbGwgaW4gdGhlIEFTVFxuICAgICAgICBhdHRyaWJ1dGVzLnB1c2godGhpcy52aXNpdEF0dHJpYnV0ZShhdHRyaWJ1dGUpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgY2hpbGRyZW46IHQuTm9kZVtdO1xuXG4gICAgaWYgKHByZXBhcnNlZEVsZW1lbnQubm9uQmluZGFibGUpIHtcbiAgICAgIC8vIFRoZSBgTm9uQmluZGFibGVWaXNpdG9yYCBtYXkgbmVlZCB0byByZXR1cm4gYW4gYXJyYXkgb2Ygbm9kZXMgZm9yIGJsb2NrcyBzbyB3ZSBuZWVkXG4gICAgICAvLyB0byBmbGF0dGVuIHRoZSBhcnJheSBoZXJlLiBBdm9pZCBkb2luZyB0aGlzIGZvciB0aGUgYEh0bWxBc3RUb0l2eUFzdGAgc2luY2UgYGZsYXRgIGNyZWF0ZXNcbiAgICAgIC8vIGEgbmV3IGFycmF5LlxuICAgICAgY2hpbGRyZW4gPSBodG1sLnZpc2l0QWxsKE5PTl9CSU5EQUJMRV9WSVNJVE9SLCBlbGVtZW50LmNoaWxkcmVuKS5mbGF0KEluZmluaXR5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2hpbGRyZW4gPSBodG1sLnZpc2l0QWxsKHRoaXMsIGVsZW1lbnQuY2hpbGRyZW4sIGVsZW1lbnQuY2hpbGRyZW4pO1xuICAgIH1cblxuICAgIGxldCBwYXJzZWRFbGVtZW50OiB0LkNvbnRlbnQgfCB0LlRlbXBsYXRlIHwgdC5FbGVtZW50IHwgdW5kZWZpbmVkO1xuICAgIGlmIChwcmVwYXJzZWRFbGVtZW50LnR5cGUgPT09IFByZXBhcnNlZEVsZW1lbnRUeXBlLk5HX0NPTlRFTlQpIHtcbiAgICAgIGNvbnN0IHNlbGVjdG9yID0gcHJlcGFyc2VkRWxlbWVudC5zZWxlY3RBdHRyO1xuICAgICAgY29uc3QgYXR0cnM6IHQuVGV4dEF0dHJpYnV0ZVtdID0gZWxlbWVudC5hdHRycy5tYXAoKGF0dHIpID0+IHRoaXMudmlzaXRBdHRyaWJ1dGUoYXR0cikpO1xuICAgICAgcGFyc2VkRWxlbWVudCA9IG5ldyB0LkNvbnRlbnQoc2VsZWN0b3IsIGF0dHJzLCBjaGlsZHJlbiwgZWxlbWVudC5zb3VyY2VTcGFuLCBlbGVtZW50LmkxOG4pO1xuICAgICAgdGhpcy5uZ0NvbnRlbnRTZWxlY3RvcnMucHVzaChzZWxlY3Rvcik7XG4gICAgfSBlbHNlIGlmIChpc1RlbXBsYXRlRWxlbWVudCkge1xuICAgICAgLy8gYDxuZy10ZW1wbGF0ZT5gXG4gICAgICBjb25zdCBhdHRycyA9IHRoaXMuZXh0cmFjdEF0dHJpYnV0ZXMoZWxlbWVudC5uYW1lLCBwYXJzZWRQcm9wZXJ0aWVzLCBpMThuQXR0cnNNZXRhKTtcblxuICAgICAgcGFyc2VkRWxlbWVudCA9IG5ldyB0LlRlbXBsYXRlKFxuICAgICAgICBlbGVtZW50Lm5hbWUsXG4gICAgICAgIGF0dHJpYnV0ZXMsXG4gICAgICAgIGF0dHJzLmJvdW5kLFxuICAgICAgICBib3VuZEV2ZW50cyxcbiAgICAgICAgW1xuICAgICAgICAgIC8qIG5vIHRlbXBsYXRlIGF0dHJpYnV0ZXMgKi9cbiAgICAgICAgXSxcbiAgICAgICAgY2hpbGRyZW4sXG4gICAgICAgIHJlZmVyZW5jZXMsXG4gICAgICAgIHZhcmlhYmxlcyxcbiAgICAgICAgZWxlbWVudC5zb3VyY2VTcGFuLFxuICAgICAgICBlbGVtZW50LnN0YXJ0U291cmNlU3BhbixcbiAgICAgICAgZWxlbWVudC5lbmRTb3VyY2VTcGFuLFxuICAgICAgICBlbGVtZW50LmkxOG4sXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBhdHRycyA9IHRoaXMuZXh0cmFjdEF0dHJpYnV0ZXMoZWxlbWVudC5uYW1lLCBwYXJzZWRQcm9wZXJ0aWVzLCBpMThuQXR0cnNNZXRhKTtcbiAgICAgIHBhcnNlZEVsZW1lbnQgPSBuZXcgdC5FbGVtZW50KFxuICAgICAgICBlbGVtZW50Lm5hbWUsXG4gICAgICAgIGF0dHJpYnV0ZXMsXG4gICAgICAgIGF0dHJzLmJvdW5kLFxuICAgICAgICBib3VuZEV2ZW50cyxcbiAgICAgICAgY2hpbGRyZW4sXG4gICAgICAgIHJlZmVyZW5jZXMsXG4gICAgICAgIGVsZW1lbnQuc291cmNlU3BhbixcbiAgICAgICAgZWxlbWVudC5zdGFydFNvdXJjZVNwYW4sXG4gICAgICAgIGVsZW1lbnQuZW5kU291cmNlU3BhbixcbiAgICAgICAgZWxlbWVudC5pMThuLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAoZWxlbWVudEhhc0lubGluZVRlbXBsYXRlKSB7XG4gICAgICAvLyBJZiB0aGlzIG5vZGUgaXMgYW4gaW5saW5lLXRlbXBsYXRlIChlLmcuIGhhcyAqbmdGb3IpIHRoZW4gd2UgbmVlZCB0byBjcmVhdGUgYSB0ZW1wbGF0ZVxuICAgICAgLy8gbm9kZSB0aGF0IGNvbnRhaW5zIHRoaXMgbm9kZS5cbiAgICAgIC8vIE1vcmVvdmVyLCBpZiB0aGUgbm9kZSBpcyBhbiBlbGVtZW50LCB0aGVuIHdlIG5lZWQgdG8gaG9pc3QgaXRzIGF0dHJpYnV0ZXMgdG8gdGhlIHRlbXBsYXRlXG4gICAgICAvLyBub2RlIGZvciBtYXRjaGluZyBhZ2FpbnN0IGNvbnRlbnQgcHJvamVjdGlvbiBzZWxlY3RvcnMuXG4gICAgICBjb25zdCBhdHRycyA9IHRoaXMuZXh0cmFjdEF0dHJpYnV0ZXMoJ25nLXRlbXBsYXRlJywgdGVtcGxhdGVQYXJzZWRQcm9wZXJ0aWVzLCBpMThuQXR0cnNNZXRhKTtcbiAgICAgIGNvbnN0IHRlbXBsYXRlQXR0cnM6ICh0LlRleHRBdHRyaWJ1dGUgfCB0LkJvdW5kQXR0cmlidXRlKVtdID0gW107XG4gICAgICBhdHRycy5saXRlcmFsLmZvckVhY2goKGF0dHIpID0+IHRlbXBsYXRlQXR0cnMucHVzaChhdHRyKSk7XG4gICAgICBhdHRycy5ib3VuZC5mb3JFYWNoKChhdHRyKSA9PiB0ZW1wbGF0ZUF0dHJzLnB1c2goYXR0cikpO1xuICAgICAgY29uc3QgaG9pc3RlZEF0dHJzID1cbiAgICAgICAgcGFyc2VkRWxlbWVudCBpbnN0YW5jZW9mIHQuRWxlbWVudFxuICAgICAgICAgID8ge1xuICAgICAgICAgICAgICBhdHRyaWJ1dGVzOiBwYXJzZWRFbGVtZW50LmF0dHJpYnV0ZXMsXG4gICAgICAgICAgICAgIGlucHV0czogcGFyc2VkRWxlbWVudC5pbnB1dHMsXG4gICAgICAgICAgICAgIG91dHB1dHM6IHBhcnNlZEVsZW1lbnQub3V0cHV0cyxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICA6IHthdHRyaWJ1dGVzOiBbXSwgaW5wdXRzOiBbXSwgb3V0cHV0czogW119O1xuXG4gICAgICAvLyBGb3IgPG5nLXRlbXBsYXRlPnMgd2l0aCBzdHJ1Y3R1cmFsIGRpcmVjdGl2ZXMgb24gdGhlbSwgYXZvaWQgcGFzc2luZyBpMThuIGluZm9ybWF0aW9uIHRvXG4gICAgICAvLyB0aGUgd3JhcHBpbmcgdGVtcGxhdGUgdG8gcHJldmVudCB1bm5lY2Vzc2FyeSBpMThuIGluc3RydWN0aW9ucyBmcm9tIGJlaW5nIGdlbmVyYXRlZC4gVGhlXG4gICAgICAvLyBuZWNlc3NhcnkgaTE4biBtZXRhIGluZm9ybWF0aW9uIHdpbGwgYmUgZXh0cmFjdGVkIGZyb20gY2hpbGQgZWxlbWVudHMuXG4gICAgICBjb25zdCBpMThuID0gaXNUZW1wbGF0ZUVsZW1lbnQgJiYgaXNJMThuUm9vdEVsZW1lbnQgPyB1bmRlZmluZWQgOiBlbGVtZW50LmkxOG47XG4gICAgICBjb25zdCBuYW1lID0gcGFyc2VkRWxlbWVudCBpbnN0YW5jZW9mIHQuVGVtcGxhdGUgPyBudWxsIDogcGFyc2VkRWxlbWVudC5uYW1lO1xuXG4gICAgICBwYXJzZWRFbGVtZW50ID0gbmV3IHQuVGVtcGxhdGUoXG4gICAgICAgIG5hbWUsXG4gICAgICAgIGhvaXN0ZWRBdHRycy5hdHRyaWJ1dGVzLFxuICAgICAgICBob2lzdGVkQXR0cnMuaW5wdXRzLFxuICAgICAgICBob2lzdGVkQXR0cnMub3V0cHV0cyxcbiAgICAgICAgdGVtcGxhdGVBdHRycyxcbiAgICAgICAgW3BhcnNlZEVsZW1lbnRdLFxuICAgICAgICBbXG4gICAgICAgICAgLyogbm8gcmVmZXJlbmNlcyAqL1xuICAgICAgICBdLFxuICAgICAgICB0ZW1wbGF0ZVZhcmlhYmxlcyxcbiAgICAgICAgZWxlbWVudC5zb3VyY2VTcGFuLFxuICAgICAgICBlbGVtZW50LnN0YXJ0U291cmNlU3BhbixcbiAgICAgICAgZWxlbWVudC5lbmRTb3VyY2VTcGFuLFxuICAgICAgICBpMThuLFxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKGlzSTE4blJvb3RFbGVtZW50KSB7XG4gICAgICB0aGlzLmluSTE4bkJsb2NrID0gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBwYXJzZWRFbGVtZW50O1xuICB9XG5cbiAgdmlzaXRBdHRyaWJ1dGUoYXR0cmlidXRlOiBodG1sLkF0dHJpYnV0ZSk6IHQuVGV4dEF0dHJpYnV0ZSB7XG4gICAgcmV0dXJuIG5ldyB0LlRleHRBdHRyaWJ1dGUoXG4gICAgICBhdHRyaWJ1dGUubmFtZSxcbiAgICAgIGF0dHJpYnV0ZS52YWx1ZSxcbiAgICAgIGF0dHJpYnV0ZS5zb3VyY2VTcGFuLFxuICAgICAgYXR0cmlidXRlLmtleVNwYW4sXG4gICAgICBhdHRyaWJ1dGUudmFsdWVTcGFuLFxuICAgICAgYXR0cmlidXRlLmkxOG4sXG4gICAgKTtcbiAgfVxuXG4gIHZpc2l0VGV4dCh0ZXh0OiBodG1sLlRleHQpOiB0Lk5vZGUgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5wcm9jZXNzZWROb2Rlcy5oYXModGV4dClcbiAgICAgID8gbnVsbFxuICAgICAgOiB0aGlzLl92aXNpdFRleHRXaXRoSW50ZXJwb2xhdGlvbih0ZXh0LnZhbHVlLCB0ZXh0LnNvdXJjZVNwYW4sIHRleHQudG9rZW5zLCB0ZXh0LmkxOG4pO1xuICB9XG5cbiAgdmlzaXRFeHBhbnNpb24oZXhwYW5zaW9uOiBodG1sLkV4cGFuc2lvbik6IHQuSWN1IHwgbnVsbCB7XG4gICAgaWYgKCFleHBhbnNpb24uaTE4bikge1xuICAgICAgLy8gZG8gbm90IGdlbmVyYXRlIEljdSBpbiBjYXNlIGl0IHdhcyBjcmVhdGVkXG4gICAgICAvLyBvdXRzaWRlIG9mIGkxOG4gYmxvY2sgaW4gYSB0ZW1wbGF0ZVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGlmICghaXNJMThuUm9vdE5vZGUoZXhwYW5zaW9uLmkxOG4pKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBJbnZhbGlkIHR5cGUgXCIke2V4cGFuc2lvbi5pMThuLmNvbnN0cnVjdG9yfVwiIGZvciBcImkxOG5cIiBwcm9wZXJ0eSBvZiAke2V4cGFuc2lvbi5zb3VyY2VTcGFuLnRvU3RyaW5nKCl9LiBFeHBlY3RlZCBhIFwiTWVzc2FnZVwiYCxcbiAgICAgICk7XG4gICAgfVxuICAgIGNvbnN0IG1lc3NhZ2UgPSBleHBhbnNpb24uaTE4bjtcbiAgICBjb25zdCB2YXJzOiB7W25hbWU6IHN0cmluZ106IHQuQm91bmRUZXh0fSA9IHt9O1xuICAgIGNvbnN0IHBsYWNlaG9sZGVyczoge1tuYW1lOiBzdHJpbmddOiB0LlRleHQgfCB0LkJvdW5kVGV4dH0gPSB7fTtcbiAgICAvLyBleHRyYWN0IFZBUnMgZnJvbSBJQ1VzIC0gd2UgcHJvY2VzcyB0aGVtIHNlcGFyYXRlbHkgd2hpbGVcbiAgICAvLyBhc3NlbWJsaW5nIHJlc3VsdGluZyBtZXNzYWdlIHZpYSBnb29nLmdldE1zZyBmdW5jdGlvbiwgc2luY2VcbiAgICAvLyB3ZSBuZWVkIHRvIHBhc3MgdGhlbSB0byB0b3AtbGV2ZWwgZ29vZy5nZXRNc2cgY2FsbFxuICAgIE9iamVjdC5rZXlzKG1lc3NhZ2UucGxhY2Vob2xkZXJzKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgIGNvbnN0IHZhbHVlID0gbWVzc2FnZS5wbGFjZWhvbGRlcnNba2V5XTtcbiAgICAgIGlmIChrZXkuc3RhcnRzV2l0aChJMThOX0lDVV9WQVJfUFJFRklYKSkge1xuICAgICAgICAvLyBDdXJyZW50bHkgd2hlbiB0aGUgYHBsdXJhbGAgb3IgYHNlbGVjdGAga2V5d29yZHMgaW4gYW4gSUNVIGNvbnRhaW4gdHJhaWxpbmcgc3BhY2VzIChlLmcuXG4gICAgICAgIC8vIGB7Y291bnQsIHNlbGVjdCAsIC4uLn1gKSwgdGhlc2Ugc3BhY2VzIGFyZSBhbHNvIGluY2x1ZGVkIGludG8gdGhlIGtleSBuYW1lcyBpbiBJQ1UgdmFyc1xuICAgICAgICAvLyAoZS5nLiBcIlZBUl9TRUxFQ1QgXCIpLiBUaGVzZSB0cmFpbGluZyBzcGFjZXMgYXJlIG5vdCBkZXNpcmFibGUsIHNpbmNlIHRoZXkgd2lsbCBsYXRlciBiZVxuICAgICAgICAvLyBjb252ZXJ0ZWQgaW50byBgX2Agc3ltYm9scyB3aGlsZSBub3JtYWxpemluZyBwbGFjZWhvbGRlciBuYW1lcywgd2hpY2ggbWlnaHQgbGVhZCB0b1xuICAgICAgICAvLyBtaXNtYXRjaGVzIGF0IHJ1bnRpbWUgKGkuZS4gcGxhY2Vob2xkZXIgd2lsbCBub3QgYmUgcmVwbGFjZWQgd2l0aCB0aGUgY29ycmVjdCB2YWx1ZSkuXG4gICAgICAgIGNvbnN0IGZvcm1hdHRlZEtleSA9IGtleS50cmltKCk7XG5cbiAgICAgICAgY29uc3QgYXN0ID0gdGhpcy5iaW5kaW5nUGFyc2VyLnBhcnNlSW50ZXJwb2xhdGlvbkV4cHJlc3Npb24odmFsdWUudGV4dCwgdmFsdWUuc291cmNlU3Bhbik7XG5cbiAgICAgICAgdmFyc1tmb3JtYXR0ZWRLZXldID0gbmV3IHQuQm91bmRUZXh0KGFzdCwgdmFsdWUuc291cmNlU3Bhbik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwbGFjZWhvbGRlcnNba2V5XSA9IHRoaXMuX3Zpc2l0VGV4dFdpdGhJbnRlcnBvbGF0aW9uKHZhbHVlLnRleHQsIHZhbHVlLnNvdXJjZVNwYW4sIG51bGwpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBuZXcgdC5JY3UodmFycywgcGxhY2Vob2xkZXJzLCBleHBhbnNpb24uc291cmNlU3BhbiwgbWVzc2FnZSk7XG4gIH1cblxuICB2aXNpdEV4cGFuc2lvbkNhc2UoZXhwYW5zaW9uQ2FzZTogaHRtbC5FeHBhbnNpb25DYXNlKTogbnVsbCB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICB2aXNpdENvbW1lbnQoY29tbWVudDogaHRtbC5Db21tZW50KTogbnVsbCB7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5jb2xsZWN0Q29tbWVudE5vZGVzKSB7XG4gICAgICB0aGlzLmNvbW1lbnROb2Rlcy5wdXNoKG5ldyB0LkNvbW1lbnQoY29tbWVudC52YWx1ZSB8fCAnJywgY29tbWVudC5zb3VyY2VTcGFuKSk7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgdmlzaXRMZXREZWNsYXJhdGlvbihkZWNsOiBodG1sLkxldERlY2xhcmF0aW9uLCBjb250ZXh0OiBhbnkpIHtcbiAgICBjb25zdCB2YWx1ZSA9IHRoaXMuYmluZGluZ1BhcnNlci5wYXJzZUJpbmRpbmcoXG4gICAgICBkZWNsLnZhbHVlLFxuICAgICAgZmFsc2UsXG4gICAgICBkZWNsLnZhbHVlU3BhbixcbiAgICAgIGRlY2wudmFsdWVTcGFuLnN0YXJ0Lm9mZnNldCxcbiAgICApO1xuXG4gICAgaWYgKHZhbHVlLmVycm9ycy5sZW5ndGggPT09IDAgJiYgdmFsdWUuYXN0IGluc3RhbmNlb2YgRW1wdHlFeHByKSB7XG4gICAgICB0aGlzLnJlcG9ydEVycm9yKCdAbGV0IGRlY2xhcmF0aW9uIHZhbHVlIGNhbm5vdCBiZSBlbXB0eScsIGRlY2wudmFsdWVTcGFuKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IHQuTGV0RGVjbGFyYXRpb24oZGVjbC5uYW1lLCB2YWx1ZSwgZGVjbC5zb3VyY2VTcGFuLCBkZWNsLm5hbWVTcGFuLCBkZWNsLnZhbHVlU3Bhbik7XG4gIH1cblxuICB2aXNpdEJsb2NrUGFyYW1ldGVyKCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgdmlzaXRCbG9jayhibG9jazogaHRtbC5CbG9jaywgY29udGV4dDogaHRtbC5Ob2RlW10pIHtcbiAgICBjb25zdCBpbmRleCA9IEFycmF5LmlzQXJyYXkoY29udGV4dCkgPyBjb250ZXh0LmluZGV4T2YoYmxvY2spIDogLTE7XG5cbiAgICBpZiAoaW5kZXggPT09IC0xKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdWaXNpdG9yIGludm9rZWQgaW5jb3JyZWN0bHkuIEV4cGVjdGluZyB2aXNpdEJsb2NrIHRvIGJlIGludm9rZWQgc2libGluZ3MgYXJyYXkgYXMgaXRzIGNvbnRleHQnLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBDb25uZWN0ZWQgYmxvY2tzIG1heSBoYXZlIGJlZW4gcHJvY2Vzc2VkIGFzIGEgcGFydCBvZiB0aGUgcHJldmlvdXMgYmxvY2suXG4gICAgaWYgKHRoaXMucHJvY2Vzc2VkTm9kZXMuaGFzKGJsb2NrKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgbGV0IHJlc3VsdDoge25vZGU6IHQuTm9kZSB8IG51bGw7IGVycm9yczogUGFyc2VFcnJvcltdfSB8IG51bGwgPSBudWxsO1xuXG4gICAgc3dpdGNoIChibG9jay5uYW1lKSB7XG4gICAgICBjYXNlICdkZWZlcic6XG4gICAgICAgIHJlc3VsdCA9IGNyZWF0ZURlZmVycmVkQmxvY2soXG4gICAgICAgICAgYmxvY2ssXG4gICAgICAgICAgdGhpcy5maW5kQ29ubmVjdGVkQmxvY2tzKGluZGV4LCBjb250ZXh0LCBpc0Nvbm5lY3RlZERlZmVyTG9vcEJsb2NrKSxcbiAgICAgICAgICB0aGlzLFxuICAgICAgICAgIHRoaXMuYmluZGluZ1BhcnNlcixcbiAgICAgICAgKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ3N3aXRjaCc6XG4gICAgICAgIHJlc3VsdCA9IGNyZWF0ZVN3aXRjaEJsb2NrKGJsb2NrLCB0aGlzLCB0aGlzLmJpbmRpbmdQYXJzZXIpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnZm9yJzpcbiAgICAgICAgcmVzdWx0ID0gY3JlYXRlRm9yTG9vcChcbiAgICAgICAgICBibG9jayxcbiAgICAgICAgICB0aGlzLmZpbmRDb25uZWN0ZWRCbG9ja3MoaW5kZXgsIGNvbnRleHQsIGlzQ29ubmVjdGVkRm9yTG9vcEJsb2NrKSxcbiAgICAgICAgICB0aGlzLFxuICAgICAgICAgIHRoaXMuYmluZGluZ1BhcnNlcixcbiAgICAgICAgKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ2lmJzpcbiAgICAgICAgcmVzdWx0ID0gY3JlYXRlSWZCbG9jayhcbiAgICAgICAgICBibG9jayxcbiAgICAgICAgICB0aGlzLmZpbmRDb25uZWN0ZWRCbG9ja3MoaW5kZXgsIGNvbnRleHQsIGlzQ29ubmVjdGVkSWZMb29wQmxvY2spLFxuICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgdGhpcy5iaW5kaW5nUGFyc2VyLFxuICAgICAgICApO1xuICAgICAgICBicmVhaztcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgbGV0IGVycm9yTWVzc2FnZTogc3RyaW5nO1xuXG4gICAgICAgIGlmIChpc0Nvbm5lY3RlZERlZmVyTG9vcEJsb2NrKGJsb2NrLm5hbWUpKSB7XG4gICAgICAgICAgZXJyb3JNZXNzYWdlID0gYEAke2Jsb2NrLm5hbWV9IGJsb2NrIGNhbiBvbmx5IGJlIHVzZWQgYWZ0ZXIgYW4gQGRlZmVyIGJsb2NrLmA7XG4gICAgICAgICAgdGhpcy5wcm9jZXNzZWROb2Rlcy5hZGQoYmxvY2spO1xuICAgICAgICB9IGVsc2UgaWYgKGlzQ29ubmVjdGVkRm9yTG9vcEJsb2NrKGJsb2NrLm5hbWUpKSB7XG4gICAgICAgICAgZXJyb3JNZXNzYWdlID0gYEAke2Jsb2NrLm5hbWV9IGJsb2NrIGNhbiBvbmx5IGJlIHVzZWQgYWZ0ZXIgYW4gQGZvciBibG9jay5gO1xuICAgICAgICAgIHRoaXMucHJvY2Vzc2VkTm9kZXMuYWRkKGJsb2NrKTtcbiAgICAgICAgfSBlbHNlIGlmIChpc0Nvbm5lY3RlZElmTG9vcEJsb2NrKGJsb2NrLm5hbWUpKSB7XG4gICAgICAgICAgZXJyb3JNZXNzYWdlID0gYEAke2Jsb2NrLm5hbWV9IGJsb2NrIGNhbiBvbmx5IGJlIHVzZWQgYWZ0ZXIgYW4gQGlmIG9yIEBlbHNlIGlmIGJsb2NrLmA7XG4gICAgICAgICAgdGhpcy5wcm9jZXNzZWROb2Rlcy5hZGQoYmxvY2spO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGVycm9yTWVzc2FnZSA9IGBVbnJlY29nbml6ZWQgYmxvY2sgQCR7YmxvY2submFtZX0uYDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgICBub2RlOiBuZXcgdC5Vbmtub3duQmxvY2soYmxvY2submFtZSwgYmxvY2suc291cmNlU3BhbiwgYmxvY2submFtZVNwYW4pLFxuICAgICAgICAgIGVycm9yczogW25ldyBQYXJzZUVycm9yKGJsb2NrLnNvdXJjZVNwYW4sIGVycm9yTWVzc2FnZSldLFxuICAgICAgICB9O1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICB0aGlzLmVycm9ycy5wdXNoKC4uLnJlc3VsdC5lcnJvcnMpO1xuICAgIHJldHVybiByZXN1bHQubm9kZTtcbiAgfVxuXG4gIHByaXZhdGUgZmluZENvbm5lY3RlZEJsb2NrcyhcbiAgICBwcmltYXJ5QmxvY2tJbmRleDogbnVtYmVyLFxuICAgIHNpYmxpbmdzOiBodG1sLk5vZGVbXSxcbiAgICBwcmVkaWNhdGU6IChibG9ja05hbWU6IHN0cmluZykgPT4gYm9vbGVhbixcbiAgKTogaHRtbC5CbG9ja1tdIHtcbiAgICBjb25zdCByZWxhdGVkQmxvY2tzOiBodG1sLkJsb2NrW10gPSBbXTtcblxuICAgIGZvciAobGV0IGkgPSBwcmltYXJ5QmxvY2tJbmRleCArIDE7IGkgPCBzaWJsaW5ncy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3Qgbm9kZSA9IHNpYmxpbmdzW2ldO1xuXG4gICAgICAvLyBTa2lwIG92ZXIgY29tbWVudHMuXG4gICAgICBpZiAobm9kZSBpbnN0YW5jZW9mIGh0bWwuQ29tbWVudCkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gSWdub3JlIGVtcHR5IHRleHQgbm9kZXMgYmV0d2VlbiBibG9ja3MuXG4gICAgICBpZiAobm9kZSBpbnN0YW5jZW9mIGh0bWwuVGV4dCAmJiBub2RlLnZhbHVlLnRyaW0oKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgLy8gQWRkIHRoZSB0ZXh0IG5vZGUgdG8gdGhlIHByb2Nlc3NlZCBub2RlcyBzaW5jZSB3ZSBkb24ndCB3YW50XG4gICAgICAgIC8vIGl0IHRvIGJlIGdlbmVyYXRlZCBiZXR3ZWVuIHRoZSBjb25uZWN0ZWQgbm9kZXMuXG4gICAgICAgIHRoaXMucHJvY2Vzc2VkTm9kZXMuYWRkKG5vZGUpO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gU3RvcCBzZWFyY2hpbmcgYXMgc29vbiBhcyB3ZSBoaXQgYSBub24tYmxvY2sgbm9kZSBvciBhIGJsb2NrIHRoYXQgaXMgdW5yZWxhdGVkLlxuICAgICAgaWYgKCEobm9kZSBpbnN0YW5jZW9mIGh0bWwuQmxvY2spIHx8ICFwcmVkaWNhdGUobm9kZS5uYW1lKSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgcmVsYXRlZEJsb2Nrcy5wdXNoKG5vZGUpO1xuICAgICAgdGhpcy5wcm9jZXNzZWROb2Rlcy5hZGQobm9kZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlbGF0ZWRCbG9ja3M7XG4gIH1cblxuICAvLyBjb252ZXJ0IHZpZXcgZW5naW5lIGBQYXJzZWRQcm9wZXJ0eWAgdG8gYSBmb3JtYXQgc3VpdGFibGUgZm9yIElWWVxuICBwcml2YXRlIGV4dHJhY3RBdHRyaWJ1dGVzKFxuICAgIGVsZW1lbnROYW1lOiBzdHJpbmcsXG4gICAgcHJvcGVydGllczogUGFyc2VkUHJvcGVydHlbXSxcbiAgICBpMThuUHJvcHNNZXRhOiB7W2tleTogc3RyaW5nXTogaTE4bi5JMThuTWV0YX0sXG4gICk6IHtib3VuZDogdC5Cb3VuZEF0dHJpYnV0ZVtdOyBsaXRlcmFsOiB0LlRleHRBdHRyaWJ1dGVbXX0ge1xuICAgIGNvbnN0IGJvdW5kOiB0LkJvdW5kQXR0cmlidXRlW10gPSBbXTtcbiAgICBjb25zdCBsaXRlcmFsOiB0LlRleHRBdHRyaWJ1dGVbXSA9IFtdO1xuXG4gICAgcHJvcGVydGllcy5mb3JFYWNoKChwcm9wKSA9PiB7XG4gICAgICBjb25zdCBpMThuID0gaTE4blByb3BzTWV0YVtwcm9wLm5hbWVdO1xuICAgICAgaWYgKHByb3AuaXNMaXRlcmFsKSB7XG4gICAgICAgIGxpdGVyYWwucHVzaChcbiAgICAgICAgICBuZXcgdC5UZXh0QXR0cmlidXRlKFxuICAgICAgICAgICAgcHJvcC5uYW1lLFxuICAgICAgICAgICAgcHJvcC5leHByZXNzaW9uLnNvdXJjZSB8fCAnJyxcbiAgICAgICAgICAgIHByb3Auc291cmNlU3BhbixcbiAgICAgICAgICAgIHByb3Aua2V5U3BhbixcbiAgICAgICAgICAgIHByb3AudmFsdWVTcGFuLFxuICAgICAgICAgICAgaTE4bixcbiAgICAgICAgICApLFxuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gTm90ZSB0aGF0IHZhbGlkYXRpb24gaXMgc2tpcHBlZCBhbmQgcHJvcGVydHkgbWFwcGluZyBpcyBkaXNhYmxlZFxuICAgICAgICAvLyBkdWUgdG8gdGhlIGZhY3QgdGhhdCB3ZSBuZWVkIHRvIG1ha2Ugc3VyZSBhIGdpdmVuIHByb3AgaXMgbm90IGFuXG4gICAgICAgIC8vIGlucHV0IG9mIGEgZGlyZWN0aXZlIGFuZCBkaXJlY3RpdmUgbWF0Y2hpbmcgaGFwcGVucyBhdCBydW50aW1lLlxuICAgICAgICBjb25zdCBiZXAgPSB0aGlzLmJpbmRpbmdQYXJzZXIuY3JlYXRlQm91bmRFbGVtZW50UHJvcGVydHkoXG4gICAgICAgICAgZWxlbWVudE5hbWUsXG4gICAgICAgICAgcHJvcCxcbiAgICAgICAgICAvKiBza2lwVmFsaWRhdGlvbiAqLyB0cnVlLFxuICAgICAgICAgIC8qIG1hcFByb3BlcnR5TmFtZSAqLyBmYWxzZSxcbiAgICAgICAgKTtcbiAgICAgICAgYm91bmQucHVzaCh0LkJvdW5kQXR0cmlidXRlLmZyb21Cb3VuZEVsZW1lbnRQcm9wZXJ0eShiZXAsIGkxOG4pKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiB7Ym91bmQsIGxpdGVyYWx9O1xuICB9XG5cbiAgcHJpdmF0ZSBwYXJzZUF0dHJpYnV0ZShcbiAgICBpc1RlbXBsYXRlRWxlbWVudDogYm9vbGVhbixcbiAgICBhdHRyaWJ1dGU6IGh0bWwuQXR0cmlidXRlLFxuICAgIG1hdGNoYWJsZUF0dHJpYnV0ZXM6IHN0cmluZ1tdW10sXG4gICAgcGFyc2VkUHJvcGVydGllczogUGFyc2VkUHJvcGVydHlbXSxcbiAgICBib3VuZEV2ZW50czogdC5Cb3VuZEV2ZW50W10sXG4gICAgdmFyaWFibGVzOiB0LlZhcmlhYmxlW10sXG4gICAgcmVmZXJlbmNlczogdC5SZWZlcmVuY2VbXSxcbiAgKSB7XG4gICAgY29uc3QgbmFtZSA9IG5vcm1hbGl6ZUF0dHJpYnV0ZU5hbWUoYXR0cmlidXRlLm5hbWUpO1xuICAgIGNvbnN0IHZhbHVlID0gYXR0cmlidXRlLnZhbHVlO1xuICAgIGNvbnN0IHNyY1NwYW4gPSBhdHRyaWJ1dGUuc291cmNlU3BhbjtcbiAgICBjb25zdCBhYnNvbHV0ZU9mZnNldCA9IGF0dHJpYnV0ZS52YWx1ZVNwYW5cbiAgICAgID8gYXR0cmlidXRlLnZhbHVlU3Bhbi5zdGFydC5vZmZzZXRcbiAgICAgIDogc3JjU3Bhbi5zdGFydC5vZmZzZXQ7XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVLZXlTcGFuKHNyY1NwYW46IFBhcnNlU291cmNlU3BhbiwgcHJlZml4OiBzdHJpbmcsIGlkZW50aWZpZXI6IHN0cmluZykge1xuICAgICAgLy8gV2UgbmVlZCB0byBhZGp1c3QgdGhlIHN0YXJ0IGxvY2F0aW9uIGZvciB0aGUga2V5U3BhbiB0byBhY2NvdW50IGZvciB0aGUgcmVtb3ZlZCAnZGF0YS0nXG4gICAgICAvLyBwcmVmaXggZnJvbSBgbm9ybWFsaXplQXR0cmlidXRlTmFtZWAuXG4gICAgICBjb25zdCBub3JtYWxpemF0aW9uQWRqdXN0bWVudCA9IGF0dHJpYnV0ZS5uYW1lLmxlbmd0aCAtIG5hbWUubGVuZ3RoO1xuICAgICAgY29uc3Qga2V5U3BhblN0YXJ0ID0gc3JjU3Bhbi5zdGFydC5tb3ZlQnkocHJlZml4Lmxlbmd0aCArIG5vcm1hbGl6YXRpb25BZGp1c3RtZW50KTtcbiAgICAgIGNvbnN0IGtleVNwYW5FbmQgPSBrZXlTcGFuU3RhcnQubW92ZUJ5KGlkZW50aWZpZXIubGVuZ3RoKTtcbiAgICAgIHJldHVybiBuZXcgUGFyc2VTb3VyY2VTcGFuKGtleVNwYW5TdGFydCwga2V5U3BhbkVuZCwga2V5U3BhblN0YXJ0LCBpZGVudGlmaWVyKTtcbiAgICB9XG5cbiAgICBjb25zdCBiaW5kUGFydHMgPSBuYW1lLm1hdGNoKEJJTkRfTkFNRV9SRUdFWFApO1xuXG4gICAgaWYgKGJpbmRQYXJ0cykge1xuICAgICAgaWYgKGJpbmRQYXJ0c1tLV19CSU5EX0lEWF0gIT0gbnVsbCkge1xuICAgICAgICBjb25zdCBpZGVudGlmaWVyID0gYmluZFBhcnRzW0lERU5UX0tXX0lEWF07XG4gICAgICAgIGNvbnN0IGtleVNwYW4gPSBjcmVhdGVLZXlTcGFuKHNyY1NwYW4sIGJpbmRQYXJ0c1tLV19CSU5EX0lEWF0sIGlkZW50aWZpZXIpO1xuICAgICAgICB0aGlzLmJpbmRpbmdQYXJzZXIucGFyc2VQcm9wZXJ0eUJpbmRpbmcoXG4gICAgICAgICAgaWRlbnRpZmllcixcbiAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICBmYWxzZSxcbiAgICAgICAgICBmYWxzZSxcbiAgICAgICAgICBzcmNTcGFuLFxuICAgICAgICAgIGFic29sdXRlT2Zmc2V0LFxuICAgICAgICAgIGF0dHJpYnV0ZS52YWx1ZVNwYW4sXG4gICAgICAgICAgbWF0Y2hhYmxlQXR0cmlidXRlcyxcbiAgICAgICAgICBwYXJzZWRQcm9wZXJ0aWVzLFxuICAgICAgICAgIGtleVNwYW4sXG4gICAgICAgICk7XG4gICAgICB9IGVsc2UgaWYgKGJpbmRQYXJ0c1tLV19MRVRfSURYXSkge1xuICAgICAgICBpZiAoaXNUZW1wbGF0ZUVsZW1lbnQpIHtcbiAgICAgICAgICBjb25zdCBpZGVudGlmaWVyID0gYmluZFBhcnRzW0lERU5UX0tXX0lEWF07XG4gICAgICAgICAgY29uc3Qga2V5U3BhbiA9IGNyZWF0ZUtleVNwYW4oc3JjU3BhbiwgYmluZFBhcnRzW0tXX0xFVF9JRFhdLCBpZGVudGlmaWVyKTtcbiAgICAgICAgICB0aGlzLnBhcnNlVmFyaWFibGUoaWRlbnRpZmllciwgdmFsdWUsIHNyY1NwYW4sIGtleVNwYW4sIGF0dHJpYnV0ZS52YWx1ZVNwYW4sIHZhcmlhYmxlcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5yZXBvcnRFcnJvcihgXCJsZXQtXCIgaXMgb25seSBzdXBwb3J0ZWQgb24gbmctdGVtcGxhdGUgZWxlbWVudHMuYCwgc3JjU3Bhbik7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoYmluZFBhcnRzW0tXX1JFRl9JRFhdKSB7XG4gICAgICAgIGNvbnN0IGlkZW50aWZpZXIgPSBiaW5kUGFydHNbSURFTlRfS1dfSURYXTtcbiAgICAgICAgY29uc3Qga2V5U3BhbiA9IGNyZWF0ZUtleVNwYW4oc3JjU3BhbiwgYmluZFBhcnRzW0tXX1JFRl9JRFhdLCBpZGVudGlmaWVyKTtcbiAgICAgICAgdGhpcy5wYXJzZVJlZmVyZW5jZShpZGVudGlmaWVyLCB2YWx1ZSwgc3JjU3Bhbiwga2V5U3BhbiwgYXR0cmlidXRlLnZhbHVlU3BhbiwgcmVmZXJlbmNlcyk7XG4gICAgICB9IGVsc2UgaWYgKGJpbmRQYXJ0c1tLV19PTl9JRFhdKSB7XG4gICAgICAgIGNvbnN0IGV2ZW50czogUGFyc2VkRXZlbnRbXSA9IFtdO1xuICAgICAgICBjb25zdCBpZGVudGlmaWVyID0gYmluZFBhcnRzW0lERU5UX0tXX0lEWF07XG4gICAgICAgIGNvbnN0IGtleVNwYW4gPSBjcmVhdGVLZXlTcGFuKHNyY1NwYW4sIGJpbmRQYXJ0c1tLV19PTl9JRFhdLCBpZGVudGlmaWVyKTtcbiAgICAgICAgdGhpcy5iaW5kaW5nUGFyc2VyLnBhcnNlRXZlbnQoXG4gICAgICAgICAgaWRlbnRpZmllcixcbiAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAvKiBpc0Fzc2lnbm1lbnRFdmVudCAqLyBmYWxzZSxcbiAgICAgICAgICBzcmNTcGFuLFxuICAgICAgICAgIGF0dHJpYnV0ZS52YWx1ZVNwYW4gfHwgc3JjU3BhbixcbiAgICAgICAgICBtYXRjaGFibGVBdHRyaWJ1dGVzLFxuICAgICAgICAgIGV2ZW50cyxcbiAgICAgICAgICBrZXlTcGFuLFxuICAgICAgICApO1xuICAgICAgICBhZGRFdmVudHMoZXZlbnRzLCBib3VuZEV2ZW50cyk7XG4gICAgICB9IGVsc2UgaWYgKGJpbmRQYXJ0c1tLV19CSU5ET05fSURYXSkge1xuICAgICAgICBjb25zdCBpZGVudGlmaWVyID0gYmluZFBhcnRzW0lERU5UX0tXX0lEWF07XG4gICAgICAgIGNvbnN0IGtleVNwYW4gPSBjcmVhdGVLZXlTcGFuKHNyY1NwYW4sIGJpbmRQYXJ0c1tLV19CSU5ET05fSURYXSwgaWRlbnRpZmllcik7XG4gICAgICAgIHRoaXMuYmluZGluZ1BhcnNlci5wYXJzZVByb3BlcnR5QmluZGluZyhcbiAgICAgICAgICBpZGVudGlmaWVyLFxuICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgIGZhbHNlLFxuICAgICAgICAgIHRydWUsXG4gICAgICAgICAgc3JjU3BhbixcbiAgICAgICAgICBhYnNvbHV0ZU9mZnNldCxcbiAgICAgICAgICBhdHRyaWJ1dGUudmFsdWVTcGFuLFxuICAgICAgICAgIG1hdGNoYWJsZUF0dHJpYnV0ZXMsXG4gICAgICAgICAgcGFyc2VkUHJvcGVydGllcyxcbiAgICAgICAgICBrZXlTcGFuLFxuICAgICAgICApO1xuICAgICAgICB0aGlzLnBhcnNlQXNzaWdubWVudEV2ZW50KFxuICAgICAgICAgIGlkZW50aWZpZXIsXG4gICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgc3JjU3BhbixcbiAgICAgICAgICBhdHRyaWJ1dGUudmFsdWVTcGFuLFxuICAgICAgICAgIG1hdGNoYWJsZUF0dHJpYnV0ZXMsXG4gICAgICAgICAgYm91bmRFdmVudHMsXG4gICAgICAgICAga2V5U3BhbixcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSBpZiAoYmluZFBhcnRzW0tXX0FUX0lEWF0pIHtcbiAgICAgICAgY29uc3Qga2V5U3BhbiA9IGNyZWF0ZUtleVNwYW4oc3JjU3BhbiwgJycsIG5hbWUpO1xuICAgICAgICB0aGlzLmJpbmRpbmdQYXJzZXIucGFyc2VMaXRlcmFsQXR0cihcbiAgICAgICAgICBuYW1lLFxuICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgIHNyY1NwYW4sXG4gICAgICAgICAgYWJzb2x1dGVPZmZzZXQsXG4gICAgICAgICAgYXR0cmlidXRlLnZhbHVlU3BhbixcbiAgICAgICAgICBtYXRjaGFibGVBdHRyaWJ1dGVzLFxuICAgICAgICAgIHBhcnNlZFByb3BlcnRpZXMsXG4gICAgICAgICAga2V5U3BhbixcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8vIFdlIGRpZG4ndCBzZWUgYSBrdy1wcmVmaXhlZCBwcm9wZXJ0eSBiaW5kaW5nLCBidXQgd2UgaGF2ZSBub3QgeWV0IGNoZWNrZWRcbiAgICAvLyBmb3IgdGhlIFtdLygpL1soKV0gc3ludGF4LlxuICAgIGxldCBkZWxpbXM6IHtzdGFydDogc3RyaW5nOyBlbmQ6IHN0cmluZ30gfCBudWxsID0gbnVsbDtcbiAgICBpZiAobmFtZS5zdGFydHNXaXRoKEJJTkRJTkdfREVMSU1TLkJBTkFOQV9CT1guc3RhcnQpKSB7XG4gICAgICBkZWxpbXMgPSBCSU5ESU5HX0RFTElNUy5CQU5BTkFfQk9YO1xuICAgIH0gZWxzZSBpZiAobmFtZS5zdGFydHNXaXRoKEJJTkRJTkdfREVMSU1TLlBST1BFUlRZLnN0YXJ0KSkge1xuICAgICAgZGVsaW1zID0gQklORElOR19ERUxJTVMuUFJPUEVSVFk7XG4gICAgfSBlbHNlIGlmIChuYW1lLnN0YXJ0c1dpdGgoQklORElOR19ERUxJTVMuRVZFTlQuc3RhcnQpKSB7XG4gICAgICBkZWxpbXMgPSBCSU5ESU5HX0RFTElNUy5FVkVOVDtcbiAgICB9XG4gICAgaWYgKFxuICAgICAgZGVsaW1zICE9PSBudWxsICYmXG4gICAgICAvLyBOT1RFOiBvbGRlciB2ZXJzaW9ucyBvZiB0aGUgcGFyc2VyIHdvdWxkIG1hdGNoIGEgc3RhcnQvZW5kIGRlbGltaXRlZFxuICAgICAgLy8gYmluZGluZyBpZmYgdGhlIHByb3BlcnR5IG5hbWUgd2FzIHRlcm1pbmF0ZWQgYnkgdGhlIGVuZGluZyBkZWxpbWl0ZXJcbiAgICAgIC8vIGFuZCB0aGUgaWRlbnRpZmllciBpbiB0aGUgYmluZGluZyB3YXMgbm9uLWVtcHR5LlxuICAgICAgLy8gVE9ETyhheWF6aGFmaXopOiB1cGRhdGUgdGhpcyB0byBoYW5kbGUgbWFsZm9ybWVkIGJpbmRpbmdzLlxuICAgICAgbmFtZS5lbmRzV2l0aChkZWxpbXMuZW5kKSAmJlxuICAgICAgbmFtZS5sZW5ndGggPiBkZWxpbXMuc3RhcnQubGVuZ3RoICsgZGVsaW1zLmVuZC5sZW5ndGhcbiAgICApIHtcbiAgICAgIGNvbnN0IGlkZW50aWZpZXIgPSBuYW1lLnN1YnN0cmluZyhkZWxpbXMuc3RhcnQubGVuZ3RoLCBuYW1lLmxlbmd0aCAtIGRlbGltcy5lbmQubGVuZ3RoKTtcbiAgICAgIGNvbnN0IGtleVNwYW4gPSBjcmVhdGVLZXlTcGFuKHNyY1NwYW4sIGRlbGltcy5zdGFydCwgaWRlbnRpZmllcik7XG4gICAgICBpZiAoZGVsaW1zLnN0YXJ0ID09PSBCSU5ESU5HX0RFTElNUy5CQU5BTkFfQk9YLnN0YXJ0KSB7XG4gICAgICAgIHRoaXMuYmluZGluZ1BhcnNlci5wYXJzZVByb3BlcnR5QmluZGluZyhcbiAgICAgICAgICBpZGVudGlmaWVyLFxuICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgIGZhbHNlLFxuICAgICAgICAgIHRydWUsXG4gICAgICAgICAgc3JjU3BhbixcbiAgICAgICAgICBhYnNvbHV0ZU9mZnNldCxcbiAgICAgICAgICBhdHRyaWJ1dGUudmFsdWVTcGFuLFxuICAgICAgICAgIG1hdGNoYWJsZUF0dHJpYnV0ZXMsXG4gICAgICAgICAgcGFyc2VkUHJvcGVydGllcyxcbiAgICAgICAgICBrZXlTcGFuLFxuICAgICAgICApO1xuICAgICAgICB0aGlzLnBhcnNlQXNzaWdubWVudEV2ZW50KFxuICAgICAgICAgIGlkZW50aWZpZXIsXG4gICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgc3JjU3BhbixcbiAgICAgICAgICBhdHRyaWJ1dGUudmFsdWVTcGFuLFxuICAgICAgICAgIG1hdGNoYWJsZUF0dHJpYnV0ZXMsXG4gICAgICAgICAgYm91bmRFdmVudHMsXG4gICAgICAgICAga2V5U3BhbixcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSBpZiAoZGVsaW1zLnN0YXJ0ID09PSBCSU5ESU5HX0RFTElNUy5QUk9QRVJUWS5zdGFydCkge1xuICAgICAgICB0aGlzLmJpbmRpbmdQYXJzZXIucGFyc2VQcm9wZXJ0eUJpbmRpbmcoXG4gICAgICAgICAgaWRlbnRpZmllcixcbiAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICBmYWxzZSxcbiAgICAgICAgICBmYWxzZSxcbiAgICAgICAgICBzcmNTcGFuLFxuICAgICAgICAgIGFic29sdXRlT2Zmc2V0LFxuICAgICAgICAgIGF0dHJpYnV0ZS52YWx1ZVNwYW4sXG4gICAgICAgICAgbWF0Y2hhYmxlQXR0cmlidXRlcyxcbiAgICAgICAgICBwYXJzZWRQcm9wZXJ0aWVzLFxuICAgICAgICAgIGtleVNwYW4sXG4gICAgICAgICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBldmVudHM6IFBhcnNlZEV2ZW50W10gPSBbXTtcbiAgICAgICAgdGhpcy5iaW5kaW5nUGFyc2VyLnBhcnNlRXZlbnQoXG4gICAgICAgICAgaWRlbnRpZmllcixcbiAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAvKiBpc0Fzc2lnbm1lbnRFdmVudCAqLyBmYWxzZSxcbiAgICAgICAgICBzcmNTcGFuLFxuICAgICAgICAgIGF0dHJpYnV0ZS52YWx1ZVNwYW4gfHwgc3JjU3BhbixcbiAgICAgICAgICBtYXRjaGFibGVBdHRyaWJ1dGVzLFxuICAgICAgICAgIGV2ZW50cyxcbiAgICAgICAgICBrZXlTcGFuLFxuICAgICAgICApO1xuICAgICAgICBhZGRFdmVudHMoZXZlbnRzLCBib3VuZEV2ZW50cyk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8vIE5vIGV4cGxpY2l0IGJpbmRpbmcgZm91bmQuXG4gICAgY29uc3Qga2V5U3BhbiA9IGNyZWF0ZUtleVNwYW4oc3JjU3BhbiwgJycgLyogcHJlZml4ICovLCBuYW1lKTtcbiAgICBjb25zdCBoYXNCaW5kaW5nID0gdGhpcy5iaW5kaW5nUGFyc2VyLnBhcnNlUHJvcGVydHlJbnRlcnBvbGF0aW9uKFxuICAgICAgbmFtZSxcbiAgICAgIHZhbHVlLFxuICAgICAgc3JjU3BhbixcbiAgICAgIGF0dHJpYnV0ZS52YWx1ZVNwYW4sXG4gICAgICBtYXRjaGFibGVBdHRyaWJ1dGVzLFxuICAgICAgcGFyc2VkUHJvcGVydGllcyxcbiAgICAgIGtleVNwYW4sXG4gICAgICBhdHRyaWJ1dGUudmFsdWVUb2tlbnMgPz8gbnVsbCxcbiAgICApO1xuICAgIHJldHVybiBoYXNCaW5kaW5nO1xuICB9XG5cbiAgcHJpdmF0ZSBfdmlzaXRUZXh0V2l0aEludGVycG9sYXRpb24oXG4gICAgdmFsdWU6IHN0cmluZyxcbiAgICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgaW50ZXJwb2xhdGVkVG9rZW5zOiBJbnRlcnBvbGF0ZWRBdHRyaWJ1dGVUb2tlbltdIHwgSW50ZXJwb2xhdGVkVGV4dFRva2VuW10gfCBudWxsLFxuICAgIGkxOG4/OiBpMThuLkkxOG5NZXRhLFxuICApOiB0LlRleHQgfCB0LkJvdW5kVGV4dCB7XG4gICAgY29uc3QgdmFsdWVOb05nc3AgPSByZXBsYWNlTmdzcCh2YWx1ZSk7XG4gICAgY29uc3QgZXhwciA9IHRoaXMuYmluZGluZ1BhcnNlci5wYXJzZUludGVycG9sYXRpb24odmFsdWVOb05nc3AsIHNvdXJjZVNwYW4sIGludGVycG9sYXRlZFRva2Vucyk7XG4gICAgcmV0dXJuIGV4cHIgPyBuZXcgdC5Cb3VuZFRleHQoZXhwciwgc291cmNlU3BhbiwgaTE4bikgOiBuZXcgdC5UZXh0KHZhbHVlTm9OZ3NwLCBzb3VyY2VTcGFuKTtcbiAgfVxuXG4gIHByaXZhdGUgcGFyc2VWYXJpYWJsZShcbiAgICBpZGVudGlmaWVyOiBzdHJpbmcsXG4gICAgdmFsdWU6IHN0cmluZyxcbiAgICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAga2V5U3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgIHZhbHVlU3BhbjogUGFyc2VTb3VyY2VTcGFuIHwgdW5kZWZpbmVkLFxuICAgIHZhcmlhYmxlczogdC5WYXJpYWJsZVtdLFxuICApIHtcbiAgICBpZiAoaWRlbnRpZmllci5pbmRleE9mKCctJykgPiAtMSkge1xuICAgICAgdGhpcy5yZXBvcnRFcnJvcihgXCItXCIgaXMgbm90IGFsbG93ZWQgaW4gdmFyaWFibGUgbmFtZXNgLCBzb3VyY2VTcGFuKTtcbiAgICB9IGVsc2UgaWYgKGlkZW50aWZpZXIubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aGlzLnJlcG9ydEVycm9yKGBWYXJpYWJsZSBkb2VzIG5vdCBoYXZlIGEgbmFtZWAsIHNvdXJjZVNwYW4pO1xuICAgIH1cblxuICAgIHZhcmlhYmxlcy5wdXNoKG5ldyB0LlZhcmlhYmxlKGlkZW50aWZpZXIsIHZhbHVlLCBzb3VyY2VTcGFuLCBrZXlTcGFuLCB2YWx1ZVNwYW4pKTtcbiAgfVxuXG4gIHByaXZhdGUgcGFyc2VSZWZlcmVuY2UoXG4gICAgaWRlbnRpZmllcjogc3RyaW5nLFxuICAgIHZhbHVlOiBzdHJpbmcsXG4gICAgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgIGtleVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICB2YWx1ZVNwYW46IFBhcnNlU291cmNlU3BhbiB8IHVuZGVmaW5lZCxcbiAgICByZWZlcmVuY2VzOiB0LlJlZmVyZW5jZVtdLFxuICApIHtcbiAgICBpZiAoaWRlbnRpZmllci5pbmRleE9mKCctJykgPiAtMSkge1xuICAgICAgdGhpcy5yZXBvcnRFcnJvcihgXCItXCIgaXMgbm90IGFsbG93ZWQgaW4gcmVmZXJlbmNlIG5hbWVzYCwgc291cmNlU3Bhbik7XG4gICAgfSBlbHNlIGlmIChpZGVudGlmaWVyLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhpcy5yZXBvcnRFcnJvcihgUmVmZXJlbmNlIGRvZXMgbm90IGhhdmUgYSBuYW1lYCwgc291cmNlU3Bhbik7XG4gICAgfSBlbHNlIGlmIChyZWZlcmVuY2VzLnNvbWUoKHJlZmVyZW5jZSkgPT4gcmVmZXJlbmNlLm5hbWUgPT09IGlkZW50aWZpZXIpKSB7XG4gICAgICB0aGlzLnJlcG9ydEVycm9yKGBSZWZlcmVuY2UgXCIjJHtpZGVudGlmaWVyfVwiIGlzIGRlZmluZWQgbW9yZSB0aGFuIG9uY2VgLCBzb3VyY2VTcGFuKTtcbiAgICB9XG5cbiAgICByZWZlcmVuY2VzLnB1c2gobmV3IHQuUmVmZXJlbmNlKGlkZW50aWZpZXIsIHZhbHVlLCBzb3VyY2VTcGFuLCBrZXlTcGFuLCB2YWx1ZVNwYW4pKTtcbiAgfVxuXG4gIHByaXZhdGUgcGFyc2VBc3NpZ25tZW50RXZlbnQoXG4gICAgbmFtZTogc3RyaW5nLFxuICAgIGV4cHJlc3Npb246IHN0cmluZyxcbiAgICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgdmFsdWVTcGFuOiBQYXJzZVNvdXJjZVNwYW4gfCB1bmRlZmluZWQsXG4gICAgdGFyZ2V0TWF0Y2hhYmxlQXR0cnM6IHN0cmluZ1tdW10sXG4gICAgYm91bmRFdmVudHM6IHQuQm91bmRFdmVudFtdLFxuICAgIGtleVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgKSB7XG4gICAgY29uc3QgZXZlbnRzOiBQYXJzZWRFdmVudFtdID0gW107XG4gICAgdGhpcy5iaW5kaW5nUGFyc2VyLnBhcnNlRXZlbnQoXG4gICAgICBgJHtuYW1lfUNoYW5nZWAsXG4gICAgICBleHByZXNzaW9uLFxuICAgICAgLyogaXNBc3NpZ25tZW50RXZlbnQgKi8gdHJ1ZSxcbiAgICAgIHNvdXJjZVNwYW4sXG4gICAgICB2YWx1ZVNwYW4gfHwgc291cmNlU3BhbixcbiAgICAgIHRhcmdldE1hdGNoYWJsZUF0dHJzLFxuICAgICAgZXZlbnRzLFxuICAgICAga2V5U3BhbixcbiAgICApO1xuICAgIGFkZEV2ZW50cyhldmVudHMsIGJvdW5kRXZlbnRzKTtcbiAgfVxuXG4gIHByaXZhdGUgcmVwb3J0RXJyb3IoXG4gICAgbWVzc2FnZTogc3RyaW5nLFxuICAgIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICBsZXZlbDogUGFyc2VFcnJvckxldmVsID0gUGFyc2VFcnJvckxldmVsLkVSUk9SLFxuICApIHtcbiAgICB0aGlzLmVycm9ycy5wdXNoKG5ldyBQYXJzZUVycm9yKHNvdXJjZVNwYW4sIG1lc3NhZ2UsIGxldmVsKSk7XG4gIH1cbn1cblxuY2xhc3MgTm9uQmluZGFibGVWaXNpdG9yIGltcGxlbWVudHMgaHRtbC5WaXNpdG9yIHtcbiAgdmlzaXRFbGVtZW50KGFzdDogaHRtbC5FbGVtZW50KTogdC5FbGVtZW50IHwgbnVsbCB7XG4gICAgY29uc3QgcHJlcGFyc2VkRWxlbWVudCA9IHByZXBhcnNlRWxlbWVudChhc3QpO1xuICAgIGlmIChcbiAgICAgIHByZXBhcnNlZEVsZW1lbnQudHlwZSA9PT0gUHJlcGFyc2VkRWxlbWVudFR5cGUuU0NSSVBUIHx8XG4gICAgICBwcmVwYXJzZWRFbGVtZW50LnR5cGUgPT09IFByZXBhcnNlZEVsZW1lbnRUeXBlLlNUWUxFIHx8XG4gICAgICBwcmVwYXJzZWRFbGVtZW50LnR5cGUgPT09IFByZXBhcnNlZEVsZW1lbnRUeXBlLlNUWUxFU0hFRVRcbiAgICApIHtcbiAgICAgIC8vIFNraXBwaW5nIDxzY3JpcHQ+IGZvciBzZWN1cml0eSByZWFzb25zXG4gICAgICAvLyBTa2lwcGluZyA8c3R5bGU+IGFuZCBzdHlsZXNoZWV0cyBhcyB3ZSBhbHJlYWR5IHByb2Nlc3NlZCB0aGVtXG4gICAgICAvLyBpbiB0aGUgU3R5bGVDb21waWxlclxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgY2hpbGRyZW46IHQuTm9kZVtdID0gaHRtbC52aXNpdEFsbCh0aGlzLCBhc3QuY2hpbGRyZW4sIG51bGwpO1xuICAgIHJldHVybiBuZXcgdC5FbGVtZW50KFxuICAgICAgYXN0Lm5hbWUsXG4gICAgICBodG1sLnZpc2l0QWxsKHRoaXMsIGFzdC5hdHRycykgYXMgdC5UZXh0QXR0cmlidXRlW10sXG4gICAgICAvKiBpbnB1dHMgKi8gW10sXG4gICAgICAvKiBvdXRwdXRzICovIFtdLFxuICAgICAgY2hpbGRyZW4sXG4gICAgICAvKiByZWZlcmVuY2VzICovIFtdLFxuICAgICAgYXN0LnNvdXJjZVNwYW4sXG4gICAgICBhc3Quc3RhcnRTb3VyY2VTcGFuLFxuICAgICAgYXN0LmVuZFNvdXJjZVNwYW4sXG4gICAgKTtcbiAgfVxuXG4gIHZpc2l0Q29tbWVudChjb21tZW50OiBodG1sLkNvbW1lbnQpOiBhbnkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgdmlzaXRBdHRyaWJ1dGUoYXR0cmlidXRlOiBodG1sLkF0dHJpYnV0ZSk6IHQuVGV4dEF0dHJpYnV0ZSB7XG4gICAgcmV0dXJuIG5ldyB0LlRleHRBdHRyaWJ1dGUoXG4gICAgICBhdHRyaWJ1dGUubmFtZSxcbiAgICAgIGF0dHJpYnV0ZS52YWx1ZSxcbiAgICAgIGF0dHJpYnV0ZS5zb3VyY2VTcGFuLFxuICAgICAgYXR0cmlidXRlLmtleVNwYW4sXG4gICAgICBhdHRyaWJ1dGUudmFsdWVTcGFuLFxuICAgICAgYXR0cmlidXRlLmkxOG4sXG4gICAgKTtcbiAgfVxuXG4gIHZpc2l0VGV4dCh0ZXh0OiBodG1sLlRleHQpOiB0LlRleHQge1xuICAgIHJldHVybiBuZXcgdC5UZXh0KHRleHQudmFsdWUsIHRleHQuc291cmNlU3Bhbik7XG4gIH1cblxuICB2aXNpdEV4cGFuc2lvbihleHBhbnNpb246IGh0bWwuRXhwYW5zaW9uKTogYW55IHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHZpc2l0RXhwYW5zaW9uQ2FzZShleHBhbnNpb25DYXNlOiBodG1sLkV4cGFuc2lvbkNhc2UpOiBhbnkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgdmlzaXRCbG9jayhibG9jazogaHRtbC5CbG9jaywgY29udGV4dDogYW55KSB7XG4gICAgY29uc3Qgbm9kZXMgPSBbXG4gICAgICAvLyBJbiBhbiBuZ05vbkJpbmRhYmxlIGNvbnRleHQgd2UgdHJlYXQgdGhlIG9wZW5pbmcvY2xvc2luZyB0YWdzIG9mIGJsb2NrIGFzIHBsYWluIHRleHQuXG4gICAgICAvLyBUaGlzIGlzIHRoZSBhcyBpZiB0aGUgYHRva2VuaXplQmxvY2tzYCBvcHRpb24gd2FzIGRpc2FibGVkLlxuICAgICAgbmV3IHQuVGV4dChibG9jay5zdGFydFNvdXJjZVNwYW4udG9TdHJpbmcoKSwgYmxvY2suc3RhcnRTb3VyY2VTcGFuKSxcbiAgICAgIC4uLmh0bWwudmlzaXRBbGwodGhpcywgYmxvY2suY2hpbGRyZW4pLFxuICAgIF07XG5cbiAgICBpZiAoYmxvY2suZW5kU291cmNlU3BhbiAhPT0gbnVsbCkge1xuICAgICAgbm9kZXMucHVzaChuZXcgdC5UZXh0KGJsb2NrLmVuZFNvdXJjZVNwYW4udG9TdHJpbmcoKSwgYmxvY2suZW5kU291cmNlU3BhbikpO1xuICAgIH1cblxuICAgIHJldHVybiBub2RlcztcbiAgfVxuXG4gIHZpc2l0QmxvY2tQYXJhbWV0ZXIocGFyYW1ldGVyOiBodG1sLkJsb2NrUGFyYW1ldGVyLCBjb250ZXh0OiBhbnkpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHZpc2l0TGV0RGVjbGFyYXRpb24oZGVjbDogaHRtbC5MZXREZWNsYXJhdGlvbiwgY29udGV4dDogYW55KSB7XG4gICAgcmV0dXJuIG5ldyB0LlRleHQoYEBsZXQgJHtkZWNsLm5hbWV9ID0gJHtkZWNsLnZhbHVlfTtgLCBkZWNsLnNvdXJjZVNwYW4pO1xuICB9XG59XG5cbmNvbnN0IE5PTl9CSU5EQUJMRV9WSVNJVE9SID0gbmV3IE5vbkJpbmRhYmxlVmlzaXRvcigpO1xuXG5mdW5jdGlvbiBub3JtYWxpemVBdHRyaWJ1dGVOYW1lKGF0dHJOYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gL15kYXRhLS9pLnRlc3QoYXR0ck5hbWUpID8gYXR0ck5hbWUuc3Vic3RyaW5nKDUpIDogYXR0ck5hbWU7XG59XG5cbmZ1bmN0aW9uIGFkZEV2ZW50cyhldmVudHM6IFBhcnNlZEV2ZW50W10sIGJvdW5kRXZlbnRzOiB0LkJvdW5kRXZlbnRbXSkge1xuICBib3VuZEV2ZW50cy5wdXNoKC4uLmV2ZW50cy5tYXAoKGUpID0+IHQuQm91bmRFdmVudC5mcm9tUGFyc2VkRXZlbnQoZSkpKTtcbn1cblxuZnVuY3Rpb24gdGV4dENvbnRlbnRzKG5vZGU6IGh0bWwuRWxlbWVudCk6IHN0cmluZyB8IG51bGwge1xuICBpZiAobm9kZS5jaGlsZHJlbi5sZW5ndGggIT09IDEgfHwgIShub2RlLmNoaWxkcmVuWzBdIGluc3RhbmNlb2YgaHRtbC5UZXh0KSkge1xuICAgIHJldHVybiBudWxsO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiAobm9kZS5jaGlsZHJlblswXSBhcyBodG1sLlRleHQpLnZhbHVlO1xuICB9XG59XG4iXX0=