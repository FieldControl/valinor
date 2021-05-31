/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as html from '../ml_parser/ast';
import { replaceNgsp } from '../ml_parser/html_whitespaces';
import { isNgTemplate } from '../ml_parser/tags';
import { ParseError, ParseErrorLevel, ParseSourceSpan } from '../parse_util';
import { isStyleUrlResolvable } from '../style_url_resolver';
import { PreparsedElementType, preparseElement } from '../template_parser/template_preparser';
import * as t from './r3_ast';
import { I18N_ICU_VAR_PREFIX, isI18nRootNode } from './view/i18n/util';
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
    const ivyNodes = html.visitAll(transformer, htmlNodes);
    // Errors might originate in either the binding parser or the html to ivy transformer
    const allErrors = bindingParser.errors.concat(transformer.errors);
    const result = {
        nodes: ivyNodes,
        errors: allErrors,
        styleUrls: transformer.styleUrls,
        styles: transformer.styles,
        ngContentSelectors: transformer.ngContentSelectors
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
                const absoluteValueOffset = attribute.valueSpan ?
                    attribute.valueSpan.start.offset :
                    // If there is no value span the attribute does not have a value, like `attr` in
                    //`<div attr></div>`. In this case, point to one character beyond the last character of
                    // the attribute name.
                    attribute.sourceSpan.start.offset + attribute.name.length;
                this.bindingParser.parseInlineTemplateBinding(templateKey, templateValue, attribute.sourceSpan, absoluteValueOffset, [], templateParsedProperties, parsedVariables, true /* isIvyAst */);
                templateVariables.push(...parsedVariables.map(v => new t.Variable(v.name, v.value, v.sourceSpan, v.keySpan, v.valueSpan)));
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
        const children = html.visitAll(preparsedElement.nonBindable ? NON_BINDABLE_VISITOR : this, element.children);
        let parsedElement;
        if (preparsedElement.type === PreparsedElementType.NG_CONTENT) {
            // `<ng-content>`
            if (element.children &&
                !element.children.every((node) => isEmptyTextNode(node) || isCommentNode(node))) {
                this.reportError(`<ng-content> element cannot have content.`, element.sourceSpan);
            }
            const selector = preparsedElement.selectAttr;
            const attrs = element.attrs.map(attr => this.visitAttribute(attr));
            parsedElement = new t.Content(selector, attrs, element.sourceSpan, element.i18n);
            this.ngContentSelectors.push(selector);
        }
        else if (isTemplateElement) {
            // `<ng-template>`
            const attrs = this.extractAttributes(element.name, parsedProperties, i18nAttrsMeta);
            parsedElement = new t.Template(element.name, attributes, attrs.bound, boundEvents, [ /* no template attributes */], children, references, variables, element.sourceSpan, element.startSourceSpan, element.endSourceSpan, element.i18n);
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
            attrs.literal.forEach(attr => templateAttrs.push(attr));
            attrs.bound.forEach(attr => templateAttrs.push(attr));
            const hoistedAttrs = parsedElement instanceof t.Element ?
                {
                    attributes: parsedElement.attributes,
                    inputs: parsedElement.inputs,
                    outputs: parsedElement.outputs,
                } :
                { attributes: [], inputs: [], outputs: [] };
            // For <ng-template>s with structural directives on them, avoid passing i18n information to
            // the wrapping template to prevent unnecessary i18n instructions from being generated. The
            // necessary i18n meta information will be extracted from child elements.
            const i18n = isTemplateElement && isI18nRootElement ? undefined : element.i18n;
            // TODO(pk): test for this case
            parsedElement = new t.Template(parsedElement.name, hoistedAttrs.attributes, hoistedAttrs.inputs, hoistedAttrs.outputs, templateAttrs, [parsedElement], [ /* no references */], templateVariables, element.sourceSpan, element.startSourceSpan, element.endSourceSpan, i18n);
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
        return this._visitTextWithInterpolation(text.value, text.sourceSpan, text.i18n);
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
        Object.keys(message.placeholders).forEach(key => {
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
                placeholders[key] = this._visitTextWithInterpolation(value.text, value.sourceSpan);
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
    // convert view engine `ParsedProperty` to a format suitable for IVY
    extractAttributes(elementName, properties, i18nPropsMeta) {
        const bound = [];
        const literal = [];
        properties.forEach(prop => {
            const i18n = i18nPropsMeta[prop.name];
            if (prop.isLiteral) {
                literal.push(new t.TextAttribute(prop.name, prop.expression.source || '', prop.sourceSpan, prop.keySpan, prop.valueSpan, i18n));
            }
            else {
                // Note that validation is skipped and property mapping is disabled
                // due to the fact that we need to make sure a given prop is not an
                // input of a directive and directive matching happens at runtime.
                const bep = this.bindingParser.createBoundElementProperty(elementName, prop, /* skipValidation */ true, /* mapPropertyName */ false);
                bound.push(t.BoundAttribute.fromBoundElementProperty(bep, i18n));
            }
        });
        return { bound, literal };
    }
    parseAttribute(isTemplateElement, attribute, matchableAttributes, parsedProperties, boundEvents, variables, references) {
        const name = normalizeAttributeName(attribute.name);
        const value = attribute.value;
        const srcSpan = attribute.sourceSpan;
        const absoluteOffset = attribute.valueSpan ? attribute.valueSpan.start.offset : srcSpan.start.offset;
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
                this.bindingParser.parsePropertyBinding(identifier, value, false, srcSpan, absoluteOffset, attribute.valueSpan, matchableAttributes, parsedProperties, keySpan);
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
                this.bindingParser.parseEvent(identifier, value, srcSpan, attribute.valueSpan || srcSpan, matchableAttributes, events, keySpan);
                addEvents(events, boundEvents);
            }
            else if (bindParts[KW_BINDON_IDX]) {
                const identifier = bindParts[IDENT_KW_IDX];
                const keySpan = createKeySpan(srcSpan, bindParts[KW_BINDON_IDX], identifier);
                this.bindingParser.parsePropertyBinding(identifier, value, false, srcSpan, absoluteOffset, attribute.valueSpan, matchableAttributes, parsedProperties, keySpan);
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
            name.endsWith(delims.end) && name.length > delims.start.length + delims.end.length) {
            const identifier = name.substring(delims.start.length, name.length - delims.end.length);
            const keySpan = createKeySpan(srcSpan, delims.start, identifier);
            if (delims.start === BINDING_DELIMS.BANANA_BOX.start) {
                this.bindingParser.parsePropertyBinding(identifier, value, false, srcSpan, absoluteOffset, attribute.valueSpan, matchableAttributes, parsedProperties, keySpan);
                this.parseAssignmentEvent(identifier, value, srcSpan, attribute.valueSpan, matchableAttributes, boundEvents, keySpan);
            }
            else if (delims.start === BINDING_DELIMS.PROPERTY.start) {
                this.bindingParser.parsePropertyBinding(identifier, value, false, srcSpan, absoluteOffset, attribute.valueSpan, matchableAttributes, parsedProperties, keySpan);
            }
            else {
                const events = [];
                this.bindingParser.parseEvent(identifier, value, srcSpan, attribute.valueSpan || srcSpan, matchableAttributes, events, keySpan);
                addEvents(events, boundEvents);
            }
            return true;
        }
        // No explicit binding found.
        const keySpan = createKeySpan(srcSpan, '' /* prefix */, name);
        const hasBinding = this.bindingParser.parsePropertyInterpolation(name, value, srcSpan, attribute.valueSpan, matchableAttributes, parsedProperties, keySpan);
        return hasBinding;
    }
    _visitTextWithInterpolation(value, sourceSpan, i18n) {
        const valueNoNgsp = replaceNgsp(value);
        const expr = this.bindingParser.parseInterpolation(valueNoNgsp, sourceSpan);
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
        else if (references.some(reference => reference.name === identifier)) {
            this.reportError(`Reference "#${identifier}" is defined more than once`, sourceSpan);
        }
        references.push(new t.Reference(identifier, value, sourceSpan, keySpan, valueSpan));
    }
    parseAssignmentEvent(name, expression, sourceSpan, valueSpan, targetMatchableAttrs, boundEvents, keySpan) {
        const events = [];
        this.bindingParser.parseEvent(`${name}Change`, `${expression}=$event`, sourceSpan, valueSpan || sourceSpan, targetMatchableAttrs, events, keySpan);
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
        /* inputs */ [], /* outputs */ [], children, /* references */ [], ast.sourceSpan, ast.startSourceSpan, ast.endSourceSpan);
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
}
const NON_BINDABLE_VISITOR = new NonBindableVisitor();
function normalizeAttributeName(attrName) {
    return /^data-/i.test(attrName) ? attrName.substring(5) : attrName;
}
function addEvents(events, boundEvents) {
    boundEvents.push(...events.map(e => t.BoundEvent.fromParsedEvent(e)));
}
function isEmptyTextNode(node) {
    return node instanceof html.Text && node.value.trim().length == 0;
}
function isCommentNode(node) {
    return node instanceof html.Comment;
}
function textContents(node) {
    if (node.children.length !== 1 || !(node.children[0] instanceof html.Text)) {
        return null;
    }
    else {
        return node.children[0].value;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicjNfdGVtcGxhdGVfdHJhbnNmb3JtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3JlbmRlcjMvcjNfdGVtcGxhdGVfdHJhbnNmb3JtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUlILE9BQU8sS0FBSyxJQUFJLE1BQU0sa0JBQWtCLENBQUM7QUFDekMsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLCtCQUErQixDQUFDO0FBQzFELE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUMvQyxPQUFPLEVBQUMsVUFBVSxFQUFFLGVBQWUsRUFBRSxlQUFlLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDM0UsT0FBTyxFQUFDLG9CQUFvQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFFM0QsT0FBTyxFQUFDLG9CQUFvQixFQUFFLGVBQWUsRUFBQyxNQUFNLHVDQUF1QyxDQUFDO0FBRTVGLE9BQU8sS0FBSyxDQUFDLE1BQU0sVUFBVSxDQUFDO0FBQzlCLE9BQU8sRUFBQyxtQkFBbUIsRUFBRSxjQUFjLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUVyRSxNQUFNLGdCQUFnQixHQUFHLHVEQUF1RCxDQUFDO0FBRWpGLG9CQUFvQjtBQUNwQixNQUFNLFdBQVcsR0FBRyxDQUFDLENBQUM7QUFDdEIsbUJBQW1CO0FBQ25CLE1BQU0sVUFBVSxHQUFHLENBQUMsQ0FBQztBQUNyQixxQkFBcUI7QUFDckIsTUFBTSxVQUFVLEdBQUcsQ0FBQyxDQUFDO0FBQ3JCLGtCQUFrQjtBQUNsQixNQUFNLFNBQVMsR0FBRyxDQUFDLENBQUM7QUFDcEIsc0JBQXNCO0FBQ3RCLE1BQU0sYUFBYSxHQUFHLENBQUMsQ0FBQztBQUN4QixnQkFBZ0I7QUFDaEIsTUFBTSxTQUFTLEdBQUcsQ0FBQyxDQUFDO0FBQ3BCLG9GQUFvRjtBQUNwRixNQUFNLFlBQVksR0FBRyxD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Q3RDLENBQUM7QUFFRCxTQUFTLFlBQVksQ0FBQyxJQUFrQjtJQUN0QyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsWUFBWSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFDMUUsT0FBTyxJQUFJLENBQUM7S0FDYjtTQUFNO1FBQ0wsT0FBUSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBZSxDQUFDLEtBQUssQ0FBQztLQUM5QztBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtQYXJzZWRFdmVudCwgUGFyc2VkUHJvcGVydHksIFBhcnNlZFZhcmlhYmxlfSBmcm9tICcuLi9leHByZXNzaW9uX3BhcnNlci9hc3QnO1xuaW1wb3J0ICogYXMgaTE4biBmcm9tICcuLi9pMThuL2kxOG5fYXN0JztcbmltcG9ydCAqIGFzIGh0bWwgZnJvbSAnLi4vbWxfcGFyc2VyL2FzdCc7XG5pbXBvcnQge3JlcGxhY2VOZ3NwfSBmcm9tICcuLi9tbF9wYXJzZXIvaHRtbF93aGl0ZXNwYWNlcyc7XG5pbXBvcnQge2lzTmdUZW1wbGF0ZX0gZnJvbSAnLi4vbWxfcGFyc2VyL3RhZ3MnO1xuaW1wb3J0IHtQYXJzZUVycm9yLCBQYXJzZUVycm9yTGV2ZWwsIFBhcnNlU291cmNlU3Bhbn0gZnJvbSAnLi4vcGFyc2VfdXRpbCc7XG5pbXBvcnQge2lzU3R5bGVVcmxSZXNvbHZhYmxlfSBmcm9tICcuLi9zdHlsZV91cmxfcmVzb2x2ZXInO1xuaW1wb3J0IHtCaW5kaW5nUGFyc2VyfSBmcm9tICcuLi90ZW1wbGF0ZV9wYXJzZXIvYmluZGluZ19wYXJzZXInO1xuaW1wb3J0IHtQcmVwYXJzZWRFbGVtZW50VHlwZSwgcHJlcGFyc2VFbGVtZW50fSBmcm9tICcuLi90ZW1wbGF0ZV9wYXJzZXIvdGVtcGxhdGVfcHJlcGFyc2VyJztcblxuaW1wb3J0ICogYXMgdCBmcm9tICcuL3IzX2FzdCc7XG5pbXBvcnQge0kxOE5fSUNVX1ZBUl9QUkVGSVgsIGlzSTE4blJvb3ROb2RlfSBmcm9tICcuL3ZpZXcvaTE4bi91dGlsJztcblxuY29uc3QgQklORF9OQU1FX1JFR0VYUCA9IC9eKD86KGJpbmQtKXwobGV0LSl8KHJlZi18Iyl8KG9uLSl8KGJpbmRvbi0pfChAKSkoLiopJC87XG5cbi8vIEdyb3VwIDEgPSBcImJpbmQtXCJcbmNvbnN0IEtXX0JJTkRfSURYID0gMTtcbi8vIEdyb3VwIDIgPSBcImxldC1cIlxuY29uc3QgS1dfTEVUX0lEWCA9IDI7XG4vLyBHcm91cCAzID0gXCJyZWYtLyNcIlxuY29uc3QgS1dfUkVGX0lEWCA9IDM7XG4vLyBHcm91cCA0ID0gXCJvbi1cIlxuY29uc3QgS1dfT05fSURYID0gNDtcbi8vIEdyb3VwIDUgPSBcImJpbmRvbi1cIlxuY29uc3QgS1dfQklORE9OX0lEWCA9IDU7XG4vLyBHcm91cCA2ID0gXCJAXCJcbmNvbnN0IEtXX0FUX0lEWCA9IDY7XG4vLyBHcm91cCA3ID0gdGhlIGlkZW50aWZpZXIgYWZ0ZXIgXCJiaW5kLVwiLCBcImxldC1cIiwgXCJyZWYtLyNcIiwgXCJvbi1cIiwgXCJiaW5kb24tXCIgb3IgXCJAXCJcbmNvbnN0IElERU5UX0tXX0lEWCA9IDc7XG5cbmNvbnN0IEJJTkRJTkdfREVMSU1TID0ge1xuICBCQU5BTkFfQk9YOiB7c3RhcnQ6ICdbKCcsIGVuZDogJyldJ30sXG4gIFBST1BFUlRZOiB7c3RhcnQ6ICdbJywgZW5kOiAnXSd9LFxuICBFVkVOVDoge3N0YXJ0OiAnKCcsIGVuZDogJyknfSxcbn07XG5cbmNvbnN0IFRFTVBMQVRFX0FUVFJfUFJFRklYID0gJyonO1xuXG4vLyBSZXN1bHQgb2YgdGhlIGh0bWwgQVNUIHRvIEl2eSBBU1QgdHJhbnNmb3JtYXRpb25cbmV4cG9ydCBpbnRlcmZhY2UgUmVuZGVyM1BhcnNlUmVzdWx0IHtcbiAgbm9kZXM6IHQuTm9kZVtdO1xuICBlcnJvcnM6IFBhcnNlRXJyb3JbXTtcbiAgc3R5bGVzOiBzdHJpbmdbXTtcbiAgc3R5bGVVcmxzOiBzdHJpbmdbXTtcbiAgbmdDb250ZW50U2VsZWN0b3JzOiBzdHJpbmdbXTtcbiAgLy8gV2lsbCBiZSBkZWZpbmVkIGlmIGBSZW5kZXIzUGFyc2VPcHRpb25zWydjb2xsZWN0Q29tbWVudE5vZGVzJ11gIGlzIHRydWVcbiAgY29tbWVudE5vZGVzPzogdC5Db21tZW50W107XG59XG5cbmludGVyZmFjZSBSZW5kZXIzUGFyc2VPcHRpb25zIHtcbiAgY29sbGVjdENvbW1lbnROb2RlczogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGh0bWxBc3RUb1JlbmRlcjNBc3QoXG4gICAgaHRtbE5vZGVzOiBodG1sLk5vZGVbXSwgYmluZGluZ1BhcnNlcjogQmluZGluZ1BhcnNlcixcbiAgICBvcHRpb25zOiBSZW5kZXIzUGFyc2VPcHRpb25zKTogUmVuZGVyM1BhcnNlUmVzdWx0IHtcbiAgY29uc3QgdHJhbnNmb3JtZXIgPSBuZXcgSHRtbEFzdFRvSXZ5QXN0KGJpbmRpbmdQYXJzZXIsIG9wdGlvbnMpO1xuICBjb25zdCBpdnlOb2RlcyA9IGh0bWwudmlzaXRBbGwodHJhbnNmb3JtZXIsIGh0bWxOb2Rlcyk7XG5cbiAgLy8gRXJyb3JzIG1pZ2h0IG9yaWdpbmF0ZSBpbiBlaXRoZXIgdGhlIGJpbmRpbmcgcGFyc2VyIG9yIHRoZSBodG1sIHRvIGl2eSB0cmFuc2Zvcm1lclxuICBjb25zdCBhbGxFcnJvcnMgPSBiaW5kaW5nUGFyc2VyLmVycm9ycy5jb25jYXQodHJhbnNmb3JtZXIuZXJyb3JzKTtcblxuICBjb25zdCByZXN1bHQ6IFJlbmRlcjNQYXJzZVJlc3VsdCA9IHtcbiAgICBub2RlczogaXZ5Tm9kZXMsXG4gICAgZXJyb3JzOiBhbGxFcnJvcnMsXG4gICAgc3R5bGVVcmxzOiB0cmFuc2Zvcm1lci5zdHlsZVVybHMsXG4gICAgc3R5bGVzOiB0cmFuc2Zvcm1lci5zdHlsZXMsXG4gICAgbmdDb250ZW50U2VsZWN0b3JzOiB0cmFuc2Zvcm1lci5uZ0NvbnRlbnRTZWxlY3RvcnNcbiAgfTtcbiAgaWYgKG9wdGlvbnMuY29sbGVjdENvbW1lbnROb2Rlcykge1xuICAgIHJlc3VsdC5jb21tZW50Tm9kZXMgPSB0cmFuc2Zvcm1lci5jb21tZW50Tm9kZXM7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuY2xhc3MgSHRtbEFzdFRvSXZ5QXN0IGltcGxlbWVudHMgaHRtbC5WaXNpdG9yIHtcbiAgZXJyb3JzOiBQYXJzZUVycm9yW10gPSBbXTtcbiAgc3R5bGVzOiBzdHJpbmdbXSA9IFtdO1xuICBzdHlsZVVybHM6IHN0cmluZ1tdID0gW107XG4gIG5nQ29udGVudFNlbGVjdG9yczogc3RyaW5nW10gPSBbXTtcbiAgLy8gVGhpcyBhcnJheSB3aWxsIGJlIHBvcHVsYXRlZCBpZiBgUmVuZGVyM1BhcnNlT3B0aW9uc1snY29sbGVjdENvbW1lbnROb2RlcyddYCBpcyB0cnVlXG4gIGNvbW1lbnROb2RlczogdC5Db21tZW50W10gPSBbXTtcbiAgcHJpdmF0ZSBpbkkxOG5CbG9jazogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgYmluZGluZ1BhcnNlcjogQmluZGluZ1BhcnNlciwgcHJpdmF0ZSBvcHRpb25zOiBSZW5kZXIzUGFyc2VPcHRpb25zKSB7fVxuXG4gIC8vIEhUTUwgdmlzaXRvclxuICB2aXNpdEVsZW1lbnQoZWxlbWVudDogaHRtbC5FbGVtZW50KTogdC5Ob2RlfG51bGwge1xuICAgIGNvbnN0IGlzSTE4blJvb3RFbGVtZW50ID0gaXNJMThuUm9vdE5vZGUoZWxlbWVudC5pMThuKTtcbiAgICBpZiAoaXNJMThuUm9vdEVsZW1lbnQpIHtcbiAgICAgIGlmICh0aGlzLmluSTE4bkJsb2NrKSB7XG4gICAgICAgIHRoaXMucmVwb3J0RXJyb3IoXG4gICAgICAgICAgICAnQ2Fubm90IG1hcmsgYW4gZWxlbWVudCBhcyB0cmFuc2xhdGFibGUgaW5zaWRlIG9mIGEgdHJhbnNsYXRhYmxlIHNlY3Rpb24uIFBsZWFzZSByZW1vdmUgdGhlIG5lc3RlZCBpMThuIG1hcmtlci4nLFxuICAgICAgICAgICAgZWxlbWVudC5zb3VyY2VTcGFuKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuaW5JMThuQmxvY2sgPSB0cnVlO1xuICAgIH1cbiAgICBjb25zdCBwcmVwYXJzZWRFbGVtZW50ID0gcHJlcGFyc2VFbGVtZW50KGVsZW1lbnQpO1xuICAgIGlmIChwcmVwYXJzZWRFbGVtZW50LnR5cGUgPT09IFByZXBhcnNlZEVsZW1lbnRUeXBlLlNDUklQVCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSBlbHNlIGlmIChwcmVwYXJzZWRFbGVtZW50LnR5cGUgPT09IFByZXBhcnNlZEVsZW1lbnRUeXBlLlNUWUxFKSB7XG4gICAgICBjb25zdCBjb250ZW50cyA9IHRleHRDb250ZW50cyhlbGVtZW50KTtcbiAgICAgIGlmIChjb250ZW50cyAhPT0gbnVsbCkge1xuICAgICAgICB0aGlzLnN0eWxlcy5wdXNoKGNvbnRlbnRzKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICAgIHByZXBhcnNlZEVsZW1lbnQudHlwZSA9PT0gUHJlcGFyc2VkRWxlbWVudFR5cGUuU1RZTEVTSEVFVCAmJlxuICAgICAgICBpc1N0eWxlVXJsUmVzb2x2YWJsZShwcmVwYXJzZWRFbGVtZW50LmhyZWZBdHRyKSkge1xuICAgICAgdGhpcy5zdHlsZVVybHMucHVzaChwcmVwYXJzZWRFbGVtZW50LmhyZWZBdHRyKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8vIFdoZXRoZXIgdGhlIGVsZW1lbnQgaXMgYSBgPG5nLXRlbXBsYXRlPmBcbiAgICBjb25zdCBpc1RlbXBsYXRlRWxlbWVudCA9IGlzTmdUZW1wbGF0ZShlbGVtZW50Lm5hbWUpO1xuXG4gICAgY29uc3QgcGFyc2VkUHJvcGVydGllczogUGFyc2VkUHJvcGVydHlbXSA9IFtdO1xuICAgIGNvbnN0IGJvdW5kRXZlbnRzOiB0LkJvdW5kRXZlbnRbXSA9IFtdO1xuICAgIGNvbnN0IHZhcmlhYmxlczogdC5WYXJpYWJsZVtdID0gW107XG4gICAgY29uc3QgcmVmZXJlbmNlczogdC5SZWZlcmVuY2VbXSA9IFtdO1xuICAgIGNvbnN0IGF0dHJpYnV0ZXM6IHQuVGV4dEF0dHJpYnV0ZVtdID0gW107XG4gICAgY29uc3QgaTE4bkF0dHJzTWV0YToge1trZXk6IHN0cmluZ106IGkxOG4uSTE4bk1ldGF9ID0ge307XG5cbiAgICBjb25zdCB0ZW1wbGF0ZVBhcnNlZFByb3BlcnRpZXM6IFBhcnNlZFByb3BlcnR5W10gPSBbXTtcbiAgICBjb25zdCB0ZW1wbGF0ZVZhcmlhYmxlczogdC5WYXJpYWJsZVtdID0gW107XG5cbiAgICAvLyBXaGV0aGVyIHRoZSBlbGVtZW50IGhhcyBhbnkgKi1hdHRyaWJ1dGVcbiAgICBsZXQgZWxlbWVudEhhc0lubGluZVRlbXBsYXRlID0gZmFsc2U7XG5cbiAgICBmb3IgKGNvbnN0IGF0dHJpYnV0ZSBvZiBlbGVtZW50LmF0dHJzKSB7XG4gICAgICBsZXQgaGFzQmluZGluZyA9IGZhbHNlO1xuICAgICAgY29uc3Qgbm9ybWFsaXplZE5hbWUgPSBub3JtYWxpemVBdHRyaWJ1dGVOYW1lKGF0dHJpYnV0ZS5uYW1lKTtcblxuICAgICAgLy8gYCphdHRyYCBkZWZpbmVzIHRlbXBsYXRlIGJpbmRpbmdzXG4gICAgICBsZXQgaXNUZW1wbGF0ZUJpbmRpbmcgPSBmYWxzZTtcblxuICAgICAgaWYgKGF0dHJpYnV0ZS5pMThuKSB7XG4gICAgICAgIGkxOG5BdHRyc01ldGFbYXR0cmlidXRlLm5hbWVdID0gYXR0cmlidXRlLmkxOG47XG4gICAgICB9XG5cbiAgICAgIGlmIChub3JtYWxpemVkTmFtZS5zdGFydHNXaXRoKFRFTVBMQVRFX0FUVFJfUFJFRklYKSkge1xuICAgICAgICAvLyAqLWF0dHJpYnV0ZXNcbiAgICAgICAgaWYgKGVsZW1lbnRIYXNJbmxpbmVUZW1wbGF0ZSkge1xuICAgICAgICAgIHRoaXMucmVwb3J0RXJyb3IoXG4gICAgICAgICAgICAgIGBDYW4ndCBoYXZlIG11bHRpcGxlIHRlbXBsYXRlIGJpbmRpbmdzIG9uIG9uZSBlbGVtZW50LiBVc2Ugb25seSBvbmUgYXR0cmlidXRlIHByZWZpeGVkIHdpdGggKmAsXG4gICAgICAgICAgICAgIGF0dHJpYnV0ZS5zb3VyY2VTcGFuKTtcbiAgICAgICAgfVxuICAgICAgICBpc1RlbXBsYXRlQmluZGluZyA9IHRydWU7XG4gICAgICAgIGVsZW1lbnRIYXNJbmxpbmVUZW1wbGF0ZSA9IHRydWU7XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlVmFsdWUgPSBhdHRyaWJ1dGUudmFsdWU7XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlS2V5ID0gbm9ybWFsaXplZE5hbWUuc3Vic3RyaW5nKFRFTVBMQVRFX0FUVFJfUFJFRklYLmxlbmd0aCk7XG5cbiAgICAgICAgY29uc3QgcGFyc2VkVmFyaWFibGVzOiBQYXJzZWRWYXJpYWJsZVtdID0gW107XG4gICAgICAgIGNvbnN0IGFic29sdXRlVmFsdWVPZmZzZXQgPSBhdHRyaWJ1dGUudmFsdWVTcGFuID9cbiAgICAgICAgICAgIGF0dHJpYnV0ZS52YWx1ZVNwYW4uc3RhcnQub2Zmc2V0IDpcbiAgICAgICAgICAgIC8vIElmIHRoZXJlIGlzIG5vIHZhbHVlIHNwYW4gdGhlIGF0dHJpYnV0ZSBkb2VzIG5vdCBoYXZlIGEgdmFsdWUsIGxpa2UgYGF0dHJgIGluXG4gICAgICAgICAgICAvL2A8ZGl2IGF0dHI+PC9kaXY+YC4gSW4gdGhpcyBjYXNlLCBwb2ludCB0byBvbmUgY2hhcmFjdGVyIGJleW9uZCB0aGUgbGFzdCBjaGFyYWN0ZXIgb2ZcbiAgICAgICAgICAgIC8vIHRoZSBhdHRyaWJ1dGUgbmFtZS5cbiAgICAgICAgICAgIGF0dHJpYnV0ZS5zb3VyY2VTcGFuLnN0YXJ0Lm9mZnNldCArIGF0dHJpYnV0ZS5uYW1lLmxlbmd0aDtcblxuICAgICAgICB0aGlzLmJpbmRpbmdQYXJzZXIucGFyc2VJbmxpbmVUZW1wbGF0ZUJpbmRpbmcoXG4gICAgICAgICAgICB0ZW1wbGF0ZUtleSwgdGVtcGxhdGVWYWx1ZSwgYXR0cmlidXRlLnNvdXJjZVNwYW4sIGFic29sdXRlVmFsdWVPZmZzZXQsIFtdLFxuICAgICAgICAgICAgdGVtcGxhdGVQYXJzZWRQcm9wZXJ0aWVzLCBwYXJzZWRWYXJpYWJsZXMsIHRydWUgLyogaXNJdnlBc3QgKi8pO1xuICAgICAgICB0ZW1wbGF0ZVZhcmlhYmxlcy5wdXNoKC4uLnBhcnNlZFZhcmlhYmxlcy5tYXAoXG4gICAgICAgICAgICB2ID0+IG5ldyB0LlZhcmlhYmxlKHYubmFtZSwgdi52YWx1ZSwgdi5zb3VyY2VTcGFuLCB2LmtleVNwYW4sIHYudmFsdWVTcGFuKSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQ2hlY2sgZm9yIHZhcmlhYmxlcywgZXZlbnRzLCBwcm9wZXJ0eSBiaW5kaW5ncywgaW50ZXJwb2xhdGlvblxuICAgICAgICBoYXNCaW5kaW5nID0gdGhpcy5wYXJzZUF0dHJpYnV0ZShcbiAgICAgICAgICAgIGlzVGVtcGxhdGVFbGVtZW50LCBhdHRyaWJ1dGUsIFtdLCBwYXJzZWRQcm9wZXJ0aWVzLCBib3VuZEV2ZW50cywgdmFyaWFibGVzLCByZWZlcmVuY2VzKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFoYXNCaW5kaW5nICYmICFpc1RlbXBsYXRlQmluZGluZykge1xuICAgICAgICAvLyBkb24ndCBpbmNsdWRlIHRoZSBiaW5kaW5ncyBhcyBhdHRyaWJ1dGVzIGFzIHdlbGwgaW4gdGhlIEFTVFxuICAgICAgICBhdHRyaWJ1dGVzLnB1c2godGhpcy52aXNpdEF0dHJpYnV0ZShhdHRyaWJ1dGUpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBjaGlsZHJlbjogdC5Ob2RlW10gPVxuICAgICAgICBodG1sLnZpc2l0QWxsKHByZXBhcnNlZEVsZW1lbnQubm9uQmluZGFibGUgPyBOT05fQklOREFCTEVfVklTSVRPUiA6IHRoaXMsIGVsZW1lbnQuY2hpbGRyZW4pO1xuXG4gICAgbGV0IHBhcnNlZEVsZW1lbnQ6IHQuTm9kZXx1bmRlZmluZWQ7XG4gICAgaWYgKHByZXBhcnNlZEVsZW1lbnQudHlwZSA9PT0gUHJlcGFyc2VkRWxlbWVudFR5cGUuTkdfQ09OVEVOVCkge1xuICAgICAgLy8gYDxuZy1jb250ZW50PmBcbiAgICAgIGlmIChlbGVtZW50LmNoaWxkcmVuICYmXG4gICAgICAgICAgIWVsZW1lbnQuY2hpbGRyZW4uZXZlcnkoXG4gICAgICAgICAgICAgIChub2RlOiBodG1sLk5vZGUpID0+IGlzRW1wdHlUZXh0Tm9kZShub2RlKSB8fCBpc0NvbW1lbnROb2RlKG5vZGUpKSkge1xuICAgICAgICB0aGlzLnJlcG9ydEVycm9yKGA8bmctY29udGVudD4gZWxlbWVudCBjYW5ub3QgaGF2ZSBjb250ZW50LmAsIGVsZW1lbnQuc291cmNlU3Bhbik7XG4gICAgICB9XG4gICAgICBjb25zdCBzZWxlY3RvciA9IHByZXBhcnNlZEVsZW1lbnQuc2VsZWN0QXR0cjtcbiAgICAgIGNvbnN0IGF0dHJzOiB0LlRleHRBdHRyaWJ1dGVbXSA9IGVsZW1lbnQuYXR0cnMubWFwKGF0dHIgPT4gdGhpcy52aXNpdEF0dHJpYnV0ZShhdHRyKSk7XG4gICAgICBwYXJzZWRFbGVtZW50ID0gbmV3IHQuQ29udGVudChzZWxlY3RvciwgYXR0cnMsIGVsZW1lbnQuc291cmNlU3BhbiwgZWxlbWVudC5pMThuKTtcblxuICAgICAgdGhpcy5uZ0NvbnRlbnRTZWxlY3RvcnMucHVzaChzZWxlY3Rvcik7XG4gICAgfSBlbHNlIGlmIChpc1RlbXBsYXRlRWxlbWVudCkge1xuICAgICAgLy8gYDxuZy10ZW1wbGF0ZT5gXG4gICAgICBjb25zdCBhdHRycyA9IHRoaXMuZXh0cmFjdEF0dHJpYnV0ZXMoZWxlbWVudC5uYW1lLCBwYXJzZWRQcm9wZXJ0aWVzLCBpMThuQXR0cnNNZXRhKTtcblxuICAgICAgcGFyc2VkRWxlbWVudCA9IG5ldyB0LlRlbXBsYXRlKFxuICAgICAgICAgIGVsZW1lbnQubmFtZSwgYXR0cmlidXRlcywgYXR0cnMuYm91bmQsIGJvdW5kRXZlbnRzLCBbLyogbm8gdGVtcGxhdGUgYXR0cmlidXRlcyAqL10sXG4gICAgICAgICAgY2hpbGRyZW4sIHJlZmVyZW5jZXMsIHZhcmlhYmxlcywgZWxlbWVudC5zb3VyY2VTcGFuLCBlbGVtZW50LnN0YXJ0U291cmNlU3BhbixcbiAgICAgICAgICBlbGVtZW50LmVuZFNvdXJjZVNwYW4sIGVsZW1lbnQuaTE4bik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGF0dHJzID0gdGhpcy5leHRyYWN0QXR0cmlidXRlcyhlbGVtZW50Lm5hbWUsIHBhcnNlZFByb3BlcnRpZXMsIGkxOG5BdHRyc01ldGEpO1xuICAgICAgcGFyc2VkRWxlbWVudCA9IG5ldyB0LkVsZW1lbnQoXG4gICAgICAgICAgZWxlbWVudC5uYW1lLCBhdHRyaWJ1dGVzLCBhdHRycy5ib3VuZCwgYm91bmRFdmVudHMsIGNoaWxkcmVuLCByZWZlcmVuY2VzLFxuICAgICAgICAgIGVsZW1lbnQuc291cmNlU3BhbiwgZWxlbWVudC5zdGFydFNvdXJjZVNwYW4sIGVsZW1lbnQuZW5kU291cmNlU3BhbiwgZWxlbWVudC5pMThuKTtcbiAgICB9XG5cbiAgICBpZiAoZWxlbWVudEhhc0lubGluZVRlbXBsYXRlKSB7XG4gICAgICAvLyBJZiB0aGlzIG5vZGUgaXMgYW4gaW5saW5lLXRlbXBsYXRlIChlLmcuIGhhcyAqbmdGb3IpIHRoZW4gd2UgbmVlZCB0byBjcmVhdGUgYSB0ZW1wbGF0ZVxuICAgICAgLy8gbm9kZSB0aGF0IGNvbnRhaW5zIHRoaXMgbm9kZS5cbiAgICAgIC8vIE1vcmVvdmVyLCBpZiB0aGUgbm9kZSBpcyBhbiBlbGVtZW50LCB0aGVuIHdlIG5lZWQgdG8gaG9pc3QgaXRzIGF0dHJpYnV0ZXMgdG8gdGhlIHRlbXBsYXRlXG4gICAgICAvLyBub2RlIGZvciBtYXRjaGluZyBhZ2FpbnN0IGNvbnRlbnQgcHJvamVjdGlvbiBzZWxlY3RvcnMuXG4gICAgICBjb25zdCBhdHRycyA9IHRoaXMuZXh0cmFjdEF0dHJpYnV0ZXMoJ25nLXRlbXBsYXRlJywgdGVtcGxhdGVQYXJzZWRQcm9wZXJ0aWVzLCBpMThuQXR0cnNNZXRhKTtcbiAgICAgIGNvbnN0IHRlbXBsYXRlQXR0cnM6ICh0LlRleHRBdHRyaWJ1dGV8dC5Cb3VuZEF0dHJpYnV0ZSlbXSA9IFtdO1xuICAgICAgYXR0cnMubGl0ZXJhbC5mb3JFYWNoKGF0dHIgPT4gdGVtcGxhdGVBdHRycy5wdXNoKGF0dHIpKTtcbiAgICAgIGF0dHJzLmJvdW5kLmZvckVhY2goYXR0ciA9PiB0ZW1wbGF0ZUF0dHJzLnB1c2goYXR0cikpO1xuICAgICAgY29uc3QgaG9pc3RlZEF0dHJzID0gcGFyc2VkRWxlbWVudCBpbnN0YW5jZW9mIHQuRWxlbWVudCA/XG4gICAgICAgICAge1xuICAgICAgICAgICAgYXR0cmlidXRlczogcGFyc2VkRWxlbWVudC5hdHRyaWJ1dGVzLFxuICAgICAgICAgICAgaW5wdXRzOiBwYXJzZWRFbGVtZW50LmlucHV0cyxcbiAgICAgICAgICAgIG91dHB1dHM6IHBhcnNlZEVsZW1lbnQub3V0cHV0cyxcbiAgICAgICAgICB9IDpcbiAgICAgICAgICB7YXR0cmlidXRlczogW10sIGlucHV0czogW10sIG91dHB1dHM6IFtdfTtcblxuICAgICAgLy8gRm9yIDxuZy10ZW1wbGF0ZT5zIHdpdGggc3RydWN0dXJhbCBkaXJlY3RpdmVzIG9uIHRoZW0sIGF2b2lkIHBhc3NpbmcgaTE4biBpbmZvcm1hdGlvbiB0b1xuICAgICAgLy8gdGhlIHdyYXBwaW5nIHRlbXBsYXRlIHRvIHByZXZlbnQgdW5uZWNlc3NhcnkgaTE4biBpbnN0cnVjdGlvbnMgZnJvbSBiZWluZyBnZW5lcmF0ZWQuIFRoZVxuICAgICAgLy8gbmVjZXNzYXJ5IGkxOG4gbWV0YSBpbmZvcm1hdGlvbiB3aWxsIGJlIGV4dHJhY3RlZCBmcm9tIGNoaWxkIGVsZW1lbnRzLlxuICAgICAgY29uc3QgaTE4biA9IGlzVGVtcGxhdGVFbGVtZW50ICYmIGlzSTE4blJvb3RFbGVtZW50ID8gdW5kZWZpbmVkIDogZWxlbWVudC5pMThuO1xuXG4gICAgICAvLyBUT0RPKHBrKTogdGVzdCBmb3IgdGhpcyBjYXNlXG4gICAgICBwYXJzZWRFbGVtZW50ID0gbmV3IHQuVGVtcGxhdGUoXG4gICAgICAgICAgKHBhcnNlZEVsZW1lbnQgYXMgdC5FbGVtZW50IHwgdC5Db250ZW50KS5uYW1lLCBob2lzdGVkQXR0cnMuYXR0cmlidXRlcyxcbiAgICAgICAgICBob2lzdGVkQXR0cnMuaW5wdXRzLCBob2lzdGVkQXR0cnMub3V0cHV0cywgdGVtcGxhdGVBdHRycywgW3BhcnNlZEVsZW1lbnRdLFxuICAgICAgICAgIFsvKiBubyByZWZlcmVuY2VzICovXSwgdGVtcGxhdGVWYXJpYWJsZXMsIGVsZW1lbnQuc291cmNlU3BhbiwgZWxlbWVudC5zdGFydFNvdXJjZVNwYW4sXG4gICAgICAgICAgZWxlbWVudC5lbmRTb3VyY2VTcGFuLCBpMThuKTtcbiAgICB9XG4gICAgaWYgKGlzSTE4blJvb3RFbGVtZW50KSB7XG4gICAgICB0aGlzLmluSTE4bkJsb2NrID0gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBwYXJzZWRFbGVtZW50O1xuICB9XG5cbiAgdmlzaXRBdHRyaWJ1dGUoYXR0cmlidXRlOiBodG1sLkF0dHJpYnV0ZSk6IHQuVGV4dEF0dHJpYnV0ZSB7XG4gICAgcmV0dXJuIG5ldyB0LlRleHRBdHRyaWJ1dGUoXG4gICAgICAgIGF0dHJpYnV0ZS5uYW1lLCBhdHRyaWJ1dGUudmFsdWUsIGF0dHJpYnV0ZS5zb3VyY2VTcGFuLCBhdHRyaWJ1dGUua2V5U3BhbixcbiAgICAgICAgYXR0cmlidXRlLnZhbHVlU3BhbiwgYXR0cmlidXRlLmkxOG4pO1xuICB9XG5cbiAgdmlzaXRUZXh0KHRleHQ6IGh0bWwuVGV4dCk6IHQuTm9kZSB7XG4gICAgcmV0dXJuIHRoaXMuX3Zpc2l0VGV4dFdpdGhJbnRlcnBvbGF0aW9uKHRleHQudmFsdWUsIHRleHQuc291cmNlU3BhbiwgdGV4dC5pMThuKTtcbiAgfVxuXG4gIHZpc2l0RXhwYW5zaW9uKGV4cGFuc2lvbjogaHRtbC5FeHBhbnNpb24pOiB0LkljdXxudWxsIHtcbiAgICBpZiAoIWV4cGFuc2lvbi5pMThuKSB7XG4gICAgICAvLyBkbyBub3QgZ2VuZXJhdGUgSWN1IGluIGNhc2UgaXQgd2FzIGNyZWF0ZWRcbiAgICAgIC8vIG91dHNpZGUgb2YgaTE4biBibG9jayBpbiBhIHRlbXBsYXRlXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgaWYgKCFpc0kxOG5Sb290Tm9kZShleHBhbnNpb24uaTE4bikpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB0eXBlIFwiJHtleHBhbnNpb24uaTE4bi5jb25zdHJ1Y3Rvcn1cIiBmb3IgXCJpMThuXCIgcHJvcGVydHkgb2YgJHtcbiAgICAgICAgICBleHBhbnNpb24uc291cmNlU3Bhbi50b1N0cmluZygpfS4gRXhwZWN0ZWQgYSBcIk1lc3NhZ2VcImApO1xuICAgIH1cbiAgICBjb25zdCBtZXNzYWdlID0gZXhwYW5zaW9uLmkxOG47XG4gICAgY29uc3QgdmFyczoge1tuYW1lOiBzdHJpbmddOiB0LkJvdW5kVGV4dH0gPSB7fTtcbiAgICBjb25zdCBwbGFjZWhvbGRlcnM6IHtbbmFtZTogc3RyaW5nXTogdC5UZXh0fHQuQm91bmRUZXh0fSA9IHt9O1xuICAgIC8vIGV4dHJhY3QgVkFScyBmcm9tIElDVXMgLSB3ZSBwcm9jZXNzIHRoZW0gc2VwYXJhdGVseSB3aGlsZVxuICAgIC8vIGFzc2VtYmxpbmcgcmVzdWx0aW5nIG1lc3NhZ2UgdmlhIGdvb2cuZ2V0TXNnIGZ1bmN0aW9uLCBzaW5jZVxuICAgIC8vIHdlIG5lZWQgdG8gcGFzcyB0aGVtIHRvIHRvcC1sZXZlbCBnb29nLmdldE1zZyBjYWxsXG4gICAgT2JqZWN0LmtleXMobWVzc2FnZS5wbGFjZWhvbGRlcnMpLmZvckVhY2goa2V5ID0+IHtcbiAgICAgIGNvbnN0IHZhbHVlID0gbWVzc2FnZS5wbGFjZWhvbGRlcnNba2V5XTtcbiAgICAgIGlmIChrZXkuc3RhcnRzV2l0aChJMThOX0lDVV9WQVJfUFJFRklYKSkge1xuICAgICAgICAvLyBDdXJyZW50bHkgd2hlbiB0aGUgYHBsdXJhbGAgb3IgYHNlbGVjdGAga2V5d29yZHMgaW4gYW4gSUNVIGNvbnRhaW4gdHJhaWxpbmcgc3BhY2VzIChlLmcuXG4gICAgICAgIC8vIGB7Y291bnQsIHNlbGVjdCAsIC4uLn1gKSwgdGhlc2Ugc3BhY2VzIGFyZSBhbHNvIGluY2x1ZGVkIGludG8gdGhlIGtleSBuYW1lcyBpbiBJQ1UgdmFyc1xuICAgICAgICAvLyAoZS5nLiBcIlZBUl9TRUxFQ1QgXCIpLiBUaGVzZSB0cmFpbGluZyBzcGFjZXMgYXJlIG5vdCBkZXNpcmFibGUsIHNpbmNlIHRoZXkgd2lsbCBsYXRlciBiZVxuICAgICAgICAvLyBjb252ZXJ0ZWQgaW50byBgX2Agc3ltYm9scyB3aGlsZSBub3JtYWxpemluZyBwbGFjZWhvbGRlciBuYW1lcywgd2hpY2ggbWlnaHQgbGVhZCB0b1xuICAgICAgICAvLyBtaXNtYXRjaGVzIGF0IHJ1bnRpbWUgKGkuZS4gcGxhY2Vob2xkZXIgd2lsbCBub3QgYmUgcmVwbGFjZWQgd2l0aCB0aGUgY29ycmVjdCB2YWx1ZSkuXG4gICAgICAgIGNvbnN0IGZvcm1hdHRlZEtleSA9IGtleS50cmltKCk7XG5cbiAgICAgICAgY29uc3QgYXN0ID0gdGhpcy5iaW5kaW5nUGFyc2VyLnBhcnNlSW50ZXJwb2xhdGlvbkV4cHJlc3Npb24odmFsdWUudGV4dCwgdmFsdWUuc291cmNlU3Bhbik7XG5cbiAgICAgICAgdmFyc1tmb3JtYXR0ZWRLZXldID0gbmV3IHQuQm91bmRUZXh0KGFzdCwgdmFsdWUuc291cmNlU3Bhbik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwbGFjZWhvbGRlcnNba2V5XSA9IHRoaXMuX3Zpc2l0VGV4dFdpdGhJbnRlcnBvbGF0aW9uKHZhbHVlLnRleHQsIHZhbHVlLnNvdXJjZVNwYW4pO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBuZXcgdC5JY3UodmFycywgcGxhY2Vob2xkZXJzLCBleHBhbnNpb24uc291cmNlU3BhbiwgbWVzc2FnZSk7XG4gIH1cblxuICB2aXNpdEV4cGFuc2lvbkNhc2UoZXhwYW5zaW9uQ2FzZTogaHRtbC5FeHBhbnNpb25DYXNlKTogbnVsbCB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICB2aXNpdENvbW1lbnQoY29tbWVudDogaHRtbC5Db21tZW50KTogbnVsbCB7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5jb2xsZWN0Q29tbWVudE5vZGVzKSB7XG4gICAgICB0aGlzLmNvbW1lbnROb2Rlcy5wdXNoKG5ldyB0LkNvbW1lbnQoY29tbWVudC52YWx1ZSB8fCAnJywgY29tbWVudC5zb3VyY2VTcGFuKSk7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLy8gY29udmVydCB2aWV3IGVuZ2luZSBgUGFyc2VkUHJvcGVydHlgIHRvIGEgZm9ybWF0IHN1aXRhYmxlIGZvciBJVllcbiAgcHJpdmF0ZSBleHRyYWN0QXR0cmlidXRlcyhcbiAgICAgIGVsZW1lbnROYW1lOiBzdHJpbmcsIHByb3BlcnRpZXM6IFBhcnNlZFByb3BlcnR5W10sXG4gICAgICBpMThuUHJvcHNNZXRhOiB7W2tleTogc3RyaW5nXTogaTE4bi5JMThuTWV0YX0pOlxuICAgICAge2JvdW5kOiB0LkJvdW5kQXR0cmlidXRlW10sIGxpdGVyYWw6IHQuVGV4dEF0dHJpYnV0ZVtdfSB7XG4gICAgY29uc3QgYm91bmQ6IHQuQm91bmRBdHRyaWJ1dGVbXSA9IFtdO1xuICAgIGNvbnN0IGxpdGVyYWw6IHQuVGV4dEF0dHJpYnV0ZVtdID0gW107XG5cbiAgICBwcm9wZXJ0aWVzLmZvckVhY2gocHJvcCA9PiB7XG4gICAgICBjb25zdCBpMThuID0gaTE4blByb3BzTWV0YVtwcm9wLm5hbWVdO1xuICAgICAgaWYgKHByb3AuaXNMaXRlcmFsKSB7XG4gICAgICAgIGxpdGVyYWwucHVzaChuZXcgdC5UZXh0QXR0cmlidXRlKFxuICAgICAgICAgICAgcHJvcC5uYW1lLCBwcm9wLmV4cHJlc3Npb24uc291cmNlIHx8ICcnLCBwcm9wLnNvdXJjZVNwYW4sIHByb3Aua2V5U3BhbiwgcHJvcC52YWx1ZVNwYW4sXG4gICAgICAgICAgICBpMThuKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBOb3RlIHRoYXQgdmFsaWRhdGlvbiBpcyBza2lwcGVkIGFuZCBwcm9wZXJ0eSBtYXBwaW5nIGlzIGRpc2FibGVkXG4gICAgICAgIC8vIGR1ZSB0byB0aGUgZmFjdCB0aGF0IHdlIG5lZWQgdG8gbWFrZSBzdXJlIGEgZ2l2ZW4gcHJvcCBpcyBub3QgYW5cbiAgICAgICAgLy8gaW5wdXQgb2YgYSBkaXJlY3RpdmUgYW5kIGRpcmVjdGl2ZSBtYXRjaGluZyBoYXBwZW5zIGF0IHJ1bnRpbWUuXG4gICAgICAgIGNvbnN0IGJlcCA9IHRoaXMuYmluZGluZ1BhcnNlci5jcmVhdGVCb3VuZEVsZW1lbnRQcm9wZXJ0eShcbiAgICAgICAgICAgIGVsZW1lbnROYW1lLCBwcm9wLCAvKiBza2lwVmFsaWRhdGlvbiAqLyB0cnVlLCAvKiBtYXBQcm9wZXJ0eU5hbWUgKi8gZmFsc2UpO1xuICAgICAgICBib3VuZC5wdXNoKHQuQm91bmRBdHRyaWJ1dGUuZnJvbUJvdW5kRWxlbWVudFByb3BlcnR5KGJlcCwgaTE4bikpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHtib3VuZCwgbGl0ZXJhbH07XG4gIH1cblxuICBwcml2YXRlIHBhcnNlQXR0cmlidXRlKFxuICAgICAgaXNUZW1wbGF0ZUVsZW1lbnQ6IGJvb2xlYW4sIGF0dHJpYnV0ZTogaHRtbC5BdHRyaWJ1dGUsIG1hdGNoYWJsZUF0dHJpYnV0ZXM6IHN0cmluZ1tdW10sXG4gICAgICBwYXJzZWRQcm9wZXJ0aWVzOiBQYXJzZWRQcm9wZXJ0eVtdLCBib3VuZEV2ZW50czogdC5Cb3VuZEV2ZW50W10sIHZhcmlhYmxlczogdC5WYXJpYWJsZVtdLFxuICAgICAgcmVmZXJlbmNlczogdC5SZWZlcmVuY2VbXSkge1xuICAgIGNvbnN0IG5hbWUgPSBub3JtYWxpemVBdHRyaWJ1dGVOYW1lKGF0dHJpYnV0ZS5uYW1lKTtcbiAgICBjb25zdCB2YWx1ZSA9IGF0dHJpYnV0ZS52YWx1ZTtcbiAgICBjb25zdCBzcmNTcGFuID0gYXR0cmlidXRlLnNvdXJjZVNwYW47XG4gICAgY29uc3QgYWJzb2x1dGVPZmZzZXQgPVxuICAgICAgICBhdHRyaWJ1dGUudmFsdWVTcGFuID8gYXR0cmlidXRlLnZhbHVlU3Bhbi5zdGFydC5vZmZzZXQgOiBzcmNTcGFuLnN0YXJ0Lm9mZnNldDtcblxuICAgIGZ1bmN0aW9uIGNyZWF0ZUtleVNwYW4oc3JjU3BhbjogUGFyc2VTb3VyY2VTcGFuLCBwcmVmaXg6IHN0cmluZywgaWRlbnRpZmllcjogc3RyaW5nKSB7XG4gICAgICAvLyBXZSBuZWVkIHRvIGFkanVzdCB0aGUgc3RhcnQgbG9jYXRpb24gZm9yIHRoZSBrZXlTcGFuIHRvIGFjY291bnQgZm9yIHRoZSByZW1vdmVkICdkYXRhLSdcbiAgICAgIC8vIHByZWZpeCBmcm9tIGBub3JtYWxpemVBdHRyaWJ1dGVOYW1lYC5cbiAgICAgIGNvbnN0IG5vcm1hbGl6YXRpb25BZGp1c3RtZW50ID0gYXR0cmlidXRlLm5hbWUubGVuZ3RoIC0gbmFtZS5sZW5ndGg7XG4gICAgICBjb25zdCBrZXlTcGFuU3RhcnQgPSBzcmNTcGFuLnN0YXJ0Lm1vdmVCeShwcmVmaXgubGVuZ3RoICsgbm9ybWFsaXphdGlvbkFkanVzdG1lbnQpO1xuICAgICAgY29uc3Qga2V5U3BhbkVuZCA9IGtleVNwYW5TdGFydC5tb3ZlQnkoaWRlbnRpZmllci5sZW5ndGgpO1xuICAgICAgcmV0dXJuIG5ldyBQYXJzZVNvdXJjZVNwYW4oa2V5U3BhblN0YXJ0LCBrZXlTcGFuRW5kLCBrZXlTcGFuU3RhcnQsIGlkZW50aWZpZXIpO1xuICAgIH1cblxuICAgIGNvbnN0IGJpbmRQYXJ0cyA9IG5hbWUubWF0Y2goQklORF9OQU1FX1JFR0VYUCk7XG5cbiAgICBpZiAoYmluZFBhcnRzKSB7XG4gICAgICBpZiAoYmluZFBhcnRzW0tXX0JJTkRfSURYXSAhPSBudWxsKSB7XG4gICAgICAgIGNvbnN0IGlkZW50aWZpZXIgPSBiaW5kUGFydHNbSURFTlRfS1dfSURYXTtcbiAgICAgICAgY29uc3Qga2V5U3BhbiA9IGNyZWF0ZUtleVNwYW4oc3JjU3BhbiwgYmluZFBhcnRzW0tXX0JJTkRfSURYXSwgaWRlbnRpZmllcik7XG4gICAgICAgIHRoaXMuYmluZGluZ1BhcnNlci5wYXJzZVByb3BlcnR5QmluZGluZyhcbiAgICAgICAgICAgIGlkZW50aWZpZXIsIHZhbHVlLCBmYWxzZSwgc3JjU3BhbiwgYWJzb2x1dGVPZmZzZXQsIGF0dHJpYnV0ZS52YWx1ZVNwYW4sXG4gICAgICAgICAgICBtYXRjaGFibGVBdHRyaWJ1dGVzLCBwYXJzZWRQcm9wZXJ0aWVzLCBrZXlTcGFuKTtcblxuICAgICAgfSBlbHNlIGlmIChiaW5kUGFydHNbS1dfTEVUX0lEWF0pIHtcbiAgICAgICAgaWYgKGlzVGVtcGxhdGVFbGVtZW50KSB7XG4gICAgICAgICAgY29uc3QgaWRlbnRpZmllciA9IGJpbmRQYXJ0c1tJREVOVF9LV19JRFhdO1xuICAgICAgICAgIGNvbnN0IGtleVNwYW4gPSBjcmVhdGVLZXlTcGFuKHNyY1NwYW4sIGJpbmRQYXJ0c1tLV19MRVRfSURYXSwgaWRlbnRpZmllcik7XG4gICAgICAgICAgdGhpcy5wYXJzZVZhcmlhYmxlKGlkZW50aWZpZXIsIHZhbHVlLCBzcmNTcGFuLCBrZXlTcGFuLCBhdHRyaWJ1dGUudmFsdWVTcGFuLCB2YXJpYWJsZXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMucmVwb3J0RXJyb3IoYFwibGV0LVwiIGlzIG9ubHkgc3VwcG9ydGVkIG9uIG5nLXRlbXBsYXRlIGVsZW1lbnRzLmAsIHNyY1NwYW4pO1xuICAgICAgICB9XG5cbiAgICAgIH0gZWxzZSBpZiAoYmluZFBhcnRzW0tXX1JFRl9JRFhdKSB7XG4gICAgICAgIGNvbnN0IGlkZW50aWZpZXIgPSBiaW5kUGFydHNbSURFTlRfS1dfSURYXTtcbiAgICAgICAgY29uc3Qga2V5U3BhbiA9IGNyZWF0ZUtleVNwYW4oc3JjU3BhbiwgYmluZFBhcnRzW0tXX1JFRl9JRFhdLCBpZGVudGlmaWVyKTtcbiAgICAgICAgdGhpcy5wYXJzZVJlZmVyZW5jZShpZGVudGlmaWVyLCB2YWx1ZSwgc3JjU3Bhbiwga2V5U3BhbiwgYXR0cmlidXRlLnZhbHVlU3BhbiwgcmVmZXJlbmNlcyk7XG4gICAgICB9IGVsc2UgaWYgKGJpbmRQYXJ0c1tLV19PTl9JRFhdKSB7XG4gICAgICAgIGNvbnN0IGV2ZW50czogUGFyc2VkRXZlbnRbXSA9IFtdO1xuICAgICAgICBjb25zdCBpZGVudGlmaWVyID0gYmluZFBhcnRzW0lERU5UX0tXX0lEWF07XG4gICAgICAgIGNvbnN0IGtleVNwYW4gPSBjcmVhdGVLZXlTcGFuKHNyY1NwYW4sIGJpbmRQYXJ0c1tLV19PTl9JRFhdLCBpZGVudGlmaWVyKTtcbiAgICAgICAgdGhpcy5iaW5kaW5nUGFyc2VyLnBhcnNlRXZlbnQoXG4gICAgICAgICAgICBpZGVudGlmaWVyLCB2YWx1ZSwgc3JjU3BhbiwgYXR0cmlidXRlLnZhbHVlU3BhbiB8fCBzcmNTcGFuLCBtYXRjaGFibGVBdHRyaWJ1dGVzLCBldmVudHMsXG4gICAgICAgICAgICBrZXlTcGFuKTtcbiAgICAgICAgYWRkRXZlbnRzKGV2ZW50cywgYm91bmRFdmVudHMpO1xuICAgICAgfSBlbHNlIGlmIChiaW5kUGFydHNbS1dfQklORE9OX0lEWF0pIHtcbiAgICAgICAgY29uc3QgaWRlbnRpZmllciA9IGJpbmRQYXJ0c1tJREVOVF9LV19JRFhdO1xuICAgICAgICBjb25zdCBrZXlTcGFuID0gY3JlYXRlS2V5U3BhbihzcmNTcGFuLCBiaW5kUGFydHNbS1dfQklORE9OX0lEWF0sIGlkZW50aWZpZXIpO1xuICAgICAgICB0aGlzLmJpbmRpbmdQYXJzZXIucGFyc2VQcm9wZXJ0eUJpbmRpbmcoXG4gICAgICAgICAgICBpZGVudGlmaWVyLCB2YWx1ZSwgZmFsc2UsIHNyY1NwYW4sIGFic29sdXRlT2Zmc2V0LCBhdHRyaWJ1dGUudmFsdWVTcGFuLFxuICAgICAgICAgICAgbWF0Y2hhYmxlQXR0cmlidXRlcywgcGFyc2VkUHJvcGVydGllcywga2V5U3Bhbik7XG4gICAgICAgIHRoaXMucGFyc2VBc3NpZ25tZW50RXZlbnQoXG4gICAgICAgICAgICBpZGVudGlmaWVyLCB2YWx1ZSwgc3JjU3BhbiwgYXR0cmlidXRlLnZhbHVlU3BhbiwgbWF0Y2hhYmxlQXR0cmlidXRlcywgYm91bmRFdmVudHMsXG4gICAgICAgICAgICBrZXlTcGFuKTtcbiAgICAgIH0gZWxzZSBpZiAoYmluZFBhcnRzW0tXX0FUX0lEWF0pIHtcbiAgICAgICAgY29uc3Qga2V5U3BhbiA9IGNyZWF0ZUtleVNwYW4oc3JjU3BhbiwgJycsIG5hbWUpO1xuICAgICAgICB0aGlzLmJpbmRpbmdQYXJzZXIucGFyc2VMaXRlcmFsQXR0cihcbiAgICAgICAgICAgIG5hbWUsIHZhbHVlLCBzcmNTcGFuLCBhYnNvbHV0ZU9mZnNldCwgYXR0cmlidXRlLnZhbHVlU3BhbiwgbWF0Y2hhYmxlQXR0cmlidXRlcyxcbiAgICAgICAgICAgIHBhcnNlZFByb3BlcnRpZXMsIGtleVNwYW4pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gV2UgZGlkbid0IHNlZSBhIGt3LXByZWZpeGVkIHByb3BlcnR5IGJpbmRpbmcsIGJ1dCB3ZSBoYXZlIG5vdCB5ZXQgY2hlY2tlZFxuICAgIC8vIGZvciB0aGUgW10vKCkvWygpXSBzeW50YXguXG4gICAgbGV0IGRlbGltczoge3N0YXJ0OiBzdHJpbmcsIGVuZDogc3RyaW5nfXxudWxsID0gbnVsbDtcbiAgICBpZiAobmFtZS5zdGFydHNXaXRoKEJJTkRJTkdfREVMSU1TLkJBTkFOQV9CT1guc3RhcnQpKSB7XG4gICAgICBkZWxpbXMgPSBCSU5ESU5HX0RFTElNUy5CQU5BTkFfQk9YO1xuICAgIH0gZWxzZSBpZiAobmFtZS5zdGFydHNXaXRoKEJJTkRJTkdfREVMSU1TLlBST1BFUlRZLnN0YXJ0KSkge1xuICAgICAgZGVsaW1zID0gQklORElOR19ERUxJTVMuUFJPUEVSVFk7XG4gICAgfSBlbHNlIGlmIChuYW1lLnN0YXJ0c1dpdGgoQklORElOR19ERUxJTVMuRVZFTlQuc3RhcnQpKSB7XG4gICAgICBkZWxpbXMgPSBCSU5ESU5HX0RFTElNUy5FVkVOVDtcbiAgICB9XG4gICAgaWYgKGRlbGltcyAhPT0gbnVsbCAmJlxuICAgICAgICAvLyBOT1RFOiBvbGRlciB2ZXJzaW9ucyBvZiB0aGUgcGFyc2VyIHdvdWxkIG1hdGNoIGEgc3RhcnQvZW5kIGRlbGltaXRlZFxuICAgICAgICAvLyBiaW5kaW5nIGlmZiB0aGUgcHJvcGVydHkgbmFtZSB3YXMgdGVybWluYXRlZCBieSB0aGUgZW5kaW5nIGRlbGltaXRlclxuICAgICAgICAvLyBhbmQgdGhlIGlkZW50aWZpZXIgaW4gdGhlIGJpbmRpbmcgd2FzIG5vbi1lbXB0eS5cbiAgICAgICAgLy8gVE9ETyhheWF6aGFmaXopOiB1cGRhdGUgdGhpcyB0byBoYW5kbGUgbWFsZm9ybWVkIGJpbmRpbmdzLlxuICAgICAgICBuYW1lLmVuZHNXaXRoKGRlbGltcy5lbmQpICYmIG5hbWUubGVuZ3RoID4gZGVsaW1zLnN0YXJ0Lmxlbmd0aCArIGRlbGltcy5lbmQubGVuZ3RoKSB7XG4gICAgICBjb25zdCBpZGVudGlmaWVyID0gbmFtZS5zdWJzdHJpbmcoZGVsaW1zLnN0YXJ0Lmxlbmd0aCwgbmFtZS5sZW5ndGggLSBkZWxpbXMuZW5kLmxlbmd0aCk7XG4gICAgICBjb25zdCBrZXlTcGFuID0gY3JlYXRlS2V5U3BhbihzcmNTcGFuLCBkZWxpbXMuc3RhcnQsIGlkZW50aWZpZXIpO1xuICAgICAgaWYgKGRlbGltcy5zdGFydCA9PT0gQklORElOR19ERUxJTVMuQkFOQU5BX0JPWC5zdGFydCkge1xuICAgICAgICB0aGlzLmJpbmRpbmdQYXJzZXIucGFyc2VQcm9wZXJ0eUJpbmRpbmcoXG4gICAgICAgICAgICBpZGVudGlmaWVyLCB2YWx1ZSwgZmFsc2UsIHNyY1NwYW4sIGFic29sdXRlT2Zmc2V0LCBhdHRyaWJ1dGUudmFsdWVTcGFuLFxuICAgICAgICAgICAgbWF0Y2hhYmxlQXR0cmlidXRlcywgcGFyc2VkUHJvcGVydGllcywga2V5U3Bhbik7XG4gICAgICAgIHRoaXMucGFyc2VBc3NpZ25tZW50RXZlbnQoXG4gICAgICAgICAgICBpZGVudGlmaWVyLCB2YWx1ZSwgc3JjU3BhbiwgYXR0cmlidXRlLnZhbHVlU3BhbiwgbWF0Y2hhYmxlQXR0cmlidXRlcywgYm91bmRFdmVudHMsXG4gICAgICAgICAgICBrZXlTcGFuKTtcbiAgICAgIH0gZWxzZSBpZiAoZGVsaW1zLnN0YXJ0ID09PSBCSU5ESU5HX0RFTElNUy5QUk9QRVJUWS5zdGFydCkge1xuICAgICAgICB0aGlzLmJpbmRpbmdQYXJzZXIucGFyc2VQcm9wZXJ0eUJpbmRpbmcoXG4gICAgICAgICAgICBpZGVudGlmaWVyLCB2YWx1ZSwgZmFsc2UsIHNyY1NwYW4sIGFic29sdXRlT2Zmc2V0LCBhdHRyaWJ1dGUudmFsdWVTcGFuLFxuICAgICAgICAgICAgbWF0Y2hhYmxlQXR0cmlidXRlcywgcGFyc2VkUHJvcGVydGllcywga2V5U3Bhbik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBldmVudHM6IFBhcnNlZEV2ZW50W10gPSBbXTtcbiAgICAgICAgdGhpcy5iaW5kaW5nUGFyc2VyLnBhcnNlRXZlbnQoXG4gICAgICAgICAgICBpZGVudGlmaWVyLCB2YWx1ZSwgc3JjU3BhbiwgYXR0cmlidXRlLnZhbHVlU3BhbiB8fCBzcmNTcGFuLCBtYXRjaGFibGVBdHRyaWJ1dGVzLCBldmVudHMsXG4gICAgICAgICAgICBrZXlTcGFuKTtcbiAgICAgICAgYWRkRXZlbnRzKGV2ZW50cywgYm91bmRFdmVudHMpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBObyBleHBsaWNpdCBiaW5kaW5nIGZvdW5kLlxuICAgIGNvbnN0IGtleVNwYW4gPSBjcmVhdGVLZXlTcGFuKHNyY1NwYW4sICcnIC8qIHByZWZpeCAqLywgbmFtZSk7XG4gICAgY29uc3QgaGFzQmluZGluZyA9IHRoaXMuYmluZGluZ1BhcnNlci5wYXJzZVByb3BlcnR5SW50ZXJwb2xhdGlvbihcbiAgICAgICAgbmFtZSwgdmFsdWUsIHNyY1NwYW4sIGF0dHJpYnV0ZS52YWx1ZVNwYW4sIG1hdGNoYWJsZUF0dHJpYnV0ZXMsIHBhcnNlZFByb3BlcnRpZXMsIGtleVNwYW4pO1xuICAgIHJldHVybiBoYXNCaW5kaW5nO1xuICB9XG5cbiAgcHJpdmF0ZSBfdmlzaXRUZXh0V2l0aEludGVycG9sYXRpb24oXG4gICAgICB2YWx1ZTogc3RyaW5nLCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sIGkxOG4/OiBpMThuLkkxOG5NZXRhKTogdC5UZXh0fHQuQm91bmRUZXh0IHtcbiAgICBjb25zdCB2YWx1ZU5vTmdzcCA9IHJlcGxhY2VOZ3NwKHZhbHVlKTtcbiAgICBjb25zdCBleHByID0gdGhpcy5iaW5kaW5nUGFyc2VyLnBhcnNlSW50ZXJwb2xhdGlvbih2YWx1ZU5vTmdzcCwgc291cmNlU3Bhbik7XG4gICAgcmV0dXJuIGV4cHIgPyBuZXcgdC5Cb3VuZFRleHQoZXhwciwgc291cmNlU3BhbiwgaTE4bikgOiBuZXcgdC5UZXh0KHZhbHVlTm9OZ3NwLCBzb3VyY2VTcGFuKTtcbiAgfVxuXG4gIHByaXZhdGUgcGFyc2VWYXJpYWJsZShcbiAgICAgIGlkZW50aWZpZXI6IHN0cmluZywgdmFsdWU6IHN0cmluZywgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLCBrZXlTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgICB2YWx1ZVNwYW46IFBhcnNlU291cmNlU3Bhbnx1bmRlZmluZWQsIHZhcmlhYmxlczogdC5WYXJpYWJsZVtdKSB7XG4gICAgaWYgKGlkZW50aWZpZXIuaW5kZXhPZignLScpID4gLTEpIHtcbiAgICAgIHRoaXMucmVwb3J0RXJyb3IoYFwiLVwiIGlzIG5vdCBhbGxvd2VkIGluIHZhcmlhYmxlIG5hbWVzYCwgc291cmNlU3Bhbik7XG4gICAgfSBlbHNlIGlmIChpZGVudGlmaWVyLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhpcy5yZXBvcnRFcnJvcihgVmFyaWFibGUgZG9lcyBub3QgaGF2ZSBhIG5hbWVgLCBzb3VyY2VTcGFuKTtcbiAgICB9XG5cbiAgICB2YXJpYWJsZXMucHVzaChuZXcgdC5WYXJpYWJsZShpZGVudGlmaWVyLCB2YWx1ZSwgc291cmNlU3Bhbiwga2V5U3BhbiwgdmFsdWVTcGFuKSk7XG4gIH1cblxuICBwcml2YXRlIHBhcnNlUmVmZXJlbmNlKFxuICAgICAgaWRlbnRpZmllcjogc3RyaW5nLCB2YWx1ZTogc3RyaW5nLCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sIGtleVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICAgIHZhbHVlU3BhbjogUGFyc2VTb3VyY2VTcGFufHVuZGVmaW5lZCwgcmVmZXJlbmNlczogdC5SZWZlcmVuY2VbXSkge1xuICAgIGlmIChpZGVudGlmaWVyLmluZGV4T2YoJy0nKSA+IC0xKSB7XG4gICAgICB0aGlzLnJlcG9ydEVycm9yKGBcIi1cIiBpcyBub3QgYWxsb3dlZCBpbiByZWZlcmVuY2UgbmFtZXNgLCBzb3VyY2VTcGFuKTtcbiAgICB9IGVsc2UgaWYgKGlkZW50aWZpZXIubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aGlzLnJlcG9ydEVycm9yKGBSZWZlcmVuY2UgZG9lcyBub3QgaGF2ZSBhIG5hbWVgLCBzb3VyY2VTcGFuKTtcbiAgICB9IGVsc2UgaWYgKHJlZmVyZW5jZXMuc29tZShyZWZlcmVuY2UgPT4gcmVmZXJlbmNlLm5hbWUgPT09IGlkZW50aWZpZXIpKSB7XG4gICAgICB0aGlzLnJlcG9ydEVycm9yKGBSZWZlcmVuY2UgXCIjJHtpZGVudGlmaWVyfVwiIGlzIGRlZmluZWQgbW9yZSB0aGFuIG9uY2VgLCBzb3VyY2VTcGFuKTtcbiAgICB9XG5cbiAgICByZWZlcmVuY2VzLnB1c2gobmV3IHQuUmVmZXJlbmNlKGlkZW50aWZpZXIsIHZhbHVlLCBzb3VyY2VTcGFuLCBrZXlTcGFuLCB2YWx1ZVNwYW4pKTtcbiAgfVxuXG4gIHByaXZhdGUgcGFyc2VBc3NpZ25tZW50RXZlbnQoXG4gICAgICBuYW1lOiBzdHJpbmcsIGV4cHJlc3Npb246IHN0cmluZywgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgICAgdmFsdWVTcGFuOiBQYXJzZVNvdXJjZVNwYW58dW5kZWZpbmVkLCB0YXJnZXRNYXRjaGFibGVBdHRyczogc3RyaW5nW11bXSxcbiAgICAgIGJvdW5kRXZlbnRzOiB0LkJvdW5kRXZlbnRbXSwga2V5U3BhbjogUGFyc2VTb3VyY2VTcGFuKSB7XG4gICAgY29uc3QgZXZlbnRzOiBQYXJzZWRFdmVudFtdID0gW107XG4gICAgdGhpcy5iaW5kaW5nUGFyc2VyLnBhcnNlRXZlbnQoXG4gICAgICAgIGAke25hbWV9Q2hhbmdlYCwgYCR7ZXhwcmVzc2lvbn09JGV2ZW50YCwgc291cmNlU3BhbiwgdmFsdWVTcGFuIHx8IHNvdXJjZVNwYW4sXG4gICAgICAgIHRhcmdldE1hdGNoYWJsZUF0dHJzLCBldmVudHMsIGtleVNwYW4pO1xuICAgIGFkZEV2ZW50cyhldmVudHMsIGJvdW5kRXZlbnRzKTtcbiAgfVxuXG4gIHByaXZhdGUgcmVwb3J0RXJyb3IoXG4gICAgICBtZXNzYWdlOiBzdHJpbmcsIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICAgIGxldmVsOiBQYXJzZUVycm9yTGV2ZWwgPSBQYXJzZUVycm9yTGV2ZWwuRVJST1IpIHtcbiAgICB0aGlzLmVycm9ycy5wdXNoKG5ldyBQYXJzZUVycm9yKHNvdXJjZVNwYW4sIG1lc3NhZ2UsIGxldmVsKSk7XG4gIH1cbn1cblxuY2xhc3MgTm9uQmluZGFibGVWaXNpdG9yIGltcGxlbWVudHMgaHRtbC5WaXNpdG9yIHtcbiAgdmlzaXRFbGVtZW50KGFzdDogaHRtbC5FbGVtZW50KTogdC5FbGVtZW50fG51bGwge1xuICAgIGNvbnN0IHByZXBhcnNlZEVsZW1lbnQgPSBwcmVwYXJzZUVsZW1lbnQoYXN0KTtcbiAgICBpZiAocHJlcGFyc2VkRWxlbWVudC50eXBlID09PSBQcmVwYXJzZWRFbGVtZW50VHlwZS5TQ1JJUFQgfHxcbiAgICAgICAgcHJlcGFyc2VkRWxlbWVudC50eXBlID09PSBQcmVwYXJzZWRFbGVtZW50VHlwZS5TVFlMRSB8fFxuICAgICAgICBwcmVwYXJzZWRFbGVtZW50LnR5cGUgPT09IFByZXBhcnNlZEVsZW1lbnRUeXBlLlNUWUxFU0hFRVQpIHtcbiAgICAgIC8vIFNraXBwaW5nIDxzY3JpcHQ+IGZvciBzZWN1cml0eSByZWFzb25zXG4gICAgICAvLyBTa2lwcGluZyA8c3R5bGU+IGFuZCBzdHlsZXNoZWV0cyBhcyB3ZSBhbHJlYWR5IHByb2Nlc3NlZCB0aGVtXG4gICAgICAvLyBpbiB0aGUgU3R5bGVDb21waWxlclxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgY2hpbGRyZW46IHQuTm9kZVtdID0gaHRtbC52aXNpdEFsbCh0aGlzLCBhc3QuY2hpbGRyZW4sIG51bGwpO1xuICAgIHJldHVybiBuZXcgdC5FbGVtZW50KFxuICAgICAgICBhc3QubmFtZSwgaHRtbC52aXNpdEFsbCh0aGlzLCBhc3QuYXR0cnMpIGFzIHQuVGV4dEF0dHJpYnV0ZVtdLFxuICAgICAgICAvKiBpbnB1dHMgKi9bXSwgLyogb3V0cHV0cyAqL1tdLCBjaGlsZHJlbizCoCAvKiByZWZlcmVuY2VzICovW10sIGFzdC5zb3VyY2VTcGFuLFxuICAgICAgICBhc3Quc3RhcnRTb3VyY2VTcGFuLCBhc3QuZW5kU291cmNlU3Bhbik7XG4gIH1cblxuICB2aXNpdENvbW1lbnQoY29tbWVudDogaHRtbC5Db21tZW50KTogYW55IHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHZpc2l0QXR0cmlidXRlKGF0dHJpYnV0ZTogaHRtbC5BdHRyaWJ1dGUpOiB0LlRleHRBdHRyaWJ1dGUge1xuICAgIHJldHVybiBuZXcgdC5UZXh0QXR0cmlidXRlKFxuICAgICAgICBhdHRyaWJ1dGUubmFtZSwgYXR0cmlidXRlLnZhbHVlLCBhdHRyaWJ1dGUuc291cmNlU3BhbiwgYXR0cmlidXRlLmtleVNwYW4sXG4gICAgICAgIGF0dHJpYnV0ZS52YWx1ZVNwYW4sIGF0dHJpYnV0ZS5pMThuKTtcbiAgfVxuXG4gIHZpc2l0VGV4dCh0ZXh0OiBodG1sLlRleHQpOiB0LlRleHQge1xuICAgIHJldHVybiBuZXcgdC5UZXh0KHRleHQudmFsdWUsIHRleHQuc291cmNlU3Bhbik7XG4gIH1cblxuICB2aXNpdEV4cGFuc2lvbihleHBhbnNpb246IGh0bWwuRXhwYW5zaW9uKTogYW55IHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHZpc2l0RXhwYW5zaW9uQ2FzZShleHBhbnNpb25DYXNlOiBodG1sLkV4cGFuc2lvbkNhc2UpOiBhbnkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbmNvbnN0IE5PTl9CSU5EQUJMRV9WSVNJVE9SID0gbmV3IE5vbkJpbmRhYmxlVmlzaXRvcigpO1xuXG5mdW5jdGlvbiBub3JtYWxpemVBdHRyaWJ1dGVOYW1lKGF0dHJOYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gL15kYXRhLS9pLnRlc3QoYXR0ck5hbWUpID8gYXR0ck5hbWUuc3Vic3RyaW5nKDUpIDogYXR0ck5hbWU7XG59XG5cbmZ1bmN0aW9uIGFkZEV2ZW50cyhldmVudHM6IFBhcnNlZEV2ZW50W10sIGJvdW5kRXZlbnRzOiB0LkJvdW5kRXZlbnRbXSkge1xuICBib3VuZEV2ZW50cy5wdXNoKC4uLmV2ZW50cy5tYXAoZSA9PiB0LkJvdW5kRXZlbnQuZnJvbVBhcnNlZEV2ZW50KGUpKSk7XG59XG5cbmZ1bmN0aW9uIGlzRW1wdHlUZXh0Tm9kZShub2RlOiBodG1sLk5vZGUpOiBib29sZWFuIHtcbiAgcmV0dXJuIG5vZGUgaW5zdGFuY2VvZiBodG1sLlRleHQgJiYgbm9kZS52YWx1ZS50cmltKCkubGVuZ3RoID09IDA7XG59XG5cbmZ1bmN0aW9uIGlzQ29tbWVudE5vZGUobm9kZTogaHRtbC5Ob2RlKTogYm9vbGVhbiB7XG4gIHJldHVybiBub2RlIGluc3RhbmNlb2YgaHRtbC5Db21tZW50O1xufVxuXG5mdW5jdGlvbiB0ZXh0Q29udGVudHMobm9kZTogaHRtbC5FbGVtZW50KTogc3RyaW5nfG51bGwge1xuICBpZiAobm9kZS5jaGlsZHJlbi5sZW5ndGggIT09IDEgfHwgIShub2RlLmNoaWxkcmVuWzBdIGluc3RhbmNlb2YgaHRtbC5UZXh0KSkge1xuICAgIHJldHVybiBudWxsO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiAobm9kZS5jaGlsZHJlblswXSBhcyBodG1sLlRleHQpLnZhbHVlO1xuICB9XG59XG4iXX0=